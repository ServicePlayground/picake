import React, { useState, useRef } from "react";
import { BaseButton as Button } from "@/apps/web-seller/common/components/buttons/BaseButton";
import { CloudUpload, Trash2 } from "lucide-react";
import { cn } from "@/apps/web-seller/common/utils/classname.util";
import { LoadingSpinner } from "@/apps/web-seller/common/components/loading/LoadingSpinner";
import { useUploadFile } from "@/apps/web-seller/features/upload/hooks/mutations/useUploadMutation";
import { ImagePreview } from "@/apps/web-seller/common/components/images/ImagePreview";
import {
  validateFileSize,
  validateMaxImages,
  validateFileType,
} from "@/apps/web-seller/features/upload/utils/validator.util";

export interface ImageMultiUploadProps {
  value?: string[]; // 업로드된 이미지 URL 배열
  onChange?: (urls: string[]) => void; // 이미지 URL 배열 변경 핸들러
  accept?: string; // 허용된 이미지 확장자
  maxSize?: number; // 최대 파일 크기 (bytes)
  maxImages?: number; // 최대 이미지 개수
  width?: number | string; // 컨테이너 너비
  height?: number | string; // 컨테이너 높이
  enableDragDrop?: boolean; // 드래그앤드롭 활성화 여부
  showMinResolutionHint?: boolean; // 최소 해상도 안내 문구 표시 여부
}

