package alphatab.platform.cs;

#if cs

class FontInfo 
{
    public var family:String;
    public var size:Float;
    public var bold:Bool;
    public var italic:Bool;
    public var gdiFont: alphatab.platform.cs.GdiCanvas.GdiFont;
    
    public function new(s:String) 
    {
        var p:EReg = ~/(italic )?(bold )?([0-9.]+)px '([^']+)'/i;
        p.match(s);
        var style:alphatab.platform.cs.GdiCanvas.GdiFontStyle = alphatab.platform.cs.GdiCanvas.GdiFontStyle.Regular;
        if (p.matched(1) == "italic ")
        {
            italic = true;
            style = alphatab.platform.cs.GdiCanvas.GdiFontStyle.Italic;
        }
        if (p.matched(2) == "bold ") 
        {
            bold = true;
            style = alphatab.platform.cs.GdiCanvas.GdiFontStyle.Bold;
        }
        size = Std.parseFloat(p.matched(3));
        family = p.matched(4);
        gdiFont = new alphatab.platform.cs.GdiCanvas.GdiFont(family, size, style, alphatab.platform.cs.GdiCanvas.GdiGraphicsUnit.Pixel);
    }
    
    public function toString() : String
    {
        var b:StringBuf = new StringBuf();
        if (bold) 
        {
            b.add("bold ");
        }
        if (italic) 
        {
            b.add("italic ");
        }
        b.add(size);
        b.add("px");
        b.add("'");
        b.add(family);
        b.add("'");
        return b.toString();
    }
}

#end