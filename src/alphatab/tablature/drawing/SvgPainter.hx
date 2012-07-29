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
package alphatab.tablature.drawing;
import alphatab.model.Point;

/**
 * This painter can draw SVG path data into a specified position using 
 * the given scale options.
 */
class SvgPainter 
{
    private var _layer:DrawingLayer;
    private var _svg:String;
    private var _x:Float;
    private var _y:Float;
    private var _xScale:Float;
    private var _yScale:Float;
    private var _currentPosition:Point;
    private var _token:Array<String>;
    private var _currentIndex:Int;
    
    public function new(layer:DrawingLayer, svg:String, x:Float, y:Float, xScale:Float, yScale:Float) 
    {
        _layer = layer;
        _svg = svg;
        _x = x;
        _y = y;
        _xScale = xScale * 0.98;
        _yScale = yScale * 0.98;
        _currentPosition = new Point(x, y);
        _token = svg.split(" ");
        _currentIndex = 0;
    }
    
    public function paint(): Void
    {
        _layer.startFigure();
        while (_currentIndex < _token.length)
        {
            this.parseCommand();
        }
    }
    
    private function parseCommand() 
    {
		try
		{
			var command = this.getString();
			switch (command) {
				case "M": // absolute moveto
					_currentPosition.x = (_x + this.getNumber() * _xScale);
					_currentPosition.y = (_y + this.getNumber() * _yScale);
					_layer.moveTo(_currentPosition.x, _currentPosition.y);
				case "m": // relative moveto
					_currentPosition.x += (this.getNumber() * _xScale);
					_currentPosition.y += (this.getNumber() * _yScale);
					_layer.moveTo(_currentPosition.x, _currentPosition.y);
				case "z":
				case "Z": // closePath
					_layer.closeFigure();
				case "L": // absolute lineTo
					var isNextNumber = true;
					do {
						_currentPosition.x = (_x + this.getNumber() * _xScale);
						_currentPosition.y = (_y + this.getNumber() * _yScale);
						_layer.lineTo(_currentPosition.x, _currentPosition.y);
						isNextNumber = !this.isNextCommand();
					}
					while (isNextNumber);
				case "l": // relative lineTo
					var isNextNumber = true;
					do {
						_currentPosition.x += (this.getNumber() * _xScale);
						_currentPosition.y += (this.getNumber() * _yScale);
						_layer.lineTo(_currentPosition.x, _currentPosition.y);
						isNextNumber = !this.isNextCommand();
					}
					while (isNextNumber);
				case "C": // absolute bezierTo
					var isNextNumber = true;
					do {
						var x1:Float = (_x + this.getNumber() * _xScale);
						var y1:Float = (_y + this.getNumber() * _yScale);
						var x2:Float = (_x + this.getNumber() * _xScale);
						var y2:Float = (_y + this.getNumber() * _yScale);
						var x3:Float = (_x + this.getNumber() * _xScale);
						var y3:Float = (_y + this.getNumber() * _yScale);
						_currentPosition.x = (x3);
						_currentPosition.y = (y3);
						_layer.bezierTo(x1, y1, x2, y2, x3, y3);
						isNextNumber = !this.isNextCommand();
					}
					while (isNextNumber);
				case "c": // relative bezierTo
					var isNextNumber = true;
					do {
						var x1:Float= (_currentPosition.x + this.getNumber() * _xScale);
						var y1:Float = (_currentPosition.y + this.getNumber() * _yScale);
						var x2:Float = (_currentPosition.x + this.getNumber() * _xScale);
						var y2:Float = (_currentPosition.y + this.getNumber() * _yScale);
						var x3:Float = (_currentPosition.x + this.getNumber() * _xScale);
						var y3:Float = (_currentPosition.y + this.getNumber() * _yScale);
						_currentPosition.x = x3;
						_currentPosition.y = y3;
						_layer.bezierTo(x1, y1, x2, y2, x3, y3);
						isNextNumber = !this.isNextCommand();
					}
					while (isNextNumber && _currentIndex < _token.length);
				case "Q": // absolute quadraticCurveTo
					var isNextNumber = true;
					do {
						var x1:Float = (_x + this.getNumber() * _xScale);
						var y1:Float = (_y + this.getNumber() * _yScale);
						var x2:Float = (_x + this.getNumber() * _xScale);
						var y2:Float = (_y + this.getNumber() * _yScale);
						_currentPosition.x = x2;
						_currentPosition.y = y2;
						_layer.quadraticCurveTo(x1, y1, x2, y2);
						isNextNumber = !this.isNextCommand();
					}
					while (isNextNumber);
				case "q": // relative quadraticCurveTo
					var isNextNumber = true;
					do {
						var x1:Float = (_currentPosition.x + this.getNumber() * _xScale);
						var y1:Float = (_currentPosition.y + this.getNumber() * _yScale);
						var x2:Float = (_currentPosition.x + this.getNumber() * _xScale);
						var y2:Float = (_currentPosition.y + this.getNumber() * _yScale);
						_currentPosition.x = x2;
						_currentPosition.y = y2;
						_layer.quadraticCurveTo(x1, y1, x2, y2);
						isNextNumber = !this.isNextCommand();
					}
					while (isNextNumber && _currentIndex < _token.length);
			}
		}
		catch (e:Dynamic)
		{
			_currentIndex = _token.length;
		}
    }
    
    private function getNumber() : Float
    {
        return Std.parseFloat(getString());
    }
    
    private function isNextCommand() : Bool
    {
        var command = this.peekString();
        return command == "m" ||
        command == "M" ||
        command == "c" ||
        command == "C" ||
        command == "q" ||
        command == "Q" ||
        command == "l" ||
        command == "L" ||
        command == "z" ||
        command == "Z";
    }
        
    private function peekString() : String
    {
        return _token[_currentIndex];
    }
    
    private function peekNumber() : Float
    {
        return Std.parseFloat(_token[_currentIndex]);
    }
    private function getString() : String
    {
		if (_currentIndex < _token.length)
		{
			return _token[_currentIndex++];
		}
        return throw "EOF";
    }
}