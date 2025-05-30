import { useAlphaTab } from '@site/src/hooks';
import * as alphaTab from '@coderline/alphatab';
import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';

export const AlphaTexSyncPointSample = () => {
    const [api, element] = useAlphaTab(s => {
        s.core.tex = true;
        s.player.playerMode = alphaTab.PlayerMode.EnabledBackingTrack;
        s.player.scrollMode = alphaTab.ScrollMode.Off;
    });
    const [isPlaying, setPlaying] = useState(false);

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

    useEffect(() => {
        if (api) {
            const request = new XMLHttpRequest();
            request.open('GET', '/files/Bach_Prelude_BWV999.ogg', true);
            request.responseType = 'arraybuffer';
            request.onload = () => {
                const score = alphaTab.importer.ScoreLoader.loadAlphaTex(tex, api!.settings);
                score.backingTrack = new alphaTab.model.BackingTrack();
                score.backingTrack.rawAudioFile = new Uint8Array(request.response);
                api.renderScore(score);
            };
            request.send();

            return () => {
                request.abort();
            };
        }
    }, [api]);

    return (
        <>
            <div className={styles.wrapper}>
                <button type="button" className="button button--primary" onClick={() => api?.playPause()}>
                    <FontAwesomeIcon icon={isPlaying ? solid.faPause : solid.faPlay} />
                </button>
                <div ref={element} />
            </div>
            <CodeBlock>{tex}</CodeBlock>
        </>
    );
};
