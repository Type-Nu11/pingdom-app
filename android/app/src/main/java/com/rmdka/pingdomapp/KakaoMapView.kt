// android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapView.kt
package com.rmdka.pingdomapp

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.util.Log
import android.widget.FrameLayout
import android.widget.Toast
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.ThemedReactContext
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.LatLng
import com.kakao.vectormap.MapLifeCycleCallback
import com.kakao.vectormap.MapView
import com.kakao.vectormap.camera.CameraAnimation
import com.kakao.vectormap.camera.CameraUpdateFactory
import com.kakao.vectormap.label.CompetitionType
import com.kakao.vectormap.label.CompetitionUnit
import com.kakao.vectormap.label.LabelLayer
import com.kakao.vectormap.label.LabelLayerOptions
import com.kakao.vectormap.label.LabelOptions
import com.kakao.vectormap.label.LabelStyle
import com.kakao.vectormap.label.LabelStyles
import com.kakao.vectormap.label.OrderingType

private data class MapMarker(
    val id: String,
    val lat: Double,
    val lng: Double
)

class KakaoMapView(
    private val reactContext: ThemedReactContext
    ) : FrameLayout(reactContext), LifecycleEventListener {
    companion object {
        private const val TAG = "KakaoMapView"
        private const val MARKER_LAYER_ID = "pingdom_markers"
        private const val MARKER_STYLE_ID = "pingdom_marker_style"
        private const val USER_LOCATION_STYLE_ID = "pingdom_user_location_style"
        private const val USER_LOCATION_LABEL_ID = "pingdom_user_location_label"
    }

    private val mapView = MapView(reactContext)
    private var userLat: Double? = null
    private var userLng: Double? = null
    private var followUser: Boolean = true
    private var kakaoMap: KakaoMap? = null
    private var markerLayer: LabelLayer? = null
    private var markers: List<MapMarker> = emptyList()

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
                updateMarkersIfReady()
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
        if (value) {
            updateUserLocationIfReady()
        }
    }

    fun setMarkers(value: ReadableArray?) {
        markers = parseMarkers(value)
        updateMarkersIfReady()
    }

    private fun parseMarkers(value: ReadableArray?): List<MapMarker> {
        if (value == null) return emptyList()

        return buildList {
            for (index in 0 until value.size()) {
                val marker = value.getMap(index) ?: continue
                if (!marker.hasKey("lat") || !marker.hasKey("lng")) continue

                add(
                    MapMarker(
                        id = if (marker.hasKey("id")) marker.getString("id") ?: "marker-$index" else "marker-$index",
                        lat = marker.getDouble("lat"),
                        lng = marker.getDouble("lng")
                    )
                )
            }
        }
    }

    private fun updateMarkersIfReady() {
        val map = kakaoMap ?: return
        val manager = map.labelManager ?: return
        val layer = markerLayer
            ?: manager.getLayer(MARKER_LAYER_ID)
            ?: manager.addLayer(
                LabelLayerOptions.from(MARKER_LAYER_ID)
                    .setCompetitionType(CompetitionType.None)
                    .setCompetitionUnit(CompetitionUnit.IconFirst)
                    .setOrderingType(OrderingType.Rank)
                    .setZOrder(10)
            )
            ?: return

        markerLayer = layer
        layer.removeAll()

        val styles = manager.getLabelStyles(MARKER_STYLE_ID)
            ?: manager.addLabelStyles(
                LabelStyles.from(
                    MARKER_STYLE_ID,
                    LabelStyle.from(createMarkerBitmap()).setAnchorPoint(PointF(0.5f, 1.0f))
                )
            )

        markers.forEach { marker ->
            layer.addLabel(
                LabelOptions
                    .from(marker.id, LatLng.from(marker.lat, marker.lng))
                    .setStyles(styles)
            )
        }

        addUserLocationLabelIfReady(layer, manager)
    }

    private fun createMarkerBitmap(): Bitmap {
        val scale = resources.displayMetrics.density
        val width = (44 * scale).toInt()
        val height = (56 * scale).toInt()
        val centerX = width / 2f
        val circleY = 21 * scale
        val radius = 17 * scale

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.rgb(255,74,117)
            style = Paint.Style.FILL
        }
        val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = 2.5f * scale
        }
        val tipPath = Path().apply {
            moveTo(centerX, 48 * scale)
            lineTo(centerX - 10 * scale, 34 * scale)
            lineTo(centerX + 10 * scale, 34 * scale)
            close()
        }

        canvas.drawPath(tipPath, fillPaint)
        canvas.drawPath(tipPath, strokePaint)
        canvas.drawCircle(centerX, circleY, radius, fillPaint)
        canvas.drawCircle(centerX, circleY, radius, strokePaint)

        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textAlign = Paint.Align.CENTER
            textSize = 25 * scale
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }
        val textY = circleY - (textPaint.descent() + textPaint.ascent()) / 2f
        canvas.drawText("♪", centerX, textY, textPaint)

        return bitmap
    }

    private fun updateUserLocationIfReady() {
        val map = kakaoMap ?: return
        val lat = userLat ?: return
        val lng = userLng ?: return

        updateMarkersIfReady()

        if (followUser) {
            val target = LatLng.from(lat, lng)
            val update = CameraUpdateFactory.newCenterPosition(target, map.zoomLevel)
            map.moveCamera(update, CameraAnimation.from(300))
        }
    }

    private fun addUserLocationLabelIfReady(layer: LabelLayer, manager: com.kakao.vectormap.label.LabelManager) {
        val lat = userLat ?: return
        val lng = userLng ?: return
        val styles = manager.getLabelStyles(USER_LOCATION_STYLE_ID)
            ?: manager.addLabelStyles(
                LabelStyles.from(
                    USER_LOCATION_STYLE_ID,
                    LabelStyle.from(createUserLocationBitmap())
                        .setAnchorPoint(PointF(0.5f, 0.72f))
                        .setApplyDpScale(false)
                )
            )

        layer.addLabel(
            LabelOptions
                .from(USER_LOCATION_LABEL_ID, LatLng.from(lat, lng))
                .setStyles(styles)
        )
    }

    private fun createUserLocationBitmap(): Bitmap {
        val scale = resources.displayMetrics.density
        val width = (64 * scale).toInt()
        val height = (84 * scale).toInt()
        val centerX = width / 2f
        val circleCenterY = 56 * scale
        val circleRadius = 22 * scale

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val pink = Color.rgb(255, 25, 86)

        val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.argb(45, 0, 0, 0)
            style = Paint.Style.FILL
        }
        val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = pink
            style = Paint.Style.FILL
        }
        val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeJoin = Paint.Join.ROUND
            strokeCap = Paint.Cap.ROUND
            strokeWidth = 5f * scale
        }

        val arrowPath = Path().apply {
            moveTo(centerX, 6 * scale)
            lineTo(centerX - 20 * scale, 34 * scale)
            lineTo(centerX + 20 * scale, 34 * scale)
            close()
        }

        canvas.drawCircle(centerX, circleCenterY + 2 * scale, circleRadius + 5 * scale, shadowPaint)
        canvas.drawPath(arrowPath, strokePaint)
        canvas.drawPath(arrowPath, fillPaint)
        canvas.drawCircle(centerX, circleCenterY, circleRadius + 5 * scale, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.FILL
        })
        canvas.drawCircle(centerX, circleCenterY, circleRadius, fillPaint)

        return bitmap
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
