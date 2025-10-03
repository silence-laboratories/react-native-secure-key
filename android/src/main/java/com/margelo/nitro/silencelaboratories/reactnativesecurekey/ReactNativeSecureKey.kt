package com.margelo.nitro.silencelaboratories.reactnativesecurekey

import android.util.Base64
import android.util.Log
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.silencelaboratories.reactnativesecurekey.service.SecureKeyService

fun String.fromBase64(flag: Int = Base64.NO_WRAP): ByteArray = Base64.decode(this, flag)
fun ByteArray.toBase64(flag: Int = Base64.NO_WRAP): String = Base64.encodeToString(this, flag)

@DoNotStrip
class ReactNativeSecureKey : HybridReactNativeSecureKeySpec() {
  override fun generateKeyPair(alias: String): String {
    SecureKeyService.generateKey(alias)
    return SecureKeyService.getPublicKey(alias)?.toBase64() ?: throw Error("Failed to generate key pair")
  }

  override fun getKey(alias: String): String {
    return SecureKeyService.getPublicKey(alias)?.toBase64() ?: throw Error("Key not found")
  }

  override fun isKeyExist(alias: String): Boolean {
    return SecureKeyService.getPublicKey(alias) != null
  }

  override fun deleteSecureKey(alias: String): Boolean {
    return SecureKeyService.deleteKey(alias)
  }

  override fun sign(alias: String, message: String): String {
    return SecureKeyService.sign(alias, message.fromBase64())?.let {
      Log.e("SIGNATURE", it.joinToString(separator = " ") { b -> String.format("%02x", b) })
      it.toBase64()
    } ?: throw Error("Failed to sign message")
  }

  override fun verify(
    alias: String,
    signature: String,
    message: String
  ): Boolean {
    return SecureKeyService.verify(alias, signature.fromBase64(), message.fromBase64())
  }
}
