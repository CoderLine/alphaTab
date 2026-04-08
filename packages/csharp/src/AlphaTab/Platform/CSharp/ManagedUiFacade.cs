using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using AlphaTab.Synth;
using AlphaTab.Importer;
using AlphaTab.Model;
using AlphaTab.Platform.Worker;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.Platform.CSharp;

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

    public abstract void StopScrolling(IContainer scrollElement);

    public abstract void SetCanvasOverflow(IContainer canvasElement, double overflow,
        bool isVertical);

    public IScoreRenderer CreateWorkerRenderer()
    {
        var worker = new ManagedThreadAlphaTabRendererWorker(PostToUIThread);
        return new AlphaTabWorkerScoreRenderer<TSettings>(Api, worker);
    }

    protected abstract void PostToUIThread(Action action);

    protected abstract Stream? OpenDefaultSoundFont();

    public IAlphaSynth CreateWorkerPlayer()
    {
        var player = new AlphaSynthWebWorkerApi(
            CreateSynthOutput(),
            Api.Settings,
            new ManagedThreadAlphaSynthWorker(PostToUIThread)
        );
        player.Ready.On(() =>
        {
            using var sf = OpenDefaultSoundFont();
            using var ms = new MemoryStream();
            sf.CopyTo(ms);
            player.LoadSoundFont(new Uint8Array(ms.ToArray()), false);
        });
        return player;
    }

    public IAudioExporterWorker CreateWorkerAudioExporter(IAlphaSynth? synth)
    {
        var needNewWorker = synth is not AlphaSynthWebWorkerApi;
        if (needNewWorker)
        {
            synth = CreateWorkerPlayer();
        }

        return new AlphaSynthAudioExporterWorkerApi(synth as AlphaSynthWebWorkerApi, needNewWorker);
    }

    public abstract IAlphaSynth? CreateBackingTrackPlayer();

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
        Api.Renderer.PreRender.On(_ => { TotalResultCount.Enqueue(new Counter()); });

        RootContainerBecameVisible.On(() =>
        {
            // rendering was possibly delayed due to invisible element
            // in this case we need the correct width for autosize
            Api.Renderer.Width = (int)RootContainer.Width;
            Api.Renderer.UpdateSettings(Api.Settings);

            RenderTracks();
        });
    }

    protected abstract void RenderTracks();

    public abstract void BeginAppendRenderResults(RenderFinishedEventArgs? renderResults);
    public abstract void BeginUpdateRenderResults(RenderFinishedEventArgs? renderResults);
    public abstract void DestroyCursors();
    public abstract Cursors? CreateCursors();

    public void BeginInvoke(Action action)
    {
        // post to "own" event loop if running inside worker
        var synthWorker = ManagedThreadAlphaSynthWorker.CurrentThreadWorker;
        if (synthWorker != null)
        {
            synthWorker.PostToWorker(action);
            return;
        }

        var renderWorker = ManagedThreadAlphaTabRendererWorker.CurrentThreadWorker;
        if (renderWorker != null)
        {
            renderWorker.PostToWorker(action);
            return;
        }

        // not in worker -> run on main
        PostToUIThread(action);
    }

    public Action Throttle(Action action, double delay)
    {
        CancellationTokenSource? cancellationTokenSource = null;
        return () =>
        {
            cancellationTokenSource?.Cancel();
            cancellationTokenSource = new CancellationTokenSource();

            Task.Run(async () =>
                {
                    await Task.Delay((int)delay, cancellationTokenSource.Token);
                    PostToUIThread(action);
                },
                cancellationTokenSource.Token);
        };
    }

    public abstract void RemoveHighlights();
    public abstract void HighlightElements(string groupId, double masterBarIndex);
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
                using var ms = new MemoryStream();
                s.CopyTo(ms);
                success(ScoreLoader.LoadScoreFromBytes(new Uint8Array(ms.ToArray()),
                    Api.Settings));

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
                using var ms = new MemoryStream();
                stream.CopyTo(ms);
                Api.Player.LoadSoundFont(new Uint8Array(ms.ToArray()), append);

                return true;
            }
            default:
                return false;
        }
    }
}
