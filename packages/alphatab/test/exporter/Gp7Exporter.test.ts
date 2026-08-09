import { Gp7Exporter } from '@coderline/alphatab/exporter/Gp7Exporter';
import {
    GpifInstrumentArticulation,
    GpifInstrumentElement,
    GpifInstrumentSet
} from '@coderline/alphatab/exporter/GpifSoundMapper';
import { Gp7To8Importer } from '@coderline/alphatab/importer/Gp7To8Importer';
import { GpifParser } from '@coderline/alphatab/importer/GpifParser';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import { TechniqueSymbolPlacement } from '@coderline/alphatab/model/InstrumentArticulation';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import type { Score } from '@coderline/alphatab/model/Score';
import { Settings } from '@coderline/alphatab/Settings';
import { XmlDocument } from '@coderline/alphatab/xml/XmlDocument';
import { ZipReader } from '@coderline/alphatab/zip/ZipReader';
import { ComparisonHelpers } from 'test/model/ComparisonHelpers';
import { TestPlatform } from 'test/TestPlatform';
import { describe, expect, it } from 'vitest';

describe('Gp7ExporterTest', () => {
    async function loadScore(name: string): Promise<Score | null> {
        try {
            const data = await TestPlatform.loadFile(`test-data/${name}`);
            return ScoreLoader.loadScoreFromBytes(data);
        } catch {
            return null;
        }
    }

    function prepareImporterWithBytes(buffer: Uint8Array): Gp7To8Importer {
        const readerBase: Gp7To8Importer = new Gp7To8Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    }

    function exportGp7(score: Score): Uint8Array {
        return new Gp7Exporter().export(score, null);
    }

    function readExportedGpif(buffer: Uint8Array): string {
        const settings = new Settings();
        const zip = new ZipReader(ByteBuffer.fromBuffer(buffer), settings.importer.maxDecodingBufferSize).read();
        const gpifData = zip.find(e => e.fileName === 'score.gpif')!.data;
        return IOHelper.toString(gpifData, settings.importer.encoding);
    }

    async function testRoundTripEqual(name: string, ignoreKeys: string[] | null): Promise<void> {
        const expected = await loadScore(name);
        if (!expected) {
            return;
        }

        const fileName = name.substr(name.lastIndexOf('/') + 1);
        const exported = exportGp7(expected);
        const actual = prepareImporterWithBytes(exported).readScore();

        const expectedJson = JsonConverter.scoreToJsObject(expected);
        const actualJson = JsonConverter.scoreToJsObject(actual);

        ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, `<${fileName}>`, ignoreKeys);
    }

    async function testRoundTripFolderEqual(
        name: string,
        ignoredFiles?: string[],
        ignoreKeys: string[] | null = null
    ): Promise<void> {
        const files: string[] = await TestPlatform.listDirectory(`test-data/${name}`);
        const ignoredFilesLookup = new Set<string>(ignoredFiles);
        for (const file of files) {
            if (!ignoredFilesLookup.has(file) && !file.endsWith('.png')) {
                await testRoundTripEqual(`${name}/${file}`, ignoreKeys);
            }
        }
    }

    // Note: we just test all our importer and visual tests to cover all features

    it('importer', async () => {
        await testRoundTripFolderEqual('guitarpro7');
    });

    it('visual-effects-and-annotations', async () => {
        await testRoundTripFolderEqual('visual-tests/effects-and-annotations', ['hidden-dots.mxml']);
    });

    it('visual-general', async () => {
        await testRoundTripFolderEqual('visual-tests/general');
    });

    it('visual-guitar-tabs', async () => {
        await testRoundTripFolderEqual('visual-tests/guitar-tabs');
    });

    it('visual-layout', async () => {
        await testRoundTripFolderEqual('visual-tests/layout', ['extended-barlines.xml']);
    });

    it('visual-music-notation', async () => {
        await testRoundTripFolderEqual('visual-tests/music-notation', ['barlines.xml']);
    });

    it('visual-notation-legend', async () => {
        await testRoundTripFolderEqual('visual-tests/notation-legend');
    });

    it('visual-special-notes', async () => {
        await testRoundTripFolderEqual('visual-tests/special-notes');
    });

    it('visual-special-tracks', async () => {
        await testRoundTripFolderEqual('visual-tests/special-tracks');
    });

    it('gp5-to-gp7', async () => {
        await testRoundTripEqual('conversion/full-song.gp5', [
            'accidentalmode', // gets upgraded from default
            'percussionarticulations', // gets added
            'automations' // volume automations are not yet supported in gpif
        ]);
    });

    it('gp6-to-gp7', async () => {
        await testRoundTripEqual('conversion/full-song.gpx', [
            'accidentalmode', // gets upgraded from default
            'percussionarticulations', // gets added
            'percussionarticulation' // gets added
        ]);
    });

    it('alphatex-to-gp7', () => {
        const tex = `\\title "Canon Rock"
        \\subtitle "JerryC"
        \\tempo 90
        .
        :2 19.2{v f} 17.2{v f} |
        15.2{v f} 14.2{v f}|
        12.2{v f} 10.2{v f}|
        12.2{v f} 14.2{v f}.4 :8 15.2 17.2 |
        14.1.2 :8 17.2 15.1 14.1{h} 17.2 |
        15.2{v d}.4 :16 17.2{h} 15.2 :8 14.2 14.1 17.1{b(0 4 4 0)}.4 |
        15.1.8 :16 14.1{tu 3} 15.1{tu 3} 14.1{tu 3} :8 17.2 15.1 14.1 :16 12.1{tu 3} 14.1{tu 3} 12.1{tu 3} :8 15.2 14.2 |
        12.2 14.3 12.3 15.2 :32 14.2{h} 15.2{h} 14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}
        `;

        const expected = ScoreLoader.loadAlphaTex(tex);
        const exported = exportGp7(expected);

        const actual = prepareImporterWithBytes(exported).readScore();

        const expectedJson = JsonConverter.scoreToJsObject(expected);
        const actualJson = JsonConverter.scoreToJsObject(actual);

        ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, '<alphatex>', ['accidentalmode']);
    });

    it('alphatex-to-gp7-score-system-layout-as-text', () => {
        const tex = `\\title "Multitrack Metadata"
        \\artist "alphaTab"
        \\tempo 90
        .
        \\track "Piano"
        \\instrument acousticgrandpiano
        C4.4 D4.4 E4.4 F4.4
        .
        \\track "Guitar"
        \\instrument acousticguitarsteel
        0.3.4 2.3.4 3.3.4 5.3.4
        `;

        const score = ScoreLoader.loadAlphaTex(tex);
        score.defaultSystemsLayout = 5;
        score.systemsLayout = [3, 2, 3];
        const gpif = readExportedGpif(exportGp7(score));

        expect(gpif).toContain('<ScoreSystemsDefaultLayout>5</ScoreSystemsDefaultLayout>');
        expect(gpif).toContain('<ScoreSystemsLayout>3 2 3</ScoreSystemsLayout>');
        expect(gpif).not.toContain('<ScoreSystemsDefaultLayout><![CDATA[');
        expect(gpif).not.toContain('<ScoreSystemsLayout><![CDATA[');
        expect(gpif).toContain('<MultiVoice>1></MultiVoice>');
    });

    it('alphatex-drums-to-gp7', () => {
        const tex = `\\track "Drums" { instrument percussion }
        \\clef neutral
        \\articulation defaults
        \\articulation Kick 36
        \\articulation Unused 46
        Kick.4 "Hi-Hat (closed)".4 Kick.4 "Hi-Hat (closed)".4
        `;

        const expected = ScoreLoader.loadAlphaTex(tex);
        const exported = exportGp7(expected);

        const actual = prepareImporterWithBytes(exported).readScore();

        const expectedJson = JsonConverter.scoreToJsObject(expected);
        const actualJson = JsonConverter.scoreToJsObject(actual);

        ComparisonHelpers.expectJsonEqual(expectedJson, actualJson, '<alphatex>', ['accidentalmode']);

        expect(actual.tracks[0].percussionArticulations.length).toBe(2);
        expect(actual.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).toBe(0);
        expect(actual.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).toBe(1);
        expect(actual.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).toBe(0);
        expect(actual.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).toBe(1);
    });

    it('gp7-lyrics-null', async () => {
        await testRoundTripEqual('guitarpro7/lyrics-null.gp', null);
    });

    it('gp8', async () => {
        await testRoundTripFolderEqual('guitarpro8', undefined, ['bendpoints', 'bendtype']);
    });

    // Regression: MusicXML using MuseScore's `staff*4+localVoice` convention
    // produces bars whose bar.voices contains sparse voice slots (indices 0..8+).
    // Prior to the fix, GpifWriter emitted one <Voices> token per slot, producing
    // <Voices>-1 -1 -1 -1 5 -1 -1 -1 -1</Voices> — invalid GPIF (GP requires
    // exactly 4 slots) that crashed Guitar Pro 8 and MuseScore. The writer must
    // now always emit exactly 4 slots, place the non-empty voice inside 0..3,
    // and skip empty voices so their beats don't leak as orphan <Beat> nodes.
    it('musicxml-sparse-voice-indices-produce-valid-gpif', () => {
        const musicXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>4</duration>
        <voice>1</voice>
        <type>whole</type>
        <staff>1</staff>
      </note>
      <backup><duration>4</duration></backup>
      <note>
        <pitch><step>C</step><octave>3</octave></pitch>
        <duration>4</duration>
        <voice>5</voice>
        <type>whole</type>
        <staff>2</staff>
      </note>
    </measure>
  </part>
</score-partwise>`;

        const expected = ScoreLoader.loadScoreFromBytes(IOHelper.stringToBytes(musicXml));
        const exported = exportGp7(expected);

        const settings = new Settings();
        const zip = new ZipReader(ByteBuffer.fromBuffer(exported), settings.importer.maxDecodingBufferSize).read();
        const gpifData = zip.find(e => e.fileName === 'score.gpif')!.data;
        const gpif = IOHelper.toString(gpifData, settings.importer.encoding);
        const xml = new XmlDocument();
        xml.parse(gpif);

        // Every <Bar>/<Voices> must have exactly 4 space-separated tokens.
        let barCount = 0;
        for (const bar of xml.findChildElement('GPIF')!.findChildElement('Bars')!.childElements()) {
            barCount++;
            const voices = bar.findChildElement('Voices')!.innerText.trim().split(/\s+/);
            expect(voices.length).toBe(4);
        }
        expect(barCount).toBeGreaterThan(0);

        // No orphan <Beat> — every declared beat id must be referenced from
        // some <Voice>/<Beats>.
        const referencedBeatIds = new Set<string>();
        for (const voice of xml.findChildElement('GPIF')!.findChildElement('Voices')!.childElements()) {
            const beatsList = voice.findChildElement('Beats')!.innerText.trim();
            if (beatsList.length > 0) {
                for (const id of beatsList.split(/\s+/)) {
                    referencedBeatIds.add(id);
                }
            }
        }
        for (const beat of xml.findChildElement('GPIF')!.findChildElement('Beats')!.childElements()) {
            const id = beat.getAttribute('id');
            expect(referencedBeatIds.has(id)).toBe(true);
        }
    });

    // GP7/8 defaults an unset <Fret> to Int32.MinValue and playback breaks —
    // piano notes must carry valid String+Fret consistent with the emitted Tuning.
    it('musicxml-piano-notes-get-string-and-fret', () => {
        const musicXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>1</duration>
        <voice>1</voice>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>1</duration>
        <voice>1</voice>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>1</duration>
        <voice>1</voice>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><octave>5</octave></pitch>
        <duration>1</duration>
        <voice>1</voice>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

        const expected = ScoreLoader.loadScoreFromBytes(IOHelper.stringToBytes(musicXml));
        const exported = exportGp7(expected);

        const settings = new Settings();
        const zip = new ZipReader(ByteBuffer.fromBuffer(exported), settings.importer.maxDecodingBufferSize).read();
        const gpifData = zip.find(e => e.fileName === 'score.gpif')!.data;
        const gpif = IOHelper.toString(gpifData, settings.importer.encoding);
        const xml = new XmlDocument();
        xml.parse(gpif);

        // Read the exported tuning + capo from the first staff.
        const track = xml.findChildElement('GPIF')!.findChildElement('Tracks')!.findChildElement('Track')!;
        const staffProps = track.findChildElement('Staves')!.findChildElement('Staff')!.findChildElement('Properties')!;
        let tuning: number[] = [];
        let capo = 0;
        for (const prop of staffProps.childElements()) {
            const name = prop.getAttribute('name');
            if (name === 'Tuning') {
                tuning = prop
                    .findChildElement('Pitches')!
                    .innerText.trim()
                    .split(/\s+/)
                    .map(s => Number.parseInt(s, 10));
                // <Pitches> is written high-to-low reversed (low-to-high). Un-reverse
                // to get Staff.tuning's high-to-low convention.
                tuning.reverse();
            } else if (name === 'CapoFret') {
                capo = Number.parseInt(prop.findChildElement('Fret')!.innerText, 10);
            }
        }
        expect(tuning.length).toBeGreaterThan(0);

        // Every note under the piano track must have String + Fret + Midi
        // and satisfy the pitch identity.
        let noteCount = 0;
        for (const note of xml.findChildElement('GPIF')!.findChildElement('Notes')!.childElements()) {
            noteCount++;
            const props = note.findChildElement('Properties')!;
            let str = Number.NaN;
            let fret = Number.NaN;
            let midi = Number.NaN;
            for (const prop of props.childElements()) {
                const name = prop.getAttribute('name');
                if (name === 'String') {
                    str = Number.parseInt(prop.findChildElement('String')!.innerText, 10) + 1;
                } else if (name === 'Fret') {
                    fret = Number.parseInt(prop.findChildElement('Fret')!.innerText, 10);
                } else if (name === 'Midi') {
                    midi = Number.parseInt(prop.findChildElement('Number')!.innerText, 10);
                }
            }
            expect(Number.isNaN(str)).toBe(false);
            expect(Number.isNaN(fret)).toBe(false);
            expect(Number.isNaN(midi)).toBe(false);
            // Guard against the "Int32.MinValue sentinel" scenario the fix
            // exists to prevent.
            expect(fret).toBeGreaterThan(-1000);
            expect(fret).toBeLessThan(1000);
            // Pitch identity: capo + tuning[N-string] + fret === midi
            expect(capo + tuning[tuning.length - str] + fret).toBe(midi);
        }
        expect(noteCount).toBe(4);
    });

    /**
     * This test generates the articulations code needed for the PercussionMapper.
     * To update the code there, run this test and copy the source code from the written file.
     * The test will fail and write a ".new" file if the code changed.
     */
    it('percussion-articulations', async () => {
        const settings = new Settings();
        const zip = new ZipReader(
            ByteBuffer.fromBuffer(await TestPlatform.loadFile('test-data/exporter/articulations.gp')),
            settings.importer.maxDecodingBufferSize
        ).read();
        const gpifData = zip.find(e => e.fileName === 'score.gpif')!.data;

        const xml = new XmlDocument();
        xml.parse(IOHelper.toString(gpifData, settings.importer.encoding));

        const instrumentSet = readFullInstrumentSet(xml);

        let instrumentArticulationsLookup =
            'public static instrumentArticulations: Map<string, InstrumentArticulation> = new Map(\n';
        instrumentArticulationsLookup += '  [\n';

        let instrumentArticulationNames = 'private static _instrumentArticulationNames = new Map<string, string>([\n';

        const nameCounter = new Map<string, number>();

        for (const element of instrumentSet.elements) {
            for (const a of element.articulations) {
                instrumentArticulationsLookup += `    InstrumentArticulation.create(`;
                instrumentArticulationsLookup += `${a.inputMidiNumbers[0]}, `;
                instrumentArticulationsLookup += `${JSON.stringify(element.name)}, `;
                instrumentArticulationsLookup += `${a.staffLine}, `;
                instrumentArticulationsLookup += `${a.outputMidiNumber}, `;
                instrumentArticulationsLookup += `MusicFontSymbol.${MusicFontSymbol[a.noteHeads[0]]}, `;
                instrumentArticulationsLookup += `MusicFontSymbol.${MusicFontSymbol[a.noteHeads[1]]}, `;
                instrumentArticulationsLookup += `MusicFontSymbol.${MusicFontSymbol[a.noteHeads[2]]}`;
                if (a.techniqueSymbol !== MusicFontSymbol.None) {
                    instrumentArticulationsLookup += `, MusicFontSymbol.${MusicFontSymbol[a.techniqueSymbol]}, `;
                    instrumentArticulationsLookup += `TechniqueSymbolPlacement.${TechniqueSymbolPlacement[a.techniqueSymbolPlacement]}`;
                }
                instrumentArticulationsLookup += `),\n`;

                let name = a.name;
                if (nameCounter.has(name)) {
                    const newCount = nameCounter.get(name)! + 1;
                    name += ` ${newCount}`;
                    nameCounter.set(name, newCount);
                } else {
                    nameCounter.set(name, 1);
                }

                const uniqueId = `${element.name}.${a.inputMidiNumbers[0]}`;
                instrumentArticulationNames += `  [${JSON.stringify(name)}, ${`${JSON.stringify(uniqueId)}`}],\n`;
            }
        }

        instrumentArticulationsLookup += '  ].map(articulation => [articulation.uniqueId, articulation])';
        instrumentArticulationsLookup += ');';
        instrumentArticulationNames += ']);';

        const sourceCode = [
            '// BEGIN generated articulations',
            instrumentArticulationsLookup,
            '',
            instrumentArticulationNames,
            '// END generated articulations'
        ].join('\n');

        const expected = await TestPlatform.loadFileAsString('test-data/exporter/articulations.source');
        if (expected !== sourceCode) {
            await TestPlatform.saveFileAsString('test-data/exporter/articulations.source.new', sourceCode);
            throw new Error('Articulations have changed, update the PercussionMapper and update the snapshot file');
        }
    });

    // NOTE: this function could be useful in future if we want to use a real .gp file as "template"
    function readFullInstrumentSet(xml: XmlDocument) {
        const instrumentSetNode = xml
            .findChildElement('GPIF')!
            .findChildElement('Tracks')!
            .findChildElement('Track')!
            .findChildElement('InstrumentSet')!;

        const instrumentSet = new GpifInstrumentSet();

        instrumentSet.name = instrumentSetNode.findChildElement('Name')!.innerText;
        instrumentSet.type = instrumentSetNode.findChildElement('Type')!.innerText;
        instrumentSet.lineCount = Number.parseInt(instrumentSetNode.findChildElement('LineCount')!.innerText, 10);

        for (const elementNode of instrumentSetNode.findChildElement('Elements')!.childElements()) {
            if (elementNode.localName !== 'Element') {
                continue;
            }

            const element = new GpifInstrumentElement(
                elementNode.findChildElement('Name')!.innerText,
                elementNode.findChildElement('Type')!.innerText,
                elementNode.findChildElement('SoundbankName')!.innerText,
                []
            );

            for (const articulationNode of elementNode.findChildElement('Articulations')!.childElements()) {
                if (articulationNode.localName !== 'Articulation') {
                    continue;
                }

                const articulation = new GpifInstrumentArticulation(
                    articulationNode.findChildElement('Name')!.innerText,
                    Number.parseInt(articulationNode.findChildElement('StaffLine')!.innerText, 10),
                    articulationNode
                        .findChildElement('Noteheads')!
                        .innerText.split(' ')
                        .map(t => GpifParser.parseNoteHead(t)),
                    GpifParser.parseTechniqueSymbol(articulationNode.findChildElement('TechniqueSymbol')!.innerText),
                    GpifParser.parseTechniqueSymbolPlacement(
                        articulationNode.findChildElement('TechniquePlacement')!.innerText
                    ),
                    articulationNode
                        .findChildElement('InputMidiNumbers')!
                        .innerText.split(' ')
                        .map(t => Number.parseInt(t, 10)),
                    Number.parseInt(articulationNode.findChildElement('OutputMidiNumber')!.innerText, 10),
                    articulationNode.findChildElement('OutputRSESound')!.innerText
                );

                element.articulations.push(articulation);
            }

            instrumentSet.elements.push(element);
        }

        // we also have to apply the instrument patches
        // this is a bit duplicate from what we already do in the GpifParser but test-focused
        const notationPatchNode = xml
            .findChildElement('GPIF')!
            .findChildElement('Tracks')!
            .findChildElement('Track')!
            .findChildElement('NotationPatch');

        if (notationPatchNode) {
            for (const c of notationPatchNode.childElements()) {
                switch (c.localName) {
                    case 'LineCount':
                        instrumentSet.lineCount = Number.parseInt(c.innerText, 10);
                        break;
                    case 'Elements':
                        for (const e of c.childElements()) {
                            switch (e.localName) {
                                case 'Element':
                                    const elementToPatch = instrumentSet.elements.find(
                                        x => x.name === e.findChildElement('Name')!.innerText
                                    );

                                    for (const a of e.findChildElement('Articulations')!.childElements()) {
                                        const name = a.findChildElement('Name')!.innerText;
                                        const articulationToPatch = elementToPatch!.articulations.find(
                                            p => p.name === name
                                        )!;

                                        for (const ac of a.childElements()) {
                                            switch (ac.localName) {
                                                case 'StaffLine':
                                                    articulationToPatch.staffLine = Number.parseInt(ac.innerText, 10);
                                                    break;
                                            }
                                        }
                                    }

                                    break;
                            }
                        }
                        break;
                }
            }
        }

        return instrumentSet;
    }

    /**
     * This test generates the RSE mapping information for the exporter.
     * To update the code there, run this test and copy the source code from the written file.
     * The test will fail and write a ".new" file if the code changed.
     */
    it('sound-mapper', async () => {
        const settings = new Settings();
        const zip = new ZipReader(
            ByteBuffer.fromBuffer(await TestPlatform.loadFile('test-data/exporter/articulations.gp')),
            settings.importer.maxDecodingBufferSize
        ).read();
        const gpifData = zip.find(e => e.fileName === 'score.gpif')!.data;

        const xml = new XmlDocument();
        xml.parse(IOHelper.toString(gpifData, settings.importer.encoding));

        let instrumentSetCode = 'private static _drumInstrumentSet = GpifInstrumentSet.create(';

        const instrumentSet = readFullInstrumentSet(xml);

        instrumentSetCode += `${JSON.stringify(instrumentSet.name)}, `;
        instrumentSetCode += `${JSON.stringify(instrumentSet.type)}, `;
        instrumentSetCode += `${instrumentSet.lineCount.toString()}, [\n`;

        for (const element of instrumentSet.elements) {
            instrumentSetCode += `  new GpifInstrumentElement(`;
            instrumentSetCode += `${JSON.stringify(element.name)}, `;
            instrumentSetCode += `${JSON.stringify(element.type)}, `;
            instrumentSetCode += `${JSON.stringify(element.soundbankName)}, `;
            instrumentSetCode += `[\n`;

            for (const articulation of element.articulations) {
                instrumentSetCode += '    GpifInstrumentArticulation.template(';
                instrumentSetCode += `${JSON.stringify(articulation.name)}, `;
                instrumentSetCode += `[${articulation.inputMidiNumbers.map(n => n.toString()).join(', ')}], `;
                instrumentSetCode += `${JSON.stringify(articulation.outputRSESound)}`;
                instrumentSetCode += '),\n';
            }

            instrumentSetCode += `  ]),\n`;
        }

        instrumentSetCode += `]);`;

        const sourceCode = ['// BEGIN generated', instrumentSetCode, '// END generated'].join('\n');

        const expected = await TestPlatform.loadFileAsString('test-data/exporter/soundmapper.source');
        if (expected !== sourceCode) {
            await TestPlatform.saveFileAsString('test-data/exporter/soundmapper.source.new', sourceCode);
            throw new Error('RSE instrument set has, update the GpifSoundMapper and update the snapshot file');
        }
    });

    function getInstrumentSet(gp: Uint8Array) {
        const zip = new ZipReader(ByteBuffer.fromBuffer(gp), new Settings().importer.maxDecodingBufferSize);
        const gpifData = zip.read().find(e => e.fileName === 'score.gpif')!.data;
        const xml = new XmlDocument();
        xml.parse(IOHelper.toString(gpifData, ''));
        return readFullInstrumentSet(xml);
    }

    it('drumkit-roundtrip', async () => {
        const inputData = await TestPlatform.loadFile('test-data/exporter/articulations.gp');
        const loaded = ScoreLoader.loadScoreFromBytes(inputData);

        const exported = new Gp7Exporter().export(loaded);

        const expectedInstrumentSet = getInstrumentSet(inputData);
        const actualInstrumentSet = getInstrumentSet(exported);

        // order IS important for the elements and articulations. the InstrumentArticulation is index based.
        expect(actualInstrumentSet.name).toBe(expectedInstrumentSet.name);
        expect(actualInstrumentSet.type).toBe(expectedInstrumentSet.type);
        expect(actualInstrumentSet.lineCount).toBe(expectedInstrumentSet.lineCount);

        const expectedElements = Array.from(expectedInstrumentSet.elements);
        const actualElements = Array.from(actualInstrumentSet.elements);

        for (let i = 0; i < expectedElements.length; i++) {
            const expectedElement = expectedElements[i];
            expect(
                actualElements.length,
                `Element ${i} (${expectedElement.name}) missing in actual file`
            ).toBeGreaterThan(i);
            const actualElement = actualElements[i];

            expect(actualElement.name).toBe(expectedElement.name);
            expect(actualElement.type).toBe(expectedElement.type);
            expect(actualElement.soundbankName).toBe(expectedElement.soundbankName);

            for (let j = 0; j < expectedElement.articulations.length; j++) {
                const expectedArticulation = expectedElement.articulations[j];
                expect(actualElement.articulations.length, `Articulation ${i} missing in actual file`).toBeGreaterThan(
                    j
                );

                const actualArticulation = actualElement.articulations[j];

                expect(actualArticulation.name).toBe(expectedArticulation.name);
                expect(
                    actualArticulation.staffLine,
                    `Wrong staffline for articulation ${actualArticulation.name}`
                ).toBe(expectedArticulation.staffLine);
                expect(
                    actualArticulation.noteHeads.map(s => MusicFontSymbol[s]).join(' '),
                    `Wrong noteHeads for articulation ${actualArticulation.name}`
                ).toBe(expectedArticulation.noteHeads.map(s => MusicFontSymbol[s]).join(' '));
                expect(
                    MusicFontSymbol[actualArticulation.techniqueSymbol],
                    `Wrong techniqueSymbol for articulation ${actualArticulation.name}`
                ).toBe(MusicFontSymbol[expectedArticulation.techniqueSymbol]);
                expect(
                    TechniqueSymbolPlacement[actualArticulation.techniqueSymbolPlacement],
                    `Wrong techniqueSymbolPlacement for articulation ${actualArticulation.name}`
                ).toBe(TechniqueSymbolPlacement[expectedArticulation.techniqueSymbolPlacement]);
                expect(
                    actualArticulation.inputMidiNumbers.map(i => i.toString()).join(','),
                    `Wrong inputMidiNumbers for articulation ${actualArticulation.name}`
                ).toBe(expectedArticulation.inputMidiNumbers.map(i => i.toString()).join(','));
                expect(
                    actualArticulation.outputMidiNumber,
                    `Wrong outputMidiNumber for articulation ${actualArticulation.name}`
                ).toBe(expectedArticulation.outputMidiNumber);
                expect(
                    actualArticulation.outputRSESound,
                    `Wrong outputRSESound for articulation ${actualArticulation.name}`
                ).toBe(expectedArticulation.outputRSESound);
            }

            expect(
                actualElement.articulations.length,
                `articulation length mismatch on element ${expectedElement.name}`
            ).toBe(expectedElement.articulations.length);
        }

        expect(actualInstrumentSet.elements.length).toBe(expectedInstrumentSet.elements.length);

        // await TestPlatform.saveFile('test-data/exporter/articulations.exported.gp', exported);
    });
});
