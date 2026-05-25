import React, { useState } from "react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { Input } from "@/apps/web-admin/common/components/inputs/Input";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { BannerImageUpload } from "@/apps/web-admin/features/upload/components/BannerImageUpload";
import {
  HOME_BANNER_MAX_COUNT,
  HOME_BANNER_UPLOAD_ACCEPT,
  HOME_BANNER_UPLOAD_MAX_SIZE_BYTES,
  HOME_BANNER_UPLOAD_PREVIEW,
} from "@/apps/web-admin/features/home-banner/constants/homeBanner.constant";
import { useCreateHomeBanner } from "@/apps/web-admin/features/home-banner/hooks/mutations/useHomeBannerMutation";
import { fromDatetimeLocalValue } from "@/apps/web-admin/features/home-banner/utils/home-banner-period.ui.util";

interface HomeBannerAddSectionProps {
  currentCount: number;
}

export function HomeBannerAddSection({ currentCount }: HomeBannerAddSectionProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [linkUrl, setLinkUrl] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [endsAtLocal, setEndsAtLocal] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateHomeBanner();

  const isFull = currentCount >= HOME_BANNER_MAX_COUNT;
  const isBusy = createMutation.isPending;

  const resetForm = () => {
    setImageUrl(undefined);
    setLinkUrl("");
    setStartsAtLocal("");
    setEndsAtLocal("");
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!imageUrl) {
      setFormError("배너 이미지를 업로드해주세요.");
      return;
    }

    const startsAt = fromDatetimeLocalValue(startsAtLocal);
    const endsAt = fromDatetimeLocalValue(endsAtLocal);
    if (startsAt && endsAt && new Date(startsAt) > new Date(endsAt)) {
      setFormError("노출 종료 시각은 시작 시각보다 이후여야 합니다.");
      return;
    }

    await createMutation.mutateAsync({
      imageUrl,
      linkUrl: linkUrl.trim() || undefined,
      startsAt: startsAt ?? undefined,
      endsAt: endsAt ?? undefined,
      isActive: true,
    });
    resetForm();
  };

  if (isFull) {
    return (
      <p className="text-sm text-destructive">
        최대 {HOME_BANNER_MAX_COUNT}개까지 등록할 수 있습니다.
      </p>
    );
  }

  const uploadHeight = HOME_BANNER_UPLOAD_PREVIEW.height;

  return (
    <div className="space-y-6">
      {/* xl: 라벨 한 줄 정렬 */}
      <div className="hidden min-h-5 items-end gap-8 xl:grid xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
        <Label className="mb-0">배너 이미지</Label>
        <Label htmlFor="banner-link" className="mb-0">
          링크 URL (선택)
        </Label>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)] xl:gap-x-8 xl:gap-y-0">
        <div className="space-y-2">
          <Label className="xl:hidden">배너 이미지</Label>
          <BannerImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            accept={HOME_BANNER_UPLOAD_ACCEPT}
            maxSize={HOME_BANNER_UPLOAD_MAX_SIZE_BYTES}
            width={HOME_BANNER_UPLOAD_PREVIEW.width}
            maxWidth={HOME_BANNER_UPLOAD_PREVIEW.maxWidth}
            height={uploadHeight}
            disabled={isBusy}
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="space-y-4" style={{ minHeight: uploadHeight }}>
            <div className="space-y-2 xl:space-y-0">
              <Label htmlFor="banner-link" className="xl:hidden">
                링크 URL (선택)
              </Label>
              <Input
                id="banner-link"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://"
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="banner-starts">노출 시작 (선택)</Label>
                <Input
                  id="banner-starts"
                  type="datetime-local"
                  value={startsAtLocal}
                  onChange={(e) => setStartsAtLocal(e.target.value)}
                  disabled={isBusy}
                />
              </div>
              <div>
                <Label htmlFor="banner-ends">노출 종료 (선택)</Label>
                <Input
                  id="banner-ends"
                  type="datetime-local"
                  value={endsAtLocal}
                  onChange={(e) => setEndsAtLocal(e.target.value)}
                  disabled={isBusy}
                />
              </div>
            </div>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex justify-end border-t pt-5">
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isBusy || !imageUrl}
            >
              {createMutation.isPending ? "등록 중..." : "배너 등록"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
