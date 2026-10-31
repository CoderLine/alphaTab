import type { model } from '@coderline/alphatab';

export type CodeLanguage = 'typescript' | 'csharp' | 'kotlin' | 'alphatex';

export interface GeneratedCode {
    language: CodeLanguage;
    label: string;
    /** The sync points as data. */
    data: string;
    /** How to apply them; absent where `data` is complete on its own. */
    usage?: string;
}

const round = (v: number) => Number(v.toFixed(4));

export function generateSyncCode(points: model.FlatSyncPoint[]): GeneratedCode[] {
    const ts = points.map(
        (p) => `  { barIndex: ${p.barIndex}, barOccurence: ${p.barOccurence}, barPosition: ${round(p.barPosition)}, millisecondOffset: ${p.millisecondOffset} }`,
    );
    const cs = points.map(
        (p) => `    new() { BarIndex = ${p.barIndex}, BarOccurence = ${p.barOccurence}, BarPosition = ${round(p.barPosition)}, MillisecondOffset = ${p.millisecondOffset} }`,
    );
    const kt = points.map(
        (p) => `    FlatSyncPoint(barIndex = ${p.barIndex}, barOccurence = ${p.barOccurence}, barPosition = ${round(p.barPosition)}, millisecondOffset = ${p.millisecondOffset})`,
    );
    const tex = points.map((p) => {
        const position = p.barPosition > 0 ? ` ${Number(p.barPosition.toFixed(3))}` : '';
        return `\\sync (${p.barIndex} ${p.barOccurence} ${p.millisecondOffset}${position})`;
    });

    return [
        {
            language: 'typescript',
            label: 'TypeScript',
            data: ['const syncPoints: alphaTab.model.FlatSyncPoint[] = [', ts.join(',\n'), '];'].join('\n'),
            usage: [
                '// When the data is at hand while the score loads:',
                'api.scoreLoaded.on(score => {',
                '  score.backingTrack = new alphaTab.model.BackingTrack();',
                '  score.backingTrack.rawAudioFile = audioBytes; // Uint8Array',
                '  score.applyFlatSyncPoints(syncPoints);',
                '});',
                '',
                '// Or later, for the already loaded score:',
                'api.score.applyFlatSyncPoints(syncPoints);',
                'api.score.backingTrack = new alphaTab.model.BackingTrack();',
                'api.score.backingTrack.rawAudioFile = audioBytes;',
                'api.updateSettings();   // starts the backing-track player',
                'api.updateSyncPoints(); // hands the sync points to the player',
            ].join('\n'),
        },
        {
            language: 'csharp',
            label: 'C#',
            data: ['var syncPoints = new AlphaTab.Model.FlatSyncPoint[]', '{', cs.join(',\n'), '};'].join('\n'),
            usage: [
                'api.ScoreLoaded.On(score =>',
                '{',
                '    score.BackingTrack = new AlphaTab.Model.BackingTrack();',
                '    score.BackingTrack.RawAudioFile = audioBytes;',
                '    score.ApplyFlatSyncPoints(syncPoints);',
                '});',
            ].join('\n'),
        },
        {
            language: 'kotlin',
            label: 'Kotlin',
            data: ['val syncPoints = alphaTab.collections.List(', kt.join(',\n'), ')'].join('\n'),
            usage: [
                'api.scoreLoaded.on { score ->',
                '    score.backingTrack = BackingTrack()',
                '    score.backingTrack!!.rawAudioFile = audioBytes',
                '    score.applyFlatSyncPoints(syncPoints)',
                '}',
            ].join('\n'),
        },
        {
            language: 'alphatex',
            label: 'alphaTex',
            data: tex.join('\n'),
        },
    ];
}
