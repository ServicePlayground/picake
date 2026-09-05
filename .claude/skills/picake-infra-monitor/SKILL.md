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

## 5. 업그레이드 판단 팁 (신규 강화 — "무엇을·어떤 근거로·언제·비용은 얼마" 프레임워크)

사내 "Backend 업그레이드/모니터링" 문서 기준 5단계 사다리(① EC2 단일 → ② 인스턴스 확장(수직) → ③ RDS → ④ ALB+ASG(수평) → ⑤ Redis). 단순히 "CPU 80% 넘었다"만 말하지 말고, 아래 각 옵션마다 **판단 근거(수치+추세) → 왜 그게 신호인지 → 구체적으로 뭘 할지(인스턴스 타입/설정) → 비용 → 트레이드오프**를 순서대로 짚으세요. 판단은 기본적으로 수치 기반이지만, 수치만으로 못 잡는 사업적 요인(무중단 배포 필요성, DB 성장 계획)은 별도로 구분해서 안내합니다.

### 판단 원칙 (공통)

- **스냅샷 1회가 아니라 추세를 본다**: 이 루틴은 하루 1번 실행이라 "지속 부하"인지 "그 순간 스파이크"인지 직접은 못 봅니다. CloudWatch 3시간 평균(2번)과 오늘 값을 비교하고, 가능하면 최근 여러 날의 세션 로그(같은 Discord 채널의 과거 리포트)와 대조해서 "며칠 연속 임계치 근접"인지 확인하세요. 하루짜리 스파이크는 액션 대상이 아닙니다.
- **임계치는 사다리 단계에 따라 다시 해석**: t4g.small(2vCPU/2GiB, ①②a단계)과 t4g.medium 이상(②b단계)은 여유 용량이 다르므로, "이미 medium인데도 임계치 근접"이면 다음은 인스턴스를 더 키우는 게 아니라 ③④⑤ 구조 확장을 봐야 합니다(4번 리소스 인벤토리에서 실제 인스턴스 타입/RDS·ALB 존재 여부로 현재 단계를 판단).
- **수직(vertical, 인스턴스 스펙↑) vs 수평(horizontal, 인스턴스 대수↑+ALB) 구분 기준**: 수직 확장은 간단하지만 다운타임이 있고 결국 한계가 있습니다(t4g 계열 최대 t4g.2xlarge). 수평 확장(④단계)은 무중단 배포·장애 격리·트래픽 변동 대응이 목적이지, 단순 CPU 부족 해소가 목적이 아닙니다 — 트래픽이 실제로 변동성이 크거나(피크/평시 차이 큼) 무중단 배포가 필요해진 시점에만 정당화됩니다. 트래픽이 크지 않은데 ALB부터 도입하면 고정비만 늘어납니다(아래 참고).

### ② 수직 확장 (인스턴스 업그레이드)

- **근거**: CloudWatch CPU 평균이 최근 3시간 기준 60~70%를 넘고, 이게 하루짜리가 아니라 최근 여러 날 반복된다. 또는 메모리 사용률(`MEM_PCT`)이 80~90%를 지속 초과 — 특히 스왑이 발생하면(free 명령의 swap 사용량, 이 스크립트엔 없지만 필요시 host_check.sh에 `free -h`의 Swap 줄 추가 고려) 매우 강한 신호입니다.
- **왜 신호인가**: t4g.small은 2vCPU/2GiB라 Node.js(NestJS) 프로세스 하나만 돌아도 GC 압박이 빠르게 옵니다. 메모리 부족은 CPU보다 먼저 옵니다(스왑→응답시간 급증).
- **뭘 할지**: t4g.small → t4g.medium(2vCPU/4GiB, 메모리 부족이 원인일 때) → t4g.large(2vCPU/8GiB). CPU 자체가 병목이면 t4g 대신 `c7g.*`(컴퓨트 최적화, Graviton) 계열 검토. Graviton(ARM) 계열을 계속 쓰는 이유: 동급 x86(m5/c5)보다 20~40% 저렴하고 이미 ARM 빌드로 배포 중이라 전환 비용 없음 — x86으로 갈아탈 이유는 없습니다.
- **비용**: t4g.small ≈ $0.0084/h(~$6/월), t4g.medium ≈ $0.0168/h(~$12/월), t4g.large ≈ $0.0336/h(~$24/월) — ap-northeast-2 온디맨드 기준, 실제 청구서(3번)로 재확인 권장. 인스턴스 타입 변경은 재시작이 필요해 수 분 다운타임 발생 — 트래픽 적은 새벽 시간대 권장.
- **디스크는 별도 트랙**: `DISK_PCT` 80% 이상이면 인스턴스 업그레이드가 아니라 EBS 볼륨 크기만 늘리면 됩니다(gp3는 온라인 확장 가능, 다운타임 없음). staging은 2026-09 기준 75%로 이미 근접 — 곧 80% 넘으면 EBS 20GB 정도로 늘리는 걸 권장 목록에 넣으세요.

