import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-admin/common/components/cards/Card";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import {
  LIST_CARD,
  LIST_CARD_TITLE,
  LIST_ITEM_BOX,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import type { AdminStatisticsStatusCountDto } from "@/apps/web-admin/features/statistics/types/statistics.dto";

interface StatisticsStatusCountCardProps {
  title: string;
  description?: string;
  /** 상태별 카운트 (건수가 있는 상태만 내려옴) */
  items: AdminStatisticsStatusCountDto[];
  /** 상태 enum 값 → 한글 라벨 */
  labels: Record<string, string>;
  emptyMessage?: string;
}

/** 상태별 건수 카드 (주문 상태·입점 요청·판매자 검증 등 공용) */
export const StatisticsStatusCountCard: React.FC<StatisticsStatusCountCardProps> = ({
  title,
  description,
  items,
  labels,
  emptyMessage = "데이터가 없습니다.",
}) => {
  return (
    <Card className={LIST_CARD}>
      <CardHeader>
        <CardTitle className={LIST_CARD_TITLE}>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState message={emptyMessage} className="py-6" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.status}
                className={`${LIST_ITEM_BOX} flex items-center justify-between`}
              >
                <span className="text-sm text-muted-foreground">
                  {labels[item.status] ?? item.status}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {item.count.toLocaleString()}건
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
