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
import { QnaAddSection } from "@/apps/web-admin/features/qna/components/form/QnaAddSection";
import { QnaEditDialog } from "@/apps/web-admin/features/qna/components/form/QnaEditDialog";
import { QnaTable } from "@/apps/web-admin/features/qna/components/list/QnaTable";
import { useQnaList } from "@/apps/web-admin/features/qna/hooks/queries/useQnaQuery";
import { useDeleteQna } from "@/apps/web-admin/features/qna/hooks/mutations/useQnaMutation";
import type { QnaItemResponseDto } from "@/apps/web-admin/features/qna/types/qna.dto";

export const QnasListPage: React.FC = () => {
  const [editingItem, setEditingItem] = useState<QnaItemResponseDto | null>(null);
  const { data, isLoading } = useQnaList();
  const deleteMutation = useDeleteQna();

  const items = data?.data ?? [];
  const isBusy = deleteMutation.isPending;

  const handleDelete = (id: string) => {
    if (!window.confirm("이 Q&A를 삭제할까요?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>Q&A 관리</h1>

      {/* Q&A 등록 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>Q&A 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <QnaAddSection />
        </CardContent>
      </Card>

      {/* 등록된 Q&A */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>등록된 Q&A</CardTitle>
          <p className="text-sm text-muted-foreground">
            목록은 카테고리 → 핀 고정 → 등록일(오래된 순)으로 정렬됩니다. 구매자 앱에서는 카테고리별
            그룹으로 노출됩니다.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <ContentLoading variant="section" message="Q&A를 불러오는 중…" className="py-12" />
          )}
          {!isLoading && items.length === 0 && <EmptyState message="등록된 Q&A가 없습니다." />}
          {!isLoading && items.length > 0 && (
            <QnaTable
              items={items}
              isBusy={isBusy}
              onEdit={setEditingItem}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <QnaEditDialog item={editingItem} onClose={() => setEditingItem(null)} />
    </div>
  );
};
