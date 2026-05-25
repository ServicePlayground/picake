/**
 * 파일 크기 유효성 검증 및 에러 메시지 반환
 */
export const validateFileSize = (file: File, maxSize: number): string | null => {
  if (!file) {
    return null;
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return `파일 용량은 ${maxSizeMB}MB 이하로 업로드해주세요.`;
  }

  return null;
};

/**
 * 최대 이미지 개수 유효성 검증 및 에러 메시지 반환
 */
export const validateMaxImages = (currentImageCount: number, maxImages: number): string | null => {
  if (currentImageCount >= maxImages) {
    return `최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`;
  }

  return null;
};

/**
 * 파일 타입 유효성 검증 및 에러 메시지 반환
 */
export const validateFileType = (file: File, accept: string): string | null => {
  if (!file || !accept) {
    return null;
  }

  const acceptedExtensions = accept
    .split(",")
    .map((ext) => ext.trim().toLowerCase())
    .filter((ext) => ext.length > 0);

  if (acceptedExtensions.length === 0) {
    return null;
  }

  const fileName = file.name.toLowerCase();
  const lastDotIndex = fileName.lastIndexOf(".");
  const fileExtension =
    lastDotIndex !== -1 && lastDotIndex < fileName.length - 1
      ? fileName.substring(lastDotIndex)
      : "";

  if (!fileExtension) {
    const allowedTypes = acceptedExtensions
      .map((ext) => (ext.startsWith(".") ? ext : ext.split("/")[1] || ext))
      .join(", ");
    return `${allowedTypes} 형식의 이미지만 업로드 가능합니다.`;
  }

  const isValidExtension = acceptedExtensions.some((accepted) => {
    const normalizedAccepted = accepted.toLowerCase();
    if (normalizedAccepted.startsWith(".")) {
      return fileExtension === normalizedAccepted;
    }
    return false;
  });

  if (!isValidExtension) {
    const allowedTypes = acceptedExtensions
      .map((ext) => (ext.startsWith(".") ? ext : ext.split("/")[1] || ext))
      .join(", ");
    return `${allowedTypes} 형식의 이미지만 업로드 가능합니다.`;
  }

  return null;
};
