import { NextRequest, NextResponse } from "next/server";

function generateAIItinerary(destination: string, days: number, people: number) {
  const itineraries = [
    `Visita i monumenti principali di ${destination}`,
    `Prova i ristoranti tipici di ${destination}`,
    `Tour panoramico guidato a ${destination}`,
    `Esplora i quartieri storici di ${destination}`,
    `Scopri eventi e festival locali a ${destination}`,
  ];

  return itineraries.map((desc, idx) => ({
    id: `${destination}-${idx}`,
    name: `Soggiorno a ${destination}`,
    city: destination,
    image: `https://picsum.photos/400/300?random=${idx + 1}`,
    price: `${100 + idx * 20} € / notte`,
    suggestion: desc,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { destination, startDate, endDate } = await req.json();

    if (!destination) return NextResponse.json({ error: "Destinazione mancante" }, { status: 400 });

    const days = Math.max(
      1,
      Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const people = 1;

    const ideas = generateAIItinerary(destination, days, people);

    return NextResponse.json({ ideas, days, people });
  } catch (err) {
    return NextResponse.json({ error: "Errore generico nel server" }, { status: 500 });
  }
}
