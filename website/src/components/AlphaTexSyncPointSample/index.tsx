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

const tex = `
    \\title "Prelude in D Minor"
    \\artist "J.S. Bach (1685-1750)"
    \\copyright "Public Domain"
    \\tempo 80
    .
    \\ts 3 4
    0.4.16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) |
    (3.2 0.4).16 (3.2 -.4) (1.1 -.4) (5.1 -.4) 1.1 3.2 1.1 3.2 2.3.8 (3.2 3.4) |
    (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) |
    (3.2 0.4).16 (3.2 -.4) (3.1 -.4) (6.1 -.4) 3.1 3.2 3.1 3.2 3.3.8 (3.2 0.3) |
    .
    \\sync 0 0 0
    \\sync 0 0 1500 0.666
    \\sync 1 0 4075 0.666
    \\sync 2 0 6475 0.333
    \\sync 3 0 10223 1
    `.trim().split('\n').map(l => l.trimStart()).join('\n');

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
