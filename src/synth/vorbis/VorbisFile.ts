import { IReadable } from '@src/io/IReadable';
import { OggReader } from './OggReader';
import { VorbisStream } from './VorbisStream';
import { VorbisStreamReader } from './VorbisStreamReader';

export class VorbisFile {
    public streams: VorbisStream[] = [];

    public constructor(readable: IReadable) {
        var oggContainer = new OggReader(readable);
        var packets = oggContainer.read();

        var decoder = new VorbisStreamReader(packets);
        while(true){
            let stream = decoder.read();
            if(stream == null){
                break;
            }
            else{
                this.streams.push(stream);
            }
        }
    }
}
