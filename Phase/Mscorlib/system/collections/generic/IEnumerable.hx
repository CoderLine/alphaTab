package system.collections.generic;

interface IEnumerable<T>
{
	function getEnumerator() : IEnumerator<T>;
}