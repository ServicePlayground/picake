---
name: picake-infra-monitor
description: Picake staging/production EC2 인프라 상태(CPU·메모리·디스크·PM2·Postgres·nginx·SSL·응답시간), AWS 사용 현황, 이번 달 비용 분석, 업그레이드 시점 팁을 종합해서 보여달라는 요청을 받으면 사용합니다. "인프라 상태 어때", "이번 달 비용 얼마 나왔어", "지금 서버 업그레이드해야 해?" 같은 요청에 이 skill을 참고하세요. 매일 09:00 KST 클라우드 루틴("Picake 인프라 모니터링")이 이 절차를 자동 실행해 Discord로 리포트를 보냅니다.
---

# Picake 인프라 모니터링

과거에는 `.github/workflows/monitor-infra.yml`이 GitHub Actions cron(매일 09:00 KST)으로 SSH 접속해 EC2 상태를 점검했습니다. 2026-09-02에 SSH 프라이빗키 없이 **AWS SSM Run Command**로 동일한 항목을 점검하도록 클라우드 루틴("Picake 인프라 모니터링")으로 전환했고, 여기에 AWS 사용 현황·비용 분석·업그레이드 팁을 추가했습니다. `monitor-infra.yml`은 참고용으로 저장소에 남아있지만 스케줄은 꺼져 있습니다(`workflow_dispatch`로 수동 실행만 가능) — 실제 매일 리포트는 이 skill 기반 루틴이 담당합니다.

## 0. 사전 정보

- **인스턴스**: staging `i-066ff0910cb4bbe21` (`api-staging.picakes.com`, t4g.small, launch 2026-06-07), production `i-08fa3dc918bdbd99b` (`api.picakes.com`, t4g.small, launch 2026-07-07). 둘 다 `ap-northeast-2`.
- **SSM 실행 권한**: 두 인스턴스에는 `picake-ec2-ssm-role` 인스턴스 프로파일이 연결되어 있어 SSM Run Command로 접근 가능합니다 (SSH 키 불필요).
- **AWS 자격증명**: 이 루틴 전용 IAM 유저(읽기 전용 + 두 인스턴스에 한정된 SSM 명령 실행 권한만 허용)의 액세스 키가 루틴 프롬프트에 직접 들어 있습니다. `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_DEFAULT_REGION=ap-northeast-2` 환경변수로 export한 뒤 `aws` CLI를 그대로 쓰면 됩니다. 이 값을 로그나 최종 결과물에 노출하지 마세요.
- **Discord 웹훅**: 루틴 프롬프트에 직접 들어 있습니다 (기존 일일 데이터 리포트 루틴과 동일한 패턴).
- 코드 수정·커밋은 하지 않습니다 — 순수 모니터링/리포트 작업입니다.

## 1. EC2 호스트 상태 (SSM Run Command, 필수)

각 환경마다 아래 절차를 반복합니다. `<ENV>`는 `staging`/`production`, `<DOMAIN>`은 `api-staging.picakes.com`/`api.picakes.com`, `<DB>`는 `picake_staging_db`/`picake_production_db`, `<PM2_NAME>`은 `picake-backend-staging`/`picake-backend-production`, `<ACCESS_LOG>`는 `/var/log/nginx/picake-backend-staging-access.log`/`...-production-access.log`로 치환하세요.

1. 아래 셸 스크립트(과거 SSH heredoc과 동일한 점검 항목)를 파일로 저장합니다 (`/tmp/host-check.sh`):

