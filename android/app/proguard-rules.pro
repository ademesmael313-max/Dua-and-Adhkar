# Keep the JavaScript bridge intact when R8 shrinks the release build.
-keepclassmembers class com.noor.dua.NativeBridge {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.noor.dua.NativeBridge { *; }
-keep class com.noor.dua.ReminderReceiver { *; }
-keep class com.noor.dua.BootReceiver { *; }
