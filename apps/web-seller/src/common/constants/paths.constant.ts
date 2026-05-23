export { ROUTES } from "@/apps/web-seller/common/constants/route-paths.constant";

import { ROUTES } from "@/apps/web-seller/common/constants/route-paths.constant";
import { RootPage } from "@/apps/web-seller/pages/Root";
import { StoreCreatePage } from "@/apps/web-seller/pages/store/Create";
import { StoreDetailHomePage } from "@/apps/web-seller/pages/store/detail/Home";
import { StoreDetailProductListPage } from "@/apps/web-seller/pages/store/detail/products/List";
import { StoreDetailProductCreatePage } from "@/apps/web-seller/pages/store/detail/products/Create";
import { StoreDetailProductDetailPage } from "@/apps/web-seller/pages/store/detail/products/Detail";
// 채팅 노출 시 복구
// import { StoreDetailChatListPage } from "@/apps/web-seller/pages/store/detail/chat/List";
// import { StoreDetailChatRoomPage } from "@/apps/web-seller/pages/store/detail/chat/Room";
import { StoreDetailEditPage } from "@/apps/web-seller/pages/store/detail/Edit";
import { StoreDetailCalendarPage } from "@/apps/web-seller/pages/store/detail/Calendar";
import { StoreDetailFeedListPage } from "@/apps/web-seller/pages/store/detail/feed/List";
import { StoreDetailFeedCreatePage } from "@/apps/web-seller/pages/store/detail/feed/Create";
import { StoreDetailFeedDetailPage } from "@/apps/web-seller/pages/store/detail/feed/Detail";
import { StoreDetailOrderListPage } from "@/apps/web-seller/pages/store/detail/orders/List";
import { StoreDetailOrderDetailPage } from "@/apps/web-seller/pages/store/detail/orders/Detail";
import { StoreDetailNotificationsListPage } from "@/apps/web-seller/pages/store/detail/notifications/List";
import { StoreDetailNotificationsSettingsPage } from "@/apps/web-seller/pages/store/detail/notifications/Settings";
import { StoreDetailStatisticsPage } from "@/apps/web-seller/pages/store/detail/statistics/Index";
import { LoginPage } from "@/apps/web-seller/pages/auth/Login";
import { FindAccountPage } from "@/apps/web-seller/pages/auth/FindAccount";
import { GoogleAuthCallbackPage } from "@/apps/web-seller/pages/auth/GoogleAuthCallback";
import { KakaoAuthCallbackPage } from "@/apps/web-seller/pages/auth/KakaoAuthCallback";
import { MypageIndexPage } from "@/apps/web-seller/pages/mypage/Index";
import { TermsOfServicePage } from "@/apps/web-seller/pages/legal/TermsOfService";
import { PrivacyPolicyPage } from "@/apps/web-seller/pages/legal/PrivacyPolicy";

// 인증 관련 경로 (AdminLayout 밖)
export const AUTH_ROUTE_CONFIG = [
  { path: ROUTES.AUTH.LOGIN, element: LoginPage },
  { path: ROUTES.AUTH.FIND_ACCOUNT, element: FindAccountPage },
  { path: ROUTES.AUTH.GOOGLE_REDIRECT_URI, element: GoogleAuthCallbackPage },
  { path: ROUTES.AUTH.KAKAO_REDIRECT_URI, element: KakaoAuthCallbackPage },
  { path: ROUTES.LEGAL.TERMS_OF_SERVICE, element: TermsOfServicePage },
  { path: ROUTES.LEGAL.PRIVACY_POLICY, element: PrivacyPolicyPage },
] as const;

// 관리자 관련 경로 (AdminLayout 안)
export const ADMIN_ROUTE_CONFIG = [
  { path: ROUTES.ROOT, element: RootPage },
  { path: ROUTES.MYPAGE, element: MypageIndexPage },
  // 스토어 관련 경로
  { path: ROUTES.STORE_CREATE, element: StoreCreatePage },
  { path: ROUTES.STORE_DETAIL_HOME(":storeId"), element: StoreDetailHomePage },
  { path: ROUTES.STORE_DETAIL_PRODUCTS(":storeId"), element: StoreDetailProductListPage },
  { path: ROUTES.STORE_DETAIL_PRODUCTS_LIST(":storeId"), element: StoreDetailProductListPage },
  { path: ROUTES.STORE_DETAIL_PRODUCTS_CREATE(":storeId"), element: StoreDetailProductCreatePage },
  {
    path: ROUTES.STORE_DETAIL_PRODUCTS_DETAIL(":storeId", ":productId"),
    element: StoreDetailProductDetailPage,
  },
  // { path: ROUTES.STORE_DETAIL_CHAT_LIST(":storeId"), element: StoreDetailChatListPage },
  // {
  //   path: ROUTES.STORE_DETAIL_CHAT_ROOM(":storeId", ":roomId"),
  //   element: StoreDetailChatRoomPage,
  // },
  { path: ROUTES.STORE_DETAIL_FEED_LIST(":storeId"), element: StoreDetailFeedListPage },
  { path: ROUTES.STORE_DETAIL_FEED_CREATE(":storeId"), element: StoreDetailFeedCreatePage },
  {
    path: ROUTES.STORE_DETAIL_FEED_DETAIL(":storeId", ":feedId"),
    element: StoreDetailFeedDetailPage,
  },
  { path: ROUTES.STORE_DETAIL_ORDERS_LIST(":storeId"), element: StoreDetailOrderListPage },
  {
    path: ROUTES.STORE_DETAIL_ORDERS_DETAIL(":storeId", ":orderId"),
    element: StoreDetailOrderDetailPage,
  },
  {
    path: ROUTES.STORE_DETAIL_STATISTICS_ORDERS(":storeId"),
    element: StoreDetailStatisticsPage,
  },
  {
    path: ROUTES.STORE_DETAIL_NOTIFICATIONS_LIST(":storeId"),
    element: StoreDetailNotificationsListPage,
  },
  {
    path: ROUTES.STORE_DETAIL_NOTIFICATIONS_SETTINGS(":storeId"),
    element: StoreDetailNotificationsSettingsPage,
  },
  { path: ROUTES.STORE_DETAIL_EDIT(":storeId"), element: StoreDetailEditPage },
  { path: ROUTES.STORE_DETAIL_CALENDAR(":storeId"), element: StoreDetailCalendarPage },
] as const;
