import type { IReadable } from '@src/io/IReadable';
import { OggReader } from '@src/synth/vorbis/OggReader';
import type { VorbisStream } from '@src/synth/vorbis/VorbisStream';
import { VorbisStreamReader } from '@src/synth/vorbis/VorbisStreamReader';

export class VorbisFile {
    public streams: VorbisStream[] = [];

    public constructor(readable: IReadable) {
        const oggContainer = new OggReader(readable);
        const packets = oggContainer.read();

        const decoder = new VorbisStreamReader(packets);
        while (true) {
            const stream = decoder.read();
            if (stream == null) {
                break;
            }
            this.streams.push(stream);
        }
    }
}
