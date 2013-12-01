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
package alphatab.model;

/**
 * A single point of a bending graph. Used to 
 * describe WhammyBar and String Bending effects.
 */
class BendPoint 
{
    public static inline var MaxPosition = 60;
    public static inline var MaxValue = 12;
    
    public var offset:Int;
    public var value:Int;
    
    public function new(offset:Int=0, value:Int=0) 
    {
        this.offset = offset;
        this.value = value;
    }
    
    public function clone() : BendPoint
    {
        var point = new BendPoint();
        point.offset = offset;
        point.value = value;
        return point;
    }
    
}