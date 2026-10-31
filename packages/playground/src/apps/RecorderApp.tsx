import * as alphaTab from '@coderline/alphatab';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { PlayerProvider } from '@coderline/alphatab-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DrumPadPanel } from '../components/recorder/DrumPadPanel';
import { DrumRecorder } from '../components/recorder/DrumRecorder';
import { RHYTHM_4_4_STRAIGHT, type RhythmConfig } from '../components/recorder/RhythmConfig';
import { RhythmGrid } from '../components/recorder/RhythmGrid';
import { DemoPlayerView } from '../player/DemoPlayerView';
import { playerSettings } from '../player/environment';
import { DevGlobals } from '../player/mount';

const SETTINGS = playerSettings();

/** The recorder's settings layer, see `DemoOptions.settingsLayer`. */
export function recorderSettings(settings: alphaTab.Settings): void {
    settings.display.layoutMode = alphaTab.LayoutMode.Parchment;
    settings.display.justifyLastSystem = true;
}

/** Records drum hits onto a percussion staff while the player runs; the score grows during playback. */
export function RecorderApp({ rhythm = RHYTHM_4_4_STRAIGHT }: { rhythm?: RhythmConfig }) {
    return (
        <PlayerProvider fonts="noto" settings={SETTINGS}>
            <DevGlobals />
            <RecorderView rhythm={rhythm} />
        </PlayerProvider>
    );
}

function RecorderView({ rhythm }: { rhythm: RhythmConfig }) {
    const api = useAlphaTabApi();
    const recorder = useRef<DrumRecorder | null>(null);
    const [recording, setRecording] = useState(false);

    useEffect(() => {
        if (!api) {
            return;
        }
        const created = new DrumRecorder(api, rhythm, setRecording);
        recorder.current = created;
        return () => {
            created.dispose();
            recorder.current = null;
        };
    }, [api, rhythm]);

    const hit = useCallback((midiNote: number) => recorder.current?.hit(midiNote) ?? false, []);
    const render = useCallback(() => recorder.current?.render(), []);

    return (
        <>
            <DemoPlayerView
                demo="recorder"
                fileName="drum-recording"
                onReload={render}
                scoreOverlay={<RhythmGrid rhythm={rhythm} />}
            />
            <DrumPadPanel recording={recording} onHit={hit} />
        </>
    );
}
