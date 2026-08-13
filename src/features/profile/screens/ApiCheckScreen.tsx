import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getApiErrorUx } from '../../../v2/shared/api';
import {
  ACTIVITY_INTENT_VALUES,
  type ActivityIntent,
  useClearCurrentActivityIntent,
  useCurrentActivityIntent,
  useReplaceCurrentActivityIntent,
} from '../../../v2/features/current-activity-intent';
import {
  TRAVEL_PURPOSE_MAX_SELECTIONS,
  TRAVEL_PURPOSE_VALUES,
  type TravelPurpose,
  useReplaceTravelPurposes,
  useTravelPurposes,
} from '../../../v2/features/travel-purposes';

type ApiCheckScreenProps = {
  footer?: ReactNode;
  onBack: () => void;
};

function getErrorDebug(error: unknown) {
  const ux = getApiErrorUx(error);

  return [
    `분류: ${ux.kind}`,
    `HTTP: ${ux.error.status ?? '-'}`,
    `code: ${ux.error.code ?? '-'}`,
    `message: ${ux.error.message}`,
  ].join('\n');
}

export default function ApiCheckScreen({ footer, onBack }: ApiCheckScreenProps) {
  const travelPurposesQuery = useTravelPurposes();
  const replaceTravelPurposes = useReplaceTravelPurposes();
  const currentActivityIntentQuery = useCurrentActivityIntent();
  const replaceCurrentActivityIntent = useReplaceCurrentActivityIntent();
  const clearCurrentActivityIntent = useClearCurrentActivityIntent();
  const [selected, setSelected] = useState<TravelPurpose[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<ActivityIntent>('EXPLORE');

  const savedTravelPurposes = useMemo(
    () => travelPurposesQuery.data?.travelPurposes ?? [],
    [travelPurposesQuery.data?.travelPurposes],
  );

  useEffect(() => {
    if (travelPurposesQuery.isSuccess) {
      setSelected(savedTravelPurposes);
    }
  }, [savedTravelPurposes, travelPurposesQuery.isSuccess]);

  useEffect(() => {
    if (currentActivityIntentQuery.data?.intent) {
      setSelectedIntent(currentActivityIntentQuery.data.intent);
    }
  }, [currentActivityIntentQuery.data?.intent]);

  const togglePurpose = (purpose: TravelPurpose) => {
    setSelected((current) => current.includes(purpose)
      ? current.filter((value) => value !== purpose)
      : current.length < TRAVEL_PURPOSE_MAX_SELECTIONS
        ? [...current, purpose]
        : current);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>API 확인하기</Text>
          <Text style={styles.subtitle}>연결된 endpoint 실기기 호출</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>GET 응답</Text>
          {travelPurposesQuery.isPending ? (
            <Text style={styles.muted}>불러오는 중...</Text>
          ) : travelPurposesQuery.isError ? (
            <>
              <Text selectable style={styles.errorText}>
                {getErrorDebug(travelPurposesQuery.error)}
              </Text>
              <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={() => void travelPurposesQuery.refetch()}
              >
                <Text style={styles.secondaryButtonText}>GET 다시 요청</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.successText}>200 조회 성공</Text>
              <Text selectable style={styles.jsonText}>
                {JSON.stringify(travelPurposesQuery.data, null, 2)}
              </Text>
              {savedTravelPurposes.length === 0 ? (
                <Text style={styles.muted}>저장된 여행 목적이 없습니다.</Text>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PUT 전체 교체</Text>
          <Text style={styles.muted}>
            원하는 값을 선택해 저장하세요. 모두 해제하면 빈 배열을 전송합니다.
          </Text>
          <View style={styles.purposeGrid}>
            {TRAVEL_PURPOSE_VALUES.map((purpose) => {
              const isSelected = selected.includes(purpose);
              return (
                <Pressable
                  accessibilityRole="button"
                  key={purpose}
                  style={[styles.purposeButton, isSelected && styles.purposeButtonSelected]}
                  onPress={() => togglePurpose(purpose)}
                >
                  <Text style={[styles.purposeText, isSelected && styles.purposeTextSelected]}>
                    {purpose}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text selectable style={styles.requestPreview}>
            {JSON.stringify({ travelPurposes: selected }, null, 2)}
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={replaceTravelPurposes.isPending}
            style={[
              styles.primaryButton,
              replaceTravelPurposes.isPending && styles.buttonDisabled,
            ]}
            onPress={() => replaceTravelPurposes.mutate({ travelPurposes: selected })}
          >
            <Text style={styles.primaryButtonText}>
              {replaceTravelPurposes.isPending ? '저장 중...' : 'PUT 저장하기'}
            </Text>
          </Pressable>

          {replaceTravelPurposes.isError ? (
            <Text selectable style={styles.errorText}>
              {getErrorDebug(replaceTravelPurposes.error)}
            </Text>
          ) : null}
          {replaceTravelPurposes.isSuccess ? (
            <Text style={styles.successText}>200 변경 성공 · 캐시 갱신 완료</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>현재 행동 의도 API · #164</Text>
          <Text style={styles.muted}>
            GET 조회 후 하나를 선택해 PUT 전체 변경하거나 DELETE로 해제합니다.
          </Text>

          {currentActivityIntentQuery.isPending ? (
            <Text style={styles.muted}>현재 행동 의도를 불러오는 중...</Text>
          ) : currentActivityIntentQuery.isError ? (
            <>
              <Text selectable style={styles.errorText}>
                {getErrorDebug(currentActivityIntentQuery.error)}
              </Text>
              <Pressable
                accessibilityRole="button"
                style={styles.secondaryButton}
                onPress={() => void currentActivityIntentQuery.refetch()}
              >
                <Text style={styles.secondaryButtonText}>행동 의도 GET 다시 요청</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.successText}>GET 200 조회 성공</Text>
              <Text selectable style={styles.jsonText}>
                {JSON.stringify(currentActivityIntentQuery.data, null, 2)}
              </Text>
              {currentActivityIntentQuery.data?.intent == null ? (
                <Text style={styles.muted}>현재 설정된 행동 의도가 없습니다.</Text>
              ) : null}
            </>
          )}

          <View style={styles.purposeGrid}>
            {ACTIVITY_INTENT_VALUES.map((intent) => {
              const isSelected = selectedIntent === intent;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  key={intent}
                  style={[styles.purposeButton, isSelected && styles.purposeButtonSelected]}
                  onPress={() => setSelectedIntent(intent)}
                >
                  <Text style={[styles.purposeText, isSelected && styles.purposeTextSelected]}>
                    {intent}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text selectable style={styles.requestPreview}>
            {JSON.stringify({ intent: selectedIntent }, null, 2)}
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={replaceCurrentActivityIntent.isPending}
            style={[
              styles.primaryButton,
              replaceCurrentActivityIntent.isPending && styles.buttonDisabled,
            ]}
            onPress={() => replaceCurrentActivityIntent.mutate({ intent: selectedIntent })}
          >
            <Text style={styles.primaryButtonText}>
              {replaceCurrentActivityIntent.isPending ? '변경 중...' : '행동 의도 PUT 변경'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={clearCurrentActivityIntent.isPending}
            style={[
              styles.dangerButton,
              clearCurrentActivityIntent.isPending && styles.buttonDisabled,
            ]}
            onPress={() => clearCurrentActivityIntent.mutate()}
          >
            <Text style={styles.dangerButtonText}>
              {clearCurrentActivityIntent.isPending ? '해제 중...' : '행동 의도 DELETE 해제'}
            </Text>
          </Pressable>

          {replaceCurrentActivityIntent.isError ? (
            <Text selectable style={styles.errorText}>
              {getErrorDebug(replaceCurrentActivityIntent.error)}
            </Text>
          ) : null}
          {clearCurrentActivityIntent.isError ? (
            <Text selectable style={styles.errorText}>
              {getErrorDebug(clearCurrentActivityIntent.error)}
            </Text>
          ) : null}
          {replaceCurrentActivityIntent.isSuccess ? (
            <Text style={styles.successText}>PUT 200 변경 성공 · 추천 캐시 갱신 완료</Text>
          ) : null}
          {clearCurrentActivityIntent.isSuccess ? (
            <Text style={styles.successText}>DELETE 204 해제 성공 · GET 재조회 요청 완료</Text>
          ) : null}
        </View>

        {footer}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backText: { color: '#0c0c0d', fontSize: 48, fontWeight: '300', lineHeight: 48 },
  buttonDisabled: { opacity: 0.55 },
  card: {
    backgroundColor: '#ffffff', borderColor: '#e5e5e7', borderRadius: 18,
    borderWidth: 1, gap: 14, padding: 18,
  },
  content: { gap: 16, padding: 20, paddingBottom: 40 },
  dangerButton: {
    alignItems: 'center', borderColor: '#b4233c', borderRadius: 14,
    borderWidth: 1, justifyContent: 'center', minHeight: 50,
  },
  dangerButtonText: { color: '#b4233c', fontSize: 16, fontWeight: '700' },
  errorText: {
    backgroundColor: '#fff1f3', borderRadius: 12, color: '#b4233c',
    fontFamily: 'monospace', fontSize: 13, lineHeight: 20, padding: 14,
  },
  header: {
    alignItems: 'center', borderBottomColor: '#e5e5e7', borderBottomWidth: 1,
    flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingVertical: 14,
  },
  headerCopy: { flex: 1 },
  jsonText: {
    backgroundColor: '#f6f6f7', borderRadius: 12, color: '#3b3b40',
    fontFamily: 'monospace', fontSize: 13, lineHeight: 19, padding: 14,
  },
  muted: { color: '#6e6e76', fontSize: 14, lineHeight: 20 },
  primaryButton: {
    alignItems: 'center', backgroundColor: '#ff1956', borderRadius: 14,
    justifyContent: 'center', minHeight: 50,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  purposeButton: {
    backgroundColor: '#f6f6f7', borderColor: '#e5e5e7', borderRadius: 999,
    borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9,
  },
  purposeButtonSelected: { backgroundColor: '#ff1956', borderColor: '#ff1956' },
  purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  purposeText: { color: '#3b3b40', fontSize: 13, fontWeight: '600' },
  purposeTextSelected: { color: '#ffffff' },
  requestPreview: {
    color: '#6e6e76', fontFamily: 'monospace', fontSize: 12, lineHeight: 18,
  },
  safeArea: { backgroundColor: '#fafafa', flex: 1 },
  secondaryButton: {
    alignItems: 'center', borderColor: '#ff1956', borderRadius: 12,
    borderWidth: 1, justifyContent: 'center', minHeight: 44,
  },
  secondaryButtonText: { color: '#ff1956', fontSize: 14, fontWeight: '700' },
  sectionTitle: { color: '#202024', fontSize: 18, fontWeight: '800' },
  subtitle: { color: '#6e6e76', fontSize: 12, marginTop: 2 },
  successText: { color: '#087443', fontSize: 14, fontWeight: '700' },
  title: { color: '#202024', fontSize: 22, fontWeight: '800' },
});
