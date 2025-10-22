/*
 * This file contains a copy of the "old" alphaTex importer
 * it was never released but battle tested during implementation
 */
import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { Environment } from '@src/Environment';
import { ScoreExporter } from '@src/exporter/ScoreExporter';
import { IOHelper } from '@src/io/IOHelper';
import { GeneralMidi } from '@src/midi/GeneralMidi';
import { AccentuationType } from '@src/model/AccentuationType';
import { AutomationType } from '@src/model/Automation';
import { type Bar, BarLineStyle, SustainPedalMarkerType } from '@src/model/Bar';
import { BarreShape } from '@src/model/BarreShape';
import { type Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendStyle } from '@src/model/BendStyle';
import { BendType } from '@src/model/BendType';
import { BrushType } from '@src/model/BrushType';
import type { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Direction } from '@src/model/Direction';
import { DynamicValue } from '@src/model/DynamicValue';
import { FadeType } from '@src/model/FadeType';
import { FermataType } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GolpeType } from '@src/model/GolpeType';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import type { MasterBar } from '@src/model/MasterBar';
import { ModelUtils } from '@src/model/ModelUtils';
import type { Note } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Ottavia } from '@src/model/Ottavia';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { PickStroke } from '@src/model/PickStroke';
import { Rasgueado } from '@src/model/Rasgueado';
import {
    BracketExtendMode,
    type RenderStylesheet,
    TrackNameMode,
    TrackNameOrientation,
    TrackNamePolicy
} from '@src/model/RenderStylesheet';
import { Score } from '@src/model/Score';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { Tuning } from '@src/model/Tuning';
import { VibratoType } from '@src/model/VibratoType';
import type { Voice } from '@src/model/Voice';
import { WahPedal } from '@src/model/WahPedal';
import { WhammyType } from '@src/model/WhammyType';
import { BeamDirection } from '@src/rendering/_barrel';
import { Settings } from '@src/Settings';

/**
 * @internal
 */
class WriterGroup {
    start: string = '';
    end: string = '';
    comment: string = '';
    hasContent: boolean = false;
}

/**
 * A small helper to write formatted alphaTex code to a string buffer.
 * @internal
 */
class AlphaTexWriterOld {
    public tex: string = '';
    public isStartOfLine: boolean = true;
    public indentString: string = '';
    public currentIndent: number = 0;

    public comments: boolean = false;

    private _groups: WriterGroup[] = [];
    private _singleLineComment: string = '';

    public beginGroup(groupStart: string, groupEnd: string, comment: string = '') {
        const group = new WriterGroup();
        group.start = groupStart;
        group.end = groupEnd;
        group.comment = comment;
        this._groups.push(group);
    }

    public writeSingleLineComment(text: string, onlyIfContent: boolean = false) {
        if (this.comments && text) {
            if (onlyIfContent) {
                this._singleLineComment = `// ${text}`;
            } else {
                this.writeLine(`// ${text}`);
            }
        }
    }

    public dropSingleLineComment() {
        this._singleLineComment = '';
    }

    public writeInlineComment(text: string) {
        if (this.comments && text) {
            this.write(`/* ${text} */`);
        }
    }

    public endGroup() {
        const topGroup = this._groups.pop()!;
        if (topGroup.hasContent) {
            this.write(topGroup.end);
        }
    }

    public indent() {
        if (this.indentString.length > 0) {
            this.currentIndent++;
        }
    }

    public outdent() {
        if (this.indentString.length > 0) {
            this.currentIndent--;
        }
    }

    private _preWrite() {
        if (this._singleLineComment) {
            const comment = this._singleLineComment;
            this._singleLineComment = '';
            this.writeLine(comment);
        }

        // indent if needed
        if (this.isStartOfLine && this.indentString.length > 0) {
            for (let i = 0; i < this.currentIndent; i++) {
                this.tex += this.indentString;
            }
        }
        this.isStartOfLine = false;

        if (this._singleLineComment) {
            this.tex += this._singleLineComment;
        }

        // start group
        if (this._groups.length > 0) {
            const groups = this._groups[this._groups.length - 1];
            if (!groups.hasContent) {
                groups.hasContent = true;
                this.tex += groups.start;
                if (this.comments) {
                    this.writeInlineComment(groups.comment);
                }
            }
        }
    }

    public write(text: string) {
        this._preWrite();
        this.tex += text;
        this.isStartOfLine = false;
    }

    public writeGroupItem(text: any) {
        if (this._groups.length === 0) {
            throw new AlphaTabError(
                AlphaTabErrorType.General,
                'Wrong usage of writeGroupItem, this is an internal error.'
            );
        }

        const hasContent = this._groups[this._groups.length - 1].hasContent;
        this._preWrite();

        if (hasContent) {
            this.tex += ' ';
        }
        this.tex += text;
        this.isStartOfLine = false;
    }

    public writeString(text: string) {
        this._preWrite();
        this.tex += Environment.quoteJsonString(text);
        this.tex += ' ';
    }

    public writeStringMeta(tag: string, value: string, writeIfEmpty: boolean = false) {
        if (value.length === 0 && !writeIfEmpty) {
            return;
        }

        this._preWrite();
        this.tex += `\\${tag} `;
        this.tex += Environment.quoteJsonString(value);
        this.writeLine();
    }

