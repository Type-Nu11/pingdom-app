#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <AVFoundation/AVFoundation.h>
#import <UIKit/UIKit.h>
#import <CommonCrypto/CommonDigest.h>
#import <SherpaOnnxC/sherpa-onnx/c-api/c-api.h>
#include <atomic>
#include <memory>
#include <vector>

static NSString *const Phrase = @"Hey Pingdy";
static NSString *const Model = @"sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20";

@interface PingdomWakeWord : RCTEventEmitter <RCTBridgeModule> {
  dispatch_queue_t _queue;
  const SherpaOnnxKeywordSpotter *_spotter;
  const SherpaOnnxOnlineStream *_stream;
  AVAudioEngine *_engine;
  NSString *_sessionId;
  NSBundle *_assets;
  std::atomic<bool> _capturing;
  std::atomic<bool> _foreground;
  std::atomic<bool> _interrupted;
  std::atomic<int> _pendingBuffers;
  BOOL _verified;
  BOOL _tapInstalled;
  BOOL _audioSessionOwned;
  BOOL _invalidated;
}
@end

@implementation PingdomWakeWord
RCT_EXPORT_MODULE(PingdomWakeWord)
+ (BOOL)requiresMainQueueSetup { return YES; }
- (dispatch_queue_t)methodQueue { return _queue; }
- (NSArray<NSString *> *)supportedEvents { return @[@"PingdomWakeWordEvent"]; }

- (instancetype)init {
  if ((self = [super init])) {
    _queue = dispatch_queue_create("com.pingdom.wake-word", DISPATCH_QUEUE_SERIAL);
    _capturing.store(false); _interrupted.store(false); _pendingBuffers.store(0);
    _foreground.store(UIApplication.sharedApplication.applicationState == UIApplicationStateActive);
    NSNotificationCenter *center = NSNotificationCenter.defaultCenter;
    [center addObserver:self selector:@selector(background:) name:UIApplicationWillResignActiveNotification object:nil];
    [center addObserver:self selector:@selector(foreground:) name:UIApplicationDidBecomeActiveNotification object:nil];
    [center addObserver:self selector:@selector(audioInterrupted:) name:AVAudioSessionInterruptionNotification object:nil];
    [center addObserver:self selector:@selector(routeChanged:) name:AVAudioSessionRouteChangeNotification object:nil];
    [center addObserver:self selector:@selector(engineChanged:) name:AVAudioEngineConfigurationChangeNotification object:nil];
  }
  return self;
}

- (void)emit:(NSString *)type session:(NSString *)session reason:(NSString *)reason {
  if (_invalidated || !session) return;
  NSMutableDictionary *event = [@{@"type":type, @"sessionId":session} mutableCopy];
  if (reason) event[@"reason"] = reason;
  if ([type isEqualToString:@"detected"]) event[@"keyword"] = @"Hey_Pingdy";
  [self sendEventWithName:@"PingdomWakeWordEvent" body:event];
}

