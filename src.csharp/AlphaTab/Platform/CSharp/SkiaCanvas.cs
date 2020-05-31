using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using AlphaTab.Model;
using AlphaTab.Rendering.Glyphs;
using SkiaSharp;
using String = AlphaTab.Core.EcmaScript.String;

namespace AlphaTab.Platform.CSharp
{
    internal class SkiaCanvas : ICanvas
    {
        private static readonly SKTypeface MusicFont;
        private static readonly int MusicFontSize = 34;

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr LoadLibrary(string libname);

        static SkiaCanvas()
        {
            // https://github.com/mono/SkiaSharp/issues/713
            // https://github.com/mono/SkiaSharp/issues/572
            // manually load skia lib
            switch (System.Environment.OSVersion.Platform)
            {
                case PlatformID.MacOSX:
                case PlatformID.Unix:
                    // I think unix platforms should be fine, to be tested
                    break;
                default:
                    var libSkiaSharpPath = Path.GetDirectoryName(typeof(SkiaCanvas).Assembly.Location);
                    if (IntPtr.Size == 4)
                    {
                        libSkiaSharpPath = Path.Combine(libSkiaSharpPath, "runtimes", "win-x86", "native", "libSkiaSharp.dll");
                    }
                    else
                    {
                        libSkiaSharpPath = Path.Combine(libSkiaSharpPath, "runtimes", "win-x64", "native", "libSkiaSharp.dll");
                    }

                    Logger.Debug("Skia", "Loading native lib from '" + libSkiaSharpPath + "'");
                    var lib = LoadLibrary(libSkiaSharpPath);
                    if (lib == IntPtr.Zero)
                    {
                        Logger.Warning("Skia", "Loading native lib from '" + libSkiaSharpPath + "' failed");
                    }
                    else
                    {
                        Logger.Debug("Skia", "Loading native lib from '" + libSkiaSharpPath + "' successful");
                    }

                    break;
            }

            // attempt to load correct skia native lib
            var type = typeof(SkiaCanvas).GetTypeInfo();
            using var bravura = type.Assembly.GetManifestResourceStream(type.Namespace + ".Bravura.ttf");
            MusicFont = SKTypeface.FromStream(bravura);
        }

        private SKSurface _surface = null!;
        private SKPath _path = null!;
        private string _typeFaceCache = "";
        private SKTypeface _typeFace = null!;

        public Color Color { get; set; }
        public double LineWidth { get; set; }
        public Font Font { get; set; }

        public SKTypeface TypeFace
        {
            get
            {
                if (_typeFaceCache != Font.ToCssString(Settings.Display.Scale))
                {
                    if (_typeFace != null)
                    {
                        _typeFace.Dispose();
                    }

                    _typeFaceCache = Font.ToCssString(Settings.Display.Scale);
                    _typeFace = SKTypeface.FromFamilyName(Font.Family,
                        Font.IsBold ? SKFontStyleWeight.Bold : SKFontStyleWeight.Normal,
                        SKFontStyleWidth.Normal,
                        Font.IsItalic ? SKFontStyleSlant.Italic : SKFontStyleSlant.Upright
                    );
                }

                return _typeFace;
            }
        }

        public TextAlign TextAlign { get; set; }

        public TextBaseline TextBaseline { get; set; }
        public Settings Settings { get; set; }

        public SkiaCanvas()
        {
            Color = new Color(255, 255, 255);
            LineWidth = 1;
            Font = new Font("Arial", 10);
            TextAlign = TextAlign.Left;
            TextBaseline = TextBaseline.Top;
            Settings = null!;
        }

        public void BeginRender(double width, double height)
        {
            var newImage = SKSurface.Create(new SKImageInfo((int)width,
                (int)height,
                SKImageInfo.PlatformColorType,
                SKAlphaType.Premul));
            _surface = newImage;

            if (_path != null)
            {
                _path.Dispose();
            }

            _path = new SKPath();
            _path.FillType = SKPathFillType.Winding;
        }

        public object EndRender()
        {
            var image = _surface.Snapshot();
            _surface.Dispose();
            return image;
        }

        public virtual object OnRenderFinished()
        {
            // nothing to do
            return null;
        }

        public void FillRect(double x, double y, double w, double h)
        {
            using (var paint = CreatePaint())
            {
                paint.BlendMode = SKBlendMode.SrcOver;
                _surface.Canvas.DrawRect(SKRect.Create((float)x, (float)y, (float)w, (float)h), paint);
            }
        }

        private SKPaint CreatePaint()
        {
            var paint = new SKPaint();
            paint.IsAntialias = true;
            paint.SubpixelText = true;
            paint.DeviceKerningEnabled = true;
            paint.Color = new SKColor((byte) Color.R, (byte) Color.G, (byte) Color.B,
                (byte) Color.A);
            return paint;
        }

        public void StrokeRect(double x, double y, double w, double h)
        {
            using (var paint = CreatePaint())
            {
                paint.BlendMode = SKBlendMode.SrcOver;
                paint.StrokeWidth = (float)LineWidth;
                paint.IsStroke = true;
                _surface.Canvas.DrawRect(SKRect.Create((float)x, (float)y, (float)w, (float)h), paint);
            }
        }

