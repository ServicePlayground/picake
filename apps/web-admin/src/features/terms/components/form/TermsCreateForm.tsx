import { useEffect, useState } from "react";
import { Button } from "@/apps/web-admin/common/components/buttons/Button";
import { TermsContentEditor } from "@/apps/web-admin/features/terms/components/form/TermsContentEditor";
import { Checkbox } from "@/apps/web-admin/common/components/inputs/Checkbox";
import { Input } from "@/apps/web-admin/common/components/inputs/Input";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/apps/web-admin/common/components/selects/Select";
import { useCreateTerms } from "@/apps/web-admin/features/terms/hooks/mutations/useTermsMutation";
import type {
  CreateTermsDocumentRequestDto,
  TermsType,
} from "@/apps/web-admin/features/terms/types/terms.dto";

interface TermsCreateFormProps {
  availableTypes: { value: TermsType; label: string }[];
  defaultType?: TermsType;
}

export function TermsCreateForm({ availableTypes, defaultType }: TermsCreateFormProps) {
  const [type, setType] = useState<TermsType>(defaultType ?? availableTypes[0]?.value);
  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [effectiveAt, setEffectiveAt] = useState("");
  const [activateNow, setActivateNow] = useState(false);

  const createMutation = useCreateTerms();

  useEffect(() => {
    if (defaultType) setType(defaultType);
  }, [defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !version || !title || !content || !effectiveAt) return;

    const dto: CreateTermsDocumentRequestDto = {
      type,
      version,
      title,
      content,
      effectiveAt: new Date(effectiveAt).toISOString(),
      activateNow,
    };

    createMutation.mutate(dto, {
      onSuccess: () => {
        setVersion("");
        setTitle("");
        setContent("");
        setEffectiveAt("");
        setActivateNow(false);
      },
    });
  };

  const isValid = !!type && !!version && !!title && !!content && !!effectiveAt;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>약관 유형</Label>
        <Select value={type} onValueChange={(v) => setType(v as TermsType)}>
          <SelectTrigger>
            <SelectValue placeholder="약관 유형 선택" />
          </SelectTrigger>
          <SelectContent>
            {availableTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="terms-version">버전</Label>
          <Input
            id="terms-version"
            placeholder="예: 1.0, 1.1, 2.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={createMutation.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="terms-effective-at">시행일</Label>
          <Input
            id="terms-effective-at"
            type="datetime-local"
            value={effectiveAt}
            onChange={(e) => setEffectiveAt(e.target.value)}
            disabled={createMutation.isPending}
          />
          <p className="text-xs text-muted-foreground">법적 효력이 발생하는 날짜</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="terms-title">약관 제목</Label>
        <Input
          id="terms-title"
          placeholder="예: 서비스 이용약관"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={createMutation.isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label>약관 내용</Label>
        <TermsContentEditor
          termsType={type}
          title={title}
          value={content}
          onChange={setContent}
          readOnly={createMutation.isPending}
        />
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <Checkbox
          checked={activateNow}
          onChange={setActivateNow}
          disabled={createMutation.isPending}
          label={
            <span>
              <span className="font-medium">등록 즉시 활성화</span>
              <span className="ml-2 text-sm text-muted-foreground">
                — 기존 활성 버전이 자동으로 비활성화됩니다
              </span>
            </span>
          }
        />
        <p className="mt-2 text-xs text-muted-foreground">
          체크하지 않으면 비활성 상태로 등록되며, 이후 버전 이력에서 별도로 활성화할 수 있습니다.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid || createMutation.isPending} variant="default">
          {createMutation.isPending ? "등록 중…" : "약관 등록"}
        </Button>
      </div>
    </form>
  );
}
