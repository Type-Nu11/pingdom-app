# #413 중국어 간체·번체 번역 검수 대상 키

> 상태: **기계 번역 초안 · 사람 검수 필요**. 이 문서의 모든 zh-CN · zh-TW 문구는 검수 전이다.
> 문체: 평서형 안내문, 2인칭 你(您 미사용). 용어: 검증/verify → 验证·驗證, 쿠폰 → 优惠券·優惠券, 쿠폰함 → 优惠券包·優惠券匣, 예약 → 预约·預約, 체크인 → 签到·打卡, 설정 → 设置·設定. 번체는 대만 용어(登入·帳號·搜尋·載入·網路·資訊·使用者) 기준으로 간체와 별도 번역했다. 브랜드 PingDom·Pingdy는 모든 언어에서 원문 표기.
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

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `mapTutorial.name` | Pingdy | Pingdy | Pingdy | Pingdy |
|  | `mapTutorial.title` | Meet Pingdy | Pingdy 사용 안내 | Pingdy 使用指南 | Pingdy 使用說明 |
|  | `mapTutorial.guest` | traveler | 여행자 | 旅行者 | 旅人 |
|  | `mapTutorial.close` | Close tutorial | 튜토리얼 닫기 | 关闭教程 | 關閉教學 |
|  | `mapTutorial.previous` | Previous tip | 이전 안내 | 上一条提示 | 上一則提示 |
|  | `mapTutorial.next` | Next tip | 다음 안내 | 下一条提示 | 下一則提示 |
|  | `mapTutorial.finish` | Finish tutorial | 튜토리얼 완료 | 完成教程 | 完成教學 |
|  | `mapTutorial.progress` | Step {{current}} of {{total}} | {{current}} / {{total}} 단계 | 第 {{current}} 步，共 {{total}} 步 | 第 {{current}} 步，共 {{total}} 步 |
|  | `mapTutorial.welcome.greeting` | Hello, {{username}}! | 안녕하세요, {{username}}님 | 你好，{{username}}！ | {{username}}，你好！ |
|  | `mapTutorial.welcome.introduction` | Here to make your travels easier, | {{username}}님의 여행을 더 쉽게 만들어드리는 | 让你的旅行更轻松， | 讓你的旅程更輕鬆， |
|  | `mapTutorial.welcome.agent` | I’m <accent>Pingdy</accent>, your AI agent. | AI 에이전트, <accent>Pingdy</accent>예요. | 我是 AI 助手 <accent>Pingdy</accent>。 | 我是 AI 助理 <accent>Pingdy</accent>。 |
|  | `mapTutorial.welcome.help` | From finding places to preparing reservations,<br>I can help with a conversation. | 원하는 장소를 찾고, 예약을 준비하는 과정까지<br>대화 한번으로 도와드릴게요. | 从寻找想去的地方到准备预约，<br>只需一次对话我就能帮你。 | 從尋找想去的地點到準備預約，<br>只要一段對話就能幫你完成。 |
|  | `mapTutorial.welcome.start` | Let me give you a quick tour! | 지금부터 간단히 사용법을 알려드릴게요! | 现在带你快速了解一下用法！ | 現在就帶你快速認識使用方式！ |
|  | `mapTutorial.map.prompt` | Tap the <accent>Map button</accent>. | <accent>지도 버튼</accent>을 눌러보세요. | 请点按<accent>地图按钮</accent>。 | 請點一下<accent>地圖按鈕</accent>。 |
|  | `mapTutorial.map.body` | Discover pins around you, plus popular places<br>in your area and across the country. | 내 주변의 핑들을 확인할 수 있어요.<br>또한 우리 지역과 전국 트렌드 장소도 볼 수 있어요. | 可以查看你周边的标记点，<br>还能看到本地和全国的热门地点。 | 可以查看你附近的標記點，<br>也能看到在地與全國的熱門地點。 |
|  | `mapTutorial.favorites.prompt` | Tap the <accent>Favorites button</accent>. | <accent>즐겨찾기 버튼</accent>을 눌러보세요. | 请点按<accent>收藏按钮</accent>。 | 請點一下<accent>收藏按鈕</accent>。 |
|  | `mapTutorial.favorites.body` | Save places you’re interested in<br>and find them again whenever you like. | 관심 있는 장소를 즐겨찾기에 저장하고,<br>언제든 다시 찾아볼 수 있어요. | 把感兴趣的地点加入收藏，<br>随时都能再次查看。 | 把感興趣的地點加入收藏，<br>隨時都能再找出來。 |
|  | `mapTutorial.community.prompt` | Tap the <accent>Community button</accent>. | <accent>커뮤니티 버튼</accent>을 눌러보세요. | 请点按<accent>社区按钮</accent>。 | 請點一下<accent>社群按鈕</accent>。 |
|  | `mapTutorial.community.body` | Explore other travelers’ experiences,<br>and tag places to share your own stories. | 다른 여행자들의 생생한 장소 경험을 확인하고,<br>장소를 태그해 나만의 이야기도 공유할 수 있어요. | 看看其他旅行者的真实体验，<br>也可以标记地点分享你的故事。 | 看看其他旅人的真實體驗，<br>也可以標記地點分享自己的故事。 |
|  | `mapTutorial.reservations.prompt` | Tap the <accent>Reservations button</accent>. | <accent>예약 버튼</accent>을 눌러보세요. | 请点按<accent>预约按钮</accent>。 | 請點一下<accent>預約按鈕</accent>。 |
|  | `mapTutorial.reservations.body` | Check availability at the places you love<br>and book a date and time that works for you. | 원하는 장소의 예약 가능 여부를 확인하고,<br>날짜와 시간에 맞춰 간편하게 예약할 수 있어요. | 确认想去的地点是否可预约，<br>并按合适的日期和时间轻松预约。 | 確認想去的地點是否可預約，<br>並依合適的日期與時間輕鬆預約。 |
|  | `mapTutorial.recommendations.prompt` | Tap the <accent>Recommendations button</accent>. | <accent>장소 추천 버튼</accent>을 눌러보세요. | 请点按<accent>地点推荐按钮</accent>。 | 請點一下<accent>地點推薦按鈕</accent>。 |
|  | `mapTutorial.recommendations.body` | {{username}}, discover personalized places<br>based on your interests and activity. | {{username}}님의 관심사와 이용 상황을 바탕으로<br>개인화된 장소 추천을 받을 수 있어요. | {{username}}，根据你的兴趣和使用情况，<br>为你推荐个性化的地点。 | {{username}}，依據你的興趣與使用情況，<br>為你推薦個人化的地點。 |
|  | `mapTutorial.verification.prompt` | Tap the <accent>Verify button</accent>. | <accent>검증하기 버튼</accent>을 눌러보세요. | 请点按<accent>验证按钮</accent>。 | 請點一下<accent>驗證按鈕</accent>。 |
|  | `mapTutorial.verification.body` | Review the places you’ve visited<br>and verify your experience to help<br>other travelers visit with confidence. | 직접 방문한 장소의 경험을 리뷰로 남기고,<br>다른 여행자들이 믿고 방문할 수 있도록<br>장소를 검증해주세요. | 为你去过的地点写下评价，<br>验证你的体验，<br>让其他旅行者放心前往。 | 為你去過的地點留下評論，<br>驗證你的體驗，<br>讓其他旅人安心前往。 |
|  | `mapTutorial.categories.prompt` | Tap a <accent>category</accent>. | <accent>카테고리</accent>를 눌러보세요. | 请点按一个<accent>分类</accent>。 | 請點一下任一<accent>類別</accent>。 |
|  | `mapTutorial.categories.body` | Choose food, music, or another category<br>to see only the pins that match. | 음식점, 음악 등 원하는 카테고리를 선택하면<br>해당하는 핑들만 골라서 확인할 수 있어요. | 选择美食、音乐等分类，<br>即可只查看对应的标记点。 | 選擇美食、音樂等類別，<br>就能只查看符合的標記點。 |
|  | `mapTutorial.profile.prompt` | Tap <accent>My Page</accent>. | <accent>마이페이지</accent>를 눌러보세요. | 请点按<accent>我的页面</accent>。 | 請點一下<accent>我的頁面</accent>。 |
|  | `mapTutorial.profile.body` | Manage your profile and travel dates,<br>and browse the places you’ve verified. | 내 프로필과 여행 기간을 관리하고,<br>내가 직접 검증한 장소들을 모아 볼 수 있어요. | 管理你的个人资料和旅行日期，<br>并集中查看你验证过的地点。 | 管理你的個人檔案與旅行日期，<br>並一次瀏覽你驗證過的地點。 |

## `offerCoupon`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
| ● | `offerCoupon.error.actions.back` | Go back | 뒤로 가기 | 返回 | 返回 |
| ● | `offerCoupon.error.actions.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
| ● | `offerCoupon.error.actions.signIn` | Sign in again | 다시 로그인 | 重新登录 | 重新登入 |
| ● | `offerCoupon.error.actions.viewWallet` | Check my coupons | 보관함 확인 | 查看我的优惠券 | 查看我的優惠券 |
| ● | `offerCoupon.error.alreadyIssued.description` | You have already issued this coupon. Check it in your coupons. | 이미 발급받은 쿠폰입니다. 보관함에서 확인해 주세요. | 你已领取过这张优惠券。请在优惠券包中查看。 | 你已領取過這張優惠券。請到優惠券匣查看。 |
| ● | `offerCoupon.error.alreadyIssued.title` | Already issued | 이미 발급받았습니다 | 已领取 | 已領取 |
| ● | `offerCoupon.error.alreadyRedeemed.description` | This coupon has already been used and cannot be used again. | 이미 사용한 쿠폰이라 다시 사용할 수 없습니다. | 这张优惠券已使用，无法再次使用。 | 這張優惠券已使用，無法再次使用。 |
| ● | `offerCoupon.error.alreadyRedeemed.title` | Already used | 이미 사용했습니다 | 已使用 | 已使用 |
| ● | `offerCoupon.error.authentication.description` | Your session has expired. Sign in again to continue. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | 登录已过期。请重新登录后继续。 | 登入已過期。請重新登入後繼續。 |
| ● | `offerCoupon.error.authentication.title` | Sign-in required | 로그인이 필요합니다 | 需要登录 | 需要登入 |
| ● | `offerCoupon.error.expired.description` | This coupon’s usable period has ended. | 쿠폰의 사용 기간이 종료되었습니다. | 这张优惠券的使用期限已结束。 | 這張優惠券的使用期限已結束。 |
| ● | `offerCoupon.error.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | 已无法使用 | 已無法使用 |
| ● | `offerCoupon.error.forbidden.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | 此账号没有执行该操作的权限。 | 此帳號沒有執行這項操作的權限。 |
| ● | `offerCoupon.error.forbidden.title` | Permission required | 권한이 필요합니다 | 需要权限 | 需要權限 |
| ● | `offerCoupon.error.generic.description` | Something went wrong on our side. Please try again in a moment. | 서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. | 服务器出现问题。请稍后重试。 | 伺服器發生問題。請稍後再試。 |
| ● | `offerCoupon.error.generic.title` | Could not complete the request | 요청을 처리하지 못했습니다 | 无法完成请求 | 無法完成要求 |
| ● | `offerCoupon.error.ineligible.description` | This offer is not available for your account right now. An active travel schedule may be required. | 지금은 이 Offer를 발급받을 수 없습니다. 진행 중인 여행 일정이 필요할 수 있습니다. | 此账号目前无法领取该优惠。可能需要有进行中的旅行日程。 | 此帳號目前無法領取這項優惠。可能需要有進行中的旅行行程。 |
| ● | `offerCoupon.error.ineligible.title` | Not eligible | 발급 조건을 충족하지 않습니다 | 不符合领取条件 | 不符合領取條件 |
| ● | `offerCoupon.error.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | 无法连接服务器。请检查网络连接后重试。 | 無法連線到伺服器。請確認網路連線後再試一次。 |
| ● | `offerCoupon.error.network.title` | Connection problem | 연결에 문제가 있습니다 | 连接出现问题 | 連線發生問題 |
| ● | `offerCoupon.error.notFound.description` | This offer or coupon is no longer available. Return to the latest list. | 이 Offer 또는 쿠폰을 더 이상 이용할 수 없습니다. 최신 목록으로 돌아가 주세요. | 该优惠或优惠券已无法使用。请返回最新列表。 | 這項優惠或優惠券已無法使用。請返回最新清單。 |
| ● | `offerCoupon.error.notFound.title` | Not found | 항목을 찾을 수 없습니다 | 未找到 | 找不到項目 |
| ● | `offerCoupon.error.redeemInvalidInput.description` | Check the coupon and try scanning it again. | 쿠폰을 확인한 후 다시 스캔해 주세요. | 请确认优惠券后重新扫描。 | 請確認優惠券後重新掃描。 |
| ● | `offerCoupon.error.redeemInvalidInput.title` | Could not process | 처리하지 못했습니다 | 无法处理 | 無法處理 |
| ● | `offerCoupon.error.redeemUsedOrExpired.description` | This coupon has already been used or has expired. | 이미 사용되었거나 만료된 쿠폰입니다. | 这张优惠券已使用或已过期。 | 這張優惠券已使用或已過期。 |
| ● | `offerCoupon.error.redeemUsedOrExpired.title` | Cannot be used | 사용할 수 없습니다 | 无法使用 | 無法使用 |
| ● | `offerCoupon.error.soldOut.description` | All coupons for this offer have been claimed. | 이 Offer의 쿠폰이 모두 소진되었습니다. | 该优惠的优惠券已全部领完。 | 這項優惠的優惠券已全數領完。 |
| ● | `offerCoupon.error.soldOut.title` | Sold out | 수량이 소진되었습니다 | 已领完 | 已領完 |
| ● | `offerCoupon.error.unconfirmedConflict.description` | This offer could not be issued. It may already be in your coupons, or issuing may have closed. | 발급하지 못했습니다. 이미 보관함에 있거나 발급이 마감되었을 수 있습니다. | 无法领取该优惠。可能已在你的优惠券包中，或领取已截止。 | 無法領取這項優惠。可能已在你的優惠券匣中，或領取已截止。 |
| ● | `offerCoupon.error.unconfirmedConflict.title` | Could not issue | 발급하지 못했습니다 | 领取失败 | 無法領取 |
| ● | `offerCoupon.error.updateRequired.description` | Install the latest version to keep using coupons. | 쿠폰을 계속 사용하려면 최신 버전을 설치해 주세요. | 请安装最新版本以继续使用优惠券。 | 請安裝最新版本以繼續使用優惠券。 |
| ● | `offerCoupon.error.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | 需要更新 | 需要更新 |
| ● | `offerCoupon.error.validation.description` | Could not load the list. Please try again. | 목록을 불러오지 못했습니다. 다시 시도해 주세요. | 无法加载列表。请重试。 | 無法載入清單。請再試一次。 |
| ● | `offerCoupon.error.validation.title` | Could not load coupons | 쿠폰을 불러오지 못했습니다 | 无法加载优惠券 | 無法載入優惠券 |
|  | `offerCoupon.place.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Requires an active travel schedule | 진행 중인 여행 일정이 필요합니다 | 需要有进行中的旅行日程 | 需要有進行中的旅行行程 |
|  | `offerCoupon.place.eligibility.PUBLIC` | Available to all eligible visitors | 발급 가능한 방문객 모두 이용할 수 있습니다 | 所有符合条件的访客均可使用 | 所有符合條件的訪客皆可使用 |
|  | `offerCoupon.place.emptyDescription` | There are no coupons available for this place right now. | 현재 이 장소에서 발급받을 수 있는 쿠폰이 없습니다. | 此地点目前没有可领取的优惠券。 | 此地點目前沒有可領取的優惠券。 |
|  | `offerCoupon.place.emptyTitle` | No available offers | 발급 가능한 Offer가 없습니다 | 暂无可领取的优惠 | 目前沒有可領取的優惠 |
|  | `offerCoupon.place.inventoryRemaining` | {{count}} remaining | {{count}}개 남음 | 剩余 {{count}} 张 | 剩餘 {{count}} 張 |
|  | `offerCoupon.place.inventoryUnlimited` | No quantity limit | 수량 제한 없음 | 数量不限 | 數量不限 |
|  | `offerCoupon.place.issue` | Get coupon | 쿠폰 받기 | 领取优惠券 | 領取優惠券 |
|  | `offerCoupon.place.loading` | Loading available coupons… | 발급 가능한 쿠폰을 불러오는 중… | 正在加载可领取的优惠券… | 正在載入可領取的優惠券… |
|  | `offerCoupon.place.period` | Issue period: {{value}} | 발급 기간: {{value}} | 领取期间：{{value}} | 領取期間：{{value}} |
|  | `offerCoupon.place.periodUnknown` | Schedule unavailable | 기간 정보 없음 | 暂无期间信息 | 無期間資訊 |
|  | `offerCoupon.place.successDescription` | The issued coupon is ready in your coupon wallet. | 발급된 쿠폰을 보관함에서 바로 확인할 수 있습니다. | 已领取的优惠券可在优惠券包中立即查看。 | 已領取的優惠券可立即在優惠券匣中查看。 |
|  | `offerCoupon.place.successTitle` | Coupon issued | 쿠폰을 발급했습니다 | 优惠券已领取 | 已領取優惠券 |
|  | `offerCoupon.place.untitled` | Coupon offer | 쿠폰 Offer | 优惠券优惠 | 優惠券優惠 |
|  | `offerCoupon.place.validityDays` | Valid for {{count}} day after issue | 발급 후 {{count}}일 동안 사용 가능 | 领取后 {{count}} 天内有效 | 領取後 {{count}} 天內有效 |
|  | `offerCoupon.place.validityDays_other` | Valid for {{count}} days after issue | 발급 후 {{count}}일 동안 사용 가능 | 领取后 {{count}} 天内有效 | 領取後 {{count}} 天內有效 |

## `reservation`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `reservation.common.back` | Go back | 뒤로 가기 | 返回 | 返回 |
|  | `reservation.common.favorites` | Favorites | 즐겨찾기 | 收藏 | 收藏 |
|  | `reservation.common.map` | Map | 지도 | 地图 | 地圖 |
|  | `reservation.common.recommendations` | Place recommendations | 장소추천 | 地点推荐 | 地點推薦 |
|  | `reservation.common.reservations` | Reservations | 예약 | 预约 | 預約 |
|  | `reservation.box.count` | {{count}} reservations | 보유 예약 {{count}}건 | 共 {{count}} 个预约 | 共 {{count}} 筆預約 |
|  | `reservation.box.empty` | No reservations yet. | 아직 예약 내역이 없어요. | 还没有预约记录。 | 目前還沒有預約紀錄。 |
| ● | `reservation.box.error` | Could not load your reservations. | 예약함을 불러오지 못했어요. | 无法加载你的预约。 | 無法載入你的預約。 |
|  | `reservation.box.loading` | Loading reservations… | 예약함을 불러오는 중이에요… | 正在加载预约… | 正在載入預約… |
|  | `reservation.box.productIcon` | R | R | R | R |
|  | `reservation.box.settings` | Open settings | 설정 열기 | 打开设置 | 開啟設定 |
|  | `reservation.box.title` | Reservations | 예약함 | 我的预约 | 我的預約 |
|  | `reservation.create.availabilityEmpty` | No availability has been published for this place. | 이 장소에 등록된 예약 가능 일정이 없습니다. | 此地点尚未发布可预约的时段。 | 此地點尚未公布可預約的時段。 |
| ● | `reservation.create.availabilityError` | Could not load availability. | 예약 가능 일정을 불러오지 못했습니다. | 无法加载可预约时段。 | 無法載入可預約時段。 |
|  | `reservation.create.availabilityLoading` | Loading availability… | 예약 가능 일정을 불러오는 중이에요… | 正在加载可预约时段… | 正在載入可預約時段… |
|  | `reservation.create.afternoon` | PM | 오후 | 下午 | 下午 |
|  | `reservation.create.available` | Available | 가능 | 可预约 | 可預約 |
| ● | `reservation.create.availableDateLabel` | {{date}}, available | {{date}}, 예약 가능 | {{date}}，可预约 | {{date}}，可預約 |
| ● | `reservation.create.availableDateCapacityLabel` | {{date}}, {{count}} spots remaining | {{date}}, 잔여 {{count}}명 | {{date}}，剩余 {{count}} 个名额 | {{date}}，剩餘 {{count}} 個名額 |
|  | `reservation.create.backToMap` | Go back | 돌아가기 | 返回 | 返回 |
| ● | `reservation.create.booker.errors.nameRequired` | Enter the booker name. | 예약자 이름을 입력해 주세요. | 请输入预约人姓名。 | 請輸入預約人姓名。 |
| ● | `reservation.create.booker.errors.nameTooLong` | Use 100 characters or fewer. | 100자 이내로 입력해 주세요. | 请输入不超过 100 个字符。 | 請輸入 100 個字元以內。 |
| ● | `reservation.create.booker.errors.noteTooLong` | Use 500 characters or fewer. | 500자 이내로 입력해 주세요. | 请输入不超过 500 个字符。 | 請輸入 500 個字元以內。 |
| ● | `reservation.create.booker.errors.phoneInvalid` | Use digits and + ( ) - spaces only. | 숫자와 + ( ) - 공백만 입력할 수 있어요. | 只能输入数字、+ ( ) - 和空格。 | 只能輸入數字、+ ( ) - 與空格。 |
| ● | `reservation.create.booker.errors.phoneRequired` | Enter a contact number. | 연락처를 입력해 주세요. | 请输入联系电话。 | 請輸入聯絡電話。 |
| ● | `reservation.create.booker.errors.phoneTooLong` | Use 30 characters or fewer. | 30자 이내로 입력해 주세요. | 请输入不超过 30 个字符。 | 請輸入 30 個字元以內。 |
|  | `reservation.create.booker.name` | Booker name | 예약자 이름 | 预约人姓名 | 預約人姓名 |
|  | `reservation.create.booker.namePlaceholder` | Name for the reservation | 예약자 이름 | 预约使用的姓名 | 預約使用的姓名 |
|  | `reservation.create.booker.note` | Requests | 요청 사항 | 备注需求 | 備註需求 |
|  | `reservation.create.booker.noteOptional` | Optional | 선택 | 选填 | 選填 |
|  | `reservation.create.booker.notePlaceholder` | Anything the place should know | 장소에 전달할 요청 사항 | 需要告知商家的事项 | 想讓店家知道的事項 |
|  | `reservation.create.booker.phone` | Contact number | 연락처 | 联系电话 | 聯絡電話 |
|  | `reservation.create.booker.phonePlaceholder` | Phone number | 전화번호 | 电话号码 | 電話號碼 |
|  | `reservation.create.booker.title` | Booker details | 예약자 정보 | 预约人信息 | 預約人資訊 |
|  | `reservation.create.date` | Select date | 날짜 선택 | 选择日期 | 選擇日期 |
|  | `reservation.create.loadingPlace` | Loading place | 장소 불러오는 중 | 正在加载地点 | 正在載入地點 |
|  | `reservation.create.morning` | AM | 오전 | 上午 | 上午 |
|  | `reservation.create.nextMonth` | Next month | 다음 달 | 下个月 | 下個月 |
|  | `reservation.create.noCapacityForQuantity` | No current times can accommodate {{count}} guests. Review the published schedule and unavailable reasons below. | 현재 {{count}}명이 예약 가능한 시간은 없습니다. 아래에서 등록된 일정과 예약 불가 사유를 확인해 주세요. | 目前没有可容纳 {{count}} 人的时段。请在下方查看已发布的时段和无法预约的原因。 | 目前沒有可容納 {{count}} 人的時段。請在下方查看已公布的時段與無法預約的原因。 |
|  | `reservation.create.noTimes` | No available times for this date. | 선택한 날짜에 예약 가능한 시간이 없습니다. | 所选日期没有可预约的时间。 | 所選日期沒有可預約的時間。 |
|  | `reservation.create.noTimesInPeriod` | No times are available in this period. | 선택한 시간대에 등록된 일정이 없습니다. | 该时段内没有已发布的时间。 | 這個時段內沒有已公布的時間。 |
|  | `reservation.create.people` | Guests | 인원 선택 | 选择人数 | 選擇人數 |
|  | `reservation.create.peopleCount` | {{count}} | {{count}}명 | {{count}} 人 | {{count}} 人 |
|  | `reservation.create.peopleRange` | Booking for 1–12 guests · {{category}} | 예약인원: 1~12명 · {{category}} | 可预约人数：1～12 人 · {{category}} | 可預約人數：1～12 人 · {{category}} |
|  | `reservation.create.previousMonth` | Previous month | 이전 달 | 上个月 | 上個月 |
|  | `reservation.create.productInfoUnavailable` | This item can't be reserved right now because its product details are unavailable. | 상품 정보를 불러올 수 없어 현재 예약할 수 없습니다. | 无法获取商品信息，目前不能预约。 | 無法取得商品資訊，目前無法預約。 |
|  | `reservation.create.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `reservation.create.requestNote` | Request (optional) | 요청사항 (선택) | 备注需求（选填） | 備註需求（選填） |
|  | `reservation.create.requestNotePlaceholder` | Add anything the venue should know | 장소에 전달할 내용을 입력하세요 | 请输入需要告知商家的内容 | 請輸入想讓店家知道的內容 |
|  | `reservation.create.scheduled` | Scheduled | 일정 있음 | 有时段 | 有時段 |
| ● | `reservation.create.scheduledDateLabel` | {{date}}, schedules published | {{date}}, 일정 있음 | {{date}}，已发布时段 | {{date}}，已公布時段 |
|  | `reservation.create.selectAvailableDate` | Select an available date. | 예약 가능한 날짜를 선택해 주세요. | 请选择可预约的日期。 | 請選擇可預約的日期。 |
|  | `reservation.create.selectedWindow` | Selected date & time | 선택한 일시 | 已选日期和时间 | 已選日期與時間 |
|  | `reservation.create.slotAvailable` | {{count}} spots remaining · Available | 잔여 {{count}}명 · 예약 가능 | 剩余 {{count}} 个名额 · 可预约 | 剩餘 {{count}} 個名額 · 可預約 |
|  | `reservation.create.slotInactive` | Unavailable · Inactive | 예약 불가 · 비활성 일정 | 无法预约 · 时段未启用 | 無法預約 · 時段未啟用 |
|  | `reservation.create.slotInsufficient` | {{count}} spots remaining · Not enough capacity | 잔여 {{count}}명 · 인원 부족 | 剩余 {{count}} 个名额 · 名额不足 | 剩餘 {{count}} 個名額 · 名額不足 |
|  | `reservation.create.slotPast` | Unavailable · Time has passed | 예약 불가 · 지난 시간 | 无法预约 · 时间已过 | 無法預約 · 時間已過 |
|  | `reservation.create.submit` | Reserve | 예약하기 | 预约 | 預約 |
| ● | `reservation.create.submitAccountError` | Only an active tourist account can make a reservation. | 활성화된 일반 사용자 계정만 예약할 수 있습니다. | 只有已激活的普通用户账号才能预约。 | 只有已啟用的一般使用者帳號才能預約。 |
| ● | `reservation.create.submitAvailabilityError` | This schedule is no longer available. Select another schedule. | 더 이상 예약할 수 없는 일정입니다. 다른 일정을 선택해 주세요. | 该时段已无法预约。请选择其他时段。 | 這個時段已無法預約。請選擇其他時段。 |
| ● | `reservation.create.submitCapacityError` | There are not enough spots remaining. Check the updated availability. | 잔여 인원이 부족합니다. 갱신된 일정을 확인해 주세요. | 剩余名额不足。请查看更新后的时段。 | 剩餘名額不足。請查看更新後的時段。 |
|  | `reservation.create.submitConflict` | That time was just filled or closed. Pick another slot. | 해당 시간이 방금 마감되었어요. 다른 시간을 선택해 주세요. | 该时间刚刚约满或已关闭。请选择其他时间。 | 這個時間剛剛額滿或已關閉。請選擇其他時間。 |
| ● | `reservation.create.submitError` | Could not submit the reservation. Please try again. | 예약을 접수하지 못했습니다. 다시 시도해 주세요. | 无法提交预约。请重试。 | 無法送出預約。請再試一次。 |
| ● | `reservation.create.submitNetworkError` | We could not confirm your reservation. Check your reservations before submitting again. | 예약 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 예약함을 확인해 주세요. | 无法确认预约结果。再次提交前请先查看我的预约。 | 無法確認預約結果。再次送出前請先查看我的預約。 |
| ● | `reservation.create.submitValidationError` | Check the highlighted fields and try again. | 표시된 항목을 확인하고 다시 시도해 주세요. | 请检查标出的项目后重试。 | 請確認標示的欄位後再試一次。 |
|  | `reservation.create.successDescription` | You can check the confirmation status in Reservations. | 예약함에서 확정 상태를 확인할 수 있습니다. | 可以在我的预约中查看确认状态。 | 可以在我的預約中查看確認狀態。 |
|  | `reservation.create.successTitle` | Reservation requested | 예약 요청이 접수되었습니다 | 预约申请已提交 | 已送出預約申請 |
|  | `reservation.create.time` | Select schedule | 시간 선택 | 选择时间 | 選擇時間 |
|  | `reservation.create.title` | Reserve | 예약하기 | 预约 | 預約 |
| ● | `reservation.create.unavailableDateLabel` | {{date}}, unavailable | {{date}}, 예약 불가 | {{date}}，无法预约 | {{date}}，無法預約 |
|  | `reservation.create.unknownReservationType` | This reservation type isn't supported yet, so it can't be reserved. | 지원하지 않는 예약 유형이라 현재 예약할 수 없습니다. | 暂不支持此预约类型，目前无法预约。 | 尚未支援這種預約類型，目前無法預約。 |
|  | `reservation.create.weekdays.fri` | F | 금 | 五 | 五 |
|  | `reservation.create.weekdays.mon` | M | 월 | 一 | 一 |
|  | `reservation.create.weekdays.sat` | S | 토 | 六 | 六 |
|  | `reservation.create.weekdays.sun` | S | 일 | 日 | 日 |
|  | `reservation.create.weekdays.thu` | T | 목 | 四 | 四 |
|  | `reservation.create.weekdays.tue` | T | 화 | 二 | 二 |
|  | `reservation.create.weekdays.wed` | W | 수 | 三 | 三 |
|  | `reservation.create.windowPending` | The date and time will be shared once confirmed. | 예약 일시는 확정 후 안내됩니다. | 预约日期和时间将在确认后通知。 | 預約日期與時間將於確認後通知。 |
|  | `reservation.detail.bookerHidden` | Hidden | 비공개 | 不公开 | 不公開 |
|  | `reservation.detail.bookerName` | Booker | 예약자 | 预约人 | 預約人 |
|  | `reservation.detail.bookerPhone` | Contact | 연락처 | 联系电话 | 聯絡電話 |
|  | `reservation.detail.identifier` | Reservation ID | 예약 식별자 | 预约编号 | 預約編號 |
|  | `reservation.detail.loading` | Loading reservation details | 예약 상세를 불러오는 중이에요 | 正在加载预约详情 | 正在載入預約詳情 |
|  | `reservation.detail.noRequestNote` | No requests | 요청 사항 없음 | 无备注需求 | 無備註需求 |
|  | `reservation.detail.paymentAmount` | Minor amount and currency: {{value}} | 최소 화폐 단위 금액·통화: {{value}} | 最小货币单位金额及币种：{{value}} | 最小貨幣單位金額與幣別：{{value}} |
|  | `reservation.detail.paymentFailure` | Failure code: {{value}} | 실패 코드: {{value}} | 失败代码：{{value}} | 失敗代碼：{{value}} |
|  | `reservation.detail.paymentIdentifier` | Payment #{{id}} | 결제 번호 {{id}} | 支付编号 {{id}} | 付款編號 {{id}} |
|  | `reservation.detail.paymentProvider` | Provider: {{value}} | 결제 제공자: {{value}} | 支付服务商：{{value}} | 付款服務商：{{value}} |
|  | `reservation.detail.payments` | Payments | 결제 내역 | 支付记录 | 付款紀錄 |
|  | `reservation.detail.paymentsEmptyDescription` | This is a normal state until a payment is created. | 결제가 생성되기 전에는 정상적으로 비어 있을 수 있어요. | 在创建支付之前，这里为空属于正常情况。 | 在建立付款之前，這裡為空屬於正常情況。 |
|  | `reservation.detail.paymentsEmptyTitle` | No payment history | 결제 내역이 없어요 | 暂无支付记录 | 沒有付款紀錄 |
|  | `reservation.detail.paymentsLoading` | Loading payments | 결제 내역을 불러오는 중이에요 | 正在加载支付记录 | 正在載入付款紀錄 |
|  | `reservation.detail.productType` | Product type | 상품 유형 | 商品类型 | 商品類型 |
|  | `reservation.detail.quantity` | Quantity | 예약 수량 | 预约数量 | 預約數量 |
|  | `reservation.detail.requestNote` | Requests | 요청 사항 | 备注需求 | 備註需求 |
|  | `reservation.detail.reservationWindow` | Reserved date & time | 예약 일시 | 预约日期和时间 | 預約日期與時間 |
|  | `reservation.detail.status` | Status | 예약 상태 | 预约状态 | 預約狀態 |
|  | `reservation.detail.title` | Reservation details | 예약 상세 | 预约详情 | 預約詳情 |
|  | `reservation.detail.windowPending` | Shared once confirmed | 확정 후 안내 | 确认后通知 | 確認後通知 |
|  | `reservation.list.available` | Bookable | 예약 가능 | 可预约 | 可預約 |
|  | `reservation.list.distanceFar` | {{kilometers}} km away | 여기서 {{kilometers}}km | 距此 {{kilometers}} 公里 | 距離這裡 {{kilometers}} 公里 |
|  | `reservation.list.distanceNear` | {{meters}} m away | 여기서 {{kilometers}}km | 距此 {{meters}} 米 | 距離這裡 {{meters}} 公尺 |
|  | `reservation.list.card.createdAt` | Requested at | 접수 일시 | 提交时间 | 送出時間 |
|  | `reservation.list.card.detail` | View reservation details  › | 예약 상세 보기  › | 查看预约详情  › | 查看預約詳情  › |
|  | `reservation.list.card.eyebrow` | My reservation | 내 예약 | 我的预约 | 我的預約 |
| ● | `reservation.list.card.hint` | Opens reservation details | 예약 상세 화면으로 이동합니다 | 将打开预约详情 | 將開啟預約詳情 |
|  | `reservation.list.card.label` | Reservation {{id}}, {{status}} | 예약 {{id}}, {{status}} | 预约 {{id}}，{{status}} | 預約 {{id}}，{{status}} |
|  | `reservation.list.card.number` | Reservation #{{id}} | 예약 번호 {{id}} | 预约编号 {{id}} | 預約編號 {{id}} |
|  | `reservation.list.card.productType` | Product type | 상품 유형 | 商品类型 | 商品類型 |
|  | `reservation.list.card.quantity` | Quantity | 예약 수량 | 预约数量 | 預約數量 |
|  | `reservation.list.card.quantityValue` | {{count}} guest(s) | {{count}}명 예약 | 预约 {{count}} 人 | 預約 {{count}} 人 |
|  | `reservation.list.card.reservationWindow` | Reserved for | 예약 일시 | 预约日期和时间 | 預約日期與時間 |
|  | `reservation.list.card.reservationWindowValue` | Reserved {{value}} | {{value}} 예약 | 预约时间 {{value}} | 預約時間 {{value}} |
|  | `reservation.list.card.requestedAtValue` | Requested {{value}} | {{value}} 접수 | {{value}} 提交 | {{value}} 送出 |
|  | `reservation.list.card.windowPending` | Shared once confirmed | 확정 후 안내 | 确认后通知 | 確認後通知 |
|  | `reservation.list.emptyDescription` | Find a place you like on the map. | 지도에서 마음에 드는 장소를 찾아보세요. | 在地图上找找喜欢的地点吧。 | 到地圖上找找喜歡的地點吧。 |
|  | `reservation.list.emptyTitle` | No reservations yet | 아직 예약 내역이 없어요 | 还没有预约记录 | 目前還沒有預約紀錄 |
| ● | `reservation.list.error` | Could not load reservations | 예약을 불러오지 못했어요 | 无法加载预约 | 無法載入預約 |
|  | `reservation.list.loading` | Loading reservations | 예약을 불러오는 중이에요 | 正在加载预约 | 正在載入預約 |
|  | `reservation.list.nearbySubtitle` | Discover places currently accepting reservations! | 현재 예약 가능 장소를 찾아드려요! | 为你寻找目前可预约的地点！ | 為你尋找目前可預約的地點！ |
|  | `reservation.list.nearbyEmpty` | No nearby bookable places are available right now. | 현재 위치 주변에 예약 가능한 장소가 없어요. | 当前位置附近暂无可预约的地点。 | 目前位置附近沒有可預約的地點。 |
|  | `reservation.list.nearbyLoading` | Finding nearby bookable places… | 주변 예약 가능 장소를 찾는 중이에요… | 正在寻找附近可预约的地点… | 正在尋找附近可預約的地點… |
|  | `reservation.list.nearbyTitle` | Reservations near your current location | 현재 위치 주변 예약 | 当前位置附近的预约 | 目前位置附近的預約 |
|  | `reservation.list.panelAdjust` | Resize reservation panel | 예약 패널 크기 조절 | 调整预约面板大小 | 調整預約面板大小 |
| ● | `reservation.list.previewLabel` | {{name}} reservation preview | {{name}} 예약 미리보기 | {{name}} 预约预览 | {{name}} 預約預覽 |
|  | `reservation.list.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `reservation.list.savedTitle` | Saved reservations | 예약함 | 我的预约 | 我的預約 |
|  | `reservation.list.statuses.canceled` | Canceled | 취소됨 | 已取消 | 已取消 |
|  | `reservation.list.statuses.confirmed` | Confirmed | 예약 확정 | 预约已确认 | 預約已確認 |
|  | `reservation.list.statuses.pending` | Pending confirmation | 확정 대기 | 等待确认 | 等待確認 |
|  | `reservation.list.statuses.rejected` | Rejected | 거절됨 | 已拒绝 | 已拒絕 |
|  | `reservation.list.statuses.unknown` | Status needs review | 상태 확인 필요 | 状态待确认 | 狀態待確認 |

