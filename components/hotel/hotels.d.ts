export interface Room {
  type: string;
  beds: number;
  board: string;
  price: number;
  isDemo?: boolean;
}

export type HotelBadge = "top_rated" | "best_value" | "demo";

export interface Review {
  author: string;
  rating: number;
  comment?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address?: string;
  city?: string;
  zone?: string;
  distance?: string;
  rating?: number;
  reviews?: number;
  images?: string[];
  isDemo?: boolean;
  pricePerNight: number;
  badge?: HotelBadge;
  description?: string;
  amenities?: string[];
  rooms?: Room[];

  // **nuovi campi**
  latitude?: number;
  longitude?: number;
  reviewList?: Review[];
  offerId?: string;
}
