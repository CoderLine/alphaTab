import { useCallback, useEffect, useRef, useState } from 'react';
import {
    usePlayerControls,
    usePlayerSelector,
    type BackingTrackSource,
    type ScoreSource,
    type TexLoadResult,
} from '@coderline/alphatab-ui';
import { DEFAULT_SAMPLE_ID, findSample, type PlaygroundSample } from './sources';
import { buildPlaygroundUrl, parsePlaygroundUrl, type PlaygroundLinkTarget, type TrackSelection } from './url-state';

const TEX_RENDER_DELAY_MS = 250;
const URL_UPDATE_DELAY_MS = 600;
const TEX_EXTENSIONS = /\.(alphatex|atex|tex|txt)$/i;

interface DocumentBase {
    /** Changes whenever a different document is opened, never while one is edited. */
    id: number;
    fileName: string;
    color: string;
    /** Rendered tracks on open. */
    initialTracks: TrackSelection;
}

export type PlaygroundDocument =
    | (DocumentBase & {
          kind: 'binary';
          source: ScoreSource;
          /** How a link can reopen it; `null` for local files. */
          link: { sample: string } | { url: string } | null;
      })
    | (DocumentBase & {
          kind: 'tex';
          /** Text as opened; `text` in `PlaygroundDocumentState` is the edited one. */
          originalText: string;
          sampleId?: string;
          backingTrack?: BackingTrackSource;
      });

export interface PlaygroundDocumentState {
    document: PlaygroundDocument | null;
    /** Current alphaTex source for `tex` documents. */
    text: string;
    setText: (text: string) => void;
    /** Result of the last alphaTex parse; `null` before the first one and for binary documents. */
    texResult: (TexLoadResult & { text: string }) | null;
    loadError: string | null;
    openSample: (sample: PlaygroundSample) => void;
    openFile: (file: File) => Promise<void>;
    /** Opens `text` as a new alphaTex document, e.g. a converted file. */
    openTex: (fileName: string, text: string) => void;
    /** Imports the open document again, e.g. after changing importer settings; keeps the track selection. */
    reload: () => void;
    /** Link reproducing the current document and track selection; `null` when it cannot be linked (local binary files). */
    buildShareUrl: () => Promise<string | null>;
}

let nextDocumentId = 1;

/**
 * The open document outside React state, so a remount of the player (switching the music font)
 * reopens it, including local files and unsaved alphaTex edits, which the URL cannot carry.
 */
let remembered: { document: PlaygroundDocument; text: string } | null = null;