## `community`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `community.title` | Community | 커뮤니티 | 社区 | 社群 |
|  | `community.categories.all` | All | 전체 | 全部 | 全部 |
|  | `community.categories.spot` | Spots | 스팟 | 地点 | 景點 |
|  | `community.categories.diary` | Diary | 다이어리 | 日记 | 日記 |
|  | `community.categories.ledger` | Expenses | 가계부 | 记账 | 記帳 |
|  | `community.sheetAdjust` | Adjust community panel | 커뮤니티 패널 조절 | 调整社区面板 | 調整社群面板 |
|  | `community.write` | Write | 작성하기 | 发帖 | 發文 |
|  | `community.moreOptions` | More options | 더보기 | 更多选项 | 更多選項 |
|  | `community.notInterested` | Not interested | 관심없음 | 不感兴趣 | 不感興趣 |
|  | `community.report` | Report | 신고하기 | 举报 | 檢舉 |
|  | `community.empty` | No posts yet | 아직 게시글이 없어요 | 还没有帖子 | 目前還沒有貼文 |
|  | `community.author` | woo_sm | woo_sm | woo_sm | woo_sm |
|  | `community.like` | Like | 좋아요 | 点赞 | 按讚 |
|  | `community.comment` | Comment | 댓글 | 评论 | 留言 |
|  | `community.list.loading` | Loading posts… | 게시글을 불러오는 중… | 正在加载帖子… | 正在載入貼文… |
| ● | `community.list.nextPageError` | Couldn't load more posts. | 게시글을 더 불러오지 못했어요. | 无法加载更多帖子。 | 無法載入更多貼文。 |
|  | `community.list.nextPageRetry` | Retry | 다시 시도 | 重试 | 再試一次 |
|  | `community.detail.back` | Back | 뒤로 | 返回 | 返回 |
|  | `community.detail.settings` | Post options | 게시글 옵션 | 帖子选项 | 貼文選項 |
|  | `community.detail.placeTagPrefix` | View place | 장소 보기 | 查看地点 | 查看地點 |
| ● | `community.detail.placeDeleted` | This place was removed | 삭제된 장소예요 | 该地点已被删除 | 這個地點已被刪除 |
| ● | `community.detail.placeCard.a11yLabel` | Connected place, {{name}} | 연결 장소, {{name}} | 关联地点，{{name}} | 關聯地點，{{name}} |
| ● | `community.detail.placeCard.a11yHint` | Opens the place detail | 장소 상세로 이동 | 将打开地点详情 | 將開啟地點詳情 |
|  | `community.detail.placeCard.announceFailure` | Couldn't open this place. | 장소를 열지 못했어요. | 无法打开该地点。 | 無法開啟這個地點。 |
| ● | `community.detail.placeCard.errors.unavailable` | This place can't be opened right now. | 장소를 불러올 수 없어요 | 暂时无法打开该地点。 | 目前無法開啟這個地點。 |
| ● | `community.detail.comments.headerLabel` | Comments | 댓글 | 评论 | 留言 |
|  | `community.detail.comments.authorBadge` | Author | 작성자 | 作者 | 作者 |
|  | `community.detail.comments.count` | Comments {{count}} | 댓글 {{count}} | 评论 {{count}} | 留言 {{count}} |
| ● | `community.detail.comments.jumpA11yLabel` | Go to {{count}} comments | 댓글 {{count}}개로 이동 | 前往 {{count}} 条评论 | 前往 {{count}} 則留言 |
|  | `community.detail.comments.loading` | Loading comments… | 댓글을 불러오는 중… | 正在加载评论… | 正在載入留言… |
|  | `community.detail.comments.empty` | No comments yet. Be the first to leave one! | 아직 댓글이 없어요. 첫 댓글을 남겨보세요! | 还没有评论。来留下第一条评论吧！ | 目前還沒有留言。來留下第一則留言吧！ |
| ● | `community.detail.comments.errorRetry` | Retry | 다시 시도 | 重试 | 再試一次 |
| ● | `community.detail.comments.nextPageError` | Couldn't load more comments. | 댓글을 더 불러오지 못했어요. | 无法加载更多评论。 | 無法載入更多留言。 |
|  | `community.detail.comments.nextPageRetry` | Retry | 다시 시도 | 重试 | 再試一次 |
|  | `community.detail.comments.loadMore` | Show {{count}} more comments | 댓글 {{count}}개 더 보기 | 再显示 {{count}} 条评论 | 再顯示 {{count}} 則留言 |
| ● | `community.detail.comments.a11yLabel` | {{author}}, {{time}}, {{content}} | {{author}}, {{time}}, {{content}} | {{author}}，{{time}}，{{content}} | {{author}}，{{time}}，{{content}} |
|  | `community.detail.comments.announceSuccess` | Your comment was posted. | 댓글이 등록되었어요. | 评论已发布。 | 留言已發布。 |
|  | `community.detail.comments.announceFailure` | Your comment failed to post. | 댓글 등록에 실패했어요. | 评论发布失败。 | 留言發布失敗。 |
|  | `community.detail.like.count_one` | Like {{count}} | 좋아요 {{count}} | 赞 {{count}} | 讚 {{count}} |
|  | `community.detail.like.count_other` | Like {{count}} | 좋아요 {{count}} | 赞 {{count}} | 讚 {{count}} |
| ● | `community.detail.like.a11yLabel_one` | Like, {{count}} | 좋아요, {{count}}개 | 点赞，{{count}} 个 | 按讚，{{count}} 個 |
| ● | `community.detail.like.a11yLabel_other` | Like, {{count}} | 좋아요, {{count}}개 | 点赞，{{count}} 个 | 按讚，{{count}} 個 |
| ● | `community.detail.like.hintLike` | Double tap to like | 두 번 탭하여 좋아요 | 轻点两下即可点赞 | 點兩下即可按讚 |
| ● | `community.detail.like.hintUnlike` | Double tap to unlike | 두 번 탭하여 좋아요 취소 | 轻点两下即可取消点赞 | 點兩下即可收回讚 |
| ● | `community.detail.like.retryLabel` | Retry | 다시 시도 | 重试 | 再試一次 |
|  | `community.detail.like.announceLiked` | Liked. | 좋아요를 눌렀어요. | 已点赞。 | 已按讚。 |
|  | `community.detail.like.announceUnliked` | Like removed. | 좋아요를 취소했어요. | 已取消点赞。 | 已收回讚。 |
|  | `community.detail.like.announceFailure` | Something went wrong. Please try again. | 문제가 발생했어요. 다시 시도해 주세요. | 出现问题。请重试。 | 發生問題。請再試一次。 |
|  | `community.detail.commentInput.label` | Write a comment | 댓글 입력 | 输入评论 | 輸入留言 |
|  | `community.detail.commentInput.placeholder` | Leave a comment | 댓글을 남겨주세요 | 留下你的评论 | 留下你的留言 |
|  | `community.detail.commentInput.send` | Post comment | 댓글 등록 | 发布评论 | 發布留言 |
|  | `community.detail.commentInput.sendBusy` | Posting comment… | 댓글 등록 중… | 正在发布评论… | 正在發布留言… |
|  | `community.detail.commentInput.counter` | {{count}}/{{max}} | {{count}}/{{max}} | {{count}}/{{max}} | {{count}}/{{max}} |
| ● | `community.detail.commentInput.validation.required` | Enter a comment. | 댓글 내용을 입력해 주세요. | 请输入评论内容。 | 請輸入留言內容。 |
| ● | `community.detail.commentInput.validation.tooLong` | Comments must be 1,000 characters or fewer. | 댓글은 1,000자 이하로 입력해 주세요. | 评论不能超过 1,000 个字符。 | 留言不可超過 1,000 個字元。 |
| ● | `community.detail.commentInput.errors.networkDuplicateWarning` | If the comment already went through, check the list before retrying. | 이미 댓글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | 评论可能已经发布。重试前请先查看列表。 | 留言可能已經發布。重試前請先查看清單。 |
| ● | `community.detail.commentInput.errors.retry` | Retry | 다시 시도 | 重试 | 再試一次 |
| ● | `community.detail.commentInput.errors.signIn` | Sign in again | 다시 로그인 | 重新登录 | 重新登入 |
| ● | `community.detail.commentInput.errors.postNotFound` | This post couldn't be found. It may have been removed. | 게시글을 찾을 수 없어요. 삭제되었을 수 있어요. | 找不到该帖子，可能已被删除。 | 找不到這則貼文，可能已被刪除。 |
|  | `community.write_screen.title` | Write a post | 글 작성하기 | 发帖 | 撰寫貼文 |
|  | `community.write_screen.back` | Cancel | 취소 | 取消 | 取消 |
| ● | `community.write_screen.categoryLabel` | Category | 카테고리 | 分类 | 類別 |
| ● | `community.write_screen.categoryHint` | Choose the category that fits your post | 글에 맞는 카테고리를 선택해주세요 | 请选择适合帖子的分类 | 請選擇適合貼文的類別 |
| ● | `community.write_screen.titleLabel` | Post | 글 작성 | 撰写帖子 | 撰寫貼文 |
|  | `community.write_screen.titlePlaceholder` | Enter a title | 제목을 입력해주세요. | 请输入标题 | 請輸入標題 |
| ● | `community.write_screen.bodyLabel` | Content | 내용 | 内容 | 內容 |
|  | `community.write_screen.bodyPlaceholder` | Share your story with the community | 본문을 입력해주세요. | 和社区分享你的故事 | 與社群分享你的故事 |
| ● | `community.write_screen.guideText` | Posts with abuse, defamation, or ads may be removed under our policy | 욕설·비방·광고성 글은 운영 정책에 따라 삭제될 수 있어요 | 包含辱骂、诽谤或广告的帖子可能会根据运营政策被删除 | 含有辱罵、誹謗或廣告的貼文可能會依營運政策遭到刪除 |
|  | `community.write_screen.photoSection` | Photos | 사진 첨부 | 添加照片 | 附加照片 |
|  | `community.write_screen.photoCount` | Up to {{count}} photos | 최대 {{count}}장까지 첨부할 수 있어요 | 最多可添加 {{count}} 张照片 | 最多可附加 {{count}} 張照片 |
|  | `community.write_screen.addPhotos` | Add photos | 사진 추가 | 添加照片 | 新增照片 |
|  | `community.write_screen.placeTagTitle` | Place tag | 장소 태그 | 地点标签 | 地點標籤 |
| ● | `community.write_screen.placeTagHint` | Tell us which place this post is about | 어떤 장소에 대한 글인지 알려주세요 | 告诉我们这篇帖子是关于哪个地点的 | 告訴我們這則貼文是關於哪個地點 |
|  | `community.write_screen.addPlace` | Add place | 장소 추가 | 添加地点 | 新增地點 |
|  | `community.write_screen.removePlace` | Remove {{name}} | {{name}} 삭제 | 删除 {{name}} | 移除 {{name}} |
|  | `community.write_screen.submit` | Post | 등록하기 | 发布 | 發布 |
|  | `community.write_screen.submitBusy` | Posting… | 등록 중… | 正在发布… | 正在發布… |
| ● | `community.write_screen.validation.titleRequired` | Enter a title. | 제목을 입력해 주세요. | 请输入标题。 | 請輸入標題。 |
| ● | `community.write_screen.validation.titleTooLong` | Title must be 50 characters or fewer. | 제목은 50자 이하로 입력해 주세요. | 标题不能超过 50 个字符。 | 標題不可超過 50 個字元。 |
| ● | `community.write_screen.validation.bodyRequired` | Enter content. | 내용을 입력해 주세요. | 请输入内容。 | 請輸入內容。 |
| ● | `community.write_screen.validation.contentTooLong` | Content must be 5,000 characters or fewer. | 내용은 5,000자 이하로 입력해 주세요. | 内容不能超过 5,000 个字符。 | 內容不可超過 5,000 個字元。 |
| ● | `community.write_screen.validation.tagRequired` | Choose at least one category. | 카테고리를 하나 이상 선택해 주세요. | 请至少选择一个分类。 | 請至少選擇一個類別。 |
| ● | `community.write_screen.validation.categoryRequired` | Choose a category. | 카테고리를 선택해 주세요. | 请选择分类。 | 請選擇類別。 |
| ● | `community.write_screen.validation.placeRequired` | Add at least one place for the Place category. | 장소 카테고리는 장소를 1개 이상 선택해야 해요. | 地点分类需要至少添加一个地点。 | 景點類別需要至少新增一個地點。 |
|  | `community.write_screen.placePicker.close` | Close | 닫기 | 关闭 | 關閉 |
|  | `community.write_screen.placePicker.placeholder` | Search for a place | 장소를 검색해 주세요 | 搜索地点 | 搜尋地點 |
|  | `community.write_screen.placePicker.prompt` | Search for a registered place to tag | 태그할 등록된 장소를 검색해 주세요 | 请搜索要标记的已登记地点 | 請搜尋要標記的已登錄地點 |
|  | `community.write_screen.placePicker.empty` | No matching places found | 검색 결과가 없어요 | 没有找到匹配的地点 | 找不到符合的地點 |
| ● | `community.write_screen.placePicker.error` | Couldn't load places. | 장소를 불러오지 못했어요. | 无法加载地点。 | 無法載入地點。 |
|  | `community.write_screen.placePicker.retry` | Retry | 다시 시도 | 重试 | 再試一次 |
|  | `community.write_screen.placePicker.disabled` | Place search is unavailable right now | 지금은 장소 검색을 사용할 수 없어요 | 目前无法使用地点搜索 | 目前無法使用地點搜尋 |
| ● | `community.write_screen.errors.placeNotFound` | One of the connected places couldn't be found. Remove it and choose another. | 연결한 장소 중 하나를 찾을 수 없어요. 삭제하고 다시 선택해 주세요. | 找不到其中一个关联地点。请将其删除后重新选择。 | 找不到其中一個關聯地點。請將其移除後重新選擇。 |
| ● | `community.write_screen.errors.networkDuplicateWarning` | If the post already went through, check the list before retrying. | 이미 게시글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | 帖子可能已经发布。重试前请先查看列表。 | 貼文可能已經發布。重試前請先查看清單。 |
| ● | `community.write_screen.errors.retry` | Retry | 다시 시도 | 重试 | 再試一次 |
| ● | `community.write_screen.errors.signIn` | Sign in again | 다시 로그인 | 重新登录 | 重新登入 |
| ● | `community.write_screen.discard.title` | Discard this post? | 작성 중인 내용을 삭제할까요? | 要放弃这篇帖子吗？ | 要捨棄這則貼文嗎？ |
| ● | `community.write_screen.discard.body` | What you've written won't be saved. | 지금까지 작성한 내용이 저장되지 않아요. | 已编写的内容将不会保存。 | 已撰寫的內容將不會儲存。 |
| ● | `community.write_screen.discard.cancel` | Keep editing | 계속 작성 | 继续编辑 | 繼續編輯 |
| ● | `community.write_screen.discard.confirm` | Discard | 삭제 | 放弃 | 捨棄 |

