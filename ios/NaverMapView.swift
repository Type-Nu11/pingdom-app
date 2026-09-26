import UIKit
import NMapsMap
import React

private struct NaverPlaceMarker: Equatable {
    let id: String
    let category: String
    let lat: Double
    let lng: Double
}

@objc(NaverMapView)
final class NaverMapView: UIView, NMFMapViewCameraDelegate, NMFMapViewTouchDelegate {
    // pod install 시 .env의 NAVER_MAP_CLIENT_ID → NaverMap.generated.xcconfig를 생성한다.
    // Debug/Release 설정을 거쳐 Info.plist의 NMFNcpKeyId로 들어가며 SDK가 이 값으로 인증한다.
    // iOS Bundle ID는 네이버 클라우드 Maps 앱에 등록해야 한다. Client Secret은 사용하지 않는다.
    private let mapView = NMFMapView(frame: .zero)
    private var placeData: [NaverPlaceMarker] = []
    private var placeMarkers: [String: NMFMarker] = [:]
    private var icons: [String: NMFOverlayImage] = [:]
    private let userMarker = NMFMarker()
    private var markersDirty = true
    private var lastCamera: (lat: Double, lng: Double, zoom: Double)?
    private var lastFollowUser = false
    private var appliedNightMode: Bool?

    @objc var centerLat: NSNumber?
    @objc var centerLng: NSNumber?
    @objc var zoomLevel: NSNumber?
    @objc var userLat: NSNumber?
    @objc var userLng: NSNumber?
    @objc var followUser = true
    @objc var nightMode = false
    @objc var markers: NSArray? {
        didSet {
            let next = parseMarkers(markers)
            if next != placeData { placeData = next; markersDirty = true }
        }
    }
    @objc var onCameraIdle: RCTDirectEventBlock?
    @objc var onMarkerPress: RCTDirectEventBlock?

