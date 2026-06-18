import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'com.pingdom.auth';

// accessToken : 실제 API 요청 시 매번 첨부하는 인증표냥 (유효기간 짧음)
// refreshToken: accessToken이 만료됐을 때 새로 발급받기 위한 갱신표냥 (유효기간 김)
export type AuthTokens = { 
    accessToken: string;
    refreshToken: string;
};

/**
 * 로그인 성공 후 서버에서 받은 토큰을 기기 저장소에 저장합니다
 * 
 * @param tokens - 저장할 accessToken과 refreshToken 쌍
 * 
 * 저장 방식:
 *   - 토큰 객체를 JSON 문자열로 직렬화해 저장합니다
 */
export async function saveTokens(tokens: AuthTokens): Promise<void> {
    try {
        await Keychain.setGenericPassword(
            'tokens',
            JSON.stringify(tokens),
            { service: SERVICE_NAME }
        );
    } catch {
        // 네이티브 모듈 미사용 환경(Expo Go 등)에서는 저장 생략
    }
}

export async function getTokens(): Promise<AuthTokens | null> {
    try {
        const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });
        if (!credentials) return null;
        return JSON.parse(credentials.password) as AuthTokens;
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
