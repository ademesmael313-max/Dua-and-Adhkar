package com.noor.dua

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Re-arms reminder alarms after a reboot, quick boot or app update. */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            "android.intent.action.QUICKBOOT_POWERON" -> ReminderScheduler.rescheduleAll(context)
        }
    }
}
