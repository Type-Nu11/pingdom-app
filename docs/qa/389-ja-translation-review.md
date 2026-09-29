# #389 일본어 번역 검수 대상 키

> 상태: **기계 번역 초안 · 사람 검수 필요**. 이 문서의 모든 ja 문구는 검수 전이다.
> 문체: です/ます체. 용어: 검증/verify → 「認証」, 재시도 → 「再試行」, 브랜드 PingDom·Pingdy·ピンディ.
> 우선 검수: 「우선」 열이 채워진 키(접근성 label, 오류·복구 안내, 정책·삭제 문구).
> 생성 기준: `src/v2/app/i18n/resources.ts`의 조립 카탈로그, 키 1443개.

| 영역 | 키 수 |
|---|---:|
| `mapTutorial` | 29 |
| `offerCoupon` | 49 |
| `reservation` | 133 |
| `community` | 100 |
| `visitVerification` | 75 |
| `voiceAssistant` | 85 |
| `selectLanguage` | 9 |
| `selectCountry` | 4 |
| `selectAge` | 3 |
| `selectGender` | 6 |
| `countries` | 6 |
| `loginForeign` | 3 |
| `experience` | 41 |
| `auth` | 52 |
| `common` | 42 |
| `placeMenu` | 13 |
| `examplePlaces` | 7 |
| `merchant` | 2 |
| `onboarding` | 43 |
| `map` | 278 |
| `notificationSettings` | 51 |
| `offer` | 23 |
| `payment` | 6 |
| `myPage` | 103 |
| `settings` | 163 |
| `merchantMyPage` | 34 |
| `placeDetail` | 31 |
| `placeOffers` | 41 |
| `placeStatus` | 4 |
| `placeSupport` | 3 |
| `placeTrust` | 4 |

## `mapTutorial`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `mapTutorial.name` | Pingdi | 핑디 | ピンディ |
|  | `mapTutorial.title` | Meet Pingdi | 핑디 사용 안내 | ピンディの使い方 |
|  | `mapTutorial.guest` | traveler | 여행자 | 旅行者 |
|  | `mapTutorial.close` | Close tutorial | 튜토리얼 닫기 | チュートリアルを閉じる |
|  | `mapTutorial.previous` | Previous tip | 이전 안내 | 前の案内 |
|  | `mapTutorial.next` | Next tip | 다음 안내 | 次の案内 |
|  | `mapTutorial.finish` | Finish tutorial | 튜토리얼 완료 | チュートリアルを完了 |
|  | `mapTutorial.progress` | Step {{current}} of {{total}} | {{current}} / {{total}} 단계 | {{current}} / {{total}} ステップ |
|  | `mapTutorial.welcome.greeting` | Hello, {{username}}! | 안녕하세요, {{username}}님 | こんにちは、{{username}}さん |
|  | `mapTutorial.welcome.introduction` | Here to make your travels easier, | {{username}}님의 여행을 더 쉽게 만들어드리는 | {{username}}さんの旅をもっと気軽にする |
|  | `mapTutorial.welcome.agent` | I’m <accent>Pingdi</accent>, your AI agent. | AI 에이전트, <accent>핑디</accent>예요. | AIエージェントの<accent>ピンディ</accent>です。 |
|  | `mapTutorial.welcome.help` | From finding places to preparing reservations,<br>I can help with a conversation. | 원하는 장소를 찾고, 예약을 준비하는 과정까지<br>대화 한번으로 도와드릴게요. | 行きたい場所探しから予約の準備まで、<br>会話ひとつでお手伝いします。 |
|  | `mapTutorial.welcome.start` | Let me give you a quick tour! | 지금부터 간단히 사용법을 알려드릴게요! | それでは、簡単に使い方をご紹介します！ |
|  | `mapTutorial.map.prompt` | Tap the <accent>Map button</accent>. | <accent>지도 버튼</accent>을 눌러보세요. | <accent>地図ボタン</accent>をタップしてください。 |
|  | `mapTutorial.map.body` | Discover pins around you, plus popular places<br>in your area and across the country. | 내 주변의 핑들을 확인할 수 있어요.<br>또한 우리 지역과 전국 트렌드 장소도 볼 수 있어요. | 周辺のピンを確認できます。<br>地域や全国の人気スポットも見られます。 |
|  | `mapTutorial.favorites.prompt` | Tap the <accent>Favorites button</accent>. | <accent>즐겨찾기 버튼</accent>을 눌러보세요. | <accent>お気に入りボタン</accent>をタップしてください。 |
|  | `mapTutorial.favorites.body` | Save places you’re interested in<br>and find them again whenever you like. | 관심 있는 장소를 즐겨찾기에 저장하고,<br>언제든 다시 찾아볼 수 있어요. | 気になる場所をお気に入りに保存して、<br>いつでも見返せます。 |
|  | `mapTutorial.community.prompt` | Tap the <accent>Community button</accent>. | <accent>커뮤니티 버튼</accent>을 눌러보세요. | <accent>コミュニティボタン</accent>をタップしてください。 |
|  | `mapTutorial.community.body` | Explore other travelers’ experiences,<br>and tag places to share your own stories. | 다른 여행자들의 생생한 장소 경험을 확인하고,<br>장소를 태그해 나만의 이야기도 공유할 수 있어요. | ほかの旅行者の体験をのぞいたり、<br>場所をタグ付けして自分の体験を共有できます。 |
|  | `mapTutorial.reservations.prompt` | Tap the <accent>Reservations button</accent>. | <accent>예약 버튼</accent>을 눌러보세요. | <accent>予約ボタン</accent>をタップしてください。 |
|  | `mapTutorial.reservations.body` | Check availability at the places you love<br>and book a date and time that works for you. | 원하는 장소의 예약 가능 여부를 확인하고,<br>날짜와 시간에 맞춰 간편하게 예약할 수 있어요. | お気に入りの場所の空き状況を確認し、<br>都合のよい日時で予約できます。 |
|  | `mapTutorial.recommendations.prompt` | Tap the <accent>Recommendations button</accent>. | <accent>장소 추천 버튼</accent>을 눌러보세요. | <accent>おすすめボタン</accent>をタップしてください。 |
|  | `mapTutorial.recommendations.body` | {{username}}, discover personalized places<br>based on your interests and activity. | {{username}}님의 관심사와 이용 상황을 바탕으로<br>개인화된 장소 추천을 받을 수 있어요. | {{username}}さんの興味や行動に合わせた<br>おすすめスポットを見つけられます。 |
|  | `mapTutorial.verification.prompt` | Tap the <accent>Verify button</accent>. | <accent>검증하기 버튼</accent>을 눌러보세요. | <accent>認証ボタン</accent>をタップしてください。 |
|  | `mapTutorial.verification.body` | Review the places you’ve visited<br>and verify your experience to help<br>other travelers visit with confidence. | 직접 방문한 장소의 경험을 리뷰로 남기고,<br>다른 여행자들이 믿고 방문할 수 있도록<br>장소를 검증해주세요. | 訪れた場所を振り返って体験を認証し、<br>ほかの旅行者が安心して<br>訪れられるようにしましょう。 |
|  | `mapTutorial.categories.prompt` | Tap a <accent>category</accent>. | <accent>카테고리</accent>를 눌러보세요. | <accent>カテゴリー</accent>をタップしてください。 |
|  | `mapTutorial.categories.body` | Choose food, music, or another category<br>to see only the pins that match. | 음식점, 음악 등 원하는 카테고리를 선택하면<br>해당하는 핑들만 골라서 확인할 수 있어요. | グルメや音楽などのカテゴリーを選ぶと、<br>該当するピンだけを表示できます。 |
|  | `mapTutorial.profile.prompt` | Tap <accent>My Page</accent>. | <accent>마이페이지</accent>를 눌러보세요. | <accent>マイページ</accent>をタップしてください。 |
|  | `mapTutorial.profile.body` | Manage your profile and travel dates,<br>and browse the places you’ve verified. | 내 프로필과 여행 기간을 관리하고,<br>내가 직접 검증한 장소들을 모아 볼 수 있어요. | プロフィールや旅行日程を管理し、<br>認証した場所を確認できます。 |

