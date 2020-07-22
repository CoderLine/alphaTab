// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0

import { Channel } from '@src/synth/synthesis/Channel';
import { TinySoundFont } from '@src/synth/synthesis/TinySoundFont';
import { Voice } from '@src/synth/synthesis/Voice';

export class Channels {
    public activeChannel: number = 0;
    public channelList: Channel[] = [];

    public setupVoice(tinySoundFont: TinySoundFont, voice: Voice): void {
        const c: Channel = this.channelList[this.activeChannel];
        const newpan: number = voice.region!.pan + c.panOffset;
        voice.playingChannel = this.activeChannel;
        voice.mixVolume = c.mixVolume;
        voice.noteGainDb += c.gainDb;

        voice.updatePitchRatio(c, tinySoundFont.outSampleRate);
        
        if (newpan <= -0.5) {
            voice.panFactorLeft = 1.0;
            voice.panFactorRight = 0.0;
        } else if (newpan >= 0.5) {
            voice.panFactorLeft = 0.0;
            voice.panFactorRight = 1.0;
        } else {
            voice.panFactorLeft = Math.sqrt(0.5 - newpan);
            voice.panFactorRight = Math.sqrt(0.5 + newpan);
        }
    }
}
