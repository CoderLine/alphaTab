using System;
using AlphaTab.Audio.Synth;
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
    internal class JQueryAlphaTab
    {
        public object Exec(Element element, string method, string[] args)
        {
            if (Script.Write<bool>("untyped __js__(\"typeof(method) != 'string'\")"))
            {
                args = new[]
                {
                    method
                };
                method = "init";
            }

            if (method[0] == '_' || method == "Exec")
            {
                return null;
            }

            var jElement = new JQuery(element);
            var context = (AlphaTabApi)jElement.Data("alphaTab");
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

        #region Core


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

        [Name("print")]
        public void Print(JQuery element, AlphaTabApi context, string width)
        {
            context.Print(width);
        }

        [Name("load")]
        public bool Load(JQuery element, AlphaTabApi context, object data, int[] tracks = null)
        {
            return context.Load(data, tracks);
        }

        [Name("render")]
        public void Render(JQuery element, AlphaTabApi context)
        {
            context.Render();
        }

        [Name("renderScore")]
        public void Render(JQuery element, AlphaTabApi context, Score score, int[] tracks = null)
        {
            context.RenderScore(score, tracks);
        }

        [Name("renderTracks")]
        public void RenderTracks(JQuery element, AlphaTabApi context, Track[] tracks)
        {
            context.RenderTracks(tracks);
        }

        [Name("invalidate")]
        public void Invalidate(JQuery element, AlphaTabApi context)
        {
            context.Render();
        }

        [Name("tex")]
        public void Tex(JQuery element, AlphaTabApi context, string tex, int[] tracks)
        {
            context.Tex(tex, tracks);
        }

        [Name("updateSettings")]
        public void UpdateLayout(JQuery element, AlphaTabApi context)
        {
            context.UpdateSettings();
        }

        #endregion



        #region Player

        [Name("muteTrack")]
        public void ChangeTrackMute(JQuery element, AlphaTabApi context, Track[] tracks, bool mute)
        {
            context.ChangeTrackMute(tracks, mute);
        }

        [Name("soloTrack")]
        public void ChangeTrackSolo(JQuery element, AlphaTabApi context, Track[] tracks, bool solo)
        {
            context.ChangeTrackSolo(tracks, solo);
        }

        [Name("trackVolume")]
        public void ChangeTrackVolume(JQuery element, AlphaTabApi context, Track[] tracks, float volume)
        {
            context.ChangeTrackVolume(tracks, volume);
        }


        [Name("loadSoundFont")]
        public void LoadSoundFont(JQuery element, AlphaTabApi context, object value)
        {
            context.LoadSoundFont(value);
        }

        [Name("pause")]
        public void Pause(JQuery element, AlphaTabApi context)
        {
            context.Pause();
        }

        [Name("play")]
        public bool Play(JQuery element, AlphaTabApi context)
        {
            return context.Play();
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

        #endregion

        #region Properties


        [Name("api")]
        public AlphaTabApi Api(JQuery element, AlphaTabApi context)
        {
            return context;
        }

        [Name("player")]
        public IAlphaSynth Player(JQuery element, AlphaTabApi context)
        {
            return context.Player;
        }

        [Name("isReadyForPlayback")]
        public bool IsReadyForPlayback(JQuery element, AlphaTabApi context)
        {
            return context.IsReadyForPlayback;
        }

        [Name("playerState")]
        public PlayerState PlayerState(JQuery element, AlphaTabApi context)
        {
            return context.PlayerState;
        }

        [Name("masterVolume")]
        public float MasterVolume(JQuery element, AlphaTabApi context, float masterVolume)
        {
            if (Platform.TypeOf(masterVolume) == "number")
            {
                context.MasterVolume = masterVolume;
            }
            return context.MasterVolume;
        }

        [Name("metronomeVolume")]
        public float MetronomeVolume(JQuery element, AlphaTabApi context, float metronomeVolume)
        {
            if (Platform.TypeOf(metronomeVolume) == "number")
            {
                context.MetronomeVolume = metronomeVolume;
            }
            return context.MetronomeVolume;
        }

        [Name("playbackSpeed")]
        public double PlaybackSpeed(JQuery element, AlphaTabApi context, double playbackSpeed)
        {
            if (Platform.TypeOf(playbackSpeed) == "number")
            {
                context.PlaybackSpeed = playbackSpeed;
            }
            return context.PlaybackSpeed;
        }

        [Name("tickPosition")]
        public int TickPosition(JQuery element, AlphaTabApi context, int tickPosition)
        {
            if (Platform.TypeOf(tickPosition) == "number")
            {
                context.TickPosition = tickPosition;
            }
            return context.TickPosition;
        }

        [Name("timePosition")]
        public double TimePosition(JQuery element, AlphaTabApi context, double timePosition)
        {
            if (Platform.TypeOf(timePosition) == "number")
            {
                context.TimePosition = timePosition;
            }
            return context.TimePosition;
        }

        [Name("loop")]
        public bool Loop(JQuery element, AlphaTabApi context, bool loop)
        {
            if (Platform.TypeOf(loop) == "boolean")
            {
                context.IsLooping = loop;
            }
            return context.IsLooping;
        }

        [Name("renderer")]
        public IScoreRenderer Renderer(JQuery element, AlphaTabApi context)
        {
            return context.Renderer;
        }

        [Name("score")]
        public Score Score(JQuery element, AlphaTabApi context)
        {
            return context.Score;
        }

        [Name("settings")]
        public Settings Settings(JQuery element, AlphaTabApi context)
        {
            return context.Settings;
        }

        [Name("tracks")]
        public Track[] Tracks(JQuery element, AlphaTabApi context)
        {
            return context.Tracks;
        }

        #endregion

        private readonly FastList<Action<JQuery, AlphaTabApi, dynamic>> _initListeners =
            new FastList<Action<JQuery, AlphaTabApi, dynamic>>();

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
