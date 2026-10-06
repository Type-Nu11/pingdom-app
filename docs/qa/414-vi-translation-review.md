# #414 베트남어 번역 검수 대상 키

> 상태: **기계 번역 초안 · 사람 검수 필요**. 이 문서의 모든 vi 문구는 검수 전이다.
> 문체: 안내문은 정중한 평서형(Vui lòng/Hãy), 2인칭 bạn, 어시스턴트 1인칭 mình. 용어: 검증/verify → xác minh, 쿠폰 → phiếu ưu đãi, 혜택/Offer → ưu đãi, 예약 → đặt chỗ, 체크인 → check-in, 즐겨찾기 → Yêu thích, 설정 → Cài đặt. 브랜드 PingDom·Pingdi·Pingdy는 원문 표기.
> 우선 검수: 「우선」 열이 채워진 키(접근성 label, 오류·복구 안내, 권한·정책·삭제 문구).
> 생성 기준: `src/v2/app/i18n/resources.ts`의 조립 카탈로그, 키 1460개(우선 검수 349개).

| 영역 | 키 수 |
|---|---:|
| `mapTutorial` | 29 |
| `offerCoupon` | 49 |
| `reservation` | 133 |
| `community` | 99 |
| `visitVerification` | 77 |
| `voiceAssistant` | 85 |
| `selectLanguage` | 14 |
| `selectCountry` | 4 |
| `selectAge` | 3 |
| `selectGender` | 6 |
| `countries` | 6 |
| `loginForeign` | 3 |
| `experience` | 41 |
| `auth` | 52 |
| `common` | 42 |
| `placeMenu` | 16 |
| `examplePlaces` | 7 |
| `merchant` | 2 |
| `onboarding` | 43 |
| `map` | 280 |
| `notificationSettings` | 51 |
| `offer` | 23 |
| `payment` | 6 |
| `myPage` | 112 |
| `settings` | 160 |
| `merchantMyPage` | 34 |
| `placeDetail` | 31 |
| `placeOffers` | 41 |
| `placeStatus` | 4 |
| `placeSupport` | 3 |
| `placeTrust` | 4 |

## `mapTutorial`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `mapTutorial.name` | Pingdi | 핑디 | Pingdi |
|  | `mapTutorial.title` | Meet Pingdi | 핑디 사용 안내 | Làm quen với Pingdi |
|  | `mapTutorial.guest` | traveler | 여행자 | bạn |
|  | `mapTutorial.close` | Close tutorial | 튜토리얼 닫기 | Đóng hướng dẫn |
|  | `mapTutorial.previous` | Previous tip | 이전 안내 | Mẹo trước |
|  | `mapTutorial.next` | Next tip | 다음 안내 | Mẹo tiếp theo |
|  | `mapTutorial.finish` | Finish tutorial | 튜토리얼 완료 | Hoàn tất hướng dẫn |
|  | `mapTutorial.progress` | Step {{current}} of {{total}} | {{current}} / {{total}} 단계 | Bước {{current}}/{{total}} |
|  | `mapTutorial.welcome.greeting` | Hello, {{username}}! | 안녕하세요, {{username}}님 | Xin chào, {{username}}! |
|  | `mapTutorial.welcome.introduction` | Here to make your travels easier, | {{username}}님의 여행을 더 쉽게 만들어드리는 | Giúp chuyến đi của bạn dễ dàng hơn, |
|  | `mapTutorial.welcome.agent` | I’m <accent>Pingdi</accent>, your AI agent. | AI 에이전트, <accent>핑디</accent>예요. | mình là <accent>Pingdi</accent>, trợ lý AI của bạn. |
|  | `mapTutorial.welcome.help` | From finding places to preparing reservations,<br>I can help with a conversation. | 원하는 장소를 찾고, 예약을 준비하는 과정까지<br>대화 한번으로 도와드릴게요. | Từ tìm địa điểm đến chuẩn bị đặt chỗ,<br>mình giúp bạn chỉ qua một cuộc trò chuyện. |
|  | `mapTutorial.welcome.start` | Let me give you a quick tour! | 지금부터 간단히 사용법을 알려드릴게요! | Cùng xem nhanh cách sử dụng nhé! |
|  | `mapTutorial.map.prompt` | Tap the <accent>Map button</accent>. | <accent>지도 버튼</accent>을 눌러보세요. | Hãy chạm vào <accent>nút Bản đồ</accent>. |
|  | `mapTutorial.map.body` | Discover pins around you, plus popular places<br>in your area and across the country. | 내 주변의 핑들을 확인할 수 있어요.<br>또한 우리 지역과 전국 트렌드 장소도 볼 수 있어요. | Khám phá các ghim quanh bạn cùng địa điểm<br>nổi bật trong khu vực và trên cả nước. |
|  | `mapTutorial.favorites.prompt` | Tap the <accent>Favorites button</accent>. | <accent>즐겨찾기 버튼</accent>을 눌러보세요. | Hãy chạm vào <accent>nút Yêu thích</accent>. |
|  | `mapTutorial.favorites.body` | Save places you’re interested in<br>and find them again whenever you like. | 관심 있는 장소를 즐겨찾기에 저장하고,<br>언제든 다시 찾아볼 수 있어요. | Lưu những địa điểm bạn quan tâm<br>và xem lại bất cứ lúc nào. |
|  | `mapTutorial.community.prompt` | Tap the <accent>Community button</accent>. | <accent>커뮤니티 버튼</accent>을 눌러보세요. | Hãy chạm vào <accent>nút Cộng đồng</accent>. |
|  | `mapTutorial.community.body` | Explore other travelers’ experiences,<br>and tag places to share your own stories. | 다른 여행자들의 생생한 장소 경험을 확인하고,<br>장소를 태그해 나만의 이야기도 공유할 수 있어요. | Xem trải nghiệm của du khách khác, gắn thẻ<br>địa điểm để chia sẻ câu chuyện của bạn. |
|  | `mapTutorial.reservations.prompt` | Tap the <accent>Reservations button</accent>. | <accent>예약 버튼</accent>을 눌러보세요. | Hãy chạm vào <accent>nút Đặt chỗ</accent>. |
|  | `mapTutorial.reservations.body` | Check availability at the places you love<br>and book a date and time that works for you. | 원하는 장소의 예약 가능 여부를 확인하고,<br>날짜와 시간에 맞춰 간편하게 예약할 수 있어요. | Kiểm tra tình trạng chỗ tại nơi bạn thích<br>và đặt ngày giờ phù hợp với bạn. |
|  | `mapTutorial.recommendations.prompt` | Tap the <accent>Recommendations button</accent>. | <accent>장소 추천 버튼</accent>을 눌러보세요. | Hãy chạm vào <accent>nút Gợi ý</accent>. |
|  | `mapTutorial.recommendations.body` | {{username}}, discover personalized places<br>based on your interests and activity. | {{username}}님의 관심사와 이용 상황을 바탕으로<br>개인화된 장소 추천을 받을 수 있어요. | {{username}}, khám phá địa điểm dành riêng<br>cho bạn dựa trên sở thích và hoạt động. |
|  | `mapTutorial.verification.prompt` | Tap the <accent>Verify button</accent>. | <accent>검증하기 버튼</accent>을 눌러보세요. | Hãy chạm vào <accent>nút Xác minh</accent>. |
|  | `mapTutorial.verification.body` | Review the places you’ve visited<br>and verify your experience to help<br>other travelers visit with confidence. | 직접 방문한 장소의 경험을 리뷰로 남기고,<br>다른 여행자들이 믿고 방문할 수 있도록<br>장소를 검증해주세요. | Đánh giá những nơi bạn đã ghé thăm<br>và xác minh trải nghiệm của bạn<br>để du khách khác yên tâm ghé đến. |
|  | `mapTutorial.categories.prompt` | Tap a <accent>category</accent>. | <accent>카테고리</accent>를 눌러보세요. | Hãy chạm vào một <accent>danh mục</accent>. |
|  | `mapTutorial.categories.body` | Choose food, music, or another category<br>to see only the pins that match. | 음식점, 음악 등 원하는 카테고리를 선택하면<br>해당하는 핑들만 골라서 확인할 수 있어요. | Chọn ẩm thực, âm nhạc hoặc danh mục khác<br>để chỉ xem các ghim phù hợp. |
|  | `mapTutorial.profile.prompt` | Tap <accent>My Page</accent>. | <accent>마이페이지</accent>를 눌러보세요. | Hãy chạm vào <accent>Trang của tôi</accent>. |
|  | `mapTutorial.profile.body` | Manage your profile and travel dates,<br>and browse the places you’ve verified. | 내 프로필과 여행 기간을 관리하고,<br>내가 직접 검증한 장소들을 모아 볼 수 있어요. | Quản lý hồ sơ và ngày đi của bạn,<br>xem lại các địa điểm bạn đã xác minh. |

