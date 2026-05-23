import { useEffect, useMemo, useRef, useState } from "react";
import { OrderItem, ViewType } from "./types";
import {
  CakeFlavorOption,
  CakeSizeOption,
  ProductType,
} from "@/apps/web-user/features/product/types/product.type";
import { useMypageProfile } from "@/apps/web-user/features/mypage/hooks/queries/useMypageProfile";

interface UseReservationBottomSheetProps {
  isOpen: boolean;
  price: number;
  productType: ProductType;
  cakeSizeOptions?: CakeSizeOption[];
  cakeFlavorOptions?: CakeFlavorOption[];
  onClose: () => void;
}

/**
 * 예약 바텀시트 로직을 관리하는 커스텀 훅
 *
 * 플로우: options(옵션선택) -> calendar(날짜선택) -> confirm(주문확인)
 * - options: 픽업날짜, 사이즈, 맛, 레터링, 요청사항, 참고사진 선택
 * - calendar: 날짜와 시간 선택 (TimePicker 포함)
 * - confirm: 선택한 상품 목록 확인, 수량 조절, 상품 추가/삭제
 */
export function useReservationBottomSheet({
  isOpen,
  price,
  productType,
  cakeSizeOptions,
  cakeFlavorOptions,
  onClose,
}: UseReservationBottomSheetProps) {
  // ========================================
  // 뷰 상태 관리
  // ========================================
  const [view, setView] = useState<ViewType>("options");

  // ========================================
  // 날짜/시간 선택 상태
  // - selectedDate: 최종 선택된 날짜+시간
  // - tempSelectedDate/Time: 캘린더에서 임시 선택 중인 값
  // ========================================
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  const [tempSelectedTime, setTempSelectedTime] = useState<Date | null>(null);

  // ========================================
  // 주문 상품 목록 관리
  // - orderItems: 확정된 주문 상품 배열
  // - editingIndex: 수정 중인 상품의 인덱스 (null이면 새 상품 추가 모드)
  // - isAddingFromConfirm: confirm 화면에서 추가/수정으로 진입했는지
  // ========================================
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingFromConfirm, setIsAddingFromConfirm] = useState(false);
  const [isEditingFromConfirm, setIsEditingFromConfirm] = useState(false);
  const [dateSelectionSignal, setDateSelectionSignal] = useState(0);

  // ========================================
  // 현재 편집 중인 상품 옵션
  // (options 뷰에서 사용자가 선택하는 값들)
  // ========================================
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [selectedCream, setSelectedCream] = useState("");
  const [letteringMessage, setLetteringMessage] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);

  // ========================================
  // 모달 상태 관리
  // - isCancelModalOpen: 작성 취소 확인 모달
  // - isDeleteModalOpen: 상품 삭제 확인 모달
  // ========================================
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDateChangeModalOpen, setIsDateChangeModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

  // ========================================
  // 예약자 정보 (confirm 단계에서 입력 — 시트 열릴 때 사용자 정보로 1회 prefill)
  // ========================================
  const { data: profile } = useMypageProfile();
  const [reserverName, setReserverName] = useState("");
  const [reserverPhone, setReserverPhone] = useState("");
  const hasPrefilledReserverRef = useRef(false);

  // ========================================
  // 필수 동의 상태 (confirm 단계)
  // ========================================
  const [agreePayment, setAgreePayment] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [agreeOptionChange, setAgreeOptionChange] = useState(false);
  const allAgreed = agreePayment && agreeRefund && agreeOptionChange;
  const handleToggleAllAgreements = (next: boolean) => {
    setAgreePayment(next);
    setAgreeRefund(next);
    setAgreeOptionChange(next);
  };

  // 파일 업로드 input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const imageUrls = useMemo(
    () => attachedImages.map((file) => URL.createObjectURL(file)),
    [attachedImages],
  );

  // 바텀시트가 닫힐 때 모든 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setView("options");
      setSelectedDate(null);
      setTempSelectedDate(null);
      setTempSelectedTime(null);
      setOrderItems([]);
      setEditingIndex(null);
      setSelectedSize("");
      setSelectedFlavor("");
      setSelectedCream("");
      setLetteringMessage("");
      setRequestMessage("");
      setAttachedImages([]);
      setIsAddingFromConfirm(false);
      setIsEditingFromConfirm(false);
      setDateSelectionSignal(0);
      setReserverName("");
      setReserverPhone("");
      hasPrefilledReserverRef.current = false;
      setAgreePayment(false);
      setAgreeRefund(false);
      setAgreeOptionChange(false);
    }
  }, [isOpen]);

  // 시트 열릴 때 사용자 정보로 예약자명/번호 1회 prefill
  useEffect(() => {
    if (isOpen && profile && !hasPrefilledReserverRef.current) {
      setReserverName(profile.name ?? "");
      setReserverPhone(profile.phone ?? "");
      hasPrefilledReserverRef.current = true;
    }
  }, [isOpen, profile]);

  // 이미지 URL 정리
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // 현재 편집 중인 옵션 상태 초기화
  const resetCurrentOptions = () => {
    setSelectedSize("");
    setSelectedFlavor("");
    setSelectedCream("");
    setLetteringMessage("");
    setRequestMessage("");
    setAttachedImages([]);
    setEditingIndex(null);
  };

  // 캘린더 뷰로 전환하고 임시 날짜/시간 세팅
  const openCalendar = () => {
    setTempSelectedDate(selectedDate);
    if (selectedDate) {
      const time = new Date();
      time.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      setTempSelectedTime(time);
    } else {
      setTempSelectedTime(null);
    }
    setView("calendar");
  };

  const handleOpenCalendar = () => {
    const shouldShowDateChangeModal =
      (isAddingFromConfirm && orderItems.length > 0) ||
      (isEditingFromConfirm && orderItems.length > 1);
    if (shouldShowDateChangeModal) {
      setIsDateChangeModalOpen(true);
      return;
    }
    openCalendar();
  };

  // 날짜 변경 확인 모달 → 확인
  const handleDateChangeConfirm = () => {
    setIsDateChangeModalOpen(false);
    openCalendar();
  };

  // 날짜 변경 확인 모달 → 변경취소
  const handleDateChangeCancel = () => {
    setIsDateChangeModalOpen(false);
  };

  // 캘린더에서 선택한 날짜/시간 확정
  const handleCalendarConfirm = () => {
    let nextSelectedDate: Date | null = tempSelectedDate;

    if (tempSelectedDate && tempSelectedTime) {
      const combined = new Date(tempSelectedDate);
      combined.setHours(tempSelectedTime.getHours(), tempSelectedTime.getMinutes(), 0, 0);
      nextSelectedDate = combined;
    }
    const prevTime = selectedDate?.getTime();
    const nextTime = nextSelectedDate?.getTime();
    const hasChanged = prevTime !== nextTime;

    if (hasChanged) {
      setSelectedDate(nextSelectedDate);
      setDateSelectionSignal((prev) => prev + 1);
    } else {
      setSelectedDate(nextSelectedDate);
    }

    setView("options");
  };

  // 작성 취소 확인 모달 오픈
  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

  // 작성 취소 확정 처리
  const handleConfirmCancel = () => {
    setIsCancelModalOpen(false);
    if (isAddingFromConfirm || isEditingFromConfirm) {
      setView("confirm");
      setIsAddingFromConfirm(false);
      setIsEditingFromConfirm(false);
      return;
    }
    setView("options");
    onClose();
  };

  // 바텀시트 닫기 (X버튼, 배경 클릭, ESC) → 취소 모달 표시
  const handleClose = () => {
    setIsCancelModalOpen(true);
  };

  // 현재 옵션을 주문 목록에 추가하고 확인 뷰로 이동
  const handleGoToConfirm = () => {
    const sizePrice = cakeSizeOptions?.find((s) => s.displayName === selectedSize)?.price ?? 0;
    const flavorPrice =
      cakeFlavorOptions?.find((f) => f.displayName === selectedFlavor)?.price ?? 0;

    const newItem: OrderItem = {
      size: selectedSize,
      sizePrice,
      flavor: selectedFlavor,
      flavorPrice,
      cream: selectedCream,
      letteringMessage,
      requestMessage,
      quantity: 1,
      imageFiles: [...attachedImages], // 현재 선택된 이미지 File 목록 저장
      imageUrls: imageUrls, // 미리보기용 로컬 URL 목록 저장
    };

    if (editingIndex !== null) {
      setOrderItems((prev) =>
        prev.map((item, i) =>
          i === editingIndex ? { ...newItem, quantity: item.quantity } : item,
        ),
      );
    } else {
      setOrderItems((prev) => [...prev, newItem]);
    }

    resetCurrentOptions();
    setIsAddingFromConfirm(false);
    setIsEditingFromConfirm(false);
    setView("confirm");
  };

  // 주문 수량 증감 처리
  const handleQuantityChange = (index: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    );
  };

  // 삭제 확인 모달 오픈
  const handleDeleteClick = (index: number) => {
    setDeleteTargetIndex(index);
    setIsDeleteModalOpen(true);
  };

  // 삭제 확정 처리
  const handleConfirmDelete = () => {
    if (deleteTargetIndex !== null) {
      setOrderItems((prev) => prev.filter((_, i) => i !== deleteTargetIndex));
    }
    setIsDeleteModalOpen(false);
    setDeleteTargetIndex(null);
  };

  // 특정 상품 편집 모드로 전환
  const handleEditItem = (index: number) => {
    const item = orderItems[index];
    setSelectedSize(item.size);
    setSelectedFlavor(item.flavor);
    setSelectedCream(item.cream);
    setLetteringMessage(item.letteringMessage);
    setRequestMessage(item.requestMessage);
    // 편집 시 기존 이미지 File 복원
    setAttachedImages(item.imageFiles || []);
    setEditingIndex(index);
    setIsAddingFromConfirm(false);
    setIsEditingFromConfirm(true);
    setView("options");
  };

  // 새 상품 추가 모드로 전환
  const handleAddNewItem = () => {
    resetCurrentOptions();
    setIsAddingFromConfirm(true);
    setIsEditingFromConfirm(false);
    setView("options");
    setDateSelectionSignal(0);
  };

  // 파일 업로드 input 클릭 트리거
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 시 이미지 목록 업데이트
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setAttachedImages((prev) => {
      const remaining = 3 - prev.length;
      if (remaining <= 0) return prev;
      return [...prev, ...files.slice(0, remaining)];
    });
    event.target.value = "";
  };

  // 첨부 이미지 삭제
  const handleRemoveImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 날짜/시간 표시용 포맷팅
  const formatDateTime = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = dayNames[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "오후" : "오전";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${year}.${month}.${day}(${dayOfWeek}) · ${period} ${displayHours}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = orderItems.reduce(
    (sum, item) => sum + (price + item.sizePrice + item.flavorPrice) * item.quantity,
    0,
  );

  // 현재 선택 중인 옵션의 가격 계산 (options 뷰에서 사용)
  const currentOptionPrice = useMemo(() => {
    const sizePrice = cakeSizeOptions?.find((s) => s.displayName === selectedSize)?.price ?? 0;
    const flavorPrice =
      cakeFlavorOptions?.find((f) => f.displayName === selectedFlavor)?.price ?? 0;
    return price + sizePrice + flavorPrice;
  }, [price, selectedSize, selectedFlavor, cakeSizeOptions, cakeFlavorOptions]);

  const isOptionsValid =
    selectedDate &&
    selectedSize &&
    selectedFlavor &&
    letteringMessage &&
    (productType === "BASIC_CAKE" || attachedImages.length > 0);
  const isCalendarValid = tempSelectedDate && tempSelectedTime;

  return {
    // View
    view,
    setView,

    // Date & Time
    selectedDate,
    tempSelectedDate,
    setTempSelectedDate,
    tempSelectedTime,
    setTempSelectedTime,

    // Options
    selectedSize,
    setSelectedSize,
    selectedFlavor,
    setSelectedFlavor,
    letteringMessage,
    setLetteringMessage,
    requestMessage,
    setRequestMessage,

    // Reserver Info
    reserverName,
    setReserverName,
    reserverPhone,
    setReserverPhone,

    // Agreements
    agreePayment,
    setAgreePayment,
    agreeRefund,
    setAgreeRefund,
    agreeOptionChange,
    setAgreeOptionChange,
    allAgreed,
    handleToggleAllAgreements,

    // Images
    attachedImages,
    imageUrls,
    fileInputRef,

    // Order Items
    orderItems,
    editingIndex,

    // Modals
    isCancelModalOpen,
    setIsCancelModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDateChangeModalOpen,
    setIsDateChangeModalOpen,

    // Computed
    currentOptionPrice,
    totalQuantity,
    totalPrice,
    isOptionsValid,
    isCalendarValid,
    isAddingFromConfirm,
    isEditingFromConfirm,
    dateSelectionSignal,
    formatDateTime,

    // Handlers
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
  };
}
