package alphatab.rendering.glyphs;
import alphatab.model.Note;
import alphatab.platform.ICanvas;
import alphatab.rendering.TabBarRenderer;

class TabTieGlyph extends TieGlyph
{
	public function new(startNote:Note, endNote:Note)
	{
		super(startNote, endNote);
	}

	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var r:TabBarRenderer = cast renderer;
		var res = r.getResources();
		var startX = cx + r.getNoteX(_startNote);
		var endX = cx + r.getNoteX(_endNote, false);
		
		var down = _startNote.string > 3;
		var offset = (res.tablatureFont.getSize() / 2);
		if (down) {
			offset *= -1;
		}
		
		var startY = cy + r.getNoteY(_startNote) + offset;
		var endY = cy + r.getNoteY(_endNote) + offset;
		
		TieGlyph.paintTie(canvas, getScale(), startX, startY, endX, endY, _startNote.string > 3);
		
		canvas.setColor(renderer.getLayout().renderer.renderingResources.mainGlyphColor);
		canvas.fill();
	}
}