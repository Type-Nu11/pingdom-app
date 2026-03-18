# Navi App

고령자의 일상생활 문제를 해결하기 위한 도움 매칭 플랫폼 앱입니다.

## 프로젝트 개요
- 사용자 유형: 고령자(Senior), 도움 제공자(Worker), 보호자(Guardian)
- 목적: 요청 생성, 매칭, 진행 확인까지 앱에서 간편하게 처리
- 기술 스택: React Native, Expo, TypeScript

## 시작하기

### 1) 설치
```bash
cd Navi_app
npm install
```

### 2) 실행
```bash
npm run start
```

플랫폼별 실행:
```bash
npm run android
npm run ios
npm run web
```

## 폴더 구조
```text
root
├─ App.tsx
├─ package.json
├─ .env
├─ src
│  ├─ api
│  ├─ assets
│  │  ├─ images
│  │  └─ icons
│  ├─ components
│  │  ├─ common
│  │  ├─ request
│  │  └─ user
│  ├─ constants
│  ├─ hooks
│  ├─ navigation
│  ├─ screens
│  │  ├─ auth
│  │  ├─ senior
│  │  ├─ worker
│  │  ├─ guardian
│  │  └─ common
│  ├─ store
│  ├─ styles
│  ├─ types
│  └─ utils
└─ ...
```

### 디렉터리 설명
- `api`: 서버 통신 관련 함수(인증/요청/사용자)
- `assets`: 이미지, 아이콘 등 정적 리소스
- `components`: 재사용 UI 컴포넌트
- `constants`: 색상, 폰트, 간격, 사용자 타입 등 상수
- `hooks`: 커스텀 훅
- `navigation`: 사용자 유형별 네비게이션
- `screens`: 화면 단위 컴포넌트
- `store`: 전역 상태 관리
- `styles`: 테마 및 전역 스타일
- `types`: TypeScript 타입 정의
- `utils`: 포맷팅, 검증, 저장소, 로깅 등 유틸리티

## 브랜치 전략
- `main`: 배포/안정 브랜치
- `develop`: 통합 개발 브랜치
- `feature/<기능명>`: 기능 개발 브랜치

예시:
- `feature/login`
- `feature/request-create`
- `feature/worker-home`
- `feature/payment`

## 커밋 컨벤션
- `Feat`: 새로운 기능 추가
- `Fix`: 버그 수정
- `Docs`: 문서 작업
- `Style`: 코드 포맷 변경(로직 변경 없음)
- `Refactor`: 코드 리팩토링
- `Test`: 테스트 코드 추가/수정
- `Chore`: 빌드/설정/패키지 등 기타 작업
- `Create`: 파일/폴더 생성
- `Comment`: 주석 추가/변경
- `Design`: UI 디자인 변경
- `Rename`: 파일/폴더 이름 변경
- `Remove`: 파일 삭제

## 협업 규칙
- `main` 브랜치에 직접 push 하지 않습니다.
- 각자 `feature` 브랜치에서 작업 후 병합합니다.
- 작업 전 담당 기능을 공유합니다.
- 공통 파일 수정 시 팀원과 먼저 상의합니다.
