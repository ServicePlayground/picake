import { LegalDocumentScreen } from "@/apps/web-user/features/legal/components/LegalDocumentScreen";
import Header from "@/apps/web-user/common/components/headers/Header";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";

export default function ThirdPartyConsentPage() {
  return (
    <>
      <Header variant="back-title" title="개인정보 제3자 제공 동의" />
      <LegalDocumentScreen filename="third-party-consent-v1.0.html" />
      <BottomNav />
    </>
  );
}
