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
package alphatab.audio.generator;
import alphatab.model.DynamicValue;

/**
 * A handler is responsible for writing midi events to a custom structure
 */
interface IMidiFileHandler
{
    function addTimeSignature(tick:Int, timeSignatureNumerator:Int, timeSignatureDenominator:Int) : Void;
    function addRest(track:Int, tick:Int, channel:Int) : Void;
    function addNote(track:Int, start:Int, length:Int, key:Int, dynamicValue:DynamicValue, channel:Int) : Void;
    function addControlChange(track:Int, tick:Int, channel:Int, controller:Int, value:Int) : Void;
    function addProgramChange(track:Int, tick:Int, channel:Int, program:Int) : Void;
    function addTempo(tick:Int, tempo:Int) : Void;
    function addBend(track:Int, tick:Int, channel:Int, value:Int) : Void;
    function addMetronome(start:Int, length:Int) : Void;
}