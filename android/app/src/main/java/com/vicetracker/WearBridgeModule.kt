package com.vicetracker

import android.content.Context
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable

class WearBridgeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WearBridge"

    @ReactMethod
    fun pushVices(json: String) {
        // Persist locally so WearDataService can serve /request without the RN context
        reactApplicationContext
            .getSharedPreferences("WearData", Context.MODE_PRIVATE)
            .edit().putString("vice_list_json", json).apply()
        pushToDataLayer(reactApplicationContext, json)
    }

    fun emitViceLogged(viceId: String) {
        emit("ViceLoggedOnWatch", viceId)
    }

    fun emitSyncRequest() {
        emit("WatchRequestedSync", true)
    }

    private fun emit(event: String, payload: Any) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, payload)
    }

    // Required for RN event emitters — no-op stubs
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}

    companion object {
        fun pushToDataLayer(context: Context, json: String) {
            val request = PutDataMapRequest.create("/vices").apply {
                dataMap.putString("viceList", json)
                dataMap.putLong("updatedAt", System.currentTimeMillis())
            }
            Wearable.getDataClient(context)
                .putDataItem(request.asPutDataRequest().setUrgent())
        }
    }
}
