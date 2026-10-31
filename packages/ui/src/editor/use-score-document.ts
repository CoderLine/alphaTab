import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlayerControls, usePlayerSelector } from '../player/PlayerProvider';
import type { BackingTrackSource, ScoreSource } from '../state/playback/score-source';
import type { TexLoadResult } from '../state/store';

const TEX_RENDER_DELAY_MS = 250;
const URL_UPDATE_DELAY_MS = 600;
const TEX_EXTENSIONS = /\.(alphatex|atex|tex|txt)$/i;

export type TrackSelection = number[] | 'all';

/** A score a {@link ScoreDocumentAdapter} offers by id. */
export interface ScoreSample {
    id: string;
    fileName: string;
    /** CSS color of the document marker. */
    color: string;
    source: ScoreSource;
}

/** A score that a link can reopen. */
export type ScoreLinkTarget =
    | { sample: string; tracks?: TrackSelection }
    | { url: string; tracks?: TrackSelection }
    | { tex: string; tracks?: TrackSelection };

/** What {@link useScoreDocument} needs from its host: the samples and, optionally, page links. */
export interface ScoreDocumentAdapter {
    findSample(id: string): ScoreSample | undefined;
    /** The sample opened when neither the page address nor an earlier visit names a document. */
    defaultSampleId: string;
    /** The score the current page address names, `null` for none. */
    readLink?(): Promise<ScoreLinkTarget | null>;
    /**
     * A page address (path, query and hash) that reopens `target`. With it, the open document is
     * mirrored into the address bar and `buildShareUrl` returns links.
     */
    buildLink?(target: ScoreLinkTarget): Promise<string>;
    /**
     * `sessionStorage` key that keeps an open alphaTex document with its edits, so a reload of the
     * page reopens it when the address names no document. Binary documents are not kept.
     */
    sessionKey?: string;
}

interface DocumentBase {
    /** Changes whenever a different document is opened, never while one is edited. */
    id: number;
    fileName: string;
    color: string;
    /** Rendered tracks on open. */
    initialTracks: TrackSelection;
}

export type ScoreDocument =
    | (DocumentBase & {
          kind: 'binary';
          source: ScoreSource;
          /** How a link can reopen it; `null` for local files. */
          link: { sample: string } | { url: string } | null;
      })
    | (DocumentBase & {
          kind: 'tex';
          /** Text as opened; `text` in `ScoreDocumentState` is the edited one. */
          originalText: string;
          sampleId?: string;
          backingTrack?: BackingTrackSource;
      });

export interface ScoreDocumentState {
    document: ScoreDocument | null;
    /** Current alphaTex source for `tex` documents. */
    text: string;
    setText: (text: string) => void;
    /** Result of the last alphaTex parse; `null` before the first one and for binary documents. */
    texResult: (TexLoadResult & { text: string }) | null;
    loadError: string | null;
    openSample: (sample: ScoreSample) => void;
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
let remembered: { document: ScoreDocument; text: string } | null = null;

interface SessionDocument {
    fileName: string;
    originalText: string;
    text: string;
    sampleId?: string;
}

function readSession(key: string): SessionDocument | null {
    try {
        const raw = sessionStorage.getItem(key);
        const parsed: unknown = raw === null ? null : JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) { return null; }
        const { fileName, originalText, text, sampleId } = parsed as Record<string, unknown>;
        if (typeof fileName !== 'string' || typeof originalText !== 'string' || typeof text !== 'string') { return null; }
        return { fileName, originalText, text, sampleId: typeof sampleId === 'string' ? sampleId : undefined };
    } catch {
        return null;
    }
}

function writeSession(key: string, document: ScoreDocument, text: string): void {
    try {
        if (document.kind === 'tex') {
            const entry: SessionDocument = { fileName: document.fileName, originalText: document.originalText, text, sampleId: document.sampleId };
            sessionStorage.setItem(key, JSON.stringify(entry));
        } else {
            sessionStorage.removeItem(key);
        }
    } catch {
        // Storage can be unavailable or full; the document then only lives as long as the page.
    }
}

function documentForSession(entry: SessionDocument, adapter: ScoreDocumentAdapter): ScoreDocument {
    const sample = entry.sampleId ? adapter.findSample(entry.sampleId) : undefined;
    return {
        id: nextDocumentId++,
        kind: 'tex',
        fileName: entry.fileName,
        color: sample?.color ?? 'var(--at-accent)',
        initialTracks: 'all',
        originalText: entry.originalText,
        sampleId: sample?.id,
        backingTrack: sample?.source.backingTrack,
    };
}

