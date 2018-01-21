using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.URL")]
    public class URL
    {
        [Name("createObjectURL")]
        public static extern string CreateObjectURL(Blob blob);
    }
}
