const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getKey(): Promise<CryptoKey> {
  const keyBytes = hexToBytes(process.env.CREDENTIAL_ENCRYPTION_KEY!);
  const keyBuffer = keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer;
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as unknown as BufferSource },
    key,
    encoded as unknown as BufferSource
  );
  const encryptedBytes = new Uint8Array(encrypted);
  const ciphertext = encryptedBytes.slice(0, -16);
  const tag = encryptedBytes.slice(-16);
  return `${bytesToHex(iv)}:${bytesToHex(tag)}:${bytesToHex(ciphertext)}`;
}

export async function decrypt(ciphertext: string): Promise<string> {
  const [ivHex, tagHex, dataHex] = ciphertext.split(':');
  const key = await getKey();
  const iv = hexToBytes(ivHex);
  const tag = hexToBytes(tagHex);
  const data = hexToBytes(dataHex);
  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data);
  combined.set(tag, data.length);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv as unknown as BufferSource },
    key,
    combined as unknown as BufferSource
  );
  return new TextDecoder().decode(decrypted);
}