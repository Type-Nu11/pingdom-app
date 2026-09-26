// android/app/src/main/java/com/rmdka/pingdomapp/NaverMapViewManager.kt
package com.rmdka.pingdomapp

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

// @ReactProp은 JS props를 Kotlin setter에 연결하고, 아래 이벤트 맵은 native → JS 콜백을 연결한다.
class NaverMapViewManager : SimpleViewManager<NaverMapView>() {
    override fun getName(): String = "NaverMapView"

    override fun createViewInstance(reactContext: ThemedReactContext): NaverMapView {
        return NaverMapView(reactContext)
    }

    // 위도/경도가 각각 전달되는 도중에는 이동하지 않고 한 묶음의 props 수신 후 반영한다.
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
    // RN의 이 브리지는 nullable Double setter를 지원하지 않는다. 삭제된 위치 prop은
    // NaN으로 받아 뷰의 validCoordinate 검사에서 제외하므로 (0, 0)에 사용자 마커가 생기지 않는다.
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

    // JS의 nightMode를 저장하고, props 묶음 수신이 끝난 onAfterUpdateTransaction에서 적용한다.
    @ReactProp(name = "nightMode", defaultBoolean = false)
    fun setNightMode(view: NaverMapView, nightMode: Boolean) {
        view.setNightMode(nightMode)
    }

    @ReactProp(name = "markers")
    fun setMarkers(view: NaverMapView, markers: ReadableArray?) {
        view.setMarkers(markers)
    }
}
