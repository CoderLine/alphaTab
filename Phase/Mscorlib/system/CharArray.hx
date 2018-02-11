package system;

abstract CharArray(js.html.Uint16Array) 
{
	public inline function new(length:Int32) this = new js.html.Uint16Array(length.ToHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Char>):CharArray return cast new js.html.Uint16Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Char>):CharArray return cast new js.html.Uint16Array(untyped a.ToHaxeArray());
	
	public var Length(get, never):Int32;
	public inline function get_Length() : Int32 return this.length;
	
	@:op([]) public inline function get(index:Int32):Char return this[index.ToHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Char):Char return this[index.ToHaxeInt()] = val.ToHaxeInt();
	
	public inline function iterator() : Iterator<Char> return new CharArrayIterator(this);
	
	public inline function ToEnumerable() : system.collections.generic.IEnumerable<Char> return new CharArrayEnumerable(this);

	public static inline function empty(size:Int32) return new CharArray(size);
}