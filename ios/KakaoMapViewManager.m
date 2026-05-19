#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(KakaoMapViewManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(centerLat, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(centerLng, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(zoomLevel, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(markers, NSArray)
RCT_EXPORT_VIEW_PROPERTY(userLat, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(userLng, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(followUser, BOOL)
@end
