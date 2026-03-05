"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import LandingSearch from "@/components/landing-search";

const slides = [
  {
    image: "/hero1.jpg",
    title: "Find your perfect stay",
    subtitle: "Compare prices and book instantly",
  },
  {
    image: "/hero2.jpg",
    title: "Discover amazing destinations",
    subtitle: "Thousands of properties available",
  },
  {
    image: "/hero3.jpg",
    title: "Best deals for your trip",
    subtitle: "Enjoy your holiday with comfort",
  },
];

export default function HeroCarousel() {
  return (
    <div className="relative w-full h-105 md:h-130 overflow-visible">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="h-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt="hero"
                fill
                className="object-cover"
                priority
              />

              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-black/20 flex flex-col items-center justify-center text-center text-white px-6">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {slide.title}
                </h1>

                <p className="text-lg md:text-xl">{slide.subtitle}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* FLOATING SEARCH */}
      <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 w-full max-w-5xl px-4 z-10">
        <LandingSearch />
      </div>
    </div>
  );
}
