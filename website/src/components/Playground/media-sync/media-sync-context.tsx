import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { model, synth } from '@coderline/alphatab';
import { usePlayerControls, usePlayerSelector, type MediaElementLike } from '@coderline/alphatab-ui';
import { useAlphaTabApi, useAlphaTabEvent } from '@coderline/alphatab-react';
import { useAlphaTabModule } from '@site/src/alphatab-react';
import { analyseAudio, type AudioAnalysis } from './model/audio';
import { applySyncPoints, readTimelineInput, scoreHasSyncPoints, toFlatSyncPoints } from './model/apply';
import { autoSync, markersFromScore } from './model/edit';
import { createHistory, historyReducer } from './model/history';
import { buildMarkers, type SyncMarker, type TimelineInput } from './model/timeline';
import type { YouTubeMedia } from './media/youtube-media';

/** What the score is synchronized with. */
export type MediaKind = 'synth' | 'audio' | 'youtube';

const PLAYBACK_SOURCE = { synth: 'synthesizer', audio: 'backingTrack', youtube: 'externalMedia' } as const;

export interface MediaSyncState {
    kind: MediaKind;
    setKind: (kind: MediaKind) => void;

    /** The score has a backing track (embedded, linked or loaded by the user). */
    hasAudio: boolean;
    audioName: string | null;
    loadAudioFile: (file: File) => Promise<void>;
    analysis: AudioAnalysis | null;
    analysing: boolean;

    youtubeVideoId: string | null;
    openYouTube: (videoId: string) => void;
    youtubeMedia: YouTubeMedia | null;
    setYoutubeMedia: (media: YouTubeMedia | null) => void;

    error: string | null;
    setError: (error: string | null) => void;

    /** The media element playing right now, for the playhead and seeking; `null` with the synthesizer. */
    media: MediaElementLike | null;
    durationMs: number;

    /** `null` until a timeline exists for the current score and media. */
    markers: SyncMarker[] | null;
    commit: (markers: SyncMarker[]) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    autoSyncNow: () => void;
    clearSyncPoints: () => void;
    flatSyncPoints: () => model.FlatSyncPoint[];

    /** Timeline zoom in pixels per second. */
    zoom: number;
    setZoom: (zoom: number) => void;

    /** Forgets media, sync points and the source choice; call when a different document is opened. */
    resetDocument: () => void;
}

const MediaSyncContext = createContext<MediaSyncState | null>(null);

export function useMediaSync(): MediaSyncState {
    const ctx = useContext(MediaSyncContext);
    if (!ctx) { throw new Error('useMediaSync must be used inside <MediaSyncProvider>'); }
    return ctx;
}

// Decoding is expensive; scores re-parsed from alphaTex keep the same audio bytes.
const analysisCache = new WeakMap<Uint8Array, Promise<AudioAnalysis>>();
function analyseCached(bytes: Uint8Array): Promise<AudioAnalysis> {
    let pending = analysisCache.get(bytes);
    if (!pending) {
        pending = analyseAudio(bytes);
        analysisCache.set(bytes, pending);
    }
    return pending;
}

function timelineSignature(input: TimelineInput): string {
    return input.bars.map((b) => `${b.masterBarIndex}:${b.start}-${b.end}`).join(',');
}

function audioElementOf(output: synth.ISynthOutput | undefined): HTMLAudioElement | null {
    const element = (output as synth.IAudioElementBackingTrackSynthOutput | undefined)?.audioElement;
    return element instanceof HTMLAudioElement ? element : null;
}

