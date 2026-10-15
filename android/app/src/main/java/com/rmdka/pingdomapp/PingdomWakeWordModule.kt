package com.rmdka.pingdomapp

import android.Manifest
import android.content.pm.PackageManager
import android.media.*
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.Process
import androidx.core.content.ContextCompat
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.common.LifecycleState
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.ViewManager
import com.k2fsa.sherpa.onnx.*
import org.json.JSONObject
import java.security.MessageDigest
import java.util.concurrent.Executors

/** Foreground-only PCM -> local KWS. No file recording, transcripts or network. */
class PingdomWakeWordModule(private val context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context), LifecycleEventListener {
    private val worker = Executors.newSingleThreadExecutor()
    private val audio = context.getSystemService(android.content.Context.AUDIO_SERVICE) as AudioManager
    @Volatile private var foreground = context.lifecycleState == LifecycleState.RESUMED
    @Volatile private var running = false
    @Volatile private var invalidated = false
    @Volatile private var interrupted = false
    @Volatile private var sessionId: String? = null
    private var spotter: KeywordSpotter? = null
    private var stream: OnlineStream? = null
    private var recorder: AudioRecord? = null
    private var capture: Thread? = null
    private var focus: AudioFocusRequest? = null
    private var verified = false
    private var recordingCallback: AudioManager.AudioRecordingCallback? = null
    private val main = Handler(Looper.getMainLooper())
    private val focusListener = AudioManager.OnAudioFocusChangeListener {
        if (it != AudioManager.AUDIOFOCUS_GAIN) interrupt()
    }

