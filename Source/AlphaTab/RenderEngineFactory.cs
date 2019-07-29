using System;
using AlphaTab.Platform;

namespace AlphaTab
{
    internal class RenderEngineFactory
    {
        public bool SupportsWorkers { get; }
        public Func<ICanvas> CreateCanvas { get; }

        public RenderEngineFactory(bool supportsWorkers, Func<ICanvas> canvas)
        {
            SupportsWorkers = supportsWorkers;
            CreateCanvas = canvas;
        }
    }
}