/** Owns playback source, media and sync points of the Playground. Must be inside `<AlphaTabPlayer>`. */
export const MediaSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const api = useAlphaTabApi();
    const store = usePlayerControls();
    const module = useAlphaTabModule();
    const score = usePlayerSelector((s) => s.currentScore);
    const effective = usePlayerSelector((s) => s.playback.effective);
    const hasAudio = usePlayerSelector((s) => s.playback.hasBackingTrack);

    const [chosenKind, setChosenKind] = useState<MediaKind | null>(null);
    const kind: MediaKind =
        chosenKind ?? (effective === 'backingTrack' ? 'audio' : effective === 'externalMedia' ? 'youtube' : 'synth');

    const [userAudio, setUserAudio] = useState<{ name: string; bytes: Uint8Array } | null>(null);
    const [analysed, setAnalysed] = useState<{ bytes: Uint8Array; result: AudioAnalysis } | null>(null);
    const [analysing, setAnalysing] = useState(false);
    const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
    const [youtubeMedia, setYoutubeMedia] = useState<YouTubeMedia | null>(null);
    const [youtubeDuration, setYoutubeDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(40);

    // alphaTab (re)creates the player and the tick cache asynchronously; these counters make effects re-read them.
    const [playerRevision, bumpPlayer] = useReducer((n: number) => n + 1, 0);
    const [midiRevision, bumpMidi] = useReducer((n: number) => n + 1, 0);
    useAlphaTabEvent('playerReady', bumpPlayer);
    useAlphaTabEvent('midiLoaded', bumpMidi);

    const setKind = useCallback(
        (next: MediaKind) => {
            setChosenKind(next);
            setError(null);
            store?.setPlaybackSource(PLAYBACK_SOURCE[next]);
        },
        [store],
    );

    // User audio lives on the score model, which every alphaTex re-parse replaces.
    useEffect(() => {
        if (!score || !userAudio || !store) { return; }
        if (score.backingTrack?.rawAudioFile !== userAudio.bytes) { store.attachBackingTrackAudio(userAudio.bytes); }
    }, [score, userAudio, store]);

    const loadAudioFile = useCallback(
        async (file: File) => {
            const bytes = new Uint8Array(await file.arrayBuffer());
            setUserAudio({ name: file.name, bytes });
            store?.attachBackingTrackAudio(bytes);
            setKind('audio');
        },
        [store, setKind],
    );

    const openYouTube = useCallback(
        (videoId: string) => {
            setYoutubeMedia(null);
            setYoutubeDuration(0);
            setYoutubeVideoId(videoId);
            setKind('youtube');
        },
        [setKind],
    );

    const audioBytes = kind === 'audio' && effective === 'backingTrack' ? (score?.backingTrack?.rawAudioFile ?? null) : null;
    const analysis = analysed && analysed.bytes === audioBytes ? analysed.result : null;
    useEffect(() => {
        if (!audioBytes) { return; }
        let cancelled = false;
        setAnalysing(true);
        analyseCached(audioBytes).then(
            (result) => {
                if (cancelled) { return; }
                setAnalysed({ bytes: audioBytes, result });
                setAnalysing(false);
            },
            (e: unknown) => {
                if (cancelled) { return; }
                setAnalysing(false);
                setError(`The audio could not be decoded: ${e instanceof Error ? e.message : String(e)}`);
            },
        );
        return () => {
            cancelled = true;
        };
    }, [audioBytes]);

    // `api.player.output` is a different object after every player rebuild.
    const media = useMemo<MediaElementLike | null>(() => {
        if (kind === 'youtube') { return youtubeMedia; }
        if (kind === 'audio' && effective === 'backingTrack') { return audioElementOf(api?.player?.output); }
        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kind, effective, youtubeMedia, api, playerRevision]);

    useEffect(() => {
        if (!youtubeMedia || !store || kind !== 'youtube') { return; }
        const onDuration = () => setYoutubeDuration(Number.isFinite(youtubeMedia.duration) ? youtubeMedia.duration * 1000 : 0);
        onDuration();
        youtubeMedia.addEventListener('durationchange', onDuration);
        youtubeMedia.addEventListener('loadedmetadata', onDuration);
        const unbind = store.bindExternalMedia(youtubeMedia);
        return () => {
            unbind();
            youtubeMedia.pause();
            youtubeMedia.removeEventListener('durationchange', onDuration);
            youtubeMedia.removeEventListener('loadedmetadata', onDuration);
        };
    }, [youtubeMedia, store, kind]);

    // ─── Sync points ───────────────────────────────────────────────
    const [history, dispatch] = useReducer(historyReducer<SyncMarker[] | null>, createHistory<SyncMarker[] | null>(null));
    const timeline = useRef<{ signature: string; score: model.Score | null } | null>(null);
    const syncing = kind !== 'synth';

    useEffect(() => {
        if (!api || !module || !score || !syncing) { return; }
        const input = readTimelineInput(module, api, false);
        if (!input) { return; }
        const signature = timelineSignature(input);
        if (timeline.current?.signature === signature && history.present) {
            // Same bars (e.g. an edited alphaTex): carry the sync points over to the new score model.
            if (timeline.current.score !== score) {
                timeline.current.score = score;
                applySyncPoints(api, toFlatSyncPoints(history.present));
            }
            return;
        }
        let markers: SyncMarker[];
        if (scoreHasSyncPoints(score)) {
            markers = markersFromScore(input);
        } else if (kind === 'audio') {
            if (!analysis) { return; }
            markers = autoSync(readTimelineInput(module, api, true)!, analysis.songRange);
        } else {
            markers = autoSync(readTimelineInput(module, api, true)!, null);
        }
        timeline.current = { signature, score };
        dispatch({ type: 'reset', value: markers });
        // `history.present` is read, not reacted to: edits are applied by the effect below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, module, score, syncing, kind, analysis, midiRevision]);

    const appliedRef = useRef<SyncMarker[] | null>(null);
    useEffect(() => {
        const present = history.present;
        if (!api || !present || appliedRef.current === present) { return; }
        appliedRef.current = present;
        applySyncPoints(api, toFlatSyncPoints(present));
    }, [api, history.present]);

    const commit = useCallback((markers: SyncMarker[]) => dispatch({ type: 'commit', value: markers }), []);
    const undo = useCallback(() => dispatch({ type: 'undo' }), []);
    const redo = useCallback(() => dispatch({ type: 'redo' }), []);

    const autoSyncNow = useCallback(() => {
        if (!api || !module) { return; }
        const input = readTimelineInput(module, api, true);
        if (!input) { return; }
        commit(autoSync(input, kind === 'audio' ? (analysis?.songRange ?? null) : null));
    }, [api, module, kind, analysis, commit]);

    const clearSyncPoints = useCallback(() => {
        if (!api || !module) { return; }
        const input = readTimelineInput(module, api, false);
        if (!input) { return; }
        const markers = buildMarkers({ ...input, syncPoints: [] });
        markers[0].syncBpm = markers[0].synthBpm;
        markers[markers.length - 1].syncBpm = markers[markers.length - 1].synthBpm;
        commit(markers);
    }, [api, module, commit]);

    const resetDocument = useCallback(() => {
        setChosenKind(null);
        setUserAudio(null);
        setYoutubeVideoId(null);
        setYoutubeMedia(null);
        setError(null);
        timeline.current = null;
        appliedRef.current = null;
        dispatch({ type: 'reset', value: null });
        store?.setPlaybackSource(null);
    }, [store]);

    const flatSyncPoints = useCallback(() => (history.present ? toFlatSyncPoints(history.present) : []), [history.present]);

    const markersEnd = history.present ? history.present[history.present.length - 1].syncTime : 0;
    const durationMs = Math.max(
        kind === 'audio' ? (analysis?.durationMs ?? 0) : kind === 'youtube' ? youtubeDuration : 0,
        markersEnd + 1000,
    );

    const value: MediaSyncState = {
        kind,
        setKind,
        hasAudio,
        audioName: userAudio?.name ?? null,
        loadAudioFile,
        analysis: kind === 'audio' ? analysis : null,
        analysing,
        youtubeVideoId,
        openYouTube,
        youtubeMedia,
        setYoutubeMedia,
        error,
        setError,
        media,
        durationMs,
        markers: syncing ? history.present : null,
        commit,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        autoSyncNow,
        clearSyncPoints,
        flatSyncPoints,
        zoom,
        setZoom,
        resetDocument,
    };

    return <MediaSyncContext.Provider value={value}>{children}</MediaSyncContext.Provider>;
};
