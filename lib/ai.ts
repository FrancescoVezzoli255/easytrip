import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export interface TripIdea {
  title: string;
  destination: string;
  description: string;
}

export async function generateTripIdeas(query: string): Promise<TripIdea[]> {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Crea 5 idee di viaggio per: ${query}.
Rispondi in formato JSON come array di oggetti:
[
  { "title": "Titolo", "destination": "Destinazione", "description": "Descrizione breve" }
]`
    });

    // DEBUG completo
    console.log("DEBUG Gemini result:", JSON.stringify(result, null, 2));

    // Qui il testo reale
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Rimuovi eventuali ```json e ``` all'inizio/fine
    text = text.replace(/^```json\s*|\s*```$/g, "").trim();

    if (!text) {
      console.error("❌ Nessun testo trovato nel campo corretto");
      return [];
    }

    // Parsing JSON
    try {
      const ideas: TripIdea[] = JSON.parse(text);
      return ideas;
    } catch (jsonError) {
      console.error("❌ Errore parsing JSON:", jsonError);
      return [
        {
          title: "Errore",
          destination: "",
          description: text
        }
      ];
    }
  } catch (error) {
    console.error("❌ Errore Gemini:", error);
    return [
      {
        title: "Errore",
        destination: "",
        description: "Impossibile generare idee di viaggio"
      }
    ];
  }
}
