package com.vicetracker.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.google.android.gms.wearable.Wearable

class WearMainActivity : ComponentActivity() {

    private val viewModel: ViceViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val vices by viewModel.vices.collectAsState()
            val loggingId by viewModel.loggingId.collectAsState()
            ViceListScreen(
                vices = vices,
                loggingId = loggingId,
                onLogVice = viewModel::logVice,
            )
        }
    }

    override fun onResume() {
        super.onResume()
        // Ask the phone for the latest vice list every time the screen becomes visible
        Wearable.getNodeClient(this).connectedNodes.addOnSuccessListener { nodes ->
            nodes.forEach { node ->
                Wearable.getMessageClient(this).sendMessage(node.id, "/request", ByteArray(0))
            }
        }
    }
}
