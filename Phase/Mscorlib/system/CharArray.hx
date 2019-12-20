package system;

abstract CharArray(js.html.Uint16Array) 
{
	public inline function new(length:Int32) this = new js.html.Uint16Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Char>):CharArray return cast new js.html.Uint16Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Char>):CharArray return cast new js.html.Uint16Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : CharArray return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):Char return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Char):Char return this[index.toHaxeInt()] = val.toHaxeInt();
	
	public inline function iterator() : Iterator<Char> return new CharArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<Char> return new CharArrayEnumerable(this);

	public static inline function empty(size:Int32) return new CharArray(size);
}