package alphatab.platform.model;

class Font 
{
	public static inline var STYLE_PLAIN = 0;
	public static inline var STYLE_BOLD = 1;
	public static inline var STYLE_ITALIC = 2;
	
	private var _family:String;
	private var _size:Float;
	private var _style:Int;
	
	public function getFamily() : String
	{
		return _family;
	}
	
	public function getSize() : Float
	{
		return _size;
	}	
	
	public function getStyle() : Int
	{
		return _style;
	}
	
	public inline function isBold() : Bool
	{
		return ((getStyle() & STYLE_BOLD) != 0);
	}	
	
	public inline function isItalic() : Bool
	{
		return ((getStyle() & STYLE_ITALIC) != 0);
	}
	
	public function new(family:String, size:Float, style:Int = STYLE_PLAIN) 
	{
		_family = family;
		_size = size;
		_style = style;
	}
	
	public function toCssString() : String
	{
		var buf = new StringBuf();
		
		if (isBold()) 
		{
			buf.add("bold ");
		}
		if (isItalic()) 
		{
			buf.add("italic ");
		}
		
		buf.add(_size);
		buf.add("px");
		buf.add("'");
		buf.add(_family);
		buf.add("'");
		
		return buf.toString();
	}
	
}