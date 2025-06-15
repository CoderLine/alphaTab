import type React from 'react';
import {
    moveMarker,
    type SyncPointInfo,
    type SyncPointMarker,
    SyncPointMarkerType,
    toggleMarker
} from './sync-point-info';
import styles from './styles.module.scss';
import { timePositionToX, xToTimePosition } from './helpers';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SyncPointMarkerPanelProps = {
    syncPointInfo: SyncPointInfo;
    onSyncPointInfoChanged(syncPointInfo: SyncPointInfo): void;
    onSeek(millis: number): void;

    zoom: number;
    width: number;
    height: number;
    pixelPerMilliseconds: number;
    leftPadding: number;
};

type MarkerDragInfo = {
    startX: number;
    startY: number;
    endX: number;
};

const dragLimit = 10;
const dragThreshold = 5;

const buildMarkerLabel = (m: SyncPointMarker): React.ReactNode => {
    switch (m.markerType) {
        case SyncPointMarkerType.StartMarker:
            return 'Start';
        case SyncPointMarkerType.EndMarker:
            return 'End';
        case SyncPointMarkerType.MasterBar:
            if (m.occurence > 0) {
                return `${m.masterBarIndex + 1} (${m.occurence + 1})`;
            }
            return `${m.masterBarIndex + 1}`;
        case SyncPointMarkerType.Intermediate:
            return '';
    }
};

const computeMarkerInlineStyle = (
    m: SyncPointMarker,
    props: SyncPointMarkerPanelProps,
    draggingMarker: SyncPointMarker | null,
    draggingMarkerInfo: MarkerDragInfo | null
): React.CSSProperties => {
    let left = timePositionToX(props.pixelPerMilliseconds, m.syncTime, props.zoom, props.leftPadding);

    if (m === draggingMarker && draggingMarkerInfo) {
        const deltaX = draggingMarkerInfo.endX - draggingMarkerInfo.startX;
        left += deltaX;
    }

    return {
        left: `${left}px`
    };
};

