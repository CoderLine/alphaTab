// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';
import { SystemExclusiveEvent } from '@src/midi/SystemExclusiveEvent';

export class SynthEvent {
    public eventIndex: number;
    public event: MidiEvent;
    public readonly isMetronome: boolean;
    public time: number = 0;

    public constructor(eventIndex: number, e: MidiEvent) {
        this.eventIndex = eventIndex;
        this.event = e;
        this.isMetronome = this.event instanceof SystemExclusiveEvent && (this.event as SystemExclusiveEvent).isMetronome;
    }


    public static newMetronomeEvent(eventIndex: number, tick: number, counter: number, durationInTicks: number, durationInMillis: number): SynthEvent {
        const evt = new SystemExclusiveEvent(0, tick,
            MidiEventType.SystemExclusive2,
            SystemExclusiveEvent.AlphaTabManufacturerId,
            SystemExclusiveEvent.encodeMetronome(counter, durationInTicks, durationInMillis)
        );
        const x: SynthEvent = new SynthEvent(eventIndex, evt);
        return x;
    }
}
