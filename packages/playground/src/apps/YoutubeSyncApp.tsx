import * as alphaTab from '@coderline/alphatab';
import { PlayerProvider, useScoreDocument } from '@coderline/alphatab-ui';
import { YoutubeVideo } from '../components/youtube-sync/YoutubeVideo';
import { DemoPlayerView } from '../player/DemoPlayerView';
import { playerSettings, singleSampleDocuments } from '../player/environment';
import { DevGlobals } from '../player/mount';
import { Paths } from '../util/Paths';

const SETTINGS = playerSettings(alphaTab.PlayerMode.EnabledExternalMedia);

const DOCUMENTS = singleSampleDocuments(
    {
        id: 'canon',
        fileName: Paths.youtubeSyncScore.split('/').pop()!,
        color: 'var(--at-track-green)',
        source: { url: Paths.youtubeSyncScore }
    },
    { tracks: [0] }
);

/** Plays the score in step with a YouTube video through `PlayerMode.EnabledExternalMedia`. */
export function YoutubeSyncApp({ videoId = 'by8oyJztzwo' }: { videoId?: string }) {
    return (
        <PlayerProvider fonts="noto" settings={SETTINGS}>
            <DevGlobals />
            <YoutubeSyncView videoId={videoId} />
        </PlayerProvider>
    );
}

function YoutubeSyncView({ videoId }: { videoId: string }) {
    const doc = useScoreDocument(DOCUMENTS);
    return <DemoPlayerView demo="youtube-sync" doc={doc} beforeWorkspace={<YoutubeVideo videoId={videoId} />} />;
}
