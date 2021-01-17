import { LayoutMode } from '@src/DisplaySettings';
import { Settings } from '@src/Settings';
import { VisualTestHelper } from '@test/visualTests/VisualTestHelper';
import { TestPlatform } from '@test/TestPlatform';
import { ScoreLoader } from '@src/importer/ScoreLoader';
import { Score } from '@src/model/Score';

describe('NotationLegend', () => {
    it('full-default', async () => { await runNotationLegendTest(`full-default.png`, 1, -1, false); });
    it('full-songbook', async () => { await runNotationLegendTest(`full-songbook.png`, 1, -1, true); });

    it('bends-default', async () => { await runNotationLegendTest(`bends-default.png`, 1, 29, false); });
    it('bends-songbook', async () => { await runNotationLegendTest(`bends-songbook.png`, 1, 29, true); });

    it('grace-default', async () => { await runNotationLegendTest(`grace-default.png`, 30, 2, false); });
    it('grace-songbook', async () => { await runNotationLegendTest(`grace-songbook.png`, 30, 2, true); });

    it('vibrato-default', async () => { await runNotationLegendTest(`vibrato-default.png`, 32, 4, false); });
    it('vibrato-songbook', async () => { await runNotationLegendTest(`vibrato-songbook.png`, 32, 4, true); });

    it('multi-grace-default', async () => { await runNotationLegendTest(`multi-grace-default.png`, 36, 4, false); });
    it('multi-grace-songbook', async () => { await runNotationLegendTest(`multi-grace-songbook.png`, 36, 4, true); });

    it('pick-stroke-default', async () => { await runNotationLegendTest(`pick-stroke-default.png`, 40, 1, false); });
    it('pick-stroke-songbook', async () => { await runNotationLegendTest(`pick-stroke-songbook.png`, 40, 1, true); });

    it('slides-default', async () => { await runNotationLegendTest(`slides-default.png`, 41, 8, false); });
    it('slides-songbook', async () => { await runNotationLegendTest(`slides-songbook.png`, 41, 8, true); });

    it('hammer-default', async () => { await runNotationLegendTest(`hammer-default.png`, 49, 5, false); });
    it('hammer-songbook', async () => { await runNotationLegendTest(`hammer-songbook.png`, 49, 5, true); });

    it('accentuations-default', async () => { await runNotationLegendTest(`accentuations-default.png`, 54, 4, false); });
    it('accentuations-songbook', async () => { await runNotationLegendTest(`accentuations-songbook.png`, 44, 4, true); });

    it('trill-default', async () => { await runNotationLegendTest(`trill-default.png`, 58, 2, false); });
    it('trill-songbook', async () => { await runNotationLegendTest(`trill-songbook.png`, 58, 2, true); });

    it('dead-default', async () => { await runNotationLegendTest(`dead-default.png`, 60, 2, false); });
    it('dead-songbook', async () => { await runNotationLegendTest(`dead-songbook.png`, 60, 2, true); });

    it('harmonics-default', async () => { await runNotationLegendTest(`harmonics-default.png`, 62, 7, false); });
    it('harmonics-songbook', async () => { await runNotationLegendTest(`harmonics-songbook.png`, 62, 7, true); });

    it('repeat-bar-default', async () => { await runNotationLegendTest(`tap-riff-default.png`, 69, 4, false); });
    it('repeat-bar-songbook', async () => { await runNotationLegendTest(`tap-riff-songbook.png`, 69, 4, true); });

    it('multi-voice-default', async () => { await runNotationLegendTest(`multi-voice-default.png`, 73, 1, false); });
    it('multi-voice-songbook', async () => { await runNotationLegendTest(`multi-voice-songbook.png`, 73, 1, true); });

    it('arpeggio-default', async () => { await runNotationLegendTest(`arpeggio-default.png`, 74, 2, false); });
    it('arpeggio-songbook', async () => { await runNotationLegendTest(`arpeggio-songbook.png`, 74, 2, true); });

    it('triplet-feel-default', async () => { await runNotationLegendTest(`triplet-feel-default.png`, 76, 3, false); });
    it('triplet-feel-songbook', async () => { await runNotationLegendTest(`triplet-feel-songbook.png`, 76, 3, true); });

    it('ottavia-default', async () => { await runNotationLegendTest(`ottavia-default.png`, 79, 2, false); });
    it('ottavia-songbook', async () => { await runNotationLegendTest(`ottavia-songbook.png`, 79, 2, true); });

    it('crescendo-default', async () => { await runNotationLegendTest(`crescendo-default.png`, 81, 1, false); });
    it('crescendo-songbook', async () => { await runNotationLegendTest(`crescendo-songbook.png`, 81, 1, true); });

    it('tempo-change-default', async () => { await runNotationLegendTest(`tempo-change-default.png`, 81, 5, false); });
    it('tempo-change-songbook', async () => { await runNotationLegendTest(`tempo-change-songbook.png`, 81, 5, true); });

    it('slash-default', async () => { await runNotationLegendTest(`slash-default.png`, 86, 1, false); });
    it('slash-songbook', async () => { await runNotationLegendTest(`slash-songbook.png`, 86, 1, true); });

    it('text-default', async () => { await runNotationLegendTest(`text-default.png`, 87, 1, false); });
    it('text-songbook', async () => { await runNotationLegendTest(`text-songbook.png`, 87, 1, true); });

    it('chords-default', async () => { await runNotationLegendTest(`chords-default.png`, 88, 2, false); });
    it('chords-songbook', async () => { await runNotationLegendTest(`chords-songbook.png`, 88, 2, true); });

    it('staccatissimo-default', async () => { await runNotationLegendTest(`staccatissimo-default.png`, 90, 1, false); });
    it('staccatissimo-songbook', async () => { await runNotationLegendTest(`staccatissimo-songbook.png`, 90, 1, true); });

    it('wah-default', async () => { await runNotationLegendTest(`wah-default.png`, 91, 1, false); });
    it('wah-songbook', async () => { await runNotationLegendTest(`wah-songbook.png`, 91, 1, true); });

    it('dynamics-default', async () => { await runNotationLegendTest(`dynamics-default.png`, 92, 1, false); });
    it('dynamics-songbook', async () => { await runNotationLegendTest(`dynamics-songbook.png`, 92, 1, true); });

    it('sweep-default', async () => { await runNotationLegendTest(`sweep-default.png`, 93, 1, false); });
    it('sweep-songbook', async () => { await runNotationLegendTest(`sweep-songbook.png`, 92, 1, true); });

    it('fingering-default', async () => { await runNotationLegendTest(`fingering-default.png`, 94, 2, false); });
    it('fingering-songbook', async () => { await runNotationLegendTest(`fingering-songbook.png`, 94, 2, true); });

    it('whammy-default', async () => { await runNotationLegendTest(`whammy-default.png`, 96, 15, false); });
    it('whammy-songbook', async () => { await runNotationLegendTest(`whammy-songbook.png`, 96, 15, true); });

    it('let-ring-default', async () => { await runNotationLegendTest(`let-ring-default.png`, 111, 10, false); });
    it('let-ring-songbook', async () => { await runNotationLegendTest(`let-ring-songbook.png`, 111, 10, true); });

    it('mixed-default', async () => { await runNotationLegendTest(`mixed-default.png`, 121, 7, false); });
    it('mixed-songbook', async () => { await runNotationLegendTest(`mixed-songbook.png`, 121, 7, true); });

    it('tied-note-accidentals-default', async () => { await runNotationLegendTest(`tied-note-accidentals-default.png`, 1, -1, false, 'tied-note-accidentals.gp'); });
    it('tied-note-accidentals-songbook', async () => { await runNotationLegendTest(`tied-note-accidentals-songbook.png`, 1, -1, true, 'tied-note-accidentals.gp'); });

    async function runNotationLegendTest(referenceFileName: string, startBar: number, barCount: number, songBook: boolean, fileName: string = 'notation-legend.gp'): Promise<void> {
        let settings: Settings = new Settings();
        settings.display.layoutMode = LayoutMode.Horizontal;
        settings.display.startBar = startBar;
        settings.display.barCount = barCount;
        if (songBook) {
            settings.setSongBookModeSettings();
        }
        const inputFileData = await TestPlatform.loadFile(`test-data/visual-tests/notation-legend/${fileName}`);
        let score: Score = ScoreLoader.loadScoreFromBytes(inputFileData, settings);
        await VisualTestHelper.runVisualTestScore(score, `notation-legend/${referenceFileName}`, settings, [0]);
    }
});
