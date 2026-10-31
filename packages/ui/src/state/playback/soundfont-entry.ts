export type SoundFontId = string;

/** A SoundFont a {@link SoundFontProvider} can supply. */
export interface SoundFontEntry {
    id: SoundFontId;
    label: string;
    description: string;
    /** Versioned URL: also the key in the persistent SoundFont cache. */
    url: string;
    sizeBytes: number;
    attribution?: { author: string; license: string; href: string };
}