export const SyncPointMarkerPanel: React.FC<SyncPointMarkerPanelProps> = props => {
    const { syncPointInfo, onSyncPointInfoChanged, width, height, zoom, pixelPerMilliseconds, leftPadding } = props;

    const [draggingMarker, setDraggingMarker] = useState<SyncPointMarker | null>(null);
    const [draggingMarkerInfo, setDraggingMarkerInfo] = useState<MarkerDragInfo | null>(null);

    const onToggleMarker = (marker: SyncPointMarker, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onSyncPointInfoChanged(toggleMarker(syncPointInfo, marker));
    };

    const startMarkerDrag = (marker: SyncPointMarker, e: React.MouseEvent) => {
        if (e.button !== 0 || marker.syncBpm === undefined) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        setDraggingMarkerInfo(() => ({ startX: e.pageX, startY: e.pageY, endX: e.pageX }));
        setDraggingMarker(() => marker);
    };

    const mouseUpListener = useCallback(
        (e: MouseEvent) => {
            if (draggingMarker) {
                e.preventDefault();
                e.stopPropagation();

                const deltaX = draggingMarkerInfo!.endX - draggingMarkerInfo!.startX;
                if (deltaX > dragThreshold || (draggingMarker.syncBpm !== undefined && Math.abs(deltaX) > 0)) {
                    const zoomedPixelPerMillisecond = pixelPerMilliseconds * zoom;
                    const deltaTime = deltaX / zoomedPixelPerMillisecond;
                    const newTimePosition = draggingMarker.syncTime + deltaTime;
                    onSyncPointInfoChanged(moveMarker(syncPointInfo, draggingMarker, newTimePosition));
                }

                setDraggingMarker(null);
                setDraggingMarkerInfo(null);
            }
        },
        [draggingMarker, draggingMarkerInfo]
    );

    const mouseMoveListener = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            setDraggingMarkerInfo(s => {
                if (!s || !syncPointInfo) {
                    return s;
                }

                const index = syncPointInfo.syncPointMarkers.indexOf(draggingMarker!);
                if (index === -1) {
                    return s;
                }

                let pageX = e.pageX;
                const deltaX = pageX - s.startX;

                if (deltaX < 0) {
                    if (index > 0) {
                        const thisX = timePositionToX(
                            pixelPerMilliseconds,
                            draggingMarker!.syncTime,
                            zoom,
                            leftPadding
                        );
                        const newX = thisX + deltaX;

                        let previousMarkerIndex = index - 1;
                        while (
                            previousMarkerIndex > 0 &&
                            !syncPointInfo.syncPointMarkers[previousMarkerIndex].syncBpm
                        ) {
                            previousMarkerIndex--;
                        }

                        const previousMarker = syncPointInfo.syncPointMarkers[previousMarkerIndex];
                        const previousX = timePositionToX(
                            pixelPerMilliseconds,
                            previousMarker.syncTime,
                            zoom,
                            leftPadding
                        );
                        const minX = previousX + dragLimit;

                        if (newX < minX) {
                            pageX = s.startX - (thisX - minX);
                        }
                    }
                } else {
                    if (index < syncPointInfo.syncPointMarkers.length - 1) {
                        const thisX = timePositionToX(
                            pixelPerMilliseconds,
                            draggingMarker!.syncTime,
                            zoom,
                            leftPadding
                        );
                        const newX = thisX + deltaX;

                        let nextMarkerIndex = index + 1;
                        while (
                            nextMarkerIndex < syncPointInfo.syncPointMarkers.length - 1 &&
                            !syncPointInfo.syncPointMarkers[nextMarkerIndex].syncBpm
                        ) {
                            nextMarkerIndex++;
                        }

                        const nextMarker = syncPointInfo.syncPointMarkers[nextMarkerIndex];
                        const nextX = timePositionToX(pixelPerMilliseconds, nextMarker.syncTime, zoom, leftPadding);
                        const maxX = nextX - dragLimit;

                        if (newX > maxX) {
                            pageX = s.startX + (maxX - thisX);
                        }
                    }
                }

                return { ...s, endX: pageX };
            });
        },
        [draggingMarker, syncPointInfo]
    );

    useEffect(() => {
        if (draggingMarker) {
            document.addEventListener('mouseup', mouseUpListener);
            document.addEventListener('mousemove', mouseMoveListener);
        }

        return () => {
            document.removeEventListener('mouseup', mouseUpListener);
            document.removeEventListener('mousemove', mouseMoveListener);
        };
    }, [draggingMarker, mouseUpListener, mouseMoveListener]);

    const wrapRef = useRef<HTMLDivElement>(null);
    const onClick = (e: React.MouseEvent) => {
        if (e.target === wrapRef.current) {
            const rect = wrapRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            props.onSeek(xToTimePosition(props.pixelPerMilliseconds, x, props.zoom, props.leftPadding));
        }
    };

    return (
        <div
            ref={wrapRef}
            className={styles['sync-area-marker-wrap']}
            style={{ width: `${width}px`, height: `${height}px` }}
            onClick={onClick}>
            {syncPointInfo.syncPointMarkers.map(m => (
                <div
                    key={`${m.uniqueId}`}
                    className={`${styles['masterbar-marker']} ${styles[`masterbar-marker-${SyncPointMarkerType[m.markerType].toLowerCase()}`]}  ${m.syncBpm !== undefined ? styles['has-sync-point'] : ''}`}
                    style={computeMarkerInlineStyle(m, props, draggingMarker, draggingMarkerInfo)}
                    onDoubleClick={e => onToggleMarker(m, e)}
                    onMouseDown={e => {
                        startMarkerDrag(m, e);
                    }}>
                    <div className={styles['marker-label']}>{buildMarkerLabel(m)}</div>
                    <div className={styles['marker-head']}>
                        <div className={`${styles['marker-arrow']}`} />
                        {m.markerType !== SyncPointMarkerType.EndMarker && m.syncBpm && (
                            <div className={styles['marker-tempo']}>{m.syncBpm.toFixed(1)} bpm</div>
                        )}
                    </div>
                    <div className={styles['marker-line']} />
                </div>
            ))}
        </div>
    );
};
