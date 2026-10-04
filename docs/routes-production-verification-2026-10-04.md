# 자동차 경로 프록시 운영 재확인 — 2026-10-04

추적 이슈: [pingdom-infra #27 — App 프록시 /routes 전달 누락 및 운영 반영](https://github.com/Type-Nu11/pingdom-infra/issues/27).

판정: **운영 해결 미완료. 외부 App 분기의 404가 여전히 재현됩니다.** 유효한 로그인 앱 요청으로 외부 HTTPS 200 및 실제 자동차 경로를 확인하지 못했습니다.

선행 문서: [404 조사](routes-404-investigation-2026-10-04.md). 구현 위치는 **shared migration boundary — infra 앱 프록시 및 비공개 검증 도구**입니다. 앱 V2 소스 변경 없음. V1 dependency delta: **none**.

## 현재 코드·병합·배포

- 로컬 `/Users/oneriver/Developer/PingDom_infra`의 현재 브랜치는 `codex/fix-app-routes-proxy`, HEAD는 `9df8862a93308a7cc4e3c339047cda72849f9bce`입니다. `/routes` 수정은 **미커밋** 상태입니다. HEAD 자체에는 수정이 없습니다.
- GitHub branches API 조회에 해당 수정 브랜치는 없고, 해당 head의 PR 목록도 비어 있습니다. 원격 main은 동일한 `9df8862a93308a7cc4e3c339047cda72849f9bce`입니다. 수정 브랜치의 push·PR·병합 증거가 없습니다.
- GitHub Actions 조회의 최신/유일한 infra 실행은 [36953028839](https://github.com/Type-Nu11/pingdom-infra/actions/runs/36953028839), main SHA도 위와 같습니다. `Validate deployment secrets` 실패, `Configure SSH`와 `Pull and deploy`는 skipped입니다. 실패 로그는 `Required GitHub Actions secret/input is missing: DEPLOY_HOST`입니다.
- 조회 가능한 repository secret 목록은 비어 있습니다. 조직/환경 범위의 secret 존재까지 증명하는 결과는 아닙니다. 실패 실행에서 사용 가능한 DEPLOY_HOST가 없었다는 점은 확정됩니다.
- 이 GitHub 배포 경로가 수정안을 운영에 적용했다는 증거는 없습니다. 수동 배포 여부와 현재 운영 이미지·로드된 설정은 별도 미확인입니다.

## 외부 재조회

2026-10-04 **19:06:39 KST**부터 순서대로 POST `https://www.typenull.xyz/routes`를 호출했습니다. 인증정보·좌표 없이 빈 JSON을 사용한 분기 진단입니다. **유효한 앱 요청 비교가 아닙니다.**

| 대상 | HTTP | 형식 | 오류 코드 | 응답 X-Request-Id |
|---|---:|---|---|---|
| 외부 HTTPS + X-Client-Type: App | 404 | text/html / HTML | 없음 | 없음 |
| 외부 HTTPS, App 헤더 제외 | 401 | application/json | 식별 코드 없음 | 없음 |
| Spring 직접, 유효 앱 요청 | 미실행 | — | — | — |
| 앱 OpenResty 8082, 유효 앱 요청 | 미실행 | — | — | — |
| 외부 HTTPS, 유효 앱 요청 | 미실행 | — | — | — |

기존 App 프록시 전달 누락과 증상이 일치합니다. 실제 TLS/edge/L7 설정과 upstream 로그가 없으므로 **404를 생성한 정확한 운영 구간은 확정하지 않습니다**. 이번 관측은 503이 아니며, NAVER 설정·키·서비스 권한도 확인하지 못했습니다.

사용자는 운영 접근·비공개 요청 파일을 현재 제공할 수 없다고 확인했습니다. 이 환경에는 운영 SSH 별칭 설정, DEPLOY 환경변수, infra .env가 없었습니다. 접속 대상을 추정하거나 자격증명을 만들지 않았습니다.

## 준비된 변경과 검증

미커밋 infra 변경안은 다음과 같습니다.

1. `configs/conf.d/app/locations.conf`: `location = /routes`에 기존 App 인증 및 제한 정책 적용. URI 없는 `proxy_pass http://${BACKEND_HOST}:${BACKEND_PORT};`로 `/routes`와 본문을 보존합니다.
2. `.github/workflows/deploy-l7.yml`: 무메타데이터 POST `/routes`가 400인지 검사하는 배포 smoke 추가. 실제 경로 성공을 의미하지 않습니다.
3. `tests/routes_proxy_test.py`, `.github/workflows/proxy-tests.yml`: OpenResty 격리 검증.
4. `scripts/verify-routes.py`: 같은 비공개 헤더·본문으로 직접/L7/외부를 비교합니다. 이번 재확인에서 각 호출의 UTC 시작 시각과 응답 request-id 요약을 추가했습니다. UUID 및 nginx 32자리 hex만 출력하며 다른 ID는 마스킹하고 원본 헤더는 비공개 파일로 보관합니다. 오류 message·좌표·토큰은 출력하지 않습니다.

이번 OpenResty 격리 테스트는 인증 게이트, POST URI·본문·헤더 보존, trends 전달, exact 범위 검증을 통과했습니다. 기존 Lua 인증 게이트 5건과 비교 도구의 성공/503/404 fixture 검증도 통과했습니다. fixture는 실제 공급자·운영 호출과 구별합니다. 앱 V2 변경이 없으므로 check:v2 재실행 대상은 없습니다.

## 운영 담당자 실행 순서

운영 호스트 Bash에서 실행합니다. 전체 설정·inspect·로그는 민감할 수 있으므로 출력/공유하지 말고 비공개 파일에만 저장합니다. `set -x`는 사용하지 마세요. 컨테이너 이름·upstream은 실제 운영 값을 확인합니다.

```bash
umask 077
route_audit_dir=$(mktemp -d /tmp/pingdom-routes.XXXXXX)
docker ps --format '{{.Names}} {{.Image}} {{.Ports}}'
read -r -p '실제 앱 L7 컨테이너: ' route_l7_container
read -r -p '실제 Spring 컨테이너: ' route_app_container
docker inspect "$route_l7_container" > "$route_audit_dir/l7-inspect.json"
docker inspect "$route_app_container" > "$route_audit_dir/app-inspect.json"
docker top "$route_l7_container" -eo pid,lstart,args > "$route_audit_dir/l7-processes.txt"
docker exec "$route_l7_container" sh -c 'tr "\000" " " < /proc/1/cmdline' \
  > "$route_audit_dir/l7-pid1-command.txt"
docker logs --since 24h "$route_l7_container" > "$route_audit_dir/l7-start-reload.log" 2>&1
```

inspect의 Path/Args와 master process 인자를 비공개로 확인합니다. 이 저장소의 entrypoint는 `/etc/nginx/nginx.conf`를 지정하지만 **운영도 같다고 가정하지 않습니다**. 실제 master의 `-c` 및 `-p` 값으로 아래 배열을 설정하세요. `-p`가 없으면 해당 항목은 제외합니다.

```bash
read -r -p 'master가 사용하는 절대 nginx 설정 경로: ' route_nginx_config
read -r -p 'master의 명시적 -p prefix (없으면 Enter): ' route_nginx_prefix
route_nginx_args=(-c "$route_nginx_config")
if [ -n "$route_nginx_prefix" ]; then
  route_nginx_args+=(-p "$route_nginx_prefix")
fi
docker exec "$route_l7_container" openresty -T "${route_nginx_args[@]}" \
  > "$route_audit_dir/l7-config.txt" 2>&1
```

**주의: `-T`는 실행 중인 worker 메모리의 설정 덤프가 아니라 현재 파일을 다시 파싱한 결과입니다.** 이것만으로 이미 로드됐다고 판단하지 마세요. master/worker 시작 시각, 성공한 startup/reload 기록, 설정 수정 시각·배포 image ID를 함께 확인하세요. 불일치가 있으면 로딩 상태는 미확인입니다. 승인된 배포 후 syntax 검사와 성공한 reload/recreate, 아래 실제 요청의 access/upstream 로그를 연결해야 적용을 입증할 수 있습니다.

비공개 설정에서 8082 server의 include가 실제 `location = /routes`를 포함하는지, 인증 게이트·제한 정책이 있는지, `proxy_pass`의 최종 host/port가 실제 Spring과 일치하는지 확인합니다. rewrite와 URI 치환 여부도 확인합니다. TLS/HAProxy/Rust edge도 같은 방식으로 실행 인자·mount·실제 설정을 확보하고 App 헤더가 8082로 전달되는지 확인하세요. 저장소 기본 backend 주소나 Swagger의 내부 주소로 대체하지 마세요.

### 동일 로그인 앱 요청 비교

최신 앱 요청의 전체 헤더(Authorization, Accept, Content-Type, App, timestamp, version, device-id 및 실제 추가 헤더)와 JSON 본문을 600 권한의 비공개 파일로 전달합니다. timestamp 허용 구간 안에서 비교하세요. 도구가 요청 헤더를 새로 생성하거나 인증을 우회하지 않습니다. 수정 도구는 아직 원격에 없으므로 담당자 호스트에 검토된 도구 파일을 별도로 전달해야 합니다.

```bash
read -r -p '검토된 infra checkout 경로: ' route_infra_checkout
read -r -p '비공개 앱 헤더 파일: ' route_headers_file
read -r -p '비공개 앱 본문 파일: ' route_body_file
read -r -p '실제 Spring 직접 URL(context-path 포함 /routes): ' route_direct_url
read -r -p '실제 앱 L7 URL(/routes): ' route_gateway_url
chmod 600 "$route_headers_file" "$route_body_file"
route_start_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)
python3 "$route_infra_checkout/scripts/verify-routes.py" \
  --headers "$route_headers_file" --body "$route_body_file" \
  --direct "$route_direct_url" --gateway "$route_gateway_url" \
  --external https://www.typenull.xyz/routes \
  --out "$route_audit_dir/comparison"
route_comparison_exit=$?
route_end_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)
docker logs --since "$route_start_utc" --until "$route_end_utc" "$route_l7_container" \
  > "$route_audit_dir/l7-comparison.log" 2>&1
docker logs --since "$route_start_utc" --until "$route_end_utc" "$route_app_container" \
  > "$route_audit_dir/app-comparison.log" 2>&1
printf 'comparison exit=%s\n' "$route_comparison_exit"
```

Docker stdout에 access log가 없다면 실제 `-T`의 access_log/error_log 파일에서 같은 기간의 기록을 비공개로 확보합니다. 호출 시각·응답 request-id를 연결하고 status/upstream address/upstream status를 확인합니다. L7의 `$request_id`와 Spring의 `X-Request-Id`는 다를 수 있습니다. upstream status가 기록되지 않았다면 누락으로 명시합니다. 현재 json_ops 정의에는 upstream_status가 없으며, 형식 선언만으로 사용 중이라고 단정할 수도 없습니다. 로그가 부족할 때의 추가안은 `/routes` 전용 access_log에 `$request_id`, `$http_x_request_id`, `$upstream_http_x_request_id`, `$status`, `$upstream_addr`, `$upstream_status`, `$request_time`을 기록하는 것입니다. 인증 헤더·본문·쿼리·좌표는 기록하지 않습니다. 설정 추가 전 syntax/격리 검증이 필요합니다.

| 比較結果 | 次に調べる箇所 |
|---|---|
| 直接200 / L7 404 | L7のlocation・rewrite・稼働設定 |
| L7 200 / 外部404 | TLS/edgeのApp分岐・宛先・rewrite |
| 直接JSON 404 | 実行イメージ、context-path、controller mapping |
| 401/403 | 同一セッションのJWT、アカウント状態、App認証設定 |
| 400 | timestamp・device-id・version・本文契約 |
| 503 ROUTE_PROVIDER_UNAVAILABLE | 以下のNAVER設定・供給者応答 |

### 404解消後に503の場合

先行調査文書の安全な inspect/JAR 確認コマンドを実行し、値を公開せず `NAVER_DIRECTIONS_ENABLED` と `NAVER_DIRECTIONS_CLIENT_ID/CLIENT_SECRET` の存在を確認します。envだけでは最終有効設定と断定せず、JVM引数・mount・追加configのoverrideも確認します。

同じ時刻範囲のサーバーログを非公開で調べます。現行ソースの `NaverDirectionsClient` は `outcome=configuration` で enabled/clientIdPresent/clientSecretPresent、供給者失敗で outcome/httpStatus/providerCode を記録します。これらの分類だけを共有してください。

- configuration → 有効フラグと**Directions用**キー注入を修正。
- authentication + provider HTTP 401/403 → キーの組合せ・対象サービスへの紐付け・利用権限を管理コンソールで確認。値の存在だけでは権限を証明できません。
- quota + 429 → 供給者の利用枠を確認。
- timeout/unavailable/invalid_response → DNS/TLS/接続先・timeout override・供給者応答分類を確認。

現在の503や権限不足を観測したわけではありません。キー原文、供給者リクエストURL（座標付き）、供給者の生レスポンスは共有しないでください。

### デプロイが必要な場合の変更案

まず未コミット変更をレビューしてcommit/push/PR化し、隔離テストを通したSHAを確定します。mainにこの変更はまだありません。DEPLOY_HOST/USER/PATH/SSH_KEY/KNOWN_HOSTSは安全なsecret経路で用意します。既存環境のupstream/JWT設定を保持し、稼働image/configを私有バックアップしてから、承認された運用手順で実施します。

```bash
cd "$route_infra_checkout"
# このcheckoutがレビュー済み修正SHAであることを確認してから実行
git rev-parse HEAD
sudo -n docker compose config --quiet
sudo -n docker compose up -d --build --no-deps reverse-proxy
sudo -n docker compose exec -T reverse-proxy openresty -t
```

実施後、実行イメージID・masterの起動・実設定を再採取して同じ比較を実行します。400 smokeだけで完了にしません。

**完了条件: 有効な同一アプリ要求で外部 HTTPS 200、mode=car/provider=naver、範囲内かつ異なる経路座標2点以上、有効な距離m・時間秒を確認。現時点では未達です。**
