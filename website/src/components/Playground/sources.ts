import type { ScoreSource } from '@site/src/alphatab-react';
import { DEMO_FILES } from '@site/src/components/landing/LandingPlayerStage/demo-files';
import { PRESETS } from '@site/src/components/landing/LandingPlayground/presets';

/** A score the Playground can open by id, e.g. `/playground?file=iron-waltz`. */
export interface PlaygroundSample {
    id: string;
    fileName: string;
    group: 'Files' | 'alphaTex';
    color: string;
    source: ScoreSource;
}

export const PLAYGROUND_SAMPLES: PlaygroundSample[] = [
    ...DEMO_FILES.map((f): PlaygroundSample => ({
        id: f.id,
        fileName: f.label,
        group: 'Files',
        color: f.trackColor,
        source: f.source,
    })),
    ...PRESETS.map((p): PlaygroundSample => ({
        id: `tex-${p.id}`,
        fileName: p.fileName,
        group: 'alphaTex',
        color: 'var(--at-accent)',
        source: { tex: p.tex },
    })),
];

export const DEFAULT_SAMPLE_ID = 'iron-waltz';

export function findSample(id: string | null | undefined): PlaygroundSample | undefined {
    return id ? PLAYGROUND_SAMPLES.find((s) => s.id === id) : undefined;
}
