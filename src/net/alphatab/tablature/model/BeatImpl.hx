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
package net.alphatab.tablature.model;
import net.alphatab.model.effects.BendPoint;
import net.alphatab.model.effects.TremoloBarEffect;
import net.alphatab.model.Beat;
import net.alphatab.model.BeatStrokeDirection;
import net.alphatab.model.SongFactory;
import net.alphatab.model.Point;
import net.alphatab.model.SongManager;
import net.alphatab.tablature.drawing.DrawingContext;
import net.alphatab.tablature.drawing.DrawingLayer;
import net.alphatab.tablature.drawing.DrawingLayers;
import net.alphatab.tablature.drawing.DrawingResources;
import net.alphatab.tablature.drawing.MusicFont;
import net.alphatab.tablature.TrackSpacingPositions;
import net.alphatab.tablature.ViewLayout;

/**
 * This Beat implementation extends the default beat with drawing and layouting features. 
 */
class BeatImpl extends Beat
{
	public var posX:Int;
	public var lastPaintX:Int;
	public var minimumWidth:Int; 
	public var maxNote:NoteImpl;
	public var minNote:NoteImpl; 
	
	public var joinedType:JoinedType; 
	public var joinedGreaterThanQuarter:Bool;
	public var join1:BeatImpl;
	public var join2:BeatImpl;
	public var previousBeat:BeatImpl;
	public var nextBeat:BeatImpl;
	public var beatGroup:BeatGroup;

	public function caretPosition(layout:ViewLayout) : Int
	{
		return Math.floor(this.getRealPosX(layout) + 8 * layout.scale);
	}
	
	public function width() : Int
	{
		var w:Int = 0;
		for (i in 0 ... voices.length)
		{
			var cw:Int = getVoiceImpl(i).width;
			if (cw > w)
				w = cw;
		}
		return w;
	}
	
	public function height() : Int
	{
		return measureImpl().ts.getSize();
	}
	
	public function measureImpl() : MeasureImpl
	{
		return cast this.measure;
	}
	
	public function spacing() : Int
	{
		return measureImpl().getBeatSpacing(this);
	}

	public function new(factory:SongFactory) 
	{
		super(factory);
	}
	
	public function getVoiceImpl(index:Int) : VoiceImpl
	{
		return cast voices[index];
	}
	
	public function reset() : Void
	{
		maxNote = null;
		minNote = null;
	}
	
	public function check(note:NoteImpl): Void
	{
		var value = note.realValue();
		if (maxNote == null || value > maxNote.realValue()) maxNote = note;
		if (minNote == null || value < minNote.realValue()) minNote = note;
	}
	
	public function getRealPosX(layout:ViewLayout) : Float
	{
		return measureImpl().posX + measureImpl().headerImpl().getLeftSpacing(layout)
		+ posX + spacing() + (4 * layout.scale);
	}
	
	public function paint(layout:ViewLayout, context:DrawingContext, x:Int, y:Int):Void
	{
		x += posX + spacing();
		lastPaintX = x;

		paintExtraLines(context, layout, x, y);
		paintBeatEffects(context, layout, x, y);
		
		for (v in 0 ... Beat.MAX_VOICES)
		{
			getVoiceImpl(v).paint(layout, context, x, y);
		}
	}
	
	public function paintExtraLines(context:DrawingContext, layout:ViewLayout, x:Int, y:Int) : Void
	{
		if (!isRestBeat())
		{
			var scoreY:Int = y + measureImpl().ts.get(TrackSpacingPositions.ScoreMiddleLines);
			paintExtraLines2(context, layout, minNote, x, scoreY);
			paintExtraLines2(context, layout, maxNote, x, scoreY);
		}
	}

	private function paintExtraLines2(context:DrawingContext, layout:ViewLayout, note:NoteImpl, x:Int, y:Int) : Void
	{
		var realY:Int = y + note.scorePosY;
		var x1:Float = x + 3 * layout.scale;
		var x2:Float = x + 15 * layout.scale;

		var scorelineSpacing:Float = layout.scoreLineSpacing;

		if (realY < y)
		{
			var i = y;
			while (i > realY)
			{ 
				context.get(DrawingLayers.Lines).startFigure();
				context.get(DrawingLayers.Lines).addLine(cast x1, i, cast x2, i);
				i -= Math.floor(scorelineSpacing);
			}
		}
		else if (realY > (y + (scorelineSpacing * 4)))
		{
			var i = (y + (scorelineSpacing * 5));
			while (i < (realY + scorelineSpacing))
			{
				context.get(DrawingLayers.Lines).startFigure();
				context.get(DrawingLayers.Lines).addLine(cast x1, cast i, cast x2, cast i);
				i += scorelineSpacing;
			}
		}
	}
	
