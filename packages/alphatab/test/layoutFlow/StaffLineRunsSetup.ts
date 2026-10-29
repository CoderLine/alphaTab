/** @target web */
import fs from 'node:fs';
import path from 'node:path';
import { VisualTestHelper } from 'test/visualTests/VisualTestHelper';
import { type StaffLineMode, StaffLineRuns } from './StaffLineRuns';

StaffLineRuns.install();
StaffLineRuns.mode = (process.env.STAFF_LINE_MODE as StaffLineMode | undefined) ?? 'production';

const outDir = process.env.STAFF_LINE_OUT;
if (outDir) {
    const helper = VisualTestHelper as any;
    const compare = helper._expectToEqualVisuallyAsync;
    helper._expectToEqualVisuallyAsync = function (actual: any, expectedFileName: string, ...rest: unknown[]) {
        const target = path.join(outDir, expectedFileName);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, new Uint8Array(actual.toPng()));
        return compare.call(this, actual, expectedFileName, ...rest);
    };
}
