/** salePrice < originalPrice 이면 할인 중 */
export function isProductOnSale(originalPrice: number, salePrice: number): boolean {
  return salePrice < originalPrice;
}

/** 할인율(0~100). 할인 없으면 null */
export function getProductDiscountRate(originalPrice: number, salePrice: number): number | null {
  if (!isProductOnSale(originalPrice, salePrice)) {
    return null;
  }

  return Math.round((1 - salePrice / originalPrice) * 100);
}
