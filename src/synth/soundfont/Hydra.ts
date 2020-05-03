// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)
// TypeScript port for alphaTab: (C) 2020 by Daniel Kuschny
// Licensed under: MPL-2.0

import { RiffChunk } from '@src/synth/soundfont/RiffChunk';

import { IOHelper } from '@src/io/IOHelper';
import { IReadable } from '@src/io/IReadable';
import { TypeConversions } from '@src/io/TypeConversions';

import { FormatError } from '@src/FormatError';

export class Hydra {
    public phdrs: HydraPhdr[] = [];
    public pbags: HydraPbag[] = [];
    public pmods: HydraPmod[] = [];
    public pgens: HydraPgen[] = [];
    public insts: HydraInst[] = [];
    public ibags: HydraIbag[] = [];
    public imods: HydraImod[] = [];
    public igens: HydraIgen[] = [];
    public sHdrs: HydraShdr[] = [];

    public fontSamples: Float32Array = new Float32Array(0);

    public load(readable: IReadable): void {
        const chunkHead: RiffChunk = new RiffChunk();
        const chunkFastList: RiffChunk = new RiffChunk();
        if (!RiffChunk.load(null, chunkHead, readable) || chunkHead.id !== 'sfbk') {
            throw new FormatError("Soundfont is not a valid Soundfont2 file")
        }

        while (RiffChunk.load(chunkHead, chunkFastList, readable)) {

            let chunk: RiffChunk = new RiffChunk();
            if (chunkFastList.id === 'pdta') {
                while (RiffChunk.load(chunkFastList, chunk, readable)) {
                    switch (chunk.id) {
                        case 'phdr':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraPhdr.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.phdrs.push(new HydraPhdr(readable));
                            }
                            break;
                        case 'pbag':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraPbag.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.pbags.push(new HydraPbag(readable));
                            }
                            break;
                        case 'pmod':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraPmod.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.pmods.push(new HydraPmod(readable));
                            }
                            break;
                        case 'pgen':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraPgen.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.pgens.push(new HydraPgen(readable));
                            }
                            break;
                        case 'inst':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraInst.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.insts.push(new HydraInst(readable));
                            }
                            break;
                        case 'ibag':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraIbag.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.ibags.push(new HydraIbag(readable));
                            }
                            break;
                        case 'imod':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraImod.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.imods.push(new HydraImod(readable));
                            }
                            break;
                        case 'igen':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraIgen.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.igens.push(new HydraIgen(readable));
                            }
                            break;
                        case 'shdr':
                            for (
                                let i: number = 0, count: number = (chunk.size / HydraShdr.SizeInFile) | 0;
                                i < count;
                                i++
                            ) {
                                this.sHdrs.push(new HydraShdr(readable));
                            }
                            break;
                        default:
                            readable.position += chunk.size;
                            break;
                    }
                }
            } else if (chunkFastList.id === 'sdta') {
                while (RiffChunk.load(chunkFastList, chunk, readable)) {
                    switch (chunk.id) {
                        case 'smpl':
                            this.fontSamples = Hydra.loadSamples(chunk, readable);
                            break;
                        default:
                            readable.position += chunk.size;
                            break;
                    }
                }
            } else {
                readable.position += chunkFastList.size;
            }
        }
    }

    private static loadSamples(chunk: RiffChunk, reader: IReadable): Float32Array {
        let samplesLeft: number = (chunk.size / 2) | 0;
        const samples: Float32Array = new Float32Array(samplesLeft);
        let samplesPos: number = 0;
        
        const sampleBuffer: Uint8Array = new Uint8Array(2048);
        const testBuffer: Int16Array = new Int16Array((sampleBuffer.length / 2) | 0);
        while (samplesLeft > 0) {
            let samplesToRead: number = Math.min(samplesLeft, (sampleBuffer.length / 2) | 0);
            reader.read(sampleBuffer, 0, samplesToRead * 2);
            for (let i: number = 0; i < samplesToRead; i++) {
                testBuffer[i] = (sampleBuffer[i * 2 + 1] << 8) | sampleBuffer[i * 2];
                samples[samplesPos + i] = testBuffer[i] / 32767;
            }
            samplesLeft -= samplesToRead;
            samplesPos += samplesToRead;
        }
        return samples;
    }
}

export class HydraIbag {
    public static readonly SizeInFile: number = 4;

    public instGenNdx: number;
    public instModNdx: number;

    public constructor(reader: IReadable) {
        this.instGenNdx = IOHelper.readUInt16LE(reader);
        this.instModNdx = IOHelper.readUInt16LE(reader);
    }
}

export class HydraImod {
    public static readonly SizeInFile: number = 10;

    public modSrcOper: number;
    public modDestOper: number;
    public modAmount: number;
    public modAmtSrcOper: number;
    public modTransOper: number;

