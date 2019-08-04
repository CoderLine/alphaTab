using System;
using AlphaTab.Audio.Generator;
using AlphaTab.Audio.Synth.Midi;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Importer;
using AlphaTab.UI;
using Haxe.Js.Html;

namespace AlphaTab.Platform.JavaScript
{
    public class AlphaTabApi : AlphaTabApi<object>
    {
        public AlphaTabApi(Element element, object options)
            : base(new BrowserUiFacade(element), options)
        {
        }

        public void TexWithTrackData(string tex, dynamic trackData)
        {
            Tex(tex, ((BrowserUiFacade)UiFacade).ParseTracks(trackData));
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
                if (Settings.Layout.Mode == "horizontal")
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
            var settings = Settings.Defaults;
            settings.ScriptFile = Settings.ScriptFile;
            settings.FontDirectory = Settings.FontDirectory;
            settings.Scale = 0.8f;
            settings.StretchForce = 0.8f;
            settings.EnableLazyLoading = false;
            settings.UseWorkers = false;

            var alphaTab = new AlphaTabApi(a4, settings);
            alphaTab.Renderer.PostRenderFinished += () =>
            {
                alphaTab.CanvasElement.Height = -1;
                preview.Print();
            };
            alphaTab.RenderTracks(Score, TrackIndexes);
        }

        public void Load(object data)
        {
            try
            {
                if (Platform.InstanceOf<ArrayBuffer>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes(Platform.ArrayBufferToByteArray((ArrayBuffer)data),
                        Settings));
                }
                else if (Platform.InstanceOf<Uint8Array>(data))
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes((byte[])data, Settings));
                }
                else if (Platform.TypeOf(data) == "string")
                {
                    ScoreLoader.LoadScoreAsync((string)data,
                        s => ScoreLoaded(s),
                        e =>
                        {
                            OnError("import", e);
                        },
                        Settings);
                }
            }
            catch (Exception e)
            {
                OnError("import", e);
            }
        }

        public void UpdateLayout(object json)
        {
            Settings.Layout = Settings.LayoutFromJson(json);
            Renderer.UpdateSettings(Settings);
            Renderer.Invalidate();
        }

        public void SetTracks(object tracks, bool render)
        {
            ((BrowserUiFacade)UiFacade).SetTracks(tracks, render);
        }

        public void LoadSoundFont(object value)
        {
            if (Player == null)
            {
                return;
            }

            if (Platform.TypeOf(value) == "string")
            {
                ((AlphaSynthWebWorkerApi)Player).LoadSoundFontFromUrl((string)value);
            }
            else
            {
                Player.LoadSoundFont((byte[])value);
            }
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

        public void SetTrackVolume(object tracks, float volume)
        {
            var trackList = TrackIndexesToTracks(((BrowserUiFacade)UiFacade).ParseTracks(tracks));
            ChangeTrackVolume(trackList, volume);
        }

        public void SetTrackSolo(object tracks, bool solo)
        {
            var trackList = TrackIndexesToTracks(((BrowserUiFacade)UiFacade).ParseTracks(tracks));
            ChangeTrackSolo(trackList, solo);
        }

        public void SetTrackMute(object tracks, bool mute)
        {
            var trackList = TrackIndexesToTracks(((BrowserUiFacade)UiFacade).ParseTracks(tracks));
            ChangeTrackMute(trackList, mute);
        }
    }
}
