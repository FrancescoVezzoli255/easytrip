interface HotelListProps {
  hotels: {
    id: string;
    name: string;
    city: string;
    rooms?: {
      type: string;
      beds: number;
      board: string;
      price: string;
    }[];
  }[];
}

export const HotelList = ({ hotels }: HotelListProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {hotels.map((hotel) => {
      const firstRoom = hotel.rooms?.[0];

      return (
        <div
          key={hotel.id}
          className="
            h-[420px]
            flex
            flex-col
            rounded-xl
            border
            bg-white
            p-5
            transition
            hover:shadow-lg
          "
        >
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold line-clamp-2">
              {hotel.name}
            </h3>

            <p className="text-sm text-gray-500 line-clamp-1">
              {hotel.city}
            </p>
          </div>

          {firstRoom ? (
            <p className="pt-4 text-right font-semibold text-blue-600">
              {firstRoom.price}
            </p>
          ) : (
            <p className="pt-4 text-right text-sm text-gray-400">
              Prezzo non disponibile
            </p>
          )}
        </div>
      );
    })}
  </div>
);
