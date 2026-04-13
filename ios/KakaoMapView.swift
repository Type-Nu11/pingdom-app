import UIKit
import KakaoMapsSDK

@objc(KakaoMapView)
final class KakaoMapView: UIView, MapControllerDelegate {
    private let container = KMViewContainer()
    private var controller: KMController?
    private var observersAdded = false
    private var didAddMap = false

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
        guard !didAddMap else { return }

        let defaultPosition = MapPoint(longitude: 127.108678, latitude: 37.402001)
        let mapviewInfo = MapviewInfo(
        viewName: "mapview",
        viewInfoName: "map",
        defaultPosition: defaultPosition,
        defaultLevel: 7
        )

        controller?.addView(mapviewInfo)
        didAddMap = true
    }

    func addViewSucceeded(_ viewName: String, viewInfoName: String) {
        print("Kakao map added: \(viewName), \(viewInfoName)")
    }

    func addViewFailed(_ viewName: String, viewInfoName: String) {
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
}
