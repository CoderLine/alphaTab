using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlphaTab.Utils
{
    public class SerializationException : AlphaTabException
    {
        public SerializationException(string message) : base(message)
        {
        }
    }
}
