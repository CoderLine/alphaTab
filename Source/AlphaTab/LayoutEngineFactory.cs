using System;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Layout;

namespace AlphaTab
{
    class LayoutEngineFactory
    {
        public bool Vertical { get; }
        public Func<ScoreRenderer, ScoreLayout> CreateLayout { get; }

        public LayoutEngineFactory(bool vertical, Func<ScoreRenderer, ScoreLayout> layout)
        {
            Vertical = vertical;
            CreateLayout = layout;
        }
    }
}