package com.vicetracker

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService

class WearDataService : WearableListenerService() {

    override fun onMessageReceived(event: MessageEvent) {
        if (event.path.startsWith("/log/")) {
            val viceId = event.path.removePrefix("/log/")
            // Find the WearBridgeModule instance and emit to JS
            val app = application as? MainApplication ?: return
            app.reactNativeHost.reactInstanceManager.currentReactContext
                ?.getNativeModule(WearBridgeModule::class.java)
                ?.emitViceLogged(viceId)
        }
    }
}
