"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface ItineraryDay {
  day: string;
  activities: string[];
  restaurants: string[];
  hotels: string[];
}

export default function Results() {
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination") || "";
  const days = searchParams.get("days") || "1";
  const people = searchParams.get("people") || "1";
  const budget = searchParams.get("budget") || "medio";

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItinerary() {
      setLoading(true);
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, people, budget }),
      });

      const data = await res.json();
      setItinerary(data.itinerary || []);
      setLoading(false);
    }
    fetchItinerary();
  }, [destination, days, people, budget]);

  if (loading) return <div className="text-center mt-24">Generazione itinerario...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Itinerario per {destination}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {itinerary.map((day, idx) => (
          <div key={idx} className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold text-xl mb-2">{day.day}</h2>
            <p><strong>Attività:</strong> {day.activities.join(", ")}</p>
            <p><strong>Ristoranti:</strong> {day.restaurants.join(", ")}</p>
            <p><strong>Hotel:</strong> {day.hotels.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
