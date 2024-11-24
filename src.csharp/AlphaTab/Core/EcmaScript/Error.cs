namespace AlphaTab.Core.EcmaScript

{
    public class Error : System.Exception
    {
        public Error? Cause 
        {
            get
            {
                return InnerException is Error e ? e : null;
            }
        }
        public Error(string message) : base(message)
        {
        }
        public Error(string message, System.Exception inner) : base(message, inner)
        {
        }

        public string Stack => StackTrace;
    }
}
