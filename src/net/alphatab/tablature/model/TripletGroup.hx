package net.alphatab.tablature.model;
import net.alphatab.model.MeasureClefConverter;
import net.alphatab.model.Note;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayer;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.ViewLayout;

/**
 * This class is used to group voices for tuplets.
 */
class TripletGroup 
{
	private var _voices:Array<VoiceImpl>;
	private var _voiceIndex:Int;
	private var _triplet : Int;
	
	public function isFull()
	{
		return _voices.length == _triplet;
	}
	
	public function new(voice:Int) 
	{
		_voiceIndex = voice;
		_voices = new Array<VoiceImpl>();
	}
	
	public function check(voice:VoiceImpl) : Bool
	{
		if (_voices.length == 0)
		{ // first is everytime ok
			_triplet = voice.duration.tuplet.enters;
		}
		else
		{
			// can tripletnote be fit into this group
			if (voice.index != _voiceIndex || voice.duration.tuplet.enters != _triplet || isFull()) return false;
		}
		_voices.push(voice);
		
		return true;
	}
	
	public function paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{ 
		var scale = layout.scale;
		var offset = DrawingResources.getScoreNoteSize(layout, false).width / 2;
		var startX = _voices[0].beatImpl().getRealPosX(layout) + offset;
		var endX = _voices[_voices.length - 1].beatImpl().getRealPosX(layout) + offset;
		var key:Int = _voices[0].beat.measure.keySignature(); 
		var clef:Int  = MeasureClefConverter.toInt(_voices[0].beat.measure.clef);
		var realY:Int = y;
				
		var draw:DrawingLayer = _voiceIndex == 0 ? context.get(DrawingLayers.VoiceDraw1) : context.get(DrawingLayers.VoiceDraw2);
		var fill:DrawingLayer = _voiceIndex == 0 ? context.get(DrawingLayers.Voice1) : context.get(DrawingLayers.Voice2);

		var s:String = Std.string(_triplet);
		context.graphics.font = DrawingResources.effectFont;
		var w:Float = context.graphics.measureText(s);
		var lineW = endX - startX;
		
		draw.addLine(startX, realY + 5 * scale, startX, realY);
		draw.addLine(startX, realY, startX + (lineW / 2) - w , realY);
		draw.addString(s, DrawingResources.effectFont,  startX + ((lineW - w)/ 2), realY);
		draw.addLine(startX + (lineW/2) + w , realY, endX, realY);
		draw.addLine(endX, realY + 5 * scale, endX, realY);
		
	}
	
}