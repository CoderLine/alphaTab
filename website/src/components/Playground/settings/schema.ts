import type { Settings, model } from '@coderline/alphatab';
import type { AlphaTabModule } from '@site/src/alphatab-react';

/** A setting value as stored in overrides: plain JSON, colors as CSS strings, fonts as CSS font shorthands. */
export type SettingValue = number | boolean | string;

export type SettingControl =
    | { type: 'toggle' }
    | { type: 'range'; min: number; max: number; step: number; unit?: string; format?: (v: number) => string }
    | { type: 'number'; min?: number; max?: number; step?: number }
    | { type: 'enum'; options: { value: number; label: string }[] }
    | { type: 'segmented'; options: { value: string; label: string }[] }
    | { type: 'color' }
    | { type: 'font' }
    | { type: 'text'; placeholder?: string };

/**
 * How a change takes effect:
 * - `render` re-lays out the notation
 * - `apply` only pushes settings into alphaTab (cursors, scrolling, interaction)
 * - `midi` regenerates the playback, `renderMidi` does both
 * - `player` recreates the audio player (settings alphaTab reads only when creating one)
 * - `reload` re-imports the open file (importer settings)
 * - `none` is read on demand, e.g. by the exporters
 * - `stylesheet` edits the loaded score
 */
export type SettingEffect = 'render' | 'apply' | 'midi' | 'renderMidi' | 'player' | 'reload' | 'none' | 'stylesheet';

interface SettingBase {
    id: string;
    label: string;
    description?: string;
    control: SettingControl;
}

export interface SettingsEntry extends SettingBase {
    effect: Exclude<SettingEffect, 'stylesheet'>;
    read(settings: Settings): SettingValue;
    write(settings: Settings, value: SettingValue, module: AlphaTabModule): void;
}

export interface StylesheetEntry extends SettingBase {
    effect: 'stylesheet';
    read(score: model.Score): SettingValue;
    write(score: model.Score, value: SettingValue): void;
}

export type SchemaEntry = SettingsEntry | StylesheetEntry;

export interface SchemaGroup {
    id: string;
    title: string;
    description?: string;
    /** Stylesheet settings belong to the loaded file and are not persisted. */
    perScore?: boolean;
    entries: SchemaEntry[];
}

type EnumObject = Record<string | number, string | number>;

function humanize(name: string): string {
    return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}

function enumOptions(enumType: EnumObject, labels: Record<string, string> = {}): { value: number; label: string }[] {
    return Object.entries(enumType)
        .filter(([, v]) => typeof v === 'number')
        .map(([k, v]) => ({ value: v as number, label: labels[k] ?? humanize(k) }));
}

function getPath(root: object, path: string): unknown {
    return path.split('.').reduce<any>((o, key) => o?.[key], root);
}

function setPath(root: object, path: string, value: unknown): void {
    const parts = path.split('.');
    const parent = parts.slice(0, -1).reduce<any>((o, key) => o[key], root);
    parent[parts[parts.length - 1]] = value;
}

function plain(path: string, label: string, control: SettingControl, effect: SettingsEntry['effect'] = 'render', description?: string): SettingsEntry {
    return {
        id: path,
        label,
        description,
        control,
        effect,
        read: (s) => getPath(s, path) as SettingValue,
        write: (s, v) => setPath(s, path, v),
    };
}

/** An enum setting shown as segmented buttons; the value is the enum member name. */
function enumSegmented(path: string, label: string, enumType: EnumObject, members: [string, string][], effect: SettingsEntry['effect'] = 'render'): SettingsEntry {
    return {
        id: path,
        label,
        control: { type: 'segmented', options: members.map(([value, l]) => ({ value, label: l })) },
        effect,
        read: (s) => String(enumType[getPath(s, path) as number]),
        write: (s, v) => setPath(s, path, enumType[v as string]),
    };
}

function color(path: string, label: string): SettingsEntry {
    return {
        id: path,
        label,
        control: { type: 'color' },
        effect: 'render',
        read: (s) => (getPath(s, path) as model.Color).rgba,
        write: (s, v, module) => {
            const parsed = module.model.Color.fromJson(v);
            if (parsed) setPath(s, path, parsed);
        },
    };
}

