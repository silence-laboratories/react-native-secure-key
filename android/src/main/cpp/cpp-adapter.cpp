#include <jni.h>
#include "silencelaboratories_reactnativesecurekeyOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::silencelaboratories_reactnativesecurekey::initialize(vm);
}