    override init(frame: CGRect) {
        super.init(frame: frame)
        addSubview(mapView)
        mapView.addCameraDelegate(delegate: self)
        mapView.touchDelegate = self
        // 로고는 숨기거나 다른 UI로 가리지 않고, 검색/카테고리 아래로 위치와 여백만 조정한다.
        // https://navermaps.github.io/ios-map-sdk/guide-ko/4-1.html
        mapView.logoAlign = .leftTop
        mapView.logoMargin = UIEdgeInsets(top: 160, left: 16, bottom: 0, right: 0)
        userMarker.iconImage = NMFOverlayImage(image: makeUserLocationImage())
        userMarker.anchor = CGPoint(x: 0.5, y: 0.72)
        userMarker.zIndex = 20
        userMarker.isForceShowIcon = true
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func layoutSubviews() {
        super.layoutSubviews()
        mapView.frame = bounds
    }

    // .m에 공개한 props를 RN이 모두 설정한 뒤 마커와 카메라를 한 번에 갱신한다.
    // 위도만 바뀐 중간 좌표로 이동하는 것을 막으며, 이후 SDK 이벤트는 RCTDirectEventBlock으로 JS에 전달한다.
    override func didSetProps(_ changedProps: [String]!) {
        super.didSetProps(changedProps)
        applyProps()
    }

    func mapViewCameraIdle(_ mapView: NMFMapView) {
        let target = mapView.cameraPosition.target
        onCameraIdle?(["lat": target.lat, "lng": target.lng])
    }

    func mapView(_ mapView: NMFMapView, didTapMap latlng: NMGLatLng, point: CGPoint) {
        // Use screen distance so the touch target stays the same size at every zoom level.
        let nearest = placeData.map { marker -> (String, CGFloat) in
            let screen = mapView.projection.point(from: NMGLatLng(lat: marker.lat, lng: marker.lng))
            let dx = screen.x - point.x
            let dy = screen.y - point.y
            return (marker.id, dx * dx + dy * dy)
        }.filter { $0.1 <= 54 * 54 }.min { $0.1 < $1.1 }
        if let nearest { onMarkerPress?(["markerId": nearest.0]) }
    }

    private func applyProps() {
        if appliedNightMode != nightMode {
            // 네이버 SDK 야간 모드는 Navi 유형에서 지원한다. 라이트 모드에서는 Basic으로 복원한다.
            // 같은 지도 뷰에서 스타일만 변경하여 카메라와 마커 선택 상태를 유지한다.
            mapView.mapType = nightMode ? .navi : .basic
            mapView.isNightModeEnabled = nightMode
            appliedNightMode = nightMode
        }
        if markersDirty {
            let ids = Set(placeData.map { $0.id })
            for id in Array(placeMarkers.keys) where !ids.contains(id) {
                let marker = placeMarkers.removeValue(forKey: id)
                marker?.touchHandler = nil
                marker?.mapView = nil
            }
            for data in placeData {
                let marker = placeMarkers[data.id] ?? NMFMarker()
                marker.position = NMGLatLng(lat: data.lat, lng: data.lng)
                marker.iconImage = placeIcon(data.category)
                marker.anchor = CGPoint(x: 0.5, y: 0.62)
                marker.isHideCollidedMarkers = false
                marker.isHideCollidedSymbols = false
                marker.isForceShowIcon = true
                marker.zIndex = 10
                marker.touchHandler = { [weak self] _ in
                    self?.onMarkerPress?(["markerId": data.id])
                    return true
                }
                marker.mapView = mapView
                placeMarkers[data.id] = marker
            }
            markersDirty = false
        }
        let userLat = userLat?.doubleValue
        let userLng = userLng?.doubleValue
        let validUser = validCoordinate(userLat, userLng)
        if validUser, let lat = userLat, let lng = userLng {
            userMarker.position = NMGLatLng(lat: lat, lng: lng)
            userMarker.mapView = mapView
        } else {
            userMarker.mapView = nil
        }
        let lat = followUser && validUser ? userLat : centerLat?.doubleValue
        let lng = followUser && validUser ? userLng : centerLng?.doubleValue
        let zoom = min(21, max(0, zoomLevel?.doubleValue ?? 17))
        if validCoordinate(lat, lng), let lat, let lng {
            let changed = lastCamera.map { $0.lat != lat || $0.lng != lng || $0.zoom != zoom } ?? true
            if changed || (followUser && !lastFollowUser) {
                let update = NMFCameraUpdate(scrollTo: NMGLatLng(lat: lat, lng: lng), zoomTo: zoom)
                if lastCamera != nil { update.animation = .easeIn; update.animationDuration = 0.3 }
                mapView.moveCamera(update)
                lastCamera = (lat, lng, zoom)
            }
        }
        lastFollowUser = followUser
    }

    private func validCoordinate(_ lat: Double?, _ lng: Double?) -> Bool {
        guard let lat, let lng else { return false }
        return lat.isFinite && lng.isFinite && (-90...90).contains(lat) && (-180...180).contains(lng)
    }

    private func parseMarkers(_ value: NSArray?) -> [NaverPlaceMarker] {
        (value ?? []).enumerated().compactMap { index, raw in
            guard let item = raw as? NSDictionary,
                  let lat = item["lat"] as? Double, let lng = item["lng"] as? Double,
                  validCoordinate(lat, lng) else { return nil }
            let category = item["category"] as? String ?? "etc"
            let categories = ["art", "beauty", "cafe", "etc", "fashion", "food", "game", "heritage", "music", "popup"]
            return NaverPlaceMarker(id: item["id"] as? String ?? "marker-\(index)",
                                    category: categories.contains(category) ? category : "etc", lat: lat, lng: lng)
        }
    }

    private func placeIcon(_ category: String) -> NMFOverlayImage {
        if let cached = icons[category] { return cached }
        let image = UIImage(named: "map_marker_default_\(category)")
            ?? UIImage(named: "map_marker_default_etc")!
        let icon = NMFOverlayImage(image: image)
        icons[category] = icon
        return icon
    }

    deinit {
        mapView.removeCameraDelegate(delegate: self)
        placeMarkers.values.forEach { $0.touchHandler = nil; $0.mapView = nil }
        userMarker.mapView = nil
    }
    private func makeUserLocationImage() -> UIImage {
        let size = CGSize(width: 30, height: 40)
        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { context in
            let cgContext = context.cgContext
            let pink = UIColor(red: 1.0, green: 0.098, blue: 0.337, alpha: 1.0)
            let white = UIColor.white
            let centerX = size.width / 2
            let circleCenter = CGPoint(x: centerX, y: 27)

            let arrowPath = UIBezierPath()
            arrowPath.move(to: CGPoint(x: centerX, y: 3))
            arrowPath.addLine(to: CGPoint(x: centerX - 9.5, y: 16.5))
            arrowPath.addLine(to: CGPoint(x: centerX + 9.5, y: 16.5))
            arrowPath.close()

            white.setStroke()
            pink.setFill()
            arrowPath.lineWidth = 2.5
            arrowPath.lineJoinStyle = .round
            arrowPath.stroke()
            arrowPath.fill()

            cgContext.saveGState()
            cgContext.setShadow(offset: CGSize(width: 0, height: 2), blur: 6, color: UIColor.black.withAlphaComponent(0.16).cgColor)
            white.setFill()
            UIBezierPath(
                ovalIn: CGRect(
                    x: circleCenter.x - 13,
                    y: circleCenter.y - 13,
                    width: 26,
                    height: 26
                )
            ).fill()
            cgContext.restoreGState()

            pink.setFill()
            UIBezierPath(
                ovalIn: CGRect(
                    x: circleCenter.x - 10.5,
                    y: circleCenter.y - 10.5,
                    width: 21,
                    height: 21
                )
            ).fill()
        }
    }
}
