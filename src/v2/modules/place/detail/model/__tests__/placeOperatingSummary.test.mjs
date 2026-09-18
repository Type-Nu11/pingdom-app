import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatPlaceOperatingSummary,
  selectPlaceOperatingSummary,
} from '../placeOperatingSummary.ts';

const monday = new Date('2026-08-31T02:34:00.000Z'); // 11:34 in Asia/Seoul

const base = (overrides = {}) => ({
  operatingStatus: 'OPERATING',
  currentlyOperating: false,
  regularHours: [],
  operatingExceptions: [],
  activeOperatingNotices: [],
  ...overrides,
});

const hours = (dayOfWeek, opensAt, closesAt) => ({ closesAt, dayOfWeek, opensAt });

const translate = (language) => {
  const messages = {
    en: {
      beforeOpen: 'Not open yet', closed: 'Closed', closedToday: 'Closed today',
      closesAt: 'Closes at {{time}}', open: 'Open', opensAt: 'Opens at {{time}}',
      opensLaterAt: 'Opens on the next business day at {{time}}',
      opensTomorrowAt: 'Opens tomorrow at {{time}}', permanentlyClosed: 'Permanently closed',
      temporarilyClosed: 'Temporarily closed', unknown: 'Hours unavailable',
    },
    ko: {
      beforeOpen: '영업 전', closed: '영업 종료', closedToday: '오늘 휴무',
      closesAt: '{{time}}에 영업 종료', open: '영업 중', opensAt: '{{time}}에 영업 시작',
      opensLaterAt: '다음 영업일 {{time}}에 영업 시작',
      opensTomorrowAt: '내일 {{time}}에 영업 시작', permanentlyClosed: '폐업',
      temporarilyClosed: '임시 휴무', unknown: '영업시간 정보 없음',
    },
  }[language];
  return (key, options = {}) => {
    const template = messages[key.split('.').at(-1)];
    return template.replace('{{time}}', options.time ?? '');
  };
};

test('일반 영업 중에는 서버 상태와 현재 구간 종료 시각을 표시한다', () => {
  const summary = selectPlaceOperatingSummary(base({
    currentlyOperating: true,
    regularHours: [hours('MONDAY', '11:00:00', '20:00:00')],
  }), monday);
  assert.deepEqual(summary, { kind: 'open', transitionDay: 'today', transitionTime: '20:00' });
  assert.equal(formatPlaceOperatingSummary(summary, translate('ko')).fullText,
    '영업 중 · 20:00에 영업 종료');
});

test('첫 영업 시작 전에는 영업 전과 당일 시작 시각을 표시한다', () => {
  const summary = selectPlaceOperatingSummary(base({
    regularHours: [hours('MONDAY', '11:00:00', '20:00:00')],
  }), new Date('2026-08-31T00:00:00.000Z'));
  assert.deepEqual(summary, { kind: 'before-open', transitionDay: 'today', transitionTime: '11:00' });
});

test('당일 종료 후 다음 날의 시작 시각을 찾는다', () => {
  const summary = selectPlaceOperatingSummary(base({
    regularHours: [
      hours('MONDAY', '11:00:00', '20:00:00'),
      hours('TUESDAY', '11:00:00', '20:00:00'),
    ],
  }), new Date('2026-08-31T12:00:00.000Z'));
  assert.deepEqual(summary, { kind: 'closed', transitionDay: 'tomorrow', transitionTime: '11:00' });
  assert.equal(formatPlaceOperatingSummary(summary, translate('ko')).fullText,
    '영업 종료 · 내일 11:00에 영업 시작');
});

test('오늘 영업 구간이 없으면 오늘은 종료 상태로 다음 날을 찾는다', () => {
  const summary = selectPlaceOperatingSummary(base({
    regularHours: [hours('TUESDAY', '11:00:00', '20:00:00')],
  }), monday);
  assert.deepEqual(summary, { kind: 'closed', transitionDay: 'tomorrow', transitionTime: '11:00' });
});

test('임시 휴무와 폐업은 시간 계산보다 우선한다', () => {
  const schedule = [hours('MONDAY', '11:00:00', '20:00:00')];
  assert.equal(selectPlaceOperatingSummary(base({
    currentlyOperating: true, operatingStatus: 'TEMPORARILY_CLOSED', regularHours: schedule,
  }), monday).kind, 'temporarily-closed');
  assert.equal(selectPlaceOperatingSummary(base({
    currentlyOperating: true, operatingStatus: 'PERMANENTLY_CLOSED', regularHours: schedule,
  }), monday).kind, 'permanently-closed');
});

