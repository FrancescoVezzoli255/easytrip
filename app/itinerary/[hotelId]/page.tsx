"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ItineraryPage() {
  const searchParams = useSearchParams();
  const hotelName = searchParams.get("hotelName") || "Hotel";
  const city = searchParams.get("city") || "Città";
  const checkIn = searchParams.get("checkIn") || new Date().toISOString().slice(0,10);
  const checkOut = searchParams.get("checkOut") || new Date().toISOString().slice(0,10);
  const people = Number(searchParams.get("people") || 1);

  const [itinerary, setItinerary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelName, city, checkIn, checkOut, people }),
      });
      const data = await res.json();
      setItinerary(data.itinerary || []);
      setLoading(false);
    };
    fetchItinerary();
  }, [hotelName, city, checkIn, checkOut, people]);

  if (loading) return <p className="text-center mt-10">Generazione itinerario...</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Itinerario per {hotelName} ({city})</h1>
    </div>
  );
}
