# #416 브라질 포르투갈어 번역 검수 대상 키

> 상태: **기계 번역 초안 · 사람 검수 필요**. 이 문서의 모든 pt-BR 문구는 검수 전이다.
> 기준: 브라질 포르투갈어(pt-BR), 2인칭 você. 용어: 검증/verify → verificar, 쿠폰 → cupom, 혜택/Offer → oferta, 예약 → reserva, 체크인 → check-in, 설정 → configurações, 추천 탭 → Sugestões, 리뷰 → avaliação, 기기 → aparelho, 가입 → cadastro. 복수형 `_many`(1,000,000 등)는 `_other`와 같은 문구다. 브랜드 PingDom·Pingdy는 모든 언어에서 원문 표기.
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

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `mapTutorial.name` | Pingdy | Pingdy | Pingdy |
|  | `mapTutorial.title` | Meet Pingdy | Pingdy 사용 안내 | Conheça o Pingdy |
|  | `mapTutorial.guest` | traveler | 여행자 | viajante |
|  | `mapTutorial.close` | Close tutorial | 튜토리얼 닫기 | Fechar tutorial |
|  | `mapTutorial.previous` | Previous tip | 이전 안내 | Dica anterior |
|  | `mapTutorial.next` | Next tip | 다음 안내 | Próxima dica |
|  | `mapTutorial.finish` | Finish tutorial | 튜토리얼 완료 | Concluir tutorial |
|  | `mapTutorial.progress` | Step {{current}} of {{total}} | {{current}} / {{total}} 단계 | Etapa {{current}} de {{total}} |
|  | `mapTutorial.welcome.greeting` | Hello, {{username}}! | 안녕하세요, {{username}}님 | Olá, {{username}}! |
|  | `mapTutorial.welcome.introduction` | Here to make your travels easier, | {{username}}님의 여행을 더 쉽게 만들어드리는 | Para deixar suas viagens mais fáceis, |
|  | `mapTutorial.welcome.agent` | I’m <accent>Pingdy</accent>, your AI agent. | AI 에이전트, <accent>Pingdy</accent>예요. | eu sou o <accent>Pingdy</accent>, seu agente de IA. |
|  | `mapTutorial.welcome.help` | From finding places to preparing reservations,<br>I can help with a conversation. | 원하는 장소를 찾고, 예약을 준비하는 과정까지<br>대화 한번으로 도와드릴게요. | De encontrar lugares a preparar reservas,<br>eu ajudo você com uma conversa. |
|  | `mapTutorial.welcome.start` | Let me give you a quick tour! | 지금부터 간단히 사용법을 알려드릴게요! | Vou mostrar rapidinho como funciona! |
|  | `mapTutorial.map.prompt` | Tap the <accent>Map button</accent>. | <accent>지도 버튼</accent>을 눌러보세요. | Toque no <accent>botão Mapa</accent>. |
|  | `mapTutorial.map.body` | Discover pins around you, plus popular places<br>in your area and across the country. | 내 주변의 핑들을 확인할 수 있어요.<br>또한 우리 지역과 전국 트렌드 장소도 볼 수 있어요. | Descubra pins perto de você e lugares<br>populares na sua região e em todo o país. |
|  | `mapTutorial.favorites.prompt` | Tap the <accent>Favorites button</accent>. | <accent>즐겨찾기 버튼</accent>을 눌러보세요. | Toque no <accent>botão Favoritos</accent>. |
|  | `mapTutorial.favorites.body` | Save places you’re interested in<br>and find them again whenever you like. | 관심 있는 장소를 즐겨찾기에 저장하고,<br>언제든 다시 찾아볼 수 있어요. | Salve os lugares que interessam a você<br>e encontre-os de novo quando quiser. |
|  | `mapTutorial.community.prompt` | Tap the <accent>Community button</accent>. | <accent>커뮤니티 버튼</accent>을 눌러보세요. | Toque no <accent>botão Comunidade</accent>. |
|  | `mapTutorial.community.body` | Explore other travelers’ experiences,<br>and tag places to share your own stories. | 다른 여행자들의 생생한 장소 경험을 확인하고,<br>장소를 태그해 나만의 이야기도 공유할 수 있어요. | Veja experiências de outros viajantes<br>e marque lugares para contar as suas. |
|  | `mapTutorial.reservations.prompt` | Tap the <accent>Reservations button</accent>. | <accent>예약 버튼</accent>을 눌러보세요. | Toque no <accent>botão Reservas</accent>. |
|  | `mapTutorial.reservations.body` | Check availability at the places you love<br>and book a date and time that works for you. | 원하는 장소의 예약 가능 여부를 확인하고,<br>날짜와 시간에 맞춰 간편하게 예약할 수 있어요. | Confira a disponibilidade de um lugar<br>e reserve a data e o horário que quiser. |
|  | `mapTutorial.recommendations.prompt` | Tap the <accent>Recommendations button</accent>. | <accent>장소 추천 버튼</accent>을 눌러보세요. | Toque no <accent>botão Sugestões</accent>. |
|  | `mapTutorial.recommendations.body` | {{username}}, discover personalized places<br>based on your interests and activity. | {{username}}님의 관심사와 이용 상황을 바탕으로<br>개인화된 장소 추천을 받을 수 있어요. | {{username}}, descubra lugares sob medida<br>com base nos seus interesses e atividade. |
|  | `mapTutorial.verification.prompt` | Tap the <accent>Verify button</accent>. | <accent>검증하기 버튼</accent>을 눌러보세요. | Toque no <accent>botão Verificar</accent>. |
|  | `mapTutorial.verification.body` | Review the places you’ve visited<br>and verify your experience to help<br>other travelers visit with confidence. | 직접 방문한 장소의 경험을 리뷰로 남기고,<br>다른 여행자들이 믿고 방문할 수 있도록<br>장소를 검증해주세요. | Avalie os lugares que você visitou<br>e verifique sua experiência para que<br>outros viajantes visitem com confiança. |
|  | `mapTutorial.categories.prompt` | Tap a <accent>category</accent>. | <accent>카테고리</accent>를 눌러보세요. | Toque em uma <accent>categoria</accent>. |
|  | `mapTutorial.categories.body` | Choose food, music, or another category<br>to see only the pins that match. | 음식점, 음악 등 원하는 카테고리를 선택하면<br>해당하는 핑들만 골라서 확인할 수 있어요. | Escolha comida, música ou outra categoria<br>para ver apenas os pins correspondentes. |
|  | `mapTutorial.profile.prompt` | Tap <accent>My Page</accent>. | <accent>마이페이지</accent>를 눌러보세요. | Toque em <accent>Minha página</accent>. |
|  | `mapTutorial.profile.body` | Manage your profile and travel dates,<br>and browse the places you’ve verified. | 내 프로필과 여행 기간을 관리하고,<br>내가 직접 검증한 장소들을 모아 볼 수 있어요. | Gerencie seu perfil e suas datas de viagem<br>e veja os lugares que você verificou. |

