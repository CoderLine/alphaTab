import React, { createContext, useContext, useEffect, useState } from 'react';
import type { json } from '@coderline/alphatab';
import { usePersistedState } from './use-persisted-state';

export type MusicFontId = 'bravura' | 'petaluma';

interface MusicFont {
    label: string;
    description: string;
    /** `core.smuflFontSources`; Bravura ships with alphaTab. */
    sources?: Record<string, string>;
    /** SMuFL metadata with the engraving defaults of the font. */
    metadataUrl?: string;
}

export const MUSIC_FONTS: Record<MusicFontId, MusicFont> = {
    bravura: { label: 'Bravura', description: 'default' },
    petaluma: {
        label: 'Petaluma',
        description: 'handwritten',
        sources: { OpenType: '/files/petaluma/Petaluma.otf' },
        metadataUrl: '/files/petaluma/petaluma_metadata.json',
    },
};

interface MusicFontState {
    musicFont: MusicFontId;
    setMusicFont: (font: MusicFontId) => void;
    /** Loaded metadata of a non-default font; `null` for Bravura and while loading. */
    metadata: unknown;
}

const MusicFontContext = createContext<MusicFontState | null>(null);

export function useMusicFont(): MusicFontState {
    const ctx = useContext(MusicFontContext);
    if (!ctx) { throw new Error('useMusicFont must be used inside <MusicFontProvider>'); }
    return ctx;
}

/**
 * The SMuFL music font of the Playground. alphaTab cannot swap fonts on a running instance, so
 * `children` receives a key that changes with the font to remount the player.
 */
export const MusicFontProvider: React.FC<{ children: (font: { key: MusicFontId; settings: json.SettingsJson | undefined }) => React.ReactNode }> = ({
    children,
}) => {
    const [stored, setMusicFont] = usePersistedState<MusicFontId>('alphatab.playground-music-font.v1', 'bravura');
    const musicFont: MusicFontId = stored in MUSIC_FONTS ? stored : 'bravura';
    const font = MUSIC_FONTS[musicFont];
    const [metadata, setMetadata] = useState<unknown>(null);

    useEffect(() => {
        setMetadata(null);
        if (!font.metadataUrl) { return; }
        const controller = new AbortController();
        fetch(font.metadataUrl, { signal: controller.signal })
            .then((r) => r.json())
            .then(setMetadata)
            .catch((e: unknown) => {
                if (!controller.signal.aborted) { console.error('[Playground] Music font metadata could not be loaded', e); }
            });
        return () => controller.abort();
    }, [font.metadataUrl]);

    // The typed API wants a Map; `fillFromJson` accepts the plain object form.
    const settings = font.sources ? ({ core: { smuflFontSources: font.sources } } as unknown as json.SettingsJson) : undefined;

    return (
        <MusicFontContext.Provider value={{ musicFont, setMusicFont, metadata }}>
            {children({ key: musicFont, settings })}
        </MusicFontContext.Provider>
    );
};
