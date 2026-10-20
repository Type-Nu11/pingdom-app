import { getVoiceSilenceMs } from '../completion';
import { createSilenceTimer } from '../silenceTimer';
import { createAudioActivityDetector } from '../audioActivity';

afterEach(() => jest.useRealTimers());

test.each([
  ['안녕', {}, 1000],
  ['안녕하세요!', {}, 1000],
  ['Hi', {}, 1000],
  ['안녕 그리고', {}, 3000],
  ['안녕…', {}, 3000],
  ['근처 카페 찾아줘', {}, 1000],
  ['여기 문 열었나요?', {}, 1000],
  ['예약할 수 있을까요', {}, 1000],
  ['두 명', { expectedAnswer: 'quantity' as const }, 1000],
  ['2명이요', { expectedAnswer: 'quantity' as const }, 1000],
  ['두 명', {}, 3000],
  ['두 명 내일 저녁에', { expectedAnswer: 'quantity' as const }, 3000],
  ['내일 저녁에…', {}, 3000],
  ['찾아줘...', {}, 3000],
  ['피자', {}, 3000],
  ['누구나', {}, 3000],
] as const)('completion clues respect context: %s', (text, context, wait) => {
  expect(getVoiceSilenceMs(text, context)).toBe(wait);
});

test('completed interim text never ends capture during ongoing speech or without acoustic evidence', () => {
  jest.useFakeTimers();
  const elapsed = jest.fn();
  const timer = createSilenceTimer(elapsed);
  timer.setText('카페 찾아줘');
  jest.advanceTimersByTime(5000);
  expect(elapsed).not.toHaveBeenCalled();
  timer.activity(true);
  jest.advanceTimersByTime(5000);
  expect(elapsed).not.toHaveBeenCalled();
  timer.activity(false);
  jest.advanceTimersByTime(999);
  expect(elapsed).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(elapsed).toHaveBeenCalledTimes(1);
  timer.reset();
});

test('speech resumption resets the silence clock even when STT text has not changed', () => {
  jest.useFakeTimers();
  const elapsed = jest.fn();
  const timer = createSilenceTimer(elapsed);
  timer.setText('문 열었나요');
  timer.activity(false);
  jest.advanceTimersByTime(800);
  timer.activity(true);
  jest.advanceTimersByTime(3000);
  expect(elapsed).not.toHaveBeenCalled();
  timer.activity(false);
  jest.advanceTimersByTime(999);
  expect(elapsed).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(elapsed).toHaveBeenCalledTimes(1);
  timer.reset();
});

test('late recognition chooses a duration measured from acoustic quiet, not text arrival', () => {
  jest.useFakeTimers();
  const elapsed = jest.fn();
  const timer = createSilenceTimer(elapsed);
  timer.activity(false);
  timer.setText('여기 문');
  jest.advanceTimersByTime(700);
  timer.setText('여기 문 열었나요');
  timer.activity(false);
  jest.advanceTimersByTime(299);
  expect(elapsed).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(elapsed).toHaveBeenCalledTimes(1);
  timer.reset();
});

test('reset cancels timers and erases prior-turn text and answer context', () => {
  jest.useFakeTimers();
  const elapsed = jest.fn();
  const timer = createSilenceTimer(elapsed);
  timer.setContext({ expectedAnswer: 'quantity' });
  timer.setText('두 명');
  timer.activity(false);
  timer.reset();
  jest.advanceTimersByTime(3000);
  expect(elapsed).not.toHaveBeenCalled();
  timer.setText('두 명');
  timer.activity(false);
  jest.advanceTimersByTime(2999);
  expect(elapsed).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(elapsed).toHaveBeenCalledTimes(1);
  timer.reset();
});

test('low positive energy does not count as speech; hysteresis and native edges handle activity', () => {
  const detector = createAudioActivityDetector();
  expect(detector.volume(0.5)).toBe(false);
  expect(detector.speechStart()).toBe(true);
  expect(detector.volume(2)).toBe(true);
  expect(detector.volume(1)).toBe(false);
  expect(detector.volume(2)).toBe(false);
  expect(detector.volume(3)).toBe(true);
  expect(detector.volume(NaN)).toBeNull();
  expect(detector.speechEnd()).toBe(false);
});

test('confirmed quiet duration includes native debounce and repeated quiet does not extend it', () => {
  jest.useFakeTimers();
  const elapsed = jest.fn();
  const timer = createSilenceTimer(elapsed);
  timer.setText('안녕');
  timer.activity(false, 200);
  jest.advanceTimersByTime(700);
  timer.activity(false, 200);
  jest.advanceTimersByTime(99);
  expect(elapsed).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(elapsed).toHaveBeenCalledTimes(1);
  timer.reset();
});
