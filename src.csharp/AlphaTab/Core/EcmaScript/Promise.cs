using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace AlphaTab.Core.EcmaScript;

internal static class Promise
{
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static Task Race(IList<Task> tasks)
    {
        return Task.WhenAny(tasks);
    }
}