## `offerCoupon`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
| ● | `offerCoupon.error.actions.back` | Go back | 뒤로 가기 | Voltar |
| ● | `offerCoupon.error.actions.retry` | Try again | 다시 시도 | Tentar novamente |
| ● | `offerCoupon.error.actions.signIn` | Sign in again | 다시 로그인 | Entrar novamente |
| ● | `offerCoupon.error.actions.viewWallet` | Check my coupons | 보관함 확인 | Ver meus cupons |
| ● | `offerCoupon.error.alreadyIssued.description` | You have already issued this coupon. Check it in your coupons. | 이미 발급받은 쿠폰입니다. 보관함에서 확인해 주세요. | Você já resgatou este cupom. Confira nos seus cupons. |
| ● | `offerCoupon.error.alreadyIssued.title` | Already issued | 이미 발급받았습니다 | Já resgatado |
| ● | `offerCoupon.error.alreadyRedeemed.description` | This coupon has already been used and cannot be used again. | 이미 사용한 쿠폰이라 다시 사용할 수 없습니다. | Este cupom já foi usado e não pode ser usado novamente. |
| ● | `offerCoupon.error.alreadyRedeemed.title` | Already used | 이미 사용했습니다 | Já usado |
| ● | `offerCoupon.error.authentication.description` | Your session has expired. Sign in again to continue. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | Sua sessão expirou. Entre novamente para continuar. |
| ● | `offerCoupon.error.authentication.title` | Sign-in required | 로그인이 필요합니다 | É necessário entrar |
| ● | `offerCoupon.error.expired.description` | This coupon’s usable period has ended. | 쿠폰의 사용 기간이 종료되었습니다. | O período de uso deste cupom terminou. |
| ● | `offerCoupon.error.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | Não está mais disponível |
| ● | `offerCoupon.error.forbidden.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | Esta conta não tem permissão para esta ação. |
| ● | `offerCoupon.error.forbidden.title` | Permission required | 권한이 필요합니다 | Permissão necessária |
| ● | `offerCoupon.error.generic.description` | Something went wrong on our side. Please try again in a moment. | 서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. | Algo deu errado do nosso lado. Tente novamente em instantes. |
| ● | `offerCoupon.error.generic.title` | Could not complete the request | 요청을 처리하지 못했습니다 | Não foi possível concluir a solicitação |
| ● | `offerCoupon.error.ineligible.description` | This offer is not available for your account right now. An active travel schedule may be required. | 지금은 이 Offer를 발급받을 수 없습니다. 진행 중인 여행 일정이 필요할 수 있습니다. | Esta oferta não está disponível para sua conta no momento. Pode ser necessário ter um roteiro de viagem ativo. |
| ● | `offerCoupon.error.ineligible.title` | Not eligible | 발급 조건을 충족하지 않습니다 | Não elegível |
| ● | `offerCoupon.error.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente. |
| ● | `offerCoupon.error.network.title` | Connection problem | 연결에 문제가 있습니다 | Problema de conexão |
| ● | `offerCoupon.error.notFound.description` | This offer or coupon is no longer available. Return to the latest list. | 이 Offer 또는 쿠폰을 더 이상 이용할 수 없습니다. 최신 목록으로 돌아가 주세요. | Esta oferta ou cupom não está mais disponível. Volte para a lista mais recente. |
| ● | `offerCoupon.error.notFound.title` | Not found | 항목을 찾을 수 없습니다 | Não encontrado |
| ● | `offerCoupon.error.redeemInvalidInput.description` | Check the coupon and try scanning it again. | 쿠폰을 확인한 후 다시 스캔해 주세요. | Confira o cupom e tente escanear novamente. |
| ● | `offerCoupon.error.redeemInvalidInput.title` | Could not process | 처리하지 못했습니다 | Não foi possível processar |
| ● | `offerCoupon.error.redeemUsedOrExpired.description` | This coupon has already been used or has expired. | 이미 사용되었거나 만료된 쿠폰입니다. | Este cupom já foi usado ou expirou. |
| ● | `offerCoupon.error.redeemUsedOrExpired.title` | Cannot be used | 사용할 수 없습니다 | Não pode ser usado |
| ● | `offerCoupon.error.soldOut.description` | All coupons for this offer have been claimed. | 이 Offer의 쿠폰이 모두 소진되었습니다. | Todos os cupons desta oferta já foram resgatados. |
| ● | `offerCoupon.error.soldOut.title` | Sold out | 수량이 소진되었습니다 | Esgotado |
| ● | `offerCoupon.error.unconfirmedConflict.description` | This offer could not be issued. It may already be in your coupons, or issuing may have closed. | 발급하지 못했습니다. 이미 보관함에 있거나 발급이 마감되었을 수 있습니다. | Não foi possível emitir esta oferta. Ela talvez já esteja nos seus cupons ou a emissão foi encerrada. |
| ● | `offerCoupon.error.unconfirmedConflict.title` | Could not issue | 발급하지 못했습니다 | Não foi possível emitir |
| ● | `offerCoupon.error.updateRequired.description` | Install the latest version to keep using coupons. | 쿠폰을 계속 사용하려면 최신 버전을 설치해 주세요. | Instale a versão mais recente para continuar usando cupons. |
| ● | `offerCoupon.error.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | Atualização necessária |
| ● | `offerCoupon.error.validation.description` | Could not load the list. Please try again. | 목록을 불러오지 못했습니다. 다시 시도해 주세요. | Não foi possível carregar a lista. Tente novamente. |
| ● | `offerCoupon.error.validation.title` | Could not load coupons | 쿠폰을 불러오지 못했습니다 | Não foi possível carregar os cupons |
|  | `offerCoupon.place.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Requires an active travel schedule | 진행 중인 여행 일정이 필요합니다 | Requer um roteiro de viagem ativo |
|  | `offerCoupon.place.eligibility.PUBLIC` | Available to all eligible visitors | 발급 가능한 방문객 모두 이용할 수 있습니다 | Disponível para todos os visitantes elegíveis |
|  | `offerCoupon.place.emptyDescription` | There are no coupons available for this place right now. | 현재 이 장소에서 발급받을 수 있는 쿠폰이 없습니다. | No momento não há cupons disponíveis para este lugar. |
|  | `offerCoupon.place.emptyTitle` | No available offers | 발급 가능한 Offer가 없습니다 | Nenhuma oferta disponível |
|  | `offerCoupon.place.inventoryRemaining` | {{count}} remaining | {{count}}개 남음 | Restam {{count}} |
|  | `offerCoupon.place.inventoryUnlimited` | No quantity limit | 수량 제한 없음 | Sem limite de quantidade |
|  | `offerCoupon.place.issue` | Get coupon | 쿠폰 받기 | Pegar cupom |
|  | `offerCoupon.place.loading` | Loading available coupons… | 발급 가능한 쿠폰을 불러오는 중… | Carregando cupons disponíveis… |
|  | `offerCoupon.place.period` | Issue period: {{value}} | 발급 기간: {{value}} | Período de emissão: {{value}} |
|  | `offerCoupon.place.periodUnknown` | Schedule unavailable | 기간 정보 없음 | Período indisponível |
|  | `offerCoupon.place.successDescription` | The issued coupon is ready in your coupon wallet. | 발급된 쿠폰을 보관함에서 바로 확인할 수 있습니다. | O cupom emitido já está na sua carteira de cupons. |
|  | `offerCoupon.place.successTitle` | Coupon issued | 쿠폰을 발급했습니다 | Cupom emitido |
|  | `offerCoupon.place.untitled` | Coupon offer | 쿠폰 Offer | Oferta de cupom |
|  | `offerCoupon.place.validityDays` | Valid for {{count}} day after issue | 발급 후 {{count}}일 동안 사용 가능 | Válido por {{count}} dia após a emissão |
|  | `offerCoupon.place.validityDays_other` | Valid for {{count}} days after issue | 발급 후 {{count}}일 동안 사용 가능 | Válido por {{count}} dias após a emissão |
|  | `offerCoupon.place.validityDays_many` | — | — | Válido por {{count}} dias após a emissão |

## `reservation`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `reservation.common.back` | Go back | 뒤로 가기 | Voltar |
|  | `reservation.common.favorites` | Favorites | 즐겨찾기 | Favoritos |
|  | `reservation.common.map` | Map | 지도 | Mapa |
|  | `reservation.common.recommendations` | Place recommendations | 장소추천 | Sugestões |
|  | `reservation.common.reservations` | Reservations | 예약 | Reservas |
|  | `reservation.box.count` | {{count}} reservations | 보유 예약 {{count}}건 | {{count}} reservas |
|  | `reservation.box.empty` | No reservations yet. | 아직 예약 내역이 없어요. | Você ainda não tem reservas. |
| ● | `reservation.box.error` | Could not load your reservations. | 예약함을 불러오지 못했어요. | Não foi possível carregar suas reservas. |
|  | `reservation.box.loading` | Loading reservations… | 예약함을 불러오는 중이에요… | Carregando reservas… |
|  | `reservation.box.productIcon` | R | R | R |
|  | `reservation.box.settings` | Open settings | 설정 열기 | Abrir configurações |
|  | `reservation.box.title` | Reservations | 예약함 | Reservas |
|  | `reservation.create.availabilityEmpty` | No availability has been published for this place. | 이 장소에 등록된 예약 가능 일정이 없습니다. | Este lugar ainda não publicou disponibilidade. |
| ● | `reservation.create.availabilityError` | Could not load availability. | 예약 가능 일정을 불러오지 못했습니다. | Não foi possível carregar a disponibilidade. |
|  | `reservation.create.availabilityLoading` | Loading availability… | 예약 가능 일정을 불러오는 중이에요… | Carregando disponibilidade… |
|  | `reservation.create.afternoon` | PM | 오후 | Tarde |
|  | `reservation.create.available` | Available | 가능 | Disponível |
| ● | `reservation.create.availableDateLabel` | {{date}}, available | {{date}}, 예약 가능 | {{date}}, disponível |
| ● | `reservation.create.availableDateCapacityLabel` | {{date}}, {{count}} spots remaining | {{date}}, 잔여 {{count}}명 | {{date}}, restam {{count}} vagas |
|  | `reservation.create.backToMap` | Go back | 돌아가기 | Voltar |
| ● | `reservation.create.booker.errors.nameRequired` | Enter the booker name. | 예약자 이름을 입력해 주세요. | Informe o nome de quem faz a reserva. |
| ● | `reservation.create.booker.errors.nameTooLong` | Use 100 characters or fewer. | 100자 이내로 입력해 주세요. | Use até 100 caracteres. |
| ● | `reservation.create.booker.errors.noteTooLong` | Use 500 characters or fewer. | 500자 이내로 입력해 주세요. | Use até 500 caracteres. |
| ● | `reservation.create.booker.errors.phoneInvalid` | Use digits and + ( ) - spaces only. | 숫자와 + ( ) - 공백만 입력할 수 있어요. | Use apenas dígitos, + ( ) - e espaços. |
| ● | `reservation.create.booker.errors.phoneRequired` | Enter a contact number. | 연락처를 입력해 주세요. | Informe um número de contato. |
| ● | `reservation.create.booker.errors.phoneTooLong` | Use 30 characters or fewer. | 30자 이내로 입력해 주세요. | Use até 30 caracteres. |
|  | `reservation.create.booker.name` | Booker name | 예약자 이름 | Nome de quem reserva |
|  | `reservation.create.booker.namePlaceholder` | Name for the reservation | 예약자 이름 | Nome para a reserva |
|  | `reservation.create.booker.note` | Requests | 요청 사항 | Solicitações |
|  | `reservation.create.booker.noteOptional` | Optional | 선택 | Opcional |
|  | `reservation.create.booker.notePlaceholder` | Anything the place should know | 장소에 전달할 요청 사항 | O que o lugar precisa saber |
|  | `reservation.create.booker.phone` | Contact number | 연락처 | Número de contato |
|  | `reservation.create.booker.phonePlaceholder` | Phone number | 전화번호 | Número de telefone |
|  | `reservation.create.booker.title` | Booker details | 예약자 정보 | Dados de quem reserva |
|  | `reservation.create.date` | Select date | 날짜 선택 | Selecionar data |
|  | `reservation.create.loadingPlace` | Loading place | 장소 불러오는 중 | Carregando lugar |
|  | `reservation.create.morning` | AM | 오전 | Manhã |
|  | `reservation.create.nextMonth` | Next month | 다음 달 | Próximo mês |
|  | `reservation.create.noCapacityForQuantity` | No current times can accommodate {{count}} guests. Review the published schedule and unavailable reasons below. | 현재 {{count}}명이 예약 가능한 시간은 없습니다. 아래에서 등록된 일정과 예약 불가 사유를 확인해 주세요. | No momento, nenhum horário comporta {{count}} pessoas. Confira abaixo os horários publicados e os motivos de indisponibilidade. |
|  | `reservation.create.noTimes` | No available times for this date. | 선택한 날짜에 예약 가능한 시간이 없습니다. | Não há horários disponíveis para esta data. |
|  | `reservation.create.noTimesInPeriod` | No times are available in this period. | 선택한 시간대에 등록된 일정이 없습니다. | Não há horários disponíveis neste período. |
|  | `reservation.create.people` | Guests | 인원 선택 | Pessoas |
|  | `reservation.create.peopleCount` | {{count}} | {{count}}명 | {{count}} |
|  | `reservation.create.peopleRange` | Booking for 1–12 guests · {{category}} | 예약인원: 1~12명 · {{category}} | Reserva para 1–12 pessoas · {{category}} |
|  | `reservation.create.previousMonth` | Previous month | 이전 달 | Mês anterior |
|  | `reservation.create.productInfoUnavailable` | This item can't be reserved right now because its product details are unavailable. | 상품 정보를 불러올 수 없어 현재 예약할 수 없습니다. | Este item não pode ser reservado agora porque os dados do produto estão indisponíveis. |
|  | `reservation.create.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `reservation.create.requestNote` | Request (optional) | 요청사항 (선택) | Solicitação (opcional) |
|  | `reservation.create.requestNotePlaceholder` | Add anything the venue should know | 장소에 전달할 내용을 입력하세요 | Adicione o que o lugar precisa saber |
|  | `reservation.create.scheduled` | Scheduled | 일정 있음 | Com horários |
| ● | `reservation.create.scheduledDateLabel` | {{date}}, schedules published | {{date}}, 일정 있음 | {{date}}, horários publicados |
|  | `reservation.create.selectAvailableDate` | Select an available date. | 예약 가능한 날짜를 선택해 주세요. | Selecione uma data disponível. |
|  | `reservation.create.selectedWindow` | Selected date & time | 선택한 일시 | Data e horário selecionados |
|  | `reservation.create.slotAvailable` | {{count}} spots remaining · Available | 잔여 {{count}}명 · 예약 가능 | Restam {{count}} vagas · Disponível |
|  | `reservation.create.slotInactive` | Unavailable · Inactive | 예약 불가 · 비활성 일정 | Indisponível · Inativo |
|  | `reservation.create.slotInsufficient` | {{count}} spots remaining · Not enough capacity | 잔여 {{count}}명 · 인원 부족 | Restam {{count}} vagas · Capacidade insuficiente |
|  | `reservation.create.slotPast` | Unavailable · Time has passed | 예약 불가 · 지난 시간 | Indisponível · O horário já passou |
|  | `reservation.create.submit` | Reserve | 예약하기 | Reservar |
| ● | `reservation.create.submitAccountError` | Only an active tourist account can make a reservation. | 활성화된 일반 사용자 계정만 예약할 수 있습니다. | Somente uma conta de turista ativa pode fazer reservas. |
| ● | `reservation.create.submitAvailabilityError` | This schedule is no longer available. Select another schedule. | 더 이상 예약할 수 없는 일정입니다. 다른 일정을 선택해 주세요. | Este horário não está mais disponível. Selecione outro. |
| ● | `reservation.create.submitCapacityError` | There are not enough spots remaining. Check the updated availability. | 잔여 인원이 부족합니다. 갱신된 일정을 확인해 주세요. | Não há vagas suficientes. Confira a disponibilidade atualizada. |
|  | `reservation.create.submitConflict` | That time was just filled or closed. Pick another slot. | 해당 시간이 방금 마감되었어요. 다른 시간을 선택해 주세요. | Esse horário acabou de lotar ou foi fechado. Escolha outro. |
| ● | `reservation.create.submitError` | Could not submit the reservation. Please try again. | 예약을 접수하지 못했습니다. 다시 시도해 주세요. | Não foi possível enviar a reserva. Tente novamente. |
| ● | `reservation.create.submitNetworkError` | We could not confirm your reservation. Check your reservations before submitting again. | 예약 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 예약함을 확인해 주세요. | Não conseguimos confirmar sua reserva. Confira suas reservas antes de enviar de novo. |
| ● | `reservation.create.submitValidationError` | Check the highlighted fields and try again. | 표시된 항목을 확인하고 다시 시도해 주세요. | Confira os campos destacados e tente novamente. |
|  | `reservation.create.successDescription` | You can check the confirmation status in Reservations. | 예약함에서 확정 상태를 확인할 수 있습니다. | Você pode acompanhar a confirmação em Reservas. |
|  | `reservation.create.successTitle` | Reservation requested | 예약 요청이 접수되었습니다 | Reserva solicitada |
|  | `reservation.create.time` | Select schedule | 시간 선택 | Selecionar horário |
|  | `reservation.create.title` | Reserve | 예약하기 | Reservar |
| ● | `reservation.create.unavailableDateLabel` | {{date}}, unavailable | {{date}}, 예약 불가 | {{date}}, indisponível |
|  | `reservation.create.unknownReservationType` | This reservation type isn't supported yet, so it can't be reserved. | 지원하지 않는 예약 유형이라 현재 예약할 수 없습니다. | Este tipo de reserva ainda não é compatível, então não pode ser reservado. |
|  | `reservation.create.weekdays.fri` | F | 금 | S |
|  | `reservation.create.weekdays.mon` | M | 월 | S |
|  | `reservation.create.weekdays.sat` | S | 토 | S |
|  | `reservation.create.weekdays.sun` | S | 일 | D |
|  | `reservation.create.weekdays.thu` | T | 목 | Q |
|  | `reservation.create.weekdays.tue` | T | 화 | T |
|  | `reservation.create.weekdays.wed` | W | 수 | Q |
|  | `reservation.create.windowPending` | The date and time will be shared once confirmed. | 예약 일시는 확정 후 안내됩니다. | A data e o horário serão informados após a confirmação. |
|  | `reservation.detail.bookerHidden` | Hidden | 비공개 | Oculto |
|  | `reservation.detail.bookerName` | Booker | 예약자 | Titular |
|  | `reservation.detail.bookerPhone` | Contact | 연락처 | Contato |
|  | `reservation.detail.identifier` | Reservation ID | 예약 식별자 | ID da reserva |
|  | `reservation.detail.loading` | Loading reservation details | 예약 상세를 불러오는 중이에요 | Carregando detalhes da reserva |
|  | `reservation.detail.noRequestNote` | No requests | 요청 사항 없음 | Sem solicitações |
|  | `reservation.detail.paymentAmount` | Minor amount and currency: {{value}} | 최소 화폐 단위 금액·통화: {{value}} | Valor na menor unidade e moeda: {{value}} |
|  | `reservation.detail.paymentFailure` | Failure code: {{value}} | 실패 코드: {{value}} | Código de falha: {{value}} |
|  | `reservation.detail.paymentIdentifier` | Payment #{{id}} | 결제 번호 {{id}} | Pagamento nº {{id}} |
|  | `reservation.detail.paymentProvider` | Provider: {{value}} | 결제 제공자: {{value}} | Provedor: {{value}} |
|  | `reservation.detail.payments` | Payments | 결제 내역 | Pagamentos |
|  | `reservation.detail.paymentsEmptyDescription` | This is a normal state until a payment is created. | 결제가 생성되기 전에는 정상적으로 비어 있을 수 있어요. | É normal ficar vazio até que um pagamento seja criado. |
|  | `reservation.detail.paymentsEmptyTitle` | No payment history | 결제 내역이 없어요 | Sem histórico de pagamentos |
|  | `reservation.detail.paymentsLoading` | Loading payments | 결제 내역을 불러오는 중이에요 | Carregando pagamentos |
|  | `reservation.detail.productType` | Product type | 상품 유형 | Tipo de produto |
|  | `reservation.detail.quantity` | Quantity | 예약 수량 | Quantidade |
|  | `reservation.detail.requestNote` | Requests | 요청 사항 | Solicitações |
|  | `reservation.detail.reservationWindow` | Reserved date & time | 예약 일시 | Data e horário da reserva |
|  | `reservation.detail.status` | Status | 예약 상태 | Status |
|  | `reservation.detail.title` | Reservation details | 예약 상세 | Detalhes da reserva |
|  | `reservation.detail.windowPending` | Shared once confirmed | 확정 후 안내 | Informado após a confirmação |
|  | `reservation.list.available` | Bookable | 예약 가능 | Reservável |
|  | `reservation.list.distanceFar` | {{kilometers}} km away | 여기서 {{kilometers}}km | A {{kilometers}} km |
|  | `reservation.list.distanceNear` | {{meters}} m away | 여기서 {{kilometers}}km | A {{meters}} m |
|  | `reservation.list.card.createdAt` | Requested at | 접수 일시 | Solicitada em |
|  | `reservation.list.card.detail` | View reservation details  › | 예약 상세 보기  › | Ver detalhes da reserva  › |
|  | `reservation.list.card.eyebrow` | My reservation | 내 예약 | Minha reserva |
| ● | `reservation.list.card.hint` | Opens reservation details | 예약 상세 화면으로 이동합니다 | Abre os detalhes da reserva |
|  | `reservation.list.card.label` | Reservation {{id}}, {{status}} | 예약 {{id}}, {{status}} | Reserva {{id}}, {{status}} |
|  | `reservation.list.card.number` | Reservation #{{id}} | 예약 번호 {{id}} | Reserva nº {{id}} |
|  | `reservation.list.card.productType` | Product type | 상품 유형 | Tipo de produto |
|  | `reservation.list.card.quantity` | Quantity | 예약 수량 | Quantidade |
|  | `reservation.list.card.quantityValue` | {{count}} guest(s) | {{count}}명 예약 | {{count}} pessoa(s) |
|  | `reservation.list.card.reservationWindow` | Reserved for | 예약 일시 | Reservada para |
|  | `reservation.list.card.reservationWindowValue` | Reserved {{value}} | {{value}} 예약 | Reservada para {{value}} |
|  | `reservation.list.card.requestedAtValue` | Requested {{value}} | {{value}} 접수 | Solicitada em {{value}} |
|  | `reservation.list.card.windowPending` | Shared once confirmed | 확정 후 안내 | Informado após a confirmação |
|  | `reservation.list.emptyDescription` | Find a place you like on the map. | 지도에서 마음에 드는 장소를 찾아보세요. | Encontre no mapa um lugar que você goste. |
|  | `reservation.list.emptyTitle` | No reservations yet | 아직 예약 내역이 없어요 | Você ainda não tem reservas |
| ● | `reservation.list.error` | Could not load reservations | 예약을 불러오지 못했어요 | Não foi possível carregar as reservas |
|  | `reservation.list.loading` | Loading reservations | 예약을 불러오는 중이에요 | Carregando reservas |
|  | `reservation.list.nearbySubtitle` | Discover places currently accepting reservations! | 현재 예약 가능 장소를 찾아드려요! | Descubra lugares que estão aceitando reservas agora! |
|  | `reservation.list.nearbyEmpty` | No nearby bookable places are available right now. | 현재 위치 주변에 예약 가능한 장소가 없어요. | No momento não há lugares reserváveis por perto. |
|  | `reservation.list.nearbyLoading` | Finding nearby bookable places… | 주변 예약 가능 장소를 찾는 중이에요… | Procurando lugares reserváveis por perto… |
|  | `reservation.list.nearbyTitle` | Reservations near your current location | 현재 위치 주변 예약 | Reservas perto da sua localização |
|  | `reservation.list.panelAdjust` | Resize reservation panel | 예약 패널 크기 조절 | Redimensionar o painel de reservas |
| ● | `reservation.list.previewLabel` | {{name}} reservation preview | {{name}} 예약 미리보기 | Prévia da reserva em {{name}} |
|  | `reservation.list.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `reservation.list.savedTitle` | Saved reservations | 예약함 | Reservas salvas |
|  | `reservation.list.statuses.canceled` | Canceled | 취소됨 | Cancelada |
|  | `reservation.list.statuses.confirmed` | Confirmed | 예약 확정 | Confirmada |
|  | `reservation.list.statuses.pending` | Pending confirmation | 확정 대기 | Aguardando confirmação |
|  | `reservation.list.statuses.rejected` | Rejected | 거절됨 | Recusada |
|  | `reservation.list.statuses.unknown` | Status needs review | 상태 확인 필요 | Status a confirmar |

## `community`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `community.title` | Community | 커뮤니티 | Comunidade |
|  | `community.categories.all` | All | 전체 | Tudo |
|  | `community.categories.spot` | Spots | 스팟 | Lugares |
|  | `community.categories.diary` | Diary | 다이어리 | Diário |
|  | `community.categories.ledger` | Expenses | 가계부 | Gastos |
|  | `community.sheetAdjust` | Adjust community panel | 커뮤니티 패널 조절 | Ajustar o painel da comunidade |
|  | `community.write` | Write | 작성하기 | Escrever |
|  | `community.moreOptions` | More options | 더보기 | Mais opções |
|  | `community.notInterested` | Not interested | 관심없음 | Não tenho interesse |
|  | `community.report` | Report | 신고하기 | Denunciar |
|  | `community.empty` | No posts yet | 아직 게시글이 없어요 | Ainda não há publicações |
|  | `community.author` | woo_sm | woo_sm | woo_sm |
|  | `community.like` | Like | 좋아요 | Curtir |
|  | `community.comment` | Comment | 댓글 | Comentar |
|  | `community.list.loading` | Loading posts… | 게시글을 불러오는 중… | Carregando publicações… |
| ● | `community.list.nextPageError` | Couldn't load more posts. | 게시글을 더 불러오지 못했어요. | Não foi possível carregar mais publicações. |
|  | `community.list.nextPageRetry` | Retry | 다시 시도 | Tentar novamente |
|  | `community.detail.back` | Back | 뒤로 | Voltar |
|  | `community.detail.settings` | Post options | 게시글 옵션 | Opções da publicação |
|  | `community.detail.placeTagPrefix` | View place | 장소 보기 | Ver lugar |
| ● | `community.detail.placeDeleted` | This place was removed | 삭제된 장소예요 | Este lugar foi removido |
| ● | `community.detail.placeCard.a11yLabel` | Connected place, {{name}} | 연결 장소, {{name}} | Lugar vinculado, {{name}} |
| ● | `community.detail.placeCard.a11yHint` | Opens the place detail | 장소 상세로 이동 | Abre os detalhes do lugar |
|  | `community.detail.placeCard.announceFailure` | Couldn't open this place. | 장소를 열지 못했어요. | Não foi possível abrir este lugar. |
| ● | `community.detail.placeCard.errors.unavailable` | This place can't be opened right now. | 장소를 불러올 수 없어요 | Este lugar não pode ser aberto agora. |
| ● | `community.detail.comments.headerLabel` | Comments | 댓글 | Comentários |
|  | `community.detail.comments.authorBadge` | Author | 작성자 | Autor |
|  | `community.detail.comments.count` | Comments {{count}} | 댓글 {{count}} | Comentários {{count}} |
| ● | `community.detail.comments.jumpA11yLabel` | Go to {{count}} comments | 댓글 {{count}}개로 이동 | Ir para {{count}} comentários |
|  | `community.detail.comments.loading` | Loading comments… | 댓글을 불러오는 중… | Carregando comentários… |
|  | `community.detail.comments.empty` | No comments yet. Be the first to leave one! | 아직 댓글이 없어요. 첫 댓글을 남겨보세요! | Ainda não há comentários. Seja a primeira pessoa a comentar! |
| ● | `community.detail.comments.errorRetry` | Retry | 다시 시도 | Tentar novamente |
| ● | `community.detail.comments.nextPageError` | Couldn't load more comments. | 댓글을 더 불러오지 못했어요. | Não foi possível carregar mais comentários. |
|  | `community.detail.comments.nextPageRetry` | Retry | 다시 시도 | Tentar novamente |
|  | `community.detail.comments.loadMore` | Show {{count}} more comments | 댓글 {{count}}개 더 보기 | Mostrar mais {{count}} comentários |
| ● | `community.detail.comments.a11yLabel` | {{author}}, {{time}}, {{content}} | {{author}}, {{time}}, {{content}} | {{author}}, {{time}}, {{content}} |
|  | `community.detail.comments.announceSuccess` | Your comment was posted. | 댓글이 등록되었어요. | Seu comentário foi publicado. |
|  | `community.detail.comments.announceFailure` | Your comment failed to post. | 댓글 등록에 실패했어요. | Não foi possível publicar seu comentário. |
|  | `community.detail.like.count_one` | Like {{count}} | 좋아요 {{count}} | Curtida {{count}} |
|  | `community.detail.like.count_other` | Like {{count}} | 좋아요 {{count}} | Curtidas {{count}} |
| ● | `community.detail.like.a11yLabel_one` | Like, {{count}} | 좋아요, {{count}}개 | Curtir, {{count}} |
| ● | `community.detail.like.a11yLabel_other` | Like, {{count}} | 좋아요, {{count}}개 | Curtir, {{count}} |
| ● | `community.detail.like.hintLike` | Double tap to like | 두 번 탭하여 좋아요 | Toque duas vezes para curtir |
| ● | `community.detail.like.hintUnlike` | Double tap to unlike | 두 번 탭하여 좋아요 취소 | Toque duas vezes para descurtir |
| ● | `community.detail.like.retryLabel` | Retry | 다시 시도 | Tentar novamente |
|  | `community.detail.like.announceLiked` | Liked. | 좋아요를 눌렀어요. | Curtido. |
|  | `community.detail.like.announceUnliked` | Like removed. | 좋아요를 취소했어요. | Curtida removida. |
|  | `community.detail.like.announceFailure` | Something went wrong. Please try again. | 문제가 발생했어요. 다시 시도해 주세요. | Algo deu errado. Tente novamente. |
|  | `community.detail.commentInput.label` | Write a comment | 댓글 입력 | Escreva um comentário |
|  | `community.detail.commentInput.placeholder` | Leave a comment | 댓글을 남겨주세요 | Deixe um comentário |
|  | `community.detail.commentInput.send` | Post comment | 댓글 등록 | Publicar comentário |
|  | `community.detail.commentInput.sendBusy` | Posting comment… | 댓글 등록 중… | Publicando comentário… |
|  | `community.detail.commentInput.counter` | {{count}}/{{max}} | {{count}}/{{max}} | {{count}}/{{max}} |
| ● | `community.detail.commentInput.validation.required` | Enter a comment. | 댓글 내용을 입력해 주세요. | Escreva um comentário. |
| ● | `community.detail.commentInput.validation.tooLong` | Comments must be 1,000 characters or fewer. | 댓글은 1,000자 이하로 입력해 주세요. | Os comentários devem ter até 1.000 caracteres. |
| ● | `community.detail.commentInput.errors.networkDuplicateWarning` | If the comment already went through, check the list before retrying. | 이미 댓글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | Se o comentário já foi publicado, confira a lista antes de tentar de novo. |
| ● | `community.detail.commentInput.errors.retry` | Retry | 다시 시도 | Tentar novamente |
| ● | `community.detail.commentInput.errors.signIn` | Sign in again | 다시 로그인 | Entrar novamente |
| ● | `community.detail.commentInput.errors.postNotFound` | This post couldn't be found. It may have been removed. | 게시글을 찾을 수 없어요. 삭제되었을 수 있어요. | Esta publicação não foi encontrada. Ela pode ter sido removida. |
|  | `community.write_screen.title` | Write a post | 글 작성하기 | Escrever uma publicação |
|  | `community.write_screen.back` | Cancel | 취소 | Cancelar |
| ● | `community.write_screen.categoryLabel` | Category | 카테고리 | Categoria |
| ● | `community.write_screen.categoryHint` | Choose the category that fits your post | 글에 맞는 카테고리를 선택해주세요 | Escolha a categoria que combina com sua publicação |
| ● | `community.write_screen.titleLabel` | Post | 글 작성 | Publicação |
|  | `community.write_screen.titlePlaceholder` | Enter a title | 제목을 입력해주세요. | Digite um título |
| ● | `community.write_screen.bodyLabel` | Content | 내용 | Conteúdo |
|  | `community.write_screen.bodyPlaceholder` | Share your story with the community | 본문을 입력해주세요. | Compartilhe sua história com a comunidade |
| ● | `community.write_screen.guideText` | Posts with abuse, defamation, or ads may be removed under our policy | 욕설·비방·광고성 글은 운영 정책에 따라 삭제될 수 있어요 | Publicações com ofensas, difamação ou anúncios podem ser removidas conforme nossa política |
|  | `community.write_screen.photoSection` | Photos | 사진 첨부 | Fotos |
|  | `community.write_screen.photoCount` | Up to {{count}} photos | 최대 {{count}}장까지 첨부할 수 있어요 | Até {{count}} fotos |
|  | `community.write_screen.addPhotos` | Add photos | 사진 추가 | Adicionar fotos |
|  | `community.write_screen.placeTagTitle` | Place tag | 장소 태그 | Marcação de lugar |
| ● | `community.write_screen.placeTagHint` | Tell us which place this post is about | 어떤 장소에 대한 글인지 알려주세요 | Conte para nós sobre qual lugar é esta publicação |
|  | `community.write_screen.addPlace` | Add place | 장소 추가 | Adicionar lugar |
|  | `community.write_screen.removePlace` | Remove {{name}} | {{name}} 삭제 | Remover {{name}} |
|  | `community.write_screen.submit` | Post | 등록하기 | Publicar |
|  | `community.write_screen.submitBusy` | Posting… | 등록 중… | Publicando… |
| ● | `community.write_screen.validation.titleRequired` | Enter a title. | 제목을 입력해 주세요. | Digite um título. |
| ● | `community.write_screen.validation.titleTooLong` | Title must be 50 characters or fewer. | 제목은 50자 이하로 입력해 주세요. | O título deve ter até 50 caracteres. |
| ● | `community.write_screen.validation.bodyRequired` | Enter content. | 내용을 입력해 주세요. | Digite o conteúdo. |
| ● | `community.write_screen.validation.contentTooLong` | Content must be 5,000 characters or fewer. | 내용은 5,000자 이하로 입력해 주세요. | O conteúdo deve ter até 5.000 caracteres. |
| ● | `community.write_screen.validation.tagRequired` | Choose at least one category. | 카테고리를 하나 이상 선택해 주세요. | Escolha pelo menos uma categoria. |
| ● | `community.write_screen.validation.categoryRequired` | Choose a category. | 카테고리를 선택해 주세요. | Escolha uma categoria. |
| ● | `community.write_screen.validation.placeRequired` | Add at least one place for the Place category. | 장소 카테고리는 장소를 1개 이상 선택해야 해요. | Adicione pelo menos um lugar para a categoria Lugares. |
|  | `community.write_screen.placePicker.close` | Close | 닫기 | Fechar |
|  | `community.write_screen.placePicker.placeholder` | Search for a place | 장소를 검색해 주세요 | Busque um lugar |
|  | `community.write_screen.placePicker.prompt` | Search for a registered place to tag | 태그할 등록된 장소를 검색해 주세요 | Busque um lugar cadastrado para marcar |
|  | `community.write_screen.placePicker.empty` | No matching places found | 검색 결과가 없어요 | Nenhum lugar encontrado |
| ● | `community.write_screen.placePicker.error` | Couldn't load places. | 장소를 불러오지 못했어요. | Não foi possível carregar os lugares. |
|  | `community.write_screen.placePicker.retry` | Retry | 다시 시도 | Tentar novamente |
|  | `community.write_screen.placePicker.disabled` | Place search is unavailable right now | 지금은 장소 검색을 사용할 수 없어요 | A busca de lugares está indisponível no momento |
| ● | `community.write_screen.errors.placeNotFound` | One of the connected places couldn't be found. Remove it and choose another. | 연결한 장소 중 하나를 찾을 수 없어요. 삭제하고 다시 선택해 주세요. | Um dos lugares vinculados não foi encontrado. Remova-o e escolha outro. |
| ● | `community.write_screen.errors.networkDuplicateWarning` | If the post already went through, check the list before retrying. | 이미 게시글이 등록되었을 수 있어요. 다시 시도하기 전에 목록을 확인해 주세요. | Se a publicação já foi enviada, confira a lista antes de tentar de novo. |
| ● | `community.write_screen.errors.retry` | Retry | 다시 시도 | Tentar novamente |
| ● | `community.write_screen.errors.signIn` | Sign in again | 다시 로그인 | Entrar novamente |
| ● | `community.write_screen.discard.title` | Discard this post? | 작성 중인 내용을 삭제할까요? | Descartar esta publicação? |
| ● | `community.write_screen.discard.body` | What you've written won't be saved. | 지금까지 작성한 내용이 저장되지 않아요. | O que você escreveu não será salvo. |
| ● | `community.write_screen.discard.cancel` | Keep editing | 계속 작성 | Continuar editando |
| ● | `community.write_screen.discard.confirm` | Discard | 삭제 | Descartar |
|  | `community.detail.like.count_many` | — | — | Curtidas {{count}} |
| ● | `community.detail.like.a11yLabel_many` | — | — | Curtir, {{count}} |

## `visitVerification`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `visitVerification.addPhotos` | Add photos | 사진 선택 | Adicionar fotos |
|  | `visitVerification.back` | Back | 뒤로 | Voltar |
|  | `visitVerification.distanceKm` | {{value}}km | {{value}}km | {{value}}km |
|  | `visitVerification.distanceMeters` | {{value}}m | {{value}}m | {{value}}m |
|  | `visitVerification.emptyDescription` | We could not find a place you can verify from your current location. Check your location and try again. | 현재 위치에서 검증할 수 있는 장소를 찾지 못했어요<br>현재 위치를 다시 확인해주세요 | Não encontramos um lugar que você possa verificar na sua localização atual. Confira sua localização e tente novamente. |
|  | `visitVerification.emptyTitle` | No places nearby to verify! | 근처에 검증할 장소가 없어요! | Não há lugares por perto para verificar! |
| ● | `visitVerification.errorTitle` | Could not load recent visits | 최근 방문을 불러오지 못했어요 | Não foi possível carregar as visitas recentes |
| ● | `visitVerification.permissionDenied` | Allow photo library access in Settings to attach photos. | 사진을 첨부하려면 설정에서 사진 접근 권한을 허용해 주세요. | Permita o acesso à biblioteca de fotos nas Configurações para anexar fotos. |
| ● | `visitVerification.permissionTitle` | Location access is off | 위치 권한이 꺼져 있어요 | O acesso à localização está desativado |
| ● | `visitVerification.locationPermissionDenied` | Allow location access to find places eligible for verification near you. | 주변에서 검증 가능한 장소를 찾으려면 위치 접근 권한을 허용해 주세요. | Permita o acesso à localização para encontrar lugares verificáveis perto de você. |
|  | `visitVerification.photoCount` | {{count}}/3 | {{count}}/3 | {{count}}/3 |
| ● | `visitVerification.photoDelete` | Remove photo {{index}} | {{index}}번째 사진 삭제 | Remover a foto {{index}} |
|  | `visitVerification.photoSection` | Attach photos | 사진 첨부 | Anexar fotos |
| ● | `visitVerification.placeError` | Could not load this place. | 장소 정보를 불러오지 못했어요. | Não foi possível carregar este lugar. |
|  | `visitVerification.placeLoading` | Loading place information... | 장소 정보를 불러오는 중이에요... | Carregando informações do lugar... |
|  | `visitVerification.placePhoto` | {{name}} photo {{index}} | {{name}} 사진 {{index}} | Foto {{index}} de {{name}} |
|  | `visitVerification.reasonHelp` | You can select up to 5 | 최대 5개까지 선택할 수 있어요 | Você pode selecionar até 5 |
|  | `visitVerification.reasonMoreCount` | {{count}} more reasons | 추천 이유 {{count}}개 더 있음 | Mais {{count}} motivos |
|  | `visitVerification.reasonSelectedSuffix` | /{{max}} selected | /{{max}}개 선택됨 | /{{max}} selecionados |
|  | `visitVerification.reasonSection` | Recommendation reasons | 추천 이유 | Motivos da recomendação |
|  | `visitVerification.reasons.clean` | Clean store | 매장이 깨끗해요 | Local limpo |
|  | `visitVerification.reasons.delicious` | Delicious | 맛있어요 | Delicioso |
|  | `visitVerification.reasons.easyToFind` | Easy to find | 찾기 쉬워요 | Fácil de encontrar |
|  | `visitVerification.reasons.kind` | Friendly | 친절해요 | Atendimento simpático |
|  | `visitVerification.reasons.multilingual` | Good multilingual descriptions | 다국어 설명이 잘 되어 있어요 | Boas descrições em vários idiomas |
|  | `visitVerification.reasons.parking` | Easy parking | 주차하기 편해요 | Fácil de estacionar |
|  | `visitVerification.reasons.photoSpot` | Great for photos | 사진 찍기 좋아요 | Ótimo para fotos |
|  | `visitVerification.recentVisits` | Recent visits | 최근 방문 | Visitas recentes |
|  | `visitVerification.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `visitVerification.return` | Go back | 돌아가기 | Voltar |
|  | `visitVerification.reviewPlaceholder` | Share your review with others, {{username}} | 다른 사람들에게 {{username}}님의 후기를 알려주세요 | {{username}}, compartilhe sua avaliação com outras pessoas |
|  | `visitVerification.reviewSection` | Write a review | 후기 작성 | Escrever uma avaliação |
|  | `visitVerification.submit` | Verify | 검증하기 | Verificar |
|  | `visitVerification.uploading` | Uploading photos... | 사진 업로드 중 | Enviando fotos... |
| ● | `visitVerification.errors.unsupportedFormat` | Choose a JPEG or PNG photo. HEIC is not supported. | JPEG 또는 PNG 사진을 선택해 주세요. HEIC 형식은 지원하지 않아요. | Escolha uma foto JPEG ou PNG. HEIC não é compatível. |
| ● | `visitVerification.errors.fileTooLarge` | This photo is too large. Choose a smaller photo. | 사진 용량이 너무 커요. 더 작은 사진을 선택해 주세요. | Esta foto é grande demais. Escolha uma menor. |
| ● | `visitVerification.errors.unauthenticated` | Sign in again to submit your review. | 후기를 제출하려면 다시 로그인해 주세요. | Entre novamente para enviar sua avaliação. |
| ● | `visitVerification.errors.forbidden` | You do not have permission to submit this review or photo. | 이 후기 또는 사진을 제출할 권한이 없어요. | Você não tem permissão para enviar esta avaliação ou foto. |
| ● | `visitVerification.errors.serverUnavailable` | The service is temporarily unavailable. Try again later. | 서비스를 일시적으로 이용할 수 없어요. 잠시 후 다시 시도해 주세요. | O serviço está temporariamente indisponível. Tente mais tarde. |
| ● | `visitVerification.errors.network` | Check your connection and try again. Your draft is preserved. | 네트워크를 확인한 뒤 다시 시도해 주세요. 작성 내용은 유지돼요. | Verifique sua conexão e tente novamente. Seu rascunho foi mantido. |
| ● | `visitVerification.errors.submitFailed` | Could not submit your review. Your draft is preserved. Try again. | 후기를 제출하지 못했어요. 작성 내용은 유지돼요. 다시 시도해 주세요. | Não foi possível enviar sua avaliação. Seu rascunho foi mantido. Tente novamente. |
|  | `visitVerification.submitting` | Submitting... | 제출 중 | Enviando... |
|  | `visitVerification.title` | Verify | 검증하기 | Verificar |
|  | `visitVerification.session.ambiguousPlace` | More than one place can be verified here. Move closer to one place and try again. | 현재 위치에서 여러 장소가 확인돼요. 한 장소에 더 가까이 이동한 뒤 다시 시도해 주세요. | Mais de um lugar pode ser verificado aqui. Aproxime-se de um deles e tente novamente. |
|  | `visitVerification.session.completionMissing` | Verification did not include the completed check-in. This visit cannot be treated as complete. | 완료된 체크인 정보가 없어 방문 완료로 처리할 수 없어요. | A verificação não incluiu o check-in concluído. Esta visita não pode ser considerada concluída. |
|  | `visitVerification.session.distance` | Latest distance: {{value}}m | 최근 거리: {{value}}m | Distância mais recente: {{value}}m |
|  | `visitVerification.session.dwell` | Required stay: {{value}} seconds | 요구 체류 시간: {{value}}초 | Permanência exigida: {{value}} segundos |
| ● | `visitVerification.session.foregroundBlocked` | Verification is paused. Return to the app to resume from the server status. | 인증이 일시 중지됐어요. 앱으로 돌아오면 서버 상태부터 복구해요. | A verificação está pausada. Volte ao app para retomar a partir do status do servidor. |
|  | `visitVerification.session.inactiveTourist` | Visit verification is available only to an active tourist account. | 활성 관광객 계정만 방문 인증을 이용할 수 있어요. | A verificação de visita está disponível apenas para contas de turista ativas. |
|  | `visitVerification.session.invalidObservation` | The location observation was rejected. Check your GPS signal and device time, then try again. | 위치 관측이 거절됐어요. GPS 신호와 기기 시간을 확인한 뒤 다시 시도해 주세요. | A leitura de localização foi rejeitada. Verifique o sinal de GPS e o horário do aparelho e tente novamente. |
|  | `visitVerification.session.locating` | Checking your location... | 위치를 확인하는 중이에요... | Verificando sua localização... |
| ● | `visitVerification.session.locationFailed` | Could not read your current location. Check permission and GPS, then try again. | 현재 위치를 확인하지 못했어요. 위치 권한과 GPS를 확인한 뒤 다시 시도해 주세요. | Não foi possível obter sua localização atual. Verifique a permissão e o GPS e tente novamente. |
| ● | `visitVerification.session.networkError` | A network error interrupted verification. This visit has not been completed. | 네트워크 오류로 인증이 중단됐어요. 방문 완료로 처리되지 않았어요. | Um erro de rede interrompeu a verificação. Esta visita não foi concluída. |
|  | `visitVerification.session.noPlace` | There is no open verification place at your current location. | 현재 위치에는 운영 중인 인증 대상 장소가 없어요. | Não há nenhum lugar de verificação aberto na sua localização atual. |
| ● | `visitVerification.session.permissionDenied` | Location permission is required to verify this visit. | 방문 인증에는 위치 권한이 필요해요. | A permissão de localização é necessária para verificar esta visita. |
|  | `visitVerification.session.progress` | Verification in progress | 인증 진행 중 | Verificação em andamento |
|  | `visitVerification.session.radius` | Allowed radius: {{value}}m | 허용 반경: {{value}}m | Raio permitido: {{value}}m |
|  | `visitVerification.session.ready` | Start only while you are at this place. | 이 장소에 머무는 동안에만 시작해 주세요. | Inicie apenas enquanto estiver neste lugar. |
|  | `visitVerification.session.recovering` | Restoring the verification session from the server... | 서버에서 진행 중인 인증 상태를 복구하는 중이에요... | Restaurando a sessão de verificação do servidor... |
|  | `visitVerification.session.remaining_one` | {{count}} second remaining | 남은 시간: {{count}}초 | Resta {{count}} segundo |
|  | `visitVerification.session.remaining_other` | {{count}} seconds remaining | 남은 시간: {{count}}초 | Restam {{count}} segundos |
|  | `visitVerification.session.start` | Start visit verification | 방문 인증 시작 | Iniciar verificação de visita |
|  | `visitVerification.session.starting` | Starting verification session... | 인증 세션을 시작하는 중이에요... | Iniciando a sessão de verificação... |
| ● | `visitVerification.session.serverError` | Could not verify the visit because of a server error. Try again. | 서버 오류로 방문을 인증하지 못했어요. 다시 시도해 주세요. | Não foi possível verificar a visita devido a um erro do servidor. Tente novamente. |
|  | `visitVerification.session.status.COMPLETED` | Visit verified | 인증 완료 | Visita verificada |
|  | `visitVerification.session.status.EXPIRED` | Verification session expired | 세션 만료 | A sessão de verificação expirou |
|  | `visitVerification.session.status.IN_PROGRESS` | Verification in progress | 인증 진행 중 | Verificação em andamento |
|  | `visitVerification.session.status.PROXIMITY_LOST` | You left the allowed radius | 반경 이탈 | Você saiu do raio permitido |
|  | `visitVerification.session.status.REJECTED` | Verification rejected | 인증 거절 | Verificação rejeitada |
|  | `visitVerification.session.status.STARTED` | Verification started | 인증 시작됨 | Verificação iniciada |
|  | `visitVerification.session.title` | Visit verification | 방문 인증 | Verificação de visita |
|  | `visitVerification.session.unauthenticated` | Sign in again to verify this visit. | 방문을 인증하려면 다시 로그인해 주세요. | Entre novamente para verificar esta visita. |
|  | `visitVerification.session.verifiedDwell` | Verified stay: {{value}} seconds | 인증된 체류 시간: {{value}}초 | Permanência verificada: {{value}} segundos |
|  | `visitVerification.unknownCategory` | Place | 장소 | Lugar |
| ● | `visitVerification.validation.contentRequired` | Write a review before submitting. | 후기를 작성해 주세요. | Escreva uma avaliação antes de enviar. |
| ● | `visitVerification.validation.contentTooLong` | Your review must be 2,000 characters or fewer. | 후기는 2,000자 이하로 작성해 주세요. | Sua avaliação deve ter até 2.000 caracteres. |
| ● | `visitVerification.validation.reasonRequired` | Select at least one recommendation reason. | 추천 이유를 한 개 이상 선택해 주세요. | Selecione pelo menos um motivo de recomendação. |
|  | `visitVerification.session.remaining_many` | — | — | Restam {{count}} segundos |

