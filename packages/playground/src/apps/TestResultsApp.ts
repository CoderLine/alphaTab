import { ByteBuffer } from '@coderline/alphatab/io/ByteBuffer';
import { ZipReader } from '@coderline/alphatab/zip/ZipReader';
import { NavMenu } from '../components/NavMenu';
import { type Mountable, css, html, injectStyles, parseHtml } from '../util/Dom';

injectStyles(
    'TestResultsApp',
    css`
    body {
        justify-content: flex-start;
    }
    body > * {
        overflow: visible;
    }
    .at-test-results {
        padding: 1rem;
        font-family: 'Noto Sans', sans-serif;
        min-height: 100vh;
        max-width: 90vw;
    }
    .at-test-results > h1 { margin-top: 0; }
    .at-test-results-toolbar { margin: 1rem 0; }
    .at-test-results-list .at-test-card {
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        margin: 1rem 0;
        padding: 12px;
    }
    .at-test-results-list .at-test-card.accepted { border-color: green; }
    .at-test-results-list .at-test-card-title {
        font-weight: 500;
        font-size: 1rem;
        margin: 0 0 8px 0;
    }
    .at-test-comparer { position: relative; }
    .at-test-comparer .slider-handle {
        position: absolute;
        bottom: 0;
        width: 40px;
        transform: translateX(-50%);
        cursor: ew-resize;
        z-index: 10;
        touch-action: none;
        user-select: none;
    }
    .at-test-comparer .slider-handle::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 2px;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25), 0 0 4px rgba(0, 0, 0, 0.15);
        pointer-events: none;
    }
    .at-test-comparer .slider-handle::after {
        content: '';
        position: sticky;
        top: calc(50vh - 20px);
        display: block;
        width: 40px;
        height: 40px;
        margin-top: var(--knob-margin-top, 0);
        background-color: #fff;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 18L3 12l6-6M15 6l6 6-6 6' fill='none' stroke='%23555' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 22px;
        border-radius: 50%;
        border: 1.5px solid rgba(0, 0, 0, 0.15);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06);
        pointer-events: none;
    }
    .at-test-comparer .slider-handle:hover::after {
        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.35), 0 0 0 1.5px rgba(0, 0, 0, 0.12);
    }
    .at-test-comparer .expected,
    .at-test-comparer .actual,
    .at-test-comparer .diff {
        background: #fff;
        border: 1px solid red;
        position: absolute;
    }
    .at-test-comparer .expected { left: 0; }
    .at-test-comparer .actual {
        right: -2px;
        box-shadow: -7px 0 10px -5px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        border-left: 0;
    }
    .at-test-comparer .actual img {
        position: absolute;
        right: 0;
        top: 0;
        border-left: 1px solid red;
    }
    .at-test-comparer .diff {
        display: none;
        left: 0;
    }
    .at-test-card.accepted .diff,
    .at-test-card.accepted .expected,
    .at-test-card.accepted .actual { border-color: green; }
    body.hide-accepted .at-test-card.accepted { display: none; }

    .at-test-controls {
        position: sticky;
        top: 0;
        z-index: 20;
        background: #fff;
        padding: 6px 0;
        display: flex;
        gap: 12px;
        align-items: center;
    }
    .at-test-controls .btn {
        padding: 4px 10px;
        background: #6c757d;
        border: 0;
        color: #fff;
        font: inherit;
        cursor: pointer;
        border-radius: 4px;
    }
    .at-test-controls .btn[disabled] { opacity: 0.5; cursor: default; }

    .drop-area {
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease-in-out;
    }
    body.drop .drop-area { opacity: 1; }
    .drop-message {
        width: 200px;
        height: 200px;
        font-weight: bold;
        border: 5px dashed #426d9d;
        color: #426d9d;
        display: flex;
        text-align: center;
        border-radius: 10px;
        justify-content: center;
        align-items: center;
        padding: 1rem;
    }
    .at-test-no-failures {
        padding: 12px;
        background: #d1e7dd;
        color: #0f5132;
        border-radius: 4px;
    }
`
);

