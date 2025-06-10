// This is a Port of pretty-format to a OOP TypeScript
// for the use in cross-compiled C# and Kotlin code.
// its also stripped down to the needs of alphaTab.

/*
 * MIT License
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * Copyright Contributors to the Jest project.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// https://github.com/jestjs/jest/blob/main/packages/pretty-format

export class PrettyFormatConfig {
    public escapeString: boolean = true;
    public indent: string = '  ';
    public maxDepth: number = Number.POSITIVE_INFINITY;
    public maxWidth: number = Number.POSITIVE_INFINITY;
    public min: boolean = false;
    public plugins: PrettyFormatNewPlugin[] = [];
    public printBasicPrototype: boolean = true;
    public printFunctionName: boolean = true;
    public spacingInner: string = '\n';
    public spacingOuter: string = '\n';
}

export type PrettyFormatPrinter = (
    val: unknown,
    config: PrettyFormatConfig,
    indentation: string,
    depth: number,
    refs: unknown[]
) => string;

interface PrettyFormatNewPlugin {
    serialize(
        val: unknown,
        config: PrettyFormatConfig,
        indentation: string,
        depth: number,
        refs: unknown[],
        printer: PrettyFormatPrinter
    ): string;
    test(arg0: unknown): boolean;
}

/**
 * @partial
 */
export class PrettyFormat {
    static findPlugin(plugins: PrettyFormatNewPlugin[], val: unknown) {
        for (const plugin of plugins) {
            if (plugin.test(val)) {
                return plugin;
            }
        }
        return null;
    }

    static printer(
        val: unknown,
        config: PrettyFormatConfig,
        indentation: string,
        depth: number,
        refs: unknown[]
    ): string {
        const plugin = PrettyFormat.findPlugin(config.plugins, val);
        if (plugin !== null) {
            return plugin.serialize(val, config, indentation, depth, refs, PrettyFormat.printer);
        }

        const basicResult = PrettyFormat.printBasicValue(val, config.escapeString);
        if (basicResult !== null) {
            return basicResult;
        }

        return PrettyFormat.printComplexValue(val, config, indentation, depth, refs);
    }

    static printNumber(val: number): string {
        return val.toString();
    }

    static printBigInt(val: bigint): string {
        return `${val}n`;
    }

    static printError(val: Error): string {
        return `[${val.toString()}]`;
    }

    /**
     * The first port of call for printing an object, handles most of the
     * data-types in JS.
     */
    static printBasicValue(val: unknown, escapeString: boolean): string | null {
        switch (typeof val) {
            case 'string':
                if (escapeString) {
                    return `"${(val as string).replaceAll(/"|\\/g, '\\$&')}"`;
                }
                return `"${val}"`;
            case 'number':
                return PrettyFormat.printNumber(val as number);
            case 'bigint':
                return PrettyFormat.printBigInt(val as bigint);
            case 'boolean':
                return `${val}`;
            case 'undefined':
                return 'undefined';
            case 'object':
                if (val === null) {
                    return 'null';
                }
                break;
        }

        return null;
    }

    static tryGetIterableType(val: unknown): string {
        if (val instanceof Float32Array) {
            return 'Float32Array';
        }
        if (val instanceof Int16Array) {
            return 'Int16Array';
        }
        if (val instanceof Int32Array) {
            return 'Int32Array';
        }
        if (val instanceof Uint8Array) {
            return 'Uint8Array';
        }
        if (val instanceof Uint16Array) {
            return 'Uint16Array';
        }
        if (val instanceof Uint32Array) {
            return 'Uint32Array';
        }
        if (Array.isArray(val)) {
            return 'Array';
        }
        if (val instanceof Set) {
            return 'Set';
        }

        return '';
    }

    /**
     * Handles more complex objects ( such as objects with circular references.
     * maps and sets etc )
     */
    static printComplexValue(
        val: unknown,
        config: PrettyFormatConfig,
        indentation: string,
        depth: number,
        refs: unknown[]
    ): string {
        if (refs.includes(val)) {
            return '[Circular]';
        }
        refs = [...refs];
        refs.push(val);

        const hitMaxDepth = ++depth > config.maxDepth;
        const min = config.min;

        const arrayTypeName = PrettyFormat.tryGetIterableType(val);
        if (arrayTypeName) {
            return hitMaxDepth
                ? `[${arrayTypeName}]`
                : `${
                      min ? '' : `${arrayTypeName} `
                  }[${PrettyFormat.printIterableValues(TestPlatform.typedArrayAsUnknownIterable(val), config, indentation, depth, refs, PrettyFormat.printer)}]`;
        }

        if (val instanceof Map) {
            return hitMaxDepth
                ? '[Map]'
                : `Map {${PrettyFormat.printIteratorEntries(TestPlatform.mapAsUnknownIterable(val), config, indentation, depth, refs, PrettyFormat.printer, ' => ')}}`;
        }

        return '';
    }

