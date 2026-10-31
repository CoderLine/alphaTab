import React, { useEffect, useState } from 'react';
import type { synth } from '@coderline/alphatab';
import clsx from 'clsx';
import { useAlphaTabApi } from '@coderline/alphatab-react';
import { usePlayerControls, usePlayerSelector } from '../PlayerProvider';
import { useAlphaTabModule } from '@site/src/alphatab-react/module';
import { PlaybackSettingsPanel } from '../playback-settings';
import { Slider } from '../primitives/flyout-controls';
import { IconCaret, IconReset, IconSearch, IconSliders } from '../icons';
import { Segmented } from '../primitives/segmented';
import { MUSIC_FONTS, useMusicFont, type MusicFontId } from '@site/src/components/Playground/music-font';
import { Panel } from '../primitives/panel';
import { ColorField } from './color-field';
import { FontField, NumberField, Select, Switch, TextField } from './controls';
import type { SchemaEntry, SchemaGroup, SettingValue } from './schema';
import type { PlaygroundSettings } from './use-playground-settings';
import styles from './settings.module.scss';

const SYNTH_ONLY = 'Needs the synthesizer';

interface SettingsPanelProps {
    settings: PlaygroundSettings;
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onClose }) => {
    const [query, setQuery] = useState('');
    const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set());
    const hasScore = usePlayerSelector((s) => s.currentScore !== null);
    const normalized = query.trim().toLowerCase();

    const toggleGroup = (id: string) =>
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); }
            else { next.add(id); }
            return next;
        });

    const visibleGroups = settings.groups
        .map((g) => ({
            group: g,
            entries: normalized ? g.entries.filter((e) => matches(e, g, normalized)) : g.entries,
        }))
        .filter((g) => g.entries.length > 0);

    return (
        <Panel
            title="Settings"
            icon={<IconSliders size={13} />}
            onClose={onClose}
            footer={
                <>
                    <span className={styles.footerHint}>
                        {settings.overrideCount > 0 ? `${settings.overrideCount} changed · saved in this browser` : 'Changes are saved in this browser'}
                    </span>
                    <span className={styles.spacer} />
                    <button type="button" className={styles.resetAll} onClick={settings.resetAll}>
                        Reset all
                    </button>
                </>
            }
        >
            {!normalized && <QuickSettings settings={settings} />}

            <div className={styles.search}>
                <IconSearch size={13} aria-hidden="true" />
                <input
                    type="search"
                    placeholder="Search settings"
                    aria-label="Search settings"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {visibleGroups.map(({ group, entries }) => {
                const open = !!normalized || openGroups.has(group.id);
                const changed = group.entries.filter((e) => settings.isOverridden(e)).length;
                const bodyId = `settings-group-${group.id}`;
                return (
                    <section key={group.id} className={styles.group}>
                        <button
                            type="button"
                            className={styles.groupHeader}
                            aria-expanded={open}
                            aria-controls={bodyId}
                            onClick={() => toggleGroup(group.id)}
                        >
                            <IconCaret size={9} className={clsx(styles.caret, open && styles.caretOpen)} aria-hidden="true" />
                            <span className={styles.groupTitle}>{group.title}</span>
                            {group.perScore && <span className={styles.groupTag}>this file</span>}
                            {changed > 0 && <span className={styles.groupBadge}>{changed}</span>}
                        </button>
                        {open && (
                            <div id={bodyId} className={styles.groupBody}>
                                {group.description && !normalized && <p className={styles.groupDescription}>{group.description}</p>}
                                {group.perScore && !hasScore ? (
                                    <p className={styles.note}>Load a score to edit its stylesheet.</p>
                                ) : (
                                    entries.map((entry) => <SettingRow key={entry.id} entry={entry} settings={settings} />)
                                )}
                            </div>
                        )}
                    </section>
                );
            })}
            {visibleGroups.length === 0 && <p className={styles.note}>No setting matches “{query}”.</p>}
        </Panel>
    );
};

function matches(entry: SchemaEntry, group: SchemaGroup, query: string): boolean {
    return `${group.title} ${entry.label} ${entry.id}`.toLowerCase().includes(query);
}

const QuickSettings: React.FC<{ settings: PlaygroundSettings }> = ({ settings }) => {
    const controls = usePlayerControls();
    const view = usePlayerSelector((s) => s.view);
    const effective = usePlayerSelector((s) => s.playback.effective);
    const synthOnly = effective !== null && effective !== 'synthesizer' ? SYNTH_ONLY : null;
    const { musicFont, setMusicFont } = useMusicFont();

    return (
        <div className={styles.quick}>
            <PlaybackSettingsPanel showRemoveDownloads={false} />
            <div className={styles.quickRows}>
                {settings.quick.map((entry) => (
                    <SettingRow key={entry.id} entry={entry} settings={settings} quick />
                ))}
            </div>
            <div className={styles.quickGrid}>
                <span className={styles.label}>Zoom</span>
                <Slider label="Zoom" value={Math.round(view.scale * 100)} min={25} max={200} step={5} unit="%" onChange={(v) => controls?.setScale(v / 100)} />
                <span className={styles.label}>Tempo</span>
                <Slider label="Tempo" value={Math.round(view.playbackSpeed * 100)} min={25} max={200} step={5} unit="%" onChange={(v) => controls?.setPlaybackSpeed(v / 100)} />
                <span className={styles.label}>Transpose</span>
                <Slider
                    label="Transpose all tracks"
                    value={view.transpose}
                    min={-12}
                    max={12}
                    unit=" st"
                    bipolar
                    disabledReason={synthOnly}
                    onChange={(v) => controls?.setTransposeAllTracks(v)}
                />
                <span className={styles.label}>Highlight</span>
                <Switch label="Highlight played notes" value={view.highlight} onChange={(b) => controls?.setEnableHighlight(b)} />
                <span className={styles.label} title="Switching reloads the player">Music font</span>
                <Select
                    label="Music font"
                    value={Object.keys(MUSIC_FONTS).indexOf(musicFont)}
                    options={Object.entries(MUSIC_FONTS).map(([, f], i) => ({ value: i, label: `${f.label} (${f.description})` }))}
                    onChange={(i) => setMusicFont(Object.keys(MUSIC_FONTS)[i] as MusicFontId)}
                />
                <OutputDeviceSelect />
            </div>
        </div>
    );
};

