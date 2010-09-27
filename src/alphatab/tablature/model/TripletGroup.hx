/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab.tablature.model;
import alphatab.model.Note;
import alphatab.tablature.drawing.DrawingContext;
import alphatab.tablature.drawing.DrawingLayer;
import alphatab.tablature.drawing.DrawingLayers;
import alphatab.tablature.drawing.DrawingResources;
import alphatab.tablature.ViewLayout;

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
		var offset = DrawingResources.getScoreNoteSize(layout, false).x / 2;
		var startX = _voices[0].beatImpl().getRealPosX(layout) + offset;
		var endX = _voices[_voices.length - 1].beatImpl().getRealPosX(layout) + offset;
		var key:Int = _voices[0].beat.measure.keySignature(); 
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