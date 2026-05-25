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
import { NoticeAddSection } from "@/apps/web-admin/features/notice/components/form/NoticeAddSection";
import { NoticeEditDialog } from "@/apps/web-admin/features/notice/components/form/NoticeEditDialog";
import { NoticeTable } from "@/apps/web-admin/features/notice/components/list/NoticeTable";
import { useNoticeList } from "@/apps/web-admin/features/notice/hooks/queries/useNoticeQuery";
import { useDeleteNotice } from "@/apps/web-admin/features/notice/hooks/mutations/useNoticeMutation";
import type { NoticeItemResponseDto } from "@/apps/web-admin/features/notice/types/notice.dto";

export const NoticesListPage: React.FC = () => {
  const [editingItem, setEditingItem] = useState<NoticeItemResponseDto | null>(null);
  const { data, isLoading } = useNoticeList();
  const deleteMutation = useDeleteNotice();

  const items = data?.data ?? [];
  const isBusy = deleteMutation.isPending;

  const handleDelete = (id: string) => {
    if (!window.confirm("이 공지사항을 삭제할까요?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>공지사항 관리</h1>

      {/* 공지사항 등록 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>공지사항 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <NoticeAddSection />
        </CardContent>
      </Card>

      {/* 등록된 공지사항 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>등록된 공지사항</CardTitle>
          <p className="text-sm text-muted-foreground">
            목록은 핀 고정 항목이 먼저, 이후 등록일(오래된 순)으로 정렬됩니다.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <ContentLoading variant="section" message="공지사항을 불러오는 중…" className="py-12" />
          )}
          {!isLoading && items.length === 0 && <EmptyState message="등록된 공지사항이 없습니다." />}
          {!isLoading && items.length > 0 && (
            <NoticeTable
              items={items}
              isBusy={isBusy}
              onEdit={setEditingItem}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <NoticeEditDialog item={editingItem} onClose={() => setEditingItem(null)} />
    </div>
  );
};
