using System;
using System.IO;

namespace AlphaTab.IO
{
    class ReadableStream : Stream
    {
        private readonly IReadable _readable;

        private ReadableStream(IReadable readable)
        {
            _readable = readable;
        }

        public static Stream Create(IReadable readable)
        {
            if (readable is StreamWrapper wrapper)
            {
                return wrapper.Stream;
            }
            else if (readable is ByteBuffer buffer)
            {
                return new MemoryStream(buffer.GetBuffer(), false);
            }

            return new ReadableStream(readable);
        }


        public override void Flush()
        {
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            switch (origin)
            {
                case SeekOrigin.Begin:
                    _readable.Position = (int)offset;
                    break;
                case SeekOrigin.Current:
                    _readable.Position += (int)offset;
                    break;
                case SeekOrigin.End:
                    _readable.Position = _readable.Length - (int)offset - 1;
                    break;
            }

            return _readable.Position;
        }

        public override void SetLength(long value)
        {
            throw new NotSupportedException();
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            return _readable.Read(buffer, offset, count);
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            throw new NotSupportedException();
        }

        public override bool CanRead => true;
        public override bool CanSeek => true;
        public override bool CanWrite => false;
        public override long Length => _readable.Length;

        public override long Position
        {
            get => _readable.Position;
            set => _readable.Position = (int)value;
        }
    }
}
