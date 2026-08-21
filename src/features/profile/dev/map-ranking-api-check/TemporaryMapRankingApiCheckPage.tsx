import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMapPlaceRankings } from '../../../place/hooks/useMapPlaceRankings';
import type { PlaceRankingPeriod } from '../../../place/model/placeRanking.types';
import { getApiErrorUx } from '../../../../v2/shared/api';
import { isLocalRankingEndpoint, type TemporaryMapRankingEndpoint } from './model';

type Props = {
  endpoint: TemporaryMapRankingEndpoint;
  onBack: () => void;
};

type TestResult =
  | { data?: unknown; kind: 'success' }
  | { error: unknown; kind: 'error' };

const PERIODS: PlaceRankingPeriod[] = ['DAY', 'WEEK', 'MONTH'];

function getErrorDebug(error: unknown) {
  const ux = getApiErrorUx(error);

  return [
    `분류: ${ux.kind}`,
    `HTTP: ${ux.error.status ?? '-'}`,
    `code: ${ux.error.code ?? '-'}`,
    `message: ${ux.error.message}`,
    `response: ${JSON.stringify(ux.error.responseData ?? null, null, 2)}`,
  ].join('\n');
}

export default function TemporaryMapRankingApiCheckPage({ endpoint, onBack }: Props) {
  const isLocal = isLocalRankingEndpoint(endpoint);
  const [latitude, setLatitude] = useState('37.54');
  const [longitude, setLongitude] = useState('127.05');
  const [radiusKm, setRadiusKm] = useState('5');
  const [period, setPeriod] = useState<PlaceRankingPeriod>('WEEK');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState('1');
  const [limit, setLimit] = useState('20');
  const [result, setResult] = useState<TestResult | null>(null);

  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  const parsedRadiusKm = Number(radiusKm);
  const rankingsQuery = useMapPlaceRankings({
    ...(category.trim() ? { category: category.trim() } : {}),
    limit: Number(limit),
    page: Number(page),
    period,
    scope: isLocal ? 'LOCAL' : 'NATIONAL',
    ...(isLocal ? {
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      radiusKm: parsedRadiusKm,
    } : {}),
  }, { enabled: false });

  const coordinatesAreValid = Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude) &&
    Number.isFinite(parsedRadiusKm);
  const pagingIsValid = Number.isInteger(Number(page)) && Number(page) >= 1 &&
    Number.isInteger(Number(limit)) && Number(limit) >= 1;
  const isInputValid = pagingIsValid && (!isLocal || coordinatesAreValid);
  const isPending = rankingsQuery.isFetching;

  const execute = async () => {
    setResult(null);

    const response = await rankingsQuery.refetch();

    setResult(response.isError
      ? { error: response.error, kind: 'error' }
      : { data: response.data, kind: 'success' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="API 목록으로 돌아가기" hitSlop={12} onPress={onBack}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Map 랭킹 API 테스트</Text>
          <Text selectable style={styles.endpointTitle}>{endpoint}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.warning}>
          이 endpoint는 로그인 토큰이 필요합니다. 토큰 없이 호출하면 401 INVALID_TOKEN이 옵니다.
        </Text>

        {isLocal ? (
          <View style={styles.grid}>
            {[
              ['latitude', latitude, setLatitude],
              ['longitude', longitude, setLongitude],
              ['radiusKm', radiusKm, setRadiusKm],
            ].map(([label, value, setter]) => (
              <TextInput
                accessibilityLabel={label as string}
                key={label as string}
                keyboardType="numbers-and-punctuation"
                placeholder={label as string}
                style={styles.gridInput}
                value={value as string}
                onChangeText={setter as (text: string) => void}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.segment}>
          {PERIODS.map((value) => (
            <Pressable
              accessibilityRole="button"
              key={value}
              style={[styles.segmentButton, period === value && styles.segmentSelected]}
              onPress={() => setPeriod(value)}
            >
              <Text style={period === value ? styles.segmentTextSelected : styles.segmentText}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          accessibilityLabel="category"
          autoCapitalize="characters"
          placeholder="category (비우면 전체)"
          style={styles.input}
          value={category}
          onChangeText={setCategory}
        />

        <View style={styles.grid}>
          <TextInput
            accessibilityLabel="page"
            keyboardType="number-pad"
            placeholder="page"
            style={styles.gridInput}
            value={page}
            onChangeText={setPage}
          />
          <TextInput
            accessibilityLabel="limit"
            keyboardType="number-pad"
            placeholder="limit"
            style={styles.gridInput}
            value={limit}
            onChangeText={setLimit}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!isInputValid || isPending}
          style={[styles.executeButton, (!isInputValid || isPending) && styles.disabled]}
          onPress={() => void execute()}
        >
          <Text style={styles.executeText}>{isPending ? '요청 중...' : '요청 실행'}</Text>
        </Pressable>

        {result?.kind === 'error' ? (
          <Text selectable style={styles.error}>{getErrorDebug(result.error)}</Text>
        ) : null}
        {result?.kind === 'success' ? (
          <View style={styles.result}>
            <Text style={styles.success}>요청 성공</Text>
            <Text style={styles.meta}>
              {[
                `criteria: ${rankingsQuery.criteria ?? '알 수 없음'}`,
                `period: ${rankingsQuery.period ?? '알 수 없음'}`,
                `집계: ${rankingsQuery.periodStart ?? '-'} ~ ${rankingsQuery.periodEnd ?? '-'}`,
                `반경 확장: ${rankingsQuery.radiusExpanded ? '있음' : '없음'}`,
                `적용 반경: ${rankingsQuery.appliedRadiusKm ?? '-'}`,
                `총 ${rankingsQuery.totalCount}건`,
              ].join('\n')}
            </Text>
            <Text selectable style={styles.json}>
              {result.data === undefined ? '(응답 본문 없음)' : JSON.stringify(result.data, null, 2)}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backText: { color: '#0c0c0d', fontSize: 48, fontWeight: '300', lineHeight: 48 },
  content: { gap: 14, padding: 24 },
  disabled: { opacity: 0.5 },
  endpointTitle: { color: '#6e6e76', fontSize: 13, marginTop: 2 },
  error: {
    backgroundColor: '#fff1f3', borderRadius: 14, color: '#b4233c',
    fontFamily: 'monospace', fontSize: 13, lineHeight: 20, padding: 16,
  },
  executeButton: {
    alignItems: 'center', backgroundColor: '#7856ff', borderRadius: 24,
    justifyContent: 'center', minHeight: 64, marginTop: 8,
  },
  executeText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridInput: {
    backgroundColor: '#f6f6f7', borderColor: '#d8d8dc', borderRadius: 14,
    borderWidth: 1, color: '#000000', flexGrow: 1, fontSize: 15,
    minHeight: 52, minWidth: '30%', paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center', borderBottomColor: '#ededee', borderBottomWidth: 1,
    flexDirection: 'row', gap: 14, paddingHorizontal: 24, paddingVertical: 14,
  },
  headerCopy: { flex: 1 },
  input: {
    backgroundColor: '#f6f6f7', borderColor: '#d8d8dc', borderRadius: 14,
    borderWidth: 1, color: '#000000', fontSize: 15, minHeight: 52,
    paddingHorizontal: 16, paddingVertical: 11,
  },
  json: { color: '#3b3b40', fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  meta: { color: '#087443', fontSize: 13, lineHeight: 20 },
  result: { backgroundColor: '#f0fbf5', borderRadius: 14, gap: 8, padding: 16 },
  safeArea: { backgroundColor: '#ffffff', flex: 1 },
  segment: { flexDirection: 'row', gap: 8 },
  segmentButton: {
    backgroundColor: '#f6f6f7', borderRadius: 999, flex: 1,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  segmentSelected: { backgroundColor: '#7856ff' },
  segmentText: { color: '#3b3b40', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  segmentTextSelected: { color: '#ffffff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  success: { color: '#087443', fontSize: 15, fontWeight: '800' },
  title: { color: '#202024', fontSize: 20, fontWeight: '800' },
  warning: {
    backgroundColor: '#fff8e7', borderRadius: 14, color: '#8a5700',
    fontSize: 14, lineHeight: 21, padding: 16,
  },
});
