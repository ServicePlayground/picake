"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { Button } from "@/apps/web-user/common/components/buttons/Button";
import { TextArea } from "@/apps/web-user/common/components/textareas/TextArea";
import { Input } from "@/apps/web-user/common/components/inputs/Input";
import { Icon } from "@/apps/web-user/common/components/icons";
import { Spinner } from "@/apps/web-user/common/components/spinners/Spinner";
import { ReservationCalendarView } from "@/apps/web-user/features/product/components/sections/reservation-bottom-sheet/ReservationCalendarView";
import { customOrderApi } from "@/apps/web-user/features/custom-order/apis/custom-order.api";
import { useUploadFile } from "@/apps/web-user/features/upload/hooks/mutations/useUploadFile";
import { useAlertStore } from "@/apps/web-user/common/store/alert.store";
import getApiMessage from "@/apps/web-user/common/utils/getApiMessage";
import type { StoreBusinessCalendar } from "@/apps/web-user/features/store/types/store.type";

interface Props {
  isOpen: boolean;
  productId: string;
  cakeTitle: string;
  businessCalendar?: StoreBusinessCalendar;
  onClose: () => void;
}

const MAX_IMAGES = 3;

/** 선택한 날짜와 시간을 하나의 Date로 합침 */
function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined;
}

/**
 * 맞춤 주문 요청서 (상담 후 가격 결정 상품)
 *
 * 사진·요청사항·예산·픽업 일시를 받아 요청을 생성하고, 제출 즉시 채팅방으로 이동합니다.
 * 이후 견적 협상은 전부 채팅방 안에서 이뤄집니다. 입력 UI는 기존 예약 바텀시트와 동일한
 * 컴포넌트(캘린더·타임피커·이미지 업로드)를 재사용합니다.
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<"form" | "calendar">("form");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [requirementsText, setRequirementsText] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  const [tempSelectedTime, setTempSelectedTime] = useState<Date | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedDate || !selectedTime) throw new Error("픽업 일시를 선택해주세요.");
      return customOrderApi.create({
        productId,
        images: imageUrls,
        requirementsText,
        desiredDate: combineDateAndTime(selectedDate, selectedTime).toISOString(),
        desiredBudgetMin: budgetMin ? Number(budgetMin) : undefined,
        desiredBudgetMax: budgetMax ? Number(budgetMax) : undefined,
        reservationContactName: contactName || undefined,
        reservationPhone: contactPhone || undefined,
      });
    },
    onSuccess: (data) => {
      onClose();
      router.push(`/chat/${data.roomId}`);
    },
    onError: (error) => {
      showAlert({ type: "error", title: "오류", message: getApiMessage.error(error) });
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - imageUrls.length;
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        files.slice(0, remaining).map((file) => uploadFile(file)),
      );
      setImageUrls((prev) => [...prev, ...uploaded.map((r) => r.fileUrl)].slice(0, MAX_IMAGES));
    } catch (error) {
      showAlert({ type: "error", title: "오류", message: getApiMessage.error(error) });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmDateTime = () => {
    setSelectedDate(tempSelectedDate);
    setSelectedTime(tempSelectedTime);
    setView("form");
  };

  const pickupLabel =
    selectedDate && selectedTime
      ? combineDateAndTime(selectedDate, selectedTime).toLocaleString("ko-KR", {
          month: "long",
          day: "numeric",
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        })
      : "";

  const canSubmit = requirementsText.trim().length > 0 && Boolean(selectedDate && selectedTime);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={view === "calendar" ? "픽업 일시 선택" : "맞춤 주문 요청서"}
    >
      {view === "calendar" ? (
        <div className="flex flex-col gap-[20px] px-[20px] pb-[20px]">
          <ReservationCalendarView
            tempSelectedDate={tempSelectedDate}
            setTempSelectedDate={setTempSelectedDate}
            tempSelectedTime={tempSelectedTime}
            setTempSelectedTime={setTempSelectedTime}
            businessCalendar={businessCalendar}
          />
          <Button onClick={handleConfirmDateTime} disabled={!tempSelectedDate || !tempSelectedTime}>
            선택 완료
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-[20px] px-[20px] pb-[20px]">
          <p className="text-sm text-gray-500">
            {cakeTitle} — 사진과 요청사항을 보내주시면 사장님이 확인 후 견적을 보내드려요.
          </p>

          {/* 참고사진 — 기존 예약 화면과 동일한 업로드 UI */}
          <div className="flex flex-col gap-[6px]">
            <div className="block mb-[10px] text-sm font-bold text-gray-900">
              참고사진 <span className="font-normal text-gray-300">(선택)</span>
            </div>
            <div className="flex gap-[6px] overflow-auto w-full">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || imageUrls.length >= MAX_IMAGES}
                className={`flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg h-[100px] ${
                  imageUrls.length === 0 ? "w-full" : "w-[100px] shrink-0"
                }`}
              >
                {isUploading ? (
                  <Spinner />
                ) : (
                  <>
                    <Icon name="addPhoto" width={24} height={24} className="mb-[4px] text-gray-300" />
                    <div className="text-sm text-gray-300">
                      {imageUrls.length === 0 ? "참고할 사진을 업로드해주세요" : "사진 업로드"}
                      <br />({imageUrls.length}/{MAX_IMAGES})
                    </div>
                  </>
                )}
              </button>
              {imageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative h-[100px] w-[100px] rounded-lg shrink-0 border border-gray-100"
                >
                  <button
                    type="button"
                    aria-label="첨부 이미지 삭제"
                    onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute right-[5px] top-[5px]"
                  >
                    <Icon name="removePhoto" width={20} height={20} />
                  </button>
                  <img
                    src={url}
                    alt="업로드된 이미지 미리보기"
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              ))}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <TextArea
            label={
              <>
                원하시는 문구나 디자인 <span className="font-normal text-primary">*</span>
              </>
            }
            value={requirementsText}
            onChange={setRequirementsText}
            placeholder='예: "생일 축하 문구, 파스텔톤으로 부탁드려요"'
            maxLength={2000}
            showCount
          />

          {/* 예산 범위 */}
          <div className="flex flex-col gap-[6px]">
            <div className="block text-sm font-bold text-gray-900">
              예산 <span className="font-normal text-gray-300">(선택)</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <Input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="최소"
              />
              <span className="text-gray-300">~</span>
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="최대"
              />
            </div>
          </div>

          {/* 픽업 일시 — 기존 예약 캘린더 뷰 재사용 */}
          <div className="flex flex-col gap-[6px]">
            <div className="block text-sm font-bold text-gray-900">
              희망 픽업 일시 <span className="font-normal text-primary">*</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTempSelectedDate(selectedDate);
                setTempSelectedTime(selectedTime);
                setView("calendar");
              }}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-[12px] py-[12px] text-sm"
            >
              <span className={pickupLabel ? "text-gray-900" : "text-gray-300"}>
                {pickupLabel || "픽업 날짜와 시간을 선택해주세요"}
              </span>
              <Icon name="selectArrow" width={16} height={16} className="text-gray-300" />
            </button>
            <p className="text-xs text-gray-300">
              케이크는 몇 시까지 완성해야 하는지에 따라 작업 일정이 달라져서 시간까지 알려주셔야 해요.
            </p>
          </div>

          {/* 픽업 연락처 */}
          <div className="flex flex-col gap-[6px]">
            <div className="block text-sm font-bold text-gray-900">
              픽업 연락처 <span className="font-normal text-gray-300">(선택)</span>
            </div>
            <div className="flex gap-[8px]">
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="이름"
              />
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="연락처"
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
      )}
    </BottomSheet>
  );
}
