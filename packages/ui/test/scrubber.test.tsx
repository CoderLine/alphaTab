import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Scrubber, type ScrubberProps } from '../src/player/controls/scrubber';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let width = 0;
const observers: (() => void)[] = [];

class FakeResizeObserver {
    public constructor(private readonly callback: () => void) {}
    public observe() {
        observers.push(this.callback);
    }
    public disconnect() {
        observers.splice(observers.indexOf(this.callback), 1);
    }
}

let root: Root | null = null;
let host: HTMLDivElement;

beforeEach(() => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
        () => ({ left: 0, top: 0, width, height: 38, right: width, bottom: 38, x: 0, y: 0 }) as DOMRect
    );
    host = document.createElement('div');
});

afterEach(() => {
    act(() => root?.unmount());
    root = null;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function mount(atWidth: number, props: ScrubberProps): SVGSVGElement {
    width = atWidth;
    root = createRoot(host);
    act(() => root!.render(<Scrubber {...props} />));
    return host.querySelector('svg')!;
}

function resize(toWidth: number) {
    width = toWidth;
    act(() => {
        for (const o of [...observers]) {
            o();
        }
    });
}

const barLabels = (svg: SVGSVGElement) => [...svg.querySelectorAll(':scope > text')].map(t => t.textContent);
const tickCount = (svg: SVGSVGElement) =>
    [...svg.querySelectorAll(':scope > line')].filter(l => l.getAttribute('stroke') === 'var(--at-muted)').length;
const tempoLabels = (svg: SVGSVGElement) =>
    [...svg.querySelectorAll(':scope > g > g')].map(g => ({
        transform: g.getAttribute('transform'),
        text: g.textContent
    }));

describe('Scrubber', () => {
    it('draws at its rendered width without stretching', () => {
        const svg = mount(1234, { totalBars: 64, currentBar: 16 });
        expect(svg.getAttribute('viewBox')).toBe('0 0 1234 38');
        const knob = svg.querySelector('circle')!;
        expect(knob.getAttribute('cx')).toBe(String(1234 / 4));
        expect(knob.getAttribute('r')).toBe('5');

        resize(3000);
        expect(svg.getAttribute('viewBox')).toBe('0 0 3000 38');
    });

    it('labels bars one-based at the start of the bar', () => {
        // 600px over 64 bars: 9.375px per bar, a label every 8 bars keeps them 75px apart.
        const svg = mount(600, { totalBars: 64 });
        expect(barLabels(svg)).toEqual(['1', '9', '17', '25', '33', '41', '49', '57']);
        const nine = svg.querySelectorAll(':scope > text')[1];
        expect(nine.getAttribute('x')).toBe(String((8 / 64) * 600));
    });

    it('adds labels and ticks as the scrubber widens and drops them as it narrows', () => {
        const svg = mount(600, { totalBars: 64 });
        expect(tickCount(svg)).toBe(65);

        // 50px per bar: room for a label on every bar.
        resize(3200);
        expect(barLabels(svg)).toEqual(Array.from({ length: 64 }, (_, i) => String(i + 1)));
        expect(tickCount(svg)).toBe(65);

        resize(200);
        expect(barLabels(svg)).toEqual(['1', '17', '33', '49']);
        // 3.125px per bar: a tick every second bar.
        expect(tickCount(svg)).toBe(33);
    });

    it('keeps ticks apart on long songs', () => {
        // 0.6px per bar: a tick every 8 bars, a label every 128.
        const svg = mount(600, { totalBars: 1000 });
        expect(tickCount(svg)).toBe(126);
        expect(barLabels(svg)).toEqual(['1', '129', '257', '385', '513', '641', '769', '897']);
    });

    it('keeps the bar labels at the ends inside the scrubber', () => {
        const half = (digits: number) => (digits * 8 * 0.6) / 2;
        const svg = mount(3200, { totalBars: 64 });
        const labels = svg.querySelectorAll(':scope > text');
        expect(Number(labels[0].getAttribute('x'))).toBeCloseTo(half(1));
        expect(Number(labels[63].getAttribute('x'))).toBeCloseTo((63 / 64) * 3200);

        // Bar 65 starts at 88.6px of 90px; its label is pulled in to end at the right edge.
        resize(90);
        act(() => root!.render(<Scrubber totalBars={65} />));
        expect(barLabels(svg)).toEqual(['1', '65']);
        expect(Number(svg.querySelectorAll(':scope > text')[1].getAttribute('x'))).toBeCloseTo(90 - half(2));
    });

    it('places tempo labels left of a marker near the end and drops colliding ones', () => {
        const tempoMarkers = [
            { atBar: 0, bpm: 120 },
            { atBar: 1, bpm: 90 },
            { atBar: 32, bpm: 140 },
            { atBar: 63, bpm: 100 }
        ];
        const svg = mount(640, { totalBars: 64, tempoMarkers });
        // "= 100" is 6px + 5 × 4.8px wide; right of bar 63 at 630px it would end beyond 640px.
        expect(tempoLabels(svg)).toEqual([
            { transform: 'translate(4, 8)', text: '♪= 120' },
            { transform: 'translate(324, 8)', text: '♪= 140' },
            { transform: 'translate(596, 8)', text: '♪= 100' }
        ]);

        resize(6400);
        expect(tempoLabels(svg).map(t => t.text)).toEqual(['♪= 120', '♪= 90', '♪= 140', '♪= 100']);
    });

    it('hides tempo markers when compact', () => {
        const svg = mount(400, { totalBars: 64, compact: true, tempoMarkers: [{ atBar: 0, bpm: 120 }] });
        expect(svg.getAttribute('viewBox')).toBe('0 0 400 22');
        expect(tempoLabels(svg)).toEqual([]);
    });
});
