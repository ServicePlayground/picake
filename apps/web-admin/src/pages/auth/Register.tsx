import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthBrandedCard } from "@/apps/web-admin/common/components/layouts/AuthBrandedCard";
import { Button } from "@/apps/web-admin/common/components/buttons/Button";
import { Input } from "@/apps/web-admin/common/components/inputs/Input";
import { BaseInput } from "@/apps/web-admin/common/components/inputs/BaseInput";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { ROUTES } from "@/apps/web-admin/common/constants/paths.constant";
import { useRegister } from "@/apps/web-admin/features/auth/hooks/mutations/useAuthMutation";
import { LoadingSpinner } from "@/apps/web-admin/common/components/loading/LoadingSpinner";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

const USERNAME_RE = /^[a-zA-Z0-9_]{4,20}$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false, confirm: false });
  const registerMutation = useRegister();

  const usernameError =
    touched.username && !USERNAME_RE.test(username)
      ? "4-20자의 영문, 숫자, 언더스코어만 사용 가능합니다."
      : undefined;

  const passwordError =
    touched.password && !PASSWORD_RE.test(password)
      ? "8자 이상의 영문 대소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다."
      : undefined;

  const confirmError =
    touched.confirm && password !== confirmPassword ? "비밀번호가 일치하지 않습니다." : undefined;

  const isValid =
    USERNAME_RE.test(username) && PASSWORD_RE.test(password) && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true, confirm: true });
    if (!isValid) return;
    registerMutation.mutate({ username: username.trim(), password });
  };

  return (
    <AuthBrandedCard
      title="관리자 계정 생성"
      description="아이디와 비밀번호를 설정하세요."
      footer={
        <div className="flex justify-center">
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-white hover:text-zinc-900"
          >
            이미 계정이 있으신가요?
            <span className="font-medium underline underline-offset-2">로그인</span>
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="아이디"
          id="username"
          type="text"
          placeholder="4-20자 (영문, 숫자, _)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, username: true }))}
          error={usernameError}
          autoFocus
        />

        <div className="w-full">
          <Label htmlFor="password" className="block mb-2 text-sm font-medium text-foreground">
            비밀번호
          </Label>
          <div className="relative">
            <BaseInput
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="8자 이상, 대소문자·숫자·특수문자 포함"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className={cn(
                "h-12 rounded-md px-4 pr-10 text-base transition-colors",
                passwordError && "border-destructive focus-visible:ring-destructive",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError ? (
            <p className="mb-0 mt-1.5 text-xs text-destructive">{passwordError}</p>
          ) : null}
        </div>

        <Input
          label="비밀번호 확인"
          id="confirm"
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호를 다시 입력하세요"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          error={confirmError}
        />

        <Button
          type="submit"
          className="mt-1 w-full"
          size="lg"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              계정 만들기
            </>
          ) : (
            "계정 만들기"
          )}
        </Button>
      </form>
    </AuthBrandedCard>
  );
}
