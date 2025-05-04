using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace AlphaTab.Core.EcmaScript;

public abstract class Set
{
}

public class Set<T> : Set, IEnumerable<T>, ICollection
{
    private readonly HashSet<T> _data;

    public Set()
    {
        _data = new HashSet<T>();
    }

    public double Size => _data.Count;

    public Set(IEnumerable<T>? values)
    {
        _data = values == null ? new HashSet<T>() : new HashSet<T>(values);
    }

    public void Clear()
    {
        _data.Clear();
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Add(T item)
    {
        _data.Add(item);
    }


    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public bool Has(T item)
    {
        return _data.Contains(item);
    }

    public void ForEach(Action<T> action)
    {
        foreach (var i in _data)
        {
            action(i);
        }
    }

    public IEnumerator<T> GetEnumerator()
    {
        return _data.GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public void Delete(T item)
    {
        _data.Remove(item);
    }

    int ICollection.Count => _data.Count;
    bool ICollection.IsSynchronized => false;
    object ICollection.SyncRoot => _data;
    void ICollection.CopyTo(System.Array array, int index)
    {
        _data.CopyTo((T[])array, index);
    }
}
