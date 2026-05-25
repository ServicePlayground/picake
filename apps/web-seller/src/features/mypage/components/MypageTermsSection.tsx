import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web-seller/common/components/cards/Card";
import { ROUTES } from "@/apps/web-seller/common/constants/paths.constant";
import type { SellerMypageProfileResponseDto } from "@/apps/web-seller/features/mypage/types/mypage.dto";

function formatConsentVersion(version: string | null): string {
  if (!version) return "미동의";
  return `v${version}`;
}

interface TermsRowProps {
  label: string;
  agreedVersion: string | null;
  href: string;
}

function TermsRow({ label, agreedVersion, href }: TermsRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-zinc-100 py-3 last:border-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-500">동의 버전: {formatConsentVersion(agreedVersion)}</p>
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

interface MypageTermsSectionProps {
  profile: SellerMypageProfileResponseDto;
}

export function MypageTermsSection({ profile }: MypageTermsSectionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">약관 및 개인정보</CardTitle>
      </CardHeader>
      <CardContent>
        <TermsRow
          label="서비스 이용약관"
          agreedVersion={profile.agreedTermsVersion}
          href={ROUTES.TERMS.TERMS_OF_SERVICE}
        />
        <TermsRow
          label="개인정보 처리방침"
          agreedVersion={profile.agreedPrivacyVersion}
          href={ROUTES.TERMS.PRIVACY_POLICY}
        />
      </CardContent>
    </Card>
  );
}
