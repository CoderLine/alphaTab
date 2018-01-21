package system;

abstract CsString(String) from String to String
{
	public inline function new(s:String) this = s;	
	
	public inline function ToHaxeString(): String return this;
	
	public var Length(get, never):Int32;
	public inline function get_Length() :Int32 return this.length;
	public inline function get_Chars(i:Int32) : Char return Char.fromCode(this.charCodeAt(i.ToHaxeInt()));
	
	public inline function Substring_Int32(start:Int32) : CsString return this.substr(start.ToHaxeInt());
	public inline function Substring_Int32_Int32(start:Int32, length:Int32) : CsString return this.substr(start.ToHaxeInt(), length.ToHaxeInt());
	public inline function Replace_CsString_CsString(from:CsString, with :CsString) : CsString return StringTools.replace(this, from.ToHaxeString(), with.ToHaxeString() );
	public inline function IndexOf_Char(ch:Char) : Int32 return this.indexOf(ch.ToString());
	public inline function LastIndexOf_Char(ch:Char) : Int32 return this.lastIndexOf(ch.ToString());
	public inline function EndsWith_CsString(end:CsString) : Boolean return StringTools.endsWith(this, end.ToHaxeString());
	public inline function Contains(s:CsString) : Boolean return this.indexOf(s.ToHaxeString()) != -1;
	public inline function Trim() : CsString return StringTools.trim(this);
	
	public function Split_CharArray(chars:Array<Int32>) : Array<CsString>
	{
		var strings = new Array<CsString>();
		var startPos = 0;
		for (i in 0 ... this.length)
		{
			var cc = this.charCodeAt(i);
			if (chars.indexOf(cc) >= 0)
			{
				var endPos = i - 1;
				if (endPos < startPos)
				{
					strings.push("");
				}
				else
				{
					strings.push(this.substring(startPos, endPos));
				}
				startPos = i + 1;
			}
		}
		return strings;
	}
	
	public static inline function IsNullOrEmpty(s:CsString) : Boolean return (s == null || s.Length == 0);
	public static inline function IsNullOrWhiteSpace(s:CsString) : Boolean return (s == null || s.Trim().Length == 0);
	public static inline function FromCharCode(s:Int32) : CsString return String.fromCharCode(s.ToHaxeInt());

	public inline function StartsWith_CsString(s:CsString) : Boolean return StringTools.startsWith(this, s); 
	
	public inline function ToLower() :CsString return this.toLowerCase();
	public inline function ToUpper() :CsString return this.toUpperCase();
	
	@:op(A + B) public static inline function add1(lhs : system.CsString, rhs : String) : system.CsString return lhs.ToHaxeString() + rhs;
	@:op(A + B) public static inline function add2(lhs : String, rhs : system.CsString) : system.CsString return lhs + rhs.ToHaxeString();
	
	@:op(A + B) public static inline function add3(lhs : system.CsString, rhs : Int) : system.CsString return lhs.ToHaxeString() + Std.string(rhs);
	@:op(A + B) public static inline function add4(lhs : Int, rhs : system.CsString) : system.CsString return Std.string(lhs) + rhs.ToHaxeString();
	
	@:op(A + B) public static inline function add5(lhs : system.CsString, rhs : Float) : system.CsString return lhs + Std.string(rhs);
	@:op(A + B) public static inline function add6(lhs : Float, rhs : system.CsString) : system.CsString return Std.string(lhs) + rhs;

	@:op(A + B) public static inline function add7(lhs : system.CsString, rhs : system.Char) : system.CsString return lhs + rhs.ToString();
	@:op(A + B) public static inline function add8(lhs : system.CsString, rhs : system.Byte) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add9(lhs : system.CsString, rhs : system.Int16) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add10(lhs : system.CsString, rhs : system.Int32) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add11(lhs : system.CsString, rhs : system.Int64) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add12(lhs : system.CsString, rhs : system.SByte) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add13(lhs : system.CsString, rhs : system.UInt16) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add14(lhs : system.CsString, rhs : system.UInt32) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add15(lhs : system.CsString, rhs : system.UInt64) : system.CsString return lhs + rhs.ToString();
	@:op(A + B) public static inline function add16(lhs : system.CsString, rhs : system.Single) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add17(lhs : system.CsString, rhs : system.Double) : system.CsString return lhs + rhs.ToString();
    @:op(A + B) public static inline function add18(lhs : system.CsString, rhs : system.CsString) : system.CsString return lhs.ToHaxeString() + rhs.ToHaxeString();
}