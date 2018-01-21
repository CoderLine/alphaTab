using AlphaTab.Collections;
using Phase.Attributes;
using Phase.CompilerServices;

namespace AlphaTab
{
    [External]
    class PhaseExtension : ICompilerExtension
    {
        public void Run(ICompilerContext compilerContext)
        {
            var attr = compilerContext.Attributes;
            attr.Type<FastDictionary<int, int>>().Add(new ExternalAttribute(), new NativeConstructorsAttribute());
            attr.Member((FastDictionary<int, int> x) => x[0]).Add(new NativeIndexerAttribute());
            attr.Type<FastList<int>>().Add(new ExternalAttribute(), new NativeConstructorsAttribute());
            attr.Member((FastList<int> x) => x[0]).Add(new NativeIndexerAttribute());
            attr.Member((FastList<int> x) => x.IndexOf(0)).Add(new NameAttribute("IndexOf"));
        }
    }
}