    public writeMeta(tag: string, value?: string) {
        this._preWrite();
        this.tex += `\\${tag} `;
        if (value) {
            this.tex += value;
        }
        this.writeLine();
    }

    public writeLine(text?: string) {
        this._preWrite();
        if (text !== undefined) {
            this.tex += text;
        }

        // if not formatted, only add a space at the end
        if (this.indentString.length > 0) {
            this.tex += '\n';
        } else if (!this.tex.endsWith(' ')) {
            this.tex += ' ';
        }
        this.isStartOfLine = true;
    }
}

/**
 * This ScoreExporter can write alphaTex strings.
 * @internal
 */
export class AlphaTexExporterOld extends ScoreExporter {
    // used to lookup some default values.
    private static readonly _defaultScore = new Score();
    private static readonly _defaultTrack = new Track();

    public get name(): string {
        return 'alphaTex (old)';
    }

    public exportToString(score: Score, settings: Settings | null = null) {
        this.settings = settings ?? new Settings();
        return this.scoreToAlphaTexString(score);
    }

    public writeScore(score: Score) {
        const raw = IOHelper.stringToBytes(this.scoreToAlphaTexString(score));
        this.data.write(raw, 0, raw.length);
    }

    public scoreToAlphaTexString(score: Score): string {
        const writer = new AlphaTexWriterOld();
        writer.comments = this.settings.exporter.comments;
        writer.indentString = this.settings.exporter.indent > 0 ? ' '.repeat(this.settings.exporter.indent) : '';
        this._writeScoreTo(writer, score);
        return writer.tex;
    }

    private _writeScoreTo(writer: AlphaTexWriterOld, score: Score) {
        writer.writeSingleLineComment('Score Metadata');
        writer.writeStringMeta('album', score.album);
        writer.writeStringMeta('artist', score.artist);
        writer.writeStringMeta('copyright', score.copyright);
        writer.writeStringMeta('instructions', score.instructions);
        writer.writeStringMeta('music', score.music);
        writer.writeStringMeta('notices', score.notices);
        writer.writeStringMeta('subtitle', score.subTitle);
        writer.writeStringMeta('title', score.title);
        writer.writeStringMeta('words', score.words);
        writer.writeStringMeta('tab', score.tab);
        writer.write(`\\tempo ${score.tempo} `);
        if (score.tempoLabel) {
            writer.writeString(score.tempoLabel);
        }
        writer.writeLine();

        if (score.defaultSystemsLayout !== AlphaTexExporterOld._defaultScore.defaultSystemsLayout) {
            writer.writeMeta('defaultSystemsLayout', `${score.defaultSystemsLayout}`);
        }
        if (score.systemsLayout.length > 0) {
            writer.writeMeta('systemsLayout', score.systemsLayout.join(' '));
        }

        this._writeStyleSheetTo(writer, score.stylesheet);
        writer.writeLine('.');

        // Unsupported:
        // - style

        for (const track of score.tracks) {
            writer.writeLine();
            this._writeTrackTo(writer, track);
        }

        const flatSyncPoints = score.exportFlatSyncPoints();
        if (flatSyncPoints.length > 0) {
            writer.writeLine('.');
            for (const p of flatSyncPoints) {
                if (p.barPosition > 0) {
                    writer.writeMeta('sync', `${p.barIndex} ${p.barOccurence} ${p.millisecondOffset}`);
                } else {
                    writer.writeMeta('sync', `${p.barIndex} ${p.barOccurence} ${p.millisecondOffset} ${p.barPosition}`);
                }
            }
        }
    }

    private _writeStyleSheetTo(writer: AlphaTexWriterOld, stylesheet: RenderStylesheet) {
        writer.writeSingleLineComment('Score Stylesheet');
        if (stylesheet.hideDynamics) {
            writer.writeMeta('hideDynamics');
        }
        if (stylesheet.bracketExtendMode !== AlphaTexExporterOld._defaultScore.stylesheet.bracketExtendMode) {
            writer.writeMeta('bracketExtendMode', BracketExtendMode[stylesheet.bracketExtendMode]);
        }
        if (stylesheet.useSystemSignSeparator) {
            writer.writeMeta('useSystemSignSeparator');
        }
        if (stylesheet.multiTrackMultiBarRest) {
            writer.writeMeta('multiBarRest');
        }
        if (
            stylesheet.singleTrackTrackNamePolicy !==
            AlphaTexExporterOld._defaultScore.stylesheet.singleTrackTrackNamePolicy
        ) {
            writer.writeMeta('singleTrackTrackNamePolicy', TrackNamePolicy[stylesheet.singleTrackTrackNamePolicy]);
        }
        if (
            stylesheet.multiTrackTrackNamePolicy !== AlphaTexExporterOld._defaultScore.stylesheet.multiTrackTrackNamePolicy
        ) {
            writer.writeMeta('multiTrackTrackNamePolicy', TrackNamePolicy[stylesheet.multiTrackTrackNamePolicy]);
        }
        if (stylesheet.firstSystemTrackNameMode !== AlphaTexExporterOld._defaultScore.stylesheet.firstSystemTrackNameMode) {
            writer.writeMeta('firstSystemTrackNameMode', TrackNameMode[stylesheet.firstSystemTrackNameMode]);
        }
        if (
            stylesheet.otherSystemsTrackNameMode !== AlphaTexExporterOld._defaultScore.stylesheet.otherSystemsTrackNameMode
        ) {
            writer.writeMeta('otherSystemsTrackNameMode', TrackNameMode[stylesheet.otherSystemsTrackNameMode]);
        }
        if (
            stylesheet.firstSystemTrackNameOrientation !==
            AlphaTexExporterOld._defaultScore.stylesheet.firstSystemTrackNameOrientation
        ) {
            writer.writeMeta(
                'firstSystemTrackNameOrientation',
                TrackNameOrientation[stylesheet.firstSystemTrackNameOrientation]
            );
        }
        if (
            stylesheet.otherSystemsTrackNameOrientation !==
            AlphaTexExporterOld._defaultScore.stylesheet.otherSystemsTrackNameOrientation
        ) {
            writer.writeMeta(
                'otherSystemsTrackNameOrientation',
                TrackNameOrientation[stylesheet.otherSystemsTrackNameOrientation]
            );
        }

        // Unsupported:
        // 'globaldisplaychorddiagramsontop',
        // 'pertrackchorddiagramsontop',
        // 'globaldisplaytuning',
        // 'globaldisplaytuning',
        // 'pertrackdisplaytuning',
        // 'pertrackchorddiagramsontop',
        // 'pertrackmultibarrest',
    }

