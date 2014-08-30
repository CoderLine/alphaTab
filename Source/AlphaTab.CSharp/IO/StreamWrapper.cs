using System;
using System.IO;

namespace AlphaTab.IO
{
    public sealed class StreamWrapper : IReadable, IWriteable, IDisposable
    {
        private readonly Stream _stream;

        public StreamWrapper(Stream stream)
        {
            _stream = stream;
        }

        public void Reset()
        {
            _stream.Seek(0, SeekOrigin.Begin);
        }

        public void Skip(int offset)
        {
            _stream.Seek(offset, SeekOrigin.Current);
        }

        public int ReadByte()
        {
            return _stream.ReadByte();
        }

        public int Read(ByteArray buffer, int offset, int count)
        {
            return _stream.Read(buffer.Data, offset, count);
        }

        public void WriteByte(byte value)
        {
            _stream.WriteByte(value);
        }

        public void Write(ByteArray buffer, int offset, int count)
        {
            _stream.Write(buffer.Data, offset, count);
        }

        public void Dispose()
        {
            _stream.Dispose();
        }
    }
}
