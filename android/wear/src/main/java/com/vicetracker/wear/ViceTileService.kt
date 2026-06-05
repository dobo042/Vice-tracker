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

        val col = LayoutElementBuilders.Column.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.expand())
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_START)
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
            .addContent(
                LayoutElementBuilders.Text.Builder()
                    .setText("Vice Tracker")
                    .setFontStyle(
                        LayoutElementBuilders.FontStyle.Builder()
                            .setSize(DimensionBuilders.sp(15f))
                            .setColor(ColorBuilders.argb(0xFF4A4A00.toInt()))
                            .setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
                            .build()
                    )
                    .setModifiers(
                        ModifiersBuilders.Modifiers.Builder()
                            .setPadding(
                                ModifiersBuilders.Padding.Builder()
                                    .setBottom(DimensionBuilders.dp(6f))
                                    .build()
                            )
                            .build()
                    )
                    .build()
            )

        if (vices.isEmpty()) {
            col.addContent(
                LayoutElementBuilders.Text.Builder()
                    .setText("No vices yet")
                    .setFontStyle(
                        LayoutElementBuilders.FontStyle.Builder()
                            .setSize(DimensionBuilders.sp(12f))
                            .setColor(ColorBuilders.argb(0xFF888888.toInt()))
                            .build()
                    )
                    .build()
            )
        } else {
            vices.take(5).forEach { vice ->
                col.addContent(viceRow(vice))
            }
        }

        return col.build()
    }

    private fun viceRow(vice: WearVice): LayoutElementBuilders.LayoutElement {
        val dotColor = when {
            vice.isOnCooldown -> 0xFFE53935.toInt()
            vice.lastLoggedAt != null -> 0xFF43A047.toInt()
            else -> 0xFF888888.toInt()
        }
        val label = if (vice.logCount > 0) "${vice.name} ×${vice.logCount}" else vice.name

        return LayoutElementBuilders.Row.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.wrap())
            .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setPadding(
                        ModifiersBuilders.Padding.Builder()
                            .setBottom(DimensionBuilders.dp(3f))
                            .build()
                    )
                    .build()
            )
            .addContent(
                LayoutElementBuilders.Box.Builder()
                    .setWidth(DimensionBuilders.dp(6f))
                    .setHeight(DimensionBuilders.dp(6f))
                    .setModifiers(
                        ModifiersBuilders.Modifiers.Builder()
                            .setBackground(
                                ModifiersBuilders.Background.Builder()
                                    .setColor(ColorBuilders.argb(dotColor))
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
            )
            .addContent(
                LayoutElementBuilders.Spacer.Builder()
                    .setWidth(DimensionBuilders.dp(5f))
                    .build()
            )
            .addContent(
                LayoutElementBuilders.Text.Builder()
                    .setText(label)
                    .setFontStyle(
                        LayoutElementBuilders.FontStyle.Builder()
                            .setSize(DimensionBuilders.sp(13f))
                            .setColor(ColorBuilders.argb(0xFFFFFFFF.toInt()))
                            .build()
                    )
                    .setMaxLines(1)
                    .build()
            )
            .build()
    }
}
