import React from 'react';
import type { LayoutModeKey, StaveProfileKey } from '@site/src/alphatab-react';
import { IconSettings, IconClose } from '../shared/icons';
import { FlyoutGroup, FlyoutRow, Segmented, Slider, Toggle } from './flyout-controls';
import styles from './settings-flyout.module.scss';

export interface SettingsFlyoutState {
    layoutMode: LayoutModeKey;
    staveProfile: StaveProfileKey;
    zoomPct: number;
    masterVolumePct: number;
    tempoPct: number;
    transposeSt: number;
    countIn: boolean;
    metronome: boolean;
    highlightCursor: boolean;
    loop: boolean;
    loopHint: string | null;
}

export interface SettingsFlyoutHandlers {
    setLayoutMode: (v: LayoutModeKey) => void;
    setStaveProfile: (v: StaveProfileKey) => void;
    setZoomPct: (v: number) => void;
    setMasterVolumePct: (v: number) => void;
    setTempoPct: (v: number) => void;
    setTransposeSt: (v: number) => void;
    setCountIn: (v: boolean) => void;
    setMetronome: (v: boolean) => void;
    setHighlightCursor: (v: boolean) => void;
    setLoop: (v: boolean) => void;
    onReset: () => void;
}

interface SettingsFlyoutProps {
    onClose: () => void;
    state: SettingsFlyoutState;
    handlers: SettingsFlyoutHandlers;
}

export const SettingsFlyout = React.forwardRef<HTMLDivElement, SettingsFlyoutProps>(
    ({ onClose, state, handlers }, ref) => (
        <div ref={ref} className={styles.flyout} role="dialog" aria-label="Player settings">
            <div className={styles.header}>
                <IconSettings size={13} className={styles.headerIcon} aria-hidden="true" />
                <span className={styles.headerTitle}>Player settings</span>
                <span className={styles.spacer} />
                <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close">
                    <IconClose />
                </button>
            </div>

            <div className={styles.body}>
                <FlyoutGroup title="Display">
                    <FlyoutRow label="Layout">
                        <Segmented<LayoutModeKey>
                            value={state.layoutMode}
                            onChange={handlers.setLayoutMode}
                            options={[
                                { v: 'page', l: 'Page' },
                                { v: 'scroll', l: 'Scroll' },
                            ]}
                        />
                    </FlyoutRow>
                    <FlyoutRow label="Stave">
                        <Segmented<StaveProfileKey>
                            value={state.staveProfile}
                            onChange={handlers.setStaveProfile}
                            options={[
                                { v: 'scoreTab', l: 'Score+Tab' },
                                { v: 'score', l: 'Score' },
                                { v: 'tab', l: 'Tab' },
                            ]}
                        />
                    </FlyoutRow>
                    <FlyoutRow label="Zoom">
                        <Slider
                            value={state.zoomPct}
                            min={50}
                            max={200}
                            step={5}
                            unit="%"
                            onChange={handlers.setZoomPct}
                            label="Zoom"
                        />
                    </FlyoutRow>
                </FlyoutGroup>

                <FlyoutGroup title="Audio">
                    <FlyoutRow label="Volume">
                        <Slider
                            value={state.masterVolumePct}
                            min={0}
                            max={100}
                            step={1}
                            unit=""
                            onChange={handlers.setMasterVolumePct}
                            label="Volume"
                        />
                    </FlyoutRow>
                    <FlyoutRow label="Tempo">
                        <Slider
                            value={state.tempoPct}
                            min={50}
                            max={200}
                            step={1}
                            unit="%"
                            onChange={handlers.setTempoPct}
                            label="Tempo"
                        />
                    </FlyoutRow>
                    <FlyoutRow label="Transpose">
                        <Slider
                            value={state.transposeSt}
                            min={-12}
                            max={12}
                            step={1}
                            unit=" st"
                            onChange={handlers.setTransposeSt}
                            bipolar
                            label="Transpose"
                        />
                    </FlyoutRow>
                </FlyoutGroup>

                <FlyoutGroup title="Playback" last>
                    <Toggle label="Count-in" value={state.countIn} onChange={handlers.setCountIn} />
                    <Toggle label="Metronome" value={state.metronome} onChange={handlers.setMetronome} />
                    <Toggle label="Highlight cursor" value={state.highlightCursor} onChange={handlers.setHighlightCursor} />
                    <Toggle
                        label="Loop range"
                        value={state.loop}
                        onChange={handlers.setLoop}
                        hint={state.loop ? state.loopHint : null}
                    />
                </FlyoutGroup>
            </div>

            <div className={styles.footer}>
                <span className={styles.hint}>Esc to close</span>
                <span className={styles.spacer} />
                <button type="button" className={styles.resetBtn} onClick={handlers.onReset}>
                    Reset
                </button>
            </div>

            <span className={styles.pointer} aria-hidden="true" />
        </div>
    ),
);

SettingsFlyout.displayName = 'SettingsFlyout';
