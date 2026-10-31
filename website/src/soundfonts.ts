import type { SoundFontEntry } from '@coderline/alphatab-ui';

/** The SoundFonts the site offers; `url` is relative to the site root. */
export const SITE_SOUNDFONTS: readonly SoundFontEntry[] = [
    {
        id: 'sonivox',
        label: 'Standard',
        description: 'Sonivox',
        url: 'soundfont/sonivox.sf3',
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
        url: 'files/soundfonts/GeneralUser-GS.v2.0.3.sf3',
        sizeBytes: 9_126_642,
        attribution: {
            author: 'S. Christian Collins',
            license: 'GeneralUser GS License: free for any use, including commercial use and modification',
            href: 'https://www.schristiancollins.com/generaluser.php',
        },
    },
];