/** Output switching needs `AudioContext.setSinkId`; checking for it needs no permission. */
const canSwitchOutput = typeof AudioContext !== 'undefined' && 'setSinkId' in AudioContext.prototype;

/**
 * The audio output device. Listing devices makes the browser ask for microphone access (device names
 * are only exposed with it), so the list is only loaded when the user asks for it.
 */
const OutputDeviceSelect: React.FC = () => {
    const api = useAlphaTabApi();
    const [devices, setDevices] = useState<synth.ISynthOutputDevice[] | null>(null);
    const [selected, setSelected] = useState(-1);
    const [loading, setLoading] = useState(false);

    const load = React.useCallback(async () => {
        if (!api) { return; }
        setLoading(true);
        try {
            const [list, current] = await Promise.all([api.enumerateOutputDevices(), api.getOutputDevice()]);
            setDevices(list);
            setSelected(current ? list.findIndex((d) => d.deviceId === current.deviceId) : -1);
        } catch {
            setDevices([]);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        if (devices === null) { return; }
        const onChange = () => void load();
        navigator.mediaDevices?.addEventListener('devicechange', onChange);
        return () => navigator.mediaDevices?.removeEventListener('devicechange', onChange);
    }, [devices, load]);

    if (!canSwitchOutput) { return null; }
    return (
        <>
            <span className={styles.label}>Output</span>
            {devices === null ? (
                <button
                    type="button"
                    className={styles.inlineBtn}
                    disabled={!api || loading}
                    onClick={() => void load()}
                    title="Lists your audio devices. The browser asks for microphone access, because it only shares device names with sites that have it."
                >
                    {loading ? 'Listing devices…' : 'Choose device…'}
                </button>
            ) : (
                <Select
                    label="Audio output device"
                    value={selected}
                    options={[{ value: -1, label: 'System default' }, ...devices.map((d, i) => ({ value: i, label: d.label || `Device ${i + 1}` }))]}
                    onChange={(i) => {
                        setSelected(i);
                        void api?.setOutputDevice(i < 0 ? null : devices[i]);
                    }}
                />
            )}
        </>
    );
};

const SettingRow: React.FC<{ entry: SchemaEntry; settings: PlaygroundSettings; quick?: boolean }> = ({ entry, settings, quick }) => {
    const module = useAlphaTabModule();
    const value = settings.valueOf(entry);
    const overridden = settings.isOverridden(entry);
    if (value === undefined) { return null; }
    const set = (v: SettingValue) => settings.setValue(entry, v);
    const { control } = entry;

    let input: React.ReactNode;
    switch (control.type) {
        case 'toggle':
            input = <Switch label={entry.label} value={value as boolean} onChange={set} />;
            break;
        case 'range':
            input = (
                <Slider
                    label={entry.label}
                    value={value as number}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    unit={control.unit}
                    format={control.format}
                    onChange={set}
                />
            );
            break;
        case 'number':
            input = <NumberField label={entry.label} value={value as number} min={control.min} max={control.max} step={control.step} onChange={set} />;
            break;
        case 'enum':
            input = <Select label={entry.label} value={value as number} options={control.options} onChange={set} />;
            break;
        case 'segmented':
            input = (
                <Segmented<string>
                    label={entry.label}
                    value={String(value)}
                    onChange={set}
                    options={control.options.map((o) => ({ v: o.value, l: o.label }))}
                />
            );
            break;
        case 'color':
            input = <ColorField label={entry.label} value={value as string} onChange={set} />;
            break;
        case 'text':
            input = <TextField label={entry.label} value={String(value)} placeholder={control.placeholder} onChange={set} />;
            break;
        case 'font':
            input = (
                <FontField
                    label={entry.label}
                    value={value as string}
                    onChange={set}
                    validate={(v) => !!module?.model.Font.fromJson(v)}
                />
            );
            break;
    }

    return (
        <div className={clsx(styles.row, quick && styles.rowQuick, control.type === 'font' && styles.rowStacked)}>
            <span className={styles.rowLabel} title={entry.description}>
                {overridden && <span className={styles.changedDot} role="img" aria-label="changed" />}
                {entry.label}
            </span>
            <div className={styles.rowControl}>
                {input}
                {overridden && (
                    <button type="button" className={styles.rowReset} onClick={() => settings.resetValue(entry)} title="Reset to default" aria-label={`Reset ${entry.label}`}>
                        <IconReset size={11} />
                    </button>
                )}
            </div>
        </div>
    );
};
