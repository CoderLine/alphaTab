/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
using System.IO;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Model;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;

namespace AlphaTab.MidiDump
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.WriteLine("Usage AlphaTab.MidiDump.exe Path");
                return;
            }

            // load score
            Score score = ScoreLoader.LoadScore(args[0]);

            // generate midi
            MidiFile file = MidiFileGenerator.GenerateMidiFile(score);

            // write midi file
            string path = Path.ChangeExtension(args[0], "mid");
            using (var fs = new StreamWrapper(File.OpenWrite(path)))
            {
                file.WriteTo(fs);
            }
        }
    }
}
