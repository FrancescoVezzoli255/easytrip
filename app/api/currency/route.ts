// app/api/currency/route.ts
import { NextResponse } from "next/server";

const APP_ID = process.env.OPENEXCHANGERATES_APP_ID!; // <- metti qui la tua chiave

export async function GET() {
  try {
    const res = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${APP_ID}&symbols=USD,GBP,EUR`
    );
    if (!res.ok) throw new Error("Failed to fetch exchange rates");

    const data = await res.json();

    // data.rates contiene i tassi rispetto a USD, quindi dobbiamo normalizzare su EUR
    const rateEUR = data.rates.EUR ? 1 / data.rates.EUR : 1;
    const rates = {
      EUR: 1,
      USD: data.rates.USD * rateEUR,
      GBP: data.rates.GBP * rateEUR,
    };

    return NextResponse.json({
      success: true,
      rates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Currency API failed", err);
    return NextResponse.json({
      success: false,
      rates: { EUR: 1, USD: 1.1, GBP: 0.88 },
      error: "Failed to fetch live rates, using fallback",
      updatedAt: new Date().toISOString(),
    });
  }
}
