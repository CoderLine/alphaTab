/** @target web */
import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';

/**
 * Live objects of one constructor (or V8 node type) in a heap snapshot.
 * @internal
 */
export interface CensusEntry {
    name: string;
    count: number;
    selfBytes: number;
}

/**
 * Counts live heap objects by constructor name via a heap snapshot (which runs a full GC first, so
 * only reachable objects are counted).
 * @internal
 */
export class HeapCensus {
    public static take(): Map<string, CensusEntry> {
        // writeHeapSnapshot runs a full GC and writes synchronously
        const dir = path.join(process.cwd(), 'temp/layout-flow');
        fs.mkdirSync(dir, { recursive: true });
        const file = v8.writeHeapSnapshot(path.join(dir, `census-${process.pid}.heapsnapshot`));
        let snapshot: any;
        try {
            snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
        } finally {
            fs.unlinkSync(file);
        }
        const meta = snapshot.snapshot.meta;
        const fields: string[] = meta.node_fields;
        const types: string[] = meta.node_types[0];
        const edgeFields: string[] = meta.edge_fields;
        const edgeTypes: string[] = meta.edge_types[0];
        const typeIdx = fields.indexOf('type');
        const nameIdx = fields.indexOf('name');
        const sizeIdx = fields.indexOf('self_size');
        const edgeCountIdx = fields.indexOf('edge_count');
        const stride = fields.length;
        const eStride = edgeFields.length;
        const eTypeIdx = edgeFields.indexOf('type');
        const eNameIdx = edgeFields.indexOf('name_or_index');
        const eToIdx = edgeFields.indexOf('to_node');
        const nodes: number[] = snapshot.nodes;
        const edges: number[] = snapshot.edges;
        const strings: string[] = snapshot.strings;
        const nodeCount = nodes.length / stride;

        const nameOf = (n: number): string => {
            const type = types[nodes[n * stride + typeIdx]];
            const raw = type === 'object' || type === 'closure' ? strings[nodes[n * stride + nameIdx]] : `(${type})`;
            return raw.length > 60 ? `${raw.substring(0, 60)}…` : raw;
        };

        // first strong retainer of every node, to attribute arrays and boxed numbers to their owners
        const retainer = new Int32Array(nodeCount).fill(-1);
        const retainerEdge = new Int32Array(nodeCount).fill(-1);
        let e = 0;
        for (let n = 0; n < nodeCount; n++) {
            const count = nodes[n * stride + edgeCountIdx];
            for (let k = 0; k < count; k++, e += eStride) {
                const et = edgeTypes[edges[e + eTypeIdx]];
                if (et === 'weak' || et === 'shortcut') {
                    continue;
                }
                const to = edges[e + eToIdx] / stride;
                if (retainer[to] === -1) {
                    retainer[to] = n;
                    retainerEdge[to] = e;
                }
            }
        }
        const ownerOf = (n: number, depth: number = 0): string => {
            // skip intermediate storage (backing arrays, JS arrays, property stores) up to 3 hops
            let cur = n;
            let label = '';
            for (let hop = 0; hop < 4; hop++) {
                const r = retainer[cur];
                if (r < 0) {
                    return `?${label}`;
                }
                const edge = retainerEdge[cur];
                const et = edgeTypes[edges[edge + eTypeIdx]];
                const en = et === 'element' || et === 'hidden' ? '[]' : strings[edges[edge + eNameIdx]];
                label = label ? `.${en}${label}` : `.${en}`;
                const rn = nameOf(r);
                if ((rn === 'Map' || rn === 'Set') && depth < 2) {
                    return `${rn}<${ownerOf(r, depth + 1)}>${label}`;
                }
                if (rn !== '(array)' && rn !== 'Array' && rn !== '(object properties)' && en !== 'elements') {
                    return `${rn}${label}`;
                }
                cur = r;
            }
            return `…${label}`;
        };

        const result = new Map<string, CensusEntry>();
        const add = (key: string, size: number) => {
            let entry = result.get(key);
            if (!entry) {
                entry = { name: key, count: 0, selfBytes: 0 };
                result.set(key, entry);
            }
            entry.count++;
            entry.selfBytes += size;
        };
        for (let n = 0; n < nodeCount; n++) {
            const type = types[nodes[n * stride + typeIdx]];
            if (type === 'hidden' || type === 'synthetic' || type === 'code') {
                continue;
            }
            const name = nameOf(n);
            const size = nodes[n * stride + sizeIdx];
            add(name, size);
            if (name === '(array)' || name === '(number)' || name === 'Array' || name === 'Map' || name === 'Set') {
                add(`  ${name} owned by ${ownerOf(n)}`, size);
            }
        }
        return result;
    }

    /** Entries of `after` minus `before`, largest self size first. */
    public static diff(before: Map<string, CensusEntry>, after: Map<string, CensusEntry>): CensusEntry[] {
        const result: CensusEntry[] = [];
        for (const [name, a] of after) {
            const b = before.get(name);
            const count = a.count - (b?.count ?? 0);
            const selfBytes = a.selfBytes - (b?.selfBytes ?? 0);
            if (count > 0 || selfBytes > 0) {
                result.push({ name, count, selfBytes });
            }
        }
        return result.sort((x, y) => y.selfBytes - x.selfBytes);
    }
}