function fileNameOfUrl(url: string): string {
    return decodeURIComponent(url.split(/[?#]/)[0].split('/').pop() || 'score');
}

function documentForSample(sample: PlaygroundSample, tracks: TrackSelection): PlaygroundDocument {
    const base = { id: nextDocumentId++, fileName: sample.fileName, color: sample.color, initialTracks: tracks };
    if (sample.source.tex !== undefined) {
        return {
            ...base,
            kind: 'tex',
            originalText: sample.source.tex,
            sampleId: sample.id,
            backingTrack: sample.source.backingTrack,
        };
    }
    return { ...base, kind: 'binary', source: sample.source, link: { sample: sample.id } };
}

function documentForTarget(target: PlaygroundLinkTarget | null): PlaygroundDocument {
    const tracks = target?.tracks ?? 'all';
    if (target && 'tex' in target) {
        return {
            id: nextDocumentId++,
            kind: 'tex',
            fileName: 'untitled.alphatex',
            color: 'var(--at-accent)',
            initialTracks: tracks,
            originalText: target.tex,
        };
    }
    if (target && 'url' in target) {
        return {
            id: nextDocumentId++,
            kind: 'binary',
            fileName: fileNameOfUrl(target.url),
            color: 'var(--at-track-indigo)',
            initialTracks: tracks,
            source: { url: target.url },
            link: { url: target.url },
        };
    }
    const sample = findSample(target && 'sample' in target ? target.sample : null) ?? findSample(DEFAULT_SAMPLE_ID)!;
    return documentForSample(sample, tracks);
}

/** Opens, loads and links the Playground's score. Must be used inside `<AlphaTabPlayer>`. */
export function usePlaygroundDocument(): PlaygroundDocumentState {
    const controls = usePlayerControls();
    const renderedTracks = usePlayerSelector((s) => s.renderedTracks);
    const trackCount = usePlayerSelector((s) => s.tracks.length);
    const [document, setDocument] = useState<PlaygroundDocument | null>(null);
    const [text, setText] = useState('');
    const [texResult, setTexResult] = useState<PlaygroundDocumentState['texResult']>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const renderedRef = useRef(renderedTracks);
    renderedRef.current = renderedTracks;
    const trackCountRef = useRef(trackCount);
    trackCountRef.current = trackCount;

    const open = useCallback((next: PlaygroundDocument) => {
        setLoadError(null);
        setTexResult(null);
        setDocument(next);
        setText(next.kind === 'tex' ? next.originalText : '');
    }, []);

    useEffect(() => {
        let cancelled = false;
        void parsePlaygroundUrl(window.location).then((target) => {
            if (cancelled) { return; }
            // A link always wins; a plain /playground continues with the last document of this visit.
            if (!target && remembered) {
                setDocument(remembered.document);
                setText(remembered.text);
                return;
            }
            open(documentForTarget(target));
        });
        return () => {
            cancelled = true;
        };
    }, [open]);

    useEffect(() => {
        if (!document) { return; }
        remembered = { document, text };
    }, [document, text]);

    // Binary documents load once per open.
    useEffect(() => {
        if (!controls || document?.kind !== 'binary') { return; }
        controls.loadSource(document.source, { tracks: document.initialTracks }).catch((e: unknown) => {
            setLoadError(e instanceof Error ? e.message : String(e));
        });
    }, [controls, document]);

    // alphaTex documents re-render on every edit; the first render of a document is immediate.
    const lastTexDocumentId = useRef(0);
    useEffect(() => {
        if (!controls || document?.kind !== 'tex') { return; }
        const first = lastTexDocumentId.current !== document.id;
        const render = () => {
            lastTexDocumentId.current = document.id;
            const rendered = renderedRef.current.map((t) => t.index);
            const allRendered = rendered.length > 0 && rendered.length === trackCountRef.current;
            const tracks = first || rendered.length === 0 ? document.initialTracks : allRendered ? 'all' : rendered;
            setTexResult({ text, ...controls.loadTex(text, { tracks, backingTrack: document.backingTrack }) });
        };
        if (first) {
            render();
            return;
        }
        const timer = setTimeout(render, TEX_RENDER_DELAY_MS);
        return () => clearTimeout(timer);
    }, [controls, document, text]);

    const openSample = useCallback((sample: PlaygroundSample) => open(documentForSample(sample, 'all')), [open]);

    const openFile = useCallback(
        async (file: File) => {
            const base = { id: nextDocumentId++, fileName: file.name, color: 'var(--at-track-green)', initialTracks: 'all' as const };
            if (TEX_EXTENSIONS.test(file.name)) {
                open({ ...base, kind: 'tex', originalText: await file.text() });
            } else {
                const bytes = new Uint8Array(await file.arrayBuffer());
                open({ ...base, kind: 'binary', source: { bytes, name: file.name }, link: null });
            }
        },
        [open],
    );

    const openTex = useCallback(
        (fileName: string, tex: string) =>
            open({
                id: nextDocumentId++,
                kind: 'tex',
                fileName,
                color: 'var(--at-accent)',
                initialTracks: renderedRef.current.length > 0 ? renderedRef.current.map((t) => t.index) : 'all',
                originalText: tex,
            }),
        [open],
    );

    const textRef = useRef(text);
    textRef.current = text;
    const reload = useCallback(() => {
        if (!controls || !document) { return; }
        const rendered = renderedRef.current.map((t) => t.index);
        const tracks = rendered.length > 0 && rendered.length < trackCountRef.current ? rendered : 'all';
        if (document.kind === 'binary') {
            controls.loadSource(document.source, { tracks }).catch((e: unknown) => {
                setLoadError(e instanceof Error ? e.message : String(e));
            });
        } else {
            setTexResult({ text: textRef.current, ...controls.loadTex(textRef.current, { tracks, backingTrack: document.backingTrack }) });
        }
    }, [controls, document]);

    const currentTracks = useCallback((): TrackSelection | undefined => {
        const rendered = renderedRef.current.map((t) => t.index);
        if (rendered.length === 0 || rendered.length === trackCountRef.current) { return undefined; }
        return rendered;
    }, []);

    const linkTarget = useCallback((): PlaygroundLinkTarget | null => {
        if (!document) { return null; }
        const tracks = currentTracks();
        if (document.kind === 'binary') { return document.link ? { ...document.link, tracks } : null; }
        if (document.sampleId && text === document.originalText) { return { sample: document.sampleId, tracks }; }
        return { tex: text, tracks };
    }, [document, text, currentTracks]);

    const buildShareUrl = useCallback(async () => {
        const target = linkTarget();
        if (!target) { return null; }
        return new URL(await buildPlaygroundUrl(target, window.location.pathname), window.location.origin).toString();
    }, [linkTarget]);

    // Mirror the document into the address bar so a reload reopens it (local binary files cannot be).
    const renderedKey = renderedTracks.map((t) => t.index).join(',');
    useEffect(() => {
        if (!document) { return; }
        let cancelled = false;
        const timer = setTimeout(() => {
            const target = linkTarget();
            const path = window.location.pathname;
            const next = target ? buildPlaygroundUrl(target, path) : Promise.resolve(path);
            void next.then((url) => {
                if (!cancelled && url !== window.location.pathname + window.location.search + window.location.hash) {
                    window.history.replaceState(window.history.state, '', url);
                }
            });
        }, URL_UPDATE_DELAY_MS);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [document, linkTarget, renderedKey]);

    return { document, text, setText, texResult, loadError, openSample, openFile, openTex, reload, buildShareUrl };
}
