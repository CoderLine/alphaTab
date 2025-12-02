package alphaTab.importer.alphaTex

internal class SimpleAlphaTexParameterDefinition {
    val length: Double
    val v0: alphaTab.collections.List<AlphaTexNodeType>
    val v1: ArgumentListParseTypesMode
    val v2: alphaTab.collections.List<String>?
    val v3: alphaTab.collections.List<String>?

    public constructor(
        types: alphaTab.collections.List<AlphaTexNodeType>,
        parseMode: ArgumentListParseTypesMode
    ) {
        v0 = types
        v1 = parseMode
        v2 = null
        v3 = null
        length = 2.0
    }

    public constructor(
        types: alphaTab.collections.List<AlphaTexNodeType>,
        parseMode: ArgumentListParseTypesMode,
        allowedValues: alphaTab.collections.List<String>?
    ) {
        v0 = types
        v1 = parseMode
        v2 = allowedValues
        v3 = null
        length = 3.0
    }

    public constructor(
        types: alphaTab.collections.List<AlphaTexNodeType>,
        parseMode: ArgumentListParseTypesMode,
        allowedValues: alphaTab.collections.List<String>?,
        reservedIdentifiers: alphaTab.collections.List<String>?
    ) {
        v0 = types
        v1 = parseMode
        v2 = allowedValues
        v3 = reservedIdentifiers
        length = 4.0
    }
}
