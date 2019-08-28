using System;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Collections;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Model;
using AlphaTab.UI;
using Haxe.Js.Html;
using Phase;

namespace AlphaTab.Platform.JavaScript
{
    public class AlphaTabApi : AlphaTabApi<object>
    {
        public AlphaTabApi(Element element, object options)
            : base(new BrowserUiFacade(element), options)
        {
        }

        public override PlayerState PlayerState
        {
            get
            {
                var playerStateValue = (int)Player.State;
                return Script.Write<PlayerState>("untyped __js__(\"{0}\", playerStateValue)");
            }
        }

        public override void Tex(string tex, int[] tracks = null)
        {
            var browser = (BrowserUiFacade)UiFacade;
            base.Tex(tex, browser.ParseTracks(tracks));
        }

        public void Print(string width)
        {
            // prepare a popup window for printing (a4 width, window height, centered)

            var preview = Browser.Window.Open("", "", "width=0,height=0");
            var a4 = preview.Document.CreateElement("div");
            if (!string.IsNullOrEmpty(width))
            {
                a4.Style.Width = width;
            }
            else
            {
                if (Settings.Display.LayoutMode == LayoutMode.Horizontal)
                {
                    a4.Style.Width = "297mm";
                }
                else
                {
                    a4.Style.Width = "210mm";
                }
            }

            preview.Document.Write("<!DOCTYPE html><html></head><body></body></html>");
            preview.Document.Body.AppendChild(a4);

            var dualScreenLeft = Platform.TypeOf(Browser.Window.Member<int>("ScreenLeft")) != "undefined"
                ? Browser.Window.Member<int>("ScreenLeft")
                : (int)Browser.Window.Screen.Left;
            var dualScreenTop = Platform.TypeOf(Browser.Window.Member<int>("ScreenTop")) != "undefined"
                ? Browser.Window.Member<int>("ScreenTop")
                : (int)Browser.Window.Screen.Top;
            int screenWidth = Platform.TypeOf(Browser.Window.InnerWidth) != "undefined"
                ? Browser.Window.InnerWidth
                : Platform.TypeOf(Browser.Document.DocumentElement.ClientWidth) != "undefined"
                    ? Browser.Document.DocumentElement.ClientWidth
                    : Browser.Window.Screen.Width;
            int screenHeight = Platform.TypeOf(Browser.Window.InnerHeight) != "undefined"
                ? Browser.Window.InnerHeight
                : Platform.TypeOf(Browser.Document.DocumentElement.ClientHeight) != "undefined"
                    ? Browser.Document.DocumentElement.ClientHeight
                    : Browser.Window.Screen.Height;

            var w = a4.OffsetWidth + 50;
            var h = (int)Browser.Window.InnerHeight;
            var left = ((screenWidth / 2) - (w / 2)) + dualScreenLeft;
            var top = ((screenHeight / 2) - (h / 2)) + dualScreenTop;
            preview.ResizeTo(w, h);
            preview.MoveTo(left, top);

            preview.Focus();

            // render alphaTab
            var settings = new Settings();
            settings.Core.ScriptFile = Settings.Core.ScriptFile;
            settings.Core.FontDirectory = Settings.Core.FontDirectory;
            settings.Core.EnableLazyLoading = false;
            settings.Core.UseWorkers = false;

            settings.Display.Scale = 0.8f;
            settings.Display.StretchForce = 0.8f;

            var alphaTab = new AlphaTabApi(a4, settings);
            alphaTab.Renderer.PostRenderFinished += () =>
            {
                alphaTab.CanvasElement.Height = -1;
                preview.Print();
            };
            alphaTab.RenderTracks(Tracks);
        }

        public void DownloadMidi()
        {
            var midiFile = new MidiFile();
            var handler = new AlphaSynthMidiFileHandler(midiFile);
            var generator = new MidiFileGenerator(Score, Settings, handler);
            generator.Generate();

            var binary = midiFile.ToBinary();
            var uint8Array = Phase.Script.Write<Uint8Array>("binary.toUint8Array()");
            var fileName = string.IsNullOrEmpty(Score.Title) ? "File.mid" : Score.Title + ".mid";
            var dlLink = (AnchorElement)Browser.Document.CreateElement("a");
            dlLink.Download = fileName;

            var blob = new Blob(new[]
                {
                    uint8Array
                },
                new
                {
                    type = "audio/midi"
                });
            var url = URL.CreateObjectURL(blob);
            dlLink.Href = url;
            dlLink.Style.Display = "none";
            Browser.Document.Body.AppendChild(dlLink);
            dlLink.Click();
            Browser.Document.Body.RemoveChild(dlLink);
        }

        public override void ChangeTrackMute(Track[] tracks, bool mute)
        {
            var trackList = TrackIndexesToTracks(((BrowserUiFacade)UiFacade).ParseTracks(tracks));
            base.ChangeTrackMute(trackList, mute);
        }


        public override void ChangeTrackSolo(Track[] tracks, bool solo)
        {
            var trackList = TrackIndexesToTracks(((BrowserUiFacade)UiFacade).ParseTracks(tracks));
            base.ChangeTrackSolo(trackList, solo);
        }

        public override void ChangeTrackVolume(Track[] tracks, float volume)
        {
            var trackList = TrackIndexesToTracks(((BrowserUiFacade)UiFacade).ParseTracks(tracks));
            base.ChangeTrackVolume(trackList, volume);
        }

        private Track[] TrackIndexesToTracks(int[] trackIndexes)
        {
            if (Score == null)
            {
                return new Track[0];
            }

            var tracks = new FastList<Track>();
            foreach (var index in trackIndexes)
            {
                if (index >= 0 && index < Score.Tracks.Count)
                {
                    tracks.Add(Score.Tracks[index]);
                }
            }

            return tracks.ToArray();
        }

        /// <summary>
        /// This event is fired during the sound font loading from an external source.
        /// </summary>
        public event Action<ProgressEventArgs> SoundFontLoad;

        internal void OnSoundFontLoad(ProgressEventArgs e)
        {
            var handler = SoundFontLoad;
            if (handler != null)
            {
                handler(e);
            }

            UiFacade.TriggerEvent(Container, "soundFontLoad", e);
        }

        internal void LoadSoundFontFromUrl(string url)
        {
            if (Player == null)
            {
                return;
            }

            ((AlphaSynthWebWorkerApi)Player).LoadSoundFontFromUrl(url, OnSoundFontLoad);
        }
    }
}