function fileNameOfUrl(url: string): string {
    return decodeURIComponent(url.split(/[?#]/)[0].split('/').pop() || 'score');
}

function documentForSample(sample: ScoreSample, tracks: TrackSelection): ScoreDocument {
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

function documentForTarget(target: ScoreLinkTarget | null, adapter: ScoreDocumentAdapter): ScoreDocument {
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
    const named = target && 'sample' in target ? adapter.findSample(target.sample) : undefined;
    const sample = named ?? adapter.findSample(adapter.defaultSampleId);
    if (!sample) {
        throw new Error(`The default sample ${adapter.defaultSampleId} does not exist`);
    }
    return documentForSample(sample, tracks);
}

/**
 * The score document of a player view: opens samples, files and alphaTex, loads them through the
 * store (alphaTex re-renders on every edit, keeping the viewport), and with `adapter.buildLink`
 * keeps the page address and share links in sync. The open document survives a remount of the
 * player within the page, and with `adapter.sessionKey` an alphaTex document also a reload. Must be used inside `<PlayerProvider>`; keep `adapter` stable.
 */
export function useScoreDocument(adapter: ScoreDocumentAdapter): ScoreDocumentState {
    const controls = usePlayerControls();
    const renderedTracks = usePlayerSelector((s) => s.renderedTracks);
    const trackCount = usePlayerSelector((s) => s.tracks.length);
    const [document, setDocument] = useState<ScoreDocument | null>(null);
    const [text, setText] = useState('');
    const [texResult, setTexResult] = useState<ScoreDocumentState['texResult']>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const renderedRef = useRef(renderedTracks);
    renderedRef.current = renderedTracks;
    const trackCountRef = useRef(trackCount);
    trackCountRef.current = trackCount;

    const open = useCallback((next: ScoreDocument) => {
        setLoadError(null);
        setTexResult(null);
        setDocument(next);
        setText(next.kind === 'tex' ? next.originalText : '');
    }, []);

    useEffect(() => {
        let cancelled = false;
        void (adapter.readLink?.() ?? Promise.resolve(null)).then((target) => {
            if (cancelled) { return; }
            // A link always wins; an address without one continues with the last document of this page.
            if (!target && remembered) {
                setDocument(remembered.document);
                setText(remembered.text);
                return;
            }
            const session = !target && adapter.sessionKey ? readSession(adapter.sessionKey) : null;
            if (session) {
                open(documentForSession(session, adapter));
                setText(session.text);
                return;
            }
            open(documentForTarget(target, adapter));
        });
        return () => {
            cancelled = true;
        };
    }, [open, adapter]);

    useEffect(() => {
        if (!document) { return; }
        remembered = { document, text };
        if (adapter.sessionKey) { writeSession(adapter.sessionKey, document, text); }
    }, [document, text, adapter]);

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
            setTexResult({
                text,
                ...controls.loadTex(text, { tracks, backingTrack: document.backingTrack, reuseViewport: !first }),
            });
        };
        if (first) {
            render();
            return;
        }
        const timer = setTimeout(render, TEX_RENDER_DELAY_MS);
        return () => clearTimeout(timer);
    }, [controls, document, text]);

    const openSample = useCallback((sample: ScoreSample) => open(documentForSample(sample, 'all')), [open]);

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

    const linkTarget = useCallback((): ScoreLinkTarget | null => {
        if (!document) { return null; }
        const tracks = currentTracks();
        if (document.kind === 'binary') { return document.link ? { ...document.link, tracks } : null; }
        if (document.sampleId && text === document.originalText) { return { sample: document.sampleId, tracks }; }
        return { tex: text, tracks };
    }, [document, text, currentTracks]);

    const buildShareUrl = useCallback(async () => {
        const target = linkTarget();
        if (!target || !adapter.buildLink) { return null; }
        return new URL(await adapter.buildLink(target), window.location.origin).toString();
    }, [linkTarget, adapter]);

    // Mirror the document into the address bar so a reload reopens it (local binary files cannot be).
    const renderedKey = renderedTracks.map((t) => t.index).join(',');
    useEffect(() => {
        const buildLink = adapter.buildLink;
        if (!document || !buildLink) { return; }
        let cancelled = false;
        const timer = setTimeout(() => {
            const target = linkTarget();
            const path = window.location.pathname;
            const next = target ? buildLink(target) : Promise.resolve(path);
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
    }, [document, linkTarget, renderedKey, adapter]);

    return { document, text, setText, texResult, loadError, openSample, openFile, openTex, reload, buildShareUrl };
}
