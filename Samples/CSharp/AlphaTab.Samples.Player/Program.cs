/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Util;
using SkiaSharp;

namespace AlphaTab.Samples.PngDump
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 2)
            {
                Console.WriteLine("Usage AlphaTab.ScoreDump.exe PathToFile PathToSoundFont");
                return;
            }

            // load score
            var score = ScoreLoader.LoadScoreFromBytes(File.ReadAllBytes(args[0]));

            // generate midi
            var midiFile = new MidiFile();
            var handler = new AlphaSynthMidiFileHandler(midiFile);
            var generator = new MidiFileGenerator(score, null, handler);
            generator.Generate();

            var player = new AlphaSynth(new NAudioSynthOutput());
            player.MidiLoaded += () => { Console.WriteLine("Midi loaded"); };
            player.SoundFontLoaded += () => { Console.WriteLine("SoundFont loaded"); };
            player.MidiLoadFailed += e => { Console.WriteLine("Midi load failed"); };
            player.SoundFontLoadFailed += e => { Console.WriteLine("SoundFont load failed"); };
            player.Finished += _ =>
            {
                Console.WriteLine("Playback finished");
                ((NAudioSynthOutput)player.Output).Close();
            };
            player.PositionChanged += e =>
            {
                TimeSpan currentTime = TimeSpan.FromMilliseconds(e.CurrentTime);
                TimeSpan endTime = TimeSpan.FromMilliseconds(e.EndTime);

                Console.CursorTop--;
                Console.Write("".PadLeft(Console.BufferWidth - 1, ' '));
                Console.CursorLeft = 0;
                Console.WriteLine("{0:mm\\:ss\\:fff} ({1}) of {2:mm\\:ss\\:fff} ({3})",
                    currentTime, e.CurrentTick, endTime, e.EndTick);
            };
            player.ReadyForPlayback += () =>
            {
                Console.WriteLine("Ready for playback");
            };
            player.LoadSoundFont(File.ReadAllBytes(args[1]));
            player.LoadMidiFile(midiFile);

            Console.WriteLine("Start playing");
            player.Play();

            Console.WriteLine("Press enter to exit");
            Console.ReadLine();

            player.Pause();

            Console.ReadLine();
        }
    }
}
