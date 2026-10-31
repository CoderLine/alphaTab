import clsx from 'clsx';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './recorder.module.scss';

export interface DrumPad {
    key: string;
    midiNote: number;
    label: string;
}

export const DEFAULT_DRUM_PADS: DrumPad[] = [
    { key: 'a', midiNote: 36, label: 'Kick' },
    { key: 's', midiNote: 38, label: 'Snare' },
    { key: 'd', midiNote: 42, label: 'Hi-Hat' },
    { key: 'f', midiNote: 46, label: 'Open HH' },
    { key: 'g', midiNote: 44, label: 'HH Pedal' },
    { key: 'h', midiNote: 45, label: 'Low Tom' },
    { key: 'j', midiNote: 47, label: 'Mid Tom' },
    { key: 'k', midiNote: 50, label: 'Hi Tom' },
    { key: 'l', midiNote: 49, label: 'Crash' },
    { key: ';', midiNote: 51, label: 'Ride' }
];

const FLASH_MS = 120;

export interface DrumPadPanelProps {
    recording: boolean;
    /** Returns whether the hit was recorded; recorded pads flash. */
    onHit: (midiNote: number) => boolean;
    pads?: DrumPad[];
}

/** A floating, draggable pad panel; the pads also play from the keyboard keys shown on them. */
export const DrumPadPanel: React.FC<DrumPadPanelProps> = ({ recording, onHit, pads = DEFAULT_DRUM_PADS }) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
    const [flashing, setFlashing] = useState<ReadonlySet<number>>(new Set());

    const onHitRef = useRef(onHit);
    onHitRef.current = onHit;

    const hit = (midiNote: number) => {
        if (!onHitRef.current(midiNote)) {
            return;
        }
        setFlashing(current => new Set(current).add(midiNote));
        window.setTimeout(
            () =>
                setFlashing(current => {
                    const next = new Set(current);
                    next.delete(midiNote);
                    return next;
                }),
            FLASH_MS
        );
    };
    const hitRef = useRef(hit);
    hitRef.current = hit;

    useEffect(() => {
        const byKey = new Map(pads.map(p => [p.key, p]));
        const onKeyDown = (e: KeyboardEvent) => {
            const pad = e.repeat ? undefined : byKey.get(e.key.toLowerCase());
            if (pad) {
                e.preventDefault();
                hitRef.current(pad.midiNote);
            }
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [pads]);

    return (
        <div
            ref={rootRef}
            className={clsx(styles.padPanel, recording && styles.recording)}
            style={position ? { left: position.left, top: position.top, right: 'auto', bottom: 'auto' } : undefined}>
            <div
                className={styles.padHandle}
                onPointerDown={e => {
                    const rect = rootRef.current!.getBoundingClientRect();
                    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                    setPosition({ left: rect.left, top: rect.top });
                    e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={e => {
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                        setPosition({ left: e.clientX - dragOffset.current.x, top: e.clientY - dragOffset.current.y });
                    }
                }}
                onPointerUp={e => e.currentTarget.releasePointerCapture(e.pointerId)}>
                <span className={styles.stateDot} />
                <span>{recording ? 'Recording — hit pads or press keys' : 'Paused — press Play to record'}</span>
            </div>
            <div className={styles.padGrid}>
                {pads.map(pad => (
                    <button
                        key={pad.midiNote}
                        type="button"
                        className={clsx(styles.pad, flashing.has(pad.midiNote) && styles.padFlash)}
                        onClick={() => hit(pad.midiNote)}>
                        {`${pad.label}\n[${pad.key.toUpperCase()}]`}
                    </button>
                ))}
            </div>
        </div>
    );
};
