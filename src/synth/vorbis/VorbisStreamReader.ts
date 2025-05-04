/*
 * Vorbis Stream Reader according to https://xiph.org/vorbis/doc/Vorbis_I_spec.html
 */

import { ByteBuffer } from '@src/io/ByteBuffer';
import type { OggPacket } from '@src/synth/vorbis/OggReader';
import { VorbisStream } from '@src/synth/vorbis/VorbisStream';
import { IOHelper } from '@src/io/IOHelper';
import {
    Huffman,
    Mdct,
    VorbisCodebook,
    VorbisFloor,
    VorbisMapping,
    VorbisMode,
    VorbisResidue,
    VorbisSetupHeader,
    VorbisStreamDecoder,
    VorbisTimeDomainTransform
} from '@src/synth/vorbis/VorbisStreamDecoder';
import { IntBitReader } from '@src/synth/vorbis/IntBitReader';

enum VorbisPacketTypes {
    IdentificationHeader = 1,
    Comment = 3,
    SetupHeader = 5
}

export class VorbisStreamReader {
    private static readonly VorbisHeaderMarker = new Uint8Array([
        'v'.charCodeAt(0),
        'o'.charCodeAt(0),
        'r'.charCodeAt(0),
        'b'.charCodeAt(0),
        'i'.charCodeAt(0),
        's'.charCodeAt(0)
    ]);

    private readonly _packets: OggPacket[];
    private _packetIndex: number;

    public constructor(packets: OggPacket[]) {
        this._packetIndex = -1;
        this._packets = packets;
    }

    public read(): VorbisStream | null {
        let packet: OggPacket | null;
        while (true) {
            packet = this.nextPacket();
            if (packet == null) {
                return null;
            }

            if (packet.isBeginningOfStream) {
                const stream = this.readStream(packet);
                if (stream != null) {
                    return stream;
                }
            }
        }
    }

    private nextPacket(): OggPacket | null {
        this._packetIndex++;
        return this._packetIndex < this._packets.length ? this._packets[this._packetIndex] : null;
    }

    private readStream(startPacket: OggPacket): VorbisStream | null {
        // Read vorbis stream info
        const stream = new VorbisStream();

        if (!this.readIdentificationHeader(stream, startPacket)) {
            return null;
        }

        if (!this.readComments(this.nextPacket())) {
            return null;
        }

        const vorbisSetup = new VorbisSetupHeader();
        if (!this.readSetupHeader(stream, vorbisSetup, this.nextPacket())) {
            return null;
        }

        // collect data packets for stream
        const streamDataPackets: OggPacket[] = [];
        let packet: OggPacket | null;
        while (true) {
            packet = this.nextPacket();
            if (packet == null) {
                break;
            }
            streamDataPackets.push(packet);
            if (packet.isEndOfStream) {
                break;
            }
        }

        // decode samples
        const decoder = new VorbisStreamDecoder(stream, vorbisSetup, streamDataPackets);
        stream.samples = decoder.decode();

        return stream;
    }