### ③ RDS로 분리

- **근거**: `PG_CONNECTIONS`가 지속적으로 높거나 늘어나는 추세, 또는 API 인스턴스의 CPU/메모리 문제인지 DB 문제인지 구분이 안 되는 상황(같은 EC2에서 API와 Postgres가 같이 돔 — 리소스 경합).
- **왜 신호인가**: EC2 단일 구조에서는 API와 DB가 CPU/메모리를 나눠 쓰기 때문에, DB가 무거워지면 API 응답시간도 같이 나빠져 원인 진단이 어려워집니다. RDS로 분리하면 각자 독립적으로 스케일 가능하고, 자동 백업/장애조치도 얻습니다.
- **뭘 할지**: `db.t4g.micro`(1vCPU/1GiB, 소규모 시작)로 마이그레이션. 가용성 요구가 높아지면 Multi-AZ(자동 장애조치, 비용 2배) 고려 — 지금 규모에선 Single-AZ로 시작 권장.
- **비용**: `db.t4g.micro` ≈ $12~15/월부터(스토리지 별도). EC2에서 Postgres가 빠지면서 EC2 쪽 리소스 여유가 생기는 부수 효과도 있습니다.
- **판단 근거는 수치만이 아님**: DB 성장 계획(테이블 커질 예정인지), 다중 서버로 갈 계획(RDS 없이는 여러 API 인스턴스가 각자 로컬 DB를 가질 수 없음 — ④단계의 전제조건이기도 함)도 함께 고려해야 합니다.

### ④ ALB + Auto Scaling Group (수평 확장)

- **근거**: 이미 ③단계(RDS)까지 갔고, 아래 중 하나 이상 해당 — (a) 배포할 때마다 다운타임이 발생해 무중단 배포가 필요해짐, (b) 트래픽이 시간대/요일별로 변동이 커서 피크에만 인스턴스를 늘리는 게 이득, (c) 단일 인스턴스 장애 시 전체 다운되는 리스크를 감당하기 어려워짐.
- **왜 신호인가**: ALB+ASG의 목적은 CPU 부족 해소가 아니라 **무중단·장애격리·탄력적 확장**입니다. CPU/메모리가 부족한데 트래픽 변동은 크지 않다면 ②(수직 확장)가 더 저렴하고 간단합니다 — ④는 그 자체로 고정비가 붙기 때문에 트래픽 근거 없이 먼저 가면 손해입니다.
- **뭘 할지**: ALB 생성(최소 2개 AZ) + Target Group + Auto Scaling Group(최소 2대, CPU 기반 스케일링 정책). 헬스체크 엔드포인트는 이미 있는 `/health`를 그대로 사용 가능.
- **비용**: ALB 자체 고정비 ≈ $16~20/월 + LCU(트래픽 기반) + 인스턴스 대수 × 인스턴스 단가(최소 2대이므로 EC2 비용은 최소 2배). 트래픽이 이 고정비를 정당화할 만큼 큰지(nginx 로그 요청 수, PostHog 방문자 추이) 먼저 확인하고 권장하세요.

### ⑤ ElastiCache (Redis)