interface TestResult {
    originalFile: string;
    newFile: string | Uint8Array;
    diffFile: string | Uint8Array;
    accepted?: true;
}

export class TestResultsApp implements Mountable {
    readonly root: HTMLElement;
    private listEl: HTMLElement;
    private remainingEl: HTMLElement;
    private currentResults: TestResult[] = [];
    private nav: NavMenu;

    private onDragOver = (e: DragEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'link';
        }
    };
    private onDragEnter = () => document.body.classList.add('drop');
    private onDragLeave = () => document.body.classList.remove('drop');
    private onDrop = (e: DragEvent) => this.handleDrop(e);

    constructor() {
        this.root = parseHtml(html`
            <div class="at-test-results">
                <h1>alphaTab — Visual Test Results <span class="at-test-remaining"></span></h1>
                <p>
                    This page shows failing visual tests for review and acceptance.
                    Run <code>npm run test</code> to populate results, or drop a results zip onto the page.
                </p>
                <div class="at-test-results-toolbar">
                    <label>
                        <input type="checkbox" class="at-test-hide-accepted" />
                        Hide accepted
                    </label>
                </div>
                <div class="at-test-results-list"></div>
                <div class="drop-area"><div class="drop-message">Drop test-results zip here</div></div>
            </div>
        `);
        this.listEl = this.root.querySelector('.at-test-results-list')!;
        this.remainingEl = this.root.querySelector('.at-test-remaining')!;

        this.root.querySelector<HTMLInputElement>('.at-test-hide-accepted')!.onchange = e => {
            document.body.classList.toggle('hide-accepted', (e.target as HTMLInputElement).checked);
        };

        document.body.addEventListener('dragover', this.onDragOver, false);
        document.body.addEventListener('dragenter', this.onDragEnter, true);
        document.body.addEventListener('dragleave', this.onDragLeave);
        document.body.addEventListener('drop', this.onDrop, true);

        this.nav = new NavMenu();
        document.body.appendChild(this.nav.root);

        this.loadFromServer();
    }

    private async loadFromServer(): Promise<void> {
        try {
            const res = await fetch('/test-results/list');
            const list = (await res.json()) as TestResult[];
            this.displayResults(list);
        } catch {
            alert('error loading test results');
        }
    }

    private updateRemaining(): void {
        if (this.currentResults.length === 0) {
            this.remainingEl.textContent = '';
            return;
        }
        const remaining = this.currentResults.filter(r => !r.accepted).length;
        this.remainingEl.textContent = `(${remaining}/${this.currentResults.length})`;
    }

    private async displayResults(results: TestResult[]): Promise<void> {
        this.listEl.replaceChildren();
        this.currentResults = results;
        if (results.length === 0) {
            const banner = parseHtml(html`<div class="at-test-no-failures">No reported errors on visual tests.</div>`);
            this.listEl.appendChild(banner);
            this.updateRemaining();
            return;
        }
        for (const result of results) {
            this.listEl.appendChild(await this.createResultCard(result));
        }
        this.updateRemaining();
    }

    private async createResultCard(result: TestResult): Promise<HTMLElement> {
        const card = parseHtml(html`
            <div class="at-test-card">
                <h5 class="at-test-card-title">${result.originalFile}</h5>
                <div class="at-test-controls">
                    <label><input type="checkbox" class="diff-toggle" /> Show Diff</label>
                    <button type="button" class="btn accept">Accept</button>
                </div>
                <div class="at-test-comparer">
                    <div class="expected"><img alt="expected" /></div>
                    <div class="actual"><img alt="actual" /></div>
                    <div class="diff"><img alt="diff" /></div>
                    <div class="slider-handle"></div>
                </div>
            </div>
        `);
        const comparer = card.querySelector<HTMLElement>('.at-test-comparer')!;
        const ex = comparer.querySelector<HTMLElement>('.expected')!;
        const ac = comparer.querySelector<HTMLElement>('.actual')!;
        const df = comparer.querySelector<HTMLElement>('.diff')!;
        const handle = comparer.querySelector<HTMLElement>('.slider-handle')!;
        const exImg = ex.querySelector<HTMLImageElement>('img')!;
        const acImg = ac.querySelector<HTMLImageElement>('img')!;
        const dfImg = df.querySelector<HTMLImageElement>('img')!;

        await Promise.allSettled([
            loadImage(exImg, result.originalFile),
            loadImage(acImg, result.newFile),
            loadImage(dfImg, result.diffFile)
        ]);

        const width = Math.max(exImg.width, acImg.width);
        const height = Math.max(exImg.height, acImg.height);
        comparer.style.width = `${width}px`;
        comparer.style.height = `${height}px`;
        ex.style.width = `${width}px`;
        ex.style.height = `${height}px`;
        ac.style.width = `${width / 2}px`;
        ac.style.height = `${height}px`;
        df.style.width = `${width}px`;
        df.style.height = `${height}px`;

        handle.style.left = `${width / 2}px`;
        handle.style.setProperty('--knob-margin-top', `${height / 2 - 20}px`);

        handle.addEventListener('pointerdown', e => {
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
        });
        handle.addEventListener('pointermove', e => {
            if (!e.buttons) { return; }
            const rect = comparer.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, width));
            handle.style.left = `${x}px`;
            ac.style.width = `${width - x}px`;
        });
        card.querySelector<HTMLInputElement>('.diff-toggle')!.onchange = e => {
            df.style.display = (e.target as HTMLInputElement).checked ? 'block' : 'none';
        };
        const acceptBtn = card.querySelector<HTMLButtonElement>('.accept')!;
        acceptBtn.onclick = async () => {
            acceptBtn.disabled = true;
            acceptBtn.textContent = 'Accepting...';
            try {
                const res = await fetch('/test-results/accept', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(result)
                });
                const body = await res.json();
                acceptBtn.textContent = body.message ?? 'Accepted';
                card.classList.add('accepted');
                result.accepted = true;
                this.updateRemaining();
            } catch {
                alert('error accepting test result');
                acceptBtn.disabled = false;
                acceptBtn.textContent = 'Accept';
            }
        };
        return card;
    }

    private handleDrop(e: DragEvent): void {
        e.stopPropagation();
        e.preventDefault();
        document.body.classList.remove('drop');
        const files = e.dataTransfer?.files;
        if (!files || files.length !== 1) {
            return;
        }
        const reader = new FileReader();
        reader.onload = data => {
            const buffer = data.target?.result;
            if (!(buffer instanceof ArrayBuffer)) {
                return;
            }
            const zip = new ZipReader(ByteBuffer.fromBuffer(new Uint8Array(buffer)));
            const entries = zip.read();
            const grouped = new Map<string, TestResult>();
            for (const entry of entries) {
                if (entry.data.length === 0) {
                    continue;
                }
                const path = entry.fullName.startsWith('test-data/') ? entry.fullName : `test-data/${entry.fullName}`;
                const key = `${path.replace('.diff.png', '').replace('.new.png', '')}.png`;
                let result = grouped.get(key);
                if (!result) {
                    result = { originalFile: key, newFile: '', diffFile: '' };
                    grouped.set(key, result);
                }
                if (entry.fullName.endsWith('.diff.png')) {
                    result.diffFile = entry.data;
                } else if (entry.fullName.endsWith('.new.png')) {
                    result.newFile = entry.data;
                }
            }
            this.displayResults(Array.from(grouped.values()));
        };
        reader.readAsArrayBuffer(files[0]);
    }

    dispose(): void {
        document.body.removeEventListener('dragover', this.onDragOver, false);
        document.body.removeEventListener('dragenter', this.onDragEnter, true);
        document.body.removeEventListener('dragleave', this.onDragLeave);
        document.body.removeEventListener('drop', this.onDrop, true);
        this.nav.dispose();
        this.root.remove();
    }
}

function loadImage(img: HTMLImageElement, source: string | Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        if (source instanceof Uint8Array) {
            img.src = URL.createObjectURL(new Blob([source.buffer as ArrayBuffer], { type: 'image/png' }));
        } else if (typeof source === 'string' && source.length > 0) {
            img.src = `/${source}`;
        } else {
            reject();
        }
    });
}
