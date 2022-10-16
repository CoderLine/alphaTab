import { HtmlElementContainer } from './HtmlElementContainer';

/**
 * An IContainer implementation which can be used for cursors and select ranges
 * where browser scaling is relevant.
 *
 * The problem is that with having 1x1 pixel elements which are sized then to the actual size with a
 * scale transform this cannot be combined properly with a browser zoom.
 *
 * The browser will apply first the browser zoom to the 1x1px element and then apply the scale leaving it always
 * at full scale instead of a 50% browser zoom.
 *
 * This is solved in this container by scaling the element first up to a higher degree (as specified)
 * so that the browser can do a scaling according to typical zoom levels and then the scaling will work.
 * @target web
 */
export class ScalableHtmlElementContainer extends HtmlElementContainer {
    private _xscale: number;
    private _yscale: number;

    public constructor(element: HTMLElement, xscale: number, yscale: number) {
        super(element);
        this._xscale = xscale;
        this._yscale = yscale;
    }

    public override get width(): number {
        return this.element.offsetWidth / this._xscale;
    }

    public override set width(value: number) {
        this.element.style.width = value * this._xscale + 'px';
    }

    public override get height(): number {
        return this.element.offsetHeight / this._yscale;
    }

    public override set height(value: number) {
        if (value >= 0) {
            this.element.style.height = value * this._yscale + 'px';
        } else {
            this.element.style.height = '100%';
        }
    }

    public override setBounds(x: number, y: number, w: number, h: number) {
        if (isNaN(x)) {
            x = this.lastBounds.x;
        }
        if (isNaN(y)) {
            y = this.lastBounds.y;
        }
        if (isNaN(w)) {
            w = this.lastBounds.w;
        } else {
            w = w / this._xscale;
        }
        if (isNaN(h)) {
            h = this.lastBounds.h;
        } else {
            h = h / this._yscale;
        }

        this.element.style.transform = `translate(${x}px, ${y}px) scale(${w}, ${h})`;
        this.element.style.transformOrigin = 'top left';
        this.lastBounds.x = x;
        this.lastBounds.y = y;
        this.lastBounds.w = w;
        this.lastBounds.h = h;
    }
}
