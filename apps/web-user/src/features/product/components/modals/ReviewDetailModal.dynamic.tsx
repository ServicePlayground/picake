"use client";

import dynamic from "next/dynamic";

export const ReviewDetailModal = dynamic(
  () =>
    import("./ReviewDetailModal").then((module) => ({
      default: module.ReviewDetailModal,
    })),
  { ssr: false },
);
