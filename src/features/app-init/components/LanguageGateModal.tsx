import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { i18n,Language } from '../../../shared/i18n';


type Props = {
    visible: boolean;
    onSelectLanguage: (language: Language) => void;
};
 // 언어 선택 모달 컴포넌트

export default function LanguageGateModal({visible,onSelectLanguage}:Props) { //visivle,on.. 같은 props을 부모한테서 받아옴
    return (
        <Modal visible={visible} transparent={true} animationType="fade">
        <View style={styles.overlay}>
            <View style={styles.modal}>
                <Text style={styles.title}>{i18n.t('selectLanguage')}</Text>
                <Pressable style={styles.button} onPress={() => onSelectLanguage('ko')}>
                    <Text>{i18n.t('korean')}</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={() => onSelectLanguage('en')}>
                    <Text>{i18n.t('english')}</Text>
                </Pressable>
            </View>
        </View>
        </Modal>
    );
    }

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: 300,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    button: {
        padding: 14,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
    },
});
