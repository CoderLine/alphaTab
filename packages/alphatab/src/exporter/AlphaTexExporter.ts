import { Environment } from '@src/Environment';
import { ScoreExporter } from '@src/exporter/ScoreExporter';
import { AlphaTex1LanguageHandler } from '@src/importer/alphaTex/AlphaTex1LanguageHandler';
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
    type IAlphaTexAstNode
} from '@src/importer/alphaTex/AlphaTexAst';
import type { IAlphaTexLanguageImportHandler } from '@src/importer/alphaTex/IAlphaTexLanguageImportHandler';
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
 * @internal
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

    private _preWrite() {
        // indent if needed
        if (this.isStartOfLine && this.indentString.length > 0) {
            for (let i = 0; i < this.currentIndent; i++) {
                this.tex += this.indentString;
            }
        }
        this.isStartOfLine = false;
    }

    public write(text: string) {
        this._preWrite();
        this.tex += text;
        this.isStartOfLine = false;
    }

    public writeString(text: string) {
        this._preWrite();
        this.tex += Environment.quoteJsonString(text);
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
 * @internal
 */
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
        this._writeComments(node.leadingComments);

        for (const b of node.bars) {
            this._writeBar(b);
        }

        this._writeComments(node.trailingComments);
    }

    private _writeBar(bar: AlphaTexBarNode) {
        this._writeComments(bar.leadingComments);
        this._writeMetaDataList(bar.metaData);

        this._writer.indent();

        for (const beat of bar.beats) {
            this._writeBeat(beat);
        }

        this._writer.outdent();

        this._writeComments(bar.trailingComments);
        this._writeToken(bar.pipe, true);
    }

    private _writeBeat(beat: AlphaTexBeatNode) {
        this._writeComments(beat.leadingComments);
        if (beat.durationChange) {
            this._writeDurationChange(beat.durationChange);
        }

        if (beat.rest) {
            this._writeValue(beat.rest);
        } else if (beat.notes) {
            this._writeNotes(beat.notes);
        }

        this._writeToken(beat.durationDot, false);
        this._writeValue(beat.durationValue);

        this._writeToken(beat.beatMultiplier, false);
        this._writeValue(beat.beatMultiplierValue);

        if (beat.beatEffects) {
            this._writeProperties(beat.beatEffects, false);
        }

        this._writeComments(beat.trailingComments);
        this._writer.writeLine();
    }

    private _writeNotes(notes: AlphaTexNoteListNode) {
        this._writeComments(notes.leadingComments);
        this._writeToken(notes.openParenthesis, false);

        let first = true;
        for (const n of notes.notes) {
            if (!first) {
                this._writer.write(' ');
            }
            this._writeNote(n);
            first = false;
        }

        this._writeToken(notes.closeParenthesis, false);
        this._writeComments(notes.trailingComments);
    }

    private _writeNote(n: AlphaTexNoteNode) {
        this._writeComments(n.leadingComments);

        this._writeValue(n.noteValue);
        this._writeToken(n.noteStringDot, false);
        this._writeValue(n.noteString);

        if (n.noteEffects) {
            this._writeProperties(n.noteEffects, false);
        }

        this._writeComments(n.trailingComments);
    }

    private _writeDurationChange(durationChange: AlphaTexBeatDurationChangeNode) {
        this._writeComments(durationChange.leadingComments);
        this._writeToken(durationChange.colon, false);
        this._writeValue(durationChange.value);

        if (durationChange.properties) {
            this._writer.write(' ');
            this._writeProperties(durationChange.properties, false);
        }

        this._writeComments(durationChange.trailingComments);

        this._writer.write(' ');
    }

    private _writeMetaDataList(metaData: AlphaTexMetaDataNode[]) {
        for (const m of metaData) {
            this._writeMetaData(m);
        }
    }

    private _trackIndex = 0;
    private _staffIndex = 0;
    private _voiceIndex = 0;

    private _writeMetaData(m: AlphaTexMetaDataNode) {
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

        this._writeComments(m.leadingComments);
        this._writeToken(m.tag.prefix, false);
        this._writeValue(m.tag.tag);

        let newLineAfterMeta = true;
        if (m.propertiesBeforeValues) {
            if (m.properties) {
                this._writer.write(' ');
                this._writeProperties(m.properties, false);
            }
            if (m.values) {
                this._writer.write(' ');
                this._writeValues(m.values);
            }
        } else {
            if (m.values) {
                this._writer.write(' ');
                this._writeValues(m.values);
            }

            if (m.properties) {
                this._writer.write(' ');
                this._writeProperties(m.properties, true);
                newLineAfterMeta = false;
            }
        }

        if (m.trailingComments) {
            this._writer.write(' ');
            this._writeComments(m.trailingComments);
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

    private _writeProperties(properties: AlphaTexPropertiesNode, indent: boolean) {
        this._writeComments(properties.leadingComments);
        this._writeToken(properties.openBrace, indent);
        if (indent) {
            this._writer.indent();
        }

        let first = true;
        for (const p of properties.properties) {
            if (!first && !indent) {
                this._writer.write(' ');
            }
            this._writeProperty(p);
            first = false;
            if (indent) {
                this._writer.writeLine();
            }
        }

        if (indent) {
            this._writer.outdent();
        }
        this._writeToken(properties.closeBrace, indent);
        this._writeComments(properties.trailingComments);
    }

    private _writeProperty(p: AlphaTexPropertyNode) {
        this._writeComments(p.leadingComments);

        this._writeValue(p.property);
        if (p.values) {
            this._writer.write(' ');
            this._writeValues(p.values);
        }

        this._writeComments(p.trailingComments);
    }

    private _writeValues(values: AlphaTexValueList) {
        this._writeComments(values.leadingComments);
        this._writeToken(values.openParenthesis, false);
        let first = true;
        for (const v of values.values) {
            if (!first) {
                this._writer.write(' ');
            }
            this._writeValue(v);
            first = false;
        }
        this._writeToken(values.closeParenthesis, false);
        this._writeComments(values.trailingComments);
    }

    private _writeValue(v: IAlphaTexAstNode | undefined) {
        if (!v) {
            return;
        }
        this._writeComments(v.leadingComments);
        switch (v.nodeType) {
            case AlphaTexNodeType.Ident:
                this._writer.write((v as AlphaTexIdentifier).text);
                break;

            case AlphaTexNodeType.Values:
                this._writeValues(v as AlphaTexValueList);
                break;
            case AlphaTexNodeType.Number:
                this._writer.write((v as AlphaTexNumberLiteral).value.toString());
                break;
            case AlphaTexNodeType.String:
                this._writer.writeString((v as AlphaTexStringLiteral).text);
                break;
        }
        this._writeComments(v.trailingComments);
    }

    private _writeToken(tokenNode: IAlphaTexAstNode | undefined, newLine: boolean) {
        if (tokenNode) {
            this._writeComments(tokenNode.leadingComments);
            switch (tokenNode.nodeType) {
                case AlphaTexNodeType.Dot:
                    this._writer.write('.');
                    break;
                case AlphaTexNodeType.Backslash:
                    this._writer.write('\\');
                    break;
                case AlphaTexNodeType.DoubleBackslash:
                    this._writer.write('\\\\');
                    break;
                case AlphaTexNodeType.Pipe:
                    this._writer.write('|');
                    break;
                case AlphaTexNodeType.LBrace:
                    this._writer.write('{');
                    break;
                case AlphaTexNodeType.RBrace:
                    this._writer.write('}');
                    break;
                case AlphaTexNodeType.LParen:
                    this._writer.write('(');
                    break;
                case AlphaTexNodeType.RParen:
                    this._writer.write(')');
                    break;
                case AlphaTexNodeType.Colon:
                    this._writer.write(':');
                    break;
                case AlphaTexNodeType.Asterisk:
                    this._writer.write('*');
                    break;
            }
            this._writeComments(tokenNode.trailingComments);
            if (newLine) {
                this._writer.writeLine();
            }
        }
    }

    private _writeComments(comments: AlphaTexComment[] | undefined) {
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
 * @public
 */
export class AlphaTexExporter extends ScoreExporter {
    private _handler: IAlphaTexLanguageImportHandler = AlphaTex1LanguageHandler.instance;

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
        printer.writeScoreNode(this._score(score));
        return printer.tex;
    }

    private _score(data: Score): AlphaTexScoreNode {
        const score: AlphaTexScoreNode = {
            nodeType: AlphaTexNodeType.Score,
            bars: []
        };

        for (const t of data.tracks) {
            this._track(score, t);
        }

        if (score.bars.length === 0) {
            score.bars.push({
                nodeType: AlphaTexNodeType.Bar,
                metaData: this._handler.buildScoreMetaDataNodes(data),
                beats: []
            });
        } else {
            score.bars[0].metaData = this._handler
                .buildScoreMetaDataNodes(data)
                .concat(score.bars[0].metaData as AlphaTexMetaDataNode[]);
        }

        score.bars.push({
            nodeType: AlphaTexNodeType.Bar,
            metaData: this._handler.buildSyncPointNodes(data),
            beats: []
        });

        return score;
    }

    private _track(score: AlphaTexScoreNode, data: Track) {
        for (const s of data.staves) {
            this._staff(score, s);
        }
    }

    private _staff(score: AlphaTexScoreNode, data: Staff) {
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
                this._voice(score, v, data, voiceCount > 1);
            }
        }
    }

    private _voice(score: AlphaTexScoreNode, v: number, data: Staff, isMultiVoice: boolean) {
        for (const bar of data.bars) {
            this._bar(score, bar, v, isMultiVoice);
        }
    }

    private _bar(score: AlphaTexScoreNode, data: Bar, voiceIndex: number, isMultiVoice: boolean) {
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
                    bar.beats.push(this._beat(b));
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
                nodeType: AlphaTexNodeType.Pipe
            };
        }

        score.bars.push(bar);
    }

    private _beat(data: Beat): AlphaTexBeatNode {
        const beat: AlphaTexBeatNode = {
            nodeType: AlphaTexNodeType.Beat,
            durationChange: undefined,
            notes: undefined,
            rest: undefined,
            beatEffects: undefined
        };

        if (data.isRest) {
            beat.rest = {
                nodeType: AlphaTexNodeType.Ident,
                text: 'r'
            };
        } else {
            beat.notes = this._notes(data.notes);
        }

        beat.durationDot = {
            nodeType: AlphaTexNodeType.Dot
        };
        beat.durationValue = {
            nodeType: AlphaTexNodeType.Number,
            value: data.duration as number
        };

        beat.beatEffects = this._beatEffects(data);

        return beat;
    }

    private _beatEffects(data: Beat): AlphaTexPropertiesNode | undefined {
        const properties = this._handler.buildBeatEffects(data);
        return properties.length > 0
            ? {
                  nodeType: AlphaTexNodeType.Props,
                  openBrace: {
                      nodeType: AlphaTexNodeType.LBrace
                  },
                  properties,
                  closeBrace: {
                      nodeType: AlphaTexNodeType.RBrace
                  }
              }
            : undefined;
    }

    private _notes(data: Note[]): AlphaTexNoteListNode {
        const notes: AlphaTexNoteListNode = {
            nodeType: AlphaTexNodeType.NoteList,
            openParenthesis: undefined,
            notes: [],
            closeParenthesis: undefined
        };

        if (data.length === 0 || data.length > 1) {
            notes.openParenthesis = {
                nodeType: AlphaTexNodeType.LParen
            };
            notes.closeParenthesis = {
                nodeType: AlphaTexNodeType.RParen
            };
        }

        for (const n of data) {
            notes.notes.push(this._note(n));
        }

        return notes;
    }

    private _note(data: Note): AlphaTexNoteNode {
        const note: AlphaTexNoteNode = {
            nodeType: AlphaTexNodeType.Note,
            noteValue: {
                // placeholder value
                nodeType: AlphaTexNodeType.Ident,
                text: ''
            } as AlphaTexIdentifier
        };

        if (data.isPercussion) {
            note.noteValue = {
                nodeType: AlphaTexNodeType.String,
                text: PercussionMapper.getArticulationName(data)
            } as AlphaTexStringLiteral;
        } else if (data.isPiano) {
            note.noteValue = {
                nodeType: AlphaTexNodeType.Ident,
                text: Tuning.getTextForTuning(data.realValueWithoutHarmonic, true)
            } as AlphaTexIdentifier;
        } else if (data.isStringed) {
            note.noteValue = {
                nodeType: AlphaTexNodeType.Number,
                value: data.fret
            } as AlphaTexNumberLiteral;
            note.noteStringDot = {
                nodeType: AlphaTexNodeType.Dot
            };
            const stringNumber = data.beat.voice.bar.staff.tuning.length - data.string + 1;
            note.noteString = {
                nodeType: AlphaTexNodeType.Number,
                value: stringNumber
            };
        } else {
            throw new Error('What kind of note');
        }

        note.noteEffects = this._noteEffects(data);

        return note;
    }

    private _noteEffects(data: Note): AlphaTexPropertiesNode | undefined {
        const properties = this._handler.buildNoteEffects(data);
        return properties.length > 0
            ? {
                  nodeType: AlphaTexNodeType.Props,
                  openBrace: {
                      nodeType: AlphaTexNodeType.LBrace
                  },
                  properties,
                  closeBrace: {
                      nodeType: AlphaTexNodeType.RBrace
                  }
              }
            : undefined;
    }
}
