using System.Collections.Generic;

namespace AlphaTab.Importer.AlphaTex;

internal class SimpleAlphaTexParameterDefinition
{
    public double Length { get; }
    public IList<AlphaTexNodeType> V0 { get; }
    public ArgumentListParseTypesMode V1 { get; }
    public IList<string>? V2 { get; }
    public IList<string>? V3 { get; }

    public SimpleAlphaTexParameterDefinition(
        IList<AlphaTexNodeType> types,
        ArgumentListParseTypesMode parseMode
        )
    {
        V0 = types;
        V1 = parseMode;
        V2 = null;
        V3 = null;
        Length = 2;
    }

    public SimpleAlphaTexParameterDefinition(
        IList<AlphaTexNodeType> types,
        ArgumentListParseTypesMode parseMode,
        IList<string>? allowedValues)
    {
        V0 = types;
        V1 = parseMode;
        V2 = allowedValues;
        V3 = null;
        Length = 3;
    }

    public SimpleAlphaTexParameterDefinition(
        IList<AlphaTexNodeType> types,
        ArgumentListParseTypesMode parseMode,
        IList<string>? allowedValues,
        IList<string>? reservedIdentifiers)
    {
        V0 = types;
        V1 = parseMode;
        V2 = allowedValues;
        V3 = reservedIdentifiers;
        Length = 4;
    }
}
