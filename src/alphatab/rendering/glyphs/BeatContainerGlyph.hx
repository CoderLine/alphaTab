package alphatab.rendering.glyphs;
import alphatab.model.Beat;
import alphatab.platform.ICanvas;
import alphatab.platform.model.Color;
import alphatab.rendering.Glyph;
import alphatab.rendering.layout.ScoreLayout;
import alphatab.rendering.staves.BarSizeInfo;

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
    
    public function registerMaxSizes(sizes:BarSizeInfo)
    {
        if (sizes.getIndexedSize("PRE_NOTES", beat.index) < preNotes.width)
        {
            sizes.setIndexedSize("PRE_NOTES", beat.index, preNotes.width);
        }      
        if (sizes.getIndexedSize("ON_NOTES", beat.index) < onNotes.width)
        {
            sizes.setIndexedSize("ON_NOTES", beat.index, onNotes.width);
        }
        if (sizes.getIndexedSize("POST_NOTES", beat.index) < postNotes.width)
        {
            sizes.setIndexedSize("POST_NOTES", beat.index, postNotes.width);
        }
    }
    
    public function applySizes(sizes:BarSizeInfo)
    {
        var size:Int;
        var diff:Int;
        
        size = sizes.getIndexedSize("PRE_NOTES", beat.index);
        diff = size - preNotes.width;
        preNotes.x = 0;
        if (diff > 0) preNotes.applyGlyphSpacing(diff);
        
        size = sizes.getIndexedSize("ON_NOTES", beat.index);
        diff = size - onNotes.width;
        onNotes.x = preNotes.x + preNotes.width;
        if (diff > 0) onNotes.applyGlyphSpacing(diff);
        
        size = sizes.getIndexedSize("POST_NOTES", beat.index);
        diff = size - postNotes.width;
        postNotes.x = onNotes.x + onNotes.width;
        if (diff > 0) postNotes.applyGlyphSpacing(diff);
        
        width = postNotes.x + postNotes.width;
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
        //canvas.setColor(new Color(200, 0, 0, 100));
        //canvas.fillRect(cx + x + preNotes.x, cy + y + preNotes.y, preNotes.width, 10);

        onNotes.paint(cx + x, cy + y, canvas);
        //canvas.setColor(new Color(0, 200, 0, 100));
        //canvas.fillRect(cx + x + onNotes.x, cy + y + onNotes.y + 10, onNotes.width, 10);

        postNotes.paint(cx + x, cy + y, canvas);
        //canvas.setColor(new Color(0, 0, 200, 100));
        //canvas.fillRect(cx + x + postNotes.x, cy + y + postNotes.y + 20, postNotes.width, 10);

    }
}