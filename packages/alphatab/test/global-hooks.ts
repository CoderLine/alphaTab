/** @target web */
import { TestPlatform } from 'test/TestPlatform';
import { beforeEach, expect } from 'vitest';
import {
    AlphaTexAstNodePlugin,
    AlphaTexDiagnosticPlugin,
    MidiEventSerializerPlugin,
    type PrettyFormatConfig,
    type PrettyFormatPrinter,
    ScoreSerializerPlugin
} from './PrettyFormat';

const plugins = [
    ScoreSerializerPlugin.instance,
    MidiEventSerializerPlugin.instance,
    AlphaTexDiagnosticPlugin.instance,
    AlphaTexAstNodePlugin.instance
];

for (const plugin of plugins) {
    expect.addSnapshotSerializer({
        test(val) {
            return plugin.test(val);
        },
        serialize(val, config, indentation, depth, refs, printer) {
            return plugin.serialize(
                val,
                config as PrettyFormatConfig,
                indentation,
                depth,
                refs,
                printer as PrettyFormatPrinter
            );
        }
    });
}

beforeEach(() => {
    const fullName = expect.getState().currentTestName ?? '';
    TestPlatform.currentTestName = fullName.split(' > ').pop() ?? '';
});
