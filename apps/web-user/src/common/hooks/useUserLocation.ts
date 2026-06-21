"use client";

import { useState, useEffect, useCallback } from "react";
import { useUserCurrentLocationStore } from "@/apps/web-user/common/store/user-current-location.store";
import { isWebViewEnvironment } from "@/apps/web-user/common/utils/webview.bridge";

interface UserLocation {
  latitude: number;
  longitude: number;
}

function readStoredLocation(): UserLocation | null {
  const { latitude, longitude } = useUserCurrentLocationStore.getState();
  if (latitude == null || longitude == null) return null;
  return { latitude, longitude };
}

/**
 * 사용자의 현재 위치를 가져오는 훅
 * 웹뷰 환경에서는 브릿지, 브라우저 환경에서는 Geolocation API 사용
 */
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(() => readStoredLocation());

  const handleLocation = useCallback((latitude: number, longitude: number) => {
    setLocation({ latitude, longitude });
  }, []);

  const refresh = useCallback(() => {
    if (isWebViewEnvironment()) {
      if (window.mylocation) window.mylocation.postMessage("true");
      return;
    }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => handleLocation(pos.coords.latitude, pos.coords.longitude),
      () => setLocation(null),
    );
  }, [handleLocation]);

  useEffect(() => {
    if (isWebViewEnvironment()) {
      window.receiveLocation = (lat: string | number, lng: string | number) => {
        handleLocation(
          typeof lat === "string" ? parseFloat(lat) : lat,
          typeof lng === "string" ? parseFloat(lng) : lng,
        );
      };
      if (window.mylocation) window.mylocation.postMessage("true");
      return;
    }

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => handleLocation(pos.coords.latitude, pos.coords.longitude),
      () => setLocation(null),
    );
  }, [handleLocation]);

  return { location, refresh };
}