## `voiceAssistant`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `voiceAssistant.command.submission` | After 5 seconds without speech, recognized voice input is sent to the AI server automatically. Text input is sent when you use Send. Exact coordinates are used only by the existing place lookup. | 음성 입력은 5초 동안 말하지 않으면 인식된 내용을 AI 서버에 자동 전송합니다. 텍스트 입력은 보내기를 누르면 전송합니다. 정확한 현재 좌표는 기존 장소 조회에만 사용합니다. | Após 5 segundos sem fala, a entrada de voz reconhecida é enviada automaticamente ao servidor de IA. O texto é enviado quando você toca em Enviar. As coordenadas exatas são usadas apenas na busca de lugares existente. |
|  | `voiceAssistant.command.introTitle` | Before using AI | AI 사용 안내 | Antes de usar a IA |
|  | `voiceAssistant.command.introContinue` | Continue to AI | 확인하고 시작하기 | Continuar para a IA |
|  | `voiceAssistant.command.introClose` | Close | 닫기 | Fechar |
|  | `voiceAssistant.command.timezone` | Request timezone: {{timezone}} | 요청 시간대: {{timezone}} | Fuso horário da solicitação: {{timezone}} |
|  | `voiceAssistant.command.processing` | Checking place information. | 장소 정보를 확인하고 있습니다. | Verificando as informações do lugar. |
|  | `voiceAssistant.command.canceled` | Voice session ended. | 음성 세션을 종료했습니다. | A sessão de voz foi encerrada. |
| ● | `voiceAssistant.command.advisory` | Assistant response received. | 어시스턴트 응답을 받았습니다. | Resposta do assistente recebida. |
|  | `voiceAssistant.command.bounded` | Results checked among up to 12 nearby candidates. | 가까운 후보 최대 12곳에서 조건을 확인한 결과입니다. | Resultados verificados entre até 12 candidatos próximos. |
|  | `voiceAssistant.command.empty` | No matching results among the checked candidates. | 조회한 후보에 조건과 일치하는 결과가 없습니다. | Nenhum resultado correspondente entre os candidatos verificados. |
|  | `voiceAssistant.command.slots` | Actual server intervals. These do not confirm product bookability or a reservation. | 서버의 실제 이용 시간입니다. 상품의 예약 가능 여부나 예약 확정을 의미하지 않습니다. | São os intervalos reais do servidor. Eles não confirmam a disponibilidade do produto nem uma reserva. |
|  | `voiceAssistant.command.general` | General admission | 일반 이용 | Entrada geral |
|  | `voiceAssistant.command.capacity` | Remaining capacity: {{count}} | 남은 정원: {{count}}명 | Capacidade restante: {{count}} |
| ● | `voiceAssistant.command.failed` | The request could not be completed. Check your conditions and try again. | 요청을 완료하지 못했습니다. 조건을 확인하고 다시 시도해 주세요. | Não foi possível concluir a solicitação. Confira suas condições e tente novamente. |
|  | `voiceAssistant.command.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `voiceAssistant.command.resultSummary` | I found {{count}} place(s). The first result is “{{name}}”. | {{count}}곳을 찾았어요. 첫 번째 결과는 ‘{{name}}’이에요. | Encontrei {{count}} lugar(es). O primeiro resultado é “{{name}}”. |
|  | `voiceAssistant.command.showOnMap` | View on map | 지도에서 보기 | Ver no mapa |
|  | `voiceAssistant.command.directions` | Directions | 길찾기 | Como chegar |
|  | `voiceAssistant.command.share` | Share | 공유 | Compartilhar |
|  | `voiceAssistant.command.operating.OPERATING` | Operating | 운영 중 | Em funcionamento |
|  | `voiceAssistant.command.operating.TEMPORARILY_CLOSED` | Temporarily closed | 임시 휴업 | Fechado temporariamente |
|  | `voiceAssistant.command.operating.PERMANENTLY_CLOSED` | Permanently closed | 폐업 | Fechado permanentemente |
|  | `voiceAssistant.command.fields.touristCategory` | Specify a place category. | 장소 카테고리를 알려 주세요. | Informe uma categoria de lugar. |
|  | `voiceAssistant.command.fields.date` | Confirm the requested date. | 조회할 날짜를 확인해 주세요. | Confirme a data solicitada. |
|  | `voiceAssistant.command.fields.timeRange` | Confirm the timezone and start/end times. | 시간대와 시작·종료 시간을 확인해 주세요. | Confirme o fuso horário e os horários de início e término. |
|  | `voiceAssistant.command.fields.quantity` | Specify the number of people. | 인원을 알려 주세요. | Informe o número de pessoas. |
|  | `voiceAssistant.command.fields.useCurrentLocation` | Confirm current location use and permission. | 현재 위치 사용 여부와 위치 권한을 확인해 주세요. | Confirme o uso da localização atual e a permissão. |
|  | `voiceAssistant.command.fields.placeId` | Choose a place from the retrieved results. | 조회 결과에서 장소를 선택해 주세요. | Escolha um lugar entre os resultados obtidos. |
|  | `voiceAssistant.command.fields.availabilityId` | Choose a retrieved time slot. | 조회한 이용 시간을 선택해 주세요. | Escolha um horário entre os obtidos. |
| ● | `voiceAssistant.command.errors.LOCATION_REQUIRED` | Current location and location permission are required. | 현재 위치와 위치 권한이 필요합니다. | A localização atual e a permissão de localização são necessárias. |
| ● | `voiceAssistant.command.errors.ID_NOT_IN_CONTEXT` | Search again or select a verified place. | 장소를 다시 검색하거나 선택해 주세요. | Busque novamente ou selecione um lugar verificado. |
| ● | `voiceAssistant.command.errors.STALE_CONTEXT` | Your context changed. Submit a new request. | 조건이 변경되었습니다. 다시 요청해 주세요. | Seu contexto mudou. Envie uma nova solicitação. |
| ● | `voiceAssistant.command.errors.CANCELED` | Request canceled. | 요청이 취소되었습니다. | Solicitação cancelada. |
| ● | `voiceAssistant.command.errors.TIMEOUT` | The lookup timed out. | 조회 시간이 초과되었습니다. | A consulta excedeu o tempo limite. |
| ● | `voiceAssistant.command.errors.AUTHENTICATION_REQUIRED` | Sign in to continue. | 로그인이 필요합니다. | Entre para continuar. |
| ● | `voiceAssistant.command.errors.FORBIDDEN` | This request is not currently supported or allowed. | 현재 지원하지 않거나 허용되지 않는 요청입니다. | Esta solicitação não é compatível ou não é permitida no momento. |
| ● | `voiceAssistant.command.errors.NOT_FOUND` | Information was not found. | 정보를 찾을 수 없습니다. | As informações não foram encontradas. |
| ● | `voiceAssistant.command.errors.RATE_LIMITED` | Too many requests. Try again later. | 요청이 많습니다. 잠시 후 다시 시도해 주세요. | Muitas solicitações. Tente mais tarde. |
| ● | `voiceAssistant.command.errors.NETWORK_ERROR` | Check your network connection. | 네트워크 연결을 확인해 주세요. | Verifique sua conexão de rede. |
| ● | `voiceAssistant.command.errors.SERVER_ERROR` | The server is unavailable. Try again. | 서버에 연결할 수 없습니다. 다시 시도해 주세요. | O servidor está indisponível. Tente novamente. |
| ● | `voiceAssistant.command.errors.INVALID_SERVER_RESPONSE` | The server information could not be verified. | 서버 정보를 확인할 수 없습니다. | Não foi possível verificar as informações do servidor. |
| ● | `voiceAssistant.command.errors.REPLAY_CONFLICT` | Duplicate requests differ. Enter a new request. | 중복 요청의 내용이 다릅니다. 새 요청을 입력해 주세요. | As solicitações duplicadas são diferentes. Digite uma nova solicitação. |
|  | `voiceAssistant.open` | Open AI assistant | AI 어시스턴트 열기 | Abrir o assistente de IA |
| ● | `voiceAssistant.shortLabel` | AI | AI | IA |
|  | `voiceAssistant.brand` | Pingdy | Pingdy | Pingdy |
|  | `voiceAssistant.title` | AI assistant | AI 어시스턴트 | Assistente de IA |
|  | `voiceAssistant.close` | Close assistant | 어시스턴트 닫기 | Fechar o assistente |
|  | `voiceAssistant.microphone` | Start microphone | 마이크 시작 | Iniciar o microfone |
|  | `voiceAssistant.stop` | Stop and send | 중지하고 보내기 | Parar e enviar |
|  | `voiceAssistant.input` | Your request | 요청 내용 | Sua solicitação |
|  | `voiceAssistant.placeholder` | Ask me anything! | 무엇이든 물어보세요! | Pergunte o que quiser! |
|  | `voiceAssistant.listeningPrompt` | Listening... | 듣고있어요! | Ouvindo... |
|  | `voiceAssistant.settings` | Open microphone and speech recognition settings | 마이크·음성 인식 설정 열기 | Abrir as configurações de microfone e reconhecimento de fala |
|  | `voiceAssistant.preview` | Input preview: nothing is sent to a server. Use Send on the keyboard to prepare your text locally. | 입력 미리보기입니다. 서버로 전송되지 않으며, 키보드의 보내기를 누르면 기기 안에서 요청을 준비합니다. | Prévia da entrada: nada é enviado ao servidor. Toque em Enviar no teclado para preparar seu texto no aparelho. |
|  | `voiceAssistant.voiceUnavailable` | Voice recognition is unavailable on this device. You can use text input. | 이 기기에서는 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | O reconhecimento de fala não está disponível neste aparelho. Você pode digitar. |
|  | `voiceAssistant.feedback.unrecognized` | I’m not sure what you mean. Could you say that again? | 무슨 말을 하시는지 잘 모르겠어요, 다시 한번 부탁드려도 될까요? | Não entendi bem o que você quis dizer. Pode repetir? |
|  | `voiceAssistant.feedback.noSpeech` | I couldn’t hear a request. Could you say that again? | 말씀을 듣지 못했어요. 다시 한번 말씀해 주시겠어요? | Não ouvi nenhuma solicitação. Pode repetir? |
|  | `voiceAssistant.feedback.retry` | Speak again | 다시 말하기 | Falar de novo |
|  | `voiceAssistant.feedback.dismiss` | That’s okay | 괜찮아요 | Tudo bem |
|  | `voiceAssistant.localOnly` | Input prepared on this device. AI connection is not available yet; nothing was sent. | 이 기기에서 입력을 준비했습니다. AI 연결은 아직 제공되지 않아 전송하지 않았습니다. | Entrada preparada neste aparelho. A conexão com a IA ainda não está disponível; nada foi enviado. |
| ● | `voiceAssistant.advisory` | Assistant guidance may be inaccurate. Verify important details. | 어시스턴트 안내는 정확하지 않을 수 있습니다. 중요한 정보는 다시 확인해 주세요. | As orientações do assistente podem não ser precisas. Confira os detalhes importantes. |
|  | `voiceAssistant.invalidResponse` | The assistant response could not be verified. Please try again. | 어시스턴트 응답을 확인할 수 없습니다. 다시 시도해 주세요. | Não foi possível verificar a resposta do assistente. Tente novamente. |
|  | `voiceAssistant.clarification` | More information is needed | 추가 정보가 필요합니다 | Mais informações são necessárias |
| ● | `voiceAssistant.permissions.undetermined` | Microphone or speech recognition permission has not been requested. | 마이크 또는 음성 인식 권한을 아직 요청하지 않았습니다. | A permissão de microfone ou de reconhecimento de fala ainda não foi solicitada. |
| ● | `voiceAssistant.permissions.granted` | Microphone and speech recognition permissions allowed. | 마이크와 음성 인식 권한이 허용되었습니다. | Permissões de microfone e de reconhecimento de fala concedidas. |
| ● | `voiceAssistant.permissions.denied` | Microphone or speech recognition permission denied. You can retry or type instead. | 마이크 또는 음성 인식 권한이 거부되었습니다. 다시 요청하거나 텍스트를 입력해 주세요. | Permissão de microfone ou de reconhecimento de fala negada. Você pode tentar de novo ou digitar. |
| ● | `voiceAssistant.permissions.blocked` | Microphone or speech recognition access requires a change in system settings. You can type instead. | 시스템 설정에서 마이크 또는 음성 인식 권한을 변경해야 합니다. 텍스트 입력은 사용할 수 있습니다. | O acesso ao microfone ou ao reconhecimento de fala exige uma mudança nas configurações do sistema. Você pode digitar. |
| ● | `voiceAssistant.permissions.restricted` | Speech recognition is restricted by this device’s policy. You can type instead. | 기기 정책으로 음성 인식이 제한되어 있습니다. 텍스트로 입력해 주세요. | A política deste aparelho restringe o reconhecimento de fala. Você pode digitar. |
|  | `voiceAssistant.phases.idle` | Ready for input | 입력 대기 | Pronto para receber sua solicitação |
| ● | `voiceAssistant.phases.permissionRequesting` | Checking microphone and speech recognition permissions | 마이크·음성 인식 권한 확인 중 | Verificando as permissões de microfone e de reconhecimento de fala |
|  | `voiceAssistant.phases.listening` | Microphone on — listening | 마이크 켜짐 — 듣는 중 | Microfone ligado — ouvindo |
|  | `voiceAssistant.phases.processing` | Microphone stopping — processing speech | 마이크 중지 중 — 음성 처리 중 | Parando o microfone — processando a fala |
|  | `voiceAssistant.phases.final` | Final input ready | 최종 입력 준비됨 | Entrada final pronta |
|  | `voiceAssistant.phases.canceled` | Input canceled | 입력 취소됨 | Entrada cancelada |
| ● | `voiceAssistant.phases.permissionDenied` | Voice permission denied | 음성 입력 권한 거부됨 | Permissão de voz negada |
|  | `voiceAssistant.phases.unavailable` | Voice input unavailable | 음성 입력 사용 불가 | Entrada de voz indisponível |
| ● | `voiceAssistant.phases.error` | Input could not be completed | 입력을 완료하지 못했습니다 | Não foi possível concluir a entrada |
| ● | `voiceAssistant.errors.interrupted` | Audio was interrupted. Try again or type your request. | 다른 오디오 작업으로 중단되었습니다. 다시 시도하거나 텍스트로 입력해 주세요. | O áudio foi interrompido. Tente novamente ou digite sua solicitação. |
| ● | `voiceAssistant.errors.noSpeech` | No final speech was recognized. Try again or type your request. | 최종 음성을 인식하지 못했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | Nenhuma fala final foi reconhecida. Tente novamente ou digite sua solicitação. |
| ● | `voiceAssistant.errors.unavailable` | Speech recognition is unavailable. Please type your request. | 음성 인식을 사용할 수 없습니다. 텍스트로 입력해 주세요. | O reconhecimento de fala está indisponível. Digite sua solicitação. |
| ● | `voiceAssistant.errors.network` | The speech service could not connect. Check your network or type your request. | 음성 인식 서비스에 연결하지 못했습니다. 네트워크를 확인하거나 텍스트로 입력해 주세요. | O serviço de fala não conseguiu conectar. Verifique sua rede ou digite sua solicitação. |
| ● | `voiceAssistant.errors.failed` | Speech recognition failed. Please type or try again. | 음성 인식에 실패했습니다. 다시 시도하거나 텍스트로 입력해 주세요. | O reconhecimento de fala falhou. Digite ou tente novamente. |
| ● | `voiceAssistant.errors.empty` | Enter a request first. | 요청을 먼저 입력해 주세요. | Digite uma solicitação primeiro. |
| ● | `voiceAssistant.errors.tooLong` | Use 2,000 characters or fewer. | 2,000자 이내로 입력해 주세요. | Use até 2.000 caracteres. |
| ● | `voiceAssistant.errors.submitFailed` | Input could not be handed over. Close the assistant and start a new request. | 입력을 전달하지 못했습니다. 어시스턴트를 닫고 새 요청을 시작해 주세요. | Não foi possível entregar a entrada. Feche o assistente e inicie uma nova solicitação. |

## `selectLanguage`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `selectLanguage.title` | Select Language | 언어 선택 | Selecione o idioma |
|  | `selectLanguage.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | Vamos mostrar a melhor rota para você! |
|  | `selectLanguage.button` | Continue | 계속 | Continuar |
|  | `selectLanguage.search` | Search... | 검색하기 | Buscar... |
| ● | `selectLanguage.logoAccessibilityLabel` | PingDom logo | 핑덤 로고 | Logotipo do PingDom |
|  | `selectLanguage.options.en` | English | 영어 | Inglês |
|  | `selectLanguage.options.ko` | Korean | 한국어 | Coreano |
|  | `selectLanguage.options.ja` | 日本語 | 日本語 | Japonês |
|  | `selectLanguage.options.zh-CN` | Chinese (Simplified) | 중국어(간체) | Chinês (simplificado) |
|  | `selectLanguage.options.zh-TW` | Chinese (Traditional) | 중국어(번체) | Chinês (tradicional) |
|  | `selectLanguage.options.vi` | Vietnamese | 베트남어 | Vietnamita |
|  | `selectLanguage.options.es` | Spanish | 스페인어 | Espanhol |
|  | `selectLanguage.options.pt-BR` | Portuguese (Brazil) | 포르투갈어(브라질) | Português (Brasil) |
|  | `selectLanguage.progress` | Step {{current}} of {{total}} | 총 {{total}}단계 중 {{current}}단계 | Etapa {{current}} de {{total}} |

## `selectCountry`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `selectCountry.title` | Select Country | 국가 선택 | Selecione o país |
|  | `selectCountry.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | Vamos mostrar a melhor rota para você! |
|  | `selectCountry.button` | Continue | 계속 | Continuar |
|  | `selectCountry.search` | Search... | 검색하기 | Buscar... |

## `selectAge`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `selectAge.title` | Select Birth Year | 생년 선택 | Selecione o ano de nascimento |
|  | `selectAge.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | Vamos mostrar a melhor rota para você! |
|  | `selectAge.button` | Continue | 계속 | Continuar |

## `selectGender`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `selectGender.title` | Select gender | 성별 선택 | Selecione o gênero |
|  | `selectGender.subtitle` | We'll tell you the best route! | 최적의 경로를 알려드릴게요! | Vamos mostrar a melhor rota para você! |
|  | `selectGender.button` | Continue | 계속 | Continuar |
|  | `selectGender.male` | Male | 남성 | Masculino |
|  | `selectGender.female` | Female | 여성 | Feminino |
|  | `selectGender.other` | Prefer not to say | 비공개 | Prefiro não informar |

## `countries`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `countries.us` | United States | 미국 | Estados Unidos |
|  | `countries.cn` | China | 중국 | China |
|  | `countries.jp` | Japan | 일본 | Japão |
|  | `countries.th` | Thailand | 태국 | Tailândia |
|  | `countries.vn` | Vietnam | 베트남 | Vietnã |
|  | `countries.kr` | South Korea | 대한민국 | Coreia do Sul |

## `loginForeign`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `loginForeign.title` | Only Pingdom | 오직 핑덤 | Só no PingDom |
|  | `loginForeign.subtitle` | Let's find hidden<br>places in Korea! | 한국의 숨은 장소를<br>찾아보세요! | Vamos descobrir lugares<br>escondidos na Coreia! |
|  | `loginForeign.button` | Get Started | 시작하기 | Começar |

