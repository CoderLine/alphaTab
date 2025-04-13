using System;
using System.Runtime.CompilerServices;

namespace AlphaTab.Platform.Skia.AlphaSkiaBridge;

internal enum AlphaSkiaTextAlign
{
    Left = AlphaSkia.AlphaSkiaTextAlign.Left,
    Center = AlphaSkia.AlphaSkiaTextAlign.Center,
    Right = AlphaSkia.AlphaSkiaTextAlign.Right
}

internal enum AlphaSkiaTextBaseline
{
    Alphabetic = AlphaSkia.AlphaSkiaTextBaseline.Alphabetic,
    Top = AlphaSkia.AlphaSkiaTextBaseline.Top,
    Middle = AlphaSkia.AlphaSkiaTextBaseline.Middle,
    Bottom = AlphaSkia.AlphaSkiaTextBaseline.Bottom
}

/// <summary>
/// Bridge between alphaTab and <see cref="AlphaSkia.AlphaSkiaImage"/>
/// </summary>
public class AlphaSkiaImage : IDisposable
{
    /// <summary>
    /// Gets the target <see cref="AlphaSkia.AlphaSkiaImage"/>.
    /// </summary>
    public AlphaSkia.AlphaSkiaImage Image { get; }
    internal double Width => Image.Width;
    internal double Height => Image.Height;

    internal AlphaSkiaImage(AlphaSkia.AlphaSkiaImage image)
    {
        Image = image;
    }

    public void Dispose()
    {
        Image.Dispose();
    }

    internal ArrayBuffer? ReadPixels()
    {
        var data = Image.ReadPixels();
        if (data == null)
        {
            return null;
        }

        return new ArrayBuffer(data);
    }

    internal ArrayBuffer? ToPng()
    {
        var data = Image.ToPng();
        if (data == null)
        {
            return null;
        }

        return new ArrayBuffer(data);
    }

    internal static AlphaSkiaImage? Decode(ArrayBuffer buffer)
    {
        var underlying = AlphaSkia.AlphaSkiaImage.Decode(buffer.Raw);
        return underlying == null ? null : new AlphaSkiaImage(underlying);
    }

    internal static AlphaSkiaImage? FromPixels(double width, double height, ArrayBuffer pixels)
    {
        var underlying =
            AlphaSkia.AlphaSkiaImage.FromPixels((int)width, (int)height, pixels.Raw);
        return underlying == null ? null : new AlphaSkiaImage(underlying);
    }
}

/// <summary>
/// Bridge between alphaTab and <see cref="AlphaSkia.AlphaSkiaCanvas"/>
/// </summary>
internal class AlphaSkiaCanvas : IDisposable
{
    private readonly AlphaSkia.AlphaSkiaCanvas _canvas = new();

    public uint Color
    {
        get => _canvas.Color;
        set => _canvas.Color = value;
    }

    public double LineWidth
    {
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        get => _canvas.LineWidth;
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        set => _canvas.LineWidth = (float)value;
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Dispose()
    {
        _canvas.Dispose();
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static uint RgbaToColor(double r, double g, double b, double a)
    {
        return AlphaSkia.AlphaSkiaCanvas.RgbaToColor((byte)r, (byte)g, (byte)b, (byte)a);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void FillRect(double x, double y, double w, double h)
    {
        _canvas.FillRect((float)x, (float)y, (float)w, (float)h);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void StrokeRect(double x, double y, double w, double h)
    {
        _canvas.StrokeRect((float)x, (float)y, (float)w, (float)h);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void BeginPath()
    {
        _canvas.BeginPath();
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void ClosePath()
    {
        _canvas.ClosePath();
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void MoveTo(double x, double y)
    {
        _canvas.MoveTo((float)x, (float)y);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void LineTo(double x, double y)
    {
        _canvas.LineTo((float)x, (float)y);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void QuadraticCurveTo(double cpx, double cpy, double x, double y)
    {
        _canvas.QuadraticCurveTo((float)cpx, (float)cpy, (float)x, (float)y);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void BezierCurveTo(double cp1x, double cp1y, double cp2x, double cp2y, double x,
        double y)
    {
        _canvas.BezierCurveTo((float)cp1x, (float)cp1y, (float)cp2x, (float)cp2y, (float)x,
            (float)y);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void FillCircle(double x, double y, double radius)
    {
        _canvas.FillCircle((float)x, (float)y, (float)radius);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void StrokeCircle(double x, double y, double radius)
    {
        _canvas.StrokeCircle((float)x, (float)y, (float)radius);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Fill()
    {
        _canvas.Fill();
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void Stroke()
    {
        _canvas.Stroke();
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void FillText(string text, AlphaSkiaTypeface typeface, double fontSize, double x,
        double y,
        AlphaSkiaTextAlign textAlign, AlphaSkiaTextBaseline baselineBridge)
    {
        _canvas.FillText(text, typeface.Typeface, (float)fontSize, (float)x, (float)y,
            (AlphaSkia.AlphaSkiaTextAlign)textAlign, (AlphaSkia.AlphaSkiaTextBaseline)baselineBridge);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public double MeasureText(string text, AlphaSkiaTypeface typeface, double fontSize)
    {
        return _canvas.MeasureText(text, typeface.Typeface, (float)fontSize);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void BeginRender(double width, double height)
    {
        _canvas.BeginRender((int)width, (int)height);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void BeginRender(double width, double height, double renderScale)
    {
        _canvas.BeginRender((int)width, (int)height, (float)renderScale);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public AlphaSkiaImage? EndRender()
    {
        var underlying = _canvas.EndRender();
        return underlying == null
            ? null
            : new AlphaSkiaImage(underlying);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void BeginRotate(double centerX, double centerY, double angle)
    {
        _canvas.BeginRotate((float)centerX, (float)centerY, (float)angle);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public void EndRotate()
    {
        _canvas.EndRotate();
    }

    public void DrawImage(AlphaSkiaImage image, double x, double y, double width, double height)
    {
        _canvas.DrawImage(image.Image, (float)x, (float)y, (float)width, (float)height);
    }
}

internal class AlphaSkiaTypeface : IDisposable
{
    internal AlphaSkia.AlphaSkiaTypeface Typeface { get; }

    internal AlphaSkiaTypeface(AlphaSkia.AlphaSkiaTypeface typeface)
    {
        Typeface = typeface;
    }

    public string FamilyName => Typeface.FamilyName;
    public bool IsBold => Typeface.IsBold;
    public bool IsItalic => Typeface.IsItalic;

    public void Dispose()
    {
        Typeface.Dispose();
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static AlphaSkiaTypeface? Register(ArrayBuffer buffer)
    {
        var underlying = AlphaSkia.AlphaSkiaTypeface.Register(buffer.Raw);
        return underlying == null
            ? null
            : new AlphaSkiaTypeface(underlying);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static AlphaSkiaTypeface? Create(string name, bool bold, bool italic)
    {
        var underlying = AlphaSkia.AlphaSkiaTypeface.Create(name, bold, italic);
        return underlying == null
            ? null
            : new AlphaSkiaTypeface(underlying);
    }
}
