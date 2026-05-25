import React, { useState } from "react";
import {
  Heart,
  Instagram,
  Landmark,
  MessageCircle,
  MessageSquareText,
  Navigation,
  Phone,
  Star,
  Store,
} from "lucide-react";
import { cn } from "@/apps/web-seller/common/utils/classname.util";
import {
  HOME_BLOCK_TITLE,
  HOME_BODY,
  HOME_BODY_MUTED,
  HOME_CAPTION,
  HOME_LABEL,
  HOME_MONO,
  HOME_NUMBER_KPI,
  HOME_PAGE_TITLE,
} from "@/apps/web-seller/features/home/constants/store-home-typography.constant";
import { STORE_BANK_OPTIONS } from "@/apps/web-seller/features/store/constants/store.constants";
import { useStoreDetail } from "@/apps/web-seller/features/store/hooks/queries/useStoreQuery";
import { ContentLoading } from "@/apps/web-seller/common/components/loading/ContentLoading";

function kakaoChannelHref(id: string): string {
  let slug = id.replace(/^@/, "").trim();
  if (!slug.startsWith("_")) slug = `_${slug}`;
  return `https://pf.kakao.com/${slug}`;
}

const snsIconBtn =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/[0.06] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function StoreProfileSnsIconLinks({
  kakaoChannelId,
  instagramId,
}: {
  kakaoChannelId?: string | null;
  instagramId?: string | null;
}) {
  if (!kakaoChannelId && !instagramId) return null;

  return (
    <div className="flex shrink-0 items-center gap-1">
      {kakaoChannelId ? (
        <a
          href={kakaoChannelHref(kakaoChannelId)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(snsIconBtn, "bg-[#FEE500] text-[#191919] hover:brightness-95")}
          aria-label={`카카오채널 (${kakaoChannelId})`}
          title="카카오채널"
        >
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
        </a>
      ) : null}
      {instagramId ? (
        <a
          href={`https://instagram.com/${instagramId.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            snsIconBtn,
            "bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] text-white hover:brightness-[1.05]",
          )}
          aria-label={`인스타그램 (@${instagramId.replace(/^@/, "")})`}
          title="인스타그램"
        >
          <Instagram className="h-3.5 w-3.5" strokeWidth={2} />
        </a>
      ) : null}
    </div>
  );
}

export interface StoreHomeStoreProfileProps {
  storeId: string;
}

export const StoreHomeStoreProfile: React.FC<StoreHomeStoreProfileProps> = ({ storeId }) => {
  const { data: s, isLoading } = useStoreDetail(storeId);
  const [logoFailed, setLogoFailed] = useState(false);

  const bankLabel =
    s?.bankName != null
      ? (STORE_BANK_OPTIONS.find((o) => o.value === s.bankName)?.label ?? String(s.bankName))
      : "";

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-zinc-200/90 bg-muted/30 p-8">
        <ContentLoading variant="section" message="스토어 정보를 불러오는 중…" className="py-6" />
      </section>
    );
  }

  if (!s) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-violet-50/90 via-white to-amber-50/40 shadow-sm ring-1 ring-black/[0.03]">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-amber-200/25 blur-3xl"
        aria-hidden
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="mx-auto flex w-full max-w-[11.5rem] shrink-0 flex-col items-stretch sm:max-w-[12.5rem] lg:mx-0 lg:max-w-[13rem]">
            <div
              className={cn(
                "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.35rem] bg-white shadow-xl ring-[5px] ring-white lg:rounded-3xl lg:ring-[6px]",
                !logoFailed && s.logoImageUrl ? "ring-violet-100/95" : "ring-zinc-100",
              )}
            >
              {!logoFailed && s.logoImageUrl ? (
                <img
                  src={s.logoImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <Store
                  className="h-[36%] w-[36%] min-h-12 min-w-12 text-zinc-300"
                  strokeWidth={1.25}
                />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-5 lg:pt-0.5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-center gap-2 sm:justify-start sm:gap-2.5">
                <h1 className={cn("min-w-0 text-center sm:text-left", HOME_PAGE_TITLE)}>
                  {s.name}
                </h1>
                <StoreProfileSnsIconLinks
                  kakaoChannelId={s.kakaoChannelId}
                  instagramId={s.instagramId}
                />
              </div>
              {s.description ? (
                <p
                  className={cn(
                    "max-w-2xl text-center leading-relaxed sm:text-left",
                    HOME_BODY_MUTED,
                  )}
                >
                  {s.description}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-rose-100/90 bg-gradient-to-br from-rose-50/90 to-white/80 px-4 py-3.5 shadow-sm ring-1 ring-rose-100/40">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Heart className="h-5 w-5 text-rose-600" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className={HOME_LABEL}>좋아요</p>
                  <p className={HOME_NUMBER_KPI}>{s.likeCount.toLocaleString("ko-KR")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-amber-100/90 bg-gradient-to-br from-amber-50/90 to-white/80 px-4 py-3.5 shadow-sm ring-1 ring-amber-100/40">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-500" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <p className={HOME_LABEL}>평균 평점</p>
                  <p className="flex items-baseline gap-1.5">
                    <span className={HOME_NUMBER_KPI}>{s.averageRating.toFixed(1)}</span>
                    <span className={HOME_CAPTION}>/ 5.0</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-violet-100/90 bg-gradient-to-br from-violet-50/90 to-white/80 px-4 py-3.5 shadow-sm ring-1 ring-violet-100/40">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <MessageSquareText className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className={HOME_LABEL}>전체 리뷰</p>
                  <p className={HOME_NUMBER_KPI}>
                    {s.totalReviewCount.toLocaleString("ko-KR")}
                    <span className={cn("ml-1 text-sm font-semibold", HOME_BODY_MUTED)}>건</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="group rounded-xl border border-amber-100/90 bg-gradient-to-b from-amber-50/80 to-white/80 p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                <div className={cn("mb-3 flex items-center gap-2", HOME_BLOCK_TITLE)}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                    <Navigation className="h-4 w-4" />
                  </span>
                  픽업 장소
                </div>
                <p className={cn("font-medium leading-relaxed", HOME_BODY)}>{s.roadAddress}</p>
                {s.detailAddress ? (
                  <p className={cn("mt-1", HOME_BODY_MUTED)}>{s.detailAddress}</p>
                ) : null}
                <p className={cn("mt-2", HOME_CAPTION)}>우편번호 {s.zonecode}</p>
              </div>

              <div className="group rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                <div className={cn("mb-3 flex items-center gap-2", HOME_BLOCK_TITLE)}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/90 text-slate-800">
                    <Landmark className="h-4 w-4" />
                  </span>
                  정산 계좌
                </div>
                <dl className="space-y-2.5">
                  <div>
                    <dt className={HOME_LABEL}>은행</dt>
                    <dd className={cn("mt-0.5 font-medium", HOME_BODY)}>{bankLabel || "—"}</dd>
                  </div>
                  <div>
                    <dt className={HOME_LABEL}>계좌번호</dt>
                    <dd className={cn("mt-0.5", HOME_MONO)}>{s.bankAccountNumber ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className={HOME_LABEL}>예금주</dt>
                    <dd className={cn("mt-0.5 font-medium", HOME_BODY)}>
                      {s.accountHolderName ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="group rounded-xl border border-emerald-100/90 bg-gradient-to-b from-emerald-50/80 to-white/80 p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
              <div className={cn("mb-2 flex items-center gap-2", HOME_BLOCK_TITLE)}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Phone className="h-4 w-4" />
                </span>
                스토어 연락처
              </div>
              <p className={cn("font-medium", HOME_BODY)}>{s.phoneNumber ?? "미등록"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
