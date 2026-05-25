import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import type { PaginationMetaDto } from "@/apps/web-admin/common/types/api.dto";

interface AdminManagementPaginationProps {
  page: number;
  meta: PaginationMetaDto;
  onPageChange: (page: number) => void;
}

export function AdminManagementPagination({
  page,
  meta,
  onPageChange,
}: AdminManagementPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 border-t border-zinc-100 px-4 py-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-8 px-3 text-xs"
      >
        이전
      </Button>
      <span className="text-sm text-muted-foreground">
        {page} / {meta.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(meta.totalPages, page + 1))}
        disabled={page === meta.totalPages}
        className="h-8 px-3 text-xs"
      >
        다음
      </Button>
    </div>
  );
}
