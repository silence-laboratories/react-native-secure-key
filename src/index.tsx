import { NitroModules } from 'react-native-nitro-modules';
import type { ReactNativeSecureKey } from './ReactNativeSecureKey.nitro';
import { derToRaw } from './utils';
import { Base64 } from 'js-base64';

const ReactNativeSecureKeyHybridObject =
  NitroModules.createHybridObject<ReactNativeSecureKey>('ReactNativeSecureKey');

/**
 * Generate a new secure key pair and return the public key in base64 format.
 * @param alias - The alias for the key pair.
 * @returns The public key in base64 format.
 */
export function generateSecureKeyPair(alias: string) {
  return ReactNativeSecureKeyHybridObject.generateKeyPair(alias);
}

/**
 * Get the public key in base64 format for the given alias.
 * @param alias - The alias for the key pair.
 * @returns The public key in base64 format.
 * @throws If the key does not exist.
 */
export function getSecureKey(alias: string) {
  return ReactNativeSecureKeyHybridObject.getKey(alias);
}

/**
 * Create a new secure key pair if it does not exist, otherwise return the existing public key.
 * @param alias - The alias for the key pair.
 * @returns The public key in base64 format.
 */
export function createIfNotExistSecureKey(alias: string) {
  if (ReactNativeSecureKeyHybridObject.isKeyExist(alias)) {
    return getSecureKey(alias);
  }
  return generateSecureKeyPair(alias);
}

/**
 * Delete the secure key pair for the given alias.
 * @param alias - The alias for the key pair.
 * @returns boolean indicating whether the key was deleted.
 */
export function deleteSecureKey(alias: string) {
  return ReactNativeSecureKeyHybridObject.deleteSecureKey(alias);
}

/**
 * Sign a message with the secure key pair for the given alias.
 * The message should be in base64 format.
 * The signature is returned in DER format.
 * @param alias - The alias for the key pair.
 * @param messageVKB64 - The message to sign in base64 format.
 * @returns The signature in DER format.
 */
export function sign(alias: string, messageVKB64: string) {
  return ReactNativeSecureKeyHybridObject.sign(alias, messageVKB64);
}

/**
 * Verify a signature for a message with the secure key pair for the given alias.
 * The message should be in base64 format.
 * The signature should be in DER format.
 * @param alias - The alias for the key pair.
 * @param signature - The signature in DER format.
 * @param message - The message to verify in base64 format.
 * @returns boolean indicating whether the signature is valid.
 */
export function verify(alias: string, signature: string, message: string) {
  return ReactNativeSecureKeyHybridObject.verify(alias, signature, message);
}

/**
 * Create a message signer object for the given alias. For the Silent Shard SDK.
 * @param alias - The alias for the key pair.
 * @returns An message signer object.
 */
export const createMessageSigner = (alias: string) => {
  return {
    publicKeyB64: getSecureKey(alias),
    sign: async (messageVKB64: string) => {
      const signature = sign(alias, messageVKB64);
      return Base64.fromUint8Array(derToRaw(signature));
    },
    keyType: 'ECDSA_P256_SEC1',
  } as const;
};

export { derToRaw };
