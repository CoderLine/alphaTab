/**
 * This public class provides names for all general midi instruments.
 */
export class GeneralMidi {
    private static _values: Map<string, number> = new Map([
        ['acousticgrandpiano', 0], ['brightacousticpiano', 1], ['electricgrandpiano', 2],
        ['honkytonkpiano', 3], ['electricpiano1', 4], ['electricpiano2', 5], ['harpsichord', 6],
        ['clavinet', 7], ['celesta', 8], ['glockenspiel', 9], ['musicbox', 10], ['vibraphone', 11],
        ['marimba', 12], ['xylophone', 13], ['tubularbells', 14], ['dulcimer', 15],
        ['drawbarorgan', 16], ['percussiveorgan', 17], ['rockorgan', 18], ['churchorgan', 19],
        ['reedorgan', 20], ['accordion', 21], ['harmonica', 22], ['tangoaccordion', 23],
        ['acousticguitarnylon', 24], ['acousticguitarsteel', 25], ['electricguitarjazz', 26],
        ['electricguitarclean', 27], ['electricguitarmuted', 28], ['overdrivenguitar', 29],
        ['distortionguitar', 30], ['guitarharmonics', 31], ['acousticbass', 32],
        ['electricbassfinger', 33], ['electricbasspick', 34], ['fretlessbass', 35],
        ['slapbass1', 36], ['slapbass2', 37], ['synthbass1', 38], ['synthbass2', 39],
        ['violin', 40], ['viola', 41], ['cello', 42], ['contrabass', 43], ['tremolostrings', 44],
        ['pizzicatostrings', 45], ['orchestralharp', 46], ['timpani', 47], ['stringensemble1', 48],
        ['stringensemble2', 49], ['synthstrings1', 50], ['synthstrings2', 51], ['choiraahs', 52],
        ['voiceoohs', 53], ['synthvoice', 54], ['orchestrahit', 55], ['trumpet', 56],
        ['trombone', 57], ['tuba', 58], ['mutedtrumpet', 59], ['frenchhorn', 60],
        ['brasssection', 61], ['synthbrass1', 62], ['synthbrass2', 63], ['sopranosax', 64],
        ['altosax', 65], ['tenorsax', 66], ['baritonesax', 67], ['oboe', 68], ['englishhorn', 69],
        ['bassoon', 70], ['clarinet', 71], ['piccolo', 72], ['flute', 73], ['recorder', 74],
        ['panflute', 75], ['blownbottle', 76], ['shakuhachi', 77], ['whistle', 78], ['ocarina', 79],
        ['lead1square', 80], ['lead2sawtooth', 81], ['lead3calliope', 82], ['lead4chiff', 83],
        ['lead5charang', 84], ['lead6voice', 85], ['lead7fifths', 86], ['lead8bassandlead', 87],
        ['pad1newage', 88], ['pad2warm', 89], ['pad3polysynth', 90], ['pad4choir', 91],
        ['pad5bowed', 92], ['pad6metallic', 93], ['pad7halo', 94], ['pad8sweep', 95],
        ['fx1rain', 96], ['fx2soundtrack', 97], ['fx3crystal', 98], ['fx4atmosphere', 99],
        ['fx5brightness', 100], ['fx6goblins', 101], ['fx7echoes', 102], ['fx8scifi', 103],
        ['sitar', 104], ['banjo', 105], ['shamisen', 106], ['koto', 107], ['kalimba', 108],
        ['bagpipe', 109], ['fiddle', 110], ['shanai', 111], ['tinklebell', 112], ['agogo', 113],
        ['steeldrums', 114], ['woodblock', 115], ['taikodrum', 116], ['melodictom', 117],
        ['synthdrum', 118], ['reversecymbal', 119], ['guitarfretnoise', 120], ['breathnoise', 121],
        ['seashore', 122], ['birdtweet', 123], ['telephonering', 124], ['helicopter', 125],
        ['applause', 126], ['gunshot', 127]
    ]);

    public static getValue(name: string): number {
        if (!GeneralMidi._values) {
            GeneralMidi._values = new Map<string, number>();
        }
        name = name.toLowerCase().split(' ').join('');
        return GeneralMidi._values.has(name) ? GeneralMidi._values.get(name)! : 0;
    }

    public static isPiano(program: number): boolean {
        return program <= 7 || program >= 16 && program <= 23;
    }

    public static isGuitar(program: number): boolean {
        return program >= 24 && program <= 39 || program === 105 || program === 43;
    }
}
