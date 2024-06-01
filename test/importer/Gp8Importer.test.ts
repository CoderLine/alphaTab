import { Gp7To8Importer } from '@src/importer/Gp7To8Importer';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Settings } from '@src/Settings';
import { GpImporterTestHelper } from '@test/importer/GpImporterTestHelper';
import { TestPlatform } from '@test/TestPlatform';

describe('Gp8ImporterTest', () => {
    async function prepareImporterWithFile(name: string): Promise<Gp7To8Importer> {
        const data = await TestPlatform.loadFile('test-data/' + name);
        return prepareImporterWithBytes(data);
    }

    function prepareImporterWithBytes(buffer: Uint8Array) {
        let readerBase: Gp7To8Importer = new Gp7To8Importer();
        readerBase.init(ByteBuffer.fromBuffer(buffer), new Settings());
        return readerBase;
    }

    it('layout-configuration', async () => {
        const track1 = (await prepareImporterWithFile('guitarpro8/layout-configuration-multi-track-1.gp')).readScore();
        const track2 = (await prepareImporterWithFile('guitarpro8/layout-configuration-multi-track-2.gp')).readScore();
        const trackAll = (await prepareImporterWithFile('guitarpro8/layout-configuration-multi-track-all.gp')).readScore();
        const track1And3 = (await prepareImporterWithFile('guitarpro8/layout-configuration-multi-track-1-3.gp')).readScore();

        GpImporterTestHelper.checkMultiTrackLayoutConfiguration(
            track1, 
            track2,
            trackAll,
            track1And3
        );
    });

    it('slash', async () => {
        const score = (await prepareImporterWithFile('guitarpro8/slash.gp')).readScore();
        GpImporterTestHelper.checkSlash(score);
    });
});
