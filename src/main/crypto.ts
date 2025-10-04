import CryptoJS from 'crypto-js';

const SALT_SIZE = 16;
const ITERATIONS = 10000;
const KEY_SIZE = 256 / 32;

/**
 * Verschlüsselt Daten mit AES-256
 * @param data - Die zu verschlüsselnden Daten
 * @param masterPassword - Das Master-Passwort
 * @returns Verschlüsselte Daten als String
 */
export function encryptData(data: string, masterPassword: string): string {
  try {
    // Generiere einen zufälligen Salt
    const salt = CryptoJS.lib.WordArray.random(SALT_SIZE);
    
    // Derive Key mit PBKDF2
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: KEY_SIZE,
      iterations: ITERATIONS,
    });

    // Verschlüssele die Daten
    const encrypted = CryptoJS.AES.encrypt(data, key.toString(), {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Kombiniere Salt + verschlüsselte Daten
    const result = {
      salt: salt.toString(),
      ciphertext: encrypted.toString(),
    };

    return JSON.stringify(result);
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Entschlüsselt Daten
 * @param encryptedData - Die verschlüsselten Daten
 * @param masterPassword - Das Master-Passwort
 * @returns Entschlüsselte Daten als String
 */
export function decryptData(encryptedData: string, masterPassword: string): string {
  try {
    const { salt, ciphertext } = JSON.parse(encryptedData);
    
    // Derive Key mit dem gleichen Salt
    const key = CryptoJS.PBKDF2(masterPassword, CryptoJS.enc.Hex.parse(salt), {
      keySize: KEY_SIZE,
      iterations: ITERATIONS,
    });

    // Entschlüssele die Daten
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key.toString(), {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!plaintext) {
      throw new Error('Decryption resulted in empty string - wrong password?');
    }

    return plaintext;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hash ein Passwort für die Verifikation (ohne die Daten zu entschlüsseln)
 * @param password - Das zu hashende Passwort
 * @returns Gehashtes Passwort
 */
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}
