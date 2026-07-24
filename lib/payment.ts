// lib/payment.ts
// Abstraksi payment gateway — ganti implementasi di sini kalau mau pindah provider

export type PaymentProvider = 'temanqris';

export interface CreatePaymentParams {
  orderCode: string;
  amount: number;
  description: string;
  returnUrl: string;
  notifyUrl: string;
}

export interface CreatePaymentResult {
  paymentUrl: string;
  linkCode: string;
  referenceId: string;
}

export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
  const apiKey = process.env.TEMANQRIS_API_KEY!;
  const url = 'https://temanqris.com/api/qris/payment-link';

  const body = {
    amount: params.amount,
    description: params.description,
    order_id: params.orderCode,
    webhook_url: params.notifyUrl,
    callback_url: params.returnUrl,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || data.error || 'Gagal membuat transaksi TemanQRIS');
  }

  const linkCode = data.payment_link?.link_code || '';
  const paymentUrl = `https://temanqris.com/p/${linkCode}`;

  return {
    paymentUrl,
    linkCode,
    referenceId: params.orderCode,
  };
}
