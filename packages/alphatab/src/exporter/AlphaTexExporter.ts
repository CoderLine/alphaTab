import { Environment } from '@src/Environment';
import { ScoreExporter } from '@src/exporter/ScoreExporter';
import {
    type AlphaTexBarNode,
    type AlphaTexBeatDurationChangeNode,
    type AlphaTexBeatNode,
    type AlphaTexComment,
    type AlphaTexIdentifier,
    type AlphaTexMetaDataNode,
    AlphaTexNodeType,
    type AlphaTexNoteListNode,
    type AlphaTexNoteNode,
    type AlphaTexNumberLiteral,
    type AlphaTexPropertiesNode,
    type AlphaTexPropertyNode,
    type AlphaTexScoreNode,
    type AlphaTexStringLiteral,
    type AlphaTexValueList,
    type IAlphaTexAstNode,
} from '@src/importer/AlphaTexAst';
import { AlphaTex1LanguageHandler, type IAlphaTexLanguageHandler } from '@src/importer/AlphaTexLanguageHandler';
import { IOHelper } from '@src/io/IOHelper';
import type { Bar } from '@src/model/Bar';
import type { Beat } from '@src/model/Beat';
import type { Note } from '@src/model/Note';
import { PercussionMapper } from '@src/model/PercussionMapper';
import type { Score } from '@src/model/Score';
import type { Staff } from '@src/model/Staff';
import type { Track } from '@src/model/Track';
import { Tuning } from '@src/model/Tuning';
import { Settings } from '@src/Settings';

/**
 * A small helper to write formatted alphaTex code to a string buffer.
 */
class AlphaTexWriter {
    public tex: string = '';
    public isStartOfLine: boolean = true;
    public indentString: string = '';
    public currentIndent: number = 0;

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

    private preWrite() {
        // indent if needed
        if (this.isStartOfLine && this.indentString.length > 0) {
            for (let i = 0; i < this.currentIndent; i++) {
                this.tex += this.indentString;
            }
        }
        this.isStartOfLine = false;
    }

    public write(text: string) {
        this.preWrite();
        this.tex += text;
        this.isStartOfLine = false;
    }

    public writeString(text: string) {
        this.preWrite();
        this.tex += Environment.quoteJsonString(text);
    }