## `visitVerification`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `visitVerification.addPhotos` | Add photos | 사진 선택 | 添加照片 | 新增照片 |
|  | `visitVerification.back` | Back | 뒤로 | 返回 | 返回 |
|  | `visitVerification.distanceKm` | {{value}}km | {{value}}km | {{value}}km | {{value}}km |
|  | `visitVerification.distanceMeters` | {{value}}m | {{value}}m | {{value}}m | {{value}}m |
|  | `visitVerification.emptyDescription` | We could not find a place you can verify from your current location. Check your location and try again. | 현재 위치에서 검증할 수 있는 장소를 찾지 못했어요<br>현재 위치를 다시 확인해주세요 | 在当前位置没有找到可以验证的地点。请确认你的位置后重试。 | 在目前位置找不到可以驗證的地點。請確認你的位置後再試一次。 |
|  | `visitVerification.emptyTitle` | No places nearby to verify! | 근처에 검증할 장소가 없어요! | 附近没有可以验证的地点！ | 附近沒有可以驗證的地點！ |
| ● | `visitVerification.errorTitle` | Could not load recent visits | 최근 방문을 불러오지 못했어요 | 无法加载最近的到访记录 | 無法載入最近的造訪紀錄 |
| ● | `visitVerification.permissionDenied` | Allow photo library access in Settings to attach photos. | 사진을 첨부하려면 설정에서 사진 접근 권한을 허용해 주세요. | 要添加照片，请在设置中允许访问照片。 | 若要附加照片，請在設定中允許取用照片。 |
| ● | `visitVerification.permissionTitle` | Location access is off | 위치 권한이 꺼져 있어요 | 定位权限已关闭 | 定位權限已關閉 |
| ● | `visitVerification.locationPermissionDenied` | Allow location access to find places eligible for verification near you. | 주변에서 검증 가능한 장소를 찾으려면 위치 접근 권한을 허용해 주세요. | 要查找附近可以验证的地点，请允许访问位置信息。 | 若要尋找附近可以驗證的地點，請允許取用位置資訊。 |
|  | `visitVerification.photoCount` | {{count}}/3 | {{count}}/3 | {{count}}/3 | {{count}}/3 |
| ● | `visitVerification.photoDelete` | Remove photo {{index}} | {{index}}번째 사진 삭제 | 删除第 {{index}} 张照片 | 刪除第 {{index}} 張照片 |
|  | `visitVerification.photoSection` | Attach photos | 사진 첨부 | 添加照片 | 附加照片 |
| ● | `visitVerification.placeError` | Could not load this place. | 장소 정보를 불러오지 못했어요. | 无法加载地点信息。 | 無法載入地點資訊。 |
|  | `visitVerification.placeLoading` | Loading place information... | 장소 정보를 불러오는 중이에요... | 正在加载地点信息… | 正在載入地點資訊… |
|  | `visitVerification.placePhoto` | {{name}} photo {{index}} | {{name}} 사진 {{index}} | {{name}} 照片 {{index}} | {{name}} 照片 {{index}} |
|  | `visitVerification.reasonHelp` | You can select up to 5 | 최대 5개까지 선택할 수 있어요 | 最多可选择 5 项 | 最多可選擇 5 項 |
|  | `visitVerification.reasonMoreCount` | {{count}} more reasons | 추천 이유 {{count}}개 더 있음 | 还有 {{count}} 个推荐理由 | 還有 {{count}} 個推薦理由 |
|  | `visitVerification.reasonSelectedSuffix` | /{{max}} selected | /{{max}}개 선택됨 | /{{max}} 已选 | /{{max}} 已選 |
|  | `visitVerification.reasonSection` | Recommendation reasons | 추천 이유 | 推荐理由 | 推薦理由 |
|  | `visitVerification.reasons.clean` | Clean store | 매장이 깨끗해요 | 店内干净 | 店內乾淨 |
|  | `visitVerification.reasons.delicious` | Delicious | 맛있어요 | 好吃 | 好吃 |
|  | `visitVerification.reasons.easyToFind` | Easy to find | 찾기 쉬워요 | 容易找到 | 容易找到 |
|  | `visitVerification.reasons.kind` | Friendly | 친절해요 | 服务亲切 | 服務親切 |
|  | `visitVerification.reasons.multilingual` | Good multilingual descriptions | 다국어 설명이 잘 되어 있어요 | 多语言说明很完善 | 多語言說明很完善 |
|  | `visitVerification.reasons.parking` | Easy parking | 주차하기 편해요 | 停车方便 | 停車方便 |
|  | `visitVerification.reasons.photoSpot` | Great for photos | 사진 찍기 좋아요 | 适合拍照 | 適合拍照 |
|  | `visitVerification.recentVisits` | Recent visits | 최근 방문 | 最近到访 | 最近造訪 |
|  | `visitVerification.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `visitVerification.return` | Go back | 돌아가기 | 返回 | 返回 |
|  | `visitVerification.reviewPlaceholder` | Share your review with others, {{username}} | 다른 사람들에게 {{username}}님의 후기를 알려주세요 | {{username}}，把你的评价分享给大家吧 | {{username}}，把你的評論分享給大家吧 |
|  | `visitVerification.reviewSection` | Write a review | 후기 작성 | 撰写评价 | 撰寫評論 |
|  | `visitVerification.submit` | Verify | 검증하기 | 验证 | 驗證 |
|  | `visitVerification.uploading` | Uploading photos... | 사진 업로드 중 | 正在上传照片… | 正在上傳照片… |
| ● | `visitVerification.errors.unsupportedFormat` | Choose a JPEG or PNG photo. HEIC is not supported. | JPEG 또는 PNG 사진을 선택해 주세요. HEIC 형식은 지원하지 않아요. | 请选择 JPEG 或 PNG 照片。不支持 HEIC 格式。 | 請選擇 JPEG 或 PNG 照片。不支援 HEIC 格式。 |
| ● | `visitVerification.errors.fileTooLarge` | This photo is too large. Choose a smaller photo. | 사진 용량이 너무 커요. 더 작은 사진을 선택해 주세요. | 照片太大。请选择较小的照片。 | 照片檔案太大。請選擇較小的照片。 |
| ● | `visitVerification.errors.unauthenticated` | Sign in again to submit your review. | 후기를 제출하려면 다시 로그인해 주세요. | 请重新登录后提交评价。 | 請重新登入後送出評論。 |
| ● | `visitVerification.errors.forbidden` | You do not have permission to submit this review or photo. | 이 후기 또는 사진을 제출할 권한이 없어요. | 你没有提交此评价或照片的权限。 | 你沒有送出這則評論或照片的權限。 |
| ● | `visitVerification.errors.serverUnavailable` | The service is temporarily unavailable. Try again later. | 서비스를 일시적으로 이용할 수 없어요. 잠시 후 다시 시도해 주세요. | 服务暂时不可用。请稍后重试。 | 服務暫時無法使用。請稍後再試。 |
| ● | `visitVerification.errors.network` | Check your connection and try again. Your draft is preserved. | 네트워크를 확인한 뒤 다시 시도해 주세요. 작성 내용은 유지돼요. | 请检查网络后重试。已填写的内容会保留。 | 請確認網路後再試一次。已填寫的內容會保留。 |
| ● | `visitVerification.errors.submitFailed` | Could not submit your review. Your draft is preserved. Try again. | 후기를 제출하지 못했어요. 작성 내용은 유지돼요. 다시 시도해 주세요. | 无法提交评价。已填写的内容会保留。请重试。 | 無法送出評論。已填寫的內容會保留。請再試一次。 |
|  | `visitVerification.submitting` | Submitting... | 제출 중 | 正在提交… | 正在送出… |
|  | `visitVerification.title` | Verify | 검증하기 | 验证 | 驗證 |
|  | `visitVerification.session.ambiguousPlace` | More than one place can be verified here. Move closer to one place and try again. | 현재 위치에서 여러 장소가 확인돼요. 한 장소에 더 가까이 이동한 뒤 다시 시도해 주세요. | 当前位置可验证多个地点。请靠近其中一个地点后重试。 | 目前位置可驗證多個地點。請靠近其中一個地點後再試一次。 |
|  | `visitVerification.session.completionMissing` | Verification did not include the completed check-in. This visit cannot be treated as complete. | 완료된 체크인 정보가 없어 방문 완료로 처리할 수 없어요. | 验证结果中没有已完成的签到信息，无法视为到访完成。 | 驗證結果中沒有已完成的打卡資訊，無法視為造訪完成。 |
|  | `visitVerification.session.distance` | Latest distance: {{value}}m | 최근 거리: {{value}}m | 最新距离：{{value}}m | 最新距離：{{value}}m |
|  | `visitVerification.session.dwell` | Required stay: {{value}} seconds | 요구 체류 시간: {{value}}초 | 所需停留时间：{{value}} 秒 | 所需停留時間：{{value}} 秒 |
| ● | `visitVerification.session.foregroundBlocked` | Verification is paused. Return to the app to resume from the server status. | 인증이 일시 중지됐어요. 앱으로 돌아오면 서버 상태부터 복구해요. | 验证已暂停。返回应用后将从服务器状态恢复。 | 驗證已暫停。回到 App 後將從伺服器狀態恢復。 |
|  | `visitVerification.session.inactiveTourist` | Visit verification is available only to an active tourist account. | 활성 관광객 계정만 방문 인증을 이용할 수 있어요. | 只有已激活的游客账号才能使用到访验证。 | 只有已啟用的旅客帳號才能使用造訪驗證。 |
|  | `visitVerification.session.invalidObservation` | The location observation was rejected. Check your GPS signal and device time, then try again. | 위치 관측이 거절됐어요. GPS 신호와 기기 시간을 확인한 뒤 다시 시도해 주세요. | 位置观测被拒绝。请检查 GPS 信号和设备时间后重试。 | 位置觀測遭到拒絕。請確認 GPS 訊號與裝置時間後再試一次。 |
|  | `visitVerification.session.locating` | Checking your location... | 위치를 확인하는 중이에요... | 正在确认你的位置… | 正在確認你的位置… |
| ● | `visitVerification.session.locationFailed` | Could not read your current location. Check permission and GPS, then try again. | 현재 위치를 확인하지 못했어요. 위치 권한과 GPS를 확인한 뒤 다시 시도해 주세요. | 无法获取当前位置。请检查定位权限和 GPS 后重试。 | 無法取得目前位置。請確認定位權限與 GPS 後再試一次。 |
| ● | `visitVerification.session.networkError` | A network error interrupted verification. This visit has not been completed. | 네트워크 오류로 인증이 중단됐어요. 방문 완료로 처리되지 않았어요. | 网络错误导致验证中断。本次到访尚未完成。 | 網路錯誤導致驗證中斷。這次造訪尚未完成。 |
|  | `visitVerification.session.noPlace` | There is no open verification place at your current location. | 현재 위치에는 운영 중인 인증 대상 장소가 없어요. | 当前位置没有营业中的可验证地点。 | 目前位置沒有營業中的可驗證地點。 |
| ● | `visitVerification.session.permissionDenied` | Location permission is required to verify this visit. | 방문 인증에는 위치 권한이 필요해요. | 验证到访需要定位权限。 | 驗證造訪需要定位權限。 |
|  | `visitVerification.session.progress` | Verification in progress | 인증 진행 중 | 验证进行中 | 驗證進行中 |
|  | `visitVerification.session.radius` | Allowed radius: {{value}}m | 허용 반경: {{value}}m | 允许范围：{{value}}m | 允許範圍：{{value}}m |
|  | `visitVerification.session.ready` | Start only while you are at this place. | 이 장소에 머무는 동안에만 시작해 주세요. | 请仅在停留于此地点时开始。 | 請只在停留於此地點時開始。 |
|  | `visitVerification.session.recovering` | Restoring the verification session from the server... | 서버에서 진행 중인 인증 상태를 복구하는 중이에요... | 正在从服务器恢复验证会话… | 正在從伺服器恢復驗證工作階段… |
|  | `visitVerification.session.remaining_one` | {{count}} second remaining | 남은 시간: {{count}}초 | 剩余 {{count}} 秒 | 剩餘 {{count}} 秒 |
|  | `visitVerification.session.remaining_other` | {{count}} seconds remaining | 남은 시간: {{count}}초 | 剩余 {{count}} 秒 | 剩餘 {{count}} 秒 |
|  | `visitVerification.session.start` | Start visit verification | 방문 인증 시작 | 开始到访验证 | 開始造訪驗證 |
|  | `visitVerification.session.starting` | Starting verification session... | 인증 세션을 시작하는 중이에요... | 正在开始验证会话… | 正在開始驗證工作階段… |
| ● | `visitVerification.session.serverError` | Could not verify the visit because of a server error. Try again. | 서버 오류로 방문을 인증하지 못했어요. 다시 시도해 주세요. | 服务器错误导致无法验证到访。请重试。 | 伺服器錯誤導致無法驗證造訪。請再試一次。 |
|  | `visitVerification.session.status.COMPLETED` | Visit verified | 인증 완료 | 到访已验证 | 造訪已驗證 |
|  | `visitVerification.session.status.EXPIRED` | Verification session expired | 세션 만료 | 验证会话已过期 | 驗證工作階段已過期 |
|  | `visitVerification.session.status.IN_PROGRESS` | Verification in progress | 인증 진행 중 | 验证进行中 | 驗證進行中 |
|  | `visitVerification.session.status.PROXIMITY_LOST` | You left the allowed radius | 반경 이탈 | 你已离开允许范围 | 你已離開允許範圍 |
|  | `visitVerification.session.status.REJECTED` | Verification rejected | 인증 거절 | 验证被拒绝 | 驗證遭拒 |
|  | `visitVerification.session.status.STARTED` | Verification started | 인증 시작됨 | 验证已开始 | 驗證已開始 |
|  | `visitVerification.session.title` | Visit verification | 방문 인증 | 到访验证 | 造訪驗證 |
|  | `visitVerification.session.unauthenticated` | Sign in again to verify this visit. | 방문을 인증하려면 다시 로그인해 주세요. | 请重新登录后验证本次到访。 | 請重新登入後驗證這次造訪。 |
|  | `visitVerification.session.verifiedDwell` | Verified stay: {{value}} seconds | 인증된 체류 시간: {{value}}초 | 已验证停留时间：{{value}} 秒 | 已驗證停留時間：{{value}} 秒 |
|  | `visitVerification.unknownCategory` | Place | 장소 | 地点 | 地點 |
| ● | `visitVerification.validation.contentRequired` | Write a review before submitting. | 후기를 작성해 주세요. | 请先撰写评价再提交。 | 請先撰寫評論再送出。 |
| ● | `visitVerification.validation.contentTooLong` | Your review must be 2,000 characters or fewer. | 후기는 2,000자 이하로 작성해 주세요. | 评价不能超过 2,000 个字符。 | 評論不可超過 2,000 個字元。 |
| ● | `visitVerification.validation.reasonRequired` | Select at least one recommendation reason. | 추천 이유를 한 개 이상 선택해 주세요. | 请至少选择一个推荐理由。 | 請至少選擇一個推薦理由。 |

## `voiceAssistant`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `voiceAssistant.command.submission` | After 5 seconds without speech, recognized voice input is sent to the AI server automatically. Text input is sent when you use Send. Exact coordinates are used only by the existing place lookup. | 음성 입력은 5초 동안 말하지 않으면 인식된 내용을 AI 서버에 자동 전송합니다. 텍스트 입력은 보내기를 누르면 전송합니다. 정확한 현재 좌표는 기존 장소 조회에만 사용합니다. | 语音输入在 5 秒没有说话后，会自动将识别到的内容发送到 AI 服务器。文字输入在你点按“发送”后发送。精确坐标仅用于现有的地点查询。 | 語音輸入在 5 秒沒有說話後，會自動將辨識到的內容傳送到 AI 伺服器。文字輸入會在你點選「傳送」後傳送。精確座標僅用於現有的地點查詢。 |
|  | `voiceAssistant.command.introTitle` | Before using AI | AI 사용 안내 | AI 使用说明 | AI 使用說明 |
|  | `voiceAssistant.command.introContinue` | Continue to AI | 확인하고 시작하기 | 确认并开始 | 確認並開始 |
|  | `voiceAssistant.command.introClose` | Close | 닫기 | 关闭 | 關閉 |
|  | `voiceAssistant.command.timezone` | Request timezone: {{timezone}} | 요청 시간대: {{timezone}} | 请求时区：{{timezone}} | 要求時區：{{timezone}} |
|  | `voiceAssistant.command.processing` | Checking place information. | 장소 정보를 확인하고 있습니다. | 正在确认地点信息。 | 正在確認地點資訊。 |
|  | `voiceAssistant.command.canceled` | Voice session ended. | 음성 세션을 종료했습니다. | 语音会话已结束。 | 語音工作階段已結束。 |
| ● | `voiceAssistant.command.advisory` | Assistant response received. | 어시스턴트 응답을 받았습니다. | 已收到助手的回复。 | 已收到助理的回覆。 |
|  | `voiceAssistant.command.bounded` | Results checked among up to 12 nearby candidates. | 가까운 후보 최대 12곳에서 조건을 확인한 결과입니다. | 这是在最多 12 个附近候选地点中核对条件的结果。 | 這是在最多 12 個附近候選地點中核對條件的結果。 |
|  | `voiceAssistant.command.empty` | No matching results among the checked candidates. | 조회한 후보에 조건과 일치하는 결과가 없습니다. | 在已查询的候选地点中没有符合条件的结果。 | 在已查詢的候選地點中沒有符合條件的結果。 |
|  | `voiceAssistant.command.slots` | Actual server intervals. These do not confirm product bookability or a reservation. | 서버의 실제 이용 시간입니다. 상품의 예약 가능 여부나 예약 확정을 의미하지 않습니다. | 这是服务器上的实际可用时间，不代表商品可以预约或预约已确认。 | 這是伺服器上的實際可用時間，不代表商品可以預約或預約已確認。 |
|  | `voiceAssistant.command.general` | General admission | 일반 이용 | 普通使用 | 一般使用 |
|  | `voiceAssistant.command.capacity` | Remaining capacity: {{count}} | 남은 정원: {{count}}명 | 剩余名额：{{count}} 人 | 剩餘名額：{{count}} 人 |
| ● | `voiceAssistant.command.failed` | The request could not be completed. Check your conditions and try again. | 요청을 완료하지 못했습니다. 조건을 확인하고 다시 시도해 주세요. | 无法完成请求。请检查条件后重试。 | 無法完成要求。請確認條件後再試一次。 |
|  | `voiceAssistant.command.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `voiceAssistant.command.resultSummary` | I found {{count}} place(s). The first result is “{{name}}”. | {{count}}곳을 찾았어요. 첫 번째 결과는 ‘{{name}}’이에요. | 找到了 {{count}} 个地点。第一个结果是“{{name}}”。 | 找到了 {{count}} 個地點。第一個結果是「{{name}}」。 |
|  | `voiceAssistant.command.showOnMap` | View on map | 지도에서 보기 | 在地图上查看 | 在地圖上查看 |
|  | `voiceAssistant.command.directions` | Directions | 길찾기 | 路线 | 路線 |
|  | `voiceAssistant.command.share` | Share | 공유 | 分享 | 分享 |
|  | `voiceAssistant.command.operating.OPERATING` | Operating | 운영 중 | 营业中 | 營業中 |
|  | `voiceAssistant.command.operating.TEMPORARILY_CLOSED` | Temporarily closed | 임시 휴업 | 暂停营业 | 暫停營業 |
|  | `voiceAssistant.command.operating.PERMANENTLY_CLOSED` | Permanently closed | 폐업 | 已停业 | 已歇業 |
|  | `voiceAssistant.command.fields.touristCategory` | Specify a place category. | 장소 카테고리를 알려 주세요. | 请告诉我地点分类。 | 請告訴我地點類別。 |
|  | `voiceAssistant.command.fields.date` | Confirm the requested date. | 조회할 날짜를 확인해 주세요. | 请确认要查询的日期。 | 請確認要查詢的日期。 |
|  | `voiceAssistant.command.fields.timeRange` | Confirm the timezone and start/end times. | 시간대와 시작·종료 시간을 확인해 주세요. | 请确认时区以及开始和结束时间。 | 請確認時區以及開始與結束時間。 |
|  | `voiceAssistant.command.fields.quantity` | Specify the number of people. | 인원을 알려 주세요. | 请告诉我人数。 | 請告訴我人數。 |
|  | `voiceAssistant.command.fields.useCurrentLocation` | Confirm current location use and permission. | 현재 위치 사용 여부와 위치 권한을 확인해 주세요. | 请确认是否使用当前位置以及定位权限。 | 請確認是否使用目前位置以及定位權限。 |
|  | `voiceAssistant.command.fields.placeId` | Choose a place from the retrieved results. | 조회 결과에서 장소를 선택해 주세요. | 请从查询结果中选择一个地点。 | 請從查詢結果中選擇一個地點。 |
|  | `voiceAssistant.command.fields.availabilityId` | Choose a retrieved time slot. | 조회한 이용 시간을 선택해 주세요. | 请选择已查询到的时间段。 | 請選擇已查詢到的時段。 |
| ● | `voiceAssistant.command.errors.LOCATION_REQUIRED` | Current location and location permission are required. | 현재 위치와 위치 권한이 필요합니다. | 需要当前位置和定位权限。 | 需要目前位置與定位權限。 |
| ● | `voiceAssistant.command.errors.ID_NOT_IN_CONTEXT` | Search again or select a verified place. | 장소를 다시 검색하거나 선택해 주세요. | 请重新搜索或选择地点。 | 請重新搜尋或選擇地點。 |
| ● | `voiceAssistant.command.errors.STALE_CONTEXT` | Your context changed. Submit a new request. | 조건이 변경되었습니다. 다시 요청해 주세요. | 条件已发生变化。请重新提交请求。 | 條件已變更。請重新送出要求。 |
| ● | `voiceAssistant.command.errors.CANCELED` | Request canceled. | 요청이 취소되었습니다. | 请求已取消。 | 要求已取消。 |
| ● | `voiceAssistant.command.errors.TIMEOUT` | The lookup timed out. | 조회 시간이 초과되었습니다. | 查询超时。 | 查詢逾時。 |
| ● | `voiceAssistant.command.errors.AUTHENTICATION_REQUIRED` | Sign in to continue. | 로그인이 필요합니다. | 请登录后继续。 | 請登入後繼續。 |
| ● | `voiceAssistant.command.errors.FORBIDDEN` | This request is not currently supported or allowed. | 현재 지원하지 않거나 허용되지 않는 요청입니다. | 当前不支持或不允许此请求。 | 目前不支援或不允許這項要求。 |
| ● | `voiceAssistant.command.errors.NOT_FOUND` | Information was not found. | 정보를 찾을 수 없습니다. | 未找到相关信息。 | 找不到相關資訊。 |
| ● | `voiceAssistant.command.errors.RATE_LIMITED` | Too many requests. Try again later. | 요청이 많습니다. 잠시 후 다시 시도해 주세요. | 请求过多。请稍后重试。 | 要求過多。請稍後再試。 |
| ● | `voiceAssistant.command.errors.NETWORK_ERROR` | Check your network connection. | 네트워크 연결을 확인해 주세요. | 请检查网络连接。 | 請確認網路連線。 |
| ● | `voiceAssistant.command.errors.SERVER_ERROR` | The server is unavailable. Try again. | 서버에 연결할 수 없습니다. 다시 시도해 주세요. | 无法连接服务器。请重试。 | 無法連線到伺服器。請再試一次。 |
| ● | `voiceAssistant.command.errors.INVALID_SERVER_RESPONSE` | The server information could not be verified. | 서버 정보를 확인할 수 없습니다. | 无法确认服务器信息。 | 無法確認伺服器資訊。 |
| ● | `voiceAssistant.command.errors.REPLAY_CONFLICT` | Duplicate requests differ. Enter a new request. | 중복 요청의 내용이 다릅니다. 새 요청을 입력해 주세요. | 重复请求的内容不一致。请输入新的请求。 | 重複要求的內容不一致。請輸入新的要求。 |
|  | `voiceAssistant.open` | Open AI assistant | AI 어시스턴트 열기 | 打开 AI 助手 | 開啟 AI 助理 |
| ● | `voiceAssistant.shortLabel` | AI | AI | AI | AI |
|  | `voiceAssistant.brand` | Pingdy | Pingdy | Pingdy | Pingdy |
|  | `voiceAssistant.title` | AI assistant | AI 어시스턴트 | AI 助手 | AI 助理 |
|  | `voiceAssistant.close` | Close assistant | 어시스턴트 닫기 | 关闭助手 | 關閉助理 |
|  | `voiceAssistant.microphone` | Start microphone | 마이크 시작 | 启动麦克风 | 啟動麥克風 |
|  | `voiceAssistant.stop` | Stop and send | 중지하고 보내기 | 停止并发送 | 停止並傳送 |
|  | `voiceAssistant.input` | Your request | 요청 내용 | 请求内容 | 要求內容 |
|  | `voiceAssistant.placeholder` | Ask me anything! | 무엇이든 물어보세요! | 有什么都可以问我！ | 有什麼都可以問我！ |
|  | `voiceAssistant.listeningPrompt` | Listening... | 듣고있어요! | 我在听！ | 我在聽！ |
|  | `voiceAssistant.settings` | Open microphone and speech recognition settings | 마이크·음성 인식 설정 열기 | 打开麦克风和语音识别设置 | 開啟麥克風與語音辨識設定 |
|  | `voiceAssistant.preview` | Input preview: nothing is sent to a server. Use Send on the keyboard to prepare your text locally. | 입력 미리보기입니다. 서버로 전송되지 않으며, 키보드의 보내기를 누르면 기기 안에서 요청을 준비합니다. | 这是输入预览，不会发送到服务器。点按键盘上的“发送”后，将在设备内准备你的请求。 | 這是輸入預覽，不會傳送到伺服器。點選鍵盤上的「傳送」後，會在裝置內準備你的要求。 |
|  | `voiceAssistant.voiceUnavailable` | Voice recognition is unavailable on this device. You can use text input. | 이 기기에서는 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | 此设备无法使用语音识别。请使用文字输入。 | 此裝置無法使用語音辨識。請改用文字輸入。 |
|  | `voiceAssistant.feedback.unrecognized` | I’m not sure what you mean. Could you say that again? | 무슨 말을 하시는지 잘 모르겠어요, 다시 한번 부탁드려도 될까요? | 我不太明白你的意思，可以再说一遍吗？ | 我不太明白你的意思，可以再說一次嗎？ |
|  | `voiceAssistant.feedback.noSpeech` | I couldn’t hear a request. Could you say that again? | 말씀을 듣지 못했어요. 다시 한번 말씀해 주시겠어요? | 我没有听到你的请求，可以再说一遍吗？ | 我沒有聽到你的要求，可以再說一次嗎？ |
|  | `voiceAssistant.feedback.retry` | Speak again | 다시 말하기 | 再说一遍 | 再說一次 |
|  | `voiceAssistant.feedback.dismiss` | That’s okay | 괜찮아요 | 不用了 | 沒關係 |
|  | `voiceAssistant.localOnly` | Input prepared on this device. AI connection is not available yet; nothing was sent. | 이 기기에서 입력을 준비했습니다. AI 연결은 아직 제공되지 않아 전송하지 않았습니다. | 已在此设备上准备好输入。AI 连接尚未开放，因此没有发送任何内容。 | 已在此裝置上準備好輸入。AI 連線尚未開放，因此沒有傳送任何內容。 |
| ● | `voiceAssistant.advisory` | Assistant guidance may be inaccurate. Verify important details. | 어시스턴트 안내는 정확하지 않을 수 있습니다. 중요한 정보는 다시 확인해 주세요. | 助手的指引可能不准确。请再次核实重要信息。 | 助理的說明可能不準確。請再次確認重要資訊。 |
|  | `voiceAssistant.invalidResponse` | The assistant response could not be verified. Please try again. | 어시스턴트 응답을 확인할 수 없습니다. 다시 시도해 주세요. | 无法确认助手的回复。请重试。 | 無法確認助理的回覆。請再試一次。 |
|  | `voiceAssistant.clarification` | More information is needed | 추가 정보가 필요합니다 | 需要更多信息 | 需要更多資訊 |
| ● | `voiceAssistant.permissions.undetermined` | Microphone or speech recognition permission has not been requested. | 마이크 또는 음성 인식 권한을 아직 요청하지 않았습니다. | 尚未请求麦克风或语音识别权限。 | 尚未要求麥克風或語音辨識權限。 |
| ● | `voiceAssistant.permissions.granted` | Microphone and speech recognition permissions allowed. | 마이크와 음성 인식 권한이 허용되었습니다. | 已允许麦克风和语音识别权限。 | 已允許麥克風與語音辨識權限。 |
| ● | `voiceAssistant.permissions.denied` | Microphone or speech recognition permission denied. You can retry or type instead. | 마이크 또는 음성 인식 권한이 거부되었습니다. 다시 요청하거나 텍스트를 입력해 주세요. | 麦克风或语音识别权限被拒绝。你可以重试或改用文字输入。 | 麥克風或語音辨識權限遭到拒絕。你可以重試或改用文字輸入。 |
| ● | `voiceAssistant.permissions.blocked` | Microphone or speech recognition access requires a change in system settings. You can type instead. | 시스템 설정에서 마이크 또는 음성 인식 권한을 변경해야 합니다. 텍스트 입력은 사용할 수 있습니다. | 需要在系统设置中更改麦克风或语音识别权限。你可以改用文字输入。 | 需要在系統設定中變更麥克風或語音辨識權限。你可以改用文字輸入。 |
| ● | `voiceAssistant.permissions.restricted` | Speech recognition is restricted by this device’s policy. You can type instead. | 기기 정책으로 음성 인식이 제한되어 있습니다. 텍스트로 입력해 주세요. | 此设备的策略限制了语音识别。请使用文字输入。 | 此裝置的政策限制了語音辨識。請改用文字輸入。 |
|  | `voiceAssistant.phases.idle` | Ready for input | 입력 대기 | 等待输入 | 等待輸入 |
| ● | `voiceAssistant.phases.permissionRequesting` | Checking microphone and speech recognition permissions | 마이크·음성 인식 권한 확인 중 | 正在确认麦克风和语音识别权限 | 正在確認麥克風與語音辨識權限 |
|  | `voiceAssistant.phases.listening` | Microphone on — listening | 마이크 켜짐 — 듣는 중 | 麦克风已开启 — 正在聆听 | 麥克風已開啟 — 正在聆聽 |
|  | `voiceAssistant.phases.processing` | Microphone stopping — processing speech | 마이크 중지 중 — 음성 처리 중 | 麦克风正在停止 — 正在处理语音 | 麥克風正在停止 — 正在處理語音 |
|  | `voiceAssistant.phases.final` | Final input ready | 최종 입력 준비됨 | 最终输入已就绪 | 最終輸入已就緒 |
|  | `voiceAssistant.phases.canceled` | Input canceled | 입력 취소됨 | 输入已取消 | 輸入已取消 |
| ● | `voiceAssistant.phases.permissionDenied` | Voice permission denied | 음성 입력 권한 거부됨 | 语音权限被拒绝 | 語音權限遭拒 |
|  | `voiceAssistant.phases.unavailable` | Voice input unavailable | 음성 입력 사용 불가 | 语音输入不可用 | 無法使用語音輸入 |
| ● | `voiceAssistant.phases.error` | Input could not be completed | 입력을 완료하지 못했습니다 | 无法完成输入 | 無法完成輸入 |
| ● | `voiceAssistant.errors.interrupted` | Audio was interrupted. Try again or type your request. | 다른 오디오 작업으로 중단되었습니다. 다시 시도하거나 텍스트로 입력해 주세요. | 音频被其他任务中断。请重试或改用文字输入。 | 音訊被其他作業中斷。請重試或改用文字輸入。 |
| ● | `voiceAssistant.errors.noSpeech` | No final speech was recognized. Try again or type your request. | 최종 음성을 인식하지 못했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | 未识别到最终语音。请重试或改用文字输入。 | 未辨識到最終語音。請重試或改用文字輸入。 |
| ● | `voiceAssistant.errors.unavailable` | Speech recognition is unavailable. Please type your request. | 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | 语音识别不可用。请使用文字输入。 | 無法使用語音辨識。請改用文字輸入。 |
| ● | `voiceAssistant.errors.network` | The speech service could not connect. Check your network or type your request. | 음성 인식 서비스에 연결하지 못했습니다. 네트워크를 확인하거나 텍스트로 입력해 주세요. | 无法连接语音识别服务。请检查网络或改用文字输入。 | 無法連線到語音辨識服務。請確認網路或改用文字輸入。 |
| ● | `voiceAssistant.errors.failed` | Speech recognition failed. Please type or try again. | 음성 인식에 실패했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | 语音识别失败。请重试或改用文字输入。 | 語音辨識失敗。請重試或改用文字輸入。 |
| ● | `voiceAssistant.errors.empty` | Enter a request first. | 요청을 먼저 입력해 주세요. | 请先输入请求。 | 請先輸入要求。 |
| ● | `voiceAssistant.errors.tooLong` | Use 2,000 characters or fewer. | 2,000자 이내로 입력해 주세요. | 请输入不超过 2,000 个字符。 | 請輸入 2,000 個字元以內。 |
| ● | `voiceAssistant.errors.submitFailed` | Input could not be handed over. Close the assistant and start a new request. | 입력을 전달하지 못했습니다. 어시스턴트를 닫고 새 요청을 시작해 주세요. | 无法传递输入。请关闭助手并开始新的请求。 | 無法傳遞輸入。請關閉助理並開始新的要求。 |

## `selectLanguage`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `selectLanguage.title` | Select Language | 언어 선택 | 选择语言 | 選擇語言 |
|  | `selectLanguage.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | 我们会为你提供最佳路线！ | 我們會為你提供最佳路線！ |
|  | `selectLanguage.button` | Continue | 계속 | 继续 | 繼續 |
|  | `selectLanguage.search` | Search... | 검색하기 | 搜索… | 搜尋… |
| ● | `selectLanguage.logoAccessibilityLabel` | PingDom logo | 핑덤 로고 | PingDom 标志 | PingDom 標誌 |
|  | `selectLanguage.options.en` | English | 영어 | 英语 | 英文 |
|  | `selectLanguage.options.ko` | Korean | 한국어 | 韩语 | 韓文 |
|  | `selectLanguage.options.ja` | 日本語 | 日本語 | 日语 | 日文 |
|  | `selectLanguage.options.zh-CN` | Chinese (Simplified) | 중국어(간체) | 简体中文 | 簡體中文 |
|  | `selectLanguage.options.zh-TW` | Chinese (Traditional) | 중국어(번체) | 繁体中文 | 繁體中文 |
|  | `selectLanguage.options.vi` | Vietnamese | 베트남어 | 越南语 | 越南文 |
|  | `selectLanguage.options.es` | Spanish | 스페인어 | 西班牙语 | 西班牙文 |
|  | `selectLanguage.options.pt-BR` | Portuguese (Brazil) | 포르투갈어(브라질) | 葡萄牙语（巴西） | 葡萄牙文（巴西） |
|  | `selectLanguage.progress` | Step {{current}} of {{total}} | 총 {{total}}단계 중 {{current}}단계 | 第 {{current}} 步，共 {{total}} 步 | 第 {{current}} 步，共 {{total}} 步 |

## `selectCountry`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `selectCountry.title` | Select Country | 국가 선택 | 选择国家 | 選擇國家 |
|  | `selectCountry.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | 我们会为你提供最佳路线！ | 我們會為你提供最佳路線！ |
|  | `selectCountry.button` | Continue | 계속 | 继续 | 繼續 |
|  | `selectCountry.search` | Search... | 검색하기 | 搜索… | 搜尋… |

## `selectAge`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `selectAge.title` | Select Birth Year | 생년 선택 | 选择出生年份 | 選擇出生年份 |
|  | `selectAge.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | 我们会为你提供最佳路线！ | 我們會為你提供最佳路線！ |
|  | `selectAge.button` | Continue | 계속 | 继续 | 繼續 |

## `selectGender`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `selectGender.title` | Select gender | 성별 선택 | 选择性别 | 選擇性別 |
|  | `selectGender.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | 我们会为你提供最佳路线！ | 我們會為你提供最佳路線！ |
|  | `selectGender.button` | Continue | 계속 | 继续 | 繼續 |
|  | `selectGender.male` | Male | 남성 | 男 | 男性 |
|  | `selectGender.female` | Female | 여성 | 女 | 女性 |
|  | `selectGender.other` | Prefer not to say | 비공개 | 不愿透露 | 不願透露 |

## `countries`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `countries.us` | United States | 미국 | 美国 | 美國 |
|  | `countries.cn` | China | 중국 | 中国 | 中國 |
|  | `countries.jp` | Japan | 일본 | 日本 | 日本 |
|  | `countries.th` | Thailand | 태국 | 泰国 | 泰國 |
|  | `countries.vn` | Vietnam | 베트남 | 越南 | 越南 |
|  | `countries.kr` | South Korea | 대한민국 | 韩国 | 韓國 |

## `loginForeign`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `loginForeign.title` | Only Pingdom | 오직 핑덤 | 只在 PingDom | 只在 PingDom |
|  | `loginForeign.subtitle` | Let's find hidden<br>places in Korea! | 한국의 숨은 장소를<br>찾아보세요! | 一起发现韩国的<br>隐藏好去处吧！ | 一起發掘韓國的<br>私房景點吧！ |
|  | `loginForeign.button` | Get Started | 시작하기 | 开始使用 | 開始使用 |

