// lib/amadeus.ts
export async function getAccessToken(clientId: string, clientSecret: string) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Errore token Amadeus: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function searchHotels(destination: string, token: string) {
  const res = await fetch(
    `https://test.api.amadeus.com/v3/shopping/hotel-offers?cityCode=${destination}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Errore ricerca hotel: ${text}`);
  }

  const data = JSON.parse(text);
  return data.data || [];
}

export async function getHotelDetails(hotelId: string, token: string) {
  const res = await fetch(
    `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${encodeURIComponent(hotelId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Errore dettagli hotel: ${text}`);
  }

  const data = JSON.parse(text);
  return data.data?.[0];
}
