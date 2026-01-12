"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";
import { Hotel, Room, Review } from "@/components/hotel/hotels";
import { useAppSettings } from "@/context/AppSettingsContext";
import { currencySymbols } from "@/lib/currency";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Lightbox corretto
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error("Fetch failed " + res.status);
    return res.json();
  });

export default function HotelPage() {
  const { id } = useParams();
  const { t, language, currency, rates } = useAppSettings();
  const { data: hotel, error } = useSWR<Hotel>(id ? `/api/hotel/${id}` : null, fetcher);

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  if (error) return <p className="p-6 text-red-600">Error loading hotel</p>;
  if (!hotel) return <p className="p-6">Loading hotel...</p>;

  const fallbackImages: string[] = [
    "/images/HotelTest/Hotel1.jpeg",
    "/images/HotelTest/Hotel2.jpeg",
    "/images/HotelTest/Hotel3.jpeg",
  ];

  const images = hotel.images?.length ? hotel.images : fallbackImages;

  // Camere demo se non presenti
  const basePrice = Number(hotel.pricePerNight) || 100;
  const rooms: Room[] = hotel.rooms?.length
    ? hotel.rooms
    : [
        { type: "Standard Room (Demo)", beds: 2, board: "Breakfast", price: basePrice, isDemo: true },
        { type: "Deluxe Room (Demo)", beds: 2, board: "Breakfast + Dinner", price: basePrice + 50, isDemo: true },
        { type: "Suite (Demo)", beds: 3, board: "All Inclusive", price: basePrice + 100, isDemo: true },
      ];

  const formatPrice = (price: number) => {
    const rate = rates[currency] ?? 1;
    return Math.round(price * rate).toLocaleString(language);
  };

  const minPrice = Math.min(...rooms.map((r) => r.price));

  // Recensioni demo
  const reviews: Review[] = hotel.reviewList?.length
    ? hotel.reviewList
    : [
        { author: "Alice", rating: 5, comment: "Great stay!" },
        { author: "Bob", rating: 4, comment: "Very comfortable." },
        { author: "Charlie", rating: 3, comment: "It was okay." },
      ];

  // posizione Leaflet
  const position: LatLngExpression | null =
    hotel.latitude && hotel.longitude ? [hotel.latitude, hotel.longitude] : null;

  return (
    <main className="max-w-7xl mx-auto p-6 pt-24 space-y-6">
      {/* Titolo hotel */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold">{hotel.name}</h1>
        <p className="text-gray-500">{hotel.address ?? hotel.zone ?? hotel.city}</p>
        <p className="text-gray-700">{hotel.description ?? "No description available."}</p>
      </div>

      {/* Griglia immagini */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative h-48 cursor-pointer"
            onClick={() => { setPhotoIndex(idx); setLightboxOpen(true); }}
          >
            <Image src={img} alt={`${hotel.name} image ${idx + 1}`} fill className="object-cover rounded-lg" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={images.map((img) => ({ src: img }))}
          index={photoIndex} // starting index
          on={{ view: ({ index }) => setPhotoIndex(index) }} // aggiorna l’indice quando cambia
        />
      )}

      {/* Mappa */}
      {position && (
        <div className="h-96 w-full rounded-lg overflow-hidden">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup>{hotel.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* Camere e ospiti */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h2 className="text-2xl font-semibold">Select Room & Guests</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {rooms.map((room, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedRoom(idx)}
              className={`p-4 border rounded-lg cursor-pointer transition ${
                selectedRoom === idx ? "border-blue-600 bg-blue-50" : "border-gray-200"
              }`}
            >
              <p className="font-semibold">{room.type} {room.isDemo && "(Demo)"}</p>
              <p>{room.beds} beds · {room.board}</p>
              <p className="text-blue-700 font-semibold">{currencySymbols[currency]} {formatPrice(room.price)}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          <div>
            <label>Adults</label>
            <input type="number" min={1} max={10} value={adults} onChange={e => setAdults(Number(e.target.value))} className="border rounded px-2 py-1 w-16 text-center"/>
          </div>
          <div>
            <label>Children</label>
            <input type="number" min={0} max={10} value={children} onChange={e => setChildren(Number(e.target.value))} className="border rounded px-2 py-1 w-16 text-center"/>
          </div>
          <div>
            <label>Check-in</label>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Check-out</label>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="border rounded px-2 py-1"/>
          </div>
        </div>

        <button
          disabled={selectedRoom === null}
          onClick={() => alert(`Booked ${rooms[selectedRoom!].type} for ${adults} adults, ${children} children, from ${checkIn} to ${checkOut}`)}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-4 disabled:opacity-50"
        >
          Book Now
        </button>
        <p className="text-gray-500 text-sm">From {currencySymbols[currency]} {formatPrice(minPrice)}</p>
      </div>

      {/* Recensioni */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        <div className="flex gap-2 items-center">
          <span className="font-bold">{hotel.rating?.toFixed(1) ?? "-"}</span>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < (hotel.rating ?? 0) ? "text-yellow-400" : "text-gray-300"}>★</span>
            ))}
          </div>
          <span className="text-gray-500">({hotel.reviews ?? reviews.length} reviews)</span>
        </div>

        <div className="space-y-2 mt-2">
          {reviews.slice(0, 5).map((r, idx) => (
            <div key={idx} className="p-2 border rounded-lg">
              <p className="font-semibold">{r.author}</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < r.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                ))}
              </div>
              {r.comment && <p className="text-gray-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
