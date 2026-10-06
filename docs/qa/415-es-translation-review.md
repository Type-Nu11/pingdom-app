# #415 스페인어 번역 검수 대상 키

> 상태: **기계 번역 초안 · 사람 검수 필요**. 이 문서의 모든 es 문구는 검수 전이다.
> 기준: 중립 국제 스페인어(특정 국가 표현 배제), 2인칭 tú·복수 ustedes(vosotros 미사용). 용어: 검증/verify → verificar, 쿠폰 → cupón, 혜택/Offer → oferta, 예약 → reserva, 체크인 → check-in, 설정 → ajustes, 추천 탭 → Sugerencias, 리뷰 → reseña, 만료 → vencer/expirar. 복수형 `_many`(1,000,000 등)는 `_other`와 같은 문구다. 브랜드 PingDom·Pingdi·Pingdy는 원문 표기.
> 우선 검수: 「우선」 열이 채워진 키(접근성 label, 오류·복구 안내, 권한·정책·삭제 문구).
> 생성 기준: `src/v2/app/i18n/resources.ts`의 조립 카탈로그, 키 1473개(우선 검수 350개).

| 영역 | 키 수 |
|---|---:|
| `mapTutorial` | 29 |
| `offerCoupon` | 50 |
| `reservation` | 133 |
| `community` | 101 |
| `visitVerification` | 78 |
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
| `map` | 284 |
| `notificationSettings` | 51 |
| `offer` | 24 |
| `payment` | 6 |
| `myPage` | 113 |
| `settings` | 160 |
| `merchantMyPage` | 34 |
| `placeDetail` | 32 |
| `placeOffers` | 43 |
| `placeStatus` | 4 |
| `placeSupport` | 3 |
| `placeTrust` | 4 |

## `mapTutorial`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `mapTutorial.name` | Pingdi | 핑디 | Pingdi |
|  | `mapTutorial.title` | Meet Pingdi | 핑디 사용 안내 | Conoce a Pingdi |
|  | `mapTutorial.guest` | traveler | 여행자 | viajero |
|  | `mapTutorial.close` | Close tutorial | 튜토리얼 닫기 | Cerrar tutorial |
|  | `mapTutorial.previous` | Previous tip | 이전 안내 | Consejo anterior |
|  | `mapTutorial.next` | Next tip | 다음 안내 | Siguiente consejo |
|  | `mapTutorial.finish` | Finish tutorial | 튜토리얼 완료 | Finalizar tutorial |
|  | `mapTutorial.progress` | Step {{current}} of {{total}} | {{current}} / {{total}} 단계 | Paso {{current}} de {{total}} |
|  | `mapTutorial.welcome.greeting` | Hello, {{username}}! | 안녕하세요, {{username}}님 | ¡Hola, {{username}}! |
|  | `mapTutorial.welcome.introduction` | Here to make your travels easier, | {{username}}님의 여행을 더 쉽게 만들어드리는 | Para que tus viajes sean más fáciles, |
|  | `mapTutorial.welcome.agent` | I’m <accent>Pingdi</accent>, your AI agent. | AI 에이전트, <accent>핑디</accent>예요. | soy <accent>Pingdi</accent>, tu agente de IA. |
|  | `mapTutorial.welcome.help` | From finding places to preparing reservations,<br>I can help with a conversation. | 원하는 장소를 찾고, 예약을 준비하는 과정까지<br>대화 한번으로 도와드릴게요. | Desde buscar lugares hasta reservar,<br>te ayudo con una sola conversación. |
|  | `mapTutorial.welcome.start` | Let me give you a quick tour! | 지금부터 간단히 사용법을 알려드릴게요! | ¡Te muestro rápidamente cómo funciona! |
|  | `mapTutorial.map.prompt` | Tap the <accent>Map button</accent>. | <accent>지도 버튼</accent>을 눌러보세요. | Toca el <accent>botón Mapa</accent>. |
|  | `mapTutorial.map.body` | Discover pins around you, plus popular places<br>in your area and across the country. | 내 주변의 핑들을 확인할 수 있어요.<br>또한 우리 지역과 전국 트렌드 장소도 볼 수 있어요. | Descubre pines cerca de ti y lugares<br>populares de tu zona y de todo el país. |
|  | `mapTutorial.favorites.prompt` | Tap the <accent>Favorites button</accent>. | <accent>즐겨찾기 버튼</accent>을 눌러보세요. | Toca el <accent>botón Favoritos</accent>. |
|  | `mapTutorial.favorites.body` | Save places you’re interested in<br>and find them again whenever you like. | 관심 있는 장소를 즐겨찾기에 저장하고,<br>언제든 다시 찾아볼 수 있어요. | Guarda los lugares que te interesan<br>y vuelve a encontrarlos cuando quieras. |
|  | `mapTutorial.community.prompt` | Tap the <accent>Community button</accent>. | <accent>커뮤니티 버튼</accent>을 눌러보세요. | Toca el <accent>botón Comunidad</accent>. |
|  | `mapTutorial.community.body` | Explore other travelers’ experiences,<br>and tag places to share your own stories. | 다른 여행자들의 생생한 장소 경험을 확인하고,<br>장소를 태그해 나만의 이야기도 공유할 수 있어요. | Explora experiencias de otros viajeros<br>y etiqueta lugares para contar las tuyas. |
|  | `mapTutorial.reservations.prompt` | Tap the <accent>Reservations button</accent>. | <accent>예약 버튼</accent>을 눌러보세요. | Toca el <accent>botón Reservas</accent>. |
|  | `mapTutorial.reservations.body` | Check availability at the places you love<br>and book a date and time that works for you. | 원하는 장소의 예약 가능 여부를 확인하고,<br>날짜와 시간에 맞춰 간편하게 예약할 수 있어요. | Consulta la disponibilidad de un lugar<br>y reserva la fecha y la hora que quieras. |
|  | `mapTutorial.recommendations.prompt` | Tap the <accent>Recommendations button</accent>. | <accent>장소 추천 버튼</accent>을 눌러보세요. | Toca el <accent>botón Sugerencias</accent>. |
|  | `mapTutorial.recommendations.body` | {{username}}, discover personalized places<br>based on your interests and activity. | {{username}}님의 관심사와 이용 상황을 바탕으로<br>개인화된 장소 추천을 받을 수 있어요. | {{username}}, descubre lugares personalizados<br>según tus intereses y tu actividad. |
|  | `mapTutorial.verification.prompt` | Tap the <accent>Verify button</accent>. | <accent>검증하기 버튼</accent>을 눌러보세요. | Toca el <accent>botón Verificar</accent>. |
|  | `mapTutorial.verification.body` | Review the places you’ve visited<br>and verify your experience to help<br>other travelers visit with confidence. | 직접 방문한 장소의 경험을 리뷰로 남기고,<br>다른 여행자들이 믿고 방문할 수 있도록<br>장소를 검증해주세요. | Reseña los lugares que visitaste<br>y verifica tu experiencia para que<br>otros viajeros los visiten con confianza. |
|  | `mapTutorial.categories.prompt` | Tap a <accent>category</accent>. | <accent>카테고리</accent>를 눌러보세요. | Toca una <accent>categoría</accent>. |
|  | `mapTutorial.categories.body` | Choose food, music, or another category<br>to see only the pins that match. | 음식점, 음악 등 원하는 카테고리를 선택하면<br>해당하는 핑들만 골라서 확인할 수 있어요. | Elige comida, música u otra categoría<br>para ver solo los pines que coincidan. |
|  | `mapTutorial.profile.prompt` | Tap <accent>My Page</accent>. | <accent>마이페이지</accent>를 눌러보세요. | Toca <accent>Mi página</accent>. |
|  | `mapTutorial.profile.body` | Manage your profile and travel dates,<br>and browse the places you’ve verified. | 내 프로필과 여행 기간을 관리하고,<br>내가 직접 검증한 장소들을 모아 볼 수 있어요. | Gestiona tu perfil y tus fechas de viaje<br>y consulta los lugares que verificaste. |

