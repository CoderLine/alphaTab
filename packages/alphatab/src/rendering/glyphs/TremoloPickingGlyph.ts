import { Duration } from '@coderline/alphatab/model/Duration';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { BeamDirection } from '@coderline/alphatab/rendering/_barrel';
import { type TremoloPickingEffect, TremoloPickingStyle } from '@coderline/alphatab/model/TremoloPickingEffect';
import { MusicFontGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import type { LineBarRenderer } from '@coderline/alphatab/rendering/LineBarRenderer';

/**
 * @internal
 */
export class TremoloPickingGlyph extends MusicFontGlyph {
    public constructor(x: number, y: number, effect: TremoloPickingEffect) {
        super(x, y, 1, TremoloPickingGlyph._getSymbol(effect));
    }

    private static _getSymbol(effect: TremoloPickingEffect): MusicFontSymbol {
        if (effect.style === TremoloPickingStyle.BuzzRoll) {
            return MusicFontSymbol.BuzzRoll;
        } else {
            switch (effect.marks) {
                case 1:
                    return MusicFontSymbol.Tremolo1;
                case 2:
                    return MusicFontSymbol.Tremolo2;
                case 3:
                    return MusicFontSymbol.Tremolo3;
                case 4:
                    return MusicFontSymbol.Tremolo4;
                case 5:
                    return MusicFontSymbol.Tremolo5;
                default:
                    return MusicFontSymbol.None;
            }
        }
    }

    public stemExtensionHeight = 0;

    public alignTremoloPickingGlyph(direction: BeamDirection, flagEnd: number, firstNoteY: number, duration: Duration) {
        const lr = this.renderer as LineBarRenderer;
        const smufl = lr.smuflMetrics;
        let tremoloY = 0;
        const tremoloOverlap = smufl.glyphHeights.get(MusicFontSymbol.Tremolo1)! / 2;
        const tremoloCenterOffset = this.height / 2;

        // whether the center or top bar should be aligned with a staff line
        const forceAlignWithStaffLine = this.symbol === MusicFontSymbol.Tremolo1;
        const lineSpacing = lr.lineSpacing;
        const spacing = forceAlignWithStaffLine ? lineSpacing : lineSpacing / 2;

        if (direction === BeamDirection.Up) {
            // start at note
            let flagBottom = flagEnd;

            // to bottom of stem
            flagBottom += smufl.stemFlagHeight.get(duration)!;
            flagBottom -= smufl.stemFlagOffsets.get(duration)!;

            // align with closest step line
            tremoloY = spacing * Math.ceil(flagBottom / spacing);

            // ensure at least 1 staff space distance between note and tremolo bottom bar
            const tremoloBottomY = tremoloY + tremoloCenterOffset;
            const minSpacingY = firstNoteY - lineSpacing;
            if (minSpacingY < tremoloBottomY) {
                tremoloY = minSpacingY - tremoloCenterOffset;
            }

            // reserve the additional space needed in the stem height
            flagBottom += tremoloOverlap;
            const tremoloTop = tremoloY - tremoloCenterOffset;
            if (flagBottom > tremoloTop) {
                this.stemExtensionHeight = flagBottom - tremoloTop;
            } else {
                this.stemExtensionHeight = 0;
            }
        } else {
            // same logic as above but inverted
            let flagTop = flagEnd;
            flagTop -= smufl.stemFlagHeight.get(duration)!;
            flagTop += smufl.stemFlagOffsets.get(duration)!;
            tremoloY = spacing * Math.floor(flagTop / spacing);

            const tremoloTopY = tremoloY - tremoloCenterOffset;
            const minSpacingY = firstNoteY + lineSpacing;
            if (minSpacingY > tremoloTopY) {
                tremoloY = minSpacingY + tremoloCenterOffset;
            }

            flagTop -= tremoloOverlap;
            const tremoloBottom = tremoloY + tremoloCenterOffset;
            if (flagTop < tremoloBottom) {
                this.stemExtensionHeight = tremoloBottom - flagTop;
            } else {
                this.stemExtensionHeight = 0;
            }
        }

        this.y = tremoloY;
    }
}
