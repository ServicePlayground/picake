import clsx from "clsx";
import { Icon } from "@/apps/web-user/common/components/icons";

type InfoNoticeTone = "gray" | "red";

interface InfoNoticeProps {
  message: string;
  description?: string;
  tone?: InfoNoticeTone;
  className?: string;
}

const toneStyles: Record<InfoNoticeTone, { bg: string; icon: string; border: string }> = {
  gray: { bg: "bg-gray-50", icon: "text-gray-400", border: "border-gray-100" },
  red: { bg: "bg-red-50", icon: "text-red-400", border: "border-red-100" },
};

export function InfoNotice({ message, description, tone = "gray", className }: InfoNoticeProps) {
  const styles = toneStyles[tone];

  if (description) {
    return (
      <div className={clsx("rounded-lg border overflow-hidden", styles.border, className)}>
        <div className={clsx("flex items-center gap-2 px-3 py-2.5", styles.bg)}>
          <Icon name="warning" width={16} height={16} className={styles.icon} />
          <p className="text-xs text-gray-700">{message}</p>
        </div>
        <p className="px-3 py-2.5 text-xs text-gray-900">{description}</p>
      </div>
    );
  }

  return (
    <div className={clsx("flex items-center gap-2 px-3 py-2.5 rounded-lg", styles.bg, className)}>
      <Icon name="warning" width={16} height={16} className={styles.icon} />
      <p className="text-xs text-gray-700">{message}</p>
    </div>
  );
}
