using System;
using System.Collections.Generic;
using AlphaTab.Collections;
using AlphaTab.IO;

namespace AlphaTab.Audio.Synth.SoundFont
{
    internal class Hydra
    {
        public FastList<HydraPhdr> Phdrs { get; set; }
        public FastList<HydraPbag> Pbags { get; set; }
        public FastList<HydraPmod> Pmods { get; set; }
        public FastList<HydraPgen> Pgens { get; set; }
        public FastList<HydraInst> Insts { get; set; }
        public FastList<HydraIbag> Ibags { get; set; }
        public FastList<HydraImod> Imods { get; set; }
        public FastList<HydraIgen> Igens { get; set; }
        public FastList<HydraShdr> SHdrs { get; set; }
        public float[] FontSamples { get; set; }

        public Hydra()
        {
            Phdrs = new FastList<HydraPhdr>();
            Pbags = new FastList<HydraPbag>();
            Pmods = new FastList<HydraPmod>();
            Pgens = new FastList<HydraPgen>();
            Insts = new FastList<HydraInst>();
            Ibags = new FastList<HydraIbag>();
            Imods = new FastList<HydraImod>();
            Igens = new FastList<HydraIgen>();
            SHdrs = new FastList<HydraShdr>();
        }

        public void Load(IReadable readable)
        {
            var chunkHead = new RiffChunk();
            var chunkFastList = new RiffChunk();

            if (!RiffChunk.Load(null, chunkHead, readable) || chunkHead.Id != "sfbk")
            {
                return;
            }

            while (RiffChunk.Load(chunkHead, chunkFastList, readable))
            {
                var chunk = new RiffChunk();
                if (chunkFastList.Id == "pdta")
                {
                    while (RiffChunk.Load(chunkFastList, chunk, readable))
                    {
                        switch (chunk.Id)
                        {
                            case "phdr":
                                for (uint i = 0, count = chunk.Size / HydraPhdr.SizeInFile; i < count; i++)
                                {
                                    Phdrs.Add(HydraPhdr.Load(readable));
                                }

                                break;
                            case "pbag":
                                for (uint i = 0, count = chunk.Size / HydraPbag.SizeInFile; i < count; i++)
                                {
                                    Pbags.Add(HydraPbag.Load(readable));
                                }

                                break;
                            case "pmod":
                                for (uint i = 0, count = chunk.Size / HydraPmod.SizeInFile; i < count; i++)
                                {
                                    Pmods.Add(HydraPmod.Load(readable));
                                }

                                break;
                            case "pgen":
                                for (uint i = 0, count = chunk.Size / HydraPgen.SizeInFile; i < count; i++)
                                {
                                    Pgens.Add(HydraPgen.Load(readable));
                                }

                                break;
                            case "inst":
                                for (uint i = 0, count = chunk.Size / HydraInst.SizeInFile; i < count; i++)
                                {
                                    Insts.Add(HydraInst.Load(readable));
                                }

                                break;
                            case "ibag":
                                for (uint i = 0, count = chunk.Size / HydraIbag.SizeInFile; i < count; i++)
                                {
                                    Ibags.Add(HydraIbag.Load(readable));
                                }

                                break;
                            case "imod":
                                for (uint i = 0, count = chunk.Size / HydraImod.SizeInFile; i < count; i++)
                                {
                                    Imods.Add(HydraImod.Load(readable));
                                }

                                break;
                            case "igen":
                                for (uint i = 0, count = chunk.Size / HydraIgen.SizeInFile; i < count; i++)
                                {
                                    Igens.Add(HydraIgen.Load(readable));
                                }

                                break;
                            case "shdr":
                                for (uint i = 0, count = chunk.Size / HydraShdr.SizeInFile; i < count; i++)
                                {
                                    SHdrs.Add(HydraShdr.Load(readable));
                                }

                                break;
                            default:
                                readable.Position += (int)chunk.Size;
                                break;
                        }
                    }
                }
                else if (chunkFastList.Id == "sdta")
                {
                    while (RiffChunk.Load(chunkFastList, chunk, readable))
                    {
                        switch (chunk.Id)
                        {
                            case "smpl":
                                FontSamples = LoadSamples(chunk, readable);
                                break;
                            default:
                                readable.Position += (int)chunk.Size;
                                break;
                        }
                    }
                }
                else
                {
                    readable.Position += (int)chunkFastList.Size;
                }
            }
        }

        private static float[] LoadSamples(RiffChunk chunk, IReadable reader)
        {
            var samplesLeft = (int)(chunk.Size / 2);
            var samples = new float[samplesLeft];
            var samplesPos = 0;

            var sampleBuffer = new byte[2048];
            var testBuffer = new short[sampleBuffer.Length / 2];
            while (samplesLeft > 0)
            {
                var samplesToRead = (int)Math.Min(samplesLeft, sampleBuffer.Length / 2);
                reader.Read(sampleBuffer, 0, samplesToRead * 2);
                for (var i = 0; i < samplesToRead; i++)
                {
                    testBuffer[i] = Platform.Platform.ToInt16((sampleBuffer[(i * 2) + 1] << 8) | sampleBuffer[(i * 2)]);
                    samples[samplesPos + i] = testBuffer[i] / 32767f;
                }

                samplesLeft -= samplesToRead;
                samplesPos += samplesToRead;
            }

            return samples;
        }
    }
}
