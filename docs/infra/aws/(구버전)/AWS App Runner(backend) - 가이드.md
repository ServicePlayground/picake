# AWS App Runner(backend) - 가이드

> ⚠️ **구버전 참고 문서**입니다. 현재 백엔드 배포는 [EC2 배포 가이드](../EC2_Route53_S3_CloudFront.md)를 사용합니다.

#### 1. Docker 빌드(Docker 이미지: 앱이 돌아가는 환경(운영체제, 코드 등)을 통째로 담은 상자)

1. 공식홈페이지 > Docker Desktop 설치
2. apps/infra/backend 디렉토리에서 Dockerfile 생성

#### 2. AWS ECR 리포지토리 생성(ECR: Doker 이미지 저장소)

5. AWS ECR > 프라이빗 레지스트리 > 리포지토리 생성
6. 리포지토리 이름: picake/backend
7. 이미지 태그 변경 가능성: Mutable
8. 변경 가능한 태그 제외: staging-, prod-
9. 암호화: AES-256
10. 생성
11. URI 확인

#### 3. AWS CLI 설치 및 AWS 자격증명 설정(IAM 사용자에서 액세스 키를 생성하는 것을 권장하지만, 현재 루트 계정으로 진행)

12. (aws cli 설치) brew install awscli
13. AWS > 오른쪽 위 상단 계정명 클릭 > 보안 자격 증명 클릭 > 액세스 키 만들기
14. 명령어 aws configure 실행 > Access Key ID, Secret Access Key, Region, Output Format: json 입력

#### 4. AWS ECR 로그인

AWS_REGION=ap-northeast-2 # aws 우상단에서 확인
AWS_ACCOUNT_ID=123456789012 # aws 우상단에서 확인

aws ecr get-login-password --region "$AWS_REGION" \
| docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

#### 5. 이미지 태그 & 푸시

docker buildx create --use

ENV="staging" # staging, prod
ECR="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
REPO="picake/backend"
VERSION=$(date +%Y%m%d-%H%M)

docker buildx build --platform linux/amd64,linux/arm64 -f apps/infra/backend/Dockerfile -t ${ECR}/${REPO}:${ENV} -t ${ECR}/${REPO}:${ENV}-${VERSION} --push .

# --------------------------(즁요 삭제하지 말것) 멀티 아키텍처 이미지 빌드 & 푸시--------------------------

# 도커는 기본적으로 내 컴퓨터 아키텍처(현재: 맥북 에어 M2-ARM64)로 이미지를 빌드한다.

# node:20-slim 베이스도 멀티아키텍처라 ARM64 레이어를 자동으로 가져온다.

# App Runner 런타임은 대부분 AMD64(x86_64)이다. 그래서 ARM64로 만든 이미지는 App Runner에서 실행 불가능하다.

# 따라서 빌드할 때, --platform linux/amd64 를 명시하거나, 멀티아키텍처(amd64 + arm64) 로 푸시해야한다.

# ---------------------------------------------------------------------------------------------

#### 6. App Runner <-> RDS VPC 보안 그룹 생성

15. 위치: AWS > VPC > 보안 그룹 > 보안 그룹 생성 생성

- 이름: apprunner-staging-sg
- VPC: 기본값
- 인바운드: 없음
- 아웃바운드: 전체 0.0.0.0/0

- 이름: db-staging-sg
- VPC: 기본값
- 인바운드: TCP 5432 apprunner-staging-sg # APP RUNNER에서 RDS에 접근 가능하도록 함
- 아웃바운드: 전체 0.0.0.0/0

#### 7. App Runner 서비스 생성(App Runner: ECR을 기준으로 자동 배포할 수 있음)

16. AWS > App Runner > 서비스 생성

- 리포지토리 유형: 컨테이너 레지스트리
- 공급자: Amazon ECR
- 컨테이너 이미지 URI: 이전에 태그한 이미지 URI 선택 (staging)
- 배포 트리거: 자동(ECR 레지스트리를 모니터링하여 이미지 푸시에 서비스의 새 버전을 배포)
- ECR 엑세스 역할: 새 서비스 역할 생성
- 서비스 이름: picake-order-backend-{환경}
- 가상 CPU: 1 vCPU
- 가상메모리: 2GB
- 포트: 8080
- 상태확인 프로토콜: HTTP (코드상에 작성되어 있어야함)
- 상태확인 경로: /health (코드상에 작성되어 있어야함)
- AWS KMS키: AWS 소유 키 사용
- 수신 네트워크 트래픽: 퍼블릭 엔드포인트
- 발신 네트워크 트래픽: 사용자 지정 VPC(RDS가 프라이빗 서브넷이면 반드시 VPC 커넥터로 붙여야 DB에 접근 가능)
  - 새 VPC 커넥터 추가
    - VPC 커넥터 이름: picake-backend-{환경}-connector
    - VPC: (위 6번에 작업한 것)(apprunner-staging-sg) vpc-00000 형태
    - 서브넷: (위 6번에 작업한 것)(apprunner-staging-sg) subnet-00000 형태
    - 보안 그룹: (위 6번에 작업한 것)(apprunner-staging-sg) sg-00000 형태

#### 8. App Runner env 환경 변수 설정 (자세한 사항은 환경변수 - 가이드.md 참고)

1. aws > secrets manager > 생성 > 다른 유형의 보안 암호 > 키/값 입력 > 생성 > 보안 암호 ARN복사
2. aws > IAM > 역할 > 생성 > 신뢰할수 있는 엔티티 선택 > 코드직접입력(AI활용) > 권한 apprunner관련 모두 + SecretsManagerReadWrite 정책 추가 > 생성
3. aws > app runner > 구성 > 편집 > 환경 변수 추가 > 환경변수이름: "SECRETS_ARN", 환경변수값: 보안 암호 ARN복사 > (보안) 2번에서 생성한 인스턴스 역할 추가
4. main.ts에서 loadSecretsFromEnv 함수 추가

---

### 시나리오 1: Dockerfile 또는 코드 일부 수정 → 다시 배포할 때

(1) Dockerfile / 코드 수정
↓
(2) 로컬에서 docker build & push (이미지 생성) → AWS ECR (이미지 저장소)
2-1. 위 4,5 번 명령어 실행
↓
(3) App Runner 서비스 → ECR 이미지 감시 → 자동 또는 수동으로 새 이미지 배포
