import React from "react";
import { Inbox } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-admin/common/components/cards/Card";
import { ContentLoading } from "@/apps/web-admin/common/components/loading/ContentLoading";
import { EmptyState } from "@/apps/web-admin/common/components/fallbacks/EmptyState";
import {
  LIST_CARD,
  LIST_CARD_TITLE,
  LIST_ITEM_BOX,
  LIST_SCREEN_HEADING,
  LIST_SECTION_GAP,
} from "@/apps/web-admin/common/constants/list-typography.constant";
import { StatisticsStatusCountCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsStatusCountCard";
import { StatisticsSummaryCard } from "@/apps/web-admin/features/statistics/components/shared/StatisticsSummaryCard";
import { StatisticsTrendsCard } from "@/apps/web-admin/features/statistics/components/trends/StatisticsTrendsCard";
import { STATISTICS_STORE_ENTRY_REQUEST_STATUS_LABELS } from "@/apps/web-admin/features/statistics/constants/statistics.constant";
import { useStatisticsStoreEntryRequests } from "@/apps/web-admin/features/statistics/hooks/queries/useStatisticsQuery";

/**
 * 통계 > 입점 통계
 *
 * 구매자가 요청한 미입점 스토어의 수요와 처리 현황을 봅니다.
 */
export const StatisticsStoreEntryRequestsPage: React.FC = () => {
  const { data: statistics, isLoading } = useStatisticsStoreEntryRequests();
  const entryRequests = statistics?.storeEntryRequests;

  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>입점 통계</h1>

      {isLoading && (
        <ContentLoading variant="section" message="현황을 불러오는 중…" className="py-12" />
      )}

      {!isLoading && !entryRequests && <EmptyState message="현황 데이터를 불러오지 못했습니다." />}

      {entryRequests && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatisticsSummaryCard
              icon={<Inbox className="h-4 w-4" />}
              title="입점 요청"
              value={`${entryRequests.total.toLocaleString()}건`}
              rows={[
                {
                  label: "고유 장소",
                  value: `${entryRequests.uniquePlaces.toLocaleString()}곳`,
                },
                {
                  label: "처리 대기",
                  value: `${entryRequests.pendingCount.toLocaleString()}건`,
                },
                {
                  label: "입점 완료율",
                  value: `${entryRequests.completionRate.toLocaleString()}%`,
                },
              ]}
            />
            <StatisticsSummaryCard
              icon={<Inbox className="h-4 w-4" />}
              title="최근 요청"
              value={`${entryRequests.today.toLocaleString()}건`}
              rows={[
                { label: "오늘 신규", value: `${entryRequests.today.toLocaleString()}건` },
                {
                  label: "최근 7일",
                  value: `${entryRequests.last7Days.toLocaleString()}건`,
                },
                {
                  label: "최근 30일",
                  value: `${entryRequests.last30Days.toLocaleString()}건`,
                },
              ]}
            />
            <StatisticsSummaryCard
              icon={<Inbox className="h-4 w-4" />}
              title="처리 결과"
              value={`${entryRequests.completedCount.toLocaleString()}건`}
              footnote="입점 완료(COMPLETED) 처리된 요청 수"
            />
          </div>

          <StatisticsTrendsCard
            title="입점 요청 추이"
            description="일별 구매자 입점 요청 수 (Asia/Seoul 달력일 기준)"
            charts={["entryRequests"]}
          />

          <StatisticsStatusCountCard
            title="입점 요청 현황"
            description={`전체 ${entryRequests.total.toLocaleString()}건 · 처리 대기 ${entryRequests.pendingCount.toLocaleString()}건 · 완료율 ${entryRequests.completionRate.toLocaleString()}%`}
            items={entryRequests.byStatus}
            labels={STATISTICS_STORE_ENTRY_REQUEST_STATUS_LABELS}
            emptyMessage="입점 요청이 없습니다."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className={LIST_CARD}>
              <CardHeader>
                <CardTitle className={LIST_CARD_TITLE}>입점 요청 상위 장소</CardTitle>
                <p className="text-sm text-muted-foreground">
                  동일 카카오 장소에 접수된 요청 수 기준
                </p>
              </CardHeader>
              <CardContent>
                {entryRequests.topPlaces.length === 0 ? (
                  <EmptyState message="입점 요청 장소가 없습니다." className="py-6" />
                ) : (
                  <div className="space-y-2">
                    {entryRequests.topPlaces.map((place, index) => (
                      <div
                        key={place.kakaoPlaceId}
                        className={`${LIST_ITEM_BOX} flex items-center justify-between gap-4`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {index + 1}. {place.placeName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {place.address ?? "주소 정보 없음"}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-foreground">
                          {place.requestCount.toLocaleString()}건
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={LIST_CARD}>
              <CardHeader>
                <CardTitle className={LIST_CARD_TITLE}>지역별 입점 요청</CardTitle>
                <p className="text-sm text-muted-foreground">요청 장소의 시·도 기준 상위 지역</p>
              </CardHeader>
              <CardContent>
                {entryRequests.topRegions.length === 0 ? (
                  <EmptyState message="지역 정보가 있는 요청이 없습니다." className="py-6" />
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {entryRequests.topRegions.map((item) => (
                      <div
                        key={item.region}
                        className={`${LIST_ITEM_BOX} flex items-center justify-between`}
                      >
                        <span className="text-sm text-muted-foreground">{item.region}</span>
                        <span className="text-sm font-semibold text-foreground">
                          {item.count.toLocaleString()}건
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={LIST_CARD}>
              <CardHeader>
                <CardTitle className={LIST_CARD_TITLE}>카테고리별 입점 요청</CardTitle>
                <p className="text-sm text-muted-foreground">요청 장소의 카테고리 기준 상위 분포</p>
              </CardHeader>
              <CardContent>
                {entryRequests.topCategories.length === 0 ? (
                  <EmptyState message="카테고리 정보가 있는 요청이 없습니다." className="py-6" />
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {entryRequests.topCategories.map((item) => (
                      <div
                        key={item.category}
                        className={`${LIST_ITEM_BOX} flex items-center justify-between gap-3`}
                      >
                        <span className="truncate text-sm text-muted-foreground">
                          {item.category}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-foreground">
                          {item.count.toLocaleString()}건
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
