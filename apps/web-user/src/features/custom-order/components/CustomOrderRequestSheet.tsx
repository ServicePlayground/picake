"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { Button } from "@/apps/web-user/common/components/buttons/Button";
import { customOrderApi } from "@/apps/web-user/features/custom-order/apis/custom-order.api";
import { useUploadFile } from "@/apps/web-user/features/upload/hooks/mutations/useUploadFile";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import { buildPickupTimeSlots } from "@/apps/web-user/features/custom-order/utils/pickup-time-slot.util";
import type { StoreBusinessCalendar } from "@/apps/web-user/features/store/types/store.type";

interface Props {
  isOpen: boolean;
  productId: string;
  cakeTitle: string;
  businessCalendar?: StoreBusinessCalendar;
  onClose: () => void;
}

const MAX_IMAGES = 5;

/**
 * 맞춤 주문 요청서 (상담 후 가격 결정 상품)
 *
 * 사진·요청사항·예산·픽업 일시를 받아 요청을 생성하고, 제출 즉시 채팅방으로 이동합니다.
 * 이후 견적 협상은 전부 채팅방 안에서 이뤄집니다.
 */
export function CustomOrderRequestSheet({
  isOpen,
  productId,
  cakeTitle,
  businessCalendar,
  onClose,
}: Props) {
  const router = useRouter();
  const { showAlert } = useAlertStore();
  const { mutateAsync: uploadFile } = useUploadFile();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [requirementsText, setRequirementsText] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // 영업시간 내 시간 슬롯만 제공 (서버에서도 재검증)
  const timeSlots = buildPickupTimeSlots(businessCalendar, pickupDate);

  const createMutation = useMutation({
    mutationFn: () =>
      customOrderApi.create({
        productId,
        images: imageUrls,
        requirementsText,
        desiredDate: new Date(`${pickupDate}T${pickupTime}:00`).toISOString(),
        desiredBudgetMin: budgetMin ? Number(budgetMin) : undefined,
        desiredBudgetMax: budgetMax ? Number(budgetMax) : undefined,
        reservationContactName: contactName || undefined,
        reservationPhone: contactPhone || undefined,
      }),
    onSuccess: (data) => {
      onClose();
      router.push(`/chat/${data.roomId}`);
    },
    onError: (error) => {
      showAlert({ type: "error", title: "오류", message: getApiMessage.error(error) });
    },
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded = await Promise.all(files.slice(0, MAX_IMAGES).map((file) => uploadFile(file)));
      setImageUrls((prev) => [...prev, ...uploaded.map((r) => r.fileUrl)].slice(0, MAX_IMAGES));
    } catch (error) {
      showAlert({ type: "error", title: "오류", message: getApiMessage.error(error) });
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit =
    requirementsText.trim().length > 0 && Boolean(pickupDate) && Boolean(pickupTime);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="맞춤 주문 요청서">
      <div className="flex flex-col gap-[20px] px-[20px] pb-[20px]">
        <p className="text-sm text-gray-600">
          {cakeTitle} — 사진과 요청사항을 보내주시면 사장님이 확인 후 견적을 보내드려요.
        </p>

        {/* 참고 이미지 */}
        <div>
          <label className="mb-[8px] block text-sm font-bold text-gray-900">
            참고 이미지 (최대 {MAX_IMAGES}장)
          </label>
          <div className="flex flex-wrap gap-[8px]">
            {imageUrls.map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="참고 이미지" className="h-[64px] w-[64px] rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrls((prev) => prev.filter((u) => u !== url))}
                  className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gray-900 text-[10px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {imageUrls.length < MAX_IMAGES && (
              <label className="flex h-[64px] w-[64px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                {isUploading ? "…" : "+"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* 요청사항 */}
        <div>
          <label className="mb-[8px] block text-sm font-bold text-gray-900">
            원하시는 문구나 디자인 <span className="text-primary">*</span>
          </label>
          <textarea
            value={requirementsText}
            onChange={(e) => setRequirementsText(e.target.value)}
            placeholder='예: "생일 축하 문구, 파스텔톤으로 부탁드려요"'
            className="min-h-[80px] w-full rounded-lg border border-gray-300 px-[12px] py-[10px] text-sm"
            maxLength={2000}
          />
        </div>

        {/* 예산 범위 */}
        <div>
          <label className="mb-[8px] block text-sm font-bold text-gray-900">예산 (선택)</label>
          <div className="flex items-center gap-[8px]">
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="최소"
              className="w-full rounded-lg border border-gray-300 px-[12px] py-[10px] text-sm"
            />
            <span className="text-gray-400">~</span>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="최대"
              className="w-full rounded-lg border border-gray-300 px-[12px] py-[10px] text-sm"
            />
          </div>
        </div>

        {/* 픽업 일시 — 날짜+시간 모두 필수 */}
        <div>
          <label className="mb-[8px] block text-sm font-bold text-gray-900">
            희망 픽업 일시 <span className="text-primary">*</span>
          </label>
          <div className="flex gap-[8px]">
            <input
              type="date"
              value={pickupDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setPickupDate(e.target.value);
                setPickupTime("");
              }}
              className="w-full rounded-lg border border-gray-300 px-[12px] py-[10px] text-sm"
            />
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              disabled={!pickupDate || timeSlots.length === 0}
              className="w-full rounded-lg border border-gray-300 px-[12px] py-[10px] text-sm disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">시간 선택</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
          {pickupDate && timeSlots.length === 0 && (
            <p className="mt-[6px] text-xs text-[#FF653E]">
              선택한 날짜는 휴무일이에요. 다른 날짜를 골라주세요.
            </p>
          )}
          <p className="mt-[6px] text-xs text-gray-500">
            케이크는 몇 시까지 완성해야 하는지에 따라 작업 일정이 달라져서 시간까지 알려주셔야 해요.
          </p>
        </div>

        {/* 연락처 */}
        <div>
          <label className="mb-[8px] block text-sm font-bold text-gray-900">
            픽업 연락처 (선택)
          </label>
          <div className="flex gap-[8px]">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="이름"
              className="w-full rounded-lg border border-gray-300 px-[12px] py-[10px] text-sm"
            />
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="연락처"
              className="w-full rounded-lg border border-gray-300 px-[12px] py-[10px] text-sm"
            />
          </div>
        </div>

        <Button
          onClick={() => createMutation.mutate()}
          disabled={!canSubmit || createMutation.isPending || isUploading}
        >
          {createMutation.isPending ? "요청 보내는 중…" : "요청 보내기"}
        </Button>
      </div>
    </BottomSheet>
  );
}
