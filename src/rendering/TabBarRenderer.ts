import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { Duration } from '@src/model/Duration';
import { GraceType } from '@src/model/GraceType';
import { TupletGroup } from '@src/model/TupletGroup';
import { Voice } from '@src/model/Voice';
import { TabRhythmMode } from '@src/NotationSettings';
import { ICanvas, TextAlign, TextBaseline } from '@src/platform/ICanvas';
import { BarRendererBase, NoteYPosition } from '@src/rendering/BarRendererBase';
import { BarNumberGlyph } from '@src/rendering/glyphs/BarNumberGlyph';
import { BarSeperatorGlyph } from '@src/rendering/glyphs/BarSeperatorGlyph';
import { FlagGlyph } from '@src/rendering/glyphs/FlagGlyph';
import { RepeatCloseGlyph } from '@src/rendering/glyphs/RepeatCloseGlyph';
import { RepeatCountGlyph } from '@src/rendering/glyphs/RepeatCountGlyph';
import { RepeatOpenGlyph } from '@src/rendering/glyphs/RepeatOpenGlyph';
import { SpacingGlyph } from '@src/rendering/glyphs/SpacingGlyph';
import { TabBeatContainerGlyph } from '@src/rendering/glyphs/TabBeatContainerGlyph';
import { TabBeatGlyph } from '@src/rendering/glyphs/TabBeatGlyph';
import { TabBeatPreNotesGlyph } from '@src/rendering/glyphs/TabBeatPreNotesGlyph';
import { TabClefGlyph } from '@src/rendering/glyphs/TabClefGlyph';
import { TabNoteChordGlyph } from '@src/rendering/glyphs/TabNoteChordGlyph';
import { TabTimeSignatureGlyph } from '@src/rendering/glyphs/TabTimeSignatureGlyph';
import { VoiceContainerGlyph } from '@src/rendering/glyphs/VoiceContainerGlyph';
import { ScoreRenderer } from '@src/rendering/ScoreRenderer';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { BeamingHelper } from '@src/rendering/utils/BeamingHelper';
import { RenderingResources } from '@src/RenderingResources';
import { ModelUtils } from '@src/model/ModelUtils';
import { ReservedLayoutAreaSlot } from './utils/BarCollisionHelper';

/**
 * This BarRenderer renders a bar using guitar tablature notation
 */
export class TabBarRenderer extends BarRendererBase {
    public static readonly StaffId: string = 'tab';
    public static readonly TabLineSpacing: number = 10;

    private _firstLineY: number = 0;

    private _tupletSize: number = 0;

    public showTimeSignature: boolean = false;
    public showRests: boolean = false;
    public showTiedNotes: boolean = false;

    public constructor(renderer: ScoreRenderer, bar: Bar) {
        super(renderer, bar);
    }

    public get lineOffset(): number {
        return (TabBarRenderer.TabLineSpacing + 1) * this.scale;
    }

    protected updateSizes(): void {
        let res: RenderingResources = this.resources;
        let numberOverflow: number = (res.tablatureFont.size / 2 + res.tablatureFont.size * 0.2) * this.scale;
        this.topPadding = numberOverflow;
        this.bottomPadding = numberOverflow;
        this.height = this.lineOffset * (this.bar.staff.tuning.length - 1) + numberOverflow * 2;
        if (this.settings.notation.rhythmMode !== TabRhythmMode.Hidden) {
            this.height += this.settings.notation.rhythmHeight * this.settings.display.scale;
            this.bottomPadding += this.settings.notation.rhythmHeight * this.settings.display.scale;
        }

        this.updateFirstLineY();

        super.updateSizes();
    }

    private updateFirstLineY() {
        let res: RenderingResources = this.resources;
        this._firstLineY = (res.tablatureFont.size / 2 + res.tablatureFont.size * 0.2) * this.scale;
    }

    public doLayout(): void {
        this.updateFirstLineY();
        super.doLayout();
        if (this.settings.notation.rhythmMode !== TabRhythmMode.Hidden) {
            let hasTuplets: boolean = false;
            for (let voice of this.bar.voices) {
                if (this.hasVoiceContainer(voice)) {
                    let c: VoiceContainerGlyph = this.getVoiceContainer(voice)!;
                    if (c.tupletGroups.length > 0) {
                        hasTuplets = true;
                        break;
                    }
                }
            }
            if (hasTuplets) {
                this._tupletSize = this.resources.effectFont.size * 0.8;
                this.registerOverflowBottom(this._tupletSize);
            }
        }
    }

