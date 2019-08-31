package system;

abstract UInt32Array(js.html.Uint32Array) 
{
	public inline function new(length:Int32) this = new js.html.Uint32Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<UInt32>):UInt32Array return cast new js.html.Uint32Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<UInt32>):UInt32Array return cast new js.html.Uint32Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : UInt32Array return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):UInt32 return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:UInt32):UInt32 return this[index.toHaxeInt()] = val.toHaxeFloat();
	
	public inline function iterator() : Iterator<UInt32> return new UInt32ArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<UInt32> return new UInt32ArrayEnumerable(this);

	public static inline function empty(size:Int32) return new UInt32Array(size);
}