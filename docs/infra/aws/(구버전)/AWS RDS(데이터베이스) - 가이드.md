1. AWS RDS 설정

- 데이터베이스 생성 방식: 표준생성
- 엔진옵션: postgresql
- 엔진버전: Postgresql-16.6
- 템플릿: 샌드박스
- 가용성 및 내구성: 단일 AZ DB 인스턴스 배포(인스턴스 1개)
- DB 인스턴스 식별자: {프로젝트명}-{환경}-db
- 마스터 사용자 이름: {프로젝트명}\_admin
- 자격증명관리: AWS Secrets Manager에서 관리
- 암호화 키 선택: 기본값
- DB 인스턴스 클래스: 버스터블 클래스(t 클래스 포함), db.t3.micro
- 스토리지: 범용 SSD(gp3)
- 할당된 스토리지: 20
- 컴퓨팅 리소스: EC2 컴퓨팅 리소스에 연결 안 함
- 네트워크 유형: IPv4
- Virtual Private Cloud(VPC): 기본값
- DB 서브넷 그룹: 기본값
- 퍼블릭 액세스: 아니오
- VPC 보안 그룹(방화벽): (AWS App Runner.md 6번 참고 - 새 VPC 보안 그룹 생성한 db-staging-sg 선택)
- 가용 영역: 기본 설정 없음
- 인증 기관: 기본값
- 데이터베이스 인증 옵션: 암호 인증
- 모니터링: Database Insights - 표준
- Performance Insights 활성화, 7일
- 로그 내보내기: PostgreSQL 로그
- 초기 데이터베이스 이름: picake_staging_db
- DB 파라미터 그룹: 기본값

2. RDS 환경변수 설정
   2-1. AWS Secrets Manager 서비스로 이동
   2-2. {프로젝트명}-{환경}-db 관련 시크릿 찾기
   2-3. 보안 암호 값 > 보안 암호값 검색 > 실제 비밀번호 확인
   2-4. AWS Secrets Manager > App Runner에 해당 하는 환경변수 클릭 > 환경변수 확인 > DATABASE_URL 부분을 형식에 맞게 실제 비밀번호로 교체 (App Runner 런타임 시 주입됨)
   2-5. RDS Secrets Manager 에서 비밀번호 자동교체 해제(비활성화)
