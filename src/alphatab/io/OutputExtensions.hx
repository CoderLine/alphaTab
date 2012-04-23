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
package alphatab.io;

import haxe.io.Output;

/**
 * This class extends the standard haxe.io.Output with some
 * utility functions.
 */
class OutputExtensions 
{
    public static function writeAsString(output:Output, value:Dynamic)
    {
        var text:String;
        if (Std.is(value, String))
        {
            text = cast(value, String);
        }
        else
        {
            text = Std.string(value);
        }
        output.writeString(text);
    }
}