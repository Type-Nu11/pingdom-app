// src/shared/api/authStorage.ts

// react-native-keychain: 모바일 기기의 안전한 저장소(키체인/키스토어)에 접근하는 라이브러리
// 일반 AsyncStorage와 달리 암호화된 공간에 저장되어 토큰 같은 민감한 정보에 적합합니다
import * as Keychain from 'react-native-keychain';

// 키체인에 저장할 때 사용하는 '서랍 이름'입니다
// 같은 앱 내에서도 service를 다르게 하면 별도 공간에 저장할 수 있습니다
const SERVICE_NAME = 'pingdom-auth';

// accessToken : 실제 API 요청 시 매번 첨부하는 인증표냥 (유효기간 짧음)
// refreshToken: accessToken이 만료됐을 때 새로 발급받기 위한 갱신표냥 (유효기간 김)
export type AuthTokens = { 
    accessToken: string;
    refreshToken: string;
};

/**
 * 로그인 성공 후 서버에서 받은 토큰을 기기 키체인에 저장합니다
 * 
 * @param tokens - 저장할 accessToken과 refreshToken 쌍
 * 
 * 저장 방식:
 *   - username 자리에 'auth'라는 고정 문자열을 넣고
 *   - password 자리에 tokens 객체를 JSON 문자열로 변환해서 저장합니다냥
 *   - WHEN_UNLOCKED: 기기 잠금 해제 상태일 때만 꺼낼 수 있습니다냥 (보안 옵션)
 */
export async function saveTokens(tokens: AuthTokens): Promise<void> {
    await Keychain.setGenericPassword(
        'auth',                         // username 자리 (고정값, 식별용)
        JSON.stringify(tokens),         // password 자리에 토큰 객체를 문자열로 변환해 저장
        {
            service: SERVICE_NAME,      // 어느 서랍에 저장할지 지정
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,  // 잠금 해제 시에만 접근 허용
        }
    );
}

/**
 * 키체인에 저장된 토큰을 꺼내옵니다
 * 
 * @returns 저장된 토큰이 있으면 AuthTokens 반환, 없거나 오류면 null 반환
 * 
 * 흐름:
 *   1. 키체인에서 값을 읽어옴
 *   2. 값이 없으면(비로그인 상태) null 반환
 *   3. 있으면 JSON 문자열 → 객체로 변환해서 반환
 *   4. 변환 중 오류(데이터 손상 등)가 나도 null 반환 (앱이 터지지 않도록)
 */
export async function getTokens(): Promise<AuthTokens | null> {// 키체인에서 토큰을 읽어오는 함수
    // 키체인에서 저장된 값을 읽어옴
    // result가 false이면 저장된 값이 없는 것 (미로그인 상태)
    const result = await Keychain.getGenericPassword({ service: SERVICE_NAME });

    if (!result) return null;   // 저장된 토큰 없음 → null 반환

    try {
        // result.password에 저장된 JSON 문자열을 AuthTokens 객체로 변환
        return JSON.parse(result.password) as AuthTokens;
    } catch {
        // JSON 파싱 실패 시 (데이터가 손상됐거나 형식이 다를 경우) null 반환
        return null;
    }
}

/**
 * 키체인에서 토큰을 완전히 삭제합니다
 * 로그아웃 시 반드시 호출해야 합니다
 * 
 * 이걸 빠뜨리면 로그아웃 후에도 토큰이 남아있어 보안 문제가 생깁니다
 */
export async function clearTokens(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
}