export const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || "CHASECK_TEST_placeholder";

interface ChapaInitParams {
  amount: number;
  currency?: string;
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title: string;
    description: string;
  };
}

export async function initializeChapaTransaction(params: ChapaInitParams) {
  const response = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...params,
      currency: params.currency || "ETB",
    }),
  });

  const data = await response.json();
  if (!response.ok || data.status !== "success") {
    throw new Error(data.message || "Failed to initialize Chapa transaction");
  }

  return data.data; // contains checkout_url
}

export async function verifyChapaTransaction(txRef: string) {
  const response = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    },
  });

  const data = await response.json();
  return data;
}
