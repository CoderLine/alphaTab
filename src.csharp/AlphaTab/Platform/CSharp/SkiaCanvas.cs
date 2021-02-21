using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using AlphaTab.Model;
using HarfBuzzSharp;
using SkiaSharp;
using Font = AlphaTab.Model.Font;
using Math = System.Math;
using String = AlphaTab.Core.EcmaScript.String;

namespace AlphaTab.Platform.CSharp
{
    internal class SkiaCanvas : ICanvas
    {
        private static readonly SKTypeface MusicFont;
        private const int MusicFontSize = 34;

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
                    var libSkiaSharpPath =
                        Path.GetDirectoryName(typeof(SkiaCanvas).Assembly.Location);
                    if (IntPtr.Size == 4)
                    {
                        libSkiaSharpPath = Path.Combine(libSkiaSharpPath, "runtimes", "win-x86",
                            "native", "libSkiaSharp.dll");
                    }
                    else
                    {
                        libSkiaSharpPath = Path.Combine(libSkiaSharpPath, "runtimes", "win-x64",
                            "native", "libSkiaSharp.dll");
                    }

                    Logger.Debug("Skia", "Loading native lib from '" + libSkiaSharpPath + "'");
                    var lib = LoadLibrary(libSkiaSharpPath);
                    if (lib == IntPtr.Zero)
                    {
                        Logger.Warning("Skia",
                            "Loading native lib from '" + libSkiaSharpPath + "' failed");
                    }
                    else
                    {
                        Logger.Debug("Skia",
                            "Loading native lib from '" + libSkiaSharpPath + "' successful");
                    }

                    break;
            }

