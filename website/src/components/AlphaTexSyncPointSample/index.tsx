import React, { useEffect } from 'react';
import {
    AlphaTabPlayer,
    AlphaTabCanvas,
    useAlphaTabApi,
    useAlphaTabModule,
    useAlphaTabState,
} from '@site/src/alphatab-react';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import CodeBlock from '@theme/CodeBlock';
import * as Riffs from '@site/src/tex-riffs';

const tex = Riffs.BACH_PRELUDE_BWV999_SYNCED;

const SyncPointInner: React.FC = () => {
    const api = useAlphaTabApi();
    const module = useAlphaTabModule();
    const { isPlaying } = useAlphaTabState();

    useEffect(() => {
        if (!api || !module) return;
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
            <AlphaTabCanvas />
        </div>
    );
};

export const AlphaTexSyncPointSample: React.FC = () => {
    return (
        <>
            <AlphaTabPlayer
                settings={{
                    core: { tex: true },
                    player: { playerMode: 'EnabledBackingTrack' },
                }}
            >
                <SyncPointInner />
            </AlphaTabPlayer>
            <CodeBlock>{tex}</CodeBlock>
        </>
    );
};
