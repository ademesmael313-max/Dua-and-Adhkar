package com.noor.dua

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

/** Shows a morning/evening reminder and arms the next day's alarm. */
class ReminderReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val slotName = intent.getStringExtra(ReminderScheduler.EXTRA_SLOT)
            ?: ReminderScheduler.SLOT_MORNING
        val (morning, evening) = ReminderScheduler.load(context)
        val isEvening = slotName == ReminderScheduler.SLOT_EVENING
        val slot = if (isEvening) evening else morning
        if (!slot.enabled) return

        showNotification(context, isEvening)
        ReminderScheduler.schedule(
            context,
            slotName,
            slot,
            if (isEvening) ReminderScheduler.REQUEST_EVENING else ReminderScheduler.REQUEST_MORNING,
        )
    }

    private fun showNotification(context: Context, isEvening: Boolean) {
        val canPost = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS,
            ) == PackageManager.PERMISSION_GRANTED
        if (!canPost) return

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            ?: return

        ensureChannel(context)

        val openApp = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val body = context.getString(R.string.notif_body)
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(
                context.getString(
                    if (isEvening) R.string.notif_evening_title else R.string.notif_morning_title,
                ),
            )
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(openApp)
            .build()

        manager.notify(
            if (isEvening) NOTIFICATION_EVENING else NOTIFICATION_MORNING,
            notification,
        )
    }

    companion object {
        private const val CHANNEL_ID = "noor_reminders"
        private const val NOTIFICATION_MORNING = 4201
        private const val NOTIFICATION_EVENING = 4202

        /** Registers the channel early so it shows up in the system settings. */
        fun ensureChannel(context: Context) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                ?: return
            val channel = NotificationChannel(
                CHANNEL_ID,
                context.getString(R.string.notif_channel),
                NotificationManager.IMPORTANCE_DEFAULT,
            ).apply {
                description = context.getString(R.string.notif_channel_description)
            }
            manager.createNotificationChannel(channel)
        }
    }
}
