namespace AlphaTab.IO
{
    public partial class ByteArray
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
            _data = new byte[size];
        }

        public ByteArray(params byte[] data)
        {
            _data = data;
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
