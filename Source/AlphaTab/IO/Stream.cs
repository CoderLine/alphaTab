using System;

namespace AlphaTab.IO
{
    public abstract class Stream : IDisposable
    {
        public virtual void Close()
        {
            Dispose(true);
#if CSharp
            GC.SuppressFinalize(this);
#endif
        }

        public void Dispose()
        {
            Close();
        }

        protected virtual void Dispose(bool disposing)
        {
        }
        public abstract long Seek(long offset, SeekOrigin origin);
        public abstract void Flush();

        public abstract void Write(ByteArray buffer, int offset, int count);
        public virtual void WriteByte(byte value)
        {
            ByteArray buffer = new ByteArray(1);
            buffer[0] = value;
            Write(buffer, 0, 1);
        }

        public abstract int Read(ByteArray buffer, int offset, int count);
        public virtual int ReadByte()
        {
            ByteArray buffer = new ByteArray(1);
            int r = Read(buffer, 0, 1);
            if (r == 0)
                return -1;
            return buffer[0];
        }

#if CSharp
        public static implicit operator Stream(System.IO.Stream s)
        {
            return new StreamWrapper(s);
        }

        private class StreamWrapper : Stream
        {
            private readonly System.IO.Stream _s;

            public StreamWrapper(System.IO.Stream s)
            {
                _s = s;
            }

            protected override void Dispose(bool disposing)
            {
                if (disposing)
                {
                    _s.Dispose();
                }
            }

            public override long Seek(long offset, SeekOrigin origin)
            {
                return _s.Seek(offset, (System.IO.SeekOrigin) ((int) origin));
            }

            public override void Flush()
            {
                _s.Flush();
            }

            public override void WriteByte(byte value)
            {
                _s.WriteByte(value);
            }

            public override void Write(ByteArray buffer, int offset, int count)
            {
                _s.Write(buffer.Data, offset, count);
            }

            public override int ReadByte()
            {
                return _s.ReadByte();
            }

            public override int Read(ByteArray buffer, int offset, int count)
            {
                return _s.Read(buffer.Data, offset, count);
            }
        }
#endif
    }
}
