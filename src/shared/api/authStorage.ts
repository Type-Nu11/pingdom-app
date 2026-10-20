import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.pingdom.auth';

// Access Token은 앱이 보관하고, Refresh Token은 서버가 HttpOnly Cookie로 관리합니다.
export type AuthTokens = {
    accessToken: string;
};

export function normalizeAuthToken(token: string): string {
    return token.replace(/^Bearer\s+/i, '').trim();
}

export function normalizeAuthTokens(tokens: AuthTokens): AuthTokens {
    return {
        accessToken: normalizeAuthToken(tokens.accessToken),
    };
}

/**
 * 로그인 성공 후 서버에서 받은 토큰을 기기 저장소에 저장합니다
 * 
 * @param tokens - 저장할 accessToken
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
        const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
        if (!credentials) return null;
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
