// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0
import { Region } from '@src/synth/synthesis/Region';

export class Preset {
    public name: string = "";
    public presetNumber: number = 0;
    public bank: number = 0;
    public regions: Region[] | null = null;
    public fontSamples: Float32Array | null = null;
}
