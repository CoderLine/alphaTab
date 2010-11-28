/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.tablature.model;

import alphatab.model.Note;

/**
 * This class allows mappings from normal notes to percussion notes
 * for rendering.
 */ 
class PercussionMapper 
{
    public static function getValue(note:Note) : Int
    {
        var value:Int = note.value;
        if(value <= 34) 
        {
            return 60;
        }
        else if(value <= 36)
        {
            return 53;
        }
        else if(value <= 40)
        {
            return 60;
        }
        else if(value == 41)
        {
            return 55;
        }
        else if(value == 42)
        {
            return 67;
        }
        else if(value == 43) 
        {
            return 57;
        }
        else if(value == 44)
        {
            return 53;
        }
        else if(value == 45)
        {
            return 59;
        }
        else if(value == 46)
        {
            return 67;
        }
        else if(value == 47)
        {
            return 62;
        }
        else if(value == 48)
        {
            return 64;
        }
        else if(value == 49)
        {
            return 67;
        }
        else if(value == 50)
        {
            return 65;
        }
        else if(value <= 53)
        {
            return 67;
        }
        else if(value == 54)
        {
            return 62;
        }
        else if(value == 55)
        {
            return 60;
        }
        else if(value == 56)
        {
            return 64;
        }
        else if(value == 57)
        {
            return 67;
        }
        else if(value == 58)
        {
            return 60;
        }
        else if(value == 59)
        {
            return 67;
        }
        else if(value == 60)
        {
            return 52;
        }
        else if(value == 61)
        {
            return 50;
        }
        else if(value == 62)
        {
            return 57;
        }
        else if(value == 63)
        {
            return 59;
        }
        else if(value == 64)
        {
            return 55;
        }
        else if(value == 65)
        {
            return 52;
        }
        else if(value == 66)
        {
            return 50;
        }
        else
        {
            return 60;
        }
        
    }
}