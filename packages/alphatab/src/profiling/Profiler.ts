/**
 * Profiling instrumentation. Call sites are stripped from production /
 * library / vitest / playground builds by `stripProfilingPlugin` and only
 * retained in the bench harness.
 */

export interface StageStats {
    count: number;
    totalNs: number;
    maxNs: number;
}

export interface ProfilerSnapshot {
    stages: Record<string, StageStats>;
    counters: Record<string, number>;
}

const STACK_LIMIT = 64;

export class Profiler {
    private static readonly _stages = new Map<string, StageStats>();
    private static readonly _counters = new Map<string, number>();
    private static readonly _stack: { name: string; startNs: number }[] = [];

    static begin(name: string): void {
        if (Profiler._stack.length >= STACK_LIMIT) {
            throw new Error(`Profiler stack overflow on '${name}'`);
        }
        Profiler._stack.push({ name, startNs: nowNs() });
    }

    static end(name: string): void {
        const top = Profiler._stack.pop();
        if (!top || top.name !== name) {
            throw new Error(
                `Profiler.end('${name}') mismatched; expected '${top?.name ?? '<empty>'}'`
            );
        }
        const elapsed = nowNs() - top.startNs;
        const stats = Profiler._stages.get(name);
        if (stats === undefined) {
            Profiler._stages.set(name, { count: 1, totalNs: elapsed, maxNs: elapsed });
        } else {
            stats.count++;
            stats.totalNs += elapsed;
            if (elapsed > stats.maxNs) {
                stats.maxNs = elapsed;
            }
        }
    }

    static bump(name: string, delta: number = 1): void {
        Profiler._counters.set(name, (Profiler._counters.get(name) ?? 0) + delta);
    }

    static snapshot(): ProfilerSnapshot {
        const stages: Record<string, StageStats> = {};
        for (const [name, stats] of Profiler._stages) {
            stages[name] = { count: stats.count, totalNs: stats.totalNs, maxNs: stats.maxNs };
        }
        const counters: Record<string, number> = {};
        for (const [name, value] of Profiler._counters) {
            counters[name] = value;
        }
        return { stages, counters };
    }

    static reset(): void {
        Profiler._stages.clear();
        Profiler._counters.clear();
        Profiler._stack.length = 0;
    }
}

function nowNs(): number {
    return Math.round(performance.now() * 1_000_000);
}
