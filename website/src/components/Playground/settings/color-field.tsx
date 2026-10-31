import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './color-field.module.scss';

interface Rgba {
    r: number;
    g: number;
    b: number;
    /** 0..1 */
    a: number;
}

interface Hsv {
    /** 0..360 */
    h: number;
    /** 0..1 */
    s: number;
    /** 0..1 */
    v: number;
}

const POPOVER_WIDTH = 248;
const POPOVER_GAP = 6;
const VIEWPORT_MARGIN = 8;

function parseCssColor(value: string): Rgba {
    const text = value.trim();
    const fn = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i.exec(text);
    if (fn) { return { r: Number(fn[1]), g: Number(fn[2]), b: Number(fn[3]), a: fn[4] === undefined ? 1 : Number(fn[4]) }; }
    const hex = parseHex(text);
    return hex ?? { r: 0, g: 0, b: 0, a: 1 };
}

/** `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`. */
function parseHex(text: string): Rgba | null {
    let m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text.trim())?.[1];
    if (!m) { return null; }
    if (m.length <= 4) { m = [...m].map((c) => c + c).join(''); }
    const byte = (i: number) => parseInt(m!.slice(i, i + 2), 16);
    return { r: byte(0), g: byte(2), b: byte(4), a: m.length === 8 ? byte(6) / 255 : 1 };
}

