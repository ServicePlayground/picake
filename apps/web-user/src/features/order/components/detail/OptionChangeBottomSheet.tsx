"use client";

import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/apps/web-user/common/components/bottom-sheets/BottomSheet";
import { Button } from "@/apps/web-user/common/components/buttons/Button";
import { ReservationOptionsView } from "@/apps/web-user/features/product/components/sections/reservation-bottom-sheet/ReservationOptionsView";
import { useProductDetail } from "@/apps/web-user/features/product/hooks/queries/useProductDetail";
import { useUploadFile } from "@/apps/web-user/features/upload/hooks/mutations/useUploadFile";
import {
  CreateOrderItemRequest,
  OrderItemResponse,
  OrderResponse,
} from "@/apps/web-user/features/order/types/order.type";
import { useUpdateReservationOrderItems } from "@/apps/web-user/features/order/hooks/mutations/useUpdateReservationOrderItems";
import { trackEvent } from "@/apps/web-user/common/utils/analytics.util";

interface OptionChangeBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse;
  /** 편집 대상 주문 항목 */
  item: OrderItemResponse | null;
  onSuccess: () => void;
}

/** OrderItem → 백엔드 CreateOrderItemRequest로 그대로 변환 (편집 안 한 항목 보존용) */
function orderItemToRequest(item: OrderItemResponse): CreateOrderItemRequest {
  return {
    sizeId: item.sizeId,
    sizeDisplayName: item.sizeDisplayName,
    sizeLengthCm: item.sizeLengthCm,
    sizeDescription: item.sizeDescription,
    sizePrice: item.sizePrice,
    flavorId: item.flavorId,
    flavorDisplayName: item.flavorDisplayName,
    flavorPrice: item.flavorPrice,
    letteringMessage: item.letteringMessage,
    requestMessage: item.requestMessage,
    quantity: item.quantity,
    imageUrls: item.imageUrls,
  };
}

export function OptionChangeBottomSheet({
  isOpen,
  onClose,
  order,
  item,
  onSuccess,
}: OptionChangeBottomSheetProps) {
  const { data: product } = useProductDetail(order.productId);
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutate: updateItems, isPending: isSubmitting } = useUpdateReservationOrderItems();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [letteringMessage, setLetteringMessage] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // 시트 오픈 시 현재 옵션값으로 초기화
  useEffect(() => {
    if (isOpen && item) {
      setSelectedSize(item.sizeDisplayName ?? "");
      setSelectedFlavor(item.flavorDisplayName ?? "");
      setLetteringMessage(item.letteringMessage ?? "");
      setRequestMessage(item.requestMessage ?? "");
      setImageUrls(item.imageUrls ?? []);
    }
  }, [isOpen, item]);

  if (!item) return null;

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const remaining = 3 - imageUrls.length;
    const filesToUpload = Array.from(files).slice(0, remaining);
    filesToUpload.forEach((file) => {
      uploadFile(file, {
        onSuccess: (data) => {
          setImageUrls((prev) => [...prev, data.fileUrl]);
        },
      });
    });
    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 사이즈/맛 옵션이 있는 상품인 경우 둘 다 선택돼야 유효
  const hasSizeOptions = (product?.cakeSizeOptions?.length ?? 0) > 0;
  const hasFlavorOptions = (product?.cakeFlavorOptions?.length ?? 0) > 0;
  const isValid =
    !!product &&
    (!hasSizeOptions || !!selectedSize) &&
    (!hasFlavorOptions || !!selectedFlavor) &&
    !isUploading;

  const handleConfirm = () => {
    if (!isValid || !product || isSubmitting) return;

    const sizeOpt = product.cakeSizeOptions?.find((o) => o.displayName === selectedSize);
    const flavorOpt = product.cakeFlavorOptions?.find((o) => o.displayName === selectedFlavor);

    const editedItem: CreateOrderItemRequest = {
      sizeId: sizeOpt?.id,
      sizeDisplayName: sizeOpt?.displayName,
      sizeLengthCm: sizeOpt?.lengthCm,
      sizeDescription: sizeOpt?.description,
      sizePrice: sizeOpt?.price,
      flavorId: flavorOpt?.id,
      flavorDisplayName: flavorOpt?.displayName,
      flavorPrice: flavorOpt?.price,
      letteringMessage: letteringMessage || undefined,
      requestMessage: requestMessage || undefined,
      quantity: item.quantity,
      imageUrls,
    };

    const newItems: CreateOrderItemRequest[] = order.orderItems.map((orig) =>
      orig.id === item.id ? editedItem : orderItemToRequest(orig),
    );

    const totalQuantity = newItems.reduce((acc, it) => acc + it.quantity, 0);
    const totalPrice = newItems.reduce(
      (acc, it) =>
        acc + (product.salePrice + (it.sizePrice ?? 0) + (it.flavorPrice ?? 0)) * it.quantity,
      0,
    );

    trackEvent("request_change_reservation", {
      reservation_id: order.id,
      change_type: "product_option",
    });
    updateItems(
      { orderId: order.id, items: newItems, totalQuantity, totalPrice },
      {
        onSuccess: () => {
          trackEvent("success_change_reservation", {
            reservation_id: order.id,
            change_type: "product_option",
          });
          onClose();
          onSuccess();
        },
      },
    );
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="옵션 변경"
      footer={
        <div className="flex gap-2 px-5 py-3">
          <span className="flex-1">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
          </span>
          <span className="flex-[2]">
            <Button onClick={handleConfirm} disabled={!isValid || isSubmitting}>
              {isSubmitting ? "변경 중..." : "변경완료"}
            </Button>
          </span>
        </div>
      }
    >
      {product ? (
        <ReservationOptionsView
          hideDatePicker
          selectedDate={null}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedFlavor={selectedFlavor}
          setSelectedFlavor={setSelectedFlavor}
          letteringMessage={letteringMessage}
          setLetteringMessage={setLetteringMessage}
          requestMessage={requestMessage}
          setRequestMessage={setRequestMessage}
          cakeSizeOptions={product.cakeSizeOptions}
          cakeFlavorOptions={product.cakeFlavorOptions}
          imageUrls={imageUrls}
          fileInputRef={fileInputRef}
          handleOpenCalendar={() => {}}
          handleUploadClick={handleUploadClick}
          handleFileChange={handleFileChange}
          handleRemoveImage={handleRemoveImage}
          dateSelectionSignal={0}
          productType={product.productType}
          imageUploadEnabled={product.imageUploadEnabled}
          letteringMaxLength={product.letteringMaxLength}
        />
      ) : (
        <div className="px-5 py-8 space-y-4 animate-pulse">
          <div className="h-5 w-40 bg-gray-100 rounded" />
          <div className="h-12 w-full bg-gray-50 rounded" />
          <div className="h-12 w-full bg-gray-50 rounded" />
        </div>
      )}
    </BottomSheet>
  );
}
