"use client";

import { useState } from "react";
import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { Spinner } from "@/apps/web-user/common/components/spinners/Spinner";
import { Modal } from "@/apps/web-user/common/components/modals/Modal";
import { Button } from "@/apps/web-user/common/components/buttons/Button";
import { ReservationBottomSheetProps } from "./types";
import { useReservationBottomSheet } from "./useReservationBottomSheet";
import { useKeyboardOpen } from "@/apps/web-user/common/hooks/useKeyboardOpen";
import { ReservationOptionsView } from "./ReservationOptionsView";
import { ReservationCalendarView } from "./ReservationCalendarView";
import { ReservationConfirmView } from "./ReservationConfirmView";
import { useCreateOrder } from "@/apps/web-user/features/order/hooks/mutations/useCreateOrder";
import { CreateOrderRequest } from "@/apps/web-user/features/order/types/order.type";
import { useUploadFile } from "@/apps/web-user/features/upload/hooks/mutations/useUploadFile";

export function ReservationBottomSheet({
  isOpen,
  productId,
  price,
  cakeTitle,
  cakeImageUrl,
  cakeImages = [],
  cakeSizeOptions,
  cakeFlavorOptions,
  productType,
  storeName,
  pickupAddress,
  pickupRoadAddress,
  pickupDetailAddress,
  pickupZonecode,
  pickupLatitude,
  pickupLongitude,
  imageUploadEnabled,
  letteringMaxLength,
  businessCalendar,
  refundCancellationPolicy,
  onClose,
}: ReservationBottomSheetProps) {
  const { mutate: createOrder } = useCreateOrder();
  const { mutateAsync: uploadFile } = useUploadFile();

  // 클릭 즉시 잠그기 위한 제출 락 (이미지 업로드 → 주문 생성 전 구간 포함)
  // useCreateOrder의 isPending은 업로드가 끝난 뒤에야 true가 되므로 단독으로는 더블클릭을 막지 못함
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    view,
    setView,
    selectedDate,
    tempSelectedDate,
    setTempSelectedDate,
    tempSelectedTime,
    setTempSelectedTime,
    selectedSize,
    setSelectedSize,
    selectedFlavor,
    setSelectedFlavor,
    letteringMessage,
    setLetteringMessage,
    requestMessage,
    setRequestMessage,
    reserverName,
    setReserverName,
    reserverPhone,
    setReserverPhone,
    agreePayment,
    setAgreePayment,
    agreeRefund,
    setAgreeRefund,
    agreeOptionChange,
    setAgreeOptionChange,
    allAgreed,
    handleToggleAllAgreements,
    imageUrls,
    fileInputRef,
    orderItems,
    isCancelModalOpen,
    setIsCancelModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    totalQuantity,
    totalPrice,
    currentOptionPrice,
    isOptionsValid,
    isCalendarValid,
    isAddingFromConfirm,
    isEditingFromConfirm,
    dateSelectionSignal,
    formatDateTime,
    isDateChangeModalOpen,
    setIsDateChangeModalOpen,
    handleOpenCalendar,
    handleCalendarConfirm,
    handleDateChangeConfirm,
    handleDateChangeCancel,
    handleCancelClick,
    handleConfirmCancel,
    handleClose,
    handleGoToConfirm,
    handleQuantityChange,
    handleDeleteClick,
    handleConfirmDelete,
    handleEditItem,
    handleAddNewItem,
    handleUploadClick,
    handleFileChange,
    handleRemoveImage,
  } = useReservationBottomSheet({
    isOpen,
    price,
    productType,
    cakeSizeOptions,
    cakeFlavorOptions,
    onClose,
  });

  // 모바일 키보드가 올라오면 옵션 선택 뷰의 하단 버튼(취소/선택완료) 숨김
  const isKeyboardOpen = useKeyboardOpen();

  const handleCreateOrder = async () => {
    // 이미 제출 중이면 중복 호출 차단 (더블클릭 방지)
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 각 OrderItem의 이미지를 업로드하고 URL 받기
      const itemsWithImageUrls = await Promise.all(
        orderItems.map(async (item) => {
          // 각 항목의 이미지 File을 업로드하고 URL 받기
          let uploadedImageUrls: string[] = [];
          if (item.imageFiles && item.imageFiles.length > 0) {
            // 모든 이미지 File을 병렬로 업로드
            uploadedImageUrls = await Promise.all(
              item.imageFiles.map(async (file) => {
                const response = await uploadFile(file);
                return response.fileUrl;
              }),
            );
          }

          // 사이즈 옵션 정보 찾기
          const sizeOption = cakeSizeOptions?.find((opt) => opt.displayName === item.size);
          // 맛 옵션 정보 찾기
          const flavorOption = cakeFlavorOptions?.find((opt) => opt.displayName === item.flavor);

          return {
            // 사이즈 옵션 정보 (있는 경우만)
            ...(sizeOption && {
              sizeId: sizeOption.id,
              sizeDisplayName: sizeOption.displayName,
              sizeLengthCm: sizeOption.lengthCm,
              sizeDescription: sizeOption.description,
              sizePrice: sizeOption.price,
            }),
            // 맛 옵션 정보 (있는 경우만)
            ...(flavorOption && {
              flavorId: flavorOption.id,
              flavorDisplayName: flavorOption.displayName,
              flavorPrice: flavorOption.price,
            }),
            // 기타 옵션
            ...(item.letteringMessage && {
              letteringMessage: item.letteringMessage,
            }),
            ...(item.requestMessage && {
              requestMessage: item.requestMessage,
            }),
            quantity: item.quantity,
            imageUrls: uploadedImageUrls,
          };
        }),
      );

      // API 요청 데이터 구성 (주문 시점의 정보 전달)
      const orderRequest: CreateOrderRequest = {
        pickupDate: selectedDate ? selectedDate.toISOString() : "",
        productId,
        productName: cakeTitle,
        productImages: cakeImages.length > 0 ? cakeImages : cakeImageUrl ? [cakeImageUrl] : [],
        totalQuantity,
        totalPrice,
        storeName,
        // 예약자 연락처 (입력된 경우만 전달)
        ...(reserverName.trim() && { reservationContactName: reserverName.trim() }),
        ...(reserverPhone.trim() && { reservationPhone: reserverPhone.trim() }),
        // 픽업 정보
        pickupAddress,
        pickupRoadAddress,
        pickupDetailAddress,
        pickupZonecode,
        pickupLatitude,
        pickupLongitude,
        items: itemsWithImageUrls,
      };

      // API 호출 (성공 시 완료 페이지로 이동하며 언마운트, 실패 시 락 해제)
      createOrder(orderRequest, {
        onError: () => setIsSubmitting(false),
      });
    } catch {
      // 이미지 업로드 실패 등 주문 생성 이전 단계에서 실패한 경우 락 해제
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (view === "options") return "상품 옵션 선택";
    if (view === "calendar") return "날짜 선택";
    return "주문확인";
  };

  const renderFooter = () => {
    if (view === "options") {
      // 키보드가 올라온 동안에는 하단 버튼을 숨겨 입력 영역을 가리지 않도록 함
      if (isKeyboardOpen) return null;
      const confirmButtonText = isAddingFromConfirm ? "추가완료" : "선택완료";
      return (
        <div className="px-[20px]">
          <div className="flex items-center justify-between pt-[14px]">
            <span className="text-sm text-gray-700">총 금액</span>
            <span className="text-xl font-bold text-gray-900">
              {currentOptionPrice.toLocaleString()}원
            </span>
          </div>
          <div className="py-[12px] flex gap-[8px]">
            <span className="w-[100px]">
              <Button variant="outline" onClick={handleCancelClick}>
                취소
              </Button>
            </span>
            <span className="flex-1">
              <Button onClick={handleGoToConfirm} disabled={!isOptionsValid}>
                {confirmButtonText}
              </Button>
            </span>
          </div>
        </div>
      );
    }

    if (view === "calendar") {
      return (
        <div className="px-[20px] py-[12px] flex gap-[8px]">
          <span className="w-[100px]">
            <Button variant="outline" onClick={() => setView("options")}>
              닫기
            </Button>
          </span>
          <span className="flex-1">
            <Button onClick={handleCalendarConfirm} disabled={!isCalendarValid}>
              선택완료
            </Button>
          </span>
        </div>
      );
    }

    return (
      <div className="px-[20px]">
        <div className="flex items-center justify-between pt-[14px]">
          <span className="text-sm text-gray-700">총 금액 ({totalQuantity}개)</span>
          <span className="text-xl font-bold text-gray-900">{totalPrice.toLocaleString()}원</span>
        </div>
        <div className="py-[12px]">
          <Button
            onClick={handleCreateOrder}
            disabled={
              orderItems.length === 0 ||
              !reserverName.trim() ||
              !reserverPhone.trim() ||
              !allAgreed ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center">
                <Spinner size={20} className="text-white" />
              </span>
            ) : productType === "BASIC_CAKE" ? (
              "예약하기"
            ) : (
              "예약신청"
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderOptionsView = () => (
    <ReservationOptionsView
      selectedDate={selectedDate}
      selectedSize={selectedSize}
      setSelectedSize={setSelectedSize}
      selectedFlavor={selectedFlavor}
      setSelectedFlavor={setSelectedFlavor}
      letteringMessage={letteringMessage}
      setLetteringMessage={setLetteringMessage}
      requestMessage={requestMessage}
      setRequestMessage={setRequestMessage}
      cakeSizeOptions={cakeSizeOptions}
      cakeFlavorOptions={cakeFlavorOptions}
      imageUrls={imageUrls}
      fileInputRef={fileInputRef}
      handleOpenCalendar={handleOpenCalendar}
      handleUploadClick={handleUploadClick}
      handleFileChange={handleFileChange}
      handleRemoveImage={handleRemoveImage}
      dateSelectionSignal={dateSelectionSignal}
      productType={productType}
      isAddingFromConfirm={isAddingFromConfirm && orderItems.length > 0}
      isEditingFromConfirm={isEditingFromConfirm && orderItems.length > 1}
      imageUploadEnabled={imageUploadEnabled}
      letteringMaxLength={letteringMaxLength}
    />
  );

  const renderCalendarView = () => (
    <ReservationCalendarView
      tempSelectedDate={tempSelectedDate}
      setTempSelectedDate={setTempSelectedDate}
      tempSelectedTime={tempSelectedTime}
      setTempSelectedTime={setTempSelectedTime}
      businessCalendar={businessCalendar}
    />
  );

  const renderConfirmView = () => (
    <ReservationConfirmView
      orderItems={orderItems}
      cakeTitle={cakeTitle}
      cakeImageUrl={cakeImageUrl}
      price={price}
      selectedDate={selectedDate}
      formatDateTime={formatDateTime}
      handleEditItem={handleEditItem}
      handleDeleteClick={handleDeleteClick}
      handleQuantityChange={handleQuantityChange}
      handleAddNewItem={handleAddNewItem}
      reserverName={reserverName}
      setReserverName={setReserverName}
      reserverPhone={reserverPhone}
      setReserverPhone={setReserverPhone}
      agreePayment={agreePayment}
      setAgreePayment={setAgreePayment}
      agreeRefund={agreeRefund}
      setAgreeRefund={setAgreeRefund}
      agreeOptionChange={agreeOptionChange}
      setAgreeOptionChange={setAgreeOptionChange}
      allAgreed={allAgreed}
      handleToggleAllAgreements={handleToggleAllAgreements}
      refundCancellationPolicy={refundCancellationPolicy}
    />
  );

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={handleClose}
        title={getTitle()}
        footer={renderFooter()}
        fullScreen={view === "confirm"}
        scrollResetKey={view}
      >
        {view === "options" && renderOptionsView()}
        {view === "calendar" && renderCalendarView()}
        {view === "confirm" && renderConfirmView()}
      </BottomSheet>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="예약 진행 취소"
        description="예약 진행을 취소하시겠습니까?"
        confirmText="계속 진행하기"
        cancelText="취소"
        onCancel={handleConfirmCancel}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="상품 삭제"
        description="해당 상품을 삭제하시겠습니까?"
        confirmText="취소"
        cancelText="삭제"
        onCancel={handleConfirmDelete}
      />

      <Modal
        isOpen={isDateChangeModalOpen}
        onClose={() => setIsDateChangeModalOpen(false)}
        title="픽업 날짜 변경"
        description="픽업 날짜 변경 시 주문하는 다른 상품들의 픽업 날짜도 함께 변경됩니다."
        confirmText="변경취소"
        cancelText="확인"
        confirmVariant="outline"
        cancelVariant="primary"
        onConfirm={handleDateChangeCancel}
        onCancel={handleDateChangeConfirm}
      />
    </>
  );
}