    /**
     * Return entries (for example, of a map)
     * with spacing, indentation, and comma
     * without surrounding punctuation (for example, braces)
     */
    static printIteratorEntries(
        iterator: Iterable<[unknown, unknown]>,
        config: PrettyFormatConfig,
        indentation: string,
        depth: number,
        refs: unknown[],
        printer: PrettyFormatPrinter,
        // Too bad, so sad that separator for ECMAScript Map has been ' => '
        // What a distracting diff if you change a data structure to/from
        // ECMAScript Object or Immutable.Map/OrderedMap which use the default.
        separator = ': '
    ): string {
        let result = '';
        let width = 0;

        const indentationNext = indentation + config.indent;
        for (const current of iterator) {
            if (result.length === 0) {
                result += config.spacingOuter;
            } else {
                result += `,${config.spacingInner}`;
            }

            result += indentationNext;

            if (width++ === config.maxWidth) {
                result += '…';
                break;
            }

            const name = printer(current[0], config, indentationNext, depth, refs);
            const value = printer(current[1], config, indentationNext, depth, refs);

            result += name + separator + value;
        }

        if (result.length > 0) {
            result += ',';
            result += config.spacingOuter + indentation;
        }

        return result;
    }

    /**
     * Return values (for example, of a set)
     * with spacing, indentation, and comma
     * without surrounding punctuation (braces or brackets)
     */
    static printIterableValues(
        iterator: Iterable<unknown>,
        config: PrettyFormatConfig,
        indentation: string,
        depth: number,
        refs: unknown[],
        printer: PrettyFormatPrinter
    ): string {
        let result = '';
        let width = 0;

        const indentationNext = indentation + config.indent;
        for (const current of iterator) {
            if (result.length === 0) {
                result += config.spacingOuter;
                result += indentationNext;
            } else {
                result += `,${config.spacingInner}`;
                result += indentationNext;
            }

            if (width++ === config.maxWidth) {
                result += '…';
                break;
            }

            result += printer(current, config, indentationNext, depth, refs);
        }

        if (result.length > 0) {
            result += ',';
            result += config.spacingOuter + indentation;
        }

        return result;
    }

    /**
     * Returns a presentation string of your `val` object
     * @param val any potential JavaScript object
     * @param options Custom settings
     */
    public static format(val: unknown, config?: PrettyFormatConfig): string {
        return PrettyFormat.printer(val, config ?? new PrettyFormatConfig(), '', 0, []);
    }
}

import { ScoreSerializer } from '@src/generated/model/ScoreSerializer';
import { MasterBarSerializer } from '@src/generated/model/MasterBarSerializer';
import { TrackSerializer } from '@src/generated/model/TrackSerializer';
import { StaffSerializer } from '@src/generated/model/StaffSerializer';
import { BarSerializer } from '@src/generated/model/BarSerializer';
import { VoiceSerializer } from '@src/generated/model/VoiceSerializer';
import { BeatSerializer } from '@src/generated/model/BeatSerializer';
import { NoteSerializer } from '@src/generated/model/NoteSerializer';
import { TestPlatform } from './TestPlatform';
import { Bar } from '@src/model/Bar';
import { Beat } from '@src/model/Beat';
import { JsonConverter } from '@src/model/JsonConverter';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { Score } from '@src/model/Score';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { Voice } from '@src/model/Voice';

/**
 * A serializer plugin for pretty-format for creating simple Score model snapshots
 * @partial
 */
export class ScoreSerializerPlugin implements PrettyFormatNewPlugin {
    public static readonly instance = new ScoreSerializerPlugin();

    private defaultScoreJson: Map<string, unknown>;
    private defaultMasterBarJson: Map<string, unknown>;
    private defaultTrackJson: Map<string, unknown>;
    private defaultStaffJson: Map<string, unknown>;
    private defaultBarJson: Map<string, unknown>;
    private defaultVoiceJson: Map<string, unknown>;
    private defaultBeatJson: Map<string, unknown>;
    private defaultNoteJson: Map<string, unknown>;

