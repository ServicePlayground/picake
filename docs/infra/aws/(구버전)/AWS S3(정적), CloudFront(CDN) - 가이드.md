## 일반 파일 저장(이미지/파일 업로드·배포) 목적

### 1. AWS S3 버킷 생성

1. AWS > S3 > 버킷 생성

- 버킷 유형: 범용
- 버킷 이름: picake-uploads-{환경}-apne1
- 객체 소유권: ACL 비활성화됨
- 모든 퍼블릭 액세스 차단
- 버전 관리 OFF
- 기본 암호화 유형: SSE-S3
- 버킷 키: 비활성화

2. 프론트엔드 CORS 설정

2-1. AWS > S3 > 생성한 버킷 클릭 > 권한 탭 > CORS부분 아래 코드 삽입

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "https://staging.picakes.com",
      "https://seller-staging.picakes.com",
      "https://admin-staging.picakes.com"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
    "AllowedHeaders": ["*"], // 전체 허용
    "ExposeHeaders": ["ETag"], // 업로드 후 파일 확인용
    "MaxAgeSeconds": 3000
  }
]
```

3. 백엔드 환경 변수 AWS Secerts Manager에 저장

4. 백엔드에서 @aws-sdk/client-s3 설치 후 파일 업로드 API 구현

### 2. CloudFront 생성

1. AWS > CloudFront > 배포 생성

- 1단계
  - Distribution name: picake-static-staging
  - Distribution type: Single website or app
  - Domain: (생략)
- 2단계
  - Origin type: Amazon S3
  - Origin: browse S3 버튼 클릭 > 해당 버킷 선택(picake-uploads-{환경}-apne1)
  - Origin path: (생략)
  - Settings: 선택되어 있는 상태 유지
- 3단계
  - Web Application Firewall: 보안 보호 비활성화

2. 정책 복사 및 저장
   - 2-1. 생성한 배포 클릭 > origin(원본) 탭 > 해당 origin 선택 후 편집 > 정책 복사 버튼 클릭
   - 2-2. AWS > S3 > picake-uploads-{환경}-apne1 버킷 클릭 > 권한 탭 > 버킷 정책 편집 > CloudFront에서 복사한 정책을 JSON 편집기에 붙여넣기 > 저장

3. (SSL 인증서 요청) AWS > Certificate Manager > 인증서 요청 (4단계까지 완료후 발급될때까지 기다려야함)

- (us-east-1)
- 인증서 유형: 퍼블릭 인증서 요청
- 도메인 이름: static-staging.picakes.com
- 내보내기: 내보내기 비활성화
- 검증 방법: DNS 검증
- 키 알고리즘: RSA 2048

4. (DNS 레코드 생성) AWS > Route53 > 호스팅 영역 > picakes.com > 레코드 생성 > Type: CNAME, 위 3번에서 발급된 값 입력 > 생성

5. (CloudFront에 SSL 인증서 연결) AWS > CloudFront > 생성한 배포 클릭 > 편집

- Alternate domain names (CNAMEs): (항목 추가) static-staging.picakes.com
- Custom SSL certificate: 드롭다운에서 발급된 인증서 선택

6. (커스텀 도메인이 CloudFront Distribution을 가리키도록 설정)
   - 6-2. AWS > CloudFront > 생성한 배포 클릭 > General 탭 > 대체 도메인 이름 아래 "Route domains to CloudFront" 버튼 클릭 > Set up routing automatically 클릭

---

## 요약

### 참고사항

참고: CloudFront는 글로벌 엣지 네트워크 서비스이며, SSL 인증서(ACM)는 CloudFront 용도로는 버지니아 북부(us-east-1) 리전에 발급해야 합니다.

### 현재 구현

- 프론트엔드: 사용자/판매자 웹에서 파일을 선택하면 인증된 요청으로 백엔드에 바로 업로드합니다.
  - 요청: `POST {API_BASE_URL}/v1/user/uploads/file`
  - 헤더/바디: `multipart/form-data` (필드명 `file`), 인증 쿠키 포함
  - 응답: `{ fileUrl: string }` (CloudFront 도메인을 포함한 최종 URL)
- 백엔드: NestJS `FileInterceptor`로 파일을 받고, 서버에서 S3에 업로드합니다.
  - 파일 검증: 크기(최대 10MB), 빈 파일 차단, 허용 확장자/차단 확장자, MIME 타입 및 확장자 일치 검증, 파일명 정규화, 고유 파일명 생성
  - S3 업로드: `PutObject`로 업로드, SSE-S3(AES-256) 적용, 경로 세그먼트별 URL 인코딩
  - URL 결정: `CLOUDFRONT_DOMAIN`이 설정되어 있으면 `https://{cloudfront}/{key}` 반환, 없으면 S3 정적 URL 반환
- 프론트엔드 사용: 받은 `fileUrl`을 그대로 `<img src={fileUrl} />` 등으로 렌더링/저장

참고: 현재 흐름은 "프리사인 URL" 방식이 아니라 "백엔드 경유 업로드" 방식입니다. 따라서 업로드 자체에는 S3 CORS 설정이 필수는 아니며(직접 브라우저→S3 업로드가 아님), 다만 정적 파일을 브라우저가 요청할 때는 CloudFront/S3 정책이 적용됩니다.

### 현재 구현(백엔드 파일 검증 및 정규화 로직)

1. 파일 크기 제한 추가 (DoS 방지)
   FileInterceptor에 10MB 제한 추가
   빈 파일 업로드 차단
2. 파일 타입 검증 추가
   실행 파일 차단: .exe, .bat, .sh, .php, .jsp 등
   허용 파일 타입만 업로드 가능 (이미지, 문서 등)
3. 파일 이름 검증 및 정규화
   경로 탐색 공격 방지 (../../ 제거)
   특수문자 제거/치환
   파일 이름 길이 제한 (255자)
4. 파일 이름 중복 처리
   타임스탬프 + 랜덤 문자열로 고유 파일명 생성
   기존 파일 덮어쓰기 방지
5. MIME 타입 검증 강화
   확장자와 MIME 타입 일치 검증
   허용된 MIME 타입만 허용
6. URL 인코딩 처리
   특수문자 안전 처리
   각 경로 세그먼트 개별 인코딩
7. S3 서버 측 암호화
   업로드 시 SSE-S3(AES-256) 적용

### CloudFront 특징/장점

- 전 세계 엣지 로케이션 캐싱: 낮은 레이턴시와 빠른 응답 속도 제공
- S3를 원본으로 연동: 정적 파일 배포에 최적화, 트래픽 오프로딩
- HTTP/2, Brotli 압축 지원: 전송 효율 향상
- 캐시 무효화(Invalidation) 지원: 변경 파일 신속 반영
- 보안: HTTPS, ACM 기반 커스텀 도메인, AWS WAF/Shield 연계, 서명 URL/쿠키(선택)
- 액세스 제어: OAI/OAC로 S3 버킷을 프라이빗으로 두고 CloudFront만 접근 가능하게 설정 가능
- 지리적 제한(Geo restriction) 및 사용자 정의 헤더/오리진 정책 구성

S3 + CloudFront 조합은 실제 파일 저장(S3)과 글로벌 캐싱/서빙(CloudFront)을 분리하여, 비용 효율적이면서도 빠른 정적 리소스 제공이 가능합니다.
