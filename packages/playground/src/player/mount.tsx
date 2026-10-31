import '@coderline/alphatab-ui/styles/tokens.scss';
import * as alphaTab from '@coderline/alphatab';
import { useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { UiEnvironmentProvider } from '@coderline/alphatab-ui';
import { type ReactNode, StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Crosshair } from '../components/Crosshair';
import { NavMenu } from '../components/NavMenu';
import { createPlaygroundEnvironment } from './environment';

export interface DemoOptions {
    /** Settings of this demo on top of the UI's base settings, see `createPlaygroundEnvironment`. */
    settingsLayer?: (settings: alphaTab.Settings) => void;
    /** Shows a crosshair following the mouse while CapsLock is on. */
    crosshair?: boolean;
}

/** Renders `app` into `#app` with the demo navigation, and exposes `window.alphaTab`. */
export function mountDemo(app: ReactNode, options: DemoOptions = {}): void {
    const container = document.getElementById('app');
    if (!container) {
        throw new Error('#app element not found');
    }
    const environment = createPlaygroundEnvironment(options.settingsLayer);
    createRoot(container).render(
        <StrictMode>
            <UiEnvironmentProvider value={environment}>{app}</UiEnvironmentProvider>
        </StrictMode>
    );
    document.body.appendChild(new NavMenu().root);
    if (options.crosshair) {
        new Crosshair();
    }
    window.alphaTab = alphaTab;
}

/** Exposes the API of the surrounding player as `window.api` and logs its errors. */
export function DevGlobals() {
    const api = useAlphaTabApi();
    useAlphaTabEvent(api, 'error', e => console.error('alphaTab error', e));
    useEffect(() => {
        if (!api) {
            return;
        }
        window.api = api;
        return () => {
            if (window.api === api) {
                window.api = undefined;
            }
        };
    }, [api]);
    return null;
}