## `offerCoupon`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
| ● | `offerCoupon.error.actions.back` | Go back | 뒤로 가기 | Volver |
| ● | `offerCoupon.error.actions.retry` | Try again | 다시 시도 | Reintentar |
| ● | `offerCoupon.error.actions.signIn` | Sign in again | 다시 로그인 | Iniciar sesión de nuevo |
| ● | `offerCoupon.error.actions.viewWallet` | Check my coupons | 보관함 확인 | Ver mis cupones |
| ● | `offerCoupon.error.alreadyIssued.description` | You have already issued this coupon. Check it in your coupons. | 이미 발급받은 쿠폰입니다. 보관함에서 확인해 주세요. | Ya obtuviste este cupón. Consúltalo en tus cupones. |
| ● | `offerCoupon.error.alreadyIssued.title` | Already issued | 이미 발급받았습니다 | Ya obtenido |
| ● | `offerCoupon.error.alreadyRedeemed.description` | This coupon has already been used and cannot be used again. | 이미 사용한 쿠폰이라 다시 사용할 수 없습니다. | Este cupón ya se usó y no se puede volver a usar. |
| ● | `offerCoupon.error.alreadyRedeemed.title` | Already used | 이미 사용했습니다 | Ya usado |
| ● | `offerCoupon.error.authentication.description` | Your session has expired. Sign in again to continue. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | Tu sesión expiró. Inicia sesión de nuevo para continuar. |
| ● | `offerCoupon.error.authentication.title` | Sign-in required | 로그인이 필요합니다 | Inicio de sesión necesario |
| ● | `offerCoupon.error.expired.description` | This coupon’s usable period has ended. | 쿠폰의 사용 기간이 종료되었습니다. | El periodo de uso de este cupón terminó. |
| ● | `offerCoupon.error.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | Ya no está disponible |
| ● | `offerCoupon.error.forbidden.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | Esta cuenta no tiene permiso para realizar esta acción. |
| ● | `offerCoupon.error.forbidden.title` | Permission required | 권한이 필요합니다 | Permiso necesario |
| ● | `offerCoupon.error.generic.description` | Something went wrong on our side. Please try again in a moment. | 서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. | Algo salió mal de nuestro lado. Inténtalo de nuevo en un momento. |
| ● | `offerCoupon.error.generic.title` | Could not complete the request | 요청을 처리하지 못했습니다 | No se pudo completar la solicitud |
| ● | `offerCoupon.error.ineligible.description` | This offer is not available for your account right now. An active travel schedule may be required. | 지금은 이 Offer를 발급받을 수 없습니다. 진행 중인 여행 일정이 필요할 수 있습니다. | Esta oferta no está disponible para tu cuenta en este momento. Puede que necesites un itinerario de viaje activo. |
| ● | `offerCoupon.error.ineligible.title` | Not eligible | 발급 조건을 충족하지 않습니다 | No cumples los requisitos |
| ● | `offerCoupon.error.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo. |
| ● | `offerCoupon.error.network.title` | Connection problem | 연결에 문제가 있습니다 | Problema de conexión |
| ● | `offerCoupon.error.notFound.description` | This offer or coupon is no longer available. Return to the latest list. | 이 Offer 또는 쿠폰을 더 이상 이용할 수 없습니다. 최신 목록으로 돌아가 주세요. | Esta oferta o cupón ya no está disponible. Vuelve a la lista más reciente. |
| ● | `offerCoupon.error.notFound.title` | Not found | 항목을 찾을 수 없습니다 | No encontrado |
| ● | `offerCoupon.error.redeemInvalidInput.description` | Check the coupon and try scanning it again. | 쿠폰을 확인한 후 다시 스캔해 주세요. | Revisa el cupón e intenta escanearlo de nuevo. |
| ● | `offerCoupon.error.redeemInvalidInput.title` | Could not process | 처리하지 못했습니다 | No se pudo procesar |
| ● | `offerCoupon.error.redeemUsedOrExpired.description` | This coupon has already been used or has expired. | 이미 사용되었거나 만료된 쿠폰입니다. | Este cupón ya se usó o venció. |
| ● | `offerCoupon.error.redeemUsedOrExpired.title` | Cannot be used | 사용할 수 없습니다 | No se puede usar |
| ● | `offerCoupon.error.soldOut.description` | All coupons for this offer have been claimed. | 이 Offer의 쿠폰이 모두 소진되었습니다. | Ya se obtuvieron todos los cupones de esta oferta. |
| ● | `offerCoupon.error.soldOut.title` | Sold out | 수량이 소진되었습니다 | Agotado |
| ● | `offerCoupon.error.unconfirmedConflict.description` | This offer could not be issued. It may already be in your coupons, or issuing may have closed. | 발급하지 못했습니다. 이미 보관함에 있거나 발급이 마감되었을 수 있습니다. | No se pudo emitir esta oferta. Puede que ya esté en tus cupones o que la emisión haya cerrado. |
| ● | `offerCoupon.error.unconfirmedConflict.title` | Could not issue | 발급하지 못했습니다 | No se pudo emitir |
| ● | `offerCoupon.error.updateRequired.description` | Install the latest version to keep using coupons. | 쿠폰을 계속 사용하려면 최신 버전을 설치해 주세요. | Instala la versión más reciente para seguir usando cupones. |
| ● | `offerCoupon.error.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | Actualización necesaria |
| ● | `offerCoupon.error.validation.description` | Could not load the list. Please try again. | 목록을 불러오지 못했습니다. 다시 시도해 주세요. | No se pudo cargar la lista. Inténtalo de nuevo. |
| ● | `offerCoupon.error.validation.title` | Could not load coupons | 쿠폰을 불러오지 못했습니다 | No se pudieron cargar los cupones |
|  | `offerCoupon.place.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Requires an active travel schedule | 진행 중인 여행 일정이 필요합니다 | Requiere un itinerario de viaje activo |
|  | `offerCoupon.place.eligibility.PUBLIC` | Available to all eligible visitors | 발급 가능한 방문객 모두 이용할 수 있습니다 | Disponible para todos los visitantes que cumplan los requisitos |
|  | `offerCoupon.place.emptyDescription` | There are no coupons available for this place right now. | 현재 이 장소에서 발급받을 수 있는 쿠폰이 없습니다. | Por ahora no hay cupones disponibles para este lugar. |
|  | `offerCoupon.place.emptyTitle` | No available offers | 발급 가능한 Offer가 없습니다 | No hay ofertas disponibles |
|  | `offerCoupon.place.inventoryRemaining` | {{count}} remaining | {{count}}개 남음 | Quedan {{count}} |
|  | `offerCoupon.place.inventoryUnlimited` | No quantity limit | 수량 제한 없음 | Sin límite de cantidad |
|  | `offerCoupon.place.issue` | Get coupon | 쿠폰 받기 | Obtener cupón |
|  | `offerCoupon.place.loading` | Loading available coupons… | 발급 가능한 쿠폰을 불러오는 중… | Cargando cupones disponibles… |
|  | `offerCoupon.place.period` | Issue period: {{value}} | 발급 기간: {{value}} | Periodo de emisión: {{value}} |
|  | `offerCoupon.place.periodUnknown` | Schedule unavailable | 기간 정보 없음 | Periodo no disponible |
|  | `offerCoupon.place.successDescription` | The issued coupon is ready in your coupon wallet. | 발급된 쿠폰을 보관함에서 바로 확인할 수 있습니다. | El cupón emitido ya está en tu cartera de cupones. |
|  | `offerCoupon.place.successTitle` | Coupon issued | 쿠폰을 발급했습니다 | Cupón emitido |
|  | `offerCoupon.place.untitled` | Coupon offer | 쿠폰 Offer | Oferta de cupón |
|  | `offerCoupon.place.validityDays` | Valid for {{count}} day after issue | 발급 후 {{count}}일 동안 사용 가능 | Válido durante {{count}} día tras la emisión |
|  | `offerCoupon.place.validityDays_other` | Valid for {{count}} days after issue | 발급 후 {{count}}일 동안 사용 가능 | Válido durante {{count}} días tras la emisión |
|  | `offerCoupon.place.validityDays_many` | — | — | Válido durante {{count}} días tras la emisión |

## `reservation`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `reservation.common.back` | Go back | 뒤로 가기 | Volver |
|  | `reservation.common.favorites` | Favorites | 즐겨찾기 | Favoritos |
|  | `reservation.common.map` | Map | 지도 | Mapa |
|  | `reservation.common.recommendations` | Place recommendations | 장소추천 | Sugerencias |
|  | `reservation.common.reservations` | Reservations | 예약 | Reservas |
|  | `reservation.box.count` | {{count}} reservations | 보유 예약 {{count}}건 | {{count}} reservas |
|  | `reservation.box.empty` | No reservations yet. | 아직 예약 내역이 없어요. | Aún no tienes reservas. |
| ● | `reservation.box.error` | Could not load your reservations. | 예약함을 불러오지 못했어요. | No se pudieron cargar tus reservas. |
|  | `reservation.box.loading` | Loading reservations… | 예약함을 불러오는 중이에요… | Cargando reservas… |
|  | `reservation.box.productIcon` | R | R | R |
|  | `reservation.box.settings` | Open settings | 설정 열기 | Abrir ajustes |
|  | `reservation.box.title` | Reservations | 예약함 | Reservas |
|  | `reservation.create.availabilityEmpty` | No availability has been published for this place. | 이 장소에 등록된 예약 가능 일정이 없습니다. | Este lugar no ha publicado disponibilidad. |
| ● | `reservation.create.availabilityError` | Could not load availability. | 예약 가능 일정을 불러오지 못했습니다. | No se pudo cargar la disponibilidad. |
|  | `reservation.create.availabilityLoading` | Loading availability… | 예약 가능 일정을 불러오는 중이에요… | Cargando disponibilidad… |
|  | `reservation.create.afternoon` | PM | 오후 | Tarde |
|  | `reservation.create.available` | Available | 가능 | Disponible |
| ● | `reservation.create.availableDateLabel` | {{date}}, available | {{date}}, 예약 가능 | {{date}}, disponible |
| ● | `reservation.create.availableDateCapacityLabel` | {{date}}, {{count}} spots remaining | {{date}}, 잔여 {{count}}명 | {{date}}, quedan {{count}} lugares |
|  | `reservation.create.backToMap` | Go back | 돌아가기 | Volver |
| ● | `reservation.create.booker.errors.nameRequired` | Enter the booker name. | 예약자 이름을 입력해 주세요. | Escribe el nombre de quien reserva. |
| ● | `reservation.create.booker.errors.nameTooLong` | Use 100 characters or fewer. | 100자 이내로 입력해 주세요. | Usa 100 caracteres o menos. |
| ● | `reservation.create.booker.errors.noteTooLong` | Use 500 characters or fewer. | 500자 이내로 입력해 주세요. | Usa 500 caracteres o menos. |
| ● | `reservation.create.booker.errors.phoneInvalid` | Use digits and + ( ) - spaces only. | 숫자와 + ( ) - 공백만 입력할 수 있어요. | Usa solo dígitos, + ( ) - y espacios. |
| ● | `reservation.create.booker.errors.phoneRequired` | Enter a contact number. | 연락처를 입력해 주세요. | Escribe un número de contacto. |
| ● | `reservation.create.booker.errors.phoneTooLong` | Use 30 characters or fewer. | 30자 이내로 입력해 주세요. | Usa 30 caracteres o menos. |
|  | `reservation.create.booker.name` | Booker name | 예약자 이름 | Nombre de quien reserva |
|  | `reservation.create.booker.namePlaceholder` | Name for the reservation | 예약자 이름 | Nombre para la reserva |
|  | `reservation.create.booker.note` | Requests | 요청 사항 | Solicitudes |
|  | `reservation.create.booker.noteOptional` | Optional | 선택 | Opcional |
|  | `reservation.create.booker.notePlaceholder` | Anything the place should know | 장소에 전달할 요청 사항 | Lo que el lugar deba saber |
|  | `reservation.create.booker.phone` | Contact number | 연락처 | Número de contacto |
|  | `reservation.create.booker.phonePlaceholder` | Phone number | 전화번호 | Número de teléfono |
|  | `reservation.create.booker.title` | Booker details | 예약자 정보 | Datos de quien reserva |
|  | `reservation.create.date` | Select date | 날짜 선택 | Seleccionar fecha |
|  | `reservation.create.loadingPlace` | Loading place | 장소 불러오는 중 | Cargando lugar |
|  | `reservation.create.morning` | AM | 오전 | Mañana |
|  | `reservation.create.nextMonth` | Next month | 다음 달 | Mes siguiente |
|  | `reservation.create.noCapacityForQuantity` | No current times can accommodate {{count}} guests. Review the published schedule and unavailable reasons below. | 현재 {{count}}명이 예약 가능한 시간은 없습니다. 아래에서 등록된 일정과 예약 불가 사유를 확인해 주세요. | Por ahora ningún horario admite a {{count}} personas. Revisa abajo los horarios publicados y los motivos de no disponibilidad. |
|  | `reservation.create.noTimes` | No available times for this date. | 선택한 날짜에 예약 가능한 시간이 없습니다. | No hay horarios disponibles para esta fecha. |
|  | `reservation.create.noTimesInPeriod` | No times are available in this period. | 선택한 시간대에 등록된 일정이 없습니다. | No hay horarios disponibles en este periodo. |
|  | `reservation.create.people` | Guests | 인원 선택 | Personas |
|  | `reservation.create.peopleCount` | {{count}} | {{count}}명 | {{count}} |
|  | `reservation.create.peopleRange` | Booking for 1–12 guests · {{category}} | 예약인원: 1~12명 · {{category}} | Reserva para 1–12 personas · {{category}} |
|  | `reservation.create.previousMonth` | Previous month | 이전 달 | Mes anterior |
|  | `reservation.create.productInfoUnavailable` | This item can't be reserved right now because its product details are unavailable. | 상품 정보를 불러올 수 없어 현재 예약할 수 없습니다. | Este producto no se puede reservar ahora porque sus datos no están disponibles. |
|  | `reservation.create.retry` | Try again | 다시 시도 | Reintentar |
|  | `reservation.create.requestNote` | Request (optional) | 요청사항 (선택) | Solicitud (opcional) |
|  | `reservation.create.requestNotePlaceholder` | Add anything the venue should know | 장소에 전달할 내용을 입력하세요 | Agrega lo que el lugar deba saber |
|  | `reservation.create.scheduled` | Scheduled | 일정 있음 | Con horarios |
| ● | `reservation.create.scheduledDateLabel` | {{date}}, schedules published | {{date}}, 일정 있음 | {{date}}, horarios publicados |
|  | `reservation.create.selectAvailableDate` | Select an available date. | 예약 가능한 날짜를 선택해 주세요. | Selecciona una fecha disponible. |
|  | `reservation.create.selectedWindow` | Selected date & time | 선택한 일시 | Fecha y hora seleccionadas |
|  | `reservation.create.slotAvailable` | {{count}} spots remaining · Available | 잔여 {{count}}명 · 예약 가능 | Quedan {{count}} lugares · Disponible |
|  | `reservation.create.slotInactive` | Unavailable · Inactive | 예약 불가 · 비활성 일정 | No disponible · Inactivo |
|  | `reservation.create.slotInsufficient` | {{count}} spots remaining · Not enough capacity | 잔여 {{count}}명 · 인원 부족 | Quedan {{count}} lugares · Capacidad insuficiente |
|  | `reservation.create.slotPast` | Unavailable · Time has passed | 예약 불가 · 지난 시간 | No disponible · La hora ya pasó |
|  | `reservation.create.submit` | Reserve | 예약하기 | Reservar |
| ● | `reservation.create.submitAccountError` | Only an active tourist account can make a reservation. | 활성화된 일반 사용자 계정만 예약할 수 있습니다. | Solo una cuenta de turista activa puede hacer una reserva. |
| ● | `reservation.create.submitAvailabilityError` | This schedule is no longer available. Select another schedule. | 더 이상 예약할 수 없는 일정입니다. 다른 일정을 선택해 주세요. | Este horario ya no está disponible. Selecciona otro. |
| ● | `reservation.create.submitCapacityError` | There are not enough spots remaining. Check the updated availability. | 잔여 인원이 부족합니다. 갱신된 일정을 확인해 주세요. | No quedan suficientes lugares. Revisa la disponibilidad actualizada. |
|  | `reservation.create.submitConflict` | That time was just filled or closed. Pick another slot. | 해당 시간이 방금 마감되었어요. 다른 시간을 선택해 주세요. | Ese horario acaba de llenarse o cerrarse. Elige otro. |
| ● | `reservation.create.submitError` | Could not submit the reservation. Please try again. | 예약을 접수하지 못했습니다. 다시 시도해 주세요. | No se pudo enviar la reserva. Inténtalo de nuevo. |
| ● | `reservation.create.submitNetworkError` | We could not confirm your reservation. Check your reservations before submitting again. | 예약 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 예약함을 확인해 주세요. | No pudimos confirmar tu reserva. Revisa tus reservas antes de enviarla de nuevo. |
| ● | `reservation.create.submitValidationError` | Check the highlighted fields and try again. | 표시된 항목을 확인하고 다시 시도해 주세요. | Revisa los campos marcados e inténtalo de nuevo. |
|  | `reservation.create.successDescription` | You can check the confirmation status in Reservations. | 예약함에서 확정 상태를 확인할 수 있습니다. | Puedes consultar el estado de confirmación en Reservas. |
|  | `reservation.create.successTitle` | Reservation requested | 예약 요청이 접수되었습니다 | Reserva solicitada |
|  | `reservation.create.time` | Select schedule | 시간 선택 | Seleccionar horario |
|  | `reservation.create.title` | Reserve | 예약하기 | Reservar |
| ● | `reservation.create.unavailableDateLabel` | {{date}}, unavailable | {{date}}, 예약 불가 | {{date}}, no disponible |
|  | `reservation.create.unknownReservationType` | This reservation type isn't supported yet, so it can't be reserved. | 지원하지 않는 예약 유형이라 현재 예약할 수 없습니다. | Este tipo de reserva aún no es compatible, así que no se puede reservar. |
|  | `reservation.create.weekdays.fri` | F | 금 | V |
|  | `reservation.create.weekdays.mon` | M | 월 | L |
|  | `reservation.create.weekdays.sat` | S | 토 | S |
|  | `reservation.create.weekdays.sun` | S | 일 | D |
|  | `reservation.create.weekdays.thu` | T | 목 | J |
|  | `reservation.create.weekdays.tue` | T | 화 | M |
|  | `reservation.create.weekdays.wed` | W | 수 | M |
|  | `reservation.create.windowPending` | The date and time will be shared once confirmed. | 예약 일시는 확정 후 안내됩니다. | La fecha y la hora se informarán cuando se confirme. |
|  | `reservation.detail.bookerHidden` | Hidden | 비공개 | Oculto |
|  | `reservation.detail.bookerName` | Booker | 예약자 | Titular |
|  | `reservation.detail.bookerPhone` | Contact | 연락처 | Contacto |
|  | `reservation.detail.identifier` | Reservation ID | 예약 식별자 | ID de reserva |
|  | `reservation.detail.loading` | Loading reservation details | 예약 상세를 불러오는 중이에요 | Cargando detalles de la reserva |
|  | `reservation.detail.noRequestNote` | No requests | 요청 사항 없음 | Sin solicitudes |
|  | `reservation.detail.paymentAmount` | Minor amount and currency: {{value}} | 최소 화폐 단위 금액·통화: {{value}} | Importe en unidad mínima y moneda: {{value}} |
|  | `reservation.detail.paymentFailure` | Failure code: {{value}} | 실패 코드: {{value}} | Código de error: {{value}} |
|  | `reservation.detail.paymentIdentifier` | Payment #{{id}} | 결제 번호 {{id}} | Pago n.º {{id}} |
|  | `reservation.detail.paymentProvider` | Provider: {{value}} | 결제 제공자: {{value}} | Proveedor: {{value}} |
|  | `reservation.detail.payments` | Payments | 결제 내역 | Pagos |
|  | `reservation.detail.paymentsEmptyDescription` | This is a normal state until a payment is created. | 결제가 생성되기 전에는 정상적으로 비어 있을 수 있어요. | Es normal que esté vacío hasta que se cree un pago. |
|  | `reservation.detail.paymentsEmptyTitle` | No payment history | 결제 내역이 없어요 | Sin historial de pagos |
|  | `reservation.detail.paymentsLoading` | Loading payments | 결제 내역을 불러오는 중이에요 | Cargando pagos |
|  | `reservation.detail.productType` | Product type | 상품 유형 | Tipo de producto |
|  | `reservation.detail.quantity` | Quantity | 예약 수량 | Cantidad |
|  | `reservation.detail.requestNote` | Requests | 요청 사항 | Solicitudes |
|  | `reservation.detail.reservationWindow` | Reserved date & time | 예약 일시 | Fecha y hora de la reserva |
|  | `reservation.detail.status` | Status | 예약 상태 | Estado |
|  | `reservation.detail.title` | Reservation details | 예약 상세 | Detalles de la reserva |
|  | `reservation.detail.windowPending` | Shared once confirmed | 확정 후 안내 | Se informará al confirmarse |
|  | `reservation.list.available` | Bookable | 예약 가능 | Reservable |
|  | `reservation.list.distanceFar` | {{kilometers}} km away | 여기서 {{kilometers}}km | A {{kilometers}} km |
|  | `reservation.list.distanceNear` | {{meters}} m away | 여기서 {{kilometers}}km | A {{meters}} m |
|  | `reservation.list.card.createdAt` | Requested at | 접수 일시 | Solicitada el |
|  | `reservation.list.card.detail` | View reservation details  › | 예약 상세 보기  › | Ver detalles de la reserva  › |
|  | `reservation.list.card.eyebrow` | My reservation | 내 예약 | Mi reserva |
| ● | `reservation.list.card.hint` | Opens reservation details | 예약 상세 화면으로 이동합니다 | Abre los detalles de la reserva |
|  | `reservation.list.card.label` | Reservation {{id}}, {{status}} | 예약 {{id}}, {{status}} | Reserva {{id}}, {{status}} |
|  | `reservation.list.card.number` | Reservation #{{id}} | 예약 번호 {{id}} | Reserva n.º {{id}} |
|  | `reservation.list.card.productType` | Product type | 상품 유형 | Tipo de producto |
|  | `reservation.list.card.quantity` | Quantity | 예약 수량 | Cantidad |
|  | `reservation.list.card.quantityValue` | {{count}} guest(s) | {{count}}명 예약 | {{count}} persona(s) |
|  | `reservation.list.card.reservationWindow` | Reserved for | 예약 일시 | Reservada para |
|  | `reservation.list.card.reservationWindowValue` | Reserved {{value}} | {{value}} 예약 | Reservada para {{value}} |
|  | `reservation.list.card.requestedAtValue` | Requested {{value}} | {{value}} 접수 | Solicitada el {{value}} |
|  | `reservation.list.card.windowPending` | Shared once confirmed | 확정 후 안내 | Se informará al confirmarse |
|  | `reservation.list.emptyDescription` | Find a place you like on the map. | 지도에서 마음에 드는 장소를 찾아보세요. | Busca en el mapa un lugar que te guste. |
|  | `reservation.list.emptyTitle` | No reservations yet | 아직 예약 내역이 없어요 | Aún no tienes reservas |
| ● | `reservation.list.error` | Could not load reservations | 예약을 불러오지 못했어요 | No se pudieron cargar las reservas |
|  | `reservation.list.loading` | Loading reservations | 예약을 불러오는 중이에요 | Cargando reservas |
|  | `reservation.list.nearbySubtitle` | Discover places currently accepting reservations! | 현재 예약 가능 장소를 찾아드려요! | ¡Descubre lugares que aceptan reservas ahora! |
|  | `reservation.list.nearbyEmpty` | No nearby bookable places are available right now. | 현재 위치 주변에 예약 가능한 장소가 없어요. | Por ahora no hay lugares reservables cerca. |
|  | `reservation.list.nearbyLoading` | Finding nearby bookable places… | 주변 예약 가능 장소를 찾는 중이에요… | Buscando lugares reservables cerca… |
|  | `reservation.list.nearbyTitle` | Reservations near your current location | 현재 위치 주변 예약 | Reservas cerca de tu ubicación |
|  | `reservation.list.panelAdjust` | Resize reservation panel | 예약 패널 크기 조절 | Cambiar el tamaño del panel de reservas |
| ● | `reservation.list.previewLabel` | {{name}} reservation preview | {{name}} 예약 미리보기 | Vista previa de la reserva en {{name}} |
|  | `reservation.list.retry` | Try again | 다시 시도 | Reintentar |
|  | `reservation.list.savedTitle` | Saved reservations | 예약함 | Reservas guardadas |
|  | `reservation.list.statuses.canceled` | Canceled | 취소됨 | Cancelada |
|  | `reservation.list.statuses.confirmed` | Confirmed | 예약 확정 | Confirmada |
|  | `reservation.list.statuses.pending` | Pending confirmation | 확정 대기 | Pendiente de confirmación |
|  | `reservation.list.statuses.rejected` | Rejected | 거절됨 | Rechazada |
|  | `reservation.list.statuses.unknown` | Status needs review | 상태 확인 필요 | Estado por confirmar |

## `community`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `community.title` | Community | 커뮤니티 | Comunidad |
|  | `community.categories.all` | All | 전체 | Todo |
|  | `community.categories.spot` | Spots | 스팟 | Lugares |
|  | `community.categories.diary` | Diary | 다이어리 | Diario |
|  | `community.categories.ledger` | Expenses | 가계부 | Gastos |
|  | `community.sheetAdjust` | Adjust community panel | 커뮤니티 패널 조절 | Ajustar el panel de comunidad |
|  | `community.write` | Write | 작성하기 | Escribir |
|  | `community.moreOptions` | More options | 더보기 | Más opciones |
|  | `community.notInterested` | Not interested | 관심없음 | No me interesa |
|  | `community.report` | Report | 신고하기 | Denunciar |
|  | `community.empty` | No posts yet | 아직 게시글이 없어요 | Aún no hay publicaciones |
|  | `community.author` | woo_sm | woo_sm | woo_sm |
|  | `community.like` | Like | 좋아요 | Me gusta |
|  | `community.comment` | Comment | 댓글 | Comentar |
|  | `community.list.loading` | Loading posts… | 게시글을 불러오는 중… | Cargando publicaciones… |
| ● | `community.list.nextPageError` | Couldn't load more posts. | 게시글을 더 불러오지 못했어요. | No se pudieron cargar más publicaciones. |
|  | `community.list.nextPageRetry` | Retry | 다시 시도 | Reintentar |
|  | `community.detail.back` | Back | 뒤로 | Atrás |
|  | `community.detail.settings` | Post options | 게시글 옵션 | Opciones de la publicación |
|  | `community.detail.placeTagPrefix` | View place | 장소 보기 | Ver lugar |
| ● | `community.detail.placeDeleted` | This place was removed | 삭제된 장소예요 | Este lugar fue eliminado |
| ● | `community.detail.placeCard.a11yLabel` | Connected place, {{name}} | 연결 장소, {{name}} | Lugar vinculado, {{name}} |
| ● | `community.detail.placeCard.a11yHint` | Opens the place detail | 장소 상세로 이동 | Abre los detalles del lugar |
|  | `community.detail.placeCard.announceFailure` | Couldn't open this place. | 장소를 열지 못했어요. | No se pudo abrir este lugar. |
| ● | `community.detail.placeCard.errors.unavailable` | This place can't be opened right now. | 장소를 불러올 수 없어요 | Este lugar no se puede abrir ahora. |
| ● | `community.detail.comments.headerLabel` | Comments | 댓글 | Comentarios |
|  | `community.detail.comments.authorBadge` | Author | 작성자 | Autor |
|  | `community.detail.comments.count` | Comments {{count}} | 댓글 {{count}} | Comentarios {{count}} |
| ● | `community.detail.comments.jumpA11yLabel` | Go to {{count}} comments | 댓글 {{count}}개로 이동 | Ir a {{count}} comentarios |
|  | `community.detail.comments.loading` | Loading comments… | 댓글을 불러오는 중… | Cargando comentarios… |
|  | `community.detail.comments.empty` | No comments yet. Be the first to leave one! | 아직 댓글이 없어요. 첫 댓글을 남겨보세요! | Aún no hay comentarios. ¡Deja el primero! |
| ● | `community.detail.comments.errorRetry` | Retry | 다시 시도 | Reintentar |
| ● | `community.detail.comments.nextPageError` | Couldn't load more comments. | 댓글을 더 불러오지 못했어요. | No se pudieron cargar más comentarios. |
|  | `community.detail.comments.nextPageRetry` | Retry | 다시 시도 | Reintentar |
|  | `community.detail.comments.loadMore` | Show {{count}} more comments | 댓글 {{count}}개 더 보기 | Mostrar {{count}} comentarios más |
| ● | `community.detail.comments.a11yLabel` | {{author}}, {{time}}, {{content}} | {{author}}, {{time}}, {{content}} | {{author}}, {{time}}, {{content}} |
|  | `community.detail.comments.announceSuccess` | Your comment was posted. | 댓글이 등록되었어요. | Tu comentario se publicó. |
|  | `community.detail.comments.announceFailure` | Your comment failed to post. | 댓글 등록에 실패했어요. | No se pudo publicar tu comentario. |
|  | `community.detail.like.count_one` | Like {{count}} | 좋아요 {{count}} | Me gusta {{count}} |
|  | `community.detail.like.count_other` | Like {{count}} | 좋아요 {{count}} | Me gusta {{count}} |
| ● | `community.detail.like.a11yLabel_one` | Like, {{count}} | 좋아요, {{count}}개 | Me gusta, {{count}} |
| ● | `community.detail.like.a11yLabel_other` | Like, {{count}} | 좋아요, {{count}}개 | Me gusta, {{count}} |
| ● | `community.detail.like.hintLike` | Double tap to like | 두 번 탭하여 좋아요 | Toca dos veces para indicar que te gusta |
| ● | `community.detail.like.hintUnlike` | Double tap to unlike | 두 번 탭하여 좋아요 취소 | Toca dos veces para quitar tu me gusta |
| ● | `community.detail.like.retryLabel` | Retry | 다시 시도 | Reintentar |
|  | `community.detail.like.announceLiked` | Liked. | 좋아요를 눌렀어요. | Te gusta. |
|  | `community.detail.like.announceUnliked` | Like removed. | 좋아요를 취소했어요. | Me gusta eliminado. |
|  | `community.detail.like.announceFailure` | Something went wrong. Please try again. | 문제가 발생했어요. 다시 시도해 주세요. | Algo salió mal. Inténtalo de nuevo. |
|  | `community.detail.commentInput.label` | Write a comment | 댓글 입력 | Escribe un comentario |
|  | `community.detail.commentInput.placeholder` | Leave a comment | 댓글을 남겨주세요 | Deja un comentario |
|  | `community.detail.commentInput.send` | Post comment | 댓글 등록 | Publicar comentario |
|  | `community.detail.commentInput.sendBusy` | Posting comment… | 댓글 등록 중… | Publicando comentario… |
|  | `community.detail.commentInput.counter` | {{count}}/{{max}} | {{count}}/{{max}} | {{count}}/{{max}} |
| ● | `community.detail.commentInput.validation.required` | Enter a comment. | 댓글 내용을 입력해 주세요. | Escribe un comentario. |
| ● | `community.detail.commentInput.validation.tooLong` | Comments must be 1,000 characters or fewer. | 댓글은 1,000자 이하로 입력해 주세요. | Los comentarios deben tener 1000 caracteres o menos. |
| ● | `community.detail.commentInput.errors.networkDuplicateWarning` | If the comment already went through, check the list before retrying. | 이미 댓글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | Si el comentario ya se publicó, revisa la lista antes de reintentar. |
| ● | `community.detail.commentInput.errors.retry` | Retry | 다시 시도 | Reintentar |
| ● | `community.detail.commentInput.errors.signIn` | Sign in again | 다시 로그인 | Iniciar sesión de nuevo |
| ● | `community.detail.commentInput.errors.postNotFound` | This post couldn't be found. It may have been removed. | 게시글을 찾을 수 없어요. 삭제되었을 수 있어요. | No se encontró esta publicación. Puede que se haya eliminado. |
|  | `community.write_screen.title` | Write a post | 글 작성하기 | Escribir una publicación |
|  | `community.write_screen.back` | Cancel | 취소 | Cancelar |
| ● | `community.write_screen.categoryLabel` | Category | 카테고리 | Categoría |
| ● | `community.write_screen.categoryHint` | Choose the category that fits your post | 글에 맞는 카테고리를 선택해주세요 | Elige la categoría adecuada para tu publicación |
| ● | `community.write_screen.titleLabel` | Post | 글 작성 | Publicación |
|  | `community.write_screen.titlePlaceholder` | Enter a title | 제목을 입력해주세요. | Escribe un título |
| ● | `community.write_screen.bodyLabel` | Content | 내용 | Contenido |
|  | `community.write_screen.bodyPlaceholder` | Share your story with the community | 본문을 입력해주세요. | Comparte tu historia con la comunidad |
| ● | `community.write_screen.guideText` | Posts with abuse, defamation, or ads may be removed under our policy | 욕설·비방·광고성 글은 운영 정책에 따라 삭제될 수 있어요 | Las publicaciones con insultos, difamación o publicidad pueden eliminarse según nuestra política |
|  | `community.write_screen.photoSection` | Photos | 사진 첨부 | Fotos |
|  | `community.write_screen.photoCount` | Up to {{count}} photos | 최대 {{count}}장까지 첨부할 수 있어요 | Hasta {{count}} fotos |
|  | `community.write_screen.addPhotos` | Add photos | 사진 추가 | Agregar fotos |
|  | `community.write_screen.placeTagTitle` | Place tag | 장소 태그 | Etiqueta de lugar |
| ● | `community.write_screen.placeTagHint` | Tell us which place this post is about | 어떤 장소에 대한 글인지 알려주세요 | Cuéntanos de qué lugar trata esta publicación |
|  | `community.write_screen.addPlace` | Add place | 장소 추가 | Agregar lugar |
|  | `community.write_screen.removePlace` | Remove {{name}} | {{name}} 삭제 | Quitar {{name}} |
|  | `community.write_screen.submit` | Post | 등록하기 | Publicar |
|  | `community.write_screen.submitBusy` | Posting… | 등록 중… | Publicando… |
| ● | `community.write_screen.validation.titleRequired` | Enter a title. | 제목을 입력해 주세요. | Escribe un título. |
| ● | `community.write_screen.validation.titleTooLong` | Title must be 50 characters or fewer. | 제목은 50자 이하로 입력해 주세요. | El título debe tener 50 caracteres o menos. |
| ● | `community.write_screen.validation.bodyRequired` | Enter content. | 내용을 입력해 주세요. | Escribe el contenido. |
| ● | `community.write_screen.validation.contentTooLong` | Content must be 5,000 characters or fewer. | 내용은 5,000자 이하로 입력해 주세요. | El contenido debe tener 5000 caracteres o menos. |
| ● | `community.write_screen.validation.tagRequired` | Choose at least one category. | 카테고리를 하나 이상 선택해 주세요. | Elige al menos una categoría. |
| ● | `community.write_screen.validation.categoryRequired` | Choose a category. | 카테고리를 선택해 주세요. | Elige una categoría. |
| ● | `community.write_screen.validation.placeRequired` | Add at least one place for the Place category. | 장소 카테고리는 장소를 1개 이상 선택해야 해요. | Agrega al menos un lugar para la categoría Lugares. |
|  | `community.write_screen.placePicker.close` | Close | 닫기 | Cerrar |
|  | `community.write_screen.placePicker.placeholder` | Search for a place | 장소를 검색해 주세요 | Busca un lugar |
|  | `community.write_screen.placePicker.prompt` | Search for a registered place to tag | 태그할 등록된 장소를 검색해 주세요 | Busca un lugar registrado para etiquetarlo |
|  | `community.write_screen.placePicker.empty` | No matching places found | 검색 결과가 없어요 | No se encontraron lugares |
| ● | `community.write_screen.placePicker.error` | Couldn't load places. | 장소를 불러오지 못했어요. | No se pudieron cargar los lugares. |
|  | `community.write_screen.placePicker.retry` | Retry | 다시 시도 | Reintentar |
|  | `community.write_screen.placePicker.disabled` | Place search is unavailable right now | 지금은 장소 검색을 사용할 수 없어요 | La búsqueda de lugares no está disponible ahora |
| ● | `community.write_screen.errors.placeNotFound` | One of the connected places couldn't be found. Remove it and choose another. | 연결한 장소 중 하나를 찾을 수 없어요. 삭제하고 다시 선택해 주세요. | No se encontró uno de los lugares vinculados. Quítalo y elige otro. |
| ● | `community.write_screen.errors.networkDuplicateWarning` | If the post already went through, check the list before retrying. | 이미 게시글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | Si la publicación ya se envió, revisa la lista antes de reintentar. |
| ● | `community.write_screen.errors.retry` | Retry | 다시 시도 | Reintentar |
| ● | `community.write_screen.errors.signIn` | Sign in again | 다시 로그인 | Iniciar sesión de nuevo |
| ● | `community.write_screen.discard.title` | Discard this post? | 작성 중인 내용을 삭제할까요? | ¿Descartar esta publicación? |
| ● | `community.write_screen.discard.body` | What you've written won't be saved. | 지금까지 작성한 내용이 저장되지 않아요. | Lo que escribiste no se guardará. |
| ● | `community.write_screen.discard.cancel` | Keep editing | 계속 작성 | Seguir editando |
| ● | `community.write_screen.discard.confirm` | Discard | 삭제 | Descartar |
|  | `community.detail.like.count_many` | — | — | Me gusta {{count}} |
| ● | `community.detail.like.a11yLabel_many` | — | — | Me gusta, {{count}} |

## `visitVerification`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `visitVerification.addPhotos` | Add photos | 사진 선택 | Agregar fotos |
|  | `visitVerification.back` | Back | 뒤로 | Atrás |
|  | `visitVerification.distanceKm` | {{value}}km | {{value}}km | {{value}}km |
|  | `visitVerification.distanceMeters` | {{value}}m | {{value}}m | {{value}}m |
|  | `visitVerification.emptyDescription` | We could not find a place you can verify from your current location. Check your location and try again. | 현재 위치에서 검증할 수 있는 장소를 찾지 못했어요<br>현재 위치를 다시 확인해주세요 | No encontramos un lugar que puedas verificar desde tu ubicación actual. Revisa tu ubicación e inténtalo de nuevo. |
|  | `visitVerification.emptyTitle` | No places nearby to verify! | 근처에 검증할 장소가 없어요! | ¡No hay lugares cerca para verificar! |
| ● | `visitVerification.errorTitle` | Could not load recent visits | 최근 방문을 불러오지 못했어요 | No se pudieron cargar las visitas recientes |
| ● | `visitVerification.permissionDenied` | Allow photo library access in Settings to attach photos. | 사진을 첨부하려면 설정에서 사진 접근 권한을 허용해 주세요. | Permite el acceso a la fototeca en Ajustes para adjuntar fotos. |
| ● | `visitVerification.permissionTitle` | Location access is off | 위치 권한이 꺼져 있어요 | El acceso a la ubicación está desactivado |
| ● | `visitVerification.locationPermissionDenied` | Allow location access to find places eligible for verification near you. | 주변에서 검증 가능한 장소를 찾으려면 위치 접근 권한을 허용해 주세요. | Permite el acceso a la ubicación para encontrar lugares verificables cerca de ti. |
|  | `visitVerification.photoCount` | {{count}}/3 | {{count}}/3 | {{count}}/3 |
| ● | `visitVerification.photoDelete` | Remove photo {{index}} | {{index}}번째 사진 삭제 | Quitar la foto {{index}} |
|  | `visitVerification.photoSection` | Attach photos | 사진 첨부 | Adjuntar fotos |
| ● | `visitVerification.placeError` | Could not load this place. | 장소 정보를 불러오지 못했어요. | No se pudo cargar este lugar. |
|  | `visitVerification.placeLoading` | Loading place information... | 장소 정보를 불러오는 중이에요... | Cargando información del lugar... |
|  | `visitVerification.placePhoto` | {{name}} photo {{index}} | {{name}} 사진 {{index}} | Foto {{index}} de {{name}} |
|  | `visitVerification.reasonHelp` | You can select up to 5 | 최대 5개까지 선택할 수 있어요 | Puedes seleccionar hasta 5 |
|  | `visitVerification.reasonMoreCount` | {{count}} more reasons | 추천 이유 {{count}}개 더 있음 | {{count}} motivos más |
|  | `visitVerification.reasonSelectedSuffix` | /{{max}} selected | /{{max}}개 선택됨 | /{{max}} seleccionados |
|  | `visitVerification.reasonSection` | Recommendation reasons | 추천 이유 | Motivos de recomendación |
|  | `visitVerification.reasons.clean` | Clean store | 매장이 깨끗해요 | Local limpio |
|  | `visitVerification.reasons.delicious` | Delicious | 맛있어요 | Delicioso |
|  | `visitVerification.reasons.easyToFind` | Easy to find | 찾기 쉬워요 | Fácil de encontrar |
|  | `visitVerification.reasons.kind` | Friendly | 친절해요 | Amable |
|  | `visitVerification.reasons.multilingual` | Good multilingual descriptions | 다국어 설명이 잘 되어 있어요 | Buenas descripciones en varios idiomas |
|  | `visitVerification.reasons.parking` | Easy parking | 주차하기 편해요 | Fácil de estacionar |
|  | `visitVerification.reasons.photoSpot` | Great for photos | 사진 찍기 좋아요 | Ideal para fotos |
|  | `visitVerification.recentVisits` | Recent visits | 최근 방문 | Visitas recientes |
|  | `visitVerification.retry` | Try again | 다시 시도 | Reintentar |
|  | `visitVerification.return` | Go back | 돌아가기 | Volver |
|  | `visitVerification.reviewPlaceholder` | Share your review with others, {{username}} | 다른 사람들에게 {{username}}님의 후기를 알려주세요 | {{username}}, comparte tu reseña con los demás |
|  | `visitVerification.reviewSection` | Write a review | 후기 작성 | Escribir una reseña |
|  | `visitVerification.submit` | Verify | 검증하기 | Verificar |
|  | `visitVerification.uploading` | Uploading photos... | 사진 업로드 중 | Subiendo fotos... |
| ● | `visitVerification.errors.unsupportedFormat` | Choose a JPEG or PNG photo. HEIC is not supported. | JPEG 또는 PNG 사진을 선택해 주세요. HEIC 형식은 지원하지 않아요. | Elige una foto JPEG o PNG. HEIC no es compatible. |
| ● | `visitVerification.errors.fileTooLarge` | This photo is too large. Choose a smaller photo. | 사진 용량이 너무 커요. 더 작은 사진을 선택해 주세요. | Esta foto es demasiado grande. Elige una más pequeña. |
| ● | `visitVerification.errors.unauthenticated` | Sign in again to submit your review. | 후기를 제출하려면 다시 로그인해 주세요. | Inicia sesión de nuevo para enviar tu reseña. |
| ● | `visitVerification.errors.forbidden` | You do not have permission to submit this review or photo. | 이 후기 또는 사진을 제출할 권한이 없어요. | No tienes permiso para enviar esta reseña o foto. |
| ● | `visitVerification.errors.serverUnavailable` | The service is temporarily unavailable. Try again later. | 서비스를 일시적으로 이용할 수 없어요. 잠시 후 다시 시도해 주세요. | El servicio no está disponible temporalmente. Inténtalo más tarde. |
| ● | `visitVerification.errors.network` | Check your connection and try again. Your draft is preserved. | 네트워크를 확인한 뒤 다시 시도해 주세요. 작성 내용은 유지돼요. | Revisa tu conexión e inténtalo de nuevo. Tu borrador se conserva. |
| ● | `visitVerification.errors.submitFailed` | Could not submit your review. Your draft is preserved. Try again. | 후기를 제출하지 못했어요. 작성 내용은 유지돼요. 다시 시도해 주세요. | No se pudo enviar tu reseña. Tu borrador se conserva. Inténtalo de nuevo. |
|  | `visitVerification.submitting` | Submitting... | 제출 중 | Enviando... |
|  | `visitVerification.title` | Verify | 검증하기 | Verificar |
|  | `visitVerification.session.ambiguousPlace` | More than one place can be verified here. Move closer to one place and try again. | 현재 위치에서 여러 장소가 확인돼요. 한 장소에 더 가까이 이동한 뒤 다시 시도해 주세요. | Aquí se puede verificar más de un lugar. Acércate a uno de ellos e inténtalo de nuevo. |
|  | `visitVerification.session.completionMissing` | Verification did not include the completed check-in. This visit cannot be treated as complete. | 완료된 체크인 정보가 없어 방문 완료로 처리할 수 없어요. | La verificación no incluyó el check-in completado. Esta visita no puede considerarse completa. |
|  | `visitVerification.session.distance` | Latest distance: {{value}}m | 최근 거리: {{value}}m | Última distancia: {{value}}m |
|  | `visitVerification.session.dwell` | Required stay: {{value}} seconds | 요구 체류 시간: {{value}}초 | Permanencia requerida: {{value}} segundos |
| ● | `visitVerification.session.foregroundBlocked` | Verification is paused. Return to the app to resume from the server status. | 인증이 일시 중지됐어요. 앱으로 돌아오면 서버 상태부터 복구해요. | La verificación está en pausa. Vuelve a la app para reanudarla desde el estado del servidor. |
|  | `visitVerification.session.inactiveTourist` | Visit verification is available only to an active tourist account. | 활성 관광객 계정만 방문 인증을 이용할 수 있어요. | La verificación de visitas solo está disponible para cuentas de turista activas. |
|  | `visitVerification.session.invalidObservation` | The location observation was rejected. Check your GPS signal and device time, then try again. | 위치 관측이 거절됐어요. GPS 신호와 기기 시간을 확인한 뒤 다시 시도해 주세요. | Se rechazó la lectura de ubicación. Revisa la señal GPS y la hora del dispositivo e inténtalo de nuevo. |
|  | `visitVerification.session.locating` | Checking your location... | 위치를 확인하는 중이에요... | Comprobando tu ubicación... |
| ● | `visitVerification.session.locationFailed` | Could not read your current location. Check permission and GPS, then try again. | 현재 위치를 확인하지 못했어요. 위치 권한과 GPS를 확인한 뒤 다시 시도해 주세요. | No se pudo leer tu ubicación actual. Revisa el permiso y el GPS e inténtalo de nuevo. |
| ● | `visitVerification.session.networkError` | A network error interrupted verification. This visit has not been completed. | 네트워크 오류로 인증이 중단됐어요. 방문 완료로 처리되지 않았어요. | Un error de red interrumpió la verificación. Esta visita no se completó. |
|  | `visitVerification.session.noPlace` | There is no open verification place at your current location. | 현재 위치에는 운영 중인 인증 대상 장소가 없어요. | No hay ningún lugar de verificación abierto en tu ubicación actual. |
| ● | `visitVerification.session.permissionDenied` | Location permission is required to verify this visit. | 방문 인증에는 위치 권한이 필요해요. | Se necesita el permiso de ubicación para verificar esta visita. |
|  | `visitVerification.session.progress` | Verification in progress | 인증 진행 중 | Verificación en curso |
|  | `visitVerification.session.radius` | Allowed radius: {{value}}m | 허용 반경: {{value}}m | Radio permitido: {{value}}m |
|  | `visitVerification.session.ready` | Start only while you are at this place. | 이 장소에 머무는 동안에만 시작해 주세요. | Empieza solo mientras estés en este lugar. |
|  | `visitVerification.session.recovering` | Restoring the verification session from the server... | 서버에서 진행 중인 인증 상태를 복구하는 중이에요... | Restaurando la sesión de verificación desde el servidor... |
|  | `visitVerification.session.remaining_one` | {{count}} second remaining | 남은 시간: {{count}}초 | Queda {{count}} segundo |
|  | `visitVerification.session.remaining_other` | {{count}} seconds remaining | 남은 시간: {{count}}초 | Quedan {{count}} segundos |
|  | `visitVerification.session.start` | Start visit verification | 방문 인증 시작 | Iniciar verificación de visita |
|  | `visitVerification.session.starting` | Starting verification session... | 인증 세션을 시작하는 중이에요... | Iniciando la sesión de verificación... |
| ● | `visitVerification.session.serverError` | Could not verify the visit because of a server error. Try again. | 서버 오류로 방문을 인증하지 못했어요. 다시 시도해 주세요. | No se pudo verificar la visita por un error del servidor. Inténtalo de nuevo. |
|  | `visitVerification.session.status.COMPLETED` | Visit verified | 인증 완료 | Visita verificada |
|  | `visitVerification.session.status.EXPIRED` | Verification session expired | 세션 만료 | La sesión de verificación expiró |
|  | `visitVerification.session.status.IN_PROGRESS` | Verification in progress | 인증 진행 중 | Verificación en curso |
|  | `visitVerification.session.status.PROXIMITY_LOST` | You left the allowed radius | 반경 이탈 | Saliste del radio permitido |
|  | `visitVerification.session.status.REJECTED` | Verification rejected | 인증 거절 | Verificación rechazada |
|  | `visitVerification.session.status.STARTED` | Verification started | 인증 시작됨 | Verificación iniciada |
|  | `visitVerification.session.title` | Visit verification | 방문 인증 | Verificación de visita |
|  | `visitVerification.session.unauthenticated` | Sign in again to verify this visit. | 방문을 인증하려면 다시 로그인해 주세요. | Inicia sesión de nuevo para verificar esta visita. |
|  | `visitVerification.session.verifiedDwell` | Verified stay: {{value}} seconds | 인증된 체류 시간: {{value}}초 | Permanencia verificada: {{value}} segundos |
|  | `visitVerification.unknownCategory` | Place | 장소 | Lugar |
| ● | `visitVerification.validation.contentRequired` | Write a review before submitting. | 후기를 작성해 주세요. | Escribe una reseña antes de enviarla. |
| ● | `visitVerification.validation.contentTooLong` | Your review must be 2,000 characters or fewer. | 후기는 2,000자 이하로 작성해 주세요. | Tu reseña debe tener 2000 caracteres o menos. |
| ● | `visitVerification.validation.reasonRequired` | Select at least one recommendation reason. | 추천 이유를 한 개 이상 선택해 주세요. | Selecciona al menos un motivo de recomendación. |
|  | `visitVerification.session.remaining_many` | — | — | Quedan {{count}} segundos |

## `voiceAssistant`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `voiceAssistant.command.submission` | After 5 seconds without speech, recognized voice input is sent to the AI server automatically. Text input is sent when you use Send. Exact coordinates are used only by the existing place lookup. | 음성 입력은 5초 동안 말하지 않으면 인식된 내용을 AI 서버에 자동 전송합니다. 텍스트 입력은 보내기를 누르면 전송합니다. 정확한 현재 좌표는 기존 장소 조회에만 사용합니다. | Tras 5 segundos sin voz, la entrada de voz reconocida se envía automáticamente al servidor de IA. El texto se envía cuando tocas Enviar. Las coordenadas exactas solo se usan en la búsqueda de lugares existente. |
|  | `voiceAssistant.command.introTitle` | Before using AI | AI 사용 안내 | Antes de usar la IA |
|  | `voiceAssistant.command.introContinue` | Continue to AI | 확인하고 시작하기 | Continuar con la IA |
|  | `voiceAssistant.command.introClose` | Close | 닫기 | Cerrar |
|  | `voiceAssistant.command.timezone` | Request timezone: {{timezone}} | 요청 시간대: {{timezone}} | Zona horaria de la solicitud: {{timezone}} |
|  | `voiceAssistant.command.processing` | Checking place information. | 장소 정보를 확인하고 있습니다. | Comprobando la información del lugar. |
|  | `voiceAssistant.command.canceled` | Voice session ended. | 음성 세션을 종료했습니다. | La sesión de voz finalizó. |
| ● | `voiceAssistant.command.advisory` | Assistant response received. | 어시스턴트 응답을 받았습니다. | Se recibió la respuesta del asistente. |
|  | `voiceAssistant.command.bounded` | Results checked among up to 12 nearby candidates. | 가까운 후보 최대 12곳에서 조건을 확인한 결과입니다. | Resultados comprobados entre un máximo de 12 candidatos cercanos. |
|  | `voiceAssistant.command.empty` | No matching results among the checked candidates. | 조회한 후보에 조건과 일치하는 결과가 없습니다. | No hay resultados que coincidan entre los candidatos comprobados. |
|  | `voiceAssistant.command.slots` | Actual server intervals. These do not confirm product bookability or a reservation. | 서버의 실제 이용 시간입니다. 상품의 예약 가능 여부나 예약 확정을 의미하지 않습니다. | Son los intervalos reales del servidor. No confirman que el producto se pueda reservar ni una reserva. |
|  | `voiceAssistant.command.general` | General admission | 일반 이용 | Entrada general |
|  | `voiceAssistant.command.capacity` | Remaining capacity: {{count}} | 남은 정원: {{count}}명 | Capacidad restante: {{count}} |
| ● | `voiceAssistant.command.failed` | The request could not be completed. Check your conditions and try again. | 요청을 완료하지 못했습니다. 조건을 확인하고 다시 시도해 주세요. | No se pudo completar la solicitud. Revisa tus condiciones e inténtalo de nuevo. |
|  | `voiceAssistant.command.retry` | Try again | 다시 시도 | Reintentar |
|  | `voiceAssistant.command.resultSummary` | I found {{count}} place(s). The first result is “{{name}}”. | {{count}}곳을 찾았어요. 첫 번째 결과는 ‘{{name}}’이에요. | Encontré {{count}} lugar(es). El primer resultado es «{{name}}». |
|  | `voiceAssistant.command.showOnMap` | View on map | 지도에서 보기 | Ver en el mapa |
|  | `voiceAssistant.command.directions` | Directions | 길찾기 | Cómo llegar |
|  | `voiceAssistant.command.share` | Share | 공유 | Compartir |
|  | `voiceAssistant.command.operating.OPERATING` | Operating | 운영 중 | En funcionamiento |
|  | `voiceAssistant.command.operating.TEMPORARILY_CLOSED` | Temporarily closed | 임시 휴업 | Cerrado temporalmente |
|  | `voiceAssistant.command.operating.PERMANENTLY_CLOSED` | Permanently closed | 폐업 | Cerrado permanentemente |
|  | `voiceAssistant.command.fields.touristCategory` | Specify a place category. | 장소 카테고리를 알려 주세요. | Indica una categoría de lugar. |
|  | `voiceAssistant.command.fields.date` | Confirm the requested date. | 조회할 날짜를 확인해 주세요. | Confirma la fecha solicitada. |
|  | `voiceAssistant.command.fields.timeRange` | Confirm the timezone and start/end times. | 시간대와 시작·종료 시간을 확인해 주세요. | Confirma la zona horaria y las horas de inicio y fin. |
|  | `voiceAssistant.command.fields.quantity` | Specify the number of people. | 인원을 알려 주세요. | Indica el número de personas. |
|  | `voiceAssistant.command.fields.useCurrentLocation` | Confirm current location use and permission. | 현재 위치 사용 여부와 위치 권한을 확인해 주세요. | Confirma el uso de la ubicación actual y el permiso. |
|  | `voiceAssistant.command.fields.placeId` | Choose a place from the retrieved results. | 조회 결과에서 장소를 선택해 주세요. | Elige un lugar entre los resultados obtenidos. |
|  | `voiceAssistant.command.fields.availabilityId` | Choose a retrieved time slot. | 조회한 이용 시간을 선택해 주세요. | Elige un horario de los obtenidos. |
| ● | `voiceAssistant.command.errors.LOCATION_REQUIRED` | Current location and location permission are required. | 현재 위치와 위치 권한이 필요합니다. | Se necesitan la ubicación actual y el permiso de ubicación. |
| ● | `voiceAssistant.command.errors.ID_NOT_IN_CONTEXT` | Search again or select a verified place. | 장소를 다시 검색하거나 선택해 주세요. | Busca de nuevo o selecciona un lugar verificado. |
| ● | `voiceAssistant.command.errors.STALE_CONTEXT` | Your context changed. Submit a new request. | 조건이 변경되었습니다. 다시 요청해 주세요. | Tu contexto cambió. Envía una nueva solicitud. |
| ● | `voiceAssistant.command.errors.CANCELED` | Request canceled. | 요청이 취소되었습니다. | Solicitud cancelada. |
| ● | `voiceAssistant.command.errors.TIMEOUT` | The lookup timed out. | 조회 시간이 초과되었습니다. | Se agotó el tiempo de la consulta. |
| ● | `voiceAssistant.command.errors.AUTHENTICATION_REQUIRED` | Sign in to continue. | 로그인이 필요합니다. | Inicia sesión para continuar. |
| ● | `voiceAssistant.command.errors.FORBIDDEN` | This request is not currently supported or allowed. | 현재 지원하지 않거나 허용되지 않는 요청입니다. | Esta solicitud no es compatible o no está permitida por ahora. |
| ● | `voiceAssistant.command.errors.NOT_FOUND` | Information was not found. | 정보를 찾을 수 없습니다. | No se encontró la información. |
| ● | `voiceAssistant.command.errors.RATE_LIMITED` | Too many requests. Try again later. | 요청이 많습니다. 잠시 후 다시 시도해 주세요. | Demasiadas solicitudes. Inténtalo más tarde. |
| ● | `voiceAssistant.command.errors.NETWORK_ERROR` | Check your network connection. | 네트워크 연결을 확인해 주세요. | Revisa tu conexión de red. |
| ● | `voiceAssistant.command.errors.SERVER_ERROR` | The server is unavailable. Try again. | 서버에 연결할 수 없습니다. 다시 시도해 주세요. | El servidor no está disponible. Inténtalo de nuevo. |
| ● | `voiceAssistant.command.errors.INVALID_SERVER_RESPONSE` | The server information could not be verified. | 서버 정보를 확인할 수 없습니다. | No se pudo verificar la información del servidor. |
| ● | `voiceAssistant.command.errors.REPLAY_CONFLICT` | Duplicate requests differ. Enter a new request. | 중복 요청의 내용이 다릅니다. 새 요청을 입력해 주세요. | Las solicitudes duplicadas no coinciden. Escribe una nueva solicitud. |
|  | `voiceAssistant.open` | Open AI assistant | AI 어시스턴트 열기 | Abrir el asistente de IA |
| ● | `voiceAssistant.shortLabel` | AI | AI | IA |
|  | `voiceAssistant.brand` | Pingdy | Pingdy | Pingdy |
|  | `voiceAssistant.title` | AI assistant | AI 어시스턴트 | Asistente de IA |
|  | `voiceAssistant.close` | Close assistant | 어시스턴트 닫기 | Cerrar el asistente |
|  | `voiceAssistant.microphone` | Start microphone | 마이크 시작 | Iniciar el micrófono |
|  | `voiceAssistant.stop` | Stop and send | 중지하고 보내기 | Detener y enviar |
|  | `voiceAssistant.input` | Your request | 요청 내용 | Tu solicitud |
|  | `voiceAssistant.placeholder` | Ask me anything! | 무엇이든 물어보세요! | ¡Pregúntame lo que quieras! |
|  | `voiceAssistant.listeningPrompt` | Listening... | 듣고있어요! | Escuchando... |
|  | `voiceAssistant.settings` | Open microphone and speech recognition settings | 마이크·음성 인식 설정 열기 | Abrir los ajustes del micrófono y del reconocimiento de voz |
|  | `voiceAssistant.preview` | Input preview: nothing is sent to a server. Use Send on the keyboard to prepare your text locally. | 입력 미리보기입니다. 서버로 전송되지 않으며, 키보드의 보내기를 누르면 기기 안에서 요청을 준비합니다. | Vista previa de la entrada: no se envía nada al servidor. Toca Enviar en el teclado para preparar tu texto en el dispositivo. |
|  | `voiceAssistant.voiceUnavailable` | Voice recognition is unavailable on this device. You can use text input. | 이 기기에서는 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | El reconocimiento de voz no está disponible en este dispositivo. Puedes escribir tu solicitud. |
|  | `voiceAssistant.feedback.unrecognized` | I’m not sure what you mean. Could you say that again? | 무슨 말을 하시는지 잘 모르겠어요, 다시 한번 부탁드려도 될까요? | No estoy seguro de lo que quieres decir. ¿Puedes repetirlo? |
|  | `voiceAssistant.feedback.noSpeech` | I couldn’t hear a request. Could you say that again? | 말씀을 듣지 못했어요. 다시 한번 말씀해 주시겠어요? | No escuché ninguna solicitud. ¿Puedes repetirlo? |
|  | `voiceAssistant.feedback.retry` | Speak again | 다시 말하기 | Hablar de nuevo |
|  | `voiceAssistant.feedback.dismiss` | That’s okay | 괜찮아요 | Está bien |
|  | `voiceAssistant.localOnly` | Input prepared on this device. AI connection is not available yet; nothing was sent. | 이 기기에서 입력을 준비했습니다. AI 연결은 아직 제공되지 않아 전송하지 않았습니다. | Entrada preparada en este dispositivo. La conexión con la IA aún no está disponible; no se envió nada. |
| ● | `voiceAssistant.advisory` | Assistant guidance may be inaccurate. Verify important details. | 어시스턴트 안내는 정확하지 않을 수 있습니다. 중요한 정보는 다시 확인해 주세요. | Las indicaciones del asistente pueden ser inexactas. Verifica los datos importantes. |
|  | `voiceAssistant.invalidResponse` | The assistant response could not be verified. Please try again. | 어시스턴트 응답을 확인할 수 없습니다. 다시 시도해 주세요. | No se pudo verificar la respuesta del asistente. Inténtalo de nuevo. |
|  | `voiceAssistant.clarification` | More information is needed | 추가 정보가 필요합니다 | Se necesita más información |
| ● | `voiceAssistant.permissions.undetermined` | Microphone or speech recognition permission has not been requested. | 마이크 또는 음성 인식 권한을 아직 요청하지 않았습니다. | Aún no se ha solicitado el permiso de micrófono o de reconocimiento de voz. |
| ● | `voiceAssistant.permissions.granted` | Microphone and speech recognition permissions allowed. | 마이크와 음성 인식 권한이 허용되었습니다. | Permisos de micrófono y de reconocimiento de voz concedidos. |
| ● | `voiceAssistant.permissions.denied` | Microphone or speech recognition permission denied. You can retry or type instead. | 마이크 또는 음성 인식 권한이 거부되었습니다. 다시 요청하거나 텍스트를 입력해 주세요. | Permiso de micrófono o de reconocimiento de voz denegado. Puedes reintentar o escribir. |
| ● | `voiceAssistant.permissions.blocked` | Microphone or speech recognition access requires a change in system settings. You can type instead. | 시스템 설정에서 마이크 또는 음성 인식 권한을 변경해야 합니다. 텍스트 입력은 사용할 수 있습니다. | El acceso al micrófono o al reconocimiento de voz requiere un cambio en los ajustes del sistema. Puedes escribir. |
| ● | `voiceAssistant.permissions.restricted` | Speech recognition is restricted by this device’s policy. You can type instead. | 기기 정책으로 음성 인식이 제한되어 있습니다. 텍스트로 입력해 주세요. | La política de este dispositivo restringe el reconocimiento de voz. Puedes escribir. |
|  | `voiceAssistant.phases.idle` | Ready for input | 입력 대기 | Listo para recibir tu solicitud |
| ● | `voiceAssistant.phases.permissionRequesting` | Checking microphone and speech recognition permissions | 마이크·음성 인식 권한 확인 중 | Comprobando los permisos de micrófono y de reconocimiento de voz |
|  | `voiceAssistant.phases.listening` | Microphone on — listening | 마이크 켜짐 — 듣는 중 | Micrófono activado: escuchando |
|  | `voiceAssistant.phases.processing` | Microphone stopping — processing speech | 마이크 중지 중 — 음성 처리 중 | Deteniendo el micrófono: procesando la voz |
|  | `voiceAssistant.phases.final` | Final input ready | 최종 입력 준비됨 | Entrada final lista |
|  | `voiceAssistant.phases.canceled` | Input canceled | 입력 취소됨 | Entrada cancelada |
| ● | `voiceAssistant.phases.permissionDenied` | Voice permission denied | 음성 입력 권한 거부됨 | Permiso de voz denegado |
|  | `voiceAssistant.phases.unavailable` | Voice input unavailable | 음성 입력 사용 불가 | Entrada de voz no disponible |
| ● | `voiceAssistant.phases.error` | Input could not be completed | 입력을 완료하지 못했습니다 | No se pudo completar la entrada |
| ● | `voiceAssistant.errors.interrupted` | Audio was interrupted. Try again or type your request. | 다른 오디오 작업으로 중단되었습니다. 다시 시도하거나 텍스트로 입력해 주세요. | El audio se interrumpió. Inténtalo de nuevo o escribe tu solicitud. |
| ● | `voiceAssistant.errors.noSpeech` | No final speech was recognized. Try again or type your request. | 최종 음성을 인식하지 못했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | No se reconoció ninguna frase final. Inténtalo de nuevo o escribe tu solicitud. |
| ● | `voiceAssistant.errors.unavailable` | Speech recognition is unavailable. Please type your request. | 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | El reconocimiento de voz no está disponible. Escribe tu solicitud. |
| ● | `voiceAssistant.errors.network` | The speech service could not connect. Check your network or type your request. | 음성 인식 서비스에 연결하지 못했습니다. 네트워크를 확인하거나 텍스트로 입력해 주세요. | El servicio de voz no pudo conectarse. Revisa tu red o escribe tu solicitud. |
| ● | `voiceAssistant.errors.failed` | Speech recognition failed. Please type or try again. | 음성 인식에 실패했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | El reconocimiento de voz falló. Escribe o inténtalo de nuevo. |
| ● | `voiceAssistant.errors.empty` | Enter a request first. | 요청을 먼저 입력해 주세요. | Primero escribe una solicitud. |
| ● | `voiceAssistant.errors.tooLong` | Use 2,000 characters or fewer. | 2,000자 이내로 입력해 주세요. | Usa 2000 caracteres o menos. |
| ● | `voiceAssistant.errors.submitFailed` | Input could not be handed over. Close the assistant and start a new request. | 입력을 전달하지 못했습니다. 어시스턴트를 닫고 새 요청을 시작해 주세요. | No se pudo entregar la entrada. Cierra el asistente e inicia una nueva solicitud. |

## `selectLanguage`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `selectLanguage.title` | Select Language | 언어 선택 | Selecciona el idioma |
|  | `selectLanguage.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | ¡Te mostraremos la mejor ruta! |
|  | `selectLanguage.button` | Continue | 계속 | Continuar |
|  | `selectLanguage.search` | Search... | 검색하기 | Buscar... |
| ● | `selectLanguage.logoAccessibilityLabel` | PingDom logo | 핑덤 로고 | Logotipo de PingDom |
|  | `selectLanguage.options.en` | English | 영어 | Inglés |
|  | `selectLanguage.options.ko` | Korean | 한국어 | Coreano |
|  | `selectLanguage.options.ja` | 日本語 | 日本語 | Japonés |
|  | `selectLanguage.options.zh-CN` | Chinese (Simplified) | 중국어(간체) | Chino (simplificado) |
|  | `selectLanguage.options.zh-TW` | Chinese (Traditional) | 중국어(번체) | Chino (tradicional) |
|  | `selectLanguage.options.vi` | Vietnamese | 베트남어 | Vietnamita |
|  | `selectLanguage.options.es` | Spanish | 스페인어 | Español |
|  | `selectLanguage.options.pt-BR` | Portuguese (Brazil) | 포르투갈어(브라질) | Portugués (Brasil) |
|  | `selectLanguage.progress` | Step {{current}} of {{total}} | 총 {{total}}단계 중 {{current}}단계 | Paso {{current}} de {{total}} |

