using System.Collections.Generic;

namespace AlphaTab.Model
{
    public class HashSet<T>
    {
        private readonly Dictionary<T, bool> _dictionary;

        public HashSet(IEnumerable<T> values)
        {
            _dictionary = new Dictionary<T, bool>();
            foreach (var value in values)
            {
                _dictionary[value] = true;
            }
        }

        public bool Contains(T value)
        {
            return _dictionary.ContainsKey(value);
        }
    }
}
