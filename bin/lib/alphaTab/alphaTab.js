$estr = function() { return js.Boot.__string_rec(this,''); }
if(typeof alphatab=='undefined') alphatab = {}
if(!alphatab.midi) alphatab.midi = {}
alphatab.midi.MidiSequenceParserFlags = function() { }
alphatab.midi.MidiSequenceParserFlags.__name__ = ["alphatab","midi","MidiSequenceParserFlags"];
alphatab.midi.MidiSequenceParserFlags.prototype.__class__ = alphatab.midi.MidiSequenceParserFlags;
if(!alphatab.model) alphatab.model = {}
if(!alphatab.model.effects) alphatab.model.effects = {}
alphatab.model.effects.BendPoint = function(position,value,vibrato) { if( position === $_ ) return; {
	if(vibrato == null) vibrato = false;
	if(value == null) value = 0;
	if(position == null) position = 0;
	this.position = position;
	this.value = value;
	this.vibrato = vibrato;
}}
alphatab.model.effects.BendPoint.__name__ = ["alphatab","model","effects","BendPoint"];
alphatab.model.effects.BendPoint.prototype.GetTime = function(duration) {
	return Math.floor((duration * this.position) / 12);
}
alphatab.model.effects.BendPoint.prototype.position = null;
alphatab.model.effects.BendPoint.prototype.value = null;
alphatab.model.effects.BendPoint.prototype.vibrato = null;
alphatab.model.effects.BendPoint.prototype.__class__ = alphatab.model.effects.BendPoint;
if(!alphatab.tablature) alphatab.tablature = {}
if(!alphatab.tablature.drawing) alphatab.tablature.drawing = {}
alphatab.tablature.drawing.TempoPainter = function() { }
alphatab.tablature.drawing.TempoPainter.__name__ = ["alphatab","tablature","drawing","TempoPainter"];
alphatab.tablature.drawing.TempoPainter.paintTempo = function(context,x,y,scale) {
	var realScale = scale / 5.0;
	var layer = context.get(3);
	var draw = context.get(4);
	var iWidth = Math.round(scale * 1.33);
	var iHeight = Math.round(scale * 3.5);
	alphatab.tablature.drawing.NotePainter.paintNote(layer,Math.floor(x + (realScale)),Math.floor(y + (iHeight - (scale))),realScale / 1.6,true,alphatab.tablature.drawing.DrawingResources.tempoFont);
	draw.startFigure();
	draw.moveTo(x + iWidth,y);
	draw.lineTo(x + iWidth,Math.floor(y + (iHeight - (0.66 * scale))));
}
alphatab.tablature.drawing.TempoPainter.prototype.__class__ = alphatab.tablature.drawing.TempoPainter;
alphatab.model.effects.HarmonicEffect = function(p) { if( p === $_ ) return; {
	null;
}}
alphatab.model.effects.HarmonicEffect.__name__ = ["alphatab","model","effects","HarmonicEffect"];
alphatab.model.effects.HarmonicEffect.prototype.clone = function(factory) {
	var effect = factory.newHarmonicEffect();
	effect.type = this.type;
	effect.data = this.data;
	return effect;
}
alphatab.model.effects.HarmonicEffect.prototype.data = null;
alphatab.model.effects.HarmonicEffect.prototype.type = null;
alphatab.model.effects.HarmonicEffect.prototype.__class__ = alphatab.model.effects.HarmonicEffect;
alphatab.model.effects.GraceEffect = function(p) { if( p === $_ ) return; {
	this.fret = 0;
	this.duration = 1;
	this.velocity = 95;
	this.transition = 0;
	this.isOnBeat = false;
	this.isDead = false;
}}
alphatab.model.effects.GraceEffect.__name__ = ["alphatab","model","effects","GraceEffect"];
alphatab.model.effects.GraceEffect.prototype.clone = function(factory) {
	var effect = factory.newGraceEffect();
	effect.fret = this.fret;
	effect.duration = this.duration;
	effect.velocity = this.velocity;
	effect.transition = this.transition;
	effect.isOnBeat = this.isOnBeat;
	effect.isDead = this.isDead;
	return effect;
}
alphatab.model.effects.GraceEffect.prototype.duration = null;
alphatab.model.effects.GraceEffect.prototype.durationTime = function() {
	return Math.floor((960 / 16.00) * this.duration);
}
alphatab.model.effects.GraceEffect.prototype.fret = null;
alphatab.model.effects.GraceEffect.prototype.isDead = null;
alphatab.model.effects.GraceEffect.prototype.isOnBeat = null;
alphatab.model.effects.GraceEffect.prototype.transition = null;
alphatab.model.effects.GraceEffect.prototype.velocity = null;
alphatab.model.effects.GraceEffect.prototype.__class__ = alphatab.model.effects.GraceEffect;
alphatab.midi.MidiController = function() { }
alphatab.midi.MidiController.__name__ = ["alphatab","midi","MidiController"];
alphatab.midi.MidiController.prototype.__class__ = alphatab.midi.MidiController;
alphatab.midi.MidiMessageUtils = function() { }
alphatab.midi.MidiMessageUtils.__name__ = ["alphatab","midi","MidiMessageUtils"];
alphatab.midi.MidiMessageUtils.fixValue = function(value) {
	var fixedValue = value;
	fixedValue = Math.min(fixedValue,127);
	fixedValue = Math.max(fixedValue,0);
	return fixedValue;
}
alphatab.midi.MidiMessageUtils.fixChannel = function(channel) {
	var fixedChannel = channel;
	fixedChannel = Math.min(fixedChannel,15);
	fixedChannel = Math.max(fixedChannel,0);
	return fixedChannel;
}
alphatab.midi.MidiMessageUtils.noteOn = function(channel,note,velocity) {
	return (("0" + StringTools.hex(alphatab.midi.MidiMessageUtils.fixChannel(channel),1)) + StringTools.hex(alphatab.midi.MidiMessageUtils.fixValue(note),2)) + StringTools.hex(alphatab.midi.MidiMessageUtils.fixValue(velocity),2);
}
alphatab.midi.MidiMessageUtils.noteOff = function(channel,note,velocity) {
	return (("1" + StringTools.hex(alphatab.midi.MidiMessageUtils.fixChannel(channel),1)) + StringTools.hex(alphatab.midi.MidiMessageUtils.fixValue(note),2)) + StringTools.hex(alphatab.midi.MidiMessageUtils.fixValue(velocity),2);
}
alphatab.midi.MidiMessageUtils.controlChange = function(channel,controller,value) {
	return (("2" + StringTools.hex(alphatab.midi.MidiMessageUtils.fixChannel(channel),1)) + StringTools.hex(alphatab.midi.MidiMessageUtils.fixValue(controller),2)) + StringTools.hex(alphatab.midi.MidiMessageUtils.fixValue(value),2);
}
alphatab.midi.MidiMessageUtils.programChange = function(channel,instrument) {
	return ("3" + StringTools.hex(alphatab.midi.MidiMessageUtils.fixChannel(channel),1)) + StringTools.hex(alphatab.midi.MidiMessageUtils.fixValue(instrument),2);
}
alphatab.midi.MidiMessageUtils.pitchBend = function(channel,value) {
	return ("4" + StringTools.hex(alphatab.midi.MidiMessageUtils.fixChannel(channel),1)) + StringTools.hex(alphatab.midi.MidiMessageUtils.fixValue(value),2);
}
alphatab.midi.MidiMessageUtils.systemReset = function() {
	return "5";
}
alphatab.midi.MidiMessageUtils.tempoInUSQ = function(usq) {
	return "6" + StringTools.hex(usq);
}
alphatab.midi.MidiMessageUtils.timeSignature = function(ts) {
	return (((("7" + StringTools.hex(ts.numerator)) + ",") + StringTools.hex(ts.denominator.index())) + ",") + StringTools.hex(ts.denominator.value);
}
alphatab.midi.MidiMessageUtils.intToString = function(num) {
	return StringTools.hex(num);
}
alphatab.midi.MidiMessageUtils.channelToString = function(num) {
	return StringTools.hex(num,1);
}
alphatab.midi.MidiMessageUtils.valueToString = function(num) {
	return StringTools.hex(num,2);
}
alphatab.midi.MidiMessageUtils.prototype.__class__ = alphatab.midi.MidiMessageUtils;
alphatab.model.HeaderFooterElements = function() { }
alphatab.model.HeaderFooterElements.__name__ = ["alphatab","model","HeaderFooterElements"];
alphatab.model.HeaderFooterElements.prototype.__class__ = alphatab.model.HeaderFooterElements;
alphatab.model.effects.GraceEffectTransition = function() { }
alphatab.model.effects.GraceEffectTransition.__name__ = ["alphatab","model","effects","GraceEffectTransition"];
alphatab.model.effects.GraceEffectTransition.prototype.__class__ = alphatab.model.effects.GraceEffectTransition;
alphatab.tablature.drawing.SvgPainter = function(layer,svg,x,y,xScale,yScale) { if( layer === $_ ) return; {
	this._layer = layer;
	this._svg = svg;
	this._x = x;
	this._y = y;
	this._xScale = xScale * 0.98;
	this._yScale = yScale * 0.98;
	this._currentPosition = new alphatab.model.Point(x,y);
	this._token = svg.split(" ");
	this._currentIndex = 0;
}}
alphatab.tablature.drawing.SvgPainter.__name__ = ["alphatab","tablature","drawing","SvgPainter"];
alphatab.tablature.drawing.SvgPainter.prototype._currentIndex = null;
alphatab.tablature.drawing.SvgPainter.prototype._currentPosition = null;
alphatab.tablature.drawing.SvgPainter.prototype._layer = null;
alphatab.tablature.drawing.SvgPainter.prototype._svg = null;
alphatab.tablature.drawing.SvgPainter.prototype._token = null;
alphatab.tablature.drawing.SvgPainter.prototype._x = null;
alphatab.tablature.drawing.SvgPainter.prototype._xScale = null;
alphatab.tablature.drawing.SvgPainter.prototype._y = null;
alphatab.tablature.drawing.SvgPainter.prototype._yScale = null;
alphatab.tablature.drawing.SvgPainter.prototype.getNumber = function() {
	return Std.parseFloat(this._token[this._currentIndex++]);
}
alphatab.tablature.drawing.SvgPainter.prototype.getString = function() {
	return this._token[this._currentIndex++];
}
alphatab.tablature.drawing.SvgPainter.prototype.isNextCommand = function() {
	var command = this.peekString();
	return command == "m" || command == "M" || command == "c" || command == "C" || command == "q" || command == "Q" || command == "l" || command == "L" || command == "z" || command == "Z";
}
alphatab.tablature.drawing.SvgPainter.prototype.paint = function() {
	this._layer.startFigure();
	while(this._currentIndex < this._token.length) {
		this.parseCommand();
	}
}
alphatab.tablature.drawing.SvgPainter.prototype.parseCommand = function() {
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
alphatab.tablature.drawing.SvgPainter.prototype.peekNumber = function() {
	return Std.parseFloat(this._token[this._currentIndex]);
}
alphatab.tablature.drawing.SvgPainter.prototype.peekString = function() {
	return this._token[this._currentIndex];
}
alphatab.tablature.drawing.SvgPainter.prototype.__class__ = alphatab.tablature.drawing.SvgPainter;
alphatab.tablature.drawing.DrawingLayer = function(color,isFilled,penWidth) { if( color === $_ ) return; {
	this._path = new Array();
	this._color = color;
	this._isFilled = isFilled;
	this._penWidth = penWidth;
	this._currentPosition = new alphatab.model.Point(0,0);
}}
alphatab.tablature.drawing.DrawingLayer.__name__ = ["alphatab","tablature","drawing","DrawingLayer"];
alphatab.tablature.drawing.DrawingLayer.prototype._color = null;
alphatab.tablature.drawing.DrawingLayer.prototype._currentPosition = null;
alphatab.tablature.drawing.DrawingLayer.prototype._isFilled = null;
alphatab.tablature.drawing.DrawingLayer.prototype._path = null;
alphatab.tablature.drawing.DrawingLayer.prototype._penWidth = null;
alphatab.tablature.drawing.DrawingLayer.prototype.addBezier = function(x1,y1,x2,y2,x3,y3,x4,y4) {
	this._path.push({ Command : "addBezier", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3, X4 : x4, Y4 : y4});
}
alphatab.tablature.drawing.DrawingLayer.prototype.addCircle = function(x,y,diameter) {
	this._path.push({ Command : "addCircle", X : x, Y : y, Radius : diameter / 2});
}
alphatab.tablature.drawing.DrawingLayer.prototype.addLine = function(x1,y1,x2,y2) {
	this._path.push({ Command : "addLine", X1 : (x1) + 0.5, Y1 : (y1) + 0.5, X2 : (x2) + 0.5, Y2 : (y2) + 0.5});
}
alphatab.tablature.drawing.DrawingLayer.prototype.addMusicSymbol = function(symbol,x,y,xScale,yScale) {
	if(yScale == null) yScale = 0;
	if(yScale == 0) {
		yScale = xScale;
	}
	var painter = new alphatab.tablature.drawing.SvgPainter(this,symbol,x,y,xScale,yScale);
	painter.paint();
}
alphatab.tablature.drawing.DrawingLayer.prototype.addPolygon = function(points) {
	this._path.push({ Command : "addPolygon", Points : points});
}
alphatab.tablature.drawing.DrawingLayer.prototype.addRect = function(x,y,w,h) {
	this._path.push({ Command : "addRect", X : x, Y : y, Width : w, Height : h});
}
alphatab.tablature.drawing.DrawingLayer.prototype.addString = function(str,font,x,y,baseline) {
	if(baseline == null) baseline = "middle";
	this._path.push({ Command : "addString", Text : str, Font : font, X : (x) + 0.5, Y : (y) + 0.5, BaseLine : baseline});
}
alphatab.tablature.drawing.DrawingLayer.prototype.bezierTo = function(x1,y1,x2,y2,x3,y3) {
	this._path.push({ Command : "bezierTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3});
}
alphatab.tablature.drawing.DrawingLayer.prototype.circleTo = function(diameter) {
	this._path.push({ Command : "circleTo", Radius : diameter / 2});
}
alphatab.tablature.drawing.DrawingLayer.prototype.clear = function() {
	this._path = new Array();
}
alphatab.tablature.drawing.DrawingLayer.prototype.closeFigure = function() {
	this._path.push({ Command : "closeFigure"});
}
alphatab.tablature.drawing.DrawingLayer.prototype.draw = function(graphics) {
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
					graphics.circle(this._currentPosition.x + elm.Radius,this._currentPosition.y + elm.Radius,elm.Radius);
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
				case "addBezier":{
					graphics.moveTo(elm.X1,elm.Y1);
					graphics.bezierCurveTo(elm.X2,elm.Y2,elm.X3,elm.Y3,elm.X4,elm.Y4);
				}break;
				case "addCircle":{
					this.finish(graphics);
					graphics.circle(elm.X + elm.Radius,elm.Y + elm.Radius,elm.Radius);
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
alphatab.tablature.drawing.DrawingLayer.prototype.finish = function(graphics) {
	if(this._isFilled) {
		graphics.fill();
	}
	else {
		graphics.stroke();
	}
}
alphatab.tablature.drawing.DrawingLayer.prototype.lineTo = function(x,y) {
	this._path.push({ Command : "lineTo", X : (x) + 0.5, Y : (y) + 0.5});
}
alphatab.tablature.drawing.DrawingLayer.prototype.moveTo = function(x,y) {
	this._path.push({ Command : "moveTo", X : Math.round(x) + 0.5, Y : Math.round(y) + 0.5});
}
alphatab.tablature.drawing.DrawingLayer.prototype.quadraticCurveTo = function(x1,y1,x2,y2) {
	this._path.push({ Command : "quadraticCurveTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2});
}
alphatab.tablature.drawing.DrawingLayer.prototype.rectTo = function(w,h) {
	this._path.push({ Command : "rectTo", Width : w, Height : h});
}
alphatab.tablature.drawing.DrawingLayer.prototype.startFigure = function() {
	this._path.push({ Command : "startFigure"});
}
alphatab.tablature.drawing.DrawingLayer.prototype.__class__ = alphatab.tablature.drawing.DrawingLayer;
alphatab.model.Chord = function(length) { if( length === $_ ) return; {
	this.strings = new Array();
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			this.strings.push(-1);
		}
	}
}}
alphatab.model.Chord.__name__ = ["alphatab","model","Chord"];
alphatab.model.Chord.prototype.beat = null;
alphatab.model.Chord.prototype.firstFret = null;
alphatab.model.Chord.prototype.name = null;
alphatab.model.Chord.prototype.noteCount = function() {
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
alphatab.model.Chord.prototype.stringCount = function() {
	return this.strings.length;
}
alphatab.model.Chord.prototype.strings = null;
alphatab.model.Chord.prototype.__class__ = alphatab.model.Chord;
if(!alphatab.tablature.model) alphatab.tablature.model = {}
alphatab.tablature.model.ChordImpl = function(length) { if( length === $_ ) return; {
	alphatab.model.Chord.apply(this,[length]);
}}
alphatab.tablature.model.ChordImpl.__name__ = ["alphatab","tablature","model","ChordImpl"];
alphatab.tablature.model.ChordImpl.__super__ = alphatab.model.Chord;
for(var k in alphatab.model.Chord.prototype ) alphatab.tablature.model.ChordImpl.prototype[k] = alphatab.model.Chord.prototype[k];
alphatab.tablature.model.ChordImpl.prototype.beatImpl = function() {
	return this.beat;
}
alphatab.tablature.model.ChordImpl.prototype.getPaintPosition = function(index) {
	return this.beatImpl().measureImpl().ts.get(index);
}
alphatab.tablature.model.ChordImpl.prototype.paint = function(layout,context,x,y) {
	if(this.name != null && this.name != "") {
		var realX = x + Math.round(4 * layout.scale);
		var realY = y + this.getPaintPosition(5);
		context.get(3).addString(this.name,alphatab.tablature.drawing.DrawingResources.chordFont,realX,realY);
	}
}
alphatab.tablature.model.ChordImpl.prototype.__class__ = alphatab.tablature.model.ChordImpl;
if(!alphatab.platform) alphatab.platform = {}
alphatab.platform.FileLoader = function() { }
alphatab.platform.FileLoader.__name__ = ["alphatab","platform","FileLoader"];
alphatab.platform.FileLoader.prototype.loadBinary = null;
alphatab.platform.FileLoader.prototype.__class__ = alphatab.platform.FileLoader;
if(!alphatab.platform.js) alphatab.platform.js = {}
alphatab.platform.js.JsFileLoader = function(p) { if( p === $_ ) return; {
	null;
}}
alphatab.platform.js.JsFileLoader.__name__ = ["alphatab","platform","js","JsFileLoader"];
alphatab.platform.js.JsFileLoader.prototype.loadBinary = function(method,file,success,error) {
	if(jQuery.browser.msie) {
		var vbArr = VbAjaxLoader(method,file);
		var fileContents = vbArr.toArray();
		var data = "";
		var i = 0;
		while(i < (fileContents.length - 1)) {
			data += String.fromCharCode(fileContents[i]);
			i++;
		}
		var reader = new alphatab.platform.BinaryReader();
		reader.initialize(data);
		success(reader);
	}
	else {
		var options = { }
		options.type = method;
		options.url = file;
		options.success = function(data) {
			var reader = new alphatab.platform.BinaryReader();
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
alphatab.platform.js.JsFileLoader.prototype.__class__ = alphatab.platform.js.JsFileLoader;
alphatab.platform.js.JsFileLoader.__interfaces__ = [alphatab.platform.FileLoader];
alphatab.midi.MidiRepeatController = function(song) { if( song === $_ ) return; {
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
alphatab.midi.MidiRepeatController.__name__ = ["alphatab","midi","MidiRepeatController"];
alphatab.midi.MidiRepeatController.prototype._count = null;
alphatab.midi.MidiRepeatController.prototype._lastIndex = null;
alphatab.midi.MidiRepeatController.prototype._repeatAlternative = null;
alphatab.midi.MidiRepeatController.prototype._repeatEnd = null;
alphatab.midi.MidiRepeatController.prototype._repeatNumber = null;
alphatab.midi.MidiRepeatController.prototype._repeatOpen = null;
alphatab.midi.MidiRepeatController.prototype._repeatStart = null;
alphatab.midi.MidiRepeatController.prototype._repeatStartIndex = null;
alphatab.midi.MidiRepeatController.prototype._song = null;
alphatab.midi.MidiRepeatController.prototype.finished = function() {
	return (this.index >= this._count);
}
alphatab.midi.MidiRepeatController.prototype.index = null;
alphatab.midi.MidiRepeatController.prototype.process = function() {
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
alphatab.midi.MidiRepeatController.prototype.repeatMove = null;
alphatab.midi.MidiRepeatController.prototype.shouldPlay = null;
alphatab.midi.MidiRepeatController.prototype.__class__ = alphatab.midi.MidiRepeatController;
alphatab.model.effects.TremoloPickingEffect = function(factory) { if( factory === $_ ) return; {
	this.duration = factory.newDuration();
}}
alphatab.model.effects.TremoloPickingEffect.__name__ = ["alphatab","model","effects","TremoloPickingEffect"];
alphatab.model.effects.TremoloPickingEffect.prototype.clone = function(factory) {
	var effect = factory.newTremoloPickingEffect();
	effect.duration.value = this.duration.value;
	effect.duration.isDotted = this.duration.isDotted;
	effect.duration.isDoubleDotted = this.duration.isDoubleDotted;
	effect.duration.tuplet.enters = this.duration.tuplet.enters;
	effect.duration.tuplet.times = this.duration.tuplet.times;
	return effect;
}
alphatab.model.effects.TremoloPickingEffect.prototype.duration = null;
alphatab.model.effects.TremoloPickingEffect.prototype.__class__ = alphatab.model.effects.TremoloPickingEffect;
alphatab.model.BeatStroke = function(p) { if( p === $_ ) return; {
	this.direction = 0;
}}
alphatab.model.BeatStroke.__name__ = ["alphatab","model","BeatStroke"];
alphatab.model.BeatStroke.prototype.direction = null;
alphatab.model.BeatStroke.prototype.getIncrementTime = function(beat) {
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
alphatab.model.BeatStroke.prototype.value = null;
alphatab.model.BeatStroke.prototype.__class__ = alphatab.model.BeatStroke;
alphatab.model.Duration = function(factory) { if( factory === $_ ) return; {
	this.value = 4;
	this.isDotted = false;
	this.isDoubleDotted = false;
	this.tuplet = factory.newTuplet();
}}
alphatab.model.Duration.__name__ = ["alphatab","model","Duration"];
alphatab.model.Duration.fromTime = function(factory,time,minimum,diff) {
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
		else if(tmp.tuplet.equals(new alphatab.model.Tuplet())) {
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
alphatab.model.Duration.prototype.clone = function(factory) {
	var duration = factory.newDuration();
	duration.value = this.value;
	duration.isDotted = this.isDotted;
	duration.isDoubleDotted = this.isDoubleDotted;
	duration.tuplet = this.tuplet.clone(factory);
	return duration;
}
alphatab.model.Duration.prototype.copy = function(duration) {
	duration.value = this.value;
	duration.isDotted = this.isDotted;
	duration.isDoubleDotted = this.isDoubleDotted;
	this.tuplet.copy(duration.tuplet);
}
alphatab.model.Duration.prototype.equals = function(other) {
	if(other == null) return false;
	if(this == other) return true;
	return other.value == this.value && other.isDotted == this.isDotted && other.isDoubleDotted == this.isDoubleDotted && other.tuplet.equals(this.tuplet);
}
alphatab.model.Duration.prototype.index = function() {
	var index = 0;
	var value = this.value;
	while((value = (value >> 1)) > 0) {
		index++;
	}
	return index;
}
alphatab.model.Duration.prototype.isDotted = null;
alphatab.model.Duration.prototype.isDoubleDotted = null;
alphatab.model.Duration.prototype.time = function() {
	var time = Math.floor(960 * (4.0 / this.value));
	if(this.isDotted) {
		time += Math.floor(time / 2);
	}
	else if(this.isDoubleDotted) {
		time += Math.floor((time / 4) * 3);
	}
	return this.tuplet.convertTime(time);
}
alphatab.model.Duration.prototype.tuplet = null;
alphatab.model.Duration.prototype.value = null;
alphatab.model.Duration.prototype.__class__ = alphatab.model.Duration;
alphatab.tablature.drawing.KeySignaturePainter = function() { }
alphatab.tablature.drawing.KeySignaturePainter.__name__ = ["alphatab","tablature","drawing","KeySignaturePainter"];
alphatab.tablature.drawing.KeySignaturePainter.paintFlat = function(context,x,y,layout) {
	var scale = layout.scale * 1.2;
	y -= Math.round(2 * layout.scoreLineSpacing);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.KeyFlat,x,y,scale);
}
alphatab.tablature.drawing.KeySignaturePainter.paintNatural = function(context,x,y,layout) {
	var scale = layout.scale * 1.2;
	y -= Math.round(2 * layout.scoreLineSpacing);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.KeyNormal,x,y,scale);
}
alphatab.tablature.drawing.KeySignaturePainter.paintSharp = function(context,x,y,layout) {
	var scale = layout.scale * 1.2;
	y -= Math.round(1.5 * layout.scoreLineSpacing);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.KeySharp,x,y,scale);
}
alphatab.tablature.drawing.KeySignaturePainter.paintSmallFlat = function(layer,x,y,layout) {
	y -= layout.scoreLineSpacing;
	var scale = layout.scale;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.KeyFlat,x,y,scale);
}
alphatab.tablature.drawing.KeySignaturePainter.paintSmallNatural = function(layer,x,y,layout) {
	y -= layout.scoreLineSpacing;
	var scale = layout.scale;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.KeyNormal,x,y,scale);
}
alphatab.tablature.drawing.KeySignaturePainter.paintSmallSharp = function(layer,x,y,layout) {
	var scale = layout.scale;
	y -= Math.round(layout.scoreLineSpacing);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.KeySharp,x,y,scale);
}
alphatab.tablature.drawing.KeySignaturePainter.prototype.__class__ = alphatab.tablature.drawing.KeySignaturePainter;
alphatab.model.Track = function(factory) { if( factory === $_ ) return; {
	this.number = 0;
	this.offset = 0;
	this.isSolo = false;
	this.isMute = false;
	this.name = "";
	this.measures = new Array();
	this.strings = new Array();
	this.channel = factory.newMidiChannel();
	this.color = new alphatab.model.Color(255,0,0);
}}
alphatab.model.Track.__name__ = ["alphatab","model","Track"];
alphatab.model.Track.prototype.addMeasure = function(measure) {
	measure.track = this;
	this.measures.push(measure);
}
alphatab.model.Track.prototype.channel = null;
alphatab.model.Track.prototype.color = null;
alphatab.model.Track.prototype.fretCount = null;
alphatab.model.Track.prototype.is12StringedGuitarTrack = null;
alphatab.model.Track.prototype.isBanjoTrack = null;
alphatab.model.Track.prototype.isMute = null;
alphatab.model.Track.prototype.isPercussionTrack = null;
alphatab.model.Track.prototype.isSolo = null;
alphatab.model.Track.prototype.measureCount = function() {
	return this.measures.length;
}
alphatab.model.Track.prototype.measures = null;
alphatab.model.Track.prototype.name = null;
alphatab.model.Track.prototype.number = null;
alphatab.model.Track.prototype.offset = null;
alphatab.model.Track.prototype.port = null;
alphatab.model.Track.prototype.song = null;
alphatab.model.Track.prototype.stringCount = function() {
	return this.strings.length;
}
alphatab.model.Track.prototype.strings = null;
alphatab.model.Track.prototype.__class__ = alphatab.model.Track;
alphatab.tablature.model.TrackImpl = function(factory) { if( factory === $_ ) return; {
	alphatab.model.Track.apply(this,[factory]);
}}
alphatab.tablature.model.TrackImpl.__name__ = ["alphatab","tablature","model","TrackImpl"];
alphatab.tablature.model.TrackImpl.__super__ = alphatab.model.Track;
for(var k in alphatab.model.Track.prototype ) alphatab.tablature.model.TrackImpl.prototype[k] = alphatab.model.Track.prototype[k];
alphatab.tablature.model.TrackImpl.prototype.previousBeat = null;
alphatab.tablature.model.TrackImpl.prototype.scoreHeight = null;
alphatab.tablature.model.TrackImpl.prototype.tabHeight = null;
alphatab.tablature.model.TrackImpl.prototype.update = function(layout) {
	this.tabHeight = Math.round((this.stringCount() - 1) * layout.stringSpacing);
	this.scoreHeight = Math.round(layout.scoreLineSpacing * 4);
}
alphatab.tablature.model.TrackImpl.prototype.__class__ = alphatab.tablature.model.TrackImpl;
if(!alphatab.file) alphatab.file = {}
alphatab.file.SongReader = function(p) { if( p === $_ ) return; {
	null;
}}
alphatab.file.SongReader.__name__ = ["alphatab","file","SongReader"];
alphatab.file.SongReader.availableReaders = function() {
	var d = new Array();
	d.push(new alphatab.file.guitarpro.Gp5Reader());
	d.push(new alphatab.file.guitarpro.Gp4Reader());
	d.push(new alphatab.file.guitarpro.Gp4Reader());
	return d;
}
alphatab.file.SongReader.prototype.data = null;
alphatab.file.SongReader.prototype.factory = null;
alphatab.file.SongReader.prototype.getTiedNoteValue = function(stringIndex,track) {
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
alphatab.file.SongReader.prototype.init = function(data,factory) {
	this.data = data;
	this.factory = factory;
}
alphatab.file.SongReader.prototype.readSong = function() {
	return this.factory.newSong();
}
alphatab.file.SongReader.prototype.__class__ = alphatab.file.SongReader;
alphatab.model.Voice = function(factory,index) { if( factory === $_ ) return; {
	this.duration = factory.newDuration();
	this.notes = new Array();
	this.index = index;
	this.direction = 0;
	this.isEmpty = true;
}}
alphatab.model.Voice.__name__ = ["alphatab","model","Voice"];
alphatab.model.Voice.prototype.addNote = function(note) {
	note.voice = this;
	this.notes.push(note);
	this.isEmpty = false;
}
alphatab.model.Voice.prototype.beat = null;
alphatab.model.Voice.prototype.direction = null;
alphatab.model.Voice.prototype.duration = null;
alphatab.model.Voice.prototype.index = null;
alphatab.model.Voice.prototype.isEmpty = null;
alphatab.model.Voice.prototype.isRestVoice = function() {
	return this.notes.length == 0;
}
alphatab.model.Voice.prototype.notes = null;
alphatab.model.Voice.prototype.__class__ = alphatab.model.Voice;
alphatab.tablature.model.VoiceImpl = function(factory,index) { if( factory === $_ ) return; {
	alphatab.model.Voice.apply(this,[factory,index]);
}}
alphatab.tablature.model.VoiceImpl.__name__ = ["alphatab","tablature","model","VoiceImpl"];
alphatab.tablature.model.VoiceImpl.__super__ = alphatab.model.Voice;
for(var k in alphatab.model.Voice.prototype ) alphatab.tablature.model.VoiceImpl.prototype[k] = alphatab.model.Voice.prototype[k];
alphatab.tablature.model.VoiceImpl.prototype._hiddenSilence = null;
alphatab.tablature.model.VoiceImpl.prototype._silenceHeight = null;
alphatab.tablature.model.VoiceImpl.prototype._silenceY = null;
alphatab.tablature.model.VoiceImpl.prototype._usedStrings = null;
alphatab.tablature.model.VoiceImpl.prototype.beatGroup = null;
alphatab.tablature.model.VoiceImpl.prototype.beatImpl = function() {
	return this.beat;
}
alphatab.tablature.model.VoiceImpl.prototype.check = function(note) {
	var value = note.realValue();
	if(this.maxNote == null || value > this.maxNote.realValue()) this.maxNote = note;
	if(this.minNote == null || value < this.minNote.realValue()) this.minNote = note;
	this.usedStrings()[note.string - 1] = true;
	if(note.string > this.maxString) this.maxString = note.string;
	if(note.string < this.minString) this.minString = note.string;
}
alphatab.tablature.model.VoiceImpl.prototype.getPaintPosition = function(index) {
	return this.beat.measure.ts.get(index);
}
alphatab.tablature.model.VoiceImpl.prototype.isHiddenSilence = null;
alphatab.tablature.model.VoiceImpl.prototype.isJoinedGreaterThanQuarter = null;
alphatab.tablature.model.VoiceImpl.prototype.join1 = null;
alphatab.tablature.model.VoiceImpl.prototype.join2 = null;
alphatab.tablature.model.VoiceImpl.prototype.joinedType = null;
alphatab.tablature.model.VoiceImpl.prototype.maxNote = null;
alphatab.tablature.model.VoiceImpl.prototype.maxString = null;
alphatab.tablature.model.VoiceImpl.prototype.maxY = null;
alphatab.tablature.model.VoiceImpl.prototype.measureImpl = function() {
	return this.beat.measure;
}
alphatab.tablature.model.VoiceImpl.prototype.minNote = null;
alphatab.tablature.model.VoiceImpl.prototype.minString = null;
alphatab.tablature.model.VoiceImpl.prototype.minY = null;
alphatab.tablature.model.VoiceImpl.prototype.nextBeat = null;
alphatab.tablature.model.VoiceImpl.prototype.paint = function(layout,context,x,y) {
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
alphatab.tablature.model.VoiceImpl.prototype.paintBeat = function(layout,context,x,y) {
	if(!this.isRestVoice()) {
		var spacing = this.beat.spacing();
		this.paintScoreBeat(layout,context,x,y + this.getPaintPosition(7),spacing);
	}
}
alphatab.tablature.model.VoiceImpl.prototype.paintDot = function(layout,layer,x,y,scale) {
	var dotSize = 3.0 * scale;
	layer.addCircle(Math.round(x - (dotSize / 2.0)),Math.round(y - (dotSize / 2.0)),dotSize);
	if(this.duration.isDoubleDotted) {
		layer.addCircle(Math.round((x + (dotSize + 2.0)) - (dotSize / 2.0)),Math.round(y - (dotSize / 2.0)),dotSize);
	}
}
alphatab.tablature.model.VoiceImpl.prototype.paintHammer = function(layout,context,x,y) {
	null;
}
alphatab.tablature.model.VoiceImpl.prototype.paintScoreBeat = function(layout,context,x,y,spacing) {
	var vX = x + 4 * layout.scale;
	var fill = (this.index == 0?context.get(9):context.get(5));
	var draw = (this.index == 0?context.get(12):context.get(8));
	this.paintTriplet(layout,context,x,(y - this.getPaintPosition(7)));
	this.paintHammer(layout,context,x,y);
	if(this.duration.value >= 2) {
		var scale = layout.scale;
		var lineSpacing = layout.scoreLineSpacing;
		var direction = this.beatGroup.direction;
		var key = this.beat.measure.keySignature();
		var clef = this.beat.measure.clef;
		var xMove = (direction == 1?alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x:0);
		var yMove = (direction == 1?Math.round(layout.scoreLineSpacing / 3) + 1:Math.round(layout.scoreLineSpacing / 3) * 2);
		var vY1 = y + (((direction == 2)?this.maxNote.scorePosY:this.minNote.scorePosY));
		var vY2 = y + this.beatGroup.getY2(layout,this.posX() + spacing,key,clef);
		draw.startFigure();
		draw.moveTo(vX + xMove,vY1 + yMove);
		draw.lineTo(vX + xMove,vY2);
		if(this.duration.value >= 8) {
			var index = this.duration.index() - 3;
			if(index >= 0) {
				var dir = (direction == 2?1:-1);
				var bJoinedGreaterThanQuarter = this.isJoinedGreaterThanQuarter;
				if((this.joinedType == alphatab.tablature.model.JoinedType.NoneLeft || this.joinedType == alphatab.tablature.model.JoinedType.NoneRight) && !bJoinedGreaterThanQuarter) {
					var hY = ((y + this.beatGroup.getY2(layout,this.posX() + spacing,key,clef)) - ((lineSpacing * 2) * dir));
					alphatab.tablature.drawing.NotePainter.paintFooter(fill,vX,vY2,this.duration.value,dir,layout);
				}
				else {
					var startX;
					var endX;
					var startXforCalculation;
					var endXforCalculation;
					if(this.joinedType == alphatab.tablature.model.JoinedType.NoneRight) {
						startX = Math.round(this.beat.getRealPosX(layout) + xMove);
						endX = Math.round((this.beat.getRealPosX(layout) + (6 * scale)) + xMove);
						startXforCalculation = this.posX() + spacing;
						endXforCalculation = Math.floor((this.posX() + spacing) + (6 * scale));
					}
					else if(this.joinedType == alphatab.tablature.model.JoinedType.NoneLeft) {
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
					alphatab.tablature.drawing.NotePainter.paintBar(fill,x1,hY1,x2,hY2,index + 1,dir,scale);
				}
			}
		}
	}
}
alphatab.tablature.model.VoiceImpl.prototype.paintSilence = function(layout,context,x,y) {
	var realX = x + 3 * layout.scale;
	var realY = y + this.getPaintPosition(7);
	var lineSpacing = layout.scoreLineSpacing;
	var scale = lineSpacing;
	var fill = (this.index == 0?context.get(9):context.get(5));
	switch(this.duration.value) {
	case 1:{
		alphatab.tablature.drawing.SilencePainter.paintWhole(fill,realX,realY,layout);
	}break;
	case 2:{
		alphatab.tablature.drawing.SilencePainter.paintHalf(fill,realX,realY,layout);
	}break;
	case 4:{
		alphatab.tablature.drawing.SilencePainter.paintQuarter(fill,realX,realY,layout);
	}break;
	case 8:{
		alphatab.tablature.drawing.SilencePainter.paintEighth(fill,realX,realY,layout);
	}break;
	case 16:{
		alphatab.tablature.drawing.SilencePainter.paintSixteenth(fill,realX,realY,layout);
	}break;
	case 32:{
		alphatab.tablature.drawing.SilencePainter.paintThirtySecond(fill,realX,realY,layout);
	}break;
	case 64:{
		alphatab.tablature.drawing.SilencePainter.paintSixtyFourth(fill,realX,realY,layout);
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
alphatab.tablature.model.VoiceImpl.prototype.paintTriplet = function(layout,context,x,y) {
	var realX = x + 3 * layout.scale;
	var fill = (this.index == 0?context.get(9):context.get(5));
	if(!this.duration.tuplet.equals(new alphatab.model.Tuplet())) {
		if(this.tripletGroup.isFull() && (this.previousBeat == null || this.previousBeat.tripletGroup == null || this.previousBeat.tripletGroup != this.tripletGroup)) {
			this.tripletGroup.paint(layout,context,x,y);
		}
		else if(!this.tripletGroup.isFull()) {
			fill.addString(Std.string(this.duration.tuplet.enters),alphatab.tablature.drawing.DrawingResources.defaultFont,Math.round(realX),Math.round(y + this.getPaintPosition(9)));
		}
	}
}
alphatab.tablature.model.VoiceImpl.prototype.posX = function() {
	return this.beat.posX;
}
alphatab.tablature.model.VoiceImpl.prototype.previousBeat = null;
alphatab.tablature.model.VoiceImpl.prototype.reset = function() {
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
alphatab.tablature.model.VoiceImpl.prototype.tripletGroup = null;
alphatab.tablature.model.VoiceImpl.prototype.update = function(layout) {
	this.minY = 0;
	this.maxY = 0;
	if(this.isRestVoice()) this.updateSilenceSpacing(layout);
	else this.updateNoteVoice(layout);
	if(this.duration.tuplet != null && !this.duration.tuplet.equals(new alphatab.model.Tuplet())) {
		if(this.previousBeat == null || this.previousBeat.tripletGroup == null || !this.previousBeat.tripletGroup.check(this)) {
			this.tripletGroup = new alphatab.tablature.model.TripletGroup(this.index);
			this.tripletGroup.check(this);
		}
		else {
			this.tripletGroup = this.previousBeat.tripletGroup;
		}
	}
}
alphatab.tablature.model.VoiceImpl.prototype.updateNoteVoice = function(layout) {
	this.joinedType = alphatab.tablature.model.JoinedType.NoneRight;
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
				this.joinedType = alphatab.tablature.model.JoinedType.Left;
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
				this.joinedType = alphatab.tablature.model.JoinedType.Right;
			}
			if(this.nextBeat.duration.value > 4) this.isJoinedGreaterThanQuarter = true;
		}
	}
	if(!noteJoined && withPrev) this.joinedType = alphatab.tablature.model.JoinedType.NoneLeft;
	this.minY = 0;
	this.maxY = this.beat.measureImpl().trackImpl().tabHeight;
	if(this.beatGroup.direction == 2) {
		this.maxY += Math.floor((layout.stringSpacing / 2) * 5) + 1;
	}
	else {
		this.minY -= Math.floor((layout.stringSpacing / 2) * 5) + 1;
	}
}
alphatab.tablature.model.VoiceImpl.prototype.updateSilenceSpacing = function(layout) {
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
alphatab.tablature.model.VoiceImpl.prototype.usedStrings = function() {
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
alphatab.tablature.model.VoiceImpl.prototype.width = null;
alphatab.tablature.model.VoiceImpl.prototype.__class__ = alphatab.tablature.model.VoiceImpl;
alphatab.model.VoiceDirection = function() { }
alphatab.model.VoiceDirection.__name__ = ["alphatab","model","VoiceDirection"];
alphatab.model.VoiceDirection.prototype.__class__ = alphatab.model.VoiceDirection;
alphatab.model.TripletFeel = function() { }
alphatab.model.TripletFeel.__name__ = ["alphatab","model","TripletFeel"];
alphatab.model.TripletFeel.prototype.__class__ = alphatab.model.TripletFeel;
alphatab.model.Beat = function(factory) { if( factory === $_ ) return; {
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
alphatab.model.Beat.__name__ = ["alphatab","model","Beat"];
alphatab.model.Beat.prototype.effect = null;
alphatab.model.Beat.prototype.ensureVoices = function(count,factory) {
	while(this.voices.length < count) {
		var voice = factory.newVoice(this.voices.length);
		voice.beat = this;
		this.voices.push(voice);
	}
}
alphatab.model.Beat.prototype.getNotes = function() {
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
alphatab.model.Beat.prototype.isRestBeat = function() {
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
alphatab.model.Beat.prototype.measure = null;
alphatab.model.Beat.prototype.setChord = function(chord) {
	chord.beat = this;
	this.effect.chord = chord;
}
alphatab.model.Beat.prototype.setText = function(text) {
	text.beat = this;
	this.text = text;
}
alphatab.model.Beat.prototype.start = null;
alphatab.model.Beat.prototype.tableChange = null;
alphatab.model.Beat.prototype.text = null;
alphatab.model.Beat.prototype.voices = null;
alphatab.model.Beat.prototype.__class__ = alphatab.model.Beat;
alphatab.model.effects.HarmonicType = { __ename__ : ["alphatab","model","effects","HarmonicType"], __constructs__ : ["Natural","Artificial","Tapped","Pinch","Semi"] }
alphatab.model.effects.HarmonicType.Artificial = ["Artificial",1];
alphatab.model.effects.HarmonicType.Artificial.toString = $estr;
alphatab.model.effects.HarmonicType.Artificial.__enum__ = alphatab.model.effects.HarmonicType;
alphatab.model.effects.HarmonicType.Natural = ["Natural",0];
alphatab.model.effects.HarmonicType.Natural.toString = $estr;
alphatab.model.effects.HarmonicType.Natural.__enum__ = alphatab.model.effects.HarmonicType;
alphatab.model.effects.HarmonicType.Pinch = ["Pinch",3];
alphatab.model.effects.HarmonicType.Pinch.toString = $estr;
alphatab.model.effects.HarmonicType.Pinch.__enum__ = alphatab.model.effects.HarmonicType;
alphatab.model.effects.HarmonicType.Semi = ["Semi",4];
alphatab.model.effects.HarmonicType.Semi.toString = $estr;
alphatab.model.effects.HarmonicType.Semi.__enum__ = alphatab.model.effects.HarmonicType;
alphatab.model.effects.HarmonicType.Tapped = ["Tapped",2];
alphatab.model.effects.HarmonicType.Tapped.toString = $estr;
alphatab.model.effects.HarmonicType.Tapped.__enum__ = alphatab.model.effects.HarmonicType;
alphatab.midi.MidiDataProvider = function() { }
alphatab.midi.MidiDataProvider.__name__ = ["alphatab","midi","MidiDataProvider"];
alphatab.midi.MidiDataProvider.getSongMidiData = function(song,factory) {
	var parser = new alphatab.midi.MidiSequenceParser(factory,song,15,100,0);
	var sequence = new alphatab.midi.MidiSequenceHandler(song.tracks.length + 2);
	parser.parse(sequence);
	return sequence.commands;
}
alphatab.midi.MidiDataProvider.prototype.__class__ = alphatab.midi.MidiDataProvider;
if(!alphatab.file.guitarpro) alphatab.file.guitarpro = {}
alphatab.file.guitarpro.GpReaderBase = function(p) { if( p === $_ ) return; {
	alphatab.file.SongReader.apply(this,[]);
}}
alphatab.file.guitarpro.GpReaderBase.__name__ = ["alphatab","file","guitarpro","GpReaderBase"];
alphatab.file.guitarpro.GpReaderBase.__super__ = alphatab.file.SongReader;
for(var k in alphatab.file.SongReader.prototype ) alphatab.file.guitarpro.GpReaderBase.prototype[k] = alphatab.file.SongReader.prototype[k];
alphatab.file.guitarpro.GpReaderBase.toChannelShort = function(data) {
	var value = Math.floor(Math.max(-32768,Math.min(32767,(data * 8) - 1)));
	return Math.floor(Math.max(value,-1));
}
alphatab.file.guitarpro.GpReaderBase.prototype._supportedVersions = null;
alphatab.file.guitarpro.GpReaderBase.prototype._version = null;
alphatab.file.guitarpro.GpReaderBase.prototype._versionIndex = null;
alphatab.file.guitarpro.GpReaderBase.prototype.initVersions = function(supportedVersions) {
	this._supportedVersions = supportedVersions;
}
alphatab.file.guitarpro.GpReaderBase.prototype.read = function() {
	return this.readByte();
}
alphatab.file.guitarpro.GpReaderBase.prototype.readBool = function() {
	return this.data.readByte() == 1;
}
alphatab.file.guitarpro.GpReaderBase.prototype.readByte = function() {
	var data = this.data.readByte() & 255;
	return (data > 127?-256 + data:data);
}
alphatab.file.guitarpro.GpReaderBase.prototype.readByteSizeCheckByteString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.readByteSizeString((this.readUnsignedByte() - 1),charset);
}
alphatab.file.guitarpro.GpReaderBase.prototype.readByteSizeString = function(size,charset) {
	if(charset == null) charset = "UTF-8";
	return this.readString(size,this.readUnsignedByte(),charset);
}
alphatab.file.guitarpro.GpReaderBase.prototype.readDouble = function() {
	return this.data.readDouble();
}
alphatab.file.guitarpro.GpReaderBase.prototype.readInt = function() {
	return (this.data.readInt32());
}
alphatab.file.guitarpro.GpReaderBase.prototype.readIntSizeCheckByteString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.readByteSizeString((this.readInt() - 1),charset);
}
alphatab.file.guitarpro.GpReaderBase.prototype.readIntSizeString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.readString(this.readInt(),-2,charset);
}
alphatab.file.guitarpro.GpReaderBase.prototype.readString = function(size,len,charset) {
	if(charset == null) charset = "UTF-8";
	if(len == null) len = -2;
	if(len == -2) len = size;
	var count = ((size > 0?size:len));
	var s = this.readStringInternal(count);
	return s.substr(0,((len >= 0?len:size)));
}
alphatab.file.guitarpro.GpReaderBase.prototype.readStringInternal = function(length) {
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
alphatab.file.guitarpro.GpReaderBase.prototype.readUnsignedByte = function() {
	return this.data.readByte();
}
alphatab.file.guitarpro.GpReaderBase.prototype.readVersion = function() {
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
	catch( $e1 ) {
		{
			var e = $e1;
			{
				this._version = "Not Supported";
			}
		}
	}
	return false;
}
alphatab.file.guitarpro.GpReaderBase.prototype.skip = function(count) {
	var _g = 0;
	while(_g < count) {
		var i = _g++;
		this.data.readByte();
	}
}
alphatab.file.guitarpro.GpReaderBase.prototype.__class__ = alphatab.file.guitarpro.GpReaderBase;
alphatab.file.guitarpro.Gp3Reader = function(p) { if( p === $_ ) return; {
	alphatab.file.guitarpro.GpReaderBase.apply(this,[]);
	this.initVersions(["FICHIER GUITAR PRO v3.00"]);
}}
alphatab.file.guitarpro.Gp3Reader.__name__ = ["alphatab","file","guitarpro","Gp3Reader"];
alphatab.file.guitarpro.Gp3Reader.__super__ = alphatab.file.guitarpro.GpReaderBase;
for(var k in alphatab.file.guitarpro.GpReaderBase.prototype ) alphatab.file.guitarpro.Gp3Reader.prototype[k] = alphatab.file.guitarpro.GpReaderBase.prototype[k];
alphatab.file.guitarpro.Gp3Reader.toKeySignature = function(p) {
	return (p < 0?7 + Math.round(Math.abs(p)):p);
}
alphatab.file.guitarpro.Gp3Reader.toStrokeValue = function(value) {
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
alphatab.file.guitarpro.Gp3Reader.prototype._tripletFeel = null;
alphatab.file.guitarpro.Gp3Reader.prototype.getBeat = function(measure,start) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.parseRepeatAlternative = function(song,measure,value) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readBeat = function(start,measure,track,voiceIndex) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readBeatEffects = function(beat,effect) {
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
			beat.effect.stroke.direction = 1;
			beat.effect.stroke.value = (alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.effect.stroke.direction = 2;
			beat.effect.stroke.value = (alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeDown));
		}
	}
	if((flags1 & 4) != 0) {
		var harmonic = this.factory.newHarmonicEffect();
		harmonic.type = (alphatab.model.effects.HarmonicType.Natural);
		effect.harmonic = (harmonic);
	}
	if((flags1 & 8) != 0) {
		var harmonic = this.factory.newHarmonicEffect();
		harmonic.type = (alphatab.model.effects.HarmonicType.Artificial);
		harmonic.data = 0;
		effect.harmonic = (harmonic);
	}
}
alphatab.file.guitarpro.Gp3Reader.prototype.readBend = function(noteEffect) {
	var bendEffect = this.factory.newBendEffect();
	bendEffect.type = this.readByte();
	bendEffect.value = this.readInt();
	var pointCount = this.readInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.readInt() * 12) / 60);
			var pointValue = Math.round(this.readInt() / 25);
			var vibrato = this.readBool();
			bendEffect.points.push(new alphatab.model.effects.BendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) noteEffect.bend = bendEffect;
}
alphatab.file.guitarpro.Gp3Reader.prototype.readChannel = function(midiChannel,channels) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readChord = function(stringCount,beat) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readColor = function() {
	var r = (this.readUnsignedByte());
	var g = this.readUnsignedByte();
	var b = (this.readUnsignedByte());
	this.skip(1);
	return new alphatab.model.Color(r,g,b);
}
alphatab.file.guitarpro.Gp3Reader.prototype.readDuration = function(flags) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readGrace = function(noteEffect) {
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
		grace.transition = 0;
	}break;
	case 1:{
		grace.transition = 1;
	}break;
	case 2:{
		grace.transition = 2;
	}break;
	case 3:{
		grace.transition = 3;
	}break;
	}
	noteEffect.grace = (grace);
}
alphatab.file.guitarpro.Gp3Reader.prototype.readInfo = function(song) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readLyrics = function(song) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readMarker = function(header) {
	var marker = this.factory.newMarker();
	marker.measureHeader = header;
	marker.title = this.readIntSizeCheckByteString();
	marker.color = this.readColor();
	return marker;
}
alphatab.file.guitarpro.Gp3Reader.prototype.readMeasure = function(measure,track) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readMeasureHeader = function(i,timeSignature,song) {
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
		header.keySignatureType = alphatab.file.guitarpro.Gp3Reader.toKeySignature(this.readByte());
		header.keySignatureType = this.readByte();
	}
	else if(header.number > 1) {
		header.keySignature = song.measureHeaders[i - 1].keySignature;
		header.keySignatureType = song.measureHeaders[i - 1].keySignatureType;
	}
	header.hasDoubleBar = (flags & 128) != 0;
	return header;
}
alphatab.file.guitarpro.Gp3Reader.prototype.readMeasureHeaders = function(song,measureCount) {
	var timeSignature = this.factory.newTimeSignature();
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.addMeasureHeader(this.readMeasureHeader(i,timeSignature,song));
		}
	}
}
alphatab.file.guitarpro.Gp3Reader.prototype.readMeasures = function(song) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readMidiChannels = function() {
	var channels = new Array();
	{
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.factory.newMidiChannel();
			newChannel.channel = (i);
			newChannel.effectChannel = (i);
			newChannel.instrument(this.readInt());
			newChannel.volume = (alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.balance = (alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.chorus = (alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.reverb = (alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.phaser = (alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			newChannel.tremolo = (alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.readByte()));
			channels.push(newChannel);
			this.skip(2);
		}
	}
	return channels;
}
alphatab.file.guitarpro.Gp3Reader.prototype.readMixTableChange = function(measure) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readNote = function(guitarString,track,effect) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readNoteEffects = function(noteEffect) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readPageSetup = function(song) {
	var setup = alphatab.model.PageSetup.defaults();
	song.pageSetup = setup;
}
alphatab.file.guitarpro.Gp3Reader.prototype.readSong = function() {
	if(!this.readVersion()) {
		throw new alphatab.file.FileFormatException("Unsupported Version");
	}
	var song = this.factory.newSong();
	this.readInfo(song);
	this._tripletFeel = (this.readBool()?1:0);
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
alphatab.file.guitarpro.Gp3Reader.prototype.readText = function(beat) {
	var text = this.factory.newText();
	text.value = this.readIntSizeCheckByteString();
	beat.setText(text);
}
alphatab.file.guitarpro.Gp3Reader.prototype.readTrack = function(number,channels) {
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
alphatab.file.guitarpro.Gp3Reader.prototype.readTracks = function(song,trackCount,channels) {
	var _g1 = 1, _g = trackCount + 1;
	while(_g1 < _g) {
		var i = _g1++;
		song.addTrack(this.readTrack(i,channels));
	}
}
alphatab.file.guitarpro.Gp3Reader.prototype.readTremoloBar = function(effect) {
	var barEffect = this.factory.newTremoloBarEffect();
	barEffect.type = this.readByte();
	barEffect.value = this.readInt();
	barEffect.points.push(new alphatab.model.effects.BendPoint(0,0,false));
	barEffect.points.push(new alphatab.model.effects.BendPoint(Math.round(12 / 2.0),Math.round(barEffect.value / 50),false));
	barEffect.points.push(new alphatab.model.effects.BendPoint(12,0,false));
	effect.tremoloBar = barEffect;
}
alphatab.file.guitarpro.Gp3Reader.prototype.__class__ = alphatab.file.guitarpro.Gp3Reader;
alphatab.platform.Canvas = function() { }
alphatab.platform.Canvas.__name__ = ["alphatab","platform","Canvas"];
alphatab.platform.Canvas.prototype.beginPath = null;
alphatab.platform.Canvas.prototype.bezierCurveTo = null;
alphatab.platform.Canvas.prototype.circle = null;
alphatab.platform.Canvas.prototype.clear = null;
alphatab.platform.Canvas.prototype.closePath = null;
alphatab.platform.Canvas.prototype.fill = null;
alphatab.platform.Canvas.prototype.fillRect = null;
alphatab.platform.Canvas.prototype.fillStyle = null;
alphatab.platform.Canvas.prototype.fillText = null;
alphatab.platform.Canvas.prototype.font = null;
alphatab.platform.Canvas.prototype.height = null;
alphatab.platform.Canvas.prototype.lineTo = null;
alphatab.platform.Canvas.prototype.lineWidth = null;
alphatab.platform.Canvas.prototype.measureText = null;
alphatab.platform.Canvas.prototype.moveTo = null;
alphatab.platform.Canvas.prototype.quadraticCurveTo = null;
alphatab.platform.Canvas.prototype.rect = null;
alphatab.platform.Canvas.prototype.setHeight = null;
alphatab.platform.Canvas.prototype.setWidth = null;
alphatab.platform.Canvas.prototype.stroke = null;
alphatab.platform.Canvas.prototype.strokeRect = null;
alphatab.platform.Canvas.prototype.strokeStyle = null;
alphatab.platform.Canvas.prototype.strokeText = null;
alphatab.platform.Canvas.prototype.textBaseline = null;
alphatab.platform.Canvas.prototype.width = null;
alphatab.platform.Canvas.prototype.__class__ = alphatab.platform.Canvas;
alphatab.model.Note = function(factory) { if( factory === $_ ) return; {
	this.value = 0;
	this.velocity = 95;
	this.string = 1;
	this.isTiedNote = false;
	this.effect = factory.newNoteEffect();
}}
alphatab.model.Note.__name__ = ["alphatab","model","Note"];
alphatab.model.Note.prototype.duration = null;
alphatab.model.Note.prototype.durationPercent = null;
alphatab.model.Note.prototype.effect = null;
alphatab.model.Note.prototype.isTiedNote = null;
alphatab.model.Note.prototype.realValue = function() {
	return this.value + this.voice.beat.measure.track.strings[this.string - 1].value;
}
alphatab.model.Note.prototype.string = null;
alphatab.model.Note.prototype.tuplet = null;
alphatab.model.Note.prototype.value = null;
alphatab.model.Note.prototype.velocity = null;
alphatab.model.Note.prototype.voice = null;
alphatab.model.Note.prototype.__class__ = alphatab.model.Note;
alphatab.tablature.model.TripletGroup = function(voice) { if( voice === $_ ) return; {
	this._voiceIndex = voice;
	this._voices = new Array();
}}
alphatab.tablature.model.TripletGroup.__name__ = ["alphatab","tablature","model","TripletGroup"];
alphatab.tablature.model.TripletGroup.prototype._triplet = null;
alphatab.tablature.model.TripletGroup.prototype._voiceIndex = null;
alphatab.tablature.model.TripletGroup.prototype._voices = null;
alphatab.tablature.model.TripletGroup.prototype.check = function(voice) {
	if(this._voices.length == 0) {
		this._triplet = voice.duration.tuplet.enters;
	}
	else {
		if(voice.index != this._voiceIndex || voice.duration.tuplet.enters != this._triplet || this.isFull()) return false;
	}
	this._voices.push(voice);
	return true;
}
alphatab.tablature.model.TripletGroup.prototype.isFull = function() {
	return this._voices.length == this._triplet;
}
alphatab.tablature.model.TripletGroup.prototype.paint = function(layout,context,x,y) {
	var scale = layout.scale;
	var offset = alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x / 2;
	var startX = this._voices[0].beat.getRealPosX(layout) + offset;
	var endX = this._voices[this._voices.length - 1].beat.getRealPosX(layout) + offset;
	var key = this._voices[0].beat.measure.keySignature();
	var realY = y;
	var draw = (this._voiceIndex == 0?context.get(12):context.get(8));
	var fill = (this._voiceIndex == 0?context.get(9):context.get(5));
	var s = Std.string(this._triplet);
	context.graphics.setFont(alphatab.tablature.drawing.DrawingResources.effectFont);
	var w = context.graphics.measureText(s);
	var lineW = endX - startX;
	draw.addLine(startX,realY + 5 * scale,startX,realY);
	draw.addLine(startX,realY,(startX + (lineW / 2)) - w,realY);
	draw.addString(s,alphatab.tablature.drawing.DrawingResources.effectFont,startX + ((lineW - w) / 2),realY);
	draw.addLine((startX + (lineW / 2)) + w,realY,endX,realY);
	draw.addLine(endX,realY + 5 * scale,endX,realY);
}
alphatab.tablature.model.TripletGroup.prototype.__class__ = alphatab.tablature.model.TripletGroup;
alphatab.model.effects.TrillEffect = function(factory) { if( factory === $_ ) return; {
	this.fret = 0;
	this.duration = factory.newDuration();
}}
alphatab.model.effects.TrillEffect.__name__ = ["alphatab","model","effects","TrillEffect"];
alphatab.model.effects.TrillEffect.prototype.clone = function(factory) {
	var effect = factory.newTrillEffect();
	effect.fret = this.fret;
	effect.duration.value = this.duration.value;
	effect.duration.isDotted = this.duration.isDotted;
	effect.duration.isDoubleDotted = this.duration.isDoubleDotted;
	effect.duration.tuplet.enters = this.duration.tuplet.enters;
	effect.duration.tuplet.times = this.duration.tuplet.times;
	return effect;
}
alphatab.model.effects.TrillEffect.prototype.duration = null;
alphatab.model.effects.TrillEffect.prototype.fret = null;
alphatab.model.effects.TrillEffect.prototype.__class__ = alphatab.model.effects.TrillEffect;
alphatab.midi.MidiSequenceHandler = function(tracks) { if( tracks === $_ ) return; {
	this.infoTrack = 0;
	this.metronomeTrack = tracks - 1;
	this._commands = new Array();
}}
alphatab.midi.MidiSequenceHandler.__name__ = ["alphatab","midi","MidiSequenceHandler"];
alphatab.midi.MidiSequenceHandler.prototype._commands = null;
alphatab.midi.MidiSequenceHandler.prototype.addControlChange = function(tick,track,channel,controller,value) {
	this.addEvent(track,tick,alphatab.midi.MidiMessageUtils.controlChange(channel,controller,value));
}
alphatab.midi.MidiSequenceHandler.prototype.addEvent = function(track,tick,evt) {
	var command = (((StringTools.hex(track) + "|") + StringTools.hex(tick)) + "|") + evt;
	this._commands.push(command);
}
alphatab.midi.MidiSequenceHandler.prototype.addNoteOff = function(tick,track,channel,note,velocity) {
	this.addEvent(track,tick,alphatab.midi.MidiMessageUtils.noteOff(channel,note,velocity));
}
alphatab.midi.MidiSequenceHandler.prototype.addNoteOn = function(tick,track,channel,note,velocity) {
	this.addEvent(track,tick,alphatab.midi.MidiMessageUtils.noteOn(channel,note,velocity));
}
alphatab.midi.MidiSequenceHandler.prototype.addPitchBend = function(tick,track,channel,value) {
	this.addEvent(track,tick,alphatab.midi.MidiMessageUtils.pitchBend(channel,value));
}
alphatab.midi.MidiSequenceHandler.prototype.addProgramChange = function(tick,track,channel,instrument) {
	this.addEvent(track,tick,alphatab.midi.MidiMessageUtils.programChange(channel,instrument));
}
alphatab.midi.MidiSequenceHandler.prototype.addTempoInUSQ = function(tick,track,usq) {
	this.addEvent(track,tick,alphatab.midi.MidiMessageUtils.tempoInUSQ(usq));
}
alphatab.midi.MidiSequenceHandler.prototype.addTimeSignature = function(tick,track,timeSignature) {
	this.addEvent(track,tick,alphatab.midi.MidiMessageUtils.timeSignature(timeSignature));
}
alphatab.midi.MidiSequenceHandler.prototype.commands = null;
alphatab.midi.MidiSequenceHandler.prototype.infoTrack = null;
alphatab.midi.MidiSequenceHandler.prototype.metronomeTrack = null;
alphatab.midi.MidiSequenceHandler.prototype.notifyFinish = function() {
	this.commands = (StringTools.hex(this.metronomeTrack) + ";") + this._commands.join(";");
}
alphatab.midi.MidiSequenceHandler.prototype.__class__ = alphatab.midi.MidiSequenceHandler;
alphatab.Main = function() { }
alphatab.Main.__name__ = ["alphatab","Main"];
alphatab.Main.main = function() {
	null;
}
alphatab.Main.prototype.__class__ = alphatab.Main;
alphatab.tablature.drawing.MusicFont = function() { }
alphatab.tablature.drawing.MusicFont.__name__ = ["alphatab","tablature","drawing","MusicFont"];
alphatab.tablature.drawing.MusicFont.prototype.__class__ = alphatab.tablature.drawing.MusicFont;
alphatab.model.GuitarString = function(p) { if( p === $_ ) return; {
	this.number = 0;
	this.value = 0;
}}
alphatab.model.GuitarString.__name__ = ["alphatab","model","GuitarString"];
alphatab.model.GuitarString.prototype.clone = function(factory) {
	var newString = factory.newString();
	newString.number = this.number;
	newString.value = this.value;
	return newString;
}
alphatab.model.GuitarString.prototype.number = null;
alphatab.model.GuitarString.prototype.value = null;
alphatab.model.GuitarString.prototype.__class__ = alphatab.model.GuitarString;
alphatab.model.effects.BendTypes = function() { }
alphatab.model.effects.BendTypes.__name__ = ["alphatab","model","effects","BendTypes"];
alphatab.model.effects.BendTypes.prototype.__class__ = alphatab.model.effects.BendTypes;
alphatab.tablature.model.JoinedType = { __ename__ : ["alphatab","tablature","model","JoinedType"], __constructs__ : ["NoneLeft","NoneRight","Left","Right"] }
alphatab.tablature.model.JoinedType.Left = ["Left",2];
alphatab.tablature.model.JoinedType.Left.toString = $estr;
alphatab.tablature.model.JoinedType.Left.__enum__ = alphatab.tablature.model.JoinedType;
alphatab.tablature.model.JoinedType.NoneLeft = ["NoneLeft",0];
alphatab.tablature.model.JoinedType.NoneLeft.toString = $estr;
alphatab.tablature.model.JoinedType.NoneLeft.__enum__ = alphatab.tablature.model.JoinedType;
alphatab.tablature.model.JoinedType.NoneRight = ["NoneRight",1];
alphatab.tablature.model.JoinedType.NoneRight.toString = $estr;
alphatab.tablature.model.JoinedType.NoneRight.__enum__ = alphatab.tablature.model.JoinedType;
alphatab.tablature.model.JoinedType.Right = ["Right",3];
alphatab.tablature.model.JoinedType.Right.toString = $estr;
alphatab.tablature.model.JoinedType.Right.__enum__ = alphatab.tablature.model.JoinedType;
alphatab.tablature.drawing.DrawingLayers = function() { }
alphatab.tablature.drawing.DrawingLayers.__name__ = ["alphatab","tablature","drawing","DrawingLayers"];
alphatab.tablature.drawing.DrawingLayers.prototype.__class__ = alphatab.tablature.drawing.DrawingLayers;
alphatab.model.Lyrics = function(trackChoice) { if( trackChoice === $_ ) return; {
	if(trackChoice == null) trackChoice = 0;
	this.trackChoice = trackChoice;
	this.lines = new Array();
}}
alphatab.model.Lyrics.__name__ = ["alphatab","model","Lyrics"];
alphatab.model.Lyrics.prototype.lines = null;
alphatab.model.Lyrics.prototype.lyricsBeats = function() {
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
alphatab.model.Lyrics.prototype.trackChoice = null;
alphatab.model.Lyrics.prototype.__class__ = alphatab.model.Lyrics;
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
alphatab.tablature.drawing.DrawingContext = function(scale) { if( scale === $_ ) return; {
	this.layers = new Array();
	this.layers[0] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(205,205,205),true,0);
	this.layers[1] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(34,34,17),true,0);
	this.layers[2] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(165,165,165),false,1);
	this.layers[3] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(34,34,17),true,0);
	this.layers[4] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(34,34,17),false,scale);
	this.layers[5] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(206,206,206),true,1);
	this.layers[6] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(183,183,183),true,0);
	this.layers[7] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(183,183,183),false,scale);
	this.layers[8] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(206,206,206),false,scale);
	this.layers[9] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(34,34,17),true,1);
	this.layers[10] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(34,34,17),true,0);
	this.layers[11] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(34,34,17),false,scale);
	this.layers[12] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(34,34,17),false,scale);
	this.layers[13] = new alphatab.tablature.drawing.DrawingLayer(new alphatab.model.Color(255,0,0),true,0);
}}
alphatab.tablature.drawing.DrawingContext.__name__ = ["alphatab","tablature","drawing","DrawingContext"];
alphatab.tablature.drawing.DrawingContext.prototype.clear = function() {
	var _g1 = 0, _g = this.layers.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.layers[i].clear();
	}
}
alphatab.tablature.drawing.DrawingContext.prototype.draw = function() {
	var _g1 = 0, _g = this.layers.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.layers[i].draw(this.graphics);
	}
}
alphatab.tablature.drawing.DrawingContext.prototype.get = function(layer) {
	return this.layers[layer];
}
alphatab.tablature.drawing.DrawingContext.prototype.graphics = null;
alphatab.tablature.drawing.DrawingContext.prototype.layers = null;
alphatab.tablature.drawing.DrawingContext.prototype.__class__ = alphatab.tablature.drawing.DrawingContext;
alphatab.model.BeatEffect = function(factory) { if( factory === $_ ) return; {
	this.tapping = false;
	this.slapping = false;
	this.popping = false;
	this.fadeIn = false;
	this.stroke = factory.newStroke();
}}
alphatab.model.BeatEffect.__name__ = ["alphatab","model","BeatEffect"];
alphatab.model.BeatEffect.prototype.chord = null;
alphatab.model.BeatEffect.prototype.fadeIn = null;
alphatab.model.BeatEffect.prototype.hasPickStroke = null;
alphatab.model.BeatEffect.prototype.hasRasgueado = null;
alphatab.model.BeatEffect.prototype.isTremoloBar = function() {
	return this.tremoloBar != null;
}
alphatab.model.BeatEffect.prototype.mixTableChange = null;
alphatab.model.BeatEffect.prototype.pickStroke = null;
alphatab.model.BeatEffect.prototype.popping = null;
alphatab.model.BeatEffect.prototype.slapping = null;
alphatab.model.BeatEffect.prototype.stroke = null;
alphatab.model.BeatEffect.prototype.tapping = null;
alphatab.model.BeatEffect.prototype.tremoloBar = null;
alphatab.model.BeatEffect.prototype.vibrato = null;
alphatab.model.BeatEffect.prototype.__class__ = alphatab.model.BeatEffect;
alphatab.model.Rectangle = function(x,y,width,height) { if( x === $_ ) return; {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}}
alphatab.model.Rectangle.__name__ = ["alphatab","model","Rectangle"];
alphatab.model.Rectangle.prototype.height = null;
alphatab.model.Rectangle.prototype.width = null;
alphatab.model.Rectangle.prototype.x = null;
alphatab.model.Rectangle.prototype.y = null;
alphatab.model.Rectangle.prototype.__class__ = alphatab.model.Rectangle;
alphatab.midi.MidiSequenceParser = function(factory,song,flags,tempoPercent,transpose) { if( factory === $_ ) return; {
	this._song = song;
	this._factory = factory;
	this._flags = flags;
	this._transpose = transpose;
	this._tempoPercent = tempoPercent;
	this._firstTickMove = (((flags & 8) == 0)?0:960);
}}
alphatab.midi.MidiSequenceParser.__name__ = ["alphatab","midi","MidiSequenceParser"];
alphatab.midi.MidiSequenceParser.applyDurationEffects = function(note,tempo,duration) {
	if(note.effect.deadNote) {
		return alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,30,duration);
	}
	if(note.effect.palmMute) {
		return alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,80,duration);
	}
	if(note.effect.staccato) {
		return Math.floor((duration * 50.0) / 100.0);
	}
	return duration;
}
alphatab.midi.MidiSequenceParser.applyStaticDuration = function(tempo,duration,maximum) {
	var value = Math.floor((tempo.value * duration) / 60);
	return (((value < maximum)?value:maximum));
}
alphatab.midi.MidiSequenceParser.applyStrokeDuration = function(note,duration,stroke) {
	return (duration - stroke[note.string - 1]);
}
alphatab.midi.MidiSequenceParser.applyStrokeStart = function(node,start,stroke) {
	return (start + stroke[node.string - 1]);
}
alphatab.midi.MidiSequenceParser.getNextBeat = function(voice,beatIndex) {
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
alphatab.midi.MidiSequenceParser.getNextNote = function(note,track,measureIndex,beatIndex) {
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
alphatab.midi.MidiSequenceParser.getPreviousBeat = function(voice,beatIndex) {
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
alphatab.midi.MidiSequenceParser.getPreviousNote = function(note,track,measureIndex,beatIndex) {
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
alphatab.midi.MidiSequenceParser.getRealVelocity = function(note,track,measureIndex,beatIndex) {
	var velocity = note.velocity;
	if(!track.isPercussionTrack) {
		var previousNote = alphatab.midi.MidiSequenceParser.getPreviousNote(note,track,measureIndex,beatIndex);
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
alphatab.midi.MidiSequenceParser.getStroke = function(beat,previous,stroke) {
	var direction = beat.effect.stroke.direction;
	if(((previous == null) || (direction != 0)) || (previous.effect.stroke.direction != 0)) {
		if(direction == 0) {
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
						var iIndex = ((direction != 2)?i:((stroke.length - 1) - i));
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
alphatab.midi.MidiSequenceParser.prototype._factory = null;
alphatab.midi.MidiSequenceParser.prototype._firstTickMove = null;
alphatab.midi.MidiSequenceParser.prototype._flags = null;
alphatab.midi.MidiSequenceParser.prototype._infoTrack = null;
alphatab.midi.MidiSequenceParser.prototype._metronomeTrack = null;
alphatab.midi.MidiSequenceParser.prototype._song = null;
alphatab.midi.MidiSequenceParser.prototype._tempoPercent = null;
alphatab.midi.MidiSequenceParser.prototype._transpose = null;
alphatab.midi.MidiSequenceParser.prototype.addBend = function(sequence,track,tick,bend,channel) {
	sequence.addPitchBend(this.getTick(tick),track,channel,bend);
}
alphatab.midi.MidiSequenceParser.prototype.addDefaultMessages = function(oSequence) {
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
alphatab.midi.MidiSequenceParser.prototype.addMetronome = function(sequence,header,startMove) {
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
alphatab.midi.MidiSequenceParser.prototype.addTempo = function(sequence,currentMeasure,previousMeasure,startMove) {
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
alphatab.midi.MidiSequenceParser.prototype.addTimeSignature = function(sequence,currentMeasure,previousMeasure,startMove) {
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
alphatab.midi.MidiSequenceParser.prototype.checkTripletFeel = function(voice,beatIndex) {
	var beatStart = voice.beat.start;
	var beatDuration = voice.duration.time();
	if(voice.beat.measure.tripletFeel() == 1) {
		if(voice.duration == this.newDuration(8)) {
			if((beatStart % 960) == 0) {
				var voice2 = alphatab.midi.MidiSequenceParser.getNextBeat(voice,beatIndex);
				if(((voice2 == null) || (voice2.beat.start > (beatStart + voice2.duration.time()))) || voice2.duration == this.newDuration(8)) {
					var duration = this.newDuration(8);
					duration.tuplet.enters = 3;
					duration.tuplet.times = 2;
					beatDuration = duration.time() * 2;
				}
			}
			else if((beatStart % (960 / 2)) == 0) {
				var voice2 = alphatab.midi.MidiSequenceParser.getPreviousBeat(voice,beatIndex);
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
	else if(voice.beat.measure.tripletFeel() == 2) {
		if(voice.duration == this.newDuration(16)) if((beatStart % (960 / 2)) == 0) {
			var voice2 = alphatab.midi.MidiSequenceParser.getNextBeat(voice,beatIndex);
			if(voice2 == null || (voice2.beat.start > (beatStart + voice.duration.time())) || voice2.duration == this.newDuration(16)) {
				var duration = this.newDuration(16);
				duration.tuplet.enters = 3;
				duration.tuplet.times = 2;
				beatDuration = duration.time() * 2;
			}
		}
		else if((beatStart % (960 / 4)) == 0) {
			var voice2 = alphatab.midi.MidiSequenceParser.getPreviousBeat(voice,beatIndex);
			if(voice2 == null || (voice2.beat.start < (beatStart - voice2.duration.time()) || voice2.duration == this.newDuration(16))) {
				var duration = this.newDuration(16);
				duration.tuplet.enters = 3;
				duration.tuplet.times = 2;
				beatStart = (beatStart - voice.duration.time()) + (duration.time() * 2);
				beatDuration = duration.time();
			}
		}
	}
	return new alphatab.midi.BeatData(beatStart,beatDuration);
}
alphatab.midi.MidiSequenceParser.prototype.createTrack = function(sequence,track) {
	var previous = null;
	var controller = new alphatab.midi.MidiRepeatController(track.song);
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
alphatab.midi.MidiSequenceParser.prototype.getMixChangeValue = function(value,signed) {
	if(signed == null) signed = true;
	if(signed) value += 8;
	return Math.round((value * 127) / 16);
}
alphatab.midi.MidiSequenceParser.prototype.getRealNoteDuration = function(track,note,tempo,duration,measureIndex,beatIndex) {
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
						return alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
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
								return alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
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
	return alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
}
alphatab.midi.MidiSequenceParser.prototype.getTick = function(tick) {
	return (tick + this._firstTickMove);
}
alphatab.midi.MidiSequenceParser.prototype.makeBeats = function(sequence,track,measure,measureIndex,startMove) {
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
			this.makeNotes(sequence,track,beat,measure.tempo(),measureIndex,beatIndex,startMove,alphatab.midi.MidiSequenceParser.getStroke(beat,previous,stroke));
			previous = beat;
		}
	}
}
alphatab.midi.MidiSequenceParser.prototype.makeBend = function(sequence,track,start,duration,bend,channel) {
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
alphatab.midi.MidiSequenceParser.prototype.makeChannel = function(sequence,channel,track) {
	if((this._flags & 2) == 0) return;
	this.makeChannel2(sequence,channel,track,true);
	if(channel.channel != channel.effectChannel) {
		this.makeChannel2(sequence,channel,track,false);
	}
}
alphatab.midi.MidiSequenceParser.prototype.makeChannel2 = function(sequence,channel,track,primary) {
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
alphatab.midi.MidiSequenceParser.prototype.makeFadeIn = function(sequence,track,start,duration,channel) {
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
alphatab.midi.MidiSequenceParser.prototype.makeMixChange = function(sequence,channel,track,beat) {
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
		sequence.addTempoInUSQ(start,this._infoTrack,alphatab.model.Tempo.tempoToUsq(change.tempo.value));
	}
}
alphatab.midi.MidiSequenceParser.prototype.makeNote = function(sequence,track,key,start,duration,velocity,channel) {
	sequence.addNoteOn(this.getTick(start),track,channel,key,velocity);
	sequence.addNoteOff(this.getTick(start + duration),track,channel,key,velocity);
}
alphatab.midi.MidiSequenceParser.prototype.makeNotes = function(sequence,track,beat,tempo,measureIndex,beatIndex,startMove,stroke) {
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
					var start = alphatab.midi.MidiSequenceParser.applyStrokeStart(note,data.start + startMove,stroke);
					var duration = alphatab.midi.MidiSequenceParser.applyStrokeDuration(note,this.getRealNoteDuration(track,note,tempo,data.duration,measureIndex,beatIndex),stroke);
					var velocity = alphatab.midi.MidiSequenceParser.getRealVelocity(note,track,measureIndex,beatIndex);
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
						var graceDuration = ((!note.effect.grace.isDead)?graceLength:alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,30,graceLength));
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
						var nextNote = alphatab.midi.MidiSequenceParser.getNextNote(note,track,measureIndex,beatIndex);
						this.makeSlide(sequence,trackId,note,nextNote,startMove,channel);
					}
					else if((note.effect.vibrato && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						this.makeVibrato(sequence,trackId,start,duration,channel);
					}
					if(note.effect.isHarmonic() && !percussionTrack) {
						var orig = key;
						if(note.effect.harmonic.type == alphatab.model.effects.HarmonicType.Natural) {
							{
								var _g5 = 0, _g4 = alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES.length;
								while(_g5 < _g4) {
									var i = _g5++;
									if((note.value % 12) == (alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[i][0] % 12)) {
										key = (orig + alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[i][1]) - note.value;
										break;
									}
								}
							}
						}
						else {
							if(note.effect.harmonic.type == alphatab.model.effects.HarmonicType.Semi) {
								this.makeNote(sequence,trackId,Math.round(Math.min(127,orig)),start,duration,Math.round(Math.max(15,velocity - 48)),channel);
							}
							key = orig + alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[note.effect.harmonic.data][1];
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
alphatab.midi.MidiSequenceParser.prototype.makeSlide = function(sequence,track,note,nextNote,startMove,channel) {
	if(nextNote != null) {
		this.makeSlide2(sequence,track,note.voice.beat.start + startMove,note.value,nextNote.voice.beat.start + startMove,nextNote.value,channel);
		this.addBend(sequence,track,nextNote.voice.beat.start + startMove,64,channel);
	}
}
alphatab.midi.MidiSequenceParser.prototype.makeSlide2 = function(sequence,track,tick1,value1,tick2,value2,channel) {
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
alphatab.midi.MidiSequenceParser.prototype.makeTremoloBar = function(sequence,track,start,duration,effect,channel) {
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
				if(nextValue == value) continue;
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
						pointStart += Math.round(width);
						this.addBend(sequence,track,pointStart,((value >= 0)?value:0),channel);
					}
				}
			}
		}
	}
	this.addBend(sequence,track,start + duration,64,channel);
}
alphatab.midi.MidiSequenceParser.prototype.makeVibrato = function(sequence,track,start,duration,channel) {
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
alphatab.midi.MidiSequenceParser.prototype.newDuration = function(value) {
	var duration = this._factory.newDuration();
	duration.value = (value);
	return duration;
}
alphatab.midi.MidiSequenceParser.prototype.parse = function(sequence) {
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
alphatab.midi.MidiSequenceParser.prototype.__class__ = alphatab.midi.MidiSequenceParser;
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
		catch( $e2 ) {
			{
				var e = $e2;
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
	catch( $e3 ) {
		{
			var e = $e3;
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
alphatab.platform.js.JQuery = function() { }
alphatab.platform.js.JQuery.__name__ = ["alphatab","platform","js","JQuery"];
alphatab.platform.js.JQuery.elements = function(e) {
	return (jQuery(e));
}
alphatab.platform.js.JQuery.ajax = function(options) {
	return jQuery.ajax(options);
}
alphatab.platform.js.JQuery.isIE = function() {
	return jQuery.browser.msie;
}
alphatab.platform.js.JQuery.prototype.Height = function() {
	return this.height();
}
alphatab.platform.js.JQuery.prototype.Width = function() {
	return this.width();
}
alphatab.platform.js.JQuery.prototype.setHeight = function(value) {
	return this.height(value);
}
alphatab.platform.js.JQuery.prototype.setWidth = function(value) {
	return this.width(value);
}
alphatab.platform.js.JQuery.prototype.__class__ = alphatab.platform.js.JQuery;
alphatab.tablature.drawing.DrawingResources = function() { }
alphatab.tablature.drawing.DrawingResources.__name__ = ["alphatab","tablature","drawing","DrawingResources"];
alphatab.tablature.drawing.DrawingResources.defaultFontHeight = null;
alphatab.tablature.drawing.DrawingResources.defaultFont = null;
alphatab.tablature.drawing.DrawingResources.chordFont = null;
alphatab.tablature.drawing.DrawingResources.timeSignatureFont = null;
alphatab.tablature.drawing.DrawingResources.clefFont = null;
alphatab.tablature.drawing.DrawingResources.musicFont = null;
alphatab.tablature.drawing.DrawingResources.tempoFont = null;
alphatab.tablature.drawing.DrawingResources.graceFontHeight = null;
alphatab.tablature.drawing.DrawingResources.graceFont = null;
alphatab.tablature.drawing.DrawingResources.noteFont = null;
alphatab.tablature.drawing.DrawingResources.noteFontHeight = null;
alphatab.tablature.drawing.DrawingResources.effectFont = null;
alphatab.tablature.drawing.DrawingResources.effectFontHeight = null;
alphatab.tablature.drawing.DrawingResources.titleFont = null;
alphatab.tablature.drawing.DrawingResources.subtitleFont = null;
alphatab.tablature.drawing.DrawingResources.wordsFont = null;
alphatab.tablature.drawing.DrawingResources.copyrightFont = null;
alphatab.tablature.drawing.DrawingResources.init = function(scale) {
	alphatab.tablature.drawing.DrawingResources.defaultFontHeight = Math.round(9 * scale);
	alphatab.tablature.drawing.DrawingResources.defaultFont = Std.string(alphatab.tablature.drawing.DrawingResources.defaultFontHeight) + "px 'Arial'";
	alphatab.tablature.drawing.DrawingResources.chordFont = Std.string(9 * scale) + "px 'Arial'";
	alphatab.tablature.drawing.DrawingResources.timeSignatureFont = Std.string(20 * scale) + "px 'Arial'";
	alphatab.tablature.drawing.DrawingResources.clefFont = Std.string(13 * scale) + "px 'Arial'";
	alphatab.tablature.drawing.DrawingResources.musicFont = Std.string(13 * scale) + "px 'Arial'";
	alphatab.tablature.drawing.DrawingResources.tempoFont = Std.string(11 * scale) + "px 'Arial'";
	alphatab.tablature.drawing.DrawingResources.graceFontHeight = Math.round(9 * scale);
	alphatab.tablature.drawing.DrawingResources.graceFont = Std.string(alphatab.tablature.drawing.DrawingResources.graceFontHeight) + "px 'Arial'";
	alphatab.tablature.drawing.DrawingResources.noteFontHeight = Math.round(11 * scale);
	alphatab.tablature.drawing.DrawingResources.noteFont = Std.string(alphatab.tablature.drawing.DrawingResources.noteFontHeight) + "px 'Arial'";
	alphatab.tablature.drawing.DrawingResources.effectFontHeight = Math.round(11 * scale);
	alphatab.tablature.drawing.DrawingResources.effectFont = ("italic " + Std.string(alphatab.tablature.drawing.DrawingResources.effectFontHeight)) + "px 'Times New Roman'";
	alphatab.tablature.drawing.DrawingResources.titleFont = Std.string(30 * scale) + "px 'Times New Roman'";
	alphatab.tablature.drawing.DrawingResources.subtitleFont = Std.string(19 * scale) + "px 'Times New Roman'";
	alphatab.tablature.drawing.DrawingResources.wordsFont = Std.string(13 * scale) + "px 'Times New Roman'";
	alphatab.tablature.drawing.DrawingResources.copyrightFont = ("bold " + Std.string(11 * scale)) + "px 'Arial'";
}
alphatab.tablature.drawing.DrawingResources.getScoreNoteSize = function(layout,full) {
	var scale = ((full?layout.scoreLineSpacing + 1:layout.scoreLineSpacing)) - 2;
	return new alphatab.model.Point(Math.round(scale * 1.3),Math.round(scale));
}
alphatab.tablature.drawing.DrawingResources.prototype.__class__ = alphatab.tablature.drawing.DrawingResources;
alphatab.model.Tuplet = function(p) { if( p === $_ ) return; {
	this.enters = 1;
	this.times = 1;
}}
alphatab.model.Tuplet.__name__ = ["alphatab","model","Tuplet"];
alphatab.model.Tuplet.prototype.clone = function(factory) {
	var tuplet = factory.newTuplet();
	this.copy(tuplet);
	return tuplet;
}
alphatab.model.Tuplet.prototype.convertTime = function(time) {
	return Math.floor((time * this.times) / this.enters);
}
alphatab.model.Tuplet.prototype.copy = function(tuplet) {
	tuplet.enters = this.enters;
	tuplet.times = this.times;
}
alphatab.model.Tuplet.prototype.enters = null;
alphatab.model.Tuplet.prototype.equals = function(tuplet) {
	return this.enters == tuplet.enters && this.times == tuplet.times;
}
alphatab.model.Tuplet.prototype.times = null;
alphatab.model.Tuplet.prototype.__class__ = alphatab.model.Tuplet;
alphatab.model.SongManager = function(factory) { if( factory === $_ ) return; {
	this.factory = factory;
}}
alphatab.model.SongManager.__name__ = ["alphatab","model","SongManager"];
alphatab.model.SongManager.getDivisionLength = function(header) {
	var defaulLenght = 960;
	var denominator = header.timeSignature.denominator.value;
	switch(denominator) {
	case 8:{
		if(header.timeSignature.numerator % 3 == 0) defaulLenght += Math.floor(960 / 2);
	}break;
	}
	return defaulLenght;
}
alphatab.model.SongManager.getNextBeat2 = function(beats,currentBeat) {
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
alphatab.model.SongManager.getNextVoice = function(beats,beat,index) {
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
alphatab.model.SongManager.getFirstVoice = function(beats,index) {
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
alphatab.model.SongManager.getBeat = function(measure,start) {
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
alphatab.model.SongManager.quickSort = function(elements,left,right) {
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
	if(left < j) alphatab.model.SongManager.quickSort(elements,left,j);
	if(i < right) alphatab.model.SongManager.quickSort(elements,i,right);
}
alphatab.model.SongManager.prototype.autoCompleteSilences = function(measure) {
	var beat = this.getFirstBeat(measure.beats);
	if(beat == null) {
		this.createSilences(measure,measure.start(),measure.length(),0);
		return;
	}
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			var voice = alphatab.model.SongManager.getFirstVoice(measure.beats,v);
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
					var nextVoice = alphatab.model.SongManager.getNextVoice(measure.beats,beat,voice.index);
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
		beat = alphatab.model.SongManager.getNextBeat2(measure.beats,beat);
	}
}
alphatab.model.SongManager.prototype.createDurations = function(time) {
	var durations = new Array();
	var min = this.factory.newDuration();
	min.value = 64;
	min.isDotted = false;
	min.isDoubleDotted = false;
	min.tuplet.enters = 3;
	min.tuplet.times = 2;
	var missing = time;
	while(missing > min.time()) {
		var duration = alphatab.model.Duration.fromTime(this.factory,missing,min,10);
		durations.push(duration.clone(this.factory));
		missing -= duration.time();
	}
	return durations;
}
alphatab.model.SongManager.prototype.createSilences = function(measure,start,length,voiceIndex) {
	var nextStart = start;
	var durations = this.createDurations(length);
	{
		var _g = 0;
		while(_g < durations.length) {
			var duration = durations[_g];
			++_g;
			var isNew = false;
			var beatStart = this.getRealStart(measure,nextStart);
			var beat = alphatab.model.SongManager.getBeat(measure,beatStart);
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
alphatab.model.SongManager.prototype.factory = null;
alphatab.model.SongManager.prototype.getFirstBeat = function(list) {
	return (list.length > 0?list[0]:null);
}
alphatab.model.SongManager.prototype.getFirstMeasure = function(track) {
	return (track.measureCount() > 0?track.measures[0]:null);
}
alphatab.model.SongManager.prototype.getNextBeat = function(beat) {
	var nextBeat = alphatab.model.SongManager.getNextBeat2(beat.measure.beats,beat);
	if(nextBeat == null && beat.measure.track.measureCount() > beat.measure.number()) {
		var measure = beat.measure.track.measures[beat.measure.number()];
		if(measure.beatCount() > 0) {
			return measure.beats[0];
		}
	}
	return nextBeat;
}
alphatab.model.SongManager.prototype.getNextNote = function(measure,start,voiceIndex,guitarString) {
	var beat = alphatab.model.SongManager.getBeat(measure,start);
	if(beat != null) {
		var next = alphatab.model.SongManager.getNextBeat2(measure.beats,beat);
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
			next = alphatab.model.SongManager.getNextBeat2(measure.beats,next);
		}
	}
	return null;
}
alphatab.model.SongManager.prototype.getPreviousMeasure = function(measure) {
	return (measure.number() > 1?measure.track.measures[measure.number() - 2]:null);
}
alphatab.model.SongManager.prototype.getPreviousMeasureHeader = function(header) {
	var prevIndex = header.number - 1;
	if(prevIndex > 0) {
		return header.song.measureHeaders[prevIndex - 1];
	}
	return null;
}
alphatab.model.SongManager.prototype.getRealStart = function(measure,currentStart) {
	var beatLength = alphatab.model.SongManager.getDivisionLength(measure.header);
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
alphatab.model.SongManager.prototype.orderBeats = function(measure) {
	alphatab.model.SongManager.quickSort(measure.beats,0,measure.beatCount() - 1);
}
alphatab.model.SongManager.prototype.__class__ = alphatab.model.SongManager;
alphatab.model.Song = function(p) { if( p === $_ ) return; {
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
alphatab.model.Song.__name__ = ["alphatab","model","Song"];
alphatab.model.Song.prototype.addMeasureHeader = function(header) {
	header.song = this;
	this.measureHeaders.push(header);
}
alphatab.model.Song.prototype.addTrack = function(track) {
	track.song = this;
	this.tracks.push(track);
}
alphatab.model.Song.prototype.album = null;
alphatab.model.Song.prototype.artist = null;
alphatab.model.Song.prototype.copyright = null;
alphatab.model.Song.prototype.hideTempo = null;
alphatab.model.Song.prototype.instructions = null;
alphatab.model.Song.prototype.key = null;
alphatab.model.Song.prototype.lyrics = null;
alphatab.model.Song.prototype.measureHeaders = null;
alphatab.model.Song.prototype.music = null;
alphatab.model.Song.prototype.notice = null;
alphatab.model.Song.prototype.octave = null;
alphatab.model.Song.prototype.pageSetup = null;
alphatab.model.Song.prototype.subtitle = null;
alphatab.model.Song.prototype.tab = null;
alphatab.model.Song.prototype.tempo = null;
alphatab.model.Song.prototype.tempoName = null;
alphatab.model.Song.prototype.title = null;
alphatab.model.Song.prototype.tracks = null;
alphatab.model.Song.prototype.words = null;
alphatab.model.Song.prototype.__class__ = alphatab.model.Song;
alphatab.model.Tempo = function(p) { if( p === $_ ) return; {
	this.value = 120;
}}
alphatab.model.Tempo.__name__ = ["alphatab","model","Tempo"];
alphatab.model.Tempo.tempoToUsq = function(tempo) {
	return Math.floor(((60.00 / tempo) * 1000) * 1000.00);
}
alphatab.model.Tempo.prototype.copy = function(tempo) {
	this.value = tempo.value;
}
alphatab.model.Tempo.prototype.inUsq = function() {
	return alphatab.model.Tempo.tempoToUsq(this.value);
}
alphatab.model.Tempo.prototype.value = null;
alphatab.model.Tempo.prototype.__class__ = alphatab.model.Tempo;
alphatab.tablature.drawing.TripletFeelPainter = function() { }
alphatab.tablature.drawing.TripletFeelPainter.__name__ = ["alphatab","tablature","drawing","TripletFeelPainter"];
alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel16 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.TripletFeel16,x,y,scale);
}
alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel8 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.TripletFeel8,x,y,scale);
}
alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone16 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.TripletFeelNone16,x,y,scale);
}
alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone8 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.TripletFeelNone8,x,y,scale);
}
alphatab.tablature.drawing.TripletFeelPainter.prototype.__class__ = alphatab.tablature.drawing.TripletFeelPainter;
alphatab.tablature.drawing.NotePainter = function() { }
alphatab.tablature.drawing.NotePainter.__name__ = ["alphatab","tablature","drawing","NotePainter"];
alphatab.tablature.drawing.NotePainter.paintFooter = function(layer,x,y,dur,dir,layout) {
	var scale = layout.scale;
	if(dir == -1) {
		x += alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x;
	}
	var s = "";
	switch(dur) {
	case 64:{
		s = ((dir == -1)?alphatab.tablature.drawing.MusicFont.FooterUpSixtyFourth:alphatab.tablature.drawing.MusicFont.FooterDownSixtyFourth);
	}break;
	case 32:{
		s = ((dir == -1)?alphatab.tablature.drawing.MusicFont.FooterUpThirtySecond:alphatab.tablature.drawing.MusicFont.FooterDownThirtySecond);
	}break;
	case 16:{
		s = ((dir == -1)?alphatab.tablature.drawing.MusicFont.FooterUpSixteenth:alphatab.tablature.drawing.MusicFont.FooterDownSixteenth);
	}break;
	case 8:{
		s = ((dir == -1)?alphatab.tablature.drawing.MusicFont.FooterUpEighth:alphatab.tablature.drawing.MusicFont.FooterDownEighth);
	}break;
	}
	if(s != "") layer.addMusicSymbol(s,x,y,scale);
}
alphatab.tablature.drawing.NotePainter.paintBar = function(layer,x1,y1,x2,y2,count,dir,scale) {
	var width = Math.max(1.0,Math.round(3.0 * scale));
	{
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			var realY1 = (y1 - ((i * (5.0 * scale)) * dir));
			var realY2 = (y2 - ((i * (5.0 * scale)) * dir));
			layer.startFigure();
			layer.addPolygon([new alphatab.model.Point(x1,realY1),new alphatab.model.Point(x2,realY2),new alphatab.model.Point(x2,realY2 + width),new alphatab.model.Point(x1,realY1 + width),new alphatab.model.Point(x1,realY1)]);
			layer.closeFigure();
		}
	}
}
alphatab.tablature.drawing.NotePainter.paintHarmonic = function(layer,x,y,scale) {
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.Harmonic,x,y,scale);
}
alphatab.tablature.drawing.NotePainter.paintNote = function(layer,x,y,scale,full,font) {
	var symbol = (full?alphatab.tablature.drawing.MusicFont.NoteQuarter:alphatab.tablature.drawing.MusicFont.NoteHalf);
	layer.addMusicSymbol(symbol,x,y,scale);
}
alphatab.tablature.drawing.NotePainter.paintDeadNote = function(layer,x,y,scale,font) {
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.DeadNote,x,y,scale);
}
alphatab.tablature.drawing.NotePainter.prototype.__class__ = alphatab.tablature.drawing.NotePainter;
alphatab.model.MeasureHeader = function(factory) { if( factory === $_ ) return; {
	this.number = 0;
	this.start = 960;
	this.timeSignature = factory.newTimeSignature();
	this.keySignature = 0;
	this.tempo = factory.newTempo();
	this.marker = null;
	this.tripletFeel = 0;
	this.isRepeatOpen = false;
	this.repeatClose = 0;
	this.repeatAlternative = 0;
}}
alphatab.model.MeasureHeader.__name__ = ["alphatab","model","MeasureHeader"];
alphatab.model.MeasureHeader.prototype.hasDoubleBar = null;
alphatab.model.MeasureHeader.prototype.hasMarker = function() {
	return this.marker != null;
}
alphatab.model.MeasureHeader.prototype.isRepeatOpen = null;
alphatab.model.MeasureHeader.prototype.keySignature = null;
alphatab.model.MeasureHeader.prototype.keySignatureType = null;
alphatab.model.MeasureHeader.prototype.length = function() {
	return this.timeSignature.numerator * this.timeSignature.denominator.time();
}
alphatab.model.MeasureHeader.prototype.marker = null;
alphatab.model.MeasureHeader.prototype.number = null;
alphatab.model.MeasureHeader.prototype.repeatAlternative = null;
alphatab.model.MeasureHeader.prototype.repeatClose = null;
alphatab.model.MeasureHeader.prototype.song = null;
alphatab.model.MeasureHeader.prototype.start = null;
alphatab.model.MeasureHeader.prototype.tempo = null;
alphatab.model.MeasureHeader.prototype.timeSignature = null;
alphatab.model.MeasureHeader.prototype.tripletFeel = null;
alphatab.model.MeasureHeader.prototype.__class__ = alphatab.model.MeasureHeader;
alphatab.file.guitarpro.Gp4Reader = function(p) { if( p === $_ ) return; {
	alphatab.file.guitarpro.Gp3Reader.apply(this,[]);
	this.initVersions(["FICHIER GUITAR PRO v4.00","FICHIER GUITAR PRO v4.06","FICHIER GUITAR PRO L4.06"]);
}}
alphatab.file.guitarpro.Gp4Reader.__name__ = ["alphatab","file","guitarpro","Gp4Reader"];
alphatab.file.guitarpro.Gp4Reader.__super__ = alphatab.file.guitarpro.Gp3Reader;
for(var k in alphatab.file.guitarpro.Gp3Reader.prototype ) alphatab.file.guitarpro.Gp4Reader.prototype[k] = alphatab.file.guitarpro.Gp3Reader.prototype[k];
alphatab.file.guitarpro.Gp4Reader.prototype.readArtificialHarmonic = function(noteEffect) {
	var type = this.readByte();
	var oHarmonic = this.factory.newHarmonicEffect();
	oHarmonic.data = 0;
	switch(type) {
	case 1:{
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Natural);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 3:{
		this.skip(1);
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Tapped);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 4:{
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Pinch);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 5:{
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Semi);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 15:{
		oHarmonic.data = 2;
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Artificial);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 17:{
		oHarmonic.data = 3;
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Artificial);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 22:{
		oHarmonic.data = 0;
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Artificial);
		noteEffect.harmonic = (oHarmonic);
	}break;
	}
}
alphatab.file.guitarpro.Gp4Reader.prototype.readBeat = function(start,measure,track,voiceIndex) {
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
alphatab.file.guitarpro.Gp4Reader.prototype.readBeatEffects = function(beat,effect) {
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
			beat.effect.stroke.direction = 1;
			beat.effect.stroke.value = (alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.effect.stroke.direction = 2;
			beat.effect.stroke.value = (alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeDown));
		}
	}
	beat.effect.hasRasgueado = (flags2 & 1) != 0;
	if((flags2 & 2) != 0) {
		beat.effect.pickStroke = this.readByte();
		beat.effect.hasPickStroke = true;
	}
}
alphatab.file.guitarpro.Gp4Reader.prototype.readChord = function(stringCount,beat) {
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
alphatab.file.guitarpro.Gp4Reader.prototype.readMixTableChange = function(measure) {
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
alphatab.file.guitarpro.Gp4Reader.prototype.readNoteEffects = function(noteEffect) {
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
			noteEffect.slideType = 0;
		}break;
		case 2:{
			noteEffect.slideType = 1;
		}break;
		case 4:{
			noteEffect.slideType = 2;
		}break;
		case 8:{
			noteEffect.slideType = 3;
		}break;
		case 16:{
			noteEffect.slideType = 4;
		}break;
		case 32:{
			noteEffect.slideType = 5;
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
alphatab.file.guitarpro.Gp4Reader.prototype.readSong = function() {
	if(!this.readVersion()) {
		throw new alphatab.file.FileFormatException("Unsupported Version");
	}
	var song = this.factory.newSong();
	this.readInfo(song);
	this._tripletFeel = (this.readBool()?1:0);
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
alphatab.file.guitarpro.Gp4Reader.prototype.readTremoloBar = function(effect) {
	var barEffect = this.factory.newTremoloBarEffect();
	barEffect.type = this.readByte();
	barEffect.value = this.readInt();
	var pointCount = this.readInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.readInt() * 12) / 60);
			var pointValue = Math.round(this.readInt() / (25 * 2.0));
			var vibrato = this.readBool();
			barEffect.points.push(new alphatab.model.effects.BendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) effect.tremoloBar = barEffect;
}
alphatab.file.guitarpro.Gp4Reader.prototype.readTremoloPicking = function(noteEffect) {
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
alphatab.file.guitarpro.Gp4Reader.prototype.readTrill = function(noteEffect) {
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
alphatab.file.guitarpro.Gp4Reader.prototype.__class__ = alphatab.file.guitarpro.Gp4Reader;
alphatab.file.guitarpro.Gp5Reader = function(p) { if( p === $_ ) return; {
	alphatab.file.guitarpro.Gp4Reader.apply(this,[]);
	this.initVersions(["FICHIER GUITAR PRO v5.00","FICHIER GUITAR PRO v5.10"]);
}}
alphatab.file.guitarpro.Gp5Reader.__name__ = ["alphatab","file","guitarpro","Gp5Reader"];
alphatab.file.guitarpro.Gp5Reader.__super__ = alphatab.file.guitarpro.Gp4Reader;
for(var k in alphatab.file.guitarpro.Gp4Reader.prototype ) alphatab.file.guitarpro.Gp5Reader.prototype[k] = alphatab.file.guitarpro.Gp4Reader.prototype[k];
alphatab.file.guitarpro.Gp5Reader.prototype.readArtificialHarmonic = function(noteEffect) {
	var type = this.readByte();
	var oHarmonic = this.factory.newHarmonicEffect();
	oHarmonic.data = 0;
	switch(type) {
	case 1:{
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Natural);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 2:{
		this.skip(3);
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Artificial);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 3:{
		this.skip(1);
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Tapped);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 4:{
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Pinch);
		noteEffect.harmonic = (oHarmonic);
	}break;
	case 5:{
		oHarmonic.type = (alphatab.model.effects.HarmonicType.Semi);
		noteEffect.harmonic = (oHarmonic);
	}break;
	}
}
alphatab.file.guitarpro.Gp5Reader.prototype.readBeat = function(start,measure,track,voiceIndex) {
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
alphatab.file.guitarpro.Gp5Reader.prototype.readChord = function(stringCount,beat) {
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
alphatab.file.guitarpro.Gp5Reader.prototype.readGrace = function(noteEffect) {
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
		grace.transition = 0;
	}break;
	case 1:{
		grace.transition = 1;
	}break;
	case 2:{
		grace.transition = 2;
	}break;
	case 3:{
		grace.transition = 3;
	}break;
	}
	noteEffect.grace = (grace);
}
alphatab.file.guitarpro.Gp5Reader.prototype.readInfo = function(song) {
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
alphatab.file.guitarpro.Gp5Reader.prototype.readMeasure = function(measure,track) {
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
alphatab.file.guitarpro.Gp5Reader.prototype.readMeasureHeader = function(i,timeSignature,song) {
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
		header.keySignature = alphatab.file.guitarpro.Gp3Reader.toKeySignature(this.readByte());
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
		header.tripletFeel = 1;
	}break;
	case 2:{
		header.tripletFeel = 2;
	}break;
	default:{
		header.tripletFeel = 0;
	}break;
	}
	return header;
}
alphatab.file.guitarpro.Gp5Reader.prototype.readMixTableChange = function(measure) {
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
alphatab.file.guitarpro.Gp5Reader.prototype.readNote = function(guitarString,track,effect) {
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
alphatab.file.guitarpro.Gp5Reader.prototype.readNoteEffects = function(noteEffect) {
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
			noteEffect.slideType = 0;
		}break;
		case 2:{
			noteEffect.slideType = 1;
		}break;
		case 4:{
			noteEffect.slideType = 2;
		}break;
		case 8:{
			noteEffect.slideType = 3;
		}break;
		case 16:{
			noteEffect.slideType = 4;
		}break;
		case 32:{
			noteEffect.slideType = 5;
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
alphatab.file.guitarpro.Gp5Reader.prototype.readPageSetup = function(song) {
	var setup = this.factory.newPageSetup();
	if(this._versionIndex > 0) this.skip(19);
	setup.pageSize = new alphatab.model.Point(this.readInt(),this.readInt());
	var l = this.readInt();
	var r = this.readInt();
	var t = this.readInt();
	var b = this.readInt();
	setup.pageMargin = new alphatab.model.Rectangle(l,t,r,b);
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
alphatab.file.guitarpro.Gp5Reader.prototype.readSong = function() {
	if(!this.readVersion()) {
		throw new alphatab.file.FileFormatException("Unsupported Version");
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
alphatab.file.guitarpro.Gp5Reader.prototype.readTrack = function(number,channels) {
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
alphatab.file.guitarpro.Gp5Reader.prototype.readTracks = function(song,trackCount,channels) {
	{
		var _g1 = 1, _g = trackCount + 1;
		while(_g1 < _g) {
			var i = _g1++;
			song.addTrack(this.readTrack(i,channels));
		}
	}
	this.skip(((this._versionIndex == 0?2:1)));
}
alphatab.file.guitarpro.Gp5Reader.prototype.__class__ = alphatab.file.guitarpro.Gp5Reader;
alphatab.tablature.TrackSpacing = function(p) { if( p === $_ ) return; {
	this.spacing = new Array();
	{
		var _g = 0;
		while(_g < 24) {
			var i = _g++;
			this.spacing.push(0);
		}
	}
}}
alphatab.tablature.TrackSpacing.__name__ = ["alphatab","tablature","TrackSpacing"];
alphatab.tablature.TrackSpacing.prototype.get = function(index) {
	var size = 0;
	{
		var _g = 0;
		while(_g < index) {
			var i = _g++;
			size += this.spacing[i];
		}
	}
	return size;
}
alphatab.tablature.TrackSpacing.prototype.getSize = function() {
	return this.get(23);
}
alphatab.tablature.TrackSpacing.prototype.set = function(index,value) {
	this.spacing[index] = value;
}
alphatab.tablature.TrackSpacing.prototype.spacing = null;
alphatab.tablature.TrackSpacing.prototype.__class__ = alphatab.tablature.TrackSpacing;
alphatab.model.Point = function(x,y) { if( x === $_ ) return; {
	this.x = x;
	this.y = y;
}}
alphatab.model.Point.__name__ = ["alphatab","model","Point"];
alphatab.model.Point.prototype.x = null;
alphatab.model.Point.prototype.y = null;
alphatab.model.Point.prototype.__class__ = alphatab.model.Point;
alphatab.file.SongLoader = function() { }
alphatab.file.SongLoader.__name__ = ["alphatab","file","SongLoader"];
alphatab.file.SongLoader.loadSong = function(url,factory,success) {
	var loader = alphatab.platform.PlatformFactory.getLoader();
	loader.loadBinary("GET",url,function(data) {
		var readers = alphatab.file.SongReader.availableReaders();
		{
			var _g = 0;
			while(_g < readers.length) {
				var reader = readers[_g];
				++_g;
				try {
					data.seek(0);
					reader.init(data,factory);
					var song = reader.readSong();
					success(song);
					return;
				}
				catch( $e4 ) {
					if( js.Boot.__instanceof($e4,alphatab.file.FileFormatException) ) {
						var e = $e4;
						{
							continue;
						}
					} else throw($e4);
				}
			}
		}
		throw new alphatab.file.FileFormatException("No reader for requested file found");
	},function(err) {
		throw err;
	});
}
alphatab.file.SongLoader.prototype.__class__ = alphatab.file.SongLoader;
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
alphatab.tablature.TrackSpacingPositions = function() { }
alphatab.tablature.TrackSpacingPositions.__name__ = ["alphatab","tablature","TrackSpacingPositions"];
alphatab.tablature.TrackSpacingPositions.prototype.__class__ = alphatab.tablature.TrackSpacingPositions;
alphatab.midi.BeatData = function(start,duration) { if( start === $_ ) return; {
	this.start = start;
	this.duration = duration;
}}
alphatab.midi.BeatData.__name__ = ["alphatab","midi","BeatData"];
alphatab.midi.BeatData.prototype.duration = null;
alphatab.midi.BeatData.prototype.start = null;
alphatab.midi.BeatData.prototype.__class__ = alphatab.midi.BeatData;
alphatab.model.Measure = function(header) { if( header === $_ ) return; {
	this.header = header;
	this.clef = 0;
	this.beats = new Array();
}}
alphatab.model.Measure.__name__ = ["alphatab","model","Measure"];
alphatab.model.Measure.prototype.addBeat = function(beat) {
	beat.measure = this;
	this.beats.push(beat);
}
alphatab.model.Measure.prototype.beatCount = function() {
	return this.beats.length;
}
alphatab.model.Measure.prototype.beats = null;
alphatab.model.Measure.prototype.clef = null;
alphatab.model.Measure.prototype.end = function() {
	return this.start() + this.length();
}
alphatab.model.Measure.prototype.hasMarker = function() {
	return this.header.hasMarker();
}
alphatab.model.Measure.prototype.header = null;
alphatab.model.Measure.prototype.isRepeatOpen = function() {
	return this.header.isRepeatOpen;
}
alphatab.model.Measure.prototype.keySignature = function() {
	return this.header.keySignature;
}
alphatab.model.Measure.prototype.length = function() {
	return this.header.length();
}
alphatab.model.Measure.prototype.marker = function() {
	return this.header.marker;
}
alphatab.model.Measure.prototype.number = function() {
	return this.header.number;
}
alphatab.model.Measure.prototype.repeatClose = function() {
	return this.header.repeatClose;
}
alphatab.model.Measure.prototype.start = function() {
	return this.header.start;
}
alphatab.model.Measure.prototype.tempo = function() {
	return this.header.tempo;
}
alphatab.model.Measure.prototype.timeSignature = function() {
	return this.header.timeSignature;
}
alphatab.model.Measure.prototype.track = null;
alphatab.model.Measure.prototype.tripletFeel = function() {
	return this.header.tripletFeel;
}
alphatab.model.Measure.prototype.__class__ = alphatab.model.Measure;
alphatab.tablature.model.MeasureImpl = function(header) { if( header === $_ ) return; {
	alphatab.model.Measure.apply(this,[header]);
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
alphatab.tablature.model.MeasureImpl.__name__ = ["alphatab","tablature","model","MeasureImpl"];
alphatab.tablature.model.MeasureImpl.__super__ = alphatab.model.Measure;
for(var k in alphatab.model.Measure.prototype ) alphatab.tablature.model.MeasureImpl.prototype[k] = alphatab.model.Measure.prototype[k];
alphatab.tablature.model.MeasureImpl.makeVoice = function(layout,voice,previousVoice,group) {
	voice.width = layout.getVoiceWidth(voice);
	voice.beatGroup = (group);
	if(previousVoice != null) {
		voice.previousBeat = (previousVoice);
		previousVoice.nextBeat = (voice);
	}
}
alphatab.tablature.model.MeasureImpl.getStartPosition = function(measure,start,spacing) {
	var newStart = start - measure.start();
	var displayPosition = 0.0;
	if(newStart > 0) {
		var position = (newStart / 960);
		displayPosition = (position * spacing);
	}
	return displayPosition;
}
alphatab.tablature.model.MeasureImpl.prototype._accentuated = null;
alphatab.tablature.model.MeasureImpl.prototype._beatVibrato = null;
alphatab.tablature.model.MeasureImpl.prototype._bend = null;
alphatab.tablature.model.MeasureImpl.prototype._bendOverFlow = null;
alphatab.tablature.model.MeasureImpl.prototype._chord = null;
alphatab.tablature.model.MeasureImpl.prototype._fadeIn = null;
alphatab.tablature.model.MeasureImpl.prototype._harmonic = null;
alphatab.tablature.model.MeasureImpl.prototype._letRing = null;
alphatab.tablature.model.MeasureImpl.prototype._palmMute = null;
alphatab.tablature.model.MeasureImpl.prototype._previousMeasure = null;
alphatab.tablature.model.MeasureImpl.prototype._registeredAccidentals = null;
alphatab.tablature.model.MeasureImpl.prototype._tapping = null;
alphatab.tablature.model.MeasureImpl.prototype._text = null;
alphatab.tablature.model.MeasureImpl.prototype._tremoloBar = null;
alphatab.tablature.model.MeasureImpl.prototype._tremoloBarOverFlow = null;
alphatab.tablature.model.MeasureImpl.prototype._tupleto = null;
alphatab.tablature.model.MeasureImpl.prototype._vibrato = null;
alphatab.tablature.model.MeasureImpl.prototype._voiceGroups = null;
alphatab.tablature.model.MeasureImpl.prototype._widthBeats = null;
alphatab.tablature.model.MeasureImpl.prototype.calculateBeats = function(layout) {
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
								groups[v] = new alphatab.tablature.model.BeatGroup(v);
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
						alphatab.tablature.model.MeasureImpl.makeVoice(layout,voice,previousVoices[v],groups[v]);
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
alphatab.tablature.model.MeasureImpl.prototype.calculateKeySignatureSpacing = function(layout) {
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
alphatab.tablature.model.MeasureImpl.prototype.calculateMeasureChanges = function(layout) {
	this.isPaintClef = false;
	this._previousMeasure = ((layout.isFirstMeasure(this)?null:layout.songManager().getPreviousMeasure(this)));
	if(this._previousMeasure == null || this.clef != this._previousMeasure.clef) {
		this.isPaintClef = true;
		this.headerImpl().notifyClefSpacing(Math.round(40 * layout.scale));
	}
}
alphatab.tablature.model.MeasureImpl.prototype.calculateWidth = function(layout) {
	this.width = this._widthBeats;
	this.width += this.getFirstNoteSpacing(layout);
	this.width += ((this.repeatClose() > 0)?20:0);
	this.width += this.headerImpl().getLeftSpacing(layout);
	this.width += this.headerImpl().getRightSpacing(layout);
	this.headerImpl().notifyWidth(this.width);
}
alphatab.tablature.model.MeasureImpl.prototype.canJoin = function(manager,b1,b2) {
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
alphatab.tablature.model.MeasureImpl.prototype.checkEffects = function(layout,note) {
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
alphatab.tablature.model.MeasureImpl.prototype.checkValue = function(layout,note,direction) {
	var y = note.scorePosY;
	var upOffset = alphatab.tablature.model.BeatGroup.getUpOffset(layout);
	var downOffset = alphatab.tablature.model.BeatGroup.getDownOffset(layout);
	if(direction == 1 && y > this.maxY) {
		this.maxY = y;
	}
	else if(direction == 2 && (y + downOffset) > this.maxY) {
		this.maxY = Math.floor((y + downOffset) + 2);
	}
	if(direction == 1 && (y - upOffset) < this.minY) {
		this.minY = Math.floor((y - upOffset) - 2);
	}
	else if(direction == 2 && y < this.minY) {
		this.minY = y;
	}
}
alphatab.tablature.model.MeasureImpl.prototype.clearRegisteredAccidentals = function() {
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
alphatab.tablature.model.MeasureImpl.prototype.create = function(layout) {
	this.divisionLength = alphatab.model.SongManager.getDivisionLength(this.header);
	this.resetSpacing();
	this.clearRegisteredAccidentals();
	this.calculateBeats(layout);
	this.calculateWidth(layout);
	this.isFirstOfLine = false;
}
alphatab.tablature.model.MeasureImpl.prototype.divisionLength = null;
alphatab.tablature.model.MeasureImpl.prototype.getBeatSpacing = function(beat) {
	return ((beat.start - this.start()) * this.spacing) / this.length();
}
alphatab.tablature.model.MeasureImpl.prototype.getClefSpacing = function(layout) {
	return this.headerImpl().getClefSpacing(layout,this);
}
alphatab.tablature.model.MeasureImpl.prototype.getFirstNoteSpacing = function(layout) {
	return this.headerImpl().getFirstNoteSpacing(layout,this);
}
alphatab.tablature.model.MeasureImpl.prototype.getKeySignatureSpacing = function(layout) {
	return this.headerImpl().getKeySignatureSpacing(layout,this);
}
alphatab.tablature.model.MeasureImpl.prototype.getMaxQuarterSpacing = function() {
	return this.quarterSpacing;
}
alphatab.tablature.model.MeasureImpl.prototype.getNoteAccidental = function(noteValue) {
	if(noteValue >= 0 && noteValue < 128) {
		var key = this.keySignature();
		var note = (noteValue % 12);
		var octave = Math.round(noteValue / 12);
		var accidentalValue = ((key <= 7?2:3));
		var accidentalNotes = ((key <= 7?alphatab.tablature.model.MeasureImpl.ACCIDENTAL_SHARP_NOTES:alphatab.tablature.model.MeasureImpl.ACCIDENTAL_FLAT_NOTES));
		var isAccidentalNote = alphatab.tablature.model.MeasureImpl.ACCIDENTAL_NOTES[note];
		var isAccidentalKey = alphatab.tablature.model.MeasureImpl.KEY_SIGNATURES[key][accidentalNotes[note]] == accidentalValue;
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
alphatab.tablature.model.MeasureImpl.prototype.getTimeSignatureSymbol = function(number) {
	switch(number) {
	case 1:{
		return alphatab.tablature.drawing.MusicFont.Num1;
	}break;
	case 2:{
		return alphatab.tablature.drawing.MusicFont.Num2;
	}break;
	case 3:{
		return alphatab.tablature.drawing.MusicFont.Num3;
	}break;
	case 4:{
		return alphatab.tablature.drawing.MusicFont.Num4;
	}break;
	case 5:{
		return alphatab.tablature.drawing.MusicFont.Num5;
	}break;
	case 6:{
		return alphatab.tablature.drawing.MusicFont.Num6;
	}break;
	case 7:{
		return alphatab.tablature.drawing.MusicFont.Num7;
	}break;
	case 8:{
		return alphatab.tablature.drawing.MusicFont.Num8;
	}break;
	case 9:{
		return alphatab.tablature.drawing.MusicFont.Num9;
	}break;
	}
	return null;
}
alphatab.tablature.model.MeasureImpl.prototype.headerImpl = function() {
	return this.header;
}
alphatab.tablature.model.MeasureImpl.prototype.height = function() {
	return this.ts.getSize();
}
alphatab.tablature.model.MeasureImpl.prototype.isFirstOfLine = null;
alphatab.tablature.model.MeasureImpl.prototype.isPaintClef = null;
alphatab.tablature.model.MeasureImpl.prototype.lyricBeatIndex = null;
alphatab.tablature.model.MeasureImpl.prototype.makeBeat = function(layout,beat,previousBeat,chordEnabled) {
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
alphatab.tablature.model.MeasureImpl.prototype.maxY = null;
alphatab.tablature.model.MeasureImpl.prototype.minY = null;
alphatab.tablature.model.MeasureImpl.prototype.notEmptyBeats = null;
alphatab.tablature.model.MeasureImpl.prototype.notEmptyVoices = null;
alphatab.tablature.model.MeasureImpl.prototype.paintClef = function(layout,context,fromX,fromY) {
	if(this.isPaintClef) {
		var x = fromX + Math.round(14 * layout.scale);
		var y = fromY + this.ts.get(7);
		if(this.clef == 0) {
			alphatab.tablature.drawing.ClefPainter.paintTreble(context,x,y,layout);
		}
		else if(this.clef == 1) {
			alphatab.tablature.drawing.ClefPainter.paintBass(context,x,y,layout);
		}
		else if(this.clef == 2) {
			alphatab.tablature.drawing.ClefPainter.paintTenor(context,x,y,layout);
		}
		else if(this.clef == 3) {
			alphatab.tablature.drawing.ClefPainter.paintAlto(context,x,y,layout);
		}
	}
}
alphatab.tablature.model.MeasureImpl.prototype.paintComponents = function(layout,context,fromX,fromY) {
	var _g = 0, _g1 = this.beats;
	while(_g < _g1.length) {
		var beat = _g1[_g];
		++_g;
		var impl = beat;
		impl.paint(layout,context,fromX + this.headerImpl().getLeftSpacing(layout),fromY);
	}
}
alphatab.tablature.model.MeasureImpl.prototype.paintDivisions = function(layout,context) {
	var x1 = this.posX;
	var x2 = this.posX + this.width;
	var offsetY = 0;
	var y1 = this.posY + this.ts.get(7);
	var y2 = Math.floor(y1 + (layout.scoreLineSpacing * 4));
	if(layout.isFirstMeasure(this) || this.isFirstOfLine) {
		offsetY = (this.posY + this.ts.get(20)) - y2;
	}
	this.paintDivisions2(layout,context,x1,y1,x2,y2,offsetY,true);
	y1 = this.posY + this.ts.get(20);
	y2 = Math.floor(y1 + ((this.track.strings.length - 1) * layout.stringSpacing));
	offsetY = 0;
	this.paintDivisions2(layout,context,x1,y1,x2,y2,offsetY,false);
}
alphatab.tablature.model.MeasureImpl.prototype.paintDivisions2 = function(layout,context,x1,y1,x2,y2,offsetY,addInfo) {
	var scale = layout.scale;
	var lineWidthSmall = 1;
	var lineWidthBig = Math.floor(Math.max(lineWidthSmall,Math.round(3.0 * scale)));
	var fill = context.get(3);
	var draw = context.get(4);
	if(addInfo) {
		var number = Std.string(this.number());
		context.get(13).addString(number,alphatab.tablature.drawing.DrawingResources.defaultFont,(this.posX + Math.round(scale)),((y1 - alphatab.tablature.drawing.DrawingResources.defaultFontHeight) - Math.round(scale)));
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
				fill.addString(repetitions,alphatab.tablature.drawing.DrawingResources.defaultFont,(((x2 - numberSize) + this.spacing) - size),((y1 - alphatab.tablature.drawing.DrawingResources.defaultFontHeight) - Math.round(scale)));
			}
		}
	}
	else {
		draw.startFigure();
		draw.moveTo(x2 + this.spacing,y1);
		draw.lineTo(x2 + this.spacing,y2);
	}
}
alphatab.tablature.model.MeasureImpl.prototype.paintKeySignature = function(layout,context,fromX,fromY) {
	if(this.headerImpl().shouldPaintKeySignature) {
		var scale = layout.scoreLineSpacing;
		var x = (fromX + this.getClefSpacing(layout)) + 10;
		var y = fromY + this.ts.get(7);
		var currentKey = this.keySignature();
		var previousKey = ((this._previousMeasure != null?this._previousMeasure.keySignature():0));
		var offsetClef = 0;
		switch(this.clef) {
		case 0:{
			offsetClef = 0;
		}break;
		case 1:{
			offsetClef = 2;
		}break;
		case 2:{
			offsetClef = -1;
		}break;
		case 3:{
			offsetClef = 1;
		}break;
		}
		if(previousKey >= 1 && previousKey <= 7) {
			var naturalFrom = ((currentKey >= 1 && currentKey <= 7)?currentKey:0);
			{
				var _g = naturalFrom;
				while(_g < previousKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((alphatab.tablature.model.MeasureImpl.SCORE_KEYSHARP_POSITIONS[i] + offsetClef) + 7) % 7)) - (scale / 2);
					alphatab.tablature.drawing.KeySignaturePainter.paintNatural(context,x,y + offset,layout);
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
					var offset = ((scale / 2) * (((alphatab.tablature.model.MeasureImpl.SCORE_KEYFLAT_POSITIONS[i - 7] + offsetClef) + 7) % 7)) - (scale / 2);
					alphatab.tablature.drawing.KeySignaturePainter.paintNatural(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		if(currentKey >= 1 && currentKey <= 7) {
			{
				var _g = 0;
				while(_g < currentKey) {
					var i = _g++;
					var offset = Math.floor(((scale / 2) * (((alphatab.tablature.model.MeasureImpl.SCORE_KEYSHARP_POSITIONS[i] + offsetClef) + 7) % 7)) - (scale / 2));
					alphatab.tablature.drawing.KeySignaturePainter.paintSharp(context,x,(y + offset),layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		else if(currentKey >= 8 && currentKey <= 14) {
			{
				var _g = 7;
				while(_g < currentKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((alphatab.tablature.model.MeasureImpl.SCORE_KEYFLAT_POSITIONS[i - 7] + offsetClef) + 7) % 7)) - (scale / 2);
					alphatab.tablature.drawing.KeySignaturePainter.paintFlat(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
	}
}
alphatab.tablature.model.MeasureImpl.prototype.paintMarker = function(context,layout) {
	if(this.hasMarker()) {
		var x = ((this.posX + this.headerImpl().getLeftSpacing(layout)) + this.getFirstNoteSpacing(layout));
		var y = (this.posY + this.ts.get(1));
		context.get(9).addString(this.marker().title,alphatab.tablature.drawing.DrawingResources.defaultFont,x,y);
	}
}
alphatab.tablature.model.MeasureImpl.prototype.paintMeasure = function(layout,context) {
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
alphatab.tablature.model.MeasureImpl.prototype.paintRepeatEnding = function(layout,context) {
	if(this.header.repeatAlternative > 0) {
		var scale = layout.scale;
		var x1 = ((this.posX + this.headerImpl().getLeftSpacing(layout)) + this.getFirstNoteSpacing(layout));
		var x2 = ((this.posX + this.width) + this.spacing);
		var y1 = (this.posY + this.ts.get(4));
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
		var layer = context.get(4);
		layer.startFigure();
		layer.moveTo(x1,y2);
		layer.lineTo(x1,y1);
		layer.lineTo(x2,y1);
		context.get(3).addString(sText,alphatab.tablature.drawing.DrawingResources.defaultFont,Math.round(x1 + (5.0 * scale)),Math.round(y1 + alphatab.tablature.drawing.DrawingResources.defaultFontHeight));
	}
}
alphatab.tablature.model.MeasureImpl.prototype.paintTempo = function(context,layout) {
	if(this.headerImpl().shouldPaintTempo) {
		var scale = 5.0 * layout.scale;
		var x = (this.posX + this.headerImpl().getLeftSpacing(layout));
		var y = this.posY;
		var lineSpacing = Math.floor(Math.max(layout.scoreLineSpacing,layout.stringSpacing));
		y += (this.ts.get(7) - lineSpacing);
		var imgX = x;
		var imgY = y - (Math.round(scale * 3.5) + 2);
		alphatab.tablature.drawing.TempoPainter.paintTempo(context,imgX,imgY,scale);
		var value = (" = " + this.tempo().value);
		var fontX = x + Math.floor(Math.round((1.33 * scale)) + 1);
		var fontY = Math.round((y - alphatab.tablature.drawing.DrawingResources.defaultFontHeight) - (layout.scale));
		context.get(3).addString(value,alphatab.tablature.drawing.DrawingResources.defaultFont,fontX,fontY);
	}
}
alphatab.tablature.model.MeasureImpl.prototype.paintTexts = function(layout,context) {
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
alphatab.tablature.model.MeasureImpl.prototype.paintTimeSignature = function(context,layout,fromX,fromY) {
	if(this.headerImpl().shouldPaintTimeSignature) {
		var scale = layout.scale;
		var leftSpacing = Math.round(5.0 * scale);
		var x = ((this.getClefSpacing(layout) + this.getKeySignatureSpacing(layout)) + this.headerImpl().getLeftSpacing(layout)) + leftSpacing;
		var y = fromY + this.ts.get(7);
		var y1 = 0;
		var y2 = Math.round(2 * layout.scoreLineSpacing);
		var numerator = this.timeSignature().numerator;
		var symbol = this.getTimeSignatureSymbol(numerator);
		if(symbol != null) {
			context.get(3).addMusicSymbol(symbol,fromX + x,y + y1,scale);
		}
		var denominator = this.timeSignature().denominator.value;
		symbol = this.getTimeSignatureSymbol(denominator);
		if(symbol != null) {
			context.get(3).addMusicSymbol(symbol,fromX + x,y + y2,scale);
		}
	}
}
alphatab.tablature.model.MeasureImpl.prototype.paintTripletFeel = function(context,layout) {
	if(this.headerImpl().shouldPaintTripletFeel) {
		var lineSpacing = Math.floor(Math.max(layout.scoreLineSpacing,layout.stringSpacing));
		var scale = (5.0 * layout.scale);
		var x = ((this.posX + this.headerImpl().getLeftSpacing(layout)) + this.headerImpl().getTempoSpacing(layout));
		var y = (this.posY + this.ts.get(7)) - lineSpacing;
		var y1 = y - (Math.round((3.5 * scale)));
		if(this.tripletFeel() == 0 && this._previousMeasure != null) {
			var previous = this._previousMeasure.tripletFeel();
			if(previous == 1) {
				alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone8(context,x,y1,layout.scale);
			}
			else if(previous == 2) {
				alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone16(context,x,y1,layout.scale);
			}
		}
		else if(this.tripletFeel() == 1) {
			alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel8(context,x,y1,layout.scale);
		}
		else if(this.tripletFeel() == 2) {
			alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel16(context,x,y1,layout.scale);
		}
	}
}
alphatab.tablature.model.MeasureImpl.prototype.posX = null;
alphatab.tablature.model.MeasureImpl.prototype.posY = null;
alphatab.tablature.model.MeasureImpl.prototype.quarterSpacing = null;
alphatab.tablature.model.MeasureImpl.prototype.registerSpacing = function(layout,spacing) {
	if(this.hasMarker()) {
		spacing.set(1,layout.markerSpacing);
	}
	if(this._chord) {
		spacing.set(5,layout.getDefaultChordSpacing());
	}
	if(this._text) {
		spacing.set(2,layout.textSpacing);
	}
	if(this.header.repeatAlternative > 0) {
		spacing.set(4,layout.repeatEndingSpacing);
	}
	if(this._tupleto) {
		spacing.set(9,layout.tupletoSpacing);
	}
	if(this._accentuated) {
		spacing.set(10,layout.effectSpacing);
	}
	if(this._harmonic) {
		spacing.set(11,layout.effectSpacing);
	}
	if(this._tapping) {
		spacing.set(12,layout.effectSpacing);
	}
	if(this._palmMute) {
		spacing.set(14,layout.effectSpacing);
	}
	if(this._fadeIn) {
		spacing.set(17,layout.effectSpacing);
	}
	if(this._vibrato) {
		spacing.set(16,layout.effectSpacing);
	}
	if(this._beatVibrato) {
		spacing.set(15,layout.effectSpacing);
	}
	if(this._letRing) {
		spacing.set(13,layout.effectSpacing);
	}
	if(this._bend) {
		spacing.set(18,this._bendOverFlow);
	}
	if(this._tremoloBar) {
		if(this._tremoloBarOverFlow < 0) {
			spacing.set(21,Math.round(Math.abs(this._tremoloBarOverFlow)));
		}
	}
}
alphatab.tablature.model.MeasureImpl.prototype.resetSpacing = function() {
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
alphatab.tablature.model.MeasureImpl.prototype.spacing = null;
alphatab.tablature.model.MeasureImpl.prototype.trackImpl = function() {
	return this.track;
}
alphatab.tablature.model.MeasureImpl.prototype.ts = null;
alphatab.tablature.model.MeasureImpl.prototype.update = function(layout) {
	this.updateComponents(layout);
}
alphatab.tablature.model.MeasureImpl.prototype.updateComponents = function(layout) {
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
						if(!this._tupleto && voice.duration.tuplet != new alphatab.model.Tuplet()) {
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
alphatab.tablature.model.MeasureImpl.prototype.width = null;
alphatab.tablature.model.MeasureImpl.prototype.__class__ = alphatab.tablature.model.MeasureImpl;
alphatab.model.Color = function(r,g,b) { if( r === $_ ) return; {
	if(b == null) b = 0;
	if(g == null) g = 0;
	if(r == null) r = 0;
	this.r = r;
	this.g = g;
	this.b = b;
}}
alphatab.model.Color.__name__ = ["alphatab","model","Color"];
alphatab.model.Color.prototype.b = null;
alphatab.model.Color.prototype.g = null;
alphatab.model.Color.prototype.r = null;
alphatab.model.Color.prototype.toString = function() {
	var s = "rgb(";
	s += Std.string(this.r) + ",";
	s += Std.string(this.g) + ",";
	s += Std.string(this.b) + ")";
	return s;
}
alphatab.model.Color.prototype.__class__ = alphatab.model.Color;
alphatab.model.BeatStrokeDirection = function() { }
alphatab.model.BeatStrokeDirection.__name__ = ["alphatab","model","BeatStrokeDirection"];
alphatab.model.BeatStrokeDirection.prototype.__class__ = alphatab.model.BeatStrokeDirection;
alphatab.platform.BinaryReader = function(p) { if( p === $_ ) return; {
	null;
}}
alphatab.platform.BinaryReader.__name__ = ["alphatab","platform","BinaryReader"];
alphatab.platform.BinaryReader.prototype._buffer = null;
alphatab.platform.BinaryReader.prototype._pos = null;
alphatab.platform.BinaryReader.prototype.decodeFloat = function(precisionBits,exponentBits) {
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
alphatab.platform.BinaryReader.prototype.decodeInt = function(bits,signed) {
	var x = this.readBits(0,bits,Math.floor(bits / 8));
	var max = Math.floor(Math.pow(2,bits));
	var result = ((signed && x >= max / 2)?x - max:x);
	this._pos += Math.floor(bits / 8);
	return result;
}
alphatab.platform.BinaryReader.prototype.getByte = function(index) {
	var data = this._buffer.charCodeAt(index);
	data = (data & 255);
	return data;
}
alphatab.platform.BinaryReader.prototype.getPosition = function() {
	return this._pos;
}
alphatab.platform.BinaryReader.prototype.getSize = function() {
	return this._buffer.length;
}
alphatab.platform.BinaryReader.prototype.initialize = function(data) {
	this._buffer = data;
	this._pos = 0;
}
alphatab.platform.BinaryReader.prototype.readBits = function(start,length,size) {
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
alphatab.platform.BinaryReader.prototype.readBool = function() {
	return this.readByte() == 1;
}
alphatab.platform.BinaryReader.prototype.readByte = function() {
	var data = this.getByte(this._pos);
	this._pos++;
	return data;
}
alphatab.platform.BinaryReader.prototype.readByteForBits = function(i,size) {
	return this._buffer.charCodeAt(((this._pos + size) - i) - 1) & 255;
}
alphatab.platform.BinaryReader.prototype.readDouble = function() {
	return this.decodeFloat(52,11);
}
alphatab.platform.BinaryReader.prototype.readInt32 = function() {
	return this.decodeInt(32,true);
}
alphatab.platform.BinaryReader.prototype.seek = function(pos) {
	this._pos = pos;
}
alphatab.platform.BinaryReader.prototype.shl = function(a,b) {
	{
		var _g = 0;
		while(_g < b) {
			var i = _g++;
			a = this.shl1(a);
		}
	}
	return a;
}
alphatab.platform.BinaryReader.prototype.shl1 = function(a) {
	a = a % -2147483648;
	if((a & 1073741824) == 1073741824) {
		a -= 1073741824;
		a *= 2;
		a += -2147483648;
	}
	else a *= 2;
	return a;
}
alphatab.platform.BinaryReader.prototype.__class__ = alphatab.platform.BinaryReader;
alphatab.model.MixTableChange = function(p) { if( p === $_ ) return; {
	this.volume = new alphatab.model.MixTableItem();
	this.balance = new alphatab.model.MixTableItem();
	this.chorus = new alphatab.model.MixTableItem();
	this.reverb = new alphatab.model.MixTableItem();
	this.phaser = new alphatab.model.MixTableItem();
	this.tremolo = new alphatab.model.MixTableItem();
	this.instrument = new alphatab.model.MixTableItem();
	this.tempo = new alphatab.model.MixTableItem();
	this.hideTempo = true;
}}
alphatab.model.MixTableChange.__name__ = ["alphatab","model","MixTableChange"];
alphatab.model.MixTableChange.prototype.balance = null;
alphatab.model.MixTableChange.prototype.chorus = null;
alphatab.model.MixTableChange.prototype.hideTempo = null;
alphatab.model.MixTableChange.prototype.instrument = null;
alphatab.model.MixTableChange.prototype.phaser = null;
alphatab.model.MixTableChange.prototype.reverb = null;
alphatab.model.MixTableChange.prototype.tempo = null;
alphatab.model.MixTableChange.prototype.tempoName = null;
alphatab.model.MixTableChange.prototype.tremolo = null;
alphatab.model.MixTableChange.prototype.volume = null;
alphatab.model.MixTableChange.prototype.__class__ = alphatab.model.MixTableChange;
alphatab.model.MeasureClef = function() { }
alphatab.model.MeasureClef.__name__ = ["alphatab","model","MeasureClef"];
alphatab.model.MeasureClef.prototype.__class__ = alphatab.model.MeasureClef;
alphatab.model.effects.TremoloBarEffect = function(p) { if( p === $_ ) return; {
	this.points = new Array();
}}
alphatab.model.effects.TremoloBarEffect.__name__ = ["alphatab","model","effects","TremoloBarEffect"];
alphatab.model.effects.TremoloBarEffect.prototype.clone = function(factory) {
	var effect = factory.newTremoloBarEffect();
	effect.type = this.type;
	effect.value = this.value;
	{
		var _g1 = 0, _g = this.points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.points[i];
			effect.points.push(new alphatab.model.effects.BendPoint(point.position,point.value,point.vibrato));
		}
	}
	return effect;
}
alphatab.model.effects.TremoloBarEffect.prototype.points = null;
alphatab.model.effects.TremoloBarEffect.prototype.type = null;
alphatab.model.effects.TremoloBarEffect.prototype.value = null;
alphatab.model.effects.TremoloBarEffect.prototype.__class__ = alphatab.model.effects.TremoloBarEffect;
alphatab.model.LyricLine = function(startingMeasure,lyrics) { if( startingMeasure === $_ ) return; {
	if(lyrics == null) lyrics = "";
	if(startingMeasure == null) startingMeasure = 0;
	this.startingMeasure = startingMeasure;
	this.lyrics = lyrics;
}}
alphatab.model.LyricLine.__name__ = ["alphatab","model","LyricLine"];
alphatab.model.LyricLine.prototype.lyrics = null;
alphatab.model.LyricLine.prototype.startingMeasure = null;
alphatab.model.LyricLine.prototype.__class__ = alphatab.model.LyricLine;
alphatab.model.BeatText = function(p) { if( p === $_ ) return; {
	null;
}}
alphatab.model.BeatText.__name__ = ["alphatab","model","BeatText"];
alphatab.model.BeatText.prototype.beat = null;
alphatab.model.BeatText.prototype.value = null;
alphatab.model.BeatText.prototype.__class__ = alphatab.model.BeatText;
alphatab.tablature.model.BeatTextImpl = function(p) { if( p === $_ ) return; {
	alphatab.model.BeatText.apply(this,[]);
}}
alphatab.tablature.model.BeatTextImpl.__name__ = ["alphatab","tablature","model","BeatTextImpl"];
alphatab.tablature.model.BeatTextImpl.__super__ = alphatab.model.BeatText;
for(var k in alphatab.model.BeatText.prototype ) alphatab.tablature.model.BeatTextImpl.prototype[k] = alphatab.model.BeatText.prototype[k];
alphatab.tablature.model.BeatTextImpl.prototype.paint = function(layout,context,x,y) {
	var beat = this.beat;
	var measure = beat.measureImpl();
	var realX = (x + beat.spacing()) + beat.posX;
	var realY = y + measure.ts.get(2);
	context.get(9).addString(this.value,alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
}
alphatab.tablature.model.BeatTextImpl.prototype.__class__ = alphatab.tablature.model.BeatTextImpl;
alphatab.model.SlideType = function() { }
alphatab.model.SlideType.__name__ = ["alphatab","model","SlideType"];
alphatab.model.SlideType.prototype.__class__ = alphatab.model.SlideType;
alphatab.platform.js.Html5Canvas = function(dom) { if( dom === $_ ) return; {
	this._canvas = dom;
	this._jCanvas = (jQuery(dom));
	this._context = dom.getContext("2d");
}}
alphatab.platform.js.Html5Canvas.__name__ = ["alphatab","platform","js","Html5Canvas"];
alphatab.platform.js.Html5Canvas.prototype._canvas = null;
alphatab.platform.js.Html5Canvas.prototype._context = null;
alphatab.platform.js.Html5Canvas.prototype._jCanvas = null;
alphatab.platform.js.Html5Canvas.prototype.beginPath = function() {
	this._context.beginPath();
}
alphatab.platform.js.Html5Canvas.prototype.bezierCurveTo = function(cp1x,cp1y,cp2x,cp2y,x,y) {
	this._context.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);
}
alphatab.platform.js.Html5Canvas.prototype.circle = function(x,y,radius) {
	this._context.arc(x,y,radius,0,Math.PI * 2,true);
}
alphatab.platform.js.Html5Canvas.prototype.clear = function() {
	this._context.clearRect(0,0,this.width(),this.height());
}
alphatab.platform.js.Html5Canvas.prototype.closePath = function() {
	this._context.closePath();
}
alphatab.platform.js.Html5Canvas.prototype.fill = function() {
	this._context.fill();
}
alphatab.platform.js.Html5Canvas.prototype.fillRect = function(x,y,w,h) {
	this._context.fillRect(x,y,w,h);
}
alphatab.platform.js.Html5Canvas.prototype.fillStyle = null;
alphatab.platform.js.Html5Canvas.prototype.fillText = function(text,x,y,maxWidth) {
	if(maxWidth == null) maxWidth = 0;
	if(maxWidth == 0) {
		this._context.fillText(text,x,y);
	}
	else {
		this._context.fillText(text,x,y,maxWidth);
	}
}
alphatab.platform.js.Html5Canvas.prototype.font = null;
alphatab.platform.js.Html5Canvas.prototype.getFillStyle = function() {
	return this._context.fillStyle;
}
alphatab.platform.js.Html5Canvas.prototype.getFont = function() {
	return this._context.font;
}
alphatab.platform.js.Html5Canvas.prototype.getLineWidth = function() {
	return this._context.lineWidth;
}
alphatab.platform.js.Html5Canvas.prototype.getStrokeStyle = function() {
	return this._context.strokeStyle;
}
alphatab.platform.js.Html5Canvas.prototype.getTextBaseline = function() {
	return this._context.textBaseline;
}
alphatab.platform.js.Html5Canvas.prototype.height = function() {
	return this._jCanvas.height();
}
alphatab.platform.js.Html5Canvas.prototype.lineTo = function(x,y) {
	this._context.lineTo(x,y);
}
alphatab.platform.js.Html5Canvas.prototype.lineWidth = null;
alphatab.platform.js.Html5Canvas.prototype.measureText = function(text) {
	return this._context.measureText(text).width;
}
alphatab.platform.js.Html5Canvas.prototype.moveTo = function(x,y) {
	this._context.moveTo(x,y);
}
alphatab.platform.js.Html5Canvas.prototype.quadraticCurveTo = function(cpx,cpy,x,y) {
	this._context.quadraticCurveTo(cpx,cpy,x,y);
}
alphatab.platform.js.Html5Canvas.prototype.rect = function(x,y,w,h) {
	this._context.rect(x,y,w,h);
}
alphatab.platform.js.Html5Canvas.prototype.setFillStyle = function(value) {
	this._context.fillStyle = value;
	return this._context.fillStyle;
}
alphatab.platform.js.Html5Canvas.prototype.setFont = function(value) {
	this._context.font = value;
	return this._context.font;
}
alphatab.platform.js.Html5Canvas.prototype.setHeight = function(height) {
	this._jCanvas.height(height);
	this._canvas.height = height;
	this._context = this._canvas.getContext("2d");
}
alphatab.platform.js.Html5Canvas.prototype.setLineWidth = function(value) {
	this._context.lineWidth = value;
	return this._context.lineWidth;
}
alphatab.platform.js.Html5Canvas.prototype.setStrokeStyle = function(value) {
	this._context.strokeStyle = value;
	return this._context.strokeStyle;
}
alphatab.platform.js.Html5Canvas.prototype.setTextBaseline = function(value) {
	this._context.textBaseline = value;
	return this._context.textBaseLine;
}
alphatab.platform.js.Html5Canvas.prototype.setWidth = function(width) {
	this._jCanvas.width(width);
	this._canvas.width = width;
	this._context = this._canvas.getContext("2d");
}
alphatab.platform.js.Html5Canvas.prototype.stroke = function() {
	this._context.stroke();
}
alphatab.platform.js.Html5Canvas.prototype.strokeRect = function(x,y,w,h) {
	this._context.strokeRect(x,y,w,h);
}
alphatab.platform.js.Html5Canvas.prototype.strokeStyle = null;
alphatab.platform.js.Html5Canvas.prototype.strokeText = function(text,x,y,maxWidth) {
	if(maxWidth == null) maxWidth = 0;
	if(maxWidth == 0) {
		this._context.strokeText(text,x,y);
	}
	else {
		this._context.strokeText(text,x,y,maxWidth);
	}
}
alphatab.platform.js.Html5Canvas.prototype.textBaseline = null;
alphatab.platform.js.Html5Canvas.prototype.width = function() {
	return this._jCanvas.width();
}
alphatab.platform.js.Html5Canvas.prototype.__class__ = alphatab.platform.js.Html5Canvas;
alphatab.platform.js.Html5Canvas.__interfaces__ = [alphatab.platform.Canvas];
alphatab.model.PageSetup = function(p) { if( p === $_ ) return; {
	null;
}}
alphatab.model.PageSetup.__name__ = ["alphatab","model","PageSetup"];
alphatab.model.PageSetup.defaults = function() {
	if(alphatab.model.PageSetup._defaults == null) {
		alphatab.model.PageSetup._defaults = new alphatab.model.PageSetup();
		alphatab.model.PageSetup._defaults.pageSize = new alphatab.model.Point(210,297);
		alphatab.model.PageSetup._defaults.pageMargin = new alphatab.model.Rectangle(10,15,10,10);
		alphatab.model.PageSetup._defaults.scoreSizeProportion = 1;
		alphatab.model.PageSetup._defaults.headerAndFooter = 511;
		alphatab.model.PageSetup._defaults.title = "%TITLE%";
		alphatab.model.PageSetup._defaults.subtitle = "%SUBTITLE%";
		alphatab.model.PageSetup._defaults.artist = "%ARTIST%";
		alphatab.model.PageSetup._defaults.album = "%ALBUM%";
		alphatab.model.PageSetup._defaults.words = "Words by %WORDS%";
		alphatab.model.PageSetup._defaults.music = "Music by %MUSIC%";
		alphatab.model.PageSetup._defaults.wordsAndMusic = "Words & Music by %WORDSMUSIC%";
		alphatab.model.PageSetup._defaults.copyright = "Copyright %COPYRIGHT%\n" + "All Rights Reserved - International Copyright Secured";
		alphatab.model.PageSetup._defaults.pageNumber = "Page %N%/%P%";
	}
	return alphatab.model.PageSetup._defaults;
}
alphatab.model.PageSetup.prototype.album = null;
alphatab.model.PageSetup.prototype.artist = null;
alphatab.model.PageSetup.prototype.copyright = null;
alphatab.model.PageSetup.prototype.headerAndFooter = null;
alphatab.model.PageSetup.prototype.music = null;
alphatab.model.PageSetup.prototype.pageMargin = null;
alphatab.model.PageSetup.prototype.pageNumber = null;
alphatab.model.PageSetup.prototype.pageSize = null;
alphatab.model.PageSetup.prototype.scoreSizeProportion = null;
alphatab.model.PageSetup.prototype.subtitle = null;
alphatab.model.PageSetup.prototype.title = null;
alphatab.model.PageSetup.prototype.words = null;
alphatab.model.PageSetup.prototype.wordsAndMusic = null;
alphatab.model.PageSetup.prototype.__class__ = alphatab.model.PageSetup;
alphatab.tablature.drawing.SilencePainter = function() { }
alphatab.tablature.drawing.SilencePainter.__name__ = ["alphatab","tablature","drawing","SilencePainter"];
alphatab.tablature.drawing.SilencePainter.paintEighth = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceEighth,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintWhole = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintHalf = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale - (4 * layout.scale);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintQuarter = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale * 0.5;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceQuarter,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintSixteenth = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	y += scale;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceSixteenth,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintSixtyFourth = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceSixtyFourth,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintThirtySecond = function(layer,x,y,layout) {
	var scale = layout.scoreLineSpacing;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceThirtySecond,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.prototype.__class__ = alphatab.tablature.drawing.SilencePainter;
alphatab.model.Padding = function(right,top,left,bottom) { if( right === $_ ) return; {
	this.right = right;
	this.top = top;
	this.left = left;
	this.bottom = bottom;
}}
alphatab.model.Padding.__name__ = ["alphatab","model","Padding"];
alphatab.model.Padding.prototype.bottom = null;
alphatab.model.Padding.prototype.getHorizontal = function() {
	return this.left + this.right;
}
alphatab.model.Padding.prototype.getVertical = function() {
	return this.top + this.bottom;
}
alphatab.model.Padding.prototype.left = null;
alphatab.model.Padding.prototype.right = null;
alphatab.model.Padding.prototype.top = null;
alphatab.model.Padding.prototype.__class__ = alphatab.model.Padding;
alphatab.model.TimeSignature = function(factory) { if( factory === $_ ) return; {
	this.numerator = 4;
	this.denominator = factory.newDuration();
}}
alphatab.model.TimeSignature.__name__ = ["alphatab","model","TimeSignature"];
alphatab.model.TimeSignature.prototype.copy = function(timeSignature) {
	timeSignature.numerator = this.numerator;
	this.denominator.copy(timeSignature.denominator);
}
alphatab.model.TimeSignature.prototype.denominator = null;
alphatab.model.TimeSignature.prototype.numerator = null;
alphatab.model.TimeSignature.prototype.__class__ = alphatab.model.TimeSignature;
alphatab.model.SongFactory = function(p) { if( p === $_ ) return; {
	null;
}}
alphatab.model.SongFactory.__name__ = ["alphatab","model","SongFactory"];
alphatab.model.SongFactory.prototype.newBeat = function() {
	return new alphatab.model.Beat(this);
}
alphatab.model.SongFactory.prototype.newBeatEffect = function() {
	return new alphatab.model.BeatEffect(this);
}
alphatab.model.SongFactory.prototype.newBendEffect = function() {
	return new alphatab.model.effects.BendEffect();
}
alphatab.model.SongFactory.prototype.newChord = function(stringCount) {
	return new alphatab.model.Chord(stringCount);
}
alphatab.model.SongFactory.prototype.newDuration = function() {
	return new alphatab.model.Duration(this);
}
alphatab.model.SongFactory.prototype.newGraceEffect = function() {
	return new alphatab.model.effects.GraceEffect();
}
alphatab.model.SongFactory.prototype.newHarmonicEffect = function() {
	return new alphatab.model.effects.HarmonicEffect();
}
alphatab.model.SongFactory.prototype.newLyricLine = function() {
	return new alphatab.model.LyricLine();
}
alphatab.model.SongFactory.prototype.newLyrics = function() {
	return new alphatab.model.Lyrics();
}
alphatab.model.SongFactory.prototype.newMarker = function() {
	return new alphatab.model.Marker();
}
alphatab.model.SongFactory.prototype.newMeasure = function(header) {
	return new alphatab.model.Measure(header);
}
alphatab.model.SongFactory.prototype.newMeasureHeader = function() {
	return new alphatab.model.MeasureHeader(this);
}
alphatab.model.SongFactory.prototype.newMidiChannel = function() {
	return new alphatab.model.MidiChannel();
}
alphatab.model.SongFactory.prototype.newMixTableChange = function() {
	return new alphatab.model.MixTableChange();
}
alphatab.model.SongFactory.prototype.newNote = function() {
	return new alphatab.model.Note(this);
}
alphatab.model.SongFactory.prototype.newNoteEffect = function() {
	return new alphatab.model.NoteEffect();
}
alphatab.model.SongFactory.prototype.newPageSetup = function() {
	return new alphatab.model.PageSetup();
}
alphatab.model.SongFactory.prototype.newSong = function() {
	return new alphatab.model.Song();
}
alphatab.model.SongFactory.prototype.newString = function() {
	return new alphatab.model.GuitarString();
}
alphatab.model.SongFactory.prototype.newStroke = function() {
	return new alphatab.model.BeatStroke();
}
alphatab.model.SongFactory.prototype.newTempo = function() {
	return new alphatab.model.Tempo();
}
alphatab.model.SongFactory.prototype.newText = function() {
	return new alphatab.model.BeatText();
}
alphatab.model.SongFactory.prototype.newTimeSignature = function() {
	return new alphatab.model.TimeSignature(this);
}
alphatab.model.SongFactory.prototype.newTrack = function() {
	return new alphatab.model.Track(this);
}
alphatab.model.SongFactory.prototype.newTremoloBarEffect = function() {
	return new alphatab.model.effects.TremoloBarEffect();
}
alphatab.model.SongFactory.prototype.newTremoloPickingEffect = function() {
	return new alphatab.model.effects.TremoloPickingEffect(this);
}
alphatab.model.SongFactory.prototype.newTrillEffect = function() {
	return new alphatab.model.effects.TrillEffect(this);
}
alphatab.model.SongFactory.prototype.newTuplet = function() {
	return new alphatab.model.Tuplet();
}
alphatab.model.SongFactory.prototype.newVoice = function(index) {
	return new alphatab.model.Voice(this,index);
}
alphatab.model.SongFactory.prototype.__class__ = alphatab.model.SongFactory;
alphatab.tablature.model.SongFactoryImpl = function(p) { if( p === $_ ) return; {
	alphatab.model.SongFactory.apply(this,[]);
}}
alphatab.tablature.model.SongFactoryImpl.__name__ = ["alphatab","tablature","model","SongFactoryImpl"];
alphatab.tablature.model.SongFactoryImpl.__super__ = alphatab.model.SongFactory;
for(var k in alphatab.model.SongFactory.prototype ) alphatab.tablature.model.SongFactoryImpl.prototype[k] = alphatab.model.SongFactory.prototype[k];
alphatab.tablature.model.SongFactoryImpl.prototype.newBeat = function() {
	return new alphatab.tablature.model.BeatImpl(this);
}
alphatab.tablature.model.SongFactoryImpl.prototype.newChord = function(length) {
	return new alphatab.tablature.model.ChordImpl(length);
}
alphatab.tablature.model.SongFactoryImpl.prototype.newLyrics = function() {
	return new alphatab.tablature.model.LyricsImpl();
}
alphatab.tablature.model.SongFactoryImpl.prototype.newMeasure = function(header) {
	return new alphatab.tablature.model.MeasureImpl(header);
}
alphatab.tablature.model.SongFactoryImpl.prototype.newMeasureHeader = function() {
	return new alphatab.tablature.model.MeasureHeaderImpl(this);
}
alphatab.tablature.model.SongFactoryImpl.prototype.newNote = function() {
	return new alphatab.tablature.model.NoteImpl(this);
}
alphatab.tablature.model.SongFactoryImpl.prototype.newText = function() {
	return new alphatab.tablature.model.BeatTextImpl();
}
alphatab.tablature.model.SongFactoryImpl.prototype.newTrack = function() {
	return new alphatab.tablature.model.TrackImpl(this);
}
alphatab.tablature.model.SongFactoryImpl.prototype.newVoice = function(index) {
	return new alphatab.tablature.model.VoiceImpl(this,index);
}
alphatab.tablature.model.SongFactoryImpl.prototype.__class__ = alphatab.tablature.model.SongFactoryImpl;
alphatab.tablature.drawing.ClefPainter = function() { }
alphatab.tablature.drawing.ClefPainter.__name__ = ["alphatab","tablature","drawing","ClefPainter"];
alphatab.tablature.drawing.ClefPainter.paintAlto = function(context,x,y,layout) {
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.AltoClef,x,y,layout.scale);
}
alphatab.tablature.drawing.ClefPainter.paintBass = function(context,x,y,layout) {
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.BassClef,x,y,layout.scale);
}
alphatab.tablature.drawing.ClefPainter.paintTenor = function(context,x,y,layout) {
	y -= Math.round(layout.scoreLineSpacing);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.TenorClef,x,y,layout.scale);
}
alphatab.tablature.drawing.ClefPainter.paintTreble = function(context,x,y,layout) {
	y -= Math.round(layout.scoreLineSpacing);
	var layer = context.get(3);
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.TrebleClef,x,y,layout.scale);
}
alphatab.tablature.drawing.ClefPainter.prototype.__class__ = alphatab.tablature.drawing.ClefPainter;
alphatab.platform.PlatformFactory = function() { }
alphatab.platform.PlatformFactory.__name__ = ["alphatab","platform","PlatformFactory"];
alphatab.platform.PlatformFactory.getCanvas = function(object) {
	return new alphatab.platform.js.Html5Canvas(object);
}
alphatab.platform.PlatformFactory.getLoader = function() {
	return new alphatab.platform.js.JsFileLoader();
}
alphatab.platform.PlatformFactory.prototype.__class__ = alphatab.platform.PlatformFactory;
alphatab.tablature.ViewLayout = function(p) { if( p === $_ ) return; {
	this.init(1);
	this.contentPadding = new alphatab.model.Padding(0,0,0,0);
}}
alphatab.tablature.ViewLayout.__name__ = ["alphatab","tablature","ViewLayout"];
alphatab.tablature.ViewLayout.prototype._cache = null;
alphatab.tablature.ViewLayout.prototype.checkDefaultSpacing = function(ts) {
	var bufferSeparator = ts.get(6) - ts.get(3);
	if(bufferSeparator < this.minBufferSeparator) {
		ts.set(3,Math.round(this.minBufferSeparator - bufferSeparator));
	}
	var checkPosition = ts.get(7);
	if(checkPosition >= 0 && checkPosition < this.minTopSpacing) {
		ts.set(0,Math.round(this.minTopSpacing - checkPosition));
	}
}
alphatab.tablature.ViewLayout.prototype.chordFretIndexSpacing = null;
alphatab.tablature.ViewLayout.prototype.chordFretSpacing = null;
alphatab.tablature.ViewLayout.prototype.chordNoteSize = null;
alphatab.tablature.ViewLayout.prototype.chordStringSpacing = null;
alphatab.tablature.ViewLayout.prototype.contentPadding = null;
alphatab.tablature.ViewLayout.prototype.effectSpacing = null;
alphatab.tablature.ViewLayout.prototype.firstMeasureSpacing = null;
alphatab.tablature.ViewLayout.prototype.firstTrackSpacing = null;
alphatab.tablature.ViewLayout.prototype.fontScale = null;
alphatab.tablature.ViewLayout.prototype.getDefaultChordSpacing = function() {
	var spacing = 0;
	spacing += (6 * this.chordFretSpacing) + this.chordFretSpacing;
	spacing += Math.round(15.0 * this.scale);
	return Math.round(spacing);
}
alphatab.tablature.ViewLayout.prototype.getMinSpacing = function(duration) {
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
alphatab.tablature.ViewLayout.prototype.getNoteOrientation = function(x,y,note) {
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
alphatab.tablature.ViewLayout.prototype.getOrientation = function(x,y,str) {
	this.tablature.canvas.setFont(alphatab.tablature.drawing.DrawingResources.noteFont);
	var size = this.tablature.canvas.measureText(str);
	return new alphatab.model.Rectangle(x,y,size,alphatab.tablature.drawing.DrawingResources.noteFontHeight);
}
alphatab.tablature.ViewLayout.prototype.getSpacingForQuarter = function(duration) {
	return (960 / duration.time()) * this.getMinSpacing(duration);
}
alphatab.tablature.ViewLayout.prototype.getVoiceWidth = function(voice) {
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
alphatab.tablature.ViewLayout.prototype.height = null;
alphatab.tablature.ViewLayout.prototype.init = function(scale) {
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
alphatab.tablature.ViewLayout.prototype.isFirstMeasure = function(measure) {
	return measure.number() == 1;
}
alphatab.tablature.ViewLayout.prototype.isLastMeasure = function(measure) {
	return measure.number() == this.tablature.track.song.measureHeaders.length;
}
alphatab.tablature.ViewLayout.prototype.layoutSize = null;
alphatab.tablature.ViewLayout.prototype.markerSpacing = null;
alphatab.tablature.ViewLayout.prototype.minBufferSeparator = null;
alphatab.tablature.ViewLayout.prototype.minScoreTabSpacing = null;
alphatab.tablature.ViewLayout.prototype.minTopSpacing = null;
alphatab.tablature.ViewLayout.prototype.paintCache = function(graphics,area,fromX,fromY) {
	if(this._cache == null) {
		this.updateCache(graphics,area,fromX,fromY);
		return;
	}
	this._cache.draw();
}
alphatab.tablature.ViewLayout.prototype.paintLines = function(track,ts,context,x,y,width) {
	if(width > 0) {
		var tempX = Math.max(0,x);
		var tempY = y;
		var posY = tempY + ts.get(7);
		{
			var _g = 1;
			while(_g < 6) {
				var i = _g++;
				context.get(2).startFigure();
				context.get(2).addLine(Math.round(tempX),Math.round(posY),Math.round(tempX + width),Math.round(posY));
				posY += (this.scoreLineSpacing);
			}
		}
		tempY += ts.get(20);
		{
			var _g1 = 0, _g = track.stringCount();
			while(_g1 < _g) {
				var i = _g1++;
				context.get(2).startFigure();
				context.get(2).addLine(Math.round(tempX),Math.round(tempY),Math.round(tempX + width),Math.round(tempY));
				tempY += this.stringSpacing;
			}
		}
	}
}
alphatab.tablature.ViewLayout.prototype.paintSong = function(ctx,clientArea,x,y) {
	null;
}
alphatab.tablature.ViewLayout.prototype.prepareLayout = function(clientArea,x,y) {
	null;
}
alphatab.tablature.ViewLayout.prototype.repeatEndingSpacing = null;
alphatab.tablature.ViewLayout.prototype.scale = null;
alphatab.tablature.ViewLayout.prototype.scoreLineSpacing = null;
alphatab.tablature.ViewLayout.prototype.scoreSpacing = null;
alphatab.tablature.ViewLayout.prototype.setTablature = function(tablature) {
	this.tablature = tablature;
}
alphatab.tablature.ViewLayout.prototype.songManager = function() {
	return this.tablature.songManager;
}
alphatab.tablature.ViewLayout.prototype.stringSpacing = null;
alphatab.tablature.ViewLayout.prototype.tablature = null;
alphatab.tablature.ViewLayout.prototype.textSpacing = null;
alphatab.tablature.ViewLayout.prototype.trackSpacing = null;
alphatab.tablature.ViewLayout.prototype.tupletoSpacing = null;
alphatab.tablature.ViewLayout.prototype.updateCache = function(graphics,area,fromX,fromY) {
	this._cache = new alphatab.tablature.drawing.DrawingContext(this.scale);
	this._cache.graphics = graphics;
	this.paintSong(this._cache,area,fromX,fromY);
	this.paintCache(graphics,area,fromX,fromY);
}
alphatab.tablature.ViewLayout.prototype.updateSong = function() {
	if(this.tablature.track == null) return;
	this.updateTracks();
}
alphatab.tablature.ViewLayout.prototype.updateTracks = function() {
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
alphatab.tablature.ViewLayout.prototype.width = null;
alphatab.tablature.ViewLayout.prototype.__class__ = alphatab.tablature.ViewLayout;
alphatab.tablature.PageViewLayout = function(p) { if( p === $_ ) return; {
	alphatab.tablature.ViewLayout.apply(this,[]);
	this._lines = new Array();
	this._maximumWidth = 0;
	this.contentPadding = alphatab.tablature.PageViewLayout.PAGE_PADDING;
}}
alphatab.tablature.PageViewLayout.__name__ = ["alphatab","tablature","PageViewLayout"];
alphatab.tablature.PageViewLayout.__super__ = alphatab.tablature.ViewLayout;
for(var k in alphatab.tablature.ViewLayout.prototype ) alphatab.tablature.PageViewLayout.prototype[k] = alphatab.tablature.ViewLayout.prototype[k];
alphatab.tablature.PageViewLayout.prototype.GetTempLines = function(track,fromIndex,trackSpacing) {
	var line = new alphatab.tablature.TempLine();
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
alphatab.tablature.PageViewLayout.prototype.LayoutSongInfo = function(x,y) {
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
alphatab.tablature.PageViewLayout.prototype.PaintLine = function(track,line,beatCount,context) {
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
alphatab.tablature.PageViewLayout.prototype.ParsePageSetupString = function(input) {
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
alphatab.tablature.PageViewLayout.prototype._lines = null;
alphatab.tablature.PageViewLayout.prototype._maximumWidth = null;
alphatab.tablature.PageViewLayout.prototype.getMaxWidth = function() {
	if(this._maximumWidth <= 0) {
		this._maximumWidth = this.tablature.canvas.width();
	}
	return this._maximumWidth - this.contentPadding.getHorizontal();
}
alphatab.tablature.PageViewLayout.prototype.getSheetWidth = function() {
	return Math.round(795 * this.scale);
}
alphatab.tablature.PageViewLayout.prototype.init = function(scale) {
	alphatab.tablature.ViewLayout.prototype.init.apply(this,[scale]);
	this.layoutSize = new alphatab.model.Point(this.getSheetWidth() - alphatab.tablature.PageViewLayout.PAGE_PADDING.getHorizontal(),this.height);
}
alphatab.tablature.PageViewLayout.prototype.measureLine = function(track,line,x,y,spacing) {
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
alphatab.tablature.PageViewLayout.prototype.paintSong = function(ctx,clientArea,x,y) {
	var track = this.tablature.track;
	y = Math.round(y + this.contentPadding.top);
	y = Math.round(this.paintSongInfo(ctx,clientArea,x,y) + this.firstMeasureSpacing);
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
alphatab.tablature.PageViewLayout.prototype.paintSongInfo = function(ctx,clientArea,x,y) {
	var song = this.tablature.track.song;
	x += this.contentPadding.left;
	var tX;
	var size;
	var str = "";
	if(song.title != "" && ((song.pageSetup.headerAndFooter & 1) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.title);
		ctx.graphics.setFont(alphatab.tablature.drawing.DrawingResources.titleFont);
		size = ctx.graphics.measureText(str);
		tX = (clientArea.width - size) / 2;
		ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.titleFont,tX,y,"top");
		y += Math.floor(35 * this.scale);
	}
	if(song.subtitle != "" && ((song.pageSetup.headerAndFooter & 2) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.subtitle);
		ctx.graphics.setFont(alphatab.tablature.drawing.DrawingResources.subtitleFont);
		size = ctx.graphics.measureText(str);
		tX = (clientArea.width - size) / 2;
		ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y,"top");
		y += Math.floor(20 * this.scale);
	}
	if(song.artist != "" && ((song.pageSetup.headerAndFooter & 4) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.artist);
		ctx.graphics.setFont(alphatab.tablature.drawing.DrawingResources.subtitleFont);
		size = ctx.graphics.measureText(str);
		tX = (clientArea.width - size) / 2;
		ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y,"top");
		y += Math.floor(20 * this.scale);
	}
	if(song.album != "" && ((song.pageSetup.headerAndFooter & 8) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.album);
		ctx.graphics.setFont(alphatab.tablature.drawing.DrawingResources.subtitleFont);
		size = ctx.graphics.measureText(str);
		tX = (clientArea.width - size) / 2;
		ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y,"top");
		y += Math.floor(20 * this.scale);
	}
	if(song.music != "" && song.music == song.words && ((song.pageSetup.headerAndFooter & 64) != 0)) {
		str = this.ParsePageSetupString(song.pageSetup.wordsAndMusic);
		ctx.graphics.setFont(alphatab.tablature.drawing.DrawingResources.wordsFont);
		size = ctx.graphics.measureText(str);
		tX = ((clientArea.width - size) - this.contentPadding.right);
		ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.wordsFont,x,y,"top");
		y += Math.floor(20 * this.scale);
	}
	else {
		if(song.music != "" && ((song.pageSetup.headerAndFooter & 32) != 0)) {
			str = this.ParsePageSetupString(song.pageSetup.music);
			ctx.graphics.setFont(alphatab.tablature.drawing.DrawingResources.wordsFont);
			size = ctx.graphics.measureText(str);
			tX = ((clientArea.width - size) - this.contentPadding.right);
			ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.wordsFont,tX,y,"top");
		}
		if(song.words != "" && ((song.pageSetup.headerAndFooter & 16) != 0)) {
			str = this.ParsePageSetupString(song.pageSetup.words);
			ctx.graphics.setFont(alphatab.tablature.drawing.DrawingResources.wordsFont);
			ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.wordsFont,x,y,"top");
		}
		y += Math.floor(20 * this.scale);
	}
	return y;
}
alphatab.tablature.PageViewLayout.prototype.prepareLayout = function(clientArea,x,y) {
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
		var spacing = new alphatab.tablature.TrackSpacing();
		spacing.set(7,Math.round(this.scoreLineSpacing * 5));
		var line = this.GetTempLines(track,nextMeasureIndex,spacing);
		this._lines.push(line);
		spacing.set(6,Math.round(Math.abs(line.MinY)));
		if(line.MaxY + this.minScoreTabSpacing > this.scoreSpacing) {
			spacing.set(8,Math.round(line.MaxY - (this.scoreLineSpacing * 4)));
		}
		spacing.set(19,Math.round(this.minScoreTabSpacing));
		spacing.set(20,Math.round((track.tabHeight + this.stringSpacing) + 1));
		spacing.set(22,10);
		this.checkDefaultSpacing(spacing);
		this.measureLine(track,line,x,posY,spacing);
		var lineHeight = Math.round(spacing.getSize());
		posY += Math.round(lineHeight + this.trackSpacing);
		this.height += Math.round(lineHeight + this.trackSpacing);
		nextMeasureIndex = line.LastIndex + 1;
	}
	this.width = this.getSheetWidth();
}
alphatab.tablature.PageViewLayout.prototype.__class__ = alphatab.tablature.PageViewLayout;
alphatab.tablature.TempLine = function(p) { if( p === $_ ) return; {
	this.TrackSpacing = null;
	this.TempWidth = 0;
	this.LastIndex = 0;
	this.FullLine = false;
	this.MaxY = 0;
	this.MinY = 0;
	this.Measures = new Array();
}}
alphatab.tablature.TempLine.__name__ = ["alphatab","tablature","TempLine"];
alphatab.tablature.TempLine.prototype.AddMeasure = function(index) {
	this.Measures.push(index);
	this.LastIndex = index;
}
alphatab.tablature.TempLine.prototype.FullLine = null;
alphatab.tablature.TempLine.prototype.LastIndex = null;
alphatab.tablature.TempLine.prototype.MaxY = null;
alphatab.tablature.TempLine.prototype.Measures = null;
alphatab.tablature.TempLine.prototype.MinY = null;
alphatab.tablature.TempLine.prototype.TempWidth = null;
alphatab.tablature.TempLine.prototype.TrackSpacing = null;
alphatab.tablature.TempLine.prototype.__class__ = alphatab.tablature.TempLine;
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
alphatab.tablature.model.NoteImpl = function(factory) { if( factory === $_ ) return; {
	alphatab.model.Note.apply(this,[factory]);
	this._noteOrientation = new alphatab.model.Rectangle(0,0,0,0);
}}
alphatab.tablature.model.NoteImpl.__name__ = ["alphatab","tablature","model","NoteImpl"];
alphatab.tablature.model.NoteImpl.__super__ = alphatab.model.Note;
for(var k in alphatab.model.Note.prototype ) alphatab.tablature.model.NoteImpl.prototype[k] = alphatab.model.Note.prototype[k];
alphatab.tablature.model.NoteImpl.paintTie = function(layout,layer,x1,y1,x2,y2,down) {
	if(down == null) down = false;
	var offset = 15 * layout.scale;
	var size = 4 * layout.scale;
	var normalVector = { x : (y2 - y1), y : (x2 - x1)}
	var length = Math.sqrt((normalVector.x * normalVector.x) + (normalVector.y * normalVector.y));
	if(down) normalVector.x *= -1;
	else normalVector.y *= -1;
	normalVector.x /= length;
	normalVector.y /= length;
	var center = { x : (x2 + x1) / 2, y : (y2 + y1) / 2}
	var cp1 = { x : center.x + (offset * normalVector.x), y : center.y + (offset * normalVector.y)}
	var cp2 = { x : center.x + ((offset - size) * normalVector.x), y : center.y + ((offset - size) * normalVector.y)}
	layer.startFigure();
	layer.moveTo(x1,y1);
	layer.quadraticCurveTo(cp1.x,cp1.y,x2,y2);
	layer.quadraticCurveTo(cp2.x,cp2.y,x1,y1);
	layer.closeFigure();
}
alphatab.tablature.model.NoteImpl.prototype._accidental = null;
alphatab.tablature.model.NoteImpl.prototype._noteOrientation = null;
alphatab.tablature.model.NoteImpl.prototype.beatImpl = function() {
	return this.voice.beat;
}
alphatab.tablature.model.NoteImpl.prototype.calculateBendOverflow = function(layout) {
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
alphatab.tablature.model.NoteImpl.prototype.getNoteWidth = function() {
	return this._noteOrientation.width;
}
alphatab.tablature.model.NoteImpl.prototype.getPaintPosition = function(index) {
	return this.measureImpl().ts.get(index);
}
alphatab.tablature.model.NoteImpl.prototype.getPosX = function() {
	return this._noteOrientation.x;
}
alphatab.tablature.model.NoteImpl.prototype.measureImpl = function() {
	return this.voice.beat.measureImpl();
}
alphatab.tablature.model.NoteImpl.prototype.noteForTie = function() {
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
alphatab.tablature.model.NoteImpl.prototype.paint = function(layout,context,x,y) {
	var spacing = this.voice.beat.spacing();
	this.paintScoreNote(layout,context,x,y + this.getPaintPosition(7),spacing);
	this.paintOfflineEffects(layout,context,x,y,spacing);
	this.paintTablatureNote(layout,context,x,y + this.getPaintPosition(20),spacing);
}
alphatab.tablature.model.NoteImpl.prototype.paintAccentuated = function(layout,context,x,y) {
	var layer = (this.voice.index == 0?context.get(9):context.get(5));
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.AccentuatedNote,x,y,layout.scale);
}
alphatab.tablature.model.NoteImpl.prototype.paintBend = function(layout,context,nextBeat,fromX,fromY) {
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
	var fill = (this.voice.index == 0?context.get(10):context.get(6));
	var draw = (this.voice.index == 0?context.get(11):context.get(7));
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
				var firstLoc = new alphatab.model.Point(iX + (dX * firstPt.position),iY - dY * firstPt.value);
				var secondLoc = new alphatab.model.Point(iX + (dX * secondPt.position),iY - dY * secondPt.value);
				var firstHelper = new alphatab.model.Point(firstLoc.x + ((secondLoc.x - firstLoc.x)),iY - dY * firstPt.value);
				draw.addBezier(firstLoc.x,firstLoc.y,firstHelper.x,firstHelper.y,secondLoc.x,secondLoc.y,secondLoc.x,secondLoc.y);
				var arrowSize = 3 * scale;
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
					context.graphics.setFont(alphatab.tablature.drawing.DrawingResources.defaultFont);
					var size = context.graphics.measureText(s);
					var y = (up?(secondLoc.y - alphatab.tablature.drawing.DrawingResources.defaultFontHeight) + (2 * scale):secondLoc.y - (2 * scale));
					var x = secondLoc.x - size / 2;
					fill.addString(s,alphatab.tablature.drawing.DrawingResources.defaultFont,x,y);
				}
			}
		}
	}
}
alphatab.tablature.model.NoteImpl.prototype.paintEffects = function(layout,context,x,y,spacing) {
	var scale = layout.scale;
	var realX = x;
	var realY = y + this.tabPosY;
	var fill = (this.voice.index == 0?context.get(10):context.get(6));
	if(this.effect.isGrace()) {
		var value = (this.effect.grace.isDead?"X":Std.string(this.effect.grace.fret));
		fill.addString(value,alphatab.tablature.drawing.DrawingResources.graceFont,Math.round(this._noteOrientation.x - 7 * scale),this._noteOrientation.y);
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
		fill.addString(str,alphatab.tablature.drawing.DrawingResources.graceFont,Math.round((this._noteOrientation.x + this._noteOrientation.width) + 3 * scale),this._noteOrientation.y);
	}
}
alphatab.tablature.model.NoteImpl.prototype.paintGrace = function(layout,context,x,y) {
	var scale = layout.scoreLineSpacing / 2.25;
	var realX = x - (2 * scale);
	var realY = y - (9 * layout.scale);
	var fill = (this.voice.index == 0?context.get(10):context.get(6));
	var s = (this.effect.deadNote?alphatab.tablature.drawing.MusicFont.GraceDeadNote:alphatab.tablature.drawing.MusicFont.GraceNote);
	fill.addMusicSymbol(s,realX - scale * 1.33,realY,layout.scale);
	if(this.effect.grace.transition == 3 || this.effect.grace.transition == 1) {
		var startX = x - (10 * layout.scale);
		var tieY = y + (10 * layout.scale);
		alphatab.tablature.model.NoteImpl.paintTie(layout,fill,startX,tieY,x,tieY,true);
	}
}
alphatab.tablature.model.NoteImpl.prototype.paintHammer = function(layout,context,nextNote,x,y,forceDown) {
	if(forceDown == null) forceDown = false;
	var down = this.string > 3 || forceDown || nextNote == null;
	var fill = (this.voice.index == 0?context.get(10):context.get(6));
	var realX = this._noteOrientation.x + (this._noteOrientation.width / 2);
	var realY = (down?y + alphatab.tablature.drawing.DrawingResources.noteFontHeight / 2:y - alphatab.tablature.drawing.DrawingResources.noteFontHeight / 2);
	var endX = (nextNote != null?nextNote.voice.beat.getRealPosX(layout):realX + 15 * layout.scale);
	alphatab.tablature.model.NoteImpl.paintTie(layout,fill,realX,realY,endX,realY,down);
}
alphatab.tablature.model.NoteImpl.prototype.paintHeavyAccentuated = function(layout,context,x,y) {
	var layer = (this.voice.index == 0?context.get(9):context.get(5));
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.HeavyAccentuatedNote,x,y,layout.scale);
}
alphatab.tablature.model.NoteImpl.prototype.paintOfflineEffects = function(layout,context,x,y,spacing) {
	var effect = this.effect;
	var realX = x + 3 * layout.scale;
	var fill = (this.voice.index == 0?context.get(10):context.get(6));
	var draw = (this.voice.index == 0?context.get(11):context.get(7));
	if(effect.accentuatedNote) {
		var realY = y + this.getPaintPosition(10);
		this.paintAccentuated(layout,context,realX,realY);
	}
	else if(effect.heavyAccentuatedNote) {
		var realY = y + this.getPaintPosition(10);
		this.paintHeavyAccentuated(layout,context,realX,realY);
	}
	if(effect.isHarmonic()) {
		var realY = y + this.getPaintPosition(11);
		var key = "";
		switch(effect.harmonic.type) {
		case alphatab.model.effects.HarmonicType.Natural:{
			key = "N.H";
		}break;
		case alphatab.model.effects.HarmonicType.Artificial:{
			key = "A.H";
		}break;
		case alphatab.model.effects.HarmonicType.Tapped:{
			key = "T.H";
		}break;
		case alphatab.model.effects.HarmonicType.Pinch:{
			key = "P.H";
		}break;
		case alphatab.model.effects.HarmonicType.Semi:{
			key = "S.H";
		}break;
		}
		fill.addString(key,alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
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
		var realY = y + this.getPaintPosition(13);
		var height = alphatab.tablature.drawing.DrawingResources.defaultFontHeight;
		var startX = realX;
		if(!nextRing) {
			endX -= this.voice.beat.width() / 2;
		}
		if(!prevRing) {
			fill.addString("ring",alphatab.tablature.drawing.DrawingResources.effectFont,startX,realY);
			context.graphics.setFont(alphatab.tablature.drawing.DrawingResources.effectFont);
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
		var realY = y + this.getPaintPosition(14);
		var height = alphatab.tablature.drawing.DrawingResources.defaultFontHeight;
		var startX = realX;
		if(!nextPalm) {
			endX -= 6 * layout.scale;
		}
		if(!prevPalm) {
			fill.addString("P.M.",alphatab.tablature.drawing.DrawingResources.effectFont,startX,realY);
			context.graphics.setFont(alphatab.tablature.drawing.DrawingResources.effectFont);
			startX += context.graphics.measureText("P.M.") + (6 * layout.scale);
		}
		else {
			startX -= 6 * layout.scale;
		}
		if(nextPalm || prevPalm) {
			draw.startFigure();
			draw.addLine(startX,Math.round(realY),endX,Math.round(realY));
		}
		if(!nextPalm && prevPalm) {
			var size = 8 * layout.scale;
			draw.addLine(endX,realY - (size / 2),endX,realY + (size / 2));
		}
	}
	if(effect.vibrato) {
		var realY = y + this.getPaintPosition(16);
		this.paintVibrato(layout,context,realX,realY,0.75);
	}
	if(effect.isTrill()) {
		var realY = y + this.getPaintPosition(16);
		this.paintTrill(layout,context,realX,realY);
	}
}
alphatab.tablature.model.NoteImpl.prototype.paintScoreNote = function(layout,context,x,y,spacing) {
	var scoreSpacing = layout.scoreLineSpacing;
	var direction = this.voice.beatGroup.direction;
	var key = this.measureImpl().keySignature();
	var clef = this.measureImpl().clef;
	var realX = x + 4 * layout.scale;
	var realY1 = y + this.scorePosY;
	var fill = (this.voice.index == 0?context.get(9):context.get(5));
	var effectLayer = (this.voice.index == 0?context.get(10):context.get(6));
	if(this.isTiedNote) {
		var noteForTie = this.noteForTie();
		var tieScale = scoreSpacing / 8.0;
		var tieX = realX - (20.0 * tieScale);
		var tieY = realY1;
		var tieWidth = 20.0 * tieScale;
		var tieHeight = 30.0 * tieScale;
		if(noteForTie != null) {
			tieX = noteForTie.voice.beat.lastPaintX + 13 * layout.scale;
			tieY = y + this.scorePosY;
			tieWidth = (realX - tieX);
			tieHeight = (20.0 * tieScale);
		}
		alphatab.tablature.model.NoteImpl.paintTie(layout,fill,tieX,tieY,tieX + tieWidth,tieY);
	}
	var accidentalX = x - 2 * layout.scale;
	if(this._accidental == 1) {
		alphatab.tablature.drawing.KeySignaturePainter.paintSmallNatural(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	else if(this._accidental == 2) {
		alphatab.tablature.drawing.KeySignaturePainter.paintSmallSharp(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	else if(this._accidental == 3) {
		alphatab.tablature.drawing.KeySignaturePainter.paintSmallFlat(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	if(this.effect.isHarmonic()) {
		var full = this.voice.duration.value >= 4;
		var layer = (full?fill:effectLayer);
		alphatab.tablature.drawing.NotePainter.paintHarmonic(layer,realX,realY1 + 1,layout.scale);
	}
	else if(this.effect.deadNote) {
		alphatab.tablature.drawing.NotePainter.paintDeadNote(fill,realX,realY1,layout.scale,alphatab.tablature.drawing.DrawingResources.clefFont);
	}
	else {
		var full = this.voice.duration.value >= 4;
		alphatab.tablature.drawing.NotePainter.paintNote(fill,realX,realY1,layout.scale,full,alphatab.tablature.drawing.DrawingResources.clefFont);
	}
	if(this.effect.isGrace()) {
		this.paintGrace(layout,context,realX,realY1);
	}
	if(this.voice.duration.isDotted || this.voice.duration.isDoubleDotted) {
		this.voice.paintDot(layout,fill,realX + (12.0 * (scoreSpacing / 8.0)),realY1 + (layout.scoreLineSpacing / 2),scoreSpacing / 10.0);
	}
	var xMove = (direction == 1?alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x:0);
	var realY2 = y + this.voice.beatGroup.getY2(layout,this.posX() + spacing,key,clef);
	if(this.effect.staccato) {
		var Size = 3;
		var stringX = realX + xMove;
		var stringY = (realY2 + (4 * (((direction == 1)?-1:1))));
		fill.addCircle(stringX - (Size / 2),stringY - (Size / 2),Size);
	}
	if(this.effect.isTremoloPicking()) {
		var trillY = (direction != 1?realY1 + Math.floor(8 * layout.scale):realY1 - Math.floor(16 * layout.scale));
		var trillX = (direction != 1?realX - Math.floor(5 * layout.scale):realX + Math.floor(3 * layout.scale));
		var s = "";
		switch(this.effect.tremoloPicking.duration.value) {
		case 8:{
			s = alphatab.tablature.drawing.MusicFont.TrillUpEigth;
			if(direction == 2) trillY += Math.floor(8 * layout.scale);
		}break;
		case 16:{
			s = alphatab.tablature.drawing.MusicFont.TrillUpSixteenth;
			if(direction == 2) trillY += Math.floor(4 * layout.scale);
		}break;
		case 32:{
			s = alphatab.tablature.drawing.MusicFont.TrillUpThirtySecond;
		}break;
		}
		if(s != "") fill.addMusicSymbol(s,trillX,trillY,layout.scale);
	}
}
alphatab.tablature.model.NoteImpl.prototype.paintSlide = function(layout,context,nextNote,x,y,nextX) {
	var xScale = layout.scale;
	var yScale = layout.stringSpacing / 10.0;
	var xMove = 15.0 * xScale;
	var yMove = 3.0 * yScale;
	var realX = x;
	var realY = y;
	var rextY = realY;
	var draw = (this.voice.index == 0?context.get(11):context.get(7));
	draw.startFigure();
	if(this.effect.slideType == 4) {
		realY += yMove;
		rextY -= yMove;
		draw.addLine(this._noteOrientation.x - xMove,realY,this._noteOrientation.x,rextY);
	}
	else if(this.effect.slideType == 5) {
		realY -= yMove;
		rextY += yMove;
		draw.addLine(this._noteOrientation.x - xMove,realY,this._noteOrientation.x,rextY);
	}
	else if(this.effect.slideType == 2) {
		realY -= yMove;
		rextY += yMove;
		draw.addLine(this._noteOrientation.x + this._noteOrientation.width,realY,(this._noteOrientation.x + this._noteOrientation.width) + xMove,rextY);
	}
	else if(this.effect.slideType == 3) {
		realY += yMove;
		rextY -= yMove;
		draw.addLine(this._noteOrientation.x + this._noteOrientation.width,realY,(this._noteOrientation.x + this._noteOrientation.width) + xMove,rextY);
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
		draw.addLine(this._noteOrientation.x + this._noteOrientation.width,realY,fNextX,rextY);
		if(this.effect.slideType == 1) {
			this.paintHammer(layout,context,nextNote,x,y);
		}
	}
	else {
		draw.addLine(this._noteOrientation.x + this._noteOrientation.width,realY - yMove,(this._noteOrientation.x + this._noteOrientation.width) + xMove,realY - yMove);
	}
}
alphatab.tablature.model.NoteImpl.prototype.paintTablatureNote = function(layout,context,x,y,spacing) {
	var realX = x + Math.round(3 * layout.scale);
	var realY = y + this.tabPosY;
	this._noteOrientation.x = realX;
	this._noteOrientation.y = realY;
	this._noteOrientation.width = 0;
	this._noteOrientation.height = 0;
	var fill = (this.voice.index == 0?context.get(9):context.get(5));
	if(!this.isTiedNote) {
		this._noteOrientation = layout.getNoteOrientation(realX,realY,this);
		var visualNote = (this.effect.deadNote?"X":Std.string(this.value));
		visualNote = (this.effect.ghostNote?("(" + visualNote) + ")":visualNote);
		fill.addString(visualNote,alphatab.tablature.drawing.DrawingResources.noteFont,this._noteOrientation.x,this._noteOrientation.y);
	}
	this.paintEffects(layout,context,x,y,spacing);
}
alphatab.tablature.model.NoteImpl.prototype.paintTrill = function(layout,context,x,y) {
	var str = "Tr";
	context.graphics.setFont(alphatab.tablature.drawing.DrawingResources.effectFont);
	var size = context.graphics.measureText(str);
	var scale = layout.scale;
	var realX = (x + size) - 2 * scale;
	var realY = y + (alphatab.tablature.drawing.DrawingResources.effectFontHeight - (5.0 * scale)) / 2.0;
	var width = (this.voice.width - size) - (2.0 * scale);
	var fill = (this.voice.index == 0?context.get(10):context.get(6));
	fill.addString(str,alphatab.tablature.drawing.DrawingResources.effectFont,x,y);
}
alphatab.tablature.model.NoteImpl.prototype.paintVibrato = function(layout,context,x,y,symbolScale) {
	var scale = layout.scale;
	var realX = x - 2 * scale;
	var realY = y + (2.0 * scale);
	var width = this.voice.width;
	var fill = (this.voice.index == 0?context.get(10):context.get(6));
	var step = (18 * scale) * symbolScale;
	var loops = Math.floor(Math.max(1,(width / step)));
	var s = "";
	{
		var _g = 0;
		while(_g < loops) {
			var i = _g++;
			fill.addMusicSymbol(alphatab.tablature.drawing.MusicFont.VibratoLeftRight,realX,realY,layout.scale * symbolScale);
			realX += step;
		}
	}
}
alphatab.tablature.model.NoteImpl.prototype.posX = function() {
	return this.voice.beat.posX;
}
alphatab.tablature.model.NoteImpl.prototype.scorePosY = null;
alphatab.tablature.model.NoteImpl.prototype.tabPosY = null;
alphatab.tablature.model.NoteImpl.prototype.update = function(layout) {
	this._accidental = this.measureImpl().getNoteAccidental(this.realValue());
	this.tabPosY = Math.round((this.string * layout.stringSpacing) - layout.stringSpacing);
	this.scorePosY = this.voice.beatGroup.getY1(layout,this,this.measureImpl().keySignature(),this.measureImpl().clef) + Math.floor(layout.scale);
}
alphatab.tablature.model.NoteImpl.prototype.voiceImpl = function() {
	return this.voice;
}
alphatab.tablature.model.NoteImpl.prototype.__class__ = alphatab.tablature.model.NoteImpl;
if(!alphatab.file.alphatex) alphatab.file.alphatex = {}
alphatab.file.alphatex.AlphaTexSymbols = { __ename__ : ["alphatab","file","alphatex","AlphaTexSymbols"], __constructs__ : ["No","Eof","Number","DoubleDot","Dot","String","Tuning","LParensis","RParensis","LBrace","RBrace","Pipe","MetaCommand"] }
alphatab.file.alphatex.AlphaTexSymbols.Dot = ["Dot",4];
alphatab.file.alphatex.AlphaTexSymbols.Dot.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Dot.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.DoubleDot = ["DoubleDot",3];
alphatab.file.alphatex.AlphaTexSymbols.DoubleDot.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.DoubleDot.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Eof = ["Eof",1];
alphatab.file.alphatex.AlphaTexSymbols.Eof.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Eof.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.LBrace = ["LBrace",9];
alphatab.file.alphatex.AlphaTexSymbols.LBrace.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.LBrace.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.LParensis = ["LParensis",7];
alphatab.file.alphatex.AlphaTexSymbols.LParensis.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.LParensis.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.MetaCommand = ["MetaCommand",12];
alphatab.file.alphatex.AlphaTexSymbols.MetaCommand.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.MetaCommand.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.No = ["No",0];
alphatab.file.alphatex.AlphaTexSymbols.No.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.No.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Number = ["Number",2];
alphatab.file.alphatex.AlphaTexSymbols.Number.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Number.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Pipe = ["Pipe",11];
alphatab.file.alphatex.AlphaTexSymbols.Pipe.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Pipe.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.RBrace = ["RBrace",10];
alphatab.file.alphatex.AlphaTexSymbols.RBrace.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.RBrace.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.RParensis = ["RParensis",8];
alphatab.file.alphatex.AlphaTexSymbols.RParensis.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.RParensis.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.String = ["String",5];
alphatab.file.alphatex.AlphaTexSymbols.String.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.String.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Tuning = ["Tuning",6];
alphatab.file.alphatex.AlphaTexSymbols.Tuning.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Tuning.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.FileFormatException = function(message) { if( message === $_ ) return; {
	if(message == null) message = "";
	this.message = message;
}}
alphatab.file.FileFormatException.__name__ = ["alphatab","file","FileFormatException"];
alphatab.file.FileFormatException.prototype.message = null;
alphatab.file.FileFormatException.prototype.__class__ = alphatab.file.FileFormatException;
alphatab.tablature.model.BeatImpl = function(factory) { if( factory === $_ ) return; {
	alphatab.model.Beat.apply(this,[factory]);
}}
alphatab.tablature.model.BeatImpl.__name__ = ["alphatab","tablature","model","BeatImpl"];
alphatab.tablature.model.BeatImpl.__super__ = alphatab.model.Beat;
for(var k in alphatab.model.Beat.prototype ) alphatab.tablature.model.BeatImpl.prototype[k] = alphatab.model.Beat.prototype[k];
alphatab.tablature.model.BeatImpl.prototype.beatGroup = null;
alphatab.tablature.model.BeatImpl.prototype.calculateTremoloBarOverflow = function(layout) {
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
alphatab.tablature.model.BeatImpl.prototype.caretPosition = function(layout) {
	return Math.floor(this.getRealPosX(layout) + 8 * layout.scale);
}
alphatab.tablature.model.BeatImpl.prototype.check = function(note) {
	var value = note.realValue();
	if(this.maxNote == null || value > this.maxNote.realValue()) this.maxNote = note;
	if(this.minNote == null || value < this.minNote.realValue()) this.minNote = note;
}
alphatab.tablature.model.BeatImpl.prototype.getPaintPosition = function(position) {
	return this.measureImpl().ts.get(position);
}
alphatab.tablature.model.BeatImpl.prototype.getRealPosX = function(layout) {
	return (((this.measureImpl().posX + this.measureImpl().headerImpl().getLeftSpacing(layout)) + this.posX) + this.spacing()) + (4 * layout.scale);
}
alphatab.tablature.model.BeatImpl.prototype.getVoiceImpl = function(index) {
	return this.voices[index];
}
alphatab.tablature.model.BeatImpl.prototype.height = function() {
	return this.measureImpl().ts.getSize();
}
alphatab.tablature.model.BeatImpl.prototype.join1 = null;
alphatab.tablature.model.BeatImpl.prototype.join2 = null;
alphatab.tablature.model.BeatImpl.prototype.joinedGreaterThanQuarter = null;
alphatab.tablature.model.BeatImpl.prototype.joinedType = null;
alphatab.tablature.model.BeatImpl.prototype.lastPaintX = null;
alphatab.tablature.model.BeatImpl.prototype.maxNote = null;
alphatab.tablature.model.BeatImpl.prototype.measureImpl = function() {
	return this.measure;
}
alphatab.tablature.model.BeatImpl.prototype.minNote = null;
alphatab.tablature.model.BeatImpl.prototype.minimumWidth = null;
alphatab.tablature.model.BeatImpl.prototype.nextBeat = null;
alphatab.tablature.model.BeatImpl.prototype.paint = function(layout,context,x,y) {
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
alphatab.tablature.model.BeatImpl.prototype.paintBeatEffects = function(context,layout,x,y) {
	var realX = x + 3 * layout.scale;
	var fill = context.get(10);
	if(this.effect.stroke.direction != 0) {
		this.paintStroke(layout,context,x,y);
	}
	if(this.effect.chord != null) {
		var chordImpl = this.effect.chord;
		chordImpl.paint(layout,context,x,y);
	}
	if(this.effect.fadeIn) {
		var realY = y + this.getPaintPosition(17);
		this.paintFadeIn(layout,context,realX,realY);
	}
	if(this.effect.tapping) {
		var realY = y + this.getPaintPosition(12);
		fill.addString("T",alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
	}
	else if(this.effect.slapping) {
		var realY = y + this.getPaintPosition(12);
		fill.addString("S",alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
	}
	else if(this.effect.popping) {
		var realY = y + this.getPaintPosition(12);
		fill.addString("P",alphatab.tablature.drawing.DrawingResources.defaultFont,realX,realY);
	}
	if(this.effect.vibrato) {
		var realY = y + this.getPaintPosition(15);
		this.paintVibrato(layout,context,realX,realY,1);
	}
	if(this.effect.isTremoloBar()) {
		var string = (this.minNote == null?6:this.minNote.string);
		var realY = (y + this.getPaintPosition(20)) + Math.round((string - 1) * layout.stringSpacing);
		var nextBeat = layout.songManager().getNextBeat(this);
		if(nextBeat != null && nextBeat.measureImpl().ts != this.measureImpl().ts) nextBeat = null;
		this.paintTremoloBar(layout,context,nextBeat,realX,realY);
	}
}
alphatab.tablature.model.BeatImpl.prototype.paintExtraLines = function(context,layout,x,y) {
	if(!this.isRestBeat()) {
		var scoreY = y + this.measureImpl().ts.get(7);
		this.paintExtraLines2(context,layout,this.minNote,x,scoreY);
		this.paintExtraLines2(context,layout,this.maxNote,x,scoreY);
	}
}
alphatab.tablature.model.BeatImpl.prototype.paintExtraLines2 = function(context,layout,note,x,y) {
	var realY = y + note.scorePosY;
	var x1 = x + 3 * layout.scale;
	var x2 = x + 15 * layout.scale;
	var scorelineSpacing = layout.scoreLineSpacing;
	if(realY < y) {
		var i = y;
		while(i > realY) {
			context.get(2).startFigure();
			context.get(2).addLine(x1,i,x2,i);
			i -= Math.floor(scorelineSpacing);
		}
	}
	else if(realY > (y + (scorelineSpacing * 4))) {
		var i = (y + (scorelineSpacing * 5));
		while(i < (realY + scorelineSpacing)) {
			context.get(2).startFigure();
			context.get(2).addLine(x1,i,x2,i);
			i += scorelineSpacing;
		}
	}
}
alphatab.tablature.model.BeatImpl.prototype.paintFadeIn = function(layout,context,x,y) {
	var scale = layout.scale;
	var realX = x;
	var realY = Math.round(y + (4.0 * scale));
	var fWidth = Math.round(this.width());
	var layer = context.get(12);
	layer.startFigure();
	layer.addBezier(realX,realY,realX,realY,realX + fWidth,realY,realX + fWidth,Math.round(realY - (4 * scale)));
	layer.startFigure();
	layer.addBezier(realX,realY,realX,realY,realX + fWidth,realY,realX + fWidth,Math.round(realY + (4 * scale)));
}
alphatab.tablature.model.BeatImpl.prototype.paintStroke = function(layout,context,x,y) {
	if(this.effect.stroke.direction == 0) return;
	var scale = layout.scale;
	var realX = x;
	var realY = y + this.getPaintPosition(20);
	var y1 = realY;
	var y2 = realY + this.measureImpl().trackImpl().tabHeight;
	var layer = context.get(4);
	layer.startFigure();
	if(this.effect.stroke.direction == 1) {
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
alphatab.tablature.model.BeatImpl.prototype.paintTremoloBar = function(layout,context,nextBeat,x,y) {
	var scale = layout.scale;
	var realX = x + (5 * scale);
	var realY = y + ((alphatab.tablature.drawing.DrawingResources.noteFontHeight / 2) * scale);
	var xTo;
	var minY = realY - 60 * scale;
	if(nextBeat == null) {
		xTo = (this.measureImpl().posX + this.measureImpl().width) + this.measureImpl().spacing;
	}
	else {
		xTo = (((nextBeat.measureImpl().posX + nextBeat.measureImpl().headerImpl().getLeftSpacing(layout)) + nextBeat.posX) + (nextBeat.spacing() * scale)) + 5 * scale;
	}
	var fill = context.get(10);
	var draw = context.get(11);
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
				var firstLoc = new alphatab.model.Point(Math.floor(realX + (dX * firstPt.position)),Math.floor(realY - dY * firstPt.value));
				var secondLoc = new alphatab.model.Point(Math.floor(realX + (dX * secondPt.position)),Math.floor(realY - dY * secondPt.value));
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
					context.graphics.setFont(alphatab.tablature.drawing.DrawingResources.defaultFont);
					var size = context.graphics.measureText(s);
					var sY = (up?(secondLoc.y - alphatab.tablature.drawing.DrawingResources.defaultFontHeight) - (3 * scale):secondLoc.y + (3 * scale));
					var sX = secondLoc.x - size / 2;
					fill.addString(s,alphatab.tablature.drawing.DrawingResources.defaultFont,sX,sY);
				}
			}
		}
	}
}
alphatab.tablature.model.BeatImpl.prototype.paintVibrato = function(layout,context,x,y,symbolScale) {
	var scale = layout.scale;
	var realX = x - 2 * scale;
	var realY = y + (2.0 * scale);
	var width = this.width();
	var fill = context.get(10);
	var step = (18 * scale) * symbolScale;
	var loops = Math.floor(Math.max(1,(width / step)));
	var s = "";
	{
		var _g = 0;
		while(_g < loops) {
			var i = _g++;
			fill.addMusicSymbol(alphatab.tablature.drawing.MusicFont.VibratoLeftRight,realX,realY,layout.scale * symbolScale);
			realX += step;
		}
	}
}
alphatab.tablature.model.BeatImpl.prototype.posX = null;
alphatab.tablature.model.BeatImpl.prototype.previousBeat = null;
alphatab.tablature.model.BeatImpl.prototype.reset = function() {
	this.maxNote = null;
	this.minNote = null;
}
alphatab.tablature.model.BeatImpl.prototype.spacing = function() {
	return this.measureImpl().getBeatSpacing(this);
}
alphatab.tablature.model.BeatImpl.prototype.width = function() {
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
alphatab.tablature.model.BeatImpl.prototype.__class__ = alphatab.tablature.model.BeatImpl;
alphatab.model.Marker = function(p) { if( p === $_ ) return; {
	null;
}}
alphatab.model.Marker.__name__ = ["alphatab","model","Marker"];
alphatab.model.Marker.prototype.color = null;
alphatab.model.Marker.prototype.measureHeader = null;
alphatab.model.Marker.prototype.title = null;
alphatab.model.Marker.prototype.__class__ = alphatab.model.Marker;
alphatab.tablature.Tablature = function(source,msg) { if( source === $_ ) return; {
	if(msg == null) msg = "";
	this.canvas = alphatab.platform.PlatformFactory.getCanvas(source);
	this.track = null;
	this.songManager = new alphatab.model.SongManager(new alphatab.tablature.model.SongFactoryImpl());
	this.errorMessage = StringTools.trim(msg);
	if(this.errorMessage == "" || this.errorMessage == null) {
		this.errorMessage = "Please set a song's track to display the tablature";
	}
	this.viewLayout = new alphatab.tablature.PageViewLayout();
	this.viewLayout.setTablature(this);
	this.updateScale(1.0);
}}
alphatab.tablature.Tablature.__name__ = ["alphatab","tablature","Tablature"];
alphatab.tablature.Tablature.prototype._lastPosition = null;
alphatab.tablature.Tablature.prototype._lastRealPosition = null;
alphatab.tablature.Tablature.prototype._selectedBeat = null;
alphatab.tablature.Tablature.prototype._updateDisplay = null;
alphatab.tablature.Tablature.prototype._updateSong = null;
alphatab.tablature.Tablature.prototype.autoSizeWidth = null;
alphatab.tablature.Tablature.prototype.canvas = null;
alphatab.tablature.Tablature.prototype.doLayout = function() {
	if(this.track == null) return;
	var size = this.viewLayout.layoutSize;
	if(!this.autoSizeWidth) {
		size.x = this.canvas.width() - this.viewLayout.contentPadding.getHorizontal();
	}
	this.viewLayout.prepareLayout(new alphatab.model.Rectangle(0,0,size.x,size.y),0,0);
	if(this.autoSizeWidth) this.canvas.setWidth(this.viewLayout.width);
	this.canvas.setHeight(this.viewLayout.height);
}
alphatab.tablature.Tablature.prototype.errorMessage = null;
alphatab.tablature.Tablature.prototype.findBeat = function(measurePosition,playerPosition,measure) {
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
alphatab.tablature.Tablature.prototype.findMeasure = function(position) {
	var result = this.getMeasureAt(position);
	if(result.measure == null) {
		result.measure = this.songManager.getFirstMeasure(this.track);
	}
	return result;
}
alphatab.tablature.Tablature.prototype.getMeasureAt = function(tick) {
	var start = 960;
	var result = { measure : null, realPosition : start}
	var song = this.track.song;
	var controller = new alphatab.midi.MidiRepeatController(song);
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
alphatab.tablature.Tablature.prototype.invalidate = function() {
	this.canvas.clear();
	this.onPaint();
}
alphatab.tablature.Tablature.prototype.isError = null;
alphatab.tablature.Tablature.prototype.notifyTickPosition = function(position) {
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
alphatab.tablature.Tablature.prototype.onCaretChanged = null;
alphatab.tablature.Tablature.prototype.onPaint = function() {
	this.paintBackground();
	if(this.track == null || this.isError) {
		var text = this.errorMessage;
		this.canvas.setFillStyle("#4e4e4e");
		this.canvas.setFont("20px 'Arial'");
		this.canvas.setTextBaseline("middle");
		this.canvas.fillText(text,20,30);
	}
	else if(this._updateDisplay) {
		var displayRect = new alphatab.model.Rectangle(0,0,this.canvas.width(),this.canvas.height());
		this.viewLayout.updateCache(this.canvas,displayRect,0,0);
		this._updateDisplay = false;
	}
	else {
		var displayRect = new alphatab.model.Rectangle(0,0,this.canvas.width(),this.canvas.height());
		this.viewLayout.paintCache(this.canvas,displayRect,0,0);
		this._updateDisplay = false;
	}
}
alphatab.tablature.Tablature.prototype.paintBackground = function() {
	var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
	this.canvas.setFillStyle("#4e4e4e");
	this.canvas.setFont(alphatab.tablature.drawing.DrawingResources.copyrightFont);
	this.canvas.setTextBaseline("top");
	var x = (this.canvas.width() - this.canvas.measureText(msg)) / 2;
	this.canvas.fillText(msg,x,this.canvas.height() - 15);
}
alphatab.tablature.Tablature.prototype.setTrack = function(track) {
	this.track = track;
	this._updateSong = true;
	this._updateDisplay = true;
	this.updateTablature();
	this.invalidate();
}
alphatab.tablature.Tablature.prototype.songManager = null;
alphatab.tablature.Tablature.prototype.track = null;
alphatab.tablature.Tablature.prototype.updateScale = function(scale) {
	alphatab.tablature.drawing.DrawingResources.init(scale);
	this.viewLayout.init(scale);
	this._updateSong = true;
	this._updateDisplay = true;
	this.updateTablature();
	this.invalidate();
}
alphatab.tablature.Tablature.prototype.updateTablature = function() {
	if(this.track == null) return;
	this.viewLayout.updateSong();
	this.doLayout();
	this._updateSong = false;
}
alphatab.tablature.Tablature.prototype.viewLayout = null;
alphatab.tablature.Tablature.prototype.__class__ = alphatab.tablature.Tablature;
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
alphatab.model.Velocities = function() { }
alphatab.model.Velocities.__name__ = ["alphatab","model","Velocities"];
alphatab.model.Velocities.prototype.__class__ = alphatab.model.Velocities;
alphatab.tablature.model.BeatGroup = function(voice) { if( voice === $_ ) return; {
	this._voice = voice;
	this._voices = new Array();
	this.direction = 0;
	this._firstMinNote = null;
	this._firstMaxNote = null;
	this._lastMinNote = null;
	this._lastMaxNote = null;
	this.maxNote = null;
	this.minNote = null;
}}
alphatab.tablature.model.BeatGroup.__name__ = ["alphatab","tablature","model","BeatGroup"];
alphatab.tablature.model.BeatGroup.getUpOffset = function(layout) {
	return 28 * (layout.scoreLineSpacing / 8.0);
}
alphatab.tablature.model.BeatGroup.getDownOffset = function(layout) {
	return 35 * (layout.scoreLineSpacing / 8.0);
}
alphatab.tablature.model.BeatGroup.prototype._firstMaxNote = null;
alphatab.tablature.model.BeatGroup.prototype._firstMinNote = null;
alphatab.tablature.model.BeatGroup.prototype._lastMaxNote = null;
alphatab.tablature.model.BeatGroup.prototype._lastMinNote = null;
alphatab.tablature.model.BeatGroup.prototype._voice = null;
alphatab.tablature.model.BeatGroup.prototype._voices = null;
alphatab.tablature.model.BeatGroup.prototype.checkNote = function(note) {
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
alphatab.tablature.model.BeatGroup.prototype.checkVoice = function(voice) {
	this.checkNote(voice.maxNote);
	this.checkNote(voice.minNote);
	this._voices.push(voice);
	if(voice.direction != 0) {
		voice.direction = voice.direction;
	}
}
alphatab.tablature.model.BeatGroup.prototype.direction = null;
alphatab.tablature.model.BeatGroup.prototype.finish = function(layout,measure) {
	if(this.direction == 0) {
		if(measure.notEmptyVoices > 1) {
			this.direction = (this._voice == 0?1:2);
		}
		else {
			var max = Math.abs(this.minNote.realValue() - (alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS[measure.clef] + 100));
			var min = Math.abs(this.maxNote.realValue() - (alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS[measure.clef] - 100));
			this.direction = (max > min?1:2);
		}
	}
}
alphatab.tablature.model.BeatGroup.prototype.getY1 = function(layout,note,key,clef) {
	var scale = (layout.scoreLineSpacing / 2.00);
	var noteValue = note.realValue();
	var index = noteValue % 12;
	var step = Math.floor(noteValue / 12);
	var offset = (7 * step) * scale;
	var scoreLineY = (key <= 7?Math.floor((alphatab.tablature.model.BeatGroup.SCORE_SHARP_POSITIONS[index] * scale) - offset):Math.floor((alphatab.tablature.model.BeatGroup.SCORE_FLAT_POSITIONS[index] * scale) - offset));
	scoreLineY += Math.floor(alphatab.tablature.model.MeasureImpl.SCORE_KEY_OFFSETS[clef] * scale);
	return scoreLineY;
}
alphatab.tablature.model.BeatGroup.prototype.getY2 = function(layout,x,key,clef) {
	var MaxDistance = 10;
	var upOffset = alphatab.tablature.model.BeatGroup.getUpOffset(layout);
	var downOffset = alphatab.tablature.model.BeatGroup.getDownOffset(layout);
	var y;
	var x1;
	var x2;
	var y1;
	var y2;
	if(this.direction == 2) {
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
alphatab.tablature.model.BeatGroup.prototype.maxNote = null;
alphatab.tablature.model.BeatGroup.prototype.minNote = null;
alphatab.tablature.model.BeatGroup.prototype.__class__ = alphatab.tablature.model.BeatGroup;
alphatab.tablature.model.LyricsImpl = function(p) { if( p === $_ ) return; {
	alphatab.model.Lyrics.apply(this,[]);
}}
alphatab.tablature.model.LyricsImpl.__name__ = ["alphatab","tablature","model","LyricsImpl"];
alphatab.tablature.model.LyricsImpl.__super__ = alphatab.model.Lyrics;
for(var k in alphatab.model.Lyrics.prototype ) alphatab.tablature.model.LyricsImpl.prototype[k] = alphatab.model.Lyrics.prototype[k];
alphatab.tablature.model.LyricsImpl.prototype.paintCurrentNoteBeats = function(context,layout,currentMeasure,beatCount,x,y) {
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
						context.get(3).addString(str,alphatab.tablature.drawing.DrawingResources.defaultFont,realX + 13,y + currentMeasure.ts.get(22));
					}
				}
				beatIndex++;
			}
		}
	}
}
alphatab.tablature.model.LyricsImpl.prototype.__class__ = alphatab.tablature.model.LyricsImpl;
alphatab.file.alphatex.AlphaTexParser = function(p) { if( p === $_ ) return; {
	alphatab.file.SongReader.apply(this,[]);
}}
alphatab.file.alphatex.AlphaTexParser.__name__ = ["alphatab","file","alphatex","AlphaTexParser"];
alphatab.file.alphatex.AlphaTexParser.__super__ = alphatab.file.SongReader;
for(var k in alphatab.file.SongReader.prototype ) alphatab.file.alphatex.AlphaTexParser.prototype[k] = alphatab.file.SongReader.prototype[k];
alphatab.file.alphatex.AlphaTexParser.isLetter = function(ch) {
	var code = ch.charCodeAt(0);
	return !alphatab.file.alphatex.AlphaTexParser.isTerminal(ch) && ((code >= 33 && code <= 47) || (code >= 58 && code <= 126) || (code > 128));
}
alphatab.file.alphatex.AlphaTexParser.isTerminal = function(ch) {
	return ch == "." || ch == "{" || ch == "}" || ch == "[" || ch == "]" || ch == "(" || ch == ")" || ch == "|" || ch == "'" || ch == "\"" || ch == "\\";
}
alphatab.file.alphatex.AlphaTexParser.isTuning = function(name) {
	var regex = new EReg("([a-g]b?)([0-9])","i");
	return regex.match(name);
}
alphatab.file.alphatex.AlphaTexParser.prototype._allowNegatives = null;
alphatab.file.alphatex.AlphaTexParser.prototype._ch = null;
alphatab.file.alphatex.AlphaTexParser.prototype._curChPos = null;
alphatab.file.alphatex.AlphaTexParser.prototype._currentDuration = null;
alphatab.file.alphatex.AlphaTexParser.prototype._song = null;
alphatab.file.alphatex.AlphaTexParser.prototype._sy = null;
alphatab.file.alphatex.AlphaTexParser.prototype._syData = null;
alphatab.file.alphatex.AlphaTexParser.prototype._track = null;
alphatab.file.alphatex.AlphaTexParser.prototype.applyBeatEffect = function(beat) {
	if(this._syData == "f") {
		beat.effect.fadeIn = true;
		this.newSy();
		return true;
	}
	else if(this._syData == "v") {
		beat.effect.vibrato = true;
		this.newSy();
		return true;
	}
	else if(this._syData == "t") {
		beat.effect.tapping = true;
		this.newSy();
		return true;
	}
	else if(this._syData == "s") {
		beat.effect.slapping = true;
		this.newSy();
		return true;
	}
	else if(this._syData == "p") {
		beat.effect.popping = true;
		this.newSy();
		return true;
	}
	else if(this._syData == "d") {
		beat.voices[0].duration.isDotted = true;
		this.newSy();
		return true;
	}
	else if(this._syData == "su") {
		beat.effect.stroke.direction = 1;
		this.newSy();
		if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
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
		return true;
	}
	else if(this._syData == "sd") {
		beat.effect.stroke.direction = 2;
		this.newSy();
		if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
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
		return true;
	}
	else if(this._syData == "tu") {
		this.newSy();
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
			this.error("tuplet",alphatab.file.alphatex.AlphaTexSymbols.Number);
			return false;
		}
		var tuplet = this._syData;
		var duration = beat.voices[0].duration;
		switch(tuplet) {
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
		this.newSy();
		return true;
	}
	else if(this._syData == "tb") {
		this.newSy();
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.LParensis) {
			this.error("tremolobar-effect",alphatab.file.alphatex.AlphaTexSymbols.LParensis);
			return false;
		}
		this.newSy();
		this._allowNegatives = true;
		var points = new Array();
		while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) {
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("tremolobar-effect",alphatab.file.alphatex.AlphaTexSymbols.Number);
				return false;
			}
			points.push(new alphatab.model.effects.BendPoint(0,this._syData,false));
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
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis) {
			this.error("tremolobar-effect",alphatab.file.alphatex.AlphaTexSymbols.RParensis);
			return false;
		}
		this.newSy();
		return true;
	}
	return false;
}
alphatab.file.alphatex.AlphaTexParser.prototype.beat = function(measure) {
	if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.DoubleDot) {
		this.newSy();
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
			this.error("duration",alphatab.file.alphatex.AlphaTexSymbols.Number);
		}
		if(this._syData == 1 || this._syData == 2 || this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) {
			this._currentDuration = this._syData;
		}
		else {
			this.error("duration",alphatab.file.alphatex.AlphaTexSymbols.Number,false);
		}
		this.newSy();
		return;
	}
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
	if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.LParensis) {
		this.newSy();
		voice.addNote(this.note(beat));
		while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) {
			voice.addNote(this.note(beat));
		}
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis) {
			this.error("note-list",alphatab.file.alphatex.AlphaTexSymbols.RParensis);
		}
		this.newSy();
	}
	else if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String && Std.string(this._syData).toLowerCase() == "r") {
		this.newSy();
	}
	else {
		voice.addNote(this.note(beat));
	}
	if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Dot) {
		this.newSy();
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
			this.error("duration",alphatab.file.alphatex.AlphaTexSymbols.Number);
		}
		if(this._syData == 1 || this._syData == 2 || this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) {
			voice.duration.value = this._syData;
		}
		else {
			this.error("duration",alphatab.file.alphatex.AlphaTexSymbols.Number,false);
		}
		this.newSy();
	}
	else {
		voice.duration.value = this._currentDuration;
	}
	this.beatEffects(beat);
	measure.addBeat(beat);
}
alphatab.file.alphatex.AlphaTexParser.prototype.beatEffects = function(beat) {
	if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.LBrace) {
		return;
	}
	this.newSy();
	while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
		this._syData = Std.string(this._syData).toLowerCase();
		if(!this.applyBeatEffect(beat)) {
			this.error("beat-effects",alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
	}
	if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RBrace) {
		this.error("beat-effects",alphatab.file.alphatex.AlphaTexSymbols.RBrace);
	}
	this.newSy();
}
alphatab.file.alphatex.AlphaTexParser.prototype.createDefaultSong = function() {
	this._song = this.factory.newSong();
	this._song.tempo = 120;
	this._song.tempoName = "";
	this._song.hideTempo = false;
	this._song.pageSetup = alphatab.model.PageSetup.defaults();
	this._track = this.factory.newTrack();
	this._track.number = 1;
	this._track.channel.instrument(25);
	this._track.channel.channel = [0,1][0];
	this._track.channel.effectChannel = [0,1][1];
	this.createDefaultStrings(this._track.strings);
	this._song.addTrack(this._track);
}
alphatab.file.alphatex.AlphaTexParser.prototype.createDefaultStrings = function(list) {
	list.push(this.newString(1,64));
	list.push(this.newString(2,59));
	list.push(this.newString(3,55));
	list.push(this.newString(4,50));
	list.push(this.newString(5,45));
	list.push(this.newString(6,40));
}
alphatab.file.alphatex.AlphaTexParser.prototype.error = function(nonterm,expected,symbolError) {
	if(symbolError == null) symbolError = true;
	if(symbolError) {
		throw new alphatab.file.FileFormatException((((((Std.string(this._curChPos) + ": Error on block ") + nonterm) + ", expected a ") + Std.string(expected)) + " found a ") + this._sy);
	}
	else {
		throw new alphatab.file.FileFormatException((((Std.string(this._curChPos) + ": Error on block ") + nonterm) + ", invalid value:") + Std.string(this._syData));
	}
}
alphatab.file.alphatex.AlphaTexParser.prototype.isDigit = function(ch) {
	var code = ch.charCodeAt(0);
	return (code >= 48 && code <= 57) || (ch == "-" && this._allowNegatives);
}
alphatab.file.alphatex.AlphaTexParser.prototype.measure = function(tempo) {
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
		prevHeader.timeSignature.copy(header.timeSignature);
	}
	this.measureMeta(measure);
	tempo.copy(header.tempo);
	this._track.addMeasure(measure);
	while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Pipe && this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) {
		this.beat(measure);
	}
}
alphatab.file.alphatex.AlphaTexParser.prototype.measureMeta = function(measure) {
	var header = measure.header;
	while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.MetaCommand) {
		if(this._syData == "ts") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("timesignature-numerator",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			header.timeSignature.numerator = this._syData;
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("timesignature-denominator",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			header.timeSignature.denominator.value = this._syData;
		}
		else if(this._syData == "ro") {
			header.isRepeatOpen = true;
		}
		else if(this._syData == "rc") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("repeatclose",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			header.repeatClose = Std.parseInt(this._syData) - 1;
		}
		else if(this._syData == "ks") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.String) {
				this.error("keysignature",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			header.keySignature = this.parseKeySignature(this._syData);
		}
		else if(this._syData == "clef") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.String) {
				this.error("clef",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			measure.clef = this.parseClef(this._syData);
		}
		else if(this._syData == "tempo") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("tempo",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			header.tempo.value = this._syData;
		}
		else {
			this.error("measure-effects",alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
		this.newSy();
	}
}
alphatab.file.alphatex.AlphaTexParser.prototype.measures = function() {
	var tempo = this.factory.newTempo();
	tempo.value = this._song.tempo;
	this.measure(tempo);
	while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) {
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Pipe) {
			this.error("measures",alphatab.file.alphatex.AlphaTexSymbols.Pipe);
		}
		this.newSy();
		this.measure(tempo);
	}
}
alphatab.file.alphatex.AlphaTexParser.prototype.metaData = function() {
	while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.MetaCommand) {
		if(this._syData == "title") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.title = this._syData;
			}
			else {
				this.error("title",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "subtitle") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.subtitle = this._syData;
			}
			else {
				this.error("subtitle",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "artist") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.artist = this._syData;
			}
			else {
				this.error("artist",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "album") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.album = this._syData;
			}
			else {
				this.error("album",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "words") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.words = this._syData;
			}
			else {
				this.error("words",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "music") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.music = this._syData;
			}
			else {
				this.error("music",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "copyright") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				this._song.copyright = this._syData;
			}
			else {
				this.error("copyright",alphatab.file.alphatex.AlphaTexSymbols.String);
			}
			this.newSy();
		}
		else if(this._syData == "tempo") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this._song.tempo = this._syData;
			}
			else {
				this.error("tempo",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			this.newSy();
		}
		else if(this._syData == "capo") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this._track.offset = this._syData;
			}
			else {
				this.error("capo",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			this.newSy();
		}
		else if(this._syData == "tuning") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Tuning) {
				this._track.strings = new Array();
				do {
					this._track.strings.push(this.newString(this._track.strings.length + 1,this.parseTuning(this._syData)));
					this.newSy();
				} while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Tuning);
			}
			else {
				this.error("tuning",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
		}
		else {
			this.error("metaDataTags",alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
	}
}
alphatab.file.alphatex.AlphaTexParser.prototype.newString = function(number,value) {
	var str = this.factory.newString();
	str.number = number;
	str.value = value;
	return str;
}
alphatab.file.alphatex.AlphaTexParser.prototype.newSy = function() {
	this._sy = alphatab.file.alphatex.AlphaTexSymbols.No;
	do {
		if(this._ch == String.fromCharCode(0)) {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.Eof;
		}
		else if(this._ch == " " || this._ch == "\n" || this._ch == "\r" || this._ch == "\t") {
			this.nextChar();
		}
		else if(this._ch == "\"" || this._ch == "'") {
			this.nextChar();
			this._syData = "";
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.String;
			while(this._ch != "\"" && this._ch != "'" && this._ch != String.fromCharCode(0)) {
				this._syData += this._ch;
				this.nextChar();
			}
			this.nextChar();
		}
		else if(this._ch == "-") {
			if(this._allowNegatives && this.isDigit(this._ch)) {
				var number = this.readNumber();
				this._sy = alphatab.file.alphatex.AlphaTexSymbols.Number;
				this._syData = -number;
			}
			else {
				this._sy = alphatab.file.alphatex.AlphaTexSymbols.String;
				this._syData = this.readName();
			}
		}
		else if(this._ch == ".") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.Dot;
			this.nextChar();
		}
		else if(this._ch == ":") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.DoubleDot;
			this.nextChar();
		}
		else if(this._ch == "(") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.LParensis;
			this.nextChar();
		}
		else if(this._ch == "\\") {
			this.nextChar();
			var name = this.readName();
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.MetaCommand;
			this._syData = name;
		}
		else if(this._ch == ")") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.RParensis;
			this.nextChar();
		}
		else if(this._ch == "{") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.LBrace;
			this.nextChar();
		}
		else if(this._ch == "}") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.RBrace;
			this.nextChar();
		}
		else if(this._ch == "|") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.Pipe;
			this.nextChar();
		}
		else if(this.isDigit(this._ch)) {
			var number = this.readNumber();
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.Number;
			this._syData = number;
		}
		else if(alphatab.file.alphatex.AlphaTexParser.isLetter(this._ch)) {
			var name = this.readName();
			if(alphatab.file.alphatex.AlphaTexParser.isTuning(name)) {
				this._sy = alphatab.file.alphatex.AlphaTexSymbols.Tuning;
				this._syData = name.toLowerCase();
			}
			else {
				this._sy = alphatab.file.alphatex.AlphaTexSymbols.String;
				this._syData = name;
			}
		}
		else {
			this.error("symbol",alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
	} while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.No);
}
alphatab.file.alphatex.AlphaTexParser.prototype.nextChar = function() {
	this._ch = (this._curChPos < this.data.getSize()?String.fromCharCode(this.data.readByte()):String.fromCharCode(0));
	this._curChPos++;
}
alphatab.file.alphatex.AlphaTexParser.prototype.note = function(beat) {
	if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number && !(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String && (Std.string(this._syData).toLowerCase() == "x" || Std.string(this._syData).toLowerCase() == "-"))) {
		this.error("note-fret",alphatab.file.alphatex.AlphaTexSymbols.Number);
	}
	var isDead = Std.string(this._syData).toLowerCase() == "x";
	var isTie = Std.string(this._syData).toLowerCase() == "-";
	var fret = (isDead || isTie?0:this._syData);
	this.newSy();
	if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Dot) {
		this.error("note",alphatab.file.alphatex.AlphaTexSymbols.Dot);
	}
	this.newSy();
	if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
		this.error("note-string",alphatab.file.alphatex.AlphaTexSymbols.Number);
	}
	var string = this._syData;
	if(string < 1 || string > this._track.stringCount()) {
		this.error("note-string",alphatab.file.alphatex.AlphaTexSymbols.Number,false);
	}
	this.newSy();
	var effect = this.factory.newNoteEffect();
	this.noteEffects(beat,effect);
	var note = this.factory.newNote();
	note.string = string;
	note.effect = effect;
	note.effect.deadNote = isDead;
	note.isTiedNote = isTie;
	note.value = (isTie?this.getTiedNoteValue(string,this._track):fret);
	return note;
}
alphatab.file.alphatex.AlphaTexParser.prototype.noteEffects = function(beat,effect) {
	if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.LBrace) {
		return;
	}
	this.newSy();
	while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
		this._syData = Std.string(this._syData).toLowerCase();
		if(this._syData == "b") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.LParensis) {
				this.error("bend-effect",alphatab.file.alphatex.AlphaTexSymbols.LParensis);
			}
			this.newSy();
			var points = new Array();
			while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) {
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
					this.error("bend-effect-value",alphatab.file.alphatex.AlphaTexSymbols.Number);
				}
				points.push(new alphatab.model.effects.BendPoint(0,Math.abs(this._syData),false));
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
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis) {
				this.error("bend-effect",alphatab.file.alphatex.AlphaTexSymbols.RParensis);
			}
			this.newSy();
		}
		else if(this._syData == "nh") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = alphatab.model.effects.HarmonicType.Natural;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "ah") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = alphatab.model.effects.HarmonicType.Artificial;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "th") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = alphatab.model.effects.HarmonicType.Tapped;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "ph") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = alphatab.model.effects.HarmonicType.Pinch;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "sh") {
			var harmonicEffect = this.factory.newHarmonicEffect();
			harmonicEffect.type = alphatab.model.effects.HarmonicType.Semi;
			effect.harmonic = harmonicEffect;
			this.newSy();
		}
		else if(this._syData == "gr") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number && !(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String && Std.string(this._syData).toLowerCase() == "x")) {
				this.error("grace-effect-fret",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			var isDead = Std.string(this._syData).toLowerCase() == "x";
			var fret = (isDead?0:this._syData);
			this.newSy();
			var duration = 16;
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
				if(this._syData != 16 && this._syData != 32 && this._syData != 64) {
					this._syData = 16;
				}
				duration = this._syData;
				this.newSy();
			}
			var transition = 0;
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				if(this._syData == "s") {
					transition = 1;
					this.newSy();
				}
				else if(this._syData == "b") {
					transition = 2;
					this.newSy();
				}
				else if(this._syData == "h") {
					transition = 3;
					this.newSy();
				}
			}
			var graceEffect = this.factory.newGraceEffect();
			graceEffect.duration = duration;
			graceEffect.fret = fret;
			graceEffect.isDead = isDead;
			graceEffect.transition = transition;
			graceEffect.velocity = 95;
			effect.grace = graceEffect;
		}
		else if(this._syData == "tr") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("trill-effect",alphatab.file.alphatex.AlphaTexSymbols.Number);
			}
			var fret = this._syData;
			this.newSy();
			var duration = 16;
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
				if(this._syData != 16 && this._syData != 32 && this._syData != 64) {
					this._syData = 16;
				}
				duration = this._syData;
				this.newSy();
			}
			var trillEffect = this.factory.newTrillEffect();
			trillEffect.duration.value = duration;
			trillEffect.fret = fret;
			effect.trill = trillEffect;
		}
		else if(this._syData == "tp") {
			this.newSy();
			var duration = 8;
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
				if(this._syData != 8 && this._syData != 16 && this._syData != 32) {
					this._syData = 8;
				}
				duration = this._syData;
				this.newSy();
			}
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
			effect.slideType = 0;
		}
		else if(this._syData == "sf") {
			this.newSy();
			effect.slide = true;
			effect.slideType = 1;
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
		else if(this.applyBeatEffect(beat)) null;
		else {
			this.error(this._syData,alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
	}
	if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RBrace) {
		this.error("note-effect",alphatab.file.alphatex.AlphaTexSymbols.RBrace,false);
	}
	this.newSy();
}
alphatab.file.alphatex.AlphaTexParser.prototype.parseClef = function(str) {
	switch(str.toLowerCase()) {
	case "treble":{
		return 0;
	}break;
	case "bass":{
		return 1;
	}break;
	case "tenor":{
		return 2;
	}break;
	case "alto":{
		return 3;
	}break;
	default:{
		return 0;
	}break;
	}
}
alphatab.file.alphatex.AlphaTexParser.prototype.parseKeySignature = function(str) {
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
alphatab.file.alphatex.AlphaTexParser.prototype.parseTuning = function(str) {
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
			this.error("tuning-value",alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
		base += (octave * 12);
	}
	else {
		this.error("tuning-value",alphatab.file.alphatex.AlphaTexSymbols.String,false);
	}
	return base;
}
alphatab.file.alphatex.AlphaTexParser.prototype.readName = function() {
	var str = "";
	do {
		str += this._ch;
		this.nextChar();
	} while(alphatab.file.alphatex.AlphaTexParser.isLetter(this._ch) || this.isDigit(this._ch));
	return str;
}
alphatab.file.alphatex.AlphaTexParser.prototype.readNumber = function() {
	var str = "";
	do {
		str += this._ch;
		this.nextChar();
	} while(this.isDigit(this._ch));
	return Std.parseInt(str);
}
alphatab.file.alphatex.AlphaTexParser.prototype.readSong = function() {
	this.createDefaultSong();
	this._curChPos = 0;
	this._currentDuration = 4;
	this.nextChar();
	this.newSy();
	this.song();
	return this._song;
}
alphatab.file.alphatex.AlphaTexParser.prototype.song = function() {
	this.metaData();
	if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Dot) {
		this.error("song",alphatab.file.alphatex.AlphaTexSymbols.Dot);
	}
	this.newSy();
	this.measures();
}
alphatab.file.alphatex.AlphaTexParser.prototype.__class__ = alphatab.file.alphatex.AlphaTexParser;
alphatab.tablature.model.MeasureHeaderImpl = function(factory) { if( factory === $_ ) return; {
	alphatab.model.MeasureHeader.apply(this,[factory]);
}}
alphatab.tablature.model.MeasureHeaderImpl.__name__ = ["alphatab","tablature","model","MeasureHeaderImpl"];
alphatab.tablature.model.MeasureHeaderImpl.__super__ = alphatab.model.MeasureHeader;
for(var k in alphatab.model.MeasureHeader.prototype ) alphatab.tablature.model.MeasureHeaderImpl.prototype[k] = alphatab.model.MeasureHeader.prototype[k];
alphatab.tablature.model.MeasureHeaderImpl.prototype._maxClefSpacing = null;
alphatab.tablature.model.MeasureHeaderImpl.prototype._maxKeySignatureSpacing = null;
alphatab.tablature.model.MeasureHeaderImpl.prototype.calculateMeasureChanges = function(layout) {
	var previous = layout.songManager().getPreviousMeasureHeader(this);
	if(previous == null) {
		this.shouldPaintTempo = true;
		this.shouldPaintTripletFeel = this.tripletFeel != 0;
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
alphatab.tablature.model.MeasureHeaderImpl.prototype.getClefSpacing = function(layout,measure) {
	return ((!measure.isPaintClef)?0:this._maxClefSpacing);
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.getFirstNoteSpacing = function(layout,measure) {
	var iTopSpacing = this.getTempoSpacing(layout) + this.getTripletFeelSpacing(layout);
	var iMiddleSpacing = (this.getClefSpacing(layout,measure) + this.getKeySignatureSpacing(layout,measure)) + this.getTimeSignatureSpacing(layout);
	return Math.round(Math.max(iTopSpacing,iMiddleSpacing) + (10 * layout.scale));
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.getKeySignatureSpacing = function(layout,measure) {
	return ((!this.shouldPaintKeySignature)?0:this._maxKeySignatureSpacing);
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.getLeftSpacing = function(layout) {
	return Math.round(15 * layout.scale);
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.getRightSpacing = function(layout) {
	return Math.round(15 * layout.scale);
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.getTempoSpacing = function(layout) {
	return ((this.shouldPaintTempo && this.number == 1?Math.round(45 * layout.scale):0));
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.getTimeSignatureSpacing = function(layout) {
	return ((this.shouldPaintTimeSignature?Math.round(30 * layout.scale):0));
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.getTripletFeelSpacing = function(layout) {
	return ((this.shouldPaintTripletFeel?Math.round(55 * layout.scale):0));
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.maxQuarterSpacing = null;
alphatab.tablature.model.MeasureHeaderImpl.prototype.maxWidth = null;
alphatab.tablature.model.MeasureHeaderImpl.prototype.notifyClefSpacing = function(spacing) {
	this._maxClefSpacing = (((spacing > this._maxClefSpacing)?spacing:this._maxClefSpacing));
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.notifyKeySignatureSpacing = function(spacing) {
	this._maxKeySignatureSpacing = (((spacing > this._maxKeySignatureSpacing)?spacing:this._maxKeySignatureSpacing));
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.notifyQuarterSpacing = function(spacing) {
	this.maxQuarterSpacing = (((spacing > this.maxQuarterSpacing)?spacing:this.maxQuarterSpacing));
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.notifyWidth = function(width) {
	this.maxWidth = (((width > this.maxWidth)?width:this.maxWidth));
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.reset = function() {
	this.maxWidth = 0;
	this.maxQuarterSpacing = 0;
	this.shouldPaintTempo = false;
	this.shouldPaintTimeSignature = false;
	this.shouldPaintKeySignature = false;
	this.shouldPaintTripletFeel = false;
	this._maxClefSpacing = 0;
	this._maxKeySignatureSpacing = 0;
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.shouldPaintKeySignature = null;
alphatab.tablature.model.MeasureHeaderImpl.prototype.shouldPaintTempo = null;
alphatab.tablature.model.MeasureHeaderImpl.prototype.shouldPaintTimeSignature = null;
alphatab.tablature.model.MeasureHeaderImpl.prototype.shouldPaintTripletFeel = null;
alphatab.tablature.model.MeasureHeaderImpl.prototype.update = function(layout,track) {
	this.reset();
	this.calculateMeasureChanges(layout);
	var measure = track.measures[this.number - 1];
	measure.calculateMeasureChanges(layout);
}
alphatab.tablature.model.MeasureHeaderImpl.prototype.__class__ = alphatab.tablature.model.MeasureHeaderImpl;
alphatab.model.MidiChannel = function(p) { if( p === $_ ) return; {
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
alphatab.model.MidiChannel.__name__ = ["alphatab","model","MidiChannel"];
alphatab.model.MidiChannel.prototype._instrument = null;
alphatab.model.MidiChannel.prototype.balance = null;
alphatab.model.MidiChannel.prototype.channel = null;
alphatab.model.MidiChannel.prototype.chorus = null;
alphatab.model.MidiChannel.prototype.copy = function(channel) {
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
alphatab.model.MidiChannel.prototype.effectChannel = null;
alphatab.model.MidiChannel.prototype.instrument = function(newInstrument) {
	if(newInstrument == null) newInstrument = -1;
	if(newInstrument != -1) this._instrument = newInstrument;
	return (this.isPercussionChannel()?0:this._instrument);
}
alphatab.model.MidiChannel.prototype.isPercussionChannel = function() {
	return this.channel == 9;
}
alphatab.model.MidiChannel.prototype.phaser = null;
alphatab.model.MidiChannel.prototype.reverb = null;
alphatab.model.MidiChannel.prototype.tremolo = null;
alphatab.model.MidiChannel.prototype.volume = null;
alphatab.model.MidiChannel.prototype.__class__ = alphatab.model.MidiChannel;
alphatab.model.MixTableItem = function(p) { if( p === $_ ) return; {
	this.value = 0;
	this.duration = 0;
	this.allTracks = false;
}}
alphatab.model.MixTableItem.__name__ = ["alphatab","model","MixTableItem"];
alphatab.model.MixTableItem.prototype.allTracks = null;
alphatab.model.MixTableItem.prototype.duration = null;
alphatab.model.MixTableItem.prototype.value = null;
alphatab.model.MixTableItem.prototype.__class__ = alphatab.model.MixTableItem;
alphatab.model.effects.BendEffect = function(p) { if( p === $_ ) return; {
	this.type = 0;
	this.value = 0;
	this.points = new Array();
}}
alphatab.model.effects.BendEffect.__name__ = ["alphatab","model","effects","BendEffect"];
alphatab.model.effects.BendEffect.prototype.clone = function(factory) {
	var effect = factory.newBendEffect();
	effect.value = this.value;
	effect.type = this.type;
	{
		var _g1 = 0, _g = this.points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.points[i];
			effect.points.push(new alphatab.model.effects.BendPoint(point.position,point.value,point.vibrato));
		}
	}
	return effect;
}
alphatab.model.effects.BendEffect.prototype.points = null;
alphatab.model.effects.BendEffect.prototype.type = null;
alphatab.model.effects.BendEffect.prototype.value = null;
alphatab.model.effects.BendEffect.prototype.__class__ = alphatab.model.effects.BendEffect;
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
alphatab.model.NoteEffect = function(p) { if( p === $_ ) return; {
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
alphatab.model.NoteEffect.__name__ = ["alphatab","model","NoteEffect"];
alphatab.model.NoteEffect.prototype.accentuatedNote = null;
alphatab.model.NoteEffect.prototype.bend = null;
alphatab.model.NoteEffect.prototype.clone = function(factory) {
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
alphatab.model.NoteEffect.prototype.deadNote = null;
alphatab.model.NoteEffect.prototype.ghostNote = null;
alphatab.model.NoteEffect.prototype.grace = null;
alphatab.model.NoteEffect.prototype.hammer = null;
alphatab.model.NoteEffect.prototype.harmonic = null;
alphatab.model.NoteEffect.prototype.heavyAccentuatedNote = null;
alphatab.model.NoteEffect.prototype.isBend = function() {
	return this.bend != null && this.bend.points.length != 0;
}
alphatab.model.NoteEffect.prototype.isFingering = null;
alphatab.model.NoteEffect.prototype.isGrace = function() {
	return this.grace != null;
}
alphatab.model.NoteEffect.prototype.isHarmonic = function() {
	return this.harmonic != null;
}
alphatab.model.NoteEffect.prototype.isTremoloPicking = function() {
	return this.tremoloPicking != null;
}
alphatab.model.NoteEffect.prototype.isTrill = function() {
	return this.trill != null;
}
alphatab.model.NoteEffect.prototype.leftHandFinger = null;
alphatab.model.NoteEffect.prototype.letRing = null;
alphatab.model.NoteEffect.prototype.palmMute = null;
alphatab.model.NoteEffect.prototype.rightHandFinger = null;
alphatab.model.NoteEffect.prototype.slide = null;
alphatab.model.NoteEffect.prototype.slideType = null;
alphatab.model.NoteEffect.prototype.staccato = null;
alphatab.model.NoteEffect.prototype.tremoloPicking = null;
alphatab.model.NoteEffect.prototype.trill = null;
alphatab.model.NoteEffect.prototype.vibrato = null;
alphatab.model.NoteEffect.prototype.__class__ = alphatab.model.NoteEffect;
$Main = function() { }
$Main.__name__ = ["@Main"];
$Main.prototype.__class__ = $Main;
$_ = {}
js.Boot.__res = {}
js.Boot.__init();
{
	js["XMLHttpRequest"] = (window.XMLHttpRequest?XMLHttpRequest:(window.ActiveXObject?function() {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch( $e5 ) {
			{
				var e = $e5;
				{
					try {
						return new ActiveXObject("Microsoft.XMLHTTP");
					}
					catch( $e6 ) {
						{
							var e1 = $e6;
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
alphatab.midi.MidiSequenceParserFlags.ADD_DEFAULT_CONTROLS = 1;
alphatab.midi.MidiSequenceParserFlags.ADD_MIXER_MESSAGES = 2;
alphatab.midi.MidiSequenceParserFlags.ADD_METRONOME = 4;
alphatab.midi.MidiSequenceParserFlags.ADD_FIRST_TICK_MOVE = 8;
alphatab.midi.MidiSequenceParserFlags.DEFAULT_PLAY_FLAGS = 15;
alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES = [[12,12],[9,28],[5,28],[7,19],[4,28],[3,31]];
alphatab.midi.MidiController.ALL_NOTES_OFF = 123;
alphatab.midi.MidiController.BALANCE = 10;
alphatab.midi.MidiController.CHORUS = 93;
alphatab.midi.MidiController.DATA_ENTRY_LSB = 38;
alphatab.midi.MidiController.DATA_ENTRY_MSB = 6;
alphatab.midi.MidiController.EXPRESSION = 11;
alphatab.midi.MidiController.PHASER = 95;
alphatab.midi.MidiController.REVERB = 91;
alphatab.midi.MidiController.RPN_LSB = 100;
alphatab.midi.MidiController.RPN_MBS = 101;
alphatab.midi.MidiController.TREMOLO = 92;
alphatab.midi.MidiController.VOLUME = 7;
alphatab.midi.MidiMessageUtils.TICK_MOVE = 1;
alphatab.model.HeaderFooterElements.NONE = 0;
alphatab.model.HeaderFooterElements.TITLE = 1;
alphatab.model.HeaderFooterElements.SUBTITLE = 2;
alphatab.model.HeaderFooterElements.ARTIST = 4;
alphatab.model.HeaderFooterElements.ALBUM = 8;
alphatab.model.HeaderFooterElements.WORDS = 16;
alphatab.model.HeaderFooterElements.MUSIC = 32;
alphatab.model.HeaderFooterElements.WORDS_AND_MUSIC = 64;
alphatab.model.HeaderFooterElements.COPYRIGHT = 128;
alphatab.model.HeaderFooterElements.PAGE_NUMBER = 256;
alphatab.model.HeaderFooterElements.ALL = 511;
alphatab.model.effects.GraceEffectTransition.None = 0;
alphatab.model.effects.GraceEffectTransition.Slide = 1;
alphatab.model.effects.GraceEffectTransition.Bend = 2;
alphatab.model.effects.GraceEffectTransition.Hammer = 3;
alphatab.tablature.model.ChordImpl.MAX_FRETS = 6;
alphatab.model.Duration.QUARTER_TIME = 960;
alphatab.model.Duration.WHOLE = 1;
alphatab.model.Duration.HALF = 2;
alphatab.model.Duration.QUARTER = 4;
alphatab.model.Duration.EIGHTH = 8;
alphatab.model.Duration.SIXTEENTH = 16;
alphatab.model.Duration.THIRTY_SECOND = 32;
alphatab.model.Duration.SIXTY_FOURTH = 64;
alphatab.model.VoiceDirection.None = 0;
alphatab.model.VoiceDirection.Up = 1;
alphatab.model.VoiceDirection.Down = 2;
alphatab.model.TripletFeel.None = 0;
alphatab.model.TripletFeel.Eighth = 1;
alphatab.model.TripletFeel.Sixteenth = 2;
alphatab.model.Beat.MAX_VOICES = 2;
alphatab.file.guitarpro.GpReaderBase.DEFAULT_CHARSET = "UTF-8";
alphatab.file.guitarpro.GpReaderBase.BEND_POSITION = 60;
alphatab.file.guitarpro.GpReaderBase.BEND_SEMITONE = 25;
alphatab.tablature.drawing.MusicFont.Num1 = "m 2.36 14.48 c 0 -3.87 0 -7.74 0 -11.61 C 1.69 4.15 1.01 5.42 0.34 6.7 0.23 6.54 -0.11 6.44 0.06 6.22 0.83 4.14 1.59 2.07 2.36 -8.04e-8 c 1.09 0 2.18 0 3.26 0 0 4.81 0 9.62 0 14.43 0.11 0.73 1 0.75 1.57 0.86 0 0.24 0 0.47 0 0.71 -2.13 0 -4.25 0 -6.38 0 0 -0.22 0 -0.44 0 -0.66 C 1.34 15.22 1.98 15.2 2.31 14.7 l 0.04 -0.11 0.01 -0.11 0 0 z";
alphatab.tablature.drawing.MusicFont.Num2 = "M 3.85 1.11 C 3.32 1.21 2.1 1.37 2.27 2.07 2.67 2.48 3.62 2.08 4.03 2.69 4.75 3.6 4.54 5.13 3.54 5.77 2.47 6.55 0.7 5.98 0.42 4.65 0.08 3.16 0.99 1.68 2.2 0.89 3.47 -0.05 5.13 -0.15 6.63 0.14 8.35 0.44 10.17 1.45 10.71 3.21 11.09 4.36 10.77 5.67 9.91 6.52 8.88 7.62 7.45 8.16 6.21 8.97 5.29 9.48 4.4 10.07 3.69 10.86 3.15 11.41 2.75 12.06 2.32 12.69 3.58 11.96 5.15 11.47 6.56 12.08 c 0.95 0.31 1.61 1.07 2.42 1.6 0.8 0.43 1.88 -0.18 2.04 -1.06 0.14 -0.38 -0.08 -1.05 0.51 -0.88 0 1.34 -0.22 2.91 -1.38 3.76 -1.28 0.84 -2.98 0.49 -4.21 -0.25 -1.07 -0.69 -2.23 -1.52 -3.58 -1.31 -0.7 0.04 -1.55 0.4 -1.55 1.21 0.03 0.51 -0.25 0.64 -0.69 0.57 C -0.13 15.35 0.24 14.47 0.46 13.97 1.46 11.79 3.35 10.24 4.96 8.53 6.02 7.37 7.19 6.26 7.94 4.87 8.18 4.24 7.99 3.53 7.75 2.92 7.1 1.44 5.3 1.1 3.85 1.11 z";
alphatab.tablature.drawing.MusicFont.Num3 = "M 3.22 8.29 C 3.23 8.01 3.1 7.62 3.54 7.72 4.49 7.43 5.46 7.06 6.26 6.45 7.1 5.78 7.29 4.61 7.05 3.61 6.73 2.07 5.23 0.71 3.6 0.92 2.89 0.97 2.15 1.23 1.72 1.82 1.74 2.68 3.01 2.05 3.3 2.84 3.67 3.53 3.69 4.51 3.15 5.12 2.55 5.68 1.58 5.71 0.85 5.42 0.01 5.03 -0.06 3.95 0.03 3.15 0.13 1.84 1.12 0.72 2.37 0.37 3.58 0.02 4.88 -0.09 6.13 0.08 8.23 0.48 10.01 2.41 9.97 4.59 9.99 5.54 9.71 6.56 8.9 7.13 8.55 7.51 7.7 7.79 7.51 8.03 8.58 8.44 9.59 9.24 9.84 10.4 10.24 11.96 9.69 13.7 8.45 14.73 7.42 15.7 5.97 16.12 4.57 15.99 3.13 15.92 1.48 15.62 0.59 14.37 -0.04 13.45 -0.17 12.21 0.2 11.17 0.58 10.38 1.62 10.33 2.38 10.46 c 0.72 0.1 1.21 0.8 1.18 1.51 0.05 0.67 -0.18 1.54 -0.95 1.67 -0.44 0.08 -1.01 -0.03 -0.69 0.57 0.43 0.7 1.47 0.83 2.25 0.83 C 5.8 14.9 7.14 13.37 7.18 11.75 7.33 10.64 6.6 9.62 5.64 9.14 4.9 8.75 4.13 8.36 3.29 8.31 c -0.03 0 -0.05 -0.01 -0.08 -0.01 z";
alphatab.tablature.drawing.MusicFont.Num4 = "M 8.59 0 C 7.19 2.33 5.9 4.72 4.32 6.93 3.6 7.94 2.96 9.02 2.27 10.05 c -0.32 0.5 -0.65 1 -0.97 1.51 1.39 0 2.78 0 4.17 0 0 -1.73 0 -3.45 0 -5.18 C 6.65 5.4 7.83 4.42 9.01 3.44 c 0 2.71 0 5.42 0 8.12 0.5 0 1 0 1.5 0 0 0.24 0 0.47 0 0.71 -0.5 0 -1 0 -1.5 0 0.07 0.8 -0.13 1.72 0.32 2.42 0.26 0.44 1.11 0.34 1.18 0.79 -0.05 0.19 0.14 0.61 -0.19 0.52 -2.14 0 -4.29 0 -6.43 0 0 -0.24 0 -0.47 0 -0.71 0.55 -0.2 1.46 -0.31 1.48 -1.05 0.05 -0.65 0.06 -1.31 0.11 -1.97 -1.82 0 -3.65 0 -5.47 0 C 0 12.03 0 11.8 0 11.56 1.69 10.37 2.77 8.48 3.38 6.55 3.79 4.36 4.2 2.18 4.61 0 5.94 0 7.26 0 8.59 0 z";
alphatab.tablature.drawing.MusicFont.Num5 = "M 0.66 0 C 1.76 0.32 2.92 0.45 4.06 0.55 5.57 0.61 7.1 0.43 8.57 0.05 8.59 0.92 8.37 1.88 7.62 2.41 7 2.88 6.18 2.89 5.45 3 4.24 3.07 3.01 2.97 1.83 2.7 1.48 2.4 1.68 3.01 1.62 3.22 c 0 1.27 0 2.53 0 3.8 0.82 -0.93 2.05 -1.53 3.31 -1.39 1.75 0.04 3.55 1 4.22 2.68 C 9.94 10.33 9.22 12.72 7.73 14.23 6.61 15.47 4.92 16.14 3.26 15.99 2.03 15.88 0.67 15.28 0.25 14.04 -0.02 13.19 -0.16 12.2 0.25 11.37 0.73 10.53 1.87 10.47 2.71 10.7 3.53 10.9 3.87 11.82 3.79 12.59 3.8 13.31 3.33 14.07 2.56 14.13 2.18 14.28 1.61 14.49 2.22 14.78 3.24 15.48 4.8 15.51 5.7 14.58 6.89 13.39 7.07 11.57 7 9.96 6.89 8.75 6.37 7.41 5.22 6.84 3.97 6.29 2.37 6.8 1.68 7.98 1.53 8.17 1.19 8.03 0.96 8.07 0.62 8.17 0.64 7.92 0.66 7.66 c 0 -2.55 0 -5.11 0 -7.66 z";
alphatab.tablature.drawing.MusicFont.Num6 = "M 7.93 1.53 C 7.56 0.85 6.71 0.49 5.94 0.52 4.82 0.56 4.18 1.66 3.88 2.62 3.35 4.32 3.15 6.16 3.49 7.93 3.54 8.37 3.92 8.63 4.13 8.12 5.06 7.07 6.65 6.72 7.97 7.14 9.42 7.71 10.23 9.29 10.37 10.77 10.53 12.37 9.98 14.11 8.63 15.06 6.81 16.44 3.96 16.31 2.39 14.6 0.9 12.97 0.19 10.75 0.04 8.58 -0.18 6.28 0.56 3.93 2.03 2.15 3.04 0.86 4.6 -0.11 6.28 0.01 7.59 0.02 8.97 0.64 9.54 1.88 9.98 2.82 10.18 4.13 9.38 4.95 8.96 5.48 8.26 5.69 7.61 5.5 6.9 5.4 6.31 4.82 6.25 4.1 6.08 3.28 6.33 2.33 7.09 1.89 7.34 1.71 7.62 1.57 7.93 1.53 z M 7.71 11.72 C 7.67 10.66 7.76 9.51 7.19 8.56 6.59 7.5 4.72 7.59 4.31 8.78 3.84 10.14 3.82 11.61 3.98 13.03 c 0.14 0.82 0.31 1.87 1.2 2.2 0.72 0.29 1.63 -0.01 1.94 -0.74 0.41 -0.86 0.57 -1.82 0.59 -2.77 z";
alphatab.tablature.drawing.MusicFont.Num7 = "M 2.97 16 C 3.15 14.66 3.24 13.27 3.84 12.02 4.33 10.82 5.19 9.83 6.14 8.96 7.36 7.69 8.64 6.4 9.38 4.79 9.59 4.25 9.66 3.67 9.79 3.12 8.69 3.83 7.34 4.39 6.02 3.99 4.95 3.75 4.06 3.09 3.08 2.65 2.38 2.35 1.34 2.38 0.98 3.17 0.78 3.58 0.62 3.96 0.12 3.83 -0.13 3.85 0.06 3.43 0 3.26 0 2.34 0 1.43 0 0.52 0.38 0.45 0.63 0.56 0.69 0.97 0.88 1.7 1.76 1.48 2.19 1.12 2.92 0.67 3.64 0.1 4.52 0 5.48 -0.03 6.3 0.52 7.07 1.02 7.73 1.37 8.7 1.7 9.31 1.08 9.75 0.84 9.47 -0.08 10.01 0 10.28 -0.03 10.5 -0.03 10.4 0.31 10.38 1.58 10.46 2.86 10.34 4.13 10.24 5.12 9.88 6.06 9.33 6.89 8.72 7.98 8.01 9.02 7.45 10.13 6.91 11.48 6.76 12.95 6.73 14.38 6.68 14.88 7.04 15.76 6.69 16 5.45 16 4.21 16 2.97 16 z";
alphatab.tablature.drawing.MusicFont.Num8 = "M 6.97 7.18 C 7.96 7.59 8.61 8.51 9.23 9.34 9.71 9.98 9.88 10.8 9.76 11.58 9.66 13.11 8.81 14.58 7.46 15.33 5.48 16.48 2.64 16.15 1.15 14.34 0.26 13.3 -0.1 11.87 0.02 10.52 0.3 9.39 1.21 8.5 2.2 7.94 2.89 7.75 1.76 7.47 1.61 7.13 0.1 5.63 -0.1 2.86 1.5 1.35 3.29 -0.4 6.51 -0.5 8.27 1.36 9.09 2.23 9.43 3.49 9.31 4.67 9.04 5.65 8.25 6.4 7.43 6.95 7.29 7.04 7.13 7.12 6.97 7.18 z M 6.16 6.54 C 7.34 6 8.09 4.61 7.81 3.32 7.66 2.1 6.72 0.95 5.45 0.81 4.37 0.6 3.18 1.02 2.61 1.99 2.22 2.58 2.07 3.48 2.66 4 3.69 5.04 5.13 5.51 6.16 6.54 z M 3.17 8.44 C 2.19 8.9 1.31 9.78 1.26 10.92 1.11 12.72 2.32 14.69 4.17 15.01 5.32 15.21 6.73 15.01 7.4 13.94 7.83 13.37 7.9 12.54 7.43 11.97 6.35 10.42 4.51 9.72 3.17 8.44 z";
alphatab.tablature.drawing.MusicFont.Num9 = "m 2.46 14.47 c 0.29 0.65 1.09 0.94 1.76 1.01 1.1 0.1 1.93 -0.87 2.24 -1.83 0.55 -1.74 0.69 -3.61 0.43 -5.41 C 6.87 7.79 6.47 7.26 6.22 7.88 5.24 8.98 3.53 9.34 2.18 8.77 0.99 8.19 0.32 6.88 0.07 5.62 -0.22 3.91 0.3 1.97 1.76 0.94 3.55 -0.42 6.33 -0.31 7.93 1.3 9.74 3.09 10.4 5.74 10.39 8.22 10.41 10.83 9.17 13.42 7.12 15.04 5.69 16.16 3.56 16.33 1.99 15.41 0.83 14.66 0.19 13.12 0.55 11.77 0.85 10.85 1.86 10.24 2.82 10.48 c 0.72 0.09 1.28 0.71 1.33 1.42 0.19 0.86 -0.16 1.8 -0.92 2.27 -0.23 0.16 -0.49 0.27 -0.76 0.3 z M 2.68 4.28 C 2.73 5.38 2.62 6.6 3.28 7.56 3.94 8.53 5.67 8.32 6.03 7.18 6.54 5.72 6.61 4.13 6.36 2.61 6.23 1.73 5.67 0.71 4.67 0.67 3.84 0.55 3.14 1.22 2.98 1.99 2.76 2.73 2.68 3.51 2.68 4.28 z";
alphatab.tablature.drawing.MusicFont.TrebleClef = "m 12.59 0 c 2.7 1.29 2.98 5.15 3.47 7.79 0.22 4.83 -1.46 9.94 -5.32 13.04 0.32 1.61 0.63 3.22 0.95 4.83 3.43 -0.81 7.18 1.04 8.41 4.39 1.63 3.61 0.97 8.6 -2.85 10.54 -2.1 0.44 -2.9 1.25 -2.1 3.23 0.27 2.38 1.27 4.75 0.81 7.14 -1.19 3.63 -6.7 5.59 -9.39 2.39 C 3.23 51.02 5.74 45.06 9.8 46.71 13.45 47.85 11.75 53.84 8.1 53 c 2.3 2.55 6.27 0.67 7.16 -2.21 0.42 -2.48 -0.55 -4.95 -0.84 -7.42 C 14.64 40.51 11.15 42.78 9.42 41.93 2.94 41.14 -2.13 33.51 0.9 27.4 2.85 23.29 5.93 19.8 9.2 16.68 8.1 12.71 7.19 8.36 8.84 4.39 9.55 2.66 10.4 0.17 12.59 0 z M 11 25.71 c -0.28 -1.46 -0.57 -2.93 -0.85 -4.39 -3.08 3.09 -6.5 6.49 -7.28 10.97 -0.78 5 4.52 9.16 9.2 8.84 2.38 0.26 1.53 -1.63 1.24 -3.06 -0.62 -3.07 -1.24 -6.14 -1.86 -9.21 -3.95 0.27 -6.15 6.08 -2.88 8.62 0.75 1.11 5.35 2.82 1.83 1.77 C 6.94 37.88 4.59 33.92 5.95 30.3 6.7 28.02 8.65 26.22 11 25.71 z m 3.78 -19.02 c 0.53 -3.18 -3.29 -3.92 -4 -0.83 -1.76 3.04 -1.8 6.6 -1.05 9.94 0.96 0.42 3.17 -2.31 3.81 -3.67 0.95 -1.63 1.59 -3.55 1.24 -5.45 z m -2.54 22.17 c 0.75 3.81 1.5 7.63 2.24 11.44 3.92 -0.62 5.81 -5.58 3.62 -8.78 -1.23 -1.94 -3.6 -2.98 -5.86 -2.66 z";
alphatab.tablature.drawing.MusicFont.AltoClef = "M 0 32 C 0 21.38 0 10.77 0 0.15 c 1.33 0 2.66 0 3.99 0 0 10.62 0 21.23 0 31.85 C 2.66 32 1.33 32 0 32 z m 5.35 0 c 0 -10.62 0 -21.23 0 -31.85 0.39 0.09 1.17 -0.19 1.31 0.16 0 10.57 0 21.13 0 31.7 -0.44 0 -0.87 0 -1.31 0 z M 9.34 18.17 C 8.85 17.25 7.32 16.44 7.05 15.9 c 2.11 -1.25 3.59 -3.49 3.95 -5.92 0.15 1.3 0.74 2.78 2.15 3.09 1.39 0.43 3.17 0.18 3.92 -1.22 C 18.24 9.71 18.15 7.13 17.95 4.76 17.78 3.06 16.96 0.96 15.02 0.72 13.91 0.57 11.57 0.97 11.76 2.28 c 1.28 -0.3 2.92 0.73 2.5 2.19 -0.37 1.9 -3.18 2.09 -4.2 0.62 -1.03 -1.34 0.04 -3.16 1.27 -3.94 2.83 -1.99 7.29 -1.4 9.27 1.53 2.17 3.1 1.38 7.77 -1.6 10.08 -1.75 1.45 -4.25 2.14 -6.46 1.5 -1.25 -0.78 -1.4 1.51 -2.65 1.79 1.22 0.33 1.47 2.76 2.71 1.95 1.83 -0.61 3.93 -0.16 5.57 0.79 2.67 1.56 4.19 4.78 3.65 7.83 -0.43 3.08 -3.39 5.43 -6.46 5.38 -2.28 0.13 -4.93 -1.05 -5.57 -3.4 -0.57 -2.02 2.25 -3.54 3.76 -2.24 1.14 0.73 1.13 2.73 -0.26 3.18 -0.66 0.26 -2.36 0.07 -1.07 1.03 1.43 1.1 3.86 1.14 4.88 -0.54 1.23 -2.05 1.09 -4.59 0.9 -6.89 -0.21 -1.71 -0.87 -3.95 -2.84 -4.27 -1.35 -0.16 -3.1 0.14 -3.59 1.62 -0.35 0.58 -0.41 2.41 -0.61 0.83 -0.29 -1.15 -0.86 -2.23 -1.61 -3.14 z";
alphatab.tablature.drawing.MusicFont.TenorClef = "M 0 32 C 0 21.38 0 10.77 0 0.15 c 1.33 0 2.66 0 3.99 0 0 10.62 0 21.23 0 31.85 C 2.66 32 1.33 32 0 32 z m 5.35 0 c 0 -10.62 0 -21.23 0 -31.85 0.39 0.09 1.17 -0.19 1.31 0.16 0 10.57 0 21.13 0 31.7 -0.44 0 -0.87 0 -1.31 0 z M 9.34 18.17 C 8.85 17.25 7.32 16.44 7.05 15.9 c 2.11 -1.25 3.59 -3.49 3.95 -5.92 0.15 1.3 0.74 2.78 2.15 3.09 1.39 0.43 3.17 0.18 3.92 -1.22 C 18.24 9.71 18.15 7.13 17.95 4.76 17.78 3.06 16.96 0.96 15.02 0.72 13.91 0.57 11.57 0.97 11.76 2.28 c 1.28 -0.3 2.92 0.73 2.5 2.19 -0.37 1.9 -3.18 2.09 -4.2 0.62 -1.03 -1.34 0.04 -3.16 1.27 -3.94 2.83 -1.99 7.29 -1.4 9.27 1.53 2.17 3.1 1.38 7.77 -1.6 10.08 -1.75 1.45 -4.25 2.14 -6.46 1.5 -1.25 -0.78 -1.4 1.51 -2.65 1.79 1.22 0.33 1.47 2.76 2.71 1.95 1.83 -0.61 3.93 -0.16 5.57 0.79 2.67 1.56 4.19 4.78 3.65 7.83 -0.43 3.08 -3.39 5.43 -6.46 5.38 -2.28 0.13 -4.93 -1.05 -5.57 -3.4 -0.57 -2.02 2.25 -3.54 3.76 -2.24 1.14 0.73 1.13 2.73 -0.26 3.18 -0.66 0.26 -2.36 0.07 -1.07 1.03 1.43 1.1 3.86 1.14 4.88 -0.54 1.23 -2.05 1.09 -4.59 0.9 -6.89 -0.21 -1.71 -0.87 -3.95 -2.84 -4.27 -1.35 -0.16 -3.1 0.14 -3.59 1.62 -0.35 0.58 -0.41 2.41 -0.61 0.83 -0.29 -1.15 -0.86 -2.23 -1.61 -3.14 z";
alphatab.tablature.drawing.MusicFont.BassClef = "M 4.44 2.42 C 3.48 3.2 3.45 5.34 4.96 5.44 6.05 5.76 7.62 5.57 8.09 6.88 8.46 8 8.36 9.52 7.18 10.13 5.64 11.02 3.46 11.09 2.03 9.94 0.65 8.76 0.96 6.72 1.42 5.18 2.1 3.05 3.6 0.9 5.9 0.38 c 3.09 -0.82 6.79 -0.41 9.09 2 2.38 2.38 3.52 6.21 2.02 9.35 -1.51 3.28 -4.31 5.71 -7.08 7.91 -2.66 2.01 -5.53 3.78 -8.59 5.11 -0.49 0.46 -1.68 0.21 -1.19 -0.4 C 3.76 22.94 7.03 20.65 9.63 17.79 11.95 15.13 12.83 11.53 13 8.08 13.12 5.82 12.46 3.29 10.45 2 8.62 0.77 6.09 0.99 4.44 2.42 z M 20.84 2.57 c 1.6 -0.11 2.58 2.03 1.54 3.21 -0.89 1.19 -3.02 0.83 -3.39 -0.64 -0.43 -1.24 0.53 -2.58 1.85 -2.57 z m 0 7.01 c 1.6 -0.11 2.58 2.03 1.54 3.21 -0.89 1.19 -3.02 0.83 -3.39 -0.64 -0.43 -1.23 0.54 -2.59 1.85 -2.57 z";
alphatab.tablature.drawing.MusicFont.TripletFeel8 = "m 24.36 19.36 c 2.02 0 4.05 0 6.07 0 0.13 -0.91 -1.28 -0.27 -1.87 -0.46 -1.4 0 -2.8 0 -4.2 0 0 0.15 0 0.31 0 0.46 z m 0 1.86 c 2.02 -0.02 4.07 0.04 6.07 -0.03 0.16 -0.94 -1.24 -0.3 -1.8 -0.49 -1.42 0 -2.84 0 -4.26 0 1.4e-5 0.17 -2.7e-5 0.35 1.8e-5 0.52 z M 38.01 5.56 c -0.02 5.52 0.04 11.04 -0.03 16.55 -0.24 2.29 -3.95 4.19 -5.23 1.73 -0.79 -2.65 3.29 -4.74 4.89 -3.15 0 -5.04 0 -10.09 0 -15.13 0.12 1.28e-4 0.25 -3.18e-4 0.37 3.77e-4 z m -16.45 0 c -0.02 5.52 0.04 11.04 -0.03 16.55 -0.23 2.27 -3.95 4.2 -5.21 1.73 -0.75 -2.47 3.01 -4.95 4.87 -3.02 0 -4.4 0 -8.8 0 -13.21 -2.92 0 -5.84 0 -8.76 0 -0.02 4.83 0.04 9.67 -0.03 14.5 -0.23 2.28 -3.96 4.2 -5.22 1.73 -0.81 -2.65 3.28 -4.74 4.88 -3.15 0 -5.04 0 -10.09 0 -15.13 3.17 5.03e-4 6.34 0 9.5 7.55e-4 z M 1.22 18.4 c -0.17 2.26 0.72 4.54 2.62 5.84 C 4.83 25.09 2.04 23.4 1.79 22.77 -0.18 20.74 -0.63 17.36 1.12 15.05 1.67 13.94 3.72 12.2 4.07 12.38 2.04 13.75 1.02 15.97 1.22 18.4 z m 54.61 0 c 0.17 2.26 -0.72 4.54 -2.62 5.84 -0.99 0.85 1.8 -0.84 2.05 -1.47 1.97 -2.04 2.42 -5.41 0.67 -7.73 -0.55 -1.11 -2.61 -2.84 -2.95 -2.66 2.02 1.36 3.04 3.58 2.85 6.01 z M 47.2 5.56 c 0.16 2.22 2.22 3.33 3.46 4.91 2.35 2.49 1.74 6.43 -0.23 8.95 0.24 -1.29 1.6 -3.21 1.07 -4.96 -0.39 -2.26 -2.25 -4.05 -4.36 -4.78 -0.02 4.14 0.04 8.29 -0.03 12.43 -0.21 2.29 -3.95 4.19 -5.21 1.73 -0.75 -2.48 3.02 -4.95 4.88 -3.02 0 -5.09 0 -10.17 0 -15.26 0.14 3.77e-4 0.28 -6.55e-4 0.42 3.77e-4 z M 39.84 2.19 c -0.03 0.75 -1.39 0.18 -1.99 0.36 -0.67 0.08 -1.88 -0.37 -1.52 0.75 0.18 1.15 -0.39 1.34 -0.24 0.09 -0.2 -0.97 0.1 -1.44 1.12 -1.19 0.88 0 1.75 0 2.63 0 z m 9.04 0 C 48.8 2.87 49.06 3.9 48.76 4.37 48.3 4.09 49.03 2.63 48.38 2.54 c -1.08 0 -2.16 0 -3.25 0 0.03 -0.75 1.39 -0.18 1.99 -0.36 0.58 0 1.17 0 1.75 0 z m -7.12 0.15 c 1.28 -0.03 2.54 -2.28 0.38 -2.02 -0.98 0.3 0.97 0.93 -0.44 1.44 -2.45 -0.8 3.03 -3.31 2.65 -0.47 -0.36 1.15 -1.5 0.72 -0.52 1.75 0.03 2.63 -5.38 1.26 -2.65 -0.3 1.73 0.44 -1.53 1.48 0.33 1.58 1.32 -0.08 2.02 -1.92 0.25 -1.98 z";
alphatab.tablature.drawing.MusicFont.TripletFeel16 = "m 24.36 19.36 c 2.02 0 4.05 0 6.07 0 0.12 -0.89 -1.29 -0.25 -1.87 -0.45 -1.4 0 -2.8 0 -4.2 0 0 0.15 0 0.3 0 0.45 z m 0 1.86 c 2.02 -0.02 4.07 0.04 6.07 -0.03 0.16 -0.94 -1.24 -0.3 -1.8 -0.49 -1.42 0 -2.84 0 -4.26 0 5e-6 0.17 -9e-6 0.35 6e-6 0.52 z M 1.22 18.4 c -0.17 2.26 0.72 4.54 2.62 5.86 0.99 0.86 -1.81 -0.84 -2.05 -1.47 -1.97 -2.04 -2.42 -5.41 -0.67 -7.73 0.55 -1.11 2.61 -2.85 2.95 -2.66 -2.02 1.36 -3.04 3.58 -2.85 6.01 z m 54.61 0 c 0.17 2.26 -0.72 4.54 -2.62 5.86 -0.99 0.86 1.81 -0.84 2.05 -1.47 1.97 -2.04 2.42 -5.41 0.67 -7.73 -0.55 -1.11 -2.61 -2.84 -2.95 -2.66 2.04 1.39 3.03 3.55 2.85 6.01 z M 39.84 2.19 c -0.01 0.77 -1.39 0.19 -1.99 0.37 -0.67 0.08 -1.87 -0.37 -1.5 0.75 0.2 0.99 -0.41 1.5 -0.25 0.21 -0.1 -0.87 -0.1 -1.65 1 -1.33 0.92 0 1.83 0 2.75 0 z m 9.04 0 c -0.09 0.69 0.17 1.72 -0.12 2.2 -0.46 -0.28 0.27 -1.74 -0.38 -1.83 -1.08 0 -2.16 0 -3.25 0 0.01 -0.77 1.39 -0.19 1.99 -0.37 0.58 0 1.17 0 1.75 0 z m -7.12 0.15 c 1.28 -0.03 2.54 -2.28 0.38 -2.02 -0.97 0.31 0.97 0.93 -0.44 1.45 -2.46 -0.81 3.02 -3.33 2.65 -0.49 -0.37 1.14 -1.5 0.73 -0.52 1.77 0.01 2.62 -5.38 1.24 -2.65 -0.31 1.73 0.44 -1.54 1.47 0.33 1.59 1.32 -0.07 2.02 -1.94 0.25 -1.99 z m 0.91 8.6 c 0.09 -0.68 -0.17 -1.71 0.12 -2.19 1.33 0 2.66 0 3.99 0 0.22 -0.97 -0.14 -1.36 -1.12 -1.13 -2.55 0 -5.1 0 -7.65 0 -0.02 4.83 0.04 9.67 -0.03 14.5 -0.24 2.29 -3.95 4.19 -5.23 1.73 -0.79 -2.65 3.3 -4.75 4.89 -3.13 0 -5.04 0 -10.09 0 -15.13 3.17 0 6.34 0 9.5 0 -0.02 5.51 0.04 11.03 -0.03 16.53 -0.21 2.29 -3.95 4.19 -5.21 1.73 -0.75 -2.48 3.04 -4.96 4.88 -3.01 0 -3.3 0 -6.6 0 -9.9 -1.37 10e-7 -2.75 -3e-6 -4.12 2e-6 z M 21.56 5.58 c -0.02 5.51 0.04 11.03 -0.03 16.53 -0.23 2.27 -3.95 4.2 -5.21 1.73 -0.75 -2.47 3.03 -4.96 4.87 -3.01 0 -3.38 0 -6.76 0 -10.14 -2.92 0 -5.84 0 -8.76 0 -0.02 3.81 0.04 7.61 -0.03 11.42 -0.23 2.28 -3.96 4.2 -5.22 1.73 -0.81 -2.65 3.3 -4.75 4.88 -3.13 0 -5.04 0 -10.09 0 -15.13 3.17 0 6.34 0 9.5 0 z M 21.19 8.64 C 21.49 7.58 20.84 7.48 19.95 7.61 c -2.5 0 -5.01 0 -7.51 0 -0.3 1.06 0.35 1.16 1.25 1.03 2.5 0 5.01 0 7.51 0 z";
alphatab.tablature.drawing.MusicFont.TripletFeelNone8 = "m 25.85 19.36 c 2.02 0 4.05 0 6.07 0 0.13 -0.91 -1.28 -0.27 -1.87 -0.46 -1.4 0 -2.8 0 -4.2 0 0 0.15 0 0.31 0 0.46 z m 0 1.86 c 2.02 -0.02 4.07 0.04 6.07 -0.03 0.16 -0.94 -1.24 -0.31 -1.8 -0.49 -1.42 0 -2.84 0 -4.26 0 5e-5 0.17 -9.1e-5 0.35 6e-5 0.52 z M 48.78 5.56 c -0.02 5.52 0.04 11.04 -0.03 16.55 -0.23 2.27 -3.95 4.2 -5.21 1.73 -0.75 -2.47 3.01 -4.95 4.87 -3.02 0 -4.4 0 -8.8 0 -13.21 -2.92 0 -5.84 0 -8.76 0 -0.02 4.83 0.04 9.67 -0.03 14.5 -0.23 2.28 -3.96 4.2 -5.22 1.73 -0.81 -2.65 3.28 -4.74 4.88 -3.15 0 -5.04 0 -10.09 0 -15.13 3.17 6.67e-4 6.34 0 9.5 10e-4 z M 1.22 18.4 C 1.05 20.65 1.94 22.93 3.84 24.24 4.83 25.09 2.04 23.4 1.79 22.77 -0.18 20.74 -0.63 17.36 1.12 15.05 1.67 13.94 3.72 12.2 4.07 12.38 2.03 13.78 1.04 15.94 1.22 18.4 z m 54.61 0 c 0.17 2.26 -0.72 4.54 -2.62 5.84 -0.99 0.85 1.8 -0.84 2.05 -1.47 1.97 -2.04 2.42 -5.41 0.67 -7.73 -0.55 -1.11 -2.61 -2.84 -2.95 -2.66 2.04 1.39 3.03 3.55 2.85 6.01 z M 12.43 5.56 c -0.02 5.52 0.04 11.04 -0.03 16.55 -0.24 2.29 -3.95 4.19 -5.23 1.73 -0.79 -2.65 3.29 -4.74 4.89 -3.15 0 -5.04 0 -10.09 0 -15.13 0.12 1.7e-4 0.25 -4.21e-4 0.37 5e-4 z m 9.19 0 c 0.16 2.22 2.22 3.33 3.46 4.91 2.35 2.49 1.74 6.43 -0.23 8.95 0.24 -1.29 1.6 -3.21 1.07 -4.96 -0.39 -2.26 -2.25 -4.05 -4.36 -4.78 -0.02 4.14 0.04 8.29 -0.03 12.43 -0.21 2.29 -3.95 4.19 -5.21 1.73 -0.75 -2.48 3.02 -4.95 4.88 -3.02 0 -5.09 0 -10.17 0 -15.26 0.14 5e-4 0.28 -8.68e-4 0.42 5e-4 z m -7.36 -3.38 c -0.03 0.75 -1.39 0.18 -1.99 0.36 -0.67 0.08 -1.87 -0.37 -1.5 0.75 0.2 0.99 -0.41 1.5 -0.25 0.21 -0.1 -0.87 -0.09 -1.63 1 -1.31 0.92 0 1.83 0 2.75 0 z m 9.04 0 c -0.09 0.68 0.17 1.71 -0.12 2.19 -0.46 -0.28 0.27 -1.74 -0.38 -1.83 -1.08 0 -2.16 0 -3.25 0 0.03 -0.75 1.39 -0.18 1.99 -0.36 0.58 0 1.17 0 1.75 0 z m -7.12 0.15 c 1.28 -0.03 2.54 -2.28 0.38 -2.02 -0.98 0.3 0.97 0.93 -0.44 1.44 -2.45 -0.8 3.03 -3.31 2.65 -0.47 -0.36 1.15 -1.5 0.72 -0.52 1.75 0.03 2.63 -5.38 1.26 -2.65 -0.3 1.73 0.44 -1.53 1.48 0.33 1.58 1.32 -0.08 2.02 -1.92 0.25 -1.98 z";
alphatab.tablature.drawing.MusicFont.TripletFeelNone16 = "m 24.36 19.36 c 2.02 0 4.05 0 6.07 0 0.12 -0.89 -1.29 -0.25 -1.87 -0.45 -1.4 0 -2.8 0 -4.2 0 0 0.15 0 0.3 0 0.45 z m 0 1.86 c 2.02 -0.02 4.07 0.04 6.07 -0.03 0.16 -0.94 -1.24 -0.31 -1.8 -0.49 -1.42 0 -2.84 0 -4.26 0 5e-6 0.17 -9e-6 0.35 6e-6 0.52 z M 1.22 18.4 C 1.05 20.66 1.94 22.94 3.84 24.25 4.83 25.11 2.03 23.41 1.79 22.78 -0.18 20.74 -0.63 17.37 1.12 15.05 1.67 13.94 3.72 12.2 4.07 12.38 2.04 13.75 1.02 15.97 1.22 18.4 z m 54.61 0 c 0.17 2.26 -0.72 4.54 -2.62 5.86 -0.99 0.86 1.81 -0.84 2.05 -1.47 1.97 -2.04 2.42 -5.41 0.67 -7.73 -0.55 -1.11 -2.61 -2.84 -2.95 -2.66 2.02 1.36 3.04 3.58 2.85 6.01 z M 14.26 2.19 c -0.01 0.77 -1.39 0.19 -1.99 0.37 -0.67 0.08 -1.87 -0.37 -1.5 0.75 0.2 0.99 -0.41 1.5 -0.25 0.21 -0.1 -0.87 -0.1 -1.65 1 -1.33 0.92 0 1.83 0 2.75 0 z m 9.04 0 c -0.09 0.69 0.17 1.72 -0.12 2.2 -0.49 -0.25 0.26 -1.75 -0.39 -1.83 -1.08 0 -2.15 0 -3.23 0 0.01 -0.77 1.39 -0.19 1.99 -0.37 0.58 0 1.17 0 1.75 0 z m -7.12 0.15 c 1.28 -0.03 2.54 -2.28 0.38 -2.02 -0.97 0.31 0.97 0.93 -0.44 1.45 -2.46 -0.81 3.02 -3.33 2.65 -0.49 -0.37 1.14 -1.5 0.73 -0.52 1.77 0.01 2.62 -5.38 1.24 -2.65 -0.31 1.73 0.44 -1.54 1.47 0.33 1.59 1.32 -0.07 2.02 -1.94 0.25 -1.99 z M 47.14 5.58 c -0.02 5.51 0.04 11.03 -0.03 16.53 -0.23 2.27 -3.95 4.2 -5.21 1.73 -0.75 -2.47 3.03 -4.96 4.87 -3.01 0 -3.38 0 -6.76 0 -10.14 -2.92 0 -5.84 0 -8.76 0 -0.02 3.81 0.04 7.61 -0.03 11.42 -0.23 2.28 -3.96 4.2 -5.22 1.73 -0.81 -2.65 3.3 -4.75 4.88 -3.13 0 -5.04 0 -10.09 0 -15.13 3.17 3.33e-4 6.34 -6.67e-4 9.5 5e-4 z m -0.37 3.06 c 0.3 -1.06 -0.35 -1.16 -1.25 -1.03 -2.5 0 -5.01 0 -7.51 0 -0.3 1.06 0.35 1.16 1.25 1.03 2.5 0 5.01 0 7.51 0 z M 17.09 10.93 c 0.09 -0.68 -0.17 -1.71 0.12 -2.19 1.33 0 2.66 0 3.99 0 0.22 -0.97 -0.14 -1.36 -1.12 -1.13 -2.55 0 -5.1 0 -7.65 0 -0.02 4.83 0.04 9.67 -0.03 14.5 -0.24 2.29 -3.95 4.19 -5.23 1.73 -0.79 -2.65 3.3 -4.75 4.89 -3.13 0 -5.04 0 -10.09 0 -15.13 3.17 0 6.34 0 9.5 0 -0.02 5.51 0.04 11.03 -0.03 16.53 -0.21 2.29 -3.95 4.19 -5.21 1.73 -0.75 -2.48 3.04 -4.96 4.88 -3.01 0 -3.3 0 -6.6 0 -9.9 -1.37 3.32e-4 -2.75 -6.65e-4 -4.12 5e-4 z";
alphatab.tablature.drawing.MusicFont.KeySharp = "m 3.11 3.97 c 0 -1.32 0 -2.65 0 -3.97 0.22 0 0.43 0 0.65 0 0 1.24 0 2.48 0 3.73 0.31 -0.13 0.62 -0.27 0.93 -0.4 0 0.79 0 1.57 0 2.36 C 4.38 5.82 4.07 5.95 3.76 6.09 c 0 1.27 0 2.53 0 3.8 0.31 -0.15 0.62 -0.29 0.93 -0.44 0 0.79 0 1.57 0 2.36 -0.31 0.13 -0.62 0.27 -0.93 0.4 0 1.29 0 2.58 0 3.87 -0.22 0 -0.43 0 -0.65 0 0 -1.21 0 -2.41 0 -3.62 -0.51 0.22 -1.03 0.43 -1.54 0.65 0 1.3 0 2.6 0 3.9 -0.22 0 -0.43 0 -0.65 0 0 -1.22 0 -2.44 0 -3.66 C 0.62 13.47 0.31 13.59 0 13.71 0 12.92 0 12.14 0 11.35 c 0.31 -0.12 0.62 -0.24 0.93 -0.37 0 -1.27 0 -2.53 0 -3.8 C 0.62 7.32 0.31 7.46 0 7.59 0 6.79 0 5.99 0 5.19 0.31 5.07 0.62 4.95 0.93 4.83 c 0 -1.29 0 -2.58 0 -3.87 0.22 0 0.43 0 0.65 0 0 1.21 0 2.41 0 3.62 C 2.09 4.38 2.6 4.17 3.11 3.97 z M 1.57 6.94 c 0 1.27 0 2.53 0 3.8 0.51 -0.22 1.03 -0.43 1.54 -0.65 0 -1.25 0 -2.51 0 -3.76 -0.51 0.2 -1.03 0.41 -1.54 0.61 z";
alphatab.tablature.drawing.MusicFont.KeyNormal = "M 0 12.45 C 0 8.3 0 4.15 0 0 c 0.24 0 0.47 0 0.71 0 0 1.87 0 3.74 0 5.6 C 1.84 5.29 2.97 4.98 4.1 4.67 c 0 4.11 0 8.22 0 12.33 -0.22 0 -0.44 0 -0.67 0 0 -1.83 0 -3.66 0 -5.49 C 2.29 11.82 1.14 12.13 0 12.45 z M 0.71 10.37 C 1.61 10.12 2.52 9.87 3.43 9.62 c 0 -1.01 0 -2.02 0 -3.03 -0.91 0.25 -1.82 0.5 -2.73 0.74 0 1.01 0 2.02 0 3.03 z";
alphatab.tablature.drawing.MusicFont.KeyFlat = "m 0 2 c 0.21 0 0.42 0 0.63 0 0 2.93 0 5.85 0 8.78 0.88 -0.5 1.91 -1.01 2.95 -0.78 0.91 0.24 1.29 1.34 1.1 2.18 -0.31 1.25 -1.36 2.14 -2.38 2.83 C 1.42 15.52 0.7 16.27 0 17 0 12 0 7 0 2 z m 2.64 8.71 c -0.62 -0.36 -1.3 0.1 -1.8 0.47 -0.31 0.1 -0.19 0.42 -0.21 0.67 0 1.28 0 2.57 0 3.85 C 1.13 15.18 1.67 14.71 2.13 14.17 2.68 13.42 3.31 12.58 3.25 11.6 3.21 11.22 2.97 10.89 2.64 10.71 z";
alphatab.tablature.drawing.MusicFont.SilenceHalf = "m 0 4 c 3.22 0 6.44 0 9.66 0 0 -1.33 0 -2.67 0 -4 C 6.44 0 3.22 0 0 0 0 1.33 0 2.67 0 4 z";
alphatab.tablature.drawing.MusicFont.SilenceQuarter = "M 2.4 0.04 C 4.3 2.23 6.19 4.42 8.09 6.61 6.57 7.75 5.58 9.43 4.76 11.11 c -0.52 1.6 0.26 3.29 1.29 4.5 0.24 0.66 2.07 1.26 1.03 1.93 -1.31 0.03 -2.84 -0.37 -3.95 0.55 -0.77 0.84 -0.45 2.17 0.21 2.97 0.14 0.66 1.69 1.33 1.09 1.84 C 3.38 22.69 2.74 21.73 1.92 21.12 1.1 20.27 0.05 19.37 0 18.1 0 16.77 1.21 15.64 2.52 15.61 3.61 15.48 4.75 15.77 5.64 16.42 3.91 14.2 2.18 11.98 0.46 9.77 1.95 8.55 2.86 6.78 3.55 5.02 3.88 3.53 2.92 2.2 2.17 1.01 1.62 0.63 1.35 -0.35 2.4 0.04 z";
alphatab.tablature.drawing.MusicFont.SilenceEighth = "M 2.19 0 C 3.49 -0.03 4.76 1.37 4.32 2.66 4.26 3.18 3.53 3.64 3.47 3.89 4.27 4.3 5.11 3.75 5.7 3.24 6.67 2.38 7.28 1.18 7.97 0.11 8.48 -0.19 8.34 0.36 8.25 0.65 7.15 5.44 6.06 10.22 4.96 15 4.63 15 4.3 15 3.97 15 4.95 11.06 5.93 7.12 6.92 3.18 6.24 4.45 4.71 4.96 3.34 4.89 2.47 4.82 1.53 4.65 0.84 4.09 -0.23 3.23 -0.33 1.4 0.74 0.52 1.14 0.16 1.66 0.01 2.19 0 z";
alphatab.tablature.drawing.MusicFont.SilenceSixteenth = "M 4.58 12.12 C 5.95 11.59 6.78 10.24 7.35 8.97 7.83 7.03 8.3 5.09 8.77 3.15 8.07 4.45 6.51 4.93 5.11 4.84 4.52 4.91 3.98 4.62 3.43 4.44 2.32 4.03 1.69 2.76 1.97 1.62 2.28 0.02 4.57 -0.55 5.64 0.63 6.55 1.43 6.51 3.05 5.45 3.71 5.36 4.19 6.59 3.99 6.98 3.66 8.23 2.89 8.83 1.47 9.7 0.35 9.87 -0.15 10.51 0 10.17 0.49 8.42 7.99 6.67 15.5 4.91 23 4.6 23 4.29 23 3.98 23 4.92 19.1 5.86 15.19 6.8 11.29 6.13 12.56 4.62 13.09 3.25 13 2.02 12.96 0.61 12.44 0.14 11.2 -0.3 10.11 0.24 8.69 1.41 8.35 2.54 7.9 3.92 8.55 4.28 9.72 4.57 10.55 4.21 11.58 3.4 11.97 c 0.39 0.12 0.78 0.29 1.18 0.15 z";
alphatab.tablature.drawing.MusicFont.SilenceThirtySecond = "M 6.47 12.03 C 8.29 11.3 9.21 9.34 9.56 7.51 9.92 6.04 10.27 4.56 10.63 3.08 9.64 4.92 7.15 5.09 5.38 4.46 3.78 3.93 3.21 1.56 4.57 0.49 5.72 -0.52 7.61 0.15 8.07 1.55 8.6 2.43 7.48 3.5 7.35 3.83 8.35 4.33 9.38 3.44 10 2.71 c 0.66 -0.83 1.13 -1.9 1.82 -2.66 0.56 -0.12 0.05 0.61 0.07 0.91 C 9.56 10.97 7.22 20.99 4.89 31 4.57 30.92 3.75 31.23 4.04 30.68 4.95 26.9 5.86 23.12 6.77 19.35 5.77 21.17 3.29 21.4 1.53 20.67 0.07 20.13 -0.56 18.04 0.6 16.92 c 1.08 -1.13 3.22 -0.66 3.66 0.87 0.53 0.87 -0.54 1.99 -0.73 2.28 1.18 0.47 2.29 -0.59 2.93 -1.48 0.66 -0.79 0.95 -1.76 1.15 -2.75 C 7.98 14.32 8.35 12.78 8.72 11.25 7.96 12.7 6.22 13.02 4.72 12.93 3.53 12.75 2.13 12.09 1.95 10.75 1.57 9.33 2.89 7.91 4.33 8.13 5.89 8.21 6.92 10.33 5.77 11.51 c -1.03 0.58 0.16 0.67 0.7 0.52 z";
alphatab.tablature.drawing.MusicFont.SilenceSixtyFourth = "M 6.61 20.61 C 8.85 19.73 9.53 17.2 9.98 15.06 10.25 13.86 10.53 12.67 10.81 11.47 9.73 13.44 6.96 13.6 5.13 12.7 3.51 11.89 3.43 9.15 5.21 8.5 6.88 7.68 9.03 9.67 8.14 11.37 7.48 12.01 7.22 12.47 8.36 12.31 9.96 11.87 11.03 10.26 11.43 8.72 11.89 6.88 12.35 5.04 12.8 3.2 11.95 4.77 9.95 5.12 8.33 4.85 6.95 4.62 5.61 3.49 5.82 1.97 5.87 0.05 8.65 -0.7 9.75 0.8 10.95 1.74 9.66 3.52 9.62 3.97 11.16 4.33 12.19 2.71 12.93 1.6 13.18 1.26 14.26 -0.61 14.24 0.38 11.16 13.59 8.07 26.79 4.99 40 c -0.52 0.01 -1.23 0.16 -0.81 -0.58 0.91 -3.78 1.82 -7.55 2.73 -11.33 -1.12 2.02 -4.06 2.2 -5.86 1.06 -1.46 -0.88 -1.41 -3.42 0.28 -4.01 1.6 -0.79 3.65 0.92 3.01 2.62 -0.29 0.74 -1.37 1.25 -0.01 1.2 1.47 -0.28 2.42 -1.65 3.07 -2.89 C 7.89 23.99 8.41 21.91 8.91 19.82 8.06 21.39 6.06 21.74 4.45 21.47 3.08 21.23 1.74 20.1 1.96 18.59 c 0.05 -1.91 2.83 -2.68 3.93 -1.17 0.83 0.89 0.61 2.48 -0.48 3.06 0.39 0.2 0.78 0.3 1.2 0.13";
alphatab.tablature.drawing.MusicFont.NoteHalf = "M 2.84 0.88 C 4.09 0.12 5.69 -0.3 7.1 0.27 8.33 0.78 9.2 2.15 8.95 3.49 8.73 5.19 7.49 6.6 6.01 7.36 4.74 8.13 3.1 8.5 1.71 7.87 0.9 7.54 0.27 6.82 0.07 5.97 -0.18 4.85 0.23 3.69 0.83 2.76 1.35 1.99 2.05 1.35 2.84 0.88 z M 7.91 1.43 C 7.36 0.98 6.59 1.13 5.95 1.23 4.3 1.64 2.8 2.67 1.87 4.1 1.37 4.83 0.95 5.67 0.95 6.57 1.02 7.12 1.71 7.29 2.16 7.12 3.55 6.78 4.87 6.15 6 5.27 6.9 4.47 7.68 3.49 8.05 2.34 8.13 2.04 8.15 1.67 7.91 1.43 z";
alphatab.tablature.drawing.MusicFont.NoteQuarter = "m 2.85 0.87 c 1.24 -0.76 2.82 -1.17 4.22 -0.63 1.05 0.44 1.91 1.47 1.93 2.64 0.05 1.64 -0.96 3.17 -2.29 4.07 -0.97 0.62 -2.03 1.19 -3.21 1.24 -1.24 0.1 -2.62 -0.46 -3.21 -1.6 -0.58 -1.19 -0.23 -2.62 0.46 -3.69 0.52 -0.83 1.25 -1.54 2.1 -2.03 z";
alphatab.tablature.drawing.MusicFont.Harmonic = "M 0 4.58 C 1.47 6.06 2.94 7.53 4.42 9 5.24 8 6.1 7.01 7.18 6.28 7.97 5.66 8.76 5.04 9.55 4.42 8.1 2.94 6.64 1.47 5.19 0 4.4 1 3.39 1.79 2.51 2.7 1.75 3.42 0.9 4.04 0 4.58 z";
alphatab.tablature.drawing.MusicFont.DeadNote = "M 4.99 5.57 C 5.47 5.71 5.89 6.1 5.92 6.62 6.03 7.41 6 8.21 6.01 9 7.01 9 8 9 9 9 9 7.98 9 6.97 9 5.95 8.15 5.94 7.29 6.01 6.46 5.81 6 5.73 5.63 5.31 5.57 4.86 5.59 4.53 5.49 4.18 5.69 3.88 5.88 3.45 6.34 3.24 6.78 3.22 7.52 3.14 8.26 3.16 9 3.16 9 2.14 9 1.12 9 0.11 c -1 0 -1.99 0 -2.99 0 -0.02 0.85 0.06 1.71 -0.15 2.54 -0.08 0.46 -0.49 0.82 -0.95 0.88 -0.31 0 -0.63 0 -0.94 0 C 3.49 3.39 3.09 2.96 3.07 2.44 2.97 1.67 2.99 0.89 2.99 0.11 c -1 0 -1.99 0 -2.99 0 C 0 1.12 0 2.14 0 3.16 0.85 3.17 1.71 3.1 2.54 3.3 3 3.38 3.37 3.8 3.43 4.25 3.41 4.58 3.51 4.93 3.31 5.23 3.12 5.66 2.66 5.87 2.22 5.89 1.48 5.97 0.74 5.95 0 5.95 0 6.97 0 7.98 0 9 1 9 1.99 9 2.99 9 3.01 8.15 2.93 7.29 3.14 6.46 3.22 6.01 3.61 5.63 4.05 5.57 c 0.31 0 0.63 0 0.94 0 z";
alphatab.tablature.drawing.MusicFont.FooterUpEighth = "m 0.19 11.86 c 0 -2.27 0 -4.54 0 -6.81 0.48 -0.06 0.88 -0.02 0.83 0.6 0.24 0.91 0.39 1.87 0.97 2.64 0.77 1.2 1.99 2 2.94 3.05 1.54 1.55 2.98 3.28 3.69 5.38 0.9 2.5 0.48 5.26 -0.41 7.69 C 7.72 25.71 7 26.91 6.22 28.04 5.56 27.64 6.21 27.27 6.49 26.8 7.6 25.04 8.1 22.96 8.13 20.89 7.98 18.65 7.01 16.5 5.43 14.9 4.12 13.58 2.53 12.46 0.76 11.86 c -0.19 0 -0.38 0 -0.57 0 z";
alphatab.tablature.drawing.MusicFont.FooterUpSixteenth = "M 8.07 20.52 C 7.82 17.12 5.48 14.18 2.56 12.58 2.07 12.29 0.91 11.58 1.59 12.64 c 0.77 1.69 2.4 2.7 3.62 4.04 1.09 1.16 2.18 2.39 2.86 3.85 z M 0.77 16.91 c -0.41 0.05 -0.76 0.04 -0.61 -0.47 0 -3.81 0 -7.63 0 -11.44 0.68 -0.18 0.91 0.23 0.95 0.88 0.22 1.17 0.68 2.3 1.52 3.17 2.01 1.94 4.22 3.83 5.48 6.39 1.09 2.1 1.29 4.58 0.65 6.85 0.69 2.06 0.29 4.29 -0.3 6.33 C 7.97 30.2 7.16 31.66 6.2 33 5.34 32.46 6.74 31.89 6.81 31.21 7.72 29.5 8.14 27.55 8.09 25.63 8.07 24.87 7.89 24.71 7.64 25.48 7.22 26.28 6.73 27.27 6.16 27.82 5.36 27.28 6.83 26.67 6.86 25.97 7.2 25.28 7.52 24.57 7.7 23.81 6.9 20.89 4.51 18.65 1.85 17.35 1.5 17.18 1.14 17.04 0.77 16.91 z";
alphatab.tablature.drawing.MusicFont.FooterUpThirtySecond = "M 8.01 20.36 C 7.74 16.68 5.06 13.56 1.83 12 0.45 11.27 2.17 13.66 2.65 14.1 4.63 15.98 6.8 17.88 8.01 20.36 z M 0 0 c 0.93 -0.29 0.82 0.81 1.05 1.43 0.28 1.77 1.66 3.01 2.91 4.15 2.23 2.1 4.42 4.59 4.92 7.72 0.18 1.25 0.16 2.54 -0.14 3.77 0.47 1.66 0.4 3.44 -0.05 5.09 0.76 2.36 0.23 4.92 -0.58 7.2 C 7.63 30.66 6.93 31.87 6.12 33 5.24 32.32 7.02 31.52 7.01 30.63 7.76 29 8.11 27.16 8.01 25.38 7.92 23.94 7.38 26.08 6.99 26.49 6.78 27.03 5.82 28.32 5.86 27.28 6.73 26.26 7.28 24.99 7.63 23.71 7.37 23.06 7.05 21.19 6.48 22.6 6.31 23.58 5.27 22.84 6.07 22.36 7.31 21.2 5.4 20.07 4.7 19.16 3.49 18.08 2.05 17.14 0.48 16.72 -0.13 16.92 -0.01 16.4 0 15.97 0 10.65 0 5.32 0 0 z M 7.83 14.77 C 7.21 11.4 4.6 8.64 1.52 7.29 2.3 8.95 3.91 9.95 5.11 11.27 6.13 12.34 7.1 13.51 7.83 14.77 z";
alphatab.tablature.drawing.MusicFont.FooterUpSixtyFourth = "m 8.07 20.53 c -0.29 -3.95 -3.31 -7.22 -6.84 -8.72 0.54 2.1 2.54 3.27 3.92 4.8 1.11 1.19 2.23 2.44 2.92 3.93 z M 7.9 14.89 C 7.27 11.48 4.63 8.71 1.53 7.34 2.35 9.08 4.05 10.11 5.29 11.51 c 0.96 1.04 1.89 2.14 2.6 3.38 z M 0.63 21.56 C -0.04 21.75 -0.08 21.32 0 20.78 0 13.85 0 6.93 0 0 1.28 -0.3 0.81 1.63 1.32 2.36 2.13 4.32 4.02 5.46 5.39 6.99 7.43 9.14 9.15 11.87 9.07 14.93 c -0.18 1.54 -0.19 2.99 0.07 4.53 0.08 1.48 -0.63 2.86 -0.06 4.3 0.31 1.41 -0.31 2.81 -0.15 4.19 C 9.47 31.5 8.2 35.14 6.12 38 5.21 37.29 7.03 36.51 7.01 35.59 7.78 33.88 8.18 31.95 8 30.08 7.46 31 6.83 32.93 6.01 33.09 5.75 32.27 7.34 31.19 7.39 30.1 8.1 29.16 7.42 27.28 6.82 27.01 6.69 27.62 5.8 28.35 5.91 27.5 7.37 26.46 5.84 25.23 5.02 24.33 3.79 23.1 2.27 22.15 0.63 21.56 z m 7.27 3.46 c 0.17 0.54 0.11 -0.4 0 0 z M 6.47 22.86 c 0.4 0.56 1.45 2.23 1.12 0.71 -0.34 -0.71 -0.43 -2.27 -1.12 -0.71 z M 1.38 17.15 c 0.95 2.06 3.03 3.19 4.41 4.92 0.71 1 1.16 -0.97 0.26 -1.33 C 4.84 19.15 3.21 17.92 1.38 17.15 z";
alphatab.tablature.drawing.MusicFont.FooterDownEighth = "m 0 -9.83 c 0 2.27 0 4.54 0 6.81 0.48 0.06 0.88 0.02 0.83 -0.6 0.24 -0.91 0.39 -1.87 0.97 -2.64 0.77 -1.2 1.99 -2 2.94 -3.05 1.54 -1.55 2.98 -3.28 3.69 -5.38 0.9 -2.5 0.48 -5.26 -0.41 -7.69 -0.49 -1.3 -1.21 -2.49 -2 -3.63 -0.65 0.41 -0.01 0.78 0.27 1.24 1.11 1.76 1.61 3.85 1.64 5.91 -0.15 2.24 -1.12 4.39 -2.7 5.99 -1.31 1.33 -2.89 2.45 -4.67 3.05 -0.19 0 -0.38 0 -0.57 0 z";
alphatab.tablature.drawing.MusicFont.FooterDownSixteenth = "m 7.94 -15.56 c -0.25 3.4 -2.58 6.34 -5.51 7.94 -0.49 0.29 -1.65 1 -0.97 -0.06 0.77 -1.69 2.4 -2.7 3.62 -4.04 1.09 -1.16 2.18 -2.39 2.86 -3.85 z m -7.29 3.61 c -0.41 -0.05 -0.76 -0.04 -0.61 0.47 0 3.81 0 7.63 0 11.44 0.68 0.18 0.91 -0.23 0.95 -0.88 C 1.2 -2.1 1.67 -3.22 2.5 -4.09 c 2.01 -1.94 4.22 -3.83 5.48 -6.39 1.09 -2.1 1.29 -4.58 0.65 -6.85 0.69 -2.06 0.29 -4.29 -0.3 -6.33 -0.49 -1.58 -1.3 -3.04 -2.26 -4.38 -0.86 0.54 0.54 1.11 0.61 1.79 0.91 1.7 1.33 3.66 1.28 5.58 -0.03 0.76 -0.21 0.92 -0.46 0.15 -0.41 -0.8 -0.9 -1.79 -1.48 -2.34 -0.8 0.55 0.67 1.15 0.7 1.86 0.33 0.69 0.66 1.4 0.84 2.15 -0.8 2.92 -3.19 5.17 -5.85 6.46 -0.35 0.17 -0.71 0.31 -1.08 0.44 z";
alphatab.tablature.drawing.MusicFont.FooterDownThirtySecond = "m 8.01 -20.41 c -0.27 3.68 -2.94 6.8 -6.18 8.36 -1.38 0.73 0.34 -1.66 0.81 -2.1 1.99 -1.88 4.16 -3.78 5.36 -6.26 z M 0 -0.05 c 0.93 0.29 0.82 -0.81 1.05 -1.43 0.28 -1.77 1.66 -3.01 2.91 -4.15 2.23 -2.1 4.42 -4.59 4.92 -7.72 0.18 -1.25 0.16 -2.54 -0.14 -3.77 0.47 -1.66 0.4 -3.44 -0.05 -5.09 0.76 -2.36 0.23 -4.92 -0.58 -7.2 -0.49 -1.3 -1.2 -2.51 -2.01 -3.64 -0.88 0.68 0.9 1.48 0.89 2.37 0.76 1.63 1.1 3.46 1.01 5.25 -0.09 1.44 -0.63 -0.71 -1.03 -1.11 -0.2 -0.54 -1.16 -1.83 -1.12 -0.8 0.87 1.02 1.41 2.29 1.77 3.58 -0.27 0.65 -0.58 2.52 -1.15 1.11 -0.17 -0.98 -1.21 -0.24 -0.41 0.24 1.25 1.17 -0.67 2.29 -1.37 3.2 -1.21 1.08 -2.64 2.02 -4.21 2.43 -0.61 -0.2 -0.5 0.33 -0.48 0.75 0 5.32 0 10.65 0 15.97 z M 7.83 -14.82 c -0.62 3.37 -3.24 6.13 -6.32 7.48 0.78 -1.66 2.39 -2.66 3.59 -3.99 1.02 -1.06 1.99 -2.23 2.73 -3.5 z";
alphatab.tablature.drawing.MusicFont.FooterDownSixtyFourth = "m 8.07 -20.56 c -0.29 3.95 -3.31 7.22 -6.84 8.72 0.54 -2.1 2.54 -3.27 3.92 -4.8 1.11 -1.19 2.23 -2.44 2.92 -3.93 z m -0.18 5.64 c -0.63 3.4 -3.26 6.17 -6.37 7.54 0.82 -1.73 2.52 -2.77 3.76 -4.17 0.96 -1.04 1.89 -2.14 2.6 -3.38 z M 0.63 -21.59 C -0.04 -21.78 -0.08 -21.35 0 -20.81 c 0 6.93 0 13.85 0 20.78 1.28 0.3 0.81 -1.63 1.32 -2.36 0.81 -1.96 2.71 -3.1 4.07 -4.63 2.04 -2.14 3.76 -4.87 3.68 -7.94 -0.18 -1.54 -0.19 -2.99 0.07 -4.53 0.08 -1.48 -0.63 -2.86 -0.06 -4.3 0.31 -1.41 -0.31 -2.81 -0.15 -4.19 0.54 -3.56 -0.73 -7.2 -2.82 -10.06 -0.91 0.71 0.92 1.49 0.9 2.41 0.77 1.71 1.17 3.64 0.98 5.51 -0.53 -0.92 -1.16 -2.85 -1.99 -3.01 -0.25 0.82 1.33 1.9 1.38 3 0.71 0.93 0.03 2.82 -0.57 3.08 -0.13 -0.61 -1.02 -1.34 -0.91 -0.49 1.47 1.04 -0.07 2.27 -0.89 3.17 -1.23 1.23 -2.76 2.19 -4.4 2.77 z m 7.27 -3.46 c 0.17 -0.54 0.11 0.4 0 0 z m -1.43 2.16 c 0.4 -0.56 1.45 -2.23 1.12 -0.71 -0.34 0.71 -0.43 2.27 -1.12 0.71 z m -5.09 5.72 c 0.95 -2.06 3.03 -3.19 4.41 -4.92 0.71 -1 1.16 0.97 0.26 1.33 -1.21 1.58 -2.84 2.82 -4.67 3.59 z";
alphatab.tablature.drawing.MusicFont.GraceNote = "M 5.62 17.02 C 5.29 18.81 3.42 20.24 1.6 19.97 0.55 19.79 -0.23 18.68 0.06 17.64 0.39 16.16 1.83 15.13 3.28 14.9 c 0.74 -0.1 1.55 0.13 2.02 0.73 0 -1.96 0 -3.92 0 -5.87 C 4.9 10.37 4.49 10.98 4.09 11.59 3.8 11.45 3.57 11.3 3.89 11.03 4.36 10.31 4.83 9.59 5.3 8.87 c 0 -2.95 0 -5.91 0 -8.86 C 5.96 -0.19 5.81 0.67 6 1.07 6.28 2.38 7.49 3.11 8.34 4.03 8.54 4.12 8.68 3.59 8.86 3.42 9.23 2.86 9.59 2.3 9.96 1.74 10.25 1.89 10.48 2.04 10.17 2.31 9.7 3.03 9.24 3.75 8.77 4.47 10 5.79 11.01 7.48 10.97 9.33 10.96 11.24 10.21 13.07 9.11 14.6 8.58 14.15 9.69 13.65 9.69 13.08 10.16 12.06 10.38 10.91 10.31 9.79 10.14 8.16 9.25 6.69 7.99 5.67 7.22 6.79 6.45 8 5.68 9.15 c 0 2.62 0 5.25 0 7.87 l -0.05 0 -0.01 0 -9e-7 0 z M 7.6 5.36 C 7.07 5.03 6.11 4.27 5.68 4.46 c 0 1.27 0 2.53 0 3.8 C 6.32 7.29 6.96 6.33 7.6 5.36 z";
alphatab.tablature.drawing.MusicFont.GraceDeadNote = "M 0.78 8 C 0.52 8 0.26 8 0 8 0 5.33 0 2.67 0 0 c 3.99 0 7.97 0 11.96 0 0 2.67 0 5.33 0 8 -0.25 0 -0.5 0 -0.76 0 0 -1.9 0 -3.79 0 -5.69 -3.48 0 -6.95 0 -10.43 0 0 1.9 0 3.79 0 5.69 z";
alphatab.tablature.drawing.MusicFont.TrillUpEigth = "M 0 4.77 L 9 0.37 9 2.71 0 7 0 4.77 z";
alphatab.tablature.drawing.MusicFont.TrillUpSixteenth = "M 0 8.77 L 9 4.37 9 6.71 0 11 0 8.77 z M 0 4.73 L 9 0.33 9 2.67 0 6.96 0 4.73 z";
alphatab.tablature.drawing.MusicFont.TrillUpThirtySecond = "M 0 5.14 L 9 0.73 9 3.07 0 7.37 0 5.14 z M 0 9.01 L 9 4.61 9 6.95 0 11.24 0 9.01 z M 0 12.77 L 9 8.37 9 10.71 0 15 0 12.77 z";
alphatab.tablature.drawing.MusicFont.AccentuatedNote = "M 13 3.18 L 0 6 0 5.63 11.13 3.18 0 0.73 0 0.36 13 3.18 z";
alphatab.tablature.drawing.MusicFont.HeavyAccentuatedNote = "M 11 12 L 7.6 12 4.15 5.61 0.84 12 0 12 5.22 1.7 11 12 z";
alphatab.tablature.drawing.MusicFont.VibratoLeftRight = "M 11.19 5.58 C 10.1 6.65 9.09 7.81 7.93 8.81 7.35 9.3 6.98 8.26 6.55 7.93 5.36 6.62 4.18 5.31 2.98 4 2.41 4.23 2 4.73 1.53 5.13 1.02 5.62 0.51 6.1 0 6.59 0.02 6.16 -0.05 5.69 0.03 5.29 1.79 3.63 3.51 1.94 5.28 0.3 5.93 -0.41 6.4 0.74 6.92 1.1 7.99 2.21 8.99 3.4 10.14 4.44 11.34 3.53 12.36 2.39 13.47 1.36 13.89 0.9 14.4 0.54 14.88 0.14 c 0.54 0.23 0.81 0.82 1.22 1.23 0.81 0.91 1.56 1.88 2.41 2.74 0.45 0.72 1.08 0.87 1.61 0.14 0.59 -0.63 1.15 -1.28 1.73 -1.92 -0.02 0.45 0.04 0.93 -0.03 1.35 C 20.28 5.23 18.76 6.8 17.21 8.32 16.78 8.86 16.09 9.29 15.65 8.51 14.46 7.28 13.39 5.93 12.16 4.75 11.73 4.87 11.54 5.35 11.19 5.58 z";
alphatab.model.effects.BendTypes.None = 0;
alphatab.model.effects.BendTypes.Bend = 1;
alphatab.model.effects.BendTypes.BendRelease = 2;
alphatab.model.effects.BendTypes.BendReleaseBend = 3;
alphatab.model.effects.BendTypes.Prebend = 4;
alphatab.model.effects.BendTypes.PrebendRelease = 5;
alphatab.model.effects.BendTypes.Dip = 6;
alphatab.model.effects.BendTypes.Dive = 7;
alphatab.model.effects.BendTypes.ReleaseUp = 8;
alphatab.model.effects.BendTypes.InvertedDip = 9;
alphatab.model.effects.BendTypes.Return = 10;
alphatab.model.effects.BendTypes.ReleaseDown = 11;
alphatab.tablature.drawing.DrawingLayers.Background = 0;
alphatab.tablature.drawing.DrawingLayers.LayoutBackground = 1;
alphatab.tablature.drawing.DrawingLayers.Lines = 2;
alphatab.tablature.drawing.DrawingLayers.MainComponents = 3;
alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw = 4;
alphatab.tablature.drawing.DrawingLayers.Voice2 = 5;
alphatab.tablature.drawing.DrawingLayers.VoiceEffects2 = 6;
alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2 = 7;
alphatab.tablature.drawing.DrawingLayers.VoiceDraw2 = 8;
alphatab.tablature.drawing.DrawingLayers.Voice1 = 9;
alphatab.tablature.drawing.DrawingLayers.VoiceEffects1 = 10;
alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1 = 11;
alphatab.tablature.drawing.DrawingLayers.VoiceDraw1 = 12;
alphatab.tablature.drawing.DrawingLayers.Red = 13;
alphatab.model.Lyrics.MAX_LINE_COUNT = 5;
alphatab.midi.MidiSequenceParser.DEFAULT_BEND = 64;
alphatab.midi.MidiSequenceParser.DEFAULT_BEND_SEMITONE = 2.75;
alphatab.midi.MidiSequenceParser.DEFAULT_DURATION_DEAD = 30;
alphatab.midi.MidiSequenceParser.DEFAULT_DURATION_PM = 80;
alphatab.midi.MidiSequenceParser.DEFAULT_METRONOME_KEY = 37;
alphatab.model.Tuplet.NORMAL = new alphatab.model.Tuplet();
alphatab.model.MeasureHeader.DEFAULT_KEY_SIGNATURE = 0;
alphatab.tablature.TrackSpacingPositions.Top = 0;
alphatab.tablature.TrackSpacingPositions.Marker = 1;
alphatab.tablature.TrackSpacingPositions.Text = 2;
alphatab.tablature.TrackSpacingPositions.BufferSeparator = 3;
alphatab.tablature.TrackSpacingPositions.RepeatEnding = 4;
alphatab.tablature.TrackSpacingPositions.Chord = 5;
alphatab.tablature.TrackSpacingPositions.ScoreUpLines = 6;
alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines = 7;
alphatab.tablature.TrackSpacingPositions.ScoreDownLines = 8;
alphatab.tablature.TrackSpacingPositions.Tupleto = 9;
alphatab.tablature.TrackSpacingPositions.AccentuatedEffect = 10;
alphatab.tablature.TrackSpacingPositions.HarmonicEffect = 11;
alphatab.tablature.TrackSpacingPositions.TapingEffect = 12;
alphatab.tablature.TrackSpacingPositions.LetRingEffect = 13;
alphatab.tablature.TrackSpacingPositions.PalmMuteEffect = 14;
alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect = 15;
alphatab.tablature.TrackSpacingPositions.VibratoEffect = 16;
alphatab.tablature.TrackSpacingPositions.FadeIn = 17;
alphatab.tablature.TrackSpacingPositions.Bend = 18;
alphatab.tablature.TrackSpacingPositions.TablatureTopSeparator = 19;
alphatab.tablature.TrackSpacingPositions.Tablature = 20;
alphatab.tablature.TrackSpacingPositions.TremoloBarDown = 21;
alphatab.tablature.TrackSpacingPositions.Lyric = 22;
alphatab.tablature.TrackSpacingPositions.Bottom = 23;
alphatab.model.Measure.DEFAULT_CLEF = 0;
alphatab.tablature.model.MeasureImpl.NATURAL = 1;
alphatab.tablature.model.MeasureImpl.SHARP = 2;
alphatab.tablature.model.MeasureImpl.FLAT = 3;
alphatab.tablature.model.MeasureImpl.KEY_SIGNATURES = (function($this) {
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
alphatab.tablature.model.MeasureImpl.ACCIDENTAL_SHARP_NOTES = [0,0,1,1,2,3,3,4,4,5,5,6];
alphatab.tablature.model.MeasureImpl.ACCIDENTAL_FLAT_NOTES = [0,1,1,2,2,3,4,4,5,5,6,6];
alphatab.tablature.model.MeasureImpl.ACCIDENTAL_NOTES = [false,true,false,true,false,false,true,false,true,false,true,false];
alphatab.tablature.model.MeasureImpl.SCORE_KEY_OFFSETS = [30,18,22,24];
alphatab.tablature.model.MeasureImpl.SCORE_KEYSHARP_POSITIONS = [1,4,0,3,6,2,5];
alphatab.tablature.model.MeasureImpl.SCORE_KEYFLAT_POSITIONS = [5,2,6,3,0,4,1];
alphatab.tablature.model.MeasureImpl.DEFAULT_CLEF_SPACING = 40;
alphatab.tablature.model.MeasureImpl.DEFAULT_QUARTER_SPACING = 30;
alphatab.model.Color.Black = new alphatab.model.Color(0,0,0);
alphatab.model.Color.Red = new alphatab.model.Color(255,0,0);
alphatab.model.BeatStrokeDirection.None = 0;
alphatab.model.BeatStrokeDirection.Up = 1;
alphatab.model.BeatStrokeDirection.Down = 2;
alphatab.model.MeasureClef.Treble = 0;
alphatab.model.MeasureClef.Bass = 1;
alphatab.model.MeasureClef.Tenor = 2;
alphatab.model.MeasureClef.Alto = 3;
alphatab.model.effects.TremoloBarEffect.MAX_POSITION = 12;
alphatab.model.effects.TremoloBarEffect.MAX_VALUE = 12;
alphatab.model.SlideType.FastSlideTo = 0;
alphatab.model.SlideType.SlowSlideTo = 1;
alphatab.model.SlideType.OutDownWards = 2;
alphatab.model.SlideType.OutUpWards = 3;
alphatab.model.SlideType.IntoFromBelow = 4;
alphatab.model.SlideType.IntoFromAbove = 5;
alphatab.model.PageSetup._defaults = null;
alphatab.tablature.PageViewLayout.PAGE_PADDING = new alphatab.model.Padding(20,40,20,40);
alphatab.tablature.PageViewLayout.WIDTH_ON_100 = 795;
alphatab.model.Marker.DEFAULT_COLOR = new alphatab.model.Color(255,0,0);
alphatab.model.Marker.DEFAULT_TITLE = "Untitled";
alphatab.model.Velocities.MIN_VELOCITY = 15;
alphatab.model.Velocities.VELOCITY_INCREMENT = 16;
alphatab.model.Velocities.PIANO_PIANISSIMO = 15;
alphatab.model.Velocities.PIANISSIMO = 31;
alphatab.model.Velocities.PIANO = 47;
alphatab.model.Velocities.MEZZO_PIANO = 63;
alphatab.model.Velocities.MEZZO_FORTE = 79;
alphatab.model.Velocities.FORTE = 95;
alphatab.model.Velocities.FORTISSIMO = 111;
alphatab.model.Velocities.FORTE_FORTISSIMO = 127;
alphatab.model.Velocities.DEFAULT = 95;
alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS = [55,40,40,50];
alphatab.tablature.model.BeatGroup.SCORE_SHARP_POSITIONS = [7,7,6,6,5,4,4,3,3,2,2,1];
alphatab.tablature.model.BeatGroup.SCORE_FLAT_POSITIONS = [7,6,6,5,5,4,3,3,2,2,1,1];
alphatab.tablature.model.BeatGroup.UP_OFFSET = 28;
alphatab.tablature.model.BeatGroup.DOWN_OFFSET = 35;
alphatab.file.alphatex.AlphaTexParser.EOL = String.fromCharCode(0);
alphatab.file.alphatex.AlphaTexParser.TRACK_CHANNELS = [0,1];
alphatab.file.alphatex.AlphaTexParser.TUNING_REGEX = new EReg("([a-g]b?)([0-9])","i");
alphatab.tablature.model.MeasureHeaderImpl.DEFAULT_TIME_SIGNATURE_SPACING = 30;
alphatab.tablature.model.MeasureHeaderImpl.DEFAULT_LEFT_SPACING = 15;
alphatab.tablature.model.MeasureHeaderImpl.DEFAULT_RIGHT_SPACING = 15;
alphatab.model.MidiChannel.DEFAULT_PERCUSSION_CHANNEL = 9;
alphatab.model.MidiChannel.DEFAULT_INSTRUMENT = 25;
alphatab.model.MidiChannel.DEFAULT_VOLUME = 127;
alphatab.model.MidiChannel.DEFAULT_BALANCE = 64;
alphatab.model.MidiChannel.DEFAULT_CHORUS = 0;
alphatab.model.MidiChannel.DEFAULT_REVERB = 0;
alphatab.model.MidiChannel.DEFAULT_PHASER = 0;
alphatab.model.MidiChannel.DEFAULT_TREMOLO = 0;
alphatab.model.effects.BendEffect.SEMITONE_LENGTH = 1;
alphatab.model.effects.BendEffect.MAX_POSITION = 12;
alphatab.model.effects.BendEffect.MAX_VALUE = 12;
js.Lib.onerror = null;
$Main.init = alphatab.Main.main();
