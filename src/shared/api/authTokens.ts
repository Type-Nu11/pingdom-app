// src/shared/api/authTokens.ts

// authStorage: 기기 키체인(영구 저장소) 접근 담당
// 이 파일은 그 위에서 '메모리 캐시 + 키체인'을 함께 관리하는 중간 계층입니다
import { clearTokens, getTokens, saveTokens, type AuthTokens } from './authStorage';

// ─────────────────────────────────────────────
// 메모리 캐시 변수
// ─────────────────────────────────────────────

// accessToken을 메모리(RAM)에 임시 보관하는 캐시입니다
// 키체인은 읽을 때마다 비동기 I/O가 발생하므로,
// 자주 쓰는 accessToken은 여기서 바로 꺼내 씁니다 (속도 최적화)
// 앱이 종료되면 사라지고, 키체인 값은 유지됩니다
let accessTokenCache: string | null = null;

// 토큰 갱신(refresh) 작업이 진행 중일 때 그 Promise를 저장합니다
// 여러 API 요청이 동시에 "토큰 만료"를 감지해도
// 갱신 요청을 딱 한 번만 보내기 위한 잠금 장치입니다
// (갱신 중이면 이 Promise를 같이 기다리게 합니다)
let refreshPromise: Promise<string | null> | null = null;

// ─────────────────────────────────────────────
// 캐시 접근자 (동기, 빠름)
// ─────────────────────────────────────────────

/**
 * 메모리 캐시에서 accessToken을 즉시 꺼냅니다
 * 비동기 처리 없이 바로 반환되므로 빠릅니다
 * 
 * ※ 앱 첫 실행 직후엔 캐시가 비어있을 수 있습니다
 *    그 경우 hydrateAccessToken()으로 먼저 채워야 합니다
 * 
 * @returns 캐시된 accessToken, 없으면 null
 */
export function getCachedAccessToken(): string | null {
    return accessTokenCache;
}

/**
 * 메모리 캐시의 accessToken을 직접 덮어씁니다
 * 로그아웃 시 null을 넣어 캐시를 비울 때도 사용합니다
 * 
 * @param token - 저장할 토큰 문자열, 또는 null (캐시 초기화)
 */
export function setCachedAccessToken(token: string | null): void {
    accessTokenCache = token;
}

// ─────────────────────────────────────────────
// 초기화 / 동기화 (비동기, 키체인 접근)
// ─────────────────────────────────────────────

/**
 * 앱 시작 시 키체인에서 accessToken을 읽어 메모리 캐시에 채웁니다
 * 
 * 호출 타이밍: 앱 부팅 초기 1회 (ex. App.tsx 또는 인증 초기화 로직)
 * 이걸 호출하지 않으면 getCachedAccessToken()이 계속 null을 반환합니다냥
 * 
 * @returns 키체인에 저장된 accessToken, 없으면 null
 */
export async function hydrateAccessToken(): Promise<string | null> {
    const tokens = await getTokens();                       // 키체인에서 토큰 읽기
    accessTokenCache = tokens?.accessToken ?? null;         // 캐시에 반영
    return accessTokenCache;
}

// ─────────────────────────────────────────────
// 토큰 저장 / 삭제 (메모리 + 키체인 동시 처리)
// ─────────────────────────────────────────────

/**
 * 로그인 또는 토큰 갱신 후 새 토큰을 저장합니다
 * 메모리 캐시와 키체인(영구 저장소) 양쪽을 동시에 갱신합니다
 * 
 * @param tokens - 새로 발급받은 accessToken + refreshToken 쌍
 */
export async function persistTokens(tokens: AuthTokens): Promise<void> {
    accessTokenCache = tokens.accessToken;  // 메모리 캐시 즉시 갱신 (다음 요청부터 바로 사용)
    await saveTokens(tokens);              // 키체인에 영구 저장 (앱 재시작 후에도 유지)
}

/**
 * 로그아웃 시 토큰을 완전히 제거합니다
 * 메모리 캐시와 키체인 양쪽 모두 삭제합니다
 * 
 * ※ 이 함수만 호출하면 키체인도 같이 지워지므로
 *    clearTokens()를 별도로 호출할 필요가 없습니다
 */
export async function removeTokens(): Promise<void> {
    accessTokenCache = null;    // 메모리 캐시 즉시 초기화
    await clearTokens();        // 키체인에서도 완전 삭제
}

// ─────────────────────────────────────────────
// 갱신 잠금 관리 (중복 갱신 방지)
// ─────────────────────────────────────────────

/**
 * 현재 진행 중인 토큰 갱신 Promise를 반환합니다
 * 
 * 사용 방법:
 *   const ongoing = getRefreshPromise();
 *   if (ongoing) return ongoing;  // 이미 갱신 중이면 그 결과를 같이 기다림
 * 
 * @returns 진행 중인 갱신 Promise, 없으면 null
 */
export function getRefreshPromise(): Promise<string | null> | null {
    return refreshPromise;
}

/**
 * 토큰 갱신 Promise를 등록하거나 초기화합니다
 * 
 * 갱신 시작 시: setRefreshPromise(실제갱신함수())
 * 갱신 완료 시: setRefreshPromise(null)  ← 반드시 초기화해야 합니다
 * 초기화를 빠뜨리면 이후 갱신 요청이 영원히 묶입니다
 * 
 * @param promise - 갱신 작업 Promise, 또는 null (잠금 해제)
 */
export function setRefreshPromise(promise: Promise<string | null> | null): void {
    refreshPromise = promise;
}