import { appendFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

class SummaryLabelReporter {
    constructor(private readonly label: string) {}
    onInit() {
        if (process.env.GITHUB_STEP_SUMMARY) {
            appendFileSync(process.env.GITHUB_STEP_SUMMARY, `# ${this.label}\n`);
        }
    }
}

export interface VitestPackageOptions {
    setupFiles?: string[];
    truncateThreshold?: number;
    testTimeout?: number;
}

export function defineVitestConfig(options: VitestPackageOptions = {}) {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const reporters =
        process.env.GITHUB_ACTIONS === 'true'
            ? ['default', 'github-actions', new SummaryLabelReporter(pkg.name)]
            : ['default'];
    return defineConfig({
        plugins: [tsconfigPaths()],
        test: {
            include: ['test/**/*.test.ts'],
            testTimeout: options.testTimeout ?? 10000,
            setupFiles: options.setupFiles,
            passWithNoTests: true,
            chaiConfig: options.truncateThreshold !== undefined
                ? { truncateThreshold: options.truncateThreshold }
                : undefined,
            reporters
        }
    });
}
