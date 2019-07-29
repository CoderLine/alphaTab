using Haxe;
using Phase.Attributes;

namespace AlphaTab.Haxe.Js.Html
{
    [External]
    [Name("js.html.CanvasRenderingContext2D")]
    public class CanvasRenderingContext2D
    {
        [Name("textBaseline")]
        public extern HaxeString TextBaseline { get; set; }
        [Name("strokeStyle")]
        public extern HaxeString StrokeStyle { get; set; }
        [Name("fillStyle")]
        public extern HaxeString FillStyle { get; set; }
        [Name("lineWidth")]
        public HaxeFloat LineWidth { get; set; }
        [Name("font")]
        public extern HaxeString Font { get; set; }
        [Name("textAlign")]
        public extern HaxeString TextAlign { get; set; }

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
        public extern void Arc(HaxeFloat x, HaxeFloat y, HaxeFloat radius, HaxeFloat startAngle, HaxeFloat endAngle, HaxeBool anticlockwise);
        [Name("fill")]
        public extern void Fill();
        [Name("stroke")]
        public extern void Stroke();
        [Name("fillText")]
        public extern void FillText(HaxeString text, HaxeFloat x, HaxeFloat y);
        [Name("measureText")]
        public extern TextMetrics MeasureText(HaxeString text);
        [Name("save")]
        public extern void Save();
        [Name("restore")]
        public extern void Restore();
        [Name("translate")]
        public extern void Translate(HaxeFloat x, HaxeFloat y);
        [Name("rotate")]
        public extern void Rotate(HaxeFloat angle);
    }
}
