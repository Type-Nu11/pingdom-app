// android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapPackage.kt
package com.rmdka.pingdomapp

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class KakaoMapPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> { //밑줄 그어지는데 ReactPackage 인터페이스 매서드 때문일 듯? 일단 돌아가니깐 
        return emptyList()
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return listOf(KakaoMapViewManager())
    }
}
