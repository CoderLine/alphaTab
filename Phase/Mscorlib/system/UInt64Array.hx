package system;

abstract UInt64Array(js.html.UInt32Array) 
{
	public inline function new(length:Int32) this = new js.html.UInt32Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<UInt64>):UInt64Array return cast new js.html.UInt32Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<UInt64>):UInt64Array return cast new js.html.UInt32Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : UInt64Array return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):UInt64 return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:UInt64):UInt64 return this[index.toHaxeInt()] = val.toHaxeFloat();
	
	public inline function iterator() : Iterator<UInt64> return new UInt64ArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<UInt64> return new UInt64ArrayEnumerable(this);

	public static inline function empty(size:Int32) return new UInt64Array(size);
}