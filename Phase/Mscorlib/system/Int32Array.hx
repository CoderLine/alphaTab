package system;

abstract Int32Array(js.html.Int32Array)
{
	public inline function new(length:Int32) this = new js.html.Int32Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Int32>):Int32Array return cast new js.html.Int32Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Int32>):Int32Array return cast new js.html.Int32Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : Int32Array return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):Int32 return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Int32):Int32 return this[index.toHaxeInt()] = val.toHaxeInt();
	
	public inline function iterator() : Iterator<Int32> return new Int32ArrayIterator(this);
	
	@:to public inline function toEnumerable() : system.collections.generic.IEnumerable<Int32> return new Int32ArrayEnumerable(this);

	public static inline function empty(size:Int32) return new Int32Array(size);
}