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
import { HomeBannerAddSection } from "@/apps/web-admin/features/home-banner/components/form/HomeBannerAddSection";
import { HomeBannerEditDialog } from "@/apps/web-admin/features/home-banner/components/form/HomeBannerEditDialog";
import { HomeBannerTable } from "@/apps/web-admin/features/home-banner/components/list/HomeBannerTable";
import { useHomeBannerList } from "@/apps/web-admin/features/home-banner/hooks/queries/useHomeBannerQuery";
import {
  useDeleteHomeBanner,
  useReorderHomeBanner,
} from "@/apps/web-admin/features/home-banner/hooks/mutations/useHomeBannerMutation";
import type { HomeBannerItemResponseDto } from "@/apps/web-admin/features/home-banner/types/home-banner.dto";

export const HomeBannersListPage: React.FC = () => {
  const [editingItem, setEditingItem] = useState<HomeBannerItemResponseDto | null>(null);
  const { data, isLoading } = useHomeBannerList();
  const deleteMutation = useDeleteHomeBanner();
  const reorderMutation = useReorderHomeBanner();

  const items = data?.data ?? [];
  const isBusy = reorderMutation.isPending || deleteMutation.isPending;

  const handleReorder = (nextItems: HomeBannerItemResponseDto[]) => {
    reorderMutation.mutate({ orderedIds: nextItems.map((item) => item.id) });
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    handleReorder(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    handleReorder(next);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("이 배너를 삭제할까요?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>홈 배너 관리</h1>

      {/* 배너 등록 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>배너 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <HomeBannerAddSection currentCount={items.length} />
        </CardContent>
      </Card>

      {/* 등록된 배너 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>등록된 배너</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <ContentLoading variant="section" message="배너를 불러오는 중…" className="py-12" />
          )}
          {!isLoading && items.length === 0 && <EmptyState message="등록된 배너가 없습니다." />}
          {!isLoading && items.length > 0 && (
            <HomeBannerTable
              items={items}
              isBusy={isBusy}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onEdit={setEditingItem}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <HomeBannerEditDialog item={editingItem} onClose={() => setEditingItem(null)} />
    </div>
  );
};
