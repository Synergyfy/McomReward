import * as crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const DEFAULT_SECRET = "mcom_loyalty_default_secret_key_32bytes";

function getKey(customSecret?: string): Buffer {
  const secret =
    customSecret ||
    process.env.SSO_SECRET ||
    process.env.JWT_SECRET ||
    DEFAULT_SECRET;
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts plain text using AES-256-CBC.
 * Returns a string formatted as `ivHex:cipherHex`.
 */
export function encrypt(text: string, customSecret?: string): string {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const key = getKey(customSecret);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    // If encryption fails, return raw or handle error gracefully
    return text;
  }
}

/**
 * Decrypts a string formatted as `ivHex:cipherHex`.
 * Returns original plain text.
 */
export function decrypt(cipherText: string, customSecret?: string): string {
  if (!cipherText) return cipherText;
  // If not in encrypted format (e.g. unencrypted legacy value), return as-is
  if (!cipherText.includes(":")) {
    return cipherText;
  }
  try {
    const [ivHex, encryptedHex] = cipherText.split(":");
    if (!ivHex || !encryptedHex) return cipherText;
    const iv = Buffer.from(ivHex, "hex");
    const key = getKey(customSecret);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    // Fallback: if decryption fails (e.g. key mismatch or raw token), return original
    return cipherText;
  }
}
