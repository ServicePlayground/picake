import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LegalDocumentScreen } from "@/apps/web-seller/features/legal/components/LegalDocumentScreen";
import { ROUTES } from "@/apps/web-seller/common/constants/paths.constant";

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <ArrowLeft className="size-4" aria-hidden />
            돌아가기
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">개인정보 처리방침</h1>
        </div>
      </header>
      <div className="mx-auto max-w-3xl">
        <LegalDocumentScreen filename="privacy-policy-v1.0.html" />
      </div>
    </div>
  );
}
