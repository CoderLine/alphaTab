import { ResizeObserverPolyfill } from '@src/platform/javascript/ResizeObserverPolyfill';
import { IntersectionObserverPolyfill } from '@src/platform/javascript/IntersectionObserverPolyfill';

/*@target web*/
(() => {
    if (typeof Symbol.dispose === 'undefined') {
        type Writeable<T> = { -readonly [K in keyof T]: T[K] };
        (Symbol as Writeable<SymbolConstructor>).dispose = Symbol('Symbol.dispose') as (typeof Symbol)['dispose'];
    }

    if (typeof window !== 'undefined') {
        // ResizeObserver API does not yet exist so long on Safari (only start 2020 with iOS Safari 13.7 and Desktop 13.1)
        // so we better add a polyfill for it
        if (!('ResizeObserver' in globalThis)) {
            (globalThis as any).ResizeObserver = ResizeObserverPolyfill;
        }

        // IntersectionObserver API does not on older iOS versions
        // so we better add a polyfill for it
        if (!('IntersectionObserver' in globalThis)) {
            (globalThis as any).IntersectionObserver = IntersectionObserverPolyfill;
        }

        if (!('replaceChildren' in Element.prototype)) {
            (Element.prototype as Element).replaceChildren = function (...nodes: (Node | string)[]) {
                this.innerHTML = '';
                this.append(...nodes);
            };
            (Document.prototype as Document).replaceChildren = (Element.prototype as Element).replaceChildren;
            (DocumentFragment.prototype as DocumentFragment).replaceChildren = (
                Element.prototype as Element
            ).replaceChildren;
        }
    }

    if (!('replaceAll' in String.prototype)) {
        (String.prototype as any).replaceAll = function (str: string, newStr: string) {
            return this.replace(new RegExp(str, 'g'), newStr);
        };
    }
})();
