import {
    MusicXmlSpanAction,
    MusicXmlSpanElement,
    type MusicXmlSpanEvent,
    MusicXmlSpanKind,
    type MusicXmlSpanPosition,
    MusicXmlSpans,
    MusicXmlSpanTracker
} from '@coderline/alphatab/importer/MusicXmlSpans';
import { ScoreImporter } from '@coderline/alphatab/importer/ScoreImporter';
import { UnsupportedFormatError } from '@coderline/alphatab/importer/UnsupportedFormatError';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { Logger } from '@coderline/alphatab/Logger';
import { GeneralMidi } from '@coderline/alphatab/midi/GeneralMidi';
import { MidiUtils } from '@coderline/alphatab/midi/MidiUtils';
import { AccentuationType } from '@coderline/alphatab/model/AccentuationType';
import { Automation, AutomationType } from '@coderline/alphatab/model/Automation';
import { Bar, BarLineStyle } from '@coderline/alphatab/model/Bar';
import { Beat, BeatBeamingMode } from '@coderline/alphatab/model/Beat';
import { BendPoint } from '@coderline/alphatab/model/BendPoint';
import { BrushType } from '@coderline/alphatab/model/BrushType';
import { Chord } from '@coderline/alphatab/model/Chord';
import { Clef } from '@coderline/alphatab/model/Clef';
import { Direction } from '@coderline/alphatab/model/Direction';
import { Duration } from '@coderline/alphatab/model/Duration';
import { DynamicValue } from '@coderline/alphatab/model/DynamicValue';
import { FermataType, Fermata } from '@coderline/alphatab/model/Fermata';
import { Fingers } from '@coderline/alphatab/model/Fingers';
import { GolpeType } from '@coderline/alphatab/model/GolpeType';
import { GraceType } from '@coderline/alphatab/model/GraceType';
import { InstrumentArticulation } from '@coderline/alphatab/model/InstrumentArticulation';
import { KeySignature } from '@coderline/alphatab/model/KeySignature';
import { KeySignatureType } from '@coderline/alphatab/model/KeySignatureType';
import { MasterBar } from '@coderline/alphatab/model/MasterBar';
import { ModelUtils } from '@coderline/alphatab/model/ModelUtils';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { Note, NoteStyle } from '@coderline/alphatab/model/Note';
import { NoteAccidentalMode } from '@coderline/alphatab/model/NoteAccidentalMode';
import { NoteOrnament } from '@coderline/alphatab/model/NoteOrnament';
import { Ottavia } from '@coderline/alphatab/model/Ottavia';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';
import { PickStroke } from '@coderline/alphatab/model/PickStroke';
import { BarNumberDisplay } from '@coderline/alphatab/model/RenderStylesheet';
import { Score } from '@coderline/alphatab/model/Score';
import { Section } from '@coderline/alphatab/model/Section';
import { Staff } from '@coderline/alphatab/model/Staff';
import { Track } from '@coderline/alphatab/model/Track';
import { TremoloPickingEffect, TremoloPickingStyle } from '@coderline/alphatab/model/TremoloPickingEffect';
import { TripletFeel } from '@coderline/alphatab/model/TripletFeel';
import { VibratoType } from '@coderline/alphatab/model/VibratoType';
import { Voice } from '@coderline/alphatab/model/Voice';
import { AccidentalHelper } from '@coderline/alphatab/rendering/utils/AccidentalHelper';
import { BeamDirection } from '@coderline/alphatab/rendering/utils/BeamDirection';
import { XmlDocument } from '@coderline/alphatab/xml/XmlDocument';
import type { XmlNode } from '@coderline/alphatab/xml/XmlNode';
import type { ZipEntry } from '@coderline/alphatab/zip/ZipEntry';
import { ZipReader } from '@coderline/alphatab/zip/ZipReader';

/**
 * @internal
 */
class StaffContext {
    public currentDynamics = DynamicValue.F;
    public transpose: number = 0;
    public isExplicitlyBeamed = false;
}

/**
 * @internal
 */
class InstrumentArticulationWithPlaybackInfo extends InstrumentArticulation {
    /**
     * The midi channel number to use when playing the note (-1 if using the default track channels).
     */
    public outputMidiChannel: number = -1;

    /**
     * The midi channel program to use when playing the note (-1 if using the default track program).
     */
    public outputMidiProgram: number = -1;

    /**
     * The midi bank to use when playing the note (-1 if using the default track bank).
     */
    public outputMidiBank: number = -1;

    /**
     * The volume to use when playing the note (-1 if using the default track volume).
     */
    public outputVolume: number = -1;

    /**
     * The balance to use when playing the note (-1 if using the default track balance).
     */
    public outputBalance: number = -1;

    /**
     * Whether this instrument was declared as an unpitched/percussion sound via `<midi-unpitched>`.
     */
    public isUnpitched: boolean = false;
}

/**
 * @internal
 */
class TrackInfo {
    public track: Track;
    public firstArticulation?: InstrumentArticulationWithPlaybackInfo;
    public instruments: Map<string, InstrumentArticulationWithPlaybackInfo> = new Map<
        string,
        InstrumentArticulationWithPlaybackInfo
    >();

    private _instrumentIdToArticulationIndex: Map<string, number> = new Map<string, number>();

    /**
     * The spans of directions (e.g. let ring), span numbers are unique within a part.
     */
    public spans: MusicXmlSpanTracker = new MusicXmlSpanTracker();

    private _lyricsLine = 0;
    private _lyricsLines: Map<string, number> = new Map<string, number>();

    public constructor(track: Track) {
        this.track = track;
    }

    public getLyricLine(number: string) {
        if (this._lyricsLines.has(number)) {
            return this._lyricsLines.get(number)!;
        }
        const line = this._lyricsLine;
        this._lyricsLines.set(number, line);
        this._lyricsLine++;
        return line;
    }

    private static _defaultNoteArticulation: InstrumentArticulation = InstrumentArticulation.create(
        0,
        'Default',
        0,
        0,
        MusicFontSymbol.NoteheadBlack,
        MusicFontSymbol.NoteheadHalf,
        MusicFontSymbol.NoteheadWhole
    );

    public getOrCreateArticulation(instrumentId: string, note: Note) {
        const noteValue = note.octave * 12 + note.tone;
        const lookup = `${instrumentId}_${noteValue}`;
        if (this._instrumentIdToArticulationIndex.has(lookup)) {
            return this._instrumentIdToArticulationIndex.get(lookup)!;
        }

        let articulation: InstrumentArticulation;
        if (this.instruments.has(instrumentId)) {
            articulation = this.instruments.get(instrumentId)!;
        } else {
            articulation = TrackInfo._defaultNoteArticulation;
        }
        const index = this.track.percussionArticulations.length;

        const bar = note.beat.voice.bar;

        // the calculation in the AccidentalHelper assumes a standard 5-line staff.
        let musicXmlStaffSteps: number;
        if (noteValue === 0) {
            // no display pitch defined?
            musicXmlStaffSteps = 4; // middle of bar
        } else {
            const spelling = ModelUtils.resolveSpelling(bar.keySignature, noteValue, NoteAccidentalMode.Default);
            musicXmlStaffSteps = AccidentalHelper.calculateNoteSteps(bar.clef, spelling);
        }

        // to translate this into the "staffLine" semantics we need to subtract additionally the steps "missing" from the absent lines
        const actualSteps = note.beat.voice.bar.staff.standardNotationLineCount * 2 - 1;
        const fiveLineSteps = 5 * 2 - 1;
        const stepDifference = fiveLineSteps - actualSteps;

        const staffLine = musicXmlStaffSteps - stepDifference;

        const newArticulation = InstrumentArticulation.create(
            articulation.id,
            articulation.elementType,
            staffLine,
            articulation.outputMidiNumber,
            articulation.noteHeadDefault,
            articulation.noteHeadHalf,
            articulation.noteHeadWhole,
            articulation.techniqueSymbol,
            articulation.techniqueSymbolPlacement
        );

        this._instrumentIdToArticulationIndex.set(lookup, index);
        this.track.percussionArticulations.push(newArticulation);
        return index;
    }

    public isUnpitchedInstrument(instrumentId: string): boolean {
        return this.instruments.has(instrumentId) && this.instruments.get(instrumentId)!.isUnpitched;
    }
}

/**
 * Tracks how raw MusicXML voice numbers on a staff map into alphaTab's local
 * (dense, 0-based) voice slots. Collapses MuseScore's sparse `staff*4+local`
 * convention (staff 2 → voices 5..8) into dense per-staff indices.
 * @internal
 */
class StaffVoicePacking {
    // raw MusicXML voice string -> assigned local voice index on this staff
    public readonly mapping: Map<string, number> = new Map<string, number>();
    // raw voice strings kept in ascending numeric order (localIndex == index in this array)
    public readonly sortedRawVoices: string[] = [];
}

/**
 * @internal
 */
export class MusicXmlImporter extends ScoreImporter {
    private _score!: Score;
    private _idToTrackInfo: Map<string, TrackInfo> = new Map<string, TrackInfo>();
    private _indexToTrackInfo: Map<number, TrackInfo> = new Map<number, TrackInfo>();
    private _staffToContext: Map<Staff, StaffContext> = new Map<Staff, StaffContext>();
    private _staffVoicePacking: Map<Staff, StaffVoicePacking> = new Map<Staff, StaffVoicePacking>();

    private _currentBarNumberDisplayPart?: BarNumberDisplay;
    private _currentBarNumberDisplayBar?: BarNumberDisplay;
    /**
     * The bar number the next (non-implicit) master bar gets by sequential counting.
     * Used to only store custom bar numbers where the measure number differs from it.
     */
    private _nextBarNumber: number = 1;

    private _divisionsPerQuarterNote: number = 1;
    /**
     * Whether the exporter writes the stop of octave shifts before the last shifted note instead of after it.
     */
    private _octaveShiftEndsBeforeLastNote: boolean = false;
    private _currentDynamics = DynamicValue.F;

    public get name(): string {
        return 'MusicXML';
    }

    public readScore(): Score {
        const xml: string = this._extractMusicXml();
        const dom: XmlDocument = new XmlDocument();
        try {
            dom.parse(xml);
        } catch (e) {
            throw new UnsupportedFormatError('Unsupported format', e as Error);
        }
        this._score = new Score();
        this._nextBarNumber = 1;
        this._score.stylesheet.hideDynamics = true;

        this._parseDom(dom);
        this._applySpans();
        ModelUtils.consolidate(this._score);
        this._score.finish(this.settings);
        this._score.rebuildRepeatGroups();

        return this._score;
    }

    /**
     * Applies the spans of all parts once all beats are known: a span can cover beats which appear before
     * its start or after its stop in the document (other voices or staves). Must run before the model is finished
     * as the note effects are linked there.
     */
    private _applySpans() {
        for (const info of this._indexToTrackInfo.values()) {
            const spans = info.spans.finish(info.track, this._score.masterBars);
            MusicXmlSpans.apply(
                spans,
                info.track,
                this._score.masterBars,
                (staff, voice) => {
                    if (this._staffVoicePacking.has(staff)) {
                        const mapping = this._staffVoicePacking.get(staff)!.mapping;
                        if (mapping.has(voice)) {
                            return mapping.get(voice)!;
                        }
                    }
                    return -1;
                },
                this._beatSequence
            );
        }
    }

    private _extractMusicXml(): string {
        const zip = new ZipReader(this.data, this.settings.importer.maxDecodingBufferSize);
        let entries: ZipEntry[];
        try {
            entries = zip.read();
        } catch {
            entries = [];
        }

        // no compressed MusicXML, try raw
        if (entries.length === 0) {
            this.data.reset();
            return IOHelper.toString(this.data.readAll(), this.settings.importer.encoding);
        }

        const container = entries.find(e => e.fullName === 'META-INF/container.xml');
        if (!container) {
            throw new UnsupportedFormatError('No compressed MusicXML');
        }

        const containerDom = new XmlDocument();
        try {
            containerDom.parse(IOHelper.toString(container.data, this.settings.importer.encoding));
        } catch (e) {
            throw new UnsupportedFormatError('Malformed container.xml, could not parse as XML', e as Error);
        }

        const root: XmlNode | null = containerDom.firstElement;
        if (!root || root.localName !== 'container') {
            throw new UnsupportedFormatError("Malformed container.xml, root element not 'container'");
        }

        const rootFiles = root.findChildElement('rootfiles');
        if (!rootFiles) {
            throw new UnsupportedFormatError("Malformed container.xml, 'container/rootfiles' not found");
        }

        let uncompressedFileFullPath: string = '';
        for (const c of rootFiles.childElements()) {
            if (c.localName === 'rootfile') {
                // The MusicXML root must be described in the first <rootfile> element.
                // https://www.w3.org/2021/06/musicxml40/tutorial/compressed-mxl-files/
                uncompressedFileFullPath = c.getAttribute('full-path');
                break;
            }
        }

        if (!uncompressedFileFullPath) {
            throw new UnsupportedFormatError('Unsupported compressed MusicXML, missing rootfile');
        }

        const file = entries.find(e => e.fullName === uncompressedFileFullPath);
        if (!file) {
            throw new UnsupportedFormatError(
                `Malformed container.xml, '${uncompressedFileFullPath}' not contained in zip`
            );
        }

        return IOHelper.toString(file.data, this.settings.importer.encoding);
    }

    private _parseDom(dom: XmlDocument): void {
        const root: XmlNode | null = dom.firstElement;
        if (!root) {
            throw new UnsupportedFormatError('Unsupported format');
        }
        switch (root.localName) {
            case 'score-partwise':
                this._parsePartwise(root);
                break;
            case 'score-timewise':
                this._parseTimewise(root);
                break;
            default:
                throw new UnsupportedFormatError('Unsupported format');
        }
    }

