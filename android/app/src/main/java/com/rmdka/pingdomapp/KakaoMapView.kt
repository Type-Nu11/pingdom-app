// android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapView.kt
package com.rmdka.pingdomapp

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.graphics.RectF
import android.util.Log
import android.widget.FrameLayout
import android.widget.Toast
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.kakao.vectormap.KakaoMap
import com.kakao.vectormap.KakaoMapReadyCallback
import com.kakao.vectormap.LatLng
import com.kakao.vectormap.MapLifeCycleCallback
import com.kakao.vectormap.MapView
import com.kakao.vectormap.camera.CameraAnimation
import com.kakao.vectormap.camera.CameraUpdateFactory
import com.kakao.vectormap.label.CompetitionType
import com.kakao.vectormap.label.CompetitionUnit
import com.kakao.vectormap.label.LabelManager
import com.kakao.vectormap.label.LabelLayer
import com.kakao.vectormap.label.LabelLayerOptions
import com.kakao.vectormap.label.LabelOptions
import com.kakao.vectormap.label.LabelStyle
import com.kakao.vectormap.label.LabelStyles
import com.kakao.vectormap.label.OrderingType
import kotlin.math.roundToInt

private data class MapMarker(
    val id: String,
    val category: String,
    val lat: Double,
    val lng: Double,
    val markerType: String
)

private data class PlaceMarkerBitmapSpec(
    val bitmap: Bitmap,
    val anchorX: Float,
    val anchorY: Float
)

