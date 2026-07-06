#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MLKitTranslation, NSObject)

RCT_EXTERN_METHOD(
  getTranslationPlan:(NSString *)text
  targetLanguage:(NSString *)targetLanguage
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  translate:(NSString *)text
  sourceLanguage:(NSString *)sourceLanguage
  targetLanguage:(NSString *)targetLanguage
  allowModelDownload:(BOOL)allowModelDownload
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end