    protected createPreBeatGlyphs(): void {
        super.createPreBeatGlyphs();
        if (this.bar.masterBar.isRepeatStart) {
            this.addPreBeatGlyph(new RepeatOpenGlyph(0, 0, 1.5, 3));
        }
        // Clef
        if (this.isFirstOfLine) {
            let center: number = (this.bar.staff.tuning.length - 1) / 2;
            this.addPreBeatGlyph(new TabClefGlyph(5 * this.scale, this.getTabY(center)));
        }
        // Time Signature
        if (
            this.showTimeSignature &&
            (!this.bar.previousBar ||
                (this.bar.previousBar &&
                    this.bar.masterBar.timeSignatureNumerator !==
                    this.bar.previousBar.masterBar.timeSignatureNumerator) ||
                (this.bar.previousBar &&
                    this.bar.masterBar.timeSignatureDenominator !==
                    this.bar.previousBar.masterBar.timeSignatureDenominator))
        ) {
            this.createStartSpacing();
            this.createTimeSignatureGlyphs();
        }
        this.addPreBeatGlyph(new BarNumberGlyph(0, this.getTabHeight(-0.5), this.bar.index + 1));
    }

    private _startSpacing: boolean = false;

    private createStartSpacing(): void {
        if (this._startSpacing) {
            return;
        }
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 2 * this.scale));
        this._startSpacing = true;
    }

    private createTimeSignatureGlyphs(): void {
        this.addPreBeatGlyph(new SpacingGlyph(0, 0, 5 * this.scale));

        const lines = ((this.bar.staff.tuning.length + 1) / 2) - 1;
        this.addPreBeatGlyph(
            new TabTimeSignatureGlyph(
                0,
                this.getTabY(lines),
                this.bar.masterBar.timeSignatureNumerator,
                this.bar.masterBar.timeSignatureDenominator,
                this.bar.masterBar.timeSignatureCommon
            )
        );
    }

    protected createVoiceGlyphs(v: Voice): void {
        for (let i: number = 0, j: number = v.beats.length; i < j; i++) {
            let b: Beat = v.beats[i];
            let container: TabBeatContainerGlyph = new TabBeatContainerGlyph(b, this.getVoiceContainer(v)!);
            container.preNotes = new TabBeatPreNotesGlyph();
            container.onNotes = new TabBeatGlyph();
            this.addBeatGlyph(container);
        }
    }

    protected createPostBeatGlyphs(): void {
        super.createPostBeatGlyphs();
        if (this.bar.masterBar.isRepeatEnd) {
            this.addPostBeatGlyph(new RepeatCloseGlyph(this.x, 0));
            if (this.bar.masterBar.repeatCount > 2) {
                this.addPostBeatGlyph(new RepeatCountGlyph(0, this.getTabY(-1), this.bar.masterBar.repeatCount));
            }
        } else {
            this.addPostBeatGlyph(new BarSeperatorGlyph(0, 0));
        }
    }

    /**
     * Gets the relative y position of the given steps relative to first line.
     * @param line the line of the particular string where 0 is the most top line
     * @param correction
     * @returns
     */
    public getTabY(line: number): number {
        return this._firstLineY + this.getTabHeight(line);
    }

    public getTabHeight(line: number): number {
        return this.lineOffset * line;
    }

    public get middleYPosition(): number {
        return this.getTabY(this.bar.staff.tuning.length - 1);
    }

    protected paintBackground(cx: number, cy: number, canvas: ICanvas): void {
        super.paintBackground(cx, cy, canvas);
        let res: RenderingResources = this.resources;
        //
        // draw string lines
        //
        canvas.color = res.staffLineColor;
        let padding: number = this.scale;
        // collect tab note position for spaces
        let tabNotes: Float32Array[][] = [];
        for (let i: number = 0, j: number = this.bar.staff.tuning.length; i < j; i++) {
            tabNotes.push([]);
        }

        for (let voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                let vc: VoiceContainerGlyph = this.getVoiceContainer(voice)!;
                for (let bg of vc.beatGlyphs) {
                    let notes: TabBeatGlyph = bg.onNotes as TabBeatGlyph;
                    let noteNumbers: TabNoteChordGlyph | null = notes.noteNumbers;
                    if (noteNumbers) {
                        for(const [str, noteNumber] of noteNumbers.notesPerString) {
                            if (!noteNumber.isEmpty) {
                                tabNotes[this.bar.staff.tuning.length - str].push(
                                    new Float32Array([
                                        vc.x + bg.x + notes.x + noteNumbers!.x,
                                        noteNumbers!.width + padding
                                    ])
                                );
                            }
                        }
                    }
                }
            }
        }
        // if we have multiple voices we need to sort by X-position, otherwise have a wild mix in the list
        // but painting relies on ascending X-position
        for (let line of tabNotes) {
            line.sort((a, b) => {
                return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
            });
        }
        for (let i: number = 0, j: number = this.bar.staff.tuning.length; i < j; i++) {
            const lineY = this.getTabY(i);
            let lineX: number = 0;
            for (let line of tabNotes[i]) {
                canvas.fillRect(cx + this.x + lineX, cy + this.y + lineY | 0, line[0] - lineX, this.scale * BarRendererBase.StaffLineThickness);
                lineX = line[0] + line[1];
            }
            canvas.fillRect(cx + this.x + lineX, cy + this.y + lineY | 0, this.width - lineX, this.scale * BarRendererBase.StaffLineThickness);
        }

        canvas.color = res.mainGlyphColor;
        this.paintSimileMark(cx, cy, canvas);
    }

    public paint(cx: number, cy: number, canvas: ICanvas): void {
        super.paint(cx, cy, canvas);
        if (this.settings.notation.rhythmMode !== TabRhythmMode.Hidden) {
            this.paintBeams(cx, cy, canvas);
            this.paintTuplets(cx, cy, canvas);
        }
    }

    private paintBeams(cx: number, cy: number, canvas: ICanvas): void {
        for (let i: number = 0, j: number = this.helpers.beamHelpers.length; i < j; i++) {
            let v: BeamingHelper[] = this.helpers.beamHelpers[i];
            for (let k: number = 0, l: number = v.length; k < l; k++) {
                let h: BeamingHelper = v[k];
                this.paintBeamHelper(cx + this.beatGlyphsStart, cy, canvas, h);
            }
        }
    }

    private paintTuplets(cx: number, cy: number, canvas: ICanvas): void {
        for (let voice of this.bar.voices) {
            if (this.hasVoiceContainer(voice)) {
                let container: VoiceContainerGlyph = this.getVoiceContainer(voice)!;
                for (let tupletGroup of container.tupletGroups) {
                    this.paintTupletHelper(cx + this.beatGlyphsStart, cy, canvas, tupletGroup);
                }
            }
        }
    }

    private paintBeamHelper(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        canvas.color = h.voice!.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        // check if we need to paint simple footer
        if (!h.isRestBeamHelper) {
            if (h.beats.length === 1 || this.settings.notation.rhythmMode === TabRhythmMode.ShowWithBeams) {
                this.paintFooter(cx, cy, canvas, h);
            } else {
                this.paintBar(cx, cy, canvas, h);
            }
        }
    }

    private paintBar(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
            let beat: Beat = h.beats[i];
            if (h.hasBeatLineX(beat)) {
                //
                // draw line
                //
                let beatLineX: number = h.getBeatLineX(beat);
                let y1: number = cy + this.y;
                let y2: number = cy + this.y + this.height - this._tupletSize;
                let startGlyph: TabBeatGlyph = this.getOnNotesGlyphForBeat(beat) as TabBeatGlyph;
                if (!startGlyph.noteNumbers) {
                    y1 +=
                        this.height -
                        this.settings.notation.rhythmHeight * this.settings.display.scale -
                        this._tupletSize;
                } else {
                    y1 +=
                        startGlyph.noteNumbers.getNoteY(startGlyph.noteNumbers.minStringNote!, NoteYPosition.Bottom) +
                        this.lineOffset / 2;
                }

                this.paintBeamingStem(beat, cy + this.y, cx + this.x + beatLineX, y1, y2, canvas);
                let brokenBarOffset: number = 6 * this.scale;
                let barSpacing: number = -6 * this.scale;
                let barSize: number = 3 * this.scale;
                let barCount: number = ModelUtils.getIndex(beat.duration) - 2;
                let barStart: number = y2;
                for (let barIndex: number = 0; barIndex < barCount; barIndex++) {
                    let barStartX: number = 0;
                    let barEndX: number = 0;
                    let barStartY: number = 0;
                    let barEndY: number = 0;
                    let barY: number = barStart + barIndex * barSpacing;
                    //
                    // Broken Bar to Next
                    //
                    if (h.beats.length === 1) {
                        barStartX = beatLineX;
                        barEndX = beatLineX + brokenBarOffset;
                        barStartY = barY;
                        barEndY = barY;
                        TabBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );
                    } else if (i < h.beats.length - 1) {
                        // full bar?
                        if (BeamingHelper.isFullBarJoin(beat, h.beats[i + 1], barIndex)) {
                            barStartX = beatLineX;
                            barEndX = h.getBeatLineX(h.beats[i + 1]);
                        } else if (i === 0 || !BeamingHelper.isFullBarJoin(h.beats[i - 1], beat, barIndex)) {
                            barStartX = beatLineX;
                            barEndX = barStartX + brokenBarOffset;
                        } else {
                            continue;
                        }
                        barStartY = barY;
                        barEndY = barY;
                        TabBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );
                    } else if (i > 0 && !BeamingHelper.isFullBarJoin(beat, h.beats[i - 1], barIndex)) {
                        barStartX = beatLineX - brokenBarOffset;
                        barEndX = beatLineX;
                        barStartY = barY;
                        barEndY = barY;
                        TabBarRenderer.paintSingleBar(
                            canvas,
                            cx + this.x + barStartX,
                            barStartY,
                            cx + this.x + barEndX,
                            barEndY,
                            barSize
                        );
                    }
                }
            }
        }
    }

    private paintTupletHelper(cx: number, cy: number, canvas: ICanvas, h: TupletGroup): void {
        let res: RenderingResources = this.resources;
        let oldAlign: TextAlign = canvas.textAlign;
        let oldBaseLine = canvas.textBaseline;
        canvas.color = h.voice.index === 0 ? this.resources.mainGlyphColor : this.resources.secondaryGlyphColor;
        canvas.textAlign = TextAlign.Center;
        canvas.textBaseline = TextBaseline.Middle;
        let s: string;
        let num: number = h.beats[0].tupletNumerator;
        let den: number = h.beats[0].tupletDenominator;
        // list as in Guitar Pro 7. for certain tuplets only the numerator is shown
        if (num === 2 && den === 3) {
            s = '2';
        } else if (num === 3 && den === 2) {
            s = '3';
        } else if (num === 4 && den === 6) {
            s = '4';
        } else if (num === 5 && den === 4) {
            s = '5';
        } else if (num === 6 && den === 4) {
            s = '6';
        } else if (num === 7 && den === 4) {
            s = '7';
        } else if (num === 9 && den === 8) {
            s = '9';
        } else if (num === 10 && den === 8) {
            s = '10';
        } else if (num === 11 && den === 8) {
            s = '11';
        } else if (num === 12 && den === 8) {
            s = '12';
        } else if (num === 13 && den === 8) {
            s = '13';
        } else {
            s = num + ':' + den;
        }
        // check if we need to paint simple footer
        if (h.beats.length === 1 || !h.isFull) {
            for (let i: number = 0, j: number = h.beats.length; i < j; i++) {
                let beat: Beat = h.beats[i];
                let beamingHelper: BeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(beat.index)!;
                if (!beamingHelper) {
                    continue;
                }
                let tupletX: number = beamingHelper.getBeatLineX(beat);
                let tupletY: number = cy + this.y + this.height - this._tupletSize + res.effectFont.size * 0.5;
                canvas.font = res.effectFont;
                canvas.fillText(s, cx + this.x + tupletX, tupletY);
            }
        } else {
            let firstBeat: Beat = h.beats[0];
            let lastBeat: Beat = h.beats[h.beats.length - 1];
            let firstBeamingHelper: BeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(firstBeat.index)!;
            let lastBeamingHelper: BeamingHelper = this.helpers.beamHelperLookup[h.voice.index].get(lastBeat.index)!;
            if (firstBeamingHelper && lastBeamingHelper) {
                //
                // Calculate the overall area of the tuplet bracket
                let startX: number = firstBeamingHelper.getBeatLineX(firstBeat);
                let endX: number = lastBeamingHelper.getBeatLineX(lastBeat);
                //
                // Calculate how many space the text will need
                canvas.font = res.effectFont;
                let sw: number = canvas.measureText(s);
                let sp: number = 3 * this.scale;
                //
                // Calculate the offsets where to break the bracket
                let middleX: number = (startX + endX) / 2;
                let offset1X: number = middleX - sw / 2 - sp;
                let offset2X: number = middleX + sw / 2 + sp;
                //
                // calculate the y positions for our bracket
                let startY: number = cy + this.y + this.height - this._tupletSize + res.effectFont.size * 0.5;
                let offset: number = -res.effectFont.size * 0.25;
                let size: number = -5 * this.scale;
                //
                // draw the bracket
                canvas.beginPath();
                canvas.moveTo(cx + this.x + startX, (startY - offset) | 0);
                canvas.lineTo(cx + this.x + startX, (startY - offset - size) | 0);
                canvas.lineTo(cx + this.x + offset1X, (startY - offset - size) | 0);
                canvas.stroke();
                canvas.beginPath();
                canvas.moveTo(cx + this.x + offset2X, (startY - offset - size) | 0);
                canvas.lineTo(cx + this.x + endX, (startY - offset - size) | 0);
                canvas.lineTo(cx + this.x + endX, (startY - offset) | 0);
                canvas.stroke();
                //
                // Draw the string
                canvas.fillText(s, cx + this.x + middleX, startY - offset - size);
            }
        }
        canvas.textAlign = oldAlign;
        canvas.textBaseline = oldBaseLine;
    }

    private static paintSingleBar(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number, size: number): void {
        canvas.beginPath();
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.lineTo(x2, y2 - size);
        canvas.lineTo(x1, y1 - size);
        canvas.closePath();
        canvas.fill();
    }

    private paintBeamingStem(beat: Beat, cy: number, x: number, topY: number, bottomY: number, canvas: ICanvas) {
        canvas.beginPath();

        let holes: ReservedLayoutAreaSlot[] = [];
        if (this.helpers.collisionHelper.reservedLayoutAreasByDisplayTime.has(beat.displayStart)) {
            holes = this.helpers.collisionHelper.reservedLayoutAreasByDisplayTime.get(beat.displayStart)!.slots.slice();
            holes.sort((a, b) => a.topY - b.topY);
        }

        let y = bottomY;
        while (y > topY) {
            canvas.moveTo(x, y);

            let lineY = topY;
            // draw until next hole
            if (holes.length > 0) {
                const bottomHole = holes.pop()!;
                lineY = cy + bottomHole.bottomY;
                canvas.lineTo(x, lineY);
                y = cy + bottomHole.topY;
            } else {
                canvas.lineTo(x, topY);
                break;
            }
        }
        canvas.stroke();
    }

    private paintFooter(cx: number, cy: number, canvas: ICanvas, h: BeamingHelper): void {
        for (let beat of h.beats) {
            if (
                beat.graceType !== GraceType.None ||
                beat.duration === Duration.Whole ||
                beat.duration === Duration.DoubleWhole ||
                beat.duration === Duration.QuadrupleWhole
            ) {
                return;
            }
            //
            // draw line
            //
            let beatLineX: number = h.getBeatLineX(beat);
            let y1: number = cy + this.y;
            let y2: number = cy + this.y + this.height - this._tupletSize;
            let startGlyph: TabBeatGlyph = this.getOnNotesGlyphForBeat(beat) as TabBeatGlyph;
            if (!startGlyph.noteNumbers) {
                y1 +=
                    this.height - this.settings.notation.rhythmHeight * this.settings.display.scale - this._tupletSize;
            } else {
                y1 +=
                    startGlyph.noteNumbers.getNoteY(startGlyph.noteNumbers.minStringNote!, NoteYPosition.Bottom);
            }

            this.paintBeamingStem(beat, cy + this.y, cx + this.x + beatLineX, y1, y2, canvas);

            //
            // Draw Flag
            //
            if (beat.duration > Duration.Quarter) {
                let glyph: FlagGlyph = new FlagGlyph(0, 0, beat.duration, BeamDirection.Down, false);
                glyph.renderer = this;
                glyph.doLayout();
                glyph.paint(cx + this.x + beatLineX, y2, canvas);
            }
        }
    }
}
