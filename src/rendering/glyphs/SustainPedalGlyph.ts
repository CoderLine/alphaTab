import { ICanvas } from '@src/platform';
import { EffectGlyph } from './EffectGlyph';
import { SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { MusicFontSymbol } from '@src/model';
import { BeatXPosition } from '../BeatXPosition';

export class SustainPedalGlyph extends EffectGlyph {
    private static readonly TextHeight = 19;
    private static readonly TextWidth = 35;
    private static readonly TextLinePadding = 3;

    private static readonly StarSize = 16;
    private static readonly StarLinePadding = 3;

    public constructor() {
        super(0, 0);
    }

    public override doLayout(): void {
        super.doLayout();
        this.height = SustainPedalGlyph.TextHeight;
    }

    public override paint(cx: number, cy: number, canvas: ICanvas): void {
        const renderer = this.renderer;

        const firstOnNoteX = renderer.bar.isEmpty
            ? renderer.beatGlyphsStart
            : renderer.getBeatX(renderer.bar.voices[0].beats[0], BeatXPosition.OnNotes);

        const x = cx + this.x + firstOnNoteX;
        const y = cy + this.y;
        const w = renderer.postBeatGlyphsStart - firstOnNoteX;
        const h = this.height;

        let markers = renderer.bar.sustainPedals;

        let markerIndex = 0;
        while (markerIndex < markers.length) {
            let marker: SustainPedalMarker | null = markers[markerIndex];
            while (marker != null) {
                const markerX = x + w * marker.ratioPosition;

                // real own marker
                let linePadding = 0;
                if (marker.pedalType === SustainPedalMarkerType.Down) {
                    canvas.fillMusicFontSymbol(markerX, y + h, 1, MusicFontSymbol.KeyboardPedalPed, true);
                    linePadding =
                        (SustainPedalGlyph.TextWidth / 2) + SustainPedalGlyph.TextLinePadding;
                } else if (marker.pedalType === SustainPedalMarkerType.Up) {
                    canvas.fillMusicFontSymbol(markerX, y + h, 1, MusicFontSymbol.KeyboardPedalUp, true);
                    linePadding =
                        (SustainPedalGlyph.StarSize / 2) + SustainPedalGlyph.StarLinePadding;
                }

                // line to next marker or end-of-bar
                if (marker.nextPedalMarker) {
                    if (marker.nextPedalMarker.bar === marker.bar) {
                        let nextX = x + w * marker.nextPedalMarker.ratioPosition;

                        switch (marker.nextPedalMarker.pedalType) {
                            case SustainPedalMarkerType.Down:
                                nextX -= (SustainPedalGlyph.TextWidth / 2);
                                break;
                            case SustainPedalMarkerType.Hold:
                                // no offset on hold
                                break;
                            case SustainPedalMarkerType.Up:
                                nextX -= (SustainPedalGlyph.StarSize / 2);
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
