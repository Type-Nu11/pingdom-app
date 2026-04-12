// android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapViewManager.kt
package com.rmdka.pingdomapp

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class KakaoMapViewManager : SimpleViewManager<KakaoMapView>() {
    override fun getName(): String = "KakaoMapView"

    override fun createViewInstance(reactContext: ThemedReactContext): KakaoMapView {
        return KakaoMapView(reactContext)
    }
}
