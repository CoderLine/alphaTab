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
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Util;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This ScoreImporter can read Guitar Pro 7 (gp) files.
    /// </summary>
    class Gp7Importer : ScoreImporter
    {
        public override string Name { get { return "Guitar Pro 7"; } }

        public override Score ReadScore()
        {
            // at first we need to load the binary file system 
            // from the GPX container
            Logger.Info(Name, "Loading ZIP entries");
            var fileSystem = new ZipFile();
            fileSystem.FileFilter = s => s.EndsWith(GpxFileSystem.ScoreGpif);
            try
            {
                fileSystem.Load(Data);
            }
            catch (Exception e)
            {
                throw new UnsupportedFormatException(e.Message);
            }
            Logger.Info(Name, "Zip entries loaded");

            // convert data to string
            var data = fileSystem.Entries[0].Data;
            var xml = Platform.Platform.ToString(data);

            // lets set the fileSystem to null, maybe the garbage collector will come along
            // and kick the fileSystem binary data before we finish parsing
            fileSystem.Entries = null;
            fileSystem = null;

            // the score.gpif file within this filesystem stores
            // the score information as XML we need to parse.
            Logger.Info(Name, "Start Parsing score.gpif");
            var parser = new GpifParser();
            parser.ParseXml(xml, Settings);
            Logger.Info(Name, "score.gpif parsed");

            return parser.Score;
        }
    }
}
