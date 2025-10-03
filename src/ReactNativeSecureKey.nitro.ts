import type { HybridObject } from 'react-native-nitro-modules';

export interface ReactNativeSecureKey
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  generateKeyPair(alias: string): string;
  getKey(alias: string): string;
  isKeyExist(alias: string): boolean;
  deleteSecureKey(alias: string): boolean;
  sign(alias: string, message: string): string;
  verify(alias: string, signature: string, message: string): boolean;
}
