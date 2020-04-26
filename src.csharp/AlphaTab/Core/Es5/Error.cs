namespace AlphaTab.Core.Es5
{
    public class Error : System.Exception
    {
        public Error()
        {
        }

        public Error(string message) : base(message)
        {

        }

        public string Stack { get; set; }
    }
}
