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
using System;
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
        public static Score LoadScoreFromBytes(byte[] data)
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
                    importer.Init(bb);
                    score = importer.ReadScore();
                    Logger.Info("ScoreLoader", "Score imported using " + importer.Name);
                    break;
                }
                catch (Exception e)
                {
                    if (!Std.IsException<UnsupportedFormatException>(e))
                    {
                        Logger.Info("ScoreLoader", "Score import failed due to unexpected error: " + e);
                        throw e;
                    }
                    else
                    {
                        Logger.Info("ScoreLoader", importer.Name + " does not support the file");
                    }
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
