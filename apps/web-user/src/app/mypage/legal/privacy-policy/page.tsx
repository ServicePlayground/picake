import { LegalDocumentScreen } from "@/apps/web-user/features/legal/components/LegalDocumentScreen";
import Header from "@/apps/web-user/common/components/headers/Header";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header variant="back-title" title="개인정보 처리방침" />
      <LegalDocumentScreen filename="privacy-policy-v1.0.html" />
      <BottomNav />
    </>
  );
}
