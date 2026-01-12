import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Funzione helper per retry in caso di errori temporanei (503)
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 2000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    if (res.status === 503 && i < retries - 1) {
      // Se modello sovraccarico, aspetta e riprova
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    // Altri errori
    throw new Error(await res.text());
  }
  throw new Error("Max retries reached");
}

export async function POST(req: Request) {
  try {
    const { destination, days, people } = await req.json();

    // Prompt dinamico per Gemini
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
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    };

    // Chiamata all'API con retry
    const response = await fetchWithRetry(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response) {
      throw new Error("Nessuna risposta dal server Gemini");
    }

    // Parsing sicuro della risposta
    const data = (await response.json().catch(() => ({}))) ?? {};
    const itineraryText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    const itinerary = (() => {
      try {
        return JSON.parse(itineraryText);
      } catch {
        return {};
      }
    })();

    return NextResponse.json(itinerary);
  } catch (error: any) {
    console.error("❌ Errore generazione itinerario:", error);
    return NextResponse.json(
      { error: "Errore generazione itinerario", details: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
