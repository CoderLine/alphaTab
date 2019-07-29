using System;
using AlphaTab.Platform;

namespace AlphaTab
{
    class RenderEngineFactory
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