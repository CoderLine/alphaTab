using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace AlphaTab.Core.EcmaScript;

internal static class Promise
{
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static async Task Race(IList<Task> tasks)
    {
        var completed = await Task.WhenAny(tasks);
        await completed;
    }
}
