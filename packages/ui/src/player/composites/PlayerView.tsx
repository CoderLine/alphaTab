import clsx from 'clsx';
import type React from 'react';
import { useRef } from 'react';
import { DropOverlay, RenderingOverlay } from '../controls/overlays';
import { Transport } from '../controls/transport';
import { BackingTrackWaveform } from '../controls/waveform';
import { PlayerHost } from '../PlayerProvider';
import { ResizeHandle } from '../primitives/resize-handle';
import { PHONE_QUERY, useMediaQuery } from '../primitives/use-media-query';
import { useFileDrop } from '../use-file-drop';
import styles from './player-view.module.scss';

/** A panel the user can resize along one axis. */
export interface ResizablePanel {
    content: React.ReactNode;
    /** Width (side panels) or height (drawer) in CSS pixels. */
    size: number;
    onResize: (size: number) => void;
    min: number;
    max: number;
    /** Accessible name of the resize handle. */
    resizeLabel: string;
}

export interface PlayerViewProps {
    className?: string;
    /** Above the workspace, e.g. the document menu and panel toggles. */
    header?: React.ReactNode;
    /** First panel on the left, resizable on tablets and desktops, e.g. the alphaTex editor. */
    editor?: ResizablePanel | null;
    /** Panel left of the notation, e.g. the track panel. */
    start?: React.ReactNode;
    /** Panel right of the notation, e.g. the settings panel. */
    end?: React.ReactNode;
    /** Centered over the notation, e.g. while a score loads. */
    notationMessage?: React.ReactNode;
    /** Fades the notation, e.g. while it no longer matches its source. */
    notationDimmed?: boolean;
    /** Placed over the notation, e.g. a docked video. */
    notationOverlay?: React.ReactNode;
    /** Placed over the rendered score in its coordinates and scrolled with it, see `PlayerHostProps.overlay`. */
    scoreOverlay?: React.ReactNode;
    /** Shows a busy indicator over the notation while it renders. */
    renderingIndicator?: boolean;
    /** Resizable area between the notation and the transport, e.g. a media sync editor. */
    drawer?: ResizablePanel | null;
    /** Shows the backing-track waveform above the transport while the backing track plays. */
    waveform?: boolean;
    /** Replaces the default {@link Transport}; `null` hides it. */
    transport?: React.ReactNode;
    /** Opens files dropped onto the workspace; the drop hint shows while a file is dragged over it. */
    onDropFile?: (file: File) => void;
}

const noDrop = () => {};

/**
 * The full player layout: a header over a workspace with optional side panels, the notation with
 * selection handles, an optional drawer and the transport. Fills its container's height minus
 * `--at-host-offset`; on phones, side panels cover the notation. Must be rendered inside
 * `<PlayerProvider>`.
 */
export const PlayerView: React.FC<PlayerViewProps> = ({
    className,
    header,
    editor,
    start,
    end,
    notationMessage,
    notationDimmed = false,
    notationOverlay,
    scoreOverlay,
    renderingIndicator = false,
    drawer,
    waveform = false,
    transport,
    onDropFile
}) => {
    const isPhone = useMediaQuery(PHONE_QUERY);
    const workspaceRef = useRef<HTMLDivElement>(null);
    const dragging = useFileDrop(workspaceRef, onDropFile ?? noDrop);

    return (
        <div className={clsx(styles.page, className)}>
            {header}
            <div ref={workspaceRef} className={styles.workspace}>
                {editor && (
                    <>
                        <aside
                            className={clsx(styles.side, styles.editorSide)}
                            style={{ '--side-width': `${editor.size}px` } as React.CSSProperties}>
                            {editor.content}
                        </aside>
                        {!isPhone && (
                            <ResizeHandle
                                axis="x"
                                value={editor.size}
                                min={editor.min}
                                max={editor.max}
                                onChange={editor.onResize}
                                label={editor.resizeLabel}
                            />
                        )}
                    </>
                )}
                {start && <aside className={clsx(styles.side, styles.startSide)}>{start}</aside>}

                <main className={styles.main}>
                    <div className={clsx(styles.notation, notationDimmed && styles.notationDimmed)}>
                        <PlayerHost className={styles.canvas} withSelectionHandles overlay={scoreOverlay} />
                        {notationMessage && <div className={styles.notationMessage}>{notationMessage}</div>}
                        {renderingIndicator && <RenderingOverlay />}
                        {notationOverlay}
                    </div>
                    {drawer && (
                        <>
                            <ResizeHandle
                                axis="y"
                                value={drawer.size}
                                min={drawer.min}
                                max={drawer.max}
                                direction={-1}
                                onChange={drawer.onResize}
                                label={drawer.resizeLabel}
                            />
                            <div className={styles.drawer} style={{ height: drawer.size }}>
                                {drawer.content}
                            </div>
                        </>
                    )}
                    {waveform && <BackingTrackWaveform />}
                    {transport === undefined ? <Transport /> : transport}
                </main>

                {end && <aside className={clsx(styles.side, styles.endSide)}>{end}</aside>}

                {onDropFile && dragging && <DropOverlay />}
            </div>
        </div>
    );
};