    private _parsePartwise(element: XmlNode): void {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'credit':
                    this._parseCredit(c);
                    break;
                // case 'defaults': Ignored (see below)
                case 'identification':
                    this._parseIdentification(c);
                    break;
                // case 'movement-number': Ignored
                case 'movement-title':
                    this._parseMovementTitle(c);
                    break;
                case 'part':
                    this._parsePartwisePart(c);
                    break;
                case 'part-list':
                    this._parsePartList(c);
                    break;
                case 'work':
                    this._parseWork(c);
                    break;
            }
        }
    }

    private _parseTimewise(element: XmlNode): void {
        let index = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'credit':
                    this._parseCredit(c);
                    break;
                // case 'defaults': Ignored (see below)
                case 'identification':
                    this._parseIdentification(c);
                    break;
                // case 'movement-number': Ignored
                case 'movement-title':
                    this._parseMovementTitle(c);
                    break;
                case 'part-list':
                    this._parsePartList(c);
                    break;
                case 'work':
                    this._parseWork(c);
                    break;
                case 'measure':
                    this._parseTimewiseMeasure(c, index);
                    index++;
                    break;
            }
        }
    }

    private _parseCredit(element: XmlNode) {
        // credit texts are absolutely positioned texts which we don't support
        // but it is very common to place song information in there,
        // we do our best to parse information into our song details

        // only consider first page info
        if (element.getAttribute('page', '1') !== '1') {
            return;
        }

        const creditTypes: string[] = [];
        let firstWords: XmlNode | null = null;

        let fullText = '';

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'credit-type':
                    creditTypes.push(c.innerText);
                    break;
                // case 'link': Ignored
                // case 'bookmark': Ignored
                // case 'credit-image': Not supported
                case 'credit-words':
                    if (firstWords === null) {
                        firstWords = c;
                    }
                    fullText += c.innerText;
                    break;
                // case 'credit-symbol' Not supported
            }
        }

        // we have types defined? awesome, no need to guess
        if (creditTypes.length > 0) {
            for (const type of creditTypes) {
                switch (type) {
                    case 'title':
                        this._score.title = MusicXmlImporter._sanitizeDisplay(fullText);
                        break;
                    case 'subtitle':
                        this._score.subTitle = MusicXmlImporter._sanitizeDisplay(fullText);
                        break;
                    case 'composer':
                        this._score.artist = MusicXmlImporter._sanitizeDisplay(fullText);
                        break;
                    case 'arranger':
                        this._score.artist = MusicXmlImporter._sanitizeDisplay(fullText);
                        break;
                    case 'lyricist':
                        this._score.words = MusicXmlImporter._sanitizeDisplay(fullText);
                        break;
                    case 'rights':
                        this._score.copyright = MusicXmlImporter._sanitizeDisplay(fullText);
                        break;
                    case 'part name':
                        break;
                }
            }
        } else if (firstWords) {
            // here comes the hard part, guessing the credits.

            // position (relative to bottom(!) left)
            //const defaultX = parseInt(firstWords.getAttribute('default-x', '0'));
            //const defaultY = parseInt(firstWords.getAttribute('default-y', '0'));

            //const fontSize = parseInt(firstWords.getAttribute('font-size', '0'));
            const justify = firstWords.getAttribute('font-size', '0');
            const valign = firstWords.getAttribute('font-size', 'top');
            const halign = firstWords.getAttribute('halign', 'left');

            // titles are typically centered on top, use it there if
            // there is no info about it yet
            if (valign === 'top') {
                // indicator for copyright? so be it
                if (
                    fullText.includes('copyright') ||
                    fullText.includes('Copyright') ||
                    fullText.includes('©') ||
                    fullText.includes('(c)') ||
                    fullText.includes('(C)')
                ) {
                    this._score.copyright = MusicXmlImporter._sanitizeDisplay(fullText);
                    return;
                }

                // title and subtitle are typically centered,
                // use the typical alphaTab placement as reference for valid props
                if (halign === 'center' || justify === 'center') {
                    if (this._score.title.length === 0) {
                        this._score.title = MusicXmlImporter._sanitizeDisplay(fullText);
                        return;
                    }

                    if (this._score.subTitle.length === 0) {
                        this._score.subTitle = MusicXmlImporter._sanitizeDisplay(fullText);
                        return;
                    }

                    if (this._score.album.length === 0) {
                        this._score.album = MusicXmlImporter._sanitizeDisplay(fullText);
                        return;
                    }
                } else if (halign === 'right' || justify === 'right') {
                    // in alphaTab only `music` is right
                    if (this._score.music.length === 0) {
                        this._score.music = MusicXmlImporter._sanitizeDisplay(fullText);
                        return;
                    }
                }

                // from here we simply fallback to filling any remaining information (first one wins approach)
                if (this._score.artist.length === 0) {
                    this._score.artist = MusicXmlImporter._sanitizeDisplay(fullText);
                    return;
                }

                if (this._score.words.length === 0) {
                    this._score.words = MusicXmlImporter._sanitizeDisplay(fullText);
                    return;
                }
            }
        }
    }

    private static _sanitizeDisplay(text: string): string {
        // no newlines or tabs, and non-breaking spaces
        return text.replaceAll('\r', '').replaceAll('\n', ' ').replaceAll('\t', '\xA0\xA0').replaceAll(' ', '\xA0');
    }

    // visual aspects of credits are ignored
    // #parseCredit(element: XmlNode) { }

    // visual aspects of music notation are ignored.
    // with https://github.com/CoderLine/alphaTab/issues/1949 we could use some more information
    // but we also need the "real" page layout (or parchment) for some alignment aspects.
    // also for some styling stuff we need the settings as part of the renderstylesheet.
    // #parseDefaults(element: XmlNode) {
    //     for (const c of element.childElements()) {
    //         switch (c.localName) {
    //             // case 'scaling':
    //             // case 'concert-score':
    //             // case 'page-layout':
    //             // case 'system-layout':
    //             // case 'staff-layout':
    //             // case 'appearance':
    //             // case 'music-font':
    //             // case 'word-font':
    //             // case 'lyric-font':
    //             // case 'lyric-language':
    //         }
    //     }
    // }

    private _parseIdentification(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'creator':
                    if (c.attributes.has('type')) {
                        switch (c.attributes.get('type')!) {
                            case 'composer':
                                this._score.artist = MusicXmlImporter._sanitizeDisplay(c.innerText);
                                break;
                            case 'lyricist':
                                this._score.words = MusicXmlImporter._sanitizeDisplay(c.innerText);
                                break;
                            case 'arranger':
                                this._score.music = MusicXmlImporter._sanitizeDisplay(c.innerText);
                                break;
                        }
                    } else {
                        this._score.artist = MusicXmlImporter._sanitizeDisplay(c.innerText);
                    }
                    break;
                case 'rights':
                    if (this._score.copyright.length > 0) {
                        this._score.copyright += ', ';
                    }
                    this._score.copyright += c.innerText;
                    if (c.attributes.has('type')) {
                        this._score.copyright += ` (${c.attributes.get('type')})`;
                    }
                    break;
                case 'encoding':
                    this._parseEncoding(c);
                    break;
                // case 'source': Ignored
                // case 'relation': Ignored
                // case 'miscellaneous': Ignored
            }
        }
    }
    private _parseEncoding(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'encoding-date': Ignored
                case 'encoder':
                    if (this._score.tab.length > 0) {
                        this._score.tab += ', ';
                    }
                    this._score.tab += c.innerText;
                    if (c.attributes.has('type')) {
                        this._score.tab += ` (${c.attributes.get('type')})`;
                    }
                    break;
                case 'software':
                    // Finale and Sibelius write the end of octave shifts before the last shifted note
                    // (see MusicXML test suite 33da, MuseScore import)
                    const software = c.innerText.toLowerCase();
                    if (
                        software.indexOf('finale') >= 0 ||
                        software.indexOf('sibelius') >= 0 ||
                        software.indexOf('dolet') >= 0
                    ) {
                        this._octaveShiftEndsBeforeLastNote = true;
                    }
                    break;
                case 'encoding-description':
                    this._score.notices += MusicXmlImporter._sanitizeDisplay(c.innerText);
                    break;
                // case 'supports': Ignored
            }
        }
    }

    private _parseMovementTitle(element: XmlNode) {
        if (this._score.title.length === 0) {
            // we have no "work title", then use the "movement title" as main title
            this._score.title = MusicXmlImporter._sanitizeDisplay(element.innerText);
        } else {
            // we have a "work title", then use the "movement title" as subtitle
            this._score.subTitle = MusicXmlImporter._sanitizeDisplay(element.innerText);
        }
    }

    private _parsePartList(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'part-group': Ignore
                // We currently ignore information from part-group
                // The Track > Staff structure is handled by the <staff /> element on measure level
                // we only support automatic placement of brackets/braces, not explicit.
                case 'score-part':
                    this._parseScorePart(c);
                    break;
            }
        }
    }

    private _parseScorePart(element: XmlNode) {
        const track = new Track();
        track.ensureStaveCount(1);
        this._score.addTrack(track);

        const id = element.attributes.get('id')!;
        const trackInfo = new TrackInfo(track);
        this._idToTrackInfo.set(id, trackInfo);
        this._indexToTrackInfo.set(track.index, trackInfo);

        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'identification': Ignored, no part-wise information.
                // case 'part-link': Not supported
                case 'part-name':
                    track.name = MusicXmlImporter._sanitizeDisplay(c.innerText);
                    break;
                case 'part-name-display':
                    track.name = this._parsePartDisplayAsText(c);
                    break;
                case 'part-abbreviation':
                    track.shortName = MusicXmlImporter._sanitizeDisplay(c.innerText);
                    break;
                case 'part-abbreviation-display':
                    track.shortName = this._parsePartDisplayAsText(c);
                    break;
                // case 'group': Ignored
                case 'score-instrument':
                    this._parseScoreInstrument(c, trackInfo);
                    break;
                // case 'player': Ignored
                case 'midi-device':
                    if (c.attributes.has('port')) {
                        track.playbackInfo.port = Number.parseInt(c.attributes.get('port')!, 10);
                    }
                    break;
                case 'midi-instrument':
                    this._parseScorePartMidiInstrument(c, trackInfo);
                    break;
            }
        }

        if (trackInfo.firstArticulation) {
            if (trackInfo.firstArticulation.outputMidiProgram >= 0) {
                track.playbackInfo.program = trackInfo.firstArticulation.outputMidiProgram;
            }
            if (trackInfo.firstArticulation.outputMidiBank >= 0) {
                track.playbackInfo.bank = trackInfo.firstArticulation.outputMidiBank;
            }
            if (trackInfo.firstArticulation.outputBalance >= 0) {
                track.playbackInfo.balance = trackInfo.firstArticulation.outputBalance;
            }
            if (trackInfo.firstArticulation.outputVolume >= 0) {
                track.playbackInfo.volume = trackInfo.firstArticulation.outputVolume;
            }
            if (trackInfo.firstArticulation.outputMidiChannel >= 0) {
                track.playbackInfo.primaryChannel = trackInfo.firstArticulation.outputMidiChannel;
                track.playbackInfo.secondaryChannel = trackInfo.firstArticulation.outputMidiChannel;
            }
        }
    }

    private _parseScoreInstrument(element: XmlNode, trackInfo: TrackInfo) {
        const articulation = new InstrumentArticulationWithPlaybackInfo();
        if (!trackInfo.firstArticulation) {
            trackInfo.firstArticulation = articulation;
        }
        trackInfo.instruments.set(element.getAttribute('id', ''), articulation);
    }

    private _parseScorePartMidiInstrument(element: XmlNode, trackInfo: TrackInfo) {
        const id = element.getAttribute('id', '');
        if (!trackInfo.instruments.has(id)) {
            return;
        }
        const articulation = trackInfo.instruments.get(id)!;

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'midi-channel':
                    articulation.outputMidiChannel = Number.parseInt(c.innerText, 10) - 1;
                    break;
                // case 'midi-name': Ignored
                case 'midi-bank':
                    articulation.outputMidiBank = Number.parseInt(c.innerText, 10) - 1;
                    break;
                case 'midi-program':
                    articulation.outputMidiProgram = Number.parseInt(c.innerText, 10) - 1;
                    break;
                case 'midi-unpitched':
                    articulation.outputMidiNumber = Number.parseInt(c.innerText, 10) - 1;
                    articulation.isUnpitched = true;
                    break;
                case 'volume':
                    articulation.outputVolume = MusicXmlImporter._interpolatePercent(Number.parseFloat(c.innerText));
                    break;
                case 'pan':
                    articulation.outputBalance = MusicXmlImporter._interpolatePan(Number.parseFloat(c.innerText));
                    break;
                // case 'elevation': Ignored
            }
        }

        articulation.id = PercussionMapper.tryMatchKnownArticulation(articulation);
        if (articulation.id < 0) {
            articulation.id = 0;
        }
    }

    private static _interpolatePercent(value: number) {
        return MusicXmlImporter._interpolate(0, 100, 0, 16, value) | 0;
    }

    private static _interpolatePan(value: number) {
        return MusicXmlImporter._interpolate(-90, 90, 0, 16, value) | 0;
    }

    private static _interpolate(
        inputStart: number,
        inputEnd: number,
        outputStart: number,
        outputEnd: number,
        value: number
    ): number {
        const t = (value - inputStart) / (inputEnd - inputStart);
        return outputStart + (outputEnd - outputStart) * t;
    }

    private _parsePartDisplayAsText(element: XmlNode): string {
        let text = '';
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'display-text':
                    text += c.innerText;
                    break;
                case 'accidental-text':
                    // to our best to have a plain text accidental using the unicode blocks
                    // we don't have a SmuFL Text font in place there to use MusicFontSymbols
                    switch (c.innerText) {
                        case 'sharp':
                            text += '♯';
                            break;
                        case 'natural':
                            text += '♮';
                            break;
                        case 'flat':
                            text += '♭';
                            break;
                        case 'double-sharp':
                            text += '𝄪';
                            break;
                        case 'sharp-sharp':
                            text += '♯♯';
                            break;
                        case 'flat-flat':
                            text += '𝄫';
                            break;
                        case 'natural-sharp':
                            text += '♮♯';
                            break;
                        case 'natural-flat':
                            text += '♮♭';
                            break;
                        // case 'quarter-flat': Not supported
                        // case 'quarter-sharp': Not supported
                        // case 'three-quarters-flat': Not supported
                        // case 'three-quarters-sharp': Not supported
                        case 'sharp-down':
                            text += '𝄱';
                            break;
                        case 'sharp-up':
                            text += '𝄰';
                            break;
                        case 'natural-down':
                            text += '𝄯';
                            break;
                        case 'natural-up':
                            text += '𝄮';
                            break;
                        case 'flat-down':
                            text += '𝄭';
                            break;
                        case 'flat-up':
                            text += '𝄬';
                            break;
                        // case 'double-sharp-down': Not supported
                        // case 'double-sharp-up': Not supported
                        // case 'flat-flat-down': Not supported
                        // case 'flat-flat-up': Not supported
                        case 'arrow-down':
                            text += '↓';
                            break;
                        case 'arrow-up':
                            text += '↑';
                            break;
                        case 'triple-sharp':
                            text += '♯𝄪';
                            break;
                        case 'triple-flat':
                            text += '𝄬𝄬𝄬';
                            break;
                        // case 'slash-quarter-sharp': Not supported
                        // case 'slash-sharp': Not supported
                        // case 'slash-flat': Not supported
                        // case 'double-slash-flat': Not supported
                        case 'sharp-1':
                            text += '♯¹';
                            break;
                        case 'sharp-2':
                            text += '♯²';
                            break;
                        case 'sharp-3':
                            text += '♯³';
                            break;
                        case 'sharp-4':
                            text += '♯⁴';
                            break;
                        case 'sharp-5':
                            text += '♯⁵';
                            break;
                        case 'flat-1':
                            text += '♭¹';
                            break;
                        case 'flat-2':
                            text += '♭²';
                            break;
                        case 'flat-3':
                            text += '♭³';
                            break;
                        case 'flat-4':
                            text += '♭⁴';
                            break;
                        case 'flat-5':
                            text += '♭⁵';
                            break;
                        // case 'sori': Not supported
                        // case 'kokon': Not supported
                        // case 'other': Not supported
                    }

                    break;
            }
        }
        return MusicXmlImporter._sanitizeDisplay(text);
    }

    private _parseWork(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'work-number': Ignored
                // case 'opus': Ignored
                case 'work-title':
                    this._score.title = MusicXmlImporter._sanitizeDisplay(c.innerText);
                    break;
            }
        }
    }

    private _parsePartwisePart(element: XmlNode) {
        const id = element.attributes.get('id');
        if (!id || !this._idToTrackInfo.has(id)) {
            return;
        }
        const track = this._idToTrackInfo.get(id)!.track;
        let index = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'measure':
                    this._parsePartwiseMeasure(c, track, index);
                    index++;
                    break;
            }
        }

        this._currentBarNumberDisplayPart = undefined;
    }

    private _parsePartwiseMeasure(element: XmlNode, track: Track, index: number) {
        const masterBar = this._getOrCreateMasterBar(element, index, element.getAttribute('number'));
        const implicit = element.attributes.get('implicit') === 'yes';
        this._parsePartMeasure(element, masterBar, track, implicit, true);
        this._currentBarNumberDisplayBar = undefined;
    }

    private _parseTimewiseMeasure(element: XmlNode, index: number) {
        const masterBar = this._getOrCreateMasterBar(element, index, element.getAttribute('number'));
        const implicit = element.attributes.get('implicit') === 'yes';

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'part':
                    this._parseTimewisePart(c, masterBar, implicit);
                    this._currentBarNumberDisplayPart = undefined;
                    break;
                case 'print':
                    this._parsePrint(c, masterBar, undefined, true);
                    break;
            }
        }

        this._currentBarNumberDisplayBar = undefined;
    }

    private _getOrCreateMasterBar(element: XmlNode, index: number, measureNumber: string) {
        const implicit = element.attributes.get('implicit') === 'yes';
        while (this._score.masterBars.length <= index) {
            const newMasterBar = new MasterBar();
            if (implicit) {
                newMasterBar.isAnacrusis = true;
            } else {
                // only store custom numbers which differ from the sequential counting
                // (same counting as Score.finish: implicit bars do not count, custom texts do)
                const number = Number.parseInt(measureNumber, 10);
                if (!Number.isNaN(number)) {
                    if (number !== this._nextBarNumber) {
                        newMasterBar.customBarNumber = number;
                    }
                    this._nextBarNumber = number + 1;
                } else {
                    newMasterBar.customBarNumberText = measureNumber;
                    this._nextBarNumber++;
                }
            }

            this._score.addMasterBar(newMasterBar);
            if (newMasterBar.index > 0) {
                newMasterBar.timeSignatureDenominator = newMasterBar.previousMasterBar!.timeSignatureDenominator;
                newMasterBar.timeSignatureNumerator = newMasterBar.previousMasterBar!.timeSignatureNumerator;
                newMasterBar.tripletFeel = newMasterBar.previousMasterBar!.tripletFeel;
            }
        }

        const masterBar = this._score.masterBars[index];
        return masterBar;
    }

    private _parseTimewisePart(element: XmlNode, masterBar: MasterBar, implicit: boolean) {
        const id = element.attributes.get('id');
        if (!id || !this._idToTrackInfo.has(id)) {
            return;
        }

        const track = this._idToTrackInfo.get(id)!.track;
        this._parsePartMeasure(element, masterBar, track, implicit, false);
    }

    // current measure state

    /**
     * The current musical position within the bar.
     */
    private _musicalPosition: number = 0;

    /**
     * The last known beat which was parsed. Might be used
     * to access the current voice/staff (e.g. on rests when we don't have notes)
     */
    private _lastBeat: Beat | null = null;

    private _parsePartMeasure(
        element: XmlNode,
        masterBar: MasterBar,
        track: Track,
        implicit: boolean,
        isPartwise: boolean
    ) {
        this._musicalPosition = 0;
        this._lastBeat = null;

        const barLines: XmlNode[] = [];

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'note':
                    this._parseNote(c, masterBar, track);
                    break;
                case 'backup':
                    this._parseBackup(c);
                    break;
                case 'forward':
                    this._parseForward(c);
                    break;
                case 'direction':
                    this._parseDirection(c, masterBar, track);
                    break;
                case 'attributes':
                    this._parseAttributes(c, masterBar, track);
                    break;
                case 'harmony':
                    this._parseHarmony(c, track);
                    break;
                // case 'figured-bass': Not supported
                case 'print':
                    this._parsePrint(c, masterBar, track, true);
                    break;
                case 'sound':
                    this._parseSound(c, masterBar, track);
                    break;
                // case 'listening': Ignored
                case 'barline':
                    barLines.push(c); // delayed
                    break;
                // case 'grouping': Ignored
                // case 'link': Not supported
                // case 'bookmark': Not supported
            }
        }

        // directions at the end of the measure
        this._processPendingSpanEvents('');

        // parse barline at end of bar (to apply style to all bars of all staves)
        for (const barLine of barLines) {
            this._parseBarLine(barLine, masterBar, track);
        }

        // initial empty staff and voice (if no other elements created something already)
        const staff = this._getOrCreateStaff(track, 0);
        const bar = this._getOrCreateBar(staff, masterBar);

        if (implicit) {
            bar.barNumberDisplay = BarNumberDisplay.Hide;
        } else if (isPartwise) {
            bar.barNumberDisplay = this._currentBarNumberDisplayBar ?? this._currentBarNumberDisplayPart;
        } else {
            bar.barNumberDisplay = this._currentBarNumberDisplayPart ?? this._currentBarNumberDisplayBar;
        }

        // clear measure attribute
        this._keyAllStaves = null;
    }

    private _parsePrint(element: XmlNode, masterBar: MasterBar, track: Track | undefined, isMeasurePrint: boolean) {
        if (track !== undefined) {
            if (element.getAttribute('new-system', 'no') === 'yes') {
                track.addLineBreaks(masterBar.index);
            } else if (element.getAttribute('new-page', 'no') === 'yes') {
                track.addLineBreaks(masterBar.index);
            }
        }

        let newDisplay: BarNumberDisplay | undefined = undefined;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'measure-numbering':
                    switch (c.innerText) {
                        case 'none':
                            newDisplay = BarNumberDisplay.Hide;
                            break;
                        case 'measure':
                            newDisplay = BarNumberDisplay.AllBars;
                            break;
                        case 'system':
                            newDisplay = BarNumberDisplay.FirstOfSystem;
                            break;
                    }
                    break;
            }
        }

        if (isMeasurePrint) {
            this._currentBarNumberDisplayBar = newDisplay;
        } else {
            this._currentBarNumberDisplayPart = newDisplay;
        }
    }

    private _parseBarLine(element: XmlNode, masterBar: MasterBar, track: Track) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'bar-style':
                    this._parseBarStyle(c, masterBar, track, element.getAttribute('location', 'right'));
                    break;
                // case 'footnote' Ignored
                // case 'level' Ignored
                // case 'wavy-line' Ignored
                // case 'segno': Ignored (use directions)
                // case 'coda': Ignored (use directions)
                // case 'fermata': Ignored (on barline, they exist on beat notations)
                case 'ending':
                    this._parseEnding(c, masterBar, track);
                    break;
                case 'repeat':
                    this._parseRepeat(c, masterBar);
                    break;
            }
        }
    }

    private _parseRepeat(element: XmlNode, masterBar: MasterBar): void {
        const direction: string = element.getAttribute('direction');
        let times: number = Number.parseInt(element.getAttribute('times'), 10);
        if (times < 0 || Number.isNaN(times)) {
            times = 2;
        }
        if (direction === 'backward') {
            masterBar.repeatCount = times;
        } else if (direction === 'forward') {
            masterBar.isRepeatStart = true;
        }
    }

    private _parseEnding(element: XmlNode, masterBar: MasterBar, track: Track): void {
        const numbers = element
            .getAttribute('number')
            .split(',')
            .map(v => Number.parseInt(v, 10));

        let flags = 0;
        for (const num of numbers) {
            flags = flags | ((0x01 << (num - 1)) & 0xff);
        }

        let action: MusicXmlSpanAction;
        let barIndex = masterBar.index;
        switch (element.getAttribute('type', '')) {
            case 'start':
                action = MusicXmlSpanAction.Start;
                break;
            // the stop is at the right barline of the last measure of the ending
            case 'stop':
            case 'discontinue':
                action = MusicXmlSpanAction.Stop;
                barIndex++;
                break;
            case 'continue':
                action = MusicXmlSpanAction.Continue;
                break;
            default:
                return;
        }

        // the endings are a property of the master bar, they are the union of all parts
        const e = MusicXmlSpans.createEvent(
            MusicXmlSpanElement.Ending,
            action,
            MusicXmlSpanKind.AlternateEnding,
            `${flags}`
        );
        e.value = flags;
        e.position = MusicXmlSpans.position(barIndex, 0, this._beatCount, 0);
        this._indexToTrackInfo.get(track.index)!.spans.process([e]);
    }

    private _parseBarStyle(element: XmlNode, masterBar: MasterBar, track: Track, location: string) {
        let style = BarLineStyle.Automatic;

        switch (element.innerText) {
            case 'dashed':
                style = BarLineStyle.Dashed;
                break;
            case 'dotted':
                style = BarLineStyle.Dotted;
                break;
            case 'heavy':
                style = BarLineStyle.Heavy;
                break;
            case 'heavy-heavy':
                style = BarLineStyle.HeavyHeavy;
                break;
            case 'heavy-light':
                style = BarLineStyle.HeavyLight;
                break;
            case 'light-heavy':
                style = BarLineStyle.LightHeavy;
                break;
            case 'light-light':
                style = BarLineStyle.LightLight;
                break;
            case 'none':
                style = BarLineStyle.None;
                break;
            case 'regular':
                style = BarLineStyle.Regular;
                break;
            case 'short':
                style = BarLineStyle.Short;
                break;
            case 'tick':
                style = BarLineStyle.Tick;
                break;
        }

        for (const s of track.staves) {
            const bar = this._getOrCreateBar(s, masterBar);
            switch (location) {
                case 'left':
                    bar.barLineLeft = style;
                    break;
                case 'right':
                    bar.barLineRight = style;
                    break;
            }
        }
    }

    private _parseSound(element: XmlNode, masterBar: MasterBar, _track: Track) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'instrument-change': Ignored
                // case 'midi-device': Ignored
                case 'midi-instrument':
                    this._parseSoundMidiInstrument(c, masterBar);
                    break;
                // case 'play': Ignored
                case 'swing':
                    this._parseSwing(c, masterBar);
                    break;
                case 'offset':
                    break;
            }
        }

        this._parseSoundDirections(element, masterBar);

        // damper-pedal="" Ignored -> Handled via pedal direction
        // dynamics="" Ignored -> Handled via dynamics direction
        // elevation="" Ignored
        // forward-repeat="" Ignored
        // pizzicato="" Ignored
        // pizzicato="" Ignored
        // soft-pedal="" Ignored
        // sostenuto-pedal="" Ignored
        // time-only="" Ignored

        if (element.attributes.has('pan')) {
            if (!this._nextBeatAutomations) {
                this._nextBeatAutomations = [];
            }

            const automation = new Automation();
            automation.type = AutomationType.Balance;
            automation.value = MusicXmlImporter._interpolatePan(Number.parseFloat(element.attributes.get('pan')!));
            this._nextBeatAutomations.push(automation);
        }

        if (element.attributes.has('tempo')) {
            if (!this._nextBeatAutomations) {
                this._nextBeatAutomations = [];
            }

            const automation = new Automation();
            automation.type = AutomationType.Tempo;
            automation.value = MusicXmlImporter._interpolatePercent(
                Number.parseFloat(element.attributes.get('tempo')!)
            );
            this._nextBeatAutomations.push(automation);
        }
    }

    /**
     * Applies the jump and marker attributes of a `<sound>` (measure or direction level) as directions.
     * @returns true if any direction was applied.
     */
    private _parseSoundDirections(element: XmlNode, masterBar: MasterBar): boolean {
        let hasDirections = false;
        if (element.attributes.has('coda')) {
            masterBar.addDirection(Direction.TargetCoda);
            hasDirections = true;
        }

        if (element.attributes.has('tocoda')) {
            masterBar.addDirection(Direction.JumpDaCoda);
            hasDirections = true;
        }

        // yes-no typed, "no" means no jump
        if (element.getAttribute('dacapo', 'no') !== 'no') {
            masterBar.addDirection(Direction.JumpDaCapo);
            hasDirections = true;
        }

        if (element.attributes.has('dalsegno')) {
            masterBar.addDirection(Direction.JumpDalSegno);
            hasDirections = true;
        }

        if (element.attributes.has('fine')) {
            masterBar.addDirection(Direction.TargetFine);
            hasDirections = true;
        }

        if (element.attributes.has('segno')) {
            masterBar.addDirection(Direction.TargetSegno);
            hasDirections = true;
        }

        return hasDirections;
    }

    /**
     * The texts (normalized via {@link _normalizeDirectionLabel}) with which `<words>` print the directions
     * of the `<sound>` attributes. Such words are only the visual counterpart of the direction which renders its
     * own label, they are not added as additional beat text. Any other words next to a jump are kept as text.
     * Covers the default labels of the MuseScore export and the spelled-out forms, but no double segno/coda
     * or numbered forms as the directions are not mapped to their double variants.
     */
    private static readonly _soundDirectionLabels: Map<string, string[]> = new Map<string, string[]>([
        ['dacapo', ['dc', 'dacapo', 'dcalfine', 'dacapoalfine', 'dcalcoda', 'dacapoalcoda']],
        [
            'dalsegno',
            [
                'ds',
                'dalsegno',
                'delsegno',
                'dsalfine',
                'dalsegnoalfine',
                'delsegnoalfine',
                'dsalcoda',
                'dalsegnoalcoda',
                'delsegnoalcoda'
            ]
        ],
        ['tocoda', ['tocoda', 'dacoda']],
        ['fine', ['fine']],
        ['coda', ['coda']],
        ['segno', ['segno']]
    ]);

    /**
     * Lower-cases the text and removes dots and whitespace ("D. C. al Coda" -> "dcalcoda").
     */
    private static _normalizeDirectionLabel(text: string): string {
        const lower = text.toLowerCase();
        let normalized = '';
        for (let i = 0; i < lower.length; i++) {
            const c = lower.charAt(i);
            if (c !== '.' && c !== ' ' && c !== '\t' && c !== '\r' && c !== '\n' && c !== '\u00a0') {
                normalized += c;
            }
        }
        return normalized;
    }

    private static _isSoundDirectionLabel(words: string, sound: XmlNode): boolean {
        const normalized = MusicXmlImporter._normalizeDirectionLabel(words);
        for (const [attribute, labels] of MusicXmlImporter._soundDirectionLabels) {
            if (sound.attributes.has(attribute) && labels.indexOf(normalized) >= 0) {
                return true;
            }
        }
        return false;
    }

    private _parseSwing(element: XmlNode, masterBar: MasterBar) {
        let first = 0;
        let second = 0;
        let swingType: Duration | null = null;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'straight':
                    masterBar.tripletFeel = TripletFeel.NoTripletFeel;
                    return;
                case 'first':
                    first = Number.parseInt(c.innerText, 10);
                    break;
                case 'second':
                    second = Number.parseInt(c.innerText, 10);
                    break;
                case 'swing-type':
                    swingType = this._parseBeatDuration(c);
                    break;
                // case 'swing-style': Ignored
            }
        }

        // spec is a bit vague here
        if (!swingType) {
            swingType = Duration.Eighth;
        }

        if (swingType === Duration.Eighth) {
            if (first === 2 && second === 1) {
                masterBar.tripletFeel = TripletFeel.Triplet8th;
            } else if (first === 3 && second === 1) {
                masterBar.tripletFeel = TripletFeel.Dotted8th;
            } else if (first === 1 && second === 3) {
                masterBar.tripletFeel = TripletFeel.Scottish8th;
            }
        } else if (swingType === Duration.Sixteenth) {
            if (first === 2 && second === 1) {
                masterBar.tripletFeel = TripletFeel.Triplet16th;
            } else if (first === 3 && second === 1) {
                masterBar.tripletFeel = TripletFeel.Dotted16th;
            } else if (first === 1 && second === 3) {
                masterBar.tripletFeel = TripletFeel.Scottish16th;
            }
        }
    }

    private _nextBeatAutomations: Automation[] | null = null;
    private _nextBeatChord: Chord | null = null;
    private _nextBeatText: string | null = null;
    private _nextBeatTextTrackIndex: number = -1;
    private _nextBeatTextPosition: MusicXmlSpanPosition = MusicXmlSpans.position(0, 0, 0, 0);
    /**
     * The document order of the beats (see {@link MusicXmlSpanPosition.sequence}).
     */
    private _beatSequence: Map<Beat, number> = new Map<Beat, number>();
    private _beatCount: number = 0;
    /**
     * The span events of the last direction, processed with the voice of the following note.
     */
    private _pendingSpanEvents: MusicXmlSpanEvent[] = [];
    private _pendingSpanTrack: Track | null = null;

    private _processPendingSpanEvents(writtenVoice: string) {
        if (this._pendingSpanEvents.length === 0) {
            return;
        }
        for (const e of this._pendingSpanEvents) {
            e.writtenVoice = writtenVoice;
        }
        this._indexToTrackInfo.get(this._pendingSpanTrack!.index)!.spans.process(this._pendingSpanEvents);
        this._pendingSpanEvents = [];
        this._pendingSpanTrack = null;
    }

    private _parseSoundMidiInstrument(element: XmlNode, _masterBar: MasterBar) {
        let automation: Automation;
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'midi-channel': Ignored
                // case 'midi-name': Ignored
                case 'midi-bank':
                    if (!this._nextBeatAutomations) {
                        this._nextBeatAutomations = [];
                    }

                    automation = new Automation();
                    automation.type = AutomationType.Bank;
                    automation.value = Number.parseInt(c.innerText, 10) - 1;
                    this._nextBeatAutomations!.push(automation);
                    break;
                case 'midi-program':
                    if (!this._nextBeatAutomations) {
                        this._nextBeatAutomations = [];
                    }

                    automation = new Automation();
                    automation.type = AutomationType.Instrument;
                    automation.value = Number.parseInt(c.innerText, 10) - 1;
                    this._nextBeatAutomations!.push(automation);

                    break;
                // case 'midi-unpitched': Ignored
                case 'volume':
                    if (!this._nextBeatAutomations) {
                        this._nextBeatAutomations = [];
                    }

                    automation = new Automation();
                    automation.type = AutomationType.Volume;
                    automation.value = MusicXmlImporter._interpolatePercent(Number.parseFloat(c.innerText));
                    this._nextBeatAutomations!.push(automation);

                    break;
                case 'pan':
                    if (!this._nextBeatAutomations) {
                        this._nextBeatAutomations = [];
                    }

                    automation = new Automation();
                    automation.type = AutomationType.Balance;
                    automation.value = MusicXmlImporter._interpolatePan(Number.parseFloat(c.innerText));
                    this._nextBeatAutomations!.push(automation);
                    break;
                // case 'elevation': Ignored
            }
        }
    }

    private _parseHarmony(element: XmlNode, _track: Track) {
        const chord = new Chord();
        let degreeParenthesis = false;
        let degree = '';
        for (const childNode of element.childElements()) {
            switch (childNode.localName) {
                case 'root':
                    chord.name = this._parseHarmonyRoot(childNode);
                    break;
                case 'kind':
                    chord.name = chord.name + this._parseHarmonyKind(childNode);
                    if (childNode.getAttribute('parentheses-degrees', 'no') === 'yes') {
                        degreeParenthesis = true;
                    }
                    break;
                case 'frame':
                    this._parseHarmonyFrame(childNode, chord);
                    break;
                case 'degree':
                    degree += this._parseDegree(childNode);
                    break;
            }
        }

        if (degree) {
            chord.name += degreeParenthesis ? `(${degree})` : degree;
        }

        if (element.getAttribute('print-frame', 'no') === 'yes') {
            chord.showDiagram = true;
            this._score.stylesheet.globalDisplayChordDiagramsInScore = true;
        }

        if (element.getAttribute('print-object', 'yes') === 'yes') {
            chord.showDiagram = true;
        }

        if (this._nextBeatChord === null) {
            this._nextBeatChord = chord;
        }
    }

    private _parseDegree(element: XmlNode) {
        let value = '';
        let alter = '';
        let type = '';
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'degree-value':
                    value = c.innerText;
                    break;
                case 'degree-alter':
                    switch (c.innerText) {
                        case '-1':
                            alter = '♭';
                            break;
                        case '1':
                            alter = '♯';
                            break;
                    }
                    break;
                case 'degree-type':
                    type += c.getAttribute('text', '');
                    break;
            }
        }

        return `${type}${alter}${value}`;
    }

    private _parseHarmonyRoot(element: XmlNode): string {
        let rootStep: string = '';
        let rootAlter: string = '';
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'root-step':
                    rootStep = c.innerText;
                    break;
                case 'root-alter':
                    switch (Number.parseFloat(c.innerText)) {
                        case -2:
                            rootAlter = 'bb';
                            break;
                        case -1:
                            rootAlter = 'b';
                            break;
                        case 0:
                            rootAlter = '';
                            break;
                        case 1:
                            rootAlter = '#';
                            break;
                        case 2:
                            rootAlter = '##';
                            break;
                    }
                    break;
            }
        }
        return rootStep + rootAlter;
    }

    private _parseHarmonyKind(xmlNode: XmlNode): string {
        const kindText: string = xmlNode.getAttribute('text');
        let resultKind: string = '';
        if (kindText) {
            // the abbreviation is already provided
            resultKind = kindText;
        } else {
            const kindContent: string = xmlNode.innerText;
            switch (kindContent) {
                // triads
                case 'major':
                    resultKind = '';
                    break;
                case 'minor':
                    resultKind = 'm';
                    break;
                // Sevenths
                case 'augmented':
                    resultKind = '+';
                    break;
                case 'diminished':
                    resultKind = '\u25CB';
                    break;
                case 'dominant':
                    resultKind = '7';
                    break;
                case 'major-seventh':
                    resultKind = '7M';
                    break;
                case 'minor-seventh':
                    resultKind = 'm7';
                    break;
                case 'diminished-seventh':
                    resultKind = '\u25CB7';
                    break;
                case 'augmented-seventh':
                    resultKind = '+7';
                    break;
                case 'half-diminished':
                    resultKind = '\u2349';
                    break;
                case 'major-minor':
                    resultKind = 'mMaj';
                    break;
                // Sixths
                case 'major-sixth':
                    resultKind = 'maj6';
                    break;
                case 'minor-sixth':
                    resultKind = 'm6';
                    break;
                // Ninths
                case 'dominant-ninth':
                    resultKind = '9';
                    break;
                case 'major-ninth':
                    resultKind = 'maj9';
                    break;
                case 'minor-ninth':
                    resultKind = 'm9';
                    break;
                // 11ths
                case 'dominant-11th':
                    resultKind = '11';
                    break;
                case 'major-11th':
                    resultKind = 'maj11';
                    break;
                case 'minor-11th':
                    resultKind = 'm11';
                    break;
                // 13ths
                case 'dominant-13th':
                    resultKind = '13';
                    break;
                case 'major-13th':
                    resultKind = 'maj13';
                    break;
                case 'minor-13th':
                    resultKind = 'm13';
                    break;
                // Suspended
                case 'suspended-second':
                    resultKind = 'sus2';
                    break;
                case 'suspended-fourth':
                    resultKind = 'sus4';
                    break;
                case 'Neapolitan':
                    resultKind = '♭II';
                    break;
                case 'Italian':
                    resultKind = 'It⁺⁶';
                    break;
                case 'French':
                    resultKind = 'Fr⁺⁶';
                    break;
                case 'German':
                    resultKind = 'Fr⁺⁶';
                    break;
                default:
                    resultKind = kindContent;
                    break;
            }
        }

        return resultKind;
    }

    private _parseHarmonyFrame(xmlNode: XmlNode, chord: Chord) {
        for (const frameChild of xmlNode.childElements()) {
            switch (frameChild.localName) {
                case 'frame-strings':
                    const stringsCount: number = Number.parseInt(frameChild.innerText, 10);
                    chord.strings = new Array<number>(stringsCount);
                    for (let i = 0; i < stringsCount; i++) {
                        // set strings unplayed as default
                        chord.strings[i] = -1;
                    }
                    break;
                case 'first-fret':
                    chord.firstFret = Number.parseInt(frameChild.innerText, 10);
                    break;
                case 'frame-note':
                    let stringNo: number | null = null;
                    let fretNo: number | null = null;
                    for (const noteChild of frameChild.childElements()) {
                        switch (noteChild.localName) {
                            case 'string':
                                stringNo = Number.parseInt(noteChild.innerText, 10);
                                break;
                            case 'fret':
                                fretNo = Number.parseInt(noteChild.innerText, 10);
                                if (stringNo && fretNo >= 0) {
                                    chord.strings[stringNo - 1] = fretNo;
                                }
                                break;
                            case 'barre':
                                if (stringNo && fretNo && noteChild.getAttribute('type') === 'start') {
                                    chord.barreFrets.push(fretNo);
                                }
                                break;
                        }
                    }
                    break;
            }
        }
    }

    private _parseAttributes(element: XmlNode, masterBar: MasterBar, track: Track) {
        let staffIndex: number;
        let staff: Staff;
        let bar: Bar;

        if (this._lastBeat == null) {
            // attributes directly at the start of the bar
            for (const c of element.childElements()) {
                switch (c.localName) {
                    // case 'footnote': Ignored
                    // case 'level': Ignored
                    case 'divisions':
                        this._divisionsPerQuarterNote = Number.parseFloat(c.innerText);
                        break;
                    case 'key':
                        this._parseKey(c, masterBar, track);
                        break;
                    case 'time':
                        this._parseTime(c, masterBar);
                        break;
                    case 'staves':
                        // will create staves
                        track.ensureStaveCount(Number.parseInt(c.innerText, 10));
                        break;
                    // case 'part-symbol': Ignored (https://github.com/CoderLine/alphaTab/issues/1989)
                    // case 'instruments': Ignored, auto-detected via `note/instrument` and handled via instrument articulations
                    case 'clef':
                        staffIndex = Number.parseInt(c.getAttribute('number', '1'), 10) - 1;
                        staff = this._getOrCreateStaff(track, staffIndex);
                        bar = this._getOrCreateBar(staff, masterBar);
                        this._parseClef(c, bar);
                        break;
                    case 'staff-details':
                        staffIndex = Number.parseInt(c.getAttribute('number', '1'), 10) - 1;
                        staff = this._getOrCreateStaff(track, staffIndex);
                        this._parseStaffDetails(c, staff);
                        break;
                    case 'transpose':
                        this._parseTranspose(c, track);
                        break;
                    // case 'for-part': not supported
                    // case 'directive': Ignored
                    case 'measure-style':
                        this._parseMeasureStyle(c, masterBar, track, false);
                        break;
                }
            }
        } else {
            // attribute changes during bar
            for (const c of element.childElements()) {
                switch (c.localName) {
                    // case 'footnote': Ignored
                    // case 'level': Ignored
                    case 'divisions':
                        this._divisionsPerQuarterNote = Number.parseFloat(c.innerText);
                        break;
                    // https://github.com/CoderLine/alphaTab/issues/1991
                    // case 'key': Not supported
                    // case 'time': Not supported
                    // case 'part-symbol': Not supported
                    // case 'instruments': Ignored
                    // case 'clef': Not supported
                    // case 'staff-details': Not supported
                    // case 'transpose': Not supported
                    // case 'for-part': not supported
                    // case 'directive': Ignored
                    case 'measure-style':
                        this._parseMeasureStyle(c, masterBar, track, true);
                        break;
                }
            }
        }
    }

    private _parseMeasureStyle(element: XmlNode, masterBar: MasterBar, track: Track, midBar: boolean) {
        const events: MusicXmlSpanEvent[] = [];
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'multiple-rest': Ignored, when multibar rests are enabled for rendering this info shouldn't matter.
                case 'measure-repeat':
                    if (!midBar) {
                        switch (c.getAttribute('type')) {
                            case 'start':
                                let kind = MusicXmlSpanKind.None;
                                switch (Number.parseInt(c.getAttribute('slashes', '1'), 10)) {
                                    case 1:
                                        kind = MusicXmlSpanKind.SimileSimple;
                                        break;
                                    case 2:
                                        kind = MusicXmlSpanKind.SimileDouble;
                                        break;
                                    // default: not supported
                                }
                                events.push(
                                    MusicXmlSpans.createEvent(
                                        MusicXmlSpanElement.MeasureRepeat,
                                        MusicXmlSpanAction.Start,
                                        kind,
                                        '1'
                                    )
                                );
                                break;
                            // the first measure not repeating anymore
                            case 'stop':
                                events.push(
                                    MusicXmlSpans.createEvent(
                                        MusicXmlSpanElement.MeasureRepeat,
                                        MusicXmlSpanAction.Stop,
                                        MusicXmlSpanKind.None,
                                        '1'
                                    )
                                );
                                break;
                        }
                    }
                    break;
                // case 'beat-repeat': Not supported
                case 'slash':
                    // use-stems: not supported
                    switch (c.getAttribute('type')) {
                        case 'start':
                            events.push(
                                MusicXmlSpans.createEvent(
                                    MusicXmlSpanElement.Slash,
                                    MusicXmlSpanAction.Start,
                                    MusicXmlSpanKind.Slash,
                                    '1'
                                )
                            );
                            break;
                        case 'stop':
                            events.push(
                                MusicXmlSpans.createEvent(
                                    MusicXmlSpanElement.Slash,
                                    MusicXmlSpanAction.Stop,
                                    MusicXmlSpanKind.None,
                                    '1'
                                )
                            );
                            break;
                    }
                    break;
            }
        }

        if (events.length > 0) {
            // the number of the measure style is the staff it applies to
            const staffIndex = element.attributes.has('number')
                ? Number.parseInt(element.attributes.get('number')!, 10) - 1
                : -1;
            for (const e of events) {
                e.staffIndex = staffIndex;
                e.position = MusicXmlSpans.position(
                    masterBar.index,
                    midBar ? this._musicalPosition : 0,
                    this._beatCount,
                    0
                );
            }
            this._indexToTrackInfo.get(track.index)!.spans.process(events);
        }
    }

    private _parseTranspose(element: XmlNode, track: Track): void {
        let semitones: number = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'diatonic': Not supported
                case 'chromatic':
                    semitones += Number.parseFloat(c.innerText);
                    break;
                case 'octave-change':
                    semitones += Number.parseFloat(c.innerText) * 12;
                    break;
                // case 'double': Not supported
            }
        }

        if (element.attributes.has('number')) {
            const staff = this._getOrCreateStaff(track, Number.parseInt(element.attributes.get('number')!, 10) - 1);
            this._getStaffContext(staff).transpose = semitones;
            staff.displayTranspositionPitch = semitones;
        } else {
            for (const staff of track.staves) {
                this._getStaffContext(staff).transpose = semitones;
                staff.displayTranspositionPitch = semitones;
            }
        }
    }

    private _parseStaffDetails(element: XmlNode, staff: Staff): void {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'staff-type': Ignored
                case 'staff-lines':
                    staff.standardNotationLineCount = Number.parseInt(c.innerText, 10);
                    break;
                // case 'line-detail': Not supported
                case 'staff-tuning':
                    this._parseStaffTuning(c, staff);
                    break;
                case 'capo':
                    staff.capo = Number.parseInt(c.innerText, 10);
                    break;
                // case 'staff-size': Not supported
            }
        }
    }

    private _parseStaffTuning(element: XmlNode, staff: Staff): void {
        if (staff.stringTuning.tunings.length === 0) {
            staff.showTablature = true;
            staff.showStandardNotation = false;
            staff.stringTuning.tunings = new Array<number>(staff.standardNotationLineCount).fill(0);
        }

        const line: number = Number.parseInt(element.getAttribute('line'), 10);
        let tuningStep: string = 'C';
        let tuningOctave: string = '';
        let tuningAlter: number = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'tuning-step':
                    tuningStep = c.innerText;
                    break;
                case 'tuning-alter':
                    tuningAlter = Number.parseFloat(c.innerText);
                    break;
                case 'tuning-octave':
                    tuningOctave = c.innerText;
                    break;
            }
        }
        const tuning: number = ModelUtils.getTuningForText(tuningStep + tuningOctave) + tuningAlter;
        staff.tuning[staff.tuning.length - line] = tuning;
    }

    private _parseClef(element: XmlNode, bar: Bar): void {
        let sign: string = 's';
        let line: number = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'sign':
                    sign = c.innerText.toLowerCase();
                    break;
                case 'line':
                    line = Number.parseInt(c.innerText, 10);
                    break;
                case 'clef-octave-change':
                    switch (Number.parseInt(c.innerText, 10)) {
                        case -2:
                            bar.clefOttava = Ottavia._15mb;
                            break;
                        case -1:
                            bar.clefOttava = Ottavia._8vb;
                            break;
                        case 1:
                            bar.clefOttava = Ottavia._8va;
                            break;
                        case 2:
                            bar.clefOttava = Ottavia._15mb;
                            break;
                    }
                    break;
            }
        }
        switch (sign) {
            case 'g':
                bar.clef = Clef.G2;
                break;
            case 'f':
                bar.clef = Clef.F4;
                break;
            case 'c':
                if (line === 3) {
                    bar.clef = Clef.C3;
                } else {
                    bar.clef = Clef.C4;
                }
                break;
            case 'percussion':
                bar.clef = Clef.Neutral;
                if (bar.index === 0) {
                    bar.staff.isPercussion = true;
                    bar.staff.showTablature = false;
                }
                break;
            case 'tab':
                bar.clef = Clef.G2;
                bar.staff.showTablature = true;
                break;
            default:
                bar.clef = Clef.G2;
                break;
        }
    }

    private _parseTime(element: XmlNode, masterBar: MasterBar): void {
        let beatsParsed: boolean = false;
        let beatTypeParsed: boolean = false;
        for (const c of element.childElements()) {
            const v: string = c.innerText;
            switch (c.localName) {
                case 'beats':
                    if (!beatsParsed) {
                        if (v.indexOf('+') === -1) {
                            masterBar.timeSignatureNumerator = Number.parseInt(v, 10);
                        } else {
                            masterBar.timeSignatureNumerator = v
                                .split('+')
                                .map(v => Number.parseInt(v, 10))
                                .reduce((sum, v) => v + sum, 0);
                        }
                        beatsParsed = true;
                    }
                    break;
                case 'beat-type':
                    if (!beatTypeParsed) {
                        if (v.indexOf('+') === -1) {
                            masterBar.timeSignatureDenominator = Number.parseInt(v, 10);
                        } else {
                            masterBar.timeSignatureDenominator = v
                                .split('+')
                                .map(v => Number.parseInt(v, 10))
                                .reduce((sum, v) => v + sum, 0);
                        }
                        beatTypeParsed = true;
                    }
                    break;
                // case 'interchangeable': Not supported
                // case 'senza-misura': Not supported
            }
        }

        switch (element.getAttribute('symbol', '')) {
            case 'common':
            case 'cut':
                masterBar.timeSignatureCommon = true;
                break;
            // case 'dotted-note': Not supported
            // case 'normal': implicit
            // case 'note': Not supported
            // case 'single-number': Not supported
        }
    }

    private _keyAllStaves: [KeySignature, KeySignatureType] | null = null;

    private _parseKey(element: XmlNode, masterBar: MasterBar, track: Track): void {
        let fifths: number = -(KeySignature.C as number);
        let mode: string = '';

        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'cancel': not supported
                case 'fifths':
                    fifths = Number.parseInt(c.innerText, 10);
                    break;
                case 'mode':
                    mode = c.innerText;
                    break;

                // case 'key-step': Not supported
                // case 'key-alter': Not supported
                // case 'key-accidental': Not supported
                // case 'key-octave': Not supported
            }
        }

        let keySignature: KeySignature;
        if (-7 <= fifths && fifths <= 7) {
            keySignature = fifths as KeySignature;
        } else {
            keySignature = KeySignature.C;
        }
        let keySignatureType: KeySignatureType;
        if (mode === 'minor') {
            keySignatureType = KeySignatureType.Minor;
        } else {
            keySignatureType = KeySignatureType.Major;
        }

        if (element.attributes.has('number')) {
            const staff = this._getOrCreateStaff(track, Number.parseInt(element.attributes.get('number')!, 10) - 1);
            const bar = this._getOrCreateBar(staff, masterBar);
            bar.keySignature = keySignature;
            bar.keySignatureType = keySignatureType;
        } else {
            // remember for bars which will be created
            this._keyAllStaves = [keySignature, keySignatureType];
            // apply to potentially created bars
            for (const s of track.staves) {
                if (s.bars.length > masterBar.index) {
                    s.bars[masterBar.index].keySignature = keySignature;
                    s.bars[masterBar.index].keySignatureType = keySignatureType;
                }
            }
        }
    }

    private _parseDirection(element: XmlNode, masterBar: MasterBar, track: Track) {
        const directionTypes: XmlNode[] = [];
        let offset: number | null = null;
        let offsetAffectsSound = false;
        let voice = '';
        let staffIndex = -1;
        let tempo = -1;
        let sound: XmlNode | null = null;
        let hasSoundDirections = false;
        // all words of the direction, also split ones like "D.S. al " + "Coda"
        let allWords = '';

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'direction-type': {
                    // See https://github.com/CoderLine/alphaTab/issues/2102
                    // only one type per direction-type is handled, the last one wins
                    const types = c.childElements();
                    if (types.length > 0) {
                        directionTypes.push(types[types.length - 1]);
                    }
                    for (const t of types) {
                        if (t.localName === 'words') {
                            allWords += t.innerText;
                        }
                    }
                    break;
                }
                case 'offset':
                    offset = Number.parseFloat(c.innerText);
                    offsetAffectsSound = c.getAttribute('sound', 'no') === 'yes';
                    break;
                // case 'footnote': Ignored
                // case 'level': Ignored
                case 'voice':
                    voice = c.innerText.trim();
                    break;
                case 'staff':
                    staffIndex = Number.parseInt(c.innerText, 10) - 1;
                    break;
                case 'sound':
                    if (c.attributes.has('tempo')) {
                        tempo = Number.parseFloat(c.attributes.get('tempo')!);
                    }
                    sound = c;
                    hasSoundDirections = this._parseSoundDirections(c, masterBar);
                    break;
                // case 'listening': Ignored
            }
        }

        // the staff of directions without staff, e.g. for pedal markers
        let staff: Staff;
        if (staffIndex >= 0) {
            staff = this._getOrCreateStaff(track, staffIndex);
        } else if (this._lastBeat !== null) {
            staff = this._lastBeat.voice.bar.staff;
        } else {
            staff = this._getOrCreateStaff(track, 0);
        }
        this._getOrCreateBar(staff, masterBar);

        const offsetTicks = offset !== null ? this._musicXmlDivisionsToAlphaTabTicks(offset!) : 0;
        const totalDuration = masterBar.calculateDuration(false);
        // the offset always affects the display, the sound only if specified
        const displayRatioPosition = (this._musicalPosition + offsetTicks) / totalDuration;
        const soundRatioPosition = offsetAffectsSound ? displayRatioPosition : this._musicalPosition / totalDuration;

        if (tempo > 0) {
            const tempoAutomation = new Automation();
            tempoAutomation.type = AutomationType.Tempo;
            tempoAutomation.value = tempo;
            tempoAutomation.ratioPosition = soundRatioPosition;

            if (!this._hasSameTempo(masterBar, tempoAutomation)) {
                masterBar.tempoAutomations.push(tempoAutomation);
            }
        }

        let previousWords: string = '';
        const spanEvents: MusicXmlSpanEvent[] = [];

        for (const direction of directionTypes) {
            switch (direction.localName) {
                case 'rehearsal':
                    masterBar.section = new Section();
                    masterBar.section.marker = direction.innerText;
                    break;
                // <sound> jump attributes are the authoritative directions, the symbols are only their visual counterpart
                // (e.g. a coda symbol printed next to "To Coda")
                case 'segno':
                    if (!hasSoundDirections) {
                        masterBar.addDirection(Direction.TargetSegno);
                    }
                    break;
                case 'coda':
                    if (!hasSoundDirections) {
                        masterBar.addDirection(Direction.TargetCoda);
                    }
                    break;
                case 'words':
                    previousWords = direction.innerText;
                    break;
                // case 'symbol': Not supported
                case 'wedge':
                    MusicXmlSpans.readWedge(direction, spanEvents);
                    break;
                case 'dynamics':
                    const newDynamics = this._parseDynamics(direction);
                    if (newDynamics !== null) {
                        this._currentDynamics = newDynamics;
                        this._score.stylesheet.hideDynamics = false;
                    }
                    break;
                case 'dashes':
                case 'bracket':
                    if (this._parseLine(direction, previousWords, track, masterBar, spanEvents)) {
                        // the words are the label of the line, unknown lines keep their words as text
                        previousWords = '';
                    }
                    break;
                case 'pedal':
                    MusicXmlSpans.readPedal(direction, spanEvents);
                    break;
                case 'metronome':
                    // <sound tempo> is the authoritative playback tempo, the metronome is only its visual counterpart
                    if (tempo <= 0) {
                        this._parseMetronome(direction, masterBar, displayRatioPosition);
                    }
                    break;
                case 'octave-shift':
                    MusicXmlSpans.readOctaveShift(direction, spanEvents);
                    break;
                // case 'harp-pedals': Not supported
                // case 'damp': Not supported
                // case 'damp-all': Not supported
                // case 'eyeglasses': Not supported
                // case 'string-mute': Not supported
                // case 'scordatura': Not supported
                // case 'image': Not supported
                // case 'principal-voice': Not supported
                // case 'percussion': Not supported
                // case 'accordion-registration': Not supported
                // case 'staff-divide': Not supported
                // case 'other-direction': Not supported
            }
        }

        if (spanEvents.length > 0) {
            const position = MusicXmlSpans.position(
                masterBar.index,
                this._musicalPosition,
                this._beatCount,
                offsetTicks
            );
            for (const e of spanEvents) {
                // directions without staff apply to all staves (resolved when the span is applied)
                e.staffIndex = staffIndex;
                e.voice = voice;
                e.position = position;
                switch (e.element) {
                    case MusicXmlSpanElement.Pedal:
                        // pedal markers are placed on a single staff
                        e.staffIndex = staff.index;
                        break;
                    case MusicXmlSpanElement.OctaveShift:
                        // the stop is placed within the last shifted note
                        e.endIncludesBeat = e.action === MusicXmlSpanAction.Stop && this._octaveShiftEndsBeforeLastNote;
                        break;
                }
            }
            // the voice the direction is written at is the voice of the following note
            if (this._pendingSpanTrack !== null && this._pendingSpanTrack !== track) {
                this._processPendingSpanEvents('');
            }
            for (const e of spanEvents) {
                this._pendingSpanEvents.push(e);
            }
            this._pendingSpanTrack = track;
            if (voice.length > 0) {
                this._processPendingSpanEvents(voice);
            }
        }

        // words printing the label of a <sound> direction are not repeated as text, the direction renders it
        if (previousWords && !(hasSoundDirections && MusicXmlImporter._isSoundDirectionLabel(allWords, sound!))) {
            this._nextBeatText = previousWords;
            this._nextBeatTextTrackIndex = track.index;
            this._nextBeatTextPosition = MusicXmlSpans.position(
                masterBar.index,
                this._musicalPosition,
                this._beatCount,
                0
            );
        }
    }

    /**
     * Reads a `<dashes>` or `<bracket>` line.
     * @returns Whether the words were used as the label of the line.
     */
    private _parseLine(
        element: XmlNode,
        words: string,
        track: Track,
        masterBar: MasterBar,
        spanEvents: MusicXmlSpanEvent[]
    ): boolean {
        const lineElement = element.localName === 'bracket' ? MusicXmlSpanElement.Bracket : MusicXmlSpanElement.Dashes;

        // the label can be a separate direction at the same position (e.g. music21)
        let label = words;
        let usesPendingText = false;
        if (
            label.length === 0 &&
            this._nextBeatText !== null &&
            this._nextBeatTextTrackIndex === track.index &&
            this._nextBeatTextPosition.barIndex === masterBar.index &&
            this._nextBeatTextPosition.ticks === this._musicalPosition &&
            element.getAttribute('type', 'start') === 'start'
        ) {
            label = this._nextBeatText!;
            usesPendingText = true;
        }

        const count = spanEvents.length;
        MusicXmlSpans.readLine(element, lineElement, label, spanEvents);
        const isKnown = spanEvents.length > count && spanEvents[count].kind !== MusicXmlSpanKind.None;
        if (isKnown && usesPendingText) {
            this._nextBeatText = null;
        }
        return isKnown;
    }
    private _parseMetronome(element: XmlNode, masterBar: MasterBar, ratioPosition: number) {
        let unit: Duration | null = null;
        let dots = 0;
        let perMinute: number = -1;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'beat-unit':
                    unit = this._parseBeatDuration(c);
                    break;
                case 'beat-unit-dot':
                    dots++;
                    break;
                //  case 'beat-unit-tied' not supported
                case 'per-minute':
                    perMinute = Number.parseFloat(c.innerText);
                    break;
                // case 'metronome-arrows': not supported
                // case 'metronome-note': not supported
                // case 'metronome-relation': not supported
            }
        }

        if (unit !== null && perMinute > 0) {
            const tempoAutomation: Automation = new Automation();
            tempoAutomation.type = AutomationType.Tempo;
            // alphaTab tempos are quarter notes per minute
            const quartersPerUnit = (MidiUtils.toTicks(unit) / MidiUtils.QuarterTime) * (2 - Math.pow(0.5, dots));
            tempoAutomation.value = perMinute * quartersPerUnit;
            tempoAutomation.ratioPosition = ratioPosition;

            if (!this._hasSameTempo(masterBar, tempoAutomation)) {
                masterBar.tempoAutomations.push(tempoAutomation);
            }
        }
    }

    private _hasSameTempo(masterBar: MasterBar, tempoAutomation: Automation) {
        for (const existing of masterBar.tempoAutomations) {
            if (tempoAutomation.ratioPosition === existing.ratioPosition && tempoAutomation.value === existing.value) {
                return true;
            }
        }
        return false;
    }

    private _parseDynamics(element: XmlNode) {
        for (const c of element.childElements()) {
            // we are having the same enum names as MusicXML uses as tagnames
            const dynamicString = c.localName!.toUpperCase() as keyof typeof DynamicValue;
            switch (dynamicString) {
                case 'PPP':
                case 'PP':
                case 'P':
                case 'MP':
                case 'MF':
                case 'F':
                case 'FF':
                case 'FFF':
                case 'PPPP':
                case 'PPPPP':
                case 'PPPPPP':
                case 'FFFF':
                case 'FFFFF':
                case 'FFFFFF':
                case 'SF':
                case 'SFP':
                case 'SFPP':
                case 'FP':
                case 'RF':
                case 'RFZ':
                case 'SFZ':
                case 'SFFZ':
                case 'FZ':
                case 'N':
                case 'PF':
                case 'SFZP':
                    return DynamicValue[dynamicString];
                // case 'other-dynamics': not supported
            }
        }

        return null;
    }

    private _parseForward(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'duration':
                    this._musicalPosition += this._musicXmlDivisionsToAlphaTabTicks(Number.parseFloat(c.innerText));
                    break;
                // case 'footnote': Ignored
                // case 'level': Ignored
                // case 'voice': Not supported, spec is quite vague how to this should behave, we keep it simple for now
                // case 'staff': Not supported, spec is quite vague how to this should behave, we keep it simple for now
            }
        }
    }

    private _parseBackup(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'duration':
                    const beat = this._lastBeat;
                    if (beat) {
                        let musicalPosition = this._musicalPosition;
                        musicalPosition -= this._musicXmlDivisionsToAlphaTabTicks(Number.parseFloat(c.innerText));
                        if (musicalPosition < 0) {
                            musicalPosition = 0;
                        }
                        this._musicalPosition = musicalPosition;
                    }
                    break;
                // case 'footnote': Ignored
                // case 'level': Ignored
            }
        }
    }

    private _getOrCreateStaff(track: Track, staffIndex: number): Staff {
        while (track.staves.length <= staffIndex) {
            const staff = new Staff();
            track.addStaff(staff);

            // ensure bars on new staff
            if (this._score.masterBars.length > 0) {
                this._getOrCreateBar(staff, this._score.masterBars[this._score.masterBars.length - 1]);
            }
        }

        return track.staves[staffIndex];
    }

    private _getOrCreateBar(staff: Staff, masterBar: MasterBar): Bar {
        const voiceCount = staff.bars.length === 0 ? 1 : staff.bars[0].voices.length;

        while (staff.bars.length <= masterBar.index) {
            const newBar = new Bar();

            staff.addBar(newBar);

            if (newBar.previousBar) {
                newBar.clef = newBar.previousBar.clef;
                newBar.clefOttava = newBar.previousBar.clefOttava;
                newBar.keySignature = newBar.previousBar!.keySignature;
                newBar.keySignatureType = newBar.previousBar!.keySignatureType;
            }

            if (this._keyAllStaves != null) {
                newBar.keySignature = this._keyAllStaves![0];
                newBar.keySignatureType = this._keyAllStaves![1];
            }

            for (let i = 0; i < voiceCount; i++) {
                const voice: Voice = new Voice();
                newBar.addVoice(voice);
            }
        }

        return staff.bars[masterBar.index];
    }

    private _resolveAndPlaceVoice(staff: Staff, rawVoice: string, bar: Bar): Voice {
        let packing: StaffVoicePacking;
        if (this._staffVoicePacking.has(staff)) {
            packing = this._staffVoicePacking.get(staff)!;
        } else {
            packing = new StaffVoicePacking();
            this._staffVoicePacking.set(staff, packing);
        }

        if (packing.mapping.has(rawVoice)) {
            return bar.voices[packing.mapping.get(rawVoice)!];
        }

        let newVoiceNumber = Number.parseInt(rawVoice, 10);
        if (Number.isNaN(newVoiceNumber)) {
            Logger.warning('MusicXML', 'Voices need to be specified as numbers');
            newVoiceNumber = 0;
        }

        // the first voice on the staff takes the initial voice which every bar is created with
        if (packing.sortedRawVoices.length === 0) {
            packing.sortedRawVoices.push(rawVoice);
            packing.mapping.set(rawVoice, 0);
            return bar.voices[0];
        }

        // find sorted-insertion position
        let insertPos = packing.sortedRawVoices.length;
        for (let i = 0; i < packing.sortedRawVoices.length; i++) {
            const existing = Number.parseInt(packing.sortedRawVoices[i], 10);
            const existingNumber = Number.isNaN(existing) ? 0 : existing;
            if (existingNumber > newVoiceNumber) {
                insertPos = i;
                break;
            }
        }

        packing.sortedRawVoices.splice(insertPos, 0, rawVoice);

        // insert a new Voice at insertPos in every bar of the staff, and re-index
        for (const b of staff.bars) {
            b.voices.splice(insertPos, 0, new Voice());
            for (let i = insertPos; i < b.voices.length; i++) {
                b.voices[i].index = i;
                b.voices[i].bar = b;
            }
        }

        // refresh mapping
        packing.mapping.clear();
        for (let i = 0; i < packing.sortedRawVoices.length; i++) {
            packing.mapping.set(packing.sortedRawVoices[i], i);
        }

        return bar.voices[insertPos];
    }

    private _parseNote(element: XmlNode, masterBar: MasterBar, track: Track) {
        // The <note> content model lists the identity and placement of the note (chord, pitch/unpitched/rest,
        // instrument, voice, staff) before most other children, but <staff> comes late (after e.g. <notehead>).
        // To interpret all children with the note attached to its beat/voice/bar/staff, we first read
        // identity and placement, attach the note, and then interpret the remaining children in a second pass.

        // Pass 1: identity and placement
        let isChord = false;
        let note: Note | null = null;
        let isPitched = false;
        let instrumentId: string | null = null;
        let staffIndex = 0;
        let voiceRaw: string = '1';
        let isPlacementComplete = false;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'cue':
                    // not supported
                    // as they are meant to not be played, we skip them completely
                    // instead of handling them wrong.
                    // <cue> is part of the leading group of the note, nothing was created yet.
                    return;
                case 'chord':
                    isChord = true;
                    break;
                case 'pitch':
                    note = this._parsePitch(c);
                    isPitched = true;
                    break;
                case 'unpitched':
                    note = this._parseUnpitched(c, track);
                    break;
                case 'instrument':
                    instrumentId = c.getAttribute('id', '');
                    break;
                case 'voice': {
                    const trimmed = c.innerText.trim();
                    voiceRaw = trimmed.length > 0 ? trimmed : '1';
                    break;
                }
                case 'staff':
                    staffIndex = Number.parseInt(c.innerText, 10) - 1;
                    // last placement information
                    isPlacementComplete = true;
                    break;
                // elements following <staff> carry no placement information
                case 'beam':
                case 'notations':
                case 'lyric':
                case 'play':
                case 'listen':
                    isPlacementComplete = true;
                    break;
            }

            if (isPlacementComplete) {
                break;
            }
        }

        this._processPendingSpanEvents(voiceRaw);

        if (isChord && !this._lastBeat) {
            Logger.warning('MusicXML', 'Malformed MusicXML, <chord /> cannot be set on the first note of a measure');
            isChord = false;
        }

        if (isChord && !note) {
            Logger.warning('MusicXML', 'Cannot mix <chord /> and <rest />');
            isChord = false;
        }

        // the stem direction relates to the written pitch, hence remember it before the staff transposition is applied
        const writtenNoteValue = note !== null ? this._calculatePitchedNoteValue(note) : 0;

        const staff = this._getOrCreateStaff(track, staffIndex);
        let beat: Beat;
        if (isChord) {
            beat = this._lastBeat!;
            beat.addNote(note!);
        } else {
            beat = this._createBeat(staff, masterBar, voiceRaw, note);
        }

        if (note !== null) {
            note.isVisible = element.getAttribute('print-object', 'yes') !== 'no';
            this._resolveAttachedNote(note, instrumentId, isPitched);
        }

        // Pass 2: interpret all other children with the note attached
        let graceType = GraceType.None;
        let graceDurationInDivisions = 0;
        let beamMode: BeatBeamingMode | null = null;
        // let graceTimeStealPrevious = 0;
        // let graceTimeStealFollowing = 0;

        let durationInTicks = -1;
        let beatDuration: Duration | null = null;
        let dots = 0;

        let tupletNumerator = -1;
        let tupletDenominator = -1;

        let preferredBeamDirection: BeamDirection | null = null;

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'grace':
                    const makeTime = Number.parseFloat(c.getAttribute('make-time', '-1'));
                    if (makeTime >= 0) {
                        graceDurationInDivisions = this._musicXmlDivisionsToAlphaTabTicks(makeTime);
                        graceType = GraceType.BeforeBeat;
                    } else {
                        graceType = GraceType.OnBeat;
                    }

                    if (c.getAttribute('slash') === 'yes') {
                        graceType = GraceType.BeforeBeat;
                    }

                    // graceTimeStealPrevious = parseInt(c.getAttribute('steal-time-following', '0')) / 100.0;
                    // graceTimeStealFollowing = parseInt(c.getAttribute('steal-time-previous', '0')) / 100.0;
                    break;

                // case 'cue': handled in pass 1
                // case 'chord': handled in pass 1
                // case 'pitch': handled in pass 1
                // case 'unpitched': handled in pass 1
                case 'rest':
                    if (beatDuration === null) {
                        beatDuration = Duration.Whole;
                    }
                    break;

                case 'duration':
                    durationInTicks = this._parseDuration(c);
                    break;
                // case 'tie': Ignored -> "tie" is sound, "tied" is notation
                case 'tied':
                    // not valid at this place but written for let ring by TuxGuitar
                    if (note && c.getAttribute('type') === 'let-ring') {
                        note.isLetRing = true;
                    }
                    break;
                // case 'instrument': handled in pass 1

                // case 'footnote': Ignored
                // case 'level': Ignored
                // case 'voice': handled in pass 1
                case 'type':
                    beatDuration = this._parseBeatDuration(c);
                    break;
                case 'dot':
                    dots++;
                    break;
                case 'accidental':
                    if (note === null) {
                        Logger.warning('MusicXML', 'Malformed MusicXML, missing pitch or unpitched for note');
                    } else {
                        this._parseAccidental(c, note);
                    }
                    break;
                case 'time-modification':
                    for (const tmc of c.childElements()) {
                        switch (tmc.localName) {
                            case 'actual-notes':
                                tupletNumerator = Number.parseInt(tmc.innerText, 10);
                                break;
                            case 'normal-notes':
                                tupletDenominator = Number.parseInt(tmc.innerText, 10);
                                break;
                            // case 'normal-type': not supported
                            // case 'normal-dot': not supported
                        }
                    }
                    break;
                case 'stem':
                    preferredBeamDirection = this._parseStem(c);
                    break;
                case 'notehead':
                    if (note === null) {
                        Logger.warning('MusicXML', 'Malformed MusicXML, missing pitch or unpitched for note');
                    } else {
                        this._parseNoteHead(
                            c,
                            note,
                            beatDuration ?? Duration.Quarter,
                            preferredBeamDirection ?? this._estimateBeamDirection(writtenNoteValue)
                        );
                    }
                    break;
                // case 'notehead-text': Not supported
                // case 'staff': handled in pass 1
                case 'beam':
                    // use the first beam as indicator whether to beam or split
                    if (c.getAttribute('number', '1') === '1') {
                        switch (c.innerText) {
                            case 'begin':
                                beamMode = BeatBeamingMode.ForceMergeWithNext;
                                break;
                            case 'continue':
                                beamMode = BeatBeamingMode.ForceMergeWithNext;
                                break;
                            case 'end':
                                beamMode = BeatBeamingMode.ForceSplitToNext;
                                break;
                        }
                    }
                    break;
                case 'notations':
                    this._parseNotations(c, note, beat, voiceRaw);
                    break;
                case 'lyric':
                    this._parseLyric(c, beat, track);
                    break;
                case 'play':
                    this._parsePlay(c, note);
                    break;
                // case 'listen': Ignored
            }
        }

        // a chord note joins the already completed beat of the previous note
        if (!isChord) {
            if (beamMode === null) {
                beat.beamingMode = this._getStaffContext(staff).isExplicitlyBeamed
                    ? BeatBeamingMode.ForceSplitToNext
                    : BeatBeamingMode.Auto;
            } else {
                beat.beamingMode = beamMode;
                this._getStaffContext(staff).isExplicitlyBeamed = true;
            }

            if (durationInTicks < 0 && beatDuration !== null) {
                durationInTicks = MidiUtils.toTicks(beatDuration!);
                if (dots > 0) {
                    durationInTicks = MidiUtils.applyDot(durationInTicks, dots === 2);
                }
            }

            // duration only after we added it into the tree
            if (graceType !== GraceType.None) {
                beat.graceType = graceType;
                this._applyBeatDurationFromTicks(beat, graceDurationInDivisions, null, false);
            } else {
                beat.tupletNumerator = tupletNumerator;
                beat.tupletDenominator = tupletDenominator;
                beat.dots = dots;
                beat.preferredBeamDirection = preferredBeamDirection;
                this._applyBeatDurationFromTicks(beat, durationInTicks, beatDuration, true);
            }

            this._musicalPosition = beat.displayEnd;
            this._lastBeat = beat;
        }

        if (note !== null) {
            // <technical><string> is only known after pass 2
            this._finalizeStringNumber(note);
        }
    }

    /**
     * Creates a new beat for the note on the given staff and inserts it into the voice at the current musical position.
     * The beat level information of the note (beaming, duration, tuplets etc.) is applied after the note was fully parsed.
     */
    private _createBeat(staff: Staff, masterBar: MasterBar, voiceRaw: string, note: Note | null): Beat {
        const bar = this._getOrCreateBar(staff, masterBar);
        const voice = this._resolveAndPlaceVoice(staff, voiceRaw, bar);

        const actualMusicalPosition = voice.beats.length === 0 ? 0 : voice.beats[voice.beats.length - 1].displayEnd;

        let gap = this._musicalPosition - actualMusicalPosition;
        if (gap > 0) {
            // we do not support cross staff beams yet and its a bigger thing to implement
            // until then we try to detect whether we have a beam-group
            // which starts at this staff, swaps to another, and comes back.
            // then we create matching rests here

            if (
                // Previously created beat has forced beams and is on another stuff
                this._lastBeat &&
                this._lastBeat.beamingMode === BeatBeamingMode.ForceMergeWithNext &&
                this._lastBeat.voice.bar.staff.index !== staff.index &&
                // previous beat on this staff is also forced
                voice.beats.length > 0 &&
                voice.beats[voice.beats.length - 1].beamingMode === BeatBeamingMode.ForceMergeWithNext
            ) {
                // chances are high that we have notes like this
                // staff1Note -> staff2Note -> staff2Note -> staff1Note
                // in this case we create rests for the gap caused by the staff2Notes
                const preferredDuration = voice.beats[voice.beats.length - 1].duration;
                while (gap > 0) {
                    const restGap = this._createRestForGap(gap, preferredDuration);
                    if (restGap !== null) {
                        this._insertBeatToVoice(restGap, voice);
                        gap -= restGap.playbackDuration;
                    } else {
                        break;
                    }
                }
            }

            // need an empty placeholder beat for the gap
            if (gap > 0) {
                const placeholder = new Beat();
                placeholder.dynamics = this._currentDynamics;
                placeholder.isEmpty = true;
                placeholder.duration = Duration.TwoHundredFiftySixth; // smallest we have
                placeholder.overrideDisplayDuration = gap;
                placeholder.updateDurations();
                this._insertBeatToVoice(placeholder, voice);
            }
        } else if (gap < 0) {
            Logger.error(
                'MusicXML',
                'Unsupported forward/backup detected. Cannot fill new beats into already filled area of voice'
            );
        }

        const newBeat = new Beat();
        this._beatSequence.set(newBeat, this._beatCount);
        this._beatCount++;
        newBeat.isEmpty = false;
        newBeat.dynamics = this._currentDynamics;

        const automations = this._nextBeatAutomations;
        this._nextBeatAutomations = null;
        if (automations !== null) {
            for (const automation of automations) {
                newBeat.automations.push(automation);
            }
        }

        const chord = this._nextBeatChord;
        this._nextBeatChord = null;
        if (chord !== null) {
            newBeat.chordId = chord.uniqueId;
            if (!voice.bar.staff.hasChord(chord.uniqueId)) {
                voice.bar.staff.addChord(newBeat.chordId!, chord);
            }
        }

        if (this._nextBeatText) {
            newBeat.text = this._nextBeatText;
            this._nextBeatText = null;
        }

        // the note needs to be added before inserting (voice checks for rests)
        if (note !== null) {
            newBeat.addNote(note!);
        }

        this._insertBeatToVoice(newBeat, voice);

        return newBeat;
    }

    /**
     * Validates the string parsed from `<technical><string>` and decides whether it is a
     * tab position (string + fret) or a string number annotation on a pitched note.
     */
    private _finalizeStringNumber(note: Note) {
        if (Number.isNaN(note.string)) {
            return;
        }

        const stringCount = Note.getStringCount(note.beat.voice.bar.staff);
        if (note.string < 1 || note.string > stringCount) {
            Logger.warning('MusicXML', `Ignoring <string> outside of the available ${stringCount} strings`);
            note.string = Number.NaN;
            note.fret = Number.NaN;
            return;
        }

        // the note was attached to its beat before the string was known, register it now for the lookups by string
        // (e.g. hammer-on destinations, let ring ending on the same string)
        note.beat.noteStringLookup.set(note.string, note);

        // dead notes are commonly written without fret (e.g. Guitar Pro 5), the string still defines the tab position
        if (!note.isStringed && note.isDead && note.beat.voice.bar.staff.tuning.length > 0) {
            note.fret = Math.max(0, this._calculatePitchedNoteValue(note) - note.stringTuning);
        }

        if (!note.isStringed && !note.isPercussion) {
            note.showStringNumber = true;
        }
    }

    /**
     * Whether the note is played on a fretted instrument, which decides whether an x notehead or a mute is a dead note.
     * MusicXML has no dedicated element for dead notes. Applications encode them as x notehead (MuseScore, TuxGuitar, Guitar Pro)
     * or mute (TuxGuitar, Guitar Pro) which have other meanings on other instruments (e.g. hi-hats on percussion, spoken notes).
     * The whole part is checked as the tuning is often only specified on the tablature staff while the x notehead
     * is on the standard notation staff.
     */
    private _isFrettedInstrumentNote(note: Note): boolean {
        if (note.isPercussion) {
            return false;
        }
        for (const staff of note.beat.voice.bar.staff.track.staves) {
            if (staff.isStringed) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resolves the note values which depend on the staff the note is attached to.
     *
     * Purpose:
     * - Apply the staff transposition to pitched notes.
     * - Resolve percussion articulation consistently in one place.
     *
     * Why this is called right after attaching the note:
     * - The logic relies on the note context (attached beat/voice/bar/staff), especially
     *   staff percussion state, and on the final display value after transposition.
     * - The remaining children of the note are interpreted afterwards and rely on the resolved
     *   note (e.g. ties are matched on the transposed pitch).
     */
    private _resolveAttachedNote(note: Note, instrumentId: string | null, isPitched: boolean) {
        const staff = note.beat.voice.bar.staff;
        if (isPitched) {
            const transpose = this._getStaffContext(staff).transpose;
            if (transpose !== 0) {
                const value = note.octave * 12 + note.tone + transpose;
                note.octave = (value / 12) | 0;
                note.tone = value - note.octave * 12;
            }
        }

        const track = staff.track;
        const trackInfo = this._indexToTrackInfo.get(track.index)!;

        if (!isPitched) {
            // <unpitched> note -> always a percussion/unpitched sound
            note.percussionArticulation = trackInfo.getOrCreateArticulation(instrumentId ?? '', note);
            return;
        }

        // isPitched === true from here on: only treat as percussion if we have
        // explicit evidence this is really an unpitched/percussion sound. A plain
        // <instrument> reference on a pitched note can just be disambiguating between
        // multiple pitched score-instruments in the same part and must not imply percussion.
        if (instrumentId !== null && trackInfo.isUnpitchedInstrument(instrumentId)) {
            note.percussionArticulation = trackInfo.getOrCreateArticulation(instrumentId, note);
        } else if (staff.isPercussion) {
            const knownArticulation = PercussionMapper.getArticulationById(note.displayValue);
            if (knownArticulation) {
                note.percussionArticulation = track.getOrRegisterPercussionArticulation(knownArticulation);
            }
        }
    }

    private _parsePlay(element: XmlNode, note: Note | null) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'ipa': Ignored
                case 'mute':
                    if (note) {
                        switch (c.innerText) {
                            case 'palm':
                                note.isPalmMute = true;
                                break;
                            // an undifferentiated or straight mute (e.g. TuxGuitar, Guitar Pro) on a fretted instrument is a dead note
                            case 'on':
                            case 'straight':
                                if (this._isFrettedInstrumentNote(note)) {
                                    note.isDead = true;
                                }
                                break;
                        }
                    }
                    break;
                case 'semi-pitched':
                    break;
                // case 'other-play': Ignored
            }
        }
    }

    private static readonly _b4Value = 71;
    private _estimateBeamDirection(writtenNoteValue: number): BeamDirection {
        return writtenNoteValue < MusicXmlImporter._b4Value ? BeamDirection.Down : BeamDirection.Up;
    }

    private _parseNoteHead(element: XmlNode, note: Note, beatDuration: Duration, beamDirection: BeamDirection) {
        if (element.getAttribute('parentheses', 'no') === 'yes') {
            note.isGhost = true;
        }

        const filled = element.getAttribute('filled', '');
        let forceFill: boolean | undefined = undefined;
        if (filled === 'yes') {
            forceFill = true;
        } else if (filled === 'no') {
            forceFill = false;
        }

        note.style = new NoteStyle();
        switch (element.innerText) {
            case 'arrow down':
                note.style!.noteHeadCenterOnStem = true;
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadTriangleDownDoubleWhole,
                    MusicFontSymbol.NoteheadTriangleDownWhole,
                    MusicFontSymbol.NoteheadTriangleDownHalf,
                    MusicFontSymbol.NoteheadTriangleDownBlack
                );
                break;
            case 'arrow up':
                note.style!.noteHeadCenterOnStem = true;
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadTriangleUpDoubleWhole,
                    MusicFontSymbol.NoteheadTriangleUpWhole,
                    MusicFontSymbol.NoteheadTriangleUpHalf,
                    MusicFontSymbol.NoteheadTriangleUpBlack
                );
                break;
            case 'back slashed':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadSlashedDoubleWhole2,
                    MusicFontSymbol.NoteheadSlashedWhole2,
                    MusicFontSymbol.NoteheadSlashedHalf2,
                    MusicFontSymbol.NoteheadSlashedBlack2
                );
                break;
            case 'circle dot':
                note.style.noteHead = MusicFontSymbol.NoteheadRoundWhiteWithDot;
                break;
            case 'circle-x':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadCircleXDoubleWhole,
                    MusicFontSymbol.NoteheadCircleXWhole,
                    MusicFontSymbol.NoteheadCircleXHalf,
                    MusicFontSymbol.NoteheadCircleX
                );
                break;
            case 'circled':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadCircledDoubleWhole,
                    MusicFontSymbol.NoteheadCircledWhole,
                    MusicFontSymbol.NoteheadCircledHalf,
                    MusicFontSymbol.NoteheadCircledBlack
                );
                break;
            case 'cluster':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadClusterDoubleWhole3rd,
                    MusicFontSymbol.NoteheadClusterWhole3rd,
                    MusicFontSymbol.NoteheadClusterHalf3rd,
                    MusicFontSymbol.NoteheadClusterQuarter3rd
                );
                break;
            case 'cross':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadPlusDoubleWhole,
                    MusicFontSymbol.NoteheadPlusWhole,
                    MusicFontSymbol.NoteheadPlusHalf,
                    MusicFontSymbol.NoteheadPlusBlack
                );
                break;
            case 'diamond':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadDiamondDoubleWhole,
                    MusicFontSymbol.NoteheadDiamondWhole,
                    MusicFontSymbol.NoteheadDiamondHalf,
                    MusicFontSymbol.NoteheadDiamondBlack
                );
                break;
            case 'do':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteShapeTriangleUpWhite,
                    MusicFontSymbol.NoteShapeTriangleUpWhite,
                    MusicFontSymbol.NoteShapeTriangleUpWhite,
                    MusicFontSymbol.NoteShapeTriangleUpBlack
                );
                break;
            case 'fa':
                if (beamDirection === BeamDirection.Up) {
                    this._applyNoteHead(
                        note,
                        beatDuration,
                        forceFill,
                        MusicFontSymbol.NoteShapeTriangleRightWhite,
                        MusicFontSymbol.NoteShapeTriangleRightWhite,
                        MusicFontSymbol.NoteShapeTriangleRightWhite,
                        MusicFontSymbol.NoteShapeTriangleRightBlack
                    );
                } else {
                    this._applyNoteHead(
                        note,
                        beatDuration,
                        forceFill,
                        MusicFontSymbol.NoteShapeTriangleLeftWhite,
                        MusicFontSymbol.NoteShapeTriangleLeftWhite,
                        MusicFontSymbol.NoteShapeTriangleLeftWhite,
                        MusicFontSymbol.NoteShapeTriangleLeftBlack
                    );
                }
                break;
            case 'fa up':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteShapeTriangleLeftWhite,
                    MusicFontSymbol.NoteShapeTriangleLeftWhite,
                    MusicFontSymbol.NoteShapeTriangleLeftWhite,
                    MusicFontSymbol.NoteShapeTriangleLeftBlack
                );
                break;
            case 'inverted triangle':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadTriangleDownDoubleWhole,
                    MusicFontSymbol.NoteheadTriangleDownWhole,
                    MusicFontSymbol.NoteheadTriangleDownHalf,
                    MusicFontSymbol.NoteheadTriangleDownBlack
                );
                break;
            case 'la':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteShapeSquareWhite,
                    MusicFontSymbol.NoteShapeSquareWhite,
                    MusicFontSymbol.NoteShapeSquareWhite,
                    MusicFontSymbol.NoteShapeSquareBlack
                );
                break;
            case 'left triangle':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadTriangleRightWhite,
                    MusicFontSymbol.NoteheadTriangleRightWhite,
                    MusicFontSymbol.NoteheadTriangleRightWhite,
                    MusicFontSymbol.NoteheadTriangleRightBlack
                );
                break;
            case 'mi':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteShapeDiamondWhite,
                    MusicFontSymbol.NoteShapeDiamondWhite,
                    MusicFontSymbol.NoteShapeDiamondWhite,
                    MusicFontSymbol.NoteShapeDiamondBlack
                );
                break;
            case 'none':
                note.style!.noteHead = MusicFontSymbol.NoteheadNull;
                break;
            case 'normal':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadDoubleWhole,
                    MusicFontSymbol.NoteheadWhole,
                    MusicFontSymbol.NoteheadHalf,
                    MusicFontSymbol.NoteheadBlack
                );
                break;
            case 're':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteShapeMoonWhite,
                    MusicFontSymbol.NoteShapeMoonWhite,
                    MusicFontSymbol.NoteShapeMoonWhite,
                    MusicFontSymbol.NoteShapeMoonBlack
                );
                break;
            case 'rectangle':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadSquareWhite,
                    MusicFontSymbol.NoteheadSquareWhite,
                    MusicFontSymbol.NoteheadSquareWhite,
                    MusicFontSymbol.NoteheadSquareBlack
                );
                break;
            case 'slash':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadSlashWhiteWhole,
                    MusicFontSymbol.NoteheadSlashWhiteWhole,
                    MusicFontSymbol.NoteheadSlashWhiteHalf,
                    MusicFontSymbol.NoteheadSlashHorizontalEnds
                );
                break;
            case 'slashed':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadSlashedDoubleWhole1,
                    MusicFontSymbol.NoteheadSlashedWhole1,
                    MusicFontSymbol.NoteheadSlashedHalf1,
                    MusicFontSymbol.NoteheadSlashedBlack1
                );
                break;
            case 'so':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteShapeRoundWhite,
                    MusicFontSymbol.NoteShapeRoundWhite,
                    MusicFontSymbol.NoteShapeRoundWhite,
                    MusicFontSymbol.NoteShapeRoundBlack
                );
                break;
            case 'square':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteShapeSquareWhite,
                    MusicFontSymbol.NoteShapeSquareWhite,
                    MusicFontSymbol.NoteShapeSquareWhite,
                    MusicFontSymbol.NoteShapeSquareBlack
                );
                break;
            case 'ti':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteShapeTriangleRoundWhite,
                    MusicFontSymbol.NoteShapeTriangleRoundWhite,
                    MusicFontSymbol.NoteShapeTriangleRoundWhite,
                    MusicFontSymbol.NoteShapeTriangleRoundBlack
                );
                break;
            case 'triangle':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadTriangleUpDoubleWhole,
                    MusicFontSymbol.NoteheadTriangleUpWhole,
                    MusicFontSymbol.NoteheadTriangleUpHalf,
                    MusicFontSymbol.NoteheadTriangleUpBlack
                );
                break;
            case 'x':
                this._applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadXDoubleWhole,
                    MusicFontSymbol.NoteheadXWhole,
                    MusicFontSymbol.NoteheadXHalf,
                    MusicFontSymbol.NoteheadXBlack
                );
                if (this._isFrettedInstrumentNote(note)) {
                    note.isDead = true;
                }
                break;
        }
    }

    private _createRestForGap(gap: number, preferredDuration: Duration): Beat | null {
        let preferredDurationTicks = MidiUtils.toTicks(preferredDuration);

        // shorten the beat duration until we fit
        while (preferredDurationTicks > gap) {
            if (preferredDuration === Duration.TwoHundredFiftySixth) {
                return null; // cannot get shorter
            }

            preferredDuration = (preferredDuration * 2) as Duration;
            preferredDurationTicks = MidiUtils.toTicks(preferredDuration);
        }

        const placeholder = new Beat();
        placeholder.dynamics = this._currentDynamics;
        placeholder.isEmpty = false;
        placeholder.duration = preferredDuration;
        placeholder.overrideDisplayDuration = preferredDurationTicks;
        placeholder.updateDurations();
        return placeholder;
    }

    private _insertBeatToVoice(newBeat: Beat, voice: Voice) {
        // for handling the correct musical position we already need to do some basic beat linking
        // and assignments of start/durations as we progress.

        if (voice.beats.length > 0) {
            const lastBeat = voice.beats[voice.beats.length - 1];

            // chain beats already
            lastBeat.nextBeat = newBeat;
            newBeat.previousBeat = lastBeat!;

            // find display start from previous non-grace beat,
            // reminder: we give grace a display position of 0, that's why we skip them.
            // visually they 'stick' to their next beat.
            let previousNonGraceBeat: Beat | null = lastBeat;
            while (previousNonGraceBeat !== null) {
                if (previousNonGraceBeat.graceType === GraceType.None) {
                    // found
                    break;
                }

                if (previousNonGraceBeat.index > 0) {
                    previousNonGraceBeat = previousNonGraceBeat.previousBeat;
                } else {
                    previousNonGraceBeat = null;
                }
            }

            if (previousNonGraceBeat !== null) {
                newBeat.displayStart = previousNonGraceBeat.displayEnd;
            }
        }

        voice.addBeat(newBeat);
    }

    private _musicXmlDivisionsToAlphaTabTicks(divisions: number): number {
        // we translate the Divisions-per-quarter-note of the MusicXML to our fixed MidiUtils.QuarterTime

        return (divisions * MidiUtils.QuarterTime) / this._divisionsPerQuarterNote;
    }

    private _parseBeatDuration(element: XmlNode): Duration | null {
        switch (element.innerText) {
            case '1024th': // not supported
                return Duration.TwoHundredFiftySixth;
            case '512th': // not supported
                return Duration.TwoHundredFiftySixth;
            case '256th':
                return Duration.TwoHundredFiftySixth;
            case '128th':
                return Duration.OneHundredTwentyEighth;
            case '64th':
                return Duration.SixtyFourth;
            case '32nd':
                return Duration.ThirtySecond;
            case '16th':
                return Duration.Sixteenth;
            case 'eighth':
                return Duration.Eighth;
            case 'quarter':
                return Duration.Quarter;
            case 'half':
                return Duration.Half;
            case 'whole':
                return Duration.Whole;
            case 'breve':
                return Duration.DoubleWhole;
            case 'long':
                return Duration.QuadrupleWhole;
            // case "maxima": not supported
        }

        return null;
    }

    private static _allDurations = [
        Duration.TwoHundredFiftySixth,
        Duration.OneHundredTwentyEighth,
        Duration.SixtyFourth,
        Duration.ThirtySecond,
        Duration.Sixteenth,
        Duration.Eighth,
        Duration.Quarter,
        Duration.Half,
        Duration.Whole,
        Duration.DoubleWhole,
        Duration.QuadrupleWhole
    ];

    private static _allDurationTicks = MusicXmlImporter._allDurations.map(d => MidiUtils.toTicks(d));

    private _applyBeatDurationFromTicks(
        newBeat: Beat,
        ticks: number,
        beatDuration: Duration | null,
        applyDisplayDuration: boolean
    ) {
        if (!beatDuration) {
            for (let i = 0; i < MusicXmlImporter._allDurations.length; i++) {
                const dt = MusicXmlImporter._allDurationTicks[i];
                if (ticks >= dt) {
                    beatDuration = MusicXmlImporter._allDurations[i];
                } else {
                    break;
                }
            }
        }

        newBeat.duration = beatDuration ?? Duration.Sixteenth;
        if (applyDisplayDuration) {
            newBeat.overrideDisplayDuration = ticks;
        }

        newBeat.updateDurations();
    }

    private _parseLyric(element: XmlNode, beat: Beat, track: Track) {
        const info = this._indexToTrackInfo.get(track.index)!;
        const index = info.getLyricLine(element.getAttribute('number', ''));
        if (beat.lyrics === null) {
            beat.lyrics = [];
        }
        while (beat.lyrics.length <= index) {
            beat.lyrics.push('');
        }

        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'syllabic' not supported
                case 'text':
                    if (beat.lyrics[index]) {
                        beat.lyrics[index] += ` ${c.innerText}`;
                    } else {
                        beat.lyrics[index] = c.innerText;
                    }
                    break;
                case 'elision':
                    beat.lyrics[index] += c.innerText;
                    break;
            }
        }
    }

    private _parseNotations(element: XmlNode, note: Note | null, beat: Beat, voice: string) {
        const spanEvents: MusicXmlSpanEvent[] = [];
        let singleTrillStep = -1;
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'footnote': Ignored
                // case 'level': Ignored
                case 'tied':
                    if (note) {
                        this._parseTied(c, note, spanEvents);
                    }
                    break;
                case 'slur':
                    MusicXmlSpans.readLink(c, MusicXmlSpanElement.Slur, MusicXmlSpanKind.Slur, spanEvents);
                    break;
                // case 'tuplet': Handled via time-modification
                case 'glissando':
                    // glissandos are imported as shift slides, wavy lines are not supported
                    MusicXmlSpans.readLink(c, MusicXmlSpanElement.Glissando, MusicXmlSpanKind.Slide, spanEvents);
                    break;
                case 'slide':
                    MusicXmlSpans.readLink(c, MusicXmlSpanElement.Slide, MusicXmlSpanKind.Slide, spanEvents);
                    break;
                case 'ornaments':
                    if (note) {
                        singleTrillStep = this._parseOrnaments(c, note, spanEvents);
                    }
                    break;
                case 'technical':
                    this._parseTechnical(c, note, beat);
                    break;
                case 'articulations':
                    if (note) {
                        this._parseArticulations(c, note);
                    }
                    break;
                case 'dynamics':
                    const dynamics = this._parseDynamics(c);
                    if (dynamics !== null) {
                        beat.dynamics = dynamics;
                        this._currentDynamics = dynamics;
                    }
                    break;
                case 'fermata':
                    this._parseFermata(c, beat);
                    break;
                case 'arpeggiate':
                    this._parseArpeggiate(c, beat);
                    break;
                // case 'non-arpeggiate': Not supported
                // case 'accidental-mark': Not supported
                // case 'other-notation': Not supported
            }
        }

        if (note === null) {
            return;
        }

        const spans = this._indexToTrackInfo.get(beat.voice.bar.staff.track.index)!.spans;
        const position = MusicXmlSpans.position(
            beat.voice.bar.index,
            beat.displayStart,
            this._beatSequence.has(beat) ? this._beatSequence.get(beat)! : this._beatCount,
            0
        );
        if (spanEvents.length > 0) {
            for (const e of spanEvents) {
                e.staffIndex = beat.voice.bar.staff.index;
                e.voice = voice;
                e.position = position;
                e.note = note;
            }
            spans.process(spanEvents);
        }

        if (singleTrillStep >= 0) {
            spans.add({
                element: MusicXmlSpanElement.WavyLine,
                kind: MusicXmlSpanKind.Trill,
                value: singleTrillStep,
                number: '',
                staffIndex: beat.voice.bar.staff.index,
                voice: voice,
                writtenVoice: voice,
                start: position,
                end: null,
                startNote: note,
                endNote: note,
                endIncludesBeat: false
            });
        }
    }

    private _getStaffContext(staff: Staff) {
        if (!this._staffToContext.has(staff)) {
            const context = new StaffContext();
            this._staffToContext.set(staff, context);
            return context;
        }
        return this._staffToContext.get(staff)!;
    }

    private _parseArpeggiate(element: XmlNode, beat: Beat) {
        const direction = element.getAttribute('direction', 'down');
        switch (direction) {
            case 'down':
                beat.brushType = BrushType.ArpeggioDown;
                break;
            case 'up':
                beat.brushType = BrushType.ArpeggioUp;
                break;
        }
    }

    private _parseFermata(element: XmlNode, beat: Beat) {
        let fermata: FermataType;
        switch (element.innerText) {
            case 'normal':
                fermata = FermataType.Medium;
                break;
            case 'angled':
                fermata = FermataType.Short;
                break;
            case 'square':
                fermata = FermataType.Long;
                break;
            // case 'double-angled': Not Supported
            // case 'double-square': Not Supported
            // case 'double-dot': Not Supported
            // case 'half-curve': Not Supported
            // case 'curlew': Not Supported
            default:
                fermata = FermataType.Medium;
                break;
        }

        beat.fermata = new Fermata();
        beat.fermata.type = fermata;
    }

    private _parseArticulations(element: XmlNode, note: Note) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'accent':
                    note.accentuated = AccentuationType.Normal;
                    break;
                case 'strong-accent':
                    note.accentuated = AccentuationType.Heavy;
                    break;
                case 'staccato':
                    note.isStaccato = true;
                    break;
                case 'tenuto':
                    note.accentuated = AccentuationType.Tenuto;
                    break;
                // case 'detached-legato': Not Supported
                // case 'staccatissimo': Not Supported
                // case 'spiccato': Not Supported
                // case 'scoop': Not Supported
                // case 'plop': Not Supported
                // case 'doit': Not Supported
                // case 'falloff': Not Supported
                // case 'breath-mark': Not Supported
                // case 'caesura': Not Supported
                // case 'stress': Not Supported
                // case 'unstress': Not Supported
                // case 'soft-accent': Not Supported
                // case 'other-articulation': Not Supported
            }
        }
    }
    private _parseTechnical(element: XmlNode, note: Note | null, beat: Beat) {
        const bends: XmlNode[] = [];

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'up-bow':
                    beat.pickStroke = PickStroke.Up;
                    break;
                case 'down-bow':
                    beat.pickStroke = PickStroke.Down;
                    break;
                case 'harmonic':
                    break;
                // case 'open-string': Not supported
                // case 'thumb-position': Not supported
                case 'fingering':
                    if (note) {
                        note.leftHandFinger = this._parseFingering(
                            c,
                            !GeneralMidi.isPiano(beat.voice.bar.staff.track.playbackInfo.program)
                        );
                    }
                    break;
                case 'pluck':
                    if (note) {
                        note.rightHandFinger = this._parseFingering(c, false);
                    }
                    break;
                // case 'double-tongue': Not supported
                // case 'triple-tongue': Not supported
                // case 'stopped':  Not supported
                // case 'snap-pizzicato':  Not supported
                case 'fret':
                    if (note) {
                        if (beat.voice.bar.staff.tuning.length > 0) {
                            note.fret = Number.parseInt(c.innerText, 10);
                        } else {
                            // without tuning the fret has no meaning, the pitch defines the note
                            Logger.warning('MusicXML', 'Ignoring <fret> on staff without tuning');
                        }
                    }
                    break;
                case 'string':
                    if (note) {
                        // on staves without tuning the string is only an annotation (e.g. classical guitar string indications)
                        note.string = Note.getStringCount(beat.voice.bar.staff) - Number.parseInt(c.innerText, 10) + 1;
                    }
                    break;
                case 'hammer-on':
                case 'pull-off':
                    // only the start is the origin, the destination (stop) is resolved by the model
                    if (note && c.getAttribute('type', 'start') === 'start') {
                        note.isHammerPullOrigin = true;
                    }
                    break;
                case 'bend':
                    bends.push(c);
                    break;
                case 'tap':
                    beat.tap = true;
                    break;
                // case 'heel': Not supported
                // case 'toe': Not supported
                // case 'fingernails': Not supported
                // case 'hole': Not supported
                // case 'arrow': Not supported
                // case 'handbell': Not supported
                // case 'brass-bend': Not supported
                // case 'flip': Not supported
                case 'smear':
                    if (note) {
                        note.vibrato = VibratoType.Slight;
                    }
                    break;
                // case 'open': Not supported
                // case 'half-muted': Not supported
                // case 'harmon-mute': Not supported
                case 'golpe':
                    switch (c.getAttribute('placement', 'above')) {
                        case 'above':
                            beat.golpe = GolpeType.Finger;
                            break;
                        case 'below':
                            beat.golpe = GolpeType.Thumb;
                            break;
                    }
                    break;
                // case 'other-technical': Not supported
            }
        }

        if (note && bends.length > 0) {
            this._parseBends(bends, note);
        }
    }

    private _parseBends(elements: XmlNode[], note: Note): void {
        const baseOffset: number = BendPoint.MaxPosition / elements.length;
        let currentValue: number = 0; // stores the current pitch alter when going through the bends (in 1/4 tones)
        let currentOffset: number = 0; // stores the current offset when going through the bends (from 0 to 60)
        let isFirstBend: boolean = true;

        for (const bend of elements) {
            const bendAlterElement: XmlNode | null = bend.findChildElement('bend-alter');
            if (bendAlterElement) {
                const absValue: number = Math.round(Math.abs(Number.parseFloat(bendAlterElement.innerText)) * 2);
                if (bend.findChildElement('pre-bend')) {
                    if (isFirstBend) {
                        currentValue += absValue;
                        note.addBendPoint(new BendPoint(currentOffset, currentValue));
                        currentOffset += baseOffset;
                        note.addBendPoint(new BendPoint(currentOffset, currentValue));
                        isFirstBend = false;
                    } else {
                        currentOffset += baseOffset;
                    }
                } else if (bend.findChildElement('release')) {
                    if (isFirstBend) {
                        currentValue += absValue;
                    }
                    note.addBendPoint(new BendPoint(currentOffset, currentValue));
                    currentOffset += baseOffset;
                    currentValue -= absValue;
                    note.addBendPoint(new BendPoint(currentOffset, currentValue));
                    isFirstBend = false;
                } else {
                    // "regular" bend
                    note.addBendPoint(new BendPoint(currentOffset, currentValue));
                    currentValue += absValue;
                    currentOffset += baseOffset;
                    note.addBendPoint(new BendPoint(currentOffset, currentValue));
                    isFirstBend = false;
                }
            }
        }
    }

    /**
     * Parses the text of a `<fingering>` or `<pluck>` element into a finger.
     * @param c The element to parse.
     * @param fretNumbering Whether digits follow the fretting hand numbering instead of the keyboard numbering.
     * @remarks
     * MusicXML defines the fingering as free text, "typically indicated 1,2,3,4,5", and leaves open which
     * number means which finger (see also https://github.com/w3c-cg/musicxml/issues/438).
     * The digits are therefore read in the convention of the instrument and hand:
     * - Keyboards and the plucking hand (`<pluck>`): 1 = thumb … 5 = little finger.
     * - Fretting hand on fretted and bowed instruments: 0 = open, 1 = index … 4 = little finger. 5 is mapped to the
     *   thumb as it is the only finger not covered by 1-4.
     *
     * The piano check used by the caller must match the one in `FingeringGroupGlyph.fingerToMusicFontSymbol`,
     * so that the fingering is displayed as written in the file.
     * Letters follow the SMuFL fingering vocabulary (T, t, p: thumb; i: index; m: middle; a: ring;
     * c, e, o, q, s, x: little finger) and are matched case-insensitive. Text which cannot be mapped to a finger is
     * ignored.
     */
    private _parseFingering(c: XmlNode, fretNumbering: boolean): Fingers {
        switch (c.innerText.toLowerCase()) {
            case '0':
                return Fingers.NoOrDead;
            case '1':
                return fretNumbering ? Fingers.IndexFinger : Fingers.Thumb;
            case '2':
                return fretNumbering ? Fingers.MiddleFinger : Fingers.IndexFinger;
            case '3':
                return fretNumbering ? Fingers.AnnularFinger : Fingers.MiddleFinger;
            case '4':
                return fretNumbering ? Fingers.LittleFinger : Fingers.AnnularFinger;
            case '5':
                return fretNumbering ? Fingers.Thumb : Fingers.LittleFinger;
            case 'p':
            case 't':
                return Fingers.Thumb;
            case 'i':
                return Fingers.IndexFinger;
            case 'm':
                return Fingers.MiddleFinger;
            case 'a':
                return Fingers.AnnularFinger;
            case 'c':
            case 'e':
            case 'o':
            case 'q':
            case 's':
            case 'x':
                return Fingers.LittleFinger;
        }

        return Fingers.Unknown;
    }

    /**
     * Reads the ornaments of a note.
     * @returns The trill step of a trill on this note only, -1 if there is none.
     */
    private _parseOrnaments(element: XmlNode, note: Note, spanEvents: MusicXmlSpanEvent[]): number {
        // a trill mark defines the meaning of the wavy line, without it the line is a vibrato
        let trillStep = -1;
        for (const c of element.childElements()) {
            if (c.localName === 'trill-mark') {
                trillStep = MusicXmlSpans.trillStep(c.getAttribute('trill-step', 'whole'));
            }
        }

        let hasLine = false;
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'trill-mark': handled above
                case 'turn':
                    note.ornament = NoteOrnament.Turn;
                    break;
                // case 'delayed-turn': Not supported
                case 'inverted-turn':
                    note.ornament = NoteOrnament.InvertedTurn;
                    break;
                // case 'delayed-inverted-turn': Not supported
                // case 'vertical-turn': Not supported
                // case 'inverted-vertical-turn': Not supported
                // case 'shake': Not supported
                case 'wavy-line':
                    const action = MusicXmlSpans.readWavyLine(c, trillStep, spanEvents);
                    if (action === MusicXmlSpanAction.Start || action === MusicXmlSpanAction.Continue) {
                        hasLine = true;
                    }
                    break;
                case 'mordent':
                    note.ornament = NoteOrnament.LowerMordent;
                    break;
                case 'inverted-mordent':
                    note.ornament = NoteOrnament.UpperMordent;
                    break;
                // case 'schleifer': Not supported
                case 'tremolo':
                    const tremolo = new TremoloPickingEffect();
                    note.beat.tremoloPicking = tremolo;
                    tremolo.marks = Number.parseInt(c.innerText, 10);

                    if (
                        (c.getAttribute('type', '') === 'unmeasured' && tremolo.marks === 0) ||
                        c.getAttribute('smufl', '') === 'buzzRoll'
                    ) {
                        tremolo.style = TremoloPickingStyle.BuzzRoll;
                    }

                    break;
                // case 'haydn': Not supported
                // case 'other-element': Not supported
            }
        }

        return hasLine ? -1 : trillStep;
    }

    private _parseTied(element: XmlNode, note: Note, spanEvents: MusicXmlSpanEvent[]): void {
        switch (element.getAttribute('type')) {
            case 'start':
            case 'stop':
                // ties are identified by the pitch, the number is rarely given (see MusicXML spec)
                spanEvents.push(
                    MusicXmlSpans.createEvent(
                        MusicXmlSpanElement.Tied,
                        element.getAttribute('type') === 'start' ? MusicXmlSpanAction.Start : MusicXmlSpanAction.Stop,
                        MusicXmlSpanKind.Tie,
                        MusicXmlSpans.tieKey(note)
                    )
                );
                break;
            // an undamped note (e.g. MuseScore l.v., TuxGuitar let ring)
            case 'let-ring':
                note.isLetRing = true;
                break;
            // case 'continue': no meaning for the playback
        }
    }

    private _parseStem(element: XmlNode): BeamDirection | null {
        switch (element.innerText) {
            case 'down':
                return BeamDirection.Down;
            case 'up':
                return BeamDirection.Up;
            // case 'none':
            default:
                return null;
        }
    }

    /**
     * The spelling of the note is defined by its `<pitch>`, the `<accidental>` only describes the printed sign
     * which is computed during rendering. We only report signs which contradict the pitch.
     * https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/accidental/
     */
    private _parseAccidental(element: XmlNode, note: Note) {
        let accidentalMode = NoteAccidentalMode.Default;
        switch (element.innerText) {
            case 'sharp':
                accidentalMode = NoteAccidentalMode.ForceSharp;
                break;
            case 'natural':
                accidentalMode = NoteAccidentalMode.ForceNatural;
                break;
            case 'flat':
                accidentalMode = NoteAccidentalMode.ForceFlat;
                break;
            case 'double-sharp':
                accidentalMode = NoteAccidentalMode.ForceDoubleSharp;
                break;
            case 'flat-flat':
                accidentalMode = NoteAccidentalMode.ForceDoubleFlat;
                break;
            // case 'sharp-sharp': Not supported
            // case 'natural-sharp': Not supported
            // case 'natural-flat': Not supported
            // case 'quarter-flat': Not supported
            // case 'quarter-sharp': Not supported
            // case 'three-quarters-flat': Not supported
            // case 'three-quarters-sharp': Not supported
            // case 'sharp-down':
            // case 'sharp-up':
            // case 'natural-down':
            // case 'natural-up':
            // case 'flat-down':
            // case 'flat-up':
            // case 'double-sharp-down': Not supported
            // case 'double-sharp-up': Not supported
            // case 'flat-flat-down': Not supported
            // case 'flat-flat-up': Not supported
            // case 'arrow-down':
            // case 'arrow-up':
            // case 'triple-sharp':
            // case 'triple-flat':
            // case 'slash-quarter-sharp': Not supported
            // case 'slash-sharp': Not supported
            // case 'slash-flat': Not supported
            // case 'double-slash-flat': Not supported
            // case 'sharp-1':
            // case 'sharp-2':
            // case 'sharp-3':
            // case 'sharp-4':
            // case 'sharp-5':
            // case 'flat-1':
            // case 'flat-2':
            // case 'flat-3':
            // case 'flat-4':
            // case 'flat-5':
            // case 'sori': Not supported
            // case 'kokon': Not supported
            // case 'other': Not supported
            // default:
            //     Logger.warning('MusicXML', `Unsupported accidental ${element.innerText}`);
            //     break;
        }

        if (
            accidentalMode !== NoteAccidentalMode.Default &&
            note.accidentalMode !== NoteAccidentalMode.Default &&
            accidentalMode !== note.accidentalMode
        ) {
            Logger.warning(
                'MusicXML',
                `Accidental '${element.innerText}' does not match the pitch of the note, the pitch is used`
            );
        }
    }

    private _calculatePitchedNoteValue(note: Note) {
        return note.octave * 12 + note.tone;
    }

    private _parseDuration(element: XmlNode): number {
        return this._musicXmlDivisionsToAlphaTabTicks(Number.parseFloat(element.innerText));
    }

    private _parseUnpitched(element: XmlNode, _track: Track): Note {
        let step: string = '';
        let octave: number = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'display-step':
                    step = c.innerText;
                    break;
                case 'display-octave':
                    // 0-9, 4 for middle C
                    octave = Number.parseInt(c.innerText, 10) + 1;
                    break;
            }
        }

        // if no display information -> middle of staff (handled in getOrCreateArticulation)
        const note = new Note();
        if (step === '') {
            note.octave = 0;
            note.tone = 0;
        } else {
            const value: number = octave * 12 + (ModelUtils.getToneForText(step)?.noteValue ?? 0);
            note.octave = (value / 12) | 0;
            note.tone = value - note.octave * 12;
        }

        return note;
    }

    private _parsePitch(element: XmlNode): Note {
        let step: string = '';
        let semitones: number = 0;
        let octave: number = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'step':
                    step = c.innerText;
                    break;
                case 'alter':
                    semitones = Number.parseFloat(c.innerText);
                    if (Number.isNaN(semitones)) {
                        semitones = 0;
                    }
                    break;
                case 'octave':
                    // 0-9, 4 for middle C
                    octave = Number.parseInt(c.innerText, 10) + 1;
                    break;
            }
        }

        semitones = semitones | 0; // no microtones supported
        const value: number = octave * 12 + (ModelUtils.getToneForText(step)?.noteValue ?? 0) + semitones;
        const note = new Note();

        note.octave = (value / 12) | 0;
        note.tone = value - note.octave * 12;
        note.accidentalMode = MusicXmlImporter._accidentalModeForAlter(semitones);

        return note;
    }

    /**
     * The `<step>` and `<alter>` define the spelling of the note (e.g. F# vs Gb), also if no `<accidental>` is printed.
     * https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/pitch/
     */
    private static _accidentalModeForAlter(alter: number): NoteAccidentalMode {
        if (alter === 0) {
            return NoteAccidentalMode.ForceNatural;
        }
        if (alter === 1) {
            return NoteAccidentalMode.ForceSharp;
        }
        if (alter === 2) {
            return NoteAccidentalMode.ForceDoubleSharp;
        }
        if (alter === -1) {
            return NoteAccidentalMode.ForceFlat;
        }
        if (alter === -2) {
            return NoteAccidentalMode.ForceDoubleFlat;
        }
        return NoteAccidentalMode.Default;
    }

    private _applyNoteHead(
        note: Note,
        beatDuration: Duration,
        forceFill: boolean | undefined,
        doubleWhole: MusicFontSymbol,
        whole: MusicFontSymbol,
        half: MusicFontSymbol,
        filled: MusicFontSymbol
    ) {
        if (forceFill === undefined) {
            switch (beatDuration) {
                case Duration.QuadrupleWhole:
                case Duration.DoubleWhole:
                    note.style!.noteHead = doubleWhole;
                    break;
                case Duration.Whole:
                    note.style!.noteHead = whole;
                    break;
                case Duration.Half:
                    note.style!.noteHead = half;
                    break;
                default:
                    note.style!.noteHead = filled;
                    break;
            }
        } else if (forceFill! === true) {
            note.style!.noteHead = filled;
        } else {
            switch (beatDuration) {
                case Duration.QuadrupleWhole:
                case Duration.DoubleWhole:
                    note.style!.noteHead = doubleWhole;
                    break;
                case Duration.Whole:
                    note.style!.noteHead = whole;
                    break;
                case Duration.Half:
                    note.style!.noteHead = half;
                    break;
                default:
                    note.style!.noteHead = half;
                    break;
            }
        }
    }
}
