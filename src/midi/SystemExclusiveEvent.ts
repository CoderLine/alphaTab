import { SystemCommonEvent } from '@src/midi/SystemCommonEvent';
import { IWriteable } from '@src/io/IWriteable';

export class SystemExclusiveEvent extends SystemCommonEvent {
    public data: Uint8Array;

    public get manufacturerId(): number {
        return this.message >> 8;
    }

    public constructor(delta: number, status: number, id: number, data: Uint8Array) {
        super(delta, status, id & 0x00ff, (id >> 8) & 0xff);
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
}
