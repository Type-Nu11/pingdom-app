module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    kakaoRestApiKey:
      process.env.KAKAO_REST_API_KEY ?? process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '',
  },
  plugins: [...(config.plugins ?? []), 'expo-sharing', ['expo-audio', {
    microphonePermission: 'Microphone access lets you ask Pingdy with your voice.',
    enableBackgroundPlayback: false,
  }], ['expo-speech-recognition', {
    microphonePermission: 'Microphone access lets you ask Pingdy with your voice.',
    speechRecognitionPermission: 'Speech recognition converts your voice to text. Audio may be processed by the device speech service outside this device.',
  }]],
});
