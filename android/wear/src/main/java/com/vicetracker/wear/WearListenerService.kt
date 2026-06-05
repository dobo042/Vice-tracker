package com.vicetracker.wear

import android.content.Context
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService

class WearListenerService : WearableListenerService() {

    override fun onDataChanged(events: DataEventBuffer) {
        events.forEach { event ->
            if (event.type == DataEvent.TYPE_CHANGED &&
                event.dataItem.uri.path == "/vices"
            ) {
                val json = DataMapItem.fromDataItem(event.dataItem).dataMap
                    .getString("viceList") ?: return@forEach
                cacheJson(json)
                ViceRepository.updateFromJson(json)
            }
        }
    }

    fun cacheJson(json: String) {
        applicationContext.getSharedPreferences("WearViceCache", Context.MODE_PRIVATE)
            .edit().putString("vice_json", json).apply()
    }
}
