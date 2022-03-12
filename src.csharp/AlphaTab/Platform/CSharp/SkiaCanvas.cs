using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.ExceptionServices;
using System.Runtime.InteropServices;
using AlphaTab.Model;
using HarfBuzzSharp;
using SkiaSharp;
using Font = AlphaTab.Model.Font;
using Math = System.Math;
using String = AlphaTab.Core.EcmaScript.String;

namespace AlphaTab.Platform.CSharp
{
    internal sealed class SkiaCanvas : ICanvas
    {
        private static readonly SKTypeface MusicFont;
        private const int MusicFontSize = 34;

        static SkiaCanvas()
        {
            // attempt to load correct skia native lib
            var type = typeof(SkiaCanvas).GetTypeInfo();
            using var bravura =
                type.Assembly.GetManifestResourceStream(type.Namespace + ".Bravura.ttf");
            MusicFont = SKTypeface.FromStream(bravura);
        }

        private static readonly IDictionary<string, SKTypeface> CustomTypeFaces =
            new Dictionary<string, SKTypeface>(StringComparer.OrdinalIgnoreCase);
        public static void RegisterCustomFont(byte[] data)
        {
            using var skData = SKData.CreateCopy(data);
            var face = SKTypeface.FromData(skData);
            CustomTypeFaces[CustomTypeFaceKey(face)] = face;
        }

        private static string CustomTypeFaceKey(SKTypeface typeface)
        {
            return CustomTypeFaceKey(typeface.FamilyName, typeface.FontWeight > 400,
                typeface.FontSlant == SKFontStyleSlant.Italic);
        }

        private static string CustomTypeFaceKey(string fontFamily, bool isBold, bool isItalic)
        {
            return fontFamily.ToLowerInvariant() + "_" + isBold + "_" + isItalic;
        }

        private SKSurface? _surface;
        private SKPath? _path;
        private string _typeFaceCache = "";
        private bool _typeFaceIsSystem = false;
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
                    if (_typeFaceIsSystem)
                    {
                        _typeFace?.Dispose();
                    }
                    _typeFaceCache = Font.ToCssString(Settings.Display.Scale);

                    var key = CustomTypeFaceKey(Font.Family, Font.IsBold, Font.IsItalic);
                    if (!CustomTypeFaces.TryGetValue(key, out _typeFace))
                    {
                        _typeFaceIsSystem = true;
                        _typeFace = SKTypeface.FromFamilyName(Font.Family,
                            Font.IsBold ? SKFontStyleWeight.Bold : SKFontStyleWeight.Normal,
                            SKFontStyleWidth.Normal,
                            Font.IsItalic ? SKFontStyleSlant.Italic : SKFontStyleSlant.Upright
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

        public object OnRenderFinished()
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
            return new SKPaint
            {
                Color = new SKColor((byte) Color.R, (byte) Color.G, (byte) Color.B,
                    (byte) Color.A),
                StrokeWidth = (float) LineWidth,
                StrokeMiter = 4,
                BlendMode = SKBlendMode.SrcOver,
                IsAntialias = true,
                IsDither = true,
                StrokeCap = SKStrokeCap.Butt,
                StrokeJoin = SKStrokeJoin.Miter,
                FilterQuality = SKFilterQuality.None
            };
        }

        public void StrokeRect(double x, double y, double w, double h)
        {
            using var paint = CreatePaint();
            paint.Style = SKPaintStyle.Stroke;
            paint.StrokeWidth = (float) LineWidth;
            _surface.Canvas.DrawRect(SKRect.Create((int) x, (int) y, (float) w, (float) h),
                paint);
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

        [HandleProcessCorruptedStateExceptions]
        private static HarfBuzzSharp.Font MakeHarfBuzzFont(SKTypeface typeface, int size)
        {
            try
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
            catch (AccessViolationException e)
            {
                throw;
            }
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
                    return FloatAscent(font.Metrics) * HangingAsPercentOfAscent / 100.0f;
                }
                case TextBaseline.Middle:
                {
                    var (emHeightAscent, emHeightDescent) = EmHeightAscentDescent(font);
                    return (emHeightAscent - emHeightDescent) / 2.0f;
                }
                case TextBaseline.Bottom:
                {
                    var (_, emHeightDescent) = EmHeightAscentDescent(font);
                    return -emHeightDescent;
                }
                default:
                    return 0;
            }
        }

        private (float ascent, float descent) EmHeightAscentDescent(SKFont font)
        {
            var typeface = font.Typeface;
            var (typoAscent, typeDecent) = TypoAscenderDescender(typeface);
            if (typoAscent > 0 &&
                NormalizeEmHeightMetrics(font, typoAscent, typoAscent + typeDecent,
                    out var normTypoAsc, out var normTypoDesc))
            {
                return (normTypoAsc, normTypoDesc);
            }

            var metricAscent = FloatAscent(font.Metrics);
            var metricDescent = FloatDescent(font.Metrics);
            if (NormalizeEmHeightMetrics(font, metricAscent, metricAscent + metricDescent,
                out var normAsc, out var normDesc))
            {
                return (normAsc, normDesc);
            }

            throw new InvalidOperationException("Cannot compute ascent and descent");
        }

        private bool NormalizeEmHeightMetrics(SKFont font, float ascent, float height,
            out float emHeightAscent, out float emHeightDescent)
        {
            if (height <= 0 || ascent < 0 || ascent > height)
            {
                emHeightAscent = float.NaN;
                emHeightDescent = float.NaN;
                return false;
            }

            var emHeight = font.Size;
            emHeightAscent = ascent * emHeight / height;
            emHeightDescent = emHeight - emHeightAscent;
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

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private float FloatAscent(SKFontMetrics metrics)
        {
            return SkScalarRoundToScalar(-metrics.Ascent);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private float FloatDescent(SKFontMetrics metrics)
        {
            return SkScalarRoundToScalar(metrics.Descent);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        private float SkScalarRoundToScalar(float x)
        {
            return (float) Math.Floor(x + 0.5f);
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
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
