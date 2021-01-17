namespace AlphaTab.Core.EcmaScript
{
    public class MapEntry<TKey, TValue>
    {
        public TKey Key { get; set; }
        public TValue Value { get; set; }

        public MapEntry(TKey key, TValue value)
        {
            Key = key;
            Value = value;
        }

        public void Deconstruct(out TKey key, out TValue value)
        {
            key = Key;
            value = Value;
        }
    }
}
