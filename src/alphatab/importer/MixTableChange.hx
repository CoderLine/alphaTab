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

/**
 * A mixtablechange describes several track changes. 
 */
class MixTableChange 
{
    public var volume:Int;
    public var balance:Int;
    public var instrument:Int;
    public var tempoName:String;
    public var tempo:Int;
    public var duration:Int;
    
    public function new()
    {
        volume = -1;
        balance = -1;
        instrument = -1;
        tempoName = null;
        tempo = -1;
        duration = 0;
    }
}