import type { Hotel } from "../../components/hotel/hotels";

/**
 * Trasforma i dati Amadeus in Hotel
 * Garantisce sempre un array di immagini per il carosello/freccette
 */
export function mapAmadeusToHotel(item: any): Hotel {
  const offer = item.offers?.[0];

  // array di fallback locali garantiti
  const localFallback = [
    "/images/HotelTest/Hotel1.jpeg",
    "/images/HotelTest/Hotel2.jpeg",
    "/images/HotelTest/Hotel3.jpeg",
    // puoi aggiungere Hotel4, Hotel5, Hotel6 senza modificare il mapper
  ];

  // usa le immagini Amadeus se presenti e valide, altrimenti fallback locale
  const imagesFromAmadeus =
    item.hotel.media?.map((m: { uri: string }) => m.uri).filter(Boolean) ?? [];

  const images = imagesFromAmadeus.length > 0 ? imagesFromAmadeus : localFallback;

  return {
    id: item.hotel.hotelId,
    name: item.hotel.name,
    address: item.hotel.address?.lines?.join(", "),
    city: item.hotel.address?.cityName,
    pricePerNight: parseFloat(offer?.price?.total ?? "0"),
    rating: item.hotel.rating ? parseFloat(item.hotel.rating) : undefined,
    images,
    isDemo: false,
    offerId: offer?.id,
    acceptedPayments: offer?.guarantee?.acceptedPayments,
    paymentPolicy: offer?.paymentPolicy,
    description: item.hotel.description?.text,
    amenities: item.hotel.amenities,
    rooms: undefined,
  };
}
