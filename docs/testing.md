# PR 테스트 기준

로컬과 CI는 모두 아래 명령을 사용한다.

```bash
npm ci
npm run validate:pr
```

`validate:pr`은 TypeScript typecheck와 테스트 CI 모드를 순서대로 실행한다. 개발 중에는
`npm test`, 변경 감시는 `npm run test:watch`, CI의 전체 테스트만 재현할 때는
`npm run test:ci`를 사용한다. `test:ci`는 Jest 테스트 후 기존 Node 기반 회귀 테스트도
모두 실행한다.

## 테스트 구성

- `jest-expo`: Expo와 React Native의 기본 Jest 환경
- React Native Testing Library: 사용자에게 보이는 텍스트, 접근성 역할, 상호작용 검증
- `test/jest.setup.ts`: AsyncStorage와 native module mock
- `test/mocks/svgMock.tsx`: SVG component mock
- `src/v2/shared/testing/testProviders.tsx`: V2 경계 안의 격리된 React Query client, i18n, theme wrapper
- `test/fixtures`: API 성공 응답 fixture

React Query wrapper는 테스트에서 retry를 끄므로 실패 상태를 즉시 재현한다. 각 테스트는
새 QueryClient와 i18n 인스턴스를 사용해야 하며, 실제 운영 캐시나 언어 설정을 공유하지
않는다.

## 신규 기능 PR 최소 기준

다음 기준 중 변경에 해당하는 항목은 반드시 포함한다.

1. Hook/API 로직은 성공과 실패 경로를 각각 1개 이상 검증한다.
2. 원격 데이터를 표시하는 Screen은 로딩, 성공, 빈 상태, 실패 중 실제로 가능한 모든
   상태를 검증한다.
3. mutation은 요청 payload, 성공 후 cache invalidation 또는 화면 변화, 실패 UX를
   검증한다.
4. 사용자 동작은 구현 함수 직접 호출 대신 접근성 role/label과 `userEvent`로 실행한다.
5. 회귀 수정은 수정 전 실패하는 테스트를 먼저 추가하고, 관련 기존 테스트를 유지한다.
6. 시간, 저장소, native API, 네트워크 응답은 mock 또는 fixture로 고정하며 실제 외부
   서비스에 연결하지 않는다.

스냅샷만으로 위 기준을 대체하지 않는다. 핵심 assertion은 사용자가 관찰하는 결과와 API
계약을 명시적으로 확인한다.
