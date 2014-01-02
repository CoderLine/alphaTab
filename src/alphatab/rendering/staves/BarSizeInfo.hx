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
package alphatab.rendering.staves;

import haxe.ds.IntMap.IntMap;
import haxe.ds.StringMap;

/**
 * This class stores size information about a stave. 
 * It is used by the layout engine to collect the sizes of score parts
 * to align the parts across multiple staves.
 */
class BarSizeInfo 
{
    public var fullWidth:Int;
    public var sizes:StringMap<Int>;
    
    public var preNoteSizes:IntMap<Int>;
    public var onNoteSizes:IntMap<Int>;
    public var postNoteSizes:IntMap<Int>;
    
    
    public function new() 
    {
        sizes = new StringMap<Int>();
        preNoteSizes = new IntMap<Int>();
        onNoteSizes = new IntMap<Int>();
        postNoteSizes = new IntMap<Int>();
        fullWidth = 0;
    }
    
    public function setSize(key:String, size:Int)
    {
        sizes.set(key, size);
    }
    
    public function getSize(key:String)
    {
        var size = sizes.get(key);
        return size == null ? 0 : size;
    }
    
    public function getPreNoteSize(beat:Int) : Int
    {
        var size = preNoteSizes.get(beat);
        return size == null ? 0 : size;
    }
    
    public function getOnNoteSize(beat:Int) : Int
    {
        var size = onNoteSizes.get(beat);
        return size == null ? 0 : size;
    }
    
    public function getPostNoteSize(beat:Int) : Int
    {
        var size = postNoteSizes.get(beat);
        return size == null ? 0 : size;
    }
    
    public inline function setPreNoteSize(beat:Int, value:Int) 
    {
        preNoteSizes.set(beat, value);
    }
    
    public inline function setOnNoteSize(beat:Int, value:Int) 
    {
        onNoteSizes.set(beat, value);
    }
    
    public inline function setPostNoteSize(beat:Int, value:Int) 
    {
        postNoteSizes.set(beat, value);
    }
}