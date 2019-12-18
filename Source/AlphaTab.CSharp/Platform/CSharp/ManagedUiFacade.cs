using System;
using System.Collections.Concurrent;
using System.IO;
using AlphaTab.Audio.Synth;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using AlphaTab.UI;

namespace AlphaTab.Platform.CSharp
{
    internal abstract class ManagedUiFacade<TSettings> : IUiFacade<TSettings>
    {
        protected ConcurrentQueue<Counter> TotalResultCount { get; private set; }

        protected class Counter
        {
            public int Count;
        }

        public int ResizeThrottle => 25;
        public bool AreWorkersSupported => true;
        public bool CanRender => true;

        protected AlphaTabApi<TSettings> Api { get; private set; }
        protected TSettings SettingsContainer { get; private set; }

        public virtual void Initialize(AlphaTabApi<TSettings> api, TSettings settings)
        {
            Api = api;
            SettingsContainer = settings;
            TotalResultCount = new ConcurrentQueue<Counter>();
        }

        public IScoreRenderer CreateWorkerRenderer()
        {
            return new ManagedThreadScoreRenderer(Api.Settings, BeginInvoke);
        }

        public IAlphaSynth CreateWorkerPlayer()
        {
            var player = new ManagedThreadAlphaSynthWorkerApi(CreateSynthOutput(), Api.Settings.LogLevel, BeginInvoke);
            player.Ready += () =>
            {
                using (var sf =
                    typeof(ManagedUiFacade<>).Assembly.GetManifestResourceStream(typeof(ManagedUiFacade<>), "default.sf2"))
                using (var ms = new MemoryStream())
                {
                    sf.CopyTo(ms);
                    player.LoadSoundFont(ms.ToArray());
                }
            };
            return player;
        }

        protected abstract ISynthOutput CreateSynthOutput();

        public abstract IContainer RootContainer { get; }
        public event Action CanRenderChanged;
        public abstract event Action RootContainerBecameVisible;
        public abstract void Destroy();
        public abstract IContainer CreateCanvasElement();
        public abstract void TriggerEvent(IContainer container, string eventName, object details = null);

        public virtual void InitialRender()
        {
            Api.Renderer.PreRender += resize =>
            {
                TotalResultCount.Enqueue(new Counter());
            };


            RootContainerBecameVisible += () =>
            {
                // rendering was possibly delayed due to invisible element
                // in this case we need the correct width for autosize
                Api.Renderer.Width = (int)RootContainer.Width;
                Api.Renderer.UpdateSettings(Api.Settings);

                RenderTracks();
            };
        }

        protected abstract void RenderTracks();

        public abstract void BeginAppendRenderResults(RenderFinishedEventArgs renderResults);
        public abstract Cursors CreateCursors();
        public abstract void BeginInvoke(Action action);
        public abstract void RemoveHighlights();
        public abstract void HighlightElements(string groupId);
        public abstract IContainer CreateSelectionElement();
        public abstract IContainer GetScrollContainer();
        public abstract Bounds GetOffset(IContainer scrollElement, IContainer container);
        public abstract void ScrollToY(IContainer scrollElement, int offset, int speed);
        public abstract void ScrollToX(IContainer scrollElement, int offset, int speed);

        public bool Load(object data, Action<Score> success, Action<Exception> error)
        {
            if (data is Score)
            {
                success((Score)data);
                return true;
            }

            if (data is byte[])
            {
                success(ScoreLoader.LoadScoreFromBytes((byte[])data, Api.Settings));
                return true;
            }

            if (data is Stream)
            {
                using (var ms = new MemoryStream())
                {
                    ((Stream)data).CopyTo(ms);
                    success(ScoreLoader.LoadScoreFromBytes((byte[])ms.ToArray(), Api.Settings));
                }

                return true;
            }

            return false;
        }

        public bool LoadSoundFont(object data)
        {
            if (data is byte[])
            {
                Api.Player.LoadSoundFont((byte[])data);
                return true;
            }

            if (data is Stream)
            {
                using (var ms = new MemoryStream())
                {
                    ((Stream)data).CopyTo(ms);
                    Api.Player.LoadSoundFont(ms.ToArray());
                }

                return true;
            }

            return false;
        }

        protected virtual void OnCanRenderChanged()
        {
            var l = CanRenderChanged;
            if (l != null)
            {
                l();
            }
        }
    }
}
