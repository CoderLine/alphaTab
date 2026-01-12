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
            assert.fail('Articulations have changed, update the PercussionMapper and update the snapshot file');
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
            ByteBuffer.fromBuffer(await TestPlatform.loadFile('test-data/exporter/articulations.gp'))
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
            assert.fail('RSE instrument set has, update the GpifSoundMapper and update the snapshot file');
        }
    });

    function getInstrumentSet(gp: Uint8Array) {
        const zip = new ZipReader(ByteBuffer.fromBuffer(gp));
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
        expect(actualInstrumentSet.name).to.equal(expectedInstrumentSet.name);
        expect(actualInstrumentSet.type).to.equal(expectedInstrumentSet.type);
        expect(actualInstrumentSet.lineCount).to.equal(expectedInstrumentSet.lineCount);

        const expectedElements = Array.from(expectedInstrumentSet.elements);
        const actualElements = Array.from(actualInstrumentSet.elements);

        for (let i = 0; i < expectedElements.length; i++) {
            const expectedElement = expectedElements[i];
            expect(actualElements.length).to.be.greaterThan(
                i,
                `Element ${i} (${expectedElement.name}) missing in actual file`
            );
            const actualElement = actualElements[i];

            expect(actualElement.name).to.equal(expectedElement.name);
            expect(actualElement.type).to.equal(expectedElement.type);
            expect(actualElement.soundbankName).to.equal(expectedElement.soundbankName);

            for (let j = 0; j < expectedElement.articulations.length; j++) {
                const expectedArticulation = expectedElement.articulations[j];
                expect(actualElement.articulations.length).to.be.greaterThan(
                    j,
                    `Articulation ${i} missing in actual file`
                );

                const actualArticulation = actualElement.articulations[j];

                expect(actualArticulation.name).to.equal(expectedArticulation.name);
                expect(actualArticulation.staffLine).to.equal(
                    expectedArticulation.staffLine,
                    `Wrong staffline for articulation ${actualArticulation.name}`
                );
                expect(actualArticulation.noteHeads.map(s => MusicFontSymbol[s]).join(' ')).to.equal(
                    expectedArticulation.noteHeads.map(s => MusicFontSymbol[s]).join(' '),
                    `Wrong noteHeads for articulation ${actualArticulation.name}`
                );
                expect(MusicFontSymbol[actualArticulation.techniqueSymbol]).to.equal(
                    MusicFontSymbol[expectedArticulation.techniqueSymbol],
                    `Wrong techniqueSymbol for articulation ${actualArticulation.name}`
                );
                expect(TechniqueSymbolPlacement[actualArticulation.techniqueSymbolPlacement]).to.equal(
                    TechniqueSymbolPlacement[expectedArticulation.techniqueSymbolPlacement],
                    `Wrong techniqueSymbolPlacement for articulation ${actualArticulation.name}`
                );
                expect(actualArticulation.inputMidiNumbers.map(i => i.toString()).join(',')).to.equal(
                    expectedArticulation.inputMidiNumbers.map(i => i.toString()).join(','),
                    `Wrong inputMidiNumbers for articulation ${actualArticulation.name}`
                );
                expect(actualArticulation.outputMidiNumber).to.equal(
                    expectedArticulation.outputMidiNumber,
                    `Wrong outputMidiNumber for articulation ${actualArticulation.name}`
                );
                expect(actualArticulation.outputRSESound).to.equal(
                    expectedArticulation.outputRSESound,
                    `Wrong outputRSESound for articulation ${actualArticulation.name}`
                );
            }

            expect(actualElement.articulations.length).to.equal(
                expectedElement.articulations.length,
                `articulation length mismatch on element ${expectedElement.name}`
            );
        }

        expect(actualInstrumentSet.elements.length).to.equal(expectedInstrumentSet.elements.length);

        // await TestPlatform.saveFile('test-data/exporter/articulations.exported.gp', exported);
    });
});
