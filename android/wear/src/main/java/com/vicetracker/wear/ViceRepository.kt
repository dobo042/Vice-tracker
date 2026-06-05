package com.vicetracker.wear

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

// Process-level singleton so the ListenerService can push data to the ViewModel
object ViceRepository {
    private val _vices = MutableStateFlow<List<WearVice>>(emptyList())
    val vices: StateFlow<List<WearVice>> = _vices

    fun update(list: List<WearVice>) {
        _vices.value = list
    }
}
