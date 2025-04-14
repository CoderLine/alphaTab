// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { AlphaTabMetronomeEvent, type MidiEvent, MidiEventType } from '@src/midi/MidiEvent';

export class SynthEvent {
    public eventIndex: number;
    public event: MidiEvent;
    public readonly isMetronome: boolean;
    public time: number = 0;

    public constructor(eventIndex: number, e: MidiEvent) {
        this.eventIndex = eventIndex;
        this.event = e;
        this.isMetronome = this.event.type === MidiEventType.AlphaTabMetronome;
    }

    public static newMetronomeEvent(
        eventIndex: number,
        tick: number,
        counter: number,
        durationInTicks: number,
        durationInMillis: number
    ): SynthEvent {
        const evt = new AlphaTabMetronomeEvent(0, tick, counter, durationInTicks, durationInMillis);
        const x: SynthEvent = new SynthEvent(eventIndex, evt);
        return x;
    }
}
