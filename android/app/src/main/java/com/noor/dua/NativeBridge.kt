package com.noor.dua

import android.Manifest
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.VibrationEffect
import android.os.Vibrator
import android.provider.MediaStore
import android.provider.Settings
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.core.view.WindowInsetsControllerCompat
import org.json.JSONObject
import java.io.File
import java.util.Locale

/**
 * The `window.NoorAndroid` bridge. Every method is safe to call from the
 * WebView's JavaScript thread, and no method throws into JavaScript.
 */
class NativeBridge(
    private val activity: MainActivity,
    private val webView: WebView,
) {

    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var arabicVoice = false
    private var released = false
    private var pendingSpeech: String? = null

    fun initialize() {
        if (released || tts != null) return
        tts = TextToSpeech(activity) { status -> onEngineReady(status) }
    }

    private fun onEngineReady(status: Int) {
        val engine = tts
        if (released) {
            runCatching { engine?.shutdown() }
            tts = null
            return
        }
        if (status != TextToSpeech.SUCCESS || engine == null) {
            Log.w(TAG, "TTS engine unavailable (status=$status)")
            markEngineMissing(engine)
            return
        }
        val language = engine.setLanguage(Locale("ar", "SA"))
        arabicVoice = language >= TextToSpeech.LANG_AVAILABLE
        Log.i(TAG, "TTS ready, setLanguage(ar-SA)=$language arabicVoice=$arabicVoice")
        if (!arabicVoice) {
            // Keep a usable default voice, but recitation stays disabled until an
            // Arabic voice is installed - an English voice would read Arabic as silence.
            engine.setLanguage(Locale.getDefault())
        }
        engine.setSpeechRate(0.85f)
        engine.setAudioAttributes(
            AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build(),
        )
        engine.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) = Unit
            override fun onDone(utteranceId: String?) = notifySpeechFinished()
            override fun onError(utteranceId: String?) = notifySpeechFinished()
        })
        ttsReady = true
        pendingSpeech?.let { queued ->
            pendingSpeech = null
            if (arabicVoice) speakNow(queued) else notifyTtsError()
        }
    }

    /** Drops a dead engine so the next tap can try again (a voice may be installed). */
    private fun markEngineMissing(engine: TextToSpeech?) {
        ttsReady = false
        pendingSpeech = null
        runCatching { engine?.shutdown() }
        tts = null
        notifyTtsError()
    }

    fun shutdown() {
        released = true
        pendingSpeech = null
        tts?.stop()
        tts?.shutdown()
        tts = null
        ttsReady = false
    }

    private fun speakNow(text: String) {
        activity.runOnUiThread {
            val engine = tts ?: return@runOnUiThread
            val result = engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, "noor-dua")
            if (result == TextToSpeech.ERROR) {
                Log.w(TAG, "TTS speak() failed")
                notifyTtsError()
            }
        }
    }

    private fun notifySpeechFinished() {
        webView.post {
            webView.evaluateJavascript("window.NoorTtsEnded && window.NoorTtsEnded()", null)
        }
    }

    private fun notifyTtsError() {
        webView.post {
            webView.evaluateJavascript("window.NoorTtsError && window.NoorTtsError()", null)
        }
    }

    // ---------------------------------------------------------------- core

    @JavascriptInterface
    fun platform(): String = "android"

    @Suppress("DEPRECATION")
    @JavascriptInterface
    fun setTheme(theme: String) {
        activity.runOnUiThread {
            val light = theme == "light"
            activity.setContentBackground(light)
            activity.window.statusBarColor = Color.TRANSPARENT
            activity.window.navigationBarColor = Color.TRANSPARENT
            val controller = WindowInsetsControllerCompat(activity.window, activity.window.decorView)
            controller.isAppearanceLightStatusBars = light
            controller.isAppearanceLightNavigationBars = light
        }
    }

    @JavascriptInterface
    fun vibrate(milliseconds: Int) {
        val vibrator = activity.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return
        val duration = milliseconds.coerceIn(1, 400).toLong()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(duration)
        }
    }

    // --------------------------------------------------------------- share

    @JavascriptInterface
    fun share(text: String): Boolean {
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        activity.runOnUiThread {
            runCatching {
                activity.startActivity(
                    Intent.createChooser(send, activity.getString(R.string.share_via)),
                )
            }
        }
        return true
    }

    // -------------------------------------------------------------- backup

    @JavascriptInterface
    fun saveFile(name: String, content: String): Boolean {
        val safeName = name.replace(Regex("[^A-Za-z0-9._-]"), "_").ifBlank { "noor-backup.json" }
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                saveToDownloads(safeName, content)
            } else {
                val directory = File(activity.getExternalFilesDir(null), "exports").apply { mkdirs() }
                File(directory, safeName).writeText(content)
                true
            }
            activity.runOnUiThread {
                Toast.makeText(
                    activity,
                    activity.getString(R.string.saved_to_downloads),
                    Toast.LENGTH_SHORT,
                ).show()
            }
            true
        } catch (error: Exception) {
            false
        }
    }

    @androidx.annotation.RequiresApi(Build.VERSION_CODES.Q)
    private fun saveToDownloads(name: String, content: String): Boolean {
        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, name)
            put(MediaStore.Downloads.MIME_TYPE, "application/json")
            put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Noor")
            put(MediaStore.Downloads.IS_PENDING, 1)
        }
        val resolver = activity.contentResolver
        val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: return false
        resolver.openOutputStream(uri)?.use { stream ->
            stream.write(content.toByteArray(Charsets.UTF_8))
        }
        values.clear()
        values.put(MediaStore.Downloads.IS_PENDING, 0)
        resolver.update(uri, values, null, null)
        return true
    }

    // ----------------------------------------------------------- reminders

    @JavascriptInterface
    fun scheduleReminders(payload: String): Boolean = try {
        val json = JSONObject(payload)
        val morning = json.optJSONObject("morning")
        val evening = json.optJSONObject("evening")
        ReminderScheduler.saveAndSchedule(
            activity,
            ReminderScheduler.Slot(
                enabled = morning?.optBoolean("enabled") ?: false,
                time = morning?.optString("time") ?: "06:30",
            ),
            ReminderScheduler.Slot(
                enabled = evening?.optBoolean("enabled") ?: false,
                time = evening?.optString("time") ?: "18:00",
            ),
        )
        true
    } catch (error: Exception) {
        false
    }

    @JavascriptInterface
    fun requestNotificationPermission(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return true
        if (notificationPermission()) return true
        activity.runOnUiThread {
            activity.requestPermissions(
                arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                REQUEST_NOTIFICATIONS,
            )
        }
        return false
    }

    @JavascriptInterface
    fun notificationPermission(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(
                activity,
                Manifest.permission.POST_NOTIFICATIONS,
            ) == PackageManager.PERMISSION_GRANTED

    @JavascriptInterface
    fun openNotificationSettings() {
        activity.runOnUiThread {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                    .putExtra(Settings.EXTRA_APP_PACKAGE, activity.packageName)
            } else {
                Intent(
                    Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                    Uri.parse("package:${activity.packageName}"),
                )
            }
            runCatching { activity.startActivity(intent) }
        }
    }

    // ----------------------------------------------------------------- tts

    /** True only when the engine is ready *and* an Arabic voice is installed. */
    @JavascriptInterface
    fun ttsAvailable(): Boolean = ttsReady && arabicVoice

    @JavascriptInterface
    fun speak(text: String) {
        if (released) return
        if (!ttsReady) {
            pendingSpeech = text
            // A previous attempt may have failed before the user installed a voice.
            if (tts == null) initialize()
            // Never leave the button spinning: if the engine does not come up,
            // tell the page so it can point at the system voice settings.
            webView.postDelayed({
                if (!released && !ttsReady) {
                    pendingSpeech = null
                    notifyTtsError()
                }
            }, INIT_TIMEOUT_MS)
            return
        }
        if (!arabicVoice) {
            notifyTtsError()
            return
        }
        speakNow(text)
    }

    @JavascriptInterface
    fun stopSpeaking() {
        pendingSpeech = null
        activity.runOnUiThread { tts?.stop() }
    }

    /** Opens the system screen where an Arabic text-to-speech voice can be installed. */
    @JavascriptInterface
    fun openTtsSettings() {
        activity.runOnUiThread {
            val candidates = listOf(
                Intent("com.android.settings.TTS_SETTINGS"),
                Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA),
                Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS),
            )
            for (intent in candidates) {
                if (runCatching { activity.startActivity(intent) }.isSuccess) return@runOnUiThread
            }
        }
    }

    companion object {
        const val REQUEST_NOTIFICATIONS = 8001
        private const val INIT_TIMEOUT_MS = 5_000L
        private const val TAG = "NoorTts"
    }
}
