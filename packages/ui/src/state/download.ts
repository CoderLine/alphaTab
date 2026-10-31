/** Offers `data` to the user as a file download. */
export function downloadBytes(fileName: string, data: Uint8Array | string, mimeType = 'application/octet-stream'): void {
    const blob = new Blob([data as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** `name.ext` → `name.<extension>`; keeps names without extension. */
export function withExtension(fileName: string, extension: string): string {
    const base = fileName.replace(/\.[^./]+$/, '');
    return `${base || 'score'}.${extension}`;
}
