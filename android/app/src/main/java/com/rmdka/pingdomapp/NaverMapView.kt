package com.rmdka.pingdomapp

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.view.Gravity
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.common.LifecycleState
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.naver.maps.geometry.LatLng
import com.naver.maps.map.CameraAnimation
import com.naver.maps.map.CameraUpdate
import com.naver.maps.map.MapView
import com.naver.maps.map.NaverMap
import com.naver.maps.map.NaverMapOptions
import com.naver.maps.map.overlay.Marker
import com.naver.maps.map.overlay.OverlayImage
import kotlin.math.roundToInt

private data class NaverPlaceMarker(val id: String, val category: String, val lat: Double, val lng: Double)

/** Native V2 host. Props are applied together to avoid moving to a half-updated coordinate. */
class NaverMapView(private val reactContext: ThemedReactContext) :
    FrameLayout(reactContext), LifecycleEventListener {
    // Keep SurfaceView rendering so MapGlassBackdropView can capture it with PixelCopy.
    private val mapView = MapView(reactContext, NaverMapOptions().useTextureView(false))
    private var naverMap: NaverMap? = null
    private var centerLat: Double? = null
    private var centerLng: Double? = null
    private var userLat: Double? = null
    private var userLng: Double? = null
    private var followUser = true
    private var nightMode = false
    private var appliedNightMode: Boolean? = null
    private var zoomLevel = 17
    private var placeData = emptyList<NaverPlaceMarker>()
    private var markersDirty = true
    private val placeMarkers = mutableMapOf<String, Marker>()
    private val icons = mutableMapOf<String, OverlayImage>()
    private val userMarker = Marker()
    private var lastCamera: Triple<Double, Double, Int>? = null
    private var lastFollowUser = false
    private var started = false
    private var resumed = false
    private var disposed = false
    private var hostResumed = reactContext.lifecycleState == LifecycleState.RESUMED

    // React Native owns the host layout; schedule a native child layout pass when
    // SDK controls (including attribution) request one after asynchronous map setup.
    private val layoutChildren = Runnable {
        if (!disposed && width > 0 && height > 0) {
            measure(MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY))
            layout(left, top, right, bottom)
        }
    }

    init {
        addView(mapView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        mapView.onCreate(null)
        reactContext.addLifecycleEventListener(this)
        // SDK의 지도 제어 객체가 준비된 뒤에만 마커/카메라 API를 호출한다.
        // 준비 전에 들어온 React props는 필드에 보관했다가 마지막 applyProps()에서 반영한다.
        mapView.getMapAsync { map ->
            if (!disposed) {
                naverMap = map
                map.uiSettings.apply {
                    isZoomControlEnabled = false
                    isLocationButtonEnabled = false
                    isCompassEnabled = false
                    isScaleBarEnabled = false
                    // 공식 SDK 안내상 로고는 숨기거나 다른 UI로 가리지 않고 위치/여백만 조정한다.
                    // https://navermaps.github.io/android-map-sdk/guide-ko/4-1.html
                    // 검색창·카테고리 아래 왼쪽에 두어 우측의 앱 버튼과 겹치지 않게 한다.
                    logoGravity = Gravity.TOP or Gravity.LEFT
                    setLogoMargin(dp(16f), dp(160f), 0, 0)
                }
                map.addOnCameraIdleListener {
                    val target = map.cameraPosition.target
                    emit("topCameraIdle", Arguments.createMap().apply {
                        putDouble("lat", target.latitude)
                        putDouble("lng", target.longitude)
                    })
                }
                map.setOnMapClickListener { point, _ ->
                    // Maintain the existing forgiving touch area; direct marker clicks consume events.
                    val nearest = placeData.minByOrNull {
                        val screen = map.projection.toScreenLocation(LatLng(it.lat, it.lng))
                        val dx = screen.x - point.x
                        val dy = screen.y - point.y
                        dx * dx + dy * dy
                    }
                    nearest?.let {
                        val screen = map.projection.toScreenLocation(LatLng(it.lat, it.lng))
                        val dx = screen.x - point.x
                        val dy = screen.y - point.y
                        val tolerance = dp(54f).toFloat()
                        if (dx * dx + dy * dy <= tolerance * tolerance) emitMarkerPress(it.id)
                    }
                }
                applyProps()
            }
        }
    }

    fun setCenterLat(value: Double) { centerLat = value }
    fun setCenterLng(value: Double) { centerLng = value }
    fun setUserLat(value: Double?) { userLat = value }
    fun setUserLng(value: Double?) { userLng = value }
    fun setZoomLevel(value: Int) { zoomLevel = value.coerceIn(0, 21) }
    fun setFollowUser(value: Boolean) { followUser = value }
    fun setNightMode(value: Boolean) { nightMode = value }

    fun setMarkers(value: ReadableArray?) {
        val next = buildList {
            for (index in 0 until (value?.size() ?: 0)) {
                val item = value?.getMap(index) ?: continue
                if (!item.hasKey("lat") || item.isNull("lat") || !item.hasKey("lng") || item.isNull("lng")) continue
                val lat = item.getDouble("lat")
                val lng = item.getDouble("lng")
                if (!validCoordinate(lat, lng)) continue
                val id = if (item.hasKey("id")) item.getString("id") else null
                val category = if (item.hasKey("category")) item.getString("category") else null
                add(NaverPlaceMarker(id ?: "marker-$index", normalizeCategory(category), lat, lng))
            }
        }
        if (next != placeData) {
            placeData = next
            markersDirty = true
        }
    }

    // 앱의 마커 ID를 SDK Marker와 연결한다. SDK 터치 시 같은 ID를 JS에 돌려줘 장소를 선택한다.
    // 현재 위치도 앱에서 받은 좌표로 표시하며, SDK가 별도로 GPS 권한을 요청하지 않는다.
    fun applyProps() {
        if (disposed) return
        val map = naverMap ?: return
        if (appliedNightMode != nightMode) {
            // Basic 유형에는 야간 모드가 적용되지 않으므로 다크 테마에서 Navi로 전환한다.
            // 지도 뷰를 재생성하지 않아 카메라와 마커 선택 상태는 유지된다.
            map.mapType = if (nightMode) NaverMap.MapType.Navi else NaverMap.MapType.Basic
            map.isNightModeEnabled = nightMode
            appliedNightMode = nightMode
        }
        if (markersDirty) {
            val ids = placeData.map { it.id }.toSet()
            placeMarkers.keys.filter { it !in ids }.forEach { id ->
                placeMarkers.remove(id)?.apply { this.map = null; onClickListener = null }
            }
            for (data in placeData) {
                val marker = placeMarkers.getOrPut(data.id) { Marker() }
                marker.position = LatLng(data.lat, data.lng)
                marker.icon = placeIcon(data.category)
                marker.anchor = PointF(0.5f, 0.62f)
                marker.isHideCollidedMarkers = false
                marker.isHideCollidedSymbols = false
                marker.isForceShowIcon = true
                marker.zIndex = 10
                marker.setOnClickListener { emitMarkerPress(data.id); true }
                marker.map = map
            }
            markersDirty = false
        }
        val validUser = validCoordinate(userLat, userLng)
        if (validUser) {
            userMarker.position = LatLng(userLat!!, userLng!!)
            if (userMarker.map == null) {
                userMarker.icon = OverlayImage.fromBitmap(createUserLocationBitmap())
                userMarker.anchor = PointF(0.5f, userAnchorY())
                userMarker.zIndex = 20
                userMarker.isForceShowIcon = true
                userMarker.map = map
            }
        } else {
            userMarker.map = null
        }
        val lat = if (followUser && validUser) userLat else centerLat
        val lng = if (followUser && validUser) userLng else centerLng
        if (validCoordinate(lat, lng)) {
            val next = Triple(lat!!, lng!!, zoomLevel)
            if (next != lastCamera || (followUser && !lastFollowUser)) {
                val update = CameraUpdate.scrollAndZoomTo(LatLng(lat, lng), zoomLevel.toDouble())
                if (lastCamera != null) update.animate(CameraAnimation.Easing, 300)
                map.moveCamera(update)
                lastCamera = next
            }
        }
        lastFollowUser = followUser
    }

    private fun placeIcon(category: String): OverlayImage = icons.getOrPut(category) {
        val resourceId = resources.getIdentifier("map_marker_default_$category", "drawable", reactContext.packageName)
        val original = BitmapFactory.decodeResource(resources, if (resourceId != 0) resourceId else R.drawable.map_marker_default_etc)
        val width = dp(32f)
        val height = (original.height * width.toFloat() / original.width).roundToInt().coerceAtLeast(1)
        val scaled = Bitmap.createScaledBitmap(original, width, height, true)
        if (scaled !== original) original.recycle()
        OverlayImage.fromBitmap(scaled)
    }

    private fun normalizeCategory(value: String?): String = when (value) {
        "art", "beauty", "cafe", "etc", "fashion", "food", "game", "heritage", "music", "popup" -> value
        else -> "etc"
    }

    private fun validCoordinate(lat: Double?, lng: Double?): Boolean =
        lat != null && lng != null && lat.isFinite() && lng.isFinite() && lat in -90.0..90.0 && lng in -180.0..180.0

    private fun dp(value: Float) = (value * resources.displayMetrics.density).roundToInt()

    private fun emitMarkerPress(markerId: String) = emit("topMarkerPress", Arguments.createMap().apply {
        putString("markerId", markerId)
    })

    private fun emit(name: String, data: WritableMap) {
        if (disposed || id == NO_ID) return
        UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)?.dispatchEvent(
            NaverMapEvent(name, UIManagerHelper.getSurfaceId(this), id, data)
        )
    }

    override fun requestLayout() {
        super.requestLayout()
        if (width <= 0 || height <= 0) return
        removeCallbacks(layoutChildren)
        post(layoutChildren)
    }

    override fun onAttachedToWindow() { super.onAttachedToWindow(); updateLifecycle() }
    override fun onDetachedFromWindow() { pauseMap(); super.onDetachedFromWindow() }
    override fun onHostResume() { hostResumed = true; updateLifecycle() }
    override fun onHostPause() { hostResumed = false; pauseMap() }
    override fun onHostDestroy() { dispose() }

    // RN 화면 부착 상태와 앱 foreground 상태를 SDK 수명주기에 전달한다.
    // 화면 이탈/백그라운드에서는 pauseMap(), 실제 뷰 폐기 시에는 dispose()로 렌더링 자원을 정리한다.
    private fun updateLifecycle() {
        if (disposed || !isAttachedToWindow || !hostResumed) return
        if (!started) { mapView.onStart(); started = true }
        if (!resumed) { mapView.onResume(); resumed = true }
    }

    private fun pauseMap() {
        if (resumed) { mapView.onPause(); resumed = false }
        if (started) { mapView.onStop(); started = false }
    }

    fun dispose() {
        if (disposed) return
        disposed = true
        removeCallbacks(layoutChildren)
        reactContext.removeLifecycleEventListener(this)
        placeMarkers.values.forEach { it.map = null; it.onClickListener = null }
        placeMarkers.clear()
        userMarker.map = null
        pauseMap()
        mapView.onDestroy()
        naverMap = null
        icons.clear()
    }

    private fun userAnchorY(): Float {
        val scale = resources.displayMetrics.density
        val height = (40 * scale).roundToInt()
        val top = (3 * scale).roundToInt()
        return (top + height * 0.72f) / (height + top + scale.roundToInt())
    }
    private fun createUserLocationBitmap(): Bitmap {
        val scale = resources.displayMetrics.density
        val width = (30 * scale).toInt()
        val height = (40 * scale).toInt()
        val centerX = width / 2f
        val circleCenterY = 27 * scale
        val circleRadius = 10.5f * scale

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.argb(45, 0, 0, 0)
            style = Paint.Style.FILL
        }
        val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = 0xFFFF1956.toInt()
            style = Paint.Style.FILL
        }
        val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeJoin = Paint.Join.ROUND
            strokeCap = Paint.Cap.ROUND
            strokeWidth = 2.5f * scale
        }

        val arrowPath = Path().apply {
            moveTo(centerX, 3f * scale)
            lineTo(centerX - 9.5f * scale, 16.5f * scale)
            lineTo(centerX + 9.5f * scale, 16.5f * scale)
            close()
        }

        canvas.drawCircle(centerX, circleCenterY + scale, circleRadius + 2.5f * scale, shadowPaint)
        canvas.drawPath(arrowPath, strokePaint)
        canvas.drawPath(arrowPath, fillPaint)
        canvas.drawCircle(centerX, circleCenterY, circleRadius + 2.5f * scale, Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.FILL
        })
        canvas.drawCircle(centerX, circleCenterY, circleRadius, fillPaint)

        return withBitmapPadding(
            source = bitmap,
            topPaddingPx = (3f * scale).roundToInt(),
            bottomPaddingPx = scale.roundToInt(),
            sidePaddingPx = scale.roundToInt()
        )
    }

    private fun withBitmapPadding(
        source: Bitmap,
        topPaddingPx: Int = 0,
        bottomPaddingPx: Int = 0,
        sidePaddingPx: Int = 0
    ): Bitmap {
        if (topPaddingPx == 0 && bottomPaddingPx == 0 && sidePaddingPx == 0) {
            return source
        }

        val paddedBitmap = Bitmap.createBitmap(
            source.width + sidePaddingPx * 2,
            source.height + topPaddingPx + bottomPaddingPx,
            Bitmap.Config.ARGB_8888
        )
        val canvas = Canvas(paddedBitmap)
        canvas.drawBitmap(source, sidePaddingPx.toFloat(), topPaddingPx.toFloat(), null)
        return paddedBitmap
    }

}

private class NaverMapEvent(
    private val name: String,
    surfaceId: Int,
    viewId: Int,
    private val data: WritableMap,
) : Event<NaverMapEvent>(surfaceId, viewId) {
    override fun getEventName() = name
    override fun canCoalesce() = false
    override fun getEventData() = data
}
