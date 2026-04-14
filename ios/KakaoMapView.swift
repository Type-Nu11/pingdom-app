import UIKit
import KakaoMapsSDK

@objc(KakaoMapView)
final class KakaoMapView: UIView, MapControllerDelegate {
    private let container = KMViewContainer()
    private var controller: KMController?
    private var didAddMap = false
    private var requestedAddMap = false
    private var canAddMapView = false

    // 마지막 적용값(중복 move 방지)
    private var lastApplied: (lat: Double, lng: Double, zoom: Int)?

    @objc var centerLat: NSNumber? { didSet { tryAddMapViewIfPossible(); applyCameraIfNeeded() } }
    @objc var centerLng: NSNumber? { didSet { tryAddMapViewIfPossible(); applyCameraIfNeeded() } }
    @objc var zoomLevel: NSNumber? { didSet { applyCameraIfNeeded() } }

    // ... setup/lifecycle 기존 코드 그대로 ...

    @objc func addViews() {
        canAddMapView = true
        tryAddMapViewIfPossible()
    }

    private func tryAddMapViewIfPossible() {
        guard canAddMapView, !didAddMap, !requestedAddMap else { return }
        guard let lat = centerLat?.doubleValue, let lng = centerLng?.doubleValue else { return }

        let info = MapviewInfo(
            viewName: "mapview",
            viewInfoName: "map",
            defaultPosition: MapPoint(longitude: lng, latitude: lat),
            defaultLevel: zoomLevel?.intValue ?? 7
        )

        controller?.addView(info)
        requestedAddMap = true
    }

    func addViewSucceeded(_ viewName: String, viewInfoName: String) {
        didAddMap = true
        requestedAddMap = false
        applyCameraIfNeeded() // 생성 직후 최신 props 반영
    }

    func addViewFailed(_ viewName: String, viewInfoName: String) {
        requestedAddMap = false
    }

    private func applyCameraIfNeeded() {
        guard didAddMap else { return }
        guard let mapView = controller?.getView("mapview") as? KakaoMap else { return }
        guard let lat = centerLat?.doubleValue, let lng = centerLng?.doubleValue else { return }

        let zoom = zoomLevel?.intValue ?? 7
        if let last = lastApplied,
            abs(last.lat - lat) < 0.0000001,
            abs(last.lng - lng) < 0.0000001,
            last.zoom == zoom {
            return
        }

        let update = CameraUpdate.make(
            target: MapPoint(longitude: lng, latitude: lat),
            zoomLevel: zoom,
            mapView: mapView
        )
        mapView.moveCamera(update)
        lastApplied = (lat, lng, zoom)
    }
}
