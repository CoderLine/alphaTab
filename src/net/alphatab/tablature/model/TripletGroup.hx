/**
 * ...
 * @author Daniel Kuschny
 */

package net.alphatab.tablature.model;
import net.alphatab.model.GsMeasureClefConverter;
import net.alphatab.model.GsNote;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayer;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.ViewLayout;
import net.alphatab.Utils;

class TripletGroup 
{
	private var _voices:Array<GsVoiceImpl>;
	private var _voiceIndex:Int;
	private var _triplet : Int;
	
	public function isFull()
	{
		return _voices.length == _triplet;
	}
	
	public function new(voice:Int) 
	{
		_voiceIndex = voice;
		_voices = new Array<GsVoiceImpl>();
	}
	
	public function check(voice:GsVoiceImpl) : Bool
	{
		if (_voices.length == 0)
		{ // first is everytime ok
			_triplet = voice.Duration.Triplet.Enters;
		}
		else
		{
			// can tripletnote be fit into this group
			if (voice.Index != _voiceIndex || voice.Duration.Triplet.Enters != _triplet || isFull()) return false;
		}
		_voices.push(voice);
		
		return true;
	}
	
	public function paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int)
	{ 
		var scale = layout.Scale;
		var offset = DrawingResources.GetScoreNoteSize(layout, false).Width / 2;
		var startX = _voices[0].BeatImpl().GetRealPosX(layout) + offset;
		var endX = _voices[_voices.length - 1].BeatImpl().GetRealPosX(layout) + offset;
		var key:Int = _voices[0].Beat.Measure.GetKeySignature(); 
		var clef:Int  = GsMeasureClefConverter.ToInt(_voices[0].Beat.Measure.Clef);
		var realY:Int = y;
				
		var draw:DrawingLayer = _voiceIndex == 0 ? context.Get(DrawingLayers.VoiceDraw1) : context.Get(DrawingLayers.VoiceDraw2);
		var fill:DrawingLayer = _voiceIndex == 0 ? context.Get(DrawingLayers.Voice1) : context.Get(DrawingLayers.Voice2);

		var s:String = Utils.string(_triplet);
		context.Graphics.font = DrawingResources.EffectFont;
		var w:Float = context.Graphics.measureText(s).width;
		var lineW = endX - startX;
		
		draw.AddLine(startX, realY + 5 * scale, startX, realY);
		draw.AddLine(startX, realY, startX + (lineW / 2) - w , realY);
		draw.AddString(s, DrawingResources.EffectFont,  startX + ((lineW - w)/ 2), realY);
		draw.AddLine(startX + (lineW/2) + w , realY, endX, realY);
		draw.AddLine(endX, realY + 5 * scale, endX, realY);
		
	}
	
}