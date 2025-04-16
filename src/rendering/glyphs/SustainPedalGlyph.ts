import { EffectGlyph } from '@src/rendering/glyphs/EffectGlyph';
import { type SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { MusicFontSymbolSizes } from '@src/rendering/utils/MusicFontSymbolSizes';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import type { ICanvas } from '@src/platform/ICanvas';

export class SustainPedalGlyph extends EffectGlyph {
    private static readonly TextLinePadding = 3;
    private static readonly StarLinePadding = 3;

    public constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = MusicFontSymbolSizes.Heights.get(MusicFontSymbol.KeyboardPedalPed)!;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer;

        const y = cy + this.y;
        const h = this.height;

        const markers = renderer.bar.sustainPedals;

        const textWidth = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.KeyboardPedalPed)!;
        const starSize = MusicFontSymbolSizes.Widths.get(MusicFontSymbol.KeyboardPedalUp)!;

        let markerIndex = 0;
        while (markerIndex < markers.length) {
            let marker: SustainPedalMarker | null = markers[markerIndex];
            while (marker != null) {
                const markerX = cx + this.renderer.getRatioPositionX(marker.ratioPosition);

                // real own marker
                let linePadding = 0;
                if (marker.pedalType === SustainPedalMarkerType.Down) {
                    canvas.fillMusicFontSymbol(markerX, y + h, 1, MusicFontSymbol.KeyboardPedalPed, true);
                    linePadding = textWidth / 2 + SustainPedalGlyph.TextLinePadding;
                } else if (marker.pedalType === SustainPedalMarkerType.Up) {
                    canvas.fillMusicFontSymbol(markerX, y + h, 1, MusicFontSymbol.KeyboardPedalUp, true);
                    linePadding = starSize / 2 + SustainPedalGlyph.StarLinePadding;
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
                            canvas.fillRect(startX, y + h - 1, nextX - startX, 1);
                        }
                    } else {
                        const nextX = cx + this.x + this.width;
                        const startX = markerX + linePadding;
                        canvas.fillRect(startX, y + h - 1, nextX - startX, 1);
                    }
                }

                // line from bar start to initial marker
                if (markerIndex === 0 && marker.previousPedalMarker) {
                    const startX = cx + this.x;
                    const endX = markerX - linePadding;
                    canvas.fillRect(startX, y + h - 1, endX - startX, 1);
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
