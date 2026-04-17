import { Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import * as SecureKey from '@silencelaboratories/react-native-secure-key';
import { Base64, encode } from 'js-base64';

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
    console.log(
      'Signature2 bytes:',
      signature2,
      Base64.toUint8Array(signature2).length
    );

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
