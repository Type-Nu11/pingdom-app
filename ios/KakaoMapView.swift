import UIKit
import KakaoMapsSDK

private struct MapMarker {
    let id: String
    let category: String
    let lat: Double
    let lng: Double
    let markerType: String
}

@objc(KakaoMapView)
final class KakaoMapView: UIView, MapControllerDelegate {
    private enum MarkerConfig {
        static let layerID = "pingdom_markers"
        static let styleIDPrefix = "pingdom_hot_marker_style"
        static let userLocationLayerID = "pingdom_user_location"
        static let userLocationStyleID = "pingdom_user_location_style"
        static let userLocationPoiID = "pingdom_user_location_poi"
        static let markerLayerZOrder = 10
        static let userLocationLayerZOrder = 20
    }

    private let container = KMViewContainer()
    private var controller: KMController?
    private var observersAdded = false
    private var didAddMap = false
    private var requestedAddMap = false
    private var canAddMapView = false
    private var lastApplied: (lat: Double, lng: Double, zoom: Int)?
    private var registeredMarkerStyleIDs = Set<String>()
    private var didRegisterUserLocationStyle = false

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

    @objc var userLat: NSNumber? {
        didSet {
            applyUserLocationIfNeeded()
        }
    }

    @objc var userLng: NSNumber? {
        didSet {
            applyUserLocationIfNeeded()
        }
    }

