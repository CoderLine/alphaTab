/** @target web */
import inspector from 'node:inspector';
import { type ProfileCallFrame, StageClassifier, Tally } from './StageClassifier';

interface SamplingNode {
    callFrame: ProfileCallFrame;
    selfSize: number;
    children: SamplingNode[];
}

/**
 * Bytes allocated by one function (self) during a sampled window.
 * @internal
 */
export interface AllocationSite {
    site: string;
    bytes: number;
}

/**
 * Result of one sampled window. Sizes are estimates from V8's sampling heap profiler with
 * objects collected by minor and major GCs included, so they approximate the total allocated
 * bytes rather than what survived.
 * @internal
 */
export interface AllocationReport {
    totalBytes: number;
    topSites: AllocationSite[];
    /** Self bytes per allocation site; builtins are attributed to `builtin <- caller site`. */
    bySite: Tally;
    /** Bytes per layout pipeline stage (innermost stage frame on the stack). */
    byStage: Tally;
    /** Bytes per stage and site, keyed `stage | site`. */
    byStageSite: Tally;
}

/**
 * Measures allocations of a synchronous callback through the inspector protocol.
 * @internal
 */
export class AllocationSampler {
    private static _session: inspector.Session | null = null;

    private static _post<T>(method: string, params?: object): T {
        let result: T | undefined;
        let error: Error | null = null;
        // the inspector session dispatches synchronously on the calling thread
        AllocationSampler._session!.post(method, params ?? {}, (err, res) => {
            error = err;
            result = res as T;
        });
        if (error) {
            throw error;
        }
        return result!;
    }

    public static measure(action: () => void, samplingInterval: number = 4096, topN: number = 15): AllocationReport {
        if (!AllocationSampler._session) {
            AllocationSampler._session = new inspector.Session();
            AllocationSampler._session.connect();
            AllocationSampler._post('HeapProfiler.enable');
        }
        AllocationSampler._post('HeapProfiler.startSampling', {
            samplingInterval,
            includeObjectsCollectedByMajorGC: true,
            includeObjectsCollectedByMinorGC: true
        });
        try {
            action();
        } catch (e) {
            AllocationSampler._post('HeapProfiler.stopSampling');
            throw e;
        }
        const res = AllocationSampler._post<{ profile: { head: SamplingNode } }>('HeapProfiler.stopSampling');
        const bySite = new Tally();
        const byStage = new Tally();
        const byStageSite = new Tally();
        const walk = (n: SamplingNode, stage: string, caller: string) => {
            const own = StageClassifier.stageOf(n.callFrame);
            const s = own ?? stage;
            const isBuiltin = StageClassifier.isBuiltin(n.callFrame);
            const site = isBuiltin
                ? `${n.callFrame.functionName || '(builtin)'} <- ${caller}`
                : StageClassifier.siteOf(n.callFrame);
            if (n.selfSize > 0) {
                bySite.add(site, n.selfSize);
                byStage.add(s, n.selfSize);
                byStageSite.add(`${s} | ${site}`, n.selfSize);
            }
            const nextCaller = isBuiltin ? caller : StageClassifier.siteOf(n.callFrame);
            for (const c of n.children) {
                walk(c, s, nextCaller);
            }
        };
        walk(res.profile.head, 'other', '(root)');
        const topSites = bySite.top(topN).map(([site, bytes]) => ({ site, bytes }));
        return { totalBytes: bySite.total, topSites, bySite, byStage, byStageSite };
    }

    public static mb(bytes: number): string {
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
}
