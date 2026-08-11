import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/apps/web-seller/common/components/cards/Card";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { Textarea } from "@/apps/web-seller/common/components/textareas/Textarea";
import { Input } from "@/apps/web-seller/common/components/inputs/Input";
import { ContentLoading } from "@/apps/web-seller/common/components/loading/ContentLoading";
import { ROUTES } from "@/apps/web-seller/common/constants/paths.constant";
import { cn } from "@/apps/web-seller/common/utils/classname.util";
import { useAiAssistantSettings } from "@/apps/web-seller/features/ai-assistant/hooks/queries/useAiAssistantQuery";
import {
  useUpdateAiAssistantSettings,
  useGenerateInstructionsDraft,
  useTestAiReply,
} from "@/apps/web-seller/features/ai-assistant/hooks/mutations/useAiAssistantMutation";
import type {
  AiScheduleMode,
  AiPreviewTestResponseDto,
} from "@/apps/web-seller/features/ai-assistant/types/ai-assistant.dto";
import { AI_SCHEDULE_MODE_OPTIONS, AI_SAMPLE_QUESTIONS } from "@/apps/web-seller/features/ai-assistant/constants/aiAssistant.constant";

/**
 * AI 자동응답 설정 (온보딩 3단계)
 * 1) 응대 지침 → 2) 초안 확인 + 미리테스트 → 3) 사용 시간대
 *
 * 3단계(시간대)를 저장해야 AI가 켜집니다(opt-in).
 */
