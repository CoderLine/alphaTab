package system;

abstract SingleArray(js.html.Float32Array) 
{
	public inline function new(length:Int32) this = new js.html.Float32Array(length.ToHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Single>):SingleArray return cast new js.html.Float32Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Single>):SingleArray return cast new js.html.Float32Array(untyped a.ToHaxeArray());
	
	public var Length(get, never):Int32;
	public inline function get_Length() : Int32 return this.length;
	
	@:op([]) public inline function get(index:Int32):Single return this[index.ToHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Single):Single return this[index.ToHaxeInt()] = val.ToHaxeFloat();
	
	public inline function iterator() : Iterator<Single> return new SingleArrayIterator(this);
	
	public inline function ToEnumerable() : system.collections.generic.IEnumerable<Single> return new SingleArrayEnumerable(this);

	public static inline function empty(size:Int32) return new SingleArray(size);
}