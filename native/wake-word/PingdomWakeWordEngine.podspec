Pod::Spec.new do |s|
  s.name = 'PingdomWakeWordEngine'
  s.version = '1.13.8'
  s.summary = 'Pingdom foreground sherpa-onnx keyword spotting bridge'
  s.homepage = 'https://github.com/k2-fsa/sherpa-onnx'
  s.license = { :type => 'Apache-2.0', :file => 'assets/pingdom-wake-word/LICENSE-APACHE-2.0.txt' }
  s.author = 'Pingdom'
  s.source = { :git => 'https://github.com/Type-Nu11/pingdom-app.git' }
  s.platform = :ios, '15.5'
  s.source_files = 'ios/*.{h,mm}'
  s.vendored_frameworks = 'vendor/SherpaOnnxC.xcframework'
  s.resource_bundles = { 'PingdomWakeWord' => ['assets/pingdom-wake-word/*'] }
  s.frameworks = 'AVFoundation', 'UIKit', 'Accelerate'
  s.libraries = 'c++'
  s.dependency 'React-Core'
  s.pod_target_xcconfig = { 'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17' }
end
