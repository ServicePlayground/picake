import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { AuthBrandedCard } from "@/apps/web-admin/common/components/layouts/AuthBrandedCard";
import { Button } from "@/apps/web-admin/common/components/buttons/Button";
import { Input } from "@/apps/web-admin/common/components/inputs/Input";
import { ROUTES } from "@/apps/web-admin/common/constants/paths.constant";
import { useVerifyTotpLogin } from "@/apps/web-admin/features/auth/hooks/mutations/useAuthMutation";
import { LoadingSpinner } from "@/apps/web-admin/common/components/loading/LoadingSpinner";
import type { AdminAuthTotpVerifyState } from "@/apps/web-admin/features/auth/types/auth.dto";

export function TotpVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const totpPendingToken = (location.state as AdminAuthTotpVerifyState | null)?.totpPendingToken;
  const [totpCode, setTotpCode] = useState("");
  const verifyMutation = useVerifyTotpLogin();

  useEffect(() => {
    if (!totpPendingToken) {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    }
  }, [totpPendingToken, navigate]);

  if (!totpPendingToken) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) return;
    verifyMutation.mutate({ totpPendingToken, totpCode });
  };

  return (
    <AuthBrandedCard
      title="2단계 인증"
      description={
        <span className="flex flex-col items-center gap-1">
          <ShieldCheck className="h-5 w-5 text-zinc-400" />
          Google Authenticator 앱에서 6자리 코드를 입력하세요.
        </span>
      }
      footer={
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate(ROUTES.AUTH.LOGIN)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-white hover:text-zinc-900"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="인증 코드"
          id="totpCode"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="000000"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="text-center font-mono text-2xl tracking-[0.5em]"
          autoFocus
        />

        <Button
          type="submit"
          className="mt-1 w-full"
          size="lg"
          disabled={totpCode.length !== 6 || verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              확인
            </>
          ) : (
            "확인"
          )}
        </Button>
      </form>
    </AuthBrandedCard>
  );
}
