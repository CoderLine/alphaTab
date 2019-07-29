using AlphaTab.Platform.Model;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Glyphs;
using Color = AlphaTab.Platform.Model.Color;

namespace AlphaTab.Platform
{
    /// <summary>
    /// This is the base public interface for canvas implementations on different plattforms.
    /// </summary>
    interface ICanvas : IPathCanvas
    {
        Settings Settings { get; set; }

        Color Color { get; set; }

        float LineWidth { get; set; }

        void FillRect(float x, float y, float w, float h);
        void StrokeRect(float x, float y, float w, float h);
        void FillCircle(float x, float y, float radius);

        Font Font { get; set; }
        TextAlign TextAlign { get; set; }
        TextBaseline TextBaseline { get; set; }

        void BeginGroup(string identifier);
        void EndGroup();

        void FillText(string text, float x, float y);
        float MeasureText(string text);
        void FillMusicFontSymbol(float x, float y, float scale, MusicFontSymbol symbol, bool centerAtPosition = false);
        void FillMusicFontSymbols(float x, float y, float scale, MusicFontSymbol[] symbols, bool centerAtPosition = false);

        void BeginRender(float width, float height);
        object EndRender();
        object OnRenderFinished();

        void BeginRotate(float centerX, float centerY, float angle);
        void EndRotate();
    }

    /// <summary>
    /// This is the path drawing API for canvas implementations
    /// </summary>
    // NOTE: For a full HTML based rendering we need to get rid of those 
    interface IPathCanvas
    {
        void BeginPath();
        void ClosePath();
        void Fill();
        void Stroke();

        void MoveTo(float x, float y);
        void LineTo(float x, float y);
        void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y);
        void QuadraticCurveTo(float cpx, float cpy, float x, float y);
    }
}
