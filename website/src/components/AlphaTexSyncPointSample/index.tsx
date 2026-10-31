import React, { useEffect } from 'react';
import * as alphaTab from '@coderline/alphatab';
import {
    AlphaTabHost,
    AlphaTabProvider,
    useAlphaTabApi,
    useAlphaTabEventValue
} from '@coderline/alphatab-react';
import { IconPause, IconPlay } from '@coderline/alphatab-ui';
import { useSiteAlphaTabSettings } from '@site/src/alphatab-settings';
import styles from './styles.module.scss';
import CodeBlock from '@theme/CodeBlock';
import * as Riffs from '@site/src/tex-riffs';

const tex = Riffs.BACH_PRELUDE_BWV999_SYNCED;

const SyncPointInner: React.FC = () => {
    const api = useAlphaTabApi();
    const isPlaying =
        useAlphaTabEventValue('playerStateChanged', e => e.state === alphaTab.synth.PlayerState.Playing) ?? false;

    useEffect(() => {
        if (!api) { return; }
        const request = new XMLHttpRequest();
        request.open('GET', '/files/Bach_Prelude_BWV999.ogg', true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            const score = alphaTab.importer.ScoreLoader.loadAlphaTex(tex, api.settings);
            score.backingTrack = new alphaTab.model.BackingTrack();
            score.backingTrack.rawAudioFile = new Uint8Array(request.response);
            api.renderScore(score);
        };
        request.send();

        return () => {
            request.abort();
        };
    }, [api]);

    return (
        <div className={styles.wrapper}>
            <button type="button" className="button button--primary" onClick={() => api?.playPause()}>
                {isPlaying ? <IconPause aria-hidden="true" /> : <IconPlay aria-hidden="true" />}
            </button>
            <AlphaTabHost />
        </div>
    );
};

export const AlphaTexSyncPointSample: React.FC = () => {
    const site = useSiteAlphaTabSettings({
        player: true,
        settings: {
            core: { tex: true },
            player: { playerMode: 'EnabledBackingTrack' },
        },
    });
    return (
        <>
            <AlphaTabProvider configureSettings={site.configureSettings} settings={site.settings}>
                <SyncPointInner />
            </AlphaTabProvider>
            <CodeBlock>{tex}</CodeBlock>
        </>
    );
};
