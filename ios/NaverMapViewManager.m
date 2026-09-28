#import <React/RCTViewManager.h>

// Swift 매니저와 @objc 속성을 React Native에 공개하는 Objective-C 브리지 선언이다.
// JS props 이름은 Android의 @ReactProp 이름 및 NaverMapNativeView.tsx의 타입과 맞춘다.
@interface RCT_EXTERN_MODULE(NaverMapViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(centerLat, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(centerLng, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(markers, NSArray)
RCT_EXPORT_VIEW_PROPERTY(userLat, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(userLng, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(followUser, BOOL)
// JS의 nightMode를 Swift @objc 프로퍼티에 연결한다. didSetProps에서 SDK에 반영한다.
RCT_EXPORT_VIEW_PROPERTY(nightMode, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onCameraIdle, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMarkerPress, RCTDirectEventBlock)
@end
