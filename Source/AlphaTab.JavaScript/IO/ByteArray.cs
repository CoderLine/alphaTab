using System.Collections.TypedArrays;
using System.Runtime.CompilerServices;

namespace AlphaTab.IO
{
    [IncludeGenericArguments(false)]
    [IgnoreNamespace]
    [Imported(ObeysTypeSystem = true)]
    [ScriptName("Uint8Array")]
    public partial class ByteArray
    {
        // ReSharper disable UnusedParameter.Local

        [InlineCode("new Uint8Array({size})")]
        public ByteArray(int size)
        {
        }

        [InlineCode("new Uint8Array({data})")]
        public ByteArray(params byte[] data)
        {
        }

        [InlineCode("new Uint8Array({data})")]
        public ByteArray(ArrayBuffer data)
        {
        }



        public int Length
        {
            [InlineCode("{this}.length")]
            get
            {
                return 0;
            }
        }

        [IntrinsicProperty]
        public byte this[int index]
        {
            get
            {
                return 0;
            }
            set
            {
            }
        }

        // ReSharper restore UnusedParameter.Local
    }
}
