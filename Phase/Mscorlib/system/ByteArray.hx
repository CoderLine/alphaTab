package system;

abstract ByteArray(js.html.Uint8Array) 
{
	public inline function new(length:Int32) this = new js.html.Uint8Array(length.toHaxeInt());
	
	@:from public static inline function fromArray(a:Array<Byte>):ByteArray return cast new js.html.Uint8Array(untyped a);
	@:from public static inline function fromFixedArray(a:FixedArray<Byte>):ByteArray return cast new js.html.Uint8Array(untyped a.toHaxeArray());
	@:from public static inline function fromArrayBuffer(a:js.html.ArrayBuffer):ByteArray return cast new js.html.Uint8Array(a);
	
	public inline function toUint8Array():js.html.Uint8Array return this;
	
	public var length(get, never):Int32;
	public inline function get_length() : Int32 return this.length;
    
    public inline function clone() : ByteArray return untyped this.slice();
	
	@:op([]) public inline function get(index:Int32):Byte return this[index.toHaxeInt()];
	@:op([]) public inline function set(index:Int32, val:Byte):Byte return this[index.toHaxeInt()] = val.toHaxeInt();
	
	public inline function iterator() : Iterator<Byte> return new ByteArrayIterator(this);
	
	public inline function toEnumerable() : system.collections.generic.IEnumerable<Byte> return new ByteArrayEnumerable(this);

	public static inline function empty(size:Int32) return new ByteArray(size);
}