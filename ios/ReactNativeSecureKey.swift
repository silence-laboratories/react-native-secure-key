extension Data {
  func toBase64() -> String {
    // This is the built-in Foundation method for Base64 encoding.
    // We pass an empty options set for standard, continuous encoding.
    return self.base64EncodedString(options: [])
  }
}

extension String {
  func fromBase64() -> Data? {
    // This is the built-in Foundation method for Base64 decoding.
    return Data(base64Encoded: self, options: [])
  }
}


enum SecureKeyError: Error {
  case privateKeyNotFound
  case publicKeyEmpty
  case someOtherError(description: String) // Example with associated value
}


class ReactNativeSecureKey: HybridReactNativeSecureKeySpec {
  func generateKeyPair(alias: String) throws -> String {
    var _ =  SecureKeyService.generateKey(alias: alias)
    guard let publicKey = SecureKeyService.getPublicKey(alias: alias) else {
      throw SecureKeyError.privateKeyNotFound
    }
    return publicKey.toBase64()
  }
  
  func getKey(alias: String) throws -> String {
    guard let publicKey = SecureKeyService.getPublicKey(alias: alias) else {
      throw SecureKeyError.publicKeyEmpty
    }
    return publicKey.toBase64()
  }
  
  func isKeyExist(alias: String) throws -> Bool {
    guard let publicKey = SecureKeyService.getPublicKey(alias: alias) else {
      return false
    }
    return !publicKey.isEmpty
  }
  
  func deleteSecureKey(alias: String) throws -> Bool {
    return SecureKeyService.deleteKey(alias: alias)
  }
  
  func sign(alias: String, message: String) throws -> String {
    guard let messageData = message.fromBase64() else {
      throw SecureKeyError.someOtherError(description: "Invalid Base64 message")
    }
    guard let signature = SecureKeyService.sign(alias: alias, message: messageData) else {
      throw SecureKeyError.someOtherError(description: "Signing failed")
    }
    return signature.toBase64()
  }
  
  func verify(alias: String, signature: String, message: String) throws -> Bool {
    guard let signatureData = signature.fromBase64() else {
      throw SecureKeyError.someOtherError(description: "Invalid Base64 input")
    }
    guard let messageData = message.fromBase64() else {
      throw SecureKeyError.someOtherError(description: "Invalid Base64 message")
    }
    
    return SecureKeyService.verify(alias: alias, signature: signatureData, message: messageData)
  }
}
