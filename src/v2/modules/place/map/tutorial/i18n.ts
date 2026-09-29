export const mapTutorialResources = {
  ko: {
    name: '핑디', title: '핑디 사용 안내', guest: '여행자',
    close: '튜토리얼 닫기', previous: '이전 안내', next: '다음 안내',
    finish: '튜토리얼 완료', progress: '{{current}} / {{total}} 단계',
    welcome: {
      greeting: '안녕하세요, {{username}}님',
      introduction: '{{username}}님의 여행을 더 쉽게 만들어드리는',
      agent: 'AI 에이전트, <accent>핑디</accent>예요.',
      help: '원하는 장소를 찾고, 예약을 준비하는 과정까지\n대화 한번으로 도와드릴게요.',
      start: '지금부터 간단히 사용법을 알려드릴게요!',
    },
    map: {
      prompt: '<accent>지도 버튼</accent>을 눌러보세요.',
      body: '내 주변의 핑들을 확인할 수 있어요.\n또한 우리 지역과 전국 트렌드 장소도 볼 수 있어요.',
    },
    favorites: {
      prompt: '<accent>즐겨찾기 버튼</accent>을 눌러보세요.',
      body: '관심 있는 장소를 즐겨찾기에 저장하고,\n언제든 다시 찾아볼 수 있어요.',
    },
    community: {
      prompt: '<accent>커뮤니티 버튼</accent>을 눌러보세요.',
      body: '다른 여행자들의 생생한 장소 경험을 확인하고,\n장소를 태그해 나만의 이야기도 공유할 수 있어요.',
    },
    reservations: {
      prompt: '<accent>예약 버튼</accent>을 눌러보세요.',
      body: '원하는 장소의 예약 가능 여부를 확인하고,\n날짜와 시간에 맞춰 간편하게 예약할 수 있어요.',
    },
    recommendations: {
      prompt: '<accent>장소 추천 버튼</accent>을 눌러보세요.',
      body: '{{username}}님의 관심사와 이용 상황을 바탕으로\n개인화된 장소 추천을 받을 수 있어요.',
    },
    verification: {
      prompt: '<accent>검증하기 버튼</accent>을 눌러보세요.',
      body: '직접 방문한 장소의 경험을 리뷰로 남기고,\n다른 여행자들이 믿고 방문할 수 있도록\n장소를 검증해주세요.',
    },
    categories: {
      prompt: '<accent>카테고리</accent>를 눌러보세요.',
      body: '음식점, 음악 등 원하는 카테고리를 선택하면\n해당하는 핑들만 골라서 확인할 수 있어요.',
    },
    profile: {
      prompt: '<accent>마이페이지</accent>를 눌러보세요.',
      body: '내 프로필과 여행 기간을 관리하고,\n내가 직접 검증한 장소들을 모아 볼 수 있어요.',
    },
  },
  en: {
    name: 'Pingdi', title: 'Meet Pingdi', guest: 'traveler',
    close: 'Close tutorial', previous: 'Previous tip', next: 'Next tip',
    finish: 'Finish tutorial', progress: 'Step {{current}} of {{total}}',
    welcome: {
      greeting: 'Hello, {{username}}!',
      introduction: 'Here to make your travels easier,',
      agent: 'I’m <accent>Pingdi</accent>, your AI agent.',
      help: 'From finding places to preparing reservations,\nI can help with a conversation.',
      start: 'Let me give you a quick tour!',
    },
    map: {
      prompt: 'Tap the <accent>Map button</accent>.',
      body: 'Discover pins around you, plus popular places\nin your area and across the country.',
    },
    favorites: {
      prompt: 'Tap the <accent>Favorites button</accent>.',
      body: 'Save places you’re interested in\nand find them again whenever you like.',
    },
    community: {
      prompt: 'Tap the <accent>Community button</accent>.',
      body: 'Explore other travelers’ experiences,\nand tag places to share your own stories.',
    },
    reservations: {
      prompt: 'Tap the <accent>Reservations button</accent>.',
      body: 'Check availability at the places you love\nand book a date and time that works for you.',
    },
    recommendations: {
      prompt: 'Tap the <accent>Recommendations button</accent>.',
      body: '{{username}}, discover personalized places\nbased on your interests and activity.',
    },
    verification: {
      prompt: 'Tap the <accent>Verify button</accent>.',
      body: 'Review the places you’ve visited\nand verify your experience to help\nother travelers visit with confidence.',
    },
    categories: {
      prompt: 'Tap a <accent>category</accent>.',
      body: 'Choose food, music, or another category\nto see only the pins that match.',
    },
    profile: {
      prompt: 'Tap <accent>My Page</accent>.',
      body: 'Manage your profile and travel dates,\nand browse the places you’ve verified.',
    },
  },
  ja: {
    name: 'ピンディ', title: 'ピンディの使い方', guest: '旅行者',
    close: 'チュートリアルを閉じる', previous: '前の案内', next: '次の案内',
    finish: 'チュートリアルを完了', progress: '{{current}} / {{total}} ステップ',
    welcome: {
      greeting: 'こんにちは、{{username}}さん',
      introduction: '{{username}}さんの旅をもっと気軽にする',
      agent: 'AIエージェントの<accent>ピンディ</accent>です。',
      help: '行きたい場所探しから予約の準備まで、\n会話ひとつでお手伝いします。',
      start: 'それでは、簡単に使い方をご紹介します！',
    },
    map: {
      prompt: '<accent>地図ボタン</accent>をタップしてください。',
      body: '周辺のピンを確認できます。\n地域や全国の人気スポットも見られます。',
    },
    favorites: {
      prompt: '<accent>お気に入りボタン</accent>をタップしてください。',
      body: '気になる場所をお気に入りに保存して、\nいつでも見返せます。',
    },
    community: {
      prompt: '<accent>コミュニティボタン</accent>をタップしてください。',
      body: 'ほかの旅行者の体験をのぞいたり、\n場所をタグ付けして自分の体験を共有できます。',
    },
    reservations: {
      prompt: '<accent>予約ボタン</accent>をタップしてください。',
      body: 'お気に入りの場所の空き状況を確認し、\n都合のよい日時で予約できます。',
    },
    recommendations: {
      prompt: '<accent>おすすめボタン</accent>をタップしてください。',
      body: '{{username}}さんの興味や行動に合わせた\nおすすめスポットを見つけられます。',
    },
    verification: {
      prompt: '<accent>認証ボタン</accent>をタップしてください。',
      body: '訪れた場所を振り返って体験を認証し、\nほかの旅行者が安心して\n訪れられるようにしましょう。',
    },
    categories: {
      prompt: '<accent>カテゴリー</accent>をタップしてください。',
      body: 'グルメや音楽などのカテゴリーを選ぶと、\n該当するピンだけを表示できます。',
    },
    profile: {
      prompt: '<accent>マイページ</accent>をタップしてください。',
      body: 'プロフィールや旅行日程を管理し、\n認証した場所を確認できます。',
    },
  },
} as const;
