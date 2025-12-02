/**
 * A very basic polyfill of the ResizeObserver which triggers
 * a the callback on window resize for all registered targets.
 * @target web
 * @internal
 */
export class ResizeObserverPolyfill {
    private _callback: ResizeObserverCallback;
    private _targets = new Set<Element>();

    public constructor(callback: ResizeObserverCallback) {
        this._callback = callback;
        window.addEventListener('resize', this._onWindowResize.bind(this), false);
    }

    public observe(target: Element) {
        this._targets.add(target);
    }

    public unobserve(target: Element) {
        this._targets.delete(target);
    }

    public disconnect() {
        this._targets.clear();
    }

    private _onWindowResize() {
        const entries: ResizeObserverEntry[] = [];
        for (const t of this._targets) {
            entries.push({
                target: t,
                // not used by alphaTab
                contentRect: undefined!,
                borderBoxSize: undefined!,
                contentBoxSize: [],
                devicePixelContentBoxSize: []
            });
        }
        this._callback(entries, this);
    }
}
