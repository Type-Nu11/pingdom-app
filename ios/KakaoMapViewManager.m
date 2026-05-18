#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(KakaoMapViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(centerLat, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(centerLng, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(markers, NSArray)
@end
