package com.noor.dua

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.Calendar

/**
 * Persists the morning/evening reminder windows and arms inexact, doze-safe
 * alarms for them. The schedule is re-armed by [BootReceiver] after reboots and
 * app updates, and after each notification is delivered.
 */
object ReminderScheduler {

    private const val PREFS = "noor_reminders"
    private const val KEY_MORNING_ENABLED = "morning_enabled"
    private const val KEY_MORNING_TIME = "morning_time"
    private const val KEY_EVENING_ENABLED = "evening_enabled"
    private const val KEY_EVENING_TIME = "evening_time"

    const val SLOT_MORNING = "morning"
    const val SLOT_EVENING = "evening"
    const val EXTRA_SLOT = "slot"
    const val REQUEST_MORNING = 7101
    const val REQUEST_EVENING = 7102

    data class Slot(val enabled: Boolean, val time: String) {
        val hour: Int
            get() = time.substringBefore(":").toIntOrNull()?.coerceIn(0, 23) ?: 6
        val minute: Int
            get() = time.substringAfter(":", "0").toIntOrNull()?.coerceIn(0, 59) ?: 0
    }

    fun saveAndSchedule(context: Context, morning: Slot, evening: Slot) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_MORNING_ENABLED, morning.enabled)
            .putString(KEY_MORNING_TIME, morning.time)
            .putBoolean(KEY_EVENING_ENABLED, evening.enabled)
            .putString(KEY_EVENING_TIME, evening.time)
            .apply()

        schedule(context, SLOT_MORNING, morning, REQUEST_MORNING)
        schedule(context, SLOT_EVENING, evening, REQUEST_EVENING)
    }

    fun load(context: Context): Pair<Slot, Slot> {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val morning = Slot(
            enabled = prefs.getBoolean(KEY_MORNING_ENABLED, true),
            time = prefs.getString(KEY_MORNING_TIME, "06:30") ?: "06:30",
        )
        val evening = Slot(
            enabled = prefs.getBoolean(KEY_EVENING_ENABLED, false),
            time = prefs.getString(KEY_EVENING_TIME, "18:00") ?: "18:00",
        )
        return morning to evening
    }

    fun rescheduleAll(context: Context) {
        val (morning, evening) = load(context)
        schedule(context, SLOT_MORNING, morning, REQUEST_MORNING)
        schedule(context, SLOT_EVENING, evening, REQUEST_EVENING)
    }

    fun schedule(context: Context, slotName: String, slot: Slot, requestCode: Int) {
        val manager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val pending = pendingIntent(context, slotName, requestCode)
        manager.cancel(pending)
        if (!slot.enabled) return
        manager.setAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            nextTriggerMillis(slot.hour, slot.minute),
            pending,
        )
    }

    private fun nextTriggerMillis(hour: Int, minute: Int): Long {
        val now = Calendar.getInstance()
        val target = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        if (target.timeInMillis <= now.timeInMillis + 1_000) {
            target.add(Calendar.DAY_OF_YEAR, 1)
        }
        return target.timeInMillis
    }

    private fun pendingIntent(context: Context, slotName: String, requestCode: Int): PendingIntent {
        val intent = Intent(context, ReminderReceiver::class.java).apply {
            action = "com.noor.dua.REMINDER"
            putExtra(EXTRA_SLOT, slotName)
        }
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }
}