- (NSString *)path:(NSString *)name { return [_assets pathForResource:name ofType:nil]; }
- (BOOL)verifyAssets {
  if (_verified) return YES;
  NSURL *url = [NSBundle.mainBundle URLForResource:@"PingdomWakeWord" withExtension:@"bundle"];
  if (!url) url = [[NSBundle bundleForClass:self.class] URLForResource:@"PingdomWakeWord" withExtension:@"bundle"];
  _assets = url ? [NSBundle bundleWithURL:url] : nil;
  NSData *data = [NSData dataWithContentsOfFile:[self path:@"manifest.json"] ?: @""];
  NSDictionary *manifest = data ? [NSJSONSerialization JSONObjectWithData:data options:0 error:nil] : nil;
  if (![manifest[@"phrase"] isEqual:Phrase] || ![manifest[@"engineVersion"] isEqual:@"1.13.8"] || ![manifest[@"modelId"] isEqual:Model]) return NO;
  for (NSString *name in @[@"encoder.onnx", @"decoder.onnx", @"joiner.onnx", @"tokens.txt", @"keywords.txt"]) {
    NSData *file = [NSData dataWithContentsOfFile:[self path:name] ?: @"" options:NSDataReadingMappedIfSafe error:nil];
    if (!file || file.length == 0) return NO;
    unsigned char hash[CC_SHA256_DIGEST_LENGTH];
    CC_SHA256(file.bytes, (CC_LONG)file.length, hash);
    NSMutableString *hex = [NSMutableString stringWithCapacity:64];
    for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) [hex appendFormat:@"%02x", hash[i]];
    if (![hex isEqual:manifest[@"files"][name]]) return NO;
  }
  NSString *keywords = [NSString stringWithContentsOfFile:[self path:@"keywords.txt"] encoding:NSUTF8StringEncoding error:nil];
  _verified = [keywords isEqualToString:@"HH EY1 P IH1 NG D IY0 @Hey_Pingdy\nh ēi p íng d í @Hey_Pingdy\nh ēi p ìn d ì @Hey_Pingdy\n"];
  return _verified;
}

- (const SherpaOnnxKeywordSpotter *)createSpotter {
  if (![self verifyAssets]) return nullptr;
  SherpaOnnxKeywordSpotterConfig config = {};
  config.feat_config.sample_rate = 16000; config.feat_config.feature_dim = 80;
  config.model_config.transducer.encoder = [self path:@"encoder.onnx"].UTF8String;
  config.model_config.transducer.decoder = [self path:@"decoder.onnx"].UTF8String;
  config.model_config.transducer.joiner = [self path:@"joiner.onnx"].UTF8String;
  config.model_config.tokens = [self path:@"tokens.txt"].UTF8String;
  config.model_config.provider = "cpu"; config.model_config.num_threads = 1;
  config.model_config.model_type = "zipformer2";
  config.keywords_file = [self path:@"keywords.txt"].UTF8String;
  config.max_active_paths = 4; config.num_trailing_blanks = 2;
  config.keywords_score = 2.0f; config.keywords_threshold = 0.15f;
  return SherpaOnnxCreateKeywordSpotter(&config);
}

RCT_REMAP_METHOD(getStatus, statusResolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  BOOL ready = !_invalidated;
  if (!_spotter && ready) {
    const auto *probe = [self createSpotter];
    ready = probe != nullptr;
    if (probe) {
      const auto *input = SherpaOnnxCreateKeywordStream(probe);
      ready = input != nullptr;
      if (input) {
        std::vector<float> silence(8000, 0);
        SherpaOnnxOnlineStreamAcceptWaveform(input, 16000, silence.data(), (int32_t)silence.size());
        while (SherpaOnnxIsKeywordStreamReady(probe, input)) SherpaOnnxDecodeKeywordStream(probe, input);
        const auto *result = SherpaOnnxGetKeywordResult(probe, input);
        ready = result && (!result->keyword || strlen(result->keyword) == 0);
        if (result) SherpaOnnxDestroyKeywordResult(result);
        SherpaOnnxDestroyOnlineStream(input);
      }
      SherpaOnnxDestroyKeywordSpotter(probe);
    }
  }
  resolve(@{@"ready":@(ready), @"phrase":Phrase, @"modelId":Model, @"engineVersion":@"1.13.8"});
}

- (BOOL)audioAvailable {
  AVAudioSession *audio = AVAudioSession.sharedInstance;
  return !_capturing.load() && !audio.otherAudioPlaying && !audio.secondaryAudioShouldBeSilencedHint;
}
RCT_REMAP_METHOD(isAudioAvailable, audioResolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  resolve(@(_foreground.load() && [self audioAvailable]));
}