- **근거**: `PG_STAT_EXT`(pg_stat_statements 설치 여부)가 1이면 실제 쿼리 패턴을 볼 수 있다는 뜻 — 반복되는 동일 SELECT(인기 상품/스토어 목록 등)의 비율이 높고, 응답시간(`RT_P95_MS`)이 추세적으로 늘고 있는데 원인이 DB 부하라면 캐싱 후보입니다.
- **왜 신호인가**: DB 읽기 부하 중 상당수가 "자주 조회되지만 자주 안 바뀌는" 데이터라면, DB를 더 키우는 것(수직/RDS 업그레이드)보다 캐싱이 훨씬 저렴하고 효과적입니다.
- **뭘 할지**: `cache.t4g.micro`로 시작, 캐싱 대상은 변경 빈도 낮고 조회 빈도 높은 쿼리부터(홈 배너, 인기 스토어 목록 등).
- **비용**: `cache.t4g.micro` ≈ $12/월부터.
- **판단 근거 부족 시**: `pg_stat_statements`가 없으면 이 판단 자체가 불가능합니다 — staging/production에 설치 여부를 매번 리포트에 명시하고, 없으면 "설치하면 이 판단이 가능해진다"고 안내만 하세요(설치 자체는 이 루틴의 범위 밖).

### 매번 반드시 짚을 것

- **현재 단계 판정**: 4번(리소스 인벤토리)에서 실제 조회한 인스턴스 타입·RDS/ALB/ElastiCache 존재 여부로 "지금 몇 단계인지"를 먼저 명시하고, 그 다음 단계 기준만 안내하세요(이미 지난 단계를 다시 권하지 말 것).
- **비용 관점 요약**: 위 옵션들을 "지금 당장 필요"/"관찰 필요(추세만 지켜볼 것)"/"아직 이름"로 3단계로 분류해서 보여주면 판단이 쉽습니다. 비용 대비 효과가 낮은 걸(예: 트래픽 작은데 ALB) 먼저 권하지 마세요.
- **production에 EIP가 없다는 리스크**(4번)는 몇 단계든 상관없이 항상 짚으세요 — stop/start 시 IP 변경 → Route53 DNS 불일치 위험.
- **2026-09 기준 참고 실측치**(baseline, 매번 최신값으로 갱신): CPU 평균 0.3~0.4%(매우 낮음, 스파이크만 30~60%대), staging 디스크 75%(임박), 메모리 25% 내외(여유). 즉 이 시점 기준으로는 ②③④⑤ 모두 "아직 이르다" 판정이 맞고, 유일하게 임박한 건 staging EBS 볼륨 확장뿐입니다 — 실측치가 달라지면 이 판정도 그때그때 다시 내리세요(고정 결론으로 베끼지 말 것).

## 6. 외부 체크 (SSH/AWS 무관, 필수)

```bash
check_ssl() { HOST=$1; EXP=$(echo | openssl s_client -connect "${HOST}:443" -servername "$HOST" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2); [ -z "$EXP" ] && { echo NA; return; }; EPOCH=$(date -d "$EXP" +%s 2>/dev/null || echo 0); echo $(( (EPOCH - $(date +%s)) / 86400 )); }
check_http() { curl -sf -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://$1" 2>/dev/null || echo 000; }
```

확인 대상: `api-staging.picakes.com`/`api.picakes.com`(SSL + `/health`), `staging.picakes.com`/`picakes.com`(web-user), `seller-staging.picakes.com`/`seller.picakes.com`(web-seller), `admin-staging.picakes.com`/`admin.picakes.com`(web-admin).

**알려진 환경 제약 (2026-09-02 첫 실행에서 발견)**: 이 클라우드 루틴 샌드박스는 아웃바운드 TLS가 내부 프록시를 거쳐서, `openssl s_client`로 받은 인증서가 실제 도메인 인증서가 아니라 프록시 인증서로 나옵니다 — 8개 도메인 SSL 만료일이 전부 똑같이 나오면(예: 전부 "30일") 이 문제입니다. `check_http`(HTTP 상태코드)는 정상적으로 실제 서버까지 도달하므로 영향 없습니다. **SSL 만료일은 이 외부 체크 대신 1번(SSM 호스트 체크)의 `SSL_DAYS` 값(실서버 로컬 인증서 파일을 직접 읽음, 프록시 영향 없음)을 사용하세요** — api-staging/api 도메인은 이미 커버됩니다. web-user/seller/admin 프론트엔드(Vercel, Let's Encrypt 아님)는 SSM 대상이 아니라 SSL 만료일을 볼 방법이 없으니 그냥 건너뛰고 HTTP 상태코드만 보고하세요.

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
