import { ByteBuffer } from "@src/io/ByteBuffer";
import { IOHelper } from "@src/io/IOHelper";
import { ZipEntry } from "@src/zip/ZipEntry";
import { ZipReader } from "@src/zip/ZipReader";
import { ZipWriter } from "@src/zip/ZipWriter";
import { TestPlatform } from "@test/TestPlatform";

describe('ZipReaderWriter', () => {
    it('simple-read', async () => {
        const data = await TestPlatform.loadFile('test-data/guitarpro7/score-info.gp');
        const reader = new ZipReader(ByteBuffer.fromBuffer(data));
        const entries = reader.read();

        expect(entries.map(e => e.fileName).join(',')).toEqual('Content/,BinaryStylesheet,LayoutConfiguration,PartConfiguration,Preferences.json,score.gpif,VERSION');
        expect(entries.map(e => e.data.length).join(',')).toEqual('0,19651,14,27,192,22998,3');
    });

    it('simple-roundtrip', () => {
        const data = ByteBuffer.withCapacity(1024);
        const writer = new ZipWriter(data);

        const entry1 = new ZipEntry('File01.txt', IOHelper.stringToBytes('File01'));
        const entry2 = new ZipEntry('Folder/', new Uint8Array(0));
        const entry3 = new ZipEntry('Folder/File02.txt', IOHelper.stringToBytes('File02'));

        const textParts = [
            '<Test>', 'Text', 'Hello World', 'alphaTab', 'Deflate',
            'Lorem ipsum dolor sit amet'
        ];

        let text = '';
        while(text.length < 8 * 1024) {
            text += textParts[Math.floor(Math.random() * textParts.length)];
        }
        const entry4 = new ZipEntry('LargeFile', IOHelper.stringToBytes(text));

        writer.writeEntry(entry1);
        writer.writeEntry(entry2);
        writer.writeEntry(entry3);
        writer.writeEntry(entry4);
        writer.end();

        data.position = 0;
        const reader = new ZipReader(data);
        const entries = reader.read();

        expect(entries[0].fileName).toEqual('File01.txt');
        expect(IOHelper.toString(entries[0].data, 'utf-8')).toEqual('File01');

        expect(entries[2].fileName).toEqual('File02.txt');
        expect(IOHelper.toString(entries[2].data, 'utf-8')).toEqual('File02');

        expect(entries[3].fileName).toEqual('LargeFile');
        expect(IOHelper.toString(entries[3].data, 'utf-8')).toEqual(text);
    });
});
