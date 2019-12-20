package system;

abstract SByteArray(js.html.Int8Array) 
{
	public inline function new(length:Int32) this = new js.html.Int8Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<SByte>):SByteArray return cast new js.html.Int8Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<SByte>):SByteArray return cast new js.html.Int8Array(untyped a.toHaxeArray());
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : SByteArray return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):SByte return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:SByte):SByte return this[index.toHaxeInt()] = val.toHaxeFloat();
	
	public inline function iterator() : Iterator<SByte> return new SByteArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<SByte> return new SByteArrayEnumerable(this);

	public static inline function empty(size:Int32) return new SByteArray(size);
}