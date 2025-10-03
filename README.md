# React-Native Secure key 

`@silencelaboratories/react-native-secure-key` provides a way to create TEE secure keypair for the device. The cryptographic operations using the keypair are performed inside the TEE, ensuring that the private key never leaves the secure environment.

## Platforms

### Android
On Android, this library utilizes the Android Keystore system.

### iOS
On iOS, the library leverages the Secure Enclave to create and manage the keypair.


## Installation


```sh
npm install @silencelaboratories/react-native-secure-key react-native-nitro-modules

> `react-native-nitro-modules` is required as this library relies on [Nitro Modules](https://nitro.margelo.com/).
```


## Usage

```js
import { Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import * as SecureKey from '@silencelaboratories/react-native-secure-key';
import { encode } from 'js-base64';

const KEY_ALIAS = 'my-key';

export default function App() {
  const testFeature = React.useCallback(async () => {
    const pk = SecureKey.createIfNotExistSecureKey(KEY_ALIAS);
    const message = 'Hello, World!';
    const signature = SecureKey.sign(KEY_ALIAS, encode(message));
    console.log('Signature bytes:', signature);
    const isValid = SecureKey.verify(KEY_ALIAS, signature, encode(message));
    console.log('Public Key:', pk);
    console.log('Message:', message);
    console.log('Signature:', signature);
    console.log('Is Valid:', isValid);

    const messageSigner = SecureKey.createMessageSigner(KEY_ALIAS);
    const signature2 = await messageSigner.sign(encode(message));
    console.log('Signature2 bytes:', signature2);

    SecureKey.deleteSecureKey(KEY_ALIAS);

    try {
      SecureKey.getSecureKey(KEY_ALIAS);
    } catch (error) {
      console.log('Key deleted successfully, cannot get public key:');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text>Secure Key test</Text>

      <Button
        onPress={() => {
          testFeature().catch(console.error);
        }}
        title="Test"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```


## API

### `createIfNotExistSecureKey(alias: string): string`
Creates a new secure keypair with the given alias if it does not already exist. Returns the public key in base64 format.

### `getSecureKey(alias: string): string`
Retrieves the public key associated with the given alias in base64 format. Throws an error if the key does not exist.

### `deleteSecureKey(alias: string): void`
Deletes the secure keypair associated with the given alias.

### `sign(alias: string, message: string): string`
Signs the provided message using the private key associated with the given alias. Returns the signature in base64 encoded DER format.

### `verify(alias: string, signature: string, message: string): boolean`
Verifies the provided signature against the message using the public key associated with the given alias. Returns true if the signature is valid, false otherwise.

### `createMessageSigner(alias: string): MessageSigner`
Utility function to create a `messageSigner` object for Silent Shard SDK integration.

## License

See [LICENSE](LICENSE) for details.

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
