import React, { useCallback, useState } from 'react';
import { AppState, Pressable, Text } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { configureApiTransport, ApiError, type ApiTransport } from '../../../../shared/api';
import { voiceSessionErrors } from '../../i18n/voiceSessionErrors';
import { voiceAssistantResources } from '../../i18n';
import { supportedLanguages } from '../../../../shared/i18n/resources';
import { placeQueryKeys } from '../../../place';
import type { VoiceNavigationTarget } from '../../model/voiceAssistantCommand.types';
import VoiceCommandScreen from '../../screens/VoiceCommandScreen';

const mockSpeechSession = { start: jest.fn(), stop: jest.fn(), cancel: jest.fn() };
jest.mock('../../adapters/expoSpeechInputAdapter', () => ({ expoSpeechInputAdapter: {
  available: true, getPermission: async () => 'granted', requestPermission: async () => 'granted',
  createSession: () => mockSpeechSession,
} }));
const navigation = { isFocused: () => true, addListener: () => () => undefined };
const original = AppState.currentState;
beforeEach(() => { jest.clearAllMocks(); (AppState as { currentState: string }).currentState = 'active'; });
afterEach(() => { (AppState as { currentState: string }).currentState = original; });

const place = { id: 42, name: '검증된 장소', address: '서울', touristCategories: [], operatingStatus: 'OPERATING' };
function Harness({ navigate, selected = false, account = 'account' }: { navigate: (target: VoiceNavigationTarget) => boolean; selected?: boolean; account?: string | null }) {
  const [open, setOpen] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | undefined>(selected ? 42 : undefined);
  const close = useCallback(() => setOpen(false), []);
  const onNavigate = useCallback((target: VoiceNavigationTarget) => {
    const accepted = navigate(target);
    if (accepted && (target.page === 'map' || target.page === 'favorites')) setSelectedPlaceId(undefined);
    return accepted;
  }, [navigate]);
  return <NavigationContext.Provider value={navigation as never}>
    <Pressable onPress={() => setOpen(true)} accessibilityLabel="AI 다시 열기"><Text>AI 다시 열기</Text></Pressable>
    {open && <VoiceCommandScreen onClose={close} context={{ accountRevision: account, selectedPlaceId,
      location: null, locationPermission: 'denied', radiusKm: 5, timezone: 'Asia/Seoul', placeListEnabled: true,
      navigateToPage: onNavigate }} />}
  </NavigationContext.Provider>;
}

const response = (target: object) => ({ data: JSON.stringify({ type: 'message', role: 'assistant',
  content: [{ type: 'tool_use', id: 'nav-1', name: 'navigateToPage', input: target }], stop_reason: 'tool_use' }) });

test('any community post opens an ID from a fresh readable feed and verified detail without GPS', async () => {
  const navigate = jest.fn(() => true);
  const post = jest.fn(async () => response({ page: 'communityPost' }));
  const get = jest.fn(async (path: string, options?: { params?: object }) => ({ data: path === '/community/posts'
    ? { posts: [{ postId: 71, title: '조회 가능한 글' }], page: 1, limit: 1, hasNext: false }
    : { postId: 71, title: '조회 가능한 글', content: '내용', images: [], places: [] } }));
  const restore = configureApiTransport({ post, get } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '커뮤니티 아무 글이나 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(screen.queryByTestId('voice-assistant-screen')).toBeNull());
    expect(navigate).toHaveBeenCalledWith({ page: 'communityPost', postId: 71 });
    expect(get.mock.calls.map(call => call[0])).toEqual(['/community/posts', '/community/posts/71']);
    expect(get.mock.calls[0][1]?.params).toEqual({ page: 1, limit: 1 });
    expect(view.queryClient.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); restore(); }
});

test.each(['empty', 'invalid', 'mismatch', 'forbidden'] as const)('community %s cannot navigate to an invented or unreadable post', async mode => {
  const navigate = jest.fn(() => true);
  const post = jest.fn().mockResolvedValueOnce(response({ page: 'communityPost' }))
    .mockResolvedValue({ data: JSON.stringify({ type: 'message', role: 'assistant',
      content: [{ type: 'text', text: '글을 열 수 없습니다.' }], stop_reason: 'end_turn' }) });
  const get = jest.fn(async (path: string) => {
    if (path === '/community/posts') return { data: { posts: mode === 'empty' ? [] : [{ postId: mode === 'invalid' ? 0 : 71 }] } };
    if (mode === 'forbidden') throw new ApiError('Forbidden', { status: 403 });
    return { data: { postId: 72 } };
  });
  const restore = configureApiTransport({ post, get } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '커뮤니티 아무 글이나 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    const code = mode === 'empty' ? 'NOT_FOUND' : mode === 'forbidden' ? 'FORBIDDEN' : 'INVALID_SERVER_RESPONSE';
    await waitFor(() => expect(screen.getByText(voiceAssistantResources.ko.command.errors[code])).toBeVisible());
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByTestId('voice-assistant-screen')).toBeVisible();
    expect(view.queryClient.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); restore(); }
});

