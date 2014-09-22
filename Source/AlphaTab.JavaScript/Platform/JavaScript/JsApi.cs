using System;
using System.Collections.TypedArrays;
using System.Html;
using System.Runtime.CompilerServices;
using System.Serialization;
using AlphaTab.Collections;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;

namespace AlphaTab.Platform.JavaScript
{
    public class JsApi
    {
        private readonly HtmlElement _element;
        private readonly Element _canvasElement;
        private int[] _tracks;

        public JsApi(HtmlElement element, dynamic options)
        {
            _element = element;

            // load settings
            Settings settings = Settings.FromJson(options);

            #region build tracks array

            // get track data to parse
            dynamic tracksData;
            if (options != null && options.tracks)
            {
                tracksData = options.tracks;
            }
            else if (element != null && element.Dataset != null && element.Dataset["tracks"] != null)
            {
                tracksData = element.Dataset["tracks"];
            }
            else
            {
                tracksData = new[] { 0 };
            }

            SetTracks(tracksData, false);

            #endregion

            string contents = "";
            if (element != null)
            {
                // get load contents

                contents = element.InnerText.Trim();
                element.InnerHTML = "";
          
                #region Create context elements (wrapper, canvas etc)

                if (settings.Engine == "html5")
                {
                    _canvasElement = Document.CreateElement("canvas");
                }
                else
                {
                    _canvasElement = Document.CreateElement("div");
                }

                _canvasElement.ClassName = "alphaTabSurface";
                element.AppendChild(_canvasElement);

                #endregion

            }

            #region Renderer Setup

            Renderer = new ScoreRenderer(settings, _canvasElement);
            Renderer.RenderFinished += () => TriggerEvent("rendered");
            Renderer.PostRenderFinished += () => TriggerEvent("post-rendered");
            Renderer.RenderFinished += () =>
            {
                if (_canvasElement != null && Renderer.Canvas is SvgCanvas)
                {
                    _canvasElement.InnerHTML = ((SvgCanvas)Renderer.Canvas).ToSvg(true, "alphaTabSurfaceSvg");
                    _canvasElement.Style.Width = Renderer.Canvas.Width + "px";
                    _canvasElement.Style.Height = Renderer.Canvas.Height + "px";
                }
            };

            #endregion

            #region Load Default Data

            if (!string.IsNullOrEmpty(contents))
            {
                Tex(contents);
            }
            else if (_element != null && _element.Dataset != null && !string.IsNullOrEmpty(_element.Dataset["file"]))
            {
                Load(_element.Dataset["file"]);
            }

            #endregion
        }

        [IntrinsicProperty]
        public ScoreRenderer Renderer { get; private set; }

        [IntrinsicProperty]
        public Score Score { get; set; }

        public Track[] Tracks
        {
            get
            {
                FastList<Track> tracks = new FastList<Track>();

                foreach (var track in _tracks)
                {
                    if (track >= 0 && track < Score.Tracks.Count)
                    {
                        tracks.Add(Score.Tracks[track]);
                    }
                }

                if (tracks.Count == 0 && Score.Tracks.Count > 0)
                {
                    tracks.Add(Score.Tracks[0]);
                }

                return tracks.ToArray();
            }
        }

        public void Load(object data)
        {
            try
            {
                if (data is ArrayBuffer)
                {
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes(new ByteArray((ArrayBuffer)data)));
                }
                else if (data is Uint8Array)
                {
                    // ReSharper disable once PossibleInvalidCastException
                    ScoreLoaded(ScoreLoader.LoadScoreFromBytes((ByteArray)data));
                }
                else if (data is string)
                {
                    ScoreLoader.LoadScoreAsync((string)data, ScoreLoaded, LogError);
                }
            }
            catch (Exception e)
            {
                LogError(e);
            }
        }

        public void Tex(string contents)
        {
            try
            {
                var parser = new AlphaTexImporter();
                var data = new ByteBuffer(Std.StringToByteArray(contents));
                parser.Init(data);
                ScoreLoaded(parser.ReadScore());
            }
            catch (Exception e)
            {
                LogError(e);
            }
        }

        public void SetTracks(dynamic tracksData, bool render = true)
        {
            FastList<int> tracks = new FastList<int>();

            // decode string
            if (tracksData is string)
            {
                try
                {
                    tracksData = Json.Parse((string)tracksData);
                }
                catch
                {
                    tracksData = new[] { 0 };
                }
            }

            // decode array
            if (tracksData is int)
            {
                tracks.Add((int) tracksData);
            }
            else if (tracksData.length)
            {
                for (var i = 0; i < tracksData.length; i++)
                {
                    int value;
                    if (tracksData[i] is int)
                    {
                        value = (int)tracksData[i];
                    }
                    else
                    {
                        value = Std.ParseInt(tracksData[i].ToString());
                    }

                    if (value >= 0)
                    {
                        tracks.Add(value);
                    }
                }
            }
            _tracks = tracks.ToArray();

            if (render)
            {
                Render();
            }
        }

        public void ScoreLoaded(Score score)
        {
            Score = score;
            TriggerEvent("loaded", score);
            Render();
        }

        private void TriggerEvent(string name, object details = null)
        {
            if (_element != null)
            {
                dynamic e = Document.CreateEvent("CustomEvent");
                e.initCustomEvent(name, false, false, details);
                _element.DispatchEvent(e);
            }
        }

        public void Render()
        {
            if (Renderer != null)
            {
                Renderer.RenderMultiple(Tracks);
            }
        }

        [InlineCode("console.error({message})")]
        private void LogError(object message)
        {
        }
    }

}