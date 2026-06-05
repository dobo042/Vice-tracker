package com.vicetracker.wear

// Raw JSON shape matching the phone's Vice type
data class WearViceJson(
    val id: String,
    val name: String,
    val logCount: Int = 0,
    val cooldownMinutes: Int,
    val lastLoggedAt: String? = null,
) {
    fun toWearVice() = WearVice(
        id = id,
        name = name,
        logCount = logCount,
        cooldownMinutes = cooldownMinutes,
        lastLoggedAt = lastLoggedAt,
    )
}
