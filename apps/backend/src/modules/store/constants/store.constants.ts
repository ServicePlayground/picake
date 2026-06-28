/**
 * prisma 중복 방지
 */
// 정산 계좌 은행
import { StoreBankName } from "@apps/backend/infra/database/prisma/generated/client";
export { StoreBankName };

export const STORE_ERROR_MESSAGES = {
  BUSINESS_REGISTRATION_NUMBER_MISMATCH:
    "1단계(사업자등록번호 진위확인)와 2단계(통신판매사업자 등록상세 조회)의 사업자등록번호가 일치하지 않습니다.",
  STORE_ALREADY_EXISTS_WITH_SAME_BUSINESS_INFO:
    "같은 사업자등록번호와 인허가관리번호(통신판매사업자 신고번호) 조합으로 이미 스토어가 존재합니다.",
  NOT_FOUND: "스토어를 찾을 수 없습니다.",
  FORBIDDEN: "스토어를 수정할 권한이 없습니다.",
  LIKE_ALREADY_EXISTS: "이미 좋아요한 스토어입니다.",
  LIKE_NOT_FOUND: "좋아요한 스토어가 아닙니다.",
  BUSINESS_CALENDAR_STANDARD_TIME_ORDER: "표준 영업 시작 시각은 종료 시각보다 이전이어야 합니다.",
  BUSINESS_CALENDAR_OVERRIDE_OPEN_REQUIRES_TIMES:
    "날짜별 설정에서 영업으로 둔 경우 시작·종료 시각을 모두 입력해야 합니다.",
  BUSINESS_CALENDAR_OVERRIDE_TIME_ORDER:
    "날짜별 영업의 시작 시각은 종료 시각보다 이전이어야 합니다.",
  BUSINESS_CALENDAR_ORDER_CONFLICT:
    "진행 중인 예약과 영업 설정이 맞지 않아 저장할 수 없습니다.",
  PICKUP_FILTER_DATE_PERIOD_PAIR:
    "pickupFilterDate(YYYY-MM-DD)와 pickupFilterPeriod는 함께 생략하거나 함께 지정해야 합니다.",
} as const;

export const STORE_SUCCESS_MESSAGES = {
  CREATION_SUCCESS: "스토어가 생성되었습니다.",
  LIKE_ADDED: "스토어에 좋아요를 추가했습니다.",
  LIKE_REMOVED: "스토어 좋아요를 취소했습니다.",
} as const;

/**
 * 스토어 목록 정렬 enum
 */
export enum StoreSortBy {
  LATEST = "latest", // 최신순(생성일 내림차순)
  POPULAR = "popular", // 인기순(좋아요 수 내림차순)
  RATING_AVG = "rating_avg", // 별점순(스토어 소속 상품 리뷰 평균 별점 내림차순)
  DISTANCE = "distance", // 거리순(스토어 좌표 기준, 클라이언트 위도·경도 필요)
}

/** 지도·목록 픽업 일시 필터(웹 사용자 앱 MapPickupFilter와 동일 값) */
export enum StoreMapPickupPeriodKind {
  MORNING = "morning",
  AFTERNOON = "afternoon",
  FULLDAY = "fullday",
}

export const SWAGGER_EXAMPLES = {
  ID: "QXZw02vBqVXNQ29c4w9n9ZdG",
  NAME: "Picake",
  DESCRIPTION: "맛있는 케이크를 판매하는 스토어입니다.",
  CREATED_AT: new Date("2024-01-01T00:00:00.000Z"),
  // 주소/위치 정보
  ADDRESS: "서울특별시 강남구 역삼동 456-789",
  ROAD_ADDRESS: "서울특별시 강남구 테헤란로 123",
  DETAIL_ADDRESS: "101호",
  ZONECODE: "06234",
  LATITUDE: 37.5665,
  LONGITUDE: 126.978,
  BANK_ACCOUNT_NUMBER: "110-302-1234567",
  BANK_NAME: StoreBankName.KB_KOOKMIN,
  ACCOUNT_HOLDER_NAME: "홍길동",
  KAKAO_CHANNEL_ID: "Picake_channel",
  INSTAGRAM_ID: "Picake_official",
  PHONE_NUMBER: "010-1234-5678",
  REFUND_CANCELLATION_POLICY: {
    rules: [
      { daysBeforePickup: 7, refundDescription: "결제액의 50% 환불" },
      { daysBeforePickup: 3, refundDescription: "결제액의 30% 환불" },
    ],
  },
};

/**
 * 시/도(1depth) 및 구/군(2depth) JSON 구조
 * - 프론트: label 기준으로 메뉴 노출
 * - 백엔드: searchKeywords 기준으로 주소 매칭
 */