## `offerCoupon`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
| 오류 | `offerCoupon.error.actions.back` | Go back | 뒤로 가기 | 戻る |
| 오류 | `offerCoupon.error.actions.retry` | Try again | 다시 시도 | 再試行 |
| 오류 | `offerCoupon.error.actions.signIn` | Sign in again | 다시 로그인 | 再度ログイン |
| 오류 | `offerCoupon.error.actions.viewWallet` | Check my coupons | 보관함 확인 | マイクーポンを確認 |
| 오류 | `offerCoupon.error.alreadyIssued.description` | You have already issued this coupon. Check it in your coupons. | 이미 발급받은 쿠폰입니다. 보관함에서 확인해 주세요. | このクーポンはすでに発行済みです。マイクーポンで確認してください。 |
| 오류 | `offerCoupon.error.alreadyIssued.title` | Already issued | 이미 발급받았습니다 | 発行済み |
| 오류 | `offerCoupon.error.alreadyRedeemed.description` | This coupon has already been used and cannot be used again. | 이미 사용한 쿠폰이라 다시 사용할 수 없습니다. | このクーポンはすでに使用済みのため、再度使用することはできません。 |
| 오류 | `offerCoupon.error.alreadyRedeemed.title` | Already used | 이미 사용했습니다 | 使用済み |
| 오류 | `offerCoupon.error.authentication.description` | Your session has expired. Sign in again to continue. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | ログインの有効期限が切れました。続けるには再度ログインしてください。 |
| 오류 | `offerCoupon.error.authentication.title` | Sign-in required | 로그인이 필요합니다 | ログインが必要です |
| 오류 | `offerCoupon.error.expired.description` | This coupon’s usable period has ended. | 쿠폰의 사용 기간이 종료되었습니다. | このクーポンの利用期間は終了しました。 |
| 오류 | `offerCoupon.error.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | ご利用いただけません |
| 오류 | `offerCoupon.error.forbidden.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | このアカウントには、この操作を行う権限がありません。 |
| 오류 | `offerCoupon.error.forbidden.title` | Permission required | 권한이 필요합니다 | 権限が必要です |
| 오류 | `offerCoupon.error.generic.description` | Something went wrong on our side. Please try again in a moment. | 서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. | サーバー側で問題が発生しました。しばらくしてからもう一度お試しください。 |
| 오류 | `offerCoupon.error.generic.title` | Could not complete the request | 요청을 처리하지 못했습니다 | リクエストを完了できませんでした |
| 오류 | `offerCoupon.error.ineligible.description` | This offer is not available for your account right now. An active travel schedule may be required. | 지금은 이 Offer를 발급받을 수 없습니다. 진행 중인 여행 일정이 필요할 수 있습니다. | 現在、このアカウントではこの特典をご利用いただけません。有効な旅行日程が必要な場合があります。 |
| 오류 | `offerCoupon.error.ineligible.title` | Not eligible | 발급 조건을 충족하지 않습니다 | 対象外です |
| 오류 | `offerCoupon.error.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | サーバーに接続できませんでした。接続を確認して、もう一度お試しください。 |
| 오류 | `offerCoupon.error.network.title` | Connection problem | 연결에 문제가 있습니다 | 接続の問題 |
| 오류 | `offerCoupon.error.notFound.description` | This offer or coupon is no longer available. Return to the latest list. | 이 Offer 또는 쿠폰을 더 이상 이용할 수 없습니다. 최신 목록으로 돌아가 주세요. | この特典またはクーポンはご利用いただけなくなりました。最新の一覧に戻ってください。 |
| 오류 | `offerCoupon.error.notFound.title` | Not found | 항목을 찾을 수 없습니다 | 見つかりません |
| 오류 | `offerCoupon.error.redeemInvalidInput.description` | Check the coupon and try scanning it again. | 쿠폰을 확인한 후 다시 스캔해 주세요. | クーポンを確認して、もう一度読み取ってください。 |
| 오류 | `offerCoupon.error.redeemInvalidInput.title` | Could not process | 처리하지 못했습니다 | 処理できませんでした |
| 오류 | `offerCoupon.error.redeemUsedOrExpired.description` | This coupon has already been used or has expired. | 이미 사용되었거나 만료된 쿠폰입니다. | このクーポンは使用済みか、有効期限が切れています。 |
| 오류 | `offerCoupon.error.redeemUsedOrExpired.title` | Cannot be used | 사용할 수 없습니다 | ご利用いただけません |
| 오류 | `offerCoupon.error.soldOut.description` | All coupons for this offer have been claimed. | 이 Offer의 쿠폰이 모두 소진되었습니다. | この特典のクーポンはすべて配布済みです。 |
| 오류 | `offerCoupon.error.soldOut.title` | Sold out | 수량이 소진되었습니다 | 配布終了 |
| 오류 | `offerCoupon.error.unconfirmedConflict.description` | This offer could not be issued. It may already be in your coupons, or issuing may have closed. | 발급하지 못했습니다. 이미 보관함에 있거나 발급이 마감되었을 수 있습니다. | この特典を発行できませんでした。すでにマイクーポンにあるか、発行が終了した可能性があります。 |
| 오류 | `offerCoupon.error.unconfirmedConflict.title` | Could not issue | 발급하지 못했습니다 | 発行できませんでした |
| 오류 | `offerCoupon.error.updateRequired.description` | Install the latest version to keep using coupons. | 쿠폰을 계속 사용하려면 최신 버전을 설치해 주세요. | クーポンを引き続き利用するには、最新バージョンをインストールしてください。 |
| 오류 | `offerCoupon.error.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | アップデートが必要です |
| 오류 | `offerCoupon.error.validation.description` | Could not load the list. Please try again. | 목록을 불러오지 못했습니다. 다시 시도해 주세요. | 一覧を読み込めませんでした。もう一度お試しください。 |
| 오류 | `offerCoupon.error.validation.title` | Could not load coupons | 쿠폰을 불러오지 못했습니다 | クーポンを読み込めませんでした |
|  | `offerCoupon.place.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Requires an active travel schedule | 진행 중인 여행 일정이 필요합니다 | 有効な旅行日程が必要です |
|  | `offerCoupon.place.eligibility.PUBLIC` | Available to all eligible visitors | 발급 가능한 방문객 모두 이용할 수 있습니다 | 対象の訪問者どなたでも利用できます |
|  | `offerCoupon.place.emptyDescription` | There are no coupons available for this place right now. | 현재 이 장소에서 발급받을 수 있는 쿠폰이 없습니다. | 現在、この場所で利用できるクーポンはありません。 |
|  | `offerCoupon.place.emptyTitle` | No available offers | 발급 가능한 Offer가 없습니다 | 利用できる特典がありません |
|  | `offerCoupon.place.inventoryRemaining` | {{count}} remaining | {{count}}개 남음 | 残り{{count}}枚 |
|  | `offerCoupon.place.inventoryUnlimited` | No quantity limit | 수량 제한 없음 | 数量制限なし |
|  | `offerCoupon.place.issue` | Get coupon | 쿠폰 받기 | クーポンを受け取る |
|  | `offerCoupon.place.loading` | Loading available coupons… | 발급 가능한 쿠폰을 불러오는 중… | 利用できるクーポンを読み込んでいます… |
|  | `offerCoupon.place.period` | Issue period: {{value}} | 발급 기간: {{value}} | 発行期間：{{value}} |
|  | `offerCoupon.place.periodUnknown` | Schedule unavailable | 기간 정보 없음 | 期間情報がありません |
|  | `offerCoupon.place.successDescription` | The issued coupon is ready in your coupon wallet. | 발급된 쿠폰을 보관함에서 바로 확인할 수 있습니다. | 発行したクーポンはマイクーポンで確認できます。 |
|  | `offerCoupon.place.successTitle` | Coupon issued | 쿠폰을 발급했습니다 | クーポンを発行しました |
|  | `offerCoupon.place.untitled` | Coupon offer | 쿠폰 Offer | クーポン特典 |
|  | `offerCoupon.place.validityDays` | Valid for {{count}} day after issue | 발급 후 {{count}}일 동안 사용 가능 | 発行から{{count}}日間有効 |
|  | `offerCoupon.place.validityDays_other` | Valid for {{count}} days after issue | 발급 후 {{count}}일 동안 사용 가능 | 発行から{{count}}日間有効 |

## `reservation`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `reservation.common.back` | Go back | 뒤로 가기 | 戻る |
|  | `reservation.common.favorites` | Favorites | 즐겨찾기 | お気に入り |
|  | `reservation.common.map` | Map | 지도 | 地図 |
|  | `reservation.common.recommendations` | Place recommendations | 장소추천 | 場所のおすすめ |
|  | `reservation.common.reservations` | Reservations | 예약 | 予約 |
|  | `reservation.box.count` | {{count}} reservations | 보유 예약 {{count}}건 | 予約{{count}}件 |
|  | `reservation.box.empty` | No reservations yet. | 아직 예약 내역이 없어요. | まだ予約がありません。 |
| 오류 | `reservation.box.error` | Could not load your reservations. | 예약함을 불러오지 못했어요. | 予約を読み込めませんでした。 |
|  | `reservation.box.loading` | Loading reservations… | 예약함을 불러오는 중이에요… | 予約を読み込んでいます… |
|  | `reservation.box.productIcon` | R | R | R |
|  | `reservation.box.settings` | Open settings | 설정 열기 | 設定を開く |
|  | `reservation.box.title` | Reservations | 예약함 | 予約 |
|  | `reservation.create.availabilityEmpty` | No availability has been published for this place. | 이 장소에 등록된 예약 가능 일정이 없습니다. | この場所で公開されている空き枠はありません。 |
| 오류 | `reservation.create.availabilityError` | Could not load availability. | 예약 가능 일정을 불러오지 못했습니다. | 空き状況を読み込めませんでした。 |
|  | `reservation.create.availabilityLoading` | Loading availability… | 예약 가능 일정을 불러오는 중이에요… | 空き状況を読み込んでいます… |
|  | `reservation.create.afternoon` | PM | 오후 | 午後 |
|  | `reservation.create.available` | Available | 가능 | 予約可能 |
| 접근성 | `reservation.create.availableDateLabel` | {{date}}, available | {{date}}, 예약 가능 | {{date}}、予約可能 |
| 접근성 | `reservation.create.availableDateCapacityLabel` | {{date}}, {{count}} spots remaining | {{date}}, 잔여 {{count}}명 | {{date}}、残り{{count}}名 |
|  | `reservation.create.backToMap` | Go back | 돌아가기 | 戻る |
| 오류 | `reservation.create.booker.errors.nameRequired` | Enter the booker name. | 예약자 이름을 입력해 주세요. | 予約者名を入力してください。 |
| 오류 | `reservation.create.booker.errors.nameTooLong` | Use 100 characters or fewer. | 100자 이내로 입력해 주세요. | 100文字以内で入力してください。 |
| 오류 | `reservation.create.booker.errors.noteTooLong` | Use 500 characters or fewer. | 500자 이내로 입력해 주세요. | 500文字以内で入力してください。 |
| 오류 | `reservation.create.booker.errors.phoneInvalid` | Use digits and + ( ) - spaces only. | 숫자와 + ( ) - 공백만 입력할 수 있어요. | 数字と + ( ) - 、スペースのみ使用できます。 |
| 오류 | `reservation.create.booker.errors.phoneRequired` | Enter a contact number. | 연락처를 입력해 주세요. | 連絡先を入力してください。 |
| 오류 | `reservation.create.booker.errors.phoneTooLong` | Use 30 characters or fewer. | 30자 이내로 입력해 주세요. | 30文字以内で入力してください。 |
|  | `reservation.create.booker.name` | Booker name | 예약자 이름 | 予約者名 |
|  | `reservation.create.booker.namePlaceholder` | Name for the reservation | 예약자 이름 | 予約時のお名前 |
|  | `reservation.create.booker.note` | Requests | 요청 사항 | ご要望 |
|  | `reservation.create.booker.noteOptional` | Optional | 선택 | 任意 |
|  | `reservation.create.booker.notePlaceholder` | Anything the place should know | 장소에 전달할 요청 사항 | お店に伝えたいことがあれば入力してください |
|  | `reservation.create.booker.phone` | Contact number | 연락처 | 連絡先 |
|  | `reservation.create.booker.phonePlaceholder` | Phone number | 전화번호 | 電話番号 |
|  | `reservation.create.booker.title` | Booker details | 예약자 정보 | 予約者情報 |
|  | `reservation.create.date` | Select date | 날짜 선택 | 日付を選択 |
|  | `reservation.create.loadingPlace` | Loading place | 장소 불러오는 중 | 場所を読み込んでいます |
|  | `reservation.create.morning` | AM | 오전 | 午前 |
|  | `reservation.create.nextMonth` | Next month | 다음 달 | 翌月 |
|  | `reservation.create.noCapacityForQuantity` | No current times can accommodate {{count}} guests. Review the published schedule and unavailable reasons below. | 현재 {{count}}명이 예약 가능한 시간은 없습니다. 아래에서 등록된 일정과 예약 불가 사유를 확인해 주세요. | 現在、{{count}}名で予約できる時間帯がありません。下の公開スケジュールと予約できない理由をご確認ください。 |
|  | `reservation.create.noTimes` | No available times for this date. | 선택한 날짜에 예약 가능한 시간이 없습니다. | この日に予約できる時間はありません。 |
|  | `reservation.create.noTimesInPeriod` | No times are available in this period. | 선택한 시간대에 등록된 일정이 없습니다. | この時間帯に予約できる時間はありません。 |
|  | `reservation.create.people` | Guests | 인원 선택 | 人数 |
|  | `reservation.create.peopleCount` | {{count}} | {{count}}명 | {{count}} |
|  | `reservation.create.peopleRange` | Booking for 1–12 guests · {{category}} | 예약인원: 1~12명 · {{category}} | 1〜12名で予約 · {{category}} |
|  | `reservation.create.previousMonth` | Previous month | 이전 달 | 前月 |
|  | `reservation.create.productInfoUnavailable` | This item can't be reserved right now because its product details are unavailable. | 상품 정보를 불러올 수 없어 현재 예약할 수 없습니다. | 商品情報を確認できないため、現在この項目は予約できません。 |
|  | `reservation.create.retry` | Try again | 다시 시도 | 再試行 |
|  | `reservation.create.requestNote` | Request (optional) | 요청사항 (선택) | ご要望（任意） |
|  | `reservation.create.requestNotePlaceholder` | Add anything the venue should know | 장소에 전달할 내용을 입력하세요 | お店に伝えたいことがあれば入力してください |
|  | `reservation.create.scheduled` | Scheduled | 일정 있음 | スケジュールあり |
| 접근성 | `reservation.create.scheduledDateLabel` | {{date}}, schedules published | {{date}}, 일정 있음 | {{date}}、スケジュール公開中 |
|  | `reservation.create.selectAvailableDate` | Select an available date. | 예약 가능한 날짜를 선택해 주세요. | 予約可能な日付を選択してください。 |
|  | `reservation.create.selectedWindow` | Selected date & time | 선택한 일시 | 選択した日時 |
|  | `reservation.create.slotAvailable` | {{count}} spots remaining · Available | 잔여 {{count}}명 · 예약 가능 | 残り{{count}}名 · 予約可能 |
|  | `reservation.create.slotInactive` | Unavailable · Inactive | 예약 불가 · 비활성 일정 | 予約不可 · 受付停止中 |
|  | `reservation.create.slotInsufficient` | {{count}} spots remaining · Not enough capacity | 잔여 {{count}}명 · 인원 부족 | 残り{{count}}名 · 定員不足 |
|  | `reservation.create.slotPast` | Unavailable · Time has passed | 예약 불가 · 지난 시간 | 予約不可 · 時間が過ぎています |
|  | `reservation.create.submit` | Reserve | 예약하기 | 予約する |
| 오류 | `reservation.create.submitAccountError` | Only an active tourist account can make a reservation. | 활성화된 일반 사용자 계정만 예약할 수 있습니다. | 予約は有効な旅行者アカウントでのみ行えます。 |
| 오류 | `reservation.create.submitAvailabilityError` | This schedule is no longer available. Select another schedule. | 더 이상 예약할 수 없는 일정입니다. 다른 일정을 선택해 주세요. | このスケジュールはご利用いただけなくなりました。別のスケジュールを選択してください。 |
| 오류 | `reservation.create.submitCapacityError` | There are not enough spots remaining. Check the updated availability. | 잔여 인원이 부족합니다. 갱신된 일정을 확인해 주세요. | 残りの定員が足りません。最新の空き状況を確認してください。 |
|  | `reservation.create.submitConflict` | That time was just filled or closed. Pick another slot. | 해당 시간이 방금 마감되었어요. 다른 시간을 선택해 주세요. | その時間はちょうど満席または受付終了になりました。別の時間を選択してください。 |
| 오류 | `reservation.create.submitError` | Could not submit the reservation. Please try again. | 예약을 접수하지 못했습니다. 다시 시도해 주세요. | 予約を送信できませんでした。もう一度お試しください。 |
| 오류 | `reservation.create.submitNetworkError` | We could not confirm your reservation. Check your reservations before submitting again. | 예약 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 예약함을 확인해 주세요. | 予約の結果を確認できませんでした。再度送信する前に予約一覧を確認してください。 |
| 오류 | `reservation.create.submitValidationError` | Check the highlighted fields and try again. | 표시된 항목을 확인하고 다시 시도해 주세요. | 表示された項目を確認して、もう一度お試しください。 |
|  | `reservation.create.successDescription` | You can check the confirmation status in Reservations. | 예약함에서 확정 상태를 확인할 수 있습니다. | 確定状況は予約一覧で確認できます。 |
|  | `reservation.create.successTitle` | Reservation requested | 예약 요청이 접수되었습니다 | 予約をリクエストしました |
|  | `reservation.create.time` | Select schedule | 시간 선택 | スケジュールを選択 |
|  | `reservation.create.title` | Reserve | 예약하기 | 予約する |
| 접근성 | `reservation.create.unavailableDateLabel` | {{date}}, unavailable | {{date}}, 예약 불가 | {{date}}、予約不可 |
|  | `reservation.create.unknownReservationType` | This reservation type isn't supported yet, so it can't be reserved. | 지원하지 않는 예약 유형이라 현재 예약할 수 없습니다. | この予約タイプはまだサポートされていないため、予約できません。 |
|  | `reservation.create.weekdays.fri` | F | 금 | 金 |
|  | `reservation.create.weekdays.mon` | M | 월 | 月 |
|  | `reservation.create.weekdays.sat` | S | 토 | 土 |
|  | `reservation.create.weekdays.sun` | S | 일 | 日 |
|  | `reservation.create.weekdays.thu` | T | 목 | 木 |
|  | `reservation.create.weekdays.tue` | T | 화 | 火 |
|  | `reservation.create.weekdays.wed` | W | 수 | 水 |
|  | `reservation.create.windowPending` | The date and time will be shared once confirmed. | 예약 일시는 확정 후 안내됩니다. | 日時は確定後にお知らせします。 |
|  | `reservation.detail.bookerHidden` | Hidden | 비공개 | 非表示 |
|  | `reservation.detail.bookerName` | Booker | 예약자 | 予約者 |
|  | `reservation.detail.bookerPhone` | Contact | 연락처 | 連絡先 |
|  | `reservation.detail.identifier` | Reservation ID | 예약 식별자 | 予約番号 |
|  | `reservation.detail.loading` | Loading reservation details | 예약 상세를 불러오는 중이에요 | 予約の詳細を読み込んでいます |
|  | `reservation.detail.noRequestNote` | No requests | 요청 사항 없음 | ご要望なし |
|  | `reservation.detail.paymentAmount` | Minor amount and currency: {{value}} | 최소 화폐 단위 금액·통화: {{value}} | 最小単位の金額と通貨：{{value}} |
|  | `reservation.detail.paymentFailure` | Failure code: {{value}} | 실패 코드: {{value}} | 失敗コード：{{value}} |
|  | `reservation.detail.paymentIdentifier` | Payment #{{id}} | 결제 번호 {{id}} | 決済 #{{id}} |
|  | `reservation.detail.paymentProvider` | Provider: {{value}} | 결제 제공자: {{value}} | 決済事業者：{{value}} |
|  | `reservation.detail.payments` | Payments | 결제 내역 | 決済 |
|  | `reservation.detail.paymentsEmptyDescription` | This is a normal state until a payment is created. | 결제가 생성되기 전에는 정상적으로 비어 있을 수 있어요. | 決済が作成されるまでは正常な状態です。 |
|  | `reservation.detail.paymentsEmptyTitle` | No payment history | 결제 내역이 없어요 | 決済履歴がありません |
|  | `reservation.detail.paymentsLoading` | Loading payments | 결제 내역을 불러오는 중이에요 | 決済を読み込んでいます |
|  | `reservation.detail.productType` | Product type | 상품 유형 | 商品タイプ |
|  | `reservation.detail.quantity` | Quantity | 예약 수량 | 数量 |
|  | `reservation.detail.requestNote` | Requests | 요청 사항 | ご要望 |
|  | `reservation.detail.reservationWindow` | Reserved date & time | 예약 일시 | 予約日時 |
|  | `reservation.detail.status` | Status | 예약 상태 | ステータス |
|  | `reservation.detail.title` | Reservation details | 예약 상세 | 予約の詳細 |
|  | `reservation.detail.windowPending` | Shared once confirmed | 확정 후 안내 | 確定後にお知らせします |
|  | `reservation.list.available` | Bookable | 예약 가능 | 予約可能 |
|  | `reservation.list.distanceFar` | {{kilometers}} km away | 여기서 {{kilometers}}km | ここから{{kilometers}}km |
|  | `reservation.list.distanceNear` | {{meters}} m away | 여기서 {{kilometers}}km | ここから{{meters}}m |
|  | `reservation.list.card.createdAt` | Requested at | 접수 일시 | 受付日時 |
|  | `reservation.list.card.detail` | View reservation details  › | 예약 상세 보기  › | 予約の詳細を見る  › |
|  | `reservation.list.card.eyebrow` | My reservation | 내 예약 | マイ予約 |
| 접근성 | `reservation.list.card.hint` | Opens reservation details | 예약 상세 화면으로 이동합니다 | 予約の詳細を開きます |
|  | `reservation.list.card.label` | Reservation {{id}}, {{status}} | 예약 {{id}}, {{status}} | 予約 {{id}}、{{status}} |
|  | `reservation.list.card.number` | Reservation #{{id}} | 예약 번호 {{id}} | 予約 #{{id}} |
|  | `reservation.list.card.productType` | Product type | 상품 유형 | 商品タイプ |
|  | `reservation.list.card.quantity` | Quantity | 예약 수량 | 数量 |
|  | `reservation.list.card.quantityValue` | {{count}} guest(s) | {{count}}명 예약 | {{count}}名 |
|  | `reservation.list.card.reservationWindow` | Reserved for | 예약 일시 | 予約日時 |
|  | `reservation.list.card.reservationWindowValue` | Reserved {{value}} | {{value}} 예약 | 予約日時 {{value}} |
|  | `reservation.list.card.requestedAtValue` | Requested {{value}} | {{value}} 접수 | 受付 {{value}} |
|  | `reservation.list.card.windowPending` | Shared once confirmed | 확정 후 안내 | 確定後にお知らせします |
|  | `reservation.list.emptyDescription` | Find a place you like on the map. | 지도에서 마음에 드는 장소를 찾아보세요. | 地図でお気に入りの場所を見つけてみましょう。 |
|  | `reservation.list.emptyTitle` | No reservations yet | 아직 예약 내역이 없어요 | まだ予約がありません |
| 오류 | `reservation.list.error` | Could not load reservations | 예약을 불러오지 못했어요 | 予約を読み込めませんでした |
|  | `reservation.list.loading` | Loading reservations | 예약을 불러오는 중이에요 | 予約を読み込んでいます |
|  | `reservation.list.nearbySubtitle` | Discover places currently accepting reservations! | 현재 예약 가능 장소를 찾아드려요! | 現在予約を受け付けている場所を見つけましょう！ |
|  | `reservation.list.nearbyEmpty` | No nearby bookable places are available right now. | 현재 위치 주변에 예약 가능한 장소가 없어요. | 現在、近くに予約できる場所はありません。 |
|  | `reservation.list.nearbyLoading` | Finding nearby bookable places… | 주변 예약 가능 장소를 찾는 중이에요… | 近くの予約できる場所を探しています… |
|  | `reservation.list.nearbyTitle` | Reservations near your current location | 현재 위치 주변 예약 | 現在地周辺の予約 |
|  | `reservation.list.panelAdjust` | Resize reservation panel | 예약 패널 크기 조절 | 予約パネルのサイズを調整 |
| 접근성 | `reservation.list.previewLabel` | {{name}} reservation preview | {{name}} 예약 미리보기 | {{name}}の予約プレビュー |
|  | `reservation.list.retry` | Try again | 다시 시도 | 再試行 |
|  | `reservation.list.savedTitle` | Saved reservations | 예약함 | 保存した予約 |
|  | `reservation.list.statuses.canceled` | Canceled | 취소됨 | キャンセル済み |
|  | `reservation.list.statuses.confirmed` | Confirmed | 예약 확정 | 確定 |
|  | `reservation.list.statuses.pending` | Pending confirmation | 확정 대기 | 確定待ち |
|  | `reservation.list.statuses.rejected` | Rejected | 거절됨 | 拒否 |
|  | `reservation.list.statuses.unknown` | Status needs review | 상태 확인 필요 | 状態の確認が必要です |

## `community`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `community.title` | Community | 커뮤니티 | コミュニティ |
|  | `community.categories.all` | All | 전체 | すべて |
|  | `community.categories.spot` | Spots | 스팟 | スポット |
|  | `community.categories.diary` | Diary | 다이어리 | 日記 |
|  | `community.categories.ledger` | Expenses | 가계부 | 家計簿 |
|  | `community.sheetAdjust` | Adjust community panel | 커뮤니티 패널 조절 | コミュニティパネルのサイズを調整 |
|  | `community.write` | Write | 작성하기 | 投稿する |
|  | `community.moreOptions` | More options | 더보기 | その他のオプション |
|  | `community.notInterested` | Not interested | 관심없음 | 興味なし |
|  | `community.report` | Report | 신고하기 | 報告する |
|  | `community.empty` | No posts yet | 아직 게시글이 없어요 | まだ投稿がありません |
|  | `community.author` | woo_sm | woo_sm | woo_sm |
|  | `community.like` | Like | 좋아요 | いいね |
|  | `community.comment` | Comment | 댓글 | コメント |
|  | `community.list.loading` | Loading posts… | 게시글을 불러오는 중… | 投稿を読み込んでいます… |
| 오류 | `community.list.nextPageError` | Couldn't load more posts. | 게시글을 더 불러오지 못했어요. | 投稿をさらに読み込めませんでした。 |
|  | `community.list.nextPageRetry` | Retry | 다시 시도 | 再試行 |
|  | `community.detail.back` | Back | 뒤로 | 戻る |
|  | `community.detail.settings` | Post options | 게시글 옵션 | 投稿のオプション |
|  | `community.detail.placeTagPrefix` | View place | 장소 보기 | 場所を見る |
| 정책 | `community.detail.placeDeleted` | This place was removed | 삭제된 장소예요 | この場所は削除されました |
| 접근성 | `community.detail.placeCard.a11yLabel` | Connected place, {{name}} | 연결 장소, {{name}} | 関連する場所、{{name}} |
| 접근성 | `community.detail.placeCard.a11yHint` | Opens the place detail | 장소 상세로 이동 | 場所の詳細を開きます |
| 접근성 | `community.detail.placeCard.announceFailure` | Couldn't open this place. | 장소를 열지 못했어요. | この場所を開けませんでした。 |
| 오류 | `community.detail.placeCard.errors.unavailable` | This place can't be opened right now. | 장소를 불러올 수 없어요 | 現在この場所を開くことができません。 |
| 접근성 | `community.detail.comments.headerLabel` | Comments | 댓글 | コメント |
|  | `community.detail.comments.loading` | Loading comments… | 댓글을 불러오는 중… | コメントを読み込んでいます… |
|  | `community.detail.comments.empty` | No comments yet. Be the first to leave one! | 아직 댓글이 없어요. 첫 댓글을 남겨보세요! | まだコメントがありません。最初のコメントを残してみましょう！ |
| 오류 | `community.detail.comments.errorRetry` | Retry | 다시 시도 | 再試行 |
| 오류 | `community.detail.comments.nextPageError` | Couldn't load more comments. | 댓글을 더 불러오지 못했어요. | コメントをさらに読み込めませんでした。 |
|  | `community.detail.comments.nextPageRetry` | Retry | 다시 시도 | 再試行 |
|  | `community.detail.comments.loadMore` | Show {{count}} more comments | 댓글 {{count}}개 더 보기 | コメントをさらに{{count}}件表示 |
| 접근성 | `community.detail.comments.a11yLabel` | {{author}}, {{time}}, {{content}} | {{author}}, {{time}}, {{content}} | {{author}}、{{time}}、{{content}} |
| 접근성 | `community.detail.comments.announceSuccess` | Your comment was posted. | 댓글이 등록되었어요. | コメントを投稿しました。 |
| 접근성 | `community.detail.comments.announceFailure` | Your comment failed to post. | 댓글 등록에 실패했어요. | コメントを投稿できませんでした。 |
|  | `community.detail.like.count_one` | Like {{count}} | 좋아요 {{count}} | いいね {{count}} |
|  | `community.detail.like.count_other` | Like {{count}} | 좋아요 {{count}} | いいね {{count}} |
| 접근성 | `community.detail.like.a11yLabel_one` | Like, {{count}} | 좋아요, {{count}}개 | いいね、{{count}}件 |
| 접근성 | `community.detail.like.a11yLabel_other` | Like, {{count}} | 좋아요, {{count}}개 | いいね、{{count}}件 |
| 접근성 | `community.detail.like.hintLike` | Double tap to like | 두 번 탭하여 좋아요 | ダブルタップでいいね |
| 접근성 | `community.detail.like.hintUnlike` | Double tap to unlike | 두 번 탭하여 좋아요 취소 | ダブルタップでいいねを取り消す |
| 접근성 | `community.detail.like.retryLabel` | Retry | 다시 시도 | 再試行 |
| 접근성 | `community.detail.like.announceLiked` | Liked. | 좋아요를 눌렀어요. | いいねしました。 |
| 접근성 | `community.detail.like.announceUnliked` | Like removed. | 좋아요를 취소했어요. | いいねを取り消しました。 |
| 접근성 | `community.detail.like.announceFailure` | Something went wrong. Please try again. | 문제가 발생했어요. 다시 시도해 주세요. | 問題が発生しました。もう一度お試しください。 |
|  | `community.detail.commentInput.label` | Write a comment | 댓글 입력 | コメントを書く |
|  | `community.detail.commentInput.placeholder` | Leave a comment | 댓글을 남겨주세요 | コメントを入力 |
|  | `community.detail.commentInput.send` | Post comment | 댓글 등록 | コメントを投稿 |
|  | `community.detail.commentInput.sendBusy` | Posting comment… | 댓글 등록 중… | コメントを投稿しています… |
|  | `community.detail.commentInput.counter` | {{count}}/{{max}} | {{count}}/{{max}} | {{count}}/{{max}} |
| 오류 | `community.detail.commentInput.validation.required` | Enter a comment. | 댓글 내용을 입력해 주세요. | コメントを入力してください。 |
| 오류 | `community.detail.commentInput.validation.tooLong` | Comments must be 1,000 characters or fewer. | 댓글은 1,000자 이하로 입력해 주세요. | コメントは1,000文字以内で入力してください。 |
| 오류 | `community.detail.commentInput.errors.networkDuplicateWarning` | If the comment already went through, check the list before retrying. | 이미 댓글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | コメントがすでに投稿されている可能性があります。再試行する前に一覧を確認してください。 |
| 오류 | `community.detail.commentInput.errors.retry` | Retry | 다시 시도 | 再試行 |
| 오류 | `community.detail.commentInput.errors.signIn` | Sign in again | 다시 로그인 | 再度ログイン |
| 오류 | `community.detail.commentInput.errors.postNotFound` | This post couldn't be found. It may have been removed. | 게시글을 찾을 수 없어요. 삭제되었을 수 있어요. | 投稿が見つかりませんでした。削除された可能性があります。 |
|  | `community.write_screen.title` | Write a post | 글 작성하기 | 投稿を作成 |
|  | `community.write_screen.back` | Cancel | 취소 | キャンセル |
| 접근성 | `community.write_screen.categoryLabel` | Category | 카테고리 | カテゴリー |
| 접근성 | `community.write_screen.categoryHint` | Choose the category that fits your post | 글에 맞는 카테고리를 선택해주세요 | 投稿に合ったカテゴリーを選択してください |
| 접근성 | `community.write_screen.titleLabel` | Post | 글 작성 | 投稿 |
|  | `community.write_screen.titlePlaceholder` | Enter a title | 제목을 입력해주세요. | タイトルを入力 |
| 접근성 | `community.write_screen.bodyLabel` | Content | 내용 | 本文 |
|  | `community.write_screen.bodyPlaceholder` | Share your story with the community | 본문을 입력해주세요. | コミュニティにあなたの体験を共有しましょう |
|  | `community.write_screen.guideText` | Posts with abuse, defamation, or ads may be removed under our policy | 욕설·비방·광고성 글은 운영 정책에 따라 삭제될 수 있어요 | 誹謗中傷・名誉毀損・広告を含む投稿は、ポリシーにより削除される場合があります |
|  | `community.write_screen.photoSection` | Photos | 사진 첨부 | 写真 |
|  | `community.write_screen.photoCount` | Up to {{count}} photos | 최대 {{count}}장까지 첨부할 수 있어요 | 最大{{count}}枚 |
|  | `community.write_screen.addPhotos` | Add photos | 사진 추가 | 写真を追加 |
|  | `community.write_screen.placeTagTitle` | Place tag | 장소 태그 | 場所タグ |
| 접근성 | `community.write_screen.placeTagHint` | Tell us which place this post is about | 어떤 장소에 대한 글인지 알려주세요 | どの場所についての投稿か教えてください |
|  | `community.write_screen.placeTagOptional` | (optional) | (선택) | （任意） |
|  | `community.write_screen.placeTagRequired` | (required) | (필수) | （必須） |
|  | `community.write_screen.addPlace` | Add place | 장소 추가 | 場所を追加 |
|  | `community.write_screen.removePlace` | Remove {{name}} | {{name}} 삭제 | {{name}}を削除 |
|  | `community.write_screen.submit` | Post | 등록하기 | 投稿 |
|  | `community.write_screen.submitBusy` | Posting… | 등록 중… | 投稿しています… |
|  | `community.write_screen.titleCounter` | {{count}}/{{max}} | {{count}}/{{max}} | {{count}}/{{max}} |
|  | `community.write_screen.contentCounter` | {{count}}/{{max}} | {{count}}/{{max}} | {{count}}/{{max}} |
| 오류 | `community.write_screen.validation.titleRequired` | Enter a title. | 제목을 입력해 주세요. | タイトルを入力してください。 |
| 오류 | `community.write_screen.validation.titleTooLong` | Title must be 50 characters or fewer. | 제목은 50자 이하로 입력해 주세요. | タイトルは50文字以内で入力してください。 |
| 오류 | `community.write_screen.validation.bodyRequired` | Enter content. | 내용을 입력해 주세요. | 本文を入力してください。 |
| 오류 | `community.write_screen.validation.contentTooLong` | Content must be 5,000 characters or fewer. | 내용은 5,000자 이하로 입력해 주세요. | 本文は5,000文字以内で入力してください。 |
| 오류 | `community.write_screen.validation.tagRequired` | Choose at least one category. | 카테고리를 하나 이상 선택해 주세요. | カテゴリーを1つ以上選択してください。 |
| 오류 | `community.write_screen.validation.categoryRequired` | Choose a category. | 카테고리를 선택해 주세요. | カテゴリーを選択してください。 |
| 오류 | `community.write_screen.validation.placeRequired` | Add at least one place for the Place category. | 장소 카테고리는 장소를 1개 이상 선택해야 해요. | スポットカテゴリーでは場所を1つ以上追加してください。 |
|  | `community.write_screen.placePicker.close` | Close | 닫기 | 閉じる |
|  | `community.write_screen.placePicker.placeholder` | Search for a place | 장소를 검색해 주세요 | 場所を検索 |
|  | `community.write_screen.placePicker.prompt` | Search for a registered place to tag | 태그할 등록된 장소를 검색해 주세요 | タグ付けする登録済みの場所を検索してください |
|  | `community.write_screen.placePicker.empty` | No matching places found | 검색 결과가 없어요 | 一致する場所が見つかりません |
| 오류 | `community.write_screen.placePicker.error` | Couldn't load places. | 장소를 불러오지 못했어요. | 場所を読み込めませんでした。 |
|  | `community.write_screen.placePicker.retry` | Retry | 다시 시도 | 再試行 |
|  | `community.write_screen.placePicker.disabled` | Place search is unavailable right now | 지금은 장소 검색을 사용할 수 없어요 | 現在、場所検索はご利用いただけません |
| 오류 | `community.write_screen.errors.placeNotFound` | One of the connected places couldn't be found. Remove it and choose another. | 연결한 장소 중 하나를 찾을 수 없어요. 삭제하고 다시 선택해 주세요. | 関連する場所の一部が見つかりませんでした。削除して別の場所を選択してください。 |
| 오류 | `community.write_screen.errors.networkDuplicateWarning` | If the post already went through, check the list before retrying. | 이미 게시글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | 投稿がすでに完了している可能性があります。再試行する前に一覧を確認してください。 |
| 오류 | `community.write_screen.errors.retry` | Retry | 다시 시도 | 再試行 |
| 오류 | `community.write_screen.errors.signIn` | Sign in again | 다시 로그인 | 再度ログイン |
|  | `community.write_screen.discard.title` | Discard this post? | 작성 중인 내용을 삭제할까요? | この投稿を破棄しますか？ |
|  | `community.write_screen.discard.body` | What you've written won't be saved. | 지금까지 작성한 내용이 저장되지 않아요. | 入力した内容は保存されません。 |
|  | `community.write_screen.discard.cancel` | Keep editing | 계속 작성 | 編集を続ける |
|  | `community.write_screen.discard.confirm` | Discard | 삭제 | 破棄 |

## `visitVerification`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `visitVerification.addPhotos` | Add photos | 사진 선택 | 写真を追加 |
|  | `visitVerification.back` | Back | 뒤로 | 戻る |
|  | `visitVerification.distanceKm` | {{value}}km | {{value}}km | {{value}}km |
|  | `visitVerification.distanceMeters` | {{value}}m | {{value}}m | {{value}}m |
|  | `visitVerification.emptyDescription` | We could not find a place you can verify from your current location. Check your location and try again. | 현재 위치에서 검증할 수 있는 장소를 찾지 못했어요<br>현재 위치를 다시 확인해주세요 | 現在地から認証できる場所が見つかりませんでした。位置情報を確認して、もう一度お試しください。 |
|  | `visitVerification.emptyTitle` | No places nearby to verify! | 근처에 검증할 장소가 없어요! | 近くに認証できる場所がありません！ |
| 오류 | `visitVerification.errorTitle` | Could not load recent visits | 최근 방문을 불러오지 못했어요 | 最近の訪問を読み込めませんでした |
|  | `visitVerification.permissionDenied` | Allow photo library access in Settings to attach photos. | 사진을 첨부하려면 설정에서 사진 접근 권한을 허용해 주세요. | 写真を添付するには、設定で写真ライブラリへのアクセスを許可してください。 |
|  | `visitVerification.permissionTitle` | Location access is off | 위치 권한이 꺼져 있어요 | 位置情報へのアクセスがオフです |
|  | `visitVerification.locationPermissionDenied` | Allow location access to find places eligible for verification near you. | 주변에서 검증 가능한 장소를 찾으려면 위치 접근 권한을 허용해 주세요. | 近くの認証できる場所を探すには、位置情報へのアクセスを許可してください。 |
|  | `visitVerification.photoCount` | {{count}}/3 | {{count}}/3 | {{count}}/3 |
| 정책 | `visitVerification.photoDelete` | Remove photo {{index}} | {{index}}번째 사진 삭제 | 写真{{index}}を削除 |
|  | `visitVerification.photoSection` | Attach photos | 사진 첨부 | 写真を添付 |
| 오류 | `visitVerification.placeError` | Could not load this place. | 장소 정보를 불러오지 못했어요. | この場所を読み込めませんでした。 |
|  | `visitVerification.placeLoading` | Loading place information... | 장소 정보를 불러오는 중이에요... | 場所の情報を読み込んでいます... |
|  | `visitVerification.placePhoto` | {{name}} photo {{index}} | {{name}} 사진 {{index}} | {{name}}の写真{{index}} |
|  | `visitVerification.reasonHelp` | Select up to 5 | 최대 5개 선택 | 最大5つまで選択 |
|  | `visitVerification.reasonSection` | Recommendation reasons | 추천 이유 | おすすめの理由 |
|  | `visitVerification.reasons.clean` | Clean store | 매장이 깨끗해요 | お店が清潔 |
|  | `visitVerification.reasons.delicious` | Delicious | 맛있어요 | おいしい |
|  | `visitVerification.reasons.easyToFind` | Easy to find | 찾기 쉬워요 | 見つけやすい |
|  | `visitVerification.reasons.kind` | Friendly | 친절해요 | 親切 |
|  | `visitVerification.reasons.multilingual` | Good multilingual descriptions | 다국어 설명이 잘 되어 있어요 | 多言語の説明が充実 |
|  | `visitVerification.reasons.parking` | Easy parking | 주차하기 편해요 | 駐車しやすい |
|  | `visitVerification.reasons.photoSpot` | Great for photos | 사진 찍기 좋아요 | 写真映えする |
|  | `visitVerification.recentVisits` | Recent visits | 최근 방문 | 最近の訪問 |
|  | `visitVerification.retry` | Try again | 다시 시도 | 再試行 |
|  | `visitVerification.return` | Go back | 돌아가기 | 戻る |
|  | `visitVerification.reviewPlaceholder` | Tell others what you liked about this place. | 다른 사람들에게 이 장소의 좋은 점을 알려주세요. | この場所のよかった点を教えてください。 |
|  | `visitVerification.reviewSection` | Write a review | 후기 작성 | レビューを書く |
|  | `visitVerification.submit` | Verify | 검증하기 | 認証する |
|  | `visitVerification.uploading` | Uploading photos... | 사진 업로드 중 | 写真をアップロードしています... |
| 오류 | `visitVerification.errors.unsupportedFormat` | Choose a JPEG or PNG photo. HEIC is not supported. | JPEG 또는 PNG 사진을 선택해 주세요. HEIC 형식은 지원하지 않아요. | JPEGまたはPNGの写真を選択してください。HEICには対応していません。 |
| 오류 | `visitVerification.errors.fileTooLarge` | This photo is too large. Choose a smaller photo. | 사진 용량이 너무 커요. 더 작은 사진을 선택해 주세요. | 写真のサイズが大きすぎます。より小さい写真を選択してください。 |
| 오류 | `visitVerification.errors.unauthenticated` | Sign in again to submit your review. | 후기를 제출하려면 다시 로그인해 주세요. | レビューを送信するには、再度ログインしてください。 |
| 오류 | `visitVerification.errors.forbidden` | You do not have permission to submit this review or photo. | 이 후기 또는 사진을 제출할 권한이 없어요. | このレビューまたは写真を送信する権限がありません。 |
| 오류 | `visitVerification.errors.serverUnavailable` | The service is temporarily unavailable. Try again later. | 서비스를 일시적으로 이용할 수 없어요. 잠시 후 다시 시도해 주세요. | サービスを一時的にご利用いただけません。しばらくしてからもう一度お試しください。 |
| 오류 | `visitVerification.errors.network` | Check your connection and try again. Your draft is preserved. | 네트워크를 확인한 뒤 다시 시도해 주세요. 작성 내용은 유지돼요. | 接続を確認して、もう一度お試しください。下書きは保持されています。 |
| 오류 | `visitVerification.errors.submitFailed` | Could not submit your review. Your draft is preserved. Try again. | 후기를 제출하지 못했어요. 작성 내용은 유지돼요. 다시 시도해 주세요. | レビューを送信できませんでした。下書きは保持されています。もう一度お試しください。 |
|  | `visitVerification.submitting` | Submitting... | 제출 중 | 送信しています... |
|  | `visitVerification.title` | Verify | 검증하기 | 認証する |
|  | `visitVerification.session.ambiguousPlace` | More than one place can be verified here. Move closer to one place and try again. | 현재 위치에서 여러 장소가 확인돼요. 한 장소에 더 가까이 이동한 뒤 다시 시도해 주세요. | ここでは複数の場所を認証できます。いずれかの場所に近づいて、もう一度お試しください。 |
|  | `visitVerification.session.completionMissing` | Verification did not include the completed check-in. This visit cannot be treated as complete. | 완료된 체크인 정보가 없어 방문 완료로 처리할 수 없어요. | 認証結果にチェックイン完了の情報が含まれていません。この訪問は完了として扱えません。 |
|  | `visitVerification.session.distance` | Latest distance: {{value}}m | 최근 거리: {{value}}m | 最新の距離：{{value}}m |
|  | `visitVerification.session.dwell` | Required stay: {{value}} seconds | 요구 체류 시간: {{value}}초 | 必要な滞在時間：{{value}}秒 |
|  | `visitVerification.session.foregroundBlocked` | Verification is paused. Return to the app to resume from the server status. | 인증이 일시 중지됐어요. 앱으로 돌아오면 서버 상태부터 복구해요. | 認証が一時停止しています。アプリに戻ると、サーバーの状態から再開します。 |
|  | `visitVerification.session.inactiveTourist` | Visit verification is available only to an active tourist account. | 활성 관광객 계정만 방문 인증을 이용할 수 있어요. | 訪問認証は、有効な旅行者アカウントでのみご利用いただけます。 |
|  | `visitVerification.session.invalidObservation` | The location observation was rejected. Check your GPS signal and device time, then try again. | 위치 관측이 거절됐어요. GPS 신호와 기기 시간을 확인한 뒤 다시 시도해 주세요. | 位置情報の測定結果が却下されました。GPSの受信状態と端末の時刻を確認して、もう一度お試しください。 |
|  | `visitVerification.session.locating` | Checking your location... | 위치를 확인하는 중이에요... | 現在地を確認しています... |
| 오류 | `visitVerification.session.locationFailed` | Could not read your current location. Check permission and GPS, then try again. | 현재 위치를 확인하지 못했어요. 위치 권한과 GPS를 확인한 뒤 다시 시도해 주세요. | 現在地を取得できませんでした。権限とGPSを確認して、もう一度お試しください。 |
| 오류 | `visitVerification.session.networkError` | A network error interrupted verification. This visit has not been completed. | 네트워크 오류로 인증이 중단됐어요. 방문 완료로 처리되지 않았어요. | ネットワークエラーにより認証が中断されました。この訪問は完了していません。 |
|  | `visitVerification.session.noPlace` | There is no open verification place at your current location. | 현재 위치에는 운영 중인 인증 대상 장소가 없어요. | 現在地に認証を受け付けている場所がありません。 |
|  | `visitVerification.session.permissionDenied` | Location permission is required to verify this visit. | 방문 인증에는 위치 권한이 필요해요. | この訪問を認証するには位置情報の権限が必要です。 |
|  | `visitVerification.session.progress` | Verification in progress | 인증 진행 중 | 認証中 |
|  | `visitVerification.session.radius` | Allowed radius: {{value}}m | 허용 반경: {{value}}m | 許可範囲：{{value}}m |
|  | `visitVerification.session.ready` | Start only while you are at this place. | 이 장소에 머무는 동안에만 시작해 주세요. | この場所にいるときだけ開始してください。 |
|  | `visitVerification.session.recovering` | Restoring the verification session from the server... | 서버에서 진행 중인 인증 상태를 복구하는 중이에요... | サーバーから認証セッションを復元しています... |
|  | `visitVerification.session.remaining_one` | {{count}} second remaining | 남은 시간: {{count}}초 | 残り{{count}}秒 |
|  | `visitVerification.session.remaining_other` | {{count}} seconds remaining | 남은 시간: {{count}}초 | 残り{{count}}秒 |
|  | `visitVerification.session.start` | Start visit verification | 방문 인증 시작 | 訪問認証を開始 |
|  | `visitVerification.session.starting` | Starting verification session... | 인증 세션을 시작하는 중이에요... | 認証セッションを開始しています... |
| 오류 | `visitVerification.session.serverError` | Could not verify the visit because of a server error. Try again. | 서버 오류로 방문을 인증하지 못했어요. 다시 시도해 주세요. | サーバーエラーのため訪問を認証できませんでした。もう一度お試しください。 |
|  | `visitVerification.session.status.COMPLETED` | Visit verified | 인증 완료 | 訪問を認証しました |
|  | `visitVerification.session.status.EXPIRED` | Verification session expired | 세션 만료 | 認証セッションの有効期限が切れました |
|  | `visitVerification.session.status.IN_PROGRESS` | Verification in progress | 인증 진행 중 | 認証中 |
|  | `visitVerification.session.status.PROXIMITY_LOST` | You left the allowed radius | 반경 이탈 | 許可範囲の外に出ました |
|  | `visitVerification.session.status.REJECTED` | Verification rejected | 인증 거절 | 認証が却下されました |
|  | `visitVerification.session.status.STARTED` | Verification started | 인증 시작됨 | 認証を開始しました |
|  | `visitVerification.session.title` | Visit verification | 방문 인증 | 訪問認証 |
|  | `visitVerification.session.unauthenticated` | Sign in again to verify this visit. | 방문을 인증하려면 다시 로그인해 주세요. | この訪問を認証するには、再度ログインしてください。 |
|  | `visitVerification.session.verifiedDwell` | Verified stay: {{value}} seconds | 인증된 체류 시간: {{value}}초 | 認証された滞在時間：{{value}}秒 |
|  | `visitVerification.unknownCategory` | Place | 장소 | 場所 |
| 오류 | `visitVerification.validation.contentRequired` | Write a review before submitting. | 후기를 작성해 주세요. | 送信する前にレビューを書いてください。 |
| 오류 | `visitVerification.validation.contentTooLong` | Your review must be 2,000 characters or fewer. | 후기는 2,000자 이하로 작성해 주세요. | レビューは2,000文字以内で入力してください。 |
| 오류 | `visitVerification.validation.reasonRequired` | Select at least one recommendation reason. | 추천 이유를 한 개 이상 선택해 주세요. | おすすめの理由を1つ以上選択してください。 |

## `voiceAssistant`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `voiceAssistant.command.submission` | After 5 seconds without speech, recognized voice input is sent to the AI server automatically. Text input is sent when you use Send. Exact coordinates are used only by the existing place lookup. | 음성 입력은 5초 동안 말하지 않으면 인식된 내용을 AI 서버에 자동 전송합니다. 텍스트 입력은 보내기를 누르면 전송합니다. 정확한 현재 좌표는 기존 장소 조회에만 사용합니다. | 音声入力は、5秒間話さないと認識した内容をAIサーバーへ自動で送信します。テキスト入力は「送信」をタップすると送信されます。正確な現在地の座標は、既存の場所検索にのみ使用します。 |
|  | `voiceAssistant.command.introTitle` | Before using AI | AI 사용 안내 | AIご利用前のご案内 |
|  | `voiceAssistant.command.introContinue` | Continue to AI | 확인하고 시작하기 | 確認して始める |
|  | `voiceAssistant.command.introClose` | Close | 닫기 | 閉じる |
|  | `voiceAssistant.command.timezone` | Request timezone: {{timezone}} | 요청 시간대: {{timezone}} | リクエストのタイムゾーン：{{timezone}} |
|  | `voiceAssistant.command.processing` | Checking place information. | 장소 정보를 확인하고 있습니다. | 場所の情報を確認しています。 |
|  | `voiceAssistant.command.canceled` | Voice session ended. | 음성 세션을 종료했습니다. | 音声セッションを終了しました。 |
|  | `voiceAssistant.command.advisory` | Assistant response received. | 어시스턴트 응답을 받았습니다. | アシスタントの応答を受け取りました。 |
|  | `voiceAssistant.command.bounded` | Results checked among up to 12 nearby candidates. | 가까운 후보 최대 12곳에서 조건을 확인한 결과입니다. | 近くの候補最大12か所で条件を確認した結果です。 |
|  | `voiceAssistant.command.empty` | No matching results among the checked candidates. | 조회한 후보에 조건과 일치하는 결과가 없습니다. | 確認した候補に条件と一致する結果がありません。 |
|  | `voiceAssistant.command.slots` | Actual server intervals. These do not confirm product bookability or a reservation. | 서버의 실제 이용 시간입니다. 상품의 예약 가능 여부나 예약 확정을 의미하지 않습니다. | サーバー上の実際の利用時間です。商品の予約可否や予約の確定を意味するものではありません。 |
|  | `voiceAssistant.command.general` | General admission | 일반 이용 | 一般利用 |
|  | `voiceAssistant.command.capacity` | Remaining capacity: {{count}} | 남은 정원: {{count}}명 | 残りの定員：{{count}}名 |
| 오류 | `voiceAssistant.command.failed` | The request could not be completed. Check your conditions and try again. | 요청을 완료하지 못했습니다. 조건을 확인하고 다시 시도해 주세요. | リクエストを完了できませんでした。条件を確認して、もう一度お試しください。 |
|  | `voiceAssistant.command.retry` | Try again | 다시 시도 | 再試行 |
|  | `voiceAssistant.command.resultSummary` | I found {{count}} place(s). The first result is “{{name}}”. | {{count}}곳을 찾았어요. 첫 번째 결과는 ‘{{name}}’이에요. | {{count}}か所見つかりました。最初の結果は「{{name}}」です。 |
|  | `voiceAssistant.command.showOnMap` | View on map | 지도에서 보기 | 地図で見る |
|  | `voiceAssistant.command.directions` | Directions | 길찾기 | 経路案内 |
|  | `voiceAssistant.command.share` | Share | 공유 | 共有 |
|  | `voiceAssistant.command.operating.OPERATING` | Operating | 운영 중 | 営業中 |
|  | `voiceAssistant.command.operating.TEMPORARILY_CLOSED` | Temporarily closed | 임시 휴업 | 臨時休業 |
|  | `voiceAssistant.command.operating.PERMANENTLY_CLOSED` | Permanently closed | 폐업 | 閉業 |
|  | `voiceAssistant.command.fields.touristCategory` | Specify a place category. | 장소 카테고리를 알려 주세요. | 場所のカテゴリーを教えてください。 |
|  | `voiceAssistant.command.fields.date` | Confirm the requested date. | 조회할 날짜를 확인해 주세요. | 検索する日付を確認してください。 |
|  | `voiceAssistant.command.fields.timeRange` | Confirm the timezone and start/end times. | 시간대와 시작·종료 시간을 확인해 주세요. | タイムゾーンと開始・終了時刻を確認してください。 |
|  | `voiceAssistant.command.fields.quantity` | Specify the number of people. | 인원을 알려 주세요. | 人数を教えてください。 |
|  | `voiceAssistant.command.fields.useCurrentLocation` | Confirm current location use and permission. | 현재 위치 사용 여부와 위치 권한을 확인해 주세요. | 現在地を使用するかどうかと位置情報の権限を確認してください。 |
|  | `voiceAssistant.command.fields.placeId` | Choose a place from the retrieved results. | 조회 결과에서 장소를 선택해 주세요. | 検索結果から場所を選択してください。 |
|  | `voiceAssistant.command.fields.availabilityId` | Choose a retrieved time slot. | 조회한 이용 시간을 선택해 주세요. | 検索した利用時間を選択してください。 |
| 오류 | `voiceAssistant.command.errors.LOCATION_REQUIRED` | Current location and location permission are required. | 현재 위치와 위치 권한이 필요합니다. | 現在地と位置情報の権限が必要です。 |
| 오류 | `voiceAssistant.command.errors.ID_NOT_IN_CONTEXT` | Search again or select a verified place. | 장소를 다시 검색하거나 선택해 주세요. | 場所をもう一度検索するか、選択してください。 |
| 오류 | `voiceAssistant.command.errors.STALE_CONTEXT` | Your context changed. Submit a new request. | 조건이 변경되었습니다. 다시 요청해 주세요. | 条件が変更されました。もう一度リクエストしてください。 |
| 오류 | `voiceAssistant.command.errors.CANCELED` | Request canceled. | 요청이 취소되었습니다. | リクエストはキャンセルされました。 |
| 오류 | `voiceAssistant.command.errors.TIMEOUT` | The lookup timed out. | 조회 시간이 초과되었습니다. | 検索がタイムアウトしました。 |
| 오류 | `voiceAssistant.command.errors.AUTHENTICATION_REQUIRED` | Sign in to continue. | 로그인이 필요합니다. | ログインが必要です。 |
| 오류 | `voiceAssistant.command.errors.FORBIDDEN` | This request is not currently supported or allowed. | 현재 지원하지 않거나 허용되지 않는 요청입니다. | 現在サポートされていない、または許可されていないリクエストです。 |
| 오류 | `voiceAssistant.command.errors.NOT_FOUND` | Information was not found. | 정보를 찾을 수 없습니다. | 情報が見つかりません。 |
| 오류 | `voiceAssistant.command.errors.RATE_LIMITED` | Too many requests. Try again later. | 요청이 많습니다. 잠시 후 다시 시도해 주세요. | リクエストが集中しています。しばらくしてからもう一度お試しください。 |
| 오류 | `voiceAssistant.command.errors.NETWORK_ERROR` | Check your network connection. | 네트워크 연결을 확인해 주세요. | ネットワーク接続を確認してください。 |
| 오류 | `voiceAssistant.command.errors.SERVER_ERROR` | The server is unavailable. Try again. | 서버에 연결할 수 없습니다. 다시 시도해 주세요. | サーバーに接続できません。もう一度お試しください。 |
| 오류 | `voiceAssistant.command.errors.INVALID_SERVER_RESPONSE` | The server information could not be verified. | 서버 정보를 확인할 수 없습니다. | サーバーの情報を確認できません。 |
| 오류 | `voiceAssistant.command.errors.REPLAY_CONFLICT` | Duplicate requests differ. Enter a new request. | 중복 요청의 내용이 다릅니다. 새 요청을 입력해 주세요. | 重複したリクエストの内容が異なります。新しいリクエストを入力してください。 |
|  | `voiceAssistant.open` | Open AI assistant | AI 어시스턴트 열기 | AIアシスタントを開く |
| 접근성 | `voiceAssistant.shortLabel` | AI | AI | AI |
|  | `voiceAssistant.brand` | Pingdy | Pingdy | Pingdy |
|  | `voiceAssistant.title` | AI assistant | AI 어시스턴트 | AIアシスタント |
|  | `voiceAssistant.close` | Close assistant | 어시스턴트 닫기 | アシスタントを閉じる |
|  | `voiceAssistant.microphone` | Start microphone | 마이크 시작 | マイクを開始 |
|  | `voiceAssistant.stop` | Stop and send | 중지하고 보내기 | 停止して送信 |
|  | `voiceAssistant.input` | Your request | 요청 내용 | リクエスト内容 |
|  | `voiceAssistant.placeholder` | Ask me anything! | 무엇이든 물어보세요! | 何でも聞いてください！ |
|  | `voiceAssistant.listeningPrompt` | Listening... | 듣고있어요! | 聞いています！ |
|  | `voiceAssistant.settings` | Open microphone and speech recognition settings | 마이크·음성 인식 설정 열기 | マイク・音声認識の設定を開く |
|  | `voiceAssistant.preview` | Input preview: nothing is sent to a server. Use Send on the keyboard to prepare your text locally. | 입력 미리보기입니다. 서버로 전송되지 않으며, 키보드의 보내기를 누르면 기기 안에서 요청을 준비합니다. | 入力のプレビューです。サーバーには送信されません。キーボードの「送信」をタップすると、端末内でリクエストを準備します。 |
|  | `voiceAssistant.voiceUnavailable` | Voice recognition is unavailable on this device. You can use text input. | 이 기기에서는 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | この端末では音声認識を利用できません。テキストで入力してください。 |
|  | `voiceAssistant.feedback.unrecognized` | I’m not sure what you mean. Could you say that again? | 무슨 말을 하시는지 잘 모르겠어요, 다시 한번 부탁드려도 될까요? | うまく聞き取れませんでした。もう一度お願いできますか？ |
|  | `voiceAssistant.feedback.noSpeech` | I couldn’t hear a request. Could you say that again? | 말씀을 듣지 못했어요. 다시 한번 말씀해 주시겠어요? | お話が聞き取れませんでした。もう一度話していただけますか？ |
|  | `voiceAssistant.feedback.retry` | Speak again | 다시 말하기 | もう一度話す |
|  | `voiceAssistant.feedback.dismiss` | That’s okay | 괜찮아요 | 大丈夫です |
|  | `voiceAssistant.localOnly` | Input prepared on this device. AI connection is not available yet; nothing was sent. | 이 기기에서 입력을 준비했습니다. AI 연결은 아직 제공되지 않아 전송하지 않았습니다. | この端末で入力を準備しました。AI接続はまだ提供されていないため、送信していません。 |
|  | `voiceAssistant.advisory` | Assistant guidance may be inaccurate. Verify important details. | 어시스턴트 안내는 정확하지 않을 수 있습니다. 중요한 정보는 다시 확인해 주세요. | アシスタントの案内は正確でない場合があります。重要な情報はご自身で確認してください。 |
|  | `voiceAssistant.invalidResponse` | The assistant response could not be verified. Please try again. | 어시스턴트 응답을 확인할 수 없습니다. 다시 시도해 주세요. | アシスタントの応答を確認できませんでした。もう一度お試しください。 |
|  | `voiceAssistant.clarification` | More information is needed | 추가 정보가 필요합니다 | 追加の情報が必要です |
|  | `voiceAssistant.permissions.undetermined` | Microphone or speech recognition permission has not been requested. | 마이크 또는 음성 인식 권한을 아직 요청하지 않았습니다. | マイクまたは音声認識の権限はまだリクエストされていません。 |
|  | `voiceAssistant.permissions.granted` | Microphone and speech recognition permissions allowed. | 마이크와 음성 인식 권한이 허용되었습니다. | マイクと音声認識の権限が許可されています。 |
|  | `voiceAssistant.permissions.denied` | Microphone or speech recognition permission denied. You can retry or type instead. | 마이크 또는 음성 인식 권한이 거부되었습니다. 다시 요청하거나 텍스트를 입력해 주세요. | マイクまたは音声認識の権限が拒否されました。再度リクエストするか、テキストで入力してください。 |
|  | `voiceAssistant.permissions.blocked` | Microphone or speech recognition access requires a change in system settings. You can type instead. | 시스템 설정에서 마이크 또는 음성 인식 권한을 변경해야 합니다. 텍스트 입력은 사용할 수 있습니다. | システム設定でマイクまたは音声認識の権限を変更する必要があります。テキスト入力はご利用いただけます。 |
|  | `voiceAssistant.permissions.restricted` | Speech recognition is restricted by this device’s policy. You can type instead. | 기기 정책으로 음성 인식이 제한되어 있습니다. 텍스트로 입력해 주세요. | 端末のポリシーにより音声認識が制限されています。テキストで入力してください。 |
|  | `voiceAssistant.phases.idle` | Ready for input | 입력 대기 | 入力待ち |
|  | `voiceAssistant.phases.permissionRequesting` | Checking microphone and speech recognition permissions | 마이크·음성 인식 권한 확인 중 | マイク・音声認識の権限を確認中 |
|  | `voiceAssistant.phases.listening` | Microphone on — listening | 마이크 켜짐 — 듣는 중 | マイクオン — 聞き取り中 |
|  | `voiceAssistant.phases.processing` | Microphone stopping — processing speech | 마이크 중지 중 — 음성 처리 중 | マイク停止中 — 音声を処理中 |
|  | `voiceAssistant.phases.final` | Final input ready | 최종 입력 준비됨 | 最終入力の準備完了 |
|  | `voiceAssistant.phases.canceled` | Input canceled | 입력 취소됨 | 入力をキャンセルしました |
|  | `voiceAssistant.phases.permissionDenied` | Voice permission denied | 음성 입력 권한 거부됨 | 音声入力の権限が拒否されました |
|  | `voiceAssistant.phases.unavailable` | Voice input unavailable | 음성 입력 사용 불가 | 音声入力を利用できません |
| 오류 | `voiceAssistant.phases.error` | Input could not be completed | 입력을 완료하지 못했습니다 | 入力を完了できませんでした |
| 오류 | `voiceAssistant.errors.interrupted` | Audio was interrupted. Try again or type your request. | 다른 오디오 작업으로 중단되었습니다. 다시 시도하거나 텍스트로 입력해 주세요. | ほかの音声処理により中断されました。もう一度お試しいただくか、テキストで入力してください。 |
| 오류 | `voiceAssistant.errors.noSpeech` | No final speech was recognized. Try again or type your request. | 최종 음성을 인식하지 못했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | 最終的な音声を認識できませんでした。もう一度お試しいただくか、テキストで入力してください。 |
| 오류 | `voiceAssistant.errors.unavailable` | Speech recognition is unavailable. Please type your request. | 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | 音声認識を利用できません。テキストで入力してください。 |
| 오류 | `voiceAssistant.errors.network` | The speech service could not connect. Check your network or type your request. | 음성 인식 서비스에 연결하지 못했습니다. 네트워크를 확인하거나 텍스트로 입력해 주세요. | 音声認識サービスに接続できませんでした。ネットワークを確認するか、テキストで入力してください。 |
| 오류 | `voiceAssistant.errors.failed` | Speech recognition failed. Please type or try again. | 음성 인식에 실패했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | 音声認識に失敗しました。もう一度お試しいただくか、テキストで入力してください。 |
| 오류 | `voiceAssistant.errors.empty` | Enter a request first. | 요청을 먼저 입력해 주세요. | 先にリクエストを入力してください。 |
| 오류 | `voiceAssistant.errors.tooLong` | Use 2,000 characters or fewer. | 2,000자 이내로 입력해 주세요. | 2,000文字以内で入力してください。 |
| 오류 | `voiceAssistant.errors.submitFailed` | Input could not be handed over. Close the assistant and start a new request. | 입력을 전달하지 못했습니다. 어시스턴트를 닫고 새 요청을 시작해 주세요. | 入力を渡せませんでした。アシスタントを閉じて、新しいリクエストを始めてください。 |

## `selectLanguage`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `selectLanguage.title` | Select Language | 언어 선택 | 言語を選択 |
|  | `selectLanguage.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | 最適なルートをご案内します！ |
|  | `selectLanguage.button` | Continue | 계속 | 次へ |
|  | `selectLanguage.search` | Search... | 검색하기 | 検索... |
| 접근성 | `selectLanguage.logoAccessibilityLabel` | PingDom logo | 핑덤 로고 | PingDomのロゴ |
|  | `selectLanguage.options.en` | English | 영어 | 英語 |
|  | `selectLanguage.options.ko` | Korean | 한국어 | 韓国語 |
|  | `selectLanguage.options.ja` | 日本語 | 日本語 | 日本語 |
|  | `selectLanguage.progress` | Step {{current}} of {{total}} | 총 {{total}}단계 중 {{current}}단계 | 全{{total}}ステップ中{{current}}ステップ目 |

