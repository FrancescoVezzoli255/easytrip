"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { translations, Language } from "@/lib/translations";
import { currencySymbols, type Currency } from "@/lib/currency";

interface AppSettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;

  currency: Currency;
  setCurrency: (cur: Currency) => void;

  rates: Record<Currency, number>; // tassi reali aggiornati

  t: (key: string) => string;
}

const AppSettingsContext =
  createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [language, setLanguage] = useState<Language | null>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);

  // tassi di cambio iniziali (fallback)
  const [rates, setRates] = useState<Record<Currency, number>>({
    EUR: 1,
    USD: 1.1,
    GBP: 0.88,
  });

  // ---------- Carica impostazioni da localStorage ----------
  useEffect(() => {
    const savedLang = (localStorage.getItem("appLanguage") as Language) || "it";
    const savedCur = (localStorage.getItem("appCurrency") as Currency) || "EUR";

    setLanguage(savedLang);
    setCurrency(savedCur);
  }, []);

  // ---------- Salva lingua e valuta in localStorage ----------
  useEffect(() => {
    if (language) localStorage.setItem("appLanguage", language);
  }, [language]);

  useEffect(() => {
    if (currency) localStorage.setItem("appCurrency", currency);
  }, [currency]);

  // ---------- Fetch tassi reali da API /api/currency ----------
  useEffect(() => {
    async function loadRates() {
      try {
        const res = await fetch("/api/currency");
        if (!res.ok) throw new Error("Rates fetch failed");

        const data = await res.json();

        if (data.success && data.rates) {
          setRates({
            EUR: 1,
            USD: data.rates.USD ?? 1.1,
            GBP: data.rates.GBP ?? 0.88,
          });
        } else {
          console.warn("Currency API returned no rates, using fallback");
        }
      } catch (err) {
        console.error("Currency API failed, using fallback rates", err);
        setRates({
          EUR: 1,
          USD: 1.1,
          GBP: 0.88,
        });
      }
    }

    loadRates();
  }, []);

  // ---------- Blocca SSR finché non abbiamo valori ----------
  if (!language || !currency) return null;

  // ---------- Funzione di traduzione ----------
  const t = (key: string) => translations[language]?.[key] || key;

  return (
    <AppSettingsContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        rates,
        t,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

// ---------- Hook custom per usare il contesto ----------
export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context)
    throw new Error(
      "useAppSettings must be used within AppSettingsProvider"
    );
  return context;
};
