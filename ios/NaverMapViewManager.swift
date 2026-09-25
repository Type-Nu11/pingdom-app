import Foundation
import React

@objc(NaverMapViewManager)
final class NaverMapViewManager: RCTViewManager {
    @objc override static func moduleName() -> String! {
        return "NaverMapView"
    }

    override static func requiresMainQueueSetup() -> Bool {
        true
    }

    override func view() -> UIView! {
        return NaverMapView()
    }
}
