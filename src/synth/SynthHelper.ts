// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0

export class SynthHelper {
    public static timecents2Secs(timecents: number): number {
        return Math.pow(2, timecents / 1200.0);
    }

    public static decibelsToGain(db: number): number {
        return db > -100 ? Math.pow(10.0, db * 0.05) : 0;
    }

    public static gainToDecibels(gain: number): number {
        return gain <= 0.00001 ? -100 : 20.0 * Math.log10(gain);
    }

    public static cents2Hertz(cents: number): number {
        return 8.176 * Math.pow(2.0, cents / 1200.0);
    }

    public static clamp(value: number, min: number, max: number): number {
        if (value <= min) {
            return min;
        }
        if (value >= max) {
            return max;
        }
        return value;
    }
}
