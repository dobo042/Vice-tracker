package com.vicetracker.wear

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.HorizontalPageIndicator
import androidx.wear.compose.material.PageIndicatorState
import androidx.wear.compose.material.ProgressIndicatorDefaults
import androidx.wear.compose.material.Text
import kotlinx.coroutines.delay

private val Olive = Color(0xFF4A4A00)
private val CooldownColor = Color(0xFFE53935)
private val ReadyColor = Color(0xFF43A047)
private val TrackColor = Color(0xFF2E2E2E)

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
                modifier = Modifier.padding(16.dp),
            )
        }
        return
    }

    val pagerState = rememberPagerState(pageCount = { vices.size })

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxSize(),
        ) { page ->
            val vice = vices[page]
            ViceClockFace(
                vice = vice,
                isLogging = loggingId == vice.id,
                onTap = { onLogVice(vice.id) },
            )
        }

        if (vices.size > 1) {
            val indicatorState = remember(vices.size) {
                object : PageIndicatorState {
                    override val pageCount get() = vices.size
                    override val pageOffset get() = pagerState.currentPageOffsetFraction
                    override val selectedPage get() = pagerState.currentPage
                }
            }
            HorizontalPageIndicator(
                pageIndicatorState = indicatorState,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 6.dp),
            )
        }
    }
}

@Composable
fun ViceClockFace(
    vice: WearVice,
    isLogging: Boolean,
    onTap: () -> Unit,
) {
    var flashing by remember { mutableStateOf(false) }

    LaunchedEffect(isLogging) {
        if (isLogging) {
            flashing = true
            delay(300)
            flashing = false
        }
    }

    val arcColor by animateColorAsState(
        targetValue = when {
            flashing -> Olive
            vice.isOnCooldown -> CooldownColor
            vice.lastLoggedAt != null -> ReadyColor
            else -> Olive
        },
        animationSpec = tween(150),
        label = "arcColor",
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .clickable(enabled = !isLogging, onClick = onTap),
        contentAlignment = Alignment.Center,
    ) {
        // Track ring (full circle, dark grey)
        CircularProgressIndicator(
            progress = 1f,
            modifier = Modifier.fillMaxSize().padding(4.dp),
            strokeWidth = 8.dp,
            colors = ProgressIndicatorDefaults.progressIndicatorColors(
                indicatorColor = TrackColor,
                trackColor = Color.Transparent,
            ),
        )
        // Progress arc — sweeps from 12 o'clock clockwise as cooldown elapses
        CircularProgressIndicator(
            progress = vice.cooldownProgress,
            modifier = Modifier.fillMaxSize().padding(4.dp),
            strokeWidth = 8.dp,
            colors = ProgressIndicatorDefaults.progressIndicatorColors(
                indicatorColor = arcColor,
                trackColor = Color.Transparent,
            ),
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 32.dp),
        ) {
            Text(
                text = vice.name,
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                maxLines = 2,
            )

            if (vice.logCount > 0) {
                Spacer(Modifier.height(4.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (flashing) Color.White else Olive)
                        .padding(horizontal = 8.dp, vertical = 2.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "×${vice.logCount}",
                        color = if (flashing) Olive else Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }

            Spacer(Modifier.height(6.dp))
            when {
                vice.isOnCooldown -> Text(
                    text = formatRemaining(vice.remainingMs),
                    color = CooldownColor,
                    fontSize = 13.sp,
                )
                vice.lastLoggedAt != null -> Text(
                    text = "Ready!",
                    color = ReadyColor,
                    fontSize = 13.sp,
                )
            }
        }
    }
}

private fun formatRemaining(ms: Long): String {
    val h = ms / 3_600_000
    val m = (ms % 3_600_000) / 60_000
    return if (h > 0) "${h}h ${m}m" else "${m}m"
}
