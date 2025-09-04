// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0

export class Channel {
    public presetIndex: number = 0;
    public bank: number = 0;
    public pitchWheel: number = 0;
    public perNotePitchWheel: Map<number, number> = new Map<number, number>();
    public midiPan: number = 0;
    public midiVolume: number = 0;
    public midiExpression: number = 0;
    public midiRpn: number = 0;
    public midiData: number = 0;
    public panOffset: number = 0;
    public gainDb: number = 0;
    public pitchRange: number = 0;
    public tuning: number = 0;
    public mixVolume: number = 0;
    public mute: boolean = false;
    public solo: boolean = false;
}