## `experience`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `experience.common.back` | Back to map | 지도로 돌아가기 | 返回地图 | 返回地圖 |
|  | `experience.common.close` | Close | 닫기 | 关闭 | 關閉 |
|  | `experience.common.loading` | Loading. Please wait. | 불러오는 중입니다. 잠시 기다려 주세요. | 正在加载，请稍候。 | 正在載入，請稍候。 |
|  | `experience.placeDetail.title` | Place details | 장소 상세 | 地点详情 | 地點詳情 |
|  | `experience.placeDetail.open` | Open now | 영업 중 | 营业中 | 營業中 |
|  | `experience.placeDetail.distance` | {{distance}} away | {{distance}} 거리 | 距离 {{distance}} | 距離 {{distance}} |
|  | `experience.placeDetail.checked` | Visitor information updated {{date}} | 방문자 정보 업데이트 {{date}} | 访客信息更新于 {{date}} | 訪客資訊更新於 {{date}} |
|  | `experience.placeDetail.couponPrice` | Coupon value {{price}} | 쿠폰 혜택 {{price}} | 优惠券价值 {{price}} | 優惠券價值 {{price}} |
|  | `experience.placeDetail.checkIn` | Check in at this place | 이 장소에 체크인하기 | 在此地点签到 | 在此地點打卡 |
|  | `experience.placeDetail.coupon` | View available coupons | 사용 가능한 쿠폰 보기 | 查看可用优惠券 | 查看可用優惠券 |
|  | `experience.checkIn.title` | Check in | 체크인 | 签到 | 打卡 |
|  | `experience.checkIn.description` | Confirm that you are visiting this place to unlock local benefits. | 장소 방문을 확인하고 현지 방문객 혜택을 받아보세요. | 确认你到访了此地点，即可解锁当地访客福利。 | 確認你造訪了此地點，即可解鎖在地訪客優惠。 |
|  | `experience.checkIn.status` | Ready to confirm your location | 현재 위치 확인 준비 완료 | 已准备好确认你的位置 | 已準備好確認你的位置 |
|  | `experience.checkIn.action` | Confirm my location and complete check-in | 내 위치를 확인하고 체크인 완료하기 | 确认我的位置并完成签到 | 確認我的位置並完成打卡 |
|  | `experience.checkIn.collapseVisits` | Show less | 접기 | 收起 | 收合 |
|  | `experience.checkIn.expandVisits` | Show all | 전체 보기 | 查看全部 | 查看全部 |
|  | `experience.checkIn.loadMoreVisits` | Load more visits | 방문 기록 더 보기 | 加载更多到访记录 | 載入更多造訪紀錄 |
| ● | `experience.checkIn.locationDenied` | Location permission is required to check in. | 체크인하려면 위치 권한이 필요합니다. | 签到需要定位权限。 | 打卡需要定位權限。 |
| ● | `experience.checkIn.locationFailed` | Your current location could not be retrieved. | 현재 위치를 가져오지 못했습니다. | 无法获取你的当前位置。 | 無法取得你的目前位置。 |
|  | `experience.checkIn.locationLoading` | Checking your current location… | 현재 위치를 확인하고 있습니다… | 正在确认你的当前位置… | 正在確認你的目前位置… |
|  | `experience.checkIn.openSettings` | Open settings | 설정 열기 | 打开设置 | 開啟設定 |
|  | `experience.checkIn.recentVisits` | Recent visits | 최근 방문 | 最近到访 | 最近造訪 |
|  | `experience.checkIn.retryCheckIn` | Try check-in again | 체크인 다시 시도 | 重新签到 | 重新打卡 |
|  | `experience.checkIn.retryLocation` | Try location again | 위치 다시 확인 | 重新确认位置 | 重新確認位置 |
|  | `experience.checkIn.retryVisits` | Try loading visits again | 방문 기록 다시 불러오기 | 重新加载到访记录 | 重新載入造訪紀錄 |
|  | `experience.checkIn.selectedPlace` | Selected place ID {{placeId}} | 선택한 장소 ID {{placeId}} | 所选地点 ID {{placeId}} | 所選地點 ID {{placeId}} |
|  | `experience.checkIn.submitting` | Checking in. Please wait. | 체크인 중입니다. 잠시 기다려 주세요. | 正在签到，请稍候。 | 正在打卡，請稍候。 |
|  | `experience.checkIn.success` | Check-in complete | 체크인이 완료되었습니다. | 签到完成 | 打卡完成 |
|  | `experience.checkIn.visitDistance` | {{distance}} m away | 장소와 {{distance}}m 거리 | 距离 {{distance}} 米 | 距離 {{distance}} 公尺 |
|  | `experience.checkIn.visitPlace` | Place ID {{placeId}} | 장소 ID {{placeId}} | 地点 ID {{placeId}} | 地點 ID {{placeId}} |
|  | `experience.checkIn.visitsEmpty` | No recent visits yet. | 아직 최근 방문 기록이 없습니다. | 还没有最近的到访记录。 | 目前還沒有最近的造訪紀錄。 |
|  | `experience.checkIn.visitsLoading` | Loading recent visits… | 최근 방문 기록을 불러오고 있습니다… | 正在加载最近的到访记录… | 正在載入最近的造訪紀錄… |
| ● | `experience.checkIn.errors.authentication` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | 登录已过期。请重新登录。 | 登入已過期。請重新登入。 |
| ● | `experience.checkIn.errors.duplicate` | You have already checked in at this place under the current server policy. | 현재 서버 정책상 이미 체크인한 장소입니다. | 根据当前服务器政策，你已在此地点签到过。 | 依目前的伺服器政策，你已在此地點打卡過。 |
| ● | `experience.checkIn.errors.generic` | Check-in could not be completed. Please try again. | 체크인을 완료하지 못했습니다. 다시 시도해 주세요. | 无法完成签到。请重试。 | 無法完成打卡。請再試一次。 |
| ● | `experience.checkIn.errors.network` | You appear to be offline. Check your connection and try again. | 네트워크에 연결되지 않았습니다. 연결을 확인한 뒤 다시 시도해 주세요. | 你似乎处于离线状态。请检查网络连接后重试。 | 你似乎處於離線狀態。請確認網路連線後再試一次。 |
| ● | `experience.checkIn.errors.out-of-range` | You are too far from this place to check in. | 장소와 거리가 멀어 체크인할 수 없습니다. | 你距离此地点太远，无法签到。 | 你距離此地點太遠，無法打卡。 |
|  | `experience.coupon.title` | Coupon wallet | 쿠폰 지갑 | 优惠券包 | 優惠券匣 |
|  | `experience.coupon.description` | Coupons that are ready to use appear here. | 바로 사용할 수 있는 쿠폰이 이곳에 표시됩니다. | 可立即使用的优惠券会显示在这里。 | 可立即使用的優惠券會顯示在這裡。 |
|  | `experience.coupon.status` | No available coupons | 사용 가능한 쿠폰 없음 | 暂无可用优惠券 | 沒有可用的優惠券 |
|  | `experience.coupon.action` | Explore places offering visitor coupons | 방문객 쿠폰을 제공하는 장소 둘러보기 | 看看提供访客优惠券的地点 | 看看提供訪客優惠券的地點 |

## `auth`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `auth.koreanEntry.title` | My own places, Pingdom | 나만의 장소, 핑덤 | 属于我的地点，PingDom | 屬於我的地點，PingDom |
|  | `auth.koreanEntry.subtitle` | Share your places<br>with visitors from abroad! | 당신만의 장소를<br>외국인들에게 공유해주세요! | 把你的私藏地点<br>分享给外国游客吧！ | 把你的私房地點<br>分享給外國旅客吧！ |
|  | `auth.koreanEntry.existingAccount` | Already have an account?  | 이미 계정이 있으신가요?  | 已有账号？  | 已經有帳號了嗎？  |
|  | `auth.koreanEntry.login` | Log in | 로그인 | 登录 | 登入 |
|  | `auth.koreanEntry.start` | Get Started | 시작하기 | 开始使用 | 開始使用 |
|  | `auth.login.title` | Start Pingdom | 핑덤 시작하기 | 开始使用 PingDom | 開始使用 PingDom |
|  | `auth.login.username` | Username | 아이디 | 用户名 | 帳號 |
|  | `auth.login.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | 请输入用户名 | 請輸入帳號 |
|  | `auth.login.password` | Password | 비밀번호 | 密码 | 密碼 |
|  | `auth.login.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | 请输入密码 | 請輸入密碼 |
|  | `auth.login.submit` | Get Started | 시작하기 | 开始使用 | 開始使用 |
|  | `auth.login.submitting` | Logging in... | 로그인 중... | 正在登录… | 正在登入… |
|  | `auth.login.findUsername` | Find ID | 아이디 찾기 | 找回用户名 | 找回帳號 |
|  | `auth.login.findPassword` | Find password | 비밀번호 찾기 | 找回密码 | 找回密碼 |
|  | `auth.login.signup` | Sign up | 회원가입 | 注册 | 註冊 |
| ● | `auth.login.unknownError` | An unknown error occurred while logging in. | 로그인 중 알 수 없는 오류가 발생했습니다. | 登录时发生未知错误。 | 登入時發生未知錯誤。 |
|  | `auth.passwordReset.confirmDescription` | Enter the reset code sent to {{email}} and choose a new password. | {{email}}로 보낸 재설정 코드를 입력하고 새 비밀번호를 설정해주세요. | 请输入发送到 {{email}} 的重置验证码，并设置新密码。 | 請輸入寄到 {{email}} 的重設驗證碼，並設定新密碼。 |
|  | `auth.passwordReset.confirmTitle` | Set a new password | 새 비밀번호 설정 | 设置新密码 | 設定新密碼 |
|  | `auth.passwordReset.invalidToken` | That reset code is not valid. Check the code or request a new one. | 재설정 코드가 올바르지 않습니다. 코드를 확인하거나 다시 요청해주세요. | 重置验证码无效。请检查验证码或重新获取。 | 重設驗證碼無效。請確認驗證碼或重新取得。 |
|  | `auth.passwordReset.newPassword` | New password | 새 비밀번호 | 新密码 | 新密碼 |
|  | `auth.passwordReset.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | 至少 8 个字符 | 至少 8 個字元 |
|  | `auth.passwordReset.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | 密码至少需要 8 个字符 | 密碼至少需要 8 個字元 |
|  | `auth.passwordReset.processing` | Processing... | 처리 중... | 处理中… | 處理中… |
|  | `auth.passwordReset.requestDescription` | Enter the email you signed up with. We will send you a reset code. | 가입한 이메일을 입력하시면 재설정 코드를 보내드려요. | 请输入注册时使用的邮箱，我们会向你发送重置验证码。 | 請輸入註冊時使用的電子郵件，我們會寄送重設驗證碼給你。 |
|  | `auth.passwordReset.requestTitle` | Reset your password | 비밀번호 재설정 | 重置密码 | 重設密碼 |
|  | `auth.passwordReset.resend` | Send the code again | 코드 다시 보내기 | 重新发送验证码 | 重新寄送驗證碼 |
|  | `auth.passwordReset.sendToken` | Send reset code | 재설정 코드 받기 | 获取重置验证码 | 取得重設驗證碼 |
|  | `auth.passwordReset.submit` | Reset password | 비밀번호 재설정하기 | 重置密码 | 重設密碼 |
|  | `auth.passwordReset.token` | Reset code | 재설정 코드 | 重置验证码 | 重設驗證碼 |
|  | `auth.passwordReset.tokenPlaceholder` | Enter the code from your email | 메일로 받은 코드를 입력하세요 | 请输入邮件中的验证码 | 請輸入郵件中的驗證碼 |
|  | `auth.passwordReset.tokenRequired` | Please enter the reset code | 재설정 코드를 입력해주세요 | 请输入重置验证码 | 請輸入重設驗證碼 |
| ● | `auth.passwordReset.unknownError` | An unknown error occurred while resetting your password. | 비밀번호 재설정 중 알 수 없는 오류가 발생했습니다. | 重置密码时发生未知错误。 | 重設密碼時發生未知錯誤。 |
|  | `auth.signup.title` | Start Pingdom | 핑덤 시작하기 | 开始使用 PingDom | 開始使用 PingDom |
|  | `auth.signup.passwordTitle` | Confirm Password | 비밀번호 확인 | 确认密码 | 確認密碼 |
|  | `auth.signup.username` | Username | 아이디 | 用户名 | 帳號 |
|  | `auth.signup.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | 请输入用户名 | 請輸入帳號 |
|  | `auth.signup.email` | Email | 이메일 | 邮箱 | 電子郵件 |
|  | `auth.signup.emailPlaceholder` | Enter your email | 이메일을 입력하세요 | 请输入邮箱 | 請輸入電子郵件 |
|  | `auth.signup.password` | Password | 비밀번호 | 密码 | 密碼 |
|  | `auth.signup.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | 请输入密码 | 請輸入密碼 |
|  | `auth.signup.passwordConfirm` | Confirm password | 비밀번호 확인 | 确认密码 | 確認密碼 |
|  | `auth.signup.passwordConfirmPlaceholder` | Enter your password again | 비밀번호를 한번 더 입력하세요 | 请再次输入密码 | 請再次輸入密碼 |
|  | `auth.signup.next` | Next | 다음 | 下一步 | 下一步 |
|  | `auth.signup.start` | Get Started | 시작하기 | 开始使用 | 開始使用 |
|  | `auth.signup.processing` | Processing... | 처리 중... | 处理中… | 處理中… |
| ● | `auth.signup.unknownError` | An unknown error occurred while signing up. | 회원가입 중 알 수 없는 오류가 발생했습니다. | 注册时发生未知错误。 | 註冊時發生未知錯誤。 |
| ● | `auth.validation.usernameRequired` | Please enter your username | 아이디를 입력해주세요 | 请输入用户名 | 請輸入帳號 |
| ● | `auth.validation.emailRequired` | Please enter your email | 이메일을 입력해주세요 | 请输入邮箱 | 請輸入電子郵件 |
| ● | `auth.validation.emailInvalid` | Please enter a valid email address | 올바른 이메일 형식이 아닙니다 | 请输入有效的邮箱地址 | 請輸入有效的電子郵件地址 |
| ● | `auth.validation.passwordRequired` | Please enter your password | 비밀번호를 입력해주세요 | 请输入密码 | 請輸入密碼 |
| ● | `auth.validation.passwordConfirmRequired` | Please enter your password again | 비밀번호를 한번 더 입력해주세요 | 请再次输入密码 | 請再次輸入密碼 |
| ● | `auth.validation.passwordMismatch` | Passwords do not match | 비밀번호가 일치하지 않습니다 | 两次输入的密码不一致 | 兩次輸入的密碼不一致 |

## `common`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `common.missingTranslation` | Translation unavailable | 번역을 제공할 수 없습니다 | 暂无翻译 | 暫無翻譯 |
|  | `common.navigation.back` | Go back | 뒤로 가기 | 返回 | 返回 |
|  | `common.navigation.close` | Close | 닫기 | 关闭 | 關閉 |
| ● | `common.navigation.exitHint` | Press back again to exit the app. | 뒤로가기를 한 번 더 누르면 앱이 종료됩니다. | 再按一次返回键即可退出应用。 | 再按一次返回鍵即可結束 App。 |
|  | `common.navigation.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `common.unsupportedFeature.description` | This feature is not currently supported in the app. | 이 기능은 현재 앱에서 지원하지 않습니다. | 应用目前不支持此功能。 | App 目前不支援這項功能。 |
|  | `common.unsupportedFeature.title` | Not available in the app | 앱에서 제공하지 않는 기능 | 应用内暂不提供 | App 內暫不提供 |
| ● | `common.apiError.timeout.title` | The response is taking too long | 응답 시간이 초과되었어요 | 响应时间过长 | 回應時間過長 |
| ● | `common.apiError.timeout.description` | Check your connection and try loading again. | 연결을 확인하고 다시 조회해 주세요. | 请检查网络连接后重新加载。 | 請確認網路連線後重新載入。 |
| ● | `common.apiError.server.title` | Service temporarily unavailable | 서비스에 잠시 연결할 수 없어요 | 服务暂时不可用 | 服務暫時無法使用 |
| ● | `common.apiError.server.description` | Please try loading again in a moment. | 잠시 후 다시 조회해 주세요. | 请稍后重新加载。 | 請稍後重新載入。 |
| ● | `common.apiError.rateLimited.title` | Too many requests | 요청이 너무 많아요 | 请求过多 | 要求過多 |
| ● | `common.apiError.rateLimited.description` | Please wait a moment before trying again. | 잠시 기다린 후 다시 시도해 주세요. | 请稍等片刻后重试。 | 請稍候片刻後再試一次。 |
| ● | `common.apiError.mutationUnknown.title` | Result not confirmed | 처리 결과를 확인해 주세요 | 结果未确认 | 結果尚未確認 |
| ● | `common.apiError.mutationUnknown.description` | We could not confirm the result. Check the latest status before submitting again. | 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 최신 상태를 확인해 주세요. | 无法确认处理结果。再次提交前请先查看最新状态。 | 無法確認處理結果。再次送出前請先查看最新狀態。 |
| ● | `common.apiError.actions.back` | Go back | 목록으로 | 返回 | 返回 |
| ● | `common.apiError.actions.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
| ● | `common.apiError.actions.signIn` | Sign in again | 다시 로그인 | 重新登录 | 重新登入 |
| ● | `common.apiError.actions.update` | Update app | 앱 업데이트 | 更新应用 | 更新 App |
| ● | `common.apiError.authentication.description` | Your session is no longer valid. Please sign in again. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | 登录已失效。请重新登录。 | 登入已失效。請重新登入。 |
| ● | `common.apiError.authentication.title` | Sign-in required | 로그인이 필요합니다 | 需要登录 | 需要登入 |
| ● | `common.apiError.authorization.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | 此账号没有执行该操作的权限。 | 此帳號沒有執行這項操作的權限。 |
| ● | `common.apiError.authorization.title` | Permission required | 권한이 필요합니다 | 需要权限 | 需要權限 |
| ● | `common.apiError.conflict.description` | The request conflicts with the resource’s current state. Refresh its latest state. | 리소스의 현재 상태와 요청이 충돌합니다. 최신 상태를 확인해 주세요. | 请求与资源的当前状态冲突。请刷新以获取最新状态。 | 要求與資源的目前狀態衝突。請重新整理以取得最新狀態。 |
| ● | `common.apiError.conflict.title` | State has changed | 상태가 변경되었습니다 | 状态已变更 | 狀態已變更 |
| ● | `common.apiError.expired.description` | This coupon or resource has expired. | 쿠폰 또는 리소스의 이용 기간이 만료되었습니다. | 此优惠券或资源已过期。 | 這張優惠券或資源已過期。 |
| ● | `common.apiError.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | 已无法使用 | 已無法使用 |
| ● | `common.apiError.generic.description` | Please check your connection and try again. | 네트워크 상태를 확인한 후 다시 시도해 주세요. | 请检查网络连接后重试。 | 請確認網路連線後再試一次。 |
| ● | `common.apiError.generic.title` | Could not load data | 데이터를 불러오지 못했습니다 | 无法加载数据 | 無法載入資料 |
| ● | `common.apiError.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | 无法连接服务器。请检查网络连接后重试。 | 無法連線到伺服器。請確認網路連線後再試一次。 |
| ● | `common.apiError.network.title` | Connection problem | 연결에 문제가 있습니다 | 连接出现问题 | 連線發生問題 |
| ● | `common.apiError.notFound.description` | The requested resource no longer exists. Return to the latest list. | 요청한 항목이 더 이상 존재하지 않습니다. 최신 목록으로 돌아가 주세요. | 请求的内容已不存在。请返回最新列表。 | 要求的項目已不存在。請返回最新清單。 |
| ● | `common.apiError.notFound.title` | Not found | 항목을 찾을 수 없습니다 | 未找到 | 找不到項目 |
| ● | `common.apiError.outOfRange.description` | Move closer to the place and check your location accuracy. | 장소에 더 가까이 이동하고 위치 정확도를 확인해 주세요. | 请靠近该地点，并检查定位精度。 | 請靠近該地點，並確認定位精確度。 |
| ● | `common.apiError.outOfRange.title` | Too far away to check in | 체크인 가능 거리 밖입니다 | 距离太远，无法签到 | 距離太遠，無法打卡 |
| ● | `common.apiError.updateRequired.description` | Install the latest version to keep using PingDom. | PingDom을 계속 사용하려면 최신 버전을 설치해 주세요. | 请安装最新版本以继续使用 PingDom。 | 請安裝最新版本以繼續使用 PingDom。 |
| ● | `common.apiError.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | 需要更新 | 需要更新 |
| ● | `common.apiError.validation.description` | Review the highlighted information and try again. | 입력한 정보를 확인한 후 다시 시도해 주세요. | 请检查标出的信息后重试。 | 請確認標示的資訊後再試一次。 |
| ● | `common.apiError.validation.title` | Check your entries | 입력 정보를 확인해 주세요 | 请检查输入内容 | 請確認輸入內容 |
| ● | `common.error.description` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | 请稍后重试。 | 請稍後再試。 |
| ● | `common.error.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
| ● | `common.error.title` | Something went wrong | 문제가 발생했습니다 | 出现问题 | 發生問題 |

## `placeMenu`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `placeMenu.exchange.amount` | Approx. {{price}} | 약 {{price}} | 约 {{price}} | 約 {{price}} |
|  | `placeMenu.exchange.loading` | Loading exchange rate… | 환율을 불러오는 중입니다… | 正在加载汇率… | 正在載入匯率… |
|  | `placeMenu.exchange.retry` | Exchange rate unavailable · Try again | 환율 조회 실패 · 다시 시도 | 汇率不可用 · 重试 | 無法取得匯率 · 再試一次 |
| ● | `placeMenu.accessibility.image` | {{name}} menu image | {{name}} 메뉴 이미지 | {{name}} 菜单图片 | {{name}} 菜單圖片 |
| ● | `placeMenu.accessibility.imageUnavailable` | No image for {{name}} | {{name}} 메뉴 이미지 없음 | {{name}} 没有图片 | {{name}} 沒有圖片 |
| ● | `placeMenu.accessibility.price` | Price: {{price}} | 가격: {{price}} | 价格：{{price}} | 價格：{{price}} |
| ● | `placeMenu.accessibility.status` | {{name}} status: {{status}} | {{name}} 상태: {{status}} | {{name}} 状态：{{status}} | {{name}} 狀態：{{status}} |
| ● | `placeMenu.error.notFound` | The place details and menu data are temporarily out of sync. Refresh this menu or return to the map. | 장소 상세와 메뉴 데이터가 일시적으로 일치하지 않습니다. 메뉴를 새로고침하거나 지도로 돌아가 주세요. | 地点详情与菜单数据暂时不一致。请刷新菜单或返回地图。 | 地點詳情與菜單資料暫時不一致。請重新整理菜單或返回地圖。 |
| ● | `placeMenu.error.title` | Could not load the menu. | 메뉴를 불러오지 못했습니다. | 无法加载菜单。 | 無法載入菜單。 |
|  | `placeMenu.empty` | No menu has been added yet. | 등록된 메뉴가 없습니다. | 尚未添加菜单。 | 尚未新增菜單。 |
|  | `placeMenu.imageUnavailable` | No image | 이미지 없음 | 暂无图片 | 沒有圖片 |
|  | `placeMenu.loading` | Loading menu… | 메뉴를 불러오는 중입니다… | 正在加载菜单… | 正在載入菜單… |
|  | `placeMenu.priceUnavailable` | Price unavailable | 가격 정보 없음 | 暂无价格信息 | 無價格資訊 |
|  | `placeMenu.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `placeMenu.soldOut` | Sold out | 품절 | 已售罄 | 已售完 |
|  | `placeMenu.title` | Menu | 메뉴 | 菜单 | 菜單 |

## `examplePlaces`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `examplePlaces.count` | {{count}} places | 장소 {{count}}개 | {{count}} 个地点 | {{count}} 個地點 |
|  | `examplePlaces.englishMenu` | English menu: {{status}} | 영문 메뉴: {{status}} | 英文菜单：{{status}} | 英文菜單：{{status}} |
|  | `examplePlaces.emptyDescription` | Try again after place data is available. | 장소 데이터가 등록된 후 다시 확인해 주세요. | 请在地点数据可用后重试。 | 請在地點資料可用後再試一次。 |
|  | `examplePlaces.emptyTitle` | No places yet | 아직 등록된 장소가 없습니다 | 还没有地点 | 目前還沒有地點 |
|  | `examplePlaces.loading` | Loading places... | 장소를 불러오는 중입니다... | 正在加载地点… | 正在載入地點… |
|  | `examplePlaces.title` | Place list example | 장소 목록 예제 | 地点列表示例 | 地點清單範例 |
|  | `examplePlaces.trustScore` | Trust score: {{score}}/100 | 신뢰 점수: {{score}}/100 | 可信度评分：{{score}}/100 | 信任分數：{{score}}/100 |

## `merchant`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `merchant.pendingDescription` | Merchant {{merchantId}} is not available yet. | 상점 {{merchantId}}는 아직 준비 중입니다. | 商家 {{merchantId}} 尚未开放。 | 店家 {{merchantId}} 尚未開放。 |
|  | `merchant.title` | Merchant | 상점 | 商家 | 店家 |

## `onboarding`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `onboarding.preferenceFlow.loading` | Restoring your saved travel preferences... | 저장된 여행 선호를 불러오는 중입니다... | 正在恢复已保存的旅行偏好… | 正在還原已儲存的旅行偏好… |
| ● | `onboarding.preferenceFlow.restoreError` | Saved preferences could not be restored. You can continue with new selections. | 저장된 선택을 불러오지 못했어요. 새로 선택해 계속할 수 있어요. | 无法恢复已保存的偏好。你可以重新选择后继续。 | 無法還原已儲存的偏好。你可以重新選擇後繼續。 |
| ● | `onboarding.preferenceFlow.saveError` | Your selections could not be saved. Please try Continue again. | 선택값을 저장하지 못했어요. 계속 버튼을 다시 눌러 주세요. | 无法保存你的选择。请再次点按“继续”。 | 無法儲存你的選擇。請再點一次「繼續」。 |
|  | `onboarding.preferences.currentNeeds.attendEvent` | Events | 이벤트 관람 | 看活动 | 看活動 |
|  | `onboarding.preferences.currentNeeds.cafe` | Cafe | 카페 | 咖啡馆 | 咖啡廳 |
|  | `onboarding.preferences.currentNeeds.eat` | Food | 식사 | 用餐 | 用餐 |
|  | `onboarding.preferences.currentNeeds.explore` | Explore | 둘러보기 | 逛逛 | 逛逛 |
|  | `onboarding.preferences.currentNeeds.nightlife` | Nightlife | 나이트라이프 | 夜生活 | 夜生活 |
|  | `onboarding.preferences.currentNeeds.shop` | Shopping | 쇼핑 | 购物 | 購物 |
|  | `onboarding.preferences.travelPurposes.beauty` | Beauty | 뷰티 | 美妆 | 美妝 |
|  | `onboarding.preferences.travelPurposes.cafe` | Cafe | 카페 | 咖啡馆 | 咖啡廳 |
|  | `onboarding.preferences.travelPurposes.exhibition` | Exhibition | 전시 | 展览 | 展覽 |
|  | `onboarding.preferences.travelPurposes.fashion` | Fashion | 패션 | 时尚 | 時尚 |
|  | `onboarding.preferences.travelPurposes.food` | Food | 음식 | 美食 | 美食 |
|  | `onboarding.preferences.travelPurposes.kPop` | Music | 음악 | 音乐 | 音樂 |
|  | `onboarding.preferences.travelPurposes.other` | Others | 기타 | 其他 | 其他 |
|  | `onboarding.preferences.travelPurposes.popUp` | Pop-up | 팝업 | 快闪店 | 快閃店 |
|  | `onboarding.travelScheduleScreen.back` | Back | 뒤로 가기 | 返回 | 返回 |
|  | `onboarding.travelScheduleScreen.calendar` | Travel date calendar | 여행 일정 달력 | 旅行日期日历 | 旅行日期月曆 |
|  | `onboarding.travelScheduleScreen.continue` | Continue | 계속 | 继续 | 繼續 |
|  | `onboarding.travelScheduleScreen.description` | Please select your start and end dates | 여행 시작일과 종료일을 선택해 주세요 | 请选择旅行的开始和结束日期 | 請選擇旅行的開始與結束日期 |
|  | `onboarding.travelScheduleScreen.emptyDate` | Not selected | 선택 전 | 未选择 | 尚未選擇 |
|  | `onboarding.travelScheduleScreen.endDate` | End date | 종료일 | 结束日期 | 結束日期 |
|  | `onboarding.travelScheduleScreen.invalidRange` | Check your dates and select a valid range again. | 날짜를 확인하고 올바른 기간을 다시 선택해 주세요. | 请检查日期并重新选择有效的时间范围。 | 請確認日期並重新選擇有效的期間。 |
|  | `onboarding.travelScheduleScreen.nextMonth` | Next month | 다음 달 | 下个月 | 下個月 |
|  | `onboarding.travelScheduleScreen.previousMonth` | Previous month | 이전 달 | 上个月 | 上個月 |
|  | `onboarding.travelScheduleScreen.progress` | Onboarding progress | 온보딩 진행 단계 | 引导流程进度 | 導覽流程進度 |
|  | `onboarding.travelScheduleScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | 第 {{current}} 步，共 {{total}} 步 | 第 {{current}} 步，共 {{total}} 步 |
|  | `onboarding.travelScheduleScreen.startDate` | Start date | 시작일 | 开始日期 | 開始日期 |
|  | `onboarding.travelScheduleScreen.title` | Select Travel Dates | 여행 일정을 알려주세요 | 请选择旅行日期 | 請選擇旅行日期 |
|  | `onboarding.travelScheduleScreen.weekdays.fri` | F | 금 | 五 | 五 |
|  | `onboarding.travelScheduleScreen.weekdays.mon` | M | 월 | 一 | 一 |
|  | `onboarding.travelScheduleScreen.weekdays.sat` | S | 토 | 六 | 六 |
|  | `onboarding.travelScheduleScreen.weekdays.sun` | S | 일 | 日 | 日 |
|  | `onboarding.travelScheduleScreen.weekdays.thu` | T | 목 | 四 | 四 |
|  | `onboarding.travelScheduleScreen.weekdays.tue` | T | 화 | 二 | 二 |
|  | `onboarding.travelScheduleScreen.weekdays.wed` | W | 수 | 三 | 三 |
|  | `onboarding.travelPurposeScreen.back` | Back | 뒤로 가기 | 返回 | 返回 |
|  | `onboarding.travelPurposeScreen.continue` | Continue | 계속 | 继续 | 繼續 |
|  | `onboarding.travelPurposeScreen.description` | We'll recommend hot places that match your interests | 관심사에 맞는 핫플레이스를 추천해드릴게요 | 我们会为你推荐符合兴趣的热门地点 | 我們會為你推薦符合興趣的熱門地點 |
|  | `onboarding.travelPurposeScreen.progress` | Onboarding progress | 온보딩 진행 단계 | 引导流程进度 | 導覽流程進度 |
|  | `onboarding.travelPurposeScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | 第 {{current}} 步，共 {{total}} 步 | 第 {{current}} 步，共 {{total}} 步 |
|  | `onboarding.travelPurposeScreen.title` | Select Travel Purpose | 여행 목적을 선택해 주세요 | 请选择旅行目的 | 請選擇旅行目的 |

