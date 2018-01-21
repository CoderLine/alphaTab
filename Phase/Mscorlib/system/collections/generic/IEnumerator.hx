package system.collections.generic;

interface IEnumerator<T>
{
	var Current(get, never):T;
	function MoveNext() : Bool;
	function Reset():Void;
}