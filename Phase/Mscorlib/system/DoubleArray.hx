package system;

abstract DoubleArray(js.html.Float64Array) 
{
	public inline function new(length:Int32) this = new js.html.Float64Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Double>):DoubleArray return cast new js.html.Float64Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Double>):DoubleArray return cast new js.html.Float64Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : DoubleArray return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):Double return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Double):Double return this[index.toHaxeInt()] = val.toHaxeFloat();
	
	public inline function iterator() : Iterator<Double> return new DoubleArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<Double> return new DoubleArrayEnumerable(this);

	public static inline function empty(size:Int32) return new DoubleArray(size);
}