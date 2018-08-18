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
using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Platform;
using AlphaTab.Util;

namespace AlphaTab.Importer
{
    /// <summary>
    /// The ScoreLoader enables you easy loading of Scores using all 
    /// available importers
    /// </summary>
    public partial class ScoreLoader
    {
        /// <summary>
        /// Loads the score from the given binary data. 
        /// </summary>
        /// <param name="data">The binary data containing a score in any known file format. </param>
        /// <param name="settings">The settings to use during importing. </param>
        /// <returns>The loaded score.</returns>
        public static Score LoadScoreFromBytes(byte[] data, Settings settings = null)
        {
            var importers = ScoreImporter.BuildImporters();

            Logger.Info("ScoreLoader", "Loading score from " + data.Length + " bytes using " + importers.Length + " importers");

            Score score = null;
            ByteBuffer bb = ByteBuffer.FromBuffer(data);
            foreach (var importer in importers)
            {
                bb.Reset();
                try
                {
                    Logger.Info("ScoreLoader", "Importing using importer " + importer.Name);
                    importer.Init(bb, settings);
                    score = importer.ReadScore();
                    Logger.Info("ScoreLoader", "Score imported using " + importer.Name);
                    break;
                }
                catch (UnsupportedFormatException)
                {
                    Logger.Info("ScoreLoader", importer.Name + " does not support the file");
                }
                catch (Exception e)
                {
                    Logger.Info("ScoreLoader", "Score import failed due to unexpected error: " + e);
                    throw;
                }
            }

            if (score != null)
            {
                return score;
            }

            Logger.Error("ScoreLoader", "No compatible importer found for file");
            throw new NoCompatibleReaderFoundException();
        }
    }
}
