import UIKit
import KakaoMapsSDK

@objc(KakaoMapView)
final class KakaoMapView: UIView, MapControllerDelegate {
    private let container = KMViewContainer()
    private var controller: KMController?
    private var observersAdded = false
    private var didAddMap = false
    private var requestedAddMap = false
    private var canAddMapView = false
    private var lastApplied: (lat: Double, lng: Double, zoom: Int)?

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
}