```bash
UPTIME=$(uptime -p 2>/dev/null)
VCPUS=$(nproc 2>/dev/null)
CPU_LOAD1=$(awk "{print \$1}" /proc/loadavg 2>/dev/null)
DISK_LINE=$(df -h / | tail -1)
DISK_PCT=$(echo "$DISK_LINE" | awk "{print \$5}" | tr -d "%")
DISK_HUMAN=$(echo "$DISK_LINE" | awk "{print \$3\"/\"\$2\" (\"\$5\")\"}")
MEM_HUMAN=$(free -h | awk "/Mem:/{print \$3\"/\"\$2}")
MEM_PCT=$(free | awk "/Mem:/{printf \"%.0f\", \$3/\$2*100}")
CERT_FILE="/etc/letsencrypt/live/<DOMAIN>/fullchain.pem"
if sudo test -f "$CERT_FILE"; then
  NOT_AFTER=$(sudo openssl x509 -in "$CERT_FILE" -noout -enddate 2>/dev/null | cut -d= -f2)
  EXP_EPOCH=$(date -d "$NOT_AFTER" +%s 2>/dev/null || echo 0)
  SSL_DAYS=$(( (EXP_EPOCH - $(date +%s)) / 86400 ))
else
  SSL_DAYS="NA"
fi
TIMER_ACTIVE=$(systemctl is-active certbot-renew.timer 2>/dev/null)
TIMER_ENABLED=$(systemctl is-enabled certbot-renew.timer 2>/dev/null)
NGINX_ACTIVE=$(systemctl is-active nginx 2>/dev/null)
PM2_JSON=$(pm2 jlist 2>/dev/null)
PM2_STATUS=$(echo "$PM2_JSON" | jq -r ".[] | select(.name==\"<PM2_NAME>\") | .pm2_env.status" 2>/dev/null)
PM2_RESTARTS=$(echo "$PM2_JSON" | jq -r ".[] | select(.name==\"<PM2_NAME>\") | .pm2_env.restart_time" 2>/dev/null)
LOCAL_HEALTH=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:8080/health 2>/dev/null)
PG_ACTIVE=$(systemctl is-active postgresql 2>/dev/null)
PG_CONNECTIONS=$(sudo -u postgres psql -tAc "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d "[:space:]")
PG_STAT_EXT=$(sudo -u postgres psql -d <DB> -tAc "SELECT 1 FROM pg_extension WHERE extname='pg_stat_statements';" 2>/dev/null | tr -d "[:space:]")
RT_VALUES=$(sudo tail -n 5000 <ACCESS_LOG> 2>/dev/null | grep -oP "rt=\K[0-9.]+")
RT_COUNT=$(printf "%s\n" "$RT_VALUES" | sed "/^\$/d" | wc -l | tr -d "[:space:]")
if [ "$RT_COUNT" -gt 0 ] 2>/dev/null; then
  RT_AVG_MS=$(echo "$RT_VALUES" | awk "{sum+=\$1; n++} END{if(n>0) printf \"%.0f\", (sum/n)*1000}")
  RT_P95_MS=$(echo "$RT_VALUES" | sort -n | awk -v n="$RT_COUNT" "BEGIN{idx=int(n*0.95); if(idx<1)idx=1} NR==idx{printf \"%.0f\", \$1*1000}")
else
  RT_AVG_MS="NA"; RT_P95_MS="NA"
fi
echo "UPTIME=${UPTIME:-unknown}"
echo "VCPUS=${VCPUS:-NA}"
echo "CPU_LOAD1=${CPU_LOAD1:-NA}"
echo "DISK_PCT=${DISK_PCT:-NA}"
echo "DISK_HUMAN=${DISK_HUMAN:-NA}"
echo "MEM_HUMAN=${MEM_HUMAN:-NA}"
echo "MEM_PCT=${MEM_PCT:-NA}"
echo "SSL_DAYS=${SSL_DAYS:-NA}"
echo "TIMER_ACTIVE=${TIMER_ACTIVE:-unknown}"
echo "TIMER_ENABLED=${TIMER_ENABLED:-unknown}"
echo "NGINX_ACTIVE=${NGINX_ACTIVE:-unknown}"
echo "PM2_STATUS=${PM2_STATUS:-unknown}"
echo "PM2_RESTARTS=${PM2_RESTARTS:-NA}"
echo "LOCAL_HEALTH=${LOCAL_HEALTH:-000}"
echo "PG_ACTIVE=${PG_ACTIVE:-unknown}"
echo "PG_CONNECTIONS=${PG_CONNECTIONS:-NA}"
echo "PG_STAT_EXT=${PG_STAT_EXT:-0}"
echo "RT_AVG_MS=${RT_AVG_MS:-NA}"
echo "RT_P95_MS=${RT_P95_MS:-NA}"
echo "RT_COUNT=${RT_COUNT:-0}"
```

2. SSM으로 전송하고 결과를 기다립니다:

```bash
jq -n --rawfile s /tmp/host-check.sh '{commands: ($s | split("\n") | map(select(length>0)))}' > /tmp/ssm-params.json
CMD_ID=$(aws ssm send-command --instance-ids "<INSTANCE_ID>" --document-name AWS-RunShellScript \
  --parameters file:///tmp/ssm-params.json --timeout-seconds 60 --query 'Command.CommandId' --output text)
sleep 5
aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "<INSTANCE_ID>" \
  --query '[Status,StandardOutputContent,StandardErrorContent]' --output json
```

`Status`가 `InProgress`면 2~3초 더 기다렸다가 재조회하세요(최대 5회 재시도, 그래도 안 끝나면 "확인불가"로 표시). `StandardOutputContent`에서 `KEY=value` 줄들을 파싱합니다.

## 2. CloudWatch CPU + Cost Explorer (SSH 무관 교차검증, 필수)

