package system.collections.generic;

interface IEnumerator<T>
{
	var current(get, never):T;
	function moveNext() : Bool;
	function reset():Void;
}