// src/shared/api/apiClient.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Alert } from 'react-native';
import { logout } from '../../app/store/authStore';
import { getTokens } from './authStorage';
import {
    getCachedAccessToken,
    getRefreshPromise,
    hydrateAccessToken,
    persistTokens,
    removeTokens,
    setRefreshPromise,
} from './authTokens';

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!rawApiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not defined');
}
const API_BASE_URL = /^https?:\/\//i.test(rawApiBaseUrl)
    ? rawApiBaseUrl
    : `https://${rawApiBaseUrl}`;
const rawFallbackApiBaseUrl = process.env.EXPO_PUBLIC_API_FALLBACK_URL?.trim();
const FALLBACK_API_BASE_URL = rawFallbackApiBaseUrl
    ? (/^https?:\/\//i.test(rawFallbackApiBaseUrl)
        ? rawFallbackApiBaseUrl
        : `https://${rawFallbackApiBaseUrl}`)
    : null;
const REQUEST_TIMEOUT = 10000;
let activeApiBaseUrl = API_BASE_URL;
let hasShownFallbackAlert = false;

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

// Axios 기본 요청 설정에 '_retry' 플래그를 추가한 타입
// _retry: 이 요청이 토큰 갱신 후 재시도된 요청인지 여부를 표시
//         true이면 401이 다시 와도 재시도하지 않아 무한루프를 방지
type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _fallbackRetry?: boolean;
    _retry?: boolean;
};

// 토큰 갱신 API(/auth/token/refresh)의 응답 타입
type RefreshResponse = {
    accessToken: string;
    refreshToken: string;
};

type RawRefreshResponse =
    | RefreshResponse
    | {
        data?: RefreshResponse;
        accessToken?: string;
        refreshToken?: string;
    };

// ─────────────────────────────────────────────
// Axios 인스턴스
// ─────────────────────────────────────────────

// api와 refreshClient가 공유하는 기본 설정
const BASE_CONFIG = {
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: REQUEST_TIMEOUT,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
    },
} as const;

// 앱 전역에서 사용하는 메인 API 클라이언트
// 모든 API 요청은 이 인스턴스를 통해 보낸다
export const api: AxiosInstance = axios.create({
    ...BASE_CONFIG,
    // 200~299 범위만 성공으로 처리, 벗어나면 catch로 떨어진다
    validateStatus: (status) => status >= 200 && status < 300,
});

// 갱신 전용 인스턴스 - 모듈 레벨로 고정
// 메인 인스턴스(api)로 보내면 응답 인터셉터가 또 걸려 무한루프가 발생하기 때문
const refreshClient: AxiosInstance = axios.create(BASE_CONFIG);

// ─────────────────────────────────────────────
// URL 보안 유틸
// ─────────────────────────────────────────────

// 요청 URL이 허용된 도메인인지 검증
// 상대 URL은 항상 허용, 절대 URL은 API_BASE_URL과 같은 origin일 때만 허용
// 악의적인 응답이 외부 서버로 요청을 유도하는 공격을 방어하기 위함
function isAllowedUrl(url?: string): boolean {
    if (!url) return true;

    const isAbsolute = /^https?:\/\//i.test(url);
    if (!isAbsolute) return true;

    try {
        const origin = new URL(url).origin;
        return origin === new URL(API_BASE_URL).origin ||
            (FALLBACK_API_BASE_URL !== null &&
                origin === new URL(FALLBACK_API_BASE_URL).origin);
    } catch {
        return false;
    }
}

function getRequestPath(url?: string): string {
    if (!url) return '';

    try {
        if (/^https?:\/\//i.test(url)) {
            return new URL(url).pathname;
        }
    } catch {
        return url;
    }

    return url.split('?')[0] ?? url;
}

function shouldLogAuthRequest(url?: string): boolean {
    const path = getRequestPath(url);

    return [
        '/auth/token/refresh',
    ].includes(path);
}

function shouldLogApiRequest(url?: string): boolean {
    const path = getRequestPath(url);

    return shouldLogAuthRequest(url) || path.startsWith('/users/me/bookmarks/') || [
        '/places',
        '/places/recommendations',
        '/places/autocomplete',
        '/users/me/bookmarks',
        '/users/me/travel-purposes',
    ].includes(path);
}

function summarizeResponseData(data: unknown) {
    if (!data || typeof data !== 'object') {
        return undefined;
    }

    const responseData = data as {
        hasNext?: unknown;
        limit?: unknown;
        page?: unknown;
        places?: unknown;
        totalCount?: unknown;
        totalPages?: unknown;
    };

    return {
        hasNext: responseData.hasNext,
        limit: responseData.limit,
        page: responseData.page,
        placesCount: Array.isArray(responseData.places) ? responseData.places.length : undefined,
        totalCount: responseData.totalCount,
        totalPages: responseData.totalPages,
    };
}

