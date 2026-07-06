import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LikeIcon from '../../../assets/icons/actions/Like.svg';
import EditIcon from '../../../assets/icons/edit/Vector.svg';
import TrashIcon from '../../../assets/icons/edit/gg_trash.svg';
import type { UpdateRecordRequest } from '../../record/api/recordApi';
import type { RecordUploadFile } from '../../record/model/record.types';
import ProfileMini from './ProfileMini';

export type ArchivePost = {
  date: string;
  description: string;
  id: number;
  imageSource: ImageSourcePropType;
  likeCount: string;
  title: string;
  username: string;
};

type ArchiveFeedItemProps = {
  isDeleting?: boolean;
  isFirst?: boolean;
  isUpdating?: boolean;
  item: ArchivePost;
  onDelete: (id: number) => Promise<void>;
  onOpenLikes: () => void;
  onUpdate: (id: number, payload: UpdateRecordRequest) => Promise<void>;
};

const ArchiveFeedItem = ({
  isDeleting = false,
  isFirst = false,
  isUpdating = false,
  item,
  onDelete,
  onOpenLikes,
  onUpdate,
}: ArchiveFeedItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [selectedPhoto, setSelectedPhoto] = useState<RecordUploadFile | null>(null);
  const isBusy = isDeleting || isUpdating;
  const previewSource = selectedPhoto ? { uri: selectedPhoto.uri } : item.imageSource;

  const openEdit = () => {
    setTitle(item.title);
    setDescription(item.description);
    setSelectedPhoto(null);
    setIsMenuOpen(false);
    setIsEditOpen(true);
  };

  const handlePickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('사진 권한이 필요해요', '사진함에서 사진을 불러오려면 접근 권한을 허용해 주세요.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ['images'],
        quality: 0.9,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.uri) {
        Alert.alert('사진 선택에 실패했어요', '선택한 사진 정보를 읽지 못했습니다.');
        return;
      }

      setSelectedPhoto({
        name: asset.fileName ?? undefined,
        type: asset.mimeType ?? undefined,
        uri: asset.uri,
      });
    } catch {
      Alert.alert('사진함을 열지 못했어요', '잠시 후 다시 시도해 주세요.');
    }
  };

  const handleSubmitEdit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      Alert.alert('제목을 입력해 주세요', '게시물 제목은 비워둘 수 없어요.');
      return;
    }

    try {
      await onUpdate(item.id, {
        description: trimmedDescription,
        file: selectedPhoto ?? undefined,
        title: trimmedTitle,
      });
      setIsEditOpen(false);
      Alert.alert('수정 완료', '게시물이 수정됐어요.');
    } catch {
      // Parent handler shows the API-specific error message.
    }
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    Alert.alert('게시물을 삭제할까요?', '삭제한 게시물은 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          void onDelete(item.id);
        },
      },
    ]);
  };

  return (
    <View>
      <View style={[styles.header, !isFirst && styles.nextHeader]}>
        <ProfileMini place={item.title} username={item.username} />
        <View style={styles.headerActions}>
          <Text style={styles.date}>{item.date}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="게시물 메뉴 열기"
            disabled={isBusy}
            hitSlop={10}
            style={styles.menuButton}
            onPress={() => setIsMenuOpen((open) => !open)}
          >
            <Text style={styles.menuButtonText}>•••</Text>
          </Pressable>
          {isMenuOpen ? (
            <View style={styles.menu}>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                style={styles.menuItem}
                onPress={openEdit}
              >
                <View style={styles.menuIcon}>
                  <EditIcon width={16} height={16} />
                </View>
                <Text style={styles.menuText}>게시물 수정</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                style={styles.menuItem}
                onPress={handleDelete}
              >
                <View style={styles.menuIcon}>
                  <TrashIcon width={16} height={16} />
                </View>
                <Text style={[styles.menuText, styles.deleteText]}>게시물 삭제</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.imageFrame}>
        <Image
          source={item.imageSource}
          resizeMode="cover"
          style={styles.image}
        />
      </View>

      <View style={styles.content}>
        <Pressable style={styles.likeRow} onPress={onOpenLikes}>
          <LikeIcon color="#5e5e66" fill="none" width={20} height={18} />
          <Text style={styles.likeText}>{item.likeCount}</Text>
        </Pressable>

        <Text style={styles.caption}>
          <Text style={styles.captionAuthor}>{item.username} </Text>
          {item.description}
        </Text>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isEditOpen}
        onRequestClose={() => setIsEditOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editSheet}>
            <Text style={styles.editTitle}>게시물 수정</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="게시물 사진 변경"
              disabled={isBusy}
              style={styles.previewButton}
              onPress={handlePickPhoto}
            >
              <Image source={previewSource} resizeMode="cover" style={styles.previewImage} />
              <Text style={styles.previewText}>사진 변경</Text>
            </Pressable>
            <TextInput
              editable={!isBusy}
              placeholder="제목"
              placeholderTextColor="#9a9ca3"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              editable={!isBusy}
              multiline
              placeholder="설명"
              placeholderTextColor="#9a9ca3"
              style={[styles.input, styles.descriptionInput]}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
            <View style={styles.editActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => setIsEditOpen(false)}
              >
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isBusy}
                style={[styles.editButton, styles.saveButton, isBusy && styles.disabledButton]}
                onPress={() => {
                  void handleSubmitEdit();
                }}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveText}>저장</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    backgroundColor: '#f1f2f4',
  },
  cancelText: {
    color: '#3b3b40',
    fontSize: 15,
    fontWeight: '800',
  },
  caption: {
    color: '#3b3b40',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  captionAuthor: {
    fontWeight: '700',
  },
  content: {
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  date: {
    color: '#3b3b40',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  deleteText: {
    color: '#ff1f2d',
  },
  descriptionInput: {
    height: 112,
    paddingTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  editSheet: {
    backgroundColor: '#fff',
    borderRadius: 14,
    gap: 12,
    padding: 18,
    width: '86%',
  },
  editTitle: {
    color: '#111116',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: 24,
    paddingTop: 114,
    zIndex: 2,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 4,
    position: 'relative',
  },
  image: {
    backgroundColor: '#05070d',
    height: '100%',
    width: '100%',
  },
  imageFrame: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#05070d',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  input: {
    borderColor: '#e1e2e6',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111116',
    fontSize: 15,
    fontWeight: '600',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  likeRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  likeText: {
    color: '#5e5e66',
    fontSize: 12,
    fontWeight: '500',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 8,
    gap: 12,
    minWidth: 142,
    paddingHorizontal: 18,
    paddingVertical: 18,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    top: 42,
    zIndex: 20,
  },
  menuButton: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    minWidth: 32,
  },
  menuButtonText: {
    color: '#3b3b40',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 22,
  },
  menuIcon: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  menuText: {
    color: '#111116',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    flex: 1,
    justifyContent: 'center',
  },
  nextHeader: {
    paddingTop: 28,
  },
  previewButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  previewImage: {
    backgroundColor: '#05070d',
    borderRadius: 8,
    height: 96,
    width: 96,
  },
  previewText: {
    color: '#ff1956',
    fontSize: 13,
    fontWeight: '800',
  },
  saveButton: {
    backgroundColor: '#ff1956',
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ArchiveFeedItem;
