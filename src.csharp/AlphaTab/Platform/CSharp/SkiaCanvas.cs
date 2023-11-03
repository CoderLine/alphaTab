using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using AlphaSkia;
using AlphaTab.Model;
using Font = AlphaTab.Model.Font;
using String = AlphaTab.Core.EcmaScript.String;

namespace AlphaTab.Platform.CSharp
{
    internal sealed class SkiaCanvas : ICanvas
    {
        private static readonly AlphaSkiaTypeface MusicFont;
        private const int MusicFontSize = 34;

        static SkiaCanvas()
        {
            // attempt to load correct skia native lib
            var type = typeof(SkiaCanvas).GetTypeInfo();
            using var bravura =
                type.Assembly.GetManifestResourceStream(type.Namespace + ".Bravura.ttf")!;
            var bravuraData = new MemoryStream((int)bravura.Length);
            bravura.CopyTo(bravuraData);
            MusicFont = AlphaSkiaTypeface.Register(bravuraData.ToArray())!;
        }

        private static readonly IDictionary<string, AlphaSkiaTypeface> CustomTypeFaces =
            new Dictionary<string, AlphaSkiaTypeface>(StringComparer.OrdinalIgnoreCase);

        public static void RegisterCustomFont(byte[] data)
        {
            var face = AlphaSkiaTypeface.Register(data);
            CustomTypeFaces[CustomTypeFaceKey(face)] = face;
        }

        private static string CustomTypeFaceKey(AlphaSkiaTypeface typeface)
        {
            return CustomTypeFaceKey(typeface.FamilyName, typeface.IsBold,
                typeface.IsItalic);
        }

        private static string CustomTypeFaceKey(string fontFamily, bool isBold, bool isItalic)
        {
            return fontFamily.ToLowerInvariant() + "_" + isBold + "_" + isItalic;
        }

        private readonly AlphaSkiaCanvas _surface = new AlphaSkiaCanvas();
        private string _typeFaceCache = "";
        private bool _typeFaceIsSystem;
        private AlphaSkiaTypeface? _typeFace;
        private Color _color;
        private double _lineWidth;

        public Color Color
        {
            get => _color;
            set
            {
                _color = value;
                _surface.Color = AlphaSkiaCanvas.RgbaToColor((byte)value.R, (byte)value.G,
                    (byte)value.B, (byte)value.A);
            }
        }

        public double LineWidth
        {
            get => _lineWidth;
            set
            {
                _lineWidth = value;
                _surface.LineWidth = (float)value;
            }
        }

        public Font Font { get; set; }

        private AlphaSkiaTypeface TypeFace
        {
            get
            {
                if (_typeFaceCache != Font.ToCssString(Settings.Display.Scale))
                {
                    if (_typeFaceIsSystem)
                    {
                        _typeFace?.Dispose();
                    }

                    _typeFaceCache = Font.ToCssString(Settings.Display.Scale);

                    var key = CustomTypeFaceKey(Font.Family, Font.IsBold, Font.IsItalic);
                    if (!CustomTypeFaces.TryGetValue(key, out _typeFace))
                    {
                        _typeFaceIsSystem = true;
                        _typeFace = AlphaSkiaTypeface.Create(Font.Family,
                            Font.IsBold,
                            Font.IsItalic
                        );
                    }
                    else
                    {
                        _typeFaceIsSystem = false;
                    }
                }

                return _typeFace;
            }
        }

        public TextAlign TextAlign { get; set; }

        public TextBaseline TextBaseline { get; set; }
        public Settings Settings { get; set; }

        public SkiaCanvas()
        {
            _color = Color = new Color(255, 255, 255);
            LineWidth = 1;
            Font = new Font("Arial", 10);
            TextAlign = TextAlign.Left;
            TextBaseline = TextBaseline.Top;
            Settings = null!;
        }

        public void BeginRender(double width, double height)
        {
            _surface.BeginRender((int)width, (int)height);
        }

        public object EndRender()
        {
            return _surface.EndRender();
        }