## `map`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `map.decision.backToRecommendations` | Back to recommendations | 추천으로 돌아가기 | 返回推荐 | 返回推薦 |
|  | `map.decision.emptyBody` | Try another keyword or remove a visit condition. | 다른 검색어를 입력하거나 방문 조건을 해제해 보세요. | 请尝试其他关键词，或取消某个到访条件。 | 請嘗試其他關鍵字，或取消某個造訪條件。 |
|  | `map.decision.emptyTitle` | No matching places yet | 일치하는 장소가 아직 없어요 | 还没有匹配的地点 | 目前沒有符合的地點 |
|  | `map.decision.filters.bookable` | Bookable | 예약 가능 | 可预约 | 可預約 |
|  | `map.decision.filters.coupon` | Coupon | 쿠폰 | 优惠券 | 優惠券 |
|  | `map.decision.filters.openNow` | Open now | 영업 중 | 营业中 | 營業中 |
|  | `map.decision.filters.shortWait` | Short wait | 대기 짧음 | 等候时间短 | 等候時間短 |
|  | `map.decision.getCoupon` | Get coupon | 쿠폰 받기 | 领取优惠券 | 領取優惠券 |
|  | `map.decision.couponMessage` | {{placeName}} coupon will be available here. | {{placeName}} 쿠폰을 이곳에서 받을 수 있어요. | 可以在这里领取 {{placeName}} 的优惠券。 | 可以在這裡領取 {{placeName}} 的優惠券。 |
|  | `map.decision.goNow` | Go now | 바로 가기 | 立即前往 | 立即前往 |
|  | `map.decision.goNowMessage` | Directions to {{placeName}} are ready. | {{placeName}}까지 길안내를 준비했어요. | 前往 {{placeName}} 的路线已准备好。 | 前往 {{placeName}} 的路線已準備好。 |
|  | `map.decision.livePicks` | LIVE PICKS | 지금 인기 장소 | 当前热门地点 | 目前熱門地點 |
|  | `map.decision.map` | Map | 지도 | 地图 | 地圖 |
|  | `map.decision.nearMe` | Near me | 내 위치 | 我的位置 | 我的位置 |
|  | `map.decision.nearYou` | Near you | 내 주변 | 我的周边 | 我的周邊 |
|  | `map.decision.noResults` | No matching places yet | 일치하는 장소가 아직 없어요 | 还没有匹配的地点 | 目前沒有符合的地點 |
|  | `map.decision.placesLiveNearby_one` | {{count}} place live nearby | 내 주변 {{count}}곳 운영 중 | 周边有 {{count}} 个地点营业中 | 周邊有 {{count}} 個地點營業中 |
|  | `map.decision.placesLiveNearby_other` | {{count}} places live nearby | 내 주변 {{count}}곳 운영 중 | 周边有 {{count}} 个地点营业中 | 周邊有 {{count}} 個地點營業中 |
|  | `map.decision.placesNearYou` | Places near you | 내 주변 장소 | 我周边的地点 | 我周邊的地點 |
| ● | `map.decision.profileAccessibilityLabel` | Open profile | 프로필 열기 | 打开个人资料 | 開啟個人檔案 |
|  | `map.decision.recommended` | Recommended | 추천순 | 推荐排序 | 推薦排序 |
|  | `map.decision.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | “{{query}}”的搜索结果 | 「{{query}}」的搜尋結果 |
| ● | `map.decision.searchAccessibilityLabel` | Search places | 장소 검색 | 搜索地点 | 搜尋地點 |
|  | `map.decision.searchPlaceholder` | Search places | 장소를 검색하세요 | 搜索地点 | 搜尋地點 |
|  | `map.decision.seeAll` | See all | 전체 보기 | 查看全部 | 查看全部 |
|  | `map.decision.status.openNow` | Open now | 영업 중 | 营业中 | 營業中 |
|  | `map.decision.status.verified` | Visitor verified · {{time}} | 방문자 확인 · {{time}} | 访客已确认 · {{time}} | 訪客已確認 · {{time}} |
|  | `map.decision.status.wait` | Wait {{wait}} | 대기 {{wait}} | 等候 {{wait}} | 等候 {{wait}} |
|  | `map.decision.transit` | Transit | 대중교통 | 公共交通 | 大眾運輸 |
|  | `map.decision.whereToGo` | Where to go now | 지금 어디로 갈까요? | 现在去哪儿？ | 現在要去哪裡？ |
|  | `map.card.actions.arrive` | Arrive | 도착 | 到达 | 抵達 |
|  | `map.card.actions.directions` | Directions | 길찾기 | 路线 | 路線 |
|  | `map.card.actions.reserve` | Reserve | 예약 | 预约 | 預約 |
|  | `map.card.actions.share` | Share | 공유 | 分享 | 分享 |
|  | `map.card.actions.start` | Start | 출발 | 出发 | 出發 |
|  | `map.card.closed` | Closed now | 영업 종료 | 已打烊 | 已打烊 |
|  | `map.card.dismiss` | Dismiss place preview | 장소 미리보기 닫기 | 关闭地点预览 | 關閉地點預覽 |
| ● | `map.card.error` | Could not load this place. | 장소 정보를 불러오지 못했습니다. | 无法加载地点信息。 | 無法載入地點資訊。 |
|  | `map.card.favorite` | Save place | 장소 저장 | 收藏地点 | 收藏地點 |
| ● | `map.card.imageLabel` | {{name}} photo | {{name}} 사진 | {{name}} 照片 | {{name}} 照片 |
|  | `map.card.imageUnavailable` | No photo | 사진 없음 | 暂无照片 | 沒有照片 |
|  | `map.card.loading` | Loading place preview... | 장소 미리보기를 불러오는 중입니다... | 正在加载地点预览… | 正在載入地點預覽… |
|  | `map.card.open` | Open now | 영업 중 | 营业中 | 營業中 |
| ● | `map.card.openHint` | Opens place details | 장소 상세를 엽니다 | 将打开地点详情 | 將開啟地點詳情 |
|  | `map.card.preview` | Place preview | 장소 미리보기 | 地点预览 | 地點預覽 |
|  | `map.card.statusUnknown` | Status unknown | 영업 상태 미확인 | 营业状态未知 | 營業狀態不明 |
|  | `map.card.support.coupon` | Coupons available | 쿠폰 사용 가능 | 可用优惠券 | 可使用優惠券 |
|  | `map.card.support.english` | English support | 영어응대 가능 | 可用英语沟通 | 可用英語溝通 |
|  | `map.card.support.englishMenu` | English menu | 영문 메뉴 | 英文菜单 | 英文菜單 |
|  | `map.card.support.foreignCard` | Foreign cards | 해외카드 가능 | 支持境外银行卡 | 可用海外信用卡 |
|  | `map.card.support.reservation` | Reservations | 예약 가능 | 可预约 | 可預約 |
|  | `map.card.support.wifi` | Free Wi-Fi | 무료 Wi-Fi | 免费 Wi-Fi | 免費 Wi-Fi |
|  | `map.placeActions.departureUnsupported` | Starting from a place is not supported yet. | 출발 기능은 아직 지원하지 않습니다. | 暂不支持从地点出发。 | 尚未支援從地點出發。 |
| ● | `map.placeActions.directionsFailed` | Could not start directions. | 길찾기를 실행하지 못했습니다. | 无法启动路线导航。 | 無法啟動路線導航。 |
|  | `map.placeActions.directionsUnavailable` | Could not open an external map. | 외부 지도 앱을 열 수 없습니다. | 无法打开外部地图应用。 | 無法開啟外部地圖 App。 |
|  | `map.placeActions.locationMissing` | This place has no location information. | 장소 위치 정보가 없습니다. | 该地点没有位置信息。 | 這個地點沒有位置資訊。 |
| ● | `map.placeActions.shareFailed` | Could not share this place. | 공유를 실행하지 못했습니다. | 无法分享该地点。 | 無法分享這個地點。 |
|  | `map.placeActions.shareUnavailable` | Sharing is not available on this device. | 이 기기에서는 공유 기능을 사용할 수 없습니다. | 此设备无法使用分享功能。 | 此裝置無法使用分享功能。 |
|  | `map.data.disabledDescription` | Enable the place-list runtime setting to request server data. | 장소 목록 실행 설정을 켜면 서버 데이터를 요청합니다. | 开启地点列表运行设置后才会请求服务器数据。 | 開啟地點清單執行設定後才會要求伺服器資料。 |
|  | `map.data.disabledTitle` | Place discovery is off | 장소 탐색 기능이 꺼져 있어요 | 地点探索功能已关闭 | 地點探索功能已關閉 |
|  | `map.data.emptyDescription` | Move the map or change the search filters. | 지도를 이동하거나 검색 필터를 바꿔 보세요. | 请移动地图或更改搜索筛选条件。 | 請移動地圖或變更搜尋篩選條件。 |
|  | `map.data.emptyTitle` | No places in this area | 이 지역에 장소가 없습니다 | 此区域没有地点 | 這個區域沒有地點 |
| ● | `map.data.errorDescription` | Check your connection and try again. | 네트워크를 확인한 후 다시 시도해 주세요. | 请检查网络连接后重试。 | 請確認網路連線後再試一次。 |
| ● | `map.data.errorTitle` | Could not load places | 장소를 불러오지 못했습니다 | 无法加载地点 | 無法載入地點 |
|  | `map.data.loading` | Loading places... | 장소를 불러오는 중입니다... | 正在加载地点… | 正在載入地點… |
|  | `map.data.mockDescription` | These markers come from the explicitly selected development transport. | 명시적으로 선택한 개발 transport의 합성 마커입니다. | 这些标记来自明确选择的开发用 transport。 | 這些標記來自明確選擇的開發用 transport。 |
|  | `map.data.mockTitle` | Development Mock places | 개발 Mock 장소 | 开发用 Mock 地点 | 開發用 Mock 地點 |
|  | `map.data.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `map.distanceMeters` | {{count}} m | {{count}}m | {{count}} 米 | {{count}} 公尺 |
|  | `map.filters.all` | All | 전체 | 全部 | 全部 |
|  | `map.filters.cafe` | Cafe | 카페 | 咖啡馆 | 咖啡廳 |
|  | `map.filters.fashion` | Fashion | 패션 | 时尚 | 時尚 |
|  | `map.filters.food` | Food | 음식 | 美食 | 美食 |
|  | `map.filters.music` | Music | 음악 | 音乐 | 音樂 |
|  | `map.categories.all` | All | 전체 | 全部 | 全部 |
|  | `map.categories.art` | Exhibitions | 전시 | 展览 | 展覽 |
|  | `map.categories.beauty` | Beauty | 뷰티 | 美妆 | 美妝 |
|  | `map.categories.cafe` | Cafe | 카페 | 咖啡馆 | 咖啡廳 |
|  | `map.categories.etc` | Other | 기타 | 其他 | 其他 |
|  | `map.categories.fashion` | Fashion | 패션 | 时尚 | 時尚 |
|  | `map.categories.food` | Restaurants | 음식점 | 餐厅 | 餐廳 |
|  | `map.categories.heritage` | Cultural heritage | 문화재 | 文化遗产 | 文化資產 |
|  | `map.categories.music` | Music | 음악 | 音乐 | 音樂 |
|  | `map.categories.popup` | Pop-ups | 팝업 | 快闪店 | 快閃店 |
|  | `map.navigation.community` | Community | 커뮤니티 | 社区 | 社群 |
|  | `map.navigation.favorites` | Favorites | 즐겨찾기 | 收藏 | 收藏 |
|  | `map.navigation.map` | Map | 지도 | 地图 | 地圖 |
|  | `map.navigation.recommendations` | Recommendations | 장소추천 | 推荐 | 推薦 |
|  | `map.navigation.reservations` | Reservations | 예약 | 预约 | 預約 |
|  | `map.favorites.adjust` | Resize favorites panel | 즐겨찾기 패널 크기 조절 | 调整收藏面板大小 | 調整收藏面板大小 |
|  | `map.favorites.emptyBody` | Tap the star on a place you like to save it. | 마음에 드는 장소의 별을 눌러 모아보세요. | 点按喜欢的地点上的星标即可收藏。 | 點一下喜歡的地點上的星號即可收藏。 |
|  | `map.favorites.emptyTitle` | No saved places | 저장한 장소가 없어요 | 还没有收藏的地点 | 目前沒有收藏的地點 |
| ● | `map.favorites.error` | Could not load places | 장소를 불러오지 못했어요 | 无法加载地点 | 無法載入地點 |
|  | `map.favorites.loadMore` | Show more | 더 보기 | 查看更多 | 查看更多 |
| ● | `map.favorites.loadMoreError` | Could not load more places | 다음 장소를 불러오지 못했어요 | 无法加载更多地点 | 無法載入更多地點 |
| ● | `map.favorites.loadMoreLabel` | Load more saved places | 저장한 장소 더 불러오기 | 加载更多收藏的地点 | 載入更多收藏的地點 |
|  | `map.favorites.loading` | Loading saved places… | 저장한 장소를 불러오는 중이에요 | 正在加载收藏的地点… | 正在載入收藏的地點… |
|  | `map.favorites.remove` | Remove {{name}} from favorites | {{name}} 즐겨찾기 해제 | 将 {{name}} 从收藏中移除 | 將 {{name}} 從收藏中移除 |
|  | `map.favorites.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `map.favorites.sessionBody` | Sign in again to see your saved places. | 다시 로그인한 뒤 저장한 장소를 확인해 주세요. | 请重新登录后查看收藏的地点。 | 請重新登入後查看收藏的地點。 |
|  | `map.favorites.sessionTitle` | Your session has expired | 로그인이 만료됐어요 | 登录已过期 | 登入已過期 |
|  | `map.favorites.title` | My places | 내 장소 | 我的地点 | 我的地點 |
|  | `map.searchOverlay.categories` | Place categories | 장소 카테고리 | 地点分类 | 地點類別 |
|  | `map.searchOverlay.clear` | Clear search | 검색어 지우기 | 清除搜索内容 | 清除搜尋內容 |
|  | `map.searchOverlay.clearAll` | Clear all | 전체 삭제 | 全部删除 | 全部刪除 |
|  | `map.searchOverlay.close` | Close search | 검색 닫기 | 关闭搜索 | 關閉搜尋 |
|  | `map.searchOverlay.emptyBody` | Try a different search term. | 다른 검색어를 입력해 보세요. | 请尝试其他搜索词。 | 請嘗試其他搜尋字詞。 |
|  | `map.searchOverlay.emptyTitle` | No search results | 검색 결과가 없어요 | 没有搜索结果 | 沒有搜尋結果 |
|  | `map.searchOverlay.externalResults` | Place search results | 장소 검색 결과 | 地点搜索结果 | 地點搜尋結果 |
|  | `map.searchOverlay.loading` | Searching for places… | 장소를 찾고 있어요 | 正在查找地点… | 正在尋找地點… |
|  | `map.searchOverlay.pingdomResults` | PingDom places | 핑덤 장소 | PingDom 地点 | PingDom 地點 |
|  | `map.searchOverlay.placeholder` | Search | 검색하기 | 搜索 | 搜尋 |
|  | `map.searchOverlay.recent` | Recent searches | 최근 검색 | 最近搜索 | 最近搜尋 |
|  | `map.searchOverlay.recentClearAll` | Clear all recent searches | 최근 검색 전체 삭제 | 删除全部最近搜索 | 刪除全部最近搜尋 |
| ● | `map.searchOverlay.recentDelete` | Remove {{query}} from recent searches | {{query}} 최근 검색어 삭제 | 从最近搜索中删除 {{query}} | 從最近搜尋中刪除 {{query}} |
|  | `map.searchOverlay.recentLoading` | Loading recent searches | 최근 검색 불러오는 중 | 正在加载最近搜索 | 正在載入最近搜尋 |
|  | `map.searchOverlay.recentSearch` | Search for {{query}} | {{query}} 검색 | 搜索 {{query}} | 搜尋 {{query}} |
|  | `map.searchOverlay.registrant` | Registered by {{name}} | 등록자 {{name}} | 登记者 {{name}} | 登錄者 {{name}} |
|  | `map.searchOverlay.registrantLoading` | Loading registrant | 등록자 확인 중 | 正在确认登记者 | 正在確認登錄者 |
|  | `map.searchOverlay.registrantMissing` | No registrant | 등록자 없음 | 无登记者 | 無登錄者 |
|  | `map.searchOverlay.recommendationEmpty` | No nearby recommendations yet | 주변 추천 장소가 아직 없어요 | 周边暂无推荐地点 | 周邊目前沒有推薦地點 |
| ● | `map.searchOverlay.recommendationError` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | 无法加载推荐地点 | 無法載入推薦地點 |
|  | `map.searchOverlay.recommendationLoading` | Loading recommendations… | 추천 장소를 불러오고 있어요 | 正在加载推荐地点… | 正在載入推薦地點… |
|  | `map.searchOverlay.registeredDisabled` | PingDom place search is disabled. | 핑덤 장소 검색 기능이 비활성화되어 있어요. | PingDom 地点搜索功能已停用。 | PingDom 地點搜尋功能已停用。 |
|  | `map.searchOverlay.registeredEmpty` | No registered PingDom places matched. | 서버에 등록된 핑덤 장소 검색 결과가 없어요. | 没有匹配的 PingDom 已登记地点。 | 沒有符合的 PingDom 已登錄地點。 |
| ● | `map.searchOverlay.registeredError` | The PingDom place search failed. | 핑덤 장소 검색 요청에 실패했어요. | PingDom 地点搜索请求失败。 | PingDom 地點搜尋要求失敗。 |
|  | `map.searchOverlay.registeredMock` | Development mock PingDom place results. | 개발 Mock 핑덤 장소 검색 결과예요. | 开发用 Mock PingDom 地点搜索结果。 | 開發用 Mock PingDom 地點搜尋結果。 |
|  | `map.sheet.adjust` | Resize recommendations panel | 추천 패널 크기 조절 | 调整推荐面板大小 | 調整推薦面板大小 |
|  | `map.sheet.aroundMe` | Places near me | 내 주변 장소 | 我周边的地点 | 我周邊的地點 |
|  | `map.sheet.bookmark` | Save place | 즐겨찾기 | 收藏 | 收藏 |
|  | `map.sheet.bookmarkRemove` | Remove saved place | 즐겨찾기 해제 | 取消收藏 | 取消收藏 |
| ● | `map.sheet.bookmarkSaveError` | Could not save this place | 장소를 저장하지 못했어요 | 无法收藏该地点 | 無法收藏這個地點 |
| ● | `map.sheet.bookmarkRemoveError` | Could not remove this saved place | 저장을 해제하지 못했어요 | 无法取消收藏 | 無法取消收藏 |
|  | `map.sheet.categoryPopular` | Popular {{userName}} picks by category | 카테고리별 {{userName}}님 주변 인기 장소들 | {{userName}} 周边各分类的热门地点 | {{userName}} 周邊各類別的熱門地點 |
|  | `map.sheet.categoryPopularRegion` | Popular places in {{regionName}} by category | {{regionName}} 카테고리별 인기 장소 | {{regionName}} 各分类的热门地点 | {{regionName}} 各類別的熱門地點 |
|  | `map.sheet.categoryPopularNational` | Popular nationwide places by category | 전국 카테고리 인기 장소 | 全国各分类的热门地点 | 全國各類別的熱門地點 |
|  | `map.sheet.distanceAway` | {{distance}} away | 여기서 {{distance}} | 距此 {{distance}} | 距離這裡 {{distance}} |
|  | `map.sheet.image` | Place image | 장소 이미지 | 地点图片 | 地點圖片 |
| ● | `map.sheet.imageError` | Could not load image | 이미지를 불러오지 못했어요 | 无法加载图片 | 無法載入圖片 |
|  | `map.sheet.imageMissing` | No image | 이미지 없음 | 暂无图片 | 沒有圖片 |
|  | `map.sheet.localHotPlaces` | Local hot places | 우리 지역 핫플 | 本地热门地点 | 在地熱門地點 |
|  | `map.sheet.nationwideTrends` | Nationwide trends | 전국 트렌드 | 全国趋势 | 全國趨勢 |
|  | `map.sheet.placeMissing` | Unnamed place | 장소명 없음 | 未命名地点 | 未命名地點 |
|  | `map.sheet.recommendationTitle` | Recommended for you | 나만을 위한 추천 장소 | 专属于你的推荐地点 | 專屬於你的推薦地點 |
|  | `map.sheet.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | “{{query}}”的搜索结果 | 「{{query}}」的搜尋結果 |
|  | `map.sheet.state.categoryEmptyTitle` | No places found in this category. | 이 카테고리에 해당하는 장소가 없어요 | 此分类下没有找到地点。 | 這個類別中找不到地點。 |
|  | `map.sheet.state.disabledBody` | Sign in to view this list. | 로그인하면 이 목록을 확인할 수 있어요. | 登录后即可查看此列表。 | 登入後即可查看這份清單。 |
|  | `map.sheet.state.disabledTitle` | This list is unavailable | 목록을 사용할 수 없어요 | 此列表不可用 | 無法使用這份清單 |
|  | `map.sheet.state.emptyBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | 移动地图看看其他区域吧。 | 移動地圖看看其他區域吧。 |
|  | `map.sheet.state.emptyTitle` | No hot places to show yet | 표시할 핫플이 아직 없어요 | 暂无可显示的热门地点 | 目前沒有可顯示的熱門地點 |
| ● | `map.sheet.state.errorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | 请稍后重试。 | 請稍後再試。 |
| ● | `map.sheet.state.errorTitle` | Could not load the list | 목록을 불러오지 못했어요 | 无法加载列表 | 無法載入清單 |
| ● | `map.sheet.state.forbiddenBody` | Your account cannot access this list. | 현재 계정으로 이 목록에 접근할 수 없어요. | 你的账号无法访问此列表。 | 你的帳號無法存取這份清單。 |
| ● | `map.sheet.state.forbiddenTitle` | Access is unavailable | 접근할 수 없어요 | 无法访问 | 無法存取 |
|  | `map.sheet.state.invalid-locationBody` | Check your location and try again. | 위치 상태를 확인한 후 다시 시도해 주세요. | 请检查定位状态后重试。 | 請確認定位狀態後再試一次。 |
|  | `map.sheet.state.invalid-locationTitle` | Your location could not be used | 현재 위치를 사용할 수 없어요 | 无法使用你的位置 | 無法使用你的位置 |
|  | `map.sheet.state.invalid-periodBody` | Please try the supported weekly period again. | 지원되는 주간 기간으로 다시 시도해 주세요. | 请使用支持的每周时间段重试。 | 請使用支援的每週期間再試一次。 |
|  | `map.sheet.state.invalid-periodTitle` | The trend period is unavailable | 트렌드 기간을 사용할 수 없어요 | 趋势时间段不可用 | 無法使用趨勢期間 |
| ● | `map.sheet.state.location-deniedBody` | Nationwide trends remain available without location access. | 위치 권한 없이도 전국 트렌드는 볼 수 있어요. | 没有定位权限也可以查看全国趋势。 | 沒有定位權限也可以查看全國趨勢。 |
| ● | `map.sheet.state.location-deniedTitle` | Allow location access to see local hot places | 지역 핫플을 보려면 위치 권한을 허용해 주세요 | 允许定位权限即可查看本地热门地点 | 允許定位權限即可查看在地熱門地點 |
|  | `map.sheet.state.location-pendingBody` | Nationwide trends are available while location is being prepared. | 위치를 확인하는 동안 전국 트렌드는 볼 수 있어요. | 在确认位置期间仍可查看全国趋势。 | 確認位置期間仍可查看全國趨勢。 |
|  | `map.sheet.state.location-pendingTitle` | Checking your location… | 현재 위치를 확인하고 있어요 | 正在确认你的位置… | 正在確認你的位置… |
|  | `map.sheet.state.loadingBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | 移动地图看看其他区域吧。 | 移動地圖看看其他區域吧。 |
|  | `map.sheet.state.loadingTitle` | Finding nearby hot places… | 주변 핫플을 찾는 중이에요 | 正在寻找周边热门地点… | 正在尋找周邊熱門地點… |
|  | `map.sheet.state.nationalEmptyBody` | Check back after the weekly trend data is updated. | 주간 트렌드 데이터가 갱신된 후 다시 확인해 주세요. | 请在每周趋势数据更新后再来查看。 | 請在每週趨勢資料更新後再來查看。 |
|  | `map.sheet.state.nationalEmptyTitle` | No nationwide trends to show yet | 표시할 전국 트렌드가 아직 없어요 | 暂无可显示的全国趋势 | 目前沒有可顯示的全國趨勢 |
| ● | `map.sheet.state.nationalErrorBody` | Please try loading nationwide trends again in a moment. | 잠시 후 전국 트렌드를 다시 불러와 주세요. | 请稍后重新加载全国趋势。 | 請稍後重新載入全國趨勢。 |
| ● | `map.sheet.state.nationalErrorTitle` | Could not load nationwide trends | 전국 트렌드를 불러오지 못했어요 | 无法加载全国趋势 | 無法載入全國趨勢 |
|  | `map.sheet.state.nationalLoadingBody` | Loading the latest seven-day bookmark trend. | 최근 7일의 즐겨찾기 변화를 불러오고 있어요. | 正在加载最近 7 天的收藏变化趋势。 | 正在載入最近 7 天的收藏變化趨勢。 |
|  | `map.sheet.state.nationalLoadingTitle` | Loading nationwide trends… | 전국 트렌드를 불러오는 중이에요 | 正在加载全国趋势… | 正在載入全國趨勢… |
|  | `map.sheet.state.region-not-foundBody` | Try again from another location. | 다른 위치에서 다시 시도해 주세요. | 请在其他位置重试。 | 請在其他位置再試一次。 |
|  | `map.sheet.state.region-not-foundTitle` | We could not identify this area | 현재 지역을 판정하지 못했어요 | 无法识别此区域 | 無法辨識這個區域 |
| ● | `map.sheet.state.region-resolution-failedBody` | The region lookup service did not respond. | 지역 판정 서비스가 응답하지 않았어요. | 区域查询服务没有响应。 | 區域查詢服務沒有回應。 |
| ● | `map.sheet.state.region-resolution-failedTitle` | Could not identify your area | 지역 판정에 실패했어요 | 无法识别你所在的区域 | 無法辨識你所在的區域 |
|  | `map.sheet.state.region-service-unavailableBody` | Please try again after the region service recovers. | 지역 서비스가 복구된 후 다시 시도해 주세요. | 请在区域服务恢复后重试。 | 請在區域服務恢復後再試一次。 |
|  | `map.sheet.state.region-service-unavailableTitle` | Local hot places are temporarily unavailable | 지역 핫플을 일시적으로 사용할 수 없어요 | 本地热门地点暂时不可用 | 在地熱門地點暫時無法使用 |
| ● | `map.sheet.state.unauthorizedBody` | Sign in again and retry. | 다시 로그인한 후 시도해 주세요. | 请重新登录后重试。 | 請重新登入後再試一次。 |
| ● | `map.sheet.state.unauthorizedTitle` | Sign-in is required | 로그인이 필요해요 | 需要登录 | 需要登入 |
|  | `map.sheet.state.recommendationEmptyBody` | Change your location or recommendation radius and try again. | 위치나 추천 반경을 바꾼 뒤 다시 확인해 주세요. | 请更改位置或推荐范围后重试。 | 請變更位置或推薦範圍後再試一次。 |
|  | `map.sheet.state.recommendationEmptyTitle` | No recommendations match your current filters | 현재 조건에 맞는 추천 장소가 없어요 | 没有符合当前条件的推荐地点 | 沒有符合目前條件的推薦地點 |
| ● | `map.sheet.state.recommendationErrorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | 请稍后重试。 | 請稍後再試。 |
| ● | `map.sheet.state.recommendationErrorTitle` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | 无法加载推荐地点 | 無法載入推薦地點 |
|  | `map.sheet.state.recommendationLoadingBody` | Checking your location and travel context. | 현재 위치와 여행 맥락을 확인하고 있어요. | 正在确认你的位置和旅行情境。 | 正在確認你的位置與旅行情境。 |
|  | `map.sheet.state.recommendationLoadingTitle` | Loading recommendations for you… | 나만을 위한 추천 장소를 불러오고 있어요 | 正在加载专属于你的推荐地点… | 正在載入專屬於你的推薦地點… |
|  | `map.detail.amenityEnglish` | English support | 영어응대 가능 | 可用英语沟通 | 可用英語溝通 |
|  | `map.detail.amenityParking` | Parking available | 주차가능 | 可停车 | 可停車 |
|  | `map.detail.back` | Back to map | 지도로 돌아가기 | 返回地图 | 返回地圖 |
|  | `map.detail.collapseTags` | Collapse additional tags | 추가 태그 접기 | 收起其他标签 | 收合其他標籤 |
|  | `map.detail.coupon` | Coupons | 쿠폰 | 优惠券 | 優惠券 |
|  | `map.detail.description` | About this place | 장소 소개 | 地点介绍 | 地點介紹 |
|  | `map.detail.events` | Current events | 진행 중 이벤트 | 进行中的活动 | 進行中的活動 |
|  | `map.detail.collapseReviews` | Hide reviews | 리뷰 접기 | 收起评价 | 收合評論 |
|  | `map.detail.viewAllReviews` | View all reviews | 리뷰 모두 보기 | 查看全部评价 | 查看全部評論 |
|  | `map.detail.expandTags` | Show {{count}} hidden tags | 숨겨진 태그 {{count}}개 펼치기 | 展开 {{count}} 个隐藏标签 | 展開 {{count}} 個隱藏標籤 |
|  | `map.detail.imageDetail` | View {{name}} photo {{count}} | {{name}} 사진 {{count}} 상세 보기 | 查看 {{name}} 照片 {{count}} | 查看 {{name}} 照片 {{count}} |
| ● | `map.detail.imageError` | Could not load photos. Try again | 사진을 불러오지 못했습니다. 다시 시도 | 无法加载照片。请重试 | 無法載入照片。請再試一次 |
|  | `map.detail.info` | Info | 정보 | 信息 | 資訊 |
| ● | `map.detail.notice` | Operating notice | 운영 공지 | 营业公告 | 營業公告 |
|  | `map.detail.imageViewer.close` | Close photo | 사진 닫기 | 关闭照片 | 關閉照片 |
|  | `map.detail.imageViewer.counter` | {{current}} / {{total}} | {{current}} / {{total}} | {{current}} / {{total}} | {{current}} / {{total}} |
|  | `map.detail.imageViewer.next` | Next photo | 다음 사진 | 下一张照片 | 下一張照片 |
|  | `map.detail.imageViewer.photo` | {{name}} photo {{current}} of {{total}} | {{name}} 사진 {{total}}장 중 {{current}}번째 | {{name}} 照片，第 {{current}} 张，共 {{total}} 张 | {{name}} 照片，第 {{current}} 張，共 {{total}} 張 |
|  | `map.detail.imageViewer.previous` | Previous photo | 이전 사진 | 上一张照片 | 上一張照片 |
|  | `map.detail.participantCount_one` | {{count}} participant | {{count}}명 참여 | {{count}} 人参与 | {{count}} 人參與 |
|  | `map.detail.participantCount_other` | {{count}} participants | {{count}}명 참여 | {{count}} 人参与 | {{count}} 人參與 |
|  | `map.detail.photoReviews` | Photo reviews | 사진 리뷰 | 带图评价 | 照片評論 |
|  | `map.detail.preview` | View {{name}} details | {{name}} 상세 보기 | 查看 {{name}} 详情 | 查看 {{name}} 詳情 |
|  | `map.detail.reviewHighlights` | What visitors liked | 이런 점을 좋아해요! | 大家喜欢这些地方！ | 大家喜歡這些特點！ |
|  | `map.detail.reviewCount_one` | {{count}} review | 리뷰 {{count}}개 | {{count}} 条评价 | {{count}} 則評論 |
|  | `map.detail.reviewCount_other` | {{count}} reviews | 리뷰 {{count}}개 | {{count}} 条评价 | {{count}} 則評論 |
|  | `map.detail.reviewEmpty` | No reviews yet. | 등록된 리뷰 정보가 없어요. | 还没有评价。 | 目前還沒有評論。 |
| ● | `map.detail.reviewError` | Could not load reviews. Try again | 리뷰를 불러오지 못했습니다. 다시 시도 | 无法加载评价。请重试 | 無法載入評論。請再試一次 |
|  | `map.detail.reviewLoading` | Loading reviews… | 리뷰를 불러오는 중입니다. | 正在加载评价… | 正在載入評論… |
|  | `map.detail.reviews` | Reviews | 리뷰 | 评价 | 評論 |
|  | `map.detail.verifiedCount_one` | {{count}} person verified this! | {{count}}명이 검증했어요! | 已有 {{count}} 人验证！ | 已有 {{count}} 人驗證！ |
|  | `map.detail.verifiedCount_other` | {{count}} people verified this! | {{count}}명이 검증했어요! | 已有 {{count}} 人验证！ | 已有 {{count}} 人驗證！ |
| ● | `map.detail.reservation.authError` | Sign-in required | 로그인이 필요합니다 | 需要登录 | 需要登入 |
|  | `map.detail.reservation.available` | Reserve | 예약하기 | 预约 | 預約 |
|  | `map.detail.reservation.empty` | No schedules are currently available | 현재 예약 가능한 일정이 없습니다 | 目前没有可预约的时段 | 目前沒有可預約的時段 |
| ● | `map.detail.reservation.error` | Could not load reservation availability | 예약 가능 여부를 불러오지 못했습니다 | 无法加载预约情况 | 無法載入預約狀況 |
|  | `map.detail.reservation.full` | No reservation capacity is available | 예약 가능한 인원이 없습니다 | 没有可预约的名额 | 沒有可預約的名額 |
|  | `map.detail.reservation.loading` | Checking reservation availability | 예약 가능 여부를 확인하고 있습니다 | 正在确认是否可预约 | 正在確認是否可預約 |
|  | `map.detail.reservation.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `map.locate` | My location | 내 위치 | 我的位置 | 我的位置 |
|  | `map.refreshing` | Refreshing map | 지도 새로고침 중 | 正在刷新地图 | 正在重新整理地圖 |
| ● | `map.location.deniedDescription` | The map is using a default area. Allow location access to show your position. | 기본 지역을 표시하고 있습니다. 현재 위치를 보려면 위치 권한을 허용해 주세요. | 地图正在显示默认区域。要显示你的位置，请允许定位权限。 | 地圖正在顯示預設區域。若要顯示你的位置，請允許定位權限。 |
| ● | `map.location.deniedTitle` | Location access is off | 위치 권한이 꺼져 있습니다 | 定位权限已关闭 | 定位權限已關閉 |
| ● | `map.location.failedDescription` | The map is using a default area. Check location services and try again. | 기본 지역을 표시하고 있습니다. 위치 서비스를 확인한 후 다시 시도해 주세요. | 地图正在显示默认区域。请检查定位服务后重试。 | 地圖正在顯示預設區域。請確認定位服務後再試一次。 |
| ● | `map.location.failedTitle` | Could not find your location | 현재 위치를 찾지 못했습니다 | 无法找到你的位置 | 找不到你的位置 |
|  | `map.location.loading` | Finding your current location... | 현재 위치를 찾는 중입니다... | 正在查找你的当前位置… | 正在尋找你的目前位置… |
|  | `map.location.openSettings` | Open settings | 설정 열기 | 打开设置 | 開啟設定 |
|  | `map.location.retry` | Check again | 다시 확인 | 重新确认 | 重新確認 |
|  | `map.recommendations.subtitle` | Pingdom recommends places {{userName}} might like! | 핑덤이 {{userName}}님이 좋아할만한 장소를 추천해드려요! | PingDom 为你推荐 {{userName}} 可能喜欢的地点！ | PingDom 為你推薦 {{userName}} 可能會喜歡的地點！ |
|  | `map.recommendations.verificationTitle` | Verify today and get a coupon! | 오늘 검증하고 쿠폰 받자! | 今天验证就能领优惠券！ | 今天驗證就能領優惠券！ |
|  | `map.recommendations.reasons.activeBenefit` | A benefit is currently available here | 현재 이용할 수 있는 혜택이 있어요 | 这里目前有可用的优惠 | 這裡目前有可使用的優惠 |
|  | `map.recommendations.reasons.benefitAndReservable` | A place with an available benefit and booking | 혜택을 받고 바로 예약할 수 있어요 | 有优惠且可立即预约的地点 | 有優惠且可立即預約的地點 |
|  | `map.recommendations.reasons.contextMatch` | Matches your current travel plans | 현재 여행 목적과 잘 맞는 장소예요 | 与你当前的旅行计划很匹配 | 很符合你目前的旅行計畫 |
|  | `map.recommendations.reasons.exploration` | A recommendation for discovering somewhere new | 새로운 장소를 발견할 수 있는 추천이에요 | 帮你发现新去处的推荐 | 幫你發掘新去處的推薦 |
|  | `map.recommendations.reasons.freshContent` | Recently updated with new information | 최근 새로운 정보가 추가됐어요 | 最近更新了新信息 | 最近更新了新資訊 |
|  | `map.recommendations.reasons.highConversion` | Often leads to real visits | 실제 방문으로 자주 이어지는 장소예요 | 经常带来实际到访的地点 | 經常帶來實際造訪的地點 |
|  | `map.recommendations.reasons.highEngagement` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | 很多用户关注的地点 | 許多使用者關注的地點 |
|  | `map.recommendations.reasons.nearby` | Close to your current location | 현재 위치에서 가까운 장소예요 | 离你当前位置很近 | 離你目前的位置很近 |
|  | `map.recommendations.reasons.neutral` | Recommended place | 추천 장소 | 推荐地点 | 推薦地點 |
|  | `map.recommendations.reasons.personalSignal` | Matches your interests and activity | 관심사와 반응에 잘 맞는 장소예요 | 与你的兴趣和活动很匹配 | 很符合你的興趣與活動 |
|  | `map.recommendations.reasons.qualitySignal` | Has reliable place information | 신뢰도 높은 장소 정보가 있어요 | 有可信的地点信息 | 有可信賴的地點資訊 |
|  | `map.recommendations.reasons.reservable` | Currently available to book | 현재 예약할 수 있는 장소예요 | 目前可以预约 | 目前可以預約 |
|  | `map.recommendations.explanations.fallback` | A place worth exploring | 둘러볼 만한 추천 장소예요 | 值得逛逛的地点 | 值得逛逛的地點 |
|  | `map.recommendations.explanations.fresh` | A place receiving new attention | 최근 새롭게 주목받는 장소예요 | 最近受到新关注的地点 | 最近受到新關注的地點 |
|  | `map.recommendations.explanations.geo` | Close to your current location | 현재 위치에서 가까운 장소예요 | 离你当前位置很近 | 離你目前的位置很近 |
|  | `map.recommendations.explanations.personal` | Reflects your interests and activity | 관심사와 반응을 반영한 추천이에요 | 根据你的兴趣和活动推荐 | 依據你的興趣與活動推薦 |
|  | `map.recommendations.explanations.popular` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | 很多用户关注的地点 | 許多使用者關注的地點 |
|  | `map.recommendations.context.activity.attendEvent` | Events | 이벤트 참여 | 参加活动 | 參加活動 |
|  | `map.recommendations.context.activity.cafe` | Cafe visit | 카페 방문 | 去咖啡馆 | 去咖啡廳 |
|  | `map.recommendations.context.activity.eat` | Food | 식사 | 用餐 | 用餐 |
|  | `map.recommendations.context.activity.explore` | Explore | 주변 탐색 | 周边探索 | 周邊探索 |
|  | `map.recommendations.context.activity.nightlife` | Nightlife | 나이트라이프 | 夜生活 | 夜生活 |
|  | `map.recommendations.context.activity.shop` | Shopping | 쇼핑 | 购物 | 購物 |
|  | `map.recommendations.context.purpose.beauty` | Beauty | 뷰티 | 美妆 | 美妝 |
|  | `map.recommendations.context.purpose.cafe` | Cafe | 카페 | 咖啡馆 | 咖啡廳 |
|  | `map.recommendations.context.purpose.exhibition` | Exhibitions | 전시 | 展览 | 展覽 |
|  | `map.recommendations.context.purpose.fashion` | Fashion | 패션 | 时尚 | 時尚 |
|  | `map.recommendations.context.purpose.food` | Food | 맛집 | 美食 | 美食 |
|  | `map.recommendations.context.purpose.kPop` | K-POP | K-POP | K-POP | K-POP |
|  | `map.recommendations.context.purpose.nightlife` | Nightlife | 나이트라이프 | 夜生活 | 夜生活 |
|  | `map.recommendations.context.purpose.other` | Other | 기타 | 其他 | 其他 |
|  | `map.recommendations.context.purpose.popUp` | Pop-ups | 팝업 | 快闪店 | 快閃店 |
|  | `map.recommendations.limits.candidatePool` | The candidate pool was expanded because few places matched. | 조건에 맞는 장소가 적어 후보 범위를 넓혀 추천했어요. | 符合条件的地点较少，因此扩大了候选范围。 | 符合條件的地點較少，因此擴大了候選範圍。 |
|  | `map.recommendations.limits.interactedExcluded` | Places you already viewed were excluded. | 이미 확인한 장소를 제외해 추천했어요. | 已排除你查看过的地点。 | 已排除你查看過的地點。 |
|  | `map.recommendations.limits.operatingPriority` | Places currently operating were prioritized. | 현재 운영 중인 장소를 우선해 추천했어요. | 已优先推荐目前营业中的地点。 | 已優先推薦目前營業中的地點。 |
|  | `map.recommendations.limits.radiusExpanded` | The search radius was expanded to find recommendations. | 추천 결과를 찾기 위해 검색 반경을 넓혔어요. | 为找到推荐结果，已扩大搜索范围。 | 為了找到推薦結果，已擴大搜尋範圍。 |
|  | `map.recommendations.limits.requestClamped` | The recommendation count was adjusted to the server limit. | 서버 기준에 맞춰 추천 개수를 조정했어요. | 已按服务器限制调整推荐数量。 | 已依伺服器限制調整推薦數量。 |
| ● | `map.search.accessibilityLabel` | Search places on the map | 지도 장소 검색 | 在地图上搜索地点 | 在地圖上搜尋地點 |
|  | `map.search.confirm` | OK | 확인 | 确定 | 確定 |
|  | `map.search.empty` | No search results | 검색 결과가 없습니다 | 没有搜索结果 | 沒有搜尋結果 |
| ● | `map.search.failed` | Address search failed | 주소 검색에 실패했습니다 | 地址搜索失败 | 地址搜尋失敗 |
|  | `map.search.placeholder` | Search places | 장소를 검색하세요 | 搜索地点 | 搜尋地點 |
| ● | `map.search.profileAccessibilityLabel` | Open my page | 마이페이지 열기 | 打开我的页面 | 開啟我的頁面 |
|  | `map.search.statusPlaceholder` | Enter an address... | 주소를 입력하세요... | 请输入地址… | 請輸入地址… |
|  | `map.title` | Nearby map | 주변 지도 | 周边地图 | 周邊地圖 |
|  | `map.visibleCenter` | {{lat}}, {{lng}} | {{lat}}, {{lng}} | {{lat}}, {{lng}} | {{lat}}, {{lng}} |

## `notificationSettings`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `notificationSettings.back` | Back | 뒤로가기 | 返回 | 返回 |
|  | `notificationSettings.contract.categories` | Server notification preferences | 서버 알림 수신 설정 | 服务器通知接收设置 | 伺服器通知接收設定 |
|  | `notificationSettings.contract.newHotplaceEnabled` | Hot place notifications | 핫플레이스 알림 | 热门地点通知 | 熱門地點通知 |
|  | `notificationSettings.contract.newLikeEnabled` | Like notifications | 좋아요 알림 | 点赞通知 | 按讚通知 |
| ● | `notificationSettings.contract.categoryHint` | Saved to your account. Enabling checks device notification permission. | 계정에 저장됩니다. 켤 때 기기의 알림 권한을 확인합니다. | 将保存到你的账号。开启时会检查设备的通知权限。 | 會儲存到你的帳號。開啟時會確認裝置的通知權限。 |
|  | `notificationSettings.contract.allUnsupported` | Unavailable: no allow-all policy exists. Device permission and category preferences are separate. | 미지원: 전체 허용 정책이 없습니다. 기기 권한과 항목별 수신 설정은 별개입니다. | 不支持：没有全部允许的政策。设备权限与各项接收设置是分开的。 | 不支援：沒有全部允許的政策。裝置權限與各項接收設定是分開的。 |
|  | `notificationSettings.contract.unsupported` | Unavailable: this category has no confirmed server setting. | 미지원: 이 항목에 대응하는 서버 설정이 확정되지 않았습니다. | 不支持：此项目尚无已确定的服务器设置。 | 不支援：這個項目尚無已確定的伺服器設定。 |
|  | `notificationSettings.contract.nightUnsupported` | Unavailable: receiving notifications at night is not the same as quiet hours. | 미지원: 야간 알림 수신 허용은 방해 금지 시간과 같은 설정이 아닙니다. | 不支持：允许夜间接收通知与免打扰时段不是同一项设置。 | 不支援：允許夜間接收通知與勿擾時段不是同一項設定。 |
|  | `notificationSettings.contract.unknown` | The server has not provided a valid setting. This item cannot be changed. | 서버에서 올바른 설정값을 제공하지 않아 변경할 수 없습니다. | 服务器未提供有效的设置值，无法更改此项目。 | 伺服器未提供有效的設定值，無法變更這個項目。 |
|  | `notificationSettings.contract.quietHours` | Quiet hours | 방해 금지 시간 | 免打扰时段 | 勿擾時段 |
|  | `notificationSettings.contract.quietReadOnly` | Read only: time validation and editing policy are not confirmed. No default schedule is saved. | 읽기 전용: 시간 검증과 편집 정책이 확정되지 않았습니다. 기본 시간을 임의로 저장하지 않습니다. | 只读：时间校验和编辑政策尚未确定。不会擅自保存默认时间。 | 唯讀：時間驗證與編輯政策尚未確定。不會擅自儲存預設時間。 |
|  | `notificationSettings.contract.quietIncomplete` | Time or timezone information is missing or invalid. | 시간 또는 시간대 정보가 없거나 올바르지 않습니다. | 时间或时区信息缺失或无效。 | 時間或時區資訊缺少或無效。 |
|  | `notificationSettings.contract.invalidQuietHours` | Please check the quiet hours settings on the server. | 서버의 방해 금지 시간 설정을 확인해 주세요. | 请检查服务器上的免打扰时段设置。 | 請確認伺服器上的勿擾時段設定。 |
| ● | `notificationSettings.contract.unauthorized` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | 登录已过期。请重新登录。 | 登入已過期。請重新登入。 |
| ● | `notificationSettings.contract.forbidden` | You do not have permission to access notification settings. | 알림 설정에 접근할 권한이 없습니다. | 你没有访问通知设置的权限。 | 你沒有存取通知設定的權限。 |
| ● | `notificationSettings.contract.saveFailed` | Could not update notification settings. Please try again. | 알림 설정을 변경하지 못했습니다. 다시 시도해 주세요. | 无法更新通知设置。请重试。 | 無法更新通知設定。請再試一次。 |
| ● | `notificationSettings.permission.title` | Device notification permission | 기기 알림 권한 | 设备通知权限 | 裝置通知權限 |
| ● | `notificationSettings.permission.description` | Device permission and account preferences are separate. Change device permission in system settings. | 기기 권한과 계정의 수신 설정은 별개입니다. 기기 권한은 시스템 설정에서 변경할 수 있습니다. | 设备权限与账号的接收设置是分开的。设备权限可在系统设置中更改。 | 裝置權限與帳號的接收設定是分開的。裝置權限可在系統設定中變更。 |
| ● | `notificationSettings.permission.loading` | Checking device permission | 기기 권한 확인 중 | 正在确认设备权限 | 正在確認裝置權限 |
| ● | `notificationSettings.permission.authorized` | Notifications allowed | 알림 허용 | 已允许通知 | 已允許通知 |
| ● | `notificationSettings.permission.provisional` | Quiet notifications allowed | 조용한 알림 허용 | 已允许静默通知 | 已允許靜音通知 |
| ● | `notificationSettings.permission.notDetermined` | Permission has not been requested. Enabling a category will request it. | 아직 권한을 요청하지 않았습니다. 알림 항목을 켤 때 요청합니다. | 尚未请求权限。开启通知项目时会请求。 | 尚未要求權限。開啟通知項目時會提出要求。 |
| ● | `notificationSettings.permission.denied` | Notification permission denied. Allow notifications in device settings to enable this category. | 알림 권한이 거부되었습니다. 이 항목을 켜려면 기기 설정에서 알림을 허용해 주세요. | 通知权限被拒绝。要开启此项目，请在设备设置中允许通知。 | 通知權限遭到拒絕。若要開啟這個項目，請在裝置設定中允許通知。 |
| ● | `notificationSettings.permission.blocked` | Notification permission blocked. Please allow it in device settings. | 알림 권한이 차단되었습니다. 기기 설정에서 허용해 주세요. | 通知权限已被阻止。请在设备设置中允许。 | 通知權限已遭封鎖。請在裝置設定中允許。 |
| ● | `notificationSettings.permission.unavailable` | Native notification support is unavailable in this environment. | 현재 환경에서는 네이티브 알림 기능을 사용할 수 없습니다. | 当前环境无法使用原生通知功能。 | 目前環境無法使用原生通知功能。 |
| ● | `notificationSettings.permission.error` | Could not check or request notification permission. Please try again. | 알림 권한 확인 또는 요청 중 오류가 발생했습니다. 다시 시도해 주세요. | 确认或请求通知权限时出错。请重试。 | 確認或要求通知權限時發生錯誤。請再試一次。 |
| ● | `notificationSettings.permission.openSettings` | Open device notification settings | 기기 알림 설정 열기 | 打开设备通知设置 | 開啟裝置通知設定 |
| ● | `notificationSettings.error` | Could not load notification settings. | 알림 설정을 불러오지 못했어요. | 无法加载通知设置。 | 無法載入通知設定。 |
|  | `notificationSettings.loading` | Loading notification settings | 알림 설정을 불러오는 중 | 正在加载通知设置 | 正在載入通知設定 |
|  | `notificationSettings.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `notificationSettings.sections.interests` | Saved places & areas | 관심 장소 · 구역 | 关注的地点 · 区域 | 關注的地點 · 區域 |
|  | `notificationSettings.sections.other` | Other | 기타 | 其他 | 其他 |
|  | `notificationSettings.sections.records` | My records & places | 내 기록 · 장소 | 我的记录 · 地点 | 我的紀錄 · 地點 |
|  | `notificationSettings.sections.reports` | Reports | 리포트 | 报告 | 報告 |
|  | `notificationSettings.settings.favoriteMoodChange.description` | When recent tags and record trends change | 최근 태그와 기록 추세가 바뀌었을 때 | 当最近的标签和记录趋势发生变化时 | 最近的標籤與紀錄趨勢有變化時 |
|  | `notificationSettings.settings.favoriteMoodChange.label` | Changes around a saved place | 관심 장소 분위기 변화 | 关注地点的氛围变化 | 關注地點的氛圍變化 |
|  | `notificationSettings.settings.firstRecordTrending.description` | Get notified when a place you First Recorded starts trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | 你作为 First Recorder 记录的地点走红时通知你 | 你以 First Recorder 身分記錄的地點爆紅時通知你 |
|  | `notificationSettings.settings.firstRecordTrending.label` | A place I recorded first is trending | 내가 먼저 기록한 장소 급상승 | 我最先记录的地点热度飙升 | 我最先記錄的地點熱度飆升 |
|  | `notificationSettings.settings.frequentAreaHotPlace.description` | When a new trending place appears in an area you frequent | 내 생활권에 새로 뜨는 장소가 생기면 | 你常去的区域出现新的热门地点时 | 你常去的區域出現新的熱門地點時 |
|  | `notificationSettings.settings.frequentAreaHotPlace.label` | New hot place in a frequent area | 자주 가는 구역 새 핫플 | 常去区域的新热门地点 | 常去區域的新熱門地點 |
|  | `notificationSettings.settings.marketingEvents.label` | Marketing & event updates | 마케팅 · 이벤트 정보 | 营销 · 活动信息 | 行銷 · 活動資訊 |
|  | `notificationSettings.settings.nightNotifications.description` | Allow notifications between 21:00 and 08:00 | 21:00 – 08:00 사이 알림 허용 | 允许在 21:00 – 08:00 之间接收通知 | 允許在 21:00 – 08:00 之間接收通知 |
|  | `notificationSettings.settings.nightNotifications.label` | Receive notifications at night | 야간 알림 받기 | 接收夜间通知 | 接收夜間通知 |
|  | `notificationSettings.settings.pushAll.description` | Turning this off disables all notifications below | 끄면 아래 알림이 모두 발송되지 않아요 | 关闭后，下方所有通知都不会发送 | 關閉後，下方所有通知都不會傳送 |
|  | `notificationSettings.settings.pushAll.label` | Allow all push notifications | 푸시 알림 전체 허용 | 允许全部推送通知 | 允許全部推播通知 |
|  | `notificationSettings.settings.recordNewTags.description` | When the status of a place you recorded changes | 내가 남긴 장소의 상태가 바뀔 때 | 你记录的地点状态发生变化时 | 你記錄的地點狀態有變化時 |
|  | `notificationSettings.settings.recordNewTags.label` | New tags added to my recorded place | 내 기록 장소에 새 태그 누적 | 我记录的地点新增标签 | 我記錄的地點新增標籤 |
|  | `notificationSettings.settings.todayMissionArea.label` | Today’s mission area | 오늘의 미션 구역 | 今日任务区域 | 今日任務區域 |
|  | `notificationSettings.settings.weeklyReport.description` | A weekly summary of this week’s discoveries and your records | 이번 주 발자국과 내 기록을 정리해 보내드려요 | 为你整理本周的足迹和你的记录 | 為你整理本週的足跡與你的紀錄 |
|  | `notificationSettings.settings.weeklyReport.label` | Weekly report | 주간 리포트 | 每周报告 | 每週報告 |
|  | `notificationSettings.title` | Notification settings | 알림 설정 | 通知设置 | 通知設定 |

