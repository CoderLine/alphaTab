import { useAlphaTabApi } from '@coderline/alphatab-react';
import * as alphaTab from '@coderline/alphatab';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { downloadBytes, downloadMidi, exportAlphaTex, exportGp7, withExtension } from '../../state/exports';
import { IconClose, IconCode, IconDownload, IconFileMusic, IconPrinter, IconWaveform } from '../icons';
import { usePlayerControls, usePlayerSelector } from '../PlayerProvider';
import { IconButton } from '../primitives/icon-button';
import { Menu, MenuItem, MenuLabel } from '../primitives/menu';

export interface ExportMenuProps {
    /** Name of the open file; the downloads take it with their own extension. */
    fileName?: string;
}

/**
 * Downloads of the loaded score as Guitar Pro, alphaTex, MIDI and WAV, and printing. The WAV export
 * reports its progress and can be cancelled.
 */
export const ExportMenu: React.FC<ExportMenuProps> = ({ fileName = 'score' }) => {
    const api = useAlphaTabApi();
    const store = usePlayerControls();
    const currentScore = usePlayerSelector((s) => s.currentScore);
    const disabled = !api || !currentScore;
    const [audioProgress, setAudioProgress] = useState<number | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    useEffect(() => () => abortRef.current?.abort(), []);

    const exportAudio = async () => {
        if (!store) { return; }
        const abort = new AbortController();
        abortRef.current = abort;
        setAudioProgress(0);
        try {
            const wav = await store.exportAudio(setAudioProgress, abort.signal);
            downloadBytes(withExtension(fileName, 'wav'), wav, 'audio/wav');
        } catch (e) {
            if (!abort.signal.aborted) { console.error('[alphaTab-ui] Audio export failed', e); }
        } finally {
            if (abortRef.current === abort) { abortRef.current = null; }
            setAudioProgress(null);
        }
    };

    const midi = (format: alphaTab.midi.MidiFileFormat) => downloadMidi(api!, format);

    return (
        <>
            {audioProgress !== null && (
                <IconButton
                    label="Cancel the audio export"
                    text={`Audio ${Math.round(audioProgress * 100)}%`}
                    variant="outline"
                    onClick={() => abortRef.current?.abort()}
                >
                    <IconClose size={10} aria-hidden="true" />
                </IconButton>
            )}
            <Menu
                align="end"
                trigger={(props) => (
                    <IconButton label="Export" text="Export" variant="primary" disabled={disabled} {...props}>
                        <IconDownload size={14} aria-hidden="true" />
                    </IconButton>
                )}
            >
                {(close) => (
                    <>
                        <MenuLabel>Score</MenuLabel>
                        <MenuItem
                            icon={<IconFileMusic size={13} />}
                            detail=".gp"
                            title="Guitar Pro 7+, including the backing track and sync points"
                            onSelect={() => {
                                close();
                                downloadBytes(withExtension(fileName, 'gp'), exportGp7(api!));
                            }}
                        >
                            Guitar Pro
                        </MenuItem>
                        <MenuItem
                            icon={<IconCode size={13} />}
                            detail=".alphatex"
                            onSelect={() => {
                                close();
                                downloadBytes(withExtension(fileName, 'alphatex'), exportAlphaTex(api!), 'text/plain');
                            }}
                        >
                            alphaTex
                        </MenuItem>
                        <MenuItem
                            icon={<IconPrinter size={13} />}
                            onSelect={() => {
                                close();
                                api!.print();
                            }}
                        >
                            Print…
                        </MenuItem>
                        <MenuLabel>Audio</MenuLabel>
                        <MenuItem
                            icon={<IconWaveform size={12} />}
                            detail=".wav"
                            disabled={audioProgress !== null}
                            title="Renders the synthesizer with the current mix, metronome and playback range"
                            onSelect={() => {
                                close();
                                void exportAudio();
                            }}
                        >
                            Audio
                        </MenuItem>
                        <MenuItem
                            icon={<IconWaveform size={12} />}
                            detail=".mid"
                            title="One MIDI track with a channel per instrument"
                            onSelect={() => {
                                close();
                                midi(alphaTab.midi.MidiFileFormat.SingleTrackMultiChannel);
                            }}
                        >
                            MIDI
                        </MenuItem>
                        <MenuItem
                            icon={<IconWaveform size={12} />}
                            detail=".mid"
                            title="One MIDI track per instrument"
                            onSelect={() => {
                                close();
                                midi(alphaTab.midi.MidiFileFormat.MultiTrack);
                            }}
                        >
                            MIDI, track per instrument
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
};
