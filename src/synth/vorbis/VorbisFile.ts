import type { IReadable } from '@src/io/IReadable';
import { OggReader } from './OggReader';
import type { VorbisStream } from './VorbisStream';
import { VorbisStreamReader } from './VorbisStreamReader';

export class VorbisFile {
    public streams: VorbisStream[] = [];

    public constructor(readable: IReadable) {
        const oggContainer = new OggReader(readable);
        const packets = oggContainer.read();

        const decoder = new VorbisStreamReader(packets);
        while (true) {
            let stream = decoder.read();
            if (stream == null) {
                break;
            }
            this.streams.push(stream);
        }
    }
}