    public writeLine(text?: string) {
        this.preWrite();
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

class AlphaTexPrinter {
    private _writer: AlphaTexWriter;
    private _comments = false;

    public get tex() {
        return this._writer.tex;
    }

    constructor(settings: Settings) {
        const writer = new AlphaTexWriter();
        this._comments = settings.exporter.comments;
        writer.indentString = settings.exporter.indent > 0 ? ' '.repeat(settings.exporter.indent) : '';
        this._writer = writer;
    }

    public writeScoreNode(node: AlphaTexScoreNode) {
        this.writeComments(node.leadingComments);

        this.writeMetaDataList(node.metaData);
        this.writeToken(node.metaDataBarSeparator, true);

        for (const b of node.bars) {
            this.writeBar(b);
        }
        this.writeToken(node.barsSyncPointSeparator, true);

        this.writeMetaDataList(node.syncPoints);

        this.writeComments(node.trailingComments);
    }

    private writeBar(bar: AlphaTexBarNode) {
        this.writeComments(bar.leadingComments);
        this.writeMetaDataList(bar.metaData);

        this._writer.indent();

        for (const beat of bar.beats) {
            this.writeBeat(beat);
        }

        this._writer.outdent();

        this.writeComments(bar.trailingComments);
        this.writeToken(bar.pipe, true);
    }

    private writeBeat(beat: AlphaTexBeatNode) {
        this.writeComments(beat.leadingComments);
        if (beat.durationChange) {
            this.writeDurationChange(beat.durationChange);
        }

        if (beat.rest) {
            this.writeValue(beat.rest);
        } else if (beat.notes) {
            this.writeNotes(beat.notes);
        }

        this.writeToken(beat.durationDot, false);
        this.writeValue(beat.durationValue);

        this.writeToken(beat.beatMultiplier, false);
        this.writeValue(beat.beatMultiplierValue);

        if (beat.beatEffects) {
            this.writeProperties(beat.beatEffects, false);
        }

        this.writeComments(beat.trailingComments);
        this._writer.writeLine();
    }

    private writeNotes(notes: AlphaTexNoteListNode) {
        this.writeComments(notes.leadingComments);
        this.writeToken(notes.openParenthesis, false);

        let first = true;
        for (const n of notes.notes) {
            if (!first) {
                this._writer.write(' ');
            }
            this.writeNote(n);
            first = false;
        }

        this.writeToken(notes.closeParenthesis, false);
        this.writeComments(notes.trailingComments);
    }

    private writeNote(n: AlphaTexNoteNode) {
        this.writeComments(n.leadingComments);

        this.writeValue(n.noteValue);
        this.writeToken(n.noteStringDot, false);
        this.writeValue(n.noteString);

        if (n.noteEffects) {
            this.writeProperties(n.noteEffects, false);
        }

        this.writeComments(n.trailingComments);
    }

    private writeDurationChange(durationChange: AlphaTexBeatDurationChangeNode) {
        this.writeComments(durationChange.leadingComments);
        this.writeToken(durationChange.colon, false);
        this.writeValue(durationChange.value);

        if (durationChange.properties) {
            this._writer.write(' ');
            this.writeProperties(durationChange.properties, false);
        }

        this.writeComments(durationChange.trailingComments);

        this._writer.write(' ');
    }

    private writeMetaDataList(metaData: AlphaTexMetaDataNode[]) {
        for (const m of metaData) {
            this.writeMetaData(m);
        }
    }

    private _trackIndex = 0;
    private _staffIndex = 0;
    private _voiceIndex = 0;

    private writeMetaData(m: AlphaTexMetaDataNode) {
        // outdent from previous items if we had indents
        switch (m.tag.tag.text) {
            case 'track':
                if (this._trackIndex > 0) {
                    this._writer.outdent();
                }
                break;
            case 'staff':
                if (this._staffIndex > 0) {
                    this._writer.outdent();
                }
                break;
            case 'voice':
                if (this._voiceIndex > 0) {
                    this._writer.outdent();
                }
                break;
        }

        this.writeComments(m.leadingComments);
        this.writeToken(m.tag.prefix, false);
        this.writeValue(m.tag.tag);

        let newLineAfterMeta = true;
        if (m.propertiesBeforeValues) {
            if (m.properties) {
                this._writer.write(' ');
                this.writeProperties(m.properties, false);
            }
            if (m.values) {
                this._writer.write(' ');
                this.writeValues(m.values);
            }
        } else {
            if (m.values) {
                this._writer.write(' ');
                this.writeValues(m.values);
            }

            if (m.properties) {
                this._writer.write(' ');
                this.writeProperties(m.properties, true);
                newLineAfterMeta = false;
            }
        }

        if (m.trailingComments) {
            this._writer.write(' ');
            this.writeComments(m.trailingComments);
        }

        // outdent from previous items if we had indents
        switch (m.tag.tag.text) {
            case 'track':
                this._trackIndex++;
                this._staffIndex = 0;
                this._voiceIndex = 0;
                this._writer.indent();
                break;
            case 'staff':
                this._staffIndex++;
                this._voiceIndex = 0;
                this._writer.indent();
                break;
            case 'voice':
                this._voiceIndex++;
                this._writer.indent();
                break;
        }

        if (newLineAfterMeta) {
            this._writer.writeLine();
        }
    }

    private writeProperties(properties: AlphaTexPropertiesNode, indent: boolean) {
        this.writeComments(properties.leadingComments);
        this.writeToken(properties.openBrace, indent);
        if (indent) {
            this._writer.indent();
        }

        let first = true;
        for (const p of properties.properties) {
            if (!first && !indent) {
                this._writer.write(' ');
            }
            this.writeProperty(p);
            first = false;
            if (indent) {
                this._writer.writeLine();
            }
        }

        if (indent) {
            this._writer.outdent();
        }
        this.writeToken(properties.closeBrace, indent);
        this.writeComments(properties.trailingComments);
    }

    private writeProperty(p: AlphaTexPropertyNode) {
        this.writeComments(p.leadingComments);

        this.writeValue(p.property);
        if (p.values) {
            this._writer.write(' ');
            this.writeValues(p.values);
        }

        this.writeComments(p.trailingComments);
    }

    private writeValues(values: AlphaTexValueList) {
        this.writeComments(values.leadingComments);
        this.writeToken(values.openParenthesis, false);
        let first = true;
        for (const v of values.values) {
            if (!first) {
                this._writer.write(' ');
            }
            this.writeValue(v);
            first = false;
        }
        this.writeToken(values.closeParenthesis, false);
        this.writeComments(values.trailingComments);
    }

    private writeValue(v: IAlphaTexAstNode | undefined) {
        if (!v) {
            return;
        }
        this.writeComments(v.leadingComments);
        switch (v.nodeType) {
            case AlphaTexNodeType.Identifier:
                this._writer.write((v as AlphaTexIdentifier).text);
                break;

            case AlphaTexNodeType.ValueList:
                this.writeValues(v as AlphaTexValueList);
                break;
            case AlphaTexNodeType.NumberLiteral:
                this._writer.write((v as AlphaTexNumberLiteral).value.toString());
                break;
            case AlphaTexNodeType.StringLiteral:
                this._writer.writeString((v as AlphaTexStringLiteral).text);
                break;
        }
        this.writeComments(v.trailingComments);
    }

    private writeToken(tokenNode: IAlphaTexAstNode | undefined, newLine: boolean) {
        if (tokenNode) {
            this.writeComments(tokenNode.leadingComments);
            switch (tokenNode.nodeType) {
                case AlphaTexNodeType.DotToken:
                    this._writer.write('.');
                    break;
                case AlphaTexNodeType.BackSlashToken:
                    this._writer.write('\\');
                    break;
                case AlphaTexNodeType.DoubleBackSlashToken:
                    this._writer.write('\\\\');
                    break;
                case AlphaTexNodeType.PipeToken:
                    this._writer.write('|');
                    break;
                case AlphaTexNodeType.BraceOpenToken:
                    this._writer.write('{');
                    break;
                case AlphaTexNodeType.BraceCloseToken:
                    this._writer.write('}');
                    break;
                case AlphaTexNodeType.ParenthesisOpenToken:
                    this._writer.write('(');
                    break;
                case AlphaTexNodeType.ParenthesisCloseToken:
                    this._writer.write(')');
                    break;
                case AlphaTexNodeType.ColonToken:
                    this._writer.write(':');
                    break;
                case AlphaTexNodeType.AsteriskToken:
                    this._writer.write('*');
                    break;
            }
            this.writeComments(tokenNode.trailingComments);
            if (newLine) {
                this._writer.writeLine();
            }
        }
    }

    private writeComments(comments: AlphaTexComment[] | undefined) {
        if (!this._comments || !comments) {
            return;
        }

        for (const c of comments) {
            let txt = c.text;
            if (!txt.startsWith(' ')) {
                txt = ` ${txt}`;
            }

            if (c.multiLine) {
                if (!txt.endsWith(' ')) {
                    txt += ' ';
                }

                this._writer.write(`/*${txt}*/`);
            } else {
                this._writer.writeLine(`//${txt}`);
            }
        }
    }
}

/**
 * This ScoreExporter can write alphaTex strings.
 */
export class AlphaTexExporter extends ScoreExporter {
    private _handler: IAlphaTexLanguageHandler = AlphaTex1LanguageHandler.instance;

    public get name(): string {
        return 'alphaTex';
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
        const printer = new AlphaTexPrinter(this.settings);
        printer.writeScoreNode(this.score(score));
        return printer.tex;
    }

    private score(data: Score): AlphaTexScoreNode {
        const score: AlphaTexScoreNode = {
            nodeType: AlphaTexNodeType.Score,
            metaData: [],
            metaDataBarSeparator: undefined,
            bars: [],
            barsSyncPointSeparator: undefined,
            syncPoints: []
        };

        score.metaData = this._handler.buildScoreMetaDataNodes(data);
        if (score.metaData.length > 0) {
            score.metaDataBarSeparator = {
                nodeType: AlphaTexNodeType.DotToken
            };
        }

        for (const t of data.tracks) {
            this.track(score, t);
        }

        score.syncPoints = this._handler.buildSyncPointNodes(data);
        if (score.syncPoints.length > 0) {
            score.barsSyncPointSeparator = {
                nodeType: AlphaTexNodeType.DotToken
            };
        }

        return score;
    }

    private track(score: AlphaTexScoreNode, data: Track) {
        for (const s of data.staves) {
            this.staff(score, s);
        }
    }

    private staff(score: AlphaTexScoreNode, data: Staff) {
        const voiceCount = Math.max(...data.filledVoices) + 1;

        if (data.bars.length === 0) {
            const bar: AlphaTexBarNode = {
                nodeType: AlphaTexNodeType.Bar,
                metaData: this._handler.buildBarMetaDataNodes(data, undefined, 0, false),
                beats: [],
                pipe: undefined
            };
            score.bars.push(bar);
        } else {
            for (let v = 0; v < voiceCount; v++) {
                this.voice(score, v, data, voiceCount > 1);
            }
        }
    }

    private voice(score: AlphaTexScoreNode, v: number, data: Staff, isMultiVoice: boolean) {
        for (const bar of data.bars) {
            this.bar(score, bar, v, isMultiVoice);
        }
    }

    private bar(score: AlphaTexScoreNode, data: Bar, voiceIndex: number, isMultiVoice: boolean) {
        const bar: AlphaTexBarNode = {
            nodeType: AlphaTexNodeType.Bar,
            metaData: this._handler.buildBarMetaDataNodes(data.staff, data, voiceIndex, isMultiVoice),
            beats: [],
            pipe: undefined
        };

        if (!data.isEmpty) {
            const voice = data.voices[voiceIndex];
            if (voice.isEmpty) {
                bar.trailingComments = [
                    {
                        multiLine: false,
                        text: `Bar ${data.index + 1} / Voice ${voiceIndex + 1} no contents`
                    }
                ];
            } else {
                for (const b of voice.beats) {
                    bar.beats.push(this.beat(b));
                }
                if (bar.beats.length > 0) {
                    bar.beats[0].leadingComments ??= [];
                    bar.beats[0].leadingComments.unshift({
                        multiLine: false,
                        text: `Bar ${data.index + 1} / Voice ${voiceIndex + 1} contents`
                    });
                }
            }
        } else {
            bar.trailingComments = [
                {
                    multiLine: false,
                    text: `Bar ${data.index + 1} / Voice ${voiceIndex + 1} no contents`
                }
            ];
        }

        if (data.index < data.staff.bars.length - 1) {
            bar.pipe = {
                nodeType: AlphaTexNodeType.PipeToken
            };
        }

        score.bars.push(bar);
    }

    private beat(data: Beat): AlphaTexBeatNode {
        const beat: AlphaTexBeatNode = {
            nodeType: AlphaTexNodeType.Beat,
            durationChange: undefined,
            notes: undefined,
            rest: undefined,
            beatEffects: undefined
        };

        if (data.isRest) {
            beat.rest = {
                nodeType: AlphaTexNodeType.Identifier,
                text: 'r'
            };
        } else {
            beat.notes = this.notes(data.notes);
        }

        beat.durationDot = {
            nodeType: AlphaTexNodeType.DotToken
        };
        beat.durationValue = {
            nodeType: AlphaTexNodeType.NumberLiteral,
            value: data.duration as number
        };

        beat.beatEffects = this.beatEffects(data);

        return beat;
    }

    private beatEffects(data: Beat): AlphaTexPropertiesNode | undefined {
        const properties = this._handler.buildBeatEffects(data);
        return properties.length > 0
            ? {
                  nodeType: AlphaTexNodeType.Properties,
                  openBrace: {
                      nodeType: AlphaTexNodeType.BraceOpenToken
                  },
                  properties,
                  closeBrace: {
                      nodeType: AlphaTexNodeType.BraceCloseToken
                  }
              }
            : undefined;
    }

    private notes(data: Note[]): AlphaTexNoteListNode {
        const notes: AlphaTexNoteListNode = {
            nodeType: AlphaTexNodeType.NoteList,
            openParenthesis: undefined,
            notes: [],
            closeParenthesis: undefined
        };

        if (data.length === 0 || data.length > 1) {
            notes.openParenthesis = {
                nodeType: AlphaTexNodeType.ParenthesisOpenToken
            };
            notes.closeParenthesis = {
                nodeType: AlphaTexNodeType.ParenthesisCloseToken
            };
        }

        for (const n of data) {
            notes.notes.push(this.note(n));
        }

        return notes;
    }

    private note(data: Note): AlphaTexNoteNode {
        const note: AlphaTexNoteNode = {
            nodeType: AlphaTexNodeType.Note,
            noteValue: {
                // placeholder value
                nodeType: AlphaTexNodeType.Identifier,
                text: ''
            } as AlphaTexIdentifier
        };

        if (data.isPercussion) {
            note.noteValue = {
                nodeType: AlphaTexNodeType.StringLiteral,
                text: PercussionMapper.getArticulationName(data)
            } as AlphaTexStringLiteral;
        } else if (data.isPiano) {
            note.noteValue = {
                nodeType: AlphaTexNodeType.Identifier,
                text: Tuning.getTextForTuning(data.realValueWithoutHarmonic, true)
            } as AlphaTexIdentifier;
        } else if (data.isStringed) {
            note.noteValue = {
                nodeType: AlphaTexNodeType.NumberLiteral,
                value: data.fret
            } as AlphaTexNumberLiteral;
            note.noteStringDot = {
                nodeType: AlphaTexNodeType.DotToken
            };
            const stringNumber = data.beat.voice.bar.staff.tuning.length - data.string + 1;
            note.noteString = {
                nodeType: AlphaTexNodeType.NumberLiteral,
                value: stringNumber
            };
        } else {
            throw new Error('What kind of note');
        }

        note.noteEffects = this.noteEffects(data);

        return note;
    }

    private noteEffects(data: Note): AlphaTexPropertiesNode | undefined {
        const properties = this._handler.buildNoteEffects(data);
        return properties.length > 0
            ? {
                  nodeType: AlphaTexNodeType.Properties,
                  openBrace: {
                      nodeType: AlphaTexNodeType.BraceOpenToken
                  },
                  properties,
                  closeBrace: {
                      nodeType: AlphaTexNodeType.BraceCloseToken
                  }
              }
            : undefined;
    }
}
