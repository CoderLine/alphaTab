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

using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Model;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This is the base public class for creating new song importers which 
    /// enable reading scores from any binary datasource
    /// </summary>
    public abstract class ScoreImporter
    {
        protected IReadable Data;
        protected Settings Settings;

        /**
         * Gets all default ScoreImporters
         * @return
         */
        public static ScoreImporter[] BuildImporters()
        {
            return new ScoreImporter[]
            {
                new Gp3To5Importer(),
                new GpxImporter(),
                new Gp7Importer(), 
                new AlphaTexImporter(),
                new MusicXmlImporter()
            };
        }

        public virtual void Init(IReadable data, Settings settings = null)
        {
            Data = data;
            Settings = settings;
        }

        protected T GetSetting<T>(string key, T defaultValue = default(T))
        {
            key = key.ToLower();
            if (Settings == null || Settings.ImporterSettings == null || !Settings.ImporterSettings.ContainsKey(key))
            {
                return defaultValue;
            }

            return (T)Settings.ImporterSettings[key];
        }

        public abstract string Name { get; }
        public abstract Score ReadScore();
    }
}
