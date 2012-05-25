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
import alphatab.model.Clef;
import alphatab.platform.ICanvas;
import alphatab.platform.svg.SvgCanvas;
import alphatab.rendering.glyphs.BarNumberGlyph;
import alphatab.rendering.glyphs.BarSeperatorGlyph;
import alphatab.rendering.glyphs.ClefGlyph;
import alphatab.rendering.glyphs.DummyTablatureGlyph;
import alphatab.rendering.glyphs.FlatGlyph;
import alphatab.rendering.glyphs.GlyphGroup;
import alphatab.rendering.glyphs.MusicFont;
import alphatab.rendering.glyphs.NaturalizeGlyph;
import alphatab.rendering.glyphs.NumberGlyph;
import alphatab.rendering.glyphs.RepeatCloseGlyph;
import alphatab.rendering.glyphs.RepeatCountGlyph;
import alphatab.rendering.glyphs.RepeatOpenGlyph;
import alphatab.rendering.glyphs.SharpGlyph;
import alphatab.rendering.glyphs.SpacingGlyph;
import alphatab.rendering.glyphs.SvgGlyph;
import alphatab.rendering.glyphs.TimeSignatureGlyph;

/**
 * This BarRenderer renders a bar using standard music notation. 
 */
class ScoreBarRenderer extends GlyphBarRenderer
{
	private static var SCORE_KEYSHARP_POSITIONS:Array<Int> = [ 0, 3, -1, 2, 5, 1, 4 ];
    private static var SCORE_KEYFLAT_POSITIONS:Array<Int> = [ 4, 1, 5, 2, 6, 3, 7 ];
    
    private static var SCORE_SHARP_POSITIONS:Array<Int> = [7, 7, 6, 6, 5, 4, 4, 3, 3, 2, 2, 1 ];
    private static var SCORE_FLAT_POSITIONS:Array<Int> = [ 7, 6, 6, 5, 5, 4, 3, 3, 2, 2, 1, 1 ];
        
    private static var SCORE_CLEF_OFFSETS:Array<Int> = [ 30, 18, 22, 24 ];

	
	private static inline var LineSpacing = 8;
	public function new(bar:alphatab.model.Bar) 
	{
		super(bar);
	}
	
	public override function getTopPadding():Int 
	{
		return getGlyphOverflow();
	}	
	
	public override function getBottomPadding():Int 
	{
		return getGlyphOverflow();
	}
	
	private inline function getLineOffset()
	{
		return ((LineSpacing + 1) * getLayout().renderer.scale);
	}
	
	public override function doLayout()
	{
		super.doLayout();
		height = Std.int(getLineOffset() * 4) + (getGlyphOverflow() * 2);
		if (index == 0)
		{
			stave.registerStaveTop(getGlyphOverflow());
			stave.registerStaveBottom(height - getGlyphOverflow());
		}
	}
	
	private override function createGlyphs():Void 
	{		
		createBarStartGlyphs();
		
		createStartGlyphs();
				
		if (_bar.isEmpty())
		{
			addGlyph(new SpacingGlyph(0, 0, Std.int(30 * getScale())));
		}
		
		createBarEndGlyphs();
	}
	
	private var _startSpacing:Bool;
	private function createStartSpacing()
	{
		if (_startSpacing) return;
		addGlyph(new SpacingGlyph(0, 0, Std.int(2 * getScale())));
		_startSpacing = true;
	}
	
	private function createBarStartGlyphs()
	{
		if (_bar.getMasterBar().isRepeatStart)
		{
			addGlyph(new RepeatOpenGlyph());
		}
	}	
	private function createBarEndGlyphs()
	{
		if (_bar.getMasterBar().isRepeatEnd())
		{
			if (_bar.getMasterBar().repeatCount > 1)
			{
				addGlyph(new RepeatCountGlyph(0, getScoreY(-1, -3), _bar.getMasterBar().repeatCount + 1));
			}
			addGlyph(new RepeatCloseGlyph(x, 0));
		}
		else if (_bar.getMasterBar().isDoubleBar)
		{
			addGlyph(new BarSeperatorGlyph());
			addGlyph(new SpacingGlyph(0, 0, Std.int(3 * getScale())));
			addGlyph(new BarSeperatorGlyph());
		}		
		else if(_bar.nextBar == null || !_bar.nextBar.getMasterBar().isRepeatStart)
		{
			addGlyph(new BarSeperatorGlyph(0,0,isLast()));
		}
	}
	