export const STORE_REGION_DEPTHS = [
  {
    depth1: { label: "전국", searchKeywords: ["전지역"] },
    depth2: [{ label: "전지역", searchKeywords: ["전지역"] }],
  },
  {
    depth1: { label: "서울", searchKeywords: ["서울"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "강남구", searchKeywords: ["강남구"] },
      { label: "강동구", searchKeywords: ["강동구"] },
      { label: "강북구", searchKeywords: ["강북구"] },
      { label: "강서구", searchKeywords: ["강서구"] },
      { label: "관악구", searchKeywords: ["관악구"] },
      { label: "광진구", searchKeywords: ["광진구"] },
      { label: "구로구", searchKeywords: ["구로구"] },
      { label: "금천구", searchKeywords: ["금천구"] },
      { label: "노원구", searchKeywords: ["노원구"] },
      { label: "도봉구", searchKeywords: ["도봉구"] },
      { label: "동대문구", searchKeywords: ["동대문구"] },
      { label: "동작구", searchKeywords: ["동작구"] },
      { label: "마포구", searchKeywords: ["마포구"] },
      { label: "서대문구", searchKeywords: ["서대문구"] },
      { label: "서초구", searchKeywords: ["서초구"] },
      { label: "성동구", searchKeywords: ["성동구"] },
      { label: "성북구", searchKeywords: ["성북구"] },
      { label: "송파구", searchKeywords: ["송파구"] },
      { label: "양천구", searchKeywords: ["양천구"] },
      { label: "영등포구", searchKeywords: ["영등포구"] },
      { label: "용산구", searchKeywords: ["용산구"] },
      { label: "은평구", searchKeywords: ["은평구"] },
      { label: "종로구", searchKeywords: ["종로구"] },
      { label: "중구", searchKeywords: ["중구"] },
      { label: "중랑구", searchKeywords: ["중랑구"] },
    ],
  },
  {
    depth1: { label: "부산", searchKeywords: ["부산"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "강서구", searchKeywords: ["강서구"] },
      { label: "금정구", searchKeywords: ["금정구"] },
      { label: "기장군", searchKeywords: ["기장군"] },
      { label: "남구", searchKeywords: ["남구"] },
      { label: "동구", searchKeywords: ["동구"] },
      { label: "동래구", searchKeywords: ["동래구"] },
      { label: "부산진구", searchKeywords: ["부산진구"] },
      { label: "북구", searchKeywords: ["북구"] },
      { label: "사상구", searchKeywords: ["사상구"] },
      { label: "사하구", searchKeywords: ["사하구"] },
      { label: "서구", searchKeywords: ["서구"] },
      { label: "수영구", searchKeywords: ["수영구"] },
      { label: "연제구", searchKeywords: ["연제구"] },
      { label: "영도구", searchKeywords: ["영도구"] },
      { label: "중구", searchKeywords: ["중구"] },
      { label: "해운대구", searchKeywords: ["해운대구"] },
    ],
  },
  {
    depth1: { label: "대구", searchKeywords: ["대구"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "남구", searchKeywords: ["남구"] },
      { label: "달서구", searchKeywords: ["달서구"] },
      { label: "동구", searchKeywords: ["동구"] },
      { label: "북구", searchKeywords: ["북구"] },
      { label: "서구", searchKeywords: ["서구"] },
      { label: "수성구", searchKeywords: ["수성구"] },
      { label: "중구", searchKeywords: ["중구"] },
      { label: "달성군", searchKeywords: ["달성군"] },
      { label: "군위군", searchKeywords: ["군위군"] },
    ],
  },
  {
    depth1: { label: "인천", searchKeywords: ["인천"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "계양구", searchKeywords: ["계양구"] },
      { label: "남동구", searchKeywords: ["남동구"] },
      { label: "동구", searchKeywords: ["동구"] },
      { label: "미추홀구", searchKeywords: ["미추홀구"] },
      { label: "부평구", searchKeywords: ["부평구"] },
      { label: "서구", searchKeywords: ["서구"] },
      { label: "연수구", searchKeywords: ["연수구"] },
      { label: "중구", searchKeywords: ["중구"] },
      { label: "강화·옹진", searchKeywords: ["강화군", "옹진군"] },
    ],
  },
  {
    depth1: { label: "광주", searchKeywords: ["광주"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "광산구", searchKeywords: ["광산구"] },
      { label: "남구", searchKeywords: ["남구"] },
      { label: "동구", searchKeywords: ["동구"] },
      { label: "북구", searchKeywords: ["북구"] },
      { label: "서구", searchKeywords: ["서구"] },
    ],
  },
  {
    depth1: { label: "대전", searchKeywords: ["대전"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "대덕구", searchKeywords: ["대덕구"] },
      { label: "동구", searchKeywords: ["동구"] },
      { label: "서구", searchKeywords: ["서구"] },
      { label: "유성구", searchKeywords: ["유성구"] },
      { label: "중구", searchKeywords: ["중구"] },
    ],
  },
  {
    depth1: { label: "울산", searchKeywords: ["울산"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "남구", searchKeywords: ["남구"] },
      { label: "동구", searchKeywords: ["동구"] },
      { label: "북구", searchKeywords: ["북구"] },
      { label: "중구", searchKeywords: ["중구"] },
      { label: "울주군", searchKeywords: ["울주군"] },
    ],
  },
  {
    depth1: { label: "세종", searchKeywords: ["세종특별자치시"] },
    depth2: [{ label: "전지역", searchKeywords: ["전지역"] }],
  },
  {
    depth1: { label: "경기", searchKeywords: ["경기"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "수원", searchKeywords: ["수원시"] },
      { label: "성남", searchKeywords: ["성남시"] },
      { label: "고양", searchKeywords: ["고양시"] },
      { label: "용인", searchKeywords: ["용인시"] },
      { label: "부천", searchKeywords: ["부천시"] },
      { label: "안산", searchKeywords: ["안산시"] },
      { label: "남양주", searchKeywords: ["남양주시"] },
      { label: "화성", searchKeywords: ["화성시"] },
      { label: "평택", searchKeywords: ["평택시"] },
      { label: "안양", searchKeywords: ["안양시"] },
      { label: "시흥", searchKeywords: ["시흥시"] },
      { label: "파주", searchKeywords: ["파주시"] },
      { label: "김포", searchKeywords: ["김포시"] },
      { label: "의정부", searchKeywords: ["의정부시"] },
      { label: "광주", searchKeywords: ["광주시"] },
      { label: "하남", searchKeywords: ["하남시"] },
      { label: "광명", searchKeywords: ["광명시"] },
      { label: "군포", searchKeywords: ["군포시"] },
      { label: "오산", searchKeywords: ["오산시"] },
      { label: "이천", searchKeywords: ["이천시"] },
      { label: "안성", searchKeywords: ["안성시"] },
      { label: "양주", searchKeywords: ["양주시"] },
      { label: "구리", searchKeywords: ["구리시"] },
      { label: "포천", searchKeywords: ["포천시"] },
      { label: "여주", searchKeywords: ["여주시"] },
      { label: "과천·의왕", searchKeywords: ["과천시", "의왕시"] },
      { label: "연천·동두천", searchKeywords: ["연천군", "동두천시"] },
      { label: "가평·양평", searchKeywords: ["가평군", "양평군"] },
    ],
  },
  {
    depth1: { label: "강원", searchKeywords: ["강원특별자치도"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "춘천", searchKeywords: ["춘천시"] },
      { label: "원주", searchKeywords: ["원주시"] },
      { label: "강릉", searchKeywords: ["강릉시"] },
      { label: "동해", searchKeywords: ["동해시"] },
      { label: "홍천", searchKeywords: ["홍천군"] },
      { label: "태백·삼척", searchKeywords: ["태백시", "삼척시"] },
      { label: "속초·양양", searchKeywords: ["속초시", "양양군"] },
      { label: "평창·횡성", searchKeywords: ["평창군", "횡성군"] },
      { label: "영월·정선", searchKeywords: ["영월군", "정선군"] },
      { label: "화천·양구·철원", searchKeywords: ["화천군", "양구군", "철원군"] },
      { label: "인제·고성", searchKeywords: ["인제군", "고성군"] },
    ],
  },
  {
    depth1: { label: "충북", searchKeywords: ["충북"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "청주", searchKeywords: ["청주시"] },
      { label: "충주", searchKeywords: ["충주시"] },
      { label: "제천", searchKeywords: ["제천시"] },
      { label: "진천·음성", searchKeywords: ["진천군", "음성군"] },
      { label: "보은·옥천·영동", searchKeywords: ["보은군", "옥천군", "영동군"] },
      { label: "괴산·증평·단양", searchKeywords: ["괴산군", "증평군", "단양군"] },
    ],
  },
  {
    depth1: { label: "충남", searchKeywords: ["충남"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "천안", searchKeywords: ["천안시"] },
      { label: "아산", searchKeywords: ["아산시"] },
      { label: "서산", searchKeywords: ["서산시"] },
      { label: "당진", searchKeywords: ["당진시"] },
      { label: "공주", searchKeywords: ["공주시"] },
      { label: "보령", searchKeywords: ["보령시"] },
      { label: "논산", searchKeywords: ["논산시"] },
      { label: "금산", searchKeywords: ["금산군"] },
      { label: "태안", searchKeywords: ["태안군"] },
      { label: "예산·홍성", searchKeywords: ["예산군", "홍성군"] },
      { label: "부여·서천", searchKeywords: ["부여군", "서천군"] },
      { label: "청양·계룡", searchKeywords: ["청양군", "계룡시"] },
    ],
  },
  {
    depth1: { label: "전북", searchKeywords: ["전북특별자치도"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "전주", searchKeywords: ["전주시"] },
      { label: "군산", searchKeywords: ["군산시"] },
      { label: "익산", searchKeywords: ["익산시"] },
      { label: "정읍", searchKeywords: ["정읍시"] },
      { label: "남원", searchKeywords: ["남원시"] },
      { label: "김제", searchKeywords: ["김제시"] },
      { label: "완주", searchKeywords: ["완주군"] },
      { label: "진안·무주·장수", searchKeywords: ["진안군", "무주군", "장수군"] },
      { label: "임실·순창", searchKeywords: ["임실군", "순창군"] },
      { label: "고창·부안", searchKeywords: ["고창군", "부안군"] },
    ],
  },
  {
    depth1: { label: "전남", searchKeywords: ["전남"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "여수", searchKeywords: ["여수시"] },
      { label: "순천", searchKeywords: ["순천시"] },
      { label: "목포", searchKeywords: ["목포시"] },
      { label: "광양", searchKeywords: ["광양시"] },
      { label: "나주", searchKeywords: ["나주시"] },
      { label: "화순", searchKeywords: ["화순군"] },
      { label: "해남", searchKeywords: ["해남군"] },
      { label: "완도", searchKeywords: ["완도군"] },
      { label: "담양·장성", searchKeywords: ["담양군", "장성군"] },
      { label: "영광·함평", searchKeywords: ["영광군", "함평군"] },
      { label: "무안·영암", searchKeywords: ["무안군", "영암군"] },
      { label: "곡성·구례", searchKeywords: ["곡성군", "구례군"] },
      { label: "고흥·보성", searchKeywords: ["고흥군", "보성군"] },
      { label: "장흥·강진", searchKeywords: ["장흥군", "강진군"] },
      { label: "진도·신안", searchKeywords: ["진도군", "신안군"] },
    ],
  },
  {
    depth1: { label: "경북", searchKeywords: ["경북"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "포항", searchKeywords: ["포항시"] },
      { label: "경주", searchKeywords: ["경주시"] },
      { label: "구미", searchKeywords: ["구미시"] },
      { label: "안동", searchKeywords: ["안동시"] },
      { label: "경산", searchKeywords: ["경산시"] },
      { label: "김천", searchKeywords: ["김천시"] },
      { label: "영주", searchKeywords: ["영주시"] },
      { label: "영천", searchKeywords: ["영천시"] },
      { label: "상주", searchKeywords: ["상주시"] },
      { label: "문경", searchKeywords: ["문경시"] },
      { label: "칠곡", searchKeywords: ["칠곡군"] },
      { label: "울릉", searchKeywords: ["울릉군"] },
      { label: "의성·예천", searchKeywords: ["의성군", "예천군"] },
      { label: "영덕·울진", searchKeywords: ["영덕군", "울진군"] },
      { label: "청송·영양·봉화", searchKeywords: ["청송군", "영양군", "봉화군"] },
      { label: "청도·고령·성주", searchKeywords: ["청도군", "고령군", "성주군"] },
    ],
  },
  {
    depth1: { label: "경남", searchKeywords: ["경남"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "창원", searchKeywords: ["창원시"] },
      { label: "김해", searchKeywords: ["김해시"] },
      { label: "양산", searchKeywords: ["양산시"] },
      { label: "진주", searchKeywords: ["진주시"] },
      { label: "거제", searchKeywords: ["거제시"] },
      { label: "통영", searchKeywords: ["통영시"] },
      { label: "사천", searchKeywords: ["사천시"] },
      { label: "밀양", searchKeywords: ["밀양시"] },
      { label: "함안·창녕", searchKeywords: ["함안군", "창녕군"] },
      { label: "의령·고성", searchKeywords: ["의령군", "고성군"] },
      { label: "남해·하동", searchKeywords: ["남해군", "하동군"] },
      { label: "산청·함양", searchKeywords: ["산청군", "함양군"] },
      { label: "거창·합천", searchKeywords: ["거창군", "합천군"] },
    ],
  },
  {
    depth1: { label: "제주", searchKeywords: ["제주특별자치도"] },
    depth2: [
      { label: "전지역", searchKeywords: ["전지역"] },
      { label: "제주시", searchKeywords: ["제주시"] },
      { label: "서귀포시", searchKeywords: ["서귀포시"] },
    ],
  },
] as const;
