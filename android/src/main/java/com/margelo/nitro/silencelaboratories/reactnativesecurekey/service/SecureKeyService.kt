package com.margelo.nitro.silencelaboratories.reactnativesecurekey.service

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature
import java.security.spec.ECGenParameterSpec

object SecureKeyService {
  private const val PROVIDER = "AndroidKeyStore"

  // Function to initiate a key pair in the secure enclave
  private fun loadKey(alias: String): KeyPair? {
    return try {
      val ks = KeyStore.getInstance(PROVIDER).apply { load(null) }
      if (!ks.containsAlias(alias)) return null
      val entry = ks.getEntry(alias, null)
      if (entry is KeyStore.PrivateKeyEntry) {
        val privateKey = entry.privateKey
        val publicKey = entry.certificate.publicKey
        return KeyPair(publicKey, privateKey)
      }
      null
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }

  fun generateKey(alias: String): KeyPair? {
    return try {
      val kpg = KeyPairGenerator.getInstance(
        KeyProperties.KEY_ALGORITHM_EC,
        PROVIDER
      )
      val parameterSpec = KeyGenParameterSpec.Builder(
        alias,
        KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
      ).run {
        setDigests(KeyProperties.DIGEST_SHA256)
        setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
        setUserAuthenticationRequired(false)
        build()
      }
      kpg.initialize(parameterSpec)
      kpg.generateKeyPair()
    } catch (e: Exception) {
      e.printStackTrace()
      return null
    }
  }

  fun deleteKey(alias: String): Boolean {
    return try {
      val ks = KeyStore.getInstance(PROVIDER).apply { load(null) }
      ks.deleteEntry(alias)
      true
    } catch (e: Exception) {
      e.printStackTrace()
      false
    }
  }

  // Function to sign data using the secure enclave
  fun sign(alias: String, message: ByteArray): ByteArray? {
    return try {
      val kp = loadKey(alias) ?: return null
      val signature = Signature.getInstance("SHA256withECDSA").run {
        initSign(kp.private)
        update(message)
        sign()
      }
      signature
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }

  fun verify(alias: String, signature: ByteArray, message: ByteArray): Boolean {
    return try {
      val kp = loadKey(alias) ?: return false
      val verified = Signature.getInstance("SHA256withECDSA").run {
        initVerify(kp.public)
        update(message)
        verify(signature)
      }
      verified
    } catch (e: Exception) {
      e.printStackTrace()
      false
    }
  }

  // Function to get the raw public key in hexadecimal format
  fun getPublicKey(alias: String): ByteArray? {
    return try {
      val kp = loadKey(alias) ?: return null
      val derBytes = kp.public.encoded
      val idx = derBytes.indexOf(0x04)
      require(idx >= 0 && derBytes.size >= idx + 65) { throw IllegalArgumentException("Invalid DER encoded public key") }
      derBytes.copyOfRange(idx, idx + 65)
    } catch (e: Exception) {
      e.printStackTrace()
      return null
    }
  }
}
