import { AlphaTabError, AlphaTabErrorType } from '@src/AlphaTabError';
import { IOHelper } from '@src/io/IOHelper';
import type { IReadable } from '@src/io/IReadable';

export class OggPacket {
    public packetData: Uint8Array;
    public isBeginningOfStream: boolean;
    public isEndOfStream: boolean;
    public granulePosition: number | null;

    public constructor(
        data: Uint8Array,
        isBeginOfStream: boolean,
        isEndOfStream: boolean,
        granulePosition: number | null
    ) {
        this.packetData = data;
        this.isBeginningOfStream = isBeginOfStream;
        this.isEndOfStream = isEndOfStream;
        this.granulePosition = isEndOfStream ? granulePosition : null;
    }

    public addData(newData: Uint8Array) {
        const oldData = this.packetData;
        const newBuffer = new Uint8Array(oldData.length + newData.length);
        newBuffer.set(oldData, 0);
        newBuffer.set(newData, oldData.length);
    }
}

enum PageFlags {
    ContinuesPacket = 1,
    BeginningOfStream = 2,
    EndOfStream = 4
}

export class OggReader {
    private _readable: IReadable;

    public constructor(readable: IReadable) {
        this._readable = readable;
    }

    public read(): OggPacket[] {
        const packets: OggPacket[] = [];
        while (this.findAndReadPage(packets)) {}
        return packets;
    }

    private findAndReadPage(packets: OggPacket[]): boolean {
        if (!this.seekPageHeader()) {
            return false;
        }

        return this.readPage(packets);
    }

    private seekPageHeader(): boolean {
        // search for sync byte (max 64KB)
        for (let i = 0; i < 65536; i++) {
            const magic = IOHelper.readInt32LE(this._readable);
            if (magic === 0x5367674f) {
                return true;
            }
            this._readable.position -= 3;
        }

        return false;
    }

    private readPage(packets: OggPacket[]): boolean {
        const version = this._readable.readByte();
        if (version === -1 || version !== 0) {
            return false;
        }

        const pageFlags = this._readable.readByte();
        const pageGranulePosition = IOHelper.readInt64LE(this._readable); // GranulePosition
        this._readable.skip(4); // StreamSerial
        this._readable.skip(4); // SequenceNumber
        this._readable.skip(4); // Crc

        const segmentCount = this._readable.readByte();
        if (segmentCount === -1) {
            return false;
        }

        const packetSizes: number[] = [];
        let packetIndex = 0;
        for (let i = 0; i < segmentCount; i++) {
            const size = this._readable.readByte();

            // ensure packet size exists and add size
            if (packetIndex === packetSizes.length) {
                packetSizes.push(0);
            }
            packetSizes[packetIndex] += size;

            // net packet if current one was not full
            if (size < 255) {
                packetIndex++;
            }
        }

        for (let i = 0; i < packetSizes.length; i++) {
            const packetData = new Uint8Array(packetSizes[i]);
            const c = this._readable.read(packetData, 0, packetData.length);
            if (c !== packetData.length) {
                return false;
            }

            if ((pageFlags & PageFlags.ContinuesPacket) !== 0) {
                if (packets.length === 0) {
                    throw new AlphaTabError(
                        AlphaTabErrorType.Format,
                        'OGG: Continuation page without any previous packets'
                    );
                }
                packets[packets.length - 1].addData(packetData);
            } else {
                const packet = new OggPacket(
                    packetData,
                    (pageFlags & PageFlags.BeginningOfStream) !== 0 && i === 0,
                    (pageFlags & PageFlags.EndOfStream) !== 0 && i === packetSizes.length - 1,
                    pageGranulePosition
                );
                packets.push(packet);
            }
        }

        return true;
    }
}
