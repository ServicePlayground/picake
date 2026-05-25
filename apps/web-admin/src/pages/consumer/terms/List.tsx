import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/apps/web-admin/common/components/cards/Card";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import {
  LIST_CARD,
  LIST_CARD_TITLE,
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import {
  CONSUMER_TERMS_TYPES,
  TERMS_TYPE_LABEL,
} from "@/apps/web-admin/features/terms/constants/terms.constant";
import { TermsCreateForm } from "@/apps/web-admin/features/terms/components/form/TermsCreateForm";
import { TermsPreviewDialog } from "@/apps/web-admin/features/terms/components/dialog/TermsPreviewDialog";
import { TermsVersionTable } from "@/apps/web-admin/features/terms/components/list/TermsVersionTable";
import { useActivateTerms } from "@/apps/web-admin/features/terms/hooks/mutations/useTermsMutation";
import { useTermsVersionList } from "@/apps/web-admin/features/terms/hooks/queries/useTermsQuery";
import type { TermsType } from "@/apps/web-admin/features/terms/types/terms.dto";

const TAB_TYPES = CONSUMER_TERMS_TYPES;
const AVAILABLE_TYPES = TAB_TYPES.map((t) => ({
  value: t,
  label: TERMS_TYPE_LABEL[t],
}));

export const ConsumerTermsListPage: React.FC = () => {
  const [activeType, setActiveType] = useState<TermsType>(TAB_TYPES[0]);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data, isLoading } = useTermsVersionList(activeType);
  const activateMutation = useActivateTerms();

  const items = data?.data ?? [];

  const handleActivate = (id: string) => {
    if (!window.confirm("이 버전을 활성 버전으로 지정할까요?\n기존 활성 버전은 비활성화됩니다.")) return;
    activateMutation.mutate(id);
  };

  return (
    <div className={LIST_SECTION_GAP}>
      {/* 헤더 */}
      <h1 className={LIST_SCREEN_HEADING}>구매자 약관 관리</h1>

      {/* 약관 등록 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>새 약관 버전 등록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            약관은 수정 없이 항상 새 버전으로 등록됩니다. 기존 버전은 이력으로 영구 보존됩니다.
          </p>
          <TermsCreateForm availableTypes={AVAILABLE_TYPES} defaultType={activeType} />
        </CardContent>
      </Card>

      {/* 버전 이력 */}
      <Card className={LIST_CARD}>
        <CardHeader>
          <CardTitle className={LIST_CARD_TITLE}>버전 이력</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 탭 */}
          <div className="mb-6 flex gap-1 border-b border-border">
            {TAB_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(t)}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  ${activeType === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {TERMS_TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          {isLoading && (
            <ContentLoading variant="section" message="버전 이력을 불러오는 중…" className="py-12" />
          )}
          {!isLoading && items.length === 0 && (
            <EmptyState message="등록된 약관 버전이 없습니다." />
          )}
          {!isLoading && items.length > 0 && (
            <TermsVersionTable
              items={items}
              isBusy={activateMutation.isPending}
              onPreview={setPreviewId}
              onActivate={handleActivate}
            />
          )}
        </CardContent>
      </Card>

      <TermsPreviewDialog id={previewId} onClose={() => setPreviewId(null)} />
    </div>
  );
};
