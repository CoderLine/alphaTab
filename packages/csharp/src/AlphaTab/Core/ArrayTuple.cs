namespace AlphaTab.Core;

/// <summary>
/// A mixed-type array tuple (like <code>[string, number]</code> in JavaScript).
/// </summary>
public readonly struct ArrayTuple<T0, T1>
{
    public T0 V0 { get; }
    public T1 V1 { get; }

    public ArrayTuple(T0 v0, T1 v1)
    {
        V0 = v0;
        V1 = v1;
    }

    public void Deconstruct(out T0 v0, out T1 v1)
    {
        v0 = V0;
        v1 = V1;
    }

    public override string ToString()
    {
        return $"[{V0}, {V1}]";
    }
}
