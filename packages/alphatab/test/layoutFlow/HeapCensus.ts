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

/** @internal */
interface ParsedSnapshot {
    meta: any;
    nodes: Uint32Array;
    edges: Uint32Array;
    strings: string[];
}

/**
 * Counts live heap objects by constructor name via a heap snapshot (which runs a full GC first, so
 * only reachable objects are counted).
 * @internal
 */
export class HeapCensus {
    private static readonly _attributed = new Set<string>(['(array)', '(number)', 'Array', 'Map', 'Set']);
    private static readonly _attributedAll = new Set<string>([
        ...HeapCensus._attributed,
        'Object',
        '(string)',
        '(concatenated string)'
    ]);
    private static _fileCounter = 0;

    /**
     * Takes a census and keeps it in a temporary file instead of the heap, so that holding it does
     * not show up in later censuses. Read it back with {@link load}.
     */
    public static takeToFile(attributeAll: boolean = false): string {
        const census = HeapCensus.take(attributeAll);
        const file = path.join(
            process.cwd(),
            'temp/layout-flow',
            `census-${process.pid}-${HeapCensus._fileCounter++}.json`
        );
        fs.writeFileSync(file, JSON.stringify(Array.from(census.values())));
        return file;
    }

    /** Reads (and deletes) a census written by {@link takeToFile}. */
    public static load(file: string): Map<string, CensusEntry> {
        const entries = JSON.parse(fs.readFileSync(file, 'utf8')) as CensusEntry[];
        fs.unlinkSync(file);
        return new Map(entries.map(e => [e.name, e]));
    }

    /**
     * @param attributeAll Also attribute plain objects and strings to their owners (more distinct
     * entries; prefer {@link takeToFile} when holding several censuses).
     */
    /** Retainer chains of the objects named in the `trace` argument of the last {@link take}. */
    public static lastTraces: string[] = [];

    public static take(attributeAll: boolean = false, trace: string[] = []): Map<string, CensusEntry> {
        const attributed = attributeAll ? HeapCensus._attributedAll : HeapCensus._attributed;
        // writeHeapSnapshot runs a full GC and writes synchronously
        const dir = path.join(process.cwd(), 'temp/layout-flow');
        fs.mkdirSync(dir, { recursive: true });
        const file = v8.writeHeapSnapshot(path.join(dir, `census-${process.pid}.heapsnapshot`));
        let snapshot: ParsedSnapshot;
        try {
            snapshot = HeapCensus._parse(fs.readFileSync(file));
        } finally {
            fs.unlinkSync(file);
        }
        const meta = snapshot.meta;
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
        const nodes = snapshot.nodes;
        const edges = snapshot.edges;
        const strings = snapshot.strings;
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
        HeapCensus.lastTraces = [];
        for (const t of trace) {
            // an instance, not the class, its prototype or its map
            let n = 0;
            while (
                n < nodeCount &&
                (nameOf(n) !== t ||
                    (!t.startsWith('(') && types[nodes[n * stride + typeIdx]] !== 'object') ||
                    retainerEdge[n] < 0 ||
                    strings[edges[retainerEdge[n] + eNameIdx]] === 'prototype' ||
                    edgeTypes[edges[retainerEdge[n] + eTypeIdx]] === 'internal')
            ) {
                n++;
            }
            const chain: string[] = [];
            for (let hop = 0; n < nodeCount && n >= 0 && hop < 16; hop++) {
                const edge = retainerEdge[n];
                let en = '';
                if (edge >= 0) {
                    const et = edgeTypes[edges[edge + eTypeIdx]];
                    en =
                        et === 'element' || et === 'hidden'
                            ? `[${edges[edge + eNameIdx]}]`
                            : `${et}:${strings[edges[edge + eNameIdx]]}`;
                }
                chain.push(edge < 0 ? nameOf(n) : `${nameOf(n)} <-${en}-`);
                n = retainer[n];
            }
            HeapCensus.lastTraces.push(`${t}: ${chain.join(' ')}`);
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
                if (
                    rn !== '(array)' &&
                    rn !== 'Array' &&
                    rn !== '(object properties)' &&
                    rn !== '(concatenated string)' &&
                    rn !== '(sliced string)' &&
                    en !== 'elements'
                ) {
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
            if (attributed.has(name)) {
                add(`  ${name} owned by ${ownerOf(n)}`, size);
            }
        }
        return result;
    }

    /**
     * Parses the snapshot from bytes: the node and edge arrays of large heaps exceed the maximum
     * string length, so only the header and the string table go through `JSON.parse`.
     */
    private static _parse(buf: Buffer): ParsedSnapshot {
        const nodesKey = buf.indexOf('"nodes":[');
        const header = JSON.parse(`${buf.toString('utf8', 0, nodesKey).replace(/,\s*$/, '')}}`);
        const meta = header.snapshot.meta;
        const readInts = (start: number, count: number): { values: Uint32Array; end: number } => {
            const values = new Uint32Array(count);
            let i = start;
            let n = 0;
            let cur = 0;
            let inNumber = false;
            while (n < count) {
                const c = buf[i++];
                if (c >= 48 && c <= 57) {
                    cur = cur * 10 + (c - 48);
                    inNumber = true;
                } else if (inNumber) {
                    values[n++] = cur;
                    cur = 0;
                    inNumber = false;
                }
            }
            return { values, end: i };
        };
        const nodeCount = header.snapshot.node_count * meta.node_fields.length;
        const nodes = readInts(nodesKey + 9, nodeCount);
        const edgesKey = buf.indexOf('"edges":[', nodes.end);
        const edges = readInts(edgesKey + 9, header.snapshot.edge_count * meta.edge_fields.length);
        const stringsKey = buf.indexOf('"strings":[', edges.end);
        const stringsEnd = buf.lastIndexOf(']');
        const strings = JSON.parse(buf.toString('utf8', stringsKey + 10, stringsEnd + 1)) as string[];
        return { meta, nodes: nodes.values, edges: edges.values, strings };
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
