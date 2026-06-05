package com.vicetracker.wear

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

object ViceRepository {
    private val _vices = MutableStateFlow<List<WearVice>>(emptyList())
    val vices: StateFlow<List<WearVice>> = _vices

    fun update(list: List<WearVice>) {
        _vices.value = list
    }

    fun updateFromJson(json: String) {
        _vices.value = parseJson(json)
    }

    fun parseJson(json: String): List<WearVice> {
        val type = object : TypeToken<List<WearViceJson>>() {}.type
        val raw: List<WearViceJson> = Gson().fromJson(json, type)
        return raw.map { it.toWearVice() }
    }
}