export const ImageMultiUpload: React.FC<ImageMultiUploadProps> = ({
  value = [],
  onChange,
  accept = [".jpg", ".jpeg", ".png", ".webp"].join(","),
  maxSize = 10 * 1024 * 1024, // 10MB
  maxImages = 10,
  width,
  height,
  enableDragDrop = true,
  showMinResolutionHint = true,
}) => {
  const [uploadErrors, setUploadErrors] = useState<Record<number, string>>({});
  const [singleImageError, setSingleImageError] = useState<string | null>(null); // 단일 이미지 모드용 오류
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFile();

  const isSingleMode = maxImages === 1;

  // 오류 설정 헬퍼 함수
  const setError = (error: string, index?: number) => {
    if (isSingleMode) {
      setSingleImageError(error);
    } else if (index !== undefined) {
      setUploadErrors((prev) => ({ ...prev, [index]: error }));
    }
  };

  // 오류 초기화 헬퍼 함수
  const clearError = (index?: number) => {
    if (isSingleMode) {
      setSingleImageError(null);
    } else if (index !== undefined) {
      setUploadErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  // 공통 파일 처리 핸들러
  const processFile = async (file: File, index?: number) => {
    if (!file) return;

    // 파일 타입 유효성 검증
    const fileTypeError = validateFileType(file, accept);
    if (fileTypeError) {
      setError(fileTypeError, index);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 파일 크기 유효성 검증
    const fileSizeError = validateFileSize(file, maxSize);
    if (fileSizeError) {
      setError(fileSizeError, index);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 최대 이미지 개수 유효성 검증
    const maxImagesError = validateMaxImages(value.length, maxImages);
    if (maxImagesError) {
      setError(maxImagesError, index);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 오류 초기화 및 업로드 상태 설정
    clearError(index);
    const targetIndex = isSingleMode ? 0 : (index ?? value.length);
    if (targetIndex !== undefined) {
      setUploadingIndex(targetIndex);
    }

    try {
      const response = await uploadMutation.mutateAsync(file);
      // 단일 이미지 모드에서는 기존 이미지를 교체, 다중 이미지 모드에서는 추가
      const newUrls = isSingleMode ? [response.fileUrl] : [...value, response.fileUrl];
      onChange?.(newUrls);
    } catch (error) {
      // 업로드 실패 시 오류 메시지 설정 (이미 onError에서 alert가 표시되므로 여기서는 로컬 오류만 설정)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.";
      setError(errorMessage, index);
    } finally {
      setUploadingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 첫 번째 파일만 처리 (1개씩만 선택)
    if (value.length >= maxImages) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    await processFile(files[0], value.length);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file, value.length);
  };

  // 이미지 삭제 핸들러
  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const newUrls = value.filter((_, i) => i !== index);
    onChange?.(newUrls);
    clearError(index);
  };

  // 파일 선택 버튼 클릭 핸들러
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = value.length < maxImages;
  const isUploading = uploadMutation.isPending && uploadingIndex !== null;

  // 단일 이미지 모드인 경우 (maxImages === 1)
  if (isSingleMode && width && height) {
    const singleImageUrl = value[0];
    return (
      <div className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          className={cn(
            "relative box-border rounded-md overflow-hidden mb-2 border flex items-center justify-center transition-colors",
            singleImageUrl ? "border-solid bg-muted" : "border-dashed bg-muted/50",
            singleImageError && "border-destructive",
            isDragging && enableDragDrop && "border-primary bg-muted",
            !singleImageUrl && !isUploading && "cursor-pointer hover:border-primary hover:bg-muted",
            isUploading && "cursor-not-allowed opacity-60",
          )}
          style={{ width, maxWidth: "100%", height }}
          onClick={!singleImageUrl && !isUploading ? handleButtonClick : undefined}
          onDragOver={enableDragDrop ? handleDragOver : undefined}
          onDragEnter={enableDragDrop ? handleDragEnter : undefined}
          onDragLeave={enableDragDrop ? handleDragLeave : undefined}
          onDrop={enableDragDrop ? handleDrop : undefined}
        >
          {singleImageUrl ? (
            <ImagePreview src={singleImageUrl} />
          ) : isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="lg" className="text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4">
              <CloudUpload className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {enableDragDrop
                  ? "이미지를 클릭하거나 드래그하여 업로드"
                  : "이미지를 클릭하여 업로드"}
              </p>
            </div>
          )}

          {isUploading && singleImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <LoadingSpinner size="lg" className="text-white" aria-hidden />
            </div>
          )}

          {singleImageUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => handleDelete(e, 0)}
              disabled={isUploading}
              className="absolute top-2 right-2 bg-white hover:bg-gray-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {singleImageError && <p className="text-xs text-destructive mt-1">{singleImageError}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          허용 파일 형식: {accept}
          <br />
          {showMinResolutionHint && width && height && (
            <>
              최소 해상도 {width}x{height} 권장
              <br />
            </>
          )}
          최대 파일 크기: {maxSize / (1024 * 1024)}MB
          <br />
        </p>
      </div>
    );
  }

  // 다중 이미지 모드 (기존 그리드 레이아웃)
  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        className={cn(
          width && height
            ? "flex flex-wrap gap-5"
            : "grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        )}
      >
        {value.map((url, index) => (
          <div
            key={index}
            className={cn("relative", width && height ? "" : "w-full aspect-square")}
            style={width && height ? { width, height } : undefined}
          >
            <div
              className={cn(
                "relative w-full h-full rounded-md overflow-hidden border bg-muted",
                uploadErrors[index] && "border-destructive",
              )}
            >
              <ImagePreview src={url} />
              {uploadingIndex === index && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <LoadingSpinner size="lg" className="text-white" aria-hidden />
                </div>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => handleDelete(e, index)}
                disabled={uploadingIndex === index}
                className="absolute top-2 right-2 bg-white hover:bg-gray-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {uploadErrors[index] && (
                <div className="absolute bottom-0 left-0 right-0 bg-destructive text-destructive-foreground p-1 text-xs">
                  {uploadErrors[index]}
                </div>
              )}
            </div>
          </div>
        ))}

        {canAddMore && (
          <div
            className={cn("relative", width && height ? "" : "w-full aspect-square")}
            style={width && height ? { width, height } : undefined}
          >
            <div
              className={cn(
                "relative w-full h-full box-border rounded-md overflow-hidden border border-dashed bg-muted/50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-muted transition-colors",
                isDragging && enableDragDrop && "border-primary bg-muted",
              )}
              onClick={handleButtonClick}
              onDragOver={enableDragDrop ? handleDragOver : undefined}
              onDragEnter={enableDragDrop ? handleDragEnter : undefined}
              onDragLeave={enableDragDrop ? handleDragLeave : undefined}
              onDrop={enableDragDrop ? handleDrop : undefined}
            >
              <div className="flex flex-col items-center gap-1">
                <CloudUpload className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground text-center px-2">
                  {enableDragDrop ? "이미지를 클릭하거나 드래그하여 업로드" : "이미지 추가"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 다중 이미지 모드에서 새로 업로드하려는 이미지의 오류 표시 */}
      {uploadErrors[value.length] && (
        <p className="text-xs text-destructive mt-1">{uploadErrors[value.length]}</p>
      )}

      <p className="text-xs text-muted-foreground mt-1">
        허용 파일 형식: {accept}
        <br />
        {showMinResolutionHint && width && height && (
          <>
            최소 해상도 {width}x{height} 권장
            <br />
          </>
        )}
        최대 파일 크기: {maxSize / (1024 * 1024)}MB
        <br />
        최대 이미지 개수: {maxImages}개<br />
      </p>
    </div>
  );
};
