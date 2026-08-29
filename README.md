<img width="7680" height="4320" alt="Pingdom" src="https://github.com/user-attachments/assets/a789ec07-981f-4d2b-a11b-f75d8d6694b6" />

---

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

## Architecture

Pingdom 모바일 애플리케이션은 **Feature 기반 구조**를 사용합니다.

```text
src/
├── app/          # 전역 설정 및 Navigation
├── features/     # 기능 단위 도메인
├── shared/       # 공통 Component, Hook, Utility
├── services/     # API, Storage, Location 등 외부 서비스
└── types/        # 전역 TypeScript 타입
```

기본적인 데이터 흐름은 다음 원칙을 따릅니다.

```text
Screen → Hook → API → Server
```

서버 데이터와 클라이언트 상태의 책임을 분리하고, 화면 컴포넌트가 직접 API를 호출하거나 비즈니스 로직을 소유하지 않도록 구성합니다.

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

## Branch Strategy

```text
main
└── dev
    └── feat/<feature>
```

* `main`: 배포 및 안정 버전
* `dev`: 개발 통합 브랜치
* `feat/<feature>`: 기능 단위 개발 브랜치

모든 기능 개발은 별도의 브랜치에서 진행하고 Pull Request와 코드 리뷰를 통해 통합합니다.

## Development Rules

* Screen에서 API를 직접 호출하지 않습니다.
* Component에 비즈니스 로직을 작성하지 않습니다.
* 서버 데이터는 Zustand에 저장하지 않습니다.
* Axios는 API 계층에서만 사용합니다.
* 기능별 코드는 가능한 한 해당 Feature 내부에서 관리합니다.
* 공통 로직만 `shared` 영역에 배치합니다.

---

Pingdom is developed and maintained by **Team Type:Null**.
