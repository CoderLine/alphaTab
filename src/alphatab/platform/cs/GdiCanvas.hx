package alphatab.platform.cs;

#if cs

class GdiCanvas implements Canvas 
{
    private var _strokeColor:GdiPen;
    private var _fillColor:GdiSolidBrush;
    private var _path:GdiGraphicsPath;
    private var _currentPosition:GdiPointF;
    private var _format:GdiStringFormat;
    
    private var _graphics:GdiGraphics;
    
    public var buffer:GdiBitmap;
    
    public function new() 
    {  
        _strokeColor = new GdiPen(GdiColor.Empty);
        _fillColor = new GdiSolidBrush(GdiColor.Empty);
        _path = new GdiGraphicsPath(GdiFillMode.Winding);
        _currentPosition = new GdiPointF(0, 0);
        _format = new GdiStringFormat();
        
        _width = 1;
        _height = 1;
        recreateImage();
    }
    
    private function recreateImage()
    {
        if (buffer != null)
        {
            buffer.Dispose();
            _graphics.Dispose();
        }
        
        buffer = new GdiBitmap(width, height, GdiPixelFormat.Format32bppArgb);
        _graphics = GdiGraphics.FromImage(buffer);
        _graphics.SmoothingMode = GdiSmoothingMode.AntiAlias;
        _graphics.TextRenderingHint = GdiTextRenderingHint.AntiAliasGridFit;
        _graphics.Clear(GdiColor.Transparent);
    }
    
    private var _width:Int;
    private var _height:Int;
    private var _lineWidth:Float;
    private var _font:FontInfo;
    
    public var width(get, set):Int;
    public var height(get, set):Int;
    
    private function get_width():Int 
    {
        return _width; 
    }
    
    private function get_height():Int 
    {
        return _height;
    }
    
    private function set_width(width:Int):Int 
    {
        _width = width;
        recreateImage();
        return width;
    }
    
    private function set_height(height:Int):Int 
    {
        _height = height;
        recreateImage();
        return height;
    } 
    
    // colors and styles
    public var strokeStyle(get, set):String;
    
    private function get_strokeStyle() : String
    {
        return GdiColorTranslator.ToHtml(_strokeColor.Color);
    } 
    
    private function set_strokeStyle(value:String) : String
    {
        _strokeColor.Color = ColorFromCss(value);
        return value;
    }
    
    public var fillStyle(get, set):String;
    private function get_fillStyle() : String
    {
        return GdiColorTranslator.ToHtml(_fillColor.Color);
    }
    private function set_fillStyle(value:String) : String
    {
        _fillColor.Color = ColorFromCss(value);
        return value;
    }
    
    // line caps/joins
    public var lineWidth(get, set):Float;
    private function get_lineWidth() : Float
    {
        return _lineWidth;
    }
    private function set_lineWidth(value:Float) : Float
    {
        _lineWidth = value;
        return value;
    }
    
