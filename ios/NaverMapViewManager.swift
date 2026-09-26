import Foundation
import React

// JS requireNativeComponent('NaverMapView')가 이 매니저를 통해 실제 Swift 지도 뷰를 생성한다.
// UIKit 뷰 생성은 메인 스레드에서 수행하고, 속성 공개는 NaverMapViewManager.m이 담당한다.
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
