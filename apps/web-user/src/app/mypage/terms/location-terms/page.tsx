import { TermsDocumentScreen } from "@/apps/web-user/features/terms/components/TermsDocumentScreen";
import Header from "@/apps/web-user/common/components/headers/Header";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";

export default function LocationTermsPage() {
  return (
    <>
      <Header variant="back-title" title="위치정보 이용약관" />
      <TermsDocumentScreen termsType="CONSUMER_LOCATION_TERMS" />
      <BottomNav />
    </>
  );
}
