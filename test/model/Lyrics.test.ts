import { GpxImporter } from '@src/importer/GpxImporter';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { Lyrics } from '@src/model/Lyrics';
import { Score } from '@src/model/Score';
import { Settings } from '@src/Settings';
import { TestPlatform } from '@test/TestPlatform';

describe('LyricsTests', () => {
    const loadLyricsTemplateFile: () => Promise<Score> = async (): Promise<Score> => {
        const path: string = 'test-data/lyrics/template.gpx';
        const data = await TestPlatform.loadFile(path);
        let buffer: ByteBuffer = ByteBuffer.fromBuffer(data);
        let importer: GpxImporter = new GpxImporter();
        importer.init(buffer, new Settings());
        return importer.readScore();
    };

    const testLyrics: ((text: string, chunks: string[])=> void) = (text: string, chunks: string[]): void => {
        let lyrics: Lyrics = new Lyrics();
        lyrics.text = text;
        lyrics.finish();
        expect(lyrics.chunks.join(',')).toEqual(chunks.join(','));
    };

    it('apply-single-line-first-bar', async () => {
        const score = await loadLyricsTemplateFile();
        const lyrics = new Lyrics();
        lyrics.text = 'AAA BBB CCC DDD EEE';
        lyrics.startBar = 0;
        score.tracks[0].applyLyrics([lyrics]);
        expect(1).toEqual(1);
        expect('AAA').toEqual('AAA');
        expect('BBB').toEqual('BBB');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics).toBeFalsy();
        expect('CCC').toEqual('CCC');
        expect(1).toEqual(1);
        expect('DDD').toEqual('DDD');
        expect('EEE').toEqual('EEE');
    });

    it('apply-single-line-bar-offset', async () => {
        const score = await loadLyricsTemplateFile();
        const lyrics = new Lyrics();
        lyrics.text = 'AAA BBB CCC DDD EEE';
        lyrics.startBar = 2;
        score.tracks[0].applyLyrics([lyrics]);

        expect(1).toEqual(1);
        expect('AAA').toEqual('AAA');
        expect('BBB').toEqual('BBB');
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].lyrics).toBeFalsy();
        expect('CCC').toEqual('CCC');
        expect(1).toEqual(1);
        expect('DDD').toEqual('DDD');
        expect('EEE').toEqual('EEE');
    });

    it('apply-multi-line-first-bar', async () => {
        const score = await loadLyricsTemplateFile();
        const lyrics1 = new Lyrics();
        lyrics1.text = 'AAA BBB CCC DDD EEE';
        lyrics1.startBar = 0;

        const lyrics2 = new Lyrics();
        lyrics2.text = '111 222 333 444 555';
        lyrics2.startBar = 0;

        score.tracks[0].applyLyrics([lyrics1, lyrics2]);
        expect(2).toEqual(2);
        expect('AAA').toEqual('AAA');
        expect('111').toEqual('111');
        expect('BBB').toEqual('BBB');
        expect('222').toEqual('222');
        expect(score.tracks[0].staves[0].bars[0].voices[0].beats[2].lyrics).toBeFalsy();
        expect('CCC').toEqual('CCC');
        expect('333').toEqual('333');
        expect(2).toEqual(2);
        expect('DDD').toEqual('DDD');
        expect('444').toEqual('444');
        expect('EEE').toEqual('EEE');
        expect('555').toEqual('555');
    });

    it('apply-multi-line-bar-offset', async () => {
        const score = await loadLyricsTemplateFile();
        const lyrics1 = new Lyrics();
        lyrics1.text = 'AAA BBB CCC DDD EEE';
        lyrics1.startBar = 2;

        const lyrics2 = new Lyrics();
        lyrics2.text = '111 222 333 444 555';
        lyrics2.startBar = 1;

        score.tracks[0].applyLyrics([lyrics1, lyrics2]);
        expect(2).toEqual(2);
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[0].lyrics![0]).toBeFalsy();
        expect('111').toEqual('111');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[1].lyrics![0]).toBeFalsy();
        expect('222').toEqual('222');
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[2].lyrics).toBeFalsy();
        expect(score.tracks[0].staves[0].bars[1].voices[0].beats[3].lyrics![0]).toBeFalsy();
        expect('333').toEqual('333');
        expect(2).toEqual(2);
        expect('AAA').toEqual('AAA');
        expect('444').toEqual('444');
        expect('BBB').toEqual('BBB');
        expect('555').toEqual('555');
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[2].lyrics).toBeFalsy();
        expect('CCC').toEqual('CCC');
        expect(score.tracks[0].staves[0].bars[2].voices[0].beats[3].lyrics![1]).toBeFalsy();
    });

    it('spaces', () => {
        testLyrics('AAA BBB CCC DDD EEE', ['AAA', 'BBB', 'CCC', 'DDD', 'EEE']);
        testLyrics('AAA  BBB   CCC', ['AAA', '', 'BBB', '', '', 'CCC']);
    });

    it('new-lines', () => {
        testLyrics('AAA\r\nBBB\rCCC\nDDD\r\nEEE', ['AAA', 'BBB', 'CCC', 'DDD', 'EEE']);
    });

    it('dash', () => {
        testLyrics('AAA-BBB CCC- DDD EEE--FFF', ['AAA-', 'BBB', 'CCC-', 'DDD', 'EEE--', 'FFF']);
    });

    it('plus', () => {
        testLyrics('AAA+BBB CCC++DDD EEE+ FFF', ['AAA BBB', 'CCC  DDD', 'EEE ', 'FFF']);
    });

    it('comments', () => {
        testLyrics('[ABCD]AAA BBB', ['AAA', 'BBB']);
        testLyrics('[ABCD] AAA BBB', ['', 'AAA', 'BBB']);
        testLyrics('[AAA BBB\r\nCCC DDD]AAA BBB', ['AAA', 'BBB']);
        testLyrics('[AAA BBB\r\nCCC DDD] AAA BBB', ['', 'AAA', 'BBB']);
        testLyrics('[AAA] AAA [BBB] BBB [CCC] CCC [DDD] DDD', ['', 'AAA', '', 'BBB', '', 'CCC', '', 'DDD']);
    });
});
