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
package alphatab.rendering.glyphs;

class NaturalizeGlyph extends SvgGlyph
{
    private var _isGrace:Bool;
    public function new(x:Int = 0, y:Int = 0, isGrace:Bool= false)
    {
        super(x, y, MusicFont.AccidentalNatural, isGrace ? NoteHeadGlyph.graceScale : 1, isGrace ? NoteHeadGlyph.graceScale : 1);
        _isGrace = isGrace;
    }    
        
    public override function doLayout():Void 
    {
        width = Std.int(8 * (_isGrace ? NoteHeadGlyph.graceScale : 1) * getScale());
    }
    
    public override function canScale():Bool 
    {
        return false;
    }
}