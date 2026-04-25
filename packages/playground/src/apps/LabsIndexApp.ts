import { NavMenu } from '../components/NavMenu';
import { DEMOS } from '../util/Demos';
import { type Mountable, css, html, injectStyles, parseHtml } from '../util/Dom';

injectStyles(
    'LabsIndexApp',
    css`
    .at-labs {
        max-width: 980px;
        margin: 0 auto;
        padding: 32px 24px;
    }
    .at-labs h1 {
        margin-top: 0;
        font-family: 'Noto Serif', serif;
    }
    .at-labs > p { color: #444; }
    .at-labs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        margin-top: 24px;
    }
    .at-labs-card {
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 6px;
        padding: 18px 20px;
        background: #fff;
        text-decoration: none;
        color: inherit;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    .at-labs-card:hover {
        border-color: var(--at-accent);
        box-shadow: 0 4px 14px rgba(73, 114, 161, 0.18);
    }
    .at-labs-card-title {
        font-weight: 500;
        margin: 0 0 8px 0;
        font-size: 1.05rem;
    }
    .at-labs-card-description {
        margin: 0;
        color: #555;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    .at-labs-footnote {
        margin-top: 32px;
        font-size: 0.85rem;
        color: #777;
    }
`
);

export class LabsIndexApp implements Mountable {
    readonly root: HTMLElement;
    private nav: NavMenu;

    constructor() {
        this.root = parseHtml(html`
            <div class="at-labs">
                <h1>alphaTab Playground</h1>
                <p>Development demos exercising specific capabilities of alphaTab. Pick one to start.</p>
                <div class="at-labs-grid"></div>
                <p class="at-labs-footnote">
                    Editing alphaTab source under <code>packages/alphatab/src/</code> hot-reloads via Vite's workspace alias.
                </p>
            </div>
        `);
        const grid = this.root.querySelector<HTMLElement>('.at-labs-grid')!;
        for (const demo of DEMOS) {
            const card = parseHtml(html`
                <a class="at-labs-card" href="${demo.href}">
                    <h3 class="at-labs-card-title">${demo.title}</h3>
                    <p class="at-labs-card-description">${demo.description}</p>
                </a>
            `);
            grid.appendChild(card);
        }

        this.nav = new NavMenu();
        document.body.appendChild(this.nav.root);
    }

    dispose(): void {
        this.nav.dispose();
        this.root.remove();
    }
}
