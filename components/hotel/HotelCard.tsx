"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Hotel } from "./hotels";
import { useAppSettings } from "@/context/AppSettingsContext";
import { translations, Language } from "@/lib/translations";
import { currencySymbols, type Currency } from "@/lib/currency";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const router = useRouter();
  const { language, currency, rates } = useAppSettings();
  const t = translations[language as Language] || translations.it;

  const [currentImage, setCurrentImage] = useState<number>(0);
  const [hover, setHover] = useState<boolean>(false);
  const [formattedPrice, setFormattedPrice] = useState<string>("...");
  const autoplayRef = useRef<number | null>(null);

  // fallback se l’hotel non ha immagini
  const fallbackImages: string[] = [
    "/images/HotelTest/Hotel1.jpeg",
    "/images/HotelTest/Hotel2.jpeg",
    "/images/HotelTest/Hotel3.jpeg",
  ];

  const images: string[] = hotel.images && hotel.images.length > 0 ? hotel.images : fallbackImages;

  // FORMATTARE PREZZO
  useEffect(() => {
    const convertedPrice = Math.round(hotel.pricePerNight * (rates[currency] ?? 1));
    setFormattedPrice(convertedPrice.toLocaleString(language));
  }, [hotel.pricePerNight, rates, currency, language]);

  // AUTOPLAY CAROSELLO
  useEffect(() => {
    if (images.length <= 1) return;

    autoplayRef.current = window.setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => {
      if (autoplayRef.current !== null) clearInterval(autoplayRef.current);
    };
  }, [images.length]);

  const nextImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImage((i) => (i + 1) % images.length);
  };

  const prevImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setCurrentImage((i) => (i - 1 + images.length) % images.length);
  };

  const ratingValue: number = hotel.rating ?? 0;
  const reviewsCount: number = hotel.reviews ?? 0;

  const badge: string | undefined =
    hotel.badge === "demo"
      ? "Demo"
      : ratingValue >= 4.7
      ? "Top rated"
      : hotel.pricePerNight < 120
      ? "Best value"
      : undefined;

  const showArrows: boolean = images.length > 1;

  return (
    <div
      className="relative w-72 h-[420px] rounded-xl border bg-white flex flex-col cursor-pointer
                 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 z-20"
      onClick={() => router.push(`/hotel/${hotel.id}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* IMAGE AREA */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
        <Image
          src={images[currentImage]}
          alt={hotel.name}
          fill
          className="object-cover transition-transform duration-500"
          priority
        />

        {/* BADGE */}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow z-30">
            {badge}
          </span>
        )}

        {/* FRECCETTE */}
        {hover && showArrows && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2
                         z-30 bg-black/60 text-white w-9 h-9 rounded-full
                         flex items-center justify-center hover:bg-black/80 transition"
            >
              ◀
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2
                         z-30 bg-black/60 text-white w-9 h-9 rounded-full
                         flex items-center justify-center hover:bg-black/80 transition"
            >
              ▶
            </button>
          </>
        )}

        {/* DOTS */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {images.map((_, idx: number) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage(idx);
                }}
                className={`w-3 h-3 rounded-full border border-black/40 shadow-md cursor-pointer transition
                  ${idx === currentImage ? "bg-white" : "bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-base font-semibold line-clamp-2">{hotel.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">
            {hotel.zone ?? hotel.city} · {hotel.distance ?? "..."}
          </p>
          <div className="flex items-center gap-1 text-sm">
            <span className="font-semibold text-gray-800">★ {ratingValue.toFixed(1)}</span>
            <span className="text-gray-500">({reviewsCount})</span>
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <p className="text-blue-700 font-semibold">
            {currencySymbols[currency as Currency]}
            {formattedPrice}{" "}
            <span className="text-sm font-normal text-gray-500">{t.pricePerNight}</span>
          </p>

          {hotel.badge !== "demo" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/hotel/${hotel.id}`);
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition z-30"
            >
              {t.bookNow || "Book Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
