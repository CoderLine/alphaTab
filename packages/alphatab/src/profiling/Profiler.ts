/**
 * Profiling instrumentation. Call sites are stripped from production /
 * library / vitest / playground builds by `stripProfilingPlugin` and only
 * retained in the bench harness.
 */

/**
 * @internal
 * @record
 */
export interface StageStats {
    count: number;
    totalNs: number;
    maxNs: number;
}

/**
 * @internal
 * @record
 */
export interface ProfilerSnapshot {
    stages: Map<string, StageStats>;
    counters: Map<string, number>;
}

/**
 * @internal
 * @record
 */
interface ProfilerFrame {
    name: string;
    startNs: number;
}

/**
 * @internal
 */
export class Profiler {
    private static readonly _stackLimit = 64;
    private static readonly _stages = new Map<string, StageStats>();
    private static readonly _counters = new Map<string, number>();
    private static readonly _stack: ProfilerFrame[] = [];

    static begin(name: string): void {
        if (Profiler._stack.length >= Profiler._stackLimit) {
            throw new Error(`Profiler stack overflow on '${name}'`);
        }
        Profiler._stack.push({ name, startNs: Profiler._nowNs() });
    }

    static end(name: string): void {
        const top = Profiler._stack.pop();
        if (!top || top.name !== name) {
            throw new Error(`Profiler.end('${name}') mismatched; expected '${top?.name ?? '<empty>'}'`);
        }
        const elapsed = Profiler._nowNs() - top.startNs;
        if (!Profiler._stages.has(name)) {
            Profiler._stages.set(name, { count: 1, totalNs: elapsed, maxNs: elapsed });
        } else {
            const stats = Profiler._stages.get(name)!;
            stats.count++;
            stats.totalNs += elapsed;
            if (elapsed > stats.maxNs) {
                stats.maxNs = elapsed;
            }
        }
    }

    static bump(name: string, delta: number = 1): void {
        const current = Profiler._counters.has(name) ? Profiler._counters.get(name)! : 0;
        Profiler._counters.set(name, current + delta);
    }

    static snapshot(): ProfilerSnapshot {
        const stages = new Map<string, StageStats>();
        for (const [name, stats] of Profiler._stages) {
            stages.set(name, { count: stats.count, totalNs: stats.totalNs, maxNs: stats.maxNs });
        }
        const counters = new Map<string, number>();
        for (const [name, value] of Profiler._counters) {
            counters.set(name, value);
        }
        return { stages, counters };
    }

    static reset(): void {
        Profiler._stages.clear();
        Profiler._counters.clear();
        // splice(0) instead of `.length = 0` for transpiler compatibility.
        Profiler._stack.splice(0);
    }

    private static _nowNs(): number {
        return Math.round(performance.now() * 1_000_000);
    }
}
