// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
export class SynthConstants {
    public static readonly DefaultChannelCount: number = 16 + 1;
    public static readonly MetronomeChannel: number = SynthConstants.DefaultChannelCount - 1;
    public static readonly AudioChannels: number = 2;
    public static readonly MinVolume: number = 0;
    public static readonly MaxVolume: number = 1;
    public static readonly MinProgram: number = 0;
    public static readonly MaxProgram: number = 127;
    public static readonly MinPlaybackSpeed: number = 0.125;
    public static readonly MaxPlaybackSpeed: number = 8;
}