    private constructor() {
        // we create empty basic objects and reset some props we always want in the snapshot
        const defaultScore = new Score();
        const defaultMasterBar = new MasterBar();
        defaultMasterBar.index = -1;

        const defaultTrack = new Track();
        defaultTrack.index = -1;

        const defaultStaff = new Staff();
        defaultStaff.index = -1;

        const defaultBar = new Bar();
        defaultBar.id = -1;
        defaultBar.index = -1;

        const defaultVoice = new Voice();
        defaultVoice.id = -1;
        defaultVoice.index = -1;

        const defaultBeat = new Beat();
        defaultBeat.id = -1;
        defaultBeat.index = -1;

        const defaultNote = new Note();
        defaultNote.id = -1;
        defaultNote.index = -1;

        this.defaultScoreJson = ScoreSerializer.toJson(defaultScore)!;
        this.defaultMasterBarJson = MasterBarSerializer.toJson(defaultMasterBar)!;
        this.defaultTrackJson = TrackSerializer.toJson(defaultTrack)!;
        this.defaultStaffJson = StaffSerializer.toJson(defaultStaff)!;
        this.defaultBarJson = BarSerializer.toJson(defaultBar)!;
        this.defaultVoiceJson = VoiceSerializer.toJson(defaultVoice)!;
        this.defaultBeatJson = BeatSerializer.toJson(defaultBeat)!;
        this.defaultNoteJson = NoteSerializer.toJson(defaultNote)!;
    }

    public serialize(
        val: unknown,
        config: PrettyFormatConfig,
        indentation: string,
        depth: number,
        refs: unknown[],
        printer: PrettyFormatPrinter
    ): string {
        const json = JsonConverter.scoreToJsObject(val as Score);
        this.filterOutDefaultValues(json as Map<string, unknown>);
        return printer(json, config, indentation, depth, refs);
    }

    public test(arg0: unknown): boolean {
        return arg0 instanceof Score;
    }

    private filterOutDefaultValues(scoreJson: Map<string, unknown>) {
        const masterBars = scoreJson.get('masterbars') as Map<string, unknown>[];
        for (const masterBar of masterBars) {
            ScoreSerializerPlugin.sanitizeJson(masterBar, this.defaultMasterBarJson, 'MasterBar');
        }

        const tracks = scoreJson.get('tracks') as Map<string, unknown>[];
        for (const track of tracks) {
            const staves = track.get('staves') as Map<string, unknown>[];
            for (const staff of staves) {
                const bars = staff.get('bars') as Map<string, unknown>[];
                for (const bar of bars) {
                    const voices = bar.get('voices') as Map<string, unknown>[];
                    for (const voice of voices) {
                        const beats = voice.get('beats') as Map<string, unknown>[];
                        for (const beat of beats) {
                            const notes = beat.get('notes') as Map<string, unknown>[];
                            for (const note of notes) {
                                ScoreSerializerPlugin.sanitizeJson(note, this.defaultNoteJson, 'Note');
                            }
                            ScoreSerializerPlugin.sanitizeJson(beat, this.defaultBeatJson, 'Beat');
                        }
                        ScoreSerializerPlugin.sanitizeJson(voice, this.defaultVoiceJson, 'Voice');
                    }
                    ScoreSerializerPlugin.sanitizeJson(bar, this.defaultBarJson, 'Bar');
                }
                ScoreSerializerPlugin.sanitizeJson(staff, this.defaultStaffJson, 'Staff');
            }
            ScoreSerializerPlugin.sanitizeJson(track, this.defaultTrackJson, 'Track');
        }

        // walk hierarchy and filter out stuff
        ScoreSerializerPlugin.sanitizeJson(scoreJson, this.defaultScoreJson, 'Score');
    }