	private function paintBeatEffects(context:DrawingContext, layout:ViewLayout, x:Int, y:Int) : Void 
	{		
		var realX:Int = cast (x + 3 * layout.scale);
		var fill:DrawingLayer = context.get(DrawingLayers.VoiceEffects1);

		if (this.effect.stroke.direction != BeatStrokeDirection.None)
		{
			paintStroke(layout, context, x, y);
		}

		if (effect.chord != null)
		{
			var chordImpl:ChordImpl = cast effect.chord;
			chordImpl.paint(layout, context, x, y);
		}
		
		if (effect.fadeIn)
		{
			var realY:Int = y + getPaintPosition(TrackSpacingPositions.FadeIn);
			paintFadeIn(layout, context, realX, realY);
		}
		
		if (effect.tapping)
		{
			var realY:Int = y + getPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.addString("T", DrawingResources.defaultFont, realX, realY);
		}
		else if (effect.slapping)
		{
			var realY:Int = y + getPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.addString("S", DrawingResources.defaultFont, realX, realY);
		}
		else if (effect.popping)
		{
			var realY:Int = y + getPaintPosition(TrackSpacingPositions.TapingEffect);
			fill.addString("P", DrawingResources.defaultFont, realX, realY);
		}
		
		if (effect.vibrato)
		{
			var realY:Int = y + getPaintPosition(TrackSpacingPositions.BeatVibratoEffect);
			paintVibrato(layout, context, realX, realY, 1);
		}
		
		if (effect.isTremoloBar())
		{
			var string = minNote == null ? 6 : minNote.string;
			var realY:Int = y + getPaintPosition(TrackSpacingPositions.Tablature) 
							+ Math.round((string-1) * layout.stringSpacing);
			var nextBeat:BeatImpl = cast layout.songManager().getNextBeat(this);
			// only use beat for bend if it's in the same line
			if (nextBeat != null && nextBeat.measureImpl().ts != measureImpl().ts)
				nextBeat = null;
			paintTremoloBar(layout, context, nextBeat, realX, realY);
		}
	}
	
	private function paintTremoloBar(layout:ViewLayout, context:DrawingContext, nextBeat:BeatImpl,x:Int, y:Int)
	{
		var scale:Float = layout.scale;
		var realX:Float = x + (5 * scale);
		var realY:Float = y + ((DrawingResources.noteFontHeight/2) * scale);

		var xTo:Float;
		var minY:Float = realY - 60 * scale;
		if (nextBeat == null)
		{// No Next beat -> Till End of Own beat
			xTo = measureImpl().posX + measureImpl().width + measureImpl().spacing;
		}
		else
		{
			xTo = nextBeat.measureImpl().posX + nextBeat.measureImpl().headerImpl().getLeftSpacing(layout)
				  + nextBeat.posX + (nextBeat.spacing() * scale) + 5 * scale;
		}

		var fill:DrawingLayer = context.get(DrawingLayers.VoiceEffects1);
		var draw:DrawingLayer = context.get(DrawingLayers.VoiceEffectsDraw1);


		var tremolo:TremoloBarEffect = effect.tremoloBar;
		if (tremolo.points.length >= 2)
		{
			var dX:Float = (xTo - realX) / TremoloBarEffect.MAX_POSITION;
			var dY:Float = (realY - minY) / TremoloBarEffect.MAX_VALUE;

			draw.startFigure();
			for (i in 0 ... tremolo.points.length - 1)
			{
				var firstPt:BendPoint = tremolo.points[i];
				var secondPt:BendPoint = tremolo.points[i + 1];

				if (firstPt.value == secondPt.value && i == tremolo.points.length - 2) continue;


				//pen.DashStyle = firstPt.value != secondPt.value ? DashStyle.Solid : DashStyle.Dash;
				var firstLoc:Point = new Point(Math.floor(realX + (dX * firstPt.position)), Math.floor(realY - dY * firstPt.value));
				var secondLoc:Point = new Point(Math.floor(realX + (dX * secondPt.position)), Math.floor(realY - dY * secondPt.value));
				draw.addLine(firstLoc.x, firstLoc.y, secondLoc.x, secondLoc.y);


				if (secondPt.value != 0)
				{
					var dV:Float = (secondPt.value) * 0.5;
					var up:Bool = (secondPt.value - firstPt.value) >= 0;
					var s:String = "";
					if(dV >= 1 || dV <= -1)
						s += "-" + Std.string(Math.floor(Math.abs(dV))) + " ";
					else if (dV < 0)
						s += "-";
					// Quaters
					dV -= Math.floor(dV);

					if (dV == 0.25)
						s += "1/4";
					else if (dV == 0.5)
						s += "1/2";
					else if (dV == 0.75)
						s += "3/4";


					context.graphics.font = DrawingResources.defaultFont;
					var size:Float = context.graphics.measureText(s);
					var sY:Float = up ? secondLoc.y - DrawingResources.defaultFontHeight - (3 * scale) : secondLoc.y + (3 * scale);
					var sX:Float = secondLoc.x - size / 2;

					fill.addString(s, DrawingResources.defaultFont, cast sX, cast sY);
				}
			}
		}
	}
	
