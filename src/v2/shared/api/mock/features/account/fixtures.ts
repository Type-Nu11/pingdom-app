import type {
  GoogleAccountResponse,
  GoogleLinkStartResponse,
  UserDataExport,
} from '../../../../../features/account/model/account.types';

export const googleLinkStartFixture: GoogleLinkStartResponse = {
  authorizationUrl: '/oauth2/authorization/google',
  message: 'Google 계정 연결을 시작합니다.',
  provider: 'GOOGLE',
};

export const googleUnlinkedFixture: GoogleAccountResponse = {
  linked: false,
  message: 'Google 계정 연결을 해제했습니다.',
  provider: 'GOOGLE',
};

export const userDataExportFixture: UserDataExport = {
  bookmarks: [],
  likedMapImageIds: [],
  merchantPlaceClaims: [],
  touristCoupons: [],
  touristOffers: [],
  travelSchedules: [],
  user: { id: 1, profileImageUrl: null, username: 'mock-user' },
};
