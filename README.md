<img width="7680" height="4320" alt="Pingdom" src="https://github.com/user-attachments/assets/a789ec07-981f-4d2b-a11b-f75d8d6694b6" />

## Overview

이 저장소는 **Pingdom 모바일 애플리케이션**을 관리합니다.

Pingdom은 외국인 관광객이 한국의 장소와 로컬 경험을 탐색하고, 현재 방문하기 적합한 장소를 발견할 수 있도록 돕는 위치 기반 서비스입니다.

본 저장소는 Pingdom의 Android 및 iOS 클라이언트를 담당하며, 사용자 인터페이스, 지도 기반 장소 탐색, 인증, 장소 상세 정보, 저장 및 기록 등의 사용자 기능과 백엔드 API 연동을 관리합니다.

## Project Status

현재 **GA(General Availability)** 단계입니다.

안정화된 서비스를 제공하며, 기능, 구성, 인터페이스 및 API 연동 방식의 변경은 Release와 변경 이력을 통해 관리합니다.

| Item        | Status         |
| ----------- | -------------- |
| Development | `Generally Available` |
| Release     | `GA` |
| Stability   | `Stable` |

## Repository Role

| Item           | Description                                |
| -------------- | ------------------------------------------ |
| Type           | `Mobile Application`                       |
| Responsibility | Pingdom Android / iOS 클라이언트 개발 및 사용자 경험 제공 |
| Primary Output | React Native 기반 모바일 애플리케이션                 |
| Target         | 한국의 장소와 로컬 경험을 탐색하는 외국인 관광객                |

## Scope

### Included

* Android 및 iOS 모바일 애플리케이션
* 지도 기반 장소 탐색 및 현재 위치 기능
* 사용자 인증 및 로그인 상태 관리
* 장소 상세 정보 및 사용자 기록
* 장소 저장 및 즐겨찾기
* 다국어 사용자 인터페이스
* 푸시 알림
* Pingdom Backend API 연동

### Not Included

* Pingdom Backend API 및 서버 비즈니스 로직
* 데이터베이스 및 서버 인프라 운영
* 관리자용 운영 시스템
* 외부 서비스의 서버 측 처리

## Key Capabilities

* **Map Discovery**: 지도와 현재 위치를 기반으로 주변 장소를 탐색합니다.
* **Place Information**: 장소의 상세 정보와 방문에 필요한 정보를 제공합니다.
* **Authentication**: 사용자 인증과 로그인 상태를 관리합니다.
* **Records**: 사용자가 방문한 장소와 경험을 기록할 수 있습니다.
* **Favorites**: 관심 있는 장소를 저장하고 다시 확인할 수 있습니다.
* **Localization**: 외국인 사용자를 위한 다국어 인터페이스를 제공합니다.
* **Notifications**: 사용자에게 필요한 정보와 업데이트를 푸시 알림으로 전달합니다.

## Technology and Tools

| Category      | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | React Native                        |
| Language      | TypeScript                          |
| Server State  | TanStack Query                      |
| Client State  | Zustand                             |
| Networking    | Axios                               |
| Styling       | styled-components                   |
| Localization  | i18n                                |
| Maps          | Kakao Map                           |
| Notifications | Firebase Cloud Messaging            |
| Testing       | Jest / React Native Testing Library |

## Getting Started

### Requirements

- Node.js 및 npm
- Android 개발 시 Android SDK와 연결된 기기 또는 에뮬레이터
- iOS 개발 시 macOS, Xcode 및 CocoaPods

### Setup

```bash
git clone https://github.com/Type-Nu11/pingdom-app.git
cd pingdom-app
npm ci
cp .env.example .env
```

### Usage

```bash
npm start
```

네이티브 앱 빌드와 실행은 `npm run android` 또는 `npm run ios`를 사용합니다.
Android 빌드 전에는 [개발용 서명 안내](docs/android-debug-signing.md)에 따라 공용 개발 키를 준비합니다.

## Configuration

환경변수는 [.env.example](.env.example)을 기준으로 `.env`에 구성합니다.
`EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_API_MODE`로 실행 환경과 API 연결 방식을 지정합니다.
네이티브 지도 설정은 `NAVER_MAP_CLIENT_ID`와 플랫폼별 구성을 확인합니다.

