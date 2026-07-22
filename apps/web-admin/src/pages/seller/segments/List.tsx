import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-admin/common/components/cards/Card";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import {
  LIST_CARD,
  LIST_CARD_TITLE,
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { SellerSegmentCreateForm } from "@/apps/web-admin/features/seller-segment-management/components/form/SellerSegmentCreateForm";
import { SellerSegmentAutoAssignDialog } from "@/apps/web-admin/features/seller-segment-management/components/dialog/SellerSegmentAutoAssignDialog";
import { SellerSegmentTable } from "@/apps/web-admin/features/seller-segment-management/components/list/SellerSegmentTable";
import { useSellerSegmentList } from "@/apps/web-admin/features/seller-segment-management/hooks/queries/useSellerSegmentManagementQuery";

/**
 * 판매자 > 세그먼트 관리
 *
 * "오픈 초기 가입 판매자"처럼 향후 혜택을 줄 대상을 미리 구분해두는 화면입니다.
 * 혜택의 종류·인원·기간은 여기서 다루지 않고, 세그먼트 소속 여부만 관리합니다.
 */
export const SellerSegmentsListPage: React.FC = () => {
  const [autoAssignSegmentId, setAutoAssignSegmentId] = useState<string | null>(null);
  const { data, isLoading } = useSellerSegmentList();

  const items = data?.data ?? [];
  // 목록 쿼리가 뮤테이션 후 갱신되면 다이얼로그의 소속 판매자 수도 함께 최신화되도록 id로 재조회
  const autoAssignSegment = items.find((item) => item.id === autoAssignSegmentId) ?? null;

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>판매자 세그먼트 관리</h1>

      {/* 세그먼트 등록 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>세그먼트 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <SellerSegmentCreateForm />
        </CardContent>
      </Card>

      {/* 등록된 세그먼트 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>등록된 세그먼트</CardTitle>
          <p className="text-sm text-muted-foreground">
            "가입일 기준 자동 편입"으로 원하는 기준일까지 가입한 판매자를 편입합니다.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <ContentLoading variant="section" message="세그먼트를 불러오는 중…" className="py-12" />
          )}
          {!isLoading && items.length === 0 && (
            <EmptyState message="등록된 세그먼트가 없습니다." />
          )}
          {!isLoading && items.length > 0 && (
            <SellerSegmentTable
              items={items}
              onAutoAssign={(item) => setAutoAssignSegmentId(item.id)}
            />
          )}
        </CardContent>
      </Card>

      <SellerSegmentAutoAssignDialog
        segment={autoAssignSegment}
        onClose={() => setAutoAssignSegmentId(null)}
      />
    </div>
  );
};
