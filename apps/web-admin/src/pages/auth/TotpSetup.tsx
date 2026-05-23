import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Shield, Copy, Check, RefreshCw } from "lucide-react";
import { AuthBrandedCard } from "@/apps/web-admin/common/components/layouts/AuthBrandedCard";
import { Button } from "@/apps/web-admin/common/components/buttons/Button";
import { Input } from "@/apps/web-admin/common/components/inputs/Input";
import {
  useEnableTotp,
  useSetupTotpMutation,
} from "@/apps/web-admin/features/auth/hooks/mutations/useAuthMutation";
import { cn } from "@/apps/web-admin/common/utils/classname.util";
import { LoadingSpinner } from "@/apps/web-admin/common/components/loading/LoadingSpinner";
import { ROUTES } from "@/apps/web-admin/common/constants/paths.constant";
import type { AdminAuthTotpSetupState } from "@/apps/web-admin/features/auth/types/auth.dto";

export function TotpSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as AdminAuthTotpSetupState | null;
  const totpSetupPendingToken = state?.totpSetupPendingToken;
  const [totpCode, setTotpCode] = useState("");
  const [copied, setCopied] = useState(false);
  const setupTotpMutation = useSetupTotpMutation();
  const enableMutation = useEnableTotp();
  const qrData = setupTotpMutation.data;

  useEffect(() => {
    if (!totpSetupPendingToken) {
      navigate(ROUTES.AUTH.LOGIN, { replace: true });
    } else {
      setupTotpMutation.mutate({ totpSetupPendingToken });
    }
  }, [totpSetupPendingToken]);

  const handleCopy = async () => {
    if (!qrData?.secret) return;
    await navigator.clipboard.writeText(qrData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnable = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6 || !totpSetupPendingToken) return;
    enableMutation.mutate({ totpCode, totpSetupPendingToken });
  };

  return (
    <AuthBrandedCard
      title="Google OTP 설정"
      description="Google Authenticator 앱으로 2단계 인증을 설정하세요."
    >
      <div className="flex flex-col gap-6">
        {!qrData ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              {setupTotpMutation.isPending ? (
                <LoadingSpinner size="md" />
              ) : (
                <Shield className="h-8 w-8 text-zinc-600" />
              )}
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              {setupTotpMutation.isPending
                ? "OTP 설정 정보를 불러오는 중입니다..."
                : setupTotpMutation.isError
                  ? "QR 코드를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
                  : "Google Authenticator 앱을 설치한 후 아래 버튼을 눌러 QR 코드를 생성하세요."}
            </p>
            {!setupTotpMutation.isPending && (
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  if (totpSetupPendingToken) {
                    setupTotpMutation.mutate({ totpSetupPendingToken });
                  }
                }}
              >
                {setupTotpMutation.isError ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    다시 시도
                  </>
                ) : (
                  "OTP 설정 시작"
                )}
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Step 1: QR 스캔 */}
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-zinc-700">
                1. Google Authenticator에서 QR 코드를 스캔하세요
              </p>
              <div className="rounded-xl border-2 border-zinc-200 bg-white p-3">
                <QRCodeSVG value={qrData.otpauthUrl} size={180} />
              </div>
            </div>

            {/* Step 2: Secret 수동 입력 */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-zinc-700">
                2. QR 스캔이 안 되면 수동으로 키를 입력하세요
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                <code className="flex-1 break-all font-mono text-xs text-zinc-700">
                  {qrData.secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 text-zinc-400 transition-colors hover:text-zinc-700"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Step 3: 코드 입력 */}
            <form onSubmit={handleEnable} className="flex flex-col gap-3">
              <p className="text-sm font-medium text-zinc-700">
                3. 앱에 표시된 6자리 코드를 입력해 활성화하세요
              </p>
              <Input
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
                className={cn(
                  "w-full",
                  enableMutation.isSuccess && "bg-green-600 hover:bg-green-700",
                )}
                size="lg"
                disabled={
                  totpCode.length !== 6 || enableMutation.isSuccess || enableMutation.isPending
                }
              >
                {enableMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    처리 중…
                  </>
                ) : enableMutation.isSuccess ? (
                  "활성화 완료!"
                ) : (
                  "OTP 활성화"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthBrandedCard>
  );
}
