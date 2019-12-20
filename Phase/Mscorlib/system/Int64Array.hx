package system;

abstract Int64Array(js.html.Int32Array) 
{
	public inline function new(length:Int32) this = new js.html.Int32Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Int64>):Int64Array return cast new js.html.Int32Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Int64>):Int64Array return cast new js.html.Int32Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : Int64Array return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):Int64 return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Int64):Int64 return this[index.toHaxeInt()] = val.toHaxeFloat();
	
	public inline function iterator() : Iterator<Int64> return new Int64ArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<Int64> return new Int64ArrayEnumerable(this);

	public static inline function empty(size:Int32) return new Int64Array(size);
}