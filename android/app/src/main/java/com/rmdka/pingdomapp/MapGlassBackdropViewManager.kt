package com.rmdka.pingdomapp

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class MapGlassBackdropViewManager : SimpleViewManager<MapGlassBackdropView>() {
    override fun getName(): String = "MapGlassBackdropView"

    override fun createViewInstance(reactContext: ThemedReactContext): MapGlassBackdropView =
        MapGlassBackdropView(reactContext)

    @ReactProp(name = "captureEnabled", defaultBoolean = true)
    fun setCaptureEnabled(view: MapGlassBackdropView, enabled: Boolean) {
        view.setCaptureEnabled(enabled)
    }
}
