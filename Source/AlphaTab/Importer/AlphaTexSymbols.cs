namespace AlphaTab.Importer
{
    /// <summary>
    /// A list of terminals recognized by the alphaTex-parser
    /// </summary>
    enum AlphaTexSymbols
    {
        No,
        Eof,
        Number,
        DoubleDot,
        Dot,
        String,
        Tuning,
        LParensis,
        RParensis,
        LBrace,
        RBrace,
        Pipe,
        MetaCommand,
        Multiply,
        LowerThan,
        Property,
    }
}