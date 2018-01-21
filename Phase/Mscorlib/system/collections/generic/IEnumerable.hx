package system.collections.generic;

interface IEnumerable<T>
{
	function GetEnumerator() : IEnumerator<T>;
}