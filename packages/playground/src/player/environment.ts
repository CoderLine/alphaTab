import * as alphaTab from '@coderline/alphatab';
import {
    createUiEnvironment,
    type ScoreDocumentAdapter,
    type ScoreSample,
    type TrackSelection,
    type UiEnvironment
} from '@coderline/alphatab-ui';
import { Paths } from '../util/Paths';

/**
 * The player settings of a demo that plays with its own SoundFont: a fixed player mode keeps the
 * playback-source switching of the UI out of the way and `soundFont` bypasses any SoundFont cache.
 */
export function playerSettings(
    playerMode: alphaTab.PlayerMode = alphaTab.PlayerMode.EnabledAutomatic
): alphaTab.json.SettingsJson {
    return { player: { playerMode, soundFont: Paths.soundFont } };
}

/** `?engine=svg|html5` and `?loglevel=debug|info|…` of the page address. */
function applyPageParameters(settings: alphaTab.Settings): void {
    const params = new URL(window.location.href).searchParams;
    settings.fillFromJson({
        core: {
            engine: params.get('engine') ?? 'default',
            logLevel: (params.get('loglevel') ?? 'info') as alphaTab.json.CoreSettingsJson['logLevel']
        }
    });
    settings.player.scrollOffsetX = -10;
}

/**
 * The environment of a player demo. `settingsLayer` holds the demo's own settings; like the page
 * parameters it is re-applied whenever the UI rebuilds the base settings, e.g. on a settings reset.
 */
export function createPlaygroundEnvironment(settingsLayer?: (settings: alphaTab.Settings) => void): UiEnvironment {
    return createUiEnvironment({
        fontDirectory: Paths.fontDirectory,
        settingsLayer: settings => {
            applyPageParameters(settings);
            settingsLayer?.(settings);
        }
    });
}

export interface SingleSampleOptions {
    /** Tracks the sample opens with; all of them by default. */
    tracks?: TrackSelection;
    /** See `ScoreDocumentAdapter.sessionKey`; ignored with `tracks`. */
    sessionKey?: string;
}

/** Documents of a demo that opens one sample and whatever file is dropped onto it. */
export function singleSampleDocuments(sample: ScoreSample, options: SingleSampleOptions = {}): ScoreDocumentAdapter {
    const { tracks, sessionKey } = options;
    return {
        findSample: id => (id === sample.id ? sample : undefined),
        defaultSampleId: sample.id,
        readLink: tracks ? () => Promise.resolve({ sample: sample.id, tracks }) : undefined,
        sessionKey
    };
}
