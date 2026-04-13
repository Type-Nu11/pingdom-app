import Foundation
import React

@objc(KakaoMapViewManager)
final class KakaoMapViewManager: RCTViewManager {
    override static func requiresMainQueueSetup() -> Bool {
        true
    }

    override func view() -> UIView! {
        return KakaoMapView()
    }
}