## `offer`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `offer.cta.ended` | Offer ended | 종료된 혜택 | 优惠已结束 | 優惠已結束 |
|  | `offer.cta.issue` | Get coupon | 쿠폰 받기 | 领取优惠券 | 領取優惠券 |
|  | `offer.cta.notStarted` | Not started yet | 아직 시작 전 | 尚未开始 | 尚未開始 |
|  | `offer.cta.soldOut` | All claimed | 수량 모두 소진 | 已全部领完 | 已全數領完 |
|  | `offer.cta.unavailable` | Cannot be claimed | 받을 수 없는 혜택 | 无法领取 | 無法領取 |
|  | `offer.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 여행 일정이 있는 계정 | 有进行中行程的账号 | 有進行中行程的帳號 |
|  | `offer.eligibility.PUBLIC` | Anyone | 누구나 | 所有人 | 所有人 |
|  | `offer.eligibility.UNKNOWN` | Conditions need review | 조건 확인 필요 | 条件待确认 | 條件待確認 |
|  | `offer.expiry.ISSUE_PLUS_DAYS` | Valid for a set number of days after issue | 발급일로부터 정해진 기간 | 自领取之日起在规定天数内有效 | 自領取日起於指定天數內有效 |
|  | `offer.expiry.ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END` | Valid for a set number of days after issue, up to the offer end date | 발급일로부터 정해진 기간, 혜택 종료일까지 | 自领取之日起在规定天数内有效，最晚至优惠结束日 | 自領取日起於指定天數內有效，最晚至優惠結束日 |
|  | `offer.expiry.OFFER_END` | Valid until the offer ends | 혜택 종료일까지 | 有效期至优惠结束 | 有效至優惠結束 |
|  | `offer.expiry.UNKNOWN` | Validity needs review | 유효 기간 확인 필요 | 有效期待确认 | 有效期限待確認 |
|  | `offer.inventory.LIMITED` | Limited quantity | 수량 한정 | 数量有限 | 數量有限 |
|  | `offer.inventory.UNKNOWN` | Quantity needs review | 수량 확인 필요 | 数量待确认 | 數量待確認 |
|  | `offer.inventory.UNLIMITED` | No quantity limit | 수량 제한 없음 | 数量不限 | 數量不限 |
|  | `offer.remaining.limited_one` | {{count}} left | {{count}}개 남음 | 剩余 {{count}} 张 | 剩餘 {{count}} 張 |
|  | `offer.remaining.limited_other` | {{count}} left | {{count}}개 남음 | 剩余 {{count}} 张 | 剩餘 {{count}} 張 |
|  | `offer.remaining.unknown` | Remaining quantity not provided | 남은 수량 미제공 | 未提供剩余数量 | 未提供剩餘數量 |
|  | `offer.remaining.unlimited` | No quantity limit | 수량 제한 없음 | 数量不限 | 數量不限 |
|  | `offer.statuses.CLOSED` | Closed | 종료됨 | 已结束 | 已結束 |
|  | `offer.statuses.DRAFT` | Draft | 작성 중 | 草稿 | 草稿 |
|  | `offer.statuses.PUBLISHED` | Available | 받을 수 있음 | 可领取 | 可領取 |
|  | `offer.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | 状态待确认 | 狀態待確認 |

