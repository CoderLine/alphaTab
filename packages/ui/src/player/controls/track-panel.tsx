import type React from 'react';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { model } from '@coderline/alphatab';
import { defaultTrackMix, type TrackMix } from '../../state/store';
import { usePlayerControls, usePlayerSelector } from '../PlayerProvider';
import { Slider } from '../primitives/flyout-controls';
import { IconCaret, IconEye, IconEyeOff, IconTracks } from '../icons';
import { formatCapo, formatKey, formatTuning, trackColor } from '../../state/score-info';
import { Panel } from '../primitives/panel';
import styles from './tracks.module.scss';

type StaffNotation = 'showStandardNotation' | 'showTablature' | 'showSlash' | 'showNumbered';

const NOTATIONS: { key: StaffNotation; label: string; short: string }[] = [
    { key: 'showStandardNotation', label: 'Standard notation', short: 'Score' },
    { key: 'showTablature', label: 'Tablature', short: 'Tab' },
    { key: 'showSlash', label: 'Slash notation', short: 'Slash' },
    { key: 'showNumbered', label: 'Numbered notation', short: 'Numbered' },
];

export const TrackPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const controls = usePlayerControls();
    const score = usePlayerSelector((s) => s.currentScore);
    const tracks = usePlayerSelector((s) => s.tracks);
    const renderedTracks = usePlayerSelector((s) => s.renderedTracks);
    const trackMix = usePlayerSelector((s) => s.trackMix);
    // Staff options are read from the mutable score model; the revision makes this component re-render on changes.
    usePlayerSelector((s) => s.scoreRevision);
    const totalBars = usePlayerSelector((s) => s.totalBars);

    const rendered = useMemo(() => new Set(renderedTracks.map((t) => t.index)), [renderedTracks]);
    const allShown = tracks.length > 0 && rendered.size === tracks.length;

    const setShown = (track: model.Track, shown: boolean) => {
        const next = tracks.filter((t) => (t === track ? shown : rendered.has(t.index)));
        controls?.renderTracks(next);
    };

    const firstRendered = renderedTracks[0] ?? tracks[0];
    const firstBar = score?.masterBars[0];

    return (
        <Panel
            title="Tracks"
            icon={<IconTracks size={13} />}
            onClose={onClose}
            actions={
                tracks.length > 1 && (
                    <button
                        type="button"
                        className={styles.headerLink}
                        onClick={() => controls?.renderTracks(allShown ? [tracks[0]] : tracks)}
                    >
                        {allShown ? 'Show first' : 'Show all'}
                    </button>
                )
            }
            footer={
                score && (
                    <dl className={styles.details}>
                        <div><dt>Tempo</dt><dd>♩={score.tempo}</dd></div>
                        <div><dt>Time</dt><dd>{firstBar ? `${firstBar.timeSignatureNumerator}/${firstBar.timeSignatureDenominator}` : '—'}</dd></div>
                        <div><dt>Key</dt><dd>{formatKey(score)}</dd></div>
                        <div><dt>Bars</dt><dd>{totalBars}</dd></div>
                        <div><dt>Tuning</dt><dd className={styles.mono}>{formatTuning(firstRendered)}</dd></div>
                        <div><dt>Capo</dt><dd>{formatCapo(firstRendered)}</dd></div>
                    </dl>
                )
            }
        >
            <ul className={styles.list}>
                {tracks.map((track) => (
                    <TrackRow
                        key={`${track.index}:${track.name}`}
                        track={track}
                        mix={trackMix[track.index] ?? defaultTrackMix}
                        shown={rendered.has(track.index)}
                        onlyShown={rendered.size === 1 && rendered.has(track.index)}
                        onShownChange={(shown) => setShown(track, shown)}
                    />
                ))}
            </ul>
            {tracks.length === 0 && <p className={styles.empty}>No score loaded.</p>}
        </Panel>
    );
};

interface TrackRowProps {
    track: model.Track;
    mix: TrackMix;
    shown: boolean;
    /** The last visible track cannot be hidden. */
    onlyShown: boolean;
    onShownChange: (shown: boolean) => void;
}

