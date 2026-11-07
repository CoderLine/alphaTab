namespace AlphaTab.Core;

/// <summary>
/// A mixed-type array tuple (like <code>[string, number]</code> in JavaScript).
/// </summary>
public class ArrayTuple<T0, T1>
{
    public T0 V0 { get; set; }
    public T1 V1 { get; set;}

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

/// <summary>
/// A mixed-type array tuple of three items (like <code>[number, number, number[]]</code> in JavaScript).
/// </summary>
public class ArrayTuple<T0, T1, T2>
{
    public T0 V0 { get; set; }
    public T1 V1 { get; set; }
    public T2 V2 { get; set; }

    public ArrayTuple(T0 v0, T1 v1, T2 v2)
    {
        V0 = v0;
        V1 = v1;
        V2 = v2;
    }

    public void Deconstruct(out T0 v0, out T1 v1, out T2 v2)
    {
        v0 = V0;
        v1 = V1;
        v2 = V2;
    }

    public override string ToString()
    {
        return $"[{V0}, {V1}, {V2}]";
    }
}
