import { NitroModules } from 'react-native-nitro-modules';
import type { ReactNativeSecureKey } from './ReactNativeSecureKey.nitro';

const ReactNativeSecureKeyHybridObject =
  NitroModules.createHybridObject<ReactNativeSecureKey>('ReactNativeSecureKey');

export function multiply(a: number, b: number): number {
  return ReactNativeSecureKeyHybridObject.multiply(a, b);
}