    private _writeTrackTo(writer: AlphaTexWriterOld, track: Track) {
        writer.write('\\track ');
        writer.writeString(track.name);
        if (track.shortName.length > 0) {
            writer.writeString(track.shortName);
        }

        writer.writeLine(' {');
        writer.indent();

        writer.writeSingleLineComment('Track Properties');

        if (track.color.rgba !== AlphaTexExporterOld._defaultTrack.color.rgba) {
            writer.write(` color `);
            writer.writeString(track.color.rgba);
            writer.writeLine();
        }
        if (track.defaultSystemsLayout !== AlphaTexExporterOld._defaultTrack.defaultSystemsLayout) {
            writer.write(` defaultSystemsLayout ${track.defaultSystemsLayout}`);
            writer.writeLine();
        }
        if (track.systemsLayout.length > 0) {
            writer.write(` systemsLayout ${track.systemsLayout.join(' ')}`);
            writer.writeLine();
        }

        writer.writeLine(` volume ${track.playbackInfo.volume}`);
        writer.writeLine(` balance ${track.playbackInfo.balance}`);

        if (track.playbackInfo.isMute) {
            writer.writeLine(` mute`);
        }
        if (track.playbackInfo.isSolo) {
            writer.writeLine(` solo`);
        }

        if (
            track.score.stylesheet.perTrackMultiBarRest &&
            track.score.stylesheet.perTrackMultiBarRest!.has(track.index)
        ) {
            writer.writeLine(` multibarrest`);
        }

        writer.writeLine(
            ` instrument ${track.isPercussion ? 'percussion' : GeneralMidi.getName(track.playbackInfo.program)}`
        );
        if (track.playbackInfo.bank > 0) {
            writer.writeLine(` bank ${track.playbackInfo.bank}`);
        }

        writer.outdent();
        writer.writeLine('}');

        writer.indent();

        for (const staff of track.staves) {
            this._writeStaffTo(writer, staff);
        }

        // Unsupported:
        // - custom percussionArticulations
        // - style

        writer.outdent();
    }

    private _writeStaffTo(writer: AlphaTexWriterOld, staff: Staff) {
        writer.write('\\staff ');

        writer.beginGroup('{', '}', 'Staff Properties');
        if (staff.showStandardNotation) {
            if (staff.standardNotationLineCount !== Staff.DefaultStandardNotationLineCount) {
                writer.writeGroupItem(`score ${staff.standardNotationLineCount}`);
            } else {
                writer.writeGroupItem('score');
            }
        }
        if (staff.showTablature) {
            writer.writeGroupItem('tabs');
        }
        if (staff.showSlash) {
            writer.writeGroupItem('slash');
        }
        if (staff.showNumbered) {
            writer.writeGroupItem('numbered');
        }
        writer.endGroup();
        writer.writeLine();

        writer.indent();

        const voiceCount = Math.max(...staff.filledVoices) + 1;
        for (let v = 0; v < voiceCount; v++) {
            if (voiceCount > 1) {
                writer.write('\\voice ');
                writer.writeInlineComment(`Voice ${v + 1}`);
                writer.writeLine();

                writer.indent();
            }

            for (const bar of staff.bars) {
                this._writeBarTo(writer, bar, v);
            }

            if (voiceCount > 1) {
                writer.outdent();
            }
        }

        // Unsupported:
        // - style

        writer.outdent();
    }

