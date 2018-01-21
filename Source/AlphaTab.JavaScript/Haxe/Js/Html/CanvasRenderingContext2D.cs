using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.CanvasRenderingContext2D")]
    public class CanvasRenderingContext2D
    {
        [Name("textBaseline")]
        public extern string TextBaseline { get; set; }
        [Name("strokeStyle")]
        public extern string StrokeStyle { get; set; }
        [Name("fillStyle")]
        public extern string FillStyle { get; set; }
        [Name("lineWidth")]
        public HaxeFloat LineWidth { get; set; }
        [Name("font")]
        public extern string Font { get; set; }
        [Name("textAlign")]
        public extern string TextAlign { get; set; }

        [Name("fillRect")]
        public extern void FillRect(HaxeFloat x, HaxeFloat y, HaxeFloat w, HaxeFloat h);
        [Name("strokeRect")]
        public extern void StrokeRect(HaxeFloat x, HaxeFloat y, HaxeFloat w, HaxeFloat h);
        [Name("beginPath")]
        public extern void BeginPath();
        [Name("closePath")]
        public extern void ClosePath();
        [Name("moveTo")]
        public extern void MoveTo(HaxeFloat x, HaxeFloat y);
        [Name("lineTo")]
        public extern void LineTo(HaxeFloat x, HaxeFloat y);
        [Name("quadraticCurveTo")]
        public extern void QuadraticCurveTo(HaxeFloat cpx, HaxeFloat cpy, HaxeFloat x, HaxeFloat y);
        [Name("bezierCurveTo")]
        public extern void BezierCurveTo(HaxeFloat cp1x, HaxeFloat cp1y, HaxeFloat cp2x, HaxeFloat cp2y, HaxeFloat x, HaxeFloat y);
        [Name("arc")]
        public extern void Arc(HaxeFloat x, HaxeFloat y, HaxeFloat radius, HaxeFloat startAngle, HaxeFloat endAngle);
        [Name("arc")]
        public extern void Arc(HaxeFloat x, HaxeFloat y, HaxeFloat radius, HaxeFloat startAngle, HaxeFloat endAngle, bool anticlockwise);
        [Name("fill")]
        public extern void Fill();
        [Name("stroke")]
        public extern void Stroke();
        [Name("fillText")]
        public extern void FillText(string text, HaxeFloat x, HaxeFloat y);
        [Name("measureTet")]
        public extern TextMetrics MeasureText(string text);
    }

    [External]
    [Name("js.html.TextMetrics")]
    public class TextMetrics
    {
        [Name("width")]
        public extern HaxeFloat Width { get; }
    }
}
