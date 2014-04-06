using System;
using System.Runtime.CompilerServices;

namespace AlphaTab.Importer
{
    public class AlphaTexException : Exception
    {
        [IntrinsicProperty]
        public int Position { get; set; }
        [IntrinsicProperty]
        public string NonTerm { get; set; }
        [IntrinsicProperty]
        public AlphaTexSymbols Expected { get; set; }
        [IntrinsicProperty]
        public AlphaTexSymbols Symbol { get; set; }
        [IntrinsicProperty]
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