import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/apps/web-seller/common/components/cards/Card";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { ContentLoading } from "@/apps/web-seller/common/components/loading/ContentLoading";
import {
  useAiStats,
  useAiUnansweredQuestions,
} from "@/apps/web-seller/features/ai-assistant/hooks/queries/useAiAssistantQuery";
import {
  useConvertToFaq,
  useDismissUnansweredQuestion,
} from "@/apps/web-seller/features/ai-assistant/hooks/mutations/useAiAssistantMutation";
import { formatResponseDuration } from "@/apps/web-seller/features/ai-assistant/constants/aiAssistant.constant";

const RANGE_OPTIONS = [
  { days: 7, label: "최근 7일" },
  { days: 30, label: "최근 30일" },
];

/** AI 처리 현황 대시보드 — 지표 카드, 응답시간 비교, 일별 처리량, 자주 나온 질문 */
export const StoreDetailAiDashboardPage: React.FC = () => {
  const { storeId } = useParams();
  const [days, setDays] = useState(7);
  const { data: stats, isLoading } = useAiStats(storeId ?? "", days);
  const { data: unansweredQuestions } = useAiUnansweredQuestions(storeId ?? "");
  const convertMutation = useConvertToFaq(storeId ?? "");
  const dismissMutation = useDismissUnansweredQuestion(storeId ?? "");

  if (!storeId) {
    return <h2 className="text-xl font-semibold">스토어가 선택되지 않았습니다.</h2>;
  }
  if (isLoading || !stats) {
    return <ContentLoading variant="section" message="통계를 불러오는 중…" className="py-12" />;
  }

  const totalFeedback = stats.feedback.positive + stats.feedback.negative;
  const satisfactionRate =
    totalFeedback > 0 ? Math.round((stats.feedback.positive / totalFeedback) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI 처리 현황</h1>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.days}
              variant={days === option.days ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(option.days)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{stats.aiMessageCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">AI 자동응답</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{stats.handoffCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">사람 이관</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {satisfactionRate === null ? "-" : `${satisfactionRate}%`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              만족도 👍 {totalFeedback > 0 ? `(${totalFeedback}건)` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 응답시간 비교 — 채팅이 그동안 꺼져 있어 "도입 전후" 대신 AI vs 사람 비교 */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">평균 응답시간</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md bg-primary/5 p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {formatResponseDuration(stats.avgResponseMs.ai)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">AI 자동응답</p>
            </div>
            <div className="rounded-md bg-muted p-4 text-center">
              <p className="text-2xl font-bold">
                {formatResponseDuration(stats.avgResponseMs.human)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">사장님 직접 응대</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            같은 기간 안에서 AI가 답한 문의와 사장님이 직접 답한 문의의 첫 응답까지 걸린 시간을
            비교합니다.
          </p>
        </CardContent>
      </Card>

      {/* 일별 AI 처리량 */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">일별 AI 처리량</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.dailyCounts}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip labelFormatter={(v) => `${v}`} formatter={(v) => [`${v}건`, "AI 응답"]} />
              <Bar dataKey="count" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 자주 나온 질문 (FAQ 등록 후보) */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">자주 나온 질문</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI가 답하지 못해 사장님께 넘어갔던 질문들이에요. FAQ로 등록하면 다음부터 AI가 답할 수
            있습니다.
          </p>

          {!unansweredQuestions || unansweredQuestions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              아직 쌓인 질문이 없어요.
            </p>
          ) : (
            <div className="mt-4 divide-y">
              {unansweredQuestions.map((question) => (
                <div key={question.id} className="py-3">
                  <p className="text-sm font-medium">Q. {question.questionText}</p>
                  {question.sellerAnswerDraft && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      사장님 답변: &ldquo;{question.sellerAnswerDraft}&rdquo;
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!question.sellerAnswerDraft || convertMutation.isPending}
                      onClick={() => convertMutation.mutate({ questionId: question.id })}
                    >
                      이 답변으로 FAQ 등록
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={dismissMutation.isPending}
                      onClick={() => dismissMutation.mutate(question.id)}
                    >
                      무시
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
