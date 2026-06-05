package com.vicetracker.wear

import android.app.Application
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class ViceViewModel(app: Application) : AndroidViewModel(app) {

    private val _vices = MutableStateFlow<List<WearVice>>(emptyList())
    val vices: StateFlow<List<WearVice>> = _vices

    private val _loggingId = MutableStateFlow<String?>(null)
    val loggingId: StateFlow<String?> = _loggingId

    init {
        viewModelScope.launch {
            ViceRepository.vices.collectLatest { _vices.value = it }
        }
    }

    fun logVice(viceId: String) {
        if (_loggingId.value != null) return
        _loggingId.value = viceId
        val context = getApplication<Application>()

        // Haptic immediately so the tap feels responsive
        context.getSystemService(Vibrator::class.java)
            ?.vibrate(VibrationEffect.createOneShot(80, VibrationEffect.DEFAULT_AMPLITUDE))

        // Send log message to phone — phone will push back updated vice list
        Wearable.getNodeClient(context).connectedNodes.addOnSuccessListener { nodes ->
            nodes.forEach { node ->
                Wearable.getMessageClient(context).sendMessage(node.id, "/log/$viceId", ByteArray(0))
            }
            _loggingId.value = null
        }.addOnFailureListener {
            _loggingId.value = null
        }
    }
}