    init { context.addLifecycleEventListener(this) }
    override fun getName() = "PingdomWakeWord"
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}

    private fun emit(type: String, id: String, reason: String? = null) {
        if (invalidated || !context.hasActiveReactInstance()) return
        val value = Arguments.createMap().apply {
            putString("sessionId", id); putString("type", type)
            if (reason != null) putString("reason", reason)
            if (type == "detected") putString("keyword", "Hey_Pingdy")
        }
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("PingdomWakeWordEvent", value)
    }

    private fun verifyAssets() {
        if (verified) return
        val manifest = JSONObject(context.assets.open("$ASSETS/manifest.json").bufferedReader().use { it.readText() })
        check(manifest.getString("phrase") == PHRASE && manifest.getString("engineVersion") == "1.13.8")
        check(manifest.getString("modelId") == MODEL)
        val hashes = manifest.getJSONObject("files")
        for (name in listOf("encoder.onnx", "decoder.onnx", "joiner.onnx", "tokens.txt", "keywords.txt")) {
            val digest = MessageDigest.getInstance("SHA-256")
            context.assets.open("$ASSETS/$name").use { input ->
                val buffer = ByteArray(32768)
                while (true) { val size = input.read(buffer); if (size < 0) break; digest.update(buffer, 0, size) }
            }
            check(digest.digest().joinToString("") { "%02x".format(it) } == hashes.getString(name))
        }
        check(context.assets.open("$ASSETS/keywords.txt").bufferedReader().use { it.readText() }
            == "HH EY1 P IH1 NG D IY0 @Hey_Pingdy\n")
        verified = true
    }

    private fun newSpotter(): KeywordSpotter {
        verifyAssets()
        return KeywordSpotter(context.assets, KeywordSpotterConfig(
            featConfig = FeatureConfig(sampleRate = 16000, featureDim = 80),
            modelConfig = OnlineModelConfig(transducer = OnlineTransducerModelConfig(
                encoder = "$ASSETS/encoder.onnx", decoder = "$ASSETS/decoder.onnx", joiner = "$ASSETS/joiner.onnx"),
                tokens = "$ASSETS/tokens.txt", numThreads = 1, provider = "cpu", modelType = "zipformer2"),
            keywordsFile = "$ASSETS/keywords.txt", keywordsScore = 1.5f, keywordsThreshold = 0.25f,
            numTrailingBlanks = 2, maxActivePaths = 4))
    }

    @ReactMethod fun getStatus(promise: Promise) = worker.execute {
        try {
            // Readiness means actual model/JNI construction, not merely a package name.
            if (spotter == null) {
                val probe = newSpotter()
                try {
                    val input = probe.createStream()
                    try {
                        input.acceptWaveform(FloatArray(8000), 16000)
                        while (probe.isReady(input)) probe.decode(input)
                        check(probe.getResult(input).keyword.isEmpty())
                    } finally { input.release() }
                } finally { probe.release() }
            }
            promise.resolve(Arguments.createMap().apply {
                putBoolean("ready", !invalidated); putString("phrase", PHRASE)
                putString("modelId", MODEL); putString("engineVersion", "1.13.8")
            })
        } catch (_: Throwable) { promise.resolve(Arguments.createMap().apply { putBoolean("ready", false) }) }
    }

    private fun audioAvailable(): Boolean {
        if (audio.mode != AudioManager.MODE_NORMAL || audio.isMicrophoneMute) return false
        if (Build.VERSION.SDK_INT >= 24 && audio.activeRecordingConfigurations.isNotEmpty()) return false
        return true
    }

    @ReactMethod fun isAudioAvailable(promise: Promise) {
        try { promise.resolve(foreground && !running && audioAvailable()) }
        catch (_: Throwable) { promise.resolve(false) }
    }

    @ReactMethod fun initialize(id: String, phrase: String, promise: Promise) = worker.execute {
        try {
            check(!invalidated && phrase == PHRASE && sessionId == null)
            spotter = newSpotter()
            stream = spotter!!.createStream()
            sessionId = id
            interrupted = false
            promise.resolve(null)
        } catch (_: Throwable) {
            if (sessionId == null) { stream?.release(); stream = null; spotter?.release(); spotter = null }
            promise.reject("WAKE_WORD_ENGINE", "Local keyword model initialization failed")
        }
    }

    @ReactMethod fun start(id: String, promise: Promise) = worker.execute {
        try {
            check(!invalidated && !interrupted && foreground && sessionId == id && !running && audioAvailable())
            check(ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED)
            val attributes = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANT)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build()
            val granted = if (Build.VERSION.SDK_INT >= 26) {
                val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
                    .setAudioAttributes(attributes).setOnAudioFocusChangeListener(focusListener, main).build()
                focus = request; audio.requestAudioFocus(request)
            } else {
                @Suppress("DEPRECATION")
                audio.requestAudioFocus(focusListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
            }
            check(granted == AudioManager.AUDIOFOCUS_REQUEST_GRANTED)
            val minimum = AudioRecord.getMinBufferSize(16000, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
            check(minimum > 0)
            val owned = AudioRecord.Builder().setAudioSource(MediaRecorder.AudioSource.VOICE_RECOGNITION)
                .setAudioFormat(AudioFormat.Builder().setSampleRate(16000).setChannelMask(AudioFormat.CHANNEL_IN_MONO)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT).build())
                .setBufferSizeInBytes(maxOf(minimum * 2, 8192)).build()
            recorder = owned
            check(owned.state == AudioRecord.STATE_INITIALIZED)
            if (Build.VERSION.SDK_INT >= 24) {
                val callback = object : AudioManager.AudioRecordingCallback() {
                    override fun onRecordingConfigChanged(configs: MutableList<AudioRecordingConfiguration>) {
                        if (!running) return
                        if (configs.any { it.clientAudioSessionId != owned.audioSessionId
                            || (Build.VERSION.SDK_INT >= 29 && it.isClientSilenced) }) interrupt()
                    }
                }
                recordingCallback = callback; audio.registerAudioRecordingCallback(callback, main)
            }
            owned.startRecording()
            check(owned.recordingState == AudioRecord.RECORDSTATE_RECORDING && foreground && !interrupted)
            running = true
            val kws = checkNotNull(spotter); val input = checkNotNull(stream)
            capture = Thread({
                Process.setThreadPriority(Process.THREAD_PRIORITY_AUDIO)
                val pcm = ShortArray(1024)
                try {
                    while (running && !interrupted) {
                        val count = owned.read(pcm, 0, pcm.size, AudioRecord.READ_BLOCKING)
                        if (!running || interrupted) break
                        check(count > 0)
                        input.acceptWaveform(FloatArray(count) { pcm[it] / 32768f }, 16000)
                        while (running && kws.isReady(input)) {
                            kws.decode(input)
                            if (kws.getResult(input).keyword == "Hey_Pingdy") {
                                running = false
                                if (foreground && !interrupted) emit("detected", id)
                                break
                            }
                        }
                    }
                } catch (_: Throwable) { if (running) interrupt("engine") }
            }, "PingdomWakeWordPCM").also { it.start() }
            promise.resolve(null)
        } catch (_: Throwable) {
            try { stopCapture() } catch (_: Throwable) { /* Caller teardown retries and fails closed. */ }
            promise.reject("WAKE_WORD_AUDIO", "Microphone or audio focus unavailable")
        }
    }

    private fun stopCapture() {
        running = false
        recorder?.let { if (it.recordingState == AudioRecord.RECORDSTATE_RECORDING) it.stop() }
        capture?.join(2000)
        check(capture?.isAlive != true) // Never free a model while inference still owns it.
        capture = null
        recorder?.release(); recorder = null
        recordingCallback?.let { audio.unregisterAudioRecordingCallback(it) }; recordingCallback = null
        if (Build.VERSION.SDK_INT >= 26) focus?.let { audio.abandonAudioFocusRequest(it) }
        else { @Suppress("DEPRECATION") audio.abandonAudioFocus(focusListener) }
        focus = null
    }

    private fun release() {
        stopCapture()
        stream?.release(); stream = null
        spotter?.release(); spotter = null
        sessionId = null
    }

    @ReactMethod fun stop(id: String, promise: Promise) {
        if (sessionId == id) running = false
        worker.execute {
            try { if (sessionId == id) stopCapture(); promise.resolve(null) }
            catch (_: Throwable) { promise.reject("WAKE_WORD_RELEASE", "Microphone release failed") }
        }
    }
    @ReactMethod fun dispose(id: String, promise: Promise) = worker.execute {
        try { if (sessionId == id) release(); promise.resolve(null) }
        catch (_: Throwable) { promise.reject("WAKE_WORD_RELEASE", "Keyword engine release failed") }
    }

    private fun interrupt(reason: String = "interrupted") {
        val id = sessionId ?: return
        interrupted = true
        running = false
        worker.execute {
            if (sessionId != id) return@execute
            try { release(); emit("error", id, reason) }
            catch (_: Throwable) { emit("error", id, "release") }
        }
    }
    override fun onHostResume() { foreground = true }
    override fun onHostPause() { foreground = false; interrupt() }
    override fun onHostDestroy() { foreground = false; interrupt() }
    override fun invalidate() {
        invalidated = true; foreground = false; running = false
        context.removeLifecycleEventListener(this)
        worker.execute { try { release() } finally { worker.shutdown() } }
        super.invalidate()
    }
    companion object {
        private const val ASSETS = "pingdom-wake-word"
        private const val PHRASE = "Hey Pingdy"
        private const val MODEL = "sherpa-onnx-kws-zipformer-zh-en-3M-2025-12-20"
    }
}

class PingdomWakeWordPackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(PingdomWakeWordModule(context))
    override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