function isPublicAuthUrl(url?: string): boolean {
    const path = getRequestPath(url);

    return [
        '/auth/email/resend',
        '/auth/login',
        '/auth/logout',
        '/auth/password-reset/confirm',
        '/auth/password-reset/request',
        '/auth/signup',
        '/auth/token/refresh',
    ].includes(path);
}

function isSafeToRetryAfterServerFallback(method?: string): boolean {
    return ['get', 'head', 'options'].includes(method?.toLowerCase() ?? '');
}

function toRefreshResponse(response: RawRefreshResponse, fallbackRefreshToken: string): RefreshResponse {
    if ('data' in response && response.data?.accessToken) {
        return {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken ?? fallbackRefreshToken,
        };
    }

    if ('accessToken' in response && response.accessToken) {
        return {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken ?? fallbackRefreshToken,
        };
    }

    throw new Error('토큰 갱신 응답에 accessToken이 없습니다.');
}

function decodeJwtPayload(token: string | null): Record<string, unknown> | null {
    if (!token) return null;

    const payload = token.split('.')[1];

    if (!payload || typeof globalThis.atob !== 'function') {
        return null;
    }

    try {
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
        const json = globalThis.atob(paddedBase64);

        return JSON.parse(json) as Record<string, unknown>;
    } catch {
        return null;
    }
}

function getTokenDebug(token: string | null) {
    const payload = decodeJwtPayload(token);
    const exp = typeof payload?.exp === 'number' ? payload.exp : undefined;
    const iat = typeof payload?.iat === 'number' ? payload.iat : undefined;

    return {
        exp,
        expiresInSeconds: exp ? exp - Math.floor(Date.now() / 1000) : undefined,
        hasPayload: Boolean(payload),
        iat,
        sub: payload?.sub,
        tokenLength: token?.length ?? 0,
    };
}

// ─────────────────────────────────────────────
// 토큰 유틸
// ─────────────────────────────────────────────

// 캐시(메모리) → 키체인(영구 저장소) 순서로 accessToken을 조회
// 캐시 히트 시 키체인 I/O를 건너뛰어 속도를 최적화
async function resolveAccessToken(): Promise<string | null> {
    return getCachedAccessToken() ?? await hydrateAccessToken();
}

// ─────────────────────────────────────────────
// 토큰 갱신
// ─────────────────────────────────────────────

// 실제 갱신 API 호출만 담당
// 잠금(중복 방지) 관리는 refreshAccessToken이 담당
async function fetchNewTokens(): Promise<string> {
    const tokens = await getTokens();

    console.info('[auth-refresh]', 'start', {
        hasRefreshToken: Boolean(tokens?.refreshToken),
        refreshToken: getTokenDebug(tokens?.refreshToken ?? null),
    });

    if (!tokens?.refreshToken) {
        throw new Error('refreshToken 없음');
    }

    const { data } = await refreshClient.post<RawRefreshResponse>(
        '/auth/token/refresh',
        { refreshToken: tokens.refreshToken },
        { baseURL: activeApiBaseUrl }
    );

    const nextTokens = toRefreshResponse(data, tokens.refreshToken);

    console.info('[auth-refresh]', 'success', {
        accessToken: getTokenDebug(nextTokens.accessToken),
        receivedRefreshToken: Boolean(
            ('data' in data && data.data?.refreshToken) ||
            ('refreshToken' in data && data.refreshToken)
        ),
        refreshToken: getTokenDebug(nextTokens.refreshToken),
    });

    await persistTokens(nextTokens);
    return nextTokens.accessToken;
}

// 중복 갱신 방지 + 갱신 호출 조율
// 여러 요청이 동시에 401을 받아도 갱신 요청은 딱 1번만 보낸다
// 이미 갱신 중이면 진행 중인 Promise를 반환해 같이 기다린다
async function refreshAccessToken(): Promise<string | null> {
    const inFlight = getRefreshPromise();
    if (inFlight) return inFlight;

    const promise = fetchNewTokens().catch(async (error) => {
        console.warn('[auth-refresh]', 'failed', {
            message: error instanceof Error ? error.message : String(error),
        });
        await logout();
        return null;
    });

    setRefreshPromise(promise);

    try {
        return await promise;
    } finally {
        // 성공/실패 무관하게 반드시 잠금 해제
        // 빠뜨리면 갱신 완료 후에도 모든 요청이 영원히 묶인다
        setRefreshPromise(null);
    }
}

// ─────────────────────────────────────────────
// 요청 인터셉터
// ─────────────────────────────────────────────

