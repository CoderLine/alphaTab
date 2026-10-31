import * as alphaTab from '@coderline/alphatab';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { PlayerProvider, TexEditorPane, useScoreDocument, withExtension } from '@coderline/alphatab-ui';
import { useCallback } from 'react';
import { DemoPlayerView } from '../player/DemoPlayerView';
import { playerSettings, singleSampleDocuments } from '../player/environment';
import { DevGlobals } from '../player/mount';

const DEFAULT_TEX = `\\title "Canon Rock"
\\subtitle "JerryC"
\\tempo 90

:2 19.2{v f} 17.2{v f} |
15.2{v f} 14.2{v f}|
12.2{v f} 10.2{v f}|
12.2{v f} 14.2{v f}.4 :8 15.2 17.2 |
14.1.2 :8 17.2 15.1 14.1{h} 17.2 |
15.2{v d}.4 :16 17.2{h} 15.2 :8 14.2 14.1 17.1{b(0 4 4 0)}.4 |
15.1.8 :16 14.1{tu 3} 15.1{tu 3} 14.1{tu 3} :8 17.2 15.1 14.1 :16 12.1{tu 3} 14.1{tu 3} 12.1{tu 3} :8 15.2 14.2 |
12.2 14.3 12.3 15.2 :32 14.2{h} 15.2{h} 14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}14.2{h} 15.2{h}`;

const TEX_EXTENSIONS = /\.(alphatex|atex|tex|txt)$/i;

const SETTINGS: alphaTab.json.SettingsJson = {
    ...playerSettings(),
    // Opened files are converted with these, as is "Convert to alphaTex" and the alphaTex download.
    exporter: { comments: true, indent: 2 }
};

const DOCUMENTS = singleSampleDocuments(
    { id: 'canon-rock', fileName: 'canon-rock.alphatex', color: 'var(--at-accent)', source: { tex: DEFAULT_TEX } },
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
