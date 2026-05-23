import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-seller/common/components/cards/Card";
import { ROUTES } from "@/apps/web-seller/common/constants/route-paths.constant";
import type { SellerMypageProfileResponseDto } from "@/apps/web-seller/features/mypage/types/mypage.dto";

function formatConsentDate(iso: string | null): string {
  if (!iso) return "미동의";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ko-KR");
}

interface LegalRowProps {
  label: string;
  agreedAt: string | null;
  href: string;
}

function LegalRow({ label, agreedAt, href }: LegalRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-100 py-3 last:border-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-500">동의 일시: {formatConsentDate(agreedAt)}</p>
      </div>
      <Link
        to={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1 self-start rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 sm:self-auto"
      >
        약관 보기
        <ExternalLink className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

interface MypageLegalSectionProps {
  profile: SellerMypageProfileResponseDto;
}

export function MypageLegalSection({ profile }: MypageLegalSectionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">약관 및 개인정보</CardTitle>
      </CardHeader>
      <CardContent>
        <LegalRow
          label="서비스 이용약관"
          agreedAt={profile.agreedToTermsAt}
          href={ROUTES.LEGAL.TERMS_OF_SERVICE}
        />
        <LegalRow
          label="개인정보 처리방침"
          agreedAt={profile.agreedToPrivacyAt}
          href={ROUTES.LEGAL.PRIVACY_POLICY}
        />
      </CardContent>
    </Card>
  );
}