    // rects
    public function clear():Void
    {
        _graphics.Clear(GdiColor.Transparent);
    }
    public function fillRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _graphics.FillRectangle(_fillColor, x, y, w, h);
    }
    public function strokeRect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _graphics.DrawRectangle(_strokeColor, x, y, w, h);
    }

    // path API
    public function beginPath():Void
    {
        _path.StartFigure();
    }
    public function closePath():Void
    {
        _path.CloseFigure();
    }
    
    public function moveTo(x:Float, y:Float):Void
    {
        _currentPosition.X = x;
        _currentPosition.Y = y;
    }
    public function lineTo(x:Float, y:Float):Void
    {
        _path.AddLine(_currentPosition, new GdiPointF(x, y));
        _currentPosition.X = x;
        _currentPosition.Y = y;
    }
    public function quadraticCurveTo(cpx:Float, cpy:Float, x:Float, y:Float):Void
    {
        _path.AddBezier(_currentPosition, new GdiPointF(cpx, cpy), new GdiPointF(cpx, cpy), new GdiPointF(x, y));
        _currentPosition.X = x;
        _currentPosition.Y = y;
    }
    
    public function bezierCurveTo(cp1x:Float, cp1y:Float, cp2x:Float, cp2y:Float, x:Float, y:Float):Void
    {
        _path.AddBezier(_currentPosition, new GdiPointF(cp1x, cp1y), new GdiPointF(cp2x, cp2y), new GdiPointF(x, y));
        _currentPosition.X = x;
        _currentPosition.Y = y;
    }
    
    public function circle(x:Float, y:Float, radius:Float):Void
    {
        _path.AddEllipse(x - radius, y - radius, radius * 2, radius * 2);
    }
    public function rect(x:Float, y:Float, w:Float, h:Float):Void
    {
        _path.AddRectangle(new GdiRectangleF(x, y, w, h));
    }
    public function fill():Void
    {
        _graphics.FillPath(_fillColor, _path);
        _path.Dispose();
        _path = new GdiGraphicsPath(GdiFillMode.Winding);
    }
    public function stroke():Void
    {
        _graphics.DrawPath(_strokeColor, _path);
        _path.Dispose();
        _path = new GdiGraphicsPath(GdiFillMode.Winding);
    }

    // text
    public var font(get, set):String; 
    private function get_font() : String
    {
        return _font.toString();
    }
    private function set_font(value:String) : String
    {
        _font = new FontInfo(value);
        return value;
    }
    
    public var textBaseline(get_textBaseline, set_textBaseline):String; 
    private function get_textBaseline() : String
    {
        return alignmentToString(_format.LineAlignment);
    }
    private function set_textBaseline(value:String) : String
    {
        _format.LineAlignment = stringToAlignment(value);
        return value;
    }
    
    private function stringToAlignment(s:String) : GdiLineAlignment
    {
        switch (s) 
        {
            case "top": return GdiLineAlignment.Near;
            case "middle": return GdiLineAlignment.Center;
            case "bottom": return GdiLineAlignment.Far;
            default: return GdiLineAlignment.Near;
        }
    }    
    private function alignmentToString(s:GdiLineAlignment) : String
    {
        switch (s) 
        {
            case Near: return "top";
            case Center: return "middle";
            case Far: return "bottom";
        }
    }

    public var textAlign(get_textAlign, set_textAlign):String; 
    private function get_textAlign() : String
    {
        return alignmentToString(_format.Alignment);
    }
    private function set_textAlign(value:String) : String
    {
        _format.Alignment = stringToAlignment(value);
        return value;
    }
    
    public function fillText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void
    {
        _graphics.DrawString(text, _font.gdiFont, _fillColor, x, y, _format);
    }
    public function strokeText(text:String, x:Float, y:Float, maxWidth:Float = 0):Void
    {
        // Unused
    }
    
    public function measureText(text:String):Float
    {
        return GdiTextRenderer.MeasureText(text, _font.gdiFont).Width;
    }
    
    private function ColorFromCss(s:String) : GdiColor
    {
        if (StringTools.startsWith(s, 'rgb(') && StringTools.endsWith(s, ')')) 
        {
            var parts = s.substr(4, s.length - 5).split(',');
            var r:Int;
            var g:Int;
            var b:Int;
            if (parts.length == 3)
            {
                r = Std.parseInt(parts[0]);
                g = Std.parseInt(parts[1]);
                b = Std.parseInt(parts[2]);
                
                return GdiColor.FromArgb(255, r, g, b);
            }
            return GdiColor.Empty;
        }
        else if (StringTools.startsWith(s, 'rgba(') && StringTools.endsWith(s, ')')) 
        {
            var parts = s.substr(5, s.length - 6).split(',');
            var r:Int;
            var g:Int;
            var b:Int;
            var a:Int;
            if (parts.length == 4)
            {
                r = Std.parseInt(parts[0]);
                g = Std.parseInt(parts[1]);
                b = Std.parseInt(parts[2]);
                a = Std.int(255 * Std.parseFloat(parts[2]));
                
                return GdiColor.FromArgb(a, r, g, b);
            }
            return GdiColor.Empty;
        }
        else if (StringTools.startsWith(s, '#'))
        {
            return GdiColorTranslator.FromHtml(s);
        }
        return GdiColor.Empty;
    }
}

// Some required native types of gdi
@:native('System.Windows.Forms.TextRenderer') extern class GdiTextRenderer 
{
    static function MeasureText(s:String, f:GdiFont) : GdiSize;
}

@:native('System.Drawing.Bitmap') extern class GdiBitmap 
{
    function new(width:Int, height:Int, pixelFormat:GdiPixelFormat): Void;
    function Dispose() : Void;
}

