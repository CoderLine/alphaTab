using System.Runtime.CompilerServices;

namespace AlphaTab.IO
{
    [IncludeGenericArguments(false)]
    [IgnoreNamespace]
    [Imported(ObeysTypeSystem = true)]
    [ScriptName("Uint8Array")]
    public class ByteArray 
    {
        private readonly byte[] _data;
        
        public byte[] Data
        {
            get
            {
                return _data;
            }
        }

        [InlineCode("new Uint8Array({size})")]
        public ByteArray(int size)
        {
            _data = new byte[size];
        }

        [InlineCode("new Uint8Array({data})")]
        public ByteArray(params byte[] data)
        {
            _data = data;
        }

        public int Length
        {
            [InlineCode("{this}.length")]
            get
            {
                return _data.Length;
            }
        }

        [IntrinsicProperty]
        public byte this[int index]
        {
            get
            {
                return _data[index];
            }
            set
            {
                _data[index] = value;
            }
        }
    }
}
