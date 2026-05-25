import { TERMS_PREVIEW_CONTENT_CLASS } from "@/apps/web-seller/features/terms/constants/terms.constant";

/** 약관 HTML 렌더링 영역 스타일 (Quill 출력 · web-admin 미리보기와 동일) */
export function getTermsPreviewContentStyles(): string {
  const c = TERMS_PREVIEW_CONTENT_CLASS;
  return `
    .${c} {
      padding: 16px 24px 32px;
      font-size: 14px;
      line-height: 1.8;
      color: #3f3f46;
    }
    .${c} h1 {
      font-size: 20px;
      font-weight: 700;
      color: #18181b;
      margin: 0 0 20px;
      scroll-margin-top: 60px;
    }
    .${c} h1:has(> br:only-child),
    .${c} h2:has(> br:only-child),
    .${c} h3:has(> br:only-child) {
      display: none;
    }
    .${c} h2 {
      font-size: 16px;
      font-weight: 700;
      color: #18181b;
      margin: 28px 0 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e4e7;
      scroll-margin-top: 60px;
    }
    .${c} h3 {
      font-size: 14px;
      font-weight: 600;
      color: #27272a;
      margin: 18px 0 8px;
      scroll-margin-top: 60px;
    }
    .${c} p { margin-bottom: 8px; }
    .${c} ol {
      list-style-type: decimal;
      padding-left: 18px;
      margin-bottom: 8px;
    }
    .${c} ul {
      list-style-type: disc;
      padding-left: 18px;
      margin-bottom: 8px;
    }
    .${c} li { margin-bottom: 5px; }
    .${c} li > ol { list-style-type: lower-alpha; margin-top: 5px; }
    .${c} li > ul { list-style-type: circle; margin-top: 5px; }
    .${c} .ql-align-center { text-align: center; }
    .${c} .ql-align-right { text-align: right; }
    .${c} .ql-align-justify { text-align: justify; }
    .${c} a {
      color: #0066cc;
      text-decoration: underline;
    }
    .${c} a:hover { color: #004499; }
    .${c} strong { color: #18181b; font-weight: 600; }
    .${c} blockquote {
      margin: 10px 0 16px;
      padding: 14px 16px;
      border-left: 3px solid #e4e4e7;
      background: #fafafa;
      color: #52525b;
    }
    .${c} table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px;
      font-size: 13px;
    }
    .${c} th {
      background: #f4f4f5;
      border: 1px solid #d4d4d8;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      color: #3f3f46;
    }
    .${c} td {
      border: 1px solid #d4d4d8;
      padding: 8px 10px;
      vertical-align: top;
      color: #52525b;
    }
  `;
}
