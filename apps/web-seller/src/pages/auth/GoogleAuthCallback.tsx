import { useEffect, useState, type ChangeEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { authApi } from "@/apps/web-seller/features/auth/apis/auth.api";
import { useGoogleRegister } from "@/apps/web-seller/features/auth/hooks/mutations/useAuthMutation";
import { useOAuthCodeOnce } from "@/apps/web-seller/features/auth/hooks/useOAuthCodeOnce";
import { useAuthStore } from "@/apps/web-seller/features/auth/store/auth.store";
import PhoneVerificationForm from "@/apps/web-seller/features/auth/components/forms/PhoneVerificationForm";
import { Input } from "@/apps/web-seller/common/components/inputs/Input";
import { PHONE_VERIFICATION_PURPOSE } from "@/apps/web-seller/features/auth/types/auth.dto";
import { ROUTES } from "@/apps/web-seller/common/constants/paths.constant";
import { useAlertStore } from "@/apps/web-seller/common/store/alert.store";
import getApiMessage from "@/apps/web-seller/common/utils/getApiMessage";
import { AUTH_ERROR_MESSAGES } from "@/apps/web-seller/features/auth/constants/auth.constant";
import { AuthBrandedCard } from "@/apps/web-seller/common/components/layouts/AuthBrandedCard";
import { ContentLoading } from "@/apps/web-seller/common/components/loading/ContentLoading";
import {
  SellerTermsAgreementSection,
  INITIAL_SELLER_TERMS_STATE,
  isRequiredSellerTermsAllChecked,
  type SellerTermsAgreementState,
} from "@/apps/web-seller/features/auth/components/SellerTermsAgreementSection";
import {
  getPendingOAuthRegister,
  setPendingOAuthRegister,
  clearPendingOAuthRegister,
  type PendingGoogleRegister,
} from "@/apps/web-seller/features/auth/utils/oauth-callback-pending.util";

function readInitialGoogleLoginData(): PendingGoogleRegister | null {
  const pending = getPendingOAuthRegister();
  return pending?.provider === "google" ? pending : null;
}

function stripOAuthCodeFromUrl(
  navigate: ReturnType<typeof useNavigate>,
  location: ReturnType<typeof useLocation>,
  searchParams: URLSearchParams,
) {
  const nextParams = new URLSearchParams(searchParams);
  nextParams.delete("code");
  nextParams.delete("state");
  const search = nextParams.toString();
  navigate({ pathname: location.pathname, search: search ? `?${search}` : "" }, { replace: true });
}

/**
 * 구글 OAuth 리다이렉트 콜백 — `code`로 `/v1/seller/auth/google/login` 호출
 * 휴대폰 미연동 시 백엔드가 `googleId`/`googleEmail`과 함께 400 → 이 화면에서 휴대폰 인증 후 register
 */
export function GoogleAuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const oauthCode = searchParams.get("code");
  const login = useAuthStore((s) => s.login);
  const googleRegisterMutation = useGoogleRegister();
  const { addAlert } = useAlertStore();

  const initialPending = readInitialGoogleLoginData();
  const [showPhoneVerification, setShowPhoneVerification] = useState(!!initialPending);
  const [googleLoginData, setGoogleLoginData] = useState<{
    googleId: string;
    googleEmail: string;
  } | null>(initialPending);
  const [displayName, setDisplayName] = useState("");
  const [nameError, setNameError] = useState("");
  const [termsState, setTermsState] = useState<SellerTermsAgreementState>(
    INITIAL_SELLER_TERMS_STATE,
  );

  useEffect(() => {
    if (!oauthCode && !showPhoneVerification && !googleLoginData) {
      navigate(ROUTES.ROOT, { replace: true });
    }
  }, [oauthCode, showPhoneVerification, googleLoginData, navigate]);

  useOAuthCodeOnce(oauthCode, async (code) => {
    try {
      const data = await authApi.googleLogin(code);
      clearPendingOAuthRegister();
      stripOAuthCodeFromUrl(navigate, location, searchParams);
      login({ navigate, accessToken: data.accessToken });
    } catch (error: unknown) {
      stripOAuthCodeFromUrl(navigate, location, searchParams);

      const err = error as {
        response?: {
          data?: {
            message?: string;
            data?: { googleId?: string; googleEmail?: string; message?: string };
          };
        };
      };
      const payload = (err?.response?.data?.data ?? err?.response?.data ?? {}) as {
        message?: string;
        googleId?: string;
        googleEmail?: string;
      };
      const message = payload.message ?? "";
      const googleId = payload.googleId;
      const googleEmail = payload.googleEmail;

      if (
        typeof message === "string" &&
        message.includes(AUTH_ERROR_MESSAGES.PHONE_VERIFICATION_REQUIRED) &&
        googleId &&
        googleEmail
      ) {
        const pending: PendingGoogleRegister = {
          provider: "google",
          googleId,
          googleEmail,
        };
        setPendingOAuthRegister(pending);
        setGoogleLoginData({ googleId, googleEmail });
        setShowPhoneVerification(true);
      } else {
        clearPendingOAuthRegister();
        navigate(ROUTES.AUTH.LOGIN, { replace: true });
        addAlert({
          message: getApiMessage.error(error),
          title: "오류",
          severity: "error",
        });
      }
    }
  });

  const validateDisplayName = (value: string) => {
    const t = value.trim();
    if (!t) {
      setNameError(AUTH_ERROR_MESSAGES.NAME_REQUIRED);
      return false;
    }
    if (t.length > 50) {
      setNameError(AUTH_ERROR_MESSAGES.NAME_MAX_LENGTH);
      return false;
    }
    setNameError("");
    return true;
  };

  const handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    if (value.trim()) validateDisplayName(value);
    else setNameError("");
  };

  const handlePhoneVerificationComplete = async (phone: string) => {
    if (!googleLoginData) return;
    if (!validateDisplayName(displayName)) return;
    if (!isRequiredSellerTermsAllChecked(termsState)) {
      addAlert({
        message: "필수 약관에 모두 동의해 주세요.",
        title: "약관 동의",
        severity: "warning",
      });
      return;
    }

    await googleRegisterMutation.mutateAsync({
      ...googleLoginData,
      phone,
      name: displayName.trim(),
      agreedToTerms: termsState.termsOfService,
      agreedToPrivacy: termsState.privacyPolicy,
    });
    clearPendingOAuthRegister();
  };

  if (showPhoneVerification) {
    return (
      <AuthBrandedCard
        title="회원가입"
        description={
          <>
            판매자 센터 이용을 위해 <strong className="font-medium text-zinc-700">실명</strong>과{" "}
            <strong className="font-medium text-zinc-700">휴대폰 인증</strong>이 필요합니다.
          </>
        }
        footer={
          <div className="flex justify-center">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-white hover:text-zinc-900"
            >
              <ArrowLeft className="size-4" aria-hidden />
              로그인으로 돌아가기
            </Link>
          </div>
        }
      >
        <div className="flex flex-col gap-8">
          <div className="space-y-2">
            <label htmlFor="google-auth-display-name" className="text-sm font-medium text-zinc-700">
              이름
            </label>
            <Input
              id="google-auth-display-name"
              type="text"
              name="displayName"
              value={displayName}
              onChange={handleDisplayNameChange}
              error={nameError}
              placeholder="실명을 입력해 주세요"
              maxLength={50}
              autoComplete="name"
              className="rounded-lg"
              aria-invalid={!!nameError}
            />
          </div>
          <PhoneVerificationForm
            onVerificationComplete={handlePhoneVerificationComplete}
            purpose={PHONE_VERIFICATION_PURPOSE.GOOGLE_REGISTRATION}
            canComplete={isRequiredSellerTermsAllChecked(termsState)}
          />
          <SellerTermsAgreementSection value={termsState} onChange={setTermsState} />
        </div>
      </AuthBrandedCard>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-12">
      <ContentLoading
        variant="page"
        message="구글 로그인 처리 중…"
        showLogo
        className="min-h-0 py-10"
      />
    </div>
  );
}
