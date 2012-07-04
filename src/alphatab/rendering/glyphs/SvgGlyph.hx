package alphatab.rendering.glyphs;
import alphatab.importer.ScoreLoader;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;

class SvgGlyph extends Glyph
{
	private var _token:Array<String>;
	private var _currentX:Float;
	private var _currentY:Float;
	private var _currentIndex:Int;
	private var _xScale:Float;
	private var _yScale:Float;
    
	private var _xGlyphScale:Float;
	private var _yGlyphScale:Float;
    
	public function new(x:Int = 0, y:Int = 0, svg:String, 
						xScale:Float, yScale:Float)
	{
		super(x, y);
		_token = svg.split(" ");
		_xGlyphScale = xScale;
		_yGlyphScale = yScale;
	}
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
        _xScale = _xGlyphScale * getScale();
        _yScale = _yGlyphScale * getScale();
        
		var res = renderer.getResources();
		canvas.setColor(res.mainGlyphColor);
        
		_currentIndex = 0;
		_currentX = x + cx;
		_currentY = y + cy;
		canvas.setColor(new Color(0,0,0)); // todo: Resources
		canvas.beginPath();
		while (_currentIndex < _token.length)
		{
			parseCommand(cx + x, cy + y, canvas);
		}
		canvas.fill();
	}	
	
	private function parseCommand(cx:Int, cy:Int, canvas:ICanvas) 
    {
		var command = this.getString();
		switch (command) 
		{
			case "M": // absolute moveto
				_currentX = (cx + this.getNumber() * _xScale);
				_currentY = (cy + this.getNumber() * _yScale);
				canvas.moveTo(_currentX, _currentY);
			case "m": // relative moveto
				_currentX += (this.getNumber() * _xScale);
				_currentY += (this.getNumber() * _yScale);
				canvas.moveTo(_currentX, _currentY);
			case "z":
			case "Z": // closePath
				canvas.closePath();
			case "L": // absolute lineTo
				var isNextNumber = true;
				do {
					_currentX = (cx + this.getNumber() * _xScale);
					_currentY = (cy + this.getNumber() * _yScale);
					canvas.lineTo(_currentX, _currentY);
					isNextNumber = !this.isNextCommand();
				}
				while (isNextNumber);
			case "l": // relative lineTo
				var isNextNumber = true;
				do {
					_currentX += (this.getNumber() * _xScale);
					_currentY += (this.getNumber() * _yScale);
					canvas.lineTo(_currentX, _currentY);
					isNextNumber = !this.isNextCommand();
				}
				while (isNextNumber);
			case "C": // absolute bezierTo
				var isNextNumber = true;
				do {
					var x1:Float = (cx + this.getNumber() * _xScale);
					var y1:Float = (cy + this.getNumber() * _yScale);
					var x2:Float = (cx + this.getNumber() * _xScale);
					var y2:Float = (cy + this.getNumber() * _yScale);
					var x3:Float = (cx + this.getNumber() * _xScale);
					var y3:Float = (cy + this.getNumber() * _yScale);
					_currentX = (x3);
					_currentY = (y3);
					canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
					isNextNumber = !this.isNextCommand();
				}
				while (isNextNumber);
			case "c": // relative bezierTo
				var isNextNumber = true;
				do {
					var x1:Float= (_currentX + this.getNumber() * _xScale);
					var y1:Float = (_currentY + this.getNumber() * _yScale);
					var x2:Float = (_currentX + this.getNumber() * _xScale);
					var y2:Float = (_currentY + this.getNumber() * _yScale);
					var x3:Float = (_currentX + this.getNumber() * _xScale);
					var y3:Float = (_currentY + this.getNumber() * _yScale);
					_currentX = x3;
					_currentY = y3;
					canvas.bezierCurveTo(x1, y1, x2, y2, x3, y3);
					isNextNumber = !this.isNextCommand();
				}
				while (isNextNumber && _currentIndex < _token.length);
			case "Q": // absolute quadraticCurveTo
				var isNextNumber = true;
				do {
					var x1:Float = (cx + this.getNumber() * _xScale);
					var y1:Float = (cy + this.getNumber() * _yScale);
					var x2:Float = (cx + this.getNumber() * _xScale);
					var y2:Float = (cy + this.getNumber() * _yScale);
					_currentX = x2;
					_currentY = y2;
					canvas.quadraticCurveTo(x1, y1, x2, y2);
					isNextNumber = !this.isNextCommand();
				}
				while (isNextNumber);
			case "q": // relative quadraticCurveTo
				var isNextNumber = true;
				do {
					var x1:Float = (_currentX + this.getNumber() * _xScale);
					var y1:Float = (_currentY + this.getNumber() * _yScale);
					var x2:Float = (_currentX + this.getNumber() * _xScale);
					var y2:Float = (_currentY + this.getNumber() * _yScale);
					_currentX = x2;
					_currentY = y2;
					canvas.quadraticCurveTo(x1, y1, x2, y2);
					isNextNumber = !this.isNextCommand();
				}
				while (isNextNumber && _currentIndex < _token.length);
		}
    }
    
    private function getNumber() : Float
    {
        return Std.parseFloat(_token[_currentIndex++]);
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
        return _token[_currentIndex++];
    }
}