```bash
aws cloudwatch get-metric-statistics --region ap-northeast-2 --namespace AWS/EC2 --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=<INSTANCE_ID> \
  --start-time "$(date -u -d '3 hours ago' +%Y-%m-%dT%H:%M:%S)" --end-time "$(date -u +%Y-%m-%dT%H:%M:%S)" \
  --period 10800 --statistics Average Maximum --query 'Datapoints[0].[Average,Maximum]' --output text
```

## 3. 이번 달 비용 분석 (신규 — 사용자가 요청한 항목)

Cost Explorer는 `us-east-1` 고정, 최대 하루 지연 가능. 아래를 모두 조회하세요:

1. **이번 달 MTD + 지난달 전체 + 그 전달**: 최근 3개월치를 `GetCostAndUsage` (`Granularity: MONTHLY`, 그룹 없음)로 조회해 추세를 봅니다.
2. **전월 대비 증감**: 이번 달 MTD를 지난달 같은 날짜까지의 누적과 비교하거나, 지난달 전체 대비 이번 달 전체(월말이면) 증감률을 계산합니다. 월 중이면 "MTD 기준"임을 명시하세요.
3. **서비스별 breakdown**: `GroupBy: [{Type: DIMENSION, Key: SERVICE}]`로 이번 달/지난달 각각 조회해서 어떤 서비스가 늘었는지/줄었는지 비교하세요. Picake 계정에서 보통 나타나는 항목: `Amazon Elastic Compute Cloud - Compute`(EC2 인스턴스 시간), `EC2 - Other`(EBS 등), `Amazon Virtual Private Cloud`(공인 IPv4 주소 시간당 과금 — AWS가 2024년부터 EIP뿐 아니라 EC2에 자동 할당된 퍼블릭 IP에도 과금하기 시작했습니다, 인스턴스 대수 × $0.005/h가 정상 범위), `Amazon Route 53`(호스팅존 월 $0.50 고정), `Amazon Simple Storage Service`(S3, 보통 매우 작음), `Tax`.
4. **증감 원인 설명**: 숫자만 나열하지 말고 원인을 붙이세요. 예: EC2 Compute가 늘었다면 인스턴스 launch time(0번 참고)과 대조해서 "새 인스턴스가 그 달에 추가돼 월 중순부터 과금 시작"인지 "기존 인스턴스가 풀타임으로 돌면서 자연 증가"인지 구분. RDS/ALB 등 새 서비스 라인이 나타났다면 그것부터 짚으세요.
5. **이상 징후**: 이 프로젝트와 무관해 보이는 서비스 라인(예: Picake와 상관없는 다른 프로젝트의 리소스, 잊고 못 지운 테스트 리소스)이 있으면 짚어주세요. 4번(리소스 인벤토리)과 대조하면 판단하기 쉽습니다.

## 4. AWS 리소스 인벤토리 (신규 — "지금 뭘 쓰고 있는지" 요청)

읽기 전용 API로 아래를 조회해 "현재 사용 중인 AWS 서비스" 섹션을 만드세요:

- EC2 인스턴스(`DescribeInstances`) — 타입, 상태, 이름
- EBS 볼륨(`DescribeVolumes`) — 크기, 타입, 연결된 인스턴스
- Elastic IP(`DescribeAddresses`) — 몇 개나 있는지, 어느 인스턴스에 붙었는지. **주의**: production은 EIP가 없고 EC2 자동 할당 퍼블릭 IP를 씁니다 — 인스턴스를 stop/start하면 IP가 바뀔 수 있고 Route53이 그 IP를 가리키고 있다면 DNS가 깨집니다. 이 사실을 팁 섹션에서 매번 짚어주세요.
- S3 버킷(`ListBuckets`) — `picake-uploads-staging-apne2`, `picake-uploads-production-apne2` 존재 확인, 예상 밖의 버킷이 있으면 플래그
- CloudFront 배포(`ListDistributions`) — 도메인/오리진 확인
- Route53 호스팅존(`ListHostedZones`) — `picakes.com` 확인
- NAT Gateway/VPC Endpoint/VPN(`DescribeNatGateways`/`DescribeVpcEndpoints`/`DescribeVpnConnections`) — 보통 전부 0개(1단계 구조라 NAT 불필요). 뭔가 나타나면 비용에 크게 영향을 주는 항목이라 반드시 짚으세요.
- RDS(`DescribeDBInstances`), ALB(`DescribeLoadBalancers`), ElastiCache(`DescribeCacheClusters`) — 지금은 전부 없는 게 정상(사내 업그레이드 사다리 1단계). 하나라도 나타나면 "업그레이드가 이미 진행됐다"는 뜻이니 아래 5번 판단 기준을 그에 맞게 조정하세요.

