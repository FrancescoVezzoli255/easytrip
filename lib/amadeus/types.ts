export type AmadeusHotelRef = {
  hotelId: string;
};

export type AmadeusOffer = {
  id: string;
  price?: {
    total?: string;
  };
  paymentPolicy?: any;
  guarantee?: {
    acceptedPayments?: any;
  };
};

export type AmadeusHotelOffer = {
  hotel: {
    hotelId: string;
    name: string;
    rating?: string;
    description?: {
      text?: string;
    };
    amenities?: string[];
    address?: {
      lines?: string[];
      cityName?: string;
    };
    media?: {
      uri: string;
    }[];
  };
  offers?: AmadeusOffer[];
};
