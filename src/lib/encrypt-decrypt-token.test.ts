import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { encryptToken, decryptToken } from '../lib/encrypt-decrypt-token';

describe('Token Encryption and Decryption', () => {
  // Store the original ENCRYPTION_KEY
  const originalKey = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    // Set a known encryption key for testing
    process.env.ENCRYPTION_KEY = '3d133ad1937eaa3380d6988841dbdd1e41dcf71539dbc0eec9308a4aab4b7d8a';
  });

  afterAll(() => {
    // Restore the original ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = originalKey;
  });

  it('should encrypt and decrypt a token correctly', () => {
    const originalToken = 'my-secret-token';
    const encryptedToken = encryptToken(originalToken);
    const decryptedToken = decryptToken(encryptedToken);

    expect(decryptedToken).toBe(originalToken);
  });

  it('should produce different encrypted values for the same input', () => {
    const token = 'another-secret-token';
    const encrypted1 = encryptToken(token);
    const encrypted2 = encryptToken(token);

    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should handle empty strings', () => {
    const emptyToken = '';
    const encryptedEmpty = encryptToken(emptyToken);
    const decryptedEmpty = decryptToken(encryptedEmpty);

    expect(decryptedEmpty).toBe(emptyToken);
  });

  it('should handle long strings', () => {
    const longToken = 'a'.repeat(1000);
    const encryptedLong = encryptToken(longToken);
    const decryptedLong = decryptToken(encryptedLong);

    expect(decryptedLong).toBe(longToken);
  });

  it('should throw an error for invalid encrypted tokens', () => {
    const invalidToken = 'not-a-valid-encrypted-token';
    
    expect(() => decryptToken(invalidToken)).toThrow();
  });
});