const TrackRow: React.FC<TrackRowProps> = ({ track, mix, shown, onlyShown, onShownChange }) => {
    const controls = usePlayerControls();
    const [expanded, setExpanded] = useState(false);
    const detailsId = `track-details-${track.index}`;

    return (
        <li
            className={clsx(styles.track, shown && styles.trackShown, mix.mute && styles.trackMuted)}
            style={{ '--track-color': trackColor(track.index) } as React.CSSProperties}
        >
            <div className={styles.trackHead}>
                <button
                    type="button"
                    className={styles.visibility}
                    onClick={() => onShownChange(!shown)}
                    disabled={onlyShown}
                    aria-pressed={shown}
                    aria-label={shown ? `Hide ${track.name}` : `Show ${track.name}`}
                    title={onlyShown ? 'At least one track stays visible' : shown ? 'Hide in notation' : 'Show in notation'}
                >
                    {shown ? <IconEye size={13} /> : <IconEyeOff size={13} />}
                </button>
                <button
                    type="button"
                    className={styles.trackName}
                    onClick={() => setExpanded((e) => !e)}
                    aria-expanded={expanded}
                    aria-controls={detailsId}
                >
                    <span className={styles.trackDot} />
                    <span className={styles.trackLabel}>
                        <span className={styles.trackTitle}>{track.name || `Track ${track.index + 1}`}</span>
                        <span className={styles.trackMeta}>{describeTrack(track, mix)}</span>
                    </span>
                    <IconCaret size={9} className={clsx(styles.caret, expanded && styles.caretOpen)} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className={clsx(styles.mixBtn, mix.mute && styles.mixBtnMute)}
                    aria-pressed={mix.mute}
                    title={mix.mute ? 'Unmute' : 'Mute'}
                    aria-label={`Mute ${track.name}`}
                    onClick={() => controls?.setTrackMute(track, !mix.mute)}
                >
                    M
                </button>
                <button
                    type="button"
                    className={clsx(styles.mixBtn, mix.solo && styles.mixBtnSolo)}
                    aria-pressed={mix.solo}
                    title={mix.solo ? 'Unsolo' : 'Solo'}
                    aria-label={`Solo ${track.name}`}
                    onClick={() => controls?.setTrackSolo(track, !mix.solo)}
                >
                    S
                </button>
            </div>

            {expanded && (
                <div id={detailsId} className={styles.trackDetails}>
                    <div className={styles.control}>
                        <span>Volume</span>
                        <Slider
                            value={Math.round(mix.volume * 100)}
                            min={0}
                            max={200}
                            step={5}
                            unit="%"
                            label={`${track.name} volume`}
                            onChange={(v) => controls?.setTrackVolume(track, v / 100)}
                        />
                    </div>
                    <div className={styles.control} title="Shifts the audio only">
                        <span>Pitch</span>
                        <Slider
                            value={mix.transpose}
                            min={-12}
                            max={12}
                            unit=" st"
                            bipolar
                            label={`${track.name} audio transposition`}
                            onChange={(v) => controls?.setTrackTranspose(track, v)}
                        />
                    </div>
                    <div className={styles.control} title="Transposes the notation and its audio">
                        <span>Transpose</span>
                        <Slider
                            value={mix.notationTranspose}
                            min={-12}
                            max={12}
                            unit=" st"
                            bipolar
                            label={`${track.name} transposition`}
                            onChange={(v) => controls?.setTrackNotationTranspose(track, v)}
                        />
                    </div>
                    <div className={styles.control} title="Shifts only the standard notation, e.g. for transposing instruments (guitar sounds an octave lower than written)">
                        <span>Written</span>
                        <Slider
                            value={mix.displayTranspose}
                            min={-24}
                            max={24}
                            unit=" st"
                            bipolar
                            label={`${track.name} written pitch offset`}
                            onChange={(v) => controls?.setTrackDisplayTranspose(track, v)}
                        />
                    </div>
                    <TrackStylesheet track={track} />
                    {track.staves.map((staff, i) => (
                        <StaffNotations key={i} staff={staff} label={track.staves.length > 1 ? `Staff ${i + 1}` : 'Notation'} />
                    ))}
                </div>
            )}
        </li>
    );
};

/** Per-track overrides of the score stylesheet's tuning and chord diagram display. */
const TrackStylesheet: React.FC<{ track: model.Track }> = ({ track }) => {
    const controls = usePlayerControls();
    const { stylesheet } = track.score;
    const options: { key: 'perTrackDisplayTuning' | 'perTrackChordDiagramsOnTop'; global: boolean; label: string }[] = [
        { key: 'perTrackDisplayTuning', global: stylesheet.globalDisplayTuning, label: 'Tuning' },
        { key: 'perTrackChordDiagramsOnTop', global: stylesheet.globalDisplayChordDiagramsOnTop, label: 'Chord diagrams' },
    ];
    return (
        <div className={styles.control}>
            <span>Show</span>
            <div className={styles.chips} role="group" aria-label="Show above the notation">
                {options.map((o) => {
                    const on = stylesheet[o.key]?.get(track.index) ?? o.global;
                    return (
                        <button
                            key={o.key}
                            type="button"
                            className={clsx(styles.chip, on && styles.chipOn)}
                            aria-pressed={on}
                            onClick={() =>
                                controls?.mutateScore((score) => {
                                    const map = score.stylesheet[o.key] ?? new Map<number, boolean>();
                                    map.set(track.index, !on);
                                    score.stylesheet[o.key] = map;
                                })
                            }
                        >
                            {o.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const StaffNotations: React.FC<{ staff: model.Staff; label: string }> = ({ staff, label }) => {
    const controls = usePlayerControls();
    const available = NOTATIONS.filter((n) => n.key !== 'showTablature' || staff.isStringed);
    const shownCount = available.filter((n) => staff[n.key]).length;

    return (
        <div className={styles.control}>
            <span>{label}</span>
            <div className={styles.chips} role="group" aria-label={label}>
                {available.map((n) => {
                    const on = staff[n.key];
                    return (
                        <button
                            key={n.key}
                            type="button"
                            className={clsx(styles.chip, on && styles.chipOn)}
                            aria-pressed={on}
                            title={on && shownCount === 1 ? 'At least one notation stays visible' : n.label}
                            disabled={on && shownCount === 1}
                            onClick={() =>
                                controls?.mutateScore(() => {
                                    staff[n.key] = !on;
                                })
                            }
                        >
                            {n.short}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

function describeTrack(track: model.Track, mix: TrackMix): string {
    const parts: string[] = [];
    const staff = track.staves[0];
    if (staff?.isPercussion) { parts.push('drums'); }
    else if (staff?.isStringed) { parts.push(`${staff.tuning.length}-string`); }
    if (track.staves.length > 1) { parts.push(`${track.staves.length} staves`); }
    if (mix.volume !== 1) { parts.push(`${Math.round(mix.volume * 100)}%`); }
    if (mix.transpose !== 0) { parts.push(`pitch ${mix.transpose > 0 ? '+' : ''}${mix.transpose}`); }
    if (mix.notationTranspose !== 0) { parts.push(`transp. ${mix.notationTranspose > 0 ? '+' : ''}${mix.notationTranspose}`); }
    if (mix.displayTranspose !== 0) { parts.push(`written ${mix.displayTranspose > 0 ? '+' : ''}${mix.displayTranspose}`); }
    return parts.join(' · ');
}
