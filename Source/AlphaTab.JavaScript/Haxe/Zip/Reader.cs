using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Haxe.IO;
using Phase.Attributes;

namespace Haxe.Zip
{
    [External]
    [Name("haxe.zip.Reader")]
    [NativeConstructors]
    public class Reader
    {
        public extern Reader(HaxeInput input);

        [Name("read")]
        public extern HaxeList<Entry> Read();
    }

    [External]
    [Name("List")]
    [NativeConstructors]
    [ForeachMode(ForeachMode.Native)]
    public class HaxeList<T> : IEnumerable<T>
    {
        extern IEnumerator<T> IEnumerable<T>.GetEnumerator();
        extern IEnumerator IEnumerable.GetEnumerator();
    }

    [External]
    [Name("haxe.zip.Entry")]
    public class Entry
    {
        [Name("fileName")]
        public HaxeString FileName { get; set; }
        [Name("data")]
        public HaxeBytes Data { get; set; }
    }
}