실제 인증정보와 비밀 값은 저장소에 커밋하지 않습니다. `EXPO_PUBLIC_*` 값은 앱에 포함되므로
서버 전용 비밀 키를 넣지 않습니다. Android 서명 키의 경로와 검증 절차는
[개발용 서명 안내](docs/android-debug-signing.md)를 참고하세요.

## Verification

| Verification | Purpose |
|---|---|
| `npm run typecheck` | TypeScript 정적 타입 검사 |
| `npm run check:v2` | V2 책임 경계와 디자인 규칙 검사 |
| `npm test -- --runInBand` | Jest 테스트 실행 |
| `npm run check:api-contract` | 저장소에 기록된 API 계약 검사 |

변경 범위에 맞는 검사를 선택합니다. 실제 Android·iOS 기기에서의 동작 검증은 자동 검사와 구분해 기록합니다.

## Repository Structure

```text
.
├── src
│   ├── application      # 운영 앱 조립과 런타임 연결
│   ├── v2
│   │   ├── app          # V2 Provider와 앱 조립
│   │   ├── modules      # 도메인별 기능
│   │   └── shared       # 공통 계약과 기술 지원
│   ├── features         # V1 레거시 기능
│   └── shared           # 기존 공통 코드와 호환 경계
├── android              # Android 네이티브 프로젝트
├── ios                  # iOS 네이티브 프로젝트
├── docs                 # API 계약, 설계 및 검증 문서
├── scripts              # 계약·경계 검증 도구
├── App.tsx              # 운영 앱 진입점
├── package.json
└── README.md
```

### Architecture

신규 기능의 기본 위치는 `src/v2/`이며 운영 앱 조립은 `src/application/`에서 관리합니다.
기본 데이터 흐름은 `Screen → Hook → API → Server`입니다.
서버 데이터와 클라이언트 상태의 책임을 분리합니다. 기존 V1 연결과 전환 범위는
[V2 구성](src/v2/README.md) 및 [운영 진입점 전환 기록](docs/v2-production-entrypoint-migration.md)을 참고하세요.

## Related Repositories

| Repository | Relationship |
|---|---|
| [pingdom-api](https://github.com/Type-Nu11/pingdom-api) | 인증 및 서비스 API 제공 |
| [pingdom-admin](https://github.com/Type-Nu11/pingdom-admin) | 서비스 운영을 위한 관리자 웹 |
| [pingdom-infra](https://github.com/Type-Nu11/pingdom-infra) | 앱 요청 검증과 프록시 라우팅 |

## Documentation

| Document | Description |
|---|---|
| [V2 Structure](src/v2/README.md) | V2 도메인 책임과 공개 경계 |
| [API](docs/api/README.md) | 앱 연동 API 계약 |
| [Testing](docs/testing.md) | 테스트 실행과 검증 기준 |
| [Android Signing](docs/android-debug-signing.md) | 공용 개발용 서명 설정 |

## Release and Compatibility

변경사항은 저장소의 Release 또는 Git 변경 이력을 기준으로 확인합니다.
호환성에 영향을 주는 변경사항은 관련 문서와 변경 이력을 통해 안내합니다.

### Branch Strategy

```text
main
└── dev
    └── feat/<feature>
```

* `main`: 배포 및 안정 버전
* `dev`: 개발 통합 브랜치
* `feat/<feature>`: 기능 단위 개발 브랜치

모든 기능 개발은 별도의 브랜치에서 진행하고 Pull Request와 코드 리뷰를 통해 통합합니다.

### Development Rules

* Screen에서 API를 직접 호출하지 않습니다.
* Component에 비즈니스 로직을 작성하지 않습니다.
* 서버 데이터는 Zustand에 저장하지 않습니다.
* Axios는 API 계층에서만 사용합니다.
* 기능별 코드는 가능한 한 해당 Feature 내부에서 관리합니다.
* 공통 로직만 `shared` 영역에 배치합니다.

## License

이 저장소에는 별도의 프로젝트 `LICENSE` 파일이 없습니다. 사용 및 배포 조건은 관리 팀에 확인하세요.
포함된 외부 자산과 라이브러리는 각 라이선스를 따릅니다.

---

<div align="center">

Part of **Pingdom**

</div>