    private _writeBarTo(writer: AlphaTexWriterOld, bar: Bar, voiceIndex: number) {
        if (bar.index > 0) {
            writer.writeLine('|');
        }

        if (voiceIndex === 0) {
            let anyWritten = false;

            // Staff meta on first bar
            if (bar.index === 0) {
                const l = writer.tex.length;
                this._writeStaffMetaTo(writer, bar.staff);
                anyWritten = writer.tex.length > l;
            }

            // Master Bar meta on first track
            if (bar.staff.index === 0 && bar.staff.track.index === 0) {
                const l = writer.tex.length;
                this._writeMasterBarMetaTo(writer, bar.masterBar);
                anyWritten = writer.tex.length > l;
            }

            if (anyWritten) {
                writer.writeLine();
            }
        }

        writer.writeSingleLineComment(`Bar ${bar.index + 1}`);
        writer.indent();
        this._writeBarMetaTo(writer, bar);

        // Unsupported:
        // - style

        if (!bar.isEmpty) {
            this._writeVoiceTo(writer, bar.voices[voiceIndex]);
        } else {
            writer.writeSingleLineComment(`empty bar`);
        }

        writer.outdent();
    }

    private _writeStaffMetaTo(writer: AlphaTexWriterOld, staff: Staff) {
        writer.writeSingleLineComment(`Staff ${staff.index + 1} Metadata`);

        if (staff.capo !== 0) {
            writer.writeMeta('capo', `${staff.capo}`);
        }
        if (staff.isPercussion) {
            writer.writeMeta('articulation', 'defaults');
        } else if (staff.isStringed) {
            writer.write('\\tuning');
            for (const t of staff.stringTuning.tunings) {
                writer.write(` ${Tuning.getTextForTuning(t, true)}`);
            }

            if (
                staff.track.score.stylesheet.perTrackDisplayTuning &&
                staff.track.score.stylesheet.perTrackDisplayTuning!.has(staff.track.index)
            ) {
                writer.write(' hide');
            }

            if (staff.stringTuning.name.length > 0) {
                writer.write(' ');
                writer.writeString(staff.stringTuning.name);
            }

            writer.writeLine();
        }

        if (staff.transpositionPitch !== 0) {
            writer.writeMeta('transpose', `${-staff.transpositionPitch}`);
        }

        const defaultTransposition = ModelUtils.displayTranspositionPitches.has(staff.track.playbackInfo.program)
            ? ModelUtils.displayTranspositionPitches.get(staff.track.playbackInfo.program)!
            : 0;
        if (staff.displayTranspositionPitch !== defaultTransposition) {
            writer.writeMeta('displaytranspose', `${-staff.displayTranspositionPitch}`);
        }

        writer.writeMeta('accidentals', 'auto');

        if (staff.chords != null) {
            for (const [_, chord] of staff.chords!) {
                this._writeChordTo(writer, chord);
            }
        }
    }

    private _writeChordTo(writer: AlphaTexWriterOld, c: Chord) {
        writer.write('\\chord {');
        if (c.firstFret > 0) {
            writer.write(`firstfret ${c.firstFret} `);
        }
        writer.write(`showdiagram ${c.showDiagram ? 'true' : 'false'} `);
        writer.write(`showfingering ${c.showFingering ? 'true' : 'false'} `);
        writer.write(`showname ${c.showName ? 'true' : 'false'} `);
        if (c.barreFrets.length > 0) {
            const barre = c.barreFrets.map(f => `${f}`).join(' ');
            writer.write(`barre ${barre} `);
        }
        writer.write('} ');

        writer.writeString(c.name);

        for (let i = 0; i < c.staff.tuning.length; i++) {
            const fret = i < c.strings.length ? `${c.strings[i]} ` : `x `;
            writer.write(fret);
        }
        writer.writeLine();
    }

    private _writeMasterBarMetaTo(writer: AlphaTexWriterOld, masterBar: MasterBar) {
        writer.writeSingleLineComment(`Masterbar ${masterBar.index + 1} Metadata`, true);

        if (masterBar.alternateEndings !== 0) {
            writer.write('\\ae (');
            writer.write(
                ModelUtils.getAlternateEndingsList(masterBar.alternateEndings)
                    .map(i => i + 1)
                    .join(' ')
            );
            writer.writeLine(')');
        }

        if (masterBar.isRepeatStart) {
            writer.writeMeta('ro');
        }

        if (masterBar.isRepeatEnd) {
            writer.writeMeta('rc', `${masterBar.repeatCount}`);
        }

        if (
            masterBar.index === 0 ||
            masterBar.timeSignatureCommon !== masterBar.previousMasterBar?.timeSignatureCommon ||
            masterBar.timeSignatureNumerator !== masterBar.previousMasterBar.timeSignatureNumerator ||
            masterBar.timeSignatureDenominator !== masterBar.previousMasterBar.timeSignatureDenominator
        ) {
            if (masterBar.timeSignatureCommon) {
                writer.writeStringMeta('ts ', 'common');
            } else {
                writer.writeLine(`\\ts ${masterBar.timeSignatureNumerator} ${masterBar.timeSignatureDenominator}`);
            }
        }

        if (
            (masterBar.index > 0 && masterBar.tripletFeel !== masterBar.previousMasterBar?.tripletFeel) ||
            (masterBar.index === 0 && masterBar.tripletFeel !== TripletFeel.NoTripletFeel)
        ) {
            writer.writeMeta('tf', TripletFeel[masterBar.tripletFeel]);
        }

        if (masterBar.isFreeTime) {
            writer.writeMeta('ft');
        }

        if (masterBar.section != null) {
            writer.write('\\section ');
            writer.writeString(masterBar.section.marker);
            writer.writeString(masterBar.section.text);
            writer.writeLine();
        }

        if (masterBar.isAnacrusis) {
            writer.writeMeta('ac');
        }

        if (masterBar.displayScale !== 1) {
            writer.writeMeta('scale', masterBar.displayScale.toFixed(3));
        }

        if (masterBar.displayWidth > 0) {
            writer.writeMeta('width', `${masterBar.displayWidth}`);
        }

        if (masterBar.directions) {
            for (const d of masterBar.directions!) {
                let jumpValue: string = Direction[d];
                if (jumpValue.startsWith('Target')) {
                    jumpValue = jumpValue.substring('Target'.length);
                } else if (jumpValue.startsWith('Jump')) {
                    jumpValue = jumpValue.substring('Jump'.length);
                }
                writer.writeMeta('jump', jumpValue);
            }
        }

        for (const a of masterBar.tempoAutomations) {
            writer.write(`\\tempo ( ${a.value} `);
            if (a.text) {
                writer.writeString(a.text);
            }
            writer.write(`${a.ratioPosition} `);
            if (!a.isVisible) {
                writer.write('hide ');
            }
            writer.writeLine(`)`);
        }

        writer.dropSingleLineComment();
    }

