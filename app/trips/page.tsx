"use client";

import { useState } from "react";

interface Trip {
  id: string;
  name: string;
  city: string;
  price: string;
  image: string;
  rating?: number;
}

const tripsData: Trip[] = [
  { id: "T001", name: "Weekend Romantico", city: "Roma", price: "250 € / 2 notti", image: "https://picsum.photos/400/300?random=10", rating: 4.5 },
  { id: "T002", name: "Avventura in Montagna", city: "Dolomiti", price: "300 € / 3 notti", image: "https://picsum.photos/400/300?random=11", rating: 4.7 },
  { id: "T003", name: "Relax in Sardegna", city: "Cagliari", price: "400 € / 4 notti", image: "https://picsum.photos/400/300?random=12", rating: 4.8 },
  { id: "T004", name: "Scoperta di Milano", city: "Milano", price: "220 € / 2 notti", image: "https://picsum.photos/400/300?random=13", rating: 4.3 },
];

export default function TripsPage() {
  const [filterCity, setFilterCity] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const filteredTrips = tripsData.filter((trip) => {
    const matchesCity = filterCity ? trip.city.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchesPrice = maxPrice !== "" ? parseFloat(trip.price.split(" ")[0]) <= maxPrice : true;
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
            <div key={trip.id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-200">
              <img src={trip.image} alt={trip.name} className="w-full h-48 object-cover"/>
              <div className="p-4">
                <h3 className="font-bold text-lg">{trip.name}</h3>
                <p className="text-gray-600">{trip.city}</p>
                <p className="text-blue-700 font-semibold mt-2">{trip.price}</p>
                {trip.rating && <p className="mt-1 text-yellow-500">⭐ {trip.rating}</p>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            Nessun viaggio trovato con questi filtri.
          </p>
        )}
      </div>
    </section>
  );
}
