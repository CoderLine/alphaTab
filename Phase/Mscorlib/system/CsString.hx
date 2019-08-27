package system;

abstract CsString(String) from String to String
{
	public inline function new(s:String) this = s;	
	
	public inline function toHaxeString(): String return this;
	
	public var length(get, never):Int32;
	public inline function get_length() :Int32 return this.length;
	public inline function get_chars(i:Int32) : Char return Char.fromCode(this.charCodeAt(i.toHaxeInt()));
	public inline function get(i:Int32) : Char return Char.fromCode(this.charCodeAt(i.toHaxeInt()));
	
	public inline function substring_Int32(start:Int32) : CsString return this.substr(start.toHaxeInt());
	public inline function substring_Int32_Int32(start:Int32, length:Int32) : CsString return this.substr(start.toHaxeInt(), length.toHaxeInt());
	public inline function replace_CsString_CsString(from:CsString, with :CsString) : CsString return StringTools.replace(this, from.toHaxeString(), with.toHaxeString() );
	public inline function indexOf_Char(ch:Char) : Int32 return this.indexOf(ch.toString());
	public inline function indexOf_CsString(ch:CsString) : Int32 return this.indexOf(ch.toHaxeString());
	public inline function lastIndexOf_Char(ch:Char) : Int32 return this.lastIndexOf(ch.toString());
	public inline function lastIndexOf_CsString(ch:CsString) : Int32 return this.lastIndexOf(ch.toHaxeString());
	public inline function endsWith_CsString(end:CsString) : Boolean return StringTools.endsWith(this, end.toHaxeString());
	public inline function contains(s:CsString) : Boolean return this.indexOf(s.toHaxeString()) != -1;
	public inline function trim() : CsString return StringTools.trim(this);
	
	public function split_CharArray(chars:Array<Int32>) : Array<CsString>
	{
		var strings = new Array<CsString>();
		var startPos = 0;
		for (i in 0 ... this.length)
		{
			var cc = this.charCodeAt(i);
			if (chars.indexOf(cc) >= 0)
			{
				var endPos = i;
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
		if(startPos < this.length)
		{
			strings.push(this.substring(startPos, this.length));
		}
		return strings;
	}
	
	public static inline function isNullOrEmpty(s:CsString) : Boolean return (s == null || s.length == 0);
	public static inline function isNullOrWhiteSpace(s:CsString) : Boolean return (s == null || s.trim().length == 0);
	public static inline function fromCharCode(s:Int32) : CsString return String.fromCharCode(s.toHaxeInt());
	public static function format(format:CsString, args:FixedArray<Any>) : CsString
	{
		var sb = new StringBuf();
		
		// based on https://github.com/dotnet/coreclr/blob/master/src/mscorlib/shared/System/Text/StringBuilder.cs#L1362
		var pos : Int32 = 0; 
		var len : Int32 = format.length;
		var ch : Char = 0;
		var unescapedItemFormat:StringBuf = null;
		
		while(true)
		{
			while(pos < len)
			{
				ch = format.get_chars(pos);
				pos++;
				
				// Is it a closing brace?
				if(ch == "}")
				{
					// Check next character (if there is one) to see if it is escaped. eg }}
					if(pos < len && format.get_chars(pos) == "}")
					{
						pos++;
					}
					else
					{
						// Otherwise treat it as an error (Mismatched closing brace)
						throw new FormatException().FormatException_CsString("invalid format");
					}
				}
				
				 // Is it a opening brace?
				if(ch == "{")
				{
					// Check next character (if there is one) to see if it is escaped. eg {{
					if(pos < len && format.get_chars(pos) == "{")
					{
						pos++;
					}
					else
					{
						// Otherwise treat it as the opening brace of an Argument Hole.
						pos--;
						break;
					}
				}
				// If it neither then treat the character as just text.
				sb.addChar(ch.toHaxeInt());
			}
			
			//
			// Start of parsing of Argument Hole.
			// Argument Hole ::= { Index (, WS* Alignment WS*)? (: Formatting)? }
			//
			if (pos == len) break;
			
			//
			//  Start of parsing required Index parameter.
			//  Index ::= ('0'-'9')+ WS*
			//
			pos++;
			// If reached end of text then error (Unexpected end of text)
			// or character is not a digit then error (Unexpected Character)
			if (pos == len || (ch = format.get_chars(pos)) < '0' || ch > '9') 
			{
				throw new FormatException().FormatException_CsString("invalid format");
			}
			
			var index:Int32 = 0;
			do
			{
				index = index * 10 + ch - Char.fromString("0");
				pos++;
				// If reached end of text then error (Unexpected end of text)
				if (pos == len)
				{
					throw new FormatException().FormatException_CsString("invalid format");
				}
				ch = format.get_chars(pos);
				// so long as character is digit and value of the index is less than 1000000 ( index limit )
			} while (ch >= '0' && ch <= '9' && index < 1000000);

			// If value of index is not within the range of the arguments passed in then error (Index out of range)
			if (index >= args.length)
			{
				throw new FormatException().FormatException_CsString("format specifiers out of range");
			}
			
			// Consume optional whitespace.
			while (pos < len && (ch = format.get_chars(pos)) == ' ') pos++;
			// End of parsing index parameter.

			//
			//  Start of parsing of optional Alignment
			//  Alignment ::= comma WS* minus? ('0'-'9')+ WS*
			//
			var leftJustify = false;
			var width:Int32 = 0;
			// Is the character a comma, which indicates the start of alignment parameter.
			if (ch == ',')
			{
				pos++;

				// Consume Optional whitespace
				while (pos < len && format.get_chars(pos) == ' ') pos++;

				// If reached the end of the text then error (Unexpected end of text)
				if (pos == len) throw new FormatException().FormatException_CsString("invalid format");

				// Is there a minus sign?
				ch = format.get_chars(pos);
				if (ch == '-')
				{
					// Yes, then alignment is left justified.
					leftJustify = true;
					pos++;
					// If reached end of text then error (Unexpected end of text)
					if (pos == len) throw new FormatException().FormatException_CsString("invalid format");
					ch = format.get_chars(pos);
				}
				
				// If current character is not a digit then error (Unexpected character)
				if (ch < '0' || ch > '9') throw new FormatException().FormatException_CsString("invalid format");
				// Parse alignment digits.
				do
				{
					width = width * 10 + ch - Char.fromString('0');
					pos++;
					// If reached end of text then error. (Unexpected end of text)
					if (pos == len) throw new FormatException().FormatException_CsString("invalid format");
					ch = format.get_chars(pos);
					// So long a current character is a digit and the value of width is less than 100000 ( width limit )
				} while (ch >= '0' && ch <= '9' && width < 100000);
				// end of parsing Argument Alignment
			}
			
			// Consume optional whitespace
			while (pos < len && (ch = format.get_chars(pos)) == ' ') pos++;
			
			//
			// Start of parsing of optional formatting parameter.
			//
			var arg = args[index];
			var itemFormat:CsString = null;

			// Is current character a colon? which indicates start of formatting parameter.
			if (ch == ':')
			{
				pos++;
				var startPos :Int32 = pos;

				while (true)
				{
					// If reached end of text then error. (Unexpected end of text)
					if (pos == len) throw new FormatException().FormatException_CsString("invalid format");
					ch = format.get_chars(pos);
					pos++;

					// Is character a opening or closing brace?
					if (ch == '}' || ch == '{')
					{
						if (ch == '{')
						{
							// Yes, is next character also a opening brace, then treat as escaped. eg {{
							if (pos < len && format.get_chars(pos) == '{')
								pos++;
							else
								// Error Argument Holes can not be nested.
								throw new FormatException().FormatException_CsString("invalid format");
						}
						else
						{
							// Yes, is next character also a closing brace, then treat as escaped. eg }}
							if (pos < len && format.get_chars(pos) == '}')
								pos++;
							else
							{
								// No, then treat it as the closing brace of an Arg Hole.
								pos--;
								break;
							}
						}

						// Reaching here means the brace has been escaped
						// so we need to build up the format string in segments
						if (unescapedItemFormat == null)
						{
							unescapedItemFormat = new StringBuf();
						}
						unescapedItemFormat.addSub(format, startPos.toHaxeInt(), (pos - startPos - 1).toHaxeInt());
						startPos = pos;
					}
				}

				if (unescapedItemFormat == null || unescapedItemFormat.length == 0)
				{
					if (startPos != pos)
					{
						itemFormat = format.substring_Int32_Int32(startPos, pos - startPos);
					}
				}
				else
				{
					unescapedItemFormat.addSub(format, startPos.toHaxeInt(), (pos - startPos).toHaxeInt());
					itemFormat = unescapedItemFormat.toString();
					unescapedItemFormat = new StringBuf();
				}
			}
			
			// If current character is not a closing brace then error. (Unexpected Character)
			if (ch != '}') throw new FormatException().FormatException_CsString("invalid format");

			// Construct the output for this arg hole.
			pos++;
			
			// TODO: support actual formatting
			var s:CsString = Std.string(arg);

			sb.add(s);
		}

		return sb.toString();
	}
	public static function format_CsString_Object(format:CsString, arg:system.Object) : CsString
	{
		return CsString.format(format, [arg]);
	}
	public static function format_CsString_ObjectArray(format:CsString, args:system.FixedArray<system.Object>) : CsString
	{
		return CsString.format(format, args);
	}
	public static function join_CsString_IEnumerable_T1<T>(separator:CsString, v:system.collections.generic.IEnumerable<T>) : CsString
	{
		var s = "";

		var enumerator = v.getEnumerator();
		var first = true;
		while(enumerator.moveNext())
		{
			if(!first) s += separator;
			s += Std.string(enumerator.current);
			first = false;
		}
		
		return s;
	}
	
	public static function join_CsString_IEnumerable_CsString<T>(separator:CsString, v:system.collections.generic.IEnumerable<CsString>) : CsString
	{
		var s = "";

		var enumerator = v.getEnumerator();
		var first = true;
		while(enumerator.moveNext())
		{
			if(!first) s += separator;
			s += enumerator.current;
			first = false;
		}
		
		return s;
	}

	public static function join_CsString_CsStringArray(separator:CsString, args: system.FixedArray<CsString> ) : CsString
	{
		var s = "";

		var first = true;
		for(x in args)
		{
			if(!first) s += separator;
			s += Std.string(x);
			first = false;
		}
		
		return s;
	}

	public inline function startsWith_CsString(s:CsString) : Boolean return StringTools.startsWith(this, s); 
	
	public inline function toLower() :CsString return this.toLowerCase();
	public inline function toUpper() :CsString return this.toUpperCase();
	
	@:op(A + B) public static inline function add1(lhs : system.CsString, rhs : String) : system.CsString return lhs.toHaxeString() + rhs;
	@:op(A + B) public static inline function add2(lhs : String, rhs : system.CsString) : system.CsString return lhs + rhs.toHaxeString();
	
	@:op(A + B) public static inline function add3(lhs : system.CsString, rhs : Int) : system.CsString return lhs.toHaxeString() + Std.string(rhs);
	@:op(A + B) public static inline function add4(lhs : Int, rhs : system.CsString) : system.CsString return Std.string(lhs) + rhs.toHaxeString();
	
	@:op(A + B) public static inline function add5(lhs : system.CsString, rhs : Float) : system.CsString return lhs + Std.string(rhs);
	@:op(A + B) public static inline function add6(lhs : Float, rhs : system.CsString) : system.CsString return Std.string(lhs) + rhs;

	@:op(A + B) public static inline function add7(lhs : system.CsString, rhs : system.Char) : system.CsString return lhs + rhs.toString();
	@:op(A + B) public static inline function add8(lhs : system.CsString, rhs : system.Byte) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add9(lhs : system.CsString, rhs : system.Int16) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add10(lhs : system.CsString, rhs : system.Int32) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add11(lhs : system.CsString, rhs : system.Int64) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add12(lhs : system.CsString, rhs : system.SByte) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add13(lhs : system.CsString, rhs : system.UInt16) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add14(lhs : system.CsString, rhs : system.UInt32) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add15(lhs : system.CsString, rhs : system.UInt64) : system.CsString return lhs + rhs.toString();
	@:op(A + B) public static inline function add16(lhs : system.CsString, rhs : system.Single) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add17(lhs : system.CsString, rhs : system.Double) : system.CsString return lhs + rhs.toString();
    @:op(A + B) public static inline function add18(lhs : system.CsString, rhs : system.CsString) : system.CsString return lhs.toHaxeString() + rhs.toHaxeString();
    @:op(A + B) public static inline function add19(lhs : system.CsString, rhs : system.Boolean) : system.CsString return lhs.toHaxeString() + Std.string(rhs);
}