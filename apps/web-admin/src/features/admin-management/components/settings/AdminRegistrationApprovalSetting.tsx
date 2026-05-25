import { CardContent, CardHeader, CardTitle } from "@/apps/web-admin/common/components/cards/Card";
import type { AdminConfigResponseDto } from "@/apps/web-admin/features/admin-management/types/admin-management-config.dto";
import { formatAdminManagementDateTime } from "@/apps/web-admin/features/admin-management/utils/admin-management-date.util";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

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
        <CardTitle className="text-base">가입 승인 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-md border border-input p-4 shadow-sm",
            isPending ? "cursor-not-allowed opacity-60" : "hover:bg-accent/40",
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
                  ? "border-zinc-900 bg-zinc-900"
                  : "border-zinc-300 bg-zinc-200",
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
            <span className="font-medium">가입 신청 후 승인 필요</span>
            <p className="mt-1 text-sm text-muted-foreground">
              켜면: 회원가입 후 기존 관리자가 승인해야 로그인할 수 있습니다.
              <br />
              끄면: 회원가입 즉시 자동 승인되어 바로 로그인할 수 있습니다. (기본값)
            </p>
          </span>
        </label>

        <div className="flex items-center justify-between rounded-md bg-zinc-50 px-4 py-2.5">
          <span className="text-xs text-zinc-500">현재 상태</span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium",
              config.requireApproval ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-600",
            )}
          >
            {config.requireApproval ? "승인 필요 ON" : "자동 승인 (OFF)"}
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          마지막 수정: {formatAdminManagementDateTime(config.updatedAt)}
        </p>
      </CardContent>
    </>
  );
}
