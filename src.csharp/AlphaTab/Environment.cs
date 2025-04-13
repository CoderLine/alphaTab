using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using AlphaTab.Collections;
using AlphaTab.Platform.CSharp;

namespace AlphaTab;

partial class Environment
{
    public const bool SupportsTextDecoder = true;
    public static void PlatformInit()
    {

    }

    private static void PrintPlatformInfo(System.Action<string> print)
    {
        print($".net Runtime: {RuntimeInformation.FrameworkDescription}");
        print($"Process: {RuntimeInformation.ProcessArchitecture}");
        print($"OS Description: {RuntimeInformation.OSDescription}");
        print($"OS Arch: {RuntimeInformation.OSArchitecture}");
    }

    public static Action Throttle(Action action, double delay)
    {
        CancellationTokenSource? cancellationTokenSource = null;
        return () =>
        {
            cancellationTokenSource?.Cancel();
            cancellationTokenSource = new CancellationTokenSource();

            Task.Run(async () =>
                {
                    await Task.Delay((int)delay, cancellationTokenSource.Token);
                    action();
                },
                cancellationTokenSource.Token);
        };
    }

    private static void CreatePlatformSpecificRenderEngines(IMap<string, RenderEngineFactory> renderEngines)
    {
        renderEngines.Set(
            "gdi",
            new RenderEngineFactory(true, () => new GdiCanvas())
        );
        renderEngines.Set("default", renderEngines.Get("skia")!);
    }


}