## `experience`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `experience.common.back` | Back to map | 지도로 돌아가기 | Voltar ao mapa |
|  | `experience.common.close` | Close | 닫기 | Fechar |
|  | `experience.common.loading` | Loading. Please wait. | 불러오는 중입니다. 잠시 기다려 주세요. | Carregando. Aguarde. |
|  | `experience.placeDetail.title` | Place details | 장소 상세 | Detalhes do lugar |
|  | `experience.placeDetail.open` | Open now | 영업 중 | Aberto agora |
|  | `experience.placeDetail.distance` | {{distance}} away | {{distance}} 거리 | A {{distance}} |
|  | `experience.placeDetail.checked` | Visitor information updated {{date}} | 방문자 정보 업데이트 {{date}} | Informações de visitantes atualizadas em {{date}} |
|  | `experience.placeDetail.couponPrice` | Coupon value {{price}} | 쿠폰 혜택 {{price}} | Valor do cupom {{price}} |
|  | `experience.placeDetail.checkIn` | Check in at this place | 이 장소에 체크인하기 | Fazer check-in neste lugar |
|  | `experience.placeDetail.coupon` | View available coupons | 사용 가능한 쿠폰 보기 | Ver cupons disponíveis |
|  | `experience.checkIn.title` | Check in | 체크인 | Check-in |
|  | `experience.checkIn.description` | Confirm that you are visiting this place to unlock local benefits. | 장소 방문을 확인하고 현지 방문객 혜택을 받아보세요. | Confirme que você está visitando este lugar para desbloquear benefícios locais. |
|  | `experience.checkIn.status` | Ready to confirm your location | 현재 위치 확인 준비 완료 | Pronto para confirmar sua localização |
|  | `experience.checkIn.action` | Confirm my location and complete check-in | 내 위치를 확인하고 체크인 완료하기 | Confirmar minha localização e concluir o check-in |
|  | `experience.checkIn.collapseVisits` | Show less | 접기 | Mostrar menos |
|  | `experience.checkIn.expandVisits` | Show all | 전체 보기 | Mostrar tudo |
|  | `experience.checkIn.loadMoreVisits` | Load more visits | 방문 기록 더 보기 | Carregar mais visitas |
| ● | `experience.checkIn.locationDenied` | Location permission is required to check in. | 체크인하려면 위치 권한이 필요합니다. | A permissão de localização é necessária para fazer check-in. |
| ● | `experience.checkIn.locationFailed` | Your current location could not be retrieved. | 현재 위치를 가져오지 못했습니다. | Não foi possível obter sua localização atual. |
|  | `experience.checkIn.locationLoading` | Checking your current location… | 현재 위치를 확인하고 있습니다… | Verificando sua localização atual… |
|  | `experience.checkIn.openSettings` | Open settings | 설정 열기 | Abrir configurações |
|  | `experience.checkIn.recentVisits` | Recent visits | 최근 방문 | Visitas recentes |
|  | `experience.checkIn.retryCheckIn` | Try check-in again | 체크인 다시 시도 | Tentar o check-in novamente |
|  | `experience.checkIn.retryLocation` | Try location again | 위치 다시 확인 | Tentar a localização novamente |
|  | `experience.checkIn.retryVisits` | Try loading visits again | 방문 기록 다시 불러오기 | Tentar carregar as visitas novamente |
|  | `experience.checkIn.selectedPlace` | Selected place ID {{placeId}} | 선택한 장소 ID {{placeId}} | ID do lugar selecionado {{placeId}} |
|  | `experience.checkIn.submitting` | Checking in. Please wait. | 체크인 중입니다. 잠시 기다려 주세요. | Fazendo check-in. Aguarde. |
|  | `experience.checkIn.success` | Check-in complete | 체크인이 완료되었습니다. | Check-in concluído |
|  | `experience.checkIn.visitDistance` | {{distance}} m away | 장소와 {{distance}}m 거리 | A {{distance}} m |
|  | `experience.checkIn.visitPlace` | Place ID {{placeId}} | 장소 ID {{placeId}} | ID do lugar {{placeId}} |
|  | `experience.checkIn.visitsEmpty` | No recent visits yet. | 아직 최근 방문 기록이 없습니다. | Ainda não há visitas recentes. |
|  | `experience.checkIn.visitsLoading` | Loading recent visits… | 최근 방문 기록을 불러오고 있습니다… | Carregando visitas recentes… |
| ● | `experience.checkIn.errors.authentication` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | Sua sessão expirou. Entre novamente. |
| ● | `experience.checkIn.errors.duplicate` | You have already checked in at this place under the current server policy. | 현재 서버 정책상 이미 체크인한 장소입니다. | Você já fez check-in neste lugar de acordo com a política atual do servidor. |
| ● | `experience.checkIn.errors.generic` | Check-in could not be completed. Please try again. | 체크인을 완료하지 못했습니다. 다시 시도해 주세요. | Não foi possível concluir o check-in. Tente novamente. |
| ● | `experience.checkIn.errors.network` | You appear to be offline. Check your connection and try again. | 네트워크에 연결되지 않았습니다. 연결을 확인한 뒤 다시 시도해 주세요. | Parece que você está offline. Verifique sua conexão e tente novamente. |
| ● | `experience.checkIn.errors.out-of-range` | You are too far from this place to check in. | 장소와 거리가 멀어 체크인할 수 없습니다. | Você está longe demais deste lugar para fazer check-in. |
|  | `experience.coupon.title` | Coupon wallet | 쿠폰 지갑 | Carteira de cupons |
|  | `experience.coupon.description` | Coupons that are ready to use appear here. | 바로 사용할 수 있는 쿠폰이 이곳에 표시됩니다. | Os cupons prontos para uso aparecem aqui. |
|  | `experience.coupon.status` | No available coupons | 사용 가능한 쿠폰 없음 | Nenhum cupom disponível |
|  | `experience.coupon.action` | Explore places offering visitor coupons | 방문객 쿠폰을 제공하는 장소 둘러보기 | Explore lugares que oferecem cupons para visitantes |

## `auth`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `auth.koreanEntry.title` | My own places, Pingdom | 나만의 장소, 핑덤 | Meus próprios lugares, PingDom |
|  | `auth.koreanEntry.subtitle` | Share your places<br>with visitors from abroad! | 당신만의 장소를<br>외국인들에게 공유해주세요! | Compartilhe seus lugares<br>com visitantes do exterior! |
|  | `auth.koreanEntry.existingAccount` | Already have an account?  | 이미 계정이 있으신가요?  | Já tem uma conta?  |
|  | `auth.koreanEntry.login` | Log in | 로그인 | Entrar |
|  | `auth.koreanEntry.start` | Get Started | 시작하기 | Começar |
|  | `auth.login.title` | Start Pingdom | 핑덤 시작하기 | Comece com o PingDom |
|  | `auth.login.username` | Username | 아이디 | Nome de usuário |
|  | `auth.login.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | Digite seu nome de usuário |
|  | `auth.login.password` | Password | 비밀번호 | Senha |
|  | `auth.login.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | Digite sua senha |
|  | `auth.login.submit` | Get Started | 시작하기 | Começar |
|  | `auth.login.submitting` | Logging in... | 로그인 중... | Entrando... |
|  | `auth.login.findUsername` | Find ID | 아이디 찾기 | Recuperar usuário |
|  | `auth.login.findPassword` | Find password | 비밀번호 찾기 | Recuperar senha |
|  | `auth.login.signup` | Sign up | 회원가입 | Cadastrar-se |
| ● | `auth.login.unknownError` | An unknown error occurred while logging in. | 로그인 중 알 수 없는 오류가 발생했습니다. | Ocorreu um erro desconhecido ao entrar. |
|  | `auth.passwordReset.confirmDescription` | Enter the reset code sent to {{email}} and choose a new password. | {{email}}로 보낸 재설정 코드를 입력하고 새 비밀번호를 설정해주세요. | Digite o código de redefinição enviado para {{email}} e escolha uma nova senha. |
|  | `auth.passwordReset.confirmTitle` | Set a new password | 새 비밀번호 설정 | Defina uma nova senha |
|  | `auth.passwordReset.invalidToken` | That reset code is not valid. Check the code or request a new one. | 재설정 코드가 올바르지 않습니다. 코드를 확인하거나 다시 요청해주세요. | Esse código de redefinição não é válido. Confira o código ou solicite um novo. |
|  | `auth.passwordReset.newPassword` | New password | 새 비밀번호 | Nova senha |
|  | `auth.passwordReset.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | Pelo menos 8 caracteres |
|  | `auth.passwordReset.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | A senha deve ter pelo menos 8 caracteres |
|  | `auth.passwordReset.processing` | Processing... | 처리 중... | Processando... |
|  | `auth.passwordReset.requestDescription` | Enter the email you signed up with. We will send you a reset code. | 가입한 이메일을 입력하시면 재설정 코드를 보내드려요. | Digite o e-mail usado no cadastro. Enviaremos um código de redefinição. |
|  | `auth.passwordReset.requestTitle` | Reset your password | 비밀번호 재설정 | Redefina sua senha |
|  | `auth.passwordReset.resend` | Send the code again | 코드 다시 보내기 | Enviar o código novamente |
|  | `auth.passwordReset.sendToken` | Send reset code | 재설정 코드 받기 | Enviar código de redefinição |
|  | `auth.passwordReset.submit` | Reset password | 비밀번호 재설정하기 | Redefinir senha |
|  | `auth.passwordReset.token` | Reset code | 재설정 코드 | Código de redefinição |
|  | `auth.passwordReset.tokenPlaceholder` | Enter the code from your email | 메일로 받은 코드를 입력하세요 | Digite o código do seu e-mail |
|  | `auth.passwordReset.tokenRequired` | Please enter the reset code | 재설정 코드를 입력해주세요 | Digite o código de redefinição |
| ● | `auth.passwordReset.unknownError` | An unknown error occurred while resetting your password. | 비밀번호 재설정 중 알 수 없는 오류가 발생했습니다. | Ocorreu um erro desconhecido ao redefinir sua senha. |
|  | `auth.signup.title` | Start Pingdom | 핑덤 시작하기 | Comece com o PingDom |
|  | `auth.signup.passwordTitle` | Confirm Password | 비밀번호 확인 | Confirme a senha |
|  | `auth.signup.username` | Username | 아이디 | Nome de usuário |
|  | `auth.signup.usernamePlaceholder` | Enter your username | 아이디를 입력하세요 | Digite seu nome de usuário |
|  | `auth.signup.email` | Email | 이메일 | E-mail |
|  | `auth.signup.emailPlaceholder` | Enter your email | 이메일을 입력하세요 | Digite seu e-mail |
|  | `auth.signup.password` | Password | 비밀번호 | Senha |
|  | `auth.signup.passwordPlaceholder` | Enter your password | 비밀번호를 입력하세요 | Digite sua senha |
|  | `auth.signup.passwordConfirm` | Confirm password | 비밀번호 확인 | Confirmar senha |
|  | `auth.signup.passwordConfirmPlaceholder` | Enter your password again | 비밀번호를 한번 더 입력하세요 | Digite sua senha novamente |
|  | `auth.signup.next` | Next | 다음 | Avançar |
|  | `auth.signup.start` | Get Started | 시작하기 | Começar |
|  | `auth.signup.processing` | Processing... | 처리 중... | Processando... |
| ● | `auth.signup.unknownError` | An unknown error occurred while signing up. | 회원가입 중 알 수 없는 오류가 발생했습니다. | Ocorreu um erro desconhecido ao cadastrar. |
| ● | `auth.validation.usernameRequired` | Please enter your username | 아이디를 입력해주세요 | Digite seu nome de usuário |
| ● | `auth.validation.emailRequired` | Please enter your email | 이메일을 입력해주세요 | Digite seu e-mail |
| ● | `auth.validation.emailInvalid` | Please enter a valid email address | 올바른 이메일 형식이 아닙니다 | Digite um endereço de e-mail válido |
| ● | `auth.validation.passwordRequired` | Please enter your password | 비밀번호를 입력해주세요 | Digite sua senha |
| ● | `auth.validation.passwordConfirmRequired` | Please enter your password again | 비밀번호를 한번 더 입력해주세요 | Digite sua senha novamente |
| ● | `auth.validation.passwordMismatch` | Passwords do not match | 비밀번호가 일치하지 않습니다 | As senhas não coincidem |

## `common`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `common.missingTranslation` | Translation unavailable | 번역을 제공할 수 없습니다 | Tradução indisponível |
|  | `common.navigation.back` | Go back | 뒤로 가기 | Voltar |
|  | `common.navigation.close` | Close | 닫기 | Fechar |
| ● | `common.navigation.exitHint` | Press back again to exit the app. | 뒤로가기를 한 번 더 누르면 앱이 종료됩니다. | Pressione voltar novamente para sair do app. |
|  | `common.navigation.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `common.unsupportedFeature.description` | This feature is not currently supported in the app. | 이 기능은 현재 앱에서 지원하지 않습니다. | Este recurso não é compatível com o app no momento. |
|  | `common.unsupportedFeature.title` | Not available in the app | 앱에서 제공하지 않는 기능 | Indisponível no app |
| ● | `common.apiError.timeout.title` | The response is taking too long | 응답 시간이 초과되었어요 | A resposta está demorando demais |
| ● | `common.apiError.timeout.description` | Check your connection and try loading again. | 연결을 확인하고 다시 조회해 주세요. | Verifique sua conexão e tente carregar novamente. |
| ● | `common.apiError.server.title` | Service temporarily unavailable | 서비스에 잠시 연결할 수 없어요 | Serviço temporariamente indisponível |
| ● | `common.apiError.server.description` | Please try loading again in a moment. | 잠시 후 다시 조회해 주세요. | Tente carregar novamente em instantes. |
| ● | `common.apiError.rateLimited.title` | Too many requests | 요청이 너무 많아요 | Muitas solicitações |
| ● | `common.apiError.rateLimited.description` | Please wait a moment before trying again. | 잠시 기다린 후 다시 시도해 주세요. | Aguarde um momento antes de tentar novamente. |
| ● | `common.apiError.mutationUnknown.title` | Result not confirmed | 처리 결과를 확인해 주세요 | Resultado não confirmado |
| ● | `common.apiError.mutationUnknown.description` | We could not confirm the result. Check the latest status before submitting again. | 처리 결과를 확인하지 못했어요. 다시 제출하기 전에 최신 상태를 확인해 주세요. | Não conseguimos confirmar o resultado. Confira o status mais recente antes de enviar de novo. |
| ● | `common.apiError.actions.back` | Go back | 목록으로 | Voltar |
| ● | `common.apiError.actions.retry` | Try again | 다시 시도 | Tentar novamente |
| ● | `common.apiError.actions.signIn` | Sign in again | 다시 로그인 | Entrar novamente |
| ● | `common.apiError.actions.update` | Update app | 앱 업데이트 | Atualizar o app |
| ● | `common.apiError.authentication.description` | Your session is no longer valid. Please sign in again. | 로그인 정보가 만료되었습니다. 다시 로그인해 주세요. | Sua sessão não é mais válida. Entre novamente. |
| ● | `common.apiError.authentication.title` | Sign-in required | 로그인이 필요합니다 | É necessário entrar |
| ● | `common.apiError.authorization.description` | This account does not have permission for this action. | 이 계정에는 해당 작업을 수행할 권한이 없습니다. | Esta conta não tem permissão para esta ação. |
| ● | `common.apiError.authorization.title` | Permission required | 권한이 필요합니다 | Permissão necessária |
| ● | `common.apiError.conflict.description` | The request conflicts with the resource’s current state. Refresh its latest state. | 리소스의 현재 상태와 요청이 충돌합니다. 최신 상태를 확인해 주세요. | A solicitação entra em conflito com o estado atual do recurso. Atualize para ver o estado mais recente. |
| ● | `common.apiError.conflict.title` | State has changed | 상태가 변경되었습니다 | O estado mudou |
| ● | `common.apiError.expired.description` | This coupon or resource has expired. | 쿠폰 또는 리소스의 이용 기간이 만료되었습니다. | Este cupom ou recurso expirou. |
| ● | `common.apiError.expired.title` | No longer available | 더 이상 이용할 수 없습니다 | Não está mais disponível |
| ● | `common.apiError.generic.description` | Please check your connection and try again. | 네트워크 상태를 확인한 후 다시 시도해 주세요. | Verifique sua conexão e tente novamente. |
| ● | `common.apiError.generic.title` | Could not load data | 데이터를 불러오지 못했습니다 | Não foi possível carregar os dados |
| ● | `common.apiError.network.description` | We could not reach the server. Check your connection and try again. | 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요. | Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente. |
| ● | `common.apiError.network.title` | Connection problem | 연결에 문제가 있습니다 | Problema de conexão |
| ● | `common.apiError.notFound.description` | The requested resource no longer exists. Return to the latest list. | 요청한 항목이 더 이상 존재하지 않습니다. 최신 목록으로 돌아가 주세요. | O recurso solicitado não existe mais. Volte para a lista mais recente. |
| ● | `common.apiError.notFound.title` | Not found | 항목을 찾을 수 없습니다 | Não encontrado |
| ● | `common.apiError.outOfRange.description` | Move closer to the place and check your location accuracy. | 장소에 더 가까이 이동하고 위치 정확도를 확인해 주세요. | Aproxime-se do lugar e verifique a precisão da sua localização. |
| ● | `common.apiError.outOfRange.title` | Too far away to check in | 체크인 가능 거리 밖입니다 | Longe demais para fazer check-in |
| ● | `common.apiError.updateRequired.description` | Install the latest version to keep using PingDom. | PingDom을 계속 사용하려면 최신 버전을 설치해 주세요. | Instale a versão mais recente para continuar usando o PingDom. |
| ● | `common.apiError.updateRequired.title` | Update required | 앱 업데이트가 필요합니다 | Atualização necessária |
| ● | `common.apiError.validation.description` | Review the highlighted information and try again. | 입력한 정보를 확인한 후 다시 시도해 주세요. | Confira as informações destacadas e tente novamente. |
| ● | `common.apiError.validation.title` | Check your entries | 입력 정보를 확인해 주세요 | Confira seus dados |
| ● | `common.error.description` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Tente novamente em instantes. |
| ● | `common.error.retry` | Try again | 다시 시도 | Tentar novamente |
| ● | `common.error.title` | Something went wrong | 문제가 발생했습니다 | Algo deu errado |

## `placeMenu`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `placeMenu.exchange.amount` | Approx. {{price}} | 약 {{price}} | Aprox. {{price}} |
|  | `placeMenu.exchange.loading` | Loading exchange rate… | 환율을 불러오는 중입니다… | Carregando taxa de câmbio… |
|  | `placeMenu.exchange.retry` | Exchange rate unavailable · Try again | 환율 조회 실패 · 다시 시도 | Taxa de câmbio indisponível · Tentar novamente |
| ● | `placeMenu.accessibility.image` | {{name}} menu image | {{name}} 메뉴 이미지 | Imagem do cardápio de {{name}} |
| ● | `placeMenu.accessibility.imageUnavailable` | No image for {{name}} | {{name}} 메뉴 이미지 없음 | Sem imagem de {{name}} |
| ● | `placeMenu.accessibility.price` | Price: {{price}} | 가격: {{price}} | Preço: {{price}} |
| ● | `placeMenu.accessibility.status` | {{name}} status: {{status}} | {{name}} 상태: {{status}} | Status de {{name}}: {{status}} |
| ● | `placeMenu.error.notFound` | The place details and menu data are temporarily out of sync. Refresh this menu or return to the map. | 장소 상세와 메뉴 데이터가 일시적으로 일치하지 않습니다. 메뉴를 새로고침하거나 지도로 돌아가 주세요. | Os detalhes do lugar e os dados do cardápio estão temporariamente fora de sincronia. Atualize o cardápio ou volte ao mapa. |
| ● | `placeMenu.error.title` | Could not load the menu. | 메뉴를 불러오지 못했습니다. | Não foi possível carregar o cardápio. |
|  | `placeMenu.empty` | No menu has been added yet. | 등록된 메뉴가 없습니다. | Nenhum cardápio foi adicionado ainda. |
|  | `placeMenu.imageUnavailable` | No image | 이미지 없음 | Sem imagem |
|  | `placeMenu.loading` | Loading menu… | 메뉴를 불러오는 중입니다… | Carregando cardápio… |
|  | `placeMenu.priceUnavailable` | Price unavailable | 가격 정보 없음 | Preço indisponível |
|  | `placeMenu.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `placeMenu.soldOut` | Sold out | 품절 | Esgotado |
|  | `placeMenu.title` | Menu | 메뉴 | Cardápio |

## `examplePlaces`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `examplePlaces.count` | {{count}} places | 장소 {{count}}개 | {{count}} lugares |
|  | `examplePlaces.englishMenu` | English menu: {{status}} | 영문 메뉴: {{status}} | Cardápio em inglês: {{status}} |
|  | `examplePlaces.emptyDescription` | Try again after place data is available. | 장소 데이터가 등록된 후 다시 확인해 주세요. | Tente novamente quando houver dados de lugares. |
|  | `examplePlaces.emptyTitle` | No places yet | 아직 등록된 장소가 없습니다 | Ainda não há lugares |
|  | `examplePlaces.loading` | Loading places... | 장소를 불러오는 중입니다... | Carregando lugares... |
|  | `examplePlaces.title` | Place list example | 장소 목록 예제 | Exemplo de lista de lugares |
|  | `examplePlaces.trustScore` | Trust score: {{score}}/100 | 신뢰 점수: {{score}}/100 | Pontuação de confiança: {{score}}/100 |

## `merchant`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `merchant.pendingDescription` | Merchant {{merchantId}} is not available yet. | 상점 {{merchantId}}는 아직 준비 중입니다. | O estabelecimento {{merchantId}} ainda não está disponível. |
|  | `merchant.title` | Merchant | 상점 | Estabelecimento |

