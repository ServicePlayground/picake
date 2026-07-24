import { notFound } from "next/navigation";
import { isProduction } from "@/apps/web-user/common/utils/environment.util";

export default function QaLayout({ children }: { children: React.ReactNode }) {
  if (isProduction(process.env.NEXT_PUBLIC_NODE_ENV)) {
    notFound();
  }

  return children;
}
