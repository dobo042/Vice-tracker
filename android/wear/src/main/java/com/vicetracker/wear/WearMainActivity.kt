package com.vicetracker.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.google.android.gms.wearable.DataMapItem
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

        // 1. Read any data already cached in the Wearable Data Layer (works offline)
        Wearable.getDataClient(this).getDataItems().addOnSuccessListener { items ->
            items.forEach { item ->
                if (item.uri.path == "/vices") {
                    val json = DataMapItem.fromDataItem(item).dataMap
                        .getString("viceList") ?: return@forEach
                    ViceRepository.updateFromJson(json)
                }
            }
            items.release()
        }

        // 2. Ask the phone for fresh data in case anything changed
        Wearable.getNodeClient(this).connectedNodes.addOnSuccessListener { nodes ->
            nodes.forEach { node ->
                Wearable.getMessageClient(this)
                    .sendMessage(node.id, "/request", ByteArray(0))
            }
        }
    }
}
