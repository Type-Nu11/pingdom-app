// android/app/src/main/java/com/rmdka/pingdomapp/NaverMapViewManager.kt
package com.rmdka.pingdomapp

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class NaverMapViewManager : SimpleViewManager<NaverMapView>() {
    override fun getName(): String = "NaverMapView"

    override fun createViewInstance(reactContext: ThemedReactContext): NaverMapView {
        return NaverMapView(reactContext)
    }

    override fun onAfterUpdateTransaction(view: NaverMapView) {
        super.onAfterUpdateTransaction(view)
        view.applyProps()
    }

    override fun onDropViewInstance(view: NaverMapView) {
        view.dispose()
        super.onDropViewInstance(view)
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
        return MapBuilder.of(
            "topCameraIdle",
            MapBuilder.of("registrationName", "onCameraIdle"),
            "topMarkerPress",
            MapBuilder.of("registrationName", "onMarkerPress")
        )
    }

    @ReactProp(name = "centerLat")
    fun setCenterLat(view: NaverMapView, centerLat: Double) {
        view.setCenterLat(centerLat)
    }

    @ReactProp(name = "centerLng")
    fun setCenterLng(view: NaverMapView, centerLng: Double) {
        view.setCenterLng(centerLng)
    }

    @ReactProp(name = "zoomLevel", defaultInt = 17)
    fun setZoomLevel(view: NaverMapView, zoomLevel: Int) {
        view.setZoomLevel(zoomLevel)
    }
    @ReactProp(name = "userLat", defaultDouble = Double.NaN)
    fun setUserLat(view: NaverMapView, userLat: Double) {
        view.setUserLat(userLat)
    }

    @ReactProp(name = "userLng", defaultDouble = Double.NaN)
    fun setUserLng(view: NaverMapView, userLng: Double) {
        view.setUserLng(userLng)
    }

    @ReactProp(name = "followUser", defaultBoolean = true)
    fun setFollowUser(view: NaverMapView, followUser: Boolean) {
        view.setFollowUser(followUser)
    }

    @ReactProp(name = "markers")
    fun setMarkers(view: NaverMapView, markers: ReadableArray?) {
        view.setMarkers(markers)
    }
}
