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
  'zh-CN': {
    name: 'Pingdi',
    title: 'Pingdi 使用指南',
    guest: '旅行者',
    close: '关闭教程',
    previous: '上一条提示',
    next: '下一条提示',
    finish: '完成教程',
    progress: '第 {{current}} 步，共 {{total}} 步',
    welcome: {
      greeting: '你好，{{username}}！',
      introduction: '让你的旅行更轻松，',
      agent: '我是 AI 助手 <accent>Pingdi</accent>。',
      help: '从寻找想去的地方到准备预约，\n只需一次对话我就能帮你。',
      start: '现在带你快速了解一下用法！',
    },
    map: { prompt: '请点按<accent>地图按钮</accent>。', body: '可以查看你周边的标记点，\n还能看到本地和全国的热门地点。' },
    favorites: { prompt: '请点按<accent>收藏按钮</accent>。', body: '把感兴趣的地点加入收藏，\n随时都能再次查看。' },
    community: { prompt: '请点按<accent>社区按钮</accent>。', body: '看看其他旅行者的真实体验，\n也可以标记地点分享你的故事。' },
    reservations: { prompt: '请点按<accent>预约按钮</accent>。', body: '确认想去的地点是否可预约，\n并按合适的日期和时间轻松预约。' },
    recommendations: { prompt: '请点按<accent>地点推荐按钮</accent>。', body: '{{username}}，根据你的兴趣和使用情况，\n为你推荐个性化的地点。' },
    verification: { prompt: '请点按<accent>验证按钮</accent>。', body: '为你去过的地点写下评价，\n验证你的体验，\n让其他旅行者放心前往。' },
    categories: { prompt: '请点按一个<accent>分类</accent>。', body: '选择美食、音乐等分类，\n即可只查看对应的标记点。' },
    profile: { prompt: '请点按<accent>我的页面</accent>。', body: '管理你的个人资料和旅行日期，\n并集中查看你验证过的地点。' },
  },
  'zh-TW': {
    name: 'Pingdi',
    title: 'Pingdi 使用說明',
    guest: '旅人',
    close: '關閉教學',
    previous: '上一則提示',
    next: '下一則提示',
    finish: '完成教學',
    progress: '第 {{current}} 步，共 {{total}} 步',
    welcome: {
      greeting: '{{username}}，你好！',
      introduction: '讓你的旅程更輕鬆，',
      agent: '我是 AI 助理 <accent>Pingdi</accent>。',
      help: '從尋找想去的地點到準備預約，\n只要一段對話就能幫你完成。',
      start: '現在就帶你快速認識使用方式！',
    },
    map: { prompt: '請點一下<accent>地圖按鈕</accent>。', body: '可以查看你附近的標記點，\n也能看到在地與全國的熱門地點。' },
    favorites: { prompt: '請點一下<accent>收藏按鈕</accent>。', body: '把感興趣的地點加入收藏，\n隨時都能再找出來。' },
    community: { prompt: '請點一下<accent>社群按鈕</accent>。', body: '看看其他旅人的真實體驗，\n也可以標記地點分享自己的故事。' },
    reservations: { prompt: '請點一下<accent>預約按鈕</accent>。', body: '確認想去的地點是否可預約，\n並依合適的日期與時間輕鬆預約。' },
    recommendations: { prompt: '請點一下<accent>地點推薦按鈕</accent>。', body: '{{username}}，依據你的興趣與使用情況，\n為你推薦個人化的地點。' },
    verification: { prompt: '請點一下<accent>驗證按鈕</accent>。', body: '為你去過的地點留下評論，\n驗證你的體驗，\n讓其他旅人安心前往。' },
    categories: { prompt: '請點一下任一<accent>類別</accent>。', body: '選擇美食、音樂等類別，\n就能只查看符合的標記點。' },
    profile: { prompt: '請點一下<accent>我的頁面</accent>。', body: '管理你的個人檔案與旅行日期，\n並一次瀏覽你驗證過的地點。' },
  },
} as const;
