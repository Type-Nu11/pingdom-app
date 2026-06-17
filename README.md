<img width="7680" height="4320" alt="image" src="https://github.com/user-attachments/assets/a789ec07-981f-4d2b-a11b-f75d8d6694b6" />


# Pingdum Frontend Convention

## 프로젝트 구조

핑덤 프론트엔드는 **Feature 기반 아키텍처**를 사용합니다.
기능 단위로 코드를 분리하여 확장성과 유지보수를 고려합니다.

```bash
src/
├── app/        # 전역 설정 (navigation, store)
├── features/   # 핵심 기능 (auth, place, record, map)
├── shared/     # 공통 컴포넌트, 훅, 유틸
├── services/   # 외부 로직 (api, storage, location)
├── types/      # 전역 타입
```

## 아키텍처 원칙

### 1. 데이터 흐름

모든 데이터는 아래 흐름을 따릅니다.

```
Screen → Hook → API → Server
```

* Screen에서 API 직접 호출 금지
* Component에 비즈니스 로직 작성 금지
* 데이터 처리 및 로직은 Hook에서만 수행

### 2. 상태 관리

* 상태 관리는 Zustand를 사용합니다.
* 전역 상태는 최소한으로 유지합니다.

#### 허용

* 로그인 상태
* 선택된 장소
* UI 상태 (모달, 필터 등)

#### 금지

* 서버 데이터 저장 (장소 리스트, 기록 등)

### 3. API 규칙

* axios는 `api` 계층에서만 사용합니다.
* 모든 API 요청은 함수 형태로 정의합니다.

예:

```ts
getPlaces()
createRecord()
login()
```


### 4. 네이밍 규칙

| 대상        | 규칙        |
| --------- | --------- |
| Hook      | useXXX    |
| API       | xxxApi    |
| Screen    | XXXScreen |
| Component | XXXCard   |


## 브랜치 전략

* `main`: 배포용 (직접 push 금지)
* `develop`: 통합 개발 브랜치
* `feature/<기능명>`: 기능 개발 브랜치

예:

* feature/auth-login
* feature/place-list
* feature/record-upload


## 커밋 컨벤션

커밋 메시지는 다음 형식을 따릅니다.

```
타입: 내용
```

### 타입 목록

* Feat: 새로운 기능 추가
* Fix: 버그 수정
* Docs: 문서 수정
* Style: 코드 포맷 변경
* Refactor: 코드 리팩토링
* Design: 디자인 변경
* Test: 테스트 코드
* Chore: 설정 변경
* Design: UI 변경
* Rename: 파일/폴더 이름 변경
* Remove: 파일 삭제

### 예시

```
Feat: 장소 리스트 조회 API 연결
Fix: 로그인 토큰 저장 오류 수정
Refactor: record hook 구조 개선
```


## 협업 규칙

* main 브랜치에 직접 push 하지 않습니다.
* feature 브랜치에서 작업 후 PR을 통해 병합합니다.
* 공통 파일 수정 시 반드시 팀원과 사전 공유합니다.
* PR은 최소 1명 이상의 리뷰 후 merge합니다.


## 금지 사항

* Component에서 API 호출
* Zustand에 서버 데이터 저장
* shared 폴더에 기능 로직 추가
* axios 직접 호출
]