## `selectCountry`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `selectCountry.title` | Select Country | 국가 선택 | 国を選択 |
|  | `selectCountry.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | 最適なルートをご案内します！ |
|  | `selectCountry.button` | Continue | 계속 | 次へ |
|  | `selectCountry.search` | Search... | 검색하기 | 検索... |

## `selectAge`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `selectAge.title` | Select Birth Year | 생년 선택 | 生まれた年を選択 |
|  | `selectAge.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | 最適なルートをご案内します！ |
|  | `selectAge.button` | Continue | 계속 | 次へ |

## `selectGender`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `selectGender.title` | Select gender | 성별 선택 | 性別を選択 |
|  | `selectGender.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | 最適なルートをご案内します！ |
|  | `selectGender.button` | Continue | 계속 | 次へ |
|  | `selectGender.male` | Male | 남성 | 男性 |
|  | `selectGender.female` | Female | 여성 | 女性 |
|  | `selectGender.other` | Prefer not to say | 비공개 | 回答しない |

## `countries`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `countries.us` | United States | 미국 | アメリカ |
|  | `countries.cn` | China | 중국 | 中国 |
|  | `countries.jp` | Japan | 일본 | 日本 |
|  | `countries.th` | Thailand | 태국 | タイ |
|  | `countries.vn` | Vietnam | 베트남 | ベトナム |
|  | `countries.kr` | South Korea | 대한민국 | 韓国 |

## `loginForeign`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `loginForeign.title` | Only Pingdom | 오직 핑덤 | PingDomだけ |
|  | `loginForeign.subtitle` | Let's find hidden<br>places in Korea! | 한국의 숨은 장소를<br>찾아보세요! | 韓国の隠れた名所を<br>見つけよう！ |
|  | `loginForeign.button` | Get Started | 시작하기 | はじめる |

## `experience`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `experience.common.back` | Back to map | 지도로 돌아가기 | 地図に戻る |
|  | `experience.common.close` | Close | 닫기 | 閉じる |
|  | `experience.common.loading` | Loading. Please wait. | 불러오는 중입니다. 잠시 기다려 주세요. | 読み込んでいます。しばらくお待ちください。 |
|  | `experience.placeDetail.title` | Place details | 장소 상세 | 場所の詳細 |
|  | `experience.placeDetail.open` | Open now | 영업 중 | 営業中 |
|  | `experience.placeDetail.distance` | {{distance}} away | {{distance}} 거리 | ここから{{distance}} |
|  | `experience.placeDetail.checked` | Visitor information updated {{date}} | 방문자 정보 업데이트 {{date}} | 訪問者情報の更新：{{date}} |
|  | `experience.placeDetail.couponPrice` | Coupon value {{price}} | 쿠폰 혜택 {{price}} | クーポン特典 {{price}} |
|  | `experience.placeDetail.checkIn` | Check in at this place | 이 장소에 체크인하기 | この場所にチェックイン |
|  | `experience.placeDetail.coupon` | View available coupons | 사용 가능한 쿠폰 보기 | 利用できるクーポンを見る |
|  | `experience.checkIn.title` | Check in | 체크인 | チェックイン |
|  | `experience.checkIn.description` | Confirm that you are visiting this place to unlock local benefits. | 장소 방문을 확인하고 현지 방문객 혜택을 받아보세요. | 場所への訪問を確認して、訪問者向けの特典を受け取りましょう。 |
|  | `experience.checkIn.status` | Ready to confirm your location | 현재 위치 확인 준비 완료 | 現在地を確認する準備ができました |
|  | `experience.checkIn.action` | Confirm my location and complete check-in | 내 위치를 확인하고 체크인 완료하기 | 現在地を確認してチェックインを完了 |
|  | `experience.checkIn.collapseVisits` | Show less | 접기 | 閉じる |
|  | `experience.checkIn.expandVisits` | Show all | 전체 보기 | すべて表示 |
|  | `experience.checkIn.loadMoreVisits` | Load more visits | 방문 기록 더 보기 | 訪問履歴をさらに表示 |
|  | `experience.checkIn.locationDenied` | Location permission is required to check in. | 체크인하려면 위치 권한이 필요합니다. | チェックインするには位置情報の権限が必要です。 |
| 오류 | `experience.checkIn.locationFailed` | Your current location could not be retrieved. | 현재 위치를 가져오지 못했습니다. | 現在地を取得できませんでした。 |
|  | `experience.checkIn.locationLoading` | Checking your current location… | 현재 위치를 확인하고 있습니다… | 現在地を確認しています… |
|  | `experience.checkIn.openSettings` | Open settings | 설정 열기 | 設定を開く |
|  | `experience.checkIn.recentVisits` | Recent visits | 최근 방문 | 最近の訪問 |
|  | `experience.checkIn.retryCheckIn` | Try check-in again | 체크인 다시 시도 | チェックインを再試行 |
|  | `experience.checkIn.retryLocation` | Try location again | 위치 다시 확인 | 位置情報を再確認 |
|  | `experience.checkIn.retryVisits` | Try loading visits again | 방문 기록 다시 불러오기 | 訪問履歴を再読み込み |
|  | `experience.checkIn.selectedPlace` | Selected place ID {{placeId}} | 선택한 장소 ID {{placeId}} | 選択した場所ID {{placeId}} |
|  | `experience.checkIn.submitting` | Checking in. Please wait. | 체크인 중입니다. 잠시 기다려 주세요. | チェックインしています。しばらくお待ちください。 |
|  | `experience.checkIn.success` | Check-in complete | 체크인이 완료되었습니다. | チェックインが完了しました |
|  | `experience.checkIn.visitDistance` | {{distance}} m away | 장소와 {{distance}}m 거리 | 場所から{{distance}}m |
|  | `experience.checkIn.visitPlace` | Place ID {{placeId}} | 장소 ID {{placeId}} | 場所ID {{placeId}} |
|  | `experience.checkIn.visitsEmpty` | No recent visits yet. | 아직 최근 방문 기록이 없습니다. | まだ最近の訪問履歴がありません。 |
|  | `experience.checkIn.visitsLoading` | Loading recent visits… | 최근 방문 기록을 불러오고 있습니다… | 最近の訪問履歴を読み込んでいます… |
| 오류 | `experience.checkIn.errors.authentication` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | ログインの有効期限が切れました。再度ログインしてください。 |
| 오류 | `experience.checkIn.errors.duplicate` | You have already checked in at this place under the current server policy. | 현재 서버 정책상 이미 체크인한 장소입니다. | 現在のサーバーのポリシーでは、この場所はすでにチェックイン済みです。 |
| 오류 | `experience.checkIn.errors.generic` | Check-in could not be completed. Please try again. | 체크인을 완료하지 못했습니다. 다시 시도해 주세요. | チェックインを完了できませんでした。もう一度お試しください。 |
| 오류 | `experience.checkIn.errors.network` | You appear to be offline. Check your connection and try again. | 네트워크에 연결되지 않았습니다. 연결을 확인한 뒤 다시 시도해 주세요. | オフラインのようです。接続を確認して、もう一度お試しください。 |
| 오류 | `experience.checkIn.errors.out-of-range` | You are too far from this place to check in. | 장소와 거리가 멀어 체크인할 수 없습니다. | 場所から離れすぎているため、チェックインできません。 |
|  | `experience.coupon.title` | Coupon wallet | 쿠폰 지갑 | クーポンウォレット |
|  | `experience.coupon.description` | Coupons that are ready to use appear here. | 바로 사용할 수 있는 쿠폰이 이곳에 표시됩니다. | すぐに使えるクーポンがここに表示されます。 |
|  | `experience.coupon.status` | No available coupons | 사용 가능한 쿠폰 없음 | 利用できるクーポンはありません |
|  | `experience.coupon.action` | Explore places offering visitor coupons | 방문객 쿠폰을 제공하는 장소 둘러보기 | 訪問者クーポンがある場所を探す |

## `auth`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `auth.koreanEntry.title` | My own places, Pingdom | 나만의 장소, 핑덤 | わたしだけの場所、PingDom |
|  | `auth.koreanEntry.subtitle` | Share your places<br>with visitors from abroad! | 당신만의 장소를<br>외국인들에게 공유해주세요! | あなただけの場所を<br>海外からの旅行者に共有しましょう！ |
|  | `auth.koreanEntry.existingAccount` | Already have an account?  | 이미 계정이 있으신가요?  | すでにアカウントをお持ちですか？  |
|  | `auth.koreanEntry.login` | Log in | 로그인 | ログイン |
|  | `auth.koreanEntry.start` | Get Started | 시작하기 | はじめる |
|  | `auth.login.title` | Start Pingdom | 핑덤 시작하기 | PingDomをはじめる |
|  | `auth.login.username` | Username | 아이디 | ユーザー名 |
|  | `auth.login.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | ユーザー名を入力 |
|  | `auth.login.password` | Password | 비밀번호 | パスワード |
|  | `auth.login.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | パスワードを入力 |
|  | `auth.login.submit` | Get Started | 시작하기 | はじめる |
|  | `auth.login.submitting` | Logging in... | 로그인 중... | ログインしています... |
|  | `auth.login.findUsername` | Find ID | 아이디 찾기 | IDを探す |
|  | `auth.login.findPassword` | Find password | 비밀번호 찾기 | パスワードを探す |
|  | `auth.login.signup` | Sign up | 회원가입 | 新規登録 |
| 오류 | `auth.login.unknownError` | An unknown error occurred while logging in. | 로그인 중 알 수 없는 오류가 발생했습니다. | ログイン中に不明なエラーが発生しました。 |
|  | `auth.passwordReset.confirmDescription` | Enter the reset code sent to {{email}} and choose a new password. | {{email}}로 보낸 재설정 코드를 입력하고 새 비밀번호를 설정해주세요. | {{email}}に送信されたリセットコードを入力し、新しいパスワードを設定してください。 |
|  | `auth.passwordReset.confirmTitle` | Set a new password | 새 비밀번호 설정 | 新しいパスワードを設定 |
|  | `auth.passwordReset.invalidToken` | That reset code is not valid. Check the code or request a new one. | 재설정 코드가 올바르지 않습니다. 코드를 확인하거나 다시 요청해주세요. | リセットコードが正しくありません。コードを確認するか、新しいコードをリクエストしてください。 |
|  | `auth.passwordReset.newPassword` | New password | 새 비밀번호 | 新しいパスワード |
|  | `auth.passwordReset.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | 8文字以上 |
|  | `auth.passwordReset.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | パスワードは8文字以上で入力してください |
|  | `auth.passwordReset.processing` | Processing... | 처리 중... | 処理しています... |
|  | `auth.passwordReset.requestDescription` | Enter the email you signed up with. We will send you a reset code. | 가입한 이메일을 입력하시면 재설정 코드를 보내드려요. | 登録したメールアドレスを入力してください。リセットコードをお送りします。 |
|  | `auth.passwordReset.requestTitle` | Reset your password | 비밀번호 재설정 | パスワードをリセット |
|  | `auth.passwordReset.resend` | Send the code again | 코드 다시 보내기 | コードを再送信 |
|  | `auth.passwordReset.sendToken` | Send reset code | 재설정 코드 받기 | リセットコードを送信 |
|  | `auth.passwordReset.submit` | Reset password | 비밀번호 재설정하기 | パスワードをリセット |
|  | `auth.passwordReset.token` | Reset code | 재설정 코드 | リセットコード |
|  | `auth.passwordReset.tokenPlaceholder` | Enter the code from your email | 메일로 받은 코드를 입력하세요 | メールに記載されたコードを入力 |
|  | `auth.passwordReset.tokenRequired` | Please enter the reset code | 재설정 코드를 입력해주세요 | リセットコードを入力してください |
| 오류 | `auth.passwordReset.unknownError` | An unknown error occurred while resetting your password. | 비밀번호 재설정 중 알 수 없는 오류가 발생했습니다. | パスワードのリセット中に不明なエラーが発生しました。 |
|  | `auth.signup.title` | Start Pingdom | 핑덤 시작하기 | PingDomをはじめる |
|  | `auth.signup.passwordTitle` | Confirm Password | 비밀번호 확인 | パスワードの確認 |
|  | `auth.signup.username` | Username | 아이디 | ユーザー名 |
|  | `auth.signup.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | ユーザー名を入力 |
|  | `auth.signup.email` | Email | 이메일 | メールアドレス |
|  | `auth.signup.emailPlaceholder` | Enter your email | 이메일을 입력하세요 | メールアドレスを入力 |
|  | `auth.signup.password` | Password | 비밀번호 | パスワード |
|  | `auth.signup.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | パスワードを入力 |
|  | `auth.signup.passwordConfirm` | Confirm password | 비밀번호 확인 | パスワード（確認） |
|  | `auth.signup.passwordConfirmPlaceholder` | Enter your password again | 비밀번호를 한번 더 입력하세요 | パスワードをもう一度入力 |
|  | `auth.signup.next` | Next | 다음 | 次へ |
|  | `auth.signup.start` | Get Started | 시작하기 | はじめる |
|  | `auth.signup.processing` | Processing... | 처리 중... | 処理しています... |
| 오류 | `auth.signup.unknownError` | An unknown error occurred while signing up. | 회원가입 중 알 수 없는 오류가 발생했습니다. | 新規登録中に不明なエラーが発生しました。 |
| 오류 | `auth.validation.usernameRequired` | Please enter your username | 아이디를 입력해주세요 | ユーザー名を入力してください |
| 오류 | `auth.validation.emailRequired` | Please enter your email | 이메일을 입력해주세요 | メールアドレスを入力してください |
| 오류 | `auth.validation.emailInvalid` | Please enter a valid email address | 올바른 이메일 형식이 아닙니다 | 正しいメールアドレスを入力してください |
| 오류 | `auth.validation.passwordRequired` | Please enter your password | 비밀번호를 입력해주세요 | パスワードを入力してください |
| 오류 | `auth.validation.passwordConfirmRequired` | Please enter your password again | 비밀번호를 한번 더 입력해주세요 | パスワードをもう一度入力してください |
| 오류 | `auth.validation.passwordMismatch` | Passwords do not match | 비밀번호가 일치하지 않습니다 | パスワードが一致しません |

## `common`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `common.missingTranslation` | Translation unavailable | 번역을 제공할 수 없습니다 | 翻訳がありません |
|  | `common.navigation.back` | Go back | 뒤로 가기 | 戻る |
|  | `common.navigation.close` | Close | 닫기 | 閉じる |
| 접근성 | `common.navigation.exitHint` | Press back again to exit the app. | 뒤로가기를 한 번 더 누르면 앱이 종료됩니다. | もう一度「戻る」を押すとアプリを終了します。 |
|  | `common.navigation.retry` | Try again | 다시 시도 | 再試行 |
|  | `common.unsupportedFeature.description` | This feature is not currently supported in the app. | 이 기능은 현재 앱에서 지원하지 않습니다. | この機能は現在アプリでサポートされていません。 |
|  | `common.unsupportedFeature.title` | Not available in the app | 앱에서 제공하지 않는 기능 | アプリではご利用いただけません |
| 오류 | `common.apiError.timeout.title` | The response is taking too long | 응답 시간이 초과되었어요 | 応答に時間がかかっています |
| 오류 | `common.apiError.timeout.description` | Check your connection and try loading again. | 연결을 확인하고 다시 조회해 주세요. | 接続を確認して、もう一度読み込んでください。 |
| 오류 | `common.apiError.server.title` | Service temporarily unavailable | 서비스에 잠시 연결할 수 없어요 | サービスを一時的にご利用いただけません |
| 오류 | `common.apiError.server.description` | Please try loading again in a moment. | 잠시 후 다시 조회해 주세요. | しばらくしてから、もう一度読み込んでください。 |
| 오류 | `common.apiError.rateLimited.title` | Too many requests | 요청이 너무 많아요 | リクエストが多すぎます |
| 오류 | `common.apiError.rateLimited.description` | Please wait a moment before trying again. | 잠시 기다린 후 다시 시도해 주세요. | しばらく待ってから、もう一度お試しください。 |
| 오류 | `common.apiError.mutationUnknown.title` | Result not confirmed | 처리 결과를 확인해 주세요 | 結果を確認できませんでした |
| 오류 | `common.apiError.mutationUnknown.description` | We could not confirm the result. Check the latest status before submitting again. | 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 최신 상태를 확인해 주세요. | 処理結果を確認できませんでした。再度送信する前に最新の状態を確認してください。 |
| 오류 | `common.apiError.actions.back` | Go back | 목록으로 | 戻る |
| 오류 | `common.apiError.actions.retry` | Try again | 다시 시도 | 再試行 |
| 오류 | `common.apiError.actions.signIn` | Sign in again | 다시 로그인 | 再度ログイン |
| 오류 | `common.apiError.actions.update` | Update app | 앱 업데이트 | アプリをアップデート |
| 오류 | `common.apiError.authentication.description` | Your session is no longer valid. Please sign in again. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | ログイン情報が無効になりました。再度ログインしてください。 |
| 오류 | `common.apiError.authentication.title` | Sign-in required | 로그인이 필요합니다 | ログインが必要です |
| 오류 | `common.apiError.authorization.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | このアカウントには、この操作を行う権限がありません。 |
| 오류 | `common.apiError.authorization.title` | Permission required | 권한이 필요합니다 | 権限が必要です |
| 오류 | `common.apiError.conflict.description` | The request conflicts with the resource’s current state. Refresh its latest state. | 리소스의 현재 상태와 요청이 충돌합니다. 최신 상태를 확인해 주세요. | リクエストが現在の状態と一致しません。最新の状態に更新してください。 |
| 오류 | `common.apiError.conflict.title` | State has changed | 상태가 변경되었습니다 | 状態が変更されました |
| 오류 | `common.apiError.expired.description` | This coupon or resource has expired. | 쿠폰 또는 리소스의 이용 기간이 만료되었습니다. | このクーポンまたはリソースの有効期限が切れています。 |
| 오류 | `common.apiError.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | ご利用いただけません |
| 오류 | `common.apiError.generic.description` | Please check your connection and try again. | 네트워크 상태를 확인한 후 다시 시도해 주세요. | 接続を確認して、もう一度お試しください。 |
| 오류 | `common.apiError.generic.title` | Could not load data | 데이터를 불러오지 못했습니다 | データを読み込めませんでした |
| 오류 | `common.apiError.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | サーバーに接続できませんでした。接続を確認して、もう一度お試しください。 |
| 오류 | `common.apiError.network.title` | Connection problem | 연결에 문제가 있습니다 | 接続の問題 |
| 오류 | `common.apiError.notFound.description` | The requested resource no longer exists. Return to the latest list. | 요청한 항목이 더 이상 존재하지 않습니다. 최신 목록으로 돌아가 주세요. | リクエストしたリソースは存在しません。最新の一覧に戻ってください。 |
| 오류 | `common.apiError.notFound.title` | Not found | 항목을 찾을 수 없습니다 | 見つかりません |
| 오류 | `common.apiError.outOfRange.description` | Move closer to the place and check your location accuracy. | 장소에 더 가까이 이동하고 위치 정확도를 확인해 주세요. | 場所にもっと近づき、位置情報の精度を確認してください。 |
| 오류 | `common.apiError.outOfRange.title` | Too far away to check in | 체크인 가능 거리 밖입니다 | 離れすぎているためチェックインできません |
| 오류 | `common.apiError.updateRequired.description` | Install the latest version to keep using PingDom. | PingDom을 계속 사용하려면 최신 버전을 설치해 주세요. | PingDomを引き続き利用するには、最新バージョンをインストールしてください。 |
| 오류 | `common.apiError.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | アップデートが必要です |
| 오류 | `common.apiError.validation.description` | Review the highlighted information and try again. | 입력한 정보를 확인한 후 다시 시도해 주세요. | 表示された情報を確認して、もう一度お試しください。 |
| 오류 | `common.apiError.validation.title` | Check your entries | 입력 정보를 확인해 주세요 | 入力内容を確認してください |
| 오류 | `common.error.description` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | しばらくしてから、もう一度お試しください。 |
| 오류 | `common.error.retry` | Try again | 다시 시도 | 再試行 |
| 오류 | `common.error.title` | Something went wrong | 문제가 발생했습니다 | 問題が発生しました |

## `placeMenu`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
| 접근성 | `placeMenu.accessibility.image` | {{name}} menu image | {{name}} 메뉴 이미지 | {{name}}のメニュー画像 |
| 접근성 | `placeMenu.accessibility.imageUnavailable` | No image for {{name}} | {{name}} 메뉴 이미지 없음 | {{name}}の画像はありません |
| 접근성 | `placeMenu.accessibility.price` | Price: {{price}} | 가격: {{price}} | 価格：{{price}} |
| 접근성 | `placeMenu.accessibility.status` | {{name}} status: {{status}} | {{name}} 상태: {{status}} | {{name}}の状態：{{status}} |
| 오류 | `placeMenu.error.notFound` | The place details and menu data are temporarily out of sync. Refresh this menu or return to the map. | 장소 상세와 메뉴 데이터가 일시적으로 일치하지 않습니다. 메뉴를 새로고침하거나 지도로 돌아가 주세요. | 場所の詳細とメニュー情報が一時的に一致していません。メニューを更新するか、地図に戻ってください。 |
| 오류 | `placeMenu.error.title` | Could not load the menu. | 메뉴를 불러오지 못했습니다. | メニューを読み込めませんでした。 |
|  | `placeMenu.empty` | No menu has been added yet. | 등록된 메뉴가 없습니다. | まだメニューが登録されていません。 |
|  | `placeMenu.imageUnavailable` | No image | 이미지 없음 | 画像なし |
|  | `placeMenu.loading` | Loading menu… | 메뉴를 불러오는 중입니다… | メニューを読み込んでいます… |
|  | `placeMenu.priceUnavailable` | Price unavailable | 가격 정보 없음 | 価格情報なし |
|  | `placeMenu.retry` | Try again | 다시 시도 | 再試行 |
|  | `placeMenu.soldOut` | Sold out | 품절 | 売り切れ |
|  | `placeMenu.title` | Menu | 메뉴 | メニュー |

## `examplePlaces`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `examplePlaces.count` | {{count}} places | 장소 {{count}}개 | {{count}}か所 |
|  | `examplePlaces.englishMenu` | English menu: {{status}} | 영문 메뉴: {{status}} | 英語メニュー：{{status}} |
|  | `examplePlaces.emptyDescription` | Try again after place data is available. | 장소 데이터가 등록된 후 다시 확인해 주세요. | 場所のデータが用意できてから、もう一度お試しください。 |
|  | `examplePlaces.emptyTitle` | No places yet | 아직 등록된 장소가 없습니다 | まだ場所がありません |
|  | `examplePlaces.loading` | Loading places... | 장소를 불러오는 중입니다... | 場所を読み込んでいます... |
|  | `examplePlaces.title` | Place list example | 장소 목록 예제 | 場所一覧のサンプル |
|  | `examplePlaces.trustScore` | Trust score: {{score}}/100 | 신뢰 점수: {{score}}/100 | 信頼スコア：{{score}}/100 |

## `merchant`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `merchant.pendingDescription` | Merchant {{merchantId}} is not available yet. | 상점 {{merchantId}}는 아직 준비 중입니다. | 店舗{{merchantId}}はまだご利用いただけません。 |
|  | `merchant.title` | Merchant | 상점 | 店舗 |

## `onboarding`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `onboarding.preferenceFlow.loading` | Restoring your saved travel preferences... | 저장된 여행 선호를 불러오는 중입니다... | 保存した旅行の好みを読み込んでいます... |
| 오류 | `onboarding.preferenceFlow.restoreError` | Saved preferences could not be restored. You can continue with new selections. | 저장된 선택을 불러오지 못했어요. 새로 선택해 계속할 수 있어요. | 保存した選択を読み込めませんでした。新しく選択して続けられます。 |
| 오류 | `onboarding.preferenceFlow.saveError` | Your selections could not be saved. Please try Continue again. | 선택값을 저장하지 못했어요. 계속 버튼을 다시 눌러 주세요. | 選択内容を保存できませんでした。もう一度「次へ」をタップしてください。 |
|  | `onboarding.preferences.currentNeeds.attendEvent` | Events | 이벤트 관람 | イベント |
|  | `onboarding.preferences.currentNeeds.cafe` | Cafe | 카페 | カフェ |
|  | `onboarding.preferences.currentNeeds.eat` | Food | 식사 | グルメ |
|  | `onboarding.preferences.currentNeeds.explore` | Explore | 둘러보기 | 散策 |
|  | `onboarding.preferences.currentNeeds.nightlife` | Nightlife | 나이트라이프 | ナイトライフ |
|  | `onboarding.preferences.currentNeeds.shop` | Shopping | 쇼핑 | ショッピング |
|  | `onboarding.preferences.travelPurposes.beauty` | Beauty | 뷰티 | ビューティー |
|  | `onboarding.preferences.travelPurposes.cafe` | Cafe | 카페 | カフェ |
|  | `onboarding.preferences.travelPurposes.exhibition` | Exhibition | 전시 | 展示 |
|  | `onboarding.preferences.travelPurposes.fashion` | Fashion | 패션 | ファッション |
|  | `onboarding.preferences.travelPurposes.food` | Food | 음식 | グルメ |
|  | `onboarding.preferences.travelPurposes.kPop` | Music | 음악 | 音楽 |
|  | `onboarding.preferences.travelPurposes.other` | Others | 기타 | その他 |
|  | `onboarding.preferences.travelPurposes.popUp` | Pop-up | 팝업 | ポップアップ |
|  | `onboarding.travelScheduleScreen.back` | Back | 뒤로 가기 | 戻る |
|  | `onboarding.travelScheduleScreen.calendar` | Travel date calendar | 여행 일정 달력 | 旅行日程カレンダー |
|  | `onboarding.travelScheduleScreen.continue` | Continue | 계속 | 次へ |
|  | `onboarding.travelScheduleScreen.description` | Please select your start and end dates | 여행 시작일과 종료일을 선택해 주세요 | 開始日と終了日を選択してください |
|  | `onboarding.travelScheduleScreen.emptyDate` | Not selected | 선택 전 | 未選択 |
|  | `onboarding.travelScheduleScreen.endDate` | End date | 종료일 | 終了日 |
|  | `onboarding.travelScheduleScreen.invalidRange` | Check your dates and select a valid range again. | 날짜를 확인하고 올바른 기간을 다시 선택해 주세요. | 日程を確認し、正しい期間を選び直してください。 |
|  | `onboarding.travelScheduleScreen.nextMonth` | Next month | 다음 달 | 翌月 |
|  | `onboarding.travelScheduleScreen.previousMonth` | Previous month | 이전 달 | 前月 |
|  | `onboarding.travelScheduleScreen.progress` | Onboarding progress | 온보딩 진행 단계 | オンボーディングの進行状況 |
|  | `onboarding.travelScheduleScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | 全{{total}}ステップ中{{current}}ステップ目 |
|  | `onboarding.travelScheduleScreen.startDate` | Start date | 시작일 | 開始日 |
|  | `onboarding.travelScheduleScreen.title` | Select Travel Dates | 여행 일정을 알려주세요 | 旅行日程を選択 |
|  | `onboarding.travelScheduleScreen.weekdays.fri` | F | 금 | 金 |
|  | `onboarding.travelScheduleScreen.weekdays.mon` | M | 월 | 月 |
|  | `onboarding.travelScheduleScreen.weekdays.sat` | S | 토 | 土 |
|  | `onboarding.travelScheduleScreen.weekdays.sun` | S | 일 | 日 |
|  | `onboarding.travelScheduleScreen.weekdays.thu` | T | 목 | 木 |
|  | `onboarding.travelScheduleScreen.weekdays.tue` | T | 화 | 火 |
|  | `onboarding.travelScheduleScreen.weekdays.wed` | W | 수 | 水 |
|  | `onboarding.travelPurposeScreen.back` | Back | 뒤로 가기 | 戻る |
|  | `onboarding.travelPurposeScreen.continue` | Continue | 계속 | 次へ |
|  | `onboarding.travelPurposeScreen.description` | We'll recommend hot places that match your interests | 관심사에 맞는 핫플레이스를 추천해드릴게요 | 興味に合った人気スポットをおすすめします |
|  | `onboarding.travelPurposeScreen.progress` | Onboarding progress | 온보딩 진행 단계 | オンボーディングの進行状況 |
|  | `onboarding.travelPurposeScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | 全{{total}}ステップ中{{current}}ステップ目 |
|  | `onboarding.travelPurposeScreen.title` | Select Travel Purpose | 여행 목적을 선택해 주세요 | 旅行の目的を選択 |

## `map`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `map.decision.backToRecommendations` | Back to recommendations | 추천으로 돌아가기 | おすすめに戻る |
|  | `map.decision.emptyBody` | Try another keyword or remove a visit condition. | 다른 검색어를 입력하거나 방문 조건을 해제해 보세요. | 別のキーワードを試すか、訪問条件を外してください。 |
|  | `map.decision.emptyTitle` | No matching places yet | 일치하는 장소가 아직 없어요 | 条件に合う場所はまだありません |
|  | `map.decision.filters.bookable` | Bookable | 예약 가능 | 予約可能 |
|  | `map.decision.filters.coupon` | Coupon | 쿠폰 | クーポン |
|  | `map.decision.filters.openNow` | Open now | 영업 중 | 営業中 |
|  | `map.decision.filters.shortWait` | Short wait | 대기 짧음 | 待ち時間短め |
|  | `map.decision.getCoupon` | Get coupon | 쿠폰 받기 | クーポンを受け取る |
|  | `map.decision.couponMessage` | {{placeName}} coupon will be available here. | {{placeName}} 쿠폰을 이곳에서 받을 수 있어요. | {{placeName}}のクーポンはここで受け取れるようになります。 |
|  | `map.decision.goNow` | Go now | 바로 가기 | 今すぐ行く |
|  | `map.decision.goNowMessage` | Directions to {{placeName}} are ready. | {{placeName}}까지 길안내를 준비했어요. | {{placeName}}への経路の準備ができました。 |
|  | `map.decision.livePicks` | LIVE PICKS | 지금 인기 장소 | LIVE PICKS |
|  | `map.decision.map` | Map | 지도 | 地図 |
|  | `map.decision.nearMe` | Near me | 내 위치 | 現在地周辺 |
|  | `map.decision.nearYou` | Near you | 내 주변 | あなたの近く |
|  | `map.decision.noResults` | No matching places yet | 일치하는 장소가 아직 없어요 | 条件に合う場所はまだありません |
|  | `map.decision.placesLiveNearby_one` | {{count}} place live nearby | 내 주변 {{count}}곳 운영 중 | 近くで{{count}}か所が営業中 |
|  | `map.decision.placesLiveNearby_other` | {{count}} places live nearby | 내 주변 {{count}}곳 운영 중 | 近くで{{count}}か所が営業中 |
|  | `map.decision.placesNearYou` | Places near you | 내 주변 장소 | あなたの近くの場所 |
| 접근성 | `map.decision.profileAccessibilityLabel` | Open profile | 프로필 열기 | プロフィールを開く |
|  | `map.decision.recommended` | Recommended | 추천순 | おすすめ |
|  | `map.decision.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | 「{{query}}」の検索結果 |
| 접근성 | `map.decision.searchAccessibilityLabel` | Search places | 장소 검색 | 場所を検索 |
|  | `map.decision.searchPlaceholder` | Search places | 장소를 검색하세요 | 場所を検索 |
|  | `map.decision.seeAll` | See all | 전체 보기 | すべて見る |
|  | `map.decision.status.openNow` | Open now | 영업 중 | 営業中 |
|  | `map.decision.status.verified` | Visitor verified · {{time}} | 방문자 확인 · {{time}} | 訪問者認証済み · {{time}} |
|  | `map.decision.status.wait` | Wait {{wait}} | 대기 {{wait}} | 待ち時間 {{wait}} |
|  | `map.decision.transit` | Transit | 대중교통 | 公共交通機関 |
|  | `map.decision.whereToGo` | Where to go now | 지금 어디로 갈까요? | 今どこへ行く？ |
|  | `map.card.actions.arrive` | Arrive | 도착 | 到着 |
|  | `map.card.actions.directions` | Directions | 길찾기 | 経路案内 |
|  | `map.card.actions.reserve` | Reserve | 예약 | 予約 |
|  | `map.card.actions.share` | Share | 공유 | 共有 |
|  | `map.card.actions.start` | Start | 출발 | 出発 |
|  | `map.card.closed` | Closed now | 영업 종료 | 営業時間外 |
|  | `map.card.dismiss` | Dismiss place preview | 장소 미리보기 닫기 | 場所のプレビューを閉じる |
| 오류 | `map.card.error` | Could not load this place. | 장소 정보를 불러오지 못했습니다. | この場所を読み込めませんでした。 |
|  | `map.card.favorite` | Save place | 장소 저장 | 場所を保存 |
| 접근성 | `map.card.imageLabel` | {{name}} photo | {{name}} 사진 | {{name}}の写真 |
|  | `map.card.imageUnavailable` | No photo | 사진 없음 | 写真なし |
|  | `map.card.loading` | Loading place preview... | 장소 미리보기를 불러오는 중입니다... | 場所のプレビューを読み込んでいます... |
|  | `map.card.open` | Open now | 영업 중 | 営業中 |
| 접근성 | `map.card.openHint` | Opens place details | 장소 상세를 엽니다 | 場所の詳細を開きます |
|  | `map.card.preview` | Place preview | 장소 미리보기 | 場所のプレビュー |
|  | `map.card.statusUnknown` | Status unknown | 영업 상태 미확인 | 状態不明 |
|  | `map.card.support.coupon` | Coupons available | 쿠폰 사용 가능 | クーポンあり |
|  | `map.card.support.english` | English support | 영어응대 가능 | 英語対応 |
|  | `map.card.support.englishMenu` | English menu | 영문 메뉴 | 英語メニュー |
|  | `map.card.support.foreignCard` | Foreign cards | 해외카드 가능 | 海外カード対応 |
|  | `map.card.support.reservation` | Reservations | 예약 가능 | 予約可能 |
|  | `map.card.support.wifi` | Free Wi-Fi | 무료 Wi-Fi | 無料Wi-Fi |
|  | `map.placeActions.departureUnsupported` | Starting from a place is not supported yet. | 출발 기능은 아직 지원하지 않습니다. | 場所からの出発にはまだ対応していません。 |
| 오류 | `map.placeActions.directionsFailed` | Could not start directions. | 길찾기를 실행하지 못했습니다. | 経路案内を開始できませんでした。 |
|  | `map.placeActions.directionsUnavailable` | Could not open an external map. | 외부 지도 앱을 열 수 없습니다. | 外部の地図アプリを開けませんでした。 |
|  | `map.placeActions.locationMissing` | This place has no location information. | 장소 위치 정보가 없습니다. | この場所には位置情報がありません。 |
| 오류 | `map.placeActions.shareFailed` | Could not share this place. | 공유를 실행하지 못했습니다. | この場所を共有できませんでした。 |
|  | `map.placeActions.shareUnavailable` | Sharing is not available on this device. | 이 기기에서는 공유 기능을 사용할 수 없습니다. | この端末では共有を利用できません。 |
|  | `map.data.disabledDescription` | Enable the place-list runtime setting to request server data. | 장소 목록 실행 설정을 켜면 서버 데이터를 요청합니다. | サーバーのデータをリクエストするには、場所一覧のランタイム設定を有効にしてください。 |
|  | `map.data.disabledTitle` | Place discovery is off | 장소 탐색 기능이 꺼져 있어요 | 場所の探索はオフです |
|  | `map.data.emptyDescription` | Move the map or change the search filters. | 지도를 이동하거나 검색 필터를 바꿔 보세요. | 地図を動かすか、検索条件を変更してください。 |
|  | `map.data.emptyTitle` | No places in this area | 이 지역에 장소가 없습니다 | このエリアに場所がありません |
| 오류 | `map.data.errorDescription` | Check your connection and try again. | 네트워크를 확인한 후 다시 시도해 주세요. | 接続を確認して、もう一度お試しください。 |
| 오류 | `map.data.errorTitle` | Could not load places | 장소를 불러오지 못했습니다 | 場所を読み込めませんでした |
|  | `map.data.loading` | Loading places... | 장소를 불러오는 중입니다... | 場所を読み込んでいます... |
|  | `map.data.mockDescription` | These markers come from the explicitly selected development transport. | 명시적으로 선택한 개발 transport의 합성 마커입니다. | これらのマーカーは、明示的に選択した開発用トランスポートのデータです。 |
|  | `map.data.mockTitle` | Development Mock places | 개발 Mock 장소 | 開発用Mockの場所 |
|  | `map.data.retry` | Try again | 다시 시도 | 再試行 |
|  | `map.distanceMeters` | {{count}} m | {{count}}m | {{count}} m |
|  | `map.filters.all` | All | 전체 | すべて |
|  | `map.filters.cafe` | Cafe | 카페 | カフェ |
|  | `map.filters.fashion` | Fashion | 패션 | ファッション |
|  | `map.filters.food` | Food | 음식 | グルメ |
|  | `map.filters.music` | Music | 음악 | 音楽 |
|  | `map.categories.all` | All | 전체 | すべて |
|  | `map.categories.art` | Exhibitions | 전시 | 展示 |
|  | `map.categories.beauty` | Beauty | 뷰티 | ビューティー |
|  | `map.categories.cafe` | Cafe | 카페 | カフェ |
|  | `map.categories.etc` | Other | 기타 | その他 |
|  | `map.categories.fashion` | Fashion | 패션 | ファッション |
|  | `map.categories.food` | Restaurants | 음식점 | 飲食店 |
|  | `map.categories.heritage` | Cultural heritage | 문화재 | 文化財 |
|  | `map.categories.music` | Music | 음악 | 音楽 |
|  | `map.categories.popup` | Pop-ups | 팝업 | ポップアップ |
|  | `map.navigation.community` | Community | 커뮤니티 | コミュニティ |
|  | `map.navigation.favorites` | Favorites | 즐겨찾기 | お気に入り |
|  | `map.navigation.map` | Map | 지도 | 地図 |
|  | `map.navigation.recommendations` | Recommendations | 장소추천 | おすすめ |
|  | `map.navigation.reservations` | Reservations | 예약 | 予約 |
|  | `map.favorites.adjust` | Resize favorites panel | 즐겨찾기 패널 크기 조절 | お気に入りパネルのサイズを調整 |
|  | `map.favorites.emptyBody` | Tap the star on a place you like to save it. | 마음에 드는 장소의 별을 눌러 모아보세요. | 気に入った場所の星をタップして保存しましょう。 |
|  | `map.favorites.emptyTitle` | No saved places | 저장한 장소가 없어요 | 保存した場所はありません |
| 오류 | `map.favorites.error` | Could not load places | 장소를 불러오지 못했어요 | 場所を読み込めませんでした |
|  | `map.favorites.loadMore` | Show more | 더 보기 | さらに表示 |
| 오류 | `map.favorites.loadMoreError` | Could not load more places | 다음 장소를 불러오지 못했어요 | 場所をさらに読み込めませんでした |
| 접근성 | `map.favorites.loadMoreLabel` | Load more saved places | 저장한 장소 더 불러오기 | 保存した場所をさらに読み込む |
|  | `map.favorites.loading` | Loading saved places… | 저장한 장소를 불러오는 중이에요 | 保存した場所を読み込んでいます… |
|  | `map.favorites.remove` | Remove {{name}} from favorites | {{name}} 즐겨찾기 해제 | {{name}}をお気に入りから削除 |
|  | `map.favorites.retry` | Try again | 다시 시도 | 再試行 |
|  | `map.favorites.sessionBody` | Sign in again to see your saved places. | 다시 로그인한 뒤 저장한 장소를 확인해 주세요. | 保存した場所を見るには、再度ログインしてください。 |
|  | `map.favorites.sessionTitle` | Your session has expired | 로그인이 만료됐어요 | ログインの有効期限が切れました |
|  | `map.favorites.title` | My places | 내 장소 | マイスポット |
|  | `map.searchOverlay.categories` | Place categories | 장소 카테고리 | 場所のカテゴリー |
|  | `map.searchOverlay.clear` | Clear search | 검색어 지우기 | 検索語を消去 |
|  | `map.searchOverlay.clearAll` | Clear all | 전체 삭제 | すべて消去 |
|  | `map.searchOverlay.close` | Close search | 검색 닫기 | 検索を閉じる |
|  | `map.searchOverlay.emptyBody` | Try a different search term. | 다른 검색어를 입력해 보세요. | 別の検索語をお試しください。 |
|  | `map.searchOverlay.emptyTitle` | No search results | 검색 결과가 없어요 | 検索結果がありません |
|  | `map.searchOverlay.externalResults` | Place search results | 장소 검색 결과 | 場所の検索結果 |
|  | `map.searchOverlay.loading` | Searching for places… | 장소를 찾고 있어요 | 場所を検索しています… |
|  | `map.searchOverlay.pingdomResults` | PingDom places | 핑덤 장소 | PingDomの場所 |
|  | `map.searchOverlay.placeholder` | Search | 검색하기 | 検索 |
|  | `map.searchOverlay.recent` | Recent searches | 최근 검색 | 最近の検索 |
|  | `map.searchOverlay.recentClearAll` | Clear all recent searches | 최근 검색 전체 삭제 | 最近の検索をすべて削除 |
| 정책 | `map.searchOverlay.recentDelete` | Remove {{query}} from recent searches | {{query}} 최근 검색어 삭제 | 最近の検索から{{query}}を削除 |
|  | `map.searchOverlay.recentLoading` | Loading recent searches | 최근 검색 불러오는 중 | 最近の検索を読み込んでいます |
|  | `map.searchOverlay.recentSearch` | Search for {{query}} | {{query}} 검색 | {{query}}を検索 |
|  | `map.searchOverlay.registrant` | Registered by {{name}} | 등록자 {{name}} | 登録者：{{name}} |
|  | `map.searchOverlay.registrantLoading` | Loading registrant | 등록자 확인 중 | 登録者を読み込んでいます |
|  | `map.searchOverlay.registrantMissing` | No registrant | 등록자 없음 | 登録者なし |
|  | `map.searchOverlay.recommendationEmpty` | No nearby recommendations yet | 주변 추천 장소가 아직 없어요 | 近くのおすすめはまだありません |
| 오류 | `map.searchOverlay.recommendationError` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | おすすめを読み込めませんでした |
|  | `map.searchOverlay.recommendationLoading` | Loading recommendations… | 추천 장소를 불러오고 있어요 | おすすめを読み込んでいます… |
|  | `map.searchOverlay.registeredDisabled` | PingDom place search is disabled. | 핑덤 장소 검색 기능이 비활성화되어 있어요. | PingDomの場所検索は無効になっています。 |
|  | `map.searchOverlay.registeredEmpty` | No registered PingDom places matched. | 서버에 등록된 핑덤 장소 검색 결과가 없어요. | 一致するPingDom登録済みの場所はありません。 |
| 오류 | `map.searchOverlay.registeredError` | The PingDom place search failed. | 핑덤 장소 검색 요청에 실패했어요. | PingDomの場所検索に失敗しました。 |
|  | `map.searchOverlay.registeredMock` | Development mock PingDom place results. | 개발 Mock 핑덤 장소 검색 결과예요. | 開発用MockのPingDom場所検索結果です。 |
|  | `map.sheet.adjust` | Resize recommendations panel | 추천 패널 크기 조절 | おすすめパネルのサイズを調整 |
|  | `map.sheet.aroundMe` | Places near me | 내 주변 장소 | 現在地周辺の場所 |
|  | `map.sheet.bookmark` | Save place | 즐겨찾기 | 場所を保存 |
|  | `map.sheet.bookmarkRemove` | Remove saved place | 즐겨찾기 해제 | 保存した場所を削除 |
| 오류 | `map.sheet.bookmarkSaveError` | Could not save this place | 장소를 저장하지 못했어요 | この場所を保存できませんでした |
| 오류 | `map.sheet.bookmarkRemoveError` | Could not remove this saved place | 저장을 해제하지 못했어요 | 保存した場所を削除できませんでした |
|  | `map.sheet.categoryPopular` | Popular {{userName}} picks by category | 카테고리별 {{userName}}님 주변 인기 장소들 | {{userName}}さんに人気のカテゴリー別スポット |
|  | `map.sheet.categoryPopularRegion` | Popular places in {{regionName}} by category | {{regionName}} 카테고리별 인기 장소 | {{regionName}}のカテゴリー別人気スポット |
|  | `map.sheet.categoryPopularNational` | Popular nationwide places by category | 전국 카테고리 인기 장소 | 全国のカテゴリー別人気スポット |
|  | `map.sheet.distanceAway` | {{distance}} away | 여기서 {{distance}} | ここから{{distance}} |
|  | `map.sheet.image` | Place image | 장소 이미지 | 場所の画像 |
| 오류 | `map.sheet.imageError` | Could not load image | 이미지를 불러오지 못했어요 | 画像を読み込めませんでした |
|  | `map.sheet.imageMissing` | No image | 이미지 없음 | 画像なし |
|  | `map.sheet.localHotPlaces` | Local hot places | 우리 지역 핫플 | 地域の人気スポット |
|  | `map.sheet.nationwideTrends` | Nationwide trends | 전국 트렌드 | 全国のトレンド |
|  | `map.sheet.placeMissing` | Unnamed place | 장소명 없음 | 名称未設定の場所 |
|  | `map.sheet.recommendationTitle` | Recommended for you | 나만을 위한 추천 장소 | あなたへのおすすめ |
|  | `map.sheet.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | 「{{query}}」の検索結果 |
|  | `map.sheet.state.categoryEmptyTitle` | No places found in this category. | 이 카테고리에 해당하는 장소가 없어요 | このカテゴリーの場所は見つかりませんでした。 |
|  | `map.sheet.state.disabledBody` | Sign in to view this list. | 로그인하면 이 목록을 확인할 수 있어요. | この一覧を見るにはログインしてください。 |
|  | `map.sheet.state.disabledTitle` | This list is unavailable | 목록을 사용할 수 없어요 | この一覧はご利用いただけません |
|  | `map.sheet.state.emptyBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | 地図を動かして別のエリアを探してみましょう。 |
|  | `map.sheet.state.emptyTitle` | No hot places to show yet | 표시할 핫플이 아직 없어요 | 表示できる人気スポットはまだありません |
| 오류 | `map.sheet.state.errorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | しばらくしてから、もう一度お試しください。 |
| 오류 | `map.sheet.state.errorTitle` | Could not load the list | 목록을 불러오지 못했어요 | 一覧を読み込めませんでした |
|  | `map.sheet.state.forbiddenBody` | Your account cannot access this list. | 현재 계정으로 이 목록에 접근할 수 없어요. | このアカウントではこの一覧にアクセスできません。 |
|  | `map.sheet.state.forbiddenTitle` | Access is unavailable | 접근할 수 없어요 | アクセスできません |
|  | `map.sheet.state.invalid-locationBody` | Check your location and try again. | 위치 상태를 확인한 후 다시 시도해 주세요. | 位置情報を確認して、もう一度お試しください。 |
|  | `map.sheet.state.invalid-locationTitle` | Your location could not be used | 현재 위치를 사용할 수 없어요 | 現在地を使用できませんでした |
|  | `map.sheet.state.invalid-periodBody` | Please try the supported weekly period again. | 지원되는 주간 기간으로 다시 시도해 주세요. | 対応している週間の期間で、もう一度お試しください。 |
|  | `map.sheet.state.invalid-periodTitle` | The trend period is unavailable | 트렌드 기간을 사용할 수 없어요 | トレンドの期間を利用できません |
|  | `map.sheet.state.location-deniedBody` | Nationwide trends remain available without location access. | 위치 권한 없이도 전국 트렌드는 볼 수 있어요. | 位置情報へのアクセスがなくても、全国のトレンドは確認できます。 |
|  | `map.sheet.state.location-deniedTitle` | Allow location access to see local hot places | 지역 핫플을 보려면 위치 권한을 허용해 주세요 | 地域の人気スポットを見るには位置情報へのアクセスを許可してください |
|  | `map.sheet.state.location-pendingBody` | Nationwide trends are available while location is being prepared. | 위치를 확인하는 동안 전국 트렌드는 볼 수 있어요. | 位置情報の準備中も、全国のトレンドは確認できます。 |
|  | `map.sheet.state.location-pendingTitle` | Checking your location… | 현재 위치를 확인하고 있어요 | 現在地を確認しています… |
|  | `map.sheet.state.loadingBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | 地図を動かして別のエリアを探してみましょう。 |
|  | `map.sheet.state.loadingTitle` | Finding nearby hot places… | 주변 핫플을 찾는 중이에요 | 近くの人気スポットを探しています… |
|  | `map.sheet.state.nationalEmptyBody` | Check back after the weekly trend data is updated. | 주간 트렌드 데이터가 갱신된 후 다시 확인해 주세요. | 週間トレンドのデータが更新されてから、もう一度ご確認ください。 |
|  | `map.sheet.state.nationalEmptyTitle` | No nationwide trends to show yet | 표시할 전국 트렌드가 아직 없어요 | 表示できる全国のトレンドはまだありません |
| 오류 | `map.sheet.state.nationalErrorBody` | Please try loading nationwide trends again in a moment. | 잠시 후 전국 트렌드를 다시 불러와 주세요. | しばらくしてから、全国のトレンドをもう一度読み込んでください。 |
| 오류 | `map.sheet.state.nationalErrorTitle` | Could not load nationwide trends | 전국 트렌드를 불러오지 못했어요 | 全国のトレンドを読み込めませんでした |
|  | `map.sheet.state.nationalLoadingBody` | Loading the latest seven-day bookmark trend. | 최근 7일의 즐겨찾기 변화를 불러오고 있어요. | 直近7日間のブックマークのトレンドを読み込んでいます。 |
|  | `map.sheet.state.nationalLoadingTitle` | Loading nationwide trends… | 전국 트렌드를 불러오는 중이에요 | 全国のトレンドを読み込んでいます… |
|  | `map.sheet.state.region-not-foundBody` | Try again from another location. | 다른 위치에서 다시 시도해 주세요. | 別の場所から、もう一度お試しください。 |
|  | `map.sheet.state.region-not-foundTitle` | We could not identify this area | 현재 지역을 판정하지 못했어요 | このエリアを特定できませんでした |
| 오류 | `map.sheet.state.region-resolution-failedBody` | The region lookup service did not respond. | 지역 판정 서비스가 응답하지 않았어요. | 地域検索サービスが応答しませんでした。 |
| 오류 | `map.sheet.state.region-resolution-failedTitle` | Could not identify your area | 지역 판정에 실패했어요 | 現在のエリアを特定できませんでした |
|  | `map.sheet.state.region-service-unavailableBody` | Please try again after the region service recovers. | 지역 서비스가 복구된 후 다시 시도해 주세요. | 地域サービスが復旧してから、もう一度お試しください。 |
|  | `map.sheet.state.region-service-unavailableTitle` | Local hot places are temporarily unavailable | 지역 핫플을 일시적으로 사용할 수 없어요 | 地域の人気スポットを一時的にご利用いただけません |
|  | `map.sheet.state.unauthorizedBody` | Sign in again and retry. | 다시 로그인한 후 시도해 주세요. | 再度ログインしてから、もう一度お試しください。 |
|  | `map.sheet.state.unauthorizedTitle` | Sign-in is required | 로그인이 필요해요 | ログインが必要です |
|  | `map.sheet.state.recommendationEmptyBody` | Change your location or recommendation radius and try again. | 위치나 추천 반경을 바꾼 뒤 다시 확인해 주세요. | 現在地またはおすすめの範囲を変更して、もう一度お試しください。 |
|  | `map.sheet.state.recommendationEmptyTitle` | No recommendations match your current filters | 현재 조건에 맞는 추천 장소가 없어요 | 現在の条件に合うおすすめはありません |
| 오류 | `map.sheet.state.recommendationErrorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | しばらくしてから、もう一度お試しください。 |
| 오류 | `map.sheet.state.recommendationErrorTitle` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | おすすめを読み込めませんでした |
|  | `map.sheet.state.recommendationLoadingBody` | Checking your location and travel context. | 현재 위치와 여행 맥락을 확인하고 있어요. | 現在地と旅行の状況を確認しています。 |
|  | `map.sheet.state.recommendationLoadingTitle` | Loading recommendations for you… | 나만을 위한 추천 장소를 불러오고 있어요 | あなたへのおすすめを読み込んでいます… |
|  | `map.detail.amenityEnglish` | English support | 영어응대 가능 | 英語対応 |
|  | `map.detail.amenityParking` | Parking available | 주차가능 | 駐車場あり |
|  | `map.detail.back` | Back to map | 지도로 돌아가기 | 地図に戻る |
|  | `map.detail.collapseTags` | Collapse additional tags | 추가 태그 접기 | 追加のタグを閉じる |
|  | `map.detail.coupon` | Coupons | 쿠폰 | クーポン |
|  | `map.detail.description` | About this place | 장소 소개 | この場所について |
|  | `map.detail.events` | Current events | 진행 중 이벤트 | 開催中のイベント |
|  | `map.detail.expandTags` | Show {{count}} hidden tags | 숨겨진 태그 {{count}}개 펼치기 | 非表示のタグを{{count}}件表示 |
|  | `map.detail.imageDetail` | View {{name}} photo {{count}} | {{name}} 사진 {{count}} 상세 보기 | {{name}}の写真{{count}}を表示 |
| 오류 | `map.detail.imageError` | Could not load photos. Try again | 사진을 불러오지 못했습니다. 다시 시도 | 写真を読み込めませんでした。もう一度お試しください |
|  | `map.detail.info` | Info | 정보 | 情報 |
|  | `map.detail.notice` | Operating notice | 운영 공지 | 営業のお知らせ |
|  | `map.detail.imageViewer.close` | Close photo | 사진 닫기 | 写真を閉じる |
|  | `map.detail.imageViewer.counter` | {{current}} / {{total}} | {{current}} / {{total}} | {{current}} / {{total}} |
|  | `map.detail.imageViewer.next` | Next photo | 다음 사진 | 次の写真 |
|  | `map.detail.imageViewer.photo` | {{name}} photo {{current}} of {{total}} | {{name}} 사진 {{total}}장 중 {{current}}번째 | {{name}}の写真 {{current}}/{{total}} |
|  | `map.detail.imageViewer.previous` | Previous photo | 이전 사진 | 前の写真 |
|  | `map.detail.participantCount_one` | {{count}} participant | {{count}}명 참여 | 参加者{{count}}名 |
|  | `map.detail.participantCount_other` | {{count}} participants | {{count}}명 참여 | 参加者{{count}}名 |
|  | `map.detail.photoReviews` | Photo reviews | 사진 리뷰 | 写真付きレビュー |
|  | `map.detail.preview` | View {{name}} details | {{name}} 상세 보기 | {{name}}の詳細を見る |
|  | `map.detail.reviewHighlights` | What visitors liked | 이런 점을 좋아해요! | 訪問者が気に入った点 |
|  | `map.detail.reviewCount_one` | {{count}} review | 리뷰 {{count}}개 | レビュー{{count}}件 |
|  | `map.detail.reviewCount_other` | {{count}} reviews | 리뷰 {{count}}개 | レビュー{{count}}件 |
|  | `map.detail.reviewEmpty` | No reviews yet. | 등록된 리뷰 정보가 없어요. | まだレビューがありません。 |
| 오류 | `map.detail.reviewError` | Could not load reviews. Try again | 리뷰를 불러오지 못했습니다. 다시 시도 | レビューを読み込めませんでした。もう一度お試しください |
|  | `map.detail.reviewLoading` | Loading reviews… | 리뷰를 불러오는 중입니다. | レビューを読み込んでいます… |
|  | `map.detail.reviews` | Reviews | 리뷰 | レビュー |
|  | `map.detail.verifiedCount_one` | {{count}} person verified this! | {{count}}명이 검증했어요! | {{count}}人が認証しました！ |
|  | `map.detail.verifiedCount_other` | {{count}} people verified this! | {{count}}명이 검증했어요! | {{count}}人が認証しました！ |
| 오류 | `map.detail.reservation.authError` | Sign-in required | 로그인이 필요합니다 | ログインが必要です |
|  | `map.detail.reservation.available` | Reserve | 예약하기 | 予約する |
|  | `map.detail.reservation.empty` | No schedules are currently available | 현재 예약 가능한 일정이 없습니다 | 現在予約できるスケジュールはありません |
| 오류 | `map.detail.reservation.error` | Could not load reservation availability | 예약 가능 여부를 불러오지 못했습니다 | 予約の空き状況を読み込めませんでした |
|  | `map.detail.reservation.full` | No reservation capacity is available | 예약 가능한 인원이 없습니다 | 予約できる枠がありません |
|  | `map.detail.reservation.loading` | Checking reservation availability | 예약 가능 여부를 확인하고 있습니다 | 予約の空き状況を確認しています |
|  | `map.detail.reservation.retry` | Try again | 다시 시도 | 再試行 |
|  | `map.locate` | My location | 내 위치 | 現在地 |
|  | `map.refreshing` | Refreshing map | 지도 새로고침 중 | 地図を更新しています |
|  | `map.location.deniedDescription` | The map is using a default area. Allow location access to show your position. | 기본 지역을 표시하고 있습니다. 현재 위치를 보려면 위치 권한을 허용해 주세요. | 地図は既定のエリアを表示しています。現在地を表示するには位置情報へのアクセスを許可してください。 |
|  | `map.location.deniedTitle` | Location access is off | 위치 권한이 꺼져 있습니다 | 位置情報へのアクセスがオフです |
| 오류 | `map.location.failedDescription` | The map is using a default area. Check location services and try again. | 기본 지역을 표시하고 있습니다. 위치 서비스를 확인한 후 다시 시도해 주세요. | 地図は既定のエリアを表示しています。位置情報サービスを確認して、もう一度お試しください。 |
| 오류 | `map.location.failedTitle` | Could not find your location | 현재 위치를 찾지 못했습니다 | 現在地が見つかりませんでした |
|  | `map.location.loading` | Finding your current location... | 현재 위치를 찾는 중입니다... | 現在地を探しています... |
|  | `map.location.openSettings` | Open settings | 설정 열기 | 設定を開く |
|  | `map.location.retry` | Check again | 다시 확인 | 再確認 |
|  | `map.recommendations.subtitle` | Pingdom recommends places {{userName}} might like! | 핑덤이 {{userName}}님이 좋아할만한 장소를 추천해드려요! | PingDomが{{userName}}さんにおすすめする場所です！ |
|  | `map.recommendations.verificationTitle` | Verify today and get a coupon! | 오늘 검증하고 쿠폰 받자! | 今日認証してクーポンをもらおう！ |
|  | `map.recommendations.reasons.activeBenefit` | A benefit is currently available here | 현재 이용할 수 있는 혜택이 있어요 | 現在利用できる特典があります |
|  | `map.recommendations.reasons.benefitAndReservable` | A place with an available benefit and booking | 혜택을 받고 바로 예약할 수 있어요 | 特典を受けてすぐに予約できます |
|  | `map.recommendations.reasons.contextMatch` | Matches your current travel plans | 현재 여행 목적과 잘 맞는 장소예요 | 現在の旅行の目的に合う場所です |
|  | `map.recommendations.reasons.exploration` | A recommendation for discovering somewhere new | 새로운 장소를 발견할 수 있는 추천이에요 | 新しい場所を発見できるおすすめです |
|  | `map.recommendations.reasons.freshContent` | Recently updated with new information | 최근 새로운 정보가 추가됐어요 | 最近新しい情報が追加されました |
|  | `map.recommendations.reasons.highConversion` | Often leads to real visits | 실제 방문으로 자주 이어지는 장소예요 | 実際の訪問につながることが多い場所です |
|  | `map.recommendations.reasons.highEngagement` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | 多くのユーザーが関心を寄せている場所です |
|  | `map.recommendations.reasons.nearby` | Close to your current location | 현재 위치에서 가까운 장소예요 | 現在地から近い場所です |
|  | `map.recommendations.reasons.neutral` | Recommended place | 추천 장소 | おすすめの場所 |
|  | `map.recommendations.reasons.personalSignal` | Matches your interests and activity | 관심사와 반응에 잘 맞는 장소예요 | 興味や行動に合う場所です |
|  | `map.recommendations.reasons.qualitySignal` | Has reliable place information | 신뢰도 높은 장소 정보가 있어요 | 信頼性の高い場所情報があります |
|  | `map.recommendations.reasons.reservable` | Currently available to book | 현재 예약할 수 있는 장소예요 | 現在予約できる場所です |
|  | `map.recommendations.explanations.fallback` | A place worth exploring | 둘러볼 만한 추천 장소예요 | 訪れてみる価値のある場所 |
|  | `map.recommendations.explanations.fresh` | A place receiving new attention | 최근 새롭게 주목받는 장소예요 | 新たに注目されている場所 |
|  | `map.recommendations.explanations.geo` | Close to your current location | 현재 위치에서 가까운 장소예요 | 現在地から近い場所 |
|  | `map.recommendations.explanations.personal` | Reflects your interests and activity | 관심사와 반응을 반영한 추천이에요 | 興味や行動を反映しています |
|  | `map.recommendations.explanations.popular` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | 多くの関心を集めている場所 |
|  | `map.recommendations.context.activity.attendEvent` | Events | 이벤트 참여 | イベント |
|  | `map.recommendations.context.activity.cafe` | Cafe visit | 카페 방문 | カフェ巡り |
|  | `map.recommendations.context.activity.eat` | Food | 식사 | グルメ |
|  | `map.recommendations.context.activity.explore` | Explore | 주변 탐색 | 散策 |
|  | `map.recommendations.context.activity.nightlife` | Nightlife | 나이트라이프 | ナイトライフ |
|  | `map.recommendations.context.activity.shop` | Shopping | 쇼핑 | ショッピング |
|  | `map.recommendations.context.purpose.beauty` | Beauty | 뷰티 | ビューティー |
|  | `map.recommendations.context.purpose.cafe` | Cafe | 카페 | カフェ |
|  | `map.recommendations.context.purpose.exhibition` | Exhibitions | 전시 | 展示 |
|  | `map.recommendations.context.purpose.fashion` | Fashion | 패션 | ファッション |
|  | `map.recommendations.context.purpose.food` | Food | 맛집 | グルメ |
|  | `map.recommendations.context.purpose.kPop` | K-POP | K-POP | K-POP |
|  | `map.recommendations.context.purpose.nightlife` | Nightlife | 나이트라이프 | ナイトライフ |
|  | `map.recommendations.context.purpose.other` | Other | 기타 | その他 |
|  | `map.recommendations.context.purpose.popUp` | Pop-ups | 팝업 | ポップアップ |
|  | `map.recommendations.limits.candidatePool` | The candidate pool was expanded because few places matched. | 조건에 맞는 장소가 적어 후보 범위를 넓혀 추천했어요. | 条件に合う場所が少ないため、候補の範囲を広げました。 |
|  | `map.recommendations.limits.interactedExcluded` | Places you already viewed were excluded. | 이미 확인한 장소를 제외해 추천했어요. | すでに閲覧した場所は除外しました。 |
|  | `map.recommendations.limits.operatingPriority` | Places currently operating were prioritized. | 현재 운영 중인 장소를 우선해 추천했어요. | 現在営業中の場所を優先しました。 |
|  | `map.recommendations.limits.radiusExpanded` | The search radius was expanded to find recommendations. | 추천 결과를 찾기 위해 검색 반경을 넓혔어요. | おすすめを見つけるために検索範囲を広げました。 |
|  | `map.recommendations.limits.requestClamped` | The recommendation count was adjusted to the server limit. | 서버 기준에 맞춰 추천 개수를 조정했어요. | おすすめの件数をサーバーの上限に合わせて調整しました。 |
| 접근성 | `map.search.accessibilityLabel` | Search places on the map | 지도 장소 검색 | 地図で場所を検索 |
|  | `map.search.confirm` | OK | 확인 | OK |
|  | `map.search.empty` | No search results | 검색 결과가 없습니다 | 検索結果がありません |
| 오류 | `map.search.failed` | Address search failed | 주소 검색에 실패했습니다 | 住所の検索に失敗しました |
|  | `map.search.placeholder` | Search places | 장소를 검색하세요 | 場所を検索 |
| 접근성 | `map.search.profileAccessibilityLabel` | Open my page | 마이페이지 열기 | マイページを開く |
|  | `map.search.statusPlaceholder` | Enter an address... | 주소를 입력하세요... | 住所を入力... |
|  | `map.title` | Nearby map | 주변 지도 | 周辺の地図 |
|  | `map.visibleCenter` | {{lat}}, {{lng}} | {{lat}}, {{lng}} | {{lat}}, {{lng}} |

## `notificationSettings`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `notificationSettings.back` | Back | 뒤로가기 | 戻る |
|  | `notificationSettings.contract.categories` | Server notification preferences | 서버 알림 수신 설정 | サーバーの通知設定 |
|  | `notificationSettings.contract.newHotplaceEnabled` | Hot place notifications | 핫플레이스 알림 | 人気スポットの通知 |
|  | `notificationSettings.contract.newLikeEnabled` | Like notifications | 좋아요 알림 | いいねの通知 |
| 접근성 | `notificationSettings.contract.categoryHint` | Saved to your account. Enabling checks device notification permission. | 계정에 저장됩니다. 켤 때 기기의 알림 권한을 확인합니다. | アカウントに保存されます。オンにすると端末の通知権限を確認します。 |
|  | `notificationSettings.contract.allUnsupported` | Unavailable: no allow-all policy exists. Device permission and category preferences are separate. | 미지원: 전체 허용 정책이 없습니다. 기기 권한과 항목별 수신 설정은 별개입니다. | 利用不可：すべて許可するポリシーはありません。端末の権限とカテゴリーの設定は別々です。 |
|  | `notificationSettings.contract.unsupported` | Unavailable: this category has no confirmed server setting. | 미지원: 이 항목에 대응하는 서버 설정이 확정되지 않았습니다. | 利用不可：このカテゴリーには確定したサーバー設定がありません。 |
|  | `notificationSettings.contract.nightUnsupported` | Unavailable: receiving notifications at night is not the same as quiet hours. | 미지원: 야간 알림 수신 허용은 방해 금지 시간과 같은 설정이 아닙니다. | 利用不可：夜間の通知受信はおやすみ時間とは異なります。 |
|  | `notificationSettings.contract.unknown` | The server has not provided a valid setting. This item cannot be changed. | 서버에서 올바른 설정값을 제공하지 않아 변경할 수 없습니다. | サーバーから有効な設定が提供されていません。この項目は変更できません。 |
|  | `notificationSettings.contract.quietHours` | Quiet hours | 방해 금지 시간 | おやすみ時間 |
|  | `notificationSettings.contract.quietReadOnly` | Read only: time validation and editing policy are not confirmed. No default schedule is saved. | 읽기 전용: 시간 검증과 편집 정책이 확정되지 않았습니다. 기본 시간을 임의로 저장하지 않습니다. | 読み取り専用：時間の検証と編集のポリシーが確定していません。既定のスケジュールは保存されません。 |
|  | `notificationSettings.contract.quietIncomplete` | Time or timezone information is missing or invalid. | 시간 또는 시간대 정보가 없거나 올바르지 않습니다. | 時間またはタイムゾーンの情報がないか、正しくありません。 |
|  | `notificationSettings.contract.invalidQuietHours` | Please check the quiet hours settings on the server. | 서버의 방해 금지 시간 설정을 확인해 주세요. | サーバーのおやすみ時間の設定を確認してください。 |
|  | `notificationSettings.contract.unauthorized` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | ログインの有効期限が切れました。再度ログインしてください。 |
|  | `notificationSettings.contract.forbidden` | You do not have permission to access notification settings. | 알림 설정에 접근할 권한이 없습니다. | 通知設定にアクセスする権限がありません。 |
| 오류 | `notificationSettings.contract.saveFailed` | Could not update notification settings. Please try again. | 알림 설정을 변경하지 못했습니다. 다시 시도해 주세요. | 通知設定を更新できませんでした。もう一度お試しください。 |
|  | `notificationSettings.permission.title` | Device notification permission | 기기 알림 권한 | 端末の通知権限 |
|  | `notificationSettings.permission.description` | Device permission and account preferences are separate. Change device permission in system settings. | 기기 권한과 계정의 수신 설정은 별개입니다. 기기 권한은 시스템 설정에서 변경할 수 있습니다. | 端末の権限とアカウントの設定は別々です。端末の権限はシステム設定で変更してください。 |
|  | `notificationSettings.permission.loading` | Checking device permission | 기기 권한 확인 중 | 端末の権限を確認しています |
|  | `notificationSettings.permission.authorized` | Notifications allowed | 알림 허용 | 通知が許可されています |
|  | `notificationSettings.permission.provisional` | Quiet notifications allowed | 조용한 알림 허용 | 目立たない通知が許可されています |
|  | `notificationSettings.permission.notDetermined` | Permission has not been requested. Enabling a category will request it. | 아직 권한을 요청하지 않았습니다. 알림 항목을 켤 때 요청합니다. | 権限はまだリクエストされていません。カテゴリーをオンにするとリクエストします。 |
|  | `notificationSettings.permission.denied` | Notification permission denied. Allow notifications in device settings to enable this category. | 알림 권한이 거부되었습니다. 이 항목을 켜려면 기기 설정에서 알림을 허용해 주세요. | 通知の権限が拒否されています。このカテゴリーをオンにするには、端末の設定で通知を許可してください。 |
|  | `notificationSettings.permission.blocked` | Notification permission blocked. Please allow it in device settings. | 알림 권한이 차단되었습니다. 기기 설정에서 허용해 주세요. | 通知の権限がブロックされています。端末の設定で許可してください。 |
|  | `notificationSettings.permission.unavailable` | Native notification support is unavailable in this environment. | 현재 환경에서는 네이티브 알림 기능을 사용할 수 없습니다. | この環境ではネイティブ通知を利用できません。 |
| 오류 | `notificationSettings.permission.error` | Could not check or request notification permission. Please try again. | 알림 권한 확인 또는 요청 중 오류가 발생했습니다. 다시 시도해 주세요. | 通知の権限を確認またはリクエストできませんでした。もう一度お試しください。 |
|  | `notificationSettings.permission.openSettings` | Open device notification settings | 기기 알림 설정 열기 | 端末の通知設定を開く |
| 오류 | `notificationSettings.error` | Could not load notification settings. | 알림 설정을 불러오지 못했어요. | 通知設定を読み込めませんでした。 |
|  | `notificationSettings.loading` | Loading notification settings | 알림 설정을 불러오는 중 | 通知設定を読み込んでいます |
|  | `notificationSettings.retry` | Try again | 다시 시도 | 再試行 |
|  | `notificationSettings.sections.interests` | Saved places & areas | 관심 장소 · 구역 | 保存した場所・エリア |
|  | `notificationSettings.sections.other` | Other | 기타 | その他 |
|  | `notificationSettings.sections.records` | My records & places | 내 기록 · 장소 | 自分の記録・場所 |
|  | `notificationSettings.sections.reports` | Reports | 리포트 | レポート |
|  | `notificationSettings.settings.favoriteMoodChange.description` | When recent tags and record trends change | 최근 태그와 기록 추세가 바뀌었을 때 | 最近のタグや記録の傾向が変わったとき |
|  | `notificationSettings.settings.favoriteMoodChange.label` | Changes around a saved place | 관심 장소 분위기 변화 | 保存した場所周辺の変化 |
|  | `notificationSettings.settings.firstRecordTrending.description` | Get notified when a place you First Recorded starts trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | 自分が最初に記録した場所が話題になったら通知します |
|  | `notificationSettings.settings.firstRecordTrending.label` | A place I recorded first is trending | 내가 먼저 기록한 장소 급상승 | 最初に記録した場所が話題に |
|  | `notificationSettings.settings.frequentAreaHotPlace.description` | When a new trending place appears in an area you frequent | 내 생활권에 새로 뜨는 장소가 생기면 | よく訪れるエリアに新しい人気スポットが現れたとき |
|  | `notificationSettings.settings.frequentAreaHotPlace.label` | New hot place in a frequent area | 자주 가는 구역 새 핫플 | よく行くエリアの新しい人気スポット |
|  | `notificationSettings.settings.marketingEvents.label` | Marketing & event updates | 마케팅 · 이벤트 정보 | マーケティング・イベント情報 |
|  | `notificationSettings.settings.nightNotifications.description` | Allow notifications between 21:00 and 08:00 | 21:00 – 08:00 사이 알림 허용 | 21:00〜08:00の通知を許可します |
|  | `notificationSettings.settings.nightNotifications.label` | Receive notifications at night | 야간 알림 받기 | 夜間に通知を受け取る |
|  | `notificationSettings.settings.pushAll.description` | Turning this off disables all notifications below | 끄면 아래 알림이 모두 발송되지 않아요 | オフにすると、以下のすべての通知がオフになります |
|  | `notificationSettings.settings.pushAll.label` | Allow all push notifications | 푸시 알림 전체 허용 | すべてのプッシュ通知を許可 |
|  | `notificationSettings.settings.recordNewTags.description` | When the status of a place you recorded changes | 내가 남긴 장소의 상태가 바뀔 때 | 自分が記録した場所の状態が変わったとき |
|  | `notificationSettings.settings.recordNewTags.label` | New tags added to my recorded place | 내 기록 장소에 새 태그 누적 | 記録した場所に新しいタグが追加 |
|  | `notificationSettings.settings.todayMissionArea.label` | Today’s mission area | 오늘의 미션 구역 | 今日のミッションエリア |
|  | `notificationSettings.settings.weeklyReport.description` | A weekly summary of this week’s discoveries and your records | 이번 주 발자국과 내 기록을 정리해 보내드려요 | 今週の発見と自分の記録を毎週まとめてお届けします |
|  | `notificationSettings.settings.weeklyReport.label` | Weekly report | 주간 리포트 | ウィークリーレポート |
|  | `notificationSettings.title` | Notification settings | 알림 설정 | 通知設定 |

## `offer`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `offer.cta.ended` | Offer ended | 종료된 혜택 | 終了した特典 |
|  | `offer.cta.issue` | Get coupon | 쿠폰 받기 | クーポンを受け取る |
|  | `offer.cta.notStarted` | Not started yet | 아직 시작 전 | まだ開始していません |
|  | `offer.cta.soldOut` | All claimed | 수량 모두 소진 | 配布終了 |
|  | `offer.cta.unavailable` | Cannot be claimed | 받을 수 없는 혜택 | 受け取れません |
|  | `offer.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 여행 일정이 있는 계정 | 有効な旅行日程があるアカウント |
|  | `offer.eligibility.PUBLIC` | Anyone | 누구나 | どなたでも |
|  | `offer.eligibility.UNKNOWN` | Conditions need review | 조건 확인 필요 | 条件の確認が必要です |
|  | `offer.expiry.ISSUE_PLUS_DAYS` | Valid for a set number of days after issue | 발급일로부터 정해진 기간 | 発行後、一定の日数のあいだ有効 |
|  | `offer.expiry.ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END` | Valid for a set number of days after issue, up to the offer end date | 발급일로부터 정해진 기간, 혜택 종료일까지 | 発行後、一定の日数のあいだ有効（特典終了日まで） |
|  | `offer.expiry.OFFER_END` | Valid until the offer ends | 혜택 종료일까지 | 特典終了まで有効 |
|  | `offer.expiry.UNKNOWN` | Validity needs review | 유효 기간 확인 필요 | 有効期間の確認が必要です |
|  | `offer.inventory.LIMITED` | Limited quantity | 수량 한정 | 数量限定 |
|  | `offer.inventory.UNKNOWN` | Quantity needs review | 수량 확인 필요 | 数量の確認が必要です |
|  | `offer.inventory.UNLIMITED` | No quantity limit | 수량 제한 없음 | 数量制限なし |
|  | `offer.remaining.limited_one` | {{count}} left | {{count}}개 남음 | 残り{{count}}枚 |
|  | `offer.remaining.limited_other` | {{count}} left | {{count}}개 남음 | 残り{{count}}枚 |
|  | `offer.remaining.unknown` | Remaining quantity not provided | 남은 수량 미제공 | 残り数量の情報がありません |
|  | `offer.remaining.unlimited` | No quantity limit | 수량 제한 없음 | 数量制限なし |
|  | `offer.statuses.CLOSED` | Closed | 종료됨 | 終了 |
|  | `offer.statuses.DRAFT` | Draft | 작성 중 | 下書き |
|  | `offer.statuses.PUBLISHED` | Available | 받을 수 있음 | 受け取り可能 |
|  | `offer.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | 状態の確認が必要です |

## `payment`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `payment.statuses.FAILED` | Payment failed | 결제 실패 | 決済失敗 |
|  | `payment.statuses.PAID` | Paid | 결제 완료 | 決済完了 |
|  | `payment.statuses.PROCESSING` | Payment in progress | 결제 진행 중 | 決済処理中 |
|  | `payment.statuses.REFUNDED` | Refunded | 환불 완료 | 返金完了 |
|  | `payment.statuses.REFUND_PROCESSING` | Refund in progress | 환불 진행 중 | 返金処理中 |
|  | `payment.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | 状態の確認が必要です |

