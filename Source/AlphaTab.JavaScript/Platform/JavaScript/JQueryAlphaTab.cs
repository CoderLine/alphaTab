using System;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Synthesis;
using AlphaTab.Collections;
using AlphaTab.Haxe.jQuery;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Model;
using AlphaTab.Rendering;
using AlphaTab.Util;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Platform.JavaScript
{
    class JQueryAlphaTab
    {
        public object Exec(Element element, string method, string[] args)
        {
            if (Script.Write<bool>("untyped __js__(\"typeof(method) != 'string'\")"))
            {
                args = new[] { method };
                method = "init";
            }

            if (method[0] == '_' || method == "Exec")
            {
                return null;
            }

            var jElement = new JQuery(element);
            AlphaTabApi context = (AlphaTabApi)jElement.Data("alphaTab");
            if (method == "destroy" && !context.IsTruthy())
            {
                return null;
            }
            if (method != "init" && !context.IsTruthy())
            {
                throw new Error("alphaTab not initialized");
            }

            var apiMethod = Script.Write<object>("untyped __js__(\"this[method]\")");
            if (apiMethod.IsTruthy())
            {
                var realArgs = Script.Write<string[]>("untyped __js__(\"[ jElement, context ].concat(args)\")");
                return Script.Write<object>("untyped apiMethod.apply(this, realArgs)");
            }
            else
            {
                Logger.Error("Api", "Method '" + method + "' does not exist on jQuery.alphaTab");
                return null;
            }
        }

        [Name("init")]
        public void Init(JQuery element, AlphaTabApi context, dynamic options)
        {
            if (!context.IsTruthy())
            {
                context = new AlphaTabApi(element[0], options);
                element.Data("alphaTab", context);
                foreach (var listener in _initListeners)
                {
                    listener(element, context, options);
                }
            }
        }

        [Name("destroy")]
        public void Destroy(JQuery element, AlphaTabApi context)
        {
            element.RemoveData("alphaTab");
            context.Destroy();
        }

        [Name("tex")]
        public void Tex(JQuery element, AlphaTabApi context, string tex)
        {
            context.Tex(tex);
        }

        [Name("tracks")]
        public Track[] Tracks(JQuery element, AlphaTabApi context, dynamic tracks)
        {
            if (tracks)
            {
                context.SetTracks(tracks, true);
            }
            return context.Tracks;
        }

        [Name("load")]
        public void Load(JQuery element, AlphaTabApi context, object data)
        {
            context.Load(data);
        }

        [Name("api")]
        public AlphaTabApi Api(JQuery element, AlphaTabApi context)
        {
            return context;
        }

        [Name("score")]
        public Score Score(JQuery element, AlphaTabApi context, Score score)
        {
            if (score.IsTruthy())
            {
                context.RenderTracks(score, context.TrackIndexes);
            }
            return context.Score;
        }

        [Name("renderer")]
        public IScoreRenderer Renderer(JQuery element, AlphaTabApi context)
        {
            return context.Renderer;
        }

        [Name("layout")]
        public LayoutSettings Layout(JQuery element, AlphaTabApi context, object layout)
        {
            if (layout.IsTruthy())
            {
                context.UpdateLayout(layout);
            }
            return context.Settings.Layout;
        }

        [Name("print")]
        public void Print(JQuery element, AlphaTabApi context, string width)
        {
            context.Print(width);
        }

        #region Player
        [Name("player")]
        public IAlphaSynth Player(JQuery element, AlphaTabApi context)
        {
            return context.Player;
        }

        [Name("playerOptions")]
        public Settings PlayerOptions(JQuery element, AlphaTabApi context, object options)
        {
            if (options.IsTruthy())
            {
                Settings.FillPlayerOptions(context.Settings, options, false);
            }
            return context.Settings;
        }

        [Name("cursorOptions")]
        public Settings CursorOptions(JQuery element, AlphaTabApi context, object options)
        {
            return PlayerOptions(element, context, options);
        }

        [Name("playerState")]
        public PlayerState PlayerState(JQuery element, AlphaTabApi context)
        {
            if (context.Player == null)
            {
                return Audio.Synth.PlayerState.Paused;
            }
            return context.Player.State;
        }

        [Name("masterVolume")]
        public float MasterVolume(JQuery element, AlphaTabApi context, float masterVolume)
        {
            if (context.Player == null)
            {
                return 0;
            }

            if (masterVolume.IsTruthy())
            {
                context.Player.MasterVolume = masterVolume;
            }

            return context.Player.MasterVolume;
        }

        [Name("playbackSpeed")]
        public double PlaybackSpeed(JQuery element, AlphaTabApi context, double playbackSpeed)
        {
            if (context.Player == null)
            {
                return 0;
            }

            if (playbackSpeed.IsTruthy())
            {
                context.Player.PlaybackSpeed = playbackSpeed;
            }

            return context.Player.PlaybackSpeed;
        }

        [Name("metronomeVolume")]
        public float MetronomeVolume(JQuery element, AlphaTabApi context, float metronomeVolume)
        {
            if (context.Player == null)
            {
                return 0;
            }

            if (metronomeVolume.IsTruthy())
            {
                context.Player.MetronomeVolume = metronomeVolume;
            }

            return context.Player.MetronomeVolume;
        }

        [Name("tickPosition")]
        public int TickPosition(JQuery element, AlphaTabApi context, int tickPosition)
        {
            if (context.Player == null)
            {
                return 0;
            }

            if (tickPosition.IsTruthy())
            {
                context.Player.TickPosition = tickPosition;
            }

            return context.Player.TickPosition;
        }

        [Name("playbackRange")]
        public PlaybackRange PlaybackRange(JQuery element, AlphaTabApi context, PlaybackRange playbackRange)
        {
            if (context.Player == null)
            {
                return null;
            }

            if (playbackRange.IsTruthy())
            {
                context.Player.PlaybackRange = playbackRange;
            }

            return context.Player.PlaybackRange;
        }

        [Name("loop")]
        public bool Loop(JQuery element, AlphaTabApi context, bool loop)
        {
            if (context.Player == null)
            {
                return false;
            }

            if (loop.IsTruthy())
            {
                context.Player.IsLooping = loop;
            }

            return context.Player.IsLooping;
        }

        [Name("autoScroll")]
        public string AutoScroll(JQuery element, AlphaTabApi context, string autoScroll)
        {
            if (context.Player == null)
            {
                return null;
            }

            if (autoScroll.IsTruthy())
            {
                context.Settings.ScrollMode = Settings.DecodeScrollMode(autoScroll);
            }

            return Settings.EncodeScrollMode(context.Settings.ScrollMode);
        }

        [Name("play")]
        public void Play(JQuery element, AlphaTabApi context)
        {
            context.Play();
        }

        [Name("pause")]
        public void Pause(JQuery element, AlphaTabApi context)
        {
            context.Pause();
        }

        [Name("playPause")]
        public void PlayPause(JQuery element, AlphaTabApi context)
        {
            context.PlayPause();
        }

        [Name("stop")]
        public void Stop(JQuery element, AlphaTabApi context)
        {
            context.Stop();
        }

        [Name("loadSoundFont")]
        public void LoadSoundFont(JQuery element, AlphaTabApi context, object value)
        {
            context.LoadSoundFont(value);
        }

        [Name("muteTrack")]
        public void MuteTrack(JQuery element, AlphaTabApi context, object tracks, bool mute)
        {
            context.SetTrackMute(tracks, mute);
        }

        [Name("soloTrack")]
        public void SoloTrack(JQuery element, AlphaTabApi context, object tracks, bool solo)
        {
            context.SetTrackSolo(tracks, solo);
        }


        [Name("trackVolume")]
        public void TrackVolume(JQuery element, AlphaTabApi context, object tracks, float volume)
        {
            context.SetTrackVolume(tracks, volume);
        }

        [Name("downloadMidi")]
        public void DownloadMidi(JQuery element, AlphaTabApi context)
        {
            context.DownloadMidi();
        }

        #endregion

        private readonly FastList<Action<JQuery, AlphaTabApi, dynamic>> _initListeners = new FastList<Action<JQuery, AlphaTabApi, dynamic>>();
        [Name("_oninit")]
        public void OnInit(Action<JQuery, AlphaTabApi, dynamic> listener)
        {
            _initListeners.Add(listener);
        }

        public static Action<string> Restore = selector =>
        {
            new JQuery(selector).Empty().RemoveData("alphaTab");
        };
    }
}
