import * as alphaTab from '@coderline/alphatab';
import { Footer } from '../components/Footer';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { NavMenu } from '../components/NavMenu';
import { Sidebar } from '../components/Sidebar';
import { YoutubeSync } from '../components/youtube-sync/YoutubeSync';
import { type Mountable, css, html, injectStyles, mount, parseHtml } from '../util/Dom';
import { Paths } from '../util/Paths';

injectStyles(
    'YoutubeSyncApp',
    css`
    .at-yt-app {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
    }
    .at-yt-app > .cmp-yt {
        flex: 0 0 auto;
    }
    .at-yt-app > .at-wrap-yt {
        position: relative;
        flex: 1 1 auto;
        margin: 0;
        background: #fff;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .at-yt-app > .at-wrap-yt > .at-content {
        flex: 1 1 auto;
        overflow: hidden;
        position: relative;
    }
    .at-yt-app .at-viewport {
        overflow-y: auto;
        position: absolute;
        top: 0;
        left: 70px;
        right: 0;
        bottom: 0;
        padding-right: 20px;
    }
`
);

export interface YoutubeSyncAppOptions {
    videoId?: string;
    file?: string;
}

export class YoutubeSyncApp implements Mountable {
    readonly root: HTMLElement;
    readonly api: alphaTab.AlphaTabApi;
    private nav: NavMenu;
    private overlay: LoadingOverlay;
    private sidebar: Sidebar;
    private footer: Footer;
    private youtube: YoutubeSync;
    private subscriptions: (() => void)[] = [];

    constructor(options: YoutubeSyncAppOptions = {}) {
        this.root = parseHtml(html`
            <div class="at-yt-app">
                <div class="cmp-yt"></div>
                <div class="at-wrap at-wrap-yt">
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
        `);

        const viewport = this.root.querySelector<HTMLElement>('.at-viewport')!;
        const canvas = this.root.querySelector<HTMLElement>('.at-canvas')!;

        const settings = new alphaTab.Settings();
        settings.fillFromJson({
            core: {
                file: options.file ?? '/test-data/guitarpro8/canon-audio-track.gp',
                fontDirectory: Paths.fontDirectory
            },
            player: {
                playerMode: alphaTab.PlayerMode.EnabledExternalMedia,
                soundFont: Paths.soundFont,
                scrollOffsetX: -10,
                scrollOffsetY: -20,
                scrollElement: viewport
            }
        } satisfies alphaTab.json.SettingsJson);

        this.api = new alphaTab.AlphaTabApi(canvas, settings);
        this.subscriptions.push(this.api.error.on(e => console.error('alphaTab error', e)));

        this.overlay = mount(this.root, '.cmp-overlay', new LoadingOverlay(this.api));
        this.sidebar = mount(this.root, '.cmp-sidebar', new Sidebar(this.api));
        this.footer = mount(
            this.root,
            '.cmp-footer',
            new Footer(this.api, { trackList: this.sidebar.trackList })
        );
        this.youtube = mount(
            this.root,
            '.cmp-yt',
            new YoutubeSync(this.api, { videoId: options.videoId ?? 'by8oyJztzwo' })
        );

        this.nav = new NavMenu();
        document.body.appendChild(this.nav.root);

        if (typeof window !== 'undefined') {
            window.api = this.api;
            window.alphaTab = alphaTab;
        }
    }

    dispose(): void {
        for (const u of this.subscriptions) {
            u();
        }
        this.subscriptions = [];
        this.nav.dispose();
        this.youtube.dispose();
        this.footer.dispose();
        this.sidebar.dispose();
        this.overlay.dispose();
        this.api.destroy();
        this.root.remove();
    }
}
