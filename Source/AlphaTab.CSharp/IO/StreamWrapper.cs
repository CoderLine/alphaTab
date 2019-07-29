using System;
using System.IO;

namespace AlphaTab.IO
{
    sealed class StreamWrapper : IReadable, IWriteable, IDisposable
    {
        public Stream Stream { get; }

        public int Position
        {
            get { return (int)Stream.Position; }
            set { Stream.Position = value; }
        }

        public int Length => (int)Stream.Length;

        public StreamWrapper(Stream stream)
        {
            Stream = stream;
        }

        public void Reset()
        {
            Stream.Seek(0, SeekOrigin.Begin);
        }

        public void Skip(int offset)
        {
            Stream.Seek(offset, SeekOrigin.Current);
        }

        public int ReadByte()
        {
            return Stream.ReadByte();
        }

        public int Read(byte[] buffer, int offset, int count)
        {
            return Stream.Read(buffer, offset, count);
        }

        public void WriteByte(byte value)
        {
            Stream.WriteByte(value);
        }

        public void Write(byte[] buffer, int offset, int count)
        {
            Stream.Write(buffer, offset, count);
        }

        public byte[] ReadAll()
        {
            using (var ms = new MemoryStream())
            {
                Stream.CopyTo(ms);
                return ms.ToArray();
            }
        }

        public void Dispose()
        {
            Stream.Dispose();
        }
    }
}
