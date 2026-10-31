import type * as alphaTab from '@coderline/alphatab';
import { useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import clsx from 'clsx';
import { useState } from 'react';
import type { RhythmConfig } from './RhythmConfig';
import styles from './recorder.module.scss';

const TICK_LENGTH = 12;

interface GridTick {
    main: boolean;
    x: number;
    y: number;
}

function gridTicks(api: alphaTab.AlphaTabApi, rhythm: RhythmConfig): GridTick[] {
    const ticks: GridTick[] = [];
    for (const system of api.renderer?.boundsLookup?.staffSystems ?? []) {
        for (const masterBarBounds of system.bars) {
            for (const barBounds of masterBarBounds.bars) {
                const { y, h } = barBounds.realBounds;
                const beats = barBounds.beats;
                for (let i = 0; i < beats.length && i < rhythm.beatMask.length; i++) {
                    const weight = rhythm.beatMask[i];
                    if (weight > rhythm.displayWeightThreshold) {
                        continue;
                    }
                    const x = beats[i].realBounds.x;
                    ticks.push({ main: weight === 4, x, y: y - TICK_LENGTH }, { main: weight === 4, x, y: y + h });
                }
            }
        }
    }
    return ticks;
}

/** Marks the rhythm slots above and below every bar. Place it in the score overlay of the player. */
export function RhythmGrid({ rhythm }: { rhythm: RhythmConfig }) {
    const api = useAlphaTabApi();
    const [ticks, setTicks] = useState<GridTick[]>([]);
    useAlphaTabEvent(api, 'postRenderFinished', () => {
        if (api) {
            setTicks(gridTicks(api, rhythm));
        }
    });

    return (
        <div className={styles.grid} aria-hidden="true">
            {ticks.map((t, i) => (
                <div
                    key={i}
                    className={clsx(styles.gridTick, t.main && styles.gridTickMain)}
                    style={{ left: t.x, top: t.y, width: t.main ? 2 : 1, height: TICK_LENGTH }}
                />
            ))}
        </div>
    );
}