## `offerCoupon`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
| ● | `offerCoupon.error.actions.back` | Go back | 뒤로 가기 | Quay lại |
| ● | `offerCoupon.error.actions.retry` | Try again | 다시 시도 | Thử lại |
| ● | `offerCoupon.error.actions.signIn` | Sign in again | 다시 로그인 | Đăng nhập lại |
| ● | `offerCoupon.error.actions.viewWallet` | Check my coupons | 보관함 확인 | Xem phiếu của tôi |
| ● | `offerCoupon.error.alreadyIssued.description` | You have already issued this coupon. Check it in your coupons. | 이미 발급받은 쿠폰입니다. 보관함에서 확인해 주세요. | Bạn đã nhận phiếu ưu đãi này rồi. Hãy xem trong ví phiếu của bạn. |
| ● | `offerCoupon.error.alreadyIssued.title` | Already issued | 이미 발급받았습니다 | Đã nhận rồi |
| ● | `offerCoupon.error.alreadyRedeemed.description` | This coupon has already been used and cannot be used again. | 이미 사용한 쿠폰이라 다시 사용할 수 없습니다. | Phiếu ưu đãi này đã được dùng và không thể dùng lại. |
| ● | `offerCoupon.error.alreadyRedeemed.title` | Already used | 이미 사용했습니다 | Đã sử dụng |
| ● | `offerCoupon.error.authentication.description` | Your session has expired. Sign in again to continue. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại để tiếp tục. |
| ● | `offerCoupon.error.authentication.title` | Sign-in required | 로그인이 필요합니다 | Cần đăng nhập |
| ● | `offerCoupon.error.expired.description` | This coupon’s usable period has ended. | 쿠폰의 사용 기간이 종료되었습니다. | Thời hạn sử dụng của phiếu ưu đãi này đã kết thúc. |
| ● | `offerCoupon.error.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | Không còn khả dụng |
| ● | `offerCoupon.error.forbidden.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | Tài khoản này không có quyền thực hiện thao tác này. |
| ● | `offerCoupon.error.forbidden.title` | Permission required | 권한이 필요합니다 | Cần có quyền |
| ● | `offerCoupon.error.generic.description` | Something went wrong on our side. Please try again in a moment. | 서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. | Đã xảy ra sự cố ở phía chúng tôi. Vui lòng thử lại sau giây lát. |
| ● | `offerCoupon.error.generic.title` | Could not complete the request | 요청을 처리하지 못했습니다 | Không thể hoàn tất yêu cầu |
| ● | `offerCoupon.error.ineligible.description` | This offer is not available for your account right now. An active travel schedule may be required. | 지금은 이 Offer를 발급받을 수 없습니다. 진행 중인 여행 일정이 필요할 수 있습니다. | Hiện tài khoản của bạn chưa thể nhận ưu đãi này. Có thể cần có lịch trình du lịch đang diễn ra. |
| ● | `offerCoupon.error.ineligible.title` | Not eligible | 발급 조건을 충족하지 않습니다 | Chưa đủ điều kiện |
| ● | `offerCoupon.error.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | Không thể kết nối tới máy chủ. Hãy kiểm tra kết nối và thử lại. |
| ● | `offerCoupon.error.network.title` | Connection problem | 연결에 문제가 있습니다 | Sự cố kết nối |
| ● | `offerCoupon.error.notFound.description` | This offer or coupon is no longer available. Return to the latest list. | 이 Offer 또는 쿠폰을 더 이상 이용할 수 없습니다. 최신 목록으로 돌아가 주세요. | Ưu đãi hoặc phiếu này không còn khả dụng. Hãy quay lại danh sách mới nhất. |
| ● | `offerCoupon.error.notFound.title` | Not found | 항목을 찾을 수 없습니다 | Không tìm thấy |
| ● | `offerCoupon.error.redeemInvalidInput.description` | Check the coupon and try scanning it again. | 쿠폰을 확인한 후 다시 스캔해 주세요. | Hãy kiểm tra phiếu ưu đãi và quét lại. |
| ● | `offerCoupon.error.redeemInvalidInput.title` | Could not process | 처리하지 못했습니다 | Không thể xử lý |
| ● | `offerCoupon.error.redeemUsedOrExpired.description` | This coupon has already been used or has expired. | 이미 사용되었거나 만료된 쿠폰입니다. | Phiếu ưu đãi này đã được dùng hoặc đã hết hạn. |
| ● | `offerCoupon.error.redeemUsedOrExpired.title` | Cannot be used | 사용할 수 없습니다 | Không thể sử dụng |
| ● | `offerCoupon.error.soldOut.description` | All coupons for this offer have been claimed. | 이 Offer의 쿠폰이 모두 소진되었습니다. | Tất cả phiếu của ưu đãi này đã được nhận hết. |
| ● | `offerCoupon.error.soldOut.title` | Sold out | 수량이 소진되었습니다 | Đã hết |
| ● | `offerCoupon.error.unconfirmedConflict.description` | This offer could not be issued. It may already be in your coupons, or issuing may have closed. | 발급하지 못했습니다. 이미 보관함에 있거나 발급이 마감되었을 수 있습니다. | Không thể nhận ưu đãi này. Có thể phiếu đã nằm trong ví của bạn hoặc đã hết hạn nhận. |
| ● | `offerCoupon.error.unconfirmedConflict.title` | Could not issue | 발급하지 못했습니다 | Không thể nhận |
| ● | `offerCoupon.error.updateRequired.description` | Install the latest version to keep using coupons. | 쿠폰을 계속 사용하려면 최신 버전을 설치해 주세요. | Hãy cài đặt phiên bản mới nhất để tiếp tục dùng phiếu ưu đãi. |
| ● | `offerCoupon.error.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | Cần cập nhật |
| ● | `offerCoupon.error.validation.description` | Could not load the list. Please try again. | 목록을 불러오지 못했습니다. 다시 시도해 주세요. | Không thể tải danh sách. Vui lòng thử lại. |
| ● | `offerCoupon.error.validation.title` | Could not load coupons | 쿠폰을 불러오지 못했습니다 | Không thể tải phiếu ưu đãi |
|  | `offerCoupon.place.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Requires an active travel schedule | 진행 중인 여행 일정이 필요합니다 | Cần có lịch trình du lịch đang diễn ra |
|  | `offerCoupon.place.eligibility.PUBLIC` | Available to all eligible visitors | 발급 가능한 방문객 모두 이용할 수 있습니다 | Dành cho mọi khách đủ điều kiện |
|  | `offerCoupon.place.emptyDescription` | There are no coupons available for this place right now. | 현재 이 장소에서 발급받을 수 있는 쿠폰이 없습니다. | Hiện địa điểm này chưa có phiếu ưu đãi nào. |
|  | `offerCoupon.place.emptyTitle` | No available offers | 발급 가능한 Offer가 없습니다 | Chưa có ưu đãi khả dụng |
|  | `offerCoupon.place.inventoryRemaining` | {{count}} remaining | {{count}}개 남음 | Còn {{count}} |
|  | `offerCoupon.place.inventoryUnlimited` | No quantity limit | 수량 제한 없음 | Không giới hạn số lượng |
|  | `offerCoupon.place.issue` | Get coupon | 쿠폰 받기 | Nhận phiếu ưu đãi |
|  | `offerCoupon.place.loading` | Loading available coupons… | 발급 가능한 쿠폰을 불러오는 중… | Đang tải phiếu ưu đãi khả dụng… |
|  | `offerCoupon.place.period` | Issue period: {{value}} | 발급 기간: {{value}} | Thời gian nhận: {{value}} |
|  | `offerCoupon.place.periodUnknown` | Schedule unavailable | 기간 정보 없음 | Chưa có thông tin thời gian |
|  | `offerCoupon.place.successDescription` | The issued coupon is ready in your coupon wallet. | 발급된 쿠폰을 보관함에서 바로 확인할 수 있습니다. | Phiếu vừa nhận đã có sẵn trong ví phiếu của bạn. |
|  | `offerCoupon.place.successTitle` | Coupon issued | 쿠폰을 발급했습니다 | Đã nhận phiếu ưu đãi |
|  | `offerCoupon.place.untitled` | Coupon offer | 쿠폰 Offer | Ưu đãi phiếu giảm giá |
|  | `offerCoupon.place.validityDays` | Valid for {{count}} day after issue | 발급 후 {{count}}일 동안 사용 가능 | Có hiệu lực {{count}} ngày sau khi nhận |
|  | `offerCoupon.place.validityDays_other` | Valid for {{count}} days after issue | 발급 후 {{count}}일 동안 사용 가능 | Có hiệu lực {{count}} ngày sau khi nhận |

## `reservation`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `reservation.common.back` | Go back | 뒤로 가기 | Quay lại |
|  | `reservation.common.favorites` | Favorites | 즐겨찾기 | Yêu thích |
|  | `reservation.common.map` | Map | 지도 | Bản đồ |
|  | `reservation.common.recommendations` | Place recommendations | 장소추천 | Gợi ý địa điểm |
|  | `reservation.common.reservations` | Reservations | 예약 | Đặt chỗ |
|  | `reservation.box.count` | {{count}} reservations | 보유 예약 {{count}}건 | {{count}} lượt đặt chỗ |
|  | `reservation.box.empty` | No reservations yet. | 아직 예약 내역이 없어요. | Chưa có lượt đặt chỗ nào. |
| ● | `reservation.box.error` | Could not load your reservations. | 예약함을 불러오지 못했어요. | Không thể tải danh sách đặt chỗ của bạn. |
|  | `reservation.box.loading` | Loading reservations… | 예약함을 불러오는 중이에요… | Đang tải danh sách đặt chỗ… |
|  | `reservation.box.productIcon` | R | R | R |
|  | `reservation.box.settings` | Open settings | 설정 열기 | Mở cài đặt |
|  | `reservation.box.title` | Reservations | 예약함 | Đặt chỗ của tôi |
|  | `reservation.create.availabilityEmpty` | No availability has been published for this place. | 이 장소에 등록된 예약 가능 일정이 없습니다. | Địa điểm này chưa công bố lịch còn chỗ. |
| ● | `reservation.create.availabilityError` | Could not load availability. | 예약 가능 일정을 불러오지 못했습니다. | Không thể tải lịch còn chỗ. |
|  | `reservation.create.availabilityLoading` | Loading availability… | 예약 가능 일정을 불러오는 중이에요… | Đang tải lịch còn chỗ… |
|  | `reservation.create.afternoon` | PM | 오후 | Chiều |
|  | `reservation.create.available` | Available | 가능 | Còn chỗ |
| ● | `reservation.create.availableDateLabel` | {{date}}, available | {{date}}, 예약 가능 | {{date}}, còn chỗ |
| ● | `reservation.create.availableDateCapacityLabel` | {{date}}, {{count}} spots remaining | {{date}}, 잔여 {{count}}명 | {{date}}, còn {{count}} chỗ |
|  | `reservation.create.backToMap` | Go back | 돌아가기 | Quay lại |
| ● | `reservation.create.booker.errors.nameRequired` | Enter the booker name. | 예약자 이름을 입력해 주세요. | Hãy nhập tên người đặt. |
| ● | `reservation.create.booker.errors.nameTooLong` | Use 100 characters or fewer. | 100자 이내로 입력해 주세요. | Hãy nhập tối đa 100 ký tự. |
| ● | `reservation.create.booker.errors.noteTooLong` | Use 500 characters or fewer. | 500자 이내로 입력해 주세요. | Hãy nhập tối đa 500 ký tự. |
| ● | `reservation.create.booker.errors.phoneInvalid` | Use digits and + ( ) - spaces only. | 숫자와 + ( ) - 공백만 입력할 수 있어요. | Chỉ dùng chữ số, + ( ) - và dấu cách. |
| ● | `reservation.create.booker.errors.phoneRequired` | Enter a contact number. | 연락처를 입력해 주세요. | Hãy nhập số liên hệ. |
| ● | `reservation.create.booker.errors.phoneTooLong` | Use 30 characters or fewer. | 30자 이내로 입력해 주세요. | Hãy nhập tối đa 30 ký tự. |
|  | `reservation.create.booker.name` | Booker name | 예약자 이름 | Tên người đặt |
|  | `reservation.create.booker.namePlaceholder` | Name for the reservation | 예약자 이름 | Tên dùng cho lượt đặt chỗ |
|  | `reservation.create.booker.note` | Requests | 요청 사항 | Yêu cầu |
|  | `reservation.create.booker.noteOptional` | Optional | 선택 | Không bắt buộc |
|  | `reservation.create.booker.notePlaceholder` | Anything the place should know | 장소에 전달할 요청 사항 | Điều bạn muốn nhắn tới địa điểm |
|  | `reservation.create.booker.phone` | Contact number | 연락처 | Số liên hệ |
|  | `reservation.create.booker.phonePlaceholder` | Phone number | 전화번호 | Số điện thoại |
|  | `reservation.create.booker.title` | Booker details | 예약자 정보 | Thông tin người đặt |
|  | `reservation.create.date` | Select date | 날짜 선택 | Chọn ngày |
|  | `reservation.create.loadingPlace` | Loading place | 장소 불러오는 중 | Đang tải địa điểm |
|  | `reservation.create.morning` | AM | 오전 | Sáng |
|  | `reservation.create.nextMonth` | Next month | 다음 달 | Tháng sau |
|  | `reservation.create.noCapacityForQuantity` | No current times can accommodate {{count}} guests. Review the published schedule and unavailable reasons below. | 현재 {{count}}명이 예약 가능한 시간은 없습니다. 아래에서 등록된 일정과 예약 불가 사유를 확인해 주세요. | Hiện không có khung giờ nào đủ chỗ cho {{count}} khách. Hãy xem lịch đã công bố và lý do không thể đặt bên dưới. |
|  | `reservation.create.noTimes` | No available times for this date. | 선택한 날짜에 예약 가능한 시간이 없습니다. | Ngày này không còn giờ trống. |
|  | `reservation.create.noTimesInPeriod` | No times are available in this period. | 선택한 시간대에 등록된 일정이 없습니다. | Không có giờ nào trong khoảng thời gian này. |
|  | `reservation.create.people` | Guests | 인원 선택 | Số khách |
|  | `reservation.create.peopleCount` | {{count}} | {{count}}명 | {{count}} |
|  | `reservation.create.peopleRange` | Booking for 1–12 guests · {{category}} | 예약인원: 1~12명 · {{category}} | Đặt cho 1–12 khách · {{category}} |
|  | `reservation.create.previousMonth` | Previous month | 이전 달 | Tháng trước |
|  | `reservation.create.productInfoUnavailable` | This item can't be reserved right now because its product details are unavailable. | 상품 정보를 불러올 수 없어 현재 예약할 수 없습니다. | Hiện không thể đặt mục này vì chưa có thông tin sản phẩm. |
|  | `reservation.create.retry` | Try again | 다시 시도 | Thử lại |
|  | `reservation.create.requestNote` | Request (optional) | 요청사항 (선택) | Yêu cầu (không bắt buộc) |
|  | `reservation.create.requestNotePlaceholder` | Add anything the venue should know | 장소에 전달할 내용을 입력하세요 | Nhập điều bạn muốn nhắn tới địa điểm |
|  | `reservation.create.scheduled` | Scheduled | 일정 있음 | Có lịch |
| ● | `reservation.create.scheduledDateLabel` | {{date}}, schedules published | {{date}}, 일정 있음 | {{date}}, đã có lịch |
|  | `reservation.create.selectAvailableDate` | Select an available date. | 예약 가능한 날짜를 선택해 주세요. | Hãy chọn một ngày còn chỗ. |
|  | `reservation.create.selectedWindow` | Selected date & time | 선택한 일시 | Ngày giờ đã chọn |
|  | `reservation.create.slotAvailable` | {{count}} spots remaining · Available | 잔여 {{count}}명 · 예약 가능 | Còn {{count}} chỗ · Còn nhận đặt |
|  | `reservation.create.slotInactive` | Unavailable · Inactive | 예약 불가 · 비활성 일정 | Không thể đặt · Lịch chưa kích hoạt |
|  | `reservation.create.slotInsufficient` | {{count}} spots remaining · Not enough capacity | 잔여 {{count}}명 · 인원 부족 | Còn {{count}} chỗ · Không đủ chỗ |
|  | `reservation.create.slotPast` | Unavailable · Time has passed | 예약 불가 · 지난 시간 | Không thể đặt · Đã qua giờ |
|  | `reservation.create.submit` | Reserve | 예약하기 | Đặt chỗ |
| ● | `reservation.create.submitAccountError` | Only an active tourist account can make a reservation. | 활성화된 일반 사용자 계정만 예약할 수 있습니다. | Chỉ tài khoản du khách đang hoạt động mới có thể đặt chỗ. |
| ● | `reservation.create.submitAvailabilityError` | This schedule is no longer available. Select another schedule. | 더 이상 예약할 수 없는 일정입니다. 다른 일정을 선택해 주세요. | Lịch này không còn nhận đặt. Hãy chọn lịch khác. |
| ● | `reservation.create.submitCapacityError` | There are not enough spots remaining. Check the updated availability. | 잔여 인원이 부족합니다. 갱신된 일정을 확인해 주세요. | Không còn đủ chỗ. Hãy xem lịch đã được cập nhật. |
|  | `reservation.create.submitConflict` | That time was just filled or closed. Pick another slot. | 해당 시간이 방금 마감되었어요. 다른 시간을 선택해 주세요. | Khung giờ đó vừa hết chỗ hoặc đã đóng. Hãy chọn giờ khác. |
| ● | `reservation.create.submitError` | Could not submit the reservation. Please try again. | 예약을 접수하지 못했습니다. 다시 시도해 주세요. | Không thể gửi yêu cầu đặt chỗ. Vui lòng thử lại. |
| ● | `reservation.create.submitNetworkError` | We could not confirm your reservation. Check your reservations before submitting again. | 예약 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 예약함을 확인해 주세요. | Chúng tôi chưa xác nhận được lượt đặt chỗ. Hãy kiểm tra danh sách đặt chỗ trước khi gửi lại. |
| ● | `reservation.create.submitValidationError` | Check the highlighted fields and try again. | 표시된 항목을 확인하고 다시 시도해 주세요. | Hãy kiểm tra các mục được đánh dấu và thử lại. |
|  | `reservation.create.successDescription` | You can check the confirmation status in Reservations. | 예약함에서 확정 상태를 확인할 수 있습니다. | Bạn có thể xem trạng thái xác nhận trong mục Đặt chỗ. |
|  | `reservation.create.successTitle` | Reservation requested | 예약 요청이 접수되었습니다 | Đã gửi yêu cầu đặt chỗ |
|  | `reservation.create.time` | Select schedule | 시간 선택 | Chọn giờ |
|  | `reservation.create.title` | Reserve | 예약하기 | Đặt chỗ |
| ● | `reservation.create.unavailableDateLabel` | {{date}}, unavailable | {{date}}, 예약 불가 | {{date}}, không thể đặt |
|  | `reservation.create.unknownReservationType` | This reservation type isn't supported yet, so it can't be reserved. | 지원하지 않는 예약 유형이라 현재 예약할 수 없습니다. | Loại đặt chỗ này chưa được hỗ trợ nên hiện không thể đặt. |
|  | `reservation.create.weekdays.fri` | F | 금 | T6 |
|  | `reservation.create.weekdays.mon` | M | 월 | T2 |
|  | `reservation.create.weekdays.sat` | S | 토 | T7 |
|  | `reservation.create.weekdays.sun` | S | 일 | CN |
|  | `reservation.create.weekdays.thu` | T | 목 | T5 |
|  | `reservation.create.weekdays.tue` | T | 화 | T3 |
|  | `reservation.create.weekdays.wed` | W | 수 | T4 |
|  | `reservation.create.windowPending` | The date and time will be shared once confirmed. | 예약 일시는 확정 후 안내됩니다. | Ngày giờ sẽ được thông báo sau khi xác nhận. |
|  | `reservation.detail.bookerHidden` | Hidden | 비공개 | Ẩn |
|  | `reservation.detail.bookerName` | Booker | 예약자 | Người đặt |
|  | `reservation.detail.bookerPhone` | Contact | 연락처 | Liên hệ |
|  | `reservation.detail.identifier` | Reservation ID | 예약 식별자 | Mã đặt chỗ |
|  | `reservation.detail.loading` | Loading reservation details | 예약 상세를 불러오는 중이에요 | Đang tải chi tiết đặt chỗ |
|  | `reservation.detail.noRequestNote` | No requests | 요청 사항 없음 | Không có yêu cầu |
|  | `reservation.detail.paymentAmount` | Minor amount and currency: {{value}} | 최소 화폐 단위 금액·통화: {{value}} | Số tiền theo đơn vị nhỏ nhất và loại tiền: {{value}} |
|  | `reservation.detail.paymentFailure` | Failure code: {{value}} | 실패 코드: {{value}} | Mã lỗi: {{value}} |
|  | `reservation.detail.paymentIdentifier` | Payment #{{id}} | 결제 번호 {{id}} | Thanh toán #{{id}} |
|  | `reservation.detail.paymentProvider` | Provider: {{value}} | 결제 제공자: {{value}} | Nhà cung cấp: {{value}} |
|  | `reservation.detail.payments` | Payments | 결제 내역 | Thanh toán |
|  | `reservation.detail.paymentsEmptyDescription` | This is a normal state until a payment is created. | 결제가 생성되기 전에는 정상적으로 비어 있을 수 있어요. | Mục này trống là bình thường cho đến khi có thanh toán được tạo. |
|  | `reservation.detail.paymentsEmptyTitle` | No payment history | 결제 내역이 없어요 | Chưa có lịch sử thanh toán |
|  | `reservation.detail.paymentsLoading` | Loading payments | 결제 내역을 불러오는 중이에요 | Đang tải thanh toán |
|  | `reservation.detail.productType` | Product type | 상품 유형 | Loại sản phẩm |
|  | `reservation.detail.quantity` | Quantity | 예약 수량 | Số lượng |
|  | `reservation.detail.requestNote` | Requests | 요청 사항 | Yêu cầu |
|  | `reservation.detail.reservationWindow` | Reserved date & time | 예약 일시 | Ngày giờ đã đặt |
|  | `reservation.detail.status` | Status | 예약 상태 | Trạng thái |
|  | `reservation.detail.title` | Reservation details | 예약 상세 | Chi tiết đặt chỗ |
|  | `reservation.detail.windowPending` | Shared once confirmed | 확정 후 안내 | Thông báo sau khi xác nhận |
|  | `reservation.list.available` | Bookable | 예약 가능 | Có thể đặt |
|  | `reservation.list.distanceFar` | {{kilometers}} km away | 여기서 {{kilometers}}km | Cách {{kilometers}} km |
|  | `reservation.list.distanceNear` | {{meters}} m away | 여기서 {{kilometers}}km | Cách {{meters}} m |
|  | `reservation.list.card.createdAt` | Requested at | 접수 일시 | Thời điểm gửi |
|  | `reservation.list.card.detail` | View reservation details  › | 예약 상세 보기  › | Xem chi tiết đặt chỗ  › |
|  | `reservation.list.card.eyebrow` | My reservation | 내 예약 | Đặt chỗ của tôi |
| ● | `reservation.list.card.hint` | Opens reservation details | 예약 상세 화면으로 이동합니다 | Mở chi tiết đặt chỗ |
|  | `reservation.list.card.label` | Reservation {{id}}, {{status}} | 예약 {{id}}, {{status}} | Đặt chỗ {{id}}, {{status}} |
|  | `reservation.list.card.number` | Reservation #{{id}} | 예약 번호 {{id}} | Đặt chỗ #{{id}} |
|  | `reservation.list.card.productType` | Product type | 상품 유형 | Loại sản phẩm |
|  | `reservation.list.card.quantity` | Quantity | 예약 수량 | Số lượng |
|  | `reservation.list.card.quantityValue` | {{count}} guest(s) | {{count}}명 예약 | {{count}} khách |
|  | `reservation.list.card.reservationWindow` | Reserved for | 예약 일시 | Đặt cho |
|  | `reservation.list.card.reservationWindowValue` | Reserved {{value}} | {{value}} 예약 | Đặt cho {{value}} |
|  | `reservation.list.card.requestedAtValue` | Requested {{value}} | {{value}} 접수 | Gửi lúc {{value}} |
|  | `reservation.list.card.windowPending` | Shared once confirmed | 확정 후 안내 | Thông báo sau khi xác nhận |
|  | `reservation.list.emptyDescription` | Find a place you like on the map. | 지도에서 마음에 드는 장소를 찾아보세요. | Hãy tìm một địa điểm bạn thích trên bản đồ. |
|  | `reservation.list.emptyTitle` | No reservations yet | 아직 예약 내역이 없어요 | Chưa có lượt đặt chỗ nào |
| ● | `reservation.list.error` | Could not load reservations | 예약을 불러오지 못했어요 | Không thể tải danh sách đặt chỗ |
|  | `reservation.list.loading` | Loading reservations | 예약을 불러오는 중이에요 | Đang tải danh sách đặt chỗ |
|  | `reservation.list.nearbySubtitle` | Discover places currently accepting reservations! | 현재 예약 가능 장소를 찾아드려요! | Khám phá những địa điểm đang nhận đặt chỗ! |
|  | `reservation.list.nearbyEmpty` | No nearby bookable places are available right now. | 현재 위치 주변에 예약 가능한 장소가 없어요. | Hiện chưa có địa điểm nào quanh đây có thể đặt chỗ. |
|  | `reservation.list.nearbyLoading` | Finding nearby bookable places… | 주변 예약 가능 장소를 찾는 중이에요… | Đang tìm địa điểm có thể đặt chỗ quanh đây… |
|  | `reservation.list.nearbyTitle` | Reservations near your current location | 현재 위치 주변 예약 | Đặt chỗ gần vị trí hiện tại |
|  | `reservation.list.panelAdjust` | Resize reservation panel | 예약 패널 크기 조절 | Đổi kích thước bảng đặt chỗ |
| ● | `reservation.list.previewLabel` | {{name}} reservation preview | {{name}} 예약 미리보기 | Xem trước đặt chỗ tại {{name}} |
|  | `reservation.list.retry` | Try again | 다시 시도 | Thử lại |
|  | `reservation.list.savedTitle` | Saved reservations | 예약함 | Đặt chỗ đã lưu |
|  | `reservation.list.statuses.canceled` | Canceled | 취소됨 | Đã hủy |
|  | `reservation.list.statuses.confirmed` | Confirmed | 예약 확정 | Đã xác nhận |
|  | `reservation.list.statuses.pending` | Pending confirmation | 확정 대기 | Chờ xác nhận |
|  | `reservation.list.statuses.rejected` | Rejected | 거절됨 | Bị từ chối |
|  | `reservation.list.statuses.unknown` | Status needs review | 상태 확인 필요 | Cần kiểm tra trạng thái |

## `community`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `community.title` | Community | 커뮤니티 | Cộng đồng |
|  | `community.categories.all` | All | 전체 | Tất cả |
|  | `community.categories.spot` | Spots | 스팟 | Địa điểm |
|  | `community.categories.diary` | Diary | 다이어리 | Nhật ký |
|  | `community.categories.ledger` | Expenses | 가계부 | Chi tiêu |
|  | `community.sheetAdjust` | Adjust community panel | 커뮤니티 패널 조절 | Điều chỉnh bảng cộng đồng |
|  | `community.write` | Write | 작성하기 | Viết bài |
|  | `community.moreOptions` | More options | 더보기 | Tùy chọn khác |
|  | `community.notInterested` | Not interested | 관심없음 | Không quan tâm |
|  | `community.report` | Report | 신고하기 | Báo cáo |
|  | `community.empty` | No posts yet | 아직 게시글이 없어요 | Chưa có bài viết nào |
|  | `community.author` | woo_sm | woo_sm | woo_sm |
|  | `community.like` | Like | 좋아요 | Thích |
|  | `community.comment` | Comment | 댓글 | Bình luận |
|  | `community.list.loading` | Loading posts… | 게시글을 불러오는 중… | Đang tải bài viết… |
| ● | `community.list.nextPageError` | Couldn't load more posts. | 게시글을 더 불러오지 못했어요. | Không thể tải thêm bài viết. |
|  | `community.list.nextPageRetry` | Retry | 다시 시도 | Thử lại |
|  | `community.detail.back` | Back | 뒤로 | Quay lại |
|  | `community.detail.settings` | Post options | 게시글 옵션 | Tùy chọn bài viết |
|  | `community.detail.placeTagPrefix` | View place | 장소 보기 | Xem địa điểm |
| ● | `community.detail.placeDeleted` | This place was removed | 삭제된 장소예요 | Địa điểm này đã bị xóa |
| ● | `community.detail.placeCard.a11yLabel` | Connected place, {{name}} | 연결 장소, {{name}} | Địa điểm liên kết, {{name}} |
| ● | `community.detail.placeCard.a11yHint` | Opens the place detail | 장소 상세로 이동 | Mở chi tiết địa điểm |
|  | `community.detail.placeCard.announceFailure` | Couldn't open this place. | 장소를 열지 못했어요. | Không thể mở địa điểm này. |
| ● | `community.detail.placeCard.errors.unavailable` | This place can't be opened right now. | 장소를 불러올 수 없어요 | Hiện không thể mở địa điểm này. |
| ● | `community.detail.comments.headerLabel` | Comments | 댓글 | Bình luận |
|  | `community.detail.comments.authorBadge` | Author | 작성자 | Tác giả |
|  | `community.detail.comments.count` | Comments {{count}} | 댓글 {{count}} | Bình luận {{count}} |
| ● | `community.detail.comments.jumpA11yLabel` | Go to {{count}} comments | 댓글 {{count}}개로 이동 | Đi tới {{count}} bình luận |
|  | `community.detail.comments.loading` | Loading comments… | 댓글을 불러오는 중… | Đang tải bình luận… |
|  | `community.detail.comments.empty` | No comments yet. Be the first to leave one! | 아직 댓글이 없어요. 첫 댓글을 남겨보세요! | Chưa có bình luận nào. Hãy là người đầu tiên bình luận! |
| ● | `community.detail.comments.errorRetry` | Retry | 다시 시도 | Thử lại |
| ● | `community.detail.comments.nextPageError` | Couldn't load more comments. | 댓글을 더 불러오지 못했어요. | Không thể tải thêm bình luận. |
|  | `community.detail.comments.nextPageRetry` | Retry | 다시 시도 | Thử lại |
|  | `community.detail.comments.loadMore` | Show {{count}} more comments | 댓글 {{count}}개 더 보기 | Xem thêm {{count}} bình luận |
| ● | `community.detail.comments.a11yLabel` | {{author}}, {{time}}, {{content}} | {{author}}, {{time}}, {{content}} | {{author}}, {{time}}, {{content}} |
|  | `community.detail.comments.announceSuccess` | Your comment was posted. | 댓글이 등록되었어요. | Đã đăng bình luận của bạn. |
|  | `community.detail.comments.announceFailure` | Your comment failed to post. | 댓글 등록에 실패했어요. | Không đăng được bình luận của bạn. |
|  | `community.detail.like.count_one` | Like {{count}} | 좋아요 {{count}} | Thích {{count}} |
|  | `community.detail.like.count_other` | Like {{count}} | 좋아요 {{count}} | Thích {{count}} |
| ● | `community.detail.like.a11yLabel_one` | Like, {{count}} | 좋아요, {{count}}개 | Thích, {{count}} |
| ● | `community.detail.like.a11yLabel_other` | Like, {{count}} | 좋아요, {{count}}개 | Thích, {{count}} |
| ● | `community.detail.like.hintLike` | Double tap to like | 두 번 탭하여 좋아요 | Chạm hai lần để thích |
| ● | `community.detail.like.hintUnlike` | Double tap to unlike | 두 번 탭하여 좋아요 취소 | Chạm hai lần để bỏ thích |
| ● | `community.detail.like.retryLabel` | Retry | 다시 시도 | Thử lại |
|  | `community.detail.like.announceLiked` | Liked. | 좋아요를 눌렀어요. | Đã thích. |
|  | `community.detail.like.announceUnliked` | Like removed. | 좋아요를 취소했어요. | Đã bỏ thích. |
|  | `community.detail.like.announceFailure` | Something went wrong. Please try again. | 문제가 발생했어요. 다시 시도해 주세요. | Đã xảy ra lỗi. Vui lòng thử lại. |
|  | `community.detail.commentInput.label` | Write a comment | 댓글 입력 | Viết bình luận |
|  | `community.detail.commentInput.placeholder` | Leave a comment | 댓글을 남겨주세요 | Để lại bình luận |
|  | `community.detail.commentInput.send` | Post comment | 댓글 등록 | Đăng bình luận |
|  | `community.detail.commentInput.sendBusy` | Posting comment… | 댓글 등록 중… | Đang đăng bình luận… |
|  | `community.detail.commentInput.counter` | {{count}}/{{max}} | {{count}}/{{max}} | {{count}}/{{max}} |
| ● | `community.detail.commentInput.validation.required` | Enter a comment. | 댓글 내용을 입력해 주세요. | Hãy nhập bình luận. |
| ● | `community.detail.commentInput.validation.tooLong` | Comments must be 1,000 characters or fewer. | 댓글은 1,000자 이하로 입력해 주세요. | Bình luận tối đa 1.000 ký tự. |
| ● | `community.detail.commentInput.errors.networkDuplicateWarning` | If the comment already went through, check the list before retrying. | 이미 댓글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | Bình luận có thể đã được đăng. Hãy kiểm tra danh sách trước khi thử lại. |
| ● | `community.detail.commentInput.errors.retry` | Retry | 다시 시도 | Thử lại |
| ● | `community.detail.commentInput.errors.signIn` | Sign in again | 다시 로그인 | Đăng nhập lại |
| ● | `community.detail.commentInput.errors.postNotFound` | This post couldn't be found. It may have been removed. | 게시글을 찾을 수 없어요. 삭제되었을 수 있어요. | Không tìm thấy bài viết này. Có thể bài đã bị xóa. |
|  | `community.write_screen.title` | Write a post | 글 작성하기 | Viết bài |
|  | `community.write_screen.back` | Cancel | 취소 | Hủy |
| ● | `community.write_screen.categoryLabel` | Category | 카테고리 | Danh mục |
| ● | `community.write_screen.categoryHint` | Choose the category that fits your post | 글에 맞는 카테고리를 선택해주세요 | Chọn danh mục phù hợp với bài viết |
| ● | `community.write_screen.titleLabel` | Post | 글 작성 | Bài viết |
|  | `community.write_screen.titlePlaceholder` | Enter a title | 제목을 입력해주세요. | Nhập tiêu đề |
| ● | `community.write_screen.bodyLabel` | Content | 내용 | Nội dung |
|  | `community.write_screen.bodyPlaceholder` | Share your story with the community | 본문을 입력해주세요. | Chia sẻ câu chuyện của bạn với cộng đồng |
| ● | `community.write_screen.guideText` | Posts with abuse, defamation, or ads may be removed under our policy | 욕설·비방·광고성 글은 운영 정책에 따라 삭제될 수 있어요 | Bài viết có nội dung lăng mạ, phỉ báng hoặc quảng cáo có thể bị xóa theo chính sách |
|  | `community.write_screen.photoSection` | Photos | 사진 첨부 | Ảnh |
|  | `community.write_screen.photoCount` | Up to {{count}} photos | 최대 {{count}}장까지 첨부할 수 있어요 | Tối đa {{count}} ảnh |
|  | `community.write_screen.addPhotos` | Add photos | 사진 추가 | Thêm ảnh |
|  | `community.write_screen.placeTagTitle` | Place tag | 장소 태그 | Gắn thẻ địa điểm |
| ● | `community.write_screen.placeTagHint` | Tell us which place this post is about | 어떤 장소에 대한 글인지 알려주세요 | Cho chúng tôi biết bài viết này nói về địa điểm nào |
|  | `community.write_screen.addPlace` | Add place | 장소 추가 | Thêm địa điểm |
|  | `community.write_screen.removePlace` | Remove {{name}} | {{name}} 삭제 | Xóa {{name}} |
|  | `community.write_screen.submit` | Post | 등록하기 | Đăng |
|  | `community.write_screen.submitBusy` | Posting… | 등록 중… | Đang đăng… |
| ● | `community.write_screen.validation.titleRequired` | Enter a title. | 제목을 입력해 주세요. | Hãy nhập tiêu đề. |
| ● | `community.write_screen.validation.titleTooLong` | Title must be 50 characters or fewer. | 제목은 50자 이하로 입력해 주세요. | Tiêu đề tối đa 50 ký tự. |
| ● | `community.write_screen.validation.bodyRequired` | Enter content. | 내용을 입력해 주세요. | Hãy nhập nội dung. |
| ● | `community.write_screen.validation.contentTooLong` | Content must be 5,000 characters or fewer. | 내용은 5,000자 이하로 입력해 주세요. | Nội dung tối đa 5.000 ký tự. |
| ● | `community.write_screen.validation.tagRequired` | Choose at least one category. | 카테고리를 하나 이상 선택해 주세요. | Hãy chọn ít nhất một danh mục. |
| ● | `community.write_screen.validation.categoryRequired` | Choose a category. | 카테고리를 선택해 주세요. | Hãy chọn một danh mục. |
| ● | `community.write_screen.validation.placeRequired` | Add at least one place for the Place category. | 장소 카테고리는 장소를 1개 이상 선택해야 해요. | Danh mục Địa điểm cần ít nhất một địa điểm. |
|  | `community.write_screen.placePicker.close` | Close | 닫기 | Đóng |
|  | `community.write_screen.placePicker.placeholder` | Search for a place | 장소를 검색해 주세요 | Tìm địa điểm |
|  | `community.write_screen.placePicker.prompt` | Search for a registered place to tag | 태그할 등록된 장소를 검색해 주세요 | Tìm một địa điểm đã đăng ký để gắn thẻ |
|  | `community.write_screen.placePicker.empty` | No matching places found | 검색 결과가 없어요 | Không tìm thấy địa điểm phù hợp |
| ● | `community.write_screen.placePicker.error` | Couldn't load places. | 장소를 불러오지 못했어요. | Không thể tải địa điểm. |
|  | `community.write_screen.placePicker.retry` | Retry | 다시 시도 | Thử lại |
|  | `community.write_screen.placePicker.disabled` | Place search is unavailable right now | 지금은 장소 검색을 사용할 수 없어요 | Hiện không thể tìm kiếm địa điểm |
| ● | `community.write_screen.errors.placeNotFound` | One of the connected places couldn't be found. Remove it and choose another. | 연결한 장소 중 하나를 찾을 수 없어요. 삭제하고 다시 선택해 주세요. | Không tìm thấy một trong các địa điểm đã liên kết. Hãy xóa và chọn địa điểm khác. |
| ● | `community.write_screen.errors.networkDuplicateWarning` | If the post already went through, check the list before retrying. | 이미 게시글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | Bài viết có thể đã được đăng. Hãy kiểm tra danh sách trước khi thử lại. |
| ● | `community.write_screen.errors.retry` | Retry | 다시 시도 | Thử lại |
| ● | `community.write_screen.errors.signIn` | Sign in again | 다시 로그인 | Đăng nhập lại |
| ● | `community.write_screen.discard.title` | Discard this post? | 작성 중인 내용을 삭제할까요? | Bỏ bài viết này? |
| ● | `community.write_screen.discard.body` | What you've written won't be saved. | 지금까지 작성한 내용이 저장되지 않아요. | Nội dung bạn đã viết sẽ không được lưu. |
| ● | `community.write_screen.discard.cancel` | Keep editing | 계속 작성 | Tiếp tục viết |
| ● | `community.write_screen.discard.confirm` | Discard | 삭제 | Bỏ |

## `visitVerification`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `visitVerification.addPhotos` | Add photos | 사진 선택 | Thêm ảnh |
|  | `visitVerification.back` | Back | 뒤로 | Quay lại |
|  | `visitVerification.distanceKm` | {{value}}km | {{value}}km | {{value}}km |
|  | `visitVerification.distanceMeters` | {{value}}m | {{value}}m | {{value}}m |
|  | `visitVerification.emptyDescription` | We could not find a place you can verify from your current location. Check your location and try again. | 현재 위치에서 검증할 수 있는 장소를 찾지 못했어요<br>현재 위치를 다시 확인해주세요 | Không tìm thấy địa điểm nào có thể xác minh từ vị trí hiện tại. Hãy kiểm tra vị trí và thử lại. |
|  | `visitVerification.emptyTitle` | No places nearby to verify! | 근처에 검증할 장소가 없어요! | Không có địa điểm nào gần đây để xác minh! |
| ● | `visitVerification.errorTitle` | Could not load recent visits | 최근 방문을 불러오지 못했어요 | Không thể tải các lượt ghé thăm gần đây |
| ● | `visitVerification.permissionDenied` | Allow photo library access in Settings to attach photos. | 사진을 첨부하려면 설정에서 사진 접근 권한을 허용해 주세요. | Hãy cho phép truy cập thư viện ảnh trong Cài đặt để đính kèm ảnh. |
| ● | `visitVerification.permissionTitle` | Location access is off | 위치 권한이 꺼져 있어요 | Quyền vị trí đang tắt |
| ● | `visitVerification.locationPermissionDenied` | Allow location access to find places eligible for verification near you. | 주변에서 검증 가능한 장소를 찾으려면 위치 접근 권한을 허용해 주세요. | Hãy cho phép truy cập vị trí để tìm các địa điểm có thể xác minh gần bạn. |
|  | `visitVerification.photoCount` | {{count}}/3 | {{count}}/3 | {{count}}/3 |
| ● | `visitVerification.photoDelete` | Remove photo {{index}} | {{index}}번째 사진 삭제 | Xóa ảnh {{index}} |
|  | `visitVerification.photoSection` | Attach photos | 사진 첨부 | Đính kèm ảnh |
| ● | `visitVerification.placeError` | Could not load this place. | 장소 정보를 불러오지 못했어요. | Không thể tải địa điểm này. |
|  | `visitVerification.placeLoading` | Loading place information... | 장소 정보를 불러오는 중이에요... | Đang tải thông tin địa điểm... |
|  | `visitVerification.placePhoto` | {{name}} photo {{index}} | {{name}} 사진 {{index}} | Ảnh {{index}} của {{name}} |
|  | `visitVerification.reasonHelp` | You can select up to 5 | 최대 5개까지 선택할 수 있어요 | Bạn có thể chọn tối đa 5 |
|  | `visitVerification.reasonMoreCount` | {{count}} more reasons | 추천 이유 {{count}}개 더 있음 | Còn {{count}} lý do nữa |
|  | `visitVerification.reasonSelectedSuffix` | /{{max}} selected | /{{max}}개 선택됨 | /{{max}} đã chọn |
|  | `visitVerification.reasonSection` | Recommendation reasons | 추천 이유 | Lý do đề xuất |
|  | `visitVerification.reasons.clean` | Clean store | 매장이 깨끗해요 | Quán sạch sẽ |
|  | `visitVerification.reasons.delicious` | Delicious | 맛있어요 | Ngon |
|  | `visitVerification.reasons.easyToFind` | Easy to find | 찾기 쉬워요 | Dễ tìm |
|  | `visitVerification.reasons.kind` | Friendly | 친절해요 | Thân thiện |
|  | `visitVerification.reasons.multilingual` | Good multilingual descriptions | 다국어 설명이 잘 되어 있어요 | Có mô tả đa ngôn ngữ tốt |
|  | `visitVerification.reasons.parking` | Easy parking | 주차하기 편해요 | Dễ đỗ xe |
|  | `visitVerification.reasons.photoSpot` | Great for photos | 사진 찍기 좋아요 | Chụp ảnh đẹp |
|  | `visitVerification.recentVisits` | Recent visits | 최근 방문 | Ghé thăm gần đây |
|  | `visitVerification.retry` | Try again | 다시 시도 | Thử lại |
|  | `visitVerification.return` | Go back | 돌아가기 | Quay lại |
|  | `visitVerification.reviewPlaceholder` | Share your review with others, {{username}} | 다른 사람들에게 {{username}}님의 후기를 알려주세요 | {{username}}, hãy chia sẻ đánh giá của bạn với mọi người |
|  | `visitVerification.reviewSection` | Write a review | 후기 작성 | Viết đánh giá |
|  | `visitVerification.submit` | Verify | 검증하기 | Xác minh |
|  | `visitVerification.uploading` | Uploading photos... | 사진 업로드 중 | Đang tải ảnh lên... |
| ● | `visitVerification.errors.unsupportedFormat` | Choose a JPEG or PNG photo. HEIC is not supported. | JPEG 또는 PNG 사진을 선택해 주세요. HEIC 형식은 지원하지 않아요. | Hãy chọn ảnh JPEG hoặc PNG. Không hỗ trợ HEIC. |
| ● | `visitVerification.errors.fileTooLarge` | This photo is too large. Choose a smaller photo. | 사진 용량이 너무 커요. 더 작은 사진을 선택해 주세요. | Ảnh này quá lớn. Hãy chọn ảnh nhỏ hơn. |
| ● | `visitVerification.errors.unauthenticated` | Sign in again to submit your review. | 후기를 제출하려면 다시 로그인해 주세요. | Hãy đăng nhập lại để gửi đánh giá. |
| ● | `visitVerification.errors.forbidden` | You do not have permission to submit this review or photo. | 이 후기 또는 사진을 제출할 권한이 없어요. | Bạn không có quyền gửi đánh giá hoặc ảnh này. |
| ● | `visitVerification.errors.serverUnavailable` | The service is temporarily unavailable. Try again later. | 서비스를 일시적으로 이용할 수 없어요. 잠시 후 다시 시도해 주세요. | Dịch vụ tạm thời không khả dụng. Hãy thử lại sau. |
| ● | `visitVerification.errors.network` | Check your connection and try again. Your draft is preserved. | 네트워크를 확인한 뒤 다시 시도해 주세요. 작성 내용은 유지돼요. | Hãy kiểm tra kết nối và thử lại. Bản nháp của bạn vẫn được giữ. |
| ● | `visitVerification.errors.submitFailed` | Could not submit your review. Your draft is preserved. Try again. | 후기를 제출하지 못했어요. 작성 내용은 유지돼요. 다시 시도해 주세요. | Không thể gửi đánh giá. Bản nháp của bạn vẫn được giữ. Hãy thử lại. |
|  | `visitVerification.submitting` | Submitting... | 제출 중 | Đang gửi... |
|  | `visitVerification.title` | Verify | 검증하기 | Xác minh |
|  | `visitVerification.session.ambiguousPlace` | More than one place can be verified here. Move closer to one place and try again. | 현재 위치에서 여러 장소가 확인돼요. 한 장소에 더 가까이 이동한 뒤 다시 시도해 주세요. | Có nhiều hơn một địa điểm có thể xác minh ở đây. Hãy đến gần một địa điểm rồi thử lại. |
|  | `visitVerification.session.completionMissing` | Verification did not include the completed check-in. This visit cannot be treated as complete. | 완료된 체크인 정보가 없어 방문 완료로 처리할 수 없어요. | Kết quả xác minh không có thông tin check-in đã hoàn tất. Lượt ghé thăm này không thể được coi là hoàn thành. |
|  | `visitVerification.session.distance` | Latest distance: {{value}}m | 최근 거리: {{value}}m | Khoảng cách gần nhất: {{value}}m |
|  | `visitVerification.session.dwell` | Required stay: {{value}} seconds | 요구 체류 시간: {{value}}초 | Thời gian lưu lại yêu cầu: {{value}} giây |
| ● | `visitVerification.session.foregroundBlocked` | Verification is paused. Return to the app to resume from the server status. | 인증이 일시 중지됐어요. 앱으로 돌아오면 서버 상태부터 복구해요. | Quá trình xác minh đang tạm dừng. Quay lại ứng dụng để tiếp tục từ trạng thái trên máy chủ. |
|  | `visitVerification.session.inactiveTourist` | Visit verification is available only to an active tourist account. | 활성 관광객 계정만 방문 인증을 이용할 수 있어요. | Xác minh ghé thăm chỉ dành cho tài khoản du khách đang hoạt động. |
|  | `visitVerification.session.invalidObservation` | The location observation was rejected. Check your GPS signal and device time, then try again. | 위치 관측이 거절됐어요. GPS 신호와 기기 시간을 확인한 뒤 다시 시도해 주세요. | Dữ liệu vị trí bị từ chối. Hãy kiểm tra tín hiệu GPS và giờ của thiết bị rồi thử lại. |
|  | `visitVerification.session.locating` | Checking your location... | 위치를 확인하는 중이에요... | Đang kiểm tra vị trí của bạn... |
| ● | `visitVerification.session.locationFailed` | Could not read your current location. Check permission and GPS, then try again. | 현재 위치를 확인하지 못했어요. 위치 권한과 GPS를 확인한 뒤 다시 시도해 주세요. | Không đọc được vị trí hiện tại. Hãy kiểm tra quyền và GPS rồi thử lại. |
| ● | `visitVerification.session.networkError` | A network error interrupted verification. This visit has not been completed. | 네트워크 오류로 인증이 중단됐어요. 방문 완료로 처리되지 않았어요. | Lỗi mạng đã làm gián đoạn quá trình xác minh. Lượt ghé thăm này chưa hoàn tất. |
|  | `visitVerification.session.noPlace` | There is no open verification place at your current location. | 현재 위치에는 운영 중인 인증 대상 장소가 없어요. | Không có địa điểm xác minh nào đang mở tại vị trí hiện tại. |
| ● | `visitVerification.session.permissionDenied` | Location permission is required to verify this visit. | 방문 인증에는 위치 권한이 필요해요. | Cần quyền vị trí để xác minh lượt ghé thăm này. |
|  | `visitVerification.session.progress` | Verification in progress | 인증 진행 중 | Đang xác minh |
|  | `visitVerification.session.radius` | Allowed radius: {{value}}m | 허용 반경: {{value}}m | Bán kính cho phép: {{value}}m |
|  | `visitVerification.session.ready` | Start only while you are at this place. | 이 장소에 머무는 동안에만 시작해 주세요. | Chỉ bắt đầu khi bạn đang ở địa điểm này. |
|  | `visitVerification.session.recovering` | Restoring the verification session from the server... | 서버에서 진행 중인 인증 상태를 복구하는 중이에요... | Đang khôi phục phiên xác minh từ máy chủ... |
|  | `visitVerification.session.remaining_one` | {{count}} second remaining | 남은 시간: {{count}}초 | Còn {{count}} giây |
|  | `visitVerification.session.remaining_other` | {{count}} seconds remaining | 남은 시간: {{count}}초 | Còn {{count}} giây |
|  | `visitVerification.session.start` | Start visit verification | 방문 인증 시작 | Bắt đầu xác minh ghé thăm |
|  | `visitVerification.session.starting` | Starting verification session... | 인증 세션을 시작하는 중이에요... | Đang bắt đầu phiên xác minh... |
| ● | `visitVerification.session.serverError` | Could not verify the visit because of a server error. Try again. | 서버 오류로 방문을 인증하지 못했어요. 다시 시도해 주세요. | Không thể xác minh lượt ghé thăm do lỗi máy chủ. Hãy thử lại. |
|  | `visitVerification.session.status.COMPLETED` | Visit verified | 인증 완료 | Đã xác minh ghé thăm |
|  | `visitVerification.session.status.EXPIRED` | Verification session expired | 세션 만료 | Phiên xác minh đã hết hạn |
|  | `visitVerification.session.status.IN_PROGRESS` | Verification in progress | 인증 진행 중 | Đang xác minh |
|  | `visitVerification.session.status.PROXIMITY_LOST` | You left the allowed radius | 반경 이탈 | Bạn đã rời khỏi bán kính cho phép |
|  | `visitVerification.session.status.REJECTED` | Verification rejected | 인증 거절 | Xác minh bị từ chối |
|  | `visitVerification.session.status.STARTED` | Verification started | 인증 시작됨 | Đã bắt đầu xác minh |
|  | `visitVerification.session.title` | Visit verification | 방문 인증 | Xác minh ghé thăm |
|  | `visitVerification.session.unauthenticated` | Sign in again to verify this visit. | 방문을 인증하려면 다시 로그인해 주세요. | Hãy đăng nhập lại để xác minh lượt ghé thăm này. |
|  | `visitVerification.session.verifiedDwell` | Verified stay: {{value}} seconds | 인증된 체류 시간: {{value}}초 | Thời gian lưu lại đã xác minh: {{value}} giây |
|  | `visitVerification.unknownCategory` | Place | 장소 | Địa điểm |
| ● | `visitVerification.validation.contentRequired` | Write a review before submitting. | 후기를 작성해 주세요. | Hãy viết đánh giá trước khi gửi. |
| ● | `visitVerification.validation.contentTooLong` | Your review must be 2,000 characters or fewer. | 후기는 2,000자 이하로 작성해 주세요. | Đánh giá tối đa 2.000 ký tự. |
| ● | `visitVerification.validation.reasonRequired` | Select at least one recommendation reason. | 추천 이유를 한 개 이상 선택해 주세요. | Hãy chọn ít nhất một lý do đề xuất. |

## `voiceAssistant`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `voiceAssistant.command.submission` | After 5 seconds without speech, recognized voice input is sent to the AI server automatically. Text input is sent when you use Send. Exact coordinates are used only by the existing place lookup. | 음성 입력은 5초 동안 말하지 않으면 인식된 내용을 AI 서버에 자동 전송합니다. 텍스트 입력은 보내기를 누르면 전송합니다. 정확한 현재 좌표는 기존 장소 조회에만 사용합니다. | Sau 5 giây không có giọng nói, nội dung đã nhận dạng sẽ tự động được gửi tới máy chủ AI. Văn bản được gửi khi bạn nhấn Gửi. Tọa độ chính xác chỉ dùng cho việc tra cứu địa điểm hiện có. |
|  | `voiceAssistant.command.introTitle` | Before using AI | AI 사용 안내 | Trước khi dùng AI |
|  | `voiceAssistant.command.introContinue` | Continue to AI | 확인하고 시작하기 | Tiếp tục với AI |
|  | `voiceAssistant.command.introClose` | Close | 닫기 | Đóng |
|  | `voiceAssistant.command.timezone` | Request timezone: {{timezone}} | 요청 시간대: {{timezone}} | Múi giờ yêu cầu: {{timezone}} |
|  | `voiceAssistant.command.processing` | Checking place information. | 장소 정보를 확인하고 있습니다. | Đang kiểm tra thông tin địa điểm. |
|  | `voiceAssistant.command.canceled` | Voice session ended. | 음성 세션을 종료했습니다. | Phiên giọng nói đã kết thúc. |
| ● | `voiceAssistant.command.advisory` | Assistant response received. | 어시스턴트 응답을 받았습니다. | Đã nhận phản hồi từ trợ lý. |
|  | `voiceAssistant.command.bounded` | Results checked among up to 12 nearby candidates. | 가까운 후보 최대 12곳에서 조건을 확인한 결과입니다. | Kết quả được kiểm tra trong tối đa 12 địa điểm gần đây. |
|  | `voiceAssistant.command.empty` | No matching results among the checked candidates. | 조회한 후보에 조건과 일치하는 결과가 없습니다. | Không có kết quả phù hợp trong các địa điểm đã kiểm tra. |
|  | `voiceAssistant.command.slots` | Actual server intervals. These do not confirm product bookability or a reservation. | 서버의 실제 이용 시간입니다. 상품의 예약 가능 여부나 예약 확정을 의미하지 않습니다. | Đây là các khung giờ thực tế từ máy chủ, không xác nhận khả năng đặt sản phẩm hay lượt đặt chỗ. |
|  | `voiceAssistant.command.general` | General admission | 일반 이용 | Vé thường |
|  | `voiceAssistant.command.capacity` | Remaining capacity: {{count}} | 남은 정원: {{count}}명 | Sức chứa còn lại: {{count}} |
| ● | `voiceAssistant.command.failed` | The request could not be completed. Check your conditions and try again. | 요청을 완료하지 못했습니다. 조건을 확인하고 다시 시도해 주세요. | Không thể hoàn tất yêu cầu. Hãy kiểm tra điều kiện và thử lại. |
|  | `voiceAssistant.command.retry` | Try again | 다시 시도 | Thử lại |
|  | `voiceAssistant.command.resultSummary` | I found {{count}} place(s). The first result is “{{name}}”. | {{count}}곳을 찾았어요. 첫 번째 결과는 ‘{{name}}’이에요. | Mình tìm thấy {{count}} địa điểm. Kết quả đầu tiên là “{{name}}”. |
|  | `voiceAssistant.command.showOnMap` | View on map | 지도에서 보기 | Xem trên bản đồ |
|  | `voiceAssistant.command.directions` | Directions | 길찾기 | Chỉ đường |
|  | `voiceAssistant.command.share` | Share | 공유 | Chia sẻ |
|  | `voiceAssistant.command.operating.OPERATING` | Operating | 운영 중 | Đang hoạt động |
|  | `voiceAssistant.command.operating.TEMPORARILY_CLOSED` | Temporarily closed | 임시 휴업 | Tạm đóng cửa |
|  | `voiceAssistant.command.operating.PERMANENTLY_CLOSED` | Permanently closed | 폐업 | Đã đóng cửa vĩnh viễn |
|  | `voiceAssistant.command.fields.touristCategory` | Specify a place category. | 장소 카테고리를 알려 주세요. | Hãy cho biết danh mục địa điểm. |
|  | `voiceAssistant.command.fields.date` | Confirm the requested date. | 조회할 날짜를 확인해 주세요. | Hãy xác nhận ngày cần tra cứu. |
|  | `voiceAssistant.command.fields.timeRange` | Confirm the timezone and start/end times. | 시간대와 시작·종료 시간을 확인해 주세요. | Hãy xác nhận múi giờ và giờ bắt đầu/kết thúc. |
|  | `voiceAssistant.command.fields.quantity` | Specify the number of people. | 인원을 알려 주세요. | Hãy cho biết số người. |
|  | `voiceAssistant.command.fields.useCurrentLocation` | Confirm current location use and permission. | 현재 위치 사용 여부와 위치 권한을 확인해 주세요. | Hãy xác nhận việc dùng vị trí hiện tại và quyền vị trí. |
|  | `voiceAssistant.command.fields.placeId` | Choose a place from the retrieved results. | 조회 결과에서 장소를 선택해 주세요. | Hãy chọn một địa điểm trong kết quả đã tra cứu. |
|  | `voiceAssistant.command.fields.availabilityId` | Choose a retrieved time slot. | 조회한 이용 시간을 선택해 주세요. | Hãy chọn một khung giờ đã tra cứu. |
| ● | `voiceAssistant.command.errors.LOCATION_REQUIRED` | Current location and location permission are required. | 현재 위치와 위치 권한이 필요합니다. | Cần có vị trí hiện tại và quyền vị trí. |
| ● | `voiceAssistant.command.errors.ID_NOT_IN_CONTEXT` | Search again or select a verified place. | 장소를 다시 검색하거나 선택해 주세요. | Hãy tìm lại hoặc chọn một địa điểm đã xác minh. |
| ● | `voiceAssistant.command.errors.STALE_CONTEXT` | Your context changed. Submit a new request. | 조건이 변경되었습니다. 다시 요청해 주세요. | Bối cảnh đã thay đổi. Hãy gửi yêu cầu mới. |
| ● | `voiceAssistant.command.errors.CANCELED` | Request canceled. | 요청이 취소되었습니다. | Đã hủy yêu cầu. |
| ● | `voiceAssistant.command.errors.TIMEOUT` | The lookup timed out. | 조회 시간이 초과되었습니다. | Tra cứu quá thời gian chờ. |
| ● | `voiceAssistant.command.errors.AUTHENTICATION_REQUIRED` | Sign in to continue. | 로그인이 필요합니다. | Hãy đăng nhập để tiếp tục. |
| ● | `voiceAssistant.command.errors.FORBIDDEN` | This request is not currently supported or allowed. | 현재 지원하지 않거나 허용되지 않는 요청입니다. | Yêu cầu này hiện chưa được hỗ trợ hoặc không được phép. |
| ● | `voiceAssistant.command.errors.NOT_FOUND` | Information was not found. | 정보를 찾을 수 없습니다. | Không tìm thấy thông tin. |
| ● | `voiceAssistant.command.errors.RATE_LIMITED` | Too many requests. Try again later. | 요청이 많습니다. 잠시 후 다시 시도해 주세요. | Quá nhiều yêu cầu. Hãy thử lại sau. |
| ● | `voiceAssistant.command.errors.NETWORK_ERROR` | Check your network connection. | 네트워크 연결을 확인해 주세요. | Hãy kiểm tra kết nối mạng. |
| ● | `voiceAssistant.command.errors.SERVER_ERROR` | The server is unavailable. Try again. | 서버에 연결할 수 없습니다. 다시 시도해 주세요. | Máy chủ không khả dụng. Hãy thử lại. |
| ● | `voiceAssistant.command.errors.INVALID_SERVER_RESPONSE` | The server information could not be verified. | 서버 정보를 확인할 수 없습니다. | Không thể xác minh thông tin từ máy chủ. |
| ● | `voiceAssistant.command.errors.REPLAY_CONFLICT` | Duplicate requests differ. Enter a new request. | 중복 요청의 내용이 다릅니다. 새 요청을 입력해 주세요. | Các yêu cầu trùng lặp có nội dung khác nhau. Hãy nhập yêu cầu mới. |
|  | `voiceAssistant.open` | Open AI assistant | AI 어시스턴트 열기 | Mở trợ lý AI |
| ● | `voiceAssistant.shortLabel` | AI | AI | AI |
|  | `voiceAssistant.brand` | Pingdy | Pingdy | Pingdy |
|  | `voiceAssistant.title` | AI assistant | AI 어시스턴트 | Trợ lý AI |
|  | `voiceAssistant.close` | Close assistant | 어시스턴트 닫기 | Đóng trợ lý |
|  | `voiceAssistant.microphone` | Start microphone | 마이크 시작 | Bật micrô |
|  | `voiceAssistant.stop` | Stop and send | 중지하고 보내기 | Dừng và gửi |
|  | `voiceAssistant.input` | Your request | 요청 내용 | Yêu cầu của bạn |
|  | `voiceAssistant.placeholder` | Ask me anything! | 무엇이든 물어보세요! | Cứ hỏi mình bất cứ điều gì! |
|  | `voiceAssistant.listeningPrompt` | Listening... | 듣고있어요! | Đang nghe... |
|  | `voiceAssistant.settings` | Open microphone and speech recognition settings | 마이크·음성 인식 설정 열기 | Mở cài đặt micrô và nhận dạng giọng nói |
|  | `voiceAssistant.preview` | Input preview: nothing is sent to a server. Use Send on the keyboard to prepare your text locally. | 입력 미리보기입니다. 서버로 전송되지 않으며, 키보드의 보내기를 누르면 기기 안에서 요청을 준비합니다. | Xem trước nội dung nhập: không có gì được gửi tới máy chủ. Nhấn Gửi trên bàn phím để chuẩn bị văn bản ngay trên thiết bị. |
|  | `voiceAssistant.voiceUnavailable` | Voice recognition is unavailable on this device. You can use text input. | 이 기기에서는 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | Thiết bị này không hỗ trợ nhận dạng giọng nói. Bạn có thể nhập văn bản. |
|  | `voiceAssistant.feedback.unrecognized` | I’m not sure what you mean. Could you say that again? | 무슨 말을 하시는지 잘 모르겠어요, 다시 한번 부탁드려도 될까요? | Mình chưa hiểu ý bạn. Bạn nói lại giúp mình được không? |
|  | `voiceAssistant.feedback.noSpeech` | I couldn’t hear a request. Could you say that again? | 말씀을 듣지 못했어요. 다시 한번 말씀해 주시겠어요? | Mình chưa nghe thấy yêu cầu nào. Bạn nói lại giúp mình được không? |
|  | `voiceAssistant.feedback.retry` | Speak again | 다시 말하기 | Nói lại |
|  | `voiceAssistant.feedback.dismiss` | That’s okay | 괜찮아요 | Không sao |
|  | `voiceAssistant.localOnly` | Input prepared on this device. AI connection is not available yet; nothing was sent. | 이 기기에서 입력을 준비했습니다. AI 연결은 아직 제공되지 않아 전송하지 않았습니다. | Nội dung đã được chuẩn bị trên thiết bị này. Kết nối AI chưa khả dụng nên chưa có gì được gửi đi. |
| ● | `voiceAssistant.advisory` | Assistant guidance may be inaccurate. Verify important details. | 어시스턴트 안내는 정확하지 않을 수 있습니다. 중요한 정보는 다시 확인해 주세요. | Hướng dẫn của trợ lý có thể chưa chính xác. Hãy kiểm tra lại các thông tin quan trọng. |
|  | `voiceAssistant.invalidResponse` | The assistant response could not be verified. Please try again. | 어시스턴트 응답을 확인할 수 없습니다. 다시 시도해 주세요. | Không thể xác minh phản hồi của trợ lý. Vui lòng thử lại. |
|  | `voiceAssistant.clarification` | More information is needed | 추가 정보가 필요합니다 | Cần thêm thông tin |
| ● | `voiceAssistant.permissions.undetermined` | Microphone or speech recognition permission has not been requested. | 마이크 또는 음성 인식 권한을 아직 요청하지 않았습니다. | Chưa yêu cầu quyền micrô hoặc nhận dạng giọng nói. |
| ● | `voiceAssistant.permissions.granted` | Microphone and speech recognition permissions allowed. | 마이크와 음성 인식 권한이 허용되었습니다. | Đã cho phép quyền micrô và nhận dạng giọng nói. |
| ● | `voiceAssistant.permissions.denied` | Microphone or speech recognition permission denied. You can retry or type instead. | 마이크 또는 음성 인식 권한이 거부되었습니다. 다시 요청하거나 텍스트를 입력해 주세요. | Quyền micrô hoặc nhận dạng giọng nói bị từ chối. Bạn có thể thử lại hoặc nhập văn bản. |
| ● | `voiceAssistant.permissions.blocked` | Microphone or speech recognition access requires a change in system settings. You can type instead. | 시스템 설정에서 마이크 또는 음성 인식 권한을 변경해야 합니다. 텍스트 입력은 사용할 수 있습니다. | Cần thay đổi quyền micrô hoặc nhận dạng giọng nói trong cài đặt hệ thống. Bạn có thể nhập văn bản. |
| ● | `voiceAssistant.permissions.restricted` | Speech recognition is restricted by this device’s policy. You can type instead. | 기기 정책으로 음성 인식이 제한되어 있습니다. 텍스트로 입력해 주세요. | Chính sách của thiết bị này hạn chế nhận dạng giọng nói. Bạn có thể nhập văn bản. |
|  | `voiceAssistant.phases.idle` | Ready for input | 입력 대기 | Sẵn sàng nhận yêu cầu |
| ● | `voiceAssistant.phases.permissionRequesting` | Checking microphone and speech recognition permissions | 마이크·음성 인식 권한 확인 중 | Đang kiểm tra quyền micrô và nhận dạng giọng nói |
|  | `voiceAssistant.phases.listening` | Microphone on — listening | 마이크 켜짐 — 듣는 중 | Micrô đang bật — đang nghe |
|  | `voiceAssistant.phases.processing` | Microphone stopping — processing speech | 마이크 중지 중 — 음성 처리 중 | Đang tắt micrô — đang xử lý giọng nói |
|  | `voiceAssistant.phases.final` | Final input ready | 최종 입력 준비됨 | Nội dung cuối cùng đã sẵn sàng |
|  | `voiceAssistant.phases.canceled` | Input canceled | 입력 취소됨 | Đã hủy nhập |
| ● | `voiceAssistant.phases.permissionDenied` | Voice permission denied | 음성 입력 권한 거부됨 | Quyền giọng nói bị từ chối |
|  | `voiceAssistant.phases.unavailable` | Voice input unavailable | 음성 입력 사용 불가 | Không thể nhập bằng giọng nói |
| ● | `voiceAssistant.phases.error` | Input could not be completed | 입력을 완료하지 못했습니다 | Không thể hoàn tất việc nhập |
| ● | `voiceAssistant.errors.interrupted` | Audio was interrupted. Try again or type your request. | 다른 오디오 작업으로 중단되었습니다. 다시 시도하거나 텍스트로 입력해 주세요. | Âm thanh bị gián đoạn. Hãy thử lại hoặc nhập yêu cầu của bạn. |
| ● | `voiceAssistant.errors.noSpeech` | No final speech was recognized. Try again or type your request. | 최종 음성을 인식하지 못했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | Không nhận dạng được câu nói cuối cùng. Hãy thử lại hoặc nhập yêu cầu của bạn. |
| ● | `voiceAssistant.errors.unavailable` | Speech recognition is unavailable. Please type your request. | 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | Nhận dạng giọng nói không khả dụng. Vui lòng nhập yêu cầu của bạn. |
| ● | `voiceAssistant.errors.network` | The speech service could not connect. Check your network or type your request. | 음성 인식 서비스에 연결하지 못했습니다. 네트워크를 확인하거나 텍스트로 입력해 주세요. | Không thể kết nối dịch vụ giọng nói. Hãy kiểm tra mạng hoặc nhập yêu cầu của bạn. |
| ● | `voiceAssistant.errors.failed` | Speech recognition failed. Please type or try again. | 음성 인식에 실패했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | Nhận dạng giọng nói thất bại. Hãy nhập văn bản hoặc thử lại. |
| ● | `voiceAssistant.errors.empty` | Enter a request first. | 요청을 먼저 입력해 주세요. | Hãy nhập yêu cầu trước. |
| ● | `voiceAssistant.errors.tooLong` | Use 2,000 characters or fewer. | 2,000자 이내로 입력해 주세요. | Hãy nhập tối đa 2.000 ký tự. |
| ● | `voiceAssistant.errors.submitFailed` | Input could not be handed over. Close the assistant and start a new request. | 입력을 전달하지 못했습니다. 어시스턴트를 닫고 새 요청을 시작해 주세요. | Không thể chuyển nội dung nhập. Hãy đóng trợ lý và bắt đầu yêu cầu mới. |

## `selectLanguage`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `selectLanguage.title` | Select Language | 언어 선택 | Chọn ngôn ngữ |
|  | `selectLanguage.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | Chúng tôi sẽ chỉ cho bạn lộ trình tốt nhất! |
|  | `selectLanguage.button` | Continue | 계속 | Tiếp tục |
|  | `selectLanguage.search` | Search... | 검색하기 | Tìm kiếm... |
| ● | `selectLanguage.logoAccessibilityLabel` | PingDom logo | 핑덤 로고 | Logo PingDom |
|  | `selectLanguage.options.en` | English | 영어 | Tiếng Anh |
|  | `selectLanguage.options.ko` | Korean | 한국어 | Tiếng Hàn |
|  | `selectLanguage.options.ja` | 日本語 | 日本語 | Tiếng Nhật |
|  | `selectLanguage.options.zh-CN` | Chinese (Simplified) | 중국어(간체) | Tiếng Trung (Giản thể) |
|  | `selectLanguage.options.zh-TW` | Chinese (Traditional) | 중국어(번체) | Tiếng Trung (Phồn thể) |
|  | `selectLanguage.options.vi` | Vietnamese | 베트남어 | Tiếng Việt |
|  | `selectLanguage.options.es` | Spanish | 스페인어 | Tiếng Tây Ban Nha |
|  | `selectLanguage.options.pt-BR` | Portuguese (Brazil) | 포르투갈어(브라질) | Tiếng Bồ Đào Nha (Brazil) |
|  | `selectLanguage.progress` | Step {{current}} of {{total}} | 총 {{total}}단계 중 {{current}}단계 | Bước {{current}}/{{total}} |

