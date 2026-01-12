"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import SearchContainer from "@/components/search/SearchContainer";
import HotelSection from "@/components/hotel/HotelSection";
import { useAppSettings } from "@/context/AppSettingsContext";
import type { Hotel } from "@/components/hotel/hotels";

const BackgroundVideo = dynamic(() => import("@/components/BackgroundVideo"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const { t } = useAppSettings();

  const [mounted, setMounted] = useState(false);  
  const [loadingHotels, setLoadingHotels] = useState(false); // solo hotel
  const [loadingGenerate, setLoadingGenerate] = useState(false); // solo pulsante
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fallbackImages = [
    "/images/HotelTest/Hotel1.jpeg",
    "/images/HotelTest/Hotel2.jpeg",
    "/images/HotelTest/Hotel3.jpeg",
  ];
  const [fallbackImage] = useState(() => fallbackImages[0]);

  useEffect(() => setMounted(true), []);

  const fetchHotels = async (ignoreCache = false) => {
    setLoadingHotels(true);
    setError(null);

    try {
      if (!ignoreCache) {
        const cached = sessionStorage.getItem("cachedHotels");
        if (cached) {
          setHotels(JSON.parse(cached));
          setLoadingHotels(false);
          return;
        }
      }

      const res = await fetch("/api/hotel");
      if (!res.ok) throw new Error("Errore nella risposta dell'API");
      const data: Hotel[] = await res.json();

      const stabilized = data.map((h) => {
        const images = h.images?.length ? h.images : [fallbackImage];
        return { ...h, images, imageUrl: images[0] };
      });

      setHotels(stabilized);
      sessionStorage.setItem("cachedHotels", JSON.stringify(stabilized));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Errore fetch hotel");
    } finally {
      setLoadingHotels(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    fetchHotels();
  }, [mounted, fallbackImage]);

  const handleGenerate = () => {
    setLoadingGenerate(true);
    setTimeout(() => {
      setLoadingGenerate(false);
      router.push("/results");
    }, 800);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen relative overflow-hidden">
      <BackgroundVideo />

      {/* HEADER */}
      <header className="relative z-10 py-20 px-4 text-center flex flex-col items-center gap-4">
        <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4">
          {t("createTripHeader")}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t("createTripSubheader")}
        </p>
      </header>

      {/* SEARCH */}
      <div className="max-w-4xl mx-auto -mt-20 px-4 relative z-10">
        <SearchContainer 
          days={0} 
          loading={loadingGenerate} // solo generazione itinerario
          onGenerate={handleGenerate} 
        />
      </div>

      {/* HOTEL SECTION */}
      <div className="mt-24 relative z-10 w-full mx-auto px-4 py-16">
        {loadingHotels && <p className="text-center text-lg text-gray-700">Caricamento hotel...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loadingHotels && !error && hotels.length > 0 && <HotelSection hotels={hotels} />}
        {!loadingHotels && !error && hotels.length === 0 && <p className="text-center">Nessun hotel disponibile</p>}
      </div>
    </main>
  );
}