export const StoreDetailAiSettingsPage: React.FC = () => {
  const { storeId } = useParams();
  const { data: settings, isLoading } = useAiAssistantSettings(storeId ?? "");
  const updateMutation = useUpdateAiAssistantSettings(storeId ?? "");
  const draftMutation = useGenerateInstructionsDraft(storeId ?? "");
  const testMutation = useTestAiReply(storeId ?? "");

  const [instructions, setInstructions] = useState("");
  const [scheduleMode, setScheduleMode] = useState<AiScheduleMode>("OFF");
  const [testQuestion, setTestQuestion] = useState("");
  const [testResult, setTestResult] = useState<AiPreviewTestResponseDto | null>(null);

  useEffect(() => {
    if (!settings) return;
    setInstructions(settings.instructions ?? "");
    setScheduleMode(settings.scheduleMode);
  }, [settings]);

  if (!storeId) {
    return <h2 className="text-xl font-semibold">스토어가 선택되지 않았습니다.</h2>;
  }
  if (isLoading || !settings) {
    return <ContentLoading variant="section" message="설정을 불러오는 중…" className="py-12" />;
  }

  const { storeInfoStatus } = settings;
  const storeInfoLinked =
    storeInfoStatus.hasBusinessHours || storeInfoStatus.hasRefundPolicy || storeInfoStatus.hasDescription;

  const handleGenerateDraft = async () => {
    if (instructions.trim() && !window.confirm("작성된 지침을 초안으로 덮어쓸까요?")) return;

    const result = await draftMutation.mutateAsync();
    if (result.draft) setInstructions(result.draft);
  };

  const handleTest = async (question: string) => {
    if (!question.trim()) return;
    setTestQuestion(question);
    const result = await testMutation.mutateAsync({ question, instructions });
    setTestResult(result);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI 자동응답 설정</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          손님 문의에 AI가 1차로 답합니다. 아래 지침과 사용 시간대를 저장해야 AI가 켜집니다.
        </p>
      </div>

      {/* 1단계 — 응대 지침 */}
      <Card className="shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              1단계
            </span>
            <h2 className="text-lg font-semibold">응대 지침</h2>
          </div>

          {/* 매장 정보 연동 상태 */}
          <div
            className={cn(
              "flex items-start gap-2 rounded-md border p-3 text-sm",
              storeInfoLinked
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-700",
            )}
          >
            {storeInfoLinked ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              {storeInfoLinked ? (
                <>
                  <p className="font-medium">매장 정보가 연동되어 있어요.</p>
                  <p className="mt-1 text-xs">
                    {[
                      storeInfoStatus.hasBusinessHours && "영업시간",
                      storeInfoStatus.hasRefundPolicy && "환불정책",
                      storeInfoStatus.hasDescription && "매장소개",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    을 근거로 답변합니다.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">매장 정보가 부족해요.</p>
                  <p className="mt-1 text-xs">
                    영업시간·환불정책을 먼저 입력하면 더 정확한 초안을 만들 수 있어요.{" "}
                    <Link className="underline" to={ROUTES.STORE_DETAIL_EDIT(storeId)}>
                      매장 정보 입력하기
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGenerateDraft}
            disabled={!storeInfoLinked || draftMutation.isPending}
            className="gap-2"
          >
            {draftMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                매장 정보를 분석해서 초안을 작성하고 있어요…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                매장 정보로 초안 만들기
              </>
            )}
          </Button>

          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="매장 소개, 픽업 안내, 자주 묻는 질문에 대한 답변 등을 자유롭게 적어주세요."
            className="min-h-[180px]"
            maxLength={10000}
          />
        </CardContent>
      </Card>

      {/* 2단계 — 미리테스트 */}
      <Card className="shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              2단계
            </span>
            <h2 className="text-lg font-semibold">저장 전 미리 확인</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            저장하기 전에 AI가 실제로 어떻게 답할지 테스트해보세요. 이 테스트는 실제 대화나 통계에
            영향을 주지 않습니다.
          </p>

          <div className="flex gap-2">
            <Input
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTest(testQuestion);
              }}
              placeholder="예상 질문을 입력해보세요"
            />
            <Button
              onClick={() => handleTest(testQuestion)}
              disabled={!testQuestion.trim() || testMutation.isPending}
              className="shrink-0"
            >
              {testMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "확인"}
            </Button>
          </div>

          {/* 샘플 질문 — AI가 답할 수 있는 것 / 모를 수 있는 것 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3">
              <p className="mb-2 text-xs font-bold text-emerald-800">AI가 답할 수 있어요</p>
              <div className="flex flex-wrap gap-1.5">
                {AI_SAMPLE_QUESTIONS.answerable.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleTest(q)}
                    className="rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-xs text-emerald-800 hover:bg-emerald-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3">
              <p className="mb-2 text-xs font-bold text-amber-800">AI가 모를 수 있어요</p>
              <div className="flex flex-wrap gap-1.5">
                {AI_SAMPLE_QUESTIONS.unanswerable.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleTest(q)}
                    className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {testResult && (
            <div
              className={cn(
                "rounded-md border p-3",
                testResult.canAnswer
                  ? "border-primary/30 bg-primary/5"
                  : "border-amber-200 bg-amber-50",
              )}
            >
              <span
                className={cn(
                  "inline-block rounded px-2 py-0.5 text-xs font-bold",
                  testResult.canAnswer
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-100 text-amber-800",
                )}
              >
                {testResult.canAnswer ? "AI 미리보기" : "모르는 질문 — 사장님 연결"}
              </span>
              <p className="mt-2 text-sm">{testResult.answer}</p>
              {!testResult.canAnswer && (
                <p className="mt-2 text-xs text-amber-700">
                  이런 질문이 자주 나온다면 응대 지침에 추가해보세요.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3단계 — 사용 시간대 */}
      <Card className="shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              3단계
            </span>
            <h2 className="text-lg font-semibold">AI 사용 시간대</h2>
          </div>

          <div className="space-y-2">
            {AI_SCHEDULE_MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-input p-3 hover:bg-accent/40"
              >
                <input
                  type="radio"
                  name="scheduleMode"
                  className="mt-1 h-4 w-4"
                  checked={scheduleMode === option.value}
                  onChange={() => setScheduleMode(option.value)}
                />
                <span>
                  <span className="font-medium">{option.label}</span>
                  <p className="mt-0.5 text-sm text-muted-foreground">{option.description}</p>
                </span>
              </label>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => updateMutation.mutate({ instructions, scheduleMode })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "저장 중…" : "저장"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
