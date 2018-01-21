package alphaTab.collections;
import system.FixedArray;
abstract FastList<T>(Array<T>) from Array<T> to Array<T>
{
	public function new() this = new Array<T>();
	
	public var Count(get, never):system.Int32;
	public inline function get_Count() : system.Int32 return this.length;	
	public inline function get_Item(index:system.Int32) : T return this[index.ToHaxeInt()];	
	public inline function set_Item(index:system.Int32, value:T) : T return this[index.ToHaxeInt()] = value;
	public inline function Add(t:T) : Void  this.push(t);	
	public inline function Clone() : FastList<T> return this.slice(0);
	public inline function RemoveAt(index:system.Int32) : Void if (index != -1) this.splice(index.ToHaxeInt(), 1);
	public inline function Remove(val:T) :Void RemoveAt(IndexOf(val));
	public inline function GetEnumerator() : Iterable<T> return this;
	public inline function IndexOf(t:T) : system.Int32 return this.indexOf(t);
	public inline function ToArray() : FixedArray<T> return FixedArray.fromArray(this);
	public inline function Sort(f:T->T->system.Int32) :Void this.sort(function(a,b) return f(a,b).ToHaxeInt());
	public inline function Reverse() : Void  this.reverse();
}