    @objc var followUser = true {
        didSet {
            applyUserLocationIfNeeded()
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
        applyUserLocationIfNeeded()
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
        let layer = markerLayer(manager: manager)
        guard let layer else { return }

        layer.clearAllItems()
        addPlaceMarkers(to: layer, manager: manager)
    }

    private func applyUserLocationIfNeeded() {
        guard didAddMap else { return }
        guard let mapView = controller?.getView("mapview") as? KakaoMap else { return }
        guard let lat = userLat?.doubleValue, let lng = userLng?.doubleValue else { return }

        let manager = mapView.getLabelManager()
        registerUserLocationStyleIfNeeded(manager: manager)
        let layer = userLocationLayer(manager: manager)
        guard let layer else { return }

        layer.clearAllItems()
        addUserLocationMarker(to: layer, lat: lat, lng: lng)

        moveCameraToUserLocationIfNeeded(mapView: mapView, lat: lat, lng: lng)
    }

    private func markerLayer(manager: LabelManager) -> LabelLayer? {
        return manager.getLabelLayer(layerID: MarkerConfig.layerID) ?? manager.addLabelLayer(
            option: LabelLayerOptions(
                layerID: MarkerConfig.layerID,
                competitionType: CompetitionType(rawValue: 0)!,
                competitionUnit: CompetitionUnit(rawValue: 0)!,
                orderType: OrderingType(rawValue: 0)!,
                zOrder: MarkerConfig.markerLayerZOrder
            )
        )
    }

    private func userLocationLayer(manager: LabelManager) -> LabelLayer? {
        return manager.getLabelLayer(layerID: MarkerConfig.userLocationLayerID) ?? manager.addLabelLayer(
            option: LabelLayerOptions(
                layerID: MarkerConfig.userLocationLayerID,
                competitionType: CompetitionType(rawValue: 0)!,
                competitionUnit: CompetitionUnit(rawValue: 0)!,
                orderType: OrderingType(rawValue: 0)!,
                zOrder: MarkerConfig.userLocationLayerZOrder
            )
        )
    }

    private func parsedMarkers() -> [MapMarker] {
        guard let markers else { return [] }

        return markers.compactMap { item in
            guard
                let marker = item as? NSDictionary,
                let lat = marker["lat"] as? Double,
                let lng = marker["lng"] as? Double
            else {
                return nil
            }

            return MapMarker(
                id: marker["id"] as? String ?? UUID().uuidString,
                category: normalizeMarkerCategory(marker["category"] as? String),
                lat: lat,
                lng: lng,
                markerType: normalizeMarkerType(marker["markerType"] as? String)
            )
        }
    }

    private func addPlaceMarkers(to layer: LabelLayer, manager: LabelManager) {
        for marker in parsedMarkers() {
            let styleID = markerStyleID(category: marker.category, markerType: marker.markerType)
            registerMarkerStyleIfNeeded(manager: manager, category: marker.category, markerType: marker.markerType)
            let options = PoiOptions(styleID: styleID, poiID: marker.id)
            layer.addPoi(
                option: options,
                at: MapPoint(longitude: marker.lng, latitude: marker.lat)
            )
        }
    }

    private func addUserLocationMarker(to layer: LabelLayer, lat: Double, lng: Double) {
        let options = PoiOptions(styleID: MarkerConfig.userLocationStyleID, poiID: MarkerConfig.userLocationPoiID)
        layer.addPoi(
            option: options,
            at: MapPoint(longitude: lng, latitude: lat)
        )
    }

    private func moveCameraToUserLocationIfNeeded(mapView: KakaoMap, lat: Double, lng: Double) {
        guard followUser else { return }

        let update = CameraUpdate.make(
            target: MapPoint(longitude: lng, latitude: lat),
            zoomLevel: zoomLevel?.intValue ?? 7,
            mapView: mapView
        )
        mapView.moveCamera(update)
    }

    private func registerMarkerStyleIfNeeded(manager: LabelManager, category: String, markerType: String) {
        let styleID = markerStyleID(category: category, markerType: markerType)
        guard !registeredMarkerStyleIDs.contains(styleID) else { return }

        manager.addPoiStyle(
            makePoiStyle(
                styleID: styleID,
                image: makePlaceMarkerImage(category: category, markerType: markerType),
                anchorPoint: CGPoint(x: 0.5, y: 0.62)
            )
        )
        registeredMarkerStyleIDs.insert(styleID)
    }

    private func markerStyleID(category: String, markerType: String) -> String {
        return "\(MarkerConfig.styleIDPrefix)_\(markerType)_\(category)"
    }

    private func normalizeMarkerCategory(_ value: String?) -> String {
        switch value {
        case "fashion", "food", "game", "music":
            return value ?? "music"
        default:
            return "music"
        }
    }

    private func normalizeMarkerType(_ value: String?) -> String {
        switch value {
        case "default", "hot":
            return value ?? "default"
        default:
            return "default"
        }
    }

    private func registerUserLocationStyleIfNeeded(manager: LabelManager) {
        guard !didRegisterUserLocationStyle else { return }

        manager.addPoiStyle(
            makePoiStyle(
                styleID: MarkerConfig.userLocationStyleID,
                image: makeUserLocationImage(),
                anchorPoint: CGPoint(x: 0.5, y: 0.72)
            )
        )
        didRegisterUserLocationStyle = true
    }

    private func makePoiStyle(styleID: String, image: UIImage, anchorPoint: CGPoint) -> PoiStyle {
        let iconStyle = PoiIconStyle(
            symbol: image,
            anchorPoint: anchorPoint,
            transition: makePoiTransition(),
            enableEntranceTransition: false,
            enableExitTransition: false,
            badges: nil
        )
        let perLevelStyle = PerLevelPoiStyle(iconStyle: iconStyle, padding: 0, level: 0)

        return PoiStyle(styleID: styleID, styles: [perLevelStyle])
    }

    private func makePoiTransition() -> PoiTransition {
        return PoiTransition(
            entrance: TransitionType(rawValue: 0)!,
            exit: TransitionType(rawValue: 0)!
        )
    }

    private func makePlaceMarkerImage(category: String, markerType: String) -> UIImage {
        if let image = UIImage(named: markerImageName(category: category, markerType: markerType)) {
            return image
        }

        if markerType == "hot" {
            return makeHotMarkerImage(category: category)
        }

        return makeDefaultMarkerImage(category: category)
    }

    private func markerImageName(category: String, markerType: String) -> String {
        return "map_marker_\(markerType)_\(category)"
    }

    private func makeDefaultMarkerImage(category: String) -> UIImage {
        let size = CGSize(width: 32, height: 37)
        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { context in
            let cgContext = context.cgContext
            let pink = UIColor(red: 1.0, green: 0.290, blue: 0.459, alpha: 1.0)
            let stroke = UIColor(red: 0.965, green: 0.965, blue: 0.969, alpha: 1.0)
            let markerPath = makeDefaultMarkerPath()

            pink.setFill()
            markerPath.fill()
            stroke.setStroke()
            markerPath.lineWidth = 2
            markerPath.lineJoinStyle = .round
            markerPath.stroke()

            cgContext.saveGState()
            cgContext.translateBy(x: 16, y: 15.5)
            cgContext.scaleBy(x: 0.66, y: 0.66)
            drawPlaceMarkerIcon(category: category)
            cgContext.restoreGState()
        }
    }

    private func makeDefaultMarkerPath() -> UIBezierPath {
        let path = UIBezierPath()
        path.move(to: CGPoint(x: 5.3937, y: 5.3278))
        path.addCurve(to: CGPoint(x: 16.0002, y: 1), controlPoint1: CGPoint(x: 8.2067, y: 2.5567), controlPoint2: CGPoint(x: 12.022, y: 1))
        path.addCurve(to: CGPoint(x: 26.6066, y: 5.3278), controlPoint1: CGPoint(x: 19.9784, y: 1), controlPoint2: CGPoint(x: 23.7936, y: 2.5567))
        path.addCurve(to: CGPoint(x: 31, y: 15.7759), controlPoint1: CGPoint(x: 29.4197, y: 8.0988), controlPoint2: CGPoint(x: 31, y: 11.8571))
        path.addCurve(to: CGPoint(x: 26.6066, y: 26.224), controlPoint1: CGPoint(x: 31, y: 19.6947), controlPoint2: CGPoint(x: 29.4197, y: 23.453))
        path.addLine(to: CGPoint(x: 16.0002, y: 35))
        path.addLine(to: CGPoint(x: 5.3937, y: 26.224))
        path.addCurve(to: CGPoint(x: 2.1419, y: 21.4304), controlPoint1: CGPoint(x: 4.0007, y: 24.852), controlPoint2: CGPoint(x: 2.8958, y: 23.2231))
        path.addCurve(to: CGPoint(x: 1, y: 15.7759), controlPoint1: CGPoint(x: 1.388, y: 19.6377), controlPoint2: CGPoint(x: 1, y: 17.7163))
        path.addCurve(to: CGPoint(x: 2.1419, y: 10.1213), controlPoint1: CGPoint(x: 1, y: 13.8355), controlPoint2: CGPoint(x: 1.388, y: 11.914))
        path.addCurve(to: CGPoint(x: 5.3937, y: 5.3278), controlPoint1: CGPoint(x: 2.8958, y: 8.3286), controlPoint2: CGPoint(x: 4.0007, y: 6.6998))
        path.close()

        return path
    }

    private func makeHotMarkerImage(category: String) -> UIImage {
        let size = CGSize(width: 59, height: 81)
        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { context in
            let cgContext = context.cgContext
            let pink = UIColor(red: 1.0, green: 0.098, blue: 0.337, alpha: 1.0)
            let stroke = UIColor(red: 0.965, green: 0.965, blue: 0.969, alpha: 1.0)
            let markerPath = makeHotMarkerPath()

            [
                (offsetY: CGFloat(1), alpha: CGFloat(0.10)),
                (offsetY: CGFloat(6), alpha: CGFloat(0.09)),
                (offsetY: CGFloat(12), alpha: CGFloat(0.05)),
                (offsetY: CGFloat(22), alpha: CGFloat(0.01)),
            ].forEach { shadow in
                cgContext.saveGState()
                cgContext.translateBy(x: 0, y: shadow.offsetY)
                pink.withAlphaComponent(shadow.alpha).setFill()
                markerPath.fill()
                cgContext.restoreGState()
            }

            pink.setFill()
            markerPath.fill()
            stroke.setStroke()
            markerPath.lineWidth = 2
            markerPath.lineJoinStyle = .round
            markerPath.lineCapStyle = .round
            markerPath.stroke()

            cgContext.saveGState()
            cgContext.translateBy(x: 29.5, y: 28)
            cgContext.scaleBy(x: 1.02, y: 1.02)
            drawPlaceMarkerIcon(category: category)
            cgContext.restoreGState()
        }
    }

    private func makeHotMarkerPath() -> UIBezierPath {
        let path = UIBezierPath()
        path.move(to: CGPoint(x: 20.3071, y: 3))
        path.addCurve(to: CGPoint(x: 22.0249, y: 3.5147), controlPoint1: CGPoint(x: 20.9178, y: 3.01), controlPoint2: CGPoint(x: 21.5119, y: 3.1895))
        path.addLine(to: CGPoint(x: 22.2397, y: 3.6621))
        path.addLine(to: CGPoint(x: 22.2749, y: 3.6895))
        path.addCurve(to: CGPoint(x: 22.6899, y: 3.9736), controlPoint1: CGPoint(x: 22.4121, y: 3.7859), controlPoint2: CGPoint(x: 22.5504, y: 3.8808))
        path.addLine(to: CGPoint(x: 23.1704, y: 4.2832))
        path.addLine(to: CGPoint(x: 23.1821, y: 4.291))
        path.addCurve(to: CGPoint(x: 31.0952, y: 10.9512), controlPoint1: CGPoint(x: 24.9371, y: 5.4211), controlPoint2: CGPoint(x: 28.3342, y: 7.6003))
        path.addCurve(to: CGPoint(x: 32.6538, y: 12.7979), controlPoint1: CGPoint(x: 32.3707, y: 12.4976), controlPoint2: CGPoint(x: 32.3489, y: 12.4709))
        path.addCurve(to: CGPoint(x: 35.4683, y: 15.9434), controlPoint1: CGPoint(x: 32.957, y: 13.1229), controlPoint2: CGPoint(x: 33.5195, y: 13.7283))
        path.addCurve(to: CGPoint(x: 37.5435, y: 14.1797), controlPoint1: CGPoint(x: 36.1481, y: 15.1914), controlPoint2: CGPoint(x: 36.886, y: 14.6046))
        path.addCurve(to: CGPoint(x: 38.8062, y: 13.4971), controlPoint1: CGPoint(x: 38.0061, y: 13.8807), controlPoint2: CGPoint(x: 38.4418, y: 13.6519))
        path.addCurve(to: CGPoint(x: 39.3257, y: 13.3115), controlPoint1: CGPoint(x: 38.9874, y: 13.4201), controlPoint2: CGPoint(x: 39.164, y: 13.3563))
        path.addCurve(to: CGPoint(x: 39.9321, y: 13.2422), controlPoint1: CGPoint(x: 39.4529, y: 13.2763), controlPoint2: CGPoint(x: 39.686, y: 13.2183))
        path.addCurve(to: CGPoint(x: 41.3979, y: 13.751), controlPoint1: CGPoint(x: 40.4551, y: 13.2932), controlPoint2: CGPoint(x: 40.9574, y: 13.4685))
        path.addLine(to: CGPoint(x: 41.5835, y: 13.8779))
        path.addLine(to: CGPoint(x: 41.5845, y: 13.8789))
        path.addCurve(to: CGPoint(x: 47.9692, y: 23.8789), controlPoint1: CGPoint(x: 43.939, y: 15.6292), controlPoint2: CGPoint(x: 46.576, y: 19.4564))
        path.addLine(to: CGPoint(x: 48.1001, y: 24.3086))
        path.addCurve(to: CGPoint(x: 46.5171, y: 39.6045), controlPoint1: CGPoint(x: 49.42, y: 28.7852), controlPoint2: CGPoint(x: 49.6116, y: 34.3637))
        path.addLine(to: CGPoint(x: 46.5112, y: 39.6143))
        path.addLine(to: CGPoint(x: 46.5044, y: 39.624))
        path.addCurve(to: CGPoint(x: 39.105, y: 46.6055), controlPoint1: CGPoint(x: 44.6811, y: 42.5517), controlPoint2: CGPoint(x: 42.132, y: 44.9568))
        path.addLine(to: CGPoint(x: 39.105, y: 46.6064))
        path.addCurve(to: CGPoint(x: 29.4097, y: 48.9854), controlPoint1: CGPoint(x: 36.1319, y: 48.2226), controlPoint2: CGPoint(x: 32.792, y: 49.0418))
        path.addCurve(to: CGPoint(x: 20.77, y: 47.2207), controlPoint1: CGPoint(x: 26.4273, y: 49.0999), controlPoint2: CGPoint(x: 23.464, y: 48.4942))
        path.addLine(to: CGPoint(x: 20.2329, y: 46.9561))
        path.addCurve(to: CGPoint(x: 13.1118, y: 40.5938), controlPoint1: CGPoint(x: 17.354, y: 45.4813), controlPoint2: CGPoint(x: 14.9021, y: 43.2902))
        path.addLine(to: CGPoint(x: 13.1011, y: 40.5781))
        path.addLine(to: CGPoint(x: 13.0913, y: 40.5625))
        path.addLine(to: CGPoint(x: 13.022, y: 40.4482))
        path.addLine(to: CGPoint(x: 13.0171, y: 40.4404))
        path.addLine(to: CGPoint(x: 13.0122, y: 40.4316))
        path.addCurve(to: CGPoint(x: 15.2427, y: 14.417), controlPoint1: CGPoint(x: 5.6863, y: 27.8864), controlPoint2: CGPoint(x: 13.869, y: 16.3029))
        path.addCurve(to: CGPoint(x: 15.4946, y: 14.1094), controlPoint1: CGPoint(x: 15.3204, y: 14.3095), controlPoint2: CGPoint(x: 15.4046, y: 14.2068))
        path.addLine(to: CGPoint(x: 15.4976, y: 14.1055))
        path.addCurve(to: CGPoint(x: 17.1968, y: 10.915), controlPoint1: CGPoint(x: 16.3335, y: 13.2098), controlPoint2: CGPoint(x: 16.9196, y: 12.1096))
        path.addLine(to: CGPoint(x: 17.2456, y: 10.6895))
        path.addCurve(to: CGPoint(x: 17.0815, y: 7.2715), controlPoint1: CGPoint(x: 17.4696, y: 9.5549), controlPoint2: CGPoint(x: 17.4136, y: 8.3815))
        path.addCurve(to: CGPoint(x: 17.1235, y: 5.2295), controlPoint1: CGPoint(x: 16.8807, y: 6.6035), controlPoint2: CGPoint(x: 16.8953, y: 5.8887))
        path.addCurve(to: CGPoint(x: 18.354, y: 3.5986), controlPoint1: CGPoint(x: 17.3519, y: 4.57), controlPoint2: CGPoint(x: 17.7824, y: 3.999))
        path.addCurve(to: CGPoint(x: 20.3071, y: 3), controlPoint1: CGPoint(x: 18.9256, y: 3.1982), controlPoint2: CGPoint(x: 19.6093, y: 2.9886))
        path.close()

        return path
    }

    private func drawPlaceMarkerIcon(category: String) {
        switch category {
        case "food":
            drawFoodIcon()
        case "game":
            drawGameIcon()
        case "fashion":
            drawFashionIcon()
        default:
            drawMusicIcon()
        }
    }

    private func drawMusicIcon() {
        let note = "♪" as NSString
        let attributes: [NSAttributedString.Key: Any] = [
            .font: UIFont.boldSystemFont(ofSize: 27),
            .foregroundColor: UIColor.white,
        ]
        let noteSize = note.size(withAttributes: attributes)
        note.draw(
            in: CGRect(x: -noteSize.width / 2, y: -15, width: noteSize.width, height: noteSize.height),
            withAttributes: attributes
        )
    }

    private func drawFoodIcon() {
        let path = UIBezierPath()
        path.lineWidth = 2.5
        path.lineCapStyle = .round
        path.lineJoinStyle = .round
        path.move(to: CGPoint(x: -7, y: -10))
        path.addLine(to: CGPoint(x: -7, y: 10))
        path.move(to: CGPoint(x: -11, y: -10))
        path.addLine(to: CGPoint(x: -11, y: -1))
        path.move(to: CGPoint(x: -3, y: -10))
        path.addLine(to: CGPoint(x: -3, y: -1))
        path.move(to: CGPoint(x: -11, y: -1))
        path.addLine(to: CGPoint(x: -3, y: -1))
        path.move(to: CGPoint(x: 10, y: -10))
        path.addCurve(to: CGPoint(x: 9, y: 2), controlPoint1: CGPoint(x: 5, y: -6), controlPoint2: CGPoint(x: 5, y: 0))
        path.addLine(to: CGPoint(x: 9, y: 10))
        UIColor.white.setStroke()
        path.stroke()
    }

    private func drawGameIcon() {
        let path = UIBezierPath(roundedRect: CGRect(x: -14, y: -8, width: 28, height: 16), cornerRadius: 8)
        path.lineWidth = 2.5
        UIColor.white.setStroke()
        path.stroke()

        let detail = UIBezierPath()
        detail.lineWidth = 2.5
        detail.lineCapStyle = .round
        detail.move(to: CGPoint(x: -8, y: -3))
        detail.addLine(to: CGPoint(x: -8, y: 4))
        detail.move(to: CGPoint(x: -11.5, y: 0.5))
        detail.addLine(to: CGPoint(x: -4.5, y: 0.5))
        detail.stroke()

        UIBezierPath(ovalIn: CGRect(x: 3.9, y: -3.6, width: 3.2, height: 3.2)).stroke()
        UIBezierPath(ovalIn: CGRect(x: 7.9, y: 0.9, width: 3.2, height: 3.2)).stroke()
    }

    private func drawFashionIcon() {
        let path = UIBezierPath()
        path.lineWidth = 2.6
        path.lineCapStyle = .round
        path.lineJoinStyle = .round
        path.move(to: CGPoint(x: 0, y: -11))
        path.addCurve(to: CGPoint(x: 0, y: -5), controlPoint1: CGPoint(x: 5, y: -11), controlPoint2: CGPoint(x: 5, y: -5))
        path.addLine(to: CGPoint(x: 0, y: -2))
        path.addLine(to: CGPoint(x: -14, y: 8))
        path.addLine(to: CGPoint(x: 14, y: 8))
        path.addLine(to: CGPoint(x: 0, y: -2))
        UIColor.white.setStroke()
        path.stroke()
    }

    private func makeUserLocationImage() -> UIImage {
        let size = CGSize(width: 48, height: 63)
        let renderer = UIGraphicsImageRenderer(size: size)

        return renderer.image { context in
            let cgContext = context.cgContext
            let pink = UIColor(red: 1.0, green: 0.098, blue: 0.337, alpha: 1.0)
            let white = UIColor.white
            let centerX = size.width / 2
            let circleCenter = CGPoint(x: centerX, y: 42)

            let arrowPath = UIBezierPath()
            arrowPath.move(to: CGPoint(x: centerX, y: 4.5))
            arrowPath.addLine(to: CGPoint(x: centerX - 15.5, y: 25.5))
            arrowPath.addLine(to: CGPoint(x: centerX + 15.5, y: 25.5))
            arrowPath.close()

            white.setStroke()
            pink.setFill()
            arrowPath.lineWidth = 4
            arrowPath.lineJoinStyle = .round
            arrowPath.stroke()
            arrowPath.fill()

            cgContext.saveGState()
            cgContext.setShadow(offset: CGSize(width: 0, height: 3), blur: 8, color: UIColor.black.withAlphaComponent(0.18).cgColor)
            white.setFill()
            UIBezierPath(
                ovalIn: CGRect(
                    x: circleCenter.x - 20.5,
                    y: circleCenter.y - 20.5,
                    width: 41,
                    height: 41
                )
            ).fill()
            cgContext.restoreGState()

            pink.setFill()
            UIBezierPath(
                ovalIn: CGRect(
                    x: circleCenter.x - 16.5,
                    y: circleCenter.y - 16.5,
                    width: 33,
                    height: 33
                )
            ).fill()
        }
    }
}