class KakaoMapView(
    private val reactContext: ThemedReactContext
    ) : FrameLayout(reactContext), LifecycleEventListener {
    companion object {
        private const val TAG = "KakaoMapView"
        private const val MARKER_LAYER_ID = "pingdom_markers"
        private const val MARKER_STYLE_ID_PREFIX = "pingdom_hot_marker_style"
        private const val USER_LOCATION_STYLE_ID = "pingdom_user_location_style"
        private const val USER_LOCATION_LABEL_ID = "pingdom_user_location_label"
        private const val MARKER_LAYER_Z_ORDER = 10
        private const val USER_LOCATION_COLOR = 0xFFFF1956.toInt()
        private const val PLACE_MARKER_ANCHOR_X = 0.5f
        private const val PLACE_MARKER_SIDE_SAFE_PADDING_PX = 12
        private const val NORMAL_MARKER_BOTTOM_SAFE_PADDING_PX = 20
        private const val HOT_MARKER_BOTTOM_SAFE_PADDING_PX = 20
    }

    private val mapView = MapView(reactContext)
    private var userLat: Double? = null
    private var userLng: Double? = null
    private var followUser: Boolean = true
    private var centerLat: Double? = null
    private var centerLng: Double? = null
    private var zoomLevel: Int = 7
    private var kakaoMap: KakaoMap? = null
    private var markerLayer: LabelLayer? = null
    private var markers: List<MapMarker> = emptyList()
    private var lastAppliedCamera: Triple<Double, Double, Int>? = null

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
                this@KakaoMapView.kakaoMap = kakaoMap
                kakaoMap.setOnCameraMoveEndListener { _, cameraPosition, _ ->
                    val position = cameraPosition.position
                    emitCameraIdle(position.latitude, position.longitude)
                }
                kakaoMap.setOnLabelClickListener { _, _, label ->
                    val markerId = label.tag as? String ?: return@setOnLabelClickListener false
                    emitMarkerPress(markerId)
                    true
                }
                kakaoMap.setOnMapClickListener { map, _, point, poi ->
                    if (poi?.layerId == MARKER_LAYER_ID && poi.poiId.isNotBlank()) {
                        emitMarkerPress(poi.poiId)
                        return@setOnMapClickListener
                    }

                    emitNearestMarkerPress(map, point)
                }
                kakaoMap.setOnTerrainClickListener { map, _, point ->
                    emitNearestMarkerPress(map, point)
                }
                Log.d(TAG, "onMapReady: Kakao map is ready")
                Toast.makeText(reactContext, "KakaoMap ready", Toast.LENGTH_SHORT).show()
                applyCameraIfReady()
                updateUserLocationIfReady()
                updateMarkersIfReady()
            }
        }
        )
    }

    fun setCenterLat(value: Double) {
        centerLat = value
        applyCameraIfReady()
    }

    fun setCenterLng(value: Double) {
        centerLng = value
        applyCameraIfReady()
    }

    fun setZoomLevel(value: Int) {
        zoomLevel = value
        applyCameraIfReady()
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

    private fun applyCameraIfReady() {
        val map = kakaoMap ?: return
        val lat = centerLat ?: return
        val lng = centerLng ?: return
        val nextCamera = Triple(lat, lng, zoomLevel)

        if (lastAppliedCamera == nextCamera) {
            return
        }

        lastAppliedCamera = nextCamera
        val target = LatLng.from(lat, lng)
        val update = CameraUpdateFactory.newCenterPosition(target, zoomLevel)
        map.moveCamera(update, CameraAnimation.from(300))
    }

    private fun emitCameraIdle(lat: Double, lng: Double) {
        val viewId = id
        if (viewId == NO_ID) {
            Log.w(TAG, "emitCameraIdle skipped: view id is not assigned")
            return
        }

        val event = Arguments.createMap().apply {
            putDouble("lat", lat)
            putDouble("lng", lng)
        }

        UIManagerHelper
            .getEventDispatcherForReactTag(reactContext, viewId)
            ?.dispatchEvent(CameraIdleEvent(UIManagerHelper.getSurfaceId(this), viewId, event))
    }

    private fun emitMarkerPress(markerId: String) {
        val viewId = id
        if (viewId == NO_ID) {
            Log.w(TAG, "emitMarkerPress skipped: view id is not assigned")
            return
        }

        val event = Arguments.createMap().apply {
            putString("markerId", markerId)
        }

        UIManagerHelper
            .getEventDispatcherForReactTag(reactContext, viewId)
            ?.dispatchEvent(MapDirectEvent("topMarkerPress", UIManagerHelper.getSurfaceId(this), viewId, event))
    }

    private fun emitNearestMarkerPress(map: KakaoMap, point: PointF) {
        val markerId = findNearestMarkerId(map, point) ?: return
        emitMarkerPress(markerId)
    }

    private fun findNearestMarkerId(map: KakaoMap, point: PointF): String? {
        val clickTolerance = 54f * resources.displayMetrics.density
        var nearestMarkerId: String? = null
        var nearestDistance = Float.MAX_VALUE

        markers.forEach { marker ->
            val markerPoint = map.toScreenPoint(LatLng.from(marker.lat, marker.lng)) ?: return@forEach
            val dx = markerPoint.x - point.x
            val dy = markerPoint.y - point.y
            val distance = kotlin.math.sqrt(dx * dx + dy * dy)

            if (distance <= clickTolerance && distance < nearestDistance) {
                nearestMarkerId = marker.id
                nearestDistance = distance
            }
        }

        return nearestMarkerId
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
                        category = normalizeMarkerCategory(
                            if (marker.hasKey("category")) marker.getString("category") else null
                        ),
                        lat = marker.getDouble("lat"),
                        lng = marker.getDouble("lng"),
                        markerType = normalizeMarkerType(
                            if (marker.hasKey("markerType")) marker.getString("markerType") else null
                        )
                    )
                )
            }
        }
    }

    private fun updateMarkersIfReady() {
        val map = kakaoMap ?: return
        val manager = map.labelManager ?: return
        val layer = getMarkerLayer(manager) ?: return

        layer.removeAll()
        addPlaceMarkerLabels(layer, manager)
        addUserLocationLabelIfReady(layer, manager)
    }

    private fun getMarkerLayer(manager: LabelManager): LabelLayer? {
        val layer = markerLayer
            ?: manager.getLayer(MARKER_LAYER_ID)
            ?: manager.addLayer(
                LabelLayerOptions.from(MARKER_LAYER_ID)
                    .setCompetitionType(CompetitionType.None)
                    .setCompetitionUnit(CompetitionUnit.IconFirst)
                    .setOrderingType(OrderingType.Rank)
                    .setZOrder(MARKER_LAYER_Z_ORDER)
                    .setClickable(true)
            )

        layer?.setClickable(true)
        markerLayer = layer
        return layer
    }

    private fun addPlaceMarkerLabels(layer: LabelLayer, manager: LabelManager) {
        markers.forEach { marker ->
            val styles = getPlaceMarkerStyles(manager, marker.category, marker.markerType) ?: return@forEach
            val label = layer.addLabel(
                LabelOptions
                    .from(marker.id, LatLng.from(marker.lat, marker.lng))
                    .setStyles(styles)
                    .setClickable(true)
                    .setTag(marker.id)
            )
            label?.setClickable(true)
            label?.setTag(marker.id)
        }
    }

    private fun getPlaceMarkerStyles(manager: LabelManager, category: String, markerType: String): LabelStyles? {
        val styleID = "${MARKER_STYLE_ID_PREFIX}_${markerType}_$category"
        val cachedStyles = manager.getLabelStyles(styleID)
        if (cachedStyles != null) {
            return cachedStyles
        }

        val markerBitmapSpec = createPlaceMarkerBitmapSpec(category, markerType)

        Log.d(
            TAG,
            "placeMarker style=$styleID type=$markerType size=${markerBitmapSpec.bitmap.width}x${markerBitmapSpec.bitmap.height} anchor=(${markerBitmapSpec.anchorX},${markerBitmapSpec.anchorY})"
        )

        return manager.addLabelStyles(
            LabelStyles.from(
                styleID,
                LabelStyle
                    .from(markerBitmapSpec.bitmap)
                    .setAnchorPoint(PointF(markerBitmapSpec.anchorX, markerBitmapSpec.anchorY))
                    .setApplyDpScale(false)
            )
        )
    }

    private fun normalizeMarkerCategory(value: String?): String {
        return when (value) {
            "fashion", "food", "game", "music" -> value
            else -> "music"
        }
    }

    private fun normalizeMarkerType(value: String?): String {
        return when (value) {
            "default", "hot" -> value
            else -> "default"
        }
    }

    private fun createPlaceMarkerBitmapSpec(category: String, markerType: String): PlaceMarkerBitmapSpec {
        val resourceName = "map_marker_${markerType}_$category"
        val resourceId = resources.getIdentifier(resourceName, "drawable", reactContext.packageName)
        val sourceBitmap = if (resourceId != 0) BitmapFactory.decodeResource(resources, resourceId) else null
        val originalBitmap = if (sourceBitmap != null) {
            sourceBitmap
        } else {
            val fallbackBitmap =
                if (markerType == "hot") createHotMarkerBitmap(category) else createDefaultMarkerBitmap(category)
            fallbackBitmap
        }
        val bottomSafePaddingPx =
            if (markerType == "hot") HOT_MARKER_BOTTOM_SAFE_PADDING_PX else NORMAL_MARKER_BOTTOM_SAFE_PADDING_PX
        val canvasBitmap = createMarkerCanvasBitmap(
            source = originalBitmap,
            sideSafePaddingPx = PLACE_MARKER_SIDE_SAFE_PADDING_PX,
            bottomSafePaddingPx = bottomSafePaddingPx
        )
        val anchorY = originalBitmap.height / canvasBitmap.height.toFloat()
        
        if (originalBitmap != canvasBitmap) {
            originalBitmap.recycle()
        }
        Log.d(
            TAG,
            "placeMarkerBitmap type=$markerType originalSize=${originalBitmap.width}x${originalBitmap.height} canvasSize=${canvasBitmap.width}x${canvasBitmap.height} anchorY=$anchorY"
        )

        return PlaceMarkerBitmapSpec(
            bitmap = canvasBitmap,
            anchorX = PLACE_MARKER_ANCHOR_X,
            anchorY = anchorY
        )
    }

    private fun createMarkerCanvasBitmap(
        source: Bitmap,
        sideSafePaddingPx: Int,
        bottomSafePaddingPx: Int
    ): Bitmap {
        val canvasWidth = source.width + sideSafePaddingPx * 2
        val canvasHeight = source.height + bottomSafePaddingPx
        val canvasBitmap = Bitmap.createBitmap(canvasWidth, canvasHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(canvasBitmap)
        val left = ((canvasWidth - source.width) / 2f)
        canvas.drawBitmap(source, left, 0f, null)
        return canvasBitmap
    }

    private fun createDefaultMarkerBitmap(category: String): Bitmap {
        val scale = resources.displayMetrics.density
        val width = (32 * scale).toInt()
        val height = (37 * scale).toInt()

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.scale(scale, scale)

        val markerPath = Path().apply {
            moveTo(5.3937f, 5.3278f)
            cubicTo(8.2067f, 2.5567f, 12.022f, 1f, 16.0002f, 1f)
            cubicTo(19.9784f, 1f, 23.7936f, 2.5567f, 26.6066f, 5.3278f)
            cubicTo(29.4197f, 8.0988f, 31f, 11.8571f, 31f, 15.7759f)
            cubicTo(31f, 19.6947f, 29.4197f, 23.453f, 26.6066f, 26.224f)
            lineTo(16.0002f, 35f)
            lineTo(5.3937f, 26.224f)
            cubicTo(4.0007f, 24.852f, 2.8958f, 23.2231f, 2.1419f, 21.4304f)
            cubicTo(1.388f, 19.6377f, 1f, 17.7163f, 1f, 15.7759f)
            cubicTo(1f, 13.8355f, 1.388f, 11.914f, 2.1419f, 10.1213f)
            cubicTo(2.8958f, 8.3286f, 4.0007f, 6.6998f, 5.3937f, 5.3278f)
            close()
        }
        val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = 0xFFFF4A75.toInt()
            style = Paint.Style.FILL
        }
        val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.rgb(246, 246, 247)
            style = Paint.Style.STROKE
            strokeJoin = Paint.Join.ROUND
            strokeWidth = 2f
        }

        canvas.drawPath(markerPath, fillPaint)
        canvas.drawPath(markerPath, strokePaint)
        canvas.save()
        canvas.translate(16f, 15.5f)
        canvas.scale(0.66f, 0.66f)
        drawPlaceMarkerIcon(canvas, category)
        canvas.restore()

        return bitmap
    }

    private fun createHotMarkerBitmap(category: String): Bitmap {
        val scale = resources.displayMetrics.density
        val width = (59 * scale).toInt()
        val height = (81 * scale).toInt()

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        canvas.scale(scale, scale)

        val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = USER_LOCATION_COLOR
            style = Paint.Style.FILL
        }
        val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.rgb(246, 246, 247)
            style = Paint.Style.STROKE
            strokeJoin = Paint.Join.ROUND
            strokeCap = Paint.Cap.ROUND
            strokeWidth = 2f
        }
        val markerPath = createHotMarkerPath()

        drawHotMarkerShadow(canvas, markerPath)
        canvas.drawPath(markerPath, fillPaint)
        canvas.drawPath(markerPath, strokePaint)
        canvas.save()
        canvas.translate(29.5f, 28f)
        canvas.scale(1.02f, 1.02f)
        drawPlaceMarkerIcon(canvas, category)
        canvas.restore()

        return bitmap
    }

    private fun drawHotMarkerShadow(canvas: Canvas, markerPath: Path) {
        val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.argb(14, 255, 25, 86)
            style = Paint.Style.FILL
        }

        listOf(
            1f to 0.10f,
            6f to 0.09f,
            12f to 0.05f,
            22f to 0.01f,
        ).forEach { (offsetY, alpha) ->
            shadowPaint.alpha = (255 * alpha).toInt()
            canvas.save()
            canvas.translate(0f, offsetY)
            canvas.drawPath(markerPath, shadowPaint)
            canvas.restore()
        }
    }

    private fun createHotMarkerPath(): Path {
        return Path().apply {
            moveTo(20.3071f, 3f)
            cubicTo(20.9178f, 3.01f, 21.5119f, 3.1895f, 22.0249f, 3.5147f)
            lineTo(22.2397f, 3.6621f)
            lineTo(22.2749f, 3.6895f)
            cubicTo(22.4121f, 3.7859f, 22.5504f, 3.8808f, 22.6899f, 3.9736f)
            lineTo(23.1704f, 4.2832f)
            lineTo(23.1821f, 4.291f)
            cubicTo(24.9371f, 5.4211f, 28.3342f, 7.6003f, 31.0952f, 10.9512f)
            cubicTo(32.3707f, 12.4976f, 32.3489f, 12.4709f, 32.6538f, 12.7979f)
            cubicTo(32.957f, 13.1229f, 33.5195f, 13.7283f, 35.4683f, 15.9434f)
            cubicTo(36.1481f, 15.1914f, 36.886f, 14.6046f, 37.5435f, 14.1797f)
            cubicTo(38.0061f, 13.8807f, 38.4418f, 13.6519f, 38.8062f, 13.4971f)
            cubicTo(38.9874f, 13.4201f, 39.164f, 13.3563f, 39.3257f, 13.3115f)
            cubicTo(39.4529f, 13.2763f, 39.686f, 13.2183f, 39.9321f, 13.2422f)
            cubicTo(40.4551f, 13.2932f, 40.9574f, 13.4685f, 41.3979f, 13.751f)
            lineTo(41.5835f, 13.8779f)
            lineTo(41.5845f, 13.8789f)
            cubicTo(43.939f, 15.6292f, 46.576f, 19.4564f, 47.9692f, 23.8789f)
            lineTo(48.1001f, 24.3086f)
            cubicTo(49.42f, 28.7852f, 49.6116f, 34.3637f, 46.5171f, 39.6045f)
            lineTo(46.5112f, 39.6143f)
            lineTo(46.5044f, 39.624f)
            cubicTo(44.6811f, 42.5517f, 42.132f, 44.9568f, 39.105f, 46.6055f)
            lineTo(39.105f, 46.6064f)
            cubicTo(36.1319f, 48.2226f, 32.792f, 49.0418f, 29.4097f, 48.9854f)
            cubicTo(26.4273f, 49.0999f, 23.464f, 48.4942f, 20.77f, 47.2207f)
            lineTo(20.2329f, 46.9561f)
            cubicTo(17.354f, 45.4813f, 14.9021f, 43.2902f, 13.1118f, 40.5938f)
            lineTo(13.1011f, 40.5781f)
            lineTo(13.0913f, 40.5625f)
            lineTo(13.022f, 40.4482f)
            lineTo(13.0171f, 40.4404f)
            lineTo(13.0122f, 40.4316f)
            cubicTo(5.6863f, 27.8864f, 13.869f, 16.3029f, 15.2427f, 14.417f)
            cubicTo(15.3204f, 14.3095f, 15.4046f, 14.2068f, 15.4946f, 14.1094f)
            lineTo(15.4976f, 14.1055f)
            cubicTo(16.3335f, 13.2098f, 16.9196f, 12.1096f, 17.1968f, 10.915f)
            lineTo(17.2456f, 10.6895f)
            cubicTo(17.4696f, 9.5549f, 17.4136f, 8.3815f, 17.0815f, 7.2715f)
            cubicTo(16.8807f, 6.6035f, 16.8953f, 5.8887f, 17.1235f, 5.2295f)
            cubicTo(17.3519f, 4.57f, 17.7824f, 3.999f, 18.354f, 3.5986f)
            cubicTo(18.9256f, 3.1982f, 19.6093f, 2.9886f, 20.3071f, 3f)
            close()
        }
    }

    private fun drawPlaceMarkerIcon(canvas: Canvas, category: String) {
        when (category) {
            "food" -> drawFoodIcon(canvas)
            "game" -> drawGameIcon(canvas)
            "fashion" -> drawFashionIcon(canvas)
            else -> drawMusicIcon(canvas)
        }
    }

    private fun drawMusicIcon(canvas: Canvas) {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textAlign = Paint.Align.CENTER
            textSize = 27f
            typeface = android.graphics.Typeface.DEFAULT_BOLD
        }
        canvas.drawText("♪", 0f, 8f, paint)
    }

    private fun drawFoodIcon(canvas: Canvas) {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
            strokeWidth = 2.5f
            style = Paint.Style.STROKE
        }

        canvas.drawLine(-7f, -10f, -7f, 10f, paint)
        canvas.drawLine(-11f, -10f, -11f, -1f, paint)
        canvas.drawLine(-7f, -10f, -7f, -1f, paint)
        canvas.drawLine(-3f, -10f, -3f, -1f, paint)
        canvas.drawLine(-11f, -1f, -3f, -1f, paint)

        val knifePath = Path().apply {
            moveTo(10f, -10f)
            cubicTo(5f, -6f, 5f, 0f, 9f, 2f)
            lineTo(9f, 10f)
        }
        canvas.drawPath(knifePath, paint)
    }

    private fun drawGameIcon(canvas: Canvas) {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
            strokeWidth = 2.5f
            style = Paint.Style.STROKE
        }
        canvas.drawRoundRect(RectF(-14f, -8f, 14f, 8f), 8f, 8f, paint)
        canvas.drawLine(-8f, -3f, -8f, 4f, paint)
        canvas.drawLine(-11.5f, 0.5f, -4.5f, 0.5f, paint)
        canvas.drawCircle(5.5f, -2f, 1.6f, paint)
        canvas.drawCircle(9.5f, 2.5f, 1.6f, paint)
    }

    private fun drawFashionIcon(canvas: Canvas) {
        val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
            strokeWidth = 2.6f
            style = Paint.Style.STROKE
        }
        val hangerPath = Path().apply {
            moveTo(0f, -11f)
            cubicTo(5f, -11f, 5f, -5f, 0f, -5f)
            lineTo(0f, -2f)
            lineTo(-14f, 8f)
            lineTo(14f, 8f)
            lineTo(0f, -2f)
        }
        canvas.drawPath(hangerPath, paint)
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

    private fun addUserLocationLabelIfReady(layer: LabelLayer, manager: LabelManager) {
        val lat = userLat ?: return
        val lng = userLng ?: return
        val styles = getUserLocationStyles(manager) ?: return

        layer.addLabel(
            LabelOptions
                .from(USER_LOCATION_LABEL_ID, LatLng.from(lat, lng))
                .setStyles(styles)
        )
    }

    private fun getUserLocationStyles(manager: LabelManager): LabelStyles? {
        val scale = resources.displayMetrics.density
        val topPaddingPx = (3f * scale).roundToInt()
        val bottomPaddingPx = scale.roundToInt()
        val anchorY = computePaddedAnchorY(
            rawHeightPx = (63 * scale).roundToInt(),
            rawAnchorY = 0.72f,
            topPaddingPx = topPaddingPx,
            bottomPaddingPx = bottomPaddingPx
        )

        return manager.getLabelStyles(USER_LOCATION_STYLE_ID)
            ?: manager.addLabelStyles(
                LabelStyles.from(
                    USER_LOCATION_STYLE_ID,
                    LabelStyle.from(createUserLocationBitmap())
                        .setAnchorPoint(PointF(0.5f, anchorY))
                        .setApplyDpScale(false)
                )
            )
    }

    private fun createUserLocationBitmap(): Bitmap {
        val scale = resources.displayMetrics.density
        val width = (48 * scale).toInt()
        val height = (63 * scale).toInt()
        val centerX = width / 2f
        val circleCenterY = 42 * scale
        val circleRadius = 16.5f * scale

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.argb(45, 0, 0, 0)
            style = Paint.Style.FILL
        }
        val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = USER_LOCATION_COLOR
            style = Paint.Style.FILL
        }
        val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeJoin = Paint.Join.ROUND
            strokeCap = Paint.Cap.ROUND
            strokeWidth = 4f * scale
        }

        val arrowPath = Path().apply {
            moveTo(centerX, 4.5f * scale)
            lineTo(centerX - 15.5f * scale, 25.5f * scale)
            lineTo(centerX + 15.5f * scale, 25.5f * scale)
            close()
        }

        canvas.drawCircle(centerX, circleCenterY + 1.5f * scale, circleRadius + 4 * scale, shadowPaint)
        canvas.drawPath(arrowPath, strokePaint)
        canvas.drawPath(arrowPath, fillPaint)
        canvas.drawCircle(centerX, circleCenterY, circleRadius + 4 * scale, Paint(Paint.ANTI_ALIAS_FLAG).apply {
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

    private fun computePaddedAnchorY(
        rawHeightPx: Int,
        rawAnchorY: Float,
        topPaddingPx: Int,
        bottomPaddingPx: Int
    ): Float {
        val paddedHeight = rawHeightPx + topPaddingPx + bottomPaddingPx
        return (topPaddingPx + rawHeightPx * rawAnchorY) / paddedHeight.toFloat()
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

private class CameraIdleEvent(
    surfaceId: Int,
    viewId: Int,
    private val eventData: WritableMap
) : Event<CameraIdleEvent>(surfaceId, viewId) {
    override fun getEventName(): String = "topCameraIdle"

    override fun canCoalesce(): Boolean = false

    override fun getEventData(): WritableMap = eventData
}

private class MapDirectEvent(
    private val name: String,
    surfaceId: Int,
    viewId: Int,
    private val eventData: WritableMap
) : Event<MapDirectEvent>(surfaceId, viewId) {
    override fun getEventName(): String = name

    override fun canCoalesce(): Boolean = false

    override fun getEventData(): WritableMap = eventData
}
