package com.vicetracker

import android.content.Context
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WearDataService : WearableListenerService() {

    override fun onMessageReceived(event: MessageEvent) {
        when {
            event.path.startsWith("/log/") -> handleLog(event.path.removePrefix("/log/"))
            event.path == "/request" -> handleRequest()
        }
    }

    private fun handleLog(viceId: String) {
        rnModule()?.emitViceLogged(viceId)
    }

    private fun handleRequest() {
        val module = rnModule()
        if (module != null) {
            // App is running — let JS push fresh data
            module.emitSyncRequest()
        } else {
            // App not running — serve directly from the SharedPreferences cache
            val json = getSharedPreferences("WearData", Context.MODE_PRIVATE)
                .getString("vice_list_json", null) ?: return
            WearBridgeModule.pushToDataLayer(this, json)
        }
    }

    private fun rnModule(): WearBridgeModule? =
        (application as? MainApplication)
            ?.reactNativeHost
            ?.reactInstanceManager
            ?.currentReactContext
            ?.getNativeModule(WearBridgeModule::class.java)
}
