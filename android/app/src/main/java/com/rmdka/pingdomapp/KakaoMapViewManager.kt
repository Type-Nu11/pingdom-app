// android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapViewManager.kt
package com.rmdka.pingdomapp

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class KakaoMapViewManager : SimpleViewManager<KakaoMapView>() {
    override fun getName(): String = "KakaoMapView"

    override fun createViewInstance(reactContext: ThemedReactContext): KakaoMapView {
        return KakaoMapView(reactContext)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return MapBuilder.of(
            "topCameraIdle",
            MapBuilder.of("registrationName", "onCameraIdle"),
            "topCameraMoveStart",
            MapBuilder.of("registrationName", "onCameraMoveStart"),
            "topMarkerPress",
            MapBuilder.of("registrationName", "onMarkerPress")
        )
    }

    @ReactProp(name = "centerLat")
    fun setCenterLat(view: KakaoMapView, centerLat: Double) {
        view.setCenterLat(centerLat)
    }

    @ReactProp(name = "centerLng")
    fun setCenterLng(view: KakaoMapView, centerLng: Double) {
        view.setCenterLng(centerLng)
    }

    @ReactProp(name = "zoomLevel", defaultInt = 7)
    fun setZoomLevel(view: KakaoMapView, zoomLevel: Int) {
        view.setZoomLevel(zoomLevel)
    }
    @ReactProp(name = "userLat")
    fun setUserLat(view: KakaoMapView, userLat: Double) {
        view.setUserLat(userLat)
    }

    @ReactProp(name = "userLng")
    fun setUserLng(view: KakaoMapView, userLng: Double) {
        view.setUserLng(userLng)
    }

    @ReactProp(name = "followUser", defaultBoolean = true)
    fun setFollowUser(view: KakaoMapView, followUser: Boolean) {
        view.setFollowUser(followUser)
    }

    @ReactProp(name = "markers")
    fun setMarkers(view: KakaoMapView, markers: ReadableArray?) {
        view.setMarkers(markers)
    }
}