    private _writeBarMetaTo(writer: AlphaTexWriterOld, bar: Bar) {
        writer.writeSingleLineComment(`Bar ${bar.index + 1} Metadata`, true);
        const l = writer.tex.length;

        if (bar.index === 0 || bar.clef !== bar.previousBar?.clef) {
            writer.writeMeta('clef', Clef[bar.clef]);
        }

        if ((bar.index === 0 && bar.clefOttava !== Ottavia.Regular) || bar.clefOttava !== bar.previousBar?.clefOttava) {
            let ottava = Ottavia[bar.clefOttava];
            if (ottava.startsWith('_')) {
                ottava = ottava.substring(1);
            }
            writer.writeMeta('ottava', ottava);
        }

        if ((bar.index === 0 && bar.simileMark !== SimileMark.None) || bar.simileMark !== bar.previousBar?.simileMark) {
            writer.writeMeta('simile', SimileMark[bar.simileMark]);
        }

        if (bar.displayScale !== 1) {
            writer.writeMeta('scale', bar.displayScale.toFixed(3));
        }

        if (bar.displayWidth > 0) {
            writer.writeMeta('width', `${bar.displayWidth}`);
        }

        // sustainPedals are on beat level
        for (const sp of bar.sustainPedals) {
            switch (sp.pedalType) {
                case SustainPedalMarkerType.Down:
                    writer.writeMeta('spd', `${sp.ratioPosition}`);
                    break;
                case SustainPedalMarkerType.Hold:
                    writer.writeMeta('sph', `${sp.ratioPosition}`);
                    break;
                case SustainPedalMarkerType.Up:
                    writer.writeMeta('spu', `${sp.ratioPosition}`);
                    break;
            }
        }

        if (bar.barLineLeft !== BarLineStyle.Automatic) {
            writer.writeMeta('barlineleft', BarLineStyle[bar.barLineLeft]);
        }

        if (bar.barLineRight !== BarLineStyle.Automatic) {
            writer.writeMeta('barlineright', BarLineStyle[bar.barLineRight]);
        }

        if (
            bar.index === 0 ||
            bar.keySignature !== bar.previousBar!.keySignature ||
            bar.keySignatureType !== bar.previousBar!.keySignatureType
        ) {
            let ks = '';
            if (bar.keySignatureType === KeySignatureType.Minor) {
                switch (bar.keySignature) {
                    case KeySignature.Cb:
                        ks = 'abminor';
                        break;
                    case KeySignature.Gb:
                        ks = 'ebminor';
                        break;
                    case KeySignature.Db:
                        ks = 'bbminor';
                        break;
                    case KeySignature.Ab:
                        ks = 'fminor';
                        break;
                    case KeySignature.Eb:
                        ks = 'cminor';
                        break;
                    case KeySignature.Bb:
                        ks = 'gminor';
                        break;
                    case KeySignature.F:
                        ks = 'dminor';
                        break;
                    case KeySignature.C:
                        ks = 'aminor';
                        break;
                    case KeySignature.G:
                        ks = 'eminor';
                        break;
                    case KeySignature.D:
                        ks = 'bminor';
                        break;
                    case KeySignature.A:
                        ks = 'f#minor';
                        break;
                    case KeySignature.E:
                        ks = 'c#minor';
                        break;
                    case KeySignature.B:
                        ks = 'g#minor';
                        break;
                    case KeySignature.FSharp:
                        ks = 'd#minor';
                        break;
                    case KeySignature.CSharp:
                        ks = 'a#minor';
                        break;
                    default:
                        // fallback to major
                        ks = KeySignature[bar.keySignature];
                        break;
                }
            } else {
                switch (bar.keySignature) {
                    case KeySignature.FSharp:
                        ks = 'f#';
                        break;
                    case KeySignature.CSharp:
                        ks = 'c#';
                        break;
                    default:
                        ks = KeySignature[bar.keySignature];
                        break;
                }
            }
            writer.writeStringMeta('ks', ks);
        }

        if (writer.tex.length > l) {
            writer.writeLine();
        }

        writer.dropSingleLineComment();
    }

