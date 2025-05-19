import { ScoreImporter } from '@src/importer/ScoreImporter';
import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { IOHelper } from '@src/io/IOHelper';
import { Logger } from '@src/Logger';
import { MidiUtils } from '@src/midi/MidiUtils';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType } from '@src/model/Automation';
import { Bar, BarLineStyle, SustainPedalMarkerType, SustainPedalMarker } from '@src/model/Bar';
import { Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { CrescendoType } from '@src/model/CrescendoType';
import { Direction } from '@src/model/Direction';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { FermataType, Fermata } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GolpeType } from '@src/model/GolpeType';
import { GraceType } from '@src/model/GraceType';
import { InstrumentArticulation } from '@src/model/InstrumentArticulation';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { MasterBar } from '@src/model/MasterBar';
import { ModelUtils } from '@src/model/ModelUtils';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { Note, NoteStyle } from '@src/model/Note';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Ottavia } from '@src/model/Ottavia';
import { PickStroke } from '@src/model/PickStroke';
import { Score } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SimileMark } from '@src/model/SimileMark';
import { SlideOutType } from '@src/model/SlideOutType';
import { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import { AccidentalHelper } from '@src/rendering/utils/AccidentalHelper';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { XmlDocument } from '@src/xml/XmlDocument';
import type { XmlNode } from '@src/xml/XmlNode';
import type { ZipEntry } from '@src/zip/ZipEntry';
import { ZipReader } from '@src/zip/ZipReader';

class StaffContext {
    public slurStarts!: Map<string, Note>;
    public currentDynamics = DynamicValue.F;
    public tieStarts!: Set<Note>;
    public tieStartIds!: Map<string, Note>;
    public slideOrigins: Map<string, Note> = new Map<string, Note>();
    public transpose: number = 0;
    public isExplicitlyBeamed = false;

    constructor() {
        this.tieStarts = new Set<Note>();
        this.tieStartIds = new Map<string, Note>();
        this.slideOrigins = new Map<string, Note>();
        this.slurStarts = new Map<string, Note>();
    }
}

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
     * The volume to use when playing the note (-1 if using the default track volume).
     */
    public outputVolume: number = -1;

    /**
     * The balance to use when playing the note (-1 if using the default track balance).
     */
    public outputBalance: number = -1;
}

class TrackInfo {
    public track: Track;
    public firstArticulation?: InstrumentArticulationWithPlaybackInfo;
    public instruments: Map<string, InstrumentArticulationWithPlaybackInfo> = new Map<
        string,
        InstrumentArticulationWithPlaybackInfo
    >();

    private _instrumentIdToArticulationIndex: Map<string, number> = new Map<string, number>();

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

    private static defaultNoteArticulation: InstrumentArticulation = new InstrumentArticulation(
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
            articulation = TrackInfo.defaultNoteArticulation;
        }
        const index = this.track.percussionArticulations.length;

        const bar = note.beat.voice.bar;

        // the calculation in the AccidentalHelper assumes a standard 5-line staff.
        let musicXmlStaffSteps: number;
        if (noteValue === 0) {
            // no display pitch defined?
            musicXmlStaffSteps = 4; // middle of bar
        } else {
            musicXmlStaffSteps = AccidentalHelper.calculateNoteSteps(bar.keySignature, bar.clef, noteValue);
        }

        // to translate this into the "staffLine" semantics we need to subtract additionally the steps "missing" from the absent lines
        const actualSteps = note.beat.voice.bar.staff.standardNotationLineCount * 2 - 1;
        const fiveLineSteps = 5 * 2 - 1;
        const stepDifference = fiveLineSteps - actualSteps;

        const staffLine = musicXmlStaffSteps - stepDifference;

        const newArticulation = new InstrumentArticulation(
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
}

export class MusicXmlImporter extends ScoreImporter {
    private _score!: Score;
    private _idToTrackInfo: Map<string, TrackInfo> = new Map<string, TrackInfo>();
    private _indexToTrackInfo: Map<number, TrackInfo> = new Map<number, TrackInfo>();
    private _staffToContext: Map<Staff, StaffContext> = new Map<Staff, StaffContext>();

    private _divisionsPerQuarterNote: number = 1;
    private _currentDynamics = DynamicValue.F;

    public get name(): string {
        return 'MusicXML';
    }

    public readScore(): Score {
        const xml: string = this.extractMusicXml();
        const dom: XmlDocument = new XmlDocument();
        try {
            dom.parse(xml);
        } catch (e) {
            throw new UnsupportedFormatError('Unsupported format', e as Error);
        }
        this._score = new Score();
        this._score.tempo = 120;
        this._score.stylesheet.hideDynamics = true;

        this.parseDom(dom);
        ModelUtils.consolidate(this._score);
        this._score.finish(this.settings);
        this._score.rebuildRepeatGroups();

        return this._score;
    }


    private extractMusicXml(): string {
        const zip = new ZipReader(this.data);
        let entries: ZipEntry[];
        try {
            entries = zip.read();
        } catch (e) {
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

    private parseDom(dom: XmlDocument): void {
        const root: XmlNode | null = dom.firstElement;
        if (!root) {
            throw new UnsupportedFormatError('Unsupported format');
        }
        switch (root.localName) {
            case 'score-partwise':
                this.parsePartwise(root);
                break;
            case 'score-timewise':
                this.parseTimewise(root);
                break;
            default:
                throw new UnsupportedFormatError('Unsupported format');
        }
    }

    private parsePartwise(element: XmlNode): void {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'credit':
                    this.parseCredit(c);
                    break;
                // case 'defaults': Ignored (see below)
                case 'identification':
                    this.parseIdentification(c);
                    break;
                // case 'movement-number': Ignored
                case 'movement-title':
                    this.parseMovementTitle(c);
                    break;
                case 'part':
                    this.parsePartwisePart(c);
                    break;
                case 'part-list':
                    this.parsePartList(c);
                    break;
                case 'work':
                    this.parseWork(c);
                    break;
            }
        }
    }