function toHex({ r, g, b }: Rgba): string {
    return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

/** The formats alphaTab's `Color.fromJson` accepts. */
function toCssColor(c: Rgba): string {
    if (c.a >= 1) { return toHex(c); }
    return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${Number(c.a.toFixed(2))})`;
}

function rgbToHsv({ r, g, b }: Rgba): Hsv {
    const [rn, gn, bn] = [r / 255, g / 255, b / 255];
    const max = Math.max(rn, gn, bn);
    const d = max - Math.min(rn, gn, bn);
    let h = 0;
    if (d > 0) {
        if (max === rn) { h = ((gn - bn) / d) % 6; }
        else if (max === gn) { h = (bn - rn) / d + 2; }
        else { h = (rn - gn) / d + 4; }
    }
    return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb({ h, s, v }: Hsv, a: number): Rgba {
    const f = (n: number) => {
        const k = (n + h / 60) % 6;
        return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
    };
    return { r: f(5), g: f(3), b: f(1), a };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface ColorFieldProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
}

/** A color swatch with an opacity slider; the swatch opens a picker that stays inside the viewport. */
export const ColorField: React.FC<ColorFieldProps> = ({ value, onChange, label }) => {
    const [open, setOpen] = useState(false);
    const swatchRef = useRef<HTMLButtonElement>(null);
    const color = parseCssColor(value);

    return (
        <div className={styles.field}>
            <button
                ref={swatchRef}
                type="button"
                className={styles.swatch}
                style={{ '--swatch': value } as React.CSSProperties}
                aria-label={`${label} color`}
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            />
            <input
                type="range"
                className={styles.alpha}
                min={0}
                max={100}
                value={Math.round(color.a * 100)}
                aria-label={`${label} opacity`}
                onChange={(e) => onChange(toCssColor({ ...color, a: Number(e.target.value) / 100 }))}
            />
            <span className={styles.alphaValue}>{Math.round(color.a * 100)}%</span>
            {open && (
                <ColorPopover
                    anchor={swatchRef}
                    label={label}
                    value={color}
                    onChange={(c) => onChange(toCssColor(c))}
                    onClose={() => {
                        setOpen(false);
                        swatchRef.current?.focus();
                    }}
                />
            )}
        </div>
    );
};

interface ColorPopoverProps {
    anchor: React.RefObject<HTMLElement | null>;
    label: string;
    value: Rgba;
    onChange: (value: Rgba) => void;
    onClose: () => void;
}

const ColorPopover: React.FC<ColorPopoverProps> = ({ anchor, label, value, onChange, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const areaRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
    // HSV is kept locally: hue and saturation cannot be recovered from black, white or grays.
    const [hsv, setHsv] = useState<Hsv>(() => rgbToHsv(value));
    const [hexDraft, setHexDraft] = useState<string | null>(null);
    const alpha = value.a;

    const place = useCallback(() => {
        const trigger = anchor.current?.getBoundingClientRect();
        const popover = popoverRef.current;
        if (!trigger || !popover) { return; }
        const height = popover.offsetHeight;
        // Right-aligned to the swatch, flipped above it when there is no room below, always inside the viewport.
        const left = Math.min(
            Math.max(VIEWPORT_MARGIN, trigger.right - POPOVER_WIDTH),
            window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN,
        );
        const below = trigger.bottom + POPOVER_GAP;
        const above = trigger.top - POPOVER_GAP - height;
        const top =
            below + height <= window.innerHeight - VIEWPORT_MARGIN || above < VIEWPORT_MARGIN
                ? Math.min(below, window.innerHeight - height - VIEWPORT_MARGIN)
                : above;
        setPosition({ left, top: Math.max(VIEWPORT_MARGIN, top) });
    }, [anchor]);

    useLayoutEffect(place, [place]);

    useEffect(() => {
        const onDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (popoverRef.current?.contains(t) || anchor.current?.contains(t)) { return; }
            onClose();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey, true);
        // Follow the swatch while the settings panel scrolls; capture catches scrolls of any ancestor.
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);
        return () => {
            document.removeEventListener('pointerdown', onDown);
            document.removeEventListener('keydown', onKey, true);
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
        };
    }, [anchor, onClose, place]);

    useEffect(() => {
        areaRef.current?.focus();
    }, []);

    const commit = (next: Hsv, a = alpha) => {
        setHsv(next);
        setHexDraft(null);
        onChange(hsvToRgb(next, a));
    };

    const pickFromArea = (clientX: number, clientY: number) => {
        const rect = areaRef.current!.getBoundingClientRect();
        commit({ ...hsv, s: clamp01((clientX - rect.left) / rect.width), v: 1 - clamp01((clientY - rect.top) / rect.height) });
    };

    const onAreaKey = (e: React.KeyboardEvent) => {
        const step = e.shiftKey ? 0.1 : 0.01;
        const moves: Record<string, [number, number]> = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, step],
            ArrowDown: [0, -step],
        };
        const move = moves[e.key];
        if (!move) { return; }
        e.preventDefault();
        commit({ ...hsv, s: clamp01(hsv.s + move[0]), v: clamp01(hsv.v + move[1]) });
    };

    const current = hsvToRgb(hsv, alpha);
    const opaque = toHex(current);
    const eyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

    return createPortal(
        <div
            ref={popoverRef}
            role="dialog"
            aria-label={`${label} color`}
            className={styles.popover}
            style={{ width: POPOVER_WIDTH, left: position?.left ?? -9999, top: position?.top ?? -9999 }}
        >
            <div
                ref={areaRef}
                className={styles.area}
                style={{ '--hue': `hsl(${hsv.h} 100% 50%)` } as React.CSSProperties}
                role="slider"
                tabIndex={0}
                aria-label="Saturation and brightness"
                aria-valuetext={`saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`}
                onKeyDown={onAreaKey}
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    e.currentTarget.focus();
                    pickFromArea(e.clientX, e.clientY);
                }}
                onPointerMove={(e) => {
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) { pickFromArea(e.clientX, e.clientY); }
                }}
            >
                <span className={styles.areaThumb} style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: opaque }} />
            </div>

            <div className={styles.sliders}>
                <input
                    type="range"
                    className={styles.hue}
                    min={0}
                    max={360}
                    value={Math.round(hsv.h)}
                    aria-label="Hue"
                    onChange={(e) => commit({ ...hsv, h: Number(e.target.value) })}
                />
                <input
                    type="range"
                    className={styles.alphaTrack}
                    style={{ '--opaque': opaque } as React.CSSProperties}
                    min={0}
                    max={100}
                    value={Math.round(alpha * 100)}
                    aria-label="Opacity"
                    onChange={(e) => commit(hsv, Number(e.target.value) / 100)}
                />
            </div>

            <div className={styles.footer}>
                <span className={styles.preview} style={{ '--swatch': toCssColor(current) } as React.CSSProperties} />
                <input
                    className={styles.hex}
                    aria-label="Hex color"
                    spellCheck={false}
                    value={hexDraft ?? (alpha < 1 ? `${opaque}${Math.round(alpha * 255).toString(16).padStart(2, '0')}` : opaque)}
                    aria-invalid={hexDraft !== null && !parseHex(hexDraft)}
                    onChange={(e) => {
                        setHexDraft(e.target.value);
                        const parsed = parseHex(e.target.value);
                        if (parsed) {
                            setHsv(rgbToHsv(parsed));
                            onChange(parsed);
                        }
                    }}
                    onBlur={() => setHexDraft(null)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { onClose(); }
                    }}
                />
                {eyeDropper && (
                    <button
                        type="button"
                        className={styles.eyeDropper}
                        title="Pick a color from the screen"
                        aria-label="Pick a color from the screen"
                        onClick={async () => {
                            try {
                                const result = await new (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } }).EyeDropper().open();
                                const picked = parseHex(result.sRGBHex);
                                if (picked) { commit(rgbToHsv(picked)); }
                            } catch {
                                // Cancelled by the user.
                            }
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m2 22 1-1h3l9-9M3 21v-3l9-9M15 6l3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3z" />
                        </svg>
                    </button>
                )}
            </div>
        </div>,
        document.body,
    );
};
