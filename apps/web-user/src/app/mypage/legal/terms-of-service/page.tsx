import { LegalDocumentScreen } from "@/apps/web-user/features/legal/components/LegalDocumentScreen";
import Header from "@/apps/web-user/common/components/headers/Header";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";

export default function TermsOfServicePage() {
  return (
    <>
      <Header variant="back-title" title="서비스 이용약관" />
      <LegalDocumentScreen filename="terms-of-service-v1.0.html" />
      <BottomNav />
    </>
  );
}
