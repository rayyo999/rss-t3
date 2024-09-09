import crypto from "crypto";

const NONCE_LENGTH = 12; // For GCM, nonce is typically 12 bytes
const KEY_LENGTH = 32; // 256 bits for AES-256

// Ensure the ENCRYPTION_KEY is exactly 32 bytes (256 bits)
const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY ?? "defaultEncryptionKeyWith32Characters",
  "utf-8",
).subarray(0, KEY_LENGTH);

const EMPTY_TOKEN = "EMPTY";

export function encryptToken(token: string): string {
  if (token === "") {
    return EMPTY_TOKEN;
  }
  const nonce = crypto.randomBytes(NONCE_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, nonce);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${nonce.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
}

export function decryptToken(encryptedToken: string): string {
  if (encryptedToken === EMPTY_TOKEN) {
    return "";
  }
  const [nonceHex, encrypted, tagHex] = encryptedToken.split(":");
  if (!nonceHex || !encrypted || !tagHex) {
    throw new Error("Invalid encrypted token format");
  }
  const nonce = Buffer.from(nonceHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    ENCRYPTION_KEY,
    nonce,
  );
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