## `payment`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `payment.statuses.FAILED` | Payment failed | 결제 실패 | 支付失败 | 付款失敗 |
|  | `payment.statuses.PAID` | Paid | 결제 완료 | 已支付 | 已付款 |
|  | `payment.statuses.PROCESSING` | Payment in progress | 결제 진행 중 | 支付处理中 | 付款處理中 |
|  | `payment.statuses.REFUNDED` | Refunded | 환불 완료 | 已退款 | 已退款 |
|  | `payment.statuses.REFUND_PROCESSING` | Refund in progress | 환불 진행 중 | 退款处理中 | 退款處理中 |
|  | `payment.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | 状态待确认 | 狀態待確認 |

## `myPage`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `myPage.back` | Back | 뒤로가기 | 返回 | 返回 |
|  | `myPage.couponBox.empty` | You have no coupons yet | 보유한 쿠폰이 없어요 | 你还没有优惠券 | 你目前沒有優惠券 |
|  | `myPage.couponBox.emptyFiltered` | You have no {{status}} coupons | {{status}} 쿠폰이 없어요 | 没有{{status}}的优惠券 | 沒有{{status}}的優惠券 |
| ● | `myPage.couponBox.error` | Could not load your coupons. | 쿠폰을 불러오지 못했어요. | 无法加载你的优惠券。 | 無法載入你的優惠券。 |
|  | `myPage.couponBox.fallbackDescription` | Discount coupon | 할인 쿠폰 | 折扣优惠券 | 折扣優惠券 |
|  | `myPage.couponBox.fallbackTitle` | Coupon | 쿠폰 | 优惠券 | 優惠券 |
|  | `myPage.couponBox.filters.ALL` | All | 전체 | 全部 | 全部 |
|  | `myPage.couponBox.filters.EXPIRED` | Expired | 만료 | 已过期 | 已過期 |
|  | `myPage.couponBox.filters.ISSUED` | Available | 사용 가능 | 可使用 | 可使用 |
|  | `myPage.couponBox.filters.REDEEMED` | Used | 사용 완료 | 已使用 | 已使用 |
|  | `myPage.couponBox.loading` | Loading coupons | 쿠폰을 불러오는 중 | 正在加载优惠券 | 正在載入優惠券 |
| ● | `myPage.couponBox.nextPageError` | Could not load more coupons. | 쿠폰을 더 불러오지 못했어요. | 无法加载更多优惠券。 | 無法載入更多優惠券。 |
|  | `myPage.couponBox.nextPageRetry` | Load more | 더 불러오기 | 加载更多 | 載入更多 |
|  | `myPage.couponBox.status.CANCELED` | Canceled | 취소됨 | 已取消 | 已取消 |
|  | `myPage.couponBox.status.EXPIRED` | Expired | 만료 | 已过期 | 已過期 |
|  | `myPage.couponBox.status.ISSUED` | Available | 사용 가능 | 可使用 | 可使用 |
|  | `myPage.couponBox.status.REDEEMED` | Used | 사용 완료 | 已使用 | 已使用 |
|  | `myPage.couponBox.status.UNKNOWN` | Unavailable | 사용 불가 | 不可使用 | 無法使用 |
|  | `myPage.couponBox.title` | Coupon box | 쿠폰함 | 优惠券包 | 優惠券匣 |
| ● | `myPage.couponDetail.codeA11yLabel` | Coupon code ending in {{tail}} | 쿠폰 코드, 끝 네 자리 {{tail}} | 优惠券代码，末四位 {{tail}} | 優惠券代碼，末四碼 {{tail}} |
| ● | `myPage.couponDetail.error` | Could not load this coupon. | 쿠폰 정보를 불러오지 못했어요. | 无法加载此优惠券。 | 無法載入這張優惠券。 |
|  | `myPage.couponDetail.infoHeading` | Coupon info | 쿠폰 정보 | 优惠券信息 | 優惠券資訊 |
|  | `myPage.couponDetail.loading` | Loading coupon | 쿠폰 정보를 불러오는 중 | 正在加载优惠券 | 正在載入優惠券 |
| ● | `myPage.couponDetail.noticeHeading` | Notice | 유의사항 | 注意事项 | 注意事項 |
| ● | `myPage.couponDetail.qrHint` | Show this QR code to a store staff member before paying | 결제 전 매장 직원에게 QR 코드를 보여주세요 | 付款前请向店员出示此二维码 | 付款前請向店員出示此 QR Code |
|  | `myPage.couponDetail.qrUnavailable` | Could not draw the QR code. Please read the code above to the staff. | QR 코드를 표시하지 못했어요. 위 코드를 직원에게 알려주세요. | 无法显示二维码。请将上方代码告知店员。 | 無法顯示 QR Code。請將上方代碼告知店員。 |
| ● | `myPage.couponDetail.notices.0` | Each account can use this coupon only once. | 쿠폰은 계정당 1회만 사용할 수 있어요. | 每个账号只能使用一次此优惠券。 | 每個帳號只能使用一次這張優惠券。 |
| ● | `myPage.couponDetail.notices.1` | The coupon disappears automatically once it expires. | 유효기간이 지나면 쿠폰이 자동으로 사라져요. | 过期后优惠券会自动消失。 | 過期後優惠券會自動消失。 |
| ● | `myPage.couponDetail.notices.2` | It cannot be combined with other coupons or discounts. | 다른 쿠폰 및 할인 혜택과 중복 사용은 불가해요. | 不能与其他优惠券或折扣同时使用。 | 無法與其他優惠券或折扣併用。 |
| ● | `myPage.couponDetail.notices.3` | Cancelling the reservation restores the coupon automatically. | 예약을 취소하면 쿠폰이 자동으로 복구돼요. | 取消预约后优惠券会自动恢复。 | 取消預約後優惠券會自動恢復。 |
| ● | `myPage.couponDetail.expiredNotice` | This coupon expired on {{date}} | {{date}}에 만료된 쿠폰이에요 | 此优惠券已于 {{date}} 过期 | 這張優惠券已於 {{date}} 過期 |
| ● | `myPage.couponDetail.redeemedNotice` | This coupon was used on {{date}} | {{date}}에 사용한 쿠폰이에요 | 此优惠券已于 {{date}} 使用 | 這張優惠券已於 {{date}} 使用 |
| ● | `myPage.couponDetail.redeemedNoticeUnknown` | This coupon has already been used | 이미 사용한 쿠폰이에요 | 此优惠券已使用 | 這張優惠券已使用 |
|  | `myPage.couponDetail.reserve` | Make a reservation | 예약하러 가기 | 去预约 | 前往預約 |
|  | `myPage.couponDetail.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 진행 중인 여행 일정이 있는 계정 | 有进行中行程的账号 | 有進行中行程的帳號 |
|  | `myPage.couponDetail.eligibility.PUBLIC` | Anyone | 누구나 | 所有人 | 所有人 |
|  | `myPage.couponDetail.rows.eligibility` | Who can use | 발급 대상 | 领取对象 | 領取對象 |
|  | `myPage.couponDetail.rows.period` | Offer period | 행사 기간 | 活动期间 | 活動期間 |
|  | `myPage.couponDetail.rows.stores` | Where to use | 사용 가능 매장 | 可使用门店 | 可使用店家 |
|  | `myPage.couponDetail.rows.usage` | How to use | 사용처 | 使用方式 | 使用方式 |
|  | `myPage.couponDetail.rows.validity` | Valid for | 사용 가능 기간 | 有效期 | 有效期限 |
|  | `myPage.couponDetail.validityDays_one` | {{count}} day after issue | 발급 후 {{count}}일 | 领取后 {{count}} 天 | 領取後 {{count}} 天 |
|  | `myPage.couponDetail.validityDays_other` | {{count}} days after issue | 발급 후 {{count}}일 | 领取后 {{count}} 天 | 領取後 {{count}} 天 |
|  | `myPage.couponDetail.title` | Coupon detail | 쿠폰상세 | 优惠券详情 | 優惠券詳情 |
|  | `myPage.couponDetail.unavailable` | This coupon has been used or has expired | 이미 사용했거나 만료된 쿠폰이에요 | 此优惠券已使用或已过期 | 這張優惠券已使用或已過期 |
| ● | `myPage.profileEdit.avatarCameraPermissionDenied` | Camera access is required to take a profile photo. You can allow it in Settings. | 프로필 사진을 촬영하려면 카메라 접근 권한이 필요합니다. 설정에서 허용해주세요. | 拍摄头像需要相机权限。你可以在设置中允许。 | 拍攝大頭貼需要相機權限。你可以在設定中允許。 |
|  | `myPage.profileEdit.avatarCancel` | Cancel | 취소 | 取消 | 取消 |
| ● | `myPage.profileEdit.avatarChangeFailed` | Could not change the profile image. Please try again. | 프로필 이미지를 변경하지 못했습니다. 다시 시도해주세요. | 无法更改头像。请重试。 | 無法變更大頭貼。請再試一次。 |
|  | `myPage.profileEdit.avatarFileTooLarge` | This image is too large. Please choose a smaller one. | 이미지 용량이 너무 큽니다. 더 작은 이미지를 선택해주세요. | 图片太大。请选择较小的图片。 | 圖片檔案太大。請選擇較小的圖片。 |
|  | `myPage.profileEdit.avatarFromCamera` | Take a photo | 사진 촬영 | 拍照 | 拍照 |
|  | `myPage.profileEdit.avatarFromLibrary` | Choose from library | 앨범에서 선택 | 从相册选择 | 從相簿選擇 |
|  | `myPage.profileEdit.avatarOpenSettings` | Open settings | 설정 열기 | 打开设置 | 開啟設定 |
| ● | `myPage.profileEdit.avatarPermissionDenied` | Photo library access is required to change your profile image. You can allow it in Settings. | 프로필 이미지를 변경하려면 사진 접근 권한이 필요합니다. 설정에서 허용해주세요. | 更改头像需要照片访问权限。你可以在设置中允许。 | 變更大頭貼需要照片取用權限。你可以在設定中允許。 |
|  | `myPage.profileEdit.avatarRetry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `myPage.profileEdit.avatarSheetTitle` | Change profile photo | 프로필 사진 변경 | 更改头像 | 變更大頭貼 |
|  | `myPage.profileEdit.avatarTypeUnsupported` | Only JPEG or PNG images can be used as a profile image. | JPEG 또는 PNG 이미지만 프로필 이미지로 사용할 수 있습니다. | 只有 JPEG 或 PNG 图片可用作头像。 | 只有 JPEG 或 PNG 圖片可用作大頭貼。 |
|  | `myPage.profileEdit.avatarUploading` | Uploading profile image | 프로필 이미지 업로드 중 | 正在上传头像 | 正在上傳大頭貼 |
|  | `myPage.profileEdit.changeAvatar` | Change profile image | 프로필 이미지 변경 | 更改头像 | 變更大頭貼 |
|  | `myPage.profileEdit.confirmPassword` | Confirm new password | 새 비밀번호 확인 | 确认新密码 | 確認新密碼 |
|  | `myPage.profileEdit.confirmPasswordPlaceholder` | Re-enter the new password | 새 비밀번호를 다시 입력하세요 | 请再次输入新密码 | 請再次輸入新密碼 |
|  | `myPage.profileEdit.currentPassword` | Current password | 현재 비밀번호 | 当前密码 | 目前密碼 |
|  | `myPage.profileEdit.currentPasswordInvalid` | Your current password is incorrect | 현재 비밀번호가 올바르지 않습니다 | 当前密码不正确 | 目前密碼不正確 |
|  | `myPage.profileEdit.currentPasswordPlaceholder` | Enter your current password | 현재 비밀번호를 입력하세요 | 请输入当前密码 | 請輸入目前密碼 |
|  | `myPage.profileEdit.currentPasswordRequired` | Enter your current password to set a new one | 비밀번호를 변경하려면 현재 비밀번호를 입력하세요 | 要设置新密码，请输入当前密码 | 若要設定新密碼，請輸入目前密碼 |
|  | `myPage.profileEdit.hidePassword` | Hide {{field}} | {{field}} 숨기기 | 隐藏{{field}} | 隱藏{{field}} |
|  | `myPage.profileEdit.infoTitle` | Edit info | 정보 수정 | 修改信息 | 修改資訊 |
|  | `myPage.profileEdit.newPassword` | New password | 새 비밀번호 | 新密码 | 新密碼 |
|  | `myPage.profileEdit.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | 至少 8 个字符 | 至少 8 個字元 |
| ● | `myPage.profileEdit.passwordChangeFailed` | Could not change the password. | 비밀번호를 변경하지 못했습니다. | 无法更改密码。 | 無法變更密碼。 |
|  | `myPage.profileEdit.passwordChangePartialFailure` | The username was changed, but the password was not. {{reason}} | 아이디는 변경했지만 비밀번호는 변경하지 못했습니다. {{reason}} | 用户名已更改，但密码未能更改。{{reason}} | 帳號已變更，但密碼未能變更。{{reason}} |
|  | `myPage.profileEdit.passwordMismatch` | The new passwords do not match | 새 비밀번호가 서로 다릅니다 | 两次输入的新密码不一致 | 兩次輸入的新密碼不一致 |
|  | `myPage.profileEdit.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | 密码至少需要 8 个字符 | 密碼至少需要 8 個字元 |
|  | `myPage.profileEdit.save` | Save changes | 변경 사항 저장하기 | 保存更改 | 儲存變更 |
|  | `myPage.profileEdit.saving` | Saving... | 저장 중... | 正在保存… | 正在儲存… |
|  | `myPage.profileEdit.showPassword` | Show {{field}} | {{field}} 보기 | 显示{{field}} | 顯示{{field}} |
|  | `myPage.profileEdit.title` | Edit profile | 프로필 편집 | 编辑个人资料 | 編輯個人檔案 |
|  | `myPage.profileEdit.username` | Username | 아이디 | 用户名 | 帳號 |
| ● | `myPage.profileEdit.usernameChangeFailed` | Could not change the username. | 아이디를 변경하지 못했습니다. | 无法更改用户名。 | 無法變更帳號。 |
|  | `myPage.profileEdit.usernameLengthInvalid` | Username must be between 4 and 50 characters. | 아이디는 4자 이상 50자 이하여야 합니다. | 用户名长度必须为 4 到 50 个字符。 | 帳號長度必須為 4 到 50 個字元。 |
|  | `myPage.profileEdit.usernameRequired` | Enter a username. | 아이디를 입력해주세요. | 请输入用户名。 | 請輸入帳號。 |
| ● | `myPage.profileError` | Could not load your profile. | 프로필을 불러오지 못했어요. | 无法加载你的个人资料。 | 無法載入你的個人檔案。 |
|  | `myPage.profileLoading` | Loading your profile | 프로필을 불러오는 중 | 正在加载你的个人资料 | 正在載入你的個人檔案 |
|  | `myPage.profileUnavailable` | Profile unavailable | 프로필 정보 없음 | 暂无个人资料 | 無個人檔案資訊 |
|  | `myPage.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `myPage.settings` | Settings | 설정 | 设置 | 設定 |
|  | `myPage.stats.coupons` | Coupons | 쿠폰 | 优惠券 | 優惠券 |
|  | `myPage.stats.reservations` | Reservations | 예약 | 预约 | 預約 |
|  | `myPage.stats.reviews` | Reviews | 리뷰 | 评价 | 評論 |
|  | `myPage.title` | My page | 마이 페이지 | 我的页面 | 我的頁面 |
| ● | `myPage.travel.error` | Could not load your travel schedule. | 여행 일정을 불러오지 못했어요. | 无法加载你的旅行日程。 | 無法載入你的旅行行程。 |
|  | `myPage.travel.loading` | Loading your travel schedule | 여행 일정을 불러오는 중 | 正在加载你的旅行日程 | 正在載入你的旅行行程 |
|  | `myPage.travel.nextMonth` | Next month | 다음 달 | 下个月 | 下個月 |
|  | `myPage.travel.notEditable` | This travel schedule can no longer be edited. | 이 여행 일정은 더 이상 변경할 수 없어요. | 此旅行日程已无法修改。 | 這個旅行行程已無法修改。 |
|  | `myPage.travel.periodOverlap` | These dates overlap another travel schedule. | 다른 여행 일정과 기간이 겹쳐요. | 这些日期与其他旅行日程重叠。 | 這些日期與其他旅行行程重疊。 |
|  | `myPage.travel.previousMonth` | Previous month | 이전 달 | 上个月 | 上個月 |
|  | `myPage.travel.saving` | Saving dates... | 날짜 저장 중... | 正在保存日期… | 正在儲存日期… |
|  | `myPage.travel.startDateInPast` | Choose today or a future date. | 오늘 또는 이후 날짜를 선택해주세요. | 请选择今天或之后的日期。 | 請選擇今天或之後的日期。 |
|  | `myPage.travel.title` | My trips | 나의 여행 | 我的旅行 | 我的旅行 |
| ● | `myPage.travel.updateError` | Could not save your travel dates. | 여행 날짜를 저장하지 못했어요. | 无法保存你的旅行日期。 | 無法儲存你的旅行日期。 |
|  | `myPage.travel.weekdays.sun` | S | S | 日 | 日 |
|  | `myPage.travel.weekdays.mon` | M | M | 一 | 一 |
|  | `myPage.travel.weekdays.tue` | T | T | 二 | 二 |
|  | `myPage.travel.weekdays.wed` | W | W | 三 | 三 |
|  | `myPage.travel.weekdays.thu` | T | T | 四 | 四 |
|  | `myPage.travel.weekdays.fri` | F | F | 五 | 五 |
|  | `myPage.travel.weekdays.sat` | S | S | 六 | 六 |
|  | `myPage.verifiedPlaces.empty` | No verified places yet | 아직 검증한 장소가 없어요 | 还没有验证过的地点 | 目前還沒有驗證過的地點 |
| ● | `myPage.verifiedPlaces.error` | Could not load your verified places. | 인증한 장소를 불러오지 못했어요. | 无法加载你验证过的地点。 | 無法載入你驗證過的地點。 |
|  | `myPage.verifiedPlaces.favorite` | Save place | 장소 저장 | 收藏地点 | 收藏地點 |
|  | `myPage.verifiedPlaces.loading` | Loading verified places | 인증한 장소를 불러오는 중 | 正在加载验证过的地点 | 正在載入驗證過的地點 |
|  | `myPage.verifiedPlaces.title` | Verified places | 검증한 장소 | 验证过的地点 | 驗證過的地點 |
|  | `myPage.verifiedPlaces.unfavorite` | Remove saved place | 저장 취소 | 取消收藏 | 取消收藏 |

## `settings`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `settings.support.loading` | Loading | 불러오는 중 | 正在加载 | 正在載入 |
| ● | `settings.support.error` | Could not load | 불러오지 못했습니다 | 无法加载 | 無法載入 |
|  | `settings.support.empty` | No information | 정보 없음 | 暂无信息 | 無資訊 |
|  | `settings.support.navigationUnavailable` | Navigation is unavailable for this screen. Return to settings and try again. | 이 화면의 탐색 연결을 사용할 수 없습니다. 설정으로 돌아가 다시 시도해 주세요. | 此页面的导航不可用。请返回设置后重试。 | 這個畫面的導覽無法使用。請返回設定後再試一次。 |
|  | `settings.support.guide` | Unavailable feature. Opens an explanation. | 미지원 기능입니다. 사유 안내를 엽니다. | 不支持的功能。将打开原因说明。 | 不支援的功能。將開啟原因說明。 |
|  | `settings.support.emailEdit` | Edit email | 이메일 수정 | 修改邮箱 | 修改電子郵件 |
|  | `settings.support.emailReason` | Direct email editing is unavailable because no update contract is published. | 이메일 직접 수정 계약이 공개되지 않아 사용할 수 없습니다. | 由于尚未公开邮箱修改接口，无法直接修改邮箱。 | 由於尚未公開電子郵件修改介面，無法直接修改電子郵件。 |
|  | `settings.support.oauth` | Connected accounts | 연결된 계정 | 已关联的账号 | 已連結的帳號 |
|  | `settings.support.oauthReason` | The server does not provide a connected-account status query. | 서버에서 계정 연결 상태 조회를 제공하지 않습니다. | 服务器不提供账号关联状态查询。 | 伺服器不提供帳號連結狀態查詢。 |
|  | `settings.support.checkInCount` | Check-ins | 체크인 수 | 签到次数 | 打卡次數 |
|  | `settings.support.reviewCount` | My reviews | 내 리뷰 수 | 我的评价数 | 我的評論數 |
|  | `settings.support.verifiedCount` | Verified places | 검증한 장소 | 验证过的地点 | 驗證過的地點 |
|  | `settings.support.verifiedReason` | Check-in totals count visits, not unique verified places. A verified-place total is unavailable. | 체크인 수는 방문 횟수이며 고유한 검증 장소 수가 아닙니다. 검증 장소 수는 제공되지 않습니다. | 签到次数统计的是到访次数，而不是不重复的已验证地点数。暂不提供已验证地点总数。 | 打卡次數統計的是造訪次數，而不是不重複的已驗證地點數。目前不提供已驗證地點總數。 |
| ● | `settings.support.logoutError` | Could not complete logout. Please check your sign-in state. | 로그아웃을 완료하지 못했습니다. 로그인 상태를 확인해 주세요. | 无法完成退出登录。请检查你的登录状态。 | 無法完成登出。請確認你的登入狀態。 |
|  | `settings.export.title` | My data | 내 데이터 | 我的数据 | 我的資料 |
|  | `settings.export.download` | Download my data | 내 데이터 다운로드 | 下载我的数据 | 下載我的資料 |
|  | `settings.export.confirm` | Prepare a JSON file containing your personal data? Choose where to save it in the share sheet. | 개인정보가 포함된 JSON 파일을 준비할까요? 공유 화면에서 저장 위치를 선택해 주세요. | 要准备包含个人信息的 JSON 文件吗？请在分享界面中选择保存位置。 | 要準備包含個人資料的 JSON 檔案嗎？請在分享畫面中選擇儲存位置。 |
|  | `settings.export.cancel` | Cancel | 취소 | 取消 | 取消 |
|  | `settings.export.description` | Export the data provided by your account. This does not download location history or delete data. | 계정에서 제공하는 데이터를 내보냅니다. 위치 기록 다운로드나 데이터 삭제 기능은 아닙니다. | 导出你的账号提供的数据。这不是下载位置记录或删除数据的功能。 | 匯出你的帳號提供的資料。這不是下載位置紀錄或刪除資料的功能。 |
|  | `settings.export.loading` | Preparing the file… | 파일을 준비하는 중입니다. | 正在准备文件… | 正在準備檔案… |
|  | `settings.export.cancelled` | Download cancelled. | 다운로드를 취소했습니다. | 已取消下载。 | 已取消下載。 |
| ● | `settings.export.error` | Could not download. Please try again. | 다운로드하지 못했습니다. 다시 시도해 주세요. | 无法下载。请重试。 | 無法下載。請再試一次。 |
|  | `settings.export.prepared` | File prepared. Saving or cancelling in the share sheet cannot be confirmed by the app. | 파일을 준비했습니다. 공유 화면에서의 저장 또는 취소 여부는 앱이 확인할 수 없습니다. | 文件已准备好。应用无法确认你在分享界面中是保存还是取消。 | 檔案已準備好。App 無法確認你在分享畫面中是儲存還是取消。 |
|  | `settings.appearance.dark` | Dark mode | 다크 모드 | 深色模式 | 深色模式 |
|  | `settings.appearance.description` | Choose whether PingDom follows your device appearance or uses a fixed mode. | 기기 화면 설정을 따르거나 원하는 화면 모드를 고정할 수 있어요. | 选择让 PingDom 跟随设备外观，或固定使用某种模式。 | 選擇讓 PingDom 跟隨裝置外觀，或固定使用某種模式。 |
|  | `settings.appearance.light` | Light mode | 라이트 모드 | 浅色模式 | 淺色模式 |
|  | `settings.appearance.section` | Appearance | 화면 모드 | 外观 | 外觀 |
|  | `settings.appearance.selected` | Selected | 선택됨 | 已选择 | 已選取 |
|  | `settings.appearance.system` | Use system setting | 시스템 설정 사용 | 跟随系统设置 | 使用系統設定 |
|  | `settings.appearance.title` | Appearance | 화면 모드 | 外观 | 外觀 |
|  | `settings.language.description` | Choose the language used throughout PingDom. | 핑덤에서 사용할 언어를 선택해 주세요. | 请选择 PingDom 使用的语言。 | 請選擇 PingDom 使用的語言。 |
|  | `settings.language.section` | Language | 언어 | 语言 | 語言 |
|  | `settings.language.selected` | Selected | 선택됨 | 已选择 | 已選取 |
|  | `settings.language.title` | Language | 언어 설정 | 语言设置 | 語言設定 |
| ● | `settings.account.deleteDescription` | Deleting your account permanently removes your records and First Recorder history. | 탈퇴하면 내가 남긴 기록과 First Recorder 이력이 모두 사라져요. | 注销账号后，你留下的记录和 First Recorder 历史将被永久删除。 | 刪除帳號後，你留下的紀錄與 First Recorder 歷程將永久刪除。 |
|  | `settings.account.email` | Email | 이메일 | 邮箱 | 電子郵件 |
|  | `settings.account.items.coupons` | Coupons | 쿠폰 | 优惠券 | 優惠券 |
| ● | `settings.account.items.deleteAccount` | Delete account | 회원 탈퇴 | 注销账号 | 刪除帳號 |
|  | `settings.account.items.loginInformation` | Login information | 로그인 정보 | 登录信息 | 登入資訊 |
|  | `settings.account.items.loginInformationDescription` | Email and password | 이메일 및 비밀번호 | 邮箱和密码 | 電子郵件與密碼 |
|  | `settings.account.items.logout` | Log out | 로그아웃 | 退出登录 | 登出 |
|  | `settings.account.items.myRecords` | My records | 내 기록 | 我的记录 | 我的紀錄 |
|  | `settings.account.loginSection` | Login information | 로그인 정보 | 登录信息 | 登入資訊 |
|  | `settings.account.sections.account` | Account | 계정 | 账号 | 帳號 |
|  | `settings.account.sections.activity` | Activity | 활동 | 活动 | 活動 |
|  | `settings.account.sections.session` | Session | 세션 | 会话 | 工作階段 |
|  | `settings.account.title` | Account management | 계정 관리 | 账号管理 | 帳號管理 |
|  | `settings.account.username` | Username | 아이디 | 用户名 | 帳號 |
|  | `settings.back` | Back | 뒤로가기 | 返回 | 返回 |
| ● | `settings.deleteAccount` | Delete account | 회원 탈퇴 | 注销账号 | 刪除帳號 |
|  | `settings.details.appInformation.description` | App information will be available in a later update. | 앱 정보는 추후 업데이트에서 제공할 예정입니다. | 应用信息将在后续更新中提供。 | App 資訊將在後續更新中提供。 |
|  | `settings.details.appInformation.title` | App information | 앱 정보 | 应用信息 | App 資訊 |
|  | `settings.details.coupons.description` | The coupon box will be connected in a separate update. | 쿠폰 보관함은 별도 업데이트에서 연결할 예정입니다. | 优惠券包将在单独的更新中接入。 | 優惠券匣將在另一次更新中串接。 |
|  | `settings.details.coupons.title` | Coupons | 쿠폰 | 优惠券 | 優惠券 |
|  | `settings.details.dataManagement.description` | Data download and deletion will be connected after its policy is defined. | 데이터 다운로드와 삭제는 정책 확정 후 연결할 예정입니다. | 数据下载和删除将在政策确定后接入。 | 資料下載與刪除將在政策確定後串接。 |
|  | `settings.details.dataManagement.title` | Download or delete data | 데이터 다운로드 · 삭제 | 下载或删除数据 | 下載或刪除資料 |
| ● | `settings.details.deleteAccount.description` | Account deletion is unavailable until reauthentication and confirmation policies are defined. Your account has not been changed. | 재인증과 최종 확인 정책이 정해지지 않아 회원 탈퇴를 사용할 수 없습니다. 계정에는 아무 변경도 적용되지 않았습니다. | 在重新验证身份和最终确认政策确定之前，无法注销账号。你的账号未发生任何更改。 | 在重新驗證身分與最終確認政策確定之前，無法刪除帳號。你的帳號沒有任何變更。 |
| ● | `settings.details.deleteAccount.title` | Delete account | 회원 탈퇴 | 注销账号 | 刪除帳號 |
|  | `settings.details.footprintMap.description` | There is no footprint map screen or matching data contract yet. | 발자국 지도 전용 화면과 데이터 계약이 아직 없습니다. | 目前还没有足迹地图页面及对应的数据接口。 | 目前還沒有足跡地圖畫面與對應的資料介面。 |
|  | `settings.details.footprintMap.title` | My footprint map | 내 발자국 지도 | 我的足迹地图 | 我的足跡地圖 |
|  | `settings.details.locationSettings.description` | Location settings will be connected in a separate update. | 위치 정보 설정은 별도 업데이트에서 연결할 예정입니다. | 位置信息设置将在单独的更新中接入。 | 位置資訊設定將在另一次更新中串接。 |
|  | `settings.details.locationSettings.title` | Location settings | 위치 정보 설정 | 位置信息设置 | 位置資訊設定 |
|  | `settings.details.loginInformation.description` | Login information management will be connected in a separate update. | 로그인 정보 관리는 별도 업데이트에서 연결할 예정입니다. | 登录信息管理将在单独的更新中接入。 | 登入資訊管理將在另一次更新中串接。 |
|  | `settings.details.loginInformation.title` | Login information | 로그인 정보 | 登录信息 | 登入資訊 |
|  | `settings.details.logout.description` | Logout is not connected yet. You are still signed in. | 로그아웃은 아직 연결되지 않았습니다. 로그인 상태가 유지됩니다. | 退出登录功能尚未接入。你仍处于登录状态。 | 登出功能尚未串接。你仍處於登入狀態。 |
|  | `settings.details.logout.title` | Log out | 로그아웃 | 退出登录 | 登出 |
|  | `settings.details.myRecords.description` | Record management has no dedicated screen or defined scope yet. Reviews and check-ins are different records. | 내 기록 관리의 범위와 전용 화면이 정해지지 않았습니다. 리뷰와 체크인은 서로 다른 기록입니다. | 我的记录管理尚未确定范围和专用页面。评价和签到是不同的记录。 | 我的紀錄管理尚未確定範圍與專用畫面。評論與打卡是不同的紀錄。 |
|  | `settings.details.myRecords.title` | Manage my records | 내 기록 관리 | 管理我的记录 | 管理我的紀錄 |
| ● | `settings.details.notices.description` | An official notices source and screen have not been configured. | 공식 공지사항 제공 경로와 화면이 아직 연결되지 않았습니다. | 官方公告的来源和页面尚未配置。 | 官方公告的來源與畫面尚未設定。 |
| ● | `settings.details.notices.title` | Notices | 공지사항 | 公告 | 公告 |
|  | `settings.details.notificationSettings.description` | Notification settings will be connected in a separate update. | 알림 설정은 별도 업데이트에서 연결할 예정입니다. | 通知设置将在单独的更新中接入。 | 通知設定將在另一次更新中串接。 |
|  | `settings.details.notificationSettings.title` | Notification settings | 알림 설정 | 通知设置 | 通知設定 |
|  | `settings.details.passwordChange.description` | Password change is not connected yet. Your password has not been changed. | 비밀번호 변경은 아직 연결되지 않았습니다. 비밀번호에는 아무 변경도 적용되지 않았습니다. | 修改密码功能尚未接入。你的密码未发生任何更改。 | 變更密碼功能尚未串接。你的密碼沒有任何變更。 |
|  | `settings.details.passwordChange.title` | Change password | 비밀번호 변경 | 修改密码 | 變更密碼 |
| ● | `settings.details.privacyPolicy.description` | The approved privacy policy document and its URL have not been configured. | 승인된 개인정보 처리방침 문서와 URL이 아직 연결되지 않았습니다. | 已批准的隐私政策文档及其 URL 尚未配置。 | 已核准的隱私權政策文件及其 URL 尚未設定。 |
| ● | `settings.details.privacyPolicy.title` | Privacy policy | 개인정보 처리방침 | 隐私政策 | 隱私權政策 |
| ● | `settings.details.privacySettings.description` | Privacy settings will be connected in a separate update. | 개인정보 설정은 별도 업데이트에서 연결할 예정입니다. | 隐私设置将在单独的更新中接入。 | 隱私設定將在另一次更新中串接。 |
| ● | `settings.details.privacySettings.title` | Privacy settings | 개인정보 설정 | 隐私设置 | 隱私設定 |
|  | `settings.details.savedPlaces.description` | A dedicated saved-place management screen is not defined yet. | 저장 장소 관리 전용 화면이 아직 정의되지 않았습니다. | 尚未定义专用的收藏地点管理页面。 | 尚未定義專用的收藏地點管理畫面。 |
|  | `settings.details.savedPlaces.title` | Manage saved places | 관심 장소 관리 | 管理收藏的地点 | 管理收藏的地點 |
| ● | `settings.details.terms.description` | The approved terms document and its URL have not been configured. | 승인된 이용약관 문서와 URL이 아직 연결되지 않았습니다. | 已批准的服务条款文档及其 URL 尚未配置。 | 已核准的服務條款文件及其 URL 尚未設定。 |
| ● | `settings.details.terms.title` | Terms of service | 이용약관 | 服务条款 | 服務條款 |
|  | `settings.location.title` | Location & privacy | 위치·개인정보 | 位置与隐私 | 位置與隱私 |
|  | `settings.location.locationSection` | Location information | 위치 정보 | 位置信息 | 位置資訊 |
|  | `settings.location.visibilitySection` | Visibility | 공개 범위 | 公开范围 | 公開範圍 |
|  | `settings.location.dataSection` | Data management | 데이터 관리 | 数据管理 | 資料管理 |
|  | `settings.location.description` | Check device location permission and supported features. This screen does not collect your location. | 기기 위치 권한과 지원되는 기능을 확인하세요. 이 화면에서는 위치를 수집하지 않습니다. | 查看设备定位权限和支持的功能。此页面不会收集你的位置。 | 查看裝置定位權限與支援的功能。這個畫面不會收集你的位置。 |
|  | `settings.location.device` | Device location permission | 기기 위치 권한 | 设备定位权限 | 裝置定位權限 |
|  | `settings.location.foreground` | Collect location only while recording | 기록할 때만 위치 수집 | 仅在记录时收集位置 | 僅在記錄時收集位置 |
|  | `settings.location.verification` | GPS on-site verification | GPS 현장 인증 | GPS 现场验证 | GPS 現場驗證 |
|  | `settings.location.profileVisibility` | Profile visibility | 프로필 공개 | 公开个人资料 | 公開個人檔案 |
|  | `settings.location.nickname` | Show nickname in place history | 장소 기록에 닉네임 표시 | 在地点记录中显示昵称 | 在地點紀錄中顯示暱稱 |
|  | `settings.location.download` | Export my data | 내 데이터 내보내기 | 导出我的数据 | 匯出我的資料 |
| ● | `settings.location.deleteHistory` | Delete all location history | 위치 기록 전체 삭제 | 删除全部位置记录 | 刪除全部位置紀錄 |
| ● | `settings.location.permissionStates.loading` | Checking | 확인 중 | 确认中 | 確認中 |
| ● | `settings.location.permissionStates.granted` | Allowed | 허용됨 | 已允许 | 已允許 |
| ● | `settings.location.permissionStates.denied` | Permission needed | 권한 필요 | 需要权限 | 需要權限 |
| ● | `settings.location.permissionStates.restricted` | Allow in device settings | 설정에서 허용 필요 | 需在设备设置中允许 | 需在裝置設定中允許 |
| ● | `settings.location.permissionStates.unavailable` | Unavailable | 사용할 수 없음 | 不可用 | 無法使用 |
| ● | `settings.location.permissionStates.error` | Could not check permission | 확인 실패 | 无法确认权限 | 無法確認權限 |
|  | `settings.location.request` | Request location permission | 위치 권한 요청 | 请求定位权限 | 要求定位權限 |
|  | `settings.location.openSettings` | Open device settings | 기기 설정 열기 | 打开设备设置 | 開啟裝置設定 |
|  | `settings.location.retry` | Check again | 다시 확인 | 重新确认 | 重新確認 |
| ● | `settings.location.settingsError` | Could not open device settings. Please try again. | 기기 설정을 열지 못했습니다. 다시 시도해 주세요. | 无法打开设备设置。请重试。 | 無法開啟裝置設定。請再試一次。 |
| ● | `settings.location.permissionNotice` | Change or revoke permission in device settings. This screen does not start location tracking. | 권한 변경·해제는 기기 설정에서 할 수 있습니다. 이 화면에서는 위치 추적을 시작하지 않습니다. | 可在设备设置中更改或撤销权限。此页面不会开始位置跟踪。 | 可在裝置設定中變更或撤銷權限。這個畫面不會開始追蹤位置。 |
|  | `settings.location.capability.loading` | Checking availability | 사용 가능 여부 확인 중 | 正在确认是否可用 | 正在確認是否可用 |
|  | `settings.location.capability.granted` | Location permission allows use | 위치 권한이 있어 사용 가능 | 已有定位权限，可以使用 | 已有定位權限，可以使用 |
| ● | `settings.location.capability.denied` | Location permission required | 위치 권한이 필요함 | 需要定位权限 | 需要定位權限 |
|  | `settings.location.capability.restricted` | Permission must be allowed in device settings | 기기 설정에서 위치 권한 허용이 필요함 | 需在设备设置中允许定位权限 | 需在裝置設定中允許定位權限 |
|  | `settings.location.capability.unavailable` | Unavailable on this device | 현재 기기에서 사용할 수 없음 | 此设备不可用 | 此裝置無法使用 |
| ● | `settings.location.capability.error` | Could not check availability | 사용 가능 여부 확인 실패 | 无法确认是否可用 | 無法確認是否可用 |
|  | `settings.location.foregroundDescription` | Not supported. A policy for saving this choice is not available. This is separate from periodic location collection. | 지원되지 않음 · 이 선택을 저장할 정책이 아직 없습니다. 주기적인 위치 수집과는 별개입니다. | 不支持 · 目前没有保存此选项的政策。这与定期位置收集无关。 | 不支援 · 目前沒有儲存這個選項的政策。這與定期位置收集無關。 |
|  | `settings.location.footprintDescription` | Coming soon. A map of your location history is not available yet. | 준비 중 · 내 위치 기록을 보여주는 지도는 아직 지원하지 않습니다. | 即将推出 · 暂不支持显示位置记录的地图。 | 即將推出 · 尚未支援顯示位置紀錄的地圖。 |
|  | `settings.location.visibilityDescription` | Not supported. Profile visibility cannot be saved yet. | 지원되지 않음 · 프로필 공개 범위를 저장하는 기능이 아직 없습니다. | 不支持 · 目前无法保存个人资料公开范围。 | 不支援 · 目前無法儲存個人檔案公開範圍。 |
|  | `settings.location.nicknameDescription` | Not supported. Nickname visibility cannot be saved yet. | 지원되지 않음 · 닉네임 표시 여부를 저장하는 기능이 아직 없습니다. | 不支持 · 目前无法保存是否显示昵称。 | 不支援 · 目前無法儲存是否顯示暱稱。 |
|  | `settings.location.downloadDescription` | Export account information and other supported user data. This is not a location history download. | 계정 정보 등 지원되는 사용자 데이터를 내보냅니다. 위치 기록 다운로드가 아닙니다. | 导出账号信息等受支持的用户数据。这不是位置记录下载。 | 匯出帳號資訊等支援的使用者資料。這不是位置紀錄下載。 |
| ● | `settings.location.policyDescription` | Coming soon. The approved privacy policy document is not connected yet. | 준비 중 · 승인된 개인정보 처리방침 문서가 아직 연결되지 않았습니다. | 即将推出 · 已批准的隐私政策文档尚未接入。 | 即將推出 · 已核准的隱私權政策文件尚未串接。 |
| ● | `settings.location.deleteDescription` | Not supported. Deleting location history separately is not available. No data will be deleted here. | 지원되지 않음 · 위치 기록만 삭제하는 기능이 아직 없습니다. 여기서는 어떤 데이터도 삭제하지 않습니다. | 不支持 · 目前无法单独删除位置记录。这里不会删除任何数据。 | 不支援 · 目前無法單獨刪除位置紀錄。這裡不會刪除任何資料。 |
|  | `settings.logout` | Log out | 로그아웃 | 退出登录 | 登出 |
|  | `settings.notifications.hotplace` | A place I recorded becomes popular | 내가 먼저 기록한 장소 급상승 | 我记录的地点变得热门 | 我記錄的地點變得熱門 |
|  | `settings.notifications.hotplaceDescription` | Get updates when your First Recorder place is trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | 你作为 First Recorder 记录的地点走红时通知你 | 你以 First Recorder 身分記錄的地點爆紅時通知你 |
|  | `settings.notifications.like` | New activity on my recorded places | 내 기록 장소에 새 반응 | 我记录的地点有新动态 | 我記錄的地點有新動態 |
|  | `settings.notifications.likeDescription` | Get updates when people react to your records | 내가 남긴 장소의 새 반응을 알려드려요 | 有人对你的记录做出回应时通知你 | 有人對你的紀錄做出回應時通知你 |
| ● | `settings.notifications.loadFailed` | Notification settings could not be loaded. | 알림 설정을 불러오지 못했어요. | 无法加载通知设置。 | 無法載入通知設定。 |
|  | `settings.notifications.otherSection` | Other | 기타 | 其他 | 其他 |
|  | `settings.notifications.pushAll` | Allow all push notifications | 푸시 알림 전체 허용 | 允许全部推送通知 | 允許全部推播通知 |
|  | `settings.notifications.pushAllDescription` | You can still receive important account notices | 끄면 안내 알림만 받을 수 있어요 | 关闭后仍可收到重要的账号通知 | 關閉後仍可收到重要的帳號通知 |
|  | `settings.notifications.quiet` | Quiet hours | 야간 알림 받기 | 免打扰时段 | 勿擾時段 |
|  | `settings.notifications.quietDescription` | Use the quiet hours saved to your account | 계정에 저장된 방해 금지 시간을 사용해요 | 使用保存在账号中的免打扰时段 | 使用儲存在帳號中的勿擾時段 |
|  | `settings.notifications.recordsSection` | My records & places | 내 기록 · 장소 | 我的记录 · 地点 | 我的紀錄 · 地點 |
|  | `settings.notifications.title` | Notification settings | 알림 설정 | 通知设置 | 通知設定 |
| ● | `settings.notifications.updateFailedDescription` | Your previous setting was restored. Please try again. | 이전 설정으로 되돌렸어요. 다시 시도해주세요. | 已恢复为之前的设置。请重试。 | 已恢復為先前的設定。請再試一次。 |
| ● | `settings.notifications.updateFailedTitle` | Could not update notifications | 알림 설정을 변경하지 못했어요 | 无法更新通知设置 | 無法更新通知設定 |
|  | `settings.pending.back` | Back to settings | 설정으로 돌아가기 | 返回设置 | 返回設定 |
|  | `settings.pending.title` | Coming soon | 준비 중인 기능입니다 | 即将推出 | 即將推出 |
|  | `settings.rows.accountInfo` | Username · Email | 아이디 · 이메일 | 用户名 · 邮箱 | 帳號 · 電子郵件 |
|  | `settings.rows.dataManagement` | Download · delete data | 데이터 다운로드 · 삭제 | 下载 · 删除数据 | 下載 · 刪除資料 |
|  | `settings.rows.favoritePlaces` | Manage favorite places | 관심 장소 관리 | 管理收藏的地点 | 管理收藏的地點 |
|  | `settings.rows.footprintMap` | My footprint map | 내 발자국 지도 | 我的足迹地图 | 我的足跡地圖 |
|  | `settings.rows.locationSettings` | Location settings | 위치 정보 설정 | 位置信息设置 | 位置資訊設定 |
|  | `settings.rows.myRecords` | Manage my records | 내 기록 관리 | 管理我的记录 | 管理我的紀錄 |
| ● | `settings.rows.notices` | Notices | 공지사항 | 公告 | 公告 |
|  | `settings.rows.notificationSettings` | Notification settings | 알림 설정 | 通知设置 | 通知設定 |
|  | `settings.rows.password` | Change password | 비밀번호 변경 | 修改密码 | 變更密碼 |
| ● | `settings.rows.privacyPolicy` | Privacy policy | 개인정보 처리방침 | 隐私政策 | 隱私權政策 |
|  | `settings.rows.profileEdit` | Edit profile | 프로필 편집 | 编辑个人资料 | 編輯個人檔案 |
| ● | `settings.rows.terms` | Terms of use | 이용약관 | 使用条款 | 使用條款 |
|  | `settings.rows.version` | Version | 버전 정보 | 版本 | 版本 |
|  | `settings.sections.account` | Account | 계정 | 账号 | 帳號 |
|  | `settings.sections.appInfo` | App information | 앱 정보 | 应用信息 | App 資訊 |
|  | `settings.sections.notifications` | Notifications | 알림 | 通知 | 通知 |
|  | `settings.sections.preferences` | Preferences | 환경설정 | 偏好设置 | 偏好設定 |
| ● | `settings.sections.privacy` | Privacy · location | 개인정보 · 위치 | 隐私 · 位置 | 隱私 · 位置 |
|  | `settings.sections.records` | Records · places | 기록 · 장소 | 记录 · 地点 | 紀錄 · 地點 |
|  | `settings.title` | Settings | 설정 | 设置 | 設定 |
|  | `settings.values.everyone` | Everyone | 전체 공개 | 所有人可见 | 所有人可見 |
|  | `settings.values.notConnected` | Not connected | 연결 전 | 未关联 | 尚未連結 |
|  | `settings.values.off` | Off | 꺼짐 | 关闭 | 關閉 |
|  | `settings.values.on` | On | 켜짐 | 开启 | 開啟 |
|  | `settings.values.onlyMe` | Only me | 나만 보기 | 仅自己可见 | 僅自己可見 |