test('오늘 exception 종일 휴무가 정규 영업시간보다 우선한다', () => {
  const summary = selectPlaceOperatingSummary(base({
    currentlyOperating: true,
    regularHours: [hours('MONDAY', '11:00:00', '20:00:00')],
    operatingExceptions: [{ date: '2026-08-31', closed: true, hours: [] }],
  }), monday);
  assert.deepEqual(summary, { kind: 'closed-today', transitionDay: null, transitionTime: null });
});

test('exception 대체 영업시간을 정규 영업시간 대신 사용한다', () => {
  const summary = selectPlaceOperatingSummary(base({
    regularHours: [hours('MONDAY', '11:00:00', '20:00:00')],
    operatingExceptions: [{
      date: '2026-08-31', closed: false,
      hours: [{ opensAt: '14:00:00', closesAt: '16:00:00' }],
    }],
  }), monday);
  assert.deepEqual(summary, { kind: 'before-open', transitionDay: 'today', transitionTime: '14:00' });
});

test('여러 구간 사이 휴게시간에는 다음 당일 구간을 선택한다', () => {
  const schedule = [
    hours('MONDAY', '09:00:00', '14:00:00'),
    hours('MONDAY', '17:00:00', '22:00:00'),
  ];
  const between = selectPlaceOperatingSummary(base({ regularHours: schedule }),
    new Date('2026-08-31T06:00:00.000Z'));
  assert.deepEqual(between, { kind: 'closed', transitionDay: 'today', transitionTime: '17:00' });

  const open = selectPlaceOperatingSummary(base({ currentlyOperating: true, regularHours: schedule }),
    new Date('2026-08-31T03:00:00.000Z'));
  assert.equal(open.transitionTime, '14:00');
});

test('자정 넘김 구간과 전날 시작한 overnight 구간을 모두 계산한다', () => {
  const schedule = [hours('FRIDAY', '18:00:00', '02:00:00')];
  const friday = selectPlaceOperatingSummary(base({ currentlyOperating: true, regularHours: schedule }),
    new Date('2026-09-04T14:00:00.000Z'));
  assert.deepEqual(friday, { kind: 'open', transitionDay: 'tomorrow', transitionTime: '02:00' });

  const saturday = selectPlaceOperatingSummary(base({ currentlyOperating: true, regularHours: schedule }),
    new Date('2026-09-04T16:00:00.000Z'));
  assert.deepEqual(saturday, { kind: 'open', transitionDay: 'today', transitionTime: '02:00' });
});

test('잘못된 opensAt과 closesAt은 throw 없이 상태-only로 fallback한다', () => {
  assert.deepEqual(selectPlaceOperatingSummary(base({
    regularHours: [hours('MONDAY', '25:00:00', '20:00:00')],
  }), monday), { kind: 'closed', transitionDay: null, transitionTime: null });
  assert.deepEqual(selectPlaceOperatingSummary(base({
    currentlyOperating: true,
    regularHours: [hours('MONDAY', '11:00:00', '20:99:00')],
  }), monday), { kind: 'open', transitionDay: null, transitionTime: null });
});

test('빈 regularHours는 서버 상태만 표시한다', () => {
  assert.deepEqual(selectPlaceOperatingSummary(base(), monday),
    { kind: 'closed', transitionDay: null, transitionTime: null });
});

test('currentlyOperating과 시간표가 불일치하면 서버 상태를 우선한다', () => {
  const schedule = [hours('MONDAY', '11:00:00', '20:00:00')];
  assert.equal(selectPlaceOperatingSummary(base({ regularHours: schedule }), monday).kind, 'closed');
  assert.equal(selectPlaceOperatingSummary(base({
    currentlyOperating: true, regularHours: [hours('TUESDAY', '11:00:00', '20:00:00')],
  }), monday).kind, 'open');
});

test('한국어와 영어는 언어별 완성 문장 순서를 사용한다', () => {
  const summary = { kind: 'closed', transitionDay: 'tomorrow', transitionTime: '11:00' };
  assert.equal(formatPlaceOperatingSummary(summary, translate('ko')).fullText,
    '영업 종료 · 내일 11:00에 영업 시작');
  assert.equal(formatPlaceOperatingSummary(summary, translate('en')).fullText,
    'Closed · Opens tomorrow at 11:00');
});

test('기기 timezone 변경과 무관하게 Asia/Seoul 날짜와 요일을 사용한다', () => {
  const schedule = [hours('MONDAY', '11:00:00', '20:00:00')];
  const implicitSeoul = selectPlaceOperatingSummary(
    base({ currentlyOperating: true, regularHours: schedule }),
    monday,
  );
  const explicitSeoul = selectPlaceOperatingSummary(
    base({ currentlyOperating: true, regularHours: schedule }),
    monday,
    'Asia/Seoul',
  );
  assert.deepEqual(implicitSeoul, explicitSeoul);
  assert.equal(explicitSeoul.transitionTime, '20:00');
});
