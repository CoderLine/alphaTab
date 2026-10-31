import { AlphaSkiaCanvas } from '@coderline/alphaskia';
import type { AlphaTabApiBase } from '@coderline/alphatab/AlphaTabApiBase';
import type { ScoreRenderer } from '@coderline/alphatab/rendering/ScoreRenderer';
import type { ScoreRendererWrapper } from '@coderline/alphatab/rendering/ScoreRendererWrapper';
import type { Skyline } from '@coderline/alphatab/rendering/skyline/Skyline';

/**
 * Test-only diagnostic that overlays the assembled up/down skylines on
 * top of a rendered score image. Used to visually verify the skyline
 * matches the bar content envelope.
 *
 * This helper lives under `test/visualTests/` and is never imported by
 * production code. There is no public `Settings` toggle for it — visual
 * snapshots opt-in by passing this helper as the `prepareFullImage`
 * callback on {@link VisualTestOptions}.
 * @internal
 */
export class SkylineDebugRenderer {
    /**
     * Paint each staff's assembled `systemSkyline` (top side in red, bottom
     * side in blue) onto `canvas`. Coordinates are computed from the laid-out
     * `StaffSystem` / `RenderStaff` positions so the overlay aligns with the
     * rendered score directly under it.
     */
    public static overlay(api: AlphaTabApiBase<unknown>, canvas: AlphaSkiaCanvas): void {
        // api.renderer is a ScoreRendererWrapper; unwrap to the concrete
        // ScoreRenderer which exposes `layout`.
        const wrapper = api.renderer as unknown as ScoreRendererWrapper;
        const innerRenderer = wrapper.instance as unknown as ScoreRenderer | undefined;
        const systems = innerRenderer?.layout?.systems;
        if (!systems || systems.length === 0) {
            return;
        }

        // Diagnostic overlay paints last; no need to restore canvas state.
        canvas.lineWidth = 1.5;

        for (const system of systems) {
            const systemX = system.x;
            // StaffSystem.paint passes `cy + this.y + this.topPadding` to its
            // staves, so the canvas-y origin used by everything downstream
            // (including the painted noteheads) is `system.y + system.topPadding`.
            const systemY = system.y + system.topPadding;
            for (const staffGroup of system.staves) {
                for (const staff of staffGroup.staves) {
                    if (!staff.isVisible) {
                        continue;
                    }
                    const staffOriginX = systemX + staff.x;
                    const referenceTopY =
                        staff.barRenderers.length > 0 ? systemY + staff.y + staff.barRenderers[0].y : systemY + staff.y;

                    const referenceBottomY =
                        staff.barRenderers.length > 0
                            ? referenceTopY + staff.barRenderers[0].height
                            : referenceTopY;

                    SkylineDebugRenderer._traceSkyline(
                        canvas,
                        staff.systemSkyline.upSky,
                        staffOriginX,
                        referenceTopY,
                        -1,
                        220, 30, 30
                    );

                    SkylineDebugRenderer._traceSkyline(
                        canvas,
                        staff.systemSkyline.downSky,
                        staffOriginX,
                        referenceBottomY,
                        1,
                        30, 80, 220
                    );
                }
            }
        }
    }

    /**
     * Trace a single Skyline as a filled stepped envelope.
     * `referenceY` is the staff edge from which the skyline's outward
     * magnitude is measured. `direction` is +1 (downSky) or -1 (upSky).
     * `r`/`g`/`b` are taken instead of a precomputed color value so the
     * `rgbaToColor` call lands directly on the `canvas.color` setter — the
     * transpiler doesn't preserve uint typing through intermediate variables.
     */
    private static _traceSkyline(
        canvas: AlphaSkiaCanvas,
        skyline: Skyline,
        originX: number,
        referenceY: number,
        direction: number,
        r: number,
        g: number,
        b: number
    ): void {
        skyline.forEachSegment((xStart, xEnd, height) => {
            if (height <= 0) {
                return;
            }
            const drawXEnd = xEnd > originX + 10000 ? originX + 10000 : xEnd;
            const x0 = originX + xStart;
            const x1 = originX + drawXEnd;
            const y0 = referenceY;
            const y1 = referenceY + direction * height;
            const rectY = direction < 0 ? y1 : y0;
            const rectH = Math.abs(y1 - y0);
            canvas.color = AlphaSkiaCanvas.rgbaToColor(r, g, b, 80);
            canvas.fillRect(x0, rectY, x1 - x0, rectH);
            canvas.color = AlphaSkiaCanvas.rgbaToColor(r, g, b, 230);
            canvas.strokeRect(x0, rectY, x1 - x0, rectH);
        });
    }
}
