"use client";

import Link from "next/link";
import Image from "next/image";
import { useAlarmList } from "@/apps/web-user/features/alarm/hooks/queries/useAlarmList";
import { useMarkAlarmRead } from "@/apps/web-user/features/alarm/hooks/mutations/useMarkAlarmRead";
import { Icon } from "@/apps/web-user/common/components/icons";
import { AlarmSkeleton } from "@/apps/web-user/common/components/skeleton/AlarmSkeleton";
import { useAuthStore, useAuthHasHydrated } from "@/apps/web-user/common/store/auth.store";
import { EmptyState } from "@/apps/web-user/common/components/fallbacks/EmptyState";

export default function AlarmPage() {
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: alarms = [], isLoading } = useAlarmList();
  const markReadMutation = useMarkAlarmRead();

  const showLoginHint = hasHydrated && !isAuthenticated;

  return (
    <div className="flex flex-col min-h-[calc(100vh-52px)]">
      <main className="flex-1 flex flex-col">
        {showLoginHint ? (
          <EmptyState message="아직 알림이 없습니다." className="flex-1 mb-[52px] px-5" />
        ) : isLoading ? (
          <AlarmSkeleton />
        ) : alarms.length === 0 ? (
          <EmptyState message="아직 알림이 없습니다." className="flex-1 mb-[52px]" />
        ) : (
          <ul className="px-5">
            {alarms.map((alarm) => {
              const href = alarm.orderId
                ? `/reservation/complete?orderId=${alarm.orderId}&from=alarm`
                : "/alarm";
              return (
                <li key={alarm.id}>
                  <Link
                    href={href}
                    onClick={() => {
                      if (alarm.read === false) {
                        markReadMutation.mutate(alarm.id);
                      }
                    }}
                    className="flex items-center gap-[10px] py-[14px] border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-[42px] h-[42px] rounded-full overflow-hidden bg-gray-200 shrink-0">
                      {alarm.imageUrl ? (
                        <Image
                          src={alarm.imageUrl}
                          alt={alarm.title}
                          width={42}
                          height={42}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <Icon name="noneAlarm" width={42} height={42} />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-[6px] min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{alarm.title}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{alarm.content}</p>
                    </div>

                    <div className="flex flex-col gap-0.5 self-start shrink-0 text-xs text-gray-400 items-end text-right">
                      <span>{alarm.date ? `${alarm.date} ${alarm.time}` : alarm.time}</span>
                      {alarm.read === false && (
                        <span className="text-[10px] font-bold text-primary">NEW</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
