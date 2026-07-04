# AWS Route53(도메인) - 가이드

# 도메인 구조

- 루트 도메인: picakes.com

- 상용 백엔드 사용자(App Runner): api.picakes.com
- 검증 백엔드 사용자(App Runner): api-staging.picakes.com
- 상용 정적 파일: static.picakes.com
- 검증 정적 파일: static-staging.picakes.com
- 상용 업로드 전용 버킷: upload.picakes.com
- 검증 업로드 전용 버킷: upload-staging.picakes.com
- 상용 프론트엔드 사용자: www.picakes.com
- 검증 프론트엔드 사용자: staging.picakes.com
- 상용 프론트엔드 판매자: seller.picakes.com
- 검증 프론트엔드 판매자: staging-seller.picakes.com
- 상용 프론트엔드 관리자: admin.picakes.com
- 검증 프론트엔드 관리자: staging-admin.picakes.com

# Hosted zone

- “도메인 안에서 어떤 주소(api.picakes.com, www.picakes.com 등)가 어디(IP 또는 다른 서비스)에 연결될지”를 정의하는 공간이다.
- 각각의 이름이 DNS 레코드(Record) 로 저장되어 있는 영역이 바로 Hosted Zone이야.
- AWS에서는 picakes.com 도메인을 등록하면 자동으로 picakes.com용 Hosted Zone을 하나 만들어줌.
- 여기 안에서 A, CNAME, MX 등의 DNS 레코드를 추가/수정/삭제함.

# NS (Name Server) 레코드란?

- “이 도메인을 실제로 관리하는 서버의 주소”를 가리킴.
  예시: ns-123.awsdns-01.com.
- 외부 도메인 등록기관(가비아, GoDaddy 등)에서 도메인을 샀다면, 거기서 이 NS 주소로 변경해야 Route 53 Hosted Zone의 레코드들이 적용돼.
- 하지만 넌 AWS에서 직접 도메인을 샀으니까, 이미 이 NS 값으로 자동 설정되어 있음.

# SOA (Start of Authority) 레코드란?

- “이 도메인의 DNS 정보를 누가 최종 관리하고 있는지” 표시하는 관리용 레코드.

# 루트 도메인

- picakes.com, 루트 도메인만 구입하면 서브 도메인을 모두 사용할 수 있음

# 서브 도메인

- staging.picakes.com, prod.picakes.com 형태

# DNS(Domain Name System)

- 도메인 이름을 해당 IP 주소로 찾아가는 서버.

# Route53 레코드

- 네임 서버(NS)를 실제 서버(IP 주소)로 연결.

# Route53 CNAME레코드

- 현재 도메인은 다른 도메인으로 연결된다. CNAME은 루트 도메인(picakes.com)에는 사용하지 못하고 서브 도메인(www.picakes.com, prod.picakes.com, api.picakes.com, api-staging.picakes.com)에 설정해야 한다.

# Route53 ALIAS레코드

- 현재 도메인은 AWS리소스(xxxx.awsapprunner.com)로 직접 연결된다. 루트 도메인(picakes.com)에도 사용 가능하다.

# AWS Route53에서 직접 루트도메인 구매시 장점 (“루트도메인 → DNS → 서브도메인 연결 → SSL → 서버 연결” 자동화) (다른 사이트에서도 도메인 구매 가능하다.)

- 도메인 소유자: AWS Route53
- DNS 서버 운영: AWS Route53에서 DNS서버 자동 생성되고 운영함
- 서브도메인 생성: Route53에서 쉽게 생성 가능
- SSL 인증서 & AWS Certificate Manager(ACM) 연동 자동화: HTTPS 연동을 위해 SSL 인증서 자동 발급 · ACM이 자동 갱신 (CloudFront, App Runner와 연동)
- 도메인 등록 & 갱신 자동화: 만료되기 전에 자동 갱신, 카드로 자동결제
- 레코드 관리: IP 바뀌거나 백엔드 서버 리전이 바뀌어도 클릭 몇 번으로 수정 가능

# ----------------------------------------------------------------------------------------------------------------------------------

# 1. AWS Route53에서 루트도메인 직접 구매

1. AWS > Route53 > 도메인 등록 > 사용 가능한 도메인 검색 후 결제

# 2. App Runner 커스틈 도메인 연동

1. AWS > App Runner > 사용자 지정 도메인 탭 > 도메인 링크 연결
   - Amazon Route 53, api-staging.picakes.com , CNAME

# 3. 결과 확인

1. AWS → Route 53 → 호스팅 영역 > picakes.com 확인
   - Registrar가 Route 53이면 기본으로 NS, SOA 레코드가 생김. 다른 등록기관이면 NS를 그쪽 콘솔에 복붙해야 하지만, 지금은 Route 53에서 산 거니 패스
   - 위 1번 커스텀 도메인 연동시, SSL 인증서 발급도 자동으로 된다. (레코드 CNAME으로 3개가 자동으로 생성된다.)

## App Runner가 커스텀 도메인/레코드를 등록하면 자동으로 이렇게 진행돼: App Runner → ACM(인증서 관리자) → Route 53 CNAME 레코드 조회 → 검증 → 인증서 발급 → 상태 Active

# 4. 프론트엔드 Vercel 도메인 연동

1. Vercel > 도메인 > Add Domain > 생성 후 > Value 확인
2. AWS > Route53 > 호스팅 영역 > picakes.com > 레코드 생성 > (Type: CNAME, Value: vercel-dns.com) 또는 (루트도메인 picakes.com인 경우 Type: A, Value: x.x.x.x)
