/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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

using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Util;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This ScoreImporter can read Guitar Pro 6 (gpx) files.
    /// </summary>
    public class GpxImporter : ScoreImporter
    {
        public override string Name { get { return "Guitar Pro 6"; } }

        public override Score ReadScore()
        {
            // at first we need to load the binary file system 
            // from the GPX container
            Logger.Info(Name, "Loading GPX filesystem");
            var fileSystem = new GpxFileSystem();
            fileSystem.FileFilter = s => s == GpxFileSystem.ScoreGpif;
            fileSystem.Load(Data);
            Logger.Info(Name, "GPX filesystem loaded");

            // convert data to string
            var data = fileSystem.Files[0].Data;
            var xml = Platform.Platform.ToString(data);

            // lets set the fileSystem to null, maybe the garbage collector will come along
            // and kick the fileSystem binary data before we finish parsing
            fileSystem.Files = null;
            fileSystem = null;

            // the score.gpif file within this filesystem stores
            // the score information as XML we need to parse.
            Logger.Info(Name, "Start Parsing score.gpif");
            var parser = new GpxParser();
            parser.ParseXml(xml);
            Logger.Info(Name, "score.gpif parsed");

            return parser.Score;
        }
    }
}
