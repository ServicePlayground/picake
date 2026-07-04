"use client";

import dynamic from "next/dynamic";

export const ReservationBottomSheet = dynamic(
  () =>
    import("./ReservationBottomSheet").then((module) => ({
      default: module.ReservationBottomSheet,
    })),
  { ssr: false },
);
