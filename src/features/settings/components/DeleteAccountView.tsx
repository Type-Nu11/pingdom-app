import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import SettingsNavBar from './SettingsNavBar';

type DeleteAccountViewProps = {
  onBack: () => void;
  onDeleted: () => Promise<void>;
};

const DELETE_WARNING_ITEMS = [
  '프로필, 게시물, 댓글 및 좋아요 기록',
  '저장한 장소 및 추천 히스토리',
  '차단/신고 내역 등 모든 활동 데이터',
];

const DeleteAccountView = ({ onBack, onDeleted }: DeleteAccountViewProps) => {
  const [agreed, setAgreed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert('계정을 삭제할까요?', '삭제한 계정과 데이터는 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        onPress: () => {
          setIsDeleting(true);
          void onDeleted().catch(() => {
            setIsDeleting(false);
            Alert.alert('계정 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.');
          });
        },
        style: 'destructive',
        text: '삭제하기',
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <SettingsNavBar title="계정 삭제" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>계정을 삭제하면 아래 정보가 영구적으로 사라집니다.</Text>
          {DELETE_WARNING_ITEMS.map((item) => (
            <Text key={item} style={styles.warningItem}>
              {'•'} {item}
            </Text>
          ))}
        </View>

        <Pressable style={styles.checkboxRow} onPress={() => setAgreed((prev) => !prev)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>안내 사항을 모두 확인했으며 삭제에 동의합니다.</Text>
        </Pressable>

        <Pressable
          disabled={!agreed || isDeleting}
          style={[styles.deleteButton, (!agreed || isDeleting) && styles.deleteButtonDisabled]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>{isDeleting ? '삭제 중...' : '계정 삭제하기'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderColor: '#d1d4d5',
    borderRadius: 4,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: '#ee2b2b',
    borderColor: '#ee2b2b',
  },
  checkboxLabel: {
    color: '#000000',
    fontSize: 14,
  },
  checkboxMark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    paddingBottom: 40,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#ee2b2b',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
  },
  deleteButtonDisabled: {
    backgroundColor: '#d1d4d5',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
  },
  warningBox: {
    backgroundColor: '#fdecec',
    borderColor: '#f8b9b9',
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    margin: 20,
    padding: 16,
  },
  warningItem: {
    color: '#3b3b40',
    fontSize: 14,
    lineHeight: 22,
  },
  warningTitle: {
    color: '#ee2b2b',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
});

export default DeleteAccountView;
