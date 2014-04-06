using System.Text;

namespace AlphaTab.IO
{
    public class StringStream : MemoryStream
    {
        public StringStream(string s)
            :base (GetBytes(s))
        {
        }

        private static ByteArray GetBytes(string s)
        {
#if CSharp
            return new ByteArray(Encoding.ASCII.GetBytes(s));
#elif JavaScript
            ByteArray data = new ByteArray(s.Length);
            for(var i = 0; i < s.Length; i++)
            {
                data[i] = (byte)s[i];
            }
            return data;
#endif
        }
    }
}