test.each(['map', 'favorites'] as const)('selected place -> %s clears context and still closes AI', async page => {
  const navigate = jest.fn(() => true);
  const post = jest.fn(async () => response({ page }));
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} selected />);
  view.queryClient.setQueryData(placeQueryKeys.detail(42), place);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '즐겨찾기 보여줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ page }));
    await waitFor(() => expect(screen.queryByTestId('voice-assistant-screen')).toBeNull());
    expect(mockSpeechSession.cancel).toHaveBeenCalled();
    expect(post).toHaveBeenCalledTimes(1);
    expect(view.queryClient.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); restore(); }
});


test.each([
  { page: 'map' }, { page: 'search' }, { page: 'favorites' }, { page: 'reservations' }, { page: 'myPage' }, { page: 'settings' },
  { page: 'community' }, { page: 'recommendations' }, { page: 'coupons' }, { page: 'verifiedPlaces' },
  { page: 'accountManagement' }, { page: 'notificationSettings' }, { page: 'loginInformation' },
  { page: 'locationSettings' }, { page: 'privacySettings' }, { page: 'dataManagement' },
  { page: 'placeDetail', placeId: 42 }, { page: 'createReservation', placeId: 42 },
] as const)('full local chat pipeline opens %p and dismisses input without business mutations', async target => {
  const navigate = jest.fn(() => true);
  const post = jest.fn(async (_path: string, _body: unknown) => response(target));
  const get = jest.fn(async (_path: string) => ({ data: place }));
  const restore = configureApiTransport({ post, get } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} selected={target.page === 'placeDetail' || target.page === 'createReservation'} />);
  view.queryClient.setQueryData(placeQueryKeys.detail(42), place);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '요청한 화면 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(screen.queryByTestId('voice-assistant-screen')).toBeNull());
    expect(navigate).toHaveBeenCalledTimes(1); expect(navigate).toHaveBeenCalledWith(target);
    expect(post).toHaveBeenCalledTimes(1); expect(post.mock.calls[0][0]).toBe('/ai/chat');
    expect(get.mock.calls.map(call => call[0])).toEqual(target.page === 'placeDetail' || target.page === 'createReservation' ? ['/places/42'] : []);
    expect(view.queryClient.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); restore(); }
});

test('AI re-entry starts a new chat even when provider reuses the previous tool ID', async () => {
  const navigate = jest.fn(() => true);
  const bodies: any[] = [];
  const post = jest.fn(async (_path: string, body: any) => { bodies.push(body); return response({ page: 'settings' }); });
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '설정 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(screen.queryByTestId('voice-assistant-screen')).toBeNull());
    await fireEvent.press(screen.getByLabelText('AI 다시 열기'));
    expect(screen.getByLabelText('요청 내용')).toHaveDisplayValue('');
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '다시 설정 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(2));
    expect(bodies.map(body => body.messages)).toEqual([
      [{ role: 'user', content: '설정 열어줘' }], [{ role: 'user', content: '다시 설정 열어줘' }],
    ]);
    expect(view.queryClient.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); restore(); }
});

test('router refusal keeps AI open with an actionable rejection and no completion prose', async () => {
  const navigate = jest.fn(() => false);
  const post = jest.fn().mockResolvedValueOnce(response({ page: 'settings' }))
    .mockResolvedValue({ data: JSON.stringify({ type: 'message', role: 'assistant',
      content: [{ type: 'text', text: '이동을 완료했습니다.' }], stop_reason: 'end_turn' }) });
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '설정 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(voiceAssistantResources.ko.command.errors.FORBIDDEN));
    expect(screen.getByTestId('voice-assistant-screen')).toBeVisible();
    expect(screen.queryByText(voiceAssistantResources.ko.command.navigationRequested)).toBeNull();
    expect(screen.queryByText('이동을 완료했습니다.')).toBeNull();
    expect(view.queryClient.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); restore(); }
});

