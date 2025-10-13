namespace AlphaTab.Importer.AlphaTex;

partial class AlphaTex1EnumMappings
{
    private static T _toEnum<T>(object? type, double value)
    {
        // Unsafe.BitCast in future
        return (T)(object)(int)value;
    }
}
