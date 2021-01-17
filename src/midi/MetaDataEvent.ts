import { MetaEvent } from '@src/midi/MetaEvent';
import { MidiFile } from '@src/midi/MidiFile';
import { IWriteable } from '@src/io/IWriteable';

export class MetaDataEvent extends MetaEvent {
    public data: Uint8Array;

    public constructor(track:number, delta: number, status: number, metaId: number, data: Uint8Array) {
        super(track, delta, status, metaId, 0);
        this.data = data;
    }

    public writeTo(s: IWriteable): void {
        s.writeByte(0xff);
        s.writeByte(this.metaStatus as number);
        let l: number = this.data.length;
        MidiFile.writeVariableInt(s, l);
        s.write(this.data, 0, this.data.length);
    }
}
