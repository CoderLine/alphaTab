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

    // Profiling is diagnostic only and must never break rendering. The stack is shared
    // across all renderers: on platforms with threads (C#/Kotlin) renders of different
    // instances can interleave, so unbalanced begin/end calls are tolerated.

    static begin(name: string): void {
        if (Profiler._stack.length >= Profiler._stackLimit) {
            // frames leaked (e.g. interleaved renders), start over
            Profiler._stack.splice(0);
        }
        Profiler._stack.push({ name, startNs: Profiler._nowNs() });
    }

    static end(name: string): void {
        // find the matching frame, frames above it were not ended (e.g. interleaved renders)
        const stack = Profiler._stack;
        let index = stack.length - 1;
        while (index >= 0 && stack[index].name !== name) {
            index--;
        }
        if (index < 0) {
            // no matching begin (e.g. dropped by an interleaved render): nothing to record
            return;
        }
        const frame = stack[index];
        stack.splice(index, stack.length - index);
        const elapsed = Profiler._nowNs() - frame.startNs;
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
