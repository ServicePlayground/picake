import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import type { PaginationMetaDto } from "@/apps/web-admin/common/types/api.dto";

interface StoreEntryRequestPaginationProps {
  page: number;
  meta: PaginationMetaDto;
  onPageChange: (page: number) => void;
}

export function StoreEntryRequestPagination({
  page,
  meta,
  onPageChange,
}: StoreEntryRequestPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        이전
      </Button>
      <div className="text-sm text-muted-foreground">
        {page} / {meta.totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
        disabled={page === meta.totalPages}
      >
        다음
      </Button>
    </div>
  );
}