function font(path: string, label: string): SettingsEntry {
    return {
        id: path,
        label,
        control: { type: 'font' },
        effect: 'render',
        read: (s) => (getPath(s, path) as model.Font).toCssString(),
        write: (s, v, module) => {
            const parsed = module.model.Font.fromJson(v);
            if (parsed) setPath(s, path, parsed);
        },
    };
}

function stylesheet(key: keyof model.RenderStylesheet & string, label: string, control: SettingControl): StylesheetEntry {
    return {
        id: `stylesheet.${key}`,
        label,
        control,
        effect: 'stylesheet',
        read: (score) => score.stylesheet[key] as unknown as SettingValue,
        write: (score, v) => {
            (score.stylesheet as unknown as Record<string, unknown>)[key] = v;
        },
    };
}

const NUMBER_MIN_0: SettingControl = { type: 'number', min: 0, step: 1 };
const DURATION: SettingControl = { type: 'number', min: 0.1, step: 0.1 };
const PIXELS: SettingControl = { type: 'number', min: 0, step: 0.1 };
const AUTO = -1;

// ─── Staff element configuration (`stylesheet.scoreConfig` & co.) ──────────
type StaffConfigKey = 'scoreConfig' | 'tabConfig' | 'slashConfig' | 'numberedConfig';
type ElementDisplayKey = 'clef' | 'keySignature' | 'timeSignature' | 'rests';

const ELEMENT_DISPLAY_OPTIONS = [
    { value: AUTO, label: 'Automatic' },
    { value: 0, label: 'Hidden' },
    { value: 1, label: 'All staves, all systems' },
    { value: 2, label: 'All staves, first system' },
    { value: 3, label: 'Primary staff, all systems' },
    { value: 4, label: 'Primary staff, first system' },
];

function elementDisplay(config: StaffConfigKey, key: ElementDisplayKey, label: string, module: AlphaTabModule): StylesheetEntry {
    const { StaffPlacement, SystemDisplay } = module.model;
    return {
        id: `stylesheet.${config}.${key}`,
        label,
        control: { type: 'enum', options: ELEMENT_DISPLAY_OPTIONS },
        effect: 'stylesheet',
        read: (score) => {
            const display = (score.stylesheet[config] as Record<string, model.ElementDisplay | undefined>)[key];
            if (!display) return AUTO;
            if (display.isVisible === false) return 0;
            const primary = display.staffPlacement === StaffPlacement.Primary;
            const first = display.systemDisplay === SystemDisplay.FirstSystemOnly;
            return 1 + (primary ? 2 : 0) + (first ? 1 : 0);
        },
        write: (score, v) => {
            const target = score.stylesheet[config] as Record<string, model.ElementDisplay | undefined>;
            const code = v as number;
            if (code === AUTO) delete target[key];
            else if (code === 0) target[key] = { isVisible: false };
            else
                target[key] = {
                    isVisible: true,
                    staffPlacement: code >= 3 ? StaffPlacement.Primary : StaffPlacement.AllStaves,
                    systemDisplay: code % 2 === 0 ? SystemDisplay.FirstSystemOnly : SystemDisplay.AllSystems,
                };
        },
    };
}

function staffEnum(config: StaffConfigKey, key: 'barNumber' | 'rhythm', label: string, enumType: EnumObject): StylesheetEntry {
    return {
        id: `stylesheet.${config}.${key}`,
        label,
        control: { type: 'enum', options: [{ value: AUTO, label: 'Automatic' }, ...enumOptions(enumType)] },
        effect: 'stylesheet',
        read: (score) => ((score.stylesheet[config] as Record<string, number | undefined>)[key] ?? AUTO),
        write: (score, v) => {
            const target = score.stylesheet[config] as Record<string, number | undefined>;
            if (v === AUTO) delete target[key];
            else target[key] = v as number;
        },
    };
}

