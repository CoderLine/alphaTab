// The SoundFont loading and Audio Synthesis is based on TinySoundFont, licensed under MIT,
// developed by Bernhard Schelling (https://github.com/schellingb/TinySoundFont)

// C# port for alphaTab: (C) 2019 by Daniel Kuschny
// Licensed under: MPL-2.0

/*
 * LICENSE (MIT)
 *
 * Copyright (C) 2017, 2018 Bernhard Schelling
 * Based on SFZero, Copyright (C) 2012 Steve Folta (https://github.com/stevefolta/SFZero)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
using System;
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
