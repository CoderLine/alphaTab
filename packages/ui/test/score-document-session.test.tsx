import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScoreDocumentAdapter, ScoreDocumentState } from '../src/editor/use-score-document';

const controls = {
    loadTex: vi.fn(() => ({ rendered: true, diagnostics: [] })),
    loadSource: vi.fn(async () => {})
};

vi.mock('../src/player/PlayerProvider', () => ({
    usePlayerControls: () => controls,
    usePlayerSelector: (select: (state: { renderedTracks: never[]; tracks: never[] }) => unknown) =>
        select({ renderedTracks: [], tracks: [] })
}));

const KEY = 'test.score-document';

const adapter: ScoreDocumentAdapter = {
    findSample: id =>
        id === 'riff' ? { id: 'riff', fileName: 'riff.alphatex', color: 'red', source: { tex: '3.3.4' } } : undefined,
    defaultSampleId: 'riff',
    sessionKey: KEY
};

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Mounts the hook in a fresh module instance, as a page load does. */
async function mountDocument(): Promise<{ current: () => ScoreDocumentState; unmount: () => void }> {
    vi.resetModules();
    const { useScoreDocument } = await import('../src/editor/use-score-document');
    let state: ScoreDocumentState | null = null;
    const Probe = () => {
        state = useScoreDocument(adapter);
        return null;
    };
    const root = createRoot(document.createElement('div'));
    await act(async () => {
        root.render(<Probe />);
    });
    return { current: () => state!, unmount: () => act(() => root.unmount()) };
}

describe('useScoreDocument session persistence', () => {
    beforeEach(() => sessionStorage.clear());
    afterEach(() => vi.clearAllMocks());

    it('reopens an edited alphaTex document after a reload', async () => {
        const first = await mountDocument();
        expect(first.current().text).toBe('3.3.4');
        await act(async () => first.current().setText('5.3.4'));
        first.unmount();

        const second = await mountDocument();
        const state = second.current();
        expect(state.document?.kind).toBe('tex');
        expect(state.document?.fileName).toBe('riff.alphatex');
        expect(state.text).toBe('5.3.4');
        expect(state.document?.kind === 'tex' && state.document.originalText).toBe('3.3.4');
        second.unmount();
    });

    it('forgets the document when a binary file is opened', async () => {
        const first = await mountDocument();
        await act(async () => first.current().openFile(new File([new Uint8Array([1, 2])], 'song.gp')));
        expect(sessionStorage.getItem(KEY)).toBeNull();
        first.unmount();
    });

    it('ignores unreadable entries', async () => {
        sessionStorage.setItem(KEY, '{"fileName": 3}');
        const page = await mountDocument();
        expect(page.current().text).toBe('3.3.4');
        page.unmount();
    });
});
