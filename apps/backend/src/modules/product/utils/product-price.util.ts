import { BadRequestException } from "@nestjs/common";
import { PRODUCT_ERROR_MESSAGES } from "@apps/backend/modules/product/constants/product.constants";

export function validateProductPrices(originalPrice: number, salePrice: number): void {
  if (originalPrice <= 0 || salePrice <= 0) {
    throw new BadRequestException(PRODUCT_ERROR_MESSAGES.PRODUCT_PRICE_INVALID);
  }

  if (salePrice > originalPrice) {
    throw new BadRequestException(PRODUCT_ERROR_MESSAGES.SALE_PRICE_EXCEEDS_ORIGINAL_PRICE);
  }
}

/** 할인율(0~100). salePrice >= originalPrice 이면 null */
export function getProductDiscountRate(originalPrice: number, salePrice: number): number | null {
  if (salePrice >= originalPrice) {
    return null;
  }

  return Math.round((1 - salePrice / originalPrice) * 100);
}
