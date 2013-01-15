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

import alphatab.importer.ScoreLoader;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;
import alphatab.rendering.utils.SvgPathParser;

class SvgGlyph extends Glyph
{
	private var _svg:SvgPathParser;
	
	private var _currentX:Float;
	private var _currentY:Float;
	private var _xScale:Float;
	private var _yScale:Float;
    
	private var _xGlyphScale:Float;
	private var _yGlyphScale:Float;
    
    private var _lastControlX:Float;
    private var _lastControlY:Float;
    
    // Minor tweaks for the new generated font
	public function new(x:Int = 0, y:Int = 0, svg:String, 
						xScale:Float, yScale:Float)
	{
		super(x, y);
		_svg = new SvgPathParser(svg);
		_xGlyphScale = xScale * 0.0099;
		_yGlyphScale = yScale * 0.0099;
	}
	
	public function getSvgData() : String
	{
		return _svg.svg;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
        _xScale = _xGlyphScale * getScale();
        _yScale = _yGlyphScale * getScale();
        
		var res = renderer.getResources();
		canvas.setColor(res.mainGlyphColor);
        
        var startX = x + cx;
        var startY = y + cy;
		_svg.reset();
		_currentX = startX;
		_currentY = startY;
		canvas.setColor(new Color(0,0,0)); // todo: Resources
		canvas.beginPath();
		
		while (!_svg.eof())
		{
			parseCommand(startX, startY, canvas);
		}
		canvas.fill();
	}	
	
