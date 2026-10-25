/** @target web */
// Visual tests with the staff-line paint mode of StaffLineRuns (STAFF_LINE_MODE=perBar|runs|none);
// STAFF_LINE_OUT=<dir> additionally saves every rendered image for an exact old/new comparison.
// Run from packages/alphatab: npx vitest run --config test/layoutFlow/StaffLineImages.config.ts test/visualTests
import { defineVitestConfig } from '../../../tooling/src/vitest';

export default defineVitestConfig({
    setupFiles: ['./test/global-hooks.ts', './test/layoutFlow/StaffLineRunsSetup.ts'],
    truncateThreshold: 0
});
