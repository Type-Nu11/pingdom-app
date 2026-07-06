import type { Language } from './types';

type ScreenTranslations = {
  selectCountry: { title: string; subtitle: string; button: string };
  selectAge: { title: string; subtitle: string; button: string };
  selectGender: { title: string; subtitle: string; button: string; male: string; female: string; other: string };
};

const translations: Record<Language, ScreenTranslations> = {
  en: {
    selectCountry: { title: 'Select Country', subtitle: "We'll tell you the best route!", button: 'Continue' },
    selectAge: { title: 'Select Birth Year', subtitle: "We'll tell you the best route!", button: 'Continue' },
    selectGender: { title: 'Select gender', subtitle: "We'll tell you the best route!", button: 'Continue', male: 'Male', female: 'Female', other: 'Prefer not to say' },
  },
  ko: {
    selectCountry: { title: '국가 선택', subtitle: '최적의 경로를 알려드릴게요!', button: '계속' },
    selectAge: { title: '태어난 해 선택', subtitle: '최적의 경로를 알려드릴게요!', button: '계속' },
    selectGender: { title: '성별 선택', subtitle: '최적의 경로를 알려드릴게요!', button: '계속', male: '남성', female: '여성', other: '비공개' },
  },
  ja: {
    selectCountry: { title: '国を選択', subtitle: '最適なルートをご案内します！', button: '続ける' },
    selectAge: { title: '生まれた年を選択', subtitle: '最適なルートをご案内します！', button: '続ける' },
    selectGender: { title: '性別を選択', subtitle: '最適なルートをご案内します！', button: '続ける', male: '男性', female: '女性', other: '未回答' },
  },
  zh: {
    selectCountry: { title: '选择国家', subtitle: '我们将为您提供最佳路线！', button: '继续' },
    selectAge: { title: '选择出生年份', subtitle: '我们将为您提供最佳路线！', button: '继续' },
    selectGender: { title: '选择性别', subtitle: '我们将为您提供最佳路线！', button: '继续', male: '男', female: '女', other: '不愿透露' },
  },
  vi: {
    selectCountry: { title: 'Chọn Quốc Gia', subtitle: 'Chúng tôi sẽ hướng dẫn tuyến đường tốt nhất!', button: 'Tiếp tục' },
    selectAge: { title: 'Chọn Năm Sinh', subtitle: 'Chúng tôi sẽ hướng dẫn tuyến đường tốt nhất!', button: 'Tiếp tục' },
    selectGender: { title: 'Chọn giới tính', subtitle: 'Chúng tôi sẽ hướng dẫn tuyến đường tốt nhất!', button: 'Tiếp tục', male: 'Nam', female: 'Nữ', other: 'Không muốn nói' },
  },
  th: {
    selectCountry: { title: 'เลือกประเทศ', subtitle: 'เราจะบอกเส้นทางที่ดีที่สุดให้คุณ!', button: 'ต่อไป' },
    selectAge: { title: 'เลือกปีเกิด', subtitle: 'เราจะบอกเส้นทางที่ดีที่สุดให้คุณ!', button: 'ต่อไป' },
    selectGender: { title: 'เลือกเพศ', subtitle: 'เราจะบอกเส้นทางที่ดีที่สุดให้คุณ!', button: 'ต่อไป', male: 'ชาย', female: 'หญิง', other: 'ไม่ระบุ' },
  },
};

export const t = (lang: Language): ScreenTranslations => translations[lang];
