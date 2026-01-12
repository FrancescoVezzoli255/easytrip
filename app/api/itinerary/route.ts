import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Funzione helper per retry
async function fetchWithRetry(url: string, options: any, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    if (res.status === 503 && i < retries - 1) {
      // Modello sovraccarico → attendi e riprova
      await new Promise((r) => setTimeout(r, delay));
      continue;
    } else {
      const data = await res.text();
      throw new Error(data);
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, days, people } = body;

    // Prompt dinamico
    const prompt = `
Genera un itinerario di ${days} giorni per ${people} persone a ${destination}.
Rispondi esclusivamente in JSON strutturato così:

{
  "itinerary": [
    {
      "day": "Giorno 1",
      "activities": ["Attività 1", "Attività 2"],
      "restaurants": ["Ristorante 1", "Ristorante 2"],
      "hotels": ["Hotel 1", "Hotel 2"]
    }
  ]
}
`;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    // Chiamata con retry
    const response = await fetchWithRetry(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const itineraryText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const itinerary = JSON.parse(itineraryText);

    return NextResponse.json(itinerary);
  } catch (error: any) {
    console.error("❌ Errore generazione itinerario:", error);
    return NextResponse.json(
      { error: "Errore generazione itinerario", details: error.message },
      { status: 500 }
    );
  }
}
