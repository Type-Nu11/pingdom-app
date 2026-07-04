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
