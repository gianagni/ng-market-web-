export function normalizePhone(input: string): string {
  let cleaned = input.replace(/\D/g, ''); // hapus semua karakter non-digit
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}