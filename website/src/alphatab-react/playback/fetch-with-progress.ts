export interface DownloadProgress {
    loaded: number;
    total: number;
}

/**
 * Downloads `url` completely. `onProgress` receives the bytes read so far and
 * the expected size (`Content-Length`, else `expectedBytes`, else 0).
 * Rejects on HTTP errors and on a body shorter than its declared length.
 */
export async function fetchWithProgress(
    url: string,
    onProgress?: (p: DownloadProgress) => void,
    expectedBytes = 0,
): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${url}: HTTP ${response.status}`);
    }
    // With a content-encoding the header counts compressed bytes, not what the reader yields.
    const encoded = !!response.headers.get('content-encoding');
    const declared = encoded ? 0 : Number(response.headers.get('content-length') ?? 0);
    const total = declared || expectedBytes;

    if (!response.body) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        onProgress?.({ loaded: bytes.length, total: total || bytes.length });
        return bytes;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    onProgress?.({ loaded, total });
    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        onProgress?.({ loaded, total: Math.max(total, loaded) });
    }
    if (declared && loaded !== declared) {
        throw new Error(`${url}: received ${loaded} of ${declared} bytes`);
    }

    const bytes = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
    }
    return bytes;
}
