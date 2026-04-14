import { useEffect,useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { i18n,Language } from "../../../shared/i18n";

const LANGUAGE_STORAGE_KEY = 'language';

export function useLanguagGate() {
    const [language, setLanguage] = useState<Language>('en'); //언어 넣는곳
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(true);//모달 보여주는 여부
    const [isBootstrapping, setIsBootstrapping] = useState(true);//부스트랩핑(앱 초기화) 여부

    //앱초기에 한번 실행 : 저장된 언어가 있는지 확인하고 언어설정,모달 표시 여부 결정
    useEffect(() => {
        const init = async () => {
            try {
                const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);//저장된거 가져오기
                if (saved === 'en' || saved === 'ko') {
                    setLanguage(saved);//저장된 언어 상태에 넣기
                    i18n.locale = saved; // i18n에도 저장된 언어넣기
                    setIsLanguageModalVisible(false);
                } else {
                    i18n.locale = 'en';
                    setIsLanguageModalVisible(true);
                }
            } finally {
                setIsBootstrapping(false);
            }
        };
        init();
    }, []);

    // 언어 선택 함수 : 언어 상태 업데이트 i18n 업데이트 모달 닫기 저장
    const selectLanguage = async (selected: Language) => {
        setLanguage(selected);
        i18n.locale = selected;
        setIsLanguageModalVisible(false);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, selected);
    };

    return {
        language,
        isLanguageModalVisible,
        isBootstrapping,
        selectLanguage
    };
}
