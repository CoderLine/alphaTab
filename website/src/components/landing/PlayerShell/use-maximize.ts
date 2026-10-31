import React from 'react';

const DURATION_MS = 420;
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

interface Box {
    top: number;
    left: number;
    width: number;
    height: number;
    padding: string;
}

function measure(el: HTMLElement): Box {
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height, padding: getComputedStyle(el).padding };
}

function keyframe(b: Box): Keyframe {
    return { top: `${b.top}px`, left: `${b.left}px`, width: `${b.width}px`, height: `${b.height}px`, padding: b.padding };
}

function animationDuration(): number {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DURATION_MS;
}

// alphaTab re-lays out the score on every container width change, so the canvas width is
// pinned while the stage geometry animates and alphaTab only sees the start and end widths.
function freezeWidth(el: HTMLElement | null, width: number) {
    if (!el) { return; }
    el.style.width = `${width}px`;
}

function unfreezeWidth(el: HTMLElement | null) {
    if (!el) { return; }
    el.style.width = '';
}

function lockPageScroll(): () => void {
    const html = document.documentElement;
    const { overflow, scrollbarGutter } = html.style;
    html.style.overflow = 'hidden';
    html.style.scrollbarGutter = 'stable';
    return () => {
        html.style.overflow = overflow;
        html.style.scrollbarGutter = scrollbarGutter;
    };
}

export interface MaximizeOptions {
    /** Stays in the page flow and keeps the stage's height while the stage is maximized. */
    slotRef: React.RefObject<HTMLElement | null>;
    /** Becomes a fixed full-viewport layer when `isMaximized` is true. */
    stageRef: React.RefObject<HTMLElement | null>;
    /** The alphaTab scroll container inside the stage. */
    getCanvas: () => HTMLElement | null;
}

export interface Maximize {
    isMaximized: boolean;
    toggle: () => void;
    collapse: () => void;
}

/**
 * Animates the stage between its in-page box and the full viewport.
 * The caller applies its maximized styling whenever `isMaximized` is true.
 */
export function useMaximize({ slotRef, stageRef, getCanvas }: MaximizeOptions): Maximize {
    const [isMaximized, setIsMaximized] = React.useState(false);
    const animationRef = React.useRef<Animation | null>(null);
    const expandFromRef = React.useRef<Box | null>(null);
    const inPageCanvasWidthRef = React.useRef(0);
    const unlockScrollRef = React.useRef<(() => void) | null>(null);
    const getCanvasRef = React.useRef(getCanvas);
    getCanvasRef.current = getCanvas;

    const expand = React.useCallback(() => {
        const stage = stageRef.current;
        const slot = slotRef.current;
        if (!stage || !slot || animationRef.current || isMaximized) { return; }
        const from = measure(stage);
        slot.style.height = `${from.height}px`;
        inPageCanvasWidthRef.current = getCanvasRef.current()?.offsetWidth ?? 0;
        expandFromRef.current = from;
        unlockScrollRef.current = lockPageScroll();
        setIsMaximized(true);
    }, [isMaximized, slotRef, stageRef]);

    const collapse = React.useCallback(() => {
        const stage = stageRef.current;
        const slot = slotRef.current;
        if (!stage || !slot || animationRef.current || !isMaximized) { return; }
        const from = measure(stage);
        const to = measure(slot);
        freezeWidth(getCanvasRef.current(), inPageCanvasWidthRef.current);
        const animation = stage.animate([keyframe(from), keyframe(to)], {
            duration: animationDuration(),
            easing: EASING,
            fill: 'forwards',
        });
        animation.onfinish = () => setIsMaximized(false);
        animationRef.current = animation;
    }, [isMaximized, slotRef, stageRef]);

    React.useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) { return; }

        if (isMaximized) {
            const from = expandFromRef.current;
            if (!from) { return; }
            expandFromRef.current = null;
            const to = measure(stage);
            const canvas = getCanvasRef.current();
            freezeWidth(canvas, canvas?.offsetWidth ?? 0);
            const animation = stage.animate([keyframe(from), keyframe(to)], {
                duration: animationDuration(),
                easing: EASING,
            });
            animation.onfinish = () => {
                unfreezeWidth(canvas);
                animationRef.current = null;
            };
            animationRef.current = animation;
        } else if (animationRef.current) {
            animationRef.current.cancel();
            animationRef.current = null;
            unfreezeWidth(getCanvasRef.current());
            if (slotRef.current) { slotRef.current.style.height = ''; }
            unlockScrollRef.current?.();
            unlockScrollRef.current = null;
        }
    }, [isMaximized, slotRef, stageRef]);

    React.useEffect(() => () => unlockScrollRef.current?.(), []);

    const toggle = isMaximized ? collapse : expand;
    return { isMaximized, toggle, collapse };
}
