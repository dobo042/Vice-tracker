package com.vicetracker

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WearDataService : WearableListenerService() {

    override fun onMessageReceived(event: MessageEvent) {
        val module = (application as? MainApplication)
            ?.reactNativeHost
            ?.reactInstanceManager
            ?.currentReactContext
            ?.getNativeModule(WearBridgeModule::class.java)
            ?: return

        when {
            event.path.startsWith("/log/") ->
                module.emitViceLogged(event.path.removePrefix("/log/"))
            event.path == "/request" ->
                module.emitSyncRequest()
        }
    }
}
