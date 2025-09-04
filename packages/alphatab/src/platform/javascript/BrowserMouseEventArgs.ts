import type { IContainer } from '@src/platform/IContainer';
import type { IMouseEventArgs } from '@src/platform/IMouseEventArgs';
import type { HtmlElementContainer } from '@src/platform/javascript/HtmlElementContainer';

/**
 * @target web
 */
export class BrowserMouseEventArgs implements IMouseEventArgs {
    public readonly mouseEvent: MouseEvent;

    public get isLeftMouseButton(): boolean {
        return this.mouseEvent.button === 0;
    }

    public getX(relativeTo: IContainer): number {
        const relativeToElement: HTMLElement = (relativeTo as HtmlElementContainer).element;
        const bounds: DOMRect = relativeToElement.getBoundingClientRect();
        const left: number = bounds.left + relativeToElement.ownerDocument!.defaultView!.pageXOffset;
        return this.mouseEvent.pageX - left;
    }

    public getY(relativeTo: IContainer): number {
        const relativeToElement: HTMLElement = (relativeTo as HtmlElementContainer).element;
        const bounds: DOMRect = relativeToElement.getBoundingClientRect();
        const top: number = bounds.top + relativeToElement.ownerDocument!.defaultView!.pageYOffset;
        return this.mouseEvent.pageY - top;
    }

    public preventDefault(): void {
        this.mouseEvent.preventDefault();
    }

    public constructor(e: MouseEvent) {
        this.mouseEvent = e;
    }
}