	private function parseCommand(cx:Int, cy:Int, canvas:ICanvas) 
    {
		var command = _svg.getString();
		var canContinue:Bool; // reusable flag for shorthand curves
		switch (command) 
		{ 
			//
			// Moving
			// 
			case "M": // absolute moveto
				_currentX = (cx + _svg.getNumber() * _xScale);
				_currentY = (cy + _svg.getNumber() * _yScale); 
				canvas.moveTo(_currentX, _currentY);
			case "m": // relative moveto
				_currentX += (_svg.getNumber() * _xScale);
				_currentY += (_svg.getNumber() * _yScale); 
				canvas.moveTo(_currentX, _currentY);
				
			//
			// Closing
			// 
			case "Z", "z":
				canvas.closePath();
				
			//
			// Lines
			// 				
			case "L": // absolute lineTo
				do 
				{
					_currentX = (cx + _svg.getNumber() * _xScale); 
					_currentY = (cy + _svg.getNumber() * _yScale); 
					canvas.lineTo(_currentX, _currentY);
				} while (_svg.currentTokenIsNumber());
			case "l": // relative lineTo
				do 
				{
					_currentX += (_svg.getNumber() * _xScale); 
					_currentY += (_svg.getNumber() * _yScale); 
					canvas.lineTo(_currentX, _currentY);
				} while (_svg.currentTokenIsNumber());
				
			case "V": // absolute verticalTo
				do 
				{
					_currentY = (cy + _svg.getNumber() * _yScale);
					canvas.lineTo(_currentX, _currentY);
				} while (_svg.currentTokenIsNumber());
			case "v": // relative verticalTo
				do 
				{
					_currentY += (_svg.getNumber() * _yScale);
					canvas.lineTo(_currentX, _currentY);
				} while (_svg.currentTokenIsNumber());
				
			case "H": // absolute horizontalTo
				do 
				{
					_currentX = (cx + _svg.getNumber() * _xScale);
					canvas.lineTo(_currentX, _currentY);
				} while (_svg.currentTokenIsNumber());
			case "h": // relative horizontalTo
				do 
				{
					_currentX += (_svg.getNumber() * _xScale);
					canvas.lineTo(_currentX, _currentY);
				} while (_svg.currentTokenIsNumber());
				
			//
			// cubic bezier curves
			// 
			case "C": // absolute cubicTo
				do 
				{
					var x1:Float = (cx + _svg.getNumber() * _xScale);
					var y1:Float = (cy + _svg.getNumber() * _yScale);
					var x2:Float = (cx + _svg.getNumber() * _xScale);
					var y2:Float = (cy + _svg.getNumber() * _yScale);
					var x3:Float = (cx + _svg.getNumber() * _xScale);
					var y3:Float = (cy + _svg.getNumber() * _yScale);
                    _lastControlX = x2;
                    _lastControlY = y2;
					_currentX = x3;
					_currentY = y3;
					canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				} while (_svg.currentTokenIsNumber());
			case "c": // relative cubicTo
				do {
					var x1:Float=  (_currentX + _svg.getNumber() * _xScale);
					var y1:Float = (_currentY + _svg.getNumber() * _yScale);
					var x2:Float = (_currentX + _svg.getNumber() * _xScale);
					var y2:Float = (_currentY + _svg.getNumber() * _yScale);
					var x3:Float = (_currentX + _svg.getNumber() * _xScale);
					var y3:Float = (_currentY + _svg.getNumber() * _yScale);
                    _lastControlX = x2;
                    _lastControlY = y2;
					_currentX = x3;
					_currentY = y3;
					canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				} while (_svg.currentTokenIsNumber());			
				
			case "S": // absolute shorthand cubicTo
				do 
				{
					var x1:Float = (cx + _svg.getNumber() * _xScale);
					var y1:Float = (cy + _svg.getNumber() * _yScale);
					canContinue = _svg.lastCommand == "c" || _svg.lastCommand == "C" || _svg.lastCommand == "S" || _svg.lastCommand == "s" ;
					var x2:Float = canContinue 
										? _currentX + (_currentX - _lastControlX)
										: _currentX;
					var y2:Float = canContinue
										? _currentY + (_currentY - _lastControlY)
										: _currentY;
					var x3:Float = (cx + _svg.getNumber() * _xScale);
					var y3:Float = (cy + _svg.getNumber() * _yScale);
                    _lastControlX = x2;
                    _lastControlY = y2;
					_currentX = x3;
					_currentY = y3;
					canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				} while (_svg.currentTokenIsNumber());			
			case "s": // relative shorthand cubicTo
				do 
				{
					var x1:Float = (_currentX + _svg.getNumber() * _xScale);
					var y1:Float = (_currentY + _svg.getNumber() * _yScale);
					canContinue = _svg.lastCommand == "c" || _svg.lastCommand == "C" || _svg.lastCommand == "S" || _svg.lastCommand == "s" ;
					var x2:Float = canContinue 
										? _currentX + (_currentX - _lastControlX)
										: _currentX;
					var y2:Float = canContinue
										? _currentY + (_currentY - _lastControlY)
										: _currentY;
					var x3:Float = (_currentX + _svg.getNumber() * _xScale);
					var y3:Float = (_currentY + _svg.getNumber() * _yScale);
                    _lastControlX = x2;
                    _lastControlY = y2;
					_currentX = x3;
					_currentY = y3;
					canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
				} while (_svg.currentTokenIsNumber());
			
			//
			// quadratic bezier curves
			//
			case "Q": // absolute quadraticTo
				do 
				{
					var x1:Float = (cx + _svg.getNumber() * _xScale);
					var y1:Float = (cy + _svg.getNumber() * _yScale);
					var x2:Float = (cx + _svg.getNumber() * _xScale);
					var y2:Float = (cy + _svg.getNumber() * _yScale);
					_lastControlX = x1;
					_lastControlY = y1;
					_currentX = x2;
					_currentY = y2;
					canvas.quadraticCurveTo(x1, y1, x2, y2);
				} while (_svg.currentTokenIsNumber());
			case "q": // relative quadraticTo
				do 
				{
					var x1:Float = (_currentX + _svg.getNumber() * _xScale);
					var y1:Float = (_currentY + _svg.getNumber() * _yScale);
					var x2:Float = (_currentX + _svg.getNumber() * _xScale);
					var y2:Float = (_currentY + _svg.getNumber() * _yScale);
					_lastControlX = x1;
					_lastControlY = y1;
					_currentX = x2;
					_currentY = y2;
					canvas.quadraticCurveTo(x1, y1, x2, y2);
				} while (_svg.currentTokenIsNumber());
				
            case "T": // absolute shorthand quadraticTo
				do 
				{
					var x1:Float = (cx + _svg.getNumber() * _xScale);
					var y1:Float = (cy + _svg.getNumber() * _yScale);
					canContinue = _svg.lastCommand == "q" || _svg.lastCommand == "Q" || _svg.lastCommand == "t" || _svg.lastCommand == "T" ;
					var cpx:Float = canContinue 
										? _currentX + (_currentX - _lastControlX)
										: _currentX;
					var cpy:Float = canContinue
										? _currentY + (_currentY - _lastControlY)
										: _currentY;
					_currentX = x1;
					_currentY = y1;                    
                    _lastControlX = cpx;
                    _lastControlY = cpy;
					canvas.quadraticCurveTo(cpx, cpy, x1, y1);
				} while (_svg.currentTokenIsNumber());
            case "t": // relative shorthand quadraticTo
				do 
				{
                // TODO: buggy/incomplete
					var x1:Float = (_currentX + _svg.getNumber() * _xScale);
					var y1:Float = (_currentY + _svg.getNumber() * _yScale);
                    var cpx = _currentX + (_currentX - _lastControlX);
                    var cpy = _currentY + (_currentY - _lastControlY);
					canContinue = _svg.lastCommand == "q" || _svg.lastCommand == "Q" || _svg.lastCommand == "t" || _svg.lastCommand == "T" ;
					var cpx:Float = canContinue 
										? _currentX + (_currentX - _lastControlX)
										: _currentX;
					var cpy:Float = canContinue
										? _currentY + (_currentY - _lastControlY)
										: _currentY;
                    _lastControlX = cpx;
                    _lastControlY = cpy;
					canvas.quadraticCurveTo(cpx, cpy, x1, y1);
				} while (_svg.currentTokenIsNumber());
		}
    }
}