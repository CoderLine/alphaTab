import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Settings } from '@coderline/alphatab';
import { QuickSettingRow, Select, UiEnvironmentProvider, usePersistedState } from '@coderline/alphatab-ui';
import useBaseUrl from '@docusaurus/useBaseUrl';

export type MusicFontId = 'bravura' | 'petaluma';

interface MusicFont {
    label: string;
    description: string;
    /** `core.smuflFontSources` (site paths); Bravura ships with alphaTab. */
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
}

/**
 * The SMuFL music font of the Playground, applied to the players below as an environment settings
 * layer. alphaTab cannot swap fonts on a running instance, so `children` receives a key that changes
 * with the font to remount the player.
 */
export const MusicFontProvider: React.FC<{ children: (font: MusicFontState & { key: MusicFontId }) => React.ReactNode }> = ({
    children,
}) => {
    const [stored, setMusicFont] = usePersistedState<MusicFontId>('alphatab.playground-music-font.v1', 'bravura');
    const musicFont: MusicFontId = stored in MUSIC_FONTS ? stored : 'bravura';
    const font = MUSIC_FONTS[musicFont];
    const [metadata, setMetadata] = useState<unknown>(null);
    const siteRoot = useBaseUrl('/');
    const resolve = useCallback((path: string) => siteRoot + path.replace(/^\//, ''), [siteRoot]);

    useEffect(() => {
        setMetadata(null);
        if (!font.metadataUrl) { return; }
        const controller = new AbortController();
        fetch(resolve(font.metadataUrl), { signal: controller.signal })
            .then((r) => r.json())
            .then(setMetadata)
            .catch((e: unknown) => {
                if (!controller.signal.aborted) { console.error('[Playground] Music font metadata could not be loaded', e); }
            });
        return () => controller.abort();
    }, [font.metadataUrl, resolve]);

    const settingsLayer = useCallback(
        (settings: Settings) => {
            if (font.sources) {
                const sources = Object.fromEntries(Object.entries(font.sources).map(([format, path]) => [format, resolve(path)]));
                // The typed API wants a Map; `fillFromJson` accepts the plain object form.
                settings.fillFromJson({ core: { smuflFontSources: sources } } as never);
            }
            if (metadata) { settings.display.resources.engravingSettings.fillFromSmufl(metadata as never); }
        },
        [font, metadata, resolve],
    );
    const environment = useMemo(() => ({ settingsLayer }), [settingsLayer]);

    return (
        <UiEnvironmentProvider value={environment}>
            {children({ key: musicFont, musicFont, setMusicFont })}
        </UiEnvironmentProvider>
    );
};

/** The music-font row of the Playground's quick settings. */
export const MusicFontSetting: React.FC<MusicFontState> = ({ musicFont, setMusicFont }) => (
    <QuickSettingRow label="Music font" title="Switching reloads the player">
        <Select
            label="Music font"
            value={Object.keys(MUSIC_FONTS).indexOf(musicFont)}
            options={Object.entries(MUSIC_FONTS).map(([, f], i) => ({ value: i, label: `${f.label} (${f.description})` }))}
            onChange={(i) => setMusicFont(Object.keys(MUSIC_FONTS)[i] as MusicFontId)}
        />
    </QuickSettingRow>
);
