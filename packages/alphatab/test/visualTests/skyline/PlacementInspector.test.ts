/**
 * Smoke test + live usage example for the {@link PlacementInspectorHelper}.
 */
import { Logger } from '@coderline/alphatab/Logger';
import { describe, expect, it } from 'vitest';
import { PlacementInspectorHelper } from './PlacementInspectorHelper';

describe('PlacementInspectorHelperTests', () => {
    it('renders a report for the slur+trill repro case', async () => {
        const tex = `\\voice
 C4 {tempo 120}
\\voice
r`;
        const report = await PlacementInspectorHelper.inspectPlacement(tex);
        Logger.info('PlacementInspector', `\n${report}\n`);
        expect(report).toContain('inspectPlacement  tex=');
    });

    it('emits the structural fields the bugfix workflow depends on', async () => {
        const report = await PlacementInspectorHelper.inspectPlacement('\\tempo 120 . C4 {txt "A"} C4');
        // Each of these tokens is a contract with the inspector format —
        // bugfix rounds grep through the output for them.
        for (const token of [
            'topOverflow=',
            'bottomOverflow=',
            'systemSkyline.upSky',
            'systemSkyline.downSky',
            'Renderer[0]',
            'barLocal.up',
            'barLocal.down',
            'topBands[',
            'bottomBands[',
            'placedMagnitude=',
            'outerEdge=',
            'band.y=',
            'xLocal=',
            'tier='
        ]) {
            expect(report).toContain(token);
        }
    });
});