    private parseTimewise(element: XmlNode): void {
        let index = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'credit':
                    this.parseCredit(c);
                    break;
                // case 'defaults': Ignored (see below)
                case 'identification':
                    this.parseIdentification(c);
                    break;
                // case 'movement-number': Ignored
                case 'movement-title':
                    this.parseMovementTitle(c);
                    break;
                case 'part-list':
                    this.parsePartList(c);
                    break;
                case 'work':
                    this.parseWork(c);
                    break;
                case 'measure':
                    this.parseTimewiseMeasure(c, index);
                    index++;
                    break;
            }
        }
    }

    private parseCredit(element: XmlNode) {
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
                        this._score.title = MusicXmlImporter.sanitizeDisplay(fullText);
                        break;
                    case 'subtitle':
                        this._score.subTitle = MusicXmlImporter.sanitizeDisplay(fullText);
                        break;
                    case 'composer':
                        this._score.artist = MusicXmlImporter.sanitizeDisplay(fullText);
                        break;
                    case 'arranger':
                        this._score.artist = MusicXmlImporter.sanitizeDisplay(fullText);
                        break;
                    case 'lyricist':
                        this._score.words = MusicXmlImporter.sanitizeDisplay(fullText);
                        break;
                    case 'rights':
                        this._score.copyright = MusicXmlImporter.sanitizeDisplay(fullText);
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
                    this._score.copyright = MusicXmlImporter.sanitizeDisplay(fullText);
                    return;
                }

                // title and subtitle are typically centered,
                // use the typical alphaTab placement as reference for valid props
                if (halign === 'center' || justify === 'center') {
                    if (this._score.title.length === 0) {
                        this._score.title = MusicXmlImporter.sanitizeDisplay(fullText);
                        return;
                    }

                    if (this._score.subTitle.length === 0) {
                        this._score.subTitle = MusicXmlImporter.sanitizeDisplay(fullText);
                        return;
                    }

                    if (this._score.album.length === 0) {
                        this._score.album = MusicXmlImporter.sanitizeDisplay(fullText);
                        return;
                    }
                } else if (halign === 'right' || justify === 'right') {
                    // in alphaTab only `music` is right
                    if (this._score.music.length === 0) {
                        this._score.music = MusicXmlImporter.sanitizeDisplay(fullText);
                        return;
                    }
                }

                // from here we simply fallback to filling any remaining information (first one wins approach)
                if (this._score.artist.length === 0) {
                    this._score.artist = MusicXmlImporter.sanitizeDisplay(fullText);
                    return;
                }

                if (this._score.words.length === 0) {
                    this._score.words = MusicXmlImporter.sanitizeDisplay(fullText);
                    return;
                }
            }
        }
    }

    private static sanitizeDisplay(text: string): string {
        // no newlines or tabs, and non-breaking spaces
        return text.replaceAll('\r', '').replaceAll('\n', ' ').replaceAll('\t', '\xA0\xA0').replaceAll(' ', '\xA0');
    }

    // visual aspects of credits are ignored
    // private parseCredit(element: XmlNode) { }

    // visual aspects of music notation are ignored.
    // with https://github.com/CoderLine/alphaTab/issues/1949 we could use some more information
    // but we also need the "real" page layout (or parchment) for some alignment aspects.
    // also for some styling stuff we need the settings as part of the renderstylesheet.
    // private parseDefaults(element: XmlNode) {
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

    private parseIdentification(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'creator':
                    if (c.attributes.has('type')) {
                        switch (c.attributes.get('type')!) {
                            case 'composer':
                                this._score.artist = MusicXmlImporter.sanitizeDisplay(c.innerText);
                                break;
                            case 'lyricist':
                                this._score.words = MusicXmlImporter.sanitizeDisplay(c.innerText);
                                break;
                            case 'arranger':
                                this._score.music = MusicXmlImporter.sanitizeDisplay(c.innerText);
                                break;
                        }
                    } else {
                        this._score.artist = MusicXmlImporter.sanitizeDisplay(c.innerText);
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
                    this.parseEncoding(c);
                    break;
                // case 'source': Ignored
                // case 'relation': Ignored
                // case 'miscellaneous': Ignored
            }
        }
    }
    private parseEncoding(element: XmlNode) {
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
                // case 'software': Ignored
                case 'encoding-description':
                    this._score.notices += MusicXmlImporter.sanitizeDisplay(c.innerText);
                    break;
                // case 'supports': Ignored
            }
        }
    }

    private parseMovementTitle(element: XmlNode) {
        if (this._score.title.length === 0) {
            // we have no "work title", then use the "movement title" as main title
            this._score.title = MusicXmlImporter.sanitizeDisplay(element.innerText);
        } else {
            // we have a "work title", then use the "movement title" as subtitle
            this._score.subTitle = MusicXmlImporter.sanitizeDisplay(element.innerText);
        }
    }

    private parsePartList(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'part-group': Ignore
                // We currently ignore information from part-group
                // The Track > Staff structure is handled by the <staff /> element on measure level
                // we only support automatic placement of brackets/braces, not explicit.
                case 'score-part':
                    this.parseScorePart(c);
                    break;
            }
        }
    }

    private parseScorePart(element: XmlNode) {
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
                    track.name = MusicXmlImporter.sanitizeDisplay(c.innerText);
                    break;
                case 'part-name-display':
                    track.name = this.parsePartDisplayAsText(c);
                    break;
                case 'part-abbreviation':
                    track.shortName = MusicXmlImporter.sanitizeDisplay(c.innerText);
                    break;
                case 'part-abbreviation-display':
                    track.shortName = this.parsePartDisplayAsText(c);
                    break;
                // case 'group': Ignored
                case 'score-instrument':
                    this.parseScoreInstrument(c, trackInfo);
                    break;
                // case 'player': Ignored
                case 'midi-device':
                    if (c.attributes.has('port')) {
                        track.playbackInfo.port = Number.parseInt(c.attributes.get('port')!, 10);
                    }
                    break;
                case 'midi-instrument':
                    this.parseScorePartMidiInstrument(c, trackInfo);
                    break;
            }
        }

        if (trackInfo.firstArticulation) {
            if (trackInfo.firstArticulation.outputMidiProgram >= 0) {
                track.playbackInfo.program = trackInfo.firstArticulation.outputMidiProgram;
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

    private parseScoreInstrument(element: XmlNode, trackInfo: TrackInfo) {
        const articulation = new InstrumentArticulationWithPlaybackInfo();
        if (!trackInfo.firstArticulation) {
            trackInfo.firstArticulation = articulation;
        }
        trackInfo.instruments.set(element.getAttribute('id', ''), articulation);
    }

    private parseScorePartMidiInstrument(element: XmlNode, trackInfo: TrackInfo) {
        const id = element.getAttribute('id', '');
        if (!trackInfo.instruments.has(id)) {
            return;
        }
        const articulation = trackInfo.instruments.get(id)!;

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'midi-channel':
                    articulation.outputMidiChannel = Number.parseInt(c.innerText) - 1;
                    break;
                // case 'midi-name': Ignored
                // case 'midi-bank': Not supported (https://github.com/CoderLine/alphaTab/issues/1986)
                case 'midi-program':
                    articulation.outputMidiProgram = Number.parseInt(c.innerText) - 1;
                    break;
                case 'midi-unpitched':
                    articulation.outputMidiNumber = Number.parseInt(c.innerText) - 1;
                    break;
                case 'volume':
                    articulation.outputVolume = MusicXmlImporter.interpolatePercent(Number.parseFloat(c.innerText));
                    break;
                case 'pan':
                    articulation.outputBalance = MusicXmlImporter.interpolatePan(Number.parseFloat(c.innerText));
                    break;
                // case 'elevation': Ignored
            }
        }
    }

    private static interpolatePercent(value: number) {
        return MusicXmlImporter.interpolate(0, 100, 0, 16, value) | 0;
    }

    private static interpolatePan(value: number) {
        return MusicXmlImporter.interpolate(-90, 90, 0, 16, value) | 0;
    }

    private static interpolate(
        inputStart: number,
        inputEnd: number,
        outputStart: number,
        outputEnd: number,
        value: number
    ): number {
        const t = (value - inputStart) / (inputEnd - inputStart);
        return outputStart + (outputEnd - outputStart) * t;
    }

    private parsePartDisplayAsText(element: XmlNode): string {
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
        return MusicXmlImporter.sanitizeDisplay(text);
    }

    private parseWork(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'work-number': Ignored
                // case 'opus': Ignored
                case 'work-title':
                    this._score.title = MusicXmlImporter.sanitizeDisplay(c.innerText);
                    break;
            }
        }
    }

    private parsePartwisePart(element: XmlNode) {
        const id = element.attributes.get('id');
        if (!id || !this._idToTrackInfo.has(id)) {
            return;
        }
        const track = this._idToTrackInfo.get(id)!.track;
        let index = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'measure':
                    this.parsePartwiseMeasure(c, track, index);
                    index++;
                    break;
            }
        }
    }

    private parsePartwiseMeasure(element: XmlNode, track: Track, index: number) {
        const masterBar = this.getOrCreateMasterBar(element, index);
        this.parsePartMeasure(element, masterBar, track);
    }

    private parseTimewiseMeasure(element: XmlNode, index: number) {
        const masterBar = this.getOrCreateMasterBar(element, index);

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'part':
                    this.parseTimewisePart(c, masterBar);
                    break;
            }
        }
    }

    private getOrCreateMasterBar(element: XmlNode, index: number) {
        const implicit = element.attributes.get('implicit') === 'yes';
        while (this._score.masterBars.length <= index) {
            const newMasterBar = new MasterBar();
            if (implicit) {
                newMasterBar.isAnacrusis = true;
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

    private parseTimewisePart(element: XmlNode, masterBar: MasterBar) {
        const id = element.attributes.get('id');
        if (!id || !this._idToTrackInfo.has(id)) {
            return;
        }

        const track = this._idToTrackInfo.get(id)!.track;
        this.parsePartMeasure(element, masterBar, track);
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

    private parsePartMeasure(element: XmlNode, masterBar: MasterBar, track: Track) {
        this._musicalPosition = 0;
        this._lastBeat = null;

        masterBar.alternateEndings = this._nextMasterBarRepeatEnding;

        const barLines: XmlNode[] = [];

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'note':
                    this.parseNote(c, masterBar, track);
                    break;
                case 'backup':
                    this.parseBackup(c);
                    break;
                case 'forward':
                    this.parseForward(c);
                    break;
                case 'direction':
                    this.parseDirection(c, masterBar, track);
                    break;
                case 'attributes':
                    this.parseAttributes(c, masterBar, track);
                    break;
                case 'harmony':
                    this.parseHarmony(c, track);
                    break;
                // case 'figured-bass': Not supported
                case 'print':
                    this.parsePrint(c, masterBar, track);
                    break;
                case 'sound':
                    this.parseSound(c, masterBar, track);
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

        // parse barline at end of bar (to apply style to all bars of all staves)
        for (const barLine of barLines) {
            this.parseBarLine(barLine, masterBar, track);
        }

        this.applySimileMarks(masterBar, track);

        // initial empty staff and voice (if no other elements created something already)
        const staff = this.getOrCreateStaff(track, 0);
        this.getOrCreateBar(staff, masterBar);

        // clear measure attribute
        this._keyAllStaves = null;
    }

    private parsePrint(element: XmlNode, masterBar: MasterBar, track: Track) {
        if (element.getAttribute('new-system', 'no') === 'yes') {
            track.addLineBreaks(masterBar.index);
        } else if (element.getAttribute('new-page', 'no') === 'yes') {
            track.addLineBreaks(masterBar.index);
        }
    }

    private applySimileMarks(masterBar: MasterBar, track: Track) {
        if (this._simileMarkAllStaves !== null) {
            for (const s of track.staves) {
                const bar = this.getOrCreateBar(s, masterBar);
                bar.simileMark = this._simileMarkAllStaves!;
                if (bar.simileMark !== SimileMark.None) {
                    this.clearBar(bar);
                }
            }

            if (this._simileMarkAllStaves === SimileMark.FirstOfDouble) {
                this._simileMarkAllStaves = SimileMark.SecondOfDouble;
            } else {
                this._simileMarkAllStaves = null;
            }
        }

        if (this._simileMarkPerStaff !== null) {
            const keys = Array.from(this._simileMarkPerStaff!.keys());
            for (const i of keys) {
                const s = this.getOrCreateStaff(track, i);
                const bar = this.getOrCreateBar(s, masterBar);
                bar.simileMark = this._simileMarkPerStaff!.get(i)!;

                if (bar.simileMark !== SimileMark.None) {
                    this.clearBar(bar);
                }

                if (bar.simileMark === SimileMark.FirstOfDouble) {
                    this._simileMarkPerStaff!.set(i, SimileMark.SecondOfDouble);
                } else {
                    this._simileMarkPerStaff!.delete(i);
                }
            }
            if (this._simileMarkPerStaff.size === 0) {
                this._simileMarkPerStaff = null;
            }
        }
    }

    private clearBar(bar: Bar) {
        for (const v of bar.voices) {
            const emptyBeat: Beat = new Beat();
            emptyBeat.isEmpty = true;
            v.addBeat(emptyBeat);
        }
    }

    private parseBarLine(element: XmlNode, masterBar: MasterBar, track: Track) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'bar-style':
                    this.parseBarStyle(c, masterBar, track, element.getAttribute('location', 'right'));
                    break;
                // case 'footnote' Ignored
                // case 'level' Ignored
                // case 'wavy-line' Ignored
                // case 'segno': Ignored (use directions)
                // case 'coda': Ignored (use directions)
                // case 'fermata': Ignored (on barline, they exist on beat notations)
                case 'ending':
                    this.parseEnding(c, masterBar);
                    break;
                case 'repeat':
                    this.parseRepeat(c, masterBar);
                    break;
            }
        }
    }

    private parseRepeat(element: XmlNode, masterBar: MasterBar): void {
        const direction: string = element.getAttribute('direction');
        let times: number = Number.parseInt(element.getAttribute('times'));
        if (times < 0 || Number.isNaN(times)) {
            times = 2;
        }
        if (direction === 'backward') {
            masterBar.repeatCount = times;
        } else if (direction === 'forward') {
            masterBar.isRepeatStart = true;
        }
    }

    private _nextMasterBarRepeatEnding: number = 0;
    private parseEnding(element: XmlNode, masterBar: MasterBar): void {
        const numbers = element
            .getAttribute('number')
            .split(',')
            .map(v => Number.parseInt(v));

        let flags = 0;
        for (const num of numbers) {
            flags = flags | ((0x01 << (num - 1)) & 0xff);
        }

        masterBar.alternateEndings = flags;

        switch (element.getAttribute('type', '')) {
            case 'start':
                this._nextMasterBarRepeatEnding = this._nextMasterBarRepeatEnding | flags;
                break;
            case 'stop':
            case 'discontinue':
                this._nextMasterBarRepeatEnding = this._nextMasterBarRepeatEnding & ~flags;
                break;
            case 'continue':
                // keep
                break;
        }
    }

    private parseBarStyle(element: XmlNode, masterBar: MasterBar, track: Track, location: string) {
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
            const bar = this.getOrCreateBar(s, masterBar);
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

    private parseSound(element: XmlNode, masterBar: MasterBar, track: Track) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'instrument-change': Ignored
                // case 'midi-device': Ignored
                case 'midi-instrument':
                    this.parseSoundMidiInstrument(c, masterBar);
                    break;
                // case 'play': Ignored
                case 'swing':
                    this.parseSwing(c, masterBar);
                    break;
                case 'offset':
                    break;
            }
        }

        if (element.attributes.has('coda')) {
            masterBar.addDirection(Direction.TargetCoda);
        }

        if (element.attributes.has('tocoda')) {
            masterBar.addDirection(Direction.JumpDaCoda);
        }

        if (element.attributes.has('dacapo')) {
            masterBar.addDirection(Direction.JumpDaCapo);
        }

        if (element.attributes.has('dalsegno')) {
            masterBar.addDirection(Direction.JumpDalSegno);
        }

        if (element.attributes.has('fine')) {
            masterBar.addDirection(Direction.TargetFine);
        }

        if (element.attributes.has('segno')) {
            masterBar.addDirection(Direction.TargetSegno);
        }

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
            automation.value = MusicXmlImporter.interpolatePan(Number.parseFloat(element.attributes.get('pan')!));
            this._nextBeatAutomations.push(automation);
        }

        if (element.attributes.has('tempo')) {
            if (!this._nextBeatAutomations) {
                this._nextBeatAutomations = [];
            }

            const automation = new Automation();
            automation.type = AutomationType.Tempo;
            automation.value = MusicXmlImporter.interpolatePercent(Number.parseFloat(element.attributes.get('tempo')!));
            this._nextBeatAutomations.push(automation);
        }
    }
    private parseSwing(element: XmlNode, masterBar: MasterBar) {
        let first = 0;
        let second = 0;
        let swingType: Duration | null = null;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'straight':
                    masterBar.tripletFeel = TripletFeel.NoTripletFeel;
                    return;
                case 'first':
                    first = Number.parseInt(c.innerText);
                    break;
                case 'second':
                    second = Number.parseInt(c.innerText);
                    break;
                case 'swing-type':
                    swingType = this.parseBeatDuration(c);
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
    private _nextBeatCrescendo: CrescendoType | null = null;
    private _nextBeatLetRing: boolean = false;
    private _nextBeatPalmMute: boolean = false;
    private _nextBeatOttavia: Ottavia | null = null;
    private _nextBeatText: string | null = null;

    private parseSoundMidiInstrument(element: XmlNode, masterBar: MasterBar) {
        let automation: Automation;
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'midi-channel': Ignored
                // case 'midi-name': Ignored
                // case 'midi-bank': Ignored
                case 'midi-program':
                    if (!this._nextBeatAutomations) {
                        this._nextBeatAutomations = [];
                    }

                    automation = new Automation();
                    automation.type = AutomationType.Instrument;
                    automation.value = Number.parseInt(c.innerText) - 1;
                    this._nextBeatAutomations!.push(automation);

                    break;
                // case 'midi-unpitched': Ignored
                case 'volume':
                    if (!this._nextBeatAutomations) {
                        this._nextBeatAutomations = [];
                    }

                    automation = new Automation();
                    automation.type = AutomationType.Volume;
                    automation.value = MusicXmlImporter.interpolatePercent(Number.parseFloat(c.innerText));
                    this._nextBeatAutomations!.push(automation);

                    break;
                case 'pan':
                    if (!this._nextBeatAutomations) {
                        this._nextBeatAutomations = [];
                    }

                    automation = new Automation();
                    automation.type = AutomationType.Balance;
                    automation.value = MusicXmlImporter.interpolatePan(Number.parseFloat(c.innerText));
                    this._nextBeatAutomations!.push(automation);
                    break;
                // case 'elevation': Ignored
            }
        }
    }

    private parseHarmony(element: XmlNode, track: Track) {
        const chord = new Chord();
        let degreeParenthesis = false;
        let degree = '';
        for (const childNode of element.childElements()) {
            switch (childNode.localName) {
                case 'root':
                    chord.name = this.parseHarmonyRoot(childNode);
                    break;
                case 'kind':
                    chord.name = chord.name + this.parseHarmonyKind(childNode);
                    if (childNode.getAttribute('parentheses-degrees', 'no') === 'yes') {
                        degreeParenthesis = true;
                    }
                    break;
                case 'frame':
                    this.parseHarmonyFrame(childNode, chord);
                    break;
                case 'degree':
                    degree += this.parseDegree(childNode);
                    break;
            }
        }

        if (degree) {
            chord.name += degreeParenthesis ? `(${degree})` : degree;
        }

        if (this._nextBeatChord === null) {
            this._nextBeatChord = chord;
        }
    }

    private parseDegree(element: XmlNode) {
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

    private parseHarmonyRoot(element: XmlNode): string {
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

    private parseHarmonyKind(xmlNode: XmlNode): string {
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

    private parseHarmonyFrame(xmlNode: XmlNode, chord: Chord) {
        for (const frameChild of xmlNode.childElements()) {
            switch (frameChild.localName) {
                case 'frame-strings':
                    const stringsCount: number = Number.parseInt(frameChild.innerText);
                    chord.strings = new Array<number>(stringsCount);
                    for (let i = 0; i < stringsCount; i++) {
                        // set strings unplayed as default
                        chord.strings[i] = -1;
                    }
                    break;
                case 'first-fret':
                    chord.firstFret = Number.parseInt(frameChild.innerText);
                    break;
                case 'frame-note':
                    let stringNo: number | null = null;
                    let fretNo: number | null = null;
                    for (const noteChild of frameChild.childElements()) {
                        switch (noteChild.localName) {
                            case 'string':
                                stringNo = Number.parseInt(noteChild.innerText);
                                break;
                            case 'fret':
                                fretNo = Number.parseInt(noteChild.innerText);
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

    private parseAttributes(element: XmlNode, masterBar: MasterBar, track: Track) {
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
                        this.parseKey(c, masterBar, track);
                        break;
                    case 'time':
                        this.parseTime(c, masterBar);
                        break;
                    case 'staves':
                        // will create staves
                        track.ensureStaveCount(Number.parseInt(c.innerText));
                        break;
                    // case 'part-symbol': Ignored (https://github.com/CoderLine/alphaTab/issues/1989)
                    // case 'instruments': Ignored, auto-detected via `note/instrument` and handled via instrument articulations
                    case 'clef':
                        staffIndex = Number.parseInt(c.getAttribute('number', '1')) - 1;
                        staff = this.getOrCreateStaff(track, staffIndex);
                        bar = this.getOrCreateBar(staff, masterBar);
                        this.parseClef(c, bar);
                        break;
                    case 'staff-details':
                        staffIndex = Number.parseInt(c.getAttribute('number', '1')) - 1;
                        staff = this.getOrCreateStaff(track, staffIndex);
                        this.parseStaffDetails(c, staff);
                        break;
                    case 'transpose':
                        this.parseTranspose(c, track);
                        break;
                    // case 'for-part': not supported
                    // case 'directive': Ignored
                    case 'measure-style':
                        this.parseMeasureStyle(c, track, false);
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
                        this.parseMeasureStyle(c, track, true);
                        break;
                }
            }
        }
    }

    private _simileMarkAllStaves: SimileMark | null = null;
    private _simileMarkPerStaff: Map<number, SimileMark> | null = null;
    private _isBeatSlash: boolean = false;
    private parseMeasureStyle(element: XmlNode, track: Track, midBar: boolean) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'multiple-rest': Ignored, when multibar rests are enabled for rendering this info shouldn't matter.
                case 'measure-repeat':
                    if (!midBar) {
                        let simileMark: SimileMark | null = null;
                        switch (c.getAttribute('type')) {
                            case 'start':
                                switch (Number.parseInt(c.getAttribute('slashes', '1'))) {
                                    case 1:
                                        simileMark = SimileMark.Simple;
                                        break;
                                    case 2:
                                        simileMark = SimileMark.FirstOfDouble;
                                        break;
                                    default:
                                        // not supported
                                        break;
                                }
                                break;
                            case 'stop':
                                simileMark = null;
                                break;
                        }

                        if (element.attributes.has('number')) {
                            this._simileMarkPerStaff = this._simileMarkPerStaff ?? new Map<number, SimileMark>();
                            const staff = Number.parseInt(element.attributes.get('number')!) - 1;
                            if (simileMark == null) {
                                this._simileMarkPerStaff!.delete(staff);
                            } else {
                                this._simileMarkPerStaff!.set(staff, simileMark!);
                            }
                        } else {
                            this._simileMarkAllStaves = simileMark;
                        }
                    }

                    break;
                // case 'beat-repeat': Not supported
                case 'slash':
                    // use-stems: not supported
                    switch (c.getAttribute('type')) {
                        case 'start':
                            this._isBeatSlash = true;
                            break;
                        case 'stop':
                            this._isBeatSlash = false;
                            break;
                    }
                    break;
            }
        }
    }

    private parseTranspose(element: XmlNode, track: Track): void {
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
            const staff = this.getOrCreateStaff(track, Number.parseInt(element.attributes.get('number')!) - 1);
            this.getStaffContext(staff).transpose = semitones;
            staff.displayTranspositionPitch = semitones;
        } else {
            for (const staff of track.staves) {
                this.getStaffContext(staff).transpose = semitones;
                staff.displayTranspositionPitch = semitones;
            }
        }
    }

    private parseStaffDetails(element: XmlNode, staff: Staff): void {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'staff-type': Ignored
                case 'staff-lines':
                    staff.standardNotationLineCount = Number.parseInt(c.innerText);
                    break;
                // case 'line-detail': Not supported
                case 'staff-tuning':
                    this.parseStaffTuning(c, staff);
                    break;
                case 'capo':
                    staff.capo = Number.parseInt(c.innerText);
                    break;
                // case 'staff-size': Not supported
            }
        }
    }

    private parseStaffTuning(element: XmlNode, staff: Staff): void {
        if (staff.stringTuning.tunings.length === 0) {
            staff.showTablature = true;
            staff.showStandardNotation = false;
            staff.stringTuning.tunings = new Array<number>(staff.standardNotationLineCount).fill(0);
        }

        const line: number = Number.parseInt(element.getAttribute('line'));
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

    private parseClef(element: XmlNode, bar: Bar): void {
        let sign: string = 's';
        let line: number = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'sign':
                    sign = c.innerText.toLowerCase();
                    break;
                case 'line':
                    line = Number.parseInt(c.innerText);
                    break;
                case 'clef-octave-change':
                    switch (Number.parseInt(c.innerText)) {
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
                bar.staff.isPercussion = true;
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

    private parseTime(element: XmlNode, masterBar: MasterBar): void {
        let beatsParsed: boolean = false;
        let beatTypeParsed: boolean = false;
        for (const c of element.childElements()) {
            const v: string = c.innerText;
            switch (c.localName) {
                case 'beats':
                    if (!beatsParsed) {
                        if (v.indexOf('+') === -1) {
                            masterBar.timeSignatureNumerator = Number.parseInt(v);
                        } else {
                            masterBar.timeSignatureNumerator = v
                                .split('+')
                                .map(v => Number.parseInt(v))
                                .reduce((sum, v) => v + sum, 0);
                        }
                        beatsParsed = true;
                    }
                    break;
                case 'beat-type':
                    if (!beatTypeParsed) {
                        if (v.indexOf('+') === -1) {
                            masterBar.timeSignatureDenominator = Number.parseInt(v);
                        } else {
                            masterBar.timeSignatureDenominator = v
                                .split('+')
                                .map(v => Number.parseInt(v))
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

    private parseKey(element: XmlNode, masterBar: MasterBar, track: Track): void {
        let fifths: number = -(KeySignature.C as number);
        let mode: string = '';

        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'cancel': not supported
                case 'fifths':
                    fifths = Number.parseInt(c.innerText);
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
            const staff = this.getOrCreateStaff(track, Number.parseInt(element.attributes.get('number')!) - 1);
            const bar = this.getOrCreateBar(staff, masterBar);
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

    private parseDirection(element: XmlNode, masterBar: MasterBar, track: Track) {
        const directionTypes: XmlNode[] = [];
        let offset: number | null = null;
        // let voiceIndex = -1;
        let staffIndex = -1;
        let tempo = -1;

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'direction-type':
                    // See https://github.com/CoderLine/alphaTab/issues/2102
                    const type = c.firstElement;
                    if(type) {
                        directionTypes.push(type);
                    }
                    break;
                case 'offset':
                    offset = Number.parseFloat(c.innerText);
                    break;
                // case 'footnote': Ignored
                // case 'level': Ignored
                case 'voice':
                    // voiceIndex = parseInt(c.innerText) - 1;
                    break;
                case 'staff':
                    staffIndex = Number.parseInt(c.innerText) - 1;
                    break;
                case 'sound':
                    if (c.attributes.has('tempo')) {
                        tempo = Number.parseFloat(c.attributes.get('tempo')!);
                    }
                    break;
                // case 'listening': Ignored
            }
        }

        let staff: Staff | null = null;
        if (staffIndex >= 0) {
            staff = this.getOrCreateStaff(track, staffIndex);
        } else if (this._lastBeat !== null) {
            staff = this._lastBeat.voice.bar.staff;
        } else {
            staff = this.getOrCreateStaff(track, 0);
        }

        const bar = staff ? this.getOrCreateBar(staff, masterBar) : null;

        const getRatioPosition = () => {
            let timelyPosition = this._musicalPosition;
            if (offset !== null) {
                timelyPosition += offset!;
            }

            const totalDuration = masterBar.calculateDuration(false);
            return timelyPosition / totalDuration;
        };

        if (tempo > 0) {
            const tempoAutomation = new Automation();
            tempoAutomation.type = AutomationType.Tempo;
            tempoAutomation.value = tempo;
            tempoAutomation.ratioPosition = getRatioPosition();

            if (!this.hasSameTempo(masterBar, tempoAutomation)) {
                masterBar.tempoAutomations.push(tempoAutomation);
                if (masterBar.index === 0) {
                    masterBar.score.tempo = tempoAutomation.value;
                }
            }
        }

        let previousWords: string = '';

        for (const direction of directionTypes) {
            switch (direction.localName) {
                case 'rehearsal':
                    masterBar.section = new Section();
                    masterBar.section.marker = direction.innerText;
                    break;
                case 'segno':
                    masterBar.addDirection(Direction.TargetSegno);
                    break;
                case 'coda':
                    masterBar.addDirection(Direction.TargetCoda);
                    break;
                case 'words':
                    previousWords = direction.innerText;
                    break;
                // case 'symbol': Not supported
                case 'wedge':
                    switch (direction.getAttribute('type')) {
                        case 'crescendo':
                            this._nextBeatCrescendo = CrescendoType.Crescendo;
                            break;
                        case 'diminuendo':
                            this._nextBeatCrescendo = CrescendoType.Decrescendo;
                            break;
                        // case 'continue': Ignore
                        case 'stop':
                            this._nextBeatCrescendo = null;
                            break;
                    }
                    break;
                case 'dynamics':
                    const newDynamics = this.parseDynamics(direction);
                    if (newDynamics !== null) {
                        this._currentDynamics = newDynamics;
                        this._score.stylesheet.hideDynamics = false;
                    }
                    break;
                case 'dashes':
                    const type = direction.getAttribute('type', 'start');
                    switch (previousWords) {
                        case 'LetRing':
                            this._nextBeatLetRing = type === 'start' || type === 'continue';
                            break;
                        case 'P.M.':
                            this._nextBeatPalmMute = type === 'start' || type === 'continue';
                            break;
                    }
                    previousWords = '';
                    break;
                // case 'bracket': Ignored
                case 'pedal':
                    const pedal = this.parsePedal(direction);
                    if (pedal && bar) {
                        pedal.ratioPosition = getRatioPosition();

                        // up or holds without a previous down/hold?
                        const canHaveUp =
                            bar.sustainPedals.length > 0 &&
                            bar.sustainPedals[bar.sustainPedals.length - 1].pedalType !== SustainPedalMarkerType.Up;

                        if (pedal.pedalType !== SustainPedalMarkerType.Up || canHaveUp) {
                            bar.sustainPedals.push(pedal);
                        }
                    }
                    break;
                case 'metronome':
                    this.parseMetronome(direction, masterBar, getRatioPosition());
                    break;
                case 'octave-shift':
                    this._nextBeatOttavia = this.parseOctaveShift(direction);
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

        if (previousWords) {
            this._nextBeatText = previousWords;
        }
    }
    private parseOctaveShift(element: XmlNode): Ottavia | null {
        const type = element.getAttribute('type');
        const size = Number.parseInt(element.getAttribute('size', '8'));

        switch (size) {
            case 15:
                switch (type) {
                    case 'up':
                        return Ottavia._15mb;
                    case 'down':
                        return Ottavia._15ma;
                    case 'stop':
                        return Ottavia.Regular;
                    case 'continue':
                        return this._nextBeatOttavia;
                }
                break;
            case 8:
                switch (type) {
                    case 'up':
                        return Ottavia._8vb;
                    case 'down':
                        return Ottavia._8va;
                    case 'stop':
                        return Ottavia.Regular;
                    case 'continue':
                        return this._nextBeatOttavia;
                }
                break;
        }

        return null;
    }
    private parseMetronome(element: XmlNode, masterBar: MasterBar, ratioPosition: number) {
        let unit: Duration | null = null;
        let perMinute: number = -1;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'beat-unit':
                    unit = this.parseBeatDuration(c);
                    break;
                //  case 'beat-unit-dot' not supported
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
            tempoAutomation.value = (perMinute * (unit / 4)) | 0;
            tempoAutomation.ratioPosition = ratioPosition;

            if (!this.hasSameTempo(masterBar, tempoAutomation)) {
                masterBar.tempoAutomations.push(tempoAutomation);
                if (masterBar.index === 0) {
                    masterBar.score.tempo = tempoAutomation.value;
                }
            }
        }
    }

    private hasSameTempo(masterBar: MasterBar, tempoAutomation: Automation) {
        for (const existing of masterBar.tempoAutomations) {
            if (tempoAutomation.ratioPosition === existing.ratioPosition && tempoAutomation.value === existing.value) {
                return true;
            }
        }
        return false;
    }

    private parsePedal(element: XmlNode): SustainPedalMarker | null {
        const marker = new SustainPedalMarker();
        switch (element.getAttribute('type')) {
            case 'start':
                marker.pedalType = SustainPedalMarkerType.Down;
                break;
            case 'stop':
                marker.pedalType = SustainPedalMarkerType.Up;
                break;
            // case 'sostenuto': Not supported
            // case 'change': Not supported
            case 'continue':
                marker.pedalType = SustainPedalMarkerType.Hold;
                break;
            // case 'discontinue': Not supported
            // case 'resume': Not supported
            default:
                return null;
        }
        return marker;
    }

    private parseDynamics(element: XmlNode) {
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

    private parseForward(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'duration':
                    this._musicalPosition += this.musicXmlDivisionsToAlphaTabTicks(Number.parseFloat(c.innerText));
                    break;
                // case 'footnote': Ignored
                // case 'level': Ignored
                // case 'voice': Not supported, spec is quite vague how to this should behave, we keep it simple for now
                // case 'staff': Not supported, spec is quite vague how to this should behave, we keep it simple for now
            }
        }
    }

    private parseBackup(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'duration':
                    const beat = this._lastBeat;
                    if (beat) {
                        let musicalPosition = this._musicalPosition;
                        musicalPosition -= this.musicXmlDivisionsToAlphaTabTicks(Number.parseFloat(c.innerText));
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

    private getOrCreateStaff(track: Track, staffIndex: number): Staff {
        while (track.staves.length <= staffIndex) {
            const staff = new Staff();
            track.addStaff(staff);

            // ensure bars on new staff
            if (this._score.masterBars.length > 0) {
                this.getOrCreateBar(staff, this._score.masterBars[this._score.masterBars.length - 1]);
            }
        }

        return track.staves[staffIndex];
    }

    private getOrCreateBar(staff: Staff, masterBar: MasterBar): Bar {
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

    private getOrCreateVoice(bar: Bar, voiceIndex: number): Voice {
        let voicesCreated = false;
        while (bar.voices.length <= voiceIndex) {
            bar.addVoice(new Voice());
            voicesCreated = true;
        }

        // ensure voices on all bars
        if (voicesCreated) {
            for (const b of bar.staff.bars) {
                while (b.voices.length <= voiceIndex) {
                    b.addVoice(new Voice());
                }
            }
        }

        return bar.voices[voiceIndex];
    }

    private parseNote(element: XmlNode, masterBar: MasterBar, track: Track) {
        // Beat level information
        let beat: Beat | null = null;
        let graceType = GraceType.None;
        let graceDurationInDivisions = 0;
        let beamMode: BeatBeamingMode | null = null;
        // let graceTimeStealPrevious = 0;
        // let graceTimeStealFollowing = 0;

        let isChord = false;

        let staffIndex = 0;
        let voiceIndex = 0;

        let durationInTicks = -1;
        let beatDuration: Duration | null = null;
        let dots = 0;

        let tupletNumerator = -1;
        let tupletDenominator = -1;

        let preferredBeamDirection: BeamDirection | null = null;

        // Note level
        let note: Note | null = null;
        let isPitched = false;
        let instrumentId: string | null = null;
        const noteIsVisible = element.getAttribute('print-object', 'yes') !== 'no';

        // will create new beat with all information in the correct tree
        // or add the note to an existing beat if specified accordingly.
        const ensureBeat = () => {
            if (beat !== null) {
                return;
            }

            if (isChord && !this._lastBeat) {
                Logger.warning(
                    'MusicXML',
                    'Malformed MusicXML, <chord /> cannot be set on the first note of a measure'
                );
                isChord = false;
            }

            if (isChord && !note) {
                Logger.warning('MusicXML', 'Cannot mix <chord /> and <rest />');
                isChord = false;
            }

            const staff = this.getOrCreateStaff(track, staffIndex);
            if (isChord) {
                beat = this._lastBeat!;
                beat!.addNote(note!);
                return;
            }

            const bar = this.getOrCreateBar(staff, masterBar);
            const voice = this.getOrCreateVoice(bar, voiceIndex);

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
                    this._lastBeat.voice.bar.staff.index !== staffIndex &&
                    // previous beat on this staff is also forced
                    voice.beats.length > 0 &&
                    voice.beats[voice.beats.length - 1].beamingMode === BeatBeamingMode.ForceMergeWithNext
                ) {
                    // chances are high that we have notes like this
                    // staff1Note -> staff2Note -> staff2Note -> staff1Note
                    // in this case we create rests for the gap caused by the staff2Notes
                    const preferredDuration = voice.beats[voice.beats.length - 1].duration;
                    while (gap > 0) {
                        const restGap = this.createRestForGap(gap, preferredDuration);
                        if (restGap !== null) {
                            this.insertBeatToVoice(restGap, voice);
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
                    this.insertBeatToVoice(placeholder, voice);
                }
            } else if (gap < 0) {
                Logger.error(
                    'MusicXML',
                    'Unsupported forward/backup detected. Cannot fill new beats into already filled area of voice'
                );
            }

            if (durationInTicks < 0 && beatDuration !== null) {
                durationInTicks = MidiUtils.toTicks(beatDuration!);
                if (dots > 0) {
                    durationInTicks = MidiUtils.applyDot(durationInTicks, dots === 2);
                }
            }

            const newBeat = new Beat();
            beat = newBeat;
            if (beamMode === null) {
                newBeat.beamingMode = this.getStaffContext(staff).isExplicitlyBeamed
                    ? BeatBeamingMode.ForceSplitToNext
                    : BeatBeamingMode.Auto;
            } else {
                newBeat.beamingMode = beamMode;
                this.getStaffContext(staff).isExplicitlyBeamed = true;
            }
            newBeat.isEmpty = false;
            newBeat.dynamics = this._currentDynamics;
            if (this._isBeatSlash) {
                newBeat.slashed = true;
            }

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

            const crescendo = this._nextBeatCrescendo;
            // Don't reset until 'stop' this._nextBeatCrescendo = null;
            if (crescendo !== null) {
                newBeat.crescendo = crescendo;
            }

            const ottavia = this._nextBeatOttavia;
            // Don't set until 'stop'
            if (ottavia !== null) {
                newBeat.ottava = ottavia;
            }

            newBeat.isLetRing = this._nextBeatLetRing;
            newBeat.isPalmMute = this._nextBeatPalmMute;
            if (this._nextBeatText) {
                newBeat.text = this._nextBeatText;
                this._nextBeatText = null;
            }

            if (note !== null) {
                newBeat.addNote(note!);
            }

            this.insertBeatToVoice(newBeat, voice);

            if (note !== null) {
                note!.isVisible = noteIsVisible;
                const trackInfo = this._indexToTrackInfo.get(track.index)!;
                if (instrumentId !== null) {
                    note!.percussionArticulation = trackInfo.getOrCreateArticulation(instrumentId!, note!);
                } else if (!isPitched) {
                    note!.percussionArticulation = trackInfo.getOrCreateArticulation('', note!);
                }
            }

            // duration only after we added it into the tree
            if (graceType !== GraceType.None) {
                newBeat.graceType = graceType;
                this.applyBeatDurationFromTicks(newBeat, graceDurationInDivisions, null, false);
            } else {
                newBeat.tupletNumerator = tupletNumerator;
                newBeat.tupletDenominator = tupletDenominator;
                newBeat.dots = dots;
                newBeat.preferredBeamDirection = preferredBeamDirection;
                this.applyBeatDurationFromTicks(newBeat, durationInTicks, beatDuration, true);
            }

            this._musicalPosition = newBeat.displayEnd;
            this._lastBeat = newBeat;
        };

        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'grace':
                    const makeTime = Number.parseFloat(c.getAttribute('make-time', '-1'));
                    if (makeTime >= 0) {
                        graceDurationInDivisions = this.musicXmlDivisionsToAlphaTabTicks(makeTime);
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

                case 'chord':
                    isChord = true;
                    break;

                case 'cue':
                    // not supported
                    // as they are meant to not be played, we skip them completely
                    // instead of handling them wrong.
                    return;

                case 'pitch':
                    note = this.parsePitch(c);
                    isPitched = true;
                    break;
                case 'unpitched':
                    note = this.parseUnpitched(c, track);
                    break;
                case 'rest':
                    note = null; // rest beat
                    if (beatDuration === null) {
                        beatDuration = Duration.Whole;
                    }
                    break;

                case 'duration':
                    durationInTicks = this.parseDuration(c);
                    break;
                // case 'tie': Ignored -> "tie" is sound, "tied" is notation
                case 'instrument':
                    instrumentId = c.getAttribute('id', '');
                    break;

                // case 'footnote': Ignored
                // case 'level': Ignored
                case 'voice':
                    voiceIndex = Number.parseInt(c.innerText);
                    if (Number.isNaN(voiceIndex)) {
                        Logger.warning('MusicXML', 'Voices need to be specified as numbers');
                        voiceIndex = 0;
                    } else {
                        voiceIndex = voiceIndex - 1;
                    }
                    break;
                case 'type':
                    beatDuration = this.parseBeatDuration(c);
                    break;
                case 'dot':
                    dots++;
                    break;
                case 'accidental':
                    if (note === null) {
                        Logger.warning('MusicXML', 'Malformed MusicXML, missing pitch or unpitched for note');
                    } else {
                        this.parseAccidental(c, note);
                    }
                    break;
                case 'time-modification':
                    for (const tmc of c.childElements()) {
                        switch (tmc.localName) {
                            case 'actual-notes':
                                tupletNumerator = Number.parseInt(tmc.innerText);
                                break;
                            case 'normal-notes':
                                tupletDenominator = Number.parseInt(tmc.innerText);
                                break;
                            // case 'normal-type': not supported
                            // case 'normal-dot': not supported
                        }
                    }
                    break;
                case 'stem':
                    preferredBeamDirection = this.parseStem(c);
                    break;
                case 'notehead':
                    if (note === null) {
                        Logger.warning('MusicXML', 'Malformed MusicXML, missing pitch or unpitched for note');
                    } else {
                        this.parseNoteHead(
                            c,
                            note,
                            beatDuration ?? Duration.Quarter,
                            preferredBeamDirection ?? this.estimateBeamDirection(note)
                        );
                    }
                    break;
                // case 'notehead-text': Not supported
                case 'staff':
                    staffIndex = Number.parseInt(c.innerText) - 1;
                    break;
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
                    ensureBeat();
                    this.parseNotations(c, note, beat!);
                    break;
                case 'lyric':
                    ensureBeat();
                    this.parseLyric(c, beat!, track);
                    break;
                case 'play':
                    this.parsePlay(c, note);
                    break;
                // case 'listen': Ignored
            }
        }

        if (isPitched) {
            const staff = this.getOrCreateStaff(track, staffIndex);
            const transpose = this.getStaffContext(staff).transpose;
            if (transpose !== 0) {
                const value = note!.octave * 12 + note!.tone + transpose;
                note!.octave = (value / 12) | 0;
                note!.tone = value - note!.octave * 12;
            }
        }

        // if not yet created do it befor we exit to ensure we created the beat/note
        ensureBeat();
    }

    private parsePlay(element: XmlNode, note: Note | null) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'ipa': Ignored
                case 'mute':
                    if(note && c.innerText === 'palm') {
                        note.isPalmMute = true;
                    }                    
                    break;
                case 'semi-pitched':
                    break;
                // case 'other-play': Ignored
            }
        }
    }

    private static readonly B4Value = 71;
    private estimateBeamDirection(note: Note): BeamDirection {
        return note.calculateRealValue(false, false) < MusicXmlImporter.B4Value ? BeamDirection.Down : BeamDirection.Up;
    }

    private parseNoteHead(element: XmlNode, note: Note, beatDuration: Duration, beamDirection: BeamDirection) {
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                    this.applyNoteHead(
                        note,
                        beatDuration,
                        forceFill,
                        MusicFontSymbol.NoteShapeTriangleRightWhite,
                        MusicFontSymbol.NoteShapeTriangleRightWhite,
                        MusicFontSymbol.NoteShapeTriangleRightWhite,
                        MusicFontSymbol.NoteShapeTriangleRightBlack
                    );
                } else {
                    this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadSlashWhiteWhole,
                    MusicFontSymbol.NoteheadSlashWhiteWhole,
                    MusicFontSymbol.NoteheadSlashWhiteHalf,
                    MusicFontSymbol.NoteheadSlashVerticalEnds
                );
                break;
            case 'slashed':
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
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
                this.applyNoteHead(
                    note,
                    beatDuration,
                    forceFill,
                    MusicFontSymbol.NoteheadXDoubleWhole,
                    MusicFontSymbol.NoteheadXWhole,
                    MusicFontSymbol.NoteheadXHalf,
                    MusicFontSymbol.NoteheadXBlack
                );
                break;
        }
    }

    private createRestForGap(gap: number, preferredDuration: Duration): Beat | null {
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

    private insertBeatToVoice(newBeat: Beat, voice: Voice) {
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

    private musicXmlDivisionsToAlphaTabTicks(divisions: number): number {
        // we translate the Divisions-per-quarter-note of the MusicXML to our fixed MidiUtils.QuarterTime

        return (divisions * MidiUtils.QuarterTime) / this._divisionsPerQuarterNote;
    }

    private parseBeatDuration(element: XmlNode): Duration | null {
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

    private static allDurations = [
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

    private static allDurationTicks = MusicXmlImporter.allDurations.map(d => MidiUtils.toTicks(d));

    private applyBeatDurationFromTicks(
        newBeat: Beat,
        ticks: number,
        beatDuration: Duration | null,
        applyDisplayDuration: boolean
    ) {
        if (!beatDuration) {
            for (let i = 0; i < MusicXmlImporter.allDurations.length; i++) {
                const dt = MusicXmlImporter.allDurationTicks[i];
                if (ticks >= dt) {
                    beatDuration = MusicXmlImporter.allDurations[i];
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

    private parseLyric(element: XmlNode, beat: Beat, track: Track) {
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

    private parseNotations(element: XmlNode, note: Note | null, beat: Beat) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                // case 'footnote': Ignored
                // case 'level': Ignored
                case 'tied':
                    if (note) {
                        this.parseTied(c, note, beat.voice.bar.staff);
                    }
                    break;
                case 'slur':
                    if (note) {
                        this.parseSlur(c, note);
                    }
                    break;
                // case 'tuplet': Handled via time-modification
                case 'glissando':
                    if (note) {
                        this.parseGlissando(c, note);
                    }
                    break;
                case 'slide':
                    if (note) {
                        this.parseSlide(c, note);
                    }
                    break;
                case 'ornaments':
                    if (note) {
                        this.parseOrnaments(c, note);
                    }
                    break;
                case 'technical':
                    this.parseTechnical(c, note, beat);
                    break;
                case 'articulations':
                    if (note) {
                        this.parseArticulations(c, note);
                    }
                    break;
                case 'dynamics':
                    const dynamics = this.parseDynamics(c);
                    if (dynamics !== null) {
                        beat.dynamics = dynamics;
                        this._currentDynamics = dynamics;
                    }
                    break;
                case 'fermata':
                    this.parseFermata(c, beat);
                    break;
                case 'arpeggiate':
                    this.parseArpeggiate(c, beat);
                    break;
                // case 'non-arpeggiate': Not supported
                // case 'accidental-mark': Not supported
                // case 'other-notation': Not supported
            }
        }
    }

    private getStaffContext(staff: Staff) {
        if (!this._staffToContext.has(staff)) {
            const context = new StaffContext();
            this._staffToContext.set(staff, context);
            return context;
        }
        return this._staffToContext.get(staff)!;
    }

    private parseGlissando(element: XmlNode, note: Note) {
        const type = element.getAttribute('type');
        const number = element.getAttribute('number', '1');

        const context = this.getStaffContext(note.beat.voice.bar.staff);

        switch (type) {
            case 'start':
                context.slideOrigins.set(number, note);
                break;
            case 'stop':
                if (context.slideOrigins.has(number)) {
                    const origin = context.slideOrigins.get(number)!;
                    origin.slideTarget = note;
                    note.slideOrigin = origin;
                    origin.slideOutType = SlideOutType.Shift; // TODO: wavy lines
                }
                break;
        }
    }

    private parseSlur(element: XmlNode, note: Note) {
        const slurNumber: string = element.getAttribute('number', '1');

        const context = this.getStaffContext(note.beat.voice.bar.staff);

        switch (element.getAttribute('type')) {
            case 'start':
                context.slurStarts.set(slurNumber, note);
                break;
            case 'stop':
                if (context.slurStarts.has(slurNumber)) {
                    note.isSlurDestination = true;
                    const slurStart = context.slurStarts.get(slurNumber)!;
                    slurStart.slurDestination = note;
                    note.slurOrigin = slurStart;

                    context.slurStarts.delete(slurNumber);
                }
                break;
        }
    }

    private parseArpeggiate(element: XmlNode, beat: Beat) {
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

    private parseFermata(element: XmlNode, beat: Beat) {
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

    private parseArticulations(element: XmlNode, note: Note) {
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
    private parseTechnical(element: XmlNode, note: Note | null, beat: Beat) {
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
                        note.leftHandFinger = this.parseFingering(c);
                    }
                    break;
                case 'pluck':
                    if (note) {
                        note.rightHandFinger = this.parseFingering(c);
                    }
                    break;
                // case 'double-tongue': Not supported
                // case 'triple-tongue': Not supported
                // case 'stopped':  Not supported
                // case 'snap-pizzicato':  Not supported
                case 'fret':
                    if (note) {
                        note.fret = Number.parseInt(c.innerText);
                    }
                    break;
                case 'string':
                    if (note) {
                        note.string = beat.voice.bar.staff.tuning.length - Number.parseInt(c.innerText) + 1;
                    }
                    break;
                case 'hammer-on':
                case 'pull-off':
                    if (note) {
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
            this.parseBends(bends, note);
        }
    }

    private parseBends(elements: XmlNode[], note: Note): void {
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

    private parseFingering(c: XmlNode): Fingers {
        switch (c.innerText) {
            case '0':
                return Fingers.NoOrDead;
            case '1':
            case 'p':
            case 't':
                return Fingers.Thumb;
            case '2':
            case 'i':
                return Fingers.IndexFinger;
            case '3':
            case 'm':
                return Fingers.MiddleFinger;
            case '4':
            case 'a':
                return Fingers.AnnularFinger;
            case '5':
            case 'c':
                return Fingers.LittleFinger;
        }

        return Fingers.Unknown;
    }

    private _currentTrillStep: number = -1;

    private parseOrnaments(element: XmlNode, note: Note): void {
        let currentTrillStep = -1;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'trill-mark':
                    currentTrillStep = Number.parseInt(c.getAttribute('trill-step', '2'));
                    if (note.isStringed) {
                        note.trillValue = note.stringTuning + currentTrillStep;
                    } else if (!note.isPercussion) {
                        note.trillValue = note.calculateRealValue(false, false) + currentTrillStep;
                    }
                    break;
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
                    if (currentTrillStep > 0) {
                        if (c.getAttribute('type') === 'start') {
                            this._currentTrillStep = currentTrillStep;
                        }
                    } else if (this._currentTrillStep > 0) {
                        if (c.getAttribute('type') === 'stop') {
                            this._currentTrillStep = -1;
                        } else if (note.isStringed) {
                            note.trillValue = note.stringTuning + this._currentTrillStep;
                        } else if (!note.isPercussion) {
                            note.trillValue = note.calculateRealValue(false, false) + this._currentTrillStep;
                        }
                    } else {
                        note.vibrato = VibratoType.Slight;
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
                    switch (c.innerText) {
                        case '1':
                            note.beat.tremoloSpeed = Duration.Eighth;
                            break;
                        case '2':
                            note.beat.tremoloSpeed = Duration.Sixteenth;
                            break;
                        case '3':
                            note.beat.tremoloSpeed = Duration.ThirtySecond;
                            break;
                    }
                    break;
                // case 'haydn': Not supported
                // case 'other-element': Not supported
            }
        }
    }

    private parseSlide(element: XmlNode, note: Note) {
        const type = element.getAttribute('type');
        const number = element.getAttribute('number', '1');

        const context = this.getStaffContext(note.beat.voice.bar.staff);

        switch (type) {
            case 'start':
                context.slideOrigins.set(number, note);
                break;
            case 'stop':
                if (context.slideOrigins.has(number)) {
                    const origin = context.slideOrigins.get(number)!;
                    origin.slideTarget = note;
                    note.slideOrigin = origin;
                    origin.slideOutType = SlideOutType.Shift;
                }
                break;
        }
    }

    private parseTied(element: XmlNode, note: Note, staff: Staff): void {
        const type = element.getAttribute('type');
        const number = element.getAttribute('number', '');

        const context = this.getStaffContext(staff);

        if (type === 'start') {
            if (number) {
                // start without end
                if (context.tieStartIds.has(number)) {
                    const unclosed = context.tieStartIds.get(number)!;
                    context.tieStarts.delete(unclosed);
                }

                context.tieStartIds.set(number, note);
            }

            context.tieStarts.add(note);
        } else if (type === 'stop' && !note.isTieDestination) {
            let tieOrigin: Note | null = null;
            if (number) {
                if (!context.tieStartIds.has(number)) {
                    return;
                }

                tieOrigin = context.tieStartIds.get(number)!;
                context.tieStartIds.delete(number);
                context.tieStarts.delete(note);
            } else {
                const realValue = this.calculatePitchedNoteValue(note);
                for (const t of context.tieStarts) {
                    if (this.calculatePitchedNoteValue(t) === realValue) {
                        tieOrigin = t;
                        context.tieStarts.delete(tieOrigin);
                        break;
                    }
                }
            }

            if (!tieOrigin) {
                return;
            }

            note.isTieDestination = true;
            note.tieOrigin = tieOrigin;
        }
    }

    private parseStem(element: XmlNode): BeamDirection | null {
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

    private parseAccidental(element: XmlNode, note: Note) {
        // NOTE: this can currently lead to wrong notes shown,
        // TODO: check partwise-complex-measures.xml where accidentals and notes get wrong
        // in combination with key signatures
        switch (element.innerText) {
            case 'sharp':
                note.accidentalMode = NoteAccidentalMode.ForceSharp;
                break;
            case 'natural':
                note.accidentalMode = NoteAccidentalMode.ForceNatural;
                break;
            case 'flat':
                note.accidentalMode = NoteAccidentalMode.ForceFlat;
                break;
            case 'double-sharp':
                note.accidentalMode = NoteAccidentalMode.ForceDoubleSharp;
                break;
            case 'flat-flat':
                note.accidentalMode = NoteAccidentalMode.ForceDoubleFlat;
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
    }

    private calculatePitchedNoteValue(note: Note) {
        return note.octave * 12 + note.tone;
    }

    private parseDuration(element: XmlNode): number {
        return this.musicXmlDivisionsToAlphaTabTicks(Number.parseFloat(element.innerText));
    }

    private parseUnpitched(element: XmlNode, track: Track): Note {
        let step: string = '';
        let octave: number = 0;
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'display-step':
                    step = c.innerText;
                    break;
                case 'display-octave':
                    // 0-9, 4 for middle C
                    octave = Number.parseInt(c.innerText) + 1;
                    break;
            }
        }

        // if no display information -> middle of staff (handled in getOrCreateArticulation)
        const note = new Note();
        if (step === '') {
            note.octave = 0;
            note.tone = 0;
        } else {
            const value: number = octave * 12 + ModelUtils.getToneForText(step).noteValue;
            note.octave = (value / 12) | 0;
            note.tone = value - note.octave * 12;
        }

        return note;
    }

    private parsePitch(element: XmlNode): Note {
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
                    octave = Number.parseInt(c.innerText) + 1;
                    break;
            }
        }

        semitones = semitones | 0; // no microtones supported
        const value: number = octave * 12 + ModelUtils.getToneForText(step).noteValue + semitones;
        const note = new Note();

        note.octave = (value / 12) | 0;
        note.tone = value - note.octave * 12;

        return note;
    }

    private applyNoteHead(
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
