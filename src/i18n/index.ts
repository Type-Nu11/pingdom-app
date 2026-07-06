import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      selectLanguage: {
        title: 'Select Language',
        subtitle: "We'll tell you the best route!",
        button: 'Continue',
        search: 'Search...',
      },
      selectCountry: {
        title: 'Select Country',
        subtitle: "We'll tell you the best route!",
        button: 'Continue',
        search: 'Search...',
      },
      selectAge: {
        title: 'Select Birth Year',
        subtitle: "We'll tell you the best route!",
        button: 'Continue',
      },
      selectGender: {
        title: 'Select gender',
        subtitle: "We'll tell you the best route!",
        button: 'Continue',
        male: 'Male',
        female: 'Female',
        other: 'Prefer not to say',
      },
      countries: {
        us: 'United States',
        cn: 'China',
        jp: 'Japan',
        th: 'Thailand',
        vn: 'Vietnam',
        kr: 'South Korea',
      },
      loginForeign: {
        title: 'Only Pingdom',
        subtitle: "Let's find hidden\nplaces in Korea!",
        button: 'Get Started',
      },
      map: {
        search: {
          placeholder: 'Enter a search term...',
          accessibilityLabel: 'Enter a search term',
        },
        categories: {
          etc: 'Etc',
          food: 'Food',
          music: 'Music',
          fashion: 'Fashion',
          game: 'Game',
        },
        actions: {
          likedPlaces: 'View liked places',
          savedPlaces: 'View saved places',
          addPlace: 'Post place',
        },
      },
      apiErrors: {
        networkError: "Couldn't connect to the server. Please check your network connection.",
        sessionExpired: 'Your session has expired. Please log in again.',
      },
    },
  },
  ko: {
    translation: {
      selectLanguage: {
        title: '언어 선택',
        subtitle: '최적의 경로를 알려드릴게요!',
        button: '계속',
        search: '검색어를 입력하세요...',
      },
      selectCountry: {
        title: '국가 선택',
        subtitle: '최적의 경로를 알려드릴게요!',
        button: '계속',
        search: '검색어를 입력하세요...',
      },
      selectAge: {
        title: '생년 선택',
        subtitle: '최적의 경로를 알려드릴게요!',
        button: '계속',
      },
      selectGender: {
        title: '성별 선택',
        subtitle: '최적의 경로를 알려드릴게요!',
        button: '계속',
        male: '남성',
        female: '여성',
        other: '비공개',
      },
      countries: {
        us: '미국',
        cn: '중국',
        jp: '일본',
        th: '태국',
        vn: '베트남',
        kr: '대한민국',
      },
      loginForeign: {
        title: '오직 핑덤',
        subtitle: '한국의 숨은 장소를\n찾아보세요!',
        button: '시작하기',
      },
      map: {
        search: {
          placeholder: '검색어를 입력하세요...',
          accessibilityLabel: '검색어를 입력하세요',
        },
        categories: {
          etc: '기타',
          food: '음식',
          music: '음악',
          fashion: '패션',
          game: '게임',
        },
        actions: {
          likedPlaces: '좋아요 장소 보기',
          savedPlaces: '저장한 장소 보기',
          addPlace: '게시 하기',
        },
      },
      apiErrors: {
        networkError: '서버에 연결하지 못했어요. 네트워크 상태를 확인해 주세요.',
        sessionExpired: '로그인이 만료됐어요. 다시 로그인해 주세요.',
      },
    },
  },
  ja: {
    translation: {
      selectLanguage: {
        title: '言語を選択',
        subtitle: '最適なルートをご案内します！',
        button: '続ける',
        search: '検索...',
      },
      selectCountry: {
        title: '国を選択',
        subtitle: '最適なルートをご案内します！',
        button: '続ける',
        search: '検索...',
      },
      selectAge: {
        title: '生まれた年を選択',
        subtitle: '最適なルートをご案内します！',
        button: '続ける',
      },
      selectGender: {
        title: '性別を選択',
        subtitle: '最適なルートをご案内します！',
        button: '続ける',
        male: '男性',
        female: '女性',
        other: '未回答',
      },
      countries: {
        us: 'アメリカ',
        cn: '中国',
        jp: '日本',
        th: 'タイ',
        vn: 'ベトナム',
        kr: '韓国',
      },
      loginForeign: {
        title: 'Only Pingdom',
        subtitle: '韓国の隠れた場所を\n見つけましょう！',
        button: 'はじめる',
      },
      map: {
        search: {
          placeholder: '検索語を入力してください...',
          accessibilityLabel: '検索語を入力してください',
        },
        categories: {
          etc: 'その他',
          food: 'グルメ',
          music: '音楽',
          fashion: 'ファッション',
          game: 'ゲーム',
        },
        actions: {
          likedPlaces: 'いいねした場所を見る',
          savedPlaces: '保存した場所を見る',
          addPlace: '投稿する',
        },
      },
      apiErrors: {
        networkError: 'サーバーに接続できませんでした。ネットワーク状態をご確認ください。',
        sessionExpired: 'セッションが期限切れです。もう一度ログインしてください。',
      },
    },
  },
  zh: {
    translation: {
      selectLanguage: {
        title: '选择语言',
        subtitle: '我们将为您提供最佳路线！',
        button: '继续',
        search: '搜索...',
      },
      selectCountry: {
        title: '选择国家',
        subtitle: '我们将为您提供最佳路线！',
        button: '继续',
        search: '搜索...',
      },
      selectAge: {
        title: '选择出生年份',
        subtitle: '我们将为您提供最佳路线！',
        button: '继续',
      },
      selectGender: {
        title: '选择性别',
        subtitle: '我们将为您提供最佳路线！',
        button: '继续',
        male: '男',
        female: '女',
        other: '不愿透露',
      },
      countries: {
        us: '美国',
        cn: '中国',
        jp: '日本',
        th: '泰国',
        vn: '越南',
        kr: '韩国',
      },
      loginForeign: {
        title: 'Only Pingdom',
        subtitle: '发现韩国的隐藏景点！',
        button: '开始使用',
      },
      map: {
        search: {
          placeholder: '请输入搜索词...',
          accessibilityLabel: '请输入搜索词',
        },
        categories: {
          etc: '其他',
          food: '美食',
          music: '音乐',
          fashion: '时尚',
          game: '游戏',
        },
        actions: {
          likedPlaces: '查看喜欢的地点',
          savedPlaces: '查看已保存地点',
          addPlace: '发布',
        },
      },
      apiErrors: {
        networkError: '无法连接到服务器,请检查网络连接。',
        sessionExpired: '登录已过期,请重新登录。',
      },
    },
  },
  vi: {
    translation: {
      selectLanguage: {
        title: 'Chọn Ngôn Ngữ',
        subtitle: 'Chúng tôi sẽ hướng dẫn tuyến đường tốt nhất!',
        button: 'Tiếp tục',
        search: 'Tìm kiếm...',
      },
      selectCountry: {
        title: 'Chọn Quốc Gia',
        subtitle: 'Chúng tôi sẽ hướng dẫn tuyến đường tốt nhất!',
        button: 'Tiếp tục',
        search: 'Tìm kiếm...',
      },
      selectAge: {
        title: 'Chọn Năm Sinh',
        subtitle: 'Chúng tôi sẽ hướng dẫn tuyến đường tốt nhất!',
        button: 'Tiếp tục',
      },
      selectGender: {
        title: 'Chọn giới tính',
        subtitle: 'Chúng tôi sẽ hướng dẫn tuyến đường tốt nhất!',
        button: 'Tiếp tục',
        male: 'Nam',
        female: 'Nữ',
        other: 'Không muốn nói',
      },
      countries: {
        us: 'Hoa Kỳ',
        cn: 'Trung Quốc',
        jp: 'Nhật Bản',
        th: 'Thái Lan',
        vn: 'Việt Nam',
        kr: 'Hàn Quốc',
      },
      loginForeign: {
        title: 'Only Pingdom',
        subtitle: 'Cùng khám phá những địa điểm\nẩn giấu tại Hàn Quốc!',
        button: 'Bắt đầu',
      },
      map: {
        search: {
          placeholder: 'Nhập từ khóa tìm kiếm...',
          accessibilityLabel: 'Nhập từ khóa tìm kiếm',
        },
        categories: {
          etc: 'Khác',
          food: 'Ẩm thực',
          music: 'Âm nhạc',
          fashion: 'Thời trang',
          game: 'Trò chơi',
        },
        actions: {
          likedPlaces: 'Xem địa điểm đã thích',
          savedPlaces: 'Xem địa điểm đã lưu',
          addPlace: 'Đăng',
        },
      },
      apiErrors: {
        networkError: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        sessionExpired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      },
    },
  },
  th: {
    translation: {
      selectLanguage: {
        title: 'เลือกภาษา',
        subtitle: 'เราจะบอกเส้นทางที่ดีที่สุดให้คุณ!',
        button: 'ต่อไป',
        search: 'ค้นหา...',
      },
      selectCountry: {
        title: 'เลือกประเทศ',
        subtitle: 'เราจะบอกเส้นทางที่ดีที่สุดให้คุณ!',
        button: 'ต่อไป',
        search: 'ค้นหา...',
      },
      selectAge: {
        title: 'เลือกปีเกิด',
        subtitle: 'เราจะบอกเส้นทางที่ดีที่สุดให้คุณ!',
        button: 'ต่อไป',
      },
      selectGender: {
        title: 'เลือกเพศ',
        subtitle: 'เราจะบอกเส้นทางที่ดีที่สุดให้คุณ!',
        button: 'ต่อไป',
        male: 'ชาย',
        female: 'หญิง',
        other: 'ไม่ระบุ',
      },
      countries: {
        us: 'สหรัฐอเมริกา',
        cn: 'จีน',
        jp: 'ญี่ปุ่น',
        th: 'ไทย',
        vn: 'เวียดนาม',
        kr: 'เกาหลีใต้',
      },
      loginForeign: {
        title: 'Only Pingdom',
        subtitle: 'มาค้นหาสถานที่ลับ\nในเกาหลีกันเถอะ!',
        button: 'เริ่มต้นใช้งาน',
      },
      map: {
        search: {
          placeholder: 'ป้อนคำค้นหา...',
          accessibilityLabel: 'ป้อนคำค้นหา',
        },
        categories: {
          etc: 'อื่นๆ',
          food: 'อาหาร',
          music: 'เพลง',
          fashion: 'แฟชั่น',
          game: 'เกม',
        },
        actions: {
          likedPlaces: 'ดูสถานที่ที่ถูกใจ',
          savedPlaces: 'ดูสถานที่ที่บันทึกไว้',
          addPlace: 'โพสต์',
        },
      },
      apiErrors: {
        networkError: 'เชื่อมต่อกับเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย',
        sessionExpired: 'เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง',
      },
    },
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
