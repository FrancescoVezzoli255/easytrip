// @ts-ignore
import Amadeus from "amadeus";


if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
  throw new Error(
    "Devi impostare AMADEUS_CLIENT_ID e AMADEUS_CLIENT_SECRET nel file .env.local"
  );
}

export const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});
