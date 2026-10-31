import * as alphaTab from '@coderline/alphatab';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { PlayerProvider, TexEditorPane, useScoreDocument, withExtension } from '@coderline/alphatab-ui';
import { useCallback } from 'react';
import { DemoPlayerView } from '../player/DemoPlayerView';
import { playerSettings, singleSampleDocuments } from '../player/environment';
import { DevGlobals } from '../player/mount';

const DEFAULT_TEX = `\\title "Iron Waltz"
\\subtitle "Intro Build"
\\artist "alphaTab"
\\tempo 196
\\track ("Lead Guitar" "Lead Gtr.") { instrument distortionguitar }
\\tuning (Eb4 Bb3 Gb3 Db3 Ab2 Eb2)
\\ts (3 4)
\\section "Intro Build"
7.1.4{dy f} 14.1.8 12.2 14.2 12.2 |
:16 11.1{b (0 2)} -.1{b (2 0)} :8 11.1 12.2.4 :8 11.1 12.1 |
:16 11.1{h} 12.1{h} :8 11.1 12.2 14.2 16.2 14.2 |
2.1.4 4.1 6.1{v} |
7.1.4 7.2.8 7.1 9.1 7.1 |
:16 11.1{b (0 2)} -.1{b (2 0)} :8 11.1 12.2.4 :8 11.1 12.1 |
11.1.8 12.1 11.1 9.1 7.1 6.1 |
2.1.4 4.1 6.1{v}
`;

const TEX_EXTENSIONS = /\.(alphatex|atex|tex|txt)$/i;

const SETTINGS: alphaTab.json.SettingsJson = {
    ...playerSettings(),
    // Opened files are converted with these, as is "Convert to alphaTex" and the alphaTex download.
    exporter: { comments: true, indent: 2 }
};

const DOCUMENTS = singleSampleDocuments(
    { id: 'iron-waltz', fileName: 'iron-waltz.alphatex', color: 'var(--at-accent)', source: { tex: DEFAULT_TEX } },
    { sessionKey: 'alphatab.playground.alphatex-editor.document' }
);

/** The alphaTex editor next to the live rendering; opened files of any format are converted to alphaTex. */
export function AlphaTexEditorApp() {
    return (
        <PlayerProvider fonts="noto" settings={SETTINGS}>
            <DevGlobals />
            <AlphaTexEditorView />
        </PlayerProvider>
    );
}

function AlphaTexEditorView() {
    const api = useAlphaTabApi();
    const doc = useScoreDocument(DOCUMENTS);
    const { openFile, openTex } = doc;

    const openAsTex = useCallback(
        async (file: File) => {
            if (!api || TEX_EXTENSIONS.test(file.name)) {
                await openFile(file);
                return;
            }
            let tex: string;
            try {
                const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
                    new Uint8Array(await file.arrayBuffer()),
                    api.settings
                );
                tex = new alphaTab.exporter.AlphaTexExporter().exportToString(score, api.settings);
            } catch (e) {
                console.error('alphaTab: the file could not be converted to alphaTex', e);
                await openFile(file);
                return;
            }
            openTex(withExtension(file.name, 'alphatex'), tex);
        },
        [api, openFile, openTex]
    );

    return (
        <DemoPlayerView
            demo="alphatex-editor"
            doc={doc}
            onOpenFile={file => void openAsTex(file)}
            editor={close => <TexEditorPane doc={doc} onClose={close} />}
        />
    );
}
