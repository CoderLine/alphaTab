using System;

namespace AlphaTab.Importer
{
    public class AlphaTexException : Exception
    {
        public int Position { get; set; }
        public string NonTerm { get; set; }
        public AlphaTexSymbols Expected { get; set; }
        public AlphaTexSymbols Symbol { get; set; }
        public object SymbolData { get; set; }

        public override string Message
        {
            get
            {
                if (SymbolData == null)
                {
                    return Position + ": Error on block " + NonTerm +
                           ", expected a " + Expected + " found a " + Symbol;
                }

                return Position + ": Error on block " + NonTerm +
                       ", invalid value: " + SymbolData;
            }
        }

        public AlphaTexException(int position, string nonTerm, AlphaTexSymbols expected, AlphaTexSymbols symbol, object symbolData = null)
        {
            Position = position;
            NonTerm = nonTerm;
            Expected = expected;
            Symbol = symbol;
            SymbolData = symbolData;
        }
    }
}