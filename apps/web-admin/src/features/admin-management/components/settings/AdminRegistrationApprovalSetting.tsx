import { StatusBadge } from "@/apps/web-admin/common/components/badges/StatusBadge";
import { CardContent, CardHeader, CardTitle } from "@/apps/web-admin/common/components/cards/Card";
import {
  LIST_CARD_TITLE,
  LIST_ITEM_BOX,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import type { AdminConfigResponseDto } from "@/apps/web-admin/features/admin-management/types/admin-management-config.dto";
import { formatAdminManagementDateTime } from "@/apps/web-admin/features/admin-management/utils/admin-management-date.util";

interface AdminRegistrationApprovalSettingProps {
  config: AdminConfigResponseDto;
  isPending: boolean;
  onToggle: (requireApproval: boolean) => void;
}

export function AdminRegistrationApprovalSetting({
  config,
  isPending,
  onToggle,
}: AdminRegistrationApprovalSettingProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className={LIST_CARD_TITLE}>가입 승인 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3",
            LIST_ITEM_BOX,
            isPending ? "cursor-not-allowed opacity-60" : "hover:bg-muted/40",
          )}
        >
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={config.requireApproval}
              disabled={isPending}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <div
              role="presentation"
              onClick={() => !isPending && onToggle(!config.requireApproval)}
              className={cn(
                "h-6 w-11 rounded-full border-2 transition-colors duration-200",
                config.requireApproval
                  ? "border-primary bg-primary"
                  : "border-input bg-muted",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                  config.requireApproval ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </div>
          </div>

          <span>
            <span className="text-sm font-semibold text-foreground">가입 신청 후 승인 필요</span>
            <p className="mt-1 text-sm text-muted-foreground">
              켜면: 회원가입 후 기존 관리자가 승인해야 로그인할 수 있습니다.
              <br />
              끄면: 회원가입 즉시 자동 승인되어 바로 로그인할 수 있습니다. (기본값)
            </p>
          </span>
        </label>

        <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">현재 상태</span>
          <StatusBadge variant={config.requireApproval ? "warning" : "success"}>
            {config.requireApproval ? "승인 필요 ON" : "자동 승인 (OFF)"}
          </StatusBadge>
        </div>

        <p className="text-xs text-muted-foreground">
          마지막 수정: {formatAdminManagementDateTime(config.updatedAt)}
        </p>
      </CardContent>
    </>
  );
}
