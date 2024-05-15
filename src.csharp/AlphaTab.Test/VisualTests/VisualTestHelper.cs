namespace AlphaTab.VisualTests;

internal static partial class VisualTestHelper
{
    // ReSharper disable once UnusedParameter.Local
    private static void EnableAlphaSkia(ArrayBuffer bravura)
    {
        Environment.EnableAlphaSkia(
            bravura,
            null
        );
    }
}
