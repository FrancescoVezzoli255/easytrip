"use client";

import { useEffect, useRef, useState } from "react";
import HotelCard from "./HotelCard";
import type { Hotel } from "./hotels";
import { useAppSettings } from "@/context/AppSettingsContext";

type HotelSectionProps = { hotels: Hotel[] };

export default function HotelSection({ hotels }: HotelSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pauseRef = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useAppSettings();

  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cardWidth = 320;
  const cardGap = 1;

  useEffect(() => setMounted(true), []);

  // MOBILE CHECK
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // UPDATE BUTTONS
  const updateButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    if (!scrollRef.current) return;
    const raf = requestAnimationFrame(updateButtons);
    return () => cancelAnimationFrame(raf);
  }, [hotels, mounted]);

  // PAUSA AUTO-SCROLL
  const pauseByUser = (ms: number = 10000) => {
    pauseRef.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      pauseRef.current = false;
    }, ms);
  };

  // SCROLL SNAP
  const scrollToIndex = (direction: 1 | -1) => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = cardRefs.current;
    if (!cards.length) return;

    const currentScroll = container.scrollLeft;
    let currentIndex = 0;
    let minDiff = Infinity;

    for (let i = 0; i < cards.length; i++) {
      if (!cards[i]) continue;
      const diff = Math.abs(cards[i]!.offsetLeft - currentScroll);
      if (diff < minDiff) {
        minDiff = diff;
        currentIndex = i;
      }
    }

    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), cards.length - 1);
    const targetLeft = cards[nextIndex]!.offsetLeft;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
    requestAnimationFrame(updateButtons);
    return nextIndex;
  };

  const scrollLeft = () => { pauseByUser(10000); scrollToIndex(-1); };
  const scrollRight = () => { pauseByUser(10000); scrollToIndex(1); };

  // AUTO SCROLL LOOP
  useEffect(() => {
    if (isMobile || !hotels.length) return;

    const interval = setInterval(() => {
      if (pauseRef.current) return;
      const container = scrollRef.current;
      if (!container) return;

      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (currentScroll >= maxScroll - 5) {
        pauseRef.current = true;
        setTimeout(() => {
          if (!scrollRef.current) return;
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          pauseRef.current = false;
          updateButtons();
        }, 5000);
      } else {
        scrollToIndex(1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMobile, hotels]);

  // LOADING OVERLAY (se la lista è vuota)
  if (!mounted) return null;

  return (
    <div className="relative bg-white rounded-3xl p-10 w-full shadow-2xl -mt-20 mx-4 md:mx-auto">
      {hotels.length === 0 && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl z-50">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg text-gray-800 text-lg font-semibold">
            {t("loadingHotels") || "Loading hotels..."}
          </div>
        </div>
      )}

      <h2 className="mb-6 text-2xl font-semibold text-gray-800">{t("recommendedHotels")}</h2>

      <div className="relative flex justify-center items-center">
        {!isMobile && (
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`h-12 w-12 rounded-full bg-white/80 shadow-md flex items-center justify-center mr-2 flex-shrink-0 z-10 transition-opacity duration-300 ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          >
            ◀
          </button>
        )}

        <div
          ref={scrollRef}
          onWheel={() => { pauseByUser(10000); requestAnimationFrame(updateButtons); }}
          onTouchStart={() => pauseByUser(10000)}
          onScroll={() => requestAnimationFrame(updateButtons)}
          className="flex overflow-x-auto snap-x snap-mandatory flex-1 pt-6 pb-6"
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {hotels.map((hotel, idx) => (
            <div
              key={hotel.id}
              ref={(el) => { cardRefs.current[idx] = el; }}
              className="snap-center flex-shrink-0 flex justify-center"
              style={{ width: cardWidth, marginRight: idx !== hotels.length - 1 ? `${cardGap}px` : 0 }}
            >
              <div className="transition-transform duration-300 hover:scale-105">
                <HotelCard hotel={hotel} />
              </div>
            </div>
          ))}
        </div>

        {!isMobile && (
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`h-12 w-12 rounded-full bg-white/80 shadow-md flex items-center justify-center ml-2 flex-shrink-0 z-10 transition-opacity duration-300 ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
}
