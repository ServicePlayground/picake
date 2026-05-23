import Header from "@/apps/web-user/common/components/headers/Header";
import { VersionInfoScreen } from "@/apps/web-user/features/mypage/components/VersionInfoScreen";
import { BottomNav } from "@/apps/web-user/common/components/navigation/BottomNav";

export default function VersionPage() {
  return (
    <div>
      <Header variant="back-title" title="버전정보" />
      <VersionInfoScreen />
      <BottomNav />
    </div>
  );
}