## `selectCountry`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `selectCountry.title` | Select Country | 국가 선택 | Chọn quốc gia |
|  | `selectCountry.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | Chúng tôi sẽ chỉ cho bạn lộ trình tốt nhất! |
|  | `selectCountry.button` | Continue | 계속 | Tiếp tục |
|  | `selectCountry.search` | Search... | 검색하기 | Tìm kiếm... |

## `selectAge`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `selectAge.title` | Select Birth Year | 생년 선택 | Chọn năm sinh |
|  | `selectAge.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | Chúng tôi sẽ chỉ cho bạn lộ trình tốt nhất! |
|  | `selectAge.button` | Continue | 계속 | Tiếp tục |

## `selectGender`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `selectGender.title` | Select gender | 성별 선택 | Chọn giới tính |
|  | `selectGender.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | Chúng tôi sẽ chỉ cho bạn lộ trình tốt nhất! |
|  | `selectGender.button` | Continue | 계속 | Tiếp tục |
|  | `selectGender.male` | Male | 남성 | Nam |
|  | `selectGender.female` | Female | 여성 | Nữ |
|  | `selectGender.other` | Prefer not to say | 비공개 | Không muốn tiết lộ |

## `countries`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `countries.us` | United States | 미국 | Hoa Kỳ |
|  | `countries.cn` | China | 중국 | Trung Quốc |
|  | `countries.jp` | Japan | 일본 | Nhật Bản |
|  | `countries.th` | Thailand | 태국 | Thái Lan |
|  | `countries.vn` | Vietnam | 베트남 | Việt Nam |
|  | `countries.kr` | South Korea | 대한민국 | Hàn Quốc |

## `loginForeign`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `loginForeign.title` | Only Pingdom | 오직 핑덤 | Chỉ có ở PingDom |
|  | `loginForeign.subtitle` | Let's find hidden<br>places in Korea! | 한국의 숨은 장소를<br>찾아보세요! | Cùng tìm những địa điểm<br>ẩn mình ở Hàn Quốc! |
|  | `loginForeign.button` | Get Started | 시작하기 | Bắt đầu |

## `experience`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `experience.common.back` | Back to map | 지도로 돌아가기 | Quay lại bản đồ |
|  | `experience.common.close` | Close | 닫기 | Đóng |
|  | `experience.common.loading` | Loading. Please wait. | 불러오는 중입니다. 잠시 기다려 주세요. | Đang tải. Vui lòng chờ. |
|  | `experience.placeDetail.title` | Place details | 장소 상세 | Chi tiết địa điểm |
|  | `experience.placeDetail.open` | Open now | 영업 중 | Đang mở cửa |
|  | `experience.placeDetail.distance` | {{distance}} away | {{distance}} 거리 | Cách {{distance}} |
|  | `experience.placeDetail.checked` | Visitor information updated {{date}} | 방문자 정보 업데이트 {{date}} | Thông tin khách ghé thăm cập nhật {{date}} |
|  | `experience.placeDetail.couponPrice` | Coupon value {{price}} | 쿠폰 혜택 {{price}} | Giá trị phiếu ưu đãi {{price}} |
|  | `experience.placeDetail.checkIn` | Check in at this place | 이 장소에 체크인하기 | Check-in tại địa điểm này |
|  | `experience.placeDetail.coupon` | View available coupons | 사용 가능한 쿠폰 보기 | Xem phiếu ưu đãi khả dụng |
|  | `experience.checkIn.title` | Check in | 체크인 | Check-in |
|  | `experience.checkIn.description` | Confirm that you are visiting this place to unlock local benefits. | 장소 방문을 확인하고 현지 방문객 혜택을 받아보세요. | Xác nhận bạn đang ghé thăm địa điểm này để mở khóa ưu đãi địa phương. |
|  | `experience.checkIn.status` | Ready to confirm your location | 현재 위치 확인 준비 완료 | Sẵn sàng xác nhận vị trí của bạn |
|  | `experience.checkIn.action` | Confirm my location and complete check-in | 내 위치를 확인하고 체크인 완료하기 | Xác nhận vị trí của tôi và hoàn tất check-in |
|  | `experience.checkIn.collapseVisits` | Show less | 접기 | Thu gọn |
|  | `experience.checkIn.expandVisits` | Show all | 전체 보기 | Xem tất cả |
|  | `experience.checkIn.loadMoreVisits` | Load more visits | 방문 기록 더 보기 | Tải thêm lượt ghé thăm |
| ● | `experience.checkIn.locationDenied` | Location permission is required to check in. | 체크인하려면 위치 권한이 필요합니다. | Cần quyền vị trí để check-in. |
| ● | `experience.checkIn.locationFailed` | Your current location could not be retrieved. | 현재 위치를 가져오지 못했습니다. | Không thể lấy vị trí hiện tại của bạn. |
|  | `experience.checkIn.locationLoading` | Checking your current location… | 현재 위치를 확인하고 있습니다… | Đang kiểm tra vị trí hiện tại của bạn… |
|  | `experience.checkIn.openSettings` | Open settings | 설정 열기 | Mở cài đặt |
|  | `experience.checkIn.recentVisits` | Recent visits | 최근 방문 | Ghé thăm gần đây |
|  | `experience.checkIn.retryCheckIn` | Try check-in again | 체크인 다시 시도 | Thử check-in lại |
|  | `experience.checkIn.retryLocation` | Try location again | 위치 다시 확인 | Thử lấy vị trí lại |
|  | `experience.checkIn.retryVisits` | Try loading visits again | 방문 기록 다시 불러오기 | Thử tải lượt ghé thăm lại |
|  | `experience.checkIn.selectedPlace` | Selected place ID {{placeId}} | 선택한 장소 ID {{placeId}} | ID địa điểm đã chọn {{placeId}} |
|  | `experience.checkIn.submitting` | Checking in. Please wait. | 체크인 중입니다. 잠시 기다려 주세요. | Đang check-in. Vui lòng chờ. |
|  | `experience.checkIn.success` | Check-in complete | 체크인이 완료되었습니다. | Check-in hoàn tất |
|  | `experience.checkIn.visitDistance` | {{distance}} m away | 장소와 {{distance}}m 거리 | Cách {{distance}} m |
|  | `experience.checkIn.visitPlace` | Place ID {{placeId}} | 장소 ID {{placeId}} | ID địa điểm {{placeId}} |
|  | `experience.checkIn.visitsEmpty` | No recent visits yet. | 아직 최근 방문 기록이 없습니다. | Chưa có lượt ghé thăm gần đây. |
|  | `experience.checkIn.visitsLoading` | Loading recent visits… | 최근 방문 기록을 불러오고 있습니다… | Đang tải các lượt ghé thăm gần đây… |
| ● | `experience.checkIn.errors.authentication` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại. |
| ● | `experience.checkIn.errors.duplicate` | You have already checked in at this place under the current server policy. | 현재 서버 정책상 이미 체크인한 장소입니다. | Theo chính sách máy chủ hiện tại, bạn đã check-in tại địa điểm này rồi. |
| ● | `experience.checkIn.errors.generic` | Check-in could not be completed. Please try again. | 체크인을 완료하지 못했습니다. 다시 시도해 주세요. | Không thể hoàn tất check-in. Vui lòng thử lại. |
| ● | `experience.checkIn.errors.network` | You appear to be offline. Check your connection and try again. | 네트워크에 연결되지 않았습니다. 연결을 확인한 뒤 다시 시도해 주세요. | Có vẻ bạn đang ngoại tuyến. Hãy kiểm tra kết nối và thử lại. |
| ● | `experience.checkIn.errors.out-of-range` | You are too far from this place to check in. | 장소와 거리가 멀어 체크인할 수 없습니다. | Bạn đang ở quá xa địa điểm này nên không thể check-in. |
|  | `experience.coupon.title` | Coupon wallet | 쿠폰 지갑 | Ví phiếu ưu đãi |
|  | `experience.coupon.description` | Coupons that are ready to use appear here. | 바로 사용할 수 있는 쿠폰이 이곳에 표시됩니다. | Các phiếu ưu đãi sẵn sàng sử dụng sẽ hiển thị tại đây. |
|  | `experience.coupon.status` | No available coupons | 사용 가능한 쿠폰 없음 | Không có phiếu ưu đãi khả dụng |
|  | `experience.coupon.action` | Explore places offering visitor coupons | 방문객 쿠폰을 제공하는 장소 둘러보기 | Khám phá các địa điểm có phiếu ưu đãi cho khách |

## `auth`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `auth.koreanEntry.title` | My own places, Pingdom | 나만의 장소, 핑덤 | Địa điểm của riêng tôi, PingDom |
|  | `auth.koreanEntry.subtitle` | Share your places<br>with visitors from abroad! | 당신만의 장소를<br>외국인들에게 공유해주세요! | Hãy chia sẻ địa điểm của bạn<br>với du khách nước ngoài! |
|  | `auth.koreanEntry.existingAccount` | Already have an account?  | 이미 계정이 있으신가요?  | Bạn đã có tài khoản?  |
|  | `auth.koreanEntry.login` | Log in | 로그인 | Đăng nhập |
|  | `auth.koreanEntry.start` | Get Started | 시작하기 | Bắt đầu |
|  | `auth.login.title` | Start Pingdom | 핑덤 시작하기 | Bắt đầu với PingDom |
|  | `auth.login.username` | Username | 아이디 | Tên đăng nhập |
|  | `auth.login.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | Nhập tên đăng nhập |
|  | `auth.login.password` | Password | 비밀번호 | Mật khẩu |
|  | `auth.login.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | Nhập mật khẩu |
|  | `auth.login.submit` | Get Started | 시작하기 | Bắt đầu |
|  | `auth.login.submitting` | Logging in... | 로그인 중... | Đang đăng nhập... |
|  | `auth.login.findUsername` | Find ID | 아이디 찾기 | Tìm tên đăng nhập |
|  | `auth.login.findPassword` | Find password | 비밀번호 찾기 | Tìm mật khẩu |
|  | `auth.login.signup` | Sign up | 회원가입 | Đăng ký |
| ● | `auth.login.unknownError` | An unknown error occurred while logging in. | 로그인 중 알 수 없는 오류가 발생했습니다. | Đã xảy ra lỗi không xác định khi đăng nhập. |
|  | `auth.passwordReset.confirmDescription` | Enter the reset code sent to {{email}} and choose a new password. | {{email}}로 보낸 재설정 코드를 입력하고 새 비밀번호를 설정해주세요. | Nhập mã đặt lại đã gửi tới {{email}} và chọn mật khẩu mới. |
|  | `auth.passwordReset.confirmTitle` | Set a new password | 새 비밀번호 설정 | Đặt mật khẩu mới |
|  | `auth.passwordReset.invalidToken` | That reset code is not valid. Check the code or request a new one. | 재설정 코드가 올바르지 않습니다. 코드를 확인하거나 다시 요청해주세요. | Mã đặt lại không hợp lệ. Hãy kiểm tra mã hoặc yêu cầu mã mới. |
|  | `auth.passwordReset.newPassword` | New password | 새 비밀번호 | Mật khẩu mới |
|  | `auth.passwordReset.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | Ít nhất 8 ký tự |
|  | `auth.passwordReset.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | Mật khẩu phải có ít nhất 8 ký tự |
|  | `auth.passwordReset.processing` | Processing... | 처리 중... | Đang xử lý... |
|  | `auth.passwordReset.requestDescription` | Enter the email you signed up with. We will send you a reset code. | 가입한 이메일을 입력하시면 재설정 코드를 보내드려요. | Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi cho bạn mã đặt lại. |
|  | `auth.passwordReset.requestTitle` | Reset your password | 비밀번호 재설정 | Đặt lại mật khẩu |
|  | `auth.passwordReset.resend` | Send the code again | 코드 다시 보내기 | Gửi lại mã |
|  | `auth.passwordReset.sendToken` | Send reset code | 재설정 코드 받기 | Gửi mã đặt lại |
|  | `auth.passwordReset.submit` | Reset password | 비밀번호 재설정하기 | Đặt lại mật khẩu |
|  | `auth.passwordReset.token` | Reset code | 재설정 코드 | Mã đặt lại |
|  | `auth.passwordReset.tokenPlaceholder` | Enter the code from your email | 메일로 받은 코드를 입력하세요 | Nhập mã trong email của bạn |
|  | `auth.passwordReset.tokenRequired` | Please enter the reset code | 재설정 코드를 입력해주세요 | Vui lòng nhập mã đặt lại |
| ● | `auth.passwordReset.unknownError` | An unknown error occurred while resetting your password. | 비밀번호 재설정 중 알 수 없는 오류가 발생했습니다. | Đã xảy ra lỗi không xác định khi đặt lại mật khẩu. |
|  | `auth.signup.title` | Start Pingdom | 핑덤 시작하기 | Bắt đầu với PingDom |
|  | `auth.signup.passwordTitle` | Confirm Password | 비밀번호 확인 | Xác nhận mật khẩu |
|  | `auth.signup.username` | Username | 아이디 | Tên đăng nhập |
|  | `auth.signup.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | Nhập tên đăng nhập |
|  | `auth.signup.email` | Email | 이메일 | Email |
|  | `auth.signup.emailPlaceholder` | Enter your email | 이메일을 입력하세요 | Nhập email của bạn |
|  | `auth.signup.password` | Password | 비밀번호 | Mật khẩu |
|  | `auth.signup.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | Nhập mật khẩu |
|  | `auth.signup.passwordConfirm` | Confirm password | 비밀번호 확인 | Xác nhận mật khẩu |
|  | `auth.signup.passwordConfirmPlaceholder` | Enter your password again | 비밀번호를 한번 더 입력하세요 | Nhập lại mật khẩu |
|  | `auth.signup.next` | Next | 다음 | Tiếp |
|  | `auth.signup.start` | Get Started | 시작하기 | Bắt đầu |
|  | `auth.signup.processing` | Processing... | 처리 중... | Đang xử lý... |
| ● | `auth.signup.unknownError` | An unknown error occurred while signing up. | 회원가입 중 알 수 없는 오류가 발생했습니다. | Đã xảy ra lỗi không xác định khi đăng ký. |
| ● | `auth.validation.usernameRequired` | Please enter your username | 아이디를 입력해주세요 | Vui lòng nhập tên đăng nhập |
| ● | `auth.validation.emailRequired` | Please enter your email | 이메일을 입력해주세요 | Vui lòng nhập email |
| ● | `auth.validation.emailInvalid` | Please enter a valid email address | 올바른 이메일 형식이 아닙니다 | Vui lòng nhập địa chỉ email hợp lệ |
| ● | `auth.validation.passwordRequired` | Please enter your password | 비밀번호를 입력해주세요 | Vui lòng nhập mật khẩu |
| ● | `auth.validation.passwordConfirmRequired` | Please enter your password again | 비밀번호를 한번 더 입력해주세요 | Vui lòng nhập lại mật khẩu |
| ● | `auth.validation.passwordMismatch` | Passwords do not match | 비밀번호가 일치하지 않습니다 | Mật khẩu không khớp |

## `common`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `common.missingTranslation` | Translation unavailable | 번역을 제공할 수 없습니다 | Chưa có bản dịch |
|  | `common.navigation.back` | Go back | 뒤로 가기 | Quay lại |
|  | `common.navigation.close` | Close | 닫기 | Đóng |
| ● | `common.navigation.exitHint` | Press back again to exit the app. | 뒤로가기를 한 번 더 누르면 앱이 종료됩니다. | Nhấn quay lại lần nữa để thoát ứng dụng. |
|  | `common.navigation.retry` | Try again | 다시 시도 | Thử lại |
|  | `common.unsupportedFeature.description` | This feature is not currently supported in the app. | 이 기능은 현재 앱에서 지원하지 않습니다. | Tính năng này hiện chưa được hỗ trợ trong ứng dụng. |
|  | `common.unsupportedFeature.title` | Not available in the app | 앱에서 제공하지 않는 기능 | Chưa có trong ứng dụng |
| ● | `common.apiError.timeout.title` | The response is taking too long | 응답 시간이 초과되었어요 | Phản hồi mất quá nhiều thời gian |
| ● | `common.apiError.timeout.description` | Check your connection and try loading again. | 연결을 확인하고 다시 조회해 주세요. | Hãy kiểm tra kết nối và thử tải lại. |
| ● | `common.apiError.server.title` | Service temporarily unavailable | 서비스에 잠시 연결할 수 없어요 | Dịch vụ tạm thời không khả dụng |
| ● | `common.apiError.server.description` | Please try loading again in a moment. | 잠시 후 다시 조회해 주세요. | Vui lòng thử tải lại sau giây lát. |
| ● | `common.apiError.rateLimited.title` | Too many requests | 요청이 너무 많아요 | Quá nhiều yêu cầu |
| ● | `common.apiError.rateLimited.description` | Please wait a moment before trying again. | 잠시 기다린 후 다시 시도해 주세요. | Vui lòng chờ một lát rồi thử lại. |
| ● | `common.apiError.mutationUnknown.title` | Result not confirmed | 처리 결과를 확인해 주세요 | Chưa xác nhận được kết quả |
| ● | `common.apiError.mutationUnknown.description` | We could not confirm the result. Check the latest status before submitting again. | 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 최신 상태를 확인해 주세요. | Chúng tôi chưa xác nhận được kết quả. Hãy kiểm tra trạng thái mới nhất trước khi gửi lại. |
| ● | `common.apiError.actions.back` | Go back | 목록으로 | Quay lại |
| ● | `common.apiError.actions.retry` | Try again | 다시 시도 | Thử lại |
| ● | `common.apiError.actions.signIn` | Sign in again | 다시 로그인 | Đăng nhập lại |
| ● | `common.apiError.actions.update` | Update app | 앱 업데이트 | Cập nhật ứng dụng |
| ● | `common.apiError.authentication.description` | Your session is no longer valid. Please sign in again. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | Phiên của bạn không còn hợp lệ. Vui lòng đăng nhập lại. |
| ● | `common.apiError.authentication.title` | Sign-in required | 로그인이 필요합니다 | Cần đăng nhập |
| ● | `common.apiError.authorization.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | Tài khoản này không có quyền thực hiện thao tác này. |
| ● | `common.apiError.authorization.title` | Permission required | 권한이 필요합니다 | Cần có quyền |
| ● | `common.apiError.conflict.description` | The request conflicts with the resource’s current state. Refresh its latest state. | 리소스의 현재 상태와 요청이 충돌합니다. 최신 상태를 확인해 주세요. | Yêu cầu xung đột với trạng thái hiện tại của tài nguyên. Hãy làm mới để xem trạng thái mới nhất. |
| ● | `common.apiError.conflict.title` | State has changed | 상태가 변경되었습니다 | Trạng thái đã thay đổi |
| ● | `common.apiError.expired.description` | This coupon or resource has expired. | 쿠폰 또는 리소스의 이용 기간이 만료되었습니다. | Phiếu ưu đãi hoặc tài nguyên này đã hết hạn. |
| ● | `common.apiError.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | Không còn khả dụng |
| ● | `common.apiError.generic.description` | Please check your connection and try again. | 네트워크 상태를 확인한 후 다시 시도해 주세요. | Vui lòng kiểm tra kết nối và thử lại. |
| ● | `common.apiError.generic.title` | Could not load data | 데이터를 불러오지 못했습니다 | Không thể tải dữ liệu |
| ● | `common.apiError.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | Không thể kết nối tới máy chủ. Hãy kiểm tra kết nối và thử lại. |
| ● | `common.apiError.network.title` | Connection problem | 연결에 문제가 있습니다 | Sự cố kết nối |
| ● | `common.apiError.notFound.description` | The requested resource no longer exists. Return to the latest list. | 요청한 항목이 더 이상 존재하지 않습니다. 최신 목록으로 돌아가 주세요. | Nội dung được yêu cầu không còn tồn tại. Hãy quay lại danh sách mới nhất. |
| ● | `common.apiError.notFound.title` | Not found | 항목을 찾을 수 없습니다 | Không tìm thấy |
| ● | `common.apiError.outOfRange.description` | Move closer to the place and check your location accuracy. | 장소에 더 가까이 이동하고 위치 정확도를 확인해 주세요. | Hãy đến gần địa điểm hơn và kiểm tra độ chính xác của vị trí. |
| ● | `common.apiError.outOfRange.title` | Too far away to check in | 체크인 가능 거리 밖입니다 | Quá xa để check-in |
| ● | `common.apiError.updateRequired.description` | Install the latest version to keep using PingDom. | PingDom을 계속 사용하려면 최신 버전을 설치해 주세요. | Hãy cài đặt phiên bản mới nhất để tiếp tục dùng PingDom. |
| ● | `common.apiError.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | Cần cập nhật |
| ● | `common.apiError.validation.description` | Review the highlighted information and try again. | 입력한 정보를 확인한 후 다시 시도해 주세요. | Hãy xem lại thông tin được đánh dấu và thử lại. |
| ● | `common.apiError.validation.title` | Check your entries | 입력 정보를 확인해 주세요 | Hãy kiểm tra thông tin đã nhập |
| ● | `common.error.description` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Vui lòng thử lại sau giây lát. |
| ● | `common.error.retry` | Try again | 다시 시도 | Thử lại |
| ● | `common.error.title` | Something went wrong | 문제가 발생했습니다 | Đã xảy ra lỗi |

## `placeMenu`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `placeMenu.exchange.amount` | Approx. {{price}} | 약 {{price}} | Khoảng {{price}} |
|  | `placeMenu.exchange.loading` | Loading exchange rate… | 환율을 불러오는 중입니다… | Đang tải tỷ giá… |
|  | `placeMenu.exchange.retry` | Exchange rate unavailable · Try again | 환율 조회 실패 · 다시 시도 | Không lấy được tỷ giá · Thử lại |
| ● | `placeMenu.accessibility.image` | {{name}} menu image | {{name}} 메뉴 이미지 | Ảnh thực đơn {{name}} |
| ● | `placeMenu.accessibility.imageUnavailable` | No image for {{name}} | {{name}} 메뉴 이미지 없음 | Không có ảnh cho {{name}} |
| ● | `placeMenu.accessibility.price` | Price: {{price}} | 가격: {{price}} | Giá: {{price}} |
| ● | `placeMenu.accessibility.status` | {{name}} status: {{status}} | {{name}} 상태: {{status}} | Trạng thái {{name}}: {{status}} |
| ● | `placeMenu.error.notFound` | The place details and menu data are temporarily out of sync. Refresh this menu or return to the map. | 장소 상세와 메뉴 데이터가 일시적으로 일치하지 않습니다. 메뉴를 새로고침하거나 지도로 돌아가 주세요. | Chi tiết địa điểm và dữ liệu thực đơn tạm thời chưa đồng bộ. Hãy làm mới thực đơn hoặc quay lại bản đồ. |
| ● | `placeMenu.error.title` | Could not load the menu. | 메뉴를 불러오지 못했습니다. | Không thể tải thực đơn. |
|  | `placeMenu.empty` | No menu has been added yet. | 등록된 메뉴가 없습니다. | Chưa có thực đơn nào. |
|  | `placeMenu.imageUnavailable` | No image | 이미지 없음 | Không có ảnh |
|  | `placeMenu.loading` | Loading menu… | 메뉴를 불러오는 중입니다… | Đang tải thực đơn… |
|  | `placeMenu.priceUnavailable` | Price unavailable | 가격 정보 없음 | Chưa có giá |
|  | `placeMenu.retry` | Try again | 다시 시도 | Thử lại |
|  | `placeMenu.soldOut` | Sold out | 품절 | Hết hàng |
|  | `placeMenu.title` | Menu | 메뉴 | Thực đơn |

## `examplePlaces`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `examplePlaces.count` | {{count}} places | 장소 {{count}}개 | {{count}} địa điểm |
|  | `examplePlaces.englishMenu` | English menu: {{status}} | 영문 메뉴: {{status}} | Thực đơn tiếng Anh: {{status}} |
|  | `examplePlaces.emptyDescription` | Try again after place data is available. | 장소 데이터가 등록된 후 다시 확인해 주세요. | Hãy thử lại sau khi có dữ liệu địa điểm. |
|  | `examplePlaces.emptyTitle` | No places yet | 아직 등록된 장소가 없습니다 | Chưa có địa điểm nào |
|  | `examplePlaces.loading` | Loading places... | 장소를 불러오는 중입니다... | Đang tải địa điểm... |
|  | `examplePlaces.title` | Place list example | 장소 목록 예제 | Ví dụ danh sách địa điểm |
|  | `examplePlaces.trustScore` | Trust score: {{score}}/100 | 신뢰 점수: {{score}}/100 | Điểm tin cậy: {{score}}/100 |

## `merchant`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `merchant.pendingDescription` | Merchant {{merchantId}} is not available yet. | 상점 {{merchantId}}는 아직 준비 중입니다. | Cửa hàng {{merchantId}} chưa sẵn sàng. |
|  | `merchant.title` | Merchant | 상점 | Cửa hàng |

## `onboarding`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `onboarding.preferenceFlow.loading` | Restoring your saved travel preferences... | 저장된 여행 선호를 불러오는 중입니다... | Đang khôi phục sở thích du lịch đã lưu... |
| ● | `onboarding.preferenceFlow.restoreError` | Saved preferences could not be restored. You can continue with new selections. | 저장된 선택을 불러오지 못했어요. 새로 선택해 계속할 수 있어요. | Không thể khôi phục lựa chọn đã lưu. Bạn có thể chọn lại để tiếp tục. |
| ● | `onboarding.preferenceFlow.saveError` | Your selections could not be saved. Please try Continue again. | 선택값을 저장하지 못했어요. 계속 버튼을 다시 눌러 주세요. | Không thể lưu lựa chọn của bạn. Vui lòng nhấn Tiếp tục lần nữa. |
|  | `onboarding.preferences.currentNeeds.attendEvent` | Events | 이벤트 관람 | Sự kiện |
|  | `onboarding.preferences.currentNeeds.cafe` | Cafe | 카페 | Cà phê |
|  | `onboarding.preferences.currentNeeds.eat` | Food | 식사 | Ăn uống |
|  | `onboarding.preferences.currentNeeds.explore` | Explore | 둘러보기 | Khám phá |
|  | `onboarding.preferences.currentNeeds.nightlife` | Nightlife | 나이트라이프 | Giải trí đêm |
|  | `onboarding.preferences.currentNeeds.shop` | Shopping | 쇼핑 | Mua sắm |
|  | `onboarding.preferences.travelPurposes.beauty` | Beauty | 뷰티 | Làm đẹp |
|  | `onboarding.preferences.travelPurposes.cafe` | Cafe | 카페 | Cà phê |
|  | `onboarding.preferences.travelPurposes.exhibition` | Exhibition | 전시 | Triển lãm |
|  | `onboarding.preferences.travelPurposes.fashion` | Fashion | 패션 | Thời trang |
|  | `onboarding.preferences.travelPurposes.food` | Food | 음식 | Ẩm thực |
|  | `onboarding.preferences.travelPurposes.kPop` | Music | 음악 | Âm nhạc |
|  | `onboarding.preferences.travelPurposes.other` | Others | 기타 | Khác |
|  | `onboarding.preferences.travelPurposes.popUp` | Pop-up | 팝업 | Pop-up |
|  | `onboarding.travelScheduleScreen.back` | Back | 뒤로 가기 | Quay lại |
|  | `onboarding.travelScheduleScreen.calendar` | Travel date calendar | 여행 일정 달력 | Lịch ngày du lịch |
|  | `onboarding.travelScheduleScreen.continue` | Continue | 계속 | Tiếp tục |
|  | `onboarding.travelScheduleScreen.description` | Please select your start and end dates | 여행 시작일과 종료일을 선택해 주세요 | Vui lòng chọn ngày bắt đầu và ngày kết thúc |
|  | `onboarding.travelScheduleScreen.emptyDate` | Not selected | 선택 전 | Chưa chọn |
|  | `onboarding.travelScheduleScreen.endDate` | End date | 종료일 | Ngày kết thúc |
|  | `onboarding.travelScheduleScreen.invalidRange` | Check your dates and select a valid range again. | 날짜를 확인하고 올바른 기간을 다시 선택해 주세요. | Hãy kiểm tra ngày và chọn lại khoảng thời gian hợp lệ. |
|  | `onboarding.travelScheduleScreen.nextMonth` | Next month | 다음 달 | Tháng sau |
|  | `onboarding.travelScheduleScreen.previousMonth` | Previous month | 이전 달 | Tháng trước |
|  | `onboarding.travelScheduleScreen.progress` | Onboarding progress | 온보딩 진행 단계 | Tiến trình thiết lập |
|  | `onboarding.travelScheduleScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | Bước {{current}}/{{total}} |
|  | `onboarding.travelScheduleScreen.startDate` | Start date | 시작일 | Ngày bắt đầu |
|  | `onboarding.travelScheduleScreen.title` | Select Travel Dates | 여행 일정을 알려주세요 | Chọn ngày du lịch |
|  | `onboarding.travelScheduleScreen.weekdays.fri` | F | 금 | T6 |
|  | `onboarding.travelScheduleScreen.weekdays.mon` | M | 월 | T2 |
|  | `onboarding.travelScheduleScreen.weekdays.sat` | S | 토 | T7 |
|  | `onboarding.travelScheduleScreen.weekdays.sun` | S | 일 | CN |
|  | `onboarding.travelScheduleScreen.weekdays.thu` | T | 목 | T5 |
|  | `onboarding.travelScheduleScreen.weekdays.tue` | T | 화 | T3 |
|  | `onboarding.travelScheduleScreen.weekdays.wed` | W | 수 | T4 |
|  | `onboarding.travelPurposeScreen.back` | Back | 뒤로 가기 | Quay lại |
|  | `onboarding.travelPurposeScreen.continue` | Continue | 계속 | Tiếp tục |
|  | `onboarding.travelPurposeScreen.description` | We'll recommend hot places that match your interests | 관심사에 맞는 핫플레이스를 추천해드릴게요 | Chúng tôi sẽ gợi ý những điểm hot hợp với sở thích của bạn |
|  | `onboarding.travelPurposeScreen.progress` | Onboarding progress | 온보딩 진행 단계 | Tiến trình thiết lập |
|  | `onboarding.travelPurposeScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | Bước {{current}}/{{total}} |
|  | `onboarding.travelPurposeScreen.title` | Select Travel Purpose | 여행 목적을 선택해 주세요 | Chọn mục đích chuyến đi |

## `map`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `map.decision.backToRecommendations` | Back to recommendations | 추천으로 돌아가기 | Quay lại gợi ý |
|  | `map.decision.emptyBody` | Try another keyword or remove a visit condition. | 다른 검색어를 입력하거나 방문 조건을 해제해 보세요. | Hãy thử từ khóa khác hoặc bỏ một điều kiện ghé thăm. |
|  | `map.decision.emptyTitle` | No matching places yet | 일치하는 장소가 아직 없어요 | Chưa có địa điểm phù hợp |
|  | `map.decision.filters.bookable` | Bookable | 예약 가능 | Có thể đặt |
|  | `map.decision.filters.coupon` | Coupon | 쿠폰 | Phiếu ưu đãi |
|  | `map.decision.filters.openNow` | Open now | 영업 중 | Đang mở cửa |
|  | `map.decision.filters.shortWait` | Short wait | 대기 짧음 | Chờ ngắn |
|  | `map.decision.getCoupon` | Get coupon | 쿠폰 받기 | Nhận phiếu ưu đãi |
|  | `map.decision.couponMessage` | {{placeName}} coupon will be available here. | {{placeName}} 쿠폰을 이곳에서 받을 수 있어요. | Phiếu ưu đãi của {{placeName}} sẽ có tại đây. |
|  | `map.decision.goNow` | Go now | 바로 가기 | Đi ngay |
|  | `map.decision.goNowMessage` | Directions to {{placeName}} are ready. | {{placeName}}까지 길안내를 준비했어요. | Đã sẵn sàng chỉ đường tới {{placeName}}. |
|  | `map.decision.livePicks` | LIVE PICKS | 지금 인기 장소 | ĐỊA ĐIỂM HOT LÚC NÀY |
|  | `map.decision.map` | Map | 지도 | Bản đồ |
|  | `map.decision.nearMe` | Near me | 내 위치 | Gần tôi |
|  | `map.decision.nearYou` | Near you | 내 주변 | Gần bạn |
|  | `map.decision.noResults` | No matching places yet | 일치하는 장소가 아직 없어요 | Chưa có địa điểm phù hợp |
|  | `map.decision.placesLiveNearby_one` | {{count}} place live nearby | 내 주변 {{count}}곳 운영 중 | {{count}} địa điểm đang hoạt động gần đây |
|  | `map.decision.placesLiveNearby_other` | {{count}} places live nearby | 내 주변 {{count}}곳 운영 중 | {{count}} địa điểm đang hoạt động gần đây |
|  | `map.decision.placesNearYou` | Places near you | 내 주변 장소 | Địa điểm gần bạn |
| ● | `map.decision.profileAccessibilityLabel` | Open profile | 프로필 열기 | Mở hồ sơ |
|  | `map.decision.recommended` | Recommended | 추천순 | Đề xuất |
|  | `map.decision.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | Kết quả cho “{{query}}” |
| ● | `map.decision.searchAccessibilityLabel` | Search places | 장소 검색 | Tìm địa điểm |
|  | `map.decision.searchPlaceholder` | Search places | 장소를 검색하세요 | Tìm địa điểm |
|  | `map.decision.seeAll` | See all | 전체 보기 | Xem tất cả |
|  | `map.decision.status.openNow` | Open now | 영업 중 | Đang mở cửa |
|  | `map.decision.status.verified` | Visitor verified · {{time}} | 방문자 확인 · {{time}} | Khách đã xác minh · {{time}} |
|  | `map.decision.status.wait` | Wait {{wait}} | 대기 {{wait}} | Chờ {{wait}} |
|  | `map.decision.transit` | Transit | 대중교통 | Phương tiện công cộng |
|  | `map.decision.whereToGo` | Where to go now | 지금 어디로 갈까요? | Giờ đi đâu nhỉ? |
|  | `map.card.actions.arrive` | Arrive | 도착 | Đến |
|  | `map.card.actions.directions` | Directions | 길찾기 | Chỉ đường |
|  | `map.card.actions.reserve` | Reserve | 예약 | Đặt chỗ |
|  | `map.card.actions.share` | Share | 공유 | Chia sẻ |
|  | `map.card.actions.start` | Start | 출발 | Xuất phát |
|  | `map.card.closed` | Closed now | 영업 종료 | Đã đóng cửa |
|  | `map.card.dismiss` | Dismiss place preview | 장소 미리보기 닫기 | Đóng xem trước địa điểm |
| ● | `map.card.error` | Could not load this place. | 장소 정보를 불러오지 못했습니다. | Không thể tải địa điểm này. |
|  | `map.card.favorite` | Save place | 장소 저장 | Lưu địa điểm |
| ● | `map.card.imageLabel` | {{name}} photo | {{name}} 사진 | Ảnh {{name}} |
|  | `map.card.imageUnavailable` | No photo | 사진 없음 | Không có ảnh |
|  | `map.card.loading` | Loading place preview... | 장소 미리보기를 불러오는 중입니다... | Đang tải xem trước địa điểm... |
|  | `map.card.open` | Open now | 영업 중 | Đang mở cửa |
| ● | `map.card.openHint` | Opens place details | 장소 상세를 엽니다 | Mở chi tiết địa điểm |
|  | `map.card.preview` | Place preview | 장소 미리보기 | Xem trước địa điểm |
|  | `map.card.statusUnknown` | Status unknown | 영업 상태 미확인 | Chưa rõ trạng thái |
|  | `map.card.support.coupon` | Coupons available | 쿠폰 사용 가능 | Có phiếu ưu đãi |
|  | `map.card.support.english` | English support | 영어응대 가능 | Hỗ trợ tiếng Anh |
|  | `map.card.support.englishMenu` | English menu | 영문 메뉴 | Thực đơn tiếng Anh |
|  | `map.card.support.foreignCard` | Foreign cards | 해외카드 가능 | Thẻ nước ngoài |
|  | `map.card.support.reservation` | Reservations | 예약 가능 | Nhận đặt chỗ |
|  | `map.card.support.wifi` | Free Wi-Fi | 무료 Wi-Fi | Wi-Fi miễn phí |
|  | `map.placeActions.departureUnsupported` | Starting from a place is not supported yet. | 출발 기능은 아직 지원하지 않습니다. | Chưa hỗ trợ xuất phát từ một địa điểm. |
| ● | `map.placeActions.directionsFailed` | Could not start directions. | 길찾기를 실행하지 못했습니다. | Không thể bắt đầu chỉ đường. |
|  | `map.placeActions.directionsUnavailable` | Could not open an external map. | 외부 지도 앱을 열 수 없습니다. | Không thể mở ứng dụng bản đồ bên ngoài. |
|  | `map.placeActions.locationMissing` | This place has no location information. | 장소 위치 정보가 없습니다. | Địa điểm này không có thông tin vị trí. |
| ● | `map.placeActions.shareFailed` | Could not share this place. | 공유를 실행하지 못했습니다. | Không thể chia sẻ địa điểm này. |
|  | `map.placeActions.shareUnavailable` | Sharing is not available on this device. | 이 기기에서는 공유 기능을 사용할 수 없습니다. | Thiết bị này không hỗ trợ chia sẻ. |
|  | `map.data.disabledDescription` | Enable the place-list runtime setting to request server data. | 장소 목록 실행 설정을 켜면 서버 데이터를 요청합니다. | Bật cài đặt chạy danh sách địa điểm để yêu cầu dữ liệu từ máy chủ. |
|  | `map.data.disabledTitle` | Place discovery is off | 장소 탐색 기능이 꺼져 있어요 | Khám phá địa điểm đang tắt |
|  | `map.data.emptyDescription` | Move the map or change the search filters. | 지도를 이동하거나 검색 필터를 바꿔 보세요. | Hãy di chuyển bản đồ hoặc đổi bộ lọc tìm kiếm. |
|  | `map.data.emptyTitle` | No places in this area | 이 지역에 장소가 없습니다 | Không có địa điểm nào trong khu vực này |
| ● | `map.data.errorDescription` | Check your connection and try again. | 네트워크를 확인한 후 다시 시도해 주세요. | Hãy kiểm tra kết nối và thử lại. |
| ● | `map.data.errorTitle` | Could not load places | 장소를 불러오지 못했습니다 | Không thể tải địa điểm |
|  | `map.data.loading` | Loading places... | 장소를 불러오는 중입니다... | Đang tải địa điểm... |
|  | `map.data.mockDescription` | These markers come from the explicitly selected development transport. | 명시적으로 선택한 개발 transport의 합성 마커입니다. | Các điểm đánh dấu này đến từ transport phát triển đã được chọn rõ ràng. |
|  | `map.data.mockTitle` | Development Mock places | 개발 Mock 장소 | Địa điểm Mock cho phát triển |
|  | `map.data.retry` | Try again | 다시 시도 | Thử lại |
|  | `map.distanceMeters` | {{count}} m | {{count}}m | {{count}} m |
|  | `map.filters.all` | All | 전체 | Tất cả |
|  | `map.filters.cafe` | Cafe | 카페 | Cà phê |
|  | `map.filters.fashion` | Fashion | 패션 | Thời trang |
|  | `map.filters.food` | Food | 음식 | Ẩm thực |
|  | `map.filters.music` | Music | 음악 | Âm nhạc |
|  | `map.categories.all` | All | 전체 | Tất cả |
|  | `map.categories.art` | Exhibitions | 전시 | Triển lãm |
|  | `map.categories.beauty` | Beauty | 뷰티 | Làm đẹp |
|  | `map.categories.cafe` | Cafe | 카페 | Cà phê |
|  | `map.categories.etc` | Other | 기타 | Khác |
|  | `map.categories.fashion` | Fashion | 패션 | Thời trang |
|  | `map.categories.food` | Restaurants | 음식점 | Nhà hàng |
|  | `map.categories.heritage` | Cultural heritage | 문화재 | Di sản văn hóa |
|  | `map.categories.music` | Music | 음악 | Âm nhạc |
|  | `map.categories.popup` | Pop-ups | 팝업 | Pop-up |
|  | `map.navigation.community` | Community | 커뮤니티 | Cộng đồng |
|  | `map.navigation.favorites` | Favorites | 즐겨찾기 | Yêu thích |
|  | `map.navigation.map` | Map | 지도 | Bản đồ |
|  | `map.navigation.recommendations` | Recommendations | 장소추천 | Gợi ý |
|  | `map.navigation.reservations` | Reservations | 예약 | Đặt chỗ |
|  | `map.favorites.adjust` | Resize favorites panel | 즐겨찾기 패널 크기 조절 | Đổi kích thước bảng yêu thích |
|  | `map.favorites.emptyBody` | Tap the star on a place you like to save it. | 마음에 드는 장소의 별을 눌러 모아보세요. | Chạm vào ngôi sao ở địa điểm bạn thích để lưu lại. |
|  | `map.favorites.emptyTitle` | No saved places | 저장한 장소가 없어요 | Chưa có địa điểm đã lưu |
| ● | `map.favorites.error` | Could not load places | 장소를 불러오지 못했어요 | Không thể tải địa điểm |
|  | `map.favorites.loadMore` | Show more | 더 보기 | Xem thêm |
| ● | `map.favorites.loadMoreError` | Could not load more places | 다음 장소를 불러오지 못했어요 | Không thể tải thêm địa điểm |
| ● | `map.favorites.loadMoreLabel` | Load more saved places | 저장한 장소 더 불러오기 | Tải thêm địa điểm đã lưu |
|  | `map.favorites.loading` | Loading saved places… | 저장한 장소를 불러오는 중이에요 | Đang tải địa điểm đã lưu… |
|  | `map.favorites.remove` | Remove {{name}} from favorites | {{name}} 즐겨찾기 해제 | Bỏ {{name}} khỏi mục yêu thích |
|  | `map.favorites.retry` | Try again | 다시 시도 | Thử lại |
|  | `map.favorites.sessionBody` | Sign in again to see your saved places. | 다시 로그인한 뒤 저장한 장소를 확인해 주세요. | Hãy đăng nhập lại để xem các địa điểm đã lưu. |
|  | `map.favorites.sessionTitle` | Your session has expired | 로그인이 만료됐어요 | Phiên đăng nhập đã hết hạn |
|  | `map.favorites.title` | My places | 내 장소 | Địa điểm của tôi |
|  | `map.searchOverlay.categories` | Place categories | 장소 카테고리 | Danh mục địa điểm |
|  | `map.searchOverlay.clear` | Clear search | 검색어 지우기 | Xóa nội dung tìm kiếm |
|  | `map.searchOverlay.clearAll` | Clear all | 전체 삭제 | Xóa tất cả |
|  | `map.searchOverlay.close` | Close search | 검색 닫기 | Đóng tìm kiếm |
|  | `map.searchOverlay.emptyBody` | Try a different search term. | 다른 검색어를 입력해 보세요. | Hãy thử từ khóa khác. |
|  | `map.searchOverlay.emptyTitle` | No search results | 검색 결과가 없어요 | Không có kết quả tìm kiếm |
|  | `map.searchOverlay.externalResults` | Place search results | 장소 검색 결과 | Kết quả tìm địa điểm |
|  | `map.searchOverlay.loading` | Searching for places… | 장소를 찾고 있어요 | Đang tìm địa điểm… |
|  | `map.searchOverlay.pingdomResults` | PingDom places | 핑덤 장소 | Địa điểm PingDom |
|  | `map.searchOverlay.placeholder` | Search | 검색하기 | Tìm kiếm |
|  | `map.searchOverlay.recent` | Recent searches | 최근 검색 | Tìm kiếm gần đây |
|  | `map.searchOverlay.recentClearAll` | Clear all recent searches | 최근 검색 전체 삭제 | Xóa tất cả tìm kiếm gần đây |
| ● | `map.searchOverlay.recentDelete` | Remove {{query}} from recent searches | {{query}} 최근 검색어 삭제 | Xóa {{query}} khỏi tìm kiếm gần đây |
|  | `map.searchOverlay.recentLoading` | Loading recent searches | 최근 검색 불러오는 중 | Đang tải tìm kiếm gần đây |
|  | `map.searchOverlay.recentSearch` | Search for {{query}} | {{query}} 검색 | Tìm {{query}} |
|  | `map.searchOverlay.registrant` | Registered by {{name}} | 등록자 {{name}} | Đăng ký bởi {{name}} |
|  | `map.searchOverlay.registrantLoading` | Loading registrant | 등록자 확인 중 | Đang tải người đăng ký |
|  | `map.searchOverlay.registrantMissing` | No registrant | 등록자 없음 | Không có người đăng ký |
|  | `map.searchOverlay.recommendationEmpty` | No nearby recommendations yet | 주변 추천 장소가 아직 없어요 | Chưa có gợi ý nào gần đây |
| ● | `map.searchOverlay.recommendationError` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | Không thể tải gợi ý |
|  | `map.searchOverlay.recommendationLoading` | Loading recommendations… | 추천 장소를 불러오고 있어요 | Đang tải gợi ý… |
|  | `map.searchOverlay.registeredDisabled` | PingDom place search is disabled. | 핑덤 장소 검색 기능이 비활성화되어 있어요. | Tìm kiếm địa điểm PingDom đang bị tắt. |
|  | `map.searchOverlay.registeredEmpty` | No registered PingDom places matched. | 서버에 등록된 핑덤 장소 검색 결과가 없어요. | Không có địa điểm PingDom đã đăng ký nào phù hợp. |
| ● | `map.searchOverlay.registeredError` | The PingDom place search failed. | 핑덤 장소 검색 요청에 실패했어요. | Tìm kiếm địa điểm PingDom thất bại. |
|  | `map.searchOverlay.registeredMock` | Development mock PingDom place results. | 개발 Mock 핑덤 장소 검색 결과예요. | Kết quả địa điểm PingDom Mock cho phát triển. |
|  | `map.sheet.adjust` | Resize recommendations panel | 추천 패널 크기 조절 | Đổi kích thước bảng gợi ý |
|  | `map.sheet.aroundMe` | Places near me | 내 주변 장소 | Địa điểm gần tôi |
|  | `map.sheet.bookmark` | Save place | 즐겨찾기 | Lưu địa điểm |
|  | `map.sheet.bookmarkRemove` | Remove saved place | 즐겨찾기 해제 | Bỏ lưu địa điểm |
| ● | `map.sheet.bookmarkSaveError` | Could not save this place | 장소를 저장하지 못했어요 | Không thể lưu địa điểm này |
| ● | `map.sheet.bookmarkRemoveError` | Could not remove this saved place | 저장을 해제하지 못했어요 | Không thể bỏ lưu địa điểm này |
|  | `map.sheet.categoryPopular` | Popular {{userName}} picks by category | 카테고리별 {{userName}}님 주변 인기 장소들 | Địa điểm nổi bật quanh {{userName}} theo danh mục |
|  | `map.sheet.categoryPopularRegion` | Popular places in {{regionName}} by category | {{regionName}} 카테고리별 인기 장소 | Địa điểm nổi bật tại {{regionName}} theo danh mục |
|  | `map.sheet.categoryPopularNational` | Popular nationwide places by category | 전국 카테고리 인기 장소 | Địa điểm nổi bật toàn quốc theo danh mục |
|  | `map.sheet.distanceAway` | {{distance}} away | 여기서 {{distance}} | Cách {{distance}} |
|  | `map.sheet.image` | Place image | 장소 이미지 | Ảnh địa điểm |
| ● | `map.sheet.imageError` | Could not load image | 이미지를 불러오지 못했어요 | Không thể tải ảnh |
|  | `map.sheet.imageMissing` | No image | 이미지 없음 | Không có ảnh |
|  | `map.sheet.localHotPlaces` | Local hot places | 우리 지역 핫플 | Hot quanh đây |
|  | `map.sheet.nationwideTrends` | Nationwide trends | 전국 트렌드 | Xu hướng cả nước |
|  | `map.sheet.placeMissing` | Unnamed place | 장소명 없음 | Địa điểm chưa có tên |
|  | `map.sheet.recommendationTitle` | Recommended for you | 나만을 위한 추천 장소 | Gợi ý dành riêng cho bạn |
|  | `map.sheet.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | Kết quả cho “{{query}}” |
|  | `map.sheet.state.categoryEmptyTitle` | No places found in this category. | 이 카테고리에 해당하는 장소가 없어요 | Không tìm thấy địa điểm nào trong danh mục này. |
|  | `map.sheet.state.disabledBody` | Sign in to view this list. | 로그인하면 이 목록을 확인할 수 있어요. | Đăng nhập để xem danh sách này. |
|  | `map.sheet.state.disabledTitle` | This list is unavailable | 목록을 사용할 수 없어요 | Danh sách này không khả dụng |
|  | `map.sheet.state.emptyBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | Di chuyển bản đồ để khám phá khu vực khác. |
|  | `map.sheet.state.emptyTitle` | No hot places to show yet | 표시할 핫플이 아직 없어요 | Chưa có điểm hot nào để hiển thị |
| ● | `map.sheet.state.errorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Vui lòng thử lại sau giây lát. |
| ● | `map.sheet.state.errorTitle` | Could not load the list | 목록을 불러오지 못했어요 | Không thể tải danh sách |
| ● | `map.sheet.state.forbiddenBody` | Your account cannot access this list. | 현재 계정으로 이 목록에 접근할 수 없어요. | Tài khoản của bạn không thể truy cập danh sách này. |
| ● | `map.sheet.state.forbiddenTitle` | Access is unavailable | 접근할 수 없어요 | Không thể truy cập |
|  | `map.sheet.state.invalid-locationBody` | Check your location and try again. | 위치 상태를 확인한 후 다시 시도해 주세요. | Hãy kiểm tra vị trí của bạn và thử lại. |
|  | `map.sheet.state.invalid-locationTitle` | Your location could not be used | 현재 위치를 사용할 수 없어요 | Không thể dùng vị trí của bạn |
|  | `map.sheet.state.invalid-periodBody` | Please try the supported weekly period again. | 지원되는 주간 기간으로 다시 시도해 주세요. | Vui lòng thử lại với khoảng thời gian theo tuần được hỗ trợ. |
|  | `map.sheet.state.invalid-periodTitle` | The trend period is unavailable | 트렌드 기간을 사용할 수 없어요 | Khoảng thời gian xu hướng không khả dụng |
| ● | `map.sheet.state.location-deniedBody` | Nationwide trends remain available without location access. | 위치 권한 없이도 전국 트렌드는 볼 수 있어요. | Bạn vẫn xem được xu hướng toàn quốc khi không cấp quyền vị trí. |
| ● | `map.sheet.state.location-deniedTitle` | Allow location access to see local hot places | 지역 핫플을 보려면 위치 권한을 허용해 주세요 | Cho phép truy cập vị trí để xem điểm hot địa phương |
|  | `map.sheet.state.location-pendingBody` | Nationwide trends are available while location is being prepared. | 위치를 확인하는 동안 전국 트렌드는 볼 수 있어요. | Bạn có thể xem xu hướng toàn quốc trong lúc chờ xác định vị trí. |
|  | `map.sheet.state.location-pendingTitle` | Checking your location… | 현재 위치를 확인하고 있어요 | Đang kiểm tra vị trí của bạn… |
|  | `map.sheet.state.loadingBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | Di chuyển bản đồ để khám phá khu vực khác. |
|  | `map.sheet.state.loadingTitle` | Finding nearby hot places… | 주변 핫플을 찾는 중이에요 | Đang tìm điểm hot gần đây… |
|  | `map.sheet.state.nationalEmptyBody` | Check back after the weekly trend data is updated. | 주간 트렌드 데이터가 갱신된 후 다시 확인해 주세요. | Hãy quay lại sau khi dữ liệu xu hướng hằng tuần được cập nhật. |
|  | `map.sheet.state.nationalEmptyTitle` | No nationwide trends to show yet | 표시할 전국 트렌드가 아직 없어요 | Chưa có xu hướng toàn quốc để hiển thị |
| ● | `map.sheet.state.nationalErrorBody` | Please try loading nationwide trends again in a moment. | 잠시 후 전국 트렌드를 다시 불러와 주세요. | Vui lòng thử tải lại xu hướng toàn quốc sau giây lát. |
| ● | `map.sheet.state.nationalErrorTitle` | Could not load nationwide trends | 전국 트렌드를 불러오지 못했어요 | Không thể tải xu hướng toàn quốc |
|  | `map.sheet.state.nationalLoadingBody` | Loading the latest seven-day bookmark trend. | 최근 7일의 즐겨찾기 변화를 불러오고 있어요. | Đang tải xu hướng lưu địa điểm trong 7 ngày gần nhất. |
|  | `map.sheet.state.nationalLoadingTitle` | Loading nationwide trends… | 전국 트렌드를 불러오는 중이에요 | Đang tải xu hướng toàn quốc… |
|  | `map.sheet.state.region-not-foundBody` | Try again from another location. | 다른 위치에서 다시 시도해 주세요. | Hãy thử lại từ vị trí khác. |
|  | `map.sheet.state.region-not-foundTitle` | We could not identify this area | 현재 지역을 판정하지 못했어요 | Chúng tôi không xác định được khu vực này |
| ● | `map.sheet.state.region-resolution-failedBody` | The region lookup service did not respond. | 지역 판정 서비스가 응답하지 않았어요. | Dịch vụ tra cứu khu vực không phản hồi. |
| ● | `map.sheet.state.region-resolution-failedTitle` | Could not identify your area | 지역 판정에 실패했어요 | Không thể xác định khu vực của bạn |
|  | `map.sheet.state.region-service-unavailableBody` | Please try again after the region service recovers. | 지역 서비스가 복구된 후 다시 시도해 주세요. | Vui lòng thử lại sau khi dịch vụ khu vực hoạt động trở lại. |
|  | `map.sheet.state.region-service-unavailableTitle` | Local hot places are temporarily unavailable | 지역 핫플을 일시적으로 사용할 수 없어요 | Điểm hot địa phương tạm thời không khả dụng |
| ● | `map.sheet.state.unauthorizedBody` | Sign in again and retry. | 다시 로그인한 후 시도해 주세요. | Hãy đăng nhập lại rồi thử lại. |
| ● | `map.sheet.state.unauthorizedTitle` | Sign-in is required | 로그인이 필요해요 | Cần đăng nhập |
|  | `map.sheet.state.recommendationEmptyBody` | Change your location or recommendation radius and try again. | 위치나 추천 반경을 바꾼 뒤 다시 확인해 주세요. | Hãy đổi vị trí hoặc bán kính gợi ý rồi thử lại. |
|  | `map.sheet.state.recommendationEmptyTitle` | No recommendations match your current filters | 현재 조건에 맞는 추천 장소가 없어요 | Không có gợi ý nào phù hợp với bộ lọc hiện tại |
| ● | `map.sheet.state.recommendationErrorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Vui lòng thử lại sau giây lát. |
| ● | `map.sheet.state.recommendationErrorTitle` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | Không thể tải gợi ý |
|  | `map.sheet.state.recommendationLoadingBody` | Checking your location and travel context. | 현재 위치와 여행 맥락을 확인하고 있어요. | Đang kiểm tra vị trí và bối cảnh chuyến đi của bạn. |
|  | `map.sheet.state.recommendationLoadingTitle` | Loading recommendations for you… | 나만을 위한 추천 장소를 불러오고 있어요 | Đang tải gợi ý dành cho bạn… |
|  | `map.detail.amenityEnglish` | English support | 영어응대 가능 | Hỗ trợ tiếng Anh |
|  | `map.detail.amenityParking` | Parking available | 주차가능 | Có chỗ đỗ xe |
|  | `map.detail.back` | Back to map | 지도로 돌아가기 | Quay lại bản đồ |
|  | `map.detail.collapseTags` | Collapse additional tags | 추가 태그 접기 | Thu gọn thẻ bổ sung |
|  | `map.detail.coupon` | Coupons | 쿠폰 | Phiếu ưu đãi |
|  | `map.detail.description` | About this place | 장소 소개 | Giới thiệu địa điểm |
|  | `map.detail.events` | Current events | 진행 중 이벤트 | Sự kiện đang diễn ra |
|  | `map.detail.collapseReviews` | Hide reviews | 리뷰 접기 | Ẩn đánh giá |
|  | `map.detail.viewAllReviews` | View all reviews | 리뷰 모두 보기 | Xem tất cả đánh giá |
|  | `map.detail.expandTags` | Show {{count}} hidden tags | 숨겨진 태그 {{count}}개 펼치기 | Hiện {{count}} thẻ bị ẩn |
|  | `map.detail.imageDetail` | View {{name}} photo {{count}} | {{name}} 사진 {{count}} 상세 보기 | Xem ảnh {{count}} của {{name}} |
| ● | `map.detail.imageError` | Could not load photos. Try again | 사진을 불러오지 못했습니다. 다시 시도 | Không thể tải ảnh. Thử lại |
|  | `map.detail.info` | Info | 정보 | Thông tin |
| ● | `map.detail.notice` | Operating notice | 운영 공지 | Thông báo hoạt động |
|  | `map.detail.imageViewer.close` | Close photo | 사진 닫기 | Đóng ảnh |
|  | `map.detail.imageViewer.counter` | {{current}} / {{total}} | {{current}} / {{total}} | {{current}} / {{total}} |
|  | `map.detail.imageViewer.next` | Next photo | 다음 사진 | Ảnh tiếp theo |
|  | `map.detail.imageViewer.photo` | {{name}} photo {{current}} of {{total}} | {{name}} 사진 {{total}}장 중 {{current}}번째 | Ảnh {{current}}/{{total}} của {{name}} |
|  | `map.detail.imageViewer.previous` | Previous photo | 이전 사진 | Ảnh trước |
|  | `map.detail.participantCount_one` | {{count}} participant | {{count}}명 참여 | {{count}} người tham gia |
|  | `map.detail.participantCount_other` | {{count}} participants | {{count}}명 참여 | {{count}} người tham gia |
|  | `map.detail.photoReviews` | Photo reviews | 사진 리뷰 | Đánh giá có ảnh |
|  | `map.detail.preview` | View {{name}} details | {{name}} 상세 보기 | Xem chi tiết {{name}} |
|  | `map.detail.reviewHighlights` | What visitors liked | 이런 점을 좋아해요! | Điều khách ghé thăm yêu thích |
|  | `map.detail.reviewCount_one` | {{count}} review | 리뷰 {{count}}개 | {{count}} đánh giá |
|  | `map.detail.reviewCount_other` | {{count}} reviews | 리뷰 {{count}}개 | {{count}} đánh giá |
|  | `map.detail.reviewEmpty` | No reviews yet. | 등록된 리뷰 정보가 없어요. | Chưa có đánh giá nào. |
| ● | `map.detail.reviewError` | Could not load reviews. Try again | 리뷰를 불러오지 못했습니다. 다시 시도 | Không thể tải đánh giá. Thử lại |
|  | `map.detail.reviewLoading` | Loading reviews… | 리뷰를 불러오는 중입니다. | Đang tải đánh giá… |
|  | `map.detail.reviews` | Reviews | 리뷰 | Đánh giá |
|  | `map.detail.verifiedCount_one` | {{count}} person verified this! | {{count}}명이 검증했어요! | {{count}} người đã xác minh! |
|  | `map.detail.verifiedCount_other` | {{count}} people verified this! | {{count}}명이 검증했어요! | {{count}} người đã xác minh! |
| ● | `map.detail.reservation.authError` | Sign-in required | 로그인이 필요합니다 | Cần đăng nhập |
|  | `map.detail.reservation.available` | Reserve | 예약하기 | Đặt chỗ |
|  | `map.detail.reservation.empty` | No schedules are currently available | 현재 예약 가능한 일정이 없습니다 | Hiện chưa có lịch còn chỗ |
| ● | `map.detail.reservation.error` | Could not load reservation availability | 예약 가능 여부를 불러오지 못했습니다 | Không thể tải tình trạng đặt chỗ |
|  | `map.detail.reservation.full` | No reservation capacity is available | 예약 가능한 인원이 없습니다 | Không còn chỗ để đặt |
|  | `map.detail.reservation.loading` | Checking reservation availability | 예약 가능 여부를 확인하고 있습니다 | Đang kiểm tra tình trạng đặt chỗ |
|  | `map.detail.reservation.retry` | Try again | 다시 시도 | Thử lại |
|  | `map.locate` | My location | 내 위치 | Vị trí của tôi |
|  | `map.refreshing` | Refreshing map | 지도 새로고침 중 | Đang làm mới bản đồ |
| ● | `map.location.deniedDescription` | The map is using a default area. Allow location access to show your position. | 기본 지역을 표시하고 있습니다. 현재 위치를 보려면 위치 권한을 허용해 주세요. | Bản đồ đang dùng khu vực mặc định. Hãy cho phép truy cập vị trí để hiển thị vị trí của bạn. |
| ● | `map.location.deniedTitle` | Location access is off | 위치 권한이 꺼져 있습니다 | Quyền vị trí đang tắt |
| ● | `map.location.failedDescription` | The map is using a default area. Check location services and try again. | 기본 지역을 표시하고 있습니다. 위치 서비스를 확인한 후 다시 시도해 주세요. | Bản đồ đang dùng khu vực mặc định. Hãy kiểm tra dịch vụ vị trí và thử lại. |
| ● | `map.location.failedTitle` | Could not find your location | 현재 위치를 찾지 못했습니다 | Không tìm thấy vị trí của bạn |
|  | `map.location.loading` | Finding your current location... | 현재 위치를 찾는 중입니다... | Đang tìm vị trí hiện tại của bạn... |
|  | `map.location.openSettings` | Open settings | 설정 열기 | Mở cài đặt |
|  | `map.location.retry` | Check again | 다시 확인 | Kiểm tra lại |
|  | `map.recommendations.subtitle` | Pingdom recommends places {{userName}} might like! | 핑덤이 {{userName}}님이 좋아할만한 장소를 추천해드려요! | PingDom gợi ý những địa điểm {{userName}} có thể thích! |
|  | `map.recommendations.verificationTitle` | Verify today and get a coupon! | 오늘 검증하고 쿠폰 받자! | Xác minh hôm nay để nhận phiếu ưu đãi! |
|  | `map.recommendations.reasons.activeBenefit` | A benefit is currently available here | 현재 이용할 수 있는 혜택이 있어요 | Hiện có ưu đãi tại đây |
|  | `map.recommendations.reasons.benefitAndReservable` | A place with an available benefit and booking | 혜택을 받고 바로 예약할 수 있어요 | Địa điểm có ưu đãi và có thể đặt chỗ |
|  | `map.recommendations.reasons.contextMatch` | Matches your current travel plans | 현재 여행 목적과 잘 맞는 장소예요 | Phù hợp với kế hoạch du lịch hiện tại của bạn |
|  | `map.recommendations.reasons.exploration` | A recommendation for discovering somewhere new | 새로운 장소를 발견할 수 있는 추천이에요 | Một gợi ý để khám phá nơi mới |
|  | `map.recommendations.reasons.freshContent` | Recently updated with new information | 최근 새로운 정보가 추가됐어요 | Vừa được cập nhật thông tin mới |
|  | `map.recommendations.reasons.highConversion` | Often leads to real visits | 실제 방문으로 자주 이어지는 장소예요 | Thường dẫn đến lượt ghé thăm thực tế |
|  | `map.recommendations.reasons.highEngagement` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | Địa điểm đang được nhiều người quan tâm |
|  | `map.recommendations.reasons.nearby` | Close to your current location | 현재 위치에서 가까운 장소예요 | Gần vị trí hiện tại của bạn |
|  | `map.recommendations.reasons.neutral` | Recommended place | 추천 장소 | Địa điểm gợi ý |
|  | `map.recommendations.reasons.personalSignal` | Matches your interests and activity | 관심사와 반응에 잘 맞는 장소예요 | Phù hợp với sở thích và hoạt động của bạn |
|  | `map.recommendations.reasons.qualitySignal` | Has reliable place information | 신뢰도 높은 장소 정보가 있어요 | Có thông tin địa điểm đáng tin cậy |
|  | `map.recommendations.reasons.reservable` | Currently available to book | 현재 예약할 수 있는 장소예요 | Hiện có thể đặt chỗ |
|  | `map.recommendations.explanations.fallback` | A place worth exploring | 둘러볼 만한 추천 장소예요 | Một địa điểm đáng khám phá |
|  | `map.recommendations.explanations.fresh` | A place receiving new attention | 최근 새롭게 주목받는 장소예요 | Địa điểm đang nhận được sự chú ý mới |
|  | `map.recommendations.explanations.geo` | Close to your current location | 현재 위치에서 가까운 장소예요 | Gần vị trí hiện tại của bạn |
|  | `map.recommendations.explanations.personal` | Reflects your interests and activity | 관심사와 반응을 반영한 추천이에요 | Phản ánh sở thích và hoạt động của bạn |
|  | `map.recommendations.explanations.popular` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | Địa điểm đang được nhiều người quan tâm |
|  | `map.recommendations.context.activity.attendEvent` | Events | 이벤트 참여 | Sự kiện |
|  | `map.recommendations.context.activity.cafe` | Cafe visit | 카페 방문 | Đi cà phê |
|  | `map.recommendations.context.activity.eat` | Food | 식사 | Ăn uống |
|  | `map.recommendations.context.activity.explore` | Explore | 주변 탐색 | Khám phá |
|  | `map.recommendations.context.activity.nightlife` | Nightlife | 나이트라이프 | Giải trí đêm |
|  | `map.recommendations.context.activity.shop` | Shopping | 쇼핑 | Mua sắm |
|  | `map.recommendations.context.purpose.beauty` | Beauty | 뷰티 | Làm đẹp |
|  | `map.recommendations.context.purpose.cafe` | Cafe | 카페 | Cà phê |
|  | `map.recommendations.context.purpose.exhibition` | Exhibitions | 전시 | Triển lãm |
|  | `map.recommendations.context.purpose.fashion` | Fashion | 패션 | Thời trang |
|  | `map.recommendations.context.purpose.food` | Food | 맛집 | Ẩm thực |
|  | `map.recommendations.context.purpose.kPop` | K-POP | K-POP | K-POP |
|  | `map.recommendations.context.purpose.nightlife` | Nightlife | 나이트라이프 | Giải trí đêm |
|  | `map.recommendations.context.purpose.other` | Other | 기타 | Khác |
|  | `map.recommendations.context.purpose.popUp` | Pop-ups | 팝업 | Pop-up |
|  | `map.recommendations.limits.candidatePool` | The candidate pool was expanded because few places matched. | 조건에 맞는 장소가 적어 후보 범위를 넓혀 추천했어요. | Phạm vi ứng viên đã được mở rộng vì có ít địa điểm phù hợp. |
|  | `map.recommendations.limits.interactedExcluded` | Places you already viewed were excluded. | 이미 확인한 장소를 제외해 추천했어요. | Đã loại trừ những địa điểm bạn đã xem. |
|  | `map.recommendations.limits.operatingPriority` | Places currently operating were prioritized. | 현재 운영 중인 장소를 우선해 추천했어요. | Ưu tiên những địa điểm đang hoạt động. |
|  | `map.recommendations.limits.radiusExpanded` | The search radius was expanded to find recommendations. | 추천 결과를 찾기 위해 검색 반경을 넓혔어요. | Bán kính tìm kiếm đã được mở rộng để tìm gợi ý. |
|  | `map.recommendations.limits.requestClamped` | The recommendation count was adjusted to the server limit. | 서버 기준에 맞춰 추천 개수를 조정했어요. | Số lượng gợi ý đã được điều chỉnh theo giới hạn của máy chủ. |
| ● | `map.search.accessibilityLabel` | Search places on the map | 지도 장소 검색 | Tìm địa điểm trên bản đồ |
|  | `map.search.confirm` | OK | 확인 | OK |
|  | `map.search.empty` | No search results | 검색 결과가 없습니다 | Không có kết quả tìm kiếm |
| ● | `map.search.failed` | Address search failed | 주소 검색에 실패했습니다 | Tìm địa chỉ thất bại |
|  | `map.search.placeholder` | Search places | 장소를 검색하세요 | Tìm địa điểm |
| ● | `map.search.profileAccessibilityLabel` | Open my page | 마이페이지 열기 | Mở trang của tôi |
|  | `map.search.statusPlaceholder` | Enter an address... | 주소를 입력하세요... | Nhập địa chỉ... |
|  | `map.title` | Nearby map | 주변 지도 | Bản đồ lân cận |
|  | `map.visibleCenter` | {{lat}}, {{lng}} | {{lat}}, {{lng}} | {{lat}}, {{lng}} |

## `notificationSettings`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `notificationSettings.back` | Back | 뒤로가기 | Quay lại |
|  | `notificationSettings.contract.categories` | Server notification preferences | 서버 알림 수신 설정 | Tùy chọn thông báo trên máy chủ |
|  | `notificationSettings.contract.newHotplaceEnabled` | Hot place notifications | 핫플레이스 알림 | Thông báo điểm hot |
|  | `notificationSettings.contract.newLikeEnabled` | Like notifications | 좋아요 알림 | Thông báo lượt thích |
| ● | `notificationSettings.contract.categoryHint` | Saved to your account. Enabling checks device notification permission. | 계정에 저장됩니다. 켤 때 기기의 알림 권한을 확인합니다. | Được lưu vào tài khoản của bạn. Khi bật sẽ kiểm tra quyền thông báo của thiết bị. |
|  | `notificationSettings.contract.allUnsupported` | Unavailable: no allow-all policy exists. Device permission and category preferences are separate. | 미지원: 전체 허용 정책이 없습니다. 기기 권한과 항목별 수신 설정은 별개입니다. | Không khả dụng: không có chính sách cho phép tất cả. Quyền của thiết bị và tùy chọn theo danh mục là riêng biệt. |
|  | `notificationSettings.contract.unsupported` | Unavailable: this category has no confirmed server setting. | 미지원: 이 항목에 대응하는 서버 설정이 확정되지 않았습니다. | Không khả dụng: danh mục này chưa có cài đặt máy chủ được xác nhận. |
|  | `notificationSettings.contract.nightUnsupported` | Unavailable: receiving notifications at night is not the same as quiet hours. | 미지원: 야간 알림 수신 허용은 방해 금지 시간과 같은 설정이 아닙니다. | Không khả dụng: nhận thông báo ban đêm không giống với giờ yên lặng. |
|  | `notificationSettings.contract.unknown` | The server has not provided a valid setting. This item cannot be changed. | 서버에서 올바른 설정값을 제공하지 않아 변경할 수 없습니다. | Máy chủ chưa cung cấp cài đặt hợp lệ. Không thể thay đổi mục này. |
|  | `notificationSettings.contract.quietHours` | Quiet hours | 방해 금지 시간 | Giờ yên lặng |
|  | `notificationSettings.contract.quietReadOnly` | Read only: time validation and editing policy are not confirmed. No default schedule is saved. | 읽기 전용: 시간 검증과 편집 정책이 확정되지 않았습니다. 기본 시간을 임의로 저장하지 않습니다. | Chỉ đọc: chính sách kiểm tra và chỉnh sửa thời gian chưa được xác nhận. Không có lịch mặc định nào được lưu. |
|  | `notificationSettings.contract.quietIncomplete` | Time or timezone information is missing or invalid. | 시간 또는 시간대 정보가 없거나 올바르지 않습니다. | Thông tin thời gian hoặc múi giờ bị thiếu hoặc không hợp lệ. |
|  | `notificationSettings.contract.invalidQuietHours` | Please check the quiet hours settings on the server. | 서버의 방해 금지 시간 설정을 확인해 주세요. | Vui lòng kiểm tra cài đặt giờ yên lặng trên máy chủ. |
| ● | `notificationSettings.contract.unauthorized` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại. |
| ● | `notificationSettings.contract.forbidden` | You do not have permission to access notification settings. | 알림 설정에 접근할 권한이 없습니다. | Bạn không có quyền truy cập cài đặt thông báo. |
| ● | `notificationSettings.contract.saveFailed` | Could not update notification settings. Please try again. | 알림 설정을 변경하지 못했습니다. 다시 시도해 주세요. | Không thể cập nhật cài đặt thông báo. Vui lòng thử lại. |
| ● | `notificationSettings.permission.title` | Device notification permission | 기기 알림 권한 | Quyền thông báo của thiết bị |
| ● | `notificationSettings.permission.description` | Device permission and account preferences are separate. Change device permission in system settings. | 기기 권한과 계정의 수신 설정은 별개입니다. 기기 권한은 시스템 설정에서 변경할 수 있습니다. | Quyền của thiết bị và tùy chọn của tài khoản là riêng biệt. Hãy đổi quyền của thiết bị trong cài đặt hệ thống. |
| ● | `notificationSettings.permission.loading` | Checking device permission | 기기 권한 확인 중 | Đang kiểm tra quyền của thiết bị |
| ● | `notificationSettings.permission.authorized` | Notifications allowed | 알림 허용 | Đã cho phép thông báo |
| ● | `notificationSettings.permission.provisional` | Quiet notifications allowed | 조용한 알림 허용 | Đã cho phép thông báo yên lặng |
| ● | `notificationSettings.permission.notDetermined` | Permission has not been requested. Enabling a category will request it. | 아직 권한을 요청하지 않았습니다. 알림 항목을 켤 때 요청합니다. | Chưa yêu cầu quyền. Khi bật một danh mục, ứng dụng sẽ yêu cầu quyền. |
| ● | `notificationSettings.permission.denied` | Notification permission denied. Allow notifications in device settings to enable this category. | 알림 권한이 거부되었습니다. 이 항목을 켜려면 기기 설정에서 알림을 허용해 주세요. | Quyền thông báo bị từ chối. Hãy cho phép thông báo trong cài đặt thiết bị để bật danh mục này. |
| ● | `notificationSettings.permission.blocked` | Notification permission blocked. Please allow it in device settings. | 알림 권한이 차단되었습니다. 기기 설정에서 허용해 주세요. | Quyền thông báo bị chặn. Vui lòng cho phép trong cài đặt thiết bị. |
| ● | `notificationSettings.permission.unavailable` | Native notification support is unavailable in this environment. | 현재 환경에서는 네이티브 알림 기능을 사용할 수 없습니다. | Môi trường này không hỗ trợ thông báo gốc. |
| ● | `notificationSettings.permission.error` | Could not check or request notification permission. Please try again. | 알림 권한 확인 또는 요청 중 오류가 발생했습니다. 다시 시도해 주세요. | Không thể kiểm tra hoặc yêu cầu quyền thông báo. Vui lòng thử lại. |
| ● | `notificationSettings.permission.openSettings` | Open device notification settings | 기기 알림 설정 열기 | Mở cài đặt thông báo của thiết bị |
| ● | `notificationSettings.error` | Could not load notification settings. | 알림 설정을 불러오지 못했어요. | Không thể tải cài đặt thông báo. |
|  | `notificationSettings.loading` | Loading notification settings | 알림 설정을 불러오는 중 | Đang tải cài đặt thông báo |
|  | `notificationSettings.retry` | Try again | 다시 시도 | Thử lại |
|  | `notificationSettings.sections.interests` | Saved places & areas | 관심 장소 · 구역 | Địa điểm & khu vực đã lưu |
|  | `notificationSettings.sections.other` | Other | 기타 | Khác |
|  | `notificationSettings.sections.records` | My records & places | 내 기록 · 장소 | Ghi chép & địa điểm của tôi |
|  | `notificationSettings.sections.reports` | Reports | 리포트 | Báo cáo |
|  | `notificationSettings.settings.favoriteMoodChange.description` | When recent tags and record trends change | 최근 태그와 기록 추세가 바뀌었을 때 | Khi thẻ gần đây và xu hướng ghi chép thay đổi |
|  | `notificationSettings.settings.favoriteMoodChange.label` | Changes around a saved place | 관심 장소 분위기 변화 | Thay đổi quanh địa điểm đã lưu |
|  | `notificationSettings.settings.firstRecordTrending.description` | Get notified when a place you First Recorded starts trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | Nhận thông báo khi địa điểm bạn ghi lại đầu tiên (First Recorder) trở nên nổi bật |
|  | `notificationSettings.settings.firstRecordTrending.label` | A place I recorded first is trending | 내가 먼저 기록한 장소 급상승 | Địa điểm tôi ghi lại đầu tiên đang nổi |
|  | `notificationSettings.settings.frequentAreaHotPlace.description` | When a new trending place appears in an area you frequent | 내 생활권에 새로 뜨는 장소가 생기면 | Khi có địa điểm mới nổi trong khu vực bạn hay lui tới |
|  | `notificationSettings.settings.frequentAreaHotPlace.label` | New hot place in a frequent area | 자주 가는 구역 새 핫플 | Điểm hot mới ở khu vực hay đến |
|  | `notificationSettings.settings.marketingEvents.label` | Marketing & event updates | 마케팅 · 이벤트 정보 | Tin tiếp thị & sự kiện |
|  | `notificationSettings.settings.nightNotifications.description` | Allow notifications between 21:00 and 08:00 | 21:00 – 08:00 사이 알림 허용 | Cho phép thông báo từ 21:00 đến 08:00 |
|  | `notificationSettings.settings.nightNotifications.label` | Receive notifications at night | 야간 알림 받기 | Nhận thông báo ban đêm |
|  | `notificationSettings.settings.pushAll.description` | Turning this off disables all notifications below | 끄면 아래 알림이 모두 발송되지 않아요 | Tắt mục này sẽ tắt tất cả thông báo bên dưới |
|  | `notificationSettings.settings.pushAll.label` | Allow all push notifications | 푸시 알림 전체 허용 | Cho phép tất cả thông báo đẩy |
|  | `notificationSettings.settings.recordNewTags.description` | When the status of a place you recorded changes | 내가 남긴 장소의 상태가 바뀔 때 | Khi trạng thái của địa điểm bạn đã ghi lại thay đổi |
|  | `notificationSettings.settings.recordNewTags.label` | New tags added to my recorded place | 내 기록 장소에 새 태그 누적 | Thẻ mới ở địa điểm tôi đã ghi lại |
|  | `notificationSettings.settings.todayMissionArea.label` | Today’s mission area | 오늘의 미션 구역 | Khu vực nhiệm vụ hôm nay |
|  | `notificationSettings.settings.weeklyReport.description` | A weekly summary of this week’s discoveries and your records | 이번 주 발자국과 내 기록을 정리해 보내드려요 | Bản tóm tắt hằng tuần về các khám phá trong tuần và ghi chép của bạn |
|  | `notificationSettings.settings.weeklyReport.label` | Weekly report | 주간 리포트 | Báo cáo hằng tuần |
|  | `notificationSettings.title` | Notification settings | 알림 설정 | Cài đặt thông báo |

## `offer`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `offer.cta.ended` | Offer ended | 종료된 혜택 | Ưu đãi đã kết thúc |
|  | `offer.cta.issue` | Get coupon | 쿠폰 받기 | Nhận phiếu ưu đãi |
|  | `offer.cta.notStarted` | Not started yet | 아직 시작 전 | Chưa bắt đầu |
|  | `offer.cta.soldOut` | All claimed | 수량 모두 소진 | Đã hết lượt |
|  | `offer.cta.unavailable` | Cannot be claimed | 받을 수 없는 혜택 | Không thể nhận |
|  | `offer.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 여행 일정이 있는 계정 | Tài khoản có chuyến đi đang diễn ra |
|  | `offer.eligibility.PUBLIC` | Anyone | 누구나 | Mọi người |
|  | `offer.eligibility.UNKNOWN` | Conditions need review | 조건 확인 필요 | Cần kiểm tra điều kiện |
|  | `offer.expiry.ISSUE_PLUS_DAYS` | Valid for a set number of days after issue | 발급일로부터 정해진 기간 | Có hiệu lực trong số ngày quy định kể từ khi nhận |
|  | `offer.expiry.ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END` | Valid for a set number of days after issue, up to the offer end date | 발급일로부터 정해진 기간, 혜택 종료일까지 | Có hiệu lực trong số ngày quy định kể từ khi nhận, tối đa đến ngày ưu đãi kết thúc |
|  | `offer.expiry.OFFER_END` | Valid until the offer ends | 혜택 종료일까지 | Có hiệu lực đến khi ưu đãi kết thúc |
|  | `offer.expiry.UNKNOWN` | Validity needs review | 유효 기간 확인 필요 | Cần kiểm tra thời hạn |
|  | `offer.inventory.LIMITED` | Limited quantity | 수량 한정 | Số lượng có hạn |
|  | `offer.inventory.UNKNOWN` | Quantity needs review | 수량 확인 필요 | Cần kiểm tra số lượng |
|  | `offer.inventory.UNLIMITED` | No quantity limit | 수량 제한 없음 | Không giới hạn số lượng |
|  | `offer.remaining.limited_one` | {{count}} left | {{count}}개 남음 | Còn {{count}} |
|  | `offer.remaining.limited_other` | {{count}} left | {{count}}개 남음 | Còn {{count}} |
|  | `offer.remaining.unknown` | Remaining quantity not provided | 남은 수량 미제공 | Chưa có thông tin số lượng còn lại |
|  | `offer.remaining.unlimited` | No quantity limit | 수량 제한 없음 | Không giới hạn số lượng |
|  | `offer.statuses.CLOSED` | Closed | 종료됨 | Đã kết thúc |
|  | `offer.statuses.DRAFT` | Draft | 작성 중 | Bản nháp |
|  | `offer.statuses.PUBLISHED` | Available | 받을 수 있음 | Có thể nhận |
|  | `offer.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | Cần kiểm tra trạng thái |

## `payment`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `payment.statuses.FAILED` | Payment failed | 결제 실패 | Thanh toán thất bại |
|  | `payment.statuses.PAID` | Paid | 결제 완료 | Đã thanh toán |
|  | `payment.statuses.PROCESSING` | Payment in progress | 결제 진행 중 | Đang thanh toán |
|  | `payment.statuses.REFUNDED` | Refunded | 환불 완료 | Đã hoàn tiền |
|  | `payment.statuses.REFUND_PROCESSING` | Refund in progress | 환불 진행 중 | Đang hoàn tiền |
|  | `payment.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | Cần kiểm tra trạng thái |

