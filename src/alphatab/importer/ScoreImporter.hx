/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
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
package alphatab.importer;

import alphatab.model.AccidentalType;
import alphatab.model.Beat;
import alphatab.model.Duration;
import alphatab.model.Note;
import alphatab.model.Score;
import alphatab.model.SlideType;
import alphatab.util.LazyVar;
import haxe.io.Bytes;
import haxe.io.BytesInput;

/**
 * This is the base class for creating new song importers which 
 * enable reading scores from any binary datasource
 */
class ScoreImporter 
{
    public static var UnsupportedFormat = "unsupported file";
    #if unit public #else private #end var _data:BytesInput;
        
    /**
     * Gets all default ScoreImporters
     * @return
     */
    public static function availableImporters() : Array<ScoreImporter>
    {
        var scoreImporter = new Array<ScoreImporter>();
        scoreImporter.push(new Gp3To5Importer());
        scoreImporter.push(new AlphaTexImporter());
        scoreImporter.push(new GpxImporter());
        return scoreImporter;
    }
    
    public function new() 
    {
    }
    
    public function init(data:BytesInput)
    {
        _data = data;
    }
    
    public function readScore() : Score
    {
        return null;
    }
}   