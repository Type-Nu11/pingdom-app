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

import {
  usePlaceCard,
  usePlaceMap,
  usePlaceOperatingNotices,
  usePlaceVerificationMedia,
  usePlaceVisitDecision,
  useRecommendationExplanation,
  useRecordMapLinkConversion,
} from '../../../../v2/features/place-exploration';
import { getApiErrorUx } from '../../../../v2/shared/api';
import type { TemporaryPlaceExplorationEndpoint } from './model';

type Props = {
  endpoint: TemporaryPlaceExplorationEndpoint;
  onBack: () => void;
};

type TestResult =
  | { data?: unknown; kind: 'success' }
  | { error: unknown; kind: 'error' };

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

export default function TemporaryPlaceExplorationApiCheckPage({ endpoint, onBack }: Props) {
  const [placeId, setPlaceId] = useState('17');
  const [requestId, setRequestId] = useState('');
  const [provider, setProvider] = useState('KAKAO');
  const [linkType, setLinkType] = useState<'DIRECTIONS' | 'EXTERNAL_MAP'>('DIRECTIONS');
  const [west, setWest] = useState('126.90');
  const [south, setSouth] = useState('37.45');
  const [east, setEast] = useState('127.10');
  const [north, setNorth] = useState('37.60');
  const [zoom, setZoom] = useState('14');
  const [result, setResult] = useState<TestResult | null>(null);

  const parsedPlaceId = Number(placeId);
  const viewport = {
    east: Number(east),
    north: Number(north),
    south: Number(south),
    west: Number(west),
    zoom: Number(zoom),
  };
  const queryConfig = { enabled: false };
  const mapQuery = usePlaceMap(viewport, queryConfig);
  const cardQuery = usePlaceCard(parsedPlaceId, queryConfig);
  const visitDecisionQuery = usePlaceVisitDecision(parsedPlaceId, queryConfig);
  const noticesQuery = usePlaceOperatingNotices(parsedPlaceId, queryConfig);
  const mediaQuery = usePlaceVerificationMedia(parsedPlaceId, queryConfig);
  const explanationQuery = useRecommendationExplanation(requestId.trim(), queryConfig);
  const conversion = useRecordMapLinkConversion();

  const isMap = endpoint === 'GET /places/map';
  const isExplanation = endpoint === 'GET /places/recommendations/{requestId}/explanation';
  const isConversion = endpoint === 'POST /places/{placeId}/map-link-conversions';
  const needsPlaceId = !isMap && !isExplanation;
  const viewportIsValid = Object.values(viewport).every(Number.isFinite) &&
    Number.isInteger(viewport.zoom);
  const placeIdIsValid = Number.isSafeInteger(parsedPlaceId) && parsedPlaceId > 0;
  const isInputValid = isMap
    ? viewportIsValid
    : isExplanation
      ? Boolean(requestId.trim())
      : placeIdIsValid && (!isConversion || Boolean(requestId.trim() && provider.trim()));
  const isPending = mapQuery.isFetching || cardQuery.isFetching ||
    visitDecisionQuery.isFetching || noticesQuery.isFetching || mediaQuery.isFetching ||
    explanationQuery.isFetching || conversion.isPending;

  const runQuery = async (refetch: () => Promise<{ data?: unknown; error?: unknown; isError: boolean }>) => {
    const response = await refetch();
    setResult(response.isError
      ? { error: response.error, kind: 'error' }
      : { data: response.data, kind: 'success' });
  };

  const execute = () => {
    setResult(null);

    switch (endpoint) {
      case 'GET /places/map':
        void runQuery(mapQuery.refetch);
        break;
      case 'GET /places/{placeId}/card':
        void runQuery(cardQuery.refetch);
        break;
      case 'GET /places/{placeId}/visit-decision':
        void runQuery(visitDecisionQuery.refetch);
        break;
      case 'GET /places/{placeId}/operating-notices':
        void runQuery(noticesQuery.refetch);
        break;
      case 'GET /places/{id}/media/verification':
        void runQuery(mediaQuery.refetch);
        break;
      case 'GET /places/recommendations/{requestId}/explanation':
        void runQuery(explanationQuery.refetch);
        break;
      case 'POST /places/{placeId}/map-link-conversions':
        conversion.mutate({
          body: { linkType, provider: provider.trim(), requestId: requestId.trim() },
          placeId: parsedPlaceId,
        }, {
          onError: (error) => setResult({ error, kind: 'error' }),
          onSuccess: (data) => setResult({ data, kind: 'success' }),
        });
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="API 목록으로 돌아가기" hitSlop={12} onPress={onBack}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>장소 탐색 API 테스트</Text>
          <Text selectable style={styles.endpointTitle}>{endpoint}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {needsPlaceId ? (
          <TextInput
            accessibilityLabel="placeId"
            keyboardType="number-pad"
            placeholder="placeId"
            style={styles.input}
            value={placeId}
            onChangeText={setPlaceId}
          />
        ) : null}

        {isMap ? (
          <View style={styles.grid}>
            {[
              ['west', west, setWest], ['south', south, setSouth],
              ['east', east, setEast], ['north', north, setNorth], ['zoom', zoom, setZoom],
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

        {isExplanation || isConversion ? (
          <TextInput
            accessibilityLabel="requestId"
            autoCapitalize="none"
            placeholder="recommendation requestId"
            style={styles.input}
            value={requestId}
            onChangeText={setRequestId}
          />
        ) : null}

        {isConversion ? (
          <>
            <TextInput
              accessibilityLabel="provider"
              autoCapitalize="characters"
              placeholder="provider (예: KAKAO)"
              style={styles.input}
              value={provider}
              onChangeText={setProvider}
            />
            <View style={styles.segment}>
              {(['DIRECTIONS', 'EXTERNAL_MAP'] as const).map((value) => (
                <Pressable
                  accessibilityRole="button"
                  key={value}
                  style={[styles.segmentButton, linkType === value && styles.segmentSelected]}
                  onPress={() => setLinkType(value)}
                >
                  <Text style={linkType === value ? styles.segmentTextSelected : styles.segmentText}>
                    {value}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.warning}>
              전환 이벤트는 자동 재시도되지 않습니다. 버튼을 누를 때마다 새 요청이 전송됩니다.
            </Text>
          </>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!isInputValid || isPending}
          style={[styles.executeButton, (!isInputValid || isPending) && styles.disabled]}
          onPress={execute}
        >
          <Text style={styles.executeText}>{isPending ? '요청 중...' : '요청 실행'}</Text>
        </Pressable>

        {result?.kind === 'error' ? (
          <Text selectable style={styles.error}>{getErrorDebug(result.error)}</Text>
        ) : null}
        {result?.kind === 'success' ? (
          <View style={styles.result}>
            <Text style={styles.success}>요청 성공</Text>
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
