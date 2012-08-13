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

import alphatab.model.Duration;
import alphatab.rendering.utils.BeamingHelper;

class BeamGlyph extends SvgGlyph
{
	public function new(x:Int = 0, y:Int = 0, duration:Duration, direction:BeamDirection)
	{
		super(x, y, getRestSvg(duration, direction), 1, getSvgScale(duration, direction));
	}	
	
    private function getSvgScale(duration:Duration, direction:BeamDirection)
    {
        if (direction == Up)
        {
            return 1;
        }
        else
        {
            return -1;
        }
    }
		
	public override function doLayout():Void 
	{
		width = 0;
	}
	
	private function getRestSvg(duration:Duration, direction:BeamDirection) : String
	{
        switch(duration)
        {
            case Eighth: return MusicFont.FooterEighth;
            case Sixteenth: return MusicFont.FooterSixteenth;
            case ThirtySecond: return MusicFont.FooterThirtySecond;
            case SixtyFourth: return MusicFont.FooterSixtyFourth;
            default: return "";
        }
}
}