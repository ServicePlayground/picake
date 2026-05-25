"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useHomeBanners } from "@/apps/web-user/features/home-banner/hooks/queries/useHomeBanners";
import { Skeleton } from "@/apps/web-user/common/components/skeleton/Skeleton";

function updateBullets(bullets: HTMLElement[], activeIndex: number) {
  bullets.forEach((bullet, i) => {
    const dist = Math.abs(i - activeIndex);
    if (dist > 3) {
      bullet.style.display = "none";
    } else {
      bullet.style.display = "inline-block";
      if (i === activeIndex) {
        bullet.style.width = "10px";
        bullet.style.height = "12px";
        bullet.style.borderRadius = "0";
        bullet.style.backgroundImage = "url('/images/banner/bullet_on.png')";
      } else {
        const size = dist <= 1 ? 8 : dist === 2 ? 6 : 4;
        bullet.style.width = `${size}px`;
        bullet.style.height = `${size}px`;
        bullet.style.borderRadius = "50%";
        bullet.style.backgroundImage = "url('/images/banner/bullet_off.png')";
      }
    }
  });
}

function BannerSlideImage({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  return (
    <Image src={src} alt={alt} fill className="object-cover" priority={priority} sizes="100vw" />
  );
}

export default function BannerSlider() {
  const { data: banners = [], isLoading } = useHomeBanners();

  if (isLoading) {
    return (
      <div className="h-[246px]">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (banners.length === 0) {
    return <div className="h-[246px]" aria-hidden />;
  }

  return (
    <div className="h-[246px]">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
          renderBullet: (index: number, className: string) => {
            return `<span class="${className}" data-index="${index}"></span>`;
          },
        }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={banners.length > 1}
        onSlideChange={(swiper) => {
          const bullets = swiper.pagination.bullets;
          if (!bullets) return;
          updateBullets(bullets as unknown as HTMLElement[], swiper.realIndex);
        }}
        onAfterInit={(swiper) => {
          const bullets = swiper.pagination.bullets;
          if (!bullets) return;
          updateBullets(bullets as unknown as HTMLElement[], swiper.realIndex);
        }}
        className="h-full [&_.swiper-pagination]:!bottom-[42px] [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-200 [&_.swiper-pagination-bullet]:[filter:drop-shadow(0px_2px_7px_rgba(0,0,0,0.45))] [&_.swiper-pagination-bullet]:bg-[length:100%_100%] [&_.swiper-pagination-bullet]:bg-no-repeat [&_.swiper-pagination-bullet]:[background-color:transparent]"
      >
        {banners.map((banner, idx) => {
          const slideContent = (
            <BannerSlideImage
              src={banner.imageUrl}
              alt={`배너 ${idx + 1}`}
              priority={idx === 0}
            />
          );

          return (
            <SwiperSlide key={banner.id}>
              {banner.linkUrl ? (
                banner.linkUrl.startsWith("http") ? (
                  <a
                    href={banner.linkUrl}
                    className="relative block h-full w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {slideContent}
                  </a>
                ) : (
                  <Link href={banner.linkUrl} className="relative block h-full w-full">
                    {slideContent}
                  </Link>
                )
              ) : (
                <div className="relative h-full w-full">{slideContent}</div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
