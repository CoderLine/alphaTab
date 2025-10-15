/**
 * A polyfill of the InsersectionObserver
 * @target web
 * @internal
 */
export class IntersectionObserverPolyfill {
    private _callback: IntersectionObserverCallback;
    private _elements: HTMLElement[] = [];
    private _timer: any = null;

    public constructor(callback: IntersectionObserverCallback) {
        this._callback = callback;

        window.addEventListener('resize', () => this._check, true);
        document.addEventListener('scroll', () => this._check, true);
    }

    private _check() {
        if (!this._timer) {
            this._timer = setTimeout(() => {
                this._doCheck();
                this._timer = null;
            }, 100);
        }
    }

    public observe(target: HTMLElement) {
        if (this._elements.indexOf(target) >= 0) {
            return;
        }
        this._elements.push(target);
        this._check();
    }

    public unobserve(target: HTMLElement) {
        this._elements = this._elements.filter(item => {
            return item !== target;
        });
    }

    private _doCheck() {
        const entries: IntersectionObserverEntry[] = [];
        for (const element of this._elements) {
            const rect = element.getBoundingClientRect();
            const isVisible =
                rect.top + rect.height >= 0 &&
                rect.top <= window.innerHeight &&
                rect.left + rect.width >= 0 &&
                rect.left <= window.innerWidth;

            if (isVisible) {
                entries.push({
                    target: element,
                    isIntersecting: true
                } as any);
            }
        }

        if (entries.length) {
            this._callback(entries, this as any);
        }
    }
}
