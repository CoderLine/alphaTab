using AlphaTab.Collections;

namespace AlphaTab.Core.EcmaScript;

public class Record<TKey, TValue> : Map<TKey, TValue>
{
    public Record()
    {
    }

    public Record(params AlphaTab.Core.ArrayTuple<TKey, TValue>[] items)
        : base(items)
    {
    }
}
