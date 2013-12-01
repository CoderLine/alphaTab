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

import alphatab.model.Score;

/**
 * This ScoreImporter can read Guitar Pro 6 (gpx) files.
 */
class GpxImporter extends ScoreImporter
{

    public function new() 
    {
        super();
    }
    
    public override function readScore():Score 
    {
        // at first we need to load the binary file system 
        // from the GPX container
        var fileSystem = new GpxFileSystem();
        fileSystem.setFileFilter(function(s:String) {
            return s == GpxFileSystem.ScoreGpif; // only load the GPIF file to memory
        });
        fileSystem.load(_data);
        
        // convert data to string
        var xml = fileSystem.files[0].data.toString();
        // lets set the fileSystem to null, maybe the garbage collector will come along
        // and kick the fileSystem binary data before we finish parsing
        fileSystem.files = null;
        fileSystem = null;
        
        // the score.gpif file within this filesystem stores
        // the score information as XML we need to parse.
        var parser = new GpxParser();
        parser.parseXml(xml);
                
        finish(parser.score);
        
        return parser.score;
    }
}