"use client";

import HotelCard from "./HotelCard";

export interface Idea {
  id: string;
  name: string;
  city: string;
  image: string;
  price: string;
  suggestion?: string;
}

interface TripResultsProps {
  ideas: Idea[];
  days: number;
  people: number;
}

export default function TripResults({ ideas, days, people }: TripResultsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideas.map((hotel) => (
        <div key={hotel.id} className="flex flex-col">
          <HotelCard
            id={hotel.id}
            name={hotel.name}
            city={hotel.city}
            image={hotel.image}
            price={hotel.price}
          />
          {hotel.suggestion && (
            <p className="text-gray-600 italic mt-2">{hotel.suggestion}</p>
          )}
        </div>
      ))}
    </div>
  );
}
