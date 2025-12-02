using System;

// ReSharper disable once CheckNamespace
namespace AlphaTab.Test;

[AttributeUsage(AttributeTargets.Method, Inherited = false)]
sealed class SnapshotFileAttribute : Attribute
{
    public string Path { get; }

    public SnapshotFileAttribute(string path)
    {
        Path = path;
    }
}