## `onboarding`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `onboarding.preferenceFlow.loading` | Restoring your saved travel preferences... | 저장된 여행 선호를 불러오는 중입니다... | Restaurando suas preferências de viagem salvas... |
| ● | `onboarding.preferenceFlow.restoreError` | Saved preferences could not be restored. You can continue with new selections. | 저장된 선택을 불러오지 못했어요. 새로 선택해 계속할 수 있어요. | Não foi possível restaurar as preferências salvas. Você pode continuar com novas escolhas. |
| ● | `onboarding.preferenceFlow.saveError` | Your selections could not be saved. Please try Continue again. | 선택값을 저장하지 못했어요. 계속 버튼을 다시 눌러 주세요. | Não foi possível salvar suas escolhas. Toque em Continuar novamente. |
|  | `onboarding.preferences.currentNeeds.attendEvent` | Events | 이벤트 관람 | Eventos |
|  | `onboarding.preferences.currentNeeds.cafe` | Cafe | 카페 | Café |
|  | `onboarding.preferences.currentNeeds.eat` | Food | 식사 | Comida |
|  | `onboarding.preferences.currentNeeds.explore` | Explore | 둘러보기 | Explorar |
|  | `onboarding.preferences.currentNeeds.nightlife` | Nightlife | 나이트라이프 | Vida noturna |
|  | `onboarding.preferences.currentNeeds.shop` | Shopping | 쇼핑 | Compras |
|  | `onboarding.preferences.travelPurposes.beauty` | Beauty | 뷰티 | Beleza |
|  | `onboarding.preferences.travelPurposes.cafe` | Cafe | 카페 | Café |
|  | `onboarding.preferences.travelPurposes.exhibition` | Exhibition | 전시 | Exposições |
|  | `onboarding.preferences.travelPurposes.fashion` | Fashion | 패션 | Moda |
|  | `onboarding.preferences.travelPurposes.food` | Food | 음식 | Comida |
|  | `onboarding.preferences.travelPurposes.kPop` | Music | 음악 | Música |
|  | `onboarding.preferences.travelPurposes.other` | Others | 기타 | Outros |
|  | `onboarding.preferences.travelPurposes.popUp` | Pop-up | 팝업 | Pop-up |
|  | `onboarding.travelScheduleScreen.back` | Back | 뒤로 가기 | Voltar |
|  | `onboarding.travelScheduleScreen.calendar` | Travel date calendar | 여행 일정 달력 | Calendário de datas da viagem |
|  | `onboarding.travelScheduleScreen.continue` | Continue | 계속 | Continuar |
|  | `onboarding.travelScheduleScreen.description` | Please select your start and end dates | 여행 시작일과 종료일을 선택해 주세요 | Selecione as datas de início e de término |
|  | `onboarding.travelScheduleScreen.emptyDate` | Not selected | 선택 전 | Não selecionada |
|  | `onboarding.travelScheduleScreen.endDate` | End date | 종료일 | Data de término |
|  | `onboarding.travelScheduleScreen.invalidRange` | Check your dates and select a valid range again. | 날짜를 확인하고 올바른 기간을 다시 선택해 주세요. | Confira as datas e selecione novamente um período válido. |
|  | `onboarding.travelScheduleScreen.nextMonth` | Next month | 다음 달 | Próximo mês |
|  | `onboarding.travelScheduleScreen.previousMonth` | Previous month | 이전 달 | Mês anterior |
|  | `onboarding.travelScheduleScreen.progress` | Onboarding progress | 온보딩 진행 단계 | Progresso da configuração inicial |
|  | `onboarding.travelScheduleScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | Etapa {{current}} de {{total}} |
|  | `onboarding.travelScheduleScreen.startDate` | Start date | 시작일 | Data de início |
|  | `onboarding.travelScheduleScreen.title` | Select Travel Dates | 여행 일정을 알려주세요 | Selecione as datas da viagem |
|  | `onboarding.travelScheduleScreen.weekdays.fri` | F | 금 | S |
|  | `onboarding.travelScheduleScreen.weekdays.mon` | M | 월 | S |
|  | `onboarding.travelScheduleScreen.weekdays.sat` | S | 토 | S |
|  | `onboarding.travelScheduleScreen.weekdays.sun` | S | 일 | D |
|  | `onboarding.travelScheduleScreen.weekdays.thu` | T | 목 | Q |
|  | `onboarding.travelScheduleScreen.weekdays.tue` | T | 화 | T |
|  | `onboarding.travelScheduleScreen.weekdays.wed` | W | 수 | Q |
|  | `onboarding.travelPurposeScreen.back` | Back | 뒤로 가기 | Voltar |
|  | `onboarding.travelPurposeScreen.continue` | Continue | 계속 | Continuar |
|  | `onboarding.travelPurposeScreen.description` | We'll recommend hot places that match your interests | 관심사에 맞는 핫플레이스를 추천해드릴게요 | Vamos recomendar lugares em alta de acordo com seus interesses |
|  | `onboarding.travelPurposeScreen.progress` | Onboarding progress | 온보딩 진행 단계 | Progresso da configuração inicial |
|  | `onboarding.travelPurposeScreen.progressValue` | Step {{current}} of {{total}} | {{total}}단계 중 {{current}}단계 | Etapa {{current}} de {{total}} |
|  | `onboarding.travelPurposeScreen.title` | Select Travel Purpose | 여행 목적을 선택해 주세요 | Selecione o objetivo da viagem |

## `map`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `map.decision.backToRecommendations` | Back to recommendations | 추천으로 돌아가기 | Voltar às sugestões |
|  | `map.decision.emptyBody` | Try another keyword or remove a visit condition. | 다른 검색어를 입력하거나 방문 조건을 해제해 보세요. | Tente outra palavra-chave ou remova uma condição de visita. |
|  | `map.decision.emptyTitle` | No matching places yet | 일치하는 장소가 아직 없어요 | Ainda não há lugares correspondentes |
|  | `map.decision.filters.bookable` | Bookable | 예약 가능 | Reservável |
|  | `map.decision.filters.coupon` | Coupon | 쿠폰 | Cupom |
|  | `map.decision.filters.openNow` | Open now | 영업 중 | Aberto agora |
|  | `map.decision.filters.shortWait` | Short wait | 대기 짧음 | Pouca espera |
|  | `map.decision.getCoupon` | Get coupon | 쿠폰 받기 | Pegar cupom |
|  | `map.decision.couponMessage` | {{placeName}} coupon will be available here. | {{placeName}} 쿠폰을 이곳에서 받을 수 있어요. | O cupom de {{placeName}} ficará disponível aqui. |
|  | `map.decision.goNow` | Go now | 바로 가기 | Ir agora |
|  | `map.decision.goNowMessage` | Directions to {{placeName}} are ready. | {{placeName}}까지 길안내를 준비했어요. | A rota para {{placeName}} está pronta. |
|  | `map.decision.livePicks` | LIVE PICKS | 지금 인기 장소 | DESTAQUES AO VIVO |
|  | `map.decision.map` | Map | 지도 | Mapa |
|  | `map.decision.nearMe` | Near me | 내 위치 | Perto de mim |
|  | `map.decision.nearYou` | Near you | 내 주변 | Perto de você |
|  | `map.decision.noResults` | No matching places yet | 일치하는 장소가 아직 없어요 | Ainda não há lugares correspondentes |
|  | `map.decision.placesLiveNearby_one` | {{count}} place live nearby | 내 주변 {{count}}곳 운영 중 | {{count}} lugar ativo por perto |
|  | `map.decision.placesLiveNearby_other` | {{count}} places live nearby | 내 주변 {{count}}곳 운영 중 | {{count}} lugares ativos por perto |
|  | `map.decision.placesNearYou` | Places near you | 내 주변 장소 | Lugares perto de você |
| ● | `map.decision.profileAccessibilityLabel` | Open profile | 프로필 열기 | Abrir perfil |
|  | `map.decision.recommended` | Recommended | 추천순 | Recomendados |
|  | `map.decision.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | Resultados para “{{query}}” |
| ● | `map.decision.searchAccessibilityLabel` | Search places | 장소 검색 | Buscar lugares |
|  | `map.decision.searchPlaceholder` | Search places | 장소를 검색하세요 | Buscar lugares |
|  | `map.decision.seeAll` | See all | 전체 보기 | Ver tudo |
|  | `map.decision.status.openNow` | Open now | 영업 중 | Aberto agora |
|  | `map.decision.status.verified` | Visitor verified · {{time}} | 방문자 확인 · {{time}} | Verificado por visitantes · {{time}} |
|  | `map.decision.status.wait` | Wait {{wait}} | 대기 {{wait}} | Espera {{wait}} |
|  | `map.decision.transit` | Transit | 대중교통 | Transporte público |
|  | `map.decision.whereToGo` | Where to go now | 지금 어디로 갈까요? | Para onde ir agora? |
|  | `map.card.actions.arrive` | Arrive | 도착 | Chegada |
|  | `map.card.actions.directions` | Directions | 길찾기 | Como chegar |
|  | `map.card.actions.reserve` | Reserve | 예약 | Reservar |
|  | `map.card.actions.share` | Share | 공유 | Compartilhar |
|  | `map.card.actions.start` | Start | 출발 | Partida |
|  | `map.card.closed` | Closed now | 영업 종료 | Fechado agora |
|  | `map.card.dismiss` | Dismiss place preview | 장소 미리보기 닫기 | Fechar a prévia do lugar |
| ● | `map.card.error` | Could not load this place. | 장소 정보를 불러오지 못했습니다. | Não foi possível carregar este lugar. |
|  | `map.card.favorite` | Save place | 장소 저장 | Salvar lugar |
| ● | `map.card.imageLabel` | {{name}} photo | {{name}} 사진 | Foto de {{name}} |
|  | `map.card.imageUnavailable` | No photo | 사진 없음 | Sem foto |
|  | `map.card.loading` | Loading place preview... | 장소 미리보기를 불러오는 중입니다... | Carregando a prévia do lugar... |
|  | `map.card.open` | Open now | 영업 중 | Aberto agora |
| ● | `map.card.openHint` | Opens place details | 장소 상세를 엽니다 | Abre os detalhes do lugar |
|  | `map.card.preview` | Place preview | 장소 미리보기 | Prévia do lugar |
|  | `map.card.statusUnknown` | Status unknown | 영업 상태 미확인 | Status desconhecido |
|  | `map.card.support.coupon` | Coupons available | 쿠폰 사용 가능 | Cupons disponíveis |
|  | `map.card.support.english` | English support | 영어응대 가능 | Atendimento em inglês |
|  | `map.card.support.englishMenu` | English menu | 영문 메뉴 | Cardápio em inglês |
|  | `map.card.support.foreignCard` | Foreign cards | 해외카드 가능 | Cartões estrangeiros |
|  | `map.card.support.reservation` | Reservations | 예약 가능 | Reservas |
|  | `map.card.support.wifi` | Free Wi-Fi | 무료 Wi-Fi | Wi-Fi grátis |
|  | `map.placeActions.departureUnsupported` | Starting from a place is not supported yet. | 출발 기능은 아직 지원하지 않습니다. | Ainda não é possível partir de um lugar. |
| ● | `map.placeActions.directionsFailed` | Could not start directions. | 길찾기를 실행하지 못했습니다. | Não foi possível iniciar a rota. |
|  | `map.placeActions.directionsUnavailable` | Could not open an external map. | 외부 지도 앱을 열 수 없습니다. | Não foi possível abrir um mapa externo. |
|  | `map.placeActions.locationMissing` | This place has no location information. | 장소 위치 정보가 없습니다. | Este lugar não tem informações de localização. |
| ● | `map.placeActions.shareFailed` | Could not share this place. | 공유를 실행하지 못했습니다. | Não foi possível compartilhar este lugar. |
|  | `map.placeActions.shareUnavailable` | Sharing is not available on this device. | 이 기기에서는 공유 기능을 사용할 수 없습니다. | O compartilhamento não está disponível neste aparelho. |
|  | `map.data.disabledDescription` | Enable the place-list runtime setting to request server data. | 장소 목록 실행 설정을 켜면 서버 데이터를 요청합니다. | Ative a configuração de execução da lista de lugares para solicitar dados do servidor. |
|  | `map.data.disabledTitle` | Place discovery is off | 장소 탐색 기능이 꺼져 있어요 | A descoberta de lugares está desativada |
|  | `map.data.emptyDescription` | Move the map or change the search filters. | 지도를 이동하거나 검색 필터를 바꿔 보세요. | Mova o mapa ou altere os filtros de busca. |
|  | `map.data.emptyTitle` | No places in this area | 이 지역에 장소가 없습니다 | Não há lugares nesta área |
| ● | `map.data.errorDescription` | Check your connection and try again. | 네트워크를 확인한 후 다시 시도해 주세요. | Verifique sua conexão e tente novamente. |
| ● | `map.data.errorTitle` | Could not load places | 장소를 불러오지 못했습니다 | Não foi possível carregar os lugares |
|  | `map.data.loading` | Loading places... | 장소를 불러오는 중입니다... | Carregando lugares... |
|  | `map.data.mockDescription` | These markers come from the explicitly selected development transport. | 명시적으로 선택한 개발 transport의 합성 마커입니다. | Estes marcadores vêm do transport de desenvolvimento selecionado explicitamente. |
|  | `map.data.mockTitle` | Development Mock places | 개발 Mock 장소 | Lugares Mock de desenvolvimento |
|  | `map.data.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `map.distanceMeters` | {{count}} m | {{count}}m | {{count}} m |
|  | `map.filters.all` | All | 전체 | Tudo |
|  | `map.filters.cafe` | Cafe | 카페 | Café |
|  | `map.filters.fashion` | Fashion | 패션 | Moda |
|  | `map.filters.food` | Food | 음식 | Comida |
|  | `map.filters.music` | Music | 음악 | Música |
|  | `map.categories.all` | All | 전체 | Tudo |
|  | `map.categories.art` | Exhibitions | 전시 | Exposições |
|  | `map.categories.beauty` | Beauty | 뷰티 | Beleza |
|  | `map.categories.cafe` | Cafe | 카페 | Café |
|  | `map.categories.etc` | Other | 기타 | Outros |
|  | `map.categories.fashion` | Fashion | 패션 | Moda |
|  | `map.categories.food` | Restaurants | 음식점 | Restaurantes |
|  | `map.categories.heritage` | Cultural heritage | 문화재 | Patrimônio cultural |
|  | `map.categories.music` | Music | 음악 | Música |
|  | `map.categories.popup` | Pop-ups | 팝업 | Pop-ups |
|  | `map.navigation.community` | Community | 커뮤니티 | Comunidade |
|  | `map.navigation.favorites` | Favorites | 즐겨찾기 | Favoritos |
|  | `map.navigation.map` | Map | 지도 | Mapa |
|  | `map.navigation.recommendations` | Recommendations | 장소추천 | Sugestões |
|  | `map.navigation.reservations` | Reservations | 예약 | Reservas |
|  | `map.favorites.adjust` | Resize favorites panel | 즐겨찾기 패널 크기 조절 | Redimensionar o painel de favoritos |
|  | `map.favorites.emptyBody` | Tap the star on a place you like to save it. | 마음에 드는 장소의 별을 눌러 모아보세요. | Toque na estrela de um lugar que você goste para salvar. |
|  | `map.favorites.emptyTitle` | No saved places | 저장한 장소가 없어요 | Nenhum lugar salvo |
| ● | `map.favorites.error` | Could not load places | 장소를 불러오지 못했어요 | Não foi possível carregar os lugares |
|  | `map.favorites.loadMore` | Show more | 더 보기 | Mostrar mais |
| ● | `map.favorites.loadMoreError` | Could not load more places | 다음 장소를 불러오지 못했어요 | Não foi possível carregar mais lugares |
| ● | `map.favorites.loadMoreLabel` | Load more saved places | 저장한 장소 더 불러오기 | Carregar mais lugares salvos |
|  | `map.favorites.loading` | Loading saved places… | 저장한 장소를 불러오는 중이에요 | Carregando lugares salvos… |
|  | `map.favorites.remove` | Remove {{name}} from favorites | {{name}} 즐겨찾기 해제 | Remover {{name}} dos favoritos |
|  | `map.favorites.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `map.favorites.sessionBody` | Sign in again to see your saved places. | 다시 로그인한 뒤 저장한 장소를 확인해 주세요. | Entre novamente para ver seus lugares salvos. |
|  | `map.favorites.sessionTitle` | Your session has expired | 로그인이 만료됐어요 | Sua sessão expirou |
|  | `map.favorites.title` | My places | 내 장소 | Meus lugares |
|  | `map.searchOverlay.categories` | Place categories | 장소 카테고리 | Categorias de lugares |
|  | `map.searchOverlay.clear` | Clear search | 검색어 지우기 | Limpar busca |
|  | `map.searchOverlay.clearAll` | Clear all | 전체 삭제 | Limpar tudo |
|  | `map.searchOverlay.close` | Close search | 검색 닫기 | Fechar busca |
|  | `map.searchOverlay.emptyBody` | Try a different search term. | 다른 검색어를 입력해 보세요. | Tente outro termo de busca. |
|  | `map.searchOverlay.emptyTitle` | No search results | 검색 결과가 없어요 | Nenhum resultado de busca |
|  | `map.searchOverlay.externalResults` | Place search results | 장소 검색 결과 | Resultados da busca de lugares |
|  | `map.searchOverlay.loading` | Searching for places… | 장소를 찾고 있어요 | Procurando lugares… |
|  | `map.searchOverlay.pingdomResults` | PingDom places | 핑덤 장소 | Lugares do PingDom |
|  | `map.searchOverlay.placeholder` | Search | 검색하기 | Buscar |
|  | `map.searchOverlay.recent` | Recent searches | 최근 검색 | Buscas recentes |
|  | `map.searchOverlay.recentClearAll` | Clear all recent searches | 최근 검색 전체 삭제 | Limpar todas as buscas recentes |
| ● | `map.searchOverlay.recentDelete` | Remove {{query}} from recent searches | {{query}} 최근 검색어 삭제 | Remover {{query}} das buscas recentes |
|  | `map.searchOverlay.recentLoading` | Loading recent searches | 최근 검색 불러오는 중 | Carregando buscas recentes |
|  | `map.searchOverlay.recentSearch` | Search for {{query}} | {{query}} 검색 | Buscar {{query}} |
|  | `map.searchOverlay.registrant` | Registered by {{name}} | 등록자 {{name}} | Cadastrado por {{name}} |
|  | `map.searchOverlay.registrantLoading` | Loading registrant | 등록자 확인 중 | Carregando quem cadastrou |
|  | `map.searchOverlay.registrantMissing` | No registrant | 등록자 없음 | Sem responsável pelo cadastro |
|  | `map.searchOverlay.recommendationEmpty` | No nearby recommendations yet | 주변 추천 장소가 아직 없어요 | Ainda não há sugestões por perto |
| ● | `map.searchOverlay.recommendationError` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | Não foi possível carregar as sugestões |
|  | `map.searchOverlay.recommendationLoading` | Loading recommendations… | 추천 장소를 불러오고 있어요 | Carregando sugestões… |
|  | `map.searchOverlay.registeredDisabled` | PingDom place search is disabled. | 핑덤 장소 검색 기능이 비활성화되어 있어요. | A busca de lugares do PingDom está desativada. |
|  | `map.searchOverlay.registeredEmpty` | No registered PingDom places matched. | 서버에 등록된 핑덤 장소 검색 결과가 없어요. | Nenhum lugar cadastrado no PingDom corresponde. |
| ● | `map.searchOverlay.registeredError` | The PingDom place search failed. | 핑덤 장소 검색 요청에 실패했어요. | A busca de lugares do PingDom falhou. |
|  | `map.searchOverlay.registeredMock` | Development mock PingDom place results. | 개발 Mock 핑덤 장소 검색 결과예요. | Resultados Mock de desenvolvimento de lugares do PingDom. |
|  | `map.sheet.adjust` | Resize recommendations panel | 추천 패널 크기 조절 | Redimensionar o painel de sugestões |
|  | `map.sheet.aroundMe` | Places near me | 내 주변 장소 | Lugares perto de mim |
|  | `map.sheet.bookmark` | Save place | 즐겨찾기 | Salvar lugar |
|  | `map.sheet.bookmarkRemove` | Remove saved place | 즐겨찾기 해제 | Remover lugar salvo |
| ● | `map.sheet.bookmarkSaveError` | Could not save this place | 장소를 저장하지 못했어요 | Não foi possível salvar este lugar |
| ● | `map.sheet.bookmarkRemoveError` | Could not remove this saved place | 저장을 해제하지 못했어요 | Não foi possível remover este lugar salvo |
|  | `map.sheet.categoryPopular` | Popular {{userName}} picks by category | 카테고리별 {{userName}}님 주변 인기 장소들 | Lugares populares perto de {{userName}} por categoria |
|  | `map.sheet.categoryPopularRegion` | Popular places in {{regionName}} by category | {{regionName}} 카테고리별 인기 장소 | Lugares populares em {{regionName}} por categoria |
|  | `map.sheet.categoryPopularNational` | Popular nationwide places by category | 전국 카테고리 인기 장소 | Lugares populares em todo o país por categoria |
|  | `map.sheet.distanceAway` | {{distance}} away | 여기서 {{distance}} | A {{distance}} |
|  | `map.sheet.image` | Place image | 장소 이미지 | Imagem do lugar |
| ● | `map.sheet.imageError` | Could not load image | 이미지를 불러오지 못했어요 | Não foi possível carregar a imagem |
|  | `map.sheet.imageMissing` | No image | 이미지 없음 | Sem imagem |
|  | `map.sheet.localHotPlaces` | Local hot places | 우리 지역 핫플 | Em alta perto |
|  | `map.sheet.nationwideTrends` | Nationwide trends | 전국 트렌드 | Tendências |
|  | `map.sheet.placeMissing` | Unnamed place | 장소명 없음 | Lugar sem nome |
|  | `map.sheet.recommendationTitle` | Recommended for you | 나만을 위한 추천 장소 | Sugestões para você |
|  | `map.sheet.resultsFor` | Results for “{{query}}” | “{{query}}” 검색 결과 | Resultados para “{{query}}” |
|  | `map.sheet.state.categoryEmptyTitle` | No places found in this category. | 이 카테고리에 해당하는 장소가 없어요 | Nenhum lugar encontrado nesta categoria. |
|  | `map.sheet.state.disabledBody` | Sign in to view this list. | 로그인하면 이 목록을 확인할 수 있어요. | Entre para ver esta lista. |
|  | `map.sheet.state.disabledTitle` | This list is unavailable | 목록을 사용할 수 없어요 | Esta lista está indisponível |
|  | `map.sheet.state.emptyBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | Mova o mapa para explorar outra área. |
|  | `map.sheet.state.emptyTitle` | No hot places to show yet | 표시할 핫플이 아직 없어요 | Ainda não há lugares em alta para mostrar |
| ● | `map.sheet.state.errorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Tente novamente em instantes. |
| ● | `map.sheet.state.errorTitle` | Could not load the list | 목록을 불러오지 못했어요 | Não foi possível carregar a lista |
| ● | `map.sheet.state.forbiddenBody` | Your account cannot access this list. | 현재 계정으로 이 목록에 접근할 수 없어요. | Sua conta não pode acessar esta lista. |
| ● | `map.sheet.state.forbiddenTitle` | Access is unavailable | 접근할 수 없어요 | Acesso indisponível |
|  | `map.sheet.state.invalid-locationBody` | Check your location and try again. | 위치 상태를 확인한 후 다시 시도해 주세요. | Confira sua localização e tente novamente. |
|  | `map.sheet.state.invalid-locationTitle` | Your location could not be used | 현재 위치를 사용할 수 없어요 | Localização indisponível |
|  | `map.sheet.state.invalid-periodBody` | Please try the supported weekly period again. | 지원되는 주간 기간으로 다시 시도해 주세요. | Tente novamente com o período semanal compatível. |
|  | `map.sheet.state.invalid-periodTitle` | The trend period is unavailable | 트렌드 기간을 사용할 수 없어요 | O período de tendências está indisponível |
| ● | `map.sheet.state.location-deniedBody` | Nationwide trends remain available without location access. | 위치 권한 없이도 전국 트렌드는 볼 수 있어요. | As tendências nacionais continuam disponíveis sem acesso à localização. |
| ● | `map.sheet.state.location-deniedTitle` | Allow location access to see local hot places | 지역 핫플을 보려면 위치 권한을 허용해 주세요 | Permita o acesso à localização para ver lugares em alta na região |
|  | `map.sheet.state.location-pendingBody` | Nationwide trends are available while location is being prepared. | 위치를 확인하는 동안 전국 트렌드는 볼 수 있어요. | As tendências nacionais ficam disponíveis enquanto a localização é preparada. |
|  | `map.sheet.state.location-pendingTitle` | Checking your location… | 현재 위치를 확인하고 있어요 | Verificando sua localização… |
|  | `map.sheet.state.loadingBody` | Move the map to explore another area. | 지도를 움직여 다른 지역도 둘러보세요. | Mova o mapa para explorar outra área. |
|  | `map.sheet.state.loadingTitle` | Finding nearby hot places… | 주변 핫플을 찾는 중이에요 | Procurando lugares em alta por perto… |
|  | `map.sheet.state.nationalEmptyBody` | Check back after the weekly trend data is updated. | 주간 트렌드 데이터가 갱신된 후 다시 확인해 주세요. | Volte depois que os dados de tendências semanais forem atualizados. |
|  | `map.sheet.state.nationalEmptyTitle` | No nationwide trends to show yet | 표시할 전국 트렌드가 아직 없어요 | Ainda não há tendências nacionais para mostrar |
| ● | `map.sheet.state.nationalErrorBody` | Please try loading nationwide trends again in a moment. | 잠시 후 전국 트렌드를 다시 불러와 주세요. | Tente carregar as tendências nacionais novamente em instantes. |
| ● | `map.sheet.state.nationalErrorTitle` | Could not load nationwide trends | 전국 트렌드를 불러오지 못했어요 | Não foi possível carregar as tendências nacionais |
|  | `map.sheet.state.nationalLoadingBody` | Loading the latest seven-day bookmark trend. | 최근 7일의 즐겨찾기 변화를 불러오고 있어요. | Carregando a tendência de salvos dos últimos sete dias. |
|  | `map.sheet.state.nationalLoadingTitle` | Loading nationwide trends… | 전국 트렌드를 불러오는 중이에요 | Carregando tendências nacionais… |
|  | `map.sheet.state.region-not-foundBody` | Try again from another location. | 다른 위치에서 다시 시도해 주세요. | Tente novamente de outro local. |
|  | `map.sheet.state.region-not-foundTitle` | We could not identify this area | 현재 지역을 판정하지 못했어요 | Não conseguimos identificar esta área |
| ● | `map.sheet.state.region-resolution-failedBody` | The region lookup service did not respond. | 지역 판정 서비스가 응답하지 않았어요. | O serviço de consulta de região não respondeu. |
| ● | `map.sheet.state.region-resolution-failedTitle` | Could not identify your area | 지역 판정에 실패했어요 | Não foi possível identificar sua área |
|  | `map.sheet.state.region-service-unavailableBody` | Please try again after the region service recovers. | 지역 서비스가 복구된 후 다시 시도해 주세요. | Tente novamente quando o serviço de região voltar. |
|  | `map.sheet.state.region-service-unavailableTitle` | Local hot places are temporarily unavailable | 지역 핫플을 일시적으로 사용할 수 없어요 | Os lugares em alta na região estão temporariamente indisponíveis |
| ● | `map.sheet.state.unauthorizedBody` | Sign in again and retry. | 다시 로그인한 후 시도해 주세요. | Entre novamente e tente de novo. |
| ● | `map.sheet.state.unauthorizedTitle` | Sign-in is required | 로그인이 필요해요 | É necessário entrar |
|  | `map.sheet.state.recommendationEmptyBody` | Change your location or recommendation radius and try again. | 위치나 추천 반경을 바꾼 뒤 다시 확인해 주세요. | Altere sua localização ou o raio das sugestões e tente novamente. |
|  | `map.sheet.state.recommendationEmptyTitle` | No recommendations match your current filters | 현재 조건에 맞는 추천 장소가 없어요 | Nenhuma sugestão corresponde aos filtros atuais |
| ● | `map.sheet.state.recommendationErrorBody` | Please try again in a moment. | 잠시 후 다시 시도해 주세요. | Tente novamente em instantes. |
| ● | `map.sheet.state.recommendationErrorTitle` | Could not load recommendations | 추천 장소를 불러오지 못했어요 | Não foi possível carregar as sugestões |
|  | `map.sheet.state.recommendationLoadingBody` | Checking your location and travel context. | 현재 위치와 여행 맥락을 확인하고 있어요. | Verificando sua localização e o contexto da viagem. |
|  | `map.sheet.state.recommendationLoadingTitle` | Loading recommendations for you… | 나만을 위한 추천 장소를 불러오고 있어요 | Carregando sugestões para você… |
|  | `map.detail.amenityEnglish` | English support | 영어응대 가능 | Atendimento em inglês |
|  | `map.detail.amenityParking` | Parking available | 주차가능 | Estacionamento disponível |
|  | `map.detail.back` | Back to map | 지도로 돌아가기 | Voltar ao mapa |
|  | `map.detail.collapseTags` | Collapse additional tags | 추가 태그 접기 | Recolher tags adicionais |
|  | `map.detail.coupon` | Coupons | 쿠폰 | Cupons |
|  | `map.detail.description` | About this place | 장소 소개 | Sobre este lugar |
|  | `map.detail.events` | Current events | 진행 중 이벤트 | Eventos atuais |
|  | `map.detail.collapseReviews` | Hide reviews | 리뷰 접기 | Ocultar avaliações |
|  | `map.detail.viewAllReviews` | View all reviews | 리뷰 모두 보기 | Ver todas as avaliações |
|  | `map.detail.expandTags` | Show {{count}} hidden tags | 숨겨진 태그 {{count}}개 펼치기 | Mostrar {{count}} tags ocultas |
|  | `map.detail.imageDetail` | View {{name}} photo {{count}} | {{name}} 사진 {{count}} 상세 보기 | Ver a foto {{count}} de {{name}} |
| ● | `map.detail.imageError` | Could not load photos. Try again | 사진을 불러오지 못했습니다. 다시 시도 | Não foi possível carregar as fotos. Tentar novamente |
|  | `map.detail.info` | Info | 정보 | Info |
| ● | `map.detail.notice` | Operating notice | 운영 공지 | Aviso de funcionamento |
|  | `map.detail.imageViewer.close` | Close photo | 사진 닫기 | Fechar foto |
|  | `map.detail.imageViewer.counter` | {{current}} / {{total}} | {{current}} / {{total}} | {{current}} / {{total}} |
|  | `map.detail.imageViewer.next` | Next photo | 다음 사진 | Próxima foto |
|  | `map.detail.imageViewer.photo` | {{name}} photo {{current}} of {{total}} | {{name}} 사진 {{total}}장 중 {{current}}번째 | Foto {{current}} de {{total}} de {{name}} |
|  | `map.detail.imageViewer.previous` | Previous photo | 이전 사진 | Foto anterior |
|  | `map.detail.participantCount_one` | {{count}} participant | {{count}}명 참여 | {{count}} participante |
|  | `map.detail.participantCount_other` | {{count}} participants | {{count}}명 참여 | {{count}} participantes |
|  | `map.detail.photoReviews` | Photo reviews | 사진 리뷰 | Avaliações com fotos |
|  | `map.detail.preview` | View {{name}} details | {{name}} 상세 보기 | Ver detalhes de {{name}} |
|  | `map.detail.reviewHighlights` | What visitors liked | 이런 점을 좋아해요! | O que os visitantes curtiram |
|  | `map.detail.reviewCount_one` | {{count}} review | 리뷰 {{count}}개 | {{count}} avaliação |
|  | `map.detail.reviewCount_other` | {{count}} reviews | 리뷰 {{count}}개 | {{count}} avaliações |
|  | `map.detail.reviewEmpty` | No reviews yet. | 등록된 리뷰 정보가 없어요. | Ainda não há avaliações. |
| ● | `map.detail.reviewError` | Could not load reviews. Try again | 리뷰를 불러오지 못했습니다. 다시 시도 | Não foi possível carregar as avaliações. Tentar novamente |
|  | `map.detail.reviewLoading` | Loading reviews… | 리뷰를 불러오는 중입니다. | Carregando avaliações… |
|  | `map.detail.reviews` | Reviews | 리뷰 | Avaliações |
|  | `map.detail.verifiedCount_one` | {{count}} person verified this! | {{count}}명이 검증했어요! | {{count}} pessoa verificou! |
|  | `map.detail.verifiedCount_other` | {{count}} people verified this! | {{count}}명이 검증했어요! | {{count}} pessoas verificaram! |
| ● | `map.detail.reservation.authError` | Sign-in required | 로그인이 필요합니다 | É necessário entrar |
|  | `map.detail.reservation.available` | Reserve | 예약하기 | Reservar |
|  | `map.detail.reservation.empty` | No schedules are currently available | 현재 예약 가능한 일정이 없습니다 | Não há horários disponíveis no momento |
| ● | `map.detail.reservation.error` | Could not load reservation availability | 예약 가능 여부를 불러오지 못했습니다 | Não foi possível carregar a disponibilidade de reservas |
|  | `map.detail.reservation.full` | No reservation capacity is available | 예약 가능한 인원이 없습니다 | Não há vagas para reserva |
|  | `map.detail.reservation.loading` | Checking reservation availability | 예약 가능 여부를 확인하고 있습니다 | Verificando a disponibilidade de reservas |
|  | `map.detail.reservation.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `map.locate` | My location | 내 위치 | Minha localização |
|  | `map.refreshing` | Refreshing map | 지도 새로고침 중 | Atualizando o mapa |
| ● | `map.location.deniedDescription` | The map is using a default area. Allow location access to show your position. | 기본 지역을 표시하고 있습니다. 현재 위치를 보려면 위치 권한을 허용해 주세요. | O mapa está usando uma área padrão. Permita o acesso à localização para mostrar sua posição. |
| ● | `map.location.deniedTitle` | Location access is off | 위치 권한이 꺼져 있습니다 | O acesso à localização está desativado |
| ● | `map.location.failedDescription` | The map is using a default area. Check location services and try again. | 기본 지역을 표시하고 있습니다. 위치 서비스를 확인한 후 다시 시도해 주세요. | O mapa está usando uma área padrão. Verifique os serviços de localização e tente novamente. |
| ● | `map.location.failedTitle` | Could not find your location | 현재 위치를 찾지 못했습니다 | Localização não encontrada |
|  | `map.location.loading` | Finding your current location... | 현재 위치를 찾는 중입니다... | Procurando sua localização atual... |
|  | `map.location.openSettings` | Open settings | 설정 열기 | Abrir configurações |
|  | `map.location.retry` | Check again | 다시 확인 | Verificar novamente |
|  | `map.recommendations.subtitle` | Pingdom recommends places {{userName}} might like! | 핑덤이 {{userName}}님이 좋아할만한 장소를 추천해드려요! | O PingDom recomenda lugares que {{userName}} pode curtir! |
|  | `map.recommendations.verificationTitle` | Verify today and get a coupon! | 오늘 검증하고 쿠폰 받자! | Verifique hoje e ganhe um cupom! |
|  | `map.recommendations.reasons.activeBenefit` | A benefit is currently available here | 현재 이용할 수 있는 혜택이 있어요 | Há um benefício disponível aqui agora |
|  | `map.recommendations.reasons.benefitAndReservable` | A place with an available benefit and booking | 혜택을 받고 바로 예약할 수 있어요 | Um lugar com benefício disponível e reserva |
|  | `map.recommendations.reasons.contextMatch` | Matches your current travel plans | 현재 여행 목적과 잘 맞는 장소예요 | Combina com seus planos de viagem atuais |
|  | `map.recommendations.reasons.exploration` | A recommendation for discovering somewhere new | 새로운 장소를 발견할 수 있는 추천이에요 | Uma sugestão para descobrir um lugar novo |
|  | `map.recommendations.reasons.freshContent` | Recently updated with new information | 최근 새로운 정보가 추가됐어요 | Atualizado recentemente com novas informações |
|  | `map.recommendations.reasons.highConversion` | Often leads to real visits | 실제 방문으로 자주 이어지는 장소예요 | Costuma resultar em visitas reais |
|  | `map.recommendations.reasons.highEngagement` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | Um lugar que recebe muito interesse |
|  | `map.recommendations.reasons.nearby` | Close to your current location | 현재 위치에서 가까운 장소예요 | Perto da sua localização atual |
|  | `map.recommendations.reasons.neutral` | Recommended place | 추천 장소 | Lugar recomendado |
|  | `map.recommendations.reasons.personalSignal` | Matches your interests and activity | 관심사와 반응에 잘 맞는 장소예요 | Combina com seus interesses e sua atividade |
|  | `map.recommendations.reasons.qualitySignal` | Has reliable place information | 신뢰도 높은 장소 정보가 있어요 | Tem informações confiáveis sobre o lugar |
|  | `map.recommendations.reasons.reservable` | Currently available to book | 현재 예약할 수 있는 장소예요 | Disponível para reserva agora |
|  | `map.recommendations.explanations.fallback` | A place worth exploring | 둘러볼 만한 추천 장소예요 | Um lugar que vale a pena explorar |
|  | `map.recommendations.explanations.fresh` | A place receiving new attention | 최근 새롭게 주목받는 장소예요 | Um lugar que está recebendo nova atenção |
|  | `map.recommendations.explanations.geo` | Close to your current location | 현재 위치에서 가까운 장소예요 | Perto da sua localização atual |
|  | `map.recommendations.explanations.personal` | Reflects your interests and activity | 관심사와 반응을 반영한 추천이에요 | Reflete seus interesses e sua atividade |
|  | `map.recommendations.explanations.popular` | A place receiving a lot of interest | 많은 사용자가 관심을 보이는 장소예요 | Um lugar que recebe muito interesse |
|  | `map.recommendations.context.activity.attendEvent` | Events | 이벤트 참여 | Eventos |
|  | `map.recommendations.context.activity.cafe` | Cafe visit | 카페 방문 | Ida a um café |
|  | `map.recommendations.context.activity.eat` | Food | 식사 | Comida |
|  | `map.recommendations.context.activity.explore` | Explore | 주변 탐색 | Explorar |
|  | `map.recommendations.context.activity.nightlife` | Nightlife | 나이트라이프 | Vida noturna |
|  | `map.recommendations.context.activity.shop` | Shopping | 쇼핑 | Compras |
|  | `map.recommendations.context.purpose.beauty` | Beauty | 뷰티 | Beleza |
|  | `map.recommendations.context.purpose.cafe` | Cafe | 카페 | Café |
|  | `map.recommendations.context.purpose.exhibition` | Exhibitions | 전시 | Exposições |
|  | `map.recommendations.context.purpose.fashion` | Fashion | 패션 | Moda |
|  | `map.recommendations.context.purpose.food` | Food | 맛집 | Comida |
|  | `map.recommendations.context.purpose.kPop` | K-POP | K-POP | K-POP |
|  | `map.recommendations.context.purpose.nightlife` | Nightlife | 나이트라이프 | Vida noturna |
|  | `map.recommendations.context.purpose.other` | Other | 기타 | Outros |
|  | `map.recommendations.context.purpose.popUp` | Pop-ups | 팝업 | Pop-ups |
|  | `map.recommendations.limits.candidatePool` | The candidate pool was expanded because few places matched. | 조건에 맞는 장소가 적어 후보 범위를 넓혀 추천했어요. | O conjunto de candidatos foi ampliado porque poucos lugares correspondiam. |
|  | `map.recommendations.limits.interactedExcluded` | Places you already viewed were excluded. | 이미 확인한 장소를 제외해 추천했어요. | Os lugares que você já viu foram excluídos. |
|  | `map.recommendations.limits.operatingPriority` | Places currently operating were prioritized. | 현재 운영 중인 장소를 우선해 추천했어요. | Os lugares em funcionamento agora foram priorizados. |
|  | `map.recommendations.limits.radiusExpanded` | The search radius was expanded to find recommendations. | 추천 결과를 찾기 위해 검색 반경을 넓혔어요. | O raio de busca foi ampliado para encontrar sugestões. |
|  | `map.recommendations.limits.requestClamped` | The recommendation count was adjusted to the server limit. | 서버 기준에 맞춰 추천 개수를 조정했어요. | A quantidade de sugestões foi ajustada ao limite do servidor. |
| ● | `map.search.accessibilityLabel` | Search places on the map | 지도 장소 검색 | Buscar lugares no mapa |
|  | `map.search.confirm` | OK | 확인 | OK |
|  | `map.search.empty` | No search results | 검색 결과가 없습니다 | Nenhum resultado de busca |
| ● | `map.search.failed` | Address search failed | 주소 검색에 실패했습니다 | A busca de endereço falhou |
|  | `map.search.placeholder` | Search places | 장소를 검색하세요 | Buscar lugares |
| ● | `map.search.profileAccessibilityLabel` | Open my page | 마이페이지 열기 | Abrir minha página |
|  | `map.search.statusPlaceholder` | Enter an address... | 주소를 입력하세요... | Digite um endereço... |
|  | `map.title` | Nearby map | 주변 지도 | Mapa da região |
|  | `map.visibleCenter` | {{lat}}, {{lng}} | {{lat}}, {{lng}} | {{lat}}, {{lng}} |
|  | `map.decision.placesLiveNearby_many` | — | — | {{count}} lugares ativos por perto |
|  | `map.detail.participantCount_many` | — | — | {{count}} participantes |
|  | `map.detail.reviewCount_many` | — | — | {{count}} avaliações |
|  | `map.detail.verifiedCount_many` | — | — | {{count}} pessoas verificaram! |

## `notificationSettings`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `notificationSettings.back` | Back | 뒤로가기 | Voltar |
|  | `notificationSettings.contract.categories` | Server notification preferences | 서버 알림 수신 설정 | Preferências de notificação do servidor |
|  | `notificationSettings.contract.newHotplaceEnabled` | Hot place notifications | 핫플레이스 알림 | Notificações de lugares em alta |
|  | `notificationSettings.contract.newLikeEnabled` | Like notifications | 좋아요 알림 | Notificações de curtidas |
| ● | `notificationSettings.contract.categoryHint` | Saved to your account. Enabling checks device notification permission. | 계정에 저장됩니다. 켤 때 기기의 알림 권한을 확인합니다. | Salvo na sua conta. Ao ativar, a permissão de notificação do aparelho é verificada. |
|  | `notificationSettings.contract.allUnsupported` | Unavailable: no allow-all policy exists. Device permission and category preferences are separate. | 미지원: 전체 허용 정책이 없습니다. 기기 권한과 항목별 수신 설정은 별개입니다. | Indisponível: não existe política para permitir tudo. A permissão do aparelho e as preferências por categoria são separadas. |
|  | `notificationSettings.contract.unsupported` | Unavailable: this category has no confirmed server setting. | 미지원: 이 항목에 대응하는 서버 설정이 확정되지 않았습니다. | Indisponível: esta categoria não tem uma configuração de servidor confirmada. |
|  | `notificationSettings.contract.nightUnsupported` | Unavailable: receiving notifications at night is not the same as quiet hours. | 미지원: 야간 알림 수신 허용은 방해 금지 시간과 같은 설정이 아닙니다. | Indisponível: receber notificações à noite não é o mesmo que o horário de silêncio. |
|  | `notificationSettings.contract.unknown` | The server has not provided a valid setting. This item cannot be changed. | 서버에서 올바른 설정값을 제공하지 않아 변경할 수 없습니다. | O servidor não forneceu uma configuração válida. Este item não pode ser alterado. |
|  | `notificationSettings.contract.quietHours` | Quiet hours | 방해 금지 시간 | Horário de silêncio |
|  | `notificationSettings.contract.quietReadOnly` | Read only: time validation and editing policy are not confirmed. No default schedule is saved. | 읽기 전용: 시간 검증과 편집 정책이 확정되지 않았습니다. 기본 시간을 임의로 저장하지 않습니다. | Somente leitura: a validação de horários e a política de edição não estão confirmadas. Nenhum horário padrão é salvo. |
|  | `notificationSettings.contract.quietIncomplete` | Time or timezone information is missing or invalid. | 시간 또는 시간대 정보가 없거나 올바르지 않습니다. | As informações de horário ou fuso horário estão ausentes ou são inválidas. |
|  | `notificationSettings.contract.invalidQuietHours` | Please check the quiet hours settings on the server. | 서버의 방해 금지 시간 설정을 확인해 주세요. | Verifique as configurações do horário de silêncio no servidor. |
| ● | `notificationSettings.contract.unauthorized` | Your session has expired. Please sign in again. | 로그인이 만료되었습니다. 다시 로그인해 주세요. | Sua sessão expirou. Entre novamente. |
| ● | `notificationSettings.contract.forbidden` | You do not have permission to access notification settings. | 알림 설정에 접근할 권한이 없습니다. | Você não tem permissão para acessar as configurações de notificação. |
| ● | `notificationSettings.contract.saveFailed` | Could not update notification settings. Please try again. | 알림 설정을 변경하지 못했습니다. 다시 시도해 주세요. | Não foi possível atualizar as configurações de notificação. Tente novamente. |
| ● | `notificationSettings.permission.title` | Device notification permission | 기기 알림 권한 | Permissão de notificação do aparelho |
| ● | `notificationSettings.permission.description` | Device permission and account preferences are separate. Change device permission in system settings. | 기기 권한과 계정의 수신 설정은 별개입니다. 기기 권한은 시스템 설정에서 변경할 수 있습니다. | A permissão do aparelho e as preferências da conta são separadas. Altere a permissão do aparelho nas configurações do sistema. |
| ● | `notificationSettings.permission.loading` | Checking device permission | 기기 권한 확인 중 | Verificando a permissão do aparelho |
| ● | `notificationSettings.permission.authorized` | Notifications allowed | 알림 허용 | Notificações permitidas |
| ● | `notificationSettings.permission.provisional` | Quiet notifications allowed | 조용한 알림 허용 | Notificações silenciosas permitidas |
| ● | `notificationSettings.permission.notDetermined` | Permission has not been requested. Enabling a category will request it. | 아직 권한을 요청하지 않았습니다. 알림 항목을 켤 때 요청합니다. | A permissão ainda não foi solicitada. Ela será pedida ao ativar uma categoria. |
| ● | `notificationSettings.permission.denied` | Notification permission denied. Allow notifications in device settings to enable this category. | 알림 권한이 거부되었습니다. 이 항목을 켜려면 기기 설정에서 알림을 허용해 주세요. | Permissão de notificação negada. Permita as notificações nas configurações do aparelho para ativar esta categoria. |
| ● | `notificationSettings.permission.blocked` | Notification permission blocked. Please allow it in device settings. | 알림 권한이 차단되었습니다. 기기 설정에서 허용해 주세요. | Permissão de notificação bloqueada. Permita nas configurações do aparelho. |
| ● | `notificationSettings.permission.unavailable` | Native notification support is unavailable in this environment. | 현재 환경에서는 네이티브 알림 기능을 사용할 수 없습니다. | As notificações nativas não estão disponíveis neste ambiente. |
| ● | `notificationSettings.permission.error` | Could not check or request notification permission. Please try again. | 알림 권한 확인 또는 요청 중 오류가 발생했습니다. 다시 시도해 주세요. | Não foi possível verificar ou solicitar a permissão de notificação. Tente novamente. |
| ● | `notificationSettings.permission.openSettings` | Open device notification settings | 기기 알림 설정 열기 | Abrir as configurações de notificação do aparelho |
| ● | `notificationSettings.error` | Could not load notification settings. | 알림 설정을 불러오지 못했어요. | Não foi possível carregar as configurações de notificação. |
|  | `notificationSettings.loading` | Loading notification settings | 알림 설정을 불러오는 중 | Carregando as configurações de notificação |
|  | `notificationSettings.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `notificationSettings.sections.interests` | Saved places & areas | 관심 장소 · 구역 | Lugares e áreas salvos |
|  | `notificationSettings.sections.other` | Other | 기타 | Outros |
|  | `notificationSettings.sections.records` | My records & places | 내 기록 · 장소 | Meus registros e lugares |
|  | `notificationSettings.sections.reports` | Reports | 리포트 | Relatórios |
|  | `notificationSettings.settings.favoriteMoodChange.description` | When recent tags and record trends change | 최근 태그와 기록 추세가 바뀌었을 때 | Quando as tags recentes e as tendências de registros mudam |
|  | `notificationSettings.settings.favoriteMoodChange.label` | Changes around a saved place | 관심 장소 분위기 변화 | Mudanças em torno de um lugar salvo |
|  | `notificationSettings.settings.firstRecordTrending.description` | Get notified when a place you First Recorded starts trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | Receba um aviso quando um lugar que você registrou primeiro (First Recorder) entrar em alta |
|  | `notificationSettings.settings.firstRecordTrending.label` | A place I recorded first is trending | 내가 먼저 기록한 장소 급상승 | Um lugar que registrei primeiro está em alta |
|  | `notificationSettings.settings.frequentAreaHotPlace.description` | When a new trending place appears in an area you frequent | 내 생활권에 새로 뜨는 장소가 생기면 | Quando surge um novo lugar em alta em uma área que você frequenta |
|  | `notificationSettings.settings.frequentAreaHotPlace.label` | New hot place in a frequent area | 자주 가는 구역 새 핫플 | Novo lugar em alta em uma área frequente |
|  | `notificationSettings.settings.marketingEvents.label` | Marketing & event updates | 마케팅 · 이벤트 정보 | Novidades de marketing e eventos |
|  | `notificationSettings.settings.nightNotifications.description` | Allow notifications between 21:00 and 08:00 | 21:00 – 08:00 사이 알림 허용 | Permitir notificações entre 21:00 e 08:00 |
|  | `notificationSettings.settings.nightNotifications.label` | Receive notifications at night | 야간 알림 받기 | Receber notificações à noite |
|  | `notificationSettings.settings.pushAll.description` | Turning this off disables all notifications below | 끄면 아래 알림이 모두 발송되지 않아요 | Desativar isto desativa todas as notificações abaixo |
|  | `notificationSettings.settings.pushAll.label` | Allow all push notifications | 푸시 알림 전체 허용 | Permitir todas as notificações push |
|  | `notificationSettings.settings.recordNewTags.description` | When the status of a place you recorded changes | 내가 남긴 장소의 상태가 바뀔 때 | Quando o status de um lugar que você registrou muda |
|  | `notificationSettings.settings.recordNewTags.label` | New tags added to my recorded place | 내 기록 장소에 새 태그 누적 | Novas tags em um lugar que registrei |
|  | `notificationSettings.settings.todayMissionArea.label` | Today’s mission area | 오늘의 미션 구역 | Área da missão de hoje |
|  | `notificationSettings.settings.weeklyReport.description` | A weekly summary of this week’s discoveries and your records | 이번 주 발자국과 내 기록을 정리해 보내드려요 | Um resumo semanal das descobertas da semana e dos seus registros |
|  | `notificationSettings.settings.weeklyReport.label` | Weekly report | 주간 리포트 | Relatório semanal |
|  | `notificationSettings.title` | Notification settings | 알림 설정 | Configurações de notificação |

