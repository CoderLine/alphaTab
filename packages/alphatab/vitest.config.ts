import { defineVitestConfig } from '../tooling/src/vitest';

export default defineVitestConfig({
    setupFiles: ['./test/global-hooks.ts'],
    truncateThreshold: 0
});