RCT_REMAP_METHOD(initialize, initializeSession:(NSString *)session phrase:(NSString *)phrase resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (_invalidated || _sessionId || ![phrase isEqual:Phrase]) { reject(@"WAKE_WORD_ENGINE", @"Keyword session unavailable", nil); return; }
  _spotter = [self createSpotter];
  _stream = _spotter ? SherpaOnnxCreateKeywordStream(_spotter) : nullptr;
  if (!_spotter || !_stream) {
    if (_stream) SherpaOnnxDestroyOnlineStream(_stream); _stream = nullptr;
    if (_spotter) SherpaOnnxDestroyKeywordSpotter(_spotter); _spotter = nullptr;
    reject(@"WAKE_WORD_ENGINE", @"Local keyword model initialization failed", nil); return;
  }
  _sessionId = [session copy]; _interrupted.store(false); resolve(nil);
}

- (BOOL)stopCapture:(NSError **)error {
  _capturing.store(false);
  if (_tapInstalled) { [_engine.inputNode removeTapOnBus:0]; _tapInstalled = NO; }
  [_engine stop]; _engine = nil;
  if (_audioSessionOwned) {
    BOOL stopped = [AVAudioSession.sharedInstance setActive:NO withOptions:AVAudioSessionSetActiveOptionNotifyOthersOnDeactivation error:error];
    if (!stopped) return NO;
    _audioSessionOwned = NO;
  }
  return YES;
}
- (BOOL)releaseResources:(NSError **)error {
  if (![self stopCapture:error]) return NO;
  if (_stream) SherpaOnnxDestroyOnlineStream(_stream); _stream = nullptr;
  if (_spotter) SherpaOnnxDestroyKeywordSpotter(_spotter); _spotter = nullptr;
  _sessionId = nil;
  return YES;
}

