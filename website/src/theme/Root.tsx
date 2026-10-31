import React, { useMemo, useSyncExternalStore } from 'react';
import type { Settings } from '@coderline/alphatab';
import {
    createUiEnvironment,
    SoundFontLibrary,
    UiEnvironmentProvider,
    type UiEnvironment,
    type UiTheme,
} from '@coderline/alphatab-ui';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { SITE_SOUNDFONTS } from '@site/src/soundfonts';

// Docusaurus keeps the color mode on <html data-theme>; Root renders above its color-mode context.
function subscribeTheme(onChange: () => void): () => void {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
}
const readTheme = (): UiTheme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const serverTheme = (): UiTheme => 'light';

/** `?loglevel=debug` and friends, for troubleshooting any player on the site. */
function applyUrlOptions(settings: Settings): void {
    if (typeof window === 'undefined') { return; }
    const logLevel = new URL(window.location.href).searchParams.get('loglevel');
    if (logLevel) {
        settings.fillFromJson({ core: { logLevel: logLevel as never } });
    }
}

// One environment per base URL for the lifetime of the page, so SoundFont bytes and preferences
// survive client-side navigation.
const environments = new Map<string, UiEnvironment>();
function siteEnvironment(siteRoot: string): UiEnvironment {
    let environment = environments.get(siteRoot);
    if (!environment) {
        environment = createUiEnvironment({
            fontDirectory: `${siteRoot}font/`,
            soundFonts: new SoundFontLibrary({
                entries: SITE_SOUNDFONTS.map((entry) => ({ ...entry, url: siteRoot + entry.url })),
            }),
            settingsLayer: applyUrlOptions,
        });
        environments.set(siteRoot, environment);
    }
    return environment;
}

/** Provides the alphaTab UI environment to the whole site, including the navbar. */
export default function Root({ children }: { children: React.ReactNode }): React.ReactElement {
    const siteRoot = useBaseUrl('/');
    const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
    const environment = useMemo(() => ({ ...siteEnvironment(siteRoot), theme }), [siteRoot, theme]);
    return <UiEnvironmentProvider value={environment}>{children}</UiEnvironmentProvider>;
}
