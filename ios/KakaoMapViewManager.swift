import Foundation
import React

@objc(KakaoMapViewManager)
final class KakaoMapViewManager: RCTViewManager {
    @objc override static func moduleName() -> String! {
        return "KakaoMapView"
    }

    override static func requiresMainQueueSetup() -> Bool {
        true
    }

    override func view() -> UIView! {
        return KakaoMapView()
    }
}
