import { TermsDocumentScreen } from "@/apps/web-user/features/terms/components/TermsDocumentScreen";
import Header from "@/apps/web-user/common/components/headers/Header";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";

export default function ThirdPartyConsentPage() {
  return (
    <>
      <Header variant="back-title" title="개인정보 제3자 제공 동의" />
      <TermsDocumentScreen termsType="CONSUMER_THIRD_PARTY_CONSENT" />
      <BottomNav />
    </>
  );
}
