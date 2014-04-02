using AlphaTab.Platform.Model;

namespace AlphaTab.Platform
{
    /// <summary>
    /// This is the base public interface for canvas implementations on different plattforms.
    /// </summary>
    public interface ICanvas
    {
        int Width { get; set; }
        int Height { get; set; }

        Color Color { get; set; }

        float LineWidth { get; set; }

        void Clear();
        void FillRect(float x, float y, float w, float h);
        void StrokeRect(float x, float y, float w, float h);

        void BeginPath();
        void ClosePath();
        void MoveTo(float x, float y);
        void LineTo(float x, float y);
        void QuadraticCurveTo(float cpx, float cpy, float x, float y);
        void BezierCurveTo(float cp1x, float cp1y, float cp2x, float cp2y, float x, float y);
        void Rect(float x, float y, float w, float h);
        void Circle(float x, float y, float radius);
        void Fill();
        void Stroke();

        Font Font { get; set; }
        TextAlign TextAlign { get; set; }
        TextBaseline TextBaseline { get; set; }

        void FillText(string text, float x, float y);
        float MeasureText(string text);
    }
}
