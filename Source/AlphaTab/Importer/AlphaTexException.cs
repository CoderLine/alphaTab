namespace AlphaTab.Importer
{
    internal class AlphaTexException : AlphaTabException
    {
        public int Position { get; set; }
        public string NonTerm { get; set; }
        public AlphaTexSymbols Expected { get; set; }
        public AlphaTexSymbols Symbol { get; set; }
        public object SymbolData { get; set; }

        public static AlphaTexException SymbolError(
            int position,
            string nonTerm,
            AlphaTexSymbols expected,
            AlphaTexSymbols symbol,
            object symbolData = null)
        {
            string message;
            if (symbolData == null)
            {
                message = "MalFormed AlphaTex: @" + position + ": Error on block " + nonTerm +
                          ", expected a " + expected + " found a " + symbol;
            }
            else
            {
                message = "MalFormed AlphaTex: @" + position + ": Error on block " + nonTerm +
                          ", invalid value: " + symbolData;
            }

            var exception = new AlphaTexException(message);
            exception.Position = position;
            exception.NonTerm = nonTerm;
            exception.Expected = expected;
            exception.Symbol = symbol;
            exception.SymbolData = symbolData;
            return exception;
        }

        public AlphaTexException(string message)
            : base(message)
        {
        }

        public static AlphaTexException ErrorMessage(int position, string message)
        {
            message = "MalFormed AlphaTex: @" + position + ": " + message;
            var exception = new AlphaTexException(message);
            exception.Position = position;
            return exception;
        }
    }
}