	private function paintVibrato(layout:ViewLayout, context:DrawingContext, x:Int, y:Int, symbolScale:Float)
	{
		var scale:Float = layout.scale;
		var realX:Float = x - 2 * scale;
		var realY:Float = y + (2.0 * scale);
		var width:Float = width();

		var fill:DrawingLayer = context.get(DrawingLayers.VoiceEffects1);
		
		var step:Float = 18 * scale * symbolScale;
		var loops:Int = Math.floor(Math.max(1, (width / step)));
		var s:String = "";
		for (i in 0 ... loops)
		{
			fill.addMusicSymbol(MusicFont.VibratoLeftRight, realX, realY, layout.scale * symbolScale);
			realX += step;
		}
	}
	
	private function paintFadeIn(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		var scale:Float = layout.scale;
		var realX:Int = x;
		var realY:Int = Math.round(y + (4.0 * scale));
		
		var fWidth:Int = Math.round(width());
		var layer:DrawingLayer = context.get(DrawingLayers.VoiceDraw1);

		layer.startFigure();
		layer.addBezier(realX, realY, realX, realY, realX + fWidth, realY, realX + fWidth, Math.round(realY - (4 * scale)));
		layer.startFigure();
		layer.addBezier(realX, realY, realX, realY, realX + fWidth, realY, realX + fWidth, Math.round(realY + (4 * scale)));
	}

	public function paintStroke(layout:ViewLayout, context:DrawingContext, x:Int, y:Int) : Void
	{
		if (effect.stroke.direction == BeatStrokeDirection.None) return;
		var scale:Float = layout.scale;
		var realX:Float = x;
		var realY:Float = y + getPaintPosition(TrackSpacingPositions.Tablature);

		var y1:Float = realY;
		var y2:Float = realY + measureImpl().trackImpl().tabHeight;

		var layer:DrawingLayer = context.get(DrawingLayers.MainComponentsDraw);
		layer.startFigure();
		if (effect.stroke.direction == BeatStrokeDirection.Up)
		{
			layer.moveTo(cast realX, cast y1);
			layer.lineTo(cast realX, cast y2);
			layer.lineTo(cast (realX - (2.0 * scale)), cast (y2 - (5.0 * scale)));

			layer.moveTo(cast realX, cast y2);
			layer.lineTo(cast (realX + (2.0 * scale)), cast  (y2 - (5.0 * scale)));
		}
		else
		{
			layer.moveTo(cast realX, cast y2);
			layer.lineTo(cast realX, cast y1);
			layer.lineTo(cast (realX - (2.0 * scale)), cast (y1 + (3.0 * scale)));
			layer.moveTo(cast realX, cast y1);
			layer.lineTo(cast (realX + (2.0 * scale)), cast (y1 + (3.0 * scale)));
		}
	}

	public function getPaintPosition(position:TrackSpacingPositions) : Int
	{
		return measureImpl().ts.get(position);
	}
	
	public function calculateTremoloBarOverflow(layout:ViewLayout) : Int
	{
		// Find lowest point
		var point:BendPoint = null;
		for (curr in effect.tremoloBar.points)
		{
			if (point == null || curr.value < point.value)
				point = curr;
		}

		if (point == null) return 0;

		// 5px*scale movement per value 
		
		var fullHeight:Float = point.value * (6 * layout.scale);
		var string:Int = minNote == null ? 6 : minNote.string;
		//var heightToTabNote:Float = (string - 1) * layout.stringSpacing;
		var spaceToBottom:Float = (6 - string) * layout.stringSpacing;
		
		if (fullHeight < 0) // negative offset
		{
			var overflow = Math.round( -((Math.abs(fullHeight) + (layout.stringSpacing / 2)) - spaceToBottom) );
			return overflow;
		}
		else
		{
			return 0;
		}
	}

}