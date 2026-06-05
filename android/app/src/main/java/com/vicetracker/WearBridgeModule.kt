package com.vicetracker

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable

class WearBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WearBridge"

    @ReactMethod
    fun pushVices(json: String) {
        val request = PutDataMapRequest.create("/vices").apply {
            dataMap.putString("viceList", json)
            dataMap.putLong("updatedAt", System.currentTimeMillis())
        }
        Wearable.getDataClient(reactApplicationContext)
            .putDataItem(request.asPutDataRequest().setUrgent())
    }

    fun emitViceLogged(viceId: String) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("ViceLoggedOnWatch", viceId)
    }

    // Required for RN event emitters — no-op stubs
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
