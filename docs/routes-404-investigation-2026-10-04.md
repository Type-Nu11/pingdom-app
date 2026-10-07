# 자동차 길찾기 404 조사 — 2026-10-04

추적 이슈: [pingdom-infra #27 — App 프록시 /routes 전달 누락 및 운영 반영](https://github.com/Type-Nu11/pingdom-infra/issues/27).

상태: **프록시 설정 결함을 수정했으나 운영 해결은 미검증**. 유효 JWT로 서버 내부와 외부 HTTPS에서 실제 공급자 경로를 확인하지 못했습니다. 운영 SSH 접속 대상과 비공개 요청 파일은 제공되지 않았습니다.

구현 위치: **shared migration boundary — pingdom-infra 앱 프록시**. 앱 V2 계약은 유지합니다. V1 dependency delta: **none**. 기존 앱 작업 파일은 변경하지 않았습니다.

## 확인된 사실

| 근거 | 확인 결과 |
|---|---|
| 사용자가 제시한 Android 로그, 18:15:08 KST | 로그인된 앱의 `POST https://www.typenull.xyz/routes` → 404, 70ms. 원본 응답 본문·운영 upstream 로그는 제공되지 않음 |
| 재조회 18:20:16 KST, `GET /v3/api-docs/app` | 200, `POST /routes` 존재. `x-request-id: fca24338-f1a8-4821-93d7-5fc7b2b645c0`. 생성된 server URL은 `http://172.31.46.247:8080` |
| 재현 18:21:09 KST, App 헤더 + JSON 요청, JWT 없음 | 404, `text/html`, 159바이트, `openresty/1.31.1.1` 표준 HTML 오류. request-id 없음 |
| 같은 URL·본문에서 App 헤더를 제외한 대조 요청 | 401 JSON `missing authentication token`. 인증 경로 선택이 달라짐 |
| App 헤더로 `GET /places/trends`, JWT·device-id 없음 | 400 JSON `missing required header: X-Device-Id`. 앱 메타데이터 검사에 진입함 |
| infra 기준 SHA `9df8862a93308a7cc4e3c339047cda72849f9bce` | 앱 8082 리스너에는 `/routes` location과 catch-all 전달 경로가 없음. `/places/`는 전달함 |
| 실제 OpenResty에 수정 전 설정을 넣은 격리 테스트 | `/routes`가 인증 게이트의 예상 400 대신 404여서 실패 |
| 수정 후 같은 격리 테스트 | 400/401 인증 게이트, POST URI·JSON 본문·헤더 보존, `/places/trends` 정상 전달, 미등록 하위 경로 404 통과 |

확인된 결함은 **앱 전용 OpenResty 전달 목록의 `/routes` 누락**입니다. 운영에서 관찰한 헤더별 응답 차이 및 격리 재현이 이 메커니즘과 일치합니다. 사용자 원본 요청의 정확한 운영 로그 연결 및 실제 로딩된 nginx 설정은 아직 확인하지 않았으므로, 원본 요청까지 같은 인스턴스·설정에서 실패했다고 단정하지 않습니다. `server: openresty` 헤더만으로 생성 지점을 판별하지 않았습니다.

## 코드·설정 추적

- 앱 `src/v2/modules/place/map/routes/api/routesApi.ts:18`은 origin/destination의 숫자 latitude/longitude와 `mode: car`를 만들고, `:47`에서 `/routes`에 POST합니다. `src/v2/shared/api/apiClient.ts:58`는 JWT, `clientType.ts:59`는 App·timestamp·version·device-id를 구성합니다. 공급자 키는 보내지 않습니다.
- 서버 `src/main/java/com/typenull/pingdom/place/api/RouteController.java:32`는 `/routes`, `:42`는 POST 매핑입니다. 조건부 프로필/기능 플래그로 컨트롤러를 숨기지 않습니다.
- `JwtAuthenticationFilter.java:59`는 JWT와 계정 상태를 확인하고 보안 체인으로 전달합니다. `ApiAuthorizationRules.java:38`은 나머지 경로의 인증을 요구합니다. entry point는 401, access denied handler는 403입니다. 존재하지 않는 계정도 인증 불가이며 여기서 404를 던지지 않습니다.
- `RouteExceptionHandler.java:26`은 본문 오류 400, `:31`은 제한 초과 429입니다. `GlobalExceptionHandler.java:147`의 미매핑 리소스는 404 JSON `RESOURCE_NOT_FOUND`; `:138`의 ResponseStatusException은 명시된 상태를 보존합니다. 조사한 route 서비스·공급자 경로에는 해당 404 생성 경로가 없습니다.
- `MapErrorCode.java:11`의 route 오류는 400/422/429/503/504입니다. `ROUTE_NOT_FOUND`는 **422**입니다. `NaverDirectionsClient.java:39`의 비활성·키 누락은 **503**, 공급자 HTTP 404도 `:65`에서 **503**으로 정규화합니다.
- infra `nginx.conf.template:34`의 앱 8082는 앱 locations를 include하고, web 8081은 `configs/conf.d/web/locations.conf:42`의 catch-all로 백엔드에 전달합니다. 수정된 `configs/conf.d/app/locations.conf:10`은 `/routes` 정확 일치, 기존 app auth 및 rate-limit, URI 부분 없는 proxy_pass를 사용합니다. `/routes`를 지우거나 다른 접두사로 재작성하지 않습니다.
- infra 백엔드 주소는 `.env`의 BACKEND_HOST/BACKEND_PORT로 렌더링됩니다. 저장소 기본값 `backend:8080`을 실제 운영 upstream이라고 취급하지 않았습니다.
- 서버 `application.yaml:1`에는 servlet context-path 설정이 없습니다. 환경변수·실행 인자·외부 설정의 운영 override는 미확인입니다.
- loadbalancer SHA `b1fd54030e358f958bdd711971fb9a997090f474`에는 HAProxy와 Rust edge 구성이 함께 있습니다. Rust 구현은 App 헤더를 8082로 전달하며 URI를 보존하지만, 운영 실행 구현은 미확인입니다.
- TLS_Proxy 저장소의 Compose는 호스트 `./nginx.conf`를 마운트합니다. **해당 파일은 Git 추적 대상에 없습니다**. 실제 TLS vhost의 헤더 분기·rewrite·upstream은 운영 마운트에서 확인해야 합니다.

## 배포 확인과 한계

- [서버 release 배포 #37123175058](https://github.com/Type-Nu11/pingdom-api/actions/runs/37123175058): 2026-10-03 21:31:58 KST 시작, build/deploy 성공. SHA `735cfe6920c497564529101ff937ab62af02b9b8`. 로그 readiness 결과는 `{"status":"UP"}`입니다.
- 서버 workflow는 release push에만 `pingdom:latest`와 SHA 태그를 발행하고 실제 배포는 SHA 태그를 선택·검사합니다. Dockerfile은 bootJar를 `/app/app.jar`로 넣습니다. Compose는 `SPRING_PROFILES_ACTIVE: ''`를 명시하고 운영 env_file을 주입합니다. 현재 운영 컨테이너의 이미지 digest·JAR·프로필까지 직접 검증한 것은 아닙니다.
- release의 RouteController Git blob SHA `9e54789017fa2c35acea069c77354812a21c75f8`는 조사한 develop 소스와 동일합니다. Swagger를 반환한 서버에 route 계약이 포함됐다는 증거이며 앱 upstream도 같은 서버인지는 미확인입니다.
- [infra 배포 #36953028839](https://github.com/Type-Nu11/pingdom-infra/actions/runs/36953028839): 2026-10-02 10:53:05 KST `Required GitHub Actions secret/input is missing: DEPLOY_HOST`. SSH 및 배포 단계는 skipped입니다. 저장소 최신 설정의 운영 적용을 보장하지 못합니다.
- [PR #1762](https://github.com/Type-Nu11/pingdom-api/pull/1762)는 테스트 파일 하나만 변경하며 develop SHA `4e3996c33d3806390734d24b98534d1e2f80107f`에 병합됐습니다. release 배포 또는 실제 경로 조회 성공 증거가 아닙니다. 이슈 #1735 CLOSED도 성공 검증을 대신하지 않습니다.

## 수정과 검증

별도 체크아웃 `/Users/oneriver/Developer/PingDom_infra`, 브랜치 `codex/fix-app-routes-proxy`:

1. 앱 `/routes` exact location 추가. 기존 JWT·메타데이터 검사와 제한 정책 사용.
2. 배포 smoke에 `POST http://127.0.0.1:8082/routes` 무메타데이터 → 400 검사 추가. 실제 경로 성공 검증과 구별합니다.
3. Docker 기반 `tests/routes_proxy_test.py` 및 PR/push 테스트 workflow 추가.
4. `scripts/verify-routes.py`: 같은 보안 헤더·본문 파일로 내부/게이트웨이/외부 비교. 리다이렉트를 따라가지 않으며, 모든 대상에서 200 + 앱이 사용할 수 있는 경로 계약일 때만 exit 0. 좌표·토큰·원본 오류는 출력하지 않습니다.

OpenResty 격리 테스트와 기존 Lua 인증 게이트 테스트 5건이 통과했습니다. 격리 테스트의 인증 판정과 echo backend는 fixture입니다. NAVER 실제 조회·운영 JWT 검증을 의미하지 않습니다. 앱 경로 테스트 6개 suite/77건 및 `npm run check:v2` 경계 테스트 76건이 통과했습니다. 비교 도구도 로컬 HTTP/HTTPS fixture에서 성공·404 실패·비공개 출력 처리를 확인했습니다. 운영 배포·Git push는 수행하지 않았습니다.

## 운영 담당자 검증 명령

아래는 **운영 호스트**에서 Bash로 실행합니다. `read`로 받는 값은 접속 후 확인한 실제 경로·컨테이너 이름입니다. nginx 전체 설정·로그·JAR은 비공개 임시 디렉터리에 저장하고 원문을 공유하지 마세요. 인증정보·키를 명령 인자, 채팅, Git에 넣지 마세요.

```bash
umask 077
route_audit_dir=$(mktemp -d /tmp/pingdom-routes.XXXXXX)
docker ps --format '{{.Names}} {{.Image}} {{.Ports}}'
read -r -p '앱 L7 프록시 컨테이너 이름: ' route_l7_container
read -r -p '실제 Spring 앱 컨테이너 이름: ' route_app_container
docker exec "$route_l7_container" openresty -T > "$route_audit_dir/l7-config.txt" 2>&1
docker inspect "$route_l7_container" > "$route_audit_dir/l7-inspect.json"
docker inspect "$route_app_container" > "$route_audit_dir/app-inspect.json"
docker cp "$route_app_container:/app/app.jar" "$route_audit_dir/app.jar"
```

프록시의 실행 명령이 별도 `-c`/`-p`를 사용하면 `openresty -T`에도 같은 옵션을 지정하세요. TLS 프록시/HAProxy/Rust edge 컨테이너도 `docker inspect`를 비공개 파일로 저장하고 `.Mounts`, `.Path`, `.Args`를 확인하세요. TLS nginx 마운트 원본을 복사해 `www.typenull.xyz` server의 **App 헤더 → 앱 listener**, `/routes`의 rewrite·location·proxy_pass를 확인해야 합니다. 단순히 다른 nginx.conf를 읽어 운영 설정이라고 취급하지 마세요.

```bash
python3 - "$route_audit_dir" <<'PY'
import json, pathlib, sys, zipfile
p = pathlib.Path(sys.argv[1])
for name in ('l7', 'app'):
    d = json.loads((p / (name + '-inspect.json')).read_text())[0]
    env = dict(x.split('=', 1) for x in d['Config']['Env'] if '=' in x)
    print(name, 'configuredImage=', d['Config']['Image'], 'runningImageId=', d['Image'])
    if name == 'l7':
        for k in ('BACKEND_HOST', 'BACKEND_PORT'):
            print(k, env.get(k, '<unset>'))
    else:
        for k in ('SPRING_PROFILES_ACTIVE', 'SERVER_SERVLET_CONTEXT_PATH', 'SERVER_PORT', 'NAVER_DIRECTIONS_ENABLED'):
            print(k, env.get(k, '<unset>'))
        for k in ('NAVER_DIRECTIONS_CLIENT_ID', 'NAVER_DIRECTIONS_CLIENT_SECRET'):
            print(k, 'present=', bool(env.get(k, '').strip()))
with zipfile.ZipFile(p / 'app.jar') as jar:
    cls = 'BOOT-INF/classes/com/typenull/pingdom/place/api/RouteController.class'
    print('RouteController included=', cls in jar.namelist())
PY
```

실행 이미지 ID를 `docker image inspect IMAGE_ID --format '{{json .RepoDigests}}'`로 확인하고 배포 SHA 태그와 비교하세요. 환경변수 출력은 **유효 설정의 최종 증거가 아닙니다**. 비공개 inspect 파일에서 command/JVM `-D` 옵션, 추가 application 설정 파일·mount·config location을 함께 확인해 override를 배제하세요. 운영 provider 로그에는 이미 enabled/key-present 불리언만 기록됩니다.

원본 실패 시각(18:15:08 KST = 09:15:08 UTC) 주변 기록은 비공개 저장합니다. 프록시가 다른 호스트에 있으면 그 호스트에서도 실행하세요.

```bash
docker logs --since 2026-10-04T09:14:30Z --until 2026-10-04T09:16:00Z "$route_l7_container" > "$route_audit_dir/l7.log" 2>&1
docker logs --since 2026-10-04T09:14:30Z --until 2026-10-04T09:16:00Z "$route_app_container" > "$route_audit_dir/app.log" 2>&1
```

`/routes`의 access/error 로그에서 status, upstream address/status, 파일 열기 오류 및 request-id를 비교하세요. Docker stdout에 없으면 실제 `openresty -T`의 access_log/error_log 경로에서 가져오세요. 소스의 json_ops는 형식 선언만 있으며 운영 access_log 적용은 별도 확인이 필요합니다. Spring JSON 404와 OpenResty HTML 404를 구별하세요.

같은 로그인 세션의 요청을 기기 측에서 비공개 파일로 준비합니다. 헤더 파일에는 Authorization, Accept, Content-Type, X-Client-Type, X-Timestamp, X-App-Version, X-Device-Id 및 실제 앱이 보낸 추가 헤더를 한 줄씩 넣습니다. X-Timestamp는 검증 직전 앱 요청에서 가져오세요. 본문도 그 요청을 그대로 사용합니다. 스크립트는 두 파일을 읽고 모든 호출에 동일하게 사용합니다.

```bash
read -r -p '수정된 infra 체크아웃 경로: ' route_infra_checkout
read -r -p '비공개 요청 헤더 파일 경로: ' route_headers_file
read -r -p '비공개 요청 본문 파일 경로: ' route_body_file
read -r -p '확인한 Spring 직접 URL(context-path 포함, /routes로 끝남): ' route_direct_url
read -r -p '확인한 앱 L7 URL(/routes로 끝남): ' route_gateway_url
chmod 600 "$route_headers_file" "$route_body_file"
python3 "$route_infra_checkout/scripts/verify-routes.py" \
  --headers "$route_headers_file" --body "$route_body_file" \
  --direct "$route_direct_url" --gateway "$route_gateway_url" \
  --out "$route_audit_dir/comparison"
```

기본 외부 URL은 `https://www.typenull.xyz/routes`입니다. 내부 주소는 실제 렌더링된 upstream과 context-path를 따르세요. IP·port는 Swagger 값이나 저장소 기본값을 복사해 추정하지 마세요. 사설 upstream이 이 호스트에서 접근 불가하면 접근 가능한 호스트에서 같은 파일로 실행합니다.

내부 200 / gateway 404이면 L7 전달 문제, gateway 200 / 외부 404이면 TLS/edge 분기 문제입니다. 내부 JSON 404이면 이미지·context-path·매핑을 확인합니다. 401/403이면 JWT·계정 상태·프록시 인증 키를, 400이면 metadata/body를 확인합니다. 503 `ROUTE_PROVIDER_UNAVAILABLE`이면 이후에 provider enable/key/권한·쿼터를 점검합니다. 토큰을 임의 생성하거나 운영 보안 검사를 우회하지 마세요.

## 배포 조치와 완료 조건

1. infra의 `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`를 운영 담당자가 안전하게 설정합니다. 현재 확인된 누락은 DEPLOY_HOST이며 나머지 존재 여부는 미확인입니다.
2. 수정된 infra 설정을 실제 앱 프록시 체크아웃에 반영합니다. 기존 `.env`의 실제 upstream·JWT 키를 유지합니다. 배포 전 현재 이미지와 설정을 비공개 위치에 보관하세요.
3. 해당 checkout에서 `sudo -n docker compose config --quiet`, `sudo -n docker compose up -d --build --no-deps reverse-proxy`, `sudo -n docker compose exec -T reverse-proxy openresty -t`를 실행합니다. 코드 변경 때문에 Spring 서버를 다시 배포할 필요는 확인되지 않았습니다. 다른 방식의 운영 프록시라면 그 활성 설정에 동일한 exact location을 반영하고 syntax 검사 후 reload합니다.
4. 이후 직접/gateway/HTTPS 비교를 실행합니다. NAVER 설정은 서버의 NAVER_DIRECTIONS_ENABLED=true 및 별도 NAVER_DIRECTIONS_CLIENT_ID/CLIENT_SECRET 주입이 필요합니다(`application.yaml:309`). 지도 SDK client-id를 자동으로 대체하지 않습니다. 값의 존재만으로 인증·서비스 사용 권한까지 입증되지는 않습니다. provider base URL/timeout override도 확인합니다.
5. **유효한 실제 자동차 좌표로 외부 HTTPS 200, mode=car/provider=naver, 유효하고 서로 다른 경로 좌표 2개 이상, 거리 m·시간 초를 확인한 뒤에만 해결 완료로 보고**합니다. 가능하면 #1735 기준의 서로 다른 국내 좌표 2쌍을 사용하고 Android 경로선도 확인합니다. 현재 이 단계는 미완료입니다.
