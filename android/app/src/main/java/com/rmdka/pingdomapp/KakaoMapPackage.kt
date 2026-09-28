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
        // MainApplication의 패키지 목록을 통해 RN에 매니저를 등록한다.
        // V2는 NaverMapView를 사용하고, 기존 V1 호출자를 위해 KakaoMapView도 함께 등록한다.
        return listOf(KakaoMapViewManager(), NaverMapViewManager(), MapGlassBackdropViewManager())
    }
}
