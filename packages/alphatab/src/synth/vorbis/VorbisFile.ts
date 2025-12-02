import type { IReadable } from '@coderline/alphatab/io/IReadable';
import { OggReader } from '@coderline/alphatab/synth/vorbis/OggReader';
import type { VorbisStream } from '@coderline/alphatab/synth/vorbis/VorbisStream';
import { VorbisStreamReader } from '@coderline/alphatab/synth/vorbis/VorbisStreamReader';

/**
 * @internal
 */
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
