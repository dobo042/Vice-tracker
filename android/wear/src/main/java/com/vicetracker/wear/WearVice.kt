package com.vicetracker.wear

data class WearVice(
    val id: String,
    val name: String,
    val logCount: Int,
    val cooldownMinutes: Int,
    val lastLoggedAt: String?,
) {
    val isOnCooldown: Boolean
        get() {
            if (lastLoggedAt == null) return false
            val elapsed = System.currentTimeMillis() -
                java.time.Instant.parse(lastLoggedAt).toEpochMilli()
            return elapsed < cooldownMinutes * 60_000L
        }

    val remainingMs: Long
        get() {
            if (lastLoggedAt == null) return 0L
            val elapsed = System.currentTimeMillis() -
                java.time.Instant.parse(lastLoggedAt).toEpochMilli()
            return maxOf(0L, cooldownMinutes * 60_000L - elapsed)
        }

    // 0f = just logged (cooldown started), 1f = ready to log again
    val cooldownProgress: Float
        get() {
            if (lastLoggedAt == null || cooldownMinutes <= 0) return 1f
            val elapsed = System.currentTimeMillis() -
                java.time.Instant.parse(lastLoggedAt).toEpochMilli()
            return (elapsed.toFloat() / (cooldownMinutes * 60_000L)).coerceIn(0f, 1f)
        }
}
