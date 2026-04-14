// android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapViewManager.kt
package com.rmdka.pingdomapp

import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class KakaoMapViewManager : SimpleViewManager<KakaoMapView>() {
    override fun getName(): String = "KakaoMapView"

    override fun createViewInstance(reactContext: ThemedReactContext): KakaoMapView {
        return KakaoMapView(reactContext)
    }

    @ReactProp(name = "centerLat")
    fun setCenterLat(view: KakaoMapView, centerLat: Double) {
        // iOS bridge uses this prop. Android support can be added later.
    }

    @ReactProp(name = "centerLng")
    fun setCenterLng(view: KakaoMapView, centerLng: Double) {
        // iOS bridge uses this prop. Android support can be added later.
    }

    @ReactProp(name = "zoomLevel", defaultInt = 7)
    fun setZoomLevel(view: KakaoMapView, zoomLevel: Int) {
        // iOS bridge uses this prop. Android support can be added later.
    }
}