        public void BeginPath()
        {
            _path.Reset();
        }

        public void ClosePath()
        {
            _path.Close();
        }

        public void MoveTo(double x, double y)
        {
            _path.MoveTo((float)x, (float)y);
        }

        public void LineTo(double x, double y)
        {
            _path.LineTo((float)x, (float)y);
        }

        public void QuadraticCurveTo(double cpx, double cpy, double x, double y)
        {
            _path.QuadTo((float)cpx, (float)cpy, (float)x, (float)y);
        }

        public void BezierCurveTo(double cp1X, double cp1Y, double cp2X, double cp2Y, double x, double y)
        {
            _path.CubicTo((float)cp1X, (float)cp1Y, (float)cp2X, (float)cp2Y, (float)x, (float)y);
        }

        public void FillCircle(double x, double y, double radius)
        {
            BeginPath();
            _path.AddCircle((float)x, (float)y, (float)radius);
            ClosePath();
            Fill();
        }

        public void StrokeCircle(double x, double y, double radius)
        {
            BeginPath();
            _path.AddCircle((float)x, (float)y, (float)radius);
            ClosePath();
            Stroke();
        }

        public void Fill()
        {
            using (var paint = CreatePaint())
            {
                _surface.Canvas.DrawPath(_path, paint);
            }

            _path.Reset();
        }

        public void Stroke()
        {
            using (var paint = CreatePaint())
            {
                paint.StrokeWidth = (float)LineWidth;
                paint.IsStroke = true;
                _surface.Canvas.DrawPath(_path, paint);
            }

            _path.Reset();
        }

        public void BeginGroup(string identifier)
        {
        }

        public void EndGroup()
        {
        }

        public void FillText(string text, double x, double y)
        {
            using (var paint = CreatePaint())
            {
                paint.Typeface = TypeFace;
                paint.TextSize = (float)(Font.Size * Settings.Display.Scale);
                switch (TextAlign)
                {
                    case TextAlign.Left:
                        paint.TextAlign = SKTextAlign.Left;
                        break;
                    case TextAlign.Center:
                        paint.TextAlign = SKTextAlign.Center;
                        break;
                    case TextAlign.Right:
                        paint.TextAlign = SKTextAlign.Right;
                        break;
                }

                _surface.Canvas.DrawText(text, (int)x, (int)y + GetFontBaseline(TextBaseline, paint), paint);
            }
        }

        private float GetFontBaseline(TextBaseline baseline, SKPaint paint)
        {
            switch (baseline)
            {
                case TextBaseline.Top: // TopTextBaseline
                    // https://chromium.googlesource.com/chromium/blink/+/master/Source/modules/canvas2d/CanvasRenderingContext2D.cpp#2056
                    // According to http://wiki.apache.org/xmlgraphics-fop/LineLayout/AlignmentHandling
                    // "FOP (Formatting Objects Processor) puts the hanging baseline at 80% of the ascender height"
                    return (-paint.FontMetrics.Ascent * 4) / 5;
                case TextBaseline.Middle: // MiddleTextBaseline
                    return -paint.FontMetrics.Descent + paint.TextSize / 2;
                case TextBaseline.Bottom: // BottomTextBaseline
                    return -paint.FontMetrics.Descent;
                default:
                    break;
            }

            return 0;
        }

        public double MeasureText(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            using (var paint = CreatePaint())
            {
                paint.Typeface = TypeFace;
                paint.TextSize = (float)Font.Size;
                switch (TextAlign)
                {
                    case TextAlign.Left:
                        paint.TextAlign = SKTextAlign.Left;
                        break;
                    case TextAlign.Center:
                        paint.TextAlign = SKTextAlign.Center;
                        break;
                    case TextAlign.Right:
                        paint.TextAlign = SKTextAlign.Right;
                        break;
                }

                return paint.MeasureText(text);
            }
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

            using (var paint = CreatePaint())
            {
                paint.Typeface = MusicFont;
                paint.TextSize = (float)(MusicFontSize * scale);
                if (centerAtPosition)
                {
                    paint.TextAlign = SKTextAlign.Center;
                }

                _surface.Canvas.DrawText(String.FromCharCode((double)symbol), (float)x, (float)y, paint);
            }
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

            using (var paint = CreatePaint())
            {
                paint.Typeface = MusicFont;
                paint.TextSize = (float)(MusicFontSize * scale);
                if (centerAtPosition)
                {
                    paint.TextAlign = SKTextAlign.Center;
                }


                _surface.Canvas.DrawText(s, (float)x, (float)y, paint);
            }
        }

        public void BeginRotate(double centerX, double centerY, double angle)
        {
            _surface.Canvas.Save();
            _surface.Canvas.Translate((float)centerX, (float)centerY);
            _surface.Canvas.RotateDegrees((float)angle);
        }

        public void EndRotate()
        {
            _surface.Canvas.Restore();
        }
    }
}