            // attempt to load correct skia native lib
            var type = typeof(SkiaCanvas).GetTypeInfo();
            using var bravura =
                type.Assembly.GetManifestResourceStream(type.Namespace + ".Bravura.ttf");
            MusicFont = SKTypeface.FromStream(bravura);
        }

        private SKSurface? _surface;
        private SKPath? _path;
        private string _typeFaceCache = "";
        private SKTypeface? _typeFace;

        public Color Color { get; set; }
        public double LineWidth { get; set; }
        public Font Font { get; set; }

        private SKTypeface TypeFace
        {
            get
            {
                if (_typeFaceCache != Font.ToCssString(Settings.Display.Scale))
                {
                    _typeFace?.Dispose();

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
            var newImage = SKSurface.Create(new SKImageInfo((int) width,
                (int) height,
                SKImageInfo.PlatformColorType,
                SKAlphaType.Premul));
            _surface = newImage;

            _path?.Dispose();
            _path = new SKPath {FillType = SKPathFillType.Winding};
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
            using var paint = CreatePaint();
            paint.Style = SKPaintStyle.Fill;
            _surface.Canvas.DrawRect(SKRect.Create((int) x, (int) y, (float) w, (float) h),
                paint);
        }

        private SKPaint CreatePaint()
        {
            var paint = new SKPaint();
            paint.Color = new SKColor((byte) Color.R, (byte) Color.G, (byte) Color.B,
                (byte) Color.A);
            paint.StrokeWidth = (float) LineWidth;
            paint.StrokeMiter = 4;
            paint.BlendMode = SKBlendMode.SrcOver;
            paint.IsAntialias = true;
            paint.IsDither = true;
            paint.StrokeCap = SKStrokeCap.Butt;
            paint.StrokeJoin = SKStrokeJoin.Miter;
            paint.FilterQuality = SKFilterQuality.None;
            return paint;
        }

        public void StrokeRect(double x, double y, double w, double h)
        {
            using (var paint = CreatePaint())
            {
                paint.Style = SKPaintStyle.Stroke;
                paint.StrokeWidth = (float) LineWidth;
                _surface.Canvas.DrawRect(SKRect.Create((int) x, (int) y, (float) w, (float) h),
                    paint);
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
            _path.MoveTo((float) x, (float) y);
        }

        public void LineTo(double x, double y)
        {
            _path.LineTo((float) x, (float) y);
        }

        public void QuadraticCurveTo(double cpx, double cpy, double x, double y)
        {
            _path.QuadTo((float) cpx, (float) cpy, (float) x, (float) y);
        }

        public void BezierCurveTo(double cp1X, double cp1Y, double cp2X, double cp2Y, double x,
            double y)
        {
            _path.CubicTo((float) cp1X, (float) cp1Y, (float) cp2X, (float) cp2Y, (float) x,
                (float) y);
        }

        public void FillCircle(double x, double y, double radius)
        {
            BeginPath();
            _path.AddCircle((float) x, (float) y, (float) radius);
            ClosePath();
            Fill();
        }

        public void StrokeCircle(double x, double y, double radius)
        {
            BeginPath();
            _path.AddCircle((float) x, (float) y, (float) radius);
            ClosePath();
            Stroke();
        }

        public void Fill()
        {
            using (var paint = CreatePaint())
            {
                paint.Style = SKPaintStyle.Fill;
                _surface.Canvas.DrawPath(_path, paint);
            }

            _path.Reset();
        }

        public void Stroke()
        {
            using (var paint = CreatePaint())
            {
                paint.Style = SKPaintStyle.Stroke;
                paint.StrokeWidth = (float) LineWidth;
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

        private const int SkiaToHarfBuzzFontSize = 1 << 16;
        private const float HarfBuzzToSkiaFontSize = 1f / SkiaToHarfBuzzFontSize;

        private static HarfBuzzSharp.Font MakeHarfBuzzFont(SKTypeface typeface, int size)
        {
            using var stream = typeface.OpenStream(out var ttcIndex);
            var data = Marshal.AllocCoTaskMem(stream.Length);
            stream.Read(data, stream.Length);
            using var blob = new Blob(data, stream.Length, MemoryMode.ReadOnly,
                () => { Marshal.FreeCoTaskMem(data); });
            blob.MakeImmutable();

            using var face = new Face(blob, ttcIndex)
            {
                Index = ttcIndex,
                UnitsPerEm = typeface.UnitsPerEm
            };

            var font = new HarfBuzzSharp.Font(face);
            var scale = size * SkiaToHarfBuzzFontSize;
            font.SetScale(scale, scale);
            font.SetFunctionsOpenType();
            return font;
        }


        public void FillText(string text, double x, double y)
        {
            if (text.Length == 0)
            {
                return;
            }

            TextRun(text, TypeFace, Font.Size, (blob, font, paint, width) =>
            {
                var xOffset = GetFontOffset(
                    TextAlign,
                    width
                );

                var fontBaseLine = GetFontBaseLine(
                    TextBaseline,
                    font
                );

                _surface.Canvas.DrawText(
                    blob,
                    (float) x + xOffset,
                    (float) y + fontBaseLine,
                    paint
                );
            });
        }

        private float GetFontOffset(TextAlign textAlign, float width)
        {
            return textAlign switch
            {
                TextAlign.Left => 0,
                TextAlign.Center => -width / 2,
                TextAlign.Right => -width,
                _ => 0
            };
        }

        private void TextRun(string text, SKTypeface typeFace, double size,
            Action<SKTextBlob, SKFont, SKPaint, float> action)
        {
            using var paint = CreatePaint();
            paint.Style = SKPaintStyle.Fill;
            paint.Typeface = typeFace;
            paint.TextSize = (float) (size * Settings.Display.Scale);

            using var harfBuzzFont = MakeHarfBuzzFont(typeFace, (int) size);
            using var buffer = new HarfBuzzSharp.Buffer
            {
                Direction = Direction.LeftToRight,
                Language = Language.Default
            };
            buffer.AddUtf8(text);
            harfBuzzFont.Shape(buffer);

            var infos = buffer.GlyphInfos;
            var positions = buffer.GlyphPositions;

            using var skFont = paint.ToFont();
            skFont.Edging = SKFontEdging.Antialias;
            skFont.Subpixel = true;
            skFont.Hinting = SKFontHinting.Normal;
            skFont.Typeface = typeFace;
            skFont.Size = (float) size;

            using var blobBuilder = new SKTextBlobBuilder();
            var runBuffer = blobBuilder.AllocatePositionedRun(skFont, infos.Length);

            var glyphSpan = runBuffer.GetGlyphSpan();
            var positionSpan = runBuffer.GetPositionSpan();

            var width = 0.0f;
            for (var i = 0; i < infos.Length; i++)
            {
                glyphSpan[i] = (ushort) infos[i].Codepoint;

                var xOffset = width + HarfBuzzToSkiaFontSize * positions[i].XOffset;
                var yOffset = HarfBuzzToSkiaFontSize * -positions[i].YOffset;
                positionSpan[i] = new SKPoint(xOffset, yOffset);

                width += HarfBuzzToSkiaFontSize * positions[i].XAdvance;
            }

            using var blob = blobBuilder.Build();
            action(blob, skFont, paint, width);
        }

        private const int HangingAsPercentOfAscent = 80;

        private float GetFontBaseLine(TextBaseline baseline, SKFont font)
        {
            // TextMetrics::GetFontBaseline
            // https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/third_party/blink/renderer/core/html/canvas/text_metrics.cc#L14
            switch (baseline)
            {
                case TextBaseline.Top: // Hanging
                {
                    var (ascDesc, _) = AscentDescent(font.Metrics);
                    return ascDesc * HangingAsPercentOfAscent / 100.0f;
                }
                case TextBaseline.Middle:
                {
                    var (emHeightAscent, emHeightDescent) = EmHeightAcentDescent(font);
                    return (emHeightAscent.ToFloat() - emHeightDescent.ToFloat()) / 2.0f;
                }
                case TextBaseline.Bottom:
                {
                    var (_, emHeightDescent) = EmHeightAcentDescent(font);
                    return -emHeightDescent.ToFloat();
                }
                default:
                    return 0;
            }
        }

        private (LayoutUnit ascent, LayoutUnit descent) EmHeightAcentDescent(SKFont font)
        {
            var typeface = font.Typeface;
            var (typoAscent, typeDecent) = TypoAscenderDescender(typeface);
            if (typoAscent > 0 &&
                NormalizeEmHeightMetrics(font, typoAscent, typoAscent + typeDecent,
                    out var normTypoAsc, out var normTypoDesc))
            {
                return (normTypoAsc!, normTypoDesc!);
            }

            var (metricAscent, metricDescent) = AscentDescent(font.Metrics);
            if (NormalizeEmHeightMetrics(font, metricAscent, metricAscent + metricDescent,
                out var normAsc, out var normDesc))
            {
                return (normAsc!, normDesc!);
            }

            throw new InvalidOperationException("Cannot compute ascent and descent");
        }

        private bool NormalizeEmHeightMetrics(SKFont font, float ascent, float height,
            out LayoutUnit? emHeightAscent, out LayoutUnit? emHeightDescent)
        {
            if (height <= 0 || ascent < 0 || ascent > height)
            {
                emHeightAscent = null;
                emHeightDescent = null;
                return false;
            }

            var emHeight = font.Size;
            emHeightAscent = LayoutUnit.FromFloatRound(ascent * emHeight / height);
            emHeightDescent = LayoutUnit.FromFloatRound(emHeight) - emHeightAscent;
            return true;
        }

        private (short typoAscender, short typooDescender) TypoAscenderDescender(
            SKTypeface typeface)
        {
            try
            {
                var buffer = typeface.GetTableData(GetIntTag("OS/2"));
                if (buffer.Length >= 72)
                {
                    return (
                        (short) (buffer[68] << 8 | buffer[69]),
                        (short) -(buffer[70] << 8 | buffer[71])
                    );
                }
            }
            catch
            {
                // no data
            }

            return (0, 0);
        }

        private class LayoutUnit
        {
            private int _value;
            private const int LayoutUnitFractionalBits = 6;
            private const int FixedPointDenominator = 1 << LayoutUnitFractionalBits;

            public float ToFloat()
            {
                return (float) _value / FixedPointDenominator;
            }

            public static LayoutUnit FromFloatRound(float value)
            {
                return new LayoutUnit
                {
                    _value = (int) (float) Math.Round(value * FixedPointDenominator)
                };
            }

            public static LayoutUnit operator -(LayoutUnit a, LayoutUnit b)
            {
                return new LayoutUnit {_value = a._value - b._value};
            }
        }

        private (float ascent, float descent) AscentDescent(SKFontMetrics metrics)
        {
            float ascent;
            float descent;
            if (-metrics.Ascent < 3 || -metrics.Ascent + metrics.Descent < 2)
            {
                // For tiny fonts, the rounding of fAscent and fDescent results in equal
                // baseline for different types of text baselines (crbug.com/338908).
                // Please see CanvasRenderingContext2D::getFontBaseline for the heuristic.
                ascent = -metrics.Ascent;
                descent = metrics.Descent;
            }
            else
            {
                ascent = SkScalarRoundToScalar(-metrics.Ascent);
                descent = SkScalarRoundToScalar(metrics.Descent);
            }

            return (ascent, descent);
        }

        private float SkScalarRoundToScalar(float x)
        {
            return (float) Math.Floor(x + 0.5f);
        }

        private static uint GetIntTag(string v)
        {
            return
                (uint) v[0] << 24 |
                (uint) v[1] << 16 |
                (uint) v[2] << 08 |
                (uint) v[3] << 00;
        }

        public double MeasureText(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            var size = 0.0;
            TextRun(text, TypeFace, Font.Size,
                (blob, font, paint, width) => { size = width; });

            return size;
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

            FillMusicFontSymbols(x, y, scale, new[] {symbol}, centerAtPosition);
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
                    s += String.FromCharCode((double) symbol);
                }
            }

            TextRun(s, MusicFont, MusicFontSize * scale, (blob, font, paint, width) =>
            {
                var xOffset = GetFontOffset(
                    centerAtPosition ? TextAlign.Center : TextAlign.Left,
                    width);

                _surface.Canvas.DrawText(
                    blob,
                    (float) x + xOffset,
                    (float) y,
                    paint
                );
            });
        }

        public void BeginRotate(double centerX, double centerY, double angle)
        {
            _surface.Canvas.Save();
            _surface.Canvas.Translate((float) centerX, (float) centerY);
            _surface.Canvas.RotateDegrees((float) angle);
        }

        public void EndRotate()
        {
            _surface.Canvas.Restore();
        }
    }
}
