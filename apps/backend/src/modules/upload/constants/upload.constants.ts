/**
 * 업로드 관련 상수
 */
export const UPLOAD_CONSTANTS = {
  // 허용된 파일 타입 (MIME 타입)
  ALLOWED_MIME_TYPES: [
    // 이미지
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // 문서 (주석처리 - 이미지만 허용)
    // "application/pdf",
    // "application/msword",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    // "application/vnd.ms-excel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    // 기타 (주석처리 - 이미지만 허용)
    // "text/plain",
  ] as readonly string[],

  // 허용된 파일 확장자
  ALLOWED_EXTENSIONS: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    // 문서 확장자 (주석처리 - 이미지만 허용)
    // ".pdf",
    // ".doc",
    // ".docx",
    // ".xls",
    // ".xlsx",
    // ".txt",
  ] as readonly string[],

  // 차단된 파일 확장자 (실행 파일 등)
  BLOCKED_EXTENSIONS: [
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".pif",
    ".scr",
    ".vbs",
    ".js",
    ".jar",
    ".sh",
    ".php",
    ".jsp",
    ".asp",
    ".aspx",
    ".py",
    ".rb",
    ".pl",
    ".cgi",
    ".dll",
    ".so",
    ".dmg",
    ".app",
  ] as readonly string[],

  // 최대 파일 크기 (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes

  // 파일 이름 최대 길이
  MAX_FILENAME_LENGTH: 255,

  // 업로드 디렉토리 (S3 내부 경로)
  UPLOAD_DIRECTORY: "uploads",
} as const;

/**
 * 업로드 관련 에러 메시지
 */
export const UPLOAD_ERROR_MESSAGES = {
  FILE_NOT_UPLOADED: "파일이 업로드되지 않았습니다.",
} as const;

export const SWAGGER_EXAMPLES = {
  FILE_URL:
    "https://s3.ap-northeast-1.amazonaws.com/picake-uploads-staging-apne1/uploads/profile.png",
};
