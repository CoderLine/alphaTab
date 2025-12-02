namespace AlphaTab;

partial class ScoreSerializerPlugin
{
    private static bool _isPlatformTypeEqual(object? a, object? b)
    {
        throw new Error("Unexpected value in serialized json" + a?.GetType().FullName);
    }
}
