import { describe, it } from 'vitest';

import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';

describe('StaffDisplayConfig', () => {
    describe('Primary cascade — multi-notation single-track stacks', () => {
        it('cascade-score-tab', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {score tabs}
                    \\ks D
                    3.3.4 3.3 3.3 3.3 |
                    3.3 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/cascade-score-tab.png'
            );
        });

        it('cascade-tab-only', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {tabs}
                    3.3.4 3.3 r.4 3.3 |
                    3.3 -.3 3.3 r.4 |
                `,
                'test-data/visual-tests/staff-display-config/cascade-tab-only.png'
            );
        });

        it('cascade-tab-slash', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {tabs slash}
                    3.3.4 3.3 3.3 3.3 |
                    3.3 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/cascade-tab-slash.png'
            );
        });

        it('cascade-slash-numbered', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {slash numbered}
                    \\ks G
                    3.3.4 3.3 3.3 3.3 |
                    3.3 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/cascade-slash-numbered.png'
            );
        });

        it('cascade-numbered-only', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {numbered}
                    \\ks G
                    3.3.4 3.3 3.3 3.3 |
                    3.3 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/cascade-numbered-only.png'
            );
        });

        it('cascade-all-four', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {score tabs slash numbered}
                    \\ks F
                    3.3.4 3.3 3.3 3.3 |
                    3.3 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/cascade-all-four.png'
            );
        });
    });

    describe('Per-staff (L2) overrides', () => {
        it('override-l2-tab-ts-hide', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {tabs}
                    \\staffDisplay tabs { tsVisibility false }
                    3.3.4 3.3 3.3 3.3 |
                    3.3 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/override-l2-tab-ts-hide.png'
            );
        });

        it('override-l2-score-clef-hide', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {score}
                    \\staffDisplay score { clefVisibility false }
                    \\ks D
                    3.3.4 3.3 3.3 3.3 |
                    3.3 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/override-l2-score-clef-hide.png'
            );
        });
    });

    describe('Per-bar (L1) overrides', () => {
        it('override-l1-ks-change-hide', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {score}
                    \\ks D
                    3.3.4 3.3 3.3 3.3 |
                    \\ks A
                    \\barDisplay score { ksVisibility false }
                    3.3.4 3.3 3.3 3.3 |
                    3.3.4 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/override-l1-ks-change-hide.png'
            );
        });

        it('override-l1-ts-hide-firstbar', async () => {
            await VisualTestHelper.runVisualTestTex(
                `
                    \\track
                    \\staff {score tabs}
                    \\barDisplay score { tsVisibility false }
                    3.3.4 3.3 3.3 3.3 |
                    3.3 3.3 3.3 3.3 |
                `,
                'test-data/visual-tests/staff-display-config/override-l1-ts-hide-firstbar.png'
            );
        });
    });
});
