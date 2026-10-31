export type SoundFontId = string;

export interface SoundFontEntry {
    id: SoundFontId;
    label: string;
    description: string;
    /** Versioned file name: also the key in the persistent SoundFont cache. */
    url: string;
    sizeBytes: number;
    attribution?: { author: string; license: string; href: string };
}

export const SOUNDFONTS: readonly SoundFontEntry[] = [
    {
        id: 'sonivox',
        label: 'Standard',
        description: 'Sonivox',
        url: '/soundfont/sonivox.sf3',
        sizeBytes: 977_208,
        attribution: {
            author: 'Sonic Network Inc. (Sonivox EAS, Android Open Source Project)',
            license: 'Apache License 2.0',
            href: 'https://android.googlesource.com/platform/external/sonivox/',
        },
    },
    {
        id: 'generaluser-gs',
        label: 'High quality',
        description: 'GeneralUser GS 2.0.3',
        url: '/files/soundfonts/GeneralUser-GS.v2.0.3.sf3',
        sizeBytes: 9_126_642,
        attribution: {
            author: 'S. Christian Collins',
            license: 'GeneralUser GS License: free for any use, including commercial use and modification',
            href: 'https://www.schristiancollins.com/generaluser.php',
        },
    },
];

export const DEFAULT_SOUNDFONT_ID: SoundFontId = 'sonivox';

/** Resolves an id (e.g. read back from storage) to a registered entry, falling back to the default. */
export function findSoundFont(id: SoundFontId | null | undefined): SoundFontEntry {
    return (
        SOUNDFONTS.find((s) => s.id === id) ??
        SOUNDFONTS.find((s) => s.id === DEFAULT_SOUNDFONT_ID)!
    );
}

export function formatMegabytes(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}