    private static sanitizeJson(
        modelJson: Map<string, unknown>,
        defaultValueJson: Map<string, unknown>,
        kind?: string
    ) {
        const oldMap = new Map<string, unknown>(modelJson);
        modelJson.clear();

        // add a __kind property to identify the objects easier in the snap files
        if (kind) {
            modelJson.set('__kind', kind);
        }

        for (const [k, v] of oldMap) {
            if (defaultValueJson.has(k)) {
                const dv = defaultValueJson.get(k);

                let isEqual = false;
                if (typeof v === typeof dv) {
                    switch (typeof dv) {
                        case 'string':
                            isEqual = (v as string) === (dv as string);
                            break;
                        case 'number':
                            isEqual = (v as number) === (dv as number);
                            break;
                        case 'bigint':
                            isEqual = (v as bigint) === (dv as bigint);
                            break;
                        case 'boolean':
                            isEqual = (v as boolean) === (dv as boolean);
                            break;
                        case 'undefined':
                            isEqual = (v as undefined) === (dv as undefined);
                            break;
                        case 'object':
                            if (dv === null && v === null) {
                                isEqual = true;
                            } else if (dv instanceof Float32Array && v instanceof Float32Array) {
                                isEqual = dv.length === 0 && v.length === 0;
                            } else if (dv instanceof Int16Array && v instanceof Int16Array) {
                                isEqual = dv.length === 0 && v.length === 0;
                            } else if (dv instanceof Int32Array && v instanceof Int32Array) {
                                isEqual = dv.length === 0 && v.length === 0;
                            } else if (dv instanceof Uint8Array && v instanceof Uint8Array) {
                                isEqual = dv.length === 0 && v.length === 0;
                            } else if (dv instanceof Uint16Array && v instanceof Uint16Array) {
                                isEqual = dv.length === 0 && v.length === 0;
                            } else if (dv instanceof Uint32Array && v instanceof Uint32Array) {
                                isEqual = dv.length === 0 && v.length === 0;
                            } else if (Array.isArray(dv) && Array.isArray(v)) {
                                isEqual =
                                    TestPlatform.typedArrayAsUnknownArray(dv).length === 0 &&
                                    TestPlatform.typedArrayAsUnknownArray(v).length === 0;
                            } else if (dv instanceof Map && v instanceof Map) {
                                ScoreSerializerPlugin.sanitizeJson(
                                    v as Map<string, unknown>,
                                    dv as Map<string, unknown>
                                );

                                if ((v as Map<string, unknown>).size === 0) {
                                    isEqual = true;
                                }
                            } else {
                                isEqual = ScoreSerializerPlugin.isPlatformTypeEqual(v, dv);
                            }
                            break;
                    }
                }

                if (!isEqual) {
                    modelJson.set(k, v);
                }
            } else {
                modelJson.set(k, v);
            }
        }
    }

    /**
     * @target web
     * @partial
     */
    private static isPlatformTypeEqual(v: unknown, dv: unknown): boolean {
        // we should not have any other types in our JSONs, if we extend it, this will catch it
        throw new Error(`Unexpected value in serialized json${String(v)}`);
    }
}

// Some helpers for snapshots on C# and Kotlin compilation
export class SnapshotFileRepository {
    private static _cache: Map<string, SnapshotFile> = new Map<string, SnapshotFile>();

    public static loadSnapshortFile(path: string): SnapshotFile {
        let file = SnapshotFileRepository._cache.get(path);
        if (!file) {
            file = new SnapshotFile();
            file.loadFrom(path);
            SnapshotFileRepository._cache.set(path, file);
        }

        return file;
    }
}

export class SnapshotFile {
    private static createConfig() {
        const c = new PrettyFormatConfig();
        c.plugins.push(ScoreSerializerPlugin.instance);
        return c;
    }
    private static readonly matchOptions: PrettyFormatConfig = SnapshotFile.createConfig();

    public snapshots: Map<string, string> = new Map<string, string>();

    /**
     * Matches the given snapshot with the contained one.
     * @param name  The name of the snapshot
     * @param value  The raw value for which to create the snapshot
     * @returns An error message if there was a match error, if they match null
     */
    public match(name: string, value: unknown): string | null {
        const expected = this.snapshots.get(name)?.split('\n');
        if (expected === undefined) {
            return `No snapshot '${name}' found`;
        }

        const actual = PrettyFormat.format(value, SnapshotFile.matchOptions).split('\n');

        const lines = Math.min(expected.length, actual.length);
        const errors: string[] = [];

        if (expected.length !== actual.length) {
            errors.push(`Expected ${expected.length} lines, but only got ${actual.length}`);
        }

        for (let i = 0; i < lines; i++) {
            if (actual[i].trimEnd() !== expected[i].trimEnd()) {
                errors.push(`Error on line ${i + 1}: `);
                errors.push(`+ ${actual[i]}`);
                errors.push(`- ${expected[i]}`);
            }
        }

        if (errors.length > 0) {
            return errors.join('\n');
        }
        return null;
    }

    loadFrom(path: string) {
        const content = TestPlatform.loadFileAsStringSync(path);

        // plain text parsing for C# and kotlin as we cannot "require/import" them
        const lines = content.split('\n');

        let i = 0;
        while (i < lines.length) {
            if (lines[i].startsWith('exports[`')) {
                // start of snapshot
                const endOfName = lines[i].indexOf('`]', 9);
                if (endOfName === -1) {
                    throw new Error(`Failed to parse snapshot file, missing \`] on line ${i + 1}`);
                }

                const name = lines[i].substring(9, endOfName);
                i++;

                let value = '';
                while (i < lines.length) {
                    const line = lines[i++];

                    if (line.startsWith('`;')) {
                        // end of snapshot
                        break;
                    }

                    value += `${line.trimEnd()}\n`;
                }

                this.snapshots.set(name, value.trimEnd());
            } else {
                i++;
            }
        }
    }
}