이 프로젝트와 무관한 리소스(다른 이름 규칙, 태그 없음, picake와 관련 없어 보이는 리소스)가 보이면 별도로 짚어주되, **삭제나 변경은 하지 마세요** — 발견 사실만 보고합니다.

## 5. 업그레이드 판단 팁 (신규 강화)

사내 "Backend 업그레이드/모니터링" 문서 기준 5단계 사다리(EC2 단일 → 인스턴스 확장 → RDS → ALB+ASG → Redis), 임계치는 CPU 80%, 메모리 80~90%, 디스크 80%. 아래를 종합해서 팁을 작성하세요 — 기계적 임계치 초과 여부뿐 아니라 **추세**를 봐야 합니다:

- 1번(CPU/메모리/디스크 실측)이 임계치에 가까워지고 있는지, 아니면 여유로운지. 참고로 2026-09 기준 CPU는 평균 0.3~0.4%로 극히 낮고 최대 스파이크(배포/트래픽 순간)만 30~60%대 — 상시 부하가 아니라 스파이크성이면 인스턴스 업그레이드보다 급한 게 아님을 명시하세요.
- 3번(비용 추세)에서 EC2 Compute 비용이 꾸준히 느는 게 "인스턴스가 무거워져서"인지 "그냥 풀타임 가동 개월이 늘어서"인지 구분 — 후자는 업그레이드 신호가 아닙니다.
- 4번(리소스 인벤토리)에서 이미 RDS/ALB 등이 생겼다면 해당 단계는 이미 지난 것으로 취급하고 다음 단계 기준을 안내하세요.
- 3단계(RDS)/4단계(ALB+ASG)/5단계(Redis)는 지표 하나로 자동 판단이 안 되는 사업 판단 영역입니다 — DB 성장 계획, 무중단 배포 필요성, 쿼리 패턴(`pg_stat_statements` 설치 여부로 판단 가능한지 확인) 등 고정 안내문으로 노출하세요.
- production에 EIP가 없다는 점(4번)은 몇 단계든 상관없이 항상 짚을 만한 리스크이니 팁에 포함하세요.

## 6. 외부 체크 (SSH/AWS 무관, 필수)

```bash
check_ssl() { HOST=$1; EXP=$(echo | openssl s_client -connect "${HOST}:443" -servername "$HOST" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2); [ -z "$EXP" ] && { echo NA; return; }; EPOCH=$(date -d "$EXP" +%s 2>/dev/null || echo 0); echo $(( (EPOCH - $(date +%s)) / 86400 )); }
check_http() { curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://$1" 2>/dev/null || echo 000; }
```
확인 대상: `api-staging.picakes.com`/`api.picakes.com`(SSL + `/health`), `staging.picakes.com`/`picakes.com`(web-user), `seller-staging.picakes.com`/`seller.picakes.com`(web-seller), `admin-staging.picakes.com`/`admin.picakes.com`(web-admin).

## 7. 리포트 형식

`.github/workflows/monitor-infra.yml`의 배지 로직(✅/⚠️/❌, 임계치)을 그대로 따라 staging/production 상태를 표시하세요. 그 위에 아래를 추가합니다:

1. **Artifact 대시보드 발행** (`dataviz` skill 먼저 로드): staging/production 상세 상태 + AWS 사용 현황 + 비용 분석(3개월 추이 차트 + 서비스별 breakdown) + 업그레이드 판단 팁을 모두 담습니다. title `"Picake 인프라 모니터링 · {YYYY-MM-DD}"`, favicon 🖥️.
2. **Discord 요약** (기존 일일 데이터 리포트 루틴과 같은 스타일 — 필드 25개/6000자 제한 고려해 핵심만, `[클릭해서 자세히 보기 →](ARTIFACT_URL)` 마스킹 링크 필수):
   - staging/production 핵심 상태(CPU/메모리/디스크/PM2/nginx/Postgres 배지, inline 3열)
   - 이상 있는 항목 요약 (BAD_COUNT/WARN_COUNT 기준 색상 결정 — 🔴 확인필요/🟠 주의/🟢 정상)
   - 이번 달 비용 (MTD, 전월 대비 %) 한 줄
   - Claude의 분석/팁 1~3줄 (기계적 배지로는 안 보이는 것 — 추세, 이상 징후, "지금은 괜찮지만 N일 뒤엔 볼 것" 같은 코멘트)
   - Artifact 링크
   - footer: `Picake 인프라 모니터링 · 매일 09:00 KST`

## 8. 보고

마지막에 짧게: staging/production 상태 요약, 비용 MTD/전월대비, 새로 발견한 이상 징후(있다면), Artifact 링크, Discord 전송 성공 여부(HTTP 상태코드)를 세션 로그에 남기세요.
