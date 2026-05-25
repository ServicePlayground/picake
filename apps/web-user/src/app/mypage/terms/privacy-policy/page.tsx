import { TermsDocumentScreen } from "@/apps/web-user/features/terms/components/TermsDocumentScreen";
import Header from "@/apps/web-user/common/components/headers/Header";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header variant="back-title" title="개인정보 처리방침" />
      <TermsDocumentScreen termsType="CONSUMER_PRIVACY_POLICY" />
      <BottomNav />
    </>
  );
}
