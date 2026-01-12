"use client";

interface HotelCardProps {
  id: string;
  name: string;
  city: string;
  price: string;
  image: string;
  rating?: number;
}

export default function HotelCard({ name, city, price, image, rating }: HotelCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-lg mb-2"/>
      <h3 className="font-bold">{name}</h3>
      <p>{city}</p>
      <p>{price}</p>
      {rating && <p>⭐ {rating}</p>}
    </div>
  );
}
