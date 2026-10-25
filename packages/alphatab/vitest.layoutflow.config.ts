import { defineVitestConfig } from '../tooling/src/vitest';

// Layout-flow harness (resize oracle, layout benchmark): not part of `npm test`.
const config = defineVitestConfig({
    setupFiles: ['./test/global-hooks.ts'],
    testTimeout: 60 * 60 * 1000
});
config.test!.include = ['test/layoutFlow/**/*.flow.ts'];
config.test!.fileParallelism = false;

export default config;
