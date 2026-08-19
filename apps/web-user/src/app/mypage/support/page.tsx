import Header from "@/apps/web-user/common/components/headers/Header";
import { CustomerSupportScreen } from "@/apps/web-user/features/mypage/components/CustomerSupportScreen";

export default function SupportPage() {
  return (
    <div>
      <Header variant="back-title" title="고객센터" />
      <CustomerSupportScreen />
    </div>
  );
}
