import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/apps/web-user/common/components/icons";
import { PATHS } from "@/apps/web-user/common/constants/paths.constant";

/**
 * Play Store 미입점 동안 Android 사용자가 `/app` QR을 찍었을 때 보는 안내 페이지.
 *
 * 자동으로 웹으로 넘기지 않고 버튼을 누르게 합니다 — QR을 찍는 사람은 "앱을 받으려고" 찍은
 * 것이라, 안드로이드 앱이 아직 없다는 사실 자체가 전달돼야 하기 때문입니다. 자동 이동은
 * 그 메시지를 못 읽게 만들고 뒤로가기 루프도 생깁니다.
 *
 * Play Store에 입점하면 `/app`이 Android를 스토어로 바로 보내므로 이 페이지는 자연히 안 쓰입니다
 * ({@link ../route.ts}).
 */
export const metadata: Metadata = {
  title: "안드로이드 앱 준비 중",
  description: "Picake 안드로이드 앱은 준비 중이에요. 지금은 모바일 웹에서 바로 이용할 수 있어요.",
  // 명함 QR 전용 경유 페이지라 검색 노출은 불필요합니다.
  robots: { index: false, follow: false },
};

export default function AppDownloadAndroidPage() {
  return (
    // 100vh가 아니라 100dvh — 모바일 브라우저의 100vh는 주소창에 가려지는 영역까지 포함해서
    // 실제 보이는 높이보다 큽니다. 그대로 두면 하단 버튼이 접혀서 스크롤해야 보입니다.
    <main className="min-h-[100dvh] flex flex-col px-5 pt-6 pb-8">
      {/* flex-1 + justify-center: 버튼 위 남는 공간의 세로 중앙에 안내를 배치 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Icon name="logoPicake" width={80} height={80} />

        <h1 className="mt-6 text-xl font-bold text-gray-900">안드로이드 앱은 준비 중이에요</h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Picake 안드로이드 앱은 곧 Google Play에 출시돼요.
          <br />
          그때까지는 모바일 웹에서 앱과 똑같이
          <br />
          내 주변 케이크를 찾고 주문할 수 있어요.
        </p>
      </div>

      <Link
        href={PATHS.HOME}
        className="w-full h-[52px] flex items-center justify-center bg-primary text-white text-base font-bold rounded-lg transition-all duration-200"
      >
        모바일 웹으로 이용하기
      </Link>
    </main>
  );
}
