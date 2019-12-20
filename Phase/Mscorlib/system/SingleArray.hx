package system;

abstract SingleArray(js.html.Float32Array) 
{
	public inline function new(length:Int32) this = new js.html.Float32Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Single>):SingleArray return cast new js.html.Float32Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Single>):SingleArray return cast new js.html.Float32Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : SingleArray return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):Single return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Single):Single return this[index.toHaxeInt()] = val.toHaxeFloat();
	
	public inline function iterator() : Iterator<Single> return new SingleArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<Single> return new SingleArrayEnumerable(this);

	public static inline function empty(size:Int32) return new SingleArray(size);
}