using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlphaTab.Util;
using Phase.Attributes;
using Phase.CompilerServices;

namespace AlphaTab
{
    [External]
    public class PhaseCompilerExtension : ICompilerExtension
    {
        public void Run(ICompilerContext context)
        {
            context.Attributes.Type<JsonNameAttribute>()
                .Add(new MetaAttribute("@json"), new ExternalAttribute());
            context.Attributes.Type<JsonSerializableAttribute>()
                .Add(new MetaAttribute("@:build(alphaTab.JsonSerializationBuilder.build())"), new ExternalAttribute());
        }
    }
}
