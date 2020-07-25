// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0

/**
 * Supported output modes by the render methods
 */
export enum OutputMode {
    /**
     * Two channels with single left/right samples one after another
     */
    StereoInterleaved,
    /**
     * Two channels with all samples for the left channel first then right
     */
    StereoUnweaved,
    /**
     * A single channel (stereo instruments are mixed into center)
     */
    Mono
}