## `selectCountry`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `selectCountry.title` | Select Country | 국가 선택 | Selecciona el país |
|  | `selectCountry.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | ¡Te mostraremos la mejor ruta! |
|  | `selectCountry.button` | Continue | 계속 | Continuar |
|  | `selectCountry.search` | Search... | 검색하기 | Buscar... |

## `selectAge`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `selectAge.title` | Select Birth Year | 생년 선택 | Selecciona tu año de nacimiento |
|  | `selectAge.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | ¡Te mostraremos la mejor ruta! |
|  | `selectAge.button` | Continue | 계속 | Continuar |

## `selectGender`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `selectGender.title` | Select gender | 성별 선택 | Selecciona tu género |
|  | `selectGender.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | ¡Te mostraremos la mejor ruta! |
|  | `selectGender.button` | Continue | 계속 | Continuar |
|  | `selectGender.male` | Male | 남성 | Hombre |
|  | `selectGender.female` | Female | 여성 | Mujer |
|  | `selectGender.other` | Prefer not to say | 비공개 | Prefiero no decirlo |

## `countries`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `countries.us` | United States | 미국 | Estados Unidos |
|  | `countries.cn` | China | 중국 | China |
|  | `countries.jp` | Japan | 일본 | Japón |
|  | `countries.th` | Thailand | 태국 | Tailandia |
|  | `countries.vn` | Vietnam | 베트남 | Vietnam |
|  | `countries.kr` | South Korea | 대한민국 | Corea del Sur |

## `loginForeign`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `loginForeign.title` | Only Pingdom | 오직 핑덤 | Solo en PingDom |
|  | `loginForeign.subtitle` | Let's find hidden<br>places in Korea! | 한국의 숨은 장소를<br>찾아보세요! | ¡Descubramos lugares<br>ocultos de Corea! |
|  | `loginForeign.button` | Get Started | 시작하기 | Comenzar |

## `experience`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `experience.common.back` | Back to map | 지도로 돌아가기 | Volver al mapa |
|  | `experience.common.close` | Close | 닫기 | Cerrar |
|  | `experience.common.loading` | Loading. Please wait. | 불러오는 중입니다. 잠시 기다려 주세요. | Cargando. Espera un momento. |
|  | `experience.placeDetail.title` | Place details | 장소 상세 | Detalles del lugar |
|  | `experience.placeDetail.open` | Open now | 영업 중 | Abierto ahora |
|  | `experience.placeDetail.distance` | {{distance}} away | {{distance}} 거리 | A {{distance}} |
|  | `experience.placeDetail.checked` | Visitor information updated {{date}} | 방문자 정보 업데이트 {{date}} | Información de visitantes actualizada el {{date}} |
|  | `experience.placeDetail.couponPrice` | Coupon value {{price}} | 쿠폰 혜택 {{price}} | Valor del cupón {{price}} |
|  | `experience.placeDetail.checkIn` | Check in at this place | 이 장소에 체크인하기 | Hacer check-in en este lugar |
|  | `experience.placeDetail.coupon` | View available coupons | 사용 가능한 쿠폰 보기 | Ver cupones disponibles |
|  | `experience.checkIn.title` | Check in | 체크인 | Check-in |
|  | `experience.checkIn.description` | Confirm that you are visiting this place to unlock local benefits. | 장소 방문을 확인하고 현지 방문객 혜택을 받아보세요. | Confirma que estás visitando este lugar para desbloquear beneficios locales. |
|  | `experience.checkIn.status` | Ready to confirm your location | 현재 위치 확인 준비 완료 | Listo para confirmar tu ubicación |
|  | `experience.checkIn.action` | Confirm my location and complete check-in | 내 위치를 확인하고 체크인 완료하기 | Confirmar mi ubicación y completar el check-in |
|  | `experience.checkIn.collapseVisits` | Show less | 접기 | Mostrar menos |
|  | `experience.checkIn.expandVisits` | Show all | 전체 보기 | Mostrar todo |
|  | `experience.checkIn.loadMoreVisits` | Load more visits | 방문 기록 더 보기 | Cargar más visitas |
| ● | `experience.checkIn.locationDenied` | Location permission is required to check in. | 체크인하려면 위치 권한이 필요합니다. | Se necesita el permiso de ubicación para hacer check-in. |
| ● | `experience.checkIn.locationFailed` | Your current location could not be retrieved. | 현재 위치를 가져오지 못했습니다. | No se pudo obtener tu ubicación actual. |
|  | `experience.checkIn.locationLoading` | Checking your current location… | 현재 위치를 확인하고 있습니다… | Comprobando tu ubicación actual… |
|  | `experience.checkIn.openSettings` | Open settings | 설정 열기 | Abrir ajustes |
|  | `experience.checkIn.recentVisits` | Recent visits | 최근 방문 | Visitas recientes |
|  | `experience.checkIn.retryCheckIn` | Try check-in again | 체크인 다시 시도 | Reintentar el check-in |
|  | `experience.checkIn.retryLocation` | Try location again | 위치 다시 확인 | Reintentar la ubicación |
|  | `experience.checkIn.retryVisits` | Try loading visits again | 방문 기록 다시 불러오기 | Reintentar la carga de visitas |
|  | `experience.checkIn.selectedPlace` | Selected place ID {{placeId}} | 선택한 장소 ID {{placeId}} | ID del lugar seleccionado {{placeId}} |
|  | `experience.checkIn.submitting` | Checking in. Please wait. | 체크인 중입니다. 잠시 기다려 주세요. | Haciendo check-in. Espera un momento. |
|  | `experience.checkIn.success` | Check-in complete | 체크인이 완료되었습니다. | Check-in completado |
|  | `experience.checkIn.visitDistance` | {{distance}} m away | 장소와 {{distance}}m 거리 | A {{distance}} m |
|  | `experience.checkIn.visitPlace` | Place ID {{placeId}} | 장소 ID {{placeId}} | ID del lugar {{placeId}} |
|  | `experience.checkIn.visitsEmpty` | No recent visits yet. | 아직 최근 방문 기록이 없습니다. | Aún no hay visitas recientes. |
|  | `experience.checkIn.visitsLoading` | Loading recent visits… | 최근 방문 기록을 불러오고 있습니다… | Cargando visitas recientes… |
| ● | `experience.checkIn.errors.authentication` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | Tu sesión expiró. Inicia sesión de nuevo. |
| ● | `experience.checkIn.errors.duplicate` | You have already checked in at this place under the current server policy. | 현재 서버 정책상 이미 체크인한 장소입니다. | Ya hiciste check-in en este lugar según la política actual del servidor. |
| ● | `experience.checkIn.errors.generic` | Check-in could not be completed. Please try again. | 체크인을 완료하지 못했습니다. 다시 시도해 주세요. | No se pudo completar el check-in. Inténtalo de nuevo. |
| ● | `experience.checkIn.errors.network` | You appear to be offline. Check your connection and try again. | 네트워크에 연결되지 않았습니다. 연결을 확인한 뒤 다시 시도해 주세요. | Parece que no tienes conexión. Revisa tu conexión e inténtalo de nuevo. |
| ● | `experience.checkIn.errors.out-of-range` | You are too far from this place to check in. | 장소와 거리가 멀어 체크인할 수 없습니다. | Estás demasiado lejos de este lugar para hacer check-in. |
|  | `experience.coupon.title` | Coupon wallet | 쿠폰 지갑 | Cartera de cupones |
|  | `experience.coupon.description` | Coupons that are ready to use appear here. | 바로 사용할 수 있는 쿠폰이 이곳에 표시됩니다. | Aquí aparecen los cupones listos para usar. |
|  | `experience.coupon.status` | No available coupons | 사용 가능한 쿠폰 없음 | No hay cupones disponibles |
|  | `experience.coupon.action` | Explore places offering visitor coupons | 방문객 쿠폰을 제공하는 장소 둘러보기 | Explora lugares que ofrecen cupones para visitantes |

## `auth`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `auth.koreanEntry.title` | My own places, Pingdom | 나만의 장소, 핑덤 | Mis propios lugares, PingDom |
|  | `auth.koreanEntry.subtitle` | Share your places<br>with visitors from abroad! | 당신만의 장소를<br>외국인들에게 공유해주세요! | ¡Comparte tus lugares<br>con visitantes del extranjero! |
|  | `auth.koreanEntry.existingAccount` | Already have an account?  | 이미 계정이 있으신가요?  | ¿Ya tienes una cuenta?  |
|  | `auth.koreanEntry.login` | Log in | 로그인 | Iniciar sesión |
|  | `auth.koreanEntry.start` | Get Started | 시작하기 | Comenzar |
|  | `auth.login.title` | Start Pingdom | 핑덤 시작하기 | Empieza con PingDom |
|  | `auth.login.username` | Username | 아이디 | Nombre de usuario |
|  | `auth.login.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | Escribe tu nombre de usuario |
|  | `auth.login.password` | Password | 비밀번호 | Contraseña |
|  | `auth.login.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | Escribe tu contraseña |
|  | `auth.login.submit` | Get Started | 시작하기 | Comenzar |
|  | `auth.login.submitting` | Logging in... | 로그인 중... | Iniciando sesión... |
|  | `auth.login.findUsername` | Find ID | 아이디 찾기 | Recuperar usuario |
|  | `auth.login.findPassword` | Find password | 비밀번호 찾기 | Recuperar contraseña |
|  | `auth.login.signup` | Sign up | 회원가입 | Registrarse |
| ● | `auth.login.unknownError` | An unknown error occurred while logging in. | 로그인 중 알 수 없는 오류가 발생했습니다. | Ocurrió un error desconocido al iniciar sesión. |
|  | `auth.passwordReset.confirmDescription` | Enter the reset code sent to {{email}} and choose a new password. | {{email}}로 보낸 재설정 코드를 입력하고 새 비밀번호를 설정해주세요. | Escribe el código de restablecimiento enviado a {{email}} y elige una nueva contraseña. |
|  | `auth.passwordReset.confirmTitle` | Set a new password | 새 비밀번호 설정 | Establece una nueva contraseña |
|  | `auth.passwordReset.invalidToken` | That reset code is not valid. Check the code or request a new one. | 재설정 코드가 올바르지 않습니다. 코드를 확인하거나 다시 요청해주세요. | Ese código de restablecimiento no es válido. Revisa el código o solicita uno nuevo. |
|  | `auth.passwordReset.newPassword` | New password | 새 비밀번호 | Nueva contraseña |
|  | `auth.passwordReset.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | Al menos 8 caracteres |
|  | `auth.passwordReset.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | La contraseña debe tener al menos 8 caracteres |
|  | `auth.passwordReset.processing` | Processing... | 처리 중... | Procesando... |
|  | `auth.passwordReset.requestDescription` | Enter the email you signed up with. We will send you a reset code. | 가입한 이메일을 입력하시면 재설정 코드를 보내드려요. | Escribe el correo con el que te registraste. Te enviaremos un código de restablecimiento. |
|  | `auth.passwordReset.requestTitle` | Reset your password | 비밀번호 재설정 | Restablece tu contraseña |
|  | `auth.passwordReset.resend` | Send the code again | 코드 다시 보내기 | Enviar el código de nuevo |
|  | `auth.passwordReset.sendToken` | Send reset code | 재설정 코드 받기 | Enviar código de restablecimiento |
|  | `auth.passwordReset.submit` | Reset password | 비밀번호 재설정하기 | Restablecer contraseña |
|  | `auth.passwordReset.token` | Reset code | 재설정 코드 | Código de restablecimiento |
|  | `auth.passwordReset.tokenPlaceholder` | Enter the code from your email | 메일로 받은 코드를 입력하세요 | Escribe el código de tu correo |
|  | `auth.passwordReset.tokenRequired` | Please enter the reset code | 재설정 코드를 입력해주세요 | Escribe el código de restablecimiento |
| ● | `auth.passwordReset.unknownError` | An unknown error occurred while resetting your password. | 비밀번호 재설정 중 알 수 없는 오류가 발생했습니다. | Ocurrió un error desconocido al restablecer tu contraseña. |
|  | `auth.signup.title` | Start Pingdom | 핑덤 시작하기 | Empieza con PingDom |
|  | `auth.signup.passwordTitle` | Confirm Password | 비밀번호 확인 | Confirma la contraseña |
|  | `auth.signup.username` | Username | 아이디 | Nombre de usuario |
|  | `auth.signup.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | Escribe tu nombre de usuario |
|  | `auth.signup.email` | Email | 이메일 | Correo electrónico |
|  | `auth.signup.emailPlaceholder` | Enter your email | 이메일을 입력하세요 | Escribe tu correo electrónico |
|  | `auth.signup.password` | Password | 비밀번호 | Contraseña |
|  | `auth.signup.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | Escribe tu contraseña |
|  | `auth.signup.passwordConfirm` | Confirm password | 비밀번호 확인 | Confirmar contraseña |
|  | `auth.signup.passwordConfirmPlaceholder` | Enter your password again | 비밀번호를 한번 더 입력하세요 | Escribe tu contraseña otra vez |
|  | `auth.signup.next` | Next | 다음 | Siguiente |
|  | `auth.signup.start` | Get Started | 시작하기 | Comenzar |
|  | `auth.signup.processing` | Processing... | 처리 중... | Procesando... |
| ● | `auth.signup.unknownError` | An unknown error occurred while signing up. | 회원가입 중 알 수 없는 오류가 발생했습니다. | Ocurrió un error desconocido al registrarte. |
| ● | `auth.validation.usernameRequired` | Please enter your username | 아이디를 입력해주세요 | Escribe tu nombre de usuario |
| ● | `auth.validation.emailRequired` | Please enter your email | 이메일을 입력해주세요 | Escribe tu correo electrónico |
| ● | `auth.validation.emailInvalid` | Please enter a valid email address | 올바른 이메일 형식이 아닙니다 | Escribe una dirección de correo válida |
| ● | `auth.validation.passwordRequired` | Please enter your password | 비밀번호를 입력해주세요 | Escribe tu contraseña |
| ● | `auth.validation.passwordConfirmRequired` | Please enter your password again | 비밀번호를 한번 더 입력해주세요 | Escribe tu contraseña otra vez |
| ● | `auth.validation.passwordMismatch` | Passwords do not match | 비밀번호가 일치하지 않습니다 | Las contraseñas no coinciden |

## `common`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `common.missingTranslation` | Translation unavailable | 번역을 제공할 수 없습니다 | Traducción no disponible |
|  | `common.navigation.back` | Go back | 뒤로 가기 | Volver |
|  | `common.navigation.close` | Close | 닫기 | Cerrar |
| ● | `common.navigation.exitHint` | Press back again to exit the app. | 뒤로가기를 한 번 더 누르면 앱이 종료됩니다. | Presiona atrás otra vez para salir de la app. |
|  | `common.navigation.retry` | Try again | 다시 시도 | Reintentar |
|  | `common.unsupportedFeature.description` | This feature is not currently supported in the app. | 이 기능은 현재 앱에서 지원하지 않습니다. | Esta función no es compatible con la app por ahora. |
|  | `common.unsupportedFeature.title` | Not available in the app | 앱에서 제공하지 않는 기능 | No disponible en la app |
| ● | `common.apiError.timeout.title` | The response is taking too long | 응답 시간이 초과되었어요 | La respuesta está tardando demasiado |
| ● | `common.apiError.timeout.description` | Check your connection and try loading again. | 연결을 확인하고 다시 조회해 주세요. | Revisa tu conexión e intenta cargar de nuevo. |
| ● | `common.apiError.server.title` | Service temporarily unavailable | 서비스에 잠시 연결할 수 없어요 | Servicio no disponible temporalmente |
| ● | `common.apiError.server.description` | Please try loading again in a moment. | 잠시 후 다시 조회해 주세요. | Intenta cargar de nuevo en un momento. |
| ● | `common.apiError.rateLimited.title` | Too many requests | 요청이 너무 많아요 | Demasiadas solicitudes |
| ● | `common.apiError.rateLimited.description` | Please wait a moment before trying again. | 잠시 기다린 후 다시 시도해 주세요. | Espera un momento antes de intentarlo de nuevo. |
| ● | `common.apiError.mutationUnknown.title` | Result not confirmed | 처리 결과를 확인해 주세요 | Resultado sin confirmar |
| ● | `common.apiError.mutationUnknown.description` | We could not confirm the result. Check the latest status before submitting again. | 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 최신 상태를 확인해 주세요. | No pudimos confirmar el resultado. Revisa el estado más reciente antes de enviarlo de nuevo. |
| ● | `common.apiError.actions.back` | Go back | 목록으로 | Volver |
| ● | `common.apiError.actions.retry` | Try again | 다시 시도 | Reintentar |
| ● | `common.apiError.actions.signIn` | Sign in again | 다시 로그인 | Iniciar sesión de nuevo |
| ● | `common.apiError.actions.update` | Update app | 앱 업데이트 | Actualizar la app |
| ● | `common.apiError.authentication.description` | Your session is no longer valid. Please sign in again. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | Tu sesión ya no es válida. Inicia sesión de nuevo. |
| ● | `common.apiError.authentication.title` | Sign-in required | 로그인이 필요합니다 | Inicio de sesión necesario |
| ● | `common.apiError.authorization.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | Esta cuenta no tiene permiso para realizar esta acción. |
| ● | `common.apiError.authorization.title` | Permission required | 권한이 필요합니다 | Permiso necesario |
| ● | `common.apiError.conflict.description` | The request conflicts with the resource’s current state. Refresh its latest state. | 리소스의 현재 상태와 요청이 충돌합니다. 최신 상태를 확인해 주세요. | La solicitud entra en conflicto con el estado actual del recurso. Actualiza para ver su estado más reciente. |
| ● | `common.apiError.conflict.title` | State has changed | 상태가 변경되었습니다 | El estado cambió |
| ● | `common.apiError.expired.description` | This coupon or resource has expired. | 쿠폰 또는 리소스의 이용 기간이 만료되었습니다. | Este cupón o recurso venció. |
| ● | `common.apiError.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | Ya no está disponible |
| ● | `common.apiError.generic.description` | Please check your connection and try again. | 네트워크 상태를 확인한 후 다시 시도해 주세요. | Revisa tu conexión e inténtalo de nuevo. |
| ● | `common.apiError.generic.title` | Could not load data | 데이터를 불러오지 못했습니다 | No se pudieron cargar los datos |
| ● | `common.apiError.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo. |
| ● | `common.apiError.network.title` | Connection problem | 연결에 문제가 있습니다 | Problema de conexión |
| ● | `common.apiError.notFound.description` | The requested resource no longer exists. Return to the latest list. | 요청한 항목이 더 이상 존재하지 않습니다. 최신 목록으로 돌아가 주세요. | El recurso solicitado ya no existe. Vuelve a la lista más reciente. |
| ● | `common.apiError.notFound.title` | Not found | 항목을 찾을 수 없습니다 | No encontrado |
| ● | `common.apiError.outOfRange.description` | Move closer to the place and check your location accuracy. | 장소에 더 가까이 이동하고 위치 정확도를 확인해 주세요. | Acércate al lugar y revisa la precisión de tu ubicación. |
| ● | `common.apiError.outOfRange.title` | Too far away to check in | 체크인 가능 거리 밖입니다 | Demasiado lejos para hacer check-in |
| ● | `common.apiError.updateRequired.description` | Install the latest version to keep using PingDom. | PingDom을 계속 사용하려면 최신 버전을 설치해 주세요. | Instala la versión más reciente para seguir usando PingDom. |
| ● | `common.apiError.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | Actualización necesaria |
| ● | `common.apiError.validation.description` | Review the highlighted information and try again. | 입력한 정보를 확인한 후 다시 시도해 주세요. | Revisa la información marcada e inténtalo de nuevo. |
| ● | `common.apiError.validation.title` | Check your entries | 입력 정보를 확인해 주세요 | Revisa tus datos |
| ● | `common.error.description` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Inténtalo de nuevo en un momento. |
| ● | `common.error.retry` | Try again | 다시 시도 | Reintentar |
| ● | `common.error.title` | Something went wrong | 문제가 발생했습니다 | Algo salió mal |

## `placeMenu`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `placeMenu.exchange.amount` | Approx. {{price}} | 약 {{price}} | Aprox. {{price}} |
|  | `placeMenu.exchange.loading` | Loading exchange rate… | 환율을 불러오는 중입니다… | Cargando tipo de cambio… |
|  | `placeMenu.exchange.retry` | Exchange rate unavailable · Try again | 환율 조회 실패 · 다시 시도 | Tipo de cambio no disponible · Reintentar |
| ● | `placeMenu.accessibility.image` | {{name}} menu image | {{name}} 메뉴 이미지 | Imagen del menú de {{name}} |
| ● | `placeMenu.accessibility.imageUnavailable` | No image for {{name}} | {{name}} 메뉴 이미지 없음 | Sin imagen de {{name}} |
| ● | `placeMenu.accessibility.price` | Price: {{price}} | 가격: {{price}} | Precio: {{price}} |
| ● | `placeMenu.accessibility.status` | {{name}} status: {{status}} | {{name}} 상태: {{status}} | Estado de {{name}}: {{status}} |
| ● | `placeMenu.error.notFound` | The place details and menu data are temporarily out of sync. Refresh this menu or return to the map. | 장소 상세와 메뉴 데이터가 일시적으로 일치하지 않습니다. 메뉴를 새로고침하거나 지도로 돌아가 주세요. | Los detalles del lugar y los datos del menú no coinciden temporalmente. Actualiza este menú o vuelve al mapa. |
| ● | `placeMenu.error.title` | Could not load the menu. | 메뉴를 불러오지 못했습니다. | No se pudo cargar el menú. |
|  | `placeMenu.empty` | No menu has been added yet. | 등록된 메뉴가 없습니다. | Aún no se ha agregado ningún menú. |
|  | `placeMenu.imageUnavailable` | No image | 이미지 없음 | Sin imagen |
|  | `placeMenu.loading` | Loading menu… | 메뉴를 불러오는 중입니다… | Cargando menú… |
|  | `placeMenu.priceUnavailable` | Price unavailable | 가격 정보 없음 | Precio no disponible |
|  | `placeMenu.retry` | Try again | 다시 시도 | Reintentar |
|  | `placeMenu.soldOut` | Sold out | 품절 | Agotado |
|  | `placeMenu.title` | Menu | 메뉴 | Menú |

## `examplePlaces`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `examplePlaces.count` | {{count}} places | 장소 {{count}}개 | {{count}} lugares |
|  | `examplePlaces.englishMenu` | English menu: {{status}} | 영문 메뉴: {{status}} | Menú en inglés: {{status}} |
|  | `examplePlaces.emptyDescription` | Try again after place data is available. | 장소 데이터가 등록된 후 다시 확인해 주세요. | Inténtalo de nuevo cuando haya datos de lugares. |
|  | `examplePlaces.emptyTitle` | No places yet | 아직 등록된 장소가 없습니다 | Aún no hay lugares |
|  | `examplePlaces.loading` | Loading places... | 장소를 불러오는 중입니다... | Cargando lugares... |
|  | `examplePlaces.title` | Place list example | 장소 목록 예제 | Ejemplo de lista de lugares |
|  | `examplePlaces.trustScore` | Trust score: {{score}}/100 | 신뢰 점수: {{score}}/100 | Puntuación de confianza: {{score}}/100 |

## `merchant`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `merchant.pendingDescription` | Merchant {{merchantId}} is not available yet. | 상점 {{merchantId}}는 아직 준비 중입니다. | El comercio {{merchantId}} aún no está disponible. |
|  | `merchant.title` | Merchant | 상점 | Comercio |

## `onboarding`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `onboarding.preferenceFlow.loading` | Restoring your saved travel preferences... | 저장된 여행 선호를 불러오는 중입니다... | Restaurando tus preferencias de viaje guardadas... |
| ● | `onboarding.preferenceFlow.restoreError` | Saved preferences could not be restored. You can continue with new selections. | 저장된 선택을 불러오지 못했어요. 새로 선택해 계속할 수 있어요. | No se pudieron restaurar las preferencias guardadas. Puedes continuar con una nueva selección. |
| ● | `onboarding.preferenceFlow.saveError` | Your selections could not be saved. Please try Continue again. | 선택값을 저장하지 못했어요. 계속 버튼을 다시 눌러 주세요. | No se pudo guardar tu selección. Toca Continuar de nuevo. |
|  | `onboarding.preferences.currentNeeds.attendEvent` | Events | 이벤트 관람 | Eventos |
|  | `onboarding.preferences.currentNeeds.cafe` | Cafe | 카페 | Cafetería |
|  | `onboarding.preferences.currentNeeds.eat` | Food | 식사 | Comida |
|  | `onboarding.preferences.currentNeeds.explore` | Explore | 둘러보기 | Explorar |
|  | `onboarding.preferences.currentNeeds.nightlife` | Nightlife | 나이트라이프 | Vida nocturna |
|  | `onboarding.preferences.currentNeeds.shop` | Shopping | 쇼핑 | Compras |
|  | `onboarding.preferences.travelPurposes.beauty` | Beauty | 뷰티 | Belleza |
|  | `onboarding.preferences.travelPurposes.cafe` | Cafe | 카페 | Cafetería |
|  | `onboarding.preferences.travelPurposes.exhibition` | Exhibition | 전시 | Exposiciones |
|  | `onboarding.preferences.travelPurposes.fashion` | Fashion | 패션 | Moda |
|  | `onboarding.preferences.travelPurposes.food` | Food | 음식 | Comida |
|  | `onboarding.preferences.travelPurposes.kPop` | Music | 음악 | Música |
|  | `onboarding.preferences.travelPurposes.other` | Others | 기타 | Otros |
|  | `onboarding.preferences.travelPurposes.popUp` | Pop-up | 팝업 | Pop-up |
|  | `onboarding.travelScheduleScreen.back` | Back | 뒤로 가기 | Atrás |
|  | `onboarding.travelScheduleScreen.calendar` | Travel date calendar | 여행 일정 달력 | Calendario de fechas de viaje |
|  | `onboarding.travelScheduleScreen.continue` | Continue | 계속 | Continuar |
|  | `onboarding.travelScheduleScreen.description` | Please select your start and end dates | 여행 시작일과 종료일을 선택해 주세요 | Selecciona las fechas de inicio y de fin |
|  | `onboarding.travelScheduleScreen.emptyDate` | Not selected | 선택 전 | Sin seleccionar |
|  | `onboarding.travelScheduleScreen.endDate` | End date | 종료일 | Fecha de fin |
|  | `onboarding.travelScheduleScreen.invalidRange` | Check your dates and select a valid range again. | 날짜를 확인하고 올바른 기간을 다시 선택해 주세요. | Revisa las fechas y vuelve a seleccionar un rango válido. |
|  | `onboarding.travelScheduleScreen.nextMonth` | Next month | 다음 달 | Mes siguiente |
|  | `onboarding.travelScheduleScreen.previousMonth` | Previous month | 이전 달 | Mes anterior |
|  | `onboarding.travelScheduleScreen.progress` | Onboarding progress | 온보딩 진행 단계 | Progreso de la configuración inicial |
|  | `onboarding.travelScheduleScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | Paso {{current}} de {{total}} |
|  | `onboarding.travelScheduleScreen.startDate` | Start date | 시작일 | Fecha de inicio |
|  | `onboarding.travelScheduleScreen.title` | Select Travel Dates | 여행 일정을 알려주세요 | Selecciona tus fechas de viaje |
|  | `onboarding.travelScheduleScreen.weekdays.fri` | F | 금 | V |
|  | `onboarding.travelScheduleScreen.weekdays.mon` | M | 월 | L |
|  | `onboarding.travelScheduleScreen.weekdays.sat` | S | 토 | S |
|  | `onboarding.travelScheduleScreen.weekdays.sun` | S | 일 | D |
|  | `onboarding.travelScheduleScreen.weekdays.thu` | T | 목 | J |
|  | `onboarding.travelScheduleScreen.weekdays.tue` | T | 화 | M |
|  | `onboarding.travelScheduleScreen.weekdays.wed` | W | 수 | M |
|  | `onboarding.travelPurposeScreen.back` | Back | 뒤로 가기 | Atrás |
|  | `onboarding.travelPurposeScreen.continue` | Continue | 계속 | Continuar |
|  | `onboarding.travelPurposeScreen.description` | We'll recommend hot places that match your interests | 관심사에 맞는 핫플레이스를 추천해드릴게요 | Te recomendaremos lugares de moda según tus intereses |
|  | `onboarding.travelPurposeScreen.progress` | Onboarding progress | 온보딩 진행 단계 | Progreso de la configuración inicial |
|  | `onboarding.travelPurposeScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | Paso {{current}} de {{total}} |
|  | `onboarding.travelPurposeScreen.title` | Select Travel Purpose | 여행 목적을 선택해 주세요 | Selecciona el propósito de tu viaje |

## `map`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `map.decision.backToRecommendations` | Back to recommendations | 추천으로 돌아가기 | Volver a las sugerencias |
|  | `map.decision.emptyBody` | Try another keyword or remove a visit condition. | 다른 검색어를 입력하거나 방문 조건을 해제해 보세요. | Prueba otra palabra clave o quita una condición de visita. |
|  | `map.decision.emptyTitle` | No matching places yet | 일치하는 장소가 아직 없어요 | Aún no hay lugares que coincidan |
|  | `map.decision.filters.bookable` | Bookable | 예약 가능 | Reservable |
|  | `map.decision.filters.coupon` | Coupon | 쿠폰 | Cupón |
|  | `map.decision.filters.openNow` | Open now | 영업 중 | Abierto ahora |
|  | `map.decision.filters.shortWait` | Short wait | 대기 짧음 | Poca espera |
|  | `map.decision.getCoupon` | Get coupon | 쿠폰 받기 | Obtener cupón |
|  | `map.decision.couponMessage` | {{placeName}} coupon will be available here. | {{placeName}} 쿠폰을 이곳에서 받을 수 있어요. | El cupón de {{placeName}} estará disponible aquí. |
|  | `map.decision.goNow` | Go now | 바로 가기 | Ir ahora |
|  | `map.decision.goNowMessage` | Directions to {{placeName}} are ready. | {{placeName}}까지 길안내를 준비했어요. | La ruta a {{placeName}} está lista. |
|  | `map.decision.livePicks` | LIVE PICKS | 지금 인기 장소 | SELECCIÓN EN VIVO |
|  | `map.decision.map` | Map | 지도 | Mapa |
|  | `map.decision.nearMe` | Near me | 내 위치 | Cerca de mí |
|  | `map.decision.nearYou` | Near you | 내 주변 | Cerca de ti |
|  | `map.decision.noResults` | No matching places yet | 일치하는 장소가 아직 없어요 | Aún no hay lugares que coincidan |
|  | `map.decision.placesLiveNearby_one` | {{count}} place live nearby | 내 주변 {{count}}곳 운영 중 | {{count}} lugar activo cerca |
|  | `map.decision.placesLiveNearby_other` | {{count}} places live nearby | 내 주변 {{count}}곳 운영 중 | {{count}} lugares activos cerca |
|  | `map.decision.placesNearYou` | Places near you | 내 주변 장소 | Lugares cerca de ti |
| ● | `map.decision.profileAccessibilityLabel` | Open profile | 프로필 열기 | Abrir perfil |
|  | `map.decision.recommended` | Recommended | 추천순 | Recomendados |
|  | `map.decision.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | Resultados de «{{query}}» |
| ● | `map.decision.searchAccessibilityLabel` | Search places | 장소 검색 | Buscar lugares |
|  | `map.decision.searchPlaceholder` | Search places | 장소를 검색하세요 | Buscar lugares |
|  | `map.decision.seeAll` | See all | 전체 보기 | Ver todo |
|  | `map.decision.status.openNow` | Open now | 영업 중 | Abierto ahora |
|  | `map.decision.status.verified` | Visitor verified · {{time}} | 방문자 확인 · {{time}} | Verificado por visitantes · {{time}} |
|  | `map.decision.status.wait` | Wait {{wait}} | 대기 {{wait}} | Espera {{wait}} |
|  | `map.decision.transit` | Transit | 대중교통 | Transporte público |
|  | `map.decision.whereToGo` | Where to go now | 지금 어디로 갈까요? | ¿A dónde vamos ahora? |
|  | `map.card.actions.arrive` | Arrive | 도착 | Llegada |
|  | `map.card.actions.directions` | Directions | 길찾기 | Cómo llegar |
|  | `map.card.actions.reserve` | Reserve | 예약 | Reservar |
|  | `map.card.actions.share` | Share | 공유 | Compartir |
|  | `map.card.actions.start` | Start | 출발 | Salida |
|  | `map.card.closed` | Closed now | 영업 종료 | Cerrado ahora |
|  | `map.card.dismiss` | Dismiss place preview | 장소 미리보기 닫기 | Cerrar la vista previa del lugar |
| ● | `map.card.error` | Could not load this place. | 장소 정보를 불러오지 못했습니다. | No se pudo cargar este lugar. |
|  | `map.card.favorite` | Save place | 장소 저장 | Guardar lugar |
| ● | `map.card.imageLabel` | {{name}} photo | {{name}} 사진 | Foto de {{name}} |
|  | `map.card.imageUnavailable` | No photo | 사진 없음 | Sin foto |
|  | `map.card.loading` | Loading place preview... | 장소 미리보기를 불러오는 중입니다... | Cargando la vista previa del lugar... |
|  | `map.card.open` | Open now | 영업 중 | Abierto ahora |
| ● | `map.card.openHint` | Opens place details | 장소 상세를 엽니다 | Abre los detalles del lugar |
|  | `map.card.preview` | Place preview | 장소 미리보기 | Vista previa del lugar |
|  | `map.card.statusUnknown` | Status unknown | 영업 상태 미확인 | Estado desconocido |
|  | `map.card.support.coupon` | Coupons available | 쿠폰 사용 가능 | Cupones disponibles |
|  | `map.card.support.english` | English support | 영어응대 가능 | Atención en inglés |
|  | `map.card.support.englishMenu` | English menu | 영문 메뉴 | Menú en inglés |
|  | `map.card.support.foreignCard` | Foreign cards | 해외카드 가능 | Tarjetas extranjeras |
|  | `map.card.support.reservation` | Reservations | 예약 가능 | Reservas |
|  | `map.card.support.wifi` | Free Wi-Fi | 무료 Wi-Fi | Wi-Fi gratis |
|  | `map.placeActions.departureUnsupported` | Starting from a place is not supported yet. | 출발 기능은 아직 지원하지 않습니다. | Aún no se puede salir desde un lugar. |
| ● | `map.placeActions.directionsFailed` | Could not start directions. | 길찾기를 실행하지 못했습니다. | No se pudo iniciar la ruta. |
|  | `map.placeActions.directionsUnavailable` | Could not open an external map. | 외부 지도 앱을 열 수 없습니다. | No se pudo abrir un mapa externo. |
|  | `map.placeActions.locationMissing` | This place has no location information. | 장소 위치 정보가 없습니다. | Este lugar no tiene información de ubicación. |
| ● | `map.placeActions.shareFailed` | Could not share this place. | 공유를 실행하지 못했습니다. | No se pudo compartir este lugar. |
|  | `map.placeActions.shareUnavailable` | Sharing is not available on this device. | 이 기기에서는 공유 기능을 사용할 수 없습니다. | Compartir no está disponible en este dispositivo. |
|  | `map.data.disabledDescription` | Enable the place-list runtime setting to request server data. | 장소 목록 실행 설정을 켜면 서버 데이터를 요청합니다. | Activa el ajuste de ejecución de la lista de lugares para solicitar datos del servidor. |
|  | `map.data.disabledTitle` | Place discovery is off | 장소 탐색 기능이 꺼져 있어요 | La exploración de lugares está desactivada |
|  | `map.data.emptyDescription` | Move the map or change the search filters. | 지도를 이동하거나 검색 필터를 바꿔 보세요. | Mueve el mapa o cambia los filtros de búsqueda. |
|  | `map.data.emptyTitle` | No places in this area | 이 지역에 장소가 없습니다 | No hay lugares en esta zona |
| ● | `map.data.errorDescription` | Check your connection and try again. | 네트워크를 확인한 후 다시 시도해 주세요. | Revisa tu conexión e inténtalo de nuevo. |
| ● | `map.data.errorTitle` | Could not load places | 장소를 불러오지 못했습니다 | No se pudieron cargar los lugares |
|  | `map.data.loading` | Loading places... | 장소를 불러오는 중입니다... | Cargando lugares... |
|  | `map.data.mockDescription` | These markers come from the explicitly selected development transport. | 명시적으로 선택한 개발 transport의 합성 마커입니다. | Estos marcadores provienen del transport de desarrollo seleccionado explícitamente. |
|  | `map.data.mockTitle` | Development Mock places | 개발 Mock 장소 | Lugares Mock de desarrollo |
|  | `map.data.retry` | Try again | 다시 시도 | Reintentar |
|  | `map.distanceMeters` | {{count}} m | {{count}}m | {{count}} m |
|  | `map.filters.all` | All | 전체 | Todo |
|  | `map.filters.cafe` | Cafe | 카페 | Cafetería |
|  | `map.filters.fashion` | Fashion | 패션 | Moda |
|  | `map.filters.food` | Food | 음식 | Comida |
|  | `map.filters.music` | Music | 음악 | Música |
|  | `map.categories.all` | All | 전체 | Todo |
|  | `map.categories.art` | Exhibitions | 전시 | Exposiciones |
|  | `map.categories.beauty` | Beauty | 뷰티 | Belleza |
|  | `map.categories.cafe` | Cafe | 카페 | Cafetería |
|  | `map.categories.etc` | Other | 기타 | Otros |
|  | `map.categories.fashion` | Fashion | 패션 | Moda |
|  | `map.categories.food` | Restaurants | 음식점 | Restaurantes |
|  | `map.categories.heritage` | Cultural heritage | 문화재 | Patrimonio cultural |
|  | `map.categories.music` | Music | 음악 | Música |
|  | `map.categories.popup` | Pop-ups | 팝업 | Pop-ups |
|  | `map.navigation.community` | Community | 커뮤니티 | Comunidad |
|  | `map.navigation.favorites` | Favorites | 즐겨찾기 | Favoritos |
|  | `map.navigation.map` | Map | 지도 | Mapa |
|  | `map.navigation.recommendations` | Recommendations | 장소추천 | Sugerencias |
|  | `map.navigation.reservations` | Reservations | 예약 | Reservas |
|  | `map.favorites.adjust` | Resize favorites panel | 즐겨찾기 패널 크기 조절 | Cambiar el tamaño del panel de favoritos |
|  | `map.favorites.emptyBody` | Tap the star on a place you like to save it. | 마음에 드는 장소의 별을 눌러 모아보세요. | Toca la estrella de un lugar que te guste para guardarlo. |
|  | `map.favorites.emptyTitle` | No saved places | 저장한 장소가 없어요 | No tienes lugares guardados |
| ● | `map.favorites.error` | Could not load places | 장소를 불러오지 못했어요 | No se pudieron cargar los lugares |
|  | `map.favorites.loadMore` | Show more | 더 보기 | Mostrar más |
| ● | `map.favorites.loadMoreError` | Could not load more places | 다음 장소를 불러오지 못했어요 | No se pudieron cargar más lugares |
| ● | `map.favorites.loadMoreLabel` | Load more saved places | 저장한 장소 더 불러오기 | Cargar más lugares guardados |
|  | `map.favorites.loading` | Loading saved places… | 저장한 장소를 불러오는 중이에요 | Cargando lugares guardados… |
|  | `map.favorites.remove` | Remove {{name}} from favorites | {{name}} 즐겨찾기 해제 | Quitar {{name}} de favoritos |
|  | `map.favorites.retry` | Try again | 다시 시도 | Reintentar |
|  | `map.favorites.sessionBody` | Sign in again to see your saved places. | 다시 로그인한 뒤 저장한 장소를 확인해 주세요. | Inicia sesión de nuevo para ver tus lugares guardados. |
|  | `map.favorites.sessionTitle` | Your session has expired | 로그인이 만료됐어요 | Tu sesión expiró |
|  | `map.favorites.title` | My places | 내 장소 | Mis lugares |
|  | `map.searchOverlay.categories` | Place categories | 장소 카테고리 | Categorías de lugares |
|  | `map.searchOverlay.clear` | Clear search | 검색어 지우기 | Borrar búsqueda |
|  | `map.searchOverlay.clearAll` | Clear all | 전체 삭제 | Borrar todo |
|  | `map.searchOverlay.close` | Close search | 검색 닫기 | Cerrar búsqueda |
|  | `map.searchOverlay.emptyBody` | Try a different search term. | 다른 검색어를 입력해 보세요. | Prueba con otro término de búsqueda. |
|  | `map.searchOverlay.emptyTitle` | No search results | 검색 결과가 없어요 | Sin resultados de búsqueda |
|  | `map.searchOverlay.externalResults` | Place search results | 장소 검색 결과 | Resultados de búsqueda de lugares |
|  | `map.searchOverlay.loading` | Searching for places… | 장소를 찾고 있어요 | Buscando lugares… |
|  | `map.searchOverlay.pingdomResults` | PingDom places | 핑덤 장소 | Lugares de PingDom |
|  | `map.searchOverlay.placeholder` | Search | 검색하기 | Buscar |
|  | `map.searchOverlay.recent` | Recent searches | 최근 검색 | Búsquedas recientes |
|  | `map.searchOverlay.recentClearAll` | Clear all recent searches | 최근 검색 전체 삭제 | Borrar todas las búsquedas recientes |
| ● | `map.searchOverlay.recentDelete` | Remove {{query}} from recent searches | {{query}} 최근 검색어 삭제 | Quitar {{query}} de las búsquedas recientes |
|  | `map.searchOverlay.recentLoading` | Loading recent searches | 최근 검색 불러오는 중 | Cargando búsquedas recientes |
|  | `map.searchOverlay.recentSearch` | Search for {{query}} | {{query}} 검색 | Buscar {{query}} |
|  | `map.searchOverlay.registrant` | Registered by {{name}} | 등록자 {{name}} | Registrado por {{name}} |
|  | `map.searchOverlay.registrantLoading` | Loading registrant | 등록자 확인 중 | Cargando quién lo registró |
|  | `map.searchOverlay.registrantMissing` | No registrant | 등록자 없음 | Sin registrante |
|  | `map.searchOverlay.recommendationEmpty` | No nearby recommendations yet | 주변 추천 장소가 아직 없어요 | Aún no hay sugerencias cerca |
| ● | `map.searchOverlay.recommendationError` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | No se pudieron cargar las sugerencias |
|  | `map.searchOverlay.recommendationLoading` | Loading recommendations… | 추천 장소를 불러오고 있어요 | Cargando sugerencias… |
|  | `map.searchOverlay.registeredDisabled` | PingDom place search is disabled. | 핑덤 장소 검색 기능이 비활성화되어 있어요. | La búsqueda de lugares de PingDom está desactivada. |
|  | `map.searchOverlay.registeredEmpty` | No registered PingDom places matched. | 서버에 등록된 핑덤 장소 검색 결과가 없어요. | Ningún lugar registrado en PingDom coincide. |
| ● | `map.searchOverlay.registeredError` | The PingDom place search failed. | 핑덤 장소 검색 요청에 실패했어요. | La búsqueda de lugares de PingDom falló. |
|  | `map.searchOverlay.registeredMock` | Development mock PingDom place results. | 개발 Mock 핑덤 장소 검색 결과예요. | Resultados Mock de desarrollo de lugares de PingDom. |
|  | `map.sheet.adjust` | Resize recommendations panel | 추천 패널 크기 조절 | Cambiar el tamaño del panel de sugerencias |
|  | `map.sheet.aroundMe` | Places near me | 내 주변 장소 | Lugares cerca de mí |
|  | `map.sheet.bookmark` | Save place | 즐겨찾기 | Guardar lugar |
|  | `map.sheet.bookmarkRemove` | Remove saved place | 즐겨찾기 해제 | Quitar lugar guardado |
| ● | `map.sheet.bookmarkSaveError` | Could not save this place | 장소를 저장하지 못했어요 | No se pudo guardar este lugar |
| ● | `map.sheet.bookmarkRemoveError` | Could not remove this saved place | 저장을 해제하지 못했어요 | No se pudo quitar este lugar guardado |
|  | `map.sheet.categoryPopular` | Popular {{userName}} picks by category | 카테고리별 {{userName}}님 주변 인기 장소들 | Lugares populares cerca de {{userName}} por categoría |
|  | `map.sheet.categoryPopularRegion` | Popular places in {{regionName}} by category | {{regionName}} 카테고리별 인기 장소 | Lugares populares en {{regionName}} por categoría |
|  | `map.sheet.categoryPopularNational` | Popular nationwide places by category | 전국 카테고리 인기 장소 | Lugares populares de todo el país por categoría |
|  | `map.sheet.distanceAway` | {{distance}} away | 여기서 {{distance}} | A {{distance}} |
|  | `map.sheet.image` | Place image | 장소 이미지 | Imagen del lugar |
| ● | `map.sheet.imageError` | Could not load image | 이미지를 불러오지 못했어요 | No se pudo cargar la imagen |
|  | `map.sheet.imageMissing` | No image | 이미지 없음 | Sin imagen |
|  | `map.sheet.localHotPlaces` | Local hot places | 우리 지역 핫플 | Populares cerca |
|  | `map.sheet.nationwideTrends` | Nationwide trends | 전국 트렌드 | Tendencias |
|  | `map.sheet.placeMissing` | Unnamed place | 장소명 없음 | Lugar sin nombre |
|  | `map.sheet.recommendationTitle` | Recommended for you | 나만을 위한 추천 장소 | Sugerencias para ti |
|  | `map.sheet.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | Resultados de «{{query}}» |
|  | `map.sheet.state.categoryEmptyTitle` | No places found in this category. | 이 카테고리에 해당하는 장소가 없어요 | No se encontraron lugares en esta categoría. |
|  | `map.sheet.state.disabledBody` | Sign in to view this list. | 로그인하면 이 목록을 확인할 수 있어요. | Inicia sesión para ver esta lista. |
|  | `map.sheet.state.disabledTitle` | This list is unavailable | 목록을 사용할 수 없어요 | Esta lista no está disponible |
|  | `map.sheet.state.emptyBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | Mueve el mapa para explorar otra zona. |
|  | `map.sheet.state.emptyTitle` | No hot places to show yet | 표시할 핫플이 아직 없어요 | Aún no hay lugares de moda para mostrar |
| ● | `map.sheet.state.errorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Inténtalo de nuevo en un momento. |
| ● | `map.sheet.state.errorTitle` | Could not load the list | 목록을 불러오지 못했어요 | No se pudo cargar la lista |
| ● | `map.sheet.state.forbiddenBody` | Your account cannot access this list. | 현재 계정으로 이 목록에 접근할 수 없어요. | Tu cuenta no puede acceder a esta lista. |
| ● | `map.sheet.state.forbiddenTitle` | Access is unavailable | 접근할 수 없어요 | Acceso no disponible |
|  | `map.sheet.state.invalid-locationBody` | Check your location and try again. | 위치 상태를 확인한 후 다시 시도해 주세요. | Revisa tu ubicación e inténtalo de nuevo. |
|  | `map.sheet.state.invalid-locationTitle` | Your location could not be used | 현재 위치를 사용할 수 없어요 | No se pudo usar tu ubicación |
|  | `map.sheet.state.invalid-periodBody` | Please try the supported weekly period again. | 지원되는 주간 기간으로 다시 시도해 주세요. | Inténtalo de nuevo con el periodo semanal compatible. |
|  | `map.sheet.state.invalid-periodTitle` | The trend period is unavailable | 트렌드 기간을 사용할 수 없어요 | El periodo de tendencias no está disponible |
| ● | `map.sheet.state.location-deniedBody` | Nationwide trends remain available without location access. | 위치 권한 없이도 전국 트렌드는 볼 수 있어요. | Las tendencias nacionales siguen disponibles sin acceso a la ubicación. |
| ● | `map.sheet.state.location-deniedTitle` | Allow location access to see local hot places | 지역 핫플을 보려면 위치 권한을 허용해 주세요 | Permite el acceso a la ubicación para ver lugares de moda locales |
|  | `map.sheet.state.location-pendingBody` | Nationwide trends are available while location is being prepared. | 위치를 확인하는 동안 전국 트렌드는 볼 수 있어요. | Las tendencias nacionales están disponibles mientras se prepara la ubicación. |
|  | `map.sheet.state.location-pendingTitle` | Checking your location… | 현재 위치를 확인하고 있어요 | Comprobando tu ubicación… |
|  | `map.sheet.state.loadingBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | Mueve el mapa para explorar otra zona. |
|  | `map.sheet.state.loadingTitle` | Finding nearby hot places… | 주변 핫플을 찾는 중이에요 | Buscando lugares de moda cerca… |
|  | `map.sheet.state.nationalEmptyBody` | Check back after the weekly trend data is updated. | 주간 트렌드 데이터가 갱신된 후 다시 확인해 주세요. | Vuelve cuando se actualicen los datos de tendencias semanales. |
|  | `map.sheet.state.nationalEmptyTitle` | No nationwide trends to show yet | 표시할 전국 트렌드가 아직 없어요 | Aún no hay tendencias nacionales para mostrar |
| ● | `map.sheet.state.nationalErrorBody` | Please try loading nationwide trends again in a moment. | 잠시 후 전국 트렌드를 다시 불러와 주세요. | Intenta cargar las tendencias nacionales de nuevo en un momento. |
| ● | `map.sheet.state.nationalErrorTitle` | Could not load nationwide trends | 전국 트렌드를 불러오지 못했어요 | No se pudieron cargar las tendencias nacionales |
|  | `map.sheet.state.nationalLoadingBody` | Loading the latest seven-day bookmark trend. | 최근 7일의 즐겨찾기 변화를 불러오고 있어요. | Cargando la tendencia de guardados de los últimos siete días. |
|  | `map.sheet.state.nationalLoadingTitle` | Loading nationwide trends… | 전국 트렌드를 불러오는 중이에요 | Cargando tendencias nacionales… |
|  | `map.sheet.state.region-not-foundBody` | Try again from another location. | 다른 위치에서 다시 시도해 주세요. | Inténtalo de nuevo desde otra ubicación. |
|  | `map.sheet.state.region-not-foundTitle` | We could not identify this area | 현재 지역을 판정하지 못했어요 | No pudimos identificar esta zona |
| ● | `map.sheet.state.region-resolution-failedBody` | The region lookup service did not respond. | 지역 판정 서비스가 응답하지 않았어요. | El servicio de búsqueda de regiones no respondió. |
| ● | `map.sheet.state.region-resolution-failedTitle` | Could not identify your area | 지역 판정에 실패했어요 | No se pudo identificar tu zona |
|  | `map.sheet.state.region-service-unavailableBody` | Please try again after the region service recovers. | 지역 서비스가 복구된 후 다시 시도해 주세요. | Inténtalo de nuevo cuando se recupere el servicio de regiones. |
|  | `map.sheet.state.region-service-unavailableTitle` | Local hot places are temporarily unavailable | 지역 핫플을 일시적으로 사용할 수 없어요 | Los lugares de moda locales no están disponibles temporalmente |
| ● | `map.sheet.state.unauthorizedBody` | Sign in again and retry. | 다시 로그인한 후 시도해 주세요. | Inicia sesión de nuevo y reintenta. |
| ● | `map.sheet.state.unauthorizedTitle` | Sign-in is required | 로그인이 필요해요 | Inicio de sesión necesario |
|  | `map.sheet.state.recommendationEmptyBody` | Change your location or recommendation radius and try again. | 위치나 추천 반경을 바꾼 뒤 다시 확인해 주세요. | Cambia tu ubicación o el radio de sugerencias e inténtalo de nuevo. |
|  | `map.sheet.state.recommendationEmptyTitle` | No recommendations match your current filters | 현재 조건에 맞는 추천 장소가 없어요 | Ninguna sugerencia coincide con tus filtros actuales |
| ● | `map.sheet.state.recommendationErrorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Inténtalo de nuevo en un momento. |
| ● | `map.sheet.state.recommendationErrorTitle` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | No se pudieron cargar las sugerencias |
|  | `map.sheet.state.recommendationLoadingBody` | Checking your location and travel context. | 현재 위치와 여행 맥락을 확인하고 있어요. | Comprobando tu ubicación y el contexto de tu viaje. |
|  | `map.sheet.state.recommendationLoadingTitle` | Loading recommendations for you… | 나만을 위한 추천 장소를 불러오고 있어요 | Cargando sugerencias para ti… |
|  | `map.detail.amenityEnglish` | English support | 영어응대 가능 | Atención en inglés |
|  | `map.detail.amenityParking` | Parking available | 주차가능 | Estacionamiento disponible |
|  | `map.detail.back` | Back to map | 지도로 돌아가기 | Volver al mapa |
|  | `map.detail.collapseTags` | Collapse additional tags | 추가 태그 접기 | Ocultar etiquetas adicionales |
|  | `map.detail.coupon` | Coupons | 쿠폰 | Cupones |
|  | `map.detail.description` | About this place | 장소 소개 | Sobre este lugar |
|  | `map.detail.events` | Current events | 진행 중 이벤트 | Eventos actuales |
|  | `map.detail.collapseReviews` | Hide reviews | 리뷰 접기 | Ocultar reseñas |
|  | `map.detail.viewAllReviews` | View all reviews | 리뷰 모두 보기 | Ver todas las reseñas |
|  | `map.detail.expandTags` | Show {{count}} hidden tags | 숨겨진 태그 {{count}}개 펼치기 | Mostrar {{count}} etiquetas ocultas |
|  | `map.detail.imageDetail` | View {{name}} photo {{count}} | {{name}} 사진 {{count}} 상세 보기 | Ver la foto {{count}} de {{name}} |
| ● | `map.detail.imageError` | Could not load photos. Try again | 사진을 불러오지 못했습니다. 다시 시도 | No se pudieron cargar las fotos. Reintentar |
|  | `map.detail.info` | Info | 정보 | Info |
| ● | `map.detail.notice` | Operating notice | 운영 공지 | Aviso de funcionamiento |
|  | `map.detail.imageViewer.close` | Close photo | 사진 닫기 | Cerrar foto |
|  | `map.detail.imageViewer.counter` | {{current}} / {{total}} | {{current}} / {{total}} | {{current}} / {{total}} |
|  | `map.detail.imageViewer.next` | Next photo | 다음 사진 | Foto siguiente |
|  | `map.detail.imageViewer.photo` | {{name}} photo {{current}} of {{total}} | {{name}} 사진 {{total}}장 중 {{current}}번째 | Foto {{current}} de {{total}} de {{name}} |
|  | `map.detail.imageViewer.previous` | Previous photo | 이전 사진 | Foto anterior |
|  | `map.detail.participantCount_one` | {{count}} participant | {{count}}명 참여 | {{count}} participante |
|  | `map.detail.participantCount_other` | {{count}} participants | {{count}}명 참여 | {{count}} participantes |
|  | `map.detail.photoReviews` | Photo reviews | 사진 리뷰 | Reseñas con fotos |
|  | `map.detail.preview` | View {{name}} details | {{name}} 상세 보기 | Ver detalles de {{name}} |
|  | `map.detail.reviewHighlights` | What visitors liked | 이런 점을 좋아해요! | Lo que gustó a los visitantes |
|  | `map.detail.reviewCount_one` | {{count}} review | 리뷰 {{count}}개 | {{count}} reseña |
|  | `map.detail.reviewCount_other` | {{count}} reviews | 리뷰 {{count}}개 | {{count}} reseñas |
|  | `map.detail.reviewEmpty` | No reviews yet. | 등록된 리뷰 정보가 없어요. | Aún no hay reseñas. |
| ● | `map.detail.reviewError` | Could not load reviews. Try again | 리뷰를 불러오지 못했습니다. 다시 시도 | No se pudieron cargar las reseñas. Reintentar |
|  | `map.detail.reviewLoading` | Loading reviews… | 리뷰를 불러오는 중입니다. | Cargando reseñas… |
|  | `map.detail.reviews` | Reviews | 리뷰 | Reseñas |
|  | `map.detail.verifiedCount_one` | {{count}} person verified this! | {{count}}명이 검증했어요! | ¡{{count}} persona lo verificó! |
|  | `map.detail.verifiedCount_other` | {{count}} people verified this! | {{count}}명이 검증했어요! | ¡{{count}} personas lo verificaron! |
| ● | `map.detail.reservation.authError` | Sign-in required | 로그인이 필요합니다 | Inicio de sesión necesario |
|  | `map.detail.reservation.available` | Reserve | 예약하기 | Reservar |
|  | `map.detail.reservation.empty` | No schedules are currently available | 현재 예약 가능한 일정이 없습니다 | No hay horarios disponibles por ahora |
| ● | `map.detail.reservation.error` | Could not load reservation availability | 예약 가능 여부를 불러오지 못했습니다 | No se pudo cargar la disponibilidad de reservas |
|  | `map.detail.reservation.full` | No reservation capacity is available | 예약 가능한 인원이 없습니다 | No queda capacidad para reservar |
|  | `map.detail.reservation.loading` | Checking reservation availability | 예약 가능 여부를 확인하고 있습니다 | Comprobando la disponibilidad de reservas |
|  | `map.detail.reservation.retry` | Try again | 다시 시도 | Reintentar |
|  | `map.locate` | My location | 내 위치 | Mi ubicación |
|  | `map.refreshing` | Refreshing map | 지도 새로고침 중 | Actualizando el mapa |
| ● | `map.location.deniedDescription` | The map is using a default area. Allow location access to show your position. | 기본 지역을 표시하고 있습니다. 현재 위치를 보려면 위치 권한을 허용해 주세요. | El mapa usa una zona predeterminada. Permite el acceso a la ubicación para mostrar tu posición. |
| ● | `map.location.deniedTitle` | Location access is off | 위치 권한이 꺼져 있습니다 | El acceso a la ubicación está desactivado |
| ● | `map.location.failedDescription` | The map is using a default area. Check location services and try again. | 기본 지역을 표시하고 있습니다. 위치 서비스를 확인한 후 다시 시도해 주세요. | El mapa usa una zona predeterminada. Revisa los servicios de ubicación e inténtalo de nuevo. |
| ● | `map.location.failedTitle` | Could not find your location | 현재 위치를 찾지 못했습니다 | No se pudo encontrar tu ubicación |
|  | `map.location.loading` | Finding your current location... | 현재 위치를 찾는 중입니다... | Buscando tu ubicación actual... |
|  | `map.location.openSettings` | Open settings | 설정 열기 | Abrir ajustes |
|  | `map.location.retry` | Check again | 다시 확인 | Comprobar de nuevo |
|  | `map.recommendations.subtitle` | Pingdom recommends places {{userName}} might like! | 핑덤이 {{userName}}님이 좋아할만한 장소를 추천해드려요! | ¡PingDom recomienda lugares que podrían gustarle a {{userName}}! |
|  | `map.recommendations.verificationTitle` | Verify today and get a coupon! | 오늘 검증하고 쿠폰 받자! | ¡Verifica hoy y obtén un cupón! |
|  | `map.recommendations.reasons.activeBenefit` | A benefit is currently available here | 현재 이용할 수 있는 혜택이 있어요 | Aquí hay un beneficio disponible ahora |
|  | `map.recommendations.reasons.benefitAndReservable` | A place with an available benefit and booking | 혜택을 받고 바로 예약할 수 있어요 | Un lugar con beneficio disponible y reserva |
|  | `map.recommendations.reasons.contextMatch` | Matches your current travel plans | 현재 여행 목적과 잘 맞는 장소예요 | Coincide con tus planes de viaje actuales |
|  | `map.recommendations.reasons.exploration` | A recommendation for discovering somewhere new | 새로운 장소를 발견할 수 있는 추천이에요 | Una sugerencia para descubrir un sitio nuevo |
|  | `map.recommendations.reasons.freshContent` | Recently updated with new information | 최근 새로운 정보가 추가됐어요 | Actualizado recientemente con información nueva |
|  | `map.recommendations.reasons.highConversion` | Often leads to real visits | 실제 방문으로 자주 이어지는 장소예요 | Suele terminar en visitas reales |
|  | `map.recommendations.reasons.highEngagement` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | Un lugar que recibe mucho interés |
|  | `map.recommendations.reasons.nearby` | Close to your current location | 현재 위치에서 가까운 장소예요 | Cerca de tu ubicación actual |
|  | `map.recommendations.reasons.neutral` | Recommended place | 추천 장소 | Lugar recomendado |
|  | `map.recommendations.reasons.personalSignal` | Matches your interests and activity | 관심사와 반응에 잘 맞는 장소예요 | Coincide con tus intereses y tu actividad |
|  | `map.recommendations.reasons.qualitySignal` | Has reliable place information | 신뢰도 높은 장소 정보가 있어요 | Tiene información fiable del lugar |
|  | `map.recommendations.reasons.reservable` | Currently available to book | 현재 예약할 수 있는 장소예요 | Disponible para reservar ahora |
|  | `map.recommendations.explanations.fallback` | A place worth exploring | 둘러볼 만한 추천 장소예요 | Un lugar que vale la pena explorar |
|  | `map.recommendations.explanations.fresh` | A place receiving new attention | 최근 새롭게 주목받는 장소예요 | Un lugar que está recibiendo nueva atención |
|  | `map.recommendations.explanations.geo` | Close to your current location | 현재 위치에서 가까운 장소예요 | Cerca de tu ubicación actual |
|  | `map.recommendations.explanations.personal` | Reflects your interests and activity | 관심사와 반응을 반영한 추천이에요 | Refleja tus intereses y tu actividad |
|  | `map.recommendations.explanations.popular` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | Un lugar que recibe mucho interés |
|  | `map.recommendations.context.activity.attendEvent` | Events | 이벤트 참여 | Eventos |
|  | `map.recommendations.context.activity.cafe` | Cafe visit | 카페 방문 | Visita a una cafetería |
|  | `map.recommendations.context.activity.eat` | Food | 식사 | Comida |
|  | `map.recommendations.context.activity.explore` | Explore | 주변 탐색 | Explorar |
|  | `map.recommendations.context.activity.nightlife` | Nightlife | 나이트라이프 | Vida nocturna |
|  | `map.recommendations.context.activity.shop` | Shopping | 쇼핑 | Compras |
|  | `map.recommendations.context.purpose.beauty` | Beauty | 뷰티 | Belleza |
|  | `map.recommendations.context.purpose.cafe` | Cafe | 카페 | Cafetería |
|  | `map.recommendations.context.purpose.exhibition` | Exhibitions | 전시 | Exposiciones |
|  | `map.recommendations.context.purpose.fashion` | Fashion | 패션 | Moda |
|  | `map.recommendations.context.purpose.food` | Food | 맛집 | Comida |
|  | `map.recommendations.context.purpose.kPop` | K-POP | K-POP | K-POP |
|  | `map.recommendations.context.purpose.nightlife` | Nightlife | 나이트라이프 | Vida nocturna |
|  | `map.recommendations.context.purpose.other` | Other | 기타 | Otros |
|  | `map.recommendations.context.purpose.popUp` | Pop-ups | 팝업 | Pop-ups |
|  | `map.recommendations.limits.candidatePool` | The candidate pool was expanded because few places matched. | 조건에 맞는 장소가 적어 후보 범위를 넓혀 추천했어요. | Se amplió el grupo de candidatos porque pocos lugares coincidían. |
|  | `map.recommendations.limits.interactedExcluded` | Places you already viewed were excluded. | 이미 확인한 장소를 제외해 추천했어요. | Se excluyeron los lugares que ya viste. |
|  | `map.recommendations.limits.operatingPriority` | Places currently operating were prioritized. | 현재 운영 중인 장소를 우선해 추천했어요. | Se dio prioridad a los lugares que están funcionando ahora. |
|  | `map.recommendations.limits.radiusExpanded` | The search radius was expanded to find recommendations. | 추천 결과를 찾기 위해 검색 반경을 넓혔어요. | Se amplió el radio de búsqueda para encontrar sugerencias. |
|  | `map.recommendations.limits.requestClamped` | The recommendation count was adjusted to the server limit. | 서버 기준에 맞춰 추천 개수를 조정했어요. | La cantidad de sugerencias se ajustó al límite del servidor. |
| ● | `map.search.accessibilityLabel` | Search places on the map | 지도 장소 검색 | Buscar lugares en el mapa |
|  | `map.search.confirm` | OK | 확인 | Aceptar |
|  | `map.search.empty` | No search results | 검색 결과가 없습니다 | Sin resultados de búsqueda |
| ● | `map.search.failed` | Address search failed | 주소 검색에 실패했습니다 | La búsqueda de direcciones falló |
|  | `map.search.placeholder` | Search places | 장소를 검색하세요 | Buscar lugares |
| ● | `map.search.profileAccessibilityLabel` | Open my page | 마이페이지 열기 | Abrir mi página |
|  | `map.search.statusPlaceholder` | Enter an address... | 주소를 입력하세요... | Escribe una dirección... |
|  | `map.title` | Nearby map | 주변 지도 | Mapa de la zona |
|  | `map.visibleCenter` | {{lat}}, {{lng}} | {{lat}}, {{lng}} | {{lat}}, {{lng}} |
|  | `map.decision.placesLiveNearby_many` | — | — | {{count}} lugares activos cerca |
|  | `map.detail.participantCount_many` | — | — | {{count}} participantes |
|  | `map.detail.reviewCount_many` | — | — | {{count}} reseñas |
|  | `map.detail.verifiedCount_many` | — | — | ¡{{count}} personas lo verificaron! |

## `notificationSettings`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `notificationSettings.back` | Back | 뒤로가기 | Atrás |
|  | `notificationSettings.contract.categories` | Server notification preferences | 서버 알림 수신 설정 | Preferencias de notificaciones del servidor |
|  | `notificationSettings.contract.newHotplaceEnabled` | Hot place notifications | 핫플레이스 알림 | Notificaciones de lugares de moda |
|  | `notificationSettings.contract.newLikeEnabled` | Like notifications | 좋아요 알림 | Notificaciones de me gusta |
| ● | `notificationSettings.contract.categoryHint` | Saved to your account. Enabling checks device notification permission. | 계정에 저장됩니다. 켤 때 기기의 알림 권한을 확인합니다. | Se guarda en tu cuenta. Al activarla se comprueba el permiso de notificaciones del dispositivo. |
|  | `notificationSettings.contract.allUnsupported` | Unavailable: no allow-all policy exists. Device permission and category preferences are separate. | 미지원: 전체 허용 정책이 없습니다. 기기 권한과 항목별 수신 설정은 별개입니다. | No disponible: no existe una política para permitir todo. El permiso del dispositivo y las preferencias por categoría son independientes. |
|  | `notificationSettings.contract.unsupported` | Unavailable: this category has no confirmed server setting. | 미지원: 이 항목에 대응하는 서버 설정이 확정되지 않았습니다. | No disponible: esta categoría no tiene un ajuste del servidor confirmado. |
|  | `notificationSettings.contract.nightUnsupported` | Unavailable: receiving notifications at night is not the same as quiet hours. | 미지원: 야간 알림 수신 허용은 방해 금지 시간과 같은 설정이 아닙니다. | No disponible: recibir notificaciones de noche no es lo mismo que el horario de silencio. |
|  | `notificationSettings.contract.unknown` | The server has not provided a valid setting. This item cannot be changed. | 서버에서 올바른 설정값을 제공하지 않아 변경할 수 없습니다. | El servidor no proporcionó un ajuste válido. Este elemento no se puede cambiar. |
|  | `notificationSettings.contract.quietHours` | Quiet hours | 방해 금지 시간 | Horario de silencio |
|  | `notificationSettings.contract.quietReadOnly` | Read only: time validation and editing policy are not confirmed. No default schedule is saved. | 읽기 전용: 시간 검증과 편집 정책이 확정되지 않았습니다. 기본 시간을 임의로 저장하지 않습니다. | Solo lectura: la validación de horas y la política de edición no están confirmadas. No se guarda ningún horario predeterminado. |
|  | `notificationSettings.contract.quietIncomplete` | Time or timezone information is missing or invalid. | 시간 또는 시간대 정보가 없거나 올바르지 않습니다. | Falta la información de hora o de zona horaria, o no es válida. |
|  | `notificationSettings.contract.invalidQuietHours` | Please check the quiet hours settings on the server. | 서버의 방해 금지 시간 설정을 확인해 주세요. | Revisa los ajustes del horario de silencio en el servidor. |
| ● | `notificationSettings.contract.unauthorized` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | Tu sesión expiró. Inicia sesión de nuevo. |
| ● | `notificationSettings.contract.forbidden` | You do not have permission to access notification settings. | 알림 설정에 접근할 권한이 없습니다. | No tienes permiso para acceder a los ajustes de notificaciones. |
| ● | `notificationSettings.contract.saveFailed` | Could not update notification settings. Please try again. | 알림 설정을 변경하지 못했습니다. 다시 시도해 주세요. | No se pudieron actualizar los ajustes de notificaciones. Inténtalo de nuevo. |
| ● | `notificationSettings.permission.title` | Device notification permission | 기기 알림 권한 | Permiso de notificaciones del dispositivo |
| ● | `notificationSettings.permission.description` | Device permission and account preferences are separate. Change device permission in system settings. | 기기 권한과 계정의 수신 설정은 별개입니다. 기기 권한은 시스템 설정에서 변경할 수 있습니다. | El permiso del dispositivo y las preferencias de la cuenta son independientes. Cambia el permiso del dispositivo en los ajustes del sistema. |
| ● | `notificationSettings.permission.loading` | Checking device permission | 기기 권한 확인 중 | Comprobando el permiso del dispositivo |
| ● | `notificationSettings.permission.authorized` | Notifications allowed | 알림 허용 | Notificaciones permitidas |
| ● | `notificationSettings.permission.provisional` | Quiet notifications allowed | 조용한 알림 허용 | Notificaciones silenciosas permitidas |
| ● | `notificationSettings.permission.notDetermined` | Permission has not been requested. Enabling a category will request it. | 아직 권한을 요청하지 않았습니다. 알림 항목을 켤 때 요청합니다. | Aún no se ha solicitado el permiso. Se pedirá al activar una categoría. |
| ● | `notificationSettings.permission.denied` | Notification permission denied. Allow notifications in device settings to enable this category. | 알림 권한이 거부되었습니다. 이 항목을 켜려면 기기 설정에서 알림을 허용해 주세요. | Permiso de notificaciones denegado. Permite las notificaciones en los ajustes del dispositivo para activar esta categoría. |
| ● | `notificationSettings.permission.blocked` | Notification permission blocked. Please allow it in device settings. | 알림 권한이 차단되었습니다. 기기 설정에서 허용해 주세요. | Permiso de notificaciones bloqueado. Permítelo en los ajustes del dispositivo. |
| ● | `notificationSettings.permission.unavailable` | Native notification support is unavailable in this environment. | 현재 환경에서는 네이티브 알림 기능을 사용할 수 없습니다. | Las notificaciones nativas no están disponibles en este entorno. |
| ● | `notificationSettings.permission.error` | Could not check or request notification permission. Please try again. | 알림 권한 확인 또는 요청 중 오류가 발생했습니다. 다시 시도해 주세요. | No se pudo comprobar ni solicitar el permiso de notificaciones. Inténtalo de nuevo. |
| ● | `notificationSettings.permission.openSettings` | Open device notification settings | 기기 알림 설정 열기 | Abrir los ajustes de notificaciones del dispositivo |
| ● | `notificationSettings.error` | Could not load notification settings. | 알림 설정을 불러오지 못했어요. | No se pudieron cargar los ajustes de notificaciones. |
|  | `notificationSettings.loading` | Loading notification settings | 알림 설정을 불러오는 중 | Cargando los ajustes de notificaciones |
|  | `notificationSettings.retry` | Try again | 다시 시도 | Reintentar |
|  | `notificationSettings.sections.interests` | Saved places & areas | 관심 장소 · 구역 | Lugares y zonas guardados |
|  | `notificationSettings.sections.other` | Other | 기타 | Otros |
|  | `notificationSettings.sections.records` | My records & places | 내 기록 · 장소 | Mis registros y lugares |
|  | `notificationSettings.sections.reports` | Reports | 리포트 | Informes |
|  | `notificationSettings.settings.favoriteMoodChange.description` | When recent tags and record trends change | 최근 태그와 기록 추세가 바뀌었을 때 | Cuando cambian las etiquetas recientes y las tendencias de registros |
|  | `notificationSettings.settings.favoriteMoodChange.label` | Changes around a saved place | 관심 장소 분위기 변화 | Cambios en torno a un lugar guardado |
|  | `notificationSettings.settings.firstRecordTrending.description` | Get notified when a place you First Recorded starts trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | Recibe un aviso cuando un lugar que registraste primero (First Recorder) empiece a ser tendencia |
|  | `notificationSettings.settings.firstRecordTrending.label` | A place I recorded first is trending | 내가 먼저 기록한 장소 급상승 | Un lugar que registré primero es tendencia |
|  | `notificationSettings.settings.frequentAreaHotPlace.description` | When a new trending place appears in an area you frequent | 내 생활권에 새로 뜨는 장소가 생기면 | Cuando aparece un nuevo lugar en tendencia en una zona que frecuentas |
|  | `notificationSettings.settings.frequentAreaHotPlace.label` | New hot place in a frequent area | 자주 가는 구역 새 핫플 | Nuevo lugar de moda en una zona frecuente |
|  | `notificationSettings.settings.marketingEvents.label` | Marketing & event updates | 마케팅 · 이벤트 정보 | Novedades de marketing y eventos |
|  | `notificationSettings.settings.nightNotifications.description` | Allow notifications between 21:00 and 08:00 | 21:00 – 08:00 사이 알림 허용 | Permitir notificaciones entre las 21:00 y las 08:00 |
|  | `notificationSettings.settings.nightNotifications.label` | Receive notifications at night | 야간 알림 받기 | Recibir notificaciones de noche |
|  | `notificationSettings.settings.pushAll.description` | Turning this off disables all notifications below | 끄면 아래 알림이 모두 발송되지 않아요 | Al desactivarlo se desactivan todas las notificaciones de abajo |
|  | `notificationSettings.settings.pushAll.label` | Allow all push notifications | 푸시 알림 전체 허용 | Permitir todas las notificaciones push |
|  | `notificationSettings.settings.recordNewTags.description` | When the status of a place you recorded changes | 내가 남긴 장소의 상태가 바뀔 때 | Cuando cambia el estado de un lugar que registraste |
|  | `notificationSettings.settings.recordNewTags.label` | New tags added to my recorded place | 내 기록 장소에 새 태그 누적 | Nuevas etiquetas en un lugar que registré |
|  | `notificationSettings.settings.todayMissionArea.label` | Today’s mission area | 오늘의 미션 구역 | Zona de la misión de hoy |
|  | `notificationSettings.settings.weeklyReport.description` | A weekly summary of this week’s discoveries and your records | 이번 주 발자국과 내 기록을 정리해 보내드려요 | Un resumen semanal de los descubrimientos de la semana y de tus registros |
|  | `notificationSettings.settings.weeklyReport.label` | Weekly report | 주간 리포트 | Informe semanal |
|  | `notificationSettings.title` | Notification settings | 알림 설정 | Ajustes de notificaciones |

## `offer`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `offer.cta.ended` | Offer ended | 종료된 혜택 | Oferta finalizada |
|  | `offer.cta.issue` | Get coupon | 쿠폰 받기 | Obtener cupón |
|  | `offer.cta.notStarted` | Not started yet | 아직 시작 전 | Aún no comienza |
|  | `offer.cta.soldOut` | All claimed | 수량 모두 소진 | Agotado |
|  | `offer.cta.unavailable` | Cannot be claimed | 받을 수 없는 혜택 | No se puede obtener |
|  | `offer.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 여행 일정이 있는 계정 | Cuentas con un viaje activo |
|  | `offer.eligibility.PUBLIC` | Anyone | 누구나 | Cualquier persona |
|  | `offer.eligibility.UNKNOWN` | Conditions need review | 조건 확인 필요 | Condiciones por confirmar |
|  | `offer.expiry.ISSUE_PLUS_DAYS` | Valid for a set number of days after issue | 발급일로부터 정해진 기간 | Válido durante un número fijo de días tras la emisión |
|  | `offer.expiry.ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END` | Valid for a set number of days after issue, up to the offer end date | 발급일로부터 정해진 기간, 혜택 종료일까지 | Válido durante un número fijo de días tras la emisión, hasta la fecha de fin de la oferta |
|  | `offer.expiry.OFFER_END` | Valid until the offer ends | 혜택 종료일까지 | Válido hasta que termine la oferta |
|  | `offer.expiry.UNKNOWN` | Validity needs review | 유효 기간 확인 필요 | Vigencia por confirmar |
|  | `offer.inventory.LIMITED` | Limited quantity | 수량 한정 | Cantidad limitada |
|  | `offer.inventory.UNKNOWN` | Quantity needs review | 수량 확인 필요 | Cantidad por confirmar |
|  | `offer.inventory.UNLIMITED` | No quantity limit | 수량 제한 없음 | Sin límite de cantidad |
|  | `offer.remaining.limited_one` | {{count}} left | {{count}}개 남음 | Queda {{count}} |
|  | `offer.remaining.limited_other` | {{count}} left | {{count}}개 남음 | Quedan {{count}} |
|  | `offer.remaining.unknown` | Remaining quantity not provided | 남은 수량 미제공 | Cantidad restante no disponible |
|  | `offer.remaining.unlimited` | No quantity limit | 수량 제한 없음 | Sin límite de cantidad |
|  | `offer.statuses.CLOSED` | Closed | 종료됨 | Finalizada |
|  | `offer.statuses.DRAFT` | Draft | 작성 중 | Borrador |
|  | `offer.statuses.PUBLISHED` | Available | 받을 수 있음 | Disponible |
|  | `offer.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | Estado por confirmar |
|  | `offer.remaining.limited_many` | — | — | Quedan {{count}} |

## `payment`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `payment.statuses.FAILED` | Payment failed | 결제 실패 | Pago fallido |
|  | `payment.statuses.PAID` | Paid | 결제 완료 | Pagado |
|  | `payment.statuses.PROCESSING` | Payment in progress | 결제 진행 중 | Pago en curso |
|  | `payment.statuses.REFUNDED` | Refunded | 환불 완료 | Reembolsado |
|  | `payment.statuses.REFUND_PROCESSING` | Refund in progress | 환불 진행 중 | Reembolso en curso |
|  | `payment.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | Estado por confirmar |

