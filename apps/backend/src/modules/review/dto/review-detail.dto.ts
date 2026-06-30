import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SWAGGER_EXAMPLES } from "@apps/backend/modules/product/constants/product.constants";
import { OrderResponseDto } from "@apps/backend/modules/order/dto/order-detail.dto";

/**
 * 후기 응답 DTO
 */
export class ReviewResponseDto {
  @ApiProperty({
    description: "후기 ID",
    example: "review_123456789",
  })
  id: string;

  @ApiProperty({
    description: "상품 ID",
    example: SWAGGER_EXAMPLES.PRODUCT_DATA.id,
  })
  productId: string;

  @ApiProperty({
    description: "스토어 ID",
    example: "store_123456789",
  })
  storeId: string;

  @ApiProperty({
    description: "스토어명",
    example: "달달한 케이크집",
  })
  storeName: string;

  @ApiProperty({
    description: "사용자 ID",
    example: "user_123456789",
  })
  userId: string;

  @ApiProperty({
    description:
      "연결된 주문 ID (DB `product_reviews.order_id`). 마이페이지에서 주문 기준으로 작성한 후기만 값이 있고, 시드·기존 후기 등은 null",
    example: "QXZw02vBqVXNQ29c4w9n9ZdG",
    nullable: true,
  })
  orderId: string | null;

  @ApiProperty({
    description: "별점 (0.0 ~ 5.0)",
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    description: "후기 내용",
    example: "정말 맛있었어요! 다음에도 주문할게요.",
  })
  content: string;

  @ApiProperty({
    description: "후기 이미지 URL 목록",
    type: [String],
    example: ["https://example.com/review-image1.jpg", "https://example.com/review-image2.jpg"],
  })
  imageUrls: string[];

  @ApiProperty({
    description: "사용자 닉네임",
    example: "김철수_739",
  })
  userNickname: string | null;

  @ApiProperty({
    description: "사용자 프로필 이미지 URL",
    example: "https://example.com/profile/kimcs.jpg",
    nullable: true,
  })
  userProfileImageUrl: string | null;

  @ApiProperty({
    description: "생성일시",
    example: new Date("2024-01-20T14:25:00.000Z"),
  })
  createdAt: Date;

  @ApiProperty({
    description: "수정일시",
    example: new Date("2024-01-20T14:25:00.000Z"),
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description:
      "연결된 주문 내역 전체(주문 항목·픽업 정보·상태 등). 주문과 연결된 후기만 값이 있고, 시드·기존 후기는 null",
    type: () => OrderResponseDto,
    nullable: true,
  })
  order: OrderResponseDto | null;
}

/**
 * 마이페이지 내 후기 응답 DTO
 * `order` 연동과 함께 목록 UI용 상품 요약 필드를 제공합니다.
 */
export class MyReviewResponseDto extends ReviewResponseDto {
  @ApiProperty({
    description:
      "상품명. 연결 주문이 있으면 주문 시점 스냅샷(`order.productName`), 없으면 현재 상품명",
    example: "해피퍼피 생일케이크",
  })
  productName: string;

  @ApiProperty({
    description:
      "상품 가격. 연결 주문이 있으면 주문 결제액(`order.totalPrice`), 없으면 현재 상품 판매가",
    example: 35000,
  })
  productPrice: number;

  @ApiProperty({
    description:
      "상품 대표 이미지 URL. 연결 주문이 있으면 주문 시점 이미지, 없으면 현재 상품 대표 이미지",
    example: "https://example.com/product-image.jpg",
    nullable: true,
  })
  productImageUrl: string | null;
}
