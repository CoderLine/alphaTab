using AlphaTab.Platform;

namespace AlphaTab.IO
{
    public partial class ByteBuffer : IWriteable, IReadable
    {
        private ByteArray _buffer;
        private int _position;
        private int _length;
        private int _capacity;

        public long Length
        {
            get
            {
                return _length;
            }
        }

        public virtual ByteArray GetBuffer()
        {
            return _buffer;
        }

        public ByteBuffer()
            : this(0)
        {
        }

        public ByteBuffer(int capacity)
        {
            _buffer = new ByteArray(capacity);
            _capacity = capacity;
        }

        public ByteBuffer(ByteArray buffer)
        {
            _buffer = buffer;
            _length = _capacity = buffer.Length;
        }

        public void Reset()
        {
            _position = 0;
        }

        public void Skip(int offset)
        {
            _position += offset;
        }

        private void SetCapacity(int value)
        {
            if (value != _capacity)
            {
                if (value > 0)
                {
                    var newBuffer = new ByteArray(value);
                    if (_length > 0) Std.BlockCopy(_buffer, 0, newBuffer, 0, _length);
                    _buffer = newBuffer;
                }
                else
                {
                    _buffer = null;
                }
                _capacity = value;
            }
        }

        public int ReadByte()
        {
            int n = _length - _position;
            if (n <= 0)
                return -1;

            return _buffer[_position++];
        }

        public int Read(ByteArray buffer, int offset, int count)
        {
            int n = _length - _position;
            if (n > count) n = count;
            if (n <= 0)
                return 0;

            if (n <= 8)
            {
                int byteCount = n;
                while (--byteCount >= 0)
                    buffer[offset + byteCount] = _buffer[_position + byteCount];
            }
            else
                Std.BlockCopy(_buffer, _position, buffer, offset, n);
            _position += n;

            return n;
        }

        public void WriteByte(byte value)
        {
            ByteArray buffer = new ByteArray(1);
            buffer[0] = value;
            Write(buffer, 0, 1);
        }

        public void Write(ByteArray buffer, int offset, int count)
        {
            int i = _position + count;
            
            if (i > _length)
            {
                if (i > _capacity)
                {
                    EnsureCapacity(i);
                }
                _length = i;
            }
            if ((count <= 8) && (buffer != _buffer))
            {
                int byteCount = count;
                while (--byteCount >= 0)
                    _buffer[_position + byteCount] = buffer[offset + byteCount];
            }
            else
                Std.BlockCopy(buffer, offset, _buffer, _position, count);
            _position = i;
        }

        private void EnsureCapacity(int value)
        {
            if (value > _capacity)
            {
                int newCapacity = value;
                if (newCapacity < 256)
                    newCapacity = 256;
                if (newCapacity < _capacity * 2)
                    newCapacity = _capacity * 2;
                SetCapacity(newCapacity);
            }
        }

        public virtual ByteArray ToArray()
        {
            ByteArray copy = new ByteArray(_length);
            Std.BlockCopy(_buffer, 0, copy, 0, _length);
            return copy;
        }
    }
}