using AlphaTab.Importer.AlphaTex;

namespace AlphaTab;

internal partial class AlphaTexAstNodePlugin
{
    public bool Test(object? arg0)
    {
        return arg0 is AlphaTexAstNode;
    }
}

internal partial class AlphaTexDiagnosticPlugin
{
    public bool Test(object? arg0)
    {
        return arg0 is AlphaTexDiagnostic;
    }
}
