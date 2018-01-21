package alphaTab.collections;

abstract FastDictionary<TKey, TValue>(Dynamic)
{
	public function new() this = alphaTab.platform.Platform.NewObject();
	public var Count(get, never):system.Int32;
	public function get_Count():system.Int32 return alphaTab.platform.Platform.JsonKeys(this).Length;
	
	public inline function get_Item(index:TKey) :TValue return untyped this[index];
	public inline function set_Item(index:TKey, value:TValue) :TValue return untyped this[index] = value;
	public inline function ContainsKey(index:TKey) : Bool return untyped this.hasOwnProperty(index);
	public inline function Remove(index:TKey) : Bool return untyped __js__("delete {0}[{1}]", this, index);
	
	public inline function GetEnumerator() : Array<TKey> return untyped alphaTab.platform.Platform.JsonKeys(this);
}