using System.IO;

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
        private int _readBytes;

        private Stream _source;

        public BitReader(Stream source)
        {
            _source = source;
            _readBytes = 0;
            _position = ByteSize; // to ensure a byte is read on beginning
        }

        public int ReadByte() 
        {
            return ReadBits(ByteSize);
        }

        public byte[] ReadBytes(int count)
        {
            byte[] bytes = new byte[count];
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
            for (int i = count - 1; i >= 0; i--)
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
                if (_currentByte == -1) throw new EndOfStreamException();
                _readBytes++;
                _position = 0;
            }
        
            // shift the desired byte to the least significant bit and  
            // get the value using masking
            var value = (_currentByte >> (ByteSize - _position - 1)) & 0x01;
            _position++;
            return value;
        }

        public byte[] ReadAll()
        {
            var all = new MemoryStream();
            try
            {
                while (true)
                {
                    all.WriteByte((byte) ReadByte());
                }
            }
            catch (EndOfStreamException)
            {
            }
            return all.ToArray();
        }
    }
}
