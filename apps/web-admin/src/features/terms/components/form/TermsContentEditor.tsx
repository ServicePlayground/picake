import { useMemo, useRef, useState } from "react";
import { Eye, FileText } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/apps/web-admin/common/components/buttons/Button";
import { TERMS_TYPE_LABEL } from "@/apps/web-admin/features/terms/constants/terms.constant";
import { TermsHtmlPreviewDialog } from "@/apps/web-admin/features/terms/components/dialog/TermsHtmlPreviewDialog";
import type { TermsType } from "@/apps/web-admin/features/terms/types/terms.dto";
import {
  getTermsContentSample,
  hasTermsContentSample,
} from "@/apps/web-admin/features/terms/utils/terms-content-samples.util";

export type TermsContentInputMode = "editor" | "html";

interface TermsContentEditorProps {
  termsType: TermsType;
  title: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function TermsContentEditor({
  termsType,
  title,
  value,
  onChange,
  readOnly,
}: TermsContentEditorProps) {
  const [inputMode, setInputMode] = useState<TermsContentInputMode>("editor");
  const [previewOpen, setPreviewOpen] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link"],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
    }),
    [],
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "color",
    "background",
  ];

  const canLoadSample = inputMode === "html" && hasTermsContentSample(termsType);
  const canPreview = value.trim().length > 0;
  const previewDialogTitle = title.trim() || TERMS_TYPE_LABEL[termsType];

  const handleLoadSample = () => {
    const sample = getTermsContentSample(termsType);
    if (!sample) return;

    if (value.trim()) {
      const ok = window.confirm(
        "선택한 약관 유형의 HTML 샘플로 내용을 채웁니다.\n기존에 입력한 내용은 사라집니다. 계속할까요?",
      );
      if (!ok) return;
    }

    onChange(sample);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex rounded-md border border-border p-0.5"
          role="tablist"
          aria-label="약관 내용 입력 방식"
        >
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === "editor"}
            disabled={readOnly}
            onClick={() => setInputMode("editor")}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              inputMode === "editor"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            에디터
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inputMode === "html"}
            disabled={readOnly}
            onClick={() => setInputMode("html")}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              inputMode === "html"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            HTML
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={readOnly || !canPreview}
            onClick={() => setPreviewOpen(true)}
            className="h-8 shrink-0"
          >
            <Eye className="size-3.5" aria-hidden />
            미리보기
          </Button>
          {canLoadSample && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={readOnly}
              onClick={handleLoadSample}
              className="h-8 shrink-0"
            >
              <FileText className="size-3.5" aria-hidden />
              샘플 불러오기
            </Button>
          )}
        </div>
      </div>

      {inputMode === "editor" ? (
        <div className="quill-editor-wrapper">
          <style>{`
            .quill-editor-wrapper .quill .ql-toolbar {
              border-top-left-radius: 4px;
              border-top-right-radius: 4px;
              background-color: hsl(var(--muted));
            }
            .quill-editor-wrapper .quill .ql-container {
              min-height: 400px;
              font-size: 14px;
              border-bottom-left-radius: 4px;
              border-bottom-right-radius: 4px;
            }
            .quill-editor-wrapper .quill .ql-editor {
              min-height: 400px;
            }
            .quill-editor-wrapper .quill .ql-editor.ql-blank::before {
              content: none;
            }
          `}</style>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            readOnly={readOnly}
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          placeholder="<h1>약관 제목</h1>&#10;<p>내용…</p>"
          className="min-h-[400px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm leading-relaxed text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      )}

      <TermsHtmlPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewDialogTitle}
        content={value}
        description="작성 중인 내용 미리보기"
      />
    </div>
  );
}