## `offer`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `offer.cta.ended` | Offer ended | 종료된 혜택 | Oferta encerrada |
|  | `offer.cta.issue` | Get coupon | 쿠폰 받기 | Pegar cupom |
|  | `offer.cta.notStarted` | Not started yet | 아직 시작 전 | Ainda não começou |
|  | `offer.cta.soldOut` | All claimed | 수량 모두 소진 | Esgotado |
|  | `offer.cta.unavailable` | Cannot be claimed | 받을 수 없는 혜택 | Não pode ser resgatado |
|  | `offer.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 여행 일정이 있는 계정 | Contas com uma viagem ativa |
|  | `offer.eligibility.PUBLIC` | Anyone | 누구나 | Qualquer pessoa |
|  | `offer.eligibility.UNKNOWN` | Conditions need review | 조건 확인 필요 | Condições a confirmar |
|  | `offer.expiry.ISSUE_PLUS_DAYS` | Valid for a set number of days after issue | 발급일로부터 정해진 기간 | Válido por um número fixo de dias após a emissão |
|  | `offer.expiry.ISSUE_PLUS_DAYS_CAPPED_BY_OFFER_END` | Valid for a set number of days after issue, up to the offer end date | 발급일로부터 정해진 기간, 혜택 종료일까지 | Válido por um número fixo de dias após a emissão, até a data de término da oferta |
|  | `offer.expiry.OFFER_END` | Valid until the offer ends | 혜택 종료일까지 | Válido até o fim da oferta |
|  | `offer.expiry.UNKNOWN` | Validity needs review | 유효 기간 확인 필요 | Validade a confirmar |
|  | `offer.inventory.LIMITED` | Limited quantity | 수량 한정 | Quantidade limitada |
|  | `offer.inventory.UNKNOWN` | Quantity needs review | 수량 확인 필요 | Quantidade a confirmar |
|  | `offer.inventory.UNLIMITED` | No quantity limit | 수량 제한 없음 | Sem limite de quantidade |
|  | `offer.remaining.limited_one` | {{count}} left | {{count}}개 남음 | Resta {{count}} |
|  | `offer.remaining.limited_other` | {{count}} left | {{count}}개 남음 | Restam {{count}} |
|  | `offer.remaining.unknown` | Remaining quantity not provided | 남은 수량 미제공 | Quantidade restante não informada |
|  | `offer.remaining.unlimited` | No quantity limit | 수량 제한 없음 | Sem limite de quantidade |
|  | `offer.statuses.CLOSED` | Closed | 종료됨 | Encerrada |
|  | `offer.statuses.DRAFT` | Draft | 작성 중 | Rascunho |
|  | `offer.statuses.PUBLISHED` | Available | 받을 수 있음 | Disponível |
|  | `offer.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | Status a confirmar |
|  | `offer.remaining.limited_many` | — | — | Restam {{count}} |

## `payment`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `payment.statuses.FAILED` | Payment failed | 결제 실패 | Pagamento não concluído |
|  | `payment.statuses.PAID` | Paid | 결제 완료 | Pago |
|  | `payment.statuses.PROCESSING` | Payment in progress | 결제 진행 중 | Pagamento em andamento |
|  | `payment.statuses.REFUNDED` | Refunded | 환불 완료 | Reembolsado |
|  | `payment.statuses.REFUND_PROCESSING` | Refund in progress | 환불 진행 중 | Reembolso em andamento |
|  | `payment.statuses.UNKNOWN` | Status needs review | 상태 확인 필요 | Status a confirmar |

