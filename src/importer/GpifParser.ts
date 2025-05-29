import { UnsupportedFormatError } from '@src/importer/UnsupportedFormatError';
import { AccentuationType } from '@src/model/AccentuationType';
import { Automation, AutomationType, SyncPointData } from '@src/model/Automation';
import { Bar, BarLineStyle, SustainPedalMarker, SustainPedalMarkerType } from '@src/model/Bar';
import { Beat, BeatBeamingMode } from '@src/model/Beat';
import { BendPoint } from '@src/model/BendPoint';
import { BrushType } from '@src/model/BrushType';
import { Chord } from '@src/model/Chord';
import { Clef } from '@src/model/Clef';
import { Color } from '@src/model/Color';
import { CrescendoType } from '@src/model/CrescendoType';
import { Duration } from '@src/model/Duration';
import { DynamicValue } from '@src/model/DynamicValue';
import { Fermata, FermataType } from '@src/model/Fermata';
import { Fingers } from '@src/model/Fingers';
import { GraceType } from '@src/model/GraceType';
import { HarmonicType } from '@src/model/HarmonicType';
import { KeySignature } from '@src/model/KeySignature';
import { KeySignatureType } from '@src/model/KeySignatureType';
import { Lyrics } from '@src/model/Lyrics';
import { MasterBar } from '@src/model/MasterBar';
import { Note } from '@src/model/Note';
import { Ottavia } from '@src/model/Ottavia';
import { PickStroke } from '@src/model/PickStroke';
import { Score } from '@src/model/Score';
import { Section } from '@src/model/Section';
import { SimileMark } from '@src/model/SimileMark';
import { SlideInType } from '@src/model/SlideInType';
import { SlideOutType } from '@src/model/SlideOutType';
import type { Staff } from '@src/model/Staff';
import { Track } from '@src/model/Track';
import { TripletFeel } from '@src/model/TripletFeel';
import { VibratoType } from '@src/model/VibratoType';
import { Voice } from '@src/model/Voice';
import type { Settings } from '@src/Settings';
import { XmlDocument } from '@src/xml/XmlDocument';

import { type XmlNode, XmlNodeType } from '@src/xml/XmlNode';
import { MidiUtils } from '@src/midi/MidiUtils';
import { BeamDirection } from '@src/rendering/utils/BeamDirection';
import { NoteAccidentalMode } from '@src/model/NoteAccidentalMode';
import { PercussionMapper } from '@src/model/PercussionMapper';
import { InstrumentArticulation } from '@src/model/InstrumentArticulation';
import { MusicFontSymbol } from '@src/model/MusicFontSymbol';
import { TextBaseline } from '@src/platform/ICanvas';
import { BeatCloner } from '@src/generated/model/BeatCloner';
import { NoteCloner } from '@src/generated/model/NoteCloner';
import { Logger } from '@src/Logger';
import { GolpeType } from '@src/model/GolpeType';
import { FadeType } from '@src/model/FadeType';
import { WahPedal } from '@src/model/WahPedal';
import { BarreShape } from '@src/model/BarreShape';
import { NoteOrnament } from '@src/model/NoteOrnament';
import { Rasgueado } from '@src/model/Rasgueado';
import { Direction } from '@src/model/Direction';
import { ModelUtils } from '@src/model/ModelUtils';
import { BackingTrack } from '@src/model/BackingTrack';

/**
 * This structure represents a duration within a gpif
 */
export class GpifRhythm {
    public id: string = '';
    public dots: number = 0;
    public tupletDenominator: number = -1;
    public tupletNumerator: number = -1;
    public value: Duration = Duration.Quarter;
}

class GpifSound {
    public name: string = '';
    public path: string = '';
    public role: string = '';
    public get uniqueId(): string {
        return `${this.path};${this.name};${this.role}`;
    }

    public program: number = 0;
}

/**
 * This class can parse a score.gpif xml file into the model structure
 */
export class GpifParser {
    private static readonly InvalidId: string = '-1';

    /**
     * GPX range: 0-100
     * Internal range: 0 - 60
     */
    private static readonly BendPointPositionFactor: number = BendPoint.MaxPosition / 100.0;

    /**
     * GPIF: 25 per quarternote
     * Internal Range: 1 per quarter note
     */
    private static readonly BendPointValueFactor: number = 1 / 25.0;

    // tests have shown that Guitar Pro seem to always work with 44100hz for the frame offsets,
    // they are NOT using the sample rate of the input file. 
    // Downsampling a 44100hz ogg to 8000hz and using it in as audio track resulted in the same frame offset when placing sync points.
    private static readonly SampleRate = 44100;


    public score!: Score;
    private _backingTrackAssetId: string | undefined;

    private _masterTrackAutomations!: Map<number, Automation[]>;
    private _automationsPerTrackIdAndBarIndex!: Map<string, Map<number, Automation[]>>;
    private _sustainPedalsPerTrackIdAndBarIndex!: Map<string, Map<number, SustainPedalMarker[]>>;
    private _tracksMapping!: string[];
    private _tracksById!: Map<string, Track>;
    private _masterBars!: MasterBar[];
    private _barsOfMasterBar!: Array<string[]>;
    private _barsById!: Map<string, Bar>;
    private _voicesOfBar!: Map<string, string[]>;
    private _voiceById!: Map<string, Voice>;
    private _beatsOfVoice!: Map<string, string[]>;
    private _rhythmOfBeat!: Map<string, string>;
    private _beatById!: Map<string, Beat>;
    private _rhythmById!: Map<string, GpifRhythm>;
    private _noteById!: Map<string, Note>;
    private _notesOfBeat!: Map<string, string[]>;
    private _tappedNotes!: Map<string, boolean>;
    private _lyricsByTrack!: Map<string, Lyrics[]>;
    private _soundsByTrack!: Map<string, Map<string, GpifSound>>;
    private _hasAnacrusis: boolean = false;
    private _articulationByName!: Map<string, InstrumentArticulation>;
    private _skipApplyLyrics: boolean = false;
    private _backingTrackPadding:number = 0;

    private _doubleBars: Set<MasterBar> = new Set<MasterBar>();
    private _keySignatures: Map<number, [KeySignature, KeySignatureType]> = new Map<
        number,
        [KeySignature, KeySignatureType]
    >();

    public loadAsset?: (fileName: string) => Uint8Array | undefined;

    public parseXml(xml: string, settings: Settings): void {
        this._masterTrackAutomations = new Map<number, Automation[]>();
        this._automationsPerTrackIdAndBarIndex = new Map<string, Map<number, Automation[]>>();
        this._sustainPedalsPerTrackIdAndBarIndex = new Map<string, Map<number, SustainPedalMarker[]>>();
        this._tracksMapping = [];
        this._tracksById = new Map<string, Track>();
        this._masterBars = [];
        this._barsOfMasterBar = [];
        this._voicesOfBar = new Map<string, string[]>();
        this._barsById = new Map<string, Bar>();
        this._voiceById = new Map<string, Voice>();
        this._beatsOfVoice = new Map<string, string[]>();
        this._beatById = new Map<string, Beat>();
        this._rhythmOfBeat = new Map<string, string>();
        this._rhythmById = new Map<string, GpifRhythm>();
        this._notesOfBeat = new Map<string, string[]>();
        this._noteById = new Map<string, Note>();
        this._tappedNotes = new Map<string, boolean>();
        this._lyricsByTrack = new Map<string, Lyrics[]>();
        this._soundsByTrack = new Map<string, Map<string, GpifSound>>();
        this._skipApplyLyrics = false;

        const dom: XmlDocument = new XmlDocument();
        try {
            dom.parse(xml);
        } catch (e) {
            throw new UnsupportedFormatError('Could not parse XML', e as Error);
        }

        this.parseDom(dom);
        this.buildModel();
        ModelUtils.consolidate(this.score);
        this.score.finish(settings);
        if (!this._skipApplyLyrics && this._lyricsByTrack.size > 0) {
            for (const [t, lyrics] of this._lyricsByTrack) {
                const track: Track = this._tracksById.get(t)!;
                track.applyLyrics(lyrics);
            }
        }
    }

    private parseDom(dom: XmlDocument): void {
        const root: XmlNode | null = dom.firstElement;
        if (!root) {
            return;
        }
        // the XML uses IDs for referring elements within the
        //  Therefore we do the parsing in 2 steps:
        // - at first we read all model elements and store them by ID in a lookup table
        // - after that we need to join up the information.
        if (root.localName === 'GPIF') {
            this.score = new Score();
            // parse all children
            for (const n of root.childElements()) {
                switch (n.localName) {
                    case 'Score':
                        this.parseScoreNode(n);
                        break;
                    case 'MasterTrack':
                        this.parseMasterTrackNode(n);
                        break;
                    case 'BackingTrack':
                        this.parseBackingTrackNode(n);
                        break;
                    case 'Tracks':
                        this.parseTracksNode(n);
                        break;
                    case 'MasterBars':
                        this.parseMasterBarsNode(n);
                        break;
                    case 'Bars':
                        this.parseBars(n);
                        break;
                    case 'Voices':
                        this.parseVoices(n);
                        break;
                    case 'Beats':
                        this.parseBeats(n);
                        break;
                    case 'Notes':
                        this.parseNotes(n);
                        break;
                    case 'Rhythms':
                        this.parseRhythms(n);
                        break;
                    case 'Assets':
                        this.parseAssets(n);
                        break;
                }
            }
        } else {
            throw new UnsupportedFormatError('Root node of XML was not GPIF');
        }
    }

