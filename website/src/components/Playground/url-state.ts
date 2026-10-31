/**
 * Playground URLs. Every score the Playground can open without user files is addressable:
 *
 * - `/playground?file=<sample-id>`: a sample from `sources.ts`
 * - `/playground?url=/files/song.gp`: a same-origin file
 * - `/playground#tex=<deflate-raw, base64url>`: inline alphaTex
 *
 * `tracks=0,2` (or `tracks=all`) selects the rendered tracks for any of them.
 */

export type TrackSelection = number[] | 'all';

export type PlaygroundLinkTarget =
    | { sample: string; tracks?: TrackSelection }
    | { url: string; tracks?: TrackSelection }
    | { tex: string; tracks?: TrackSelection };

export const PLAYGROUND_PATH = '/playground';

/** Builds a Playground link; `basePath` is the (base-URL-resolved) Playground route. */
export async function buildPlaygroundUrl(target: PlaygroundLinkTarget, basePath = PLAYGROUND_PATH): Promise<string> {
    if (!('tex' in target)) { return buildFileLink(target, basePath); }
    const query = target.tracks ? `?tracks=${formatTracks(target.tracks)}` : '';
    return `${basePath}${query}#tex=${await encodeTex(target.tex)}`;
}

/** Synchronous variant of `buildPlaygroundUrl` for targets that need no compression. */
export function buildFileLink(target: Exclude<PlaygroundLinkTarget, { tex: string }>, basePath = PLAYGROUND_PATH): string {
    const params = new URLSearchParams();
    if ('sample' in target) { params.set('file', target.sample); }
    else { params.set('url', target.url); }
    if (target.tracks) { params.set('tracks', formatTracks(target.tracks)); }
    return `${basePath}?${params.toString()}`;
}

/** Reads the target of a Playground URL; `null` when it names none or only invalid ones. */
export async function parsePlaygroundUrl(location: { search: string; hash: string; origin: string }): Promise<PlaygroundLinkTarget | null> {
    const params = new URLSearchParams(location.search);
    const tracks = parseTracks(params.get('tracks'));
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    const encodedTex = hashParams.get('tex');
    if (encodedTex) {
        try {
            return { tex: await decodeTex(encodedTex), tracks };
        } catch (e) {
            console.warn('[Playground] Ignoring unreadable #tex= link', e);
        }
    }
    const sample = params.get('file');
    if (sample) { return { sample, tracks }; }
    const url = params.get('url');
    if (url && isSameOriginPath(url, location.origin)) { return { url, tracks }; }
    return null;
}

/** Only site-relative paths: a link must not make the Playground fetch from arbitrary hosts. */
export function isSameOriginPath(url: string, origin: string): boolean {
    if (!url.startsWith('/') || url.startsWith('//')) { return false; }
    try {
        return new URL(url, origin).origin === origin;
    } catch {
        return false;
    }
}

function formatTracks(tracks: TrackSelection): string {
    return tracks === 'all' ? 'all' : tracks.join(',');
}

function parseTracks(value: string | null): TrackSelection | undefined {
    if (!value) { return undefined; }
    if (value === 'all') { return 'all'; }
    const indexes = value
        .split(',')
        .map((v) => Number.parseInt(v, 10))
        .filter((v) => Number.isInteger(v) && v >= 0);
    return indexes.length > 0 ? indexes : undefined;
}

export async function encodeTex(tex: string): Promise<string> {
    const compressed = await pipe(new TextEncoder().encode(tex), new CompressionStream('deflate-raw'));
    let binary = '';
    for (const byte of compressed) { binary += String.fromCharCode(byte); }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function decodeTex(encoded: string): Promise<string> {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(await pipe(bytes, new DecompressionStream('deflate-raw')));
}

async function pipe(input: Uint8Array, transform: CompressionStream | DecompressionStream): Promise<Uint8Array> {
    const stream = new Blob([input as BlobPart]).stream().pipeThrough(transform);
    return new Uint8Array(await new Response(stream).arrayBuffer());
}
