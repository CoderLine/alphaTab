import { type Mountable, css, html, injectStyles, parseHtml } from '../../util/Dom';

injectStyles(
    'Slider',
    css`
    .at-slider {
        appearance: none;
        background: #d3d3d3;
        outline: none;
        opacity: 0.7;
        transition: opacity 0.2s;
        height: 5px;
        margin: 0;
    }
    .at-slider:hover { opacity: 1; }
    .at-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--at-accent);
        cursor: pointer;
        border: 0;
    }
    .at-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--at-accent);
        cursor: pointer;
        border: 0;
    }
`
);

export interface SliderProps {
    min?: number;
    max?: number;
    step?: number;
    initialValue?: number;
}

export class Slider implements Mountable {
    readonly root: HTMLInputElement;

    onInput: ((value: number) => void) | null = null;

    constructor(props: SliderProps = {}) {
        const min = props.min ?? 0;
        const max = props.max ?? 100;
        const step = props.step ?? 1;
        const value = props.initialValue ?? min;
        this.root = parseHtml(html`
            <input type="range" class="at-slider" min="${min}" max="${max}" step="${step}" value="${value}" />
        `) as HTMLInputElement;
        this.root.addEventListener('input', () => {
            this.onInput?.(this.root.valueAsNumber);
        });
        this.root.addEventListener('click', e => e.stopPropagation());
    }

    getValue(): number {
        return this.root.valueAsNumber;
    }

    setValue(value: number): void {
        this.root.valueAsNumber = value;
    }

    dispose(): void {
        this.root.remove();
    }
}
