import React, { useEffect } from 'react';
import { PlayerProvider, PlayerHost, usePlayerState } from '@coderline/alphatab-ui';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { useAlphaTabModule } from '@site/src/alphatab-react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import CodeBlock from '@theme/CodeBlock';
import * as Riffs from '@site/src/tex-riffs';

const tex = Riffs.BACH_PRELUDE_BWV999_SYNCED;

const SyncPointInner: React.FC = () => {
    const api = useAlphaTabApi();
    const module = useAlphaTabModule();
    const { isPlaying } = usePlayerState();

    useEffect(() => {
        if (!api || !module) { return; }
        const request = new XMLHttpRequest();
        request.open('GET', '/files/Bach_Prelude_BWV999.ogg', true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            const score = module.importer.ScoreLoader.loadAlphaTex(tex, api.settings);
            score.backingTrack = new module.model.BackingTrack();
            score.backingTrack.rawAudioFile = new Uint8Array(request.response);
            api.renderScore(score);
        };
        request.send();

        return () => {
            request.abort();
        };
    }, [api, module]);

    return (
        <div className={styles.wrapper}>
            <button type="button" className="button button--primary" onClick={() => api?.playPause()}>
                <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
            </button>
            <PlayerHost />
        </div>
    );
};

export const AlphaTexSyncPointSample: React.FC = () => {
    return (
        <>
            <PlayerProvider
                settings={{
                    core: { tex: true },
                    player: { playerMode: 'EnabledBackingTrack' },
                }}
            >
                <SyncPointInner />
            </PlayerProvider>
            <CodeBlock>{tex}</CodeBlock>
        </>
    );
};