test('502 keeps AI open with a service error and never dispatches navigation', async () => {
  const navigate = jest.fn(() => true);
  const post = jest.fn(async () => { throw new ApiError('Bad gateway', { status: 502 }); });
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '즐겨찾기 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(voiceSessionErrors.ko.PROVIDER_ERROR));
    expect(navigate).not.toHaveBeenCalled(); expect(post).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(voiceAssistantResources.ko.command.navigationRequested)).toBeNull();
    expect(screen.getByTestId('voice-assistant-screen')).toBeVisible();
  } finally { await view.unmount(); restore(); }
});

test('unauthenticated requests show sign-in guidance without calling chat or navigation', async () => {
  const navigate = jest.fn(() => true); const post = jest.fn();
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} account={null} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '내 예약 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(voiceSessionErrors.ko.AUTHENTICATION_REQUIRED));
    expect(navigate).not.toHaveBeenCalled(); expect(post).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: '어시스턴트 닫기' }));
    expect(screen.queryByTestId('voice-assistant-screen')).toBeNull();
  } finally { await view.unmount(); restore(); }
});


test('repeated submit while a navigation response is pending executes only once', async () => {
  let complete!: (value: ReturnType<typeof response>) => void;
  const post = jest.fn(() => new Promise<ReturnType<typeof response>>(resolve => { complete = resolve; }));
  const navigate = jest.fn(() => true);
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '내 예약 목록 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await act(async () => complete(response({ page: 'reservations' })));
    await waitFor(() => expect(screen.queryByTestId('voice-assistant-screen')).toBeNull());
    expect(post).toHaveBeenCalledTimes(1); expect(navigate).toHaveBeenCalledTimes(1);
    expect(view.queryClient.getMutationCache().getAll()).toHaveLength(0);
  } finally { await view.unmount(); restore(); }
});

test('closing a pending request and reopening prevents its late reply from navigating the new chat', async () => {
  let complete!: (value: ReturnType<typeof response>) => void;
  let pendingSignal: AbortSignal | undefined;
  const post = jest.fn((_path: string, _body: unknown, options: { signal?: AbortSignal }) => {
    pendingSignal = options.signal;
    return new Promise<ReturnType<typeof response>>(resolve => { complete = resolve; });
  });
  const navigate = jest.fn(() => true);
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '설정 열어줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    await fireEvent.press(screen.getByRole('button', { name: '어시스턴트 닫기' }));
    expect(pendingSignal?.aborted).toBe(true);
    await fireEvent.press(screen.getByLabelText('AI 다시 열기'));
    await act(async () => complete(response({ page: 'settings' })));
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByTestId('voice-assistant-screen')).toBeVisible();
    expect(screen.getByLabelText('요청 내용')).toHaveDisplayValue('');
    expect(screen.queryByText(voiceAssistantResources.ko.command.navigationRequested)).toBeNull();
  } finally { await view.unmount(); restore(); }
});

test.each(supportedLanguages)('%s unauthenticated navigation has localized guidance without an HTTP request', async language => {
  const navigate = jest.fn(() => true); const post = jest.fn();
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} account={null} />, { language });
  const strings = voiceAssistantResources[language];
  try {
    await fireEvent.changeText(screen.getByLabelText(strings.input), 'Open my reservations');
    await fireEvent(screen.getByLabelText(strings.input), 'submitEditing');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(voiceSessionErrors[language].AUTHENTICATION_REQUIRED));
    expect(post).not.toHaveBeenCalled(); expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByText('Translation unavailable')).toBeNull();
  } finally { await view.unmount(); restore(); }
});


test('ambiguous booking target with no search results tells the user to provide a place name', async () => {
  const navigate = jest.fn(() => true);
  const post = jest.fn().mockResolvedValueOnce(response({ page: 'createReservation' }))
    .mockResolvedValue({ data: JSON.stringify({ type: 'message', role: 'assistant',
      content: [{ type: 'text', text: '선택해 주세요.' }], stop_reason: 'end_turn' }) });
  const restore = configureApiTransport({ post, get: jest.fn() } as unknown as ApiTransport);
  const view = await renderWithProviders(<Harness navigate={navigate} />);
  try {
    await fireEvent.changeText(screen.getByLabelText('요청 내용'), '두 번째 거 예약페이지로 보내줘');
    await fireEvent(screen.getByLabelText('요청 내용'), 'submitEditing');
    await waitFor(() => expect(screen.getByText(/장소 이름/)).toBeVisible());
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText('요청 내용')).toBeEnabled();
  } finally { await view.unmount(); restore(); }
});
