import { useState } from "react";
import { Eye, FileText } from "lucide-react";
import { Button } from "@/apps/web-admin/common/components/buttons/Button";
import { TERMS_TYPE_LABEL } from "@/apps/web-admin/features/terms/constants/terms.constant";
import { TermsHtmlPreviewDialog } from "@/apps/web-admin/features/terms/components/dialog/TermsHtmlPreviewDialog";
import type { TermsType } from "@/apps/web-admin/features/terms/types/terms.dto";
import {
  getTermsContentSample,
  hasTermsContentSample,
} from "@/apps/web-admin/features/terms/utils/terms-content-samples.util";

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
  const [previewOpen, setPreviewOpen] = useState(false);

  const canLoadSample = hasTermsContentSample(termsType);
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
      <div className="flex flex-wrap items-center justify-end gap-2">
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

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        placeholder="<h1>약관 제목</h1>&#10;<p>내용…</p>"
        className="min-h-[400px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm leading-relaxed text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />

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
