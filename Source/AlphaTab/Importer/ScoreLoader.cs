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
    public class ScoreLoader
    {
        /// <summary>
        /// Loads a score asynchronously from the given datasource
        /// </summary>
        /// <param name="path">the source path to load the binary file from</param>
        /// <param name="success">this function is called if the Score was successfully loaded from the datasource</param>
        /// <param name="error">this function is called if any error during the loading occured.</param>
        public static void LoadScoreAsync(string path, Action<Score> success, Action<Exception> error)
        {
            IFileLoader loader = Environment.FileLoaders["default"]();
            Logger.Info("Loading score from '" + path + "'");
            loader.LoadBinaryAsync(path, data =>
            {
                Score score = null;
                try
                {
                    score = LoadScoreFromBytes(data);
                }
                catch (Exception e)
                {
                    error(e);
                }

                if (score != null)
                {
                    success(score);
                }

            }, error);
        }


        /// <summary>
        /// Loads a score synchronously from the given datasource
        /// </summary>
        /// <param name="path">the source path to load the binary file from</param>
        /// <returns></returns>
        public static Score LoadScore(string path)
        {
            IFileLoader loader = Environment.FileLoaders["default"]();
            var data = loader.LoadBinary(path);
            return LoadScoreFromBytes(data);
        }

        public static Score LoadScoreFromBytes(byte[] data)
        {
            var importers = ScoreImporter.BuildImporters();

            Logger.Info("Loading score from " + data.Length + " bytes using " + importers.Length + " importers");

            Score score = null;
            ByteBuffer bb = ByteBuffer.FromBuffer(data);
            foreach (var importer in importers)
            {
                bb.Reset();
                try
                {
                    Logger.Info("Importing using importer " + importer.Name);
                    importer.Init(bb);
                    score = importer.ReadScore();
                    Logger.Info("Score imported using " + importer.Name);
                    break;
                }
                catch (Exception e)
                {
                    if (!Std.IsException<UnsupportedFormatException>(e))
                    {
                        Logger.Info("Score import failed due to unexpected error: " + e.Message);
                        throw e;
                    }
                    else
                    {
                        Logger.Info( importer.Name + " does not support the file");
                    }
                }
            }

            if (score != null)
            {
                return score;
            }

            Logger.Info("No compatible importer found for file");
            throw new NoCompatibleReaderFoundException();
        }
    }
}
