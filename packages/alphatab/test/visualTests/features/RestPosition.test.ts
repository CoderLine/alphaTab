import { describe, it } from 'vitest';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

interface PitchPosition {
    pitch: string;
    label: string;
}

interface ClefData {
    clef: string;
    tex: string;
    filler: string;
    primaryFiller: string;
    secondaryFiller: string;
    multiVoicePrimary: PitchPosition;
    multiVoiceSecondary: PitchPosition;
    positions: PitchPosition[];
}

// Staff positions from bottom to top for each clef
const clefs: ClefData[] = [
    {
        clef: 'treble',
        tex: '',
        filler: 'b4',
        positions: [
            { pitch: 'E4', label: 'Line 1' },
            { pitch: 'F4', label: 'Space 1' },
            { pitch: 'G4', label: 'Line 2' },
            { pitch: 'A4', label: 'Space 2' },
            { pitch: 'B4', label: 'Line 3' },
            { pitch: 'C5', label: 'Space 3' },
            { pitch: 'D5', label: 'Line 4' },
            { pitch: 'E5', label: 'Space 4' },
            { pitch: 'F5', label: 'Line 5' },
            { pitch: 'G5', label: 'Space 5' }
        ],
        primaryFiller: 'e5',
        secondaryFiller: 'e4',
        multiVoicePrimary: { pitch: 'C5', label: 'Space 3' },
        multiVoiceSecondary: { pitch: 'E4', label: 'Line 1' }
    },
    {
        clef: 'bass',
        tex: '\\clef bass',
        filler: 'd3',
        positions: [
            { pitch: 'G2', label: 'Line 1' },
            { pitch: 'A2', label: 'Space 1' },
            { pitch: 'B2', label: 'Line 2' },
            { pitch: 'C3', label: 'Space 2' },
            { pitch: 'D3', label: 'Line 3' },
            { pitch: 'E3', label: 'Space 3' },
            { pitch: 'F3', label: 'Line 4' },
            { pitch: 'G3', label: 'Space 4' },
            { pitch: 'A3', label: 'Line 5' },
            { pitch: 'B3', label: 'Space 5' }
        ],
        primaryFiller: 'a3',
        secondaryFiller: 'g2',
        multiVoicePrimary: { pitch: 'E3', label: 'Space 3' },
        multiVoiceSecondary: { pitch: 'G2', label: 'Line 1' }
    },
    {
        clef: 'alto',
        tex: '\\clef alto',
        filler: 'c4',
        positions: [
            { pitch: 'F3', label: 'Line 1' },
            { pitch: 'G3', label: 'Space 1' },
            { pitch: 'A3', label: 'Line 2' },
            { pitch: 'B3', label: 'Space 2' },
            { pitch: 'C4', label: 'Line 3' },
            { pitch: 'D4', label: 'Space 3' },
            { pitch: 'E4', label: 'Line 4' },
            { pitch: 'F4', label: 'Space 4' },
            { pitch: 'G4', label: 'Line 5' },
            { pitch: 'A4', label: 'Space 5' }
        ],
        primaryFiller: 'g4',
        secondaryFiller: 'f3',
        multiVoicePrimary: { pitch: 'D4', label: 'Space 3' },
        multiVoiceSecondary: { pitch: 'F3', label: 'Line 1' }
    },
    {
        clef: 'tenor',
        tex: '\\clef tenor',
        filler: 'a3',
        positions: [
            { pitch: 'D3', label: 'Line 1' },
            { pitch: 'E3', label: 'Space 1' },
            { pitch: 'F3', label: 'Line 2' },
            { pitch: 'G3', label: 'Space 2' },
            { pitch: 'A3', label: 'Line 3' },
            { pitch: 'B3', label: 'Space 3' },
            { pitch: 'C4', label: 'Line 4' },
            { pitch: 'D4', label: 'Space 4' },
            { pitch: 'E4', label: 'Line 5' },
            { pitch: 'F4', label: 'Space 5' }
        ],
        primaryFiller: 'e4',
        secondaryFiller: 'd3',
        multiVoicePrimary: { pitch: 'B3', label: 'Space 3' },
        multiVoiceSecondary: { pitch: 'D3', label: 'Line 1' }
    }
];

function restBeat(pitch: string, label: string, duration: string, showLabel: boolean = true): string {
    if (showLabel) {
        return `r.${duration}{restDisplayPitch ${pitch} txt "${label}"}`;
    }
    return `r.${duration}{restDisplayPitch ${pitch}}`;
}

function clefPrimaryDurations(tex: string, filler: string, pitch: string, label: string): string {
    const prefix = tex ? `${tex} ` : '';
    return `${prefix}${restBeat(pitch, label, '1')} | ${restBeat(pitch, label, '2')} ${filler}.2 | ${restBeat(pitch, label, '4')} ${filler}.4 *3 | ${restBeat(pitch, label, '8')} ${filler}.8 *7 | ${restBeat(pitch, label, '16')} ${filler}.16 *15 | ${restBeat(pitch, label, '32')} ${filler}.32 *31`;
}

function voicePrimaryDurations(filler: string, pitch: string, label: string): string {
    return `${restBeat(pitch, label, '1')} | ${restBeat(pitch, label, '2')} ${filler}.2 | ${restBeat(pitch, label, '4')} ${filler}.4 *3 | ${restBeat(pitch, label, '8')} ${filler}.8 *7 | ${restBeat(pitch, label, '16')} ${filler}.16 *15 | ${restBeat(pitch, label, '32')} ${filler}.32 *31`;
}

