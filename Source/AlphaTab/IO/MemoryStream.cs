using AlphaTab.Platform;

namespace AlphaTab.IO
{
    public class MemoryStream : Stream
    {
        private ByteArray _buffer;
        private int _position;
        private int _length;
        private int _capacity;

        public virtual int Capacity
        {
            get
            {
                return _capacity;
            }
            set
            {
                if (value != _capacity)
                {
                    if (value > 0)
                    {
                        ByteArray newBuffer = new ByteArray(value);
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
        }

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

        public MemoryStream()
            : this(0)
        {

        }

        public MemoryStream(int capacity)
        {
            _buffer = new ByteArray(capacity);
            _capacity = capacity;
        }

        public MemoryStream(ByteArray buffer)
        {
            _buffer = buffer;
            _length = _capacity = buffer.Length;
        }

        public override long Seek(long offset, SeekOrigin loc)
        {
            switch (loc)
            {
                case SeekOrigin.Begin:
                    {
                        int tempPosition = (int)offset;
                        if (offset < 0 || tempPosition < 0)
                            throw new IOException("cannot seek before begin of stream");
                        _position = tempPosition;
                        break;
                    }
                case SeekOrigin.Current:
                    {
                        int tempPosition = unchecked(_position + (int)offset);
                        if ((_position + offset) < 0 || tempPosition < 0)
                            throw new IOException("cannot seek before begin of stream");
                        _position = tempPosition;
                        break;
                    }
                case SeekOrigin.End:
                    {
                        int tempPosition = unchecked(_length + (int)offset);
                        if ((_length + offset) < 0 || tempPosition < 0)
                            throw new IOException("cannot seek before begin of stream");
                        _position = tempPosition;
                        break;
                    }
            }

            return _position;
        }


        public override void Flush()
        {
        }

        public override int ReadByte()
        {
            int n = _length - _position;
            if (n <= 0)
                return -1;

            return _buffer[_position++];
        }

        public override int Read(ByteArray buffer, int offset, int count)
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

        public override void Write(ByteArray buffer, int offset, int count)
        {
            int i = _position + count;
            // Check for overflow
            if (i < 0)
                throw new IOException("Stream overflow, too much bytes in stream");

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

        private bool EnsureCapacity(int value)
        {
            // Check for overflow
            if (value < 0)
                throw new IOException("Stream overflow, too much bytes in stream");

            if (value > _capacity)
            {
                int newCapacity = value;
                if (newCapacity < 256)
                    newCapacity = 256;
                if (newCapacity < _capacity * 2)
                    newCapacity = _capacity * 2;
                Capacity = newCapacity;
                return true;
            }
            return false;
        }

        public virtual ByteArray ToArray()
        {
            ByteArray copy = new ByteArray(_length);
            Std.BlockCopy(_buffer, 0, copy, 0, _length);
            return copy;
        }
    }
}