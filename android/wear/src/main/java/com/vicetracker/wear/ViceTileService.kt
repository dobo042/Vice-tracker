package com.vicetracker.wear

import android.content.Context
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders
import androidx.wear.protolayout.DimensionBuilders
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.ResourceBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

class ViceTileService : TileService() {

    override fun onTileRequest(
        requestParams: RequestBuilders.TileRequest,
    ): ListenableFuture<TileBuilders.Tile> {
        val vices = loadVices()
        return Futures.immediateFuture(buildTile(vices))
    }

    override fun onResourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest,
    ): ListenableFuture<ResourceBuilders.Resources> =
        Futures.immediateFuture(
            ResourceBuilders.Resources.Builder().setVersion("1").build()
        )

    private fun loadVices(): List<WearVice> {
        val json = getSharedPreferences("WearViceCache", Context.MODE_PRIVATE)
            .getString("vice_json", null) ?: return emptyList()
        return try { ViceRepository.parseJson(json) } catch (_: Exception) { emptyList() }
    }

    private fun buildTile(vices: List<WearVice>): TileBuilders.Tile =
        TileBuilders.Tile.Builder()
            .setResourcesVersion("1")
            .setFreshnessIntervalMillis(5 * 60 * 1_000L)
            .setTileTimeline(
                TimelineBuilders.Timeline.Builder()
                    .addTimelineEntry(
                        TimelineBuilders.TimelineEntry.Builder()
                            .setLayout(
                                LayoutElementBuilders.Layout.Builder()
                                    .setRoot(buildRoot(vices))
                                    .build()
                            )
                            .build()
                    )
                    .build()
            )
            .build()

    private fun buildRoot(vices: List<WearVice>): LayoutElementBuilders.LayoutElement {
        val openApp = ModifiersBuilders.Clickable.Builder()
            .setOnClick(
                ActionBuilders.LaunchAction.Builder()
                    .setAndroidActivity(
                        ActionBuilders.AndroidActivity.Builder()
                            .setPackageName(packageName)
                            .setClassName("com.vicetracker.wear.WearMainActivity")
                            .build()
                    )
                    .build()
            )
            .build()

        val outer = LayoutElementBuilders.Box.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.expand())
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setBackground(
                        ModifiersBuilders.Background.Builder()
                            .setColor(ColorBuilders.argb(0xFF000000.toInt()))
                            .build()
                    )
                    .setClickable(openApp)
                    .setSemantics(
                        ModifiersBuilders.Semantics.Builder()
                            .setContentDescription("Open Vice Tracker")
                            .build()
                    )
                    .build()
            )

        if (vices.isEmpty()) {
            outer.addContent(centeredText("No vices yet", 0xFF888888.toInt(), 13f))
            return outer.build()
        }

        val primary = vices[0]

        // Layer 1: outermost ring (vice 1)
        outer.addContent(arcRing(primary, ringThicknessDp = 6f, paddingDp = 0f))

        // Layer 2: middle ring (vice 2, if present)
        if (vices.size >= 2) {
            outer.addContent(arcRing(vices[1], ringThicknessDp = 5f, paddingDp = 10f))
        }

        // Layer 3: inner ring (vice 3, if present)
        if (vices.size >= 3) {
            outer.addContent(arcRing(vices[2], ringThicknessDp = 4f, paddingDp = 19f))
        }

        // Center: colored dot + name for each visible ring so they're identifiable
        val innerPad = when {
            vices.size >= 3 -> 30f
            vices.size >= 2 -> 20f
            else -> 12f
        }
        outer.addContent(centerContent(vices.take(3), innerPad))

        return outer.build()
    }

    // Returns a Box (potentially padded inward) containing track + progress arcs
    private fun arcRing(
        vice: WearVice,
        ringThicknessDp: Float,
        paddingDp: Float,
    ): LayoutElementBuilders.LayoutElement {
        val progressDegrees = maxOf(2f, vice.cooldownProgress * 360f)
        val statusColor = arcColor(vice)

        val trackArc = LayoutElementBuilders.Arc.Builder()
            .setAnchorAngle(DimensionBuilders.degrees(0f))
            .addContent(
                LayoutElementBuilders.ArcLine.Builder()
                    .setLength(DimensionBuilders.degrees(360f))
                    .setThickness(DimensionBuilders.dp(ringThicknessDp))
                    .setColor(ColorBuilders.argb(0xFF2E2E2E.toInt()))
                    .build()
            )
            .build()

        val progressArc = LayoutElementBuilders.Arc.Builder()
            .setAnchorAngle(DimensionBuilders.degrees(0f))
            .addContent(
                LayoutElementBuilders.ArcLine.Builder()
                    .setLength(DimensionBuilders.degrees(progressDegrees))
                    .setThickness(DimensionBuilders.dp(ringThicknessDp))
                    .setColor(ColorBuilders.argb(statusColor))
                    .build()
            )
            .build()

        val ringBox = LayoutElementBuilders.Box.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.expand())
            .addContent(trackArc)
            .addContent(progressArc)

        if (paddingDp > 0f) {
            ringBox.setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setPadding(
                        ModifiersBuilders.Padding.Builder()
                            .setStart(DimensionBuilders.dp(paddingDp))
                            .setEnd(DimensionBuilders.dp(paddingDp))
                            .setTop(DimensionBuilders.dp(paddingDp))
                            .setBottom(DimensionBuilders.dp(paddingDp))
                            .build()
                    )
                    .build()
            )
        }

        return ringBox.build()
    }

    // Shows one labeled row per vice — colored dot (matches its ring) + truncated name + count
    private fun centerContent(
        vices: List<WearVice>,
        innerPadDp: Float,
    ): LayoutElementBuilders.LayoutElement {
        val col = LayoutElementBuilders.Column.Builder()
            .setWidth(DimensionBuilders.wrap())
            .setHeight(DimensionBuilders.wrap())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_START)

        vices.forEach { vice ->
            val label = if (vice.logCount > 0) "${vice.name} ×${vice.logCount}" else vice.name
            val dot = LayoutElementBuilders.Box.Builder()
                .setWidth(DimensionBuilders.dp(6f))
                .setHeight(DimensionBuilders.dp(6f))
                .setModifiers(
                    ModifiersBuilders.Modifiers.Builder()
                        .setBackground(
                            ModifiersBuilders.Background.Builder()
                                .setColor(ColorBuilders.argb(arcColor(vice)))
                                .setCorner(
                                    ModifiersBuilders.Corner.Builder()
                                        .setRadius(DimensionBuilders.dp(3f))
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build()

            val row = LayoutElementBuilders.Row.Builder()
                .setWidth(DimensionBuilders.wrap())
                .setHeight(DimensionBuilders.wrap())
                .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
                .setModifiers(
                    ModifiersBuilders.Modifiers.Builder()
                        .setPadding(
                            ModifiersBuilders.Padding.Builder()
                                .setBottom(DimensionBuilders.dp(2f))
                                .build()
                        )
                        .build()
                )
                .addContent(dot)
                .addContent(
                    LayoutElementBuilders.Spacer.Builder()
                        .setWidth(DimensionBuilders.dp(4f))
                        .build()
                )
                .addContent(
                    LayoutElementBuilders.Text.Builder()
                        .setText(label)
                        .setFontStyle(
                            LayoutElementBuilders.FontStyle.Builder()
                                .setSize(DimensionBuilders.sp(12f))
                                .setColor(ColorBuilders.argb(0xFFFFFFFF.toInt()))
                                .build()
                        )
                        .setMaxLines(1)
                        .build()
                )
                .build()

            col.addContent(row)
        }

        return LayoutElementBuilders.Box.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.expand())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setPadding(
                        ModifiersBuilders.Padding.Builder()
                            .setStart(DimensionBuilders.dp(innerPadDp))
                            .setEnd(DimensionBuilders.dp(innerPadDp))
                            .setTop(DimensionBuilders.dp(innerPadDp))
                            .setBottom(DimensionBuilders.dp(innerPadDp))
                            .build()
                    )
                    .build()
            )
            .addContent(col.build())
            .build()
    }

    private fun centeredText(
        text: String,
        color: Int,
        sizeSp: Float,
    ): LayoutElementBuilders.LayoutElement =
        LayoutElementBuilders.Box.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.expand())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .addContent(
                LayoutElementBuilders.Text.Builder()
                    .setText(text)
                    .setFontStyle(
                        LayoutElementBuilders.FontStyle.Builder()
                            .setSize(DimensionBuilders.sp(sizeSp))
                            .setColor(ColorBuilders.argb(color))
                            .build()
                    )
                    .build()
            )
            .build()

    private fun arcColor(vice: WearVice): Int = when {
        vice.isOnCooldown -> 0xFFE53935.toInt()
        vice.lastLoggedAt != null -> 0xFF43A047.toInt()
        else -> 0xFF4A4A00.toInt()
    }
}
