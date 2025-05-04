/**
 * A polyfill of the InsersectionObserver
 * @target web
 */
export class IntersectionObserverPolyfill {
    private _callback: IntersectionObserverCallback;
    private _elements: HTMLElement[] = [];

    public constructor(callback: IntersectionObserverCallback) {
        let timer: any = null;
        const oldCheck = this.check.bind(this);
        this.check = () => {
            if (!timer) {
                timer = setTimeout(() => {
                    oldCheck();
                    timer = null;
                }, 100);
            }
        };

        this._callback = callback;

        window.addEventListener('resize', this.check, true);
        document.addEventListener('scroll', this.check, true);
    }

    public observe(target: HTMLElement) {
        if (this._elements.indexOf(target) >= 0) {
            return;
        }
        this._elements.push(target);
        this.check();
    }

    public unobserve(target: HTMLElement) {
        this._elements = this._elements.filter(item => {
            return item !== target;
        });
    }

    private check() {
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
