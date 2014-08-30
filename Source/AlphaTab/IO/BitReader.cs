namespace AlphaTab.IO
{
    /// <summary>
    /// This utility public class allows bitwise reading of a stream
    /// </summary>
    public class BitReader
    {
        private const int ByteSize = 8; // size of byte in bits

        private int _currentByte; // the currently read byte
        private int _position; // the current bit position within the current byte

        private readonly IReadable _source;

        public BitReader(IReadable source)
        {
            _source = source;
            _position = ByteSize; // to ensure a byte is read on beginning
        }

        public int ReadByte() 
        {
            return ReadBits(ByteSize);
        }

        public ByteArray ReadBytes(int count)
        {
            ByteArray bytes = new ByteArray(count);
            for (int i = 0; i < count; i++)
            {
                bytes[i] = (byte) ReadByte();
            }
            return bytes;
        }
    
        public int ReadBits(int count) 
        {
            var bits = 0;
            var i = count - 1; 
            while ( i >= 0 ) 
            {
                bits |= (ReadBit() << i);
                i--;
            }
            return bits;
        }
    
        public int ReadBitsReversed(int count)
        {
            var bits = 0;
            for (int i = 0; i < count; i++)
            {
                bits |= (ReadBit() << i);
            }
            return bits;
        }
    
        public int ReadBit() 
        {
            // need a new byte? 
            if (_position >= ByteSize)
            {
                _currentByte = _source.ReadByte();
                if (_currentByte == -1) throw new EndOfReaderException();
                _position = 0;
            }
        
            // shift the desired byte to the least significant bit and  
            // get the value using masking
            var value = (_currentByte >> (ByteSize - _position - 1)) & 0x01;
            _position++;
            return value;
        }

        public ByteArray ReadAll()
        {
            var all = new ByteBuffer();
            try
            {
                while (true)
                {
                    all.WriteByte((byte) ReadByte());
                }
            }
            catch (EndOfReaderException)
            {
            }
            return all.ToArray();
        }
    }
}