RCT_REMAP_METHOD(start, startSession:(NSString *)session resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  if (_invalidated || _interrupted.load() || !_foreground.load() || ![_sessionId isEqual:session] || !_spotter || !_stream || ![self audioAvailable]
      || AVAudioSession.sharedInstance.recordPermission != AVAudioSessionRecordPermissionGranted) {
    reject(@"WAKE_WORD_AUDIO", @"Microphone or audio session unavailable", nil); return;
  }
  AVAudioSession *audio = AVAudioSession.sharedInstance;
  NSError *error = nil;
  if (![audio setCategory:AVAudioSessionCategoryRecord mode:AVAudioSessionModeMeasurement options:0 error:&error]
      || ![audio setActive:YES error:&error]) { reject(@"WAKE_WORD_AUDIO", @"Audio focus unavailable", error); return; }
  _audioSessionOwned = YES;
  _engine = [AVAudioEngine new];
  AVAudioInputNode *input = _engine.inputNode;
  AVAudioFormat *format = [input outputFormatForBus:0];
  if (format.sampleRate <= 0 || format.channelCount == 0 || format.commonFormat != AVAudioPCMFormatFloat32 || format.interleaved) {
    [self stopCapture:nil]; reject(@"WAKE_WORD_AUDIO", @"Audio input unavailable", nil); return;
  }
  __weak PingdomWakeWord *weakSelf = self;
  NSString *ownedSession = [_sessionId copy];
  _capturing.store(true);
  [input installTapOnBus:0 bufferSize:1024 format:format block:^(AVAudioPCMBuffer *buffer, AVAudioTime *when) {
    PingdomWakeWord *owner = weakSelf;
    if (!owner || owner->_interrupted.load() || !owner->_capturing.load() || !owner->_foreground.load()) return;
    // Keep latency and memory bounded; interruption/stop drains via the same serial queue.
    if (owner->_pendingBuffers.fetch_add(1) >= 8) { owner->_pendingBuffers.fetch_sub(1); return; }
    const float *const *channels = buffer.floatChannelData;
    if (!channels || !buffer.frameLength) { owner->_pendingBuffers.fetch_sub(1); return; }
    auto samples = std::make_shared<std::vector<float>>(buffer.frameLength, 0);
    for (AVAudioChannelCount c = 0; c < buffer.format.channelCount; c++)
      for (AVAudioFrameCount f = 0; f < buffer.frameLength; f++) (*samples)[f] += channels[c][f] / buffer.format.channelCount;
    int32_t rate = (int32_t)buffer.format.sampleRate;
    dispatch_async(owner->_queue, ^{
      owner->_pendingBuffers.fetch_sub(1);
      if (owner->_interrupted.load() || !owner->_capturing.load() || !owner->_foreground.load() || ![owner->_sessionId isEqual:ownedSession]) return;
      SherpaOnnxOnlineStreamAcceptWaveform(owner->_stream, rate, samples->data(), (int32_t)samples->size());
      while (owner->_capturing.load() && SherpaOnnxIsKeywordStreamReady(owner->_spotter, owner->_stream)) {
        SherpaOnnxDecodeKeywordStream(owner->_spotter, owner->_stream);
        const auto *result = SherpaOnnxGetKeywordResult(owner->_spotter, owner->_stream);
        BOOL detected = result && result->keyword && strcmp(result->keyword, "Hey_Pingdy") == 0;
        if (result) SherpaOnnxDestroyKeywordResult(result);
        if (detected) {
          NSError *stopError = nil;
          if ([owner stopCapture:&stopError]) [owner emit:@"detected" session:ownedSession reason:nil];
          else [owner emit:@"error" session:ownedSession reason:@"release"];
          break;
        }
      }
    });
  }];
  _tapInstalled = YES;
  [_engine prepare];
  if (![_engine startAndReturnError:&error] || !_foreground.load() || _interrupted.load()) {
    [self stopCapture:nil]; reject(@"WAKE_WORD_AUDIO", @"Audio input start failed", error); return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(stop, stopSession:(NSString *)session resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error = nil;
  if ([_sessionId isEqual:session] && ![self stopCapture:&error]) reject(@"WAKE_WORD_RELEASE", @"Microphone release failed", error);
  else resolve(nil);
}
RCT_REMAP_METHOD(dispose, disposeSession:(NSString *)session resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSError *error = nil;
  if ([_sessionId isEqual:session] && ![self releaseResources:&error]) reject(@"WAKE_WORD_RELEASE", @"Keyword engine release failed", error);
  else resolve(nil);
}

- (void)interruptWithSuspension:(BOOL)suspended {
  _interrupted.store(true);
  _capturing.store(false);
  dispatch_async(_queue, ^{
    NSString *session = self->_sessionId;
    if (!session) return;
    NSError *error = nil;
    BOOL released = [self releaseResources:&error];
    if (released && suspended) [self emit:@"suspended" session:session reason:nil];
    else [self emit:@"error" session:session reason:released ? @"interrupted" : @"release"];
  });
}
- (void)interrupt { [self interruptWithSuspension:NO]; }
- (void)background:(NSNotification *)notification { _foreground.store(false); [self interruptWithSuspension:YES]; }
- (void)foreground:(NSNotification *)notification { _foreground.store(true); }
- (void)audioInterrupted:(NSNotification *)notification {
  if ([notification.userInfo[AVAudioSessionInterruptionTypeKey] unsignedIntegerValue] == AVAudioSessionInterruptionTypeBegan) [self interrupt];
}
- (void)routeChanged:(NSNotification *)notification {
  NSUInteger reason = [notification.userInfo[AVAudioSessionRouteChangeReasonKey] unsignedIntegerValue];
  if (_capturing.load() && reason != AVAudioSessionRouteChangeReasonCategoryChange) [self interrupt];
}
- (void)engineChanged:(NSNotification *)notification { if (_capturing.load()) [self interrupt]; }
- (void)invalidate {
  _capturing.store(false); _foreground.store(false);
  [NSNotificationCenter.defaultCenter removeObserver:self];
  dispatch_async(_queue, ^{ self->_invalidated = YES; [self releaseResources:nil]; });
  [super invalidate];
}
@end
