package alphatab.rendering.utils;

/**
 * A utility which can parse and deliver single tokens from a svg pathdata string
 */
class SvgPathParser 
{
	public var svg:String;
	public var lastCommand:String;
	public var currentToken:String;
	
	private var _currentIndex:Int;
	
	public function new(svg:String) 
	{
		this.svg = svg;
	}
	
	public function reset()
	{
		_currentIndex = 0;
		nextToken();
	}

	public function eof() : Bool
	{
		return _currentIndex >= svg.length;
	}
		
	public function getString() : String
	{
		var t = currentToken;
		nextToken();
		return t;
	}
	
	public function getNumber() : Float
	{
		return Std.parseFloat(getString());
	}
	
	public function currentTokenIsNumber()  : Bool
	{
		return isNumber(currentToken);
	}

	public function nextChar() : String
	{
		if (eof()) return "";
		return svg.charAt(_currentIndex++);
	}	
	
	public function peekChar() : String
	{
		if (eof()) return "";
		return svg.charAt(_currentIndex);
	}
	
	public function nextToken(): Void
	{
		var token = new StringBuf();
		
		var c:String;
		
		// skip leading spaces and separators
		do
		{
			c = nextChar();
		} while (!eof() && (isWhiteSpace(c) || c == ","));
		
		// read token itself 
		if (!eof())
		{
			token.add(c);		
			if (isNumber(c)) // do we have a number?
			{
				c = peekChar(); // get first upcoming character
				while (!eof() && (isNumber(c, false) || c == "." )) // while we have number characters add them 
				{
					token.add(nextChar());
					// peek next character for check
					c = peekChar();
				}
			}
			else
			{
				lastCommand = token.toString();
			}
		}
		
		currentToken = token.toString();
	}

	
	private static function isNumber(s:String, allowSign:Bool = true)  : Bool
	{
		if (s.length == 0) return false;
		var c = s.charCodeAt(0);
		return (allowSign && c == 0x2D) || (c >= 0x30 && c <= 0x39); 
	}
	
	private static function isWhiteSpace(s:String)  : Bool
	{
		if (s.length == 0) return false;
		var c = s.charAt(0);
		return c == " " || c == "\t" || c == "\r" || c == "\n";
	}

}