import * as alphaTab from '@coderline/alphatab';
import { Crosshair } from '../components/Crosshair';
import { DragDrop } from '../components/DragDrop';
import { Footer } from '../components/Footer';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { NavMenu } from '../components/NavMenu';
import { SelectionHandles } from '../components/SelectionHandles';
import { Sidebar } from '../components/Sidebar';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { Paths } from '../util/Paths';

injectStyles(
    'ControlApp',
    css`
    .at-wrap {
        position: relative;
        width: 90vw;
        height: 90vh;
        margin: 0 auto;
        border: 1px solid rgba(0, 0, 0, 0.12);
        background: #fff;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .at-wrap > .at-content {
        flex: 1 1 auto;
        overflow: hidden;
        position: relative;
    }
    .at-wrap .at-viewport {
        overflow-y: auto;
        position: absolute;
        top: 0;
        left: 70px;
        right: 0;
        bottom: 0;
        padding-right: 20px;
    }
    @media screen and (max-width: 1100px) {
        .at-wrap .at-viewport { left: 0; }
    }
    @media screen and (max-width: 920px) {
        .at-wrap { height: 60vh; }
    }
`
);

export interface ControlAppOptions {
    file?: string;
    soundFont?: string;
    fontDirectory?: string;
    settings?: alphaTab.json.SettingsJson;
}

function applyFonts(settings: alphaTab.Settings): void {
    settings.display.resources.copyrightFont.families = ['Noto Sans'];
    settings.display.resources.titleFont.families = ['Noto Serif'];
    settings.display.resources.subTitleFont.families = ['Noto Serif'];
    settings.display.resources.wordsFont.families = ['Noto Serif'];
    settings.display.resources.effectFont.families = ['Noto Serif'];
    settings.display.resources.timerFont.families = ['Noto Serif'];
    settings.display.resources.fretboardNumberFont.families = ['Noto Sans'];
    settings.display.resources.tablatureFont.families = ['Noto Sans'];
    settings.display.resources.graceFont.families = ['Noto Sans'];
    settings.display.resources.barNumberFont.families = ['Noto Sans'];
    settings.display.resources.markerFont.families = ['Noto Serif'];
    settings.display.resources.directionsFont.families = ['Noto Serif'];
    settings.display.resources.numberedNotationFont.families = ['Noto Sans'];
    settings.display.resources.numberedNotationGraceFont.families = ['Noto Sans'];
}

export function buildSettings(options: ControlAppOptions, viewport: HTMLElement): alphaTab.Settings {
    const params = new URL(window.location.href).searchParams;
    const settings = new alphaTab.Settings();
    applyFonts(settings);
    settings.fillFromJson({
        core: {
            logLevel: (params.get('loglevel') ?? 'info') as alphaTab.json.CoreSettingsJson['logLevel'],
            engine: params.get('engine') ?? 'default',
            file: options.file ?? Paths.defaultScore,
            fontDirectory: options.fontDirectory ?? Paths.fontDirectory
        },
        player: {
            playerMode: alphaTab.PlayerMode.EnabledAutomatic,
            scrollOffsetX: -10,
            scrollOffsetY: -20,
            soundFont: options.soundFont ?? Paths.soundFont,
            scrollElement: viewport
        }
    } satisfies alphaTab.json.SettingsJson);
    if (options.settings) {
        settings.fillFromJson(options.settings);
    }
    return settings;
}

export class ControlApp implements Mountable {
    readonly root: HTMLElement;
    readonly api: alphaTab.AlphaTabApi;
    readonly sidebar: Sidebar;
    readonly footer: Footer;
    private overlay: LoadingOverlay;
    private selectionHandles: SelectionHandles;
    private crosshair: Crosshair;
    private dragDrop: DragDrop;
    private nav: NavMenu;
    private unsubError: () => void;

    constructor(options: ControlAppOptions = {}) {
        this.root = parseHtml(html`
            <div class="at-wrap">
                <div class="cmp-overlay"></div>
                <div class="at-content">
                    <div class="cmp-sidebar"></div>
                    <div class="at-viewport">
                        <div class="at-canvas"></div>
                    </div>
                </div>
                <div class="cmp-footer"></div>
                <div class="cmp-selection-handles"></div>
            </div>
        `);

        const viewport = this.root.querySelector<HTMLElement>('.at-viewport')!;
        const canvas = this.root.querySelector<HTMLElement>('.at-canvas')!;
        const settings = buildSettings(options, viewport);

        this.api = new alphaTab.AlphaTabApi(canvas, settings);
        this.unsubError = this.api.error.on(e => {
            console.error('alphaTab error', e);
        });

        this.overlay = mount(this.root, '.cmp-overlay', new LoadingOverlay(this.api));
        this.sidebar = mount(this.root, '.cmp-sidebar', new Sidebar(this.api));
        this.footer = mount(
            this.root,
            '.cmp-footer',
            new Footer(this.api, { trackList: this.sidebar.trackList })
        );
        this.selectionHandles = mount(
            this.root,
            '.cmp-selection-handles',
            new SelectionHandles(this.api, viewport)
        );
        this.crosshair = new Crosshair();
        this.dragDrop = new DragDrop(this.api, {
            onEnter: () => this.overlay.enterDrag(),
            onLeave: () => this.overlay.leaveDrag()
        });
        this.nav = new NavMenu();
        document.body.appendChild(this.nav.root);

        // expose for fiddling in dev tools
        if (typeof window !== 'undefined') {
            window.api = this.api;
            window.alphaTab = alphaTab;
        }
    }

    dispose(): void {
        this.unsubError();
        this.nav.dispose();
        this.dragDrop.dispose();
        this.crosshair.dispose();
        this.selectionHandles.dispose();
        this.footer.dispose();
        this.sidebar.dispose();
        this.overlay.dispose();
        this.api.destroy();
        this.root.remove();
    }
}
