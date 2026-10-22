import { createTranslationService, type OfflineTranslationBridge } from '../service';

function setup() {
  const models = new Set<string>();
  const bridge: OfflineTranslationBridge = {
    getOfflineModels: jest.fn(async () => [...models]),
    downloadOfflineModel: jest.fn(async code => { models.add(code); }),
    deleteOfflineModel: jest.fn(async code => { models.delete(code); }),
    getTranslationPlan: jest.fn(async (_text, target) => ({ sourceLanguage: 'en', targetLanguage: target, shouldTranslate: target !== 'en' })),
    translate: jest.fn(async text => ({ translatedText: `번역:${text}` })),
    translateOffline: jest.fn(async text => `번역:${text}`),
  };
  return { bridge, models, service: createTranslationService(() => bridge) };
}
test('영어는 내장 모델로 처리하며 외국어 원문을 한국어로 번역한다', async () => {
  const { bridge, models, service } = setup();
  expect(await service.prepare('A community post', 'ko')).toEqual({ sourceLanguage: 'en', targetLanguage: 'ko', shouldTranslate: true, missingModels: ['ko'] });
  await expect(service.translate('A community post', 'en', 'ko')).rejects.toThrow('MODEL_DOWNLOAD_REQUIRED');
  expect(bridge.downloadOfflineModel).not.toHaveBeenCalled();
  models.add('ko');
  await expect(service.translate('A community post', 'en', 'ko')).resolves.toBe('번역:A community post');
  expect(bridge.translate).toHaveBeenCalledWith('A community post', 'en', 'ko', false);
});
test('같은 언어와 빈 문자열은 네이티브 번역이나 다운로드 없이 그대로 반환한다', async () => {
  const { bridge, service } = setup();
  await expect(service.translate('Original', 'en', 'en')).resolves.toBe('Original');
  await expect(service.translate('  ', 'ja', 'ko')).resolves.toBe('  ');
  expect(bridge.getOfflineModels).not.toHaveBeenCalled();
  expect(bridge.translate).not.toHaveBeenCalled();
});
test('명시적으로 요청한 누락 모델만 내려받고 번역 호출은 하지 않는다', async () => {
  const { bridge, models, service } = setup();
  models.add('ko');
  await service.downloadModels(['en', 'ko', 'ja', 'ja']);
  expect(bridge.downloadOfflineModel).toHaveBeenCalledTimes(1);
  expect(bridge.downloadOfflineModel).toHaveBeenCalledWith('ja');
  expect(bridge.translate).not.toHaveBeenCalled();
});
test('캐시는 원문 언어와 목표 언어까지 구분하고 진행 중 중복 번역을 합친다', async () => {
  const { bridge, models, service } = setup();
  for (const model of ['ja', 'zh', 'ko']) models.add(model);
  await Promise.all([service.translate('same', 'ja', 'ko'), service.translate('same', 'ja', 'ko')]);
  await service.translate('same', 'ja', 'ko');
  expect(bridge.translate).toHaveBeenCalledTimes(1);
  await service.translate('same', 'zh', 'ko');
  await service.translate('same', 'ja', 'en');
  expect(bridge.translate).toHaveBeenCalledTimes(3);
});
test('번역 중 모델 삭제를 막고 삭제 후에는 캐시보다 설치 상태를 우선한다', async () => {
  const { bridge, models, service } = setup();
  models.add('ko');
  let finish!: (value: { translatedText: string }) => void;
  (bridge.translate as jest.Mock).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const task = service.translate('Locked post', 'en', 'ko');
  await Promise.resolve();
  await expect(service.delete('ko')).rejects.toThrow('BUSY');
  finish({ translatedText: '잠긴 글' });
  await task;
  await service.delete('ko');
  await expect(service.translate('Locked post', 'en', 'ko')).rejects.toThrow('MODEL_DOWNLOAD_REQUIRED');
});
test('빈 번역 결과를 캐시하지 않고 재시도한다', async () => {
  const { bridge, models, service } = setup();
  models.add('ko');
  (bridge.translate as jest.Mock).mockResolvedValueOnce({ translatedText: ' ' });
  await expect(service.translate('Retry post', 'en', 'ko')).rejects.toThrow('EMPTY_TRANSLATION');
  await expect(service.translate('Retry post', 'en', 'ko')).resolves.toBe('번역:Retry post');
});
