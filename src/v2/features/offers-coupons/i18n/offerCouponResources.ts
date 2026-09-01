import type { i18n as I18nInstance } from 'i18next';

import { i18n, initializeI18n } from '../../../shared/i18n';

/**
 * User-facing copy for Coupon/Offer error UX. Keys mirror
 * {@link OfferCouponErrorReason} so `getOfferCouponErrorUx` can build the key
 * from the resolved reason. Copy stays action-oriented and never echoes a
 * server message, coupon code, or token.
 */
export const offerCouponResources = {
  en: {
    offerCoupon: {
      error: {
        actions: {
          back: 'Go back',
          retry: 'Try again',
          signIn: 'Sign in again',
          viewWallet: 'Check my coupons',
        },
        alreadyIssued: {
          description: 'You have already issued this coupon. Check it in your coupons.',
          title: 'Already issued',
        },
        alreadyRedeemed: {
          description: 'This coupon has already been used and cannot be used again.',
          title: 'Already used',
        },
        authentication: {
          description: 'Your session has expired. Sign in again to continue.',
          title: 'Sign-in required',
        },
        expired: {
          description: 'This coupon’s usable period has ended.',
          title: 'No longer available',
        },
        forbidden: {
          description: 'This account does not have permission for this action.',
          title: 'Permission required',
        },
        generic: {
          description: 'Something went wrong on our side. Please try again in a moment.',
          title: 'Could not complete the request',
        },
        ineligible: {
          description:
            'This offer is not available for your account right now. An active travel schedule may be required.',
          title: 'Not eligible',
        },
        network: {
          description: 'We could not reach the server. Check your connection and try again.',
          title: 'Connection problem',
        },
        notFound: {
          description: 'This offer or coupon is no longer available. Return to the latest list.',
          title: 'Not found',
        },
        redeemInvalidInput: {
          description: 'Check the coupon and try scanning it again.',
          title: 'Could not process',
        },
        redeemUsedOrExpired: {
          description: 'This coupon has already been used or has expired.',
          title: 'Cannot be used',
        },
        soldOut: {
          description: 'All coupons for this offer have been claimed.',
          title: 'Sold out',
        },
        unconfirmedConflict: {
          description:
            'This offer could not be issued. It may already be in your coupons, or issuing may have closed.',
          title: 'Could not issue',
        },
        updateRequired: {
          description: 'Install the latest version to keep using coupons.',
          title: 'Update required',
        },
        validation: {
          description: 'Could not load the list. Please try again.',
          title: 'Could not load coupons',
        },
      },
    },
  },
  ko: {
    offerCoupon: {
      error: {
        actions: {
          back: '뒤로 가기',
          retry: '다시 시도',
          signIn: '다시 로그인',
          viewWallet: '보관함 확인',
        },
        alreadyIssued: {
          description: '이미 발급받은 쿠폰입니다. 보관함에서 확인해 주세요.',
          title: '이미 발급받았습니다',
        },
        alreadyRedeemed: {
          description: '이미 사용한 쿠폰이라 다시 사용할 수 없습니다.',
          title: '이미 사용했습니다',
        },
        authentication: {
          description: '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.',
          title: '로그인이 필요합니다',
        },
        expired: {
          description: '쿠폰의 사용 기간이 종료되었습니다.',
          title: '더 이상 이용할 수 없습니다',
        },
        forbidden: {
          description: '이 계정에는 해당 작업을 수행할 권한이 없습니다.',
          title: '권한이 필요합니다',
        },
        generic: {
          description: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
          title: '요청을 처리하지 못했습니다',
        },
        ineligible: {
          description:
            '지금은 이 Offer를 발급받을 수 없습니다. 진행 중인 여행 일정이 필요할 수 있습니다.',
          title: '발급 조건을 충족하지 않습니다',
        },
        network: {
          description: '서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요.',
          title: '연결에 문제가 있습니다',
        },
        notFound: {
          description: '이 Offer 또는 쿠폰을 더 이상 이용할 수 없습니다. 최신 목록으로 돌아가 주세요.',
          title: '항목을 찾을 수 없습니다',
        },
        redeemInvalidInput: {
          description: '쿠폰을 확인한 후 다시 스캔해 주세요.',
          title: '처리하지 못했습니다',
        },
        redeemUsedOrExpired: {
          description: '이미 사용되었거나 만료된 쿠폰입니다.',
          title: '사용할 수 없습니다',
        },
        soldOut: {
          description: '이 Offer의 쿠폰이 모두 소진되었습니다.',
          title: '수량이 소진되었습니다',
        },
        unconfirmedConflict: {
          description:
            '발급하지 못했습니다. 이미 보관함에 있거나 발급이 마감되었을 수 있습니다.',
          title: '발급하지 못했습니다',
        },
        updateRequired: {
          description: '쿠폰을 계속 사용하려면 최신 버전을 설치해 주세요.',
          title: '앱 업데이트가 필요합니다',
        },
        validation: {
          description: '목록을 불러오지 못했습니다. 다시 시도해 주세요.',
          title: '쿠폰을 불러오지 못했습니다',
        },
      },
    },
  },
} as const;

export function registerOfferCouponResources(instance: I18nInstance) {
  (['en', 'ko'] as const).forEach((language) => {
    instance.addResourceBundle(
      language,
      'translation',
      offerCouponResources[language],
      true,
      true,
    );
  });
}

export async function initializeOfferCouponI18n() {
  await initializeI18n();
  registerOfferCouponResources(i18n);
}
