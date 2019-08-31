package system;

/**
 * ...
 * @author Danielku15
 */
abstract FixedArray<T>(Array<T>) to Array<T>
{
	public inline function new(length:Int32) this = untyped __new__(Array, length.toHaxeInt());
	
	public inline function toHaxeArray<T>() : Array<T> return this;
	
	@:from public static inline function fromArray<T>(a:Array<T>):FixedArray<T> return cast a;
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : FixedArray<T> return this.slice(0);
	
	@:op([]) public inline function get(index:Int32):T return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:T):T return this[index.toHaxeInt()] = val;
	
	public inline function iterator() : Iterator<T> return this.iterator();
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<T> return new system.collections.generic.IterableEnumerable(this);

	public static inline function empty<T>(size:Int32) return new FixedArray<T>(size);
	public static inline function empty2<T>(size:Int32) return new FixedArray<FixedArray<T>>(size);
}