import type { i18n as I18nInstance } from 'i18next';

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
      place: {
        eligibility: {
          ACTIVE_TRAVEL_SCHEDULE: 'Requires an active travel schedule',
          PUBLIC: 'Available to all eligible visitors',
        },
        emptyDescription: 'There are no coupons available for this place right now.',
        emptyTitle: 'No available offers',
        inventoryRemaining: '{{count}} remaining',
        inventoryUnlimited: 'No quantity limit',
        issue: 'Get coupon',
        loading: 'Loading available coupons…',
        period: 'Issue period: {{value}}',
        periodUnknown: 'Schedule unavailable',
        successDescription: 'The issued coupon is ready in your coupon wallet.',
        successTitle: 'Coupon issued',
        untitled: 'Coupon offer',
        validityDays: 'Valid for {{count}} day after issue',
        validityDays_other: 'Valid for {{count}} days after issue',
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
      place: {
        eligibility: {
          ACTIVE_TRAVEL_SCHEDULE: '진행 중인 여행 일정이 필요합니다',
          PUBLIC: '발급 가능한 방문객 모두 이용할 수 있습니다',
        },
        emptyDescription: '현재 이 장소에서 발급받을 수 있는 쿠폰이 없습니다.',
        emptyTitle: '발급 가능한 Offer가 없습니다',
        inventoryRemaining: '{{count}}개 남음',
        inventoryUnlimited: '수량 제한 없음',
        issue: '쿠폰 받기',
        loading: '발급 가능한 쿠폰을 불러오는 중…',
        period: '발급 기간: {{value}}',
        periodUnknown: '기간 정보 없음',
        successDescription: '발급된 쿠폰을 보관함에서 바로 확인할 수 있습니다.',
        successTitle: '쿠폰을 발급했습니다',
        untitled: '쿠폰 Offer',
        validityDays: '발급 후 {{count}}일 동안 사용 가능',
        validityDays_other: '발급 후 {{count}}일 동안 사용 가능',
      },
    },
  },
  ja: {
    offerCoupon: {
      error: {
        actions: {
          back: '戻る',
          retry: '再試行',
          signIn: '再度ログイン',
          viewWallet: 'マイクーポンを確認',
        },
        alreadyIssued: {
          description: 'このクーポンはすでに発行済みです。マイクーポンで確認してください。',
          title: '発行済み',
        },
        alreadyRedeemed: {
          description: 'このクーポンはすでに使用済みのため、再度使用することはできません。',
          title: '使用済み',
        },
        authentication: {
          description: 'ログインの有効期限が切れました。続けるには再度ログインしてください。',
          title: 'ログインが必要です',
        },
        expired: {
          description: 'このクーポンの利用期間は終了しました。',
          title: 'ご利用いただけません',
        },
        forbidden: {
          description: 'このアカウントには、この操作を行う権限がありません。',
          title: '権限が必要です',
        },
        generic: {
          description: 'サーバー側で問題が発生しました。しばらくしてからもう一度お試しください。',
          title: 'リクエストを完了できませんでした',
        },
        ineligible: {
          description:
            '現在、このアカウントではこの特典をご利用いただけません。有効な旅行日程が必要な場合があります。',
          title: '対象外です',
        },
        network: {
          description: 'サーバーに接続できませんでした。接続を確認して、もう一度お試しください。',
          title: '接続の問題',
        },
        notFound: {
          description: 'この特典またはクーポンはご利用いただけなくなりました。最新の一覧に戻ってください。',
          title: '見つかりません',
        },
        redeemInvalidInput: {
          description: 'クーポンを確認して、もう一度読み取ってください。',
          title: '処理できませんでした',
        },
        redeemUsedOrExpired: {
          description: 'このクーポンは使用済みか、有効期限が切れています。',
          title: 'ご利用いただけません',
        },
        soldOut: {
          description: 'この特典のクーポンはすべて配布済みです。',
          title: '配布終了',
        },
        unconfirmedConflict: {
          description:
            'この特典を発行できませんでした。すでにマイクーポンにあるか、発行が終了した可能性があります。',
          title: '発行できませんでした',
        },
        updateRequired: {
          description: 'クーポンを引き続き利用するには、最新バージョンをインストールしてください。',
          title: 'アップデートが必要です',
        },
        validation: {
          description: '一覧を読み込めませんでした。もう一度お試しください。',
          title: 'クーポンを読み込めませんでした',
        },
      },
      place: {
        eligibility: {
          ACTIVE_TRAVEL_SCHEDULE: '有効な旅行日程が必要です',
          PUBLIC: '対象の訪問者どなたでも利用できます',
        },
        emptyDescription: '現在、この場所で利用できるクーポンはありません。',
        emptyTitle: '利用できる特典がありません',
        inventoryRemaining: '残り{{count}}枚',
        inventoryUnlimited: '数量制限なし',
        issue: 'クーポンを受け取る',
        loading: '利用できるクーポンを読み込んでいます…',
        period: '発行期間：{{value}}',
        periodUnknown: '期間情報がありません',
        successDescription: '発行したクーポンはマイクーポンで確認できます。',
        successTitle: 'クーポンを発行しました',
        untitled: 'クーポン特典',
        validityDays: '発行から{{count}}日間有効',
        validityDays_other: '発行から{{count}}日間有効',
      },
    },
  },
  'zh-CN': {
    offerCoupon: {
      error: {
        actions: { back: '返回', retry: '重试', signIn: '重新登录', viewWallet: '查看我的优惠券' },
        alreadyIssued: { description: '你已领取过这张优惠券。请在优惠券包中查看。', title: '已领取' },
        alreadyRedeemed: { description: '这张优惠券已使用，无法再次使用。', title: '已使用' },
        authentication: { description: '登录已过期。请重新登录后继续。', title: '需要登录' },
        expired: { description: '这张优惠券的使用期限已结束。', title: '已无法使用' },
        forbidden: { description: '此账号没有执行该操作的权限。', title: '需要权限' },
        generic: { description: '服务器出现问题。请稍后重试。', title: '无法完成请求' },
        ineligible: { description: '此账号目前无法领取该优惠。可能需要有进行中的旅行日程。', title: '不符合领取条件' },
        network: { description: '无法连接服务器。请检查网络连接后重试。', title: '连接出现问题' },
        notFound: { description: '该优惠或优惠券已无法使用。请返回最新列表。', title: '未找到' },
        redeemInvalidInput: { description: '请确认优惠券后重新扫描。', title: '无法处理' },
        redeemUsedOrExpired: { description: '这张优惠券已使用或已过期。', title: '无法使用' },
        soldOut: { description: '该优惠的优惠券已全部领完。', title: '已领完' },
        unconfirmedConflict: { description: '无法领取该优惠。可能已在你的优惠券包中，或领取已截止。', title: '领取失败' },
        updateRequired: { description: '请安装最新版本以继续使用优惠券。', title: '需要更新' },
        validation: { description: '无法加载列表。请重试。', title: '无法加载优惠券' },
      },
      place: {
        eligibility: { ACTIVE_TRAVEL_SCHEDULE: '需要有进行中的旅行日程', PUBLIC: '所有符合条件的访客均可使用' },
        emptyDescription: '此地点目前没有可领取的优惠券。',
        emptyTitle: '暂无可领取的优惠',
        inventoryRemaining: '剩余 {{count}} 张',
        inventoryUnlimited: '数量不限',
        issue: '领取优惠券',
        loading: '正在加载可领取的优惠券…',
        period: '领取期间：{{value}}',
        periodUnknown: '暂无期间信息',
        successDescription: '已领取的优惠券可在优惠券包中立即查看。',
        successTitle: '优惠券已领取',
        untitled: '优惠券优惠',
        validityDays: '领取后 {{count}} 天内有效',
        validityDays_other: '领取后 {{count}} 天内有效',
      },
    },
  },
  'zh-TW': {
    offerCoupon: {
      error: {
        actions: { back: '返回', retry: '再試一次', signIn: '重新登入', viewWallet: '查看我的優惠券' },
        alreadyIssued: { description: '你已領取過這張優惠券。請到優惠券匣查看。', title: '已領取' },
        alreadyRedeemed: { description: '這張優惠券已使用，無法再次使用。', title: '已使用' },
        authentication: { description: '登入已過期。請重新登入後繼續。', title: '需要登入' },
        expired: { description: '這張優惠券的使用期限已結束。', title: '已無法使用' },
        forbidden: { description: '此帳號沒有執行這項操作的權限。', title: '需要權限' },
        generic: { description: '伺服器發生問題。請稍後再試。', title: '無法完成要求' },
        ineligible: { description: '此帳號目前無法領取這項優惠。可能需要有進行中的旅行行程。', title: '不符合領取條件' },
        network: { description: '無法連線到伺服器。請確認網路連線後再試一次。', title: '連線發生問題' },
        notFound: { description: '這項優惠或優惠券已無法使用。請返回最新清單。', title: '找不到項目' },
        redeemInvalidInput: { description: '請確認優惠券後重新掃描。', title: '無法處理' },
        redeemUsedOrExpired: { description: '這張優惠券已使用或已過期。', title: '無法使用' },
        soldOut: { description: '這項優惠的優惠券已全數領完。', title: '已領完' },
        unconfirmedConflict: { description: '無法領取這項優惠。可能已在你的優惠券匣中，或領取已截止。', title: '無法領取' },
        updateRequired: { description: '請安裝最新版本以繼續使用優惠券。', title: '需要更新' },
        validation: { description: '無法載入清單。請再試一次。', title: '無法載入優惠券' },
      },
      place: {
        eligibility: { ACTIVE_TRAVEL_SCHEDULE: '需要有進行中的旅行行程', PUBLIC: '所有符合條件的訪客皆可使用' },
        emptyDescription: '此地點目前沒有可領取的優惠券。',
        emptyTitle: '目前沒有可領取的優惠',
        inventoryRemaining: '剩餘 {{count}} 張',
        inventoryUnlimited: '數量不限',
        issue: '領取優惠券',
        loading: '正在載入可領取的優惠券…',
        period: '領取期間：{{value}}',
        periodUnknown: '無期間資訊',
        successDescription: '已領取的優惠券可立即在優惠券匣中查看。',
        successTitle: '已領取優惠券',
        untitled: '優惠券優惠',
        validityDays: '領取後 {{count}} 天內有效',
        validityDays_other: '領取後 {{count}} 天內有效',
      },
    },
  },
  vi: {
    offerCoupon: {
      error: {
        actions: { back: 'Quay lại', retry: 'Thử lại', signIn: 'Đăng nhập lại', viewWallet: 'Xem phiếu của tôi' },
        alreadyIssued: { description: 'Bạn đã nhận phiếu ưu đãi này rồi. Hãy xem trong ví phiếu của bạn.', title: 'Đã nhận rồi' },
        alreadyRedeemed: { description: 'Phiếu ưu đãi này đã được dùng và không thể dùng lại.', title: 'Đã sử dụng' },
        authentication: { description: 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại để tiếp tục.', title: 'Cần đăng nhập' },
        expired: { description: 'Thời hạn sử dụng của phiếu ưu đãi này đã kết thúc.', title: 'Không còn khả dụng' },
        forbidden: { description: 'Tài khoản này không có quyền thực hiện thao tác này.', title: 'Cần có quyền' },
        generic: { description: 'Đã xảy ra sự cố ở phía chúng tôi. Vui lòng thử lại sau giây lát.', title: 'Không thể hoàn tất yêu cầu' },
        ineligible: { description: 'Hiện tài khoản của bạn chưa thể nhận ưu đãi này. Có thể cần có lịch trình du lịch đang diễn ra.', title: 'Chưa đủ điều kiện' },
        network: { description: 'Không thể kết nối tới máy chủ. Hãy kiểm tra kết nối và thử lại.', title: 'Sự cố kết nối' },
        notFound: { description: 'Ưu đãi hoặc phiếu này không còn khả dụng. Hãy quay lại danh sách mới nhất.', title: 'Không tìm thấy' },
        redeemInvalidInput: { description: 'Hãy kiểm tra phiếu ưu đãi và quét lại.', title: 'Không thể xử lý' },
        redeemUsedOrExpired: { description: 'Phiếu ưu đãi này đã được dùng hoặc đã hết hạn.', title: 'Không thể sử dụng' },
        soldOut: { description: 'Tất cả phiếu của ưu đãi này đã được nhận hết.', title: 'Đã hết' },
        unconfirmedConflict: { description: 'Không thể nhận ưu đãi này. Có thể phiếu đã nằm trong ví của bạn hoặc đã hết hạn nhận.', title: 'Không thể nhận' },
        updateRequired: { description: 'Hãy cài đặt phiên bản mới nhất để tiếp tục dùng phiếu ưu đãi.', title: 'Cần cập nhật' },
        validation: { description: 'Không thể tải danh sách. Vui lòng thử lại.', title: 'Không thể tải phiếu ưu đãi' },
      },
      place: {
        eligibility: { ACTIVE_TRAVEL_SCHEDULE: 'Cần có lịch trình du lịch đang diễn ra', PUBLIC: 'Dành cho mọi khách đủ điều kiện' },
        emptyDescription: 'Hiện địa điểm này chưa có phiếu ưu đãi nào.',
        emptyTitle: 'Chưa có ưu đãi khả dụng',
        inventoryRemaining: 'Còn {{count}}',
        inventoryUnlimited: 'Không giới hạn số lượng',
        issue: 'Nhận phiếu ưu đãi',
        loading: 'Đang tải phiếu ưu đãi khả dụng…',
        period: 'Thời gian nhận: {{value}}',
        periodUnknown: 'Chưa có thông tin thời gian',
        successDescription: 'Phiếu vừa nhận đã có sẵn trong ví phiếu của bạn.',
        successTitle: 'Đã nhận phiếu ưu đãi',
        untitled: 'Ưu đãi phiếu giảm giá',
        validityDays: 'Có hiệu lực {{count}} ngày sau khi nhận',
        validityDays_other: 'Có hiệu lực {{count}} ngày sau khi nhận',
      },
    },
  },
  es: {
    offerCoupon: {
      error: {
        actions: { back: 'Volver', retry: 'Reintentar', signIn: 'Iniciar sesión de nuevo', viewWallet: 'Ver mis cupones' },
        alreadyIssued: { description: 'Ya obtuviste este cupón. Consúltalo en tus cupones.', title: 'Ya obtenido' },
        alreadyRedeemed: { description: 'Este cupón ya se usó y no se puede volver a usar.', title: 'Ya usado' },
        authentication: { description: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.', title: 'Inicio de sesión necesario' },
        expired: { description: 'El periodo de uso de este cupón terminó.', title: 'Ya no está disponible' },
        forbidden: { description: 'Esta cuenta no tiene permiso para realizar esta acción.', title: 'Permiso necesario' },
        generic: { description: 'Algo salió mal de nuestro lado. Inténtalo de nuevo en un momento.', title: 'No se pudo completar la solicitud' },
        ineligible: {
          description: 'Esta oferta no está disponible para tu cuenta en este momento. Puede que necesites un itinerario de viaje activo.',
          title: 'No cumples los requisitos',
        },
        network: { description: 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.', title: 'Problema de conexión' },
        notFound: { description: 'Esta oferta o cupón ya no está disponible. Vuelve a la lista más reciente.', title: 'No encontrado' },
        redeemInvalidInput: { description: 'Revisa el cupón e intenta escanearlo de nuevo.', title: 'No se pudo procesar' },
        redeemUsedOrExpired: { description: 'Este cupón ya se usó o venció.', title: 'No se puede usar' },
        soldOut: { description: 'Ya se obtuvieron todos los cupones de esta oferta.', title: 'Agotado' },
        unconfirmedConflict: { description: 'No se pudo emitir esta oferta. Puede que ya esté en tus cupones o que la emisión haya cerrado.', title: 'No se pudo emitir' },
        updateRequired: { description: 'Instala la versión más reciente para seguir usando cupones.', title: 'Actualización necesaria' },
        validation: { description: 'No se pudo cargar la lista. Inténtalo de nuevo.', title: 'No se pudieron cargar los cupones' },
      },
      place: {
        eligibility: {
          ACTIVE_TRAVEL_SCHEDULE: 'Requiere un itinerario de viaje activo',
          PUBLIC: 'Disponible para todos los visitantes que cumplan los requisitos',
        },
        emptyDescription: 'Por ahora no hay cupones disponibles para este lugar.',
        emptyTitle: 'No hay ofertas disponibles',
        inventoryRemaining: 'Quedan {{count}}',
        inventoryUnlimited: 'Sin límite de cantidad',
        issue: 'Obtener cupón',
        loading: 'Cargando cupones disponibles…',
        period: 'Periodo de emisión: {{value}}',
        periodUnknown: 'Periodo no disponible',
        successDescription: 'El cupón emitido ya está en tu cartera de cupones.',
        successTitle: 'Cupón emitido',
        untitled: 'Oferta de cupón',
        validityDays: 'Válido durante {{count}} día tras la emisión',
        validityDays_other: 'Válido durante {{count}} días tras la emisión',
        validityDays_many: 'Válido durante {{count}} días tras la emisión',
      },
    },
  },
  'pt-BR': {
    offerCoupon: {
      error: {
        actions: { back: 'Voltar', retry: 'Tentar novamente', signIn: 'Entrar novamente', viewWallet: 'Ver meus cupons' },
        alreadyIssued: { description: 'Você já resgatou este cupom. Confira nos seus cupons.', title: 'Já resgatado' },
        alreadyRedeemed: { description: 'Este cupom já foi usado e não pode ser usado novamente.', title: 'Já usado' },
        authentication: { description: 'Sua sessão expirou. Entre novamente para continuar.', title: 'É necessário entrar' },
        expired: { description: 'O período de uso deste cupom terminou.', title: 'Não está mais disponível' },
        forbidden: { description: 'Esta conta não tem permissão para esta ação.', title: 'Permissão necessária' },
        generic: { description: 'Algo deu errado do nosso lado. Tente novamente em instantes.', title: 'Não foi possível concluir a solicitação' },
        ineligible: {
          description: 'Esta oferta não está disponível para sua conta no momento. Pode ser necessário ter um roteiro de viagem ativo.',
          title: 'Não elegível',
        },
        network: { description: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.', title: 'Problema de conexão' },
        notFound: { description: 'Esta oferta ou cupom não está mais disponível. Volte para a lista mais recente.', title: 'Não encontrado' },
        redeemInvalidInput: { description: 'Confira o cupom e tente escanear novamente.', title: 'Não foi possível processar' },
        redeemUsedOrExpired: { description: 'Este cupom já foi usado ou expirou.', title: 'Não pode ser usado' },
        soldOut: { description: 'Todos os cupons desta oferta já foram resgatados.', title: 'Esgotado' },
        unconfirmedConflict: {
          description: 'Não foi possível emitir esta oferta. Ela talvez já esteja nos seus cupons ou a emissão foi encerrada.',
          title: 'Não foi possível emitir',
        },
        updateRequired: { description: 'Instale a versão mais recente para continuar usando cupons.', title: 'Atualização necessária' },
        validation: { description: 'Não foi possível carregar a lista. Tente novamente.', title: 'Não foi possível carregar os cupons' },
      },
      place: {
        eligibility: { ACTIVE_TRAVEL_SCHEDULE: 'Requer um roteiro de viagem ativo', PUBLIC: 'Disponível para todos os visitantes elegíveis' },
        emptyDescription: 'No momento não há cupons disponíveis para este lugar.',
        emptyTitle: 'Nenhuma oferta disponível',
        inventoryRemaining: 'Restam {{count}}',
        inventoryUnlimited: 'Sem limite de quantidade',
        issue: 'Pegar cupom',
        loading: 'Carregando cupons disponíveis…',
        period: 'Período de emissão: {{value}}',
        periodUnknown: 'Período indisponível',
        successDescription: 'O cupom emitido já está na sua carteira de cupons.',
        successTitle: 'Cupom emitido',
        untitled: 'Oferta de cupom',
        validityDays: 'Válido por {{count}} dia após a emissão',
        validityDays_other: 'Válido por {{count}} dias após a emissão',
        validityDays_many: 'Válido por {{count}} dias após a emissão',
      },
    },
  },
} as const;

export function registerOfferCouponResources(instance: I18nInstance) {
  (Object.keys(offerCouponResources) as Array<keyof typeof offerCouponResources>).forEach((language) => {
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
  const { i18n, initializeI18n } = await import('../../../../shared/i18n');
  await initializeI18n();
  registerOfferCouponResources(i18n);
}