## `merchantMyPage`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `merchantMyPage.back` | Back | 뒤로가기 | 返回 | 返回 |
|  | `merchantMyPage.settings` | Settings | 설정 | 设置 | 設定 |
|  | `merchantMyPage.title` | My page | 마이 페이지 | 我的页面 | 我的頁面 |
| ● | `merchantMyPage.roleLabel` | Business owner | 사업자 | 商家 | 店家 |
|  | `merchantMyPage.loading` | Loading your store | 가게 정보를 불러오는 중 | 正在加载你的店铺 | 正在載入你的店家 |
| ● | `merchantMyPage.loadError` | Could not load your store. | 가게 정보를 불러오지 못했어요. | 无法加载你的店铺。 | 無法載入你的店家。 |
|  | `merchantMyPage.retry` | Try again | 다시 시도 | 重试 | 再試一次 |
|  | `merchantMyPage.review.author` | Visitor #{{id}} | 이용인 #{{id}} | 顾客 #{{id}} | 顧客 #{{id}} |
|  | `merchantMyPage.review.time` | {{date}} · {{relative}} | {{date}} · {{relative}} | {{date}} · {{relative}} | {{date}} · {{relative}} |
|  | `merchantMyPage.noStore` | No store is linked to this account yet. | 아직 연결된 가게가 없어요. | 此账号尚未关联店铺。 | 此帳號尚未連結店家。 |
|  | `merchantMyPage.store.title` | My store | 나의 가게 | 我的店铺 | 我的店家 |
|  | `merchantMyPage.store.verifiedCount` | {{count}} people verified this! | {{count}}명이 검증했어요! | 已有 {{count}} 人验证！ | 已有 {{count}} 人驗證！ |
|  | `merchantMyPage.store.address` | Location | 위치 | 位置 | 位置 |
|  | `merchantMyPage.store.businessHours` | Business hours | 영업 시간 | 营业时间 | 營業時間 |
|  | `merchantMyPage.store.phoneNumber` | Phone number | 전화번호 | 电话号码 | 電話號碼 |
|  | `merchantMyPage.store.editField` | Edit {{field}} | {{field}} 수정 | 修改{{field}} | 修改{{field}} |
|  | `merchantMyPage.store.features.englishSupport` | English available | 영어응대 가능 | 可用英语沟通 | 可用英語溝通 |
|  | `merchantMyPage.store.features.parking` | Parking available | 주차가능 | 可停车 | 可停車 |
|  | `merchantMyPage.reviews.title` | Reviews | 리뷰 | 评价 | 評論 |
|  | `merchantMyPage.reviews.viewAll` | See all reviews | 리뷰 모두 보기 | 查看全部评价 | 查看全部評論 |
|  | `merchantMyPage.reviews.empty` | No reviews yet | 아직 리뷰가 없어요 | 还没有评价 | 目前還沒有評論 |
|  | `merchantMyPage.events.title` | Event management | 이벤트 관리 | 活动管理 | 活動管理 |
|  | `merchantMyPage.events.subtitle` | Currently running events | 현재 진행중인 이벤트 | 当前进行中的活动 | 目前進行中的活動 |
|  | `merchantMyPage.events.create` | New event | 새 이벤트 | 新建活动 | 新增活動 |
| ● | `merchantMyPage.events.delete` | Delete event | 이벤트 삭제 | 删除活动 | 刪除活動 |
|  | `merchantMyPage.events.empty` | No events yet | 아직 이벤트가 없어요 | 还没有活动 | 目前還沒有活動 |
|  | `merchantMyPage.events.closeConfirmTitle` | Close this event? | 이벤트를 종료할까요? | 要结束此活动吗？ | 要結束這個活動嗎？ |
|  | `merchantMyPage.events.closeConfirmBody` | Closed events can no longer be issued to tourists. | 종료한 이벤트는 더 이상 관광객에게 발급되지 않아요. | 已结束的活动将不再向游客发放。 | 已結束的活動將不再發放給旅客。 |
|  | `merchantMyPage.events.closeConfirm` | Close | 종료 | 结束 | 結束 |
|  | `merchantMyPage.events.closeCancel` | Cancel | 취소 | 取消 | 取消 |
| ● | `merchantMyPage.events.closeFailed` | Could not close the event. | 이벤트를 종료하지 못했어요. | 无法结束活动。 | 無法結束活動。 |
|  | `merchantMyPage.events.status.ongoing` | Ongoing | 진행중 | 进行中 | 進行中 |
|  | `merchantMyPage.events.status.ended` | Ended | 종료 | 已结束 | 已結束 |
|  | `merchantMyPage.events.status.upcoming` | Upcoming | 예정됨 | 即将开始 | 即將開始 |

## `placeDetail`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `placeDetail.back` | Back | 뒤로 | 返回 | 返回 |
|  | `placeDetail.couponUsage` | Coupon use: {{value}} | 쿠폰 사용: {{value}} | 优惠券使用：{{value}} | 優惠券使用：{{value}} |
|  | `placeDetail.englishMenu` | English menu: {{value}} | 영문 메뉴: {{value}} | 英文菜单：{{value}} | 英文菜單：{{value}} |
|  | `placeDetail.languages` | Languages: {{value}} | 지원 언어: {{value}} | 支持语言：{{value}} | 支援語言：{{value}} |
|  | `placeDetail.liveStatus` | Live status | 실시간 상태 | 实时状态 | 即時狀態 |
|  | `placeDetail.loading` | Loading place details... | 장소 상세를 불러오는 중입니다... | 正在加载地点详情… | 正在載入地點詳情… |
|  | `placeDetail.offer.eligibility` | Who can claim: {{value}} | 발급 대상: {{value}} | 领取对象：{{value}} | 領取對象：{{value}} |
|  | `placeDetail.offer.expiry` | Valid: {{value}} | 유효 기간: {{value}} | 有效期：{{value}} | 有效期限：{{value}} |
|  | `placeDetail.offer.title` | Coupon offer | 쿠폰 혜택 | 优惠券福利 | 優惠券優惠 |
|  | `placeDetail.operating.beforeOpen` | Not open yet | 영업 전 | 尚未营业 | 尚未營業 |
|  | `placeDetail.operating.closed` | Closed | 영업 종료 | 已打烊 | 已打烊 |
|  | `placeDetail.operating.closedToday` | Closed today | 오늘 휴무 | 今日休息 | 今日公休 |
|  | `placeDetail.operating.closesAt` | Closes at {{time}} | {{time}}에 영업 종료 | {{time}} 结束营业 | {{time}} 結束營業 |
|  | `placeDetail.operating.open` | Open | 영업 중 | 营业中 | 營業中 |
|  | `placeDetail.operating.opensAt` | Opens at {{time}} | {{time}}에 영업 시작 | {{time}} 开始营业 | {{time}} 開始營業 |
|  | `placeDetail.operating.opensLaterAt` | Opens on the next business day at {{time}} | 다음 영업일 {{time}}에 영업 시작 | 下一个营业日 {{time}} 开始营业 | 下一個營業日 {{time}} 開始營業 |
|  | `placeDetail.operating.opensTomorrowAt` | Opens tomorrow at {{time}} | 내일 {{time}}에 영업 시작 | 明天 {{time}} 开始营业 | 明天 {{time}} 開始營業 |
|  | `placeDetail.operating.permanentlyClosed` | Permanently closed | 폐업 | 已停业 | 已歇業 |
|  | `placeDetail.operating.temporarilyClosed` | Temporarily closed | 임시 휴무 | 暂停营业 | 暫停營業 |
|  | `placeDetail.operating.unknown` | Hours unavailable | 영업시간 정보 없음 | 暂无营业时间信息 | 無營業時間資訊 |
|  | `placeDetail.review.anonymousUser` | User | 사용자 | 用户 | 使用者 |
|  | `placeDetail.verification.admin` | Administrator verified | 관리자 확인 정보 | 管理员确认的信息 | 管理員確認的資訊 |
|  | `placeDetail.verification.owner` | Provided by the business | 사업자 제공 정보 | 商家提供的信息 | 店家提供的資訊 |
|  | `placeDetail.verification.source` | Source verified | 출처 확인 정보 | 来源已确认的信息 | 來源已確認的資訊 |
|  | `placeDetail.touristSupport` | Tourist support | 관광객 지원 | 游客支持 | 旅客支援 |
|  | `placeDetail.trust` | Trust | 신뢰 정보 | 可信度信息 | 信任資訊 |
|  | `placeDetail.trustScore` | {{score}}/100 · {{confidence}} confidence | {{score}}/100 · 신뢰도 {{confidence}} | {{score}}/100 · 可信度 {{confidence}} | {{score}}/100 · 信任度 {{confidence}} |
|  | `placeDetail.unknownValue` | Unknown | 알 수 없음 | 未知 | 不明 |
|  | `placeDetail.waitMinutes_one` | {{count}} minute | {{count}}분 | {{count}} 分钟 | {{count}} 分鐘 |
|  | `placeDetail.waitMinutes_other` | {{count}} minutes | {{count}}분 | {{count}} 分钟 | {{count}} 分鐘 |
|  | `placeDetail.waitTime` | Estimated wait: {{value}} | 예상 대기: {{value}} | 预计等候：{{value}} | 預計等候：{{value}} |

## `placeOffers`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `placeOffers.title` | Tourist coupon | 관광객 쿠폰 | 游客优惠券 | 旅客優惠券 |
|  | `placeOffers.loading` | Checking available coupons... | 받을 수 있는 쿠폰을 확인하고 있습니다... | 正在确认可领取的优惠券… | 正在確認可領取的優惠券… |
|  | `placeOffers.empty.title` | No coupons available | 받을 수 있는 쿠폰이 없습니다 | 暂无可领取的优惠券 | 目前沒有可領取的優惠券 |
|  | `placeOffers.empty.description` | There is no issuable coupon for this place right now. | 지금 이 장소에서 발급 가능한 쿠폰이 없습니다. | 此地点目前没有可领取的优惠券。 | 此地點目前沒有可領取的優惠券。 |
|  | `placeOffers.auth.description` | Sign in to check and issue this coupon. | 쿠폰을 확인하고 발급받으려면 로그인하세요. | 登录后即可查看并领取此优惠券。 | 登入後即可查看並領取這張優惠券。 |
|  | `placeOffers.auth.action` | Sign in | 로그인 | 登录 | 登入 |
| ● | `placeOffers.detail.benefitLabel` | Benefit | 혜택 | 优惠内容 | 優惠內容 |
| ● | `placeOffers.detail.periodLabel` | Issuable period | 발급 기간 | 领取期间 | 領取期間 |
| ● | `placeOffers.detail.validityLabel` | Valid after issue | 발급 후 사용 기간 | 领取后使用期限 | 領取後使用期限 |
| ● | `placeOffers.detail.inventoryLabel` | Remaining | 남은 수량 | 剩余数量 | 剩餘數量 |
| ● | `placeOffers.detail.eligibilityLabel` | Eligibility | 발급 대상 | 领取对象 | 領取對象 |
|  | `placeOffers.detail.periodUnavailable` | Period unavailable | 기간 정보 없음 | 暂无期间信息 | 無期間資訊 |
|  | `placeOffers.detail.inventoryUnlimited` | No limit | 수량 제한 없음 | 数量不限 | 數量不限 |
|  | `placeOffers.detail.inventoryRemaining_one` | {{count}} left | {{count}}개 남음 | 剩余 {{count}} 张 | 剩餘 {{count}} 張 |
|  | `placeOffers.detail.inventoryRemaining_other` | {{count}} left | {{count}}개 남음 | 剩余 {{count}} 张 | 剩餘 {{count}} 張 |
|  | `placeOffers.detail.eligibilityActiveTravelSchedule` | Travelers with an active trip schedule | 여행 일정이 활성화된 여행자 | 有进行中旅行日程的旅行者 | 有進行中旅行行程的旅人 |
|  | `placeOffers.detail.eligibilityPublic` | Anyone | 누구나 | 所有人 | 所有人 |
|  | `placeOffers.detail.eligibilityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | 请查看优惠条件 | 請查看優惠條件 |
|  | `placeOffers.detail.validityDays_one` | Use within {{count}} day of issue | 발급 후 {{count}}일 이내 사용 | 领取后 {{count}} 天内使用 | 領取後 {{count}} 天內使用 |
|  | `placeOffers.detail.validityDays_other` | Use within {{count}} days of issue | 발급 후 {{count}}일 이내 사용 | 领取后 {{count}} 天内使用 | 領取後 {{count}} 天內使用 |
|  | `placeOffers.detail.validityOfferEnd` | Valid until the offer ends | 혜택 종료일까지 사용 가능 | 有效期至优惠结束 | 有效至優惠結束 |
|  | `placeOffers.detail.validityOfferEndOn` | Valid until {{date}} | {{date}}까지 사용 가능 | 有效期至 {{date}} | 有效至 {{date}} |
|  | `placeOffers.detail.validityCapped` | Capped by the offer end date | 혜택 종료일까지로 제한됨 | 最晚至优惠结束日 | 最晚至優惠結束日 |
|  | `placeOffers.detail.validityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | 请查看优惠条件 | 請查看優惠條件 |
|  | `placeOffers.cta.issue` | Get coupon | 쿠폰 받기 | 领取优惠券 | 領取優惠券 |
|  | `placeOffers.cta.issuing` | Issuing... | 발급 중... | 正在领取… | 正在領取… |
| ● | `placeOffers.cta.a11yIssue` | Get coupon for {{offer}} | {{offer}} 쿠폰 받기 | 领取 {{offer}} 优惠券 | 領取 {{offer}} 優惠券 |
| ● | `placeOffers.cta.a11yIssuing` | Issuing coupon | 쿠폰 발급 중 | 正在领取优惠券 | 正在領取優惠券 |
| ● | `placeOffers.error.eligibility` | This coupon is for eligible travelers only. | 이 쿠폰은 발급 대상 여행자만 받을 수 있습니다. | 此优惠券仅限符合条件的旅行者领取。 | 這張優惠券僅限符合條件的旅人領取。 |
| ● | `placeOffers.error.notFound` | This offer is no longer available. | 이 혜택은 더 이상 발급할 수 없습니다. | 此优惠已无法领取。 | 這項優惠已無法領取。 |
| ● | `placeOffers.error.conflictDuplicate` | You already issued this coupon. | 이미 발급받은 쿠폰입니다. | 你已领取过这张优惠券。 | 你已領取過這張優惠券。 |
| ● | `placeOffers.error.conflictWindowClosed` | The issuance window for this coupon has closed. | 이 쿠폰의 발급 기간이 종료되었습니다. | 此优惠券的领取期间已结束。 | 這張優惠券的領取期間已結束。 |
| ● | `placeOffers.error.conflictStockOut` | This coupon is out of stock. | 이 쿠폰이 모두 소진되었습니다. | 此优惠券已全部领完。 | 這張優惠券已全數領完。 |
| ● | `placeOffers.error.conflictUnknown` | This coupon could not be issued. Please try again later. | 쿠폰을 발급하지 못했습니다. 잠시 후 다시 시도해 주세요. | 无法领取此优惠券。请稍后重试。 | 無法領取這張優惠券。請稍後再試。 |
|  | `placeOffers.success.title` | Coupon issued | 쿠폰이 발급되었습니다 | 优惠券已领取 | 已領取優惠券 |
|  | `placeOffers.success.description` | Your coupon is ready. | 쿠폰이 준비되었습니다. | 你的优惠券已准备好。 | 你的優惠券已準備好。 |
|  | `placeOffers.success.code` | Code | 코드 | 代码 | 代碼 |
|  | `placeOffers.success.expiry` | Expires | 만료 | 到期 | 到期 |
| ● | `placeOffers.success.hint` | Find it later in My coupons. | 내 쿠폰에서 다시 확인할 수 있습니다. | 之后可以在“我的优惠券”中再次查看。 | 之後可以在「我的優惠券」中再次查看。 |
|  | `placeOffers.success.viewAction` | View my coupons | 내 쿠폰 보기 | 查看我的优惠券 | 查看我的優惠券 |
|  | `placeOffers.success.issueAnother` | Get another coupon | 다른 쿠폰 받기 | 领取其他优惠券 | 領取其他優惠券 |

## `placeStatus`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `placeStatus.closed` | Permanently closed | 폐업 | 已停业 | 已歇業 |
|  | `placeStatus.open` | Operating | 영업 중 | 营业中 | 營業中 |
|  | `placeStatus.temporarilyClosed` | Temporarily closed | 임시 휴무 | 暂停营业 | 暫停營業 |
|  | `placeStatus.unknown` | Status unknown | 상태 알 수 없음 | 状态未知 | 狀態不明 |

## `placeSupport`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `placeSupport.available` | Available | 가능 | 可用 | 可使用 |
|  | `placeSupport.unavailable` | Unavailable | 불가능 | 不可用 | 無法使用 |
|  | `placeSupport.unknown` | Unknown | 알 수 없음 | 未知 | 不明 |

## `placeTrust`

| 우선 | 키 | en | ko | zh-CN | zh-TW |
|---|---|---|---|---|---|
|  | `placeTrust.confidence.high` | High | 높음 | 高 | 高 |
|  | `placeTrust.confidence.low` | Low | 낮음 | 低 | 低 |
|  | `placeTrust.confidence.medium` | Medium | 보통 | 中 | 中 |
|  | `placeTrust.confidence.unknown` | Unknown | 알 수 없음 | 未知 | 不明 |
