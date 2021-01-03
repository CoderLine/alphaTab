using System;
using System.Collections.Concurrent;
using System.IO;
using AlphaTab.Synth;
using AlphaTab.Core.EcmaScript;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Platform.CSharp
{
    public abstract class ManagedUiFacade<TSettings> : IUiFacade<TSettings>
        where TSettings : class
    {
        protected ConcurrentQueue<Counter> TotalResultCount { get; private set; } = null!;

        protected class Counter
        {
            public int Count;
        }

        public double ResizeThrottle => 25;
        public bool AreWorkersSupported => true;
        public bool CanRender => true;

        protected AlphaTabApiBase<TSettings> Api { get; private set; } = null!;
        protected TSettings SettingsContainer { get; private set; } = null!;

        public virtual void Initialize(AlphaTabApiBase<TSettings> api, TSettings settings)
        {
            Api = api;
            SettingsContainer = settings;
            TotalResultCount = new ConcurrentQueue<Counter>();
        }

        public IScoreRenderer CreateWorkerRenderer()
        {
            return new ManagedThreadScoreRenderer(Api.Settings, BeginInvoke);
        }

        protected abstract Stream? OpenDefaultSoundFont();

        public IAlphaSynth CreateWorkerPlayer()
        {
            var player = new ManagedThreadAlphaSynthWorkerApi(CreateSynthOutput(),
                Api.Settings.Core.LogLevel, BeginInvoke);
            player.Ready.On(() =>
            {
                using (var sf = OpenDefaultSoundFont())
                using (var ms = new MemoryStream())
                {
                    sf.CopyTo(ms);
                    player.LoadSoundFont(new Uint8Array(ms.ToArray()), false);
                }
            });
            return player;
        }

        protected abstract ISynthOutput CreateSynthOutput();

        public abstract IContainer RootContainer { get; }
        public IEventEmitter CanRenderChanged { get; } = new EventEmitter();
        public abstract IEventEmitter RootContainerBecameVisible { get; }
        public abstract void Destroy();
        public abstract IContainer CreateCanvasElement();

        public abstract void TriggerEvent(IContainer container, string eventName,
            object? details = null, IMouseEventArgs? originalEvent = null);

        public virtual void InitialRender()
        {
            Api.Renderer.PreRender.On(resize => { TotalResultCount.Enqueue(new Counter()); });


            RootContainerBecameVisible.On(() =>
            {
                // rendering was possibly delayed due to invisible element
                // in this case we need the correct width for autosize
                Api.Renderer.Width = (int) RootContainer.Width;
                Api.Renderer.UpdateSettings(Api.Settings);

                RenderTracks();
            });
        }

        protected abstract void RenderTracks();

        public abstract void BeginAppendRenderResults(RenderFinishedEventArgs? renderResults);
        public abstract void DestroyCursors();
        public abstract Cursors? CreateCursors();
        public abstract void BeginInvoke(Action action);
        public abstract void RemoveHighlights();
        public abstract void HighlightElements(string groupId);
        public abstract IContainer? CreateSelectionElement();
        public abstract IContainer GetScrollContainer();
        public abstract Bounds GetOffset(IContainer? scrollElement, IContainer container);
        public abstract void ScrollToY(IContainer scrollElement, double offset, double speed);
        public abstract void ScrollToX(IContainer scrollElement, double offset, double speed);

        public bool Load(object? data, Action<Score> success, Action<Error> error)
        {
            switch (data)
            {
                case Score score:
                    success(score);
                    return true;
                case byte[] b:
                    success(ScoreLoader.LoadScoreFromBytes(new Uint8Array(b), Api.Settings));
                    return true;
                case Stream s:
                {
                    using (var ms = new MemoryStream())
                    {
                        s.CopyTo(ms);
                        success(ScoreLoader.LoadScoreFromBytes(new Uint8Array(ms.ToArray()),
                            Api.Settings));
                    }

                    return true;
                }
                default:
                    return false;
            }
        }

        public bool LoadSoundFont(object? data, bool append)
        {
            switch (data)
            {
                case byte[] bytes:
                    Api.Player.LoadSoundFont(new Uint8Array(bytes), append);
                    return true;
                case Stream stream:
                {
                    using (var ms = new MemoryStream())
                    {
                        stream.CopyTo(ms);
                        Api.Player.LoadSoundFont(new Uint8Array(ms.ToArray()), append);
                    }

                    return true;
                }
                default:
                    return false;
            }
        }
    }
}
