$estr = function() { return js.Boot.__string_rec(this,''); }
if(typeof net=='undefined') net = {}
if(!net.coderline) net.coderline = {}
if(!net.coderline.jsgs) net.coderline.jsgs = {}
if(!net.coderline.jsgs.model) net.coderline.jsgs.model = {}
if(!net.coderline.jsgs.model.effects) net.coderline.jsgs.model.effects = {}
net.coderline.jsgs.model.effects.GsTremoloBarPoint = function(position,value,vibrato) { if( position === $_ ) return; {
	if(vibrato == null) vibrato = false;
	if(value == null) value = 0;
	if(position == null) position = 0;
	this.Position = position;
	this.Value = value;
	this.Vibrato = vibrato;
}}
net.coderline.jsgs.model.effects.GsTremoloBarPoint.__name__ = ["net","coderline","jsgs","model","effects","GsTremoloBarPoint"];
net.coderline.jsgs.model.effects.GsTremoloBarPoint.prototype.GetTime = function(duration) {
	return Math.floor((duration * this.Position) / 12);
}
net.coderline.jsgs.model.effects.GsTremoloBarPoint.prototype.Position = null;
net.coderline.jsgs.model.effects.GsTremoloBarPoint.prototype.Value = null;
net.coderline.jsgs.model.effects.GsTremoloBarPoint.prototype.Vibrato = null;
net.coderline.jsgs.model.effects.GsTremoloBarPoint.prototype.__class__ = net.coderline.jsgs.model.effects.GsTremoloBarPoint;
net.coderline.jsgs.model.GsLyrics = function(trackChoice) { if( trackChoice === $_ ) return; {
	if(trackChoice == null) trackChoice = 0;
	this.TrackChoice = trackChoice;
	this.Lines = new Array();
}}
net.coderline.jsgs.model.GsLyrics.__name__ = ["net","coderline","jsgs","model","GsLyrics"];
net.coderline.jsgs.model.GsLyrics.prototype.Lines = null;
net.coderline.jsgs.model.GsLyrics.prototype.LyricsBeats = function() {
	var full = "";
	{
		var _g1 = 0, _g = this.Lines.length;
		while(_g1 < _g) {
			var i = _g1++;
			var line = this.Lines[i];
			if(line != null) full += line.Lyrics + "\n";
		}
	}
	var ret = StringTools.trim(full);
	ret = StringTools.replace(ret,"\n"," ");
	ret = StringTools.replace(ret,"\r"," ");
	return ret.split(" ");
}
net.coderline.jsgs.model.GsLyrics.prototype.TrackChoice = null;
net.coderline.jsgs.model.GsLyrics.prototype.__class__ = net.coderline.jsgs.model.GsLyrics;
net.coderline.jsgs.model.effects.GsGraceEffectTransition = { __ename__ : ["net","coderline","jsgs","model","effects","GsGraceEffectTransition"], __constructs__ : ["None","Slide","Bend","Hammer"] }
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Bend = ["Bend",2];
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Bend.toString = $estr;
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Bend.__enum__ = net.coderline.jsgs.model.effects.GsGraceEffectTransition;
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Hammer = ["Hammer",3];
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Hammer.toString = $estr;
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Hammer.__enum__ = net.coderline.jsgs.model.effects.GsGraceEffectTransition;
net.coderline.jsgs.model.effects.GsGraceEffectTransition.None = ["None",0];
net.coderline.jsgs.model.effects.GsGraceEffectTransition.None.toString = $estr;
net.coderline.jsgs.model.effects.GsGraceEffectTransition.None.__enum__ = net.coderline.jsgs.model.effects.GsGraceEffectTransition;
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Slide = ["Slide",1];
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Slide.toString = $estr;
net.coderline.jsgs.model.effects.GsGraceEffectTransition.Slide.__enum__ = net.coderline.jsgs.model.effects.GsGraceEffectTransition;
net.coderline.jsgs.model.effects.GsGraceEffect = function(p) { if( p === $_ ) return; {
	this.Fret = 0;
	this.Duration = 1;
	this.Dynamic = 95;
	this.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.None;
	this.IsOnBeat = false;
	this.IsDead = false;
}}
net.coderline.jsgs.model.effects.GsGraceEffect.__name__ = ["net","coderline","jsgs","model","effects","GsGraceEffect"];
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.Clone = function(factory) {
	var effect = factory.NewGraceEffect();
	effect.Fret = this.Fret;
	effect.Duration = this.Duration;
	effect.Dynamic = this.Dynamic;
	effect.Transition = this.Transition;
	effect.IsOnBeat = this.IsOnBeat;
	effect.IsDead = this.IsDead;
	return effect;
}
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.Duration = null;
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.DurationTime = function() {
	return Math.floor((960 / 16.00) * this.Duration);
}
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.Dynamic = null;
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.Fret = null;
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.IsDead = null;
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.IsOnBeat = null;
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.Transition = null;
net.coderline.jsgs.model.effects.GsGraceEffect.prototype.__class__ = net.coderline.jsgs.model.effects.GsGraceEffect;
net.coderline.jsgs.model.GsBeat = function(factory) { if( factory === $_ ) return; {
	this.Start = 960;
	this.Stroke = factory.NewStroke();
	this.Voices = new Array();
	{
		var _g = 0;
		while(_g < 2) {
			var i = _g++;
			var voice = factory.NewVoice(i);
			voice.Beat = this;
			this.Voices.push(voice);
		}
	}
}}
net.coderline.jsgs.model.GsBeat.__name__ = ["net","coderline","jsgs","model","GsBeat"];
net.coderline.jsgs.model.GsBeat.prototype.Chord = null;
net.coderline.jsgs.model.GsBeat.prototype.GetNotes = function() {
	var notes = new Array();
	{
		var _g1 = 0, _g = this.Voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var voice = this.Voices[i];
			{
				var _g2 = 0, _g3 = voice.Notes;
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
net.coderline.jsgs.model.GsBeat.prototype.HasPickStroke = null;
net.coderline.jsgs.model.GsBeat.prototype.HasRasgueado = null;
net.coderline.jsgs.model.GsBeat.prototype.IsRestBeat = function() {
	{
		var _g1 = 0, _g = this.Voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var voice = this.Voices[i];
			if(!voice.IsEmpty && !voice.IsRestVoice()) return false;
		}
	}
	return true;
}
net.coderline.jsgs.model.GsBeat.prototype.Measure = null;
net.coderline.jsgs.model.GsBeat.prototype.MixTableChange = null;
net.coderline.jsgs.model.GsBeat.prototype.PickStroke = null;
net.coderline.jsgs.model.GsBeat.prototype.SetText = function(text) {
	text.Beat = this;
	this.Text = text;
}
net.coderline.jsgs.model.GsBeat.prototype.Start = null;
net.coderline.jsgs.model.GsBeat.prototype.Stroke = null;
net.coderline.jsgs.model.GsBeat.prototype.TableChange = null;
net.coderline.jsgs.model.GsBeat.prototype.Text = null;
net.coderline.jsgs.model.GsBeat.prototype.Voices = null;
net.coderline.jsgs.model.GsBeat.prototype.__class__ = net.coderline.jsgs.model.GsBeat;
if(!net.coderline.jsgs.tablature) net.coderline.jsgs.tablature = {}
if(!net.coderline.jsgs.tablature.model) net.coderline.jsgs.tablature.model = {}
net.coderline.jsgs.tablature.model.GsBeatImpl = function(factory) { if( factory === $_ ) return; {
	net.coderline.jsgs.model.GsBeat.apply(this,[factory]);
}}
net.coderline.jsgs.tablature.model.GsBeatImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsBeatImpl"];
net.coderline.jsgs.tablature.model.GsBeatImpl.__super__ = net.coderline.jsgs.model.GsBeat;
for(var k in net.coderline.jsgs.model.GsBeat.prototype ) net.coderline.jsgs.tablature.model.GsBeatImpl.prototype[k] = net.coderline.jsgs.model.GsBeat.prototype[k];
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.BeatGroup = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.CaretPosition = function(layout) {
	return Math.round(this.GetRealPosX(layout) + 8 * layout.Scale);
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.Check = function(note) {
	var value = note.RealValue();
	if(this.MaxNote == null || value > this.MaxNote.RealValue()) this.MaxNote = note;
	if(this.MinNote == null || value < this.MinNote.RealValue()) this.MinNote = note;
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.GetPaintPosition = function(position) {
	return this.MeasureImpl().Ts.Get(position);
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.GetRealPosX = function(layout) {
	return (((this.MeasureImpl().PosX + this.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)) + this.PosX) + this.Spacing()) + (4 * layout.Scale);
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.GetVoiceImpl = function(index) {
	return this.Voices[index];
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.Height = function() {
	return this.MeasureImpl().Ts.GetSize();
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.Join1 = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.Join2 = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.JoinedGreaterThanQuarter = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.JoinedType = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.LastPaintX = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.MaxNote = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.MeasureImpl = function() {
	return this.Measure;
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.MinNote = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.MinimumWidth = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.NextBeat = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.Paint = function(layout,context,x,y) {
	x += this.PosX + this.Spacing();
	this.LastPaintX = x;
	this.PaintExtraLines(context,layout,x,y);
	if(this.Stroke.Direction != net.coderline.jsgs.model.GsBeatStrokeDirection.None) {
		this.PaintStroke(layout,context,x,y);
	}
	if(this.Chord != null) {
		var chordImpl = this.Chord;
		chordImpl.Paint(layout,context,x,y);
	}
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			this.GetVoiceImpl(v).Paint(layout,context,x,y);
		}
	}
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.PaintExtraLines = function(context,layout,x,y) {
	if(!this.IsRestBeat()) {
		var iScoreY = y + this.MeasureImpl().Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines);
		this.PaintExtraLines2(context,layout,this.MinNote,x,iScoreY);
		this.PaintExtraLines2(context,layout,this.MaxNote,x,iScoreY);
	}
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.PaintExtraLines2 = function(context,layout,note,x,y) {
	var realY = y + note.ScorePosY;
	var x1 = x + 3 * layout.Scale;
	var x2 = x + 15 * layout.Scale;
	var scoreLineSpacing = layout.ScoreLineSpacing;
	if(realY < y) {
		var i = y;
		while(i > realY) {
			context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines).StartFigure();
			context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines).AddLine(x1,i,x2,i);
			i -= scoreLineSpacing;
		}
	}
	else if(realY > (y + (scoreLineSpacing * 4))) {
		var i = (y + (scoreLineSpacing * 5));
		while(i < (realY + scoreLineSpacing)) {
			context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines).StartFigure();
			context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines).AddLine(x1,i,x2,i);
			i += scoreLineSpacing;
		}
	}
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.PaintStroke = function(layout,context,x,y) {
	if(this.Stroke.Direction == net.coderline.jsgs.model.GsBeatStrokeDirection.None) return;
	var scale = layout.Scale;
	var realX = x;
	var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature);
	var y1 = realY;
	var y2 = realY + this.MeasureImpl().TrackImpl().TabHeight;
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw);
	layer.StartFigure();
	if(this.Stroke.Direction == net.coderline.jsgs.model.GsBeatStrokeDirection.Up) {
		layer.MoveTo(realX,y1);
		layer.LineTo(realX,y2);
		layer.LineTo(realX - (2.0 * scale),y2 - (5.0 * scale));
		layer.MoveTo(realX,y2);
		layer.LineTo(realX + (2.0 * scale),y2 - (5.0 * scale));
	}
	else {
		layer.MoveTo(realX,y2);
		layer.LineTo(realX,y1);
		layer.LineTo(realX - (2.0 * scale),y1 + (3.0 * scale));
		layer.MoveTo(realX,y1);
		layer.LineTo(realX + (2.0 * scale),y1 + (3.0 * scale));
	}
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.PosX = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.PreviousBeat = null;
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.Reset = function() {
	this.MaxNote = null;
	this.MinNote = null;
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.Spacing = function() {
	return this.MeasureImpl().GetBeatSpacing(this);
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.Width = function() {
	var w = 0;
	{
		var _g1 = 0, _g = this.Voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var cw = this.GetVoiceImpl(i).Width;
			if(cw > w) w = cw;
		}
	}
	return w;
}
net.coderline.jsgs.tablature.model.GsBeatImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsBeatImpl;
net.coderline.jsgs.model.GsGuitarString = function(p) { if( p === $_ ) return; {
	this.Number = 0;
	this.Value = 0;
}}
net.coderline.jsgs.model.GsGuitarString.__name__ = ["net","coderline","jsgs","model","GsGuitarString"];
net.coderline.jsgs.model.GsGuitarString.prototype.Clone = function(factory) {
	var newString = factory.NewString();
	newString.Number = this.Number;
	newString.Value = this.Value;
	return newString;
}
net.coderline.jsgs.model.GsGuitarString.prototype.Number = null;
net.coderline.jsgs.model.GsGuitarString.prototype.Value = null;
net.coderline.jsgs.model.GsGuitarString.prototype.__class__ = net.coderline.jsgs.model.GsGuitarString;
net.coderline.jsgs.tablature.model.GsJoinedTypeConverter = function() { }
net.coderline.jsgs.tablature.model.GsJoinedTypeConverter.__name__ = ["net","coderline","jsgs","tablature","model","GsJoinedTypeConverter"];
net.coderline.jsgs.tablature.model.GsJoinedTypeConverter.ToInt = function(t) {
	switch(t) {
	case net.coderline.jsgs.tablature.model.GsJoinedType.NoneLeft:{
		return 1;
	}break;
	case net.coderline.jsgs.tablature.model.GsJoinedType.NoneRight:{
		return 2;
	}break;
	case net.coderline.jsgs.tablature.model.GsJoinedType.Left:{
		return 3;
	}break;
	case net.coderline.jsgs.tablature.model.GsJoinedType.Right:{
		return 4;
	}break;
	}
}
net.coderline.jsgs.tablature.model.GsJoinedTypeConverter.prototype.__class__ = net.coderline.jsgs.tablature.model.GsJoinedTypeConverter;
net.coderline.jsgs.model.GsHeaderFooterElements = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.model.GsHeaderFooterElements.__name__ = ["net","coderline","jsgs","model","GsHeaderFooterElements"];
net.coderline.jsgs.model.GsHeaderFooterElements.prototype.__class__ = net.coderline.jsgs.model.GsHeaderFooterElements;
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
net.coderline.jsgs.model.effects.GsHarmonicEffect = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.model.effects.GsHarmonicEffect.__name__ = ["net","coderline","jsgs","model","effects","GsHarmonicEffect"];
net.coderline.jsgs.model.effects.GsHarmonicEffect.prototype.Clone = function(factory) {
	var effect = factory.NewHarmonicEffect();
	effect.Type = this.Type;
	effect.Data = this.Data;
	return effect;
}
net.coderline.jsgs.model.effects.GsHarmonicEffect.prototype.Data = null;
net.coderline.jsgs.model.effects.GsHarmonicEffect.prototype.Type = null;
net.coderline.jsgs.model.effects.GsHarmonicEffect.prototype.__class__ = net.coderline.jsgs.model.effects.GsHarmonicEffect;
if(!net.coderline.jsgs.file) net.coderline.jsgs.file = {}
net.coderline.jsgs.file.SongLoader = function() { }
net.coderline.jsgs.file.SongLoader.__name__ = ["net","coderline","jsgs","file","SongLoader"];
net.coderline.jsgs.file.SongLoader.LoadSong = function(url,factory,success) {
	FileLoader.LoadBinary(url,"GET",function(data) {
		var readers = net.coderline.jsgs.file.SongReader.AvailableReaders();
		{
			var _g = 0;
			while(_g < readers.length) {
				var reader = readers[_g];
				++_g;
				try {
					data.seek(0);
					reader.Init(data,factory);
					success(reader.ReadSong());
				}
				catch( $e0 ) {
					if( js.Boot.__instanceof($e0,net.coderline.jsgs.file.FileFormatException) ) {
						var e = $e0;
						{
							continue;
						}
					} else throw($e0);
				}
			}
		}
		throw new net.coderline.jsgs.file.FileFormatException("No reader for requested file found");
	},function(err) {
		throw err;
	});
}
net.coderline.jsgs.file.SongLoader.prototype.__class__ = net.coderline.jsgs.file.SongLoader;
if(!net.coderline.jsgs.tablature.drawing) net.coderline.jsgs.tablature.drawing = {}
net.coderline.jsgs.tablature.drawing.DrawingResources = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.tablature.drawing.DrawingResources.__name__ = ["net","coderline","jsgs","tablature","drawing","DrawingResources"];
net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.ChordFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.TimeSignatureFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.ClefFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.MusicFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.TempoFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFontHeight = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.NoteFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.NoteFontHeight = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.TitleFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.SubtitleFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.WordsFont = null;
net.coderline.jsgs.tablature.drawing.DrawingResources.Init = function(scale) {
	net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight = Math.round(9 * scale);
	net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont = Std.string(net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight) + "px Arial";
	net.coderline.jsgs.tablature.drawing.DrawingResources.ChordFont = Std.string(9 * scale) + "px Arial";
	net.coderline.jsgs.tablature.drawing.DrawingResources.TimeSignatureFont = Std.string(20 * scale) + "px Arial";
	net.coderline.jsgs.tablature.drawing.DrawingResources.ClefFont = Std.string(13 * scale) + "px Arial";
	net.coderline.jsgs.tablature.drawing.DrawingResources.MusicFont = Std.string(13 * scale) + "px Arial";
	net.coderline.jsgs.tablature.drawing.DrawingResources.TempoFont = Std.string(11 * scale) + "px Arial";
	net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFontHeight = Math.round(11 * scale);
	net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFont = Std.string(net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFontHeight) + "px Arial";
	net.coderline.jsgs.tablature.drawing.DrawingResources.NoteFontHeight = Math.round(11 * scale);
	net.coderline.jsgs.tablature.drawing.DrawingResources.NoteFont = Std.string(net.coderline.jsgs.tablature.drawing.DrawingResources.NoteFontHeight) + "px Arial";
	net.coderline.jsgs.tablature.drawing.DrawingResources.TitleFont = Std.string(30 * scale) + "px Times New Roman";
	net.coderline.jsgs.tablature.drawing.DrawingResources.SubtitleFont = Std.string(19 * scale) + "px Times New Roman";
	net.coderline.jsgs.tablature.drawing.DrawingResources.WordsFont = Std.string(13 * scale) + "px Times New Roman";
}
net.coderline.jsgs.tablature.drawing.DrawingResources.GetScoreNoteSize = function(layout,full) {
	var scale = ((full?layout.ScoreLineSpacing + 1:layout.ScoreLineSpacing)) - 2;
	return new net.coderline.jsgs.model.Size(Math.round(scale * 1.3),Math.round(scale));
}
net.coderline.jsgs.tablature.drawing.DrawingResources.prototype.__class__ = net.coderline.jsgs.tablature.drawing.DrawingResources;
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
	catch( $e1 ) {
		{
			var e = $e1;
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
	{ var $it2 = it;
	while( $it2.hasNext() ) { var i = $it2.next();
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
IntHash.prototype.__class__ = IntHash;
net.coderline.jsgs.tablature.drawing.DrawingLayer = function(color,isFilled,penWidth) { if( color === $_ ) return; {
	this.Path = new Array();
	this.Color = color;
	this.IsFilled = isFilled;
	this.PenWidth = penWidth;
	this.CurrentPosition = new net.coderline.jsgs.model.Point(0,0);
}}
net.coderline.jsgs.tablature.drawing.DrawingLayer.__name__ = ["net","coderline","jsgs","tablature","drawing","DrawingLayer"];
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.AddArc = function(x,y,w,h,startAngle,sweepAngle) {
	this.Path.push({ Command : "addArc", X : x, Y : y, Width : w, Height : h, StartAngle : startAngle, SweepAngle : sweepAngle});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.AddBezier = function(x1,y1,x2,y2,x3,y3,x4,y4) {
	this.Path.push({ Command : "addBezier", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3, X4 : x4, Y4 : y4});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.AddEllipse = function(x,y,w,h) {
	this.Path.push({ Command : "addEllipse", X : x, Y : y, Width : w, Height : h});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.AddLine = function(x1,y1,x2,y2) {
	this.Path.push({ Command : "addLine", X1 : (x1) + 0.5, Y1 : (y1) + 0.5, X2 : (x2) + 0.5, Y2 : (y2) + 0.5});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.AddMusicSymbol = function(symbol,x,y,xScale,yScale) {
	if(yScale == null) {
		yScale = xScale;
	}
	var painter = new net.coderline.jsgs.tablature.drawing.SvgPainter(this,symbol,x,y,xScale,yScale);
	painter.Paint();
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.AddPolygon = function(points) {
	this.Path.push({ Command : "addPolygon", Points : points});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.AddRect = function(x,y,w,h) {
	this.Path.push({ Command : "addRect", X : x, Y : y, Width : w, Height : h});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.AddString = function(str,font,x,y,baseline) {
	if(baseline == null) baseline = "middle";
	this.Path.push({ Command : "addString", Text : str, Font : font, X : (x) + 0.5, Y : (y) + 0.5, BaseLine : baseline});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.BezierTo = function(x1,y1,x2,y2,x3,y3) {
	this.Path.push({ Command : "bezierTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.Clear = function() {
	this.Path = new Array();
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.CloseFigure = function() {
	this.Path.push({ Command : "closeFigure"});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.Color = null;
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.CurrentPosition = null;
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.Draw = function(graphics) {
	graphics.textBaseline = "middle";
	graphics.fillStyle = this.Color.toString();
	graphics.strokeStyle = this.Color.toString();
	graphics.lineWidth = this.PenWidth;
	graphics.beginPath();
	{
		var _g = 0, _g1 = this.Path;
		while(_g < _g1.length) {
			var elm = _g1[_g];
			++_g;
			try {
				switch(elm.Command) {
				case "startFigure":{
					this.Finish(graphics);
					graphics.beginPath();
				}break;
				case "closeFigure":{
					graphics.closePath();
				}break;
				case "moveTo":{
					graphics.moveTo(elm.X,elm.Y);
					this.CurrentPosition.X = elm.X;
					this.CurrentPosition.Y = elm.Y;
				}break;
				case "lineTo":{
					graphics.lineTo(elm.X,elm.Y);
					this.CurrentPosition.X = elm.X;
					this.CurrentPosition.Y = elm.Y;
				}break;
				case "bezierTo":{
					graphics.bezierCurveTo(elm.X1,elm.Y1,elm.X2,elm.Y2,elm.X3,elm.Y3);
					this.CurrentPosition.X = elm.X3;
					this.CurrentPosition.Y = elm.Y3;
				}break;
				case "quadraticCurveTo":{
					graphics.quadraticCurveTo(elm.X1,elm.Y1,elm.X2,elm.Y2);
					this.CurrentPosition.X = elm.X2;
					this.CurrentPosition.Y = elm.Y2;
				}break;
				case "rectTo":{
					graphics.rect(this.CurrentPosition.X,this.CurrentPosition.Y,elm.Width,elm.Height);
				}break;
				case "addString":{
					graphics.textBaseline = elm.BaseLine;
					graphics.font = elm.Font;
					graphics.fillText(elm.Text,elm.X,elm.Y);
				}break;
				case "addLine":{
					graphics.moveTo(elm.X1,elm.Y1);
					graphics.lineTo(elm.X2,elm.Y2);
				}break;
				case "addPolygon":{
					this.Finish(graphics);
					graphics.beginPath();
					graphics.moveTo(elm.Points[0].X,elm.Points[0].Y);
					var pts = elm.Points;
					{
						var _g2 = 0;
						while(_g2 < pts.length) {
							var pt = pts[_g2];
							++_g2;
							graphics.lineTo(pt.X,pt.Y);
						}
					}
					graphics.closePath();
					this.Finish(graphics);
					graphics.beginPath();
				}break;
				case "addArc":{
					graphics.arc(elm.X,elm.Y,elm.Radius,elm.StartAngle,elm.SweepAngle,false);
				}break;
				case "addBezier":{
					graphics.moveTo(elm.X1,elm.Y1);
					graphics.bezierCurveTo(elm.X2,elm.Y2,elm.X3,elm.Y3,elm.X4,elm.Y4);
				}break;
				case "addEllipse":{
					this.Finish(graphics);
					this.DrawEllipse(graphics,elm.X,elm.Y,elm.Width,elm.Height);
					graphics.beginPath();
				}break;
				case "addRect":{
					graphics.rect(elm.X,elm.Y,elm.Width,elm.Height);
				}break;
				}
			}
			catch( $e4 ) {
				if( js.Boot.__instanceof($e4,String) ) {
					var err = $e4;
					{
						throw err;
					}
				} else throw($e4);
			}
		}
	}
	this.Finish(graphics);
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.DrawEllipse = function(ctx,x,y,w,h) {
	var kappa = .5522848;
	var ox = (w / 2) * kappa, oy = (h / 2) * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
	ctx.beginPath();
	ctx.moveTo(x,ym);
	ctx.bezierCurveTo(x,ym - oy,xm - ox,y,xm,y);
	ctx.bezierCurveTo(xm + ox,y,xe,ym - oy,xe,ym);
	ctx.bezierCurveTo(xe,ym + oy,xm + ox,ye,xm,ye);
	ctx.bezierCurveTo(xm - ox,ye,x,ym + oy,x,ym);
	ctx.closePath();
	ctx.stroke();
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.EllipseTo = function(w,h) {
	this.Path.push({ Command : "ellipseTo", Width : w, Height : h});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.Finish = function(graphics) {
	if(this.IsFilled) {
		graphics.fill();
	}
	else {
		graphics.stroke();
	}
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.IsFilled = null;
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.LineTo = function(x,y) {
	this.Path.push({ Command : "lineTo", X : (x) + 0.5, Y : (y) + 0.5});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.MoveTo = function(x,y) {
	this.Path.push({ Command : "moveTo", X : Math.round(x) + 0.5, Y : Math.round(y) + 0.5});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.Path = null;
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.PenWidth = null;
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.QuadraticCurveTo = function(x1,y1,x2,y2) {
	this.Path.push({ Command : "quadraticCurveTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.RectTo = function(w,h) {
	this.Path.push({ Command : "rectTo", Width : w, Height : h});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.StartFigure = function() {
	this.Path.push({ Command : "startFigure"});
}
net.coderline.jsgs.tablature.drawing.DrawingLayer.prototype.__class__ = net.coderline.jsgs.tablature.drawing.DrawingLayer;
net.coderline.jsgs.model.GsTrack = function(factory) { if( factory === $_ ) return; {
	this.Number = 0;
	this.Offset = 0;
	this.IsSolo = false;
	this.IsMute = false;
	this.Name = "";
	this.Measures = new Array();
	this.Strings = new Array();
	this.Channel = factory.NewMidiChannel();
	this.Color = new net.coderline.jsgs.model.GsColor(255,0,0);
}}
net.coderline.jsgs.model.GsTrack.__name__ = ["net","coderline","jsgs","model","GsTrack"];
net.coderline.jsgs.model.GsTrack.prototype.AddMeasure = function(measure) {
	measure.Track = this;
	this.Measures.push(measure);
}
net.coderline.jsgs.model.GsTrack.prototype.Channel = null;
net.coderline.jsgs.model.GsTrack.prototype.Color = null;
net.coderline.jsgs.model.GsTrack.prototype.FretCount = null;
net.coderline.jsgs.model.GsTrack.prototype.Is12StringedGuitarTrack = null;
net.coderline.jsgs.model.GsTrack.prototype.IsBanjoTrack = null;
net.coderline.jsgs.model.GsTrack.prototype.IsMute = null;
net.coderline.jsgs.model.GsTrack.prototype.IsPercussionTrack = null;
net.coderline.jsgs.model.GsTrack.prototype.IsSolo = null;
net.coderline.jsgs.model.GsTrack.prototype.MeasureCount = function() {
	return this.Measures.length;
}
net.coderline.jsgs.model.GsTrack.prototype.Measures = null;
net.coderline.jsgs.model.GsTrack.prototype.Name = null;
net.coderline.jsgs.model.GsTrack.prototype.Number = null;
net.coderline.jsgs.model.GsTrack.prototype.Offset = null;
net.coderline.jsgs.model.GsTrack.prototype.Port = null;
net.coderline.jsgs.model.GsTrack.prototype.Song = null;
net.coderline.jsgs.model.GsTrack.prototype.StringCount = function() {
	return this.Strings.length;
}
net.coderline.jsgs.model.GsTrack.prototype.Strings = null;
net.coderline.jsgs.model.GsTrack.prototype.__class__ = net.coderline.jsgs.model.GsTrack;
net.coderline.jsgs.model.GsNoteEffect = function(p) { if( p === $_ ) return; {
	this.Bend = null;
	this.TremoloBar = null;
	this.Harmonic = null;
	this.Grace = null;
	this.Trill = null;
	this.TremoloPicking = null;
	this.Vibrato = false;
	this.DeadNote = false;
	this.Slide = false;
	this.Hammer = false;
	this.GhostNote = false;
	this.AccentuatedNote = false;
	this.HeavyAccentuatedNote = false;
	this.PalmMute = false;
	this.Staccato = false;
	this.Tapping = false;
	this.Slapping = false;
	this.Popping = false;
	this.FadeIn = false;
	this.LetRing = false;
}}
net.coderline.jsgs.model.GsNoteEffect.__name__ = ["net","coderline","jsgs","model","GsNoteEffect"];
net.coderline.jsgs.model.GsNoteEffect.prototype.AccentuatedNote = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Bend = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Clone = function(factory) {
	var effect = factory.NewEffect();
	effect.Vibrato = this.Vibrato;
	effect.DeadNote = this.DeadNote;
	effect.Slide = this.Slide;
	effect.SlideType = this.SlideType;
	effect.Hammer = this.Hammer;
	effect.GhostNote = this.GhostNote;
	effect.AccentuatedNote = this.AccentuatedNote;
	effect.HeavyAccentuatedNote = this.HeavyAccentuatedNote;
	effect.PalmMute = this.PalmMute;
	effect.Staccato = this.Staccato;
	effect.Tapping = this.Tapping;
	effect.Slapping = this.Slapping;
	effect.Popping = this.Popping;
	effect.FadeIn = this.FadeIn;
	effect.LetRing = this.LetRing;
	effect.Bend = (this.IsBend()?this.Bend.Clone(factory):null);
	effect.TremoloBar = (this.IsTremoloBar()?this.TremoloBar.Clone(factory):null);
	effect.Harmonic = (this.IsHarmonic()?this.Harmonic.Clone(factory):null);
	effect.Grace = (this.IsGrace()?this.Grace.Clone(factory):null);
	effect.Trill = (this.IsTrill()?this.Trill.Clone(factory):null);
	effect.TremoloPicking = (this.IsTremoloPicking()?this.TremoloPicking.Clone(factory):null);
	return effect;
}
net.coderline.jsgs.model.GsNoteEffect.prototype.DeadNote = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.FadeIn = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.GhostNote = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Grace = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Hammer = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Harmonic = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.HeavyAccentuatedNote = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.IsBend = function() {
	return this.Bend != null && this.Bend.Points.length != 0;
}
net.coderline.jsgs.model.GsNoteEffect.prototype.IsGrace = function() {
	return this.Grace != null;
}
net.coderline.jsgs.model.GsNoteEffect.prototype.IsHarmonic = function() {
	return this.Harmonic != null;
}
net.coderline.jsgs.model.GsNoteEffect.prototype.IsTremoloBar = function() {
	return this.TremoloBar != null;
}
net.coderline.jsgs.model.GsNoteEffect.prototype.IsTremoloPicking = function() {
	return this.TremoloPicking != null;
}
net.coderline.jsgs.model.GsNoteEffect.prototype.IsTrill = function() {
	return this.Trill != null;
}
net.coderline.jsgs.model.GsNoteEffect.prototype.LetRing = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.PalmMute = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Popping = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Slapping = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Slide = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.SlideType = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Staccato = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Tapping = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.TremoloBar = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.TremoloPicking = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Trill = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.Vibrato = null;
net.coderline.jsgs.model.GsNoteEffect.prototype.__class__ = net.coderline.jsgs.model.GsNoteEffect;
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
if(typeof haxe=='undefined') haxe = {}
if(!haxe.remoting) haxe.remoting = {}
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
net.coderline.jsgs.model.GsColor = function(r,g,b) { if( r === $_ ) return; {
	if(b == null) b = 0;
	if(g == null) g = 0;
	if(r == null) r = 0;
	this.R = r;
	this.G = g;
	this.B = b;
}}
net.coderline.jsgs.model.GsColor.__name__ = ["net","coderline","jsgs","model","GsColor"];
net.coderline.jsgs.model.GsColor.prototype.B = null;
net.coderline.jsgs.model.GsColor.prototype.G = null;
net.coderline.jsgs.model.GsColor.prototype.R = null;
net.coderline.jsgs.model.GsColor.prototype.toString = function() {
	var s = "rgb(";
	s += Std.string(this.R) + ",";
	s += Std.string(this.G) + ",";
	s += Std.string(this.B) + ")";
	return s;
}
net.coderline.jsgs.model.GsColor.prototype.__class__ = net.coderline.jsgs.model.GsColor;
net.coderline.jsgs.model.GsMarker = function(p) { if( p === $_ ) return; {
	this.Title = "Untitled";
	this.Color = new net.coderline.jsgs.model.GsColor(255,0,0);
}}
net.coderline.jsgs.model.GsMarker.__name__ = ["net","coderline","jsgs","model","GsMarker"];
net.coderline.jsgs.model.GsMarker.prototype.Color = null;
net.coderline.jsgs.model.GsMarker.prototype.MeasureHeader = null;
net.coderline.jsgs.model.GsMarker.prototype.Title = null;
net.coderline.jsgs.model.GsMarker.prototype.__class__ = net.coderline.jsgs.model.GsMarker;
net.coderline.jsgs.tablature.drawing.MusicFont = function() { }
net.coderline.jsgs.tablature.drawing.MusicFont.__name__ = ["net","coderline","jsgs","tablature","drawing","MusicFont"];
net.coderline.jsgs.tablature.drawing.MusicFont.prototype.__class__ = net.coderline.jsgs.tablature.drawing.MusicFont;
net.coderline.jsgs.model.GsMeasureClefConverter = function() { }
net.coderline.jsgs.model.GsMeasureClefConverter.__name__ = ["net","coderline","jsgs","model","GsMeasureClefConverter"];
net.coderline.jsgs.model.GsMeasureClefConverter.ToInt = function(clef) {
	switch(clef) {
	case net.coderline.jsgs.model.GsMeasureClef.Treble:{
		return 1;
	}break;
	case net.coderline.jsgs.model.GsMeasureClef.Bass:{
		return 2;
	}break;
	case net.coderline.jsgs.model.GsMeasureClef.Tenor:{
		return 3;
	}break;
	case net.coderline.jsgs.model.GsMeasureClef.Alto:{
		return 4;
	}break;
	default:{
		return 1;
	}break;
	}
}
net.coderline.jsgs.model.GsMeasureClefConverter.prototype.__class__ = net.coderline.jsgs.model.GsMeasureClefConverter;
net.coderline.jsgs.tablature.TrackSpacing = function(p) { if( p === $_ ) return; {
	this.Spacing = new Array();
	{
		var _g = 0;
		while(_g < 22) {
			var i = _g++;
			this.Spacing.push(0);
		}
	}
}}
net.coderline.jsgs.tablature.TrackSpacing.__name__ = ["net","coderline","jsgs","tablature","TrackSpacing"];
net.coderline.jsgs.tablature.TrackSpacing.prototype.Get = function(index) {
	var spacing = 0;
	var realIndex = net.coderline.jsgs.tablature.TrackSpacingPositionConverter.ToInt(index);
	{
		var _g = 0;
		while(_g < realIndex) {
			var i = _g++;
			spacing += this.Spacing[i];
		}
	}
	return spacing;
}
net.coderline.jsgs.tablature.TrackSpacing.prototype.GetSize = function() {
	return this.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.Bottom);
}
net.coderline.jsgs.tablature.TrackSpacing.prototype.Set = function(index,value) {
	var realIndex = net.coderline.jsgs.tablature.TrackSpacingPositionConverter.ToInt(index);
	this.Spacing[realIndex] = value;
}
net.coderline.jsgs.tablature.TrackSpacing.prototype.Spacing = null;
net.coderline.jsgs.tablature.TrackSpacing.prototype.__class__ = net.coderline.jsgs.tablature.TrackSpacing;
net.coderline.jsgs.model.GsSlideType = { __ename__ : ["net","coderline","jsgs","model","GsSlideType"], __constructs__ : ["FastSlideTo","SlowSlideTo","OutDownWards","OutUpWards","IntoFromBelow","IntoFromAbove"] }
net.coderline.jsgs.model.GsSlideType.FastSlideTo = ["FastSlideTo",0];
net.coderline.jsgs.model.GsSlideType.FastSlideTo.toString = $estr;
net.coderline.jsgs.model.GsSlideType.FastSlideTo.__enum__ = net.coderline.jsgs.model.GsSlideType;
net.coderline.jsgs.model.GsSlideType.IntoFromAbove = ["IntoFromAbove",5];
net.coderline.jsgs.model.GsSlideType.IntoFromAbove.toString = $estr;
net.coderline.jsgs.model.GsSlideType.IntoFromAbove.__enum__ = net.coderline.jsgs.model.GsSlideType;
net.coderline.jsgs.model.GsSlideType.IntoFromBelow = ["IntoFromBelow",4];
net.coderline.jsgs.model.GsSlideType.IntoFromBelow.toString = $estr;
net.coderline.jsgs.model.GsSlideType.IntoFromBelow.__enum__ = net.coderline.jsgs.model.GsSlideType;
net.coderline.jsgs.model.GsSlideType.OutDownWards = ["OutDownWards",2];
net.coderline.jsgs.model.GsSlideType.OutDownWards.toString = $estr;
net.coderline.jsgs.model.GsSlideType.OutDownWards.__enum__ = net.coderline.jsgs.model.GsSlideType;
net.coderline.jsgs.model.GsSlideType.OutUpWards = ["OutUpWards",3];
net.coderline.jsgs.model.GsSlideType.OutUpWards.toString = $estr;
net.coderline.jsgs.model.GsSlideType.OutUpWards.__enum__ = net.coderline.jsgs.model.GsSlideType;
net.coderline.jsgs.model.GsSlideType.SlowSlideTo = ["SlowSlideTo",1];
net.coderline.jsgs.model.GsSlideType.SlowSlideTo.toString = $estr;
net.coderline.jsgs.model.GsSlideType.SlowSlideTo.__enum__ = net.coderline.jsgs.model.GsSlideType;
net.coderline.jsgs.tablature.drawing.ClefPainter = function() { }
net.coderline.jsgs.tablature.drawing.ClefPainter.__name__ = ["net","coderline","jsgs","tablature","drawing","ClefPainter"];
net.coderline.jsgs.tablature.drawing.ClefPainter.PaintAlto = function(context,x,y,layout) {
	y -= Math.round(3.0 * layout.ScoreLineSpacing);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.AltoClef,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.ClefPainter.PaintBass = function(context,x,y,layout) {
	y -= Math.round(4.0 * layout.ScoreLineSpacing);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.BassClef,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.ClefPainter.PaintTenor = function(context,x,y,layout) {
	y -= Math.round(4.0 * layout.ScoreLineSpacing);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.TenorClef,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.ClefPainter.PaintTreble = function(context,x,y,layout) {
	y -= Math.round(layout.ScoreLineSpacing);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.TrebleClef,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.ClefPainter.prototype.__class__ = net.coderline.jsgs.tablature.drawing.ClefPainter;
net.coderline.jsgs.model.effects.GsHarmonicType = { __ename__ : ["net","coderline","jsgs","model","effects","GsHarmonicType"], __constructs__ : ["Natural","Artificial","Tapped","Pinch","Semi"] }
net.coderline.jsgs.model.effects.GsHarmonicType.Artificial = ["Artificial",1];
net.coderline.jsgs.model.effects.GsHarmonicType.Artificial.toString = $estr;
net.coderline.jsgs.model.effects.GsHarmonicType.Artificial.__enum__ = net.coderline.jsgs.model.effects.GsHarmonicType;
net.coderline.jsgs.model.effects.GsHarmonicType.Natural = ["Natural",0];
net.coderline.jsgs.model.effects.GsHarmonicType.Natural.toString = $estr;
net.coderline.jsgs.model.effects.GsHarmonicType.Natural.__enum__ = net.coderline.jsgs.model.effects.GsHarmonicType;
net.coderline.jsgs.model.effects.GsHarmonicType.Pinch = ["Pinch",3];
net.coderline.jsgs.model.effects.GsHarmonicType.Pinch.toString = $estr;
net.coderline.jsgs.model.effects.GsHarmonicType.Pinch.__enum__ = net.coderline.jsgs.model.effects.GsHarmonicType;
net.coderline.jsgs.model.effects.GsHarmonicType.Semi = ["Semi",4];
net.coderline.jsgs.model.effects.GsHarmonicType.Semi.toString = $estr;
net.coderline.jsgs.model.effects.GsHarmonicType.Semi.__enum__ = net.coderline.jsgs.model.effects.GsHarmonicType;
net.coderline.jsgs.model.effects.GsHarmonicType.Tapped = ["Tapped",2];
net.coderline.jsgs.model.effects.GsHarmonicType.Tapped.toString = $estr;
net.coderline.jsgs.model.effects.GsHarmonicType.Tapped.__enum__ = net.coderline.jsgs.model.effects.GsHarmonicType;
net.coderline.jsgs.tablature.ViewLayout = function(p) { if( p === $_ ) return; {
	this.Init(1);
	this.CompactMode = true;
}}
net.coderline.jsgs.tablature.ViewLayout.__name__ = ["net","coderline","jsgs","tablature","ViewLayout"];
net.coderline.jsgs.tablature.ViewLayout.prototype.CheckDefaultSpacing = function(ts) {
	var minBufferSeparator = this.MinBufferSeparator;
	var bufferSeparator = ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreUpLines) - ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.BufferSeparator);
	if(bufferSeparator < minBufferSeparator) {
		ts.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.BufferSeparator,Math.round(minBufferSeparator - bufferSeparator));
	}
	var checkPosition = ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines);
	if(checkPosition >= 0 && checkPosition < this.MinTopSpacing) {
		ts.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.Top,Math.round(this.MinTopSpacing - checkPosition));
	}
}
net.coderline.jsgs.tablature.ViewLayout.prototype.ChordFretIndexSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.ChordFretSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.ChordNoteSize = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.ChordStringSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.CompactMode = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.EffectSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.FirstMeasureSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.FirstTrackSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.FontScale = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.GetDefaultChordSpacing = function() {
	var spacing = 0;
	spacing += (6 * this.ChordFretSpacing) + this.ChordFretSpacing;
	spacing += Math.round(15.0 * this.Scale);
	return Math.round(spacing);
}
net.coderline.jsgs.tablature.ViewLayout.prototype.GetMinSpacing = function(duration) {
	var scale = this.Scale;
	switch(duration.Value) {
	case 1:{
		return 50.0 * scale;
	}break;
	case 2:{
		return 30.0 * scale;
	}break;
	case 4:{
		return 55.0 * scale;
	}break;
	case 8:{
		return 20.0 * scale;
	}break;
	default:{
		return 18.0 * this.Scale;
	}break;
	}
}
net.coderline.jsgs.tablature.ViewLayout.prototype.GetNoteOrientation = function(x,y,note) {
	var noteAsString = "";
	if(note.IsTiedNote) {
		noteAsString = "L";
	}
	else if(note.Effect.DeadNote) {
		noteAsString = "X";
	}
	else {
		noteAsString = Std.string(note.Value);
	}
	noteAsString = (note.Effect.GhostNote?("(" + noteAsString) + ")":noteAsString);
	return this.GetOrientation(x,y,noteAsString);
}
net.coderline.jsgs.tablature.ViewLayout.prototype.GetOrientation = function(x,y,str) {
	this.Tablature.Ctx.font = net.coderline.jsgs.tablature.drawing.DrawingResources.NoteFont;
	var size = this.Tablature.Ctx.measureText(str);
	return new net.coderline.jsgs.model.Rectangle(x,y,size.width,net.coderline.jsgs.tablature.drawing.DrawingResources.NoteFontHeight);
}
net.coderline.jsgs.tablature.ViewLayout.prototype.GetSpacingForQuarter = function(duration) {
	return (960 / duration.Time()) * this.GetMinSpacing(duration);
}
net.coderline.jsgs.tablature.ViewLayout.prototype.GetVoiceWidth = function(voice) {
	var scale = this.Scale;
	var duration = voice.Duration;
	if(duration != null) {
		switch(duration.Value) {
		case 1:{
			return (30.0 * scale);
		}break;
		case 2:{
			return (25.0 * scale);
		}break;
		case 4:{
			return (21.0 * scale);
		}break;
		case 8:{
			return (20.0 * scale);
		}break;
		case 16:{
			return (19.0 * scale);
		}break;
		case 32:{
			return (18.0 * scale);
		}break;
		default:{
			return (17.0 * scale);
		}break;
		}
	}
	return 20.0 * scale;
}
net.coderline.jsgs.tablature.ViewLayout.prototype.Height = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.Init = function(scale) {
	this.StringSpacing = (10 * scale);
	this.ScoreLineSpacing = (8 * scale);
	this.Scale = scale;
	this.FontScale = this.Scale;
	this.FirstMeasureSpacing = Math.round(10 * this.Scale);
	this.MinBufferSeparator = this.FirstMeasureSpacing;
	this.MinTopSpacing = Math.round(30 * this.Scale);
	this.MinScoreTabSpacing = this.FirstMeasureSpacing;
	this.ScoreSpacing = (this.ScoreLineSpacing * 4) + this.MinScoreTabSpacing;
	this.FirstTrackSpacing = this.FirstMeasureSpacing;
	this.TrackSpacing = (10 * this.Scale);
	this.ChordFretIndexSpacing = Math.round(8 * this.Scale);
	this.ChordStringSpacing = Math.round(5 * this.Scale);
	this.ChordFretSpacing = Math.round(6 * this.Scale);
	this.ChordNoteSize = Math.round(4 * this.Scale);
	this.RepeatEndingSpacing = Math.round(20 * this.Scale);
	this.TextSpacing = Math.round(15 * this.Scale);
	this.MarkerSpacing = Math.round(15 * this.Scale);
	this.TupletoSpacing = Math.round(15 * this.Scale);
	this.EffectSpacing = Math.round(10 * this.Scale);
}
net.coderline.jsgs.tablature.ViewLayout.prototype.IsFirstMeasure = function(measure) {
	return measure.Number() == 1;
}
net.coderline.jsgs.tablature.ViewLayout.prototype.IsLastMeasure = function(measure) {
	return measure.Number() == this.Tablature.Track.Song.MeasureHeaders.length;
}
net.coderline.jsgs.tablature.ViewLayout.prototype.LayoutSize = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.MarkerSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.MinBufferSeparator = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.MinScoreTabSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.MinTopSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.PaintCache = function(graphics,area,fromX,fromY) {
	var context = new net.coderline.jsgs.tablature.drawing.DrawingContext(this.Scale);
	context.Graphics = graphics;
	this.PaintSong(context,area,fromX,fromY);
	context.Draw();
}
net.coderline.jsgs.tablature.ViewLayout.prototype.PaintLines = function(track,ts,context,x,y,width) {
	if(width > 0) {
		var tempX = Math.max(0,x);
		var tempY = y;
		var posY = tempY + ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines);
		{
			var _g = 1;
			while(_g < 6) {
				var i = _g++;
				context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines).StartFigure();
				context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines).AddLine(Math.round(tempX),Math.round(posY),Math.round(tempX + width),Math.round(posY));
				posY += (this.ScoreLineSpacing);
			}
		}
		tempY += ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature);
		{
			var _g1 = 0, _g = track.StringCount();
			while(_g1 < _g) {
				var i = _g1++;
				context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines).StartFigure();
				context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines).AddLine(Math.round(tempX),Math.round(tempY),Math.round(tempX + width),Math.round(tempY));
				tempY += this.StringSpacing;
			}
		}
	}
}
net.coderline.jsgs.tablature.ViewLayout.prototype.PaintSong = function(ctx,clientArea,x,y) {
	null;
}
net.coderline.jsgs.tablature.ViewLayout.prototype.PrepareLayout = function(clientArea,x,y) {
	null;
}
net.coderline.jsgs.tablature.ViewLayout.prototype.RepeatEndingSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.Scale = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.ScoreLineSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.ScoreSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.SetTablature = function(tablature) {
	this.Tablature = tablature;
}
net.coderline.jsgs.tablature.ViewLayout.prototype.SongManager = function() {
	return this.Tablature.SongManager;
}
net.coderline.jsgs.tablature.ViewLayout.prototype.StringSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.Tablature = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.TextSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.TrackSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.TupletoSpacing = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.UpdateSong = function() {
	if(this.Tablature.Track == null) return;
	this.UpdateTracks();
}
net.coderline.jsgs.tablature.ViewLayout.prototype.UpdateTracks = function() {
	var song = this.Tablature.Track.Song;
	var trackCount = song.Tracks.length;
	var measureCount = song.MeasureHeaders.length;
	{
		var _g = 0;
		while(_g < trackCount) {
			var j = _g++;
			var track = song.Tracks[j];
			track.PreviousBeat = null;
		}
	}
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			var header = song.MeasureHeaders[i];
			header.Update(this,i);
			{
				var _g1 = 0;
				while(_g1 < trackCount) {
					var j = _g1++;
					var track = song.Tracks[j];
					var measure = track.Measures[i];
					measure.Create(this);
				}
			}
			{
				var _g1 = 0;
				while(_g1 < trackCount) {
					var j = _g1++;
					var track = song.Tracks[j];
					var measure = track.Measures[i];
					track.Update(this);
					measure.Update(this);
				}
			}
		}
	}
}
net.coderline.jsgs.tablature.ViewLayout.prototype.Width = null;
net.coderline.jsgs.tablature.ViewLayout.prototype.__class__ = net.coderline.jsgs.tablature.ViewLayout;
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
net.coderline.jsgs.model.GsTimeSignature = function(factory) { if( factory === $_ ) return; {
	this.Numerator = 4;
	this.Denominator = factory.NewDuration();
}}
net.coderline.jsgs.model.GsTimeSignature.__name__ = ["net","coderline","jsgs","model","GsTimeSignature"];
net.coderline.jsgs.model.GsTimeSignature.prototype.Copy = function(timeSignature) {
	timeSignature.Numerator = this.Numerator;
	this.Denominator.Copy(timeSignature.Denominator);
}
net.coderline.jsgs.model.GsTimeSignature.prototype.Denominator = null;
net.coderline.jsgs.model.GsTimeSignature.prototype.Numerator = null;
net.coderline.jsgs.model.GsTimeSignature.prototype.__class__ = net.coderline.jsgs.model.GsTimeSignature;
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
		catch( $e7 ) {
			{
				var e = $e7;
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
	catch( $e8 ) {
		{
			var e = $e8;
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
net.coderline.jsgs.file.FileFormatException = function(message) { if( message === $_ ) return; {
	if(message == null) message = "";
	this.Message = message;
}}
net.coderline.jsgs.file.FileFormatException.__name__ = ["net","coderline","jsgs","file","FileFormatException"];
net.coderline.jsgs.file.FileFormatException.prototype.Message = null;
net.coderline.jsgs.file.FileFormatException.prototype.__class__ = net.coderline.jsgs.file.FileFormatException;
net.coderline.jsgs.model.GsDuration = function(factory) { if( factory === $_ ) return; {
	this.Value = 4;
	this.IsDotted = false;
	this.IsDoubleDotted = false;
	this.Triplet = factory.NewTriplet();
}}
net.coderline.jsgs.model.GsDuration.__name__ = ["net","coderline","jsgs","model","GsDuration"];
net.coderline.jsgs.model.GsDuration.FromTime = function(factory,time,minimum,diff) {
	var duration = minimum.Clone(factory);
	var tmp = factory.NewDuration();
	tmp.Value = 1;
	tmp.IsDotted = true;
	var finish = false;
	while(!finish) {
		var tmpTime = tmp.Time();
		if(tmpTime - diff <= time) {
			if(Math.abs(tmpTime - time) < Math.abs(duration.Time() - time)) {
				duration = tmp.Clone(factory);
			}
		}
		if(tmp.IsDotted) {
			tmp.IsDotted = false;
		}
		else if(tmp.Triplet.Equals(new net.coderline.jsgs.model.GsTriplet())) {
			tmp.Triplet.Enters = 3;
			tmp.Triplet.Times = 2;
		}
		else {
			tmp.Value = tmp.Value * 2;
			tmp.IsDotted = true;
			tmp.Triplet.Enters = 1;
			tmp.Triplet.Times = 1;
		}
		if(tmp.Value > 64) {
			finish = true;
		}
	}
	return duration;
}
net.coderline.jsgs.model.GsDuration.prototype.Clone = function(factory) {
	var duration = factory.NewDuration();
	duration.Value = this.Value;
	duration.IsDotted = this.IsDotted;
	duration.IsDoubleDotted = this.IsDoubleDotted;
	duration.Triplet = this.Triplet.Clone(factory);
	return duration;
}
net.coderline.jsgs.model.GsDuration.prototype.Copy = function(duration) {
	duration.Value = this.Value;
	duration.IsDotted = this.IsDotted;
	duration.IsDoubleDotted = this.IsDoubleDotted;
	this.Triplet.Copy(duration.Triplet);
}
net.coderline.jsgs.model.GsDuration.prototype.Equals = function(other) {
	if(other == null) return false;
	if(this == other) return true;
	return other.Value == this.Value && other.IsDotted == this.IsDotted && other.IsDoubleDotted == this.IsDoubleDotted && other.Triplet.Equals(this.Triplet);
}
net.coderline.jsgs.model.GsDuration.prototype.Index = function() {
	var index = 0;
	var value = this.Value;
	while((value = (value >> 1)) > 0) {
		index++;
	}
	return index;
}
net.coderline.jsgs.model.GsDuration.prototype.IsDotted = null;
net.coderline.jsgs.model.GsDuration.prototype.IsDoubleDotted = null;
net.coderline.jsgs.model.GsDuration.prototype.Time = function() {
	var time = Math.floor(960 * (4.0 / this.Value));
	if(this.IsDotted) {
		time += Math.floor(time / 2);
	}
	else if(this.IsDoubleDotted) {
		time += Math.floor((time / 4) * 3);
	}
	return this.Triplet.ConvertTime(time);
}
net.coderline.jsgs.model.GsDuration.prototype.Triplet = null;
net.coderline.jsgs.model.GsDuration.prototype.Value = null;
net.coderline.jsgs.model.GsDuration.prototype.__class__ = net.coderline.jsgs.model.GsDuration;
net.coderline.jsgs.model.GsMeasureHeader = function(factory) { if( factory === $_ ) return; {
	this.Number = 0;
	this.Start = 960;
	this.TimeSignature = factory.NewTimeSignature();
	this.KeySignature = 0;
	this.Tempo = factory.NewTempo();
	this.Marker = null;
	this.TripletFeel = net.coderline.jsgs.model.GsTripletFeel.None;
	this.IsRepeatOpen = false;
	this.RepeatClose = 0;
	this.RepeatAlternative = 0;
}}
net.coderline.jsgs.model.GsMeasureHeader.__name__ = ["net","coderline","jsgs","model","GsMeasureHeader"];
net.coderline.jsgs.model.GsMeasureHeader.prototype.HasDoubleBar = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.HasMarker = function() {
	return this.Marker != null;
}
net.coderline.jsgs.model.GsMeasureHeader.prototype.IsRepeatOpen = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.KeySignature = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.KeySignatureType = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.Length = function() {
	return this.TimeSignature.Numerator * this.TimeSignature.Denominator.Time();
}
net.coderline.jsgs.model.GsMeasureHeader.prototype.Marker = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.Number = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.RepeatAlternative = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.RepeatClose = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.Song = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.Start = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.Tempo = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.TimeSignature = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.TripletFeel = null;
net.coderline.jsgs.model.GsMeasureHeader.prototype.__class__ = net.coderline.jsgs.model.GsMeasureHeader;
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
	catch( $e9 ) {
		if( js.Boot.__instanceof($e9,haxe.io.Eof) ) {
			var e = $e9;
			null;
		} else throw($e9);
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
	catch( $e10 ) {
		if( js.Boot.__instanceof($e10,haxe.io.Eof) ) {
			var e = $e10;
			{
				s = buf.b.join("");
				if(s.length == 0) throw (e);
			}
		} else throw($e10);
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
net.coderline.jsgs.model.GsPageSetup = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.model.GsPageSetup.__name__ = ["net","coderline","jsgs","model","GsPageSetup"];
net.coderline.jsgs.model.GsPageSetup.Defaults = function() {
	if(net.coderline.jsgs.model.GsPageSetup._defaults == null) {
		net.coderline.jsgs.model.GsPageSetup._defaults = new net.coderline.jsgs.model.GsPageSetup();
		net.coderline.jsgs.model.GsPageSetup._defaults.PageSize = new net.coderline.jsgs.model.Point(210,297);
		net.coderline.jsgs.model.GsPageSetup._defaults.PageMargin = new net.coderline.jsgs.model.Rectangle(10,15,10,10);
		net.coderline.jsgs.model.GsPageSetup._defaults.ScoreSizeProportion = 1;
		net.coderline.jsgs.model.GsPageSetup._defaults.HeaderAndFooter = 511;
		net.coderline.jsgs.model.GsPageSetup._defaults.Title = "%TITLE%";
		net.coderline.jsgs.model.GsPageSetup._defaults.Subtitle = "%SUBTITLE%";
		net.coderline.jsgs.model.GsPageSetup._defaults.Artist = "%ARTIST%";
		net.coderline.jsgs.model.GsPageSetup._defaults.Album = "%ALBUM%";
		net.coderline.jsgs.model.GsPageSetup._defaults.Words = "Words by %WORDS%";
		net.coderline.jsgs.model.GsPageSetup._defaults.Music = "Music by %MUSIC%";
		net.coderline.jsgs.model.GsPageSetup._defaults.WordsAndMusic = "Words & Music by %WORDSMUSIC%";
		net.coderline.jsgs.model.GsPageSetup._defaults.Copyright = "Copyright %COPYRIGHT%\n" + "All Rights Reserved - International Copyright Secured";
		net.coderline.jsgs.model.GsPageSetup._defaults.PageNumber = "Page %N%/%P%";
	}
	return net.coderline.jsgs.model.GsPageSetup._defaults;
}
net.coderline.jsgs.model.GsPageSetup.prototype.Album = null;
net.coderline.jsgs.model.GsPageSetup.prototype.Artist = null;
net.coderline.jsgs.model.GsPageSetup.prototype.Copyright = null;
net.coderline.jsgs.model.GsPageSetup.prototype.HeaderAndFooter = null;
net.coderline.jsgs.model.GsPageSetup.prototype.Music = null;
net.coderline.jsgs.model.GsPageSetup.prototype.PageMargin = null;
net.coderline.jsgs.model.GsPageSetup.prototype.PageNumber = null;
net.coderline.jsgs.model.GsPageSetup.prototype.PageSize = null;
net.coderline.jsgs.model.GsPageSetup.prototype.ScoreSizeProportion = null;
net.coderline.jsgs.model.GsPageSetup.prototype.Subtitle = null;
net.coderline.jsgs.model.GsPageSetup.prototype.Title = null;
net.coderline.jsgs.model.GsPageSetup.prototype.Words = null;
net.coderline.jsgs.model.GsPageSetup.prototype.WordsAndMusic = null;
net.coderline.jsgs.model.GsPageSetup.prototype.__class__ = net.coderline.jsgs.model.GsPageSetup;
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
net.coderline.jsgs.model.effects.GsTremoloBarEffect = function(p) { if( p === $_ ) return; {
	this.Points = new Array();
}}
net.coderline.jsgs.model.effects.GsTremoloBarEffect.__name__ = ["net","coderline","jsgs","model","effects","GsTremoloBarEffect"];
net.coderline.jsgs.model.effects.GsTremoloBarEffect.prototype.Clone = function(factory) {
	var effect = factory.NewTremoloBarEffect();
	effect.Type = this.Type;
	effect.Value = this.Value;
	{
		var _g1 = 0, _g = this.Points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.Points[i];
			effect.Points.push(new net.coderline.jsgs.model.effects.GsTremoloBarPoint(point.Position,point.Value,point.Vibrato));
		}
	}
	return effect;
}
net.coderline.jsgs.model.effects.GsTremoloBarEffect.prototype.Points = null;
net.coderline.jsgs.model.effects.GsTremoloBarEffect.prototype.Type = null;
net.coderline.jsgs.model.effects.GsTremoloBarEffect.prototype.Value = null;
net.coderline.jsgs.model.effects.GsTremoloBarEffect.prototype.__class__ = net.coderline.jsgs.model.effects.GsTremoloBarEffect;
net.coderline.jsgs.model.GsSongFactory = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.model.GsSongFactory.__name__ = ["net","coderline","jsgs","model","GsSongFactory"];
net.coderline.jsgs.model.GsSongFactory.prototype.NewBeat = function() {
	return new net.coderline.jsgs.model.GsBeat(this);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewBendEffect = function() {
	return new net.coderline.jsgs.model.effects.GsBendEffect();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewChord = function(stringCount) {
	return new net.coderline.jsgs.model.GsChord(stringCount);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewDuration = function() {
	return new net.coderline.jsgs.model.GsDuration(this);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewEffect = function() {
	return new net.coderline.jsgs.model.GsNoteEffect();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewGraceEffect = function() {
	return new net.coderline.jsgs.model.effects.GsGraceEffect();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewHarmonicEffect = function() {
	return new net.coderline.jsgs.model.effects.GsHarmonicEffect();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewLyricLine = function() {
	return new net.coderline.jsgs.model.GsLyricLine();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewLyrics = function() {
	return new net.coderline.jsgs.model.GsLyrics();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewMarker = function() {
	return new net.coderline.jsgs.model.GsMarker();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewMeasure = function(header) {
	return new net.coderline.jsgs.model.GsMeasure(header);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewMeasureHeader = function() {
	return new net.coderline.jsgs.model.GsMeasureHeader(this);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewMidiChannel = function() {
	return new net.coderline.jsgs.model.GsMidiChannel();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewMixTableChange = function() {
	return new net.coderline.jsgs.model.GsMixTableChange();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewNote = function() {
	return new net.coderline.jsgs.model.GsNote(this);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewPageSetup = function() {
	return new net.coderline.jsgs.model.GsPageSetup();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewSong = function() {
	return new net.coderline.jsgs.model.GsSong();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewString = function() {
	return new net.coderline.jsgs.model.GsGuitarString();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewStroke = function() {
	return new net.coderline.jsgs.model.GsBeatStroke();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewTempo = function() {
	return new net.coderline.jsgs.model.GsTempo();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewText = function() {
	return new net.coderline.jsgs.model.GsBeatText();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewTimeSignature = function() {
	return new net.coderline.jsgs.model.GsTimeSignature(this);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewTrack = function() {
	return new net.coderline.jsgs.model.GsTrack(this);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewTremoloBarEffect = function() {
	return new net.coderline.jsgs.model.effects.GsTremoloBarEffect();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewTremoloPickingEffect = function() {
	return new net.coderline.jsgs.model.effects.GsTremoloPickingEffect(this);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewTrillEffect = function() {
	return new net.coderline.jsgs.model.effects.GsTrillEffect(this);
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewTriplet = function() {
	return new net.coderline.jsgs.model.GsTriplet();
}
net.coderline.jsgs.model.GsSongFactory.prototype.NewVoice = function(index) {
	return new net.coderline.jsgs.model.GsVoice(this,index);
}
net.coderline.jsgs.model.GsSongFactory.prototype.__class__ = net.coderline.jsgs.model.GsSongFactory;
net.coderline.jsgs.model.GsMeasureClef = { __ename__ : ["net","coderline","jsgs","model","GsMeasureClef"], __constructs__ : ["Treble","Bass","Tenor","Alto"] }
net.coderline.jsgs.model.GsMeasureClef.Alto = ["Alto",3];
net.coderline.jsgs.model.GsMeasureClef.Alto.toString = $estr;
net.coderline.jsgs.model.GsMeasureClef.Alto.__enum__ = net.coderline.jsgs.model.GsMeasureClef;
net.coderline.jsgs.model.GsMeasureClef.Bass = ["Bass",1];
net.coderline.jsgs.model.GsMeasureClef.Bass.toString = $estr;
net.coderline.jsgs.model.GsMeasureClef.Bass.__enum__ = net.coderline.jsgs.model.GsMeasureClef;
net.coderline.jsgs.model.GsMeasureClef.Tenor = ["Tenor",2];
net.coderline.jsgs.model.GsMeasureClef.Tenor.toString = $estr;
net.coderline.jsgs.model.GsMeasureClef.Tenor.__enum__ = net.coderline.jsgs.model.GsMeasureClef;
net.coderline.jsgs.model.GsMeasureClef.Treble = ["Treble",0];
net.coderline.jsgs.model.GsMeasureClef.Treble.toString = $estr;
net.coderline.jsgs.model.GsMeasureClef.Treble.__enum__ = net.coderline.jsgs.model.GsMeasureClef;
net.coderline.jsgs.model.GsMeasure = function(header) { if( header === $_ ) return; {
	this.Header = header;
	this.Clef = net.coderline.jsgs.model.GsMeasureClef.Treble;
	this.Beats = new Array();
}}
net.coderline.jsgs.model.GsMeasure.__name__ = ["net","coderline","jsgs","model","GsMeasure"];
net.coderline.jsgs.model.GsMeasure.prototype.AddBeat = function(beat) {
	beat.Measure = this;
	this.Beats.push(beat);
}
net.coderline.jsgs.model.GsMeasure.prototype.BeatCount = function() {
	return this.Beats.length;
}
net.coderline.jsgs.model.GsMeasure.prototype.Beats = null;
net.coderline.jsgs.model.GsMeasure.prototype.Clef = null;
net.coderline.jsgs.model.GsMeasure.prototype.End = function() {
	return this.Start() + this.Length();
}
net.coderline.jsgs.model.GsMeasure.prototype.GetKeySignature = function() {
	return this.Header.KeySignature;
}
net.coderline.jsgs.model.GsMeasure.prototype.GetMarker = function() {
	return this.Header.Marker;
}
net.coderline.jsgs.model.GsMeasure.prototype.GetTempo = function() {
	return this.Header.Tempo;
}
net.coderline.jsgs.model.GsMeasure.prototype.GetTimeSignature = function() {
	return this.Header.TimeSignature;
}
net.coderline.jsgs.model.GsMeasure.prototype.GetTripletFeel = function() {
	return this.Header.TripletFeel;
}
net.coderline.jsgs.model.GsMeasure.prototype.HasMarker = function() {
	return this.Header.HasMarker();
}
net.coderline.jsgs.model.GsMeasure.prototype.Header = null;
net.coderline.jsgs.model.GsMeasure.prototype.IsRepeatOpen = function() {
	return this.Header.IsRepeatOpen;
}
net.coderline.jsgs.model.GsMeasure.prototype.KeySignature = function() {
	return this.Header.KeySignature;
}
net.coderline.jsgs.model.GsMeasure.prototype.Length = function() {
	return this.Header.Length();
}
net.coderline.jsgs.model.GsMeasure.prototype.Number = function() {
	return this.Header.Number;
}
net.coderline.jsgs.model.GsMeasure.prototype.RepeatClose = function() {
	return this.Header.RepeatClose;
}
net.coderline.jsgs.model.GsMeasure.prototype.Start = function() {
	return this.Header.Start;
}
net.coderline.jsgs.model.GsMeasure.prototype.Track = null;
net.coderline.jsgs.model.GsMeasure.prototype.__class__ = net.coderline.jsgs.model.GsMeasure;
net.coderline.jsgs.Utf8 = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.Utf8.__name__ = ["net","coderline","jsgs","Utf8"];
net.coderline.jsgs.Utf8.ToUnicode = function(chr) {
	return String.fromCharCode(chr);
}
net.coderline.jsgs.Utf8.prototype.__class__ = net.coderline.jsgs.Utf8;
net.coderline.jsgs.tablature.Tablature = function(canvasId) { if( canvasId === $_ ) return; {
	this.JCanvas = jQuery("#" + canvasId);
	this.Canvas = this.JCanvas.get(0);
	this.Track = null;
	this.SongManager = new net.coderline.jsgs.model.SongManager(new net.coderline.jsgs.tablature.model.GsSongFactoryImpl());
	this.UpdateContext();
	this.ErrorMessage = StringTools.trim(this.JCanvas.text());
	if(this.ErrorMessage == "" || this.ErrorMessage == null) {
		this.ErrorMessage = "Please set a song's track to display the tablature";
	}
	this.Width = this.JCanvas.width();
	this.Height = this.JCanvas.height();
	this.ViewLayout = new net.coderline.jsgs.tablature.PageViewLayout();
	this.ViewLayout.SetTablature(this);
	this.UpdateScale(1.1);
}}
net.coderline.jsgs.tablature.Tablature.__name__ = ["net","coderline","jsgs","tablature","Tablature"];
net.coderline.jsgs.tablature.Tablature.prototype.Canvas = null;
net.coderline.jsgs.tablature.Tablature.prototype.Ctx = null;
net.coderline.jsgs.tablature.Tablature.prototype.DoLayout = function() {
	if(this.Track == null) return;
	var size = this.ViewLayout.LayoutSize;
	this.ViewLayout.PrepareLayout(new net.coderline.jsgs.model.Rectangle(0,0,size.Width,size.Height),0,0);
	this.Width = this.ViewLayout.Width;
	this.Height = this.ViewLayout.Height;
	{
		this.Canvas.width = this.Width;
		this.Canvas.height = this.Height;
	}
	this.JCanvas.width(this.ViewLayout.Width);
	this.JCanvas.height(this.ViewLayout.Height);
	this.UpdateContext();
}
net.coderline.jsgs.tablature.Tablature.prototype.ErrorMessage = null;
net.coderline.jsgs.tablature.Tablature.prototype.Height = null;
net.coderline.jsgs.tablature.Tablature.prototype.Invalidate = function() {
	this.Ctx.clearRect(0,0,this.Width,this.Height);
	this.OnPaint();
}
net.coderline.jsgs.tablature.Tablature.prototype.JCanvas = null;
net.coderline.jsgs.tablature.Tablature.prototype.OnPaint = function() {
	this.PaintBackground();
	if(this.Track == null) {
		var text = this.ErrorMessage;
		this.Ctx.fillStyle = "#4e4e4e";
		this.Ctx.font = "20px Arial";
		this.Ctx.textBaseline = "middle";
		this.Ctx.fillText(text,20,30);
	}
	else {
		var displayRect = new net.coderline.jsgs.model.Rectangle(0,0,this.Width,this.Height);
		this.ViewLayout.PaintCache(this.Ctx,displayRect,0,0);
		this.UpdateDisplay = false;
	}
}
net.coderline.jsgs.tablature.Tablature.prototype.PaintBackground = function() {
	this.Ctx.fillStyle = "#eeeedd";
	this.Ctx.fillRect(0,0,this.Width - 1,this.Height - 1);
	this.Ctx.strokeStyle = "#ddddcc";
	this.Ctx.lineWidth = 20;
	this.Ctx.strokeRect(0,0,this.Width - 1,this.Height - 1);
}
net.coderline.jsgs.tablature.Tablature.prototype.SetTrack = function(track) {
	this.Track = track;
	this.UpdateDisplay = true;
	this.UpdateTablature();
	this.Invalidate();
}
net.coderline.jsgs.tablature.Tablature.prototype.SongManager = null;
net.coderline.jsgs.tablature.Tablature.prototype.Track = null;
net.coderline.jsgs.tablature.Tablature.prototype.UpdateContext = function() {
	if(this.Canvas.getContext) {
		this.Ctx = this.Canvas.getContext("2d");
	}
	else {
		throw "The specified tag is no valid HTML5 canvas element";
	}
}
net.coderline.jsgs.tablature.Tablature.prototype.UpdateDisplay = null;
net.coderline.jsgs.tablature.Tablature.prototype.UpdateScale = function(scale) {
	net.coderline.jsgs.tablature.drawing.DrawingResources.Init(scale);
	this.ViewLayout.Init(scale);
	this.UpdateSong = true;
	this.UpdateTablature();
	this.UpdateDisplay = true;
	this.Invalidate();
}
net.coderline.jsgs.tablature.Tablature.prototype.UpdateSong = null;
net.coderline.jsgs.tablature.Tablature.prototype.UpdateTablature = function() {
	if(this.Track == null) return;
	this.ViewLayout.UpdateSong();
	this.DoLayout();
	this.UpdateSong = false;
}
net.coderline.jsgs.tablature.Tablature.prototype.ViewLayout = null;
net.coderline.jsgs.tablature.Tablature.prototype.Width = null;
net.coderline.jsgs.tablature.Tablature.prototype.__class__ = net.coderline.jsgs.tablature.Tablature;
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
	catch( $e11 ) {
		{
			var e = $e11;
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
	catch( $e12 ) {
		{
			var err = $e12;
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
	catch( $e13 ) {
		{
			var e = $e13;
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
net.coderline.jsgs.tablature.drawing.TempoPainter = function() { }
net.coderline.jsgs.tablature.drawing.TempoPainter.__name__ = ["net","coderline","jsgs","tablature","drawing","TempoPainter"];
net.coderline.jsgs.tablature.drawing.TempoPainter.PaintTempo = function(context,x,y,scale) {
	var realScale = scale / 5.0;
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	var draw = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw);
	var iWidth = Math.round(scale * 1.33);
	var iHeight = Math.round(scale * 3.5);
	net.coderline.jsgs.tablature.drawing.NotePainter.PaintNote(layer,Math.floor(x + (realScale)),Math.floor(y + (iHeight - (scale))),realScale / 1.6,true,net.coderline.jsgs.tablature.drawing.DrawingResources.TempoFont);
	draw.StartFigure();
	draw.MoveTo(x + iWidth,y);
	draw.LineTo(x + iWidth,Math.floor(y + (iHeight - (0.66 * scale))));
}
net.coderline.jsgs.tablature.drawing.TempoPainter.prototype.__class__ = net.coderline.jsgs.tablature.drawing.TempoPainter;
net.coderline.jsgs.model.Size = function(width,height) { if( width === $_ ) return; {
	this.Width = width;
	this.Height = height;
}}
net.coderline.jsgs.model.Size.__name__ = ["net","coderline","jsgs","model","Size"];
net.coderline.jsgs.model.Size.prototype.Height = null;
net.coderline.jsgs.model.Size.prototype.Width = null;
net.coderline.jsgs.model.Size.prototype.__class__ = net.coderline.jsgs.model.Size;
Reflect = function() { }
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	if(o.hasOwnProperty != null) return o.hasOwnProperty(field);
	var arr = Reflect.fields(o);
	{ var $it14 = arr.iterator();
	while( $it14.hasNext() ) { var t = $it14.next();
	if(t == field) return true;
	}}
	return false;
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	}
	catch( $e15 ) {
		{
			var e = $e15;
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
		catch( $e16 ) {
			{
				var e = $e16;
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
net.coderline.jsgs.file.SongReader = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.file.SongReader.__name__ = ["net","coderline","jsgs","file","SongReader"];
net.coderline.jsgs.file.SongReader.AvailableReaders = function() {
	var d = new Array();
	d.push(new net.coderline.jsgs.file.guitarpro.Gp5Reader());
	d.push(new net.coderline.jsgs.file.guitarpro.Gp4Reader());
	d.push(new net.coderline.jsgs.file.guitarpro.Gp4Reader());
	return d;
}
net.coderline.jsgs.file.SongReader.prototype.Data = null;
net.coderline.jsgs.file.SongReader.prototype.Factory = null;
net.coderline.jsgs.file.SongReader.prototype.Init = function(data,factory) {
	this.Data = data;
	this.Factory = factory;
}
net.coderline.jsgs.file.SongReader.prototype.ReadSong = function() {
	return new net.coderline.jsgs.model.GsSong();
}
net.coderline.jsgs.file.SongReader.prototype.__class__ = net.coderline.jsgs.file.SongReader;
if(!net.coderline.jsgs.file.guitarpro) net.coderline.jsgs.file.guitarpro = {}
net.coderline.jsgs.file.guitarpro.GpReaderBase = function(supportedVersions) { if( supportedVersions === $_ ) return; {
	net.coderline.jsgs.file.SongReader.apply(this,[]);
	this.SupportedVersions = supportedVersions;
}}
net.coderline.jsgs.file.guitarpro.GpReaderBase.__name__ = ["net","coderline","jsgs","file","guitarpro","GpReaderBase"];
net.coderline.jsgs.file.guitarpro.GpReaderBase.__super__ = net.coderline.jsgs.file.SongReader;
for(var k in net.coderline.jsgs.file.SongReader.prototype ) net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype[k] = net.coderline.jsgs.file.SongReader.prototype[k];
net.coderline.jsgs.file.guitarpro.GpReaderBase.NewString = function(bytes,length,charset) {
	return bytes.toString().substr(0,length);
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort = function(data) {
	var value = Math.floor(Math.max(-32768,Math.min(32767,(data * 8) - 1)));
	return Math.floor(Math.max(value,-1));
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.Init = function(data,factory) {
	net.coderline.jsgs.file.SongReader.prototype.Init.apply(this,[data,factory]);
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.Read = function() {
	return this.ReadByte();
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadBool = function() {
	return this.Data.readByte() == 1;
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadByte = function() {
	var data = this.Data.readByte() & 255;
	return (data > 127?-256 + data:data);
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadByteSizeCheckByteString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.ReadByteSizeString((this.ReadUnsignedByte() - 1),charset);
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadByteSizeString = function(size,charset) {
	if(charset == null) charset = "UTF-8";
	return this.ReadString(size,this.ReadUnsignedByte(),charset);
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadDouble = function() {
	return this.Data.readDouble();
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadInt = function() {
	return (this.Data.readInt32());
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadIntSizeCheckByteString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.ReadByteSizeString((this.ReadInt() - 1),charset);
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadIntSizeString = function(charset) {
	if(charset == null) charset = "UTF-8";
	return this.ReadString(this.ReadInt(),-2,charset);
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadString = function(size,len,charset) {
	if(charset == null) charset = "UTF-8";
	if(len == null) len = -2;
	if(len == -2) len = size;
	var count = ((size > 0?size:len));
	var s = this.ReadStringInternal(count);
	return s.substr(0,((len >= 0?len:size)));
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadStringInternal = function(length) {
	var text = "";
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			text += String.fromCharCode(this.ReadByte());
		}
	}
	return text;
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadUnsignedByte = function() {
	return this.Data.readByte();
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.ReadVersion = function() {
	try {
		if(this.Version == null) {
			this.Version = this.ReadByteSizeString(30,"UTF-8");
		}
		{
			var _g1 = 0, _g = this.SupportedVersions.length;
			while(_g1 < _g) {
				var i = _g1++;
				var current = this.SupportedVersions[i];
				if(this.Version == current) {
					this.VersionIndex = i;
					return true;
				}
			}
		}
	}
	catch( $e17 ) {
		if( js.Boot.__instanceof($e17,haxe.io.Error) ) {
			var e = $e17;
			{
				this.Version = "Not Supported";
			}
		} else throw($e17);
	}
	return false;
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.Skip = function(count) {
	var _g = 0;
	while(_g < count) {
		var i = _g++;
		this.Data.readByte();
	}
}
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.SupportedVersions = null;
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.Version = null;
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.VersionIndex = null;
net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype.__class__ = net.coderline.jsgs.file.guitarpro.GpReaderBase;
net.coderline.jsgs.file.guitarpro.Gp3Reader = function(p) { if( p === $_ ) return; {
	net.coderline.jsgs.file.guitarpro.GpReaderBase.apply(this,[["FICHIER GUITAR PRO v3.00"]]);
}}
net.coderline.jsgs.file.guitarpro.Gp3Reader.__name__ = ["net","coderline","jsgs","file","guitarpro","Gp3Reader"];
net.coderline.jsgs.file.guitarpro.Gp3Reader.__super__ = net.coderline.jsgs.file.guitarpro.GpReaderBase;
for(var k in net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype ) net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype[k] = net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype[k];
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.GetBeat = function(measure,start) {
	{
		var _g1 = 0, _g = measure.Beats.length;
		while(_g1 < _g) {
			var b = _g1++;
			var beat = measure.Beats[b];
			if(beat.Start == start) return beat;
		}
	}
	var newBeat = this.Factory.NewBeat();
	newBeat.Start = start;
	measure.AddBeat(newBeat);
	return newBeat;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.GetTiedNoteValue = function(stringIndex,track) {
	var iMeasureCount = track.MeasureCount();
	if(iMeasureCount > 0) {
		{
			var _g = 0;
			while(_g < iMeasureCount) {
				var m2 = _g++;
				var m = (iMeasureCount - 1) - m2;
				var measure = track.Measures[m];
				{
					var _g2 = 0, _g1 = measure.BeatCount();
					while(_g2 < _g1) {
						var b2 = _g2++;
						var b = (measure.BeatCount() - 1) - b2;
						var beat = measure.Beats[b];
						{
							var _g4 = 0, _g3 = beat.Voices.length;
							while(_g4 < _g3) {
								var v = _g4++;
								var oVoice = beat.Voices[v];
								if(!oVoice.IsEmpty) {
									{
										var _g6 = 0, _g5 = oVoice.Notes.length;
										while(_g6 < _g5) {
											var n = _g6++;
											var note = oVoice.Notes[n];
											if(note.String == stringIndex) {
												return note.Value;
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
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ParseRepeatAlternative = function(song,measure,value) {
	var repeatAlternative = 0;
	var existentAlternatives = 0;
	{
		var _g1 = 0, _g = song.MeasureHeaders.length;
		while(_g1 < _g) {
			var i = _g1++;
			var header = song.MeasureHeaders[i];
			if(header.Number == measure) break;
			if(header.IsRepeatOpen) existentAlternatives = 0;
			existentAlternatives |= header.RepeatAlternative;
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
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadBeat = function(start,measure,track,voiceIndex) {
	var flags = this.ReadUnsignedByte();
	var beat = this.GetBeat(measure,start);
	var voice = beat.Voices[voiceIndex];
	if((flags & 64) != 0) {
		var beatType = this.ReadUnsignedByte();
		voice.IsEmpty = ((beatType & 2) == 0);
	}
	var duration = this.ReadDuration(flags);
	var effect = this.Factory.NewEffect();
	if((flags & 2) != 0) {
		this.ReadChord(track.StringCount(),beat);
	}
	if((flags & 4) != 0) {
		this.ReadText(beat);
	}
	if((flags & 8) != 0) {
		this.ReadBeatEffects(beat,effect);
	}
	if((flags & 16) != 0) {
		var mixTableChange = this.ReadMixTableChange();
		beat.MixTableChange = mixTableChange;
	}
	var stringFlags = this.ReadUnsignedByte();
	{
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & (1 << i)) != 0 && (6 - i) < track.StringCount()) {
				var guitarString = track.Strings[6 - i].Clone(this.Factory);
				var note = this.ReadNote(guitarString,track,effect.Clone(this.Factory));
				voice.AddNote(note);
			}
			duration.Copy(voice.Duration);
		}
	}
	return ((!voice.IsEmpty)?duration.Time():0);
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadBeatEffects = function(beat,effect) {
	var flags1 = this.ReadUnsignedByte();
	effect.FadeIn = (((flags1 & 16) != 0));
	effect.Vibrato = (((flags1 & 2) != 0));
	if((flags1 & 32) != 0) {
		var slapEffect = this.ReadUnsignedByte();
		if(slapEffect == 0) {
			this.ReadTremoloBar(effect);
		}
		else {
			effect.Tapping = (slapEffect == 1);
			effect.Slapping = (slapEffect == 2);
			effect.Popping = (slapEffect == 3);
			this.ReadInt();
		}
	}
	if((flags1 & 64) != 0) {
		var strokeUp = this.ReadByte();
		var strokeDown = this.ReadByte();
		if(strokeUp > 0) {
			beat.Stroke.Direction = net.coderline.jsgs.model.GsBeatStrokeDirection.Up;
			beat.Stroke.Value = (this.ToStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.Stroke.Direction = net.coderline.jsgs.model.GsBeatStrokeDirection.Down;
			beat.Stroke.Value = (this.ToStrokeValue(strokeDown));
		}
	}
	if((flags1 & 4) != 0) {
		var harmonic = this.Factory.NewHarmonicEffect();
		harmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Natural);
		effect.Harmonic = (harmonic);
	}
	if((flags1 & 8) != 0) {
		var harmonic = this.Factory.NewHarmonicEffect();
		harmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Artificial);
		harmonic.Data = 0;
		effect.Harmonic = (harmonic);
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadBend = function(noteEffect) {
	var bendEffect = this.Factory.NewBendEffect();
	bendEffect.Type = net.coderline.jsgs.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	bendEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / 25);
			var vibrato = this.ReadBool();
			bendEffect.Points.push(new net.coderline.jsgs.model.effects.GsBendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) noteEffect.Bend = bendEffect;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadChannel = function(midiChannel,channels) {
	var index = (this.ReadInt() - 1);
	var effectChannel = (this.ReadInt() - 1);
	if(index >= 0 && index < channels.length) {
		channels[index].Copy(midiChannel);
		if(midiChannel.Instrument() < 0) {
			midiChannel.Instrument(0);
		}
		if(!midiChannel.IsPercussionChannel()) {
			midiChannel.EffectChannel = (effectChannel);
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadChord = function(stringCount,beat) {
	var chord = this.Factory.NewChord(stringCount);
	if((this.ReadUnsignedByte() & 1) == 0) {
		chord.Name = (this.ReadIntSizeCheckByteString());
		chord.FirstFret = (this.ReadInt());
		if(chord.FirstFret != 0) {
			{
				var _g = 0;
				while(_g < 6) {
					var i = _g++;
					var fret = this.ReadInt();
					if(i < chord.Strings.length) {
						chord.Strings[i] = fret;
					}
				}
			}
		}
	}
	else {
		this.Skip(25);
		chord.Name = (this.ReadByteSizeString(34));
		chord.FirstFret = (this.ReadInt());
		{
			var _g = 0;
			while(_g < 6) {
				var i = _g++;
				var fret = this.ReadInt();
				if(i < chord.Strings.length) {
					chord.Strings[i] = fret;
				}
			}
		}
		this.Skip(36);
	}
	if(chord.NoteCount() > 0) {
		beat.Chord = (chord);
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadColor = function() {
	var r = (this.ReadUnsignedByte());
	var g = this.ReadUnsignedByte();
	var b = (this.ReadUnsignedByte());
	this.Skip(1);
	return new net.coderline.jsgs.model.GsColor(r,g,b);
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadDuration = function(flags) {
	var duration = this.Factory.NewDuration();
	duration.Value = Math.round(Math.pow(2,(this.ReadByte() + 4)) / 4);
	duration.IsDotted = (((flags & 1) != 0));
	if((flags & 32) != 0) {
		var iTuplet = this.ReadInt();
		switch(iTuplet) {
		case 3:{
			duration.Triplet.Enters = 3;
			duration.Triplet.Times = 2;
		}break;
		case 5:{
			duration.Triplet.Enters = 5;
			duration.Triplet.Times = 4;
		}break;
		case 6:{
			duration.Triplet.Enters = 6;
			duration.Triplet.Times = 4;
		}break;
		case 7:{
			duration.Triplet.Enters = 7;
			duration.Triplet.Times = 4;
		}break;
		case 9:{
			duration.Triplet.Enters = 9;
			duration.Triplet.Times = 8;
		}break;
		case 10:{
			duration.Triplet.Enters = 10;
			duration.Triplet.Times = 8;
		}break;
		case 11:{
			duration.Triplet.Enters = 11;
			duration.Triplet.Times = 8;
		}break;
		case 12:{
			duration.Triplet.Enters = 12;
			duration.Triplet.Times = 8;
		}break;
		}
	}
	return duration;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadGrace = function(noteEffect) {
	var fret = this.ReadUnsignedByte();
	var dyn = this.ReadUnsignedByte();
	var transition = this.ReadByte();
	var duration = this.ReadUnsignedByte();
	var grace = this.Factory.NewGraceEffect();
	grace.Fret = (fret);
	grace.Dynamic = ((15 + (16 * dyn)) - 16);
	grace.Duration = (duration);
	grace.IsDead = fret == 255;
	grace.IsOnBeat = false;
	switch(transition) {
	case 0:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.None;
	}break;
	case 1:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Slide;
	}break;
	case 2:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Bend;
	}break;
	case 3:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Hammer;
	}break;
	}
	noteEffect.Grace = (grace);
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadInfo = function(song) {
	song.Title = (this.ReadIntSizeCheckByteString());
	song.Subtitle = this.ReadIntSizeCheckByteString();
	song.Artist = (this.ReadIntSizeCheckByteString());
	song.Album = (this.ReadIntSizeCheckByteString());
	song.Words = (this.ReadIntSizeCheckByteString());
	song.Music = song.Words;
	song.Copyright = this.ReadIntSizeCheckByteString();
	song.Tab = this.ReadIntSizeCheckByteString();
	song.Instructions = this.ReadIntSizeCheckByteString();
	var iNotes = this.ReadInt();
	song.Notice = "";
	{
		var _g = 0;
		while(_g < iNotes) {
			var i = _g++;
			song.Notice += this.ReadIntSizeCheckByteString() + "\n";
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadLyrics = function(song) {
	song.Lyrics = this.Factory.NewLyrics();
	song.Lyrics.TrackChoice = this.ReadInt();
	{
		var _g = 0;
		while(_g < 5) {
			var i = _g++;
			var line = this.Factory.NewLyricLine();
			line.StartingMeasure = this.ReadInt();
			line.Lyrics = this.ReadIntSizeString();
			song.Lyrics.Lines.push(line);
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadMarker = function(header) {
	var marker = this.Factory.NewMarker();
	marker.MeasureHeader = header;
	marker.Title = this.ReadIntSizeCheckByteString();
	marker.Color = this.ReadColor();
	return marker;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadMeasure = function(measure,track) {
	var start = measure.Start();
	var beats = this.ReadInt();
	{
		var _g = 0;
		while(_g < beats) {
			var beat = _g++;
			start += this.ReadBeat(start,measure,track,0);
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadMeasureHeader = function(i,timeSignature,song) {
	var flags = this.ReadUnsignedByte();
	var header = this.Factory.NewMeasureHeader();
	header.Number = i + 1;
	header.Start = 0;
	header.Tempo.Value = 120;
	header.TripletFeel = this._tripletFeel;
	if((flags & 1) != 0) timeSignature.Numerator = this.ReadByte();
	if((flags & 2) != 0) timeSignature.Denominator.Value = this.ReadByte();
	header.IsRepeatOpen = ((flags & 4) != 0);
	timeSignature.Copy(header.TimeSignature);
	if((flags & 8) != 0) header.RepeatClose = (this.ReadByte() - 1);
	if((flags & 16) != 0) header.RepeatAlternative = this.ParseRepeatAlternative(song,header.Number,this.ReadUnsignedByte());
	if((flags & 32) != 0) header.Marker = this.ReadMarker(header);
	if((flags & 64) != 0) {
		header.KeySignature = this.ToKeySignature(this.ReadByte());
		header.KeySignatureType = this.ReadByte();
	}
	header.HasDoubleBar = (flags & 128) != 0;
	return header;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadMeasureHeaders = function(song,measureCount) {
	var timeSignature = this.Factory.NewTimeSignature();
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.AddMeasureHeader(this.ReadMeasureHeader(i,timeSignature,song));
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadMeasures = function(song) {
	var tempo = this.Factory.NewTempo();
	tempo.Value = song.Tempo;
	var start = 960;
	{
		var _g1 = 0, _g = song.MeasureHeaders.length;
		while(_g1 < _g) {
			var h = _g1++;
			var header = song.MeasureHeaders[h];
			header.Start = start;
			{
				var _g3 = 0, _g2 = song.Tracks.length;
				while(_g3 < _g2) {
					var t = _g3++;
					var track = song.Tracks[t];
					var measure = this.Factory.NewMeasure(header);
					track.AddMeasure(measure);
					this.ReadMeasure(measure,track);
				}
			}
			tempo.Copy(header.Tempo);
			start += header.Length();
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadMidiChannels = function() {
	var channels = new Array();
	{
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.Factory.NewMidiChannel();
			newChannel.Channel = (i);
			newChannel.EffectChannel = (i);
			newChannel.Instrument(this.ReadInt());
			newChannel.Volume = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Balance = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Chorus = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Reverb = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Phaser = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Tremolo = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			channels.push(newChannel);
			this.Skip(2);
		}
	}
	return channels;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadMixTableChange = function() {
	var tableChange = this.Factory.NewMixTableChange();
	tableChange.Instrument.Value = this.ReadByte();
	tableChange.Volume.Value = this.ReadByte();
	tableChange.Balance.Value = this.ReadByte();
	tableChange.Chorus.Value = this.ReadByte();
	tableChange.Reverb.Value = this.ReadByte();
	tableChange.Phaser.Value = this.ReadByte();
	tableChange.Tremolo.Value = this.ReadByte();
	tableChange.TempoName = this.ReadIntSizeCheckByteString();
	tableChange.Tempo.Value = this.ReadInt();
	if(tableChange.Instrument.Value < 0) tableChange.Instrument = null;
	if(tableChange.Volume.Value >= 0) tableChange.Volume.Duration = this.ReadByte();
	else tableChange.Volume = null;
	if(tableChange.Balance.Value >= 0) tableChange.Balance.Duration = this.ReadByte();
	else tableChange.Balance = null;
	if(tableChange.Chorus.Value >= 0) tableChange.Chorus.Duration = this.ReadByte();
	else tableChange.Chorus = null;
	if(tableChange.Reverb.Value >= 0) tableChange.Reverb.Duration = this.ReadByte();
	else tableChange.Reverb = null;
	if(tableChange.Phaser.Value >= 0) tableChange.Phaser.Duration = this.ReadByte();
	else tableChange.Phaser = null;
	if(tableChange.Tremolo.Value >= 0) tableChange.Tremolo.Duration = this.ReadByte();
	else tableChange.Tremolo = null;
	if(tableChange.Tempo.Value >= 0) {
		tableChange.Tempo.Duration = this.ReadByte();
		tableChange.HideTempo = false;
	}
	else tableChange.Tempo = null;
	var allTracksFlags = this.ReadUnsignedByte();
	if(tableChange.Volume != null) tableChange.Volume.AllTracks = (allTracksFlags & 1) != 0;
	if(tableChange.Balance != null) tableChange.Balance.AllTracks = (allTracksFlags & 2) != 0;
	if(tableChange.Chorus != null) tableChange.Chorus.AllTracks = (allTracksFlags & 4) != 0;
	if(tableChange.Reverb != null) tableChange.Reverb.AllTracks = (allTracksFlags & 8) != 0;
	if(tableChange.Phaser != null) tableChange.Phaser.AllTracks = (allTracksFlags & 16) != 0;
	if(tableChange.Tremolo != null) tableChange.Tremolo.AllTracks = (allTracksFlags & 32) != 0;
	if(tableChange.Tempo != null) tableChange.Tempo.AllTracks = true;
	return tableChange;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadNote = function(guitarString,track,effect) {
	var flags = this.ReadUnsignedByte();
	var note = this.Factory.NewNote();
	note.String = (guitarString.Number);
	note.Effect = (effect);
	note.Effect.AccentuatedNote = (((flags & 64) != 0));
	note.Effect.HeavyAccentuatedNote = (((flags & 2) != 0));
	note.Effect.GhostNote = (((flags & 4) != 0));
	if((flags & 32) != 0) {
		var noteType = this.ReadUnsignedByte();
		note.IsTiedNote = ((noteType == 2));
		note.Effect.DeadNote = ((noteType == 3));
	}
	if((flags & 1) != 0) {
		note.Duration = this.ReadByte();
		note.Triplet = this.ReadByte();
	}
	if((flags & 16) != 0) {
		note.Velocity = ((15 + (16 * this.ReadByte())) - 16);
	}
	if((flags & 32) != 0) {
		var fret = this.ReadByte();
		var value = ((note.IsTiedNote?this.GetTiedNoteValue(guitarString.Number,track):fret));
		note.Value = ((value >= 0 && value < 100?value:0));
	}
	if((flags & 128) != 0) {
		note.LeftHandFinger = this.ReadByte();
		note.RightHandFinger = this.ReadByte();
		note.IsFingering = true;
	}
	if((flags & 8) != 0) {
		this.ReadNoteEffects(note.Effect);
	}
	return note;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadNoteEffects = function(noteEffect) {
	var flags1 = this.ReadUnsignedByte();
	noteEffect.Slide = (flags1 & 4) != 0;
	noteEffect.Hammer = (flags1 & 2) != 0;
	noteEffect.LetRing = (flags1 & 8) != 0;
	if((flags1 & 1) != 0) {
		this.ReadBend(noteEffect);
	}
	if((flags1 & 16) != 0) {
		this.ReadGrace(noteEffect);
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadPageSetup = function(song) {
	var setup = net.coderline.jsgs.model.GsPageSetup.Defaults();
	song.PageSetup = setup;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadSong = function() {
	if(!this.ReadVersion()) {
		throw new net.coderline.jsgs.file.FileFormatException("Unsupported Version");
	}
	var song = this.Factory.NewSong();
	this.ReadInfo(song);
	this._tripletFeel = (this.ReadBool()?net.coderline.jsgs.model.GsTripletFeel.Eighth:net.coderline.jsgs.model.GsTripletFeel.None);
	this.ReadLyrics(song);
	this.ReadPageSetup(song);
	song.TempoName = "";
	song.Tempo = this.ReadInt();
	song.HideTempo = false;
	song.Key = this.ReadInt();
	song.Octave = 0;
	var channels = this.ReadMidiChannels();
	var measureCount = this.ReadInt();
	var trackCount = this.ReadInt();
	this.ReadMeasureHeaders(song,measureCount);
	this.ReadTracks(song,trackCount,channels);
	this.ReadMeasures(song);
	return song;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadText = function(beat) {
	var text = this.Factory.NewText();
	text.Value = this.ReadIntSizeCheckByteString();
	beat.SetText(text);
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadTrack = function(number,channels) {
	var flags = this.ReadUnsignedByte();
	var track = this.Factory.NewTrack();
	track.IsPercussionTrack = (flags & 1) != 0;
	track.Is12StringedGuitarTrack = (flags & 2) != 0;
	track.IsBanjoTrack = (flags & 4) != 0;
	track.Number = number;
	track.Name = this.ReadByteSizeString(40);
	var stringCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var iTuning = this.ReadInt();
			if(stringCount > i) {
				var oString = this.Factory.NewString();
				oString.Number = (i + 1);
				oString.Value = (iTuning);
				track.Strings.push(oString);
			}
		}
	}
	track.Port = this.ReadInt();
	this.ReadChannel(track.Channel,channels);
	track.FretCount = this.ReadInt();
	track.Offset = this.ReadInt();
	track.Color = this.ReadColor();
	return track;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadTracks = function(song,trackCount,channels) {
	var _g1 = 1, _g = trackCount + 1;
	while(_g1 < _g) {
		var i = _g1++;
		song.AddTrack(this.ReadTrack(i,channels));
	}
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ReadTremoloBar = function(effect) {
	var barEffect = this.Factory.NewTremoloBarEffect();
	barEffect.Type = net.coderline.jsgs.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	barEffect.Value = this.ReadInt();
	barEffect.Points.push(new net.coderline.jsgs.model.effects.GsTremoloBarPoint(0,0,false));
	barEffect.Points.push(new net.coderline.jsgs.model.effects.GsTremoloBarPoint(Math.round(12 / 2.0),Math.round(barEffect.Value / 50),false));
	barEffect.Points.push(new net.coderline.jsgs.model.effects.GsTremoloBarPoint(12,0,false));
	effect.TremoloBar = barEffect;
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ToKeySignature = function(p) {
	return (p < 0?7 + Math.round(Math.abs(p)):p);
}
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.ToStrokeValue = function(value) {
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
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype._tripletFeel = null;
net.coderline.jsgs.file.guitarpro.Gp3Reader.prototype.__class__ = net.coderline.jsgs.file.guitarpro.Gp3Reader;
net.coderline.jsgs.model.GsBeatStroke = function(p) { if( p === $_ ) return; {
	this.Direction = net.coderline.jsgs.model.GsBeatStrokeDirection.None;
}}
net.coderline.jsgs.model.GsBeatStroke.__name__ = ["net","coderline","jsgs","model","GsBeatStroke"];
net.coderline.jsgs.model.GsBeatStroke.prototype.Direction = null;
net.coderline.jsgs.model.GsBeatStroke.prototype.GetIncrementTime = function(beat) {
	var duration = 0;
	if(this.Value > 0) {
		{
			var _g1 = 0, _g = beat.Voices.length;
			while(_g1 < _g) {
				var v = _g1++;
				var voice = beat.Voices[v];
				if(voice.IsEmpty) continue;
				var currentDuration = voice.Duration.Time();
				if(duration == 0 || currentDuration < duration) {
					duration = ((currentDuration <= 960)?currentDuration:960);
				}
			}
		}
		if(duration > 0) {
			return Math.round(((duration / 8.0) * (4.0 / this.Value)));
		}
	}
	return 0;
}
net.coderline.jsgs.model.GsBeatStroke.prototype.Value = null;
net.coderline.jsgs.model.GsBeatStroke.prototype.__class__ = net.coderline.jsgs.model.GsBeatStroke;
net.coderline.jsgs.tablature.drawing.KeySignaturePainter = function() { }
net.coderline.jsgs.tablature.drawing.KeySignaturePainter.__name__ = ["net","coderline","jsgs","tablature","drawing","KeySignaturePainter"];
net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintFlat = function(context,x,y,layout) {
	var scale = layout.Scale * 1.2;
	y -= Math.round(2 * layout.ScoreLineSpacing);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.KeyFlat,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintNatural = function(context,x,y,layout) {
	var scale = layout.Scale * 1.2;
	y -= Math.round(2 * layout.ScoreLineSpacing);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.KeyNormal,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintSharp = function(context,x,y,layout) {
	var scale = layout.Scale * 1.2;
	y -= Math.round(1.5 * layout.ScoreLineSpacing);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.KeySharp,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintSmallFlat = function(context,x,y,layout) {
	var scale = layout.Scale;
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.KeyFlat,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintSmallNatural = function(context,x,y,layout) {
	var scale = layout.Scale;
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.KeyNormal,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintSmallSharp = function(context,x,y,layout) {
	var scale = layout.Scale;
	y -= Math.round(layout.ScoreLineSpacing);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.KeySharp,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.KeySignaturePainter.prototype.__class__ = net.coderline.jsgs.tablature.drawing.KeySignaturePainter;
net.coderline.jsgs.tablature.model.GsTrackImpl = function(factory) { if( factory === $_ ) return; {
	net.coderline.jsgs.model.GsTrack.apply(this,[factory]);
}}
net.coderline.jsgs.tablature.model.GsTrackImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsTrackImpl"];
net.coderline.jsgs.tablature.model.GsTrackImpl.__super__ = net.coderline.jsgs.model.GsTrack;
for(var k in net.coderline.jsgs.model.GsTrack.prototype ) net.coderline.jsgs.tablature.model.GsTrackImpl.prototype[k] = net.coderline.jsgs.model.GsTrack.prototype[k];
net.coderline.jsgs.tablature.model.GsTrackImpl.prototype.PreviousBeat = null;
net.coderline.jsgs.tablature.model.GsTrackImpl.prototype.ScoreHeight = null;
net.coderline.jsgs.tablature.model.GsTrackImpl.prototype.TabHeight = null;
net.coderline.jsgs.tablature.model.GsTrackImpl.prototype.Update = function(layout) {
	this.TabHeight = Math.round((this.StringCount() - 1) * layout.StringSpacing);
	this.ScoreHeight = Math.round(layout.ScoreLineSpacing * 4);
}
net.coderline.jsgs.tablature.model.GsTrackImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsTrackImpl;
net.coderline.jsgs.tablature.model.GsLyricsImpl = function(p) { if( p === $_ ) return; {
	net.coderline.jsgs.model.GsLyrics.apply(this,[]);
}}
net.coderline.jsgs.tablature.model.GsLyricsImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsLyricsImpl"];
net.coderline.jsgs.tablature.model.GsLyricsImpl.__super__ = net.coderline.jsgs.model.GsLyrics;
for(var k in net.coderline.jsgs.model.GsLyrics.prototype ) net.coderline.jsgs.tablature.model.GsLyricsImpl.prototype[k] = net.coderline.jsgs.model.GsLyrics.prototype[k];
net.coderline.jsgs.tablature.model.GsLyricsImpl.prototype.PaintCurrentNoteBeats = function(context,layout,currentMeasure,x,y) {
	var beats = this.LyricsBeats();
	if(beats != null && beats.length > 0) {
		var beatIndex = 0;
		{
			var _g1 = 0, _g = currentMeasure.BeatCount();
			while(_g1 < _g) {
				var i = _g1++;
				var beat = currentMeasure.Beats[i];
				if(!beat.IsRestBeat()) {
					if(beatIndex < beats.length) {
						var str = StringTools.trim(beats[beatIndex]);
						if(str.length > 0) {
							var realX = (((x + beat.PosX) + beat.Spacing()) + 2);
							context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents).AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,realX + 13,y + currentMeasure.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.Lyric));
						}
					}
					beatIndex++;
				}
			}
		}
	}
}
net.coderline.jsgs.tablature.model.GsLyricsImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsLyricsImpl;
net.coderline.jsgs.model.Rectangle = function(x,y,width,height) { if( x === $_ ) return; {
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
}}
net.coderline.jsgs.model.Rectangle.__name__ = ["net","coderline","jsgs","model","Rectangle"];
net.coderline.jsgs.model.Rectangle.prototype.Height = null;
net.coderline.jsgs.model.Rectangle.prototype.Width = null;
net.coderline.jsgs.model.Rectangle.prototype.X = null;
net.coderline.jsgs.model.Rectangle.prototype.Y = null;
net.coderline.jsgs.model.Rectangle.prototype.__class__ = net.coderline.jsgs.model.Rectangle;
haxe.io.Eof = function(p) { if( p === $_ ) return; {
	null;
}}
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype.toString = function() {
	return "Eof";
}
haxe.io.Eof.prototype.__class__ = haxe.io.Eof;
net.coderline.jsgs.model.GsSong = function(p) { if( p === $_ ) return; {
	this.MeasureHeaders = new Array();
	this.Tracks = new Array();
}}
net.coderline.jsgs.model.GsSong.__name__ = ["net","coderline","jsgs","model","GsSong"];
net.coderline.jsgs.model.GsSong.prototype.AddMeasureHeader = function(header) {
	header.Song = this;
	this.MeasureHeaders.push(header);
}
net.coderline.jsgs.model.GsSong.prototype.AddTrack = function(track) {
	track.Song = this;
	this.Tracks.push(track);
}
net.coderline.jsgs.model.GsSong.prototype.Album = null;
net.coderline.jsgs.model.GsSong.prototype.Artist = null;
net.coderline.jsgs.model.GsSong.prototype.Copyright = null;
net.coderline.jsgs.model.GsSong.prototype.HideTempo = null;
net.coderline.jsgs.model.GsSong.prototype.Instructions = null;
net.coderline.jsgs.model.GsSong.prototype.Key = null;
net.coderline.jsgs.model.GsSong.prototype.Lyrics = null;
net.coderline.jsgs.model.GsSong.prototype.MeasureHeaders = null;
net.coderline.jsgs.model.GsSong.prototype.Music = null;
net.coderline.jsgs.model.GsSong.prototype.Notice = null;
net.coderline.jsgs.model.GsSong.prototype.Octave = null;
net.coderline.jsgs.model.GsSong.prototype.PageSetup = null;
net.coderline.jsgs.model.GsSong.prototype.Subtitle = null;
net.coderline.jsgs.model.GsSong.prototype.Tab = null;
net.coderline.jsgs.model.GsSong.prototype.Tempo = null;
net.coderline.jsgs.model.GsSong.prototype.TempoName = null;
net.coderline.jsgs.model.GsSong.prototype.Title = null;
net.coderline.jsgs.model.GsSong.prototype.Tracks = null;
net.coderline.jsgs.model.GsSong.prototype.Words = null;
net.coderline.jsgs.model.GsSong.prototype.__class__ = net.coderline.jsgs.model.GsSong;
net.coderline.jsgs.model.GsNote = function(factory) { if( factory === $_ ) return; {
	this.Value = 0;
	this.Velocity = 95;
	this.String = 1;
	this.IsTiedNote = false;
	this.Effect = factory.NewEffect();
}}
net.coderline.jsgs.model.GsNote.__name__ = ["net","coderline","jsgs","model","GsNote"];
net.coderline.jsgs.model.GsNote.prototype.Duration = null;
net.coderline.jsgs.model.GsNote.prototype.DurationPercent = null;
net.coderline.jsgs.model.GsNote.prototype.Effect = null;
net.coderline.jsgs.model.GsNote.prototype.IsFingering = null;
net.coderline.jsgs.model.GsNote.prototype.IsTiedNote = null;
net.coderline.jsgs.model.GsNote.prototype.LeftHandFinger = null;
net.coderline.jsgs.model.GsNote.prototype.RealValue = function() {
	return this.Value + this.Voice.Beat.Measure.Track.Strings[this.String - 1].Value;
}
net.coderline.jsgs.model.GsNote.prototype.RightHandFinger = null;
net.coderline.jsgs.model.GsNote.prototype.String = null;
net.coderline.jsgs.model.GsNote.prototype.Triplet = null;
net.coderline.jsgs.model.GsNote.prototype.Value = null;
net.coderline.jsgs.model.GsNote.prototype.Velocity = null;
net.coderline.jsgs.model.GsNote.prototype.Voice = null;
net.coderline.jsgs.model.GsNote.prototype.__class__ = net.coderline.jsgs.model.GsNote;
net.coderline.jsgs.tablature.model.GsNoteImpl = function(factory) { if( factory === $_ ) return; {
	net.coderline.jsgs.model.GsNote.apply(this,[factory]);
	this._noteOrientation = new net.coderline.jsgs.model.Rectangle(0,0,0,0);
}}
net.coderline.jsgs.tablature.model.GsNoteImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsNoteImpl"];
net.coderline.jsgs.tablature.model.GsNoteImpl.__super__ = net.coderline.jsgs.model.GsNote;
for(var k in net.coderline.jsgs.model.GsNote.prototype ) net.coderline.jsgs.tablature.model.GsNoteImpl.prototype[k] = net.coderline.jsgs.model.GsNote.prototype[k];
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.BeatImpl = function() {
	return this.VoiceImpl().BeatImpl();
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.CalculateBendOverflow = function(layout) {
	var point = null;
	{
		var _g = 0, _g1 = this.Effect.Bend.Points;
		while(_g < _g1.length) {
			var curr = _g1[_g];
			++_g;
			if(point == null || point.Value < curr.Value) point = curr;
		}
	}
	if(point == null) return 0;
	var fullHeight = point.Value * (6 * layout.Scale);
	var heightToTabNote = (this.String - 1) * layout.StringSpacing;
	return Math.round(fullHeight - heightToTabNote);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.GetPaintPosition = function(iIndex) {
	return this.MeasureImpl().Ts.Get(iIndex);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.MeasureImpl = function() {
	return this.BeatImpl().MeasureImpl();
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.NoteForTie = function() {
	var m = this.MeasureImpl();
	var nextIndex;
	do {
		var i = m.BeatCount() - 1;
		while(i >= 0) {
			var beat = m.Beats[i];
			var voice = beat.Voices[this.Voice.Index];
			if(beat.Start < this.BeatImpl().Start && !voice.IsRestVoice()) {
				{
					var _g = 0, _g1 = voice.Notes;
					while(_g < _g1.length) {
						var note = _g1[_g];
						++_g;
						if(note.String == this.String) {
							return note;
						}
					}
				}
			}
			i--;
		}
		nextIndex = m.Number() - 2;
		m = (nextIndex >= 0?m.TrackImpl().Measures[nextIndex]:null);
	} while(m != null && m.Number() >= this.MeasureImpl().Number() - 3 && m.Ts == this.MeasureImpl().Ts);
	return null;
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.Paint = function(layout,context,x,y) {
	var spacing = this.BeatImpl().Spacing();
	this.PaintScoreNote(layout,context,x,y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines),spacing);
	this.PaintOfflineEffects(layout,context,x,y,spacing);
	this.PaintTablatureNote(layout,context,x,y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature),spacing);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintAccentuated = function(layout,context,x,y) {
	var realX = x;
	var realY = y;
	var layer = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2));
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.AccentuatedNote,realX,realY,layout.Scale);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintBend = function(layout,context,nextBeat,fromX,fromY) {
	var scale = layout.Scale;
	var iX = fromX;
	var iY = fromY - (2.0 * scale);
	var iXTo;
	var iMinY = iY - 60 * scale;
	if(nextBeat == null) {
		iXTo = (this.BeatImpl().MeasureImpl().PosX + this.BeatImpl().MeasureImpl().Width) + this.BeatImpl().MeasureImpl().Spacing;
	}
	else {
		if(nextBeat.GetNotes().length > 0) {
			iXTo = (((nextBeat.MeasureImpl().PosX + nextBeat.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)) + nextBeat.PosX) + (nextBeat.Spacing() * scale)) + 5 * scale;
		}
		else {
			iXTo = ((nextBeat.MeasureImpl().PosX + nextBeat.PosX) + nextBeat.Spacing()) + 5 * scale;
		}
	}
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	var draw = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	if(this.Effect.Bend.Points.length >= 2) {
		var dX = (iXTo - iX) / 12;
		var dY = (iY - iMinY) / 12;
		draw.StartFigure();
		{
			var _g1 = 0, _g = this.Effect.Bend.Points.length - 1;
			while(_g1 < _g) {
				var i = _g1++;
				var firstPt = this.Effect.Bend.Points[i];
				var secondPt = this.Effect.Bend.Points[i + 1];
				if(firstPt.Value == secondPt.Value && i == this.Effect.Bend.Points.length - 2) continue;
				var arrow = (firstPt.Value != secondPt.Value);
				var firstLoc = new net.coderline.jsgs.model.Point(iX + (dX * firstPt.Position),iY - dY * firstPt.Value);
				var secondLoc = new net.coderline.jsgs.model.Point(iX + (dX * secondPt.Position),iY - dY * secondPt.Value);
				var firstHelper = new net.coderline.jsgs.model.Point(firstLoc.X + ((secondLoc.X - firstLoc.X)),iY - dY * firstPt.Value);
				draw.AddBezier(firstLoc.X,firstLoc.Y,firstHelper.X,firstHelper.Y,secondLoc.X,secondLoc.Y,secondLoc.X,secondLoc.Y);
				if(secondPt.Value != 0) {
					var dV = (secondPt.Value - firstPt.Value) * 0.25;
					var up = dV >= 0;
					dV = Math.abs(dV);
					var s = "";
					if(dV == 1) s = "full";
					else if(dV > 1) {
						s += Std.string(dV) + " ";
						dV -= Math.floor(dV);
					}
					if(dV == 0.25) s += "1/4";
					else if(dV == 0.5) s += "1/2";
					else if(dV == 0.75) s += "3/4";
					context.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont;
					var size = context.Graphics.measureText(s);
					var y = (up?(secondLoc.Y - net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight) - (3 * scale):secondLoc.Y + (3 * scale));
					var x = secondLoc.X - size.width / 2;
					fill.AddString(s,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,x,y);
				}
			}
		}
	}
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintEffects = function(layout,context,x,y,spacing) {
	var scale = layout.Scale;
	var realX = x;
	var realY = y + this.TabPosY;
	var effect = this.Effect;
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	if(effect.IsGrace()) {
		var value = (effect.Grace.IsDead?"X":Std.string(effect.Grace.Fret));
		fill.AddString(value,net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFont,Math.round(this._noteOrientation.X - 7 * scale),this._noteOrientation.Y);
	}
	if(effect.IsBend()) {
		var nextBeat = layout.SongManager().GetNextBeat(this.BeatImpl(),this.Voice.Index);
		if(nextBeat != null && nextBeat.MeasureImpl().Ts != this.MeasureImpl().Ts) nextBeat = null;
		this.PaintBend(layout,context,nextBeat,this._noteOrientation.X + this._noteOrientation.Width,realY);
	}
	else if(effect.IsTremoloBar()) {
		var nextBeat = layout.SongManager().GetNextBeat(this.BeatImpl(),this.Voice.Index);
		if(nextBeat != null && nextBeat.MeasureImpl().Ts != this.MeasureImpl().Ts) nextBeat = null;
		this.PaintTremoloBar(layout,context,nextBeat,this._noteOrientation.X,realY);
	}
	else if(effect.Slide || effect.Hammer) {
		var nextFromX = x;
		var nextNote = layout.SongManager().GetNextNote(this.MeasureImpl(),this.BeatImpl().Start,this.Voice.Index,this.String);
		if(effect.Slide) {
			this.PaintSlide(layout,context,nextNote,realX,realY,nextFromX);
		}
		else if(effect.Hammer) {
			this.PaintHammer(layout,context,nextNote,realX,realY,nextFromX);
		}
	}
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintFadeIn = function(layout,context,x,y) {
	var scale = layout.Scale;
	var realX = x;
	var realY = Math.round(y + (4.0 * scale));
	var fWidth = Math.round(this.VoiceImpl().Width);
	var layer = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw2));
	layer.StartFigure();
	layer.AddBezier(realX,realY,realX,realY,realX + fWidth,realY,realX + fWidth,Math.round(realY - (4 * scale)));
	layer.StartFigure();
	layer.AddBezier(realX,realY,realX,realY,realX + fWidth,realY,realX + fWidth,Math.round(realY + (4 * scale)));
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintGrace = function(layout,context,x,y) {
	var scale = layout.ScoreLineSpacing / 2.25;
	var realX = x - (2 * scale);
	var realY = y + (scale / 3);
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	var s = (this.Effect.DeadNote?net.coderline.jsgs.tablature.drawing.MusicFont.GraceDeadNote:net.coderline.jsgs.tablature.drawing.MusicFont.GraceNote);
	fill.AddMusicSymbol(s,realX - scale * 1.33,realY,layout.Scale);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintHammer = function(layout,context,nextNote,x,y,nextX) {
	var xScale = layout.Scale;
	var yScale = layout.StringSpacing / 10.0;
	var realX = x + (15.0 * xScale);
	var realY = y - (5.0 * yScale);
	var width = (nextNote != null?(nextNote.BeatImpl().GetRealPosX(layout) - 2 * xScale) - realX:10.0 * xScale);
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	var wScale = width / 16;
	var hScale = (this.String <= 3?1:-1);
	if(this.String > 3) realY += 15 * xScale;
	fill.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.HammerPullUp,realX,realY,layout.Scale * wScale,layout.Scale * hScale);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintHeavyAccentuated = function(layout,context,x,y) {
	var realX = x;
	var realY = y;
	var layer = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2));
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.HeavyAccentuatedNote,realX,realY,layout.Scale);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintOfflineEffects = function(layout,context,x,y,spacing) {
	var effect = this.Effect;
	var realX = x + 3 * layout.Scale;
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	var draw = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	if(effect.AccentuatedNote) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.AccentuatedEffect);
		this.PaintAccentuated(layout,context,realX,realY);
	}
	else if(effect.HeavyAccentuatedNote) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.AccentuatedEffect);
		this.PaintHeavyAccentuated(layout,context,realX,realY);
	}
	if(effect.FadeIn) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.FadeIn);
		this.PaintFadeIn(layout,context,realX,realY);
	}
	if(effect.IsHarmonic()) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.HarmonicEffect);
		var key = "";
		switch(effect.Harmonic.Type) {
		case net.coderline.jsgs.model.effects.GsHarmonicType.Natural:{
			key = "N.H";
		}break;
		case net.coderline.jsgs.model.effects.GsHarmonicType.Artificial:{
			key = "A.H";
		}break;
		case net.coderline.jsgs.model.effects.GsHarmonicType.Tapped:{
			key = "T.H";
		}break;
		case net.coderline.jsgs.model.effects.GsHarmonicType.Pinch:{
			key = "P.H";
		}break;
		case net.coderline.jsgs.model.effects.GsHarmonicType.Semi:{
			key = "S.H";
		}break;
		}
		fill.AddString(key,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	}
	if(effect.Tapping) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.TapingEffect);
		fill.AddString("T",net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	}
	else if(effect.Slapping) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.TapingEffect);
		fill.AddString("S",net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	}
	else if(effect.Popping) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.TapingEffect);
		fill.AddString("P",net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	}
	if(effect.LetRing) {
		var beat = this.BeatImpl().PreviousBeat;
		var prevRing = false;
		var nextRing = false;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.GetNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					if(note.Effect.LetRing) {
						prevRing = true;
						break;
					}
				}
			}
		}
		beat = this.BeatImpl().NextBeat;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.GetNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					if(note.Effect.LetRing) {
						nextRing = true;
						break;
					}
				}
			}
		}
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.LetRingEffect);
		var height = net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight;
		var endX = realX + this.BeatImpl().Width();
		if(!nextRing) {
			endX -= 6;
		}
		if(!prevRing) {
			fill.AddString("Ring",net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
		}
		else {
			draw.StartFigure();
			draw.AddLine(realX - 6,Math.round(realY + height / 2),endX,Math.round(realY + height / 2));
		}
		if(!nextRing && prevRing) {
			fill.AddString("|",net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,endX,realY);
		}
	}
	if(effect.PalmMute) {
		var beat = this.BeatImpl().PreviousBeat;
		var prevPM = false;
		var nextPM = false;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.GetNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					if(note.Effect.PalmMute) {
						prevPM = true;
						break;
					}
				}
			}
		}
		beat = this.BeatImpl().NextBeat;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.GetNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					if(note.Effect.PalmMute) {
						nextPM = true;
						break;
					}
				}
			}
		}
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.PalmMuteEffect);
		var height = net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight;
		var endX = Math.round(realX + this.BeatImpl().Width());
		if(!nextPM) {
			endX -= 6;
		}
		if(!prevPM) {
			fill.AddString("P.M",net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
		}
		else {
			draw.StartFigure();
			draw.AddLine(realX - 6,Math.round(realY),endX,Math.round(realY));
		}
		if(!nextPM && prevPM) {
			endX -= Math.floor(2 * layout.Scale);
			fill.AddString("|",net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,endX,realY);
		}
	}
	if(effect.Vibrato) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.VibratoEffect);
		this.PaintVibrato(layout,context,realX,realY);
	}
	if(effect.IsTrill()) {
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.VibratoEffect);
		this.PaintTrill(layout,context,realX,realY);
	}
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintScoreNote = function(layout,context,x,y,spacing) {
	var scoreSpacing = layout.ScoreLineSpacing;
	var direction = this.VoiceImpl().BeatGroup.Direction;
	var key = this.MeasureImpl().GetKeySignature();
	var clef = net.coderline.jsgs.model.GsMeasureClefConverter.ToInt(this.MeasureImpl().Clef);
	var realX = x + 4 * layout.Scale;
	var realY1 = y + this.ScorePosY;
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2));
	var effect = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	if(this.IsTiedNote) {
		var noteForTie = this.NoteForTie();
		var tieScale = scoreSpacing / 8.0;
		var tieX = realX - (20.0 * tieScale);
		var tieY = realY1;
		var tieWidth = 20.0 * tieScale;
		var tieHeight = 30.0 * tieScale;
		if(noteForTie != null) {
			tieX = noteForTie.BeatImpl().LastPaintX + 15 * layout.Scale;
			tieY = y + this.ScorePosY;
			tieWidth = (realX - tieX);
			tieHeight = (20.0 * tieScale);
		}
		if(tieWidth > 0 && tieHeight > 0) {
			var wScale = tieWidth / 16;
			fill.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.HammerPullUp,tieX,realY1,layout.Scale);
		}
	}
	var accidentalX = x - 2 * layout.Scale;
	if(this._accidental == 1) {
		net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintSmallNatural(context,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	else if(this._accidental == 2) {
		net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintSmallSharp(context,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	else if(this._accidental == 3) {
		net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintSmallFlat(context,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	if(this.Effect.IsHarmonic()) {
		var full = this.Voice.Duration.Value >= 4;
		var layer = (full?fill:effect);
		net.coderline.jsgs.tablature.drawing.NotePainter.PaintHarmonic(layer,realX,realY1 + 1,layout.Scale);
	}
	else if(this.Effect.DeadNote) {
		net.coderline.jsgs.tablature.drawing.NotePainter.PaintDeadNote(fill,realX,realY1,layout.Scale,net.coderline.jsgs.tablature.drawing.DrawingResources.ClefFont);
	}
	else {
		var full = this.Voice.Duration.Value >= 4;
		net.coderline.jsgs.tablature.drawing.NotePainter.PaintNote(fill,realX,realY1,layout.Scale,full,net.coderline.jsgs.tablature.drawing.DrawingResources.ClefFont);
	}
	if(this.Effect.IsGrace()) {
		this.PaintGrace(layout,context,realX,realY1);
	}
	if(this.Voice.Duration.IsDotted || this.Voice.Duration.IsDoubleDotted) {
		this.VoiceImpl().PaintDot(layout,fill,realX + (12.0 * (scoreSpacing / 8.0)),realY1 + (layout.ScoreLineSpacing / 2),scoreSpacing / 10.0);
	}
	var xMove = (direction == net.coderline.jsgs.model.GsVoiceDirection.Up?net.coderline.jsgs.tablature.drawing.DrawingResources.GetScoreNoteSize(layout,false).Width:0);
	var realY2 = y + this.VoiceImpl().BeatGroup.GetY2(layout,this.PosX() + spacing,key,clef);
	if(this.Effect.Staccato) {
		var Size = 3;
		var stringX = realX + xMove;
		var stringY = (realY2 + (4 * (((direction == net.coderline.jsgs.model.GsVoiceDirection.Up)?-1:1))));
		fill.AddEllipse(stringX - (Size / 2),stringY - (Size / 2),Size,Size);
	}
	if(this.Effect.IsTremoloPicking()) {
		var s = "";
		switch(this.Effect.TremoloPicking.Duration.Value) {
		case 8:{
			s = (direction == net.coderline.jsgs.model.GsVoiceDirection.Up?net.coderline.jsgs.tablature.drawing.MusicFont.TrillUpEigth:net.coderline.jsgs.tablature.drawing.MusicFont.TrillDownEigth);
		}break;
		case 16:{
			s = (direction == net.coderline.jsgs.model.GsVoiceDirection.Up?net.coderline.jsgs.tablature.drawing.MusicFont.TrillUpSixteenth:net.coderline.jsgs.tablature.drawing.MusicFont.TrillDownSixteenth);
		}break;
		case 32:{
			s = (direction == net.coderline.jsgs.model.GsVoiceDirection.Up?net.coderline.jsgs.tablature.drawing.MusicFont.TrillUpThirtySecond:net.coderline.jsgs.tablature.drawing.MusicFont.TrillDownThirtySecond);
		}break;
		}
		if(s != "") fill.AddMusicSymbol(s,realX,realY1,layout.Scale);
	}
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintSlide = function(layout,context,nextNote,x,y,nextX) {
	var xScale = layout.Scale;
	var yScale = layout.StringSpacing / 10.0;
	var yMove = 3.0 * yScale;
	var realX = x;
	var realY = y;
	var rextY = realY;
	var draw = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	draw.StartFigure();
	if(this.Effect.SlideType == net.coderline.jsgs.model.GsSlideType.IntoFromBelow) {
		realY += yMove;
		rextY -= yMove;
		draw.AddLine(realX - (5 * xScale),realY,realX + (3 * xScale),rextY);
	}
	else if(this.Effect.SlideType == net.coderline.jsgs.model.GsSlideType.IntoFromAbove) {
		realY -= yMove;
		rextY += yMove;
		draw.AddLine(realX - (5 * xScale),realY,realX + (3 * xScale),rextY);
	}
	else if(this.Effect.SlideType == net.coderline.jsgs.model.GsSlideType.OutDownWards) {
		realY -= yMove;
		rextY += yMove;
		draw.AddLine(realX + (10 * xScale),realY,realX + (18 * xScale),rextY);
	}
	else if(this.Effect.SlideType == net.coderline.jsgs.model.GsSlideType.OutUpWards) {
		realY += yMove;
		rextY -= yMove;
		draw.AddLine(realX + (10 * xScale),realY,realX + (18 * xScale),rextY);
	}
	else if(nextNote != null) {
		var fNextX = nextNote.BeatImpl().GetRealPosX(layout);
		rextY = realY;
		if(nextNote.Value < this.Value) {
			realY -= yMove;
			rextY += yMove;
		}
		else if(nextNote.Value > this.Value) {
			realY += yMove;
			rextY -= yMove;
		}
		else {
			realY -= yMove;
			rextY -= yMove;
		}
		draw.AddLine(realX + (13 * xScale),realY,fNextX,rextY);
		if(this.Effect.SlideType == net.coderline.jsgs.model.GsSlideType.SlowSlideTo) {
			this.PaintHammer(layout,context,nextNote,x,y,nextX);
		}
	}
	else {
		draw.AddLine(realX + (13 * xScale),realY - yMove,realX + (19 * xScale),realY - yMove);
	}
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintTablatureNote = function(layout,context,x,y,spacing) {
	var realX = x + Math.round(3 * layout.Scale);
	var realY = y + this.TabPosY;
	this._noteOrientation.X = realX;
	this._noteOrientation.Y = realY;
	this._noteOrientation.Width = 0;
	this._noteOrientation.Height = 0;
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2));
	if(!this.IsTiedNote) {
		this._noteOrientation = layout.GetNoteOrientation(realX,realY,this);
		var visualNote = (this.Effect.DeadNote?"X":Std.string(this.Value));
		visualNote = (this.Effect.GhostNote?("(" + visualNote) + ")":visualNote);
		fill.AddString(visualNote,net.coderline.jsgs.tablature.drawing.DrawingResources.NoteFont,this._noteOrientation.X,this._noteOrientation.Y);
	}
	this.PaintEffects(layout,context,x,y,spacing);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintTremoloBar = function(layout,context,nextBeat,x,y) {
	var scale = layout.Scale;
	var realX = x + (10 * scale);
	var realY = y - (2.0 * scale);
	var xTo;
	var minY = realY - 60 * scale;
	if(nextBeat == null) {
		xTo = (this.BeatImpl().MeasureImpl().PosX + this.BeatImpl().MeasureImpl().Width) + this.BeatImpl().MeasureImpl().Spacing;
	}
	else {
		xTo = (((nextBeat.MeasureImpl().PosX + nextBeat.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)) + nextBeat.PosX) + (nextBeat.Spacing() * scale)) + 5 * scale;
	}
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	var draw = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	if(this.Effect.TremoloBar.Points.length >= 2) {
		var dX = (xTo - realX) / 12;
		var dY = (realY - minY) / 12;
		draw.StartFigure();
		{
			var _g1 = 0, _g = this.Effect.TremoloBar.Points.length - 1;
			while(_g1 < _g) {
				var i = _g1++;
				var firstPt = this.Effect.TremoloBar.Points[i];
				var secondPt = this.Effect.TremoloBar.Points[i + 1];
				if(firstPt.Value == secondPt.Value && i == this.Effect.TremoloBar.Points.length - 2) continue;
				var firstLoc = new net.coderline.jsgs.model.Point(Math.floor(realX + (dX * firstPt.Position)),Math.floor(realY - dY * firstPt.Value));
				var secondLoc = new net.coderline.jsgs.model.Point(Math.floor(realX + (dX * secondPt.Position)),Math.floor(realY - dY * secondPt.Value));
				draw.AddLine(firstLoc.X,firstLoc.Y,secondLoc.X,secondLoc.Y);
				if(secondPt.Value != 0) {
					var dV = (secondPt.Value) * 0.5;
					var up = (secondPt.Value - firstPt.Value) >= 0;
					var s = "";
					s += Std.string(Math.floor(dV)) + " ";
					dV -= Math.floor(dV);
					if(dV == 0.25) s += "1/4";
					else if(dV == 0.5) s += "1/2";
					else if(dV == 0.75) s += "3/4";
					context.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont;
					var size = context.Graphics.measureText(s);
					var sY = (up?(secondLoc.Y - net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight) - (3 * scale):secondLoc.Y + (3 * scale));
					var sX = secondLoc.X - size.width / 2;
					fill.AddString(s,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,sX,sY);
				}
			}
		}
	}
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintTrill = function(layout,context,x,y) {
	var str = "Tr";
	context.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFont;
	var size = context.Graphics.measureText(str);
	var scale = layout.Scale;
	var realX = (x + size.width) - 2 * scale;
	var realY = y + (net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFontHeight - (5.0 * scale)) / 2.0;
	var width = (this.VoiceImpl().Width - size.Width) - (2.0 * scale);
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	fill.AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.GraceFont,x,y);
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PaintVibrato = function(layout,context,x,y) {
	var scale = layout.Scale;
	var realX = x - 2 * scale;
	var realY = y + (2.0 * scale);
	var width = this.VoiceImpl().Width;
	var fill = (this.Voice.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2));
	var step = 18 * scale;
	var loops = Math.round(Math.max(1,(width / step)));
	var s = "";
	{
		var _g = 0;
		while(_g < loops) {
			var i = _g++;
			fill.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.VibratoLeftRight,realX,realY,layout.Scale);
			realX += step;
		}
	}
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.PosX = function() {
	return this.BeatImpl().PosX;
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.ScorePosY = null;
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.TabPosY = null;
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.Update = function(layout) {
	this._accidental = this.MeasureImpl().GetNoteAccidental(this.RealValue());
	this.TabPosY = Math.round((this.String * layout.StringSpacing) - layout.StringSpacing);
	this.ScorePosY = this.VoiceImpl().BeatGroup.GetY1(layout,this,this.MeasureImpl().GetKeySignature(),net.coderline.jsgs.model.GsMeasureClefConverter.ToInt(this.MeasureImpl().Clef));
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.VoiceImpl = function() {
	return this.Voice;
}
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype._accidental = null;
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype._noteOrientation = null;
net.coderline.jsgs.tablature.model.GsNoteImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsNoteImpl;
net.coderline.jsgs.model.GsTripletFeel = { __ename__ : ["net","coderline","jsgs","model","GsTripletFeel"], __constructs__ : ["None","Eighth","Sixteenth"] }
net.coderline.jsgs.model.GsTripletFeel.Eighth = ["Eighth",1];
net.coderline.jsgs.model.GsTripletFeel.Eighth.toString = $estr;
net.coderline.jsgs.model.GsTripletFeel.Eighth.__enum__ = net.coderline.jsgs.model.GsTripletFeel;
net.coderline.jsgs.model.GsTripletFeel.None = ["None",0];
net.coderline.jsgs.model.GsTripletFeel.None.toString = $estr;
net.coderline.jsgs.model.GsTripletFeel.None.__enum__ = net.coderline.jsgs.model.GsTripletFeel;
net.coderline.jsgs.model.GsTripletFeel.Sixteenth = ["Sixteenth",2];
net.coderline.jsgs.model.GsTripletFeel.Sixteenth.toString = $estr;
net.coderline.jsgs.model.GsTripletFeel.Sixteenth.__enum__ = net.coderline.jsgs.model.GsTripletFeel;
net.coderline.jsgs.tablature.TrackSpacingPositionConverter = function() { }
net.coderline.jsgs.tablature.TrackSpacingPositionConverter.__name__ = ["net","coderline","jsgs","tablature","TrackSpacingPositionConverter"];
net.coderline.jsgs.tablature.TrackSpacingPositionConverter.ToInt = function(pos) {
	switch(pos) {
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Top:{
		return 0;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Marker:{
		return 1;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Text:{
		return 2;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.BufferSeparator:{
		return 3;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.RepeatEnding:{
		return 4;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Chord:{
		return 5;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreUpLines:{
		return 6;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines:{
		return 7;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreDownLines:{
		return 8;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Tupleto:{
		return 9;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.AccentuatedEffect:{
		return 10;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.HarmonicEffect:{
		return 11;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.TapingEffect:{
		return 12;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.LetRingEffect:{
		return 13;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.PalmMuteEffect:{
		return 14;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.VibratoEffect:{
		return 15;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.FadeIn:{
		return 16;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Bend:{
		return 17;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.TablatureTopSeparator:{
		return 18;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature:{
		return 19;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Lyric:{
		return 20;
	}break;
	case net.coderline.jsgs.tablature.TrackSpacingPositions.Bottom:{
		return 21;
	}break;
	default:{
		return 0;
	}break;
	}
}
net.coderline.jsgs.tablature.TrackSpacingPositionConverter.prototype.__class__ = net.coderline.jsgs.tablature.TrackSpacingPositionConverter;
net.coderline.jsgs.file.guitarpro.Gp4Reader = function(p) { if( p === $_ ) return; {
	net.coderline.jsgs.file.guitarpro.GpReaderBase.apply(this,[["FICHIER GUITAR PRO v4.00","FICHIER GUITAR PRO v4.06","FICHIER GUITAR PRO L4.06"]]);
}}
net.coderline.jsgs.file.guitarpro.Gp4Reader.__name__ = ["net","coderline","jsgs","file","guitarpro","Gp4Reader"];
net.coderline.jsgs.file.guitarpro.Gp4Reader.__super__ = net.coderline.jsgs.file.guitarpro.GpReaderBase;
for(var k in net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype ) net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype[k] = net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype[k];
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.GetBeat = function(measure,start) {
	{
		var _g1 = 0, _g = measure.Beats.length;
		while(_g1 < _g) {
			var b = _g1++;
			var beat = measure.Beats[b];
			if(beat.Start == start) return beat;
		}
	}
	var newBeat = this.Factory.NewBeat();
	newBeat.Start = start;
	measure.AddBeat(newBeat);
	return newBeat;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.GetTiedNoteValue = function(stringIndex,track) {
	var iMeasureCount = track.MeasureCount();
	if(iMeasureCount > 0) {
		{
			var _g = 0;
			while(_g < iMeasureCount) {
				var m2 = _g++;
				var m = (iMeasureCount - 1) - m2;
				var measure = track.Measures[m];
				{
					var _g2 = 0, _g1 = measure.BeatCount();
					while(_g2 < _g1) {
						var b2 = _g2++;
						var b = (measure.BeatCount() - 1) - b2;
						var beat = measure.Beats[b];
						{
							var _g4 = 0, _g3 = beat.Voices.length;
							while(_g4 < _g3) {
								var v = _g4++;
								var oVoice = beat.Voices[v];
								if(!oVoice.IsEmpty) {
									{
										var _g6 = 0, _g5 = oVoice.Notes.length;
										while(_g6 < _g5) {
											var n = _g6++;
											var note = oVoice.Notes[n];
											if(note.String == stringIndex) {
												return note.Value;
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
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ParseRepeatAlternative = function(song,measure,value) {
	var repeatAlternative = 0;
	var existentAlternatives = 0;
	{
		var _g1 = 0, _g = song.MeasureHeaders.length;
		while(_g1 < _g) {
			var i = _g1++;
			var header = song.MeasureHeaders[i];
			if(header.Number == measure) break;
			if(header.IsRepeatOpen) existentAlternatives = 0;
			existentAlternatives |= header.RepeatAlternative;
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
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadArtificialHarmonic = function(noteEffect) {
	var type = this.ReadByte();
	var oHarmonic = this.Factory.NewHarmonicEffect();
	oHarmonic.Data = 0;
	switch(type) {
	case 1:{
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Natural);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 3:{
		this.Skip(1);
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Tapped);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 4:{
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Pinch);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 5:{
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Semi);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 15:{
		oHarmonic.Data = 2;
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Artificial);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 17:{
		oHarmonic.Data = 3;
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Artificial);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 22:{
		oHarmonic.Data = 0;
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Artificial);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadBeat = function(start,measure,track,voiceIndex) {
	var flags = this.ReadUnsignedByte();
	var beat = this.GetBeat(measure,start);
	var voice = beat.Voices[voiceIndex];
	if((flags & 64) != 0) {
		var beatType = this.ReadUnsignedByte();
		voice.IsEmpty = ((beatType & 2) == 0);
	}
	var duration = this.ReadDuration(flags);
	var effect = this.Factory.NewEffect();
	if((flags & 2) != 0) {
		this.ReadChord(track.StringCount(),beat);
	}
	if((flags & 4) != 0) {
		this.ReadText(beat);
	}
	if((flags & 8) != 0) {
		this.ReadBeatEffects(beat,effect);
	}
	if((flags & 16) != 0) {
		var mixTableChange = this.ReadMixTableChange();
		beat.MixTableChange = mixTableChange;
	}
	var stringFlags = this.ReadUnsignedByte();
	{
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & (1 << i)) != 0 && (6 - i) < track.StringCount()) {
				var guitarString = track.Strings[6 - i].Clone(this.Factory);
				var note = this.ReadNote(guitarString,track,effect.Clone(this.Factory));
				voice.AddNote(note);
			}
			duration.Copy(voice.Duration);
		}
	}
	return ((!voice.IsEmpty)?duration.Time():0);
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadBeatEffects = function(beat,effect) {
	var flags1 = this.ReadUnsignedByte();
	var flags2 = this.ReadUnsignedByte();
	effect.FadeIn = (((flags1 & 16) != 0));
	effect.Vibrato = (((flags1 & 2) != 0));
	if((flags1 & 32) != 0) {
		var slapEffect = this.ReadUnsignedByte();
		effect.Tapping = (slapEffect == 1);
		effect.Slapping = (slapEffect == 2);
		effect.Popping = (slapEffect == 3);
	}
	if((flags2 & 4) != 0) {
		this.ReadTremoloBar(effect);
	}
	if((flags1 & 64) != 0) {
		var strokeUp = this.ReadByte();
		var strokeDown = this.ReadByte();
		if(strokeUp > 0) {
			beat.Stroke.Direction = net.coderline.jsgs.model.GsBeatStrokeDirection.Up;
			beat.Stroke.Value = (this.ToStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.Stroke.Direction = net.coderline.jsgs.model.GsBeatStrokeDirection.Down;
			beat.Stroke.Value = (this.ToStrokeValue(strokeDown));
		}
	}
	beat.HasRasgueado = (flags2 & 1) != 0;
	if((flags2 & 2) != 0) {
		beat.PickStroke = this.ReadByte();
		beat.HasPickStroke = true;
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadBend = function(noteEffect) {
	var bendEffect = this.Factory.NewBendEffect();
	bendEffect.Type = net.coderline.jsgs.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	bendEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / 25);
			var vibrato = this.ReadBool();
			bendEffect.Points.push(new net.coderline.jsgs.model.effects.GsBendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) noteEffect.Bend = bendEffect;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadChannel = function(midiChannel,channels) {
	var index = (this.ReadInt() - 1);
	var effectChannel = (this.ReadInt() - 1);
	if(index >= 0 && index < channels.length) {
		channels[index].Copy(midiChannel);
		if(midiChannel.Instrument() < 0) {
			midiChannel.Instrument(0);
		}
		if(!midiChannel.IsPercussionChannel()) {
			midiChannel.EffectChannel = (effectChannel);
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadChord = function(stringCount,beat) {
	var chord = this.Factory.NewChord(stringCount);
	if((this.ReadUnsignedByte() & 1) == 0) {
		chord.Name = (this.ReadIntSizeCheckByteString());
		chord.FirstFret = (this.ReadInt());
		if(chord.FirstFret != 0) {
			{
				var _g = 0;
				while(_g < 6) {
					var i = _g++;
					var fret = this.ReadInt();
					if(i < chord.Strings.length) {
						chord.Strings[i] = fret;
					}
				}
			}
		}
	}
	else {
		this.Skip(16);
		chord.Name = (this.ReadByteSizeString(21));
		this.Skip(4);
		chord.FirstFret = (this.ReadInt());
		{
			var _g = 0;
			while(_g < 7) {
				var i = _g++;
				var fret = this.ReadInt();
				if(i < chord.Strings.length) {
					chord.Strings[i] = fret;
				}
			}
		}
		this.Skip(32);
	}
	if(chord.NoteCount() > 0) {
		beat.Chord = (chord);
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadColor = function() {
	var r = (this.ReadUnsignedByte());
	var g = this.ReadUnsignedByte();
	var b = (this.ReadUnsignedByte());
	this.Skip(1);
	return new net.coderline.jsgs.model.GsColor(r,g,b);
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadDuration = function(flags) {
	var duration = this.Factory.NewDuration();
	duration.Value = Math.round(Math.pow(2,(this.ReadByte() + 4)) / 4);
	duration.IsDotted = (((flags & 1) != 0));
	if((flags & 32) != 0) {
		var iTuplet = this.ReadInt();
		switch(iTuplet) {
		case 3:{
			duration.Triplet.Enters = 3;
			duration.Triplet.Times = 2;
		}break;
		case 5:{
			duration.Triplet.Enters = 5;
			duration.Triplet.Times = 4;
		}break;
		case 6:{
			duration.Triplet.Enters = 6;
			duration.Triplet.Times = 4;
		}break;
		case 7:{
			duration.Triplet.Enters = 7;
			duration.Triplet.Times = 4;
		}break;
		case 9:{
			duration.Triplet.Enters = 9;
			duration.Triplet.Times = 8;
		}break;
		case 10:{
			duration.Triplet.Enters = 10;
			duration.Triplet.Times = 8;
		}break;
		case 11:{
			duration.Triplet.Enters = 11;
			duration.Triplet.Times = 8;
		}break;
		case 12:{
			duration.Triplet.Enters = 12;
			duration.Triplet.Times = 8;
		}break;
		}
	}
	return duration;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadGrace = function(noteEffect) {
	var fret = this.ReadUnsignedByte();
	var dyn = this.ReadUnsignedByte();
	var transition = this.ReadByte();
	var duration = this.ReadUnsignedByte();
	var grace = this.Factory.NewGraceEffect();
	grace.Fret = (fret);
	grace.Dynamic = ((15 + (16 * dyn)) - 16);
	grace.Duration = (duration);
	grace.IsDead = fret == 255;
	grace.IsOnBeat = false;
	switch(transition) {
	case 0:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.None;
	}break;
	case 1:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Slide;
	}break;
	case 2:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Bend;
	}break;
	case 3:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Hammer;
	}break;
	}
	noteEffect.Grace = (grace);
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadInfo = function(song) {
	song.Title = (this.ReadIntSizeCheckByteString());
	song.Subtitle = this.ReadIntSizeCheckByteString();
	song.Artist = (this.ReadIntSizeCheckByteString());
	song.Album = (this.ReadIntSizeCheckByteString());
	song.Words = (this.ReadIntSizeCheckByteString());
	song.Music = song.Words;
	song.Copyright = this.ReadIntSizeCheckByteString();
	song.Tab = this.ReadIntSizeCheckByteString();
	song.Instructions = this.ReadIntSizeCheckByteString();
	var iNotes = this.ReadInt();
	song.Notice = "";
	{
		var _g = 0;
		while(_g < iNotes) {
			var i = _g++;
			song.Notice += this.ReadIntSizeCheckByteString() + "\n";
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadLyrics = function(song) {
	song.Lyrics = this.Factory.NewLyrics();
	song.Lyrics.TrackChoice = this.ReadInt();
	{
		var _g = 0;
		while(_g < 5) {
			var i = _g++;
			var line = this.Factory.NewLyricLine();
			line.StartingMeasure = this.ReadInt();
			line.Lyrics = this.ReadIntSizeString();
			song.Lyrics.Lines.push(line);
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadMarker = function(header) {
	var marker = this.Factory.NewMarker();
	marker.MeasureHeader = header;
	marker.Title = this.ReadIntSizeCheckByteString();
	marker.Color = this.ReadColor();
	return marker;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadMeasure = function(measure,track) {
	var start = measure.Start();
	var beats = this.ReadInt();
	{
		var _g = 0;
		while(_g < beats) {
			var beat = _g++;
			start += this.ReadBeat(start,measure,track,0);
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadMeasureHeader = function(i,timeSignature,song) {
	var flags = this.ReadUnsignedByte();
	var header = this.Factory.NewMeasureHeader();
	header.Number = i + 1;
	header.Start = 0;
	header.Tempo.Value = 120;
	header.TripletFeel = this._tripletFeel;
	if((flags & 1) != 0) timeSignature.Numerator = this.ReadByte();
	if((flags & 2) != 0) timeSignature.Denominator.Value = this.ReadByte();
	header.IsRepeatOpen = ((flags & 4) != 0);
	timeSignature.Copy(header.TimeSignature);
	if((flags & 8) != 0) header.RepeatClose = (this.ReadByte() - 1);
	if((flags & 16) != 0) header.RepeatAlternative = this.ParseRepeatAlternative(song,header.Number,this.ReadUnsignedByte());
	if((flags & 32) != 0) header.Marker = this.ReadMarker(header);
	if((flags & 64) != 0) {
		header.KeySignature = this.ToKeySignature(this.ReadByte());
		header.KeySignatureType = this.ReadByte();
	}
	header.HasDoubleBar = (flags & 128) != 0;
	return header;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadMeasureHeaders = function(song,measureCount) {
	var timeSignature = this.Factory.NewTimeSignature();
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.AddMeasureHeader(this.ReadMeasureHeader(i,timeSignature,song));
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadMeasures = function(song) {
	var tempo = this.Factory.NewTempo();
	tempo.Value = song.Tempo;
	var start = 960;
	{
		var _g1 = 0, _g = song.MeasureHeaders.length;
		while(_g1 < _g) {
			var h = _g1++;
			var header = song.MeasureHeaders[h];
			header.Start = start;
			{
				var _g3 = 0, _g2 = song.Tracks.length;
				while(_g3 < _g2) {
					var t = _g3++;
					var track = song.Tracks[t];
					var measure = this.Factory.NewMeasure(header);
					track.AddMeasure(measure);
					this.ReadMeasure(measure,track);
				}
			}
			tempo.Copy(header.Tempo);
			start += header.Length();
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadMidiChannels = function() {
	var channels = new Array();
	{
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.Factory.NewMidiChannel();
			newChannel.Channel = (i);
			newChannel.EffectChannel = (i);
			newChannel.Instrument(this.ReadInt());
			newChannel.Volume = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Balance = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Chorus = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Reverb = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Phaser = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Tremolo = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			channels.push(newChannel);
			this.Skip(2);
		}
	}
	return channels;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadMixTableChange = function() {
	var tableChange = this.Factory.NewMixTableChange();
	tableChange.Instrument.Value = this.ReadByte();
	tableChange.Volume.Value = this.ReadByte();
	tableChange.Balance.Value = this.ReadByte();
	tableChange.Chorus.Value = this.ReadByte();
	tableChange.Reverb.Value = this.ReadByte();
	tableChange.Phaser.Value = this.ReadByte();
	tableChange.Tremolo.Value = this.ReadByte();
	tableChange.TempoName = this.ReadIntSizeCheckByteString();
	tableChange.Tempo.Value = this.ReadInt();
	if(tableChange.Instrument.Value < 0) tableChange.Instrument = null;
	if(tableChange.Volume.Value >= 0) tableChange.Volume.Duration = this.ReadByte();
	else tableChange.Volume = null;
	if(tableChange.Balance.Value >= 0) tableChange.Balance.Duration = this.ReadByte();
	else tableChange.Balance = null;
	if(tableChange.Chorus.Value >= 0) tableChange.Chorus.Duration = this.ReadByte();
	else tableChange.Chorus = null;
	if(tableChange.Reverb.Value >= 0) tableChange.Reverb.Duration = this.ReadByte();
	else tableChange.Reverb = null;
	if(tableChange.Phaser.Value >= 0) tableChange.Phaser.Duration = this.ReadByte();
	else tableChange.Phaser = null;
	if(tableChange.Tremolo.Value >= 0) tableChange.Tremolo.Duration = this.ReadByte();
	else tableChange.Tremolo = null;
	if(tableChange.Tempo.Value >= 0) {
		tableChange.Tempo.Duration = this.ReadByte();
		tableChange.HideTempo = false;
	}
	else tableChange.Tempo = null;
	var allTracksFlags = this.ReadUnsignedByte();
	if(tableChange.Volume != null) tableChange.Volume.AllTracks = (allTracksFlags & 1) != 0;
	if(tableChange.Balance != null) tableChange.Balance.AllTracks = (allTracksFlags & 2) != 0;
	if(tableChange.Chorus != null) tableChange.Chorus.AllTracks = (allTracksFlags & 4) != 0;
	if(tableChange.Reverb != null) tableChange.Reverb.AllTracks = (allTracksFlags & 8) != 0;
	if(tableChange.Phaser != null) tableChange.Phaser.AllTracks = (allTracksFlags & 16) != 0;
	if(tableChange.Tremolo != null) tableChange.Tremolo.AllTracks = (allTracksFlags & 32) != 0;
	if(tableChange.Tempo != null) tableChange.Tempo.AllTracks = true;
	return tableChange;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadNote = function(guitarString,track,effect) {
	var flags = this.ReadUnsignedByte();
	var note = this.Factory.NewNote();
	note.String = (guitarString.Number);
	note.Effect = (effect);
	note.Effect.AccentuatedNote = (((flags & 64) != 0));
	note.Effect.HeavyAccentuatedNote = (((flags & 2) != 0));
	note.Effect.GhostNote = (((flags & 4) != 0));
	if((flags & 32) != 0) {
		var noteType = this.ReadUnsignedByte();
		note.IsTiedNote = ((noteType == 2));
		note.Effect.DeadNote = ((noteType == 3));
	}
	if((flags & 16) != 0) {
		note.Velocity = ((15 + (16 * this.ReadByte())) - 16);
	}
	if((flags & 32) != 0) {
		var fret = this.ReadByte();
		var value = ((note.IsTiedNote?this.GetTiedNoteValue(guitarString.Number,track):fret));
		note.Value = ((value >= 0 && value < 100?value:0));
	}
	if((flags & 128) != 0) {
		note.LeftHandFinger = this.ReadByte();
		note.RightHandFinger = this.ReadByte();
		note.IsFingering = true;
	}
	if((flags & 8) != 0) {
		this.ReadNoteEffects(note.Effect);
	}
	return note;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadNoteEffects = function(noteEffect) {
	var flags1 = this.ReadUnsignedByte();
	var flags2 = this.ReadUnsignedByte();
	if((flags1 & 1) != 0) {
		this.ReadBend(noteEffect);
	}
	if((flags1 & 16) != 0) {
		this.ReadGrace(noteEffect);
	}
	if((flags2 & 4) != 0) {
		this.ReadTremoloPicking(noteEffect);
	}
	if((flags2 & 8) != 0) {
		noteEffect.Slide = true;
		var type = this.ReadByte();
		switch(type) {
		case 1:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.FastSlideTo;
		}break;
		case 2:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.SlowSlideTo;
		}break;
		case 4:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.OutDownWards;
		}break;
		case 8:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.OutUpWards;
		}break;
		case 16:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.IntoFromBelow;
		}break;
		case 32:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.IntoFromAbove;
		}break;
		}
	}
	if((flags2 & 16) != 0) {
		this.ReadArtificialHarmonic(noteEffect);
	}
	if((flags2 & 32) != 0) {
		this.ReadTrill(noteEffect);
	}
	noteEffect.LetRing = (flags1 & 8) != 0;
	noteEffect.Hammer = (((flags1 & 2) != 0));
	noteEffect.Vibrato = (((flags2 & 64) != 0) || noteEffect.Vibrato);
	noteEffect.PalmMute = (((flags2 & 2) != 0));
	noteEffect.Staccato = (((flags2 & 1) != 0));
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadPageSetup = function(song) {
	var setup = net.coderline.jsgs.model.GsPageSetup.Defaults();
	song.PageSetup = setup;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadSong = function() {
	if(!this.ReadVersion()) {
		throw new net.coderline.jsgs.file.FileFormatException("Unsupported Version");
	}
	var song = this.Factory.NewSong();
	this.ReadInfo(song);
	this._tripletFeel = (this.ReadBool()?net.coderline.jsgs.model.GsTripletFeel.Eighth:net.coderline.jsgs.model.GsTripletFeel.None);
	this.ReadLyrics(song);
	this.ReadPageSetup(song);
	song.TempoName = "";
	song.Tempo = this.ReadInt();
	song.HideTempo = false;
	song.Key = this.ReadByte();
	song.Octave = this.ReadInt();
	var channels = this.ReadMidiChannels();
	var measureCount = this.ReadInt();
	var trackCount = this.ReadInt();
	this.ReadMeasureHeaders(song,measureCount);
	this.ReadTracks(song,trackCount,channels);
	this.ReadMeasures(song);
	return song;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadText = function(beat) {
	var text = this.Factory.NewText();
	text.Value = this.ReadIntSizeCheckByteString();
	beat.SetText(text);
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadTrack = function(number,channels) {
	var flags = this.ReadUnsignedByte();
	var track = this.Factory.NewTrack();
	track.IsPercussionTrack = (flags & 1) != 0;
	track.Is12StringedGuitarTrack = (flags & 2) != 0;
	track.IsBanjoTrack = (flags & 4) != 0;
	track.Number = number;
	track.Name = this.ReadByteSizeString(40);
	var stringCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var iTuning = this.ReadInt();
			if(stringCount > i) {
				var oString = this.Factory.NewString();
				oString.Number = (i + 1);
				oString.Value = (iTuning);
				track.Strings.push(oString);
			}
		}
	}
	track.Port = this.ReadInt();
	this.ReadChannel(track.Channel,channels);
	track.FretCount = this.ReadInt();
	track.Offset = this.ReadInt();
	track.Color = this.ReadColor();
	return track;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadTracks = function(song,trackCount,channels) {
	var _g1 = 1, _g = trackCount + 1;
	while(_g1 < _g) {
		var i = _g1++;
		song.AddTrack(this.ReadTrack(i,channels));
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadTremoloBar = function(effect) {
	var barEffect = this.Factory.NewTremoloBarEffect();
	barEffect.Type = net.coderline.jsgs.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	barEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / (25 * 2.0));
			var vibrato = this.ReadBool();
			barEffect.Points.push(new net.coderline.jsgs.model.effects.GsTremoloBarPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) effect.TremoloBar = barEffect;
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadTremoloPicking = function(noteEffect) {
	var value = this.ReadUnsignedByte();
	var tp = this.Factory.NewTremoloPickingEffect();
	switch(value) {
	case 1:{
		tp.Duration.Value = 8;
		noteEffect.TremoloPicking = (tp);
	}break;
	case 2:{
		tp.Duration.Value = 16;
		noteEffect.TremoloPicking = (tp);
	}break;
	case 3:{
		tp.Duration.Value = 32;
		noteEffect.TremoloPicking = (tp);
	}break;
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ReadTrill = function(noteEffect) {
	var fret = this.ReadByte();
	var period = this.ReadByte();
	var trill = this.Factory.NewTrillEffect();
	trill.Fret = (fret);
	switch(period) {
	case 1:{
		trill.Duration.Value = 16;
		noteEffect.Trill = (trill);
	}break;
	case 2:{
		trill.Duration.Value = 32;
		noteEffect.Trill = (trill);
	}break;
	case 3:{
		trill.Duration.Value = 64;
		noteEffect.Trill = (trill);
	}break;
	}
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ToKeySignature = function(p) {
	return (p < 0?7 + Math.round(Math.abs(p)):p);
}
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.ToStrokeValue = function(value) {
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
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype._tripletFeel = null;
net.coderline.jsgs.file.guitarpro.Gp4Reader.prototype.__class__ = net.coderline.jsgs.file.guitarpro.Gp4Reader;
net.coderline.jsgs.model.effects.GsBendEffect = function(p) { if( p === $_ ) return; {
	this.Type = net.coderline.jsgs.model.effects.GsBendTypes.None;
	this.Value = 0;
	this.Points = new Array();
}}
net.coderline.jsgs.model.effects.GsBendEffect.__name__ = ["net","coderline","jsgs","model","effects","GsBendEffect"];
net.coderline.jsgs.model.effects.GsBendEffect.prototype.Clone = function(factory) {
	var effect = factory.NewBendEffect();
	effect.Value = this.Value;
	effect.Type = this.Type;
	{
		var _g1 = 0, _g = this.Points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.Points[i];
			effect.Points.push(new net.coderline.jsgs.model.effects.GsBendPoint(point.Position,point.Value,point.Vibrato));
		}
	}
	return effect;
}
net.coderline.jsgs.model.effects.GsBendEffect.prototype.Points = null;
net.coderline.jsgs.model.effects.GsBendEffect.prototype.Type = null;
net.coderline.jsgs.model.effects.GsBendEffect.prototype.Value = null;
net.coderline.jsgs.model.effects.GsBendEffect.prototype.__class__ = net.coderline.jsgs.model.effects.GsBendEffect;
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
net.coderline.jsgs.model.GsLyricLine = function(startingMeasure,lyrics) { if( startingMeasure === $_ ) return; {
	if(lyrics == null) lyrics = "";
	if(startingMeasure == null) startingMeasure = 0;
	this.StartingMeasure = startingMeasure;
	this.Lyrics = lyrics;
}}
net.coderline.jsgs.model.GsLyricLine.__name__ = ["net","coderline","jsgs","model","GsLyricLine"];
net.coderline.jsgs.model.GsLyricLine.prototype.Lyrics = null;
net.coderline.jsgs.model.GsLyricLine.prototype.StartingMeasure = null;
net.coderline.jsgs.model.GsLyricLine.prototype.__class__ = net.coderline.jsgs.model.GsLyricLine;
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
if(!haxe._Template) haxe._Template = {}
haxe._Template.TemplateExpr = { __ename__ : ["haxe","_Template","TemplateExpr"], __constructs__ : ["OpVar","OpExpr","OpIf","OpStr","OpBlock","OpForeach","OpMacro"] }
haxe._Template.TemplateExpr.OpBlock = function(l) { var $x = ["OpBlock",4,l]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpExpr = function(expr) { var $x = ["OpExpr",1,expr]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpForeach = function(expr,loop) { var $x = ["OpForeach",5,expr,loop]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpIf = function(expr,eif,eelse) { var $x = ["OpIf",2,expr,eif,eelse]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpMacro = function(name,params) { var $x = ["OpMacro",6,name,params]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpStr = function(str) { var $x = ["OpStr",3,str]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
haxe._Template.TemplateExpr.OpVar = function(v) { var $x = ["OpVar",0,v]; $x.__enum__ = haxe._Template.TemplateExpr; $x.toString = $estr; return $x; }
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
net.coderline.jsgs.model.GsVoice = function(factory,index) { if( factory === $_ ) return; {
	this.Duration = factory.NewDuration();
	this.Notes = new Array();
	this.Index = index;
	this.Direction = net.coderline.jsgs.model.GsVoiceDirection.None;
	this.IsEmpty = true;
}}
net.coderline.jsgs.model.GsVoice.__name__ = ["net","coderline","jsgs","model","GsVoice"];
net.coderline.jsgs.model.GsVoice.prototype.AddNote = function(note) {
	note.Voice = this;
	this.Notes.push(note);
	this.IsEmpty = false;
}
net.coderline.jsgs.model.GsVoice.prototype.Beat = null;
net.coderline.jsgs.model.GsVoice.prototype.Direction = null;
net.coderline.jsgs.model.GsVoice.prototype.Duration = null;
net.coderline.jsgs.model.GsVoice.prototype.Index = null;
net.coderline.jsgs.model.GsVoice.prototype.IsEmpty = null;
net.coderline.jsgs.model.GsVoice.prototype.IsRestVoice = function() {
	return this.Notes.length == 0;
}
net.coderline.jsgs.model.GsVoice.prototype.Notes = null;
net.coderline.jsgs.model.GsVoice.prototype.__class__ = net.coderline.jsgs.model.GsVoice;
net.coderline.jsgs.tablature.model.GsVoiceImpl = function(factory,index) { if( factory === $_ ) return; {
	net.coderline.jsgs.model.GsVoice.apply(this,[factory,index]);
}}
net.coderline.jsgs.tablature.model.GsVoiceImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsVoiceImpl"];
net.coderline.jsgs.tablature.model.GsVoiceImpl.__super__ = net.coderline.jsgs.model.GsVoice;
for(var k in net.coderline.jsgs.model.GsVoice.prototype ) net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype[k] = net.coderline.jsgs.model.GsVoice.prototype[k];
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.BeatGroup = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.BeatImpl = function() {
	return this.Beat;
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.Check = function(note) {
	var value = note.RealValue();
	if(this.MaxNote == null || value > this.MaxNote.RealValue()) this.MaxNote = note;
	if(this.MinNote == null || value < this.MinNote.RealValue()) this.MinNote = note;
	this.UsedStrings()[note.String - 1] = true;
	if(note.String > this.MaxString) this.MaxString = note.String;
	if(note.String < this.MinString) this.MinString = note.String;
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.GetPaintPosition = function(iIndex) {
	return this.MeasureImpl().Ts.Get(iIndex);
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.IsHiddenSilence = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.IsJoinedGreaterThanQuarter = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.Join1 = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.Join2 = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.JoinedType = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.MaxNote = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.MaxString = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.MaxY = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.MeasureImpl = function() {
	return this.Beat.Measure;
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.MinNote = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.MinString = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.MinY = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.NextBeat = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.Paint = function(layout,context,x,y) {
	if(!this.IsEmpty) {
		if(this.IsRestVoice() && !this.IsHiddenSilence) {
			this.PaintSilence(layout,context,x,y);
		}
		else {
			{
				var _g = 0, _g1 = this.Notes;
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var noteImpl = note;
					noteImpl.Paint(layout,context,x,y);
				}
			}
			this.PaintBeat(layout,context,x,y);
		}
	}
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.PaintBeat = function(layout,context,x,y) {
	if(!this.IsRestVoice()) {
		var spacing = this.BeatImpl().Spacing();
		this.PaintScoreBeat(layout,context,x,y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines),spacing);
	}
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.PaintDot = function(layout,layer,x,y,scale) {
	var dotSize = 3.0 * scale;
	layer.AddEllipse(Math.round(x - (dotSize / 2.0)),Math.round(y - (dotSize / 2.0)),dotSize,dotSize);
	if(this.Duration.IsDoubleDotted) {
		layer.AddEllipse(Math.round((x + (dotSize + 2.0)) - (dotSize / 2.0)),Math.round(y - (dotSize / 2.0)),dotSize,dotSize);
	}
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.PaintScoreBeat = function(layout,context,x,y,spacing) {
	var vX = x + 4 * layout.Scale;
	var fill = (this.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2));
	var draw = (this.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw2));
	if(!this.Duration.Triplet.Equals(new net.coderline.jsgs.model.GsTriplet())) {
		fill.AddString(Std.string(this.Duration.Triplet.Enters),net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,vX,(y - this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines)) + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.Tupleto));
	}
	if(this.Duration.Value >= 2) {
		var scale = layout.Scale;
		var lineSpacing = layout.ScoreLineSpacing;
		var direction = this.BeatGroup.Direction;
		var key = this.Beat.Measure.GetKeySignature();
		var clef = net.coderline.jsgs.model.GsMeasureClefConverter.ToInt(this.Beat.Measure.Clef);
		var xMove = (direction == net.coderline.jsgs.model.GsVoiceDirection.Up?net.coderline.jsgs.tablature.drawing.DrawingResources.GetScoreNoteSize(layout,false).Width:0);
		var yMove = (direction == net.coderline.jsgs.model.GsVoiceDirection.Up?Math.round(layout.ScoreLineSpacing / 3) + 1:Math.round(layout.ScoreLineSpacing / 3) * 2);
		var vY1 = y + (((direction == net.coderline.jsgs.model.GsVoiceDirection.Down)?this.MaxNote.ScorePosY:this.MinNote.ScorePosY));
		var vY2 = y + this.BeatGroup.GetY2(layout,this.PosX() + spacing,key,clef);
		draw.StartFigure();
		draw.MoveTo(vX + xMove,vY1 + yMove);
		draw.LineTo(vX + xMove,vY2);
		if(this.Duration.Value >= 8) {
			var index = this.Duration.Index() - 3;
			if(index >= 0) {
				var dir = (direction == net.coderline.jsgs.model.GsVoiceDirection.Down?1:-1);
				var joinedType = this.JoinedType;
				var bJoinedGreaterThanQuarter = this.IsJoinedGreaterThanQuarter;
				if((joinedType == net.coderline.jsgs.tablature.model.GsJoinedType.NoneLeft || joinedType == net.coderline.jsgs.tablature.model.GsJoinedType.NoneRight) && !bJoinedGreaterThanQuarter) {
					var hY = ((y + this.BeatGroup.GetY2(layout,this.PosX() + spacing,key,clef)) - ((lineSpacing * 2) * dir));
					net.coderline.jsgs.tablature.drawing.NotePainter.PaintFooter(fill,vX,vY2,this.Duration.Value,dir,layout);
				}
				else {
					var startX;
					var endX;
					var startXforCalculation;
					var endXforCalculation;
					if(joinedType == net.coderline.jsgs.tablature.model.GsJoinedType.NoneRight) {
						startX = Math.round(this.BeatImpl().GetRealPosX(layout) + xMove);
						endX = Math.round((this.BeatImpl().GetRealPosX(layout) + 6) + xMove);
						startXforCalculation = this.PosX() + spacing;
						endXforCalculation = (this.PosX() + spacing) + 6;
					}
					else if(joinedType == net.coderline.jsgs.tablature.model.GsJoinedType.NoneLeft) {
						startX = Math.round((this.BeatImpl().GetRealPosX(layout) - 6) + xMove);
						endX = Math.round(this.BeatImpl().GetRealPosX(layout) + xMove);
						startXforCalculation = (this.PosX() + spacing) - 6;
						endXforCalculation = this.PosX() + spacing;
					}
					else {
						startX = Math.round(this.Join1.BeatImpl().GetRealPosX(layout) + xMove);
						endX = Math.round(this.Join2.BeatImpl().GetRealPosX(layout) + xMove);
						startXforCalculation = this.Join1.PosX() + this.Join1.BeatImpl().Spacing();
						endXforCalculation = this.Join2.PosX() + this.Join2.BeatImpl().Spacing();
					}
					var hY1 = y + this.BeatGroup.GetY2(layout,startXforCalculation,key,clef);
					var hY2 = y + this.BeatGroup.GetY2(layout,endXforCalculation,key,clef);
					var x1 = startX;
					var x2 = endX;
					net.coderline.jsgs.tablature.drawing.NotePainter.PaintBar(fill,x1,hY1,x2,hY2,index + 1,dir,scale);
				}
			}
		}
	}
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.PaintSilence = function(layout,context,x,y) {
	var realX = x + 3 * layout.Scale;
	var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines);
	var lineSpacing = layout.ScoreLineSpacing;
	var scale = lineSpacing;
	var fill = (this.Index == 0?context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1):context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2));
	switch(this.Duration.Value) {
	case 1:{
		net.coderline.jsgs.tablature.drawing.SilencePainter.PaintWhole(fill,realX,realY,layout);
	}break;
	case 2:{
		net.coderline.jsgs.tablature.drawing.SilencePainter.PaintHalf(fill,realX,realY,layout);
	}break;
	case 4:{
		net.coderline.jsgs.tablature.drawing.SilencePainter.PaintQuarter(fill,realX,realY,layout);
	}break;
	case 8:{
		net.coderline.jsgs.tablature.drawing.SilencePainter.PaintEighth(fill,realX,realY,layout);
	}break;
	case 16:{
		net.coderline.jsgs.tablature.drawing.SilencePainter.PaintSixteenth(fill,realX,realY,layout);
	}break;
	case 32:{
		net.coderline.jsgs.tablature.drawing.SilencePainter.PaintThirtySecond(fill,realX,realY,layout);
	}break;
	case 64:{
		net.coderline.jsgs.tablature.drawing.SilencePainter.PaintSixtyFourth(fill,realX,realY,layout);
	}break;
	}
	if(this.Duration.IsDotted || this.Duration.IsDoubleDotted) {
		fill.MoveTo(realX + 10,realY + 1);
		fill.EllipseTo(1,1);
		if(this.Duration.IsDoubleDotted) {
			fill.MoveTo((realX + 13),realY + 1);
			fill.EllipseTo(1,1);
		}
	}
	if(!this.Duration.Triplet.Equals(new net.coderline.jsgs.model.GsTriplet())) {
		fill.AddString(Std.string(this.Duration.Triplet.Enters),net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,Math.round(realX),Math.round(y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.Tupleto)));
	}
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.PosX = function() {
	return this.BeatImpl().PosX;
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.PreviousBeat = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.Reset = function() {
	this.MaxNote = null;
	this.MinNote = null;
	this._hiddenSilence = false;
	this._usedStrings = new Array();
	{
		var _g1 = 0, _g = this.Beat.Measure.Track.StringCount();
		while(_g1 < _g) {
			var i = _g1++;
			this._usedStrings.push(false);
		}
	}
	this.MaxString = 1;
	this.MinString = this.Beat.Measure.Track.StringCount();
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.Update = function(layout) {
	this.MinY = 0;
	this.MaxY = 0;
	if(this.IsRestVoice()) this.UpdateSilenceSpacing(layout);
	else this.UpdateNoteVoice(layout);
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.UpdateNoteVoice = function(layout) {
	this.JoinedType = net.coderline.jsgs.tablature.model.GsJoinedType.NoneRight;
	this.IsJoinedGreaterThanQuarter = false;
	this.Join1 = this;
	this.Join2 = this;
	var noteJoined = false;
	var withPrev = false;
	if(this.PreviousBeat != null && !this.PreviousBeat.IsRestVoice()) {
		if(this.MeasureImpl().CanJoin(layout.SongManager(),this,this.PreviousBeat)) {
			withPrev = true;
			if(this.PreviousBeat.Duration.Value >= this.Duration.Value) {
				this.Join1 = this.PreviousBeat;
				this.Join2 = this;
				this.JoinedType = net.coderline.jsgs.tablature.model.GsJoinedType.Left;
				noteJoined = true;
			}
			if(this.PreviousBeat.Duration.Value > 4) {
				this.IsJoinedGreaterThanQuarter = true;
			}
		}
	}
	if(this.NextBeat != null && !this.NextBeat.IsRestVoice()) {
		if(this.MeasureImpl().CanJoin(layout.SongManager(),this,this.NextBeat)) {
			if(this.NextBeat.Duration.Value >= this.Duration.Value) {
				this.Join2 = this.NextBeat;
				if(this.PreviousBeat == null || this.PreviousBeat.IsRestVoice() || this.PreviousBeat.Duration.Value < this.Duration.Value) this.Join1 = this;
				noteJoined = true;
				this.JoinedType = net.coderline.jsgs.tablature.model.GsJoinedType.Right;
			}
			if(this.NextBeat.Duration.Value > 4) this.IsJoinedGreaterThanQuarter = true;
		}
	}
	if(!noteJoined && withPrev) this.JoinedType = net.coderline.jsgs.tablature.model.GsJoinedType.NoneLeft;
	this.MinY = 0;
	this.MaxY = this.BeatImpl().MeasureImpl().TrackImpl().TabHeight;
	if(this.BeatGroup.Direction == net.coderline.jsgs.model.GsVoiceDirection.Down) {
		this.MaxY += Math.floor((layout.StringSpacing / 2) * 5) + 1;
	}
	else {
		this.MinY -= Math.floor((layout.StringSpacing / 2) * 5) + 1;
	}
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.UpdateSilenceSpacing = function(layout) {
	this._silenceY = 0;
	this._silenceHeight = 0;
	if(!this._hiddenSilence) {
		var lineSpacing = layout.ScoreLineSpacing;
		var LineCount = 5;
		var scale = (lineSpacing / 9.0);
		var duration = this.Duration.Value;
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
			var _g1 = 0, _g = this.Beat.Voices.length;
			while(_g1 < _g) {
				var v = _g1++;
				if(v != this.Index) {
					var voice = this.BeatImpl().GetVoiceImpl(v);
					if(!voice.IsEmpty) {
						if(voice.IsRestVoice()) {
							if(!voice.IsHiddenSilence) {
								var maxSilenceHeight = (lineSpacing * 3);
								var firstPosition = (this._silenceY - (maxSilenceHeight / this.Beat.Voices.length));
								this._silenceY = (firstPosition + (maxSilenceHeight * this.Index));
							}
						}
					}
				}
			}
		}
		this.MinY = this._silenceY;
		this.MaxY = this._silenceY + this._silenceHeight;
	}
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.UsedStrings = function() {
	if(this._usedStrings == null) {
		this._usedStrings = new Array();
		{
			var _g1 = 0, _g = this.Beat.Measure.Track.StringCount();
			while(_g1 < _g) {
				var i = _g1++;
				this._usedStrings.push(false);
			}
		}
	}
	return this._usedStrings;
}
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.Width = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype._hiddenSilence = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype._silenceHeight = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype._silenceY = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype._usedStrings = null;
net.coderline.jsgs.tablature.model.GsVoiceImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsVoiceImpl;
net.coderline.jsgs.model.GsMixTableItem = function(p) { if( p === $_ ) return; {
	this.Value = 0;
	this.Duration = 0;
	this.AllTracks = false;
}}
net.coderline.jsgs.model.GsMixTableItem.__name__ = ["net","coderline","jsgs","model","GsMixTableItem"];
net.coderline.jsgs.model.GsMixTableItem.prototype.AllTracks = null;
net.coderline.jsgs.model.GsMixTableItem.prototype.Duration = null;
net.coderline.jsgs.model.GsMixTableItem.prototype.Value = null;
net.coderline.jsgs.model.GsMixTableItem.prototype.__class__ = net.coderline.jsgs.model.GsMixTableItem;
net.coderline.jsgs.model.effects.GsTrillEffect = function(factory) { if( factory === $_ ) return; {
	this.Fret = 0;
	this.Duration = factory.NewDuration();
}}
net.coderline.jsgs.model.effects.GsTrillEffect.__name__ = ["net","coderline","jsgs","model","effects","GsTrillEffect"];
net.coderline.jsgs.model.effects.GsTrillEffect.prototype.Clone = function(factory) {
	var effect = factory.NewTrillEffect();
	effect.Fret = this.Fret;
	effect.Duration.Value = this.Duration.Value;
	effect.Duration.IsDotted = this.Duration.IsDotted;
	effect.Duration.IsDoubleDotted = this.Duration.IsDoubleDotted;
	effect.Duration.Triplet.Enters = this.Duration.Triplet.Enters;
	effect.Duration.Triplet.Times = this.Duration.Triplet.Times;
	return effect;
}
net.coderline.jsgs.model.effects.GsTrillEffect.prototype.Duration = null;
net.coderline.jsgs.model.effects.GsTrillEffect.prototype.Fret = null;
net.coderline.jsgs.model.effects.GsTrillEffect.prototype.__class__ = net.coderline.jsgs.model.effects.GsTrillEffect;
net.coderline.jsgs.model.GsTempo = function(p) { if( p === $_ ) return; {
	this.Value = 120;
}}
net.coderline.jsgs.model.GsTempo.__name__ = ["net","coderline","jsgs","model","GsTempo"];
net.coderline.jsgs.model.GsTempo.TempoToUsq = function(tempo) {
	return Math.floor(((60.00 / tempo) * 1000) * 1000.00);
}
net.coderline.jsgs.model.GsTempo.prototype.Copy = function(tempo) {
	tempo.Value = this.Value;
}
net.coderline.jsgs.model.GsTempo.prototype.InUsq = function() {
	return net.coderline.jsgs.model.GsTempo.TempoToUsq(this.Value);
}
net.coderline.jsgs.model.GsTempo.prototype.Value = null;
net.coderline.jsgs.model.GsTempo.prototype.__class__ = net.coderline.jsgs.model.GsTempo;
net.coderline.jsgs.model.GsChord = function(length) { if( length === $_ ) return; {
	this.Strings = new Array();
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			this.Strings.push(-1);
		}
	}
}}
net.coderline.jsgs.model.GsChord.__name__ = ["net","coderline","jsgs","model","GsChord"];
net.coderline.jsgs.model.GsChord.prototype.Beat = null;
net.coderline.jsgs.model.GsChord.prototype.FirstFret = null;
net.coderline.jsgs.model.GsChord.prototype.Name = null;
net.coderline.jsgs.model.GsChord.prototype.NoteCount = function() {
	var count = 0;
	{
		var _g1 = 0, _g = this.Strings.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.Strings[i] >= 0) count++;
		}
	}
	return count;
}
net.coderline.jsgs.model.GsChord.prototype.StringCount = function() {
	return this.Strings.length;
}
net.coderline.jsgs.model.GsChord.prototype.Strings = null;
net.coderline.jsgs.model.GsChord.prototype.__class__ = net.coderline.jsgs.model.GsChord;
net.coderline.jsgs.tablature.model.GsChordImpl = function(length) { if( length === $_ ) return; {
	net.coderline.jsgs.model.GsChord.apply(this,[length]);
}}
net.coderline.jsgs.tablature.model.GsChordImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsChordImpl"];
net.coderline.jsgs.tablature.model.GsChordImpl.__super__ = net.coderline.jsgs.model.GsChord;
for(var k in net.coderline.jsgs.model.GsChord.prototype ) net.coderline.jsgs.tablature.model.GsChordImpl.prototype[k] = net.coderline.jsgs.model.GsChord.prototype[k];
net.coderline.jsgs.tablature.model.GsChordImpl.prototype.BeatImpl = function() {
	return this.Beat;
}
net.coderline.jsgs.tablature.model.GsChordImpl.prototype.GetPaintPosition = function(iIndex) {
	return this.BeatImpl().MeasureImpl().Ts.Get(iIndex);
}
net.coderline.jsgs.tablature.model.GsChordImpl.prototype.Paint = function(layout,context,x,y) {
	if(this.Name != null && this.Name != "") {
		var realX = x + Math.round(4 * layout.Scale);
		var realY = y + this.GetPaintPosition(net.coderline.jsgs.tablature.TrackSpacingPositions.Chord);
		context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents).AddString(this.Name,net.coderline.jsgs.tablature.drawing.DrawingResources.ChordFont,realX,realY);
	}
}
net.coderline.jsgs.tablature.model.GsChordImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsChordImpl;
haxe.io.StringInput = function(s) { if( s === $_ ) return; {
	haxe.io.BytesInput.apply(this,[haxe.io.Bytes.ofString(s)]);
}}
haxe.io.StringInput.__name__ = ["haxe","io","StringInput"];
haxe.io.StringInput.__super__ = haxe.io.BytesInput;
for(var k in haxe.io.BytesInput.prototype ) haxe.io.StringInput.prototype[k] = haxe.io.BytesInput.prototype[k];
haxe.io.StringInput.prototype.__class__ = haxe.io.StringInput;
net.coderline.jsgs.model.SongManager = function(factory) { if( factory === $_ ) return; {
	this.Factory = factory;
}}
net.coderline.jsgs.model.SongManager.__name__ = ["net","coderline","jsgs","model","SongManager"];
net.coderline.jsgs.model.SongManager.GetDivisionLength = function(header) {
	var defaulLenght = 960;
	var denominator = header.TimeSignature.Denominator.Value;
	switch(denominator) {
	case 8:{
		if(header.TimeSignature.Numerator % 3 == 0) defaulLenght += Math.floor(960 / 2);
	}break;
	}
	return defaulLenght;
}
net.coderline.jsgs.model.SongManager.GetNextBeat2 = function(beats,currentBeat) {
	var oNext = null;
	{
		var _g = 0;
		while(_g < beats.length) {
			var checkedBeat = beats[_g];
			++_g;
			if(checkedBeat.Start > currentBeat.Start) {
				if(oNext == null || checkedBeat.Start < oNext.Start) oNext = checkedBeat;
			}
		}
	}
	return oNext;
}
net.coderline.jsgs.model.SongManager.GetNextVoice = function(beats,beat,index) {
	var next = null;
	{
		var _g = 0;
		while(_g < beats.length) {
			var current = beats[_g];
			++_g;
			if(current.Start > beat.Start && !current.Voices[index].IsEmpty) {
				if(next == null || current.Start < next.Beat.Start) next = current.Voices[index];
			}
		}
	}
	return next;
}
net.coderline.jsgs.model.SongManager.GetFirstVoice = function(beats,index) {
	var first = null;
	{
		var _g = 0;
		while(_g < beats.length) {
			var current = beats[_g];
			++_g;
			if((first == null || current.Start < first.Beat.Start) && !current.Voices[index].IsEmpty) first = current.Voices[index];
		}
	}
	return first;
}
net.coderline.jsgs.model.SongManager.GetBeat = function(measure,start) {
	{
		var _g = 0, _g1 = measure.Beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			if(beat.Start == start) return beat;
		}
	}
	return null;
}
net.coderline.jsgs.model.SongManager.QuickSort = function(elements,left,right) {
	var i = left;
	var j = right;
	var pivot = elements[Math.floor((left + right) / 2)];
	do {
		while((elements[i].Start < pivot.Start) && (i < right)) i++;
		while((pivot.Start < elements[j].Start) && (j > left)) j--;
		if(i <= j) {
			var temp = elements[i];
			elements[i] = elements[j];
			elements[j] = temp;
			i++;
			j--;
		}
	} while(i <= j);
	if(left < j) net.coderline.jsgs.model.SongManager.QuickSort(elements,left,j);
	if(i < right) net.coderline.jsgs.model.SongManager.QuickSort(elements,i,right);
}
net.coderline.jsgs.model.SongManager.prototype.AutoCompleteSilences = function(measure) {
	var beat = this.GetFirstBeat(measure.Beats);
	if(beat == null) {
		this.CreateSilences(measure,measure.Start(),measure.Length(),0);
		return;
	}
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			var voice = net.coderline.jsgs.model.SongManager.GetFirstVoice(measure.Beats,v);
			if(voice != null && voice.Beat.Start > measure.Start()) this.CreateSilences(measure,measure.Start(),voice.Beat.Start - measure.Start(),v);
		}
	}
	var start = new Array();
	var uncompletedLength = new Array();
	{
		var _g1 = 0, _g = beat.Voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			start.push(0);
			uncompletedLength.push(0);
		}
	}
	while(beat != null) {
		{
			var _g1 = 0, _g = beat.Voices.length;
			while(_g1 < _g) {
				var v = _g1++;
				var voice = beat.Voices[v];
				if(!voice.IsEmpty) {
					var voiceEnd = beat.Start + voice.Duration.Time();
					var nextPosition = measure.Start() + measure.Length();
					var nextVoice = net.coderline.jsgs.model.SongManager.GetNextVoice(measure.Beats,beat,voice.Index);
					if(nextVoice != null) {
						nextPosition = nextVoice.Beat.Start;
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
					this.CreateSilences(measure,start[v],uncompletedLength[v],v);
				}
				start[v] = 0;
				uncompletedLength[v] = 0;
			}
		}
		beat = net.coderline.jsgs.model.SongManager.GetNextBeat2(measure.Beats,beat);
	}
}
net.coderline.jsgs.model.SongManager.prototype.CreateDurations = function(time) {
	var durations = new Array();
	var min = this.Factory.NewDuration();
	min.Value = 64;
	min.IsDotted = false;
	min.IsDoubleDotted = false;
	min.Triplet.Enters = 3;
	min.Triplet.Times = 2;
	var missing = time;
	while(missing > min.Time()) {
		var oDuration = net.coderline.jsgs.model.GsDuration.FromTime(this.Factory,missing,min,10);
		durations.push(oDuration.Clone(this.Factory));
		missing -= oDuration.Time();
	}
	return durations;
}
net.coderline.jsgs.model.SongManager.prototype.CreateSilences = function(measure,start,length,voiceIndex) {
	var nextStart = start;
	var durations = this.CreateDurations(length);
	{
		var _g = 0;
		while(_g < durations.length) {
			var duration = durations[_g];
			++_g;
			var isNew = false;
			var beatStart = this.GetRealStart(measure,nextStart);
			var beat = net.coderline.jsgs.model.SongManager.GetBeat(measure,beatStart);
			if(beat == null) {
				beat = this.Factory.NewBeat();
				beat.Start = this.GetRealStart(measure,nextStart);
				isNew = true;
			}
			var voice = beat.Voices[voiceIndex];
			voice.IsEmpty = false;
			duration.Copy(voice.Duration);
			if(isNew) measure.AddBeat(beat);
			nextStart += duration.Time();
		}
	}
}
net.coderline.jsgs.model.SongManager.prototype.Factory = null;
net.coderline.jsgs.model.SongManager.prototype.GetFirstBeat = function(list) {
	return (list.length > 0?list[0]:null);
}
net.coderline.jsgs.model.SongManager.prototype.GetNextBeat = function(beat,voice) {
	var nextBeat = net.coderline.jsgs.model.SongManager.GetNextBeat2(beat.Measure.Beats,beat);
	if(nextBeat == null && beat.Measure.Track.MeasureCount() > beat.Measure.Number()) {
		var measure = beat.Measure.Track.Measures[beat.Measure.Number()];
		if(measure.BeatCount() > 0) {
			return measure.Beats[0];
		}
	}
	return nextBeat;
}
net.coderline.jsgs.model.SongManager.prototype.GetNextNote = function(measure,start,voiceIndex,guitarString) {
	var beat = net.coderline.jsgs.model.SongManager.GetBeat(measure,start);
	if(beat != null) {
		var next = net.coderline.jsgs.model.SongManager.GetNextBeat2(measure.Beats,beat);
		while(next != null) {
			var voice = next.Voices[voiceIndex];
			if(!voice.IsEmpty) {
				{
					var _g = 0, _g1 = voice.Notes;
					while(_g < _g1.length) {
						var current = _g1[_g];
						++_g;
						if(current.String == guitarString || guitarString == -1) return current;
					}
				}
			}
			next = net.coderline.jsgs.model.SongManager.GetNextBeat2(measure.Beats,next);
		}
	}
	return null;
}
net.coderline.jsgs.model.SongManager.prototype.GetPreviousMeasure = function(measure) {
	return (measure.Number() > 1?measure.Track.Measures[measure.Number() - 2]:null);
}
net.coderline.jsgs.model.SongManager.prototype.GetPreviousMeasureHeader = function(header) {
	var prevIndex = header.Number - 1;
	if(prevIndex > 0) {
		return header.Song.MeasureHeaders[prevIndex - 1];
	}
	return null;
}
net.coderline.jsgs.model.SongManager.prototype.GetRealStart = function(measure,currentStart) {
	var beatLength = net.coderline.jsgs.model.SongManager.GetDivisionLength(measure.Header);
	var start = currentStart;
	var startBeat = start % beatLength == 0;
	if(!startBeat) {
		var minDuration = this.Factory.NewDuration();
		minDuration.Value = 64;
		minDuration.Triplet.Enters = 3;
		minDuration.Triplet.Times = 2;
		var time = minDuration.Time();
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
net.coderline.jsgs.model.SongManager.prototype.OrderBeats = function(measure) {
	net.coderline.jsgs.model.SongManager.QuickSort(measure.Beats,0,measure.BeatCount() - 1);
}
net.coderline.jsgs.model.SongManager.prototype.__class__ = net.coderline.jsgs.model.SongManager;
net.coderline.jsgs.tablature.drawing.SvgPainter = function(layer,svg,x,y,xScale,yScale) { if( layer === $_ ) return; {
	this.Layer = layer;
	this.Svg = svg;
	this.X = x;
	this.Y = y;
	this.XScale = xScale * 0.98;
	this.YScale = yScale * 0.98;
	this.CurrentPosition = new net.coderline.jsgs.model.PointF(x,y);
	this.Token = svg.split(" ");
	this.CurrentIndex = 0;
}}
net.coderline.jsgs.tablature.drawing.SvgPainter.__name__ = ["net","coderline","jsgs","tablature","drawing","SvgPainter"];
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.CurrentIndex = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.CurrentPosition = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.GetNumber = function() {
	return Std.parseFloat(this.Token[this.CurrentIndex++]);
}
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.GetString = function() {
	return this.Token[this.CurrentIndex++];
}
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.IsNextCommand = function() {
	var command = this.PeekString();
	return command == "m" || command == "M" || command == "c" || command == "C" || command == "q" || command == "Q" || command == "l" || command == "L" || command == "z" || command == "Z";
}
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.Layer = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.Paint = function() {
	this.Layer.StartFigure();
	while(this.CurrentIndex < this.Token.length) {
		this.ParseCommand();
	}
}
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.ParseCommand = function() {
	var command = this.GetString();
	switch(command) {
	case "M":{
		this.CurrentPosition.X = (this.X + this.GetNumber() * this.XScale);
		this.CurrentPosition.Y = (this.Y + this.GetNumber() * this.YScale);
		this.Layer.MoveTo(this.CurrentPosition.X,this.CurrentPosition.Y);
	}break;
	case "m":{
		this.CurrentPosition.X += (this.GetNumber() * this.XScale);
		this.CurrentPosition.Y += (this.GetNumber() * this.YScale);
		this.Layer.MoveTo(this.CurrentPosition.X,this.CurrentPosition.Y);
	}break;
	case "z":{
		null;
	}break;
	case "Z":{
		this.Layer.CloseFigure();
	}break;
	case "L":{
		this.CurrentPosition.X = (this.X + this.GetNumber() * this.XScale);
		this.CurrentPosition.Y = (this.Y + this.GetNumber() * this.YScale);
		this.Layer.LineTo(this.CurrentPosition.X,this.CurrentPosition.Y);
	}break;
	case "l":{
		this.CurrentPosition.X += (this.GetNumber() * this.XScale);
		this.CurrentPosition.Y += (this.GetNumber() * this.YScale);
		this.Layer.LineTo(this.CurrentPosition.X,this.CurrentPosition.Y);
	}break;
	case "C":{
		var isNextNumber = true;
		do {
			var x1 = (this.X + this.GetNumber() * this.XScale);
			var y1 = (this.Y + this.GetNumber() * this.YScale);
			var x2 = (this.X + this.GetNumber() * this.XScale);
			var y2 = (this.Y + this.GetNumber() * this.YScale);
			var x3 = (this.X + this.GetNumber() * this.XScale);
			var y3 = (this.Y + this.GetNumber() * this.YScale);
			this.CurrentPosition.X = (x3);
			this.CurrentPosition.Y = (y3);
			this.Layer.BezierTo(x1,y1,x2,y2,x3,y3);
			isNextNumber = !this.IsNextCommand();
		} while(isNextNumber);
	}break;
	case "c":{
		var isNextNumber = true;
		do {
			var x1 = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
			var y1 = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
			var x2 = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
			var y2 = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
			var x3 = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
			var y3 = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
			this.CurrentPosition.X = x3;
			this.CurrentPosition.Y = y3;
			this.Layer.BezierTo(x1,y1,x2,y2,x3,y3);
			isNextNumber = !this.IsNextCommand();
		} while(isNextNumber && this.CurrentIndex < this.Token.length);
	}break;
	case "Q":{
		var isNextNumber = true;
		do {
			var x1 = (this.X + this.GetNumber() * this.XScale);
			var y1 = (this.Y + this.GetNumber() * this.YScale);
			var x2 = (this.X + this.GetNumber() * this.XScale);
			var y2 = (this.Y + this.GetNumber() * this.YScale);
			this.CurrentPosition.X = x2;
			this.CurrentPosition.Y = y2;
			this.Layer.QuadraticCurveTo(x1,y1,x2,y2);
			isNextNumber = !this.IsNextCommand();
		} while(isNextNumber);
	}break;
	case "q":{
		var isNextNumber = true;
		do {
			var x1 = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
			var y1 = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
			var x2 = (this.CurrentPosition.X + this.GetNumber() * this.XScale);
			var y2 = (this.CurrentPosition.Y + this.GetNumber() * this.YScale);
			this.CurrentPosition.X = x2;
			this.CurrentPosition.Y = y2;
			this.Layer.QuadraticCurveTo(x1,y1,x2,y2);
			isNextNumber = !this.IsNextCommand();
		} while(isNextNumber && this.CurrentIndex < this.Token.length);
	}break;
	}
}
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.PeekNumber = function() {
	return Std.parseFloat(this.Token[this.CurrentIndex]);
}
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.PeekString = function() {
	return this.Token[this.CurrentIndex];
}
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.Svg = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.Token = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.X = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.XScale = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.Y = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.YScale = null;
net.coderline.jsgs.tablature.drawing.SvgPainter.prototype.__class__ = net.coderline.jsgs.tablature.drawing.SvgPainter;
net.coderline.jsgs.model.effects.GsBendTypes = { __ename__ : ["net","coderline","jsgs","model","effects","GsBendTypes"], __constructs__ : ["None","Bend","BendRelease","BendReleaseBend","Prebend","PrebendRelease","Dip","Dive","ReleaseUp","InvertedDip","Return","ReleaseDown"] }
net.coderline.jsgs.model.effects.GsBendTypes.Bend = ["Bend",1];
net.coderline.jsgs.model.effects.GsBendTypes.Bend.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.Bend.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.BendRelease = ["BendRelease",2];
net.coderline.jsgs.model.effects.GsBendTypes.BendRelease.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.BendRelease.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.BendReleaseBend = ["BendReleaseBend",3];
net.coderline.jsgs.model.effects.GsBendTypes.BendReleaseBend.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.BendReleaseBend.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.Dip = ["Dip",6];
net.coderline.jsgs.model.effects.GsBendTypes.Dip.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.Dip.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.Dive = ["Dive",7];
net.coderline.jsgs.model.effects.GsBendTypes.Dive.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.Dive.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.InvertedDip = ["InvertedDip",9];
net.coderline.jsgs.model.effects.GsBendTypes.InvertedDip.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.InvertedDip.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.None = ["None",0];
net.coderline.jsgs.model.effects.GsBendTypes.None.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.None.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.Prebend = ["Prebend",4];
net.coderline.jsgs.model.effects.GsBendTypes.Prebend.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.Prebend.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.PrebendRelease = ["PrebendRelease",5];
net.coderline.jsgs.model.effects.GsBendTypes.PrebendRelease.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.PrebendRelease.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.ReleaseDown = ["ReleaseDown",11];
net.coderline.jsgs.model.effects.GsBendTypes.ReleaseDown.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.ReleaseDown.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.ReleaseUp = ["ReleaseUp",8];
net.coderline.jsgs.model.effects.GsBendTypes.ReleaseUp.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.ReleaseUp.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.model.effects.GsBendTypes.Return = ["Return",10];
net.coderline.jsgs.model.effects.GsBendTypes.Return.toString = $estr;
net.coderline.jsgs.model.effects.GsBendTypes.Return.__enum__ = net.coderline.jsgs.model.effects.GsBendTypes;
net.coderline.jsgs.tablature.drawing.NotePainter = function() { }
net.coderline.jsgs.tablature.drawing.NotePainter.__name__ = ["net","coderline","jsgs","tablature","drawing","NotePainter"];
net.coderline.jsgs.tablature.drawing.NotePainter.PaintFooter = function(layer,x,y,dur,dir,layout) {
	var scale = layout.Scale;
	if(dir == -1) {
		x += net.coderline.jsgs.tablature.drawing.DrawingResources.GetScoreNoteSize(layout,false).Width;
	}
	var s = "";
	switch(dur) {
	case 64:{
		s = ((dir == -1)?net.coderline.jsgs.tablature.drawing.MusicFont.FooterUpSixtyFourth:net.coderline.jsgs.tablature.drawing.MusicFont.FooterDownSixtyFourth);
	}break;
	case 32:{
		s = ((dir == -1)?net.coderline.jsgs.tablature.drawing.MusicFont.FooterUpThirtySecond:net.coderline.jsgs.tablature.drawing.MusicFont.FooterDownThirtySecond);
	}break;
	case 16:{
		s = ((dir == -1)?net.coderline.jsgs.tablature.drawing.MusicFont.FooterUpSixteenth:net.coderline.jsgs.tablature.drawing.MusicFont.FooterDownSixteenth);
	}break;
	case 8:{
		s = ((dir == -1)?net.coderline.jsgs.tablature.drawing.MusicFont.FooterUpEighth:net.coderline.jsgs.tablature.drawing.MusicFont.FooterDownEighth);
	}break;
	}
	if(s != "") layer.AddMusicSymbol(s,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.NotePainter.PaintBar = function(layer,x1,y1,x2,y2,count,dir,scale) {
	var width = Math.max(1.0,Math.round(3.0 * scale));
	{
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			var realY1 = Math.floor(y1 - ((i * (5.0 * scale)) * dir));
			var realY2 = Math.floor(y2 - ((i * (5.0 * scale)) * dir));
			layer.StartFigure();
			layer.AddPolygon([new net.coderline.jsgs.model.Point(x1,realY1),new net.coderline.jsgs.model.Point(x2,realY2),new net.coderline.jsgs.model.Point(x2,Math.round(realY2 + width)),new net.coderline.jsgs.model.Point(x1,Math.round(realY1 + width)),new net.coderline.jsgs.model.Point(x1,realY1)]);
			layer.CloseFigure();
		}
	}
}
net.coderline.jsgs.tablature.drawing.NotePainter.PaintHarmonic = function(layer,x,y,scale) {
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.Harmonic,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.NotePainter.PaintNote = function(layer,x,y,scale,full,font) {
	var symbol = (full?net.coderline.jsgs.tablature.drawing.MusicFont.NoteQuarter:net.coderline.jsgs.tablature.drawing.MusicFont.NoteHalf);
	layer.AddMusicSymbol(symbol,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.NotePainter.PaintDeadNote = function(layer,x,y,scale,font) {
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.DeadNote,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.NotePainter.prototype.__class__ = net.coderline.jsgs.tablature.drawing.NotePainter;
net.coderline.jsgs.model.GsMixTableChange = function(p) { if( p === $_ ) return; {
	this.Volume = new net.coderline.jsgs.model.GsMixTableItem();
	this.Balance = new net.coderline.jsgs.model.GsMixTableItem();
	this.Chorus = new net.coderline.jsgs.model.GsMixTableItem();
	this.Reverb = new net.coderline.jsgs.model.GsMixTableItem();
	this.Phaser = new net.coderline.jsgs.model.GsMixTableItem();
	this.Tremolo = new net.coderline.jsgs.model.GsMixTableItem();
	this.Instrument = new net.coderline.jsgs.model.GsMixTableItem();
	this.Tempo = new net.coderline.jsgs.model.GsMixTableItem();
	this.HideTempo = true;
}}
net.coderline.jsgs.model.GsMixTableChange.__name__ = ["net","coderline","jsgs","model","GsMixTableChange"];
net.coderline.jsgs.model.GsMixTableChange.prototype.Balance = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.Chorus = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.HideTempo = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.Instrument = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.Phaser = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.Reverb = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.Tempo = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.TempoName = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.Tremolo = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.Volume = null;
net.coderline.jsgs.model.GsMixTableChange.prototype.__class__ = net.coderline.jsgs.model.GsMixTableChange;
net.coderline.jsgs.model.GsBeatStrokeDirection = { __ename__ : ["net","coderline","jsgs","model","GsBeatStrokeDirection"], __constructs__ : ["None","Up","Down"] }
net.coderline.jsgs.model.GsBeatStrokeDirection.Down = ["Down",2];
net.coderline.jsgs.model.GsBeatStrokeDirection.Down.toString = $estr;
net.coderline.jsgs.model.GsBeatStrokeDirection.Down.__enum__ = net.coderline.jsgs.model.GsBeatStrokeDirection;
net.coderline.jsgs.model.GsBeatStrokeDirection.None = ["None",0];
net.coderline.jsgs.model.GsBeatStrokeDirection.None.toString = $estr;
net.coderline.jsgs.model.GsBeatStrokeDirection.None.__enum__ = net.coderline.jsgs.model.GsBeatStrokeDirection;
net.coderline.jsgs.model.GsBeatStrokeDirection.Up = ["Up",1];
net.coderline.jsgs.model.GsBeatStrokeDirection.Up.toString = $estr;
net.coderline.jsgs.model.GsBeatStrokeDirection.Up.__enum__ = net.coderline.jsgs.model.GsBeatStrokeDirection;
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
net.coderline.jsgs.file.guitarpro.Gp5Reader = function(p) { if( p === $_ ) return; {
	net.coderline.jsgs.file.guitarpro.GpReaderBase.apply(this,[["FICHIER GUITAR PRO v5.00","FICHIER GUITAR PRO v5.10"]]);
}}
net.coderline.jsgs.file.guitarpro.Gp5Reader.__name__ = ["net","coderline","jsgs","file","guitarpro","Gp5Reader"];
net.coderline.jsgs.file.guitarpro.Gp5Reader.__super__ = net.coderline.jsgs.file.guitarpro.GpReaderBase;
for(var k in net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype ) net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype[k] = net.coderline.jsgs.file.guitarpro.GpReaderBase.prototype[k];
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.GetBeat = function(measure,start) {
	{
		var _g1 = 0, _g = measure.Beats.length;
		while(_g1 < _g) {
			var b = _g1++;
			var beat = measure.Beats[b];
			if(beat.Start == start) return beat;
		}
	}
	var newBeat = this.Factory.NewBeat();
	newBeat.Start = start;
	measure.AddBeat(newBeat);
	return newBeat;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.GetTiedNoteValue = function(stringIndex,track) {
	var iMeasureCount = track.MeasureCount();
	if(iMeasureCount > 0) {
		{
			var _g = 0;
			while(_g < iMeasureCount) {
				var m2 = _g++;
				var m = (iMeasureCount - 1) - m2;
				var measure = track.Measures[m];
				{
					var _g2 = 0, _g1 = measure.BeatCount();
					while(_g2 < _g1) {
						var b2 = _g2++;
						var b = (measure.BeatCount() - 1) - b2;
						var beat = measure.Beats[b];
						{
							var _g4 = 0, _g3 = beat.Voices.length;
							while(_g4 < _g3) {
								var v = _g4++;
								var oVoice = beat.Voices[v];
								if(!oVoice.IsEmpty) {
									{
										var _g6 = 0, _g5 = oVoice.Notes.length;
										while(_g6 < _g5) {
											var n = _g6++;
											var note = oVoice.Notes[n];
											if(note.String == stringIndex) {
												return note.Value;
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
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadArtificialHarmonic = function(noteEffect) {
	var type = this.ReadByte();
	var oHarmonic = this.Factory.NewHarmonicEffect();
	oHarmonic.Data = 0;
	switch(type) {
	case 1:{
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Natural);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 2:{
		this.Skip(3);
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Artificial);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 3:{
		this.Skip(1);
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Tapped);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 4:{
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Pinch);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 5:{
		oHarmonic.Type = (net.coderline.jsgs.model.effects.GsHarmonicType.Semi);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadBeat = function(start,measure,track,voiceIndex) {
	var flags = this.ReadUnsignedByte();
	var beat = this.GetBeat(measure,start);
	var voice = beat.Voices[voiceIndex];
	if((flags & 64) != 0) {
		var beatType = this.ReadUnsignedByte();
		voice.IsEmpty = ((beatType & 2) == 0);
	}
	var duration = this.ReadDuration(flags);
	var effect = new net.coderline.jsgs.model.GsNoteEffect();
	if((flags & 2) != 0) {
		this.ReadChord(track.StringCount(),beat);
	}
	if((flags & 4) != 0) {
		this.ReadText(beat);
	}
	if((flags & 8) != 0) {
		this.ReadBeatEffects(beat,effect);
	}
	if((flags & 16) != 0) {
		var mixTableChange = this.ReadMixTableChange();
		beat.MixTableChange = mixTableChange;
	}
	var stringFlags = this.ReadUnsignedByte();
	{
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & (1 << i)) != 0 && (6 - i) < track.StringCount()) {
				var guitarString = track.Strings[6 - i].Clone(this.Factory);
				var note = this.ReadNote(guitarString,track,effect.Clone(this.Factory));
				voice.AddNote(note);
			}
			duration.Copy(voice.Duration);
		}
	}
	this.Skip(1);
	var read = this.ReadByte();
	if(read == 8 || read == 10) {
		this.Skip(1);
	}
	return ((!voice.IsEmpty)?duration.Time():0);
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadBeatEffects = function(beat,effect) {
	var flags1 = this.ReadUnsignedByte();
	var flags2 = this.ReadUnsignedByte();
	effect.FadeIn = (((flags1 & 16) != 0));
	effect.Vibrato = (((flags1 & 2) != 0));
	if((flags1 & 32) != 0) {
		var slapEffect = this.ReadUnsignedByte();
		effect.Tapping = (slapEffect == 1);
		effect.Slapping = (slapEffect == 2);
		effect.Popping = (slapEffect == 3);
	}
	if((flags2 & 4) != 0) {
		this.ReadTremoloBar(effect);
	}
	if((flags1 & 64) != 0) {
		var strokeUp = this.ReadByte();
		var strokeDown = this.ReadByte();
		if(strokeUp > 0) {
			beat.Stroke.Direction = net.coderline.jsgs.model.GsBeatStrokeDirection.Up;
			beat.Stroke.Value = (this.ToStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.Stroke.Direction = net.coderline.jsgs.model.GsBeatStrokeDirection.Down;
			beat.Stroke.Value = (this.ToStrokeValue(strokeDown));
		}
	}
	beat.HasRasgueado = (flags2 & 1) != 0;
	if((flags2 & 2) != 0) {
		beat.PickStroke = this.ReadByte();
		beat.HasPickStroke = true;
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadBend = function(noteEffect) {
	var bendEffect = this.Factory.NewBendEffect();
	bendEffect.Type = net.coderline.jsgs.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	bendEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / 25);
			var vibrato = this.ReadBool();
			bendEffect.Points.push(new net.coderline.jsgs.model.effects.GsBendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) noteEffect.Bend = bendEffect;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadChannel = function(midiChannel,channels) {
	var index = (this.ReadInt() - 1);
	var effectChannel = (this.ReadInt() - 1);
	if(index >= 0 && index < channels.length) {
		channels[index].Copy(midiChannel);
		if(midiChannel.Instrument() < 0) {
			midiChannel.Instrument(0);
		}
		if(!midiChannel.IsPercussionChannel()) {
			midiChannel.EffectChannel = (effectChannel);
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadChord = function(stringCount,beat) {
	var chord = this.Factory.NewChord(stringCount);
	this.Skip(17);
	chord.Name = (this.ReadByteSizeString(21));
	this.Skip(4);
	chord.FirstFret = this.ReadInt();
	{
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var fret = this.ReadInt();
			if(i < chord.Strings.length) {
				chord.Strings[i] = fret;
			}
		}
	}
	this.Skip(32);
	if(chord.NoteCount() > 0) {
		beat.Chord = (chord);
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadColor = function() {
	var r = (this.ReadUnsignedByte());
	var g = this.ReadUnsignedByte();
	var b = (this.ReadUnsignedByte());
	this.Skip(1);
	return new net.coderline.jsgs.model.GsColor(r,g,b);
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadDuration = function(flags) {
	var duration = this.Factory.NewDuration();
	duration.Value = Math.round(Math.pow(2,(this.ReadByte() + 4)) / 4);
	duration.IsDotted = (((flags & 1) != 0));
	if((flags & 32) != 0) {
		var iTuplet = this.ReadInt();
		switch(iTuplet) {
		case 3:{
			duration.Triplet.Enters = 3;
			duration.Triplet.Times = 2;
		}break;
		case 5:{
			duration.Triplet.Enters = 5;
			duration.Triplet.Times = 4;
		}break;
		case 6:{
			duration.Triplet.Enters = 6;
			duration.Triplet.Times = 4;
		}break;
		case 7:{
			duration.Triplet.Enters = 7;
			duration.Triplet.Times = 4;
		}break;
		case 9:{
			duration.Triplet.Enters = 9;
			duration.Triplet.Times = 8;
		}break;
		case 10:{
			duration.Triplet.Enters = 10;
			duration.Triplet.Times = 8;
		}break;
		case 11:{
			duration.Triplet.Enters = 11;
			duration.Triplet.Times = 8;
		}break;
		case 12:{
			duration.Triplet.Enters = 12;
			duration.Triplet.Times = 8;
		}break;
		}
	}
	return duration;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadGrace = function(noteEffect) {
	var fret = this.ReadUnsignedByte();
	var dyn = this.ReadUnsignedByte();
	var transition = this.ReadByte();
	var duration = this.ReadUnsignedByte();
	var flags = this.ReadUnsignedByte();
	var grace = this.Factory.NewGraceEffect();
	grace.Fret = (fret);
	grace.Dynamic = ((15 + (16 * dyn)) - 16);
	grace.Duration = (duration);
	grace.IsDead = ((flags & 1) != 0);
	grace.IsOnBeat = ((flags & 2) != 0);
	switch(transition) {
	case 0:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.None;
	}break;
	case 1:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Slide;
	}break;
	case 2:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Bend;
	}break;
	case 3:{
		grace.Transition = net.coderline.jsgs.model.effects.GsGraceEffectTransition.Hammer;
	}break;
	}
	noteEffect.Grace = (grace);
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadInfo = function(song) {
	song.Title = (this.ReadIntSizeCheckByteString());
	song.Subtitle = this.ReadIntSizeCheckByteString();
	song.Artist = (this.ReadIntSizeCheckByteString());
	song.Album = (this.ReadIntSizeCheckByteString());
	song.Words = (this.ReadIntSizeCheckByteString());
	song.Music = this.ReadIntSizeCheckByteString();
	song.Copyright = this.ReadIntSizeCheckByteString();
	song.Tab = this.ReadIntSizeCheckByteString();
	song.Instructions = this.ReadIntSizeCheckByteString();
	var iNotes = this.ReadInt();
	song.Notice = "";
	{
		var _g = 0;
		while(_g < iNotes) {
			var i = _g++;
			song.Notice += this.ReadIntSizeCheckByteString() + "\n";
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadLyrics = function(song) {
	song.Lyrics = this.Factory.NewLyrics();
	song.Lyrics.TrackChoice = this.ReadInt();
	{
		var _g = 0;
		while(_g < 5) {
			var i = _g++;
			var line = this.Factory.NewLyricLine();
			line.StartingMeasure = this.ReadInt();
			line.Lyrics = this.ReadIntSizeString();
			song.Lyrics.Lines.push(line);
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadMarker = function(header) {
	var marker = this.Factory.NewMarker();
	marker.MeasureHeader = header;
	marker.Title = this.ReadIntSizeCheckByteString();
	marker.Color = this.ReadColor();
	return marker;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadMeasure = function(measure,track) {
	{
		var _g = 0;
		while(_g < 2) {
			var voice = _g++;
			var start = measure.Start();
			var beats = this.ReadInt();
			{
				var _g1 = 0;
				while(_g1 < beats) {
					var beat = _g1++;
					start += this.ReadBeat(start,measure,track,voice);
				}
			}
		}
	}
	this.Skip(1);
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadMeasureHeader = function(i,timeSignature) {
	if(i > 0) this.Skip(1);
	var flags = this.ReadUnsignedByte();
	var header = this.Factory.NewMeasureHeader();
	header.Number = i + 1;
	header.Start = 0;
	header.Tempo.Value = 120;
	if((flags & 1) != 0) timeSignature.Numerator = this.ReadByte();
	if((flags & 2) != 0) timeSignature.Denominator.Value = this.ReadByte();
	header.IsRepeatOpen = ((flags & 4) != 0);
	timeSignature.Copy(header.TimeSignature);
	if((flags & 8) != 0) header.RepeatClose = (this.ReadByte() - 1);
	if((flags & 32) != 0) header.Marker = this.ReadMarker(header);
	if((flags & 16) != 0) header.RepeatAlternative = this.ReadUnsignedByte();
	if((flags & 64) != 0) {
		header.KeySignature = this.ToKeySignature(this.ReadByte());
		header.KeySignatureType = this.ReadByte();
	}
	header.HasDoubleBar = (flags & 128) != 0;
	if((flags & 1) != 0) this.Skip(4);
	if((flags & 16) == 0) this.Skip(1);
	var tripletFeel = this.ReadByte();
	switch(tripletFeel) {
	case 1:{
		header.TripletFeel = net.coderline.jsgs.model.GsTripletFeel.Eighth;
	}break;
	case 2:{
		header.TripletFeel = net.coderline.jsgs.model.GsTripletFeel.Sixteenth;
	}break;
	default:{
		header.TripletFeel = net.coderline.jsgs.model.GsTripletFeel.None;
	}break;
	}
	return header;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadMeasureHeaders = function(song,measureCount) {
	var timeSignature = this.Factory.NewTimeSignature();
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.AddMeasureHeader(this.ReadMeasureHeader(i,timeSignature));
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadMeasures = function(song) {
	var tempo = this.Factory.NewTempo();
	tempo.Value = song.Tempo;
	var start = 960;
	{
		var _g1 = 0, _g = song.MeasureHeaders.length;
		while(_g1 < _g) {
			var h = _g1++;
			var header = song.MeasureHeaders[h];
			header.Start = start;
			{
				var _g3 = 0, _g2 = song.Tracks.length;
				while(_g3 < _g2) {
					var t = _g3++;
					var track = song.Tracks[t];
					var measure = this.Factory.NewMeasure(header);
					track.AddMeasure(measure);
					this.ReadMeasure(measure,track);
				}
			}
			tempo.Copy(header.Tempo);
			start += header.Length();
		}
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadMidiChannels = function() {
	var channels = new Array();
	{
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.Factory.NewMidiChannel();
			newChannel.Channel = (i);
			newChannel.EffectChannel = (i);
			newChannel.Instrument(this.ReadInt());
			newChannel.Volume = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Balance = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Chorus = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Reverb = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Phaser = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Tremolo = (net.coderline.jsgs.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			channels.push(newChannel);
			this.Skip(2);
		}
	}
	return channels;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadMixTableChange = function() {
	var tableChange = this.Factory.NewMixTableChange();
	tableChange.Instrument.Value = this.ReadByte();
	this.Skip(16);
	tableChange.Volume.Value = this.ReadByte();
	tableChange.Balance.Value = this.ReadByte();
	tableChange.Chorus.Value = this.ReadByte();
	tableChange.Reverb.Value = this.ReadByte();
	tableChange.Phaser.Value = this.ReadByte();
	tableChange.Tremolo.Value = this.ReadByte();
	tableChange.TempoName = this.ReadIntSizeCheckByteString();
	tableChange.Tempo.Value = this.ReadInt();
	if(tableChange.Instrument.Value < 0) tableChange.Instrument = null;
	if(tableChange.Volume.Value >= 0) tableChange.Volume.Duration = this.ReadByte();
	else tableChange.Volume = null;
	if(tableChange.Balance.Value >= 0) tableChange.Balance.Duration = this.ReadByte();
	else tableChange.Balance = null;
	if(tableChange.Chorus.Value >= 0) tableChange.Chorus.Duration = this.ReadByte();
	else tableChange.Chorus = null;
	if(tableChange.Reverb.Value >= 0) tableChange.Reverb.Duration = this.ReadByte();
	else tableChange.Reverb = null;
	if(tableChange.Phaser.Value >= 0) tableChange.Phaser.Duration = this.ReadByte();
	else tableChange.Phaser = null;
	if(tableChange.Tremolo.Value >= 0) tableChange.Tremolo.Duration = this.ReadByte();
	else tableChange.Tremolo = null;
	if(tableChange.Tempo.Value >= 0) {
		tableChange.Tempo.Duration = this.ReadByte();
		tableChange.HideTempo = this.VersionIndex > 0 && this.ReadBool();
	}
	else tableChange.Tempo = null;
	var allTracksFlags = this.ReadUnsignedByte();
	if(tableChange.Volume != null) tableChange.Volume.AllTracks = (allTracksFlags & 1) != 0;
	if(tableChange.Balance != null) tableChange.Balance.AllTracks = (allTracksFlags & 2) != 0;
	if(tableChange.Chorus != null) tableChange.Chorus.AllTracks = (allTracksFlags & 4) != 0;
	if(tableChange.Reverb != null) tableChange.Reverb.AllTracks = (allTracksFlags & 8) != 0;
	if(tableChange.Phaser != null) tableChange.Phaser.AllTracks = (allTracksFlags & 16) != 0;
	if(tableChange.Tremolo != null) tableChange.Tremolo.AllTracks = (allTracksFlags & 32) != 0;
	if(tableChange.Tempo != null) tableChange.Tempo.AllTracks = true;
	this.Skip(1);
	if(this.VersionIndex > 0) {
		this.ReadIntSizeCheckByteString();
		this.ReadIntSizeCheckByteString();
	}
	return tableChange;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadNote = function(guitarString,track,effect) {
	var flags = this.ReadUnsignedByte();
	var note = this.Factory.NewNote();
	note.String = (guitarString.Number);
	note.Effect = (effect);
	note.Effect.AccentuatedNote = (((flags & 64) != 0));
	note.Effect.HeavyAccentuatedNote = (((flags & 2) != 0));
	note.Effect.GhostNote = (((flags & 4) != 0));
	if((flags & 32) != 0) {
		var noteType = this.ReadUnsignedByte();
		note.IsTiedNote = ((noteType == 2));
		note.Effect.DeadNote = ((noteType == 3));
	}
	if((flags & 16) != 0) {
		note.Velocity = ((15 + (16 * this.ReadByte())) - 16);
	}
	if((flags & 32) != 0) {
		var fret = this.ReadByte();
		var value = ((note.IsTiedNote?this.GetTiedNoteValue(guitarString.Number,track):fret));
		note.Value = ((value >= 0 && value < 100?value:0));
	}
	if((flags & 128) != 0) {
		note.LeftHandFinger = this.ReadByte();
		note.RightHandFinger = this.ReadByte();
		note.IsFingering = true;
	}
	if((flags & 1) != 0) {
		note.DurationPercent = this.ReadDouble();
	}
	this.Skip(1);
	if((flags & 8) != 0) {
		this.ReadNoteEffects(note.Effect);
	}
	return note;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadNoteEffects = function(noteEffect) {
	var flags1 = this.ReadUnsignedByte();
	var flags2 = this.ReadUnsignedByte();
	if((flags1 & 1) != 0) {
		this.ReadBend(noteEffect);
	}
	if((flags1 & 16) != 0) {
		this.ReadGrace(noteEffect);
	}
	if((flags2 & 4) != 0) {
		this.ReadTremoloPicking(noteEffect);
	}
	if((flags2 & 8) != 0) {
		noteEffect.Slide = true;
		var type = this.ReadByte();
		switch(type) {
		case 1:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.FastSlideTo;
		}break;
		case 2:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.SlowSlideTo;
		}break;
		case 4:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.OutDownWards;
		}break;
		case 8:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.OutUpWards;
		}break;
		case 16:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.IntoFromBelow;
		}break;
		case 32:{
			noteEffect.SlideType = net.coderline.jsgs.model.GsSlideType.IntoFromAbove;
		}break;
		}
	}
	if((flags2 & 16) != 0) {
		this.ReadArtificialHarmonic(noteEffect);
	}
	if((flags2 & 32) != 0) {
		this.ReadTrill(noteEffect);
	}
	noteEffect.LetRing = (flags1 & 8) != 0;
	noteEffect.Hammer = (((flags1 & 2) != 0));
	noteEffect.Vibrato = (((flags2 & 64) != 0) || noteEffect.Vibrato);
	noteEffect.PalmMute = (((flags2 & 2) != 0));
	noteEffect.Staccato = (((flags2 & 1) != 0));
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadPageSetup = function(song) {
	var setup = this.Factory.NewPageSetup();
	if(this.VersionIndex > 0) this.Skip(19);
	setup.PageSize = new net.coderline.jsgs.model.Point(this.ReadInt(),this.ReadInt());
	var l = this.ReadInt();
	var r = this.ReadInt();
	var t = this.ReadInt();
	var b = this.ReadInt();
	setup.PageMargin = new net.coderline.jsgs.model.Rectangle(l,t,r,b);
	setup.ScoreSizeProportion = this.ReadInt() / 100.0;
	setup.HeaderAndFooter = this.ReadByte();
	var flags2 = this.ReadUnsignedByte();
	if((flags2 & 1) != 0) setup.HeaderAndFooter |= 256;
	setup.Title = this.ReadIntSizeCheckByteString();
	setup.Subtitle = this.ReadIntSizeCheckByteString();
	setup.Artist = this.ReadIntSizeCheckByteString();
	setup.Album = this.ReadIntSizeCheckByteString();
	setup.Words = this.ReadIntSizeCheckByteString();
	setup.Music = this.ReadIntSizeCheckByteString();
	setup.WordsAndMusic = this.ReadIntSizeCheckByteString();
	setup.Copyright = (this.ReadIntSizeCheckByteString() + "\n") + this.ReadIntSizeCheckByteString();
	setup.PageNumber = this.ReadIntSizeCheckByteString();
	song.PageSetup = setup;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadSong = function() {
	if(!this.ReadVersion()) {
		throw new net.coderline.jsgs.file.FileFormatException("Unsupported Version");
	}
	var song = this.Factory.NewSong();
	this.ReadInfo(song);
	this.ReadLyrics(song);
	this.ReadPageSetup(song);
	song.TempoName = this.ReadIntSizeCheckByteString();
	song.Tempo = this.ReadInt();
	if(this.VersionIndex > 0) song.HideTempo = this.ReadBool();
	song.Key = this.ReadByte();
	song.Octave = this.ReadInt();
	var channels = this.ReadMidiChannels();
	this.Skip(42);
	var measureCount = this.ReadInt();
	var trackCount = this.ReadInt();
	this.ReadMeasureHeaders(song,measureCount);
	this.ReadTracks(song,trackCount,channels);
	this.ReadMeasures(song);
	return song;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadText = function(beat) {
	var text = this.Factory.NewText();
	text.Value = this.ReadIntSizeCheckByteString();
	beat.SetText(text);
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadTrack = function(number,channels) {
	var flags = this.ReadUnsignedByte();
	if(number == 1 || this.VersionIndex == 0) this.Skip(1);
	var track = this.Factory.NewTrack();
	track.IsPercussionTrack = (flags & 1) != 0;
	track.Is12StringedGuitarTrack = (flags & 2) != 0;
	track.IsBanjoTrack = (flags & 4) != 0;
	track.Number = number;
	track.Name = this.ReadByteSizeString(40);
	var stringCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var iTuning = this.ReadInt();
			if(stringCount > i) {
				var oString = this.Factory.NewString();
				oString.Number = (i + 1);
				oString.Value = (iTuning);
				track.Strings.push(oString);
			}
		}
	}
	track.Port = this.ReadInt();
	this.ReadChannel(track.Channel,channels);
	track.FretCount = this.ReadInt();
	track.Offset = this.ReadInt();
	track.Color = this.ReadColor();
	this.Skip(((this.VersionIndex > 0)?49:44));
	if(this.VersionIndex > 0) {
		this.ReadIntSizeCheckByteString();
		this.ReadIntSizeCheckByteString();
	}
	return track;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadTracks = function(song,trackCount,channels) {
	{
		var _g1 = 1, _g = trackCount + 1;
		while(_g1 < _g) {
			var i = _g1++;
			song.AddTrack(this.ReadTrack(i,channels));
		}
	}
	this.Skip(((this.VersionIndex == 0?2:1)));
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadTremoloBar = function(effect) {
	var barEffect = this.Factory.NewTremoloBarEffect();
	barEffect.Type = net.coderline.jsgs.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	barEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / (25 * 2.0));
			var vibrato = this.ReadBool();
			barEffect.Points.push(new net.coderline.jsgs.model.effects.GsTremoloBarPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) effect.TremoloBar = barEffect;
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadTremoloPicking = function(noteEffect) {
	var value = this.ReadUnsignedByte();
	var tp = this.Factory.NewTremoloPickingEffect();
	switch(value) {
	case 1:{
		tp.Duration.Value = 8;
		noteEffect.TremoloPicking = (tp);
	}break;
	case 2:{
		tp.Duration.Value = 16;
		noteEffect.TremoloPicking = (tp);
	}break;
	case 3:{
		tp.Duration.Value = 32;
		noteEffect.TremoloPicking = (tp);
	}break;
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ReadTrill = function(noteEffect) {
	var fret = this.ReadByte();
	var period = this.ReadByte();
	var trill = this.Factory.NewTrillEffect();
	trill.Fret = (fret);
	switch(period) {
	case 1:{
		trill.Duration.Value = 16;
		noteEffect.Trill = (trill);
	}break;
	case 2:{
		trill.Duration.Value = 32;
		noteEffect.Trill = (trill);
	}break;
	case 3:{
		trill.Duration.Value = 64;
		noteEffect.Trill = (trill);
	}break;
	}
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ToKeySignature = function(p) {
	return (p < 0?7 + Math.round(Math.abs(p)):p);
}
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.ToStrokeValue = function(value) {
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
net.coderline.jsgs.file.guitarpro.Gp5Reader.prototype.__class__ = net.coderline.jsgs.file.guitarpro.Gp5Reader;
net.coderline.jsgs.tablature.drawing.DrawingLayersConverter = function() { }
net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.__name__ = ["net","coderline","jsgs","tablature","drawing","DrawingLayersConverter"];
net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt = function(layer) {
	switch(layer) {
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.Background:{
		return 0;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground:{
		return 1;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines:{
		return 2;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents:{
		return 3;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw:{
		return 4;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2:{
		return 5;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2:{
		return 6;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2:{
		return 7;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw2:{
		return 8;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1:{
		return 9;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1:{
		return 10;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1:{
		return 11;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw1:{
		return 12;
	}break;
	case net.coderline.jsgs.tablature.drawing.DrawingLayers.Red:{
		return 13;
	}break;
	default:{
		return 0;
	}break;
	}
}
net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.prototype.__class__ = net.coderline.jsgs.tablature.drawing.DrawingLayersConverter;
net.coderline.jsgs.tablature.model.GsMeasureImpl = function(header) { if( header === $_ ) return; {
	net.coderline.jsgs.model.GsMeasure.apply(this,[header]);
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
net.coderline.jsgs.tablature.model.GsMeasureImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsMeasureImpl"];
net.coderline.jsgs.tablature.model.GsMeasureImpl.__super__ = net.coderline.jsgs.model.GsMeasure;
for(var k in net.coderline.jsgs.model.GsMeasure.prototype ) net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype[k] = net.coderline.jsgs.model.GsMeasure.prototype[k];
net.coderline.jsgs.tablature.model.GsMeasureImpl.MakeVoice = function(layout,voice,previousVoice,group) {
	voice.Width = layout.GetVoiceWidth(voice);
	voice.BeatGroup = (group);
	if(previousVoice != null) {
		voice.PreviousBeat = (previousVoice);
		previousVoice.NextBeat = (voice);
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.GetStartPosition = function(measure,start,spacing) {
	var newStart = start - measure.Start();
	var displayPosition = 0.0;
	if(newStart > 0) {
		var position = (newStart / 960);
		displayPosition = (position * spacing);
	}
	return displayPosition;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.AutoCompleteSilences = function(manager) {
	manager.AutoCompleteSilences(this);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.CalculateBeats = function(layout) {
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
			notEmptyVoicesChecked.push(null);
			this._voiceGroups[v] = new Array();
		}
	}
	this._widthBeats = 0;
	this.NotEmptyBeats = 0;
	this.NotEmptyVoices = 0;
	{
		var _g1 = 0, _g = this.BeatCount();
		while(_g1 < _g) {
			var i = _g1++;
			var beat = this.Beats[i];
			beat.Reset();
			{
				var _g2 = 0;
				while(_g2 < 2) {
					var v = _g2++;
					var voice = beat.Voices[v];
					if(!voice.IsEmpty) {
						voice.Reset();
						if(minDuration == null || voice.Duration.Time() <= minDuration.Time()) {
							minDuration = voice.Duration;
						}
						if(!notEmptyVoicesChecked[v]) {
							notEmptyVoicesChecked[v] = true;
							this.NotEmptyVoices++;
						}
						{
							var _g3 = 0, _g4 = voice.Notes;
							while(_g3 < _g4.length) {
								var note = _g4[_g3];
								++_g3;
								var noteImpl = note;
								voice.Check(noteImpl);
							}
						}
						if(!voice.IsRestVoice()) {
							beat.Check(voice.MinNote);
							beat.Check(voice.MaxNote);
							if((groups[v] == null) || !this.CanJoin(layout.SongManager(),voice,previousVoices[v])) {
								groups[v] = new net.coderline.jsgs.tablature.model.BeatGroup(v);
								this._voiceGroups[v].push(groups[v]);
							}
							groups[v].CheckVoice(voice);
						}
						else {
							{
								var _g3 = 0;
								while(_g3 < 2) {
									var v2 = _g3++;
									if(v2 != voice.Index) {
										var voice2 = beat.GetVoiceImpl(v2);
										if(!voice2.IsEmpty && voice2.Duration.Equals(voice.Duration)) {
											if(!voice2.IsRestVoice() || !voice2.IsHiddenSilence) {
												voice.IsHiddenSilence = true;
												break;
											}
										}
									}
								}
							}
						}
						net.coderline.jsgs.tablature.model.GsMeasureImpl.MakeVoice(layout,voice,previousVoices[v],groups[v]);
						previousVoices[v] = voice;
					}
				}
			}
			this.MakeBeat(layout,beat,this.TrackImpl().PreviousBeat,false);
			this.TrackImpl().PreviousBeat = beat;
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
					var oGroup = voiceGroup[_g2];
					++_g2;
					oGroup.Finish(layout,this);
				}
			}
		}
	}
	if(!this._compactMode) {
		this.QuarterSpacing = ((minDuration != null)?layout.GetSpacingForQuarter(minDuration):Math.round(30 * layout.Scale));
		this.HeaderImpl().NotifyQuarterSpacing(this.QuarterSpacing);
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.CalculateKeySignatureSpacing = function(layout) {
	var spacing = 0;
	if(this.IsPaintKeySignature) {
		if(this.GetKeySignature() <= 7) {
			spacing += Math.round((6 * layout.Scale) * this.GetKeySignature());
		}
		else {
			spacing += Math.round((6 * layout.Scale) * (this.GetKeySignature() - 7));
		}
		if(this._previousMeasure != null) {
			if(this._previousMeasure.GetKeySignature() <= 7) {
				spacing += Math.round((6 * layout.Scale) * this._previousMeasure.GetKeySignature());
			}
			else {
				spacing += Math.round((6 * layout.Scale) * (this._previousMeasure.GetKeySignature() - 7));
			}
		}
	}
	return spacing;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.CalculateMeasureChanges = function(layout) {
	this.IsPaintClef = false;
	this.IsPaintKeySignature = false;
	this._previousMeasure = ((layout.IsFirstMeasure(this)?null:layout.SongManager().GetPreviousMeasure(this)));
	if(this._previousMeasure == null || this.Clef != this._previousMeasure.Clef) {
		this.IsPaintClef = true;
		this.HeaderImpl().NotifyClefSpacing(Math.round(40 * layout.Scale));
	}
	if(this._previousMeasure == null || $closure(this,"KeySignature") != $closure(this._previousMeasure,"KeySignature")) {
		this.IsPaintKeySignature = true;
		this.HeaderImpl().NotifyKeySignatureSpacing(this.CalculateKeySignatureSpacing(layout));
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.CalculateWidth = function(layout) {
	if(this._compactMode) {
		this.Width = this._widthBeats;
	}
	else {
		var quartersInSignature = ((1.00 / this.GetTimeSignature().Denominator.Value) * 4.00) * this.GetTimeSignature().Numerator;
		this.Width = Math.round(this.QuarterSpacing * quartersInSignature);
	}
	this.Width += this.GetFirstNoteSpacing(layout);
	this.Width += ((this.RepeatClose() > 0)?20:0);
	this.Width += this.HeaderImpl().GetLeftSpacing(layout);
	this.Width += this.HeaderImpl().GetRightSpacing(layout);
	this.HeaderImpl().NotifyWidth(this.Width);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.CanJoin = function(manager,b1,b2) {
	if(b1 == null || b2 == null || b1.IsRestVoice() || b2.IsRestVoice()) {
		return false;
	}
	var divisionLength = this.DivisionLength;
	var start = this.Start();
	var start1 = (manager.GetRealStart(this,b1.Beat.Start) - start);
	var start2 = (manager.GetRealStart(this,b2.Beat.Start) - start);
	if(b1.Duration.Value < 8 || b2.Duration.Value < 8) {
		return (start1 == start2);
	}
	var p1 = Math.floor((divisionLength + start1) / divisionLength);
	var p2 = Math.floor((divisionLength + start2) / divisionLength);
	return (p1 == p2);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.CheckCompactMode = function(layout) {
	this._compactMode = layout.CompactMode;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.CheckEffects = function(layout,note) {
	var effect = note.Effect;
	if(effect.AccentuatedNote || effect.HeavyAccentuatedNote) {
		this._accentuated = true;
	}
	if(effect.IsHarmonic()) {
		this._harmonic = true;
	}
	if(effect.Tapping || effect.Slapping || effect.Popping) {
		this._tapping = true;
	}
	if(effect.PalmMute) {
		this._palmMute = true;
	}
	if(effect.FadeIn) {
		this._fadeIn = true;
	}
	if(effect.Vibrato || effect.IsTrill()) {
		this._vibrato = true;
	}
	if(effect.LetRing) {
		this._letRing = true;
	}
	if(effect.IsBend()) {
		this._bend = true;
		this._bendOverFlow = Math.round(Math.max(this._bendOverFlow,Math.round(note.CalculateBendOverflow(layout))));
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.CheckValue = function(layout,note,direction) {
	var y = note.ScorePosY;
	var upOffset = net.coderline.jsgs.tablature.model.BeatGroup.GetUpOffset(layout);
	var downOffset = net.coderline.jsgs.tablature.model.BeatGroup.GetDownOffset(layout);
	if(direction == net.coderline.jsgs.model.GsVoiceDirection.Up && y > this.MaxY) {
		this.MaxY = y;
	}
	else if(direction == net.coderline.jsgs.model.GsVoiceDirection.Down && (y + downOffset) > this.MaxY) {
		this.MaxY = Math.floor((y + downOffset) + 2);
	}
	if(direction == net.coderline.jsgs.model.GsVoiceDirection.Up && (y - upOffset) < this.MinY) {
		this.MinY = Math.floor((y - upOffset) - 2);
	}
	else if(direction == net.coderline.jsgs.model.GsVoiceDirection.Down && y < this.MinY) {
		this.MinY = y;
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.ClearRegisteredAccidentals = function() {
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
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.Create = function(layout) {
	this.DivisionLength = net.coderline.jsgs.model.SongManager.GetDivisionLength(this.Header);
	this.ResetSpacing();
	this.AutoCompleteSilences(layout.SongManager());
	this.OrderBeats(layout.SongManager());
	this.CheckCompactMode(layout);
	this.ClearRegisteredAccidentals();
	this.CalculateBeats(layout);
	this.CalculateWidth(layout);
	this.IsFirstOfLine = false;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.DivisionLength = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.GetBeatSpacing = function(beat) {
	return ((beat.Start - this.Start()) * this.Spacing) / this.Length();
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.GetClefSpacing = function(layout) {
	return this.HeaderImpl().GetClefSpacing(layout,this);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.GetFirstNoteSpacing = function(layout) {
	return this.HeaderImpl().GetFirstNoteSpacing(layout,this);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.GetKeySignatureSpacing = function(layout) {
	return this.HeaderImpl().GetKeySignatureSpacing(layout,this);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.GetMaxQuarterSpacing = function() {
	return this.QuarterSpacing;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.GetNoteAccidental = function(noteValue) {
	if(noteValue >= 0 && noteValue < 128) {
		var key = this.KeySignature();
		var note = (noteValue % 12);
		var octave = Math.round(noteValue / 12);
		var accidentalValue = ((key <= 7?2:3));
		var accidentalNotes = ((key <= 7?net.coderline.jsgs.tablature.model.GsMeasureImpl.AccidentalSharpNotes:net.coderline.jsgs.tablature.model.GsMeasureImpl.AccidentalFlatNotes));
		var isAccidentalNote = net.coderline.jsgs.tablature.model.GsMeasureImpl.AccidentalNotes[note];
		var isAccidentalKey = net.coderline.jsgs.tablature.model.GsMeasureImpl.KeySignatures[key][accidentalNotes[note]] == accidentalValue;
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
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.GetTimeSignatureSymbol = function(number) {
	switch(number) {
	case 1:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num1;
	}break;
	case 2:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num2;
	}break;
	case 3:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num3;
	}break;
	case 4:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num4;
	}break;
	case 5:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num5;
	}break;
	case 6:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num6;
	}break;
	case 7:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num7;
	}break;
	case 8:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num8;
	}break;
	case 9:{
		return net.coderline.jsgs.tablature.drawing.MusicFont.Num9;
	}break;
	}
	return null;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.HeaderImpl = function() {
	return this.Header;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.IsFirstOfLine = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.IsPaintClef = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.IsPaintKeySignature = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.LyricBeatIndex = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.MakeBeat = function(layout,beat,previousBeat,chordEnabled) {
	var minimumWidth = -1;
	var restBeat = true;
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			var voice = beat.GetVoiceImpl(v);
			if(!voice.IsEmpty) {
				if(minimumWidth < 0 || voice.Width < minimumWidth) {
					minimumWidth = voice.Width;
				}
				if(!voice.IsRestVoice()) {
					restBeat = false;
				}
			}
		}
	}
	beat.MinimumWidth = (minimumWidth);
	this.NotEmptyBeats += ((restBeat?0:1));
	this._widthBeats += beat.MinimumWidth;
	if(previousBeat != null) {
		beat.PreviousBeat = (previousBeat);
		previousBeat.NextBeat = (beat);
		if(chordEnabled && beat.Chord != null && previousBeat.Chord != null) {
			var previousWidth = previousBeat.MinimumWidth;
			var chordWidth = Math.floor((layout.ChordFretIndexSpacing + layout.ChordStringSpacing) + (this.Track.StringCount() * layout.ChordStringSpacing));
			previousBeat.MinimumWidth = Math.round((Math.max(chordWidth,previousWidth)));
			this._widthBeats -= previousWidth;
			this._widthBeats += previousBeat.MinimumWidth;
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.MaxY = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.MinY = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.NotEmptyBeats = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.NotEmptyVoices = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.OrderBeats = function(manager) {
	manager.OrderBeats(this);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintClef = function(layout,context,fromX,fromY) {
	if(this.IsPaintClef) {
		var x = fromX + Math.round(14 * layout.Scale);
		var y = fromY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines);
		if(this.Clef == net.coderline.jsgs.model.GsMeasureClef.Treble) {
			net.coderline.jsgs.tablature.drawing.ClefPainter.PaintTreble(context,x,y,layout);
		}
		else if(this.Clef == net.coderline.jsgs.model.GsMeasureClef.Bass) {
			net.coderline.jsgs.tablature.drawing.ClefPainter.PaintBass(context,x,y,layout);
		}
		else if(this.Clef == net.coderline.jsgs.model.GsMeasureClef.Tenor) {
			net.coderline.jsgs.tablature.drawing.ClefPainter.PaintTenor(context,x,y,layout);
		}
		else if(this.Clef == net.coderline.jsgs.model.GsMeasureClef.Alto) {
			net.coderline.jsgs.tablature.drawing.ClefPainter.PaintAlto(context,x,y,layout);
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintComponents = function(layout,context,fromX,fromY) {
	var _g = 0, _g1 = this.Beats;
	while(_g < _g1.length) {
		var beat = _g1[_g];
		++_g;
		var impl = beat;
		impl.Paint(layout,context,fromX + this.HeaderImpl().GetLeftSpacing(layout),fromY);
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintDivisions = function(layout,context) {
	var x1 = this.PosX;
	var x2 = this.PosX + this.Width;
	var offsetY = 0;
	var y1 = this.PosY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines);
	var y2 = Math.floor(y1 + (layout.ScoreLineSpacing * 4));
	if(layout.IsFirstMeasure(this) || this.IsFirstOfLine) {
		offsetY = (this.PosY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature)) - y2;
	}
	this.PaintDivisions2(layout,context,x1,y1,x2,y2,offsetY,true);
	y1 = this.PosY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature);
	y2 = Math.floor(y1 + ((this.Track.Strings.length - 1) * layout.StringSpacing));
	offsetY = 0;
	this.PaintDivisions2(layout,context,x1,y1,x2,y2,offsetY,false);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintDivisions2 = function(layout,context,x1,y1,x2,y2,offsetY,addInfo) {
	var scale = layout.Scale;
	var lineWidthSmall = 1;
	var lineWidthBig = Math.floor(Math.max(lineWidthSmall,Math.round(3.0 * scale)));
	var fill = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	var draw = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw);
	if(addInfo) {
		var number = Std.string(this.Number());
		context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Red).AddString(number,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,(this.PosX + Math.round(scale)),((y1 - net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight) - Math.round(scale)));
	}
	if(this.IsRepeatOpen() || layout.IsFirstMeasure(this)) {
		fill.MoveTo(x1,y1);
		fill.RectTo(lineWidthBig,(y2 + offsetY) - y1);
		draw.StartFigure();
		draw.MoveTo(Math.floor(((x1 + lineWidthBig) + scale) + lineWidthSmall),y1);
		draw.LineTo(Math.floor(((x1 + lineWidthBig) + scale) + lineWidthSmall),y2 + offsetY);
		if(this.IsRepeatOpen()) {
			var size = Math.round(Math.max(1,(4.0 * scale)));
			var xMove = (((lineWidthBig + scale) + lineWidthSmall) + (2.0 * scale));
			var yMove = (((lineWidthBig + scale) + lineWidthSmall) + (2.0 * scale));
			fill.MoveTo(Math.floor(x1 + xMove),Math.floor((y1 + ((y2 - y1) / 2)) - (yMove + (size / 2))));
			fill.EllipseTo(size,size);
			fill.MoveTo(Math.floor(x1 + xMove),Math.floor((y1 + ((y2 - y1) / 2)) + (yMove - (size / 2))));
			fill.EllipseTo(size,size);
		}
	}
	else {
		draw.StartFigure();
		draw.MoveTo(x1,y1);
		draw.LineTo(x1,y2 + offsetY);
	}
	if(this.RepeatClose() > 0 || layout.IsLastMeasure(this)) {
		draw.StartFigure();
		draw.MoveTo(Math.floor((x2 + this.Spacing) - ((lineWidthBig + scale) + lineWidthSmall)),y1);
		draw.LineTo(Math.floor((x2 + this.Spacing) - ((lineWidthBig + scale) + lineWidthSmall)),y2);
		fill.MoveTo((x2 + this.Spacing) - lineWidthBig,y1);
		fill.RectTo(lineWidthBig,y2 - y1);
		if(this.RepeatClose() > 0) {
			var size = Math.round(Math.max(1,(4 * scale)));
			var xMove = ((((lineWidthBig + scale) + lineWidthSmall) + (2.0 * scale)) + size);
			var yMove = (((lineWidthBig + scale) + lineWidthSmall) + (2.0 * scale));
			fill.MoveTo(Math.round((x2 - xMove) + this.Spacing),Math.round((y1 + ((y2 - y1) / 2)) - (yMove + (size / 2))));
			fill.EllipseTo(size,size);
			fill.MoveTo(Math.round((x2 - xMove) + this.Spacing),Math.round((y1 + ((y2 - y1) / 2)) + (yMove - (size / 2))));
			fill.EllipseTo(size,size);
			if(addInfo) {
				var repetitions = ("x" + (this.RepeatClose() + 1));
				var numberSize = context.Graphics.measureText(repetitions);
				fill.AddString(repetitions,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,(((x2 - numberSize.Width) + this.Spacing) - size),((y1 - net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight) - Math.round(scale)));
			}
		}
	}
	else {
		draw.StartFigure();
		draw.MoveTo(x2 + this.Spacing,y1);
		draw.LineTo(x2 + this.Spacing,y2);
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintKeySignature = function(layout,context,fromX,fromY) {
	if(this.IsPaintKeySignature) {
		var scale = layout.ScoreLineSpacing;
		var x = (fromX + this.GetClefSpacing(layout)) + 10;
		var y = fromY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines);
		var currentKey = this.GetKeySignature();
		var previousKey = ((this._previousMeasure != null?this._previousMeasure.GetKeySignature():0));
		var offsetClef = 0;
		var clef = (this.Clef);
		switch(clef) {
		case net.coderline.jsgs.model.GsMeasureClef.Treble:{
			offsetClef = 0;
		}break;
		case net.coderline.jsgs.model.GsMeasureClef.Bass:{
			offsetClef = 2;
		}break;
		case net.coderline.jsgs.model.GsMeasureClef.Tenor:{
			offsetClef = -1;
		}break;
		case net.coderline.jsgs.model.GsMeasureClef.Alto:{
			offsetClef = 1;
		}break;
		}
		if(previousKey >= 1 && previousKey <= 7) {
			var naturalFrom = ((currentKey >= 1 && currentKey <= 7)?currentKey:0);
			{
				var _g = naturalFrom;
				while(_g < previousKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((net.coderline.jsgs.tablature.model.GsMeasureImpl.ScoreKeySharpPositions[i] + offsetClef) + 7) % 7)) - (scale / 2);
					net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintNatural(context,x,y + offset,layout);
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
					var offset = ((scale / 2) * (((net.coderline.jsgs.tablature.model.GsMeasureImpl.ScoreKeyFlatPositions[i - 7] + offsetClef) + 7) % 7)) - (scale / 2);
					net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintNatural(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		if(currentKey >= 1 && currentKey <= 7) {
			{
				var _g = 0;
				while(_g < currentKey) {
					var i = _g++;
					var offset = Math.floor(((scale / 2) * (((net.coderline.jsgs.tablature.model.GsMeasureImpl.ScoreKeySharpPositions[i] + offsetClef) + 7) % 7)) - (scale / 2));
					net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintSharp(context,x,(y + offset),layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		else if(currentKey >= 8 && currentKey <= 14) {
			{
				var _g = 7;
				while(_g < currentKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((net.coderline.jsgs.tablature.model.GsMeasureImpl.ScoreKeyFlatPositions[i - 7] + offsetClef) + 7) % 7)) - (scale / 2);
					net.coderline.jsgs.tablature.drawing.KeySignaturePainter.PaintFlat(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintMarker = function(context,layout) {
	if(this.HasMarker()) {
		var x = ((this.PosX + this.HeaderImpl().GetLeftSpacing(layout)) + this.GetFirstNoteSpacing(layout));
		var y = (this.PosY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.Marker));
		context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1).AddString(this.GetMarker().Title,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,x,y);
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintMeasure = function(layout,context) {
	var x = this.PosX;
	var y = this.PosY;
	layout.PaintLines(this.TrackImpl(),this.Ts,context,x,y,this.Width + this.Spacing);
	this.PaintTimeSignature(context,layout,x,y);
	this.PaintClef(layout,context,x,y);
	this.PaintKeySignature(layout,context,x,y);
	this.PaintComponents(layout,context,x,y);
	this.PaintMarker(context,layout);
	this.PaintTexts(layout,context);
	this.PaintTempo(context,layout);
	this.PaintTripletFeel(context,layout);
	this.PaintDivisions(layout,context);
	this.PaintRepeatEnding(layout,context);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintRepeatEnding = function(layout,context) {
	if(this.Header.RepeatAlternative > 0) {
		var scale = layout.Scale;
		var x1 = ((this.PosX + this.HeaderImpl().GetLeftSpacing(layout)) + this.GetFirstNoteSpacing(layout));
		var x2 = ((this.PosX + this.Width) + this.Spacing);
		var y1 = (this.PosY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.RepeatEnding));
		var y2 = (y1 + (layout.RepeatEndingSpacing * 0.75));
		var sText = "";
		{
			var _g = 0;
			while(_g < 8) {
				var i = _g++;
				if((this.Header.RepeatAlternative & (1 << i)) != 0) {
					sText += ((sText.length > 0)?", " + (i + 1):Std.string(i + 1));
				}
			}
		}
		var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw);
		layer.StartFigure();
		layer.MoveTo(x1,y2);
		layer.LineTo(x1,y1);
		layer.LineTo(x2,y1);
		context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents).AddString(sText,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,Math.round(x1 + (5.0 * scale)),Math.round(y1 + (2.0 * scale)));
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintTempo = function(context,layout) {
	if(this.HeaderImpl().ShouldPaintTempo) {
		var scale = 5.0 * layout.Scale;
		var x = (this.PosX + this.HeaderImpl().GetLeftSpacing(layout));
		var y = this.PosY;
		var lineSpacing = Math.floor(Math.max(layout.ScoreLineSpacing,layout.StringSpacing));
		y += (this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines) - lineSpacing);
		var imgX = x;
		var imgY = y - (Math.round(scale * 3.5) + 2);
		net.coderline.jsgs.tablature.drawing.TempoPainter.PaintTempo(context,imgX,imgY,scale);
		var value = (" = " + this.GetTempo().Value);
		var fontX = x + Math.floor(Math.round((1.33 * scale)) + 1);
		var fontY = Math.round((y - net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFontHeight) - (layout.Scale));
		context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents).AddString(value,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,fontX,fontY);
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintTexts = function(layout,context) {
	var _g = 0, _g1 = this.Beats;
	while(_g < _g1.length) {
		var beat = _g1[_g];
		++_g;
		if(beat.Text != null) {
			var text = beat.Text;
			text.Paint(layout,context,(this.PosX + this.HeaderImpl().GetLeftSpacing(layout)),this.PosY);
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintTimeSignature = function(context,layout,fromX,fromY) {
	if(this.HeaderImpl().ShouldPaintTimeSignature) {
		var scale = layout.Scale;
		var leftSpacing = Math.round(5.0 * scale);
		var x = ((this.GetClefSpacing(layout) + this.GetKeySignatureSpacing(layout)) + this.HeaderImpl().GetLeftSpacing(layout)) + leftSpacing;
		var y = fromY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines);
		var y1 = 0;
		var y2 = Math.round(2 * layout.ScoreLineSpacing);
		var numerator = this.GetTimeSignature().Numerator;
		var symbol = this.GetTimeSignatureSymbol(numerator);
		if(symbol != null) {
			context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents).AddMusicSymbol(symbol,fromX + x,y + y1,scale);
		}
		var denominator = this.GetTimeSignature().Denominator.Value;
		symbol = this.GetTimeSignatureSymbol(denominator);
		if(symbol != null) {
			context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents).AddMusicSymbol(symbol,fromX + x,y + y2,scale);
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PaintTripletFeel = function(context,layout) {
	if(this.HeaderImpl().ShouldPaintTripletFeel) {
		var lineSpacing = Math.floor(Math.max(layout.ScoreLineSpacing,layout.StringSpacing));
		var scale = (5.0 * layout.Scale);
		var x = ((this.PosX + this.HeaderImpl().GetLeftSpacing(layout)) + this.HeaderImpl().GetTempoSpacing(layout));
		var y = (this.PosY + this.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines)) - lineSpacing;
		var y1 = y - (Math.round((3.5 * scale)));
		if(this.GetTripletFeel() == net.coderline.jsgs.model.GsTripletFeel.None && this._previousMeasure != null) {
			var previous = this._previousMeasure.GetTripletFeel();
			if(previous == net.coderline.jsgs.model.GsTripletFeel.Eighth) {
				net.coderline.jsgs.tablature.drawing.TripletFeelPainter.PaintTripletFeelNone8(context,x,y1,layout.Scale);
			}
			else if(previous == net.coderline.jsgs.model.GsTripletFeel.Sixteenth) {
				net.coderline.jsgs.tablature.drawing.TripletFeelPainter.PaintTripletFeelNone16(context,x,y1,layout.Scale);
			}
		}
		else if(this.GetTripletFeel() == net.coderline.jsgs.model.GsTripletFeel.Eighth) {
			net.coderline.jsgs.tablature.drawing.TripletFeelPainter.PaintTripletFeel8(context,x,y1,layout.Scale);
		}
		else if(this.GetTripletFeel() == net.coderline.jsgs.model.GsTripletFeel.Sixteenth) {
			net.coderline.jsgs.tablature.drawing.TripletFeelPainter.PaintTripletFeel16(context,x,y1,layout.Scale);
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PosX = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.PosY = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.QuarterSpacing = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.RegisterSpacing = function(layout,spacing) {
	if(this.HasMarker()) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.Marker,layout.MarkerSpacing);
	}
	if(this._chord) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.Chord,layout.GetDefaultChordSpacing());
	}
	if(this._text) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.Text,layout.TextSpacing);
	}
	if(this.Header.RepeatAlternative > 0) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.RepeatEnding,layout.RepeatEndingSpacing);
	}
	if(this._tupleto) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.Tupleto,layout.TupletoSpacing);
	}
	if(this._accentuated) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.AccentuatedEffect,layout.EffectSpacing);
	}
	if(this._harmonic) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.HarmonicEffect,layout.EffectSpacing);
	}
	if(this._tapping) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.TapingEffect,layout.EffectSpacing);
	}
	if(this._palmMute) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.PalmMuteEffect,layout.EffectSpacing);
	}
	if(this._fadeIn) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.FadeIn,layout.EffectSpacing);
	}
	if(this._vibrato) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.VibratoEffect,layout.EffectSpacing);
	}
	if(this._letRing) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.LetRingEffect,layout.EffectSpacing);
	}
	if(this._bend) {
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.Bend,this._bendOverFlow);
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.ResetSpacing = function() {
	this._text = false;
	this._chord = false;
	this._tupleto = false;
	this._accentuated = false;
	this._harmonic = false;
	this._tapping = false;
	this._palmMute = false;
	this._fadeIn = false;
	this._vibrato = false;
	this._letRing = false;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.Spacing = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.TrackImpl = function() {
	return this.Track;
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.Ts = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.Update = function(layout) {
	this.UpdateComponents(layout);
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.UpdateComponents = function(layout) {
	this.MaxY = 0;
	this.MinY = 0;
	var spacing = this.GetFirstNoteSpacing(layout);
	var tmpX = spacing;
	{
		var _g1 = 0, _g = this.BeatCount();
		while(_g1 < _g) {
			var i = _g1++;
			var beat = this.Beats[i];
			if(this._compactMode) {
				beat.PosX = (tmpX);
				tmpX += beat.MinimumWidth;
			}
			else {
				var quarterWidth = this.GetMaxQuarterSpacing();
				var x1 = (spacing + net.coderline.jsgs.tablature.model.GsMeasureImpl.GetStartPosition(this,beat.Start,quarterWidth));
				var minimumWidth = -1;
				{
					var _g3 = 0, _g2 = beat.Voices.length;
					while(_g3 < _g2) {
						var v = _g3++;
						var voice = beat.GetVoiceImpl(v);
						if(!voice.IsEmpty) {
							var x2 = (spacing + net.coderline.jsgs.tablature.model.GsMeasureImpl.GetStartPosition(this,beat.Start + voice.Duration.Time(),quarterWidth));
							var width = (x2 - x1);
							if(minimumWidth < 0 || width < minimumWidth) {
								minimumWidth = width;
							}
							voice.Width = (width);
						}
					}
				}
				beat.PosX = (x1);
				beat.MinimumWidth = (minimumWidth);
			}
			{
				var _g3 = 0, _g2 = beat.Voices.length;
				while(_g3 < _g2) {
					var v = _g3++;
					var voice = beat.GetVoiceImpl(v);
					if(!voice.IsEmpty) {
						{
							var _g4 = 0, _g5 = voice.Notes;
							while(_g4 < _g5.length) {
								var note = _g5[_g4];
								++_g4;
								var note2 = note;
								this.CheckEffects(layout,note2);
								note2.Update(layout);
							}
						}
						voice.Update(layout);
						if(!this._tupleto && voice.Duration.Triplet != new net.coderline.jsgs.model.GsTriplet()) {
							this._tupleto = true;
						}
						if(voice.MaxY > this.MaxY) {
							this.MaxY = voice.MaxY;
						}
						if(voice.MinY < this.MinY) {
							this.MinY = voice.MinY;
						}
					}
				}
			}
			if(!this._chord && beat.Chord != null) {
				this._chord = true;
			}
			if(!this._text && beat.Text != null) {
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
					this.CheckValue(layout,group.MinNote,group.Direction);
					this.CheckValue(layout,group.MaxNote,group.Direction);
				}
			}
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.Width = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._accentuated = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._bend = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._bendOverFlow = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._chord = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._compactMode = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._fadeIn = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._harmonic = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._letRing = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._palmMute = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._previousMeasure = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._registeredAccidentals = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._tapping = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._text = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._tupleto = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._vibrato = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._voiceGroups = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype._widthBeats = null;
net.coderline.jsgs.tablature.model.GsMeasureImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsMeasureImpl;
net.coderline.jsgs.model.GsTriplet = function(p) { if( p === $_ ) return; {
	this.Enters = 1;
	this.Times = 1;
}}
net.coderline.jsgs.model.GsTriplet.__name__ = ["net","coderline","jsgs","model","GsTriplet"];
net.coderline.jsgs.model.GsTriplet.prototype.Clone = function(factory) {
	var triplet = factory.NewTriplet();
	this.Copy(triplet);
	return triplet;
}
net.coderline.jsgs.model.GsTriplet.prototype.ConvertTime = function(time) {
	return Math.floor((time * this.Times) / this.Enters);
}
net.coderline.jsgs.model.GsTriplet.prototype.Copy = function(triplet) {
	triplet.Enters = this.Enters;
	triplet.Times = this.Times;
}
net.coderline.jsgs.model.GsTriplet.prototype.Enters = null;
net.coderline.jsgs.model.GsTriplet.prototype.Equals = function(triplet) {
	return this.Enters == triplet.Enters && this.Times == triplet.Times;
}
net.coderline.jsgs.model.GsTriplet.prototype.Times = null;
net.coderline.jsgs.model.GsTriplet.prototype.__class__ = net.coderline.jsgs.model.GsTriplet;
net.coderline.jsgs.tablature.drawing.SilencePainter = function() { }
net.coderline.jsgs.tablature.drawing.SilencePainter.__name__ = ["net","coderline","jsgs","tablature","drawing","SilencePainter"];
net.coderline.jsgs.tablature.drawing.SilencePainter.PaintEighth = function(layer,x,y,layout) {
	var scale = layout.ScoreLineSpacing;
	y += scale;
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.SilenceEighth,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.SilencePainter.PaintWhole = function(layer,x,y,layout) {
	var scale = layout.ScoreLineSpacing;
	y += scale;
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.SilencePainter.PaintHalf = function(layer,x,y,layout) {
	var scale = layout.ScoreLineSpacing;
	y += scale - (4 * layout.Scale);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.SilencePainter.PaintQuarter = function(layer,x,y,layout) {
	var scale = layout.ScoreLineSpacing;
	y += scale * 0.5;
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.SilenceQuarter,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.SilencePainter.PaintSixteenth = function(layer,x,y,layout) {
	var scale = layout.ScoreLineSpacing;
	y += scale;
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.SilenceSixteenth,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.SilencePainter.PaintSixtyFourth = function(layer,x,y,layout) {
	var scale = layout.ScoreLineSpacing;
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.SilenceSixtyFourth,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.SilencePainter.PaintThirtySecond = function(layer,x,y,layout) {
	var scale = layout.ScoreLineSpacing;
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.SilenceThirtySecond,x,y,layout.Scale);
}
net.coderline.jsgs.tablature.drawing.SilencePainter.prototype.__class__ = net.coderline.jsgs.tablature.drawing.SilencePainter;
net.coderline.jsgs.model.GsVoiceDirection = { __ename__ : ["net","coderline","jsgs","model","GsVoiceDirection"], __constructs__ : ["None","Up","Down"] }
net.coderline.jsgs.model.GsVoiceDirection.Down = ["Down",2];
net.coderline.jsgs.model.GsVoiceDirection.Down.toString = $estr;
net.coderline.jsgs.model.GsVoiceDirection.Down.__enum__ = net.coderline.jsgs.model.GsVoiceDirection;
net.coderline.jsgs.model.GsVoiceDirection.None = ["None",0];
net.coderline.jsgs.model.GsVoiceDirection.None.toString = $estr;
net.coderline.jsgs.model.GsVoiceDirection.None.__enum__ = net.coderline.jsgs.model.GsVoiceDirection;
net.coderline.jsgs.model.GsVoiceDirection.Up = ["Up",1];
net.coderline.jsgs.model.GsVoiceDirection.Up.toString = $estr;
net.coderline.jsgs.model.GsVoiceDirection.Up.__enum__ = net.coderline.jsgs.model.GsVoiceDirection;
net.coderline.jsgs.tablature.model.GsJoinedType = { __ename__ : ["net","coderline","jsgs","tablature","model","GsJoinedType"], __constructs__ : ["NoneLeft","NoneRight","Left","Right"] }
net.coderline.jsgs.tablature.model.GsJoinedType.Left = ["Left",2];
net.coderline.jsgs.tablature.model.GsJoinedType.Left.toString = $estr;
net.coderline.jsgs.tablature.model.GsJoinedType.Left.__enum__ = net.coderline.jsgs.tablature.model.GsJoinedType;
net.coderline.jsgs.tablature.model.GsJoinedType.NoneLeft = ["NoneLeft",0];
net.coderline.jsgs.tablature.model.GsJoinedType.NoneLeft.toString = $estr;
net.coderline.jsgs.tablature.model.GsJoinedType.NoneLeft.__enum__ = net.coderline.jsgs.tablature.model.GsJoinedType;
net.coderline.jsgs.tablature.model.GsJoinedType.NoneRight = ["NoneRight",1];
net.coderline.jsgs.tablature.model.GsJoinedType.NoneRight.toString = $estr;
net.coderline.jsgs.tablature.model.GsJoinedType.NoneRight.__enum__ = net.coderline.jsgs.tablature.model.GsJoinedType;
net.coderline.jsgs.tablature.model.GsJoinedType.Right = ["Right",3];
net.coderline.jsgs.tablature.model.GsJoinedType.Right.toString = $estr;
net.coderline.jsgs.tablature.model.GsJoinedType.Right.__enum__ = net.coderline.jsgs.tablature.model.GsJoinedType;
net.coderline.jsgs.model.GsMidiChannel = function(p) { if( p === $_ ) return; {
	this.Channel = 0;
	this.EffectChannel = 0;
	this.Instrument(25);
	this.Volume = 127;
	this.Balance = 64;
	this.Chorus = 0;
	this.Reverb = 0;
	this.Phaser = 0;
	this.Tremolo = 0;
}}
net.coderline.jsgs.model.GsMidiChannel.__name__ = ["net","coderline","jsgs","model","GsMidiChannel"];
net.coderline.jsgs.model.GsMidiChannel.prototype.Balance = null;
net.coderline.jsgs.model.GsMidiChannel.prototype.Channel = null;
net.coderline.jsgs.model.GsMidiChannel.prototype.Chorus = null;
net.coderline.jsgs.model.GsMidiChannel.prototype.Copy = function(channel) {
	channel.Channel = this.Channel;
	channel.EffectChannel = this.EffectChannel;
	channel.Instrument(this.Instrument());
	channel.Volume = this.Volume;
	channel.Balance = this.Balance;
	channel.Chorus = this.Chorus;
	channel.Reverb = this.Reverb;
	channel.Phaser = this.Phaser;
	channel.Tremolo = this.Tremolo;
}
net.coderline.jsgs.model.GsMidiChannel.prototype.EffectChannel = null;
net.coderline.jsgs.model.GsMidiChannel.prototype.Instrument = function(newInstrument) {
	if(newInstrument == null) newInstrument = -1;
	if(newInstrument != -1) this._instrument = newInstrument;
	return (this.IsPercussionChannel()?0:this._instrument);
}
net.coderline.jsgs.model.GsMidiChannel.prototype.IsPercussionChannel = function() {
	return this.Channel == 9;
}
net.coderline.jsgs.model.GsMidiChannel.prototype.Phaser = null;
net.coderline.jsgs.model.GsMidiChannel.prototype.Reverb = null;
net.coderline.jsgs.model.GsMidiChannel.prototype.Tremolo = null;
net.coderline.jsgs.model.GsMidiChannel.prototype.Volume = null;
net.coderline.jsgs.model.GsMidiChannel.prototype._instrument = null;
net.coderline.jsgs.model.GsMidiChannel.prototype.__class__ = net.coderline.jsgs.model.GsMidiChannel;
net.coderline.jsgs.model.effects.GsBendPoint = function(position,value,vibrato) { if( position === $_ ) return; {
	if(vibrato == null) vibrato = false;
	if(value == null) value = 0;
	if(position == null) position = 0;
	this.Position = position;
	this.Value = value;
	this.Vibrato = vibrato;
}}
net.coderline.jsgs.model.effects.GsBendPoint.__name__ = ["net","coderline","jsgs","model","effects","GsBendPoint"];
net.coderline.jsgs.model.effects.GsBendPoint.prototype.GetTime = function(duration) {
	return Math.floor((duration * this.Position) / 12);
}
net.coderline.jsgs.model.effects.GsBendPoint.prototype.Position = null;
net.coderline.jsgs.model.effects.GsBendPoint.prototype.Value = null;
net.coderline.jsgs.model.effects.GsBendPoint.prototype.Vibrato = null;
net.coderline.jsgs.model.effects.GsBendPoint.prototype.__class__ = net.coderline.jsgs.model.effects.GsBendPoint;
net.coderline.jsgs.tablature.model.GsSongFactoryImpl = function(p) { if( p === $_ ) return; {
	net.coderline.jsgs.model.GsSongFactory.apply(this,[]);
}}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsSongFactoryImpl"];
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.__super__ = net.coderline.jsgs.model.GsSongFactory;
for(var k in net.coderline.jsgs.model.GsSongFactory.prototype ) net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype[k] = net.coderline.jsgs.model.GsSongFactory.prototype[k];
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewBeat = function() {
	return new net.coderline.jsgs.tablature.model.GsBeatImpl(this);
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewChord = function(length) {
	return new net.coderline.jsgs.tablature.model.GsChordImpl(length);
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewLyrics = function() {
	return new net.coderline.jsgs.tablature.model.GsLyricsImpl();
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewMeasure = function(header) {
	return new net.coderline.jsgs.tablature.model.GsMeasureImpl(header);
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewMeasureHeader = function() {
	return new net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl(this);
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewNote = function() {
	return new net.coderline.jsgs.tablature.model.GsNoteImpl(this);
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewText = function() {
	return new net.coderline.jsgs.tablature.model.GsBeatTextImpl();
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewTrack = function() {
	return new net.coderline.jsgs.tablature.model.GsTrackImpl(this);
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.NewVoice = function(index) {
	return new net.coderline.jsgs.tablature.model.GsVoiceImpl(this,index);
}
net.coderline.jsgs.tablature.model.GsSongFactoryImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsSongFactoryImpl;
net.coderline.jsgs.model.GsBeatText = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.model.GsBeatText.__name__ = ["net","coderline","jsgs","model","GsBeatText"];
net.coderline.jsgs.model.GsBeatText.prototype.Beat = null;
net.coderline.jsgs.model.GsBeatText.prototype.Value = null;
net.coderline.jsgs.model.GsBeatText.prototype.__class__ = net.coderline.jsgs.model.GsBeatText;
net.coderline.jsgs.model.Padding = function(right,top,left,bottom) { if( right === $_ ) return; {
	this.Right = right;
	this.Top = top;
	this.Left = left;
	this.Bottom = bottom;
}}
net.coderline.jsgs.model.Padding.__name__ = ["net","coderline","jsgs","model","Padding"];
net.coderline.jsgs.model.Padding.prototype.Bottom = null;
net.coderline.jsgs.model.Padding.prototype.Left = null;
net.coderline.jsgs.model.Padding.prototype.Right = null;
net.coderline.jsgs.model.Padding.prototype.Top = null;
net.coderline.jsgs.model.Padding.prototype.getHorizontal = function() {
	return this.Left + this.Right;
}
net.coderline.jsgs.model.Padding.prototype.getVertical = function() {
	return this.Top + this.Bottom;
}
net.coderline.jsgs.model.Padding.prototype.__class__ = net.coderline.jsgs.model.Padding;
net.coderline.jsgs.model.effects.GsTremoloPickingEffect = function(factory) { if( factory === $_ ) return; {
	this.Duration = factory.NewDuration();
}}
net.coderline.jsgs.model.effects.GsTremoloPickingEffect.__name__ = ["net","coderline","jsgs","model","effects","GsTremoloPickingEffect"];
net.coderline.jsgs.model.effects.GsTremoloPickingEffect.prototype.Clone = function(factory) {
	var effect = factory.NewTremoloPickingEffect();
	effect.Duration.Value = this.Duration.Value;
	effect.Duration.IsDotted = this.Duration.IsDotted;
	effect.Duration.IsDoubleDotted = this.Duration.IsDoubleDotted;
	effect.Duration.Triplet.Enters = this.Duration.Triplet.Enters;
	effect.Duration.Triplet.Times = this.Duration.Triplet.Times;
	return effect;
}
net.coderline.jsgs.model.effects.GsTremoloPickingEffect.prototype.Duration = null;
net.coderline.jsgs.model.effects.GsTremoloPickingEffect.prototype.__class__ = net.coderline.jsgs.model.effects.GsTremoloPickingEffect;
net.coderline.jsgs.model.Point = function(x,y) { if( x === $_ ) return; {
	this.X = x;
	this.Y = y;
}}
net.coderline.jsgs.model.Point.__name__ = ["net","coderline","jsgs","model","Point"];
net.coderline.jsgs.model.Point.prototype.X = null;
net.coderline.jsgs.model.Point.prototype.Y = null;
net.coderline.jsgs.model.Point.prototype.__class__ = net.coderline.jsgs.model.Point;
net.coderline.jsgs.model.GsVelocities = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.model.GsVelocities.__name__ = ["net","coderline","jsgs","model","GsVelocities"];
net.coderline.jsgs.model.GsVelocities.prototype.__class__ = net.coderline.jsgs.model.GsVelocities;
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
net.coderline.jsgs.tablature.model.BeatGroup = function(voice) { if( voice === $_ ) return; {
	this._voice = voice;
	this._voices = new Array();
	this.Direction = net.coderline.jsgs.model.GsVoiceDirection.None;
	this._firstMinNote = null;
	this._firstMaxNote = null;
	this._lastMinNote = null;
	this._lastMaxNote = null;
	this.MaxNote = null;
	this.MinNote = null;
}}
net.coderline.jsgs.tablature.model.BeatGroup.__name__ = ["net","coderline","jsgs","tablature","model","BeatGroup"];
net.coderline.jsgs.tablature.model.BeatGroup.GetUpOffset = function(layout) {
	return 28 * (layout.ScoreLineSpacing / 8.0);
}
net.coderline.jsgs.tablature.model.BeatGroup.GetDownOffset = function(layout) {
	return 35 * (layout.ScoreLineSpacing / 8.0);
}
net.coderline.jsgs.tablature.model.BeatGroup.prototype.CheckNote = function(note) {
	var value = note.RealValue();
	if(this._firstMinNote == null || note.Voice.Beat.Start < this._firstMinNote.Voice.Beat.Start) {
		this._firstMinNote = note;
	}
	else if(note.Voice.Beat.Start == this._firstMinNote.Voice.Beat.Start) {
		if(note.RealValue() < this._firstMinNote.RealValue()) {
			this._firstMinNote = note;
		}
	}
	if(this._firstMaxNote == null || note.Voice.Beat.Start < this._firstMaxNote.Voice.Beat.Start) {
		this._firstMaxNote = note;
	}
	else if(note.Voice.Beat.Start == this._firstMaxNote.Voice.Beat.Start) {
		if(note.RealValue() > this._firstMaxNote.RealValue()) {
			this._firstMaxNote = note;
		}
	}
	if(this._lastMinNote == null || note.Voice.Beat.Start > this._lastMinNote.Voice.Beat.Start) {
		this._lastMinNote = note;
	}
	else if(note.Voice.Beat.Start == this._lastMinNote.Voice.Beat.Start) {
		if(note.RealValue() < this._lastMinNote.RealValue()) {
			this._lastMinNote = note;
		}
	}
	if(this._lastMaxNote == null || note.Voice.Beat.Start > this._lastMaxNote.Voice.Beat.Start) {
		this._lastMaxNote = note;
	}
	else if(note.Voice.Beat.Start == this._lastMaxNote.Voice.Beat.Start) {
		if(note.RealValue() > this._lastMaxNote.RealValue()) {
			this._lastMaxNote = note;
		}
	}
	if(this.MaxNote == null || value > this.MaxNote.RealValue()) {
		this.MaxNote = note;
	}
	if(this.MinNote == null || value < this.MinNote.RealValue()) {
		this.MinNote = note;
	}
}
net.coderline.jsgs.tablature.model.BeatGroup.prototype.CheckVoice = function(voice) {
	this.CheckNote(voice.MaxNote);
	this.CheckNote(voice.MinNote);
	this._voices.push(voice);
	if(voice.Direction != net.coderline.jsgs.model.GsVoiceDirection.None) {
		voice.Direction = voice.Direction;
	}
}
net.coderline.jsgs.tablature.model.BeatGroup.prototype.Direction = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype.Finish = function(layout,measure) {
	if(this.Direction == net.coderline.jsgs.model.GsVoiceDirection.None) {
		if(measure.NotEmptyVoices > 1) {
			this.Direction = (this._voice == 0?net.coderline.jsgs.model.GsVoiceDirection.Up:net.coderline.jsgs.model.GsVoiceDirection.Down);
		}
		else {
			var max = Math.abs(this.MinNote.RealValue() - (net.coderline.jsgs.tablature.model.BeatGroup.ScoreMiddleKeys[net.coderline.jsgs.model.GsMeasureClefConverter.ToInt(measure.Clef) - 1] + 100));
			var min = Math.abs(this.MaxNote.RealValue() - (net.coderline.jsgs.tablature.model.BeatGroup.ScoreMiddleKeys[net.coderline.jsgs.model.GsMeasureClefConverter.ToInt(measure.Clef) - 1] - 100));
			this.Direction = (max > min?net.coderline.jsgs.model.GsVoiceDirection.Up:net.coderline.jsgs.model.GsVoiceDirection.Down);
		}
	}
}
net.coderline.jsgs.tablature.model.BeatGroup.prototype.GetY1 = function(layout,note,key,clef) {
	var scale = (layout.ScoreLineSpacing / 2.00);
	var noteValue = note.RealValue();
	var index = noteValue % 12;
	var step = Math.floor(noteValue / 12);
	var offset = (7 * step) * scale;
	var scoreLineY = (key <= 7?Math.floor((net.coderline.jsgs.tablature.model.BeatGroup.ScoreSharpPositions[index] * scale) - offset):Math.floor((net.coderline.jsgs.tablature.model.BeatGroup.ScoreFlatPositions[index] * scale) - offset));
	scoreLineY += Math.floor(net.coderline.jsgs.tablature.model.GsMeasureImpl.ScoreKeyOffsets[clef - 1] * scale);
	return scoreLineY;
}
net.coderline.jsgs.tablature.model.BeatGroup.prototype.GetY2 = function(layout,x,key,clef) {
	var MaxDistance = 10;
	var upOffset = net.coderline.jsgs.tablature.model.BeatGroup.GetUpOffset(layout);
	var downOffset = net.coderline.jsgs.tablature.model.BeatGroup.GetDownOffset(layout);
	var y;
	var x1;
	var x2;
	var y1;
	var y2;
	if(this.Direction == net.coderline.jsgs.model.GsVoiceDirection.Down) {
		if(this.MinNote != this._firstMinNote && this.MinNote != this._lastMinNote) {
			return Math.round(this.GetY1(layout,this.MinNote,key,clef) + downOffset);
		}
		y = 0;
		x1 = Math.round(this._firstMinNote.PosX() + this._firstMinNote.BeatImpl().Spacing());
		x2 = Math.round(this._lastMinNote.PosX() + this._lastMinNote.BeatImpl().Spacing());
		y1 = Math.round(this.GetY1(layout,this._firstMinNote,key,clef) + downOffset);
		y2 = Math.round(this.GetY1(layout,this._lastMinNote,key,clef) + downOffset);
		if(y1 > y2 && (y1 - y2) > MaxDistance) y2 = (y1 - MaxDistance);
		if(y2 > y1 && (y2 - y1) > MaxDistance) y1 = (y2 - MaxDistance);
		if((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0) {
			y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
		}
		return y1 - y;
	}
	if(this.MaxNote != this._firstMaxNote && this.MaxNote != this._lastMaxNote) {
		return Math.round(this.GetY1(layout,this.MaxNote,key,clef) - upOffset);
	}
	y = 0;
	x1 = Math.round(this._firstMaxNote.PosX() + this._firstMaxNote.BeatImpl().Spacing());
	x2 = Math.round(this._lastMaxNote.PosX() + this._lastMaxNote.BeatImpl().Spacing());
	y1 = Math.round(this.GetY1(layout,this._firstMaxNote,key,clef) - upOffset);
	y2 = Math.round(this.GetY1(layout,this._lastMaxNote,key,clef) - upOffset);
	if(y1 < y2 && (y2 - y1) > MaxDistance) y2 = (y1 + MaxDistance);
	if(y2 < y1 && (y1 - y2) > MaxDistance) y1 = (y2 + MaxDistance);
	if((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0) {
		y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
	}
	return y1 - y;
}
net.coderline.jsgs.tablature.model.BeatGroup.prototype.MaxNote = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype.MinNote = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype._firstMaxNote = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype._firstMinNote = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype._lastMaxNote = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype._lastMinNote = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype._voice = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype._voices = null;
net.coderline.jsgs.tablature.model.BeatGroup.prototype.__class__ = net.coderline.jsgs.tablature.model.BeatGroup;
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
net.coderline.jsgs.tablature.drawing.DrawingContext = function(scale) { if( scale === $_ ) return; {
	this.Layers = new Array();
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.Background)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(205,205,205),true,0);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(34,34,17),true,0);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(165,165,165),false,1);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(34,34,17),true,0);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(34,34,17),false,scale);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(206,206,206),true,1);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(206,206,206),true,0);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(206,206,206),false,scale);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw2)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(206,206,206),false,scale);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(34,34,17),true,1);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(34,34,17),true,0);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(34,34,17),false,scale);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw1)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(34,34,17),false,scale);
	this.Layers[net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(net.coderline.jsgs.tablature.drawing.DrawingLayers.Red)] = new net.coderline.jsgs.tablature.drawing.DrawingLayer(new net.coderline.jsgs.model.GsColor(255,0,0),true,0);
}}
net.coderline.jsgs.tablature.drawing.DrawingContext.__name__ = ["net","coderline","jsgs","tablature","drawing","DrawingContext"];
net.coderline.jsgs.tablature.drawing.DrawingContext.prototype.Clear = function() {
	var _g1 = 0, _g = this.Layers.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.Layers[i].Clear();
	}
}
net.coderline.jsgs.tablature.drawing.DrawingContext.prototype.Draw = function() {
	var _g1 = 0, _g = this.Layers.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.Layers[i].Draw(this.Graphics);
	}
}
net.coderline.jsgs.tablature.drawing.DrawingContext.prototype.Get = function(layer) {
	var index = net.coderline.jsgs.tablature.drawing.DrawingLayersConverter.ToInt(layer);
	return this.Layers[index];
}
net.coderline.jsgs.tablature.drawing.DrawingContext.prototype.Graphics = null;
net.coderline.jsgs.tablature.drawing.DrawingContext.prototype.Layers = null;
net.coderline.jsgs.tablature.drawing.DrawingContext.prototype.__class__ = net.coderline.jsgs.tablature.drawing.DrawingContext;
net.coderline.jsgs.tablature.drawing.TripletFeelPainter = function() { }
net.coderline.jsgs.tablature.drawing.TripletFeelPainter.__name__ = ["net","coderline","jsgs","tablature","drawing","TripletFeelPainter"];
net.coderline.jsgs.tablature.drawing.TripletFeelPainter.PaintTripletFeel16 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.TripletFeel16,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.TripletFeelPainter.PaintTripletFeel8 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.TripletFeel8,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.TripletFeelPainter.PaintTripletFeelNone16 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.TripletFeelNone16,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.TripletFeelPainter.PaintTripletFeelNone8 = function(context,x,y,scale) {
	y -= Math.floor(3 * scale);
	var layer = context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.coderline.jsgs.tablature.drawing.MusicFont.TripletFeelNone8,x,y,scale);
}
net.coderline.jsgs.tablature.drawing.TripletFeelPainter.prototype.__class__ = net.coderline.jsgs.tablature.drawing.TripletFeelPainter;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl = function(factory) { if( factory === $_ ) return; {
	net.coderline.jsgs.model.GsMeasureHeader.apply(this,[factory]);
}}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsMeasureHeaderImpl"];
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.__super__ = net.coderline.jsgs.model.GsMeasureHeader;
for(var k in net.coderline.jsgs.model.GsMeasureHeader.prototype ) net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype[k] = net.coderline.jsgs.model.GsMeasureHeader.prototype[k];
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.CalculateMeasureChanges = function(layout) {
	var previous = layout.SongManager().GetPreviousMeasureHeader(this);
	if(previous == null) {
		this.ShouldPaintTempo = true;
		this.ShouldPaintTripletFeel = this.TripletFeel != net.coderline.jsgs.model.GsTripletFeel.None;
		this.ShouldPaintTimeSignature = true;
	}
	else {
		if(this.Tempo.Value != previous.Tempo.Value) {
			this.ShouldPaintTempo = true;
		}
		if(this.TripletFeel != previous.TripletFeel) {
			this.ShouldPaintTripletFeel = true;
		}
		if(this.TimeSignature.Numerator != previous.TimeSignature.Numerator || this.TimeSignature.Denominator.Value != previous.TimeSignature.Denominator.Value) {
			this.ShouldPaintTimeSignature = true;
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.GetClefSpacing = function(layout,measure) {
	return ((!measure.IsPaintClef)?0:this._maxClefSpacing);
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.GetFirstNoteSpacing = function(layout,measure) {
	var iTopSpacing = this.GetTempoSpacing(layout) + this.GetTripletFeelSpacing(layout);
	var iMiddleSpacing = (this.GetClefSpacing(layout,measure) + this.GetKeySignatureSpacing(layout,measure)) + this.GetTimeSignatureSpacing(layout);
	return Math.round(Math.max(iTopSpacing,iMiddleSpacing) + (10 * layout.Scale));
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.GetKeySignatureSpacing = function(layout,measure) {
	return ((!measure.IsPaintKeySignature)?0:this._maxKeySignatureSpacing);
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.GetLeftSpacing = function(layout) {
	return Math.round(15 * layout.Scale);
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.GetRightSpacing = function(layout) {
	return Math.round(15 * layout.Scale);
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.GetTempoSpacing = function(layout) {
	return ((this.ShouldPaintTempo?Math.round(45 * layout.Scale):0));
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.GetTimeSignatureSpacing = function(layout) {
	return ((this.ShouldPaintTimeSignature?Math.round(30 * layout.Scale):0));
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.GetTripletFeelSpacing = function(layout) {
	return ((this.ShouldPaintTripletFeel?Math.round(55 * layout.Scale):0));
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.MaxQuarterSpacing = null;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.MaxWidth = null;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.NotifyClefSpacing = function(spacing) {
	this._maxClefSpacing = (((spacing > this._maxClefSpacing)?spacing:this._maxClefSpacing));
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.NotifyKeySignatureSpacing = function(spacing) {
	this._maxKeySignatureSpacing = (((spacing > this._maxKeySignatureSpacing)?spacing:this._maxKeySignatureSpacing));
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.NotifyQuarterSpacing = function(spacing) {
	this.MaxQuarterSpacing = (((spacing > this.MaxQuarterSpacing)?spacing:this.MaxQuarterSpacing));
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.NotifyWidth = function(width) {
	this.MaxWidth = (((width > this.MaxWidth)?width:this.MaxWidth));
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.Reset = function() {
	this.MaxWidth = 0;
	this.MaxQuarterSpacing = 0;
	this.ShouldPaintTempo = false;
	this.ShouldPaintTimeSignature = false;
	this.ShouldPaintTripletFeel = false;
	this._maxClefSpacing = 0;
	this._maxKeySignatureSpacing = 0;
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.ShouldPaintTempo = null;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.ShouldPaintTimeSignature = null;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.ShouldPaintTripletFeel = null;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.Update = function(layout,index) {
	this.Reset();
	this.CalculateMeasureChanges(layout);
	var trackCount = this.Song.Tracks.length;
	{
		var _g = 0;
		while(_g < trackCount) {
			var i = _g++;
			var measure = this.Song.Tracks[i].Measures[index];
			measure.CalculateMeasureChanges(layout);
		}
	}
}
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype._maxClefSpacing = null;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype._maxKeySignatureSpacing = null;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl;
net.coderline.jsgs.tablature.drawing.DrawingLayers = { __ename__ : ["net","coderline","jsgs","tablature","drawing","DrawingLayers"], __constructs__ : ["Background","LayoutBackground","Lines","MainComponents","MainComponentsDraw","Voice2","VoiceEffects2","VoiceEffectsDraw2","VoiceDraw2","Voice1","VoiceEffects1","VoiceEffectsDraw1","VoiceDraw1","Red"] }
net.coderline.jsgs.tablature.drawing.DrawingLayers.Background = ["Background",0];
net.coderline.jsgs.tablature.drawing.DrawingLayers.Background.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Background.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground = ["LayoutBackground",1];
net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines = ["Lines",2];
net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Lines.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents = ["MainComponents",3];
net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponents.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw = ["MainComponentsDraw",4];
net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.MainComponentsDraw.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Red = ["Red",13];
net.coderline.jsgs.tablature.drawing.DrawingLayers.Red.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Red.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1 = ["Voice1",9];
net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2 = ["Voice2",5];
net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice2.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw1 = ["VoiceDraw1",12];
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw1.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw1.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw2 = ["VoiceDraw2",8];
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw2.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceDraw2.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1 = ["VoiceEffects1",10];
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects1.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2 = ["VoiceEffects2",6];
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffects2.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1 = ["VoiceEffectsDraw1",11];
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw1.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2 = ["VoiceEffectsDraw2",7];
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2.toString = $estr;
net.coderline.jsgs.tablature.drawing.DrawingLayers.VoiceEffectsDraw2.__enum__ = net.coderline.jsgs.tablature.drawing.DrawingLayers;
net.coderline.jsgs.JQuery = function(p) { if( p === $_ ) return; {
	null;
}}
net.coderline.jsgs.JQuery.__name__ = ["net","coderline","jsgs","JQuery"];
net.coderline.jsgs.JQuery.Elements = function(e) {
	return (jQuery(e));
}
net.coderline.jsgs.JQuery.This = function() {
	return jQuery(this);
}
net.coderline.jsgs.JQuery.CreateHtml = function(html,doc) {
	return (jQuery(html,doc));
}
net.coderline.jsgs.JQuery.Qy = function(query) {
	return jQuery(query);
}
net.coderline.jsgs.JQuery.QyContext = function(query,context) {
	return jQuery(query,context);
}
net.coderline.jsgs.JQuery.Ready = function(f) {
	return (jQuery(f));
}
net.coderline.jsgs.JQuery.Fn_Extend = function(o) {
	return (jQuery.fn.extend(o));
}
net.coderline.jsgs.JQuery.Extend = function(o) {
	return (jQuery.extend(o));
}
net.coderline.jsgs.JQuery.getFX = function() {
	return jQuery.fx.off;
}
net.coderline.jsgs.JQuery.setFX = function(value) {
	return jQuery.fx.off = value;
}
net.coderline.jsgs.JQuery.Effects = null;
net.coderline.jsgs.JQuery.Ajax = function(options) {
	return jQuery.ajax(options);
}
net.coderline.jsgs.JQuery.AjaxSetup = function(options) {
	jQuery.ajaxSetup(options);
}
net.coderline.jsgs.JQuery.GetUrl = function(url,data,call,type) {
	return jQuery.get(url,data,call,type);
}
net.coderline.jsgs.JQuery.GetJSON = function(url,data,call) {
	return jQuery.getJSON(url,data,call);
}
net.coderline.jsgs.JQuery.GetScript = function(url,call) {
	return jQuery.getScript(url,call);
}
net.coderline.jsgs.JQuery.PostUrl = function(url,data,call,type) {
	return jQuery.post(url,data,call,type);
}
net.coderline.jsgs.JQuery.Support = function() {
	return jQuery.support();
}
net.coderline.jsgs.JQuery.ForEach = function(object,call) {
	return jQuery.each(object,call);
}
net.coderline.jsgs.JQuery.Grep = function(arr,call,invert) {
	return jQuery.grep(arr,call,invert);
}
net.coderline.jsgs.JQuery.InArray = function(value,arr) {
	return jQuery.inArray(value,arr);
}
net.coderline.jsgs.JQuery.Merge = function(first,second) {
	return jQuery.merge(first,second);
}
net.coderline.jsgs.JQuery.Unique = function(arr) {
	return jQuery.unique(arr);
}
net.coderline.jsgs.JQuery.IsArray = function(o) {
	return jQuery.isArray(o);
}
net.coderline.jsgs.JQuery.IsFunction = function(o) {
	return jQuery.isFunction(o);
}
net.coderline.jsgs.JQuery.Param = function(o) {
	return jQuery.param(o);
}
net.coderline.jsgs.JQuery.prototype.Accordion = function(param) {
	return this.accordion(param);
}
net.coderline.jsgs.JQuery.prototype.AccordionOption = function(name,value) {
	return this.accordion("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Add = function(expr) {
	return this.add(expr);
}
net.coderline.jsgs.JQuery.prototype.AddClass = function(cl) {
	return this.addClass(cl);
}
net.coderline.jsgs.JQuery.prototype.After = function(content) {
	return this.after(content);
}
net.coderline.jsgs.JQuery.prototype.AjaxComplete = function(call) {
	return this.ajaxComplete(call);
}
net.coderline.jsgs.JQuery.prototype.AjaxError = function(call) {
	return this.ajaxError(call);
}
net.coderline.jsgs.JQuery.prototype.AjaxSend = function(call) {
	return this.ajaxSend(call);
}
net.coderline.jsgs.JQuery.prototype.AjaxStart = function(call) {
	return this.ajaxStart(call);
}
net.coderline.jsgs.JQuery.prototype.AjaxStop = function(call) {
	return this.ajaxStop(call);
}
net.coderline.jsgs.JQuery.prototype.AjaxSuccess = function(call) {
	return this.ajaxSuccess(call);
}
net.coderline.jsgs.JQuery.prototype.AndSelf = function() {
	return this.andSelf();
}
net.coderline.jsgs.JQuery.prototype.Animate = function(params,options,easing,call) {
	return this.animate(params,options,easing,call);
}
net.coderline.jsgs.JQuery.prototype.Append = function(content) {
	return this.append(content);
}
net.coderline.jsgs.JQuery.prototype.AppendTo = function(selector) {
	return this.appendTo(selector);
}
net.coderline.jsgs.JQuery.prototype.Attr = function(name) {
	return this.attr(name);
}
net.coderline.jsgs.JQuery.prototype.Before = function(content) {
	return this.before(content);
}
net.coderline.jsgs.JQuery.prototype.Bind = function(type,fn) {
	return this.bind(type,fn);
}
net.coderline.jsgs.JQuery.prototype.BindWithData = function(type,data,fn) {
	return this.bind(type,data,fn);
}
net.coderline.jsgs.JQuery.prototype.Blur = function() {
	return this.blur();
}
net.coderline.jsgs.JQuery.prototype.BlurCall = function(fn) {
	return this.blur(fn);
}
net.coderline.jsgs.JQuery.prototype.Change = function() {
	return this.change();
}
net.coderline.jsgs.JQuery.prototype.ChangeCall = function(fn) {
	return this.change(fn);
}
net.coderline.jsgs.JQuery.prototype.Children = function(expr) {
	return this.children(expr);
}
net.coderline.jsgs.JQuery.prototype.Click = function() {
	return this.click();
}
net.coderline.jsgs.JQuery.prototype.ClickCall = function(fn) {
	return this.click(fn);
}
net.coderline.jsgs.JQuery.prototype.Clone = function(AndElements) {
	return this.clone(AndElements);
}
net.coderline.jsgs.JQuery.prototype.Closest = function(expr) {
	return this.closest(expr);
}
net.coderline.jsgs.JQuery.prototype.Contents = function(expr) {
	return this.contents(expr);
}
net.coderline.jsgs.JQuery.prototype.Context = null;
net.coderline.jsgs.JQuery.prototype.Css = function(name) {
	return this.css(name);
}
net.coderline.jsgs.JQuery.prototype.DPGetDate = function() {
	return this.datepicker("getDate");
}
net.coderline.jsgs.JQuery.prototype.DPSetDate = function(value) {
	return this.datepicker("setDate",value);
}
net.coderline.jsgs.JQuery.prototype.Data = function(name) {
	return this.data(name);
}
net.coderline.jsgs.JQuery.prototype.Datepicker = function(param) {
	return this.datepicker(param);
}
net.coderline.jsgs.JQuery.prototype.DatepickerOption = function(name,value) {
	return this.datepicker("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Dblclick = function() {
	return this.dblclick();
}
net.coderline.jsgs.JQuery.prototype.DblclickCall = function(fn) {
	return this.dblclick(fn);
}
net.coderline.jsgs.JQuery.prototype.DeQueue = function(name) {
	return this.dequeue(name);
}
net.coderline.jsgs.JQuery.prototype.Dialog = function(param) {
	return this.dialog(param);
}
net.coderline.jsgs.JQuery.prototype.DialogOption = function(name,value) {
	return this.dialog("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Die = function(type,fn) {
	return this.die(type,fn);
}
net.coderline.jsgs.JQuery.prototype.DisableSelection = function() {
	return this.disableSelection();
}
net.coderline.jsgs.JQuery.prototype.Draggable = function(param) {
	return this.draggable(param);
}
net.coderline.jsgs.JQuery.prototype.DraggableOption = function(name,value) {
	return this.draggable("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Droppable = function(param) {
	return this.droppable(param);
}
net.coderline.jsgs.JQuery.prototype.DroppableOption = function(name,value) {
	return this.droppable("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Each = function(f) {
	return this.each(f);
}
net.coderline.jsgs.JQuery.prototype.Empty = function() {
	return this.empty();
}
net.coderline.jsgs.JQuery.prototype.EnableSelection = function() {
	return this.enableSelection();
}
net.coderline.jsgs.JQuery.prototype.End = function() {
	return this.end();
}
net.coderline.jsgs.JQuery.prototype.Eq = function(p) {
	return this.eq(p);
}
net.coderline.jsgs.JQuery.prototype.Error = function() {
	return this.error();
}
net.coderline.jsgs.JQuery.prototype.ErrorCall = function(fn) {
	return this.error(fn);
}
net.coderline.jsgs.JQuery.prototype.FadeIn = function(speed,call) {
	return this.fadeIn(speed,call);
}
net.coderline.jsgs.JQuery.prototype.FadeOut = function(speed,call) {
	return this.fadeOut(speed,call);
}
net.coderline.jsgs.JQuery.prototype.FadeTo = function(speed,opacity,call) {
	return this.fadeTo(speed,opacity,call);
}
net.coderline.jsgs.JQuery.prototype.Filter = function(expr) {
	return this.filter(expr);
}
net.coderline.jsgs.JQuery.prototype.FilterCall = function(fn) {
	return this.filter(fn);
}
net.coderline.jsgs.JQuery.prototype.Find = function(expr) {
	return this.find(expr);
}
net.coderline.jsgs.JQuery.prototype.Focus = function() {
	return this.focus();
}
net.coderline.jsgs.JQuery.prototype.FocusCall = function(fn) {
	return this.focus(fn);
}
net.coderline.jsgs.JQuery.prototype.Get = function() {
	return this.get();
}
net.coderline.jsgs.JQuery.prototype.GetAt = function(p) {
	return this.get(p);
}
net.coderline.jsgs.JQuery.prototype.HasClass = function(cl) {
	return this.hasClass(cl);
}
net.coderline.jsgs.JQuery.prototype.Height = function() {
	return this.height();
}
net.coderline.jsgs.JQuery.prototype.Hide = function(speed,call) {
	return this.hide(speed,call);
}
net.coderline.jsgs.JQuery.prototype.Hover = function(over,out) {
	return this.hover(over,out);
}
net.coderline.jsgs.JQuery.prototype.Html = function() {
	return this.html();
}
net.coderline.jsgs.JQuery.prototype.Index = function(subject) {
	return this.index(subject);
}
net.coderline.jsgs.JQuery.prototype.InnerHeight = function() {
	return this.innerHeight();
}
net.coderline.jsgs.JQuery.prototype.InnerWidth = function() {
	return this.innerWidth();
}
net.coderline.jsgs.JQuery.prototype.InsertAfter = function(selector) {
	return this.insertAfter(selector);
}
net.coderline.jsgs.JQuery.prototype.InsertBefore = function(selector) {
	return this.insertbefore(selector);
}
net.coderline.jsgs.JQuery.prototype.Is = function(expr) {
	return this["is"](expr);
}
net.coderline.jsgs.JQuery.prototype.Keydown = function() {
	return this.keydown();
}
net.coderline.jsgs.JQuery.prototype.KeydownCall = function(fn) {
	return this.keydown(fn);
}
net.coderline.jsgs.JQuery.prototype.Keypress = function() {
	return this.keypress();
}
net.coderline.jsgs.JQuery.prototype.KeypressCall = function(fn) {
	return this.keypress(fn);
}
net.coderline.jsgs.JQuery.prototype.Keypup = function() {
	return this.keyup();
}
net.coderline.jsgs.JQuery.prototype.KeyupCall = function(fn) {
	return this.keyup(fn);
}
net.coderline.jsgs.JQuery.prototype.Length = null;
net.coderline.jsgs.JQuery.prototype.Live = function(type,fn) {
	return this.live(type,fn);
}
net.coderline.jsgs.JQuery.prototype.Load = function(fn) {
	return this.load(fn);
}
net.coderline.jsgs.JQuery.prototype.LoadUrl = function(url,data,call) {
	return this.load(url,data,call);
}
net.coderline.jsgs.JQuery.prototype.Map = function(call) {
	return this.map(call);
}
net.coderline.jsgs.JQuery.prototype.Mousedown = function(fn) {
	return this.mousedown(fn);
}
net.coderline.jsgs.JQuery.prototype.Mouseenter = function(fn) {
	return this.mouseenter(fn);
}
net.coderline.jsgs.JQuery.prototype.Mouseleave = function(fn) {
	return this.mouseleave(fn);
}
net.coderline.jsgs.JQuery.prototype.Mousemove = function(fn) {
	return this.mousemove(fn);
}
net.coderline.jsgs.JQuery.prototype.Mouseout = function(fn) {
	return this.mouseout(fn);
}
net.coderline.jsgs.JQuery.prototype.Mouseover = function(fn) {
	return this.mouseover(fn);
}
net.coderline.jsgs.JQuery.prototype.Mouseup = function(fn) {
	return this.mouseup(fn);
}
net.coderline.jsgs.JQuery.prototype.Next = function(expr) {
	return this.next(expr);
}
net.coderline.jsgs.JQuery.prototype.NextAll = function(expr) {
	return this.nextAll(expr);
}
net.coderline.jsgs.JQuery.prototype.Not = function(expr) {
	return this.not(expr);
}
net.coderline.jsgs.JQuery.prototype.Offset = function() {
	return this.offset();
}
net.coderline.jsgs.JQuery.prototype.OffsetParent = function(expr) {
	return this.offsetParent(expr);
}
net.coderline.jsgs.JQuery.prototype.One = function(type,fn) {
	return this.one(type,fn);
}
net.coderline.jsgs.JQuery.prototype.OneWithData = function(type,data,fn) {
	return this.one(type,data,fn);
}
net.coderline.jsgs.JQuery.prototype.OuterHeight = function(margin) {
	return this.outerHeight(margin);
}
net.coderline.jsgs.JQuery.prototype.OuterWidth = function(margin) {
	return this.outerWidth(margin);
}
net.coderline.jsgs.JQuery.prototype.Parent = function(expr) {
	return this.parent(expr);
}
net.coderline.jsgs.JQuery.prototype.Parents = function(expr) {
	return this.parents(expr);
}
net.coderline.jsgs.JQuery.prototype.Position = function() {
	return this.position();
}
net.coderline.jsgs.JQuery.prototype.Prepend = function(content) {
	return this.prepend(content);
}
net.coderline.jsgs.JQuery.prototype.PrependTo = function(selector) {
	return this.prependTo(selector);
}
net.coderline.jsgs.JQuery.prototype.Prev = function(expr) {
	return this.prev(expr);
}
net.coderline.jsgs.JQuery.prototype.PrevAll = function(expr) {
	return this.prevAll(expr);
}
net.coderline.jsgs.JQuery.prototype.Progressbar = function(param) {
	return this.progressbar(param);
}
net.coderline.jsgs.JQuery.prototype.ProgressbarOption = function(name,value) {
	return this.progressbar("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Queue = function(name) {
	return this.queue(name);
}
net.coderline.jsgs.JQuery.prototype.QueueCall = function(name,call) {
	return this.queue(name,call);
}
net.coderline.jsgs.JQuery.prototype.QueueReplace = function(name,q) {
	return this.queue(name,q);
}
net.coderline.jsgs.JQuery.prototype.Remove = function(expr) {
	return this.remove(expr);
}
net.coderline.jsgs.JQuery.prototype.RemoveAttr = function(name) {
	return this.removeAttr(name);
}
net.coderline.jsgs.JQuery.prototype.RemoveClass = function(cl) {
	return this.removeClass(cl);
}
net.coderline.jsgs.JQuery.prototype.RemoveData = function(name) {
	return this.removeData(name);
}
net.coderline.jsgs.JQuery.prototype.ReplaceAll = function(selector) {
	return this.replaceAll(selector);
}
net.coderline.jsgs.JQuery.prototype.ReplaceWith = function(content) {
	return this.replaceWith(content);
}
net.coderline.jsgs.JQuery.prototype.Resizable = function(param) {
	return this.resizable(param);
}
net.coderline.jsgs.JQuery.prototype.ResizableOption = function(name,value) {
	return this.resizable("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Resize = function(fn) {
	return this.resize(fn);
}
net.coderline.jsgs.JQuery.prototype.Scroll = function(fn) {
	return this.scroll(fn);
}
net.coderline.jsgs.JQuery.prototype.ScrollLeft = function() {
	return this.scrollLeft();
}
net.coderline.jsgs.JQuery.prototype.ScrollTop = function() {
	return this.scrollTop();
}
net.coderline.jsgs.JQuery.prototype.Select = function() {
	return this.select();
}
net.coderline.jsgs.JQuery.prototype.SelectCall = function(fn) {
	return this.select(fn);
}
net.coderline.jsgs.JQuery.prototype.Selectable = function(param) {
	return this.selectable(param);
}
net.coderline.jsgs.JQuery.prototype.SelectableOption = function(name,value) {
	return this.selectable("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Selector = null;
net.coderline.jsgs.JQuery.prototype.Serialize = function() {
	return this.serialize();
}
net.coderline.jsgs.JQuery.prototype.SerializeArray = function() {
	return this.serializeArray();
}
net.coderline.jsgs.JQuery.prototype.SetAttr = function(prop) {
	return this.attr(prop);
}
net.coderline.jsgs.JQuery.prototype.SetAttrCall = function(name,fn) {
	return this.attr(name,fn);
}
net.coderline.jsgs.JQuery.prototype.SetAttrValue = function(name,value) {
	return this.attr(name,value);
}
net.coderline.jsgs.JQuery.prototype.SetCss = function(prop) {
	return this.css(prop);
}
net.coderline.jsgs.JQuery.prototype.SetCssCall = function(name,call) {
	return this.css(name,call);
}
net.coderline.jsgs.JQuery.prototype.SetCssValue = function(name,value) {
	return this.css(name,value);
}
net.coderline.jsgs.JQuery.prototype.SetData = function(name,value) {
	return this.data(name,value);
}
net.coderline.jsgs.JQuery.prototype.SetHeight = function(value) {
	return this.height(value);
}
net.coderline.jsgs.JQuery.prototype.SetHtml = function(value) {
	return this.html(value);
}
net.coderline.jsgs.JQuery.prototype.SetScrollLeft = function(value) {
	return this.scrollLeft(value);
}
net.coderline.jsgs.JQuery.prototype.SetText = function(value) {
	return this.text(value);
}
net.coderline.jsgs.JQuery.prototype.SetVal = function(value) {
	return this.val(value);
}
net.coderline.jsgs.JQuery.prototype.SetValArray = function(value) {
	return this.val(value);
}
net.coderline.jsgs.JQuery.prototype.SetWidth = function(value) {
	return this.width(value);
}
net.coderline.jsgs.JQuery.prototype.SetscrollTop = function(value) {
	return this.scrollTop(value);
}
net.coderline.jsgs.JQuery.prototype.Show = function(speed,call) {
	return this.show(speed,call);
}
net.coderline.jsgs.JQuery.prototype.Siblings = function(expr) {
	return this.siblings(expr);
}
net.coderline.jsgs.JQuery.prototype.Size = function() {
	return this.size();
}
net.coderline.jsgs.JQuery.prototype.Slice = function(start,end) {
	return this.slice(start,end);
}
net.coderline.jsgs.JQuery.prototype.SlideDown = function(speed,call) {
	return this.slideDown(speed,call);
}
net.coderline.jsgs.JQuery.prototype.SlideToggle = function(speed,call) {
	return this.slideToggle(speed,call);
}
net.coderline.jsgs.JQuery.prototype.SlideUp = function(speed,call) {
	return this.slideUp(speed,call);
}
net.coderline.jsgs.JQuery.prototype.Slider = function(param) {
	return this.slider(param);
}
net.coderline.jsgs.JQuery.prototype.SliderOption = function(name,value) {
	return this.slider("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Sortable = function(param) {
	return this.sortable(param);
}
net.coderline.jsgs.JQuery.prototype.SortableOption = function(name,value) {
	return this.sortable("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Stop = function(clearQueue,gotoEnd) {
	return this.stop(clearQueue,gotoEnd);
}
net.coderline.jsgs.JQuery.prototype.Submit = function() {
	return this.submit();
}
net.coderline.jsgs.JQuery.prototype.SubmitCall = function(fn) {
	return this.submit(fn);
}
net.coderline.jsgs.JQuery.prototype.SwitchClass = function(cl,_switch) {
	return this.toggleClass(cl,_switch);
}
net.coderline.jsgs.JQuery.prototype.Tabs = function(param) {
	return this.tabs(param);
}
net.coderline.jsgs.JQuery.prototype.TabsOption = function(name,value) {
	return this.tabs("option",name,value);
}
net.coderline.jsgs.JQuery.prototype.Text = function() {
	return this.text();
}
net.coderline.jsgs.JQuery.prototype.Toggle = function(speed,call) {
	return this.toggle(speed,call);
}
net.coderline.jsgs.JQuery.prototype.ToggleCall = function(fn1,fn2,fn3,fn4) {
	return this.toggle(fn1,fn2,fn3,fn4);
}
net.coderline.jsgs.JQuery.prototype.ToggleClass = function(cl) {
	return this.toggleClass(cl);
}
net.coderline.jsgs.JQuery.prototype.ToggleTo = function(to) {
	return this.toggle(to);
}
net.coderline.jsgs.JQuery.prototype.Trigger = function(event,data) {
	return this.trigger(event,data);
}
net.coderline.jsgs.JQuery.prototype.TriggerHandler = function(event,data) {
	return this.triggerHandler(event,data);
}
net.coderline.jsgs.JQuery.prototype.Unbind = function(type,fn) {
	return this.unbind(type,fn);
}
net.coderline.jsgs.JQuery.prototype.Unload = function(fn) {
	return this.unload(fn);
}
net.coderline.jsgs.JQuery.prototype.Val = function() {
	return this.val();
}
net.coderline.jsgs.JQuery.prototype.ValArray = function() {
	return this.val();
}
net.coderline.jsgs.JQuery.prototype.Width = function() {
	return this.width();
}
net.coderline.jsgs.JQuery.prototype.Wrap = function(content) {
	return this.wrap(content);
}
net.coderline.jsgs.JQuery.prototype.WrapAll = function(content) {
	return this.wrapAll(content);
}
net.coderline.jsgs.JQuery.prototype.WrapAllElement = function(el) {
	return this.wrapAll(el);
}
net.coderline.jsgs.JQuery.prototype.WrapElement = function(el) {
	return this.wrap(el);
}
net.coderline.jsgs.JQuery.prototype.WrapInner = function(content) {
	return this.wrapInner(content);
}
net.coderline.jsgs.JQuery.prototype.WrapInnerElement = function(el) {
	return this.wrapInner(el);
}
net.coderline.jsgs.JQuery.prototype.getContext = function() {
	return this.context();
}
net.coderline.jsgs.JQuery.prototype.getLength = function() {
	return this.length;
}
net.coderline.jsgs.JQuery.prototype.getSelector = function() {
	return this.selector();
}
net.coderline.jsgs.JQuery.prototype.__class__ = net.coderline.jsgs.JQuery;
net.coderline.jsgs.tablature.TrackSpacingPositions = { __ename__ : ["net","coderline","jsgs","tablature","TrackSpacingPositions"], __constructs__ : ["Top","Marker","Text","BufferSeparator","RepeatEnding","Chord","ScoreUpLines","ScoreMiddleLines","ScoreDownLines","Tupleto","AccentuatedEffect","HarmonicEffect","TapingEffect","LetRingEffect","PalmMuteEffect","VibratoEffect","FadeIn","Bend","TablatureTopSeparator","Tablature","Lyric","Bottom"] }
net.coderline.jsgs.tablature.TrackSpacingPositions.AccentuatedEffect = ["AccentuatedEffect",10];
net.coderline.jsgs.tablature.TrackSpacingPositions.AccentuatedEffect.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.AccentuatedEffect.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Bend = ["Bend",17];
net.coderline.jsgs.tablature.TrackSpacingPositions.Bend.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Bend.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Bottom = ["Bottom",21];
net.coderline.jsgs.tablature.TrackSpacingPositions.Bottom.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Bottom.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.BufferSeparator = ["BufferSeparator",3];
net.coderline.jsgs.tablature.TrackSpacingPositions.BufferSeparator.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.BufferSeparator.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Chord = ["Chord",5];
net.coderline.jsgs.tablature.TrackSpacingPositions.Chord.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Chord.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.FadeIn = ["FadeIn",16];
net.coderline.jsgs.tablature.TrackSpacingPositions.FadeIn.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.FadeIn.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.HarmonicEffect = ["HarmonicEffect",11];
net.coderline.jsgs.tablature.TrackSpacingPositions.HarmonicEffect.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.HarmonicEffect.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.LetRingEffect = ["LetRingEffect",13];
net.coderline.jsgs.tablature.TrackSpacingPositions.LetRingEffect.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.LetRingEffect.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Lyric = ["Lyric",20];
net.coderline.jsgs.tablature.TrackSpacingPositions.Lyric.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Lyric.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Marker = ["Marker",1];
net.coderline.jsgs.tablature.TrackSpacingPositions.Marker.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Marker.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.PalmMuteEffect = ["PalmMuteEffect",14];
net.coderline.jsgs.tablature.TrackSpacingPositions.PalmMuteEffect.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.PalmMuteEffect.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.RepeatEnding = ["RepeatEnding",4];
net.coderline.jsgs.tablature.TrackSpacingPositions.RepeatEnding.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.RepeatEnding.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreDownLines = ["ScoreDownLines",8];
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreDownLines.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreDownLines.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines = ["ScoreMiddleLines",7];
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreUpLines = ["ScoreUpLines",6];
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreUpLines.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreUpLines.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature = ["Tablature",19];
net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.TablatureTopSeparator = ["TablatureTopSeparator",18];
net.coderline.jsgs.tablature.TrackSpacingPositions.TablatureTopSeparator.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.TablatureTopSeparator.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.TapingEffect = ["TapingEffect",12];
net.coderline.jsgs.tablature.TrackSpacingPositions.TapingEffect.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.TapingEffect.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Text = ["Text",2];
net.coderline.jsgs.tablature.TrackSpacingPositions.Text.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Text.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Top = ["Top",0];
net.coderline.jsgs.tablature.TrackSpacingPositions.Top.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Top.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.Tupleto = ["Tupleto",9];
net.coderline.jsgs.tablature.TrackSpacingPositions.Tupleto.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.Tupleto.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.tablature.TrackSpacingPositions.VibratoEffect = ["VibratoEffect",15];
net.coderline.jsgs.tablature.TrackSpacingPositions.VibratoEffect.toString = $estr;
net.coderline.jsgs.tablature.TrackSpacingPositions.VibratoEffect.__enum__ = net.coderline.jsgs.tablature.TrackSpacingPositions;
net.coderline.jsgs.Main = function() { }
net.coderline.jsgs.Main.__name__ = ["net","coderline","jsgs","Main"];
net.coderline.jsgs.Main.main = function() {
	null;
}
net.coderline.jsgs.Main.prototype.__class__ = net.coderline.jsgs.Main;
net.coderline.jsgs.tablature.PageViewLayout = function(p) { if( p === $_ ) return; {
	net.coderline.jsgs.tablature.ViewLayout.apply(this,[]);
	this.Lines = new Array();
	this.MaximumWidth = 0;
	this.MarginLeft = 0;
	this.MarginRight = 0;
}}
net.coderline.jsgs.tablature.PageViewLayout.__name__ = ["net","coderline","jsgs","tablature","PageViewLayout"];
net.coderline.jsgs.tablature.PageViewLayout.__super__ = net.coderline.jsgs.tablature.ViewLayout;
for(var k in net.coderline.jsgs.tablature.ViewLayout.prototype ) net.coderline.jsgs.tablature.PageViewLayout.prototype[k] = net.coderline.jsgs.tablature.ViewLayout.prototype[k];
net.coderline.jsgs.tablature.PageViewLayout.prototype.GetMaxWidth = function() {
	if(this.MaximumWidth <= 0) {
		this.MaximumWidth = this.Tablature.Width;
	}
	return (this.MaximumWidth - this.MarginLeft) + this.MarginRight;
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.GetSheetWidth = function() {
	return Math.round(795 * this.Scale);
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.GetTempLines = function(track,fromIndex,trackSpacing) {
	var line = new net.coderline.jsgs.tablature.TempLine();
	line.MaxY = 0;
	line.MinY = 0;
	line.TrackSpacing = trackSpacing;
	var measureCount = track.MeasureCount();
	{
		var _g = fromIndex;
		while(_g < measureCount) {
			var i = _g++;
			var measure = track.Measures[i];
			if((line.TempWidth + measure.Width) >= this.GetMaxWidth() && line.Measures.length != 0) {
				line.FullLine = true;
				return line;
			}
			line.TempWidth += measure.Width;
			line.MaxY = (measure.MaxY > line.MaxY?measure.MaxY:line.MaxY);
			line.MinY = (measure.MinY < line.MinY?measure.MinY:line.MinY);
			line.AddMeasure(i);
			measure.RegisterSpacing(this,trackSpacing);
		}
	}
	return line;
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.Init = function(scale) {
	net.coderline.jsgs.tablature.ViewLayout.prototype.Init.apply(this,[scale]);
	this.LayoutSize = new net.coderline.jsgs.model.Size(this.GetSheetWidth() - net.coderline.jsgs.tablature.PageViewLayout.PagePadding.getHorizontal(),this.Height);
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.LayoutSongInfo = function(x,y) {
	var song = this.Tablature.Track.Song;
	var anySongInfo = false;
	if(song.Title != "" && ((song.PageSetup.HeaderAndFooter & 1) != 0)) {
		y += Math.floor(35 * this.Scale);
		anySongInfo = true;
	}
	if(song.Subtitle != "" && ((song.PageSetup.HeaderAndFooter & 2) != 0)) {
		y += Math.floor(20 * this.Scale);
		anySongInfo = true;
	}
	if(song.Artist != "" && ((song.PageSetup.HeaderAndFooter & 4) != 0)) {
		y += Math.floor(20 * this.Scale);
		anySongInfo = true;
	}
	if(song.Album != "" && ((song.PageSetup.HeaderAndFooter & 8) != 0)) {
		y += Math.floor(20 * this.Scale);
		anySongInfo = true;
	}
	if(song.Music != "" && song.Music == song.Words && ((song.PageSetup.HeaderAndFooter & 64) != 0)) {
		y += Math.floor(20 * this.Scale);
		anySongInfo = true;
	}
	else {
		if(song.Music != "" && ((song.PageSetup.HeaderAndFooter & 32) != 0)) {
			y += Math.floor(20 * this.Scale);
			anySongInfo = true;
		}
		if(song.Words != "" && ((song.PageSetup.HeaderAndFooter & 32) != 0)) {
			y += Math.floor(20 * this.Scale);
			anySongInfo = true;
		}
	}
	if(anySongInfo) {
		y += Math.floor(20 * this.Scale);
	}
	return y;
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.Lines = null;
net.coderline.jsgs.tablature.PageViewLayout.prototype.MarginLeft = null;
net.coderline.jsgs.tablature.PageViewLayout.prototype.MarginRight = null;
net.coderline.jsgs.tablature.PageViewLayout.prototype.MaximumWidth = null;
net.coderline.jsgs.tablature.PageViewLayout.prototype.MeasureLine = function(track,line,x,y,spacing) {
	var realX = this.MarginLeft + x;
	var realY = y;
	var width = this.MarginLeft;
	var measureSpacing = 0;
	if(line.FullLine) {
		var diff = this.GetMaxWidth() - line.TempWidth;
		if(diff != 0 && line.Measures.length > 0) {
			measureSpacing = Math.round(diff / line.Measures.length);
		}
	}
	{
		var _g1 = 0, _g = line.Measures.length;
		while(_g1 < _g) {
			var i = _g1++;
			var index = line.Measures[i];
			var currMeasure = track.Measures[index];
			currMeasure.PosX = realX;
			currMeasure.PosY = realY;
			currMeasure.Ts = spacing;
			currMeasure.IsFirstOfLine = i == 0;
			var measureWidth = Math.round(currMeasure.Width + measureSpacing);
			currMeasure.Spacing = measureSpacing;
			realX += measureWidth;
			width += measureWidth;
		}
	}
	this.Width = Math.round(Math.max(this.Width,width));
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.PaintLine = function(track,line,context) {
	var _g1 = 0, _g = line.Measures.length;
	while(_g1 < _g) {
		var i = _g1++;
		var index = line.Measures[i];
		var currentMeasure = track.Measures[index];
		currentMeasure.PaintMeasure(this,context);
		if(track.Song.Lyrics != null && track.Song.Lyrics.TrackChoice == track.Number) {
			var ly = track.Song.Lyrics;
			ly.PaintCurrentNoteBeats(context,this,currentMeasure,currentMeasure.PosX,currentMeasure.PosY);
		}
	}
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.PaintSong = function(ctx,clientArea,x,y) {
	var track = this.Tablature.Track;
	y = Math.round(y + net.coderline.jsgs.tablature.PageViewLayout.PagePadding.Top);
	y = Math.round(this.PaintSongInfo(ctx,clientArea,x,y) + this.FirstMeasureSpacing);
	{
		var _g1 = 0, _g = this.Lines.length;
		while(_g1 < _g) {
			var l = _g1++;
			var line = this.Lines[l];
			this.PaintLine(track,line,ctx);
		}
	}
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.PaintSongInfo = function(ctx,clientArea,x,y) {
	var song = this.Tablature.Track.Song;
	x += net.coderline.jsgs.tablature.PageViewLayout.PagePadding.Left;
	var tX;
	var size;
	var str = "";
	if(song.Title != "" && ((song.PageSetup.HeaderAndFooter & 1) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.Title);
		ctx.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.TitleFont;
		size = ctx.Graphics.measureText(str);
		tX = (clientArea.Width - size.width) / 2;
		ctx.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.TitleFont,tX,y,"top");
		y += Math.floor(35 * this.Scale);
	}
	if(song.Subtitle != "" && ((song.PageSetup.HeaderAndFooter & 2) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.Subtitle);
		ctx.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.SubtitleFont;
		size = ctx.Graphics.measureText(str);
		tX = (clientArea.Width - size.width) / 2;
		ctx.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.SubtitleFont,tX,y,"top");
		y += Math.floor(20 * this.Scale);
	}
	if(song.Artist != "" && ((song.PageSetup.HeaderAndFooter & 4) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.Artist);
		ctx.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.SubtitleFont;
		size = ctx.Graphics.measureText(str);
		tX = (clientArea.Width - size.width) / 2;
		ctx.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.SubtitleFont,tX,y,"top");
		y += Math.floor(20 * this.Scale);
	}
	if(song.Album != "" && ((song.PageSetup.HeaderAndFooter & 8) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.Album);
		ctx.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.SubtitleFont;
		size = ctx.Graphics.measureText(str);
		tX = (clientArea.Width - size.width) / 2;
		ctx.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.SubtitleFont,tX,y,"top");
		y += Math.floor(20 * this.Scale);
	}
	if(song.Music != "" && song.Music == song.Words && ((song.PageSetup.HeaderAndFooter & 64) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.WordsAndMusic);
		ctx.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.WordsFont;
		size = ctx.Graphics.measureText(str);
		tX = ((clientArea.Width - size.width) - net.coderline.jsgs.tablature.PageViewLayout.PagePadding.Right);
		ctx.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.WordsFont,x,y,"top");
		y += Math.floor(20 * this.Scale);
	}
	else {
		if(song.Music != "" && ((song.PageSetup.HeaderAndFooter & 32) != 0)) {
			str = this.ParsePageSetupString(song.PageSetup.Music);
			ctx.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.WordsFont;
			size = ctx.Graphics.measureText(str);
			tX = ((clientArea.Width - size.width) - net.coderline.jsgs.tablature.PageViewLayout.PagePadding.Right);
			ctx.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.WordsFont,tX,y,"top");
		}
		if(song.Words != "" && ((song.PageSetup.HeaderAndFooter & 32) != 0)) {
			str = this.ParsePageSetupString(song.PageSetup.Words);
			ctx.Graphics.font = net.coderline.jsgs.tablature.drawing.DrawingResources.WordsFont;
			ctx.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.coderline.jsgs.tablature.drawing.DrawingResources.WordsFont,x,y,"top");
		}
		y += Math.floor(20 * this.Scale);
	}
	return y;
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.ParsePageSetupString = function(input) {
	var song = this.Tablature.Track.Song;
	input = StringTools.replace(input,"%TITLE%",song.Title);
	input = StringTools.replace(input,"%SUBTITLE%",song.Subtitle);
	input = StringTools.replace(input,"%ARTIST%",song.Artist);
	input = StringTools.replace(input,"%ALBUM%",song.Album);
	input = StringTools.replace(input,"%WORDS%",song.Words);
	input = StringTools.replace(input,"%MUSIC%",song.Music);
	input = StringTools.replace(input,"%WORDSMUSIC%",song.Words);
	input = StringTools.replace(input,"%COPYRIGHT%",song.Copyright);
	return input;
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.PrepareLayout = function(clientArea,x,y) {
	this.Lines = new Array();
	this.MaximumWidth = clientArea.Width;
	this.MarginLeft = net.coderline.jsgs.tablature.PageViewLayout.PagePadding.Left;
	this.MarginRight = net.coderline.jsgs.tablature.PageViewLayout.PagePadding.Right;
	this.Width = 0;
	this.Height = 0;
	var posY = Math.round(y);
	var height = Math.round(this.FirstMeasureSpacing);
	var track = this.Tablature.Track;
	var measureCount = this.Tablature.Track.Measures.length;
	var nextMeasureIndex = 0;
	posY = Math.floor(this.LayoutSongInfo(x,posY) + this.FirstMeasureSpacing);
	height = posY;
	while(measureCount > nextMeasureIndex) {
		var spacing = new net.coderline.jsgs.tablature.TrackSpacing();
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreMiddleLines,Math.round(this.ScoreLineSpacing * 5));
		var line = this.GetTempLines(track,nextMeasureIndex,spacing);
		this.Lines.push(line);
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreUpLines,Math.round(Math.abs(line.MinY)));
		if(line.MaxY + this.MinScoreTabSpacing > this.ScoreSpacing) {
			spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.ScoreDownLines,Math.round(line.MaxY - (this.ScoreLineSpacing * 4)));
		}
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.TablatureTopSeparator,Math.round(this.MinScoreTabSpacing));
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.Tablature,Math.round((track.TabHeight + this.StringSpacing) + 1));
		spacing.Set(net.coderline.jsgs.tablature.TrackSpacingPositions.Lyric,10);
		this.CheckDefaultSpacing(spacing);
		this.MeasureLine(track,line,x,posY,spacing);
		var lineHeight = Math.round(spacing.GetSize());
		posY += Math.round(lineHeight + this.TrackSpacing);
		height += Math.round(lineHeight + this.TrackSpacing);
		nextMeasureIndex = line.LastIndex + 1;
	}
	this.Height = height;
	this.Width = this.GetSheetWidth();
}
net.coderline.jsgs.tablature.PageViewLayout.prototype.__class__ = net.coderline.jsgs.tablature.PageViewLayout;
net.coderline.jsgs.tablature.TempLine = function(p) { if( p === $_ ) return; {
	this.TrackSpacing = null;
	this.TempWidth = 0;
	this.LastIndex = 0;
	this.FullLine = false;
	this.MaxY = 0;
	this.MinY = 0;
	this.Measures = new Array();
}}
net.coderline.jsgs.tablature.TempLine.__name__ = ["net","coderline","jsgs","tablature","TempLine"];
net.coderline.jsgs.tablature.TempLine.prototype.AddMeasure = function(index) {
	this.Measures.push(index);
	this.LastIndex = index;
}
net.coderline.jsgs.tablature.TempLine.prototype.FullLine = null;
net.coderline.jsgs.tablature.TempLine.prototype.LastIndex = null;
net.coderline.jsgs.tablature.TempLine.prototype.MaxY = null;
net.coderline.jsgs.tablature.TempLine.prototype.Measures = null;
net.coderline.jsgs.tablature.TempLine.prototype.MinY = null;
net.coderline.jsgs.tablature.TempLine.prototype.TempWidth = null;
net.coderline.jsgs.tablature.TempLine.prototype.TrackSpacing = null;
net.coderline.jsgs.tablature.TempLine.prototype.__class__ = net.coderline.jsgs.tablature.TempLine;
net.coderline.jsgs.model.PointF = function(x,y) { if( x === $_ ) return; {
	this.X = x;
	this.Y = y;
}}
net.coderline.jsgs.model.PointF.__name__ = ["net","coderline","jsgs","model","PointF"];
net.coderline.jsgs.model.PointF.prototype.X = null;
net.coderline.jsgs.model.PointF.prototype.Y = null;
net.coderline.jsgs.model.PointF.prototype.__class__ = net.coderline.jsgs.model.PointF;
net.coderline.jsgs.model.effects.GsBendTypesConverter = function() { }
net.coderline.jsgs.model.effects.GsBendTypesConverter.__name__ = ["net","coderline","jsgs","model","effects","GsBendTypesConverter"];
net.coderline.jsgs.model.effects.GsBendTypesConverter.FromInt = function(i) {
	switch(i) {
	case 0:{
		return net.coderline.jsgs.model.effects.GsBendTypes.None;
	}break;
	case 1:{
		return net.coderline.jsgs.model.effects.GsBendTypes.Bend;
	}break;
	case 2:{
		return net.coderline.jsgs.model.effects.GsBendTypes.BendRelease;
	}break;
	case 3:{
		return net.coderline.jsgs.model.effects.GsBendTypes.BendReleaseBend;
	}break;
	case 4:{
		return net.coderline.jsgs.model.effects.GsBendTypes.Prebend;
	}break;
	case 5:{
		return net.coderline.jsgs.model.effects.GsBendTypes.PrebendRelease;
	}break;
	case 6:{
		return net.coderline.jsgs.model.effects.GsBendTypes.Dip;
	}break;
	case 7:{
		return net.coderline.jsgs.model.effects.GsBendTypes.Dive;
	}break;
	case 8:{
		return net.coderline.jsgs.model.effects.GsBendTypes.ReleaseUp;
	}break;
	case 9:{
		return net.coderline.jsgs.model.effects.GsBendTypes.InvertedDip;
	}break;
	case 10:{
		return net.coderline.jsgs.model.effects.GsBendTypes.Return;
	}break;
	case 11:{
		return net.coderline.jsgs.model.effects.GsBendTypes.ReleaseDown;
	}break;
	default:{
		return net.coderline.jsgs.model.effects.GsBendTypes.None;
	}break;
	}
}
net.coderline.jsgs.model.effects.GsBendTypesConverter.prototype.__class__ = net.coderline.jsgs.model.effects.GsBendTypesConverter;
net.coderline.jsgs.tablature.model.GsBeatTextImpl = function(p) { if( p === $_ ) return; {
	net.coderline.jsgs.model.GsBeatText.apply(this,[]);
}}
net.coderline.jsgs.tablature.model.GsBeatTextImpl.__name__ = ["net","coderline","jsgs","tablature","model","GsBeatTextImpl"];
net.coderline.jsgs.tablature.model.GsBeatTextImpl.__super__ = net.coderline.jsgs.model.GsBeatText;
for(var k in net.coderline.jsgs.model.GsBeatText.prototype ) net.coderline.jsgs.tablature.model.GsBeatTextImpl.prototype[k] = net.coderline.jsgs.model.GsBeatText.prototype[k];
net.coderline.jsgs.tablature.model.GsBeatTextImpl.prototype.Paint = function(layout,context,x,y) {
	var beat = this.Beat;
	var measure = beat.MeasureImpl();
	var realX = (x + beat.Spacing()) + beat.PosX;
	var realY = y + measure.Ts.Get(net.coderline.jsgs.tablature.TrackSpacingPositions.Text);
	context.Get(net.coderline.jsgs.tablature.drawing.DrawingLayers.Voice1).AddString(this.Value,net.coderline.jsgs.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
}
net.coderline.jsgs.tablature.model.GsBeatTextImpl.prototype.__class__ = net.coderline.jsgs.tablature.model.GsBeatTextImpl;
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
		catch( $e34 ) {
			{
				var e = $e34;
				{
					try {
						return new ActiveXObject("Microsoft.XMLHTTP");
					}
					catch( $e35 ) {
						{
							var e1 = $e35;
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
net.coderline.jsgs.model.effects.GsTremoloBarPoint.SemiToneLength = 1;
net.coderline.jsgs.model.effects.GsTremoloBarPoint.MaxPositionLength = 12;
net.coderline.jsgs.model.effects.GsTremoloBarPoint.MaxValueLength = 12;
net.coderline.jsgs.model.GsLyrics.MaxLineCount = 5;
net.coderline.jsgs.model.GsLyrics.Regex = " ";
net.coderline.jsgs.model.GsBeat.MaxVoices = 2;
net.coderline.jsgs.model.GsHeaderFooterElements.None = 0;
net.coderline.jsgs.model.GsHeaderFooterElements.Title = 1;
net.coderline.jsgs.model.GsHeaderFooterElements.Subtitle = 2;
net.coderline.jsgs.model.GsHeaderFooterElements.Artist = 4;
net.coderline.jsgs.model.GsHeaderFooterElements.Album = 8;
net.coderline.jsgs.model.GsHeaderFooterElements.Words = 16;
net.coderline.jsgs.model.GsHeaderFooterElements.Music = 32;
net.coderline.jsgs.model.GsHeaderFooterElements.WordsAndMusic = 64;
net.coderline.jsgs.model.GsHeaderFooterElements.Copyright = 128;
net.coderline.jsgs.model.GsHeaderFooterElements.PageNumber = 256;
net.coderline.jsgs.model.GsHeaderFooterElements.All = 511;
net.coderline.jsgs.model.effects.GsHarmonicEffect.NaturalFrequencies = (function($this) {
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
net.coderline.jsgs.model.GsColor.Black = new net.coderline.jsgs.model.GsColor(0,0,0);
net.coderline.jsgs.model.GsColor.Red = new net.coderline.jsgs.model.GsColor(255,0,0);
net.coderline.jsgs.model.GsMarker.DefaultColor = new net.coderline.jsgs.model.GsColor(255,0,0);
net.coderline.jsgs.model.GsMarker.DefaultTitle = "Untitled";
net.coderline.jsgs.tablature.drawing.MusicFont.Num1 = "m 2.3558283 14.478528 c 0 -3.869121 0 -7.7382417 0 -11.6073626 C 1.6850716 4.1472391 1.014315 5.4233127 0.3435583 6.6993864 0.23191928 6.5423429 -0.10604336 6.439333 0.06075867 6.2158133 0.82578188 4.1438755 1.5908051 2.0719377 2.3558283 -8.0383301e-8 c 1.0879346 0 2.1758693 0 3.2638039 0 0 4.809816380383301 0 9.6196326803833 0 14.429449080383301 0.1077951 0.725443 1.0036243 0.746673 1.5705522 0.858895 0 0.237219 0 0.474437 0 0.711656 -2.1267895 0 -4.2535789 0 -6.38036838 0 0 -0.220859 0 -0.441717 0 -0.662576 C 1.3353338 15.215366 1.9849267 15.201643 2.3052148 14.697852 l 0.03796 -0.106211 0.012653 -0.113113 0 0 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Num2 = "M 3.8518519 1.1111111 C 3.3212005 1.2055492 2.0979942 1.3696935 2.2716047 2.0679013 2.669571 2.4800025 3.6152816 2.0837478 4.0277778 2.6929012 4.7473311 3.6027515 4.5385783 5.1332314 3.5401235 5.7669753 2.4715938 6.5523809 0.69737717 5.9798821 0.41657021 4.6466049 0.08056126 3.1622487 0.98721862 1.681575 2.2025463 0.88541667 3.4685672 -0.05074007 5.1347901 -0.14719514 6.6331019 0.14236111 8.3505577 0.44395045 10.171957 1.4451403 10.711854 3.2079717 11.087162 4.3587226 10.771688 5.6749029 9.9071665 6.5243056 8.8812935 7.6201246 7.4456873 8.160794 6.2109134 8.9703415 5.2883812 9.4846689 4.4003005 10.073319 3.6898148 10.864583 3.1467046 11.405283 2.7524457 12.064064 2.3209877 12.691358 3.5781645 11.96286 5.151162 11.471963 6.558642 12.080247 c 0.9487942 0.306219 1.6134731 1.07337 2.4228395 1.604938 0.8026505 0.432892 1.8788535 -0.183354 2.0385805 -1.057099 0.136432 -0.37519 -0.0766 -1.045877 0.510802 -0.875 -0.0039 1.342158 -0.223931 2.911218 -1.384066 3.762539 -1.2797677 0.83715 -2.9760745 0.490717 -4.2146269 -0.253906 -1.0674136 -0.686358 -2.2346377 -1.518673 -3.5791618 -1.309751 -0.696536 0.03707 -1.54843473 0.403428 -1.54841825 1.210937 0.0314567 0.512668 -0.25474524 0.64228 -0.69014292 0.56549 C -0.1276423 15.353417 0.24022277 14.471103 0.45900849 13.968943 1.4581028 11.790553 3.3501335 10.235414 4.9608968 8.5254645 6.0232321 7.3706805 7.1877722 6.2598992 7.9414786 4.8680797 8.1753674 4.2405344 7.9880474 3.5259425 7.753219 2.9221161 7.1027089 1.4354876 5.3026813 1.0999458 3.8518519 1.1111111 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Num3 = "M 3.2155158 8.2944785 C 3.2309405 8.0135473 3.0965532 7.6187224 3.5407492 7.7177914 4.4939063 7.4256334 5.4604213 7.0597866 6.2583471 6.4493865 7.1004809 5.7778881 7.293324 4.611226 7.0469806 3.6110046 6.726654 2.0656917 5.232257 0.71393181 3.5975116 0.92216258 2.8915973 0.96932933 2.1521428 1.227227 1.7182145 1.8159509 1.7397609 2.67667 3.0050693 2.047208 3.2960571 2.8393405 3.6678006 3.5309167 3.6940413 4.5105692 3.1546542 5.1241373 2.5493574 5.6777576 1.5847581 5.7126744 0.849519 5.422546 0.00953804 5.03099 -0.05820898 3.9538777 0.02996328 3.1486052 0.12952908 1.8447312 1.1180958 0.72240537 2.3652296 0.37384969 3.5779763 0.01683359 4.8804939 -0.09260661 6.1334121 0.08282209 8.2284594 0.47645379 10.007194 2.4119089 9.9656442 4.5889571 9.9870525 5.5351117 9.7120246 6.560585 8.9013483 7.1321894 8.5544353 7.5053166 7.7015912 7.793743 7.5119629 8.0308426 8.5798463 8.4380846 9.5874007 9.2370078 9.8400621 10.404621 10.244809 11.960966 9.693204 13.702926 8.4525462 14.731859 7.4200455 15.702146 5.9664206 16.117642 4.5701437 15.985046 3.132047 15.915553 1.4837688 15.61919 0.59169095 14.365702 -0.03559453 13.451603 -0.17450915 12.20732 0.19723031 11.16967 0.58453839 10.38451 1.618036 10.329563 2.3762561 10.463574 c 0.7245709 0.09876 1.2111158 0.799856 1.1811525 1.507381 0.048396 0.669488 -0.1849767 1.544601 -0.9537191 1.666986 -0.4367972 0.08484 -1.0080132 -0.03336 -0.6860393 0.572182 0.4250322 0.698248 1.4731985 0.831136 2.2515128 0.828892 C 5.8047364 14.902128 7.1372887 13.370272 7.1831099 11.749641 7.332666 10.641101 6.5959268 9.6191273 5.6380831 9.1360238 4.9026333 8.7510236 4.1332794 8.36348 3.292463 8.3050893 c -0.025649 -0.00354 -0.051298 -0.00707 -0.076947 -0.010611 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Num4 = "M 8.5889571 0 C 7.1913374 2.3253162 5.9025311 4.7249743 4.3205522 6.9332822 3.597506 7.9438957 2.9613238 9.0158992 2.2739494 10.051727 c -0.3244453 0.502185 -0.6488906 1.00437 -0.9733359 1.506555 1.390593 0 2.7811861 0 4.1717791 0 0 -1.7259713 0 -3.4519426 0 -5.1779139 C 6.6503067 5.398773 7.8282209 4.4171779 9.006135 3.4355828 c 0 2.7075664 0 5.4151328 0 8.1226992 0.4989773 0 0.997955 0 1.496932 0 0 0.237219 0 0.474438 0 0.711657 -0.498977 0 -0.9979547 0 -1.496932 0 0.069755 0.797423 -0.1298107 1.72084 0.3209355 2.422546 0.2578004 0.439549 1.1146275 0.336477 1.1759965 0.787252 -0.0466 0.190617 0.136581 0.611019 -0.191393 0.520263 -2.1447914 0 -4.2895823 0 -6.4343732 0 0 -0.237219 0 -0.474437 0 -0.711656 0.5451764 -0.203601 1.4559136 -0.313074 1.4812119 -1.052531 0.052113 -0.654366 0.056376 -1.311719 0.1138809 -1.965874 -1.8241312 0 -3.6482624 0 -5.4723936 0 C 0 12.03272 0 11.795501 0 11.558282 1.6905267 10.369362 2.7709967 8.4849333 3.381141 6.5467731 3.7856852 4.3633467 4.1965245 2.181087 4.6134969 0 5.9386503 0 7.2638037 0 8.5889571 0 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Num5 = "M 0.66461538 0 C 1.7640676 0.31916703 2.91814 0.4515236 4.0577884 0.55 5.573813 0.61431673 7.0992166 0.43380573 8.5661538 0.04923077 8.5914097 0.92074753 8.3653002 1.8762312 7.6176923 2.4111538 7.004211 2.8775693 6.1817557 2.8901508 5.4469231 2.9994231 4.2387741 3.0738407 3.0111916 2.9746633 1.8334615 2.6953846 1.4772731 2.4005566 1.6756117 3.0052802 1.6246154 3.2168802 c 0 1.2661681 0 2.5323363 0 3.7985044 0.8204751 -0.932548 2.0542683 -1.534121 3.3124279 -1.3924759 1.749027 0.03761 3.5543077 1.0038165 4.2247355 2.6785576 C 9.9382625 10.333239 9.2190482 12.718388 7.7252283 14.23494 6.6058416 15.470168 4.9188137 16.14343 3.2553846 15.987692 2.0306114 15.883715 0.67270131 15.283287 0.2523077 14.036923 -0.01758379 13.190177 -0.16331163 12.195069 0.24923077 11.370769 0.7260813 10.530552 1.8744274 10.468536 2.7107692 10.698461 3.5320038 10.904838 3.8732189 11.820484 3.7859615 12.591731 3.795648 13.310634 3.3296848 14.067816 2.56 14.129231 2.1783218 14.27883 1.6070493 14.492822 2.2169231 14.783077 3.2361551 15.47902 4.7990457 15.506884 5.6953846 14.58 6.8935844 13.387502 7.0666029 11.565771 6.9967548 9.962524 6.89274 8.7501025 6.3683376 7.4111715 5.2225 6.8382693 3.9731664 6.2872114 2.3692901 6.7981838 1.6807692 7.9844952 1.5254234 8.1708492 1.1893344 8.0301392 0.95515854 8.0738462 0.62189393 8.1738923 0.64397412 7.9185935 0.66461538 7.6647337 c 0 -2.5549113 0 -5.1098225 0 -7.6647337 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Num6 = "M 7.92988 1.5301374 C 7.5559869 0.84608229 6.7083616 0.49456481 5.9441335 0.52438467 4.821997 0.55635632 4.180382 1.6634534 3.8809179 2.6169155 3.3533512 4.3215839 3.1534367 6.1642279 3.4921307 7.9252792 3.5406113 8.3733919 3.9213656 8.6272992 4.125628 8.1171258 5.0603278 7.0709153 6.654335 6.7183222 7.9720267 7.1395109 9.4191407 7.7106546 10.22689 9.2876967 10.369411 10.771524 10.529983 12.368401 9.9773228 14.106414 8.6302977 15.063323 6.8137672 16.443503 3.9581271 16.306063 2.3905508 14.600309 0.90254943 12.970312 0.18775848 10.752828 0.03648959 8.5800181 -0.1773569 6.2799857 0.55665134 3.9259143 2.0300215 2.1484486 3.0352587 0.85536773 4.5975951 -0.10930661 6.2827484 0.00997444 7.5902069 0.01696655 8.9720911 0.64096552 9.5353936 1.8807668 9.9836728 2.8234987 10.179798 4.128801 9.3816087 4.9503119 8.9646729 5.4804244 8.2580505 5.690183 7.6134678 5.5031683 6.9048476 5.4011517 6.3130121 4.82181 6.2520876 4.0983439 6.0817012 3.2806124 6.3336309 2.3308365 7.090215 1.889994 7.3408178 1.7142707 7.6235708 1.5721737 7.92988 1.5301374 z M 7.7084299 11.716844 C 7.6679383 10.660175 7.7582383 9.5050561 7.1932507 8.5627174 6.585394 7.5030184 4.7228008 7.5919113 4.3129571 8.7807073 3.8445509 10.136359 3.8232319 11.613568 3.9810703 13.026659 c 0.1408184 0.823248 0.3103785 1.871627 1.1974071 2.203881 0.722315 0.291011 1.6289517 -0.0069 1.9432634 -0.744415 0.412795 -0.858626 0.5675261 -1.823355 0.5866891 -2.769281 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Num7 = "M 2.9693252 16 C 3.1532893 14.655062 3.240787 13.267919 3.8390529 12.024468 4.3294304 10.821189 5.193962 9.8314715 6.1384442 8.9609615 7.3554376 7.6918646 8.6353226 6.4030996 9.3819019 4.7868099 9.5897661 4.2502898 9.6584092 3.6741287 9.791411 3.1165644 8.6948725 3.8306278 7.3387823 4.3876891 6.0219277 3.9922115 4.9536919 3.7526408 4.0641386 3.087013 3.0807132 2.6493482 2.3752938 2.3539968 1.3443658 2.3825371 0.97699389 3.1748466 0.78309631 3.5775363 0.61689229 3.962209 0.11726996 3.8282209 -0.13228775 3.8478321 0.06047461 3.4251232 0 3.2556513 0 2.3422133 0 1.4287754 0 0.51533742 0.37538796 0.44664274 0.6262713 0.5604332 0.68865031 0.97085892 0.87810702 1.6996251 1.755153 1.4796269 2.1890337 1.1154141 2.915997 0.66646707 3.6429874 0.10267072 4.5153374 0 5.4794752 -0.03302655 6.3042625 0.5166409 7.0736196 1.0230061 7.7329805 1.3679637 8.7015933 1.698475 9.3052147 1.0782209 9.7465474 0.83655774 9.4658822 -0.07950541 10.00953 0 10.276056 -0.03294332 10.502294 -0.02559777 10.404908 0.30537045 10.383694 1.5803197 10.45765 2.8595317 10.344014 4.1306796 10.241904 5.1211015 9.878361 6.0628984 9.3309529 6.8910564 8.720114 7.9810152 8.0129936 9.0186885 7.452454 10.134969 6.9087647 11.476459 6.762224 12.947146 6.7314753 14.38195 6.6762784 14.879015 7.0361266 15.762035 6.6939406 16 5.4524021 16 4.2108637 16 2.9693252 16 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Num8 = "M 6.9745634 7.1814105 C 7.9649315 7.5871248 8.6055147 8.5117861 9.2309659 9.336311 9.7107933 9.9798462 9.8761433 10.795764 9.7566446 11.581836 9.6623395 13.11096 8.8118018 14.577783 7.4605007 15.326645 5.4750396 16.479674 2.6434127 16.15192 1.149077 14.343225 0.26232886 13.301049 -0.09953695 11.867402 0.02324993 10.521073 0.2951153 9.3874085 1.2109099 8.502254 2.1966623 7.9428087 2.8909882 7.7520474 1.7553921 7.4722414 1.6122842 7.1258748 0.1048995 5.629006 -0.10022649 2.8566707 1.4992603 1.3493917 3.2881361 -0.4039854 6.5121414 -0.4971344 8.265503 1.3555417 9.0925896 2.2257537 9.4252555 3.4943687 9.3119795 4.6698699 9.0412829 5.6459042 8.2519053 6.3997765 7.4349504 6.9504969 7.2878699 7.039373 7.1341738 7.1175779 6.9745634 7.1814135 z M 6.16004 6.5396648 C 7.3433435 5.9974508 8.0855736 4.6110218 7.8137694 3.3247657 7.6619806 2.0976617 6.7158553 0.95015864 5.4474766 0.80765364 4.3731519 0.59796663 3.1804319 1.0205957 2.610191 1.9865097 2.2178771 2.5807967 2.0716074 3.4816427 2.6628342 4.0019927 3.6851153 5.0357923 5.1306293 5.5090665 6.16004 6.5396648 z M 3.173454 8.4402195 C 2.1911908 8.8982684 1.3077853 9.7792024 1.2586299 10.919272 1.1104106 12.721786 2.3200357 14.689058 4.1698666 15.01351 5.3209336 15.209497 6.7288823 15.00791 7.403808 13.942303 7.8254111 13.370441 7.9018402 12.538432 7.42608 11.972811 6.3452458 10.420376 4.5134069 9.7156751 3.173454 8.4402195 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Num9 = "m 2.4615385 14.473846 c 0.2864835 0.650421 1.0887783 0.942481 1.7573077 1.006443 1.104573 0.10007 1.9307359 -0.867427 2.2403846 -1.83375 0.5521265 -1.736437 0.693236 -3.611735 0.426923 -5.4126928 C 6.8687374 7.7863498 6.4743914 7.2641267 6.2188461 7.8842308 5.2442243 8.9831213 3.5276506 9.3371835 2.1824038 8.7747116 0.98895445 8.1873467 0.32203527 6.8764784 0.07399039 5.619399 -0.22033757 3.9130274 0.30095529 1.9728831 1.7614423 0.93526443 3.5513076 -0.41608683 6.3294807 -0.31446565 7.9267128 1.3021334 9.7383121 3.0942704 10.396345 5.7397328 10.387692 8.2215385 10.410273 10.82919 9.1651358 13.418233 7.1238461 15.036539 5.6941193 16.16333 3.5645264 16.332099 1.9932933 15.406346 0.83188724 14.656839 0.1866876 13.115169 0.54673077 11.771442 0.84784324 10.851867 1.8631956 10.239532 2.81625 10.480192 c 0.7185837 0.08751 1.2784521 0.706831 1.3268269 1.424424 0.187828 0.860923 -0.1643626 1.801902 -0.92 2.273845 -0.2253906 0.156733 -0.4862338 0.270032 -0.7615384 0.295385 z M 2.6830769 4.2830769 C 2.7272056 5.3816137 2.6224997 6.6047234 3.2758654 7.5556731 3.937337 8.5290248 5.6655873 8.3180176 6.0277885 7.1771154 6.5429067 5.7242407 6.6053836 4.1279192 6.3638461 2.6138461 6.2328538 1.7264685 5.6653344 0.7119112 4.6653846 0.66932692 3.8382452 0.54822073 3.1355372 1.2164061 2.9846154 1.9946154 2.7573964 2.7341678 2.684141 3.5122204 2.6830769 4.2830769 z";
net.coderline.jsgs.tablature.drawing.MusicFont.TrebleClef = "m 12.585366 0 c 2.695627 1.2923663 2.975076 5.1473116 3.470275 7.7942073 0.217542 4.8275937 -1.464124 9.9418447 -5.323934 13.0350607 0.317073 1.609756 0.634147 3.219513 0.95122 4.829269 3.430763 -0.813854 7.182478 1.038565 8.413872 4.385289 1.629669 3.61078 0.972551 8.597733 -2.852897 10.54154 -2.100136 0.437691 -2.903792 1.246753 -2.10233 3.233735 0.272417 2.375118 1.266536 4.747884 0.805836 7.135167 -1.188184 3.632741 -6.6983424 5.587477 -9.3864324 2.387195 C 3.2319864 51.015649 5.7424169 45.055421 9.8048785 46.713415 13.446455 47.851875 11.747229 53.835809 8.097561 53 c 2.303477 2.549378 6.273465 0.66665 7.159679 -2.211509 0.424671 -2.48254 -0.553262 -4.95062 -0.835109 -7.418926 C 14.636918 40.513523 11.146219 42.776886 9.4161582 41.934737 2.9425964 41.14269 -2.1258003 33.514161 0.89557926 27.403963 2.8464232 23.287517 5.9293107 19.804135 9.195122 16.682927 8.099673 12.709304 7.1884817 8.3606399 8.8363186 4.3898629 9.5491179 2.6574011 10.395671 0.17177823 12.585366 0 z M 11 25.707317 c -0.284553 -1.463415 -0.569106 -2.926829 -0.853659 -4.390244 -3.0830984 3.086815 -6.5003653 6.494866 -7.278963 10.969513 -0.77657 5.00226 4.5217891 9.16193 9.199695 8.835365 2.380311 0.258928 1.527391 -1.629128 1.236674 -3.058845 -0.621575 -3.069815 -1.243149 -6.139631 -1.864723 -9.209447 -3.9497494 0.271628 -6.1539187 6.077531 -2.8818594 8.619283 0.7547816 1.11379 5.3453174 2.81554 1.8269814 1.77096 C 6.9395446 37.881248 4.586369 33.922439 5.9512196 30.29878 6.6996927 28.024213 8.652949 26.220646 11 25.707317 z m 3.780488 -19.02439 c 0.529035 -3.1754228 -3.285242 -3.9151254 -4 -0.829268 -1.7566574 3.0411468 -1.7950129 6.602854 -1.0518295 9.942073 0.9598505 0.42285 3.1706095 -2.30938 3.8123095 -3.667397 0.949096 -1.629556 1.588018 -3.5452256 1.23952 -5.445408 z m -2.536586 22.170732 c 0.747968 3.813008 1.495935 7.626016 2.243903 11.439024 3.915918 -0.615638 5.813025 -5.578268 3.620807 -8.778963 -1.230662 -1.936734 -3.603837 -2.978158 -5.86471 -2.660061 z";
net.coderline.jsgs.tablature.drawing.MusicFont.AltoClef = "M 0 32 C 0 21.38264 0 10.76528 0 0.14792 c 1.3312789 0 2.6625578 0 3.9938367 0 0 10.61736 0 21.23472 0 31.85208 C 2.6625578 32 1.3312789 32 0 32 z m 5.3497689 0 c 0 -10.61736 0 -21.23472 0 -31.85208 0.3948711 0.0923853 1.1664119 -0.1918991 1.3066256 0.1551436 0 10.5656454 0 21.1312914 0 31.6969364 -0.4355419 0 -0.8710837 0 -1.3066256 0 z M 9.3436055 18.169492 C 8.8502726 17.246504 7.3168918 16.43575 7.0464176 15.902542 c 2.1113236 -1.252613 3.5898404 -3.492944 3.9489604 -5.91795 0.150704 1.297078 0.735076 2.784943 2.153408 3.094857 1.390237 0.432916 3.173124 0.18344 3.918529 -1.21562 C 18.23615 9.7117941 18.151312 7.1290589 17.948189 4.7590523 17.782438 3.0560707 16.956047 0.9570681 15.021957 0.72188005 13.913812 0.56898567 11.571117 0.97478003 11.75963 2.2804315 c 1.284516 -0.3045719 2.919879 0.7313796 2.50077 2.1864406 -0.373099 1.9048616 -3.183432 2.0900102 -4.20493 0.6240372 -1.0308571 -1.3437026 0.0354 -3.1600429 1.272438 -3.9425075 2.829602 -1.98548167 7.291634 -1.40115265 9.269646 1.5303345 2.166332 3.0968354 1.37549 7.7714097 -1.59948 10.0755007 -1.75095 1.449873 -4.252951 2.142278 -6.460324 1.501541 -1.250456 -0.784798 -1.404328 1.511111 -2.6517716 1.793529 1.2209176 0.327008 1.4708446 2.764075 2.7118646 1.947611 1.834901 -0.606849 3.928305 -0.162988 5.574634 0.789198 2.669516 1.555684 4.186836 4.783911 3.653481 7.831255 -0.42842 3.081441 -3.385169 5.426336 -6.457169 5.379283 -2.275194 0.133151 -4.928546 -1.053159 -5.5686156 -3.395152 -0.5699102 -2.0151 2.2481806 -3.541258 3.7618446 -2.243644 1.144885 0.734699 1.133611 2.733678 -0.264638 3.179892 -0.661254 0.261272 -2.355349 0.07434 -1.073959 1.029276 1.432803 1.101965 3.860566 1.143447 4.876444 -0.542565 1.229353 -2.052215 1.086192 -4.591152 0.897631 -6.889446 -0.208579 -1.708906 -0.867982 -3.948962 -2.839946 -4.265986 -1.354093 -0.157547 -3.097701 0.136321 -3.593413 1.619896 -0.351677 0.576291 -0.414752 2.413668 -0.605547 0.825405 -0.290162 -1.153964 -0.859844 -2.228254 -1.6149845 -3.144838 z";
net.coderline.jsgs.tablature.drawing.MusicFont.TenorClef = "M 0 32 C 0 21.38264 0 10.76528 0 0.14792 c 1.3312789 0 2.6625578 0 3.9938367 0 0 10.61736 0 21.23472 0 31.85208 C 2.6625578 32 1.3312789 32 0 32 z m 5.3497689 0 c 0 -10.61736 0 -21.23472 0 -31.85208 0.3948711 0.0923853 1.1664119 -0.1918991 1.3066256 0.1551436 0 10.5656454 0 21.1312914 0 31.6969364 -0.4355419 0 -0.8710837 0 -1.3066256 0 z M 9.3436055 18.169492 C 8.8502726 17.246504 7.3168918 16.43575 7.0464176 15.902542 c 2.1113236 -1.252613 3.5898404 -3.492944 3.9489604 -5.91795 0.150704 1.297078 0.735076 2.784943 2.153408 3.094857 1.390237 0.432916 3.173124 0.18344 3.918529 -1.21562 C 18.23615 9.7117941 18.151312 7.1290589 17.948189 4.7590523 17.782438 3.0560707 16.956047 0.9570681 15.021957 0.72188005 13.913812 0.56898567 11.571117 0.97478003 11.75963 2.2804315 c 1.284516 -0.3045719 2.919879 0.7313796 2.50077 2.1864406 -0.373099 1.9048616 -3.183432 2.0900102 -4.20493 0.6240372 -1.0308571 -1.3437026 0.0354 -3.1600429 1.272438 -3.9425075 2.829602 -1.98548167 7.291634 -1.40115265 9.269646 1.5303345 2.166332 3.0968354 1.37549 7.7714097 -1.59948 10.0755007 -1.75095 1.449873 -4.252951 2.142278 -6.460324 1.501541 -1.250456 -0.784798 -1.404328 1.511111 -2.6517716 1.793529 1.2209176 0.327008 1.4708446 2.764075 2.7118646 1.947611 1.834901 -0.606849 3.928305 -0.162988 5.574634 0.789198 2.669516 1.555684 4.186836 4.783911 3.653481 7.831255 -0.42842 3.081441 -3.385169 5.426336 -6.457169 5.379283 -2.275194 0.133151 -4.928546 -1.053159 -5.5686156 -3.395152 -0.5699102 -2.0151 2.2481806 -3.541258 3.7618446 -2.243644 1.144885 0.734699 1.133611 2.733678 -0.264638 3.179892 -0.661254 0.261272 -2.355349 0.07434 -1.073959 1.029276 1.432803 1.101965 3.860566 1.143447 4.876444 -0.542565 1.229353 -2.052215 1.086192 -4.591152 0.897631 -6.889446 -0.208579 -1.708906 -0.867982 -3.948962 -2.839946 -4.265986 -1.354093 -0.157547 -3.097701 0.136321 -3.593413 1.619896 -0.351677 0.576291 -0.414752 2.413668 -0.605547 0.825405 -0.290162 -1.153964 -0.859844 -2.228254 -1.6149845 -3.144838 z";
net.coderline.jsgs.tablature.drawing.MusicFont.BassClef = "M 4.4356558 2.4194491 C 3.4766996 3.1995989 3.4510884 5.3360601 4.9633351 5.4421849 6.0458355 5.7621636 7.6246672 5.5682704 8.0927879 6.8775513 8.4557383 8.004685 8.3608094 9.5247315 7.1827381 10.131442 5.6370652 11.017714 3.4610423 11.094489 2.0300883 9.9428161 0.65206906 8.7621225 0.95596535 6.7221312 1.4159721 5.1773604 2.1035925 3.0463292 3.5981503 0.90221424 5.9008517 0.37656261 c 3.087357 -0.81806907 6.7915573 -0.40673885 9.0900863 1.99890499 2.383303 2.3752518 3.517696 6.2064154 2.024743 9.3526954 -1.508165 3.27691 -4.312095 5.708076 -7.0837306 7.910107 -2.66473 2.006433 -5.5309329 3.778472 -8.5927478 5.109689 -0.49491478 0.46294 -1.67740729 0.213488 -1.19044825 -0.403536 C 3.759719 22.942739 7.0323483 20.654887 9.6302445 17.785646 11.949885 15.125909 12.828687 11.528021 13.004536 8.0792549 13.115976 5.8210489 12.457453 3.2889387 10.450116 1.99957 8.6248507 0.76532704 6.0886012 0.98631495 4.4356558 2.4194491 z M 20.842542 2.5706646 c 1.604098 -0.1125753 2.579523 2.0274979 1.541296 3.2089985 -0.892084 1.1907791 -3.02409 0.8323822 -3.388567 -0.6430595 -0.425847 -1.2382984 0.534394 -2.5827507 1.847271 -2.565939 z m 0 7.0063204 c 1.604098 -0.1125756 2.579523 2.027498 1.541296 3.208998 -0.892084 1.190779 -3.02409 0.832382 -3.388567 -0.643059 -0.431649 -1.227443 0.542905 -2.5914101 1.847271 -2.565939 z";
net.coderline.jsgs.tablature.drawing.MusicFont.TripletFeel8 = "m 24.360792 19.363454 c 2.022631 0 4.045261 0 6.067892 0 0.131899 -0.908458 -1.28161 -0.271509 -1.868619 -0.461059 -1.399758 0 -2.799515 0 -4.199273 0 0 0.153686 0 0.307373 0 0.461059 z m 0 1.858977 c 2.018497 -0.01988 4.06965 0.03961 6.0679 -0.02948 0.163152 -0.943756 -1.236852 -0.304406 -1.803565 -0.490445 -1.421451 0 -2.842902 0 -4.264353 0 1.4e-5 0.172746 -2.7e-5 0.349084 1.8e-5 0.519925 z M 38.013536 5.561905 c -0.0202 5.515981 0.04057 11.035329 -0.03067 16.549187 -0.237408 2.285379 -3.949995 4.188176 -5.230387 1.732245 -0.787674 -2.649537 3.285684 -4.740597 4.889256 -3.147396 0 -5.044804 0 -10.089609 0 -15.1344133 0.123922 1.282e-4 0.248452 -3.18e-4 0.371805 3.773e-4 z m -16.448739 0 c -0.0202 5.515981 0.04057 11.035329 -0.03067 16.549187 -0.230718 2.272567 -3.947114 4.197649 -5.20808 1.732245 -0.749169 -2.469202 3.014714 -4.948566 4.86695 -3.022821 0 -4.402204 0 -8.804408 0 -13.2066126 -2.919923 0 -5.839847 0 -8.75977 0 -0.02028 4.8318516 0.04068 9.6670836 -0.03067 14.4968116 -0.231774 2.279 -3.9593304 4.197027 -5.2229564 1.732245 -0.8053443 -2.64753 3.2825274 -4.741543 4.8818254 -3.147396 0 -5.044804 0 -10.089609 0 -15.1344137 3.167541 5.032e-4 6.337096 -0.00101 9.503379 7.547e-4 z M 1.2195305 18.396741 c -0.1663868 2.256918 0.719255 4.53664 2.6189092 5.84478 C 4.8301354 25.093067 2.0357023 23.404224 1.7881612 22.77495 -0.18491456 20.739653 -0.6325593 17.364166 1.1158879 15.045786 1.6672852 13.935998 3.7237333 12.199101 4.0667515 12.38472 2.0433521 13.749429 1.0245033 15.966439 1.2195305 18.396741 z m 54.6109945 0 c 0.166387 2.256918 -0.719255 4.53664 -2.618909 5.84478 -0.991696 0.851546 1.802737 -0.837297 2.050278 -1.466571 1.973076 -2.035297 2.420722 -5.410784 0.672274 -7.729164 -0.553468 -1.106347 -2.612789 -2.841875 -2.950864 -2.661066 2.023399 1.364709 3.042248 3.581719 2.847221 6.012021 z M 47.204604 5.561905 c 0.161974 2.221772 2.222353 3.3264001 3.456414 4.914174 2.346583 2.491993 1.740209 6.434169 -0.22913 8.946803 0.243619 -1.293542 1.603465 -3.208136 1.072896 -4.957536 -0.394015 -2.259004 -2.247042 -4.046781 -4.359664 -4.7837614 -0.01945 4.1427844 0.03915 8.2887174 -0.02974 12.4295074 -0.20579 2.289475 -3.953079 4.191499 -5.20902 1.732245 -0.748815 -2.477791 3.024607 -4.948109 4.88183 -3.022821 0 -5.086329 0 -10.172659 0 -15.2589883 0.138548 3.771e-4 0.278527 -6.552e-4 0.416418 3.773e-4 z M 39.842827 2.185968 c -0.03088 0.7524982 -1.390199 0.1765588 -1.993194 0.3569432 -0.673497 0.081205 -1.879588 -0.3701837 -1.516658 0.7474477 0.176948 1.1460998 -0.387593 1.3361993 -0.237956 0.08517 -0.20012 -0.9703643 0.103637 -1.436851 1.121172 -1.1895611 0.875545 0 1.751091 0 2.626636 0 z m 9.042348 0 C 48.798192 2.8692292 49.05687 3.8981512 48.7606 4.3721261 48.304147 4.093041 49.032032 2.6296174 48.3832 2.5429112 c -1.081947 0 -2.163895 0 -3.245842 0 0.03088 -0.7524982 1.390199 -0.1765588 1.993194 -0.3569432 0.584874 0 1.169749 0 1.754623 0 z m -7.123821 0.1487104 c 1.279521 -0.027874 2.543826 -2.27750017 0.375497 -2.02232944 -0.978854 0.30167049 0.972698 0.92954444 -0.441516 1.43890344 -2.453832 -0.80386606 3.029862 -3.3145781 2.653763 -0.4721902 -0.359541 1.1460187 -1.495945 0.7245723 -0.520534 1.7548598 0.03287 2.6346214 -5.383461 1.2557644 -2.647266 -0.297421 1.730854 0.4388304 -1.531576 1.4774311 0.327239 1.5764832 1.319994 -0.076829 2.01635 -1.9205477 0.252817 -1.9783058 z";
net.coderline.jsgs.tablature.drawing.MusicFont.TripletFeel16 = "m 24.3605 19.363474 c 2.022605 0 4.045211 0 6.067816 0 0.119415 -0.891003 -1.288283 -0.254893 -1.868601 -0.446163 -1.399738 0 -2.799477 0 -4.199215 0 0 0.148721 0 0.297442 0 0.446163 z m 0 1.859013 c 2.018401 -0.02006 4.069986 0.03997 6.067812 -0.02975 0.163295 -0.944089 -1.236717 -0.304806 -1.803517 -0.490775 -1.421434 0 -2.842867 0 -4.264301 0 5e-6 0.173506 -9e-6 0.347028 6e-6 0.520525 z M 1.2195122 18.396788 c -0.1675365 2.260902 0.7247902 4.538357 2.6188839 5.856121 0.9918399 0.86044 -1.805886 -0.841404 -2.0502585 -1.474429 -1.97030434 -2.038611 -2.42249349 -5.412472 -0.6722653 -7.732562 0.5513966 -1.10978 2.607828 -2.846643 2.9508337 -2.661061 -2.0233493 1.364684 -3.0422193 3.58168 -2.8471938 6.011931 z m 54.6103508 0 c 0.167537 2.260902 -0.72479 4.538357 -2.618884 5.856121 -0.99184 0.86044 1.805887 -0.841404 2.050259 -1.474429 1.970304 -2.038612 2.422492 -5.412472 0.672265 -7.732562 -0.553466 -1.106339 -2.612773 -2.841833 -2.950834 -2.661061 2.040117 1.39132 3.030063 3.552228 2.847194 6.011931 z M 39.842356 2.1861987 c -0.01376 0.7745677 -1.386388 0.1902631 -1.993174 0.3718025 -0.670196 0.079541 -1.867882 -0.3684084 -1.50177 0.7474403 0.201603 0.990361 -0.406673 1.4991121 -0.252825 0.2098144 -0.09501 -0.8702225 -0.101207 -1.6516369 0.996587 -1.3290572 0.917061 0 1.834121 0 2.751182 0 z m 9.042237 0 c -0.0855 0.6897197 0.169629 1.7200581 -0.124573 2.2010708 -0.456446 -0.2791099 0.271415 -1.7425272 -0.3774 -1.8292683 -1.081932 0 -2.163865 0 -3.245797 0 0.01376 -0.7745677 1.386388 -0.1902631 1.993174 -0.3718025 0.584865 0 1.169731 0 1.754596 0 z m -7.123736 0.148721 c 1.280268 -0.026613 2.542988 -2.28239117 0.375513 -2.01888738 -0.969657 0.3122999 0.969346 0.92721848 -0.441515 1.44910028 -2.455863 -0.81080798 3.021784 -3.3346665 2.653751 -0.486132 -0.365302 1.1421515 -1.495606 0.7327492 -0.520523 1.7697799 0.0075 2.6195798 -5.37937 1.2355508 -2.647243 -0.3123141 1.730703 0.442957 -1.537086 1.4741993 0.327189 1.5913147 1.320262 -0.073394 2.017217 -1.9401167 0.252828 -1.9928614 z m 0.907198 8.5960733 c 0.08698 -0.683281 -0.171685 -1.7121989 0.124573 -2.1861982 1.331666 0 2.663332 0 3.994998 0 0.223401 -0.9738808 -0.141071 -1.3598886 -1.12116 -1.1302796 -2.551127 0 -5.102253 0 -7.653379 0 -0.02029 4.8317748 0.04068 9.6669288 -0.03067 14.4965798 -0.237373 2.285118 -3.949985 4.188412 -5.230331 1.732598 -0.790954 -2.649125 3.29975 -4.753315 4.889203 -3.132456 0 -5.044734 0 -10.089468 0 -15.1342015 3.167757 0 6.335515 0 9.503272 0 -0.01962 5.5109605 0.03938 11.0250935 -0.02974 16.5340575 -0.205755 2.28921 -3.953064 4.191736 -5.208953 1.7326 -0.752693 -2.476928 3.039209 -4.961436 4.881766 -3.007883 0 -3.301606 0 -6.603213 0 -9.904819 -1.37319 10e-7 -2.746385 -3e-6 -4.119571 2e-6 z M 21.564545 5.5770375 c -0.02023 5.5109355 0.04061 11.0252445 -0.03067 16.5340565 -0.230686 2.272307 -3.947104 4.197884 -5.208023 1.732599 -0.753069 -2.468344 3.029382 -4.961931 4.866894 -3.007883 0 -3.380924 0 -6.761848 0 -10.142772 -2.919889 0 -5.839777 0 -8.759666 0 -0.02005 3.80561 0.04036 7.614566 -0.03067 11.418055 -0.231743 2.278736 -3.9593152 4.197263 -5.2228957 1.732601 -0.80863 -2.64712 3.2965927 -4.754259 4.8817667 -3.132455 0 -5.044734 0 -10.089468 0 -15.1342015 3.167757 0 6.335515 0 9.503272 0 z M 21.192742 8.6406901 C 21.494343 7.581786 20.839399 7.4794274 19.947008 7.6145152 c -2.504644 0 -5.009288 0 -7.513932 0 -0.301601 1.0589041 0.353343 1.1612627 1.245734 1.0261749 2.504644 0 5.009288 0 7.513932 0 z";
net.coderline.jsgs.tablature.drawing.MusicFont.TripletFeelNone8 = "m 25.84771 19.3635 c 2.022607 0 4.045213 0 6.06782 0 0.131935 -0.908503 -1.281579 -0.271557 -1.868603 -0.4611 -1.399739 0 -2.799478 0 -4.199217 0 0 0.1537 0 0.3074 0 0.4611 z m 0 1.859 c 2.018322 -0.02023 4.070339 0.04031 6.06777 -0.03 0.163331 -0.944305 -1.236674 -0.305084 -1.80353 -0.491 -1.421433 0 -2.842867 0 -4.2643 0 5e-5 0.173665 -9.1e-5 0.347341 6e-5 0.521 z M 48.78049 5.5622 c -0.0202 5.515877 0.04057 11.035121 -0.03067 16.548875 -0.230692 2.272627 -3.947107 4.19764 -5.208029 1.732125 -0.749146 -2.469168 3.014669 -4.9484 4.866903 -3.0228 0 -4.402133 0 -8.804267 0 -13.2064 -2.91989 0 -5.83978 0 -8.75967 0 -0.02029 4.831773 0.04068 9.666926 -0.03067 14.496575 -0.231746 2.279057 -3.959316 4.197017 -5.222899 1.732125 -0.805322 -2.647497 3.282474 -4.74138 4.881773 -3.147374 0 -5.044708 0 -10.089417 0 -15.134126 3.167423 6.668e-4 6.337514 -0.00133 9.50327 10e-4 z M 1.21951 18.3968 C 1.0531152 20.653705 1.9388048 22.933386 3.8383994 24.241552 4.8300922 25.093096 2.0357155 23.40421 1.7881408 22.774978 -0.18490567 20.739719 -0.63256079 17.364259 1.1158755 15.045922 1.6672789 13.936149 3.7236923 12.199255 4.0667088 12.384866 2.0266 13.776196 1.0366444 15.937092 1.21951 18.3968 z m 54.61035 0 c 0.166396 2.256904 -0.719281 4.536587 -2.618879 5.844752 -0.991694 0.851544 1.802679 -0.837346 2.050256 -1.466574 1.97305 -2.035257 2.420703 -5.41072 0.672268 -7.729056 -0.553475 -1.10633 -2.612764 -2.841855 -2.950834 -2.661056 2.040114 1.39133 3.030056 3.552225 2.847189 6.011934 z M 12.43308 5.5622 c -0.0202 5.515877 0.04057 11.035121 -0.03067 16.548875 -0.23738 2.285437 -3.9499871 4.188166 -5.2303335 1.732125 -0.7876645 -2.649501 3.2856295 -4.740437 4.8891975 -3.147374 0 -5.044708 0 -10.089417 0 -15.134126 0.123916 1.697e-4 0.24865 -4.211e-4 0.37181 5e-4 z m 9.19095 0 c 0.16201 2.221706 2.222357 3.3262863 3.456373 4.914037 2.346575 2.492009 1.740135 6.434094 -0.229123 8.946763 0.243543 -1.293627 1.603432 -3.208132 1.0729 -4.957569 -0.394021 -2.259005 -2.247056 -4.046695 -4.35964 -4.783731 -0.01945 4.14274 0.03915 8.288629 -0.02974 12.429375 -0.205748 2.289532 -3.95306 4.191489 -5.208948 1.732125 -0.748804 -2.477754 3.024547 -4.947947 4.881762 -3.0228 0 -5.086233 0 -10.172467 0 -15.2587 0.138462 4.996e-4 0.27883 -8.681e-4 0.41642 5e-4 z m -7.36169 -3.376 c -0.03093 0.7524317 -1.390197 0.1765205 -1.993177 0.3569 -0.670194 0.07954 -1.867877 -0.3684079 -1.501763 0.7474413 0.201604 0.9903532 -0.406674 1.4991723 -0.25283 0.2098439 -0.09982 -0.8700807 -0.09437 -1.6348816 0.996588 -1.3141852 0.917061 0 1.834121 0 2.751182 0 z m 9.04224 0 c -0.08698 0.6832816 0.171685 1.7122006 -0.124574 2.1862 -0.456451 -0.2791168 0.271409 -1.7425447 -0.377403 -1.8293 -1.081931 0 -2.163862 0 -3.245793 0 0.03093 -0.7524317 1.390197 -0.1765205 1.993177 -0.3569 0.584864 0 1.169729 0 1.754593 0 z m -7.12374 0.1487 c 1.279581 -0.028817 2.54369 -2.27766025 0.375433 -2.02275 -0.97882 0.3016842 0.972648 0.9294892 -0.441552 1.4388875 -2.453815 -0.80381885 3.029633 -3.3145594 2.653739 -0.4722375 -0.359547 1.1460326 -1.495903 0.7246004 -0.52052 1.7549 0.03303 2.6345723 -5.383369 1.25568 -2.64723 -0.2974 1.730848 0.43888 -1.531577 1.4772997 0.32722 1.5764 1.319885 -0.076261 2.01639 -1.9212787 0.25291 -1.9778 z";
net.coderline.jsgs.tablature.drawing.MusicFont.TripletFeelNone16 = "m 24.3605 19.3635 c 2.022605 0 4.045211 0 6.067816 0 0.119446 -0.891047 -1.288268 -0.254934 -1.868603 -0.4462 -1.399738 0 -2.799475 0 -4.199213 0 0 0.148733 0 0.297467 0 0.4462 z m 0 1.859 c 2.01834 -0.02023 4.070343 0.04031 6.067812 -0.03 0.163336 -0.944306 -1.236667 -0.305084 -1.80352 -0.491 -1.421432 0 -2.842865 0 -4.264298 0 5e-6 0.173667 -9e-6 0.347333 6e-6 0.521 z M 1.2195122 18.3968 C 1.051969 20.657694 1.944314 22.935126 3.8383961 24.252883 4.8302378 25.113326 2.0325102 23.411493 1.7881376 22.778469 -0.1821642 20.739865 -0.63436172 17.366003 1.1158723 15.045922 1.6672758 13.93615 3.7236914 12.199258 4.066706 12.384866 2.0433625 13.749561 1.0244866 15.966542 1.2195122 18.3968 z m 54.6103508 0 c 0.167544 2.260895 -0.724802 4.538326 -2.618884 5.856083 -0.991842 0.860443 1.805886 -0.84139 2.050259 -1.474414 1.970301 -2.038605 2.422498 -5.412466 0.672265 -7.732547 -0.553473 -1.106331 -2.612764 -2.841854 -2.950834 -2.661056 2.023344 1.364695 3.04222 3.581676 2.847194 6.011934 z M 14.262344 2.1862 c -0.01376 0.7745643 -1.38639 0.1902606 -1.993177 0.3718 -0.670195 0.079541 -1.86788 -0.3684083 -1.501767 0.7474412 0.201601 0.9903503 -0.406668 1.4991728 -0.252825 0.209844 -0.095 -0.8702238 -0.10122 -1.6516687 0.996588 -1.3290852 0.917061 0 1.834121 0 2.751181 0 z m 9.042237 0 c -0.08549 0.6897321 0.169625 1.7200742 -0.124574 2.2011 -0.488149 -0.2523741 0.264365 -1.7454124 -0.392271 -1.8293 -1.076975 0 -2.15395 0 -3.230925 0 0.01376 -0.7745643 1.38639 -0.1902606 1.993177 -0.3718 0.584864 0 1.169729 0 1.754593 0 z m -7.123736 0.1487 c 1.280345 -0.026994 2.542946 -2.28250073 0.375514 -2.019025 -0.969636 0.3122556 0.969343 0.9271996 -0.441515 1.4490375 -2.455872 -0.81079353 3.021822 -3.3346493 2.65374 -0.4861125 -0.365337 1.1421138 -1.495604 0.7327511 -0.520523 1.7698 0.0074 2.6195445 -5.379365 1.2355215 -2.647224 -0.3123 1.730694 0.4429613 -1.537097 1.4741348 0.327189 1.5913 1.320961 -0.073328 2.016547 -1.9408696 0.252819 -1.9927 z M 47.144557 5.577 c -0.02023 5.510942 0.04061 11.025256 -0.03067 16.534075 -0.23069 2.272625 -3.947104 4.197641 -5.208023 1.732125 -0.753075 -2.468364 3.029341 -4.961816 4.866894 -3.0079 0 -3.380933 0 -6.761867 0 -10.1428 -2.919889 0 -5.839778 0 -8.759667 0 -0.02005 3.805616 0.04036 7.614579 -0.03067 11.418075 -0.23187 2.278801 -3.959176 4.197781 -5.222895 1.732625 -0.808639 -2.647139 3.296555 -4.754146 4.881767 -3.132474 0 -5.044742 0 -10.089484 0 -15.134226 3.167591 3.334e-4 6.336515 -6.668e-4 9.503272 5e-4 z m -0.371803 3.0637 c 0.301592 -1.0589041 -0.353325 -1.1612988 -1.245735 -1.0262 -2.504644 0 -5.009288 0 -7.513932 0 -0.301592 1.0589041 0.353325 1.1612988 1.245735 1.0262 2.504644 0 5.009288 0 7.513932 0 z M 17.088043 10.931 c 0.08698 -0.683282 -0.171685 -1.7122006 0.124574 -2.1862 1.331666 0 2.663332 0 3.994998 0 0.223394 -0.973881 -0.14106 -1.3599148 -1.121162 -1.1303 -2.551126 0 -5.102251 0 -7.653377 0 -0.02028 4.831773 0.04068 9.666926 -0.03067 14.496575 -0.23738 2.285437 -3.9499843 4.188166 -5.2303318 1.732125 -0.7909643 -2.649144 3.2997118 -4.753201 4.8892028 -3.132474 0 -5.044742 0 -10.089484 0 -15.134226 3.167757 0 6.335515 0 9.503272 0 -0.01962 5.510967 0.03938 11.025105 -0.02974 16.534075 -0.205882 2.289273 -3.952927 4.192255 -5.208953 1.732625 -0.752699 -2.476948 3.039169 -4.961321 4.881767 -3.0079 0 -3.3016 0 -6.6032 0 -9.9048 -1.373025 3.32e-4 -2.74738 -6.65e-4 -4.119572 5e-4 z";
net.coderline.jsgs.tablature.drawing.MusicFont.KeySharp = "m 3.1131687 3.970165 c 0 -1.323388 0 -2.646777 0 -3.970165 0.2157065 0 0.4314129 0 0.6471194 0 0 1.24177 0 2.483539 0 3.725309 0.3089849 -0.134088 0.6179698 -0.268176 0.9269547 -0.402264 0 0.787037 0 1.574074 0 2.361111 C 4.3782579 5.818244 4.069273 5.952332 3.7602881 6.08642 c 0 1.265089 0 2.530178 0 3.795267 0.3089849 -0.1457477 0.6179698 -0.2914953 0.9269547 -0.437243 0 0.787037 0 1.574075 0 2.361112 -0.3089849 0.134088 -0.6179698 0.268175 -0.9269547 0.402263 0 1.288409 0 2.576818 0 3.865226 -0.2157065 0 -0.4314129 0 -0.6471194 0 0 -1.20679 0 -2.41358 0 -3.62037 -0.5130315 0.215706 -1.0260631 0.431413 -1.5390946 0.647119 0 1.300069 0 2.600137 0 3.900206 -0.2157065 0 -0.4314129 0 -0.64711937 0 0 -1.21845 0 -2.4369 0 -3.65535 C 0.61796982 13.467078 0.30898491 13.589506 0 13.711934 0 12.924897 0 12.13786 0 11.350823 c 0.30898491 -0.122428 0.61796982 -0.244856 0.92695473 -0.367284 0 -1.265089 0 -2.530178 0 -3.795267 C 0.61796982 7.3223597 0.30898491 7.4564473 0 7.590535 0 6.791838 0 5.993141 0 5.194444 0.30898491 5.072016 0.61796982 4.949588 0.92695473 4.82716 c 0 -1.288409 0 -2.576817 0 -3.865226 0.21570647 0 0.43141287 0 0.64711937 0 0 1.20679 0 2.413581 0 3.620371 C 2.0871056 4.378258 2.6001372 4.174212 3.1131687 3.970165 z M 1.5740741 6.943416 c 0 1.265089 0 2.530178 0 3.795267 0.5130315 -0.215706 1.0260631 -0.431413 1.5390946 -0.647119 0 -1.2534293 0 -2.5068587 0 -3.760288 -0.5130315 0.204047 -1.0260631 0.408093 -1.5390946 0.61214 z";
net.coderline.jsgs.tablature.drawing.MusicFont.KeyNormal = "M 0 12.445067 C 0 8.2967113 0 4.1483557 0 0 c 0.23505232 0 0.47010463 0 0.70515695 0 0 1.867713 0 3.735426 0 5.603139 C 1.8359492 5.2918537 2.9667414 4.9805683 4.0975336 4.669283 c 0 4.110239 0 8.220478 0 12.330717 -0.2223468 0 -0.4446935 0 -0.6670403 0 0 -1.829596 0 -3.659193 0 -5.488789 C 2.2869955 11.822496 1.1434978 12.133782 0 12.445067 z M 0.70515695 10.367713 C 1.6136024 10.119955 2.5220479 9.8721973 3.4304933 9.6244395 c 0 -1.0100898 0 -2.0201797 0 -3.0302695 -0.9084454 0.247758 -1.8168909 0.4955159 -2.72533635 0.7432739 0 1.0100897 0 2.0201794 0 3.0302691 z";
net.coderline.jsgs.tablature.drawing.MusicFont.KeyFlat = "m 0 2 c 0.21142857 0 0.42285714 0 0.63428571 0 0 2.9257143 0 5.8514287 0 8.777143 0.88296219 -0.500672 1.90751989 -1.0136991 2.94857149 -0.775714 0.9072347 0.241632 1.2869709 1.335393 1.100173 2.182315 -0.3140714 1.24558 -1.3555073 2.136928 -2.3778181 2.829509 C 1.4199016 15.524167 0.70362257 16.26997 0 17 0 12 0 7 0 2 z m 2.64 8.708571 c -0.6225259 -0.36135 -1.300613 0.09747 -1.79558035 0.471563 -0.30893299 0.10446 -0.18729563 0.421112 -0.21013394 0.666036 0 1.283657 0 2.567315 0 3.850973 C 1.1275033 15.182526 1.6674789 14.709702 2.1271206 14.165067 2.677839 13.42137 3.3098706 12.576559 3.2475 11.601072 3.2130643 11.221752 2.969569 10.890184 2.64 10.708571 z";
net.coderline.jsgs.tablature.drawing.MusicFont.SilenceHalf = "m 0 4 c 3.2186837 0 6.4373673 0 9.656051 0 0 -1.3333333 0 -2.6666667 0 -4 C 6.4373673 0 3.2186837 0 0 0 0 1.3333333 0 2.6666667 0 4 z";
net.coderline.jsgs.tablature.drawing.MusicFont.SilenceQuarter = "M 2.4016368 0.03538498 C 4.2976717 2.2263729 6.1937067 4.4173609 8.0897416 6.6083488 6.5722002 7.7484034 5.5755292 9.430334 4.7566963 11.107301 c -0.5151471 1.599623 0.2645976 3.286085 1.2865126 4.504094 0.2365344 0.660912 2.0671401 1.257406 1.0318965 1.934721 -1.3146885 0.03055 -2.8398412 -0.367527 -3.9510461 0.548371 -0.7661695 0.840431 -0.4458677 2.170644 0.2146335 2.973687 0.1408262 0.663097 1.6874453 1.327442 1.092024 1.842154 C 3.3816366 22.685231 2.7364256 21.733733 1.9174364 21.124045 1.0971219 20.273793 0.05340437 19.369679 0.00182697 18.102769 0.00319985 16.766221 1.2055723 15.644499 2.5205671 15.613385 3.6107458 15.481414 4.7494569 15.76878 5.6375364 16.417165 3.9100379 14.200904 2.1825394 11.984644 0.45504094 9.768383 1.9476112 8.5496565 2.861684 6.7784333 3.5529932 5.0171652 3.8798135 3.5296378 2.9249347 2.1961675 2.1725326 1.0071025 1.6182514 0.62810631 1.3516075 -0.35190002 2.4016368 0.03538498 z";
net.coderline.jsgs.tablature.drawing.MusicFont.SilenceEighth = "M 2.1864407 0 C 3.4927555 -0.03025013 4.7599174 1.3666478 4.3168337 2.6645341 4.2612562 3.1806702 3.5323187 3.6396654 3.4744916 3.8917337 4.2657039 4.3017923 5.1064047 3.7538578 5.6999425 3.2431823 6.6716661 2.3752646 7.281934 1.1805796 7.9663946 0.10705396 8.4801243 -0.19051179 8.3442598 0.36425826 8.251379 0.6538351 7.1534617 5.4358901 6.0555444 10.217945 4.9576271 15 4.6271186 15 4.2966102 15 3.9661017 15 4.9491525 11.059333 5.9322034 7.1186667 6.9152542 3.178 6.2370282 4.4468133 4.7055684 4.956678 3.3397258 4.8871533 2.4692909 4.8228263 1.5305994 4.6546136 0.83723009 4.0864295 -0.2275626 3.2343118 -0.32682648 1.4031462 0.74434533 0.51516691 1.1386684 0.15994522 1.6633576 0.00606553 2.1864407 0 z";
net.coderline.jsgs.tablature.drawing.MusicFont.SilenceSixteenth = "M 4.584885 12.117196 C 5.9490829 11.589719 6.7750286 10.241796 7.3545307 8.9710744 7.8252548 7.0303695 8.295979 5.0896645 8.7667032 3.1489595 8.0699915 4.4499053 6.5053194 4.9269906 5.1139052 4.8368018 4.5216227 4.9106855 3.9823526 4.6210228 3.4346292 4.4433786 2.3219805 4.0259279 1.6933994 2.7595504 1.9736104 1.6159082 2.2797936 0.01865673 4.5676359 -0.55040248 5.6429354 0.62979189 6.5486293 1.4306774 6.5062901 3.0473521 5.4543914 3.7082934 5.3601736 4.1947432 6.5902889 3.9915981 6.9796687 3.6638144 8.2310267 2.8945592 8.8289192 1.4721131 9.6987952 0.34599192 9.8702457 -0.15495729 10.506632 -0.00324701 10.174966 0.49193259 8.4207695 7.9946217 6.6665731 15.497311 4.9123768 23 4.6016795 23 4.2909821 23 3.9802848 23 4.920774 19.09529 5.8612633 15.190581 6.8017525 11.285871 6.1336212 12.562885 4.6207625 13.09022 3.249722 12.998905 2.0231855 12.956576 0.61204594 12.439057 0.14485213 11.203998 -0.29621556 10.110259 0.24108585 8.692131 1.4123083 8.3454314 2.5449666 7.8981046 3.9217429 8.5548878 4.2794359 9.7180825 4.5742911 10.548564 4.2135812 11.578267 3.4008762 11.966046 c 0.3850056 0.117797 0.7772672 0.289931 1.1840088 0.15115 z";
net.coderline.jsgs.tablature.drawing.MusicFont.SilenceThirtySecond = "M 6.4656427 12.0291 C 8.2882832 11.304325 9.2092671 9.3383691 9.5645931 7.5141929 9.9182977 6.0369486 10.272002 4.5597043 10.625707 3.08246 9.6375205 4.9248821 7.1497124 5.0871792 5.3770715 4.4592281 3.7823927 3.9338223 3.2098554 1.5580994 4.5665168 0.48516125 5.7194161 -0.51887516 7.6112556 0.15343481 8.0746135 1.5517986 8.5985282 2.4292913 7.4822505 3.500006 7.3458973 3.8311419 8.346387 4.3257337 9.3844328 3.4419849 10.00389 2.7116375 c 0.6631 -0.833867 1.129752 -1.90001462 1.816105 -2.6615175 0.559346 -0.12219984 0.04571 0.60715004 0.07267 0.90747302 C 9.5573835 10.971729 7.2221033 20.985864 4.886823 31 4.5684302 30.919951 3.7522964 31.23199 4.0375076 30.676459 4.9471285 26.899906 5.8567494 23.123353 6.7663703 19.3468 5.7687944 21.173722 3.2855618 21.402652 1.5255659 20.673425 0.06973474 20.133036 -0.56238792 18.040523 0.6014551 16.9159 c 1.0822615 -1.126877 3.2198877 -0.655691 3.6557195 0.87125 0.5278405 0.866914 -0.5448822 1.989816 -0.7263667 2.283242 1.1764505 0.474282 2.2904365 -0.588988 2.926416 -1.476376 0.6641209 -0.786577 0.9521446 -1.760823 1.149199 -2.746179 C 7.9779817 14.315958 8.3495406 12.784079 8.7210994 11.2522 7.9561254 12.699001 6.2173866 13.024237 4.722449 12.9313 3.5334626 12.751867 2.126449 12.094087 1.9500303 10.751037 1.5685372 9.3313631 2.8850478 7.9097667 4.3253082 8.1293906 5.8921433 8.209177 6.91519 10.329608 5.7702102 11.5091 c -1.0255544 0.578183 0.1574867 0.674386 0.6954325 0.52 z";
net.coderline.jsgs.tablature.drawing.MusicFont.SilenceSixtyFourth = "M 6.6068922 20.614598 C 8.8465956 19.7284 9.5266324 17.198711 9.9790553 15.058735 10.254911 13.863344 10.530766 12.667953 10.806622 11.472562 9.7339213 13.438227 6.9572405 13.602911 5.1280239 12.695358 3.5126267 11.89366 3.4324867 9.1509793 5.2112503 8.4956217 6.8764876 7.6822011 9.0340327 9.6714507 8.1433788 11.370136 7.4755334 12.006199 7.2193895 12.474486 8.3562464 12.311142 9.9556424 11.865893 11.034363 10.258515 11.431566 8.7154772 11.889062 6.8773234 12.346558 5.0391697 12.804054 3.2010159 11.951019 4.7739191 9.9458511 5.1200029 8.330638 4.846333 6.9502759 4.6199586 5.6081405 3.48737 5.8226438 1.9706251 5.872644 0.05313803 8.645372 -0.70095497 9.7534884 0.80385171 10.949603 1.7389034 9.6620851 3.5203421 9.6158449 3.9692435 11.157577 4.3349239 12.186618 2.714527 12.932095 1.5969447 13.179454 1.2603792 14.260084 -0.61297224 14.237705 0.38225034 11.15633 13.588167 8.0749558 26.794083 4.9935814 40 c -0.523245 0.0072 -1.2335821 0.161798 -0.8082248 -0.578244 0.909611 -3.776528 1.8192219 -7.553055 2.7288329 -11.329583 -1.1227718 2.016867 -4.057345 2.197271 -5.8618563 1.059163 -1.46039679 -0.881849 -1.41023174 -3.418291 0.2792885 -4.010453 1.597466 -0.787265 3.647103 0.921684 3.0089528 2.621625 -0.2891341 0.738574 -1.3721997 1.245366 -0.012804 1.200395 1.473995 -0.283697 2.4218424 -1.648782 3.0745734 -2.890648 C 7.8922513 23.985416 8.4106106 21.905048 8.911622 19.820734 8.0614037 21.388898 6.05988 21.741056 4.449409 21.466003 3.0756744 21.230258 1.7416167 20.102891 1.9558193 18.590272 c 0.04894 -1.910979 2.829527 -2.67608 3.9308448 -1.166797 0.8319829 0.890362 0.6099799 2.482723 -0.4833531 3.06299 0.3919628 0.197843 0.780967 0.296313 1.2035812 0.127866";
net.coderline.jsgs.tablature.drawing.MusicFont.NoteHalf = "M 2.844087 0.88021707 C 4.0884268 0.11588102 5.693226 -0.30035916 7.095106 0.27393326 8.3299585 0.77657393 9.2038283 2.1517752 8.9512861 3.4918559 8.7270834 5.1851112 7.4944056 6.6048771 6.0054383 7.3636833 4.7429039 8.1294245 3.1009628 8.4996357 1.7059893 7.8723589 0.89980859 7.5378881 0.26675706 6.8205708 0.07361363 5.9652591 -0.18352609 4.8542983 0.22576793 3.6909108 0.83299356 2.7641662 1.3489531 1.9947391 2.0459028 1.348979 2.844087 0.88021707 z M 7.9085894 1.4290171 C 7.3584088 0.9759181 6.5938949 1.130825 5.9501567 1.2318813 4.2972532 1.638437 2.7969664 2.6687373 1.8660001 4.0993179 1.3685443 4.8282624 0.94660328 5.6716009 0.94962015 6.5723845 1.0208965 7.1221519 1.7096152 7.2914779 2.1623945 7.1208171 3.5499616 6.7758194 4.8743361 6.1456038 6.0017665 5.2657192 6.8996943 4.4731276 7.6777605 3.4914635 8.0522268 2.3415683 8.132918 2.0379327 8.1466961 1.6692658 7.9085894 1.4290171 z";
net.coderline.jsgs.tablature.drawing.MusicFont.NoteQuarter = "m 2.8511517 0.8719 c 1.2391392 -0.7585 2.8192477 -1.1716 4.219493 -0.6278 1.0488228 0.4404 1.9115522 1.4666 1.927335 2.6383 0.053532 1.6437 -0.9631369 3.1708 -2.2881547 4.0699 -0.9666359 0.6247 -2.0314068 1.1855 -3.207147 1.236 -1.2445117 0.102 -2.61511694 -0.4619 -3.20841614 -1.6043 -0.58168483 -1.1881 -0.23372807 -2.6216 0.45778719 -3.6856 0.52277295 -0.8322 1.24655485 -1.5365 2.09910265 -2.0265 z";
net.coderline.jsgs.tablature.drawing.MusicFont.Harmonic = "M 0 4.582822 C 1.4723926 6.0552147 2.9447853 7.5276073 4.4171779 9 5.2379593 7.9996605 6.10149 7.0095514 7.1776354 6.2754916 7.9691393 5.6560537 8.7606431 5.0366158 9.552147 4.4171779 8.0981593 2.9447853 6.6441717 1.4723926 5.190184 0 4.4042112 1.001327 3.3925518 1.7870792 2.5131327 2.7003451 1.7501999 3.4222041 0.89516613 4.0363242 0 4.582822 z";
net.coderline.jsgs.tablature.drawing.MusicFont.DeadNote = "M 4.9939024 5.570122 C 5.471544 5.7077458 5.8936759 6.1007821 5.9183617 6.6209508 6.0318445 7.4085646 6.0049844 8.2064963 6.0091463 9 7.0060975 9 8.0030488 9 9 9 9 7.9847561 9 6.9695122 9 5.9542683 8.1511133 5.9387206 7.2865887 6.0104137 6.4550305 5.8084985 5.9955449 5.7267361 5.6328215 5.3142717 5.570122 4.8631211 5.5939809 4.5332112 5.4937294 4.1757206 5.6935976 3.8826219 5.8817082 3.4544256 6.3360991 3.2398819 6.7846203 3.2232011 7.5199693 3.1390998 8.2612193 3.1581801 9 3.1554878 9 2.1402439 9 1.125 9 0.1097561 c -0.9969512 0 -1.9939025 0 -2.9908537 0 -0.015548 0.84888673 0.056145 1.7134113 -0.1457698 2.5449695 -0.081762 0.4594856 -0.4942268 0.822209 -0.9453774 0.8849085 -0.3131135 0 -0.6262271 0 -0.9393406 0 C 3.4873584 3.3936922 3.0894055 2.9638377 3.0735727 2.4366068 2.9705344 1.6655067 2.9944281 0.88580309 2.9908537 0.1097561 c -0.9969512 0 -1.99390247 0 -2.9908537 0 C 0 1.125 0 2.1402439 0 3.1554878 0.84888674 3.1710355 1.7134113 3.0993424 2.5449695 3.3012576 3.0044551 3.38302 3.3671785 3.7954844 3.429878 4.246635 3.4060191 4.5765449 3.5062706 4.9340355 3.3064024 5.2271342 3.1182918 5.6553305 2.6639009 5.8698742 2.2153797 5.886555 1.4800307 5.9706563 0.73878067 5.951576 0 5.9542683 0 6.9695122 0 7.9847561 0 9 0.99695123 9 1.9939025 9 2.9908537 9 3.0064014 8.1511133 2.9347083 7.2865887 3.1366235 6.4550305 3.2189858 6.0069799 3.6092091 5.6338699 4.0545618 5.570122 c 0.3131135 0 0.6262271 0 0.9393406 0 z";
net.coderline.jsgs.tablature.drawing.MusicFont.FooterUpEighth = "m 0.19403698 11.856118 c 0 -2.2703863 0 -4.5407727 0 -6.811159 0.47804008 -0.06216 0.87952342 -0.022167 0.82979862 0.6046139 0.2369786 0.9124052 0.3930821 1.8677303 0.9693865 2.644414 0.7708294 1.2011359 1.9906671 2.0007581 2.9390094 3.0469751 1.5366254 1.546658 2.9834513 3.280722 3.6915947 5.377033 0.9007082 2.495341 0.482023 5.261752 -0.4127558 7.69451 C 7.7195648 25.710198 7.0013352 26.906467 6.215493 28.044959 5.5619497 27.638451 6.2064142 27.265141 6.4895103 26.803366 7.595474 25.04341 8.1022645 22.958356 8.1283392 20.893995 7.9783931 18.654885 7.0057908 16.499352 5.4269771 14.903624 4.1153584 13.578305 2.5325271 12.45716 0.76164195 11.856118 c -0.18920166 0 -0.37840331 0 -0.56760497 0 z";
net.coderline.jsgs.tablature.drawing.MusicFont.FooterUpSixteenth = "M 8.0682446 20.522776 C 7.8217556 17.12109 5.4832623 14.179306 2.5615038 12.578728 2.0730097 12.29187 0.90757951 11.579754 1.5878729 12.63632 c 0.7722153 1.690976 2.4046425 2.699085 3.6158979 4.040337 1.0866343 1.164153 2.1824241 2.392975 2.8644738 3.846119 z M 0.77350625 16.912303 c -0.41062341 0.04914 -0.76463634 0.04168 -0.6140317 -0.470403 0 -3.813966 0 -7.6279332 0 -11.4419 0.67659974 -0.1761203 0.91140015 0.2297145 0.94945235 0.8842074 0.2182204 1.1702216 0.6837794 2.2952039 1.5168584 3.1678722 2.0135586 1.9449464 4.2192836 3.8347614 5.4777713 6.3911194 1.0896069 2.095626 1.2936098 4.584216 0.6524105 6.847988 0.6893202 2.061494 0.2941913 4.293619 -0.2958859 6.331117 C 7.9700543 30.19988 7.1649825 31.663821 6.2015811 33 5.3399598 32.464331 6.7384683 31.890455 6.8093299 31.207986 7.7212384 29.504767 8.1391257 27.552668 8.0931938 25.628894 8.0663129 24.871974 7.8851964 24.706443 7.6368889 25.480737 7.2221097 26.282081 6.7337502 27.267693 6.161364 27.823768 5.3606119 27.277123 6.8345522 26.670731 6.8641612 25.968611 7.19824 25.275213 7.5241455 24.56632 7.6998268 23.814048 6.8981621 20.894021 4.5096588 18.648108 1.85136 17.349449 1.5004416 17.184151 1.1405812 17.037742 0.77350625 16.912303 z";
net.coderline.jsgs.tablature.drawing.MusicFont.FooterUpThirtySecond = "M 8.00785 20.3631 C 7.7419634 16.678288 5.0630851 13.56416 1.83109 11.9988 0.45469273 11.270579 2.1734608 13.662872 2.6455794 14.101794 4.6314459 15.983181 6.8010274 17.881197 8.00785 20.3631 z M 0.00162 0 c 0.93381462 -0.28514957 0.8193481 0.80714817 1.0478345 1.4295781 0.2803803 1.7653776 1.6602707 3.0057805 2.9141899 4.1451485 2.227163 2.103278 4.424139 4.5900324 4.9202922 7.7203254 0.1817268 1.250028 0.1620208 2.535402 -0.1365866 3.766448 0.4749419 1.659017 0.402825 3.436541 -0.04508 5.0932 0.7635674 2.363061 0.2282278 4.922938 -0.5760737 7.2049 C 7.6315093 30.660401 6.9255602 31.871352 6.11607 33 5.2395177 32.323568 7.0166057 31.522537 7.0061791 30.625037 7.7616369 28.996812 8.1090137 27.16365 8.0123775 25.37555 7.923342 23.940421 7.3787319 26.082696 6.9868 26.488 6.7838568 27.03295 5.8238689 28.322478 5.8646694 27.283272 6.7313187 26.260303 7.2756986 24.989282 7.63317 23.7076 7.3678156 23.055809 7.0518723 21.189503 6.4830325 22.599275 6.3087575 23.579594 5.2692917 22.837168 6.0683673 22.360512 7.3134713 21.19546 5.4021893 20.071625 4.6991947 19.159158 3.4873657 18.07793 2.0546012 17.143978 0.48449842 16.7249 -0.12640341 16.923316 -0.01099758 16.395425 0 15.971941 0.00107986 10.648501 -0.00215979 5.32074 0.00162 0 z M 7.83374 14.7694 C 7.2127733 11.395336 4.5950189 8.6398347 1.51838 7.2852 2.2984135 8.9467355 3.9111476 9.9461143 5.1081416 11.273887 6.1312597 12.335381 7.0986893 13.507992 7.83374 14.7694 z";
net.coderline.jsgs.tablature.drawing.MusicFont.FooterUpSixtyFourth = "m 8.0712401 20.529024 c -0.2881217 -3.95408 -3.3083449 -7.21635 -6.8430079 -8.722955 0.5413598 2.104476 2.5440517 3.269645 3.9196901 4.797782 1.1053247 1.189878 2.2321528 2.438206 2.9233178 3.925173 z M 7.8957784 14.889182 C 7.2679236 11.484621 4.6342159 8.7149525 1.5290237 7.3443272 2.3532516 9.0764006 4.0487012 10.112751 5.2928348 11.50939 c 0.9627266 1.044692 1.8923445 2.14377 2.6029436 3.379792 z M 0.62664908 21.556728 C -0.03876123 21.752683 -0.07691759 21.321384 0 20.77501 0 13.850007 0 6.9250035 0 0 1.280146 -0.29595564 0.80824039 1.6291127 1.3153756 2.360215 2.1295912 4.3229714 4.0239011 5.4564295 5.3891821 6.9934037 7.427044 9.1356901 9.1502757 11.867561 9.0728995 14.930502 c -0.184992 1.541798 -0.1915414 2.99329 0.071869 4.529302 0.083226 1.476269 -0.6325568 2.863738 -0.064623 4.296462 0.3069137 1.408285 -0.3058183 2.812873 -0.1472625 4.186016 C 9.4726331 31.501512 8.204533 35.138387 6.116095 38 5.2065154 37.289171 7.0325822 36.507954 7.0131823 35.58887 7.7821284 33.880189 8.1811245 31.949135 7.9960421 30.079156 7.4622734 30.998724 6.8342356 32.929252 6.0058321 33.091445 5.7521994 32.270289 7.3400838 31.188397 7.3858427 30.095213 8.0968789 29.160293 7.4168934 27.27583 6.8187253 27.0121 6.6916223 27.620107 5.7968855 28.353875 5.9081259 27.504803 7.3732295 26.46352 5.841675 25.230827 5.0225924 24.331217 3.7885674 23.101671 2.2656072 22.145315 0.62664908 21.556728 z m 7.26912932 3.459103 c 0.1686807 0.543022 0.1070891 -0.399133 0 0 z M 6.4670185 22.860158 c 0.4018703 0.556511 1.4541407 2.234576 1.1248352 0.711247 -0.3410446 -0.71364 -0.4331583 -2.26834 -1.1248352 -0.711247 z M 1.378628 17.145119 c 0.9477571 2.055992 3.0309611 3.193611 4.405343 4.919195 0.7092534 0.999322 1.1584713 -0.970888 0.2647592 -1.32595 C 4.8406226 19.153998 3.2128925 17.917754 1.378628 17.145119 z";
net.coderline.jsgs.tablature.drawing.MusicFont.FooterDownEighth = "m 0 -9.832334 c 0 2.2703864 0 4.5407724 0 6.8111594 0.47804008 0.06216 0.87952342 0.02217 0.82979862 -0.604614 0.23697858 -0.912405 0.39308208 -1.867731 0.96938648 -2.644414 0.7708294 -1.201136 1.9906671 -2.0007584 2.9390094 -3.0469754 1.5366254 -1.546658 2.9834513 -3.280722 3.6915947 -5.377033 0.9007082 -2.495341 0.482023 -5.261752 -0.4127558 -7.69451 -0.4915056 -1.297693 -1.2097352 -2.493962 -1.9955774 -3.632454 -0.6535433 0.406508 -0.00908 0.779818 0.2740173 1.241593 1.1059637 1.759956 1.6127542 3.84501 1.6388289 5.909371 -0.1499461 2.23911 -1.1225484 4.394643 -2.7013621 5.990371 -1.3116187 1.325319 -2.89445 2.446464 -4.66533513 3.047506 -0.18920166 0 -0.37840331 0 -0.56760497 0 z";
net.coderline.jsgs.tablature.drawing.MusicFont.FooterDownSixteenth = "m 7.9441413 -15.563988 c -0.246489 3.401686 -2.5849823 6.34347 -5.5067408 7.944048 -0.4884941 0.286858 -1.65392429 0.998974 -0.9736309 -0.05759 0.7722153 -1.690976 2.4046425 -2.699085 3.6158979 -4.040337 1.0866343 -1.164153 2.1824241 -2.392975 2.8644738 -3.846119 z m -7.29473835 3.610473 c -0.41062341 -0.04914 -0.76463634 -0.04168 -0.6140317 0.470403 0 3.813966 0 7.627933 0 11.44189995 0.67659974 0.1761197 0.91140015 -0.229715 0.94945235 -0.884208 C 1.203044 -2.095641 1.668603 -3.220624 2.501682 -4.093292 c 2.0135586 -1.944946 4.2192836 -3.834761 5.4777713 -6.391119 1.0896069 -2.095626 1.2936098 -4.584216 0.6524105 -6.847988 0.6893202 -2.061494 0.2941913 -4.293619 -0.2958859 -6.331117 -0.4900269 -1.577576 -1.2950987 -3.041517 -2.2585001 -4.377696 -0.8616213 0.535669 0.5368872 1.109545 0.6077488 1.792014 0.9119085 1.703219 1.3297958 3.655318 1.2838639 5.579092 -0.026881 0.75692 -0.2079974 0.922451 -0.4563049 0.148157 -0.4147792 -0.801344 -0.9031387 -1.786956 -1.4755249 -2.343031 -0.8007521 0.546645 0.6731882 1.153037 0.7027972 1.855157 0.3340788 0.693398 0.6599843 1.402291 0.8356656 2.154563 -0.8016647 2.920027 -3.190168 5.16594 -5.8484668 6.464599 -0.3509184 0.165298 -0.7107788 0.311707 -1.07785375 0.437146 z";
net.coderline.jsgs.tablature.drawing.MusicFont.FooterDownThirtySecond = "m 8.00785 -20.40967 c -0.2658866 3.684812 -2.9447649 6.79894 -6.17676 8.3643 -1.37639727 0.728221 0.3423708 -1.664072 0.8144894 -2.102994 1.9858665 -1.881387 4.155448 -3.779403 5.3622706 -6.261306 z M 0.00162 -0.04656966 c 0.93381462 0.28515 0.8193481 -0.807148 1.0478345 -1.42957804 0.2803803 -1.765377 1.6602707 -3.00578 2.9141899 -4.145148 2.227163 -2.103278 4.424139 -4.5900333 4.9202922 -7.7203263 0.1817268 -1.250028 0.1620208 -2.535402 -0.1365866 -3.766448 0.4749419 -1.659017 0.402825 -3.436541 -0.04508 -5.0932 0.7635674 -2.36306 0.2282278 -4.922937 -0.5760737 -7.204899 -0.494687 -1.300801 -1.2006361 -2.511752 -2.0101263 -3.6404 -0.8765523 0.676432 0.9005357 1.477463 0.8901091 2.374963 0.7554578 1.628225 1.1028346 3.461387 1.0061984 5.249487 -0.089035 1.435129 -0.6336456 -0.707146 -1.0255775 -1.11245 -0.2029432 -0.54495 -1.1629311 -1.834478 -1.1221306 -0.795272 0.8666493 1.022969 1.4110292 2.29399 1.7685006 3.575672 -0.2653544 0.651791 -0.5812977 2.518096 -1.1501375 1.108324 -0.174275 -0.980318 -1.2137408 -0.237893 -0.4146652 0.238763 1.245104 1.165052 -0.666178 2.288887 -1.3691726 3.201354 -1.211829 1.081228 -2.6445935 2.01518 -4.21469628 2.434258 -0.61090183 -0.198416 -0.495496 0.329475 -0.48449842 0.752959 0.00107986 5.32344 -0.00215979 10.6512013 0.00162 15.97194134 z M 7.83374 -14.81597 c -0.6209667 3.374064 -3.2387211 6.1295663 -6.31536 7.4842003 0.7800335 -1.661535 2.3927676 -2.660914 3.5897616 -3.9886873 1.0231181 -1.061494 1.9905477 -2.234105 2.7255984 -3.495513 z";
net.coderline.jsgs.tablature.drawing.MusicFont.FooterDownSixtyFourth = "m 8.0712401 -20.559698 c -0.2881217 3.95408 -3.3083449 7.21635 -6.8430079 8.722955 0.5413598 -2.104476 2.5440517 -3.269645 3.9196901 -4.797782 1.1053247 -1.189878 2.2321528 -2.438206 2.9233178 -3.925173 z m -0.1754617 5.639842 c -0.6278548 3.404561 -3.2615625 6.1742288 -6.3667547 7.5448548 0.8242279 -1.732074 2.5196775 -2.7684238 3.7638111 -4.1650628 0.9627266 -1.044692 1.8923445 -2.14377 2.6029436 -3.379792 z M 0.62664908 -21.587402 C -0.03876123 -21.783357 -0.07691759 -21.352058 0 -20.805684 c 0 6.925003 0 13.8500058 0 20.77500981 1.280146 0.295956 0.80824039 -1.62911301 1.3153756 -2.36021501 0.8142156 -1.962757 2.7085255 -3.096215 4.0738065 -4.633189 2.0378619 -2.142286 3.7610936 -4.8741568 3.6837174 -7.9370978 -0.184992 -1.541798 -0.1915414 -2.99329 0.071869 -4.529302 0.083226 -1.476269 -0.6325568 -2.863738 -0.064623 -4.296462 0.3069137 -1.408285 -0.3058183 -2.812873 -0.1472625 -4.186016 0.5397501 -3.55923 -0.72835 -7.196105 -2.816788 -10.057718 -0.9095796 0.710829 0.9164872 1.492046 0.8970873 2.41113 0.7689461 1.708681 1.1679422 3.639735 0.9828598 5.509714 -0.5337687 -0.919568 -1.1618065 -2.850096 -1.99021 -3.012289 -0.2536327 0.821156 1.3342517 1.903048 1.3800106 2.996232 0.7110362 0.93492 0.031051 2.819383 -0.5671174 3.083113 -0.127103 -0.608007 -1.0218398 -1.341775 -0.9105994 -0.492703 1.4651036 1.041283 -0.066451 2.273976 -0.8855335 3.173586 -1.234025 1.229546 -2.7569852 2.185902 -4.39594332 2.774489 z m 7.26912932 -3.459103 c 0.1686807 -0.543022 0.1070891 0.399133 0 0 z m -1.4287599 2.155673 c 0.4018703 -0.556511 1.4541407 -2.234576 1.1248352 -0.711247 -0.3410446 0.71364 -0.4331583 2.26834 -1.1248352 0.711247 z m -5.0883905 5.715039 c 0.9477571 -2.055992 3.0309611 -3.193611 4.405343 -4.919195 0.7092534 -0.999322 1.1584713 0.970888 0.2647592 1.32595 -1.2081076 1.584366 -2.8358377 2.82061 -4.6701022 3.593245 z";
net.coderline.jsgs.tablature.drawing.MusicFont.HammerPullUp = "M 20.158654 7 C 18.720384 5.0897869 16.959259 3.1952764 14.557392 2.5808289 12.07033 1.9123231 9.4379254 1.8872166 6.8990385 2.2463943 5.2521338 2.4762611 3.6424657 3.1161401 2.4270207 4.2751883 1.5171024 5.0870714 0.72865538 6.0249638 0 7 0.96533405 4.5580267 2.9933611 2.6836261 5.210036 1.3629808 7.4904871 0.00880669 10.359562 -0.42856459 12.882209 0.48369183 15.028867 1.2495373 16.938012 2.6237245 18.480957 4.2882363 19.190644 5.0859076 19.78511 5.9963755 20.158654 7 z";
net.coderline.jsgs.tablature.drawing.MusicFont.GraceNote = "";
net.coderline.jsgs.tablature.drawing.MusicFont.GraceDeadNote = "";
net.coderline.jsgs.tablature.drawing.MusicFont.TrillUpEigth = "";
net.coderline.jsgs.tablature.drawing.MusicFont.TrillUpSixteenth = "";
net.coderline.jsgs.tablature.drawing.MusicFont.TrillUpThirtySecond = "";
net.coderline.jsgs.tablature.drawing.MusicFont.TrillDownEigth = "";
net.coderline.jsgs.tablature.drawing.MusicFont.TrillDownSixteenth = "";
net.coderline.jsgs.tablature.drawing.MusicFont.TrillDownThirtySecond = "";
net.coderline.jsgs.tablature.drawing.MusicFont.AccentuatedNote = "";
net.coderline.jsgs.tablature.drawing.MusicFont.HeavyAccentuatedNote = "";
net.coderline.jsgs.tablature.drawing.MusicFont.VibratoLeftRight = "M 11.189664 5.5813955 C 10.10042 6.6529925 9.0866079 7.8051485 7.9314969 8.8066518 7.3487624 9.2967324 6.9841837 8.2593759 6.5479642 7.933765 5.3603051 6.6227434 4.1788808 5.3060572 2.9839103 4.0016785 2.4141734 4.2259972 1.9952232 4.7304065 1.5349527 5.1288 1.0233018 5.6160865 0.51165092 6.103373 0 6.5906595 0.02274972 6.160458 -0.04553929 5.6912893 0.03419799 5.2854802 1.785601 3.626446 3.5133126 1.9409459 5.2808081 0.29990223 5.9337936 -0.41168007 6.3974122 0.74155913 6.9193185 1.1024218 7.9923085 2.214522 8.9943764 3.397406 10.136519 4.4404885 11.34214 3.5295603 12.361477 2.390267 13.467265 1.3582751 13.894892 0.90129843 14.403874 0.54274353 14.87567 0.14014753 c 0.539444 0.2262104 0.808667 0.8228694 1.216989 1.22764897 0.810291 0.9092409 1.559001 1.8768682 2.414167 2.7435845 0.451921 0.7154056 1.076971 0.8743839 1.612628 0.1426133 0.588046 -0.6297642 1.154229 -1.2811423 1.733301 -1.9197948 -0.02227 0.4454016 0.0445 0.9274384 -0.03326 1.3500134 C 20.278271 5.2264473 18.762755 6.7979455 17.205479 8.3219033 16.781477 8.8560595 16.088361 9.2926227 15.653023 8.5089189 14.456919 7.283733 13.392959 5.9331751 12.155046 4.7476565 11.73232 4.8662391 11.53755 5.345741 11.189664 5.5813955 z";
net.coderline.jsgs.model.GsDuration.QuarterTime = 960;
net.coderline.jsgs.model.GsDuration.Whole = 1;
net.coderline.jsgs.model.GsDuration.Half = 2;
net.coderline.jsgs.model.GsDuration.Quarter = 4;
net.coderline.jsgs.model.GsDuration.Eighth = 8;
net.coderline.jsgs.model.GsDuration.Sixteenth = 16;
net.coderline.jsgs.model.GsDuration.ThirtySecond = 32;
net.coderline.jsgs.model.GsDuration.SixtyFourth = 64;
net.coderline.jsgs.model.GsMeasureHeader.DefaultKeySignature = 0;
net.coderline.jsgs.model.GsPageSetup._defaults = null;
net.coderline.jsgs.model.effects.GsTremoloBarEffect.MaxPositionLength = 12;
net.coderline.jsgs.model.effects.GsTremoloBarEffect.MaxValueLength = 12;
net.coderline.jsgs.model.GsMeasure.DefaultClef = net.coderline.jsgs.model.GsMeasureClef.Treble;
js.Lib.onerror = null;
net.coderline.jsgs.file.guitarpro.GpReaderBase.DefaultCharset = "UTF-8";
net.coderline.jsgs.file.guitarpro.GpReaderBase.BendPosition = 60;
net.coderline.jsgs.file.guitarpro.GpReaderBase.BendSemitone = 25;
net.coderline.jsgs.model.effects.GsBendEffect.SemitoneLength = 1;
net.coderline.jsgs.model.effects.GsBendEffect.MaxPositionLength = 12;
net.coderline.jsgs.model.effects.GsBendEffect.MaxValueLength = 12;
haxe.Serializer.USE_CACHE = false;
haxe.Serializer.USE_ENUM_INDEX = false;
haxe.Serializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.Template.splitter = new EReg("(::[A-Za-z0-9_ ()&|!+=/><*.\"-]+::|\\$\\$([A-Za-z0-9_-]+)\\()","");
haxe.Template.expr_splitter = new EReg("(\\(|\\)|[ \\r\\n\\t]*\"[^\"]*\"[ \\r\\n\\t]*|[!+=/><*.&|-]+)","");
haxe.Template.expr_trim = new EReg("^[ ]*([^ ]+)[ ]*$","");
haxe.Template.expr_int = new EReg("^[0-9]+$","");
haxe.Template.expr_float = new EReg("^([+-]?)(?=\\d|,\\d)\\d*(,\\d*)?([Ee]([+-]?\\d+))?$","");
haxe.Template.globals = { }
net.coderline.jsgs.tablature.model.GsChordImpl.MaxFrets = 6;
net.coderline.jsgs.tablature.model.GsMeasureImpl.Natural = 1;
net.coderline.jsgs.tablature.model.GsMeasureImpl.Sharp = 2;
net.coderline.jsgs.tablature.model.GsMeasureImpl.Flat = 3;
net.coderline.jsgs.tablature.model.GsMeasureImpl.KeySignatures = (function($this) {
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
net.coderline.jsgs.tablature.model.GsMeasureImpl.AccidentalSharpNotes = [0,0,1,1,2,3,3,4,4,5,5,6];
net.coderline.jsgs.tablature.model.GsMeasureImpl.AccidentalFlatNotes = [0,1,1,2,2,3,4,4,5,5,6,6];
net.coderline.jsgs.tablature.model.GsMeasureImpl.AccidentalNotes = [false,true,false,true,false,false,true,false,true,false,true,false];
net.coderline.jsgs.tablature.model.GsMeasureImpl.ScoreKeyOffsets = [30,18,22,24];
net.coderline.jsgs.tablature.model.GsMeasureImpl.ScoreKeySharpPositions = [1,4,0,3,6,2,5];
net.coderline.jsgs.tablature.model.GsMeasureImpl.ScoreKeyFlatPositions = [5,2,6,3,0,4,1];
net.coderline.jsgs.tablature.model.GsMeasureImpl.DefaultClefSpacing = 40;
net.coderline.jsgs.tablature.model.GsMeasureImpl.DefaultQuarterSpacing = 30;
net.coderline.jsgs.model.GsTriplet.Normal = new net.coderline.jsgs.model.GsTriplet();
net.coderline.jsgs.model.GsMidiChannel.DefaultPercussionChannel = 9;
net.coderline.jsgs.model.GsMidiChannel.DefaultInstrument = 25;
net.coderline.jsgs.model.GsMidiChannel.DefaultVolume = 127;
net.coderline.jsgs.model.GsMidiChannel.DefaultBalance = 64;
net.coderline.jsgs.model.GsMidiChannel.DefaultChorus = 0;
net.coderline.jsgs.model.GsMidiChannel.DefaultReverb = 0;
net.coderline.jsgs.model.GsMidiChannel.DefaultPhaser = 0;
net.coderline.jsgs.model.GsMidiChannel.DefaultTremolo = 0;
net.coderline.jsgs.model.effects.GsBendPoint.SemiToneLength = 1;
net.coderline.jsgs.model.effects.GsBendPoint.MaxPositionLength = 12;
net.coderline.jsgs.model.effects.GsBendPoint.MaxValueLength = 12;
net.coderline.jsgs.model.GsVelocities.MinVelocity = 15;
net.coderline.jsgs.model.GsVelocities.VelocityIncrement = 16;
net.coderline.jsgs.model.GsVelocities.PianoPianissimo = 15;
net.coderline.jsgs.model.GsVelocities.Pianissimo = 31;
net.coderline.jsgs.model.GsVelocities.Piano = 47;
net.coderline.jsgs.model.GsVelocities.MezzoPiano = 63;
net.coderline.jsgs.model.GsVelocities.MezzoForte = 79;
net.coderline.jsgs.model.GsVelocities.Forte = 95;
net.coderline.jsgs.model.GsVelocities.Fortissimo = 111;
net.coderline.jsgs.model.GsVelocities.ForteFortissimo = 127;
net.coderline.jsgs.model.GsVelocities.Default = 95;
net.coderline.jsgs.tablature.model.BeatGroup.ScoreMiddleKeys = [55,40,40,50];
net.coderline.jsgs.tablature.model.BeatGroup.ScoreSharpPositions = [7,7,6,6,5,4,4,3,3,2,2,1];
net.coderline.jsgs.tablature.model.BeatGroup.ScoreFlatPositions = [7,6,6,5,5,4,3,3,2,2,1,1];
net.coderline.jsgs.tablature.model.BeatGroup.UpOffset = 28;
net.coderline.jsgs.tablature.model.BeatGroup.DownOffset = 35;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.DefaultTimeSignatureSpacing = 30;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.DefaultLeftSpacing = 15;
net.coderline.jsgs.tablature.model.GsMeasureHeaderImpl.DefaultRightSpacing = 15;
net.coderline.jsgs.tablature.PageViewLayout.PagePadding = new net.coderline.jsgs.model.Padding(20,40,20,40);
net.coderline.jsgs.tablature.PageViewLayout.WidthOn100 = 795;
$Main.init = net.coderline.jsgs.Main.main();
