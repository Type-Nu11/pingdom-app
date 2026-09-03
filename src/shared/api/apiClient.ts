// src/shared/api/apiClient.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { clearExpiredSession } from '../../app/store/authStore';
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

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

if (!rawApiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not defined');
}
const API_BASE_URL = /^https?:\/\//i.test(rawApiBaseUrl)
    ? rawApiBaseUrl
    : `https://${rawApiBaseUrl}`;
const REQUEST_TIMEOUT = 10000;

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

// Axios 기본 요청 설정에 '_retry' 플래그를 추가한 타입
// _retry: 이 요청이 토큰 갱신 후 재시도된 요청인지 여부를 표시
//         true이면 401이 다시 와도 재시도하지 않아 무한루프를 방지
type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

// 토큰 갱신 API(/auth/token/refresh)의 응답 타입
type RefreshResponse = {
    accessToken: string;
};

type RawRefreshResponse =
    | RefreshResponse
    | {
        data?: RefreshResponse;
        accessToken?: string;
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
        return origin === new URL(API_BASE_URL).origin;
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

function toRefreshResponse(response: RawRefreshResponse): RefreshResponse {
    if ('data' in response && response.data?.accessToken) {
        return {
            accessToken: response.data.accessToken,
        };
    }

    if ('accessToken' in response && response.accessToken) {
        return {
            accessToken: response.accessToken,
        };
    }

    throw new Error('토큰 갱신 응답에 accessToken이 없습니다.');
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
    const { data } = await refreshClient.post<RawRefreshResponse>(
        '/auth/token/refresh',
        undefined,
        { baseURL: API_BASE_URL }
    );

    const nextTokens = toRefreshResponse(data);

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
        await clearExpiredSession();
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
            config.baseURL = API_BASE_URL;
        }

        if (isPublicAuthUrl(config.url)) {
            config.headers.delete('Authorization');
            return config;
        }

        const token = await resolveAccessToken();

        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
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
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig | undefined;
        const status = error.response?.status;
        const isRefreshRequest = originalRequest?.url?.includes('/auth/token/refresh');
        const shouldSkipRetry =
            !originalRequest ||
            status !== 401 ||
            originalRequest._retry ||
            isRefreshRequest;

        if (shouldSkipRetry) {
            if (status === 401
                && originalRequest
                && !isPublicAuthUrl(originalRequest.url)) {
                await clearExpiredSession();
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
