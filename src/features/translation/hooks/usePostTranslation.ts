import { useState } from 'react';
import { Alert } from 'react-native';
import type { Post } from '../../record/model/record.types';
import type { PostTranslation } from '../model/translation.types';
import { mlKitTranslation } from '../services/mlKitTranslation';

const DEFAULT_TARGET_LANGUAGE = 'ko';

function getPostText(post: Post) {
  return (post.description || post.title).trim();
}

function confirmModelDownload() {
  return new Promise<boolean>((resolve) => {
    Alert.alert(
      '번역 언어 팩 다운로드',
      '번역에 필요한 언어 팩을 다운로드할까요? 약 30MB이며 Wi-Fi 사용을 권장해요.',
      [
        { text: '취소', style: 'cancel', onPress: () => resolve(false) },
        { text: '다운로드', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

function getTranslationErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === 'ML_KIT_UNAVAILABLE') {
    return '번역 기능을 사용하려면 ML Kit이 포함된 앱 빌드가 필요해요.';
  }

  return '번역하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

export function usePostTranslation(targetLanguage = DEFAULT_TARGET_LANGUAGE) {
  const [translations, setTranslations] = useState<Record<string, PostTranslation>>({});
  const [pendingPostIds, setPendingPostIds] = useState<Record<string, boolean>>({});

  const toggleTranslation = async (post: Post) => {
    const postId = String(post.id);
    const existingTranslation = translations[postId];

    if (pendingPostIds[postId]) {
      return;
    }

    if (existingTranslation?.isShowingTranslation) {
      setTranslations((previous) => ({
        ...previous,
        [postId]: { ...existingTranslation, isShowingTranslation: false },
      }));
      return;
    }

    if (existingTranslation) {
      setTranslations((previous) => ({
        ...previous,
        [postId]: { ...existingTranslation, isShowingTranslation: true },
      }));
      return;
    }

    const text = getPostText(post);

    if (!text) {
      Alert.alert('번역할 내용이 없어요');
      return;
    }

    setPendingPostIds((previous) => ({ ...previous, [postId]: true }));

    try {
      const plan = await mlKitTranslation.getTranslationPlan(text, targetLanguage);

      if (!plan.shouldTranslate) {
        Alert.alert('이미 선택한 언어로 작성된 게시글이에요.');
        return;
      }

      const allowModelDownload = !plan.requiresDownload || await confirmModelDownload();

      if (!allowModelDownload) {
        return;
      }

      const result = await mlKitTranslation.translate(
        text,
        plan.sourceLanguage,
        plan.targetLanguage,
        allowModelDownload,
      );

      setTranslations((previous) => ({
        ...previous,
        [postId]: {
          isShowingTranslation: true,
          translatedText: result.translatedText,
        },
      }));
    } catch (error) {
      Alert.alert('번역에 실패했어요', getTranslationErrorMessage(error));
    } finally {
      setPendingPostIds((previous) => ({ ...previous, [postId]: false }));
    }
  };

  return {
    pendingPostIds,
    toggleTranslation,
    translations,
  };
}