    private _writeVoiceTo(writer: AlphaTexWriterOld, voice: Voice) {
        if (voice.isEmpty) {
            writer.writeSingleLineComment(`empty voice`);
            return;
        }

        writer.writeSingleLineComment(`Bar ${voice.bar.index + 1} / Voice ${voice.index + 1} contents`);

        // Unsupported:
        // - style

        for (const beat of voice.beats) {
            this._writeBeatTo(writer, beat);
        }
    }

    private _writeBeatTo(writer: AlphaTexWriterOld, beat: Beat) {
        // Notes
        if (beat.isRest) {
            writer.write('r');
        } else if (beat.notes.length === 0) {
            writer.write('()');
        } else {
            if (beat.notes.length > 1) {
                writer.write('(');
            }

            for (const note of beat.notes) {
                if (note.index > 0) {
                    writer.write(' ');
                }
                this._writeNoteTo(writer, note);
            }

            if (beat.notes.length > 1) {
                writer.write(')');
            }
        }

        writer.write(`.${beat.duration as number}`);

        // Unsupported:
        // - style

        this._writeBeatEffectsTo(writer, beat);

        writer.writeLine();
    }

    private _writeBeatEffectsTo(writer: AlphaTexWriterOld, beat: Beat) {
        writer.beginGroup('{', '}');

        switch (beat.fade) {
            case FadeType.FadeIn:
                writer.writeGroupItem('f');
                break;
            case FadeType.FadeOut:
                writer.writeGroupItem('fo');
                break;
            case FadeType.VolumeSwell:
                writer.writeGroupItem('vs');
                break;
        }

        if (beat.vibrato === VibratoType.Slight) {
            writer.writeGroupItem('v');
        } else if (beat.vibrato === VibratoType.Wide) {
            writer.writeGroupItem('vw');
        }

        if (beat.slap) {
            writer.writeGroupItem('s');
        }

        if (beat.pop) {
            writer.writeGroupItem('p');
        }

        if (beat.tap) {
            writer.writeGroupItem('tt');
        }

        if (beat.dots >= 2) {
            writer.writeGroupItem('dd');
        } else if (beat.dots > 0) {
            writer.writeGroupItem('d');
        }

        if (beat.pickStroke === PickStroke.Up) {
            writer.writeGroupItem('su');
        } else if (beat.pickStroke === PickStroke.Down) {
            writer.writeGroupItem('sd');
        }

        if (beat.hasTuplet) {
            writer.writeGroupItem(`tu ${beat.tupletNumerator} ${beat.tupletDenominator}`);
        }

        if (beat.hasWhammyBar) {
            writer.writeGroupItem('tbe');
            switch (beat.whammyBarType) {
                case WhammyType.Custom:
                    writer.writeGroupItem('custom');
                    break;
                case WhammyType.Dive:
                    writer.writeGroupItem('dive');
                    break;
                case WhammyType.Dip:
                    writer.writeGroupItem('dip');
                    break;
                case WhammyType.Hold:
                    writer.writeGroupItem('hold');
                    break;
                case WhammyType.Predive:
                    writer.writeGroupItem('predive');
                    break;
                case WhammyType.PrediveDive:
                    writer.writeGroupItem('predivedive');
                    break;
            }

            switch (beat.whammyStyle) {
                case BendStyle.Default:
                    break;
                case BendStyle.Gradual:
                    writer.writeGroupItem('gradual');
                    break;
                case BendStyle.Fast:
                    writer.writeGroupItem('fast');
                    break;
            }

            writer.beginGroup('(', ')');

            for (const p of beat.whammyBarPoints!) {
                writer.writeGroupItem(` ${p.offset} ${p.value}`);
            }

            writer.endGroup();
        }

        switch (beat.brushType) {
            case BrushType.BrushUp:
                writer.writeGroupItem(`bu ${beat.brushDuration}`);
                break;
            case BrushType.BrushDown:
                writer.writeGroupItem(`bd ${beat.brushDuration}`);
                break;
            case BrushType.ArpeggioUp:
                writer.writeGroupItem(`au ${beat.brushDuration}`);
                break;
            case BrushType.ArpeggioDown:
                writer.writeGroupItem(`ad ${beat.brushDuration}`);
                break;
        }

        if (beat.chord != null) {
            writer.writeGroupItem('ch ');
            writer.writeString(beat.chord.name);
        }

        if (beat.ottava !== Ottavia.Regular) {
            let ottava = Ottavia[beat.ottava];
            if (ottava.startsWith('_')) {
                ottava = ottava.substring(1);
            }

            writer.writeGroupItem(`ot ${ottava}`);
        }

        if (beat.hasRasgueado) {
            writer.writeGroupItem(`rasg ${Rasgueado[beat.rasgueado]}`);
        }

        if (beat.text != null) {
            writer.writeGroupItem('txt ');
            writer.writeString(beat.text);
        }

        if (beat.lyrics != null && beat.lyrics!.length > 0) {
            if (beat.lyrics.length > 1) {
                for (let i = 0; i < beat.lyrics.length; i++) {
                    writer.writeGroupItem(`lyrics ${i} `);
                    writer.writeString(beat.lyrics[i]);
                }
            } else {
                writer.writeGroupItem('lyrics ');
                writer.writeString(beat.lyrics[0]);
            }
        }

        switch (beat.graceType) {
            case GraceType.OnBeat:
                writer.writeGroupItem('gr ob');
                break;
            case GraceType.BeforeBeat:
                writer.writeGroupItem('gr');
                break;
            case GraceType.BendGrace:
                writer.writeGroupItem('gr b');
                break;
        }

        if (beat.isTremolo) {
            writer.writeGroupItem(`tp ${beat.tremoloSpeed as number}`);
        }

        switch (beat.crescendo) {
            case CrescendoType.Crescendo:
                writer.writeGroupItem('cre');
                break;
            case CrescendoType.Decrescendo:
                writer.writeGroupItem('dec');
                break;
        }

        if ((beat.voice.bar.index === 0 && beat.index === 0) || beat.dynamics !== beat.previousBeat?.dynamics) {
            writer.writeGroupItem(`dy ${DynamicValue[beat.dynamics].toLowerCase()}`);
        }

        const fermata = beat.fermata;
        if (fermata != null) {
            writer.writeGroupItem(`fermata ${FermataType[fermata.type]} ${fermata.length}`);
        }

        if (beat.isLegatoOrigin) {
            writer.writeGroupItem('legatoorigin');
        }

        for (const automation of beat.automations) {
            switch (automation.type) {
                case AutomationType.Tempo:
                    writer.writeGroupItem(`tempo ${automation.value}`);
                    if (automation.text.length > 0) {
                        writer.write(' ');
                        writer.writeString(automation.text);
                    }
                    break;
                case AutomationType.Volume:
                    writer.writeGroupItem(`volume ${automation.value}`);
                    break;
                case AutomationType.Instrument:
                    if (!beat.voice.bar.staff.isPercussion) {
                        writer.writeGroupItem(`instrument ${GeneralMidi.getName(automation.value)}`);
                    }
                    break;
                case AutomationType.Balance:
                    writer.writeGroupItem(`balance ${automation.value}`);
                    break;
            }
        }

        switch (beat.wahPedal) {
            case WahPedal.Open:
                writer.writeGroupItem(`waho`);
                break;
            case WahPedal.Closed:
                writer.writeGroupItem(`wahc`);
                break;
        }

        if (beat.isBarre) {
            writer.writeGroupItem(`barre ${beat.barreFret} ${BarreShape[beat.barreShape]}`);
        }

        if (beat.slashed) {
            writer.writeGroupItem(`slashed`);
        }

        if (beat.deadSlapped) {
            writer.writeGroupItem(`ds`);
        }

        switch (beat.golpe) {
            case GolpeType.Thumb:
                writer.writeGroupItem(`glpt`);
                break;
            case GolpeType.Finger:
                writer.writeGroupItem(`glpf`);
                break;
        }

        if (beat.invertBeamDirection) {
            writer.writeGroupItem('beam invert');
        } else if (beat.preferredBeamDirection !== null) {
            writer.writeGroupItem(`beam ${BeamDirection[beat.preferredBeamDirection!]}`);
        }

        if (beat.beamingMode !== BeatBeamingMode.Auto) {
            switch (beat.beamingMode) {
                case BeatBeamingMode.ForceSplitToNext:
                    writer.writeGroupItem(`beam split`);
                    break;
                case BeatBeamingMode.ForceMergeWithNext:
                    writer.writeGroupItem(`beam merge`);
                    break;
                case BeatBeamingMode.ForceSplitOnSecondaryToNext:
                    writer.writeGroupItem(`beam splitsecondary`);
                    break;
            }
        }

        if (beat.showTimer) {
            writer.writeGroupItem(`timer`);
        }

        writer.endGroup();
    }

