import UIKit
import KakaoMapsSDK

@objc(KakaoMapView)
final class KakaoMapView: UIView, MapControllerDelegate {
    private enum MarkerConfig {
        static let layerID = "pingdom_markers"
        static let styleID = "pingdom_marker_style"
    }

    private let container = KMViewContainer()
    private var controller: KMController?
    private var observersAdded = false
    private var didAddMap = false
    private var requestedAddMap = false
    private var canAddMapView = false
    private var lastApplied: (lat: Double, lng: Double, zoom: Int)?
    private var didRegisterMarkerStyle = false

    @objc var centerLat: NSNumber? {
        didSet {
            tryAddMapViewIfPossible()
            applyCameraIfNeeded()
        }
    }

    @objc var centerLng: NSNumber? {
        didSet {
            tryAddMapViewIfPossible()
            applyCameraIfNeeded()
        }
    }

    @objc var zoomLevel: NSNumber? {
        didSet {
            applyCameraIfNeeded()
        }
    }

    @objc var markers: NSArray? {
        didSet {
            applyMarkersIfNeeded()
        }
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        addSubview(container)
        controller = KMController(viewContainer: container)
        controller?.delegate = self
        controller?.prepareEngine()
        addObservers()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        container.frame = bounds

        if let mapView = controller?.getView("mapview") as? KakaoMap {
            mapView.viewRect = bounds
        }
    }

    deinit {
        removeObservers()
        controller?.pauseEngine()
        controller?.resetEngine()
    }

    @objc private func didBecomeActive() {
        controller?.activateEngine()
    }

    @objc private func willResignActive() {
        controller?.pauseEngine()
    }

    private func addObservers() {
        guard !observersAdded else { return }
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(didBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(willResignActive),
            name: UIApplication.willResignActiveNotification,
            object: nil
        )
        observersAdded = true
    }

    private func removeObservers() {
        guard observersAdded else { return }
        NotificationCenter.default.removeObserver(self)
        observersAdded = false
    }

    // MARK: - MapControllerDelegate

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
        applyCameraIfNeeded()
        applyMarkersIfNeeded()
        print("Kakao map added: \(viewName), \(viewInfoName)")
    }

    func addViewFailed(_ viewName: String, viewInfoName: String) {
        requestedAddMap = false
        print("Kakao map failed: \(viewName), \(viewInfoName)")
    }

    func authenticationSucceeded() {
        controller?.activateEngine()
    }

    func authenticationFailed(_ errorCode: Int, desc: String) {
        print("Kakao auth failed: \(errorCode), \(desc)")
    }

    func containerDidResized(_ size: CGSize) {
        if let mapView = controller?.getView("mapview") as? KakaoMap {
            mapView.viewRect = CGRect(origin: .zero, size: size)
        }
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

    private func applyMarkersIfNeeded() {
        guard didAddMap else { return }
        guard let mapView = controller?.getView("mapview") as? KakaoMap else { return }

        let manager = mapView.getLabelManager()
        registerMarkerStyleIfNeeded(manager: manager)

        let layer = manager.getLabelLayer(layerID: MarkerConfig.layerID) ?? manager.addLabelLayer(
            option: LabelLayerOptions(
                layerID: MarkerConfig.layerID,
                competitionType: CompetitionType(rawValue: 0)!,
                competitionUnit: CompetitionUnit(rawValue: 0)!,
                orderType: OrderingType(rawValue: 0)!,
                zOrder: 10
            )
        )

        guard let layer else { return }
        layer.clearAllItems()

        guard let markers else { return }

        for case let marker as NSDictionary in markers {
            guard
                let lat = marker["lat"] as? Double,
                let lng = marker["lng"] as? Double
            else {
                continue
            }

            let id = marker["id"] as? String ?? UUID().uuidString
            let options = PoiOptions(styleID: MarkerConfig.styleID, poiID: id)
            layer.addPoi(
                option: options,
                at: MapPoint(longitude: lng, latitude: lat)
            )
        }
    }

    private func registerMarkerStyleIfNeeded(manager: LabelManager) {
        guard !didRegisterMarkerStyle else { return }

        let transition = PoiTransition(
            entrance: TransitionType(rawValue: 0)!,
            exit: TransitionType(rawValue: 0)!
        )
        let iconStyle = PoiIconStyle(
            symbol: makeMarkerImage(),
            anchorPoint: CGPoint(x: 0.5, y: 1.0),
            transition: transition,
            enableEntranceTransition: false,
            enableExitTransition: false,
            badges: nil
        )
        let perLevelStyle = PerLevelPoiStyle(iconStyle: iconStyle, padding: 0, level: 0)
        let style = PoiStyle(styleID: MarkerConfig.styleID, styles: [perLevelStyle])

        manager.addPoiStyle(style)
        didRegisterMarkerStyle = true
    }

    private func makeMarkerImage() -> UIImage {
        let size = CGSize(width: 44, height: 56)
        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { context in
            let cgContext = context.cgContext
            let pink = UIColor(red: 1.0, green: 0.290, blue: 0.459, alpha: 1.0)
            let white = UIColor.white
            let center = CGPoint(x: size.width / 2, y: 21)

            let tipPath = UIBezierPath()
            tipPath.move(to: CGPoint(x: center.x, y: 48))
            tipPath.addLine(to: CGPoint(x: center.x - 10, y: 34))
            tipPath.addLine(to: CGPoint(x: center.x + 10, y: 34))
            tipPath.close()

            pink.setFill()
            white.setStroke()
            tipPath.lineWidth = 2.5
            tipPath.fill()
            tipPath.stroke()

            let circleRect = CGRect(x: center.x - 17, y: center.y - 17, width: 34, height: 34)
            let circlePath = UIBezierPath(ovalIn: circleRect)
            circlePath.lineWidth = 2.5
            circlePath.fill()
            circlePath.stroke()

            let note = "♪" as NSString
            let attributes: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 25),
                .foregroundColor: white,
            ]
            let noteSize = note.size(withAttributes: attributes)
            let noteRect = CGRect(
                x: center.x - noteSize.width / 2,
                y: center.y - noteSize.height / 2 - 1,
                width: noteSize.width,
                height: noteSize.height
            )

            cgContext.saveGState()
            note.draw(in: noteRect, withAttributes: attributes)
            cgContext.restoreGState()
        }
    }
}
