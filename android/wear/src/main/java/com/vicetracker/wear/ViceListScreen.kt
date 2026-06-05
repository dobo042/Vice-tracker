package com.vicetracker.wear

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.Text
import kotlinx.coroutines.delay

private val Olive = Color(0xFF4A4A00)
private val CooldownBg = Color(0xFFFDECEA)
private val ReadyBg = Color(0xFFE8F5E9)
private val DefaultBg = Color(0xFFFFFFFF)

@Composable
fun ViceListScreen(
    vices: List<WearVice>,
    loggingId: String?,
    onLogVice: (String) -> Unit,
) {
    if (vices.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize().background(Color.Black),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "No vices yet.\nOpen phone app to add.",
                color = Color.White,
                fontSize = 13.sp,
                lineHeight = 18.sp,
                modifier = Modifier.padding(16.dp),
            )
        }
        return
    }

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize().background(Color.Black),
        contentPadding = PaddingValues(vertical = 24.dp, horizontal = 8.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        items(vices, key = { it.id }) { vice ->
            ViceCard(
                vice = vice,
                isLogging = loggingId == vice.id,
                onTap = { onLogVice(vice.id) },
            )
        }
    }
}

@Composable
fun ViceCard(
    vice: WearVice,
    isLogging: Boolean,
    onTap: () -> Unit,
) {
    var flashColor by remember { mutableStateOf(false) }

    LaunchedEffect(isLogging) {
        if (isLogging) {
            flashColor = true
            delay(300)
            flashColor = false
        }
    }

    val normalBg = when {
        vice.isOnCooldown -> CooldownBg
        vice.lastLoggedAt != null -> ReadyBg
        else -> DefaultBg
    }

    val bgColor by animateColorAsState(
        targetValue = if (flashColor) Olive else normalBg,
        animationSpec = tween(durationMillis = 150),
        label = "cardBg",
    )

    val textColor = if (flashColor) Color.White else Color.Black
    val subColor = if (flashColor) Color.White.copy(alpha = 0.8f)
    else Color.Gray

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .clickable(enabled = !isLogging, onClick = onTap)
            .padding(horizontal = 12.dp, vertical = 10.dp),
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    text = vice.name,
                    color = textColor,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f),
                )
                if (vice.logCount > 0) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (flashColor) Color.White else Olive)
                            .padding(horizontal = 6.dp, vertical = 2.dp),
                    ) {
                        Text(
                            text = "×${vice.logCount}",
                            color = if (flashColor) Olive else Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }
            }

            if (vice.isOnCooldown) {
                val remaining = vice.remainingMs
                val h = remaining / 3_600_000
                val m = (remaining % 3_600_000) / 60_000
                val label = if (h > 0) "${h}h ${m}m left" else "${m}m left"
                Text(
                    text = label,
                    color = subColor,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 2.dp),
                )
            } else if (vice.lastLoggedAt != null) {
                Text(
                    text = "Ready!",
                    color = Color(0xFF2E7D32),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 2.dp),
                )
            }
        }
    }
}
