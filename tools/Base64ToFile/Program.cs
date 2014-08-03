using System;
using System.IO;

namespace Base64ToFile
{
    class Program
    {
        static void Main(string[] args)
        {
            File.WriteAllBytes(args[0] + ".decoded", Convert.FromBase64String(File.ReadAllText(args[0])));
        }
    }
}