## `myPage`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `myPage.back` | Back | 뒤로가기 | 戻る |
|  | `myPage.couponBox.empty` | You have no coupons yet | 보유한 쿠폰이 없어요 | まだクーポンがありません |
|  | `myPage.couponBox.emptyFiltered` | You have no {{status}} coupons | {{status}} 쿠폰이 없어요 | {{status}}のクーポンはありません |
| 오류 | `myPage.couponBox.error` | Could not load your coupons. | 쿠폰을 불러오지 못했어요. | クーポンを読み込めませんでした。 |
|  | `myPage.couponBox.fallbackDescription` | Discount coupon | 할인 쿠폰 | 割引クーポン |
|  | `myPage.couponBox.fallbackTitle` | Coupon | 쿠폰 | クーポン |
|  | `myPage.couponBox.filters.ALL` | All | 전체 | すべて |
|  | `myPage.couponBox.filters.EXPIRED` | Expired | 만료 | 期限切れ |
|  | `myPage.couponBox.filters.ISSUED` | Available | 사용 가능 | 利用可能 |
|  | `myPage.couponBox.filters.REDEEMED` | Used | 사용 완료 | 使用済み |
|  | `myPage.couponBox.loading` | Loading coupons | 쿠폰을 불러오는 중 | クーポンを読み込んでいます |
| 오류 | `myPage.couponBox.nextPageError` | Could not load more coupons. | 쿠폰을 더 불러오지 못했어요. | クーポンをさらに読み込めませんでした。 |
|  | `myPage.couponBox.nextPageRetry` | Load more | 더 불러오기 | さらに読み込む |
|  | `myPage.couponBox.status.CANCELED` | Canceled | 취소됨 | キャンセル済み |
|  | `myPage.couponBox.status.EXPIRED` | Expired | 만료 | 期限切れ |
|  | `myPage.couponBox.status.ISSUED` | Available | 사용 가능 | 利用可能 |
|  | `myPage.couponBox.status.REDEEMED` | Used | 사용 완료 | 使用済み |
|  | `myPage.couponBox.status.UNKNOWN` | Unavailable | 사용 불가 | 利用不可 |
|  | `myPage.couponBox.title` | Coupon box | 쿠폰함 | クーポンボックス |
| 접근성 | `myPage.couponDetail.codeA11yLabel` | Coupon code ending in {{tail}} | 쿠폰 코드, 끝 네 자리 {{tail}} | 末尾が{{tail}}のクーポンコード |
| 오류 | `myPage.couponDetail.error` | Could not load this coupon. | 쿠폰 정보를 불러오지 못했어요. | このクーポンを読み込めませんでした。 |
|  | `myPage.couponDetail.infoHeading` | Coupon info | 쿠폰 정보 | クーポン情報 |
|  | `myPage.couponDetail.loading` | Loading coupon | 쿠폰 정보를 불러오는 중 | クーポンを読み込んでいます |
|  | `myPage.couponDetail.noticeHeading` | Notice | 유의사항 | ご注意 |
| 접근성 | `myPage.couponDetail.qrHint` | Show this QR code to a store staff member before paying | 결제 전 매장 직원에게 QR 코드를 보여주세요 | お支払いの前に、このQRコードを店舗スタッフに提示してください |
|  | `myPage.couponDetail.qrUnavailable` | Could not draw the QR code. Please read the code above to the staff. | QR 코드를 표시하지 못했어요. 위 코드를 직원에게 알려주세요. | QRコードを表示できませんでした。上のコードをスタッフにお伝えください。 |
| 정책 | `myPage.couponDetail.notices.0` | Each account can use this coupon only once. | 쿠폰은 계정당 1회만 사용할 수 있어요. | このクーポンは1アカウントにつき1回のみ使用できます。 |
| 정책 | `myPage.couponDetail.notices.1` | The coupon disappears automatically once it expires. | 유효기간이 지나면 쿠폰이 자동으로 사라져요. | 有効期限が過ぎると、クーポンは自動的に消滅します。 |
| 정책 | `myPage.couponDetail.notices.2` | It cannot be combined with other coupons or discounts. | 다른 쿠폰 및 할인 혜택과 중복 사용은 불가해요. | ほかのクーポンや割引との併用はできません。 |
| 정책 | `myPage.couponDetail.notices.3` | Cancelling the reservation restores the coupon automatically. | 예약을 취소하면 쿠폰이 자동으로 복구돼요. | 予約をキャンセルすると、クーポンは自動的に戻ります。 |
|  | `myPage.couponDetail.expiredNotice` | This coupon expired on {{date}} | {{date}}에 만료된 쿠폰이에요 | このクーポンは{{date}}に期限切れになりました |
|  | `myPage.couponDetail.redeemedNotice` | This coupon was used on {{date}} | {{date}}에 사용한 쿠폰이에요 | このクーポンは{{date}}に使用されました |
|  | `myPage.couponDetail.redeemedNoticeUnknown` | This coupon has already been used | 이미 사용한 쿠폰이에요 | このクーポンはすでに使用されています |
|  | `myPage.couponDetail.reserve` | Make a reservation | 예약하러 가기 | 予約する |
|  | `myPage.couponDetail.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 진행 중인 여행 일정이 있는 계정 | 有効な旅行日程があるアカウント |
|  | `myPage.couponDetail.eligibility.PUBLIC` | Anyone | 누구나 | どなたでも |
|  | `myPage.couponDetail.rows.eligibility` | Who can use | 발급 대상 | 利用対象 |
|  | `myPage.couponDetail.rows.period` | Offer period | 행사 기간 | 特典期間 |
|  | `myPage.couponDetail.rows.stores` | Where to use | 사용 가능 매장 | 利用できる店舗 |
|  | `myPage.couponDetail.rows.usage` | How to use | 사용처 | 利用方法 |
|  | `myPage.couponDetail.rows.validity` | Valid for | 사용 가능 기간 | 有効期間 |
|  | `myPage.couponDetail.validityDays_one` | {{count}} day after issue | 발급 후 {{count}}일 | 発行後{{count}}日間 |
|  | `myPage.couponDetail.validityDays_other` | {{count}} days after issue | 발급 후 {{count}}일 | 発行後{{count}}日間 |
|  | `myPage.couponDetail.title` | Coupon detail | 쿠폰상세 | クーポンの詳細 |
|  | `myPage.couponDetail.unavailable` | This coupon has been used or has expired | 이미 사용했거나 만료된 쿠폰이에요 | このクーポンは使用済みか、期限切れです |
| 오류 | `myPage.profileEdit.avatarChangeFailed` | Could not change the profile image. Please try again. | 프로필 이미지를 변경하지 못했습니다. 다시 시도해주세요. | プロフィール画像を変更できませんでした。もう一度お試しください。 |
|  | `myPage.profileEdit.avatarPermissionDenied` | Photo library access is required to change your profile image. | 프로필 이미지를 변경하려면 사진 접근 권한이 필요합니다. | プロフィール画像を変更するには、写真ライブラリへのアクセスが必要です。 |
|  | `myPage.profileEdit.avatarUploading` | Uploading profile image | 프로필 이미지 업로드 중 | プロフィール画像をアップロードしています |
|  | `myPage.profileEdit.changeAvatar` | Change profile image | 프로필 이미지 변경 | プロフィール画像を変更 |
|  | `myPage.profileEdit.confirmPassword` | Confirm new password | 새 비밀번호 확인 | 新しいパスワード（確認） |
|  | `myPage.profileEdit.confirmPasswordPlaceholder` | Re-enter the new password | 새 비밀번호를 다시 입력하세요 | 新しいパスワードをもう一度入力 |
|  | `myPage.profileEdit.currentPassword` | Current password | 현재 비밀번호 | 現在のパスワード |
|  | `myPage.profileEdit.currentPasswordInvalid` | Your current password is incorrect | 현재 비밀번호가 올바르지 않습니다 | 現在のパスワードが正しくありません |
|  | `myPage.profileEdit.currentPasswordPlaceholder` | Enter your current password | 현재 비밀번호를 입력하세요 | 現在のパスワードを入力 |
|  | `myPage.profileEdit.currentPasswordRequired` | Enter your current password to set a new one | 비밀번호를 변경하려면 현재 비밀번호를 입력하세요 | 新しいパスワードを設定するには、現在のパスワードを入力してください |
|  | `myPage.profileEdit.hidePassword` | Hide {{field}} | {{field}} 숨기기 | {{field}}を隠す |
|  | `myPage.profileEdit.infoTitle` | Edit info | 정보 수정 | 情報の編集 |
|  | `myPage.profileEdit.newPassword` | New password | 새 비밀번호 | 新しいパスワード |
|  | `myPage.profileEdit.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | 8文字以上 |
| 오류 | `myPage.profileEdit.passwordChangeFailed` | Could not change the password. | 비밀번호를 변경하지 못했습니다. | パスワードを変更できませんでした。 |
|  | `myPage.profileEdit.passwordChangePartialFailure` | The username was changed, but the password was not. {{reason}} | 아이디는 변경했지만 비밀번호는 변경하지 못했습니다. {{reason}} | ユーザー名は変更されましたが、パスワードは変更されませんでした。{{reason}} |
|  | `myPage.profileEdit.passwordMismatch` | The new passwords do not match | 새 비밀번호가 서로 다릅니다 | 新しいパスワードが一致しません |
|  | `myPage.profileEdit.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | パスワードは8文字以上で入力してください |
|  | `myPage.profileEdit.save` | Save changes | 변경 사항 저장하기 | 変更を保存 |
|  | `myPage.profileEdit.saving` | Saving... | 저장 중... | 保存しています... |
|  | `myPage.profileEdit.showPassword` | Show {{field}} | {{field}} 보기 | {{field}}を表示 |
|  | `myPage.profileEdit.title` | Edit profile | 프로필 편집 | プロフィールを編集 |
|  | `myPage.profileEdit.username` | Username | 아이디 | ユーザー名 |
| 오류 | `myPage.profileEdit.usernameChangeFailed` | Could not change the username. | 아이디를 변경하지 못했습니다. | ユーザー名を変更できませんでした。 |
|  | `myPage.profileEdit.usernameLengthInvalid` | Username must be between 4 and 50 characters. | 아이디는 4자 이상 50자 이하여야 합니다. | ユーザー名は4〜50文字で入力してください。 |
|  | `myPage.profileEdit.usernameRequired` | Enter a username. | 아이디를 입력해주세요. | ユーザー名を入力してください。 |
| 오류 | `myPage.profileError` | Could not load your profile. | 프로필을 불러오지 못했어요. | プロフィールを読み込めませんでした。 |
|  | `myPage.profileLoading` | Loading your profile | 프로필을 불러오는 중 | プロフィールを読み込んでいます |
|  | `myPage.profileUnavailable` | Profile unavailable | 프로필 정보 없음 | プロフィールを表示できません |
|  | `myPage.retry` | Try again | 다시 시도 | 再試行 |
|  | `myPage.settings` | Settings | 설정 | 設定 |
|  | `myPage.stats.coupons` | Coupons | 쿠폰 | クーポン |
|  | `myPage.stats.reservations` | Reservations | 예약 | 予約 |
|  | `myPage.stats.reviews` | Reviews | 리뷰 | レビュー |
|  | `myPage.title` | My page | 마이 페이지 | マイページ |
| 오류 | `myPage.travel.error` | Could not load your travel schedule. | 여행 일정을 불러오지 못했어요. | 旅行日程を読み込めませんでした。 |
|  | `myPage.travel.loading` | Loading your travel schedule | 여행 일정을 불러오는 중 | 旅行日程を読み込んでいます |
|  | `myPage.travel.nextMonth` | Next month | 다음 달 | 翌月 |
|  | `myPage.travel.notEditable` | This travel schedule can no longer be edited. | 이 여행 일정은 더 이상 변경할 수 없어요. | この旅行日程は編集できなくなりました。 |
|  | `myPage.travel.periodOverlap` | These dates overlap another travel schedule. | 다른 여행 일정과 기간이 겹쳐요. | この日程はほかの旅行日程と重なっています。 |
|  | `myPage.travel.previousMonth` | Previous month | 이전 달 | 前月 |
|  | `myPage.travel.saving` | Saving dates... | 날짜 저장 중... | 日程を保存しています... |
|  | `myPage.travel.startDateInPast` | Choose today or a future date. | 오늘 또는 이후 날짜를 선택해주세요. | 今日以降の日付を選択してください。 |
|  | `myPage.travel.title` | My trips | 나의 여행 | マイトリップ |
| 오류 | `myPage.travel.updateError` | Could not save your travel dates. | 여행 날짜를 저장하지 못했어요. | 旅行日程を保存できませんでした。 |
|  | `myPage.travel.weekdays.sun` | S | S | 日 |
|  | `myPage.travel.weekdays.mon` | M | M | 月 |
|  | `myPage.travel.weekdays.tue` | T | T | 火 |
|  | `myPage.travel.weekdays.wed` | W | W | 水 |
|  | `myPage.travel.weekdays.thu` | T | T | 木 |
|  | `myPage.travel.weekdays.fri` | F | F | 金 |
|  | `myPage.travel.weekdays.sat` | S | S | 土 |
|  | `myPage.verifiedPlaces.empty` | No verified places yet | 아직 검증한 장소가 없어요 | まだ認証した場所はありません |
| 오류 | `myPage.verifiedPlaces.error` | Could not load your verified places. | 인증한 장소를 불러오지 못했어요. | 認証した場所を読み込めませんでした。 |
|  | `myPage.verifiedPlaces.favorite` | Save place | 장소 저장 | 場所を保存 |
|  | `myPage.verifiedPlaces.loading` | Loading verified places | 인증한 장소를 불러오는 중 | 認証した場所を読み込んでいます |
|  | `myPage.verifiedPlaces.title` | Verified places | 검증한 장소 | 認証した場所 |
|  | `myPage.verifiedPlaces.unfavorite` | Remove saved place | 저장 취소 | 保存した場所を削除 |

## `settings`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `settings.support.loading` | Loading | 불러오는 중 | 読み込んでいます |
| 오류 | `settings.support.error` | Could not load | 불러오지 못했습니다 | 読み込めませんでした |
|  | `settings.support.empty` | No information | 정보 없음 | 情報がありません |
|  | `settings.support.navigationUnavailable` | Navigation is unavailable for this screen. Return to settings and try again. | 이 화면의 탐색 연결을 사용할 수 없습니다. 설정으로 돌아가 다시 시도해 주세요. | この画面には移動できません。設定に戻って、もう一度お試しください。 |
|  | `settings.support.guide` | Unavailable feature. Opens an explanation. | 미지원 기능입니다. 사유 안내를 엽니다. | 利用できない機能です。説明を開きます。 |
|  | `settings.support.emailEdit` | Edit email | 이메일 수정 | メールアドレスを編集 |
|  | `settings.support.emailReason` | Direct email editing is unavailable because no update contract is published. | 이메일 직접 수정 계약이 공개되지 않아 사용할 수 없습니다. | 更新の仕様が公開されていないため、メールアドレスを直接編集することはできません。 |
|  | `settings.support.oauth` | Connected accounts | 연결된 계정 | 連携アカウント |
|  | `settings.support.oauthReason` | The server does not provide a connected-account status query. | 서버에서 계정 연결 상태 조회를 제공하지 않습니다. | サーバーは連携アカウントの状態照会を提供していません。 |
|  | `settings.support.checkInCount` | Check-ins | 체크인 수 | チェックイン |
|  | `settings.support.reviewCount` | My reviews | 내 리뷰 수 | 自分のレビュー |
|  | `settings.support.verifiedCount` | Verified places | 검증한 장소 | 認証した場所 |
|  | `settings.support.verifiedReason` | Check-in totals count visits, not unique verified places. A verified-place total is unavailable. | 체크인 수는 방문 횟수이며 고유한 검증 장소 수가 아닙니다. 검증 장소 수는 제공되지 않습니다. | チェックイン数は訪問回数であり、認証した場所の数ではありません。認証した場所の合計は利用できません。 |
| 오류 | `settings.support.logoutError` | Could not complete logout. Please check your sign-in state. | 로그아웃을 완료하지 못했습니다. 로그인 상태를 확인해 주세요. | ログアウトを完了できませんでした。ログイン状態を確認してください。 |
|  | `settings.export.title` | My data | 내 데이터 | マイデータ |
|  | `settings.export.download` | Download my data | 내 데이터 다운로드 | マイデータをダウンロード |
|  | `settings.export.confirm` | Prepare a JSON file containing your personal data? Choose where to save it in the share sheet. | 개인정보가 포함된 JSON 파일을 준비할까요? 공유 화면에서 저장 위치를 선택해 주세요. | 個人データを含むJSONファイルを準備しますか？保存先は共有シートで選択してください。 |
|  | `settings.export.cancel` | Cancel | 취소 | キャンセル |
|  | `settings.export.description` | Export the data provided by your account. This does not download location history or delete data. | 계정에서 제공하는 데이터를 내보냅니다. 위치 기록 다운로드나 데이터 삭제 기능은 아닙니다. | アカウントが提供するデータを書き出します。位置情報の履歴のダウンロードやデータの削除は行いません。 |
|  | `settings.export.loading` | Preparing the file… | 파일을 준비하는 중입니다. | ファイルを準備しています… |
|  | `settings.export.cancelled` | Download cancelled. | 다운로드를 취소했습니다. | ダウンロードをキャンセルしました。 |
| 오류 | `settings.export.error` | Could not download. Please try again. | 다운로드하지 못했습니다. 다시 시도해 주세요. | ダウンロードできませんでした。もう一度お試しください。 |
|  | `settings.export.prepared` | File prepared. Saving or cancelling in the share sheet cannot be confirmed by the app. | 파일을 준비했습니다. 공유 화면에서의 저장 또는 취소 여부는 앱이 확인할 수 없습니다. | ファイルを準備しました。共有シートでの保存やキャンセルは、アプリでは確認できません。 |
|  | `settings.appearance.dark` | Dark mode | 다크 모드 | ダークモード |
|  | `settings.appearance.description` | Choose whether PingDom follows your device appearance or uses a fixed mode. | 기기 화면 설정을 따르거나 원하는 화면 모드를 고정할 수 있어요. | PingDomの外観を端末の設定に合わせるか、固定のモードにするかを選択してください。 |
|  | `settings.appearance.light` | Light mode | 라이트 모드 | ライトモード |
|  | `settings.appearance.section` | Appearance | 화면 모드 | 外観 |
|  | `settings.appearance.selected` | Selected | 선택됨 | 選択中 |
|  | `settings.appearance.system` | Use system setting | 시스템 설정 사용 | システム設定を使用 |
|  | `settings.appearance.title` | Appearance | 화면 모드 | 外観 |
|  | `settings.language.description` | Choose the language used throughout PingDom. | 핑덤에서 사용할 언어를 선택해 주세요. | PingDom全体で使用する言語を選択してください。 |
|  | `settings.language.english` | English | 영어 | 英語 |
|  | `settings.language.japanese` | 日本語 | 日本語 | 日本語 |
|  | `settings.language.korean` | Korean | 한국어 | 韓国語 |
|  | `settings.language.section` | Language | 언어 | 言語 |
|  | `settings.language.selected` | Selected | 선택됨 | 選択中 |
|  | `settings.language.title` | Language | 언어 설정 | 言語 |
| 정책 | `settings.account.deleteDescription` | Deleting your account permanently removes your records and First Recorder history. | 탈퇴하면 내가 남긴 기록과 First Recorder 이력이 모두 사라져요. | アカウントを削除すると、記録とファーストレコーダーの履歴が完全に削除されます。 |
|  | `settings.account.email` | Email | 이메일 | メールアドレス |
|  | `settings.account.items.coupons` | Coupons | 쿠폰 | クーポン |
| 정책 | `settings.account.items.deleteAccount` | Delete account | 회원 탈퇴 | アカウントを削除 |
|  | `settings.account.items.loginInformation` | Login information | 로그인 정보 | ログイン情報 |
|  | `settings.account.items.loginInformationDescription` | Email and password | 이메일 및 비밀번호 | メールアドレスとパスワード |
|  | `settings.account.items.logout` | Log out | 로그아웃 | ログアウト |
|  | `settings.account.items.myRecords` | My records | 내 기록 | 自分の記録 |
|  | `settings.account.loginSection` | Login information | 로그인 정보 | ログイン情報 |
|  | `settings.account.sections.account` | Account | 계정 | アカウント |
|  | `settings.account.sections.activity` | Activity | 활동 | アクティビティ |
|  | `settings.account.sections.session` | Session | 세션 | セッション |
|  | `settings.account.title` | Account management | 계정 관리 | アカウント管理 |
|  | `settings.account.username` | Username | 아이디 | ユーザー名 |
|  | `settings.back` | Back | 뒤로가기 | 戻る |
| 정책 | `settings.deleteAccount` | Delete account | 회원 탈퇴 | アカウントを削除 |
|  | `settings.details.appInformation.description` | App information will be available in a later update. | 앱 정보는 추후 업데이트에서 제공할 예정입니다. | アプリ情報は今後のアップデートで提供される予定です。 |
|  | `settings.details.appInformation.title` | App information | 앱 정보 | アプリ情報 |
|  | `settings.details.coupons.description` | The coupon box will be connected in a separate update. | 쿠폰 보관함은 별도 업데이트에서 연결할 예정입니다. | クーポンボックスは別のアップデートで連携される予定です。 |
|  | `settings.details.coupons.title` | Coupons | 쿠폰 | クーポン |
|  | `settings.details.dataManagement.description` | Data download and deletion will be connected after its policy is defined. | 데이터 다운로드와 삭제는 정책 확정 후 연결할 예정입니다. | データのダウンロードと削除は、ポリシーが決まり次第連携される予定です。 |
|  | `settings.details.dataManagement.title` | Download or delete data | 데이터 다운로드 · 삭제 | データのダウンロード・削除 |
| 정책 | `settings.details.deleteAccount.description` | Account deletion is unavailable until reauthentication and confirmation policies are defined. Your account has not been changed. | 재인증과 최종 확인 정책이 정해지지 않아 회원 탈퇴를 사용할 수 없습니다. 계정에는 아무 변경도 적용되지 않았습니다. | 再認証と確認のポリシーが決まるまで、アカウントは削除できません。アカウントは変更されていません。 |
| 정책 | `settings.details.deleteAccount.title` | Delete account | 회원 탈퇴 | アカウントを削除 |
|  | `settings.details.footprintMap.description` | There is no footprint map screen or matching data contract yet. | 발자국 지도 전용 화면과 데이터 계약이 아직 없습니다. | 足あとマップの画面と対応するデータ仕様はまだありません。 |
|  | `settings.details.footprintMap.title` | My footprint map | 내 발자국 지도 | マイ足あとマップ |
|  | `settings.details.locationSettings.description` | Location settings will be connected in a separate update. | 위치 정보 설정은 별도 업데이트에서 연결할 예정입니다. | 位置情報の設定は別のアップデートで連携される予定です。 |
|  | `settings.details.locationSettings.title` | Location settings | 위치 정보 설정 | 位置情報の設定 |
|  | `settings.details.loginInformation.description` | Login information management will be connected in a separate update. | 로그인 정보 관리는 별도 업데이트에서 연결할 예정입니다. | ログイン情報の管理は別のアップデートで連携される予定です。 |
|  | `settings.details.loginInformation.title` | Login information | 로그인 정보 | ログイン情報 |
|  | `settings.details.logout.description` | Logout is not connected yet. You are still signed in. | 로그아웃은 아직 연결되지 않았습니다. 로그인 상태가 유지됩니다. | ログアウトはまだ連携されていません。ログインしたままです。 |
|  | `settings.details.logout.title` | Log out | 로그아웃 | ログアウト |
|  | `settings.details.myRecords.description` | Record management has no dedicated screen or defined scope yet. Reviews and check-ins are different records. | 내 기록 관리의 범위와 전용 화면이 정해지지 않았습니다. 리뷰와 체크인은 서로 다른 기록입니다. | 記録の管理には専用の画面や範囲がまだ定義されていません。レビューとチェックインは別の記録です。 |
|  | `settings.details.myRecords.title` | Manage my records | 내 기록 관리 | 自分の記録を管理 |
| 정책 | `settings.details.notices.description` | An official notices source and screen have not been configured. | 공식 공지사항 제공 경로와 화면이 아직 연결되지 않았습니다. | 公式のお知らせの提供元と画面はまだ設定されていません。 |
| 정책 | `settings.details.notices.title` | Notices | 공지사항 | お知らせ |
|  | `settings.details.notificationSettings.description` | Notification settings will be connected in a separate update. | 알림 설정은 별도 업데이트에서 연결할 예정입니다. | 通知設定は別のアップデートで連携される予定です。 |
|  | `settings.details.notificationSettings.title` | Notification settings | 알림 설정 | 通知設定 |
|  | `settings.details.passwordChange.description` | Password change is not connected yet. Your password has not been changed. | 비밀번호 변경은 아직 연결되지 않았습니다. 비밀번호에는 아무 변경도 적용되지 않았습니다. | パスワードの変更はまだ連携されていません。パスワードは変更されていません。 |
|  | `settings.details.passwordChange.title` | Change password | 비밀번호 변경 | パスワードを変更 |
| 정책 | `settings.details.privacyPolicy.description` | The approved privacy policy document and its URL have not been configured. | 승인된 개인정보 처리방침 문서와 URL이 아직 연결되지 않았습니다. | 承認されたプライバシーポリシーの文書とURLはまだ設定されていません。 |
| 정책 | `settings.details.privacyPolicy.title` | Privacy policy | 개인정보 처리방침 | プライバシーポリシー |
| 정책 | `settings.details.privacySettings.description` | Privacy settings will be connected in a separate update. | 개인정보 설정은 별도 업데이트에서 연결할 예정입니다. | プライバシー設定は別のアップデートで連携される予定です。 |
| 정책 | `settings.details.privacySettings.title` | Privacy settings | 개인정보 설정 | プライバシー設定 |
|  | `settings.details.savedPlaces.description` | A dedicated saved-place management screen is not defined yet. | 저장 장소 관리 전용 화면이 아직 정의되지 않았습니다. | 保存した場所を管理する専用画面はまだ定義されていません。 |
|  | `settings.details.savedPlaces.title` | Manage saved places | 관심 장소 관리 | 保存した場所を管理 |
| 정책 | `settings.details.terms.description` | The approved terms document and its URL have not been configured. | 승인된 이용약관 문서와 URL이 아직 연결되지 않았습니다. | 承認された利用規約の文書とURLはまだ設定されていません。 |
| 정책 | `settings.details.terms.title` | Terms of service | 이용약관 | 利用規約 |
|  | `settings.location.title` | Location & privacy | 위치·개인정보 | 位置情報とプライバシー |
|  | `settings.location.locationSection` | Location information | 위치 정보 | 位置情報 |
|  | `settings.location.visibilitySection` | Visibility | 공개 범위 | 公開範囲 |
|  | `settings.location.dataSection` | Data management | 데이터 관리 | データ管理 |
|  | `settings.location.description` | Check device location permission and supported features. This screen does not collect your location. | 기기 위치 권한과 지원되는 기능을 확인하세요. 이 화면에서는 위치를 수집하지 않습니다. | 端末の位置情報の権限と対応機能を確認します。この画面では位置情報を収集しません。 |
|  | `settings.location.device` | Device location permission | 기기 위치 권한 | 端末の位置情報の権限 |
|  | `settings.location.foreground` | Collect location only while recording | 기록할 때만 위치 수집 | 記録中のみ位置情報を収集 |
|  | `settings.location.verification` | GPS on-site verification | GPS 현장 인증 | GPSによる現地認証 |
|  | `settings.location.profileVisibility` | Profile visibility | 프로필 공개 | プロフィールの公開範囲 |
|  | `settings.location.nickname` | Show nickname in place history | 장소 기록에 닉네임 표시 | 場所の履歴にニックネームを表示 |
|  | `settings.location.download` | Export my data | 내 데이터 내보내기 | マイデータを書き出す |
| 정책 | `settings.location.deleteHistory` | Delete all location history | 위치 기록 전체 삭제 | 位置情報の履歴をすべて削除 |
|  | `settings.location.permissionStates.loading` | Checking | 확인 중 | 確認中 |
|  | `settings.location.permissionStates.granted` | Allowed | 허용됨 | 許可済み |
|  | `settings.location.permissionStates.denied` | Permission needed | 권한 필요 | 権限が必要です |
|  | `settings.location.permissionStates.restricted` | Allow in device settings | 설정에서 허용 필요 | 端末の設定で許可してください |
|  | `settings.location.permissionStates.unavailable` | Unavailable | 사용할 수 없음 | 利用不可 |
| 오류 | `settings.location.permissionStates.error` | Could not check permission | 확인 실패 | 権限を確認できませんでした |
|  | `settings.location.request` | Request location permission | 위치 권한 요청 | 位置情報の権限をリクエスト |
|  | `settings.location.openSettings` | Open device settings | 기기 설정 열기 | 端末の設定を開く |
|  | `settings.location.retry` | Check again | 다시 확인 | 再確認 |
| 오류 | `settings.location.settingsError` | Could not open device settings. Please try again. | 기기 설정을 열지 못했습니다. 다시 시도해 주세요. | 端末の設定を開けませんでした。もう一度お試しください。 |
|  | `settings.location.permissionNotice` | Change or revoke permission in device settings. This screen does not start location tracking. | 권한 변경·해제는 기기 설정에서 할 수 있습니다. 이 화면에서는 위치 추적을 시작하지 않습니다. | 権限の変更や取り消しは端末の設定で行ってください。この画面では位置情報の追跡を開始しません。 |
|  | `settings.location.capability.loading` | Checking availability | 사용 가능 여부 확인 중 | 利用可否を確認中 |
|  | `settings.location.capability.granted` | Location permission allows use | 위치 권한이 있어 사용 가능 | 位置情報の権限により利用できます |
|  | `settings.location.capability.denied` | Location permission required | 위치 권한이 필요함 | 位置情報の権限が必要です |
|  | `settings.location.capability.restricted` | Permission must be allowed in device settings | 기기 설정에서 위치 권한 허용이 필요함 | 端末の設定で権限を許可する必要があります |
|  | `settings.location.capability.unavailable` | Unavailable on this device | 현재 기기에서 사용할 수 없음 | この端末では利用できません |
| 오류 | `settings.location.capability.error` | Could not check availability | 사용 가능 여부 확인 실패 | 利用可否を確認できませんでした |
|  | `settings.location.foregroundDescription` | Not supported. A policy for saving this choice is not available. This is separate from periodic location collection. | 지원되지 않음 · 이 선택을 저장할 정책이 아직 없습니다. 주기적인 위치 수집과는 별개입니다. | 未対応です。この選択を保存するポリシーはありません。定期的な位置情報の収集とは別の設定です。 |
|  | `settings.location.footprintDescription` | Coming soon. A map of your location history is not available yet. | 준비 중 · 내 위치 기록을 보여주는 지도는 아직 지원하지 않습니다. | 近日公開予定です。位置情報の履歴マップはまだご利用いただけません。 |
|  | `settings.location.visibilityDescription` | Not supported. Profile visibility cannot be saved yet. | 지원되지 않음 · 프로필 공개 범위를 저장하는 기능이 아직 없습니다. | 未対応です。プロフィールの公開範囲はまだ保存できません。 |
|  | `settings.location.nicknameDescription` | Not supported. Nickname visibility cannot be saved yet. | 지원되지 않음 · 닉네임 표시 여부를 저장하는 기능이 아직 없습니다. | 未対応です。ニックネームの公開設定はまだ保存できません。 |
|  | `settings.location.downloadDescription` | Export account information and other supported user data. This is not a location history download. | 계정 정보 등 지원되는 사용자 데이터를 내보냅니다. 위치 기록 다운로드가 아닙니다. | アカウント情報などの対応しているユーザーデータを書き出します。位置情報の履歴のダウンロードではありません。 |
|  | `settings.location.policyDescription` | Coming soon. The approved privacy policy document is not connected yet. | 준비 중 · 승인된 개인정보 처리방침 문서가 아직 연결되지 않았습니다. | 近日公開予定です。承認されたプライバシーポリシーの文書はまだ連携されていません。 |
| 정책 | `settings.location.deleteDescription` | Not supported. Deleting location history separately is not available. No data will be deleted here. | 지원되지 않음 · 위치 기록만 삭제하는 기능이 아직 없습니다. 여기서는 어떤 데이터도 삭제하지 않습니다. | 未対応です。位置情報の履歴だけを削除することはできません。ここではデータは削除されません。 |
|  | `settings.logout` | Log out | 로그아웃 | ログアウト |
|  | `settings.notifications.hotplace` | A place I recorded becomes popular | 내가 먼저 기록한 장소 급상승 | 自分が記録した場所が人気に |
|  | `settings.notifications.hotplaceDescription` | Get updates when your First Recorder place is trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | ファーストレコーダーの場所が話題になったらお知らせします |
|  | `settings.notifications.like` | New activity on my recorded places | 내 기록 장소에 새 반응 | 記録した場所への新しい反応 |
|  | `settings.notifications.likeDescription` | Get updates when people react to your records | 내가 남긴 장소의 새 반응을 알려드려요 | 自分の記録に反応があったらお知らせします |
| 오류 | `settings.notifications.loadFailed` | Notification settings could not be loaded. | 알림 설정을 불러오지 못했어요. | 通知設定を読み込めませんでした。 |
|  | `settings.notifications.otherSection` | Other | 기타 | その他 |
|  | `settings.notifications.pushAll` | Allow all push notifications | 푸시 알림 전체 허용 | すべてのプッシュ通知を許可 |
|  | `settings.notifications.pushAllDescription` | You can still receive important account notices | 끄면 안내 알림만 받을 수 있어요 | 重要なアカウントのお知らせは引き続き受け取れます |
|  | `settings.notifications.quiet` | Quiet hours | 야간 알림 받기 | おやすみ時間 |
|  | `settings.notifications.quietDescription` | Use the quiet hours saved to your account | 계정에 저장된 방해 금지 시간을 사용해요 | アカウントに保存されたおやすみ時間を使用します |
|  | `settings.notifications.recordsSection` | My records & places | 내 기록 · 장소 | 自分の記録・場所 |
|  | `settings.notifications.title` | Notification settings | 알림 설정 | 通知設定 |
| 오류 | `settings.notifications.updateFailedDescription` | Your previous setting was restored. Please try again. | 이전 설정으로 되돌렸어요. 다시 시도해주세요. | 以前の設定に戻しました。もう一度お試しください。 |
| 오류 | `settings.notifications.updateFailedTitle` | Could not update notifications | 알림 설정을 변경하지 못했어요 | 通知設定を更新できませんでした |
|  | `settings.pending.back` | Back to settings | 설정으로 돌아가기 | 設定に戻る |
|  | `settings.pending.title` | Coming soon | 준비 중인 기능입니다 | 近日公開予定 |
|  | `settings.rows.accountInfo` | Username · Email | 아이디 · 이메일 | ユーザー名 · メールアドレス |
|  | `settings.rows.dataManagement` | Download · delete data | 데이터 다운로드 · 삭제 | データのダウンロード · 削除 |
|  | `settings.rows.favoritePlaces` | Manage favorite places | 관심 장소 관리 | お気に入りの場所を管理 |
|  | `settings.rows.footprintMap` | My footprint map | 내 발자국 지도 | マイ足あとマップ |
|  | `settings.rows.locationSettings` | Location settings | 위치 정보 설정 | 位置情報の設定 |
|  | `settings.rows.myRecords` | Manage my records | 내 기록 관리 | 自分の記録を管理 |
| 정책 | `settings.rows.notices` | Notices | 공지사항 | お知らせ |
|  | `settings.rows.notificationSettings` | Notification settings | 알림 설정 | 通知設定 |
|  | `settings.rows.password` | Change password | 비밀번호 변경 | パスワードを変更 |
| 정책 | `settings.rows.privacyPolicy` | Privacy policy | 개인정보 처리방침 | プライバシーポリシー |
|  | `settings.rows.profileEdit` | Edit profile | 프로필 편집 | プロフィールを編集 |
| 정책 | `settings.rows.terms` | Terms of use | 이용약관 | 利用規約 |
|  | `settings.rows.version` | Version | 버전 정보 | バージョン |
|  | `settings.sections.account` | Account | 계정 | アカウント |
|  | `settings.sections.appInfo` | App information | 앱 정보 | アプリ情報 |
|  | `settings.sections.notifications` | Notifications | 알림 | 通知 |
|  | `settings.sections.preferences` | Preferences | 환경설정 | 環境設定 |
| 정책 | `settings.sections.privacy` | Privacy · location | 개인정보 · 위치 | プライバシー · 位置情報 |
|  | `settings.sections.records` | Records · places | 기록 · 장소 | 記録 · 場所 |
|  | `settings.title` | Settings | 설정 | 設定 |
|  | `settings.values.everyone` | Everyone | 전체 공개 | 全体に公開 |
|  | `settings.values.notConnected` | Not connected | 연결 전 | 未連携 |
|  | `settings.values.off` | Off | 꺼짐 | オフ |
|  | `settings.values.on` | On | 켜짐 | オン |
|  | `settings.values.onlyMe` | Only me | 나만 보기 | 自分のみ |

## `merchantMyPage`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `merchantMyPage.back` | Back | 뒤로가기 | 戻る |
|  | `merchantMyPage.settings` | Settings | 설정 | 設定 |
|  | `merchantMyPage.title` | My page | 마이 페이지 | マイページ |
| 접근성 | `merchantMyPage.roleLabel` | Business owner | 사업자 | 事業者 |
|  | `merchantMyPage.loading` | Loading your store | 가게 정보를 불러오는 중 | 店舗を読み込んでいます |
| 오류 | `merchantMyPage.loadError` | Could not load your store. | 가게 정보를 불러오지 못했어요. | 店舗を読み込めませんでした。 |
|  | `merchantMyPage.retry` | Try again | 다시 시도 | 再試行 |
|  | `merchantMyPage.review.author` | Visitor #{{id}} | 이용인 #{{id}} | 訪問者 #{{id}} |
|  | `merchantMyPage.review.time` | {{date}} · {{relative}} | {{date}} · {{relative}} | {{date}} · {{relative}} |
|  | `merchantMyPage.noStore` | No store is linked to this account yet. | 아직 연결된 가게가 없어요. | このアカウントに連携された店舗はまだありません。 |
|  | `merchantMyPage.store.title` | My store | 나의 가게 | マイストア |
|  | `merchantMyPage.store.verifiedCount` | {{count}} people verified this! | {{count}}명이 검증했어요! | {{count}}人が認証しました！ |
|  | `merchantMyPage.store.address` | Location | 위치 | 所在地 |
|  | `merchantMyPage.store.businessHours` | Business hours | 영업 시간 | 営業時間 |
|  | `merchantMyPage.store.phoneNumber` | Phone number | 전화번호 | 電話番号 |
|  | `merchantMyPage.store.editField` | Edit {{field}} | {{field}} 수정 | {{field}}を編集 |
|  | `merchantMyPage.store.features.englishSupport` | English available | 영어응대 가능 | 英語対応可 |
|  | `merchantMyPage.store.features.parking` | Parking available | 주차가능 | 駐車場あり |
|  | `merchantMyPage.reviews.title` | Reviews | 리뷰 | レビュー |
|  | `merchantMyPage.reviews.viewAll` | See all reviews | 리뷰 모두 보기 | レビューをすべて見る |
|  | `merchantMyPage.reviews.empty` | No reviews yet | 아직 리뷰가 없어요 | まだレビューがありません |
|  | `merchantMyPage.events.title` | Event management | 이벤트 관리 | イベント管理 |
|  | `merchantMyPage.events.subtitle` | Currently running events | 현재 진행중인 이벤트 | 開催中のイベント |
|  | `merchantMyPage.events.create` | New event | 새 이벤트 | 新しいイベント |
| 정책 | `merchantMyPage.events.delete` | Delete event | 이벤트 삭제 | イベントを削除 |
|  | `merchantMyPage.events.empty` | No events yet | 아직 이벤트가 없어요 | まだイベントがありません |
|  | `merchantMyPage.events.closeConfirmTitle` | Close this event? | 이벤트를 종료할까요? | このイベントを終了しますか？ |
|  | `merchantMyPage.events.closeConfirmBody` | Closed events can no longer be issued to tourists. | 종료한 이벤트는 더 이상 관광객에게 발급되지 않아요. | 終了したイベントは、旅行者に発行できなくなります。 |
|  | `merchantMyPage.events.closeConfirm` | Close | 종료 | 終了 |
|  | `merchantMyPage.events.closeCancel` | Cancel | 취소 | キャンセル |
| 오류 | `merchantMyPage.events.closeFailed` | Could not close the event. | 이벤트를 종료하지 못했어요. | イベントを終了できませんでした。 |
|  | `merchantMyPage.events.status.ongoing` | Ongoing | 진행중 | 開催中 |
|  | `merchantMyPage.events.status.ended` | Ended | 종료 | 終了 |
|  | `merchantMyPage.events.status.upcoming` | Upcoming | 예정됨 | 開催予定 |

## `placeDetail`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `placeDetail.back` | Back | 뒤로 | 戻る |
|  | `placeDetail.couponUsage` | Coupon use: {{value}} | 쿠폰 사용: {{value}} | クーポンの利用：{{value}} |
|  | `placeDetail.englishMenu` | English menu: {{value}} | 영문 메뉴: {{value}} | 英語メニュー：{{value}} |
|  | `placeDetail.languages` | Languages: {{value}} | 지원 언어: {{value}} | 対応言語：{{value}} |
|  | `placeDetail.liveStatus` | Live status | 실시간 상태 | リアルタイムの状況 |
|  | `placeDetail.loading` | Loading place details... | 장소 상세를 불러오는 중입니다... | 場所の詳細を読み込んでいます... |
|  | `placeDetail.offer.eligibility` | Who can claim: {{value}} | 발급 대상: {{value}} | 受け取り対象：{{value}} |
|  | `placeDetail.offer.expiry` | Valid: {{value}} | 유효 기간: {{value}} | 有効期間：{{value}} |
|  | `placeDetail.offer.title` | Coupon offer | 쿠폰 혜택 | クーポン特典 |
|  | `placeDetail.operating.beforeOpen` | Not open yet | 영업 전 | 営業開始前 |
|  | `placeDetail.operating.closed` | Closed | 영업 종료 | 営業時間外 |
|  | `placeDetail.operating.closedToday` | Closed today | 오늘 휴무 | 本日休業 |
|  | `placeDetail.operating.closesAt` | Closes at {{time}} | {{time}}에 영업 종료 | {{time}}に営業終了 |
|  | `placeDetail.operating.open` | Open | 영업 중 | 営業中 |
|  | `placeDetail.operating.opensAt` | Opens at {{time}} | {{time}}에 영업 시작 | {{time}}に営業開始 |
|  | `placeDetail.operating.opensLaterAt` | Opens on the next business day at {{time}} | 다음 영업일 {{time}}에 영업 시작 | 次の営業日の{{time}}に営業開始 |
|  | `placeDetail.operating.opensTomorrowAt` | Opens tomorrow at {{time}} | 내일 {{time}}에 영업 시작 | 明日{{time}}に営業開始 |
|  | `placeDetail.operating.permanentlyClosed` | Permanently closed | 폐업 | 閉業 |
|  | `placeDetail.operating.temporarilyClosed` | Temporarily closed | 임시 휴무 | 臨時休業 |
|  | `placeDetail.operating.unknown` | Hours unavailable | 영업시간 정보 없음 | 営業時間の情報なし |
|  | `placeDetail.review.anonymousUser` | User | 사용자 | ユーザー |
|  | `placeDetail.verification.admin` | Administrator verified | 관리자 확인 정보 | 管理者が確認済み |
|  | `placeDetail.verification.owner` | Provided by the business | 사업자 제공 정보 | 事業者が提供 |
|  | `placeDetail.verification.source` | Source verified | 출처 확인 정보 | 情報源を確認済み |
|  | `placeDetail.touristSupport` | Tourist support | 관광객 지원 | 旅行者サポート |
|  | `placeDetail.trust` | Trust | 신뢰 정보 | 信頼度 |
|  | `placeDetail.trustScore` | {{score}}/100 · {{confidence}} confidence | {{score}}/100 · 신뢰도 {{confidence}} | {{score}}/100 · 信頼度{{confidence}} |
|  | `placeDetail.unknownValue` | Unknown | 알 수 없음 | 不明 |
|  | `placeDetail.waitMinutes_one` | {{count}} minute | {{count}}분 | {{count}}分 |
|  | `placeDetail.waitMinutes_other` | {{count}} minutes | {{count}}분 | {{count}}分 |
|  | `placeDetail.waitTime` | Estimated wait: {{value}} | 예상 대기: {{value}} | 予想待ち時間：{{value}} |

## `placeOffers`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `placeOffers.title` | Tourist coupon | 관광객 쿠폰 | 旅行者向けクーポン |
|  | `placeOffers.loading` | Checking available coupons... | 받을 수 있는 쿠폰을 확인하고 있습니다... | 利用できるクーポンを確認しています... |
|  | `placeOffers.empty.title` | No coupons available | 받을 수 있는 쿠폰이 없습니다 | 利用できるクーポンはありません |
|  | `placeOffers.empty.description` | There is no issuable coupon for this place right now. | 지금 이 장소에서 발급 가능한 쿠폰이 없습니다. | 現在、この場所で発行できるクーポンはありません。 |
|  | `placeOffers.auth.description` | Sign in to check and issue this coupon. | 쿠폰을 확인하고 발급받으려면 로그인하세요. | このクーポンを確認して受け取るには、ログインしてください。 |
|  | `placeOffers.auth.action` | Sign in | 로그인 | ログイン |
| 접근성 | `placeOffers.detail.benefitLabel` | Benefit | 혜택 | 特典 |
| 접근성 | `placeOffers.detail.periodLabel` | Issuable period | 발급 기간 | 発行期間 |
| 접근성 | `placeOffers.detail.validityLabel` | Valid after issue | 발급 후 사용 기간 | 発行後の有効期間 |
| 접근성 | `placeOffers.detail.inventoryLabel` | Remaining | 남은 수량 | 残り数量 |
| 접근성 | `placeOffers.detail.eligibilityLabel` | Eligibility | 발급 대상 | 対象 |
|  | `placeOffers.detail.periodUnavailable` | Period unavailable | 기간 정보 없음 | 期間情報なし |
|  | `placeOffers.detail.inventoryUnlimited` | No limit | 수량 제한 없음 | 制限なし |
|  | `placeOffers.detail.inventoryRemaining_one` | {{count}} left | {{count}}개 남음 | 残り{{count}}枚 |
|  | `placeOffers.detail.inventoryRemaining_other` | {{count}} left | {{count}}개 남음 | 残り{{count}}枚 |
|  | `placeOffers.detail.eligibilityActiveTravelSchedule` | Travelers with an active trip schedule | 여행 일정이 활성화된 여행자 | 有効な旅行日程がある旅行者 |
|  | `placeOffers.detail.eligibilityPublic` | Anyone | 누구나 | どなたでも |
|  | `placeOffers.detail.eligibilityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | 特典の条件をご確認ください |
|  | `placeOffers.detail.validityDays_one` | Use within {{count}} day of issue | 발급 후 {{count}}일 이내 사용 | 発行から{{count}}日以内に利用 |
|  | `placeOffers.detail.validityDays_other` | Use within {{count}} days of issue | 발급 후 {{count}}일 이내 사용 | 発行から{{count}}日以内に利用 |
|  | `placeOffers.detail.validityOfferEnd` | Valid until the offer ends | 혜택 종료일까지 사용 가능 | 特典終了まで有効 |
|  | `placeOffers.detail.validityOfferEndOn` | Valid until {{date}} | {{date}}까지 사용 가능 | {{date}}まで有効 |
|  | `placeOffers.detail.validityCapped` | Capped by the offer end date | 혜택 종료일까지로 제한됨 | 特典の終了日が上限です |
|  | `placeOffers.detail.validityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | 特典の条件をご確認ください |
|  | `placeOffers.cta.issue` | Get coupon | 쿠폰 받기 | クーポンを受け取る |
|  | `placeOffers.cta.issuing` | Issuing... | 발급 중... | 発行しています... |
| 접근성 | `placeOffers.cta.a11yIssue` | Get coupon for {{offer}} | {{offer}} 쿠폰 받기 | {{offer}}のクーポンを受け取る |
| 접근성 | `placeOffers.cta.a11yIssuing` | Issuing coupon | 쿠폰 발급 중 | クーポンを発行しています |
| 오류 | `placeOffers.error.eligibility` | This coupon is for eligible travelers only. | 이 쿠폰은 발급 대상 여행자만 받을 수 있습니다. | このクーポンは対象の旅行者のみ利用できます。 |
| 오류 | `placeOffers.error.notFound` | This offer is no longer available. | 이 혜택은 더 이상 발급할 수 없습니다. | この特典はご利用いただけなくなりました。 |
| 오류 | `placeOffers.error.conflictDuplicate` | You already issued this coupon. | 이미 발급받은 쿠폰입니다. | このクーポンはすでに発行済みです。 |
| 오류 | `placeOffers.error.conflictWindowClosed` | The issuance window for this coupon has closed. | 이 쿠폰의 발급 기간이 종료되었습니다. | このクーポンの発行期間は終了しました。 |
| 오류 | `placeOffers.error.conflictStockOut` | This coupon is out of stock. | 이 쿠폰이 모두 소진되었습니다. | このクーポンは在庫切れです。 |
| 오류 | `placeOffers.error.conflictUnknown` | This coupon could not be issued. Please try again later. | 쿠폰을 발급하지 못했습니다. 잠시 후 다시 시도해 주세요. | このクーポンを発行できませんでした。しばらくしてからもう一度お試しください。 |
|  | `placeOffers.success.title` | Coupon issued | 쿠폰이 발급되었습니다 | クーポンを発行しました |
|  | `placeOffers.success.description` | Your coupon is ready. | 쿠폰이 준비되었습니다. | クーポンの準備ができました。 |
|  | `placeOffers.success.code` | Code | 코드 | コード |
|  | `placeOffers.success.expiry` | Expires | 만료 | 有効期限 |
| 접근성 | `placeOffers.success.hint` | Find it later in My coupons. | 내 쿠폰에서 다시 확인할 수 있습니다. | あとでマイクーポンから確認できます。 |
|  | `placeOffers.success.viewAction` | View my coupons | 내 쿠폰 보기 | マイクーポンを見る |
|  | `placeOffers.success.issueAnother` | Get another coupon | 다른 쿠폰 받기 | 別のクーポンを受け取る |

## `placeStatus`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `placeStatus.closed` | Permanently closed | 폐업 | 閉業 |
|  | `placeStatus.open` | Operating | 영업 중 | 営業中 |
|  | `placeStatus.temporarilyClosed` | Temporarily closed | 임시 휴무 | 臨時休業 |
|  | `placeStatus.unknown` | Status unknown | 상태 알 수 없음 | 状態不明 |

## `placeSupport`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `placeSupport.available` | Available | 가능 | 対応 |
|  | `placeSupport.unavailable` | Unavailable | 불가능 | 非対応 |
|  | `placeSupport.unknown` | Unknown | 알 수 없음 | 不明 |

## `placeTrust`

| 우선 | 키 | en | ko | ja |
|---|---|---|---|---|
|  | `placeTrust.confidence.high` | High | 높음 | 高 |
|  | `placeTrust.confidence.low` | Low | 낮음 | 低 |
|  | `placeTrust.confidence.medium` | Medium | 보통 | 中 |
|  | `placeTrust.confidence.unknown` | Unknown | 알 수 없음 | 不明 |
