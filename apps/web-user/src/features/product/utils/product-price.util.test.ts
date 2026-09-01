import { describe, expect, it } from "vitest";

import { getProductDiscountRate, isProductOnSale } from "./product-price.util";

describe("isProductOnSale", () => {
  it("판매가가 정가보다 낮으면 할인 중이다", () => {
    expect(isProductOnSale(10000, 8000)).toBe(true);
  });

  it("판매가와 정가가 같으면 할인이 아니다", () => {
    expect(isProductOnSale(10000, 10000)).toBe(false);
  });

  it("판매가가 정가보다 높으면 할인이 아니다", () => {
    expect(isProductOnSale(10000, 12000)).toBe(false);
  });
});

describe("getProductDiscountRate", () => {
  it("할인 중이 아니면 null을 반환한다", () => {
    expect(getProductDiscountRate(10000, 10000)).toBeNull();
  });

  it("할인율을 반올림한 정수로 반환한다", () => {
    // 10000 -> 8000: 정확히 20%
    expect(getProductDiscountRate(10000, 8000)).toBe(20);
  });

  it("정확히 .5인 할인율은 올림한다 (Math.round 기본 동작)", () => {
    // (1 - 141/200) * 100 = 29.5 -> 반올림 30
    expect(getProductDiscountRate(200, 141)).toBe(30);
  });
});
