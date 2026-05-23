import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Checkbox } from "@/apps/web-seller/common/components/inputs/Checkbox";
import { ROUTES } from "@/apps/web-seller/common/constants/route-paths.constant";
import { cn } from "@/apps/web-seller/common/utils/classname.util";

export interface SellerTermsAgreementState {
  termsOfService: boolean;
  privacyPolicy: boolean;
}

export const INITIAL_SELLER_TERMS_STATE: SellerTermsAgreementState = {
  termsOfService: false,
  privacyPolicy: false,
};

export function isRequiredSellerTermsAllChecked(state: SellerTermsAgreementState): boolean {
  return state.termsOfService && state.privacyPolicy;
}

interface SellerTermsAgreementSectionProps {
  value: SellerTermsAgreementState;
  onChange: (next: SellerTermsAgreementState) => void;
}

interface TermsItem {
  key: keyof SellerTermsAgreementState;
  label: string;
  href: string;
}

const TERMS_ITEMS: TermsItem[] = [
  {
    key: "termsOfService",
    label: "서비스 이용약관",
    href: ROUTES.LEGAL.TERMS_OF_SERVICE,
  },
  {
    key: "privacyPolicy",
    label: "개인정보 처리방침",
    href: ROUTES.LEGAL.PRIVACY_POLICY,
  },
];

const TERMS_ROW_CLASS = "flex min-h-7 items-center justify-between gap-1.5";
const TERMS_LINK_SLOT_CLASS = "flex size-6 shrink-0 items-center justify-center";

export function SellerTermsAgreementSection({ value, onChange }: SellerTermsAgreementSectionProps) {
  const allChecked = TERMS_ITEMS.every((item) => value[item.key]);

  return (
    <div className="border-t border-zinc-100 pt-4">
      <p className="mb-2 text-sm font-medium text-zinc-900">약관 동의</p>

      <div className="flex flex-col gap-1">
        <div className={TERMS_ROW_CLASS}>
          <Checkbox
            checked={allChecked}
            onChange={(checked) =>
              onChange({
                termsOfService: checked,
                privacyPolicy: checked,
              })
            }
            label={<span className="font-medium">전체 동의</span>}
            className="min-w-0 flex-1"
          />
          <span className={cn(TERMS_LINK_SLOT_CLASS, "invisible")} aria-hidden>
            <ChevronRight className="size-4" />
          </span>
        </div>

        {TERMS_ITEMS.map((item) => (
          <div key={item.key} className={TERMS_ROW_CLASS}>
            <Checkbox
              checked={value[item.key]}
              onChange={(checked) => onChange({ ...value, [item.key]: checked })}
              label={
                <>
                  <span className="mr-1">[필수]</span>
                  {item.label}
                </>
              }
              className="min-w-0 flex-1"
            />
            <Link
              to={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(TERMS_LINK_SLOT_CLASS, "text-zinc-400 hover:text-zinc-700")}
              aria-label={`${item.label} 보기`}
            >
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
