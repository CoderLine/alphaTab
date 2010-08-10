$estr = function() { return js.Boot.__string_rec(this,''); }
if(typeof net=='undefined') net = {}
if(!net.alphatab) net.alphatab = {}
if(!net.alphatab.tablature) net.alphatab.tablature = {}
if(!net.alphatab.tablature.drawing) net.alphatab.tablature.drawing = {}
net.alphatab.tablature.drawing.TripletFeelPainter = function() { }
net.alphatab.tablature.drawing.TripletFeelPainter.__name__ = ["net","alphatab","tablature","drawing","TripletFeelPainter"];
net.alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel16 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TripletFeel16,x,y,scale);
}
net.alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel8 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TripletFeel8,x,y,scale);
}
net.alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone16 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TripletFeelNone16,x,y,scale);
}
net.alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone8 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TripletFeelNone8,x,y,scale);
}
net.alphatab.tablature.drawing.TripletFeelPainter.prototype.__class__ = net.alphatab.tablature.drawing.TripletFeelPainter;
if(!net.alphatab.model) net.alphatab.model = {}
net.alphatab.model.SongFactory = function(p) { if( p === $_ ) return; {
	null;
}}
net.alphatab.model.SongFactory.__name__ = ["net","alphatab","model","SongFactory"];
net.alphatab.model.SongFactory.prototype.newBeat = function() {
	return new net.alphatab.model.Beat(this);
}
net.alphatab.model.SongFactory.prototype.newBeatEffect = function() {
	return new net.alphatab.model.BeatEffect(this);
}
net.alphatab.model.SongFactory.prototype.newBendEffect = function() {
	return new net.alphatab.model.effects.BendEffect();
}
net.alphatab.model.SongFactory.prototype.newChord = function(stringCount) {
	return new net.alphatab.model.Chord(stringCount);
}
net.alphatab.model.SongFactory.prototype.newDuration = function() {
	return new net.alphatab.model.Duration(this);
}
net.alphatab.model.SongFactory.prototype.newGraceEffect = function() {
	return new net.alphatab.model.effects.GraceEffect();
}
net.alphatab.model.SongFactory.prototype.newHarmonicEffect = function() {
	return new net.alphatab.model.effects.HarmonicEffect();
}
net.alphatab.model.SongFactory.prototype.newLyricLine = function() {
	return new net.alphatab.model.LyricLine();
}
net.alphatab.model.SongFactory.prototype.newLyrics = function() {
	return new net.alphatab.model.Lyrics();
}
net.alphatab.model.SongFactory.prototype.newMarker = function() {
	return new net.alphatab.model.Marker();
}
net.alphatab.model.SongFactory.prototype.newMeasure = function(header) {
	return new net.alphatab.model.Measure(header);
}
net.alphatab.model.SongFactory.prototype.newMeasureHeader = function() {
	return new net.alphatab.model.MeasureHeader(this);
}
net.alphatab.model.SongFactory.prototype.newMidiChannel = function() {
	return new net.alphatab.model.MidiChannel();
}
net.alphatab.model.SongFactory.prototype.newMixTableChange = function() {
	return new net.alphatab.model.MixTableChange();
}
net.alphatab.model.SongFactory.prototype.newNote = function() {
	return new net.alphatab.model.Note(this);
}
net.alphatab.model.SongFactory.prototype.newNoteEffect = function() {
	return new net.alphatab.model.NoteEffect();
}
net.alphatab.model.SongFactory.prototype.newPageSetup = function() {
	return new net.alphatab.model.PageSetup();
}
net.alphatab.model.SongFactory.prototype.newSong = function() {
	return new net.alphatab.model.Song();
}
net.alphatab.model.SongFactory.prototype.newString = function() {
	return new net.alphatab.model.GuitarString();
}
net.alphatab.model.SongFactory.prototype.newStroke = function() {
	return new net.alphatab.model.BeatStroke();
}
net.alphatab.model.SongFactory.prototype.newTempo = function() {
	return new net.alphatab.model.Tempo();
}
net.alphatab.model.SongFactory.prototype.newText = function() {
	return new net.alphatab.model.BeatText();
}
net.alphatab.model.SongFactory.prototype.newTimeSignature = function() {
	return new net.alphatab.model.TimeSignature(this);
}
net.alphatab.model.SongFactory.prototype.newTrack = function() {
	return new net.alphatab.model.Track(this);
}
net.alphatab.model.SongFactory.prototype.newTremoloBarEffect = function() {
	return new net.alphatab.model.effects.TremoloBarEffect();
}
net.alphatab.model.SongFactory.prototype.newTremoloPickingEffect = function() {
	return new net.alphatab.model.effects.TremoloPickingEffect(this);
}
net.alphatab.model.SongFactory.prototype.newTrillEffect = function() {
	return new net.alphatab.model.effects.TrillEffect(this);
}
net.alphatab.model.SongFactory.prototype.newTuplet = function() {
	return new net.alphatab.model.Tuplet();
}
net.alphatab.model.SongFactory.prototype.newVoice = function(index) {
	return new net.alphatab.model.Voice(this,index);
}
net.alphatab.model.SongFactory.prototype.__class__ = net.alphatab.model.SongFactory;
if(!net.alphatab.tablature.model) net.alphatab.tablature.model = {}
net.alphatab.tablature.model.SongFactoryImpl = function(p) { if( p === $_ ) return; {
	net.alphatab.model.SongFactory.apply(this,[]);
}}
net.alphatab.tablature.model.SongFactoryImpl.__name__ = ["net","alphatab","tablature","model","SongFactoryImpl"];
net.alphatab.tablature.model.SongFactoryImpl.__super__ = net.alphatab.model.SongFactory;
for(var k in net.alphatab.model.SongFactory.prototype ) net.alphatab.tablature.model.SongFactoryImpl.prototype[k] = net.alphatab.model.SongFactory.prototype[k];
net.alphatab.tablature.model.SongFactoryImpl.prototype.newBeat = function() {
	return new net.alphatab.tablature.model.BeatImpl(this);
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.newChord = function(length) {
	return new net.alphatab.tablature.model.ChordImpl(length);
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.newLyrics = function() {
	return new net.alphatab.tablature.model.LyricsImpl();
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.newMeasure = function(header) {
	return new net.alphatab.tablature.model.MeasureImpl(header);
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.newMeasureHeader = function() {
	return new net.alphatab.tablature.model.MeasureHeaderImpl(this);
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.newNote = function() {
	return new net.alphatab.tablature.model.NoteImpl(this);
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.newText = function() {
	return new net.alphatab.tablature.model.BeatTextImpl();
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.newTrack = function() {
	return new net.alphatab.tablature.model.TrackImpl(this);
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.newVoice = function(index) {
	return new net.alphatab.tablature.model.VoiceImpl(this,index);
}
net.alphatab.tablature.model.SongFactoryImpl.prototype.__class__ = net.alphatab.tablature.model.SongFactoryImpl;
net.alphatab.model.Chord = function(length) { if( length === $_ ) return; {
	this.strings = new Array();
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			this.strings.push(-1);
		}
	}
}}
net.alphatab.model.Chord.__name__ = ["net","alphatab","model","Chord"];
net.alphatab.model.Chord.prototype.beat = null;
net.alphatab.model.Chord.prototype.firstFret = null;
net.alphatab.model.Chord.prototype.name = null;
net.alphatab.model.Chord.prototype.noteCount = function() {
	var count = 0;
	{
		var _g1 = 0, _g = this.strings.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.strings[i] >= 0) count++;
		}
	}
	return count;
}
net.alphatab.model.Chord.prototype.stringCount = function() {
	return this.strings.length;
}
net.alphatab.model.Chord.prototype.strings = null;
net.alphatab.model.Chord.prototype.__class__ = net.alphatab.model.Chord;
net.alphatab.tablature.model.ChordImpl = function(length) { if( length === $_ ) return; {
	net.alphatab.model.Chord.apply(this,[length]);
}}
net.alphatab.tablature.model.ChordImpl.__name__ = ["net","alphatab","tablature","model","ChordImpl"];
net.alphatab.tablature.model.ChordImpl.__super__ = net.alphatab.model.Chord;
for(var k in net.alphatab.model.Chord.prototype ) net.alphatab.tablature.model.ChordImpl.prototype[k] = net.alphatab.model.Chord.prototype[k];
net.alphatab.tablature.model.ChordImpl.prototype.beatImpl = function() {
	return this.beat;
}
net.alphatab.tablature.model.ChordImpl.prototype.getPaintPosition = function(iIndex) {
	return this.beatImpl().measureImpl().ts.get(iIndex);
}
net.alphatab.tablature.model.ChordImpl.prototype.paint = function(layout,context,x,y) {
	if(this.name != null && this.name != "") {
		var realX = x + Math.round(4 * layout.scale);
		var realY = y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.Chord);
		context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).addString(this.name,net.alphatab.tablature.drawing.DrawingResources.chordFont,realX,realY);
	}
}
net.alphatab.tablature.model.ChordImpl.prototype.__class__ = net.alphatab.tablature.model.ChordImpl;
net.alphatab.tablature.drawing.DrawingLayer = function(color,isFilled,penWidth) { if( color === $_ ) return; {
	this._path = new Array();
	this._color = color;
	this._isFilled = isFilled;
	this._penWidth = penWidth;
	this._currentPosition = new net.alphatab.model.Point(0,0);
}}
net.alphatab.tablature.drawing.DrawingLayer.__name__ = ["net","alphatab","tablature","drawing","DrawingLayer"];
net.alphatab.tablature.drawing.DrawingLayer.prototype._color = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype._currentPosition = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype._isFilled = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype._path = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype._penWidth = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype.addArc = function(x,y,w,h,startAngle,sweepAngle) {
	this._path.push({ Command : "addArc", X : x, Y : y, Width : w, Height : h, StartAngle : startAngle, SweepAngle : sweepAngle});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.addBezier = function(x1,y1,x2,y2,x3,y3,x4,y4) {
	this._path.push({ Command : "addBezier", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3, X4 : x4, Y4 : y4});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.addCircle = function(x,y,diameter) {
	this._path.push({ Command : "addCircle", X : x, Y : y, Radius : diameter / 2});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.addLine = function(x1,y1,x2,y2) {
	this._path.push({ Command : "addLine", X1 : (x1) + 0.5, Y1 : (y1) + 0.5, X2 : (x2) + 0.5, Y2 : (y2) + 0.5});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.addMusicSymbol = function(symbol,x,y,xScale,yScale) {
	if(yScale == null) yScale = 0;
	if(yScale == 0) {
		yScale = xScale;
	}
	var painter = new net.alphatab.tablature.drawing.SvgPainter(this,symbol,x,y,xScale,yScale);
	painter.paint();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.addPolygon = function(points) {
	this._path.push({ Command : "addPolygon", Points : points});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.addRect = function(x,y,w,h) {
	this._path.push({ Command : "addRect", X : x, Y : y, Width : w, Height : h});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.addString = function(str,font,x,y,baseline) {
	if(baseline == null) baseline = "middle";
	this._path.push({ Command : "addString", Text : str, Font : font, X : (x) + 0.5, Y : (y) + 0.5, BaseLine : baseline});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.bezierTo = function(x1,y1,x2,y2,x3,y3) {
	this._path.push({ Command : "bezierTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.circleTo = function(diameter) {
	this._path.push({ Command : "circleTo", Radius : diameter / 2});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.clear = function() {
	this._path = new Array();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.closeFigure = function() {
	this._path.push({ Command : "closeFigure"});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.draw = function(graphics) {
	graphics.setTextBaseline("middle");
	graphics.setFillStyle(this._color.toString());
	graphics.setStrokeStyle(this._color.toString());
	graphics.setLineWidth(this._penWidth);
	graphics.beginPath();
	{
		var _g = 0, _g1 = this._path;
		while(_g < _g1.length) {
			var elm = _g1[_g];
			++_g;
			try {
				switch(elm.Command) {
				case "startFigure":{
					this.finish(graphics);
					graphics.beginPath();
				}break;
				case "closeFigure":{
					graphics.closePath();
				}break;
				case "moveTo":{
					graphics.moveTo(elm.X,elm.Y);
					this._currentPosition.x = elm.X;
					this._currentPosition.y = elm.Y;
				}break;
				case "lineTo":{
					graphics.lineTo(elm.X,elm.Y);
					this._currentPosition.x = elm.X;
					this._currentPosition.y = elm.Y;
				}break;
				case "bezierTo":{
					graphics.bezierCurveTo(elm.X1,elm.Y1,elm.X2,elm.Y2,elm.X3,elm.Y3);
					this._currentPosition.x = elm.X3;
					this._currentPosition.y = elm.Y3;
				}break;
				case "quadraticCurveTo":{
					graphics.quadraticCurveTo(elm.X1,elm.Y1,elm.X2,elm.Y2);
					this._currentPosition.x = elm.X2;
					this._currentPosition.y = elm.Y2;
				}break;
				case "rectTo":{
					graphics.rect(this._currentPosition.x,this._currentPosition.y,elm.Width,elm.Height);
				}break;
				case "circleTo":{
					graphics.arc(this._currentPosition.x + elm.Radius,this._currentPosition.y + elm.Radius,elm.Radius,0,Math.PI * 2,true);
				}break;
				case "addString":{
					graphics.setTextBaseline(elm.BaseLine);
					graphics.setFont(elm.Font);
					graphics.fillText(elm.Text,elm.X,elm.Y);
				}break;
				case "addLine":{
					graphics.moveTo(elm.X1,elm.Y1);
					graphics.lineTo(elm.X2,elm.Y2);
				}break;
				case "addPolygon":{
					this.finish(graphics);
					graphics.beginPath();
					graphics.moveTo(elm.Points[0].x,elm.Points[0].y);
					var pts = elm.Points;
					{
						var _g2 = 0;
						while(_g2 < pts.length) {
							var pt = pts[_g2];
							++_g2;
							graphics.lineTo(pt.x,pt.y);
						}
					}
					graphics.closePath();
					this.finish(graphics);
					graphics.beginPath();
				}break;
				case "addArc":{
					graphics.arc(elm.X,elm.Y,elm.Radius,elm.StartAngle,elm.SweepAngle,false);
				}break;
				case "addBezier":{
					graphics.moveTo(elm.X1,elm.Y1);
					graphics.bezierCurveTo(elm.X2,elm.Y2,elm.X3,elm.Y3,elm.X4,elm.Y4);
				}break;
				case "addCircle":{
					this.finish(graphics);
					graphics.beginPath();
					graphics.arc(elm.X + elm.Radius,elm.Y + elm.Radius,elm.Radius,0,Math.PI * 2,true);
					this.finish(graphics);
					graphics.beginPath();
				}break;
				case "addRect":{
					graphics.rect(elm.X,elm.Y,elm.Width,elm.Height);
				}break;
				}
			}
			catch( $e0 ) {
				if( js.Boot.__instanceof($e0,String) ) {
					var err = $e0;
					{
						throw err;
					}
				} else throw($e0);
			}
		}
	}
	this.finish(graphics);
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.finish = function(graphics) {
	if(this._isFilled) {
		graphics.fill();
	}
	else {
		graphics.stroke();
	}
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.lineTo = function(x,y) {
	this._path.push({ Command : "lineTo", X : (x) + 0.5, Y : (y) + 0.5});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.moveTo = function(x,y) {
	this._path.push({ Command : "moveTo", X : Math.round(x) + 0.5, Y : Math.round(y) + 0.5});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.quadraticCurveTo = function(x1,y1,x2,y2) {
	this._path.push({ Command : "quadraticCurveTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.rectTo = function(w,h) {
	this._path.push({ Command : "rectTo", Width : w, Height : h});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.startFigure = function() {
	this._path.push({ Command : "startFigure"});
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.__class__ = net.alphatab.tablature.drawing.DrawingLayer;
net.alphatab.model.Lyrics = function(trackChoice) { if( trackChoice === $_ ) return; {
	if(trackChoice == null) trackChoice = 0;
	this.trackChoice = trackChoice;
	this.lines = new Array();
}}
net.alphatab.model.Lyrics.__name__ = ["net","alphatab","model","Lyrics"];
net.alphatab.model.Lyrics.prototype.lines = null;
net.alphatab.model.Lyrics.prototype.lyricsBeats = function() {
	var full = "";
	{
		var _g = 0, _g1 = this.lines;
		while(_g < _g1.length) {
			var line = _g1[_g];
			++_g;
			if(line != null) full += line.lyrics + "\n";
		}
	}
	var ret = StringTools.trim(full);
	ret = StringTools.replace(ret,"\n"," ");
	ret = StringTools.replace(ret,"\r"," ");
	return ret.split(" ");
}
net.alphatab.model.Lyrics.prototype.trackChoice = null;
net.alphatab.model.Lyrics.prototype.__class__ = net.alphatab.model.Lyrics;
net.alphatab.tablature.model.LyricsImpl = function(p) { if( p === $_ ) return; {
	net.alphatab.model.Lyrics.apply(this,[]);
}}
net.alphatab.tablature.model.LyricsImpl.__name__ = ["net","alphatab","tablature","model","LyricsImpl"];
net.alphatab.tablature.model.LyricsImpl.__super__ = net.alphatab.model.Lyrics;
for(var k in net.alphatab.model.Lyrics.prototype ) net.alphatab.tablature.model.LyricsImpl.prototype[k] = net.alphatab.model.Lyrics.prototype[k];
net.alphatab.tablature.model.LyricsImpl.prototype.paintCurrentNoteBeats = function(context,layout,currentMeasure,beatCount,x,y) {
	var beats = this.lyricsBeats();
	if(beats != null && beats.length > 0) {
		var beatIndex = 0;
		{
			var _g1 = 0, _g = currentMeasure.beatCount();
			while(_g1 < _g) {
				var i = _g1++;
				var index = beatCount + i;
				var beat = currentMeasure.beats[i];
				if(index < beats.length) {
					var str = StringTools.trim(beats[index]);
					if(str.length > 0) {
						var realX = (((x + beat.posX) + beat.spacing()) + 2);
						context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).addString(str,net.alphatab.tablature.drawing.DrawingResources.defaultFont,realX + 13,y + currentMeasure.ts.get(net.alphatab.tablature.TrackSpacingPositions.Lyric));
					}
				}
				beatIndex++;
			}
		}
	}
}
net.alphatab.tablature.model.LyricsImpl.prototype.__class__ = net.alphatab.tablature.model.LyricsImpl;
if(!net.alphatab.model.effects) net.alphatab.model.effects = {}
net.alphatab.model.effects.GraceEffect = function(p) { if( p === $_ ) return; {
	this.fret = 0;
	this.duration = 1;
	this.velocity = 95;
	this.transition = net.alphatab.model.effects.GraceEffectTransition.None;
	this.isOnBeat = false;
	this.isDead = false;
}}
net.alphatab.model.effects.GraceEffect.__name__ = ["net","alphatab","model","effects","GraceEffect"];
net.alphatab.model.effects.GraceEffect.prototype.clone = function(factory) {
	var effect = factory.newGraceEffect();
	effect.fret = this.fret;
	effect.duration = this.duration;
	effect.velocity = this.velocity;
	effect.transition = this.transition;
	effect.isOnBeat = this.isOnBeat;
	effect.isDead = this.isDead;
	return effect;
}
net.alphatab.model.effects.GraceEffect.prototype.duration = null;
net.alphatab.model.effects.GraceEffect.prototype.durationTime = function() {
	return Math.floor((960 / 16.00) * this.duration);
}
net.alphatab.model.effects.GraceEffect.prototype.fret = null;
net.alphatab.model.effects.GraceEffect.prototype.isDead = null;
net.alphatab.model.effects.GraceEffect.prototype.isOnBeat = null;
net.alphatab.model.effects.GraceEffect.prototype.transition = null;
net.alphatab.model.effects.GraceEffect.prototype.velocity = null;
net.alphatab.model.effects.GraceEffect.prototype.__class__ = net.alphatab.model.effects.GraceEffect;
net.alphatab.model.SongManager = function(factory) { if( factory === $_ ) return; {
	this.factory = factory;
}}
net.alphatab.model.SongManager.__name__ = ["net","alphatab","model","SongManager"];
net.alphatab.model.SongManager.getDivisionLength = function(header) {
	var defaulLenght = 960;
	var denominator = header.timeSignature.denominator.value;
	switch(denominator) {
	case 8:{
		if(header.timeSignature.numerator % 3 == 0) defaulLenght += Math.floor(960 / 2);
	}break;
	}
	return defaulLenght;
}
net.alphatab.model.SongManager.getNextBeat2 = function(beats,currentBeat) {
	var next = null;
	{
		var _g = 0;
		while(_g < beats.length) {
			var checkedBeat = beats[_g];
			++_g;
			if(checkedBeat.start > currentBeat.start) {
				if(next == null || checkedBeat.start < next.start) next = checkedBeat;
			}
		}
	}
	return next;
}
net.alphatab.model.SongManager.getNextVoice = function(beats,beat,index) {
	var next = null;
	{
		var _g = 0;
		while(_g < beats.length) {
			var current = beats[_g];
			++_g;
			if(current.start > beat.start && !current.voices[index].isEmpty) {
				if(next == null || current.start < next.beat.start) next = current.voices[index];
			}
		}
	}
	return next;
}
net.alphatab.model.SongManager.getFirstVoice = function(beats,index) {
	var first = null;
	{
		var _g = 0;
		while(_g < beats.length) {
			var current = beats[_g];
			++_g;
			if((first == null || current.start < first.beat.start) && !current.voices[index].isEmpty) first = current.voices[index];
		}
	}
	return first;
}
net.alphatab.model.SongManager.getBeat = function(measure,start) {
	{
		var _g = 0, _g1 = measure.beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			if(beat.start == start) return beat;
		}
	}
	return null;
}
net.alphatab.model.SongManager.quickSort = function(elements,left,right) {
	var i = left;
	var j = right;
	var pivot = elements[Math.floor((left + right) / 2)];
	do {
		while((elements[i].start < pivot.start) && (i < right)) i++;
		while((pivot.start < elements[j].start) && (j > left)) j--;
		if(i <= j) {
			var temp = elements[i];
			elements[i] = elements[j];
			elements[j] = temp;
			i++;
			j--;
		}
	} while(i <= j);
	if(left < j) net.alphatab.model.SongManager.quickSort(elements,left,j);
	if(i < right) net.alphatab.model.SongManager.quickSort(elements,i,right);
}
net.alphatab.model.SongManager.prototype.autoCompleteSilences = function(measure) {
	var beat = this.getFirstBeat(measure.beats);
	if(beat == null) {
		this.createSilences(measure,measure.start(),measure.length(),0);
		return;
	}
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			var voice = net.alphatab.model.SongManager.getFirstVoice(measure.beats,v);
			if(voice != null && voice.beat.start > measure.start()) this.createSilences(measure,measure.start(),voice.beat.start - measure.start(),v);
		}
	}
	var start = new Array();
	var uncompletedLength = new Array();
	{
		var _g1 = 0, _g = beat.voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			start.push(0);
			uncompletedLength.push(0);
		}
	}
	while(beat != null) {
		{
			var _g1 = 0, _g = beat.voices.length;
			while(_g1 < _g) {
				var v = _g1++;
				var voice = beat.voices[v];
				if(!voice.isEmpty) {
					var voiceEnd = beat.start + voice.duration.time();
					var nextPosition = measure.start() + measure.length();
					var nextVoice = net.alphatab.model.SongManager.getNextVoice(measure.beats,beat,voice.index);
					if(nextVoice != null) {
						nextPosition = nextVoice.beat.start;
					}
					if(voiceEnd < nextPosition) {
						start[v] = voiceEnd;
						uncompletedLength[v] = nextPosition - voiceEnd;
					}
				}
			}
		}
		{
			var _g1 = 0, _g = uncompletedLength.length;
			while(_g1 < _g) {
				var v = _g1++;
				if(uncompletedLength[v] > 0) {
					this.createSilences(measure,start[v],uncompletedLength[v],v);
				}
				start[v] = 0;
				uncompletedLength[v] = 0;
			}
		}
		beat = net.alphatab.model.SongManager.getNextBeat2(measure.beats,beat);
	}
}
net.alphatab.model.SongManager.prototype.createDurations = function(time) {
	var durations = new Array();
	var min = this.factory.newDuration();
	min.value = 64;
	min.isDotted = false;
	min.isDoubleDotted = false;
	min.tuplet.enters = 3;
	min.tuplet.times = 2;
	var missing = time;
	while(missing > min.time()) {
		var duration = net.alphatab.model.Duration.fromTime(this.factory,missing,min,10);
		durations.push(duration.clone(this.factory));
		missing -= duration.time();
	}
	return durations;
}
net.alphatab.model.SongManager.prototype.createSilences = function(measure,start,length,voiceIndex) {
	var nextStart = start;
	var durations = this.createDurations(length);
	{
		var _g = 0;
		while(_g < durations.length) {
			var duration = durations[_g];
			++_g;
			var isNew = false;
			var beatStart = this.getRealStart(measure,nextStart);
			var beat = net.alphatab.model.SongManager.getBeat(measure,beatStart);
			if(beat == null) {
				beat = this.factory.newBeat();
				beat.start = this.getRealStart(measure,nextStart);
				isNew = true;
			}
			var voice = beat.voices[voiceIndex];
			voice.isEmpty = false;
			duration.copy(voice.duration);
			if(isNew) measure.addBeat(beat);
			nextStart += duration.time();
		}
	}
}
net.alphatab.model.SongManager.prototype.factory = null;
net.alphatab.model.SongManager.prototype.getFirstBeat = function(list) {
	return (list.length > 0?list[0]:null);
}
net.alphatab.model.SongManager.prototype.getFirstMeasure = function(track) {
	return (track.measureCount() > 0?track.measures[0]:null);
}
net.alphatab.model.SongManager.prototype.getNextBeat = function(beat) {
	var nextBeat = net.alphatab.model.SongManager.getNextBeat2(beat.measure.beats,beat);
	if(nextBeat == null && beat.measure.track.measureCount() > beat.measure.number()) {
		var measure = beat.measure.track.measures[beat.measure.number()];
		if(measure.beatCount() > 0) {
			return measure.beats[0];
		}
	}
	return nextBeat;
}
net.alphatab.model.SongManager.prototype.getNextNote = function(measure,start,voiceIndex,guitarString) {
	var beat = net.alphatab.model.SongManager.getBeat(measure,start);
	if(beat != null) {
		var next = net.alphatab.model.SongManager.getNextBeat2(measure.beats,beat);
		while(next != null) {
			var voice = next.voices[voiceIndex];
			if(!voice.isEmpty) {
				{
					var _g = 0, _g1 = voice.notes;
					while(_g < _g1.length) {
						var current = _g1[_g];
						++_g;
						if(current.string == guitarString || guitarString == -1) return current;
					}
				}
			}
			next = net.alphatab.model.SongManager.getNextBeat2(measure.beats,next);
		}
	}
	return null;
}
net.alphatab.model.SongManager.prototype.getPreviousMeasure = function(measure) {
	return (measure.number() > 1?measure.track.measures[measure.number() - 2]:null);
}
net.alphatab.model.SongManager.prototype.getPreviousMeasureHeader = function(header) {
	var prevIndex = header.number - 1;
	if(prevIndex > 0) {
		return header.song.measureHeaders[prevIndex - 1];
	}
	return null;
}
net.alphatab.model.SongManager.prototype.getRealStart = function(measure,currentStart) {
	var beatLength = net.alphatab.model.SongManager.getDivisionLength(measure.header);
	var start = currentStart;
	var startBeat = start % beatLength == 0;
	if(!startBeat) {
		var minDuration = this.factory.newDuration();
		minDuration.value = 64;
		minDuration.tuplet.enters = 3;
		minDuration.tuplet.times = 2;
		var time = minDuration.time();
		{
			var _g = 0;
			while(_g < time) {
				var i = _g++;
				start++;
				startBeat = start % beatLength == 0;
				if(startBeat) break;
			}
		}
		if(!startBeat) start = currentStart;
	}
	return start;
}
net.alphatab.model.SongManager.prototype.orderBeats = function(measure) {
	net.alphatab.model.SongManager.quickSort(measure.beats,0,measure.beatCount() - 1);
}
net.alphatab.model.SongManager.prototype.__class__ = net.alphatab.model.SongManager;
net.alphatab.model.Tempo = function(p) { if( p === $_ ) return; {
	this.value = 120;
}}
net.alphatab.model.Tempo.__name__ = ["net","alphatab","model","Tempo"];
net.alphatab.model.Tempo.tempoToUsq = function(tempo) {
	return Math.floor(((60.00 / tempo) * 1000) * 1000.00);
}
net.alphatab.model.Tempo.prototype.copy = function(tempo) {
	this.value = tempo.value;
}
net.alphatab.model.Tempo.prototype.inUsq = function() {
	return net.alphatab.model.Tempo.tempoToUsq(this.value);
}
net.alphatab.model.Tempo.prototype.value = null;
net.alphatab.model.Tempo.prototype.__class__ = net.alphatab.model.Tempo;
net.alphatab.model.MeasureHeader = function(factory) { if( factory === $_ ) return; {
	this.number = 0;
	this.start = 960;
	this.timeSignature = factory.newTimeSignature();
	this.keySignature = 0;
	this.tempo = factory.newTempo();
	this.marker = null;
	this.tripletFeel = net.alphatab.model.TripletFeel.None;
	this.isRepeatOpen = false;
	this.repeatClose = 0;
	this.repeatAlternative = 0;
}}
net.alphatab.model.MeasureHeader.__name__ = ["net","alphatab","model","MeasureHeader"];
net.alphatab.model.MeasureHeader.prototype.hasDoubleBar = null;
net.alphatab.model.MeasureHeader.prototype.hasMarker = function() {
	return this.marker != null;
}
net.alphatab.model.MeasureHeader.prototype.isRepeatOpen = null;
net.alphatab.model.MeasureHeader.prototype.keySignature = null;
net.alphatab.model.MeasureHeader.prototype.keySignatureType = null;
net.alphatab.model.MeasureHeader.prototype.length = function() {
	return this.timeSignature.numerator * this.timeSignature.denominator.time();
}
net.alphatab.model.MeasureHeader.prototype.marker = null;
net.alphatab.model.MeasureHeader.prototype.number = null;
net.alphatab.model.MeasureHeader.prototype.repeatAlternative = null;
net.alphatab.model.MeasureHeader.prototype.repeatClose = null;
net.alphatab.model.MeasureHeader.prototype.song = null;
net.alphatab.model.MeasureHeader.prototype.start = null;
net.alphatab.model.MeasureHeader.prototype.tempo = null;
net.alphatab.model.MeasureHeader.prototype.timeSignature = null;
net.alphatab.model.MeasureHeader.prototype.tripletFeel = null;
net.alphatab.model.MeasureHeader.prototype.__class__ = net.alphatab.model.MeasureHeader;
net.alphatab.model.MeasureClef = { __ename__ : ["net","alphatab","model","MeasureClef"], __constructs__ : ["Treble","Bass","Tenor","Alto"] }
net.alphatab.model.MeasureClef.Alto = ["Alto",3];
net.alphatab.model.MeasureClef.Alto.toString = $estr;
net.alphatab.model.MeasureClef.Alto.__enum__ = net.alphatab.model.MeasureClef;
net.alphatab.model.MeasureClef.Bass = ["Bass",1];
net.alphatab.model.MeasureClef.Bass.toString = $estr;
net.alphatab.model.MeasureClef.Bass.__enum__ = net.alphatab.model.MeasureClef;
net.alphatab.model.MeasureClef.Tenor = ["Tenor",2];
net.alphatab.model.MeasureClef.Tenor.toString = $estr;
net.alphatab.model.MeasureClef.Tenor.__enum__ = net.alphatab.model.MeasureClef;
net.alphatab.model.MeasureClef.Treble = ["Treble",0];
net.alphatab.model.MeasureClef.Treble.toString = $estr;
net.alphatab.model.MeasureClef.Treble.__enum__ = net.alphatab.model.MeasureClef;
net.alphatab.model.effects.TremoloPickingEffect = function(factory) { if( factory === $_ ) return; {
	this.duration = factory.newDuration();
}}
net.alphatab.model.effects.TremoloPickingEffect.__name__ = ["net","alphatab","model","effects","TremoloPickingEffect"];
net.alphatab.model.effects.TremoloPickingEffect.prototype.clone = function(factory) {
	var effect = factory.newTremoloPickingEffect();
	effect.duration.value = this.duration.value;
	effect.duration.isDotted = this.duration.isDotted;
	effect.duration.isDoubleDotted = this.duration.isDoubleDotted;
	effect.duration.tuplet.enters = this.duration.tuplet.enters;
	effect.duration.tuplet.times = this.duration.tuplet.times;
	return effect;
}
net.alphatab.model.effects.TremoloPickingEffect.prototype.duration = null;
net.alphatab.model.effects.TremoloPickingEffect.prototype.__class__ = net.alphatab.model.effects.TremoloPickingEffect;
List = function(p) { if( p === $_ ) return; {
	this.length = 0;
}}
List.__name__ = ["List"];
List.prototype.add = function(item) {
	var x = [item];
	if(this.h == null) this.h = x;
	else this.q[1] = x;
	this.q = x;
	this.length++;
}
List.prototype.clear = function() {
	this.h = null;
	this.q = null;
	this.length = 0;
}
List.prototype.filter = function(f) {
	var l2 = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		if(f(v)) l2.add(v);
	}
	return l2;
}
List.prototype.first = function() {
	return (this.h == null?null:this.h[0]);
}
List.prototype.h = null;
List.prototype.isEmpty = function() {
	return (this.h == null);
}
List.prototype.iterator = function() {
	return { h : this.h, hasNext : function() {
		return (this.h != null);
	}, next : function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		return x;
	}}
}
List.prototype.join = function(sep) {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	while(l != null) {
		if(first) first = false;
		else s.b[s.b.length] = sep;
		s.b[s.b.length] = l[0];
		l = l[1];
	}
	return s.b.join("");
}
List.prototype.last = function() {
	return (this.q == null?null:this.q[0]);
}
List.prototype.length = null;
List.prototype.map = function(f) {
	var b = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		b.add(f(v));
	}
	return b;
}
List.prototype.pop = function() {
	if(this.h == null) return null;
	var x = this.h[0];
	this.h = this.h[1];
	if(this.h == null) this.q = null;
	this.length--;
	return x;
}
List.prototype.push = function(item) {
	var x = [item,this.h];
	this.h = x;
	if(this.q == null) this.q = x;
	this.length++;
}
List.prototype.q = null;
List.prototype.remove = function(v) {
	var prev = null;
	var l = this.h;
	while(l != null) {
		if(l[0] == v) {
			if(prev == null) this.h = l[1];
			else prev[1] = l[1];
			if(this.q == l) this.q = prev;
			this.length--;
			return true;
		}
		prev = l;
		l = l[1];
	}
	return false;
}
List.prototype.toString = function() {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	s.b[s.b.length] = "{";
	while(l != null) {
		if(first) first = false;
		else s.b[s.b.length] = ", ";
		s.b[s.b.length] = Std.string(l[0]);
		l = l[1];
	}
	s.b[s.b.length] = "}";
	return s.b.join("");
}
List.prototype.__class__ = List;
IntIter = function(min,max) { if( min === $_ ) return; {
	this.min = min;
	this.max = max;
}}
IntIter.__name__ = ["IntIter"];
IntIter.prototype.hasNext = function() {
	return this.min < this.max;
}
IntIter.prototype.max = null;
IntIter.prototype.min = null;
IntIter.prototype.next = function() {
	return this.min++;
}
IntIter.prototype.__class__ = IntIter;
if(!net.alphatab.file) net.alphatab.file = {}
net.alphatab.file.SongLoader = function() { }
net.alphatab.file.SongLoader.__name__ = ["net","alphatab","file","SongLoader"];
net.alphatab.file.SongLoader.loadSong = function(url,factory,success) {
	var loader = net.alphatab.platform.PlatformFactory.getLoader();
	haxe.Log.trace("Load song " + url,{ fileName : "SongLoader.hx", lineNumber : 19, className : "net.alphatab.file.SongLoader", methodName : "loadSong"});
	loader.loadBinary("GET",url,function(data) {
		var readers = net.alphatab.file.SongReader.availableReaders();
		haxe.Log.trace("Song loaded, search for reader",{ fileName : "SongLoader.hx", lineNumber : 25, className : "net.alphatab.file.SongLoader", methodName : "loadSong"});
		{
			var _g = 0;
			while(_g < readers.length) {
				var reader = readers[_g];
				++_g;
				try {
					haxe.Log.trace("Try Reader " + Type.getClassName(Type.getClass(reader)),{ fileName : "SongLoader.hx", lineNumber : 30, className : "net.alphatab.file.SongLoader", methodName : "loadSong"});
					data.seek(0);
					reader.init(data,factory);
					var song = reader.readSong();
					haxe.Log.trace("Reading succeeded",{ fileName : "SongLoader.hx", lineNumber : 34, className : "net.alphatab.file.SongLoader", methodName : "loadSong"});
					success(song);
					return;
				}
				catch( $e1 ) {
					if( js.Boot.__instanceof($e1,net.alphatab.file.FileFormatException) ) {
						var e = $e1;
						{
							haxe.Log.trace("Reading failed",{ fileName : "SongLoader.hx", lineNumber : 40, className : "net.alphatab.file.SongLoader", methodName : "loadSong"});
							continue;
						}
					} else throw($e1);
				}
			}
		}
		throw new net.alphatab.file.FileFormatException("No reader for requested file found");
	},function(err) {
		haxe.Log.trace("Error loading file " + err,{ fileName : "SongLoader.hx", lineNumber : 49, className : "net.alphatab.file.SongLoader", methodName : "loadSong"});
		throw err;
	});
}
net.alphatab.file.SongLoader.prototype.__class__ = net.alphatab.file.SongLoader;
net.alphatab.Main = function() { }
net.alphatab.Main.__name__ = ["net","alphatab","Main"];
net.alphatab.Main.main = function() {
	net.alphatab.MyTrace.init();
}
net.alphatab.Main.prototype.__class__ = net.alphatab.Main;
net.alphatab.file.SongReader = function(p) { if( p === $_ ) return; {
	null;
}}
net.alphatab.file.SongReader.__name__ = ["net","alphatab","file","SongReader"];
net.alphatab.file.SongReader.availableReaders = function() {
	var d = new Array();
	d.push(new net.alphatab.file.guitarpro.Gp5Reader());
	d.push(new net.alphatab.file.guitarpro.Gp4Reader());
	d.push(new net.alphatab.file.guitarpro.Gp4Reader());
	return d;
}
net.alphatab.file.SongReader.prototype.data = null;
net.alphatab.file.SongReader.prototype.factory = null;
net.alphatab.file.SongReader.prototype.getTiedNoteValue = function(stringIndex,track) {
	var measureCount = track.measureCount();
	if(measureCount > 0) {
		{
			var _g = 0;
			while(_g < measureCount) {
				var m2 = _g++;
				var m = (measureCount - 1) - m2;
				var measure = track.measures[m];
				{
					var _g2 = 0, _g1 = measure.beatCount();
					while(_g2 < _g1) {
						var b2 = _g2++;
						var b = (measure.beatCount() - 1) - b2;
						var beat = measure.beats[b];
						{
							var _g4 = 0, _g3 = beat.voices.length;
							while(_g4 < _g3) {
								var v = _g4++;
								var voice = beat.voices[v];
								if(!voice.isEmpty) {
									{
										var _g6 = 0, _g5 = voice.notes.length;
										while(_g6 < _g5) {
											var n = _g6++;
											var note = voice.notes[n];
											if(note.string == stringIndex) {
												return note.value;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return -1;
}
net.alphatab.file.SongReader.prototype.init = function(data,factory) {
	this.data = data;
	this.factory = factory;
}
net.alphatab.file.SongReader.prototype.readSong = function() {
	return this.factory.newSong();
}
net.alphatab.file.SongReader.prototype.__class__ = net.alphatab.file.SongReader;
EReg = function(r,opt) { if( r === $_ ) return; {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
}}
EReg.__name__ = ["EReg"];
EReg.prototype.customReplace = function(s,f) {
	var buf = new StringBuf();
	while(true) {
		if(!this.match(s)) break;
		buf.b[buf.b.length] = this.matchedLeft();
		buf.b[buf.b.length] = f(this);
		s = this.matchedRight();
	}
	buf.b[buf.b.length] = s;
	return buf.b.join("");
}
EReg.prototype.match = function(s) {
	this.r.m = this.r.exec(s);
	this.r.s = s;
	this.r.l = RegExp.leftContext;
	this.r.r = RegExp.rightContext;
	return (this.r.m != null);
}
EReg.prototype.matched = function(n) {
	return (this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
		var $r;
		throw "EReg::matched";
		return $r;
	}(this)));
}
EReg.prototype.matchedLeft = function() {
	if(this.r.m == null) throw "No string matched";
	if(this.r.l == null) return this.r.s.substr(0,this.r.m.index);
	return this.r.l;
}
EReg.prototype.matchedPos = function() {
	if(this.r.m == null) throw "No string matched";
	return { pos : this.r.m.index, len : this.r.m[0].length}
}
EReg.prototype.matchedRight = function() {
	if(this.r.m == null) throw "No string matched";
	if(this.r.r == null) {
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	return this.r.r;
}
EReg.prototype.r = null;
EReg.prototype.replace = function(s,by) {
	return s.replace(this.r,by);
}
EReg.prototype.split = function(s) {
	var d = "#__delim__#";
	return s.replace(this.r,d).split(d);
}
EReg.prototype.__class__ = EReg;
if(!net.alphatab.file.alphatex) net.alphatab.file.alphatex = {}
net.alphatab.file.alphatex.AlphaTexParser = function(p) { if( p === $_ ) return; {
	net.alphatab.file.SongReader.apply(this,[]);
}}
net.alphatab.file.alphatex.AlphaTexParser.__name__ = ["net","alphatab","file","alphatex","AlphaTexParser"];
net.alphatab.file.alphatex.AlphaTexParser.__super__ = net.alphatab.file.SongReader;
for(var k in net.alphatab.file.SongReader.prototype ) net.alphatab.file.alphatex.AlphaTexParser.prototype[k] = net.alphatab.file.SongReader.prototype[k];
net.alphatab.file.alphatex.AlphaTexParser.isLetter = function(ch) {
	var code = ch.charCodeAt(0);
	return code != 46 && ((code >= 33 && code <= 47) || (code >= 58 && code <= 126) || (code > 128));
}
net.alphatab.file.alphatex.AlphaTexParser.isDigit = function(ch) {
	var code = ch.charCodeAt(0);
	return (code >= 48 && code <= 57);
}
net.alphatab.file.alphatex.AlphaTexParser.isTuning = function(name) {
	var regex = new EReg("([a-g]b?)([0-9])","i");
	return regex.match(name);
}
net.alphatab.file.alphatex.AlphaTexParser.prototype._allowNegatives = null;
net.alphatab.file.alphatex.AlphaTexParser.prototype._ch = null;
net.alphatab.file.alphatex.AlphaTexParser.prototype._curChPos = null;
net.alphatab.file.alphatex.AlphaTexParser.prototype._song = null;
net.alphatab.file.alphatex.AlphaTexParser.prototype._sy = null;
net.alphatab.file.alphatex.AlphaTexParser.prototype._syData = null;
net.alphatab.file.alphatex.AlphaTexParser.prototype._track = null;
net.alphatab.file.alphatex.AlphaTexParser.prototype.beat = function(measure) {
	var beat = this.factory.newBeat();
	beat.start = 0;
	if(measure.beatCount() == 0) {
		beat.start = measure.start();
	}
	else {
		var index = measure.beats.length - 1;
		beat.start = measure.beats[index].start + measure.beats[index].voices[0].duration.time();
	}
	var voice = beat.voices[0];
	voice.isEmpty = false;
	if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.LParensis) {
		this.newSy();
		voice.addNote(this.note());
		while(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Eof) {
			voice.addNote(this.note());
		}
		if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.RParensis) {
			this.error("note-list",net.alphatab.file.alphatex.AlphaTexSymbols.RParensis);
		}
		this.newSy();
	}
	else if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String && Std.string(this._syData).toLowerCase() == "r") {
		this.newSy();
	}
	else {
		voice.addNote(this.note());
	}
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Dot) {
		this.error("beat",net.alphatab.file.alphatex.AlphaTexSymbols.Dot);
	}
	this.newSy();
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
		this.error("duration",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
	}
	if(this._syData == 1 || this._syData == 2 || this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) {
		voice.duration.value = this._syData;
	}
	else {
		this.error("duration",net.alphatab.file.alphatex.AlphaTexSymbols.Number,false);
	}
	this.newSy();
	this.beatEffects(beat);
	measure.addBeat(beat);
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.beatEffects = function(beat) {
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.LBrace) {
		return;
	}
	this.newSy();
	while(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.MetaCommand) {
		this._syData = Std.string(this._syData).toLowerCase();
		if(this._syData == "f") {
			beat.effect.fadeIn = true;
			this.newSy();
		}
		else if(this._syData == "v") {
			beat.effect.vibrato = true;
			this.newSy();
		}
		else if(this._syData == "t") {
			beat.effect.tapping = true;
			this.newSy();
		}
		else if(this._syData == "s") {
			beat.effect.slapping = true;
			this.newSy();
		}
		else if(this._syData == "p") {
			beat.effect.popping = true;
			this.newSy();
		}
		else if(this._syData == "su") {
			beat.effect.stroke.direction = net.alphatab.model.BeatStrokeDirection.Up;
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				if(this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) {
					beat.effect.stroke.value = this._syData;
				}
				else {
					beat.effect.stroke.value = 8;
				}
				this.newSy();
			}
			else {
				beat.effect.stroke.value = 8;
			}
		}
		else if(this._syData == "sd") {
			beat.effect.stroke.direction = net.alphatab.model.BeatStrokeDirection.Down;
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				if(this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) {
					beat.effect.stroke.value = this._syData;
				}
				else {
					beat.effect.stroke.value = 8;
				}
				this.newSy();
			}
			else {
				beat.effect.stroke.value = 8;
			}
		}
		else if(this._syData == "tb") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.LParensis) {
				this.error("tremolobar-effect",net.alphatab.file.alphatex.AlphaTexSymbols.LParensis);
			}
			this.newSy();
			this._allowNegatives = true;
			var points = new Array();
			while(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Eof) {
				if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
					this.error("tremolobar-effect",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
				}
				points.push(new net.alphatab.model.effects.BendPoint(0,this._syData,false));
				this.newSy();
			}
			if(points.length > 12) {
				points = points.slice(0,12);
			}
			var count = points.length;
			var step = Math.ceil(12 / count);
			var i = 0;
			var tremoloBarEffect = this.factory.newTremoloBarEffect();
			while(i < count) {
				points[i].position = Math.floor(Math.min(12,(i * step)));
				tremoloBarEffect.points.push(points[i]);
				i++;
			}
			beat.effect.tremoloBar = tremoloBarEffect;
			this._allowNegatives = false;
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.RParensis) {
				this.error("tremolobar-effect",net.alphatab.file.alphatex.AlphaTexSymbols.RParensis);
			}
			this.newSy();
		}
		else {
			this.error("beat-effects",net.alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
	}
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.RBrace) {
		this.error("beat-effects",net.alphatab.file.alphatex.AlphaTexSymbols.RBrace);
	}
	this.newSy();
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.createDefaultSong = function() {
	this._song = this.factory.newSong();
	this._song.tempo = 120;
	this._song.tempoName = "";
	this._song.hideTempo = false;
	this._song.pageSetup = net.alphatab.model.PageSetup.defaults();
	this._track = this.factory.newTrack();
	this._track.number = 1;
	this._track.channel.instrument(25);
	this._track.channel.channel = [0,1][0];
	this._track.channel.effectChannel = [0,1][1];
	this.createDefaultStrings(this._track.strings);
	this._song.addTrack(this._track);
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.createDefaultStrings = function(list) {
	list.push(this.newString(1,64));
	list.push(this.newString(2,59));
	list.push(this.newString(3,55));
	list.push(this.newString(4,50));
	list.push(this.newString(5,45));
	list.push(this.newString(6,40));
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.error = function(nonterm,expected,symbolError) {
	if(symbolError == null) symbolError = true;
	if(symbolError) {
		throw new net.alphatab.file.FileFormatException((((((Std.string(this._curChPos) + ": Error on block ") + nonterm) + ", expected a ") + Std.string(expected)) + " found a ") + this._sy);
	}
	else {
		throw new net.alphatab.file.FileFormatException((((Std.string(this._curChPos) + ": Error on block ") + nonterm) + ", invalid value:") + Std.string(this._syData));
	}
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.measure = function(tempo) {
	var header = this.factory.newMeasureHeader();
	header.number = this._song.measureHeaders.length + 1;
	header.start = (this._song.measureHeaders.length == 0?960:this._song.measureHeaders[this._song.measureHeaders.length - 1].start + this._song.measureHeaders[this._song.measureHeaders.length - 1].length());
	this._song.addMeasureHeader(header);
	var measure = this.factory.newMeasure(header);
	header.tempo.copy(tempo);
	if(header.number > 1) {
		var prevMeasure = this._track.measures[header.number - 2];
		var prevHeader = this._song.measureHeaders[header.number - 2];
		measure.clef = prevMeasure.clef;
		header.keySignature = prevHeader.keySignature;
		header.keySignatureType = prevHeader.keySignatureType;
	}
	this.measureMeta(measure);
	tempo.copy(header.tempo);
	this._track.addMeasure(measure);
	while(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Pipe && this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Eof) {
		this.beat(measure);
	}
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.measureMeta = function(measure) {
	var header = measure.header;
	while(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.MetaCommand) {
		if(this._syData == "ts") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("timesignature-numerator",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			header.timeSignature.numerator = this._syData;
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("timesignature-denominator",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			header.timeSignature.denominator.value = this._syData;
		}
		else if(this._syData == "ro") {
			header.isRepeatOpen = true;
		}
		else if(this._syData == "rc") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("repeatclose",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			header.repeatClose = Std.parseInt(this._syData) - 1;
		}
		else if(this._syData == "ks") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this.error("keysignature",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			header.keySignature = this.parseKeySignature(this._syData);
		}
		else if(this._syData == "clef") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this.error("clef",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			measure.clef = this.parseClef(this._syData);
		}
		else if(this._syData == "tempo") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("tempo",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			header.tempo.value = this._syData;
		}
		else {
			this.error("measure-effects",net.alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
		this.newSy();
	}
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.measures = function() {
	var tempo = this.factory.newTempo();
	tempo.value = this._song.tempo;
	this.measure(tempo);
	while(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Eof) {
		if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Pipe) {
			this.error("measures",net.alphatab.file.alphatex.AlphaTexSymbols.Pipe);
		}
		this.newSy();
		this.measure(tempo);
	}
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.metaData = function() {
	while(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.MetaCommand) {
		if(this._syData == "title") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.title = this._syData;
			}
			else {
				this.error("title",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "subtitle") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.subtitle = this._syData;
			}
			else {
				this.error("subtitle",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "artist") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.artist = this._syData;
			}
			else {
				this.error("artist",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "album") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.album = this._syData;
			}
			else {
				this.error("album",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "words") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.words = this._syData;
			}
			else {
				this.error("words",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "music") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.music = this._syData;
			}
			else {
				this.error("music",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "copyright") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.copyright = this._syData;
			}
			else {
				this.error("copyright",net.alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "tempo") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this._song.tempo = this._syData;
			}
			else {
				this.error("tempo",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			this.newSy();
		}
		else if(this._syData == "capo") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this._track.offset = this._syData;
			}
			else {
				this.error("capo",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			this.newSy();
		}
		else if(this._syData == "tuning") {
			this.newSy();
			if(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.Tuning) {
				this._track.strings = new Array();
				do {
					this._track.strings.push(this.newString(this._track.strings.length + 1,this.parseTuning(this._syData)));
					this.newSy();
				} while(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.Tuning);
			}
			else {
				this.error("tuning",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
		}
		else {
			this.error("metaDataTags",net.alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
	}
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.newString = function(number,value) {
	var str = this.factory.newString();
	str.number = number;
	str.value = value;
	return str;
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.newSy = function() {
	this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.No;
	do {
		if(this._ch == String.fromCharCode(0)) {
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.Eof;
		}
		else if(this._ch == " " || this._ch == "\n" || this._ch == "\r" || this._ch == "\t") {
			this.nextChar();
		}
		else if(this._ch == "\"" || this._ch == "'") {
			this.nextChar();
			this._syData = "";
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.String;
			while(this._ch != "\"" && this._ch != "'" && this._ch != String.fromCharCode(0)) {
				this._syData += this._ch;
				this.nextChar();
			}
			this.nextChar();
		}
		else if(this._ch == "-") {
			if(this._allowNegatives && net.alphatab.file.alphatex.AlphaTexParser.isDigit(this._ch)) {
				var number = this.readNumber();
				this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.Number;
				this._syData = -number;
			}
			else if(net.alphatab.file.alphatex.AlphaTexParser.isLetter(this._ch)) {
				var name = this.readName();
				if(net.alphatab.file.alphatex.AlphaTexParser.isTuning(name)) {
					this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.Tuning;
					this._syData = name.toLowerCase();
				}
				else {
					this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.String;
					this._syData = name;
				}
			}
		}
		else if(this._ch == ".") {
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.Dot;
			this.nextChar();
		}
		else if(this._ch == "(") {
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.LParensis;
			this.nextChar();
		}
		else if(this._ch == "\\") {
			this.nextChar();
			var name = this.readName();
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.MetaCommand;
			this._syData = name;
		}
		else if(this._ch == ")") {
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.RParensis;
			this.nextChar();
		}
		else if(this._ch == "{") {
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.LBrace;
			this.nextChar();
		}
		else if(this._ch == "}") {
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.RBrace;
			this.nextChar();
		}
		else if(this._ch == "|") {
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.Pipe;
			this.nextChar();
		}
		else if(net.alphatab.file.alphatex.AlphaTexParser.isDigit(this._ch)) {
			var number = this.readNumber();
			this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.Number;
			this._syData = number;
		}
		else if(net.alphatab.file.alphatex.AlphaTexParser.isLetter(this._ch)) {
			var name = this.readName();
			if(net.alphatab.file.alphatex.AlphaTexParser.isTuning(name)) {
				this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.Tuning;
				this._syData = name.toLowerCase();
			}
			else {
				this._sy = net.alphatab.file.alphatex.AlphaTexSymbols.String;
				this._syData = name;
			}
		}
		else {
			this.error("symbol",net.alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
	} while(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.No);
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.nextChar = function() {
	this._ch = (this._curChPos < this.data.getSize()?String.fromCharCode(this.data.readByte()):String.fromCharCode(0));
	this._curChPos++;
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.note = function() {
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number && !(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.String && (Std.string(this._syData).toLowerCase() == "x" || Std.string(this._syData).toLowerCase() == "-"))) {
		this.error("note-fret",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
	}
	var isDead = Std.string(this._syData).toLowerCase() == "x";
	var isTie = Std.string(this._syData).toLowerCase() == "-";
	var fret = (isDead || isTie?0:this._syData);
	this.newSy();
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Dot) {
		this.error("note",net.alphatab.file.alphatex.AlphaTexSymbols.Dot);
	}
	this.newSy();
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
		this.error("note-string",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
	}
	var string = this._syData;
	if(string < 1 || string > this._track.stringCount()) {
		this.error("note-string",net.alphatab.file.alphatex.AlphaTexSymbols.Number,false);
	}
	this.newSy();
	var effect = this.factory.newNoteEffect();
	this.noteEffects(effect);
	var note = this.factory.newNote();
	note.string = string;
	note.effect = effect;
	note.effect.deadNote = isDead;
	note.isTiedNote = isTie;
	note.value = (isTie?this.getTiedNoteValue(string,this._track):fret);
	return note;
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.noteEffects = function(effect) {
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.LBrace) {
		return;
	}
	this.newSy();
	while(this._sy == net.alphatab.file.alphatex.AlphaTexSymbols.MetaCommand) {
		this._syData = Std.string(this._syData).toLowerCase();
		if(this._syData == "b") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.LParensis) {
				this.error("bend-effect",net.alphatab.file.alphatex.AlphaTexSymbols.LParensis);
			}
			this.newSy();
			var points = new Array();
			while(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Eof) {
				if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
					this.error("bend-effect-value",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
				}
				points.push(new net.alphatab.model.effects.BendPoint(0,Math.abs(this._syData),false));
				this.newSy();
			}
			if(points.length > 12) {
				points = points.slice(0,12);
			}
			var count = points.length;
			var step = Math.ceil(12 / count);
			var i = 0;
			var bendEffect = this.factory.newBendEffect();
			while(i < count) {
				points[i].position = Math.floor(Math.min(12,(i * step)));
				bendEffect.points.push(points[i]);
				i++;
			}
			effect.bend = bendEffect;
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.RParensis) {
				this.error("bend-effect",net.alphatab.file.alphatex.AlphaTexSymbols.RParensis);
			}
			this.newSy();
		}
		else if(this._syData == "nh") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = net.alphatab.model.effects.HarmonicType.Natural;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "ah") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = net.alphatab.model.effects.HarmonicType.Artificial;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "th") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = net.alphatab.model.effects.HarmonicType.Tapped;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "ph") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = net.alphatab.model.effects.HarmonicType.Pinch;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "sh") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = net.alphatab.model.effects.HarmonicType.Semi;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "tr") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("trill-effect",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			var fret = this._syData;
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("trill-effect-fret",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			var duration = 0;
			if(this._syData != 16 && this._syData != 32 && this._syData != 64) {
				this._syData = 16;
			}
			duration = this._syData;
			this.newSy();
			var trillEffect = this.factory.newTrillEffect();
			trillEffect.duration.value = duration;
			trillEffect.fret = fret;
			effect.trill = trillEffect;
		}
		else if(this._syData == "tp") {
			this.newSy();
			if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("tremolopicking-effect",net.alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			if(this._syData != 8 && this._syData != 16 && this._syData != 32) {
				this._syData = 8;
			}
			this.newSy();
			var duration = this._syData;
			var tremoloPicking = this.factory.newTremoloPickingEffect();
			tremoloPicking.duration.value = duration;
			effect.tremoloPicking = tremoloPicking;
		}
		else if(this._syData == "v") {
			this.newSy();
			effect.vibrato = true;
		}
		else if(this._syData == "sl") {
			this.newSy();
			effect.slide = true;
			effect.slideType = net.alphatab.model.SlideType.FastSlideTo;
		}
		else if(this._syData == "sf") {
			this.newSy();
			effect.slide = true;
			effect.slideType = net.alphatab.model.SlideType.SlowSlideTo;
		}
		else if(this._syData == "h") {
			this.newSy();
			effect.hammer = true;
		}
		else if(this._syData == "g") {
			this.newSy();
			effect.ghostNote = true;
		}
		else if(this._syData == "ac") {
			this.newSy();
			effect.accentuatedNote = true;
		}
		else if(this._syData == "hac") {
			this.newSy();
			effect.heavyAccentuatedNote = true;
		}
		else if(this._syData == "pm") {
			this.newSy();
			effect.palmMute = true;
		}
		else if(this._syData == "st") {
			this.newSy();
			effect.staccato = true;
		}
		else if(this._syData == "lr") {
			this.newSy();
			effect.letRing = true;
		}
		else {
			this.error("note-effect",net.alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
	}
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.RBrace) {
		this.error("note-effect",net.alphatab.file.alphatex.AlphaTexSymbols.RBrace,false);
	}
	this.newSy();
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.parseClef = function(str) {
	switch(str.toLowerCase()) {
	case "treble":{
		return net.alphatab.model.MeasureClef.Treble;
	}break;
	case "bass":{
		return net.alphatab.model.MeasureClef.Bass;
	}break;
	case "tenor":{
		return net.alphatab.model.MeasureClef.Tenor;
	}break;
	case "alto":{
		return net.alphatab.model.MeasureClef.Alto;
	}break;
	default:{
		return net.alphatab.model.MeasureClef.Treble;
	}break;
	}
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.parseKeySignature = function(str) {
	switch(str.toLowerCase()) {
	case "cb":{
		return -7;
	}break;
	case "gb":{
		return -6;
	}break;
	case "db":{
		return -5;
	}break;
	case "ab":{
		return -4;
	}break;
	case "eb":{
		return -3;
	}break;
	case "bb":{
		return -2;
	}break;
	case "f":{
		return -1;
	}break;
	case "c":{
		return 0;
	}break;
	case "g":{
		return 1;
	}break;
	case "d":{
		return 2;
	}break;
	case "a":{
		return 3;
	}break;
	case "e":{
		return 4;
	}break;
	case "b":{
		return 5;
	}break;
	case "f#":{
		return 6;
	}break;
	case "c#":{
		return 7;
	}break;
	default:{
		return 0;
	}break;
	}
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.parseTuning = function(str) {
	var base = 0;
	var regex = new EReg("([a-g]b?)([0-9])","i");
	if(regex.match(str.toLowerCase())) {
		var note = regex.matched(1);
		var octave = Std.parseInt(regex.matched(2));
		if(note == "c") {
			base = 0;
		}
		else if(note == "db") {
			base = 1;
		}
		else if(note == "d") {
			base = 2;
		}
		else if(note == "eb") {
			base = 3;
		}
		else if(note == "e") {
			base = 4;
		}
		else if(note == "f") {
			base = 5;
		}
		else if(note == "gb") {
			base = 6;
		}
		else if(note == "g") {
			base = 7;
		}
		else if(note == "ab") {
			base = 8;
		}
		else if(note == "a") {
			base = 9;
		}
		else if(note == "bb") {
			base = 10;
		}
		else if(note == "b") {
			base = 11;
		}
		else {
			this.error("tuning-value",net.alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
		base += (octave * 12);
	}
	else {
		this.error("tuning-value",net.alphatab.file.alphatex.AlphaTexSymbols.String,false);
	}
	return base;
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.readName = function() {
	var str = "";
	do {
		str += this._ch;
		this.nextChar();
	} while(net.alphatab.file.alphatex.AlphaTexParser.isLetter(this._ch) || net.alphatab.file.alphatex.AlphaTexParser.isDigit(this._ch));
	return str;
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.readNumber = function() {
	var str = "";
	do {
		str += this._ch;
		this.nextChar();
	} while(net.alphatab.file.alphatex.AlphaTexParser.isDigit(this._ch));
	return Std.parseInt(str);
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.readSong = function() {
	this.createDefaultSong();
	this._curChPos = 0;
	this.nextChar();
	this.newSy();
	this.song();
	return this._song;
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.song = function() {
	this.metaData();
	if(this._sy != net.alphatab.file.alphatex.AlphaTexSymbols.Dot) {
		this.error("song",net.alphatab.file.alphatex.AlphaTexSymbols.Dot);
	}
	this.newSy();
	this.measures();
}
net.alphatab.file.alphatex.AlphaTexParser.prototype.__class__ = net.alphatab.file.alphatex.AlphaTexParser;
Hash = function(p) { if( p === $_ ) return; {
	this.h = {}
	if(this.h.__proto__ != null) {
		this.h.__proto__ = null;
		delete(this.h.__proto__);
	}
	else null;
}}
Hash.__name__ = ["Hash"];
Hash.prototype.exists = function(key) {
	try {
		key = "$" + key;
		return this.hasOwnProperty.call(this.h,key);
	}
	catch( $e2 ) {
		{
			var e = $e2;
			{
				
				for(var i in this.h)
					if( i == key ) return true;
			;
				return false;
			}
		}
	}
}
Hash.prototype.get = function(key) {
	return this.h["$" + key];
}
Hash.prototype.h = null;
Hash.prototype.iterator = function() {
	return { ref : this.h, it : this.keys(), hasNext : function() {
		return this.it.hasNext();
	}, next : function() {
		var i = this.it.next();
		return this.ref["$" + i];
	}}
}
Hash.prototype.keys = function() {
	var a = new Array();
	
			for(var i in this.h)
				a.push(i.substr(1));
		;
	return a.iterator();
}
Hash.prototype.remove = function(key) {
	if(!this.exists(key)) return false;
	delete(this.h["$" + key]);
	return true;
}
Hash.prototype.set = function(key,value) {
	this.h["$" + key] = value;
}
Hash.prototype.toString = function() {
	var s = new StringBuf();
	s.b[s.b.length] = "{";
	var it = this.keys();
	{ var $it3 = it;
	while( $it3.hasNext() ) { var i = $it3.next();
	{
		s.b[s.b.length] = i;
		s.b[s.b.length] = " => ";
		s.b[s.b.length] = Std.string(this.get(i));
		if(it.hasNext()) s.b[s.b.length] = ", ";
	}
	}}
	s.b[s.b.length] = "}";
	return s.b.join("");
}
Hash.prototype.__class__ = Hash;
IntHash = function(p) { if( p === $_ ) return; {
	this.h = {}
	if(this.h.__proto__ != null) {
		this.h.__proto__ = null;
		delete(this.h.__proto__);
	}
	else null;
}}
IntHash.__name__ = ["IntHash"];
IntHash.prototype.exists = function(key) {
	return this.h[key] != null;
}
IntHash.prototype.get = function(key) {
	return this.h[key];
}
IntHash.prototype.h = null;
IntHash.prototype.iterator = function() {
	return { ref : this.h, it : this.keys(), hasNext : function() {
		return this.it.hasNext();
	}, next : function() {
		var i = this.it.next();
		return this.ref[i];
	}}
}
IntHash.prototype.keys = function() {
	var a = new Array();
	
			for( x in this.h )
				a.push(x);
		;
	return a.iterator();
}
IntHash.prototype.remove = function(key) {
	if(this.h[key] == null) return false;
	delete(this.h[key]);
	return true;
}
IntHash.prototype.set = function(key,value) {
	this.h[key] = value;
}
IntHash.prototype.toString = function() {
	var s = new StringBuf();
	s.b[s.b.length] = "{";
	var it = this.keys();
	{ var $it4 = it;
	while( $it4.hasNext() ) { var i = $it4.next();
	{
		s.b[s.b.length] = i;
		s.b[s.b.length] = " => ";
		s.b[s.b.length] = Std.string(this.get(i));
		if(it.hasNext()) s.b[s.b.length] = ", ";
	}
	}}
	s.b[s.b.length] = "}";
	return s.b.join("");
}
IntHash.prototype.__class__ = IntHash;
net.alphatab.model.MeasureClefConverter = function() { }
net.alphatab.model.MeasureClefConverter.__name__ = ["net","alphatab","model","MeasureClefConverter"];
net.alphatab.model.MeasureClefConverter.toInt = function(clef) {
	switch(clef) {
	case net.alphatab.model.MeasureClef.Treble:{
		return 1;
	}break;
	case net.alphatab.model.MeasureClef.Bass:{
		return 2;
	}break;
	case net.alphatab.model.MeasureClef.Tenor:{
		return 3;
	}break;
	case net.alphatab.model.MeasureClef.Alto:{
		return 4;
	}break;
	default:{
		return 1;
	}break;
	}
}
net.alphatab.model.MeasureClefConverter.toString = function(clef) {
	switch(clef) {
	case net.alphatab.model.MeasureClef.Treble:{
		return "treble";
	}break;
	case net.alphatab.model.MeasureClef.Bass:{
		return "bass";
	}break;
	case net.alphatab.model.MeasureClef.Tenor:{
		return "tenor";
	}break;
	case net.alphatab.model.MeasureClef.Alto:{
		return "alto";
	}break;
	default:{
		return "treble";
	}break;
	}
}
net.alphatab.model.MeasureClefConverter.prototype.__class__ = net.alphatab.model.MeasureClefConverter;
net.alphatab.model.effects.BendTypes = { __ename__ : ["net","alphatab","model","effects","BendTypes"], __constructs__ : ["None","Bend","BendRelease","BendReleaseBend","Prebend","PrebendRelease","Dip","Dive","ReleaseUp","InvertedDip","Return","ReleaseDown"] }
net.alphatab.model.effects.BendTypes.Bend = ["Bend",1];
net.alphatab.model.effects.BendTypes.Bend.toString = $estr;
net.alphatab.model.effects.BendTypes.Bend.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.BendRelease = ["BendRelease",2];
net.alphatab.model.effects.BendTypes.BendRelease.toString = $estr;
net.alphatab.model.effects.BendTypes.BendRelease.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.BendReleaseBend = ["BendReleaseBend",3];
net.alphatab.model.effects.BendTypes.BendReleaseBend.toString = $estr;
net.alphatab.model.effects.BendTypes.BendReleaseBend.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.Dip = ["Dip",6];
net.alphatab.model.effects.BendTypes.Dip.toString = $estr;
net.alphatab.model.effects.BendTypes.Dip.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.Dive = ["Dive",7];
net.alphatab.model.effects.BendTypes.Dive.toString = $estr;
net.alphatab.model.effects.BendTypes.Dive.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.InvertedDip = ["InvertedDip",9];
net.alphatab.model.effects.BendTypes.InvertedDip.toString = $estr;
net.alphatab.model.effects.BendTypes.InvertedDip.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.None = ["None",0];
net.alphatab.model.effects.BendTypes.None.toString = $estr;
net.alphatab.model.effects.BendTypes.None.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.Prebend = ["Prebend",4];
net.alphatab.model.effects.BendTypes.Prebend.toString = $estr;
net.alphatab.model.effects.BendTypes.Prebend.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.PrebendRelease = ["PrebendRelease",5];
net.alphatab.model.effects.BendTypes.PrebendRelease.toString = $estr;
net.alphatab.model.effects.BendTypes.PrebendRelease.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.ReleaseDown = ["ReleaseDown",11];
net.alphatab.model.effects.BendTypes.ReleaseDown.toString = $estr;
net.alphatab.model.effects.BendTypes.ReleaseDown.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.ReleaseUp = ["ReleaseUp",8];
net.alphatab.model.effects.BendTypes.ReleaseUp.toString = $estr;
net.alphatab.model.effects.BendTypes.ReleaseUp.__enum__ = net.alphatab.model.effects.BendTypes;
net.alphatab.model.effects.BendTypes.Return = ["Return",10];
net.alphatab.model.effects.BendTypes.Return.toString = $estr;
net.alphatab.model.effects.BendTypes.Return.__enum__ = net.alphatab.model.effects.BendTypes;
if(typeof haxe=='undefined') haxe = {}
if(!haxe.remoting) haxe.remoting = {}
haxe.remoting.Context = function(p) { if( p === $_ ) return; {
	this.objects = new Hash();
}}
haxe.remoting.Context.__name__ = ["haxe","remoting","Context"];
haxe.remoting.Context.share = function(name,obj) {
	var ctx = new haxe.remoting.Context();
	ctx.addObject(name,obj);
	return ctx;
}
haxe.remoting.Context.prototype.addObject = function(name,obj,recursive) {
	this.objects.set(name,{ obj : obj, rec : recursive});
}
haxe.remoting.Context.prototype.call = function(path,params) {
	if(path.length < 2) throw ("Invalid path '" + path.join(".")) + "'";
	var inf = this.objects.get(path[0]);
	if(inf == null) throw "No such object " + path[0];
	var o = inf.obj;
	var m = Reflect.field(o,path[1]);
	if(path.length > 2) {
		if(!inf.rec) throw "Can't access " + path.join(".");
		{
			var _g1 = 2, _g = path.length;
			while(_g1 < _g) {
				var i = _g1++;
				o = m;
				m = Reflect.field(o,path[i]);
			}
		}
	}
	if(!Reflect.isFunction(m)) throw "No such method " + path.join(".");
	return m.apply(o,params);
}
haxe.remoting.Context.prototype.objects = null;
haxe.remoting.Context.prototype.__class__ = haxe.remoting.Context;
net.alphatab.model.Track = function(factory) { if( factory === $_ ) return; {
	this.number = 0;
	this.offset = 0;
	this.isSolo = false;
	this.isMute = false;
	this.name = "";
	this.measures = new Array();
	this.strings = new Array();
	this.channel = factory.newMidiChannel();
	this.color = new net.alphatab.model.Color(255,0,0);
}}
net.alphatab.model.Track.__name__ = ["net","alphatab","model","Track"];
net.alphatab.model.Track.prototype.addMeasure = function(measure) {
	measure.track = this;
	this.measures.push(measure);
}
net.alphatab.model.Track.prototype.channel = null;
net.alphatab.model.Track.prototype.color = null;
net.alphatab.model.Track.prototype.fretCount = null;
net.alphatab.model.Track.prototype.is12StringedGuitarTrack = null;
net.alphatab.model.Track.prototype.isBanjoTrack = null;
net.alphatab.model.Track.prototype.isMute = null;
net.alphatab.model.Track.prototype.isPercussionTrack = null;
net.alphatab.model.Track.prototype.isSolo = null;
net.alphatab.model.Track.prototype.measureCount = function() {
	return this.measures.length;
}
net.alphatab.model.Track.prototype.measures = null;
net.alphatab.model.Track.prototype.name = null;
net.alphatab.model.Track.prototype.number = null;
net.alphatab.model.Track.prototype.offset = null;
net.alphatab.model.Track.prototype.port = null;
net.alphatab.model.Track.prototype.song = null;
net.alphatab.model.Track.prototype.stringCount = function() {
	return this.strings.length;
}
net.alphatab.model.Track.prototype.strings = null;
net.alphatab.model.Track.prototype.__class__ = net.alphatab.model.Track;
net.alphatab.tablature.model.TrackImpl = function(factory) { if( factory === $_ ) return; {
	net.alphatab.model.Track.apply(this,[factory]);
}}
net.alphatab.tablature.model.TrackImpl.__name__ = ["net","alphatab","tablature","model","TrackImpl"];
net.alphatab.tablature.model.TrackImpl.__super__ = net.alphatab.model.Track;
for(var k in net.alphatab.model.Track.prototype ) net.alphatab.tablature.model.TrackImpl.prototype[k] = net.alphatab.model.Track.prototype[k];
net.alphatab.tablature.model.TrackImpl.prototype.previousBeat = null;
net.alphatab.tablature.model.TrackImpl.prototype.scoreHeight = null;
net.alphatab.tablature.model.TrackImpl.prototype.tabHeight = null;
net.alphatab.tablature.model.TrackImpl.prototype.update = function(layout) {
	this.tabHeight = Math.round((this.stringCount() - 1) * layout.stringSpacing);
	this.scoreHeight = Math.round(layout.scoreLineSpacing * 4);
}
net.alphatab.tablature.model.TrackImpl.prototype.__class__ = net.alphatab.tablature.model.TrackImpl;
StringTools = function() { }
StringTools.__name__ = ["StringTools"];
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
}
StringTools.urlDecode = function(s) {
	return decodeURIComponent(s.split("+").join(" "));
}
StringTools.htmlEscape = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
StringTools.htmlUnescape = function(s) {
	return s.split("&gt;").join(">").split("&lt;").join("<").split("&amp;").join("&");
}
StringTools.startsWith = function(s,start) {
	return (s.length >= start.length && s.substr(0,start.length) == start);
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return (slen >= elen && s.substr(slen - elen,elen) == end);
}
StringTools.isSpace = function(s,pos) {
	var c = s.charCodeAt(pos);
	return (c >= 9 && c <= 13) || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) {
		r++;
	}
	if(r > 0) return s.substr(r,l - r);
	else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,(l - r) - 1)) {
		r++;
	}
	if(r > 0) {
		return s.substr(0,l - r);
	}
	else {
		return s;
	}
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.rpad = function(s,c,l) {
	var sl = s.length;
	var cl = c.length;
	while(sl < l) {
		if(l - sl < cl) {
			s += c.substr(0,l - sl);
			sl = l;
		}
		else {
			s += c;
			sl += cl;
		}
	}
	return s;
}
StringTools.lpad = function(s,c,l) {
	var ns = "";
	var sl = s.length;
	if(sl >= l) return s;
	var cl = c.length;
	while(sl < l) {
		if(l - sl < cl) {
			ns += c.substr(0,l - sl);
			sl = l;
		}
		else {
			ns += c;
			sl += cl;
		}
	}
	return ns + s;
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
StringTools.hex = function(n,digits) {
	var neg = false;
	if(n < 0) {
		neg = true;
		n = -n;
	}
	var s = n.toString(16);
	s = s.toUpperCase();
	if(digits != null) while(s.length < digits) s = "0" + s;
	if(neg) s = "-" + s;
	return s;
}
StringTools.prototype.__class__ = StringTools;
net.alphatab.model.BeatText = function(p) { if( p === $_ ) return; {
	null;
}}
net.alphatab.model.BeatText.__name__ = ["net","alphatab","model","BeatText"];
net.alphatab.model.BeatText.prototype.beat = null;
net.alphatab.model.BeatText.prototype.value = null;
net.alphatab.model.BeatText.prototype.__class__ = net.alphatab.model.BeatText;
net.alphatab.tablature.model.BeatTextImpl = function(p) { if( p === $_ ) return; {
	net.alphatab.model.BeatText.apply(this,[]);
}}
net.alphatab.tablature.model.BeatTextImpl.__name__ = ["net","alphatab","tablature","model","BeatTextImpl"];
net.alphatab.tablature.model.BeatTextImpl.__super__ = net.alphatab.model.BeatText;
for(var k in net.alphatab.model.BeatText.prototype ) net.alphatab.tablature.model.BeatTextImpl.prototype[k] = net.alphatab.model.BeatText.prototype[k];
net.alphatab.tablature.model.BeatTextImpl.prototype.paint = function(layout,context,x,y) {
	var beat = this.beat;
	var measure = beat.measureImpl();
	var realX = (x + beat.spacing()) + beat.posX;
	var realY = y + measure.ts.get(net.alphatab.tablature.TrackSpacingPositions.Text);
	context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1).addString(this.value,net.alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
}
net.alphatab.tablature.model.BeatTextImpl.prototype.__class__ = net.alphatab.tablature.model.BeatTextImpl;
haxe.remoting.FlashJsConnection = function() { }
haxe.remoting.FlashJsConnection.__name__ = ["haxe","remoting","FlashJsConnection"];
haxe.remoting.FlashJsConnection.flashCall = function(flashObj,name,path,params) {
	try {
		var fobj = window.document[flashObj];
		if(fobj == null) fobj = window.document.getElementById[flashObj];
		if(fobj == null) throw ("Could not find flash object '" + flashObj) + "'";
		var data = null;
		try {
			data = fobj.flashJsRemotingCall(name,path,params);
		}
		catch( $e5 ) {
			{
				var e = $e5;
				null;
			}
		}
		if(data == null) throw ("Flash object " + flashObj) + " does not have an active FlashJsConnection";
		return data;
	}
	catch( $e6 ) {
		{
			var e = $e6;
			{
				var s = new haxe.Serializer();
				s.serializeException(e);
				return s.toString();
			}
		}
	}
}
haxe.remoting.FlashJsConnection.prototype.__class__ = haxe.remoting.FlashJsConnection;
if(!haxe.io) haxe.io = {}
haxe.io.Bytes = function(length,b) { if( length === $_ ) return; {
	this.length = length;
	this.b = b;
}}
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			a.push(0);
		}
	}
	return new haxe.io.Bytes(length,a);
}
haxe.io.Bytes.ofString = function(s) {
	var a = new Array();
	{
		var _g1 = 0, _g = s.length;
		while(_g1 < _g) {
			var i = _g1++;
			var c = s["cca"](i);
			if(c <= 127) a.push(c);
			else if(c <= 2047) {
				a.push(192 | (c >> 6));
				a.push(128 | (c & 63));
			}
			else if(c <= 65535) {
				a.push(224 | (c >> 12));
				a.push(128 | ((c >> 6) & 63));
				a.push(128 | (c & 63));
			}
			else {
				a.push(240 | (c >> 18));
				a.push(128 | ((c >> 12) & 63));
				a.push(128 | ((c >> 6) & 63));
				a.push(128 | (c & 63));
			}
		}
	}
	return new haxe.io.Bytes(a.length,a);
}
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
}
haxe.io.Bytes.prototype.b = null;
haxe.io.Bytes.prototype.blit = function(pos,src,srcpos,len) {
	if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe.io.Error.OutsideBounds;
	var b1 = this.b;
	var b2 = src.b;
	if(b1 == b2 && pos > srcpos) {
		var i = len;
		while(i > 0) {
			i--;
			b1[i + pos] = b2[i + srcpos];
		}
		return;
	}
	{
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b1[i + pos] = b2[i + srcpos];
		}
	}
}
haxe.io.Bytes.prototype.compare = function(other) {
	var b1 = this.b;
	var b2 = other.b;
	var len = ((this.length < other.length)?this.length:other.length);
	{
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			if(b1[i] != b2[i]) return b1[i] - b2[i];
		}
	}
	return this.length - other.length;
}
haxe.io.Bytes.prototype.get = function(pos) {
	return this.b[pos];
}
haxe.io.Bytes.prototype.getData = function() {
	return this.b;
}
haxe.io.Bytes.prototype.length = null;
haxe.io.Bytes.prototype.readString = function(pos,len) {
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	var s = "";
	var b = this.b;
	var fcc = $closure(String,"fromCharCode");
	var i = pos;
	var max = pos + len;
	while(i < max) {
		var c = b[i++];
		if(c < 128) {
			if(c == 0) break;
			s += fcc(c);
		}
		else if(c < 224) s += fcc(((c & 63) << 6) | (b[i++] & 127));
		else if(c < 240) {
			var c2 = b[i++];
			s += fcc((((c & 31) << 12) | ((c2 & 127) << 6)) | (b[i++] & 127));
		}
		else {
			var c2 = b[i++];
			var c3 = b[i++];
			s += fcc(((((c & 15) << 18) | ((c2 & 127) << 12)) | ((c3 << 6) & 127)) | (b[i++] & 127));
		}
	}
	return s;
}
haxe.io.Bytes.prototype.set = function(pos,v) {
	this.b[pos] = (v & 255);
}
haxe.io.Bytes.prototype.sub = function(pos,len) {
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	return new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
}
haxe.io.Bytes.prototype.toString = function() {
	return this.readString(0,this.length);
}
haxe.io.Bytes.prototype.__class__ = haxe.io.Bytes;
net.alphatab.model.LyricLine = function(startingMeasure,lyrics) { if( startingMeasure === $_ ) return; {
	if(lyrics == null) lyrics = "";
	if(startingMeasure == null) startingMeasure = 0;
	this.startingMeasure = startingMeasure;
	this.lyrics = lyrics;
}}
net.alphatab.model.LyricLine.__name__ = ["net","alphatab","model","LyricLine"];
net.alphatab.model.LyricLine.prototype.lyrics = null;
net.alphatab.model.LyricLine.prototype.startingMeasure = null;
net.alphatab.model.LyricLine.prototype.__class__ = net.alphatab.model.LyricLine;
net.alphatab.model.Velocities = function() { }
net.alphatab.model.Velocities.__name__ = ["net","alphatab","model","Velocities"];
net.alphatab.model.Velocities.prototype.__class__ = net.alphatab.model.Velocities;
if(!net.alphatab.file.guitarpro) net.alphatab.file.guitarpro = {}
net.alphatab.file.guitarpro.GpReaderBase = function(p) { if( p === $_ ) return; {
	net.alphatab.file.SongReader.apply(this,[]);
}}
net.alphatab.file.guitarpro.GpReaderBase.__name__ = ["net","alphatab","file","guitarpro","GpReaderBase"];
net.alphatab.file.guitarpro.GpReaderBase.__super__ = net.alphatab.file.SongReader;
for(var k in net.alphatab.file.SongReader.prototype ) net.alphatab.file.guitarpro.GpReaderBase.prototype[k] = net.alphatab.file.SongReader.prototype[k];
net.alphatab.file.guitarpro.GpReaderBase.toChannelShort = function(data) {
	var value = Math.floor(Math.max(-32768,Math.min(32767,(data * 8) - 1)));
	return Math.floor(Math.max(value,-1));
}
net.alphatab.file.guitarpro.GpReaderBase.prototype._supportedVersions = null;
net.alphatab.file.guitarpro.GpReaderBase.prototype._version = null;
net.alphatab.file.guitarpro.GpReaderBase.prototype._versionIndex = null;
net.alphatab.file.guitarpro.GpReaderBase.prototype.initVersions = function(supportedVersions) {
	this._supportedVersions = supportedVersions;
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.read = function() {
	return this.readByte();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readBool = function() {
	return this.data.readByte() == 1;
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readByte = function() {
	var data = this.data.readByte() & 255;
	return (data > 127?-256 + data:data);
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readByteSizeCheckByteString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.readByteSizeString((this.readUnsignedByte() - 1),charset);
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readByteSizeString = function(size,charset) {
	if(charset == null) charset = "UTF-8";
	return this.readString(size,this.readUnsignedByte(),charset);
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readDouble = function() {
	return this.data.readDouble();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readInt = function() {
	return (this.data.readInt32());
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readIntSizeCheckByteString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.readByteSizeString((this.readInt() - 1),charset);
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readIntSizeString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.readString(this.readInt(),-2,charset);
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readString = function(size,len,charset) {
	if(charset == null) charset = "UTF-8";
	if(len == null) len = -2;
	if(len == -2) len = size;
	var count = ((size > 0?size:len));
	var s = this.readStringInternal(count);
	return s.substr(0,((len >= 0?len:size)));
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readStringInternal = function(length) {
	var text = "";
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			text += String.fromCharCode(this.readByte());
		}
	}
	return text;
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readUnsignedByte = function() {
	return this.data.readByte();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.readVersion = function() {
	try {
		if(this._version == null) {
			this._version = this.readByteSizeString(30,"UTF-8");
		}
		{
			var _g1 = 0, _g = this._supportedVersions.length;
			while(_g1 < _g) {
				var i = _g1++;
				var current = this._supportedVersions[i];
				if(this._version == current) {
					this._versionIndex = i;
					return true;
				}
			}
		}
	}
	catch( $e7 ) {
		{
			var e = $e7;
			{
				this._version = "Not Supported";
			}
		}
	}
	return false;
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.skip = function(count) {
	var _g = 0;
	while(_g < count) {
		var i = _g++;
		this.data.readByte();
	}
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.__class__ = net.alphatab.file.guitarpro.GpReaderBase;
net.alphatab.file.guitarpro.Gp3Reader = function(p) { if( p === $_ ) return; {
	net.alphatab.file.guitarpro.GpReaderBase.apply(this,[]);
	this.initVersions(["FICHIER GUITAR PRO v3.00"]);
}}
net.alphatab.file.guitarpro.Gp3Reader.__name__ = ["net","alphatab","file","guitarpro","Gp3Reader"];
net.alphatab.file.guitarpro.Gp3Reader.__super__ = net.alphatab.file.guitarpro.GpReaderBase;
for(var k in net.alphatab.file.guitarpro.GpReaderBase.prototype ) net.alphatab.file.guitarpro.Gp3Reader.prototype[k] = net.alphatab.file.guitarpro.GpReaderBase.prototype[k];
net.alphatab.file.guitarpro.Gp3Reader.toKeySignature = function(p) {
	return (p < 0?7 + Math.round(Math.abs(p)):p);
}
net.alphatab.file.guitarpro.Gp3Reader.toStrokeValue = function(value) {
	switch(value) {
	case 1:{
		return 64;
	}break;
	case 2:{
		return 64;
	}break;
	case 3:{
		return 32;
	}break;
	case 4:{
		return 16;
	}break;
	case 5:{
		return 8;
	}break;
	case 6:{
		return 4;
	}break;
	default:{
		return 64;
	}break;
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype._tripletFeel = null;
net.alphatab.file.guitarpro.Gp3Reader.prototype.getBeat = function(measure,start) {
	{
		var _g1 = 0, _g = measure.beats.length;
		while(_g1 < _g) {
			var b = _g1++;
			var beat = measure.beats[b];
			if(beat.start == start) return beat;
		}
	}
	var newBeat = this.factory.newBeat();
	newBeat.start = start;
	measure.addBeat(newBeat);
	return newBeat;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.parseRepeatAlternative = function(song,measure,value) {
	var repeatAlternative = 0;
	var existentAlternatives = 0;
	{
		var _g1 = 0, _g = song.measureHeaders.length;
		while(_g1 < _g) {
			var i = _g1++;
			var header = song.measureHeaders[i];
			if(header.number == measure) break;
			if(header.isRepeatOpen) existentAlternatives = 0;
			existentAlternatives |= header.repeatAlternative;
		}
	}
	{
		var _g = 0;
		while(_g < 8) {
			var i = _g++;
			if(value > i && (existentAlternatives & (1 << i)) == 0) {
				repeatAlternative |= (1 << i);
			}
		}
	}
	return repeatAlternative;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readBeat = function(start,measure,track,voiceIndex) {
	var flags = this.readUnsignedByte();
	var beat = this.getBeat(measure,start);
	var voice = beat.voices[voiceIndex];
	if((flags & 64) != 0) {
		var beatType = this.readUnsignedByte();
		voice.isEmpty = ((beatType & 2) == 0);
	}
	var duration = this.readDuration(flags);
	var effect = this.factory.newNoteEffect();
	if((flags & 2) != 0) {
		this.readChord(track.stringCount(),beat);
	}
	if((flags & 4) != 0) {
		this.readText(beat);
	}
	if((flags & 8) != 0) {
		this.readBeatEffects(beat,effect);
	}
	if((flags & 16) != 0) {
		var mixTableChange = this.readMixTableChange(measure);
		beat.effect.mixTableChange = mixTableChange;
	}
	var stringFlags = this.readUnsignedByte();
	{
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & (1 << i)) != 0 && (6 - i) < track.stringCount()) {
				var guitarString = track.strings[6 - i].clone(this.factory);
				var note = this.readNote(guitarString,track,effect.clone(this.factory));
				voice.addNote(note);
			}
			duration.copy(voice.duration);
		}
	}
	return ((!voice.isEmpty)?duration.time():0);
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readBeatEffects = function(beat,effect) {
	var flags1 = this.readUnsignedByte();
	beat.effect.fadeIn = (((flags1 & 16) != 0));
	beat.effect.vibrato = (((flags1 & 2) != 0)) || beat.effect.vibrato;
	if((flags1 & 32) != 0) {
		var slapEffect = this.readUnsignedByte();
		if(slapEffect == 0) {
			this.readTremoloBar(beat.effect);
		}
		else {
			beat.effect.tapping = (slapEffect == 1);
			beat.effect.slapping = (slapEffect == 2);
			beat.effect.popping = (slapEffect == 3);
			this.readInt();
		}
	}
	if((flags1 & 64) != 0) {
		var strokeUp = this.readByte();
		var strokeDown = this.readByte();
		if(strokeUp > 0) {
			beat.effect.stroke.direction = net.alphatab.model.BeatStrokeDirection.Up;
			beat.effect.stroke.value = (net.alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.effect.stroke.direction = net.alphatab.model.BeatStrokeDirection.Down;
			beat.effect.stroke.value = (net.alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeDown));
		}
	}
	if((flags1 & 4) != 0) {
		var harmonic = this.factory.newHarmonicEffect();
		harmonic.type = (net.alphatab.model.effects.HarmonicType.Natural);
		effect.harmonic = (harmonic);
	}
	if((flags1 & 8) != 0) {
		var harmonic = this.factory.newHarmonicEffect();
		harmonic.type = (net.alphatab.model.effects.HarmonicType.Artificial);
		harmonic.data = 0;
		effect.harmonic = (harmonic);
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readBend = function(noteEffect) {
	var bendEffect = this.factory.newBendEffect();
	bendEffect.type = net.alphatab.model.effects.BendTypesConverter.fromInt(this.readByte());
	bendEffect.value = this.readInt();
	var pointCount = this.readInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.readInt() * 12) / 60);
			var pointValue = Math.round(this.readInt() / 25);
			var vibrato = this.readBool();
			bendEffect.points.push(new net.alphatab.model.effects.BendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) noteEffect.bend = bendEffect;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readChannel = function(midiChannel,channels) {
	var index = (this.readInt() - 1);
	var effectChannel = (this.readInt() - 1);
	if(index >= 0 && index < channels.length) {
		channels[index].copy(midiChannel);
		if(midiChannel.instrument() < 0) {
			midiChannel.instrument(0);
		}
		if(!midiChannel.isPercussionChannel()) {
			midiChannel.effectChannel = (effectChannel);
		}
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readChord = function(stringCount,beat) {
	var chord = this.factory.newChord(stringCount);
	if((this.readUnsignedByte() & 1) == 0) {
		chord.name = (this.readIntSizeCheckByteString());
		chord.firstFret = (this.readInt());
		if(chord.firstFret != 0) {
			{
				var _g = 0;
				while(_g < 6) {
					var i = _g++;
					var fret = this.readInt();
					if(i < chord.strings.length) {
						chord.strings[i] = fret;
					}
				}
			}
		}
	}
	else {
		this.skip(25);
		chord.name = (this.readByteSizeString(34));
		chord.firstFret = (this.readInt());
		{
			var _g = 0;
			while(_g < 6) {
				var i = _g++;
				var fret = this.readInt();
				if(i < chord.strings.length) {
					chord.strings[i] = fret;
				}
			}
		}
		this.skip(36);
	}
	if(chord.noteCount() > 0) {
		beat.setChord(chord);
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readColor = function() {
	var r = (this.readUnsignedByte());
	var g = this.readUnsignedByte();
	var b = (this.readUnsignedByte());
	this.skip(1);
	return new net.alphatab.model.Color(r,g,b);
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readDuration = function(flags) {
	var duration = this.factory.newDuration();
	duration.value = Math.round(Math.pow(2,(this.readByte() + 4)) / 4);
	duration.isDotted = (((flags & 1) != 0));
	if((flags & 32) != 0) {
		var iTuplet = this.readInt();
		switch(iTuplet) {
		case 3:{
			duration.tuplet.enters = 3;
			duration.tuplet.times = 2;
		}break;
		case 5:{
			duration.tuplet.enters = 5;
			duration.tuplet.times = 4;
		}break;
		case 6:{
			duration.tuplet.enters = 6;
			duration.tuplet.times = 4;
		}break;
		case 7:{
			duration.tuplet.enters = 7;
			duration.tuplet.times = 4;
		}break;
		case 9:{
			duration.tuplet.enters = 9;
			duration.tuplet.times = 8;
		}break;
		case 10:{
			duration.tuplet.enters = 10;
			duration.tuplet.times = 8;
		}break;
		case 11:{
			duration.tuplet.enters = 11;
			duration.tuplet.times = 8;
		}break;
		case 12:{
			duration.tuplet.enters = 12;
			duration.tuplet.times = 8;
		}break;
		}
	}
	return duration;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readGrace = function(noteEffect) {
	var fret = this.readUnsignedByte();
	var dyn = this.readUnsignedByte();
	var transition = this.readByte();
	var duration = this.readUnsignedByte();
	var grace = this.factory.newGraceEffect();
	grace.fret = (fret);
	grace.velocity = ((15 + (16 * dyn)) - 16);
	grace.duration = (duration);
	grace.isDead = fret == 255;
	grace.isOnBeat = false;
	switch(transition) {
	case 0:{
		grace.transition = net.alphatab.model.effects.GraceEffectTransition.None;
	}break;
	case 1:{
		grace.transition = net.alphatab.model.effects.GraceEffectTransition.Slide;
	}break;
	case 2:{
		grace.transition = net.alphatab.model.effects.GraceEffectTransition.Bend;
	}break;
	case 3:{
		grace.transition = net.alphatab.model.effects.GraceEffectTransition.Hammer;
	}break;
	}
	noteEffect.grace = (grace);
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readInfo = function(song) {
	song.title = (this.readIntSizeCheckByteString());
	song.subtitle = this.readIntSizeCheckByteString();
	song.artist = (this.readIntSizeCheckByteString());
	song.album = (this.readIntSizeCheckByteString());
	song.words = (this.readIntSizeCheckByteString());
	song.music = song.words;
	song.copyright = this.readIntSizeCheckByteString();
	song.tab = this.readIntSizeCheckByteString();
	song.instructions = this.readIntSizeCheckByteString();
	var iNotes = this.readInt();
	song.notice = "";
	{
		var _g = 0;
		while(_g < iNotes) {
			var i = _g++;
			song.notice += this.readIntSizeCheckByteString() + "\n";
		}
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readLyrics = function(song) {
	song.lyrics = this.factory.newLyrics();
	song.lyrics.trackChoice = this.readInt();
	{
		var _g = 0;
		while(_g < 5) {
			var i = _g++;
			var line = this.factory.newLyricLine();
			line.startingMeasure = this.readInt();
			line.lyrics = this.readIntSizeString();
			song.lyrics.lines.push(line);
		}
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readMarker = function(header) {
	var marker = this.factory.newMarker();
	marker.measureHeader = header;
	marker.title = this.readIntSizeCheckByteString();
	marker.color = this.readColor();
	return marker;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readMeasure = function(measure,track) {
	var start = measure.start();
	var beats = this.readInt();
	{
		var _g = 0;
		while(_g < beats) {
			var beat = _g++;
			start += this.readBeat(start,measure,track,0);
		}
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readMeasureHeader = function(i,timeSignature,song) {
	var flags = this.readUnsignedByte();
	var header = this.factory.newMeasureHeader();
	header.number = i + 1;
	header.start = 0;
	header.tempo.value = song.tempo;
	header.tripletFeel = this._tripletFeel;
	if((flags & 1) != 0) timeSignature.numerator = this.readByte();
	if((flags & 2) != 0) timeSignature.denominator.value = this.readByte();
	header.isRepeatOpen = ((flags & 4) != 0);
	timeSignature.copy(header.timeSignature);
	if((flags & 8) != 0) header.repeatClose = (this.readByte() - 1);
	if((flags & 16) != 0) header.repeatAlternative = this.parseRepeatAlternative(song,header.number,this.readUnsignedByte());
	if((flags & 32) != 0) header.marker = this.readMarker(header);
	if((flags & 64) != 0) {
		header.keySignatureType = net.alphatab.file.guitarpro.Gp3Reader.toKeySignature(this.readByte());
		header.keySignatureType = this.readByte();
	}
	else if(header.number > 1) {
		header.keySignature = song.measureHeaders[i - 1].keySignature;
		header.keySignatureType = song.measureHeaders[i - 1].keySignatureType;
	}
	header.hasDoubleBar = (flags & 128) != 0;
	return header;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readMeasureHeaders = function(song,measureCount) {
	var timeSignature = this.factory.newTimeSignature();
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.addMeasureHeader(this.readMeasureHeader(i,timeSignature,song));
		}
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readMeasures = function(song) {
	var tempo = this.factory.newTempo();
	tempo.value = song.tempo;
	var start = 960;
	{
		var _g1 = 0, _g = song.measureHeaders.length;
		while(_g1 < _g) {
			var h = _g1++;
			var header = song.measureHeaders[h];
			header.start = start;
			{
				var _g3 = 0, _g2 = song.tracks.length;
				while(_g3 < _g2) {
					var t = _g3++;
					var track = song.tracks[t];
					var measure = this.factory.newMeasure(header);
					header.tempo.copy(tempo);
					track.addMeasure(measure);
					this.readMeasure(measure,track);
				}
			}
			tempo.copy(header.tempo);
			start += header.length();
		}
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readMidiChannels = function() {
	var channels = new Array();
	{
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.factory.newMidiChannel();
			newChannel.channel = (i);
			newChannel.effectChannel = (i);
			newChannel.instrument(this.readInt());
			newChannel.volume = (net.alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.balance = (net.alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.chorus = (net.alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.reverb = (net.alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.phaser = (net.alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.tremolo = (net.alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			channels.push(newChannel);
			this.skip(2);
		}
	}
	return channels;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readMixTableChange = function(measure) {
	var tableChange = this.factory.newMixTableChange();
	tableChange.instrument.value = this.readByte();
	tableChange.volume.value = this.readByte();
	tableChange.balance.value = this.readByte();
	tableChange.chorus.value = this.readByte();
	tableChange.reverb.value = this.readByte();
	tableChange.phaser.value = this.readByte();
	tableChange.tremolo.value = this.readByte();
	tableChange.tempoName = this.readIntSizeCheckByteString();
	tableChange.tempo.value = this.readInt();
	if(tableChange.instrument.value < 0) tableChange.instrument = null;
	if(tableChange.volume.value >= 0) tableChange.volume.duration = this.readByte();
	else tableChange.volume = null;
	if(tableChange.balance.value >= 0) tableChange.balance.duration = this.readByte();
	else tableChange.balance = null;
	if(tableChange.chorus.value >= 0) tableChange.chorus.duration = this.readByte();
	else tableChange.chorus = null;
	if(tableChange.reverb.value >= 0) tableChange.reverb.duration = this.readByte();
	else tableChange.reverb = null;
	if(tableChange.phaser.value >= 0) tableChange.phaser.duration = this.readByte();
	else tableChange.phaser = null;
	if(tableChange.tremolo.value >= 0) tableChange.tremolo.duration = this.readByte();
	else tableChange.tremolo = null;
	if(tableChange.tempo.value >= 0) {
		tableChange.tempo.duration = this.readByte();
		measure.tempo().value = tableChange.tempo.value;
		tableChange.hideTempo = false;
	}
	else tableChange.tempo = null;
	var allTracksFlags = this.readUnsignedByte();
	if(tableChange.volume != null) tableChange.volume.allTracks = (allTracksFlags & 1) != 0;
	if(tableChange.balance != null) tableChange.balance.allTracks = (allTracksFlags & 2) != 0;
	if(tableChange.chorus != null) tableChange.chorus.allTracks = (allTracksFlags & 4) != 0;
	if(tableChange.reverb != null) tableChange.reverb.allTracks = (allTracksFlags & 8) != 0;
	if(tableChange.phaser != null) tableChange.phaser.allTracks = (allTracksFlags & 16) != 0;
	if(tableChange.tremolo != null) tableChange.tremolo.allTracks = (allTracksFlags & 32) != 0;
	if(tableChange.tempo != null) tableChange.tempo.allTracks = true;
	return tableChange;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readNote = function(guitarString,track,effect) {
	var flags = this.readUnsignedByte();
	var note = this.factory.newNote();
	note.string = (guitarString.number);
	note.effect = (effect);
	note.effect.accentuatedNote = (((flags & 64) != 0));
	note.effect.heavyAccentuatedNote = (((flags & 2) != 0));
	note.effect.ghostNote = (((flags & 4) != 0));
	if((flags & 32) != 0) {
		var noteType = this.readUnsignedByte();
		note.isTiedNote = ((noteType == 2));
		note.effect.deadNote = ((noteType == 3));
	}
	if((flags & 1) != 0) {
		note.duration = this.readByte();
		note.tuplet = this.readByte();
	}
	if((flags & 16) != 0) {
		note.velocity = ((15 + (16 * this.readByte())) - 16);
	}
	if((flags & 32) != 0) {
		var fret = this.readByte();
		var value = ((note.isTiedNote?this.getTiedNoteValue(guitarString.number,track):fret));
		note.value = ((value >= 0 && value < 100?value:0));
	}
	if((flags & 128) != 0) {
		note.effect.leftHandFinger = this.readByte();
		note.effect.rightHandFinger = this.readByte();
		note.effect.isFingering = true;
	}
	if((flags & 8) != 0) {
		this.readNoteEffects(note.effect);
	}
	return note;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readNoteEffects = function(noteEffect) {
	var flags1 = this.readUnsignedByte();
	noteEffect.slide = (flags1 & 4) != 0;
	noteEffect.hammer = (flags1 & 2) != 0;
	noteEffect.letRing = (flags1 & 8) != 0;
	if((flags1 & 1) != 0) {
		this.readBend(noteEffect);
	}
	if((flags1 & 16) != 0) {
		this.readGrace(noteEffect);
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readPageSetup = function(song) {
	var setup = net.alphatab.model.PageSetup.defaults();
	song.pageSetup = setup;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readSong = function() {
	if(!this.readVersion()) {
		throw new net.alphatab.file.FileFormatException("Unsupported Version");
	}
	var song = this.factory.newSong();
	this.readInfo(song);
	this._tripletFeel = (this.readBool()?net.alphatab.model.TripletFeel.Eighth:net.alphatab.model.TripletFeel.None);
	this.readLyrics(song);
	this.readPageSetup(song);
	song.tempoName = "";
	song.tempo = this.readInt();
	song.hideTempo = false;
	song.key = this.readInt();
	song.octave = 0;
	var channels = this.readMidiChannels();
	var measureCount = this.readInt();
	var trackCount = this.readInt();
	this.readMeasureHeaders(song,measureCount);
	this.readTracks(song,trackCount,channels);
	this.readMeasures(song);
	return song;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readText = function(beat) {
	var text = this.factory.newText();
	text.value = this.readIntSizeCheckByteString();
	beat.setText(text);
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readTrack = function(number,channels) {
	var flags = this.readUnsignedByte();
	var track = this.factory.newTrack();
	track.isPercussionTrack = (flags & 1) != 0;
	track.is12StringedGuitarTrack = (flags & 2) != 0;
	track.isBanjoTrack = (flags & 4) != 0;
	track.number = number;
	track.name = this.readByteSizeString(40);
	var stringCount = this.readInt();
	{
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var iTuning = this.readInt();
			if(stringCount > i) {
				var oString = this.factory.newString();
				oString.number = (i + 1);
				oString.value = (iTuning);
				track.strings.push(oString);
			}
		}
	}
	track.port = this.readInt();
	this.readChannel(track.channel,channels);
	track.fretCount = this.readInt();
	track.offset = this.readInt();
	track.color = this.readColor();
	return track;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readTracks = function(song,trackCount,channels) {
	var _g1 = 1, _g = trackCount + 1;
	while(_g1 < _g) {
		var i = _g1++;
		song.addTrack(this.readTrack(i,channels));
	}
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.readTremoloBar = function(effect) {
	var barEffect = this.factory.newTremoloBarEffect();
	barEffect.type = net.alphatab.model.effects.BendTypesConverter.fromInt(this.readByte());
	barEffect.value = this.readInt();
	barEffect.points.push(new net.alphatab.model.effects.BendPoint(0,0,false));
	barEffect.points.push(new net.alphatab.model.effects.BendPoint(Math.round(12 / 2.0),Math.round(barEffect.value / 50),false));
	barEffect.points.push(new net.alphatab.model.effects.BendPoint(12,0,false));
	effect.tremoloBar = barEffect;
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.__class__ = net.alphatab.file.guitarpro.Gp3Reader;
net.alphatab.file.guitarpro.Gp4Reader = function(p) { if( p === $_ ) return; {
	net.alphatab.file.guitarpro.Gp3Reader.apply(this,[]);
	this.initVersions(["FICHIER GUITAR PRO v4.00","FICHIER GUITAR PRO v4.06","FICHIER GUITAR PRO L4.06"]);
}}
net.alphatab.file.guitarpro.Gp4Reader.__name__ = ["net","alphatab","file","guitarpro","Gp4Reader"];
net.alphatab.file.guitarpro.Gp4Reader.__super__ = net.alphatab.file.guitarpro.Gp3Reader;
for(var k in net.alphatab.file.guitarpro.Gp3Reader.prototype ) net.alphatab.file.guitarpro.Gp4Reader.prototype[k] = net.alphatab.file.guitarpro.Gp3Reader.prototype[k];
net.alphatab.file.guitarpro.Gp4Reader.prototype.readArtificialHarmonic = function(noteEffect) {
	var type = this.readByte();
	var oHarmonic = this.factory.newHarmonicEffect();
	oHarmonic.data = 0;
	switch(type) {
	case 1:{
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Natural);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 3:{
		this.skip(1);
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Tapped);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 4:{
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Pinch);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 5:{
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Semi);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 15:{
		oHarmonic.data = 2;
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Artificial);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 17:{
		oHarmonic.data = 3;
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Artificial);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 22:{
		oHarmonic.data = 0;
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Artificial);
		noteEffect.harmonic = (oHarmonic);
	}break;
	}
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readBeat = function(start,measure,track,voiceIndex) {
	var flags = this.readUnsignedByte();
	var beat = this.getBeat(measure,start);
	var voice = beat.voices[voiceIndex];
	if((flags & 64) != 0) {
		var beatType = this.readUnsignedByte();
		voice.isEmpty = ((beatType & 2) == 0);
	}
	var duration = this.readDuration(flags);
	if((flags & 2) != 0) {
		this.readChord(track.stringCount(),beat);
	}
	if((flags & 4) != 0) {
		this.readText(beat);
	}
	if((flags & 8) != 0) {
		this.readBeatEffects(beat,null);
	}
	if((flags & 16) != 0) {
		var mixTableChange = this.readMixTableChange(measure);
		beat.effect.mixTableChange = mixTableChange;
	}
	var stringFlags = this.readUnsignedByte();
	{
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & (1 << i)) != 0 && (6 - i) < track.stringCount()) {
				var guitarString = track.strings[6 - i].clone(this.factory);
				var note = this.readNote(guitarString,track,this.factory.newNoteEffect());
				voice.addNote(note);
			}
			duration.copy(voice.duration);
		}
	}
	return ((!voice.isEmpty)?duration.time():0);
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readBeatEffects = function(beat,effect) {
	var flags1 = this.readUnsignedByte();
	var flags2 = this.readUnsignedByte();
	beat.effect.fadeIn = (((flags1 & 16) != 0));
	beat.effect.vibrato = (((flags1 & 2) != 0)) || beat.effect.vibrato;
	if((flags1 & 32) != 0) {
		var slapEffect = this.readUnsignedByte();
		beat.effect.tapping = (slapEffect == 1);
		beat.effect.slapping = (slapEffect == 2);
		beat.effect.popping = (slapEffect == 3);
	}
	if((flags2 & 4) != 0) {
		this.readTremoloBar(beat.effect);
	}
	if((flags1 & 64) != 0) {
		var strokeUp = this.readByte();
		var strokeDown = this.readByte();
		if(strokeUp > 0) {
			beat.effect.stroke.direction = net.alphatab.model.BeatStrokeDirection.Up;
			beat.effect.stroke.value = (net.alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.effect.stroke.direction = net.alphatab.model.BeatStrokeDirection.Down;
			beat.effect.stroke.value = (net.alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeDown));
		}
	}
	beat.effect.hasRasgueado = (flags2 & 1) != 0;
	if((flags2 & 2) != 0) {
		beat.effect.pickStroke = this.readByte();
		beat.effect.hasPickStroke = true;
	}
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readChord = function(stringCount,beat) {
	var chord = this.factory.newChord(stringCount);
	if((this.readUnsignedByte() & 1) == 0) {
		chord.name = (this.readIntSizeCheckByteString());
		chord.firstFret = (this.readInt());
		if(chord.firstFret != 0) {
			{
				var _g = 0;
				while(_g < 6) {
					var i = _g++;
					var fret = this.readInt();
					if(i < chord.strings.length) {
						chord.strings[i] = fret;
					}
				}
			}
		}
	}
	else {
		this.skip(16);
		chord.name = (this.readByteSizeString(21));
		this.skip(4);
		chord.firstFret = (this.readInt());
		{
			var _g = 0;
			while(_g < 7) {
				var i = _g++;
				var fret = this.readInt();
				if(i < chord.strings.length) {
					chord.strings[i] = fret;
				}
			}
		}
		this.skip(32);
	}
	if(chord.noteCount() > 0) {
		beat.setChord(chord);
	}
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readMixTableChange = function(measure) {
	var tableChange = this.factory.newMixTableChange();
	tableChange.instrument.value = this.readByte();
	tableChange.volume.value = this.readByte();
	tableChange.balance.value = this.readByte();
	tableChange.chorus.value = this.readByte();
	tableChange.reverb.value = this.readByte();
	tableChange.phaser.value = this.readByte();
	tableChange.tremolo.value = this.readByte();
	tableChange.tempoName = "";
	tableChange.tempo.value = this.readInt();
	if(tableChange.instrument.value < 0) tableChange.instrument = null;
	if(tableChange.volume.value >= 0) tableChange.volume.duration = this.readByte();
	else tableChange.volume = null;
	if(tableChange.balance.value >= 0) tableChange.balance.duration = this.readByte();
	else tableChange.balance = null;
	if(tableChange.chorus.value >= 0) tableChange.chorus.duration = this.readByte();
	else tableChange.chorus = null;
	if(tableChange.reverb.value >= 0) tableChange.reverb.duration = this.readByte();
	else tableChange.reverb = null;
	if(tableChange.phaser.value >= 0) tableChange.phaser.duration = this.readByte();
	else tableChange.phaser = null;
	if(tableChange.tremolo.value >= 0) tableChange.tremolo.duration = this.readByte();
	else tableChange.tremolo = null;
	if(tableChange.tempo.value >= 0) {
		tableChange.tempo.duration = this.readByte();
		measure.tempo().value = tableChange.tempo.value;
		tableChange.hideTempo = false;
	}
	else tableChange.tempo = null;
	var allTracksFlags = this.readUnsignedByte();
	if(tableChange.volume != null) tableChange.volume.allTracks = (allTracksFlags & 1) != 0;
	if(tableChange.balance != null) tableChange.balance.allTracks = (allTracksFlags & 2) != 0;
	if(tableChange.chorus != null) tableChange.chorus.allTracks = (allTracksFlags & 4) != 0;
	if(tableChange.reverb != null) tableChange.reverb.allTracks = (allTracksFlags & 8) != 0;
	if(tableChange.phaser != null) tableChange.phaser.allTracks = (allTracksFlags & 16) != 0;
	if(tableChange.tremolo != null) tableChange.tremolo.allTracks = (allTracksFlags & 32) != 0;
	if(tableChange.tempo != null) tableChange.tempo.allTracks = true;
	return tableChange;
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readNoteEffects = function(noteEffect) {
	var flags1 = this.readUnsignedByte();
	var flags2 = this.readUnsignedByte();
	if((flags1 & 1) != 0) {
		this.readBend(noteEffect);
	}
	if((flags1 & 16) != 0) {
		this.readGrace(noteEffect);
	}
	if((flags2 & 4) != 0) {
		this.readTremoloPicking(noteEffect);
	}
	if((flags2 & 8) != 0) {
		noteEffect.slide = true;
		var type = this.readByte();
		switch(type) {
		case 1:{
			noteEffect.slideType = net.alphatab.model.SlideType.FastSlideTo;
		}break;
		case 2:{
			noteEffect.slideType = net.alphatab.model.SlideType.SlowSlideTo;
		}break;
		case 4:{
			noteEffect.slideType = net.alphatab.model.SlideType.OutDownWards;
		}break;
		case 8:{
			noteEffect.slideType = net.alphatab.model.SlideType.OutUpWards;
		}break;
		case 16:{
			noteEffect.slideType = net.alphatab.model.SlideType.IntoFromBelow;
		}break;
		case 32:{
			noteEffect.slideType = net.alphatab.model.SlideType.IntoFromAbove;
		}break;
		}
	}
	if((flags2 & 16) != 0) {
		this.readArtificialHarmonic(noteEffect);
	}
	if((flags2 & 32) != 0) {
		this.readTrill(noteEffect);
	}
	noteEffect.letRing = (flags1 & 8) != 0;
	noteEffect.hammer = (((flags1 & 2) != 0));
	noteEffect.vibrato = (((flags2 & 64) != 0) || noteEffect.vibrato);
	noteEffect.palmMute = (((flags2 & 2) != 0));
	noteEffect.staccato = (((flags2 & 1) != 0));
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readSong = function() {
	if(!this.readVersion()) {
		throw new net.alphatab.file.FileFormatException("Unsupported Version");
	}
	var song = this.factory.newSong();
	this.readInfo(song);
	this._tripletFeel = (this.readBool()?net.alphatab.model.TripletFeel.Eighth:net.alphatab.model.TripletFeel.None);
	this.readLyrics(song);
	this.readPageSetup(song);
	song.tempoName = "";
	song.tempo = this.readInt();
	song.hideTempo = false;
	song.key = this.readInt();
	song.octave = this.readByte();
	var channels = this.readMidiChannels();
	var measureCount = this.readInt();
	var trackCount = this.readInt();
	this.readMeasureHeaders(song,measureCount);
	this.readTracks(song,trackCount,channels);
	this.readMeasures(song);
	return song;
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readTremoloBar = function(effect) {
	var barEffect = this.factory.newTremoloBarEffect();
	barEffect.type = net.alphatab.model.effects.BendTypesConverter.fromInt(this.readByte());
	barEffect.value = this.readInt();
	var pointCount = this.readInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.readInt() * 12) / 60);
			var pointValue = Math.round(this.readInt() / (25 * 2.0));
			var vibrato = this.readBool();
			barEffect.points.push(new net.alphatab.model.effects.BendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) effect.tremoloBar = barEffect;
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readTremoloPicking = function(noteEffect) {
	var value = this.readUnsignedByte();
	var tp = this.factory.newTremoloPickingEffect();
	switch(value) {
	case 1:{
		tp.duration.value = 8;
		noteEffect.tremoloPicking = (tp);
	}break;
	case 2:{
		tp.duration.value = 16;
		noteEffect.tremoloPicking = (tp);
	}break;
	case 3:{
		tp.duration.value = 32;
		noteEffect.tremoloPicking = (tp);
	}break;
	}
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.readTrill = function(noteEffect) {
	var fret = this.readByte();
	var period = this.readByte();
	var trill = this.factory.newTrillEffect();
	trill.fret = (fret);
	switch(period) {
	case 1:{
		trill.duration.value = 16;
		noteEffect.trill = (trill);
	}break;
	case 2:{
		trill.duration.value = 32;
		noteEffect.trill = (trill);
	}break;
	case 3:{
		trill.duration.value = 64;
		noteEffect.trill = (trill);
	}break;
	}
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.__class__ = net.alphatab.file.guitarpro.Gp4Reader;
net.alphatab.file.guitarpro.Gp5Reader = function(p) { if( p === $_ ) return; {
	net.alphatab.file.guitarpro.Gp4Reader.apply(this,[]);
	this.initVersions(["FICHIER GUITAR PRO v5.00","FICHIER GUITAR PRO v5.10"]);
}}
net.alphatab.file.guitarpro.Gp5Reader.__name__ = ["net","alphatab","file","guitarpro","Gp5Reader"];
net.alphatab.file.guitarpro.Gp5Reader.__super__ = net.alphatab.file.guitarpro.Gp4Reader;
for(var k in net.alphatab.file.guitarpro.Gp4Reader.prototype ) net.alphatab.file.guitarpro.Gp5Reader.prototype[k] = net.alphatab.file.guitarpro.Gp4Reader.prototype[k];
net.alphatab.file.guitarpro.Gp5Reader.prototype.readArtificialHarmonic = function(noteEffect) {
	var type = this.readByte();
	var oHarmonic = this.factory.newHarmonicEffect();
	oHarmonic.data = 0;
	switch(type) {
	case 1:{
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Natural);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 2:{
		this.skip(3);
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Artificial);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 3:{
		this.skip(1);
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Tapped);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 4:{
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Pinch);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 5:{
		oHarmonic.type = (net.alphatab.model.effects.HarmonicType.Semi);
		noteEffect.harmonic = (oHarmonic);
	}break;
	}
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readBeat = function(start,measure,track,voiceIndex) {
	var flags = this.readUnsignedByte();
	var beat = this.getBeat(measure,start);
	var voice = beat.voices[voiceIndex];
	if((flags & 64) != 0) {
		var beatType = this.readUnsignedByte();
		voice.isEmpty = ((beatType & 2) == 0);
	}
	var duration = this.readDuration(flags);
	if((flags & 2) != 0) {
		this.readChord(track.stringCount(),beat);
	}
	if((flags & 4) != 0) {
		this.readText(beat);
	}
	if((flags & 8) != 0) {
		this.readBeatEffects(beat,null);
	}
	if((flags & 16) != 0) {
		var mixTableChange = this.readMixTableChange(measure);
		beat.effect.mixTableChange = mixTableChange;
	}
	var stringFlags = this.readUnsignedByte();
	{
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & (1 << i)) != 0 && (6 - i) < track.stringCount()) {
				var guitarString = track.strings[6 - i].clone(this.factory);
				var note = this.readNote(guitarString,track,this.factory.newNoteEffect());
				voice.addNote(note);
			}
			duration.copy(voice.duration);
		}
	}
	this.skip(1);
	var read = this.readByte();
	if(read == 8 || read == 10) {
		this.skip(1);
	}
	return ((!voice.isEmpty)?duration.time():0);
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readChord = function(stringCount,beat) {
	var chord = this.factory.newChord(stringCount);
	this.skip(17);
	chord.name = (this.readByteSizeString(21));
	this.skip(4);
	chord.firstFret = this.readInt();
	{
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var fret = this.readInt();
			if(i < chord.strings.length) {
				chord.strings[i] = fret;
			}
		}
	}
	this.skip(32);
	if(chord.noteCount() > 0) {
		beat.setChord(chord);
	}
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readGrace = function(noteEffect) {
	var fret = this.readUnsignedByte();
	var dyn = this.readUnsignedByte();
	var transition = this.readByte();
	var duration = this.readUnsignedByte();
	var flags = this.readUnsignedByte();
	var grace = this.factory.newGraceEffect();
	grace.fret = (fret);
	grace.velocity = ((15 + (16 * dyn)) - 16);
	grace.duration = (duration);
	grace.isDead = ((flags & 1) != 0);
	grace.isOnBeat = ((flags & 2) != 0);
	switch(transition) {
	case 0:{
		grace.transition = net.alphatab.model.effects.GraceEffectTransition.None;
	}break;
	case 1:{
		grace.transition = net.alphatab.model.effects.GraceEffectTransition.Slide;
	}break;
	case 2:{
		grace.transition = net.alphatab.model.effects.GraceEffectTransition.Bend;
	}break;
	case 3:{
		grace.transition = net.alphatab.model.effects.GraceEffectTransition.Hammer;
	}break;
	}
	noteEffect.grace = (grace);
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readInfo = function(song) {
	song.title = (this.readIntSizeCheckByteString());
	song.subtitle = this.readIntSizeCheckByteString();
	song.artist = (this.readIntSizeCheckByteString());
	song.album = (this.readIntSizeCheckByteString());
	song.words = (this.readIntSizeCheckByteString());
	song.music = this.readIntSizeCheckByteString();
	song.copyright = this.readIntSizeCheckByteString();
	song.tab = this.readIntSizeCheckByteString();
	song.instructions = this.readIntSizeCheckByteString();
	var iNotes = this.readInt();
	song.notice = "";
	{
		var _g = 0;
		while(_g < iNotes) {
			var i = _g++;
			song.notice += this.readIntSizeCheckByteString() + "\n";
		}
	}
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readMeasure = function(measure,track) {
	{
		var _g = 0;
		while(_g < 2) {
			var voice = _g++;
			var start = measure.start();
			var beats = this.readInt();
			{
				var _g1 = 0;
				while(_g1 < beats) {
					var beat = _g1++;
					start += this.readBeat(start,measure,track,voice);
				}
			}
		}
	}
	this.skip(1);
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readMeasureHeader = function(i,timeSignature,song) {
	if(i > 0) this.skip(1);
	var flags = this.readUnsignedByte();
	var header = this.factory.newMeasureHeader();
	header.number = i + 1;
	header.start = 0;
	header.tempo.value = song.tempo;
	if((flags & 1) != 0) timeSignature.numerator = this.readByte();
	if((flags & 2) != 0) timeSignature.denominator.value = this.readByte();
	header.isRepeatOpen = ((flags & 4) != 0);
	timeSignature.copy(header.timeSignature);
	if((flags & 8) != 0) header.repeatClose = (this.readByte() - 1);
	if((flags & 32) != 0) header.marker = this.readMarker(header);
	if((flags & 16) != 0) header.repeatAlternative = this.readUnsignedByte();
	if((flags & 64) != 0) {
		header.keySignature = net.alphatab.file.guitarpro.Gp3Reader.toKeySignature(this.readByte());
		header.keySignatureType = this.readByte();
	}
	else if(header.number > 1) {
		header.keySignature = song.measureHeaders[i - 1].keySignature;
		header.keySignatureType = song.measureHeaders[i - 1].keySignatureType;
	}
	header.hasDoubleBar = (flags & 128) != 0;
	if((flags & 1) != 0) this.skip(4);
	if((flags & 16) == 0) this.skip(1);
	var tripletFeel = this.readByte();
	switch(tripletFeel) {
	case 1:{
		header.tripletFeel = net.alphatab.model.TripletFeel.Eighth;
	}break;
	case 2:{
		header.tripletFeel = net.alphatab.model.TripletFeel.Sixteenth;
	}break;
	default:{
		header.tripletFeel = net.alphatab.model.TripletFeel.None;
	}break;
	}
	return header;
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readMixTableChange = function(measure) {
	var tableChange = this.factory.newMixTableChange();
	tableChange.instrument.value = this.readByte();
	this.skip(16);
	tableChange.volume.value = this.readByte();
	tableChange.balance.value = this.readByte();
	tableChange.chorus.value = this.readByte();
	tableChange.reverb.value = this.readByte();
	tableChange.phaser.value = this.readByte();
	tableChange.tremolo.value = this.readByte();
	tableChange.tempoName = this.readIntSizeCheckByteString();
	tableChange.tempo.value = this.readInt();
	if(tableChange.instrument.value < 0) tableChange.instrument = null;
	if(tableChange.volume.value >= 0) tableChange.volume.duration = this.readByte();
	else tableChange.volume = null;
	if(tableChange.balance.value >= 0) tableChange.balance.duration = this.readByte();
	else tableChange.balance = null;
	if(tableChange.chorus.value >= 0) tableChange.chorus.duration = this.readByte();
	else tableChange.chorus = null;
	if(tableChange.reverb.value >= 0) tableChange.reverb.duration = this.readByte();
	else tableChange.reverb = null;
	if(tableChange.phaser.value >= 0) tableChange.phaser.duration = this.readByte();
	else tableChange.phaser = null;
	if(tableChange.tremolo.value >= 0) tableChange.tremolo.duration = this.readByte();
	else tableChange.tremolo = null;
	if(tableChange.tempo.value >= 0) {
		tableChange.tempo.duration = this.readByte();
		measure.tempo().value = tableChange.tempo.value;
		tableChange.hideTempo = this._versionIndex > 0 && this.readBool();
	}
	else tableChange.tempo = null;
	var allTracksFlags = this.readUnsignedByte();
	if(tableChange.volume != null) tableChange.volume.allTracks = (allTracksFlags & 1) != 0;
	if(tableChange.balance != null) tableChange.balance.allTracks = (allTracksFlags & 2) != 0;
	if(tableChange.chorus != null) tableChange.chorus.allTracks = (allTracksFlags & 4) != 0;
	if(tableChange.reverb != null) tableChange.reverb.allTracks = (allTracksFlags & 8) != 0;
	if(tableChange.phaser != null) tableChange.phaser.allTracks = (allTracksFlags & 16) != 0;
	if(tableChange.tremolo != null) tableChange.tremolo.allTracks = (allTracksFlags & 32) != 0;
	if(tableChange.tempo != null) tableChange.tempo.allTracks = true;
	this.skip(1);
	if(this._versionIndex > 0) {
		this.readIntSizeCheckByteString();
		this.readIntSizeCheckByteString();
	}
	return tableChange;
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readNote = function(guitarString,track,effect) {
	var flags = this.readUnsignedByte();
	var note = this.factory.newNote();
	note.string = (guitarString.number);
	note.effect.accentuatedNote = (((flags & 64) != 0));
	note.effect.heavyAccentuatedNote = (((flags & 2) != 0));
	note.effect.ghostNote = (((flags & 4) != 0));
	if((flags & 32) != 0) {
		var noteType = this.readUnsignedByte();
		note.isTiedNote = ((noteType == 2));
		note.effect.deadNote = ((noteType == 3));
	}
	if((flags & 16) != 0) {
		note.velocity = ((15 + (16 * this.readByte())) - 16);
	}
	if((flags & 32) != 0) {
		var fret = this.readByte();
		var value = ((note.isTiedNote?this.getTiedNoteValue(guitarString.number,track):fret));
		note.value = ((value >= 0 && value < 100?value:0));
	}
	if((flags & 128) != 0) {
		note.effect.leftHandFinger = this.readByte();
		note.effect.rightHandFinger = this.readByte();
		note.effect.isFingering = true;
	}
	if((flags & 1) != 0) {
		note.durationPercent = this.readDouble();
	}
	this.skip(1);
	if((flags & 8) != 0) {
		this.readNoteEffects(note.effect);
	}
	return note;
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readNoteEffects = function(noteEffect) {
	var flags1 = this.readUnsignedByte();
	var flags2 = this.readUnsignedByte();
	if((flags1 & 1) != 0) {
		this.readBend(noteEffect);
	}
	if((flags1 & 16) != 0) {
		this.readGrace(noteEffect);
	}
	if((flags2 & 4) != 0) {
		this.readTremoloPicking(noteEffect);
	}
	if((flags2 & 8) != 0) {
		noteEffect.slide = true;
		var type = this.readByte();
		switch(type) {
		case 1:{
			noteEffect.slideType = net.alphatab.model.SlideType.FastSlideTo;
		}break;
		case 2:{
			noteEffect.slideType = net.alphatab.model.SlideType.SlowSlideTo;
		}break;
		case 4:{
			noteEffect.slideType = net.alphatab.model.SlideType.OutDownWards;
		}break;
		case 8:{
			noteEffect.slideType = net.alphatab.model.SlideType.OutUpWards;
		}break;
		case 16:{
			noteEffect.slideType = net.alphatab.model.SlideType.IntoFromBelow;
		}break;
		case 32:{
			noteEffect.slideType = net.alphatab.model.SlideType.IntoFromAbove;
		}break;
		}
	}
	if((flags2 & 16) != 0) {
		this.readArtificialHarmonic(noteEffect);
	}
	if((flags2 & 32) != 0) {
		this.readTrill(noteEffect);
	}
	noteEffect.letRing = (flags1 & 8) != 0;
	noteEffect.hammer = (((flags1 & 2) != 0));
	noteEffect.vibrato = (((flags2 & 64) != 0) || noteEffect.vibrato);
	noteEffect.palmMute = (((flags2 & 2) != 0));
	noteEffect.staccato = (((flags2 & 1) != 0));
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readPageSetup = function(song) {
	var setup = this.factory.newPageSetup();
	if(this._versionIndex > 0) this.skip(19);
	setup.pageSize = new net.alphatab.model.Point(this.readInt(),this.readInt());
	var l = this.readInt();
	var r = this.readInt();
	var t = this.readInt();
	var b = this.readInt();
	setup.pageMargin = new net.alphatab.model.Rectangle(l,t,r,b);
	setup.scoreSizeProportion = this.readInt() / 100.0;
	setup.headerAndFooter = this.readByte();
	var flags2 = this.readUnsignedByte();
	if((flags2 & 1) != 0) setup.headerAndFooter |= 256;
	setup.title = this.readIntSizeCheckByteString();
	setup.subtitle = this.readIntSizeCheckByteString();
	setup.artist = this.readIntSizeCheckByteString();
	setup.album = this.readIntSizeCheckByteString();
	setup.words = this.readIntSizeCheckByteString();
	setup.music = this.readIntSizeCheckByteString();
	setup.wordsAndMusic = this.readIntSizeCheckByteString();
	setup.copyright = (this.readIntSizeCheckByteString() + "\n") + this.readIntSizeCheckByteString();
	setup.pageNumber = this.readIntSizeCheckByteString();
	song.pageSetup = setup;
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readSong = function() {
	if(!this.readVersion()) {
		throw new net.alphatab.file.FileFormatException("Unsupported Version");
	}
	var song = this.factory.newSong();
	this.readInfo(song);
	this.readLyrics(song);
	this.readPageSetup(song);
	song.tempoName = this.readIntSizeCheckByteString();
	song.tempo = this.readInt();
	if(this._versionIndex > 0) song.hideTempo = this.readBool();
	song.key = this.readByte();
	song.octave = this.readInt();
	var channels = this.readMidiChannels();
	this.skip(42);
	var measureCount = this.readInt();
	var trackCount = this.readInt();
	this.readMeasureHeaders(song,measureCount);
	this.readTracks(song,trackCount,channels);
	this.readMeasures(song);
	return song;
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readTrack = function(number,channels) {
	var flags = this.readUnsignedByte();
	if(number == 1 || this._versionIndex == 0) this.skip(1);
	var track = this.factory.newTrack();
	track.isPercussionTrack = (flags & 1) != 0;
	track.is12StringedGuitarTrack = (flags & 2) != 0;
	track.isBanjoTrack = (flags & 4) != 0;
	track.number = number;
	track.name = this.readByteSizeString(40);
	var stringCount = this.readInt();
	{
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var iTuning = this.readInt();
			if(stringCount > i) {
				var oString = this.factory.newString();
				oString.number = (i + 1);
				oString.value = (iTuning);
				track.strings.push(oString);
			}
		}
	}
	track.port = this.readInt();
	this.readChannel(track.channel,channels);
	track.fretCount = this.readInt();
	track.offset = this.readInt();
	track.color = this.readColor();
	this.skip(((this._versionIndex > 0)?49:44));
	if(this._versionIndex > 0) {
		this.readIntSizeCheckByteString();
		this.readIntSizeCheckByteString();
	}
	return track;
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.readTracks = function(song,trackCount,channels) {
	{
		var _g1 = 1, _g = trackCount + 1;
		while(_g1 < _g) {
			var i = _g1++;
			song.addTrack(this.readTrack(i,channels));
		}
	}
	this.skip(((this._versionIndex == 0?2:1)));
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.__class__ = net.alphatab.file.guitarpro.Gp5Reader;
haxe.io.BytesBuffer = function(p) { if( p === $_ ) return; {
	this.b = new Array();
}}
haxe.io.BytesBuffer.__name__ = ["haxe","io","BytesBuffer"];
haxe.io.BytesBuffer.prototype.add = function(src) {
	var b1 = this.b;
	var b2 = src.b;
	{
		var _g1 = 0, _g = src.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
}
haxe.io.BytesBuffer.prototype.addByte = function($byte) {
	this.b.push($byte);
}
haxe.io.BytesBuffer.prototype.addBytes = function(src,pos,len) {
	if(pos < 0 || len < 0 || pos + len > src.length) throw haxe.io.Error.OutsideBounds;
	var b1 = this.b;
	var b2 = src.b;
	{
		var _g1 = pos, _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
}
haxe.io.BytesBuffer.prototype.b = null;
haxe.io.BytesBuffer.prototype.getBytes = function() {
	var bytes = new haxe.io.Bytes(this.b.length,this.b);
	this.b = null;
	return bytes;
}
haxe.io.BytesBuffer.prototype.__class__ = haxe.io.BytesBuffer;
net.alphatab.model.Color = function(r,g,b) { if( r === $_ ) return; {
	if(b == null) b = 0;
	if(g == null) g = 0;
	if(r == null) r = 0;
	this.r = r;
	this.g = g;
	this.b = b;
}}
net.alphatab.model.Color.__name__ = ["net","alphatab","model","Color"];
net.alphatab.model.Color.prototype.b = null;
net.alphatab.model.Color.prototype.g = null;
net.alphatab.model.Color.prototype.r = null;
net.alphatab.model.Color.prototype.toString = function() {
	var s = "rgb(";
	s += Std.string(this.r) + ",";
	s += Std.string(this.g) + ",";
	s += Std.string(this.b) + ")";
	return s;
}
net.alphatab.model.Color.prototype.__class__ = net.alphatab.model.Color;
net.alphatab.model.Marker = function(p) { if( p === $_ ) return; {
	null;
}}
net.alphatab.model.Marker.__name__ = ["net","alphatab","model","Marker"];
net.alphatab.model.Marker.prototype.color = null;
net.alphatab.model.Marker.prototype.measureHeader = null;
net.alphatab.model.Marker.prototype.title = null;
net.alphatab.model.Marker.prototype.__class__ = net.alphatab.model.Marker;
if(!net.alphatab.platform) net.alphatab.platform = {}
net.alphatab.platform.Canvas = function() { }
net.alphatab.platform.Canvas.__name__ = ["net","alphatab","platform","Canvas"];
net.alphatab.platform.Canvas.prototype.arc = null;
net.alphatab.platform.Canvas.prototype.arcTo = null;
net.alphatab.platform.Canvas.prototype.beginPath = null;
net.alphatab.platform.Canvas.prototype.bezierCurveTo = null;
net.alphatab.platform.Canvas.prototype.clearRect = null;
net.alphatab.platform.Canvas.prototype.closePath = null;
net.alphatab.platform.Canvas.prototype.fill = null;
net.alphatab.platform.Canvas.prototype.fillRect = null;
net.alphatab.platform.Canvas.prototype.fillStyle = null;
net.alphatab.platform.Canvas.prototype.fillText = null;
net.alphatab.platform.Canvas.prototype.font = null;
net.alphatab.platform.Canvas.prototype.height = null;
net.alphatab.platform.Canvas.prototype.lineTo = null;
net.alphatab.platform.Canvas.prototype.lineWidth = null;
net.alphatab.platform.Canvas.prototype.measureText = null;
net.alphatab.platform.Canvas.prototype.moveTo = null;
net.alphatab.platform.Canvas.prototype.quadraticCurveTo = null;
net.alphatab.platform.Canvas.prototype.rect = null;
net.alphatab.platform.Canvas.prototype.setHeight = null;
net.alphatab.platform.Canvas.prototype.setWidth = null;
net.alphatab.platform.Canvas.prototype.stroke = null;
net.alphatab.platform.Canvas.prototype.strokeRect = null;
net.alphatab.platform.Canvas.prototype.strokeStyle = null;
net.alphatab.platform.Canvas.prototype.strokeText = null;
net.alphatab.platform.Canvas.prototype.textAlign = null;
net.alphatab.platform.Canvas.prototype.textBaseline = null;
net.alphatab.platform.Canvas.prototype.width = null;
net.alphatab.platform.Canvas.prototype.__class__ = net.alphatab.platform.Canvas;
net.alphatab.model.GuitarString = function(p) { if( p === $_ ) return; {
	this.number = 0;
	this.value = 0;
}}
net.alphatab.model.GuitarString.__name__ = ["net","alphatab","model","GuitarString"];
net.alphatab.model.GuitarString.prototype.clone = function(factory) {
	var newString = factory.newString();
	newString.number = this.number;
	newString.value = this.value;
	return newString;
}
net.alphatab.model.GuitarString.prototype.number = null;
net.alphatab.model.GuitarString.prototype.value = null;
net.alphatab.model.GuitarString.prototype.__class__ = net.alphatab.model.GuitarString;
net.alphatab.model.PageSetup = function(p) { if( p === $_ ) return; {
	null;
}}
net.alphatab.model.PageSetup.__name__ = ["net","alphatab","model","PageSetup"];
net.alphatab.model.PageSetup.defaults = function() {
	if(net.alphatab.model.PageSetup._defaults == null) {
		net.alphatab.model.PageSetup._defaults = new net.alphatab.model.PageSetup();
		net.alphatab.model.PageSetup._defaults.pageSize = new net.alphatab.model.Point(210,297);
		net.alphatab.model.PageSetup._defaults.pageMargin = new net.alphatab.model.Rectangle(10,15,10,10);
		net.alphatab.model.PageSetup._defaults.scoreSizeProportion = 1;
		net.alphatab.model.PageSetup._defaults.headerAndFooter = 511;
		net.alphatab.model.PageSetup._defaults.title = "%TITLE%";
		net.alphatab.model.PageSetup._defaults.subtitle = "%SUBTITLE%";
		net.alphatab.model.PageSetup._defaults.artist = "%ARTIST%";
		net.alphatab.model.PageSetup._defaults.album = "%ALBUM%";
		net.alphatab.model.PageSetup._defaults.words = "Words by %WORDS%";
		net.alphatab.model.PageSetup._defaults.music = "Music by %MUSIC%";
		net.alphatab.model.PageSetup._defaults.wordsAndMusic = "Words & Music by %WORDSMUSIC%";
		net.alphatab.model.PageSetup._defaults.copyright = "Copyright %COPYRIGHT%\n" + "All Rights Reserved - International Copyright Secured";
		net.alphatab.model.PageSetup._defaults.pageNumber = "Page %N%/%P%";
	}
	return net.alphatab.model.PageSetup._defaults;
}
net.alphatab.model.PageSetup.prototype.album = null;
net.alphatab.model.PageSetup.prototype.artist = null;
net.alphatab.model.PageSetup.prototype.copyright = null;
net.alphatab.model.PageSetup.prototype.headerAndFooter = null;
net.alphatab.model.PageSetup.prototype.music = null;
net.alphatab.model.PageSetup.prototype.pageMargin = null;
net.alphatab.model.PageSetup.prototype.pageNumber = null;
net.alphatab.model.PageSetup.prototype.pageSize = null;
net.alphatab.model.PageSetup.prototype.scoreSizeProportion = null;
net.alphatab.model.PageSetup.prototype.subtitle = null;
net.alphatab.model.PageSetup.prototype.title = null;
net.alphatab.model.PageSetup.prototype.words = null;
net.alphatab.model.PageSetup.prototype.wordsAndMusic = null;
net.alphatab.model.PageSetup.prototype.__class__ = net.alphatab.model.PageSetup;
if(typeof js=='undefined') js = {}
js.Boot = function() { }
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = (i != null?((i.fileName + ":") + i.lineNumber) + ": ":"");
	msg += js.Boot.__unhtml(js.Boot.__string_rec(v,"")) + "<br/>";
	var d = document.getElementById("haxe:trace");
	if(d == null) alert("No haxe:trace element defined\n" + msg);
	else d.innerHTML += msg;
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
	else null;
}
js.Boot.__closure = function(o,f) {
	var m = o[f];
	if(m == null) return null;
	var f1 = function() {
		return m.apply(o,arguments);
	}
	f1.scope = o;
	f1.method = m;
	return f1;
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ != null || o.__ename__ != null)) t = "object";
	switch(t) {
	case "object":{
		if(o instanceof Array) {
			if(o.__enum__ != null) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				{
					var _g1 = 2, _g = o.length;
					while(_g1 < _g) {
						var i = _g1++;
						if(i != 2) str += "," + js.Boot.__string_rec(o[i],s);
						else str += js.Boot.__string_rec(o[i],s);
					}
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			{
				var _g = 0;
				while(_g < l) {
					var i1 = _g++;
					str += ((i1 > 0?",":"")) + js.Boot.__string_rec(o[i1],s);
				}
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		}
		catch( $e8 ) {
			{
				var e = $e8;
				{
					return "???";
				}
			}
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = (o.hasOwnProperty != null);
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) continue;
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__") continue;
		if(str.length != 2) str += ", \n";
		str += ((s + k) + " : ") + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += ("\n" + s) + "}";
		return str;
	}break;
	case "function":{
		return "<function>";
	}break;
	case "string":{
		return o;
	}break;
	default:{
		return String(o);
	}break;
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return (o.__enum__ == null);
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	}
	catch( $e9 ) {
		{
			var e = $e9;
			{
				if(cl == null) return false;
			}
		}
	}
	switch(cl) {
	case Int:{
		return Math.ceil(o%2147483648.0) === o;
	}break;
	case Float:{
		return typeof(o) == "number";
	}break;
	case Bool:{
		return o === true || o === false;
	}break;
	case String:{
		return typeof(o) == "string";
	}break;
	case Dynamic:{
		return true;
	}break;
	default:{
		if(o == null) return false;
		return o.__enum__ == cl || (cl == Class && o.__name__ != null) || (cl == Enum && o.__ename__ != null);
	}break;
	}
}
js.Boot.__init = function() {
	js.Lib.isIE = (typeof document!='undefined' && document.all != null && typeof window!='undefined' && window.opera == null);
	js.Lib.isOpera = (typeof window!='undefined' && window.opera != null);
	Array.prototype.copy = Array.prototype.slice;
	Array.prototype.insert = function(i,x) {
		this.splice(i,0,x);
	}
	Array.prototype.remove = (Array.prototype.indexOf?function(obj) {
		var idx = this.indexOf(obj);
		if(idx == -1) return false;
		this.splice(idx,1);
		return true;
	}:function(obj) {
		var i = 0;
		var l = this.length;
		while(i < l) {
			if(this[i] == obj) {
				this.splice(i,1);
				return true;
			}
			i++;
		}
		return false;
	});
	Array.prototype.iterator = function() {
		return { cur : 0, arr : this, hasNext : function() {
			return this.cur < this.arr.length;
		}, next : function() {
			return this.arr[this.cur++];
		}}
	}
	var cca = String.prototype.charCodeAt;
	String.prototype.cca = cca;
	String.prototype.charCodeAt = function(i) {
		var x = cca.call(this,i);
		if(isNaN(x)) return null;
		return x;
	}
	var oldsub = String.prototype.substr;
	String.prototype.substr = function(pos,len) {
		if(pos != null && pos != 0 && len != null && len < 0) return "";
		if(len == null) len = this.length;
		if(pos < 0) {
			pos = this.length + pos;
			if(pos < 0) pos = 0;
		}
		else if(len < 0) {
			len = (this.length + len) - pos;
		}
		return oldsub.apply(this,[pos,len]);
	}
	$closure = js.Boot.__closure;
}
js.Boot.prototype.__class__ = js.Boot;
net.alphatab.model.Note = function(factory) { if( factory === $_ ) return; {
	this.value = 0;
	this.velocity = 95;
	this.string = 1;
	this.isTiedNote = false;
	this.effect = factory.newNoteEffect();
}}
net.alphatab.model.Note.__name__ = ["net","alphatab","model","Note"];
net.alphatab.model.Note.prototype.duration = null;
net.alphatab.model.Note.prototype.durationPercent = null;
net.alphatab.model.Note.prototype.effect = null;
net.alphatab.model.Note.prototype.isTiedNote = null;
net.alphatab.model.Note.prototype.realValue = function() {
	return this.value + this.voice.beat.measure.track.strings[this.string - 1].value;
}
net.alphatab.model.Note.prototype.string = null;
net.alphatab.model.Note.prototype.tuplet = null;
net.alphatab.model.Note.prototype.value = null;
net.alphatab.model.Note.prototype.velocity = null;
net.alphatab.model.Note.prototype.voice = null;
net.alphatab.model.Note.prototype.__class__ = net.alphatab.model.Note;
net.alphatab.tablature.drawing.NotePainter = function() { }
net.alphatab.tablature.drawing.NotePainter.__name__ = ["net","alphatab","tablature","drawing","NotePainter"];
net.alphatab.tablature.drawing.NotePainter.paintFooter = function(layer,x,y,dur,dir,layout) {
	var scale = layout.scale;
	if(dir == -1) {
		x += net.alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).width;
	}
	var s = "";
	switch(dur) {
	case 64:{
		s = ((dir == -1)?net.alphatab.tablature.drawing.MusicFont.FooterUpSixtyFourth:net.alphatab.tablature.drawing.MusicFont.FooterDownSixtyFourth);
	}break;
	case 32:{
		s = ((dir == -1)?net.alphatab.tablature.drawing.MusicFont.FooterUpThirtySecond:net.alphatab.tablature.drawing.MusicFont.FooterDownThirtySecond);
	}break;
	case 16:{
		s = ((dir == -1)?net.alphatab.tablature.drawing.MusicFont.FooterUpSixteenth:net.alphatab.tablature.drawing.MusicFont.FooterDownSixteenth);
	}break;
	case 8:{
		s = ((dir == -1)?net.alphatab.tablature.drawing.MusicFont.FooterUpEighth:net.alphatab.tablature.drawing.MusicFont.FooterDownEighth);
	}break;
	}
	if(s != "") layer.addMusicSymbol(s,x,y,scale);
}
net.alphatab.tablature.drawing.NotePainter.paintBar = function(layer,x1,y1,x2,y2,count,dir,scale) {
	var width = Math.max(1.0,Math.round(3.0 * scale));
	{
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			var realY1 = (y1 - ((i * (5.0 * scale)) * dir));
			var realY2 = (y2 - ((i * (5.0 * scale)) * dir));
			layer.startFigure();
			layer.addPolygon([new net.alphatab.model.PointF(x1,realY1),new net.alphatab.model.PointF(x2,realY2),new net.alphatab.model.PointF(x2,realY2 + width),new net.alphatab.model.PointF(x1,realY1 + width),new net.alphatab.model.PointF(x1,realY1)]);
			layer.closeFigure();
		}
	}
}
net.alphatab.tablature.drawing.NotePainter.paintHarmonic = function(layer,x,y,scale) {
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.Harmonic,x,y,scale);
}
net.alphatab.tablature.drawing.NotePainter.paintNote = function(layer,x,y,scale,full,font) {
	var symbol = (full?net.alphatab.tablature.drawing.MusicFont.NoteQuarter:net.alphatab.tablature.drawing.MusicFont.NoteHalf);
	layer.addMusicSymbol(symbol,x,y,scale);
}
net.alphatab.tablature.drawing.NotePainter.paintDeadNote = function(layer,x,y,scale,font) {
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.DeadNote,x,y,scale);
}
net.alphatab.tablature.drawing.NotePainter.prototype.__class__ = net.alphatab.tablature.drawing.NotePainter;
net.alphatab.tablature.drawing.DrawingLayersConverter = function() { }
net.alphatab.tablature.drawing.DrawingLayersConverter.__name__ = ["net","alphatab","tablature","drawing","DrawingLayersConverter"];
net.alphatab.tablature.drawing.DrawingLayersConverter.toInt = function(layer) {
	switch(layer) {
	case net.alphatab.tablature.drawing.DrawingLayers.Background:{
		return 0;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground:{
		return 1;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.Lines:{
		return 2;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.MainComponents:{
		return 3;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw:{
		return 4;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.Voice2:{
		return 5;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2:{
		return 6;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2:{
		return 7;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2:{
		return 8;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.Voice1:{
		return 9;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1:{
		return 10;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1:{
		return 11;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1:{
		return 12;
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.Red:{
		return 13;
	}break;
	default:{
		return 0;
	}break;
	}
}
net.alphatab.tablature.drawing.DrawingLayersConverter.prototype.__class__ = net.alphatab.tablature.drawing.DrawingLayersConverter;
haxe.io.Input = function() { }
haxe.io.Input.__name__ = ["haxe","io","Input"];
haxe.io.Input.prototype.bigEndian = null;
haxe.io.Input.prototype.close = function() {
	null;
}
haxe.io.Input.prototype.read = function(nbytes) {
	var s = haxe.io.Bytes.alloc(nbytes);
	var p = 0;
	while(nbytes > 0) {
		var k = this.readBytes(s,p,nbytes);
		if(k == 0) throw haxe.io.Error.Blocked;
		p += k;
		nbytes -= k;
	}
	return s;
}
haxe.io.Input.prototype.readAll = function(bufsize) {
	if(bufsize == null) bufsize = 16384;
	var buf = haxe.io.Bytes.alloc(bufsize);
	var total = new haxe.io.BytesBuffer();
	try {
		while(true) {
			var len = this.readBytes(buf,0,bufsize);
			if(len == 0) throw haxe.io.Error.Blocked;
			total.addBytes(buf,0,len);
		}
	}
	catch( $e10 ) {
		if( js.Boot.__instanceof($e10,haxe.io.Eof) ) {
			var e = $e10;
			null;
		} else throw($e10);
	}
	return total.getBytes();
}
haxe.io.Input.prototype.readByte = function() {
	return (function($this) {
		var $r;
		throw "Not implemented";
		return $r;
	}(this));
}
haxe.io.Input.prototype.readBytes = function(s,pos,len) {
	var k = len;
	var b = s.b;
	if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
	while(k > 0) {
		b[pos] = this.readByte();
		pos++;
		k--;
	}
	return len;
}
haxe.io.Input.prototype.readDouble = function() {
	throw "Not implemented";
	return 0;
}
haxe.io.Input.prototype.readFloat = function() {
	throw "Not implemented";
	return 0;
}
haxe.io.Input.prototype.readFullBytes = function(s,pos,len) {
	while(len > 0) {
		var k = this.readBytes(s,pos,len);
		pos += k;
		len -= k;
	}
}
haxe.io.Input.prototype.readInt16 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var n = (this.bigEndian?ch2 | (ch1 << 8):ch1 | (ch2 << 8));
	if((n & 32768) != 0) return n - 65536;
	return n;
}
haxe.io.Input.prototype.readInt24 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var n = (this.bigEndian?(ch3 | (ch2 << 8)) | (ch1 << 16):(ch1 | (ch2 << 8)) | (ch3 << 16));
	if((n & 8388608) != 0) return n - 16777216;
	return n;
}
haxe.io.Input.prototype.readInt31 = function() {
	var ch1, ch2, ch3, ch4;
	if(this.bigEndian) {
		ch4 = this.readByte();
		ch3 = this.readByte();
		ch2 = this.readByte();
		ch1 = this.readByte();
	}
	else {
		ch1 = this.readByte();
		ch2 = this.readByte();
		ch3 = this.readByte();
		ch4 = this.readByte();
	}
	if(((ch4 & 128) == 0) != ((ch4 & 64) == 0)) throw haxe.io.Error.Overflow;
	return ((ch1 | (ch2 << 8)) | (ch3 << 16)) | (ch4 << 24);
}
haxe.io.Input.prototype.readInt32 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var ch4 = this.readByte();
	return (this.bigEndian?(((ch1 << 8) | ch2) << 16) | ((ch3 << 8) | ch4):(((ch4 << 8) | ch3) << 16) | ((ch2 << 8) | ch1));
}
haxe.io.Input.prototype.readInt8 = function() {
	var n = this.readByte();
	if(n >= 128) return n - 256;
	return n;
}
haxe.io.Input.prototype.readLine = function() {
	var buf = new StringBuf();
	var last;
	var s;
	try {
		while((last = this.readByte()) != 10) buf.b[buf.b.length] = String.fromCharCode(last);
		s = buf.b.join("");
		if(s.charCodeAt(s.length - 1) == 13) s = s.substr(0,-1);
	}
	catch( $e11 ) {
		if( js.Boot.__instanceof($e11,haxe.io.Eof) ) {
			var e = $e11;
			{
				s = buf.b.join("");
				if(s.length == 0) throw (e);
			}
		} else throw($e11);
	}
	return s;
}
haxe.io.Input.prototype.readString = function(len) {
	var b = haxe.io.Bytes.alloc(len);
	this.readFullBytes(b,0,len);
	return b.toString();
}
haxe.io.Input.prototype.readUInt16 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	return (this.bigEndian?ch2 | (ch1 << 8):ch1 | (ch2 << 8));
}
haxe.io.Input.prototype.readUInt24 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	return (this.bigEndian?(ch3 | (ch2 << 8)) | (ch1 << 16):(ch1 | (ch2 << 8)) | (ch3 << 16));
}
haxe.io.Input.prototype.readUInt30 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var ch4 = this.readByte();
	if(((this.bigEndian?ch1:ch4)) >= 64) throw haxe.io.Error.Overflow;
	return (this.bigEndian?((ch4 | (ch3 << 8)) | (ch2 << 16)) | (ch1 << 24):((ch1 | (ch2 << 8)) | (ch3 << 16)) | (ch4 << 24));
}
haxe.io.Input.prototype.readUntil = function(end) {
	var buf = new StringBuf();
	var last;
	while((last = this.readByte()) != end) buf.b[buf.b.length] = String.fromCharCode(last);
	return buf.b.join("");
}
haxe.io.Input.prototype.setEndian = function(b) {
	this.bigEndian = b;
	return b;
}
haxe.io.Input.prototype.__class__ = haxe.io.Input;
haxe.io.BytesInput = function(b,pos,len) { if( b === $_ ) return; {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
}}
haxe.io.BytesInput.__name__ = ["haxe","io","BytesInput"];
haxe.io.BytesInput.__super__ = haxe.io.Input;
for(var k in haxe.io.Input.prototype ) haxe.io.BytesInput.prototype[k] = haxe.io.Input.prototype[k];
haxe.io.BytesInput.prototype.b = null;
haxe.io.BytesInput.prototype.len = null;
haxe.io.BytesInput.prototype.pos = null;
haxe.io.BytesInput.prototype.readByte = function() {
	if(this.len == 0) throw new haxe.io.Eof();
	this.len--;
	return this.b[this.pos++];
}
haxe.io.BytesInput.prototype.readBytes = function(buf,pos,len) {
	if(pos < 0 || len < 0 || pos + len > buf.length) throw haxe.io.Error.OutsideBounds;
	if(this.len == 0 && len > 0) throw new haxe.io.Eof();
	if(this.len < len) len = this.len;
	var b1 = this.b;
	var b2 = buf.b;
	{
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b2[pos + i] = b1[this.pos + i];
		}
	}
	this.pos += len;
	this.len -= len;
	return len;
}
haxe.io.BytesInput.prototype.__class__ = haxe.io.BytesInput;
haxe.Int32 = function() { }
haxe.Int32.__name__ = ["haxe","Int32"];
haxe.Int32.make = function(a,b) {
	return (a << 16) | b;
}
haxe.Int32.ofInt = function(x) {
	return x;
}
haxe.Int32.toInt = function(x) {
	if((((x) >> 30) & 1) != ((x) >>> 31)) throw "Overflow " + x;
	return (x) & -1;
}
haxe.Int32.toNativeInt = function(x) {
	return x;
}
haxe.Int32.add = function(a,b) {
	return (a) + (b);
}
haxe.Int32.sub = function(a,b) {
	return (a) - (b);
}
haxe.Int32.mul = function(a,b) {
	return (a) * (b);
}
haxe.Int32.div = function(a,b) {
	return Std["int"]((a) / (b));
}
haxe.Int32.mod = function(a,b) {
	return (a) % (b);
}
haxe.Int32.shl = function(a,b) {
	return (a) << b;
}
haxe.Int32.shr = function(a,b) {
	return (a) >> b;
}
haxe.Int32.ushr = function(a,b) {
	return (a) >>> b;
}
haxe.Int32.and = function(a,b) {
	return (a) & (b);
}
haxe.Int32.or = function(a,b) {
	return (a) | (b);
}
haxe.Int32.xor = function(a,b) {
	return (a) ^ (b);
}
haxe.Int32.neg = function(a) {
	return -(a);
}
haxe.Int32.complement = function(a) {
	return ~(a);
}
haxe.Int32.compare = function(a,b) {
	return a - b;
}
haxe.Int32.prototype.__class__ = haxe.Int32;
net.alphatab.model.Voice = function(factory,index) { if( factory === $_ ) return; {
	this.duration = factory.newDuration();
	this.notes = new Array();
	this.index = index;
	this.direction = net.alphatab.model.VoiceDirection.None;
	this.isEmpty = true;
}}
net.alphatab.model.Voice.__name__ = ["net","alphatab","model","Voice"];
net.alphatab.model.Voice.prototype.addNote = function(note) {
	note.voice = this;
	this.notes.push(note);
	this.isEmpty = false;
}
net.alphatab.model.Voice.prototype.beat = null;
net.alphatab.model.Voice.prototype.direction = null;
net.alphatab.model.Voice.prototype.duration = null;
net.alphatab.model.Voice.prototype.index = null;
net.alphatab.model.Voice.prototype.isEmpty = null;
net.alphatab.model.Voice.prototype.isRestVoice = function() {
	return this.notes.length == 0;
}
net.alphatab.model.Voice.prototype.notes = null;
net.alphatab.model.Voice.prototype.__class__ = net.alphatab.model.Voice;
net.alphatab.file.FileFormatException = function(str) { if( str === $_ ) return; {
	if(str == null) str = "";
	this.message = str;
}}
net.alphatab.file.FileFormatException.__name__ = ["net","alphatab","file","FileFormatException"];
net.alphatab.file.FileFormatException.prototype.message = null;
net.alphatab.file.FileFormatException.prototype.__class__ = net.alphatab.file.FileFormatException;
net.alphatab.platform.BinaryReader = function(p) { if( p === $_ ) return; {
	null;
}}
net.alphatab.platform.BinaryReader.__name__ = ["net","alphatab","platform","BinaryReader"];
net.alphatab.platform.BinaryReader.prototype._buffer = null;
net.alphatab.platform.BinaryReader.prototype._pos = null;
net.alphatab.platform.BinaryReader.prototype.decodeFloat = function(precisionBits,exponentBits) {
	var length = (precisionBits + exponentBits) + 1;
	var size = length >> 3;
	var bias = Math.floor(Math.pow(2,exponentBits - 1) - 1);
	var signal = this.readBits(precisionBits + exponentBits,1,size);
	var exponent = this.readBits(precisionBits,exponentBits,size);
	var significand = 0;
	var divisor = 2;
	var curByte = (length + (-precisionBits >> 3)) - 1;
	var startBit;
	do {
		var byteValue = this.readByteForBits(++curByte,size);
		startBit = precisionBits % 8;
		if(startBit == 0) startBit = 8;
		var mask = 1 << startBit;
		while((mask >>= 1) != 0) {
			if((byteValue & mask) != 0) {
				significand += 1 / divisor;
			}
			divisor *= 2;
		}
	} while((precisionBits -= startBit) != 0);
	this._pos += size;
	if(exponent == (bias << 1) + 1) {
		return 0;
	}
	else {
		if(exponent != 0 || significand != 0) {
			var ret;
			if(exponent == 0) {
				ret = Math.pow(2,-bias + 1) * significand;
			}
			else {
				ret = (Math.pow(2,exponent - bias) * (1 + significand));
			}
			return ret * (1 + signal * -2);
		}
		else {
			return 0;
		}
	}
}
net.alphatab.platform.BinaryReader.prototype.decodeInt = function(bits,signed) {
	var x = this.readBits(0,bits,Math.floor(bits / 8));
	var max = Math.floor(Math.pow(2,bits));
	var result = ((signed && x >= max / 2)?x - max:x);
	this._pos += Math.floor(bits / 8);
	return result;
}
net.alphatab.platform.BinaryReader.prototype.getPosition = function() {
	return this._pos;
}
net.alphatab.platform.BinaryReader.prototype.getSize = function() {
	return this._buffer.length;
}
net.alphatab.platform.BinaryReader.prototype.initialize = function(data) {
	this._buffer = data;
	this._pos = 0;
}
net.alphatab.platform.BinaryReader.prototype.readBits = function(start,length,size) {
	var offsetLeft = (start + length) % 8;
	var offsetRight = start % 8;
	var curByte = (size - (start >> 3)) - 1;
	var lastByte = size + (-(start + length) >> 3);
	var diff = curByte - lastByte;
	var sum = (this.readByteForBits(curByte,size) >> offsetRight) & ((1 << ((diff != 0?8 - offsetRight:length))) - 1);
	if(diff != 0 && offsetLeft != 0) {
		sum += (this.readByteForBits(lastByte++,size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight;
	}
	while(diff != 0) {
		sum += this.shl(this.readByteForBits(lastByte++,size),(diff-- << 3) - offsetRight);
	}
	return sum;
}
net.alphatab.platform.BinaryReader.prototype.readBool = function() {
	return this.readByte() == 1;
}
net.alphatab.platform.BinaryReader.prototype.readByte = function() {
	var data = this._buffer.charCodeAt(this._pos);
	data = (data & 255);
	this._pos++;
	return data;
}
net.alphatab.platform.BinaryReader.prototype.readByteForBits = function(i,size) {
	return this._buffer.charCodeAt(((this._pos + size) - i) - 1) & 255;
}
net.alphatab.platform.BinaryReader.prototype.readDouble = function() {
	return this.decodeFloat(52,11);
}
net.alphatab.platform.BinaryReader.prototype.readInt32 = function() {
	return this.decodeInt(32,true);
}
net.alphatab.platform.BinaryReader.prototype.seek = function(pos) {
	this._pos = pos;
}
net.alphatab.platform.BinaryReader.prototype.shl = function(a,b) {
	{
		var _g = 0;
		while(_g < b) {
			var i = _g++;
			a = this.shl1(a);
		}
	}
	return a;
}
net.alphatab.platform.BinaryReader.prototype.shl1 = function(a) {
	a = a % -2147483648;
	if((a & 1073741824) == 1073741824) {
		a -= 1073741824;
		a *= 2;
		a += -2147483648;
	}
	else a *= 2;
	return a;
}
net.alphatab.platform.BinaryReader.prototype.__class__ = net.alphatab.platform.BinaryReader;
net.alphatab.model.Beat = function(factory) { if( factory === $_ ) return; {
	this.start = 960;
	this.effect = factory.newBeatEffect();
	this.voices = new Array();
	{
		var _g = 0;
		while(_g < 2) {
			var i = _g++;
			var voice = factory.newVoice(i);
			voice.beat = this;
			this.voices.push(voice);
		}
	}
}}
net.alphatab.model.Beat.__name__ = ["net","alphatab","model","Beat"];
net.alphatab.model.Beat.prototype.effect = null;
net.alphatab.model.Beat.prototype.getNotes = function() {
	var notes = new Array();
	{
		var _g = 0, _g1 = this.voices;
		while(_g < _g1.length) {
			var voice = _g1[_g];
			++_g;
			{
				var _g2 = 0, _g3 = voice.notes;
				while(_g2 < _g3.length) {
					var note = _g3[_g2];
					++_g2;
					notes.push(note);
				}
			}
		}
	}
	return notes;
}
net.alphatab.model.Beat.prototype.isRestBeat = function() {
	{
		var _g1 = 0, _g = this.voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var voice = this.voices[i];
			if(!voice.isEmpty && !voice.isRestVoice()) return false;
		}
	}
	return true;
}
net.alphatab.model.Beat.prototype.measure = null;
net.alphatab.model.Beat.prototype.setChord = function(chord) {
	chord.beat = this;
	this.effect.chord = chord;
}
net.alphatab.model.Beat.prototype.setText = function(text) {
	text.beat = this;
	this.text = text;
}
net.alphatab.model.Beat.prototype.start = null;
net.alphatab.model.Beat.prototype.tableChange = null;
net.alphatab.model.Beat.prototype.text = null;
net.alphatab.model.Beat.prototype.voices = null;
net.alphatab.model.Beat.prototype.__class__ = net.alphatab.model.Beat;
net.alphatab.model.effects.TremoloBarEffect = function(p) { if( p === $_ ) return; {
	this.points = new Array();
}}
net.alphatab.model.effects.TremoloBarEffect.__name__ = ["net","alphatab","model","effects","TremoloBarEffect"];
net.alphatab.model.effects.TremoloBarEffect.prototype.clone = function(factory) {
	var effect = factory.newTremoloBarEffect();
	effect.type = this.type;
	effect.value = this.value;
	{
		var _g1 = 0, _g = this.points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.points[i];
			effect.points.push(new net.alphatab.model.effects.BendPoint(point.position,point.value,point.vibrato));
		}
	}
	return effect;
}
net.alphatab.model.effects.TremoloBarEffect.prototype.points = null;
net.alphatab.model.effects.TremoloBarEffect.prototype.type = null;
net.alphatab.model.effects.TremoloBarEffect.prototype.value = null;
net.alphatab.model.effects.TremoloBarEffect.prototype.__class__ = net.alphatab.model.effects.TremoloBarEffect;
net.alphatab.tablature.TrackSpacing = function(p) { if( p === $_ ) return; {
	this.spacing = new Array();
	{
		var _g = 0;
		while(_g < 24) {
			var i = _g++;
			this.spacing.push(0);
		}
	}
}}
net.alphatab.tablature.TrackSpacing.__name__ = ["net","alphatab","tablature","TrackSpacing"];
net.alphatab.tablature.TrackSpacing.prototype.get = function(index) {
	var size = 0;
	var realIndex = net.alphatab.tablature.TrackSpacingPositionConverter.toInt(index);
	{
		var _g = 0;
		while(_g < realIndex) {
			var i = _g++;
			size += this.spacing[i];
		}
	}
	return size;
}
net.alphatab.tablature.TrackSpacing.prototype.getSize = function() {
	return this.get(net.alphatab.tablature.TrackSpacingPositions.Bottom);
}
net.alphatab.tablature.TrackSpacing.prototype.set = function(index,value) {
	var realIndex = net.alphatab.tablature.TrackSpacingPositionConverter.toInt(index);
	this.spacing[realIndex] = value;
}
net.alphatab.tablature.TrackSpacing.prototype.spacing = null;
net.alphatab.tablature.TrackSpacing.prototype.__class__ = net.alphatab.tablature.TrackSpacing;
ValueType = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] }
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
Type = function() { }
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	if(o.__enum__ != null) return null;
	return o.__class__;
}
Type.getEnum = function(o) {
	if(o == null) return null;
	return o.__enum__;
}
Type.getSuperClass = function(c) {
	return c.__super__;
}
Type.getClassName = function(c) {
	if(c == null) return null;
	var a = c.__name__;
	return a.join(".");
}
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
}
Type.resolveClass = function(name) {
	var cl;
	try {
		cl = eval(name);
	}
	catch( $e12 ) {
		{
			var e = $e12;
			{
				cl = null;
			}
		}
	}
	if(cl == null || cl.__name__ == null) return null;
	return cl;
}
Type.resolveEnum = function(name) {
	var e;
	try {
		e = eval(name);
	}
	catch( $e13 ) {
		{
			var err = $e13;
			{
				e = null;
			}
		}
	}
	if(e == null || e.__ename__ == null) return null;
	return e;
}
Type.createInstance = function(cl,args) {
	if(args.length <= 3) return new cl(args[0],args[1],args[2]);
	if(args.length > 8) throw "Too many arguments";
	return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
}
Type.createEmptyInstance = function(cl) {
	return new cl($_);
}
Type.createEnum = function(e,constr,params) {
	var f = Reflect.field(e,constr);
	if(f == null) throw "No such constructor " + constr;
	if(Reflect.isFunction(f)) {
		if(params == null) throw ("Constructor " + constr) + " need parameters";
		return f.apply(e,params);
	}
	if(params != null && params.length != 0) throw ("Constructor " + constr) + " does not need parameters";
	return f;
}
Type.createEnumIndex = function(e,index,params) {
	var c = Type.getEnumConstructs(e)[index];
	if(c == null) throw index + " is not a valid enum constructor index";
	return Type.createEnum(e,c,params);
}
Type.getInstanceFields = function(c) {
	var a = Reflect.fields(c.prototype);
	a.remove("__class__");
	return a;
}
Type.getClassFields = function(c) {
	var a = Reflect.fields(c);
	a.remove("__name__");
	a.remove("__interfaces__");
	a.remove("__super__");
	a.remove("prototype");
	return a;
}
Type.getEnumConstructs = function(e) {
	return e.__constructs__;
}
Type["typeof"] = function(v) {
	switch(typeof(v)) {
	case "boolean":{
		return ValueType.TBool;
	}break;
	case "string":{
		return ValueType.TClass(String);
	}break;
	case "number":{
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	}break;
	case "object":{
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = v.__class__;
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	}break;
	case "function":{
		if(v.__name__ != null) return ValueType.TObject;
		return ValueType.TFunction;
	}break;
	case "undefined":{
		return ValueType.TNull;
	}break;
	default:{
		return ValueType.TUnknown;
	}break;
	}
}
Type.enumEq = function(a,b) {
	if(a == b) return true;
	try {
		if(a[0] != b[0]) return false;
		{
			var _g1 = 2, _g = a.length;
			while(_g1 < _g) {
				var i = _g1++;
				if(!Type.enumEq(a[i],b[i])) return false;
			}
		}
		var e = a.__enum__;
		if(e != b.__enum__ || e == null) return false;
	}
	catch( $e14 ) {
		{
			var e = $e14;
			{
				return false;
			}
		}
	}
	return true;
}
Type.enumConstructor = function(e) {
	return e[0];
}
Type.enumParameters = function(e) {
	return e.slice(2);
}
Type.enumIndex = function(e) {
	return e[1];
}
Type.prototype.__class__ = Type;
js.Lib = function() { }
js.Lib.__name__ = ["js","Lib"];
js.Lib.isIE = null;
js.Lib.isOpera = null;
js.Lib.document = null;
js.Lib.window = null;
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
}
js.Lib.eval = function(code) {
	return eval(code);
}
js.Lib.setErrorHandler = function(f) {
	js.Lib.onerror = f;
}
js.Lib.prototype.__class__ = js.Lib;
net.alphatab.model.TimeSignature = function(factory) { if( factory === $_ ) return; {
	this.numerator = 4;
	this.denominator = factory.newDuration();
}}
net.alphatab.model.TimeSignature.__name__ = ["net","alphatab","model","TimeSignature"];
net.alphatab.model.TimeSignature.prototype.copy = function(timeSignature) {
	timeSignature.numerator = this.numerator;
	this.denominator.copy(timeSignature.denominator);
}
net.alphatab.model.TimeSignature.prototype.denominator = null;
net.alphatab.model.TimeSignature.prototype.numerator = null;
net.alphatab.model.TimeSignature.prototype.__class__ = net.alphatab.model.TimeSignature;
if(!net.alphatab.midi) net.alphatab.midi = {}
net.alphatab.midi.MidiMessageUtils = function() { }
net.alphatab.midi.MidiMessageUtils.__name__ = ["net","alphatab","midi","MidiMessageUtils"];
net.alphatab.midi.MidiMessageUtils.fixValue = function(value) {
	var fixedValue = value;
	fixedValue = Math.min(fixedValue,127);
	fixedValue = Math.max(fixedValue,0);
	return fixedValue;
}
net.alphatab.midi.MidiMessageUtils.fixChannel = function(channel) {
	var fixedChannel = channel;
	fixedChannel = Math.min(fixedChannel,15);
	fixedChannel = Math.max(fixedChannel,0);
	return fixedChannel;
}
net.alphatab.midi.MidiMessageUtils.noteOn = function(channel,note,velocity) {
	return (("0" + net.alphatab.midi.MidiMessageUtils.channelToString(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + net.alphatab.midi.MidiMessageUtils.valueToString(net.alphatab.midi.MidiMessageUtils.fixValue(note))) + net.alphatab.midi.MidiMessageUtils.valueToString(net.alphatab.midi.MidiMessageUtils.fixValue(velocity));
}
net.alphatab.midi.MidiMessageUtils.noteOff = function(channel,note,velocity) {
	return (("1" + net.alphatab.midi.MidiMessageUtils.channelToString(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + net.alphatab.midi.MidiMessageUtils.valueToString(net.alphatab.midi.MidiMessageUtils.fixValue(note))) + net.alphatab.midi.MidiMessageUtils.valueToString(net.alphatab.midi.MidiMessageUtils.fixValue(velocity));
}
net.alphatab.midi.MidiMessageUtils.controlChange = function(channel,controller,value) {
	return (("2" + net.alphatab.midi.MidiMessageUtils.channelToString(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + net.alphatab.midi.MidiMessageUtils.valueToString(net.alphatab.midi.MidiMessageUtils.fixValue(controller))) + net.alphatab.midi.MidiMessageUtils.valueToString(net.alphatab.midi.MidiMessageUtils.fixValue(value));
}
net.alphatab.midi.MidiMessageUtils.programChange = function(channel,instrument) {
	return ("3" + net.alphatab.midi.MidiMessageUtils.channelToString(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + net.alphatab.midi.MidiMessageUtils.valueToString(net.alphatab.midi.MidiMessageUtils.fixValue(instrument));
}
net.alphatab.midi.MidiMessageUtils.pitchBend = function(channel,value) {
	return ("4" + net.alphatab.midi.MidiMessageUtils.channelToString(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + net.alphatab.midi.MidiMessageUtils.valueToString(net.alphatab.midi.MidiMessageUtils.fixValue(value));
}
net.alphatab.midi.MidiMessageUtils.systemReset = function() {
	return "5";
}
net.alphatab.midi.MidiMessageUtils.tempoInUSQ = function(usq) {
	return "6" + net.alphatab.midi.MidiMessageUtils.intToString(usq);
}
net.alphatab.midi.MidiMessageUtils.timeSignature = function(ts) {
	return (((("7" + net.alphatab.midi.MidiMessageUtils.intToString(ts.numerator)) + ",") + net.alphatab.midi.MidiMessageUtils.intToString(ts.denominator.index())) + ",") + net.alphatab.midi.MidiMessageUtils.intToString(ts.denominator.value);
}
net.alphatab.midi.MidiMessageUtils.intToString = function(num) {
	return StringTools.hex(num);
}
net.alphatab.midi.MidiMessageUtils.channelToString = function(num) {
	return StringTools.hex(num,1);
}
net.alphatab.midi.MidiMessageUtils.valueToString = function(num) {
	return StringTools.hex(num,2);
}
net.alphatab.midi.MidiMessageUtils.prototype.__class__ = net.alphatab.midi.MidiMessageUtils;
net.alphatab.tablature.ViewLayout = function(p) { if( p === $_ ) return; {
	this.init(1);
	this.contentPadding = new net.alphatab.model.Padding(0,0,0,0);
}}
net.alphatab.tablature.ViewLayout.__name__ = ["net","alphatab","tablature","ViewLayout"];
net.alphatab.tablature.ViewLayout.prototype._cache = null;
net.alphatab.tablature.ViewLayout.prototype.checkDefaultSpacing = function(ts) {
	var bufferSeparator = ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines) - ts.get(net.alphatab.tablature.TrackSpacingPositions.BufferSeparator);
	if(bufferSeparator < this.minBufferSeparator) {
		ts.set(net.alphatab.tablature.TrackSpacingPositions.BufferSeparator,Math.round(this.minBufferSeparator - bufferSeparator));
	}
	var checkPosition = ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
	if(checkPosition >= 0 && checkPosition < this.minTopSpacing) {
		ts.set(net.alphatab.tablature.TrackSpacingPositions.Top,Math.round(this.minTopSpacing - checkPosition));
	}
}
net.alphatab.tablature.ViewLayout.prototype.chordFretIndexSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.chordFretSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.chordNoteSize = null;
net.alphatab.tablature.ViewLayout.prototype.chordStringSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.contentPadding = null;
net.alphatab.tablature.ViewLayout.prototype.effectSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.firstMeasureSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.firstTrackSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.fontScale = null;
net.alphatab.tablature.ViewLayout.prototype.getDefaultChordSpacing = function() {
	var spacing = 0;
	spacing += (6 * this.chordFretSpacing) + this.chordFretSpacing;
	spacing += Math.round(15.0 * this.scale);
	return Math.round(spacing);
}
net.alphatab.tablature.ViewLayout.prototype.getMinSpacing = function(duration) {
	switch(duration.value) {
	case 1:{
		return 50.0 * this.scale;
	}break;
	case 2:{
		return 30.0 * this.scale;
	}break;
	case 4:{
		return 55.0 * this.scale;
	}break;
	case 8:{
		return 20.0 * this.scale;
	}break;
	default:{
		return 18.0 * this.scale;
	}break;
	}
}
net.alphatab.tablature.ViewLayout.prototype.getNoteOrientation = function(x,y,note) {
	var noteAsString = "";
	if(note.isTiedNote) {
		noteAsString = "L";
	}
	else if(note.effect.deadNote) {
		noteAsString = "X";
	}
	else {
		noteAsString = Std.string(note.value);
	}
	noteAsString = (note.effect.ghostNote?("(" + noteAsString) + ")":noteAsString);
	return this.getOrientation(x,y,noteAsString);
}
net.alphatab.tablature.ViewLayout.prototype.getOrientation = function(x,y,str) {
	this.tablature.canvas.setFont(net.alphatab.tablature.drawing.DrawingResources.noteFont);
	var size = this.tablature.canvas.measureText(str);
	return new net.alphatab.model.Rectangle(x,y,size,net.alphatab.tablature.drawing.DrawingResources.noteFontHeight);
}
net.alphatab.tablature.ViewLayout.prototype.getSpacingForQuarter = function(duration) {
	return (960 / duration.time()) * this.getMinSpacing(duration);
}
net.alphatab.tablature.ViewLayout.prototype.getVoiceWidth = function(voice) {
	var duration = voice.duration;
	if(duration != null) {
		switch(duration.value) {
		case 1:{
			return (90.0 * this.scale);
		}break;
		case 2:{
			return (65.0 * this.scale);
		}break;
		case 4:{
			return (45.0 * this.scale);
		}break;
		case 8:{
			return (30.0 * this.scale);
		}break;
		case 16:{
			return (20.0 * this.scale);
		}break;
		case 32:{
			return (17.0 * this.scale);
		}break;
		default:{
			return (15.0 * this.scale);
		}break;
		}
	}
	return 20.0 * this.scale;
}
net.alphatab.tablature.ViewLayout.prototype.height = null;
net.alphatab.tablature.ViewLayout.prototype.init = function(scale) {
	this.stringSpacing = (10 * scale);
	this.scoreLineSpacing = (8 * scale);
	this.scale = scale;
	this.fontScale = scale;
	this.firstMeasureSpacing = Math.round(10 * scale);
	this.minBufferSeparator = this.firstMeasureSpacing;
	this.minTopSpacing = Math.round(30 * scale);
	this.minScoreTabSpacing = this.firstMeasureSpacing;
	this.scoreSpacing = (this.scoreLineSpacing * 4) + this.minScoreTabSpacing;
	this.firstTrackSpacing = this.firstMeasureSpacing;
	this.trackSpacing = (10 * scale);
	this.chordFretIndexSpacing = Math.round(8 * scale);
	this.chordStringSpacing = Math.round(5 * scale);
	this.chordFretSpacing = Math.round(6 * scale);
	this.chordNoteSize = Math.round(4 * scale);
	this.repeatEndingSpacing = Math.round(20 * scale);
	this.textSpacing = Math.round(15 * scale);
	this.markerSpacing = Math.round(15 * scale);
	this.tupletoSpacing = Math.round(15 * scale);
	this.effectSpacing = Math.round(10 * scale);
}
net.alphatab.tablature.ViewLayout.prototype.isFirstMeasure = function(measure) {
	return measure.number() == 1;
}
net.alphatab.tablature.ViewLayout.prototype.isLastMeasure = function(measure) {
	return measure.number() == this.tablature.track.song.measureHeaders.length;
}
net.alphatab.tablature.ViewLayout.prototype.layoutSize = null;
net.alphatab.tablature.ViewLayout.prototype.markerSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.minBufferSeparator = null;
net.alphatab.tablature.ViewLayout.prototype.minScoreTabSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.minTopSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.paintCache = function(graphics,area,fromX,fromY) {
	if(this._cache == null) {
		this.updateCache(graphics,area,fromX,fromY);
		return;
	}
	haxe.Log.trace("Painting _cache",{ fileName : "ViewLayout.hx", lineNumber : 118, className : "net.alphatab.tablature.ViewLayout", methodName : "paintCache"});
	this._cache.draw();
}
net.alphatab.tablature.ViewLayout.prototype.paintLines = function(track,ts,context,x,y,width) {
	if(width > 0) {
		var tempX = Math.max(0,x);
		var tempY = y;
		var posY = tempY + ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		{
			var _g = 1;
			while(_g < 6) {
				var i = _g++;
				context.get(net.alphatab.tablature.drawing.DrawingLayers.Lines).startFigure();
				context.get(net.alphatab.tablature.drawing.DrawingLayers.Lines).addLine(Math.round(tempX),Math.round(posY),Math.round(tempX + width),Math.round(posY));
				posY += (this.scoreLineSpacing);
			}
		}
		tempY += ts.get(net.alphatab.tablature.TrackSpacingPositions.Tablature);
		{
			var _g1 = 0, _g = track.stringCount();
			while(_g1 < _g) {
				var i = _g1++;
				context.get(net.alphatab.tablature.drawing.DrawingLayers.Lines).startFigure();
				context.get(net.alphatab.tablature.drawing.DrawingLayers.Lines).addLine(Math.round(tempX),Math.round(tempY),Math.round(tempX + width),Math.round(tempY));
				tempY += this.stringSpacing;
			}
		}
	}
}
net.alphatab.tablature.ViewLayout.prototype.paintSong = function(ctx,clientArea,x,y) {
	null;
}
net.alphatab.tablature.ViewLayout.prototype.prepareLayout = function(clientArea,x,y) {
	null;
}
net.alphatab.tablature.ViewLayout.prototype.repeatEndingSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.scale = null;
net.alphatab.tablature.ViewLayout.prototype.scoreLineSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.scoreSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.setTablature = function(tablature) {
	this.tablature = tablature;
}
net.alphatab.tablature.ViewLayout.prototype.songManager = function() {
	return this.tablature.songManager;
}
net.alphatab.tablature.ViewLayout.prototype.stringSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.tablature = null;
net.alphatab.tablature.ViewLayout.prototype.textSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.trackSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.tupletoSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.updateCache = function(graphics,area,fromX,fromY) {
	haxe.Log.trace("Updating _cache",{ fileName : "ViewLayout.hx", lineNumber : 124, className : "net.alphatab.tablature.ViewLayout", methodName : "updateCache"});
	this._cache = new net.alphatab.tablature.drawing.DrawingContext(this.scale);
	this._cache.graphics = graphics;
	this.paintSong(this._cache,area,fromX,fromY);
	this.paintCache(graphics,area,fromX,fromY);
}
net.alphatab.tablature.ViewLayout.prototype.updateSong = function() {
	if(this.tablature.track == null) return;
	haxe.Log.trace("Updating Song Data",{ fileName : "ViewLayout.hx", lineNumber : 145, className : "net.alphatab.tablature.ViewLayout", methodName : "updateSong"});
	this.updateTracks();
	haxe.Log.trace("Updating Song Data finished",{ fileName : "ViewLayout.hx", lineNumber : 147, className : "net.alphatab.tablature.ViewLayout", methodName : "updateSong"});
}
net.alphatab.tablature.ViewLayout.prototype.updateTracks = function() {
	var song = this.tablature.track.song;
	var measureCount = song.measureHeaders.length;
	var track = this.tablature.track;
	track.previousBeat = null;
	track.update(this);
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			var header = song.measureHeaders[i];
			header.update(this,track);
			var measure = track.measures[i];
			measure.create(this);
			measure.update(this);
		}
	}
}
net.alphatab.tablature.ViewLayout.prototype.width = null;
net.alphatab.tablature.ViewLayout.prototype.__class__ = net.alphatab.tablature.ViewLayout;
net.alphatab.tablature.model.TripletGroup = function(voice) { if( voice === $_ ) return; {
	this._voiceIndex = voice;
	this._voices = new Array();
}}
net.alphatab.tablature.model.TripletGroup.__name__ = ["net","alphatab","tablature","model","TripletGroup"];
net.alphatab.tablature.model.TripletGroup.prototype._triplet = null;
net.alphatab.tablature.model.TripletGroup.prototype._voiceIndex = null;
net.alphatab.tablature.model.TripletGroup.prototype._voices = null;
net.alphatab.tablature.model.TripletGroup.prototype.check = function(voice) {
	if(this._voices.length == 0) {
		this._triplet = voice.duration.tuplet.enters;
	}
	else {
		if(voice.index != this._voiceIndex || voice.duration.tuplet.enters != this._triplet || this.isFull()) return false;
	}
	this._voices.push(voice);
	return true;
}
net.alphatab.tablature.model.TripletGroup.prototype.isFull = function() {
	return this._voices.length == this._triplet;
}
net.alphatab.tablature.model.TripletGroup.prototype.paint = function(layout,context,x,y) {
	var scale = layout.scale;
	var offset = net.alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).width / 2;
	var startX = this._voices[0].beat.getRealPosX(layout) + offset;
	var endX = this._voices[this._voices.length - 1].beat.getRealPosX(layout) + offset;
	var key = this._voices[0].beat.measure.keySignature();
	var clef = net.alphatab.model.MeasureClefConverter.toInt(this._voices[0].beat.measure.clef);
	var realY = y;
	var draw = (this._voiceIndex == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2));
	var fill = (this._voiceIndex == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	var s = Std.string(this._triplet);
	context.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.effectFont);
	var w = context.graphics.measureText(s);
	var lineW = endX - startX;
	draw.addLine(startX,realY + 5 * scale,startX,realY);
	draw.addLine(startX,realY,(startX + (lineW / 2)) - w,realY);
	draw.addString(s,net.alphatab.tablature.drawing.DrawingResources.effectFont,startX + ((lineW - w) / 2),realY);
	draw.addLine((startX + (lineW / 2)) + w,realY,endX,realY);
	draw.addLine(endX,realY + 5 * scale,endX,realY);
}
net.alphatab.tablature.model.TripletGroup.prototype.__class__ = net.alphatab.tablature.model.TripletGroup;
net.alphatab.tablature.TrackSpacingPositions = { __ename__ : ["net","alphatab","tablature","TrackSpacingPositions"], __constructs__ : ["Top","Marker","Text","BufferSeparator","RepeatEnding","Chord","ScoreUpLines","ScoreMiddleLines","ScoreDownLines","Tupleto","AccentuatedEffect","HarmonicEffect","TapingEffect","LetRingEffect","PalmMuteEffect","BeatVibratoEffect","VibratoEffect","FadeIn","Bend","TablatureTopSeparator","Tablature","TremoloBarDown","Lyric","Bottom"] }
net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect = ["AccentuatedEffect",10];
net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect = ["BeatVibratoEffect",15];
net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Bend = ["Bend",18];
net.alphatab.tablature.TrackSpacingPositions.Bend.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Bend.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Bottom = ["Bottom",23];
net.alphatab.tablature.TrackSpacingPositions.Bottom.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Bottom.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.BufferSeparator = ["BufferSeparator",3];
net.alphatab.tablature.TrackSpacingPositions.BufferSeparator.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.BufferSeparator.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Chord = ["Chord",5];
net.alphatab.tablature.TrackSpacingPositions.Chord.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Chord.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.FadeIn = ["FadeIn",17];
net.alphatab.tablature.TrackSpacingPositions.FadeIn.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.FadeIn.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect = ["HarmonicEffect",11];
net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.LetRingEffect = ["LetRingEffect",13];
net.alphatab.tablature.TrackSpacingPositions.LetRingEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.LetRingEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Lyric = ["Lyric",22];
net.alphatab.tablature.TrackSpacingPositions.Lyric.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Lyric.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Marker = ["Marker",1];
net.alphatab.tablature.TrackSpacingPositions.Marker.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Marker.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect = ["PalmMuteEffect",14];
net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.RepeatEnding = ["RepeatEnding",4];
net.alphatab.tablature.TrackSpacingPositions.RepeatEnding.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.RepeatEnding.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.ScoreDownLines = ["ScoreDownLines",8];
net.alphatab.tablature.TrackSpacingPositions.ScoreDownLines.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.ScoreDownLines.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines = ["ScoreMiddleLines",7];
net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines = ["ScoreUpLines",6];
net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Tablature = ["Tablature",20];
net.alphatab.tablature.TrackSpacingPositions.Tablature.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Tablature.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.TablatureTopSeparator = ["TablatureTopSeparator",19];
net.alphatab.tablature.TrackSpacingPositions.TablatureTopSeparator.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.TablatureTopSeparator.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.TapingEffect = ["TapingEffect",12];
net.alphatab.tablature.TrackSpacingPositions.TapingEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.TapingEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Text = ["Text",2];
net.alphatab.tablature.TrackSpacingPositions.Text.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Text.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Top = ["Top",0];
net.alphatab.tablature.TrackSpacingPositions.Top.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Top.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.TremoloBarDown = ["TremoloBarDown",21];
net.alphatab.tablature.TrackSpacingPositions.TremoloBarDown.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.TremoloBarDown.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Tupleto = ["Tupleto",9];
net.alphatab.tablature.TrackSpacingPositions.Tupleto.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Tupleto.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.VibratoEffect = ["VibratoEffect",16];
net.alphatab.tablature.TrackSpacingPositions.VibratoEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.VibratoEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
Reflect = function() { }
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	if(o.hasOwnProperty != null) return o.hasOwnProperty(field);
	var arr = Reflect.fields(o);
	{ var $it15 = arr.iterator();
	while( $it15.hasNext() ) { var t = $it15.next();
	if(t == field) return true;
	}}
	return false;
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	}
	catch( $e16 ) {
		{
			var e = $e16;
			null;
		}
	}
	return v;
}
Reflect.setField = function(o,field,value) {
	o[field] = value;
}
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
}
Reflect.fields = function(o) {
	if(o == null) return new Array();
	var a = new Array();
	if(o.hasOwnProperty) {
		
					for(var i in o)
						if( o.hasOwnProperty(i) )
							a.push(i);
				;
	}
	else {
		var t;
		try {
			t = o.__proto__;
		}
		catch( $e17 ) {
			{
				var e = $e17;
				{
					t = null;
				}
			}
		}
		if(t != null) o.__proto__ = null;
		
					for(var i in o)
						if( i != "__proto__" )
							a.push(i);
				;
		if(t != null) o.__proto__ = t;
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && f.__name__ == null;
}
Reflect.compare = function(a,b) {
	return ((a == b)?0:((((a) > (b))?1:-1)));
}
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
}
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return (t == "string" || (t == "object" && !v.__enum__) || (t == "function" && v.__name__ != null));
}
Reflect.deleteField = function(o,f) {
	if(!Reflect.hasField(o,f)) return false;
	delete(o[f]);
	return true;
}
Reflect.copy = function(o) {
	var o2 = { }
	{
		var _g = 0, _g1 = Reflect.fields(o);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			o2[f] = Reflect.field(o,f);
		}
	}
	return o2;
}
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = new Array();
		{
			var _g1 = 0, _g = arguments.length;
			while(_g1 < _g) {
				var i = _g1++;
				a.push(arguments[i]);
			}
		}
		return f(a);
	}
}
Reflect.prototype.__class__ = Reflect;
net.alphatab.tablature.drawing.TempoPainter = function() { }
net.alphatab.tablature.drawing.TempoPainter.__name__ = ["net","alphatab","tablature","drawing","TempoPainter"];
net.alphatab.tablature.drawing.TempoPainter.paintTempo = function(context,x,y,scale) {
	var realScale = scale / 5.0;
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	var draw = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw);
	var iWidth = Math.round(scale * 1.33);
	var iHeight = Math.round(scale * 3.5);
	net.alphatab.tablature.drawing.NotePainter.paintNote(layer,Math.floor(x + (realScale)),Math.floor(y + (iHeight - (scale))),realScale / 1.6,true,net.alphatab.tablature.drawing.DrawingResources.tempoFont);
	draw.startFigure();
	draw.moveTo(x + iWidth,y);
	draw.lineTo(x + iWidth,Math.floor(y + (iHeight - (0.66 * scale))));
}
net.alphatab.tablature.drawing.TempoPainter.prototype.__class__ = net.alphatab.tablature.drawing.TempoPainter;
net.alphatab.tablature.drawing.KeySignaturePainter = function() { }
net.alphatab.tablature.drawing.KeySignaturePainter.__name__ = ["net","alphatab","tablature","drawing","KeySignaturePainter"];
net.alphatab.tablature.drawing.KeySignaturePainter.paintFlat = function(context,x,y,layout) {
	var scale = layout.scale * 1.2;
	y -= Math.round(2 * layout.scoreLineSpacing);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeyFlat,x,y,scale);
}
net.alphatab.tablature.drawing.KeySignaturePainter.paintNatural = function(context,x,y,layout) {
	var scale = layout.scale * 1.2;
	y -= Math.round(2 * layout.scoreLineSpacing);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeyNormal,x,y,scale);
}
net.alphatab.tablature.drawing.KeySignaturePainter.paintSharp = function(context,x,y,layout) {
	var scale = layout.scale * 1.2;
	y -= Math.round(1.5 * layout.scoreLineSpacing);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeySharp,x,y,scale);
}
net.alphatab.tablature.drawing.KeySignaturePainter.paintSmallFlat = function(layer,x,y,layout) {
	y -= layout.scoreLineSpacing;
	var scale = layout.scale;
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeyFlat,x,y,scale);
}
net.alphatab.tablature.drawing.KeySignaturePainter.paintSmallNatural = function(layer,x,y,layout) {
	y -= layout.scoreLineSpacing;
	var scale = layout.scale;
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeyNormal,x,y,scale);
}
net.alphatab.tablature.drawing.KeySignaturePainter.paintSmallSharp = function(layer,x,y,layout) {
	var scale = layout.scale;
	y -= Math.round(layout.scoreLineSpacing);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeySharp,x,y,scale);
}
net.alphatab.tablature.drawing.KeySignaturePainter.prototype.__class__ = net.alphatab.tablature.drawing.KeySignaturePainter;
net.alphatab.model.MixTableChange = function(p) { if( p === $_ ) return; {
	this.volume = new net.alphatab.model.MixTableItem();
	this.balance = new net.alphatab.model.MixTableItem();
	this.chorus = new net.alphatab.model.MixTableItem();
	this.reverb = new net.alphatab.model.MixTableItem();
	this.phaser = new net.alphatab.model.MixTableItem();
	this.tremolo = new net.alphatab.model.MixTableItem();
	this.instrument = new net.alphatab.model.MixTableItem();
	this.tempo = new net.alphatab.model.MixTableItem();
	this.hideTempo = true;
}}
net.alphatab.model.MixTableChange.__name__ = ["net","alphatab","model","MixTableChange"];
net.alphatab.model.MixTableChange.prototype.balance = null;
net.alphatab.model.MixTableChange.prototype.chorus = null;
net.alphatab.model.MixTableChange.prototype.hideTempo = null;
net.alphatab.model.MixTableChange.prototype.instrument = null;
net.alphatab.model.MixTableChange.prototype.phaser = null;
net.alphatab.model.MixTableChange.prototype.reverb = null;
net.alphatab.model.MixTableChange.prototype.tempo = null;
net.alphatab.model.MixTableChange.prototype.tempoName = null;
net.alphatab.model.MixTableChange.prototype.tremolo = null;
net.alphatab.model.MixTableChange.prototype.volume = null;
net.alphatab.model.MixTableChange.prototype.__class__ = net.alphatab.model.MixTableChange;
net.alphatab.tablature.model.JoinedType = { __ename__ : ["net","alphatab","tablature","model","JoinedType"], __constructs__ : ["NoneLeft","NoneRight","Left","Right"] }
net.alphatab.tablature.model.JoinedType.Left = ["Left",2];
net.alphatab.tablature.model.JoinedType.Left.toString = $estr;
net.alphatab.tablature.model.JoinedType.Left.__enum__ = net.alphatab.tablature.model.JoinedType;
net.alphatab.tablature.model.JoinedType.NoneLeft = ["NoneLeft",0];
net.alphatab.tablature.model.JoinedType.NoneLeft.toString = $estr;
net.alphatab.tablature.model.JoinedType.NoneLeft.__enum__ = net.alphatab.tablature.model.JoinedType;
net.alphatab.tablature.model.JoinedType.NoneRight = ["NoneRight",1];
net.alphatab.tablature.model.JoinedType.NoneRight.toString = $estr;
net.alphatab.tablature.model.JoinedType.NoneRight.__enum__ = net.alphatab.tablature.model.JoinedType;
net.alphatab.tablature.model.JoinedType.Right = ["Right",3];
net.alphatab.tablature.model.JoinedType.Right.toString = $estr;
net.alphatab.tablature.model.JoinedType.Right.__enum__ = net.alphatab.tablature.model.JoinedType;
net.alphatab.tablature.model.NoteImpl = function(factory) { if( factory === $_ ) return; {
	net.alphatab.model.Note.apply(this,[factory]);
	this._noteOrientation = new net.alphatab.model.Rectangle(0,0,0,0);
}}
net.alphatab.tablature.model.NoteImpl.__name__ = ["net","alphatab","tablature","model","NoteImpl"];
net.alphatab.tablature.model.NoteImpl.__super__ = net.alphatab.model.Note;
for(var k in net.alphatab.model.Note.prototype ) net.alphatab.tablature.model.NoteImpl.prototype[k] = net.alphatab.model.Note.prototype[k];
net.alphatab.tablature.model.NoteImpl.prototype._accidental = null;
net.alphatab.tablature.model.NoteImpl.prototype._noteOrientation = null;
net.alphatab.tablature.model.NoteImpl.prototype.beatImpl = function() {
	return this.voice.beat;
}
net.alphatab.tablature.model.NoteImpl.prototype.calculateBendOverflow = function(layout) {
	var point = null;
	{
		var _g = 0, _g1 = this.effect.bend.points;
		while(_g < _g1.length) {
			var curr = _g1[_g];
			++_g;
			if(point == null || point.value < curr.value) point = curr;
		}
	}
	if(point == null) return 0;
	var fullHeight = point.value * (6 * layout.scale);
	var heightToTabNote = (this.string - 1) * layout.stringSpacing;
	return Math.round(fullHeight - heightToTabNote);
}
net.alphatab.tablature.model.NoteImpl.prototype.getpaintPosition = function(index) {
	return this.measureImpl().ts.get(index);
}
net.alphatab.tablature.model.NoteImpl.prototype.measureImpl = function() {
	return this.voice.beat.measureImpl();
}
net.alphatab.tablature.model.NoteImpl.prototype.noteForTie = function() {
	var m = this.measureImpl();
	var nextIndex;
	do {
		var i = m.beatCount() - 1;
		while(i >= 0) {
			var beat = m.beats[i];
			var voice = beat.voices[this.voice.index];
			if(beat.start < this.voice.beat.start && !voice.isRestVoice()) {
				{
					var _g = 0, _g1 = voice.notes;
					while(_g < _g1.length) {
						var note = _g1[_g];
						++_g;
						if(note.string == this.string) {
							return note;
						}
					}
				}
			}
			i--;
		}
		nextIndex = m.number() - 2;
		m = (nextIndex >= 0?m.trackImpl().measures[nextIndex]:null);
	} while(m != null && m.number() >= this.measureImpl().number() - 3 && m.ts == this.measureImpl().ts);
	return null;
}
net.alphatab.tablature.model.NoteImpl.prototype.paint = function(layout,context,x,y) {
	var spacing = this.voice.beat.spacing();
	this.paintScoreNote(layout,context,x,y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines),spacing);
	this.paintOfflineEffects(layout,context,x,y,spacing);
	this.paintTablatureNote(layout,context,x,y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.Tablature),spacing);
}
net.alphatab.tablature.model.NoteImpl.prototype.paintAccentuated = function(layout,context,x,y) {
	var layer = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.AccentuatedNote,x,y,layout.scale);
}
net.alphatab.tablature.model.NoteImpl.prototype.paintBend = function(layout,context,nextBeat,fromX,fromY) {
	var scale = layout.scale;
	var iX = fromX;
	var iY = fromY - (2.0 * scale);
	var iXTo;
	var iMinY = iY - 60 * scale;
	if(nextBeat == null) {
		iXTo = (this.voice.beat.measureImpl().posX + this.voice.beat.measureImpl().width) + this.voice.beat.measureImpl().spacing;
	}
	else {
		if(nextBeat.getNotes().length > 0) {
			iXTo = (((nextBeat.measureImpl().posX + nextBeat.measureImpl().headerImpl().getLeftSpacing(layout)) + nextBeat.posX) + (nextBeat.spacing() * scale)) + 5 * scale;
		}
		else {
			iXTo = ((nextBeat.measureImpl().posX + nextBeat.posX) + nextBeat.spacing()) + 5 * scale;
		}
	}
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var draw = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	if(this.effect.bend.points.length >= 2) {
		var dX = (iXTo - iX) / 12;
		var dY = (iY - iMinY) / 12;
		draw.startFigure();
		{
			var _g1 = 0, _g = this.effect.bend.points.length - 1;
			while(_g1 < _g) {
				var i = _g1++;
				var firstPt = this.effect.bend.points[i];
				var secondPt = this.effect.bend.points[i + 1];
				if(firstPt.value == secondPt.value && i == this.effect.bend.points.length - 2) continue;
				var arrow = (firstPt.value != secondPt.value);
				var firstLoc = new net.alphatab.model.Point(iX + (dX * firstPt.position),iY - dY * firstPt.value);
				var secondLoc = new net.alphatab.model.Point(iX + (dX * secondPt.position),iY - dY * secondPt.value);
				var firstHelper = new net.alphatab.model.Point(firstLoc.x + ((secondLoc.x - firstLoc.x)),iY - dY * firstPt.value);
				draw.addBezier(firstLoc.x,firstLoc.y,firstHelper.x,firstHelper.y,secondLoc.x,secondLoc.y,secondLoc.x,secondLoc.y);
				var arrowSize = 4 * scale;
				if(secondPt.value > firstPt.value) {
					draw.addLine(secondLoc.x - 0.5,secondLoc.y,(secondLoc.x - arrowSize) - 0.5,secondLoc.y + arrowSize);
					draw.addLine(secondLoc.x - 0.5,secondLoc.y,(secondLoc.x + arrowSize) - 0.5,secondLoc.y + arrowSize);
				}
				else if(secondPt.value != firstPt.value) {
					draw.addLine(secondLoc.x - 0.5,secondLoc.y,(secondLoc.x - arrowSize) - 0.5,secondLoc.y - arrowSize);
					draw.addLine(secondLoc.x - 0.5,secondLoc.y,(secondLoc.x + arrowSize) - 0.5,secondLoc.y - arrowSize);
				}
				if(secondPt.value != 0) {
					var dV = (secondPt.value - firstPt.value) * 0.25;
					var up = dV > 0;
					dV = Math.abs(dV);
					var s = "";
					if(dV == 1) s = "full";
					else if(dV > 1) {
						s += Std.string(Math.floor(dV)) + " ";
						dV -= Math.floor(dV);
					}
					if(dV == 0.25) s += "1/4";
					else if(dV == 0.5) s += "1/2";
					else if(dV == 0.75) s += "3/4";
					context.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.defaultFont);
					var size = context.graphics.measureText(s);
					var y = (up?(secondLoc.y - net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight) + (2 * scale):secondLoc.y - (2 * scale));
					var x = secondLoc.x - size / 2;
					fill.addString(s,net.alphatab.tablature.drawing.DrawingResources.defaultFont,x,y);
				}
			}
		}
	}
}
net.alphatab.tablature.model.NoteImpl.prototype.paintEffects = function(layout,context,x,y,spacing) {
	var scale = layout.scale;
	var realX = x;
	var realY = y + this.tabPosY;
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	if(this.effect.isGrace()) {
		var value = (this.effect.grace.isDead?"X":Std.string(this.effect.grace.fret));
		fill.addString(value,net.alphatab.tablature.drawing.DrawingResources.graceFont,Math.round(this._noteOrientation.x - 7 * scale),this._noteOrientation.y);
	}
	if(this.effect.isBend()) {
		var nextBeat = layout.songManager().getNextBeat(this.voice.beat);
		if(nextBeat != null && nextBeat.measureImpl().ts != this.measureImpl().ts) nextBeat = null;
		this.paintBend(layout,context,nextBeat,this._noteOrientation.x + this._noteOrientation.width,realY);
	}
	else if(this.effect.slide || this.effect.hammer) {
		var nextFromX = x;
		var nextNote = layout.songManager().getNextNote(this.measureImpl(),this.voice.beat.start,this.voice.index,this.string);
		if(this.effect.slide) {
			this.paintSlide(layout,context,nextNote,realX,realY,nextFromX);
		}
		else if(this.effect.hammer) {
			this.paintHammer(layout,context,nextNote,realX,realY);
		}
	}
	if(this.effect.isTrill()) {
		var str = ("(" + this.effect.trill.fret) + ")";
		fill.addString(str,net.alphatab.tablature.drawing.DrawingResources.graceFont,Math.round((this._noteOrientation.x + this._noteOrientation.width) + 3 * scale),this._noteOrientation.y);
	}
}
net.alphatab.tablature.model.NoteImpl.prototype.paintGrace = function(layout,context,x,y) {
	var scale = layout.scoreLineSpacing / 2.25;
	var realX = x - (2 * scale);
	var realY = y - (9 * layout.scale);
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var s = (this.effect.deadNote?net.alphatab.tablature.drawing.MusicFont.GraceDeadNote:net.alphatab.tablature.drawing.MusicFont.GraceNote);
	fill.addMusicSymbol(s,realX - scale * 1.33,realY,layout.scale);
	if(this.effect.grace.transition == net.alphatab.model.effects.GraceEffectTransition.Hammer || this.effect.grace.transition == net.alphatab.model.effects.GraceEffectTransition.Slide) {
		this.paintHammer(layout,context,null,x - (15 * layout.scale),y + (5 * layout.scale),true);
	}
}
net.alphatab.tablature.model.NoteImpl.prototype.paintHammer = function(layout,context,nextNote,x,y,forceDown) {
	if(forceDown == null) forceDown = false;
	var xScale = layout.scale;
	var yScale = layout.stringSpacing / 10.0;
	var realX = x + (7.0 * xScale);
	var realY = y - (net.alphatab.tablature.drawing.DrawingResources.noteFontHeight * layout.scale);
	var width = (nextNote != null?(nextNote.voice.beat.getRealPosX(layout) - 4 * xScale) - realX:10.0 * xScale);
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var wScale = width / 16;
	var hScale = ((this.string > 3 || forceDown)?-1:1);
	if(this.string > 3 || forceDown) realY += (net.alphatab.tablature.drawing.DrawingResources.noteFontHeight * layout.scale) * 2;
	fill.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.HammerPullUp,realX,realY,layout.scale * wScale,layout.scale * hScale);
}
net.alphatab.tablature.model.NoteImpl.prototype.paintHeavyAccentuated = function(layout,context,x,y) {
	var layer = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.HeavyAccentuatedNote,x,y,layout.scale);
}
net.alphatab.tablature.model.NoteImpl.prototype.paintOfflineEffects = function(layout,context,x,y,spacing) {
	var effect = this.effect;
	var realX = x + 3 * layout.scale;
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var draw = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	if(effect.accentuatedNote) {
		var realY = y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect);
		this.paintAccentuated(layout,context,realX,realY);
	}
	else if(effect.heavyAccentuatedNote) {
		var realY = y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect);
		this.paintHeavyAccentuated(layout,context,realX,realY);
	}
	if(effect.isHarmonic()) {
		var realY = y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect);
		var key = "";
		switch(effect.harmonic.type) {
		case net.alphatab.model.effects.HarmonicType.Natural:{
			key = "N.H";
		}break;
		case net.alphatab.model.effects.HarmonicType.Artificial:{
			key = "A.H";
		}break;
		case net.alphatab.model.effects.HarmonicType.Tapped:{
			key = "T.H";
		}break;
		case net.alphatab.model.effects.HarmonicType.Pinch:{
			key = "P.H";
		}break;
		case net.alphatab.model.effects.HarmonicType.Semi:{
			key = "S.H";
		}break;
		}
		fill.addString(key,net.alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
	}
	if(effect.letRing) {
		var beat = this.voice.beat.previousBeat;
		var prevRing = false;
		var nextRing = false;
		var isPreviousFirst = false;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.getNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var impl = note;
					if(note.effect.letRing && impl.voice.beat.measureImpl().ts == this.voice.beat.measureImpl().ts) {
						prevRing = true;
						break;
					}
				}
			}
		}
		beat = this.voice.beat.nextBeat;
		var endX = realX + this.voice.beat.width();
		var nextOnSameLine = false;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.getNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var impl = note;
					if(note.effect.letRing) {
						nextRing = true;
						if(impl.voice.beat.measureImpl().ts == this.voice.beat.measureImpl().ts) {
							endX = beat.getRealPosX(layout);
						}
						break;
					}
				}
			}
		}
		var realY = y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.LetRingEffect);
		var height = net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight;
		var startX = realX;
		if(!nextRing) {
			endX -= this.voice.beat.width() / 2;
		}
		if(!prevRing) {
			fill.addString("ring",net.alphatab.tablature.drawing.DrawingResources.effectFont,startX,realY);
			context.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.effectFont);
			startX += context.graphics.measureText("ring") + (6 * layout.scale);
		}
		else {
			startX -= 6 * layout.scale;
		}
		if(prevRing || nextRing) {
			draw.startFigure();
			draw.addLine(startX,Math.round(realY),endX,Math.round(realY));
		}
		if(!nextRing && prevRing) {
			var size = 8 * layout.scale;
			draw.addLine(endX,realY - (size / 2),endX,realY + (size / 2));
		}
	}
	if(effect.palmMute) {
		var beat = this.voice.beat.previousBeat;
		var prevPalm = false;
		var nextPalm = false;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.getNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var impl = note;
					if(note.effect.palmMute && impl.voice.beat.measureImpl().ts == this.voice.beat.measureImpl().ts) {
						prevPalm = true;
						break;
					}
				}
			}
		}
		beat = this.voice.beat.nextBeat;
		var endX = realX + this.voice.beat.width();
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.getNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var impl = note;
					if(note.effect.palmMute) {
						nextPalm = true;
						if(impl.voice.beat.measureImpl().ts == this.voice.beat.measureImpl().ts) {
							endX = beat.getRealPosX(layout);
						}
						break;
					}
				}
			}
		}
		var realY = y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect);
		var height = net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight;
		var startX = realX;
		if(!nextPalm) {
			endX -= 6 * layout.scale;
		}
		if(!prevPalm) {
			fill.addString("P.M.",net.alphatab.tablature.drawing.DrawingResources.effectFont,startX,realY);
			context.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.effectFont);
			startX += context.graphics.measureText("P.M.") + (6 * layout.scale);
		}
		else {
			startX -= 6 * layout.scale;
		}
		draw.startFigure();
		draw.addLine(startX,Math.round(realY),endX,Math.round(realY));
		if(!nextPalm && prevPalm) {
			var size = 8 * layout.scale;
			draw.addLine(endX,realY - (size / 2),endX,realY + (size / 2));
		}
	}
	if(effect.vibrato) {
		var realY = y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.VibratoEffect);
		this.paintVibrato(layout,context,realX,realY,0.75);
	}
	if(effect.isTrill()) {
		var realY = y + this.getpaintPosition(net.alphatab.tablature.TrackSpacingPositions.VibratoEffect);
		this.paintTrill(layout,context,realX,realY);
	}
}
net.alphatab.tablature.model.NoteImpl.prototype.paintScoreNote = function(layout,context,x,y,spacing) {
	var scoreSpacing = layout.scoreLineSpacing;
	var direction = this.voice.beatGroup.direction;
	var key = this.measureImpl().keySignature();
	var clef = net.alphatab.model.MeasureClefConverter.toInt(this.measureImpl().clef);
	var realX = x + 4 * layout.scale;
	var realY1 = y + this.scorePosY;
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	var effectLayer = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	if(this.isTiedNote) {
		var noteForTie = this.noteForTie();
		var tieScale = scoreSpacing / 8.0;
		var tieX = realX - (20.0 * tieScale);
		var tieY = realY1;
		var tieWidth = 20.0 * tieScale;
		var tieHeight = 30.0 * tieScale;
		if(noteForTie != null) {
			tieX = noteForTie.voice.beat.lastPaintX + 15 * layout.scale;
			tieY = y + this.scorePosY;
			tieWidth = (realX - tieX);
			tieHeight = (20.0 * tieScale);
		}
		if(tieWidth > 0 && tieHeight > 0) {
			var wScale = tieWidth / 20;
			fill.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.HammerPullUp,tieX,realY1,wScale,layout.scale);
		}
	}
	var accidentalX = x - 2 * layout.scale;
	if(this._accidental == 1) {
		net.alphatab.tablature.drawing.KeySignaturePainter.paintSmallNatural(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	else if(this._accidental == 2) {
		net.alphatab.tablature.drawing.KeySignaturePainter.paintSmallSharp(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	else if(this._accidental == 3) {
		net.alphatab.tablature.drawing.KeySignaturePainter.paintSmallFlat(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	if(this.effect.isHarmonic()) {
		var full = this.voice.duration.value >= 4;
		var layer = (full?fill:effectLayer);
		net.alphatab.tablature.drawing.NotePainter.paintHarmonic(layer,realX,realY1 + 1,layout.scale);
	}
	else if(this.effect.deadNote) {
		net.alphatab.tablature.drawing.NotePainter.paintDeadNote(fill,realX,realY1,layout.scale,net.alphatab.tablature.drawing.DrawingResources.clefFont);
	}
	else {
		var full = this.voice.duration.value >= 4;
		net.alphatab.tablature.drawing.NotePainter.paintNote(fill,realX,realY1,layout.scale,full,net.alphatab.tablature.drawing.DrawingResources.clefFont);
	}
	if(this.effect.isGrace()) {
		this.paintGrace(layout,context,realX,realY1);
	}
	if(this.voice.duration.isDotted || this.voice.duration.isDoubleDotted) {
		this.voice.paintDot(layout,fill,realX + (12.0 * (scoreSpacing / 8.0)),realY1 + (layout.scoreLineSpacing / 2),scoreSpacing / 10.0);
	}
	var xMove = (direction == net.alphatab.model.VoiceDirection.Up?net.alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).width:0);
	var realY2 = y + this.voice.beatGroup.getY2(layout,this.posX() + spacing,key,clef);
	if(this.effect.staccato) {
		var Size = 3;
		var stringX = realX + xMove;
		var stringY = (realY2 + (4 * (((direction == net.alphatab.model.VoiceDirection.Up)?-1:1))));
		fill.addCircle(stringX - (Size / 2),stringY - (Size / 2),Size);
	}
	if(this.effect.isTremoloPicking()) {
		var trillY = (direction != net.alphatab.model.VoiceDirection.Up?realY1 + Math.floor(8 * layout.scale):realY1 - Math.floor(16 * layout.scale));
		var trillX = (direction != net.alphatab.model.VoiceDirection.Up?realX - Math.floor(5 * layout.scale):realX + Math.floor(3 * layout.scale));
		var s = "";
		switch(this.effect.tremoloPicking.duration.value) {
		case 8:{
			s = net.alphatab.tablature.drawing.MusicFont.TrillUpEigth;
			if(direction == net.alphatab.model.VoiceDirection.Down) trillY += Math.floor(8 * layout.scale);
		}break;
		case 16:{
			s = net.alphatab.tablature.drawing.MusicFont.TrillUpSixteenth;
			if(direction == net.alphatab.model.VoiceDirection.Down) trillY += Math.floor(4 * layout.scale);
		}break;
		case 32:{
			s = net.alphatab.tablature.drawing.MusicFont.TrillUpThirtySecond;
		}break;
		}
		if(s != "") fill.addMusicSymbol(s,trillX,trillY,layout.scale);
	}
}
net.alphatab.tablature.model.NoteImpl.prototype.paintSlide = function(layout,context,nextNote,x,y,nextX) {
	var xScale = layout.scale;
	var yScale = layout.stringSpacing / 10.0;
	var yMove = 3.0 * yScale;
	var realX = x;
	var realY = y;
	var rextY = realY;
	var draw = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	draw.startFigure();
	if(this.effect.slideType == net.alphatab.model.SlideType.IntoFromBelow) {
		realY += yMove;
		rextY -= yMove;
		draw.addLine(realX - (5 * xScale),realY,realX + (3 * xScale),rextY);
	}
	else if(this.effect.slideType == net.alphatab.model.SlideType.IntoFromAbove) {
		realY -= yMove;
		rextY += yMove;
		draw.addLine(realX - (5 * xScale),realY,realX + (3 * xScale),rextY);
	}
	else if(this.effect.slideType == net.alphatab.model.SlideType.OutDownWards) {
		realY -= yMove;
		rextY += yMove;
		draw.addLine(realX + (10 * xScale),realY,realX + (18 * xScale),rextY);
	}
	else if(this.effect.slideType == net.alphatab.model.SlideType.OutUpWards) {
		realY += yMove;
		rextY -= yMove;
		draw.addLine(realX + (10 * xScale),realY,realX + (18 * xScale),rextY);
	}
	else if(nextNote != null) {
		var fNextX = nextNote.voice.beat.getRealPosX(layout);
		rextY = realY;
		if(nextNote.value < this.value) {
			realY -= yMove;
			rextY += yMove;
		}
		else if(nextNote.value > this.value) {
			realY += yMove;
			rextY -= yMove;
		}
		else {
			realY -= yMove;
			rextY -= yMove;
		}
		draw.addLine(realX + (13 * xScale),realY,fNextX,rextY);
		if(this.effect.slideType == net.alphatab.model.SlideType.SlowSlideTo) {
			this.paintHammer(layout,context,nextNote,x,y);
		}
	}
	else {
		draw.addLine(realX + (13 * xScale),realY - yMove,realX + (19 * xScale),realY - yMove);
	}
}
net.alphatab.tablature.model.NoteImpl.prototype.paintTablatureNote = function(layout,context,x,y,spacing) {
	var realX = x + Math.round(3 * layout.scale);
	var realY = y + this.tabPosY;
	this._noteOrientation.x = realX;
	this._noteOrientation.y = realY;
	this._noteOrientation.width = 0;
	this._noteOrientation.height = 0;
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	if(!this.isTiedNote) {
		this._noteOrientation = layout.getNoteOrientation(realX,realY,this);
		var visualNote = (this.effect.deadNote?"X":Std.string(this.value));
		visualNote = (this.effect.ghostNote?("(" + visualNote) + ")":visualNote);
		fill.addString(visualNote,net.alphatab.tablature.drawing.DrawingResources.noteFont,this._noteOrientation.x,this._noteOrientation.y);
	}
	this.paintEffects(layout,context,x,y,spacing);
}
net.alphatab.tablature.model.NoteImpl.prototype.paintTrill = function(layout,context,x,y) {
	var str = "Tr";
	context.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.effectFont);
	var size = context.graphics.measureText(str);
	var scale = layout.scale;
	var realX = (x + size) - 2 * scale;
	var realY = y + (net.alphatab.tablature.drawing.DrawingResources.effectFontHeight - (5.0 * scale)) / 2.0;
	var width = (this.voice.width - size) - (2.0 * scale);
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	fill.addString(str,net.alphatab.tablature.drawing.DrawingResources.effectFont,x,y);
}
net.alphatab.tablature.model.NoteImpl.prototype.paintVibrato = function(layout,context,x,y,symbolScale) {
	var scale = layout.scale;
	var realX = x - 2 * scale;
	var realY = y + (2.0 * scale);
	var width = this.voice.width;
	var fill = (this.voice.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var step = (18 * scale) * symbolScale;
	var loops = Math.floor(Math.max(1,(width / step)));
	var s = "";
	{
		var _g = 0;
		while(_g < loops) {
			var i = _g++;
			fill.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.VibratoLeftRight,realX,realY,layout.scale * symbolScale);
			realX += step;
		}
	}
}
net.alphatab.tablature.model.NoteImpl.prototype.posX = function() {
	return this.voice.beat.posX;
}
net.alphatab.tablature.model.NoteImpl.prototype.scorePosY = null;
net.alphatab.tablature.model.NoteImpl.prototype.tabPosY = null;
net.alphatab.tablature.model.NoteImpl.prototype.update = function(layout) {
	this._accidental = this.measureImpl().getNoteAccidental(this.realValue());
	this.tabPosY = Math.round((this.string * layout.stringSpacing) - layout.stringSpacing);
	this.scorePosY = this.voice.beatGroup.getY1(layout,this,this.measureImpl().keySignature(),net.alphatab.model.MeasureClefConverter.toInt(this.measureImpl().clef));
}
net.alphatab.tablature.model.NoteImpl.prototype.voiceImpl = function() {
	return this.voice;
}
net.alphatab.tablature.model.NoteImpl.prototype.__class__ = net.alphatab.tablature.model.NoteImpl;
net.alphatab.MyTrace = function() { }
net.alphatab.MyTrace.__name__ = ["net","alphatab","MyTrace"];
net.alphatab.MyTrace.init = function() {
	haxe.Log.trace = $closure(net.alphatab.MyTrace,"trace");
}
net.alphatab.MyTrace.trace = function(v,i) {
	null;
}
net.alphatab.MyTrace.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
net.alphatab.MyTrace.time = function() {
	return Std.string(Date.now().getTime());
}
net.alphatab.MyTrace.prototype.__class__ = net.alphatab.MyTrace;
net.alphatab.model.Measure = function(header) { if( header === $_ ) return; {
	this.header = header;
	this.clef = net.alphatab.model.MeasureClef.Treble;
	this.beats = new Array();
}}
net.alphatab.model.Measure.__name__ = ["net","alphatab","model","Measure"];
net.alphatab.model.Measure.prototype.addBeat = function(beat) {
	beat.measure = this;
	this.beats.push(beat);
}
net.alphatab.model.Measure.prototype.beatCount = function() {
	return this.beats.length;
}
net.alphatab.model.Measure.prototype.beats = null;
net.alphatab.model.Measure.prototype.clef = null;
net.alphatab.model.Measure.prototype.end = function() {
	return this.start() + this.length();
}
net.alphatab.model.Measure.prototype.hasMarker = function() {
	return this.header.hasMarker();
}
net.alphatab.model.Measure.prototype.header = null;
net.alphatab.model.Measure.prototype.isRepeatOpen = function() {
	return this.header.isRepeatOpen;
}
net.alphatab.model.Measure.prototype.keySignature = function() {
	return this.header.keySignature;
}
net.alphatab.model.Measure.prototype.length = function() {
	return this.header.length();
}
net.alphatab.model.Measure.prototype.marker = function() {
	return this.header.marker;
}
net.alphatab.model.Measure.prototype.number = function() {
	return this.header.number;
}
net.alphatab.model.Measure.prototype.repeatClose = function() {
	return this.header.repeatClose;
}
net.alphatab.model.Measure.prototype.start = function() {
	return this.header.start;
}
net.alphatab.model.Measure.prototype.tempo = function() {
	return this.header.tempo;
}
net.alphatab.model.Measure.prototype.timeSignature = function() {
	return this.header.timeSignature;
}
net.alphatab.model.Measure.prototype.track = null;
net.alphatab.model.Measure.prototype.tripletFeel = function() {
	return this.header.tripletFeel;
}
net.alphatab.model.Measure.prototype.__class__ = net.alphatab.model.Measure;
net.alphatab.tablature.model.MeasureImpl = function(header) { if( header === $_ ) return; {
	net.alphatab.model.Measure.apply(this,[header]);
	this._registeredAccidentals = new Array();
	{
		var _g = 0;
		while(_g < 11) {
			var i = _g++;
			var a = new Array();
			{
				var _g1 = 0;
				while(_g1 < 7) {
					var j = _g1++;
					a.push(false);
				}
			}
			this._registeredAccidentals.push(a);
		}
	}
	this._voiceGroups = new Array();
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			this._voiceGroups.push(new Array());
		}
	}
}}
net.alphatab.tablature.model.MeasureImpl.__name__ = ["net","alphatab","tablature","model","MeasureImpl"];
net.alphatab.tablature.model.MeasureImpl.__super__ = net.alphatab.model.Measure;
for(var k in net.alphatab.model.Measure.prototype ) net.alphatab.tablature.model.MeasureImpl.prototype[k] = net.alphatab.model.Measure.prototype[k];
net.alphatab.tablature.model.MeasureImpl.makeVoice = function(layout,voice,previousVoice,group) {
	voice.width = layout.getVoiceWidth(voice);
	voice.beatGroup = (group);
	if(previousVoice != null) {
		voice.previousBeat = (previousVoice);
		previousVoice.nextBeat = (voice);
	}
}
net.alphatab.tablature.model.MeasureImpl.getStartPosition = function(measure,start,spacing) {
	var newStart = start - measure.start();
	var displayPosition = 0.0;
	if(newStart > 0) {
		var position = (newStart / 960);
		displayPosition = (position * spacing);
	}
	return displayPosition;
}
net.alphatab.tablature.model.MeasureImpl.prototype._accentuated = null;
net.alphatab.tablature.model.MeasureImpl.prototype._beatVibrato = null;
net.alphatab.tablature.model.MeasureImpl.prototype._bend = null;
net.alphatab.tablature.model.MeasureImpl.prototype._bendOverFlow = null;
net.alphatab.tablature.model.MeasureImpl.prototype._chord = null;
net.alphatab.tablature.model.MeasureImpl.prototype._fadeIn = null;
net.alphatab.tablature.model.MeasureImpl.prototype._harmonic = null;
net.alphatab.tablature.model.MeasureImpl.prototype._letRing = null;
net.alphatab.tablature.model.MeasureImpl.prototype._palmMute = null;
net.alphatab.tablature.model.MeasureImpl.prototype._previousMeasure = null;
net.alphatab.tablature.model.MeasureImpl.prototype._registeredAccidentals = null;
net.alphatab.tablature.model.MeasureImpl.prototype._tapping = null;
net.alphatab.tablature.model.MeasureImpl.prototype._text = null;
net.alphatab.tablature.model.MeasureImpl.prototype._tremoloBar = null;
net.alphatab.tablature.model.MeasureImpl.prototype._tremoloBarOverFlow = null;
net.alphatab.tablature.model.MeasureImpl.prototype._tupleto = null;
net.alphatab.tablature.model.MeasureImpl.prototype._vibrato = null;
net.alphatab.tablature.model.MeasureImpl.prototype._voiceGroups = null;
net.alphatab.tablature.model.MeasureImpl.prototype._widthBeats = null;
net.alphatab.tablature.model.MeasureImpl.prototype.calculateBeats = function(layout) {
	var minDuration = null;
	var previousVoices = new Array();
	var groups = new Array();
	var notEmptyVoicesChecked = new Array();
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			previousVoices.push(null);
			groups.push(null);
			notEmptyVoicesChecked.push(false);
			this._voiceGroups[v] = new Array();
		}
	}
	this._widthBeats = 0;
	this.notEmptyBeats = 0;
	this.notEmptyVoices = 0;
	{
		var _g1 = 0, _g = this.beatCount();
		while(_g1 < _g) {
			var i = _g1++;
			var beat = this.beats[i];
			beat.reset();
			{
				var _g2 = 0;
				while(_g2 < 2) {
					var v = _g2++;
					var voice = beat.voices[v];
					if(!voice.isEmpty) {
						voice.reset();
						if(minDuration == null || voice.duration.time() <= minDuration.time()) {
							minDuration = voice.duration;
						}
						if(!notEmptyVoicesChecked[v]) {
							notEmptyVoicesChecked[v] = true;
							this.notEmptyVoices++;
						}
						{
							var _g3 = 0, _g4 = voice.notes;
							while(_g3 < _g4.length) {
								var note = _g4[_g3];
								++_g3;
								var noteImpl = note;
								voice.check(noteImpl);
							}
						}
						if(!voice.isRestVoice()) {
							beat.check(voice.minNote);
							beat.check(voice.maxNote);
							if((groups[v] == null) || !this.canJoin(layout.songManager(),voice,previousVoices[v])) {
								groups[v] = new net.alphatab.tablature.model.BeatGroup(v);
								this._voiceGroups[v].push(groups[v]);
							}
							groups[v].checkVoice(voice);
						}
						else {
							{
								var _g3 = 0;
								while(_g3 < 2) {
									var v2 = _g3++;
									if(v2 != voice.index) {
										var voice2 = beat.getVoiceImpl(v2);
										if(!voice2.isEmpty && voice2.duration.equals(voice.duration)) {
											if(!voice2.isRestVoice() || !voice2.isHiddenSilence) {
												voice.isHiddenSilence = true;
												break;
											}
										}
									}
								}
							}
						}
						net.alphatab.tablature.model.MeasureImpl.makeVoice(layout,voice,previousVoices[v],groups[v]);
						previousVoices[v] = voice;
					}
				}
			}
			this.makeBeat(layout,beat,this.trackImpl().previousBeat,false);
			this.trackImpl().previousBeat = beat;
		}
	}
	{
		var _g = 0, _g1 = this._voiceGroups;
		while(_g < _g1.length) {
			var voiceGroup = _g1[_g];
			++_g;
			{
				var _g2 = 0;
				while(_g2 < voiceGroup.length) {
					var group = voiceGroup[_g2];
					++_g2;
					group.finish(layout,this);
				}
			}
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.calculateKeySignatureSpacing = function(layout) {
	var spacing = 0;
	if(this.headerImpl().shouldPaintKeySignature) {
		if(this.keySignature() <= 7) {
			spacing += Math.round((6 * layout.scale) * this.keySignature());
		}
		else {
			spacing += Math.round((6 * layout.scale) * (this.keySignature() - 7));
		}
		if(this._previousMeasure != null) {
			if(this._previousMeasure.keySignature() <= 7) {
				spacing += Math.round((6 * layout.scale) * this._previousMeasure.keySignature());
			}
			else {
				spacing += Math.round((6 * layout.scale) * (this._previousMeasure.keySignature() - 7));
			}
		}
	}
	return spacing;
}
net.alphatab.tablature.model.MeasureImpl.prototype.calculateMeasureChanges = function(layout) {
	this.isPaintClef = false;
	this._previousMeasure = ((layout.isFirstMeasure(this)?null:layout.songManager().getPreviousMeasure(this)));
	if(this._previousMeasure == null || this.clef != this._previousMeasure.clef) {
		this.isPaintClef = true;
		this.headerImpl().notifyClefSpacing(Math.round(40 * layout.scale));
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.calculateWidth = function(layout) {
	this.width = this._widthBeats;
	this.width += this.getFirstNoteSpacing(layout);
	this.width += ((this.repeatClose() > 0)?20:0);
	this.width += this.headerImpl().getLeftSpacing(layout);
	this.width += this.headerImpl().getRightSpacing(layout);
	this.headerImpl().notifyWidth(this.width);
}
net.alphatab.tablature.model.MeasureImpl.prototype.canJoin = function(manager,b1,b2) {
	if(b1 == null || b2 == null || b1.isRestVoice() || b2.isRestVoice()) {
		return false;
	}
	var divisionLength = this.divisionLength;
	var start = this.start();
	var start1 = (manager.getRealStart(this,b1.beat.start) - start);
	var start2 = (manager.getRealStart(this,b2.beat.start) - start);
	if(b1.duration.value < 8 || b2.duration.value < 8) {
		return (start1 == start2);
	}
	var p1 = Math.floor((divisionLength + start1) / divisionLength);
	var p2 = Math.floor((divisionLength + start2) / divisionLength);
	return (p1 == p2);
}
net.alphatab.tablature.model.MeasureImpl.prototype.checkEffects = function(layout,note) {
	var effect = note.effect;
	if(effect.accentuatedNote || effect.heavyAccentuatedNote) {
		this._accentuated = true;
	}
	if(effect.isHarmonic()) {
		this._harmonic = true;
	}
	if(note.voice.beat.effect.tapping || note.voice.beat.effect.slapping || note.voice.beat.effect.popping) {
		this._tapping = true;
	}
	if(effect.palmMute) {
		this._palmMute = true;
	}
	if(note.voice.beat.effect.fadeIn) {
		this._fadeIn = true;
	}
	if(effect.vibrato || effect.isTrill()) {
		this._vibrato = true;
	}
	if(note.voice.beat.effect.vibrato) {
		this._beatVibrato = true;
	}
	if(effect.letRing) {
		this._letRing = true;
	}
	if(effect.isBend()) {
		this._bend = true;
		this._bendOverFlow = Math.round(Math.max(this._bendOverFlow,Math.round(note.calculateBendOverflow(layout))));
	}
	if(note.voice.beat.effect.isTremoloBar()) {
		this._tremoloBar = true;
		this._tremoloBarOverFlow = Math.round(note.voice.beat.calculateTremoloBarOverflow(layout));
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.checkValue = function(layout,note,direction) {
	var y = note.scorePosY;
	var upOffset = net.alphatab.tablature.model.BeatGroup.getUpOffset(layout);
	var downOffset = net.alphatab.tablature.model.BeatGroup.getDownOffset(layout);
	if(direction == net.alphatab.model.VoiceDirection.Up && y > this.maxY) {
		this.maxY = y;
	}
	else if(direction == net.alphatab.model.VoiceDirection.Down && (y + downOffset) > this.maxY) {
		this.maxY = Math.floor((y + downOffset) + 2);
	}
	if(direction == net.alphatab.model.VoiceDirection.Up && (y - upOffset) < this.minY) {
		this.minY = Math.floor((y - upOffset) - 2);
	}
	else if(direction == net.alphatab.model.VoiceDirection.Down && y < this.minY) {
		this.minY = y;
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.clearRegisteredAccidentals = function() {
	var _g = 0;
	while(_g < 11) {
		var i = _g++;
		{
			var _g1 = 0;
			while(_g1 < 7) {
				var n = _g1++;
				this._registeredAccidentals[i][n] = false;
			}
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.create = function(layout) {
	this.divisionLength = net.alphatab.model.SongManager.getDivisionLength(this.header);
	this.resetSpacing();
	this.clearRegisteredAccidentals();
	this.calculateBeats(layout);
	this.calculateWidth(layout);
	this.isFirstOfLine = false;
}
net.alphatab.tablature.model.MeasureImpl.prototype.divisionLength = null;
net.alphatab.tablature.model.MeasureImpl.prototype.getBeatSpacing = function(beat) {
	return ((beat.start - this.start()) * this.spacing) / this.length();
}
net.alphatab.tablature.model.MeasureImpl.prototype.getClefSpacing = function(layout) {
	return this.headerImpl().getClefSpacing(layout,this);
}
net.alphatab.tablature.model.MeasureImpl.prototype.getFirstNoteSpacing = function(layout) {
	return this.headerImpl().getFirstNoteSpacing(layout,this);
}
net.alphatab.tablature.model.MeasureImpl.prototype.getKeySignatureSpacing = function(layout) {
	return this.headerImpl().getKeySignatureSpacing(layout,this);
}
net.alphatab.tablature.model.MeasureImpl.prototype.getMaxQuarterSpacing = function() {
	return this.quarterSpacing;
}
net.alphatab.tablature.model.MeasureImpl.prototype.getNoteAccidental = function(noteValue) {
	if(noteValue >= 0 && noteValue < 128) {
		var key = this.keySignature();
		var note = (noteValue % 12);
		var octave = Math.round(noteValue / 12);
		var accidentalValue = ((key <= 7?2:3));
		var accidentalNotes = ((key <= 7?net.alphatab.tablature.model.MeasureImpl.ACCIDENTAL_SHARP_NOTES:net.alphatab.tablature.model.MeasureImpl.ACCIDENTAL_FLAT_NOTES));
		var isAccidentalNote = net.alphatab.tablature.model.MeasureImpl.ACCIDENTAL_NOTES[note];
		var isAccidentalKey = net.alphatab.tablature.model.MeasureImpl.KEY_SIGNATURES[key][accidentalNotes[note]] == accidentalValue;
		if(isAccidentalKey != isAccidentalNote && !this._registeredAccidentals[octave][accidentalNotes[note]]) {
			this._registeredAccidentals[octave][accidentalNotes[note]] = true;
			return ((isAccidentalNote?accidentalValue:1));
		}
		if(isAccidentalKey == isAccidentalNote && this._registeredAccidentals[octave][accidentalNotes[note]]) {
			this._registeredAccidentals[octave][accidentalNotes[note]] = false;
			return ((isAccidentalNote?accidentalValue:1));
		}
	}
	return 0;
}
net.alphatab.tablature.model.MeasureImpl.prototype.getTimeSignatureSymbol = function(number) {
	switch(number) {
	case 1:{
		return net.alphatab.tablature.drawing.MusicFont.Num1;
	}break;
	case 2:{
		return net.alphatab.tablature.drawing.MusicFont.Num2;
	}break;
	case 3:{
		return net.alphatab.tablature.drawing.MusicFont.Num3;
	}break;
	case 4:{
		return net.alphatab.tablature.drawing.MusicFont.Num4;
	}break;
	case 5:{
		return net.alphatab.tablature.drawing.MusicFont.Num5;
	}break;
	case 6:{
		return net.alphatab.tablature.drawing.MusicFont.Num6;
	}break;
	case 7:{
		return net.alphatab.tablature.drawing.MusicFont.Num7;
	}break;
	case 8:{
		return net.alphatab.tablature.drawing.MusicFont.Num8;
	}break;
	case 9:{
		return net.alphatab.tablature.drawing.MusicFont.Num9;
	}break;
	}
	return null;
}
net.alphatab.tablature.model.MeasureImpl.prototype.headerImpl = function() {
	return this.header;
}
net.alphatab.tablature.model.MeasureImpl.prototype.height = function() {
	return this.ts.getSize();
}
net.alphatab.tablature.model.MeasureImpl.prototype.isFirstOfLine = null;
net.alphatab.tablature.model.MeasureImpl.prototype.isPaintClef = null;
net.alphatab.tablature.model.MeasureImpl.prototype.lyricBeatIndex = null;
net.alphatab.tablature.model.MeasureImpl.prototype.makeBeat = function(layout,beat,previousBeat,chordEnabled) {
	var minimumWidth = -1;
	var restBeat = true;
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			var voice = beat.getVoiceImpl(v);
			if(!voice.isEmpty) {
				if(minimumWidth < 0 || voice.width < minimumWidth) {
					minimumWidth = voice.width;
				}
				if(!voice.isRestVoice()) {
					restBeat = false;
				}
			}
		}
	}
	beat.minimumWidth = (minimumWidth);
	this.notEmptyBeats += ((restBeat?0:1));
	this._widthBeats += beat.minimumWidth;
	if(previousBeat != null) {
		beat.previousBeat = (previousBeat);
		previousBeat.nextBeat = (beat);
		if(chordEnabled && beat.effect.chord != null && previousBeat.effect.chord != null) {
			var previousWidth = previousBeat.minimumWidth;
			var chordWidth = Math.floor((layout.chordFretIndexSpacing + layout.chordStringSpacing) + (this.track.stringCount() * layout.chordStringSpacing));
			previousBeat.minimumWidth = Math.round((Math.max(chordWidth,previousWidth)));
			this._widthBeats -= previousWidth;
			this._widthBeats += previousBeat.minimumWidth;
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.maxY = null;
net.alphatab.tablature.model.MeasureImpl.prototype.minY = null;
net.alphatab.tablature.model.MeasureImpl.prototype.notEmptyBeats = null;
net.alphatab.tablature.model.MeasureImpl.prototype.notEmptyVoices = null;
net.alphatab.tablature.model.MeasureImpl.prototype.paintClef = function(layout,context,fromX,fromY) {
	if(this.isPaintClef) {
		var x = fromX + Math.round(14 * layout.scale);
		var y = fromY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		if(this.clef == net.alphatab.model.MeasureClef.Treble) {
			net.alphatab.tablature.drawing.ClefPainter.paintTreble(context,x,y,layout);
		}
		else if(this.clef == net.alphatab.model.MeasureClef.Bass) {
			net.alphatab.tablature.drawing.ClefPainter.paintBass(context,x,y,layout);
		}
		else if(this.clef == net.alphatab.model.MeasureClef.Tenor) {
			net.alphatab.tablature.drawing.ClefPainter.paintTenor(context,x,y,layout);
		}
		else if(this.clef == net.alphatab.model.MeasureClef.Alto) {
			net.alphatab.tablature.drawing.ClefPainter.paintAlto(context,x,y,layout);
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintComponents = function(layout,context,fromX,fromY) {
	var _g = 0, _g1 = this.beats;
	while(_g < _g1.length) {
		var beat = _g1[_g];
		++_g;
		var impl = beat;
		impl.paint(layout,context,fromX + this.headerImpl().getLeftSpacing(layout),fromY);
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintDivisions = function(layout,context) {
	var x1 = this.posX;
	var x2 = this.posX + this.width;
	var offsetY = 0;
	var y1 = this.posY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
	var y2 = Math.floor(y1 + (layout.scoreLineSpacing * 4));
	if(layout.isFirstMeasure(this) || this.isFirstOfLine) {
		offsetY = (this.posY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.Tablature)) - y2;
	}
	this.paintDivisions2(layout,context,x1,y1,x2,y2,offsetY,true);
	y1 = this.posY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.Tablature);
	y2 = Math.floor(y1 + ((this.track.strings.length - 1) * layout.stringSpacing));
	offsetY = 0;
	this.paintDivisions2(layout,context,x1,y1,x2,y2,offsetY,false);
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintDivisions2 = function(layout,context,x1,y1,x2,y2,offsetY,addInfo) {
	var scale = layout.scale;
	var lineWidthSmall = 1;
	var lineWidthBig = Math.floor(Math.max(lineWidthSmall,Math.round(3.0 * scale)));
	var fill = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	var draw = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw);
	if(addInfo) {
		var number = Std.string(this.number());
		context.get(net.alphatab.tablature.drawing.DrawingLayers.Red).addString(number,net.alphatab.tablature.drawing.DrawingResources.defaultFont,(this.posX + Math.round(scale)),((y1 - net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight) - Math.round(scale)));
	}
	if(this.isRepeatOpen() || layout.isFirstMeasure(this)) {
		fill.moveTo(x1,y1);
		fill.rectTo(lineWidthBig,(y2 + offsetY) - y1);
		draw.startFigure();
		draw.moveTo(Math.floor(((x1 + lineWidthBig) + scale) + lineWidthSmall),y1);
		draw.lineTo(Math.floor(((x1 + lineWidthBig) + scale) + lineWidthSmall),y2 + offsetY);
		if(this.isRepeatOpen()) {
			var size = Math.round(Math.max(1,(4.0 * scale)));
			var xMove = (((lineWidthBig + scale) + lineWidthSmall) + (2.0 * scale));
			var yMove = (((lineWidthBig + scale) + lineWidthSmall) + (2.0 * scale));
			fill.moveTo(Math.floor(x1 + xMove),Math.floor((y1 + ((y2 - y1) / 2)) - (yMove + (size / 2))));
			fill.circleTo(size);
			fill.moveTo(Math.floor(x1 + xMove),Math.floor((y1 + ((y2 - y1) / 2)) + (yMove - (size / 2))));
			fill.circleTo(size);
		}
	}
	else {
		draw.startFigure();
		draw.moveTo(x1,y1);
		draw.lineTo(x1,y2 + offsetY);
	}
	if(this.repeatClose() > 0 || layout.isLastMeasure(this)) {
		draw.startFigure();
		draw.moveTo(Math.floor((x2 + this.spacing) - ((lineWidthBig + scale) + lineWidthSmall)),y1);
		draw.lineTo(Math.floor((x2 + this.spacing) - ((lineWidthBig + scale) + lineWidthSmall)),y2);
		fill.moveTo((x2 + this.spacing) - lineWidthBig,y1);
		fill.rectTo(lineWidthBig,y2 - y1);
		if(this.repeatClose() > 0) {
			var size = Math.round(Math.max(1,(4 * scale)));
			var xMove = ((((lineWidthBig + scale) + lineWidthSmall) + (2.0 * scale)) + size);
			var yMove = (((lineWidthBig + scale) + lineWidthSmall) + (2.0 * scale));
			fill.moveTo(Math.round((x2 - xMove) + this.spacing),Math.round((y1 + ((y2 - y1) / 2)) - (yMove + (size / 2))));
			fill.circleTo(size);
			fill.moveTo(Math.round((x2 - xMove) + this.spacing),Math.round((y1 + ((y2 - y1) / 2)) + (yMove - (size / 2))));
			fill.circleTo(size);
			if(addInfo) {
				var repetitions = ("x" + (this.repeatClose() + 1));
				var numberSize = context.graphics.measureText(repetitions);
				fill.addString(repetitions,net.alphatab.tablature.drawing.DrawingResources.defaultFont,(((x2 - numberSize) + this.spacing) - size),((y1 - net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight) - Math.round(scale)));
			}
		}
	}
	else {
		draw.startFigure();
		draw.moveTo(x2 + this.spacing,y1);
		draw.lineTo(x2 + this.spacing,y2);
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintKeySignature = function(layout,context,fromX,fromY) {
	if(this.headerImpl().shouldPaintKeySignature) {
		var scale = layout.scoreLineSpacing;
		var x = (fromX + this.getClefSpacing(layout)) + 10;
		var y = fromY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		var currentKey = this.keySignature();
		var previousKey = ((this._previousMeasure != null?this._previousMeasure.keySignature():0));
		var offsetClef = 0;
		switch(this.clef) {
		case net.alphatab.model.MeasureClef.Treble:{
			offsetClef = 0;
		}break;
		case net.alphatab.model.MeasureClef.Bass:{
			offsetClef = 2;
		}break;
		case net.alphatab.model.MeasureClef.Tenor:{
			offsetClef = -1;
		}break;
		case net.alphatab.model.MeasureClef.Alto:{
			offsetClef = 1;
		}break;
		}
		if(previousKey >= 1 && previousKey <= 7) {
			var naturalFrom = ((currentKey >= 1 && currentKey <= 7)?currentKey:0);
			{
				var _g = naturalFrom;
				while(_g < previousKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((net.alphatab.tablature.model.MeasureImpl.SCORE_KEYSHARP_POSITIONS[i] + offsetClef) + 7) % 7)) - (scale / 2);
					net.alphatab.tablature.drawing.KeySignaturePainter.paintNatural(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		else if(previousKey >= 8 && previousKey <= 14) {
			var naturalFrom = ((currentKey >= 8 && currentKey <= 14)?currentKey:7);
			{
				var _g = naturalFrom;
				while(_g < previousKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((net.alphatab.tablature.model.MeasureImpl.SCORE_KEYFLAT_POSITIONS[i - 7] + offsetClef) + 7) % 7)) - (scale / 2);
					net.alphatab.tablature.drawing.KeySignaturePainter.paintNatural(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		if(currentKey >= 1 && currentKey <= 7) {
			{
				var _g = 0;
				while(_g < currentKey) {
					var i = _g++;
					var offset = Math.floor(((scale / 2) * (((net.alphatab.tablature.model.MeasureImpl.SCORE_KEYSHARP_POSITIONS[i] + offsetClef) + 7) % 7)) - (scale / 2));
					net.alphatab.tablature.drawing.KeySignaturePainter.paintSharp(context,x,(y + offset),layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		else if(currentKey >= 8 && currentKey <= 14) {
			{
				var _g = 7;
				while(_g < currentKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((net.alphatab.tablature.model.MeasureImpl.SCORE_KEYFLAT_POSITIONS[i - 7] + offsetClef) + 7) % 7)) - (scale / 2);
					net.alphatab.tablature.drawing.KeySignaturePainter.paintFlat(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintMarker = function(context,layout) {
	if(this.hasMarker()) {
		var x = ((this.posX + this.headerImpl().getLeftSpacing(layout)) + this.getFirstNoteSpacing(layout));
		var y = (this.posY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.Marker));
		context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1).addString(this.marker().title,net.alphatab.tablature.drawing.DrawingResources.defaultFont,x,y);
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintMeasure = function(layout,context) {
	var x = this.posX;
	var y = this.posY;
	layout.paintLines(this.trackImpl(),this.ts,context,x,y,this.width + this.spacing);
	this.paintTimeSignature(context,layout,x,y);
	this.paintClef(layout,context,x,y);
	this.paintKeySignature(layout,context,x,y);
	this.paintComponents(layout,context,x,y);
	this.paintMarker(context,layout);
	this.paintTexts(layout,context);
	this.paintTempo(context,layout);
	this.paintTripletFeel(context,layout);
	this.paintDivisions(layout,context);
	this.paintRepeatEnding(layout,context);
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintRepeatEnding = function(layout,context) {
	if(this.header.repeatAlternative > 0) {
		var scale = layout.scale;
		var x1 = ((this.posX + this.headerImpl().getLeftSpacing(layout)) + this.getFirstNoteSpacing(layout));
		var x2 = ((this.posX + this.width) + this.spacing);
		var y1 = (this.posY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.RepeatEnding));
		var y2 = (y1 + (layout.repeatEndingSpacing * 0.75));
		var sText = "";
		{
			var _g = 0;
			while(_g < 8) {
				var i = _g++;
				if((this.header.repeatAlternative & (1 << i)) != 0) {
					sText += ((sText.length > 0)?", " + (i + 1):Std.string(i + 1));
				}
			}
		}
		var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw);
		layer.startFigure();
		layer.moveTo(x1,y2);
		layer.lineTo(x1,y1);
		layer.lineTo(x2,y1);
		context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).addString(sText,net.alphatab.tablature.drawing.DrawingResources.defaultFont,Math.round(x1 + (5.0 * scale)),Math.round(y1 + net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight));
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintTempo = function(context,layout) {
	if(this.headerImpl().shouldPaintTempo) {
		var scale = 5.0 * layout.scale;
		var x = (this.posX + this.headerImpl().getLeftSpacing(layout));
		var y = this.posY;
		var lineSpacing = Math.floor(Math.max(layout.scoreLineSpacing,layout.stringSpacing));
		y += (this.ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines) - lineSpacing);
		var imgX = x;
		var imgY = y - (Math.round(scale * 3.5) + 2);
		net.alphatab.tablature.drawing.TempoPainter.paintTempo(context,imgX,imgY,scale);
		var value = (" = " + this.tempo().value);
		var fontX = x + Math.floor(Math.round((1.33 * scale)) + 1);
		var fontY = Math.round((y - net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight) - (layout.scale));
		context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).addString(value,net.alphatab.tablature.drawing.DrawingResources.defaultFont,fontX,fontY);
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintTexts = function(layout,context) {
	var _g = 0, _g1 = this.beats;
	while(_g < _g1.length) {
		var beat = _g1[_g];
		++_g;
		if(beat.text != null) {
			var text = beat.text;
			text.paint(layout,context,(this.posX + this.headerImpl().getLeftSpacing(layout)),this.posY);
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintTimeSignature = function(context,layout,fromX,fromY) {
	if(this.headerImpl().shouldPaintTimeSignature) {
		var scale = layout.scale;
		var leftSpacing = Math.round(5.0 * scale);
		var x = ((this.getClefSpacing(layout) + this.getKeySignatureSpacing(layout)) + this.headerImpl().getLeftSpacing(layout)) + leftSpacing;
		var y = fromY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		var y1 = 0;
		var y2 = Math.round(2 * layout.scoreLineSpacing);
		var numerator = this.timeSignature().numerator;
		var symbol = this.getTimeSignatureSymbol(numerator);
		if(symbol != null) {
			context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).addMusicSymbol(symbol,fromX + x,y + y1,scale);
		}
		var denominator = this.timeSignature().denominator.value;
		symbol = this.getTimeSignatureSymbol(denominator);
		if(symbol != null) {
			context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).addMusicSymbol(symbol,fromX + x,y + y2,scale);
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.paintTripletFeel = function(context,layout) {
	if(this.headerImpl().shouldPaintTripletFeel) {
		var lineSpacing = Math.floor(Math.max(layout.scoreLineSpacing,layout.stringSpacing));
		var scale = (5.0 * layout.scale);
		var x = ((this.posX + this.headerImpl().getLeftSpacing(layout)) + this.headerImpl().getTempoSpacing(layout));
		var y = (this.posY + this.ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines)) - lineSpacing;
		var y1 = y - (Math.round((3.5 * scale)));
		if(this.tripletFeel() == net.alphatab.model.TripletFeel.None && this._previousMeasure != null) {
			var previous = this._previousMeasure.tripletFeel();
			if(previous == net.alphatab.model.TripletFeel.Eighth) {
				net.alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone8(context,x,y1,layout.scale);
			}
			else if(previous == net.alphatab.model.TripletFeel.Sixteenth) {
				net.alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone16(context,x,y1,layout.scale);
			}
		}
		else if(this.tripletFeel() == net.alphatab.model.TripletFeel.Eighth) {
			net.alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel8(context,x,y1,layout.scale);
		}
		else if(this.tripletFeel() == net.alphatab.model.TripletFeel.Sixteenth) {
			net.alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel16(context,x,y1,layout.scale);
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.posX = null;
net.alphatab.tablature.model.MeasureImpl.prototype.posY = null;
net.alphatab.tablature.model.MeasureImpl.prototype.quarterSpacing = null;
net.alphatab.tablature.model.MeasureImpl.prototype.registerSpacing = function(layout,spacing) {
	if(this.hasMarker()) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.Marker,layout.markerSpacing);
	}
	if(this._chord) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.Chord,layout.getDefaultChordSpacing());
	}
	if(this._text) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.Text,layout.textSpacing);
	}
	if(this.header.repeatAlternative > 0) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.RepeatEnding,layout.repeatEndingSpacing);
	}
	if(this._tupleto) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.Tupleto,layout.tupletoSpacing);
	}
	if(this._accentuated) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect,layout.effectSpacing);
	}
	if(this._harmonic) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect,layout.effectSpacing);
	}
	if(this._tapping) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.TapingEffect,layout.effectSpacing);
	}
	if(this._palmMute) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect,layout.effectSpacing);
	}
	if(this._fadeIn) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.FadeIn,layout.effectSpacing);
	}
	if(this._vibrato) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.VibratoEffect,layout.effectSpacing);
	}
	if(this._beatVibrato) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect,layout.effectSpacing);
	}
	if(this._letRing) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.LetRingEffect,layout.effectSpacing);
	}
	if(this._bend) {
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.Bend,this._bendOverFlow);
	}
	if(this._tremoloBar) {
		if(this._tremoloBarOverFlow < 0) {
			spacing.set(net.alphatab.tablature.TrackSpacingPositions.TremoloBarDown,Math.round(Math.abs(this._tremoloBarOverFlow)));
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.resetSpacing = function() {
	this._text = false;
	this._chord = false;
	this._tupleto = false;
	this._accentuated = false;
	this._harmonic = false;
	this._tapping = false;
	this._palmMute = false;
	this._fadeIn = false;
	this._vibrato = false;
	this._beatVibrato = false;
	this._letRing = false;
	this._tremoloBar = false;
}
net.alphatab.tablature.model.MeasureImpl.prototype.spacing = null;
net.alphatab.tablature.model.MeasureImpl.prototype.trackImpl = function() {
	return this.track;
}
net.alphatab.tablature.model.MeasureImpl.prototype.ts = null;
net.alphatab.tablature.model.MeasureImpl.prototype.update = function(layout) {
	this.updateComponents(layout);
}
net.alphatab.tablature.model.MeasureImpl.prototype.updateComponents = function(layout) {
	this.maxY = 0;
	this.minY = 0;
	var spacing = this.getFirstNoteSpacing(layout);
	var tmpX = spacing;
	{
		var _g1 = 0, _g = this.beatCount();
		while(_g1 < _g) {
			var i = _g1++;
			var beat = this.beats[i];
			beat.posX = (tmpX);
			tmpX += beat.minimumWidth;
			{
				var _g3 = 0, _g2 = beat.voices.length;
				while(_g3 < _g2) {
					var v = _g3++;
					var voice = beat.getVoiceImpl(v);
					if(!voice.isEmpty) {
						{
							var _g4 = 0, _g5 = voice.notes;
							while(_g4 < _g5.length) {
								var note = _g5[_g4];
								++_g4;
								var note2 = note;
								this.checkEffects(layout,note2);
								note2.update(layout);
							}
						}
						voice.update(layout);
						if(!this._tupleto && voice.duration.tuplet != new net.alphatab.model.Tuplet()) {
							this._tupleto = true;
						}
						if(voice.maxY > this.maxY) {
							this.maxY = voice.maxY;
						}
						if(voice.minY < this.minY) {
							this.minY = voice.minY;
						}
					}
				}
			}
			if(!this._chord && beat.effect.chord != null) {
				this._chord = true;
			}
			if(!this._text && beat.text != null) {
				this._text = true;
			}
		}
	}
	{
		var _g = 0, _g1 = this._voiceGroups;
		while(_g < _g1.length) {
			var groups = _g1[_g];
			++_g;
			{
				var _g2 = 0;
				while(_g2 < groups.length) {
					var group = groups[_g2];
					++_g2;
					this.checkValue(layout,group.minNote,group.direction);
					this.checkValue(layout,group.maxNote,group.direction);
				}
			}
		}
	}
}
net.alphatab.tablature.model.MeasureImpl.prototype.width = null;
net.alphatab.tablature.model.MeasureImpl.prototype.__class__ = net.alphatab.tablature.model.MeasureImpl;
net.alphatab.tablature.drawing.DrawingLayers = { __ename__ : ["net","alphatab","tablature","drawing","DrawingLayers"], __constructs__ : ["Background","LayoutBackground","Lines","MainComponents","MainComponentsDraw","Voice2","VoiceEffects2","VoiceEffectsDraw2","VoiceDraw2","Voice1","VoiceEffects1","VoiceEffectsDraw1","VoiceDraw1","Red"] }
net.alphatab.tablature.drawing.DrawingLayers.Background = ["Background",0];
net.alphatab.tablature.drawing.DrawingLayers.Background.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.Background.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground = ["LayoutBackground",1];
net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.Lines = ["Lines",2];
net.alphatab.tablature.drawing.DrawingLayers.Lines.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.Lines.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.MainComponents = ["MainComponents",3];
net.alphatab.tablature.drawing.DrawingLayers.MainComponents.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.MainComponents.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw = ["MainComponentsDraw",4];
net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.Red = ["Red",13];
net.alphatab.tablature.drawing.DrawingLayers.Red.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.Red.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.Voice1 = ["Voice1",9];
net.alphatab.tablature.drawing.DrawingLayers.Voice1.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.Voice1.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.Voice2 = ["Voice2",5];
net.alphatab.tablature.drawing.DrawingLayers.Voice2.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.Voice2.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1 = ["VoiceDraw1",12];
net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2 = ["VoiceDraw2",8];
net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1 = ["VoiceEffects1",10];
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2 = ["VoiceEffects2",6];
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1 = ["VoiceEffectsDraw1",11];
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2 = ["VoiceEffectsDraw2",7];
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2.toString = $estr;
net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2.__enum__ = net.alphatab.tablature.drawing.DrawingLayers;
net.alphatab.tablature.model.MeasureHeaderImpl = function(factory) { if( factory === $_ ) return; {
	net.alphatab.model.MeasureHeader.apply(this,[factory]);
}}
net.alphatab.tablature.model.MeasureHeaderImpl.__name__ = ["net","alphatab","tablature","model","MeasureHeaderImpl"];
net.alphatab.tablature.model.MeasureHeaderImpl.__super__ = net.alphatab.model.MeasureHeader;
for(var k in net.alphatab.model.MeasureHeader.prototype ) net.alphatab.tablature.model.MeasureHeaderImpl.prototype[k] = net.alphatab.model.MeasureHeader.prototype[k];
net.alphatab.tablature.model.MeasureHeaderImpl.prototype._maxClefSpacing = null;
net.alphatab.tablature.model.MeasureHeaderImpl.prototype._maxKeySignatureSpacing = null;
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.calculateMeasureChanges = function(layout) {
	var previous = layout.songManager().getPreviousMeasureHeader(this);
	if(previous == null) {
		this.shouldPaintTempo = true;
		this.shouldPaintTripletFeel = this.tripletFeel != net.alphatab.model.TripletFeel.None;
		this.shouldPaintTimeSignature = true;
		this.shouldPaintKeySignature = true;
	}
	else {
		if(this.tempo.value != previous.tempo.value) {
			this.shouldPaintTempo = true;
		}
		if(this.tripletFeel != previous.tripletFeel) {
			this.shouldPaintTripletFeel = true;
		}
		if(this.timeSignature.numerator != previous.timeSignature.numerator || this.timeSignature.denominator.value != previous.timeSignature.denominator.value) {
			this.shouldPaintTimeSignature = true;
		}
		if(this.keySignature != previous.keySignature || this.keySignatureType != previous.keySignatureType) {
			this.shouldPaintKeySignature = true;
		}
	}
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.getClefSpacing = function(layout,measure) {
	return ((!measure.isPaintClef)?0:this._maxClefSpacing);
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.getFirstNoteSpacing = function(layout,measure) {
	var iTopSpacing = this.getTempoSpacing(layout) + this.getTripletFeelSpacing(layout);
	var iMiddleSpacing = (this.getClefSpacing(layout,measure) + this.getKeySignatureSpacing(layout,measure)) + this.getTimeSignatureSpacing(layout);
	return Math.round(Math.max(iTopSpacing,iMiddleSpacing) + (10 * layout.scale));
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.getKeySignatureSpacing = function(layout,measure) {
	return ((!this.shouldPaintKeySignature)?0:this._maxKeySignatureSpacing);
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.getLeftSpacing = function(layout) {
	return Math.round(15 * layout.scale);
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.getRightSpacing = function(layout) {
	return Math.round(15 * layout.scale);
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.getTempoSpacing = function(layout) {
	return ((this.shouldPaintTempo && this.number == 1?Math.round(45 * layout.scale):0));
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.getTimeSignatureSpacing = function(layout) {
	return ((this.shouldPaintTimeSignature?Math.round(30 * layout.scale):0));
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.getTripletFeelSpacing = function(layout) {
	return ((this.shouldPaintTripletFeel?Math.round(55 * layout.scale):0));
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.maxQuarterSpacing = null;
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.maxWidth = null;
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.notifyClefSpacing = function(spacing) {
	this._maxClefSpacing = (((spacing > this._maxClefSpacing)?spacing:this._maxClefSpacing));
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.notifyKeySignatureSpacing = function(spacing) {
	this._maxKeySignatureSpacing = (((spacing > this._maxKeySignatureSpacing)?spacing:this._maxKeySignatureSpacing));
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.notifyQuarterSpacing = function(spacing) {
	this.maxQuarterSpacing = (((spacing > this.maxQuarterSpacing)?spacing:this.maxQuarterSpacing));
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.notifyWidth = function(width) {
	this.maxWidth = (((width > this.maxWidth)?width:this.maxWidth));
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.reset = function() {
	this.maxWidth = 0;
	this.maxQuarterSpacing = 0;
	this.shouldPaintTempo = false;
	this.shouldPaintTimeSignature = false;
	this.shouldPaintKeySignature = false;
	this.shouldPaintTripletFeel = false;
	this._maxClefSpacing = 0;
	this._maxKeySignatureSpacing = 0;
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.shouldPaintKeySignature = null;
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.shouldPaintTempo = null;
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.shouldPaintTimeSignature = null;
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.shouldPaintTripletFeel = null;
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.update = function(layout,track) {
	this.reset();
	this.calculateMeasureChanges(layout);
	var measure = track.measures[this.number - 1];
	measure.calculateMeasureChanges(layout);
}
net.alphatab.tablature.model.MeasureHeaderImpl.prototype.__class__ = net.alphatab.tablature.model.MeasureHeaderImpl;
net.alphatab.midi.MidiDataProvider = function() { }
net.alphatab.midi.MidiDataProvider.__name__ = ["net","alphatab","midi","MidiDataProvider"];
net.alphatab.midi.MidiDataProvider.getSongMidiData = function(song,factory) {
	var parser = new net.alphatab.midi.MidiSequenceParser(factory,song,15,100,0);
	var sequence = new net.alphatab.midi.MidiSequenceHandler(song.tracks.length + 2);
	parser.parse(sequence);
	return sequence.commands;
}
net.alphatab.midi.MidiDataProvider.prototype.__class__ = net.alphatab.midi.MidiDataProvider;
net.alphatab.model.Padding = function(right,top,left,bottom) { if( right === $_ ) return; {
	this.right = right;
	this.top = top;
	this.left = left;
	this.bottom = bottom;
}}
net.alphatab.model.Padding.__name__ = ["net","alphatab","model","Padding"];
net.alphatab.model.Padding.prototype.bottom = null;
net.alphatab.model.Padding.prototype.getHorizontal = function() {
	return this.left + this.right;
}
net.alphatab.model.Padding.prototype.getVertical = function() {
	return this.top + this.bottom;
}
net.alphatab.model.Padding.prototype.left = null;
net.alphatab.model.Padding.prototype.right = null;
net.alphatab.model.Padding.prototype.top = null;
net.alphatab.model.Padding.prototype.__class__ = net.alphatab.model.Padding;
net.alphatab.tablature.PageViewLayout = function(p) { if( p === $_ ) return; {
	net.alphatab.tablature.ViewLayout.apply(this,[]);
	this._lines = new Array();
	this._maximumWidth = 0;
	this.contentPadding = net.alphatab.tablature.PageViewLayout.PAGE_PADDING;
}}
net.alphatab.tablature.PageViewLayout.__name__ = ["net","alphatab","tablature","PageViewLayout"];
net.alphatab.tablature.PageViewLayout.__super__ = net.alphatab.tablature.ViewLayout;
for(var k in net.alphatab.tablature.ViewLayout.prototype ) net.alphatab.tablature.PageViewLayout.prototype[k] = net.alphatab.tablature.ViewLayout.prototype[k];
net.alphatab.tablature.PageViewLayout.prototype.GetTempLines = function(track,fromIndex,trackSpacing) {
	var line = new net.alphatab.tablature.TempLine();
	line.MaxY = 0;
	line.MinY = 0;
	line.TrackSpacing = trackSpacing;
	var measureCount = track.measureCount();
	{
		var _g = fromIndex;
		while(_g < measureCount) {
			var i = _g++;
			var measure = track.measures[i];
			if((line.TempWidth + measure.width) >= this.getMaxWidth() && line.Measures.length != 0) {
				line.FullLine = true;
				return line;
			}
			line.TempWidth += measure.width;
			line.MaxY = (measure.maxY > line.MaxY?measure.maxY:line.MaxY);
			line.MinY = (measure.minY < line.MinY?measure.minY:line.MinY);
			line.AddMeasure(i);
			measure.registerSpacing(this,trackSpacing);
		}
	}
	return line;
}
net.alphatab.tablature.PageViewLayout.prototype.LayoutSongInfo = function(x,y) {
	var song = this.tablature.track.song;
	var anySongInfo = false;
	if(song.title != "" && ((song.pageSetup.headerAndFooter & 1) != 0)) {
		y += Math.floor(35 * this.scale);
		anySongInfo = true;
	}
	if(song.subtitle != "" && ((song.pageSetup.headerAndFooter & 2) != 0)) {
		y += Math.floor(20 * this.scale);
		anySongInfo = true;
	}
	if(song.artist != "" && ((song.pageSetup.headerAndFooter & 4) != 0)) {
		y += Math.floor(20 * this.scale);
		anySongInfo = true;
	}
	if(song.album != "" && ((song.pageSetup.headerAndFooter & 8) != 0)) {
		y += Math.floor(20 * this.scale);
		anySongInfo = true;
	}
	if(song.music != "" && song.music == song.words && ((song.pageSetup.headerAndFooter & 64) != 0)) {
		y += Math.floor(20 * this.scale);
		anySongInfo = true;
	}
	else {
		if(song.music != "" && ((song.pageSetup.headerAndFooter & 32) != 0)) {
			y += Math.floor(20 * this.scale);
			anySongInfo = true;
		}
		if(song.words != "" && ((song.pageSetup.headerAndFooter & 16) != 0)) {
			y += Math.floor(20 * this.scale);
			anySongInfo = true;
		}
	}
	y += Math.floor(20 * this.scale);
	if(anySongInfo) {
		y += Math.floor(20 * this.scale);
	}
	return y;
}
net.alphatab.tablature.PageViewLayout.prototype.PaintLine = function(track,line,beatCount,context) {
	haxe.Log.trace((("Paint Measures " + Std.string(line.Measures[0])) + " to ") + Std.string(line.Measures[line.Measures.length - 1]),{ fileName : "PageViewLayout.hx", lineNumber : 292, className : "net.alphatab.tablature.PageViewLayout", methodName : "PaintLine"});
	{
		var _g1 = 0, _g = line.Measures.length;
		while(_g1 < _g) {
			var i = _g1++;
			var index = line.Measures[i];
			var currentMeasure = track.measures[index];
			currentMeasure.paintMeasure(this,context);
			if(track.song.lyrics != null && track.song.lyrics.trackChoice == track.number) {
				var ly = track.song.lyrics;
				ly.paintCurrentNoteBeats(context,this,currentMeasure,beatCount,currentMeasure.posX,currentMeasure.posY);
			}
			beatCount += currentMeasure.beatCount();
		}
	}
	return beatCount;
}
net.alphatab.tablature.PageViewLayout.prototype.PaintSongInfo = function(ctx,clientArea,x,y) {
	haxe.Log.trace("Paint Song info",{ fileName : "PageViewLayout.hx", lineNumber : 203, className : "net.alphatab.tablature.PageViewLayout", methodName : "PaintSongInfo"});
	var song = this.tablature.track.song;
	x += this.contentPadding.left;
	var tX;
	var size;
	var str = "";
	if(song.title != "" && ((song.pageSetup.headerAndFooter & 1) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.title);
		ctx.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.titleFont);
		size = ctx.graphics.measureText(str);
		tX = (clientArea.width - size) / 2;
		ctx.get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).addString(str,net.alphatab.tablature.drawing.DrawingResources.titleFont,tX,y,"top");
		y += Math.floor(35 * this.scale);
	}
	if(song.subtitle != "" && ((song.pageSetup.headerAndFooter & 2) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.subtitle);
		ctx.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.subtitleFont);
		size = ctx.graphics.measureText(str);
		tX = (clientArea.width - size) / 2;
		ctx.get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).addString(str,net.alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y,"top");
		y += Math.floor(20 * this.scale);
	}
	if(song.artist != "" && ((song.pageSetup.headerAndFooter & 4) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.artist);
		ctx.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.subtitleFont);
		size = ctx.graphics.measureText(str);
		tX = (clientArea.width - size) / 2;
		ctx.get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).addString(str,net.alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y,"top");
		y += Math.floor(20 * this.scale);
	}
	if(song.album != "" && ((song.pageSetup.headerAndFooter & 8) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.album);
		ctx.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.subtitleFont);
		size = ctx.graphics.measureText(str);
		tX = (clientArea.width - size) / 2;
		ctx.get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).addString(str,net.alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y,"top");
		y += Math.floor(20 * this.scale);
	}
	if(song.music != "" && song.music == song.words && ((song.pageSetup.headerAndFooter & 64) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.wordsAndMusic);
		ctx.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.wordsFont);
		size = ctx.graphics.measureText(str);
		tX = ((clientArea.width - size) - this.contentPadding.right);
		ctx.get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).addString(str,net.alphatab.tablature.drawing.DrawingResources.wordsFont,x,y,"top");
		y += Math.floor(20 * this.scale);
	}
	else {
		if(song.music != "" && ((song.pageSetup.headerAndFooter & 32) != 0)) {
			str = this.ParsePageSetupString(song.pageSetup.music);
			ctx.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.wordsFont);
			size = ctx.graphics.measureText(str);
			tX = ((clientArea.width - size) - this.contentPadding.right);
			ctx.get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).addString(str,net.alphatab.tablature.drawing.DrawingResources.wordsFont,tX,y,"top");
		}
		if(song.words != "" && ((song.pageSetup.headerAndFooter & 16) != 0)) {
			str = this.ParsePageSetupString(song.pageSetup.words);
			ctx.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.wordsFont);
			ctx.get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).addString(str,net.alphatab.tablature.drawing.DrawingResources.wordsFont,x,y,"top");
		}
		y += Math.floor(20 * this.scale);
	}
	return y;
}
net.alphatab.tablature.PageViewLayout.prototype.ParsePageSetupString = function(input) {
	var song = this.tablature.track.song;
	input = StringTools.replace(input,"%TITLE%",song.title);
	input = StringTools.replace(input,"%SUBTITLE%",song.subtitle);
	input = StringTools.replace(input,"%ARTIST%",song.artist);
	input = StringTools.replace(input,"%ALBUM%",song.album);
	input = StringTools.replace(input,"%WORDS%",song.words);
	input = StringTools.replace(input,"%MUSIC%",song.music);
	input = StringTools.replace(input,"%WORDSMUSIC%",song.words);
	input = StringTools.replace(input,"%COPYRIGHT%",song.copyright);
	return input;
}
net.alphatab.tablature.PageViewLayout.prototype._lines = null;
net.alphatab.tablature.PageViewLayout.prototype._maximumWidth = null;
net.alphatab.tablature.PageViewLayout.prototype.getMaxWidth = function() {
	if(this._maximumWidth <= 0) {
		this._maximumWidth = this.tablature.canvas.width();
	}
	return this._maximumWidth - this.contentPadding.getHorizontal();
}
net.alphatab.tablature.PageViewLayout.prototype.getSheetWidth = function() {
	return Math.round(795 * this.scale);
}
net.alphatab.tablature.PageViewLayout.prototype.init = function(scale) {
	net.alphatab.tablature.ViewLayout.prototype.init.apply(this,[scale]);
	this.layoutSize = new net.alphatab.model.Size(this.getSheetWidth() - net.alphatab.tablature.PageViewLayout.PAGE_PADDING.getHorizontal(),this.height);
}
net.alphatab.tablature.PageViewLayout.prototype.measureLine = function(track,line,x,y,spacing) {
	var realX = this.contentPadding.left + x;
	var realY = y;
	var w = this.contentPadding.left;
	var measureSpacing = 0;
	if(line.FullLine) {
		var diff = this.getMaxWidth() - line.TempWidth;
		if(diff != 0 && line.Measures.length > 0) {
			measureSpacing = Math.round(diff / line.Measures.length);
		}
	}
	{
		var _g1 = 0, _g = line.Measures.length;
		while(_g1 < _g) {
			var i = _g1++;
			var index = line.Measures[i];
			var currMeasure = track.measures[index];
			currMeasure.posX = realX;
			currMeasure.posY = realY;
			currMeasure.ts = spacing;
			currMeasure.isFirstOfLine = i == 0;
			var measureWidth = Math.round(currMeasure.width + measureSpacing);
			currMeasure.spacing = measureSpacing;
			realX += measureWidth;
			w += measureWidth;
		}
	}
	this.width = Math.round(Math.max(this.width,w));
}
net.alphatab.tablature.PageViewLayout.prototype.paintSong = function(ctx,clientArea,x,y) {
	var track = this.tablature.track;
	y = Math.round(y + this.contentPadding.top);
	y = Math.round(this.PaintSongInfo(ctx,clientArea,x,y) + this.firstMeasureSpacing);
	var beatCount = 0;
	{
		var _g1 = 0, _g = this._lines.length;
		while(_g1 < _g) {
			var l = _g1++;
			var line = this._lines[l];
			beatCount = this.PaintLine(track,line,beatCount,ctx);
		}
	}
}
net.alphatab.tablature.PageViewLayout.prototype.prepareLayout = function(clientArea,x,y) {
	this._lines = new Array();
	this._maximumWidth = clientArea.width;
	this.width = 0;
	this.height = 0;
	var posY = Math.round(y);
	var track = this.tablature.track;
	var measureCount = this.tablature.track.measures.length;
	var nextMeasureIndex = 0;
	posY = Math.floor(this.LayoutSongInfo(x,posY) + this.firstMeasureSpacing);
	this.height = posY;
	while(measureCount > nextMeasureIndex) {
		var spacing = new net.alphatab.tablature.TrackSpacing();
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines,Math.round(this.scoreLineSpacing * 5));
		var line = this.GetTempLines(track,nextMeasureIndex,spacing);
		this._lines.push(line);
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines,Math.round(Math.abs(line.MinY)));
		if(line.MaxY + this.minScoreTabSpacing > this.scoreSpacing) {
			spacing.set(net.alphatab.tablature.TrackSpacingPositions.ScoreDownLines,Math.round(line.MaxY - (this.scoreLineSpacing * 4)));
		}
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.TablatureTopSeparator,Math.round(this.minScoreTabSpacing));
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.Tablature,Math.round((track.tabHeight + this.stringSpacing) + 1));
		spacing.set(net.alphatab.tablature.TrackSpacingPositions.Lyric,10);
		this.checkDefaultSpacing(spacing);
		this.measureLine(track,line,x,posY,spacing);
		var lineHeight = Math.round(spacing.getSize());
		posY += Math.round(lineHeight + this.trackSpacing);
		this.height += Math.round(lineHeight + this.trackSpacing);
		nextMeasureIndex = line.LastIndex + 1;
	}
	this.width = this.getSheetWidth();
}
net.alphatab.tablature.PageViewLayout.prototype.__class__ = net.alphatab.tablature.PageViewLayout;
net.alphatab.tablature.TempLine = function(p) { if( p === $_ ) return; {
	this.TrackSpacing = null;
	this.TempWidth = 0;
	this.LastIndex = 0;
	this.FullLine = false;
	this.MaxY = 0;
	this.MinY = 0;
	this.Measures = new Array();
}}
net.alphatab.tablature.TempLine.__name__ = ["net","alphatab","tablature","TempLine"];
net.alphatab.tablature.TempLine.prototype.AddMeasure = function(index) {
	this.Measures.push(index);
	this.LastIndex = index;
}
net.alphatab.tablature.TempLine.prototype.FullLine = null;
net.alphatab.tablature.TempLine.prototype.LastIndex = null;
net.alphatab.tablature.TempLine.prototype.MaxY = null;
net.alphatab.tablature.TempLine.prototype.Measures = null;
net.alphatab.tablature.TempLine.prototype.MinY = null;
net.alphatab.tablature.TempLine.prototype.TempWidth = null;
net.alphatab.tablature.TempLine.prototype.TrackSpacing = null;
net.alphatab.tablature.TempLine.prototype.__class__ = net.alphatab.tablature.TempLine;
net.alphatab.tablature.model.BeatGroup = function(voice) { if( voice === $_ ) return; {
	this._voice = voice;
	this._voices = new Array();
	this.direction = net.alphatab.model.VoiceDirection.None;
	this._firstMinNote = null;
	this._firstMaxNote = null;
	this._lastMinNote = null;
	this._lastMaxNote = null;
	this.maxNote = null;
	this.minNote = null;
}}
net.alphatab.tablature.model.BeatGroup.__name__ = ["net","alphatab","tablature","model","BeatGroup"];
net.alphatab.tablature.model.BeatGroup.getUpOffset = function(layout) {
	return 28 * (layout.scoreLineSpacing / 8.0);
}
net.alphatab.tablature.model.BeatGroup.getDownOffset = function(layout) {
	return 35 * (layout.scoreLineSpacing / 8.0);
}
net.alphatab.tablature.model.BeatGroup.prototype._firstMaxNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._firstMinNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._lastMaxNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._lastMinNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._voice = null;
net.alphatab.tablature.model.BeatGroup.prototype._voices = null;
net.alphatab.tablature.model.BeatGroup.prototype.checkNote = function(note) {
	var value = note.realValue();
	if(this._firstMinNote == null || note.voice.beat.start < this._firstMinNote.voice.beat.start) {
		this._firstMinNote = note;
	}
	else if(note.voice.beat.start == this._firstMinNote.voice.beat.start) {
		if(note.realValue() < this._firstMinNote.realValue()) {
			this._firstMinNote = note;
		}
	}
	if(this._firstMaxNote == null || note.voice.beat.start < this._firstMaxNote.voice.beat.start) {
		this._firstMaxNote = note;
	}
	else if(note.voice.beat.start == this._firstMaxNote.voice.beat.start) {
		if(note.realValue() > this._firstMaxNote.realValue()) {
			this._firstMaxNote = note;
		}
	}
	if(this._lastMinNote == null || note.voice.beat.start > this._lastMinNote.voice.beat.start) {
		this._lastMinNote = note;
	}
	else if(note.voice.beat.start == this._lastMinNote.voice.beat.start) {
		if(note.realValue() < this._lastMinNote.realValue()) {
			this._lastMinNote = note;
		}
	}
	if(this._lastMaxNote == null || note.voice.beat.start > this._lastMaxNote.voice.beat.start) {
		this._lastMaxNote = note;
	}
	else if(note.voice.beat.start == this._lastMaxNote.voice.beat.start) {
		if(note.realValue() > this._lastMaxNote.realValue()) {
			this._lastMaxNote = note;
		}
	}
	if(this.maxNote == null || value > this.maxNote.realValue()) {
		this.maxNote = note;
	}
	if(this.minNote == null || value < this.minNote.realValue()) {
		this.minNote = note;
	}
}
net.alphatab.tablature.model.BeatGroup.prototype.checkVoice = function(voice) {
	this.checkNote(voice.maxNote);
	this.checkNote(voice.minNote);
	this._voices.push(voice);
	if(voice.direction != net.alphatab.model.VoiceDirection.None) {
		voice.direction = voice.direction;
	}
}
net.alphatab.tablature.model.BeatGroup.prototype.direction = null;
net.alphatab.tablature.model.BeatGroup.prototype.finish = function(layout,measure) {
	if(this.direction == net.alphatab.model.VoiceDirection.None) {
		if(measure.notEmptyVoices > 1) {
			this.direction = (this._voice == 0?net.alphatab.model.VoiceDirection.Up:net.alphatab.model.VoiceDirection.Down);
		}
		else {
			var max = Math.abs(this.minNote.realValue() - (net.alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS[net.alphatab.model.MeasureClefConverter.toInt(measure.clef) - 1] + 100));
			var min = Math.abs(this.maxNote.realValue() - (net.alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS[net.alphatab.model.MeasureClefConverter.toInt(measure.clef) - 1] - 100));
			this.direction = (max > min?net.alphatab.model.VoiceDirection.Up:net.alphatab.model.VoiceDirection.Down);
		}
	}
}
net.alphatab.tablature.model.BeatGroup.prototype.getY1 = function(layout,note,key,clef) {
	var scale = (layout.scoreLineSpacing / 2.00);
	var noteValue = note.realValue();
	var index = noteValue % 12;
	var step = Math.floor(noteValue / 12);
	var offset = (7 * step) * scale;
	var scoreLineY = (key <= 7?Math.floor((net.alphatab.tablature.model.BeatGroup.SCORE_SHARP_POSITIONS[index] * scale) - offset):Math.floor((net.alphatab.tablature.model.BeatGroup.SCORE_FLAT_POSITIONS[index] * scale) - offset));
	scoreLineY += Math.floor(net.alphatab.tablature.model.MeasureImpl.SCORE_KEY_OFFSETS[clef - 1] * scale);
	return scoreLineY;
}
net.alphatab.tablature.model.BeatGroup.prototype.getY2 = function(layout,x,key,clef) {
	var MaxDistance = 10;
	var upOffset = net.alphatab.tablature.model.BeatGroup.getUpOffset(layout);
	var downOffset = net.alphatab.tablature.model.BeatGroup.getDownOffset(layout);
	var y;
	var x1;
	var x2;
	var y1;
	var y2;
	if(this.direction == net.alphatab.model.VoiceDirection.Down) {
		if(this.minNote != this._firstMinNote && this.minNote != this._lastMinNote) {
			return Math.round(this.getY1(layout,this.minNote,key,clef) + downOffset);
		}
		y = 0;
		x1 = Math.round(this._firstMinNote.posX() + this._firstMinNote.voice.beat.spacing());
		x2 = Math.round(this._lastMinNote.posX() + this._lastMinNote.voice.beat.spacing());
		y1 = Math.round(this.getY1(layout,this._firstMinNote,key,clef) + downOffset);
		y2 = Math.round(this.getY1(layout,this._lastMinNote,key,clef) + downOffset);
		if(y1 > y2 && (y1 - y2) > MaxDistance) y2 = (y1 - MaxDistance);
		if(y2 > y1 && (y2 - y1) > MaxDistance) y1 = (y2 - MaxDistance);
		if((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0) {
			y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
		}
		return y1 - y;
	}
	if(this.maxNote != this._firstMaxNote && this.maxNote != this._lastMaxNote) {
		return Math.round(this.getY1(layout,this.maxNote,key,clef) - upOffset);
	}
	y = 0;
	x1 = Math.round(this._firstMaxNote.posX() + this._firstMaxNote.voice.beat.spacing());
	x2 = Math.round(this._lastMaxNote.posX() + this._lastMaxNote.voice.beat.spacing());
	y1 = Math.round(this.getY1(layout,this._firstMaxNote,key,clef) - upOffset);
	y2 = Math.round(this.getY1(layout,this._lastMaxNote,key,clef) - upOffset);
	if(y1 < y2 && (y2 - y1) > MaxDistance) y2 = (y1 + MaxDistance);
	if(y2 < y1 && (y1 - y2) > MaxDistance) y1 = (y2 + MaxDistance);
	if((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0) {
		y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
	}
	return y1 - y;
}
net.alphatab.tablature.model.BeatGroup.prototype.maxNote = null;
net.alphatab.tablature.model.BeatGroup.prototype.minNote = null;
net.alphatab.tablature.model.BeatGroup.prototype.__class__ = net.alphatab.tablature.model.BeatGroup;
haxe.io.Eof = function(p) { if( p === $_ ) return; {
	null;
}}
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype.toString = function() {
	return "Eof";
}
haxe.io.Eof.prototype.__class__ = haxe.io.Eof;
net.alphatab.model.BeatStroke = function(p) { if( p === $_ ) return; {
	this.direction = net.alphatab.model.BeatStrokeDirection.None;
}}
net.alphatab.model.BeatStroke.__name__ = ["net","alphatab","model","BeatStroke"];
net.alphatab.model.BeatStroke.prototype.direction = null;
net.alphatab.model.BeatStroke.prototype.getIncrementTime = function(beat) {
	var duration = 0;
	if(this.value > 0) {
		{
			var _g1 = 0, _g = beat.voices.length;
			while(_g1 < _g) {
				var v = _g1++;
				var voice = beat.voices[v];
				if(voice.isEmpty) continue;
				var currentDuration = voice.duration.time();
				if(duration == 0 || currentDuration < duration) {
					duration = ((currentDuration <= 960)?currentDuration:960);
				}
			}
		}
		if(duration > 0) {
			return Math.round(((duration / 8.0) * (4.0 / this.value)));
		}
	}
	return 0;
}
net.alphatab.model.BeatStroke.prototype.value = null;
net.alphatab.model.BeatStroke.prototype.__class__ = net.alphatab.model.BeatStroke;
net.alphatab.model.BeatStrokeDirection = { __ename__ : ["net","alphatab","model","BeatStrokeDirection"], __constructs__ : ["None","Up","Down"] }
net.alphatab.model.BeatStrokeDirection.Down = ["Down",2];
net.alphatab.model.BeatStrokeDirection.Down.toString = $estr;
net.alphatab.model.BeatStrokeDirection.Down.__enum__ = net.alphatab.model.BeatStrokeDirection;
net.alphatab.model.BeatStrokeDirection.None = ["None",0];
net.alphatab.model.BeatStrokeDirection.None.toString = $estr;
net.alphatab.model.BeatStrokeDirection.None.__enum__ = net.alphatab.model.BeatStrokeDirection;
net.alphatab.model.BeatStrokeDirection.Up = ["Up",1];
net.alphatab.model.BeatStrokeDirection.Up.toString = $estr;
net.alphatab.model.BeatStrokeDirection.Up.__enum__ = net.alphatab.model.BeatStrokeDirection;
net.alphatab.tablature.drawing.ClefPainter = function() { }
net.alphatab.tablature.drawing.ClefPainter.__name__ = ["net","alphatab","tablature","drawing","ClefPainter"];
net.alphatab.tablature.drawing.ClefPainter.paintAlto = function(context,x,y,layout) {
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.AltoClef,x,y,layout.scale);
}
net.alphatab.tablature.drawing.ClefPainter.paintBass = function(context,x,y,layout) {
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.BassClef,x,y,layout.scale);
}
net.alphatab.tablature.drawing.ClefPainter.paintTenor = function(context,x,y,layout) {
	y -= Math.round(layout.scoreLineSpacing);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TenorClef,x,y,layout.scale);
}
net.alphatab.tablature.drawing.ClefPainter.paintTreble = function(context,x,y,layout) {
	y -= Math.round(layout.scoreLineSpacing);
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TrebleClef,x,y,layout.scale);
}
net.alphatab.tablature.drawing.ClefPainter.prototype.__class__ = net.alphatab.tablature.drawing.ClefPainter;
net.alphatab.tablature.drawing.SilencePainter = function() { }
net.alphatab.tablature.drawing.SilencePainter.__name__ = ["net","alphatab","tablature","drawing","SilencePainter"];
net.alphatab.tablature.drawing.SilencePainter.paintEighth = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale;
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceEighth,x,y,layout.scale);
}
net.alphatab.tablature.drawing.SilencePainter.paintWhole = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale;
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.scale);
}
net.alphatab.tablature.drawing.SilencePainter.paintHalf = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale - (4 * layout.scale);
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.scale);
}
net.alphatab.tablature.drawing.SilencePainter.paintQuarter = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale * 0.5;
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceQuarter,x,y,layout.scale);
}
net.alphatab.tablature.drawing.SilencePainter.paintSixteenth = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale;
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceSixteenth,x,y,layout.scale);
}
net.alphatab.tablature.drawing.SilencePainter.paintSixtyFourth = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceSixtyFourth,x,y,layout.scale);
}
net.alphatab.tablature.drawing.SilencePainter.paintThirtySecond = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	layer.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceThirtySecond,x,y,layout.scale);
}
net.alphatab.tablature.drawing.SilencePainter.prototype.__class__ = net.alphatab.tablature.drawing.SilencePainter;
net.alphatab.midi.MidiRepeatController = function(song) { if( song === $_ ) return; {
	this._song = song;
	this._count = song.measureHeaders.length;
	this.index = 0;
	this._lastIndex = -1;
	this.shouldPlay = true;
	this._repeatOpen = true;
	this._repeatAlternative = 0;
	this._repeatStart = 960;
	this._repeatEnd = 0;
	this.repeatMove = 0;
	this._repeatStartIndex = 0;
	this._repeatNumber = 0;
}}
net.alphatab.midi.MidiRepeatController.__name__ = ["net","alphatab","midi","MidiRepeatController"];
net.alphatab.midi.MidiRepeatController.prototype._count = null;
net.alphatab.midi.MidiRepeatController.prototype._lastIndex = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatAlternative = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatEnd = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatNumber = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatOpen = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatStart = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatStartIndex = null;
net.alphatab.midi.MidiRepeatController.prototype._song = null;
net.alphatab.midi.MidiRepeatController.prototype.finished = function() {
	return (this.index >= this._count);
}
net.alphatab.midi.MidiRepeatController.prototype.index = null;
net.alphatab.midi.MidiRepeatController.prototype.process = function() {
	var header = this._song.measureHeaders[this.index];
	this.shouldPlay = true;
	if(header.isRepeatOpen) {
		this._repeatStartIndex = this.index;
		this._repeatStart = header.start;
		this._repeatOpen = true;
		if(this.index > this._lastIndex) {
			this._repeatNumber = 0;
			this._repeatAlternative = 0;
		}
	}
	else {
		if(this._repeatAlternative == 0) {
			this._repeatAlternative = header.repeatAlternative;
		}
		if((this._repeatOpen && (this._repeatAlternative > 0)) && ((this._repeatAlternative & (1 << this._repeatNumber)) == 0)) {
			this.repeatMove -= header.length();
			if(header.repeatClose > 0) {
				this._repeatAlternative = 0;
			}
			this.shouldPlay = false;
			this.index++;
			return;
		}
	}
	this._lastIndex = Math.round(Math.max(this._lastIndex,this.index));
	if(this._repeatOpen && (header.repeatClose > 0)) {
		if((this._repeatNumber < header.repeatClose) || (this._repeatAlternative > 0)) {
			this._repeatEnd = header.start + header.length();
			this.repeatMove += this._repeatEnd - this._repeatStart;
			this.index = this._repeatStartIndex - 1;
			this._repeatNumber++;
		}
		else {
			this._repeatStart = 0;
			this._repeatNumber = 0;
			this._repeatEnd = 0;
			this._repeatOpen = false;
		}
		this._repeatAlternative = 0;
	}
	this.index++;
}
net.alphatab.midi.MidiRepeatController.prototype.repeatMove = null;
net.alphatab.midi.MidiRepeatController.prototype.shouldPlay = null;
net.alphatab.midi.MidiRepeatController.prototype.__class__ = net.alphatab.midi.MidiRepeatController;
net.alphatab.model.Rectangle = function(x,y,width,height) { if( x === $_ ) return; {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}}
net.alphatab.model.Rectangle.__name__ = ["net","alphatab","model","Rectangle"];
net.alphatab.model.Rectangle.prototype.height = null;
net.alphatab.model.Rectangle.prototype.width = null;
net.alphatab.model.Rectangle.prototype.x = null;
net.alphatab.model.Rectangle.prototype.y = null;
net.alphatab.model.Rectangle.prototype.__class__ = net.alphatab.model.Rectangle;
net.alphatab.platform.FileLoader = function() { }
net.alphatab.platform.FileLoader.__name__ = ["net","alphatab","platform","FileLoader"];
net.alphatab.platform.FileLoader.prototype.loadBinary = null;
net.alphatab.platform.FileLoader.prototype.__class__ = net.alphatab.platform.FileLoader;
net.alphatab.model.effects.BendPoint = function(position,value,vibrato) { if( position === $_ ) return; {
	if(vibrato == null) vibrato = false;
	if(value == null) value = 0;
	if(position == null) position = 0;
	this.position = position;
	this.value = value;
	this.vibrato = vibrato;
}}
net.alphatab.model.effects.BendPoint.__name__ = ["net","alphatab","model","effects","BendPoint"];
net.alphatab.model.effects.BendPoint.prototype.GetTime = function(duration) {
	return Math.floor((duration * this.position) / 12);
}
net.alphatab.model.effects.BendPoint.prototype.position = null;
net.alphatab.model.effects.BendPoint.prototype.value = null;
net.alphatab.model.effects.BendPoint.prototype.vibrato = null;
net.alphatab.model.effects.BendPoint.prototype.__class__ = net.alphatab.model.effects.BendPoint;
net.alphatab.midi.MidiController = function() { }
net.alphatab.midi.MidiController.__name__ = ["net","alphatab","midi","MidiController"];
net.alphatab.midi.MidiController.prototype.__class__ = net.alphatab.midi.MidiController;
if(!net.alphatab.platform.js) net.alphatab.platform.js = {}
net.alphatab.platform.js.JQuery = function() { }
net.alphatab.platform.js.JQuery.__name__ = ["net","alphatab","platform","js","JQuery"];
net.alphatab.platform.js.JQuery.elements = function(e) {
	return (jQuery(e));
}
net.alphatab.platform.js.JQuery.ajax = function(options) {
	return jQuery.ajax(options);
}
net.alphatab.platform.js.JQuery.isIE = function() {
	return jQuery.browser.msie;
}
net.alphatab.platform.js.JQuery.prototype.Children = function() {
	return this.children();
}
net.alphatab.platform.js.JQuery.prototype.Get = function(index) {
	return this.get(index);
}
net.alphatab.platform.js.JQuery.prototype.Height = function() {
	return this.height();
}
net.alphatab.platform.js.JQuery.prototype.Length = function() {
	return this.length;
}
net.alphatab.platform.js.JQuery.prototype.Width = function() {
	return this.width();
}
net.alphatab.platform.js.JQuery.prototype.setHeight = function(value) {
	return this.height(value);
}
net.alphatab.platform.js.JQuery.prototype.setWidth = function(value) {
	return this.width(value);
}
net.alphatab.platform.js.JQuery.prototype.__class__ = net.alphatab.platform.js.JQuery;
net.alphatab.tablature.model.BeatImpl = function(factory) { if( factory === $_ ) return; {
	net.alphatab.model.Beat.apply(this,[factory]);
}}
net.alphatab.tablature.model.BeatImpl.__name__ = ["net","alphatab","tablature","model","BeatImpl"];
net.alphatab.tablature.model.BeatImpl.__super__ = net.alphatab.model.Beat;
for(var k in net.alphatab.model.Beat.prototype ) net.alphatab.tablature.model.BeatImpl.prototype[k] = net.alphatab.model.Beat.prototype[k];
net.alphatab.tablature.model.BeatImpl.prototype.beatGroup = null;
net.alphatab.tablature.model.BeatImpl.prototype.calculateTremoloBarOverflow = function(layout) {
	var point = null;
	{
		var _g = 0, _g1 = this.effect.tremoloBar.points;
		while(_g < _g1.length) {
			var curr = _g1[_g];
			++_g;
			if(point == null || curr.value < point.value) point = curr;
		}
	}
	if(point == null) return 0;
	var fullHeight = point.value * (6 * layout.scale);
	var string = (this.minNote == null?6:this.minNote.string);
	var spaceToBottom = (6 - string) * layout.stringSpacing;
	if(fullHeight < 0) {
		var overflow = Math.round(-((Math.abs(fullHeight) + (layout.stringSpacing / 2)) - spaceToBottom));
		return overflow;
	}
	else {
		return 0;
	}
}
net.alphatab.tablature.model.BeatImpl.prototype.caretPosition = function(layout) {
	return Math.round(this.getRealPosX(layout) + 8 * layout.scale);
}
net.alphatab.tablature.model.BeatImpl.prototype.check = function(note) {
	var value = note.realValue();
	if(this.maxNote == null || value > this.maxNote.realValue()) this.maxNote = note;
	if(this.minNote == null || value < this.minNote.realValue()) this.minNote = note;
}
net.alphatab.tablature.model.BeatImpl.prototype.getPaintPosition = function(position) {
	return this.measureImpl().ts.get(position);
}
net.alphatab.tablature.model.BeatImpl.prototype.getRealPosX = function(layout) {
	return (((this.measureImpl().posX + this.measureImpl().headerImpl().getLeftSpacing(layout)) + this.posX) + this.spacing()) + (4 * layout.scale);
}
net.alphatab.tablature.model.BeatImpl.prototype.getVoiceImpl = function(index) {
	return this.voices[index];
}
net.alphatab.tablature.model.BeatImpl.prototype.height = function() {
	return this.measureImpl().ts.getSize();
}
net.alphatab.tablature.model.BeatImpl.prototype.join1 = null;
net.alphatab.tablature.model.BeatImpl.prototype.join2 = null;
net.alphatab.tablature.model.BeatImpl.prototype.joinedGreaterThanQuarter = null;
net.alphatab.tablature.model.BeatImpl.prototype.joinedType = null;
net.alphatab.tablature.model.BeatImpl.prototype.lastPaintX = null;
net.alphatab.tablature.model.BeatImpl.prototype.maxNote = null;
net.alphatab.tablature.model.BeatImpl.prototype.measureImpl = function() {
	return this.measure;
}
net.alphatab.tablature.model.BeatImpl.prototype.minNote = null;
net.alphatab.tablature.model.BeatImpl.prototype.minimumWidth = null;
net.alphatab.tablature.model.BeatImpl.prototype.nextBeat = null;
net.alphatab.tablature.model.BeatImpl.prototype.paint = function(layout,context,x,y) {
	x += this.posX + this.spacing();
	this.lastPaintX = x;
	this.paintExtraLines(context,layout,x,y);
	this.paintBeatEffects(context,layout,x,y);
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			this.getVoiceImpl(v).paint(layout,context,x,y);
		}
	}
}
net.alphatab.tablature.model.BeatImpl.prototype.paintBeatEffects = function(context,layout,x,y) {
	var realX = x + 3 * layout.scale;
	var fill = context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1);
	if(this.effect.stroke.direction != net.alphatab.model.BeatStrokeDirection.None) {
		this.paintStroke(layout,context,x,y);
	}
	if(this.effect.chord != null) {
		var chordImpl = this.effect.chord;
		chordImpl.paint(layout,context,x,y);
	}
	if(this.effect.fadeIn) {
		var realY = y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.FadeIn);
		this.paintFadeIn(layout,context,realX,realY);
	}
	if(this.effect.tapping) {
		var realY = y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.TapingEffect);
		fill.addString("T",net.alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
	}
	else if(this.effect.slapping) {
		var realY = y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.TapingEffect);
		fill.addString("S",net.alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
	}
	else if(this.effect.popping) {
		var realY = y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.TapingEffect);
		fill.addString("P",net.alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
	}
	if(this.effect.vibrato) {
		var realY = y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect);
		this.paintVibrato(layout,context,realX,realY,1);
	}
	if(this.effect.isTremoloBar()) {
		var string = (this.minNote == null?6:this.minNote.string);
		var realY = (y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.Tablature)) + Math.round((string - 1) * layout.stringSpacing);
		var nextBeat = layout.songManager().getNextBeat(this);
		if(nextBeat != null && nextBeat.measureImpl().ts != this.measureImpl().ts) nextBeat = null;
		this.paintTremoloBar(layout,context,nextBeat,realX,realY);
	}
}
net.alphatab.tablature.model.BeatImpl.prototype.paintExtraLines = function(context,layout,x,y) {
	if(!this.isRestBeat()) {
		var scoreY = y + this.measureImpl().ts.get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		this.paintExtraLines2(context,layout,this.minNote,x,scoreY);
		this.paintExtraLines2(context,layout,this.maxNote,x,scoreY);
	}
}
net.alphatab.tablature.model.BeatImpl.prototype.paintExtraLines2 = function(context,layout,note,x,y) {
	var realY = y + note.scorePosY;
	var x1 = x + 3 * layout.scale;
	var x2 = x + 15 * layout.scale;
	var scorelineSpacing = layout.scoreLineSpacing;
	if(realY < y) {
		var i = y;
		while(i > realY) {
			context.get(net.alphatab.tablature.drawing.DrawingLayers.Lines).startFigure();
			context.get(net.alphatab.tablature.drawing.DrawingLayers.Lines).addLine(x1,i,x2,i);
			i -= scorelineSpacing;
		}
	}
	else if(realY > (y + (scorelineSpacing * 4))) {
		var i = (y + (scorelineSpacing * 5));
		while(i < (realY + scorelineSpacing)) {
			context.get(net.alphatab.tablature.drawing.DrawingLayers.Lines).startFigure();
			context.get(net.alphatab.tablature.drawing.DrawingLayers.Lines).addLine(x1,i,x2,i);
			i += scorelineSpacing;
		}
	}
}
net.alphatab.tablature.model.BeatImpl.prototype.paintFadeIn = function(layout,context,x,y) {
	var scale = layout.scale;
	var realX = x;
	var realY = Math.round(y + (4.0 * scale));
	var fWidth = Math.round(this.width());
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1);
	layer.startFigure();
	layer.addBezier(realX,realY,realX,realY,realX + fWidth,realY,realX + fWidth,Math.round(realY - (4 * scale)));
	layer.startFigure();
	layer.addBezier(realX,realY,realX,realY,realX + fWidth,realY,realX + fWidth,Math.round(realY + (4 * scale)));
}
net.alphatab.tablature.model.BeatImpl.prototype.paintStroke = function(layout,context,x,y) {
	if(this.effect.stroke.direction == net.alphatab.model.BeatStrokeDirection.None) return;
	var scale = layout.scale;
	var realX = x;
	var realY = y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.Tablature);
	var y1 = realY;
	var y2 = realY + this.measureImpl().trackImpl().tabHeight;
	var layer = context.get(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw);
	layer.startFigure();
	if(this.effect.stroke.direction == net.alphatab.model.BeatStrokeDirection.Up) {
		layer.moveTo(realX,y1);
		layer.lineTo(realX,y2);
		layer.lineTo(realX - (2.0 * scale),y2 - (5.0 * scale));
		layer.moveTo(realX,y2);
		layer.lineTo(realX + (2.0 * scale),y2 - (5.0 * scale));
	}
	else {
		layer.moveTo(realX,y2);
		layer.lineTo(realX,y1);
		layer.lineTo(realX - (2.0 * scale),y1 + (3.0 * scale));
		layer.moveTo(realX,y1);
		layer.lineTo(realX + (2.0 * scale),y1 + (3.0 * scale));
	}
}
net.alphatab.tablature.model.BeatImpl.prototype.paintTremoloBar = function(layout,context,nextBeat,x,y) {
	var scale = layout.scale;
	var realX = x + (5 * scale);
	var realY = y + ((net.alphatab.tablature.drawing.DrawingResources.noteFontHeight / 2) * scale);
	var xTo;
	var minY = realY - 60 * scale;
	if(nextBeat == null) {
		xTo = (this.measureImpl().posX + this.measureImpl().width) + this.measureImpl().spacing;
	}
	else {
		xTo = (((nextBeat.measureImpl().posX + nextBeat.measureImpl().headerImpl().getLeftSpacing(layout)) + nextBeat.posX) + (nextBeat.spacing() * scale)) + 5 * scale;
	}
	var fill = context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1);
	var draw = context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1);
	var tremolo = this.effect.tremoloBar;
	if(tremolo.points.length >= 2) {
		var dX = (xTo - realX) / 12;
		var dY = (realY - minY) / 12;
		draw.startFigure();
		{
			var _g1 = 0, _g = tremolo.points.length - 1;
			while(_g1 < _g) {
				var i = _g1++;
				var firstPt = tremolo.points[i];
				var secondPt = tremolo.points[i + 1];
				if(firstPt.value == secondPt.value && i == tremolo.points.length - 2) continue;
				var firstLoc = new net.alphatab.model.Point(Math.floor(realX + (dX * firstPt.position)),Math.floor(realY - dY * firstPt.value));
				var secondLoc = new net.alphatab.model.Point(Math.floor(realX + (dX * secondPt.position)),Math.floor(realY - dY * secondPt.value));
				draw.addLine(firstLoc.x,firstLoc.y,secondLoc.x,secondLoc.y);
				if(secondPt.value != 0) {
					var dV = (secondPt.value) * 0.5;
					var up = (secondPt.value - firstPt.value) >= 0;
					var s = "";
					if(dV >= 1 || dV <= -1) s += ("-" + Std.string(Math.floor(Math.abs(dV)))) + " ";
					else if(dV < 0) s += "-";
					dV -= Math.floor(dV);
					if(dV == 0.25) s += "1/4";
					else if(dV == 0.5) s += "1/2";
					else if(dV == 0.75) s += "3/4";
					context.graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.defaultFont);
					var size = context.graphics.measureText(s);
					var sY = (up?(secondLoc.y - net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight) - (3 * scale):secondLoc.y + (3 * scale));
					var sX = secondLoc.x - size / 2;
					fill.addString(s,net.alphatab.tablature.drawing.DrawingResources.defaultFont,sX,sY);
				}
			}
		}
	}
}
net.alphatab.tablature.model.BeatImpl.prototype.paintVibrato = function(layout,context,x,y,symbolScale) {
	var scale = layout.scale;
	var realX = x - 2 * scale;
	var realY = y + (2.0 * scale);
	var width = this.width();
	var fill = context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1);
	var step = (18 * scale) * symbolScale;
	var loops = Math.floor(Math.max(1,(width / step)));
	var s = "";
	{
		var _g = 0;
		while(_g < loops) {
			var i = _g++;
			fill.addMusicSymbol(net.alphatab.tablature.drawing.MusicFont.VibratoLeftRight,realX,realY,layout.scale * symbolScale);
			realX += step;
		}
	}
}
net.alphatab.tablature.model.BeatImpl.prototype.posX = null;
net.alphatab.tablature.model.BeatImpl.prototype.previousBeat = null;
net.alphatab.tablature.model.BeatImpl.prototype.reset = function() {
	this.maxNote = null;
	this.minNote = null;
}
net.alphatab.tablature.model.BeatImpl.prototype.spacing = function() {
	return this.measureImpl().getBeatSpacing(this);
}
net.alphatab.tablature.model.BeatImpl.prototype.width = function() {
	var w = 0;
	{
		var _g1 = 0, _g = this.voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var cw = this.getVoiceImpl(i).width;
			if(cw > w) w = cw;
		}
	}
	return w;
}
net.alphatab.tablature.model.BeatImpl.prototype.__class__ = net.alphatab.tablature.model.BeatImpl;
StringBuf = function(p) { if( p === $_ ) return; {
	this.b = new Array();
}}
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype.add = function(x) {
	this.b[this.b.length] = x;
}
StringBuf.prototype.addChar = function(c) {
	this.b[this.b.length] = String.fromCharCode(c);
}
StringBuf.prototype.addSub = function(s,pos,len) {
	this.b[this.b.length] = s.substr(pos,len);
}
StringBuf.prototype.b = null;
StringBuf.prototype.toString = function() {
	return this.b.join("");
}
StringBuf.prototype.__class__ = StringBuf;
net.alphatab.midi.BeatData = function(start,duration) { if( start === $_ ) return; {
	this.start = start;
	this.duration = duration;
}}
net.alphatab.midi.BeatData.__name__ = ["net","alphatab","midi","BeatData"];
net.alphatab.midi.BeatData.prototype.duration = null;
net.alphatab.midi.BeatData.prototype.start = null;
net.alphatab.midi.BeatData.prototype.__class__ = net.alphatab.midi.BeatData;
haxe.Log = function() { }
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Log.clear = function() {
	js.Boot.__clear_trace();
}
haxe.Log.prototype.__class__ = haxe.Log;
haxe.Serializer = function(p) { if( p === $_ ) return; {
	this.buf = new StringBuf();
	this.cache = new Array();
	this.useCache = haxe.Serializer.USE_CACHE;
	this.useEnumIndex = haxe.Serializer.USE_ENUM_INDEX;
	this.shash = new Hash();
	this.scount = 0;
}}
haxe.Serializer.__name__ = ["haxe","Serializer"];
haxe.Serializer.run = function(v) {
	var s = new haxe.Serializer();
	s.serialize(v);
	return s.toString();
}
haxe.Serializer.prototype.buf = null;
haxe.Serializer.prototype.cache = null;
haxe.Serializer.prototype.scount = null;
haxe.Serializer.prototype.serialize = function(v) {
	var $e = (Type["typeof"](v));
	switch( $e[1] ) {
	case 0:
	{
		this.buf.add("n");
	}break;
	case 1:
	{
		if(v == 0) {
			this.buf.add("z");
			return;
		}
		this.buf.add("i");
		this.buf.add(v);
	}break;
	case 2:
	{
		if(Math.isNaN(v)) this.buf.add("k");
		else if(!Math.isFinite(v)) this.buf.add((v < 0?"m":"p"));
		else {
			this.buf.add("d");
			this.buf.add(v);
		}
	}break;
	case 3:
	{
		this.buf.add((v?"t":"f"));
	}break;
	case 6:
	var c = $e[2];
	{
		if(c == String) {
			this.serializeString(v);
			return;
		}
		if(this.useCache && this.serializeRef(v)) return;
		switch(c) {
		case Array:{
			var ucount = 0;
			this.buf.add("a");
			var l = v["length"];
			{
				var _g = 0;
				while(_g < l) {
					var i = _g++;
					if(v[i] == null) ucount++;
					else {
						if(ucount > 0) {
							if(ucount == 1) this.buf.add("n");
							else {
								this.buf.add("u");
								this.buf.add(ucount);
							}
							ucount = 0;
						}
						this.serialize(v[i]);
					}
				}
			}
			if(ucount > 0) {
				if(ucount == 1) this.buf.add("n");
				else {
					this.buf.add("u");
					this.buf.add(ucount);
				}
			}
			this.buf.add("h");
		}break;
		case List:{
			this.buf.add("l");
			var v1 = v;
			{ var $it18 = v1.iterator();
			while( $it18.hasNext() ) { var i = $it18.next();
			this.serialize(i);
			}}
			this.buf.add("h");
		}break;
		case Date:{
			var d = v;
			this.buf.add("v");
			this.buf.add(d.toString());
		}break;
		case Hash:{
			this.buf.add("b");
			var v1 = v;
			{ var $it19 = v1.keys();
			while( $it19.hasNext() ) { var k = $it19.next();
			{
				this.serializeString(k);
				this.serialize(v1.get(k));
			}
			}}
			this.buf.add("h");
		}break;
		case IntHash:{
			this.buf.add("q");
			var v1 = v;
			{ var $it20 = v1.keys();
			while( $it20.hasNext() ) { var k = $it20.next();
			{
				this.buf.add(":");
				this.buf.add(k);
				this.serialize(v1.get(k));
			}
			}}
			this.buf.add("h");
		}break;
		case haxe.io.Bytes:{
			var v1 = v;
			var i = 0;
			var max = v1.length - 2;
			var chars = "";
			var b64 = haxe.Serializer.BASE64;
			while(i < max) {
				var b1 = v1.b[i++];
				var b2 = v1.b[i++];
				var b3 = v1.b[i++];
				chars += ((b64.charAt(b1 >> 2) + b64.charAt(((b1 << 4) | (b2 >> 4)) & 63)) + b64.charAt(((b2 << 2) | (b3 >> 6)) & 63)) + b64.charAt(b3 & 63);
			}
			if(i == max) {
				var b1 = v1.b[i++];
				var b2 = v1.b[i++];
				chars += (b64.charAt(b1 >> 2) + b64.charAt(((b1 << 4) | (b2 >> 4)) & 63)) + b64.charAt((b2 << 2) & 63);
			}
			else if(i == max + 1) {
				var b1 = v1.b[i++];
				chars += b64.charAt(b1 >> 2) + b64.charAt((b1 << 4) & 63);
			}
			this.buf.add("s");
			this.buf.add(chars.length);
			this.buf.add(":");
			this.buf.add(chars);
		}break;
		default:{
			this.cache.pop();
			this.buf.add("c");
			this.serializeString(Type.getClassName(c));
			this.cache.push(v);
			this.serializeFields(v);
		}break;
		}
	}break;
	case 4:
	{
		if(this.useCache && this.serializeRef(v)) return;
		this.buf.add("o");
		this.serializeFields(v);
	}break;
	case 7:
	var e = $e[2];
	{
		if(this.useCache && this.serializeRef(v)) return;
		this.cache.pop();
		this.buf.add((this.useEnumIndex?"j":"w"));
		this.serializeString(Type.getEnumName(e));
		if(this.useEnumIndex) {
			this.buf.add(":");
			this.buf.add(v[1]);
		}
		else this.serializeString(v[0]);
		this.buf.add(":");
		var l = v["length"];
		this.buf.add(l - 2);
		{
			var _g = 2;
			while(_g < l) {
				var i = _g++;
				this.serialize(v[i]);
			}
		}
		this.cache.push(v);
	}break;
	case 5:
	{
		throw "Cannot serialize function";
	}break;
	default:{
		throw "Cannot serialize " + Std.string(v);
	}break;
	}
}
haxe.Serializer.prototype.serializeException = function(e) {
	this.buf.add("x");
	this.serialize(e);
}
haxe.Serializer.prototype.serializeFields = function(v) {
	{
		var _g = 0, _g1 = Reflect.fields(v);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			this.serializeString(f);
			this.serialize(Reflect.field(v,f));
		}
	}
	this.buf.add("g");
}
haxe.Serializer.prototype.serializeRef = function(v) {
	var vt = typeof(v);
	{
		var _g1 = 0, _g = this.cache.length;
		while(_g1 < _g) {
			var i = _g1++;
			var ci = this.cache[i];
			if(typeof(ci) == vt && ci == v) {
				this.buf.add("r");
				this.buf.add(i);
				return true;
			}
		}
	}
	this.cache.push(v);
	return false;
}
haxe.Serializer.prototype.serializeString = function(s) {
	var x = this.shash.get(s);
	if(x != null) {
		this.buf.add("R");
		this.buf.add(x);
		return;
	}
	this.shash.set(s,this.scount++);
	this.buf.add("y");
	s = StringTools.urlEncode(s);
	this.buf.add(s.length);
	this.buf.add(":");
	this.buf.add(s);
}
haxe.Serializer.prototype.shash = null;
haxe.Serializer.prototype.toString = function() {
	return this.buf.b.join("");
}
haxe.Serializer.prototype.useCache = null;
haxe.Serializer.prototype.useEnumIndex = null;
haxe.Serializer.prototype.__class__ = haxe.Serializer;
net.alphatab.platform.js.JsFileLoader = function(p) { if( p === $_ ) return; {
	null;
}}
net.alphatab.platform.js.JsFileLoader.__name__ = ["net","alphatab","platform","js","JsFileLoader"];
net.alphatab.platform.js.JsFileLoader.prototype.loadBinary = function(method,file,success,error) {
	if(jQuery.browser.msie) {
		var ctx = new haxe.remoting.Context();
		ctx.addObject("JsFileLoader",this);
		var cnx = haxe.remoting.ExternalConnection.flashConnect("default","alphaTabFlashLoader",ctx);
		cnx.resolve("FlashFileLoader").resolve("LoadBinaryFile").call([file,method.toLowerCase() == "post",function(data) {
			var reader = new net.alphatab.platform.BinaryReader();
			reader.initialize(data);
			success(reader);
		},function(msg) {
			error(msg);
		}]);
	}
	else {
		var options = { }
		options.type = method;
		options.url = file;
		options.success = function(data) {
			var reader = new net.alphatab.platform.BinaryReader();
			reader.initialize(data);
			success(reader);
		}
		options.error = function(x,e) {
			if(x.status == 0) {
				error("You are offline!!\n Please Check Your Network.");
			}
			else if(x.status == 404) {
				error("Requested URL not found.");
			}
			else if(x.status == 500) {
				error("Internel Server Error.");
			}
			else if(e == "parsererror") {
				error("Error.\nParsing JSON Request failed.");
			}
			else if(e == "timeout") {
				error("Request Time out.");
			}
			else {
				error("Unknow Error.\n" + x.responseText);
			}
		}
		options.beforeSend = function(xhr) {
			if(xhr.overrideMimeType) {
				xhr.overrideMimeType("text/plain; charset=x-user-defined");
			}
			else null;
		}
		jQuery.ajax(options);
	}
}
net.alphatab.platform.js.JsFileLoader.prototype.__class__ = net.alphatab.platform.js.JsFileLoader;
net.alphatab.platform.js.JsFileLoader.__interfaces__ = [net.alphatab.platform.FileLoader];
if(!haxe._Template) haxe._Template = {}
haxe._Template.TemplateExpr = { __ename__ : ["haxe","_Template","TemplateExpr"], __constructs__ : ["OpVar","OpExpr","OpIf","OpStr","OpBlock","OpForeach","OpMacro"] }
haxe._Template.TemplateExpr.OpBlock = function(l) { var $x = ["OpBlock",4,l]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpExpr = function(expr) { var $x = ["OpExpr",1,expr]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpForeach = function(expr,loop) { var $x = ["OpForeach",5,expr,loop]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpIf = function(expr,eif,eelse) { var $x = ["OpIf",2,expr,eif,eelse]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpMacro = function(name,params) { var $x = ["OpMacro",6,name,params]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpStr = function(str) { var $x = ["OpStr",3,str]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpVar = function(v) { var $x = ["OpVar",0,v]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe.Template = function(str) { if( str === $_ ) return; {
	var tokens = this.parseTokens(str);
	this.expr = this.parseBlock(tokens);
	if(!tokens.isEmpty()) throw ("Unexpected '" + tokens.first().s) + "'";
}}
haxe.Template.__name__ = ["haxe","Template"];
haxe.Template.prototype.buf = null;
haxe.Template.prototype.context = null;
haxe.Template.prototype.execute = function(context,macros) {
	this.macros = (macros == null?{ }:macros);
	this.context = context;
	this.stack = new List();
	this.buf = new StringBuf();
	this.run(this.expr);
	return this.buf.b.join("");
}
haxe.Template.prototype.expr = null;
haxe.Template.prototype.macros = null;
haxe.Template.prototype.makeConst = function(v) {
	haxe.Template.expr_trim.match(v);
	v = haxe.Template.expr_trim.matched(1);
	if(v.charCodeAt(0) == 34) {
		var str = v.substr(1,v.length - 2);
		return function() {
			return str;
		}
	}
	if(haxe.Template.expr_int.match(v)) {
		var i = Std.parseInt(v);
		return function() {
			return i;
		}
	}
	if(haxe.Template.expr_float.match(v)) {
		var f = Std.parseFloat(v);
		return function() {
			return f;
		}
	}
	var me = this;
	return function() {
		return me.resolve(v);
	}
}
haxe.Template.prototype.makeExpr = function(l) {
	return this.makePath(this.makeExpr2(l),l);
}
haxe.Template.prototype.makeExpr2 = function(l) {
	var p = l.pop();
	if(p == null) throw "<eof>";
	if(p.s) return this.makeConst(p.p);
	switch(p.p) {
	case "(":{
		var e1 = this.makeExpr(l);
		var p1 = l.pop();
		if(p1 == null || p1.s) throw p1.p;
		if(p1.p == ")") return e1;
		var e2 = this.makeExpr(l);
		var p2 = l.pop();
		if(p2 == null || p2.p != ")") throw p2.p;
		return (function($this) {
			var $r;
			switch(p1.p) {
			case "+":{
				$r = function() {
					return e1() + e2();
				}
			}break;
			case "-":{
				$r = function() {
					return e1() - e2();
				}
			}break;
			case "*":{
				$r = function() {
					return e1() * e2();
				}
			}break;
			case "/":{
				$r = function() {
					return e1() / e2();
				}
			}break;
			case ">":{
				$r = function() {
					return e1() > e2();
				}
			}break;
			case "<":{
				$r = function() {
					return e1() < e2();
				}
			}break;
			case ">=":{
				$r = function() {
					return e1() >= e2();
				}
			}break;
			case "<=":{
				$r = function() {
					return e1() <= e2();
				}
			}break;
			case "==":{
				$r = function() {
					return e1() == e2();
				}
			}break;
			case "!=":{
				$r = function() {
					return e1() != e2();
				}
			}break;
			case "&&":{
				$r = function() {
					return e1() && e2();
				}
			}break;
			case "||":{
				$r = function() {
					return e1() || e2();
				}
			}break;
			default:{
				$r = (function($this) {
					var $r;
					throw "Unknown operation " + p1.p;
					return $r;
				}($this));
			}break;
			}
			return $r;
		}(this));
	}break;
	case "!":{
		var e = this.makeExpr(l);
		return function() {
			var v = e();
			return (v == null || v == false);
		}
	}break;
	case "-":{
		var e = this.makeExpr(l);
		return function() {
			return -e();
		}
	}break;
	}
	throw p.p;
}
haxe.Template.prototype.makePath = function(e,l) {
	var p = l.first();
	if(p == null || p.p != ".") return e;
	l.pop();
	var field = l.pop();
	if(field == null || !field.s) throw field.p;
	var f = field.p;
	haxe.Template.expr_trim.match(f);
	f = haxe.Template.expr_trim.matched(1);
	return this.makePath(function() {
		return Reflect.field(e(),f);
	},l);
}
haxe.Template.prototype.parse = function(tokens) {
	var t = tokens.pop();
	var p = t.p;
	if(t.s) return haxe._Template.TemplateExpr.OpStr(p);
	if(t.l != null) {
		var pe = new List();
		{
			var _g = 0, _g1 = t.l;
			while(_g < _g1.length) {
				var p1 = _g1[_g];
				++_g;
				pe.add(this.parseBlock(this.parseTokens(p1)));
			}
		}
		return haxe._Template.TemplateExpr.OpMacro(p,pe);
	}
	if(p.substr(0,3) == "if ") {
		p = p.substr(3,p.length - 3);
		var e = this.parseExpr(p);
		var eif = this.parseBlock(tokens);
		var t1 = tokens.first();
		var eelse;
		if(t1 == null) throw "Unclosed 'if'";
		if(t1.p == "end") {
			tokens.pop();
			eelse = null;
		}
		else if(t1.p == "else") {
			tokens.pop();
			eelse = this.parseBlock(tokens);
			t1 = tokens.pop();
			if(t1 == null || t1.p != "end") throw "Unclosed 'else'";
		}
		else {
			t1.p = t1.p.substr(4,t1.p.length - 4);
			eelse = this.parse(tokens);
		}
		return haxe._Template.TemplateExpr.OpIf(e,eif,eelse);
	}
	if(p.substr(0,8) == "foreach ") {
		p = p.substr(8,p.length - 8);
		var e = this.parseExpr(p);
		var efor = this.parseBlock(tokens);
		var t1 = tokens.pop();
		if(t1 == null || t1.p != "end") throw "Unclosed 'foreach'";
		return haxe._Template.TemplateExpr.OpForeach(e,efor);
	}
	if(haxe.Template.expr_splitter.match(p)) return haxe._Template.TemplateExpr.OpExpr(this.parseExpr(p));
	return haxe._Template.TemplateExpr.OpVar(p);
}
haxe.Template.prototype.parseBlock = function(tokens) {
	var l = new List();
	while(true) {
		var t = tokens.first();
		if(t == null) break;
		if(!t.s && (t.p == "end" || t.p == "else" || t.p.substr(0,7) == "elseif ")) break;
		l.add(this.parse(tokens));
	}
	if(l.length == 1) return l.first();
	return haxe._Template.TemplateExpr.OpBlock(l);
}
haxe.Template.prototype.parseExpr = function(data) {
	var l = new List();
	var expr = data;
	while(haxe.Template.expr_splitter.match(data)) {
		var p = haxe.Template.expr_splitter.matchedPos();
		var k = p.pos + p.len;
		if(p.pos != 0) l.add({ p : data.substr(0,p.pos), s : true});
		var p1 = haxe.Template.expr_splitter.matched(0);
		l.add({ p : p1, s : p1.indexOf("\"") >= 0});
		data = haxe.Template.expr_splitter.matchedRight();
	}
	if(data.length != 0) l.add({ p : data, s : true});
	var e;
	try {
		e = this.makeExpr(l);
		if(!l.isEmpty()) throw l.first().p;
	}
	catch( $e21 ) {
		if( js.Boot.__instanceof($e21,String) ) {
			var s = $e21;
			{
				throw (("Unexpected '" + s) + "' in ") + expr;
			}
		} else throw($e21);
	}
	return function() {
		try {
			return e();
		}
		catch( $e22 ) {
			{
				var exc = $e22;
				{
					throw (("Error : " + Std.string(exc)) + " in ") + expr;
				}
			}
		}
	}
}
haxe.Template.prototype.parseTokens = function(data) {
	var tokens = new List();
	while(haxe.Template.splitter.match(data)) {
		var p = haxe.Template.splitter.matchedPos();
		if(p.pos > 0) tokens.add({ p : data.substr(0,p.pos), s : true, l : null});
		if(data.charCodeAt(p.pos) == 58) {
			tokens.add({ p : data.substr(p.pos + 2,p.len - 4), s : false, l : null});
			data = haxe.Template.splitter.matchedRight();
			continue;
		}
		var parp = p.pos + p.len;
		var npar = 1;
		while(npar > 0) {
			var c = data.charCodeAt(parp);
			if(c == 40) npar++;
			else if(c == 41) npar--;
			else if(c == null) throw "Unclosed macro parenthesis";
			parp++;
		}
		var params = data.substr(p.pos + p.len,(parp - (p.pos + p.len)) - 1).split(",");
		tokens.add({ p : haxe.Template.splitter.matched(2), s : false, l : params});
		data = data.substr(parp,data.length - parp);
	}
	if(data.length > 0) tokens.add({ p : data, s : true, l : null});
	return tokens;
}
haxe.Template.prototype.resolve = function(v) {
	if(Reflect.hasField(this.context,v)) return Reflect.field(this.context,v);
	{ var $it23 = this.stack.iterator();
	while( $it23.hasNext() ) { var ctx = $it23.next();
	if(Reflect.hasField(ctx,v)) return Reflect.field(ctx,v);
	}}
	if(v == "__current__") return this.context;
	return Reflect.field(haxe.Template.globals,v);
}
haxe.Template.prototype.run = function(e) {
	var $e = (e);
	switch( $e[1] ) {
	case 0:
	var v = $e[2];
	{
		this.buf.add(Std.string(this.resolve(v)));
	}break;
	case 1:
	var e1 = $e[2];
	{
		this.buf.add(Std.string(e1()));
	}break;
	case 2:
	var eelse = $e[4], eif = $e[3], e1 = $e[2];
	{
		var v = e1();
		if(v == null || v == false) {
			if(eelse != null) this.run(eelse);
		}
		else this.run(eif);
	}break;
	case 3:
	var str = $e[2];
	{
		this.buf.add(str);
	}break;
	case 4:
	var l = $e[2];
	{
		{ var $it24 = l.iterator();
		while( $it24.hasNext() ) { var e1 = $it24.next();
		this.run(e1);
		}}
	}break;
	case 5:
	var loop = $e[3], e1 = $e[2];
	{
		var v = e1();
		try {
			if(v.hasNext == null) {
				var x = v.iterator();
				if(x.hasNext == null) throw null;
				v = x;
			}
		}
		catch( $e25 ) {
			{
				var e2 = $e25;
				{
					throw "Cannot iter on " + v;
				}
			}
		}
		this.stack.push(this.context);
		var v1 = v;
		{ var $it26 = v1;
		while( $it26.hasNext() ) { var ctx = $it26.next();
		{
			this.context = ctx;
			this.run(loop);
		}
		}}
		this.context = this.stack.pop();
	}break;
	case 6:
	var params = $e[3], m = $e[2];
	{
		var v = Reflect.field(this.macros,m);
		var pl = new Array();
		var old = this.buf;
		pl.push($closure(this,"resolve"));
		{ var $it27 = params.iterator();
		while( $it27.hasNext() ) { var p = $it27.next();
		{
			var $e = (p);
			switch( $e[1] ) {
			case 0:
			var v1 = $e[2];
			{
				pl.push(this.resolve(v1));
			}break;
			default:{
				this.buf = new StringBuf();
				this.run(p);
				pl.push(this.buf.b.join(""));
			}break;
			}
		}
		}}
		this.buf = old;
		try {
			this.buf.add(Std.string(v.apply(this.macros,pl)));
		}
		catch( $e28 ) {
			{
				var e1 = $e28;
				{
					var plstr = (function($this) {
						var $r;
						try {
							$r = pl.join(",");
						}
						catch( $e29 ) {
							{
								var e2 = $e29;
								$r = "???";
							}
						}
						return $r;
					}(this));
					var msg = ((((("Macro call " + m) + "(") + plstr) + ") failed (") + Std.string(e1)) + ")";
					throw msg;
				}
			}
		}
	}break;
	}
}
haxe.Template.prototype.stack = null;
haxe.Template.prototype.__class__ = haxe.Template;
net.alphatab.model.PointF = function(x,y) { if( x === $_ ) return; {
	this.x = x;
	this.y = y;
}}
net.alphatab.model.PointF.__name__ = ["net","alphatab","model","PointF"];
net.alphatab.model.PointF.prototype.x = null;
net.alphatab.model.PointF.prototype.y = null;
net.alphatab.model.PointF.prototype.__class__ = net.alphatab.model.PointF;
net.alphatab.tablature.drawing.MusicFont = function() { }
net.alphatab.tablature.drawing.MusicFont.__name__ = ["net","alphatab","tablature","drawing","MusicFont"];
net.alphatab.tablature.drawing.MusicFont.prototype.__class__ = net.alphatab.tablature.drawing.MusicFont;
net.alphatab.platform.PlatformFactory = function() { }
net.alphatab.platform.PlatformFactory.__name__ = ["net","alphatab","platform","PlatformFactory"];
net.alphatab.platform.PlatformFactory.getCanvas = function(object) {
	return new net.alphatab.platform.js.Html5Canvas(object);
}
net.alphatab.platform.PlatformFactory.getLoader = function() {
	return new net.alphatab.platform.js.JsFileLoader();
}
net.alphatab.platform.PlatformFactory.prototype.__class__ = net.alphatab.platform.PlatformFactory;
haxe.io.StringInput = function(s) { if( s === $_ ) return; {
	haxe.io.BytesInput.apply(this,[haxe.io.Bytes.ofString(s)]);
}}
haxe.io.StringInput.__name__ = ["haxe","io","StringInput"];
haxe.io.StringInput.__super__ = haxe.io.BytesInput;
for(var k in haxe.io.BytesInput.prototype ) haxe.io.StringInput.prototype[k] = haxe.io.BytesInput.prototype[k];
haxe.io.StringInput.prototype.__class__ = haxe.io.StringInput;
net.alphatab.model.effects.BendEffect = function(p) { if( p === $_ ) return; {
	this.type = net.alphatab.model.effects.BendTypes.None;
	this.value = 0;
	this.points = new Array();
}}
net.alphatab.model.effects.BendEffect.__name__ = ["net","alphatab","model","effects","BendEffect"];
net.alphatab.model.effects.BendEffect.prototype.clone = function(factory) {
	var effect = factory.newBendEffect();
	effect.value = this.value;
	effect.type = this.type;
	{
		var _g1 = 0, _g = this.points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.points[i];
			effect.points.push(new net.alphatab.model.effects.BendPoint(point.position,point.value,point.vibrato));
		}
	}
	return effect;
}
net.alphatab.model.effects.BendEffect.prototype.points = null;
net.alphatab.model.effects.BendEffect.prototype.type = null;
net.alphatab.model.effects.BendEffect.prototype.value = null;
net.alphatab.model.effects.BendEffect.prototype.__class__ = net.alphatab.model.effects.BendEffect;
net.alphatab.model.Tuplet = function(p) { if( p === $_ ) return; {
	this.enters = 1;
	this.times = 1;
}}
net.alphatab.model.Tuplet.__name__ = ["net","alphatab","model","Tuplet"];
net.alphatab.model.Tuplet.prototype.clone = function(factory) {
	var tuplet = factory.newTuplet();
	this.copy(tuplet);
	return tuplet;
}
net.alphatab.model.Tuplet.prototype.convertTime = function(time) {
	return Math.floor((time * this.times) / this.enters);
}
net.alphatab.model.Tuplet.prototype.copy = function(tuplet) {
	tuplet.enters = this.enters;
	tuplet.times = this.times;
}
net.alphatab.model.Tuplet.prototype.enters = null;
net.alphatab.model.Tuplet.prototype.equals = function(tuplet) {
	return this.enters == tuplet.enters && this.times == tuplet.times;
}
net.alphatab.model.Tuplet.prototype.times = null;
net.alphatab.model.Tuplet.prototype.__class__ = net.alphatab.model.Tuplet;
net.alphatab.model.Duration = function(factory) { if( factory === $_ ) return; {
	this.value = 4;
	this.isDotted = false;
	this.isDoubleDotted = false;
	this.tuplet = factory.newTuplet();
}}
net.alphatab.model.Duration.__name__ = ["net","alphatab","model","Duration"];
net.alphatab.model.Duration.fromTime = function(factory,time,minimum,diff) {
	var duration = minimum.clone(factory);
	var tmp = factory.newDuration();
	tmp.value = 1;
	tmp.isDotted = true;
	var finish = false;
	while(!finish) {
		var tmpTime = tmp.time();
		if(tmpTime - diff <= time) {
			if(Math.abs(tmpTime - time) < Math.abs(duration.time() - time)) {
				duration = tmp.clone(factory);
			}
		}
		if(tmp.isDotted) {
			tmp.isDotted = false;
		}
		else if(tmp.tuplet.equals(new net.alphatab.model.Tuplet())) {
			tmp.tuplet.enters = 3;
			tmp.tuplet.times = 2;
		}
		else {
			tmp.value = tmp.value * 2;
			tmp.isDotted = true;
			tmp.tuplet.enters = 1;
			tmp.tuplet.times = 1;
		}
		if(tmp.value > 64) {
			finish = true;
		}
	}
	return duration;
}
net.alphatab.model.Duration.prototype.clone = function(factory) {
	var duration = factory.newDuration();
	duration.value = this.value;
	duration.isDotted = this.isDotted;
	duration.isDoubleDotted = this.isDoubleDotted;
	duration.tuplet = this.tuplet.clone(factory);
	return duration;
}
net.alphatab.model.Duration.prototype.copy = function(duration) {
	duration.value = this.value;
	duration.isDotted = this.isDotted;
	duration.isDoubleDotted = this.isDoubleDotted;
	this.tuplet.copy(duration.tuplet);
}
net.alphatab.model.Duration.prototype.equals = function(other) {
	if(other == null) return false;
	if(this == other) return true;
	return other.value == this.value && other.isDotted == this.isDotted && other.isDoubleDotted == this.isDoubleDotted && other.tuplet.equals(this.tuplet);
}
net.alphatab.model.Duration.prototype.index = function() {
	var index = 0;
	var value = this.value;
	while((value = (value >> 1)) > 0) {
		index++;
	}
	return index;
}
net.alphatab.model.Duration.prototype.isDotted = null;
net.alphatab.model.Duration.prototype.isDoubleDotted = null;
net.alphatab.model.Duration.prototype.time = function() {
	var time = Math.floor(960 * (4.0 / this.value));
	if(this.isDotted) {
		time += Math.floor(time / 2);
	}
	else if(this.isDoubleDotted) {
		time += Math.floor((time / 4) * 3);
	}
	return this.tuplet.convertTime(time);
}
net.alphatab.model.Duration.prototype.tuplet = null;
net.alphatab.model.Duration.prototype.value = null;
net.alphatab.model.Duration.prototype.__class__ = net.alphatab.model.Duration;
net.alphatab.tablature.drawing.DrawingContext = function(scale) { if( scale === $_ ) return; {
	this.layers = new Array();
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.Background)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(205,205,205),true,0);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(34,34,17),true,0);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.Lines)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(165,165,165),false,1);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.MainComponents)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(34,34,17),true,0);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(34,34,17),false,scale);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.Voice2)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(206,206,206),true,1);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(183,183,183),true,0);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(183,183,183),false,scale);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(206,206,206),false,scale);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.Voice1)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(34,34,17),true,1);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(34,34,17),true,0);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(34,34,17),false,scale);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(34,34,17),false,scale);
	this.layers[net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(net.alphatab.tablature.drawing.DrawingLayers.Red)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.Color(255,0,0),true,0);
}}
net.alphatab.tablature.drawing.DrawingContext.__name__ = ["net","alphatab","tablature","drawing","DrawingContext"];
net.alphatab.tablature.drawing.DrawingContext.prototype.clear = function() {
	var _g1 = 0, _g = this.layers.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.layers[i].clear();
	}
}
net.alphatab.tablature.drawing.DrawingContext.prototype.draw = function() {
	var _g1 = 0, _g = this.layers.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.layers[i].draw(this.graphics);
	}
}
net.alphatab.tablature.drawing.DrawingContext.prototype.get = function(layer) {
	var index = net.alphatab.tablature.drawing.DrawingLayersConverter.toInt(layer);
	return this.layers[index];
}
net.alphatab.tablature.drawing.DrawingContext.prototype.graphics = null;
net.alphatab.tablature.drawing.DrawingContext.prototype.layers = null;
net.alphatab.tablature.drawing.DrawingContext.prototype.__class__ = net.alphatab.tablature.drawing.DrawingContext;
net.alphatab.tablature.model.VoiceImpl = function(factory,index) { if( factory === $_ ) return; {
	net.alphatab.model.Voice.apply(this,[factory,index]);
}}
net.alphatab.tablature.model.VoiceImpl.__name__ = ["net","alphatab","tablature","model","VoiceImpl"];
net.alphatab.tablature.model.VoiceImpl.__super__ = net.alphatab.model.Voice;
for(var k in net.alphatab.model.Voice.prototype ) net.alphatab.tablature.model.VoiceImpl.prototype[k] = net.alphatab.model.Voice.prototype[k];
net.alphatab.tablature.model.VoiceImpl.prototype._hiddenSilence = null;
net.alphatab.tablature.model.VoiceImpl.prototype._silenceHeight = null;
net.alphatab.tablature.model.VoiceImpl.prototype._silenceY = null;
net.alphatab.tablature.model.VoiceImpl.prototype._usedStrings = null;
net.alphatab.tablature.model.VoiceImpl.prototype.beatGroup = null;
net.alphatab.tablature.model.VoiceImpl.prototype.beatImpl = function() {
	return this.beat;
}
net.alphatab.tablature.model.VoiceImpl.prototype.check = function(note) {
	var value = note.realValue();
	if(this.maxNote == null || value > this.maxNote.realValue()) this.maxNote = note;
	if(this.minNote == null || value < this.minNote.realValue()) this.minNote = note;
	this.usedStrings()[note.string - 1] = true;
	if(note.string > this.maxString) this.maxString = note.string;
	if(note.string < this.minString) this.minString = note.string;
}
net.alphatab.tablature.model.VoiceImpl.prototype.getPaintPosition = function(iIndex) {
	return this.beat.measure.ts.get(iIndex);
}
net.alphatab.tablature.model.VoiceImpl.prototype.isHiddenSilence = null;
net.alphatab.tablature.model.VoiceImpl.prototype.isJoinedGreaterThanQuarter = null;
net.alphatab.tablature.model.VoiceImpl.prototype.join1 = null;
net.alphatab.tablature.model.VoiceImpl.prototype.join2 = null;
net.alphatab.tablature.model.VoiceImpl.prototype.joinedType = null;
net.alphatab.tablature.model.VoiceImpl.prototype.maxNote = null;
net.alphatab.tablature.model.VoiceImpl.prototype.maxString = null;
net.alphatab.tablature.model.VoiceImpl.prototype.maxY = null;
net.alphatab.tablature.model.VoiceImpl.prototype.measureImpl = function() {
	return this.beat.measure;
}
net.alphatab.tablature.model.VoiceImpl.prototype.minNote = null;
net.alphatab.tablature.model.VoiceImpl.prototype.minString = null;
net.alphatab.tablature.model.VoiceImpl.prototype.minY = null;
net.alphatab.tablature.model.VoiceImpl.prototype.nextBeat = null;
net.alphatab.tablature.model.VoiceImpl.prototype.paint = function(layout,context,x,y) {
	if(!this.isEmpty) {
		if(this.isRestVoice() && !this.isHiddenSilence) {
			this.paintSilence(layout,context,x,y);
		}
		else {
			{
				var _g = 0, _g1 = this.notes;
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var noteImpl = note;
					noteImpl.paint(layout,context,x,y);
				}
			}
			this.paintBeat(layout,context,x,y);
		}
	}
}
net.alphatab.tablature.model.VoiceImpl.prototype.paintBeat = function(layout,context,x,y) {
	if(!this.isRestVoice()) {
		var spacing = this.beat.spacing();
		this.paintScoreBeat(layout,context,x,y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines),spacing);
	}
}
net.alphatab.tablature.model.VoiceImpl.prototype.paintDot = function(layout,layer,x,y,scale) {
	var dotSize = 3.0 * scale;
	layer.addCircle(Math.round(x - (dotSize / 2.0)),Math.round(y - (dotSize / 2.0)),dotSize);
	if(this.duration.isDoubleDotted) {
		layer.addCircle(Math.round((x + (dotSize + 2.0)) - (dotSize / 2.0)),Math.round(y - (dotSize / 2.0)),dotSize);
	}
}
net.alphatab.tablature.model.VoiceImpl.prototype.paintScoreBeat = function(layout,context,x,y,spacing) {
	var vX = x + 4 * layout.scale;
	var fill = (this.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	var draw = (this.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1):context.get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2));
	this.paintTriplet(layout,context,x,(y - this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines)));
	if(this.duration.value >= 2) {
		var scale = layout.scale;
		var lineSpacing = layout.scoreLineSpacing;
		var direction = this.beatGroup.direction;
		var key = this.beat.measure.keySignature();
		var clef = net.alphatab.model.MeasureClefConverter.toInt(this.beat.measure.clef);
		var xMove = (direction == net.alphatab.model.VoiceDirection.Up?net.alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).width:0);
		var yMove = (direction == net.alphatab.model.VoiceDirection.Up?Math.round(layout.scoreLineSpacing / 3) + 1:Math.round(layout.scoreLineSpacing / 3) * 2);
		var vY1 = y + (((direction == net.alphatab.model.VoiceDirection.Down)?this.maxNote.scorePosY:this.minNote.scorePosY));
		var vY2 = y + this.beatGroup.getY2(layout,this.posX() + spacing,key,clef);
		draw.startFigure();
		draw.moveTo(vX + xMove,vY1 + yMove);
		draw.lineTo(vX + xMove,vY2);
		if(this.duration.value >= 8) {
			var index = this.duration.index() - 3;
			if(index >= 0) {
				var dir = (direction == net.alphatab.model.VoiceDirection.Down?1:-1);
				var bJoinedGreaterThanQuarter = this.isJoinedGreaterThanQuarter;
				if((this.joinedType == net.alphatab.tablature.model.JoinedType.NoneLeft || this.joinedType == net.alphatab.tablature.model.JoinedType.NoneRight) && !bJoinedGreaterThanQuarter) {
					var hY = ((y + this.beatGroup.getY2(layout,this.posX() + spacing,key,clef)) - ((lineSpacing * 2) * dir));
					net.alphatab.tablature.drawing.NotePainter.paintFooter(fill,vX,vY2,this.duration.value,dir,layout);
				}
				else {
					var startX;
					var endX;
					var startXforCalculation;
					var endXforCalculation;
					if(this.joinedType == net.alphatab.tablature.model.JoinedType.NoneRight) {
						startX = Math.round(this.beat.getRealPosX(layout) + xMove);
						endX = Math.round((this.beat.getRealPosX(layout) + (6 * scale)) + xMove);
						startXforCalculation = this.posX() + spacing;
						endXforCalculation = Math.floor((this.posX() + spacing) + (6 * scale));
					}
					else if(this.joinedType == net.alphatab.tablature.model.JoinedType.NoneLeft) {
						startX = Math.round((this.beat.getRealPosX(layout) - (6 * scale)) + xMove);
						endX = Math.round(this.beat.getRealPosX(layout) + xMove);
						startXforCalculation = Math.floor((this.posX() + spacing) - (6 * scale));
						endXforCalculation = this.posX() + spacing;
					}
					else {
						startX = Math.round(this.join1.beat.getRealPosX(layout) + xMove);
						endX = Math.round((this.join2.beat.getRealPosX(layout) + xMove) + (scale));
						startXforCalculation = this.join1.posX() + this.join1.beat.spacing();
						endXforCalculation = this.join2.posX() + this.join2.beat.spacing();
					}
					var hY1 = y + this.beatGroup.getY2(layout,startXforCalculation,key,clef);
					var hY2 = y + this.beatGroup.getY2(layout,endXforCalculation,key,clef);
					var x1 = startX;
					var x2 = endX;
					net.alphatab.tablature.drawing.NotePainter.paintBar(fill,x1,hY1,x2,hY2,index + 1,dir,scale);
				}
			}
		}
	}
}
net.alphatab.tablature.model.VoiceImpl.prototype.paintSilence = function(layout,context,x,y) {
	var realX = x + 3 * layout.scale;
	var realY = y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
	var lineSpacing = layout.scoreLineSpacing;
	var scale = lineSpacing;
	var fill = (this.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	switch(this.duration.value) {
	case 1:{
		net.alphatab.tablature.drawing.SilencePainter.paintWhole(fill,realX,realY,layout);
	}break;
	case 2:{
		net.alphatab.tablature.drawing.SilencePainter.paintHalf(fill,realX,realY,layout);
	}break;
	case 4:{
		net.alphatab.tablature.drawing.SilencePainter.paintQuarter(fill,realX,realY,layout);
	}break;
	case 8:{
		net.alphatab.tablature.drawing.SilencePainter.paintEighth(fill,realX,realY,layout);
	}break;
	case 16:{
		net.alphatab.tablature.drawing.SilencePainter.paintSixteenth(fill,realX,realY,layout);
	}break;
	case 32:{
		net.alphatab.tablature.drawing.SilencePainter.paintThirtySecond(fill,realX,realY,layout);
	}break;
	case 64:{
		net.alphatab.tablature.drawing.SilencePainter.paintSixtyFourth(fill,realX,realY,layout);
	}break;
	}
	if(this.duration.isDotted || this.duration.isDoubleDotted) {
		fill.moveTo(realX + 10,realY + 1);
		fill.circleTo(1);
		if(this.duration.isDoubleDotted) {
			fill.moveTo((realX + 13),realY + 1);
			fill.circleTo(1);
		}
	}
	this.paintTriplet(layout,context,x,y);
}
net.alphatab.tablature.model.VoiceImpl.prototype.paintTriplet = function(layout,context,x,y) {
	var realX = x + 3 * layout.scale;
	var fill = (this.index == 0?context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	if(!this.duration.tuplet.equals(new net.alphatab.model.Tuplet())) {
		if(this.tripletGroup.isFull() && (this.previousBeat == null || this.previousBeat.tripletGroup == null || this.previousBeat.tripletGroup != this.tripletGroup)) {
			this.tripletGroup.paint(layout,context,x,y);
		}
		else if(!this.tripletGroup.isFull()) {
			fill.addString(Std.string(this.duration.tuplet.enters),net.alphatab.tablature.drawing.DrawingResources.defaultFont,Math.round(realX),Math.round(y + this.getPaintPosition(net.alphatab.tablature.TrackSpacingPositions.Tupleto)));
		}
	}
}
net.alphatab.tablature.model.VoiceImpl.prototype.posX = function() {
	return this.beat.posX;
}
net.alphatab.tablature.model.VoiceImpl.prototype.previousBeat = null;
net.alphatab.tablature.model.VoiceImpl.prototype.reset = function() {
	this.maxNote = null;
	this.minNote = null;
	this._hiddenSilence = false;
	this._usedStrings = new Array();
	{
		var _g1 = 0, _g = this.beat.measure.track.stringCount();
		while(_g1 < _g) {
			var i = _g1++;
			this._usedStrings.push(false);
		}
	}
	this.maxString = 1;
	this.minString = this.beat.measure.track.stringCount();
}
net.alphatab.tablature.model.VoiceImpl.prototype.tripletGroup = null;
net.alphatab.tablature.model.VoiceImpl.prototype.update = function(layout) {
	this.minY = 0;
	this.maxY = 0;
	if(this.isRestVoice()) this.updateSilenceSpacing(layout);
	else this.updateNoteVoice(layout);
	if(this.duration.tuplet != null && !this.duration.tuplet.equals(new net.alphatab.model.Tuplet())) {
		if(this.previousBeat == null || this.previousBeat.tripletGroup == null || !this.previousBeat.tripletGroup.check(this)) {
			this.tripletGroup = new net.alphatab.tablature.model.TripletGroup(this.index);
			this.tripletGroup.check(this);
		}
		else {
			this.tripletGroup = this.previousBeat.tripletGroup;
		}
	}
}
net.alphatab.tablature.model.VoiceImpl.prototype.updateNoteVoice = function(layout) {
	this.joinedType = net.alphatab.tablature.model.JoinedType.NoneRight;
	this.isJoinedGreaterThanQuarter = false;
	this.join1 = this;
	this.join2 = this;
	var noteJoined = false;
	var withPrev = false;
	if(this.previousBeat != null && !this.previousBeat.isRestVoice()) {
		if(this.beat.measure.canJoin(layout.songManager(),this,this.previousBeat)) {
			withPrev = true;
			if(this.previousBeat.duration.value >= this.duration.value) {
				this.join1 = this.previousBeat;
				this.join2 = this;
				this.joinedType = net.alphatab.tablature.model.JoinedType.Left;
				noteJoined = true;
			}
			if(this.previousBeat.duration.value > 4) {
				this.isJoinedGreaterThanQuarter = true;
			}
		}
	}
	if(this.nextBeat != null && !this.nextBeat.isRestVoice()) {
		if(this.beat.measure.canJoin(layout.songManager(),this,this.nextBeat)) {
			if(this.nextBeat.duration.value >= this.duration.value) {
				this.join2 = this.nextBeat;
				if(this.previousBeat == null || this.previousBeat.isRestVoice() || this.previousBeat.duration.value < this.duration.value) this.join1 = this;
				noteJoined = true;
				this.joinedType = net.alphatab.tablature.model.JoinedType.Right;
			}
			if(this.nextBeat.duration.value > 4) this.isJoinedGreaterThanQuarter = true;
		}
	}
	if(!noteJoined && withPrev) this.joinedType = net.alphatab.tablature.model.JoinedType.NoneLeft;
	this.minY = 0;
	this.maxY = this.beat.measureImpl().trackImpl().tabHeight;
	if(this.beatGroup.direction == net.alphatab.model.VoiceDirection.Down) {
		this.maxY += Math.floor((layout.stringSpacing / 2) * 5) + 1;
	}
	else {
		this.minY -= Math.floor((layout.stringSpacing / 2) * 5) + 1;
	}
}
net.alphatab.tablature.model.VoiceImpl.prototype.updateSilenceSpacing = function(layout) {
	this._silenceY = 0;
	this._silenceHeight = 0;
	if(!this._hiddenSilence) {
		var lineSpacing = layout.scoreLineSpacing;
		var LineCount = 5;
		var scale = (lineSpacing / 9.0);
		var duration = this.duration.value;
		if(duration == 1) {
			this._silenceHeight = lineSpacing;
			this._silenceY = (lineSpacing);
		}
		else if(duration == 2) {
			this._silenceHeight = lineSpacing;
			this._silenceY = (lineSpacing * 2) - this._silenceHeight;
		}
		else if(duration == 4) {
			this._silenceHeight = (scale * 16);
			this._silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (this._silenceHeight / 2);
		}
		else if(duration == 8) {
			this._silenceHeight = (scale * 12);
			this._silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (this._silenceHeight / 2);
		}
		else if(duration == 16) {
			this._silenceHeight = (scale * 16);
			this._silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (this._silenceHeight / 2);
		}
		else if(duration == 32) {
			this._silenceHeight = (scale * 24);
			this._silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (this._silenceHeight / 2);
		}
		else if(duration == 64) {
			this._silenceHeight = (scale * 28);
			this._silenceY = ((lineSpacing * (LineCount - 1)) / 2) - (this._silenceHeight / 2);
		}
		{
			var _g1 = 0, _g = this.beat.voices.length;
			while(_g1 < _g) {
				var v = _g1++;
				if(v != this.index) {
					var voice = this.beat.getVoiceImpl(v);
					if(!voice.isEmpty) {
						if(voice.isRestVoice()) {
							if(!voice.isHiddenSilence) {
								var maxSilenceHeight = (lineSpacing * 3);
								var firstPosition = (this._silenceY - (maxSilenceHeight / this.beat.voices.length));
								this._silenceY = (firstPosition + (maxSilenceHeight * this.index));
							}
						}
					}
				}
			}
		}
		this.minY = this._silenceY;
		this.maxY = this._silenceY + this._silenceHeight;
	}
}
net.alphatab.tablature.model.VoiceImpl.prototype.usedStrings = function() {
	if(this._usedStrings == null) {
		this._usedStrings = new Array();
		{
			var _g1 = 0, _g = this.beat.measure.track.stringCount();
			while(_g1 < _g) {
				var i = _g1++;
				this._usedStrings.push(false);
			}
		}
	}
	return this._usedStrings;
}
net.alphatab.tablature.model.VoiceImpl.prototype.width = null;
net.alphatab.tablature.model.VoiceImpl.prototype.__class__ = net.alphatab.tablature.model.VoiceImpl;
net.alphatab.tablature.drawing.SvgPainter = function(layer,svg,x,y,xScale,yScale) { if( layer === $_ ) return; {
	this._layer = layer;
	this._svg = svg;
	this._x = x;
	this._y = y;
	this._xScale = xScale * 0.98;
	this._yScale = yScale * 0.98;
	this._currentPosition = new net.alphatab.model.PointF(x,y);
	this._token = svg.split(" ");
	this._currentIndex = 0;
}}
net.alphatab.tablature.drawing.SvgPainter.__name__ = ["net","alphatab","tablature","drawing","SvgPainter"];
net.alphatab.tablature.drawing.SvgPainter.prototype._currentIndex = null;
net.alphatab.tablature.drawing.SvgPainter.prototype._currentPosition = null;
net.alphatab.tablature.drawing.SvgPainter.prototype._layer = null;
net.alphatab.tablature.drawing.SvgPainter.prototype._svg = null;
net.alphatab.tablature.drawing.SvgPainter.prototype._token = null;
net.alphatab.tablature.drawing.SvgPainter.prototype._x = null;
net.alphatab.tablature.drawing.SvgPainter.prototype._xScale = null;
net.alphatab.tablature.drawing.SvgPainter.prototype._y = null;
net.alphatab.tablature.drawing.SvgPainter.prototype._yScale = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.getNumber = function() {
	return Std.parseFloat(this._token[this._currentIndex++]);
}
net.alphatab.tablature.drawing.SvgPainter.prototype.getString = function() {
	return this._token[this._currentIndex++];
}
net.alphatab.tablature.drawing.SvgPainter.prototype.isNextCommand = function() {
	var command = this.peekString();
	return command == "m" || command == "M" || command == "c" || command == "C" || command == "q" || command == "Q" || command == "l" || command == "L" || command == "z" || command == "Z";
}
net.alphatab.tablature.drawing.SvgPainter.prototype.paint = function() {
	this._layer.startFigure();
	while(this._currentIndex < this._token.length) {
		this.parseCommand();
	}
}
net.alphatab.tablature.drawing.SvgPainter.prototype.parseCommand = function() {
	var command = this.getString();
	switch(command) {
	case "M":{
		this._currentPosition.x = (this._x + this.getNumber() * this._xScale);
		this._currentPosition.y = (this._y + this.getNumber() * this._yScale);
		this._layer.moveTo(this._currentPosition.x,this._currentPosition.y);
	}break;
	case "m":{
		this._currentPosition.x += (this.getNumber() * this._xScale);
		this._currentPosition.y += (this.getNumber() * this._yScale);
		this._layer.moveTo(this._currentPosition.x,this._currentPosition.y);
	}break;
	case "z":{
		null;
	}break;
	case "Z":{
		this._layer.closeFigure();
	}break;
	case "L":{
		var isNextNumber = true;
		do {
			this._currentPosition.x = (this._x + this.getNumber() * this._xScale);
			this._currentPosition.y = (this._y + this.getNumber() * this._yScale);
			this._layer.lineTo(this._currentPosition.x,this._currentPosition.y);
			isNextNumber = !this.isNextCommand();
		} while(isNextNumber);
	}break;
	case "l":{
		var isNextNumber = true;
		do {
			this._currentPosition.x += (this.getNumber() * this._xScale);
			this._currentPosition.y += (this.getNumber() * this._yScale);
			this._layer.lineTo(this._currentPosition.x,this._currentPosition.y);
			isNextNumber = !this.isNextCommand();
		} while(isNextNumber);
	}break;
	case "C":{
		var isNextNumber = true;
		do {
			var x1 = (this._x + this.getNumber() * this._xScale);
			var y1 = (this._y + this.getNumber() * this._yScale);
			var x2 = (this._x + this.getNumber() * this._xScale);
			var y2 = (this._y + this.getNumber() * this._yScale);
			var x3 = (this._x + this.getNumber() * this._xScale);
			var y3 = (this._y + this.getNumber() * this._yScale);
			this._currentPosition.x = (x3);
			this._currentPosition.y = (y3);
			this._layer.bezierTo(x1,y1,x2,y2,x3,y3);
			isNextNumber = !this.isNextCommand();
		} while(isNextNumber);
	}break;
	case "c":{
		var isNextNumber = true;
		do {
			var x1 = (this._currentPosition.x + this.getNumber() * this._xScale);
			var y1 = (this._currentPosition.y + this.getNumber() * this._yScale);
			var x2 = (this._currentPosition.x + this.getNumber() * this._xScale);
			var y2 = (this._currentPosition.y + this.getNumber() * this._yScale);
			var x3 = (this._currentPosition.x + this.getNumber() * this._xScale);
			var y3 = (this._currentPosition.y + this.getNumber() * this._yScale);
			this._currentPosition.x = x3;
			this._currentPosition.y = y3;
			this._layer.bezierTo(x1,y1,x2,y2,x3,y3);
			isNextNumber = !this.isNextCommand();
		} while(isNextNumber && this._currentIndex < this._token.length);
	}break;
	case "Q":{
		var isNextNumber = true;
		do {
			var x1 = (this._x + this.getNumber() * this._xScale);
			var y1 = (this._y + this.getNumber() * this._yScale);
			var x2 = (this._x + this.getNumber() * this._xScale);
			var y2 = (this._y + this.getNumber() * this._yScale);
			this._currentPosition.x = x2;
			this._currentPosition.y = y2;
			this._layer.quadraticCurveTo(x1,y1,x2,y2);
			isNextNumber = !this.isNextCommand();
		} while(isNextNumber);
	}break;
	case "q":{
		var isNextNumber = true;
		do {
			var x1 = (this._currentPosition.x + this.getNumber() * this._xScale);
			var y1 = (this._currentPosition.y + this.getNumber() * this._yScale);
			var x2 = (this._currentPosition.x + this.getNumber() * this._xScale);
			var y2 = (this._currentPosition.y + this.getNumber() * this._yScale);
			this._currentPosition.x = x2;
			this._currentPosition.y = y2;
			this._layer.quadraticCurveTo(x1,y1,x2,y2);
			isNextNumber = !this.isNextCommand();
		} while(isNextNumber && this._currentIndex < this._token.length);
	}break;
	}
}
net.alphatab.tablature.drawing.SvgPainter.prototype.peekNumber = function() {
	return Std.parseFloat(this._token[this._currentIndex]);
}
net.alphatab.tablature.drawing.SvgPainter.prototype.peekString = function() {
	return this._token[this._currentIndex];
}
net.alphatab.tablature.drawing.SvgPainter.prototype.__class__ = net.alphatab.tablature.drawing.SvgPainter;
net.alphatab.model.effects.TrillEffect = function(factory) { if( factory === $_ ) return; {
	this.fret = 0;
	this.duration = factory.newDuration();
}}
net.alphatab.model.effects.TrillEffect.__name__ = ["net","alphatab","model","effects","TrillEffect"];
net.alphatab.model.effects.TrillEffect.prototype.clone = function(factory) {
	var effect = factory.newTrillEffect();
	effect.fret = this.fret;
	effect.duration.value = this.duration.value;
	effect.duration.isDotted = this.duration.isDotted;
	effect.duration.isDoubleDotted = this.duration.isDoubleDotted;
	effect.duration.tuplet.enters = this.duration.tuplet.enters;
	effect.duration.tuplet.times = this.duration.tuplet.times;
	return effect;
}
net.alphatab.model.effects.TrillEffect.prototype.duration = null;
net.alphatab.model.effects.TrillEffect.prototype.fret = null;
net.alphatab.model.effects.TrillEffect.prototype.__class__ = net.alphatab.model.effects.TrillEffect;
net.alphatab.tablature.model.JoinedTypeConverter = function() { }
net.alphatab.tablature.model.JoinedTypeConverter.__name__ = ["net","alphatab","tablature","model","JoinedTypeConverter"];
net.alphatab.tablature.model.JoinedTypeConverter.toInt = function(t) {
	switch(t) {
	case net.alphatab.tablature.model.JoinedType.NoneLeft:{
		return 1;
	}break;
	case net.alphatab.tablature.model.JoinedType.NoneRight:{
		return 2;
	}break;
	case net.alphatab.tablature.model.JoinedType.Left:{
		return 3;
	}break;
	case net.alphatab.tablature.model.JoinedType.Right:{
		return 4;
	}break;
	}
}
net.alphatab.tablature.model.JoinedTypeConverter.prototype.__class__ = net.alphatab.tablature.model.JoinedTypeConverter;
Std = function() { }
Std.__name__ = ["Std"];
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	if(x < 0) return Math.ceil(x);
	return Math.floor(x);
}
Std.parseInt = function(x) {
	var v = parseInt(x);
	if(Math.isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
Std.prototype.__class__ = Std;
net.alphatab.model.Size = function(width,height) { if( width === $_ ) return; {
	this.width = width;
	this.height = height;
}}
net.alphatab.model.Size.__name__ = ["net","alphatab","model","Size"];
net.alphatab.model.Size.prototype.height = null;
net.alphatab.model.Size.prototype.width = null;
net.alphatab.model.Size.prototype.__class__ = net.alphatab.model.Size;
net.alphatab.model.effects.HarmonicEffect = function(p) { if( p === $_ ) return; {
	null;
}}
net.alphatab.model.effects.HarmonicEffect.__name__ = ["net","alphatab","model","effects","HarmonicEffect"];
net.alphatab.model.effects.HarmonicEffect.prototype.clone = function(factory) {
	var effect = factory.newHarmonicEffect();
	effect.type = this.type;
	effect.data = this.data;
	return effect;
}
net.alphatab.model.effects.HarmonicEffect.prototype.data = null;
net.alphatab.model.effects.HarmonicEffect.prototype.type = null;
net.alphatab.model.effects.HarmonicEffect.prototype.__class__ = net.alphatab.model.effects.HarmonicEffect;
net.alphatab.model.Point = function(x,y) { if( x === $_ ) return; {
	this.x = x;
	this.y = y;
}}
net.alphatab.model.Point.__name__ = ["net","alphatab","model","Point"];
net.alphatab.model.Point.prototype.x = null;
net.alphatab.model.Point.prototype.y = null;
net.alphatab.model.Point.prototype.__class__ = net.alphatab.model.Point;
net.alphatab.model.effects.BendTypesConverter = function() { }
net.alphatab.model.effects.BendTypesConverter.__name__ = ["net","alphatab","model","effects","BendTypesConverter"];
net.alphatab.model.effects.BendTypesConverter.fromInt = function(i) {
	switch(i) {
	case 0:{
		return net.alphatab.model.effects.BendTypes.None;
	}break;
	case 1:{
		return net.alphatab.model.effects.BendTypes.Bend;
	}break;
	case 2:{
		return net.alphatab.model.effects.BendTypes.BendRelease;
	}break;
	case 3:{
		return net.alphatab.model.effects.BendTypes.BendReleaseBend;
	}break;
	case 4:{
		return net.alphatab.model.effects.BendTypes.Prebend;
	}break;
	case 5:{
		return net.alphatab.model.effects.BendTypes.PrebendRelease;
	}break;
	case 6:{
		return net.alphatab.model.effects.BendTypes.Dip;
	}break;
	case 7:{
		return net.alphatab.model.effects.BendTypes.Dive;
	}break;
	case 8:{
		return net.alphatab.model.effects.BendTypes.ReleaseUp;
	}break;
	case 9:{
		return net.alphatab.model.effects.BendTypes.InvertedDip;
	}break;
	case 10:{
		return net.alphatab.model.effects.BendTypes.Return;
	}break;
	case 11:{
		return net.alphatab.model.effects.BendTypes.ReleaseDown;
	}break;
	default:{
		return net.alphatab.model.effects.BendTypes.None;
	}break;
	}
}
net.alphatab.model.effects.BendTypesConverter.prototype.__class__ = net.alphatab.model.effects.BendTypesConverter;
net.alphatab.model.BeatEffect = function(factory) { if( factory === $_ ) return; {
	this.tapping = false;
	this.slapping = false;
	this.popping = false;
	this.fadeIn = false;
	this.stroke = factory.newStroke();
}}
net.alphatab.model.BeatEffect.__name__ = ["net","alphatab","model","BeatEffect"];
net.alphatab.model.BeatEffect.prototype.chord = null;
net.alphatab.model.BeatEffect.prototype.fadeIn = null;
net.alphatab.model.BeatEffect.prototype.hasPickStroke = null;
net.alphatab.model.BeatEffect.prototype.hasRasgueado = null;
net.alphatab.model.BeatEffect.prototype.isTremoloBar = function() {
	return this.tremoloBar != null;
}
net.alphatab.model.BeatEffect.prototype.mixTableChange = null;
net.alphatab.model.BeatEffect.prototype.pickStroke = null;
net.alphatab.model.BeatEffect.prototype.popping = null;
net.alphatab.model.BeatEffect.prototype.slapping = null;
net.alphatab.model.BeatEffect.prototype.stroke = null;
net.alphatab.model.BeatEffect.prototype.tapping = null;
net.alphatab.model.BeatEffect.prototype.tremoloBar = null;
net.alphatab.model.BeatEffect.prototype.vibrato = null;
net.alphatab.model.BeatEffect.prototype.__class__ = net.alphatab.model.BeatEffect;
net.alphatab.model.NoteEffect = function(p) { if( p === $_ ) return; {
	this.bend = null;
	this.harmonic = null;
	this.grace = null;
	this.trill = null;
	this.tremoloPicking = null;
	this.vibrato = false;
	this.deadNote = false;
	this.slide = false;
	this.hammer = false;
	this.ghostNote = false;
	this.accentuatedNote = false;
	this.heavyAccentuatedNote = false;
	this.palmMute = false;
	this.staccato = false;
	this.letRing = false;
	this.isFingering = false;
}}
net.alphatab.model.NoteEffect.__name__ = ["net","alphatab","model","NoteEffect"];
net.alphatab.model.NoteEffect.prototype.accentuatedNote = null;
net.alphatab.model.NoteEffect.prototype.bend = null;
net.alphatab.model.NoteEffect.prototype.clone = function(factory) {
	var effect = factory.newNoteEffect();
	effect.vibrato = this.vibrato;
	effect.deadNote = this.deadNote;
	effect.slide = this.slide;
	effect.slideType = this.slideType;
	effect.hammer = this.hammer;
	effect.ghostNote = this.ghostNote;
	effect.accentuatedNote = this.accentuatedNote;
	effect.heavyAccentuatedNote = this.heavyAccentuatedNote;
	effect.palmMute = this.palmMute;
	effect.staccato = this.staccato;
	effect.letRing = this.letRing;
	effect.isFingering = this.isFingering;
	effect.leftHandFinger = this.leftHandFinger;
	effect.rightHandFinger = this.rightHandFinger;
	effect.bend = (this.isBend()?this.bend.clone(factory):null);
	effect.harmonic = (this.isHarmonic()?this.harmonic.clone(factory):null);
	effect.grace = (this.isGrace()?this.grace.clone(factory):null);
	effect.trill = (this.isTrill()?this.trill.clone(factory):null);
	effect.tremoloPicking = (this.isTremoloPicking()?this.tremoloPicking.clone(factory):null);
	return effect;
}
net.alphatab.model.NoteEffect.prototype.deadNote = null;
net.alphatab.model.NoteEffect.prototype.ghostNote = null;
net.alphatab.model.NoteEffect.prototype.grace = null;
net.alphatab.model.NoteEffect.prototype.hammer = null;
net.alphatab.model.NoteEffect.prototype.harmonic = null;
net.alphatab.model.NoteEffect.prototype.heavyAccentuatedNote = null;
net.alphatab.model.NoteEffect.prototype.isBend = function() {
	return this.bend != null && this.bend.points.length != 0;
}
net.alphatab.model.NoteEffect.prototype.isFingering = null;
net.alphatab.model.NoteEffect.prototype.isGrace = function() {
	return this.grace != null;
}
net.alphatab.model.NoteEffect.prototype.isHarmonic = function() {
	return this.harmonic != null;
}
net.alphatab.model.NoteEffect.prototype.isTremoloPicking = function() {
	return this.tremoloPicking != null;
}
net.alphatab.model.NoteEffect.prototype.isTrill = function() {
	return this.trill != null;
}
net.alphatab.model.NoteEffect.prototype.leftHandFinger = null;
net.alphatab.model.NoteEffect.prototype.letRing = null;
net.alphatab.model.NoteEffect.prototype.palmMute = null;
net.alphatab.model.NoteEffect.prototype.rightHandFinger = null;
net.alphatab.model.NoteEffect.prototype.slide = null;
net.alphatab.model.NoteEffect.prototype.slideType = null;
net.alphatab.model.NoteEffect.prototype.staccato = null;
net.alphatab.model.NoteEffect.prototype.tremoloPicking = null;
net.alphatab.model.NoteEffect.prototype.trill = null;
net.alphatab.model.NoteEffect.prototype.vibrato = null;
net.alphatab.model.NoteEffect.prototype.__class__ = net.alphatab.model.NoteEffect;
net.alphatab.model.VoiceDirection = { __ename__ : ["net","alphatab","model","VoiceDirection"], __constructs__ : ["None","Up","Down"] }
net.alphatab.model.VoiceDirection.Down = ["Down",2];
net.alphatab.model.VoiceDirection.Down.toString = $estr;
net.alphatab.model.VoiceDirection.Down.__enum__ = net.alphatab.model.VoiceDirection;
net.alphatab.model.VoiceDirection.None = ["None",0];
net.alphatab.model.VoiceDirection.None.toString = $estr;
net.alphatab.model.VoiceDirection.None.__enum__ = net.alphatab.model.VoiceDirection;
net.alphatab.model.VoiceDirection.Up = ["Up",1];
net.alphatab.model.VoiceDirection.Up.toString = $estr;
net.alphatab.model.VoiceDirection.Up.__enum__ = net.alphatab.model.VoiceDirection;
net.alphatab.tablature.drawing.DrawingResources = function() { }
net.alphatab.tablature.drawing.DrawingResources.__name__ = ["net","alphatab","tablature","drawing","DrawingResources"];
net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight = null;
net.alphatab.tablature.drawing.DrawingResources.defaultFont = null;
net.alphatab.tablature.drawing.DrawingResources.chordFont = null;
net.alphatab.tablature.drawing.DrawingResources.timeSignatureFont = null;
net.alphatab.tablature.drawing.DrawingResources.clefFont = null;
net.alphatab.tablature.drawing.DrawingResources.musicFont = null;
net.alphatab.tablature.drawing.DrawingResources.tempoFont = null;
net.alphatab.tablature.drawing.DrawingResources.graceFontHeight = null;
net.alphatab.tablature.drawing.DrawingResources.graceFont = null;
net.alphatab.tablature.drawing.DrawingResources.noteFont = null;
net.alphatab.tablature.drawing.DrawingResources.noteFontHeight = null;
net.alphatab.tablature.drawing.DrawingResources.effectFont = null;
net.alphatab.tablature.drawing.DrawingResources.effectFontHeight = null;
net.alphatab.tablature.drawing.DrawingResources.titleFont = null;
net.alphatab.tablature.drawing.DrawingResources.subtitleFont = null;
net.alphatab.tablature.drawing.DrawingResources.wordsFont = null;
net.alphatab.tablature.drawing.DrawingResources.copyrightFont = null;
net.alphatab.tablature.drawing.DrawingResources.init = function(scale) {
	net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight = Math.round(9 * scale);
	net.alphatab.tablature.drawing.DrawingResources.defaultFont = Std.string(net.alphatab.tablature.drawing.DrawingResources.defaultFontHeight) + "px 'Arial'";
	net.alphatab.tablature.drawing.DrawingResources.chordFont = Std.string(9 * scale) + "px 'Arial'";
	net.alphatab.tablature.drawing.DrawingResources.timeSignatureFont = Std.string(20 * scale) + "px 'Arial'";
	net.alphatab.tablature.drawing.DrawingResources.clefFont = Std.string(13 * scale) + "px 'Arial'";
	net.alphatab.tablature.drawing.DrawingResources.musicFont = Std.string(13 * scale) + "px 'Arial'";
	net.alphatab.tablature.drawing.DrawingResources.tempoFont = Std.string(11 * scale) + "px 'Arial'";
	net.alphatab.tablature.drawing.DrawingResources.graceFontHeight = Math.round(9 * scale);
	net.alphatab.tablature.drawing.DrawingResources.graceFont = Std.string(net.alphatab.tablature.drawing.DrawingResources.graceFontHeight) + "px 'Arial'";
	net.alphatab.tablature.drawing.DrawingResources.noteFontHeight = Math.round(11 * scale);
	net.alphatab.tablature.drawing.DrawingResources.noteFont = Std.string(net.alphatab.tablature.drawing.DrawingResources.noteFontHeight) + "px 'Arial'";
	net.alphatab.tablature.drawing.DrawingResources.effectFontHeight = Math.round(11 * scale);
	net.alphatab.tablature.drawing.DrawingResources.effectFont = ("italic " + Std.string(net.alphatab.tablature.drawing.DrawingResources.effectFontHeight)) + "px 'Times New Roman'";
	net.alphatab.tablature.drawing.DrawingResources.titleFont = Std.string(30 * scale) + "px 'Times New Roman'";
	net.alphatab.tablature.drawing.DrawingResources.subtitleFont = Std.string(19 * scale) + "px 'Times New Roman'";
	net.alphatab.tablature.drawing.DrawingResources.wordsFont = Std.string(13 * scale) + "px 'Times New Roman'";
	net.alphatab.tablature.drawing.DrawingResources.copyrightFont = ("bold " + Std.string(11 * scale)) + "px 'Arial'";
}
net.alphatab.tablature.drawing.DrawingResources.getScoreNoteSize = function(layout,full) {
	var scale = ((full?layout.scoreLineSpacing + 1:layout.scoreLineSpacing)) - 2;
	return new net.alphatab.model.Size(Math.round(scale * 1.3),Math.round(scale));
}
net.alphatab.tablature.drawing.DrawingResources.prototype.__class__ = net.alphatab.tablature.drawing.DrawingResources;
net.alphatab.model.Song = function(p) { if( p === $_ ) return; {
	this.measureHeaders = new Array();
	this.tracks = new Array();
	this.title = "";
	this.subtitle = "";
	this.artist = "";
	this.album = "";
	this.words = "";
	this.music = "";
	this.copyright = "";
	this.tab = "";
	this.instructions = "";
	this.notice = "";
}}
net.alphatab.model.Song.__name__ = ["net","alphatab","model","Song"];
net.alphatab.model.Song.prototype.addMeasureHeader = function(header) {
	header.song = this;
	this.measureHeaders.push(header);
}
net.alphatab.model.Song.prototype.addTrack = function(track) {
	track.song = this;
	this.tracks.push(track);
}
net.alphatab.model.Song.prototype.album = null;
net.alphatab.model.Song.prototype.artist = null;
net.alphatab.model.Song.prototype.copyright = null;
net.alphatab.model.Song.prototype.hideTempo = null;
net.alphatab.model.Song.prototype.instructions = null;
net.alphatab.model.Song.prototype.key = null;
net.alphatab.model.Song.prototype.lyrics = null;
net.alphatab.model.Song.prototype.measureHeaders = null;
net.alphatab.model.Song.prototype.music = null;
net.alphatab.model.Song.prototype.notice = null;
net.alphatab.model.Song.prototype.octave = null;
net.alphatab.model.Song.prototype.pageSetup = null;
net.alphatab.model.Song.prototype.subtitle = null;
net.alphatab.model.Song.prototype.tab = null;
net.alphatab.model.Song.prototype.tempo = null;
net.alphatab.model.Song.prototype.tempoName = null;
net.alphatab.model.Song.prototype.title = null;
net.alphatab.model.Song.prototype.tracks = null;
net.alphatab.model.Song.prototype.words = null;
net.alphatab.model.Song.prototype.__class__ = net.alphatab.model.Song;
net.alphatab.model.TripletFeel = { __ename__ : ["net","alphatab","model","TripletFeel"], __constructs__ : ["None","Eighth","Sixteenth"] }
net.alphatab.model.TripletFeel.Eighth = ["Eighth",1];
net.alphatab.model.TripletFeel.Eighth.toString = $estr;
net.alphatab.model.TripletFeel.Eighth.__enum__ = net.alphatab.model.TripletFeel;
net.alphatab.model.TripletFeel.None = ["None",0];
net.alphatab.model.TripletFeel.None.toString = $estr;
net.alphatab.model.TripletFeel.None.__enum__ = net.alphatab.model.TripletFeel;
net.alphatab.model.TripletFeel.Sixteenth = ["Sixteenth",2];
net.alphatab.model.TripletFeel.Sixteenth.toString = $estr;
net.alphatab.model.TripletFeel.Sixteenth.__enum__ = net.alphatab.model.TripletFeel;
haxe.remoting.Connection = function() { }
haxe.remoting.Connection.__name__ = ["haxe","remoting","Connection"];
haxe.remoting.Connection.prototype.call = null;
haxe.remoting.Connection.prototype.resolve = null;
haxe.remoting.Connection.prototype.__class__ = haxe.remoting.Connection;
haxe.Unserializer = function(buf) { if( buf === $_ ) return; {
	this.buf = buf;
	this.length = buf.length;
	this.pos = 0;
	this.scache = new Array();
	this.cache = new Array();
	this.setResolver(haxe.Unserializer.DEFAULT_RESOLVER);
}}
haxe.Unserializer.__name__ = ["haxe","Unserializer"];
haxe.Unserializer.initCodes = function() {
	var codes = new Array();
	{
		var _g1 = 0, _g = haxe.Unserializer.BASE64.length;
		while(_g1 < _g) {
			var i = _g1++;
			codes[haxe.Unserializer.BASE64.cca(i)] = i;
		}
	}
	return codes;
}
haxe.Unserializer.run = function(v) {
	return new haxe.Unserializer(v).unserialize();
}
haxe.Unserializer.prototype.buf = null;
haxe.Unserializer.prototype.cache = null;
haxe.Unserializer.prototype.get = function(p) {
	return this.buf.cca(p);
}
haxe.Unserializer.prototype.length = null;
haxe.Unserializer.prototype.pos = null;
haxe.Unserializer.prototype.readDigits = function() {
	var k = 0;
	var s = false;
	var fpos = this.pos;
	while(true) {
		var c = this.buf.cca(this.pos);
		if(Math.isNaN(c)) break;
		if(c == 45) {
			if(this.pos != fpos) break;
			s = true;
			this.pos++;
			continue;
		}
		c -= 48;
		if(c < 0 || c > 9) break;
		k = k * 10 + c;
		this.pos++;
	}
	if(s) k *= -1;
	return k;
}
haxe.Unserializer.prototype.resolver = null;
haxe.Unserializer.prototype.scache = null;
haxe.Unserializer.prototype.setResolver = function(r) {
	if(r == null) this.resolver = { resolveClass : function(_) {
		return null;
	}, resolveEnum : function(_) {
		return null;
	}}
	else this.resolver = r;
}
haxe.Unserializer.prototype.unserialize = function() {
	switch(this.buf.cca(this.pos++)) {
	case 110:{
		return null;
	}break;
	case 116:{
		return true;
	}break;
	case 102:{
		return false;
	}break;
	case 122:{
		return 0;
	}break;
	case 105:{
		return this.readDigits();
	}break;
	case 100:{
		var p1 = this.pos;
		while(true) {
			var c = this.buf.cca(this.pos);
			if((c >= 43 && c < 58) || c == 101 || c == 69) this.pos++;
			else break;
		}
		return Std.parseFloat(this.buf.substr(p1,this.pos - p1));
	}break;
	case 121:{
		var len = this.readDigits();
		if(this.buf.charAt(this.pos++) != ":" || this.length - this.pos < len) throw "Invalid string length";
		var s = this.buf.substr(this.pos,len);
		this.pos += len;
		s = StringTools.urlDecode(s);
		this.scache.push(s);
		return s;
	}break;
	case 107:{
		return Math.NaN;
	}break;
	case 109:{
		return Math.NEGATIVE_INFINITY;
	}break;
	case 112:{
		return Math.POSITIVE_INFINITY;
	}break;
	case 97:{
		var buf = this.buf;
		var a = new Array();
		this.cache.push(a);
		while(true) {
			var c = this.buf.cca(this.pos);
			if(c == 104) {
				this.pos++;
				break;
			}
			if(c == 117) {
				this.pos++;
				var n = this.readDigits();
				a[(a.length + n) - 1] = null;
			}
			else a.push(this.unserialize());
		}
		return a;
	}break;
	case 111:{
		var o = { }
		this.cache.push(o);
		this.unserializeObject(o);
		return o;
	}break;
	case 114:{
		var n = this.readDigits();
		if(n < 0 || n >= this.cache.length) throw "Invalid reference";
		return this.cache[n];
	}break;
	case 82:{
		var n = this.readDigits();
		if(n < 0 || n >= this.scache.length) throw "Invalid string reference";
		return this.scache[n];
	}break;
	case 120:{
		throw this.unserialize();
	}break;
	case 99:{
		var name = this.unserialize();
		var cl = this.resolver.resolveClass(name);
		if(cl == null) throw "Class not found " + name;
		var o = Type.createEmptyInstance(cl);
		this.cache.push(o);
		this.unserializeObject(o);
		return o;
	}break;
	case 119:{
		var name = this.unserialize();
		var edecl = this.resolver.resolveEnum(name);
		if(edecl == null) throw "Enum not found " + name;
		return this.unserializeEnum(edecl,this.unserialize());
	}break;
	case 106:{
		var name = this.unserialize();
		var edecl = this.resolver.resolveEnum(name);
		if(edecl == null) throw "Enum not found " + name;
		this.pos++;
		var index = this.readDigits();
		var tag = Type.getEnumConstructs(edecl)[index];
		if(tag == null) throw (("Unknown enum index " + name) + "@") + index;
		return this.unserializeEnum(edecl,tag);
	}break;
	case 108:{
		var l = new List();
		this.cache.push(l);
		var buf = this.buf;
		while(this.buf.cca(this.pos) != 104) l.add(this.unserialize());
		this.pos++;
		return l;
	}break;
	case 98:{
		var h = new Hash();
		this.cache.push(h);
		var buf = this.buf;
		while(this.buf.cca(this.pos) != 104) {
			var s = this.unserialize();
			h.set(s,this.unserialize());
		}
		this.pos++;
		return h;
	}break;
	case 113:{
		var h = new IntHash();
		this.cache.push(h);
		var buf = this.buf;
		var c = this.buf.cca(this.pos++);
		while(c == 58) {
			var i = this.readDigits();
			h.set(i,this.unserialize());
			c = this.buf.cca(this.pos++);
		}
		if(c != 104) throw "Invalid IntHash format";
		return h;
	}break;
	case 118:{
		var d = Date.fromString(this.buf.substr(this.pos,19));
		this.cache.push(d);
		this.pos += 19;
		return d;
	}break;
	case 115:{
		var len = this.readDigits();
		var buf = this.buf;
		if(buf.charAt(this.pos++) != ":" || this.length - this.pos < len) throw "Invalid bytes length";
		var codes = haxe.Unserializer.CODES;
		if(codes == null) {
			codes = haxe.Unserializer.initCodes();
			haxe.Unserializer.CODES = codes;
		}
		var i = this.pos;
		var rest = len & 3;
		var size = (len >> 2) * 3 + (((rest >= 2)?rest - 1:0));
		var max = i + (len - rest);
		var bytes = haxe.io.Bytes.alloc(size);
		var bpos = 0;
		while(i < max) {
			var c1 = codes[buf.cca(i++)];
			var c2 = codes[buf.cca(i++)];
			bytes.b[bpos++] = (((c1 << 2) | (c2 >> 4)) & 255);
			var c3 = codes[buf.cca(i++)];
			bytes.b[bpos++] = (((c2 << 4) | (c3 >> 2)) & 255);
			var c4 = codes[buf.cca(i++)];
			bytes.b[bpos++] = (((c3 << 6) | c4) & 255);
		}
		if(rest >= 2) {
			var c1 = codes[buf.cca(i++)];
			var c2 = codes[buf.cca(i++)];
			bytes.b[bpos++] = (((c1 << 2) | (c2 >> 4)) & 255);
			if(rest == 3) {
				var c3 = codes[buf.cca(i++)];
				bytes.b[bpos++] = (((c2 << 4) | (c3 >> 2)) & 255);
			}
		}
		this.pos += len;
		this.cache.push(bytes);
		return bytes;
	}break;
	default:{
		null;
	}break;
	}
	this.pos--;
	throw ((("Invalid char " + this.buf.charAt(this.pos)) + " at position ") + this.pos);
}
haxe.Unserializer.prototype.unserializeEnum = function(edecl,tag) {
	var constr = Reflect.field(edecl,tag);
	if(constr == null) throw (("Unknown enum tag " + Type.getEnumName(edecl)) + ".") + tag;
	if(this.buf.cca(this.pos++) != 58) throw "Invalid enum format";
	var nargs = this.readDigits();
	if(nargs == 0) {
		this.cache.push(constr);
		return constr;
	}
	var args = new Array();
	while(nargs > 0) {
		args.push(this.unserialize());
		nargs -= 1;
	}
	var e = constr.apply(edecl,args);
	this.cache.push(e);
	return e;
}
haxe.Unserializer.prototype.unserializeObject = function(o) {
	while(true) {
		if(this.pos >= this.length) throw "Invalid object";
		if(this.buf.cca(this.pos) == 103) break;
		var k = this.unserialize();
		if(!Std["is"](k,String)) throw "Invalid object key";
		var v = this.unserialize();
		o[k] = v;
	}
	this.pos++;
}
haxe.Unserializer.prototype.__class__ = haxe.Unserializer;
haxe.io.Error = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] }
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; }
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
net.alphatab.model.MixTableItem = function(p) { if( p === $_ ) return; {
	this.value = 0;
	this.duration = 0;
	this.allTracks = false;
}}
net.alphatab.model.MixTableItem.__name__ = ["net","alphatab","model","MixTableItem"];
net.alphatab.model.MixTableItem.prototype.allTracks = null;
net.alphatab.model.MixTableItem.prototype.duration = null;
net.alphatab.model.MixTableItem.prototype.value = null;
net.alphatab.model.MixTableItem.prototype.__class__ = net.alphatab.model.MixTableItem;
net.alphatab.tablature.TrackSpacingPositionConverter = function() { }
net.alphatab.tablature.TrackSpacingPositionConverter.__name__ = ["net","alphatab","tablature","TrackSpacingPositionConverter"];
net.alphatab.tablature.TrackSpacingPositionConverter.toInt = function(pos) {
	switch(pos) {
	case net.alphatab.tablature.TrackSpacingPositions.Top:{
		return 0;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Marker:{
		return 1;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Text:{
		return 2;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.BufferSeparator:{
		return 3;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.RepeatEnding:{
		return 4;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Chord:{
		return 5;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines:{
		return 6;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines:{
		return 7;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.ScoreDownLines:{
		return 8;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Tupleto:{
		return 9;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect:{
		return 10;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect:{
		return 11;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.TapingEffect:{
		return 12;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.LetRingEffect:{
		return 13;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect:{
		return 14;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect:{
		return 15;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.VibratoEffect:{
		return 16;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.FadeIn:{
		return 17;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Bend:{
		return 18;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.TablatureTopSeparator:{
		return 19;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Tablature:{
		return 20;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.TremoloBarDown:{
		return 21;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Lyric:{
		return 22;
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Bottom:{
		return 23;
	}break;
	default:{
		return 0;
	}break;
	}
}
net.alphatab.tablature.TrackSpacingPositionConverter.prototype.__class__ = net.alphatab.tablature.TrackSpacingPositionConverter;
net.alphatab.file.alphatex.AlphaTexSymbols = { __ename__ : ["net","alphatab","file","alphatex","AlphaTexSymbols"], __constructs__ : ["No","Eof","Number","Dot","Version","String","Tuning","LParensis","RParensis","LBrace","RBrace","Pipe","MetaCommand"] }
net.alphatab.file.alphatex.AlphaTexSymbols.Dot = ["Dot",3];
net.alphatab.file.alphatex.AlphaTexSymbols.Dot.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.Dot.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.Eof = ["Eof",1];
net.alphatab.file.alphatex.AlphaTexSymbols.Eof.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.Eof.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.LBrace = ["LBrace",9];
net.alphatab.file.alphatex.AlphaTexSymbols.LBrace.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.LBrace.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.LParensis = ["LParensis",7];
net.alphatab.file.alphatex.AlphaTexSymbols.LParensis.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.LParensis.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.MetaCommand = ["MetaCommand",12];
net.alphatab.file.alphatex.AlphaTexSymbols.MetaCommand.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.MetaCommand.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.No = ["No",0];
net.alphatab.file.alphatex.AlphaTexSymbols.No.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.No.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.Number = ["Number",2];
net.alphatab.file.alphatex.AlphaTexSymbols.Number.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.Number.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.Pipe = ["Pipe",11];
net.alphatab.file.alphatex.AlphaTexSymbols.Pipe.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.Pipe.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.RBrace = ["RBrace",10];
net.alphatab.file.alphatex.AlphaTexSymbols.RBrace.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.RBrace.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.RParensis = ["RParensis",8];
net.alphatab.file.alphatex.AlphaTexSymbols.RParensis.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.RParensis.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.String = ["String",5];
net.alphatab.file.alphatex.AlphaTexSymbols.String.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.String.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.Tuning = ["Tuning",6];
net.alphatab.file.alphatex.AlphaTexSymbols.Tuning.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.Tuning.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.file.alphatex.AlphaTexSymbols.Version = ["Version",4];
net.alphatab.file.alphatex.AlphaTexSymbols.Version.toString = $estr;
net.alphatab.file.alphatex.AlphaTexSymbols.Version.__enum__ = net.alphatab.file.alphatex.AlphaTexSymbols;
net.alphatab.midi.MidiSequenceParser = function(factory,song,flags,tempoPercent,transpose) { if( factory === $_ ) return; {
	this._song = song;
	this._factory = factory;
	this._flags = flags;
	this._transpose = transpose;
	this._tempoPercent = tempoPercent;
	this._firstTickMove = (((flags & 8) == 0)?0:960);
}}
net.alphatab.midi.MidiSequenceParser.__name__ = ["net","alphatab","midi","MidiSequenceParser"];
net.alphatab.midi.MidiSequenceParser.applyDurationEffects = function(note,tempo,duration) {
	if(note.effect.deadNote) {
		return net.alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,30,duration);
	}
	if(note.effect.palmMute) {
		return net.alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,80,duration);
	}
	if(note.effect.staccato) {
		return Math.floor((duration * 50.0) / 100.0);
	}
	return duration;
}
net.alphatab.midi.MidiSequenceParser.applyStaticDuration = function(tempo,duration,maximum) {
	var value = Math.floor((tempo.value * duration) / 60);
	return (((value < maximum)?value:maximum));
}
net.alphatab.midi.MidiSequenceParser.applyStrokeDuration = function(note,duration,stroke) {
	return (duration - stroke[note.string - 1]);
}
net.alphatab.midi.MidiSequenceParser.applyStrokeStart = function(node,start,stroke) {
	return (start + stroke[node.string - 1]);
}
net.alphatab.midi.MidiSequenceParser.getNextBeat = function(voice,beatIndex) {
	var next = null;
	{
		var _g1 = beatIndex + 1, _g = voice.beat.measure.beatCount();
		while(_g1 < _g) {
			var b = _g1++;
			var current = voice.beat.measure.beats[b];
			if(((current.start > voice.beat.start) && !current.voices[voice.index].isEmpty) && ((next == null) || (current.start < next.beat.start))) {
				next = current.voices[voice.index];
			}
		}
	}
	return next;
}
net.alphatab.midi.MidiSequenceParser.getNextNote = function(note,track,measureIndex,beatIndex) {
	var nextBeatIndex = beatIndex + 1;
	var measureCount = track.measureCount();
	{
		var _g = measureIndex;
		while(_g < measureCount) {
			var m = _g++;
			var measure = track.measures[m];
			var beatCount = measure.beatCount();
			{
				var _g1 = nextBeatIndex;
				while(_g1 < beatCount) {
					var b = _g1++;
					var beat = measure.beats[b];
					var voice = beat.voices[note.voice.index];
					var noteCount = voice.notes.length;
					{
						var _g2 = 0;
						while(_g2 < noteCount) {
							var n = _g2++;
							var currNode = voice.notes[n];
							if(currNode.string == note.string) {
								return currNode;
							}
						}
					}
					return null;
				}
			}
			nextBeatIndex = 0;
		}
	}
	return null;
}
net.alphatab.midi.MidiSequenceParser.getPreviousBeat = function(voice,beatIndex) {
	var previous = null;
	var b = beatIndex - 1;
	while(b >= 0) {
		var current = voice.beat.measure.beats[b];
		if(((current.start < voice.beat.start) && !current.voices[voice.index].isEmpty) && ((previous == null) || (current.start > previous.beat.start))) {
			previous = current.voices[voice.index];
		}
		b--;
	}
	return previous;
}
net.alphatab.midi.MidiSequenceParser.getPreviousNote = function(note,track,measureIndex,beatIndex) {
	var nextBeatIndex = beatIndex;
	var m = measureIndex;
	while(m >= 0) {
		var measure = track.measures[m];
		nextBeatIndex = ((nextBeatIndex < 0)?measure.beatCount():nextBeatIndex);
		var b = nextBeatIndex - 1;
		while(b >= 0) {
			var voice = measure.beats[b].voices[note.voice.index];
			var noteCount = voice.notes.length;
			{
				var _g = 0;
				while(_g < noteCount) {
					var n = _g++;
					var current = voice.notes[n];
					if(current.string == note.string) {
						return current;
					}
				}
			}
			b--;
		}
		nextBeatIndex = -1;
		m--;
	}
	return null;
}
net.alphatab.midi.MidiSequenceParser.getRealVelocity = function(note,track,measureIndex,beatIndex) {
	var velocity = note.velocity;
	if(!track.isPercussionTrack) {
		var previousNote = net.alphatab.midi.MidiSequenceParser.getPreviousNote(note,track,measureIndex,beatIndex);
		if((previousNote != null) && previousNote.effect.hammer) {
			velocity = Math.floor(Math.max(15,velocity - 25));
		}
	}
	if(note.effect.ghostNote) {
		velocity = Math.floor(Math.max(15,velocity - 16));
	}
	else if(note.effect.accentuatedNote) {
		velocity = Math.floor(Math.max(15,velocity + 16));
	}
	else if(note.effect.heavyAccentuatedNote) {
		velocity = Math.floor(Math.max(15,velocity + 32));
	}
	return (((velocity > 127)?127:velocity));
}
net.alphatab.midi.MidiSequenceParser.getStroke = function(beat,previous,stroke) {
	var direction = beat.effect.stroke.direction;
	if(((previous == null) || (direction != net.alphatab.model.BeatStrokeDirection.None)) || (previous.effect.stroke.direction != net.alphatab.model.BeatStrokeDirection.None)) {
		if(direction == net.alphatab.model.BeatStrokeDirection.None) {
			{
				var _g1 = 0, _g = stroke.length;
				while(_g1 < _g) {
					var i = _g1++;
					stroke[i] = 0;
				}
			}
		}
		else {
			var stringUsed = 0;
			var stringCount = 0;
			{
				var _g1 = 0, _g = beat.voices.length;
				while(_g1 < _g) {
					var vIndex = _g1++;
					var voice = beat.voices[vIndex];
					{
						var _g3 = 0, _g2 = voice.notes.length;
						while(_g3 < _g2) {
							var nIndex = _g3++;
							var note = voice.notes[nIndex];
							if(note.isTiedNote) continue;
							stringUsed |= 1 << (note.string - 1);
							stringCount++;
						}
					}
				}
			}
			if(stringCount > 0) {
				var strokeMove = 0;
				var strokeIncrement = beat.effect.stroke.getIncrementTime(beat);
				{
					var _g1 = 0, _g = stroke.length;
					while(_g1 < _g) {
						var i = _g1++;
						var iIndex = ((direction != net.alphatab.model.BeatStrokeDirection.Down)?i:((stroke.length - 1) - i));
						if((stringUsed & (1 << iIndex)) != 0) {
							stroke[iIndex] = strokeMove;
							strokeMove += strokeIncrement;
						}
					}
				}
			}
		}
	}
	return stroke;
}
net.alphatab.midi.MidiSequenceParser.prototype._factory = null;
net.alphatab.midi.MidiSequenceParser.prototype._firstTickMove = null;
net.alphatab.midi.MidiSequenceParser.prototype._flags = null;
net.alphatab.midi.MidiSequenceParser.prototype._infoTrack = null;
net.alphatab.midi.MidiSequenceParser.prototype._metronomeTrack = null;
net.alphatab.midi.MidiSequenceParser.prototype._song = null;
net.alphatab.midi.MidiSequenceParser.prototype._tempoPercent = null;
net.alphatab.midi.MidiSequenceParser.prototype._transpose = null;
net.alphatab.midi.MidiSequenceParser.prototype.addBend = function(sequence,track,tick,bend,channel) {
	sequence.addPitchBend(this.getTick(tick),track,channel,bend);
}
net.alphatab.midi.MidiSequenceParser.prototype.addDefaultMessages = function(oSequence) {
	if((this._flags & 1) == 0) return;
	{
		var _g = 0;
		while(_g < 16) {
			var i = _g++;
			oSequence.addControlChange(this.getTick(960),this._infoTrack,i,101,0);
			oSequence.addControlChange(this.getTick(960),this._infoTrack,i,100,0);
			oSequence.addControlChange(this.getTick(960),this._infoTrack,i,6,12);
			oSequence.addControlChange(this.getTick(960),this._infoTrack,i,38,0);
		}
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.addMetronome = function(sequence,header,startMove) {
	if((this._flags & 4) == 0) return;
	var start = startMove + header.start;
	var length = header.timeSignature.denominator.time();
	{
		var _g1 = 1, _g = header.timeSignature.numerator + 1;
		while(_g1 < _g) {
			var i = _g1++;
			this.makeNote(sequence,this._metronomeTrack,37,start,length,95,9);
			start += length;
		}
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.addTempo = function(sequence,currentMeasure,previousMeasure,startMove) {
	var bAddTempo = false;
	if(previousMeasure == null) {
		bAddTempo = true;
	}
	else if(currentMeasure.tempo().inUsq() != previousMeasure.tempo().inUsq()) {
		bAddTempo = true;
	}
	if(!bAddTempo) return;
	var usq = Math.floor((currentMeasure.tempo().inUsq() * 100.0) / this._tempoPercent);
	sequence.addTempoInUSQ(this.getTick(currentMeasure.start() + startMove),this._infoTrack,usq);
}
net.alphatab.midi.MidiSequenceParser.prototype.addTimeSignature = function(sequence,currentMeasure,previousMeasure,startMove) {
	var addTimeSignature = false;
	if(previousMeasure == null) {
		addTimeSignature = true;
	}
	else {
		var currNumerator = currentMeasure.timeSignature().numerator;
		var currValue = currentMeasure.timeSignature().denominator.value;
		var prevNumerator = previousMeasure.timeSignature().numerator;
		var prevValue = previousMeasure.timeSignature().denominator.value;
		if((currNumerator != prevNumerator) || (currValue != prevValue)) {
			addTimeSignature = true;
		}
	}
	if(addTimeSignature) {
		sequence.addTimeSignature(this.getTick(currentMeasure.start() + startMove),this._infoTrack,currentMeasure.timeSignature());
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.checkTripletFeel = function(voice,beatIndex) {
	var beatStart = voice.beat.start;
	var beatDuration = voice.duration.time();
	if(voice.beat.measure.tripletFeel() == net.alphatab.model.TripletFeel.Eighth) {
		if(voice.duration == this.newDuration(8)) {
			if((beatStart % 960) == 0) {
				var voice2 = net.alphatab.midi.MidiSequenceParser.getNextBeat(voice,beatIndex);
				if(((voice2 == null) || (voice2.beat.start > (beatStart + voice2.duration.time()))) || voice2.duration == this.newDuration(8)) {
					var duration = this.newDuration(8);
					duration.tuplet.enters = 3;
					duration.tuplet.times = 2;
					beatDuration = duration.time() * 2;
				}
			}
			else if((beatStart % (960 / 2)) == 0) {
				var voice2 = net.alphatab.midi.MidiSequenceParser.getPreviousBeat(voice,beatIndex);
				if(((voice2 == null) || (voice2.beat.start < (beatStart - voice.duration.time()))) || voice2.duration == this.newDuration(8)) {
					var duration = this.newDuration(8);
					duration.tuplet.enters = 3;
					duration.tuplet.times = 2;
					beatStart = (beatStart - voice.duration.time()) + (duration.time() * 2);
					beatDuration = duration.time();
				}
			}
		}
	}
	else if(voice.beat.measure.tripletFeel() == net.alphatab.model.TripletFeel.Sixteenth) {
		if(voice.duration == this.newDuration(16)) if((beatStart % (960 / 2)) == 0) {
			var voice2 = net.alphatab.midi.MidiSequenceParser.getNextBeat(voice,beatIndex);
			if(voice2 == null || (voice2.beat.start > (beatStart + voice.duration.time())) || voice2.duration == this.newDuration(16)) {
				var duration = this.newDuration(16);
				duration.tuplet.enters = 3;
				duration.tuplet.times = 2;
				beatDuration = duration.time() * 2;
			}
		}
		else if((beatStart % (960 / 4)) == 0) {
			var voice2 = net.alphatab.midi.MidiSequenceParser.getPreviousBeat(voice,beatIndex);
			if(voice2 == null || (voice2.beat.start < (beatStart - voice2.duration.time()) || voice2.duration == this.newDuration(16))) {
				var duration = this.newDuration(16);
				duration.tuplet.enters = 3;
				duration.tuplet.times = 2;
				beatStart = (beatStart - voice.duration.time()) + (duration.time() * 2);
				beatDuration = duration.time();
			}
		}
	}
	return new net.alphatab.midi.BeatData(beatStart,beatDuration);
}
net.alphatab.midi.MidiSequenceParser.prototype.createTrack = function(sequence,track) {
	var previous = null;
	var controller = new net.alphatab.midi.MidiRepeatController(track.song);
	this.addBend(sequence,track.number,960,64,track.channel.channel);
	this.makeChannel(sequence,track.channel,track.number);
	while(!controller.finished()) {
		var measure = track.measures[controller.index];
		var index = controller.index;
		var move = controller.repeatMove;
		controller.process();
		if(controller.shouldPlay) {
			if(track.number == 1) {
				this.addTimeSignature(sequence,measure,previous,move);
				this.addTempo(sequence,measure,previous,move);
				this.addMetronome(sequence,measure.header,move);
			}
			this.makeBeats(sequence,track,measure,index,move);
		}
		previous = measure;
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.getMixChangeValue = function(value,signed) {
	if(signed == null) signed = true;
	if(signed) value += 8;
	return Math.round((value * 127) / 16);
}
net.alphatab.midi.MidiSequenceParser.prototype.getRealNoteDuration = function(track,note,tempo,duration,measureIndex,beatIndex) {
	var lastEnd = note.voice.beat.start + note.voice.duration.time();
	var realDuration = duration;
	var nextBeatIndex = beatIndex + 1;
	var measureCount = track.measureCount();
	{
		var _g = measureIndex;
		while(_g < measureCount) {
			var m = _g++;
			var measure = track.measures[m];
			var beatCount = measure.beatCount();
			var letRingSuspend = false;
			{
				var _g1 = nextBeatIndex;
				while(_g1 < beatCount) {
					var b = _g1++;
					var beat = measure.beats[b];
					var voice = beat.voices[note.voice.index];
					if(voice.isRestVoice()) {
						return net.alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
					}
					var noteCount = voice.notes.length;
					var letRing = m == measureIndex && b != beatIndex && note.effect.letRing;
					var letRingAppliedForBeat = false;
					{
						var _g2 = 0;
						while(_g2 < noteCount) {
							var n = _g2++;
							var nextNote = voice.notes[n];
							if(nextNote == note || nextNote.string != note.string) continue;
							if(nextNote.string == note.string && !nextNote.isTiedNote) {
								letRing = false;
								letRingSuspend = true;
							}
							if(!nextNote.isTiedNote && !letRing) {
								return net.alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
							}
							letRingAppliedForBeat = true;
							realDuration += (beat.start - lastEnd) + nextNote.voice.duration.time();
							lastEnd = beat.start + voice.duration.time();
						}
					}
					if(letRing && !letRingAppliedForBeat && !letRingSuspend) {
						realDuration += (beat.start - lastEnd) + voice.duration.time();
						lastEnd = beat.start + voice.duration.time();
					}
				}
			}
			nextBeatIndex = 0;
		}
	}
	return net.alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
}
net.alphatab.midi.MidiSequenceParser.prototype.getTick = function(tick) {
	return (tick + this._firstTickMove);
}
net.alphatab.midi.MidiSequenceParser.prototype.makeBeats = function(sequence,track,measure,measureIndex,startMove) {
	var stroke = new Array();
	{
		var _g1 = 0, _g = track.stringCount();
		while(_g1 < _g) {
			var i = _g1++;
			stroke.push(0);
		}
	}
	var previous = null;
	{
		var _g1 = 0, _g = measure.beatCount();
		while(_g1 < _g) {
			var beatIndex = _g1++;
			var beat = measure.beats[beatIndex];
			if(beat.effect.mixTableChange != null) {
				this.makeMixChange(sequence,track.channel,track.number,beat);
			}
			this.makeNotes(sequence,track,beat,measure.tempo(),measureIndex,beatIndex,startMove,net.alphatab.midi.MidiSequenceParser.getStroke(beat,previous,stroke));
			previous = beat;
		}
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.makeBend = function(sequence,track,start,duration,bend,channel) {
	var points = bend.points;
	{
		var _g1 = 0, _g = points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = points[i];
			var bendStart = start + point.GetTime(duration);
			var value = Math.round(64 + ((point.value * 2.75) / 1));
			value = ((value <= 127)?value:127);
			value = ((value >= 0)?value:0);
			this.addBend(sequence,track,bendStart,value,channel);
			if(points.length <= (i + 1)) continue;
			var nextPoint = points[i + 1];
			var nextValue = Math.round(64 + ((nextPoint.value * 2.75) / 1));
			var nextBendStart = Math.round(start + nextPoint.GetTime(duration));
			if(nextValue == value) continue;
			var width = (nextBendStart - bendStart) / Math.abs(nextValue - value);
			if(value < nextValue) {
				while(value < nextValue) {
					value++;
					bendStart += Math.round(width);
					this.addBend(sequence,track,bendStart,((value <= 127)?value:127),channel);
				}
			}
			else if(value > nextValue) {
				while(value > nextValue) {
					value--;
					bendStart += Math.round(width);
					this.addBend(sequence,track,bendStart,((value >= 0)?value:0),channel);
				}
			}
		}
	}
	this.addBend(sequence,track,start + duration,64,channel);
}
net.alphatab.midi.MidiSequenceParser.prototype.makeChannel = function(sequence,channel,track) {
	if((this._flags & 2) == 0) return;
	this.makeChannel2(sequence,channel,track,true);
	if(channel.channel != channel.effectChannel) {
		this.makeChannel2(sequence,channel,track,false);
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.makeChannel2 = function(sequence,channel,track,primary) {
	var number = ((!primary)?channel.effectChannel:channel.channel);
	sequence.addControlChange(this.getTick(960),track,number,7,channel.volume);
	sequence.addControlChange(this.getTick(960),track,number,10,channel.balance);
	sequence.addControlChange(this.getTick(960),track,number,93,channel.chorus);
	sequence.addControlChange(this.getTick(960),track,number,91,channel.reverb);
	sequence.addControlChange(this.getTick(960),track,number,95,channel.phaser);
	sequence.addControlChange(this.getTick(960),track,number,92,channel.tremolo);
	sequence.addControlChange(this.getTick(960),track,number,11,127);
	sequence.addProgramChange(this.getTick(960),track,number,channel.instrument());
}
net.alphatab.midi.MidiSequenceParser.prototype.makeFadeIn = function(sequence,track,start,duration,channel) {
	var expression = 31;
	var expressionIncrement = 1;
	var tick = start;
	var tickIncrement = Math.round(duration / ((127 - expression) / expressionIncrement));
	while((tick < (start + duration)) && (expression < 127)) {
		sequence.addControlChange(this.getTick(tick),track,channel,11,expression);
		tick += tickIncrement;
		expression += expressionIncrement;
	}
	sequence.addControlChange(this.getTick(start + duration),track,channel,11,127);
}
net.alphatab.midi.MidiSequenceParser.prototype.makeMixChange = function(sequence,channel,track,beat) {
	var change = beat.effect.mixTableChange;
	var start = this.getTick(beat.start);
	if(change.volume != null) {
		var value = this.getMixChangeValue(change.volume.value,false);
		sequence.addControlChange(start,track,channel.channel,7,value);
		sequence.addControlChange(start,track,channel.effectChannel,7,value);
	}
	if(change.balance != null) {
		var value = this.getMixChangeValue(change.balance.value);
		sequence.addControlChange(start,track,channel.channel,10,value);
		sequence.addControlChange(start,track,channel.effectChannel,10,value);
	}
	if(change.chorus != null) {
		var value = this.getMixChangeValue(change.chorus.value);
		sequence.addControlChange(start,track,channel.channel,93,value);
		sequence.addControlChange(start,track,channel.effectChannel,93,value);
	}
	if(change.reverb != null) {
		var value = this.getMixChangeValue(change.reverb.value);
		sequence.addControlChange(start,track,channel.channel,91,value);
		sequence.addControlChange(start,track,channel.effectChannel,91,value);
	}
	if(change.phaser != null) {
		var value = this.getMixChangeValue(change.phaser.value);
		sequence.addControlChange(start,track,channel.channel,95,value);
		sequence.addControlChange(start,track,channel.effectChannel,95,value);
	}
	if(change.tremolo != null) {
		var value = this.getMixChangeValue(change.tremolo.value);
		sequence.addControlChange(start,track,channel.channel,92,value);
		sequence.addControlChange(start,track,channel.effectChannel,92,value);
	}
	if(change.instrument != null) {
		sequence.addProgramChange(start,track,channel.channel,change.instrument.value);
		sequence.addProgramChange(start,track,channel.effectChannel,change.instrument.value);
	}
	if(change.tempo != null) {
		sequence.addTempoInUSQ(start,this._infoTrack,net.alphatab.model.Tempo.tempoToUsq(change.tempo.value));
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.makeNote = function(sequence,track,key,start,duration,velocity,channel) {
	sequence.addNoteOn(this.getTick(start),track,channel,key,velocity);
	sequence.addNoteOff(this.getTick(start + duration),track,channel,key,velocity);
}
net.alphatab.midi.MidiSequenceParser.prototype.makeNotes = function(sequence,track,beat,tempo,measureIndex,beatIndex,startMove,stroke) {
	var trackId = track.number;
	{
		var _g1 = 0, _g = beat.voices.length;
		while(_g1 < _g) {
			var vIndex = _g1++;
			var voice = beat.voices[vIndex];
			var data = this.checkTripletFeel(voice,beatIndex);
			{
				var _g3 = 0, _g2 = voice.notes.length;
				while(_g3 < _g2) {
					var noteIndex = _g3++;
					var note = voice.notes[noteIndex];
					if(note.isTiedNote) continue;
					var key = ((this._transpose + track.offset) + note.value) + track.strings[note.string - 1].value;
					var start = net.alphatab.midi.MidiSequenceParser.applyStrokeStart(note,data.start + startMove,stroke);
					var duration = net.alphatab.midi.MidiSequenceParser.applyStrokeDuration(note,this.getRealNoteDuration(track,note,tempo,data.duration,measureIndex,beatIndex),stroke);
					var velocity = net.alphatab.midi.MidiSequenceParser.getRealVelocity(note,track,measureIndex,beatIndex);
					var channel = track.channel.channel;
					var effectChannel = track.channel.effectChannel;
					var percussionTrack = track.isPercussionTrack;
					if(beat.effect.fadeIn) {
						channel = effectChannel;
						this.makeFadeIn(sequence,trackId,start,duration,channel);
					}
					if((note.effect.isGrace() && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						var graceKey = (track.offset + note.effect.grace.fret) + (track.strings[note.string - 1].value);
						var graceLength = note.effect.grace.durationTime();
						var graceVelocity = note.effect.grace.velocity;
						var graceDuration = ((!note.effect.grace.isDead)?graceLength:net.alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,30,graceLength));
						if(note.effect.grace.isOnBeat || ((start - graceLength) < 960)) {
							start += graceLength;
							duration -= graceLength;
						}
						this.makeNote(sequence,trackId,graceKey,start - graceLength,graceDuration,graceVelocity,channel);
					}
					if((note.effect.isTrill() && (effectChannel >= 0)) && !percussionTrack) {
						var trillKey = (track.offset + note.effect.trill.fret) + (track.strings[note.string - 1].value);
						var trillLength = note.effect.trill.duration.time();
						var realKey = true;
						var tick = start;
						while(tick + 10 < (start + duration)) {
							if((tick + trillLength) >= (start + duration)) {
								trillLength = (((start + duration) - tick) - 1);
							}
							this.makeNote(sequence,trackId,(((realKey)?key:trillKey)),tick,trillLength,velocity,channel);
							realKey = !realKey;
							tick += trillLength;
						}
						continue;
					}
					if(note.effect.isTremoloPicking() && (effectChannel >= 0)) {
						var tpLength = note.effect.tremoloPicking.duration.time();
						var tick = start;
						while(tick + 10 < (start + duration)) {
							if((tick + tpLength) >= (start + duration)) {
								tpLength = (((start + duration) - tick) - 1);
							}
							this.makeNote(sequence,trackId,key,start,tpLength,velocity,channel);
							tick += tpLength;
						}
						continue;
					}
					if((note.effect.isBend() && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						this.makeBend(sequence,trackId,start,duration,note.effect.bend,channel);
					}
					else if((note.voice.beat.effect.isTremoloBar() && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						this.makeTremoloBar(sequence,trackId,start,duration,note.voice.beat.effect.tremoloBar,channel);
					}
					else if((note.effect.slide && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						var nextNote = net.alphatab.midi.MidiSequenceParser.getNextNote(note,track,measureIndex,beatIndex);
						this.makeSlide(sequence,trackId,note,nextNote,startMove,channel);
					}
					else if((note.effect.vibrato && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						this.makeVibrato(sequence,trackId,start,duration,channel);
					}
					if(note.effect.isHarmonic() && !percussionTrack) {
						var orig = key;
						if(note.effect.harmonic.type == net.alphatab.model.effects.HarmonicType.Natural) {
							{
								var _g5 = 0, _g4 = net.alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES.length;
								while(_g5 < _g4) {
									var i = _g5++;
									if((note.value % 12) == (net.alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[i][0] % 12)) {
										key = (orig + net.alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[i][1]) - note.value;
										break;
									}
								}
							}
						}
						else {
							if(note.effect.harmonic.type == net.alphatab.model.effects.HarmonicType.Semi) {
								this.makeNote(sequence,trackId,Math.round(Math.min(127,orig)),start,duration,Math.round(Math.max(15,velocity - 48)),channel);
							}
							key = orig + net.alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[note.effect.harmonic.data][1];
						}
						if((key - 12) > 0) {
							var hVelocity = Math.round(Math.max(15,velocity - 64));
							this.makeNote(sequence,trackId,key - 12,start,duration,hVelocity,channel);
						}
					}
					this.makeNote(sequence,trackId,Math.round(Math.min(127,key)),start,duration,velocity,channel);
				}
			}
		}
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.makeSlide = function(sequence,track,note,nextNote,startMove,channel) {
	if(nextNote != null) {
		this.makeSlide2(sequence,track,note.voice.beat.start + startMove,note.value,nextNote.voice.beat.start + startMove,nextNote.value,channel);
		this.addBend(sequence,track,nextNote.voice.beat.start + startMove,64,channel);
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.makeSlide2 = function(sequence,track,tick1,value1,tick2,value2,channel) {
	var lDistance = value2 - value1;
	var lLength = tick2 - tick1;
	var points = Math.floor(lLength / (960 / 8));
	{
		var _g1 = 1, _g = points + 1;
		while(_g1 < _g) {
			var i = _g1++;
			var fTone = (((lLength / points) * i) * lDistance) / lLength;
			var iBend = Math.round(64 + (fTone * (2.75 * 2)));
			this.addBend(sequence,track,Math.round(tick1 + ((lLength / points) * i)),iBend,channel);
		}
	}
}
net.alphatab.midi.MidiSequenceParser.prototype.makeTremoloBar = function(sequence,track,start,duration,effect,channel) {
	var points = effect.points;
	{
		var _g1 = 0, _g = points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = points[i];
			var pointStart = start + point.GetTime(duration);
			var value = Math.round(64 + (point.value * (2.75 * 2)));
			value = ((value <= 127)?value:127);
			value = ((value >= 0)?value:0);
			this.addBend(sequence,track,pointStart,value,channel);
			if(points.length > (i + 1)) {
				var nextPoint = points[i + 1];
				var nextValue = Math.round(64 + (nextPoint.value * (2.75 * 2)));
				var nextPointStart = start + nextPoint.GetTime(duration);
				if(nextValue != value) {
					var width = (nextPointStart - pointStart) / Math.abs(nextValue - value);
					if(value < nextValue) {
						while(value < nextValue) {
							value++;
							pointStart += Math.round(width);
							this.addBend(sequence,track,pointStart,((value <= 127)?value:127),channel);
						}
					}
					else if(value > nextValue) {
						while(value > nextValue) {
							value += -1;
							pointStart += Math.round(pointStart + width);
							this.addBend(sequence,track,pointStart,((value >= 0)?value:0),channel);
						}
					}
				}
			}
		}
	}
	this.addBend(sequence,track,start + duration,64,channel);
}
net.alphatab.midi.MidiSequenceParser.prototype.makeVibrato = function(sequence,track,start,duration,channel) {
	var nextStart = start;
	var end = nextStart + duration;
	while(nextStart < end) {
		nextStart = (((nextStart + 160) > end)?end:(nextStart + 160));
		this.addBend(sequence,track,nextStart,64,channel);
		nextStart = (((nextStart + 160) > end)?end:(nextStart + 160));
		this.addBend(sequence,track,nextStart,Math.round(64 + (2.75 / 2.0)),channel);
	}
	this.addBend(sequence,track,nextStart,64,channel);
}
net.alphatab.midi.MidiSequenceParser.prototype.newDuration = function(value) {
	var duration = this._factory.newDuration();
	duration.value = (value);
	return duration;
}
net.alphatab.midi.MidiSequenceParser.prototype.parse = function(sequence) {
	this._infoTrack = sequence.infoTrack;
	this._metronomeTrack = sequence.metronomeTrack;
	this.addDefaultMessages(sequence);
	{
		var _g1 = 0, _g = this._song.tracks.length;
		while(_g1 < _g) {
			var i = _g1++;
			var songTrack = this._song.tracks[i];
			this.createTrack(sequence,songTrack);
		}
	}
	sequence.notifyFinish();
}
net.alphatab.midi.MidiSequenceParser.prototype.__class__ = net.alphatab.midi.MidiSequenceParser;
net.alphatab.model.HeaderFooterElements = function() { }
net.alphatab.model.HeaderFooterElements.__name__ = ["net","alphatab","model","HeaderFooterElements"];
net.alphatab.model.HeaderFooterElements.prototype.__class__ = net.alphatab.model.HeaderFooterElements;
haxe.Http = function(url) { if( url === $_ ) return; {
	this.url = url;
	this.headers = new Hash();
	this.params = new Hash();
	this.async = true;
}}
haxe.Http.__name__ = ["haxe","Http"];
haxe.Http.requestUrl = function(url) {
	var h = new haxe.Http(url);
	h.async = false;
	var r = null;
	h.onData = function(d) {
		r = d;
	}
	h.onError = function(e) {
		throw e;
	}
	h.request(false);
	return r;
}
haxe.Http.prototype.async = null;
haxe.Http.prototype.headers = null;
haxe.Http.prototype.onData = function(data) {
	null;
}
haxe.Http.prototype.onError = function(msg) {
	null;
}
haxe.Http.prototype.onStatus = function(status) {
	null;
}
haxe.Http.prototype.params = null;
haxe.Http.prototype.postData = null;
haxe.Http.prototype.request = function(post) {
	var me = this;
	var r = new js.XMLHttpRequest();
	var onreadystatechange = function() {
		if(r.readyState != 4) return;
		var s = (function($this) {
			var $r;
			try {
				$r = r.status;
			}
			catch( $e30 ) {
				{
					var e = $e30;
					$r = null;
				}
			}
			return $r;
		}(this));
		if(s == undefined) s = null;
		if(s != null) me.onStatus(s);
		if(s != null && s >= 200 && s < 400) me.onData(r.responseText);
		else switch(s) {
		case null:{
			me.onError("Failed to connect or resolve host");
		}break;
		case 12029:{
			me.onError("Failed to connect to host");
		}break;
		case 12007:{
			me.onError("Unknown host");
		}break;
		default:{
			me.onError("Http Error #" + r.status);
		}break;
		}
	}
	if(this.async) r.onreadystatechange = onreadystatechange;
	var uri = this.postData;
	if(uri != null) post = true;
	else { var $it31 = this.params.keys();
	while( $it31.hasNext() ) { var p = $it31.next();
	{
		if(uri == null) uri = "";
		else uri += "&";
		uri += (StringTools.urlDecode(p) + "=") + StringTools.urlEncode(this.params.get(p));
	}
	}}
	try {
		if(post) r.open("POST",this.url,this.async);
		else if(uri != null) {
			var question = this.url.split("?").length <= 1;
			r.open("GET",(this.url + ((question?"?":"&"))) + uri,this.async);
			uri = null;
		}
		else r.open("GET",this.url,this.async);
	}
	catch( $e32 ) {
		{
			var e = $e32;
			{
				this.onError(e.toString());
				return;
			}
		}
	}
	if(this.headers.get("Content-Type") == null && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	{ var $it33 = this.headers.keys();
	while( $it33.hasNext() ) { var h = $it33.next();
	r.setRequestHeader(h,this.headers.get(h));
	}}
	r.send(uri);
	if(!this.async) onreadystatechange();
}
haxe.Http.prototype.setHeader = function(header,value) {
	this.headers.set(header,value);
}
haxe.Http.prototype.setParameter = function(param,value) {
	this.params.set(param,value);
}
haxe.Http.prototype.setPostData = function(data) {
	this.postData = data;
}
haxe.Http.prototype.url = null;
haxe.Http.prototype.__class__ = haxe.Http;
net.alphatab.model.effects.HarmonicType = { __ename__ : ["net","alphatab","model","effects","HarmonicType"], __constructs__ : ["Natural","Artificial","Tapped","Pinch","Semi"] }
net.alphatab.model.effects.HarmonicType.Artificial = ["Artificial",1];
net.alphatab.model.effects.HarmonicType.Artificial.toString = $estr;
net.alphatab.model.effects.HarmonicType.Artificial.__enum__ = net.alphatab.model.effects.HarmonicType;
net.alphatab.model.effects.HarmonicType.Natural = ["Natural",0];
net.alphatab.model.effects.HarmonicType.Natural.toString = $estr;
net.alphatab.model.effects.HarmonicType.Natural.__enum__ = net.alphatab.model.effects.HarmonicType;
net.alphatab.model.effects.HarmonicType.Pinch = ["Pinch",3];
net.alphatab.model.effects.HarmonicType.Pinch.toString = $estr;
net.alphatab.model.effects.HarmonicType.Pinch.__enum__ = net.alphatab.model.effects.HarmonicType;
net.alphatab.model.effects.HarmonicType.Semi = ["Semi",4];
net.alphatab.model.effects.HarmonicType.Semi.toString = $estr;
net.alphatab.model.effects.HarmonicType.Semi.__enum__ = net.alphatab.model.effects.HarmonicType;
net.alphatab.model.effects.HarmonicType.Tapped = ["Tapped",2];
net.alphatab.model.effects.HarmonicType.Tapped.toString = $estr;
net.alphatab.model.effects.HarmonicType.Tapped.__enum__ = net.alphatab.model.effects.HarmonicType;
net.alphatab.model.SlideType = { __ename__ : ["net","alphatab","model","SlideType"], __constructs__ : ["FastSlideTo","SlowSlideTo","OutDownWards","OutUpWards","IntoFromBelow","IntoFromAbove"] }
net.alphatab.model.SlideType.FastSlideTo = ["FastSlideTo",0];
net.alphatab.model.SlideType.FastSlideTo.toString = $estr;
net.alphatab.model.SlideType.FastSlideTo.__enum__ = net.alphatab.model.SlideType;
net.alphatab.model.SlideType.IntoFromAbove = ["IntoFromAbove",5];
net.alphatab.model.SlideType.IntoFromAbove.toString = $estr;
net.alphatab.model.SlideType.IntoFromAbove.__enum__ = net.alphatab.model.SlideType;
net.alphatab.model.SlideType.IntoFromBelow = ["IntoFromBelow",4];
net.alphatab.model.SlideType.IntoFromBelow.toString = $estr;
net.alphatab.model.SlideType.IntoFromBelow.__enum__ = net.alphatab.model.SlideType;
net.alphatab.model.SlideType.OutDownWards = ["OutDownWards",2];
net.alphatab.model.SlideType.OutDownWards.toString = $estr;
net.alphatab.model.SlideType.OutDownWards.__enum__ = net.alphatab.model.SlideType;
net.alphatab.model.SlideType.OutUpWards = ["OutUpWards",3];
net.alphatab.model.SlideType.OutUpWards.toString = $estr;
net.alphatab.model.SlideType.OutUpWards.__enum__ = net.alphatab.model.SlideType;
net.alphatab.model.SlideType.SlowSlideTo = ["SlowSlideTo",1];
net.alphatab.model.SlideType.SlowSlideTo.toString = $estr;
net.alphatab.model.SlideType.SlowSlideTo.__enum__ = net.alphatab.model.SlideType;
net.alphatab.tablature.Tablature = function(source,msg) { if( source === $_ ) return; {
	if(msg == null) msg = "";
	this.canvas = net.alphatab.platform.PlatformFactory.getCanvas(source);
	this.track = null;
	this.songManager = new net.alphatab.model.SongManager(new net.alphatab.tablature.model.SongFactoryImpl());
	this.errorMessage = StringTools.trim(msg);
	if(this.errorMessage == "" || this.errorMessage == null) {
		this.errorMessage = "Please set a song's track to display the tablature";
	}
	this.viewLayout = new net.alphatab.tablature.PageViewLayout();
	this.viewLayout.setTablature(this);
	this.updateScale(1.0);
}}
net.alphatab.tablature.Tablature.__name__ = ["net","alphatab","tablature","Tablature"];
net.alphatab.tablature.Tablature.prototype._lastPosition = null;
net.alphatab.tablature.Tablature.prototype._lastRealPosition = null;
net.alphatab.tablature.Tablature.prototype._selectedBeat = null;
net.alphatab.tablature.Tablature.prototype._updateDisplay = null;
net.alphatab.tablature.Tablature.prototype._updateSong = null;
net.alphatab.tablature.Tablature.prototype.autoSizeWidth = null;
net.alphatab.tablature.Tablature.prototype.canvas = null;
net.alphatab.tablature.Tablature.prototype.doLayout = function() {
	if(this.track == null) return;
	haxe.Log.trace("Starting layouting",{ fileName : "Tablature.hx", lineNumber : 92, className : "net.alphatab.tablature.Tablature", methodName : "doLayout"});
	var size = this.viewLayout.layoutSize;
	if(!this.autoSizeWidth) {
		size.width = this.canvas.width() - this.viewLayout.contentPadding.getHorizontal();
	}
	this.viewLayout.prepareLayout(new net.alphatab.model.Rectangle(0,0,size.width,size.height),0,0);
	if(this.autoSizeWidth) this.canvas.setWidth(this.viewLayout.width);
	this.canvas.setHeight(this.viewLayout.height);
	haxe.Log.trace("Layouting finished",{ fileName : "Tablature.hx", lineNumber : 105, className : "net.alphatab.tablature.Tablature", methodName : "doLayout"});
}
net.alphatab.tablature.Tablature.prototype.errorMessage = null;
net.alphatab.tablature.Tablature.prototype.findBeat = function(measurePosition,playerPosition,measure) {
	if(measure != null) {
		{
			var _g = 0, _g1 = measure.beats;
			while(_g < _g1.length) {
				var beat = _g1[_g];
				++_g;
				var realBeat = measurePosition + (beat.start - measure.start());
				var voice = beat.voices[0];
				if(!voice.isEmpty && realBeat <= playerPosition && (realBeat + voice.duration.time()) > playerPosition) {
					return beat;
				}
			}
		}
		return this.songManager.getFirstBeat(measure.beats);
	}
	return null;
}
net.alphatab.tablature.Tablature.prototype.findMeasure = function(position) {
	var result = this.getMeasureAt(position);
	if(result.measure == null) {
		result.measure = this.songManager.getFirstMeasure(this.track);
	}
	return result;
}
net.alphatab.tablature.Tablature.prototype.getMeasureAt = function(tick) {
	var start = 960;
	var result = { measure : null, realPosition : start}
	var song = this.track.song;
	var controller = new net.alphatab.midi.MidiRepeatController(song);
	if(this._selectedBeat != null && tick > this._lastPosition) {
		controller.index = this._selectedBeat.measure.number() - 1;
		start = this._lastRealPosition;
	}
	while(!controller.finished()) {
		var header = song.measureHeaders[controller.index];
		controller.process();
		if(controller.shouldPlay) {
			var length = header.length();
			if(tick >= start && tick < (start + length)) {
				result.measure = this.track.measures[header.number - 1];
				result.realPosition = start;
				return result;
			}
			start += length;
		}
	}
	result.realPosition = start;
	return result;
}
net.alphatab.tablature.Tablature.prototype.invalidate = function() {
	this.canvas.clearRect(0,0,this.canvas.width(),this.canvas.height());
	this.onPaint();
}
net.alphatab.tablature.Tablature.prototype.isError = null;
net.alphatab.tablature.Tablature.prototype.notifyTickPosition = function(position) {
	position -= 960;
	if(position != this._lastPosition) {
		this._lastPosition = position;
		var result = this.findMeasure(position);
		var realPosition = result.realPosition;
		this._lastRealPosition = realPosition;
		var measure = result.measure;
		var beat = this.findBeat(realPosition,position,measure);
		if(measure != null && beat != null) {
			this._selectedBeat = beat;
			if(this.onCaretChanged != null) this.onCaretChanged(beat);
		}
	}
}
net.alphatab.tablature.Tablature.prototype.onCaretChanged = null;
net.alphatab.tablature.Tablature.prototype.onPaint = function() {
	this.paintBackground();
	if(this.track == null || this.isError) {
		var text = this.errorMessage;
		this.canvas.setFillStyle("#4e4e4e");
		this.canvas.setFont("20px 'Arial'");
		this.canvas.setTextBaseline("middle");
		this.canvas.fillText(text,20,30);
	}
	else if(this._updateDisplay) {
		var displayRect = new net.alphatab.model.Rectangle(0,0,this.canvas.width(),this.canvas.height());
		this.viewLayout.updateCache(this.canvas,displayRect,0,0);
		this._updateDisplay = false;
	}
	else {
		var displayRect = new net.alphatab.model.Rectangle(0,0,this.canvas.width(),this.canvas.height());
		this.viewLayout.paintCache(this.canvas,displayRect,0,0);
		this._updateDisplay = false;
	}
	haxe.Log.trace("Drawing Finished",{ fileName : "Tablature.hx", lineNumber : 133, className : "net.alphatab.tablature.Tablature", methodName : "onPaint"});
}
net.alphatab.tablature.Tablature.prototype.paintBackground = function() {
	var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
	this.canvas.setFillStyle("#4e4e4e");
	this.canvas.setFont(net.alphatab.tablature.drawing.DrawingResources.copyrightFont);
	this.canvas.setTextBaseline("top");
	var x = (this.canvas.width() - this.canvas.measureText(msg)) / 2;
	this.canvas.fillText(msg,x,this.canvas.height() - 15);
}
net.alphatab.tablature.Tablature.prototype.setTrack = function(track) {
	haxe.Log.trace("Updating Track",{ fileName : "Tablature.hx", lineNumber : 70, className : "net.alphatab.tablature.Tablature", methodName : "setTrack"});
	this.track = track;
	this._updateSong = true;
	this._updateDisplay = true;
	this.updateTablature();
	this.invalidate();
}
net.alphatab.tablature.Tablature.prototype.songManager = null;
net.alphatab.tablature.Tablature.prototype.track = null;
net.alphatab.tablature.Tablature.prototype.updateScale = function(scale) {
	net.alphatab.tablature.drawing.DrawingResources.init(scale);
	this.viewLayout.init(scale);
	this._updateSong = true;
	this._updateDisplay = true;
	this.updateTablature();
	this.invalidate();
}
net.alphatab.tablature.Tablature.prototype.updateTablature = function() {
	if(this.track == null) return;
	this.viewLayout.updateSong();
	this.doLayout();
	this._updateSong = false;
}
net.alphatab.tablature.Tablature.prototype.viewLayout = null;
net.alphatab.tablature.Tablature.prototype.__class__ = net.alphatab.tablature.Tablature;
net.alphatab.midi.MidiSequenceHandler = function(tracks) { if( tracks === $_ ) return; {
	this.infoTrack = 0;
	this.metronomeTrack = tracks - 1;
	this._commands = new Array();
}}
net.alphatab.midi.MidiSequenceHandler.__name__ = ["net","alphatab","midi","MidiSequenceHandler"];
net.alphatab.midi.MidiSequenceHandler.prototype._commands = null;
net.alphatab.midi.MidiSequenceHandler.prototype.addControlChange = function(tick,track,channel,controller,value) {
	this.addEvent(track,tick,net.alphatab.midi.MidiMessageUtils.controlChange(channel,controller,value));
}
net.alphatab.midi.MidiSequenceHandler.prototype.addEvent = function(track,tick,evt) {
	var command = (((net.alphatab.midi.MidiMessageUtils.intToString(track) + "|") + net.alphatab.midi.MidiMessageUtils.intToString(tick)) + "|") + evt;
	this._commands.push(command);
}
net.alphatab.midi.MidiSequenceHandler.prototype.addNoteOff = function(tick,track,channel,note,velocity) {
	this.addEvent(track,tick,net.alphatab.midi.MidiMessageUtils.noteOff(channel,note,velocity));
}
net.alphatab.midi.MidiSequenceHandler.prototype.addNoteOn = function(tick,track,channel,note,velocity) {
	this.addEvent(track,tick,net.alphatab.midi.MidiMessageUtils.noteOn(channel,note,velocity));
}
net.alphatab.midi.MidiSequenceHandler.prototype.addPitchBend = function(tick,track,channel,value) {
	this.addEvent(track,tick,net.alphatab.midi.MidiMessageUtils.pitchBend(channel,value));
}
net.alphatab.midi.MidiSequenceHandler.prototype.addProgramChange = function(tick,track,channel,instrument) {
	this.addEvent(track,tick,net.alphatab.midi.MidiMessageUtils.programChange(channel,instrument));
}
net.alphatab.midi.MidiSequenceHandler.prototype.addTempoInUSQ = function(tick,track,usq) {
	this.addEvent(track,tick,net.alphatab.midi.MidiMessageUtils.tempoInUSQ(usq));
}
net.alphatab.midi.MidiSequenceHandler.prototype.addTimeSignature = function(tick,track,timeSignature) {
	this.addEvent(track,tick,net.alphatab.midi.MidiMessageUtils.timeSignature(timeSignature));
}
net.alphatab.midi.MidiSequenceHandler.prototype.commands = null;
net.alphatab.midi.MidiSequenceHandler.prototype.infoTrack = null;
net.alphatab.midi.MidiSequenceHandler.prototype.metronomeTrack = null;
net.alphatab.midi.MidiSequenceHandler.prototype.notifyFinish = function() {
	this.commands = (net.alphatab.midi.MidiMessageUtils.intToString(this.metronomeTrack) + ";") + this._commands.join(";");
}
net.alphatab.midi.MidiSequenceHandler.prototype.__class__ = net.alphatab.midi.MidiSequenceHandler;
net.alphatab.midi.MidiSequenceParserFlags = function() { }
net.alphatab.midi.MidiSequenceParserFlags.__name__ = ["net","alphatab","midi","MidiSequenceParserFlags"];
net.alphatab.midi.MidiSequenceParserFlags.prototype.__class__ = net.alphatab.midi.MidiSequenceParserFlags;
net.alphatab.model.effects.GraceEffectTransition = { __ename__ : ["net","alphatab","model","effects","GraceEffectTransition"], __constructs__ : ["None","Slide","Bend","Hammer"] }
net.alphatab.model.effects.GraceEffectTransition.Bend = ["Bend",2];
net.alphatab.model.effects.GraceEffectTransition.Bend.toString = $estr;
net.alphatab.model.effects.GraceEffectTransition.Bend.__enum__ = net.alphatab.model.effects.GraceEffectTransition;
net.alphatab.model.effects.GraceEffectTransition.Hammer = ["Hammer",3];
net.alphatab.model.effects.GraceEffectTransition.Hammer.toString = $estr;
net.alphatab.model.effects.GraceEffectTransition.Hammer.__enum__ = net.alphatab.model.effects.GraceEffectTransition;
net.alphatab.model.effects.GraceEffectTransition.None = ["None",0];
net.alphatab.model.effects.GraceEffectTransition.None.toString = $estr;
net.alphatab.model.effects.GraceEffectTransition.None.__enum__ = net.alphatab.model.effects.GraceEffectTransition;
net.alphatab.model.effects.GraceEffectTransition.Slide = ["Slide",1];
net.alphatab.model.effects.GraceEffectTransition.Slide.toString = $estr;
net.alphatab.model.effects.GraceEffectTransition.Slide.__enum__ = net.alphatab.model.effects.GraceEffectTransition;
haxe.remoting.ExternalConnection = function(data,path) { if( data === $_ ) return; {
	this.__data = data;
	this.__path = path;
}}
haxe.remoting.ExternalConnection.__name__ = ["haxe","remoting","ExternalConnection"];
haxe.remoting.ExternalConnection.escapeString = function(s) {
	return s;
}
haxe.remoting.ExternalConnection.doCall = function(name,path,params) {
	try {
		var cnx = haxe.remoting.ExternalConnection.connections.get(name);
		if(cnx == null) throw "Unknown connection : " + name;
		if(cnx.__data.ctx == null) throw "No context shared for the connection " + name;
		var params1 = new haxe.Unserializer(params).unserialize();
		var ret = cnx.__data.ctx.call(path.split("."),params1);
		var s = new haxe.Serializer();
		s.serialize(ret);
		return s.toString() + "#";
	}
	catch( $e34 ) {
		{
			var e = $e34;
			{
				var s = new haxe.Serializer();
				s.serializeException(e);
				return s.toString();
			}
		}
	}
}
haxe.remoting.ExternalConnection.flashConnect = function(name,flashObjectID,ctx) {
	var cnx = new haxe.remoting.ExternalConnection({ ctx : ctx, name : name, flash : flashObjectID},[]);
	haxe.remoting.ExternalConnection.connections.set(name,cnx);
	return cnx;
}
haxe.remoting.ExternalConnection.prototype.__data = null;
haxe.remoting.ExternalConnection.prototype.__path = null;
haxe.remoting.ExternalConnection.prototype.call = function(params) {
	var s = new haxe.Serializer();
	s.serialize(params);
	var params1 = s.toString();
	var data = null;
	var fobj = window.document[this.__data.flash];
	if(fobj == null) fobj = window.document.getElementById[this.__data.flash];
	if(fobj == null) throw ("Could not find flash object '" + this.__data.flash) + "'";
	try {
		data = fobj.externalRemotingCall(this.__data.name,this.__path.join("."),params1);
	}
	catch( $e35 ) {
		{
			var e = $e35;
			null;
		}
	}
	if(data == null) throw "Call failure : ExternalConnection is not " + "initialized in Flash";
	return new haxe.Unserializer(data).unserialize();
}
haxe.remoting.ExternalConnection.prototype.close = function() {
	haxe.remoting.ExternalConnection.connections.remove(this.__data.name);
}
haxe.remoting.ExternalConnection.prototype.resolve = function(field) {
	var e = new haxe.remoting.ExternalConnection(this.__data,this.__path.copy());
	e.__path.push(field);
	return e;
}
haxe.remoting.ExternalConnection.prototype.__class__ = haxe.remoting.ExternalConnection;
haxe.remoting.ExternalConnection.__interfaces__ = [haxe.remoting.Connection];
net.alphatab.model.MidiChannel = function(p) { if( p === $_ ) return; {
	this.channel = 0;
	this.effectChannel = 0;
	this.instrument(25);
	this.volume = 127;
	this.balance = 64;
	this.chorus = 0;
	this.reverb = 0;
	this.phaser = 0;
	this.tremolo = 0;
}}
net.alphatab.model.MidiChannel.__name__ = ["net","alphatab","model","MidiChannel"];
net.alphatab.model.MidiChannel.prototype._instrument = null;
net.alphatab.model.MidiChannel.prototype.balance = null;
net.alphatab.model.MidiChannel.prototype.channel = null;
net.alphatab.model.MidiChannel.prototype.chorus = null;
net.alphatab.model.MidiChannel.prototype.copy = function(channel) {
	channel.channel = this.channel;
	channel.effectChannel = this.effectChannel;
	channel.instrument(this.instrument());
	channel.volume = this.volume;
	channel.balance = this.balance;
	channel.chorus = this.chorus;
	channel.reverb = this.reverb;
	channel.phaser = this.phaser;
	channel.tremolo = this.tremolo;
}
net.alphatab.model.MidiChannel.prototype.effectChannel = null;
net.alphatab.model.MidiChannel.prototype.instrument = function(newInstrument) {
	if(newInstrument == null) newInstrument = -1;
	if(newInstrument != -1) this._instrument = newInstrument;
	return (this.isPercussionChannel()?0:this._instrument);
}
net.alphatab.model.MidiChannel.prototype.isPercussionChannel = function() {
	return this.channel == 9;
}
net.alphatab.model.MidiChannel.prototype.phaser = null;
net.alphatab.model.MidiChannel.prototype.reverb = null;
net.alphatab.model.MidiChannel.prototype.tremolo = null;
net.alphatab.model.MidiChannel.prototype.volume = null;
net.alphatab.model.MidiChannel.prototype.__class__ = net.alphatab.model.MidiChannel;
net.alphatab.platform.js.Html5Canvas = function(dom) { if( dom === $_ ) return; {
	this._canvas = dom;
	this._jCanvas = (jQuery(dom));
	this._context = dom.getContext("2d");
}}
net.alphatab.platform.js.Html5Canvas.__name__ = ["net","alphatab","platform","js","Html5Canvas"];
net.alphatab.platform.js.Html5Canvas.prototype._canvas = null;
net.alphatab.platform.js.Html5Canvas.prototype._context = null;
net.alphatab.platform.js.Html5Canvas.prototype._jCanvas = null;
net.alphatab.platform.js.Html5Canvas.prototype.arc = function(x,y,radius,startAngle,endAngle,anticlockwise) {
	this._context.arc(x,y,radius,startAngle,endAngle,anticlockwise);
}
net.alphatab.platform.js.Html5Canvas.prototype.arcTo = function(x1,y1,x2,y2,radius) {
	this._context.arcTo(x1,y1,x2,y2,radius);
}
net.alphatab.platform.js.Html5Canvas.prototype.beginPath = function() {
	this._context.beginPath();
}
net.alphatab.platform.js.Html5Canvas.prototype.bezierCurveTo = function(cp1x,cp1y,cp2x,cp2y,x,y) {
	this._context.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);
}
net.alphatab.platform.js.Html5Canvas.prototype.clearRect = function(x,y,w,h) {
	this._context.clearRect(x,y,w,h);
}
net.alphatab.platform.js.Html5Canvas.prototype.closePath = function() {
	this._context.closePath();
}
net.alphatab.platform.js.Html5Canvas.prototype.fill = function() {
	this._context.fill();
}
net.alphatab.platform.js.Html5Canvas.prototype.fillRect = function(x,y,w,h) {
	this._context.fillRect(x,y,w,h);
}
net.alphatab.platform.js.Html5Canvas.prototype.fillStyle = null;
net.alphatab.platform.js.Html5Canvas.prototype.fillText = function(text,x,y,maxWidth) {
	if(maxWidth == null) maxWidth = 0;
	if(maxWidth == 0) {
		this._context.fillText(text,x,y);
	}
	else {
		this._context.fillText(text,x,y,maxWidth);
	}
}
net.alphatab.platform.js.Html5Canvas.prototype.font = null;
net.alphatab.platform.js.Html5Canvas.prototype.getFillStyle = function() {
	return this._context.fillStyle;
}
net.alphatab.platform.js.Html5Canvas.prototype.getFont = function() {
	return this._context.font;
}
net.alphatab.platform.js.Html5Canvas.prototype.getLineWidth = function() {
	return this._context.lineWidth;
}
net.alphatab.platform.js.Html5Canvas.prototype.getStrokeStyle = function() {
	return this._context.strokeStyle;
}
net.alphatab.platform.js.Html5Canvas.prototype.getTextAlign = function() {
	return this._context.textAlign;
}
net.alphatab.platform.js.Html5Canvas.prototype.getTextBaseline = function() {
	return this._context.textBaseline;
}
net.alphatab.platform.js.Html5Canvas.prototype.height = function() {
	return this._jCanvas.height();
}
net.alphatab.platform.js.Html5Canvas.prototype.lineTo = function(x,y) {
	this._context.lineTo(x,y);
}
net.alphatab.platform.js.Html5Canvas.prototype.lineWidth = null;
net.alphatab.platform.js.Html5Canvas.prototype.measureText = function(text) {
	return this._context.measureText(text).width;
}
net.alphatab.platform.js.Html5Canvas.prototype.moveTo = function(x,y) {
	this._context.moveTo(x,y);
}
net.alphatab.platform.js.Html5Canvas.prototype.quadraticCurveTo = function(cpx,cpy,x,y) {
	this._context.quadraticCurveTo(cpx,cpy,x,y);
}
net.alphatab.platform.js.Html5Canvas.prototype.rect = function(x,y,w,h) {
	this._context.rect(x,y,w,h);
}
net.alphatab.platform.js.Html5Canvas.prototype.setFillStyle = function(value) {
	this._context.fillStyle = value;
	return this._context.fillStyle;
}
net.alphatab.platform.js.Html5Canvas.prototype.setFont = function(value) {
	this._context.font = value;
	return this._context.font;
}
net.alphatab.platform.js.Html5Canvas.prototype.setHeight = function(height) {
	this._jCanvas.height(height);
	this._canvas.height = height;
	this._context = this._canvas.getContext("2d");
}
net.alphatab.platform.js.Html5Canvas.prototype.setLineWidth = function(value) {
	this._context.lineWidth = value;
	return this._context.lineWidth;
}
net.alphatab.platform.js.Html5Canvas.prototype.setStrokeStyle = function(value) {
	this._context.strokeStyle = value;
	return this._context.strokeStyle;
}
net.alphatab.platform.js.Html5Canvas.prototype.setTextAlign = function(value) {
	this._context.textAlign = value;
	return this._context.textAling;
}
net.alphatab.platform.js.Html5Canvas.prototype.setTextBaseline = function(value) {
	this._context.textBaseline = value;
	return this._context.textBaseLine;
}
net.alphatab.platform.js.Html5Canvas.prototype.setWidth = function(width) {
	this._jCanvas.width(width);
	this._canvas.width = width;
	this._context = this._canvas.getContext("2d");
}
net.alphatab.platform.js.Html5Canvas.prototype.stroke = function() {
	this._context.stroke();
}
net.alphatab.platform.js.Html5Canvas.prototype.strokeRect = function(x,y,w,h) {
	this._context.strokeRect(x,y,w,h);
}
net.alphatab.platform.js.Html5Canvas.prototype.strokeStyle = null;
net.alphatab.platform.js.Html5Canvas.prototype.strokeText = function(text,x,y,maxWidth) {
	if(maxWidth == null) maxWidth = 0;
	if(maxWidth == 0) {
		this._context.strokeText(text,x,y);
	}
	else {
		this._context.strokeText(text,x,y,maxWidth);
	}
}
net.alphatab.platform.js.Html5Canvas.prototype.textAlign = null;
net.alphatab.platform.js.Html5Canvas.prototype.textBaseline = null;
net.alphatab.platform.js.Html5Canvas.prototype.width = function() {
	return this._jCanvas.width();
}
net.alphatab.platform.js.Html5Canvas.prototype.__class__ = net.alphatab.platform.js.Html5Canvas;
net.alphatab.platform.js.Html5Canvas.__interfaces__ = [net.alphatab.platform.Canvas];
$Main = function() { }
$Main.__name__ = ["@Main"];
$Main.prototype.__class__ = $Main;
$_ = {}
js.Boot.__res = {}
js.Boot.__init();
{
	js.Lib.document = document;
	js.Lib.window = window;
	onerror = function(msg,url,line) {
		var f = js.Lib.onerror;
		if( f == null )
			return false;
		return f(msg,[url+":"+line]);
	}
}
{
	Date.now = function() {
		return new Date();
	}
	Date.fromTime = function(t) {
		var d = new Date();
		d["setTime"](t);
		return d;
	}
	Date.fromString = function(s) {
		switch(s.length) {
		case 8:{
			var k = s.split(":");
			var d = new Date();
			d["setTime"](0);
			d["setUTCHours"](k[0]);
			d["setUTCMinutes"](k[1]);
			d["setUTCSeconds"](k[2]);
			return d;
		}break;
		case 10:{
			var k = s.split("-");
			return new Date(k[0],k[1] - 1,k[2],0,0,0);
		}break;
		case 19:{
			var k = s.split(" ");
			var y = k[0].split("-");
			var t = k[1].split(":");
			return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
		}break;
		default:{
			throw "Invalid date format : " + s;
		}break;
		}
	}
	Date.prototype["toString"] = function() {
		var date = this;
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var mi = date.getMinutes();
		var s = date.getSeconds();
		return (((((((((date.getFullYear() + "-") + ((m < 10?"0" + m:"" + m))) + "-") + ((d < 10?"0" + d:"" + d))) + " ") + ((h < 10?"0" + h:"" + h))) + ":") + ((mi < 10?"0" + mi:"" + mi))) + ":") + ((s < 10?"0" + s:"" + s));
	}
	Date.prototype.__class__ = Date;
	Date.__name__ = ["Date"];
}
{
	Math.NaN = Number["NaN"];
	Math.NEGATIVE_INFINITY = Number["NEGATIVE_INFINITY"];
	Math.POSITIVE_INFINITY = Number["POSITIVE_INFINITY"];
	Math.isFinite = function(i) {
		return isFinite(i);
	}
	Math.isNaN = function(i) {
		return isNaN(i);
	}
	Math.__name__ = ["Math"];
}
{
	js["XMLHttpRequest"] = (window.XMLHttpRequest?XMLHttpRequest:(window.ActiveXObject?function() {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch( $e36 ) {
			{
				var e = $e36;
				{
					try {
						return new ActiveXObject("Microsoft.XMLHTTP");
					}
					catch( $e37 ) {
						{
							var e1 = $e37;
							{
								throw "Unable to create XMLHttpRequest object.";
							}
						}
					}
				}
			}
		}
	}:(function($this) {
		var $r;
		throw "Unable to create XMLHttpRequest object.";
		return $r;
	}(this))));
}
{
	String.prototype.__class__ = String;
	String.__name__ = ["String"];
	Array.prototype.__class__ = Array;
	Array.__name__ = ["Array"];
	Int = { __name__ : ["Int"]}
	Dynamic = { __name__ : ["Dynamic"]}
	Float = Number;
	Float.__name__ = ["Float"];
	Bool = { __ename__ : ["Bool"]}
	Class = { __name__ : ["Class"]}
	Enum = { }
	Void = { __ename__ : ["Void"]}
}
net.alphatab.tablature.model.ChordImpl.MAX_FRETS = 6;
net.alphatab.model.Lyrics.MAX_LINE_COUNT = 5;
net.alphatab.model.MeasureHeader.DEFAULT_KEY_SIGNATURE = 0;
net.alphatab.file.alphatex.AlphaTexParser.EOL = String.fromCharCode(0);
net.alphatab.file.alphatex.AlphaTexParser.TRACK_CHANNELS = [0,1];
net.alphatab.file.alphatex.AlphaTexParser.TUNING_REGEX = new EReg("([a-g]b?)([0-9])","i");
net.alphatab.model.Velocities.MIN_VELOCITY = 15;
net.alphatab.model.Velocities.VELOCITY_INCREMENT = 16;
net.alphatab.model.Velocities.PIANO_PIANISSIMO = 15;
net.alphatab.model.Velocities.PIANISSIMO = 31;
net.alphatab.model.Velocities.PIANO = 47;
net.alphatab.model.Velocities.MEZZO_PIANO = 63;
net.alphatab.model.Velocities.MEZZO_FORTE = 79;
net.alphatab.model.Velocities.FORTE = 95;
net.alphatab.model.Velocities.FORTISSIMO = 111;
net.alphatab.model.Velocities.FORTE_FORTISSIMO = 127;
net.alphatab.model.Velocities.DEFAULT = 95;
net.alphatab.file.guitarpro.GpReaderBase.DEFAULT_CHARSET = "UTF-8";
net.alphatab.file.guitarpro.GpReaderBase.BEND_POSITION = 60;
net.alphatab.file.guitarpro.GpReaderBase.BEND_SEMITONE = 25;
net.alphatab.model.Color.Black = new net.alphatab.model.Color(0,0,0);
net.alphatab.model.Color.Red = new net.alphatab.model.Color(255,0,0);
net.alphatab.model.Marker.DEFAULT_COLOR = new net.alphatab.model.Color(255,0,0);
net.alphatab.model.Marker.DEFAULT_TITLE = "Untitled";
net.alphatab.model.PageSetup._defaults = null;
net.alphatab.model.Beat.MAX_VOICES = 2;
net.alphatab.model.effects.TremoloBarEffect.MAX_POSITION = 12;
net.alphatab.model.effects.TremoloBarEffect.MAX_VALUE = 12;
js.Lib.onerror = null;
net.alphatab.midi.MidiMessageUtils.TICK_MOVE = 1;
net.alphatab.model.Measure.DEFAULT_CLEF = net.alphatab.model.MeasureClef.Treble;
net.alphatab.tablature.model.MeasureImpl.NATURAL = 1;
net.alphatab.tablature.model.MeasureImpl.SHARP = 2;
net.alphatab.tablature.model.MeasureImpl.FLAT = 3;
net.alphatab.tablature.model.MeasureImpl.KEY_SIGNATURES = (function($this) {
	var $r;
	var a = new Array();
	a.push([1,1,1,1,1,1,1]);
	a.push([1,1,1,2,1,1,1]);
	a.push([2,1,1,2,1,1,1]);
	a.push([2,1,1,2,2,1,1]);
	a.push([2,2,1,2,2,1,1]);
	a.push([2,2,1,2,2,2,1]);
	a.push([2,2,2,2,2,2,1]);
	a.push([2,2,2,2,2,2,2]);
	a.push([1,1,1,1,1,1,3]);
	a.push([1,1,3,1,1,1,3]);
	a.push([1,1,3,1,1,3,3]);
	a.push([1,3,3,1,1,3,3]);
	a.push([1,3,3,1,3,3,3]);
	a.push([3,3,3,1,3,3,3]);
	a.push([3,3,3,3,3,3,3]);
	$r = a;
	return $r;
}(this));
net.alphatab.tablature.model.MeasureImpl.ACCIDENTAL_SHARP_NOTES = [0,0,1,1,2,3,3,4,4,5,5,6];
net.alphatab.tablature.model.MeasureImpl.ACCIDENTAL_FLAT_NOTES = [0,1,1,2,2,3,4,4,5,5,6,6];
net.alphatab.tablature.model.MeasureImpl.ACCIDENTAL_NOTES = [false,true,false,true,false,false,true,false,true,false,true,false];
net.alphatab.tablature.model.MeasureImpl.SCORE_KEY_OFFSETS = [30,18,22,24];
net.alphatab.tablature.model.MeasureImpl.SCORE_KEYSHARP_POSITIONS = [1,4,0,3,6,2,5];
net.alphatab.tablature.model.MeasureImpl.SCORE_KEYFLAT_POSITIONS = [5,2,6,3,0,4,1];
net.alphatab.tablature.model.MeasureImpl.DEFAULT_CLEF_SPACING = 40;
net.alphatab.tablature.model.MeasureImpl.DEFAULT_QUARTER_SPACING = 30;
net.alphatab.tablature.model.MeasureHeaderImpl.DEFAULT_TIME_SIGNATURE_SPACING = 30;
net.alphatab.tablature.model.MeasureHeaderImpl.DEFAULT_LEFT_SPACING = 15;
net.alphatab.tablature.model.MeasureHeaderImpl.DEFAULT_RIGHT_SPACING = 15;
net.alphatab.tablature.PageViewLayout.PAGE_PADDING = new net.alphatab.model.Padding(20,40,20,40);
net.alphatab.tablature.PageViewLayout.WIDTH_ON_100 = 795;
net.alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS = [55,40,40,50];
net.alphatab.tablature.model.BeatGroup.SCORE_SHARP_POSITIONS = [7,7,6,6,5,4,4,3,3,2,2,1];
net.alphatab.tablature.model.BeatGroup.SCORE_FLAT_POSITIONS = [7,6,6,5,5,4,3,3,2,2,1,1];
net.alphatab.tablature.model.BeatGroup.UP_OFFSET = 28;
net.alphatab.tablature.model.BeatGroup.DOWN_OFFSET = 35;
net.alphatab.midi.MidiController.ALL_NOTES_OFF = 123;
net.alphatab.midi.MidiController.BALANCE = 10;
net.alphatab.midi.MidiController.CHORUS = 93;
net.alphatab.midi.MidiController.DATA_ENTRY_LSB = 38;
net.alphatab.midi.MidiController.DATA_ENTRY_MSB = 6;
net.alphatab.midi.MidiController.EXPRESSION = 11;
net.alphatab.midi.MidiController.PHASER = 95;
net.alphatab.midi.MidiController.REVERB = 91;
net.alphatab.midi.MidiController.RPN_LSB = 100;
net.alphatab.midi.MidiController.RPN_MBS = 101;
net.alphatab.midi.MidiController.TREMOLO = 92;
net.alphatab.midi.MidiController.VOLUME = 7;
haxe.Serializer.USE_CACHE = false;
haxe.Serializer.USE_ENUM_INDEX = false;
haxe.Serializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.Template.splitter = new EReg("(::[A-Za-z0-9_ ()&|!+=/><*.\"-]+::|\\$\\$([A-Za-z0-9_-]+)\\()","");
haxe.Template.expr_splitter = new EReg("(\\(|\\)|[ \\r\\n\\t]*\"[^\"]*\"[ \\r\\n\\t]*|[!+=/><*.&|-]+)","");
haxe.Template.expr_trim = new EReg("^[ ]*([^ ]+)[ ]*$","");
haxe.Template.expr_int = new EReg("^[0-9]+$","");
haxe.Template.expr_float = new EReg("^([+-]?)(?=\\d|,\\d)\\d*(,\\d*)?([Ee]([+-]?\\d+))?$","");
haxe.Template.globals = { }
net.alphatab.tablature.drawing.MusicFont.Num1 = "m 2.3558283 14.478528 c 0 -3.869121 0 -7.7382417 0 -11.6073626 C 1.6850716 4.1472391 1.014315 5.4233127 0.3435583 6.6993864 0.23191928 6.5423429 -0.10604336 6.439333 0.06075867 6.2158133 0.82578188 4.1438755 1.5908051 2.0719377 2.3558283 -8.0383301e-8 c 1.0879346 0 2.1758693 0 3.2638039 0 0 4.809816380383301 0 9.6196326803833 0 14.429449080383301 0.1077951 0.725443 1.0036243 0.746673 1.5705522 0.858895 0 0.237219 0 0.474437 0 0.711656 -2.1267895 0 -4.2535789 0 -6.38036838 0 0 -0.220859 0 -0.441717 0 -0.662576 C 1.3353338 15.215366 1.9849267 15.201643 2.3052148 14.697852 l 0.03796 -0.106211 0.012653 -0.113113 0 0 z";
net.alphatab.tablature.drawing.MusicFont.Num2 = "M 3.8518519 1.1111111 C 3.3212005 1.2055492 2.0979942 1.3696935 2.2716047 2.0679013 2.669571 2.4800025 3.6152816 2.0837478 4.0277778 2.6929012 4.7473311 3.6027515 4.5385783 5.1332314 3.5401235 5.7669753 2.4715938 6.5523809 0.69737717 5.9798821 0.41657021 4.6466049 0.08056126 3.1622487 0.98721862 1.681575 2.2025463 0.88541667 3.4685672 -0.05074007 5.1347901 -0.14719514 6.6331019 0.14236111 8.3505577 0.44395045 10.171957 1.4451403 10.711854 3.2079717 11.087162 4.3587226 10.771688 5.6749029 9.9071665 6.5243056 8.8812935 7.6201246 7.4456873 8.160794 6.2109134 8.9703415 5.2883812 9.4846689 4.4003005 10.073319 3.6898148 10.864583 3.1467046 11.405283 2.7524457 12.064064 2.3209877 12.691358 3.5781645 11.96286 5.151162 11.471963 6.558642 12.080247 c 0.9487942 0.306219 1.6134731 1.07337 2.4228395 1.604938 0.8026505 0.432892 1.8788535 -0.183354 2.0385805 -1.057099 0.136432 -0.37519 -0.0766 -1.045877 0.510802 -0.875 -0.0039 1.342158 -0.223931 2.911218 -1.384066 3.762539 -1.2797677 0.83715 -2.9760745 0.490717 -4.2146269 -0.253906 -1.0674136 -0.686358 -2.2346377 -1.518673 -3.5791618 -1.309751 -0.696536 0.03707 -1.54843473 0.403428 -1.54841825 1.210937 0.0314567 0.512668 -0.25474524 0.64228 -0.69014292 0.56549 C -0.1276423 15.353417 0.24022277 14.471103 0.45900849 13.968943 1.4581028 11.790553 3.3501335 10.235414 4.9608968 8.5254645 6.0232321 7.3706805 7.1877722 6.2598992 7.9414786 4.8680797 8.1753674 4.2405344 7.9880474 3.5259425 7.753219 2.9221161 7.1027089 1.4354876 5.3026813 1.0999458 3.8518519 1.1111111 z";
net.alphatab.tablature.drawing.MusicFont.Num3 = "M 3.2155158 8.2944785 C 3.2309405 8.0135473 3.0965532 7.6187224 3.5407492 7.7177914 4.4939063 7.4256334 5.4604213 7.0597866 6.2583471 6.4493865 7.1004809 5.7778881 7.293324 4.611226 7.0469806 3.6110046 6.726654 2.0656917 5.232257 0.71393181 3.5975116 0.92216258 2.8915973 0.96932933 2.1521428 1.227227 1.7182145 1.8159509 1.7397609 2.67667 3.0050693 2.047208 3.2960571 2.8393405 3.6678006 3.5309167 3.6940413 4.5105692 3.1546542 5.1241373 2.5493574 5.6777576 1.5847581 5.7126744 0.849519 5.422546 0.00953804 5.03099 -0.05820898 3.9538777 0.02996328 3.1486052 0.12952908 1.8447312 1.1180958 0.72240537 2.3652296 0.37384969 3.5779763 0.01683359 4.8804939 -0.09260661 6.1334121 0.08282209 8.2284594 0.47645379 10.007194 2.4119089 9.9656442 4.5889571 9.9870525 5.5351117 9.7120246 6.560585 8.9013483 7.1321894 8.5544353 7.5053166 7.7015912 7.793743 7.5119629 8.0308426 8.5798463 8.4380846 9.5874007 9.2370078 9.8400621 10.404621 10.244809 11.960966 9.693204 13.702926 8.4525462 14.731859 7.4200455 15.702146 5.9664206 16.117642 4.5701437 15.985046 3.132047 15.915553 1.4837688 15.61919 0.59169095 14.365702 -0.03559453 13.451603 -0.17450915 12.20732 0.19723031 11.16967 0.58453839 10.38451 1.618036 10.329563 2.3762561 10.463574 c 0.7245709 0.09876 1.2111158 0.799856 1.1811525 1.507381 0.048396 0.669488 -0.1849767 1.544601 -0.9537191 1.666986 -0.4367972 0.08484 -1.0080132 -0.03336 -0.6860393 0.572182 0.4250322 0.698248 1.4731985 0.831136 2.2515128 0.828892 C 5.8047364 14.902128 7.1372887 13.370272 7.1831099 11.749641 7.332666 10.641101 6.5959268 9.6191273 5.6380831 9.1360238 4.9026333 8.7510236 4.1332794 8.36348 3.292463 8.3050893 c -0.025649 -0.00354 -0.051298 -0.00707 -0.076947 -0.010611 z";
net.alphatab.tablature.drawing.MusicFont.Num4 = "M 8.5889571 0 C 7.1913374 2.3253162 5.9025311 4.7249743 4.3205522 6.9332822 3.597506 7.9438957 2.9613238 9.0158992 2.2739494 10.051727 c -0.3244453 0.502185 -0.6488906 1.00437 -0.9733359 1.506555 1.390593 0 2.7811861 0 4.1717791 0 0 -1.7259713 0 -3.4519426 0 -5.1779139 C 6.6503067 5.398773 7.8282209 4.4171779 9.006135 3.4355828 c 0 2.7075664 0 5.4151328 0 8.1226992 0.4989773 0 0.997955 0 1.496932 0 0 0.237219 0 0.474438 0 0.711657 -0.498977 0 -0.9979547 0 -1.496932 0 0.069755 0.797423 -0.1298107 1.72084 0.3209355 2.422546 0.2578004 0.439549 1.1146275 0.336477 1.1759965 0.787252 -0.0466 0.190617 0.136581 0.611019 -0.191393 0.520263 -2.1447914 0 -4.2895823 0 -6.4343732 0 0 -0.237219 0 -0.474437 0 -0.711656 0.5451764 -0.203601 1.4559136 -0.313074 1.4812119 -1.052531 0.052113 -0.654366 0.056376 -1.311719 0.1138809 -1.965874 -1.8241312 0 -3.6482624 0 -5.4723936 0 C 0 12.03272 0 11.795501 0 11.558282 1.6905267 10.369362 2.7709967 8.4849333 3.381141 6.5467731 3.7856852 4.3633467 4.1965245 2.181087 4.6134969 0 5.9386503 0 7.2638037 0 8.5889571 0 z";
net.alphatab.tablature.drawing.MusicFont.Num5 = "M 0.66461538 0 C 1.7640676 0.31916703 2.91814 0.4515236 4.0577884 0.55 5.573813 0.61431673 7.0992166 0.43380573 8.5661538 0.04923077 8.5914097 0.92074753 8.3653002 1.8762312 7.6176923 2.4111538 7.004211 2.8775693 6.1817557 2.8901508 5.4469231 2.9994231 4.2387741 3.0738407 3.0111916 2.9746633 1.8334615 2.6953846 1.4772731 2.4005566 1.6756117 3.0052802 1.6246154 3.2168802 c 0 1.2661681 0 2.5323363 0 3.7985044 0.8204751 -0.932548 2.0542683 -1.534121 3.3124279 -1.3924759 1.749027 0.03761 3.5543077 1.0038165 4.2247355 2.6785576 C 9.9382625 10.333239 9.2190482 12.718388 7.7252283 14.23494 6.6058416 15.470168 4.9188137 16.14343 3.2553846 15.987692 2.0306114 15.883715 0.67270131 15.283287 0.2523077 14.036923 -0.01758379 13.190177 -0.16331163 12.195069 0.24923077 11.370769 0.7260813 10.530552 1.8744274 10.468536 2.7107692 10.698461 3.5320038 10.904838 3.8732189 11.820484 3.7859615 12.591731 3.795648 13.310634 3.3296848 14.067816 2.56 14.129231 2.1783218 14.27883 1.6070493 14.492822 2.2169231 14.783077 3.2361551 15.47902 4.7990457 15.506884 5.6953846 14.58 6.8935844 13.387502 7.0666029 11.565771 6.9967548 9.962524 6.89274 8.7501025 6.3683376 7.4111715 5.2225 6.8382693 3.9731664 6.2872114 2.3692901 6.7981838 1.6807692 7.9844952 1.5254234 8.1708492 1.1893344 8.0301392 0.95515854 8.0738462 0.62189393 8.1738923 0.64397412 7.9185935 0.66461538 7.6647337 c 0 -2.5549113 0 -5.1098225 0 -7.6647337 z";
net.alphatab.tablature.drawing.MusicFont.Num6 = "M 7.92988 1.5301374 C 7.5559869 0.84608229 6.7083616 0.49456481 5.9441335 0.52438467 4.821997 0.55635632 4.180382 1.6634534 3.8809179 2.6169155 3.3533512 4.3215839 3.1534367 6.1642279 3.4921307 7.9252792 3.5406113 8.3733919 3.9213656 8.6272992 4.125628 8.1171258 5.0603278 7.0709153 6.654335 6.7183222 7.9720267 7.1395109 9.4191407 7.7106546 10.22689 9.2876967 10.369411 10.771524 10.529983 12.368401 9.9773228 14.106414 8.6302977 15.063323 6.8137672 16.443503 3.9581271 16.306063 2.3905508 14.600309 0.90254943 12.970312 0.18775848 10.752828 0.03648959 8.5800181 -0.1773569 6.2799857 0.55665134 3.9259143 2.0300215 2.1484486 3.0352587 0.85536773 4.5975951 -0.10930661 6.2827484 0.00997444 7.5902069 0.01696655 8.9720911 0.64096552 9.5353936 1.8807668 9.9836728 2.8234987 10.179798 4.128801 9.3816087 4.9503119 8.9646729 5.4804244 8.2580505 5.690183 7.6134678 5.5031683 6.9048476 5.4011517 6.3130121 4.82181 6.2520876 4.0983439 6.0817012 3.2806124 6.3336309 2.3308365 7.090215 1.889994 7.3408178 1.7142707 7.6235708 1.5721737 7.92988 1.5301374 z M 7.7084299 11.716844 C 7.6679383 10.660175 7.7582383 9.5050561 7.1932507 8.5627174 6.585394 7.5030184 4.7228008 7.5919113 4.3129571 8.7807073 3.8445509 10.136359 3.8232319 11.613568 3.9810703 13.026659 c 0.1408184 0.823248 0.3103785 1.871627 1.1974071 2.203881 0.722315 0.291011 1.6289517 -0.0069 1.9432634 -0.744415 0.412795 -0.858626 0.5675261 -1.823355 0.5866891 -2.769281 z";
net.alphatab.tablature.drawing.MusicFont.Num7 = "M 2.9693252 16 C 3.1532893 14.655062 3.240787 13.267919 3.8390529 12.024468 4.3294304 10.821189 5.193962 9.8314715 6.1384442 8.9609615 7.3554376 7.6918646 8.6353226 6.4030996 9.3819019 4.7868099 9.5897661 4.2502898 9.6584092 3.6741287 9.791411 3.1165644 8.6948725 3.8306278 7.3387823 4.3876891 6.0219277 3.9922115 4.9536919 3.7526408 4.0641386 3.087013 3.0807132 2.6493482 2.3752938 2.3539968 1.3443658 2.3825371 0.97699389 3.1748466 0.78309631 3.5775363 0.61689229 3.962209 0.11726996 3.8282209 -0.13228775 3.8478321 0.06047461 3.4251232 0 3.2556513 0 2.3422133 0 1.4287754 0 0.51533742 0.37538796 0.44664274 0.6262713 0.5604332 0.68865031 0.97085892 0.87810702 1.6996251 1.755153 1.4796269 2.1890337 1.1154141 2.915997 0.66646707 3.6429874 0.10267072 4.5153374 0 5.4794752 -0.03302655 6.3042625 0.5166409 7.0736196 1.0230061 7.7329805 1.3679637 8.7015933 1.698475 9.3052147 1.0782209 9.7465474 0.83655774 9.4658822 -0.07950541 10.00953 0 10.276056 -0.03294332 10.502294 -0.02559777 10.404908 0.30537045 10.383694 1.5803197 10.45765 2.8595317 10.344014 4.1306796 10.241904 5.1211015 9.878361 6.0628984 9.3309529 6.8910564 8.720114 7.9810152 8.0129936 9.0186885 7.452454 10.134969 6.9087647 11.476459 6.762224 12.947146 6.7314753 14.38195 6.6762784 14.879015 7.0361266 15.762035 6.6939406 16 5.4524021 16 4.2108637 16 2.9693252 16 z";
net.alphatab.tablature.drawing.MusicFont.Num8 = "M 6.9745634 7.1814105 C 7.9649315 7.5871248 8.6055147 8.5117861 9.2309659 9.336311 9.7107933 9.9798462 9.8761433 10.795764 9.7566446 11.581836 9.6623395 13.11096 8.8118018 14.577783 7.4605007 15.326645 5.4750396 16.479674 2.6434127 16.15192 1.149077 14.343225 0.26232886 13.301049 -0.09953695 11.867402 0.02324993 10.521073 0.2951153 9.3874085 1.2109099 8.502254 2.1966623 7.9428087 2.8909882 7.7520474 1.7553921 7.4722414 1.6122842 7.1258748 0.1048995 5.629006 -0.10022649 2.8566707 1.4992603 1.3493917 3.2881361 -0.4039854 6.5121414 -0.4971344 8.265503 1.3555417 9.0925896 2.2257537 9.4252555 3.4943687 9.3119795 4.6698699 9.0412829 5.6459042 8.2519053 6.3997765 7.4349504 6.9504969 7.2878699 7.039373 7.1341738 7.1175779 6.9745634 7.1814135 z M 6.16004 6.5396648 C 7.3433435 5.9974508 8.0855736 4.6110218 7.8137694 3.3247657 7.6619806 2.0976617 6.7158553 0.95015864 5.4474766 0.80765364 4.3731519 0.59796663 3.1804319 1.0205957 2.610191 1.9865097 2.2178771 2.5807967 2.0716074 3.4816427 2.6628342 4.0019927 3.6851153 5.0357923 5.1306293 5.5090665 6.16004 6.5396648 z M 3.173454 8.4402195 C 2.1911908 8.8982684 1.3077853 9.7792024 1.2586299 10.919272 1.1104106 12.721786 2.3200357 14.689058 4.1698666 15.01351 5.3209336 15.209497 6.7288823 15.00791 7.403808 13.942303 7.8254111 13.370441 7.9018402 12.538432 7.42608 11.972811 6.3452458 10.420376 4.5134069 9.7156751 3.173454 8.4402195 z";
net.alphatab.tablature.drawing.MusicFont.Num9 = "m 2.4615385 14.473846 c 0.2864835 0.650421 1.0887783 0.942481 1.7573077 1.006443 1.104573 0.10007 1.9307359 -0.867427 2.2403846 -1.83375 0.5521265 -1.736437 0.693236 -3.611735 0.426923 -5.4126928 C 6.8687374 7.7863498 6.4743914 7.2641267 6.2188461 7.8842308 5.2442243 8.9831213 3.5276506 9.3371835 2.1824038 8.7747116 0.98895445 8.1873467 0.32203527 6.8764784 0.07399039 5.619399 -0.22033757 3.9130274 0.30095529 1.9728831 1.7614423 0.93526443 3.5513076 -0.41608683 6.3294807 -0.31446565 7.9267128 1.3021334 9.7383121 3.0942704 10.396345 5.7397328 10.387692 8.2215385 10.410273 10.82919 9.1651358 13.418233 7.1238461 15.036539 5.6941193 16.16333 3.5645264 16.332099 1.9932933 15.406346 0.83188724 14.656839 0.1866876 13.115169 0.54673077 11.771442 0.84784324 10.851867 1.8631956 10.239532 2.81625 10.480192 c 0.7185837 0.08751 1.2784521 0.706831 1.3268269 1.424424 0.187828 0.860923 -0.1643626 1.801902 -0.92 2.273845 -0.2253906 0.156733 -0.4862338 0.270032 -0.7615384 0.295385 z M 2.6830769 4.2830769 C 2.7272056 5.3816137 2.6224997 6.6047234 3.2758654 7.5556731 3.937337 8.5290248 5.6655873 8.3180176 6.0277885 7.1771154 6.5429067 5.7242407 6.6053836 4.1279192 6.3638461 2.6138461 6.2328538 1.7264685 5.6653344 0.7119112 4.6653846 0.66932692 3.8382452 0.54822073 3.1355372 1.2164061 2.9846154 1.9946154 2.7573964 2.7341678 2.684141 3.5122204 2.6830769 4.2830769 z";
net.alphatab.tablature.drawing.MusicFont.TrebleClef = "m 12.585366 0 c 2.695627 1.2923663 2.975076 5.1473116 3.470275 7.7942073 0.217542 4.8275937 -1.464124 9.9418447 -5.323934 13.0350607 0.317073 1.609756 0.634147 3.219513 0.95122 4.829269 3.430763 -0.813854 7.182478 1.038565 8.413872 4.385289 1.629669 3.61078 0.972551 8.597733 -2.852897 10.54154 -2.100136 0.437691 -2.903792 1.246753 -2.10233 3.233735 0.272417 2.375118 1.266536 4.747884 0.805836 7.135167 -1.188184 3.632741 -6.6983424 5.587477 -9.3864324 2.387195 C 3.2319864 51.015649 5.7424169 45.055421 9.8048785 46.713415 13.446455 47.851875 11.747229 53.835809 8.097561 53 c 2.303477 2.549378 6.273465 0.66665 7.159679 -2.211509 0.424671 -2.48254 -0.553262 -4.95062 -0.835109 -7.418926 C 14.636918 40.513523 11.146219 42.776886 9.4161582 41.934737 2.9425964 41.14269 -2.1258003 33.514161 0.89557926 27.403963 2.8464232 23.287517 5.9293107 19.804135 9.195122 16.682927 8.099673 12.709304 7.1884817 8.3606399 8.8363186 4.3898629 9.5491179 2.6574011 10.395671 0.17177823 12.585366 0 z M 11 25.707317 c -0.284553 -1.463415 -0.569106 -2.926829 -0.853659 -4.390244 -3.0830984 3.086815 -6.5003653 6.494866 -7.278963 10.969513 -0.77657 5.00226 4.5217891 9.16193 9.199695 8.835365 2.380311 0.258928 1.527391 -1.629128 1.236674 -3.058845 -0.621575 -3.069815 -1.243149 -6.139631 -1.864723 -9.209447 -3.9497494 0.271628 -6.1539187 6.077531 -2.8818594 8.619283 0.7547816 1.11379 5.3453174 2.81554 1.8269814 1.77096 C 6.9395446 37.881248 4.586369 33.922439 5.9512196 30.29878 6.6996927 28.024213 8.652949 26.220646 11 25.707317 z m 3.780488 -19.02439 c 0.529035 -3.1754228 -3.285242 -3.9151254 -4 -0.829268 -1.7566574 3.0411468 -1.7950129 6.602854 -1.0518295 9.942073 0.9598505 0.42285 3.1706095 -2.30938 3.8123095 -3.667397 0.949096 -1.629556 1.588018 -3.5452256 1.23952 -5.445408 z m -2.536586 22.170732 c 0.747968 3.813008 1.495935 7.626016 2.243903 11.439024 3.915918 -0.615638 5.813025 -5.578268 3.620807 -8.778963 -1.230662 -1.936734 -3.603837 -2.978158 -5.86471 -2.660061 z";
net.alphatab.tablature.drawing.MusicFont.AltoClef = "M 0 32 C 0 21.38264 0 10.76528 0 0.14792 c 1.3312789 0 2.6625578 0 3.9938367 0 0 10.61736 0 21.23472 0 31.85208 C 2.6625578 32 1.3312789 32 0 32 z m 5.3497689 0 c 0 -10.61736 0 -21.23472 0 -31.85208 0.3948711 0.0923853 1.1664119 -0.1918991 1.3066256 0.1551436 0 10.5656454 0 21.1312914 0 31.6969364 -0.4355419 0 -0.8710837 0 -1.3066256 0 z M 9.3436055 18.169492 C 8.8502726 17.246504 7.3168918 16.43575 7.0464176 15.902542 c 2.1113236 -1.252613 3.5898404 -3.492944 3.9489604 -5.91795 0.150704 1.297078 0.735076 2.784943 2.153408 3.094857 1.390237 0.432916 3.173124 0.18344 3.918529 -1.21562 C 18.23615 9.7117941 18.151312 7.1290589 17.948189 4.7590523 17.782438 3.0560707 16.956047 0.9570681 15.021957 0.72188005 13.913812 0.56898567 11.571117 0.97478003 11.75963 2.2804315 c 1.284516 -0.3045719 2.919879 0.7313796 2.50077 2.1864406 -0.373099 1.9048616 -3.183432 2.0900102 -4.20493 0.6240372 -1.0308571 -1.3437026 0.0354 -3.1600429 1.272438 -3.9425075 2.829602 -1.98548167 7.291634 -1.40115265 9.269646 1.5303345 2.166332 3.0968354 1.37549 7.7714097 -1.59948 10.0755007 -1.75095 1.449873 -4.252951 2.142278 -6.460324 1.501541 -1.250456 -0.784798 -1.404328 1.511111 -2.6517716 1.793529 1.2209176 0.327008 1.4708446 2.764075 2.7118646 1.947611 1.834901 -0.606849 3.928305 -0.162988 5.574634 0.789198 2.669516 1.555684 4.186836 4.783911 3.653481 7.831255 -0.42842 3.081441 -3.385169 5.426336 -6.457169 5.379283 -2.275194 0.133151 -4.928546 -1.053159 -5.5686156 -3.395152 -0.5699102 -2.0151 2.2481806 -3.541258 3.7618446 -2.243644 1.144885 0.734699 1.133611 2.733678 -0.264638 3.179892 -0.661254 0.261272 -2.355349 0.07434 -1.073959 1.029276 1.432803 1.101965 3.860566 1.143447 4.876444 -0.542565 1.229353 -2.052215 1.086192 -4.591152 0.897631 -6.889446 -0.208579 -1.708906 -0.867982 -3.948962 -2.839946 -4.265986 -1.354093 -0.157547 -3.097701 0.136321 -3.593413 1.619896 -0.351677 0.576291 -0.414752 2.413668 -0.605547 0.825405 -0.290162 -1.153964 -0.859844 -2.228254 -1.6149845 -3.144838 z";
net.alphatab.tablature.drawing.MusicFont.TenorClef = "M 0 32 C 0 21.38264 0 10.76528 0 0.14792 c 1.3312789 0 2.6625578 0 3.9938367 0 0 10.61736 0 21.23472 0 31.85208 C 2.6625578 32 1.3312789 32 0 32 z m 5.3497689 0 c 0 -10.61736 0 -21.23472 0 -31.85208 0.3948711 0.0923853 1.1664119 -0.1918991 1.3066256 0.1551436 0 10.5656454 0 21.1312914 0 31.6969364 -0.4355419 0 -0.8710837 0 -1.3066256 0 z M 9.3436055 18.169492 C 8.8502726 17.246504 7.3168918 16.43575 7.0464176 15.902542 c 2.1113236 -1.252613 3.5898404 -3.492944 3.9489604 -5.91795 0.150704 1.297078 0.735076 2.784943 2.153408 3.094857 1.390237 0.432916 3.173124 0.18344 3.918529 -1.21562 C 18.23615 9.7117941 18.151312 7.1290589 17.948189 4.7590523 17.782438 3.0560707 16.956047 0.9570681 15.021957 0.72188005 13.913812 0.56898567 11.571117 0.97478003 11.75963 2.2804315 c 1.284516 -0.3045719 2.919879 0.7313796 2.50077 2.1864406 -0.373099 1.9048616 -3.183432 2.0900102 -4.20493 0.6240372 -1.0308571 -1.3437026 0.0354 -3.1600429 1.272438 -3.9425075 2.829602 -1.98548167 7.291634 -1.40115265 9.269646 1.5303345 2.166332 3.0968354 1.37549 7.7714097 -1.59948 10.0755007 -1.75095 1.449873 -4.252951 2.142278 -6.460324 1.501541 -1.250456 -0.784798 -1.404328 1.511111 -2.6517716 1.793529 1.2209176 0.327008 1.4708446 2.764075 2.7118646 1.947611 1.834901 -0.606849 3.928305 -0.162988 5.574634 0.789198 2.669516 1.555684 4.186836 4.783911 3.653481 7.831255 -0.42842 3.081441 -3.385169 5.426336 -6.457169 5.379283 -2.275194 0.133151 -4.928546 -1.053159 -5.5686156 -3.395152 -0.5699102 -2.0151 2.2481806 -3.541258 3.7618446 -2.243644 1.144885 0.734699 1.133611 2.733678 -0.264638 3.179892 -0.661254 0.261272 -2.355349 0.07434 -1.073959 1.029276 1.432803 1.101965 3.860566 1.143447 4.876444 -0.542565 1.229353 -2.052215 1.086192 -4.591152 0.897631 -6.889446 -0.208579 -1.708906 -0.867982 -3.948962 -2.839946 -4.265986 -1.354093 -0.157547 -3.097701 0.136321 -3.593413 1.619896 -0.351677 0.576291 -0.414752 2.413668 -0.605547 0.825405 -0.290162 -1.153964 -0.859844 -2.228254 -1.6149845 -3.144838 z";
net.alphatab.tablature.drawing.MusicFont.BassClef = "M 4.4356558 2.4194491 C 3.4766996 3.1995989 3.4510884 5.3360601 4.9633351 5.4421849 6.0458355 5.7621636 7.6246672 5.5682704 8.0927879 6.8775513 8.4557383 8.004685 8.3608094 9.5247315 7.1827381 10.131442 5.6370652 11.017714 3.4610423 11.094489 2.0300883 9.9428161 0.65206906 8.7621225 0.95596535 6.7221312 1.4159721 5.1773604 2.1035925 3.0463292 3.5981503 0.90221424 5.9008517 0.37656261 c 3.087357 -0.81806907 6.7915573 -0.40673885 9.0900863 1.99890499 2.383303 2.3752518 3.517696 6.2064154 2.024743 9.3526954 -1.508165 3.27691 -4.312095 5.708076 -7.0837306 7.910107 -2.66473 2.006433 -5.5309329 3.778472 -8.5927478 5.109689 -0.49491478 0.46294 -1.67740729 0.213488 -1.19044825 -0.403536 C 3.759719 22.942739 7.0323483 20.654887 9.6302445 17.785646 11.949885 15.125909 12.828687 11.528021 13.004536 8.0792549 13.115976 5.8210489 12.457453 3.2889387 10.450116 1.99957 8.6248507 0.76532704 6.0886012 0.98631495 4.4356558 2.4194491 z M 20.842542 2.5706646 c 1.604098 -0.1125753 2.579523 2.0274979 1.541296 3.2089985 -0.892084 1.1907791 -3.02409 0.8323822 -3.388567 -0.6430595 -0.425847 -1.2382984 0.534394 -2.5827507 1.847271 -2.565939 z m 0 7.0063204 c 1.604098 -0.1125756 2.579523 2.027498 1.541296 3.208998 -0.892084 1.190779 -3.02409 0.832382 -3.388567 -0.643059 -0.431649 -1.227443 0.542905 -2.5914101 1.847271 -2.565939 z";
net.alphatab.tablature.drawing.MusicFont.TripletFeel8 = "m 24.360792 19.363454 c 2.022631 0 4.045261 0 6.067892 0 0.131899 -0.908458 -1.28161 -0.271509 -1.868619 -0.461059 -1.399758 0 -2.799515 0 -4.199273 0 0 0.153686 0 0.307373 0 0.461059 z m 0 1.858977 c 2.018497 -0.01988 4.06965 0.03961 6.0679 -0.02948 0.163152 -0.943756 -1.236852 -0.304406 -1.803565 -0.490445 -1.421451 0 -2.842902 0 -4.264353 0 1.4e-5 0.172746 -2.7e-5 0.349084 1.8e-5 0.519925 z M 38.013536 5.561905 c -0.0202 5.515981 0.04057 11.035329 -0.03067 16.549187 -0.237408 2.285379 -3.949995 4.188176 -5.230387 1.732245 -0.787674 -2.649537 3.285684 -4.740597 4.889256 -3.147396 0 -5.044804 0 -10.089609 0 -15.1344133 0.123922 1.282e-4 0.248452 -3.18e-4 0.371805 3.773e-4 z m -16.448739 0 c -0.0202 5.515981 0.04057 11.035329 -0.03067 16.549187 -0.230718 2.272567 -3.947114 4.197649 -5.20808 1.732245 -0.749169 -2.469202 3.014714 -4.948566 4.86695 -3.022821 0 -4.402204 0 -8.804408 0 -13.2066126 -2.919923 0 -5.839847 0 -8.75977 0 -0.02028 4.8318516 0.04068 9.6670836 -0.03067 14.4968116 -0.231774 2.279 -3.9593304 4.197027 -5.2229564 1.732245 -0.8053443 -2.64753 3.2825274 -4.741543 4.8818254 -3.147396 0 -5.044804 0 -10.089609 0 -15.1344137 3.167541 5.032e-4 6.337096 -0.00101 9.503379 7.547e-4 z M 1.2195305 18.396741 c -0.1663868 2.256918 0.719255 4.53664 2.6189092 5.84478 C 4.8301354 25.093067 2.0357023 23.404224 1.7881612 22.77495 -0.18491456 20.739653 -0.6325593 17.364166 1.1158879 15.045786 1.6672852 13.935998 3.7237333 12.199101 4.0667515 12.38472 2.0433521 13.749429 1.0245033 15.966439 1.2195305 18.396741 z m 54.6109945 0 c 0.166387 2.256918 -0.719255 4.53664 -2.618909 5.84478 -0.991696 0.851546 1.802737 -0.837297 2.050278 -1.466571 1.973076 -2.035297 2.420722 -5.410784 0.672274 -7.729164 -0.553468 -1.106347 -2.612789 -2.841875 -2.950864 -2.661066 2.023399 1.364709 3.042248 3.581719 2.847221 6.012021 z M 47.204604 5.561905 c 0.161974 2.221772 2.222353 3.3264001 3.456414 4.914174 2.346583 2.491993 1.740209 6.434169 -0.22913 8.946803 0.243619 -1.293542 1.603465 -3.208136 1.072896 -4.957536 -0.394015 -2.259004 -2.247042 -4.046781 -4.359664 -4.7837614 -0.01945 4.1427844 0.03915 8.2887174 -0.02974 12.4295074 -0.20579 2.289475 -3.953079 4.191499 -5.20902 1.732245 -0.748815 -2.477791 3.024607 -4.948109 4.88183 -3.022821 0 -5.086329 0 -10.172659 0 -15.2589883 0.138548 3.771e-4 0.278527 -6.552e-4 0.416418 3.773e-4 z M 39.842827 2.185968 c -0.03088 0.7524982 -1.390199 0.1765588 -1.993194 0.3569432 -0.673497 0.081205 -1.879588 -0.3701837 -1.516658 0.7474477 0.176948 1.1460998 -0.387593 1.3361993 -0.237956 0.08517 -0.20012 -0.9703643 0.103637 -1.436851 1.121172 -1.1895611 0.875545 0 1.751091 0 2.626636 0 z m 9.042348 0 C 48.798192 2.8692292 49.05687 3.8981512 48.7606 4.3721261 48.304147 4.093041 49.032032 2.6296174 48.3832 2.5429112 c -1.081947 0 -2.163895 0 -3.245842 0 0.03088 -0.7524982 1.390199 -0.1765588 1.993194 -0.3569432 0.584874 0 1.169749 0 1.754623 0 z m -7.123821 0.1487104 c 1.279521 -0.027874 2.543826 -2.27750017 0.375497 -2.02232944 -0.978854 0.30167049 0.972698 0.92954444 -0.441516 1.43890344 -2.453832 -0.80386606 3.029862 -3.3145781 2.653763 -0.4721902 -0.359541 1.1460187 -1.495945 0.7245723 -0.520534 1.7548598 0.03287 2.6346214 -5.383461 1.2557644 -2.647266 -0.297421 1.730854 0.4388304 -1.531576 1.4774311 0.327239 1.5764832 1.319994 -0.076829 2.01635 -1.9205477 0.252817 -1.9783058 z";
net.alphatab.tablature.drawing.MusicFont.TripletFeel16 = "m 24.3605 19.363474 c 2.022605 0 4.045211 0 6.067816 0 0.119415 -0.891003 -1.288283 -0.254893 -1.868601 -0.446163 -1.399738 0 -2.799477 0 -4.199215 0 0 0.148721 0 0.297442 0 0.446163 z m 0 1.859013 c 2.018401 -0.02006 4.069986 0.03997 6.067812 -0.02975 0.163295 -0.944089 -1.236717 -0.304806 -1.803517 -0.490775 -1.421434 0 -2.842867 0 -4.264301 0 5e-6 0.173506 -9e-6 0.347028 6e-6 0.520525 z M 1.2195122 18.396788 c -0.1675365 2.260902 0.7247902 4.538357 2.6188839 5.856121 0.9918399 0.86044 -1.805886 -0.841404 -2.0502585 -1.474429 -1.97030434 -2.038611 -2.42249349 -5.412472 -0.6722653 -7.732562 0.5513966 -1.10978 2.607828 -2.846643 2.9508337 -2.661061 -2.0233493 1.364684 -3.0422193 3.58168 -2.8471938 6.011931 z m 54.6103508 0 c 0.167537 2.260902 -0.72479 4.538357 -2.618884 5.856121 -0.99184 0.86044 1.805887 -0.841404 2.050259 -1.474429 1.970304 -2.038612 2.422492 -5.412472 0.672265 -7.732562 -0.553466 -1.106339 -2.612773 -2.841833 -2.950834 -2.661061 2.040117 1.39132 3.030063 3.552228 2.847194 6.011931 z M 39.842356 2.1861987 c -0.01376 0.7745677 -1.386388 0.1902631 -1.993174 0.3718025 -0.670196 0.079541 -1.867882 -0.3684084 -1.50177 0.7474403 0.201603 0.990361 -0.406673 1.4991121 -0.252825 0.2098144 -0.09501 -0.8702225 -0.101207 -1.6516369 0.996587 -1.3290572 0.917061 0 1.834121 0 2.751182 0 z m 9.042237 0 c -0.0855 0.6897197 0.169629 1.7200581 -0.124573 2.2010708 -0.456446 -0.2791099 0.271415 -1.7425272 -0.3774 -1.8292683 -1.081932 0 -2.163865 0 -3.245797 0 0.01376 -0.7745677 1.386388 -0.1902631 1.993174 -0.3718025 0.584865 0 1.169731 0 1.754596 0 z m -7.123736 0.148721 c 1.280268 -0.026613 2.542988 -2.28239117 0.375513 -2.01888738 -0.969657 0.3122999 0.969346 0.92721848 -0.441515 1.44910028 -2.455863 -0.81080798 3.021784 -3.3346665 2.653751 -0.486132 -0.365302 1.1421515 -1.495606 0.7327492 -0.520523 1.7697799 0.0075 2.6195798 -5.37937 1.2355508 -2.647243 -0.3123141 1.730703 0.442957 -1.537086 1.4741993 0.327189 1.5913147 1.320262 -0.073394 2.017217 -1.9401167 0.252828 -1.9928614 z m 0.907198 8.5960733 c 0.08698 -0.683281 -0.171685 -1.7121989 0.124573 -2.1861982 1.331666 0 2.663332 0 3.994998 0 0.223401 -0.9738808 -0.141071 -1.3598886 -1.12116 -1.1302796 -2.551127 0 -5.102253 0 -7.653379 0 -0.02029 4.8317748 0.04068 9.6669288 -0.03067 14.4965798 -0.237373 2.285118 -3.949985 4.188412 -5.230331 1.732598 -0.790954 -2.649125 3.29975 -4.753315 4.889203 -3.132456 0 -5.044734 0 -10.089468 0 -15.1342015 3.167757 0 6.335515 0 9.503272 0 -0.01962 5.5109605 0.03938 11.0250935 -0.02974 16.5340575 -0.205755 2.28921 -3.953064 4.191736 -5.208953 1.7326 -0.752693 -2.476928 3.039209 -4.961436 4.881766 -3.007883 0 -3.301606 0 -6.603213 0 -9.904819 -1.37319 10e-7 -2.746385 -3e-6 -4.119571 2e-6 z M 21.564545 5.5770375 c -0.02023 5.5109355 0.04061 11.0252445 -0.03067 16.5340565 -0.230686 2.272307 -3.947104 4.197884 -5.208023 1.732599 -0.753069 -2.468344 3.029382 -4.961931 4.866894 -3.007883 0 -3.380924 0 -6.761848 0 -10.142772 -2.919889 0 -5.839777 0 -8.759666 0 -0.02005 3.80561 0.04036 7.614566 -0.03067 11.418055 -0.231743 2.278736 -3.9593152 4.197263 -5.2228957 1.732601 -0.80863 -2.64712 3.2965927 -4.754259 4.8817667 -3.132455 0 -5.044734 0 -10.089468 0 -15.1342015 3.167757 0 6.335515 0 9.503272 0 z M 21.192742 8.6406901 C 21.494343 7.581786 20.839399 7.4794274 19.947008 7.6145152 c -2.504644 0 -5.009288 0 -7.513932 0 -0.301601 1.0589041 0.353343 1.1612627 1.245734 1.0261749 2.504644 0 5.009288 0 7.513932 0 z";
net.alphatab.tablature.drawing.MusicFont.TripletFeelNone8 = "m 25.84771 19.3635 c 2.022607 0 4.045213 0 6.06782 0 0.131935 -0.908503 -1.281579 -0.271557 -1.868603 -0.4611 -1.399739 0 -2.799478 0 -4.199217 0 0 0.1537 0 0.3074 0 0.4611 z m 0 1.859 c 2.018322 -0.02023 4.070339 0.04031 6.06777 -0.03 0.163331 -0.944305 -1.236674 -0.305084 -1.80353 -0.491 -1.421433 0 -2.842867 0 -4.2643 0 5e-5 0.173665 -9.1e-5 0.347341 6e-5 0.521 z M 48.78049 5.5622 c -0.0202 5.515877 0.04057 11.035121 -0.03067 16.548875 -0.230692 2.272627 -3.947107 4.19764 -5.208029 1.732125 -0.749146 -2.469168 3.014669 -4.9484 4.866903 -3.0228 0 -4.402133 0 -8.804267 0 -13.2064 -2.91989 0 -5.83978 0 -8.75967 0 -0.02029 4.831773 0.04068 9.666926 -0.03067 14.496575 -0.231746 2.279057 -3.959316 4.197017 -5.222899 1.732125 -0.805322 -2.647497 3.282474 -4.74138 4.881773 -3.147374 0 -5.044708 0 -10.089417 0 -15.134126 3.167423 6.668e-4 6.337514 -0.00133 9.50327 10e-4 z M 1.21951 18.3968 C 1.0531152 20.653705 1.9388048 22.933386 3.8383994 24.241552 4.8300922 25.093096 2.0357155 23.40421 1.7881408 22.774978 -0.18490567 20.739719 -0.63256079 17.364259 1.1158755 15.045922 1.6672789 13.936149 3.7236923 12.199255 4.0667088 12.384866 2.0266 13.776196 1.0366444 15.937092 1.21951 18.3968 z m 54.61035 0 c 0.166396 2.256904 -0.719281 4.536587 -2.618879 5.844752 -0.991694 0.851544 1.802679 -0.837346 2.050256 -1.466574 1.97305 -2.035257 2.420703 -5.41072 0.672268 -7.729056 -0.553475 -1.10633 -2.612764 -2.841855 -2.950834 -2.661056 2.040114 1.39133 3.030056 3.552225 2.847189 6.011934 z M 12.43308 5.5622 c -0.0202 5.515877 0.04057 11.035121 -0.03067 16.548875 -0.23738 2.285437 -3.9499871 4.188166 -5.2303335 1.732125 -0.7876645 -2.649501 3.2856295 -4.740437 4.8891975 -3.147374 0 -5.044708 0 -10.089417 0 -15.134126 0.123916 1.697e-4 0.24865 -4.211e-4 0.37181 5e-4 z m 9.19095 0 c 0.16201 2.221706 2.222357 3.3262863 3.456373 4.914037 2.346575 2.492009 1.740135 6.434094 -0.229123 8.946763 0.243543 -1.293627 1.603432 -3.208132 1.0729 -4.957569 -0.394021 -2.259005 -2.247056 -4.046695 -4.35964 -4.783731 -0.01945 4.14274 0.03915 8.288629 -0.02974 12.429375 -0.205748 2.289532 -3.95306 4.191489 -5.208948 1.732125 -0.748804 -2.477754 3.024547 -4.947947 4.881762 -3.0228 0 -5.086233 0 -10.172467 0 -15.2587 0.138462 4.996e-4 0.27883 -8.681e-4 0.41642 5e-4 z m -7.36169 -3.376 c -0.03093 0.7524317 -1.390197 0.1765205 -1.993177 0.3569 -0.670194 0.07954 -1.867877 -0.3684079 -1.501763 0.7474413 0.201604 0.9903532 -0.406674 1.4991723 -0.25283 0.2098439 -0.09982 -0.8700807 -0.09437 -1.6348816 0.996588 -1.3141852 0.917061 0 1.834121 0 2.751182 0 z m 9.04224 0 c -0.08698 0.6832816 0.171685 1.7122006 -0.124574 2.1862 -0.456451 -0.2791168 0.271409 -1.7425447 -0.377403 -1.8293 -1.081931 0 -2.163862 0 -3.245793 0 0.03093 -0.7524317 1.390197 -0.1765205 1.993177 -0.3569 0.584864 0 1.169729 0 1.754593 0 z m -7.12374 0.1487 c 1.279581 -0.028817 2.54369 -2.27766025 0.375433 -2.02275 -0.97882 0.3016842 0.972648 0.9294892 -0.441552 1.4388875 -2.453815 -0.80381885 3.029633 -3.3145594 2.653739 -0.4722375 -0.359547 1.1460326 -1.495903 0.7246004 -0.52052 1.7549 0.03303 2.6345723 -5.383369 1.25568 -2.64723 -0.2974 1.730848 0.43888 -1.531577 1.4772997 0.32722 1.5764 1.319885 -0.076261 2.01639 -1.9212787 0.25291 -1.9778 z";
net.alphatab.tablature.drawing.MusicFont.TripletFeelNone16 = "m 24.3605 19.3635 c 2.022605 0 4.045211 0 6.067816 0 0.119446 -0.891047 -1.288268 -0.254934 -1.868603 -0.4462 -1.399738 0 -2.799475 0 -4.199213 0 0 0.148733 0 0.297467 0 0.4462 z m 0 1.859 c 2.01834 -0.02023 4.070343 0.04031 6.067812 -0.03 0.163336 -0.944306 -1.236667 -0.305084 -1.80352 -0.491 -1.421432 0 -2.842865 0 -4.264298 0 5e-6 0.173667 -9e-6 0.347333 6e-6 0.521 z M 1.2195122 18.3968 C 1.051969 20.657694 1.944314 22.935126 3.8383961 24.252883 4.8302378 25.113326 2.0325102 23.411493 1.7881376 22.778469 -0.1821642 20.739865 -0.63436172 17.366003 1.1158723 15.045922 1.6672758 13.93615 3.7236914 12.199258 4.066706 12.384866 2.0433625 13.749561 1.0244866 15.966542 1.2195122 18.3968 z m 54.6103508 0 c 0.167544 2.260895 -0.724802 4.538326 -2.618884 5.856083 -0.991842 0.860443 1.805886 -0.84139 2.050259 -1.474414 1.970301 -2.038605 2.422498 -5.412466 0.672265 -7.732547 -0.553473 -1.106331 -2.612764 -2.841854 -2.950834 -2.661056 2.023344 1.364695 3.04222 3.581676 2.847194 6.011934 z M 14.262344 2.1862 c -0.01376 0.7745643 -1.38639 0.1902606 -1.993177 0.3718 -0.670195 0.079541 -1.86788 -0.3684083 -1.501767 0.7474412 0.201601 0.9903503 -0.406668 1.4991728 -0.252825 0.209844 -0.095 -0.8702238 -0.10122 -1.6516687 0.996588 -1.3290852 0.917061 0 1.834121 0 2.751181 0 z m 9.042237 0 c -0.08549 0.6897321 0.169625 1.7200742 -0.124574 2.2011 -0.488149 -0.2523741 0.264365 -1.7454124 -0.392271 -1.8293 -1.076975 0 -2.15395 0 -3.230925 0 0.01376 -0.7745643 1.38639 -0.1902606 1.993177 -0.3718 0.584864 0 1.169729 0 1.754593 0 z m -7.123736 0.1487 c 1.280345 -0.026994 2.542946 -2.28250073 0.375514 -2.019025 -0.969636 0.3122556 0.969343 0.9271996 -0.441515 1.4490375 -2.455872 -0.81079353 3.021822 -3.3346493 2.65374 -0.4861125 -0.365337 1.1421138 -1.495604 0.7327511 -0.520523 1.7698 0.0074 2.6195445 -5.379365 1.2355215 -2.647224 -0.3123 1.730694 0.4429613 -1.537097 1.4741348 0.327189 1.5913 1.320961 -0.073328 2.016547 -1.9408696 0.252819 -1.9927 z M 47.144557 5.577 c -0.02023 5.510942 0.04061 11.025256 -0.03067 16.534075 -0.23069 2.272625 -3.947104 4.197641 -5.208023 1.732125 -0.753075 -2.468364 3.029341 -4.961816 4.866894 -3.0079 0 -3.380933 0 -6.761867 0 -10.1428 -2.919889 0 -5.839778 0 -8.759667 0 -0.02005 3.805616 0.04036 7.614579 -0.03067 11.418075 -0.23187 2.278801 -3.959176 4.197781 -5.222895 1.732625 -0.808639 -2.647139 3.296555 -4.754146 4.881767 -3.132474 0 -5.044742 0 -10.089484 0 -15.134226 3.167591 3.334e-4 6.336515 -6.668e-4 9.503272 5e-4 z m -0.371803 3.0637 c 0.301592 -1.0589041 -0.353325 -1.1612988 -1.245735 -1.0262 -2.504644 0 -5.009288 0 -7.513932 0 -0.301592 1.0589041 0.353325 1.1612988 1.245735 1.0262 2.504644 0 5.009288 0 7.513932 0 z M 17.088043 10.931 c 0.08698 -0.683282 -0.171685 -1.7122006 0.124574 -2.1862 1.331666 0 2.663332 0 3.994998 0 0.223394 -0.973881 -0.14106 -1.3599148 -1.121162 -1.1303 -2.551126 0 -5.102251 0 -7.653377 0 -0.02028 4.831773 0.04068 9.666926 -0.03067 14.496575 -0.23738 2.285437 -3.9499843 4.188166 -5.2303318 1.732125 -0.7909643 -2.649144 3.2997118 -4.753201 4.8892028 -3.132474 0 -5.044742 0 -10.089484 0 -15.134226 3.167757 0 6.335515 0 9.503272 0 -0.01962 5.510967 0.03938 11.025105 -0.02974 16.534075 -0.205882 2.289273 -3.952927 4.192255 -5.208953 1.732625 -0.752699 -2.476948 3.039169 -4.961321 4.881767 -3.0079 0 -3.3016 0 -6.6032 0 -9.9048 -1.373025 3.32e-4 -2.74738 -6.65e-4 -4.119572 5e-4 z";
net.alphatab.tablature.drawing.MusicFont.KeySharp = "m 3.1131687 3.970165 c 0 -1.323388 0 -2.646777 0 -3.970165 0.2157065 0 0.4314129 0 0.6471194 0 0 1.24177 0 2.483539 0 3.725309 0.3089849 -0.134088 0.6179698 -0.268176 0.9269547 -0.402264 0 0.787037 0 1.574074 0 2.361111 C 4.3782579 5.818244 4.069273 5.952332 3.7602881 6.08642 c 0 1.265089 0 2.530178 0 3.795267 0.3089849 -0.1457477 0.6179698 -0.2914953 0.9269547 -0.437243 0 0.787037 0 1.574075 0 2.361112 -0.3089849 0.134088 -0.6179698 0.268175 -0.9269547 0.402263 0 1.288409 0 2.576818 0 3.865226 -0.2157065 0 -0.4314129 0 -0.6471194 0 0 -1.20679 0 -2.41358 0 -3.62037 -0.5130315 0.215706 -1.0260631 0.431413 -1.5390946 0.647119 0 1.300069 0 2.600137 0 3.900206 -0.2157065 0 -0.4314129 0 -0.64711937 0 0 -1.21845 0 -2.4369 0 -3.65535 C 0.61796982 13.467078 0.30898491 13.589506 0 13.711934 0 12.924897 0 12.13786 0 11.350823 c 0.30898491 -0.122428 0.61796982 -0.244856 0.92695473 -0.367284 0 -1.265089 0 -2.530178 0 -3.795267 C 0.61796982 7.3223597 0.30898491 7.4564473 0 7.590535 0 6.791838 0 5.993141 0 5.194444 0.30898491 5.072016 0.61796982 4.949588 0.92695473 4.82716 c 0 -1.288409 0 -2.576817 0 -3.865226 0.21570647 0 0.43141287 0 0.64711937 0 0 1.20679 0 2.413581 0 3.620371 C 2.0871056 4.378258 2.6001372 4.174212 3.1131687 3.970165 z M 1.5740741 6.943416 c 0 1.265089 0 2.530178 0 3.795267 0.5130315 -0.215706 1.0260631 -0.431413 1.5390946 -0.647119 0 -1.2534293 0 -2.5068587 0 -3.760288 -0.5130315 0.204047 -1.0260631 0.408093 -1.5390946 0.61214 z";
net.alphatab.tablature.drawing.MusicFont.KeyNormal = "M 0 12.445067 C 0 8.2967113 0 4.1483557 0 0 c 0.23505232 0 0.47010463 0 0.70515695 0 0 1.867713 0 3.735426 0 5.603139 C 1.8359492 5.2918537 2.9667414 4.9805683 4.0975336 4.669283 c 0 4.110239 0 8.220478 0 12.330717 -0.2223468 0 -0.4446935 0 -0.6670403 0 0 -1.829596 0 -3.659193 0 -5.488789 C 2.2869955 11.822496 1.1434978 12.133782 0 12.445067 z M 0.70515695 10.367713 C 1.6136024 10.119955 2.5220479 9.8721973 3.4304933 9.6244395 c 0 -1.0100898 0 -2.0201797 0 -3.0302695 -0.9084454 0.247758 -1.8168909 0.4955159 -2.72533635 0.7432739 0 1.0100897 0 2.0201794 0 3.0302691 z";
net.alphatab.tablature.drawing.MusicFont.KeyFlat = "m 0 2 c 0.21142857 0 0.42285714 0 0.63428571 0 0 2.9257143 0 5.8514287 0 8.777143 0.88296219 -0.500672 1.90751989 -1.0136991 2.94857149 -0.775714 0.9072347 0.241632 1.2869709 1.335393 1.100173 2.182315 -0.3140714 1.24558 -1.3555073 2.136928 -2.3778181 2.829509 C 1.4199016 15.524167 0.70362257 16.26997 0 17 0 12 0 7 0 2 z m 2.64 8.708571 c -0.6225259 -0.36135 -1.300613 0.09747 -1.79558035 0.471563 -0.30893299 0.10446 -0.18729563 0.421112 -0.21013394 0.666036 0 1.283657 0 2.567315 0 3.850973 C 1.1275033 15.182526 1.6674789 14.709702 2.1271206 14.165067 2.677839 13.42137 3.3098706 12.576559 3.2475 11.601072 3.2130643 11.221752 2.969569 10.890184 2.64 10.708571 z";
net.alphatab.tablature.drawing.MusicFont.SilenceHalf = "m 0 4 c 3.2186837 0 6.4373673 0 9.656051 0 0 -1.3333333 0 -2.6666667 0 -4 C 6.4373673 0 3.2186837 0 0 0 0 1.3333333 0 2.6666667 0 4 z";
net.alphatab.tablature.drawing.MusicFont.SilenceQuarter = "M 2.4016368 0.03538498 C 4.2976717 2.2263729 6.1937067 4.4173609 8.0897416 6.6083488 6.5722002 7.7484034 5.5755292 9.430334 4.7566963 11.107301 c -0.5151471 1.599623 0.2645976 3.286085 1.2865126 4.504094 0.2365344 0.660912 2.0671401 1.257406 1.0318965 1.934721 -1.3146885 0.03055 -2.8398412 -0.367527 -3.9510461 0.548371 -0.7661695 0.840431 -0.4458677 2.170644 0.2146335 2.973687 0.1408262 0.663097 1.6874453 1.327442 1.092024 1.842154 C 3.3816366 22.685231 2.7364256 21.733733 1.9174364 21.124045 1.0971219 20.273793 0.05340437 19.369679 0.00182697 18.102769 0.00319985 16.766221 1.2055723 15.644499 2.5205671 15.613385 3.6107458 15.481414 4.7494569 15.76878 5.6375364 16.417165 3.9100379 14.200904 2.1825394 11.984644 0.45504094 9.768383 1.9476112 8.5496565 2.861684 6.7784333 3.5529932 5.0171652 3.8798135 3.5296378 2.9249347 2.1961675 2.1725326 1.0071025 1.6182514 0.62810631 1.3516075 -0.35190002 2.4016368 0.03538498 z";
net.alphatab.tablature.drawing.MusicFont.SilenceEighth = "M 2.1864407 0 C 3.4927555 -0.03025013 4.7599174 1.3666478 4.3168337 2.6645341 4.2612562 3.1806702 3.5323187 3.6396654 3.4744916 3.8917337 4.2657039 4.3017923 5.1064047 3.7538578 5.6999425 3.2431823 6.6716661 2.3752646 7.281934 1.1805796 7.9663946 0.10705396 8.4801243 -0.19051179 8.3442598 0.36425826 8.251379 0.6538351 7.1534617 5.4358901 6.0555444 10.217945 4.9576271 15 4.6271186 15 4.2966102 15 3.9661017 15 4.9491525 11.059333 5.9322034 7.1186667 6.9152542 3.178 6.2370282 4.4468133 4.7055684 4.956678 3.3397258 4.8871533 2.4692909 4.8228263 1.5305994 4.6546136 0.83723009 4.0864295 -0.2275626 3.2343118 -0.32682648 1.4031462 0.74434533 0.51516691 1.1386684 0.15994522 1.6633576 0.00606553 2.1864407 0 z";
net.alphatab.tablature.drawing.MusicFont.SilenceSixteenth = "M 4.584885 12.117196 C 5.9490829 11.589719 6.7750286 10.241796 7.3545307 8.9710744 7.8252548 7.0303695 8.295979 5.0896645 8.7667032 3.1489595 8.0699915 4.4499053 6.5053194 4.9269906 5.1139052 4.8368018 4.5216227 4.9106855 3.9823526 4.6210228 3.4346292 4.4433786 2.3219805 4.0259279 1.6933994 2.7595504 1.9736104 1.6159082 2.2797936 0.01865673 4.5676359 -0.55040248 5.6429354 0.62979189 6.5486293 1.4306774 6.5062901 3.0473521 5.4543914 3.7082934 5.3601736 4.1947432 6.5902889 3.9915981 6.9796687 3.6638144 8.2310267 2.8945592 8.8289192 1.4721131 9.6987952 0.34599192 9.8702457 -0.15495729 10.506632 -0.00324701 10.174966 0.49193259 8.4207695 7.9946217 6.6665731 15.497311 4.9123768 23 4.6016795 23 4.2909821 23 3.9802848 23 4.920774 19.09529 5.8612633 15.190581 6.8017525 11.285871 6.1336212 12.562885 4.6207625 13.09022 3.249722 12.998905 2.0231855 12.956576 0.61204594 12.439057 0.14485213 11.203998 -0.29621556 10.110259 0.24108585 8.692131 1.4123083 8.3454314 2.5449666 7.8981046 3.9217429 8.5548878 4.2794359 9.7180825 4.5742911 10.548564 4.2135812 11.578267 3.4008762 11.966046 c 0.3850056 0.117797 0.7772672 0.289931 1.1840088 0.15115 z";
net.alphatab.tablature.drawing.MusicFont.SilenceThirtySecond = "M 6.4656427 12.0291 C 8.2882832 11.304325 9.2092671 9.3383691 9.5645931 7.5141929 9.9182977 6.0369486 10.272002 4.5597043 10.625707 3.08246 9.6375205 4.9248821 7.1497124 5.0871792 5.3770715 4.4592281 3.7823927 3.9338223 3.2098554 1.5580994 4.5665168 0.48516125 5.7194161 -0.51887516 7.6112556 0.15343481 8.0746135 1.5517986 8.5985282 2.4292913 7.4822505 3.500006 7.3458973 3.8311419 8.346387 4.3257337 9.3844328 3.4419849 10.00389 2.7116375 c 0.6631 -0.833867 1.129752 -1.90001462 1.816105 -2.6615175 0.559346 -0.12219984 0.04571 0.60715004 0.07267 0.90747302 C 9.5573835 10.971729 7.2221033 20.985864 4.886823 31 4.5684302 30.919951 3.7522964 31.23199 4.0375076 30.676459 4.9471285 26.899906 5.8567494 23.123353 6.7663703 19.3468 5.7687944 21.173722 3.2855618 21.402652 1.5255659 20.673425 0.06973474 20.133036 -0.56238792 18.040523 0.6014551 16.9159 c 1.0822615 -1.126877 3.2198877 -0.655691 3.6557195 0.87125 0.5278405 0.866914 -0.5448822 1.989816 -0.7263667 2.283242 1.1764505 0.474282 2.2904365 -0.588988 2.926416 -1.476376 0.6641209 -0.786577 0.9521446 -1.760823 1.149199 -2.746179 C 7.9779817 14.315958 8.3495406 12.784079 8.7210994 11.2522 7.9561254 12.699001 6.2173866 13.024237 4.722449 12.9313 3.5334626 12.751867 2.126449 12.094087 1.9500303 10.751037 1.5685372 9.3313631 2.8850478 7.9097667 4.3253082 8.1293906 5.8921433 8.209177 6.91519 10.329608 5.7702102 11.5091 c -1.0255544 0.578183 0.1574867 0.674386 0.6954325 0.52 z";
net.alphatab.tablature.drawing.MusicFont.SilenceSixtyFourth = "M 6.6068922 20.614598 C 8.8465956 19.7284 9.5266324 17.198711 9.9790553 15.058735 10.254911 13.863344 10.530766 12.667953 10.806622 11.472562 9.7339213 13.438227 6.9572405 13.602911 5.1280239 12.695358 3.5126267 11.89366 3.4324867 9.1509793 5.2112503 8.4956217 6.8764876 7.6822011 9.0340327 9.6714507 8.1433788 11.370136 7.4755334 12.006199 7.2193895 12.474486 8.3562464 12.311142 9.9556424 11.865893 11.034363 10.258515 11.431566 8.7154772 11.889062 6.8773234 12.346558 5.0391697 12.804054 3.2010159 11.951019 4.7739191 9.9458511 5.1200029 8.330638 4.846333 6.9502759 4.6199586 5.6081405 3.48737 5.8226438 1.9706251 5.872644 0.05313803 8.645372 -0.70095497 9.7534884 0.80385171 10.949603 1.7389034 9.6620851 3.5203421 9.6158449 3.9692435 11.157577 4.3349239 12.186618 2.714527 12.932095 1.5969447 13.179454 1.2603792 14.260084 -0.61297224 14.237705 0.38225034 11.15633 13.588167 8.0749558 26.794083 4.9935814 40 c -0.523245 0.0072 -1.2335821 0.161798 -0.8082248 -0.578244 0.909611 -3.776528 1.8192219 -7.553055 2.7288329 -11.329583 -1.1227718 2.016867 -4.057345 2.197271 -5.8618563 1.059163 -1.46039679 -0.881849 -1.41023174 -3.418291 0.2792885 -4.010453 1.597466 -0.787265 3.647103 0.921684 3.0089528 2.621625 -0.2891341 0.738574 -1.3721997 1.245366 -0.012804 1.200395 1.473995 -0.283697 2.4218424 -1.648782 3.0745734 -2.890648 C 7.8922513 23.985416 8.4106106 21.905048 8.911622 19.820734 8.0614037 21.388898 6.05988 21.741056 4.449409 21.466003 3.0756744 21.230258 1.7416167 20.102891 1.9558193 18.590272 c 0.04894 -1.910979 2.829527 -2.67608 3.9308448 -1.166797 0.8319829 0.890362 0.6099799 2.482723 -0.4833531 3.06299 0.3919628 0.197843 0.780967 0.296313 1.2035812 0.127866";
net.alphatab.tablature.drawing.MusicFont.NoteHalf = "M 2.844087 0.88021707 C 4.0884268 0.11588102 5.693226 -0.30035916 7.095106 0.27393326 8.3299585 0.77657393 9.2038283 2.1517752 8.9512861 3.4918559 8.7270834 5.1851112 7.4944056 6.6048771 6.0054383 7.3636833 4.7429039 8.1294245 3.1009628 8.4996357 1.7059893 7.8723589 0.89980859 7.5378881 0.26675706 6.8205708 0.07361363 5.9652591 -0.18352609 4.8542983 0.22576793 3.6909108 0.83299356 2.7641662 1.3489531 1.9947391 2.0459028 1.348979 2.844087 0.88021707 z M 7.9085894 1.4290171 C 7.3584088 0.9759181 6.5938949 1.130825 5.9501567 1.2318813 4.2972532 1.638437 2.7969664 2.6687373 1.8660001 4.0993179 1.3685443 4.8282624 0.94660328 5.6716009 0.94962015 6.5723845 1.0208965 7.1221519 1.7096152 7.2914779 2.1623945 7.1208171 3.5499616 6.7758194 4.8743361 6.1456038 6.0017665 5.2657192 6.8996943 4.4731276 7.6777605 3.4914635 8.0522268 2.3415683 8.132918 2.0379327 8.1466961 1.6692658 7.9085894 1.4290171 z";
net.alphatab.tablature.drawing.MusicFont.NoteQuarter = "m 2.8511517 0.8719 c 1.2391392 -0.7585 2.8192477 -1.1716 4.219493 -0.6278 1.0488228 0.4404 1.9115522 1.4666 1.927335 2.6383 0.053532 1.6437 -0.9631369 3.1708 -2.2881547 4.0699 -0.9666359 0.6247 -2.0314068 1.1855 -3.207147 1.236 -1.2445117 0.102 -2.61511694 -0.4619 -3.20841614 -1.6043 -0.58168483 -1.1881 -0.23372807 -2.6216 0.45778719 -3.6856 0.52277295 -0.8322 1.24655485 -1.5365 2.09910265 -2.0265 z";
net.alphatab.tablature.drawing.MusicFont.Harmonic = "M 0 4.582822 C 1.4723926 6.0552147 2.9447853 7.5276073 4.4171779 9 5.2379593 7.9996605 6.10149 7.0095514 7.1776354 6.2754916 7.9691393 5.6560537 8.7606431 5.0366158 9.552147 4.4171779 8.0981593 2.9447853 6.6441717 1.4723926 5.190184 0 4.4042112 1.001327 3.3925518 1.7870792 2.5131327 2.7003451 1.7501999 3.4222041 0.89516613 4.0363242 0 4.582822 z";
net.alphatab.tablature.drawing.MusicFont.DeadNote = "M 4.9939024 5.570122 C 5.471544 5.7077458 5.8936759 6.1007821 5.9183617 6.6209508 6.0318445 7.4085646 6.0049844 8.2064963 6.0091463 9 7.0060975 9 8.0030488 9 9 9 9 7.9847561 9 6.9695122 9 5.9542683 8.1511133 5.9387206 7.2865887 6.0104137 6.4550305 5.8084985 5.9955449 5.7267361 5.6328215 5.3142717 5.570122 4.8631211 5.5939809 4.5332112 5.4937294 4.1757206 5.6935976 3.8826219 5.8817082 3.4544256 6.3360991 3.2398819 6.7846203 3.2232011 7.5199693 3.1390998 8.2612193 3.1581801 9 3.1554878 9 2.1402439 9 1.125 9 0.1097561 c -0.9969512 0 -1.9939025 0 -2.9908537 0 -0.015548 0.84888673 0.056145 1.7134113 -0.1457698 2.5449695 -0.081762 0.4594856 -0.4942268 0.822209 -0.9453774 0.8849085 -0.3131135 0 -0.6262271 0 -0.9393406 0 C 3.4873584 3.3936922 3.0894055 2.9638377 3.0735727 2.4366068 2.9705344 1.6655067 2.9944281 0.88580309 2.9908537 0.1097561 c -0.9969512 0 -1.99390247 0 -2.9908537 0 C 0 1.125 0 2.1402439 0 3.1554878 0.84888674 3.1710355 1.7134113 3.0993424 2.5449695 3.3012576 3.0044551 3.38302 3.3671785 3.7954844 3.429878 4.246635 3.4060191 4.5765449 3.5062706 4.9340355 3.3064024 5.2271342 3.1182918 5.6553305 2.6639009 5.8698742 2.2153797 5.886555 1.4800307 5.9706563 0.73878067 5.951576 0 5.9542683 0 6.9695122 0 7.9847561 0 9 0.99695123 9 1.9939025 9 2.9908537 9 3.0064014 8.1511133 2.9347083 7.2865887 3.1366235 6.4550305 3.2189858 6.0069799 3.6092091 5.6338699 4.0545618 5.570122 c 0.3131135 0 0.6262271 0 0.9393406 0 z";
net.alphatab.tablature.drawing.MusicFont.FooterUpEighth = "m 0.19403698 11.856118 c 0 -2.2703863 0 -4.5407727 0 -6.811159 0.47804008 -0.06216 0.87952342 -0.022167 0.82979862 0.6046139 0.2369786 0.9124052 0.3930821 1.8677303 0.9693865 2.644414 0.7708294 1.2011359 1.9906671 2.0007581 2.9390094 3.0469751 1.5366254 1.546658 2.9834513 3.280722 3.6915947 5.377033 0.9007082 2.495341 0.482023 5.261752 -0.4127558 7.69451 C 7.7195648 25.710198 7.0013352 26.906467 6.215493 28.044959 5.5619497 27.638451 6.2064142 27.265141 6.4895103 26.803366 7.595474 25.04341 8.1022645 22.958356 8.1283392 20.893995 7.9783931 18.654885 7.0057908 16.499352 5.4269771 14.903624 4.1153584 13.578305 2.5325271 12.45716 0.76164195 11.856118 c -0.18920166 0 -0.37840331 0 -0.56760497 0 z";
net.alphatab.tablature.drawing.MusicFont.FooterUpSixteenth = "M 8.0682446 20.522776 C 7.8217556 17.12109 5.4832623 14.179306 2.5615038 12.578728 2.0730097 12.29187 0.90757951 11.579754 1.5878729 12.63632 c 0.7722153 1.690976 2.4046425 2.699085 3.6158979 4.040337 1.0866343 1.164153 2.1824241 2.392975 2.8644738 3.846119 z M 0.77350625 16.912303 c -0.41062341 0.04914 -0.76463634 0.04168 -0.6140317 -0.470403 0 -3.813966 0 -7.6279332 0 -11.4419 0.67659974 -0.1761203 0.91140015 0.2297145 0.94945235 0.8842074 0.2182204 1.1702216 0.6837794 2.2952039 1.5168584 3.1678722 2.0135586 1.9449464 4.2192836 3.8347614 5.4777713 6.3911194 1.0896069 2.095626 1.2936098 4.584216 0.6524105 6.847988 0.6893202 2.061494 0.2941913 4.293619 -0.2958859 6.331117 C 7.9700543 30.19988 7.1649825 31.663821 6.2015811 33 5.3399598 32.464331 6.7384683 31.890455 6.8093299 31.207986 7.7212384 29.504767 8.1391257 27.552668 8.0931938 25.628894 8.0663129 24.871974 7.8851964 24.706443 7.6368889 25.480737 7.2221097 26.282081 6.7337502 27.267693 6.161364 27.823768 5.3606119 27.277123 6.8345522 26.670731 6.8641612 25.968611 7.19824 25.275213 7.5241455 24.56632 7.6998268 23.814048 6.8981621 20.894021 4.5096588 18.648108 1.85136 17.349449 1.5004416 17.184151 1.1405812 17.037742 0.77350625 16.912303 z";
net.alphatab.tablature.drawing.MusicFont.FooterUpThirtySecond = "M 8.00785 20.3631 C 7.7419634 16.678288 5.0630851 13.56416 1.83109 11.9988 0.45469273 11.270579 2.1734608 13.662872 2.6455794 14.101794 4.6314459 15.983181 6.8010274 17.881197 8.00785 20.3631 z M 0.00162 0 c 0.93381462 -0.28514957 0.8193481 0.80714817 1.0478345 1.4295781 0.2803803 1.7653776 1.6602707 3.0057805 2.9141899 4.1451485 2.227163 2.103278 4.424139 4.5900324 4.9202922 7.7203254 0.1817268 1.250028 0.1620208 2.535402 -0.1365866 3.766448 0.4749419 1.659017 0.402825 3.436541 -0.04508 5.0932 0.7635674 2.363061 0.2282278 4.922938 -0.5760737 7.2049 C 7.6315093 30.660401 6.9255602 31.871352 6.11607 33 5.2395177 32.323568 7.0166057 31.522537 7.0061791 30.625037 7.7616369 28.996812 8.1090137 27.16365 8.0123775 25.37555 7.923342 23.940421 7.3787319 26.082696 6.9868 26.488 6.7838568 27.03295 5.8238689 28.322478 5.8646694 27.283272 6.7313187 26.260303 7.2756986 24.989282 7.63317 23.7076 7.3678156 23.055809 7.0518723 21.189503 6.4830325 22.599275 6.3087575 23.579594 5.2692917 22.837168 6.0683673 22.360512 7.3134713 21.19546 5.4021893 20.071625 4.6991947 19.159158 3.4873657 18.07793 2.0546012 17.143978 0.48449842 16.7249 -0.12640341 16.923316 -0.01099758 16.395425 0 15.971941 0.00107986 10.648501 -0.00215979 5.32074 0.00162 0 z M 7.83374 14.7694 C 7.2127733 11.395336 4.5950189 8.6398347 1.51838 7.2852 2.2984135 8.9467355 3.9111476 9.9461143 5.1081416 11.273887 6.1312597 12.335381 7.0986893 13.507992 7.83374 14.7694 z";
net.alphatab.tablature.drawing.MusicFont.FooterUpSixtyFourth = "m 8.0712401 20.529024 c -0.2881217 -3.95408 -3.3083449 -7.21635 -6.8430079 -8.722955 0.5413598 2.104476 2.5440517 3.269645 3.9196901 4.797782 1.1053247 1.189878 2.2321528 2.438206 2.9233178 3.925173 z M 7.8957784 14.889182 C 7.2679236 11.484621 4.6342159 8.7149525 1.5290237 7.3443272 2.3532516 9.0764006 4.0487012 10.112751 5.2928348 11.50939 c 0.9627266 1.044692 1.8923445 2.14377 2.6029436 3.379792 z M 0.62664908 21.556728 C -0.03876123 21.752683 -0.07691759 21.321384 0 20.77501 0 13.850007 0 6.9250035 0 0 1.280146 -0.29595564 0.80824039 1.6291127 1.3153756 2.360215 2.1295912 4.3229714 4.0239011 5.4564295 5.3891821 6.9934037 7.427044 9.1356901 9.1502757 11.867561 9.0728995 14.930502 c -0.184992 1.541798 -0.1915414 2.99329 0.071869 4.529302 0.083226 1.476269 -0.6325568 2.863738 -0.064623 4.296462 0.3069137 1.408285 -0.3058183 2.812873 -0.1472625 4.186016 C 9.4726331 31.501512 8.204533 35.138387 6.116095 38 5.2065154 37.289171 7.0325822 36.507954 7.0131823 35.58887 7.7821284 33.880189 8.1811245 31.949135 7.9960421 30.079156 7.4622734 30.998724 6.8342356 32.929252 6.0058321 33.091445 5.7521994 32.270289 7.3400838 31.188397 7.3858427 30.095213 8.0968789 29.160293 7.4168934 27.27583 6.8187253 27.0121 6.6916223 27.620107 5.7968855 28.353875 5.9081259 27.504803 7.3732295 26.46352 5.841675 25.230827 5.0225924 24.331217 3.7885674 23.101671 2.2656072 22.145315 0.62664908 21.556728 z m 7.26912932 3.459103 c 0.1686807 0.543022 0.1070891 -0.399133 0 0 z M 6.4670185 22.860158 c 0.4018703 0.556511 1.4541407 2.234576 1.1248352 0.711247 -0.3410446 -0.71364 -0.4331583 -2.26834 -1.1248352 -0.711247 z M 1.378628 17.145119 c 0.9477571 2.055992 3.0309611 3.193611 4.405343 4.919195 0.7092534 0.999322 1.1584713 -0.970888 0.2647592 -1.32595 C 4.8406226 19.153998 3.2128925 17.917754 1.378628 17.145119 z";
net.alphatab.tablature.drawing.MusicFont.FooterDownEighth = "m 0 -9.832334 c 0 2.2703864 0 4.5407724 0 6.8111594 0.47804008 0.06216 0.87952342 0.02217 0.82979862 -0.604614 0.23697858 -0.912405 0.39308208 -1.867731 0.96938648 -2.644414 0.7708294 -1.201136 1.9906671 -2.0007584 2.9390094 -3.0469754 1.5366254 -1.546658 2.9834513 -3.280722 3.6915947 -5.377033 0.9007082 -2.495341 0.482023 -5.261752 -0.4127558 -7.69451 -0.4915056 -1.297693 -1.2097352 -2.493962 -1.9955774 -3.632454 -0.6535433 0.406508 -0.00908 0.779818 0.2740173 1.241593 1.1059637 1.759956 1.6127542 3.84501 1.6388289 5.909371 -0.1499461 2.23911 -1.1225484 4.394643 -2.7013621 5.990371 -1.3116187 1.325319 -2.89445 2.446464 -4.66533513 3.047506 -0.18920166 0 -0.37840331 0 -0.56760497 0 z";
net.alphatab.tablature.drawing.MusicFont.FooterDownSixteenth = "m 7.9441413 -15.563988 c -0.246489 3.401686 -2.5849823 6.34347 -5.5067408 7.944048 -0.4884941 0.286858 -1.65392429 0.998974 -0.9736309 -0.05759 0.7722153 -1.690976 2.4046425 -2.699085 3.6158979 -4.040337 1.0866343 -1.164153 2.1824241 -2.392975 2.8644738 -3.846119 z m -7.29473835 3.610473 c -0.41062341 -0.04914 -0.76463634 -0.04168 -0.6140317 0.470403 0 3.813966 0 7.627933 0 11.44189995 0.67659974 0.1761197 0.91140015 -0.229715 0.94945235 -0.884208 C 1.203044 -2.095641 1.668603 -3.220624 2.501682 -4.093292 c 2.0135586 -1.944946 4.2192836 -3.834761 5.4777713 -6.391119 1.0896069 -2.095626 1.2936098 -4.584216 0.6524105 -6.847988 0.6893202 -2.061494 0.2941913 -4.293619 -0.2958859 -6.331117 -0.4900269 -1.577576 -1.2950987 -3.041517 -2.2585001 -4.377696 -0.8616213 0.535669 0.5368872 1.109545 0.6077488 1.792014 0.9119085 1.703219 1.3297958 3.655318 1.2838639 5.579092 -0.026881 0.75692 -0.2079974 0.922451 -0.4563049 0.148157 -0.4147792 -0.801344 -0.9031387 -1.786956 -1.4755249 -2.343031 -0.8007521 0.546645 0.6731882 1.153037 0.7027972 1.855157 0.3340788 0.693398 0.6599843 1.402291 0.8356656 2.154563 -0.8016647 2.920027 -3.190168 5.16594 -5.8484668 6.464599 -0.3509184 0.165298 -0.7107788 0.311707 -1.07785375 0.437146 z";
net.alphatab.tablature.drawing.MusicFont.FooterDownThirtySecond = "m 8.00785 -20.40967 c -0.2658866 3.684812 -2.9447649 6.79894 -6.17676 8.3643 -1.37639727 0.728221 0.3423708 -1.664072 0.8144894 -2.102994 1.9858665 -1.881387 4.155448 -3.779403 5.3622706 -6.261306 z M 0.00162 -0.04656966 c 0.93381462 0.28515 0.8193481 -0.807148 1.0478345 -1.42957804 0.2803803 -1.765377 1.6602707 -3.00578 2.9141899 -4.145148 2.227163 -2.103278 4.424139 -4.5900333 4.9202922 -7.7203263 0.1817268 -1.250028 0.1620208 -2.535402 -0.1365866 -3.766448 0.4749419 -1.659017 0.402825 -3.436541 -0.04508 -5.0932 0.7635674 -2.36306 0.2282278 -4.922937 -0.5760737 -7.204899 -0.494687 -1.300801 -1.2006361 -2.511752 -2.0101263 -3.6404 -0.8765523 0.676432 0.9005357 1.477463 0.8901091 2.374963 0.7554578 1.628225 1.1028346 3.461387 1.0061984 5.249487 -0.089035 1.435129 -0.6336456 -0.707146 -1.0255775 -1.11245 -0.2029432 -0.54495 -1.1629311 -1.834478 -1.1221306 -0.795272 0.8666493 1.022969 1.4110292 2.29399 1.7685006 3.575672 -0.2653544 0.651791 -0.5812977 2.518096 -1.1501375 1.108324 -0.174275 -0.980318 -1.2137408 -0.237893 -0.4146652 0.238763 1.245104 1.165052 -0.666178 2.288887 -1.3691726 3.201354 -1.211829 1.081228 -2.6445935 2.01518 -4.21469628 2.434258 -0.61090183 -0.198416 -0.495496 0.329475 -0.48449842 0.752959 0.00107986 5.32344 -0.00215979 10.6512013 0.00162 15.97194134 z M 7.83374 -14.81597 c -0.6209667 3.374064 -3.2387211 6.1295663 -6.31536 7.4842003 0.7800335 -1.661535 2.3927676 -2.660914 3.5897616 -3.9886873 1.0231181 -1.061494 1.9905477 -2.234105 2.7255984 -3.495513 z";
net.alphatab.tablature.drawing.MusicFont.FooterDownSixtyFourth = "m 8.0712401 -20.559698 c -0.2881217 3.95408 -3.3083449 7.21635 -6.8430079 8.722955 0.5413598 -2.104476 2.5440517 -3.269645 3.9196901 -4.797782 1.1053247 -1.189878 2.2321528 -2.438206 2.9233178 -3.925173 z m -0.1754617 5.639842 c -0.6278548 3.404561 -3.2615625 6.1742288 -6.3667547 7.5448548 0.8242279 -1.732074 2.5196775 -2.7684238 3.7638111 -4.1650628 0.9627266 -1.044692 1.8923445 -2.14377 2.6029436 -3.379792 z M 0.62664908 -21.587402 C -0.03876123 -21.783357 -0.07691759 -21.352058 0 -20.805684 c 0 6.925003 0 13.8500058 0 20.77500981 1.280146 0.295956 0.80824039 -1.62911301 1.3153756 -2.36021501 0.8142156 -1.962757 2.7085255 -3.096215 4.0738065 -4.633189 2.0378619 -2.142286 3.7610936 -4.8741568 3.6837174 -7.9370978 -0.184992 -1.541798 -0.1915414 -2.99329 0.071869 -4.529302 0.083226 -1.476269 -0.6325568 -2.863738 -0.064623 -4.296462 0.3069137 -1.408285 -0.3058183 -2.812873 -0.1472625 -4.186016 0.5397501 -3.55923 -0.72835 -7.196105 -2.816788 -10.057718 -0.9095796 0.710829 0.9164872 1.492046 0.8970873 2.41113 0.7689461 1.708681 1.1679422 3.639735 0.9828598 5.509714 -0.5337687 -0.919568 -1.1618065 -2.850096 -1.99021 -3.012289 -0.2536327 0.821156 1.3342517 1.903048 1.3800106 2.996232 0.7110362 0.93492 0.031051 2.819383 -0.5671174 3.083113 -0.127103 -0.608007 -1.0218398 -1.341775 -0.9105994 -0.492703 1.4651036 1.041283 -0.066451 2.273976 -0.8855335 3.173586 -1.234025 1.229546 -2.7569852 2.185902 -4.39594332 2.774489 z m 7.26912932 -3.459103 c 0.1686807 -0.543022 0.1070891 0.399133 0 0 z m -1.4287599 2.155673 c 0.4018703 -0.556511 1.4541407 -2.234576 1.1248352 -0.711247 -0.3410446 0.71364 -0.4331583 2.26834 -1.1248352 0.711247 z m -5.0883905 5.715039 c 0.9477571 -2.055992 3.0309611 -3.193611 4.405343 -4.919195 0.7092534 -0.999322 1.1584713 0.970888 0.2647592 1.32595 -1.2081076 1.584366 -2.8358377 2.82061 -4.6701022 3.593245 z";
net.alphatab.tablature.drawing.MusicFont.HammerPullUp = "M 20.158654 7 C 18.720384 5.0897869 16.959259 3.1952764 14.557392 2.5808289 12.07033 1.9123231 9.4379254 1.8872166 6.8990385 2.2463943 5.2521338 2.4762611 3.6424657 3.1161401 2.4270207 4.2751883 1.5171024 5.0870714 0.72865538 6.0249638 0 7 0.96533405 4.5580267 2.9933611 2.6836261 5.210036 1.3629808 7.4904871 0.00880669 10.359562 -0.42856459 12.882209 0.48369183 15.028867 1.2495373 16.938012 2.6237245 18.480957 4.2882363 19.190644 5.0859076 19.78511 5.9963755 20.158654 7 z";
net.alphatab.tablature.drawing.MusicFont.GraceNote = "M 5.6230469 17.022354 C 5.2928444 18.806006 3.4192157 20.244739 1.5993334 19.965089 0.54977356 19.791886 -0.22613936 18.681908 0.05985309 17.63679 0.39312285 16.15639 1.8349403 15.129042 3.2776413 14.902967 c 0.7358768 -0.100852 1.5472485 0.134934 2.0224993 0.726855 0 -1.957619 0 -3.915238 0 -5.8728568 C 4.8965079 10.369142 4.4928753 10.981318 4.0892426 11.593494 3.8021382 11.450377 3.5681311 11.296108 3.8856989 11.025997 4.3571795 10.306989 4.82866 9.5879812 5.3001406 8.8689734 c 0 -2.9532459 0 -5.9064918 0 -8.85973773 C 5.959782 -0.19030778 5.8098961 0.67386816 6.0001911 1.0725556 6.2815991 2.376778 7.4861869 3.1119798 8.3352694 4.0333432 8.5396854 4.1192163 8.681338 3.5915275 8.8594545 3.4203021 9.2270025 2.8618202 9.5945504 2.3033382 9.9620984 1.7448563 10.249027 1.8878591 10.483042 2.0421339 10.1674 2.3134995 9.7020609 3.0321253 9.2367214 3.7507512 8.7713819 4.469377 10.000387 5.789384 11.008203 7.4751773 10.970549 9.3335451 10.956739 11.235663 10.21394 13.069747 9.1144696 14.600558 8.5809314 14.145753 9.6885435 13.649852 9.6868083 13.077318 10.163078 12.05979 10.383754 10.906949 10.307945 9.7887352 10.144943 8.1621028 9.2485683 6.6904313 7.9924095 5.6682048 7.2192044 6.7939265 6.4537977 7.9963106 5.6835918 9.1515162 c 0 2.6236128 0 5.2472248 0 7.8708378 l -0.045611 0 -0.014933 0 -9e-7 0 z M 7.600847 5.3573689 C 7.0735118 5.0279497 6.1087101 4.2688852 5.6835918 4.4649386 c 0 1.2661952 0 2.5323905 0 3.7985857 C 6.3226769 7.2948058 6.9617619 6.3260874 7.600847 5.3573689 z";
net.alphatab.tablature.drawing.MusicFont.GraceDeadNote = "M 0.7761194 8 C 0.51741293 8 0.25870647 8 0 8 0 5.3333333 0 2.6666667 0 0 c 3.986733 0 7.973466 0 11.960199 0 0 2.6666667 0 5.3333333 0 8 -0.252073 0 -0.504145 0 -0.756218 0 0 -1.8971808 0 -3.7943615 0 -5.6915423 -3.4759539 0 -6.9519077 0 -10.4278616 0 0 1.8971808 0 3.7943615 0 5.6915423 z";
net.alphatab.tablature.drawing.MusicFont.TrillUpEigth = "M 0 4.7708978 L 9 0.3684211 9 2.7089783 0 7 0 4.7708978 z";
net.alphatab.tablature.drawing.MusicFont.TrillUpSixteenth = "M 0 8.770898 L 9 4.3684211 9 6.708978 0 11 0 8.770898 z M 0 4.7306502 L 9 0.3281734 9 2.6687307 0 6.959752 0 4.7306502 z";
net.alphatab.tablature.drawing.MusicFont.TrillUpThirtySecond = "M 0 5.1362229 L 9 0.7337461 9 3.0743034 0 7.3653251 0 5.1362229 z M 0 9.0092879 L 9 4.6068111 9 6.9473684 0 11.23839 0 9.0092879 z M 0 12.770898 L 9 8.3684211 9 10.708978 0 15 0 12.770898 z";
net.alphatab.tablature.drawing.MusicFont.TrillDownEigth = "";
net.alphatab.tablature.drawing.MusicFont.TrillDownSixteenth = "";
net.alphatab.tablature.drawing.MusicFont.TrillDownThirtySecond = "";
net.alphatab.tablature.drawing.MusicFont.AccentuatedNote = "M 13 3.178499 L 0 6 0 5.6308316 11.127789 3.178499 0 0.7261663 0 0.356998 13 3.178499 z";
net.alphatab.tablature.drawing.MusicFont.HeavyAccentuatedNote = "M 11 12 L 7.5974576 12 4.1483051 5.6144068 0.83898305 12 0 12 5.220339 1.6991526 11 12 z";
net.alphatab.tablature.drawing.MusicFont.VibratoLeftRight = "M 11.189664 5.5813955 C 10.10042 6.6529925 9.0866079 7.8051485 7.9314969 8.8066518 7.3487624 9.2967324 6.9841837 8.2593759 6.5479642 7.933765 5.3603051 6.6227434 4.1788808 5.3060572 2.9839103 4.0016785 2.4141734 4.2259972 1.9952232 4.7304065 1.5349527 5.1288 1.0233018 5.6160865 0.51165092 6.103373 0 6.5906595 0.02274972 6.160458 -0.04553929 5.6912893 0.03419799 5.2854802 1.785601 3.626446 3.5133126 1.9409459 5.2808081 0.29990223 5.9337936 -0.41168007 6.3974122 0.74155913 6.9193185 1.1024218 7.9923085 2.214522 8.9943764 3.397406 10.136519 4.4404885 11.34214 3.5295603 12.361477 2.390267 13.467265 1.3582751 13.894892 0.90129843 14.403874 0.54274353 14.87567 0.14014753 c 0.539444 0.2262104 0.808667 0.8228694 1.216989 1.22764897 0.810291 0.9092409 1.559001 1.8768682 2.414167 2.7435845 0.451921 0.7154056 1.076971 0.8743839 1.612628 0.1426133 0.588046 -0.6297642 1.154229 -1.2811423 1.733301 -1.9197948 -0.02227 0.4454016 0.0445 0.9274384 -0.03326 1.3500134 C 20.278271 5.2264473 18.762755 6.7979455 17.205479 8.3219033 16.781477 8.8560595 16.088361 9.2926227 15.653023 8.5089189 14.456919 7.283733 13.392959 5.9331751 12.155046 4.7476565 11.73232 4.8662391 11.53755 5.345741 11.189664 5.5813955 z";
net.alphatab.model.effects.BendEffect.SEMITONE_LENGTH = 1;
net.alphatab.model.effects.BendEffect.MAX_POSITION = 12;
net.alphatab.model.effects.BendEffect.MAX_VALUE = 12;
net.alphatab.model.Tuplet.NORMAL = new net.alphatab.model.Tuplet();
net.alphatab.model.Duration.QUARTER_TIME = 960;
net.alphatab.model.Duration.WHOLE = 1;
net.alphatab.model.Duration.HALF = 2;
net.alphatab.model.Duration.QUARTER = 4;
net.alphatab.model.Duration.EIGHTH = 8;
net.alphatab.model.Duration.SIXTEENTH = 16;
net.alphatab.model.Duration.THIRTY_SECOND = 32;
net.alphatab.model.Duration.SIXTY_FOURTH = 64;
net.alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES = (function($this) {
	var $r;
	var a = new Array();
	a.push([12,12]);
	a.push([9,28]);
	a.push([5,28]);
	a.push([7,19]);
	a.push([4,28]);
	a.push([3,31]);
	$r = a;
	return $r;
}(this));
haxe.Unserializer.DEFAULT_RESOLVER = Type;
haxe.Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.Unserializer.CODES = null;
net.alphatab.midi.MidiSequenceParser.DEFAULT_BEND = 64;
net.alphatab.midi.MidiSequenceParser.DEFAULT_BEND_SEMITONE = 2.75;
net.alphatab.midi.MidiSequenceParser.DEFAULT_DURATION_DEAD = 30;
net.alphatab.midi.MidiSequenceParser.DEFAULT_DURATION_PM = 80;
net.alphatab.midi.MidiSequenceParser.DEFAULT_METRONOME_KEY = 37;
net.alphatab.model.HeaderFooterElements.NONE = 0;
net.alphatab.model.HeaderFooterElements.TITLE = 1;
net.alphatab.model.HeaderFooterElements.SUBTITLE = 2;
net.alphatab.model.HeaderFooterElements.ARTIST = 4;
net.alphatab.model.HeaderFooterElements.ALBUM = 8;
net.alphatab.model.HeaderFooterElements.WORDS = 16;
net.alphatab.model.HeaderFooterElements.MUSIC = 32;
net.alphatab.model.HeaderFooterElements.WORDS_AND_MUSIC = 64;
net.alphatab.model.HeaderFooterElements.COPYRIGHT = 128;
net.alphatab.model.HeaderFooterElements.PAGE_NUMBER = 256;
net.alphatab.model.HeaderFooterElements.ALL = 511;
net.alphatab.midi.MidiSequenceParserFlags.ADD_DEFAULT_CONTROLS = 1;
net.alphatab.midi.MidiSequenceParserFlags.ADD_MIXER_MESSAGES = 2;
net.alphatab.midi.MidiSequenceParserFlags.ADD_METRONOME = 4;
net.alphatab.midi.MidiSequenceParserFlags.ADD_FIRST_TICK_MOVE = 8;
net.alphatab.midi.MidiSequenceParserFlags.DEFAULT_PLAY_FLAGS = 15;
haxe.remoting.ExternalConnection.connections = new Hash();
net.alphatab.model.MidiChannel.DEFAULT_PERCUSSION_CHANNEL = 9;
net.alphatab.model.MidiChannel.DEFAULT_INSTRUMENT = 25;
net.alphatab.model.MidiChannel.DEFAULT_VOLUME = 127;
net.alphatab.model.MidiChannel.DEFAULT_BALANCE = 64;
net.alphatab.model.MidiChannel.DEFAULT_CHORUS = 0;
net.alphatab.model.MidiChannel.DEFAULT_REVERB = 0;
net.alphatab.model.MidiChannel.DEFAULT_PHASER = 0;
net.alphatab.model.MidiChannel.DEFAULT_TREMOLO = 0;
$Main.init = net.alphatab.Main.main();
