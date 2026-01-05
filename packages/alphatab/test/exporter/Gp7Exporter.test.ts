import { Gp7Exporter } from '@coderline/alphatab/exporter/Gp7Exporter';
import { Gp7To8Importer } from '@coderline/alphatab/importer/Gp7To8Importer';
import { GpifParser } from '@coderline/alphatab/importer/GpifParser';
import { ScoreLoader } from '@coderline/alphatab/importer/ScoreLoader';
import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { IOHelper } from '@coderline/alphatab/io/IOHelper';
import {
    type InstrumentArticulation,
    TechniqueSymbolPlacement
} from '@coderline/alphatab/model/InstrumentArticulation';
import { JsonConverter } from '@coderline/alphatab/model/JsonConverter';
import { MusicFontSymbol } from '@coderline/alphatab/model/MusicFontSymbol';
import { PercussionMapper } from '@coderline/alphatab/model/PercussionMapper';
import type { Score } from '@coderline/alphatab/model/Score';
import { Settings } from '@coderline/alphatab/Settings';
import { XmlDocument } from '@coderline/alphatab/xml/XmlDocument';
import { ZipReader } from '@coderline/alphatab/zip/ZipReader';
import { assert, expect } from 'chai';
import { ComparisonHelpers } from 'test/model/ComparisonHelpers';
import { TestPlatform } from 'test/TestPlatform';

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
        await testRoundTripFolderEqual('visual-tests/effects-and-annotations');
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

    it('alphatex-drums-to-gp7', () => {
        const tex = `\\track "Drums"
        \\instrument percussion
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

        expect(actual.tracks[0].percussionArticulations.length).to.equal(2);
        expect(actual.tracks[0].staves[0].bars[0].voices[0].beats[0].notes[0].percussionArticulation).to.equal(0);
        expect(actual.tracks[0].staves[0].bars[0].voices[0].beats[1].notes[0].percussionArticulation).to.equal(1);
        expect(actual.tracks[0].staves[0].bars[0].voices[0].beats[2].notes[0].percussionArticulation).to.equal(0);
        expect(actual.tracks[0].staves[0].bars[0].voices[0].beats[3].notes[0].percussionArticulation).to.equal(1);
    });

    it('gp7-lyrics-null', async () => {
        await testRoundTripEqual('guitarpro7/lyrics-null.gp', null);
    });

    it('gp8', async () => {
        await testRoundTripFolderEqual('guitarpro8', undefined, ['bendpoints', 'bendtype']);
    });

    /**
     * This test generates the articulations code needed for the PercussionMapper.
     * To update the code there, run this test and copy the source code from the written file.
     * The test will fail and write a ".new" file if the code changed.
     */
    it('percussion-articulations', async () => {
        const settings = new Settings();
        const zip = new ZipReader(
            ByteBuffer.fromBuffer(await TestPlatform.loadFile('test-data/exporter/articulations.gp'))
        ).read();
        const gpifData = zip.find(e => e.fileName === 'score.gpif')!.data;
        const parser = new GpifParser();
        parser.parseXml(IOHelper.toString(gpifData, settings.importer.encoding), settings);
        const score = parser.score;

        let instrumentArticulationsLookup =
            'public static instrumentArticulations: Map<number, InstrumentArticulation> = new Map(\n';
        instrumentArticulationsLookup += '  [\n';

        let instrumentArticulationNames = 'private static _instrumentArticulationNames = new Map<string, number>([\n';

        const existingNameMappings = new Set<string>(['']);
        const existingCustomNames = new Map<number, string>();
        for (const [name, id] of PercussionMapper.instrumentArticulationNames) {
            existingCustomNames.set(id, name);
        }

        const deduplicateArticulations = new Map<number, InstrumentArticulation>();
        for (const a of score.tracks[0].percussionArticulations) {
            deduplicateArticulations.set(a.id, a);
        }

        const sorted = Array.from(deduplicateArticulations.values());
        sorted.sort((a, b) => a.id - b.id);

        for (const a of sorted) {
            instrumentArticulationsLookup += `    InstrumentArticulation.create(`;
            instrumentArticulationsLookup += `${a.id}, `;
            instrumentArticulationsLookup += `${JSON.stringify(a.elementType)}, `;
            instrumentArticulationsLookup += `${a.staffLine}, `;
            instrumentArticulationsLookup += `${a.outputMidiNumber}, `;
            instrumentArticulationsLookup += `MusicFontSymbol.${MusicFontSymbol[a.noteHeadDefault]}, `;
            instrumentArticulationsLookup += `MusicFontSymbol.${MusicFontSymbol[a.noteHeadHalf]}, `;
            instrumentArticulationsLookup += `MusicFontSymbol.${MusicFontSymbol[a.noteHeadWhole]}`;
            if (a.techniqueSymbol !== MusicFontSymbol.None) {
                instrumentArticulationsLookup += `, MusicFontSymbol.${MusicFontSymbol[a.techniqueSymbol]}, `;
                instrumentArticulationsLookup += `TechniqueSymbolPlacement.${TechniqueSymbolPlacement[a.techniqueSymbolPlacement]}`;
            }
            instrumentArticulationsLookup += `),\n`;

            let name: string;
            if (existingCustomNames.has(a.id)) {
                name = existingCustomNames.get(a.id)!;
            } else if (parser.articulationNamesById.has(a.id)) {
                name = parser.articulationNamesById.get(a.id)!;
            } else {
                name = '';
            }

            if (!existingNameMappings.has(name)) {
                instrumentArticulationNames += `  [${JSON.stringify(name)}, ${a.id}],\n`;
                existingNameMappings.add(name);
            } else {
                // primarily duplicates
                instrumentArticulationNames += `  [TODO /*TODO define a name for ${a.elementType} */, ${a.id}],\n`;
            }
        }

        instrumentArticulationsLookup += '  ].map(articulation => [articulation.id, articulation])';
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
            assert.fail('Articulations have changed, update the PercussionMapper and update the snapshot file');
        }
    });

    /**
     * This test generates the RSE mapping information for the exporter.
     * To update the code there, run this test and copy the source code from the written file.
     * The test will fail and write a ".new" file if the code changed.
     */
    it('sound-mapper', async () => {
        const settings = new Settings();
        const zip = new ZipReader(
            ByteBuffer.fromBuffer(await TestPlatform.loadFile('test-data/exporter/articulations.gp'))
        ).read();
        const gpifData = zip.find(e => e.fileName === 'score.gpif')!.data;

        const xml = new XmlDocument();
        xml.parse(IOHelper.toString(gpifData, settings.importer.encoding));

        let instrumentSetCode = 'private static _drumInstrumentSet = GpifInstrumentSet.create(';

        const instrumentSet = xml
            .findChildElement('GPIF')!
            .findChildElement('Tracks')!
            .findChildElement('Track')!
            .findChildElement('InstrumentSet')!;

        instrumentSetCode += `${JSON.stringify(instrumentSet.findChildElement('Name')!.innerText)}, `;
        instrumentSetCode += `${JSON.stringify(instrumentSet.findChildElement('Type')!.innerText)}, `;
        instrumentSetCode += `${instrumentSet.findChildElement('LineCount')!.innerText}, [\n`;

        for (const element of instrumentSet.findChildElement('Elements')!.childElements()) {
            if (element.localName !== 'Element') {
                continue;
            }

            instrumentSetCode += `  new GpifInstrumentElement(`;
            instrumentSetCode += `${JSON.stringify(element.findChildElement('Name')!.innerText)}, `;
            instrumentSetCode += `${JSON.stringify(element.findChildElement('Type')!.innerText)}, `;
            instrumentSetCode += `${JSON.stringify(element.findChildElement('SoundbankName')!.innerText)}, `;
            instrumentSetCode += `[\n`;

            for (const articulation of element.findChildElement('Articulations')!.childElements()) {
                if (articulation.localName !== 'Articulation') {
                    continue;
                }

                instrumentSetCode += '    GpifInstrumentArticulation.template(';
                instrumentSetCode += `${JSON.stringify(articulation.findChildElement('Name')!.innerText)}, `;
                instrumentSetCode += `[${articulation.findChildElement('InputMidiNumbers')!.innerText.split(' ').join(', ')}], `;
                instrumentSetCode += `${JSON.stringify(articulation.findChildElement('OutputRSESound')!.innerText)}`;
                instrumentSetCode += '),\n';
            }

            instrumentSetCode += `  ]),\n`;
        }

        instrumentSetCode += `]);`;

        const sourceCode = ['// BEGIN generated', instrumentSetCode, '// END generated'].join('\n');

        const expected = await TestPlatform.loadFileAsString('test-data/exporter/soundmapper.source');
        if (expected !== sourceCode) {
            await TestPlatform.saveFileAsString('test-data/exporter/soundmapper.source.new', sourceCode);
            assert.fail('RSE instrument set has, update the GpifSoundMapper and update the snapshot file');
        }
    });
});
