import { GlyphGroup } from '@src/rendering/glyphs/GlyphGroup';
import type { ScoreBarRenderer } from '@src/rendering/ScoreBarRenderer';
import { ModelUtils } from '@src/model/ModelUtils';
import { FingeringMode } from '@src/NotationSettings';
import { TextGlyph } from '@src/rendering/glyphs/TextGlyph';
import { ElementStyleHelper } from '@src/rendering/utils/ElementStyleHelper';
import { type Note, NoteSubElement } from '@src/model/Note';
import { TextAlign, TextBaseline } from '@src/platform/ICanvas';
import type { Color } from '@src/model/Color';

export class FingeringInfo {
    public line: number = 0;
    public text: string;
    public color: Color | undefined;

    public constructor(line: number, text: string) {
        this.line = line;
        this.text = text;
    }
}

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

        const textLeft = ModelUtils.fingerToString(this.renderer.settings, note.beat, note.leftHandFinger, true);
        if (textLeft) {
            this.addFinger(note, textLeft);
        }
        const textRight = ModelUtils.fingerToString(this.renderer.settings, note.beat, note.rightHandFinger, false);
        if (textRight) {
            this.addFinger(note, textRight);
        }
    }

    private addFinger(note: Note, text: string) {
        const sr = this.renderer as ScoreBarRenderer;
        const line: number = sr.getNoteLine(note);

        if (!this._infos.has(line)) {
            const info = new FingeringInfo(line, text);
            info.color = ElementStyleHelper.noteColor(sr.resources, NoteSubElement.StandardNotationEffects, note);
            this._infos.set(line, info);
        } else {
            const info = this._infos.get(line)!;
            info.text += text;
        }
    }

    public override doLayout(): void {
        const sr: ScoreBarRenderer = this.renderer as ScoreBarRenderer;

        for (const [_, info] of this._infos) {
            const g = new TextGlyph(
                0,
                0,
                info.text,
                sr.resources.inlineFingeringFont,
                TextAlign.Left,
                TextBaseline.Middle
            );
            g.colorOverride = info.color;
            g.renderer = sr;
            g.y = sr.getScoreY(info.line);
            g.doLayout();
            this.addGlyph(g);
            this.width = Math.max(this.width, g.width);
        }
    }
}
