export class VorbisStream {
    public audioChannels: number = 0;
    public audioSampleRate: number = 0;
    public samples: Float32Array = new Float32Array(0);
    public bitrateMaximum: number = 0;
    public bitrateNominal: number = 0;
    public bitrateMinimum: number = 0;
    public blocksize0: number = 0;
    public blocksize1: number = 0;
}