        public object OnRenderFinished()
        {
            // nothing to do
            return null;
        }

        public void FillRect(double x, double y, double w, double h)
        {
            _surface.FillRect((float)x, (float)y, (float)w, (float)h);
        }

        public void StrokeRect(double x, double y, double w, double h)
        {
            _surface.StrokeRect((float)x, (float)y, (float)w, (float)h);
        }

        public void BeginPath()
        {
            _surface.BeginPath();
        }

        public void ClosePath()
        {
            _surface.ClosePath();
        }

        public void MoveTo(double x, double y)
        {
            _surface.MoveTo((float)x, (float)y);
        }

        public void LineTo(double x, double y)
        {
            _surface.LineTo((float)x, (float)y);
        }

        public void QuadraticCurveTo(double cpx, double cpy, double x, double y)
        {
            _surface.QuadraticCurveTo((float)cpx, (float)cpy, (float)x, (float)y);
        }

        public void BezierCurveTo(double cp1X, double cp1Y, double cp2X, double cp2Y, double x,
            double y)
        {
            _surface.BezierCurveTo((float)cp1X, (float)cp1Y, (float)cp2X, (float)cp2Y, (float)x,
                (float)y);
        }

        public void FillCircle(double x, double y, double radius)
        {
            _surface.FillCircle((float)x, (float)y, (float)radius);
        }

        public void StrokeCircle(double x, double y, double radius)
        {
            _surface.StrokeCircle((float)x, (float)y, (float)radius);
        }

        public void Fill()
        {
            _surface.Fill();
        }

        public void Stroke()
        {
            _surface.Stroke();
        }

        public void BeginGroup(string identifier)
        {
        }

        public void EndGroup()
        {
        }

        public void FillText(string text, double x, double y)
        {
            if (text.Length == 0)
            {
                return;
            }

            var textAlign = TextAlign switch
            {
                TextAlign.Left => AlphaSkiaTextAlign.Left,
                TextAlign.Center => AlphaSkiaTextAlign.Center,
                TextAlign.Right => AlphaSkiaTextAlign.Right,
                _ => AlphaSkiaTextAlign.Left
            };

            var textBaseLine = TextBaseline switch
            {
                TextBaseline.Top => AlphaSkiaTextBaseline.Top,
                TextBaseline.Middle => AlphaSkiaTextBaseline.Middle,
                TextBaseline.Bottom => AlphaSkiaTextBaseline.Bottom,
                _ => AlphaSkiaTextBaseline.Top
            };

            _surface.FillText(text, TypeFace, (float)(Font.Size * Settings.Display.Scale),
                (float)x, (float)y, textAlign, textBaseLine
            );
        }

        public double MeasureText(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            return _surface.MeasureText(text, TypeFace, (float)Font.Size);
        }

        public void FillMusicFontSymbol(
            double x,
            double y,
            double scale,
            MusicFontSymbol symbol,
            bool centerAtPosition = false)
        {
            if (symbol == MusicFontSymbol.None)
            {
                return;
            }

            FillMusicFontSymbols(x, y, scale, new[] { symbol }, centerAtPosition);
        }

        public void FillMusicFontSymbols(
            double x,
            double y,
            double scale,
            IList<MusicFontSymbol> symbols,
            bool centerAtPosition = false)
        {
            var s = "";
            foreach (var symbol in symbols)
            {
                if (symbol != MusicFontSymbol.None)
                {
                    s += String.FromCharCode((double)symbol);
                }
            }

            _surface.FillText(s, MusicFont, (float)(MusicFontSize * scale),
                (float)x,
                (float)y,
                centerAtPosition ? AlphaSkiaTextAlign.Center : AlphaSkiaTextAlign.Left,
                AlphaSkiaTextBaseline.Alphabetic
            );
        }

        public void BeginRotate(double centerX, double centerY, double angle)
        {
            _surface.BeginRotate((float)centerX, (float)centerY, (float)angle);
        }

        public void EndRotate()
        {
            _surface.EndRotate();
        }
    }
}