function voiceSecondaryDurations(filler: string, pitch: string, label: string): string {
    return `${filler}.1 | ${filler}.2 ${restBeat(pitch, label, '2')} | ${filler}.4 *3 ${restBeat(pitch, label, '4')} | ${filler}.8 *7 ${restBeat(pitch, label, '8')} | ${filler}.16 *15 ${restBeat(pitch, label, '16')} | ${filler}.32 *31 ${restBeat(pitch, label, '32')}`;
}

function voiceDefaultPrimary(filler: string): string {
    return `r.1 | r.2 ${filler}.2 | r.4 ${filler}.4 *3 | r.8 ${filler}.8 *7 | r.16 ${filler}.16 *15 | r.32 ${filler}.32 *31`;
}

function voiceDefaultSecondary(filler: string): string {
    return `${filler}.1 | ${filler}.2 r.2 | ${filler}.4 *3 r.4 | ${filler}.8 *7 r.8 | ${filler}.16 *15 r.16 | ${filler}.32 *31 r.32`;
}

describe('RestPositionTests', () => {
    it('rest-position-default', async () => {
        await VisualTestHelper.runVisualTestTex(
            `r.1 | r.2 e5.2 | r.4 e5.4 *3 | r.8 e5.8 *7 | r.16 e5.16 *15 | r.32 e5.32 *31`,
            'test-data/visual-tests/rest-position/rest-position-default.png'
        );
    });

    for (const clefData of clefs) {
        describe(`rest-position-${clefData.clef}`, () => {
            const prefix = clefData.tex ? `${clefData.tex} ` : '';

            for (const pos of clefData.positions) {
                it(`position-${pos.pitch} - ${pos.label}`, async () => {
                    await VisualTestHelper.runVisualTestTex(
                        clefPrimaryDurations(clefData.tex, clefData.filler, pos.pitch, pos.label),
                        `test-data/visual-tests/rest-position/${clefData.clef}/rest-position-pitch-${pos.pitch}-${pos.label.toLowerCase().replace(' ', '-')}.png`
                    );
                });
            }

            it('multi-voice-default', async () => {
                await VisualTestHelper.runVisualTestTex(
                    `${prefix}\\voice ${voiceDefaultPrimary(clefData.primaryFiller)} \\voice ${voiceDefaultSecondary(clefData.secondaryFiller)}`,
                    `test-data/visual-tests/rest-position/${clefData.clef}/rest-position-multi-voice-default.png`
                );
            });

            it('multi-voice-both-set', async () => {
                await VisualTestHelper.runVisualTestTex(
                    `${prefix}\\voice ${voicePrimaryDurations(clefData.primaryFiller, clefData.multiVoicePrimary.pitch, clefData.multiVoicePrimary.label)} \\voice ${voiceSecondaryDurations(clefData.secondaryFiller, clefData.multiVoiceSecondary.pitch, clefData.multiVoiceSecondary.label)}`,
                    `test-data/visual-tests/rest-position/${clefData.clef}/rest-position-multi-voice-both-set.png`
                );
            });

            it('multi-voice-main-only', async () => {
                await VisualTestHelper.runVisualTestTex(
                    `${prefix}\\voice ${voicePrimaryDurations(clefData.primaryFiller, clefData.multiVoicePrimary.pitch, clefData.multiVoicePrimary.label)} \\voice ${voiceDefaultSecondary(clefData.secondaryFiller)}`,
                    `test-data/visual-tests/rest-position/${clefData.clef}/rest-position-multi-voice-main-only-${clefData.multiVoicePrimary.pitch}-${clefData.multiVoicePrimary.label.toLowerCase().replace(' ', '-')}.png`
                );
            });

            it('multi-voice-secondary-only', async () => {
                await VisualTestHelper.runVisualTestTex(
                    `${prefix}\\voice ${voiceDefaultPrimary(clefData.primaryFiller)} \\voice ${voiceSecondaryDurations(clefData.secondaryFiller, clefData.multiVoiceSecondary.pitch, clefData.multiVoiceSecondary.label)}`,
                    `test-data/visual-tests/rest-position/${clefData.clef}/rest-position-multi-voice-secondary-only-${clefData.multiVoiceSecondary.pitch}-${clefData.multiVoiceSecondary.label.toLowerCase().replace(' ', '-')}.png`
                );
            });

            describe('staff-lines', () => {
                for (const lineCount of [1, 2, 3, 4, 5]) {
                    it(`linecount-${lineCount}`, async () => {
                        await VisualTestHelper.runVisualTestTex(
                            `${prefix}\\staff { score ${lineCount} } ${restBeat(clefData.multiVoiceSecondary.pitch, clefData.multiVoiceSecondary.label, '1', false)} | ${restBeat(clefData.multiVoiceSecondary.pitch, clefData.multiVoiceSecondary.label, '2', false)} ${clefData.secondaryFiller}.2 | ${restBeat(clefData.multiVoiceSecondary.pitch, clefData.multiVoiceSecondary.label, '4', false)} ${clefData.secondaryFiller}.4 *3`,
                            `test-data/visual-tests/rest-position/${clefData.clef}/rest-position-staff-lines-${lineCount}-${clefData.multiVoiceSecondary.pitch}.png`
                        );
                    });
                }
            });
        });
    }
});
