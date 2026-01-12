// app/api/hotel/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getHotelDetails } from "@/lib/amadeus";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Sblocca la Promise
    const params = await context.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing hotel ID" }, { status: 400 });
    }

    // Ottieni token Amadeus
    const token = await getAccessToken(
      process.env.AMADEUS_CLIENT_ID!,
      process.env.AMADEUS_CLIENT_SECRET!
    );

    // Recupera dettagli hotel
    const hotel = await getHotelDetails(id, token);

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Ritorna direttamente l'hotel
    return NextResponse.json(hotel);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Errore sconosciuto" }, { status: 500 });
  }
}
