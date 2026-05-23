import { cn } from "@/apps/web-admin/common/utils/classname.util";
import logoUrl from "@/apps/web-admin/assets/images/logo.png";

interface AdminAppLogoProps {
  className?: string;
  /** 표시 너비(px). 높이는 비율에 맞게 자동 */
  width?: number;
  alt?: string;
}

export function AdminAppLogo({ className, width = 120, alt = "Picake" }: AdminAppLogoProps) {
  return (
    <img
      src={logoUrl}
      alt={alt}
      className={cn("h-auto max-w-full object-contain object-center", className)}
      style={{ width: `${width}px`, height: "auto" }}
      decoding="async"
    />
  );
}
