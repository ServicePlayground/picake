"use client";

import { useState } from "react";
import { Toggle } from "@/apps/web-user/common/components/inputs/Toggle";
import { Toast } from "@/apps/web-user/common/components/toast/Toast";
import { useNotificationPreferences } from "@/apps/web-user/features/mypage/hooks/queries/useNotificationPreferences";
import { useUpdateNotificationPreferences } from "@/apps/web-user/features/mypage/hooks/mutations/useUpdateNotificationPreferences";

interface NotificationRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function NotificationRow({ label, checked, onChange }: NotificationRowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

export default function SettingNotificationPage() {
  const { data } = useNotificationPreferences();
  const { mutate: updatePreferences } = useUpdateNotificationPreferences();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pushEnabled = data?.pushNotificationsEnabled ?? true;

  const handlePushToggle = (next: boolean) => {
    updatePreferences({ pushNotificationsEnabled: next });
    setToastMessage(`푸쉬 알림 수신 ${next ? "동의" : "거부"}하셨습니다.`);
  };

  return (
    <div className="pt-3">
      <NotificationRow label="푸쉬 알림" checked={pushEnabled} onChange={handlePushToggle} />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
