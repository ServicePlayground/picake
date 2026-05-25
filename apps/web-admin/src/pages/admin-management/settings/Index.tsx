import React from "react";
import { Card } from "@/apps/web-admin/common/components/cards/Card";
import { AdminRegistrationApprovalSetting } from "@/apps/web-admin/features/admin-management/components/settings/AdminRegistrationApprovalSetting";
import { useUpdateAdminManagementConfig } from "@/apps/web-admin/features/admin-management/hooks/mutations/useAdminManagementMutation";
import { useAdminManagementConfig } from "@/apps/web-admin/features/admin-management/hooks/queries/useAdminManagementQuery";

export const AdminSettingsPage: React.FC = () => {
  const { data, isLoading, isError } = useAdminManagementConfig();
  const { mutate: updateConfig, isPending } = useUpdateAdminManagementConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">가입 설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">관리자 계정 가입 관련 설정을 관리합니다.</p>
      </div>

      <Card className="shadow-sm">
        {isLoading && <p className="p-6 text-sm text-muted-foreground">불러오는 중...</p>}

        {isError && (
          <p className="p-6 text-sm text-destructive">
            설정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}

        {!isLoading && !isError && data && (
          <AdminRegistrationApprovalSetting
            config={data}
            isPending={isPending}
            onToggle={(requireApproval) => updateConfig({ requireApproval })}
          />
        )}
      </Card>
    </div>
  );
};
