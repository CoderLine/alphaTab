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
using AlphaTab.IO;
using AlphaTab.Model;

namespace AlphaTab.Importer
{
    /// <summary>
    /// This is the base public class for creating new song importers which 
    /// enable reading scores from any binary datasource
    /// </summary>
    abstract public class ScoreImporter
    {
        protected IReadable _data;

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
                new AlphaTexImporter(),
                new MusicXml2Importer()
            };
        }

        public virtual void Init(IReadable data)
        {
            _data = data;
        }

        public abstract Score ReadScore();
    }
}
