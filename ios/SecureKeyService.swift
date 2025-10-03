//
//  SecureKeyService.swift
//  Pods
//
//  Created by Samdan Dansranbavuu on 2025.10.03.
//


class SecureKeyService {
  static var algorithm: SecKeyAlgorithm = .ecdsaSignatureMessageX962SHA256

  static private func loadKey(alias: String) -> SecKey? {
    let query: [CFString: Any] = [
      kSecClass: kSecClassKey,
      kSecAttrKeyType: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrApplicationTag: alias,
      kSecAttrTokenID: kSecAttrTokenIDSecureEnclave,
      kSecReturnRef: true
    ]

    var key: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &key)

    if status == errSecSuccess {
      return (key as! SecKey) // Still safe due to query constraints
    } else {
      return nil
    }
  }

  static func generateKey(alias: String) -> SecKey? {
    guard let access = SecAccessControlCreateWithFlags(
      kCFAllocatorDefault,
      kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
      .privateKeyUsage,
      nil
    ) else { return nil }

    let attributes: [CFString: Any] = [
      kSecAttrKeyType: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits: 256,
      kSecAttrTokenID: kSecAttrTokenIDSecureEnclave,
      kSecPrivateKeyAttrs: [
        kSecAttrIsPermanent: true,
        kSecAttrApplicationTag: alias,
        kSecAttrAccessControl: access
      ]
    ]

    var error: Unmanaged<CFError>?
    return SecKeyCreateRandomKey(attributes as CFDictionary, &error)
  }

  static func deleteKey(alias: String) -> Bool {
    let query: [CFString: Any] = [
      kSecClass: kSecClassKey,
      kSecAttrKeyType: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrApplicationTag: alias,
      kSecAttrTokenID: kSecAttrTokenIDSecureEnclave
    ]

    let status = SecItemDelete(query as CFDictionary)
    return status == errSecSuccess || status == errSecItemNotFound
  }

  static func sign(alias: String, message: Data) -> Data? {
    guard let privateKey = loadKey(alias: alias) else {
      return nil
    }
    guard SecKeyIsAlgorithmSupported(privateKey, .sign, algorithm) else {
      return nil
    }
    var error: Unmanaged<CFError>?
    guard let signature = SecKeyCreateSignature(
      privateKey,
      .ecdsaSignatureMessageX962SHA256,
      message as CFData,
      &error
    ) as Data? else {
      print("Signature error: \(error?.takeRetainedValue().localizedDescription ?? "Unknown")")
      return nil
    }

    return signature
  }

  static func verify(alias: String, signature: Data, message: Data) -> Bool {
    guard let privateKey = loadKey(alias: alias) else {
      print("Private key not found")
      return false
    }
    guard let publicKey = SecKeyCopyPublicKey(privateKey) else {
      print("Failed to get public key")
      return false
    }
    guard SecKeyIsAlgorithmSupported(publicKey, .verify, algorithm) else {
      print("Algorithm not supported")
      return false
    }

    var error: Unmanaged<CFError>?
    let ok = SecKeyVerifySignature(publicKey, algorithm, message as CFData, signature as CFData, &error)
    guard error == nil else {
      print(error!)
      return false
    }
    return ok
  }

  static func getPublicKey(alias: String) -> Data? {
    guard let privateKey = loadKey(alias: alias) else {
      return nil
    }
    guard let publicKey = SecKeyCopyPublicKey(privateKey),
          let publicKeyData = SecKeyCopyExternalRepresentation(publicKey, nil) as Data? else {
      print("Failed to export public key")
      return nil
    }
    // For secp256r1, raw key is last 65 bytes (uncompressed)
    //            let rawKey = publicKeyData.suffix(65) // Skip SPKI header
    return publicKeyData
  }
}
