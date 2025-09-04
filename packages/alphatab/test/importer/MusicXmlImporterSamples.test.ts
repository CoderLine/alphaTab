import { MusicXmlImporterTestHelper } from '@test/importer/MusicXmlImporterTestHelper';

describe('MusicXmlImporterSamplesTests', () => {
    it('BeetAnGeSample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/BeetAnGeSample.xml');
    });

    it('Binchois', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/Binchois.xml');
    });

    it('BrahWiMeSample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/BrahWiMeSample.xml');
    });

    it('BrookeWestSample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/BrookeWestSample.xml');
    });

    it('Chant', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/Chant.xml');
    });

    it('DebuMandSample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/DebuMandSample.xml');
    });

    it('Dichterliebe01', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/Dichterliebe01.xml');
    });

    it('Echigo', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/Echigo.xml');
    });

    it('FaurReveSample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/FaurReveSample.xml');
    });

    it('MahlFaGe4Sample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/MahlFaGe4Sample.xml');
    });

    it('MozaChloSample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/MozaChloSample.xml');
    });

    it('MozartPianoSonata', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/MozartPianoSonata.xml');
    });

    it('MozartTrio', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/MozartTrio.xml');
    });

    it('MozaVeilSample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/MozaVeilSample.xml');
    });

    it('Saltarello', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/Saltarello.xml');
    });

    it('SchbAvMaSample', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/SchbAvMaSample.xml');
    });

    it('Telemann', async () => {
        await MusicXmlImporterTestHelper.testReferenceFile('test-data/musicxml-samples/Telemann.xml');
    });
});
