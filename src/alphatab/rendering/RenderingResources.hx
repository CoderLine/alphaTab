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
package alphatab.rendering;

import alphatab.platform.model.Color;
import alphatab.platform.model.Font;

/**
 * This class contains central definitions for controlling the visual appearance. 
 */
class RenderingResources 
{
    public var copyrightFont:Font;
	public var titleFont:Font;
    public var subTitleFont:Font;
    public var wordsFont:Font;
    public var effectFont:Font;

	public var tablatureFont:Font;

	public var staveLineColor:Color;
	public var barSeperatorColor:Color;
	
    public var barNumberFont:Font;
	public var barNumberColor:Color;
	
	public var mainGlyphColor:Color;

    public function new(scale:Float)
    {
        init(scale);
    }
    
    public function init(scale:Float) : Void
    { 
        var sansFont = "Arial";
        var serifFont = "Times New Roman";
        
		effectFont = new Font(serifFont, 11 * scale, Font.STYLE_ITALIC);
		copyrightFont = new Font(sansFont, 12 * scale, Font.STYLE_BOLD);
		
		titleFont = new Font(serifFont, 32 * scale);
		subTitleFont = new Font(serifFont, 20 * scale);
		wordsFont = new Font(serifFont, 15 * scale);
		
		tablatureFont = new Font(sansFont, 12 * scale); 
		
		staveLineColor = new Color(165, 165, 165);
		barSeperatorColor = new Color(34, 34, 17);
		
		barNumberFont = new Font(sansFont, 11 * scale); 
		barNumberColor = new Color(200, 0, 0);
		
		mainGlyphColor = new Color(0,0,0);
	}
}