// 모든 요청이 서버로 나가기 전에 실행
// 1. 허용되지 않은 외부 도메인 차단
// 2. Authorization 헤더에 accessToken 주입
api.interceptors.request.use(
    async (config) => {
        if (!isAllowedUrl(config.url)) {
            throw new Error('허용되지 않은 절대 URL 요청입니다.');
        }

        if (!/^https?:\/\//i.test(config.url ?? '')) {
            config.baseURL = activeApiBaseUrl;
        }

        if (isPublicAuthUrl(config.url)) {
            config.headers.delete('Authorization');
            return config;
        }

        const token = await resolveAccessToken();

        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }

        if (shouldLogApiRequest(config.url)) {
            console.info('[api]', 'request', {
                hasAccessToken: Boolean(token),
                method: config.method,
                params: config.params,
                path: getRequestPath(config.url),
                token: getTokenDebug(token),
            });
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// 응답 인터셉터
// ─────────────────────────────────────────────

// 401 응답 시 토큰 갱신 후 원래 요청을 1회 재시도
// 아래 경우엔 재시도 없이 에러를 그대로 전파:
//   - 요청 설정이 없는 경우 (네트워크 단절 등)
//   - 401이 아닌 다른 에러 (403, 500 등)
//   - 이미 재시도한 요청 (_retry === true)
//   - 갱신 요청 자체가 401을 받은 경우 (무한루프 방지)
api.interceptors.response.use(
    (response) => {
        if (shouldLogApiRequest(response.config.url)) {
            console.info('[api]', 'response success', {
                method: response.config.method,
                params: response.config.params,
                path: getRequestPath(response.config.url),
                status: response.status,
                summary: summarizeResponseData(response.data),
            });
        }

        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const status = error.response?.status;
        const isRefreshRequest = originalRequest?.url?.includes('/auth/token/refresh');
        const isNetworkFailure = status === undefined && error.code !== 'ERR_CANCELED';
        const canUseFallback = Boolean(
            originalRequest &&
            FALLBACK_API_BASE_URL &&
            FALLBACK_API_BASE_URL !== API_BASE_URL &&
            !originalRequest._fallbackRetry &&
            originalRequest.baseURL !== FALLBACK_API_BASE_URL &&
            isNetworkFailure
        );

        if (canUseFallback && originalRequest && FALLBACK_API_BASE_URL) {
            activeApiBaseUrl = FALLBACK_API_BASE_URL;
            originalRequest._fallbackRetry = true;
            originalRequest.baseURL = FALLBACK_API_BASE_URL;
            const shouldRetryOnFallback = isSafeToRetryAfterServerFallback(originalRequest.method);

            if (!hasShownFallbackAlert) {
                hasShownFallbackAlert = true;
                Alert.alert(
                    '서버 연결 전환',
                    shouldRetryOnFallback
                        ? '새 서버에 연결할 수 없어 기존 서버로 전환했습니다.'
                        : '새 서버에 연결할 수 없어 기존 서버로 전환했습니다. 중복 처리를 막기 위해 진행 중이던 요청은 자동 재시도하지 않았습니다. 다시 시도해 주세요.',
                );
            }

            console.warn('[api]', 'fallback server activated', {
                fallbackBaseUrl: FALLBACK_API_BASE_URL,
                primaryBaseUrl: API_BASE_URL,
                requestRetried: shouldRetryOnFallback,
            });

            if (shouldRetryOnFallback) {
                return api(originalRequest);
            }

            return Promise.reject(error);
        }

        if (originalRequest && (status === 401 || shouldLogApiRequest(originalRequest.url))) {
            const responseData = error.response?.data as {
                code?: unknown;
                message?: unknown;
            } | undefined;

            const logNetworkDiagnostic = status === undefined
                && getRequestPath(originalRequest.url) === '/users/me/travel-purposes';
            const log = logNetworkDiagnostic ? console.info : console.warn;

            log('[api]', 'response error', {
                code: responseData?.code,
                message: responseData?.message ?? error.message,
                method: originalRequest.method,
                params: originalRequest.params,
                path: getRequestPath(originalRequest.url),
                retry: Boolean(originalRequest._retry),
                status,
                token: getTokenDebug(
                    typeof originalRequest.headers?.get === 'function'
                        ? String(originalRequest.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
                        : null
                ),
            });
        }

        const shouldSkipRetry =
            !originalRequest ||
            status !== 401 ||
            originalRequest._retry ||
            isRefreshRequest;

        if (shouldSkipRetry) {
            if (status === 401 && originalRequest && !isPublicAuthUrl(originalRequest.url)) {
                await logout();
            }

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const newToken = await refreshAccessToken();

        if (!newToken) {
            return Promise.reject(error);
        }

        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return api(originalRequest);
    }
);
