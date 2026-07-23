import clsx from "clsx";
import { Icon } from "@/apps/web-user/common/components/icons";

type InfoNoticeTone = "gray" | "red";

interface InfoNoticeProps {
  message: string;
  /** 안내문 아래에 붙는 판매자 메세지 박스 내용 */
  description?: string;
  tone?: InfoNoticeTone;
  className?: string;
}

const toneStyles: Record<InfoNoticeTone, { bg: string; icon: string; border: string }> = {
  gray: { bg: "bg-gray-50", icon: "text-gray-400", border: "border-gray-100" },
  red: { bg: "bg-red-50", icon: "text-red-400", border: "border-red-100" },
};

/** 안내문 한 줄 (아이콘 + 문구) */
function NoticeBar({ message, tone = "gray" }: { message: string; tone?: InfoNoticeTone }) {
  const styles = toneStyles[tone];
  return (
    <>
      <Icon name="warning" width={16} height={16} className={styles.icon} />
      <p className="text-xs text-gray-700">{message}</p>
    </>
  );
}

/** 안내문과 분리된 판매자 메세지 박스. 상단에 말풍선 꼬리가 붙는다 */
function SellerMessageBox({ description }: { description: string }) {
  return (
    <div className="relative mt-4 px-4 py-3 border border-gray-100 rounded-2lg">
      <Icon name="noticeTop" width={18} height={13} className="absolute left-4 -top-3" />
      <span className="text-xs text-gray-500">판매자 메세지</span>
      <p className="text-2sm text-gray-900">{description}</p>
    </div>
  );
}

/**
 * 기본 안내 문구. description을 주면 아래에 판매자 메세지 박스가 붙는다.
 * 말풍선 꼬리는 없다 — 꼬리가 필요하면 SellerMessageNotice를 사용한다.
 */
export function InfoNotice({ message, description, tone = "gray", className }: InfoNoticeProps) {
  const styles = toneStyles[tone];

  if (description) {
    return (
      <div className={clsx("rounded-lg border overflow-hidden", styles.border, className)}>
        <div className={clsx("flex items-center gap-2 px-2.5 py-2", styles.bg)}>
          <NoticeBar message={message} tone={tone} />
        </div>
        <div className="px-2.5 py-2">
          <p className="text-2sm text-gray-900">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex items-center gap-2 px-3 py-2.5 rounded-lg", styles.bg, className)}>
      <NoticeBar message={message} tone={tone} />
    </div>
  );
}

/**
 * 안내 문구 + 판매자 메세지 박스(말풍선 꼬리 포함).
 * 안내문과 판매자 메세지가 이어져 보여야 하는 예약상세 상단에서 사용한다.
 */
export function SellerMessageNotice({
  message,
  description,
  tone = "gray",
  className,
}: InfoNoticeProps & { description: string }) {
  const styles = toneStyles[tone];

  return (
    <>
      <div className={clsx("flex items-center gap-2 px-3 py-2.5 rounded-lg", styles.bg, className)}>
        <NoticeBar message={message} tone={tone} />
      </div>
      <SellerMessageBox description={description} />
    </>
  );
}
