// android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapView.kt
package com.rmdka.pingdomapp

import android.util.Log
import android.widget.FrameLayout
import android.widget.Toast
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.ThemedReactContext
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.MapLifeCycleCallback
import com.kakao.vectormap.MapView

class KakaoMapView(
    private val reactContext: ThemedReactContext
    ) : FrameLayout(reactContext), LifecycleEventListener {
    companion object {
        private const val TAG = "KakaoMapView"
    }

    private val mapView = MapView(reactContext)

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
                Log.d(TAG, "onMapReady: Kakao map is ready")
                Toast.makeText(reactContext, "KakaoMap ready", Toast.LENGTH_SHORT).show()
            }
        }
        )
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
