import { LegalDocumentScreen } from "@/apps/web-user/features/legal/components/LegalDocumentScreen";
import Header from "@/apps/web-user/common/components/headers/Header";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";

export default function LocationTermsPage() {
  return (
    <>
      <Header variant="back-title" title="위치정보 이용약관" />
      <LegalDocumentScreen filename="location-terms-v1.0.html" />
      <BottomNav />
    </>
  );
}