    /**
     * https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-610004.2
     * @param packetType
     * @param reader
     * @returns
     */
    private comonHeaderDecode(packetType: VorbisPacketTypes, reader: ByteBuffer) {
        const data = new Uint8Array(7);
        reader.read(data, 0, data.length);

        if (data[0] !== packetType) {
            return false;
        }

        for (let i = 0; i < VorbisStreamReader.VorbisHeaderMarker.length; i++) {
            if (data[1 + i] !== VorbisStreamReader.VorbisHeaderMarker[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-610004.2
     * @param packetType
     * @param reader
     * @returns
     */
    private comonHeaderDecodeBit(packetType: VorbisPacketTypes, reader: IntBitReader) {
        const data = reader.readBytes(7);

        if (data[0] !== packetType) {
            return false;
        }

        for (let i = 0; i < VorbisStreamReader.VorbisHeaderMarker.length; i++) {
            if (data[1 + i] !== VorbisStreamReader.VorbisHeaderMarker[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-630004.2.2
     * @param stream
     * @param packet
     * @returns
     */
    private readIdentificationHeader(stream: VorbisStream, packet: OggPacket) {
        const reader = ByteBuffer.fromBuffer(packet.packetData);

        if (!this.comonHeaderDecode(VorbisPacketTypes.IdentificationHeader, reader)) {
            return false;
        }

        const version = IOHelper.readUInt32LE(reader);
        // [vorbis_version] is to read ’0’ in order to be compatible with this document.
        if (version !== 0) {
            return false;
        }

        stream.audioChannels = reader.readByte();
        stream.audioSampleRate = IOHelper.readUInt32LE(reader);

        // Both [audio_channels] and [audio_sample_rate] must read greater than zero.
        if (stream.audioChannels <= 0 || stream.audioSampleRate <= 0) {
            return false;
        }

        stream.bitrateMaximum = IOHelper.readInt32LE(reader);
        stream.bitrateNominal = IOHelper.readInt32LE(reader);
        stream.bitrateMinimum = IOHelper.readInt32LE(reader);

        const blockSize = reader.readByte();
        stream.blocksize0 = 1 << (blockSize & 0x0f);
        stream.blocksize1 = 1 << (blockSize >> 4);
        if (
            //  [blocksize_0] must be less than or equal to [blocksize_1].
            stream.blocksize0 > stream.blocksize1 ||
            !VorbisStreamReader.isAllowedBlockSize(stream.blocksize0) ||
            !VorbisStreamReader.isAllowedBlockSize(stream.blocksize0)
        ) {
            return false;
        }

        // The framing bit must be nonzero.
        const framing = reader.readByte();
        if (framing === 0) {
            return false;
        }

        return true;
    }

    private static isAllowedBlockSize(blocksize: number) {
        // Allowed final blocksize values are 64, 128, 256, 512, 1024, 2048, 4096 and 8192 in Vorbis I.
        switch (blocksize) {
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
                return true;

            default:
                return false;
        }
    }

    /**
     * https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-820005
     * @param packet
     * @returns
     */
    private readComments(packet: OggPacket | null) {
        if (packet == null) {
            return false;
        }

        const reader = ByteBuffer.fromBuffer(packet.packetData);
        if (!this.comonHeaderDecode(VorbisPacketTypes.Comment, reader)) {
            return false;
        }

        const vendorLength = IOHelper.readUInt32LE(reader);
        reader.skip(vendorLength); // vendor (unused)

        const userCommentListLength = IOHelper.readUInt32LE(reader);
        for (let index = 0; index < userCommentListLength; index++) {
            const length = IOHelper.readUInt32LE(reader);
            reader.skip(length); // comment (unused)
        }

        const framing = reader.readByte();
        if (framing === 0) {
            return false;
        }

        return true;
    }

    /**
     * https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-650004.2.4
     * @param setup
     * @param packet
     * @returns
     */
    private readSetupHeader(stream: VorbisStream, setup: VorbisSetupHeader, packet: OggPacket | null) {
        if (packet == null) {
            return false;
        }

        const bitReader = new IntBitReader(ByteBuffer.fromBuffer(packet.packetData));

        const mdct = new Mdct();
        const huffman = new Huffman();

        if (!this.comonHeaderDecodeBit(VorbisPacketTypes.SetupHeader, bitReader)) {
            return false;
        }

        let count = bitReader.readByte() + 1;
        for (let i = 0; i < count; i++) {
            setup.codebooks.push(new VorbisCodebook(bitReader, huffman));
        }

        count = bitReader.readBits(6) + 1;
        for (let i = 0; i < count; i++) {
            setup.timeDomainTransforms.push(new VorbisTimeDomainTransform(bitReader));
        }

        count = bitReader.readBits(6) + 1;
        for (let i = 0; i < count; i++) {
            setup.floors.push(new VorbisFloor(bitReader, stream.blocksize0, stream.blocksize1, setup.codebooks));
        }

        count = bitReader.readBits(6) + 1;
        for (let i = 0; i < count; i++) {
            setup.residues.push(new VorbisResidue(bitReader, stream.audioChannels, setup.codebooks));
        }

        count = bitReader.readBits(6) + 1;
        for (let i = 0; i < count; i++) {
            setup.mappings.push(new VorbisMapping(bitReader, stream.audioChannels, setup.floors, setup.residues, mdct));
        }

        count = bitReader.readBits(6) + 1;
        for (let i = 0; i < count; i++) {
            setup.modes.push(
                new VorbisMode(bitReader, stream.audioChannels, stream.blocksize0, stream.blocksize1, setup.mappings)
            );
        }

        if (!bitReader.readBit()) {
            return false;
        }

        return true;
    }
}
