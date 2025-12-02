import { GlyphGroup } from '@coderline/alphatab/rendering/glyphs/GlyphGroup';
import type { ScoreBarRenderer } from '@coderline/alphatab/rendering/ScoreBarRenderer';
import { FingeringMode } from '@coderline/alphatab/NotationSettings';
import { ElementStyleHelper } from '@coderline/alphatab/rendering/utils/ElementStyleHelper';
import { type Note, NoteSubElement } from '@coderline/alphatab/model/Note';
import type { Color } from '@coderline/alphatab/model/Color';
import { MusicFontTextGlyph } from '@coderline/alphatab/rendering/glyphs/MusicFontGlyph';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Settings } from '@coderline/alphatab/Settings';
import type { Beat } from '@coderline/alphatab/model/Beat';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { GeneralMidi } from '@coderline/alphatab/midi/GeneralMidi';

/**
 * @internal
 */
export class FingeringInfo {
    public line: number = 0;
    public symbols: MusicFontSymbol[];
    public color: Color | undefined;

    public constructor(line: number, symbols: MusicFontSymbol[]) {
        this.line = line;
        this.symbols = symbols;
    }
}

/**
 * @internal
 */
export class FingeringGroupGlyph extends GlyphGroup {
    private _infos: Map<number, FingeringInfo> = new Map<number, FingeringInfo>();

    public constructor() {
        super(0, 0);
    }

    public override get isEmpty(): boolean {
        return this._infos.size === 0;
    }

    public addFingers(note: Note) {
        const settings = this.renderer.settings;
        if (
            settings.notation.fingeringMode !== FingeringMode.ScoreDefault &&
            settings.notation.fingeringMode !== FingeringMode.ScoreForcePiano
        ) {
            return;
        }

        const symbolLeft = FingeringGroupGlyph.fingerToMusicFontSymbol(
            this.renderer.settings,
            note.beat,
            note.leftHandFinger,
            true
        );
        if (symbolLeft !== MusicFontSymbol.None) {
            this._addFinger(note, symbolLeft);
        }
        const symbolRight = FingeringGroupGlyph.fingerToMusicFontSymbol(
            this.renderer.settings,
            note.beat,
            note.rightHandFinger,
            false
        );
        if (symbolRight !== MusicFontSymbol.None) {
            this._addFinger(note, symbolRight);
        }
    }

    public static fingerToMusicFontSymbol(
        settings: Settings,
        beat: Beat,
        finger: Fingers,
        leftHand: boolean
    ): MusicFontSymbol {
        if (
            settings.notation.fingeringMode === FingeringMode.ScoreForcePiano ||
            settings.notation.fingeringMode === FingeringMode.SingleNoteEffectBandForcePiano ||
            GeneralMidi.isPiano(beat.voice.bar.staff.track.playbackInfo.program)
        ) {
            switch (finger) {
                case Fingers.Unknown:
                case Fingers.NoOrDead:
                    return MusicFontSymbol.None;
                case Fingers.Thumb:
                    return MusicFontSymbol.Fingering1;
                case Fingers.IndexFinger:
                    return MusicFontSymbol.Fingering2;
                case Fingers.MiddleFinger:
                    return MusicFontSymbol.Fingering3;
                case Fingers.AnnularFinger:
                    return MusicFontSymbol.Fingering4;
                case Fingers.LittleFinger:
                    return MusicFontSymbol.Fingering5;
                default:
                    return MusicFontSymbol.None;
            }
        }
        if (leftHand) {
            switch (finger) {
                case Fingers.Unknown:
                    return MusicFontSymbol.None;
                case Fingers.NoOrDead:
                    return MusicFontSymbol.Fingering0;
                case Fingers.Thumb:
                    return MusicFontSymbol.FingeringTLower;
                case Fingers.IndexFinger:
                    return MusicFontSymbol.Fingering1;
                case Fingers.MiddleFinger:
                    return MusicFontSymbol.Fingering2;
                case Fingers.AnnularFinger:
                    return MusicFontSymbol.Fingering3;
                case Fingers.LittleFinger:
                    return MusicFontSymbol.Fingering4;
                default:
                    return MusicFontSymbol.None;
            }
        }
        switch (finger) {
            case Fingers.Unknown:
            case Fingers.NoOrDead:
                return MusicFontSymbol.None;
            case Fingers.Thumb:
                return MusicFontSymbol.FingeringPLower;
            case Fingers.IndexFinger:
                return MusicFontSymbol.FingeringILower;
            case Fingers.MiddleFinger:
                return MusicFontSymbol.FingeringMLower;
            case Fingers.AnnularFinger:
                return MusicFontSymbol.FingeringALower;
            case Fingers.LittleFinger:
                return MusicFontSymbol.FingeringCLower;
            default:
                return MusicFontSymbol.None;
        }
    }

    private _addFinger(note: Note, symbol: MusicFontSymbol) {
        const sr = this.renderer as ScoreBarRenderer;
        const line: number = sr.getNoteLine(note);

        if (!this._infos.has(line)) {
            const info = new FingeringInfo(line, [symbol]);
            info.color = ElementStyleHelper.noteColor(sr.resources, NoteSubElement.StandardNotationEffects, note);
            this._infos.set(line, info);
        } else {
            const info = this._infos.get(line)!;
            info.symbols.push(symbol);
        }
    }

    public override doLayout(): void {
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;

        for (const [_, info] of this._infos) {
            const g = new MusicFontTextGlyph(0, 0, 1, info.symbols);
            g.colorOverride = info.color;
            g.renderer = sr;
            g.y = sr.getScoreY(info.line);
            g.doLayout();
            g.offsetY = g.height / 2;
            this.addGlyph(g);
            this.width = Math.max(this.width, g.width);
        }

        for (const g of this.glyphs!) {
            const m = g as MusicFontTextGlyph;
            m.x = this.width / 2;
            m.center = true;
        }
    }
}