    private parseAssets(element: XmlNode) {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'Asset':
                    if (c.getAttribute('id') === this._backingTrackAssetId) {
                        this.parseBackingTrackAsset(c);
                    }
                    break;
            }
        }
    }
    private parseBackingTrackAsset(element: XmlNode) {
        let embeddedFilePath = '';
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'EmbeddedFilePath':
                    embeddedFilePath = c.innerText;
                    break;
            }
        }

        const loadAsset = this.loadAsset;
        if (loadAsset) {
            const assetData = loadAsset(embeddedFilePath);
            if (assetData) {
                this.score.backingTrack!.rawAudioFile = assetData;
            } else {
                this.score.backingTrack = undefined;
            }
        }
    }

    //
    // <Score>...</Score>
    //
    private parseScoreNode(element: XmlNode): void {
        for (const c of element.childElements()) {
            switch (c.localName) {
                case 'Title':
                    this.score.title = c.innerText;
                    break;
                case 'SubTitle':
                    this.score.subTitle = c.innerText;
                    break;
                case 'Artist':
                    this.score.artist = c.innerText;
                    break;
                case 'Album':
                    this.score.album = c.innerText;
                    break;
                case 'Words':
                    this.score.words = c.innerText;
                    break;
                case 'Music':
                    this.score.music = c.innerText;
                    break;
                case 'WordsAndMusic':
                    const wordsAndMusic: string = c.innerText;
                    if (wordsAndMusic !== '') {
                        if (wordsAndMusic && !this.score.words) {
                            this.score.words = wordsAndMusic;
                        }
                        if (wordsAndMusic && !this.score.music) {
                            this.score.music = wordsAndMusic;
                        }
                    }
                    break;
                case 'Copyright':
                    this.score.copyright = c.innerText;
                    break;
                case 'Tabber':
                    this.score.tab = c.innerText;
                    break;
                case 'Instructions':
                    this.score.instructions = c.innerText;
                    break;
                case 'Notices':
                    this.score.notices = c.innerText;
                    break;
                case 'ScoreSystemsDefaultLayout':
                    this.score.defaultSystemsLayout = GpifParser.parseIntSafe(c.innerText, 4);
                    break;
                case 'ScoreSystemsLayout':
                    this.score.systemsLayout = GpifParser.splitSafe(c.innerText).map(i =>
                        GpifParser.parseIntSafe(i, 4)
                    );
                    break;
            }
        }
    }

    private static parseIntSafe(text: string | undefined, fallback: number) {
        if (!text) {
            return fallback;
        }

        const i = Number.parseInt(text);
        if (!Number.isNaN(i)) {
            return i;
        }
        return fallback;
    }

    private static parseFloatSafe(text: string | undefined, fallback: number) {
        if (!text) {
            return fallback;
        }

        const i = Number.parseFloat(text);
        if (!Number.isNaN(i)) {
            return i;
        }
        return fallback;
    }

    private static splitSafe(text: string | undefined, separator: string = ' '): string[] {
        if (!text) {
            return [];
        }

        return text
            .split(separator)
            .map(t => t.trim())
            .filter(t => t.length > 0);
    }

    //
    // <BackingTrack>...</BackingTrack>
    //
    private parseBackingTrackNode(node: XmlNode): void {
        const backingTrack = new BackingTrack();
        let enabled = false;
        let source = '';
        let assetId = '';
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Enabled':
                    enabled = c.innerText === 'true';
                    break;
                case 'Source':
                    source = c.innerText;
                    break;
                case 'AssetId':
                    assetId = c.innerText;
                    break;
                case 'FramePadding':
                    this._backingTrackPadding = GpifParser.parseIntSafe(c.innerText, 0) / GpifParser.SampleRate * 1000;
                    break;
            }
        }

        // only local (contained backing tracks are supported)
        // remote / youtube links seem to come in future releases according to the gpif tags.
        if (enabled && source === 'Local') {
            this.score.backingTrack = backingTrack;
            this._backingTrackAssetId = assetId; // when the Asset tag is parsed this ID is used to load the raw data
        }
    }

    //
    // <MasterTrack>...</MasterTrack>
    //
    private parseMasterTrackNode(node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Automations':
                    this.parseAutomations(c, this._masterTrackAutomations, null, null);
                    break;
                case 'Tracks':
                    this._tracksMapping = GpifParser.splitSafe(c.innerText);
                    break;
                case 'Anacrusis':
                    this._hasAnacrusis = true;
                    break;
            }
        }
    }

    private parseAutomations(
        node: XmlNode,
        automations: Map<number, Automation[]>,
        sounds: Map<string, GpifSound> | null,
        sustainPedals: Map<number, SustainPedalMarker[]> | null
    ): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Automation':
                    this.parseAutomation(c, automations, sounds, sustainPedals);
                    break;
            }
        }
    }

    private parseAutomation(
        node: XmlNode,
        automations: Map<number, Automation[]>,
        sounds: Map<string, GpifSound> | null,
        sustainPedals: Map<number, SustainPedalMarker[]> | null
    ): void {
        let type: string | null = null;
        let isLinear: boolean = false;
        let barIndex: number = -1;
        let ratioPosition: number = 0;
        let numberValue: number = 0;
        let textValue: string | null = null;
        let reference: number = 0;
        let text: string | null = null;
        let syncPointValue: SyncPointData | undefined = undefined;

        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Type':
                    type = c.innerText;
                    break;
                case 'Linear':
                    isLinear = c.innerText.toLowerCase() === 'true';
                    break;
                case 'Bar':
                    barIndex = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
                case 'Position':
                    ratioPosition = GpifParser.parseFloatSafe(c.innerText, 0);
                    break;
                case 'Value':
                    if (c.firstElement && c.firstElement.nodeType === XmlNodeType.CDATA) {
                        textValue = c.innerText;
                    } else if (
                        c.firstElement &&
                        c.firstElement.nodeType === XmlNodeType.Element &&
                        type === 'SyncPoint'
                    ) {
                        syncPointValue = new SyncPointData();
                        for (const vc of c.childElements()) {
                            switch (vc.localName) {
                                case 'BarIndex':
                                    barIndex = GpifParser.parseIntSafe(vc.innerText, 0);
                                    break;
                                case 'BarOccurrence':
                                    syncPointValue.barOccurence = GpifParser.parseIntSafe(vc.innerText, 0);
                                    break;
                                case 'FrameOffset':
                                    const frameOffset = GpifParser.parseFloatSafe(vc.innerText, 0);
                                    syncPointValue.millisecondOffset = (frameOffset / GpifParser.SampleRate) * 1000;
                                    break;
                            }
                        }
                    } else {
                        const parts: string[] = GpifParser.splitSafe(c.innerText);
                        // Issue 391: Some GPX files might have
                        // single floating point value.
                        if (parts.length === 1) {
                            numberValue = GpifParser.parseFloatSafe(parts[0], 0);
                            reference = 1;
                        } else {
                            numberValue = GpifParser.parseFloatSafe(parts[0], 0);
                            reference = GpifParser.parseIntSafe(parts[1], 0);
                        }
                    }
                    break;
                case 'Text':
                    text = c.innerText;
                    break;
            }
        }
        if (!type) {
            return;
        }
        let automation: Automation | null = null;
        switch (type) {
            case 'Tempo':
                automation = Automation.buildTempoAutomation(isLinear, ratioPosition, numberValue, reference);
                break;
            case 'SyncPoint':
                automation = new Automation();
                automation.type = AutomationType.SyncPoint;
                automation.isLinear = isLinear;
                automation.ratioPosition = ratioPosition;
                automation.syncPointValue = syncPointValue;
                break;
            case 'Sound':
                if (textValue && sounds && sounds.has(textValue)) {
                    automation = Automation.buildInstrumentAutomation(
                        isLinear,
                        ratioPosition,
                        sounds.get(textValue)!.program
                    );
                }
                break;
            case 'SustainPedal':
                // we expect sustain pedals only on track automations
                if (sustainPedals) {
                    let v: SustainPedalMarker[];
                    if (sustainPedals.has(barIndex)) {
                        v = sustainPedals.get(barIndex)!;
                    } else {
                        v = [];
                        sustainPedals.set(barIndex, v);
                    }

                    const sustain = new SustainPedalMarker();
                    sustain.ratioPosition = ratioPosition;
                    switch (reference) {
                        case 1:
                            sustain.pedalType = SustainPedalMarkerType.Down;
                            break;
                        case 3:
                            sustain.pedalType = SustainPedalMarkerType.Up;
                            break;
                    }

                    v.push(sustain);
                }

                break;
        }
        if (automation) {
            if (text) {
                automation.text = text;
            }

            if (barIndex >= 0) {
                if (!automations.has(barIndex)) {
                    automations.set(barIndex, []);
                }
                automations.get(barIndex)!.push(automation);
            }
        }
    }

    //
    // <Tracks>...</Tracks>
    //
    private parseTracksNode(node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Track':
                    this.parseTrack(c);
                    break;
            }
        }
    }

    private parseTrack(node: XmlNode): void {
        this._articulationByName = new Map<string, InstrumentArticulation>();

        const track: Track = new Track();
        track.ensureStaveCount(1);
        const staff: Staff = track.staves[0];
        staff.showStandardNotation = true;
        const trackId: string = node.getAttribute('id');

        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Name':
                    track.name = c.innerText;
                    break;
                case 'Color':
                    const parts: string[] = GpifParser.splitSafe(c.innerText);
                    if (parts.length >= 3) {
                        const r: number = GpifParser.parseIntSafe(parts[0], 0);
                        const g: number = GpifParser.parseIntSafe(parts[1], 0);
                        const b: number = GpifParser.parseIntSafe(parts[2], 0);
                        track.color = new Color(r, g, b, 0xff);
                    }
                    break;
                case 'Instrument':
                    const instrumentName: string = c.getAttribute('ref');
                    if (instrumentName.endsWith('-gs') || instrumentName.endsWith('GrandStaff')) {
                        track.ensureStaveCount(2);
                        track.staves[1].showStandardNotation = true;
                    }
                    break;
                case 'InstrumentSet':
                    this.parseInstrumentSet(track, c);
                    break;
                case 'NotationPatch':
                    this.parseNotationPatch(track, c);
                    break;
                case 'ShortName':
                    track.shortName = c.innerText;
                    break;
                case 'SystemsDefautLayout': // not a typo by alphaTab, this is a typo in the GPIF files.
                    track.defaultSystemsLayout = GpifParser.parseIntSafe(c.innerText, 4);
                    break;
                case 'SystemsLayout':
                    track.systemsLayout = GpifParser.splitSafe(c.innerText).map(i => GpifParser.parseIntSafe(i, 4));
                    break;
                case 'Lyrics':
                    this.parseLyrics(trackId, c);
                    break;
                case 'Properties':
                    this.parseTrackProperties(track, c);
                    break;
                case 'GeneralMidi':
                case 'MidiConnection':
                case 'MIDISettings':
                    this.parseGeneralMidi(track, c);
                    break;
                case 'Sounds':
                    this.parseSounds(trackId, track, c);
                    break;
                case 'PlaybackState':
                    const state: string = c.innerText;
                    track.playbackInfo.isSolo = state === 'Solo';
                    track.playbackInfo.isMute = state === 'Mute';
                    break;
                case 'PartSounding':
                    this.parsePartSounding(track, c);
                    break;
                case 'Staves':
                    this.parseStaves(track, c);
                    break;
                case 'Transpose':
                    this.parseTranspose(track, c);
                    break;
                case 'RSE':
                    this.parseRSE(track, c);
                    break;
                case 'Automations':
                    this.parseTrackAutomations(trackId, c);
                    break;
            }
        }
        this._tracksById.set(trackId, track);
    }

    private parseTrackAutomations(trackId: string, c: XmlNode) {
        const trackAutomations = new Map<number, Automation[]>();
        this._automationsPerTrackIdAndBarIndex.set(trackId, trackAutomations);

        const sustainPedals = new Map<number, SustainPedalMarker[]>();
        this._sustainPedalsPerTrackIdAndBarIndex.set(trackId, sustainPedals);

        this.parseAutomations(c, trackAutomations, this._soundsByTrack.get(trackId)!, sustainPedals);
    }

    private parseNotationPatch(track: Track, node: XmlNode) {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'LineCount':
                    const lineCount = GpifParser.parseIntSafe(c.innerText, 5);
                    for (const staff of track.staves) {
                        staff.standardNotationLineCount = lineCount;
                    }
                    break;
                case 'Elements':
                    this.parseElements(track, c);
                    break;
            }
        }
    }

    private parseInstrumentSet(track: Track, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Type':
                    if (c.innerText === 'drumKit') {
                        for (const staff of track.staves) {
                            staff.isPercussion = true;
                        }
                    }
                    break;
                case 'Elements':
                    this.parseElements(track, c);
                    break;
                case 'LineCount':
                    const lineCount = GpifParser.parseIntSafe(c.innerText, 5);
                    for (const staff of track.staves) {
                        staff.standardNotationLineCount = lineCount;
                    }
                    break;
            }
        }
    }
    private parseElements(track: Track, node: XmlNode) {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Element':
                    this.parseElement(track, c);
                    break;
            }
        }
    }

    private parseElement(track: Track, node: XmlNode) {
        const type = node.findChildElement('Type')?.innerText ?? '';
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Name':
                case 'Articulations':
                    this.parseArticulations(track, c, type);
                    break;
            }
        }
    }
    private parseArticulations(track: Track, node: XmlNode, elementType: string) {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Articulation':
                    this.parseArticulation(track, c, elementType);
                    break;
            }
        }
    }

    private parseArticulation(track: Track, node: XmlNode, elementType: string) {
        const articulation = new InstrumentArticulation();
        articulation.outputMidiNumber = -1;
        articulation.elementType = elementType;
        let name = '';
        for (const c of node.childElements()) {
            const txt = c.innerText;
            switch (c.localName) {
                case 'Name':
                    name = c.innerText;
                    break;
                case 'OutputMidiNumber':
                    articulation.outputMidiNumber = GpifParser.parseIntSafe(txt, 0);
                    break;
                case 'TechniqueSymbol':
                    articulation.techniqueSymbol = this.parseTechniqueSymbol(txt);
                    break;
                case 'TechniquePlacement':
                    switch (txt) {
                        case 'outside':
                            articulation.techniqueSymbolPlacement = TextBaseline.Bottom;
                            break;
                        case 'inside':
                            articulation.techniqueSymbolPlacement = TextBaseline.Middle;
                            break;
                        case 'above':
                            articulation.techniqueSymbolPlacement = TextBaseline.Bottom;
                            break;
                        case 'below':
                            articulation.techniqueSymbolPlacement = TextBaseline.Top;
                            break;
                    }
                    break;
                case 'Noteheads':
                    const noteHeadsTxt = GpifParser.splitSafe(txt);
                    if (noteHeadsTxt.length >= 1) {
                        articulation.noteHeadDefault = this.parseNoteHead(noteHeadsTxt[0]);
                    }
                    if (noteHeadsTxt.length >= 2) {
                        articulation.noteHeadHalf = this.parseNoteHead(noteHeadsTxt[1]);
                    }
                    if (noteHeadsTxt.length >= 3) {
                        articulation.noteHeadWhole = this.parseNoteHead(noteHeadsTxt[2]);
                    }

                    if (articulation.noteHeadHalf === MusicFontSymbol.None) {
                        articulation.noteHeadHalf = articulation.noteHeadDefault;
                    }

                    if (articulation.noteHeadWhole === MusicFontSymbol.None) {
                        articulation.noteHeadWhole = articulation.noteHeadDefault;
                    }

                    break;
                case 'StaffLine':
                    articulation.staffLine = GpifParser.parseIntSafe(txt, 0);
                    break;
            }
        }

        if (articulation.outputMidiNumber !== -1) {
            track.percussionArticulations.push(articulation);
            if (name.length > 0) {
                this._articulationByName.set(name, articulation);
            }
        } else if (name.length > 0 && this._articulationByName.has(name)) {
            this._articulationByName.get(name)!.staffLine = articulation.staffLine;
        }
    }

    private parseTechniqueSymbol(txt: string): MusicFontSymbol {
        switch (txt) {
            case 'pictEdgeOfCymbal':
                return MusicFontSymbol.PictEdgeOfCymbal;
            case 'articStaccatoAbove':
                return MusicFontSymbol.ArticStaccatoAbove;
            case 'noteheadParenthesis':
                return MusicFontSymbol.NoteheadParenthesis;
            case 'stringsUpBow':
                return MusicFontSymbol.StringsUpBow;
            case 'stringsDownBow':
                return MusicFontSymbol.StringsDownBow;
            case 'guitarGolpe':
                return MusicFontSymbol.GuitarGolpe;
            default:
                return MusicFontSymbol.None;
        }
    }

    private parseNoteHead(txt: string): MusicFontSymbol {
        switch (txt) {
            case 'noteheadDoubleWholeSquare':
                return MusicFontSymbol.NoteheadDoubleWholeSquare;
            case 'noteheadDoubleWhole':
                return MusicFontSymbol.NoteheadDoubleWhole;
            case 'noteheadWhole':
                return MusicFontSymbol.NoteheadWhole;
            case 'noteheadHalf':
                return MusicFontSymbol.NoteheadHalf;
            case 'noteheadBlack':
                return MusicFontSymbol.NoteheadBlack;
            case 'noteheadNull':
                return MusicFontSymbol.NoteheadNull;
            case 'noteheadXOrnate':
                return MusicFontSymbol.NoteheadXOrnate;
            case 'noteheadTriangleUpWhole':
                return MusicFontSymbol.NoteheadTriangleUpWhole;
            case 'noteheadTriangleUpHalf':
                return MusicFontSymbol.NoteheadTriangleUpHalf;
            case 'noteheadTriangleUpBlack':
                return MusicFontSymbol.NoteheadTriangleUpBlack;
            case 'noteheadDiamondBlackWide':
                return MusicFontSymbol.NoteheadDiamondBlackWide;
            case 'noteheadDiamondWhite':
                return MusicFontSymbol.NoteheadDiamondWhite;
            case 'noteheadDiamondWhiteWide':
                return MusicFontSymbol.NoteheadDiamondWhiteWide;
            case 'noteheadCircleX':
                return MusicFontSymbol.NoteheadCircleX;
            case 'noteheadXWhole':
                return MusicFontSymbol.NoteheadXWhole;
            case 'noteheadXHalf':
                return MusicFontSymbol.NoteheadXHalf;
            case 'noteheadXBlack':
                return MusicFontSymbol.NoteheadXBlack;
            case 'noteheadParenthesis':
                return MusicFontSymbol.NoteheadParenthesis;
            case 'noteheadSlashedBlack2':
                return MusicFontSymbol.NoteheadSlashedBlack2;
            case 'noteheadCircleSlash':
                return MusicFontSymbol.NoteheadCircleSlash;
            case 'noteheadHeavyX':
                return MusicFontSymbol.NoteheadHeavyX;
            case 'noteheadHeavyXHat':
                return MusicFontSymbol.NoteheadHeavyXHat;
            default:
                Logger.warning('GPIF', 'Unknown notehead symbol', txt);
                return MusicFontSymbol.None;
        }
    }

    private parseStaves(track: Track, node: XmlNode): void {
        let staffIndex: number = 0;
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Staff':
                    track.ensureStaveCount(staffIndex + 1);
                    const staff: Staff = track.staves[staffIndex];
                    this.parseStaff(staff, c);
                    staffIndex++;
                    break;
            }
        }
    }

    private parseStaff(staff: Staff, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Properties':
                    this.parseStaffProperties(staff, c);
                    break;
            }
        }
    }

    private parseStaffProperties(staff: Staff, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Property':
                    this.parseStaffProperty(staff, c);
                    break;
            }
        }
    }

    private parseStaffProperty(staff: Staff, node: XmlNode): void {
        const propertyName: string = node.getAttribute('name');
        switch (propertyName) {
            case 'Tuning':
                for (const c of node.childElements()) {
                    switch (c.localName) {
                        case 'Pitches':
                            const tuningParts: string[] = GpifParser.splitSafe(
                                node.findChildElement('Pitches')?.innerText
                            );
                            const tuning = new Array<number>(tuningParts.length);
                            for (let i: number = 0; i < tuning.length; i++) {
                                tuning[tuning.length - 1 - i] = GpifParser.parseIntSafe(tuningParts[i], 0);
                            }
                            staff.stringTuning.tunings = tuning;
                            break;
                        case 'Label':
                            staff.stringTuning.name = c.innerText;
                            break;
                    }
                }

                if (!staff.isPercussion) {
                    staff.showTablature = true;
                }

                break;
            case 'DiagramCollection':
            case 'ChordCollection':
                this.parseDiagramCollectionForStaff(staff, node);
                break;
            case 'CapoFret':
                const capo: number = GpifParser.parseIntSafe(node.findChildElement('Fret')?.innerText, 0);
                staff.capo = capo;
                break;
        }
    }

    private parseLyrics(trackId: string, node: XmlNode): void {
        const tracks: Lyrics[] = [];
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Line':
                    tracks.push(this.parseLyricsLine(c));
                    break;
            }
        }
        this._lyricsByTrack.set(trackId, tracks);
    }

    private parseLyricsLine(node: XmlNode): Lyrics {
        const lyrics: Lyrics = new Lyrics();
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Offset':
                    lyrics.startBar = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
                case 'Text':
                    lyrics.text = c.innerText;
                    break;
            }
        }
        return lyrics;
    }

    private parseDiagramCollectionForTrack(track: Track, node: XmlNode): void {
        const items = node.findChildElement('Items');
        if (items) {
            for (const c of items.childElements()) {
                switch (c.localName) {
                    case 'Item':
                        this.parseDiagramItemForTrack(track, c);
                        break;
                }
            }
        }
    }

    private parseDiagramCollectionForStaff(staff: Staff, node: XmlNode): void {
        const items = node.findChildElement('Items');
        if (items) {
            for (const c of items.childElements()) {
                switch (c.localName) {
                    case 'Item':
                        this.parseDiagramItemForStaff(staff, c);
                        break;
                }
            }
        }
    }

    private parseDiagramItemForTrack(track: Track, node: XmlNode): void {
        const chord: Chord = new Chord();
        const chordId: string = node.getAttribute('id');
        for (const staff of track.staves) {
            staff.addChord(chordId, chord);
        }
        this.parseDiagramItemForChord(chord, node);
    }

    private parseDiagramItemForStaff(staff: Staff, node: XmlNode): void {
        const chord: Chord = new Chord();
        const chordId: string = node.getAttribute('id');
        staff.addChord(chordId, chord);
        this.parseDiagramItemForChord(chord, node);
    }

    private parseDiagramItemForChord(chord: Chord, node: XmlNode): void {
        chord.name = node.getAttribute('name');

        const diagram = node.findChildElement('Diagram');
        if (!diagram) {
            chord.showDiagram = false;
            chord.showFingering = false;
            return;
        }
        const stringCount: number = GpifParser.parseIntSafe(diagram.getAttribute('stringCount'), 6);
        const baseFret: number = GpifParser.parseIntSafe(diagram.getAttribute('baseFret'), 0);
        chord.firstFret = baseFret + 1;
        for (let i: number = 0; i < stringCount; i++) {
            chord.strings.push(-1);
        }
        for (const c of diagram.childElements()) {
            switch (c.localName) {
                case 'Fret':
                    const guitarString: number = GpifParser.parseIntSafe(c.getAttribute('string'), 0);
                    chord.strings[stringCount - guitarString - 1] =
                        baseFret + GpifParser.parseIntSafe(c.getAttribute('fret'), 0);
                    break;
                case 'Fingering':
                    const existingFingers: Map<Fingers, boolean> = new Map<Fingers, boolean>();
                    for (const p of c.childElements()) {
                        switch (p.localName) {
                            case 'Position':
                                let finger: Fingers = Fingers.Unknown;
                                const fret: number = baseFret + GpifParser.parseIntSafe(p.getAttribute('fret'), 0);
                                switch (p.getAttribute('finger')) {
                                    case 'Index':
                                        finger = Fingers.IndexFinger;
                                        break;
                                    case 'Middle':
                                        finger = Fingers.MiddleFinger;
                                        break;
                                    case 'Rank':
                                        finger = Fingers.AnnularFinger;
                                        break;
                                    case 'Pinky':
                                        finger = Fingers.LittleFinger;
                                        break;
                                    case 'Thumb':
                                        finger = Fingers.Thumb;
                                        break;
                                    case 'None':
                                        break;
                                }
                                if (finger !== Fingers.Unknown) {
                                    if (existingFingers.has(finger)) {
                                        chord.barreFrets.push(fret);
                                    } else {
                                        existingFingers.set(finger, true);
                                    }
                                }
                                break;
                        }
                    }
                    break;
                case 'Property':
                    switch (c.getAttribute('name')) {
                        case 'ShowName':
                            chord.showName = c.getAttribute('value') === 'true';
                            break;
                        case 'ShowDiagram':
                            chord.showDiagram = c.getAttribute('value') === 'true';
                            break;
                        case 'ShowFingering':
                            chord.showFingering = c.getAttribute('value') === 'true';
                            break;
                    }
                    break;
            }
        }
    }

    private parseTrackProperties(track: Track, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Property':
                    this.parseTrackProperty(track, c);
                    break;
            }
        }
    }

    private parseTrackProperty(track: Track, node: XmlNode): void {
        const propertyName: string = node.getAttribute('name');
        switch (propertyName) {
            case 'Tuning':
                const tuningParts: string[] = GpifParser.splitSafe(node.findChildElement('Pitches')?.innerText);
                const tuning = new Array<number>(tuningParts.length);
                for (let i: number = 0; i < tuning.length; i++) {
                    tuning[tuning.length - 1 - i] = GpifParser.parseIntSafe(tuningParts[i], 0);
                }
                for (const staff of track.staves) {
                    staff.stringTuning.tunings = tuning;
                    staff.showStandardNotation = true;
                    staff.showTablature = true;
                }
                break;
            case 'DiagramCollection':
            case 'ChordCollection':
                this.parseDiagramCollectionForTrack(track, node);
                break;
            case 'CapoFret':
                const capo: number = GpifParser.parseIntSafe(node.findChildElement('Fret')?.innerText, 0);
                for (const staff of track.staves) {
                    staff.capo = capo;
                }
                break;
        }
    }

    private parseGeneralMidi(track: Track, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Program':
                    track.playbackInfo.program = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
                case 'Port':
                    track.playbackInfo.port = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
                case 'PrimaryChannel':
                    track.playbackInfo.primaryChannel = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
                case 'SecondaryChannel':
                    track.playbackInfo.secondaryChannel = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
            }
        }
        const isPercussion: boolean = node.getAttribute('table') === 'Percussion';
        if (isPercussion) {
            for (const staff of track.staves) {
                staff.isPercussion = true;
            }
        }
    }

    private parseSounds(trackId: string, track: Track, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Sound':
                    this.parseSound(trackId, track, c);
                    break;
            }
        }
    }

    private parseSound(trackId: string, track: Track, node: XmlNode): void {
        const sound = new GpifSound();
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Name':
                    sound.name = c.innerText;
                    break;
                case 'Path':
                    sound.path = c.innerText;
                    break;
                case 'Role':
                    sound.role = c.innerText;
                    break;
                case 'MIDI':
                    this.parseSoundMidi(sound, c);
                    break;
            }
        }

        if (sound.role === 'Factory' || track.playbackInfo.program === 0) {
            track.playbackInfo.program = sound.program;
        }

        if (!this._soundsByTrack.has(trackId)) {
            this._soundsByTrack.set(trackId, new Map<string, GpifSound>());
        }

        this._soundsByTrack.get(trackId)!.set(sound.uniqueId, sound);
    }

    private parseSoundMidi(sound: GpifSound, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Program':
                    sound.program = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
            }
        }
    }

    private parsePartSounding(track: Track, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'TranspositionPitch':
                    for (const staff of track.staves) {
                        staff.displayTranspositionPitch = GpifParser.parseIntSafe(c.innerText, 0);
                    }
                    break;
            }
        }
    }

    private parseTranspose(track: Track, node: XmlNode): void {
        let octave: number = 0;
        let chromatic: number = 0;
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Chromatic':
                    chromatic = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
                case 'Octave':
                    octave = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
            }
        }
        for (const staff of track.staves) {
            staff.displayTranspositionPitch = octave * 12 + chromatic;
        }
    }

    private parseRSE(track: Track, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'ChannelStrip':
                    this.parseChannelStrip(track, c);
                    break;
            }
        }
    }

    private parseChannelStrip(track: Track, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Parameters':
                    this.parseChannelStripParameters(track, c);
                    break;
            }
        }
    }

    private parseChannelStripParameters(track: Track, node: XmlNode): void {
        if (node.firstChild && node.firstChild.value) {
            const parameters = GpifParser.splitSafe(node.firstChild.value);
            if (parameters.length >= 12) {
                track.playbackInfo.balance = Math.floor(GpifParser.parseFloatSafe(parameters[11], 0.5) * 16);
                track.playbackInfo.volume = Math.floor(GpifParser.parseFloatSafe(parameters[12], 0.9) * 16);
            }
        }
    }

    //
    // <MasterBars>...</MasterBars>
    //
    private parseMasterBarsNode(node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'MasterBar':
                    this.parseMasterBar(c);
                    break;
            }
        }
    }

    private parseMasterBar(node: XmlNode): void {
        const masterBar: MasterBar = new MasterBar();
        if (this._masterBars.length === 0 && this._hasAnacrusis) {
            masterBar.isAnacrusis = true;
        }
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Time':
                    const timeParts: string[] = c.innerText.split('/');
                    masterBar.timeSignatureNumerator = GpifParser.parseIntSafe(timeParts[0], 4);
                    masterBar.timeSignatureDenominator = GpifParser.parseIntSafe(timeParts[1], 4);
                    break;
                case 'FreeTime':
                    masterBar.isFreeTime = true;
                    break;
                case 'DoubleBar':
                    masterBar.isDoubleBar = true;
                    this._doubleBars.add(masterBar);
                    break;
                case 'Section':
                    masterBar.section = new Section();
                    masterBar.section.marker = c.findChildElement('Letter')?.innerText ?? '';
                    masterBar.section.text = c.findChildElement('Text')?.innerText ?? '';
                    break;
                case 'Repeat':
                    if (c.getAttribute('start').toLowerCase() === 'true') {
                        masterBar.isRepeatStart = true;
                    }
                    if (c.getAttribute('end').toLowerCase() === 'true' && c.getAttribute('count')) {
                        masterBar.repeatCount = GpifParser.parseIntSafe(c.getAttribute('count'), 1);
                    }
                    break;
                case 'AlternateEndings':
                    const alternateEndings: string[] = GpifParser.splitSafe(c.innerText);
                    let i: number = 0;
                    for (let k: number = 0; k < alternateEndings.length; k++) {
                        i = i | (1 << (-1 + GpifParser.parseIntSafe(alternateEndings[k], 0)));
                    }
                    masterBar.alternateEndings = i;
                    break;
                case 'Bars':
                    this._barsOfMasterBar.push(GpifParser.splitSafe(c.innerText));
                    break;
                case 'TripletFeel':
                    switch (c.innerText) {
                        case 'NoTripletFeel':
                            masterBar.tripletFeel = TripletFeel.NoTripletFeel;
                            break;
                        case 'Triplet8th':
                            masterBar.tripletFeel = TripletFeel.Triplet8th;
                            break;
                        case 'Triplet16th':
                            masterBar.tripletFeel = TripletFeel.Triplet16th;
                            break;
                        case 'Dotted8th':
                            masterBar.tripletFeel = TripletFeel.Dotted8th;
                            break;
                        case 'Dotted16th':
                            masterBar.tripletFeel = TripletFeel.Dotted16th;
                            break;
                        case 'Scottish8th':
                            masterBar.tripletFeel = TripletFeel.Scottish8th;
                            break;
                        case 'Scottish16th':
                            masterBar.tripletFeel = TripletFeel.Scottish16th;
                            break;
                    }
                    break;
                case 'Key':
                    const keySignature = GpifParser.parseIntSafe(
                        c.findChildElement('AccidentalCount')?.innerText,
                        0
                    ) as KeySignature;
                    const mode = c.findChildElement('Mode');
                    let keySignatureType = KeySignatureType.Major;
                    if (mode) {
                        switch (mode.innerText.toLowerCase()) {
                            case 'major':
                                keySignatureType = KeySignatureType.Major;
                                break;
                            case 'minor':
                                keySignatureType = KeySignatureType.Minor;
                                break;
                        }
                    }

                    this._keySignatures.set(this._masterBars.length, [keySignature, keySignatureType]);
                    break;
                case 'Fermatas':
                    this.parseFermatas(masterBar, c);
                    break;
                case 'XProperties':
                    this.parseMasterBarXProperties(masterBar, c);
                    break;
                case 'Directions':
                    this.parseDirections(masterBar, c);
                    break;
            }
        }
        this._masterBars.push(masterBar);
    }

    private parseDirections(masterBar: MasterBar, node: XmlNode) {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Target':
                    switch (c.innerText) {
                        case 'Coda':
                            masterBar.addDirection(Direction.TargetCoda);
                            break;
                        case 'DoubleCoda':
                            masterBar.addDirection(Direction.TargetDoubleCoda);
                            break;
                        case 'Segno':
                            masterBar.addDirection(Direction.TargetSegno);
                            break;
                        case 'SegnoSegno':
                            masterBar.addDirection(Direction.TargetSegnoSegno);
                            break;
                        case 'Fine':
                            masterBar.addDirection(Direction.TargetFine);
                            break;
                    }
                    break;
                case 'Jump':
                    switch (c.innerText) {
                        case 'DaCapo':
                            masterBar.addDirection(Direction.JumpDaCapo);
                            break;
                        case 'DaCapoAlCoda':
                            masterBar.addDirection(Direction.JumpDaCapoAlCoda);
                            break;
                        case 'DaCapoAlDoubleCoda':
                            masterBar.addDirection(Direction.JumpDaCapoAlDoubleCoda);
                            break;
                        case 'DaCapoAlFine':
                            masterBar.addDirection(Direction.JumpDaCapoAlFine);
                            break;

                        // Note: no typo on our side, GPIF has wrongly "DaSegno" instead of "DalSegno"
                        case 'DaSegno':
                            masterBar.addDirection(Direction.JumpDalSegno);
                            break;
                        case 'DaSegnoAlCoda':
                            masterBar.addDirection(Direction.JumpDalSegnoAlCoda);
                            break;
                        case 'DaSegnoAlDoubleCoda':
                            masterBar.addDirection(Direction.JumpDalSegnoAlDoubleCoda);
                            break;
                        case 'DaSegnoAlFine':
                            masterBar.addDirection(Direction.JumpDalSegnoAlFine);
                            break;

                        case 'DaSegnoSegno':
                            masterBar.addDirection(Direction.JumpDalSegnoSegno);
                            break;
                        case 'DaSegnoSegnoAlCoda':
                            masterBar.addDirection(Direction.JumpDalSegnoSegnoAlCoda);
                            break;
                        case 'DaSegnoSegnoAlDoubleCoda':
                            masterBar.addDirection(Direction.JumpDalSegnoSegnoAlDoubleCoda);
                            break;
                        case 'DaSegnoSegnoAlFine':
                            masterBar.addDirection(Direction.JumpDalSegnoSegnoAlFine);
                            break;

                        case 'DaCoda':
                            masterBar.addDirection(Direction.JumpDaCoda);
                            break;
                        case 'DaDoubleCoda':
                            masterBar.addDirection(Direction.JumpDaDoubleCoda);
                            break;
                    }
                    break;
            }
        }
    }

    private parseFermatas(masterBar: MasterBar, node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Fermata':
                    this.parseFermata(masterBar, c);
                    break;
            }
        }
    }

    private parseFermata(masterBar: MasterBar, node: XmlNode): void {
        let offset: number = 0;
        const fermata: Fermata = new Fermata();
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Type':
                    switch (c.innerText) {
                        case 'Short':
                            fermata.type = FermataType.Short;
                            break;
                        case 'Medium':
                            fermata.type = FermataType.Medium;
                            break;
                        case 'Long':
                            fermata.type = FermataType.Long;
                            break;
                    }
                    break;
                case 'Length':
                    fermata.length = GpifParser.parseFloatSafe(c.innerText, 0);
                    break;
                case 'Offset':
                    const parts: string[] = c.innerText.split('/');
                    if (parts.length === 2) {
                        const numerator: number = GpifParser.parseIntSafe(parts[0], 4);
                        const denominator: number = GpifParser.parseIntSafe(parts[1], 4);
                        offset = ((numerator / denominator) * MidiUtils.QuarterTime) | 0;
                    }
                    break;
            }
        }
        masterBar.addFermata(offset, fermata);
    }

    //
    // <Bars>...</Bars>
    //
    private parseBars(node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Bar':
                    this.parseBar(c);
                    break;
            }
        }
    }

    private parseBar(node: XmlNode): void {
        const bar: Bar = new Bar();
        const barId: string = node.getAttribute('id');
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Voices':
                    this._voicesOfBar.set(barId, GpifParser.splitSafe(c.innerText));
                    break;
                case 'Clef':
                    switch (c.innerText) {
                        case 'Neutral':
                            bar.clef = Clef.Neutral;
                            break;
                        case 'G2':
                            bar.clef = Clef.G2;
                            break;
                        case 'F4':
                            bar.clef = Clef.F4;
                            break;
                        case 'C4':
                            bar.clef = Clef.C4;
                            break;
                        case 'C3':
                            bar.clef = Clef.C3;
                            break;
                    }
                    break;
                case 'Ottavia':
                    switch (c.innerText) {
                        case '8va':
                            bar.clefOttava = Ottavia._8va;
                            break;
                        case '15ma':
                            bar.clefOttava = Ottavia._15ma;
                            break;
                        case '8vb':
                            bar.clefOttava = Ottavia._8vb;
                            break;
                        case '15mb':
                            bar.clefOttava = Ottavia._15mb;
                            break;
                    }
                    break;
                case 'SimileMark':
                    switch (c.innerText) {
                        case 'Simple':
                            bar.simileMark = SimileMark.Simple;
                            break;
                        case 'FirstOfDouble':
                            bar.simileMark = SimileMark.FirstOfDouble;
                            break;
                        case 'SecondOfDouble':
                            bar.simileMark = SimileMark.SecondOfDouble;
                            break;
                    }
                    break;
                case 'XProperties':
                    this.parseBarXProperties(c, bar);
                    break;
            }
        }
        this._barsById.set(barId, bar);
    }

    //
    // <Voices>...</Voices>
    //
    private parseVoices(node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Voice':
                    this.parseVoice(c);
                    break;
            }
        }
    }

    private parseVoice(node: XmlNode): void {
        const voice: Voice = new Voice();
        const voiceId: string = node.getAttribute('id');
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Beats':
                    this._beatsOfVoice.set(voiceId, GpifParser.splitSafe(c.innerText));
                    break;
            }
        }
        this._voiceById.set(voiceId, voice);
    }

    //
    // <Beats>...</Beats>
    //
    private parseBeats(node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Beat':
                    this.parseBeat(c);
                    break;
            }
        }
    }

    private parseBeat(node: XmlNode): void {
        const beat: Beat = new Beat();
        const beatId: string = node.getAttribute('id');
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Notes':
                    this._notesOfBeat.set(beatId, GpifParser.splitSafe(c.innerText));
                    break;
                case 'Rhythm':
                    this._rhythmOfBeat.set(beatId, c.getAttribute('ref'));
                    break;
                case 'Fadding':
                    switch (c.innerText) {
                        case 'FadeIn':
                            beat.fade = FadeType.FadeIn;
                            break;
                        case 'FadeOut':
                            beat.fade = FadeType.FadeOut;
                            break;
                        case 'VolumeSwell':
                            beat.fade = FadeType.VolumeSwell;
                            break;
                    }
                    break;
                case 'Tremolo':
                    switch (c.innerText) {
                        case '1/2':
                            beat.tremoloSpeed = Duration.Eighth;
                            break;
                        case '1/4':
                            beat.tremoloSpeed = Duration.Sixteenth;
                            break;
                        case '1/8':
                            beat.tremoloSpeed = Duration.ThirtySecond;
                            break;
                    }
                    break;
                case 'Chord':
                    beat.chordId = c.innerText;
                    break;
                case 'Hairpin':
                    switch (c.innerText) {
                        case 'Crescendo':
                            beat.crescendo = CrescendoType.Crescendo;
                            break;
                        case 'Decrescendo':
                            beat.crescendo = CrescendoType.Decrescendo;
                            break;
                    }
                    break;
                case 'Arpeggio':
                    if (c.innerText === 'Up') {
                        beat.brushType = BrushType.ArpeggioUp;
                    } else {
                        beat.brushType = BrushType.ArpeggioDown;
                    }
                    break;
                case 'Properties':
                    this.parseBeatProperties(c, beat);
                    break;
                case 'XProperties':
                    this.parseBeatXProperties(c, beat);
                    break;
                case 'FreeText':
                    beat.text = c.innerText;
                    break;
                case 'TransposedPitchStemOrientation':
                    switch (c.innerText) {
                        case 'Upward':
                            beat.preferredBeamDirection = BeamDirection.Up;
                            break;
                        case 'Downward':
                            beat.preferredBeamDirection = BeamDirection.Down;
                            break;
                    }
                    break;
                case 'Dynamic':
                    switch (c.innerText) {
                        case 'PPP':
                            beat.dynamics = DynamicValue.PPP;
                            break;
                        case 'PP':
                            beat.dynamics = DynamicValue.PP;
                            break;
                        case 'P':
                            beat.dynamics = DynamicValue.P;
                            break;
                        case 'MP':
                            beat.dynamics = DynamicValue.MP;
                            break;
                        case 'MF':
                            beat.dynamics = DynamicValue.MF;
                            break;
                        case 'F':
                            beat.dynamics = DynamicValue.F;
                            break;
                        case 'FF':
                            beat.dynamics = DynamicValue.FF;
                            break;
                        case 'FFF':
                            beat.dynamics = DynamicValue.FFF;
                            break;
                    }
                    break;
                case 'GraceNotes':
                    switch (c.innerText) {
                        case 'OnBeat':
                            beat.graceType = GraceType.OnBeat;
                            break;
                        case 'BeforeBeat':
                            beat.graceType = GraceType.BeforeBeat;
                            break;
                    }
                    break;
                case 'Legato':
                    if (c.getAttribute('origin') === 'true') {
                        beat.isLegatoOrigin = true;
                    }
                    break;
                case 'Whammy':
                    const whammyOrigin: BendPoint = new BendPoint(0, 0);
                    whammyOrigin.value = this.toBendValue(GpifParser.parseFloatSafe(c.getAttribute('originValue'), 0));
                    whammyOrigin.offset = this.toBendOffset(
                        GpifParser.parseFloatSafe(c.getAttribute('originOffset'), 0)
                    );
                    beat.addWhammyBarPoint(whammyOrigin);
                    const whammyMiddle1: BendPoint = new BendPoint(0, 0);
                    whammyMiddle1.value = this.toBendValue(GpifParser.parseFloatSafe(c.getAttribute('middleValue'), 0));
                    whammyMiddle1.offset = this.toBendOffset(
                        GpifParser.parseFloatSafe(c.getAttribute('middleOffset1'), 0)
                    );
                    beat.addWhammyBarPoint(whammyMiddle1);
                    const whammyMiddle2: BendPoint = new BendPoint(0, 0);
                    whammyMiddle2.value = this.toBendValue(GpifParser.parseFloatSafe(c.getAttribute('middleValue'), 0));
                    whammyMiddle2.offset = this.toBendOffset(
                        GpifParser.parseFloatSafe(c.getAttribute('middleOffset2'), 0)
                    );
                    beat.addWhammyBarPoint(whammyMiddle2);
                    const whammyDestination: BendPoint = new BendPoint(0, 0);
                    whammyDestination.value = this.toBendValue(
                        GpifParser.parseFloatSafe(c.getAttribute('destinationValue'), 0)
                    );
                    whammyDestination.offset = this.toBendOffset(
                        GpifParser.parseFloatSafe(c.getAttribute('destinationOffset'), 0)
                    );
                    beat.addWhammyBarPoint(whammyDestination);
                    break;
                case 'Ottavia':
                    switch (c.innerText) {
                        case '8va':
                            beat.ottava = Ottavia._8va;
                            break;
                        case '8vb':
                            beat.ottava = Ottavia._8vb;
                            break;
                        case '15ma':
                            beat.ottava = Ottavia._15ma;
                            break;
                        case '15mb':
                            beat.ottava = Ottavia._15mb;
                            break;
                    }
                    break;
                case 'Lyrics':
                    beat.lyrics = this.parseBeatLyrics(c);
                    this._skipApplyLyrics = true;
                    break;
                case 'Slashed':
                    beat.slashed = true;
                    break;
                case 'DeadSlapped':
                    beat.deadSlapped = true;
                    break;
                case 'Golpe':
                    switch (c.innerText) {
                        case 'Finger':
                            beat.golpe = GolpeType.Finger;
                            break;
                        case 'Thumb':
                            beat.golpe = GolpeType.Thumb;
                            break;
                    }
                    break;
                case 'Wah':
                    switch (c.innerText) {
                        case 'Open':
                            beat.wahPedal = WahPedal.Open;
                            break;
                        case 'Closed':
                            beat.wahPedal = WahPedal.Closed;
                            break;
                    }
                    break;
                case 'UserTransposedPitchStemOrientation':
                    switch (c.innerText) {
                        case 'Downward':
                            beat.preferredBeamDirection = BeamDirection.Down;
                            break;
                        case 'Upward':
                            beat.preferredBeamDirection = BeamDirection.Up;
                            break;
                    }
                    break;
                case 'Timer':
                    beat.showTimer = true;
                    beat.timer = GpifParser.parseIntSafe(c.innerText, -1);
                    if (beat.timer < 0) {
                        beat.timer = null;
                    }
                    break;
            }
        }
        this._beatById.set(beatId, beat);
    }

    private parseBeatLyrics(node: XmlNode): string[] {
        const lines: string[] = [];

        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Line':
                    lines.push(c.innerText);
                    break;
            }
        }

        return lines;
    }

    private parseBeatXProperties(node: XmlNode, beat: Beat): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'XProperty':
                    const id: string = c.getAttribute('id');
                    let value: number = 0;
                    switch (id) {
                        case '1124204546':
                            value = GpifParser.parseIntSafe(c.findChildElement('Int')?.innerText, 0);
                            switch (value) {
                                case 1:
                                    beat.beamingMode = BeatBeamingMode.ForceMergeWithNext;
                                    break;
                                case 2:
                                    beat.beamingMode = BeatBeamingMode.ForceSplitToNext;
                                    break;
                            }
                            break;
                        case '1124204552':
                            value = GpifParser.parseIntSafe(c.findChildElement('Int')?.innerText, 0);
                            switch (value) {
                                case 1:
                                    if (beat.beamingMode !== BeatBeamingMode.ForceSplitToNext) {
                                        beat.beamingMode = BeatBeamingMode.ForceSplitOnSecondaryToNext;
                                    }
                                    break;
                            }
                            break;
                        case '1124204545':
                            value = GpifParser.parseIntSafe(c.findChildElement('Int')?.innerText, 0);
                            beat.invertBeamDirection = value === 1;
                            break;
                        case '687935489':
                            value = GpifParser.parseIntSafe(c.findChildElement('Int')?.innerText, 0);
                            beat.brushDuration = value;
                            break;
                    }
                    break;
            }
        }
    }

    private parseBarXProperties(node: XmlNode, bar: Bar) {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'XProperty':
                    const id: string = c.getAttribute('id');
                    switch (id) {
                        case '1124139520':
                            const childNode = c.findChildElement('Double') ?? c.findChildElement('Float');
                            bar.displayScale = GpifParser.parseFloatSafe(childNode?.innerText, 1);
                            break;
                    }
                    break;
            }
        }
    }

    private parseMasterBarXProperties(masterBar: MasterBar, node: XmlNode) {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'XProperty':
                    const id: string = c.getAttribute('id');
                    switch (id) {
                        case '1124073984':
                            masterBar.displayScale = GpifParser.parseFloatSafe(
                                c.findChildElement('Double')?.innerText,
                                1
                            );
                            break;
                    }
                    break;
            }
        }
    }

    private parseBeatProperties(node: XmlNode, beat: Beat): void {
        let isWhammy: boolean = false;
        let whammyOrigin: BendPoint | null = null;
        let whammyMiddleValue: number | null = null;
        let whammyMiddleOffset1: number | null = null;
        let whammyMiddleOffset2: number | null = null;
        let whammyDestination: BendPoint | null = null;
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Property':
                    const name: string = c.getAttribute('name');
                    switch (name) {
                        case 'Brush':
                            if (c.findChildElement('Direction')?.innerText === 'Up') {
                                beat.brushType = BrushType.BrushUp;
                            } else {
                                beat.brushType = BrushType.BrushDown;
                            }
                            break;
                        case 'PickStroke':
                            if (c.findChildElement('Direction')?.innerText === 'Up') {
                                beat.pickStroke = PickStroke.Up;
                            } else {
                                beat.pickStroke = PickStroke.Down;
                            }
                            break;
                        case 'Slapped':
                            if (c.findChildElement('Enable')) {
                                beat.slap = true;
                            }
                            break;
                        case 'Popped':
                            if (c.findChildElement('Enable')) {
                                beat.pop = true;
                            }
                            break;
                        case 'VibratoWTremBar':
                            switch (c.findChildElement('Strength')?.innerText) {
                                case 'Wide':
                                    beat.vibrato = VibratoType.Wide;
                                    break;
                                case 'Slight':
                                    beat.vibrato = VibratoType.Slight;
                                    break;
                            }
                            break;
                        case 'WhammyBar':
                            isWhammy = true;
                            break;
                        case 'WhammyBarExtend':
                            // not clear what this is used for
                            break;
                        case 'WhammyBarOriginValue':
                            if (!whammyOrigin) {
                                whammyOrigin = new BendPoint(0, 0);
                            }
                            whammyOrigin.value = this.toBendValue(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'WhammyBarOriginOffset':
                            if (!whammyOrigin) {
                                whammyOrigin = new BendPoint(0, 0);
                            }
                            whammyOrigin.offset = this.toBendOffset(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'WhammyBarMiddleValue':
                            whammyMiddleValue = this.toBendValue(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'WhammyBarMiddleOffset1':
                            whammyMiddleOffset1 = this.toBendOffset(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'WhammyBarMiddleOffset2':
                            whammyMiddleOffset2 = this.toBendOffset(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'WhammyBarDestinationValue':
                            if (!whammyDestination) {
                                whammyDestination = new BendPoint(BendPoint.MaxPosition, 0);
                            }
                            whammyDestination.value = this.toBendValue(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'WhammyBarDestinationOffset':
                            if (!whammyDestination) {
                                whammyDestination = new BendPoint(0, 0);
                            }
                            whammyDestination.offset = this.toBendOffset(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'BarreFret':
                            beat.barreFret = GpifParser.parseIntSafe(c.findChildElement('Fret')?.innerText, 0);
                            break;
                        case 'BarreString':
                            switch (c.findChildElement('String')?.innerText) {
                                case '0':
                                    beat.barreShape = BarreShape.Full;
                                    break;
                                case '1':
                                    beat.barreShape = BarreShape.Half;
                                    break;
                            }
                            break;
                        case 'Rasgueado':
                            switch (c.findChildElement('Rasgueado')?.innerText) {
                                case 'ii_1':
                                    beat.rasgueado = Rasgueado.Ii;
                                    break;
                                case 'mi_1':
                                    beat.rasgueado = Rasgueado.Mi;
                                    break;
                                case 'mii_1':
                                    beat.rasgueado = Rasgueado.MiiTriplet;
                                    break;
                                case 'mii_2':
                                    beat.rasgueado = Rasgueado.MiiAnapaest;
                                    break;
                                case 'pmp_1':
                                    beat.rasgueado = Rasgueado.PmpTriplet;
                                    break;
                                case 'pmp_2':
                                    beat.rasgueado = Rasgueado.PmpAnapaest;
                                    break;
                                case 'pei_1':
                                    beat.rasgueado = Rasgueado.PeiTriplet;
                                    break;
                                case 'pei_2':
                                    beat.rasgueado = Rasgueado.PeiAnapaest;
                                    break;
                                case 'pai_1':
                                    beat.rasgueado = Rasgueado.PaiTriplet;
                                    break;
                                case 'pai_2':
                                    beat.rasgueado = Rasgueado.PaiAnapaest;
                                    break;
                                case 'ami_1':
                                    beat.rasgueado = Rasgueado.AmiTriplet;
                                    break;
                                case 'ami_2':
                                    beat.rasgueado = Rasgueado.AmiAnapaest;
                                    break;
                                case 'ppp_1':
                                    beat.rasgueado = Rasgueado.Ppp;
                                    break;
                                case 'amii_1':
                                    beat.rasgueado = Rasgueado.Amii;
                                    break;
                                case 'amip_1':
                                    beat.rasgueado = Rasgueado.Amip;
                                    break;
                                case 'eami_1':
                                    beat.rasgueado = Rasgueado.Eami;
                                    break;
                                case 'eamii_1':
                                    beat.rasgueado = Rasgueado.Eamii;
                                    break;
                                case 'peami_1':
                                    beat.rasgueado = Rasgueado.Peami;
                                    break;
                            }
                            break;
                    }
                    break;
            }
        }
        if (isWhammy) {
            if (!whammyOrigin) {
                whammyOrigin = new BendPoint(0, 0);
            }
            if (!whammyDestination) {
                whammyDestination = new BendPoint(BendPoint.MaxPosition, 0);
            }
            beat.addWhammyBarPoint(whammyOrigin);
            if (whammyMiddleOffset1 && whammyMiddleValue) {
                beat.addWhammyBarPoint(new BendPoint(whammyMiddleOffset1, whammyMiddleValue));
            }
            if (whammyMiddleOffset2 && whammyMiddleValue) {
                beat.addWhammyBarPoint(new BendPoint(whammyMiddleOffset2, whammyMiddleValue));
            }
            if (!whammyMiddleOffset1 && !whammyMiddleOffset2 && whammyMiddleValue) {
                beat.addWhammyBarPoint(new BendPoint((BendPoint.MaxPosition / 2) | 0, whammyMiddleValue));
            }
            beat.addWhammyBarPoint(whammyDestination);
        }
    }

    //
    // <Notes>...</Notes>
    //
    private parseNotes(node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Note':
                    this.parseNote(c);
                    break;
            }
        }
    }

    private parseNote(node: XmlNode): void {
        const note: Note = new Note();
        const noteId: string = node.getAttribute('id');
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Properties':
                    this.parseNoteProperties(c, note, noteId);
                    break;
                case 'AntiAccent':
                    if (c.innerText.toLowerCase() === 'normal') {
                        note.isGhost = true;
                    }
                    break;
                case 'LetRing':
                    note.isLetRing = true;
                    break;
                case 'Trill':
                    note.trillValue = GpifParser.parseIntSafe(c.innerText, -1);
                    note.trillSpeed = Duration.Sixteenth;
                    break;
                case 'Accent':
                    const accentFlags: number = GpifParser.parseIntSafe(c.innerText, 0);
                    if ((accentFlags & 0x01) !== 0) {
                        note.isStaccato = true;
                    }
                    if ((accentFlags & 0x04) !== 0) {
                        note.accentuated = AccentuationType.Heavy;
                    }
                    if ((accentFlags & 0x08) !== 0) {
                        note.accentuated = AccentuationType.Normal;
                    }
                    if ((accentFlags & 0x10) !== 0) {
                        note.accentuated = AccentuationType.Tenuto;
                    }
                    break;
                case 'Tie':
                    if (c.getAttribute('destination').toLowerCase() === 'true') {
                        note.isTieDestination = true;
                    }
                    break;
                case 'Vibrato':
                    switch (c.innerText) {
                        case 'Slight':
                            note.vibrato = VibratoType.Slight;
                            break;
                        case 'Wide':
                            note.vibrato = VibratoType.Wide;
                            break;
                    }
                    break;
                case 'LeftFingering':
                    switch (c.innerText) {
                        case 'P':
                            note.leftHandFinger = Fingers.Thumb;
                            break;
                        case 'I':
                            note.leftHandFinger = Fingers.IndexFinger;
                            break;
                        case 'M':
                            note.leftHandFinger = Fingers.MiddleFinger;
                            break;
                        case 'A':
                            note.leftHandFinger = Fingers.AnnularFinger;
                            break;
                        case 'C':
                            note.leftHandFinger = Fingers.LittleFinger;
                            break;
                    }
                    break;
                case 'RightFingering':
                    switch (c.innerText) {
                        case 'P':
                            note.rightHandFinger = Fingers.Thumb;
                            break;
                        case 'I':
                            note.rightHandFinger = Fingers.IndexFinger;
                            break;
                        case 'M':
                            note.rightHandFinger = Fingers.MiddleFinger;
                            break;
                        case 'A':
                            note.rightHandFinger = Fingers.AnnularFinger;
                            break;
                        case 'C':
                            note.rightHandFinger = Fingers.LittleFinger;
                            break;
                    }
                    break;
                case 'InstrumentArticulation':
                    note.percussionArticulation = GpifParser.parseIntSafe(c.innerText, 0);
                    break;
                case 'Ornament':
                    switch (c.innerText) {
                        case 'Turn':
                            note.ornament = NoteOrnament.Turn;
                            break;
                        case 'InvertedTurn':
                            note.ornament = NoteOrnament.InvertedTurn;
                            break;
                        case 'UpperMordent':
                            note.ornament = NoteOrnament.UpperMordent;
                            break;
                        case 'LowerMordent':
                            note.ornament = NoteOrnament.LowerMordent;
                            break;
                    }
                    break;
            }
        }
        this._noteById.set(noteId, note);
    }

    private parseNoteProperties(node: XmlNode, note: Note, noteId: string): void {
        let isBended: boolean = false;
        let bendOrigin: BendPoint | null = null;
        let bendMiddleValue: number | null = null;
        let bendMiddleOffset1: number | null = null;
        let bendMiddleOffset2: number | null = null;
        let bendDestination: BendPoint | null = null;

        // GP6 had percussion as element+variation
        let element: number = -1;
        let variation: number = -1;
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Property':
                    const name: string = c.getAttribute('name');
                    switch (name) {
                        case 'ShowStringNumber':
                            if (c.findChildElement('Enable')) {
                                note.showStringNumber = true;
                            }
                            break;
                        case 'String':
                            note.string = GpifParser.parseIntSafe(c.findChildElement('String')?.innerText, 0) + 1;
                            break;
                        case 'Fret':
                            note.fret = GpifParser.parseIntSafe(c.findChildElement('Fret')?.innerText, 0);
                            break;
                        case 'Element':
                            element = GpifParser.parseIntSafe(c.findChildElement('Element')?.innerText, 0);
                            break;
                        case 'Variation':
                            variation = GpifParser.parseIntSafe(c.findChildElement('Variation')?.innerText, 0);
                            break;
                        case 'Tapped':
                            this._tappedNotes.set(noteId, true);
                            break;
                        case 'HarmonicType':
                            const htype = c.findChildElement('HType');
                            if (htype) {
                                switch (htype.innerText) {
                                    case 'NoHarmonic':
                                        note.harmonicType = HarmonicType.None;
                                        break;
                                    case 'Natural':
                                        note.harmonicType = HarmonicType.Natural;
                                        break;
                                    case 'Artificial':
                                        note.harmonicType = HarmonicType.Artificial;
                                        break;
                                    case 'Pinch':
                                        note.harmonicType = HarmonicType.Pinch;
                                        break;
                                    case 'Tap':
                                        note.harmonicType = HarmonicType.Tap;
                                        break;
                                    case 'Semi':
                                        note.harmonicType = HarmonicType.Semi;
                                        break;
                                    case 'Feedback':
                                        note.harmonicType = HarmonicType.Feedback;
                                        break;
                                }
                            }
                            break;
                        case 'HarmonicFret':
                            const hfret = c.findChildElement('HFret');
                            if (hfret) {
                                note.harmonicValue = GpifParser.parseFloatSafe(hfret.innerText, 0);
                            }
                            break;
                        case 'Muted':
                            if (c.findChildElement('Enable')) {
                                note.isDead = true;
                            }
                            break;
                        case 'PalmMuted':
                            if (c.findChildElement('Enable')) {
                                note.isPalmMute = true;
                            }
                            break;
                        case 'Octave':
                            note.octave = GpifParser.parseIntSafe(c.findChildElement('Number')?.innerText, 0);
                            // when exporting GP6 from GP7 the tone might be missing
                            if (note.tone === -1) {
                                note.tone = 0;
                            }
                            break;
                        case 'Tone':
                            note.tone = GpifParser.parseIntSafe(c.findChildElement('Step')?.innerText, 0);
                            break;
                        case 'ConcertPitch':
                            this.parseConcertPitch(c, note);
                            break;
                        case 'Bended':
                            isBended = true;
                            break;
                        case 'BendOriginValue':
                            if (!bendOrigin) {
                                bendOrigin = new BendPoint(0, 0);
                            }
                            bendOrigin.value = this.toBendValue(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'BendOriginOffset':
                            if (!bendOrigin) {
                                bendOrigin = new BendPoint(0, 0);
                            }
                            bendOrigin.offset = this.toBendOffset(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'BendMiddleValue':
                            bendMiddleValue = this.toBendValue(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'BendMiddleOffset1':
                            bendMiddleOffset1 = this.toBendOffset(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'BendMiddleOffset2':
                            bendMiddleOffset2 = this.toBendOffset(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'BendDestinationValue':
                            if (!bendDestination) {
                                bendDestination = new BendPoint(BendPoint.MaxPosition, 0);
                            }
                            bendDestination.value = this.toBendValue(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'BendDestinationOffset':
                            if (!bendDestination) {
                                bendDestination = new BendPoint(0, 0);
                            }
                            bendDestination.offset = this.toBendOffset(
                                GpifParser.parseFloatSafe(c.findChildElement('Float')?.innerText, 0)
                            );
                            break;
                        case 'HopoOrigin':
                            if (c.findChildElement('Enable')) {
                                note.isHammerPullOrigin = true;
                            }
                            break;
                        case 'HopoDestination':
                            // NOTE: gets automatically calculated
                            // if (FindChildElement(node, "Enable"))
                            //     note.isHammerPullDestination = true;
                            break;
                        case 'LeftHandTapped':
                            note.isLeftHandTapped = true;
                            break;
                        case 'Slide':
                            const slideFlags: number = GpifParser.parseIntSafe(
                                c.findChildElement('Flags')?.innerText,
                                0
                            );
                            if ((slideFlags & 1) !== 0) {
                                note.slideOutType = SlideOutType.Shift;
                            } else if ((slideFlags & 2) !== 0) {
                                note.slideOutType = SlideOutType.Legato;
                            } else if ((slideFlags & 4) !== 0) {
                                note.slideOutType = SlideOutType.OutDown;
                            } else if ((slideFlags & 8) !== 0) {
                                note.slideOutType = SlideOutType.OutUp;
                            }
                            if ((slideFlags & 16) !== 0) {
                                note.slideInType = SlideInType.IntoFromBelow;
                            } else if ((slideFlags & 32) !== 0) {
                                note.slideInType = SlideInType.IntoFromAbove;
                            }
                            if ((slideFlags & 64) !== 0) {
                                note.slideOutType = SlideOutType.PickSlideDown;
                            } else if ((slideFlags & 128) !== 0) {
                                note.slideOutType = SlideOutType.PickSlideUp;
                            }
                            break;
                    }
                    break;
            }
        }

        if (isBended) {
            if (!bendOrigin) {
                bendOrigin = new BendPoint(0, 0);
            }
            if (!bendDestination) {
                bendDestination = new BendPoint(BendPoint.MaxPosition, 0);
            }
            note.addBendPoint(bendOrigin);
            if (bendMiddleOffset1 && bendMiddleValue) {
                note.addBendPoint(new BendPoint(bendMiddleOffset1, bendMiddleValue));
            }
            if (bendMiddleOffset2 && bendMiddleValue) {
                note.addBendPoint(new BendPoint(bendMiddleOffset2, bendMiddleValue));
            }
            if (!bendMiddleOffset1 && !bendMiddleOffset2 && bendMiddleValue) {
                note.addBendPoint(new BendPoint((BendPoint.MaxPosition / 2) | 0, bendMiddleValue));
            }
            note.addBendPoint(bendDestination);
        }

        // map GP6 element and variation combos to midi numbers
        if (element !== -1 && variation !== -1) {
            note.percussionArticulation = PercussionMapper.articulationFromElementVariation(element, variation);
        }
    }

    private parseConcertPitch(node: XmlNode, note: Note) {
        const pitch = node.findChildElement('Pitch');
        if (pitch) {
            for (const c of pitch.childElements()) {
                switch (c.localName) {
                    case 'Accidental':
                        switch (c.innerText) {
                            case 'x':
                                note.accidentalMode = NoteAccidentalMode.ForceDoubleSharp;
                                break;
                            case '#':
                                note.accidentalMode = NoteAccidentalMode.ForceSharp;
                                break;
                            case 'b':
                                note.accidentalMode = NoteAccidentalMode.ForceFlat;
                                break;
                            case 'bb':
                                note.accidentalMode = NoteAccidentalMode.ForceDoubleFlat;
                                break;
                        }
                        break;
                }
            }
        }
    }

    private toBendValue(gpxValue: number): number {
        return (gpxValue * GpifParser.BendPointValueFactor) | 0;
    }

    private toBendOffset(gpxOffset: number): number {
        return gpxOffset * GpifParser.BendPointPositionFactor;
    }

    private parseRhythms(node: XmlNode): void {
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'Rhythm':
                    this.parseRhythm(c);
                    break;
            }
        }
    }

    private parseRhythm(node: XmlNode): void {
        const rhythm: GpifRhythm = new GpifRhythm();
        const rhythmId: string = node.getAttribute('id');
        rhythm.id = rhythmId;
        for (const c of node.childElements()) {
            switch (c.localName) {
                case 'NoteValue':
                    switch (c.innerText) {
                        case 'Long':
                            rhythm.value = Duration.QuadrupleWhole;
                            break;
                        case 'DoubleWhole':
                            rhythm.value = Duration.DoubleWhole;
                            break;
                        case 'Whole':
                            rhythm.value = Duration.Whole;
                            break;
                        case 'Half':
                            rhythm.value = Duration.Half;
                            break;
                        case 'Quarter':
                            rhythm.value = Duration.Quarter;
                            break;
                        case 'Eighth':
                            rhythm.value = Duration.Eighth;
                            break;
                        case '16th':
                            rhythm.value = Duration.Sixteenth;
                            break;
                        case '32nd':
                            rhythm.value = Duration.ThirtySecond;
                            break;
                        case '64th':
                            rhythm.value = Duration.SixtyFourth;
                            break;
                        case '128th':
                            rhythm.value = Duration.OneHundredTwentyEighth;
                            break;
                        case '256th':
                            rhythm.value = Duration.TwoHundredFiftySixth;
                            break;
                    }
                    break;
                case 'PrimaryTuplet':
                    rhythm.tupletNumerator = GpifParser.parseIntSafe(c.getAttribute('num'), -1);
                    rhythm.tupletDenominator = GpifParser.parseIntSafe(c.getAttribute('den'), -1);
                    break;
                case 'AugmentationDot':
                    rhythm.dots = GpifParser.parseIntSafe(c.getAttribute('count'), 0);
                    break;
            }
        }
        this._rhythmById.set(rhythmId, rhythm);
    }

    private buildModel(): void {
        // build score
        for (let i: number = 0, j: number = this._masterBars.length; i < j; i++) {
            const masterBar: MasterBar = this._masterBars[i];
            this.score.addMasterBar(masterBar);
        }

        // Its a bit wierd. but the last bar might be flagged as "DoubleBar"
        // we have to clear this
        const lastMasterBar = this._masterBars[this._masterBars.length - 1];
        if (this._doubleBars.has(lastMasterBar)) {
            this._doubleBars.delete(lastMasterBar);
            lastMasterBar.isDoubleBar = false;
        }

        // add tracks to score
        for (const trackId of this._tracksMapping) {
            if (!trackId) {
                continue;
            }
            const track: Track = this._tracksById.get(trackId)!;
            this.score.addTrack(track);
        }
        // process all masterbars
        let keySignature: [KeySignature, KeySignatureType];

        for (const barIds of this._barsOfMasterBar) {
            // add all bars of masterbar vertically to all tracks
            let staffIndex: number = 0;
            keySignature = [KeySignature.C, KeySignatureType.Major];
            for (
                let barIndex: number = 0, trackIndex: number = 0;
                barIndex < barIds.length && trackIndex < this.score.tracks.length;
                barIndex++
            ) {
                const barId: string = barIds[barIndex];
                if (barId !== GpifParser.InvalidId) {
                    const bar: Bar = this._barsById.get(barId)!;
                    const track: Track = this.score.tracks[trackIndex];
                    const staff: Staff = track.staves[staffIndex];
                    staff.addBar(bar);

                    const masterBarIndex = staff.bars.length - 1;
                    if (this._keySignatures.has(masterBarIndex)) {
                        keySignature = this._keySignatures.get(masterBarIndex)!;
                    }

                    bar.keySignature = keySignature[0];
                    bar.keySignatureType = keySignature[1];

                    if (this._doubleBars.has(bar.masterBar)) {
                        bar.barLineRight = BarLineStyle.LightLight;
                    }

                    if (this._voicesOfBar.has(barId)) {
                        // add voices to bars
                        for (const voiceId of this._voicesOfBar.get(barId)!) {
                            if (voiceId !== GpifParser.InvalidId) {
                                const voice: Voice = this._voiceById.get(voiceId)!;
                                bar.addVoice(voice);
                                if (this._beatsOfVoice.has(voiceId)) {
                                    // add beats to voices
                                    for (const beatId of this._beatsOfVoice.get(voiceId)!) {
                                        if (beatId !== GpifParser.InvalidId) {
                                            // important! we clone the beat because beats get reused
                                            // in gp6, our model needs to have unique beats.
                                            const beat: Beat = BeatCloner.clone(this._beatById.get(beatId)!);
                                            voice.addBeat(beat);
                                            const rhythmId: string = this._rhythmOfBeat.get(beatId)!;
                                            const rhythm: GpifRhythm = this._rhythmById.get(rhythmId)!;
                                            // set beat duration
                                            beat.duration = rhythm.value;
                                            beat.dots = rhythm.dots;
                                            beat.tupletNumerator = rhythm.tupletNumerator;
                                            beat.tupletDenominator = rhythm.tupletDenominator;
                                            // add notes to beat
                                            if (this._notesOfBeat.has(beatId)) {
                                                for (const noteId of this._notesOfBeat.get(beatId)!) {
                                                    if (noteId !== GpifParser.InvalidId) {
                                                        const note = NoteCloner.clone(this._noteById.get(noteId)!);
                                                        // reset midi value for non-percussion staves
                                                        if (staff.isPercussion) {
                                                            note.fret = -1;
                                                            note.string = -1;
                                                        } else {
                                                            note.percussionArticulation = -1;
                                                        }
                                                        beat.addNote(note);
                                                        if (this._tappedNotes.has(noteId)) {
                                                            beat.tap = true;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                // invalid voice -> empty voice
                                const voice: Voice = new Voice();
                                bar.addVoice(voice);
                                const beat: Beat = new Beat();
                                beat.isEmpty = true;
                                beat.duration = Duration.Quarter;
                                voice.addBeat(beat);
                            }
                        }
                    }
                    // stave is full? -> next track
                    if (staffIndex === track.staves.length - 1) {
                        trackIndex++;
                        staffIndex = 0;
                        keySignature = [KeySignature.C, KeySignatureType.Major];
                    } else {
                        staffIndex++;
                        keySignature = [KeySignature.C, KeySignatureType.Major];
                    }
                } else {
                    // no bar for track
                    trackIndex++;
                }
            }
        }

        // clear out percussion articulations where not needed
        // and add automations
        for (const trackId of this._tracksMapping) {
            if (!trackId) {
                continue;
            }
            const track: Track = this._tracksById.get(trackId)!;

            let hasPercussion = false;
            for (const staff of track.staves) {
                if (staff.isPercussion) {
                    hasPercussion = true;
                    break;
                }
            }
            if (!hasPercussion) {
                track.percussionArticulations = [];
            }

            if (this._automationsPerTrackIdAndBarIndex.has(trackId)) {
                const trackAutomations = this._automationsPerTrackIdAndBarIndex.get(trackId)!;

                for (const [barNumber, automations] of trackAutomations) {
                    if (track.staves.length > 0 && barNumber < track.staves[0].bars.length) {
                        const bar = track.staves[0].bars[barNumber];
                        if (bar.voices.length > 0 && bar.voices[0].beats.length > 0) {
                            const beat = bar.voices[0].beats[0];
                            for (const a of automations) {
                                // NOTE: currently the automations of a bar are applied to the
                                // first beat of a bar
                                beat.automations.push(a);
                            }
                        } else {
                        }
                    }
                }
            }

            if (this._sustainPedalsPerTrackIdAndBarIndex.has(trackId)) {
                const sustainPedals = this._sustainPedalsPerTrackIdAndBarIndex.get(trackId)!;
                for (const [barNumber, markers] of sustainPedals) {
                    if (track.staves.length > 0 && barNumber < track.staves[0].bars.length) {
                        const bar = track.staves[0].bars[barNumber];
                        bar.sustainPedals = markers;
                    }
                }
            }
        }

        // build masterbar automations
        for (const [barNumber, automations] of this._masterTrackAutomations) {
            const masterBar: MasterBar = this.score.masterBars[barNumber];
            for (let i: number = 0, j: number = automations.length; i < j; i++) {
                const automation: Automation = automations[i];
                switch (automation.type) {
                    case AutomationType.Tempo:
                        if (barNumber === 0) {
                            this.score.tempo = automation.value | 0;
                            if (automation.text) {
                                this.score.tempoLabel = automation.text;
                            }
                        }
                        masterBar.tempoAutomations.push(automation);
                        break;
                    case AutomationType.SyncPoint:
                        automation.syncPointValue!.millisecondOffset -= this._backingTrackPadding;
                        masterBar.addSyncPoint(automation);
                        break;
                }
            }
        }
    }
}
