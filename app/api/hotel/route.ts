import { NextResponse } from "next/server";
import type { Hotel } from "../../../components/hotel/hotels";

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID!;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET!;
const BASE = "https://test.api.amadeus.com";

/* ------------------ OTTIENI TOKEN ------------------ */
async function getAccessToken(): Promise<string> {
  const res = await fetch(`${BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Failed to get Amadeus token: " + text);
  }

  const data = await res.json();
  return data.access_token;
}

/* ------------------ MAPPER Amadeus → Hotel con fallback locale ------------------ */
function mapAmadeusToHotel(item: any): Hotel {
  const offer = item.offers?.[0];

  // Prendi immagini Amadeus
  const imagesRaw = item.hotel.media?.map((m: { uri: string }) => m.uri).filter(Boolean);

  // Fallback locale se Amadeus non restituisce nulla
  const fallbackImages = [
    "/images/HotelTest/Hotel1.jpeg",
    "/images/HotelTest/Hotel2.jpeg",
    "/images/HotelTest/Hotel3.jpeg",
  ];

  // Se Amadeus ha almeno 1 immagine → usa quelle; altrimenti usa fallback
  const images = imagesRaw && imagesRaw.length > 0 ? imagesRaw : fallbackImages;

  // Badge demo / top_rated / best_value
  const ratingValue = item.hotel.rating ? parseFloat(item.hotel.rating) : 0;
  let badge: "demo" | "top_rated" | "best_value" | undefined;
  if (item.isDemo) badge = "demo";
  else if (ratingValue >= 4.7) badge = "top_rated";
  else if (parseFloat(offer?.price?.total ?? "0") < 120) badge = "best_value";

  return {
    id: item.hotel.hotelId,
    name: item.hotel.name,
    address: item.hotel.address?.lines?.join(", "),
    city: item.hotel.address?.cityName,
    pricePerNight: parseFloat(offer?.price?.total ?? "0"),
    rating: ratingValue,
    images,         // Array di immagini sempre presente
    reviews: item.hotel.reviews,
    rooms: item.rooms, // se Amadeus restituisce camere
    badge,
    description: item.hotel.description?.text,
    amenities: item.hotel.amenities,
    offerId: offer?.id,
    acceptedPayments: offer?.guarantee?.acceptedPayments,
    paymentPolicy: offer?.paymentPolicy,
    zone: item.hotel.zone,
    distance: item.hotel.distance,
  };
}




/* ------------------ GET HOTELS ------------------ */
export async function GET() {
  try {
    const token = await getAccessToken();

    const cities = ["PAR", "ROM", "MAD", "BCN", "LON", "MIL", "BER"]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const today = new Date();
    const checkIn = today.toISOString().split("T")[0];
    const checkOut = new Date(today.getTime() + 86400000)
      .toISOString()
      .split("T")[0];

    /* ------------------ 1️⃣ LISTA HOTEL (PARALLELA) ------------------ */
    const hotelLists = await Promise.all(
      cities.map(async (cityCode) => {
        const res = await fetch(
          `${BASE}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return [];
        const json: { data?: { hotelId: string }[] } = await res.json();
        return (
          json.data?.map((h) => ({
            cityCode,
            hotelId: h.hotelId,
          })).slice(0, 20) ?? []
        );
      })
    );

    /* ------------------ 2️⃣ HOTEL OFFERS (PARALLELE) ------------------ */
    const offerRequests = hotelLists.map(async (hotels) => {
      if (!hotels.length) return [];

      const hotelIds = hotels.map((h) => h.hotelId);
      const res = await fetch(
        `${BASE}/v3/shopping/hotel-offers?hotelIds=${hotelIds.join(
          ","
        )}&adults=2&checkInDate=${checkIn}&checkOutDate=${checkOut}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return [];
      const json: { data?: any[] } = await res.json();

      return json.data?.map(mapAmadeusToHotel) ?? [];
    });

    const offersByCity = await Promise.all(offerRequests);

    /* ------------------ 3️⃣ MERGE + DEDUP ------------------ */
    const map = new Map<string, Hotel>();
    offersByCity.flat().forEach((hotel) => {
      if (!map.has(hotel.id)) map.set(hotel.id, hotel);
    });

    const result = Array.from(map.values()).slice(0, 10);

    /* ------------------ 4️⃣ CACHE 24 ORE ------------------ */
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=0",
      },
    });
  } catch (err) {
    console.error("Amadeus API error:", err);
    return NextResponse.json({ error: "Amadeus API failed" }, { status: 500 });
  }
}
