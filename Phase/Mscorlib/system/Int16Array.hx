package system;

abstract Int16Array(js.html.Int16Array) 
{
	public inline function new(length:Int32) this = new js.html.Int16Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Int16>):Int16Array return cast new js.html.Int16Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Int16>):Int16Array return cast new js.html.Int16Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : Int16Array return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):Int16 return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Int16):Int16 return this[index.toHaxeInt()] = val.toHaxeInt();
	
	public inline function iterator() : Iterator<Int16> return new Int16ArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<Int16> return new Int16ArrayEnumerable(this);

	public static inline function empty(size:Int32) return new Int16Array(size);
}