    public constructor(reader: IReadable) {
        this.modSrcOper = IOHelper.readUInt16LE(reader);
        this.modDestOper = IOHelper.readUInt16LE(reader);
        this.modAmount = IOHelper.readInt16LE(reader);
        this.modAmtSrcOper = IOHelper.readUInt16LE(reader);
        this.modTransOper = IOHelper.readUInt16LE(reader);
    }
}

export class HydraIgen {
    public static readonly SizeInFile: number = 4;

    public genOper: number;
    public genAmount: HydraGenAmount;

    public constructor(reader: IReadable) {
        this.genOper = IOHelper.readUInt16LE(reader);
        this.genAmount = new HydraGenAmount(reader);
    }
}

export class HydraInst {
    public static readonly SizeInFile: number = 22;

    public instName: string;
    public instBagNdx: number;

    public constructor(reader: IReadable) {
        this.instName = IOHelper.read8BitStringLength(reader, 20);
        this.instBagNdx = IOHelper.readUInt16LE(reader);
    }
}

export class HydraPbag {
    public static readonly SizeInFile: number = 4;

    public genNdx: number;
    public modNdx: number;

    public constructor(reader: IReadable) {
        this.genNdx = IOHelper.readUInt16LE(reader);
        this.modNdx = IOHelper.readUInt16LE(reader);
    }
}

export class HydraPgen {
    public static readonly SizeInFile: number = 4;
    public static readonly GenInstrument: number = 41;
    public static readonly GenKeyRange: number = 43;
    public static readonly GenVelRange: number = 44;
    public static readonly GenSampleId: number = 53;

    public genOper: number;
    public genAmount: HydraGenAmount;

    public constructor(reader: IReadable) {
        this.genOper = IOHelper.readUInt16LE(reader);
        this.genAmount = new HydraGenAmount(reader);
    }
}

export class HydraPhdr {
    public static readonly SizeInFile: number = 38;

    public presetName: string;
    public preset: number;
    public bank: number;
    public presetBagNdx: number;
    public library: number;
    public genre: number;
    public morphology: number;

    public constructor(reader: IReadable) {
        this.presetName = IOHelper.read8BitStringLength(reader, 20);
        this.preset = IOHelper.readUInt16LE(reader);
        this.bank = IOHelper.readUInt16LE(reader);
        this.presetBagNdx = IOHelper.readUInt16LE(reader);
        this.library = IOHelper.readUInt32LE(reader);
        this.genre = IOHelper.readUInt32LE(reader);
        this.morphology = IOHelper.readUInt32LE(reader);
    }
}

export class HydraPmod {
    public static readonly SizeInFile: number = 10;

    public modSrcOper: number;
    public modDestOper: number;
    public modAmount: number;
    public modAmtSrcOper: number;
    public modTransOper: number;

    public constructor(reader: IReadable) {
        this.modSrcOper = IOHelper.readUInt16LE(reader);
        this.modDestOper = IOHelper.readUInt16LE(reader);
        this.modAmount = IOHelper.readUInt16LE(reader);
        this.modAmtSrcOper = IOHelper.readUInt16LE(reader);
        this.modTransOper = IOHelper.readUInt16LE(reader);
    }
}

export class HydraShdr {
    public static readonly SizeInFile: number = 46;

    public sampleName: string;
    public start: number;
    public end: number;
    public startLoop: number;
    public endLoop: number;
    public sampleRate: number;
    public originalPitch: number;
    public pitchCorrection: number;
    public sampleLink: number;
    public sampleType: number;

    public constructor(reader: IReadable) {
        this.sampleName = IOHelper.read8BitStringLength(reader, 20);
        this.start = IOHelper.readUInt32LE(reader);
        this.end = IOHelper.readUInt32LE(reader);
        this.startLoop = IOHelper.readUInt32LE(reader);
        this.endLoop = IOHelper.readUInt32LE(reader);
        this.sampleRate = IOHelper.readUInt32LE(reader);
        this.originalPitch = reader.readByte();
        this.pitchCorrection = IOHelper.readSInt8(reader);
        this.sampleLink = IOHelper.readUInt16LE(reader);
        this.sampleType = IOHelper.readUInt16LE(reader);
    }
}

export class HydraGenAmount {
    public wordAmount: number;

    public get shortAmount(): number {
        return TypeConversions.uint16ToInt16(this.wordAmount);
    }

    public get lowByteAmount(): number {
        return this.wordAmount & 0x00ff;
    }

    public get highByteAmount(): number {
        return ((this.wordAmount & 0xff00) >> 8) & 0xff;
    }

    public constructor(reader: IReadable) {
        this.wordAmount = IOHelper.readUInt16LE(reader);
    }
}
