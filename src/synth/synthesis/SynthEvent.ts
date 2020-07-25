// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { MidiEvent } from '@src/midi/MidiEvent';

export class SynthEvent {
    public eventIndex: number;
    public event: MidiEvent | null;
    public isMetronome: boolean = false;
    public time: number = 0;

    public constructor(eventIndex: number, e: MidiEvent | null) {
        this.eventIndex = eventIndex;
        this.event = e;
    }

    public static newMetronomeEvent(eventIndex: number): SynthEvent {
        const x: SynthEvent = new SynthEvent(eventIndex, null);
        x.isMetronome = true;
        return x;
    }
}
