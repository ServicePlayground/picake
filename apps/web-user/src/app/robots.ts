import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/apps/web-user/common/constants/site.constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/mypage",
        "/mypage/",
        "/order",
        "/order/",
        "/auth",
        "/auth/",
        "/alarm",
        "/chat",
        "/chat/",
        "/reservation",
        "/reservation/",
        "/saved",
      ],
    },
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
  };
}
