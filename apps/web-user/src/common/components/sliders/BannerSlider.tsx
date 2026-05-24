"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const BANNER_IMAGES = [
  "/images/banner/open-banner1.png",
  "/images/banner/open-banner2.png",
  "/images/banner/open-banner3.png",
  "/images/banner/open-banner4.png",
  "/images/banner/open-banner5.png",
  "/images/banner/open-banner6.png",
  "/images/banner/open-banner7.png",
  "/images/banner/open-banner8.png",
];

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

export default function BannerSlider() {
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
        loop={false}
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
        {BANNER_IMAGES.map((src, idx) => (
          <SwiperSlide key={idx}>
            <Image
              src={src}
              alt={`배너 ${idx + 1}`}
              fill
              className="object-cover"
              priority={idx === 0}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
