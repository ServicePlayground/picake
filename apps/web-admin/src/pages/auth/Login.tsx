import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AuthBrandedCard } from "@/apps/web-admin/common/components/layouts/AuthBrandedCard";
import { Button } from "@/apps/web-admin/common/components/buttons/Button";
import { Input } from "@/apps/web-admin/common/components/inputs/Input";
import { BaseInput } from "@/apps/web-admin/common/components/inputs/BaseInput";
import { Label } from "@/apps/web-admin/common/components/labels/Label";
import { ROUTES } from "@/apps/web-admin/common/constants/paths.constant";
import { useLogin } from "@/apps/web-admin/features/auth/hooks/mutations/useAuthMutation";
import { LoadingSpinner } from "@/apps/web-admin/common/components/loading/LoadingSpinner";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <AuthBrandedCard
      title="Picake 관리자 센터"
      description="관리자 계정으로 로그인하세요."
      footer={
        <div className="flex justify-center">
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-white hover:text-zinc-900"
          >
            계정이 없으신가요?
            <span className="font-medium underline underline-offset-2">회원가입</span>
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="아이디"
          id="username"
          type="text"
          placeholder="아이디를 입력하세요"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
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
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={cn("h-12 rounded-md px-4 pr-10 text-base transition-colors")}
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
        </div>

        <Button
          type="submit"
          className="mt-1 w-full"
          size="lg"
          disabled={!username.trim() || !password || loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              로그인
            </>
          ) : (
            "로그인"
          )}
        </Button>
      </form>
    </AuthBrandedCard>
  );
}
