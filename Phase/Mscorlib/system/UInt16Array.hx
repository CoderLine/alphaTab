package system;

abstract UInt16Array(js.html.Uint16Array) 
{
	public inline function new(length:Int32) this = new js.html.Uint16Array(length.ToHaxeInt());
	
	@:from public static inline function fromArray(a:Array<UInt16>):UInt16Array return cast new js.html.Uint16Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<UInt16>):UInt16Array return cast new js.html.Uint16Array(untyped a.ToHaxeArray());
	
	public var Length(get, never):Int32;
	public inline function get_Length() : Int32 return this.length;
	
	@:op([]) public inline function get(index:Int32):UInt16 return this[index.ToHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:UInt16):UInt16 return this[index.ToHaxeInt()] = val.ToHaxeFloat();
	
	public inline function iterator() : Iterator<UInt16> return new UInt16ArrayIterator(this);
	
	public inline function ToEnumerable() : system.collections.generic.IEnumerable<UInt16> return new UInt16ArrayEnumerable(this);

	public static inline function empty(size:Int32) return new UInt16Array(size);
}