## `myPage`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `myPage.back` | Back | 뒤로가기 | Atrás |
|  | `myPage.couponBox.empty` | You have no coupons yet | 보유한 쿠폰이 없어요 | Aún no tienes cupones |
|  | `myPage.couponBox.emptyFiltered` | You have no {{status}} coupons | {{status}} 쿠폰이 없어요 | No tienes cupones en estado: {{status}} |
| ● | `myPage.couponBox.error` | Could not load your coupons. | 쿠폰을 불러오지 못했어요. | No se pudieron cargar tus cupones. |
|  | `myPage.couponBox.fallbackDescription` | Discount coupon | 할인 쿠폰 | Cupón de descuento |
|  | `myPage.couponBox.fallbackTitle` | Coupon | 쿠폰 | Cupón |
|  | `myPage.couponBox.filters.ALL` | All | 전체 | Todos |
|  | `myPage.couponBox.filters.EXPIRED` | Expired | 만료 | Vencidos |
|  | `myPage.couponBox.filters.ISSUED` | Available | 사용 가능 | Disponibles |
|  | `myPage.couponBox.filters.REDEEMED` | Used | 사용 완료 | Usados |
|  | `myPage.couponBox.loading` | Loading coupons | 쿠폰을 불러오는 중 | Cargando cupones |
| ● | `myPage.couponBox.nextPageError` | Could not load more coupons. | 쿠폰을 더 불러오지 못했어요. | No se pudieron cargar más cupones. |
|  | `myPage.couponBox.nextPageRetry` | Load more | 더 불러오기 | Cargar más |
|  | `myPage.couponBox.status.CANCELED` | Canceled | 취소됨 | Cancelado |
|  | `myPage.couponBox.status.EXPIRED` | Expired | 만료 | Vencido |
|  | `myPage.couponBox.status.ISSUED` | Available | 사용 가능 | Disponible |
|  | `myPage.couponBox.status.REDEEMED` | Used | 사용 완료 | Usado |
|  | `myPage.couponBox.status.UNKNOWN` | Unavailable | 사용 불가 | No disponible |
|  | `myPage.couponBox.title` | Coupon box | 쿠폰함 | Mis cupones |
| ● | `myPage.couponDetail.codeA11yLabel` | Coupon code ending in {{tail}} | 쿠폰 코드, 끝 네 자리 {{tail}} | Código del cupón terminado en {{tail}} |
| ● | `myPage.couponDetail.error` | Could not load this coupon. | 쿠폰 정보를 불러오지 못했어요. | No se pudo cargar este cupón. |
|  | `myPage.couponDetail.infoHeading` | Coupon info | 쿠폰 정보 | Información del cupón |
|  | `myPage.couponDetail.loading` | Loading coupon | 쿠폰 정보를 불러오는 중 | Cargando cupón |
| ● | `myPage.couponDetail.noticeHeading` | Notice | 유의사항 | Aviso |
| ● | `myPage.couponDetail.qrHint` | Show this QR code to a store staff member before paying | 결제 전 매장 직원에게 QR 코드를 보여주세요 | Muestra este código QR al personal del local antes de pagar |
|  | `myPage.couponDetail.qrUnavailable` | Could not draw the QR code. Please read the code above to the staff. | QR 코드를 표시하지 못했어요. 위 코드를 직원에게 알려주세요. | No se pudo mostrar el código QR. Dile al personal el código de arriba. |
| ● | `myPage.couponDetail.notices.0` | Each account can use this coupon only once. | 쿠폰은 계정당 1회만 사용할 수 있어요. | Cada cuenta puede usar este cupón una sola vez. |
| ● | `myPage.couponDetail.notices.1` | The coupon disappears automatically once it expires. | 유효기간이 지나면 쿠폰이 자동으로 사라져요. | El cupón desaparece automáticamente cuando vence. |
| ● | `myPage.couponDetail.notices.2` | It cannot be combined with other coupons or discounts. | 다른 쿠폰 및 할인 혜택과 중복 사용은 불가해요. | No se puede combinar con otros cupones ni descuentos. |
| ● | `myPage.couponDetail.notices.3` | Cancelling the reservation restores the coupon automatically. | 예약을 취소하면 쿠폰이 자동으로 복구돼요. | Al cancelar la reserva, el cupón se restaura automáticamente. |
| ● | `myPage.couponDetail.expiredNotice` | This coupon expired on {{date}} | {{date}}에 만료된 쿠폰이에요 | Este cupón venció el {{date}} |
| ● | `myPage.couponDetail.redeemedNotice` | This coupon was used on {{date}} | {{date}}에 사용한 쿠폰이에요 | Este cupón se usó el {{date}} |
| ● | `myPage.couponDetail.redeemedNoticeUnknown` | This coupon has already been used | 이미 사용한 쿠폰이에요 | Este cupón ya se usó |
|  | `myPage.couponDetail.reserve` | Make a reservation | 예약하러 가기 | Hacer una reserva |
|  | `myPage.couponDetail.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 진행 중인 여행 일정이 있는 계정 | Cuentas con un viaje activo |
|  | `myPage.couponDetail.eligibility.PUBLIC` | Anyone | 누구나 | Cualquier persona |
|  | `myPage.couponDetail.rows.eligibility` | Who can use | 발급 대상 | Quién puede usarlo |
|  | `myPage.couponDetail.rows.period` | Offer period | 행사 기간 | Periodo de la oferta |
|  | `myPage.couponDetail.rows.stores` | Where to use | 사용 가능 매장 | Dónde usarlo |
|  | `myPage.couponDetail.rows.usage` | How to use | 사용처 | Cómo usarlo |
|  | `myPage.couponDetail.rows.validity` | Valid for | 사용 가능 기간 | Vigencia |
|  | `myPage.couponDetail.validityDays_one` | {{count}} day after issue | 발급 후 {{count}}일 | {{count}} día tras la emisión |
|  | `myPage.couponDetail.validityDays_other` | {{count}} days after issue | 발급 후 {{count}}일 | {{count}} días tras la emisión |
|  | `myPage.couponDetail.title` | Coupon detail | 쿠폰상세 | Detalle del cupón |
|  | `myPage.couponDetail.unavailable` | This coupon has been used or has expired | 이미 사용했거나 만료된 쿠폰이에요 | Este cupón ya se usó o venció |
| ● | `myPage.profileEdit.avatarCameraPermissionDenied` | Camera access is required to take a profile photo. You can allow it in Settings. | 프로필 사진을 촬영하려면 카메라 접근 권한이 필요합니다. 설정에서 허용해주세요. | Se necesita acceso a la cámara para tomar una foto de perfil. Puedes permitirlo en Ajustes. |
|  | `myPage.profileEdit.avatarCancel` | Cancel | 취소 | Cancelar |
| ● | `myPage.profileEdit.avatarChangeFailed` | Could not change the profile image. Please try again. | 프로필 이미지를 변경하지 못했습니다. 다시 시도해주세요. | No se pudo cambiar la imagen de perfil. Inténtalo de nuevo. |
|  | `myPage.profileEdit.avatarFileTooLarge` | This image is too large. Please choose a smaller one. | 이미지 용량이 너무 큽니다. 더 작은 이미지를 선택해주세요. | Esta imagen es demasiado grande. Elige una más pequeña. |
|  | `myPage.profileEdit.avatarFromCamera` | Take a photo | 사진 촬영 | Tomar una foto |
|  | `myPage.profileEdit.avatarFromLibrary` | Choose from library | 앨범에서 선택 | Elegir de la fototeca |
|  | `myPage.profileEdit.avatarOpenSettings` | Open settings | 설정 열기 | Abrir ajustes |
| ● | `myPage.profileEdit.avatarPermissionDenied` | Photo library access is required to change your profile image. You can allow it in Settings. | 프로필 이미지를 변경하려면 사진 접근 권한이 필요합니다. 설정에서 허용해주세요. | Se necesita acceso a la fototeca para cambiar tu imagen de perfil. Puedes permitirlo en Ajustes. |
|  | `myPage.profileEdit.avatarRetry` | Try again | 다시 시도 | Reintentar |
|  | `myPage.profileEdit.avatarSheetTitle` | Change profile photo | 프로필 사진 변경 | Cambiar foto de perfil |
|  | `myPage.profileEdit.avatarTypeUnsupported` | Only JPEG or PNG images can be used as a profile image. | JPEG 또는 PNG 이미지만 프로필 이미지로 사용할 수 있습니다. | Solo se pueden usar imágenes JPEG o PNG como imagen de perfil. |
|  | `myPage.profileEdit.avatarUploading` | Uploading profile image | 프로필 이미지 업로드 중 | Subiendo la imagen de perfil |
|  | `myPage.profileEdit.changeAvatar` | Change profile image | 프로필 이미지 변경 | Cambiar imagen de perfil |
|  | `myPage.profileEdit.confirmPassword` | Confirm new password | 새 비밀번호 확인 | Confirmar nueva contraseña |
|  | `myPage.profileEdit.confirmPasswordPlaceholder` | Re-enter the new password | 새 비밀번호를 다시 입력하세요 | Vuelve a escribir la nueva contraseña |
|  | `myPage.profileEdit.currentPassword` | Current password | 현재 비밀번호 | Contraseña actual |
|  | `myPage.profileEdit.currentPasswordInvalid` | Your current password is incorrect | 현재 비밀번호가 올바르지 않습니다 | Tu contraseña actual es incorrecta |
|  | `myPage.profileEdit.currentPasswordPlaceholder` | Enter your current password | 현재 비밀번호를 입력하세요 | Escribe tu contraseña actual |
|  | `myPage.profileEdit.currentPasswordRequired` | Enter your current password to set a new one | 비밀번호를 변경하려면 현재 비밀번호를 입력하세요 | Escribe tu contraseña actual para establecer una nueva |
|  | `myPage.profileEdit.hidePassword` | Hide {{field}} | {{field}} 숨기기 | Ocultar {{field}} |
|  | `myPage.profileEdit.infoTitle` | Edit info | 정보 수정 | Editar información |
|  | `myPage.profileEdit.newPassword` | New password | 새 비밀번호 | Nueva contraseña |
|  | `myPage.profileEdit.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | Al menos 8 caracteres |
| ● | `myPage.profileEdit.passwordChangeFailed` | Could not change the password. | 비밀번호를 변경하지 못했습니다. | No se pudo cambiar la contraseña. |
|  | `myPage.profileEdit.passwordChangePartialFailure` | The username was changed, but the password was not. {{reason}} | 아이디는 변경했지만 비밀번호는 변경하지 못했습니다. {{reason}} | El nombre de usuario se cambió, pero la contraseña no. {{reason}} |
|  | `myPage.profileEdit.passwordMismatch` | The new passwords do not match | 새 비밀번호가 서로 다릅니다 | Las nuevas contraseñas no coinciden |
|  | `myPage.profileEdit.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | La contraseña debe tener al menos 8 caracteres |
|  | `myPage.profileEdit.save` | Save changes | 변경 사항 저장하기 | Guardar cambios |
|  | `myPage.profileEdit.saving` | Saving... | 저장 중... | Guardando... |
|  | `myPage.profileEdit.showPassword` | Show {{field}} | {{field}} 보기 | Mostrar {{field}} |
|  | `myPage.profileEdit.title` | Edit profile | 프로필 편집 | Editar perfil |
|  | `myPage.profileEdit.username` | Username | 아이디 | Nombre de usuario |
| ● | `myPage.profileEdit.usernameChangeFailed` | Could not change the username. | 아이디를 변경하지 못했습니다. | No se pudo cambiar el nombre de usuario. |
|  | `myPage.profileEdit.usernameLengthInvalid` | Username must be between 4 and 50 characters. | 아이디는 4자 이상 50자 이하여야 합니다. | El nombre de usuario debe tener entre 4 y 50 caracteres. |
|  | `myPage.profileEdit.usernameRequired` | Enter a username. | 아이디를 입력해주세요. | Escribe un nombre de usuario. |
| ● | `myPage.profileError` | Could not load your profile. | 프로필을 불러오지 못했어요. | No se pudo cargar tu perfil. |
|  | `myPage.profileLoading` | Loading your profile | 프로필을 불러오는 중 | Cargando tu perfil |
|  | `myPage.profileUnavailable` | Profile unavailable | 프로필 정보 없음 | Perfil no disponible |
|  | `myPage.retry` | Try again | 다시 시도 | Reintentar |
|  | `myPage.settings` | Settings | 설정 | Ajustes |
|  | `myPage.stats.coupons` | Coupons | 쿠폰 | Cupones |
|  | `myPage.stats.reservations` | Reservations | 예약 | Reservas |
|  | `myPage.stats.reviews` | Reviews | 리뷰 | Reseñas |
|  | `myPage.title` | My page | 마이 페이지 | Mi página |
| ● | `myPage.travel.error` | Could not load your travel schedule. | 여행 일정을 불러오지 못했어요. | No se pudo cargar tu itinerario de viaje. |
|  | `myPage.travel.loading` | Loading your travel schedule | 여행 일정을 불러오는 중 | Cargando tu itinerario de viaje |
|  | `myPage.travel.nextMonth` | Next month | 다음 달 | Mes siguiente |
|  | `myPage.travel.notEditable` | This travel schedule can no longer be edited. | 이 여행 일정은 더 이상 변경할 수 없어요. | Este itinerario de viaje ya no se puede editar. |
|  | `myPage.travel.periodOverlap` | These dates overlap another travel schedule. | 다른 여행 일정과 기간이 겹쳐요. | Estas fechas se superponen con otro itinerario de viaje. |
|  | `myPage.travel.previousMonth` | Previous month | 이전 달 | Mes anterior |
|  | `myPage.travel.saving` | Saving dates... | 날짜 저장 중... | Guardando fechas... |
|  | `myPage.travel.startDateInPast` | Choose today or a future date. | 오늘 또는 이후 날짜를 선택해주세요. | Elige hoy o una fecha futura. |
|  | `myPage.travel.title` | My trips | 나의 여행 | Mis viajes |
| ● | `myPage.travel.updateError` | Could not save your travel dates. | 여행 날짜를 저장하지 못했어요. | No se pudieron guardar tus fechas de viaje. |
|  | `myPage.travel.weekdays.sun` | S | S | D |
|  | `myPage.travel.weekdays.mon` | M | M | L |
|  | `myPage.travel.weekdays.tue` | T | T | M |
|  | `myPage.travel.weekdays.wed` | W | W | M |
|  | `myPage.travel.weekdays.thu` | T | T | J |
|  | `myPage.travel.weekdays.fri` | F | F | V |
|  | `myPage.travel.weekdays.sat` | S | S | S |
|  | `myPage.verifiedPlaces.empty` | No verified places yet | 아직 검증한 장소가 없어요 | Aún no hay lugares verificados |
| ● | `myPage.verifiedPlaces.error` | Could not load your verified places. | 인증한 장소를 불러오지 못했어요. | No se pudieron cargar tus lugares verificados. |
|  | `myPage.verifiedPlaces.favorite` | Save place | 장소 저장 | Guardar lugar |
|  | `myPage.verifiedPlaces.loading` | Loading verified places | 인증한 장소를 불러오는 중 | Cargando lugares verificados |
|  | `myPage.verifiedPlaces.title` | Verified places | 검증한 장소 | Lugares verificados |
|  | `myPage.verifiedPlaces.unfavorite` | Remove saved place | 저장 취소 | Quitar lugar guardado |
|  | `myPage.couponDetail.validityDays_many` | — | — | {{count}} días tras la emisión |

## `settings`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `settings.support.loading` | Loading | 불러오는 중 | Cargando |
| ● | `settings.support.error` | Could not load | 불러오지 못했습니다 | No se pudo cargar |
|  | `settings.support.empty` | No information | 정보 없음 | Sin información |
|  | `settings.support.navigationUnavailable` | Navigation is unavailable for this screen. Return to settings and try again. | 이 화면의 탐색 연결을 사용할 수 없습니다. 설정으로 돌아가 다시 시도해 주세요. | La navegación no está disponible en esta pantalla. Vuelve a los ajustes e inténtalo de nuevo. |
|  | `settings.support.guide` | Unavailable feature. Opens an explanation. | 미지원 기능입니다. 사유 안내를 엽니다. | Función no disponible. Abre una explicación. |
|  | `settings.support.emailEdit` | Edit email | 이메일 수정 | Editar correo |
|  | `settings.support.emailReason` | Direct email editing is unavailable because no update contract is published. | 이메일 직접 수정 계약이 공개되지 않아 사용할 수 없습니다. | La edición directa del correo no está disponible porque no se ha publicado un contrato de actualización. |
|  | `settings.support.oauth` | Connected accounts | 연결된 계정 | Cuentas conectadas |
|  | `settings.support.oauthReason` | The server does not provide a connected-account status query. | 서버에서 계정 연결 상태 조회를 제공하지 않습니다. | El servidor no ofrece una consulta del estado de las cuentas conectadas. |
|  | `settings.support.checkInCount` | Check-ins | 체크인 수 | Check-ins |
|  | `settings.support.reviewCount` | My reviews | 내 리뷰 수 | Mis reseñas |
|  | `settings.support.verifiedCount` | Verified places | 검증한 장소 | Lugares verificados |
|  | `settings.support.verifiedReason` | Check-in totals count visits, not unique verified places. A verified-place total is unavailable. | 체크인 수는 방문 횟수이며 고유한 검증 장소 수가 아닙니다. 검증 장소 수는 제공되지 않습니다. | El total de check-ins cuenta visitas, no lugares verificados únicos. El total de lugares verificados no está disponible. |
| ● | `settings.support.logoutError` | Could not complete logout. Please check your sign-in state. | 로그아웃을 완료하지 못했습니다. 로그인 상태를 확인해 주세요. | No se pudo cerrar la sesión. Revisa el estado de tu sesión. |
|  | `settings.export.title` | My data | 내 데이터 | Mis datos |
|  | `settings.export.download` | Download my data | 내 데이터 다운로드 | Descargar mis datos |
|  | `settings.export.confirm` | Prepare a JSON file containing your personal data? Choose where to save it in the share sheet. | 개인정보가 포함된 JSON 파일을 준비할까요? 공유 화면에서 저장 위치를 선택해 주세요. | ¿Preparar un archivo JSON con tus datos personales? Elige dónde guardarlo en la hoja para compartir. |
|  | `settings.export.cancel` | Cancel | 취소 | Cancelar |
|  | `settings.export.description` | Export the data provided by your account. This does not download location history or delete data. | 계정에서 제공하는 데이터를 내보냅니다. 위치 기록 다운로드나 데이터 삭제 기능은 아닙니다. | Exporta los datos que proporciona tu cuenta. Esto no descarga el historial de ubicaciones ni elimina datos. |
|  | `settings.export.loading` | Preparing the file… | 파일을 준비하는 중입니다. | Preparando el archivo… |
|  | `settings.export.cancelled` | Download cancelled. | 다운로드를 취소했습니다. | Descarga cancelada. |
| ● | `settings.export.error` | Could not download. Please try again. | 다운로드하지 못했습니다. 다시 시도해 주세요. | No se pudo descargar. Inténtalo de nuevo. |
|  | `settings.export.prepared` | File prepared. Saving or cancelling in the share sheet cannot be confirmed by the app. | 파일을 준비했습니다. 공유 화면에서의 저장 또는 취소 여부는 앱이 확인할 수 없습니다. | Archivo preparado. La app no puede confirmar si lo guardaste o cancelaste en la hoja para compartir. |
|  | `settings.appearance.dark` | Dark mode | 다크 모드 | Modo oscuro |
|  | `settings.appearance.description` | Choose whether PingDom follows your device appearance or uses a fixed mode. | 기기 화면 설정을 따르거나 원하는 화면 모드를 고정할 수 있어요. | Elige si PingDom sigue la apariencia de tu dispositivo o usa un modo fijo. |
|  | `settings.appearance.light` | Light mode | 라이트 모드 | Modo claro |
|  | `settings.appearance.section` | Appearance | 화면 모드 | Apariencia |
|  | `settings.appearance.selected` | Selected | 선택됨 | Seleccionado |
|  | `settings.appearance.system` | Use system setting | 시스템 설정 사용 | Ajuste del sistema |
|  | `settings.appearance.title` | Appearance | 화면 모드 | Apariencia |
|  | `settings.language.description` | Choose the language used throughout PingDom. | 핑덤에서 사용할 언어를 선택해 주세요. | Elige el idioma que se usa en todo PingDom. |
|  | `settings.language.section` | Language | 언어 | Idioma |
|  | `settings.language.selected` | Selected | 선택됨 | Seleccionado |
|  | `settings.language.title` | Language | 언어 설정 | Idioma |
| ● | `settings.account.deleteDescription` | Deleting your account permanently removes your records and First Recorder history. | 탈퇴하면 내가 남긴 기록과 First Recorder 이력이 모두 사라져요. | Al eliminar tu cuenta se borran de forma permanente tus registros y tu historial de First Recorder. |
|  | `settings.account.email` | Email | 이메일 | Correo electrónico |
|  | `settings.account.items.coupons` | Coupons | 쿠폰 | Cupones |
| ● | `settings.account.items.deleteAccount` | Delete account | 회원 탈퇴 | Eliminar cuenta |
|  | `settings.account.items.loginInformation` | Login information | 로그인 정보 | Datos de inicio de sesión |
|  | `settings.account.items.loginInformationDescription` | Email and password | 이메일 및 비밀번호 | Correo y contraseña |
|  | `settings.account.items.logout` | Log out | 로그아웃 | Cerrar sesión |
|  | `settings.account.items.myRecords` | My records | 내 기록 | Mis registros |
|  | `settings.account.loginSection` | Login information | 로그인 정보 | Datos de inicio de sesión |
|  | `settings.account.sections.account` | Account | 계정 | Cuenta |
|  | `settings.account.sections.activity` | Activity | 활동 | Actividad |
|  | `settings.account.sections.session` | Session | 세션 | Sesión |
|  | `settings.account.title` | Account management | 계정 관리 | Gestión de la cuenta |
|  | `settings.account.username` | Username | 아이디 | Nombre de usuario |
|  | `settings.back` | Back | 뒤로가기 | Atrás |
| ● | `settings.deleteAccount` | Delete account | 회원 탈퇴 | Eliminar cuenta |
|  | `settings.details.appInformation.description` | App information will be available in a later update. | 앱 정보는 추후 업데이트에서 제공할 예정입니다. | La información de la app estará disponible en una próxima actualización. |
|  | `settings.details.appInformation.title` | App information | 앱 정보 | Información de la app |
|  | `settings.details.coupons.description` | The coupon box will be connected in a separate update. | 쿠폰 보관함은 별도 업데이트에서 연결할 예정입니다. | Los cupones se conectarán en una actualización aparte. |
|  | `settings.details.coupons.title` | Coupons | 쿠폰 | Cupones |
|  | `settings.details.dataManagement.description` | Data download and deletion will be connected after its policy is defined. | 데이터 다운로드와 삭제는 정책 확정 후 연결할 예정입니다. | La descarga y eliminación de datos se conectarán cuando se defina su política. |
|  | `settings.details.dataManagement.title` | Download or delete data | 데이터 다운로드 · 삭제 | Descargar o eliminar datos |
| ● | `settings.details.deleteAccount.description` | Account deletion is unavailable until reauthentication and confirmation policies are defined. Your account has not been changed. | 재인증과 최종 확인 정책이 정해지지 않아 회원 탈퇴를 사용할 수 없습니다. 계정에는 아무 변경도 적용되지 않았습니다. | La eliminación de la cuenta no está disponible hasta que se definan las políticas de reautenticación y confirmación. Tu cuenta no ha cambiado. |
| ● | `settings.details.deleteAccount.title` | Delete account | 회원 탈퇴 | Eliminar cuenta |
|  | `settings.details.footprintMap.description` | There is no footprint map screen or matching data contract yet. | 발자국 지도 전용 화면과 데이터 계약이 아직 없습니다. | Aún no hay una pantalla de mapa de huellas ni un contrato de datos correspondiente. |
|  | `settings.details.footprintMap.title` | My footprint map | 내 발자국 지도 | Mi mapa de huellas |
|  | `settings.details.locationSettings.description` | Location settings will be connected in a separate update. | 위치 정보 설정은 별도 업데이트에서 연결할 예정입니다. | Los ajustes de ubicación se conectarán en una actualización aparte. |
|  | `settings.details.locationSettings.title` | Location settings | 위치 정보 설정 | Ajustes de ubicación |
|  | `settings.details.loginInformation.description` | Login information management will be connected in a separate update. | 로그인 정보 관리는 별도 업데이트에서 연결할 예정입니다. | La gestión de los datos de inicio de sesión se conectará en una actualización aparte. |
|  | `settings.details.loginInformation.title` | Login information | 로그인 정보 | Datos de inicio de sesión |
|  | `settings.details.logout.description` | Logout is not connected yet. You are still signed in. | 로그아웃은 아직 연결되지 않았습니다. 로그인 상태가 유지됩니다. | Cerrar sesión aún no está conectado. Tu sesión sigue iniciada. |
|  | `settings.details.logout.title` | Log out | 로그아웃 | Cerrar sesión |
|  | `settings.details.myRecords.description` | Record management has no dedicated screen or defined scope yet. Reviews and check-ins are different records. | 내 기록 관리의 범위와 전용 화면이 정해지지 않았습니다. 리뷰와 체크인은 서로 다른 기록입니다. | La gestión de registros aún no tiene una pantalla propia ni un alcance definido. Las reseñas y los check-ins son registros distintos. |
|  | `settings.details.myRecords.title` | Manage my records | 내 기록 관리 | Gestionar mis registros |
| ● | `settings.details.notices.description` | An official notices source and screen have not been configured. | 공식 공지사항 제공 경로와 화면이 아직 연결되지 않았습니다. | Aún no se han configurado la fuente ni la pantalla de avisos oficiales. |
| ● | `settings.details.notices.title` | Notices | 공지사항 | Avisos |
|  | `settings.details.notificationSettings.description` | Notification settings will be connected in a separate update. | 알림 설정은 별도 업데이트에서 연결할 예정입니다. | Los ajustes de notificaciones se conectarán en una actualización aparte. |
|  | `settings.details.notificationSettings.title` | Notification settings | 알림 설정 | Ajustes de notificaciones |
|  | `settings.details.passwordChange.description` | Password change is not connected yet. Your password has not been changed. | 비밀번호 변경은 아직 연결되지 않았습니다. 비밀번호에는 아무 변경도 적용되지 않았습니다. | El cambio de contraseña aún no está conectado. Tu contraseña no ha cambiado. |
|  | `settings.details.passwordChange.title` | Change password | 비밀번호 변경 | Cambiar contraseña |
| ● | `settings.details.privacyPolicy.description` | The approved privacy policy document and its URL have not been configured. | 승인된 개인정보 처리방침 문서와 URL이 아직 연결되지 않았습니다. | Aún no se han configurado el documento aprobado de la política de privacidad ni su URL. |
| ● | `settings.details.privacyPolicy.title` | Privacy policy | 개인정보 처리방침 | Política de privacidad |
| ● | `settings.details.privacySettings.description` | Privacy settings will be connected in a separate update. | 개인정보 설정은 별도 업데이트에서 연결할 예정입니다. | Los ajustes de privacidad se conectarán en una actualización aparte. |
| ● | `settings.details.privacySettings.title` | Privacy settings | 개인정보 설정 | Ajustes de privacidad |
|  | `settings.details.savedPlaces.description` | A dedicated saved-place management screen is not defined yet. | 저장 장소 관리 전용 화면이 아직 정의되지 않았습니다. | Aún no se ha definido una pantalla propia para gestionar los lugares guardados. |
|  | `settings.details.savedPlaces.title` | Manage saved places | 관심 장소 관리 | Gestionar lugares guardados |
| ● | `settings.details.terms.description` | The approved terms document and its URL have not been configured. | 승인된 이용약관 문서와 URL이 아직 연결되지 않았습니다. | Aún no se han configurado el documento aprobado de los términos ni su URL. |
| ● | `settings.details.terms.title` | Terms of service | 이용약관 | Términos del servicio |
|  | `settings.location.title` | Location & privacy | 위치·개인정보 | Ubicación y privacidad |
|  | `settings.location.locationSection` | Location information | 위치 정보 | Información de ubicación |
|  | `settings.location.visibilitySection` | Visibility | 공개 범위 | Visibilidad |
|  | `settings.location.dataSection` | Data management | 데이터 관리 | Gestión de datos |
|  | `settings.location.description` | Check device location permission and supported features. This screen does not collect your location. | 기기 위치 권한과 지원되는 기능을 확인하세요. 이 화면에서는 위치를 수집하지 않습니다. | Consulta el permiso de ubicación del dispositivo y las funciones compatibles. Esta pantalla no recopila tu ubicación. |
|  | `settings.location.device` | Device location permission | 기기 위치 권한 | Permiso de ubicación del dispositivo |
|  | `settings.location.foreground` | Collect location only while recording | 기록할 때만 위치 수집 | Recopilar la ubicación solo al registrar |
|  | `settings.location.verification` | GPS on-site verification | GPS 현장 인증 | Verificación presencial por GPS |
|  | `settings.location.profileVisibility` | Profile visibility | 프로필 공개 | Visibilidad del perfil |
|  | `settings.location.nickname` | Show nickname in place history | 장소 기록에 닉네임 표시 | Mostrar el apodo en el historial de lugares |
|  | `settings.location.download` | Export my data | 내 데이터 내보내기 | Exportar mis datos |
| ● | `settings.location.deleteHistory` | Delete all location history | 위치 기록 전체 삭제 | Eliminar todo el historial de ubicaciones |
| ● | `settings.location.permissionStates.loading` | Checking | 확인 중 | Comprobando |
| ● | `settings.location.permissionStates.granted` | Allowed | 허용됨 | Permitido |
| ● | `settings.location.permissionStates.denied` | Permission needed | 권한 필요 | Permiso necesario |
| ● | `settings.location.permissionStates.restricted` | Allow in device settings | 설정에서 허용 필요 | Permítelo en los ajustes del dispositivo |
| ● | `settings.location.permissionStates.unavailable` | Unavailable | 사용할 수 없음 | No disponible |
| ● | `settings.location.permissionStates.error` | Could not check permission | 확인 실패 | No se pudo comprobar el permiso |
|  | `settings.location.request` | Request location permission | 위치 권한 요청 | Solicitar permiso de ubicación |
|  | `settings.location.openSettings` | Open device settings | 기기 설정 열기 | Abrir los ajustes del dispositivo |
|  | `settings.location.retry` | Check again | 다시 확인 | Comprobar de nuevo |
| ● | `settings.location.settingsError` | Could not open device settings. Please try again. | 기기 설정을 열지 못했습니다. 다시 시도해 주세요. | No se pudieron abrir los ajustes del dispositivo. Inténtalo de nuevo. |
| ● | `settings.location.permissionNotice` | Change or revoke permission in device settings. This screen does not start location tracking. | 권한 변경·해제는 기기 설정에서 할 수 있습니다. 이 화면에서는 위치 추적을 시작하지 않습니다. | Cambia o revoca el permiso en los ajustes del dispositivo. Esta pantalla no inicia el seguimiento de ubicación. |
|  | `settings.location.capability.loading` | Checking availability | 사용 가능 여부 확인 중 | Comprobando disponibilidad |
|  | `settings.location.capability.granted` | Location permission allows use | 위치 권한이 있어 사용 가능 | El permiso de ubicación permite su uso |
| ● | `settings.location.capability.denied` | Location permission required | 위치 권한이 필요함 | Se requiere permiso de ubicación |
|  | `settings.location.capability.restricted` | Permission must be allowed in device settings | 기기 설정에서 위치 권한 허용이 필요함 | El permiso debe concederse en los ajustes del dispositivo |
|  | `settings.location.capability.unavailable` | Unavailable on this device | 현재 기기에서 사용할 수 없음 | No disponible en este dispositivo |
| ● | `settings.location.capability.error` | Could not check availability | 사용 가능 여부 확인 실패 | No se pudo comprobar la disponibilidad |
|  | `settings.location.foregroundDescription` | Not supported. A policy for saving this choice is not available. This is separate from periodic location collection. | 지원되지 않음 · 이 선택을 저장할 정책이 아직 없습니다. 주기적인 위치 수집과는 별개입니다. | No compatible. No hay una política para guardar esta opción. Es independiente de la recopilación periódica de ubicación. |
|  | `settings.location.footprintDescription` | Coming soon. A map of your location history is not available yet. | 준비 중 · 내 위치 기록을 보여주는 지도는 아직 지원하지 않습니다. | Próximamente. Aún no hay un mapa de tu historial de ubicaciones. |
|  | `settings.location.visibilityDescription` | Not supported. Profile visibility cannot be saved yet. | 지원되지 않음 · 프로필 공개 범위를 저장하는 기능이 아직 없습니다. | No compatible. La visibilidad del perfil aún no se puede guardar. |
|  | `settings.location.nicknameDescription` | Not supported. Nickname visibility cannot be saved yet. | 지원되지 않음 · 닉네임 표시 여부를 저장하는 기능이 아직 없습니다. | No compatible. La visibilidad del apodo aún no se puede guardar. |
|  | `settings.location.downloadDescription` | Export account information and other supported user data. This is not a location history download. | 계정 정보 등 지원되는 사용자 데이터를 내보냅니다. 위치 기록 다운로드가 아닙니다. | Exporta la información de la cuenta y otros datos de usuario compatibles. No es una descarga del historial de ubicaciones. |
| ● | `settings.location.policyDescription` | Coming soon. The approved privacy policy document is not connected yet. | 준비 중 · 승인된 개인정보 처리방침 문서가 아직 연결되지 않았습니다. | Próximamente. El documento aprobado de la política de privacidad aún no está conectado. |
| ● | `settings.location.deleteDescription` | Not supported. Deleting location history separately is not available. No data will be deleted here. | 지원되지 않음 · 위치 기록만 삭제하는 기능이 아직 없습니다. 여기서는 어떤 데이터도 삭제하지 않습니다. | No compatible. No es posible eliminar por separado el historial de ubicaciones. Aquí no se eliminará ningún dato. |
|  | `settings.logout` | Log out | 로그아웃 | Cerrar sesión |
|  | `settings.notifications.hotplace` | A place I recorded becomes popular | 내가 먼저 기록한 장소 급상승 | Un lugar que registré se vuelve popular |
|  | `settings.notifications.hotplaceDescription` | Get updates when your First Recorder place is trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | Recibe novedades cuando tu lugar de First Recorder sea tendencia |
|  | `settings.notifications.like` | New activity on my recorded places | 내 기록 장소에 새 반응 | Nueva actividad en mis lugares registrados |
|  | `settings.notifications.likeDescription` | Get updates when people react to your records | 내가 남긴 장소의 새 반응을 알려드려요 | Recibe novedades cuando la gente reaccione a tus registros |
| ● | `settings.notifications.loadFailed` | Notification settings could not be loaded. | 알림 설정을 불러오지 못했어요. | No se pudieron cargar los ajustes de notificaciones. |
|  | `settings.notifications.otherSection` | Other | 기타 | Otros |
|  | `settings.notifications.pushAll` | Allow all push notifications | 푸시 알림 전체 허용 | Permitir todas las notificaciones push |
|  | `settings.notifications.pushAllDescription` | You can still receive important account notices | 끄면 안내 알림만 받을 수 있어요 | Seguirás recibiendo los avisos importantes de la cuenta |
|  | `settings.notifications.quiet` | Quiet hours | 야간 알림 받기 | Horario de silencio |
|  | `settings.notifications.quietDescription` | Use the quiet hours saved to your account | 계정에 저장된 방해 금지 시간을 사용해요 | Usa el horario de silencio guardado en tu cuenta |
|  | `settings.notifications.recordsSection` | My records & places | 내 기록 · 장소 | Mis registros y lugares |
|  | `settings.notifications.title` | Notification settings | 알림 설정 | Ajustes de notificaciones |
| ● | `settings.notifications.updateFailedDescription` | Your previous setting was restored. Please try again. | 이전 설정으로 되돌렸어요. 다시 시도해주세요. | Se restauró tu ajuste anterior. Inténtalo de nuevo. |
| ● | `settings.notifications.updateFailedTitle` | Could not update notifications | 알림 설정을 변경하지 못했어요 | No se pudieron actualizar las notificaciones |
|  | `settings.pending.back` | Back to settings | 설정으로 돌아가기 | Volver a los ajustes |
|  | `settings.pending.title` | Coming soon | 준비 중인 기능입니다 | Próximamente |
|  | `settings.rows.accountInfo` | Username · Email | 아이디 · 이메일 | Usuario · Correo |
|  | `settings.rows.dataManagement` | Download · delete data | 데이터 다운로드 · 삭제 | Descargar · eliminar datos |
|  | `settings.rows.favoritePlaces` | Manage favorite places | 관심 장소 관리 | Gestionar lugares favoritos |
|  | `settings.rows.footprintMap` | My footprint map | 내 발자국 지도 | Mi mapa de huellas |
|  | `settings.rows.locationSettings` | Location settings | 위치 정보 설정 | Ajustes de ubicación |
|  | `settings.rows.myRecords` | Manage my records | 내 기록 관리 | Gestionar mis registros |
| ● | `settings.rows.notices` | Notices | 공지사항 | Avisos |
|  | `settings.rows.notificationSettings` | Notification settings | 알림 설정 | Ajustes de notificaciones |
|  | `settings.rows.password` | Change password | 비밀번호 변경 | Cambiar contraseña |
| ● | `settings.rows.privacyPolicy` | Privacy policy | 개인정보 처리방침 | Política de privacidad |
|  | `settings.rows.profileEdit` | Edit profile | 프로필 편집 | Editar perfil |
| ● | `settings.rows.terms` | Terms of use | 이용약관 | Términos de uso |
|  | `settings.rows.version` | Version | 버전 정보 | Versión |
|  | `settings.sections.account` | Account | 계정 | Cuenta |
|  | `settings.sections.appInfo` | App information | 앱 정보 | Información de la app |
|  | `settings.sections.notifications` | Notifications | 알림 | Notificaciones |
|  | `settings.sections.preferences` | Preferences | 환경설정 | Preferencias |
| ● | `settings.sections.privacy` | Privacy · location | 개인정보 · 위치 | Privacidad · ubicación |
|  | `settings.sections.records` | Records · places | 기록 · 장소 | Registros · lugares |
|  | `settings.title` | Settings | 설정 | Ajustes |
|  | `settings.values.everyone` | Everyone | 전체 공개 | Todos |
|  | `settings.values.notConnected` | Not connected | 연결 전 | Sin conectar |
|  | `settings.values.off` | Off | 꺼짐 | Desactivado |
|  | `settings.values.on` | On | 켜짐 | Activado |
|  | `settings.values.onlyMe` | Only me | 나만 보기 | Solo yo |

## `merchantMyPage`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `merchantMyPage.back` | Back | 뒤로가기 | Atrás |
|  | `merchantMyPage.settings` | Settings | 설정 | Ajustes |
|  | `merchantMyPage.title` | My page | 마이 페이지 | Mi página |
| ● | `merchantMyPage.roleLabel` | Business owner | 사업자 | Propietario del negocio |
|  | `merchantMyPage.loading` | Loading your store | 가게 정보를 불러오는 중 | Cargando tu local |
| ● | `merchantMyPage.loadError` | Could not load your store. | 가게 정보를 불러오지 못했어요. | No se pudo cargar tu local. |
|  | `merchantMyPage.retry` | Try again | 다시 시도 | Reintentar |
|  | `merchantMyPage.review.author` | Visitor #{{id}} | 이용인 #{{id}} | Visitante n.º {{id}} |
|  | `merchantMyPage.review.time` | {{date}} · {{relative}} | {{date}} · {{relative}} | {{date}} · {{relative}} |
|  | `merchantMyPage.noStore` | No store is linked to this account yet. | 아직 연결된 가게가 없어요. | Aún no hay ningún local vinculado a esta cuenta. |
|  | `merchantMyPage.store.title` | My store | 나의 가게 | Mi local |
|  | `merchantMyPage.store.verifiedCount` | {{count}} people verified this! | {{count}}명이 검증했어요! | ¡{{count}} personas lo verificaron! |
|  | `merchantMyPage.store.address` | Location | 위치 | Ubicación |
|  | `merchantMyPage.store.businessHours` | Business hours | 영업 시간 | Horario de atención |
|  | `merchantMyPage.store.phoneNumber` | Phone number | 전화번호 | Número de teléfono |
|  | `merchantMyPage.store.editField` | Edit {{field}} | {{field}} 수정 | Editar {{field}} |
|  | `merchantMyPage.store.features.englishSupport` | English available | 영어응대 가능 | Atención en inglés |
|  | `merchantMyPage.store.features.parking` | Parking available | 주차가능 | Estacionamiento disponible |
|  | `merchantMyPage.reviews.title` | Reviews | 리뷰 | Reseñas |
|  | `merchantMyPage.reviews.viewAll` | See all reviews | 리뷰 모두 보기 | Ver todas las reseñas |
|  | `merchantMyPage.reviews.empty` | No reviews yet | 아직 리뷰가 없어요 | Aún no hay reseñas |
|  | `merchantMyPage.events.title` | Event management | 이벤트 관리 | Gestión de eventos |
|  | `merchantMyPage.events.subtitle` | Currently running events | 현재 진행중인 이벤트 | Eventos en curso |
|  | `merchantMyPage.events.create` | New event | 새 이벤트 | Nuevo evento |
| ● | `merchantMyPage.events.delete` | Delete event | 이벤트 삭제 | Eliminar evento |
|  | `merchantMyPage.events.empty` | No events yet | 아직 이벤트가 없어요 | Aún no hay eventos |
|  | `merchantMyPage.events.closeConfirmTitle` | Close this event? | 이벤트를 종료할까요? | ¿Cerrar este evento? |
|  | `merchantMyPage.events.closeConfirmBody` | Closed events can no longer be issued to tourists. | 종료한 이벤트는 더 이상 관광객에게 발급되지 않아요. | Los eventos cerrados ya no se pueden emitir a turistas. |
|  | `merchantMyPage.events.closeConfirm` | Close | 종료 | Cerrar |
|  | `merchantMyPage.events.closeCancel` | Cancel | 취소 | Cancelar |
| ● | `merchantMyPage.events.closeFailed` | Could not close the event. | 이벤트를 종료하지 못했어요. | No se pudo cerrar el evento. |
|  | `merchantMyPage.events.status.ongoing` | Ongoing | 진행중 | En curso |
|  | `merchantMyPage.events.status.ended` | Ended | 종료 | Finalizado |
|  | `merchantMyPage.events.status.upcoming` | Upcoming | 예정됨 | Próximo |

## `placeDetail`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `placeDetail.back` | Back | 뒤로 | Atrás |
|  | `placeDetail.couponUsage` | Coupon use: {{value}} | 쿠폰 사용: {{value}} | Uso de cupones: {{value}} |
|  | `placeDetail.englishMenu` | English menu: {{value}} | 영문 메뉴: {{value}} | Menú en inglés: {{value}} |
|  | `placeDetail.languages` | Languages: {{value}} | 지원 언어: {{value}} | Idiomas: {{value}} |
|  | `placeDetail.liveStatus` | Live status | 실시간 상태 | Estado en vivo |
|  | `placeDetail.loading` | Loading place details... | 장소 상세를 불러오는 중입니다... | Cargando detalles del lugar... |
|  | `placeDetail.offer.eligibility` | Who can claim: {{value}} | 발급 대상: {{value}} | Quién puede obtenerlo: {{value}} |
|  | `placeDetail.offer.expiry` | Valid: {{value}} | 유효 기간: {{value}} | Vigencia: {{value}} |
|  | `placeDetail.offer.title` | Coupon offer | 쿠폰 혜택 | Oferta de cupón |
|  | `placeDetail.operating.beforeOpen` | Not open yet | 영업 전 | Aún no abre |
|  | `placeDetail.operating.closed` | Closed | 영업 종료 | Cerrado |
|  | `placeDetail.operating.closedToday` | Closed today | 오늘 휴무 | Cerrado hoy |
|  | `placeDetail.operating.closesAt` | Closes at {{time}} | {{time}}에 영업 종료 | Cierra a las {{time}} |
|  | `placeDetail.operating.open` | Open | 영업 중 | Abierto |
|  | `placeDetail.operating.opensAt` | Opens at {{time}} | {{time}}에 영업 시작 | Abre a las {{time}} |
|  | `placeDetail.operating.opensLaterAt` | Opens on the next business day at {{time}} | 다음 영업일 {{time}}에 영업 시작 | Abre el próximo día hábil a las {{time}} |
|  | `placeDetail.operating.opensTomorrowAt` | Opens tomorrow at {{time}} | 내일 {{time}}에 영업 시작 | Abre mañana a las {{time}} |
|  | `placeDetail.operating.permanentlyClosed` | Permanently closed | 폐업 | Cerrado permanentemente |
|  | `placeDetail.operating.temporarilyClosed` | Temporarily closed | 임시 휴무 | Cerrado temporalmente |
|  | `placeDetail.operating.unknown` | Hours unavailable | 영업시간 정보 없음 | Horario no disponible |
|  | `placeDetail.review.anonymousUser` | User | 사용자 | Usuario |
|  | `placeDetail.verification.admin` | Administrator verified | 관리자 확인 정보 | Verificado por un administrador |
|  | `placeDetail.verification.owner` | Provided by the business | 사업자 제공 정보 | Proporcionado por el negocio |
|  | `placeDetail.verification.source` | Source verified | 출처 확인 정보 | Fuente verificada |
|  | `placeDetail.touristSupport` | Tourist support | 관광객 지원 | Atención al turista |
|  | `placeDetail.trust` | Trust | 신뢰 정보 | Confianza |
|  | `placeDetail.trustScore` | {{score}}/100 · {{confidence}} confidence | {{score}}/100 · 신뢰도 {{confidence}} | {{score}}/100 · confianza {{confidence}} |
|  | `placeDetail.unknownValue` | Unknown | 알 수 없음 | Desconocido |
|  | `placeDetail.waitMinutes_one` | {{count}} minute | {{count}}분 | {{count}} minuto |
|  | `placeDetail.waitMinutes_other` | {{count}} minutes | {{count}}분 | {{count}} minutos |
|  | `placeDetail.waitTime` | Estimated wait: {{value}} | 예상 대기: {{value}} | Espera estimada: {{value}} |
|  | `placeDetail.waitMinutes_many` | — | — | {{count}} minutos |

## `placeOffers`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `placeOffers.title` | Tourist coupon | 관광객 쿠폰 | Cupón para turistas |
|  | `placeOffers.loading` | Checking available coupons... | 받을 수 있는 쿠폰을 확인하고 있습니다... | Comprobando cupones disponibles... |
|  | `placeOffers.empty.title` | No coupons available | 받을 수 있는 쿠폰이 없습니다 | No hay cupones disponibles |
|  | `placeOffers.empty.description` | There is no issuable coupon for this place right now. | 지금 이 장소에서 발급 가능한 쿠폰이 없습니다. | Por ahora no hay ningún cupón que se pueda emitir para este lugar. |
|  | `placeOffers.auth.description` | Sign in to check and issue this coupon. | 쿠폰을 확인하고 발급받으려면 로그인하세요. | Inicia sesión para consultar y obtener este cupón. |
|  | `placeOffers.auth.action` | Sign in | 로그인 | Iniciar sesión |
| ● | `placeOffers.detail.benefitLabel` | Benefit | 혜택 | Beneficio |
| ● | `placeOffers.detail.periodLabel` | Issuable period | 발급 기간 | Periodo de emisión |
| ● | `placeOffers.detail.validityLabel` | Valid after issue | 발급 후 사용 기간 | Vigencia tras la emisión |
| ● | `placeOffers.detail.inventoryLabel` | Remaining | 남은 수량 | Restantes |
| ● | `placeOffers.detail.eligibilityLabel` | Eligibility | 발급 대상 | Requisitos |
|  | `placeOffers.detail.periodUnavailable` | Period unavailable | 기간 정보 없음 | Periodo no disponible |
|  | `placeOffers.detail.inventoryUnlimited` | No limit | 수량 제한 없음 | Sin límite |
|  | `placeOffers.detail.inventoryRemaining_one` | {{count}} left | {{count}}개 남음 | Queda {{count}} |
|  | `placeOffers.detail.inventoryRemaining_other` | {{count}} left | {{count}}개 남음 | Quedan {{count}} |
|  | `placeOffers.detail.eligibilityActiveTravelSchedule` | Travelers with an active trip schedule | 여행 일정이 활성화된 여행자 | Viajeros con un itinerario de viaje activo |
|  | `placeOffers.detail.eligibilityPublic` | Anyone | 누구나 | Cualquier persona |
|  | `placeOffers.detail.eligibilityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | Consulta las condiciones de la oferta |
|  | `placeOffers.detail.validityDays_one` | Use within {{count}} day of issue | 발급 후 {{count}}일 이내 사용 | Úsalo en un plazo de {{count}} día tras la emisión |
|  | `placeOffers.detail.validityDays_other` | Use within {{count}} days of issue | 발급 후 {{count}}일 이내 사용 | Úsalo en un plazo de {{count}} días tras la emisión |
|  | `placeOffers.detail.validityOfferEnd` | Valid until the offer ends | 혜택 종료일까지 사용 가능 | Válido hasta que termine la oferta |
|  | `placeOffers.detail.validityOfferEndOn` | Valid until {{date}} | {{date}}까지 사용 가능 | Válido hasta el {{date}} |
|  | `placeOffers.detail.validityCapped` | Capped by the offer end date | 혜택 종료일까지로 제한됨 | Limitado por la fecha de fin de la oferta |
|  | `placeOffers.detail.validityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | Consulta las condiciones de la oferta |
|  | `placeOffers.cta.issue` | Get coupon | 쿠폰 받기 | Obtener cupón |
|  | `placeOffers.cta.issuing` | Issuing... | 발급 중... | Emitiendo... |
| ● | `placeOffers.cta.a11yIssue` | Get coupon for {{offer}} | {{offer}} 쿠폰 받기 | Obtener cupón de {{offer}} |
| ● | `placeOffers.cta.a11yIssuing` | Issuing coupon | 쿠폰 발급 중 | Emitiendo cupón |
| ● | `placeOffers.error.eligibility` | This coupon is for eligible travelers only. | 이 쿠폰은 발급 대상 여행자만 받을 수 있습니다. | Este cupón es solo para viajeros que cumplen los requisitos. |
| ● | `placeOffers.error.notFound` | This offer is no longer available. | 이 혜택은 더 이상 발급할 수 없습니다. | Esta oferta ya no está disponible. |
| ● | `placeOffers.error.conflictDuplicate` | You already issued this coupon. | 이미 발급받은 쿠폰입니다. | Ya obtuviste este cupón. |
| ● | `placeOffers.error.conflictWindowClosed` | The issuance window for this coupon has closed. | 이 쿠폰의 발급 기간이 종료되었습니다. | El periodo de emisión de este cupón ya cerró. |
| ● | `placeOffers.error.conflictStockOut` | This coupon is out of stock. | 이 쿠폰이 모두 소진되었습니다. | Este cupón está agotado. |
| ● | `placeOffers.error.conflictUnknown` | This coupon could not be issued. Please try again later. | 쿠폰을 발급하지 못했습니다. 잠시 후 다시 시도해 주세요. | No se pudo emitir este cupón. Inténtalo más tarde. |
|  | `placeOffers.success.title` | Coupon issued | 쿠폰이 발급되었습니다 | Cupón emitido |
|  | `placeOffers.success.description` | Your coupon is ready. | 쿠폰이 준비되었습니다. | Tu cupón está listo. |
|  | `placeOffers.success.code` | Code | 코드 | Código |
|  | `placeOffers.success.expiry` | Expires | 만료 | Vence |
| ● | `placeOffers.success.hint` | Find it later in My coupons. | 내 쿠폰에서 다시 확인할 수 있습니다. | Encuéntralo luego en Mis cupones. |
|  | `placeOffers.success.viewAction` | View my coupons | 내 쿠폰 보기 | Ver mis cupones |
|  | `placeOffers.success.issueAnother` | Get another coupon | 다른 쿠폰 받기 | Obtener otro cupón |
|  | `placeOffers.detail.inventoryRemaining_many` | — | — | Quedan {{count}} |
|  | `placeOffers.detail.validityDays_many` | — | — | Úsalo en un plazo de {{count}} días tras la emisión |

## `placeStatus`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `placeStatus.closed` | Permanently closed | 폐업 | Cerrado permanentemente |
|  | `placeStatus.open` | Operating | 영업 중 | En funcionamiento |
|  | `placeStatus.temporarilyClosed` | Temporarily closed | 임시 휴무 | Cerrado temporalmente |
|  | `placeStatus.unknown` | Status unknown | 상태 알 수 없음 | Estado desconocido |

## `placeSupport`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `placeSupport.available` | Available | 가능 | Disponible |
|  | `placeSupport.unavailable` | Unavailable | 불가능 | No disponible |
|  | `placeSupport.unknown` | Unknown | 알 수 없음 | Desconocido |

## `placeTrust`

| 우선 | 키 | en | ko | es |
|---|---|---|---|---|
|  | `placeTrust.confidence.high` | High | 높음 | Alta |
|  | `placeTrust.confidence.low` | Low | 낮음 | Baja |
|  | `placeTrust.confidence.medium` | Medium | 보통 | Media |
|  | `placeTrust.confidence.unknown` | Unknown | 알 수 없음 | Desconocida |
