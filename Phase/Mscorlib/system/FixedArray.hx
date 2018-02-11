package system;

private typedef ArrayData<T> = Array<T>;

/**
 * ...
 * @author Danielku15
 */
abstract FixedArray<T>(ArrayData<T>) 
{
	public inline function new(length:Int32) this = untyped __new__(Array, length.ToHaxeInt());
	
	public inline function ToHaxeArray<T>() : Array<T> return this;
	
	@:from public static inline function fromArray<T>(a:Array<T>):FixedArray<T> return cast a;
	
	public var Length(get, never):Int32;
	public inline function get_Length() : Int32 return this.length;
	
	@:op([]) public inline function get(index:Int32):T return this[index.ToHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:T):T return this[index.ToHaxeInt()] = val;
	
	public inline function iterator() : Iterator<T> return this.iterator();
	
	public inline function ToEnumerable() : system.collections.generic.IEnumerable<T> return new system.collections.generic.IterableEnumerable(this);

	public static inline function empty<T>(size:Int32) return new FixedArray<T>(size);
}