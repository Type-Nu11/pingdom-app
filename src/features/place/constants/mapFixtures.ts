import { CategoryChipItem } from '../components/CategoryChips';
import { FashionGlyph, FoodGlyph, GameGlyph, MusicGlyph } from '../components/CategoryGlyphs';
import { HotPlace, MapMarker, MarkerPreview } from '../model/place.types';

export const mapCategories: CategoryChipItem[] = [
  { id: 'food', label: 'Food', Icon: FoodGlyph, iconWidth: 15, iconHeight: 18 },
  { id: 'music', label: 'Music', Icon: MusicGlyph, iconWidth: 13, iconHeight: 17 },
  { id: 'fashion', label: 'Fashion', Icon: FashionGlyph, iconWidth: 24, iconHeight: 18 },
  { id: 'game', label: 'Game', Icon: GameGlyph, iconWidth: 22, iconHeight: 19 },
];

export const hotPlaceFixtures: HotPlace[] = [
  { id: 'hot-1', rank: 1, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-2', rank: 2, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-3', rank: 3, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-4', rank: 4, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-5', rank: 5, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-6', rank: 6, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-7', rank: 7, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-8', rank: 8, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-9', rank: 9, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-10', rank: 10, location: 'Seoul', username: 'woo._sm' },
];

export const mapMarkerFixtures: MapMarker[] = [
  { id: 'kakao-hq-food-1', category: 'food', markerType: 'default', lat: 37.40235, lng: 127.10905 },
  { id: 'music-1', category: 'music', markerType: 'hot', lat: 35.6643, lng: 128.4137 },
  { id: 'food-1', category: 'food', markerType: 'hot', lat: 35.66455, lng: 128.41425 },
  { id: 'game-1', category: 'game', markerType: 'hot', lat: 35.66405, lng: 128.4147 },
  { id: 'fashion-1', category: 'fashion', markerType: 'default', lat: 35.66372, lng: 128.41385 },
  { id: 'music-2', category: 'music', markerType: 'default', lat: 35.66352, lng: 128.41435 },
  { id: 'food-2', category: 'food', markerType: 'default', lat: 35.66318, lng: 128.41355 },
];

export const markerPreviewFixtures: MarkerPreview[] = [
  {
    id: 'kakao-hq-food-1',
    title: '카카오 판교 아지트',
    firstRegistrant: 'ping_editor',
    locationLabel: '경기 성남시 분당구',
    updates: ['1층 라운지 좌석 확장', '주차 입구 동선 변경'],
    feeds: [
      {
        id: 'feed-kakao-1',
        caption: '점심 시간 전에 가면 자리 여유가 있어서 작업하기 좋았어요.',
        likeCount: '982',
        placeName: '카카오 판교 아지트',
        postedAt: '34분 전',
        username: 'ping_editor',
      },
      {
        id: 'feed-kakao-2',
        caption: '창가 자리 채광이 좋아서 사진 찍기에도 괜찮았습니다.',
        likeCount: '412',
        placeName: '카카오 판교 아지트',
        postedAt: '2시간 전',
        username: 'woo._sm',
      },
    ],
  },
  {
    id: 'music-1',
    title: '고양종합운동장',
    firstRegistrant: 'woo._sm',
    locationLabel: '경기 고양시 일산서구',
    updates: ['게이트 A 대기줄 길어짐', '야간 조명 포토존 추가'],
    feeds: [
      {
        id: 'feed-goyang-1',
        caption: 'You ain’t ever gonna burn my heart out So Sally can wait she knows it’s too late as we’re walkin’ on by',
        likeCount: '1.2K',
        placeName: '오아시스 내한 공연',
        postedAt: '1시간 전',
        username: 'woo._sm',
      },
      {
        id: 'feed-goyang-2',
        caption: '공연장 진입 전에 좌측 포토존 줄이 더 짧아서 거기로 가는 게 빨랐어요.',
        likeCount: '948',
        placeName: '고양종합운동장',
        postedAt: '2시간 전',
        username: 'woo._sm',
      },
      {
        id: 'feed-goyang-3',
        caption: '다른 핑도 아래로 이어서 볼 수 있게 정리하면 이 장소 카드가 더 살아나요.',
        likeCount: '837',
        placeName: '고양종합운동장',
        postedAt: '4시간 전',
        username: 'ping_note',
      },
    ],
  },
  {
    id: 'food-1',
    title: '성수 팝업 골목',
    firstRegistrant: 'jane.zip',
    locationLabel: '서울 성동구 성수동',
    updates: ['메인 입구 배너 교체', '주말 웨이팅 급증'],
    feeds: [
      {
        id: 'feed-seongsu-1',
        caption: '오픈 직후에는 한산했는데 오후 2시 넘으니 줄이 확 길어졌어요.',
        likeCount: '1.8K',
        placeName: '성수 팝업 골목',
        postedAt: '26분 전',
        username: 'jane.zip',
      },
      {
        id: 'feed-seongsu-2',
        caption: '오늘 디스플레이 구성이 조금 달라져서 재방문해도 새롭게 느껴졌습니다.',
        likeCount: '623',
        placeName: '성수 팝업 골목',
        postedAt: '3시간 전',
        username: 'min.archive',
      },
    ],
  },
  {
    id: 'game-1',
    title: '부산 e스포츠 경기장',
    firstRegistrant: 'gg_route',
    locationLabel: '부산 부산진구',
    updates: ['출입 동선 우측으로 변경', '굿즈 판매대 위치 이동'],
    feeds: [
      {
        id: 'feed-busan-1',
        caption: '경기 시작 30분 전부터 굿즈 줄이 몰리니 먼저 들르는 편이 좋아요.',
        likeCount: '771',
        placeName: '부산 e스포츠 경기장',
        postedAt: '52분 전',
        username: 'gg_route',
      },
      {
        id: 'feed-busan-2',
        caption: '좌석 시야는 좋았고 중간 휴식 시간에 포토존이 특히 붐볐어요.',
        likeCount: '388',
        placeName: '부산 e스포츠 경기장',
        postedAt: '5시간 전',
        username: 'leo.frame',
      },
    ],
  },
  {
    id: 'fashion-1',
    title: '한남 쇼룸 거리',
    firstRegistrant: 'mood.board',
    locationLabel: '서울 용산구 한남동',
    updates: ['신규 쇼윈도 연출 적용', '외부 대기 라인 정비'],
    feeds: [
      {
        id: 'feed-hannam-1',
        caption: '해 질 무렵 외관 조명이 예뻐서 사진 찍기 가장 좋았어요.',
        likeCount: '694',
        placeName: '한남 쇼룸 거리',
        postedAt: '1시간 전',
        username: 'mood.board',
      },
      {
        id: 'feed-hannam-2',
        caption: '거리 전체 톤이 정리돼서 이전보다 훨씬 고급스럽게 느껴졌습니다.',
        likeCount: '502',
        placeName: '한남 쇼룸 거리',
        postedAt: '6시간 전',
        username: 'woo._sm',
      },
    ],
  },
  {
    id: 'music-2',
    title: '홍대 라이브홀',
    firstRegistrant: 'setlist.day',
    locationLabel: '서울 마포구 서교동',
    updates: ['스탠딩 존 바리케이드 조정', '포스터 월 교체'],
    feeds: [
      {
        id: 'feed-hongdae-1',
        caption: '스탠딩 중앙보다 뒤쪽이 동선이 편해서 공연 보기 좋았습니다.',
        likeCount: '856',
        placeName: '홍대 라이브홀',
        postedAt: '43분 전',
        username: 'setlist.day',
      },
      {
        id: 'feed-hongdae-2',
        caption: '입구 포스터 월이 바뀌어서 인증샷 포인트가 더 깔끔해졌어요.',
        likeCount: '267',
        placeName: '홍대 라이브홀',
        postedAt: '7시간 전',
        username: 'cam.log',
      },
    ],
  },
  {
    id: 'food-2',
    title: '연남 디저트 거리',
    firstRegistrant: 'sweet.map',
    locationLabel: '서울 마포구 연남동',
    updates: ['시즌 한정 메뉴 시작', '테라스 좌석 재배치'],
    feeds: [
      {
        id: 'feed-yeonnam-1',
        caption: '오후 늦게 가면 햇살이 예쁘게 들어와서 사진이 잘 나와요.',
        likeCount: '531',
        placeName: '연남 디저트 거리',
        postedAt: '1시간 전',
        username: 'sweet.map',
      },
      {
        id: 'feed-yeonnam-2',
        caption: '테라스 자리 간격이 넓어져서 이전보다 훨씬 여유롭게 느껴졌습니다.',
        likeCount: '201',
        placeName: '연남 디저트 거리',
        postedAt: '9시간 전',
        username: 'mint.route',
      },
    ],
  },
];
