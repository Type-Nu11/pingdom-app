// android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapView.kt
package com.rmdka.pingdomapp

import android.util.Log
import android.widget.FrameLayout
import android.widget.Toast
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.ThemedReactContext
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.LatLng
import com.kakao.vectormap.MapLifeCycleCallback
import com.kakao.vectormap.MapView
import com.kakao.vectormap.camera.CameraAnimation
import com.kakao.vectormap.camera.CameraUpdateFactory

class KakaoMapView(
    private val reactContext: ThemedReactContext
    ) : FrameLayout(reactContext), LifecycleEventListener {
    companion object {
        private const val TAG = "KakaoMapView"
    }

    private val mapView = MapView(reactContext)
    private var userLat: Double? = null
    private var userLng: Double? = null
    private var followUser: Boolean = true
    private var kakaoMap: KakaoMap? = null

    init {
        Log.d(TAG, "init: creating Kakao MapView")
        addView(
        mapView,
        LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        )

        reactContext.addLifecycleEventListener(this)

        mapView.start(
        object : MapLifeCycleCallback() {
            override fun onMapDestroy() {}
            override fun onMapError(error: Exception?) {
                Log.e(TAG, "onMapError", error)
                Toast.makeText(
                    reactContext,
                    "KakaoMap error: ${error?.message ?: "unknown"}",
                    Toast.LENGTH_LONG
                ).show()
            }
        },
        object : KakaoMapReadyCallback() {
            override fun onMapReady(kakaoMap: KakaoMap) {
                // 원래 코드:
                // Log.d(TAG, "onMapReady: Kakao map is ready")
                // Toast.makeText(reactContext, "KakaoMap ready", Toast.LENGTH_SHORT).show()
                this@KakaoMapView.kakaoMap = kakaoMap
                Log.d(TAG, "onMapReady: Kakao map is ready")
                Toast.makeText(reactContext, "KakaoMap ready", Toast.LENGTH_SHORT).show()
                updateUserLocationIfReady()
            }
        }
        )
    }
    fun setUserLat(value: Double) {
        userLat = value
        updateUserLocationIfReady()
    }

    fun setUserLng(value: Double) {
        userLng = value
        updateUserLocationIfReady()
    }

    fun setFollowUser(value: Boolean) {
        followUser = value
    }
    private fun updateUserLocationIfReady() {
        val map = kakaoMap ?: return
        val lat = userLat ?: return
        val lng = userLng ?: return

        // TODO: 실제 사용자 위치 마커(네이티브 오버레이) 추가/갱신
        // 현재는 최소 동작으로 followUser=true일 때 카메라만 사용자 위치로 이동
        if (followUser) {
            val target = LatLng.from(lat, lng)
            val update = CameraUpdateFactory.newCenterPosition(target, map.zoomLevel)
            map.moveCamera(update, CameraAnimation.from(300))
        }
    }

    override fun onHostResume() {
        Log.d(TAG, "onHostResume")
        mapView.resume()
    }

    override fun onHostPause() {
        Log.d(TAG, "onHostPause")
        mapView.pause()
    }

    override fun onHostDestroy() {
        reactContext.removeLifecycleEventListener(this)
    }

}
