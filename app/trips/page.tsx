"use client";

import { useState } from "react";
import HotelCard from "@/components/HotelCard";
import HomeCards from "@/components/HomeCards";

interface Trip {
  id: string;
  name: string;
  city: string;
  price: string;
  image: string;
  rating?: number;
}

const tripsData: Trip[] = [
  {
    id: "T001",
    name: "Weekend Romantico",
    city: "Roma",
    price: "250 € / 2 notti",
    image: "https://picsum.photos/400/300?random=10",
    rating: 4.5,
  },
  {
    id: "T002",
    name: "Avventura in Montagna",
    city: "Dolomiti",
    price: "300 € / 3 notti",
    image: "https://picsum.photos/400/300?random=11",
    rating: 4.7,
  },
  {
    id: "T003",
    name: "Relax in Sardegna",
    city: "Cagliari",
    price: "400 € / 4 notti",
    image: "https://picsum.photos/400/300?random=12",
    rating: 4.8,
  },
  {
    id: "T004",
    name: "Scoperta di Milano",
    city: "Milano",
    price: "220 € / 2 notti",
    image: "https://picsum.photos/400/300?random=13",
    rating: 4.3,
  },
];

export default function TripsPage() {
  const [filterCity, setFilterCity] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const filteredTrips = tripsData.filter((trip) => {
    const matchesCity = filterCity ? trip.city.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchesPrice =
      maxPrice !== "" ? parseFloat(trip.price.split(" ")[0]) <= maxPrice : true;
    return matchesCity && matchesPrice;
  });

  return (
    <section className="space-y-8">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold text-blue-700">I nostri Viaggi</h1>
        <p className="text-gray-600 mt-2">
          Filtra e scopri itinerari e pacchetti consigliati dall'AI.
        </p>
      </div>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <input
          type="text"
          placeholder="Cerca per città..."
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Prezzo max (€)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
          className="border rounded-lg px-4 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista viaggi */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.length ? (
          filteredTrips.map((trip) => (
            <HotelCard
              key={trip.id}
              id={trip.id}
              name={trip.name}
              city={trip.city}
              price={trip.price}
              image={trip.image}
              rating={trip.rating}
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            Nessun viaggio trovato con questi filtri.
          </p>
        )}
      </div>

      {/* Suggerimenti AI mock */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Itinerari consigliati dall'AI</h2>
        <HomeCards
          cards={[
            {
              title: "Weekend romantico a Venezia",
              description: "Hotel, ristoranti e attività selezionati dall'AI.",
              image: "https://picsum.photos/400/300?random=20",
            },
            {
              title: "Tour gastronomico in Toscana",
              description: "Esperienze culinarie e pernottamenti consigliati.",
              image: "https://picsum.photos/400/300?random=21",
            },
            {
              title: "Avventura nelle Alpi",
              description: "Escursioni, hotel e trasporti ottimizzati dall'AI.",
              image: "https://picsum.photos/400/300?random=22",
            },
          ]}
        />
      </div>
    </section>
  );
}
