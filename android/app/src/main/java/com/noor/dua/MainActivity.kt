package com.noor.dua

import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.updatePadding
import androidx.webkit.WebViewAssetLoader

/**
 * Single-activity host for the Noor web app.
 *
 * The site is bundled in `assets/www` and served through [WebViewAssetLoader]
 * on an https origin, which keeps localStorage, the clipboard and speech APIs
 * working exactly as they do in a browser. Native extras are exposed to the
 * page through [NativeBridge] as `window.NoorAndroid`.
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var root: FrameLayout
    private lateinit var bridge: NativeBridge

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.Theme_Noor)
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler(
                "/assets/",
                MimeFixingHandler(WebViewAssetLoader.AssetsPathHandler(this)),
            )
            .build()

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            )
            setBackgroundColor(Color.parseColor(BACKGROUND_DARK))
            overScrollMode = View.OVER_SCROLL_NEVER
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                mediaPlaybackRequiresUserGesture = false
                // Assets change with every app update; never serve a stale bundle.
                cacheMode = WebSettings.LOAD_NO_CACHE
                allowFileAccess = false
                allowContentAccess = false
                setSupportZoom(false)
                builtInZoomControls = false
                textZoom = 100
            }
            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView,
                    request: WebResourceRequest,
                ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)

                override fun shouldOverrideUrlLoading(
                    view: WebView,
                    request: WebResourceRequest,
                ): Boolean {
                    val url: Uri = request.url
                    if (url.host == ASSET_HOST) return false
                    val scheme = url.scheme ?: return true
                    if (scheme == "https" || scheme == "http" || scheme == "mailto") {
                        runCatching { startActivity(Intent(Intent.ACTION_VIEW, url)) }
                    }
                    return true
                }
            }
        }

        bridge = NativeBridge(this, webView).also { it.initialize() }
        webView.addJavascriptInterface(bridge, "NoorAndroid")

        root = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor(BACKGROUND_DARK))
            addView(webView)
        }
        setContentView(root)

        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() or
                    WindowInsetsCompat.Type.displayCutout() or
                    WindowInsetsCompat.Type.ime(),
            )
            view.updatePadding(bars.left, bars.top, bars.right, bars.bottom)
            WindowInsetsCompat.CONSUMED
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Register the notification channel and re-arm the daily reminder alarms
        // after an update or process death.
        ReminderReceiver.ensureChannel(this)
        ReminderScheduler.rescheduleAll(this)

        webView.loadUrl(ASSET_URL)
    }

    /** Keeps the window and page background in step with the web app's theme. */
    internal fun setContentBackground(light: Boolean) {
        val background = Color.parseColor(if (light) BACKGROUND_LIGHT else BACKGROUND_DARK)
        window.decorView.setBackgroundColor(background)
        if (::root.isInitialized) root.setBackgroundColor(background)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == NativeBridge.REQUEST_NOTIFICATIONS) {
            val granted = grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED
            webView.post {
                webView.evaluateJavascript(
                    "window.NoorNotificationPermission && window.NoorNotificationPermission($granted)",
                    null,
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        webView.resumeTimers()
    }

    override fun onPause() {
        webView.onPause()
        webView.pauseTimers()
        super.onPause()
    }

    override fun onDestroy() {
        bridge.shutdown()
        webView.destroy()
        super.onDestroy()
    }

    /**
     * `AssetsPathHandler` guesses MIME types from a table that misses several
     * web formats we ship (woff2, webmanifest, …). Chromium refuses fonts served
     * with the wrong type, so the important extensions are pinned here.
     */
    private class MimeFixingHandler(
        private val delegate: WebViewAssetLoader.PathHandler,
    ) : WebViewAssetLoader.PathHandler {

        override fun handle(path: String): WebResourceResponse? {
            val response = delegate.handle(path) ?: return null
            val mime = when {
                path.endsWith(".woff2", true) -> "font/woff2"
                path.endsWith(".woff", true) -> "font/woff"
                path.endsWith(".ttf", true) -> "font/ttf"
                path.endsWith(".webmanifest", true) -> "application/manifest+json"
                path.endsWith(".json", true) -> "application/json"
                path.endsWith(".js", true) -> "text/javascript"
                path.endsWith(".svg", true) -> "image/svg+xml"
                path.endsWith(".webp", true) -> "image/webp"
                path.endsWith(".png", true) -> "image/png"
                path.endsWith(".css", true) -> "text/css"
                else -> null
            }
            if (mime != null) response.mimeType = mime
            return response
        }
    }

    companion object {
        private const val BACKGROUND_DARK = "#07130F"
        private const val BACKGROUND_LIGHT = "#F7F4EE"
        private const val ASSET_HOST = "appassets.androidplatform.net"
        private const val ASSET_URL = "https://appassets.androidplatform.net/assets/www/index.html"
    }
}
