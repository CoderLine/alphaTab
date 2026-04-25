import * as alphaTab from '@coderline/alphatab';
import Split from 'split.js';
import { Footer } from '../components/Footer';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { MonacoEditor } from '../components/alphatex-editor/MonacoEditor';
import { NavMenu } from '../components/NavMenu';
import { Sidebar } from '../components/Sidebar';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { Paths } from '../util/Paths';

injectStyles(
    'AlphaTexEditorApp',
    css`
    .at-tex-app {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: row;
    }
    .at-tex-app > .at-tex-editor-pane {
        height: 100%;
        overflow: visible;
        z-index: 10000;
    }
    .at-tex-app > .at-tex-player-pane {
        height: 100%;
        overflow: hidden;
    }
    .at-tex-app .at-wrap-tex {
        position: relative;
        width: 100%;
        height: 100%;
        margin: 0;
        background: #fff;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .at-tex-app .at-wrap-tex > .at-content {
        flex: 1 1 auto;
        overflow: hidden;
        position: relative;
    }
    .at-tex-app .at-wrap-tex .at-viewport {
        overflow-y: auto;
        position: absolute;
        top: 0;
        left: 70px;
        right: 0;
        bottom: 0;
        padding-right: 20px;
    }
    .at-tex-app .gutter {
        background-color: #eee;
        background-repeat: no-repeat;
        background-position: 50%;
    }
    .at-tex-app .gutter.gutter-horizontal {
        cursor: col-resize;
    }
`
);

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

const STORAGE_KEY = 'alphatex-editor.code';

export interface AlphaTexEditorAppOptions {
    initialTex?: string;
}

export class AlphaTexEditorApp implements Mountable {
    readonly root: HTMLElement;
    readonly api: alphaTab.AlphaTabApi;
    private nav: NavMenu;
    private overlay: LoadingOverlay;
    private sidebar: Sidebar;
    private footer: Footer;
    private editor: MonacoEditor;
    private split: ReturnType<typeof Split> | null = null;
    private fromTex = true;
    private subscriptions: (() => void)[] = [];

    constructor(options: AlphaTexEditorAppOptions = {}) {
        this.root = parseHtml(html`
            <div class="at-tex-app">
                <div class="at-tex-editor-pane">
                    <div class="cmp-editor"></div>
                </div>
                <div class="at-tex-player-pane">
                    <div class="at-wrap at-wrap-tex">
                        <div class="cmp-overlay"></div>
                        <div class="at-content">
                            <div class="cmp-sidebar"></div>
                            <div class="at-viewport">
                                <div class="at-canvas"></div>
                            </div>
                        </div>
                        <div class="cmp-footer"></div>
                    </div>
                </div>
            </div>
        `);

        const viewport = this.root.querySelector<HTMLElement>('.at-viewport')!;
        const canvas = this.root.querySelector<HTMLElement>('.at-canvas')!;

        const settings = new alphaTab.Settings();
        settings.fillFromJson({
            core: {
                fontDirectory: Paths.fontDirectory
            },
            player: {
                playerMode: alphaTab.PlayerMode.EnabledAutomatic,
                soundFont: Paths.soundFont,
                scrollOffsetX: -10,
                scrollOffsetY: -20,
                scrollElement: viewport
            }
        } satisfies alphaTab.json.SettingsJson);

        this.api = new alphaTab.AlphaTabApi(canvas, settings);
        this.subscriptions.push(this.api.error.on(e => console.error('alphaTab error', e)));

        this.api.settings.exporter.comments = true;
        this.api.settings.exporter.indent = 2;

        this.subscriptions.push(
            this.api.scoreLoaded.on(score => {
                if (!this.fromTex) {
                    const exporter = new alphaTab.exporter.AlphaTexExporter();
                    const tex = exporter.exportToString(score, this.api.settings);
                    this.editor.setValue(tex);
                }
            })
        );

        this.overlay = mount(this.root, '.cmp-overlay', new LoadingOverlay(this.api));
        this.sidebar = mount(this.root, '.cmp-sidebar', new Sidebar(this.api));
        this.footer = mount(
            this.root,
            '.cmp-footer',
            new Footer(this.api, { trackList: this.sidebar.trackList })
        );

        const initialCode =
            (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null) ??
            options.initialTex ??
            DEFAULT_TEX;

        this.editor = mount(this.root, '.cmp-editor', new MonacoEditor({ initialCode }));
        this.editor.onChange = tex => this.loadTex(tex);

        this.nav = new NavMenu();
        document.body.appendChild(this.nav.root);

        // Initial load and split-pane setup happen after the root is in the DOM.
        // Defer to next tick so the caller has a chance to appendChild before Split() measures.
        queueMicrotask(() => this.afterMount(initialCode));

        if (typeof window !== 'undefined') {
            window.api = this.api;
            window.alphaTab = alphaTab;
        }
    }

    private afterMount(initialCode: string): void {
        if (!this.root.isConnected) {
            queueMicrotask(() => this.afterMount(initialCode));
            return;
        }
        const editorPane = this.root.querySelector<HTMLElement>('.at-tex-editor-pane')!;
        const playerPane = this.root.querySelector<HTMLElement>('.at-tex-player-pane')!;
        this.split = Split([editorPane, playerPane]);
        this.loadTex(initialCode);
    }

    private loadTex(tex: string): void {
        const importer = new alphaTab.importer.AlphaTexImporter();
        importer.initFromString(tex, this.api.settings);
        importer.logErrors = true;
        let score: alphaTab.model.Score;
        try {
            score = importer.readScore();
            this.api.updateSettings();
        } catch {
            return;
        }

        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(STORAGE_KEY, tex);
        }
        this.fromTex = true;
        this.api.renderTracks(score.tracks, { reuseViewport: true });
        this.fromTex = false;
    }

    dispose(): void {
        for (const u of this.subscriptions) {
            u();
        }
        this.subscriptions = [];
        this.split?.destroy();
        this.nav.dispose();
        this.editor.dispose();
        this.footer.dispose();
        this.sidebar.dispose();
        this.overlay.dispose();
        this.api.destroy();
        this.root.remove();
    }
}
