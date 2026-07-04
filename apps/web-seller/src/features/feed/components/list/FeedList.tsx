import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import DOMPurify from "isomorphic-dompurify";
import he from "he";
import type { FeedResponseDto } from "@/apps/web-seller/features/feed/types/feed.dto";
import { ROUTES } from "@/apps/web-seller/common/constants/paths.constant";
import { EmptyState } from "@/apps/web-seller/common/components/fallbacks/EmptyState";

function getContentPreview(content: string, maxLength = 80): string {
  const sanitized = DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  const textContent = he.decode(sanitized.replace(/&nbsp;/g, " ")).trim();
  return textContent.length > maxLength ? `${textContent.substring(0, maxLength)}...` : textContent;
}

interface FeedListProps {
  feeds: FeedResponseDto[];
}

export const FeedList: React.FC<FeedListProps> = ({ feeds }) => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  if (feeds.length === 0) {
    return <EmptyState message="등록된 피드가 없습니다." />;
  }

  const handleFeedClick = (feedId: string) => {
    if (storeId) {
      navigate(ROUTES.STORE_DETAIL_FEED_DETAIL(storeId, feedId));
    }
  };

  return (
    <div className="space-y-2">
      {feeds.map((feed) => {
        const createdAt =
          feed.createdAt instanceof Date ? feed.createdAt : new Date(feed.createdAt);
        const thumbnailUrl = feed.imageUrls?.[0] ?? feed.storeLogoImageUrl;

        return (
          <div
            key={feed.id}
            onClick={() => handleFeedClick(feed.id)}
            className="group flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md"
          >
            {/* 피드 썸네일 (피드 이미지 → 스토어 로고 → 플레이스홀더) */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="피드"
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            {/* 피드 정보 */}
            <div className="flex flex-1 min-w-0 flex-col justify-center">
              <div className="mb-1 text-sm font-semibold">{feed.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">
                {getContentPreview(feed.content)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {createdAt.toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