## `myPage`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `myPage.back` | Back | 뒤로가기 | Voltar |
|  | `myPage.couponBox.empty` | You have no coupons yet | 보유한 쿠폰이 없어요 | Você ainda não tem cupons |
|  | `myPage.couponBox.emptyFiltered` | You have no {{status}} coupons | {{status}} 쿠폰이 없어요 | Você não tem cupons com status: {{status}} |
| ● | `myPage.couponBox.error` | Could not load your coupons. | 쿠폰을 불러오지 못했어요. | Não foi possível carregar seus cupons. |
|  | `myPage.couponBox.fallbackDescription` | Discount coupon | 할인 쿠폰 | Cupom de desconto |
|  | `myPage.couponBox.fallbackTitle` | Coupon | 쿠폰 | Cupom |
|  | `myPage.couponBox.filters.ALL` | All | 전체 | Todos |
|  | `myPage.couponBox.filters.EXPIRED` | Expired | 만료 | Expirados |
|  | `myPage.couponBox.filters.ISSUED` | Available | 사용 가능 | Disponíveis |
|  | `myPage.couponBox.filters.REDEEMED` | Used | 사용 완료 | Usados |
|  | `myPage.couponBox.loading` | Loading coupons | 쿠폰을 불러오는 중 | Carregando cupons |
| ● | `myPage.couponBox.nextPageError` | Could not load more coupons. | 쿠폰을 더 불러오지 못했어요. | Não foi possível carregar mais cupons. |
|  | `myPage.couponBox.nextPageRetry` | Load more | 더 불러오기 | Carregar mais |
|  | `myPage.couponBox.status.CANCELED` | Canceled | 취소됨 | Cancelado |
|  | `myPage.couponBox.status.EXPIRED` | Expired | 만료 | Expirado |
|  | `myPage.couponBox.status.ISSUED` | Available | 사용 가능 | Disponível |
|  | `myPage.couponBox.status.REDEEMED` | Used | 사용 완료 | Usado |
|  | `myPage.couponBox.status.UNKNOWN` | Unavailable | 사용 불가 | Indisponível |
|  | `myPage.couponBox.title` | Coupon box | 쿠폰함 | Meus cupons |
| ● | `myPage.couponDetail.codeA11yLabel` | Coupon code ending in {{tail}} | 쿠폰 코드, 끝 네 자리 {{tail}} | Código do cupom terminado em {{tail}} |
| ● | `myPage.couponDetail.error` | Could not load this coupon. | 쿠폰 정보를 불러오지 못했어요. | Não foi possível carregar este cupom. |
|  | `myPage.couponDetail.infoHeading` | Coupon info | 쿠폰 정보 | Informações do cupom |
|  | `myPage.couponDetail.loading` | Loading coupon | 쿠폰 정보를 불러오는 중 | Carregando cupom |
| ● | `myPage.couponDetail.noticeHeading` | Notice | 유의사항 | Aviso |
| ● | `myPage.couponDetail.qrHint` | Show this QR code to a store staff member before paying | 결제 전 매장 직원에게 QR 코드를 보여주세요 | Mostre este QR code a um funcionário da loja antes de pagar |
|  | `myPage.couponDetail.qrUnavailable` | Could not draw the QR code. Please read the code above to the staff. | QR 코드를 표시하지 못했어요. 위 코드를 직원에게 알려주세요. | Não foi possível exibir o QR code. Informe o código acima ao funcionário. |
| ● | `myPage.couponDetail.notices.0` | Each account can use this coupon only once. | 쿠폰은 계정당 1회만 사용할 수 있어요. | Cada conta pode usar este cupom apenas uma vez. |
| ● | `myPage.couponDetail.notices.1` | The coupon disappears automatically once it expires. | 유효기간이 지나면 쿠폰이 자동으로 사라져요. | O cupom desaparece automaticamente quando expira. |
| ● | `myPage.couponDetail.notices.2` | It cannot be combined with other coupons or discounts. | 다른 쿠폰 및 할인 혜택과 중복 사용은 불가해요. | Não pode ser combinado com outros cupons ou descontos. |
| ● | `myPage.couponDetail.notices.3` | Cancelling the reservation restores the coupon automatically. | 예약을 취소하면 쿠폰이 자동으로 복구돼요. | Ao cancelar a reserva, o cupom é restaurado automaticamente. |
| ● | `myPage.couponDetail.expiredNotice` | This coupon expired on {{date}} | {{date}}에 만료된 쿠폰이에요 | Este cupom expirou em {{date}} |
| ● | `myPage.couponDetail.redeemedNotice` | This coupon was used on {{date}} | {{date}}에 사용한 쿠폰이에요 | Este cupom foi usado em {{date}} |
| ● | `myPage.couponDetail.redeemedNoticeUnknown` | This coupon has already been used | 이미 사용한 쿠폰이에요 | Este cupom já foi usado |
|  | `myPage.couponDetail.reserve` | Make a reservation | 예약하러 가기 | Fazer uma reserva |
|  | `myPage.couponDetail.eligibility.ACTIVE_TRAVEL_SCHEDULE` | Accounts with an active trip | 진행 중인 여행 일정이 있는 계정 | Contas com uma viagem ativa |
|  | `myPage.couponDetail.eligibility.PUBLIC` | Anyone | 누구나 | Qualquer pessoa |
|  | `myPage.couponDetail.rows.eligibility` | Who can use | 발급 대상 | Quem pode usar |
|  | `myPage.couponDetail.rows.period` | Offer period | 행사 기간 | Período da oferta |
|  | `myPage.couponDetail.rows.stores` | Where to use | 사용 가능 매장 | Onde usar |
|  | `myPage.couponDetail.rows.usage` | How to use | 사용처 | Como usar |
|  | `myPage.couponDetail.rows.validity` | Valid for | 사용 가능 기간 | Validade |
|  | `myPage.couponDetail.validityDays_one` | {{count}} day after issue | 발급 후 {{count}}일 | {{count}} dia após a emissão |
|  | `myPage.couponDetail.validityDays_other` | {{count}} days after issue | 발급 후 {{count}}일 | {{count}} dias após a emissão |
|  | `myPage.couponDetail.title` | Coupon detail | 쿠폰상세 | Detalhes do cupom |
|  | `myPage.couponDetail.unavailable` | This coupon has been used or has expired | 이미 사용했거나 만료된 쿠폰이에요 | Este cupom já foi usado ou expirou |
| ● | `myPage.profileEdit.avatarCameraPermissionDenied` | Camera access is required to take a profile photo. You can allow it in Settings. | 프로필 사진을 촬영하려면 카메라 접근 권한이 필요합니다. 설정에서 허용해주세요. | O acesso à câmera é necessário para tirar uma foto de perfil. Você pode permitir nas Configurações. |
|  | `myPage.profileEdit.avatarCancel` | Cancel | 취소 | Cancelar |
| ● | `myPage.profileEdit.avatarChangeFailed` | Could not change the profile image. Please try again. | 프로필 이미지를 변경하지 못했습니다. 다시 시도해주세요. | Não foi possível alterar a imagem de perfil. Tente novamente. |
|  | `myPage.profileEdit.avatarFileTooLarge` | This image is too large. Please choose a smaller one. | 이미지 용량이 너무 큽니다. 더 작은 이미지를 선택해주세요. | Esta imagem é grande demais. Escolha uma menor. |
|  | `myPage.profileEdit.avatarFromCamera` | Take a photo | 사진 촬영 | Tirar uma foto |
|  | `myPage.profileEdit.avatarFromLibrary` | Choose from library | 앨범에서 선택 | Escolher da biblioteca |
|  | `myPage.profileEdit.avatarOpenSettings` | Open settings | 설정 열기 | Abrir configurações |
| ● | `myPage.profileEdit.avatarPermissionDenied` | Photo library access is required to change your profile image. You can allow it in Settings. | 프로필 이미지를 변경하려면 사진 접근 권한이 필요합니다. 설정에서 허용해주세요. | O acesso à biblioteca de fotos é necessário para alterar sua imagem de perfil. Você pode permitir nas Configurações. |
|  | `myPage.profileEdit.avatarRetry` | Try again | 다시 시도 | Tentar novamente |
|  | `myPage.profileEdit.avatarSheetTitle` | Change profile photo | 프로필 사진 변경 | Alterar foto de perfil |
|  | `myPage.profileEdit.avatarTypeUnsupported` | Only JPEG or PNG images can be used as a profile image. | JPEG 또는 PNG 이미지만 프로필 이미지로 사용할 수 있습니다. | Somente imagens JPEG ou PNG podem ser usadas como imagem de perfil. |
|  | `myPage.profileEdit.avatarUploading` | Uploading profile image | 프로필 이미지 업로드 중 | Enviando a imagem de perfil |
|  | `myPage.profileEdit.changeAvatar` | Change profile image | 프로필 이미지 변경 | Alterar imagem de perfil |
|  | `myPage.profileEdit.confirmPassword` | Confirm new password | 새 비밀번호 확인 | Confirmar nova senha |
|  | `myPage.profileEdit.confirmPasswordPlaceholder` | Re-enter the new password | 새 비밀번호를 다시 입력하세요 | Digite a nova senha novamente |
|  | `myPage.profileEdit.currentPassword` | Current password | 현재 비밀번호 | Senha atual |
|  | `myPage.profileEdit.currentPasswordInvalid` | Your current password is incorrect | 현재 비밀번호가 올바르지 않습니다 | Sua senha atual está incorreta |
|  | `myPage.profileEdit.currentPasswordPlaceholder` | Enter your current password | 현재 비밀번호를 입력하세요 | Digite sua senha atual |
|  | `myPage.profileEdit.currentPasswordRequired` | Enter your current password to set a new one | 비밀번호를 변경하려면 현재 비밀번호를 입력하세요 | Digite sua senha atual para definir uma nova |
|  | `myPage.profileEdit.hidePassword` | Hide {{field}} | {{field}} 숨기기 | Ocultar {{field}} |
|  | `myPage.profileEdit.infoTitle` | Edit info | 정보 수정 | Editar informações |
|  | `myPage.profileEdit.newPassword` | New password | 새 비밀번호 | Nova senha |
|  | `myPage.profileEdit.newPasswordPlaceholder` | At least 8 characters | 8자 이상 입력하세요 | Pelo menos 8 caracteres |
| ● | `myPage.profileEdit.passwordChangeFailed` | Could not change the password. | 비밀번호를 변경하지 못했습니다. | Não foi possível alterar a senha. |
|  | `myPage.profileEdit.passwordChangePartialFailure` | The username was changed, but the password was not. {{reason}} | 아이디는 변경했지만 비밀번호는 변경하지 못했습니다. {{reason}} | O nome de usuário foi alterado, mas a senha não. {{reason}} |
|  | `myPage.profileEdit.passwordMismatch` | The new passwords do not match | 새 비밀번호가 서로 다릅니다 | As novas senhas não coincidem |
|  | `myPage.profileEdit.passwordTooShort` | Password must be at least 8 characters | 비밀번호는 8자 이상이어야 합니다 | A senha deve ter pelo menos 8 caracteres |
|  | `myPage.profileEdit.save` | Save changes | 변경 사항 저장하기 | Salvar alterações |
|  | `myPage.profileEdit.saving` | Saving... | 저장 중... | Salvando... |
|  | `myPage.profileEdit.showPassword` | Show {{field}} | {{field}} 보기 | Mostrar {{field}} |
|  | `myPage.profileEdit.title` | Edit profile | 프로필 편집 | Editar perfil |
|  | `myPage.profileEdit.username` | Username | 아이디 | Nome de usuário |
| ● | `myPage.profileEdit.usernameChangeFailed` | Could not change the username. | 아이디를 변경하지 못했습니다. | Não foi possível alterar o nome de usuário. |
|  | `myPage.profileEdit.usernameLengthInvalid` | Username must be between 4 and 50 characters. | 아이디는 4자 이상 50자 이하여야 합니다. | O nome de usuário deve ter entre 4 e 50 caracteres. |
|  | `myPage.profileEdit.usernameRequired` | Enter a username. | 아이디를 입력해주세요. | Digite um nome de usuário. |
| ● | `myPage.profileError` | Could not load your profile. | 프로필을 불러오지 못했어요. | Não foi possível carregar seu perfil. |
|  | `myPage.profileLoading` | Loading your profile | 프로필을 불러오는 중 | Carregando seu perfil |
|  | `myPage.profileUnavailable` | Profile unavailable | 프로필 정보 없음 | Perfil indisponível |
|  | `myPage.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `myPage.settings` | Settings | 설정 | Configurações |
|  | `myPage.stats.coupons` | Coupons | 쿠폰 | Cupons |
|  | `myPage.stats.reservations` | Reservations | 예약 | Reservas |
|  | `myPage.stats.reviews` | Reviews | 리뷰 | Avaliações |
|  | `myPage.title` | My page | 마이 페이지 | Minha página |
| ● | `myPage.travel.error` | Could not load your travel schedule. | 여행 일정을 불러오지 못했어요. | Não foi possível carregar seu roteiro de viagem. |
|  | `myPage.travel.loading` | Loading your travel schedule | 여행 일정을 불러오는 중 | Carregando seu roteiro de viagem |
|  | `myPage.travel.nextMonth` | Next month | 다음 달 | Próximo mês |
|  | `myPage.travel.notEditable` | This travel schedule can no longer be edited. | 이 여행 일정은 더 이상 변경할 수 없어요. | Este roteiro de viagem não pode mais ser editado. |
|  | `myPage.travel.periodOverlap` | These dates overlap another travel schedule. | 다른 여행 일정과 기간이 겹쳐요. | Estas datas coincidem com outro roteiro de viagem. |
|  | `myPage.travel.previousMonth` | Previous month | 이전 달 | Mês anterior |
|  | `myPage.travel.saving` | Saving dates... | 날짜 저장 중... | Salvando datas... |
|  | `myPage.travel.startDateInPast` | Choose today or a future date. | 오늘 또는 이후 날짜를 선택해주세요. | Escolha hoje ou uma data futura. |
|  | `myPage.travel.title` | My trips | 나의 여행 | Minhas viagens |
| ● | `myPage.travel.updateError` | Could not save your travel dates. | 여행 날짜를 저장하지 못했어요. | Não foi possível salvar suas datas de viagem. |
|  | `myPage.travel.weekdays.sun` | S | S | D |
|  | `myPage.travel.weekdays.mon` | M | M | S |
|  | `myPage.travel.weekdays.tue` | T | T | T |
|  | `myPage.travel.weekdays.wed` | W | W | Q |
|  | `myPage.travel.weekdays.thu` | T | T | Q |
|  | `myPage.travel.weekdays.fri` | F | F | S |
|  | `myPage.travel.weekdays.sat` | S | S | S |
|  | `myPage.verifiedPlaces.empty` | No verified places yet | 아직 검증한 장소가 없어요 | Ainda não há lugares verificados |
| ● | `myPage.verifiedPlaces.error` | Could not load your verified places. | 인증한 장소를 불러오지 못했어요. | Não foi possível carregar seus lugares verificados. |
|  | `myPage.verifiedPlaces.favorite` | Save place | 장소 저장 | Salvar lugar |
|  | `myPage.verifiedPlaces.loading` | Loading verified places | 인증한 장소를 불러오는 중 | Carregando lugares verificados |
|  | `myPage.verifiedPlaces.title` | Verified places | 검증한 장소 | Lugares verificados |
|  | `myPage.verifiedPlaces.unfavorite` | Remove saved place | 저장 취소 | Remover lugar salvo |
|  | `myPage.couponDetail.validityDays_many` | — | — | {{count}} dias após a emissão |

## `settings`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `settings.support.loading` | Loading | 불러오는 중 | Carregando |
| ● | `settings.support.error` | Could not load | 불러오지 못했습니다 | Não foi possível carregar |
|  | `settings.support.empty` | No information | 정보 없음 | Sem informações |
|  | `settings.support.navigationUnavailable` | Navigation is unavailable for this screen. Return to settings and try again. | 이 화면의 탐색 연결을 사용할 수 없습니다. 설정으로 돌아가 다시 시도해 주세요. | A navegação está indisponível nesta tela. Volte às configurações e tente novamente. |
|  | `settings.support.guide` | Unavailable feature. Opens an explanation. | 미지원 기능입니다. 사유 안내를 엽니다. | Recurso indisponível. Abre uma explicação. |
|  | `settings.support.emailEdit` | Edit email | 이메일 수정 | Editar e-mail |
|  | `settings.support.emailReason` | Direct email editing is unavailable because no update contract is published. | 이메일 직접 수정 계약이 공개되지 않아 사용할 수 없습니다. | A edição direta do e-mail está indisponível porque nenhum contrato de atualização foi publicado. |
|  | `settings.support.oauth` | Connected accounts | 연결된 계정 | Contas conectadas |
|  | `settings.support.oauthReason` | The server does not provide a connected-account status query. | 서버에서 계정 연결 상태 조회를 제공하지 않습니다. | O servidor não oferece consulta do status das contas conectadas. |
|  | `settings.support.checkInCount` | Check-ins | 체크인 수 | Check-ins |
|  | `settings.support.reviewCount` | My reviews | 내 리뷰 수 | Minhas avaliações |
|  | `settings.support.verifiedCount` | Verified places | 검증한 장소 | Lugares verificados |
|  | `settings.support.verifiedReason` | Check-in totals count visits, not unique verified places. A verified-place total is unavailable. | 체크인 수는 방문 횟수이며 고유한 검증 장소 수가 아닙니다. 검증 장소 수는 제공되지 않습니다. | O total de check-ins conta visitas, não lugares verificados únicos. O total de lugares verificados não está disponível. |
| ● | `settings.support.logoutError` | Could not complete logout. Please check your sign-in state. | 로그아웃을 완료하지 못했습니다. 로그인 상태를 확인해 주세요. | Não foi possível concluir a saída. Verifique o estado da sua sessão. |
|  | `settings.export.title` | My data | 내 데이터 | Meus dados |
|  | `settings.export.download` | Download my data | 내 데이터 다운로드 | Baixar meus dados |
|  | `settings.export.confirm` | Prepare a JSON file containing your personal data? Choose where to save it in the share sheet. | 개인정보가 포함된 JSON 파일을 준비할까요? 공유 화면에서 저장 위치를 선택해 주세요. | Preparar um arquivo JSON com seus dados pessoais? Escolha onde salvar na tela de compartilhamento. |
|  | `settings.export.cancel` | Cancel | 취소 | Cancelar |
|  | `settings.export.description` | Export the data provided by your account. This does not download location history or delete data. | 계정에서 제공하는 데이터를 내보냅니다. 위치 기록 다운로드나 데이터 삭제 기능은 아닙니다. | Exporte os dados fornecidos pela sua conta. Isso não baixa o histórico de localização nem exclui dados. |
|  | `settings.export.loading` | Preparing the file… | 파일을 준비하는 중입니다. | Preparando o arquivo… |
|  | `settings.export.cancelled` | Download cancelled. | 다운로드를 취소했습니다. | Download cancelado. |
| ● | `settings.export.error` | Could not download. Please try again. | 다운로드하지 못했습니다. 다시 시도해 주세요. | Não foi possível baixar. Tente novamente. |
|  | `settings.export.prepared` | File prepared. Saving or cancelling in the share sheet cannot be confirmed by the app. | 파일을 준비했습니다. 공유 화면에서의 저장 또는 취소 여부는 앱이 확인할 수 없습니다. | Arquivo preparado. O app não consegue confirmar se você salvou ou cancelou na tela de compartilhamento. |
|  | `settings.appearance.dark` | Dark mode | 다크 모드 | Modo escuro |
|  | `settings.appearance.description` | Choose whether PingDom follows your device appearance or uses a fixed mode. | 기기 화면 설정을 따르거나 원하는 화면 모드를 고정할 수 있어요. | Escolha se o PingDom segue a aparência do aparelho ou usa um modo fixo. |
|  | `settings.appearance.light` | Light mode | 라이트 모드 | Modo claro |
|  | `settings.appearance.section` | Appearance | 화면 모드 | Aparência |
|  | `settings.appearance.selected` | Selected | 선택됨 | Selecionado |
|  | `settings.appearance.system` | Use system setting | 시스템 설정 사용 | Padrão do sistema |
|  | `settings.appearance.title` | Appearance | 화면 모드 | Aparência |
|  | `settings.language.description` | Choose the language used throughout PingDom. | 핑덤에서 사용할 언어를 선택해 주세요. | Escolha o idioma usado em todo o PingDom. |
|  | `settings.language.section` | Language | 언어 | Idioma |
|  | `settings.language.selected` | Selected | 선택됨 | Selecionado |
|  | `settings.language.title` | Language | 언어 설정 | Idioma |
| ● | `settings.account.deleteDescription` | Deleting your account permanently removes your records and First Recorder history. | 탈퇴하면 내가 남긴 기록과 First Recorder 이력이 모두 사라져요. | Excluir sua conta remove permanentemente seus registros e seu histórico de First Recorder. |
|  | `settings.account.email` | Email | 이메일 | E-mail |
|  | `settings.account.items.coupons` | Coupons | 쿠폰 | Cupons |
| ● | `settings.account.items.deleteAccount` | Delete account | 회원 탈퇴 | Excluir conta |
|  | `settings.account.items.loginInformation` | Login information | 로그인 정보 | Dados de acesso |
|  | `settings.account.items.loginInformationDescription` | Email and password | 이메일 및 비밀번호 | E-mail e senha |
|  | `settings.account.items.logout` | Log out | 로그아웃 | Sair |
|  | `settings.account.items.myRecords` | My records | 내 기록 | Meus registros |
|  | `settings.account.loginSection` | Login information | 로그인 정보 | Dados de acesso |
|  | `settings.account.sections.account` | Account | 계정 | Conta |
|  | `settings.account.sections.activity` | Activity | 활동 | Atividade |
|  | `settings.account.sections.session` | Session | 세션 | Sessão |
|  | `settings.account.title` | Account management | 계정 관리 | Gerenciar conta |
|  | `settings.account.username` | Username | 아이디 | Nome de usuário |
|  | `settings.back` | Back | 뒤로가기 | Voltar |
| ● | `settings.deleteAccount` | Delete account | 회원 탈퇴 | Excluir conta |
|  | `settings.details.appInformation.description` | App information will be available in a later update. | 앱 정보는 추후 업데이트에서 제공할 예정입니다. | As informações do app estarão disponíveis em uma atualização futura. |
|  | `settings.details.appInformation.title` | App information | 앱 정보 | Informações do app |
|  | `settings.details.coupons.description` | The coupon box will be connected in a separate update. | 쿠폰 보관함은 별도 업데이트에서 연결할 예정입니다. | Os cupons serão conectados em uma atualização separada. |
|  | `settings.details.coupons.title` | Coupons | 쿠폰 | Cupons |
|  | `settings.details.dataManagement.description` | Data download and deletion will be connected after its policy is defined. | 데이터 다운로드와 삭제는 정책 확정 후 연결할 예정입니다. | O download e a exclusão de dados serão conectados depois que a política for definida. |
|  | `settings.details.dataManagement.title` | Download or delete data | 데이터 다운로드 · 삭제 | Baixar ou excluir dados |
| ● | `settings.details.deleteAccount.description` | Account deletion is unavailable until reauthentication and confirmation policies are defined. Your account has not been changed. | 재인증과 최종 확인 정책이 정해지지 않아 회원 탈퇴를 사용할 수 없습니다. 계정에는 아무 변경도 적용되지 않았습니다. | A exclusão da conta está indisponível até que as políticas de reautenticação e confirmação sejam definidas. Sua conta não foi alterada. |
| ● | `settings.details.deleteAccount.title` | Delete account | 회원 탈퇴 | Excluir conta |
|  | `settings.details.footprintMap.description` | There is no footprint map screen or matching data contract yet. | 발자국 지도 전용 화면과 데이터 계약이 아직 없습니다. | Ainda não há uma tela de mapa de pegadas nem um contrato de dados correspondente. |
|  | `settings.details.footprintMap.title` | My footprint map | 내 발자국 지도 | Meu mapa de pegadas |
|  | `settings.details.locationSettings.description` | Location settings will be connected in a separate update. | 위치 정보 설정은 별도 업데이트에서 연결할 예정입니다. | As configurações de localização serão conectadas em uma atualização separada. |
|  | `settings.details.locationSettings.title` | Location settings | 위치 정보 설정 | Configurações de localização |
|  | `settings.details.loginInformation.description` | Login information management will be connected in a separate update. | 로그인 정보 관리는 별도 업데이트에서 연결할 예정입니다. | O gerenciamento dos dados de acesso será conectado em uma atualização separada. |
|  | `settings.details.loginInformation.title` | Login information | 로그인 정보 | Dados de acesso |
|  | `settings.details.logout.description` | Logout is not connected yet. You are still signed in. | 로그아웃은 아직 연결되지 않았습니다. 로그인 상태가 유지됩니다. | A saída ainda não está conectada. Você continua conectado. |
|  | `settings.details.logout.title` | Log out | 로그아웃 | Sair |
|  | `settings.details.myRecords.description` | Record management has no dedicated screen or defined scope yet. Reviews and check-ins are different records. | 내 기록 관리의 범위와 전용 화면이 정해지지 않았습니다. 리뷰와 체크인은 서로 다른 기록입니다. | O gerenciamento de registros ainda não tem tela própria nem escopo definido. Avaliações e check-ins são registros diferentes. |
|  | `settings.details.myRecords.title` | Manage my records | 내 기록 관리 | Gerenciar meus registros |
| ● | `settings.details.notices.description` | An official notices source and screen have not been configured. | 공식 공지사항 제공 경로와 화면이 아직 연결되지 않았습니다. | A fonte e a tela de avisos oficiais ainda não foram configuradas. |
| ● | `settings.details.notices.title` | Notices | 공지사항 | Avisos |
|  | `settings.details.notificationSettings.description` | Notification settings will be connected in a separate update. | 알림 설정은 별도 업데이트에서 연결할 예정입니다. | As configurações de notificação serão conectadas em uma atualização separada. |
|  | `settings.details.notificationSettings.title` | Notification settings | 알림 설정 | Configurações de notificação |
|  | `settings.details.passwordChange.description` | Password change is not connected yet. Your password has not been changed. | 비밀번호 변경은 아직 연결되지 않았습니다. 비밀번호에는 아무 변경도 적용되지 않았습니다. | A alteração de senha ainda não está conectada. Sua senha não foi alterada. |
|  | `settings.details.passwordChange.title` | Change password | 비밀번호 변경 | Alterar senha |
| ● | `settings.details.privacyPolicy.description` | The approved privacy policy document and its URL have not been configured. | 승인된 개인정보 처리방침 문서와 URL이 아직 연결되지 않았습니다. | O documento aprovado da política de privacidade e sua URL ainda não foram configurados. |
| ● | `settings.details.privacyPolicy.title` | Privacy policy | 개인정보 처리방침 | Política de privacidade |
| ● | `settings.details.privacySettings.description` | Privacy settings will be connected in a separate update. | 개인정보 설정은 별도 업데이트에서 연결할 예정입니다. | As configurações de privacidade serão conectadas em uma atualização separada. |
| ● | `settings.details.privacySettings.title` | Privacy settings | 개인정보 설정 | Configurações de privacidade |
|  | `settings.details.savedPlaces.description` | A dedicated saved-place management screen is not defined yet. | 저장 장소 관리 전용 화면이 아직 정의되지 않았습니다. | Ainda não foi definida uma tela própria para gerenciar lugares salvos. |
|  | `settings.details.savedPlaces.title` | Manage saved places | 관심 장소 관리 | Gerenciar lugares salvos |
| ● | `settings.details.terms.description` | The approved terms document and its URL have not been configured. | 승인된 이용약관 문서와 URL이 아직 연결되지 않았습니다. | O documento aprovado dos termos e sua URL ainda não foram configurados. |
| ● | `settings.details.terms.title` | Terms of service | 이용약관 | Termos de serviço |
|  | `settings.location.title` | Location & privacy | 위치·개인정보 | Localização e privacidade |
|  | `settings.location.locationSection` | Location information | 위치 정보 | Informações de localização |
|  | `settings.location.visibilitySection` | Visibility | 공개 범위 | Visibilidade |
|  | `settings.location.dataSection` | Data management | 데이터 관리 | Gerenciamento de dados |
|  | `settings.location.description` | Check device location permission and supported features. This screen does not collect your location. | 기기 위치 권한과 지원되는 기능을 확인하세요. 이 화면에서는 위치를 수집하지 않습니다. | Confira a permissão de localização do aparelho e os recursos compatíveis. Esta tela não coleta sua localização. |
|  | `settings.location.device` | Device location permission | 기기 위치 권한 | Permissão de localização do aparelho |
|  | `settings.location.foreground` | Collect location only while recording | 기록할 때만 위치 수집 | Coletar a localização apenas ao registrar |
|  | `settings.location.verification` | GPS on-site verification | GPS 현장 인증 | Verificação presencial por GPS |
|  | `settings.location.profileVisibility` | Profile visibility | 프로필 공개 | Visibilidade do perfil |
|  | `settings.location.nickname` | Show nickname in place history | 장소 기록에 닉네임 표시 | Mostrar o apelido no histórico de lugares |
|  | `settings.location.download` | Export my data | 내 데이터 내보내기 | Exportar meus dados |
| ● | `settings.location.deleteHistory` | Delete all location history | 위치 기록 전체 삭제 | Excluir todo o histórico de localização |
| ● | `settings.location.permissionStates.loading` | Checking | 확인 중 | Verificando |
| ● | `settings.location.permissionStates.granted` | Allowed | 허용됨 | Permitido |
| ● | `settings.location.permissionStates.denied` | Permission needed | 권한 필요 | Permissão necessária |
| ● | `settings.location.permissionStates.restricted` | Allow in device settings | 설정에서 허용 필요 | Permita nas configurações do aparelho |
| ● | `settings.location.permissionStates.unavailable` | Unavailable | 사용할 수 없음 | Indisponível |
| ● | `settings.location.permissionStates.error` | Could not check permission | 확인 실패 | Não foi possível verificar a permissão |
|  | `settings.location.request` | Request location permission | 위치 권한 요청 | Solicitar permissão de localização |
|  | `settings.location.openSettings` | Open device settings | 기기 설정 열기 | Abrir as configurações do aparelho |
|  | `settings.location.retry` | Check again | 다시 확인 | Verificar novamente |
| ● | `settings.location.settingsError` | Could not open device settings. Please try again. | 기기 설정을 열지 못했습니다. 다시 시도해 주세요. | Não foi possível abrir as configurações do aparelho. Tente novamente. |
| ● | `settings.location.permissionNotice` | Change or revoke permission in device settings. This screen does not start location tracking. | 권한 변경·해제는 기기 설정에서 할 수 있습니다. 이 화면에서는 위치 추적을 시작하지 않습니다. | Altere ou revogue a permissão nas configurações do aparelho. Esta tela não inicia o rastreamento de localização. |
|  | `settings.location.capability.loading` | Checking availability | 사용 가능 여부 확인 중 | Verificando disponibilidade |
|  | `settings.location.capability.granted` | Location permission allows use | 위치 권한이 있어 사용 가능 | A permissão de localização permite o uso |
| ● | `settings.location.capability.denied` | Location permission required | 위치 권한이 필요함 | Permissão de localização necessária |
|  | `settings.location.capability.restricted` | Permission must be allowed in device settings | 기기 설정에서 위치 권한 허용이 필요함 | A permissão precisa ser concedida nas configurações do aparelho |
|  | `settings.location.capability.unavailable` | Unavailable on this device | 현재 기기에서 사용할 수 없음 | Indisponível neste aparelho |
| ● | `settings.location.capability.error` | Could not check availability | 사용 가능 여부 확인 실패 | Não foi possível verificar a disponibilidade |
|  | `settings.location.foregroundDescription` | Not supported. A policy for saving this choice is not available. This is separate from periodic location collection. | 지원되지 않음 · 이 선택을 저장할 정책이 아직 없습니다. 주기적인 위치 수집과는 별개입니다. | Não compatível. Não há uma política para salvar esta opção. Isso é separado da coleta periódica de localização. |
|  | `settings.location.footprintDescription` | Coming soon. A map of your location history is not available yet. | 준비 중 · 내 위치 기록을 보여주는 지도는 아직 지원하지 않습니다. | Em breve. Um mapa do seu histórico de localização ainda não está disponível. |
|  | `settings.location.visibilityDescription` | Not supported. Profile visibility cannot be saved yet. | 지원되지 않음 · 프로필 공개 범위를 저장하는 기능이 아직 없습니다. | Não compatível. A visibilidade do perfil ainda não pode ser salva. |
|  | `settings.location.nicknameDescription` | Not supported. Nickname visibility cannot be saved yet. | 지원되지 않음 · 닉네임 표시 여부를 저장하는 기능이 아직 없습니다. | Não compatível. A visibilidade do apelido ainda não pode ser salva. |
|  | `settings.location.downloadDescription` | Export account information and other supported user data. This is not a location history download. | 계정 정보 등 지원되는 사용자 데이터를 내보냅니다. 위치 기록 다운로드가 아닙니다. | Exporte as informações da conta e outros dados de usuário compatíveis. Isso não é um download do histórico de localização. |
| ● | `settings.location.policyDescription` | Coming soon. The approved privacy policy document is not connected yet. | 준비 중 · 승인된 개인정보 처리방침 문서가 아직 연결되지 않았습니다. | Em breve. O documento aprovado da política de privacidade ainda não está conectado. |
| ● | `settings.location.deleteDescription` | Not supported. Deleting location history separately is not available. No data will be deleted here. | 지원되지 않음 · 위치 기록만 삭제하는 기능이 아직 없습니다. 여기서는 어떤 데이터도 삭제하지 않습니다. | Não compatível. Não é possível excluir o histórico de localização separadamente. Nenhum dado será excluído aqui. |
|  | `settings.logout` | Log out | 로그아웃 | Sair |
|  | `settings.notifications.hotplace` | A place I recorded becomes popular | 내가 먼저 기록한 장소 급상승 | Um lugar que registrei fica popular |
|  | `settings.notifications.hotplaceDescription` | Get updates when your First Recorder place is trending | First Recorder로 남긴 장소가 뜨면 알려드려요 | Receba novidades quando seu lugar de First Recorder estiver em alta |
|  | `settings.notifications.like` | New activity on my recorded places | 내 기록 장소에 새 반응 | Nova atividade nos meus lugares registrados |
|  | `settings.notifications.likeDescription` | Get updates when people react to your records | 내가 남긴 장소의 새 반응을 알려드려요 | Receba novidades quando as pessoas reagirem aos seus registros |
| ● | `settings.notifications.loadFailed` | Notification settings could not be loaded. | 알림 설정을 불러오지 못했어요. | Não foi possível carregar as configurações de notificação. |
|  | `settings.notifications.otherSection` | Other | 기타 | Outros |
|  | `settings.notifications.pushAll` | Allow all push notifications | 푸시 알림 전체 허용 | Permitir todas as notificações push |
|  | `settings.notifications.pushAllDescription` | You can still receive important account notices | 끄면 안내 알림만 받을 수 있어요 | Você ainda pode receber avisos importantes da conta |
|  | `settings.notifications.quiet` | Quiet hours | 야간 알림 받기 | Horário de silêncio |
|  | `settings.notifications.quietDescription` | Use the quiet hours saved to your account | 계정에 저장된 방해 금지 시간을 사용해요 | Use o horário de silêncio salvo na sua conta |
|  | `settings.notifications.recordsSection` | My records & places | 내 기록 · 장소 | Meus registros e lugares |
|  | `settings.notifications.title` | Notification settings | 알림 설정 | Configurações de notificação |
| ● | `settings.notifications.updateFailedDescription` | Your previous setting was restored. Please try again. | 이전 설정으로 되돌렸어요. 다시 시도해주세요. | Sua configuração anterior foi restaurada. Tente novamente. |
| ● | `settings.notifications.updateFailedTitle` | Could not update notifications | 알림 설정을 변경하지 못했어요 | Não foi possível atualizar as notificações |
|  | `settings.pending.back` | Back to settings | 설정으로 돌아가기 | Voltar às configurações |
|  | `settings.pending.title` | Coming soon | 준비 중인 기능입니다 | Em breve |
|  | `settings.rows.accountInfo` | Username · Email | 아이디 · 이메일 | Usuário · E-mail |
|  | `settings.rows.dataManagement` | Download · delete data | 데이터 다운로드 · 삭제 | Baixar · excluir dados |
|  | `settings.rows.favoritePlaces` | Manage favorite places | 관심 장소 관리 | Gerenciar lugares favoritos |
|  | `settings.rows.footprintMap` | My footprint map | 내 발자국 지도 | Meu mapa de pegadas |
|  | `settings.rows.locationSettings` | Location settings | 위치 정보 설정 | Configurações de localização |
|  | `settings.rows.myRecords` | Manage my records | 내 기록 관리 | Gerenciar meus registros |
| ● | `settings.rows.notices` | Notices | 공지사항 | Avisos |
|  | `settings.rows.notificationSettings` | Notification settings | 알림 설정 | Configurações de notificação |
|  | `settings.rows.password` | Change password | 비밀번호 변경 | Alterar senha |
| ● | `settings.rows.privacyPolicy` | Privacy policy | 개인정보 처리방침 | Política de privacidade |
|  | `settings.rows.profileEdit` | Edit profile | 프로필 편집 | Editar perfil |
| ● | `settings.rows.terms` | Terms of use | 이용약관 | Termos de uso |
|  | `settings.rows.version` | Version | 버전 정보 | Versão |
|  | `settings.sections.account` | Account | 계정 | Conta |
|  | `settings.sections.appInfo` | App information | 앱 정보 | Informações do app |
|  | `settings.sections.notifications` | Notifications | 알림 | Notificações |
|  | `settings.sections.preferences` | Preferences | 환경설정 | Preferências |
| ● | `settings.sections.privacy` | Privacy · location | 개인정보 · 위치 | Privacidade · localização |
|  | `settings.sections.records` | Records · places | 기록 · 장소 | Registros · lugares |
|  | `settings.title` | Settings | 설정 | Configurações |
|  | `settings.values.everyone` | Everyone | 전체 공개 | Todos |
|  | `settings.values.notConnected` | Not connected | 연결 전 | Não conectado |
|  | `settings.values.off` | Off | 꺼짐 | Desativado |
|  | `settings.values.on` | On | 켜짐 | Ativado |
|  | `settings.values.onlyMe` | Only me | 나만 보기 | Só eu |

## `merchantMyPage`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `merchantMyPage.back` | Back | 뒤로가기 | Voltar |
|  | `merchantMyPage.settings` | Settings | 설정 | Configurações |
|  | `merchantMyPage.title` | My page | 마이 페이지 | Minha página |
| ● | `merchantMyPage.roleLabel` | Business owner | 사업자 | Proprietário do negócio |
|  | `merchantMyPage.loading` | Loading your store | 가게 정보를 불러오는 중 | Carregando sua loja |
| ● | `merchantMyPage.loadError` | Could not load your store. | 가게 정보를 불러오지 못했어요. | Não foi possível carregar sua loja. |
|  | `merchantMyPage.retry` | Try again | 다시 시도 | Tentar novamente |
|  | `merchantMyPage.review.author` | Visitor #{{id}} | 이용인 #{{id}} | Visitante nº {{id}} |
|  | `merchantMyPage.review.time` | {{date}} · {{relative}} | {{date}} · {{relative}} | {{date}} · {{relative}} |
|  | `merchantMyPage.noStore` | No store is linked to this account yet. | 아직 연결된 가게가 없어요. | Ainda não há nenhuma loja vinculada a esta conta. |
|  | `merchantMyPage.store.title` | My store | 나의 가게 | Minha loja |
|  | `merchantMyPage.store.verifiedCount` | {{count}} people verified this! | {{count}}명이 검증했어요! | {{count}} pessoas verificaram! |
|  | `merchantMyPage.store.address` | Location | 위치 | Localização |
|  | `merchantMyPage.store.businessHours` | Business hours | 영업 시간 | Horário de funcionamento |
|  | `merchantMyPage.store.phoneNumber` | Phone number | 전화번호 | Número de telefone |
|  | `merchantMyPage.store.editField` | Edit {{field}} | {{field}} 수정 | Editar {{field}} |
|  | `merchantMyPage.store.features.englishSupport` | English available | 영어응대 가능 | Atendimento em inglês |
|  | `merchantMyPage.store.features.parking` | Parking available | 주차가능 | Estacionamento disponível |
|  | `merchantMyPage.reviews.title` | Reviews | 리뷰 | Avaliações |
|  | `merchantMyPage.reviews.viewAll` | See all reviews | 리뷰 모두 보기 | Ver todas as avaliações |
|  | `merchantMyPage.reviews.empty` | No reviews yet | 아직 리뷰가 없어요 | Ainda não há avaliações |
|  | `merchantMyPage.events.title` | Event management | 이벤트 관리 | Gerenciamento de eventos |
|  | `merchantMyPage.events.subtitle` | Currently running events | 현재 진행중인 이벤트 | Eventos em andamento |
|  | `merchantMyPage.events.create` | New event | 새 이벤트 | Novo evento |
| ● | `merchantMyPage.events.delete` | Delete event | 이벤트 삭제 | Excluir evento |
|  | `merchantMyPage.events.empty` | No events yet | 아직 이벤트가 없어요 | Ainda não há eventos |
|  | `merchantMyPage.events.closeConfirmTitle` | Close this event? | 이벤트를 종료할까요? | Encerrar este evento? |
|  | `merchantMyPage.events.closeConfirmBody` | Closed events can no longer be issued to tourists. | 종료한 이벤트는 더 이상 관광객에게 발급되지 않아요. | Eventos encerrados não podem mais ser emitidos para turistas. |
|  | `merchantMyPage.events.closeConfirm` | Close | 종료 | Encerrar |
|  | `merchantMyPage.events.closeCancel` | Cancel | 취소 | Cancelar |
| ● | `merchantMyPage.events.closeFailed` | Could not close the event. | 이벤트를 종료하지 못했어요. | Não foi possível encerrar o evento. |
|  | `merchantMyPage.events.status.ongoing` | Ongoing | 진행중 | Em andamento |
|  | `merchantMyPage.events.status.ended` | Ended | 종료 | Encerrado |
|  | `merchantMyPage.events.status.upcoming` | Upcoming | 예정됨 | Em breve |

## `placeDetail`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `placeDetail.back` | Back | 뒤로 | Voltar |
|  | `placeDetail.couponUsage` | Coupon use: {{value}} | 쿠폰 사용: {{value}} | Uso de cupons: {{value}} |
|  | `placeDetail.englishMenu` | English menu: {{value}} | 영문 메뉴: {{value}} | Cardápio em inglês: {{value}} |
|  | `placeDetail.languages` | Languages: {{value}} | 지원 언어: {{value}} | Idiomas: {{value}} |
|  | `placeDetail.liveStatus` | Live status | 실시간 상태 | Status ao vivo |
|  | `placeDetail.loading` | Loading place details... | 장소 상세를 불러오는 중입니다... | Carregando detalhes do lugar... |
|  | `placeDetail.offer.eligibility` | Who can claim: {{value}} | 발급 대상: {{value}} | Quem pode resgatar: {{value}} |
|  | `placeDetail.offer.expiry` | Valid: {{value}} | 유효 기간: {{value}} | Validade: {{value}} |
|  | `placeDetail.offer.title` | Coupon offer | 쿠폰 혜택 | Oferta de cupom |
|  | `placeDetail.operating.beforeOpen` | Not open yet | 영업 전 | Ainda não abriu |
|  | `placeDetail.operating.closed` | Closed | 영업 종료 | Fechado |
|  | `placeDetail.operating.closedToday` | Closed today | 오늘 휴무 | Fechado hoje |
|  | `placeDetail.operating.closesAt` | Closes at {{time}} | {{time}}에 영업 종료 | Fecha às {{time}} |
|  | `placeDetail.operating.open` | Open | 영업 중 | Aberto |
|  | `placeDetail.operating.opensAt` | Opens at {{time}} | {{time}}에 영업 시작 | Abre às {{time}} |
|  | `placeDetail.operating.opensLaterAt` | Opens on the next business day at {{time}} | 다음 영업일 {{time}}에 영업 시작 | Abre no próximo dia útil às {{time}} |
|  | `placeDetail.operating.opensTomorrowAt` | Opens tomorrow at {{time}} | 내일 {{time}}에 영업 시작 | Abre amanhã às {{time}} |
|  | `placeDetail.operating.permanentlyClosed` | Permanently closed | 폐업 | Fechado permanentemente |
|  | `placeDetail.operating.temporarilyClosed` | Temporarily closed | 임시 휴무 | Fechado temporariamente |
|  | `placeDetail.operating.unknown` | Hours unavailable | 영업시간 정보 없음 | Horário indisponível |
|  | `placeDetail.review.anonymousUser` | User | 사용자 | Usuário |
|  | `placeDetail.verification.admin` | Administrator verified | 관리자 확인 정보 | Verificado por um administrador |
|  | `placeDetail.verification.owner` | Provided by the business | 사업자 제공 정보 | Fornecido pelo estabelecimento |
|  | `placeDetail.verification.source` | Source verified | 출처 확인 정보 | Fonte verificada |
|  | `placeDetail.touristSupport` | Tourist support | 관광객 지원 | Suporte ao turista |
|  | `placeDetail.trust` | Trust | 신뢰 정보 | Confiança |
|  | `placeDetail.trustScore` | {{score}}/100 · {{confidence}} confidence | {{score}}/100 · 신뢰도 {{confidence}} | {{score}}/100 · confiança {{confidence}} |
|  | `placeDetail.unknownValue` | Unknown | 알 수 없음 | Desconhecido |
|  | `placeDetail.waitMinutes_one` | {{count}} minute | {{count}}분 | {{count}} minuto |
|  | `placeDetail.waitMinutes_other` | {{count}} minutes | {{count}}분 | {{count}} minutos |
|  | `placeDetail.waitTime` | Estimated wait: {{value}} | 예상 대기: {{value}} | Espera estimada: {{value}} |
|  | `placeDetail.waitMinutes_many` | — | — | {{count}} minutos |

## `placeOffers`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `placeOffers.title` | Tourist coupon | 관광객 쿠폰 | Cupom para turistas |
|  | `placeOffers.loading` | Checking available coupons... | 받을 수 있는 쿠폰을 확인하고 있습니다... | Verificando cupons disponíveis... |
|  | `placeOffers.empty.title` | No coupons available | 받을 수 있는 쿠폰이 없습니다 | Nenhum cupom disponível |
|  | `placeOffers.empty.description` | There is no issuable coupon for this place right now. | 지금 이 장소에서 발급 가능한 쿠폰이 없습니다. | No momento não há nenhum cupom que possa ser emitido para este lugar. |
|  | `placeOffers.auth.description` | Sign in to check and issue this coupon. | 쿠폰을 확인하고 발급받으려면 로그인하세요. | Entre para conferir e resgatar este cupom. |
|  | `placeOffers.auth.action` | Sign in | 로그인 | Entrar |
| ● | `placeOffers.detail.benefitLabel` | Benefit | 혜택 | Benefício |
| ● | `placeOffers.detail.periodLabel` | Issuable period | 발급 기간 | Período de emissão |
| ● | `placeOffers.detail.validityLabel` | Valid after issue | 발급 후 사용 기간 | Validade após a emissão |
| ● | `placeOffers.detail.inventoryLabel` | Remaining | 남은 수량 | Restantes |
| ● | `placeOffers.detail.eligibilityLabel` | Eligibility | 발급 대상 | Elegibilidade |
|  | `placeOffers.detail.periodUnavailable` | Period unavailable | 기간 정보 없음 | Período indisponível |
|  | `placeOffers.detail.inventoryUnlimited` | No limit | 수량 제한 없음 | Sem limite |
|  | `placeOffers.detail.inventoryRemaining_one` | {{count}} left | {{count}}개 남음 | Resta {{count}} |
|  | `placeOffers.detail.inventoryRemaining_other` | {{count}} left | {{count}}개 남음 | Restam {{count}} |
|  | `placeOffers.detail.eligibilityActiveTravelSchedule` | Travelers with an active trip schedule | 여행 일정이 활성화된 여행자 | Viajantes com um roteiro de viagem ativo |
|  | `placeOffers.detail.eligibilityPublic` | Anyone | 누구나 | Qualquer pessoa |
|  | `placeOffers.detail.eligibilityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | Consulte as condições da oferta |
|  | `placeOffers.detail.validityDays_one` | Use within {{count}} day of issue | 발급 후 {{count}}일 이내 사용 | Use em até {{count}} dia após a emissão |
|  | `placeOffers.detail.validityDays_other` | Use within {{count}} days of issue | 발급 후 {{count}}일 이내 사용 | Use em até {{count}} dias após a emissão |
|  | `placeOffers.detail.validityOfferEnd` | Valid until the offer ends | 혜택 종료일까지 사용 가능 | Válido até o fim da oferta |
|  | `placeOffers.detail.validityOfferEndOn` | Valid until {{date}} | {{date}}까지 사용 가능 | Válido até {{date}} |
|  | `placeOffers.detail.validityCapped` | Capped by the offer end date | 혜택 종료일까지로 제한됨 | Limitado pela data de término da oferta |
|  | `placeOffers.detail.validityUnknown` | See offer terms | 쿠폰 조건을 확인하세요 | Consulte as condições da oferta |
|  | `placeOffers.cta.issue` | Get coupon | 쿠폰 받기 | Pegar cupom |
|  | `placeOffers.cta.issuing` | Issuing... | 발급 중... | Emitindo... |
| ● | `placeOffers.cta.a11yIssue` | Get coupon for {{offer}} | {{offer}} 쿠폰 받기 | Pegar cupom de {{offer}} |
| ● | `placeOffers.cta.a11yIssuing` | Issuing coupon | 쿠폰 발급 중 | Emitindo cupom |
| ● | `placeOffers.error.eligibility` | This coupon is for eligible travelers only. | 이 쿠폰은 발급 대상 여행자만 받을 수 있습니다. | Este cupom é apenas para viajantes elegíveis. |
| ● | `placeOffers.error.notFound` | This offer is no longer available. | 이 혜택은 더 이상 발급할 수 없습니다. | Esta oferta não está mais disponível. |
| ● | `placeOffers.error.conflictDuplicate` | You already issued this coupon. | 이미 발급받은 쿠폰입니다. | Você já resgatou este cupom. |
| ● | `placeOffers.error.conflictWindowClosed` | The issuance window for this coupon has closed. | 이 쿠폰의 발급 기간이 종료되었습니다. | O período de emissão deste cupom foi encerrado. |
| ● | `placeOffers.error.conflictStockOut` | This coupon is out of stock. | 이 쿠폰이 모두 소진되었습니다. | Este cupom está esgotado. |
| ● | `placeOffers.error.conflictUnknown` | This coupon could not be issued. Please try again later. | 쿠폰을 발급하지 못했습니다. 잠시 후 다시 시도해 주세요. | Não foi possível emitir este cupom. Tente mais tarde. |
|  | `placeOffers.success.title` | Coupon issued | 쿠폰이 발급되었습니다 | Cupom emitido |
|  | `placeOffers.success.description` | Your coupon is ready. | 쿠폰이 준비되었습니다. | Seu cupom está pronto. |
|  | `placeOffers.success.code` | Code | 코드 | Código |
|  | `placeOffers.success.expiry` | Expires | 만료 | Expira |
| ● | `placeOffers.success.hint` | Find it later in My coupons. | 내 쿠폰에서 다시 확인할 수 있습니다. | Encontre depois em Meus cupons. |
|  | `placeOffers.success.viewAction` | View my coupons | 내 쿠폰 보기 | Ver meus cupons |
|  | `placeOffers.success.issueAnother` | Get another coupon | 다른 쿠폰 받기 | Pegar outro cupom |
|  | `placeOffers.detail.inventoryRemaining_many` | — | — | Restam {{count}} |
|  | `placeOffers.detail.validityDays_many` | — | — | Use em até {{count}} dias após a emissão |

## `placeStatus`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `placeStatus.closed` | Permanently closed | 폐업 | Fechado permanentemente |
|  | `placeStatus.open` | Operating | 영업 중 | Em funcionamento |
|  | `placeStatus.temporarilyClosed` | Temporarily closed | 임시 휴무 | Fechado temporariamente |
|  | `placeStatus.unknown` | Status unknown | 상태 알 수 없음 | Status desconhecido |

## `placeSupport`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `placeSupport.available` | Available | 가능 | Disponível |
|  | `placeSupport.unavailable` | Unavailable | 불가능 | Indisponível |
|  | `placeSupport.unknown` | Unknown | 알 수 없음 | Desconhecido |

## `placeTrust`

| 우선 | 키 | en | ko | pt-BR |
|---|---|---|---|---|
|  | `placeTrust.confidence.high` | High | 높음 | Alta |
|  | `placeTrust.confidence.low` | Low | 낮음 | Baixa |
|  | `placeTrust.confidence.medium` | Medium | 보통 | Média |
|  | `placeTrust.confidence.unknown` | Unknown | 알 수 없음 | Desconhecida |
