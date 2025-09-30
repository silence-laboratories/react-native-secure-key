package com.margelo.nitro.silencelaboratories.reactnativesecurekey
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class ReactNativeSecureKey : HybridReactNativeSecureKeySpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
