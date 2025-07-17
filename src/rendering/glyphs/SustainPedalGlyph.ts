import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { type SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';

export class SustainPedalGlyph extends EffectGlyph {

    public constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = this.renderer.smuflMetrics.glyphHeights.get(MusicFontSymbol.KeyboardPedalPed)!;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer;

        const y = cy + this.y;
        const h = this.height;

        const markers = renderer.bar.sustainPedals;

        const textWidth = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.KeyboardPedalPed)!;
        const starSize = this.renderer.smuflMetrics.glyphWidths.get(MusicFontSymbol.KeyboardPedalUp)!;

        let markerIndex = 0;
        while (markerIndex < markers.length) {
            let marker: SustainPedalMarker | null = markers[markerIndex];
            while (marker != null) {
                const markerX = cx + this.renderer.getRatioPositionX(marker.ratioPosition);

                // real own marker
                let linePadding = 0;
                if (marker.pedalType === SustainPedalMarkerType.Down) {
                    canvas.fillMusicFontSymbol(markerX, y + h, 1, MusicFontSymbol.KeyboardPedalPed, true);
                    linePadding = textWidth / 2 + this.renderer.smuflMetrics.sustainPedalTextLinePadding;
                } else if (marker.pedalType === SustainPedalMarkerType.Up) {
                    canvas.fillMusicFontSymbol(markerX, y + h, 1, MusicFontSymbol.KeyboardPedalUp, true);
                    linePadding = starSize / 2 + this.renderer.smuflMetrics.sustainPedalStarLinePadding;
                }

                // line to next marker or end-of-bar
                if (marker.nextPedalMarker) {
                    if (marker.nextPedalMarker.bar === marker.bar) {
                        let nextX = cx + this.renderer.getRatioPositionX(marker.nextPedalMarker.ratioPosition);

                        switch (marker.nextPedalMarker.pedalType) {
                            case SustainPedalMarkerType.Down:
                                nextX -= textWidth / 2;
                                break;
                            case SustainPedalMarkerType.Hold:
                                // no offset on hold
                                break;
                            case SustainPedalMarkerType.Up:
                                nextX -= starSize / 2;
                                break;
                        }

                        const startX = markerX + linePadding;
                        if (nextX > startX) {
                            canvas.fillRect(startX, y + h - this.renderer.smuflMetrics.pedalLineThickness, nextX - startX, this.renderer.smuflMetrics.pedalLineThickness);
                        }
                    } else {
                        const nextX = cx + this.x + this.width;
                        const startX = markerX + linePadding;
                        canvas.fillRect(startX, y + h - this.renderer.smuflMetrics.pedalLineThickness, nextX - startX, this.renderer.smuflMetrics.pedalLineThickness);
                    }
                }

                // line from bar start to initial marker
                if (markerIndex === 0 && marker.previousPedalMarker) {
                    const startX = cx + this.x;
                    const endX = markerX - linePadding;
                    canvas.fillRect(startX, y + h - this.renderer.smuflMetrics.pedalLineThickness, endX - startX, this.renderer.smuflMetrics.pedalLineThickness);
                }

                markerIndex++;

                if (marker.nextPedalMarker != null && marker.nextPedalMarker.bar !== marker.bar) {
                    marker = null;
                    markerIndex = markers.length;
                } else {
                    marker = marker.nextPedalMarker;
                }
            }
        }
    }
}
