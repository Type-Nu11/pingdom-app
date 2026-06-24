import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.pingdom.auth';

// accessToken : 실제 API 요청 시 매번 첨부하는 인증표냥 (유효기간 짧음)
// refreshToken: accessToken이 만료됐을 때 새로 발급받기 위한 갱신표냥 (유효기간 김)
export type AuthTokens = { 
    accessToken: string;
    refreshToken: string;
};

export function normalizeAuthToken(token: string): string {
    return token.replace(/^Bearer\s+/i, '').trim();
}

export function normalizeAuthTokens(tokens: AuthTokens): AuthTokens {
    return {
        accessToken: normalizeAuthToken(tokens.accessToken),
        refreshToken: normalizeAuthToken(tokens.refreshToken),
    };
}

/**
 * 로그인 성공 후 서버에서 받은 토큰을 기기 저장소에 저장합니다
 * 
 * @param tokens - 저장할 accessToken과 refreshToken 쌍
 * 
 * 저장 방식:
 *   - 토큰 객체를 JSON 문자열로 직렬화해 저장합니다
 */
export async function saveTokens(tokens: AuthTokens): Promise<void> {
    const normalizedTokens = normalizeAuthTokens(tokens);

    await Keychain.setGenericPassword(
        'tokens',
        JSON.stringify(normalizedTokens),
        { service:SERVICE_NAME }
    )
}

/**
 * 저장된 토큰을 꺼내옵니다
 * 
 * @returns 저장된 토큰이 있으면 AuthTokens 반환, 없거나 오류면 null 반환
 * 
 * 흐름:
 *   1. 키체인에서 값을 읽어옴
 *   2. 값이 없으면(비로그인 상태) null 반환
 *   3. 있으면 JSON 문자열 → 객체로 변환해서 반환
 *   4. 변환 중 오류(데이터 손상 등)가 나도 null 반환 (앱이 터지지 않도록)
 */
export async function getTokens(): Promise<AuthTokens | null> {
    try {
        return normalizeAuthTokens(JSON.parse(credentials.password) as AuthTokens);
    } catch {
        return null;
    }
}

export async function clearTokens(): Promise<void> {
    try {
        await Keychain.resetGenericPassword({ service: SERVICE_NAME });
    } catch {
        // 네이티브 모듈 미사용 환경에서는 무시
    }
}
