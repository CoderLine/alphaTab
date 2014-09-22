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
using AlphaTab.Model;

namespace AlphaTab.Rendering.Utils
{
    public class PercussionMapper
    {
        public static int MapValue(Note note)
        {
            var value = note.RealValue;
            if (value == 61 || value == 66)
            {
                return 50;
            }
            else if (value == 60 || value == 65)
            {
                return 52;
            }
            else if ((value >= 35 && value <= 36) || value == 44)
            {
                return 53;
            }
            else if (value == 41 || value == 64)
            {
                return 55;
            }
            else if (value == 43 || value == 62)
            {
                return 57;
            }
            else if (value == 45 || value == 63)
            {
                return 59;
            }
            else if (value == 47 || value == 54)
            {
                return 62;
            }
            else if (value == 48 || value == 56)
            {
                return 64;
            }
            else if (value == 50)
            {
                return 65;
            }
            else if (value == 42 || value == 46 || (value >= 49 && value <= 53) || value == 57 || value == 59)
            {
                return 67;
            }
            return 60;
        }
    }
}
