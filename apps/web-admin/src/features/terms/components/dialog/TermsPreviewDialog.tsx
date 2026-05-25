import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import { TermsHtmlPreviewDialog } from "@/apps/web-admin/features/terms/components/dialog/TermsHtmlPreviewDialog";
import { useTermsDetail } from "@/apps/web-admin/features/terms/hooks/queries/useTermsQuery";
import { formatTermsDate, formatTermsDateTime } from "@/apps/web-admin/features/terms/utils/terms-date.util";

interface TermsPreviewDialogProps {
  id: string | null;
  onClose: () => void;
}

export function TermsPreviewDialog({ id, onClose }: TermsPreviewDialogProps) {
  const { data, isLoading } = useTermsDetail(id);

  if (!id) return null;

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card p-8 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <ContentLoading variant="section" message="약관을 불러오는 중…" className="py-16" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <TermsHtmlPreviewDialog
      open
      onClose={onClose}
      title={`${data.title} (v${data.version})`}
      content={data.content}
      description={
        <span>
          시행일: {formatTermsDate(data.effectiveAt)} · 등록: {formatTermsDateTime(data.createdAt)}
          {data.isActive && (
            <StatusBadge variant="success" className="ml-2">
              활성 버전
            </StatusBadge>
          )}
        </span>
      }
    />
  );
}
