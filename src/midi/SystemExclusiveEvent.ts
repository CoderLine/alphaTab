import { SystemCommonEvent } from '@src/midi/SystemCommonEvent';
import { IWriteable } from '@src/io/IWriteable';
import { ByteBuffer } from '@src/io/ByteBuffer';
import { IOHelper } from '@src/io/IOHelper';

export enum AlphaTabSystemExclusiveEvents {
    MetronomeTick = 0,
    Rest = 1
}

export class SystemExclusiveEvent extends SystemCommonEvent {
    public static readonly AlphaTabManufacturerId = 0x7D;

    public data: Uint8Array;

    public get isMetronome(): boolean {
        return this.manufacturerId == SystemExclusiveEvent.AlphaTabManufacturerId &&
            this.data[0] == AlphaTabSystemExclusiveEvents.MetronomeTick;
    }

    public get metronomeNumerator(): number {
        return this.isMetronome ? this.data[1] : -1;
    }

    public get metronomeDurationInTicks(): number {
        if (!this.isMetronome) {
            return -1;
        }
        return IOHelper.decodeUInt32LE(this.data, 2);
    }

    public get metronomeDurationInMilliseconds(): number {
        if (!this.isMetronome) {
            return -1;
        }
        return IOHelper.decodeUInt32LE(this.data, 6);
    }

    public get isRest(): boolean {
        return this.manufacturerId == SystemExclusiveEvent.AlphaTabManufacturerId &&
            this.data[0] == AlphaTabSystemExclusiveEvents.Rest;
    }

    public get manufacturerId(): number {
        return this.message >> 8;
    }

    public constructor(track: number, delta: number, status: number, id: number, data: Uint8Array) {
        super(track, delta, status, id & 0x00ff, (id >> 8) & 0xff);
        this.data = data;
    }

    public writeTo(s: IWriteable): void {
        s.writeByte(0xf0);
        let l: number = this.data.length + 2;
        s.writeByte(this.manufacturerId);
        let b: Uint8Array = new Uint8Array([(l >> 24) & 0xff, (l >> 16) & 0xff, (l >> 8) & 0xff, l & 0xff]);
        s.write(b, 0, b.length);
        s.writeByte(0xf7);
    }

    public static encodeMetronome(counter: number, durationInTicks: number, durationInMillis: number): Uint8Array {
        // [0] type
        // [1] counter
        // [2-5] durationInTicks
        // [6-9] durationInMillis
        const data = ByteBuffer.withCapacity(2 + 2 * 4);

        data.writeByte(AlphaTabSystemExclusiveEvents.MetronomeTick);
        data.writeByte(counter);
        IOHelper.writeInt32LE(data, durationInTicks);
        IOHelper.writeInt32LE(data, durationInMillis);

        return data.toArray();
    }
}
