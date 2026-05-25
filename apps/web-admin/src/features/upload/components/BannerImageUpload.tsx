import React, { useRef, useState } from "react";
import { CloudUpload, Trash2 } from "lucide-react";
import { BaseButton as Button } from "@/apps/web-admin/common/components/buttons/BaseButton";
import { LoadingSpinner } from "@/apps/web-admin/common/components/loading/LoadingSpinner";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import { useUploadFile } from "@/apps/web-admin/features/upload/hooks/mutations/useUploadMutation";
import {
  validateFileSize,
  validateFileType,
} from "@/apps/web-admin/features/upload/utils/validator.util";

export interface BannerImageUploadProps {
  value?: string;
  onChange?: (url: string | undefined) => void;
  accept?: string;
  maxSize?: number;
  width?: number | string;
  maxWidth?: number | string;
  height?: number | string;
  enableDragDrop?: boolean;
  disabled?: boolean;
}

export function BannerImageUpload({
  value,
  onChange,
  accept = ".jpg,.jpeg,.png,.webp",
  maxSize = 10 * 1024 * 1024,
  width = "100%",
  maxWidth = 560,
  height = 200,
  enableDragDrop = true,
  disabled = false,
}: BannerImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadFile();

  const isUploading = uploadMutation.isPending;
  const isBusy = disabled || isUploading;

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    const typeError = validateFileType(file, accept);
    if (typeError) {
      setError(typeError);
      return;
    }

    const sizeError = validateFileSize(file, maxSize);
    if (sizeError) {
      setError(sizeError);
      return;
    }

    setError(null);
    try {
      const { fileUrl } = await uploadMutation.mutateAsync(file);
      onChange?.(fileUrl);
    } catch {
      setError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange?.(undefined);
    setError(null);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isBusy}
      />

      <div
        className={cn(
          "relative box-border mb-2 flex items-center justify-center overflow-hidden rounded-md border transition-colors",
          value ? "border-solid bg-muted" : "border-dashed bg-muted/50",
          error && "border-destructive",
          isDragging && enableDragDrop && "border-primary bg-muted",
          !value && !isUploading && !disabled && "cursor-pointer hover:border-primary hover:bg-muted",
          isBusy && "cursor-not-allowed opacity-60",
        )}
        style={{ width, maxWidth: maxWidth ?? "100%", height }}
        onClick={!value && !isBusy ? handleButtonClick : undefined}
        onDragOver={
          enableDragDrop && !isBusy
            ? (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }
            : undefined
        }
        onDragEnter={
          enableDragDrop && !isBusy
            ? (e) => {
                e.preventDefault();
                setIsDragging(true);
              }
            : undefined
        }
        onDragLeave={
          enableDragDrop && !isBusy
            ? (e) => {
                e.preventDefault();
                setIsDragging(false);
              }
            : undefined
        }
        onDrop={
          enableDragDrop && !isBusy
            ? async (e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) await processFile(file);
              }
            : undefined
        }
      >
        {value ? (
          <img src={value} alt="배너 미리보기" className="h-full w-full object-cover" />
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="lg" className="text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">업로드 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            <CloudUpload className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              {enableDragDrop
                ? "이미지를 클릭하거나 드래그하여 업로드"
                : "이미지를 클릭하여 업로드"}
            </p>
          </div>
        )}

        {isUploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <LoadingSpinner size="lg" className="text-white" aria-hidden />
          </div>
        )}

        {value && !isBusy && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="absolute right-2 top-2 bg-white hover:bg-gray-200"
            aria-label="이미지 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      <p className="mt-1 text-xs text-muted-foreground">허용 파일 형식: {accept}</p>
    </div>
  );
}
