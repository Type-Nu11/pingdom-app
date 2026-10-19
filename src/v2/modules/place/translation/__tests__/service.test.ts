import { createOfflineTranslationService, type OfflineTranslationBridge } from '../service';
import { missingModels, recommendedTranslationLanguage } from '../languages';
function setup() {
  const models = new Set<string>();
  const bridge: OfflineTranslationBridge = {
    getOfflineModels: jest.fn(async () => [...models]),
    downloadOfflineModel: jest.fn(async (code) => { models.add(code); }),
    deleteOfflineModel: jest.fn(async (code) => { models.delete(code); }),
    translateOffline: jest.fn(async (text, language) => `${language}:${text}`),
  };
  return { bridge, models, service: createOfflineTranslationService(() => bridge) };
}
test('country recommends a language; multilingual and unknown countries require a choice', () => {
  expect(recommendedTranslationLanguage('JP')).toBe('ja');
  expect(recommendedTranslationLanguage('BR')).toBe('pt');
  expect(recommendedTranslationLanguage('KR')).toBe('ko');
  for (const country of ['CA', 'SG', 'XX', undefined]) expect(recommendedTranslationLanguage(country)).toBeNull();
  expect(missingModels([], 'en')).toEqual(['ko']);
  expect(missingModels(['ko'], 'ja')).toEqual(['ja']);
});
test('Korean returns the exact server original without any native model operation', async () => {
  const { service, bridge } = setup();
  expect(missingModels([], 'ko')).toEqual([]);
  await expect(service.translate('서버 장소명', 'ko')).resolves.toBe('서버 장소명');
  expect(bridge.getOfflineModels).not.toHaveBeenCalled();
  expect(bridge.translateOffline).not.toHaveBeenCalled();
});
test('download is explicit, missing models only, and never translates a string', async () => {
  const { service, bridge } = setup();
  await expect(service.translate('서버 장소명', 'ja')).rejects.toThrow('MODEL_DOWNLOAD_REQUIRED');
  expect(bridge.downloadOfflineModel).not.toHaveBeenCalled();
  await service.download('ja');
  expect(bridge.downloadOfflineModel).toHaveBeenCalledTimes(2);
  expect(bridge.translateOffline).not.toHaveBeenCalled();
  await service.download('ja');
  expect(bridge.downloadOfflineModel).toHaveBeenCalledTimes(2);
});
test('deduplicates concurrent requests and reuses exact source/target cache only', async () => {
  const { service, bridge } = setup();
  await service.download('ja'); await service.download('en');
  await Promise.all([service.translate('서버 장소명', 'ja'), service.translate('서버 장소명', 'ja')]);
  await service.translate('서버 장소명', 'ja');
  expect(bridge.translateOffline).toHaveBeenCalledTimes(1);
  await service.translate('변경된 장소명', 'ja'); await service.translate('서버 장소명', 'en');
  expect(bridge.translateOffline).toHaveBeenCalledTimes(3);
});
test('failed translations retry and model deletion invalidates cached translations', async () => {
  const { service, bridge } = setup(); await service.download('ja');
  (bridge.translateOffline as jest.Mock).mockRejectedValueOnce(new Error('failure'));
  await expect(service.translate('장소', 'ja')).rejects.toThrow('failure');
  await service.translate('장소', 'ja'); await service.delete('ja');
  await expect(service.translate('장소', 'ja')).rejects.toThrow('MODEL_DOWNLOAD_REQUIRED');
  await service.download('ja'); await service.translate('장소', 'ja');
  expect(bridge.translateOffline).toHaveBeenCalledTimes(3);
});
