export const FEED_ERROR_MESSAGES = {
  FEED_NOT_FOUND: "피드를 찾을 수 없습니다.",
  FEED_FORBIDDEN: "피드를 수정할 권한이 없습니다.",
  STORE_NOT_FOUND: "스토어를 찾을 수 없습니다.",
} as const;

export const FEED_SUCCESS_MESSAGES = {
  FEED_CREATED: "피드가 생성되었습니다.",
  FEED_UPDATED: "피드가 수정되었습니다.",
  FEED_DELETED: "피드가 삭제되었습니다.",
} as const;

/**
 * 피드 이미지 최대 등록 개수
 */
export const FEED_MAX_IMAGES = 5;

export const SWAGGER_EXAMPLES = {
  TITLE: "신제품 출시 안내",
  CONTENT: "새로운 케이크가 출시되었습니다!",
  IMAGE_URLS: ["https://example.com/feed-image1.jpg", "https://example.com/feed-image2.jpg"],
};
