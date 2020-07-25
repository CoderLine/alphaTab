
using System;
using System.Threading;
using System.Threading.Tasks;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Platform.CSharp;

namespace AlphaTab
{
    partial class Environment
    {
        public const bool SupportsTextDecoder = true;
        public static void PlatformInit()
        {
            
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

        private static void CreatePlatformSpecificRenderEngines(Map<string, RenderEngineFactory> renderEngines)
        {
            renderEngines.Set(
                "skia",
                new RenderEngineFactory(true, () => {
                    return new SkiaCanvas();
                })
            );
            renderEngines.Set(
                "gdi",
                new RenderEngineFactory(true, () => {
                    return new GdiCanvas();
                })
            );
            renderEngines.Set("default", renderEngines.Get("skia")!);
        }
    }
}
