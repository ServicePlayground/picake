"use client";

import { trackEvent } from "@/apps/web-user/common/utils/analytics.util";
import type { ReservationFilterName } from "@/apps/web-user/common/types/analytics.type";

export type PastFilter = "ALL" | "PICKUP_PENDING" | "PICKUP_COMPLETED" | "CANCEL_NOSHOW";

/** PastFilter → 텍소노미 filter_name 매핑 */
const FILTER_NAME_MAP: Record<PastFilter, ReservationFilterName> = {
  ALL: "all",
  PICKUP_PENDING: "pickup_waiting",
  PICKUP_COMPLETED: "pickup_complete",
  CANCEL_NOSHOW: "cancelled",
};

const PAST_FILTER_TABS: { key: Exclude<PastFilter, "ALL">; label: string }[] = [
  { key: "PICKUP_PENDING", label: "픽업대기" },
  { key: "PICKUP_COMPLETED", label: "픽업완료" },
  { key: "CANCEL_NOSHOW", label: "취소/노쇼" },
];

interface PastOrderFilterBarProps {
  activeFilter: PastFilter;
  onChange: (filter: PastFilter) => void;
}

export function PastOrderFilterBar({ activeFilter, onChange }: PastOrderFilterBarProps) {
  const handleChange = (filter: PastFilter) => {
    trackEvent("engage_reservation_filter", { filter_name: FILTER_NAME_MAP[filter] });
    onChange(filter);
  };

  return (
    <div className="flex items-center gap-5 -mt-1 mb-0.5 pb-5">
      <button
        type="button"
        onClick={() => handleChange("ALL")}
        className={`flex-shrink-0 h-8 px-3 text-sm border rounded-full ${
          activeFilter === "ALL"
            ? "text-primary font-bold bg-primary-50 border-primary-100"
            : "text-gray-900 bg-white border-gray-100"
        }`}
      >
        전체
      </button>
      <div className="relative flex-1 min-w-0 after:content-[''] after:absolute after:-left-[12px] after:top-1/2 after:-translate-y-1/2 after:h-3 after:w-[1px] after:bg-gray-50">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {PAST_FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleChange(key)}
              className={`flex-shrink-0 h-8 px-3 text-sm border rounded-full ${
                activeFilter === key
                  ? "text-primary font-bold bg-primary-50 border-primary-100"
                  : "text-gray-900 bg-white border-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