/** Layout and stave profile, shown in the quick section. */
export function buildQuickEntries(module: AlphaTabModule): SettingsEntry[] {
    return [
        enumSegmented('display.layoutMode', 'Layout', module.LayoutMode as unknown as EnumObject, [
            ['Page', 'Page'],
            ['Parchment', 'Parchment'],
            ['Horizontal', 'Horizontal'],
        ]),
        {
            ...plain('display.staveProfile', 'Staves', {
                type: 'enum',
                options: enumOptions(module.StaveProfile as unknown as EnumObject, {
                    Default: 'As in the file',
                    ScoreTab: 'Score and tab',
                    TabMixed: 'Tab (score for others)',
                }),
            }),
            description: '"As in the file" keeps the per-staff notation choices of the Tracks panel.',
        },
    ];
}

/**
 * The Playground's "Advanced" settings. Zoom, tempo, highlighting and the audio levels live in the
 * quick section (`PlayerViewSettings`), the player mode in the media sync editor.
 */
export function buildSchema(module: AlphaTabModule): SchemaGroup[] {
    const { model: m } = module;
    const NotationElement = module.NotationElement as unknown as EnumObject;
    const defaultFonts = module.RenderingResources.defaultFonts;

    return [
        {
            id: 'display',
            title: 'Display',
            entries: [
                plain('core.engine', 'Render engine', { type: 'segmented', options: [{ value: 'default', label: 'Auto' }, { value: 'svg', label: 'SVG' }, { value: 'html5', label: 'Canvas' }] }),
                plain('display.stretchForce', 'Stretch', { type: 'range', min: 0.25, max: 2, step: 0.05, format: (v) => `${v.toFixed(2)}×` }),
                plain('display.spacingRatio', 'Spacing ratio', { type: 'range', min: 1, max: 3, step: 0.05, format: (v) => v.toFixed(2) }, 'render', 'How much longer notes get more space than shorter ones'),
                {
                    ...plain('display.barsPerRow', 'Bars per system', { type: 'range', min: 0, max: 16, step: 1, format: (v) => (v === 0 ? 'auto' : String(v)) }),
                    // alphaTab uses -1 for "automatic"; 0 is not a valid count, so the slider's 0 maps to it.
                    read: (s) => Math.max(0, s.display.barsPerRow),
                    write: (s, v) => {
                        s.display.barsPerRow = (v as number) <= 0 ? -1 : (v as number);
                    },
                },
                plain('display.startBar', 'Start bar', { type: 'number', min: 1, step: 1 }),
                {
                    ...plain('display.barCount', 'Bar count', { type: 'number', min: 0, step: 1 }, 'render', '0 shows all bars'),
                    read: (s) => Math.max(0, s.display.barCount),
                    write: (s, v) => {
                        s.display.barCount = (v as number) <= 0 ? -1 : (v as number);
                    },
                },
                plain('display.justifyLastSystem', 'Justify last system', { type: 'toggle' }),
                plain('display.lastSystemFillThreshold', 'Last system fill threshold', { type: 'range', min: 0, max: 1, step: 0.05, format: (v) => `${Math.round(v * 100)}%` }, 'render', 'Justifies the last system once it is filled at least this much'),
                plain('display.systemsLayoutMode', 'Systems layout', { type: 'enum', options: enumOptions(module.SystemsLayoutMode as unknown as EnumObject) }),
                plain('display.barCountPerPartial', 'Bars per render partial', { type: 'number', min: 1, step: 1 }),
            ],
        },
        {
            id: 'notation',
            title: 'Notation',
            entries: [
                plain('notation.notationMode', 'Notation mode', { type: 'enum', options: enumOptions(module.NotationMode as unknown as EnumObject, { GuitarPro: 'Guitar Pro', SongBook: 'Song book' }) }, 'renderMidi'),
                plain('notation.fingeringMode', 'Fingering', { type: 'enum', options: enumOptions(module.FingeringMode as unknown as EnumObject) }),
                plain('notation.rhythmMode', 'Tab rhythm stems', { type: 'enum', options: enumOptions(module.TabRhythmMode as unknown as EnumObject) }),
                plain('notation.rhythmHeight', 'Tab rhythm height', { type: 'number', min: 1, step: 1 }),
                plain('notation.smallGraceTabNotes', 'Small grace notes in tabs', { type: 'toggle' }),
                plain('notation.extendBendArrowsOnTiedNotes', 'Extend bend arrows on tied notes', { type: 'toggle' }),
                plain('notation.extendLineEffectsToBeatEnd', 'Extend line effects to beat end', { type: 'toggle' }),
                plain('notation.slurHeight', 'Slur height', { type: 'number', min: 1, step: 1 }),
            ],
        },
        {
            id: 'elements',
            title: 'Notation elements',
            description: 'Show or hide individual parts of the notation.',
            entries: Object.entries(NotationElement)
                .filter(([, v]) => typeof v === 'number')
                .map(([name, value]): SettingsEntry => ({
                    id: `notation.elements.${name}`,
                    label: humanize(name.replace(/^Effect/, '')),
                    control: { type: 'toggle' },
                    effect: 'render',
                    read: (s) => s.notation.isNotationElementVisible(value as number),
                    write: (s, v) => {
                        s.notation.elements.set(value as number, v as boolean);
                    },
                })),
        },
        {
            id: 'colors',
            title: 'Colors',
            entries: [
                color('display.resources.staffLineColor', 'Staff lines'),
                color('display.resources.barSeparatorColor', 'Bar separators'),
                color('display.resources.barNumberColor', 'Bar numbers'),
                color('display.resources.mainGlyphColor', 'Main glyphs'),
                color('display.resources.secondaryGlyphColor', 'Secondary glyphs'),
                color('display.resources.scoreInfoColor', 'Score info'),
            ],
        },
        {
            id: 'fonts',
            title: 'Fonts',
            description: 'Text fonts per notation element; the music symbols come from the SMuFL music font.',
            entries: [
                ...[...defaultFonts.keys()].map((element): SettingsEntry => ({
                    id: `display.resources.elementFonts.${NotationElement[element]}`,
                    label: humanize(String(NotationElement[element]).replace(/^Effect/, '')),
                    control: { type: 'font' },
                    effect: 'render',
                    read: (s) => (s.display.resources.elementFonts.get(element) ?? defaultFonts.get(element)!).toCssString(),
                    write: (s, v, mod) => {
                        const parsed = mod.model.Font.fromJson(v);
                        if (parsed) s.display.resources.elementFonts.set(element, parsed);
                    },
                })),
                font('display.resources.tablatureFont', 'Tablature numbers'),
                font('display.resources.graceFont', 'Tablature grace numbers'),
                font('display.resources.numberedNotationFont', 'Numbered notation'),
                font('display.resources.numberedNotationGraceFont', 'Numbered notation grace notes'),
            ],
        },
        {
            id: 'engraving',
            title: 'Engraving',
            description: 'Metrics of the music font in pixels at 100% zoom.',
            entries: (
                [
                    ['musicFontSize', 'Music font size'],
                    ['oneStaffSpace', 'Staff space'],
                    ['tabLineSpacing', 'Tab line spacing'],
                    ['staffLineThickness', 'Staff line thickness'],
                    ['stemThickness', 'Stem thickness'],
                    ['standardStemLength', 'Stem length'],
                    ['beamThickness', 'Beam thickness'],
                    ['beamSpacing', 'Beam spacing'],
                    ['legerLineThickness', 'Leger line thickness'],
                    ['legerLineExtension', 'Leger line extension'],
                    ['thinBarlineThickness', 'Thin barline thickness'],
                    ['thickBarlineThickness', 'Thick barline thickness'],
                    ['slurMidpointThickness', 'Slur thickness'],
                    ['tieMidpointThickness', 'Tie thickness'],
                    ['hairpinThickness', 'Hairpin thickness'],
                ] as const
            ).map(([key, label]) => plain(`display.resources.engravingSettings.${key}`, label, PIXELS)),
        },
        {
            id: 'paddings',
            title: 'Paddings',
            entries: [
                {
                    id: 'display.padding.0',
                    label: 'Horizontal',
                    control: NUMBER_MIN_0,
                    effect: 'render',
                    read: (s) => s.display.padding[0],
                    write: (s, v) => {
                        s.display.padding = [v as number, s.display.padding[1]];
                    },
                },
                {
                    id: 'display.padding.1',
                    label: 'Vertical',
                    control: NUMBER_MIN_0,
                    effect: 'render',
                    read: (s) => s.display.padding[1],
                    write: (s, v) => {
                        s.display.padding = [s.display.padding[0], v as number];
                    },
                },
                plain('display.firstSystemPaddingTop', 'First system top', NUMBER_MIN_0),
                plain('display.systemPaddingTop', 'Other systems top', NUMBER_MIN_0),
                plain('display.lastSystemPaddingBottom', 'Last system bottom', NUMBER_MIN_0),
                plain('display.systemPaddingBottom', 'Other systems bottom', NUMBER_MIN_0),
                plain('display.systemLabelPaddingLeft', 'System label left', NUMBER_MIN_0),
                plain('display.systemLabelPaddingRight', 'System label right', NUMBER_MIN_0),
                plain('display.accoladeBarPaddingRight', 'Accolade bar right', NUMBER_MIN_0),
                plain('display.firstNotationStaffPaddingTop', 'First notation staff top', NUMBER_MIN_0),
                plain('display.lastNotationStaffPaddingBottom', 'Last notation staff bottom', NUMBER_MIN_0),
                plain('display.notationStaffPaddingTop', 'Notation staff top', NUMBER_MIN_0),
                plain('display.notationStaffPaddingBottom', 'Notation staff bottom', NUMBER_MIN_0),
                plain('display.trackStaffPaddingBetween', 'Between staves of a track', NUMBER_MIN_0),
                plain('display.effectStaffPaddingTop', 'Effect staff top', NUMBER_MIN_0),
                plain('display.effectStaffPaddingBottom', 'Effect staff bottom', NUMBER_MIN_0),
                plain('display.effectBandPaddingBottom', 'Effect band bottom', NUMBER_MIN_0),
                plain('display.lyricLinesPaddingBetween', 'Between lyric lines', NUMBER_MIN_0),
                plain('display.inlineTuningPaddingRight', 'Inline tuning right', NUMBER_MIN_0),
                plain('display.firstStaffPaddingLeft', 'First staff left', NUMBER_MIN_0),
                plain('display.staffPaddingLeft', 'Other staves left', NUMBER_MIN_0),
            ],
        },
        {
            id: 'cursor',
            title: 'Cursor & interaction',
            entries: [
                plain('player.enableCursor', 'Show cursors', { type: 'toggle' }, 'apply'),
                plain('player.enableAnimatedBeatCursor', 'Animated beat cursor', { type: 'toggle' }, 'apply'),
                plain('player.enableUserInteraction', 'Interact with the score', { type: 'toggle' }, 'apply'),
                plain('player.enableSeekToClick', 'Click seeks the player', { type: 'toggle' }, 'apply'),
                plain('player.enablePlaybackRangeSelection', 'Drag selects a playback range', { type: 'toggle' }, 'apply'),
                plain('player.resetPlaybackRangeOnClick', 'Click clears the playback range', { type: 'toggle' }, 'apply'),
                plain('player.scrollMode', 'Scroll mode', { type: 'enum', options: enumOptions(module.ScrollMode as unknown as EnumObject) }, 'apply'),
                plain('player.scrollSpeed', 'Scroll animation (ms)', { type: 'number', min: 0, step: 50 }, 'apply'),
                plain('player.nativeBrowserSmoothScroll', 'Native smooth scrolling', { type: 'toggle' }, 'apply'),
                plain('player.scrollOffsetX', 'Scroll offset X', { type: 'number', step: 1 }, 'apply'),
                plain('player.scrollOffsetY', 'Scroll offset Y', { type: 'number', step: 1 }, 'apply'),
            ],
        },
        {
            id: 'audio',
            title: 'Audio generation',
            entries: [
                plain('player.playTripletFeel', 'Play swing / triplet feel', { type: 'toggle' }, 'midi'),
                plain('player.songBookBendDuration', 'Song-book bend duration', DURATION, 'midi'),
                plain('player.songBookDipDuration', 'Song-book dip duration', DURATION, 'midi'),
                plain('player.vibrato.noteWideLength', 'Note vibrato wide length', DURATION, 'midi'),
                plain('player.vibrato.noteWideAmplitude', 'Note vibrato wide amplitude', DURATION, 'midi'),
                plain('player.vibrato.noteSlightLength', 'Note vibrato slight length', DURATION, 'midi'),
                plain('player.vibrato.noteSlightAmplitude', 'Note vibrato slight amplitude', DURATION, 'midi'),
                plain('player.vibrato.beatWideLength', 'Beat vibrato wide length', DURATION, 'midi'),
                plain('player.vibrato.beatWideAmplitude', 'Beat vibrato wide amplitude', DURATION, 'midi'),
                plain('player.vibrato.beatSlightLength', 'Beat vibrato slight length', DURATION, 'midi'),
                plain('player.vibrato.beatSlightAmplitude', 'Beat vibrato slight amplitude', DURATION, 'midi'),
                plain('player.slide.simpleSlidePitchOffset', 'Simple slide pitch offset', { type: 'number', min: 1, step: 1 }, 'midi'),
                plain('player.slide.simpleSlideDurationRatio', 'Simple slide duration ratio', { type: 'range', min: 0.1, max: 1, step: 0.05 }, 'midi'),
                plain('player.slide.shiftSlideDurationRatio', 'Shift slide duration ratio', { type: 'range', min: 0.1, max: 1, step: 0.05 }, 'midi'),
            ],
        },
        {
            id: 'output',
            title: 'Audio output',
            description: 'Changing these recreates the audio player.',
            entries: [
                plain('player.outputMode', 'Output', { type: 'enum', options: enumOptions(module.PlayerOutputMode as unknown as EnumObject, { WebAudioAudioWorklets: 'Audio worklet', WebAudioScriptProcessor: 'Script processor (legacy)' }) }, 'player'),
                plain('player.bufferTimeInMilliseconds', 'Buffer (ms)', { type: 'number', min: 50, step: 50 }, 'player'),
            ],
        },
        {
            id: 'importer',
            title: 'Import',
            description: 'Changing these opens the file again.',
            entries: [
                plain('importer.encoding', 'Text encoding', { type: 'text', placeholder: 'utf-8' }, 'reload'),
                plain('importer.gp3To5encoding', 'Text encoding (Guitar Pro 3–5)', { type: 'text', placeholder: 'windows-1252' }, 'reload'),
                plain('importer.mergePartGroupsInMusicXml', 'Merge MusicXML part groups', { type: 'toggle' }, 'reload'),
                plain('importer.beatTextAsLyrics', 'Beat texts as lyrics', { type: 'toggle' }, 'reload'),
                plain('importer.maxDecodingBufferSize', 'Max. decoding buffer (bytes)', { type: 'number', min: 1024, step: 1024 }, 'reload'),
            ],
        },
        {
            id: 'exporter',
            title: 'Export',
            description: 'Used by the alphaTex export and conversion.',
            entries: [
                plain('exporter.indent', 'Indent (negative: no formatting)', { type: 'number', min: -1, step: 1 }, 'none'),
                plain('exporter.comments', 'Write comments', { type: 'toggle' }, 'none'),
            ],
        },
        {
            id: 'core',
            title: 'Developer',
            entries: [
                plain('core.useWorkers', 'Render in a web worker', { type: 'toggle' }),
                plain('core.enableLazyLoading', 'Lazy loading of render partials', { type: 'toggle' }),
                plain('core.includeNoteBounds', 'Include note bounds', { type: 'toggle' }, 'render', 'Adds note positions to the bounds lookup'),
                {
                    ...plain('core.logLevel', 'Log level', { type: 'enum', options: enumOptions(module.LogLevel as unknown as EnumObject) }, 'apply'),
                    write: (s, v, mod) => {
                        s.core.logLevel = v as number;
                        mod.Logger.logLevel = v as number;
                    },
                },
            ],
        },
        {
            id: 'stylesheet',
            title: 'Score stylesheet',
            perScore: true,
            entries: [
                stylesheet('hideDynamics', 'Hide dynamics', { type: 'toggle' }),
                stylesheet('hideEmptyStaves', 'Hide empty staves', { type: 'toggle' }),
                stylesheet('hideEmptyStavesInFirstSystem', 'Also in the first system', { type: 'toggle' }),
                stylesheet('extendBarLines', 'Bar lines across staves', { type: 'toggle' }),
                stylesheet('showSingleStaffBrackets', 'Brackets on single staves', { type: 'toggle' }),
                stylesheet('bracketExtendMode', 'Bracket extend mode', { type: 'enum', options: enumOptions(m.BracketExtendMode as unknown as EnumObject) }),
                stylesheet('useSystemSignSeparator', 'System sign separator', { type: 'toggle' }),
                stylesheet('globalDisplayTuning', 'Show guitar tuning', { type: 'toggle' }),
                stylesheet('tuningDisplayMode', 'Tuning placement', { type: 'enum', options: enumOptions(m.TuningDisplayMode as unknown as EnumObject, { Score: 'Above the score', Staff: 'At the staff' }) }),
                stylesheet('globalDisplayChordDiagramsOnTop', 'Chord diagrams on top', { type: 'toggle' }),
                stylesheet('globalDisplayChordDiagramsInScore', 'Chord diagrams in the score', { type: 'toggle' }),
                stylesheet('singleTrackTrackNamePolicy', 'Track names (single track)', { type: 'enum', options: enumOptions(m.TrackNamePolicy as unknown as EnumObject) }),
                stylesheet('multiTrackTrackNamePolicy', 'Track names (multi track)', { type: 'enum', options: enumOptions(m.TrackNamePolicy as unknown as EnumObject) }),
                stylesheet('firstSystemTrackNameMode', 'First system name format', { type: 'enum', options: enumOptions(m.TrackNameMode as unknown as EnumObject) }),
                stylesheet('firstSystemTrackNameOrientation', 'First system name orientation', { type: 'enum', options: enumOptions(m.TrackNameOrientation as unknown as EnumObject) }),
                stylesheet('otherSystemsTrackNameMode', 'Other systems name format', { type: 'enum', options: enumOptions(m.TrackNameMode as unknown as EnumObject) }),
                stylesheet('otherSystemsTrackNameOrientation', 'Other systems name orientation', { type: 'enum', options: enumOptions(m.TrackNameOrientation as unknown as EnumObject) }),
                {
                    id: 'stylesheet.multiBarRest',
                    label: 'Multi-bar rests',
                    control: { type: 'toggle' },
                    effect: 'stylesheet',
                    read: (score) => score.stylesheet.multiTrackMultiBarRest,
                    write: (score, v) => {
                        score.stylesheet.multiTrackMultiBarRest = v as boolean;
                        score.stylesheet.perTrackMultiBarRest = v ? new Set(score.tracks.map((t) => t.index)) : null;
                    },
                },
            ],
        },
        {
            id: 'staffElements',
            title: 'Staff elements',
            description: 'Clefs, signatures and bar numbers per kind of staff.',
            perScore: true,
            entries: [
                elementDisplay('scoreConfig', 'clef', 'Score · Clef', module),
                elementDisplay('scoreConfig', 'keySignature', 'Score · Key signature', module),
                elementDisplay('scoreConfig', 'timeSignature', 'Score · Time signature', module),
                staffEnum('scoreConfig', 'barNumber', 'Score · Bar numbers', m.BarNumberDisplay as unknown as EnumObject),
                elementDisplay('tabConfig', 'clef', 'Tab · Clef', module),
                elementDisplay('tabConfig', 'timeSignature', 'Tab · Time signature', module),
                elementDisplay('tabConfig', 'rests', 'Tab · Rests', module),
                staffEnum('tabConfig', 'rhythm', 'Tab · Rhythm', module.TabRhythmMode as unknown as EnumObject),
                staffEnum('tabConfig', 'barNumber', 'Tab · Bar numbers', m.BarNumberDisplay as unknown as EnumObject),
                elementDisplay('slashConfig', 'keySignature', 'Slash · Key signature', module),
                elementDisplay('slashConfig', 'timeSignature', 'Slash · Time signature', module),
                staffEnum('slashConfig', 'barNumber', 'Slash · Bar numbers', m.BarNumberDisplay as unknown as EnumObject),
                elementDisplay('numberedConfig', 'timeSignature', 'Numbered · Time signature', module),
                staffEnum('numberedConfig', 'barNumber', 'Numbered · Bar numbers', m.BarNumberDisplay as unknown as EnumObject),
            ],
        },
    ];
}