@:native('System.Drawing.Graphics') extern class GdiGraphics 
{
    function Dispose() : Void;
    
    function Clear(color:GdiColor) : Void;
    
    static function FromImage(image:GdiBitmap): GdiGraphics;
    
    var SmoothingMode:GdiSmoothingMode;
    var TextRenderingHint:GdiTextRenderingHint;
    
    function FillPath(color:GdiSolidBrush, p:GdiGraphicsPath) : Void;
    function DrawPath(color:GdiPen, p:GdiGraphicsPath) : Void;
    function FillRectangle(color:GdiSolidBrush, x:Single, y:Single, w:Single, h:Single) : Void;
    function DrawRectangle(color:GdiPen, x:Single, y:Single, w:Single, h:Single) : Void;
    function DrawString(t:String, f:GdiFont, c:GdiSolidBrush, x:Single, y:Single, f2:GdiStringFormat) : Void;
}

@:native('System.Drawing.StringFormat') extern class GdiStringFormat 
{
    var Alignment:GdiLineAlignment;
    var LineAlignment:GdiLineAlignment;
    function new() : Void;
}

@:native('System.Drawing.Pen') extern class GdiPen 
{
    var Color:GdiColor;
    function new(color:GdiColor) : Void;
}

@:native('System.Drawing.Size') extern class GdiSize 
{
    var Width:Int;
    var Height:Int;
    function new(w:Int, h:Int) : Void;
}

@:native('System.Drawing.Font') extern class GdiFont 
{
    function new(family:String, emSize:Single, style:GdiFontStyle, unit:GdiGraphicsUnit) : Void;
}


@:native('System.Drawing.Color') extern class GdiColor
{
    static var White:GdiColor;
    static var Empty:GdiColor;
    static var Transparent:GdiColor;
    static function FromArgb(a:Int, r:Int, g:Int, b:Int) :GdiColor; 
}

@:native('System.Drawing.PointF') extern class GdiPointF
{
    var X:Single;
    var Y:Single;
    
    function new(x:Single, y:Single) : Void;
}

@:native('System.Drawing.RectangleF') extern class GdiRectangleF
{
    var X:Single;
    var Y:Single;
    var Width:Single;
    var Height:Single;
    
    function new(x:Single, y:Single, w:Single, h:Single) : Void;
}

@:native('System.Drawing.GraphicsUnit') extern enum GdiGraphicsUnit
{
    Pixel;
}

@:native('System.Drawing.FontStyle') extern enum GdiFontStyle
{
    Regular;
    Bold;
    Italic;
}

@:native('System.Drawing.Drawing2D.FillMode') extern enum GdiFillMode
{
    Winding;
}

@:native('System.Drawing.Imaging.PixelFormat') extern enum GdiPixelFormat
{
    Format32bppArgb;
}

@:native('System.Drawing.StringAlignment') extern enum GdiLineAlignment
{
    Near;
    Center;
    Far;
}

@:native('System.Drawing.Drawing2D.SmoothingMode') extern enum GdiSmoothingMode
{
    AntiAlias;
}

@:native('System.Drawing.Text.TextRenderingHint') extern enum GdiTextRenderingHint
{
    AntiAliasGridFit;
}

@:native('System.Drawing.Drawing2D.GraphicsPath') extern class GdiGraphicsPath
{
    function new(mode:GdiFillMode): Void;
    function Dispose() : Void;
    
    function StartFigure():Void;
    function CloseFigure():Void;
    function AddLine(from:GdiPointF, to:GdiPointF):Void;
    function AddBezier(from:GdiPointF, cp1:GdiPointF, cp2:GdiPointF, to:GdiPointF):Void;
    function AddRectangle(r:GdiRectangleF):Void;
    function AddEllipse(x:Single, y:Single, w:Single, h:Single):Void;
}

@:native('System.Drawing.Brush') extern class GdiBrush
{
}

@:native('System.Drawing.SolidBrush') extern class GdiSolidBrush extends GdiBrush
{
    var Color:GdiColor;
    function new(color:GdiColor) : Void;
}

@:native('System.Drawing.ColorTranslator') extern class GdiColorTranslator
{
    static function FromHtml(html:String) : GdiColor;
    static function ToHtml(color:GdiColor) : String;
}
#end
