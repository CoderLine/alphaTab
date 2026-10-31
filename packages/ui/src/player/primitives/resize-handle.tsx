import type React from 'react';
import { useRef } from 'react';
import clsx from 'clsx';
import styles from './ui.module.scss';

interface ResizeHandleProps {
    /** `x` resizes a column (drag horizontally), `y` a row. */
    axis: 'x' | 'y';
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    /** +1 when dragging right/down grows the size, -1 when it shrinks it. */
    direction?: 1 | -1;
    label: string;
    className?: string;
}

/** A keyboard- and pointer-operable splitter. */
export const ResizeHandle: React.FC<ResizeHandleProps> = ({ axis, value, min, max, onChange, direction = 1, label, className }) => {
    const start = useRef<{ pos: number; value: number } | null>(null);
    const clamp = (v: number) => Math.round(Math.min(max, Math.max(min, v)));

    return (
        <div
            role="separator"
            aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            tabIndex={0}
            className={clsx(styles.resizeHandle, axis === 'x' ? styles.resizeX : styles.resizeY, className)}
            onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                start.current = { pos: axis === 'x' ? e.clientX : e.clientY, value };
            }}
            onPointerMove={(e) => {
                if (!start.current) { return; }
                const delta = (axis === 'x' ? e.clientX : e.clientY) - start.current.pos;
                onChange(clamp(start.current.value + delta * direction));
            }}
            onPointerUp={() => {
                start.current = null;
            }}
            onPointerCancel={() => {
                start.current = null;
            }}
            onKeyDown={(e) => {
                const grow = axis === 'x' ? 'ArrowRight' : 'ArrowDown';
                const shrink = axis === 'x' ? 'ArrowLeft' : 'ArrowUp';
                const step = e.shiftKey ? 64 : 16;
                if (e.key === grow) { onChange(clamp(value + step * direction)); }
                else if (e.key === shrink) { onChange(clamp(value - step * direction)); }
                else { return; }
                e.preventDefault();
            }}
        />
    );
};
