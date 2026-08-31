import { describe, expect, it } from "vitest";

import { SalesStatus } from "@/apps/web-user/features/product/types/product.type";

import { isProductActive, isStockAvailable } from "./orderForm-validator.util";

describe("isProductActive", () => {
  it("판매 상태가 ENABLE이면 활성이다", () => {
    expect(isProductActive(SalesStatus.ENABLE)).toBe(true);
  });

  it("판매 상태가 DISABLE이면 비활성이다", () => {
    expect(isProductActive(SalesStatus.DISABLE)).toBe(false);
  });
});

describe("isStockAvailable", () => {
  it("재고가 주문 수량보다 많으면 충분하다", () => {
    expect(isStockAvailable(10, 3)).toBe(true);
  });

  it("재고와 주문 수량이 같으면 충분하다 (경계값)", () => {
    expect(isStockAvailable(5, 5)).toBe(true);
  });

  it("재고가 주문 수량보다 적으면 부족하다", () => {
    expect(isStockAvailable(2, 3)).toBe(false);
  });

  it("재고가 0이면 주문 수량이 0이어도 부족한 것으로 처리한다", () => {
    expect(isStockAvailable(0, 0)).toBe(false);
  });
});
