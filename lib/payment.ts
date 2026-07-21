// lib/payment.ts
// Abstraksi payment gateway — ganti implementasi di sini kalau mau pindah provider

export type PaymentProvider = 'ipaymu';

export interface CreatePaymentParams {
  orderCode: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  items: {
    name: string;
    qty: number;
    price: number;
  }[];
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface CreatePaymentResult {
  paymentUrl: string;
  sessionId: string;
  referenceId: string;
}

async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(key);
  const messageBytes = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
  const va = process.env.IPAYMU_VA!;
  const apiKey = process.env.IPAYMU_API_KEY!;
  const url = 'https://my.ipaymu.com/api/v2/payment';

  const body = {
    product: params.items.map(i => i.name),
    qty: params.items.map(i => i.qty),
    price: params.items.map(i => i.price),
    amount: params.amount,
    returnUrl: params.returnUrl,
    cancelUrl: params.cancelUrl,
    notifyUrl: params.notifyUrl,
    referenceId: params.orderCode,
    buyerName: params.buyerName,
    buyerEmail: params.buyerEmail,
    buyerPhone: params.buyerPhone,
    paymentMethod: 'qris',
  };

  const bodyStr = JSON.stringify(body);
  const bodyHash = (await sha256Hex(bodyStr)).toLowerCase();
  const stringToSign = `POST:${va}:${bodyHash}:${apiKey}`;
  const signature = await hmacSha256(apiKey, stringToSign);

  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      va,
      signature,
      timestamp,
    },
    body: bodyStr,
  });

  const data = await response.json();

  if (data.Status !== 200) {
    throw new Error(data.Message || 'Gagal membuat transaksi iPaymu');
  }

  return {
    paymentUrl: data.Data?.Url || '',
    sessionId: data.Data?.SessionID || '',
    referenceId: params.orderCode,
  };
}