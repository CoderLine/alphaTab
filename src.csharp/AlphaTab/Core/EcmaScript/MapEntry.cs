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

        public dynamic this[int index]
        {
            get { return index == 0 ? (object) Key : Value; }
        }
    }
}
