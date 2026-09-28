package com.rmdka.pingdomapp

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.PixelCopy
import android.view.SurfaceView
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.common.LifecycleState
import com.facebook.react.uimanager.ThemedReactContext
import com.kakao.vectormap.MapView as KakaoSdkMapView
import com.naver.maps.map.MapView as NaverSdkMapView
import kotlin.math.max
import kotlin.math.roundToInt

/**
 * Supplies ordinary View pixels to Expo's BlurTargetView. Native maps render into a
 * SurfaceView, which Android view snapshots cannot otherwise capture.
 *
 * Mount one full-size instance behind the real map and share its BlurTargetView
 * across the glass surfaces. Only the map surface is copied, never app chrome.
 */
class MapGlassBackdropView(
    private val reactContext: ThemedReactContext,
) : View(reactContext), LifecycleEventListener {
    companion object {
        private const val FRAME_INTERVAL_MS = 100L
        private const val SOURCE_RETRY_INTERVAL_MS = 250L
        private const val DOWNSAMPLE_FACTOR = 4f
        private const val MAX_BITMAP_EDGE = 512f
    }

    private val captureHandler = Handler(Looper.getMainLooper())
    private val bitmapPaint = Paint(Paint.FILTER_BITMAP_FLAG)
    private val frameBounds = RectF()
    private val surfaceLocation = IntArray(2)
    private val backdropLocation = IntArray(2)
    private var sourceSurface: SurfaceView? = null
    private var frame: Bitmap? = null
    private var captureEnabled = true
    private var hostResumed = false
    private var capturePending = false
    private var captureGeneration = 0
    private var lastCaptureStartedAt = 0L

    private val captureTick = Runnable { captureFrame() }

    init {
        importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
        isClickable = false
        isFocusable = false
        setWillNotDraw(false)
    }

    fun setCaptureEnabled(enabled: Boolean) {
        captureEnabled = enabled
        updateCaptureState()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        hostResumed = reactContext.reactApplicationContext.lifecycleState == LifecycleState.RESUMED
        reactContext.addLifecycleEventListener(this)
        updateCaptureState()
    }

    override fun onDetachedFromWindow() {
        reactContext.removeLifecycleEventListener(this)
        stopCapture()
        super.onDetachedFromWindow()
    }

    override fun onWindowVisibilityChanged(visibility: Int) {
        super.onWindowVisibilityChanged(visibility)
        // View's constructor can invoke visibility callbacks before our fields exist.
        if (isAttachedToWindow) updateCaptureState()
    }

    override fun onVisibilityChanged(changedView: View, visibility: Int) {
        super.onVisibilityChanged(changedView, visibility)
        if (isAttachedToWindow) updateCaptureState()
    }

    override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
        super.onSizeChanged(width, height, oldWidth, oldHeight)
        stopCapture()
        updateCaptureState()
    }

    override fun onHostResume() {
        hostResumed = true
        updateCaptureState()
    }

    override fun onHostPause() {
        hostResumed = false
        stopCapture()
    }

    override fun onHostDestroy() {
        hostResumed = false
        stopCapture()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val bitmap = frame ?: return
        val surface = sourceSurface ?: return
        surface.getLocationOnScreen(surfaceLocation)
        getLocationOnScreen(backdropLocation)
        val left = (surfaceLocation[0] - backdropLocation[0]).toFloat()
        val top = (surfaceLocation[1] - backdropLocation[1]).toFloat()
        frameBounds.set(left, top, left + surface.width, top + surface.height)
        canvas.drawBitmap(bitmap, null, frameBounds, bitmapPaint)
    }

    private fun shouldCapture(): Boolean =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.N &&
            captureEnabled && hostResumed && isAttachedToWindow &&
            windowVisibility == VISIBLE && isShown && width > 0 && height > 0

    private fun updateCaptureState() {
        if (shouldCapture()) {
            scheduleCapture(0L)
        } else {
            stopCapture()
        }
    }

    private fun stopCapture() {
        captureGeneration += 1
        captureHandler.removeCallbacks(captureTick)
        sourceSurface = null
        // Published bitmaps can still be referenced by the render thread. Let
        // Android release them; never recycle or reuse them for a later copy.
        frame = null
        invalidate()
    }

    private fun scheduleCapture(delayMillis: Long) {
        captureHandler.removeCallbacks(captureTick)
        if (shouldCapture() && !capturePending) {
            captureHandler.postDelayed(captureTick, delayMillis)
        }
    }

    private fun captureFrame() {
        if (!shouldCapture() || capturePending) return
        val remainingDelay = FRAME_INTERVAL_MS - (SystemClock.uptimeMillis() - lastCaptureStartedAt)
        if (remainingDelay > 0) {
            scheduleCapture(remainingDelay)
            return
        }

        val surface = sourceSurface?.takeIf(::isUsableSurface) ?: findNearbyMapSurface()
        if (surface == null) {
            sourceSurface = null
            frame = null
            invalidate()
            scheduleCapture(SOURCE_RETRY_INTERVAL_MS)
            return
        }
        sourceSurface = surface

        // PixelCopy scales into this bitmap. Bound both resolution and request
        // frequency so all pills together cost at most one small copy per frame.
        val scale = max(DOWNSAMPLE_FACTOR, max(surface.width, surface.height) / MAX_BITMAP_EDGE)
        val bitmap = Bitmap.createBitmap(
            max(1, (surface.width / scale).roundToInt()),
            max(1, (surface.height / scale).roundToInt()),
            Bitmap.Config.ARGB_8888,
        )
        val generation = captureGeneration
        capturePending = true
        lastCaptureStartedAt = SystemClock.uptimeMillis()

        try {
            PixelCopy.request(surface, bitmap, { result ->
                capturePending = false
                if (result == PixelCopy.SUCCESS && generation == captureGeneration && shouldCapture()) {
                    if (frame?.sameAs(bitmap) == true) {
                        // A stationary map must not upload identical pixels and
                        // rerun every glass RenderEffect ten times per second.
                        bitmap.recycle()
                    } else {
                        frame = bitmap
                        invalidate()
                    }
                } else {
                    // This bitmap has never been drawn and PixelCopy has finished.
                    bitmap.recycle()
                    if (generation == captureGeneration && result != PixelCopy.SUCCESS) {
                        sourceSurface = null
                        frame = null
                        invalidate()
                    }
                }
                scheduleCapture(max(0L, FRAME_INTERVAL_MS - (SystemClock.uptimeMillis() - lastCaptureStartedAt)))
            }, captureHandler)
        } catch (_: IllegalArgumentException) {
            // The SDK may destroy its Surface between validation and the request.
            capturePending = false
            bitmap.recycle()
            sourceSurface = null
            frame = null
            invalidate()
            scheduleCapture(SOURCE_RETRY_INTERVAL_MS)
        }
    }

    private fun isUsableSurface(surface: SurfaceView): Boolean =
        surface.isAttachedToWindow && surface.isShown && surface.width > 0 &&
            surface.height > 0 && surface.holder.surface.isValid

    private fun findNearbyMapSurface(): SurfaceView? {
        // Search the nearest common ancestor first so a retained navigation
        // screen cannot supply the backdrop for another screen's map.
        var ancestor = parent
        while (ancestor is ViewGroup) {
            findMapSurface(ancestor)?.let { return it }
            ancestor = ancestor.parent
        }
        return null
    }

    private fun findMapSurface(view: View): SurfaceView? {
        if (view is KakaoSdkMapView && view.isShown) {
            return view.surfaceView?.takeIf(::isUsableSurface)
        }
        if (view is NaverSdkMapView && view.isShown) {
            return findSurface(view)
        }
        if (view is ViewGroup && view.visibility == VISIBLE) {
            for (index in 0 until view.childCount) {
                findMapSurface(view.getChildAt(index))?.let { return it }
            }
        }
        return null
    }
    private fun findSurface(view: View): SurfaceView? {
        if (view is SurfaceView && isUsableSurface(view)) return view
        if (view is ViewGroup && view.visibility == VISIBLE) {
            for (index in 0 until view.childCount) {
                findSurface(view.getChildAt(index))?.let { return it }
            }
        }
        return null
    }

}
