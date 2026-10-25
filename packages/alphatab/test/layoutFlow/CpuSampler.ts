/** @target web */
import inspector from 'node:inspector';
import { type ProfileCallFrame, StageClassifier, Tally } from './StageClassifier';

interface CpuNode {
    id: number;
    callFrame: ProfileCallFrame;
    children?: number[];
}

/**
 * Sampled CPU time of a synchronous callback, attributed to functions (self and inclusive) and to
 * layout pipeline stages. Times are in milliseconds.
 * @internal
 */
export interface CpuReport {
    totalMs: number;
    self: Tally;
    inclusive: Tally;
    byStage: Tally;
    byStageSelf: Tally;
}

/**
 * Profiles a synchronous callback with the V8 CPU profiler through the inspector protocol.
 * @internal
 */
export class CpuSampler {
    private static _session: inspector.Session | null = null;

    private static _post<T>(method: string, params?: object): T {
        let result: T | undefined;
        let error: Error | null = null;
        CpuSampler._session!.post(method, params ?? {}, (err, res) => {
            error = err;
            result = res as T;
        });
        if (error) {
            throw error;
        }
        return result!;
    }

    public static measure(action: () => void, intervalUs: number = 100): CpuReport {
        if (!CpuSampler._session) {
            CpuSampler._session = new inspector.Session();
            CpuSampler._session.connect();
            CpuSampler._post('Profiler.enable');
        }
        CpuSampler._post('Profiler.setSamplingInterval', { interval: intervalUs });
        CpuSampler._post('Profiler.start');
        action();
        const { profile } = CpuSampler._post<{
            profile: { nodes: CpuNode[]; samples: number[]; timeDeltas: number[] };
        }>('Profiler.stop');

        const byId = new Map<number, CpuNode>();
        const parent = new Map<number, number>();
        for (const n of profile.nodes) {
            byId.set(n.id, n);
        }
        for (const n of profile.nodes) {
            for (const c of n.children ?? []) {
                parent.set(c, n.id);
            }
        }

        const self = new Tally();
        const inclusive = new Tally();
        const byStage = new Tally();
        const byStageSelf = new Tally();
        for (let i = 0; i < profile.samples.length; i++) {
            const ms = (profile.timeDeltas[i] ?? 0) / 1000;
            const leaf = byId.get(profile.samples[i])!;
            const leafSite = StageClassifier.siteOf(leaf.callFrame);
            if (leaf.callFrame.functionName === '(idle)' || leaf.callFrame.functionName === '(program)') {
                continue;
            }
            // walk to the root: inclusive per distinct source site, innermost stage
            let stage: string | null = null;
            let profilerOwn = false;
            const stack: string[] = [];
            let cur: CpuNode | undefined = leaf;
            while (cur) {
                const f = cur.callFrame;
                if (f.functionName === '_post' && f.url.includes('CpuSampler')) {
                    profilerOwn = true;
                    break;
                }
                if (f.url.includes('/src/')) {
                    stack.push(StageClassifier.siteOf(f));
                }
                if (stage === null) {
                    stage = StageClassifier.stageOf(f);
                }
                const p = parent.get(cur.id);
                cur = p === undefined ? undefined : byId.get(p);
            }
            if (profilerOwn) {
                continue;
            }
            self.add(leafSite, ms);
            const seen = new Set<string>();
            for (const site of stack) {
                if (!seen.has(site)) {
                    seen.add(site);
                    inclusive.add(site, ms);
                }
            }
            const s = leaf.callFrame.functionName === '(garbage collector)' ? 'garbage collection' : (stage ?? 'other');
            byStage.add(s, ms);
            byStageSelf.add(`${s} | ${leafSite}`, ms);
        }
        return { totalMs: self.total, self, inclusive, byStage, byStageSelf };
    }
}
