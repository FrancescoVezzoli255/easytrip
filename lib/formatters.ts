export const currencyRates = {
  EUR: 1,
  USD: 1.1,
  GBP: 0.85,
};

export function formatPrice(
  amountEUR: number,
  currency: "EUR" | "USD" | "GBP",
  locale: string
) {
  const converted = amountEUR * currencyRates[currency];

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(converted);
}
