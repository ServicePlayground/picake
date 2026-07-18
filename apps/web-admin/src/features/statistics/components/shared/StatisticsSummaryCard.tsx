import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-admin/common/components/cards/Card";
import { LIST_CARD } from "@/apps/web-admin/common/constants/list-typography.constant";

export interface StatisticsSummaryRow {
  label: string;
  value: string;
}

interface StatisticsSummaryCardProps {
  icon: React.ReactNode;
  title: string;
  /** 큰 숫자로 표시할 대표 값 */
  value: string;
  /** 대표 값 아래 보조 지표 행 */
  rows?: StatisticsSummaryRow[];
  /** 보조 지표 대신 표시할 설명 한 줄 */
  footnote?: string;
}

/** 요약 지표 카드 (아이콘 + 타이틀 + 대표 값 + 보조 행) — 통계 페이지 공용 */
export const StatisticsSummaryCard: React.FC<StatisticsSummaryCardProps> = ({
  icon,
  title,
  value,
  rows,
  footnote,
}) => {
  return (
    <Card className={LIST_CARD}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {rows && rows.length > 0 && (
          <div className="space-y-1">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>{row.label}</span>
                <span className="font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        )}
        {footnote && <p className="text-xs text-muted-foreground">{footnote}</p>}
      </CardContent>
    </Card>
  );
};