	private function createStartGlyphs()
	{
		// Clef
		if (isFirstOfLine() || _bar.clef != _bar.previousBar.clef)
		{
			var offset = 0;
			switch(_bar.clef)
			{
				case F4,C3: offset = 2;
				case C4: offset = 0;
				default: offset = 0;
			}
			createStartSpacing();
			addGlyph(new ClefGlyph(0, getScoreY(offset, -1), _bar.clef));
		}
		
		// Key signature
		if ( (_bar.previousBar == null && _bar.getMasterBar().keySignature != 0)
			|| (_bar.previousBar != null && _bar.getMasterBar().keySignature != _bar.previousBar.getMasterBar().keySignature))
		{
			createStartSpacing();
			createKeySignatureGlyphs();
		}
		
		// Time Signature
		if(  (_bar.previousBar == null)
			|| (_bar.previousBar != null && _bar.getMasterBar().timeSignatureNumerator != _bar.previousBar.getMasterBar().timeSignatureNumerator)
			|| (_bar.previousBar != null && _bar.getMasterBar().timeSignatureDenominator != _bar.previousBar.getMasterBar().timeSignatureDenominator)
			)
		{
			createStartSpacing();
			createTimeSignatureGlyphs();
		}
		
		if (stave.index == 0)
		{
			addGlyph(new BarNumberGlyph(0,getScoreY(-1, -3),_bar.index + 1));
		}
	}
	
	private function createKeySignatureGlyphs()
	{
		var offsetClef:Int  = 0;
		var currentKey:Int  = _bar.getMasterBar().keySignature;
        var previousKey:Int  = _bar.previousBar == null ? 0 : _bar.previousBar.getMasterBar().keySignature;

		if (currentKey < 0)
		{
			currentKey = 7 + Math.round(Math.abs(currentKey));
		}
		if (previousKey < 0)
		{
			previousKey = 7 + Math.round(Math.abs(previousKey));
		}
		
        switch (_bar.clef)
        {
            case Clef.G2:
                offsetClef = 0;
            case Clef.F4:
                offsetClef = 2;
            case Clef.C3:
                offsetClef = -1;
            case Clef.C4:
                offsetClef = 1;
        }
		
		// naturalize previous key
        var naturalizeSymbols:Int = (previousKey <= 7) ? previousKey : previousKey - 7;        
        var previousKeyPositions:Array<Int> = (previousKey <= 7) ? SCORE_KEYSHARP_POSITIONS : SCORE_KEYFLAT_POSITIONS;

		for (i in 0 ... naturalizeSymbols)
        {
			addGlyph(new NaturalizeGlyph(0, Std.int(getScoreY(previousKeyPositions[i] + offsetClef, -2))));
        }
		
		// how many symbols do we need to get from a C-keysignature
        // to the new one
        var offsetSymbols:Int = (currentKey <= 7) ? currentKey : currentKey - 7;
        // a sharp keysignature
        if (currentKey <= 7)
        {  
            for (i in 0 ... offsetSymbols)
            {
				addGlyph(new SharpGlyph(0, Std.int(getScoreY(SCORE_KEYSHARP_POSITIONS[i] + offsetClef, -1))));
            }
        }
        // a flat signature
        else 
        {
            for (i in 0 ... offsetSymbols)
            {
				addGlyph(new FlatGlyph(0, Std.int(getScoreY(SCORE_KEYFLAT_POSITIONS[i] + offsetClef, -8))));
            }
        }		
	}
	
	private function createTimeSignatureGlyphs()
	{
		addGlyph(new SpacingGlyph(0,0, Std.int(5 * getScale()), false));
		addGlyph(new TimeSignatureGlyph(0, 0, _bar.getMasterBar().timeSignatureNumerator, _bar.getMasterBar().timeSignatureDenominator));
	}
	
	/**
	 * Gets the relative y position of the given steps relative to first line. 
	 * @param steps the amount of steps while 2 steps are one line
	 */
	private function getScoreY(steps:Int, correction:Int = 0) : Int
	{
		return Std.int(((getLineOffset() / 2) * steps) + (correction * getScale()));
	}
	
	/**
	 * gets the padding needed to place glyphs within the bounding box
	 */
	private function getGlyphOverflow()
	{
		var res = getResources();
		return Std.int((res.tablatureFont.getSize() / 2) + (res.tablatureFont.getSize() * 0.2));
	}

	public override function paintBackground(cx:Int, cy:Int, canvas:ICanvas)
	{
		var res = getResources();
		
		//
		// draw string lines
		//
		canvas.setColor(res.staveLineColor);
		var lineY = cy + y + getGlyphOverflow();
		
		var startY = lineY;
		for (i in 0 ... 5)
		{
			if (i > 0) lineY += Std.int(getLineOffset());
			canvas.beginPath();
			canvas.moveTo(cx + x, lineY);
			canvas.lineTo(cx + x + width, lineY);
			canvas.stroke();
		}
	}
}