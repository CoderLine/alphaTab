import { SystemsLayoutMode } from '@coderline/alphatab/DisplaySettings';
import { LayoutMode } from '@coderline/alphatab/LayoutMode';
import { Settings } from '@coderline/alphatab/Settings';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

/**
 * Regression coverage for the fixed-overhead layout fix: prefix glyphs (clef, key sig, time sig, barlines)
 * are now treated as fixed overhead and the remaining staff width is distributed across bars by a per-bar
 * weight, matching Behind Bars / Dorico / Finale / Sibelius / MuseScore / Guitar Pro.
 *
 * Weight source by mode:
 *   - Parchment and Page with UseModelLayout -> bar.displayScale (default 1 == unset, matches GP)
 *   - Page with Automatic                    -> natural content width (displayScale ignored)
 */
describe('PrefixOverheadTests', () => {
    it('parchment-prefix-system-start', async () => {
        // Bar 1 carries the system-start prefix (clef + 3/4 time sig + G-major key sig).
        // Bars 2-3 are plain. Expectation: bar 1 is visibly wider than bars 2-3.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\ks G \\ts 3 4
            :4 c4 c4 c4 | c4 c4 c4 | c4 c4 c4
            `,
            'test-data/visual-tests/prefix-overhead/parchment-prefix-system-start.png',
            settings
        );
    });

    it('parchment-prefix-midline-keysig-change', async () => {
        // Bar 3 carries a mid-line key-signature change (C-major -> D-major). Expectation: bar 3 is
        // visibly wider than bars 2 and 4 because the new KS glyphs take fixed overhead.
        // defaultSystemsLayout forces all four bars onto a single system so the prefix/no-prefix
        // width comparison is visible at a glance rather than split across wrapped lines.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\track { defaultSystemsLayout 4 }
            \\ts 4 4
            :4 c4 c4 c4 c4 | c4 c4 c4 c4 | \\ks D c4 c4 c4 c4 | c4 c4 c4 c4
            `,
            'test-data/visual-tests/prefix-overhead/parchment-prefix-midline-keysig-change.png',
            settings
        );
    });

    it('parchment-authored-scale-with-prefix', async () => {
        // Mirror of the Guitar Pro "file 2" test that drove the design: bar 1 has a system-start prefix
        // (clef + 4/4) and displayScale=1, bar 2 has no prefix and displayScale=2. Expectation: bar 2's
        // content area is roughly twice as wide as bar 1's content area, while bar 1 retains its full
        // prefix overhead on top of its content share.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Parchment;
        await VisualTestHelper.runVisualTestTex(
            `
            \\ts 4 4
            \\scale 1 :4 c4 c4 c4 c4 | \\scale 2 c4 c4 c4 c4
            `,
            'test-data/visual-tests/prefix-overhead/parchment-authored-scale-with-prefix.png',
            settings
        );
    });

    it('page-automatic-prefix-system-start', async () => {
        // Same score as parchment-prefix-system-start, rendered in Page layout with SystemsLayoutMode.Automatic.
        // Expectation: bar 1 is still visibly wider than bars 2-3 because fixed overhead applies in both
        // modes. The weight source (content-width vs displayScale) differs, but the prefix bucket does not.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.systemsLayoutMode = SystemsLayoutMode.Automatic;
        await VisualTestHelper.runVisualTestTex(
            `
            \\ks G \\ts 3 4
            :4 c4 c4 c4 | c4 c4 c4 | c4 c4 c4
            `,
            'test-data/visual-tests/prefix-overhead/page-automatic-prefix-system-start.png',
            settings
        );
    });

    it('page-automatic-ignores-displayscale', async () => {
        // Three bars with identical rhythmic content but middle bar authored to displayScale=2. In Page
        // with SystemsLayoutMode.Automatic, displayScale must be ignored: the three bars should therefore
        // receive equal content-area widths, driven by their equal natural content width. This guards
        // against regressions that would make Page silently honour authored scales.
        const settings = new Settings();
        settings.display.layoutMode = LayoutMode.Page;
        settings.display.systemsLayoutMode = SystemsLayoutMode.Automatic;
        await VisualTestHelper.runVisualTestTex(
            `
            \\ts 4 4
            :4 c4 c4 c4 c4 | \\scale 2 c4 c4 c4 c4 | c4 c4 c4 c4
            `,
            'test-data/visual-tests/prefix-overhead/page-automatic-ignores-displayscale.png',
            settings
        );
    });
});
