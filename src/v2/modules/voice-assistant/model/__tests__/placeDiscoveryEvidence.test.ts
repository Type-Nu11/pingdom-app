import { findDiscoveryEvidence } from '../placeDiscoveryEvidence';

test.each([
  ['갈비탕', '진한 국물의 갈비탕'], ['파스타', '토마토 파스타'], ['buffet', 'Breakfast Buffet'],
  ['도자기', '도자기 원데이 클래스'], ['암벽등반', '실내 암벽등반 강습'],
  ['swimming pool', 'Indoor swimming   pool'], ['プール', '屋内プール'], ['游泳池', '室内游泳池'],
  ['A+B', 'A+B 체험권'], ['[클래스]', '[클래스] 수업 안내'],
])('고정된 음식·시설 목록 없이 %s의 실제 문구를 찾는다', (term, value) => {
  expect(findDiscoveryEvidence([null, value], [term])).toBe(value.replace(/\s+/g, ' '));
});

test.each([
  ['갈비탕', '갈비탕은 판매하지 않습니다'], ['수영장', '수영장이 없는 시설'], ['호텔', '호텔 미운영'],
  ['spaghetti', 'We do not serve spaghetti'], ['pool', 'No pool available'], ['spa', 'Spaghetti restaurant'],
  ['プール', 'プールなし'], ['游泳池', '没有游泳池'], ['A+B', 'AAB 체험권'],
])('%s의 부정문·일부 문자열을 근거로 사용하지 않는다', (term, value) => {
  expect(findDiscoveryEvidence([value], [term])).toBeUndefined();
});
