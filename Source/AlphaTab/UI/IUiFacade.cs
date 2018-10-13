using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Collections;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.UI
{
    public interface IUiFacade<TSettings>
    {
        IContainer RootContainer { get; }
        bool AreWorkersSupported { get; }

        bool CanRender { get; }
        int ResizeThrottle { get; }
        event Action CanRenderChanged;

        event Action RootContainerBecameVisible;

        void Initialize(AlphaTabApi<TSettings> api, TSettings control);
        void Destroy();

        IContainer CreateCanvasElement();
        void TriggerEvent(IContainer container, string eventName, object details = null);
        void InitialRender();

        void BeginAppendRenderResults(RenderFinishedEventArgs renderResults);
        IScoreRenderer CreateWorkerRenderer();
        IAlphaSynth CreateWorkerPlayer();

        Cursors CreateCursors();
        void BeginInvoke(Action action);
        void RemoveHighlights();
        void HighlightElements(string groupId);
        IContainer CreateSelectionElement();
        IContainer GetScrollContainer();
        Bounds GetOffset(IContainer scrollElement, IContainer container);

        void ScrollToY(IContainer scrollElement, int offset, int speed);
        void ScrollToX(IContainer scrollElement, int offset, int speed);
    }
}