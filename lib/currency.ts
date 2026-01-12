// lib/currency.ts

export type Currency = "EUR" | "USD" | "GBP";

// Simboli delle valute (frontend li usa solo per display)
export const currencySymbols: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};
