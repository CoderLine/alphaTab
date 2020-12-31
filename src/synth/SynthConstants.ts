// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
export class SynthConstants {
    public static readonly DefaultChannelCount: number = 16 + 1;
    public static readonly MetronomeChannel: number = SynthConstants.DefaultChannelCount - 1;
    public static readonly AudioChannels: number = 2;
    public static readonly MinVolume: number = 0;
    public static readonly MinProgram: number = 0;
    public static readonly MaxProgram: number = 127;
    public static readonly MinPlaybackSpeed: number = 0.125;
    public static readonly MaxPlaybackSpeed: number = 8;

    /**
     * The Midi Pitch bend message is a 15-bit value
     */
    public static readonly MaxPitchWheel: number = 0x4000;

    /**
     * The Midi 2.0 Pitch bend message is a 32-bit value
     */
    public static readonly MaxPitchWheel20: number = 0x100000000;
    /**
     * The pitch wheel value for no pitch change at all.
     */
    public static readonly DefaultPitchWheel: number = SynthConstants.MaxPitchWheel / 2;

    public static readonly MicroBufferCount: number = 32;
    public static readonly MicroBufferSize: number = 64;
}
