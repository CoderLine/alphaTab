using System;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using AlphaTab.Collections;
using AlphaTab.Platform;
using AlphaTab.Platform.CSharp;
using AlphaTab.Platform.Worker;

namespace AlphaTab;

partial class Environment
{
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static T PrepareForPostMessage<T>(T o)
    {
        return o;
    }

    private static void _printPlatformInfo(System.Action<string> print)
    {
        print($".net Runtime: {RuntimeInformation.FrameworkDescription}");
        print($"Process: {RuntimeInformation.ProcessArchitecture}");
        print($"OS Description: {RuntimeInformation.OSDescription}");
        print($"OS Arch: {RuntimeInformation.OSArchitecture}");
    }

    private static void _createPlatformSpecificRenderEngines(
        IMap<string, RenderEngineFactory> renderEngines)
    {
        renderEngines.Set(
            "gdi",
            new RenderEngineFactory(true, () => new GdiCanvas())
        );
        renderEngines.Set("default", renderEngines.Get("skia")!);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static string QuoteJsonString(string value)
    {
        return Json.QuoteJsonString(value);
    }

    internal static void SortDescending(System.Collections.Generic.IList<double> list)
    {
        list.Sort((a, b) => b - a);
    }


    internal static IAlphaTabWorkerGlobalScope<T> GetGlobalWorkerScope<T>()
    {
        if (typeof(T) == typeof(IAlphaSynthWorkerMessage))
        {
            return (IAlphaTabWorkerGlobalScope<T>)ManagedThreadAlphaSynthWorker.CurrentThreadWorker;
        }

        if (typeof(T) == typeof(IAlphaTabWorkerMessage))
        {
            return (IAlphaTabWorkerGlobalScope<T>)ManagedThreadAlphaTabRendererWorker
                .CurrentThreadWorker;
        }

        throw new InvalidOperationException("Unsupported worker scope kind");
    }
}
