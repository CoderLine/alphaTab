using System.Runtime.CompilerServices;

namespace AlphaTab.IO
{
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

        public ByteArray(int size)
        {
            _data = NewByteArray(size);
        }

        public ByteArray(params byte[] data)
        {
#if CSharp
            _data = data;
#elif JavaScript
            _data = NewByteArray(data.Length);
            CopyFromArray(_data, data);
#endif
        }

#if JavaScript
        [InlineCode("{dst}.set({src})")]
        private static void CopyFromArray(byte[] dst, byte[] src)
        {

        }
#endif

        [InlineCode("new Uint8Array({size})")]
        private byte[] NewByteArray(int size)
        {
            return new byte[size];
        }

        public int Length
        {
            get
            {
                return _data.Length;
            }
        }

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
