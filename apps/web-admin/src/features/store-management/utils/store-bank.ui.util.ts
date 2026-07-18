/** 백엔드 StoreBankName enum → 한국어 은행명 */
const BANK_NAME_LABEL: Record<string, string> = {
  NH_NONGHYUP: "NH농협",
  KAKAO_BANK: "카카오뱅크",
  KB_KOOKMIN: "KB국민",
  TOSS_BANK: "토스뱅크",
  SHINHAN: "신한",
  WOORI: "우리",
  IBK: "IBK기업",
  HANA: "하나",
  SAEMAEUL: "새마을",
  BUSAN: "부산",
  IM_BANK_DAEGU: "iM뱅크(대구)",
  K_BANK: "케이뱅크",
  SINHYEOP: "신협",
  POST_OFFICE: "우체국",
  SC_JEIL: "SC제일",
  KYONGNAM: "경남",
  GWANGJU: "광주",
  SUHYUP: "수협",
  JEONBUK: "전북",
  SAVINGS_BANK: "저축은행",
  JEJU: "제주",
  CITI: "씨티",
  KDB: "KDB산업",
};

export function getStoreBankLabel(bankName: string | null | undefined): string {
  if (!bankName) return "-";
  return BANK_NAME_LABEL[bankName] ?? bankName;
}
