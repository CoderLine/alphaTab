package system;

abstract Int16Array(js.html.Int16Array) 
{
	public inline function new(length:Int32) this = new js.html.Int16Array(length.ToHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Int16>):Int16Array return cast new js.html.Int16Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Int16>):Int16Array return cast new js.html.Int16Array(untyped a.ToHaxeArray());
	
	public var Length(get, never):Int32;
	public inline function get_Length() : Int32 return this.length;
	
	@:op([]) public inline function get(index:Int32):Int16 return this[index.ToHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Int16):Int16 return this[index.ToHaxeInt()] = val.ToHaxeFloat();
	
	public inline function iterator() : Iterator<Int16> return new Int16ArrayIterator(this);
	
	public inline function ToEnumerable() : system.collections.generic.IEnumerable<Int16> return new Int16ArrayEnumerable(this);

	public static inline function empty(size:Int32) return new Int16Array(size);
}