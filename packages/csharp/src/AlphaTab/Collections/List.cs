using System.Collections.Generic;

namespace AlphaTab.Collections;

internal class List<T> : System.Collections.Generic.List<T>
{
    public List(double size)
        : this(new T[(int)size])
    {
    }

    public List()
    {
    }

    public List(IEnumerable<T> collection) : base(collection)
    {
    }
}