## `myPage`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `myPage.back` | Back | 뒤로가기 | Quay lại |
|  | `myPage.couponBox.empty` | You have no coupons yet | 보유한 쿠폰이 없어요 | Bạn chưa có phiếu ưu đãi nào |
|  | `myPage.couponBox.emptyFiltered` | You have no {{status}} coupons | {{status}} 쿠폰이 없어요 | Bạn không có phiếu ưu đãi {{status}} |
| ● | `myPage.couponBox.error` | Could not load your coupons. | 쿠폰을 불러오지 못했어요. | Không thể tải phiếu ưu đãi của bạn. |
|  | `myPage.couponBox.fallbackDescription` | Discount coupon | 할인 쿠폰 | Phiếu giảm giá |
|  | `myPage.couponBox.fallbackTitle` | Coupon | 쿠폰 | Phiếu ưu đãi |
|  | `myPage.couponBox.filters.ALL` | All | 전체 | Tất cả |
|  | `myPage.couponBox.filters.EXPIRED` | Expired | 만료 | Hết hạn |
|  | `myPage.couponBox.filters.ISSUED` | Available | 사용 가능 | Khả dụng |
|  | `myPage.couponBox.filters.REDEEMED` | Used | 사용 완료 | Đã dùng |
|  | `myPage.couponBox.loading` | Loading coupons | 쿠폰을 불러오는 중 | Đang tải phiếu ưu đãi |
| ● | `myPage.couponBox.nextPageError` | Could not load more coupons. | 쿠폰을 더 불러오지 못했어요. | Không thể tải thêm phiếu ưu đãi. |
|  | `myPage.couponBox.nextPageRetry` | Load more | 더 불러오기 | Tải thêm |
|  | `myPage.couponBox.status.CANCELED` | Canceled | 취소됨 | Đã hủy |
|  | `myPage.couponBox.status.EXPIRED` | Expired | 만료 | Hết hạn |
|  | `myPage.couponBox.status.ISSUED` | Available | 사용 가능 | Khả dụng |
|  | `myPage.couponBox.status.REDEEMED` | Used | 사용 완료 | Đã dùng |
|  | `myPage.couponBox.status.UNKNOWN` | Unavailable | 사용 불가 | Không khả dụng |
|  | `myPage.couponBox.title` | Coupon box | 쿠폰함 | Hộp phiếu ưu đãi |
| ● | `myPage.couponDetail.codeA11yLabel` | Coupon code ending in {{tail}} | 쿠폰 코드, 끝 네 자리 {{tail}} | Mã phiếu ưu đãi kết thúc bằng {{tail}} |
| ● | `myPage.couponDetail.error` | Could not load this coupon. | 쿠폰 정보를 불러오지 못했어요. | Không thể tải phiếu ưu đãi này. |
|  | `myPage.couponDetail.infoHeading` | Coupon info | 쿠폰 정보 | Thông tin phiếu ưu đãi |
|  | `myPage.couponDetail.loading` | Loading coupon | 쿠폰 정보를 불러오는 중 | Đang tải phiếu ưu đãi |
| ● | `myPage.couponDetail.noticeHeading` | Notice | 유의사항 | Lưu ý |
| ● | `myPage.couponDetail.qrHint` | Show this QR code to a store staff member before paying | 결제 전 매장 직원에게 QR 코드를 보여주세요 | Hãy đưa mã QR này cho nhân viên cửa hàng trước khi thanh toán |
|  | `myPage.couponDetail.qrUnavailable` | Could not draw the QR code. Please read the code above to the staff. | QR 코드를 표시하지 못했어요. 위 코드를 직원에게 알려주세요. | Không thể hiển thị mã QR. Vui lòng đọc mã ở trên cho nhân viên. |
| ● | `myPage.couponDetail.notices.0` | Each account can use this coupon only once. | 쿠폰은 계정당 1회만 사용할 수 있어요. | Mỗi tài khoản chỉ được dùng phiếu ưu đãi này một lần. |
| ● | `myPage.couponDetail.notices.1` | The coupon disappears automatically once it expires. | 유효기간이 지나면 쿠폰이 자동으로 사라져요. | Phiếu ưu đãi sẽ tự động biến mất khi hết hạn. |
| ● | `myPage.couponDetail.notices.2` | It cannot be combined with other coupons or discounts. | 다른 쿠폰 및 할인 혜택과 중복 사용은 불가해요. | Không áp dụng cùng phiếu ưu đãi hoặc giảm giá khác. |
| ● | `myPage.couponDetail.notices.3` | Cancelling the reservation restores the coupon automatically. | 예약을 취소하면 쿠폰이 자동으로 복구돼요. | Hủy đặt chỗ sẽ tự động khôi phục phiếu ưu đãi. |
| ● | `myPage.couponDetail.expiredNotice` | This coupon expired on {{date}} | {{date}}에 만료된 쿠폰이에요 | Phiếu ưu đãi này đã hết hạn vào {{date}} |
| ● | `myPage.couponDetail.redeemedNotice` | This coupon was used on {{date}} | {{date}}에 사용한 쿠폰이에요 | Phiếu ưu đãi này đã được dùng vào {{date}} |
| ● | `myPage.couponDetail.redeemedNoticeUnknown` | This coupon has already been used | 이미 사용한 쿠폰이에요 | Phiếu ưu đãi này đã được sử dụng |
|  | `myPage.couponDetail.reserve` | Make a reservation | 예약하러 가기 | Đặt chỗ ngay |
|  | `myPage.couponDetail.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 진행 중인 여행 일정이 있는 계정 | Tài khoản có chuyến đi đang diễn ra |
|  | `myPage.couponDetail.eligibility.PUBLIC` | Anyone | 누구나 | Mọi người |
|  | `myPage.couponDetail.rows.eligibility` | Who can use | 발급 대상 | Đối tượng sử dụng |
|  | `myPage.couponDetail.rows.period` | Offer period | 행사 기간 | Thời gian ưu đãi |
|  | `myPage.couponDetail.rows.stores` | Where to use | 사용 가능 매장 | Nơi sử dụng |
|  | `myPage.couponDetail.rows.usage` | How to use | 사용처 | Cách sử dụng |
|  | `myPage.couponDetail.rows.validity` | Valid for | 사용 가능 기간 | Thời hạn sử dụng |
|  | `myPage.couponDetail.validityDays_one` | {{count}} day after issue | 발급 후 {{count}}일 | {{count}} ngày sau khi nhận |
|  | `myPage.couponDetail.validityDays_other` | {{count}} days after issue | 발급 후 {{count}}일 | {{count}} ngày sau khi nhận |
|  | `myPage.couponDetail.title` | Coupon detail | 쿠폰상세 | Chi tiết phiếu ưu đãi |
|  | `myPage.couponDetail.unavailable` | This coupon has been used or has expired | 이미 사용했거나 만료된 쿠폰이에요 | Phiếu ưu đãi này đã được dùng hoặc đã hết hạn |
| ● | `myPage.profileEdit.avatarCameraPermissionDenied` | Camera access is required to take a profile photo. You can allow it in Settings. | 프로필 사진을 촬영하려면 카메라 접근 권한이 필요합니다. 설정에서 허용해주세요. | Cần quyền truy cập camera để chụp ảnh hồ sơ. Bạn có thể cho phép trong Cài đặt. |
|  | `myPage.profileEdit.avatarCancel` | Cancel | 취소 | Hủy |
| ● | `myPage.profileEdit.avatarChangeFailed` | Could not change the profile image. Please try again. | 프로필 이미지를 변경하지 못했습니다. 다시 시도해주세요. | Không thể đổi ảnh hồ sơ. Vui lòng thử lại. |
|  | `myPage.profileEdit.avatarFileTooLarge` | This image is too large. Please choose a smaller one. | 이미지 용량이 너무 큽니다. 더 작은 이미지를 선택해주세요. | Ảnh này quá lớn. Vui lòng chọn ảnh nhỏ hơn. |
|  | `myPage.profileEdit.avatarFromCamera` | Take a photo | 사진 촬영 | Chụp ảnh |
|  | `myPage.profileEdit.avatarFromLibrary` | Choose from library | 앨범에서 선택 | Chọn từ thư viện |
|  | `myPage.profileEdit.avatarOpenSettings` | Open settings | 설정 열기 | Mở cài đặt |
| ● | `myPage.profileEdit.avatarPermissionDenied` | Photo library access is required to change your profile image. You can allow it in Settings. | 프로필 이미지를 변경하려면 사진 접근 권한이 필요합니다. 설정에서 허용해주세요. | Cần quyền truy cập thư viện ảnh để đổi ảnh hồ sơ. Bạn có thể cho phép trong Cài đặt. |
|  | `myPage.profileEdit.avatarRetry` | Try again | 다시 시도 | Thử lại |
|  | `myPage.profileEdit.avatarSheetTitle` | Change profile photo | 프로필 사진 변경 | Đổi ảnh hồ sơ |
|  | `myPage.profileEdit.avatarTypeUnsupported` | Only JPEG or PNG images can be used as a profile image. | JPEG 또는 PNG 이미지만 프로필 이미지로 사용할 수 있습니다. | Chỉ ảnh JPEG hoặc PNG mới dùng được làm ảnh hồ sơ. |
|  | `myPage.profileEdit.avatarUploading` | Uploading profile image | 프로필 이미지 업로드 중 | Đang tải ảnh hồ sơ lên |
|  | `myPage.profileEdit.changeAvatar` | Change profile image | 프로필 이미지 변경 | Đổi ảnh hồ sơ |
|  | `myPage.profileEdit.confirmPassword` | Confirm new password | 새 비밀번호 확인 | Xác nhận mật khẩu mới |
|  | `myPage.profileEdit.confirmPasswordPlaceholder` | Re-enter the new password | 새 비밀번호를 다시 입력하세요 | Nhập lại mật khẩu mới |
|  | `myPage.profileEdit.currentPassword` | Current password | 현재 비밀번호 | Mật khẩu hiện tại |
|  | `myPage.profileEdit.currentPasswordInvalid` | Your current password is incorrect | 현재 비밀번호가 올바르지 않습니다 | Mật khẩu hiện tại không đúng |
|  | `myPage.profileEdit.currentPasswordPlaceholder` | Enter your current password | 현재 비밀번호를 입력하세요 | Nhập mật khẩu hiện tại |
|  | `myPage.profileEdit.currentPasswordRequired` | Enter your current password to set a new one | 비밀번호를 변경하려면 현재 비밀번호를 입력하세요 | Nhập mật khẩu hiện tại để đặt mật khẩu mới |
|  | `myPage.profileEdit.hidePassword` | Hide {{field}} | {{field}} 숨기기 | Ẩn {{field}} |
|  | `myPage.profileEdit.infoTitle` | Edit info | 정보 수정 | Sửa thông tin |
|  | `myPage.profileEdit.newPassword` | New password | 새 비밀번호 | Mật khẩu mới |
|  | `myPage.profileEdit.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | Ít nhất 8 ký tự |
| ● | `myPage.profileEdit.passwordChangeFailed` | Could not change the password. | 비밀번호를 변경하지 못했습니다. | Không thể đổi mật khẩu. |
|  | `myPage.profileEdit.passwordChangePartialFailure` | The username was changed, but the password was not. {{reason}} | 아이디는 변경했지만 비밀번호는 변경하지 못했습니다. {{reason}} | Tên đăng nhập đã được đổi nhưng mật khẩu thì chưa. {{reason}} |
|  | `myPage.profileEdit.passwordMismatch` | The new passwords do not match | 새 비밀번호가 서로 다릅니다 | Mật khẩu mới không khớp |
|  | `myPage.profileEdit.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | Mật khẩu phải có ít nhất 8 ký tự |
|  | `myPage.profileEdit.save` | Save changes | 변경 사항 저장하기 | Lưu thay đổi |
|  | `myPage.profileEdit.saving` | Saving... | 저장 중... | Đang lưu... |
|  | `myPage.profileEdit.showPassword` | Show {{field}} | {{field}} 보기 | Hiện {{field}} |
|  | `myPage.profileEdit.title` | Edit profile | 프로필 편집 | Chỉnh sửa hồ sơ |
|  | `myPage.profileEdit.username` | Username | 아이디 | Tên đăng nhập |
| ● | `myPage.profileEdit.usernameChangeFailed` | Could not change the username. | 아이디를 변경하지 못했습니다. | Không thể đổi tên đăng nhập. |
|  | `myPage.profileEdit.usernameLengthInvalid` | Username must be between 4 and 50 characters. | 아이디는 4자 이상 50자 이하여야 합니다. | Tên đăng nhập phải có từ 4 đến 50 ký tự. |
|  | `myPage.profileEdit.usernameRequired` | Enter a username. | 아이디를 입력해주세요. | Hãy nhập tên đăng nhập. |
| ● | `myPage.profileError` | Could not load your profile. | 프로필을 불러오지 못했어요. | Không thể tải hồ sơ của bạn. |
|  | `myPage.profileLoading` | Loading your profile | 프로필을 불러오는 중 | Đang tải hồ sơ của bạn |
|  | `myPage.profileUnavailable` | Profile unavailable | 프로필 정보 없음 | Hồ sơ không khả dụng |
|  | `myPage.retry` | Try again | 다시 시도 | Thử lại |
|  | `myPage.settings` | Settings | 설정 | Cài đặt |
|  | `myPage.stats.coupons` | Coupons | 쿠폰 | Phiếu ưu đãi |
|  | `myPage.stats.reservations` | Reservations | 예약 | Đặt chỗ |
|  | `myPage.stats.reviews` | Reviews | 리뷰 | Đánh giá |
|  | `myPage.title` | My page | 마이 페이지 | Trang của tôi |
| ● | `myPage.travel.error` | Could not load your travel schedule. | 여행 일정을 불러오지 못했어요. | Không thể tải lịch trình du lịch của bạn. |
|  | `myPage.travel.loading` | Loading your travel schedule | 여행 일정을 불러오는 중 | Đang tải lịch trình du lịch của bạn |
|  | `myPage.travel.nextMonth` | Next month | 다음 달 | Tháng sau |
|  | `myPage.travel.notEditable` | This travel schedule can no longer be edited. | 이 여행 일정은 더 이상 변경할 수 없어요. | Lịch trình du lịch này không thể chỉnh sửa nữa. |
|  | `myPage.travel.periodOverlap` | These dates overlap another travel schedule. | 다른 여행 일정과 기간이 겹쳐요. | Các ngày này trùng với một lịch trình du lịch khác. |
|  | `myPage.travel.previousMonth` | Previous month | 이전 달 | Tháng trước |
|  | `myPage.travel.saving` | Saving dates... | 날짜 저장 중... | Đang lưu ngày... |
|  | `myPage.travel.startDateInPast` | Choose today or a future date. | 오늘 또는 이후 날짜를 선택해주세요. | Hãy chọn hôm nay hoặc một ngày trong tương lai. |
|  | `myPage.travel.title` | My trips | 나의 여행 | Chuyến đi của tôi |
| ● | `myPage.travel.updateError` | Could not save your travel dates. | 여행 날짜를 저장하지 못했어요. | Không thể lưu ngày du lịch của bạn. |
|  | `myPage.travel.weekdays.sun` | S | S | CN |
|  | `myPage.travel.weekdays.mon` | M | M | T2 |
|  | `myPage.travel.weekdays.tue` | T | T | T3 |
|  | `myPage.travel.weekdays.wed` | W | W | T4 |
|  | `myPage.travel.weekdays.thu` | T | T | T5 |
|  | `myPage.travel.weekdays.fri` | F | F | T6 |
|  | `myPage.travel.weekdays.sat` | S | S | T7 |
|  | `myPage.verifiedPlaces.empty` | No verified places yet | 아직 검증한 장소가 없어요 | Chưa có địa điểm đã xác minh |
| ● | `myPage.verifiedPlaces.error` | Could not load your verified places. | 인증한 장소를 불러오지 못했어요. | Không thể tải các địa điểm bạn đã xác minh. |
|  | `myPage.verifiedPlaces.favorite` | Save place | 장소 저장 | Lưu địa điểm |
|  | `myPage.verifiedPlaces.loading` | Loading verified places | 인증한 장소를 불러오는 중 | Đang tải địa điểm đã xác minh |
|  | `myPage.verifiedPlaces.title` | Verified places | 검증한 장소 | Địa điểm đã xác minh |
|  | `myPage.verifiedPlaces.unfavorite` | Remove saved place | 저장 취소 | Bỏ lưu địa điểm |

## `settings`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `settings.support.loading` | Loading | 불러오는 중 | Đang tải |
| ● | `settings.support.error` | Could not load | 불러오지 못했습니다 | Không thể tải |
|  | `settings.support.empty` | No information | 정보 없음 | Không có thông tin |
|  | `settings.support.navigationUnavailable` | Navigation is unavailable for this screen. Return to settings and try again. | 이 화면의 탐색 연결을 사용할 수 없습니다. 설정으로 돌아가 다시 시도해 주세요. | Không thể điều hướng từ màn hình này. Hãy quay lại cài đặt và thử lại. |
|  | `settings.support.guide` | Unavailable feature. Opens an explanation. | 미지원 기능입니다. 사유 안내를 엽니다. | Tính năng chưa khả dụng. Mở phần giải thích. |
|  | `settings.support.emailEdit` | Edit email | 이메일 수정 | Sửa email |
|  | `settings.support.emailReason` | Direct email editing is unavailable because no update contract is published. | 이메일 직접 수정 계약이 공개되지 않아 사용할 수 없습니다. | Chưa thể sửa email trực tiếp vì chưa có giao thức cập nhật được công bố. |
|  | `settings.support.oauth` | Connected accounts | 연결된 계정 | Tài khoản đã liên kết |
|  | `settings.support.oauthReason` | The server does not provide a connected-account status query. | 서버에서 계정 연결 상태 조회를 제공하지 않습니다. | Máy chủ không cung cấp truy vấn trạng thái tài khoản liên kết. |
|  | `settings.support.checkInCount` | Check-ins | 체크인 수 | Lượt check-in |
|  | `settings.support.reviewCount` | My reviews | 내 리뷰 수 | Đánh giá của tôi |
|  | `settings.support.verifiedCount` | Verified places | 검증한 장소 | Địa điểm đã xác minh |
|  | `settings.support.verifiedReason` | Check-in totals count visits, not unique verified places. A verified-place total is unavailable. | 체크인 수는 방문 횟수이며 고유한 검증 장소 수가 아닙니다. 검증 장소 수는 제공되지 않습니다. | Tổng lượt check-in đếm số lần ghé thăm, không phải số địa điểm đã xác minh riêng biệt. Chưa có tổng số địa điểm đã xác minh. |
| ● | `settings.support.logoutError` | Could not complete logout. Please check your sign-in state. | 로그아웃을 완료하지 못했습니다. 로그인 상태를 확인해 주세요. | Không thể hoàn tất đăng xuất. Vui lòng kiểm tra trạng thái đăng nhập. |
|  | `settings.export.title` | My data | 내 데이터 | Dữ liệu của tôi |
|  | `settings.export.download` | Download my data | 내 데이터 다운로드 | Tải dữ liệu của tôi |
|  | `settings.export.confirm` | Prepare a JSON file containing your personal data? Choose where to save it in the share sheet. | 개인정보가 포함된 JSON 파일을 준비할까요? 공유 화면에서 저장 위치를 선택해 주세요. | Chuẩn bị tệp JSON chứa dữ liệu cá nhân của bạn? Hãy chọn nơi lưu trong bảng chia sẻ. |
|  | `settings.export.cancel` | Cancel | 취소 | Hủy |
|  | `settings.export.description` | Export the data provided by your account. This does not download location history or delete data. | 계정에서 제공하는 데이터를 내보냅니다. 위치 기록 다운로드나 데이터 삭제 기능은 아닙니다. | Xuất dữ liệu do tài khoản của bạn cung cấp. Thao tác này không tải lịch sử vị trí hay xóa dữ liệu. |
|  | `settings.export.loading` | Preparing the file… | 파일을 준비하는 중입니다. | Đang chuẩn bị tệp… |
|  | `settings.export.cancelled` | Download cancelled. | 다운로드를 취소했습니다. | Đã hủy tải xuống. |
| ● | `settings.export.error` | Could not download. Please try again. | 다운로드하지 못했습니다. 다시 시도해 주세요. | Không thể tải xuống. Vui lòng thử lại. |
|  | `settings.export.prepared` | File prepared. Saving or cancelling in the share sheet cannot be confirmed by the app. | 파일을 준비했습니다. 공유 화면에서의 저장 또는 취소 여부는 앱이 확인할 수 없습니다. | Tệp đã sẵn sàng. Ứng dụng không thể xác nhận bạn đã lưu hay hủy trong bảng chia sẻ. |
|  | `settings.appearance.dark` | Dark mode | 다크 모드 | Chế độ tối |
|  | `settings.appearance.description` | Choose whether PingDom follows your device appearance or uses a fixed mode. | 기기 화면 설정을 따르거나 원하는 화면 모드를 고정할 수 있어요. | Chọn để PingDom theo giao diện thiết bị hoặc dùng một chế độ cố định. |
|  | `settings.appearance.light` | Light mode | 라이트 모드 | Chế độ sáng |
|  | `settings.appearance.section` | Appearance | 화면 모드 | Giao diện |
|  | `settings.appearance.selected` | Selected | 선택됨 | Đã chọn |
|  | `settings.appearance.system` | Use system setting | 시스템 설정 사용 | Dùng cài đặt hệ thống |
|  | `settings.appearance.title` | Appearance | 화면 모드 | Giao diện |
|  | `settings.language.description` | Choose the language used throughout PingDom. | 핑덤에서 사용할 언어를 선택해 주세요. | Chọn ngôn ngữ dùng trong toàn bộ PingDom. |
|  | `settings.language.section` | Language | 언어 | Ngôn ngữ |
|  | `settings.language.selected` | Selected | 선택됨 | Đã chọn |
|  | `settings.language.title` | Language | 언어 설정 | Ngôn ngữ |
| ● | `settings.account.deleteDescription` | Deleting your account permanently removes your records and First Recorder history. | 탈퇴하면 내가 남긴 기록과 First Recorder 이력이 모두 사라져요. | Xóa tài khoản sẽ xóa vĩnh viễn các ghi chép và lịch sử First Recorder của bạn. |
|  | `settings.account.email` | Email | 이메일 | Email |
|  | `settings.account.items.coupons` | Coupons | 쿠폰 | Phiếu ưu đãi |
| ● | `settings.account.items.deleteAccount` | Delete account | 회원 탈퇴 | Xóa tài khoản |
|  | `settings.account.items.loginInformation` | Login information | 로그인 정보 | Thông tin đăng nhập |
|  | `settings.account.items.loginInformationDescription` | Email and password | 이메일 및 비밀번호 | Email và mật khẩu |
|  | `settings.account.items.logout` | Log out | 로그아웃 | Đăng xuất |
|  | `settings.account.items.myRecords` | My records | 내 기록 | Ghi chép của tôi |
|  | `settings.account.loginSection` | Login information | 로그인 정보 | Thông tin đăng nhập |
|  | `settings.account.sections.account` | Account | 계정 | Tài khoản |
|  | `settings.account.sections.activity` | Activity | 활동 | Hoạt động |
|  | `settings.account.sections.session` | Session | 세션 | Phiên |
|  | `settings.account.title` | Account management | 계정 관리 | Quản lý tài khoản |
|  | `settings.account.username` | Username | 아이디 | Tên đăng nhập |
|  | `settings.back` | Back | 뒤로가기 | Quay lại |
| ● | `settings.deleteAccount` | Delete account | 회원 탈퇴 | Xóa tài khoản |
|  | `settings.details.appInformation.description` | App information will be available in a later update. | 앱 정보는 추후 업데이트에서 제공할 예정입니다. | Thông tin ứng dụng sẽ có trong bản cập nhật sau. |
|  | `settings.details.appInformation.title` | App information | 앱 정보 | Thông tin ứng dụng |
|  | `settings.details.coupons.description` | The coupon box will be connected in a separate update. | 쿠폰 보관함은 별도 업데이트에서 연결할 예정입니다. | Hộp phiếu ưu đãi sẽ được kết nối trong một bản cập nhật riêng. |
|  | `settings.details.coupons.title` | Coupons | 쿠폰 | Phiếu ưu đãi |
|  | `settings.details.dataManagement.description` | Data download and deletion will be connected after its policy is defined. | 데이터 다운로드와 삭제는 정책 확정 후 연결할 예정입니다. | Tải xuống và xóa dữ liệu sẽ được kết nối sau khi có chính sách. |
|  | `settings.details.dataManagement.title` | Download or delete data | 데이터 다운로드 · 삭제 | Tải xuống hoặc xóa dữ liệu |
| ● | `settings.details.deleteAccount.description` | Account deletion is unavailable until reauthentication and confirmation policies are defined. Your account has not been changed. | 재인증과 최종 확인 정책이 정해지지 않아 회원 탈퇴를 사용할 수 없습니다. 계정에는 아무 변경도 적용되지 않았습니다. | Chưa thể xóa tài khoản cho đến khi có chính sách xác thực lại và xác nhận. Tài khoản của bạn chưa bị thay đổi. |
| ● | `settings.details.deleteAccount.title` | Delete account | 회원 탈퇴 | Xóa tài khoản |
|  | `settings.details.footprintMap.description` | There is no footprint map screen or matching data contract yet. | 발자국 지도 전용 화면과 데이터 계약이 아직 없습니다. | Chưa có màn hình bản đồ dấu chân hoặc giao thức dữ liệu tương ứng. |
|  | `settings.details.footprintMap.title` | My footprint map | 내 발자국 지도 | Bản đồ dấu chân của tôi |
|  | `settings.details.locationSettings.description` | Location settings will be connected in a separate update. | 위치 정보 설정은 별도 업데이트에서 연결할 예정입니다. | Cài đặt vị trí sẽ được kết nối trong một bản cập nhật riêng. |
|  | `settings.details.locationSettings.title` | Location settings | 위치 정보 설정 | Cài đặt vị trí |
|  | `settings.details.loginInformation.description` | Login information management will be connected in a separate update. | 로그인 정보 관리는 별도 업데이트에서 연결할 예정입니다. | Quản lý thông tin đăng nhập sẽ được kết nối trong một bản cập nhật riêng. |
|  | `settings.details.loginInformation.title` | Login information | 로그인 정보 | Thông tin đăng nhập |
|  | `settings.details.logout.description` | Logout is not connected yet. You are still signed in. | 로그아웃은 아직 연결되지 않았습니다. 로그인 상태가 유지됩니다. | Đăng xuất chưa được kết nối. Bạn vẫn đang đăng nhập. |
|  | `settings.details.logout.title` | Log out | 로그아웃 | Đăng xuất |
|  | `settings.details.myRecords.description` | Record management has no dedicated screen or defined scope yet. Reviews and check-ins are different records. | 내 기록 관리의 범위와 전용 화면이 정해지지 않았습니다. 리뷰와 체크인은 서로 다른 기록입니다. | Quản lý ghi chép chưa có màn hình riêng hay phạm vi xác định. Đánh giá và check-in là các ghi chép khác nhau. |
|  | `settings.details.myRecords.title` | Manage my records | 내 기록 관리 | Quản lý ghi chép của tôi |
| ● | `settings.details.notices.description` | An official notices source and screen have not been configured. | 공식 공지사항 제공 경로와 화면이 아직 연결되지 않았습니다. | Nguồn và màn hình thông báo chính thức chưa được thiết lập. |
| ● | `settings.details.notices.title` | Notices | 공지사항 | Thông báo |
|  | `settings.details.notificationSettings.description` | Notification settings will be connected in a separate update. | 알림 설정은 별도 업데이트에서 연결할 예정입니다. | Cài đặt thông báo sẽ được kết nối trong một bản cập nhật riêng. |
|  | `settings.details.notificationSettings.title` | Notification settings | 알림 설정 | Cài đặt thông báo |
|  | `settings.details.passwordChange.description` | Password change is not connected yet. Your password has not been changed. | 비밀번호 변경은 아직 연결되지 않았습니다. 비밀번호에는 아무 변경도 적용되지 않았습니다. | Đổi mật khẩu chưa được kết nối. Mật khẩu của bạn chưa bị thay đổi. |
|  | `settings.details.passwordChange.title` | Change password | 비밀번호 변경 | Đổi mật khẩu |
| ● | `settings.details.privacyPolicy.description` | The approved privacy policy document and its URL have not been configured. | 승인된 개인정보 처리방침 문서와 URL이 아직 연결되지 않았습니다. | Tài liệu chính sách quyền riêng tư đã phê duyệt và URL của nó chưa được thiết lập. |
| ● | `settings.details.privacyPolicy.title` | Privacy policy | 개인정보 처리방침 | Chính sách quyền riêng tư |
| ● | `settings.details.privacySettings.description` | Privacy settings will be connected in a separate update. | 개인정보 설정은 별도 업데이트에서 연결할 예정입니다. | Cài đặt quyền riêng tư sẽ được kết nối trong một bản cập nhật riêng. |
| ● | `settings.details.privacySettings.title` | Privacy settings | 개인정보 설정 | Cài đặt quyền riêng tư |
|  | `settings.details.savedPlaces.description` | A dedicated saved-place management screen is not defined yet. | 저장 장소 관리 전용 화면이 아직 정의되지 않았습니다. | Chưa có màn hình riêng để quản lý địa điểm đã lưu. |
|  | `settings.details.savedPlaces.title` | Manage saved places | 관심 장소 관리 | Quản lý địa điểm đã lưu |
| ● | `settings.details.terms.description` | The approved terms document and its URL have not been configured. | 승인된 이용약관 문서와 URL이 아직 연결되지 않았습니다. | Tài liệu điều khoản đã phê duyệt và URL của nó chưa được thiết lập. |
| ● | `settings.details.terms.title` | Terms of service | 이용약관 | Điều khoản dịch vụ |
|  | `settings.location.title` | Location & privacy | 위치·개인정보 | Vị trí & quyền riêng tư |
|  | `settings.location.locationSection` | Location information | 위치 정보 | Thông tin vị trí |
|  | `settings.location.visibilitySection` | Visibility | 공개 범위 | Phạm vi hiển thị |
|  | `settings.location.dataSection` | Data management | 데이터 관리 | Quản lý dữ liệu |
|  | `settings.location.description` | Check device location permission and supported features. This screen does not collect your location. | 기기 위치 권한과 지원되는 기능을 확인하세요. 이 화면에서는 위치를 수집하지 않습니다. | Kiểm tra quyền vị trí của thiết bị và các tính năng được hỗ trợ. Màn hình này không thu thập vị trí của bạn. |
|  | `settings.location.device` | Device location permission | 기기 위치 권한 | Quyền vị trí của thiết bị |
|  | `settings.location.foreground` | Collect location only while recording | 기록할 때만 위치 수집 | Chỉ thu thập vị trí khi ghi chép |
|  | `settings.location.verification` | GPS on-site verification | GPS 현장 인증 | Xác minh tại chỗ bằng GPS |
|  | `settings.location.profileVisibility` | Profile visibility | 프로필 공개 | Hiển thị hồ sơ |
|  | `settings.location.nickname` | Show nickname in place history | 장소 기록에 닉네임 표시 | Hiện biệt danh trong lịch sử địa điểm |
|  | `settings.location.download` | Export my data | 내 데이터 내보내기 | Xuất dữ liệu của tôi |
| ● | `settings.location.deleteHistory` | Delete all location history | 위치 기록 전체 삭제 | Xóa toàn bộ lịch sử vị trí |
| ● | `settings.location.permissionStates.loading` | Checking | 확인 중 | Đang kiểm tra |
| ● | `settings.location.permissionStates.granted` | Allowed | 허용됨 | Đã cho phép |
| ● | `settings.location.permissionStates.denied` | Permission needed | 권한 필요 | Cần cấp quyền |
| ● | `settings.location.permissionStates.restricted` | Allow in device settings | 설정에서 허용 필요 | Cho phép trong cài đặt thiết bị |
| ● | `settings.location.permissionStates.unavailable` | Unavailable | 사용할 수 없음 | Không khả dụng |
| ● | `settings.location.permissionStates.error` | Could not check permission | 확인 실패 | Không kiểm tra được quyền |
|  | `settings.location.request` | Request location permission | 위치 권한 요청 | Yêu cầu quyền vị trí |
|  | `settings.location.openSettings` | Open device settings | 기기 설정 열기 | Mở cài đặt thiết bị |
|  | `settings.location.retry` | Check again | 다시 확인 | Kiểm tra lại |
| ● | `settings.location.settingsError` | Could not open device settings. Please try again. | 기기 설정을 열지 못했습니다. 다시 시도해 주세요. | Không thể mở cài đặt thiết bị. Vui lòng thử lại. |
| ● | `settings.location.permissionNotice` | Change or revoke permission in device settings. This screen does not start location tracking. | 권한 변경·해제는 기기 설정에서 할 수 있습니다. 이 화면에서는 위치 추적을 시작하지 않습니다. | Thay đổi hoặc thu hồi quyền trong cài đặt thiết bị. Màn hình này không bắt đầu theo dõi vị trí. |
|  | `settings.location.capability.loading` | Checking availability | 사용 가능 여부 확인 중 | Đang kiểm tra khả năng sử dụng |
|  | `settings.location.capability.granted` | Location permission allows use | 위치 권한이 있어 사용 가능 | Có quyền vị trí nên có thể sử dụng |
| ● | `settings.location.capability.denied` | Location permission required | 위치 권한이 필요함 | Cần quyền vị trí |
|  | `settings.location.capability.restricted` | Permission must be allowed in device settings | 기기 설정에서 위치 권한 허용이 필요함 | Cần cho phép quyền trong cài đặt thiết bị |
|  | `settings.location.capability.unavailable` | Unavailable on this device | 현재 기기에서 사용할 수 없음 | Không khả dụng trên thiết bị này |
| ● | `settings.location.capability.error` | Could not check availability | 사용 가능 여부 확인 실패 | Không kiểm tra được khả năng sử dụng |
|  | `settings.location.foregroundDescription` | Not supported. A policy for saving this choice is not available. This is separate from periodic location collection. | 지원되지 않음 · 이 선택을 저장할 정책이 아직 없습니다. 주기적인 위치 수집과는 별개입니다. | Chưa hỗ trợ. Chưa có chính sách lưu lựa chọn này. Mục này tách biệt với việc thu thập vị trí định kỳ. |
|  | `settings.location.footprintDescription` | Coming soon. A map of your location history is not available yet. | 준비 중 · 내 위치 기록을 보여주는 지도는 아직 지원하지 않습니다. | Sắp ra mắt. Bản đồ lịch sử vị trí của bạn chưa khả dụng. |
|  | `settings.location.visibilityDescription` | Not supported. Profile visibility cannot be saved yet. | 지원되지 않음 · 프로필 공개 범위를 저장하는 기능이 아직 없습니다. | Chưa hỗ trợ. Chưa thể lưu phạm vi hiển thị hồ sơ. |
|  | `settings.location.nicknameDescription` | Not supported. Nickname visibility cannot be saved yet. | 지원되지 않음 · 닉네임 표시 여부를 저장하는 기능이 아직 없습니다. | Chưa hỗ trợ. Chưa thể lưu việc hiển thị biệt danh. |
|  | `settings.location.downloadDescription` | Export account information and other supported user data. This is not a location history download. | 계정 정보 등 지원되는 사용자 데이터를 내보냅니다. 위치 기록 다운로드가 아닙니다. | Xuất thông tin tài khoản và dữ liệu người dùng được hỗ trợ khác. Đây không phải là tải lịch sử vị trí. |
| ● | `settings.location.policyDescription` | Coming soon. The approved privacy policy document is not connected yet. | 준비 중 · 승인된 개인정보 처리방침 문서가 아직 연결되지 않았습니다. | Sắp ra mắt. Tài liệu chính sách quyền riêng tư đã phê duyệt chưa được kết nối. |
| ● | `settings.location.deleteDescription` | Not supported. Deleting location history separately is not available. No data will be deleted here. | 지원되지 않음 · 위치 기록만 삭제하는 기능이 아직 없습니다. 여기서는 어떤 데이터도 삭제하지 않습니다. | Chưa hỗ trợ. Chưa thể xóa riêng lịch sử vị trí. Không có dữ liệu nào bị xóa tại đây. |
|  | `settings.logout` | Log out | 로그아웃 | Đăng xuất |
|  | `settings.notifications.hotplace` | A place I recorded becomes popular | 내가 먼저 기록한 장소 급상승 | Địa điểm tôi ghi lại trở nên nổi bật |
|  | `settings.notifications.hotplaceDescription` | Get updates when your First Recorder place is trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | Nhận cập nhật khi địa điểm First Recorder của bạn đang nổi |
|  | `settings.notifications.like` | New activity on my recorded places | 내 기록 장소에 새 반응 | Hoạt động mới ở địa điểm tôi đã ghi lại |
|  | `settings.notifications.likeDescription` | Get updates when people react to your records | 내가 남긴 장소의 새 반응을 알려드려요 | Nhận cập nhật khi mọi người phản hồi ghi chép của bạn |
| ● | `settings.notifications.loadFailed` | Notification settings could not be loaded. | 알림 설정을 불러오지 못했어요. | Không thể tải cài đặt thông báo. |
|  | `settings.notifications.otherSection` | Other | 기타 | Khác |
|  | `settings.notifications.pushAll` | Allow all push notifications | 푸시 알림 전체 허용 | Cho phép tất cả thông báo đẩy |
|  | `settings.notifications.pushAllDescription` | You can still receive important account notices | 끄면 안내 알림만 받을 수 있어요 | Bạn vẫn có thể nhận các thông báo quan trọng về tài khoản |
|  | `settings.notifications.quiet` | Quiet hours | 야간 알림 받기 | Giờ yên lặng |
|  | `settings.notifications.quietDescription` | Use the quiet hours saved to your account | 계정에 저장된 방해 금지 시간을 사용해요 | Dùng giờ yên lặng đã lưu trong tài khoản của bạn |
|  | `settings.notifications.recordsSection` | My records & places | 내 기록 · 장소 | Ghi chép & địa điểm của tôi |
|  | `settings.notifications.title` | Notification settings | 알림 설정 | Cài đặt thông báo |
| ● | `settings.notifications.updateFailedDescription` | Your previous setting was restored. Please try again. | 이전 설정으로 되돌렸어요. 다시 시도해주세요. | Cài đặt trước đó của bạn đã được khôi phục. Vui lòng thử lại. |
| ● | `settings.notifications.updateFailedTitle` | Could not update notifications | 알림 설정을 변경하지 못했어요 | Không thể cập nhật thông báo |
|  | `settings.pending.back` | Back to settings | 설정으로 돌아가기 | Quay lại cài đặt |
|  | `settings.pending.title` | Coming soon | 준비 중인 기능입니다 | Sắp ra mắt |
|  | `settings.rows.accountInfo` | Username · Email | 아이디 · 이메일 | Tên đăng nhập · Email |
|  | `settings.rows.dataManagement` | Download · delete data | 데이터 다운로드 · 삭제 | Tải xuống · xóa dữ liệu |
|  | `settings.rows.favoritePlaces` | Manage favorite places | 관심 장소 관리 | Quản lý địa điểm yêu thích |
|  | `settings.rows.footprintMap` | My footprint map | 내 발자국 지도 | Bản đồ dấu chân của tôi |
|  | `settings.rows.locationSettings` | Location settings | 위치 정보 설정 | Cài đặt vị trí |
|  | `settings.rows.myRecords` | Manage my records | 내 기록 관리 | Quản lý ghi chép của tôi |
| ● | `settings.rows.notices` | Notices | 공지사항 | Thông báo |
|  | `settings.rows.notificationSettings` | Notification settings | 알림 설정 | Cài đặt thông báo |
|  | `settings.rows.password` | Change password | 비밀번호 변경 | Đổi mật khẩu |
| ● | `settings.rows.privacyPolicy` | Privacy policy | 개인정보 처리방침 | Chính sách quyền riêng tư |
|  | `settings.rows.profileEdit` | Edit profile | 프로필 편집 | Chỉnh sửa hồ sơ |
| ● | `settings.rows.terms` | Terms of use | 이용약관 | Điều khoản sử dụng |
|  | `settings.rows.version` | Version | 버전 정보 | Phiên bản |
|  | `settings.sections.account` | Account | 계정 | Tài khoản |
|  | `settings.sections.appInfo` | App information | 앱 정보 | Thông tin ứng dụng |
|  | `settings.sections.notifications` | Notifications | 알림 | Thông báo |
|  | `settings.sections.preferences` | Preferences | 환경설정 | Tùy chọn |
| ● | `settings.sections.privacy` | Privacy · location | 개인정보 · 위치 | Quyền riêng tư · vị trí |
|  | `settings.sections.records` | Records · places | 기록 · 장소 | Ghi chép · địa điểm |
|  | `settings.title` | Settings | 설정 | Cài đặt |
|  | `settings.values.everyone` | Everyone | 전체 공개 | Mọi người |
|  | `settings.values.notConnected` | Not connected | 연결 전 | Chưa kết nối |
|  | `settings.values.off` | Off | 꺼짐 | Tắt |
|  | `settings.values.on` | On | 켜짐 | Bật |
|  | `settings.values.onlyMe` | Only me | 나만 보기 | Chỉ mình tôi |

## `merchantMyPage`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `merchantMyPage.back` | Back | 뒤로가기 | Quay lại |
|  | `merchantMyPage.settings` | Settings | 설정 | Cài đặt |
|  | `merchantMyPage.title` | My page | 마이 페이지 | Trang của tôi |
| ● | `merchantMyPage.roleLabel` | Business owner | 사업자 | Chủ doanh nghiệp |
|  | `merchantMyPage.loading` | Loading your store | 가게 정보를 불러오는 중 | Đang tải cửa hàng của bạn |
| ● | `merchantMyPage.loadError` | Could not load your store. | 가게 정보를 불러오지 못했어요. | Không thể tải cửa hàng của bạn. |
|  | `merchantMyPage.retry` | Try again | 다시 시도 | Thử lại |
|  | `merchantMyPage.review.author` | Visitor #{{id}} | 이용인 #{{id}} | Khách #{{id}} |
|  | `merchantMyPage.review.time` | {{date}} · {{relative}} | {{date}} · {{relative}} | {{date}} · {{relative}} |
|  | `merchantMyPage.noStore` | No store is linked to this account yet. | 아직 연결된 가게가 없어요. | Chưa có cửa hàng nào được liên kết với tài khoản này. |
|  | `merchantMyPage.store.title` | My store | 나의 가게 | Cửa hàng của tôi |
|  | `merchantMyPage.store.verifiedCount` | {{count}} people verified this! | {{count}}명이 검증했어요! | {{count}} người đã xác minh! |
|  | `merchantMyPage.store.address` | Location | 위치 | Vị trí |
|  | `merchantMyPage.store.businessHours` | Business hours | 영업 시간 | Giờ mở cửa |
|  | `merchantMyPage.store.phoneNumber` | Phone number | 전화번호 | Số điện thoại |
|  | `merchantMyPage.store.editField` | Edit {{field}} | {{field}} 수정 | Sửa {{field}} |
|  | `merchantMyPage.store.features.englishSupport` | English available | 영어응대 가능 | Hỗ trợ tiếng Anh |
|  | `merchantMyPage.store.features.parking` | Parking available | 주차가능 | Có chỗ đỗ xe |
|  | `merchantMyPage.reviews.title` | Reviews | 리뷰 | Đánh giá |
|  | `merchantMyPage.reviews.viewAll` | See all reviews | 리뷰 모두 보기 | Xem tất cả đánh giá |
|  | `merchantMyPage.reviews.empty` | No reviews yet | 아직 리뷰가 없어요 | Chưa có đánh giá nào |
|  | `merchantMyPage.events.title` | Event management | 이벤트 관리 | Quản lý sự kiện |
|  | `merchantMyPage.events.subtitle` | Currently running events | 현재 진행중인 이벤트 | Sự kiện đang diễn ra |
|  | `merchantMyPage.events.create` | New event | 새 이벤트 | Sự kiện mới |
| ● | `merchantMyPage.events.delete` | Delete event | 이벤트 삭제 | Xóa sự kiện |
|  | `merchantMyPage.events.empty` | No events yet | 아직 이벤트가 없어요 | Chưa có sự kiện nào |
|  | `merchantMyPage.events.closeConfirmTitle` | Close this event? | 이벤트를 종료할까요? | Kết thúc sự kiện này? |
|  | `merchantMyPage.events.closeConfirmBody` | Closed events can no longer be issued to tourists. | 종료한 이벤트는 더 이상 관광객에게 발급되지 않아요. | Sự kiện đã kết thúc sẽ không còn được phát cho du khách. |
|  | `merchantMyPage.events.closeConfirm` | Close | 종료 | Kết thúc |
|  | `merchantMyPage.events.closeCancel` | Cancel | 취소 | Hủy |
| ● | `merchantMyPage.events.closeFailed` | Could not close the event. | 이벤트를 종료하지 못했어요. | Không thể kết thúc sự kiện. |
|  | `merchantMyPage.events.status.ongoing` | Ongoing | 진행중 | Đang diễn ra |
|  | `merchantMyPage.events.status.ended` | Ended | 종료 | Đã kết thúc |
|  | `merchantMyPage.events.status.upcoming` | Upcoming | 예정됨 | Sắp diễn ra |

## `placeDetail`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `placeDetail.back` | Back | 뒤로 | Quay lại |
|  | `placeDetail.couponUsage` | Coupon use: {{value}} | 쿠폰 사용: {{value}} | Dùng phiếu ưu đãi: {{value}} |
|  | `placeDetail.englishMenu` | English menu: {{value}} | 영문 메뉴: {{value}} | Thực đơn tiếng Anh: {{value}} |
|  | `placeDetail.languages` | Languages: {{value}} | 지원 언어: {{value}} | Ngôn ngữ: {{value}} |
|  | `placeDetail.liveStatus` | Live status | 실시간 상태 | Trạng thái trực tiếp |
|  | `placeDetail.loading` | Loading place details... | 장소 상세를 불러오는 중입니다... | Đang tải chi tiết địa điểm... |
|  | `placeDetail.offer.eligibility` | Who can claim: {{value}} | 발급 대상: {{value}} | Đối tượng nhận: {{value}} |
|  | `placeDetail.offer.expiry` | Valid: {{value}} | 유효 기간: {{value}} | Hiệu lực: {{value}} |
|  | `placeDetail.offer.title` | Coupon offer | 쿠폰 혜택 | Ưu đãi phiếu giảm giá |
|  | `placeDetail.operating.beforeOpen` | Not open yet | 영업 전 | Chưa mở cửa |
|  | `placeDetail.operating.closed` | Closed | 영업 종료 | Đã đóng cửa |
|  | `placeDetail.operating.closedToday` | Closed today | 오늘 휴무 | Hôm nay nghỉ |
|  | `placeDetail.operating.closesAt` | Closes at {{time}} | {{time}}에 영업 종료 | Đóng cửa lúc {{time}} |
|  | `placeDetail.operating.open` | Open | 영업 중 | Đang mở cửa |
|  | `placeDetail.operating.opensAt` | Opens at {{time}} | {{time}}에 영업 시작 | Mở cửa lúc {{time}} |
|  | `placeDetail.operating.opensLaterAt` | Opens on the next business day at {{time}} | 다음 영업일 {{time}}에 영업 시작 | Mở cửa vào ngày làm việc tiếp theo lúc {{time}} |
|  | `placeDetail.operating.opensTomorrowAt` | Opens tomorrow at {{time}} | 내일 {{time}}에 영업 시작 | Mở cửa ngày mai lúc {{time}} |
|  | `placeDetail.operating.permanentlyClosed` | Permanently closed | 폐업 | Đã đóng cửa vĩnh viễn |
|  | `placeDetail.operating.temporarilyClosed` | Temporarily closed | 임시 휴무 | Tạm đóng cửa |
|  | `placeDetail.operating.unknown` | Hours unavailable | 영업시간 정보 없음 | Chưa có giờ mở cửa |
|  | `placeDetail.review.anonymousUser` | User | 사용자 | Người dùng |
|  | `placeDetail.verification.admin` | Administrator verified | 관리자 확인 정보 | Đã được quản trị viên xác minh |
|  | `placeDetail.verification.owner` | Provided by the business | 사업자 제공 정보 | Do doanh nghiệp cung cấp |
|  | `placeDetail.verification.source` | Source verified | 출처 확인 정보 | Nguồn đã được xác minh |
|  | `placeDetail.touristSupport` | Tourist support | 관광객 지원 | Hỗ trợ du khách |
|  | `placeDetail.trust` | Trust | 신뢰 정보 | Độ tin cậy |
|  | `placeDetail.trustScore` | {{score}}/100 · {{confidence}} confidence | {{score}}/100 · 신뢰도 {{confidence}} | {{score}}/100 · độ tin cậy {{confidence}} |
|  | `placeDetail.unknownValue` | Unknown | 알 수 없음 | Không rõ |
|  | `placeDetail.waitMinutes_one` | {{count}} minute | {{count}}분 | {{count}} phút |
|  | `placeDetail.waitMinutes_other` | {{count}} minutes | {{count}}분 | {{count}} phút |
|  | `placeDetail.waitTime` | Estimated wait: {{value}} | 예상 대기: {{value}} | Thời gian chờ ước tính: {{value}} |

## `placeOffers`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `placeOffers.title` | Tourist coupon | 관광객 쿠폰 | Phiếu ưu đãi cho du khách |
|  | `placeOffers.loading` | Checking available coupons... | 받을 수 있는 쿠폰을 확인하고 있습니다... | Đang kiểm tra phiếu ưu đãi khả dụng... |
|  | `placeOffers.empty.title` | No coupons available | 받을 수 있는 쿠폰이 없습니다 | Không có phiếu ưu đãi khả dụng |
|  | `placeOffers.empty.description` | There is no issuable coupon for this place right now. | 지금 이 장소에서 발급 가능한 쿠폰이 없습니다. | Hiện địa điểm này chưa có phiếu ưu đãi nào có thể nhận. |
|  | `placeOffers.auth.description` | Sign in to check and issue this coupon. | 쿠폰을 확인하고 발급받으려면 로그인하세요. | Đăng nhập để xem và nhận phiếu ưu đãi này. |
|  | `placeOffers.auth.action` | Sign in | 로그인 | Đăng nhập |
| ● | `placeOffers.detail.benefitLabel` | Benefit | 혜택 | Ưu đãi |
| ● | `placeOffers.detail.periodLabel` | Issuable period | 발급 기간 | Thời gian nhận |
| ● | `placeOffers.detail.validityLabel` | Valid after issue | 발급 후 사용 기간 | Hiệu lực sau khi nhận |
| ● | `placeOffers.detail.inventoryLabel` | Remaining | 남은 수량 | Còn lại |
| ● | `placeOffers.detail.eligibilityLabel` | Eligibility | 발급 대상 | Điều kiện |
|  | `placeOffers.detail.periodUnavailable` | Period unavailable | 기간 정보 없음 | Chưa có thông tin thời gian |
|  | `placeOffers.detail.inventoryUnlimited` | No limit | 수량 제한 없음 | Không giới hạn |
|  | `placeOffers.detail.inventoryRemaining_one` | {{count}} left | {{count}}개 남음 | Còn {{count}} |
|  | `placeOffers.detail.inventoryRemaining_other` | {{count}} left | {{count}}개 남음 | Còn {{count}} |
|  | `placeOffers.detail.eligibilityActiveTravelSchedule` | Travelers with an active trip schedule | 여행 일정이 활성화된 여행자 | Du khách có lịch trình chuyến đi đang diễn ra |
|  | `placeOffers.detail.eligibilityPublic` | Anyone | 누구나 | Mọi người |
|  | `placeOffers.detail.eligibilityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | Xem điều khoản ưu đãi |
|  | `placeOffers.detail.validityDays_one` | Use within {{count}} day of issue | 발급 후 {{count}}일 이내 사용 | Dùng trong vòng {{count}} ngày kể từ khi nhận |
|  | `placeOffers.detail.validityDays_other` | Use within {{count}} days of issue | 발급 후 {{count}}일 이내 사용 | Dùng trong vòng {{count}} ngày kể từ khi nhận |
|  | `placeOffers.detail.validityOfferEnd` | Valid until the offer ends | 혜택 종료일까지 사용 가능 | Có hiệu lực đến khi ưu đãi kết thúc |
|  | `placeOffers.detail.validityOfferEndOn` | Valid until {{date}} | {{date}}까지 사용 가능 | Có hiệu lực đến {{date}} |
|  | `placeOffers.detail.validityCapped` | Capped by the offer end date | 혜택 종료일까지로 제한됨 | Giới hạn đến ngày ưu đãi kết thúc |
|  | `placeOffers.detail.validityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | Xem điều khoản ưu đãi |
|  | `placeOffers.cta.issue` | Get coupon | 쿠폰 받기 | Nhận phiếu ưu đãi |
|  | `placeOffers.cta.issuing` | Issuing... | 발급 중... | Đang nhận... |
| ● | `placeOffers.cta.a11yIssue` | Get coupon for {{offer}} | {{offer}} 쿠폰 받기 | Nhận phiếu ưu đãi cho {{offer}} |
| ● | `placeOffers.cta.a11yIssuing` | Issuing coupon | 쿠폰 발급 중 | Đang nhận phiếu ưu đãi |
| ● | `placeOffers.error.eligibility` | This coupon is for eligible travelers only. | 이 쿠폰은 발급 대상 여행자만 받을 수 있습니다. | Phiếu ưu đãi này chỉ dành cho du khách đủ điều kiện. |
| ● | `placeOffers.error.notFound` | This offer is no longer available. | 이 혜택은 더 이상 발급할 수 없습니다. | Ưu đãi này không còn khả dụng. |
| ● | `placeOffers.error.conflictDuplicate` | You already issued this coupon. | 이미 발급받은 쿠폰입니다. | Bạn đã nhận phiếu ưu đãi này rồi. |
| ● | `placeOffers.error.conflictWindowClosed` | The issuance window for this coupon has closed. | 이 쿠폰의 발급 기간이 종료되었습니다. | Thời gian nhận phiếu ưu đãi này đã kết thúc. |
| ● | `placeOffers.error.conflictStockOut` | This coupon is out of stock. | 이 쿠폰이 모두 소진되었습니다. | Phiếu ưu đãi này đã hết. |
| ● | `placeOffers.error.conflictUnknown` | This coupon could not be issued. Please try again later. | 쿠폰을 발급하지 못했습니다. 잠시 후 다시 시도해 주세요. | Không thể nhận phiếu ưu đãi này. Vui lòng thử lại sau. |
|  | `placeOffers.success.title` | Coupon issued | 쿠폰이 발급되었습니다 | Đã nhận phiếu ưu đãi |
|  | `placeOffers.success.description` | Your coupon is ready. | 쿠폰이 준비되었습니다. | Phiếu ưu đãi của bạn đã sẵn sàng. |
|  | `placeOffers.success.code` | Code | 코드 | Mã |
|  | `placeOffers.success.expiry` | Expires | 만료 | Hết hạn |
| ● | `placeOffers.success.hint` | Find it later in My coupons. | 내 쿠폰에서 다시 확인할 수 있습니다. | Xem lại sau trong mục Phiếu của tôi. |
|  | `placeOffers.success.viewAction` | View my coupons | 내 쿠폰 보기 | Xem phiếu của tôi |
|  | `placeOffers.success.issueAnother` | Get another coupon | 다른 쿠폰 받기 | Nhận phiếu ưu đãi khác |

## `placeStatus`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `placeStatus.closed` | Permanently closed | 폐업 | Đã đóng cửa vĩnh viễn |
|  | `placeStatus.open` | Operating | 영업 중 | Đang hoạt động |
|  | `placeStatus.temporarilyClosed` | Temporarily closed | 임시 휴무 | Tạm đóng cửa |
|  | `placeStatus.unknown` | Status unknown | 상태 알 수 없음 | Chưa rõ trạng thái |

## `placeSupport`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `placeSupport.available` | Available | 가능 | Có |
|  | `placeSupport.unavailable` | Unavailable | 불가능 | Không có |
|  | `placeSupport.unknown` | Unknown | 알 수 없음 | Không rõ |

## `placeTrust`

| 우선 | 키 | en | ko | vi |
|---|---|---|---|---|
|  | `placeTrust.confidence.high` | High | 높음 | Cao |
|  | `placeTrust.confidence.low` | Low | 낮음 | Thấp |
|  | `placeTrust.confidence.medium` | Medium | 보통 | Trung bình |
|  | `placeTrust.confidence.unknown` | Unknown | 알 수 없음 | Không rõ |
