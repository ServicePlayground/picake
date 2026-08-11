import { BadRequestException } from "@nestjs/common";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { ORDER_ERROR_MESSAGES } from "@apps/backend/modules/order/constants/order.constants";

const MAX_RETRIES = 10;

/** 오늘 날짜 기준 주문 번호 문자열 생성 (예: ORD-20240101-001) */
export function formatOrderNumber(todayOrderCount: number, attempt: number): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const sequence = String(todayOrderCount + 1 + attempt).padStart(3, "0");
  return `ORD-${dateStr}-${sequence}`;
}

/** 오늘 생성된 주문 수 조회를 위한 UTC 하루 범위 */
export function getTodayUtcRange(): { startOfDay: Date; endOfDay: Date } {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setUTCHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
}

/**
 * 주문 번호 중복(P2002) 시 재시도하며 주문을 생성합니다.
 *
 * 콜백은 생성된 주문 번호를 받아 실제 주문 생성 트랜잭션을 수행합니다.
 * 주문 번호 유니크 제약 충돌만 재시도하고, 다른 에러는 그대로 전파합니다.
 */
export async function generateUniqueOrderNumber<T>(
  createWithOrderNumber: (orderNumber: string) => Promise<T>,
  countTodayOrders?: () => Promise<number>,
): Promise<T> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const todayCount = countTodayOrders ? await countTodayOrders() : 0;
    const orderNumber = formatOrderNumber(todayCount, attempt);

    try {
      return await createWithOrderNumber(orderNumber);
    } catch (error: any) {
      if (error?.code === "P2002" && isOrderNumberConflict(error)) {
        LoggerUtil.log(`주문 생성 재시도: 주문 번호 중복 - attempt: ${attempt + 1}/${MAX_RETRIES}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        continue;
      }
      throw error;
    }
  }

  LoggerUtil.log(`주문 생성 최종 실패: 주문 번호 재시도 횟수 초과 - maxRetries: ${MAX_RETRIES}`);
  throw new BadRequestException(ORDER_ERROR_MESSAGES.ORDER_CREATE_FAILED);
}

function isOrderNumberConflict(error: any): boolean {
  const rawTarget = error?.meta?.target;
  if (!rawTarget) return true;
  const targetText = Array.isArray(rawTarget) ? rawTarget.join(",") : String(rawTarget);
  return targetText.includes("order_number") || targetText.includes("orderNumber");
}
