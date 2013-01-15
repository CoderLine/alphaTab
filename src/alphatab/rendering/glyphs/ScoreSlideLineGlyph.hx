package alphatab.rendering.glyphs;
import alphatab.model.Note;
import alphatab.model.SlideType;
import alphatab.platform.ICanvas;
import alphatab.rendering.Glyph;
import alphatab.rendering.ScoreBarRenderer;

class ScoreSlideLineGlyph extends Glyph
{
	private var _startNote:Note;
	private var _type:SlideType;

	public function new(type:SlideType,startNote:Note) 
	{
		super(0,0);
		_type = type;
		_startNote = startNote;
	}
	
	public override function doLayout():Void 
	{
		width = 0;
	}
	
	public override function canScale():Bool 
	{
		return false;
	}	
	
	public override function paint(cx:Int, cy:Int, canvas:ICanvas):Void 
	{
		var r:ScoreBarRenderer = cast renderer;
		
		var sizeX = Std.int(12 * getScale());
		var offsetX = Std.int(1 * getScale());
		var startX:Int;
		var startY:Int;
		var endX:Int;
		var endY:Int;
		switch(_type)
		{
			case Shift, Legato:
				startX = cx + r.getNoteX(_startNote, true) + offsetX;
				startY = cy + r.getNoteY(_startNote) + Std.int(NoteHeadGlyph.noteHeadHeight / 2);
				
				if (_startNote.slideTarget != null) 
				{				
					endX = cx + r.getNoteX(_startNote.slideTarget, false) - offsetX;
					endY = cy + r.getNoteY(_startNote.slideTarget) + Std.int(NoteHeadGlyph.noteHeadHeight / 2);					
				}
				else
				{
					endX = startX + sizeX;
					endY = startY;
				}
			case IntoFromBelow:
				endX = cx + r.getNoteX(_startNote, false) - offsetX;
				endY = cy + r.getNoteY(_startNote) + Std.int(NoteHeadGlyph.noteHeadHeight / 2);

				startX = endX - sizeX;
				startY = cy + r.getNoteY(_startNote) + NoteHeadGlyph.noteHeadHeight;
			case IntoFromAbove:
				endX = cx + r.getNoteX(_startNote, false) - offsetX;
				endY = cy + r.getNoteY(_startNote) + Std.int(NoteHeadGlyph.noteHeadHeight / 2);
				
				startX = endX - sizeX;
				startY = cy + r.getNoteY(_startNote);
			case OutUp:
				startX = cx + r.getNoteX(_startNote, true) + offsetX;
				startY = cy + r.getNoteY(_startNote) + Std.int(NoteHeadGlyph.noteHeadHeight / 2);
				endX = startX + sizeX;
				endY = cy + r.getNoteY(_startNote);
			case OutDown:
				startX = cx + r.getNoteX(_startNote, true) + offsetX;
				startY = cy + r.getNoteY(_startNote) + Std.int(NoteHeadGlyph.noteHeadHeight / 2);
				endX = startX + sizeX;
				endY = cy + r.getNoteY(_startNote) + NoteHeadGlyph.noteHeadHeight;
			default:
				return;
		}

		canvas.setColor(renderer.getLayout().renderer.renderingResources.mainGlyphColor);
		canvas.beginPath();
		canvas.moveTo(startX, startY);
		canvas.lineTo(endX, endY);
		canvas.stroke();
	}
	
}