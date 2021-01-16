// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { MidiEvent, MidiEventType } from '@src/midi/MidiEvent';
import { AlphaTabSystemExclusiveEvents, SystemExclusiveEvent } from '@src/midi/SystemExclusiveEvent';

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


    private static readonly MetronomeTickData: Uint8Array = new Uint8Array([AlphaTabSystemExclusiveEvents.MetronomeTick]);
    public static newMetronomeEvent(eventIndex: number, counter:number): SynthEvent {
        const evt = new SystemExclusiveEvent(0, counter, MidiEventType.SystemExclusive2, SystemExclusiveEvent.AlphaTabManufacturerId, SynthEvent.MetronomeTickData);
        const x: SynthEvent = new SynthEvent(eventIndex, evt);
        return x;
    }
}
