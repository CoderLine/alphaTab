import { css, injectStyles } from '../util/Dom';

injectStyles(
    'Crosshair',
    css`
    .at-crosshair {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 20000;
    }
    .at-crosshair-x,
    .at-crosshair-y {
        position: absolute;
        pointer-events: none;
    }
    .at-crosshair-y {
        width: 100vw;
        border-bottom: 1px dotted #000;
        height: 1px;
        left: 0;
    }
    .at-crosshair-x {
        height: 100vh;
        border-left: 1px dotted #000;
        width: 1px;
        top: 0;
    }
`
);

/**
 * Behaviour-only debug helper: while CapsLock is on, draws a full-viewport crosshair
 * that follows the mouse. No DOM until activated; cleaned up when CapsLock turns off.
 */
export class Crosshair {
    private root: HTMLElement | null = null;
    private xLine: HTMLElement | null = null;
    private yLine: HTMLElement | null = null;
    private active = false;

    private onKeyDown = (e: KeyboardEvent) => {
        const should = e.getModifierState('CapsLock');
        if (should !== this.active) {
            if (should) {
                this.show();
            } else {
                this.hide();
            }
        }
    };

    private onMouseMove = (e: MouseEvent) => {
        if (this.xLine) {
            this.xLine.style.left = `${e.pageX}px`;
        }
        if (this.yLine) {
            this.yLine.style.top = `${e.pageY}px`;
        }
    };

    constructor() {
        document.addEventListener('keydown', this.onKeyDown);
    }

    private show(): void {
        this.active = true;
        this.root = document.createElement('div');
        this.root.className = 'at-crosshair';
        this.xLine = document.createElement('div');
        this.xLine.className = 'at-crosshair-x';
        this.yLine = document.createElement('div');
        this.yLine.className = 'at-crosshair-y';
        this.root.appendChild(this.xLine);
        this.root.appendChild(this.yLine);
        document.body.appendChild(this.root);
        document.addEventListener('mousemove', this.onMouseMove, true);
    }

    private hide(): void {
        this.active = false;
        document.removeEventListener('mousemove', this.onMouseMove, true);
        this.root?.remove();
        this.root = null;
        this.xLine = null;
        this.yLine = null;
    }

    dispose(): void {
        document.removeEventListener('keydown', this.onKeyDown);
        this.hide();
    }
}
