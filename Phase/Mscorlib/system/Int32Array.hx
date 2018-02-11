package system;

abstract Int32Array(js.html.Int32Array) 
{
	public inline function new(length:Int32) this = new js.html.Int32Array(length.ToHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Int32>):Int32Array return cast new js.html.Int32Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Int32>):Int32Array return cast new js.html.Int32Array(untyped a.ToHaxeArray());
	
	public var Length(get, never):Int32;
	public inline function get_Length() : Int32 return this.length;
	
	@:op([]) public inline function get(index:Int32):Int32 return this[index.ToHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Int32):Int32 return this[index.ToHaxeInt()] = val.ToHaxeInt();
	
	public inline function iterator() : Iterator<Int32> return new Int32ArrayIterator(this);
	
	public inline function ToEnumerable() : system.collections.generic.IEnumerable<Int32> return new Int32ArrayEnumerable(this);

	public static inline function empty(size:Int32) return new Int32Array(size);
}