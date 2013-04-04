package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.layout.ScoreLayout;

class BeatContainerGlyph extends Glyph implements ISupportsFinalize
{
    public var beat:Beat;
    public var preNotes:BeatGlyphBase;
    public var onNotes:BeatGlyphBase;
    public var postNotes:BeatGlyphBase;
    
    public function new(beat:Beat) 
    {
        super(0, 0);
        this.beat = beat;
    }
    
    public function finalizeGlyph(layout:ScoreLayout) : Void
    {
        if (Std.is(preNotes, ISupportsFinalize)) 
        {
            cast(preNotes, ISupportsFinalize).finalizeGlyph(layout);
        }
        if (Std.is(onNotes, ISupportsFinalize)) 
        {
            cast(onNotes, ISupportsFinalize).finalizeGlyph(layout);
        }
        if (Std.is(postNotes, ISupportsFinalize)) 
        {
            cast(postNotes, ISupportsFinalize).finalizeGlyph(layout);
        }
    }
    
    public override function doLayout():Void 
    {
        preNotes.x = 0;
        preNotes.index = 0;
        preNotes.renderer = renderer;
        preNotes.container = this;
        preNotes.doLayout();
        
        onNotes.x = preNotes.x + preNotes.width;
        onNotes.index = 1;
        onNotes.renderer = renderer;
        onNotes.container = this;
        onNotes.doLayout();
        
        postNotes.x = onNotes.x + onNotes.width;
        postNotes.index = 2;
        postNotes.renderer = renderer;
        postNotes.container = this;
        postNotes.doLayout();
        
        width = postNotes.x + postNotes.width;
    }
    
    public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
    {
        preNotes.paint(cx + x, cy + y, canvas);
        onNotes.paint(cx + x, cy + y, canvas);
        postNotes.paint(cx + x, cy + y, canvas);
    }
}