    private _writeNoteTo(writer: AlphaTexWriterOld, note: Note) {
        if (note.index > 0) {
            writer.write(' ');
        }

        if (note.isPercussion) {
            writer.writeString(PercussionMapper.getArticulationName(note));
        } else if (note.isPiano) {
            writer.write(Tuning.getTextForTuning(note.realValueWithoutHarmonic, true));
        } else if (note.isStringed) {
            writer.write(`${note.fret}`);
            const stringNumber = note.beat.voice.bar.staff.tuning.length - note.string + 1;
            writer.write(`.${stringNumber}`);
        } else {
            throw new Error('What kind of note');
        }

        // Unsupported:
        // - style

        this._writeNoteEffectsTo(writer, note);
    }

    private _writeNoteEffectsTo(writer: AlphaTexWriterOld, note: Note) {
        writer.beginGroup('{', '}');

        if (note.hasBend) {
            writer.writeGroupItem(`be ${BendType[note.bendType]}`);

            if (note.bendStyle !== BendStyle.Default) {
                writer.writeGroupItem(`${BendStyle[note.bendStyle]} `);
            }

            writer.beginGroup('(', ')');

            for (const p of note.bendPoints!) {
                writer.writeGroupItem(`${p.offset} ${p.value}`);
            }

            writer.endGroup();
        }

        switch (note.harmonicType) {
            case HarmonicType.Natural:
                writer.writeGroupItem('nh');
                break;
            case HarmonicType.Artificial:
                writer.writeGroupItem(`ah ${note.harmonicValue}`);
                break;
            case HarmonicType.Pinch:
                writer.writeGroupItem(`ph ${note.harmonicValue}`);
                break;
            case HarmonicType.Tap:
                writer.writeGroupItem(`th ${note.harmonicValue}`);
                break;
            case HarmonicType.Semi:
                writer.writeGroupItem(`sh ${note.harmonicValue}`);
                break;
            case HarmonicType.Feedback:
                writer.writeGroupItem(`fh ${note.harmonicValue}`);
                break;
        }

        if (note.showStringNumber) {
            writer.writeGroupItem(`string`);
        }

        if (note.isTrill) {
            writer.writeGroupItem(`tr ${note.trillFret} ${note.trillSpeed as number}`);
        }

        switch (note.vibrato) {
            case VibratoType.Slight:
                writer.writeGroupItem('v');
                break;
            case VibratoType.Wide:
                writer.writeGroupItem('vw');
                break;
        }

        switch (note.slideInType) {
            case SlideInType.IntoFromBelow:
                writer.writeGroupItem('sib');
                break;
            case SlideInType.IntoFromAbove:
                writer.writeGroupItem('sia');
                break;
        }

        switch (note.slideOutType) {
            case SlideOutType.Shift:
                writer.writeGroupItem('ss');
                break;
            case SlideOutType.Legato:
                writer.writeGroupItem('sl');
                break;
            case SlideOutType.OutUp:
                writer.writeGroupItem('sou');
                break;
            case SlideOutType.OutDown:
                writer.writeGroupItem('sod');
                break;
            case SlideOutType.PickSlideDown:
                writer.writeGroupItem('psd');
                break;
            case SlideOutType.PickSlideUp:
                writer.writeGroupItem('psu');
                break;
        }

        if (note.isHammerPullOrigin) {
            writer.writeGroupItem('h');
        }

        if (note.isLeftHandTapped) {
            writer.writeGroupItem('lht');
        }

        if (note.isGhost) {
            writer.writeGroupItem('g');
        }

        switch (note.accentuated) {
            case AccentuationType.Normal:
                writer.writeGroupItem('ac');
                break;
            case AccentuationType.Heavy:
                writer.writeGroupItem('hac');
                break;
            case AccentuationType.Tenuto:
                writer.writeGroupItem('ten');
                break;
        }

        if (note.isPalmMute) {
            writer.writeGroupItem('pm');
        }

        if (note.isStaccato) {
            writer.writeGroupItem('st');
        }

        if (note.isLetRing) {
            writer.writeGroupItem('lr');
        }

        if (note.isDead) {
            writer.writeGroupItem('x');
        }

        if (note.isTieDestination) {
            writer.writeGroupItem('t');
        }

        switch (note.leftHandFinger) {
            case Fingers.Thumb:
                writer.writeGroupItem('lf 1');
                break;
            case Fingers.IndexFinger:
                writer.writeGroupItem('lf 2');
                break;
            case Fingers.MiddleFinger:
                writer.writeGroupItem('lf 3');
                break;
            case Fingers.AnnularFinger:
                writer.writeGroupItem('lf 4');
                break;
            case Fingers.LittleFinger:
                writer.writeGroupItem('lf 5');
                break;
        }

        switch (note.rightHandFinger) {
            case Fingers.Thumb:
                writer.writeGroupItem('rf 1');
                break;
            case Fingers.IndexFinger:
                writer.writeGroupItem('rf 2');
                break;
            case Fingers.MiddleFinger:
                writer.writeGroupItem('rf 3');
                break;
            case Fingers.AnnularFinger:
                writer.writeGroupItem('rf 4');
                break;
            case Fingers.LittleFinger:
                writer.writeGroupItem('rf 5');
                break;
        }

        if (!note.isVisible) {
            writer.writeGroupItem('hide');
        }

        if (note.isSlurOrigin) {
            const slurId = `s${note.id}`;
            writer.writeGroupItem(`slur ${slurId}`);
        }

        if (note.isSlurDestination) {
            const slurId = `s${note.slurOrigin!.id}`;
            writer.writeGroupItem(`slur ${slurId}`);
        }

        if (note.isTrill) {
            writer.writeGroupItem(`tr ${note.trillFret} ${note.trillSpeed as number}`);
        }

        if (note.accidentalMode !== NoteAccidentalMode.Default) {
            writer.writeGroupItem(`acc ${NoteAccidentalMode[note.accidentalMode]}`);
        }

        switch (note.ornament) {
            case NoteOrnament.InvertedTurn:
                writer.writeGroupItem(`iturn`);
                break;
            case NoteOrnament.Turn:
                writer.writeGroupItem(`turn`);
                break;
            case NoteOrnament.UpperMordent:
                writer.writeGroupItem(`umordent`);
                break;
            case NoteOrnament.LowerMordent:
                writer.writeGroupItem(`lmordent`);
                break;
        }

        writer.endGroup();
    }
}
