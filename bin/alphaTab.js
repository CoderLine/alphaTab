$estr = function() { return js.Boot.__string_rec(this,''); }
if(typeof net=='undefined') net = {}
if(!net.alphatab) net.alphatab = {}
if(!net.alphatab.tablature) net.alphatab.tablature = {}
if(!net.alphatab.tablature.drawing) net.alphatab.tablature.drawing = {}
net.alphatab.tablature.drawing.TripletFeelPainter = function() { }
net.alphatab.tablature.drawing.TripletFeelPainter.__name__ = ["net","alphatab","tablature","drawing","TripletFeelPainter"];
net.alphatab.tablature.drawing.TripletFeelPainter.PaintTripletFeel16 = function(context,x,y,scale) {
	$s.push("net.alphatab.tablature.drawing.TripletFeelPainter::PaintTripletFeel16");
	var $spos = $s.length;
	y -= Math.floor(3 * scale);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TripletFeel16,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.TripletFeelPainter.PaintTripletFeel8 = function(context,x,y,scale) {
	$s.push("net.alphatab.tablature.drawing.TripletFeelPainter::PaintTripletFeel8");
	var $spos = $s.length;
	y -= Math.floor(3 * scale);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TripletFeel8,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.TripletFeelPainter.PaintTripletFeelNone16 = function(context,x,y,scale) {
	$s.push("net.alphatab.tablature.drawing.TripletFeelPainter::PaintTripletFeelNone16");
	var $spos = $s.length;
	y -= Math.floor(3 * scale);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TripletFeelNone16,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.TripletFeelPainter.PaintTripletFeelNone8 = function(context,x,y,scale) {
	$s.push("net.alphatab.tablature.drawing.TripletFeelPainter::PaintTripletFeelNone8");
	var $spos = $s.length;
	y -= Math.floor(3 * scale);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TripletFeelNone8,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.TripletFeelPainter.prototype.__class__ = net.alphatab.tablature.drawing.TripletFeelPainter;
net.alphatab.tablature.drawing.DrawingLayer = function(color,isFilled,penWidth) { if( color === $_ ) return; {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::new");
	var $spos = $s.length;
	this.Path = new Array();
	this.Color = color;
	this.IsFilled = isFilled;
	this.PenWidth = penWidth;
	this.CurrentPosition = new net.alphatab.model.Point(0,0);
	$s.pop();
}}
net.alphatab.tablature.drawing.DrawingLayer.__name__ = ["net","alphatab","tablature","drawing","DrawingLayer"];
net.alphatab.tablature.drawing.DrawingLayer.prototype.AddArc = function(x,y,w,h,startAngle,sweepAngle) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::AddArc");
	var $spos = $s.length;
	this.Path.push({ Command : "addArc", X : x, Y : y, Width : w, Height : h, StartAngle : startAngle, SweepAngle : sweepAngle});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.AddBezier = function(x1,y1,x2,y2,x3,y3,x4,y4) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::AddBezier");
	var $spos = $s.length;
	this.Path.push({ Command : "addBezier", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3, X4 : x4, Y4 : y4});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.AddCircle = function(x,y,diameter) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::AddCircle");
	var $spos = $s.length;
	this.Path.push({ Command : "addCircle", X : x, Y : y, Radius : diameter / 2});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.AddLine = function(x1,y1,x2,y2) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::AddLine");
	var $spos = $s.length;
	this.Path.push({ Command : "addLine", X1 : (x1) + 0.5, Y1 : (y1) + 0.5, X2 : (x2) + 0.5, Y2 : (y2) + 0.5});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.AddMusicSymbol = function(symbol,x,y,xScale,yScale) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::AddMusicSymbol");
	var $spos = $s.length;
	if(yScale == null) yScale = 0;
	if(yScale == 0) {
		yScale = xScale;
	}
	var painter = new net.alphatab.tablature.drawing.SvgPainter(this,symbol,x,y,xScale,yScale);
	painter.Paint();
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.AddPolygon = function(points) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::AddPolygon");
	var $spos = $s.length;
	this.Path.push({ Command : "addPolygon", Points : points});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.AddRect = function(x,y,w,h) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::AddRect");
	var $spos = $s.length;
	this.Path.push({ Command : "addRect", X : x, Y : y, Width : w, Height : h});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.AddString = function(str,font,x,y,baseline) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::AddString");
	var $spos = $s.length;
	if(baseline == null) baseline = "middle";
	this.Path.push({ Command : "addString", Text : str, Font : font, X : (x) + 0.5, Y : (y) + 0.5, BaseLine : baseline});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.BezierTo = function(x1,y1,x2,y2,x3,y3) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::BezierTo");
	var $spos = $s.length;
	this.Path.push({ Command : "bezierTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.CircleTo = function(diameter) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::CircleTo");
	var $spos = $s.length;
	this.Path.push({ Command : "circleTo", Radius : diameter / 2});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.Clear = function() {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::Clear");
	var $spos = $s.length;
	this.Path = new Array();
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.CloseFigure = function() {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::CloseFigure");
	var $spos = $s.length;
	this.Path.push({ Command : "closeFigure"});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.Color = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype.CurrentPosition = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype.Draw = function(graphics) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::Draw");
	var $spos = $s.length;
	graphics.setTextBaseline("middle");
	graphics.setFillStyle(this.Color.toString());
	graphics.setStrokeStyle(this.Color.toString());
	graphics.setLineWidth(this.PenWidth);
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
				case "circleTo":{
					graphics.arc(this.CurrentPosition.X + elm.Radius,this.CurrentPosition.Y + elm.Radius,elm.Radius,0,Math.PI * 2,true);
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
					graphics.arc(elm.X + elm.Radius,elm.Y + elm.Radius,elm.Radius,0,Math.PI * 2,true);
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
						$e = [];
						while($s.length >= $spos) $e.unshift($s.pop());
						$s.push($e[0]);
						throw err;
					}
				} else throw($e0);
			}
		}
	}
	this.Finish(graphics);
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.Finish = function(graphics) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::Finish");
	var $spos = $s.length;
	if(this.IsFilled) {
		graphics.fill();
	}
	else {
		graphics.stroke();
	}
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.IsFilled = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype.LineTo = function(x,y) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::LineTo");
	var $spos = $s.length;
	this.Path.push({ Command : "lineTo", X : (x) + 0.5, Y : (y) + 0.5});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.MoveTo = function(x,y) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::MoveTo");
	var $spos = $s.length;
	this.Path.push({ Command : "moveTo", X : Math.round(x) + 0.5, Y : Math.round(y) + 0.5});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.Path = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype.PenWidth = null;
net.alphatab.tablature.drawing.DrawingLayer.prototype.QuadraticCurveTo = function(x1,y1,x2,y2) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::QuadraticCurveTo");
	var $spos = $s.length;
	this.Path.push({ Command : "quadraticCurveTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.RectTo = function(w,h) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::RectTo");
	var $spos = $s.length;
	this.Path.push({ Command : "rectTo", Width : w, Height : h});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.StartFigure = function() {
	$s.push("net.alphatab.tablature.drawing.DrawingLayer::StartFigure");
	var $spos = $s.length;
	this.Path.push({ Command : "startFigure"});
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayer.prototype.__class__ = net.alphatab.tablature.drawing.DrawingLayer;
if(!net.alphatab.model) net.alphatab.model = {}
net.alphatab.model.GsTimeSignature = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.GsTimeSignature::new");
	var $spos = $s.length;
	this.Numerator = 4;
	this.Denominator = factory.NewDuration();
	$s.pop();
}}
net.alphatab.model.GsTimeSignature.__name__ = ["net","alphatab","model","GsTimeSignature"];
net.alphatab.model.GsTimeSignature.prototype.Copy = function(timeSignature) {
	$s.push("net.alphatab.model.GsTimeSignature::Copy");
	var $spos = $s.length;
	timeSignature.Numerator = this.Numerator;
	this.Denominator.Copy(timeSignature.Denominator);
	$s.pop();
}
net.alphatab.model.GsTimeSignature.prototype.Denominator = null;
net.alphatab.model.GsTimeSignature.prototype.Numerator = null;
net.alphatab.model.GsTimeSignature.prototype.__class__ = net.alphatab.model.GsTimeSignature;
net.alphatab.model.GsBeatStrokeDirection = { __ename__ : ["net","alphatab","model","GsBeatStrokeDirection"], __constructs__ : ["None","Up","Down"] }
net.alphatab.model.GsBeatStrokeDirection.Down = ["Down",2];
net.alphatab.model.GsBeatStrokeDirection.Down.toString = $estr;
net.alphatab.model.GsBeatStrokeDirection.Down.__enum__ = net.alphatab.model.GsBeatStrokeDirection;
net.alphatab.model.GsBeatStrokeDirection.None = ["None",0];
net.alphatab.model.GsBeatStrokeDirection.None.toString = $estr;
net.alphatab.model.GsBeatStrokeDirection.None.__enum__ = net.alphatab.model.GsBeatStrokeDirection;
net.alphatab.model.GsBeatStrokeDirection.Up = ["Up",1];
net.alphatab.model.GsBeatStrokeDirection.Up.toString = $estr;
net.alphatab.model.GsBeatStrokeDirection.Up.__enum__ = net.alphatab.model.GsBeatStrokeDirection;
net.alphatab.Utils = function() { }
net.alphatab.Utils.__name__ = ["net","alphatab","Utils"];
net.alphatab.Utils.string = function(data) {
	$s.push("net.alphatab.Utils::string");
	var $spos = $s.length;
	{
		var $tmp = new String(data);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.Utils.prototype.__class__ = net.alphatab.Utils;
net.alphatab.model.GsChord = function(length) { if( length === $_ ) return; {
	$s.push("net.alphatab.model.GsChord::new");
	var $spos = $s.length;
	this.Strings = new Array();
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			this.Strings.push(-1);
		}
	}
	$s.pop();
}}
net.alphatab.model.GsChord.__name__ = ["net","alphatab","model","GsChord"];
net.alphatab.model.GsChord.prototype.Beat = null;
net.alphatab.model.GsChord.prototype.FirstFret = null;
net.alphatab.model.GsChord.prototype.Name = null;
net.alphatab.model.GsChord.prototype.NoteCount = function() {
	$s.push("net.alphatab.model.GsChord::NoteCount");
	var $spos = $s.length;
	var count = 0;
	{
		var _g1 = 0, _g = this.Strings.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.Strings[i] >= 0) count++;
		}
	}
	{
		$s.pop();
		return count;
	}
	$s.pop();
}
net.alphatab.model.GsChord.prototype.StringCount = function() {
	$s.push("net.alphatab.model.GsChord::StringCount");
	var $spos = $s.length;
	{
		var $tmp = this.Strings.length;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsChord.prototype.Strings = null;
net.alphatab.model.GsChord.prototype.__class__ = net.alphatab.model.GsChord;
net.alphatab.model.GsMixTableItem = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsMixTableItem::new");
	var $spos = $s.length;
	this.Value = 0;
	this.Duration = 0;
	this.AllTracks = false;
	$s.pop();
}}
net.alphatab.model.GsMixTableItem.__name__ = ["net","alphatab","model","GsMixTableItem"];
net.alphatab.model.GsMixTableItem.prototype.AllTracks = null;
net.alphatab.model.GsMixTableItem.prototype.Duration = null;
net.alphatab.model.GsMixTableItem.prototype.Value = null;
net.alphatab.model.GsMixTableItem.prototype.__class__ = net.alphatab.model.GsMixTableItem;
if(!net.alphatab.model.effects) net.alphatab.model.effects = {}
net.alphatab.model.effects.GsTremoloPickingEffect = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.effects.GsTremoloPickingEffect::new");
	var $spos = $s.length;
	this.Duration = factory.NewDuration();
	$s.pop();
}}
net.alphatab.model.effects.GsTremoloPickingEffect.__name__ = ["net","alphatab","model","effects","GsTremoloPickingEffect"];
net.alphatab.model.effects.GsTremoloPickingEffect.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.effects.GsTremoloPickingEffect::Clone");
	var $spos = $s.length;
	var effect = factory.NewTremoloPickingEffect();
	effect.Duration.Value = this.Duration.Value;
	effect.Duration.IsDotted = this.Duration.IsDotted;
	effect.Duration.IsDoubleDotted = this.Duration.IsDoubleDotted;
	effect.Duration.Triplet.Enters = this.Duration.Triplet.Enters;
	effect.Duration.Triplet.Times = this.Duration.Triplet.Times;
	{
		$s.pop();
		return effect;
	}
	$s.pop();
}
net.alphatab.model.effects.GsTremoloPickingEffect.prototype.Duration = null;
net.alphatab.model.effects.GsTremoloPickingEffect.prototype.__class__ = net.alphatab.model.effects.GsTremoloPickingEffect;
net.alphatab.model.SongManager = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.SongManager::new");
	var $spos = $s.length;
	this.Factory = factory;
	$s.pop();
}}
net.alphatab.model.SongManager.__name__ = ["net","alphatab","model","SongManager"];
net.alphatab.model.SongManager.GetDivisionLength = function(header) {
	$s.push("net.alphatab.model.SongManager::GetDivisionLength");
	var $spos = $s.length;
	var defaulLenght = 960;
	var denominator = header.TimeSignature.Denominator.Value;
	switch(denominator) {
	case 8:{
		if(header.TimeSignature.Numerator % 3 == 0) defaulLenght += Math.floor(960 / 2);
	}break;
	}
	{
		$s.pop();
		return defaulLenght;
	}
	$s.pop();
}
net.alphatab.model.SongManager.GetNextBeat2 = function(beats,currentBeat) {
	$s.push("net.alphatab.model.SongManager::GetNextBeat2");
	var $spos = $s.length;
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
	{
		$s.pop();
		return oNext;
	}
	$s.pop();
}
net.alphatab.model.SongManager.GetNextVoice = function(beats,beat,index) {
	$s.push("net.alphatab.model.SongManager::GetNextVoice");
	var $spos = $s.length;
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
	{
		$s.pop();
		return next;
	}
	$s.pop();
}
net.alphatab.model.SongManager.GetFirstVoice = function(beats,index) {
	$s.push("net.alphatab.model.SongManager::GetFirstVoice");
	var $spos = $s.length;
	var first = null;
	{
		var _g = 0;
		while(_g < beats.length) {
			var current = beats[_g];
			++_g;
			if((first == null || current.Start < first.Beat.Start) && !current.Voices[index].IsEmpty) first = current.Voices[index];
		}
	}
	{
		$s.pop();
		return first;
	}
	$s.pop();
}
net.alphatab.model.SongManager.GetBeat = function(measure,start) {
	$s.push("net.alphatab.model.SongManager::GetBeat");
	var $spos = $s.length;
	{
		var _g = 0, _g1 = measure.Beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			if(beat.Start == start) {
				$s.pop();
				return beat;
			}
		}
	}
	{
		$s.pop();
		return null;
	}
	$s.pop();
}
net.alphatab.model.SongManager.QuickSort = function(elements,left,right) {
	$s.push("net.alphatab.model.SongManager::QuickSort");
	var $spos = $s.length;
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
	if(left < j) net.alphatab.model.SongManager.QuickSort(elements,left,j);
	if(i < right) net.alphatab.model.SongManager.QuickSort(elements,i,right);
	$s.pop();
}
net.alphatab.model.SongManager.prototype.AutoCompleteSilences = function(measure) {
	$s.push("net.alphatab.model.SongManager::AutoCompleteSilences");
	var $spos = $s.length;
	var beat = this.GetFirstBeat(measure.Beats);
	if(beat == null) {
		this.CreateSilences(measure,measure.Start(),measure.Length(),0);
		{
			$s.pop();
			return;
		}
	}
	{
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			var voice = net.alphatab.model.SongManager.GetFirstVoice(measure.Beats,v);
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
					var nextVoice = net.alphatab.model.SongManager.GetNextVoice(measure.Beats,beat,voice.Index);
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
		beat = net.alphatab.model.SongManager.GetNextBeat2(measure.Beats,beat);
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.CreateDurations = function(time) {
	$s.push("net.alphatab.model.SongManager::CreateDurations");
	var $spos = $s.length;
	var durations = new Array();
	var min = this.Factory.NewDuration();
	min.Value = 64;
	min.IsDotted = false;
	min.IsDoubleDotted = false;
	min.Triplet.Enters = 3;
	min.Triplet.Times = 2;
	var missing = time;
	while(missing > min.Time()) {
		var oDuration = net.alphatab.model.GsDuration.FromTime(this.Factory,missing,min,10);
		durations.push(oDuration.Clone(this.Factory));
		missing -= oDuration.Time();
	}
	{
		$s.pop();
		return durations;
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.CreateSilences = function(measure,start,length,voiceIndex) {
	$s.push("net.alphatab.model.SongManager::CreateSilences");
	var $spos = $s.length;
	var nextStart = start;
	var durations = this.CreateDurations(length);
	{
		var _g = 0;
		while(_g < durations.length) {
			var duration = durations[_g];
			++_g;
			var isNew = false;
			var beatStart = this.GetRealStart(measure,nextStart);
			var beat = net.alphatab.model.SongManager.GetBeat(measure,beatStart);
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
	$s.pop();
}
net.alphatab.model.SongManager.prototype.Factory = null;
net.alphatab.model.SongManager.prototype.GetFirstBeat = function(list) {
	$s.push("net.alphatab.model.SongManager::GetFirstBeat");
	var $spos = $s.length;
	{
		var $tmp = (list.length > 0?list[0]:null);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.GetFirstMeasure = function(track) {
	$s.push("net.alphatab.model.SongManager::GetFirstMeasure");
	var $spos = $s.length;
	{
		var $tmp = (track.MeasureCount() > 0?track.Measures[0]:null);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.GetNextBeat = function(beat,voice) {
	$s.push("net.alphatab.model.SongManager::GetNextBeat");
	var $spos = $s.length;
	var nextBeat = net.alphatab.model.SongManager.GetNextBeat2(beat.Measure.Beats,beat);
	if(nextBeat == null && beat.Measure.Track.MeasureCount() > beat.Measure.Number()) {
		var measure = beat.Measure.Track.Measures[beat.Measure.Number()];
		if(measure.BeatCount() > 0) {
			{
				var $tmp = measure.Beats[0];
				$s.pop();
				return $tmp;
			}
		}
	}
	{
		$s.pop();
		return nextBeat;
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.GetNextNote = function(measure,start,voiceIndex,guitarString) {
	$s.push("net.alphatab.model.SongManager::GetNextNote");
	var $spos = $s.length;
	var beat = net.alphatab.model.SongManager.GetBeat(measure,start);
	if(beat != null) {
		var next = net.alphatab.model.SongManager.GetNextBeat2(measure.Beats,beat);
		while(next != null) {
			var voice = next.Voices[voiceIndex];
			if(!voice.IsEmpty) {
				{
					var _g = 0, _g1 = voice.Notes;
					while(_g < _g1.length) {
						var current = _g1[_g];
						++_g;
						if(current.String == guitarString || guitarString == -1) {
							$s.pop();
							return current;
						}
					}
				}
			}
			next = net.alphatab.model.SongManager.GetNextBeat2(measure.Beats,next);
		}
	}
	{
		$s.pop();
		return null;
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.GetPreviousMeasure = function(measure) {
	$s.push("net.alphatab.model.SongManager::GetPreviousMeasure");
	var $spos = $s.length;
	{
		var $tmp = (measure.Number() > 1?measure.Track.Measures[measure.Number() - 2]:null);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.GetPreviousMeasureHeader = function(header) {
	$s.push("net.alphatab.model.SongManager::GetPreviousMeasureHeader");
	var $spos = $s.length;
	var prevIndex = header.Number - 1;
	if(prevIndex > 0) {
		{
			var $tmp = header.Song.MeasureHeaders[prevIndex - 1];
			$s.pop();
			return $tmp;
		}
	}
	{
		$s.pop();
		return null;
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.GetRealStart = function(measure,currentStart) {
	$s.push("net.alphatab.model.SongManager::GetRealStart");
	var $spos = $s.length;
	var beatLength = net.alphatab.model.SongManager.GetDivisionLength(measure.Header);
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
	{
		$s.pop();
		return start;
	}
	$s.pop();
}
net.alphatab.model.SongManager.prototype.OrderBeats = function(measure) {
	$s.push("net.alphatab.model.SongManager::OrderBeats");
	var $spos = $s.length;
	net.alphatab.model.SongManager.QuickSort(measure.Beats,0,measure.BeatCount() - 1);
	$s.pop();
}
net.alphatab.model.SongManager.prototype.__class__ = net.alphatab.model.SongManager;
List = function(p) { if( p === $_ ) return; {
	$s.push("List::new");
	var $spos = $s.length;
	this.length = 0;
	$s.pop();
}}
List.__name__ = ["List"];
List.prototype.add = function(item) {
	$s.push("List::add");
	var $spos = $s.length;
	var x = [item];
	if(this.h == null) this.h = x;
	else this.q[1] = x;
	this.q = x;
	this.length++;
	$s.pop();
}
List.prototype.clear = function() {
	$s.push("List::clear");
	var $spos = $s.length;
	this.h = null;
	this.q = null;
	this.length = 0;
	$s.pop();
}
List.prototype.filter = function(f) {
	$s.push("List::filter");
	var $spos = $s.length;
	var l2 = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		if(f(v)) l2.add(v);
	}
	{
		$s.pop();
		return l2;
	}
	$s.pop();
}
List.prototype.first = function() {
	$s.push("List::first");
	var $spos = $s.length;
	{
		var $tmp = (this.h == null?null:this.h[0]);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
List.prototype.h = null;
List.prototype.isEmpty = function() {
	$s.push("List::isEmpty");
	var $spos = $s.length;
	{
		var $tmp = (this.h == null);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
List.prototype.iterator = function() {
	$s.push("List::iterator");
	var $spos = $s.length;
	{
		var $tmp = { h : this.h, hasNext : function() {
			$s.push("List::iterator@196");
			var $spos = $s.length;
			{
				var $tmp = (this.h != null);
				$s.pop();
				return $tmp;
			}
			$s.pop();
		}, next : function() {
			$s.push("List::iterator@199");
			var $spos = $s.length;
			if(this.h == null) {
				$s.pop();
				return null;
			}
			var x = this.h[0];
			this.h = this.h[1];
			{
				$s.pop();
				return x;
			}
			$s.pop();
		}}
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
List.prototype.join = function(sep) {
	$s.push("List::join");
	var $spos = $s.length;
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	while(l != null) {
		if(first) first = false;
		else s.b[s.b.length] = sep;
		s.b[s.b.length] = l[0];
		l = l[1];
	}
	{
		var $tmp = s.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
List.prototype.last = function() {
	$s.push("List::last");
	var $spos = $s.length;
	{
		var $tmp = (this.q == null?null:this.q[0]);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
List.prototype.length = null;
List.prototype.map = function(f) {
	$s.push("List::map");
	var $spos = $s.length;
	var b = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		b.add(f(v));
	}
	{
		$s.pop();
		return b;
	}
	$s.pop();
}
List.prototype.pop = function() {
	$s.push("List::pop");
	var $spos = $s.length;
	if(this.h == null) {
		$s.pop();
		return null;
	}
	var x = this.h[0];
	this.h = this.h[1];
	if(this.h == null) this.q = null;
	this.length--;
	{
		$s.pop();
		return x;
	}
	$s.pop();
}
List.prototype.push = function(item) {
	$s.push("List::push");
	var $spos = $s.length;
	var x = [item,this.h];
	this.h = x;
	if(this.q == null) this.q = x;
	this.length++;
	$s.pop();
}
List.prototype.q = null;
List.prototype.remove = function(v) {
	$s.push("List::remove");
	var $spos = $s.length;
	var prev = null;
	var l = this.h;
	while(l != null) {
		if(l[0] == v) {
			if(prev == null) this.h = l[1];
			else prev[1] = l[1];
			if(this.q == l) this.q = prev;
			this.length--;
			{
				$s.pop();
				return true;
			}
		}
		prev = l;
		l = l[1];
	}
	{
		$s.pop();
		return false;
	}
	$s.pop();
}
List.prototype.toString = function() {
	$s.push("List::toString");
	var $spos = $s.length;
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
	{
		var $tmp = s.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
List.prototype.__class__ = List;
IntIter = function(min,max) { if( min === $_ ) return; {
	$s.push("IntIter::new");
	var $spos = $s.length;
	this.min = min;
	this.max = max;
	$s.pop();
}}
IntIter.__name__ = ["IntIter"];
IntIter.prototype.hasNext = function() {
	$s.push("IntIter::hasNext");
	var $spos = $s.length;
	{
		var $tmp = this.min < this.max;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
IntIter.prototype.max = null;
IntIter.prototype.min = null;
IntIter.prototype.next = function() {
	$s.push("IntIter::next");
	var $spos = $s.length;
	{
		var $tmp = this.min++;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
IntIter.prototype.__class__ = IntIter;
net.alphatab.Utf8 = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.Utf8::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.Utf8.__name__ = ["net","alphatab","Utf8"];
net.alphatab.Utf8.ToUnicode = function(chr) {
	$s.push("net.alphatab.Utf8::ToUnicode");
	var $spos = $s.length;
	{
		var $tmp = String.fromCharCode(chr);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.Utf8.Decode = function(utftext) {
	$s.push("net.alphatab.Utf8::Decode");
	var $spos = $s.length;
	var string = "";
	var i = 0;
	var c = 0;
	var c1 = 0;
	var c2 = 0;
	var c3 = 0;
	while(i < utftext.length) {
		c = utftext.charCodeAt(i);
		if(c < 128) {
			string += String.fromCharCode(c);
			i++;
		}
		else if((c > 191) && (c < 224)) {
			c2 = utftext.charCodeAt(i + 1);
			string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
			i += 2;
		}
		else {
			c2 = utftext.charCodeAt(i + 1);
			c3 = utftext.charCodeAt(i + 2);
			string += String.fromCharCode((((c & 15) << 12) | ((c2 & 63) << 6)) | (c3 & 63));
			i += 3;
		}
	}
	{
		$s.pop();
		return string;
	}
	$s.pop();
}
net.alphatab.Utf8.prototype.__class__ = net.alphatab.Utf8;
if(!net.alphatab.file) net.alphatab.file = {}
net.alphatab.file.SongLoader = function() { }
net.alphatab.file.SongLoader.__name__ = ["net","alphatab","file","SongLoader"];
net.alphatab.file.SongLoader.LoadSong = function(url,factory,success) {
	$s.push("net.alphatab.file.SongLoader::LoadSong");
	var $spos = $s.length;
	var loader = net.alphatab.platform.PlatformFactory.GetLoader();
	haxe.Log.trace("Load song " + url,{ fileName : "SongLoader.hx", lineNumber : 21, className : "net.alphatab.file.SongLoader", methodName : "LoadSong"});
	loader.LoadBinary("GET",url,function(data) {
		$s.push("net.alphatab.file.SongLoader::LoadSong@24");
		var $spos = $s.length;
		var readers = net.alphatab.file.SongReader.AvailableReaders();
		haxe.Log.trace("Song loaded, search for reader",{ fileName : "SongLoader.hx", lineNumber : 26, className : "net.alphatab.file.SongLoader", methodName : "LoadSong"});
		{
			var _g = 0;
			while(_g < readers.length) {
				var reader = readers[_g];
				++_g;
				try {
					haxe.Log.trace("Try Reader " + Type.getClassName(Type.getClass(reader)),{ fileName : "SongLoader.hx", lineNumber : 31, className : "net.alphatab.file.SongLoader", methodName : "LoadSong"});
					data.seek(0);
					reader.Init(data,factory);
					var song = reader.ReadSong();
					haxe.Log.trace("Reading succeeded",{ fileName : "SongLoader.hx", lineNumber : 35, className : "net.alphatab.file.SongLoader", methodName : "LoadSong"});
					success(song);
					{
						$s.pop();
						return;
					}
				}
				catch( $e1 ) {
					if( js.Boot.__instanceof($e1,net.alphatab.file.FileFormatException) ) {
						var e = $e1;
						{
							$e = [];
							while($s.length >= $spos) $e.unshift($s.pop());
							$s.push($e[0]);
							haxe.Log.trace("Reading failed",{ fileName : "SongLoader.hx", lineNumber : 40, className : "net.alphatab.file.SongLoader", methodName : "LoadSong"});
							continue;
						}
					} else throw($e1);
				}
			}
		}
		throw new net.alphatab.file.FileFormatException("No reader for requested file found");
		$s.pop();
	},function(err) {
		$s.push("net.alphatab.file.SongLoader::LoadSong@47");
		var $spos = $s.length;
		haxe.Log.trace("Error loading file " + err,{ fileName : "SongLoader.hx", lineNumber : 49, className : "net.alphatab.file.SongLoader", methodName : "LoadSong"});
		throw err;
		$s.pop();
	});
	$s.pop();
}
net.alphatab.file.SongLoader.prototype.__class__ = net.alphatab.file.SongLoader;
net.alphatab.Main = function() { }
net.alphatab.Main.__name__ = ["net","alphatab","Main"];
net.alphatab.Main.main = function() {
	$s.push("net.alphatab.Main::main");
	var $spos = $s.length;
	null;
	$s.pop();
}
net.alphatab.Main.prototype.__class__ = net.alphatab.Main;
Hash = function(p) { if( p === $_ ) return; {
	$s.push("Hash::new");
	var $spos = $s.length;
	this.h = {}
	if(this.h.__proto__ != null) {
		this.h.__proto__ = null;
		delete(this.h.__proto__);
	}
	else null;
	$s.pop();
}}
Hash.__name__ = ["Hash"];
Hash.prototype.exists = function(key) {
	$s.push("Hash::exists");
	var $spos = $s.length;
	try {
		key = "$" + key;
		{
			var $tmp = this.hasOwnProperty.call(this.h,key);
			$s.pop();
			return $tmp;
		}
	}
	catch( $e2 ) {
		{
			var e = $e2;
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				
				for(var i in this.h)
					if( i == key ) return true;
			;
				{
					$s.pop();
					return false;
				}
			}
		}
	}
	$s.pop();
}
Hash.prototype.get = function(key) {
	$s.push("Hash::get");
	var $spos = $s.length;
	{
		var $tmp = this.h["$" + key];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Hash.prototype.h = null;
Hash.prototype.iterator = function() {
	$s.push("Hash::iterator");
	var $spos = $s.length;
	{
		var $tmp = { ref : this.h, it : this.keys(), hasNext : function() {
			$s.push("Hash::iterator@214");
			var $spos = $s.length;
			{
				var $tmp = this.it.hasNext();
				$s.pop();
				return $tmp;
			}
			$s.pop();
		}, next : function() {
			$s.push("Hash::iterator@215");
			var $spos = $s.length;
			var i = this.it.next();
			{
				var $tmp = this.ref["$" + i];
				$s.pop();
				return $tmp;
			}
			$s.pop();
		}}
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Hash.prototype.keys = function() {
	$s.push("Hash::keys");
	var $spos = $s.length;
	var a = new Array();
	
			for(var i in this.h)
				a.push(i.substr(1));
		;
	{
		var $tmp = a.iterator();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Hash.prototype.remove = function(key) {
	$s.push("Hash::remove");
	var $spos = $s.length;
	if(!this.exists(key)) {
		$s.pop();
		return false;
	}
	delete(this.h["$" + key]);
	{
		$s.pop();
		return true;
	}
	$s.pop();
}
Hash.prototype.set = function(key,value) {
	$s.push("Hash::set");
	var $spos = $s.length;
	this.h["$" + key] = value;
	$s.pop();
}
Hash.prototype.toString = function() {
	$s.push("Hash::toString");
	var $spos = $s.length;
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
	{
		var $tmp = s.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Hash.prototype.__class__ = Hash;
net.alphatab.model.GsTrack = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.GsTrack::new");
	var $spos = $s.length;
	this.Number = 0;
	this.Offset = 0;
	this.IsSolo = false;
	this.IsMute = false;
	this.Name = "";
	this.Measures = new Array();
	this.Strings = new Array();
	this.Channel = factory.NewMidiChannel();
	this.Color = new net.alphatab.model.GsColor(255,0,0);
	$s.pop();
}}
net.alphatab.model.GsTrack.__name__ = ["net","alphatab","model","GsTrack"];
net.alphatab.model.GsTrack.prototype.AddMeasure = function(measure) {
	$s.push("net.alphatab.model.GsTrack::AddMeasure");
	var $spos = $s.length;
	measure.Track = this;
	this.Measures.push(measure);
	$s.pop();
}
net.alphatab.model.GsTrack.prototype.Channel = null;
net.alphatab.model.GsTrack.prototype.Color = null;
net.alphatab.model.GsTrack.prototype.FretCount = null;
net.alphatab.model.GsTrack.prototype.Is12StringedGuitarTrack = null;
net.alphatab.model.GsTrack.prototype.IsBanjoTrack = null;
net.alphatab.model.GsTrack.prototype.IsMute = null;
net.alphatab.model.GsTrack.prototype.IsPercussionTrack = null;
net.alphatab.model.GsTrack.prototype.IsSolo = null;
net.alphatab.model.GsTrack.prototype.MeasureCount = function() {
	$s.push("net.alphatab.model.GsTrack::MeasureCount");
	var $spos = $s.length;
	{
		var $tmp = this.Measures.length;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsTrack.prototype.Measures = null;
net.alphatab.model.GsTrack.prototype.Name = null;
net.alphatab.model.GsTrack.prototype.Number = null;
net.alphatab.model.GsTrack.prototype.Offset = null;
net.alphatab.model.GsTrack.prototype.Port = null;
net.alphatab.model.GsTrack.prototype.Song = null;
net.alphatab.model.GsTrack.prototype.StringCount = function() {
	$s.push("net.alphatab.model.GsTrack::StringCount");
	var $spos = $s.length;
	{
		var $tmp = this.Strings.length;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsTrack.prototype.Strings = null;
net.alphatab.model.GsTrack.prototype.__class__ = net.alphatab.model.GsTrack;
IntHash = function(p) { if( p === $_ ) return; {
	$s.push("IntHash::new");
	var $spos = $s.length;
	this.h = {}
	if(this.h.__proto__ != null) {
		this.h.__proto__ = null;
		delete(this.h.__proto__);
	}
	else null;
	$s.pop();
}}
IntHash.__name__ = ["IntHash"];
IntHash.prototype.exists = function(key) {
	$s.push("IntHash::exists");
	var $spos = $s.length;
	{
		var $tmp = this.h[key] != null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
IntHash.prototype.get = function(key) {
	$s.push("IntHash::get");
	var $spos = $s.length;
	{
		var $tmp = this.h[key];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
IntHash.prototype.h = null;
IntHash.prototype.iterator = function() {
	$s.push("IntHash::iterator");
	var $spos = $s.length;
	{
		var $tmp = { ref : this.h, it : this.keys(), hasNext : function() {
			$s.push("IntHash::iterator@199");
			var $spos = $s.length;
			{
				var $tmp = this.it.hasNext();
				$s.pop();
				return $tmp;
			}
			$s.pop();
		}, next : function() {
			$s.push("IntHash::iterator@200");
			var $spos = $s.length;
			var i = this.it.next();
			{
				var $tmp = this.ref[i];
				$s.pop();
				return $tmp;
			}
			$s.pop();
		}}
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
IntHash.prototype.keys = function() {
	$s.push("IntHash::keys");
	var $spos = $s.length;
	var a = new Array();
	
			for( x in this.h )
				a.push(x);
		;
	{
		var $tmp = a.iterator();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
IntHash.prototype.remove = function(key) {
	$s.push("IntHash::remove");
	var $spos = $s.length;
	if(this.h[key] == null) {
		$s.pop();
		return false;
	}
	delete(this.h[key]);
	{
		$s.pop();
		return true;
	}
	$s.pop();
}
IntHash.prototype.set = function(key,value) {
	$s.push("IntHash::set");
	var $spos = $s.length;
	this.h[key] = value;
	$s.pop();
}
IntHash.prototype.toString = function() {
	$s.push("IntHash::toString");
	var $spos = $s.length;
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
	{
		var $tmp = s.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
IntHash.prototype.__class__ = IntHash;
StringTools = function() { }
StringTools.__name__ = ["StringTools"];
StringTools.urlEncode = function(s) {
	$s.push("StringTools::urlEncode");
	var $spos = $s.length;
	{
		var $tmp = encodeURIComponent(s);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.urlDecode = function(s) {
	$s.push("StringTools::urlDecode");
	var $spos = $s.length;
	{
		var $tmp = decodeURIComponent(s.split("+").join(" "));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.htmlEscape = function(s) {
	$s.push("StringTools::htmlEscape");
	var $spos = $s.length;
	{
		var $tmp = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.htmlUnescape = function(s) {
	$s.push("StringTools::htmlUnescape");
	var $spos = $s.length;
	{
		var $tmp = s.split("&gt;").join(">").split("&lt;").join("<").split("&amp;").join("&");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.startsWith = function(s,start) {
	$s.push("StringTools::startsWith");
	var $spos = $s.length;
	{
		var $tmp = (s.length >= start.length && s.substr(0,start.length) == start);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.endsWith = function(s,end) {
	$s.push("StringTools::endsWith");
	var $spos = $s.length;
	var elen = end.length;
	var slen = s.length;
	{
		var $tmp = (slen >= elen && s.substr(slen - elen,elen) == end);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.isSpace = function(s,pos) {
	$s.push("StringTools::isSpace");
	var $spos = $s.length;
	var c = s.charCodeAt(pos);
	{
		var $tmp = (c >= 9 && c <= 13) || c == 32;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.ltrim = function(s) {
	$s.push("StringTools::ltrim");
	var $spos = $s.length;
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) {
		r++;
	}
	if(r > 0) {
		var $tmp = s.substr(r,l - r);
		$s.pop();
		return $tmp;
	}
	else {
		$s.pop();
		return s;
	}
	$s.pop();
}
StringTools.rtrim = function(s) {
	$s.push("StringTools::rtrim");
	var $spos = $s.length;
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,(l - r) - 1)) {
		r++;
	}
	if(r > 0) {
		{
			var $tmp = s.substr(0,l - r);
			$s.pop();
			return $tmp;
		}
	}
	else {
		{
			$s.pop();
			return s;
		}
	}
	$s.pop();
}
StringTools.trim = function(s) {
	$s.push("StringTools::trim");
	var $spos = $s.length;
	{
		var $tmp = StringTools.ltrim(StringTools.rtrim(s));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.rpad = function(s,c,l) {
	$s.push("StringTools::rpad");
	var $spos = $s.length;
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
	{
		$s.pop();
		return s;
	}
	$s.pop();
}
StringTools.lpad = function(s,c,l) {
	$s.push("StringTools::lpad");
	var $spos = $s.length;
	var ns = "";
	var sl = s.length;
	if(sl >= l) {
		$s.pop();
		return s;
	}
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
	{
		var $tmp = ns + s;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.replace = function(s,sub,by) {
	$s.push("StringTools::replace");
	var $spos = $s.length;
	{
		var $tmp = s.split(sub).join(by);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringTools.hex = function(n,digits) {
	$s.push("StringTools::hex");
	var $spos = $s.length;
	var neg = false;
	if(n < 0) {
		neg = true;
		n = -n;
	}
	var s = n.toString(16);
	s = s.toUpperCase();
	if(digits != null) while(s.length < digits) s = "0" + s;
	if(neg) s = "-" + s;
	{
		$s.pop();
		return s;
	}
	$s.pop();
}
StringTools.prototype.__class__ = StringTools;
if(typeof haxe=='undefined') haxe = {}
if(!haxe.remoting) haxe.remoting = {}
haxe.remoting.FlashJsConnection = function() { }
haxe.remoting.FlashJsConnection.__name__ = ["haxe","remoting","FlashJsConnection"];
haxe.remoting.FlashJsConnection.flashCall = function(flashObj,name,path,params) {
	$s.push("haxe.remoting.FlashJsConnection::flashCall");
	var $spos = $s.length;
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
				{
					$e = [];
					while($s.length >= $spos) $e.unshift($s.pop());
					$s.push($e[0]);
					null;
				}
			}
		}
		if(data == null) throw ("Flash object " + flashObj) + " does not have an active FlashJsConnection";
		{
			$s.pop();
			return data;
		}
	}
	catch( $e6 ) {
		{
			var e = $e6;
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				var s = new haxe.Serializer();
				s.serializeException(e);
				{
					var $tmp = s.toString();
					$s.pop();
					return $tmp;
				}
			}
		}
	}
	$s.pop();
}
haxe.remoting.FlashJsConnection.prototype.__class__ = haxe.remoting.FlashJsConnection;
if(!haxe.io) haxe.io = {}
haxe.io.Bytes = function(length,b) { if( length === $_ ) return; {
	$s.push("haxe.io.Bytes::new");
	var $spos = $s.length;
	this.length = length;
	this.b = b;
	$s.pop();
}}
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	$s.push("haxe.io.Bytes::alloc");
	var $spos = $s.length;
	var a = new Array();
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			a.push(0);
		}
	}
	{
		var $tmp = new haxe.io.Bytes(length,a);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Bytes.ofString = function(s) {
	$s.push("haxe.io.Bytes::ofString");
	var $spos = $s.length;
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
	{
		var $tmp = new haxe.io.Bytes(a.length,a);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Bytes.ofData = function(b) {
	$s.push("haxe.io.Bytes::ofData");
	var $spos = $s.length;
	{
		var $tmp = new haxe.io.Bytes(b.length,b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Bytes.prototype.b = null;
haxe.io.Bytes.prototype.blit = function(pos,src,srcpos,len) {
	$s.push("haxe.io.Bytes::blit");
	var $spos = $s.length;
	if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe.io.Error.OutsideBounds;
	var b1 = this.b;
	var b2 = src.b;
	if(b1 == b2 && pos > srcpos) {
		var i = len;
		while(i > 0) {
			i--;
			b1[i + pos] = b2[i + srcpos];
		}
		{
			$s.pop();
			return;
		}
	}
	{
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b1[i + pos] = b2[i + srcpos];
		}
	}
	$s.pop();
}
haxe.io.Bytes.prototype.compare = function(other) {
	$s.push("haxe.io.Bytes::compare");
	var $spos = $s.length;
	var b1 = this.b;
	var b2 = other.b;
	var len = ((this.length < other.length)?this.length:other.length);
	{
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			if(b1[i] != b2[i]) {
				var $tmp = b1[i] - b2[i];
				$s.pop();
				return $tmp;
			}
		}
	}
	{
		var $tmp = this.length - other.length;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Bytes.prototype.get = function(pos) {
	$s.push("haxe.io.Bytes::get");
	var $spos = $s.length;
	{
		var $tmp = this.b[pos];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Bytes.prototype.getData = function() {
	$s.push("haxe.io.Bytes::getData");
	var $spos = $s.length;
	{
		var $tmp = this.b;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Bytes.prototype.length = null;
haxe.io.Bytes.prototype.readString = function(pos,len) {
	$s.push("haxe.io.Bytes::readString");
	var $spos = $s.length;
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
	{
		$s.pop();
		return s;
	}
	$s.pop();
}
haxe.io.Bytes.prototype.set = function(pos,v) {
	$s.push("haxe.io.Bytes::set");
	var $spos = $s.length;
	this.b[pos] = (v & 255);
	$s.pop();
}
haxe.io.Bytes.prototype.sub = function(pos,len) {
	$s.push("haxe.io.Bytes::sub");
	var $spos = $s.length;
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	{
		var $tmp = new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Bytes.prototype.toString = function() {
	$s.push("haxe.io.Bytes::toString");
	var $spos = $s.length;
	{
		var $tmp = this.readString(0,this.length);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Bytes.prototype.__class__ = haxe.io.Bytes;
net.alphatab.model.effects.GsHarmonicType = { __ename__ : ["net","alphatab","model","effects","GsHarmonicType"], __constructs__ : ["Natural","Artificial","Tapped","Pinch","Semi"] }
net.alphatab.model.effects.GsHarmonicType.Artificial = ["Artificial",1];
net.alphatab.model.effects.GsHarmonicType.Artificial.toString = $estr;
net.alphatab.model.effects.GsHarmonicType.Artificial.__enum__ = net.alphatab.model.effects.GsHarmonicType;
net.alphatab.model.effects.GsHarmonicType.Natural = ["Natural",0];
net.alphatab.model.effects.GsHarmonicType.Natural.toString = $estr;
net.alphatab.model.effects.GsHarmonicType.Natural.__enum__ = net.alphatab.model.effects.GsHarmonicType;
net.alphatab.model.effects.GsHarmonicType.Pinch = ["Pinch",3];
net.alphatab.model.effects.GsHarmonicType.Pinch.toString = $estr;
net.alphatab.model.effects.GsHarmonicType.Pinch.__enum__ = net.alphatab.model.effects.GsHarmonicType;
net.alphatab.model.effects.GsHarmonicType.Semi = ["Semi",4];
net.alphatab.model.effects.GsHarmonicType.Semi.toString = $estr;
net.alphatab.model.effects.GsHarmonicType.Semi.__enum__ = net.alphatab.model.effects.GsHarmonicType;
net.alphatab.model.effects.GsHarmonicType.Tapped = ["Tapped",2];
net.alphatab.model.effects.GsHarmonicType.Tapped.toString = $estr;
net.alphatab.model.effects.GsHarmonicType.Tapped.__enum__ = net.alphatab.model.effects.GsHarmonicType;
net.alphatab.file.SongReader = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.file.SongReader::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.file.SongReader.__name__ = ["net","alphatab","file","SongReader"];
net.alphatab.file.SongReader.AvailableReaders = function() {
	$s.push("net.alphatab.file.SongReader::AvailableReaders");
	var $spos = $s.length;
	var d = new Array();
	d.push(new net.alphatab.file.guitarpro.Gp5Reader());
	d.push(new net.alphatab.file.guitarpro.Gp4Reader());
	d.push(new net.alphatab.file.guitarpro.Gp4Reader());
	{
		$s.pop();
		return d;
	}
	$s.pop();
}
net.alphatab.file.SongReader.prototype.Data = null;
net.alphatab.file.SongReader.prototype.Factory = null;
net.alphatab.file.SongReader.prototype.Init = function(data,factory) {
	$s.push("net.alphatab.file.SongReader::Init");
	var $spos = $s.length;
	this.Data = data;
	this.Factory = factory;
	$s.pop();
}
net.alphatab.file.SongReader.prototype.ReadSong = function() {
	$s.push("net.alphatab.file.SongReader::ReadSong");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsSong();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.SongReader.prototype.__class__ = net.alphatab.file.SongReader;
if(!net.alphatab.file.guitarpro) net.alphatab.file.guitarpro = {}
net.alphatab.file.guitarpro.GpReaderBase = function(supportedVersions) { if( supportedVersions === $_ ) return; {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::new");
	var $spos = $s.length;
	net.alphatab.file.SongReader.apply(this,[]);
	this.SupportedVersions = supportedVersions;
	$s.pop();
}}
net.alphatab.file.guitarpro.GpReaderBase.__name__ = ["net","alphatab","file","guitarpro","GpReaderBase"];
net.alphatab.file.guitarpro.GpReaderBase.__super__ = net.alphatab.file.SongReader;
for(var k in net.alphatab.file.SongReader.prototype ) net.alphatab.file.guitarpro.GpReaderBase.prototype[k] = net.alphatab.file.SongReader.prototype[k];
net.alphatab.file.guitarpro.GpReaderBase.NewString = function(bytes,length,charset) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::NewString");
	var $spos = $s.length;
	{
		var $tmp = bytes.toString().substr(0,length);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort = function(data) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ToChannelShort");
	var $spos = $s.length;
	var value = Math.floor(Math.max(-32768,Math.min(32767,(data * 8) - 1)));
	{
		var $tmp = Math.floor(Math.max(value,-1));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.Init = function(data,factory) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::Init");
	var $spos = $s.length;
	net.alphatab.file.SongReader.prototype.Init.apply(this,[data,factory]);
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.Read = function() {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::Read");
	var $spos = $s.length;
	{
		var $tmp = this.ReadByte();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadBool = function() {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadBool");
	var $spos = $s.length;
	{
		var $tmp = this.Data.readByte() == 1;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadByte = function() {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadByte");
	var $spos = $s.length;
	var data = this.Data.readByte() & 255;
	{
		var $tmp = (data > 127?-256 + data:data);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadByteSizeCheckByteString = function(charset) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadByteSizeCheckByteString");
	var $spos = $s.length;
	if(charset == null) charset = "UTF-8";
	{
		var $tmp = this.ReadByteSizeString((this.ReadUnsignedByte() - 1),charset);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadByteSizeString = function(size,charset) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadByteSizeString");
	var $spos = $s.length;
	if(charset == null) charset = "UTF-8";
	{
		var $tmp = this.ReadString(size,this.ReadUnsignedByte(),charset);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadDouble = function() {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadDouble");
	var $spos = $s.length;
	{
		var $tmp = this.Data.readDouble();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadInt = function() {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadInt");
	var $spos = $s.length;
	{
		var $tmp = (this.Data.readInt32());
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadIntSizeCheckByteString = function(charset) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadIntSizeCheckByteString");
	var $spos = $s.length;
	if(charset == null) charset = "UTF-8";
	{
		var $tmp = this.ReadByteSizeString((this.ReadInt() - 1),charset);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadIntSizeString = function(charset) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadIntSizeString");
	var $spos = $s.length;
	if(charset == null) charset = "UTF-8";
	{
		var $tmp = this.ReadString(this.ReadInt(),-2,charset);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadString = function(size,len,charset) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadString");
	var $spos = $s.length;
	if(charset == null) charset = "UTF-8";
	if(len == null) len = -2;
	if(len == -2) len = size;
	var count = ((size > 0?size:len));
	var s = this.ReadStringInternal(count);
	{
		var $tmp = s.substr(0,((len >= 0?len:size)));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadStringInternal = function(length) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadStringInternal");
	var $spos = $s.length;
	var text = "";
	{
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			text += String.fromCharCode(this.ReadByte());
		}
	}
	{
		$s.pop();
		return text;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadUnsignedByte = function() {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadUnsignedByte");
	var $spos = $s.length;
	{
		var $tmp = this.Data.readByte();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.ReadVersion = function() {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::ReadVersion");
	var $spos = $s.length;
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
					{
						$s.pop();
						return true;
					}
				}
			}
		}
	}
	catch( $e7 ) {
		if( js.Boot.__instanceof($e7,haxe.io.Error) ) {
			var e = $e7;
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				this.Version = "Not Supported";
			}
		} else throw($e7);
	}
	{
		$s.pop();
		return false;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.Skip = function(count) {
	$s.push("net.alphatab.file.guitarpro.GpReaderBase::Skip");
	var $spos = $s.length;
	var _g = 0;
	while(_g < count) {
		var i = _g++;
		this.Data.readByte();
	}
	$s.pop();
}
net.alphatab.file.guitarpro.GpReaderBase.prototype.SupportedVersions = null;
net.alphatab.file.guitarpro.GpReaderBase.prototype.Version = null;
net.alphatab.file.guitarpro.GpReaderBase.prototype.VersionIndex = null;
net.alphatab.file.guitarpro.GpReaderBase.prototype.__class__ = net.alphatab.file.guitarpro.GpReaderBase;
net.alphatab.file.guitarpro.Gp5Reader = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::new");
	var $spos = $s.length;
	net.alphatab.file.guitarpro.GpReaderBase.apply(this,[["FICHIER GUITAR PRO v5.00","FICHIER GUITAR PRO v5.10"]]);
	$s.pop();
}}
net.alphatab.file.guitarpro.Gp5Reader.__name__ = ["net","alphatab","file","guitarpro","Gp5Reader"];
net.alphatab.file.guitarpro.Gp5Reader.__super__ = net.alphatab.file.guitarpro.GpReaderBase;
for(var k in net.alphatab.file.guitarpro.GpReaderBase.prototype ) net.alphatab.file.guitarpro.Gp5Reader.prototype[k] = net.alphatab.file.guitarpro.GpReaderBase.prototype[k];
net.alphatab.file.guitarpro.Gp5Reader.prototype.GetBeat = function(measure,start) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::GetBeat");
	var $spos = $s.length;
	{
		var _g1 = 0, _g = measure.Beats.length;
		while(_g1 < _g) {
			var b = _g1++;
			var beat = measure.Beats[b];
			if(beat.Start == start) {
				$s.pop();
				return beat;
			}
		}
	}
	var newBeat = this.Factory.NewBeat();
	newBeat.Start = start;
	measure.AddBeat(newBeat);
	{
		$s.pop();
		return newBeat;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.GetTiedNoteValue = function(stringIndex,track) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::GetTiedNoteValue");
	var $spos = $s.length;
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
												{
													var $tmp = note.Value;
													$s.pop();
													return $tmp;
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
	}
	{
		$s.pop();
		return -1;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadArtificialHarmonic = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadArtificialHarmonic");
	var $spos = $s.length;
	var type = this.ReadByte();
	var oHarmonic = this.Factory.NewHarmonicEffect();
	oHarmonic.Data = 0;
	switch(type) {
	case 1:{
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Natural);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 2:{
		this.Skip(3);
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Artificial);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 3:{
		this.Skip(1);
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Tapped);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 4:{
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Pinch);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 5:{
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Semi);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadBeat = function(start,measure,track,voiceIndex) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadBeat");
	var $spos = $s.length;
	var flags = this.ReadUnsignedByte();
	var beat = this.GetBeat(measure,start);
	var voice = beat.Voices[voiceIndex];
	if((flags & 64) != 0) {
		var beatType = this.ReadUnsignedByte();
		voice.IsEmpty = ((beatType & 2) == 0);
	}
	var duration = this.ReadDuration(flags);
	var effect = new net.alphatab.model.GsNoteEffect();
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
		var mixTableChange = this.ReadMixTableChange(measure);
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
	{
		var $tmp = ((!voice.IsEmpty)?duration.Time():0);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadBeatEffects = function(beat,effect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadBeatEffects");
	var $spos = $s.length;
	var flags1 = this.ReadUnsignedByte();
	var flags2 = this.ReadUnsignedByte();
	effect.FadeIn = (((flags1 & 16) != 0));
	effect.BeatVibrato = (((flags1 & 2) != 0)) || effect.BeatVibrato;
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
			beat.Stroke.Direction = net.alphatab.model.GsBeatStrokeDirection.Up;
			beat.Stroke.Value = (this.ToStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.Stroke.Direction = net.alphatab.model.GsBeatStrokeDirection.Down;
			beat.Stroke.Value = (this.ToStrokeValue(strokeDown));
		}
	}
	beat.HasRasgueado = (flags2 & 1) != 0;
	if((flags2 & 2) != 0) {
		beat.PickStroke = this.ReadByte();
		beat.HasPickStroke = true;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadBend = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadBend");
	var $spos = $s.length;
	var bendEffect = this.Factory.NewBendEffect();
	bendEffect.Type = net.alphatab.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	bendEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / 25);
			var vibrato = this.ReadBool();
			bendEffect.Points.push(new net.alphatab.model.effects.GsBendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) noteEffect.Bend = bendEffect;
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadChannel = function(midiChannel,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadChannel");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadChord = function(stringCount,beat) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadChord");
	var $spos = $s.length;
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
		beat.SetChord(chord);
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadColor = function() {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadColor");
	var $spos = $s.length;
	var r = (this.ReadUnsignedByte());
	var g = this.ReadUnsignedByte();
	var b = (this.ReadUnsignedByte());
	this.Skip(1);
	{
		var $tmp = new net.alphatab.model.GsColor(r,g,b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadDuration = function(flags) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadDuration");
	var $spos = $s.length;
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
	{
		$s.pop();
		return duration;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadGrace = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadGrace");
	var $spos = $s.length;
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
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.None;
	}break;
	case 1:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Slide;
	}break;
	case 2:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Bend;
	}break;
	case 3:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Hammer;
	}break;
	}
	noteEffect.Grace = (grace);
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadInfo = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadInfo");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadLyrics = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadLyrics");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadMarker = function(header) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadMarker");
	var $spos = $s.length;
	var marker = this.Factory.NewMarker();
	marker.MeasureHeader = header;
	marker.Title = this.ReadIntSizeCheckByteString();
	marker.Color = this.ReadColor();
	{
		$s.pop();
		return marker;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadMeasure = function(measure,track) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadMeasure");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadMeasureHeader = function(i,timeSignature,song) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadMeasureHeader");
	var $spos = $s.length;
	if(i > 0) this.Skip(1);
	var flags = this.ReadUnsignedByte();
	var header = this.Factory.NewMeasureHeader();
	header.Number = i + 1;
	header.Start = 0;
	header.Tempo.Value = song.Tempo;
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
	else if(header.Number > 1) {
		header.KeySignature = song.MeasureHeaders[i - 1].KeySignature;
		header.KeySignatureType = song.MeasureHeaders[i - 1].KeySignatureType;
	}
	header.HasDoubleBar = (flags & 128) != 0;
	if((flags & 1) != 0) this.Skip(4);
	if((flags & 16) == 0) this.Skip(1);
	var tripletFeel = this.ReadByte();
	switch(tripletFeel) {
	case 1:{
		header.TripletFeel = net.alphatab.model.GsTripletFeel.Eighth;
	}break;
	case 2:{
		header.TripletFeel = net.alphatab.model.GsTripletFeel.Sixteenth;
	}break;
	default:{
		header.TripletFeel = net.alphatab.model.GsTripletFeel.None;
	}break;
	}
	{
		$s.pop();
		return header;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadMeasureHeaders = function(song,measureCount) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadMeasureHeaders");
	var $spos = $s.length;
	var timeSignature = this.Factory.NewTimeSignature();
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.AddMeasureHeader(this.ReadMeasureHeader(i,timeSignature,song));
		}
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadMeasures = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadMeasures");
	var $spos = $s.length;
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
					header.Tempo.Copy(tempo);
					track.AddMeasure(measure);
					this.ReadMeasure(measure,track);
				}
			}
			tempo.Copy(header.Tempo);
			start += header.Length();
		}
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadMidiChannels = function() {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadMidiChannels");
	var $spos = $s.length;
	var channels = new Array();
	{
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.Factory.NewMidiChannel();
			newChannel.Channel = (i);
			newChannel.EffectChannel = (i);
			newChannel.Instrument(this.ReadInt());
			newChannel.Volume = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Balance = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Chorus = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Reverb = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Phaser = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Tremolo = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			channels.push(newChannel);
			this.Skip(2);
		}
	}
	{
		$s.pop();
		return channels;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadMixTableChange = function(measure) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadMixTableChange");
	var $spos = $s.length;
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
		measure.GetTempo().Value = tableChange.Tempo.Value;
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
	{
		$s.pop();
		return tableChange;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadNote = function(guitarString,track,effect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadNote");
	var $spos = $s.length;
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
	{
		$s.pop();
		return note;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadNoteEffects = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadNoteEffects");
	var $spos = $s.length;
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
			noteEffect.SlideType = net.alphatab.model.GsSlideType.FastSlideTo;
		}break;
		case 2:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.SlowSlideTo;
		}break;
		case 4:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.OutDownWards;
		}break;
		case 8:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.OutUpWards;
		}break;
		case 16:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.IntoFromBelow;
		}break;
		case 32:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.IntoFromAbove;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadPageSetup = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadPageSetup");
	var $spos = $s.length;
	var setup = this.Factory.NewPageSetup();
	if(this.VersionIndex > 0) this.Skip(19);
	setup.PageSize = new net.alphatab.model.Point(this.ReadInt(),this.ReadInt());
	var l = this.ReadInt();
	var r = this.ReadInt();
	var t = this.ReadInt();
	var b = this.ReadInt();
	setup.PageMargin = new net.alphatab.model.Rectangle(l,t,r,b);
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadSong = function() {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadSong");
	var $spos = $s.length;
	if(!this.ReadVersion()) {
		throw new net.alphatab.file.FileFormatException("Unsupported Version");
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
	{
		$s.pop();
		return song;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadText = function(beat) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadText");
	var $spos = $s.length;
	var text = this.Factory.NewText();
	text.Value = this.ReadIntSizeCheckByteString();
	beat.SetText(text);
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadTrack = function(number,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadTrack");
	var $spos = $s.length;
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
	{
		$s.pop();
		return track;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadTracks = function(song,trackCount,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadTracks");
	var $spos = $s.length;
	{
		var _g1 = 1, _g = trackCount + 1;
		while(_g1 < _g) {
			var i = _g1++;
			song.AddTrack(this.ReadTrack(i,channels));
		}
	}
	this.Skip(((this.VersionIndex == 0?2:1)));
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadTremoloBar = function(effect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadTremoloBar");
	var $spos = $s.length;
	var barEffect = this.Factory.NewTremoloBarEffect();
	barEffect.Type = net.alphatab.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	barEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / (25 * 2.0));
			var vibrato = this.ReadBool();
			barEffect.Points.push(new net.alphatab.model.effects.GsTremoloBarPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) effect.TremoloBar = barEffect;
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadTremoloPicking = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadTremoloPicking");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ReadTrill = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ReadTrill");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ToKeySignature = function(p) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ToKeySignature");
	var $spos = $s.length;
	{
		var $tmp = (p < 0?7 + Math.round(Math.abs(p)):p);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.ToStrokeValue = function(value) {
	$s.push("net.alphatab.file.guitarpro.Gp5Reader::ToStrokeValue");
	var $spos = $s.length;
	switch(value) {
	case 1:{
		{
			$s.pop();
			return 64;
		}
	}break;
	case 2:{
		{
			$s.pop();
			return 64;
		}
	}break;
	case 3:{
		{
			$s.pop();
			return 32;
		}
	}break;
	case 4:{
		{
			$s.pop();
			return 16;
		}
	}break;
	case 5:{
		{
			$s.pop();
			return 8;
		}
	}break;
	case 6:{
		{
			$s.pop();
			return 4;
		}
	}break;
	default:{
		{
			$s.pop();
			return 64;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp5Reader.prototype.__class__ = net.alphatab.file.guitarpro.Gp5Reader;
haxe.io.BytesBuffer = function(p) { if( p === $_ ) return; {
	$s.push("haxe.io.BytesBuffer::new");
	var $spos = $s.length;
	this.b = new Array();
	$s.pop();
}}
haxe.io.BytesBuffer.__name__ = ["haxe","io","BytesBuffer"];
haxe.io.BytesBuffer.prototype.add = function(src) {
	$s.push("haxe.io.BytesBuffer::add");
	var $spos = $s.length;
	var b1 = this.b;
	var b2 = src.b;
	{
		var _g1 = 0, _g = src.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	$s.pop();
}
haxe.io.BytesBuffer.prototype.addByte = function($byte) {
	$s.push("haxe.io.BytesBuffer::addByte");
	var $spos = $s.length;
	this.b.push($byte);
	$s.pop();
}
haxe.io.BytesBuffer.prototype.addBytes = function(src,pos,len) {
	$s.push("haxe.io.BytesBuffer::addBytes");
	var $spos = $s.length;
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
	$s.pop();
}
haxe.io.BytesBuffer.prototype.b = null;
haxe.io.BytesBuffer.prototype.getBytes = function() {
	$s.push("haxe.io.BytesBuffer::getBytes");
	var $spos = $s.length;
	var bytes = new haxe.io.Bytes(this.b.length,this.b);
	this.b = null;
	{
		$s.pop();
		return bytes;
	}
	$s.pop();
}
haxe.io.BytesBuffer.prototype.__class__ = haxe.io.BytesBuffer;
net.alphatab.model.effects.GsTrillEffect = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.effects.GsTrillEffect::new");
	var $spos = $s.length;
	this.Fret = 0;
	this.Duration = factory.NewDuration();
	$s.pop();
}}
net.alphatab.model.effects.GsTrillEffect.__name__ = ["net","alphatab","model","effects","GsTrillEffect"];
net.alphatab.model.effects.GsTrillEffect.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.effects.GsTrillEffect::Clone");
	var $spos = $s.length;
	var effect = factory.NewTrillEffect();
	effect.Fret = this.Fret;
	effect.Duration.Value = this.Duration.Value;
	effect.Duration.IsDotted = this.Duration.IsDotted;
	effect.Duration.IsDoubleDotted = this.Duration.IsDoubleDotted;
	effect.Duration.Triplet.Enters = this.Duration.Triplet.Enters;
	effect.Duration.Triplet.Times = this.Duration.Triplet.Times;
	{
		$s.pop();
		return effect;
	}
	$s.pop();
}
net.alphatab.model.effects.GsTrillEffect.prototype.Duration = null;
net.alphatab.model.effects.GsTrillEffect.prototype.Fret = null;
net.alphatab.model.effects.GsTrillEffect.prototype.__class__ = net.alphatab.model.effects.GsTrillEffect;
net.alphatab.model.GsHeaderFooterElements = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsHeaderFooterElements::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.model.GsHeaderFooterElements.__name__ = ["net","alphatab","model","GsHeaderFooterElements"];
net.alphatab.model.GsHeaderFooterElements.prototype.__class__ = net.alphatab.model.GsHeaderFooterElements;
net.alphatab.model.GsVoice = function(factory,index) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.GsVoice::new");
	var $spos = $s.length;
	this.Duration = factory.NewDuration();
	this.Notes = new Array();
	this.Index = index;
	this.Direction = net.alphatab.model.GsVoiceDirection.None;
	this.IsEmpty = true;
	$s.pop();
}}
net.alphatab.model.GsVoice.__name__ = ["net","alphatab","model","GsVoice"];
net.alphatab.model.GsVoice.prototype.AddNote = function(note) {
	$s.push("net.alphatab.model.GsVoice::AddNote");
	var $spos = $s.length;
	note.Voice = this;
	this.Notes.push(note);
	this.IsEmpty = false;
	$s.pop();
}
net.alphatab.model.GsVoice.prototype.Beat = null;
net.alphatab.model.GsVoice.prototype.Direction = null;
net.alphatab.model.GsVoice.prototype.Duration = null;
net.alphatab.model.GsVoice.prototype.Index = null;
net.alphatab.model.GsVoice.prototype.IsEmpty = null;
net.alphatab.model.GsVoice.prototype.IsRestVoice = function() {
	$s.push("net.alphatab.model.GsVoice::IsRestVoice");
	var $spos = $s.length;
	{
		var $tmp = this.Notes.length == 0;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsVoice.prototype.Notes = null;
net.alphatab.model.GsVoice.prototype.__class__ = net.alphatab.model.GsVoice;
if(!net.alphatab.tablature.model) net.alphatab.tablature.model = {}
net.alphatab.tablature.model.GsVoiceImpl = function(factory,index) { if( factory === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsVoice.apply(this,[factory,index]);
	$s.pop();
}}
net.alphatab.tablature.model.GsVoiceImpl.__name__ = ["net","alphatab","tablature","model","GsVoiceImpl"];
net.alphatab.tablature.model.GsVoiceImpl.__super__ = net.alphatab.model.GsVoice;
for(var k in net.alphatab.model.GsVoice.prototype ) net.alphatab.tablature.model.GsVoiceImpl.prototype[k] = net.alphatab.model.GsVoice.prototype[k];
net.alphatab.tablature.model.GsVoiceImpl.prototype.BeatGroup = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.BeatImpl = function() {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::BeatImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Beat;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.Check = function(note) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::Check");
	var $spos = $s.length;
	var value = note.RealValue();
	if(this.MaxNote == null || value > this.MaxNote.RealValue()) this.MaxNote = note;
	if(this.MinNote == null || value < this.MinNote.RealValue()) this.MinNote = note;
	this.UsedStrings()[note.String - 1] = true;
	if(note.String > this.MaxString) this.MaxString = note.String;
	if(note.String < this.MinString) this.MinString = note.String;
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.GetPaintPosition = function(iIndex) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::GetPaintPosition");
	var $spos = $s.length;
	{
		var $tmp = this.Beat.Measure.Ts.Get(iIndex);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.IsHiddenSilence = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.IsJoinedGreaterThanQuarter = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.Join1 = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.Join2 = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.JoinedType = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.MaxNote = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.MaxString = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.MaxY = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.MeasureImpl = function() {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::MeasureImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Beat.Measure;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.MinNote = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.MinString = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.MinY = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.NextBeat = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.Paint = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::Paint");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.PaintBeat = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::PaintBeat");
	var $spos = $s.length;
	if(!this.IsRestVoice()) {
		var spacing = this.Beat.Spacing();
		this.PaintScoreBeat(layout,context,x,y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines),spacing);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.PaintDot = function(layout,layer,x,y,scale) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::PaintDot");
	var $spos = $s.length;
	var dotSize = 3.0 * scale;
	layer.AddCircle(Math.round(x - (dotSize / 2.0)),Math.round(y - (dotSize / 2.0)),dotSize);
	if(this.Duration.IsDoubleDotted) {
		layer.AddCircle(Math.round((x + (dotSize + 2.0)) - (dotSize / 2.0)),Math.round(y - (dotSize / 2.0)),dotSize);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.PaintScoreBeat = function(layout,context,x,y,spacing) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::PaintScoreBeat");
	var $spos = $s.length;
	var vX = x + 4 * layout.Scale;
	var fill = (this.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	var draw = (this.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2));
	this.PaintTriplet(layout,context,x,(y - this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines)));
	if(this.Duration.Value >= 2) {
		var scale = layout.Scale;
		var lineSpacing = layout.ScoreLineSpacing;
		var direction = this.BeatGroup.Direction;
		var key = this.Beat.Measure.GetKeySignature();
		var clef = net.alphatab.model.GsMeasureClefConverter.ToInt(this.Beat.Measure.Clef);
		var xMove = (direction == net.alphatab.model.GsVoiceDirection.Up?net.alphatab.tablature.drawing.DrawingResources.GetScoreNoteSize(layout,false).Width:0);
		var yMove = (direction == net.alphatab.model.GsVoiceDirection.Up?Math.round(layout.ScoreLineSpacing / 3) + 1:Math.round(layout.ScoreLineSpacing / 3) * 2);
		var vY1 = y + (((direction == net.alphatab.model.GsVoiceDirection.Down)?this.MaxNote.ScorePosY:this.MinNote.ScorePosY));
		var vY2 = y + this.BeatGroup.GetY2(layout,this.PosX() + spacing,key,clef);
		draw.StartFigure();
		draw.MoveTo(vX + xMove,vY1 + yMove);
		draw.LineTo(vX + xMove,vY2);
		if(this.Duration.Value >= 8) {
			var index = this.Duration.Index() - 3;
			if(index >= 0) {
				var dir = (direction == net.alphatab.model.GsVoiceDirection.Down?1:-1);
				var joinedType = this.JoinedType;
				var bJoinedGreaterThanQuarter = this.IsJoinedGreaterThanQuarter;
				if((joinedType == net.alphatab.tablature.model.GsJoinedType.NoneLeft || joinedType == net.alphatab.tablature.model.GsJoinedType.NoneRight) && !bJoinedGreaterThanQuarter) {
					var hY = ((y + this.BeatGroup.GetY2(layout,this.PosX() + spacing,key,clef)) - ((lineSpacing * 2) * dir));
					net.alphatab.tablature.drawing.NotePainter.PaintFooter(fill,vX,vY2,this.Duration.Value,dir,layout);
				}
				else {
					var startX;
					var endX;
					var startXforCalculation;
					var endXforCalculation;
					if(joinedType == net.alphatab.tablature.model.GsJoinedType.NoneRight) {
						startX = Math.round(this.Beat.GetRealPosX(layout) + xMove);
						endX = Math.round((this.Beat.GetRealPosX(layout) + (6 * scale)) + xMove);
						startXforCalculation = this.PosX() + spacing;
						endXforCalculation = Math.floor((this.PosX() + spacing) + (6 * scale));
					}
					else if(joinedType == net.alphatab.tablature.model.GsJoinedType.NoneLeft) {
						startX = Math.round((this.Beat.GetRealPosX(layout) - (6 * scale)) + xMove);
						endX = Math.round(this.Beat.GetRealPosX(layout) + xMove);
						startXforCalculation = Math.floor((this.PosX() + spacing) - (6 * scale));
						endXforCalculation = this.PosX() + spacing;
					}
					else {
						startX = Math.round(this.Join1.Beat.GetRealPosX(layout) + xMove);
						endX = Math.round((this.Join2.Beat.GetRealPosX(layout) + xMove) + (scale));
						startXforCalculation = this.Join1.PosX() + this.Join1.Beat.Spacing();
						endXforCalculation = this.Join2.PosX() + this.Join2.Beat.Spacing();
					}
					var hY1 = y + this.BeatGroup.GetY2(layout,startXforCalculation,key,clef);
					var hY2 = y + this.BeatGroup.GetY2(layout,endXforCalculation,key,clef);
					var x1 = startX;
					var x2 = endX;
					net.alphatab.tablature.drawing.NotePainter.PaintBar(fill,x1,hY1,x2,hY2,index + 1,dir,scale);
				}
			}
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.PaintSilence = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::PaintSilence");
	var $spos = $s.length;
	var realX = x + 3 * layout.Scale;
	var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
	var lineSpacing = layout.ScoreLineSpacing;
	var scale = lineSpacing;
	var fill = (this.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	switch(this.Duration.Value) {
	case 1:{
		net.alphatab.tablature.drawing.SilencePainter.PaintWhole(fill,realX,realY,layout);
	}break;
	case 2:{
		net.alphatab.tablature.drawing.SilencePainter.PaintHalf(fill,realX,realY,layout);
	}break;
	case 4:{
		net.alphatab.tablature.drawing.SilencePainter.PaintQuarter(fill,realX,realY,layout);
	}break;
	case 8:{
		net.alphatab.tablature.drawing.SilencePainter.PaintEighth(fill,realX,realY,layout);
	}break;
	case 16:{
		net.alphatab.tablature.drawing.SilencePainter.PaintSixteenth(fill,realX,realY,layout);
	}break;
	case 32:{
		net.alphatab.tablature.drawing.SilencePainter.PaintThirtySecond(fill,realX,realY,layout);
	}break;
	case 64:{
		net.alphatab.tablature.drawing.SilencePainter.PaintSixtyFourth(fill,realX,realY,layout);
	}break;
	}
	if(this.Duration.IsDotted || this.Duration.IsDoubleDotted) {
		fill.MoveTo(realX + 10,realY + 1);
		fill.CircleTo(1);
		if(this.Duration.IsDoubleDotted) {
			fill.MoveTo((realX + 13),realY + 1);
			fill.CircleTo(1);
		}
	}
	this.PaintTriplet(layout,context,x,y);
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.PaintTriplet = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::PaintTriplet");
	var $spos = $s.length;
	var realX = x + 3 * layout.Scale;
	var fill = (this.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	if(!this.Duration.Triplet.Equals(new net.alphatab.model.GsTriplet())) {
		if(this.TripletGroup.isFull() && (this.PreviousBeat == null || this.PreviousBeat.TripletGroup == null || this.PreviousBeat.TripletGroup != this.TripletGroup)) {
			this.TripletGroup.paint(layout,context,x,y);
		}
		else if(!this.TripletGroup.isFull()) {
			fill.AddString(net.alphatab.Utils.string(this.Duration.Triplet.Enters),net.alphatab.tablature.drawing.DrawingResources.DefaultFont,Math.round(realX),Math.round(y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.Tupleto)));
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.PosX = function() {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::PosX");
	var $spos = $s.length;
	{
		var $tmp = this.Beat.PosX;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.PreviousBeat = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.Reset = function() {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::Reset");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.TripletGroup = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.Update = function(layout) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::Update");
	var $spos = $s.length;
	this.MinY = 0;
	this.MaxY = 0;
	if(this.IsRestVoice()) this.UpdateSilenceSpacing(layout);
	else this.UpdateNoteVoice(layout);
	if(this.Duration.Triplet != null && !this.Duration.Triplet.Equals(new net.alphatab.model.GsTriplet())) {
		if(this.PreviousBeat == null || this.PreviousBeat.TripletGroup == null || !this.PreviousBeat.TripletGroup.check(this)) {
			this.TripletGroup = new net.alphatab.tablature.model.TripletGroup(this.Index);
			this.TripletGroup.check(this);
		}
		else {
			this.TripletGroup = this.PreviousBeat.TripletGroup;
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.UpdateNoteVoice = function(layout) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::UpdateNoteVoice");
	var $spos = $s.length;
	this.JoinedType = net.alphatab.tablature.model.GsJoinedType.NoneRight;
	this.IsJoinedGreaterThanQuarter = false;
	this.Join1 = this;
	this.Join2 = this;
	var noteJoined = false;
	var withPrev = false;
	if(this.PreviousBeat != null && !this.PreviousBeat.IsRestVoice()) {
		if(this.Beat.Measure.CanJoin(layout.SongManager(),this,this.PreviousBeat)) {
			withPrev = true;
			if(this.PreviousBeat.Duration.Value >= this.Duration.Value) {
				this.Join1 = this.PreviousBeat;
				this.Join2 = this;
				this.JoinedType = net.alphatab.tablature.model.GsJoinedType.Left;
				noteJoined = true;
			}
			if(this.PreviousBeat.Duration.Value > 4) {
				this.IsJoinedGreaterThanQuarter = true;
			}
		}
	}
	if(this.NextBeat != null && !this.NextBeat.IsRestVoice()) {
		if(this.Beat.Measure.CanJoin(layout.SongManager(),this,this.NextBeat)) {
			if(this.NextBeat.Duration.Value >= this.Duration.Value) {
				this.Join2 = this.NextBeat;
				if(this.PreviousBeat == null || this.PreviousBeat.IsRestVoice() || this.PreviousBeat.Duration.Value < this.Duration.Value) this.Join1 = this;
				noteJoined = true;
				this.JoinedType = net.alphatab.tablature.model.GsJoinedType.Right;
			}
			if(this.NextBeat.Duration.Value > 4) this.IsJoinedGreaterThanQuarter = true;
		}
	}
	if(!noteJoined && withPrev) this.JoinedType = net.alphatab.tablature.model.GsJoinedType.NoneLeft;
	this.MinY = 0;
	this.MaxY = this.Beat.MeasureImpl().TrackImpl().TabHeight;
	if(this.BeatGroup.Direction == net.alphatab.model.GsVoiceDirection.Down) {
		this.MaxY += Math.floor((layout.StringSpacing / 2) * 5) + 1;
	}
	else {
		this.MinY -= Math.floor((layout.StringSpacing / 2) * 5) + 1;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.UpdateSilenceSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::UpdateSilenceSpacing");
	var $spos = $s.length;
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
					var voice = this.Beat.GetVoiceImpl(v);
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
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.UsedStrings = function() {
	$s.push("net.alphatab.tablature.model.GsVoiceImpl::UsedStrings");
	var $spos = $s.length;
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
	{
		var $tmp = this._usedStrings;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsVoiceImpl.prototype.Width = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype._hiddenSilence = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype._silenceHeight = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype._silenceY = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype._usedStrings = null;
net.alphatab.tablature.model.GsVoiceImpl.prototype.__class__ = net.alphatab.tablature.model.GsVoiceImpl;
if(!net.alphatab.platform) net.alphatab.platform = {}
net.alphatab.platform.Canvas = function() { }
net.alphatab.platform.Canvas.__name__ = ["net","alphatab","platform","Canvas"];
net.alphatab.platform.Canvas.prototype.Height = null;
net.alphatab.platform.Canvas.prototype.SetHeight = null;
net.alphatab.platform.Canvas.prototype.SetWidth = null;
net.alphatab.platform.Canvas.prototype.Width = null;
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
net.alphatab.platform.Canvas.prototype.lineTo = null;
net.alphatab.platform.Canvas.prototype.lineWidth = null;
net.alphatab.platform.Canvas.prototype.measureText = null;
net.alphatab.platform.Canvas.prototype.moveTo = null;
net.alphatab.platform.Canvas.prototype.quadraticCurveTo = null;
net.alphatab.platform.Canvas.prototype.rect = null;
net.alphatab.platform.Canvas.prototype.stroke = null;
net.alphatab.platform.Canvas.prototype.strokeRect = null;
net.alphatab.platform.Canvas.prototype.strokeStyle = null;
net.alphatab.platform.Canvas.prototype.strokeText = null;
net.alphatab.platform.Canvas.prototype.textAlign = null;
net.alphatab.platform.Canvas.prototype.textBaseline = null;
net.alphatab.platform.Canvas.prototype.__class__ = net.alphatab.platform.Canvas;
net.alphatab.platform.TextMetrics = function() { }
net.alphatab.platform.TextMetrics.__name__ = ["net","alphatab","platform","TextMetrics"];
net.alphatab.platform.TextMetrics.prototype.width = null;
net.alphatab.platform.TextMetrics.prototype.__class__ = net.alphatab.platform.TextMetrics;
net.alphatab.tablature.model.GsJoinedTypeConverter = function() { }
net.alphatab.tablature.model.GsJoinedTypeConverter.__name__ = ["net","alphatab","tablature","model","GsJoinedTypeConverter"];
net.alphatab.tablature.model.GsJoinedTypeConverter.ToInt = function(t) {
	$s.push("net.alphatab.tablature.model.GsJoinedTypeConverter::ToInt");
	var $spos = $s.length;
	switch(t) {
	case net.alphatab.tablature.model.GsJoinedType.NoneLeft:{
		{
			$s.pop();
			return 1;
		}
	}break;
	case net.alphatab.tablature.model.GsJoinedType.NoneRight:{
		{
			$s.pop();
			return 2;
		}
	}break;
	case net.alphatab.tablature.model.GsJoinedType.Left:{
		{
			$s.pop();
			return 3;
		}
	}break;
	case net.alphatab.tablature.model.GsJoinedType.Right:{
		{
			$s.pop();
			return 4;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsJoinedTypeConverter.prototype.__class__ = net.alphatab.tablature.model.GsJoinedTypeConverter;
net.alphatab.model.GsMixTableChange = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsMixTableChange::new");
	var $spos = $s.length;
	this.Volume = new net.alphatab.model.GsMixTableItem();
	this.Balance = new net.alphatab.model.GsMixTableItem();
	this.Chorus = new net.alphatab.model.GsMixTableItem();
	this.Reverb = new net.alphatab.model.GsMixTableItem();
	this.Phaser = new net.alphatab.model.GsMixTableItem();
	this.Tremolo = new net.alphatab.model.GsMixTableItem();
	this.Instrument = new net.alphatab.model.GsMixTableItem();
	this.Tempo = new net.alphatab.model.GsMixTableItem();
	this.HideTempo = true;
	$s.pop();
}}
net.alphatab.model.GsMixTableChange.__name__ = ["net","alphatab","model","GsMixTableChange"];
net.alphatab.model.GsMixTableChange.prototype.Balance = null;
net.alphatab.model.GsMixTableChange.prototype.Chorus = null;
net.alphatab.model.GsMixTableChange.prototype.HideTempo = null;
net.alphatab.model.GsMixTableChange.prototype.Instrument = null;
net.alphatab.model.GsMixTableChange.prototype.Phaser = null;
net.alphatab.model.GsMixTableChange.prototype.Reverb = null;
net.alphatab.model.GsMixTableChange.prototype.Tempo = null;
net.alphatab.model.GsMixTableChange.prototype.TempoName = null;
net.alphatab.model.GsMixTableChange.prototype.Tremolo = null;
net.alphatab.model.GsMixTableChange.prototype.Volume = null;
net.alphatab.model.GsMixTableChange.prototype.__class__ = net.alphatab.model.GsMixTableChange;
net.alphatab.model.GsNoteEffect = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsNoteEffect::new");
	var $spos = $s.length;
	this.Bend = null;
	this.TremoloBar = null;
	this.Harmonic = null;
	this.Grace = null;
	this.Trill = null;
	this.TremoloPicking = null;
	this.Vibrato = false;
	this.BeatVibrato = false;
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
	$s.pop();
}}
net.alphatab.model.GsNoteEffect.__name__ = ["net","alphatab","model","GsNoteEffect"];
net.alphatab.model.GsNoteEffect.prototype.AccentuatedNote = null;
net.alphatab.model.GsNoteEffect.prototype.BeatVibrato = null;
net.alphatab.model.GsNoteEffect.prototype.Bend = null;
net.alphatab.model.GsNoteEffect.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.GsNoteEffect::Clone");
	var $spos = $s.length;
	var effect = factory.NewEffect();
	effect.Vibrato = this.Vibrato;
	effect.BeatVibrato = this.BeatVibrato;
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
	{
		$s.pop();
		return effect;
	}
	$s.pop();
}
net.alphatab.model.GsNoteEffect.prototype.DeadNote = null;
net.alphatab.model.GsNoteEffect.prototype.FadeIn = null;
net.alphatab.model.GsNoteEffect.prototype.GhostNote = null;
net.alphatab.model.GsNoteEffect.prototype.Grace = null;
net.alphatab.model.GsNoteEffect.prototype.Hammer = null;
net.alphatab.model.GsNoteEffect.prototype.Harmonic = null;
net.alphatab.model.GsNoteEffect.prototype.HeavyAccentuatedNote = null;
net.alphatab.model.GsNoteEffect.prototype.IsBend = function() {
	$s.push("net.alphatab.model.GsNoteEffect::IsBend");
	var $spos = $s.length;
	{
		var $tmp = this.Bend != null && this.Bend.Points.length != 0;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsNoteEffect.prototype.IsGrace = function() {
	$s.push("net.alphatab.model.GsNoteEffect::IsGrace");
	var $spos = $s.length;
	{
		var $tmp = this.Grace != null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsNoteEffect.prototype.IsHarmonic = function() {
	$s.push("net.alphatab.model.GsNoteEffect::IsHarmonic");
	var $spos = $s.length;
	{
		var $tmp = this.Harmonic != null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsNoteEffect.prototype.IsTremoloBar = function() {
	$s.push("net.alphatab.model.GsNoteEffect::IsTremoloBar");
	var $spos = $s.length;
	{
		var $tmp = this.TremoloBar != null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsNoteEffect.prototype.IsTremoloPicking = function() {
	$s.push("net.alphatab.model.GsNoteEffect::IsTremoloPicking");
	var $spos = $s.length;
	{
		var $tmp = this.TremoloPicking != null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsNoteEffect.prototype.IsTrill = function() {
	$s.push("net.alphatab.model.GsNoteEffect::IsTrill");
	var $spos = $s.length;
	{
		var $tmp = this.Trill != null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsNoteEffect.prototype.LetRing = null;
net.alphatab.model.GsNoteEffect.prototype.PalmMute = null;
net.alphatab.model.GsNoteEffect.prototype.Popping = null;
net.alphatab.model.GsNoteEffect.prototype.Slapping = null;
net.alphatab.model.GsNoteEffect.prototype.Slide = null;
net.alphatab.model.GsNoteEffect.prototype.SlideType = null;
net.alphatab.model.GsNoteEffect.prototype.Staccato = null;
net.alphatab.model.GsNoteEffect.prototype.Tapping = null;
net.alphatab.model.GsNoteEffect.prototype.TremoloBar = null;
net.alphatab.model.GsNoteEffect.prototype.TremoloPicking = null;
net.alphatab.model.GsNoteEffect.prototype.Trill = null;
net.alphatab.model.GsNoteEffect.prototype.Vibrato = null;
net.alphatab.model.GsNoteEffect.prototype.__class__ = net.alphatab.model.GsNoteEffect;
net.alphatab.model.effects.GsBendTypesConverter = function() { }
net.alphatab.model.effects.GsBendTypesConverter.__name__ = ["net","alphatab","model","effects","GsBendTypesConverter"];
net.alphatab.model.effects.GsBendTypesConverter.FromInt = function(i) {
	$s.push("net.alphatab.model.effects.GsBendTypesConverter::FromInt");
	var $spos = $s.length;
	switch(i) {
	case 0:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.None;
			$s.pop();
			return $tmp;
		}
	}break;
	case 1:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.Bend;
			$s.pop();
			return $tmp;
		}
	}break;
	case 2:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.BendRelease;
			$s.pop();
			return $tmp;
		}
	}break;
	case 3:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.BendReleaseBend;
			$s.pop();
			return $tmp;
		}
	}break;
	case 4:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.Prebend;
			$s.pop();
			return $tmp;
		}
	}break;
	case 5:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.PrebendRelease;
			$s.pop();
			return $tmp;
		}
	}break;
	case 6:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.Dip;
			$s.pop();
			return $tmp;
		}
	}break;
	case 7:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.Dive;
			$s.pop();
			return $tmp;
		}
	}break;
	case 8:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.ReleaseUp;
			$s.pop();
			return $tmp;
		}
	}break;
	case 9:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.InvertedDip;
			$s.pop();
			return $tmp;
		}
	}break;
	case 10:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.Return;
			$s.pop();
			return $tmp;
		}
	}break;
	case 11:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.ReleaseDown;
			$s.pop();
			return $tmp;
		}
	}break;
	default:{
		{
			var $tmp = net.alphatab.model.effects.GsBendTypes.None;
			$s.pop();
			return $tmp;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.model.effects.GsBendTypesConverter.prototype.__class__ = net.alphatab.model.effects.GsBendTypesConverter;
if(typeof js=='undefined') js = {}
js.Boot = function() { }
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	$s.push("js.Boot::__unhtml");
	var $spos = $s.length;
	{
		var $tmp = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
js.Boot.__trace = function(v,i) {
	$s.push("js.Boot::__trace");
	var $spos = $s.length;
	var msg = (i != null?((i.fileName + ":") + i.lineNumber) + ": ":"");
	msg += js.Boot.__unhtml(js.Boot.__string_rec(v,"")) + "<br/>";
	var d = document.getElementById("haxe:trace");
	if(d == null) alert("No haxe:trace element defined\n" + msg);
	else d.innerHTML += msg;
	$s.pop();
}
js.Boot.__clear_trace = function() {
	$s.push("js.Boot::__clear_trace");
	var $spos = $s.length;
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
	else null;
	$s.pop();
}
js.Boot.__closure = function(o,f) {
	$s.push("js.Boot::__closure");
	var $spos = $s.length;
	var m = o[f];
	if(m == null) {
		$s.pop();
		return null;
	}
	var f1 = function() {
		$s.push("js.Boot::__closure@67");
		var $spos = $s.length;
		{
			var $tmp = m.apply(o,arguments);
			$s.pop();
			return $tmp;
		}
		$s.pop();
	}
	f1.scope = o;
	f1.method = m;
	{
		$s.pop();
		return f1;
	}
	$s.pop();
}
js.Boot.__string_rec = function(o,s) {
	$s.push("js.Boot::__string_rec");
	var $spos = $s.length;
	if(o == null) {
		$s.pop();
		return "null";
	}
	if(s.length >= 5) {
		$s.pop();
		return "<...>";
	}
	var t = typeof(o);
	if(t == "function" && (o.__name__ != null || o.__ename__ != null)) t = "object";
	switch(t) {
	case "object":{
		if(o instanceof Array) {
			if(o.__enum__ != null) {
				if(o.length == 2) {
					var $tmp = o[0];
					$s.pop();
					return $tmp;
				}
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
				{
					var $tmp = str + ")";
					$s.pop();
					return $tmp;
				}
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
			{
				$s.pop();
				return str;
			}
		}
		var tostr;
		try {
			tostr = o.toString;
		}
		catch( $e8 ) {
			{
				var e = $e8;
				{
					$e = [];
					while($s.length >= $spos) $e.unshift($s.pop());
					$s.push($e[0]);
					{
						$s.pop();
						return "???";
					}
				}
			}
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") {
				$s.pop();
				return s2;
			}
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
		{
			$s.pop();
			return str;
		}
	}break;
	case "function":{
		{
			$s.pop();
			return "<function>";
		}
	}break;
	case "string":{
		{
			$s.pop();
			return o;
		}
	}break;
	default:{
		{
			var $tmp = String(o);
			$s.pop();
			return $tmp;
		}
	}break;
	}
	$s.pop();
}
js.Boot.__interfLoop = function(cc,cl) {
	$s.push("js.Boot::__interfLoop");
	var $spos = $s.length;
	if(cc == null) {
		$s.pop();
		return false;
	}
	if(cc == cl) {
		$s.pop();
		return true;
	}
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) {
				$s.pop();
				return true;
			}
		}
	}
	{
		var $tmp = js.Boot.__interfLoop(cc.__super__,cl);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
js.Boot.__instanceof = function(o,cl) {
	$s.push("js.Boot::__instanceof");
	var $spos = $s.length;
	try {
		if(o instanceof cl) {
			if(cl == Array) {
				var $tmp = (o.__enum__ == null);
				$s.pop();
				return $tmp;
			}
			{
				$s.pop();
				return true;
			}
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) {
			$s.pop();
			return true;
		}
	}
	catch( $e9 ) {
		{
			var e = $e9;
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				if(cl == null) {
					$s.pop();
					return false;
				}
			}
		}
	}
	switch(cl) {
	case Int:{
		{
			var $tmp = Math.ceil(o%2147483648.0) === o;
			$s.pop();
			return $tmp;
		}
	}break;
	case Float:{
		{
			var $tmp = typeof(o) == "number";
			$s.pop();
			return $tmp;
		}
	}break;
	case Bool:{
		{
			var $tmp = o === true || o === false;
			$s.pop();
			return $tmp;
		}
	}break;
	case String:{
		{
			var $tmp = typeof(o) == "string";
			$s.pop();
			return $tmp;
		}
	}break;
	case Dynamic:{
		{
			$s.pop();
			return true;
		}
	}break;
	default:{
		if(o == null) {
			$s.pop();
			return false;
		}
		{
			var $tmp = o.__enum__ == cl || (cl == Class && o.__name__ != null) || (cl == Enum && o.__ename__ != null);
			$s.pop();
			return $tmp;
		}
	}break;
	}
	$s.pop();
}
js.Boot.__init = function() {
	$s.push("js.Boot::__init");
	var $spos = $s.length;
	js.Lib.isIE = (typeof document!='undefined' && document.all != null && typeof window!='undefined' && window.opera == null);
	js.Lib.isOpera = (typeof window!='undefined' && window.opera != null);
	Array.prototype.copy = Array.prototype.slice;
	Array.prototype.insert = function(i,x) {
		$s.push("js.Boot::__init@205");
		var $spos = $s.length;
		this.splice(i,0,x);
		$s.pop();
	}
	Array.prototype.remove = (Array.prototype.indexOf?function(obj) {
		$s.push("js.Boot::__init@208");
		var $spos = $s.length;
		var idx = this.indexOf(obj);
		if(idx == -1) {
			$s.pop();
			return false;
		}
		this.splice(idx,1);
		{
			$s.pop();
			return true;
		}
		$s.pop();
	}:function(obj) {
		$s.push("js.Boot::__init@213");
		var $spos = $s.length;
		var i = 0;
		var l = this.length;
		while(i < l) {
			if(this[i] == obj) {
				this.splice(i,1);
				{
					$s.pop();
					return true;
				}
			}
			i++;
		}
		{
			$s.pop();
			return false;
		}
		$s.pop();
	});
	Array.prototype.iterator = function() {
		$s.push("js.Boot::__init@225");
		var $spos = $s.length;
		{
			var $tmp = { cur : 0, arr : this, hasNext : function() {
				$s.push("js.Boot::__init@225@229");
				var $spos = $s.length;
				{
					var $tmp = this.cur < this.arr.length;
					$s.pop();
					return $tmp;
				}
				$s.pop();
			}, next : function() {
				$s.push("js.Boot::__init@225@232");
				var $spos = $s.length;
				{
					var $tmp = this.arr[this.cur++];
					$s.pop();
					return $tmp;
				}
				$s.pop();
			}}
			$s.pop();
			return $tmp;
		}
		$s.pop();
	}
	var cca = String.prototype.charCodeAt;
	String.prototype.cca = cca;
	String.prototype.charCodeAt = function(i) {
		$s.push("js.Boot::__init@239");
		var $spos = $s.length;
		var x = cca.call(this,i);
		if(isNaN(x)) {
			$s.pop();
			return null;
		}
		{
			$s.pop();
			return x;
		}
		$s.pop();
	}
	var oldsub = String.prototype.substr;
	String.prototype.substr = function(pos,len) {
		$s.push("js.Boot::__init@246");
		var $spos = $s.length;
		if(pos != null && pos != 0 && len != null && len < 0) {
			$s.pop();
			return "";
		}
		if(len == null) len = this.length;
		if(pos < 0) {
			pos = this.length + pos;
			if(pos < 0) pos = 0;
		}
		else if(len < 0) {
			len = (this.length + len) - pos;
		}
		{
			var $tmp = oldsub.apply(this,[pos,len]);
			$s.pop();
			return $tmp;
		}
		$s.pop();
	}
	$closure = js.Boot.__closure;
	$s.pop();
}
js.Boot.prototype.__class__ = js.Boot;
net.alphatab.model.GsTripletFeel = { __ename__ : ["net","alphatab","model","GsTripletFeel"], __constructs__ : ["None","Eighth","Sixteenth"] }
net.alphatab.model.GsTripletFeel.Eighth = ["Eighth",1];
net.alphatab.model.GsTripletFeel.Eighth.toString = $estr;
net.alphatab.model.GsTripletFeel.Eighth.__enum__ = net.alphatab.model.GsTripletFeel;
net.alphatab.model.GsTripletFeel.None = ["None",0];
net.alphatab.model.GsTripletFeel.None.toString = $estr;
net.alphatab.model.GsTripletFeel.None.__enum__ = net.alphatab.model.GsTripletFeel;
net.alphatab.model.GsTripletFeel.Sixteenth = ["Sixteenth",2];
net.alphatab.model.GsTripletFeel.Sixteenth.toString = $estr;
net.alphatab.model.GsTripletFeel.Sixteenth.__enum__ = net.alphatab.model.GsTripletFeel;
net.alphatab.model.GsMeasureClef = { __ename__ : ["net","alphatab","model","GsMeasureClef"], __constructs__ : ["Treble","Bass","Tenor","Alto"] }
net.alphatab.model.GsMeasureClef.Alto = ["Alto",3];
net.alphatab.model.GsMeasureClef.Alto.toString = $estr;
net.alphatab.model.GsMeasureClef.Alto.__enum__ = net.alphatab.model.GsMeasureClef;
net.alphatab.model.GsMeasureClef.Bass = ["Bass",1];
net.alphatab.model.GsMeasureClef.Bass.toString = $estr;
net.alphatab.model.GsMeasureClef.Bass.__enum__ = net.alphatab.model.GsMeasureClef;
net.alphatab.model.GsMeasureClef.Tenor = ["Tenor",2];
net.alphatab.model.GsMeasureClef.Tenor.toString = $estr;
net.alphatab.model.GsMeasureClef.Tenor.__enum__ = net.alphatab.model.GsMeasureClef;
net.alphatab.model.GsMeasureClef.Treble = ["Treble",0];
net.alphatab.model.GsMeasureClef.Treble.toString = $estr;
net.alphatab.model.GsMeasureClef.Treble.__enum__ = net.alphatab.model.GsMeasureClef;
net.alphatab.model.GsMeasure = function(header) { if( header === $_ ) return; {
	$s.push("net.alphatab.model.GsMeasure::new");
	var $spos = $s.length;
	this.Header = header;
	this.Clef = net.alphatab.model.GsMeasureClef.Treble;
	this.Beats = new Array();
	$s.pop();
}}
net.alphatab.model.GsMeasure.__name__ = ["net","alphatab","model","GsMeasure"];
net.alphatab.model.GsMeasure.prototype.AddBeat = function(beat) {
	$s.push("net.alphatab.model.GsMeasure::AddBeat");
	var $spos = $s.length;
	beat.Measure = this;
	this.Beats.push(beat);
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.BeatCount = function() {
	$s.push("net.alphatab.model.GsMeasure::BeatCount");
	var $spos = $s.length;
	{
		var $tmp = this.Beats.length;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.Beats = null;
net.alphatab.model.GsMeasure.prototype.Clef = null;
net.alphatab.model.GsMeasure.prototype.End = function() {
	$s.push("net.alphatab.model.GsMeasure::End");
	var $spos = $s.length;
	{
		var $tmp = this.Start() + this.Length();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.GetKeySignature = function() {
	$s.push("net.alphatab.model.GsMeasure::GetKeySignature");
	var $spos = $s.length;
	{
		var $tmp = this.Header.KeySignature;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.GetMarker = function() {
	$s.push("net.alphatab.model.GsMeasure::GetMarker");
	var $spos = $s.length;
	{
		var $tmp = this.Header.Marker;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.GetTempo = function() {
	$s.push("net.alphatab.model.GsMeasure::GetTempo");
	var $spos = $s.length;
	{
		var $tmp = this.Header.Tempo;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.GetTimeSignature = function() {
	$s.push("net.alphatab.model.GsMeasure::GetTimeSignature");
	var $spos = $s.length;
	{
		var $tmp = this.Header.TimeSignature;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.GetTripletFeel = function() {
	$s.push("net.alphatab.model.GsMeasure::GetTripletFeel");
	var $spos = $s.length;
	{
		var $tmp = this.Header.TripletFeel;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.HasMarker = function() {
	$s.push("net.alphatab.model.GsMeasure::HasMarker");
	var $spos = $s.length;
	{
		var $tmp = this.Header.HasMarker();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.Header = null;
net.alphatab.model.GsMeasure.prototype.IsRepeatOpen = function() {
	$s.push("net.alphatab.model.GsMeasure::IsRepeatOpen");
	var $spos = $s.length;
	{
		var $tmp = this.Header.IsRepeatOpen;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.KeySignature = function() {
	$s.push("net.alphatab.model.GsMeasure::KeySignature");
	var $spos = $s.length;
	{
		var $tmp = this.Header.KeySignature;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.Length = function() {
	$s.push("net.alphatab.model.GsMeasure::Length");
	var $spos = $s.length;
	{
		var $tmp = this.Header.Length();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.Number = function() {
	$s.push("net.alphatab.model.GsMeasure::Number");
	var $spos = $s.length;
	{
		var $tmp = this.Header.Number;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.RepeatClose = function() {
	$s.push("net.alphatab.model.GsMeasure::RepeatClose");
	var $spos = $s.length;
	{
		var $tmp = this.Header.RepeatClose;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.Start = function() {
	$s.push("net.alphatab.model.GsMeasure::Start");
	var $spos = $s.length;
	{
		var $tmp = this.Header.Start;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasure.prototype.Track = null;
net.alphatab.model.GsMeasure.prototype.__class__ = net.alphatab.model.GsMeasure;
if(!net.alphatab.file.alphatab) net.alphatab.file.alphatab = {}
net.alphatab.file.alphatab.AlphaTabWriter = function() { }
net.alphatab.file.alphatab.AlphaTabWriter.__name__ = ["net","alphatab","file","alphatab","AlphaTabWriter"];
net.alphatab.file.alphatab.AlphaTabWriter.GetAsciiTab = function(track) {
	$s.push("net.alphatab.file.alphatab.AlphaTabWriter::GetAsciiTab");
	var $spos = $s.length;
	var str = "";
	str += net.alphatab.file.alphatab.AlphaTabWriter.WriteMetaData(track);
	str += net.alphatab.file.alphatab.AlphaTabWriter.WriteMeasures(track);
	{
		$s.pop();
		return str;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabWriter.WriteMetaData = function(track) {
	$s.push("net.alphatab.file.alphatab.AlphaTabWriter::WriteMetaData");
	var $spos = $s.length;
	var str = "";
	var song = track.Song;
	if(song.Title != "") {
		str += ("\\title '" + song.Title) + "'\n";
	}
	if(song.Subtitle != "") {
		str += ("\\subtitle '" + song.Subtitle) + "'\n";
	}
	if(song.Artist != "") {
		str += ("\\artist '" + song.Artist) + "'\n";
	}
	if(song.Album != "") {
		str += ("\\album '" + song.Album) + "'\n";
	}
	if(song.Words != "") {
		str += ("\\words '" + song.Words) + "'\n";
	}
	if(song.Music != "") {
		str += ("\\music '" + song.Music) + "'\n";
	}
	if(song.Copyright != "") {
		str += ("\\copyright '" + song.Copyright) + "'\n";
	}
	if(song.Tab != "") {
		str += ("\\tab '" + song.Tab) + "'\n";
	}
	str += "\\tuning ";
	{
		var _g = 0, _g1 = track.Strings;
		while(_g < _g1.length) {
			var string = _g1[_g];
			++_g;
			str += net.alphatab.file.alphatab.AlphaTabWriter.ParseTuning(string) + " ";
		}
	}
	str += "\n";
	str += ("\\tempo " + song.Tempo) + "\n";
	str += ".\n";
	{
		$s.pop();
		return str;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabWriter.ParseTuning = function(string) {
	$s.push("net.alphatab.file.alphatab.AlphaTabWriter::ParseTuning");
	var $spos = $s.length;
	var tuning = string.Value;
	var octave = Math.floor(tuning / 12);
	var note = tuning % 12;
	var base = "";
	if(note == 0) {
		base = "c";
	}
	else if(note == 1) {
		base = "db";
	}
	else if(note == 2) {
		base = "d";
	}
	else if(note == 3) {
		base = "eb";
	}
	else if(note == 4) {
		base = "e";
	}
	else if(note == 5) {
		base = "f";
	}
	else if(note == 6) {
		base = "gb";
	}
	else if(note == 7) {
		base = "g";
	}
	else if(note == 8) {
		base = "ab";
	}
	else if(note == 9) {
		base = "a";
	}
	else if(note == 10) {
		base = "bb";
	}
	else {
		base = "b";
	}
	{
		var $tmp = base + Std.string(octave);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabWriter.WriteMeasures = function(track) {
	$s.push("net.alphatab.file.alphatab.AlphaTabWriter::WriteMeasures");
	var $spos = $s.length;
	var str = "";
	{
		var _g1 = 0, _g = track.MeasureCount();
		while(_g1 < _g) {
			var i = _g1++;
			var measure = track.Measures[i];
			str += net.alphatab.file.alphatab.AlphaTabWriter.WriteMeasureMeta(i,track);
			str += net.alphatab.file.alphatab.AlphaTabWriter.WriteBeats(measure);
			if(i < (track.MeasureCount() - 1)) str += "|";
		}
	}
	{
		$s.pop();
		return str;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabWriter.WriteMeasureMeta = function(i,track) {
	$s.push("net.alphatab.file.alphatab.AlphaTabWriter::WriteMeasureMeta");
	var $spos = $s.length;
	var measure = track.Measures[i];
	var str = "";
	if(i == 0 || measure.GetTimeSignature().Numerator != track.Measures[i - 1].GetTimeSignature().Numerator || measure.GetTimeSignature().Denominator.Value != track.Measures[i - 1].GetTimeSignature().Denominator.Value) {
		str += ((("\\ts " + measure.GetTimeSignature().Numerator) + " ") + measure.GetTimeSignature().Denominator.Value) + "\n";
	}
	if(measure.IsRepeatOpen()) {
		str += "\\ro\n";
	}
	if(measure.RepeatClose() > 0) {
		str += ("\\rc " + measure.RepeatClose()) + "\n";
	}
	if(i == 0 || measure.GetKeySignature() != track.Measures[i - 1].GetKeySignature() && measure.GetKeySignature() != 0) {
		str += ("\\ks " + net.alphatab.file.alphatab.AlphaTabWriter.ParseKeySignature(measure.GetKeySignature())) + "\n";
	}
	if(i == 0 || measure.Clef != track.Measures[i - 1].Clef) {
		str += ("\\clef " + net.alphatab.model.GsMeasureClefConverter.ToString(measure.Clef)) + "\n";
	}
	if(i == 0 || measure.GetTempo().Value != track.Measures[i - 1].GetTempo().Value) {
		str += ("\\tempo " + measure.GetTempo().Value) + "\n";
	}
	{
		$s.pop();
		return str;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabWriter.WriteBeats = function(measure) {
	$s.push("net.alphatab.file.alphatab.AlphaTabWriter::WriteBeats");
	var $spos = $s.length;
	var str = "";
	{
		var _g1 = 0, _g = measure.BeatCount();
		while(_g1 < _g) {
			var i = _g1++;
			var beat = measure.Beats[i];
			var notes = beat.GetNotes();
			if(beat.IsRestBeat()) {
				str += "r ";
			}
			else {
				if(notes.length > 1) str += "(";
				{
					var _g3 = 0, _g2 = notes.length;
					while(_g3 < _g2) {
						var i1 = _g3++;
						var note = notes[i1];
						str += (note.Value + ".") + note.String;
						if(notes.length == 1 || i1 < (notes.length - 1)) str += " ";
					}
				}
				if(notes.length > 1) str += ")";
			}
			str += ("." + beat.Voices[0].Duration.Value) + " ";
		}
	}
	{
		$s.pop();
		return str;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabWriter.ParseKeySignature = function(sig) {
	$s.push("net.alphatab.file.alphatab.AlphaTabWriter::ParseKeySignature");
	var $spos = $s.length;
	switch(sig) {
	case -7:{
		{
			$s.pop();
			return "cb";
		}
	}break;
	case -6:{
		{
			$s.pop();
			return "gb";
		}
	}break;
	case -5:{
		{
			$s.pop();
			return "db";
		}
	}break;
	case -4:{
		{
			$s.pop();
			return "ab";
		}
	}break;
	case -3:{
		{
			$s.pop();
			return "eb";
		}
	}break;
	case -2:{
		{
			$s.pop();
			return "bb";
		}
	}break;
	case -1:{
		{
			$s.pop();
			return "f";
		}
	}break;
	case 0:{
		{
			$s.pop();
			return "c";
		}
	}break;
	case 1:{
		{
			$s.pop();
			return "g";
		}
	}break;
	case 2:{
		{
			$s.pop();
			return "d";
		}
	}break;
	case 3:{
		{
			$s.pop();
			return "a";
		}
	}break;
	case 4:{
		{
			$s.pop();
			return "e";
		}
	}break;
	case 5:{
		{
			$s.pop();
			return "b";
		}
	}break;
	case 6:{
		{
			$s.pop();
			return "f#";
		}
	}break;
	case 7:{
		{
			$s.pop();
			return "c#";
		}
	}break;
	default:{
		{
			$s.pop();
			return "c";
		}
	}break;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabWriter.prototype.__class__ = net.alphatab.file.alphatab.AlphaTabWriter;
net.alphatab.model.GsLyrics = function(trackChoice) { if( trackChoice === $_ ) return; {
	$s.push("net.alphatab.model.GsLyrics::new");
	var $spos = $s.length;
	if(trackChoice == null) trackChoice = 0;
	this.TrackChoice = trackChoice;
	this.Lines = new Array();
	$s.pop();
}}
net.alphatab.model.GsLyrics.__name__ = ["net","alphatab","model","GsLyrics"];
net.alphatab.model.GsLyrics.prototype.Lines = null;
net.alphatab.model.GsLyrics.prototype.LyricsBeats = function() {
	$s.push("net.alphatab.model.GsLyrics::LyricsBeats");
	var $spos = $s.length;
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
	{
		var $tmp = ret.split(" ");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsLyrics.prototype.TrackChoice = null;
net.alphatab.model.GsLyrics.prototype.__class__ = net.alphatab.model.GsLyrics;
net.alphatab.tablature.model.GsLyricsImpl = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsLyricsImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsLyrics.apply(this,[]);
	$s.pop();
}}
net.alphatab.tablature.model.GsLyricsImpl.__name__ = ["net","alphatab","tablature","model","GsLyricsImpl"];
net.alphatab.tablature.model.GsLyricsImpl.__super__ = net.alphatab.model.GsLyrics;
for(var k in net.alphatab.model.GsLyrics.prototype ) net.alphatab.tablature.model.GsLyricsImpl.prototype[k] = net.alphatab.model.GsLyrics.prototype[k];
net.alphatab.tablature.model.GsLyricsImpl.prototype.PaintCurrentNoteBeats = function(context,layout,currentMeasure,x,y) {
	$s.push("net.alphatab.tablature.model.GsLyricsImpl::PaintCurrentNoteBeats");
	var $spos = $s.length;
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
							context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).AddString(str,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,realX + 13,y + currentMeasure.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.Lyric));
						}
					}
					beatIndex++;
				}
			}
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsLyricsImpl.prototype.__class__ = net.alphatab.tablature.model.GsLyricsImpl;
net.alphatab.tablature.drawing.DrawingLayersConverter = function() { }
net.alphatab.tablature.drawing.DrawingLayersConverter.__name__ = ["net","alphatab","tablature","drawing","DrawingLayersConverter"];
net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt = function(layer) {
	$s.push("net.alphatab.tablature.drawing.DrawingLayersConverter::ToInt");
	var $spos = $s.length;
	switch(layer) {
	case net.alphatab.tablature.drawing.DrawingLayers.Background:{
		{
			$s.pop();
			return 0;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground:{
		{
			$s.pop();
			return 1;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.Lines:{
		{
			$s.pop();
			return 2;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.MainComponents:{
		{
			$s.pop();
			return 3;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw:{
		{
			$s.pop();
			return 4;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.Voice2:{
		{
			$s.pop();
			return 5;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2:{
		{
			$s.pop();
			return 6;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2:{
		{
			$s.pop();
			return 7;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2:{
		{
			$s.pop();
			return 8;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.Voice1:{
		{
			$s.pop();
			return 9;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1:{
		{
			$s.pop();
			return 10;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1:{
		{
			$s.pop();
			return 11;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1:{
		{
			$s.pop();
			return 12;
		}
	}break;
	case net.alphatab.tablature.drawing.DrawingLayers.Red:{
		{
			$s.pop();
			return 13;
		}
	}break;
	default:{
		{
			$s.pop();
			return 0;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingLayersConverter.prototype.__class__ = net.alphatab.tablature.drawing.DrawingLayersConverter;
net.alphatab.tablature.drawing.NotePainter = function() { }
net.alphatab.tablature.drawing.NotePainter.__name__ = ["net","alphatab","tablature","drawing","NotePainter"];
net.alphatab.tablature.drawing.NotePainter.PaintFooter = function(layer,x,y,dur,dir,layout) {
	$s.push("net.alphatab.tablature.drawing.NotePainter::PaintFooter");
	var $spos = $s.length;
	var scale = layout.Scale;
	if(dir == -1) {
		x += net.alphatab.tablature.drawing.DrawingResources.GetScoreNoteSize(layout,false).Width;
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
	if(s != "") layer.AddMusicSymbol(s,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.NotePainter.PaintBar = function(layer,x1,y1,x2,y2,count,dir,scale) {
	$s.push("net.alphatab.tablature.drawing.NotePainter::PaintBar");
	var $spos = $s.length;
	var width = Math.max(1.0,Math.round(3.0 * scale));
	{
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			var realY1 = (y1 - ((i * (5.0 * scale)) * dir));
			var realY2 = (y2 - ((i * (5.0 * scale)) * dir));
			layer.StartFigure();
			layer.AddPolygon([new net.alphatab.model.PointF(x1,realY1),new net.alphatab.model.PointF(x2,realY2),new net.alphatab.model.PointF(x2,realY2 + width),new net.alphatab.model.PointF(x1,realY1 + width),new net.alphatab.model.PointF(x1,realY1)]);
			layer.CloseFigure();
		}
	}
	$s.pop();
}
net.alphatab.tablature.drawing.NotePainter.PaintHarmonic = function(layer,x,y,scale) {
	$s.push("net.alphatab.tablature.drawing.NotePainter::PaintHarmonic");
	var $spos = $s.length;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.Harmonic,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.NotePainter.PaintNote = function(layer,x,y,scale,full,font) {
	$s.push("net.alphatab.tablature.drawing.NotePainter::PaintNote");
	var $spos = $s.length;
	var symbol = (full?net.alphatab.tablature.drawing.MusicFont.NoteQuarter:net.alphatab.tablature.drawing.MusicFont.NoteHalf);
	layer.AddMusicSymbol(symbol,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.NotePainter.PaintDeadNote = function(layer,x,y,scale,font) {
	$s.push("net.alphatab.tablature.drawing.NotePainter::PaintDeadNote");
	var $spos = $s.length;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.DeadNote,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.NotePainter.prototype.__class__ = net.alphatab.tablature.drawing.NotePainter;
net.alphatab.file.alphatab.AlphaTabParser = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::new");
	var $spos = $s.length;
	net.alphatab.file.SongReader.apply(this,[]);
	$s.pop();
}}
net.alphatab.file.alphatab.AlphaTabParser.__name__ = ["net","alphatab","file","alphatab","AlphaTabParser"];
net.alphatab.file.alphatab.AlphaTabParser.__super__ = net.alphatab.file.SongReader;
for(var k in net.alphatab.file.SongReader.prototype ) net.alphatab.file.alphatab.AlphaTabParser.prototype[k] = net.alphatab.file.SongReader.prototype[k];
net.alphatab.file.alphatab.AlphaTabParser.IsLetter = function(ch) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::IsLetter");
	var $spos = $s.length;
	var code = ch.charCodeAt(0);
	{
		var $tmp = (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code > 128);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.IsDigit = function(ch) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::IsDigit");
	var $spos = $s.length;
	var code = ch.charCodeAt(0);
	{
		var $tmp = (code >= 48 && code <= 87);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.IsVersion = function(name) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::IsVersion");
	var $spos = $s.length;
	{
		var $tmp = name.toLowerCase() == "alphaTab0.1";
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.IsTuning = function(name) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::IsTuning");
	var $spos = $s.length;
	var regex = new EReg("([a-g]b?)([0-9])","i");
	{
		var $tmp = regex.match(name);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.Beat = function(measure) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::Beat");
	var $spos = $s.length;
	var beat = this.Factory.NewBeat();
	beat.Start = 0;
	if(measure.BeatCount() == 0) {
		beat.Start = measure.Start();
	}
	else {
		var index = measure.Beats.length - 1;
		beat.Start = measure.Beats[index].Start + measure.Beats[index].Voices[0].Duration.Time();
	}
	var voice = beat.Voices[0];
	voice.IsEmpty = false;
	if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.LParensis) {
		this.NewSy();
		voice.AddNote(this.Note());
		while(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.RParensis && this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Eof) {
			voice.AddNote(this.Note());
		}
		if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.RParensis) {
			throw new net.alphatab.file.FileFormatException((("Expected ) found \"" + this._syData) + "\" on position ") + this._curChPos);
		}
		this.NewSy();
	}
	else if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String && Std.string(this._syData).toLowerCase() == "r") {
		this.NewSy();
	}
	else {
		voice.AddNote(this.Note());
	}
	if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Dot) {
		throw new net.alphatab.file.FileFormatException((("Expected Dot found \"" + this._syData) + "\" on position ") + this._curChPos);
	}
	this.NewSy();
	if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Number) {
		throw new net.alphatab.file.FileFormatException((("Expected Number found \"" + this._syData) + "\" on position ") + this._curChPos);
	}
	if(this._syData == 1 || this._syData == 2 || this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) {
		voice.Duration.Value = this._syData;
	}
	else {
		throw new net.alphatab.file.FileFormatException((("Invalid Beat Duration found \"" + this._syData) + "\" on position ") + this._curChPos);
	}
	this.NewSy();
	measure.AddBeat(beat);
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.CreateDefaultSong = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::CreateDefaultSong");
	var $spos = $s.length;
	this._song = this.Factory.NewSong();
	this._song.Tempo = 120;
	this._song.TempoName = "";
	this._song.HideTempo = false;
	this._song.PageSetup = net.alphatab.model.GsPageSetup.Defaults();
	this._track = this.Factory.NewTrack();
	this._track.Number = 1;
	this._track.Channel.Instrument(25);
	this._track.Channel.Channel = net.alphatab.file.alphatab.AlphaTabParser.TrackChannels[0];
	this._track.Channel.EffectChannel = net.alphatab.file.alphatab.AlphaTabParser.TrackChannels[1];
	this.CreateDefaultStrings(this._track.Strings);
	this._song.AddTrack(this._track);
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.CreateDefaultStrings = function(list) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::CreateDefaultStrings");
	var $spos = $s.length;
	list.push(this.NewString(1,64));
	list.push(this.NewString(2,59));
	list.push(this.NewString(3,55));
	list.push(this.NewString(4,50));
	list.push(this.NewString(5,45));
	list.push(this.NewString(6,40));
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.Measure = function(tempo) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::Measure");
	var $spos = $s.length;
	var header = this.Factory.NewMeasureHeader();
	header.Number = this._song.MeasureHeaders.length + 1;
	header.Start = (this._song.MeasureHeaders.length == 0?960:this._song.MeasureHeaders[this._song.MeasureHeaders.length - 1].Start + this._song.MeasureHeaders[this._song.MeasureHeaders.length - 1].Length());
	this._song.AddMeasureHeader(header);
	var measure = this.Factory.NewMeasure(header);
	header.Tempo.Copy(tempo);
	if(header.Number > 1) {
		var prevMeasure = this._track.Measures[header.Number - 2];
		var prevHeader = this._song.MeasureHeaders[header.Number - 2];
		measure.Clef = prevMeasure.Clef;
		header.KeySignature = prevHeader.KeySignature;
		header.KeySignatureType = prevHeader.KeySignatureType;
	}
	this.MeasureMeta(header,measure);
	tempo.Copy(header.Tempo);
	this._track.AddMeasure(measure);
	while(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Pipe && this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Eof) {
		this.Beat(measure);
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.MeasureMeta = function(header,measure) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::MeasureMeta");
	var $spos = $s.length;
	while(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.MetaCommand) {
		if(this._syData == "ts") {
			this.NewSy();
			if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Number) {
				throw new net.alphatab.file.FileFormatException((("Expected number, found \"" + this._sy) + "\" on position ") + this._curChPos);
			}
			header.TimeSignature.Numerator = this._syData;
			this.NewSy();
			if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Number) {
				throw new net.alphatab.file.FileFormatException((("Expected number, found \"" + this._sy) + "\" on position ") + this._curChPos);
			}
			header.TimeSignature.Denominator.Value = this._syData;
		}
		else if(this._syData == "ro") {
			header.IsRepeatOpen = true;
		}
		else if(this._syData == "rc") {
			this.NewSy();
			if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Number) {
				throw new net.alphatab.file.FileFormatException((("Expected number, found \"" + this._sy) + "\" on position ") + this._curChPos);
			}
			header.RepeatClose = Std.parseInt(this._syData) - 1;
		}
		else if(this._syData == "ks") {
			this.NewSy();
			if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				throw new net.alphatab.file.FileFormatException((("Expected string, found \"" + this._sy) + "\" on position ") + this._curChPos);
			}
			header.KeySignature = this.ParseKeySignature(this._syData);
		}
		else if(this._syData == "clef") {
			this.NewSy();
			if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				throw new net.alphatab.file.FileFormatException((("Expected string, found \"" + this._sy) + "\" on position ") + this._curChPos);
			}
			measure.Clef = this.ParseClef(this._syData);
		}
		else if(this._syData == "tempo") {
			this.NewSy();
			if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Number) {
				throw new net.alphatab.file.FileFormatException((("Expected number, found \"" + this._sy) + "\" on position ") + this._curChPos);
			}
			header.Tempo.Value = this._syData;
		}
		else {
			throw new net.alphatab.file.FileFormatException((("Unknown measure meta tag, \"" + this._syData) + "\" on position ") + this._curChPos);
		}
		this.NewSy();
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.Measures = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::Measures");
	var $spos = $s.length;
	var tempo = this.Factory.NewTempo();
	tempo.Value = this._song.Tempo;
	this.Measure(tempo);
	while(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Eof) {
		if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Pipe) {
			throw new net.alphatab.file.FileFormatException((("Expected Pipe, found \"" + this._sy) + "\" on ") + this._curChPos);
		}
		this.NewSy();
		this.Measure(tempo);
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.MetaData = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::MetaData");
	var $spos = $s.length;
	while(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.MetaCommand) {
		if(this._syData == "title") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				this._song.Title = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected String, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "subtitle") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				this._song.Subtitle = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected String, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "artist") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				this._song.Artist = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected String, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "album") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				this._song.Album = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected String, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "words") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				this._song.Words = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected String, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "music") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				this._song.Music = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected String, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "copyright") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String) {
				this._song.Copyright = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected String, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "tempo") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.Number) {
				this._song.Tempo = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected Number, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "capo") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.Number) {
				this._track.Offset = this._syData;
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected Number, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
			this.NewSy();
		}
		else if(this._syData == "tuning") {
			this.NewSy();
			if(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.Tuning) {
				this._track.Strings = new Array();
				do {
					this._track.Strings.push(this.NewString(this._track.Strings.length + 1,this.ParseTuning(this._syData)));
					this.NewSy();
				} while(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.Tuning);
			}
			else {
				throw new net.alphatab.file.FileFormatException((("Expected Number, found \"" + this._sy) + "\" on ") + this._curChPos);
			}
		}
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.NewString = function(number,value) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::NewString");
	var $spos = $s.length;
	var str = this.Factory.NewString();
	str.Number = number;
	str.Value = value;
	{
		$s.pop();
		return str;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.NewSy = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::NewSy");
	var $spos = $s.length;
	this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.No;
	do {
		if(this._ch == String.fromCharCode(0)) {
			this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.Eof;
		}
		else if(this._ch == " " || this._ch == "\n" || this._ch == "\r" || this._ch == "\t") {
			this.NextChar();
		}
		else if(this._ch == "\"" || this._ch == "'") {
			this.NextChar();
			this._syData = "";
			this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.String;
			while(this._ch != "\"" && this._ch != "'" && this._ch != String.fromCharCode(0)) {
				this._syData += this._ch;
				this.NextChar();
			}
			this.NextChar();
		}
		else if(net.alphatab.file.alphatab.AlphaTabParser.IsLetter(this._ch)) {
			var name = this.ReadName();
			if(net.alphatab.file.alphatab.AlphaTabParser.IsTuning(name)) {
				this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.Tuning;
				this._syData = name.toLowerCase();
			}
			else {
				this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.String;
				this._syData = name;
			}
		}
		else if(net.alphatab.file.alphatab.AlphaTabParser.IsDigit(this._ch)) {
			var number = this.ReadNumber();
			this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.Number;
			this._syData = number;
		}
		else if(this._ch == ".") {
			this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.Dot;
			this.NextChar();
		}
		else if(this._ch == "(") {
			this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.LParensis;
			this.NextChar();
		}
		else if(this._ch == "\\") {
			this.NextChar();
			var name = this.ReadName();
			this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.MetaCommand;
			this._syData = name;
		}
		else if(this._ch == ")") {
			this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.RParensis;
			this.NextChar();
		}
		else if(this._ch == "|") {
			this._sy = net.alphatab.file.alphatab.AlphaTabSymbols.Pipe;
			this.NextChar();
		}
		else {
			throw new net.alphatab.file.FileFormatException((("Illegal element \"" + this._ch) + "\" found on pos ") + this._curChPos);
		}
	} while(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.No);
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.NextChar = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::NextChar");
	var $spos = $s.length;
	this._ch = (this._curChPos < this.Data.getSize()?String.fromCharCode(this.Data.readByte()):String.fromCharCode(0));
	this._curChPos++;
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.Note = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::Note");
	var $spos = $s.length;
	if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Number && !(this._sy == net.alphatab.file.alphatab.AlphaTabSymbols.String && Std.string(this._syData).toLowerCase() == "x")) {
		throw new net.alphatab.file.FileFormatException((("Expected Number found \"" + this._syData) + "\" on position ") + this._curChPos);
	}
	var isDead = Std.string(this._syData).toLowerCase() == "x";
	var fret = (isDead?0:this._syData);
	this.NewSy();
	if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Dot) {
		throw new net.alphatab.file.FileFormatException((("Expected Dot found \"" + this._syData) + "\" on position ") + this._curChPos);
	}
	this.NewSy();
	if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Number) {
		throw new net.alphatab.file.FileFormatException((("Expected Number found \"" + this._syData) + "\" on position ") + this._curChPos);
	}
	var string = this._syData;
	if(string < 1 || string > this._track.StringCount()) {
		throw new net.alphatab.file.FileFormatException((("Invalid String for Note found \"" + this._syData) + "\" on position ") + this._curChPos);
	}
	this.NewSy();
	var note = this.Factory.NewNote();
	note.String = string;
	note.Effect = this.Factory.NewEffect();
	note.Effect.DeadNote = isDead;
	note.Value = fret;
	{
		$s.pop();
		return note;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.ParseClef = function(str) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::ParseClef");
	var $spos = $s.length;
	switch(str.toLowerCase()) {
	case "treble":{
		{
			var $tmp = net.alphatab.model.GsMeasureClef.Treble;
			$s.pop();
			return $tmp;
		}
	}break;
	case "bass":{
		{
			var $tmp = net.alphatab.model.GsMeasureClef.Bass;
			$s.pop();
			return $tmp;
		}
	}break;
	case "tenor":{
		{
			var $tmp = net.alphatab.model.GsMeasureClef.Tenor;
			$s.pop();
			return $tmp;
		}
	}break;
	case "alto":{
		{
			var $tmp = net.alphatab.model.GsMeasureClef.Alto;
			$s.pop();
			return $tmp;
		}
	}break;
	default:{
		throw new net.alphatab.file.FileFormatException((("Unknown clef, \"" + this._syData) + "\" on position ") + this._curChPos);
	}break;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.ParseKeySignature = function(str) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::ParseKeySignature");
	var $spos = $s.length;
	switch(str.toLowerCase()) {
	case "cb":{
		{
			$s.pop();
			return -7;
		}
	}break;
	case "gb":{
		{
			$s.pop();
			return -6;
		}
	}break;
	case "db":{
		{
			$s.pop();
			return -5;
		}
	}break;
	case "ab":{
		{
			$s.pop();
			return -4;
		}
	}break;
	case "eb":{
		{
			$s.pop();
			return -3;
		}
	}break;
	case "bb":{
		{
			$s.pop();
			return -2;
		}
	}break;
	case "f":{
		{
			$s.pop();
			return -1;
		}
	}break;
	case "c":{
		{
			$s.pop();
			return 0;
		}
	}break;
	case "g":{
		{
			$s.pop();
			return 1;
		}
	}break;
	case "d":{
		{
			$s.pop();
			return 2;
		}
	}break;
	case "a":{
		{
			$s.pop();
			return 3;
		}
	}break;
	case "e":{
		{
			$s.pop();
			return 4;
		}
	}break;
	case "b":{
		{
			$s.pop();
			return 5;
		}
	}break;
	case "f#":{
		{
			$s.pop();
			return 6;
		}
	}break;
	case "c#":{
		{
			$s.pop();
			return 7;
		}
	}break;
	default:{
		throw new net.alphatab.file.FileFormatException("Unsupported key signature found on position: " + this._curChPos);
	}break;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.ParseTuning = function(str) {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::ParseTuning");
	var $spos = $s.length;
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
			throw new net.alphatab.file.FileFormatException((("Invalid tuning note \"" + str) + "\" on position ") + this._curChPos);
		}
		base += (octave * 12);
	}
	else {
		throw new net.alphatab.file.FileFormatException((("Invalid Tuning format \"" + str) + "\" on position ") + this._curChPos);
	}
	{
		$s.pop();
		return base;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.ReadName = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::ReadName");
	var $spos = $s.length;
	var str = "";
	do {
		str += this._ch;
		this.NextChar();
	} while(net.alphatab.file.alphatab.AlphaTabParser.IsLetter(this._ch) || net.alphatab.file.alphatab.AlphaTabParser.IsDigit(this._ch));
	{
		$s.pop();
		return str;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.ReadNumber = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::ReadNumber");
	var $spos = $s.length;
	var str = "";
	do {
		str += this._ch;
		this.NextChar();
	} while(net.alphatab.file.alphatab.AlphaTabParser.IsDigit(this._ch));
	{
		var $tmp = Std.parseInt(str);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.ReadSong = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::ReadSong");
	var $spos = $s.length;
	this.CreateDefaultSong();
	this._curChPos = 0;
	this.NextChar();
	this.NewSy();
	this.S();
	{
		var $tmp = this._song;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype.S = function() {
	$s.push("net.alphatab.file.alphatab.AlphaTabParser::S");
	var $spos = $s.length;
	this.MetaData();
	if(this._sy != net.alphatab.file.alphatab.AlphaTabSymbols.Dot) {
		throw new net.alphatab.file.FileFormatException((("Expected Dot after MetaData, found \"" + this._sy) + "\" on ") + this._curChPos);
	}
	this.NewSy();
	this.Measures();
	$s.pop();
}
net.alphatab.file.alphatab.AlphaTabParser.prototype._ch = null;
net.alphatab.file.alphatab.AlphaTabParser.prototype._curChPos = null;
net.alphatab.file.alphatab.AlphaTabParser.prototype._song = null;
net.alphatab.file.alphatab.AlphaTabParser.prototype._sy = null;
net.alphatab.file.alphatab.AlphaTabParser.prototype._syData = null;
net.alphatab.file.alphatab.AlphaTabParser.prototype._track = null;
net.alphatab.file.alphatab.AlphaTabParser.prototype.__class__ = net.alphatab.file.alphatab.AlphaTabParser;
net.alphatab.model.effects.GsHarmonicEffect = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.effects.GsHarmonicEffect::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.model.effects.GsHarmonicEffect.__name__ = ["net","alphatab","model","effects","GsHarmonicEffect"];
net.alphatab.model.effects.GsHarmonicEffect.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.effects.GsHarmonicEffect::Clone");
	var $spos = $s.length;
	var effect = factory.NewHarmonicEffect();
	effect.Type = this.Type;
	effect.Data = this.Data;
	{
		$s.pop();
		return effect;
	}
	$s.pop();
}
net.alphatab.model.effects.GsHarmonicEffect.prototype.Data = null;
net.alphatab.model.effects.GsHarmonicEffect.prototype.Type = null;
net.alphatab.model.effects.GsHarmonicEffect.prototype.__class__ = net.alphatab.model.effects.GsHarmonicEffect;
haxe.io.Input = function() { }
haxe.io.Input.__name__ = ["haxe","io","Input"];
haxe.io.Input.prototype.bigEndian = null;
haxe.io.Input.prototype.close = function() {
	$s.push("haxe.io.Input::close");
	var $spos = $s.length;
	null;
	$s.pop();
}
haxe.io.Input.prototype.read = function(nbytes) {
	$s.push("haxe.io.Input::read");
	var $spos = $s.length;
	var s = haxe.io.Bytes.alloc(nbytes);
	var p = 0;
	while(nbytes > 0) {
		var k = this.readBytes(s,p,nbytes);
		if(k == 0) throw haxe.io.Error.Blocked;
		p += k;
		nbytes -= k;
	}
	{
		$s.pop();
		return s;
	}
	$s.pop();
}
haxe.io.Input.prototype.readAll = function(bufsize) {
	$s.push("haxe.io.Input::readAll");
	var $spos = $s.length;
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
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				null;
			}
		} else throw($e10);
	}
	{
		var $tmp = total.getBytes();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.readByte = function() {
	$s.push("haxe.io.Input::readByte");
	var $spos = $s.length;
	{
		var $tmp = (function($this) {
			var $r;
			throw "Not implemented";
			return $r;
		}(this));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.readBytes = function(s,pos,len) {
	$s.push("haxe.io.Input::readBytes");
	var $spos = $s.length;
	var k = len;
	var b = s.b;
	if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
	while(k > 0) {
		b[pos] = this.readByte();
		pos++;
		k--;
	}
	{
		$s.pop();
		return len;
	}
	$s.pop();
}
haxe.io.Input.prototype.readDouble = function() {
	$s.push("haxe.io.Input::readDouble");
	var $spos = $s.length;
	throw "Not implemented";
	{
		$s.pop();
		return 0;
	}
	$s.pop();
}
haxe.io.Input.prototype.readFloat = function() {
	$s.push("haxe.io.Input::readFloat");
	var $spos = $s.length;
	throw "Not implemented";
	{
		$s.pop();
		return 0;
	}
	$s.pop();
}
haxe.io.Input.prototype.readFullBytes = function(s,pos,len) {
	$s.push("haxe.io.Input::readFullBytes");
	var $spos = $s.length;
	while(len > 0) {
		var k = this.readBytes(s,pos,len);
		pos += k;
		len -= k;
	}
	$s.pop();
}
haxe.io.Input.prototype.readInt16 = function() {
	$s.push("haxe.io.Input::readInt16");
	var $spos = $s.length;
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var n = (this.bigEndian?ch2 | (ch1 << 8):ch1 | (ch2 << 8));
	if((n & 32768) != 0) {
		var $tmp = n - 65536;
		$s.pop();
		return $tmp;
	}
	{
		$s.pop();
		return n;
	}
	$s.pop();
}
haxe.io.Input.prototype.readInt24 = function() {
	$s.push("haxe.io.Input::readInt24");
	var $spos = $s.length;
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var n = (this.bigEndian?(ch3 | (ch2 << 8)) | (ch1 << 16):(ch1 | (ch2 << 8)) | (ch3 << 16));
	if((n & 8388608) != 0) {
		var $tmp = n - 16777216;
		$s.pop();
		return $tmp;
	}
	{
		$s.pop();
		return n;
	}
	$s.pop();
}
haxe.io.Input.prototype.readInt31 = function() {
	$s.push("haxe.io.Input::readInt31");
	var $spos = $s.length;
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
	{
		var $tmp = ((ch1 | (ch2 << 8)) | (ch3 << 16)) | (ch4 << 24);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.readInt32 = function() {
	$s.push("haxe.io.Input::readInt32");
	var $spos = $s.length;
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var ch4 = this.readByte();
	{
		var $tmp = (this.bigEndian?(((ch1 << 8) | ch2) << 16) | ((ch3 << 8) | ch4):(((ch4 << 8) | ch3) << 16) | ((ch2 << 8) | ch1));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.readInt8 = function() {
	$s.push("haxe.io.Input::readInt8");
	var $spos = $s.length;
	var n = this.readByte();
	if(n >= 128) {
		var $tmp = n - 256;
		$s.pop();
		return $tmp;
	}
	{
		$s.pop();
		return n;
	}
	$s.pop();
}
haxe.io.Input.prototype.readLine = function() {
	$s.push("haxe.io.Input::readLine");
	var $spos = $s.length;
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
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				s = buf.b.join("");
				if(s.length == 0) throw (e);
			}
		} else throw($e11);
	}
	{
		$s.pop();
		return s;
	}
	$s.pop();
}
haxe.io.Input.prototype.readString = function(len) {
	$s.push("haxe.io.Input::readString");
	var $spos = $s.length;
	var b = haxe.io.Bytes.alloc(len);
	this.readFullBytes(b,0,len);
	{
		var $tmp = b.toString();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.readUInt16 = function() {
	$s.push("haxe.io.Input::readUInt16");
	var $spos = $s.length;
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	{
		var $tmp = (this.bigEndian?ch2 | (ch1 << 8):ch1 | (ch2 << 8));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.readUInt24 = function() {
	$s.push("haxe.io.Input::readUInt24");
	var $spos = $s.length;
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	{
		var $tmp = (this.bigEndian?(ch3 | (ch2 << 8)) | (ch1 << 16):(ch1 | (ch2 << 8)) | (ch3 << 16));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.readUInt30 = function() {
	$s.push("haxe.io.Input::readUInt30");
	var $spos = $s.length;
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var ch4 = this.readByte();
	if(((this.bigEndian?ch1:ch4)) >= 64) throw haxe.io.Error.Overflow;
	{
		var $tmp = (this.bigEndian?((ch4 | (ch3 << 8)) | (ch2 << 16)) | (ch1 << 24):((ch1 | (ch2 << 8)) | (ch3 << 16)) | (ch4 << 24));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.readUntil = function(end) {
	$s.push("haxe.io.Input::readUntil");
	var $spos = $s.length;
	var buf = new StringBuf();
	var last;
	while((last = this.readByte()) != end) buf.b[buf.b.length] = String.fromCharCode(last);
	{
		var $tmp = buf.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.Input.prototype.setEndian = function(b) {
	$s.push("haxe.io.Input::setEndian");
	var $spos = $s.length;
	this.bigEndian = b;
	{
		$s.pop();
		return b;
	}
	$s.pop();
}
haxe.io.Input.prototype.__class__ = haxe.io.Input;
haxe.io.BytesInput = function(b,pos,len) { if( b === $_ ) return; {
	$s.push("haxe.io.BytesInput::new");
	var $spos = $s.length;
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
	$s.pop();
}}
haxe.io.BytesInput.__name__ = ["haxe","io","BytesInput"];
haxe.io.BytesInput.__super__ = haxe.io.Input;
for(var k in haxe.io.Input.prototype ) haxe.io.BytesInput.prototype[k] = haxe.io.Input.prototype[k];
haxe.io.BytesInput.prototype.b = null;
haxe.io.BytesInput.prototype.len = null;
haxe.io.BytesInput.prototype.pos = null;
haxe.io.BytesInput.prototype.readByte = function() {
	$s.push("haxe.io.BytesInput::readByte");
	var $spos = $s.length;
	if(this.len == 0) throw new haxe.io.Eof();
	this.len--;
	{
		var $tmp = this.b[this.pos++];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.io.BytesInput.prototype.readBytes = function(buf,pos,len) {
	$s.push("haxe.io.BytesInput::readBytes");
	var $spos = $s.length;
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
	{
		$s.pop();
		return len;
	}
	$s.pop();
}
haxe.io.BytesInput.prototype.__class__ = haxe.io.BytesInput;
haxe.Int32 = function() { }
haxe.Int32.__name__ = ["haxe","Int32"];
haxe.Int32.make = function(a,b) {
	$s.push("haxe.Int32::make");
	var $spos = $s.length;
	{
		var $tmp = (a << 16) | b;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.ofInt = function(x) {
	$s.push("haxe.Int32::ofInt");
	var $spos = $s.length;
	{
		$s.pop();
		return x;
	}
	$s.pop();
}
haxe.Int32.toInt = function(x) {
	$s.push("haxe.Int32::toInt");
	var $spos = $s.length;
	if((((x) >> 30) & 1) != ((x) >>> 31)) throw "Overflow " + x;
	{
		var $tmp = (x) & -1;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.toNativeInt = function(x) {
	$s.push("haxe.Int32::toNativeInt");
	var $spos = $s.length;
	{
		$s.pop();
		return x;
	}
	$s.pop();
}
haxe.Int32.add = function(a,b) {
	$s.push("haxe.Int32::add");
	var $spos = $s.length;
	{
		var $tmp = (a) + (b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.sub = function(a,b) {
	$s.push("haxe.Int32::sub");
	var $spos = $s.length;
	{
		var $tmp = (a) - (b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.mul = function(a,b) {
	$s.push("haxe.Int32::mul");
	var $spos = $s.length;
	{
		var $tmp = (a) * (b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.div = function(a,b) {
	$s.push("haxe.Int32::div");
	var $spos = $s.length;
	{
		var $tmp = Std["int"]((a) / (b));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.mod = function(a,b) {
	$s.push("haxe.Int32::mod");
	var $spos = $s.length;
	{
		var $tmp = (a) % (b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.shl = function(a,b) {
	$s.push("haxe.Int32::shl");
	var $spos = $s.length;
	{
		var $tmp = (a) << b;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.shr = function(a,b) {
	$s.push("haxe.Int32::shr");
	var $spos = $s.length;
	{
		var $tmp = (a) >> b;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.ushr = function(a,b) {
	$s.push("haxe.Int32::ushr");
	var $spos = $s.length;
	{
		var $tmp = (a) >>> b;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.and = function(a,b) {
	$s.push("haxe.Int32::and");
	var $spos = $s.length;
	{
		var $tmp = (a) & (b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.or = function(a,b) {
	$s.push("haxe.Int32::or");
	var $spos = $s.length;
	{
		var $tmp = (a) | (b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.xor = function(a,b) {
	$s.push("haxe.Int32::xor");
	var $spos = $s.length;
	{
		var $tmp = (a) ^ (b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.neg = function(a) {
	$s.push("haxe.Int32::neg");
	var $spos = $s.length;
	{
		var $tmp = -(a);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.complement = function(a) {
	$s.push("haxe.Int32::complement");
	var $spos = $s.length;
	{
		var $tmp = ~(a);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.compare = function(a,b) {
	$s.push("haxe.Int32::compare");
	var $spos = $s.length;
	{
		var $tmp = a - b;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Int32.prototype.__class__ = haxe.Int32;
net.alphatab.file.FileFormatException = function(message) { if( message === $_ ) return; {
	$s.push("net.alphatab.file.FileFormatException::new");
	var $spos = $s.length;
	if(message == null) message = "";
	this.Message = message;
	$s.pop();
}}
net.alphatab.file.FileFormatException.__name__ = ["net","alphatab","file","FileFormatException"];
net.alphatab.file.FileFormatException.prototype.Message = null;
net.alphatab.file.FileFormatException.prototype.__class__ = net.alphatab.file.FileFormatException;
net.alphatab.platform.BinaryReader = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.platform.BinaryReader::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.platform.BinaryReader.__name__ = ["net","alphatab","platform","BinaryReader"];
net.alphatab.platform.BinaryReader.prototype._buffer = null;
net.alphatab.platform.BinaryReader.prototype._decodeFloat = function(precisionBits,exponentBits) {
	$s.push("net.alphatab.platform.BinaryReader::_decodeFloat");
	var $spos = $s.length;
	var length = (precisionBits + exponentBits) + 1;
	var size = length >> 3;
	var bias = Math.floor(Math.pow(2,exponentBits - 1) - 1);
	var signal = this._readBits(precisionBits + exponentBits,1,size);
	var exponent = this._readBits(precisionBits,exponentBits,size);
	var significand = 0;
	var divisor = 2;
	var curByte = (length + (-precisionBits >> 3)) - 1;
	var startBit;
	do {
		var byteValue = this._readByte(++curByte,size);
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
		{
			$s.pop();
			return 0;
		}
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
			{
				var $tmp = ret * (1 + signal * -2);
				$s.pop();
				return $tmp;
			}
		}
		else {
			{
				$s.pop();
				return 0;
			}
		}
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype._decodeInt = function(bits,signed) {
	$s.push("net.alphatab.platform.BinaryReader::_decodeInt");
	var $spos = $s.length;
	var x = this._readBits(0,bits,Math.floor(bits / 8));
	var max = Math.floor(Math.pow(2,bits));
	var result = ((signed && x >= max / 2)?x - max:x);
	this._pos += Math.floor(bits / 8);
	{
		$s.pop();
		return result;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype._pos = null;
net.alphatab.platform.BinaryReader.prototype._readBits = function(start,length,size) {
	$s.push("net.alphatab.platform.BinaryReader::_readBits");
	var $spos = $s.length;
	var offsetLeft = (start + length) % 8;
	var offsetRight = start % 8;
	var curByte = (size - (start >> 3)) - 1;
	var lastByte = size + (-(start + length) >> 3);
	var diff = curByte - lastByte;
	var sum = (this._readByte(curByte,size) >> offsetRight) & ((1 << ((diff != 0?8 - offsetRight:length))) - 1);
	if(diff != 0 && offsetLeft != 0) {
		sum += (this._readByte(lastByte++,size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight;
	}
	while(diff != 0) {
		sum += this._shl(this._readByte(lastByte++,size),(diff-- << 3) - offsetRight);
	}
	{
		$s.pop();
		return sum;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype._readByte = function(i,size) {
	$s.push("net.alphatab.platform.BinaryReader::_readByte");
	var $spos = $s.length;
	{
		var $tmp = this._buffer.charCodeAt(((this._pos + size) - i) - 1) & 255;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype._shl = function(a,b) {
	$s.push("net.alphatab.platform.BinaryReader::_shl");
	var $spos = $s.length;
	{
		var _g = 0;
		while(_g < b) {
			var i = _g++;
			a = this._shl1(a);
		}
	}
	{
		$s.pop();
		return a;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype._shl1 = function(a) {
	$s.push("net.alphatab.platform.BinaryReader::_shl1");
	var $spos = $s.length;
	a = a % -2147483648;
	if((a & 1073741824) == 1073741824) {
		a -= 1073741824;
		a *= 2;
		a += -2147483648;
	}
	else a *= 2;
	{
		$s.pop();
		return a;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.getPosition = function() {
	$s.push("net.alphatab.platform.BinaryReader::getPosition");
	var $spos = $s.length;
	{
		var $tmp = this._pos;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.getSize = function() {
	$s.push("net.alphatab.platform.BinaryReader::getSize");
	var $spos = $s.length;
	{
		var $tmp = this._buffer.length;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.initialize = function(data) {
	$s.push("net.alphatab.platform.BinaryReader::initialize");
	var $spos = $s.length;
	this._buffer = data;
	this._pos = 0;
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.readBool = function() {
	$s.push("net.alphatab.platform.BinaryReader::readBool");
	var $spos = $s.length;
	{
		var $tmp = this.readByte() == 1;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.readByte = function() {
	$s.push("net.alphatab.platform.BinaryReader::readByte");
	var $spos = $s.length;
	var data = this._buffer.charCodeAt(this._pos);
	data = (data & 255);
	this._pos++;
	{
		$s.pop();
		return data;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.readDouble = function() {
	$s.push("net.alphatab.platform.BinaryReader::readDouble");
	var $spos = $s.length;
	{
		var $tmp = this._decodeFloat(52,11);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.readInt32 = function() {
	$s.push("net.alphatab.platform.BinaryReader::readInt32");
	var $spos = $s.length;
	{
		var $tmp = this._decodeInt(32,true);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.seek = function(pos) {
	$s.push("net.alphatab.platform.BinaryReader::seek");
	var $spos = $s.length;
	this._pos = pos;
	$s.pop();
}
net.alphatab.platform.BinaryReader.prototype.__class__ = net.alphatab.platform.BinaryReader;
net.alphatab.model.GsMeasureHeader = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.GsMeasureHeader::new");
	var $spos = $s.length;
	this.Number = 0;
	this.Start = 960;
	this.TimeSignature = factory.NewTimeSignature();
	this.KeySignature = 0;
	this.Tempo = factory.NewTempo();
	this.Marker = null;
	this.TripletFeel = net.alphatab.model.GsTripletFeel.None;
	this.IsRepeatOpen = false;
	this.RepeatClose = 0;
	this.RepeatAlternative = 0;
	$s.pop();
}}
net.alphatab.model.GsMeasureHeader.__name__ = ["net","alphatab","model","GsMeasureHeader"];
net.alphatab.model.GsMeasureHeader.prototype.HasDoubleBar = null;
net.alphatab.model.GsMeasureHeader.prototype.HasMarker = function() {
	$s.push("net.alphatab.model.GsMeasureHeader::HasMarker");
	var $spos = $s.length;
	{
		var $tmp = this.Marker != null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasureHeader.prototype.IsRepeatOpen = null;
net.alphatab.model.GsMeasureHeader.prototype.KeySignature = null;
net.alphatab.model.GsMeasureHeader.prototype.KeySignatureType = null;
net.alphatab.model.GsMeasureHeader.prototype.Length = function() {
	$s.push("net.alphatab.model.GsMeasureHeader::Length");
	var $spos = $s.length;
	{
		var $tmp = this.TimeSignature.Numerator * this.TimeSignature.Denominator.Time();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMeasureHeader.prototype.Marker = null;
net.alphatab.model.GsMeasureHeader.prototype.Number = null;
net.alphatab.model.GsMeasureHeader.prototype.RepeatAlternative = null;
net.alphatab.model.GsMeasureHeader.prototype.RepeatClose = null;
net.alphatab.model.GsMeasureHeader.prototype.Song = null;
net.alphatab.model.GsMeasureHeader.prototype.Start = null;
net.alphatab.model.GsMeasureHeader.prototype.Tempo = null;
net.alphatab.model.GsMeasureHeader.prototype.TimeSignature = null;
net.alphatab.model.GsMeasureHeader.prototype.TripletFeel = null;
net.alphatab.model.GsMeasureHeader.prototype.__class__ = net.alphatab.model.GsMeasureHeader;
net.alphatab.tablature.model.GsMeasureHeaderImpl = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsMeasureHeader.apply(this,[factory]);
	$s.pop();
}}
net.alphatab.tablature.model.GsMeasureHeaderImpl.__name__ = ["net","alphatab","tablature","model","GsMeasureHeaderImpl"];
net.alphatab.tablature.model.GsMeasureHeaderImpl.__super__ = net.alphatab.model.GsMeasureHeader;
for(var k in net.alphatab.model.GsMeasureHeader.prototype ) net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype[k] = net.alphatab.model.GsMeasureHeader.prototype[k];
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.CalculateMeasureChanges = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::CalculateMeasureChanges");
	var $spos = $s.length;
	var previous = layout.SongManager().GetPreviousMeasureHeader(this);
	if(previous == null) {
		this.ShouldPaintTempo = true;
		this.ShouldPaintTripletFeel = this.TripletFeel != net.alphatab.model.GsTripletFeel.None;
		this.ShouldPaintTimeSignature = true;
		this.ShouldPaintKeySignature = true;
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
		if(this.KeySignature != previous.KeySignature || this.KeySignatureType != previous.KeySignatureType) {
			this.ShouldPaintKeySignature = true;
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.GetClefSpacing = function(layout,measure) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::GetClefSpacing");
	var $spos = $s.length;
	{
		var $tmp = ((!measure.IsPaintClef)?0:this._maxClefSpacing);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.GetFirstNoteSpacing = function(layout,measure) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::GetFirstNoteSpacing");
	var $spos = $s.length;
	var iTopSpacing = this.GetTempoSpacing(layout) + this.GetTripletFeelSpacing(layout);
	var iMiddleSpacing = (this.GetClefSpacing(layout,measure) + this.GetKeySignatureSpacing(layout,measure)) + this.GetTimeSignatureSpacing(layout);
	{
		var $tmp = Math.round(Math.max(iTopSpacing,iMiddleSpacing) + (10 * layout.Scale));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.GetKeySignatureSpacing = function(layout,measure) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::GetKeySignatureSpacing");
	var $spos = $s.length;
	{
		var $tmp = ((!this.ShouldPaintKeySignature)?0:this._maxKeySignatureSpacing);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.GetLeftSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::GetLeftSpacing");
	var $spos = $s.length;
	{
		var $tmp = Math.round(15 * layout.Scale);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.GetRightSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::GetRightSpacing");
	var $spos = $s.length;
	{
		var $tmp = Math.round(15 * layout.Scale);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.GetTempoSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::GetTempoSpacing");
	var $spos = $s.length;
	{
		var $tmp = ((this.ShouldPaintTempo && this.Number == 1?Math.round(45 * layout.Scale):0));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.GetTimeSignatureSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::GetTimeSignatureSpacing");
	var $spos = $s.length;
	{
		var $tmp = ((this.ShouldPaintTimeSignature?Math.round(30 * layout.Scale):0));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.GetTripletFeelSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::GetTripletFeelSpacing");
	var $spos = $s.length;
	{
		var $tmp = ((this.ShouldPaintTripletFeel?Math.round(55 * layout.Scale):0));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.MaxQuarterSpacing = null;
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.MaxWidth = null;
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.NotifyClefSpacing = function(spacing) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::NotifyClefSpacing");
	var $spos = $s.length;
	this._maxClefSpacing = (((spacing > this._maxClefSpacing)?spacing:this._maxClefSpacing));
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.NotifyKeySignatureSpacing = function(spacing) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::NotifyKeySignatureSpacing");
	var $spos = $s.length;
	this._maxKeySignatureSpacing = (((spacing > this._maxKeySignatureSpacing)?spacing:this._maxKeySignatureSpacing));
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.NotifyQuarterSpacing = function(spacing) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::NotifyQuarterSpacing");
	var $spos = $s.length;
	this.MaxQuarterSpacing = (((spacing > this.MaxQuarterSpacing)?spacing:this.MaxQuarterSpacing));
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.NotifyWidth = function(width) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::NotifyWidth");
	var $spos = $s.length;
	this.MaxWidth = (((width > this.MaxWidth)?width:this.MaxWidth));
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.Reset = function() {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::Reset");
	var $spos = $s.length;
	this.MaxWidth = 0;
	this.MaxQuarterSpacing = 0;
	this.ShouldPaintTempo = false;
	this.ShouldPaintTimeSignature = false;
	this.ShouldPaintKeySignature = false;
	this.ShouldPaintTripletFeel = false;
	this._maxClefSpacing = 0;
	this._maxKeySignatureSpacing = 0;
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.ShouldPaintKeySignature = null;
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.ShouldPaintTempo = null;
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.ShouldPaintTimeSignature = null;
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.ShouldPaintTripletFeel = null;
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.Update = function(layout,track) {
	$s.push("net.alphatab.tablature.model.GsMeasureHeaderImpl::Update");
	var $spos = $s.length;
	this.Reset();
	this.CalculateMeasureChanges(layout);
	var measure = track.Measures[this.Number - 1];
	measure.CalculateMeasureChanges(layout);
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype._maxClefSpacing = null;
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype._maxKeySignatureSpacing = null;
net.alphatab.tablature.model.GsMeasureHeaderImpl.prototype.__class__ = net.alphatab.tablature.model.GsMeasureHeaderImpl;
net.alphatab.model.effects.GsBendPoint = function(position,value,vibrato) { if( position === $_ ) return; {
	$s.push("net.alphatab.model.effects.GsBendPoint::new");
	var $spos = $s.length;
	if(vibrato == null) vibrato = false;
	if(value == null) value = 0;
	if(position == null) position = 0;
	this.Position = position;
	this.Value = value;
	this.Vibrato = vibrato;
	$s.pop();
}}
net.alphatab.model.effects.GsBendPoint.__name__ = ["net","alphatab","model","effects","GsBendPoint"];
net.alphatab.model.effects.GsBendPoint.prototype.GetTime = function(duration) {
	$s.push("net.alphatab.model.effects.GsBendPoint::GetTime");
	var $spos = $s.length;
	{
		var $tmp = Math.floor((duration * this.Position) / 12);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.effects.GsBendPoint.prototype.Position = null;
net.alphatab.model.effects.GsBendPoint.prototype.Value = null;
net.alphatab.model.effects.GsBendPoint.prototype.Vibrato = null;
net.alphatab.model.effects.GsBendPoint.prototype.__class__ = net.alphatab.model.effects.GsBendPoint;
net.alphatab.tablature.TrackSpacing = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.TrackSpacing::new");
	var $spos = $s.length;
	this.Spacing = new Array();
	{
		var _g = 0;
		while(_g < 23) {
			var i = _g++;
			this.Spacing.push(0);
		}
	}
	$s.pop();
}}
net.alphatab.tablature.TrackSpacing.__name__ = ["net","alphatab","tablature","TrackSpacing"];
net.alphatab.tablature.TrackSpacing.prototype.Get = function(index) {
	$s.push("net.alphatab.tablature.TrackSpacing::Get");
	var $spos = $s.length;
	var spacing = 0;
	var realIndex = net.alphatab.tablature.TrackSpacingPositionConverter.ToInt(index);
	{
		var _g = 0;
		while(_g < realIndex) {
			var i = _g++;
			spacing += this.Spacing[i];
		}
	}
	{
		$s.pop();
		return spacing;
	}
	$s.pop();
}
net.alphatab.tablature.TrackSpacing.prototype.GetSize = function() {
	$s.push("net.alphatab.tablature.TrackSpacing::GetSize");
	var $spos = $s.length;
	{
		var $tmp = this.Get(net.alphatab.tablature.TrackSpacingPositions.Bottom);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.TrackSpacing.prototype.Set = function(index,value) {
	$s.push("net.alphatab.tablature.TrackSpacing::Set");
	var $spos = $s.length;
	var realIndex = net.alphatab.tablature.TrackSpacingPositionConverter.ToInt(index);
	this.Spacing[realIndex] = value;
	$s.pop();
}
net.alphatab.tablature.TrackSpacing.prototype.Spacing = null;
net.alphatab.tablature.TrackSpacing.prototype.__class__ = net.alphatab.tablature.TrackSpacing;
js.Lib = function() { }
js.Lib.__name__ = ["js","Lib"];
js.Lib.isIE = null;
js.Lib.isOpera = null;
js.Lib.document = null;
js.Lib.window = null;
js.Lib.alert = function(v) {
	$s.push("js.Lib::alert");
	var $spos = $s.length;
	alert(js.Boot.__string_rec(v,""));
	$s.pop();
}
js.Lib.eval = function(code) {
	$s.push("js.Lib::eval");
	var $spos = $s.length;
	{
		var $tmp = eval(code);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
js.Lib.setErrorHandler = function(f) {
	$s.push("js.Lib::setErrorHandler");
	var $spos = $s.length;
	js.Lib.onerror = f;
	$s.pop();
}
js.Lib.prototype.__class__ = js.Lib;
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
	$s.push("Type::getClass");
	var $spos = $s.length;
	if(o == null) {
		$s.pop();
		return null;
	}
	if(o.__enum__ != null) {
		$s.pop();
		return null;
	}
	{
		var $tmp = o.__class__;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.getEnum = function(o) {
	$s.push("Type::getEnum");
	var $spos = $s.length;
	if(o == null) {
		$s.pop();
		return null;
	}
	{
		var $tmp = o.__enum__;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.getSuperClass = function(c) {
	$s.push("Type::getSuperClass");
	var $spos = $s.length;
	{
		var $tmp = c.__super__;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.getClassName = function(c) {
	$s.push("Type::getClassName");
	var $spos = $s.length;
	if(c == null) {
		$s.pop();
		return null;
	}
	var a = c.__name__;
	{
		var $tmp = a.join(".");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.getEnumName = function(e) {
	$s.push("Type::getEnumName");
	var $spos = $s.length;
	var a = e.__ename__;
	{
		var $tmp = a.join(".");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.resolveClass = function(name) {
	$s.push("Type::resolveClass");
	var $spos = $s.length;
	var cl;
	try {
		cl = eval(name);
	}
	catch( $e12 ) {
		{
			var e = $e12;
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				cl = null;
			}
		}
	}
	if(cl == null || cl.__name__ == null) {
		$s.pop();
		return null;
	}
	{
		$s.pop();
		return cl;
	}
	$s.pop();
}
Type.resolveEnum = function(name) {
	$s.push("Type::resolveEnum");
	var $spos = $s.length;
	var e;
	try {
		e = eval(name);
	}
	catch( $e13 ) {
		{
			var err = $e13;
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				e = null;
			}
		}
	}
	if(e == null || e.__ename__ == null) {
		$s.pop();
		return null;
	}
	{
		$s.pop();
		return e;
	}
	$s.pop();
}
Type.createInstance = function(cl,args) {
	$s.push("Type::createInstance");
	var $spos = $s.length;
	if(args.length <= 3) {
		var $tmp = new cl(args[0],args[1],args[2]);
		$s.pop();
		return $tmp;
	}
	if(args.length > 8) throw "Too many arguments";
	{
		var $tmp = new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.createEmptyInstance = function(cl) {
	$s.push("Type::createEmptyInstance");
	var $spos = $s.length;
	{
		var $tmp = new cl($_);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.createEnum = function(e,constr,params) {
	$s.push("Type::createEnum");
	var $spos = $s.length;
	var f = Reflect.field(e,constr);
	if(f == null) throw "No such constructor " + constr;
	if(Reflect.isFunction(f)) {
		if(params == null) throw ("Constructor " + constr) + " need parameters";
		{
			var $tmp = f.apply(e,params);
			$s.pop();
			return $tmp;
		}
	}
	if(params != null && params.length != 0) throw ("Constructor " + constr) + " does not need parameters";
	{
		$s.pop();
		return f;
	}
	$s.pop();
}
Type.createEnumIndex = function(e,index,params) {
	$s.push("Type::createEnumIndex");
	var $spos = $s.length;
	var c = Type.getEnumConstructs(e)[index];
	if(c == null) throw index + " is not a valid enum constructor index";
	{
		var $tmp = Type.createEnum(e,c,params);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.getInstanceFields = function(c) {
	$s.push("Type::getInstanceFields");
	var $spos = $s.length;
	var a = Reflect.fields(c.prototype);
	a.remove("__class__");
	{
		$s.pop();
		return a;
	}
	$s.pop();
}
Type.getClassFields = function(c) {
	$s.push("Type::getClassFields");
	var $spos = $s.length;
	var a = Reflect.fields(c);
	a.remove("__name__");
	a.remove("__interfaces__");
	a.remove("__super__");
	a.remove("prototype");
	{
		$s.pop();
		return a;
	}
	$s.pop();
}
Type.getEnumConstructs = function(e) {
	$s.push("Type::getEnumConstructs");
	var $spos = $s.length;
	{
		var $tmp = e.__constructs__;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type["typeof"] = function(v) {
	$s.push("Type::typeof");
	var $spos = $s.length;
	switch(typeof(v)) {
	case "boolean":{
		{
			var $tmp = ValueType.TBool;
			$s.pop();
			return $tmp;
		}
	}break;
	case "string":{
		{
			var $tmp = ValueType.TClass(String);
			$s.pop();
			return $tmp;
		}
	}break;
	case "number":{
		if(Math.ceil(v) == v % 2147483648.0) {
			var $tmp = ValueType.TInt;
			$s.pop();
			return $tmp;
		}
		{
			var $tmp = ValueType.TFloat;
			$s.pop();
			return $tmp;
		}
	}break;
	case "object":{
		if(v == null) {
			var $tmp = ValueType.TNull;
			$s.pop();
			return $tmp;
		}
		var e = v.__enum__;
		if(e != null) {
			var $tmp = ValueType.TEnum(e);
			$s.pop();
			return $tmp;
		}
		var c = v.__class__;
		if(c != null) {
			var $tmp = ValueType.TClass(c);
			$s.pop();
			return $tmp;
		}
		{
			var $tmp = ValueType.TObject;
			$s.pop();
			return $tmp;
		}
	}break;
	case "function":{
		if(v.__name__ != null) {
			var $tmp = ValueType.TObject;
			$s.pop();
			return $tmp;
		}
		{
			var $tmp = ValueType.TFunction;
			$s.pop();
			return $tmp;
		}
	}break;
	case "undefined":{
		{
			var $tmp = ValueType.TNull;
			$s.pop();
			return $tmp;
		}
	}break;
	default:{
		{
			var $tmp = ValueType.TUnknown;
			$s.pop();
			return $tmp;
		}
	}break;
	}
	$s.pop();
}
Type.enumEq = function(a,b) {
	$s.push("Type::enumEq");
	var $spos = $s.length;
	if(a == b) {
		$s.pop();
		return true;
	}
	try {
		if(a[0] != b[0]) {
			$s.pop();
			return false;
		}
		{
			var _g1 = 2, _g = a.length;
			while(_g1 < _g) {
				var i = _g1++;
				if(!Type.enumEq(a[i],b[i])) {
					$s.pop();
					return false;
				}
			}
		}
		var e = a.__enum__;
		if(e != b.__enum__ || e == null) {
			$s.pop();
			return false;
		}
	}
	catch( $e14 ) {
		{
			var e = $e14;
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				{
					$s.pop();
					return false;
				}
			}
		}
	}
	{
		$s.pop();
		return true;
	}
	$s.pop();
}
Type.enumConstructor = function(e) {
	$s.push("Type::enumConstructor");
	var $spos = $s.length;
	{
		var $tmp = e[0];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.enumParameters = function(e) {
	$s.push("Type::enumParameters");
	var $spos = $s.length;
	{
		var $tmp = e.slice(2);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.enumIndex = function(e) {
	$s.push("Type::enumIndex");
	var $spos = $s.length;
	{
		var $tmp = e[1];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Type.prototype.__class__ = Type;
if(!net.alphatab.midi) net.alphatab.midi = {}
net.alphatab.midi.MidiMessageUtils = function() { }
net.alphatab.midi.MidiMessageUtils.__name__ = ["net","alphatab","midi","MidiMessageUtils"];
net.alphatab.midi.MidiMessageUtils.fixValue = function(value) {
	$s.push("net.alphatab.midi.MidiMessageUtils::fixValue");
	var $spos = $s.length;
	var fixedValue = value;
	fixedValue = Math.min(fixedValue,127);
	fixedValue = Math.max(fixedValue,0);
	{
		$s.pop();
		return fixedValue;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.fixChannel = function(channel) {
	$s.push("net.alphatab.midi.MidiMessageUtils::fixChannel");
	var $spos = $s.length;
	var fixedChannel = channel;
	fixedChannel = Math.min(fixedChannel,15);
	fixedChannel = Math.max(fixedChannel,0);
	{
		$s.pop();
		return fixedChannel;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.NoteOn = function(channel,note,velocity) {
	$s.push("net.alphatab.midi.MidiMessageUtils::NoteOn");
	var $spos = $s.length;
	{
		var $tmp = (((("NoteOn," + Std.string(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + ",") + Std.string(net.alphatab.midi.MidiMessageUtils.fixValue(note))) + ",") + Std.string(net.alphatab.midi.MidiMessageUtils.fixValue(velocity));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.NoteOff = function(channel,note,velocity) {
	$s.push("net.alphatab.midi.MidiMessageUtils::NoteOff");
	var $spos = $s.length;
	{
		var $tmp = (((("NoteOff," + Std.string(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + ",") + Std.string(net.alphatab.midi.MidiMessageUtils.fixValue(note))) + ",") + Std.string(net.alphatab.midi.MidiMessageUtils.fixValue(velocity));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.ControlChange = function(channel,controller,value) {
	$s.push("net.alphatab.midi.MidiMessageUtils::ControlChange");
	var $spos = $s.length;
	{
		var $tmp = (((("ControlChange," + Std.string(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + ",") + Std.string(net.alphatab.midi.MidiMessageUtils.fixValue(controller))) + ",") + Std.string(net.alphatab.midi.MidiMessageUtils.fixValue(value));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.ProgramChange = function(channel,instrument) {
	$s.push("net.alphatab.midi.MidiMessageUtils::ProgramChange");
	var $spos = $s.length;
	{
		var $tmp = (("ProgramChange," + Std.string(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + ",") + Std.string(net.alphatab.midi.MidiMessageUtils.fixValue(instrument));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.PitchBend = function(channel,value) {
	$s.push("net.alphatab.midi.MidiMessageUtils::PitchBend");
	var $spos = $s.length;
	{
		var $tmp = (("PitchBend," + Std.string(net.alphatab.midi.MidiMessageUtils.fixChannel(channel))) + ",") + Std.string(net.alphatab.midi.MidiMessageUtils.fixValue(value));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.SystemReset = function() {
	$s.push("net.alphatab.midi.MidiMessageUtils::SystemReset");
	var $spos = $s.length;
	{
		$s.pop();
		return "SystemReset";
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.TempoInUSQ = function(usq) {
	$s.push("net.alphatab.midi.MidiMessageUtils::TempoInUSQ");
	var $spos = $s.length;
	{
		var $tmp = "TempoInUsq," + Std.string(usq);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.TimeSignature = function(ts) {
	$s.push("net.alphatab.midi.MidiMessageUtils::TimeSignature");
	var $spos = $s.length;
	{
		var $tmp = (((("TimeSignature," + Std.string(ts.Numerator)) + ",") + Std.string(ts.Denominator.Index())) + ",") + Std.string(ts.Denominator.Value);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiMessageUtils.prototype.__class__ = net.alphatab.midi.MidiMessageUtils;
net.alphatab.tablature.ViewLayout = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.ViewLayout::new");
	var $spos = $s.length;
	this.Init(1);
	this.CompactMode = true;
	$s.pop();
}}
net.alphatab.tablature.ViewLayout.__name__ = ["net","alphatab","tablature","ViewLayout"];
net.alphatab.tablature.ViewLayout.prototype.Cache = null;
net.alphatab.tablature.ViewLayout.prototype.CheckDefaultSpacing = function(ts) {
	$s.push("net.alphatab.tablature.ViewLayout::CheckDefaultSpacing");
	var $spos = $s.length;
	var minBufferSeparator = this.MinBufferSeparator;
	var bufferSeparator = ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines) - ts.Get(net.alphatab.tablature.TrackSpacingPositions.BufferSeparator);
	if(bufferSeparator < minBufferSeparator) {
		ts.Set(net.alphatab.tablature.TrackSpacingPositions.BufferSeparator,Math.round(minBufferSeparator - bufferSeparator));
	}
	var checkPosition = ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
	if(checkPosition >= 0 && checkPosition < this.MinTopSpacing) {
		ts.Set(net.alphatab.tablature.TrackSpacingPositions.Top,Math.round(this.MinTopSpacing - checkPosition));
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.ChordFretIndexSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.ChordFretSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.ChordNoteSize = null;
net.alphatab.tablature.ViewLayout.prototype.ChordStringSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.CompactMode = null;
net.alphatab.tablature.ViewLayout.prototype.EffectSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.FirstMeasureSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.FirstTrackSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.FontScale = null;
net.alphatab.tablature.ViewLayout.prototype.GetDefaultChordSpacing = function() {
	$s.push("net.alphatab.tablature.ViewLayout::GetDefaultChordSpacing");
	var $spos = $s.length;
	var spacing = 0;
	spacing += (6 * this.ChordFretSpacing) + this.ChordFretSpacing;
	spacing += Math.round(15.0 * this.Scale);
	{
		var $tmp = Math.round(spacing);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.GetMinSpacing = function(duration) {
	$s.push("net.alphatab.tablature.ViewLayout::GetMinSpacing");
	var $spos = $s.length;
	var scale = this.Scale;
	switch(duration.Value) {
	case 1:{
		{
			var $tmp = 50.0 * scale;
			$s.pop();
			return $tmp;
		}
	}break;
	case 2:{
		{
			var $tmp = 30.0 * scale;
			$s.pop();
			return $tmp;
		}
	}break;
	case 4:{
		{
			var $tmp = 55.0 * scale;
			$s.pop();
			return $tmp;
		}
	}break;
	case 8:{
		{
			var $tmp = 20.0 * scale;
			$s.pop();
			return $tmp;
		}
	}break;
	default:{
		{
			var $tmp = 18.0 * this.Scale;
			$s.pop();
			return $tmp;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.GetNoteOrientation = function(x,y,note) {
	$s.push("net.alphatab.tablature.ViewLayout::GetNoteOrientation");
	var $spos = $s.length;
	var noteAsString = "";
	if(note.IsTiedNote) {
		noteAsString = "L";
	}
	else if(note.Effect.DeadNote) {
		noteAsString = "X";
	}
	else {
		noteAsString = net.alphatab.Utils.string(note.Value);
	}
	noteAsString = (note.Effect.GhostNote?("(" + noteAsString) + ")":noteAsString);
	{
		var $tmp = this.GetOrientation(x,y,noteAsString);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.GetOrientation = function(x,y,str) {
	$s.push("net.alphatab.tablature.ViewLayout::GetOrientation");
	var $spos = $s.length;
	this.Tablature.Canvas.setFont(net.alphatab.tablature.drawing.DrawingResources.NoteFont);
	var size = this.Tablature.Canvas.measureText(str);
	{
		var $tmp = new net.alphatab.model.Rectangle(x,y,size.width,net.alphatab.tablature.drawing.DrawingResources.NoteFontHeight);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.GetSpacingForQuarter = function(duration) {
	$s.push("net.alphatab.tablature.ViewLayout::GetSpacingForQuarter");
	var $spos = $s.length;
	{
		var $tmp = (960 / duration.Time()) * this.GetMinSpacing(duration);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.GetVoiceWidth = function(voice) {
	$s.push("net.alphatab.tablature.ViewLayout::GetVoiceWidth");
	var $spos = $s.length;
	var scale = this.Scale;
	var duration = voice.Duration;
	if(duration != null) {
		switch(duration.Value) {
		case 1:{
			{
				var $tmp = (90.0 * scale);
				$s.pop();
				return $tmp;
			}
		}break;
		case 2:{
			{
				var $tmp = (65.0 * scale);
				$s.pop();
				return $tmp;
			}
		}break;
		case 4:{
			{
				var $tmp = (45.0 * scale);
				$s.pop();
				return $tmp;
			}
		}break;
		case 8:{
			{
				var $tmp = (30.0 * scale);
				$s.pop();
				return $tmp;
			}
		}break;
		case 16:{
			{
				var $tmp = (20.0 * scale);
				$s.pop();
				return $tmp;
			}
		}break;
		case 32:{
			{
				var $tmp = (17.0 * scale);
				$s.pop();
				return $tmp;
			}
		}break;
		default:{
			{
				var $tmp = (15.0 * scale);
				$s.pop();
				return $tmp;
			}
		}break;
		}
	}
	{
		var $tmp = 20.0 * scale;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.Height = null;
net.alphatab.tablature.ViewLayout.prototype.Init = function(scale) {
	$s.push("net.alphatab.tablature.ViewLayout::Init");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.IsFirstMeasure = function(measure) {
	$s.push("net.alphatab.tablature.ViewLayout::IsFirstMeasure");
	var $spos = $s.length;
	{
		var $tmp = measure.Number() == 1;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.IsLastMeasure = function(measure) {
	$s.push("net.alphatab.tablature.ViewLayout::IsLastMeasure");
	var $spos = $s.length;
	{
		var $tmp = measure.Number() == this.Tablature.Track.Song.MeasureHeaders.length;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.LayoutSize = null;
net.alphatab.tablature.ViewLayout.prototype.MarkerSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.MinBufferSeparator = null;
net.alphatab.tablature.ViewLayout.prototype.MinScoreTabSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.MinTopSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.PaintCache = function(graphics,area,fromX,fromY) {
	$s.push("net.alphatab.tablature.ViewLayout::PaintCache");
	var $spos = $s.length;
	if(this.Cache == null) {
		this.UpdateCache(graphics,area,fromX,fromY);
		{
			$s.pop();
			return;
		}
	}
	haxe.Log.trace("Painting Cache",{ fileName : "ViewLayout.hx", lineNumber : 117, className : "net.alphatab.tablature.ViewLayout", methodName : "PaintCache"});
	this.Cache.Draw();
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.PaintLines = function(track,ts,context,x,y,width) {
	$s.push("net.alphatab.tablature.ViewLayout::PaintLines");
	var $spos = $s.length;
	if(width > 0) {
		var tempX = Math.max(0,x);
		var tempY = y;
		var posY = tempY + ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		{
			var _g = 1;
			while(_g < 6) {
				var i = _g++;
				context.Get(net.alphatab.tablature.drawing.DrawingLayers.Lines).StartFigure();
				context.Get(net.alphatab.tablature.drawing.DrawingLayers.Lines).AddLine(Math.round(tempX),Math.round(posY),Math.round(tempX + width),Math.round(posY));
				posY += (this.ScoreLineSpacing);
			}
		}
		tempY += ts.Get(net.alphatab.tablature.TrackSpacingPositions.Tablature);
		{
			var _g1 = 0, _g = track.StringCount();
			while(_g1 < _g) {
				var i = _g1++;
				context.Get(net.alphatab.tablature.drawing.DrawingLayers.Lines).StartFigure();
				context.Get(net.alphatab.tablature.drawing.DrawingLayers.Lines).AddLine(Math.round(tempX),Math.round(tempY),Math.round(tempX + width),Math.round(tempY));
				tempY += this.StringSpacing;
			}
		}
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.PaintSong = function(ctx,clientArea,x,y) {
	$s.push("net.alphatab.tablature.ViewLayout::PaintSong");
	var $spos = $s.length;
	null;
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.PrepareLayout = function(clientArea,x,y) {
	$s.push("net.alphatab.tablature.ViewLayout::PrepareLayout");
	var $spos = $s.length;
	null;
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.RepeatEndingSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.Scale = null;
net.alphatab.tablature.ViewLayout.prototype.ScoreLineSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.ScoreSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.SetTablature = function(tablature) {
	$s.push("net.alphatab.tablature.ViewLayout::SetTablature");
	var $spos = $s.length;
	this.Tablature = tablature;
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.SongManager = function() {
	$s.push("net.alphatab.tablature.ViewLayout::SongManager");
	var $spos = $s.length;
	{
		var $tmp = this.Tablature.SongManager;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.StringSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.Tablature = null;
net.alphatab.tablature.ViewLayout.prototype.TextSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.TrackSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.TupletoSpacing = null;
net.alphatab.tablature.ViewLayout.prototype.UpdateCache = function(graphics,area,fromX,fromY) {
	$s.push("net.alphatab.tablature.ViewLayout::UpdateCache");
	var $spos = $s.length;
	haxe.Log.trace("Updating Cache",{ fileName : "ViewLayout.hx", lineNumber : 123, className : "net.alphatab.tablature.ViewLayout", methodName : "UpdateCache"});
	this.Cache = new net.alphatab.tablature.drawing.DrawingContext(this.Scale);
	this.Cache.Graphics = graphics;
	this.PaintSong(this.Cache,area,fromX,fromY);
	this.PaintCache(graphics,area,fromX,fromY);
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.UpdateSong = function() {
	$s.push("net.alphatab.tablature.ViewLayout::UpdateSong");
	var $spos = $s.length;
	if(this.Tablature.Track == null) {
		$s.pop();
		return;
	}
	haxe.Log.trace("Updating Song Data",{ fileName : "ViewLayout.hx", lineNumber : 144, className : "net.alphatab.tablature.ViewLayout", methodName : "UpdateSong"});
	this.UpdateTracks();
	haxe.Log.trace("Updating Song Data finished",{ fileName : "ViewLayout.hx", lineNumber : 146, className : "net.alphatab.tablature.ViewLayout", methodName : "UpdateSong"});
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.UpdateTracks = function() {
	$s.push("net.alphatab.tablature.ViewLayout::UpdateTracks");
	var $spos = $s.length;
	var song = this.Tablature.Track.Song;
	var measureCount = song.MeasureHeaders.length;
	var track = this.Tablature.Track;
	track.PreviousBeat = null;
	track.Update(this);
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			var header = song.MeasureHeaders[i];
			header.Update(this,track);
			var measure = track.Measures[i];
			measure.Create(this);
			measure.Update(this);
		}
	}
	$s.pop();
}
net.alphatab.tablature.ViewLayout.prototype.Width = null;
net.alphatab.tablature.ViewLayout.prototype.__class__ = net.alphatab.tablature.ViewLayout;
haxe.remoting.AsyncConnection = function() { }
haxe.remoting.AsyncConnection.__name__ = ["haxe","remoting","AsyncConnection"];
haxe.remoting.AsyncConnection.prototype.call = null;
haxe.remoting.AsyncConnection.prototype.resolve = null;
haxe.remoting.AsyncConnection.prototype.setErrorHandler = null;
haxe.remoting.AsyncConnection.prototype.__class__ = haxe.remoting.AsyncConnection;
net.alphatab.model.GsMidiChannel = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsMidiChannel::new");
	var $spos = $s.length;
	this.Channel = 0;
	this.EffectChannel = 0;
	this.Instrument(25);
	this.Volume = 127;
	this.Balance = 64;
	this.Chorus = 0;
	this.Reverb = 0;
	this.Phaser = 0;
	this.Tremolo = 0;
	$s.pop();
}}
net.alphatab.model.GsMidiChannel.__name__ = ["net","alphatab","model","GsMidiChannel"];
net.alphatab.model.GsMidiChannel.prototype.Balance = null;
net.alphatab.model.GsMidiChannel.prototype.Channel = null;
net.alphatab.model.GsMidiChannel.prototype.Chorus = null;
net.alphatab.model.GsMidiChannel.prototype.Copy = function(channel) {
	$s.push("net.alphatab.model.GsMidiChannel::Copy");
	var $spos = $s.length;
	channel.Channel = this.Channel;
	channel.EffectChannel = this.EffectChannel;
	channel.Instrument(this.Instrument());
	channel.Volume = this.Volume;
	channel.Balance = this.Balance;
	channel.Chorus = this.Chorus;
	channel.Reverb = this.Reverb;
	channel.Phaser = this.Phaser;
	channel.Tremolo = this.Tremolo;
	$s.pop();
}
net.alphatab.model.GsMidiChannel.prototype.EffectChannel = null;
net.alphatab.model.GsMidiChannel.prototype.Instrument = function(newInstrument) {
	$s.push("net.alphatab.model.GsMidiChannel::Instrument");
	var $spos = $s.length;
	if(newInstrument == null) newInstrument = -1;
	if(newInstrument != -1) this._instrument = newInstrument;
	{
		var $tmp = (this.IsPercussionChannel()?0:this._instrument);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMidiChannel.prototype.IsPercussionChannel = function() {
	$s.push("net.alphatab.model.GsMidiChannel::IsPercussionChannel");
	var $spos = $s.length;
	{
		var $tmp = this.Channel == 9;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsMidiChannel.prototype.Phaser = null;
net.alphatab.model.GsMidiChannel.prototype.Reverb = null;
net.alphatab.model.GsMidiChannel.prototype.Tremolo = null;
net.alphatab.model.GsMidiChannel.prototype.Volume = null;
net.alphatab.model.GsMidiChannel.prototype._instrument = null;
net.alphatab.model.GsMidiChannel.prototype.__class__ = net.alphatab.model.GsMidiChannel;
net.alphatab.tablature.model.TripletGroup = function(voice) { if( voice === $_ ) return; {
	$s.push("net.alphatab.tablature.model.TripletGroup::new");
	var $spos = $s.length;
	this._voiceIndex = voice;
	this._voices = new Array();
	$s.pop();
}}
net.alphatab.tablature.model.TripletGroup.__name__ = ["net","alphatab","tablature","model","TripletGroup"];
net.alphatab.tablature.model.TripletGroup.prototype._triplet = null;
net.alphatab.tablature.model.TripletGroup.prototype._voiceIndex = null;
net.alphatab.tablature.model.TripletGroup.prototype._voices = null;
net.alphatab.tablature.model.TripletGroup.prototype.check = function(voice) {
	$s.push("net.alphatab.tablature.model.TripletGroup::check");
	var $spos = $s.length;
	if(this._voices.length == 0) {
		this._triplet = voice.Duration.Triplet.Enters;
	}
	else {
		if(voice.Index != this._voiceIndex || voice.Duration.Triplet.Enters != this._triplet || this.isFull()) {
			$s.pop();
			return false;
		}
	}
	this._voices.push(voice);
	{
		$s.pop();
		return true;
	}
	$s.pop();
}
net.alphatab.tablature.model.TripletGroup.prototype.isFull = function() {
	$s.push("net.alphatab.tablature.model.TripletGroup::isFull");
	var $spos = $s.length;
	{
		var $tmp = this._voices.length == this._triplet;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.TripletGroup.prototype.paint = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.TripletGroup::paint");
	var $spos = $s.length;
	var scale = layout.Scale;
	var offset = net.alphatab.tablature.drawing.DrawingResources.GetScoreNoteSize(layout,false).Width / 2;
	var startX = this._voices[0].Beat.GetRealPosX(layout) + offset;
	var endX = this._voices[this._voices.length - 1].Beat.GetRealPosX(layout) + offset;
	var key = this._voices[0].Beat.Measure.GetKeySignature();
	var clef = net.alphatab.model.GsMeasureClefConverter.ToInt(this._voices[0].Beat.Measure.Clef);
	var realY = y;
	var draw = (this._voiceIndex == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2));
	var fill = (this._voiceIndex == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	var s = net.alphatab.Utils.string(this._triplet);
	context.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.EffectFont);
	var w = context.Graphics.measureText(s).width;
	var lineW = endX - startX;
	draw.AddLine(startX,realY + 5 * scale,startX,realY);
	draw.AddLine(startX,realY,(startX + (lineW / 2)) - w,realY);
	draw.AddString(s,net.alphatab.tablature.drawing.DrawingResources.EffectFont,startX + ((lineW - w) / 2),realY);
	draw.AddLine((startX + (lineW / 2)) + w,realY,endX,realY);
	draw.AddLine(endX,realY + 5 * scale,endX,realY);
	$s.pop();
}
net.alphatab.tablature.model.TripletGroup.prototype.__class__ = net.alphatab.tablature.model.TripletGroup;
net.alphatab.tablature.TrackSpacingPositions = { __ename__ : ["net","alphatab","tablature","TrackSpacingPositions"], __constructs__ : ["Top","Marker","Text","BufferSeparator","RepeatEnding","Chord","ScoreUpLines","ScoreMiddleLines","ScoreDownLines","Tupleto","AccentuatedEffect","HarmonicEffect","TapingEffect","LetRingEffect","PalmMuteEffect","BeatVibratoEffect","VibratoEffect","FadeIn","Bend","TablatureTopSeparator","Tablature","Lyric","Bottom"] }
net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect = ["AccentuatedEffect",10];
net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect = ["BeatVibratoEffect",15];
net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Bend = ["Bend",18];
net.alphatab.tablature.TrackSpacingPositions.Bend.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Bend.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.Bottom = ["Bottom",22];
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
net.alphatab.tablature.TrackSpacingPositions.Lyric = ["Lyric",21];
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
net.alphatab.tablature.TrackSpacingPositions.Tupleto = ["Tupleto",9];
net.alphatab.tablature.TrackSpacingPositions.Tupleto.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.Tupleto.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.tablature.TrackSpacingPositions.VibratoEffect = ["VibratoEffect",16];
net.alphatab.tablature.TrackSpacingPositions.VibratoEffect.toString = $estr;
net.alphatab.tablature.TrackSpacingPositions.VibratoEffect.__enum__ = net.alphatab.tablature.TrackSpacingPositions;
net.alphatab.model.GsMeasureClefConverter = function() { }
net.alphatab.model.GsMeasureClefConverter.__name__ = ["net","alphatab","model","GsMeasureClefConverter"];
net.alphatab.model.GsMeasureClefConverter.ToInt = function(clef) {
	$s.push("net.alphatab.model.GsMeasureClefConverter::ToInt");
	var $spos = $s.length;
	switch(clef) {
	case net.alphatab.model.GsMeasureClef.Treble:{
		{
			$s.pop();
			return 1;
		}
	}break;
	case net.alphatab.model.GsMeasureClef.Bass:{
		{
			$s.pop();
			return 2;
		}
	}break;
	case net.alphatab.model.GsMeasureClef.Tenor:{
		{
			$s.pop();
			return 3;
		}
	}break;
	case net.alphatab.model.GsMeasureClef.Alto:{
		{
			$s.pop();
			return 4;
		}
	}break;
	default:{
		{
			$s.pop();
			return 1;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.model.GsMeasureClefConverter.ToString = function(clef) {
	$s.push("net.alphatab.model.GsMeasureClefConverter::ToString");
	var $spos = $s.length;
	switch(clef) {
	case net.alphatab.model.GsMeasureClef.Treble:{
		{
			$s.pop();
			return "treble";
		}
	}break;
	case net.alphatab.model.GsMeasureClef.Bass:{
		{
			$s.pop();
			return "bass";
		}
	}break;
	case net.alphatab.model.GsMeasureClef.Tenor:{
		{
			$s.pop();
			return "tenor";
		}
	}break;
	case net.alphatab.model.GsMeasureClef.Alto:{
		{
			$s.pop();
			return "alto";
		}
	}break;
	default:{
		{
			$s.pop();
			return "";
		}
	}break;
	}
	$s.pop();
}
net.alphatab.model.GsMeasureClefConverter.prototype.__class__ = net.alphatab.model.GsMeasureClefConverter;
Reflect = function() { }
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	$s.push("Reflect::hasField");
	var $spos = $s.length;
	if(o.hasOwnProperty != null) {
		var $tmp = o.hasOwnProperty(field);
		$s.pop();
		return $tmp;
	}
	var arr = Reflect.fields(o);
	{ var $it15 = arr.iterator();
	while( $it15.hasNext() ) { var t = $it15.next();
	if(t == field) {
		$s.pop();
		return true;
	}
	}}
	{
		$s.pop();
		return false;
	}
	$s.pop();
}
Reflect.field = function(o,field) {
	$s.push("Reflect::field");
	var $spos = $s.length;
	var v = null;
	try {
		v = o[field];
	}
	catch( $e16 ) {
		{
			var e = $e16;
			{
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				null;
			}
		}
	}
	{
		$s.pop();
		return v;
	}
	$s.pop();
}
Reflect.setField = function(o,field,value) {
	$s.push("Reflect::setField");
	var $spos = $s.length;
	o[field] = value;
	$s.pop();
}
Reflect.callMethod = function(o,func,args) {
	$s.push("Reflect::callMethod");
	var $spos = $s.length;
	{
		var $tmp = func.apply(o,args);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Reflect.fields = function(o) {
	$s.push("Reflect::fields");
	var $spos = $s.length;
	if(o == null) {
		var $tmp = new Array();
		$s.pop();
		return $tmp;
	}
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
					$e = [];
					while($s.length >= $spos) $e.unshift($s.pop());
					$s.push($e[0]);
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
	{
		$s.pop();
		return a;
	}
	$s.pop();
}
Reflect.isFunction = function(f) {
	$s.push("Reflect::isFunction");
	var $spos = $s.length;
	{
		var $tmp = typeof(f) == "function" && f.__name__ == null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Reflect.compare = function(a,b) {
	$s.push("Reflect::compare");
	var $spos = $s.length;
	{
		var $tmp = ((a == b)?0:((((a) > (b))?1:-1)));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Reflect.compareMethods = function(f1,f2) {
	$s.push("Reflect::compareMethods");
	var $spos = $s.length;
	if(f1 == f2) {
		$s.pop();
		return true;
	}
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) {
		$s.pop();
		return false;
	}
	{
		var $tmp = f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Reflect.isObject = function(v) {
	$s.push("Reflect::isObject");
	var $spos = $s.length;
	if(v == null) {
		$s.pop();
		return false;
	}
	var t = typeof(v);
	{
		var $tmp = (t == "string" || (t == "object" && !v.__enum__) || (t == "function" && v.__name__ != null));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Reflect.deleteField = function(o,f) {
	$s.push("Reflect::deleteField");
	var $spos = $s.length;
	if(!Reflect.hasField(o,f)) {
		$s.pop();
		return false;
	}
	delete(o[f]);
	{
		$s.pop();
		return true;
	}
	$s.pop();
}
Reflect.copy = function(o) {
	$s.push("Reflect::copy");
	var $spos = $s.length;
	var o2 = { }
	{
		var _g = 0, _g1 = Reflect.fields(o);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			o2[f] = Reflect.field(o,f);
		}
	}
	{
		$s.pop();
		return o2;
	}
	$s.pop();
}
Reflect.makeVarArgs = function(f) {
	$s.push("Reflect::makeVarArgs");
	var $spos = $s.length;
	{
		var $tmp = function() {
			$s.push("Reflect::makeVarArgs@378");
			var $spos = $s.length;
			var a = new Array();
			{
				var _g1 = 0, _g = arguments.length;
				while(_g1 < _g) {
					var i = _g1++;
					a.push(arguments[i]);
				}
			}
			{
				var $tmp = f(a);
				$s.pop();
				return $tmp;
			}
			$s.pop();
		}
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Reflect.prototype.__class__ = Reflect;
haxe.remoting.DelayedConnection = function(data,path) { if( data === $_ ) return; {
	$s.push("haxe.remoting.DelayedConnection::new");
	var $spos = $s.length;
	this.__data = data;
	this.__path = path;
	$s.pop();
}}
haxe.remoting.DelayedConnection.__name__ = ["haxe","remoting","DelayedConnection"];
haxe.remoting.DelayedConnection.process = function(d) {
	$s.push("haxe.remoting.DelayedConnection::process");
	var $spos = $s.length;
	var cnx = d.__data.cnx;
	if(cnx == null) {
		$s.pop();
		return;
	}
	while(true) {
		var m = d.__data.cache.shift();
		if(m == null) break;
		var c = cnx;
		{
			var _g = 0, _g1 = m.path;
			while(_g < _g1.length) {
				var p = _g1[_g];
				++_g;
				c = c.resolve(p);
			}
		}
		c.setErrorHandler(m.onError);
		c.call(m.params,m.onResult);
	}
	$s.pop();
}
haxe.remoting.DelayedConnection.create = function() {
	$s.push("haxe.remoting.DelayedConnection::create");
	var $spos = $s.length;
	{
		var $tmp = new haxe.remoting.DelayedConnection({ cnx : null, error : function(e) {
			$s.push("haxe.remoting.DelayedConnection::create@90");
			var $spos = $s.length;
			throw e;
			$s.pop();
		}, cache : new Array()},[]);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.remoting.DelayedConnection.prototype.__data = null;
haxe.remoting.DelayedConnection.prototype.__path = null;
haxe.remoting.DelayedConnection.prototype.call = function(params,onResult) {
	$s.push("haxe.remoting.DelayedConnection::call");
	var $spos = $s.length;
	this.__data.cache.push({ path : this.__path, params : params, onResult : onResult, onError : this.__data.error});
	haxe.remoting.DelayedConnection.process(this);
	$s.pop();
}
haxe.remoting.DelayedConnection.prototype.connection = null;
haxe.remoting.DelayedConnection.prototype.getConnection = function() {
	$s.push("haxe.remoting.DelayedConnection::getConnection");
	var $spos = $s.length;
	{
		var $tmp = this.__data.cnx;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.remoting.DelayedConnection.prototype.resolve = function(name) {
	$s.push("haxe.remoting.DelayedConnection::resolve");
	var $spos = $s.length;
	var d = new haxe.remoting.DelayedConnection(this.__data,this.__path.copy());
	d.__path.push(name);
	{
		$s.pop();
		return d;
	}
	$s.pop();
}
haxe.remoting.DelayedConnection.prototype.setConnection = function(cnx) {
	$s.push("haxe.remoting.DelayedConnection::setConnection");
	var $spos = $s.length;
	this.__data.cnx = cnx;
	haxe.remoting.DelayedConnection.process(this);
	{
		$s.pop();
		return cnx;
	}
	$s.pop();
}
haxe.remoting.DelayedConnection.prototype.setErrorHandler = function(h) {
	$s.push("haxe.remoting.DelayedConnection::setErrorHandler");
	var $spos = $s.length;
	this.__data.error = h;
	$s.pop();
}
haxe.remoting.DelayedConnection.prototype.__class__ = haxe.remoting.DelayedConnection;
haxe.remoting.DelayedConnection.__interfaces__ = [haxe.remoting.AsyncConnection];
net.alphatab.model.GsGuitarString = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsGuitarString::new");
	var $spos = $s.length;
	this.Number = 0;
	this.Value = 0;
	$s.pop();
}}
net.alphatab.model.GsGuitarString.__name__ = ["net","alphatab","model","GsGuitarString"];
net.alphatab.model.GsGuitarString.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.GsGuitarString::Clone");
	var $spos = $s.length;
	var newString = factory.NewString();
	newString.Number = this.Number;
	newString.Value = this.Value;
	{
		$s.pop();
		return newString;
	}
	$s.pop();
}
net.alphatab.model.GsGuitarString.prototype.Number = null;
net.alphatab.model.GsGuitarString.prototype.Value = null;
net.alphatab.model.GsGuitarString.prototype.__class__ = net.alphatab.model.GsGuitarString;
net.alphatab.tablature.drawing.TempoPainter = function() { }
net.alphatab.tablature.drawing.TempoPainter.__name__ = ["net","alphatab","tablature","drawing","TempoPainter"];
net.alphatab.tablature.drawing.TempoPainter.PaintTempo = function(context,x,y,scale) {
	$s.push("net.alphatab.tablature.drawing.TempoPainter::PaintTempo");
	var $spos = $s.length;
	var realScale = scale / 5.0;
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	var draw = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw);
	var iWidth = Math.round(scale * 1.33);
	var iHeight = Math.round(scale * 3.5);
	net.alphatab.tablature.drawing.NotePainter.PaintNote(layer,Math.floor(x + (realScale)),Math.floor(y + (iHeight - (scale))),realScale / 1.6,true,net.alphatab.tablature.drawing.DrawingResources.TempoFont);
	draw.StartFigure();
	draw.MoveTo(x + iWidth,y);
	draw.LineTo(x + iWidth,Math.floor(y + (iHeight - (0.66 * scale))));
	$s.pop();
}
net.alphatab.tablature.drawing.TempoPainter.prototype.__class__ = net.alphatab.tablature.drawing.TempoPainter;
net.alphatab.model.GsSongFactory = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsSongFactory::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.model.GsSongFactory.__name__ = ["net","alphatab","model","GsSongFactory"];
net.alphatab.model.GsSongFactory.prototype.NewBeat = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewBeat");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsBeat(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewBendEffect = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewBendEffect");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.effects.GsBendEffect();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewChord = function(stringCount) {
	$s.push("net.alphatab.model.GsSongFactory::NewChord");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsChord(stringCount);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewDuration = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewDuration");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsDuration(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewEffect = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewEffect");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsNoteEffect();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewGraceEffect = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewGraceEffect");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.effects.GsGraceEffect();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewHarmonicEffect = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewHarmonicEffect");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.effects.GsHarmonicEffect();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewLyricLine = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewLyricLine");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsLyricLine();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewLyrics = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewLyrics");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsLyrics();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewMarker = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewMarker");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsMarker();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewMeasure = function(header) {
	$s.push("net.alphatab.model.GsSongFactory::NewMeasure");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsMeasure(header);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewMeasureHeader = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewMeasureHeader");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsMeasureHeader(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewMidiChannel = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewMidiChannel");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsMidiChannel();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewMixTableChange = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewMixTableChange");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsMixTableChange();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewNote = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewNote");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsNote(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewPageSetup = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewPageSetup");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsPageSetup();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewSong = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewSong");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsSong();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewString = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewString");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsGuitarString();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewStroke = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewStroke");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsBeatStroke();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewTempo = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewTempo");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsTempo();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewText = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewText");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsBeatText();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewTimeSignature = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewTimeSignature");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsTimeSignature(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewTrack = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewTrack");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsTrack(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewTremoloBarEffect = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewTremoloBarEffect");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.effects.GsTremoloBarEffect();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewTremoloPickingEffect = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewTremoloPickingEffect");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.effects.GsTremoloPickingEffect(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewTrillEffect = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewTrillEffect");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.effects.GsTrillEffect(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewTriplet = function() {
	$s.push("net.alphatab.model.GsSongFactory::NewTriplet");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsTriplet();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.NewVoice = function(index) {
	$s.push("net.alphatab.model.GsSongFactory::NewVoice");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.model.GsVoice(this,index);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsSongFactory.prototype.__class__ = net.alphatab.model.GsSongFactory;
net.alphatab.tablature.drawing.KeySignaturePainter = function() { }
net.alphatab.tablature.drawing.KeySignaturePainter.__name__ = ["net","alphatab","tablature","drawing","KeySignaturePainter"];
net.alphatab.tablature.drawing.KeySignaturePainter.PaintFlat = function(context,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.KeySignaturePainter::PaintFlat");
	var $spos = $s.length;
	var scale = layout.Scale * 1.2;
	y -= Math.round(2 * layout.ScoreLineSpacing);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeyFlat,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.KeySignaturePainter.PaintNatural = function(context,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.KeySignaturePainter::PaintNatural");
	var $spos = $s.length;
	var scale = layout.Scale * 1.2;
	y -= Math.round(2 * layout.ScoreLineSpacing);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeyNormal,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.KeySignaturePainter.PaintSharp = function(context,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.KeySignaturePainter::PaintSharp");
	var $spos = $s.length;
	var scale = layout.Scale * 1.2;
	y -= Math.round(1.5 * layout.ScoreLineSpacing);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeySharp,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.KeySignaturePainter.PaintSmallFlat = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.KeySignaturePainter::PaintSmallFlat");
	var $spos = $s.length;
	var scale = layout.Scale;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeyFlat,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.KeySignaturePainter.PaintSmallNatural = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.KeySignaturePainter::PaintSmallNatural");
	var $spos = $s.length;
	var scale = layout.Scale;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeyNormal,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.KeySignaturePainter.PaintSmallSharp = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.KeySignaturePainter::PaintSmallSharp");
	var $spos = $s.length;
	var scale = layout.Scale;
	y -= Math.round(layout.ScoreLineSpacing);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.KeySharp,x,y,scale);
	$s.pop();
}
net.alphatab.tablature.drawing.KeySignaturePainter.prototype.__class__ = net.alphatab.tablature.drawing.KeySignaturePainter;
net.alphatab.model.GsSong = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsSong::new");
	var $spos = $s.length;
	this.MeasureHeaders = new Array();
	this.Tracks = new Array();
	this.Title = "";
	this.Subtitle = "";
	this.Artist = "";
	this.Album = "";
	this.Words = "";
	this.Music = "";
	this.Copyright = "";
	this.Tab = "";
	this.Instructions = "";
	this.Notice = "";
	$s.pop();
}}
net.alphatab.model.GsSong.__name__ = ["net","alphatab","model","GsSong"];
net.alphatab.model.GsSong.prototype.AddMeasureHeader = function(header) {
	$s.push("net.alphatab.model.GsSong::AddMeasureHeader");
	var $spos = $s.length;
	header.Song = this;
	this.MeasureHeaders.push(header);
	$s.pop();
}
net.alphatab.model.GsSong.prototype.AddTrack = function(track) {
	$s.push("net.alphatab.model.GsSong::AddTrack");
	var $spos = $s.length;
	track.Song = this;
	this.Tracks.push(track);
	$s.pop();
}
net.alphatab.model.GsSong.prototype.Album = null;
net.alphatab.model.GsSong.prototype.Artist = null;
net.alphatab.model.GsSong.prototype.Copyright = null;
net.alphatab.model.GsSong.prototype.HideTempo = null;
net.alphatab.model.GsSong.prototype.Instructions = null;
net.alphatab.model.GsSong.prototype.Key = null;
net.alphatab.model.GsSong.prototype.Lyrics = null;
net.alphatab.model.GsSong.prototype.MeasureHeaders = null;
net.alphatab.model.GsSong.prototype.Music = null;
net.alphatab.model.GsSong.prototype.Notice = null;
net.alphatab.model.GsSong.prototype.Octave = null;
net.alphatab.model.GsSong.prototype.PageSetup = null;
net.alphatab.model.GsSong.prototype.Subtitle = null;
net.alphatab.model.GsSong.prototype.Tab = null;
net.alphatab.model.GsSong.prototype.Tempo = null;
net.alphatab.model.GsSong.prototype.TempoName = null;
net.alphatab.model.GsSong.prototype.Title = null;
net.alphatab.model.GsSong.prototype.Tracks = null;
net.alphatab.model.GsSong.prototype.Words = null;
net.alphatab.model.GsSong.prototype.__class__ = net.alphatab.model.GsSong;
net.alphatab.MyTrace = function() { }
net.alphatab.MyTrace.__name__ = ["net","alphatab","MyTrace"];
net.alphatab.MyTrace.init = function() {
	$s.push("net.alphatab.MyTrace::init");
	var $spos = $s.length;
	haxe.Log.trace = $closure(net.alphatab.MyTrace,"trace");
	$s.pop();
}
net.alphatab.MyTrace.trace = function(v,i) {
	$s.push("net.alphatab.MyTrace::trace");
	var $spos = $s.length;
	null;
	$s.pop();
}
net.alphatab.MyTrace.__unhtml = function(s) {
	$s.push("net.alphatab.MyTrace::__unhtml");
	var $spos = $s.length;
	{
		var $tmp = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.MyTrace.time = function() {
	$s.push("net.alphatab.MyTrace::time");
	var $spos = $s.length;
	{
		var $tmp = Std.string(Date.now().getTime());
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.MyTrace.prototype.__class__ = net.alphatab.MyTrace;
net.alphatab.model.GsSlideType = { __ename__ : ["net","alphatab","model","GsSlideType"], __constructs__ : ["FastSlideTo","SlowSlideTo","OutDownWards","OutUpWards","IntoFromBelow","IntoFromAbove"] }
net.alphatab.model.GsSlideType.FastSlideTo = ["FastSlideTo",0];
net.alphatab.model.GsSlideType.FastSlideTo.toString = $estr;
net.alphatab.model.GsSlideType.FastSlideTo.__enum__ = net.alphatab.model.GsSlideType;
net.alphatab.model.GsSlideType.IntoFromAbove = ["IntoFromAbove",5];
net.alphatab.model.GsSlideType.IntoFromAbove.toString = $estr;
net.alphatab.model.GsSlideType.IntoFromAbove.__enum__ = net.alphatab.model.GsSlideType;
net.alphatab.model.GsSlideType.IntoFromBelow = ["IntoFromBelow",4];
net.alphatab.model.GsSlideType.IntoFromBelow.toString = $estr;
net.alphatab.model.GsSlideType.IntoFromBelow.__enum__ = net.alphatab.model.GsSlideType;
net.alphatab.model.GsSlideType.OutDownWards = ["OutDownWards",2];
net.alphatab.model.GsSlideType.OutDownWards.toString = $estr;
net.alphatab.model.GsSlideType.OutDownWards.__enum__ = net.alphatab.model.GsSlideType;
net.alphatab.model.GsSlideType.OutUpWards = ["OutUpWards",3];
net.alphatab.model.GsSlideType.OutUpWards.toString = $estr;
net.alphatab.model.GsSlideType.OutUpWards.__enum__ = net.alphatab.model.GsSlideType;
net.alphatab.model.GsSlideType.SlowSlideTo = ["SlowSlideTo",1];
net.alphatab.model.GsSlideType.SlowSlideTo.toString = $estr;
net.alphatab.model.GsSlideType.SlowSlideTo.__enum__ = net.alphatab.model.GsSlideType;
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
net.alphatab.tablature.model.GsChordImpl = function(length) { if( length === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsChordImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsChord.apply(this,[length]);
	$s.pop();
}}
net.alphatab.tablature.model.GsChordImpl.__name__ = ["net","alphatab","tablature","model","GsChordImpl"];
net.alphatab.tablature.model.GsChordImpl.__super__ = net.alphatab.model.GsChord;
for(var k in net.alphatab.model.GsChord.prototype ) net.alphatab.tablature.model.GsChordImpl.prototype[k] = net.alphatab.model.GsChord.prototype[k];
net.alphatab.tablature.model.GsChordImpl.prototype.BeatImpl = function() {
	$s.push("net.alphatab.tablature.model.GsChordImpl::BeatImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Beat;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsChordImpl.prototype.GetPaintPosition = function(iIndex) {
	$s.push("net.alphatab.tablature.model.GsChordImpl::GetPaintPosition");
	var $spos = $s.length;
	{
		var $tmp = this.BeatImpl().MeasureImpl().Ts.Get(iIndex);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsChordImpl.prototype.Paint = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsChordImpl::Paint");
	var $spos = $s.length;
	if(this.Name != null && this.Name != "") {
		var realX = x + Math.round(4 * layout.Scale);
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.Chord);
		context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).AddString(this.Name,net.alphatab.tablature.drawing.DrawingResources.ChordFont,realX,realY);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsChordImpl.prototype.__class__ = net.alphatab.tablature.model.GsChordImpl;
net.alphatab.midi.MidiDataProvider = function() { }
net.alphatab.midi.MidiDataProvider.__name__ = ["net","alphatab","midi","MidiDataProvider"];
net.alphatab.midi.MidiDataProvider.GetSongMidiData = function(song,factory) {
	$s.push("net.alphatab.midi.MidiDataProvider::GetSongMidiData");
	var $spos = $s.length;
	var parser = new net.alphatab.midi.MidiSequenceParser(factory,song,15,100,0);
	var sequence = new net.alphatab.midi.MidiSequenceHandler(song.Tracks.length + 2);
	parser.Parse(sequence);
	{
		var $tmp = sequence.Commands;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiDataProvider.prototype.__class__ = net.alphatab.midi.MidiDataProvider;
net.alphatab.model.Padding = function(right,top,left,bottom) { if( right === $_ ) return; {
	$s.push("net.alphatab.model.Padding::new");
	var $spos = $s.length;
	this.Right = right;
	this.Top = top;
	this.Left = left;
	this.Bottom = bottom;
	$s.pop();
}}
net.alphatab.model.Padding.__name__ = ["net","alphatab","model","Padding"];
net.alphatab.model.Padding.prototype.Bottom = null;
net.alphatab.model.Padding.prototype.Left = null;
net.alphatab.model.Padding.prototype.Right = null;
net.alphatab.model.Padding.prototype.Top = null;
net.alphatab.model.Padding.prototype.getHorizontal = function() {
	$s.push("net.alphatab.model.Padding::getHorizontal");
	var $spos = $s.length;
	{
		var $tmp = this.Left + this.Right;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.Padding.prototype.getVertical = function() {
	$s.push("net.alphatab.model.Padding::getVertical");
	var $spos = $s.length;
	{
		var $tmp = this.Top + this.Bottom;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.Padding.prototype.__class__ = net.alphatab.model.Padding;
net.alphatab.tablature.PageViewLayout = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.PageViewLayout::new");
	var $spos = $s.length;
	net.alphatab.tablature.ViewLayout.apply(this,[]);
	this.Lines = new Array();
	this.MaximumWidth = 0;
	this.MarginLeft = 0;
	this.MarginRight = 0;
	$s.pop();
}}
net.alphatab.tablature.PageViewLayout.__name__ = ["net","alphatab","tablature","PageViewLayout"];
net.alphatab.tablature.PageViewLayout.__super__ = net.alphatab.tablature.ViewLayout;
for(var k in net.alphatab.tablature.ViewLayout.prototype ) net.alphatab.tablature.PageViewLayout.prototype[k] = net.alphatab.tablature.ViewLayout.prototype[k];
net.alphatab.tablature.PageViewLayout.prototype.GetMaxWidth = function() {
	$s.push("net.alphatab.tablature.PageViewLayout::GetMaxWidth");
	var $spos = $s.length;
	if(this.MaximumWidth <= 0) {
		this.MaximumWidth = this.Tablature.Width;
	}
	{
		var $tmp = (this.MaximumWidth - this.MarginLeft) + this.MarginRight;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.GetSheetWidth = function() {
	$s.push("net.alphatab.tablature.PageViewLayout::GetSheetWidth");
	var $spos = $s.length;
	{
		var $tmp = Math.round(795 * this.Scale);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.GetTempLines = function(track,fromIndex,trackSpacing) {
	$s.push("net.alphatab.tablature.PageViewLayout::GetTempLines");
	var $spos = $s.length;
	var line = new net.alphatab.tablature.TempLine();
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
				{
					$s.pop();
					return line;
				}
			}
			line.TempWidth += measure.Width;
			line.MaxY = (measure.MaxY > line.MaxY?measure.MaxY:line.MaxY);
			line.MinY = (measure.MinY < line.MinY?measure.MinY:line.MinY);
			line.AddMeasure(i);
			measure.RegisterSpacing(this,trackSpacing);
		}
	}
	{
		$s.pop();
		return line;
	}
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.Init = function(scale) {
	$s.push("net.alphatab.tablature.PageViewLayout::Init");
	var $spos = $s.length;
	net.alphatab.tablature.ViewLayout.prototype.Init.apply(this,[scale]);
	this.LayoutSize = new net.alphatab.model.Size(this.GetSheetWidth() - net.alphatab.tablature.PageViewLayout.PagePadding.getHorizontal(),this.Height);
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.LayoutSongInfo = function(x,y) {
	$s.push("net.alphatab.tablature.PageViewLayout::LayoutSongInfo");
	var $spos = $s.length;
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
	y += Math.floor(20 * this.Scale);
	if(anySongInfo) {
		y += Math.floor(20 * this.Scale);
	}
	{
		$s.pop();
		return y;
	}
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.Lines = null;
net.alphatab.tablature.PageViewLayout.prototype.MarginLeft = null;
net.alphatab.tablature.PageViewLayout.prototype.MarginRight = null;
net.alphatab.tablature.PageViewLayout.prototype.MaximumWidth = null;
net.alphatab.tablature.PageViewLayout.prototype.MeasureLine = function(track,line,x,y,spacing) {
	$s.push("net.alphatab.tablature.PageViewLayout::MeasureLine");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.PaintLine = function(track,line,context) {
	$s.push("net.alphatab.tablature.PageViewLayout::PaintLine");
	var $spos = $s.length;
	haxe.Log.trace((("Paint Measures " + net.alphatab.Utils.string(line.Measures[0])) + " to ") + net.alphatab.Utils.string(line.Measures[line.Measures.length - 1]),{ fileName : "PageViewLayout.hx", lineNumber : 300, className : "net.alphatab.tablature.PageViewLayout", methodName : "PaintLine"});
	{
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
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.PaintSong = function(ctx,clientArea,x,y) {
	$s.push("net.alphatab.tablature.PageViewLayout::PaintSong");
	var $spos = $s.length;
	var track = this.Tablature.Track;
	y = Math.round(y + net.alphatab.tablature.PageViewLayout.PagePadding.Top);
	y = Math.round(this.PaintSongInfo(ctx,clientArea,x,y) + this.FirstMeasureSpacing);
	{
		var _g1 = 0, _g = this.Lines.length;
		while(_g1 < _g) {
			var l = _g1++;
			var line = this.Lines[l];
			this.PaintLine(track,line,ctx);
		}
	}
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.PaintSongInfo = function(ctx,clientArea,x,y) {
	$s.push("net.alphatab.tablature.PageViewLayout::PaintSongInfo");
	var $spos = $s.length;
	haxe.Log.trace("Paint Song info",{ fileName : "PageViewLayout.hx", lineNumber : 211, className : "net.alphatab.tablature.PageViewLayout", methodName : "PaintSongInfo"});
	var song = this.Tablature.Track.Song;
	x += net.alphatab.tablature.PageViewLayout.PagePadding.Left;
	var tX;
	var size;
	var str = "";
	if(song.Title != "" && ((song.PageSetup.HeaderAndFooter & 1) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.Title);
		ctx.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.TitleFont);
		size = ctx.Graphics.measureText(str);
		tX = (clientArea.Width - size.width) / 2;
		ctx.Get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.alphatab.tablature.drawing.DrawingResources.TitleFont,tX,y,"top");
		y += Math.floor(35 * this.Scale);
	}
	if(song.Subtitle != "" && ((song.PageSetup.HeaderAndFooter & 2) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.Subtitle);
		ctx.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.SubtitleFont);
		size = ctx.Graphics.measureText(str);
		tX = (clientArea.Width - size.width) / 2;
		ctx.Get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.alphatab.tablature.drawing.DrawingResources.SubtitleFont,tX,y,"top");
		y += Math.floor(20 * this.Scale);
	}
	if(song.Artist != "" && ((song.PageSetup.HeaderAndFooter & 4) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.Artist);
		ctx.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.SubtitleFont);
		size = ctx.Graphics.measureText(str);
		tX = (clientArea.Width - size.width) / 2;
		ctx.Get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.alphatab.tablature.drawing.DrawingResources.SubtitleFont,tX,y,"top");
		y += Math.floor(20 * this.Scale);
	}
	if(song.Album != "" && ((song.PageSetup.HeaderAndFooter & 8) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.Album);
		ctx.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.SubtitleFont);
		size = ctx.Graphics.measureText(str);
		tX = (clientArea.Width - size.width) / 2;
		ctx.Get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.alphatab.tablature.drawing.DrawingResources.SubtitleFont,tX,y,"top");
		y += Math.floor(20 * this.Scale);
	}
	if(song.Music != "" && song.Music == song.Words && ((song.PageSetup.HeaderAndFooter & 64) != 0)) {
		str = this.ParsePageSetupString(song.PageSetup.WordsAndMusic);
		ctx.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.WordsFont);
		size = ctx.Graphics.measureText(str);
		tX = ((clientArea.Width - size.width) - net.alphatab.tablature.PageViewLayout.PagePadding.Right);
		ctx.Get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.alphatab.tablature.drawing.DrawingResources.WordsFont,x,y,"top");
		y += Math.floor(20 * this.Scale);
	}
	else {
		if(song.Music != "" && ((song.PageSetup.HeaderAndFooter & 32) != 0)) {
			str = this.ParsePageSetupString(song.PageSetup.Music);
			ctx.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.WordsFont);
			size = ctx.Graphics.measureText(str);
			tX = ((clientArea.Width - size.width) - net.alphatab.tablature.PageViewLayout.PagePadding.Right);
			ctx.Get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.alphatab.tablature.drawing.DrawingResources.WordsFont,tX,y,"top");
		}
		if(song.Words != "" && ((song.PageSetup.HeaderAndFooter & 32) != 0)) {
			str = this.ParsePageSetupString(song.PageSetup.Words);
			ctx.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.WordsFont);
			ctx.Get(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground).AddString(str,net.alphatab.tablature.drawing.DrawingResources.WordsFont,x,y,"top");
		}
		y += Math.floor(20 * this.Scale);
	}
	{
		$s.pop();
		return y;
	}
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.ParsePageSetupString = function(input) {
	$s.push("net.alphatab.tablature.PageViewLayout::ParsePageSetupString");
	var $spos = $s.length;
	var song = this.Tablature.Track.Song;
	input = StringTools.replace(input,"%TITLE%",song.Title);
	input = StringTools.replace(input,"%SUBTITLE%",song.Subtitle);
	input = StringTools.replace(input,"%ARTIST%",song.Artist);
	input = StringTools.replace(input,"%ALBUM%",song.Album);
	input = StringTools.replace(input,"%WORDS%",song.Words);
	input = StringTools.replace(input,"%MUSIC%",song.Music);
	input = StringTools.replace(input,"%WORDSMUSIC%",song.Words);
	input = StringTools.replace(input,"%COPYRIGHT%",song.Copyright);
	{
		$s.pop();
		return input;
	}
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.PrepareLayout = function(clientArea,x,y) {
	$s.push("net.alphatab.tablature.PageViewLayout::PrepareLayout");
	var $spos = $s.length;
	this.Lines = new Array();
	this.MaximumWidth = clientArea.Width;
	this.MarginLeft = net.alphatab.tablature.PageViewLayout.PagePadding.Left;
	this.MarginRight = net.alphatab.tablature.PageViewLayout.PagePadding.Right;
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
		var spacing = new net.alphatab.tablature.TrackSpacing();
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines,Math.round(this.ScoreLineSpacing * 5));
		var line = this.GetTempLines(track,nextMeasureIndex,spacing);
		this.Lines.push(line);
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines,Math.round(Math.abs(line.MinY)));
		if(line.MaxY + this.MinScoreTabSpacing > this.ScoreSpacing) {
			spacing.Set(net.alphatab.tablature.TrackSpacingPositions.ScoreDownLines,Math.round(line.MaxY - (this.ScoreLineSpacing * 4)));
		}
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.TablatureTopSeparator,Math.round(this.MinScoreTabSpacing));
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.Tablature,Math.round((track.TabHeight + this.StringSpacing) + 1));
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.Lyric,10);
		this.CheckDefaultSpacing(spacing);
		this.MeasureLine(track,line,x,posY,spacing);
		var lineHeight = Math.round(spacing.GetSize());
		posY += Math.round(lineHeight + this.TrackSpacing);
		height += Math.round(lineHeight + this.TrackSpacing);
		nextMeasureIndex = line.LastIndex + 1;
	}
	this.Height = height;
	this.Width = this.GetSheetWidth();
	$s.pop();
}
net.alphatab.tablature.PageViewLayout.prototype.__class__ = net.alphatab.tablature.PageViewLayout;
net.alphatab.tablature.TempLine = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.TempLine::new");
	var $spos = $s.length;
	this.TrackSpacing = null;
	this.TempWidth = 0;
	this.LastIndex = 0;
	this.FullLine = false;
	this.MaxY = 0;
	this.MinY = 0;
	this.Measures = new Array();
	$s.pop();
}}
net.alphatab.tablature.TempLine.__name__ = ["net","alphatab","tablature","TempLine"];
net.alphatab.tablature.TempLine.prototype.AddMeasure = function(index) {
	$s.push("net.alphatab.tablature.TempLine::AddMeasure");
	var $spos = $s.length;
	this.Measures.push(index);
	this.LastIndex = index;
	$s.pop();
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
	$s.push("net.alphatab.tablature.model.BeatGroup::new");
	var $spos = $s.length;
	this._voice = voice;
	this._voices = new Array();
	this.Direction = net.alphatab.model.GsVoiceDirection.None;
	this._firstMinNote = null;
	this._firstMaxNote = null;
	this._lastMinNote = null;
	this._lastMaxNote = null;
	this.MaxNote = null;
	this.MinNote = null;
	$s.pop();
}}
net.alphatab.tablature.model.BeatGroup.__name__ = ["net","alphatab","tablature","model","BeatGroup"];
net.alphatab.tablature.model.BeatGroup.GetUpOffset = function(layout) {
	$s.push("net.alphatab.tablature.model.BeatGroup::GetUpOffset");
	var $spos = $s.length;
	{
		var $tmp = 28 * (layout.ScoreLineSpacing / 8.0);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.BeatGroup.GetDownOffset = function(layout) {
	$s.push("net.alphatab.tablature.model.BeatGroup::GetDownOffset");
	var $spos = $s.length;
	{
		var $tmp = 35 * (layout.ScoreLineSpacing / 8.0);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.BeatGroup.prototype.CheckNote = function(note) {
	$s.push("net.alphatab.tablature.model.BeatGroup::CheckNote");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.model.BeatGroup.prototype.CheckVoice = function(voice) {
	$s.push("net.alphatab.tablature.model.BeatGroup::CheckVoice");
	var $spos = $s.length;
	this.CheckNote(voice.MaxNote);
	this.CheckNote(voice.MinNote);
	this._voices.push(voice);
	if(voice.Direction != net.alphatab.model.GsVoiceDirection.None) {
		voice.Direction = voice.Direction;
	}
	$s.pop();
}
net.alphatab.tablature.model.BeatGroup.prototype.Direction = null;
net.alphatab.tablature.model.BeatGroup.prototype.Finish = function(layout,measure) {
	$s.push("net.alphatab.tablature.model.BeatGroup::Finish");
	var $spos = $s.length;
	if(this.Direction == net.alphatab.model.GsVoiceDirection.None) {
		if(measure.NotEmptyVoices > 1) {
			this.Direction = (this._voice == 0?net.alphatab.model.GsVoiceDirection.Up:net.alphatab.model.GsVoiceDirection.Down);
		}
		else {
			var max = Math.abs(this.MinNote.RealValue() - (net.alphatab.tablature.model.BeatGroup.ScoreMiddleKeys[net.alphatab.model.GsMeasureClefConverter.ToInt(measure.Clef) - 1] + 100));
			var min = Math.abs(this.MaxNote.RealValue() - (net.alphatab.tablature.model.BeatGroup.ScoreMiddleKeys[net.alphatab.model.GsMeasureClefConverter.ToInt(measure.Clef) - 1] - 100));
			this.Direction = (max > min?net.alphatab.model.GsVoiceDirection.Up:net.alphatab.model.GsVoiceDirection.Down);
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.BeatGroup.prototype.GetY1 = function(layout,note,key,clef) {
	$s.push("net.alphatab.tablature.model.BeatGroup::GetY1");
	var $spos = $s.length;
	var scale = (layout.ScoreLineSpacing / 2.00);
	var noteValue = note.RealValue();
	var index = noteValue % 12;
	var step = Math.floor(noteValue / 12);
	var offset = (7 * step) * scale;
	var scoreLineY = (key <= 7?Math.floor((net.alphatab.tablature.model.BeatGroup.ScoreSharpPositions[index] * scale) - offset):Math.floor((net.alphatab.tablature.model.BeatGroup.ScoreFlatPositions[index] * scale) - offset));
	scoreLineY += Math.floor(net.alphatab.tablature.model.GsMeasureImpl.ScoreKeyOffsets[clef - 1] * scale);
	{
		$s.pop();
		return scoreLineY;
	}
	$s.pop();
}
net.alphatab.tablature.model.BeatGroup.prototype.GetY2 = function(layout,x,key,clef) {
	$s.push("net.alphatab.tablature.model.BeatGroup::GetY2");
	var $spos = $s.length;
	var MaxDistance = 10;
	var upOffset = net.alphatab.tablature.model.BeatGroup.GetUpOffset(layout);
	var downOffset = net.alphatab.tablature.model.BeatGroup.GetDownOffset(layout);
	var y;
	var x1;
	var x2;
	var y1;
	var y2;
	if(this.Direction == net.alphatab.model.GsVoiceDirection.Down) {
		if(this.MinNote != this._firstMinNote && this.MinNote != this._lastMinNote) {
			{
				var $tmp = Math.round(this.GetY1(layout,this.MinNote,key,clef) + downOffset);
				$s.pop();
				return $tmp;
			}
		}
		y = 0;
		x1 = Math.round(this._firstMinNote.PosX() + this._firstMinNote.Voice.Beat.Spacing());
		x2 = Math.round(this._lastMinNote.PosX() + this._lastMinNote.Voice.Beat.Spacing());
		y1 = Math.round(this.GetY1(layout,this._firstMinNote,key,clef) + downOffset);
		y2 = Math.round(this.GetY1(layout,this._lastMinNote,key,clef) + downOffset);
		if(y1 > y2 && (y1 - y2) > MaxDistance) y2 = (y1 - MaxDistance);
		if(y2 > y1 && (y2 - y1) > MaxDistance) y1 = (y2 - MaxDistance);
		if((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0) {
			y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
		}
		{
			var $tmp = y1 - y;
			$s.pop();
			return $tmp;
		}
	}
	if(this.MaxNote != this._firstMaxNote && this.MaxNote != this._lastMaxNote) {
		{
			var $tmp = Math.round(this.GetY1(layout,this.MaxNote,key,clef) - upOffset);
			$s.pop();
			return $tmp;
		}
	}
	y = 0;
	x1 = Math.round(this._firstMaxNote.PosX() + this._firstMaxNote.Voice.Beat.Spacing());
	x2 = Math.round(this._lastMaxNote.PosX() + this._lastMaxNote.Voice.Beat.Spacing());
	y1 = Math.round(this.GetY1(layout,this._firstMaxNote,key,clef) - upOffset);
	y2 = Math.round(this.GetY1(layout,this._lastMaxNote,key,clef) - upOffset);
	if(y1 < y2 && (y2 - y1) > MaxDistance) y2 = (y1 + MaxDistance);
	if(y2 < y1 && (y1 - y2) > MaxDistance) y1 = (y2 + MaxDistance);
	if((y1 - y2) != 0 && (x1 - x2) != 0 && (x1 - x) != 0) {
		y = Math.round(((y1 - y2) / (x1 - x2)) * (x1 - x));
	}
	{
		var $tmp = y1 - y;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.BeatGroup.prototype.MaxNote = null;
net.alphatab.tablature.model.BeatGroup.prototype.MinNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._firstMaxNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._firstMinNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._lastMaxNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._lastMinNote = null;
net.alphatab.tablature.model.BeatGroup.prototype._voice = null;
net.alphatab.tablature.model.BeatGroup.prototype._voices = null;
net.alphatab.tablature.model.BeatGroup.prototype.__class__ = net.alphatab.tablature.model.BeatGroup;
net.alphatab.model.effects.GsGraceEffectTransition = { __ename__ : ["net","alphatab","model","effects","GsGraceEffectTransition"], __constructs__ : ["None","Slide","Bend","Hammer"] }
net.alphatab.model.effects.GsGraceEffectTransition.Bend = ["Bend",2];
net.alphatab.model.effects.GsGraceEffectTransition.Bend.toString = $estr;
net.alphatab.model.effects.GsGraceEffectTransition.Bend.__enum__ = net.alphatab.model.effects.GsGraceEffectTransition;
net.alphatab.model.effects.GsGraceEffectTransition.Hammer = ["Hammer",3];
net.alphatab.model.effects.GsGraceEffectTransition.Hammer.toString = $estr;
net.alphatab.model.effects.GsGraceEffectTransition.Hammer.__enum__ = net.alphatab.model.effects.GsGraceEffectTransition;
net.alphatab.model.effects.GsGraceEffectTransition.None = ["None",0];
net.alphatab.model.effects.GsGraceEffectTransition.None.toString = $estr;
net.alphatab.model.effects.GsGraceEffectTransition.None.__enum__ = net.alphatab.model.effects.GsGraceEffectTransition;
net.alphatab.model.effects.GsGraceEffectTransition.Slide = ["Slide",1];
net.alphatab.model.effects.GsGraceEffectTransition.Slide.toString = $estr;
net.alphatab.model.effects.GsGraceEffectTransition.Slide.__enum__ = net.alphatab.model.effects.GsGraceEffectTransition;
haxe.io.Eof = function(p) { if( p === $_ ) return; {
	$s.push("haxe.io.Eof::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype.toString = function() {
	$s.push("haxe.io.Eof::toString");
	var $spos = $s.length;
	{
		$s.pop();
		return "Eof";
	}
	$s.pop();
}
haxe.io.Eof.prototype.__class__ = haxe.io.Eof;
net.alphatab.model.GsDuration = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.GsDuration::new");
	var $spos = $s.length;
	this.Value = 4;
	this.IsDotted = false;
	this.IsDoubleDotted = false;
	this.Triplet = factory.NewTriplet();
	$s.pop();
}}
net.alphatab.model.GsDuration.__name__ = ["net","alphatab","model","GsDuration"];
net.alphatab.model.GsDuration.FromTime = function(factory,time,minimum,diff) {
	$s.push("net.alphatab.model.GsDuration::FromTime");
	var $spos = $s.length;
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
		else if(tmp.Triplet.Equals(new net.alphatab.model.GsTriplet())) {
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
	{
		$s.pop();
		return duration;
	}
	$s.pop();
}
net.alphatab.model.GsDuration.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.GsDuration::Clone");
	var $spos = $s.length;
	var duration = factory.NewDuration();
	duration.Value = this.Value;
	duration.IsDotted = this.IsDotted;
	duration.IsDoubleDotted = this.IsDoubleDotted;
	duration.Triplet = this.Triplet.Clone(factory);
	{
		$s.pop();
		return duration;
	}
	$s.pop();
}
net.alphatab.model.GsDuration.prototype.Copy = function(duration) {
	$s.push("net.alphatab.model.GsDuration::Copy");
	var $spos = $s.length;
	duration.Value = this.Value;
	duration.IsDotted = this.IsDotted;
	duration.IsDoubleDotted = this.IsDoubleDotted;
	this.Triplet.Copy(duration.Triplet);
	$s.pop();
}
net.alphatab.model.GsDuration.prototype.Equals = function(other) {
	$s.push("net.alphatab.model.GsDuration::Equals");
	var $spos = $s.length;
	if(other == null) {
		$s.pop();
		return false;
	}
	if(this == other) {
		$s.pop();
		return true;
	}
	{
		var $tmp = other.Value == this.Value && other.IsDotted == this.IsDotted && other.IsDoubleDotted == this.IsDoubleDotted && other.Triplet.Equals(this.Triplet);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsDuration.prototype.Index = function() {
	$s.push("net.alphatab.model.GsDuration::Index");
	var $spos = $s.length;
	var index = 0;
	var value = this.Value;
	while((value = (value >> 1)) > 0) {
		index++;
	}
	{
		$s.pop();
		return index;
	}
	$s.pop();
}
net.alphatab.model.GsDuration.prototype.IsDotted = null;
net.alphatab.model.GsDuration.prototype.IsDoubleDotted = null;
net.alphatab.model.GsDuration.prototype.Time = function() {
	$s.push("net.alphatab.model.GsDuration::Time");
	var $spos = $s.length;
	var time = Math.floor(960 * (4.0 / this.Value));
	if(this.IsDotted) {
		time += Math.floor(time / 2);
	}
	else if(this.IsDoubleDotted) {
		time += Math.floor((time / 4) * 3);
	}
	{
		var $tmp = this.Triplet.ConvertTime(time);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsDuration.prototype.Triplet = null;
net.alphatab.model.GsDuration.prototype.Value = null;
net.alphatab.model.GsDuration.prototype.__class__ = net.alphatab.model.GsDuration;
net.alphatab.model.GsNote = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.GsNote::new");
	var $spos = $s.length;
	this.Value = 0;
	this.Velocity = 95;
	this.String = 1;
	this.IsTiedNote = false;
	this.Effect = factory.NewEffect();
	$s.pop();
}}
net.alphatab.model.GsNote.__name__ = ["net","alphatab","model","GsNote"];
net.alphatab.model.GsNote.prototype.Duration = null;
net.alphatab.model.GsNote.prototype.DurationPercent = null;
net.alphatab.model.GsNote.prototype.Effect = null;
net.alphatab.model.GsNote.prototype.IsFingering = null;
net.alphatab.model.GsNote.prototype.IsTiedNote = null;
net.alphatab.model.GsNote.prototype.LeftHandFinger = null;
net.alphatab.model.GsNote.prototype.RealValue = function() {
	$s.push("net.alphatab.model.GsNote::RealValue");
	var $spos = $s.length;
	{
		var $tmp = this.Value + this.Voice.Beat.Measure.Track.Strings[this.String - 1].Value;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsNote.prototype.RightHandFinger = null;
net.alphatab.model.GsNote.prototype.String = null;
net.alphatab.model.GsNote.prototype.Triplet = null;
net.alphatab.model.GsNote.prototype.Value = null;
net.alphatab.model.GsNote.prototype.Velocity = null;
net.alphatab.model.GsNote.prototype.Voice = null;
net.alphatab.model.GsNote.prototype.__class__ = net.alphatab.model.GsNote;
net.alphatab.tablature.model.GsNoteImpl = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsNote.apply(this,[factory]);
	this._noteOrientation = new net.alphatab.model.Rectangle(0,0,0,0);
	$s.pop();
}}
net.alphatab.tablature.model.GsNoteImpl.__name__ = ["net","alphatab","tablature","model","GsNoteImpl"];
net.alphatab.tablature.model.GsNoteImpl.__super__ = net.alphatab.model.GsNote;
for(var k in net.alphatab.model.GsNote.prototype ) net.alphatab.tablature.model.GsNoteImpl.prototype[k] = net.alphatab.model.GsNote.prototype[k];
net.alphatab.tablature.model.GsNoteImpl.prototype.BeatImpl = function() {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::BeatImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Voice.Beat;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.CalculateBendOverflow = function(layout) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::CalculateBendOverflow");
	var $spos = $s.length;
	var point = null;
	{
		var _g = 0, _g1 = this.Effect.Bend.Points;
		while(_g < _g1.length) {
			var curr = _g1[_g];
			++_g;
			if(point == null || point.Value < curr.Value) point = curr;
		}
	}
	if(point == null) {
		$s.pop();
		return 0;
	}
	var fullHeight = point.Value * (6 * layout.Scale);
	var heightToTabNote = (this.String - 1) * layout.StringSpacing;
	{
		var $tmp = Math.round(fullHeight - heightToTabNote);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.GetPaintPosition = function(iIndex) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::GetPaintPosition");
	var $spos = $s.length;
	{
		var $tmp = this.MeasureImpl().Ts.Get(iIndex);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.MeasureImpl = function() {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::MeasureImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Voice.Beat.MeasureImpl();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.NoteForTie = function() {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::NoteForTie");
	var $spos = $s.length;
	var m = this.MeasureImpl();
	var nextIndex;
	do {
		var i = m.BeatCount() - 1;
		while(i >= 0) {
			var beat = m.Beats[i];
			var voice = beat.Voices[this.Voice.Index];
			if(beat.Start < this.Voice.Beat.Start && !voice.IsRestVoice()) {
				{
					var _g = 0, _g1 = voice.Notes;
					while(_g < _g1.length) {
						var note = _g1[_g];
						++_g;
						if(note.String == this.String) {
							{
								$s.pop();
								return note;
							}
						}
					}
				}
			}
			i--;
		}
		nextIndex = m.Number() - 2;
		m = (nextIndex >= 0?m.TrackImpl().Measures[nextIndex]:null);
	} while(m != null && m.Number() >= this.MeasureImpl().Number() - 3 && m.Ts == this.MeasureImpl().Ts);
	{
		$s.pop();
		return null;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.Paint = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::Paint");
	var $spos = $s.length;
	var spacing = this.Voice.Beat.Spacing();
	this.PaintScoreNote(layout,context,x,y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines),spacing);
	this.PaintOfflineEffects(layout,context,x,y,spacing);
	this.PaintTablatureNote(layout,context,x,y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.Tablature),spacing);
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintAccentuated = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintAccentuated");
	var $spos = $s.length;
	var realX = x;
	var realY = y;
	var layer = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.AccentuatedNote,realX,realY,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintBend = function(layout,context,nextBeat,fromX,fromY) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintBend");
	var $spos = $s.length;
	var scale = layout.Scale;
	var iX = fromX;
	var iY = fromY - (2.0 * scale);
	var iXTo;
	var iMinY = iY - 60 * scale;
	if(nextBeat == null) {
		iXTo = (this.Voice.Beat.MeasureImpl().PosX + this.Voice.Beat.MeasureImpl().Width) + this.Voice.Beat.MeasureImpl().Spacing;
	}
	else {
		if(nextBeat.GetNotes().length > 0) {
			iXTo = (((nextBeat.MeasureImpl().PosX + nextBeat.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)) + nextBeat.PosX) + (nextBeat.Spacing() * scale)) + 5 * scale;
		}
		else {
			iXTo = ((nextBeat.MeasureImpl().PosX + nextBeat.PosX) + nextBeat.Spacing()) + 5 * scale;
		}
	}
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var draw = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
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
				var firstLoc = new net.alphatab.model.Point(iX + (dX * firstPt.Position),iY - dY * firstPt.Value);
				var secondLoc = new net.alphatab.model.Point(iX + (dX * secondPt.Position),iY - dY * secondPt.Value);
				var firstHelper = new net.alphatab.model.Point(firstLoc.X + ((secondLoc.X - firstLoc.X)),iY - dY * firstPt.Value);
				draw.AddBezier(firstLoc.X,firstLoc.Y,firstHelper.X,firstHelper.Y,secondLoc.X,secondLoc.Y,secondLoc.X,secondLoc.Y);
				var arrowSize = 4 * scale;
				if(secondPt.Value > firstPt.Value) {
					draw.AddLine(secondLoc.X - 0.5,secondLoc.Y,(secondLoc.X - arrowSize) - 0.5,secondLoc.Y + arrowSize);
					draw.AddLine(secondLoc.X - 0.5,secondLoc.Y,(secondLoc.X + arrowSize) - 0.5,secondLoc.Y + arrowSize);
				}
				else if(secondPt.Value != firstPt.Value) {
					draw.AddLine(secondLoc.X - 0.5,secondLoc.Y,(secondLoc.X - arrowSize) - 0.5,secondLoc.Y - arrowSize);
					draw.AddLine(secondLoc.X - 0.5,secondLoc.Y,(secondLoc.X + arrowSize) - 0.5,secondLoc.Y - arrowSize);
				}
				if(secondPt.Value != 0) {
					var dV = (secondPt.Value - firstPt.Value) * 0.25;
					var up = dV > 0;
					dV = Math.abs(dV);
					var s = "";
					if(dV == 1) s = "full";
					else if(dV > 1) {
						s += net.alphatab.Utils.string(Math.floor(dV)) + " ";
						dV -= Math.floor(dV);
					}
					if(dV == 0.25) s += "1/4";
					else if(dV == 0.5) s += "1/2";
					else if(dV == 0.75) s += "3/4";
					context.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.DefaultFont);
					var size = context.Graphics.measureText(s);
					var y = (up?(secondLoc.Y - net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight) + (2 * scale):secondLoc.Y - (2 * scale));
					var x = secondLoc.X - size.width / 2;
					fill.AddString(s,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,x,y);
				}
			}
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintEffects = function(layout,context,x,y,spacing) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintEffects");
	var $spos = $s.length;
	var scale = layout.Scale;
	var realX = x;
	var realY = y + this.TabPosY;
	var effect = this.Effect;
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	if(effect.IsGrace()) {
		var value = (effect.Grace.IsDead?"X":net.alphatab.Utils.string(effect.Grace.Fret));
		fill.AddString(value,net.alphatab.tablature.drawing.DrawingResources.GraceFont,Math.round(this._noteOrientation.X - 7 * scale),this._noteOrientation.Y);
	}
	if(effect.IsBend()) {
		var nextBeat = layout.SongManager().GetNextBeat(this.Voice.Beat,this.Voice.Index);
		if(nextBeat != null && nextBeat.MeasureImpl().Ts != this.MeasureImpl().Ts) nextBeat = null;
		this.PaintBend(layout,context,nextBeat,this._noteOrientation.X + this._noteOrientation.Width,realY);
	}
	else if(effect.IsTremoloBar()) {
		var nextBeat = layout.SongManager().GetNextBeat(this.Voice.Beat,this.Voice.Index);
		if(nextBeat != null && nextBeat.MeasureImpl().Ts != this.MeasureImpl().Ts) nextBeat = null;
		this.PaintTremoloBar(layout,context,nextBeat,this._noteOrientation.X,realY);
	}
	else if(effect.Slide || effect.Hammer) {
		var nextFromX = x;
		var nextNote = layout.SongManager().GetNextNote(this.MeasureImpl(),this.Voice.Beat.Start,this.Voice.Index,this.String);
		if(effect.Slide) {
			this.PaintSlide(layout,context,nextNote,realX,realY,nextFromX);
		}
		else if(effect.Hammer) {
			this.PaintHammer(layout,context,nextNote,realX,realY);
		}
	}
	if(effect.Vibrato) null;
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintFadeIn = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintFadeIn");
	var $spos = $s.length;
	var scale = layout.Scale;
	var realX = x;
	var realY = Math.round(y + (4.0 * scale));
	var fWidth = Math.round(this.Voice.Width);
	var layer = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2));
	layer.StartFigure();
	layer.AddBezier(realX,realY,realX,realY,realX + fWidth,realY,realX + fWidth,Math.round(realY - (4 * scale)));
	layer.StartFigure();
	layer.AddBezier(realX,realY,realX,realY,realX + fWidth,realY,realX + fWidth,Math.round(realY + (4 * scale)));
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintGrace = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintGrace");
	var $spos = $s.length;
	var scale = layout.ScoreLineSpacing / 2.25;
	var realX = x - (2 * scale);
	var realY = y - (9 * layout.Scale);
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var s = (this.Effect.DeadNote?net.alphatab.tablature.drawing.MusicFont.GraceDeadNote:net.alphatab.tablature.drawing.MusicFont.GraceNote);
	fill.AddMusicSymbol(s,realX - scale * 1.33,realY,layout.Scale);
	if(this.Effect.Grace.Transition == net.alphatab.model.effects.GsGraceEffectTransition.Hammer || this.Effect.Grace.Transition == net.alphatab.model.effects.GsGraceEffectTransition.Slide) {
		this.PaintHammer(layout,context,null,x - (15 * layout.Scale),y + (5 * layout.Scale),true);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintHammer = function(layout,context,nextNote,x,y,forceDown) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintHammer");
	var $spos = $s.length;
	if(forceDown == null) forceDown = false;
	var xScale = layout.Scale;
	var yScale = layout.StringSpacing / 10.0;
	var realX = x + (7.0 * xScale);
	var realY = y - (net.alphatab.tablature.drawing.DrawingResources.NoteFontHeight * layout.Scale);
	var width = (nextNote != null?(nextNote.Voice.Beat.GetRealPosX(layout) - 4 * xScale) - realX:10.0 * xScale);
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var wScale = width / 16;
	var hScale = ((this.String > 3 || forceDown)?-1:1);
	if(this.String > 3 || forceDown) realY += (net.alphatab.tablature.drawing.DrawingResources.NoteFontHeight * layout.Scale) * 2;
	fill.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.HammerPullUp,realX,realY,layout.Scale * wScale,layout.Scale * hScale);
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintHeavyAccentuated = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintHeavyAccentuated");
	var $spos = $s.length;
	var realX = x;
	var realY = y;
	var layer = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.HeavyAccentuatedNote,realX,realY,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintOfflineEffects = function(layout,context,x,y,spacing) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintOfflineEffects");
	var $spos = $s.length;
	var effect = this.Effect;
	var realX = x + 3 * layout.Scale;
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var draw = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	if(effect.AccentuatedNote) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect);
		this.PaintAccentuated(layout,context,realX,realY);
	}
	else if(effect.HeavyAccentuatedNote) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect);
		this.PaintHeavyAccentuated(layout,context,realX,realY);
	}
	if(effect.FadeIn) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.FadeIn);
		this.PaintFadeIn(layout,context,realX,realY);
	}
	if(effect.IsHarmonic()) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect);
		var key = "";
		switch(effect.Harmonic.Type) {
		case net.alphatab.model.effects.GsHarmonicType.Natural:{
			key = "N.H";
		}break;
		case net.alphatab.model.effects.GsHarmonicType.Artificial:{
			key = "A.H";
		}break;
		case net.alphatab.model.effects.GsHarmonicType.Tapped:{
			key = "T.H";
		}break;
		case net.alphatab.model.effects.GsHarmonicType.Pinch:{
			key = "P.H";
		}break;
		case net.alphatab.model.effects.GsHarmonicType.Semi:{
			key = "S.H";
		}break;
		}
		fill.AddString(key,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	}
	if(effect.Tapping) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.TapingEffect);
		fill.AddString("T",net.alphatab.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	}
	else if(effect.Slapping) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.TapingEffect);
		fill.AddString("S",net.alphatab.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	}
	else if(effect.Popping) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.TapingEffect);
		fill.AddString("P",net.alphatab.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	}
	if(effect.LetRing) {
		var beat = this.Voice.Beat.PreviousBeat;
		var prevRing = false;
		var nextRing = false;
		var isPreviousFirst = false;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.GetNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var impl = note;
					if(note.Effect.LetRing && impl.Voice.Beat.MeasureImpl().Ts == this.Voice.Beat.MeasureImpl().Ts) {
						prevRing = true;
						break;
					}
				}
			}
		}
		beat = this.Voice.Beat.NextBeat;
		var endX = realX + this.Voice.Beat.Width();
		var nextOnSameLine = false;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.GetNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var impl = note;
					if(note.Effect.LetRing) {
						nextRing = true;
						if(impl.Voice.Beat.MeasureImpl().Ts == this.Voice.Beat.MeasureImpl().Ts) {
							endX = beat.GetRealPosX(layout);
						}
						break;
					}
				}
			}
		}
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.LetRingEffect);
		var height = net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight;
		var startX = realX;
		if(!nextRing) {
			endX -= this.Voice.Beat.Width() / 2;
		}
		if(!prevRing) {
			fill.AddString("ring",net.alphatab.tablature.drawing.DrawingResources.EffectFont,startX,realY);
			context.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.EffectFont);
			startX += context.Graphics.measureText("ring").width + (6 * layout.Scale);
		}
		else {
			startX -= 6 * layout.Scale;
		}
		if(prevRing || nextRing) {
			draw.StartFigure();
			draw.AddLine(startX,Math.round(realY),endX,Math.round(realY));
		}
		if(!nextRing && prevRing) {
			var size = 8 * layout.Scale;
			draw.AddLine(endX,realY - (size / 2),endX,realY + (size / 2));
		}
	}
	if(effect.PalmMute) {
		var beat = this.Voice.Beat.PreviousBeat;
		var prevPalm = false;
		var nextPalm = false;
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.GetNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var impl = note;
					if(note.Effect.PalmMute && impl.Voice.Beat.MeasureImpl().Ts == this.Voice.Beat.MeasureImpl().Ts) {
						prevPalm = true;
						break;
					}
				}
			}
		}
		beat = this.Voice.Beat.NextBeat;
		var endX = realX + this.Voice.Beat.Width();
		if(beat != null) {
			{
				var _g = 0, _g1 = beat.GetNotes();
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					var impl = note;
					if(note.Effect.PalmMute) {
						nextPalm = true;
						if(impl.Voice.Beat.MeasureImpl().Ts == this.Voice.Beat.MeasureImpl().Ts) {
							endX = beat.GetRealPosX(layout);
						}
						break;
					}
				}
			}
		}
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect);
		var height = net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight;
		var startX = realX;
		if(!nextPalm) {
			endX -= 6 * layout.Scale;
		}
		if(!prevPalm) {
			fill.AddString("P.M.",net.alphatab.tablature.drawing.DrawingResources.EffectFont,startX,realY);
			context.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.EffectFont);
			startX += context.Graphics.measureText("P.M.").width + (6 * layout.Scale);
		}
		else {
			startX -= 6 * layout.Scale;
		}
		draw.StartFigure();
		draw.AddLine(startX,Math.round(realY),endX,Math.round(realY));
		if(!nextPalm && prevPalm) {
			var size = 8 * layout.Scale;
			draw.AddLine(endX,realY - (size / 2),endX,realY + (size / 2));
		}
	}
	if(effect.BeatVibrato) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect);
		this.PaintVibrato(layout,context,realX,realY,1);
	}
	if(effect.Vibrato) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.VibratoEffect);
		this.PaintVibrato(layout,context,realX,realY,0.75);
	}
	if(effect.IsTrill()) {
		var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.VibratoEffect);
		this.PaintTrill(layout,context,realX,realY);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintScoreNote = function(layout,context,x,y,spacing) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintScoreNote");
	var $spos = $s.length;
	var scoreSpacing = layout.ScoreLineSpacing;
	var direction = this.Voice.BeatGroup.Direction;
	var key = this.MeasureImpl().GetKeySignature();
	var clef = net.alphatab.model.GsMeasureClefConverter.ToInt(this.MeasureImpl().Clef);
	var realX = x + 4 * layout.Scale;
	var realY1 = y + this.ScorePosY;
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	var effect = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	if(this.IsTiedNote) {
		var noteForTie = this.NoteForTie();
		var tieScale = scoreSpacing / 8.0;
		var tieX = realX - (20.0 * tieScale);
		var tieY = realY1;
		var tieWidth = 20.0 * tieScale;
		var tieHeight = 30.0 * tieScale;
		if(noteForTie != null) {
			tieX = noteForTie.Voice.Beat.LastPaintX + 15 * layout.Scale;
			tieY = y + this.ScorePosY;
			tieWidth = (realX - tieX);
			tieHeight = (20.0 * tieScale);
		}
		if(tieWidth > 0 && tieHeight > 0) {
			var wScale = tieWidth / 16;
			fill.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.HammerPullUp,tieX,realY1,layout.Scale);
		}
	}
	var accidentalX = x - 2 * layout.Scale;
	if(this._accidental == 1) {
		net.alphatab.tablature.drawing.KeySignaturePainter.PaintSmallNatural(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	else if(this._accidental == 2) {
		net.alphatab.tablature.drawing.KeySignaturePainter.PaintSmallSharp(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	else if(this._accidental == 3) {
		net.alphatab.tablature.drawing.KeySignaturePainter.PaintSmallFlat(fill,accidentalX,realY1 + scoreSpacing / 2,layout);
	}
	if(this.Effect.IsHarmonic()) {
		var full = this.Voice.Duration.Value >= 4;
		var layer = (full?fill:effect);
		net.alphatab.tablature.drawing.NotePainter.PaintHarmonic(layer,realX,realY1 + 1,layout.Scale);
	}
	else if(this.Effect.DeadNote) {
		net.alphatab.tablature.drawing.NotePainter.PaintDeadNote(fill,realX,realY1,layout.Scale,net.alphatab.tablature.drawing.DrawingResources.ClefFont);
	}
	else {
		var full = this.Voice.Duration.Value >= 4;
		net.alphatab.tablature.drawing.NotePainter.PaintNote(fill,realX,realY1,layout.Scale,full,net.alphatab.tablature.drawing.DrawingResources.ClefFont);
	}
	if(this.Effect.IsGrace()) {
		this.PaintGrace(layout,context,realX,realY1);
	}
	if(this.Voice.Duration.IsDotted || this.Voice.Duration.IsDoubleDotted) {
		this.Voice.PaintDot(layout,fill,realX + (12.0 * (scoreSpacing / 8.0)),realY1 + (layout.ScoreLineSpacing / 2),scoreSpacing / 10.0);
	}
	var xMove = (direction == net.alphatab.model.GsVoiceDirection.Up?net.alphatab.tablature.drawing.DrawingResources.GetScoreNoteSize(layout,false).Width:0);
	var realY2 = y + this.Voice.BeatGroup.GetY2(layout,this.PosX() + spacing,key,clef);
	if(this.Effect.Staccato) {
		var Size = 3;
		var stringX = realX + xMove;
		var stringY = (realY2 + (4 * (((direction == net.alphatab.model.GsVoiceDirection.Up)?-1:1))));
		fill.AddCircle(stringX - (Size / 2),stringY - (Size / 2),Size);
	}
	if(this.Effect.IsTremoloPicking()) {
		var s = "";
		switch(this.Effect.TremoloPicking.Duration.Value) {
		case 8:{
			s = (direction == net.alphatab.model.GsVoiceDirection.Up?net.alphatab.tablature.drawing.MusicFont.TrillUpEigth:net.alphatab.tablature.drawing.MusicFont.TrillDownEigth);
		}break;
		case 16:{
			s = (direction == net.alphatab.model.GsVoiceDirection.Up?net.alphatab.tablature.drawing.MusicFont.TrillUpSixteenth:net.alphatab.tablature.drawing.MusicFont.TrillDownSixteenth);
		}break;
		case 32:{
			s = (direction == net.alphatab.model.GsVoiceDirection.Up?net.alphatab.tablature.drawing.MusicFont.TrillUpThirtySecond:net.alphatab.tablature.drawing.MusicFont.TrillDownThirtySecond);
		}break;
		}
		if(s != "") fill.AddMusicSymbol(s,realX,realY1,layout.Scale);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintSlide = function(layout,context,nextNote,x,y,nextX) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintSlide");
	var $spos = $s.length;
	var xScale = layout.Scale;
	var yScale = layout.StringSpacing / 10.0;
	var yMove = 3.0 * yScale;
	var realX = x;
	var realY = y;
	var rextY = realY;
	var draw = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
	draw.StartFigure();
	if(this.Effect.SlideType == net.alphatab.model.GsSlideType.IntoFromBelow) {
		realY += yMove;
		rextY -= yMove;
		draw.AddLine(realX - (5 * xScale),realY,realX + (3 * xScale),rextY);
	}
	else if(this.Effect.SlideType == net.alphatab.model.GsSlideType.IntoFromAbove) {
		realY -= yMove;
		rextY += yMove;
		draw.AddLine(realX - (5 * xScale),realY,realX + (3 * xScale),rextY);
	}
	else if(this.Effect.SlideType == net.alphatab.model.GsSlideType.OutDownWards) {
		realY -= yMove;
		rextY += yMove;
		draw.AddLine(realX + (10 * xScale),realY,realX + (18 * xScale),rextY);
	}
	else if(this.Effect.SlideType == net.alphatab.model.GsSlideType.OutUpWards) {
		realY += yMove;
		rextY -= yMove;
		draw.AddLine(realX + (10 * xScale),realY,realX + (18 * xScale),rextY);
	}
	else if(nextNote != null) {
		var fNextX = nextNote.Voice.Beat.GetRealPosX(layout);
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
		if(this.Effect.SlideType == net.alphatab.model.GsSlideType.SlowSlideTo) {
			this.PaintHammer(layout,context,nextNote,x,y);
		}
	}
	else {
		draw.AddLine(realX + (13 * xScale),realY - yMove,realX + (19 * xScale),realY - yMove);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintTablatureNote = function(layout,context,x,y,spacing) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintTablatureNote");
	var $spos = $s.length;
	var realX = x + Math.round(3 * layout.Scale);
	var realY = y + this.TabPosY;
	this._noteOrientation.X = realX;
	this._noteOrientation.Y = realY;
	this._noteOrientation.Width = 0;
	this._noteOrientation.Height = 0;
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice2));
	if(!this.IsTiedNote) {
		this._noteOrientation = layout.GetNoteOrientation(realX,realY,this);
		var visualNote = (this.Effect.DeadNote?"X":net.alphatab.Utils.string(this.Value));
		visualNote = (this.Effect.GhostNote?("(" + visualNote) + ")":visualNote);
		fill.AddString(visualNote,net.alphatab.tablature.drawing.DrawingResources.NoteFont,this._noteOrientation.X,this._noteOrientation.Y);
	}
	this.PaintEffects(layout,context,x,y,spacing);
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintTremoloBar = function(layout,context,nextBeat,x,y) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintTremoloBar");
	var $spos = $s.length;
	var scale = layout.Scale;
	var realX = x + (10 * scale);
	var realY = y - (2.0 * scale);
	var xTo;
	var minY = realY - 60 * scale;
	if(nextBeat == null) {
		xTo = (this.Voice.Beat.MeasureImpl().PosX + this.Voice.Beat.MeasureImpl().Width) + this.Voice.Beat.MeasureImpl().Spacing;
	}
	else {
		xTo = (((nextBeat.MeasureImpl().PosX + nextBeat.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)) + nextBeat.PosX) + (nextBeat.Spacing() * scale)) + 5 * scale;
	}
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var draw = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2));
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
				var firstLoc = new net.alphatab.model.Point(Math.floor(realX + (dX * firstPt.Position)),Math.floor(realY - dY * firstPt.Value));
				var secondLoc = new net.alphatab.model.Point(Math.floor(realX + (dX * secondPt.Position)),Math.floor(realY - dY * secondPt.Value));
				draw.AddLine(firstLoc.X,firstLoc.Y,secondLoc.X,secondLoc.Y);
				if(secondPt.Value != 0) {
					var dV = (secondPt.Value) * 0.5;
					var up = (secondPt.Value - firstPt.Value) >= 0;
					var s = "";
					s += net.alphatab.Utils.string(Math.floor(dV)) + " ";
					dV -= Math.floor(dV);
					if(dV == 0.25) s += "1/4";
					else if(dV == 0.5) s += "1/2";
					else if(dV == 0.75) s += "3/4";
					context.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.DefaultFont);
					var size = context.Graphics.measureText(s);
					var sY = (up?(secondLoc.Y - net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight) - (3 * scale):secondLoc.Y + (3 * scale));
					var sX = secondLoc.X - size.width / 2;
					fill.AddString(s,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,sX,sY);
				}
			}
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintTrill = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintTrill");
	var $spos = $s.length;
	var str = "Tr";
	context.Graphics.setFont(net.alphatab.tablature.drawing.DrawingResources.EffectFont);
	var size = context.Graphics.measureText(str);
	var scale = layout.Scale;
	var realX = (x + size.width) - 2 * scale;
	var realY = y + (net.alphatab.tablature.drawing.DrawingResources.EffectFontHeight - (5.0 * scale)) / 2.0;
	var width = (this.Voice.Width - size.Width) - (2.0 * scale);
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	fill.AddString(str,net.alphatab.tablature.drawing.DrawingResources.EffectFont,x,y);
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PaintVibrato = function(layout,context,x,y,symbolScale) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PaintVibrato");
	var $spos = $s.length;
	var scale = layout.Scale;
	var realX = x - 2 * scale;
	var realY = y + (2.0 * scale);
	var width = this.Voice.Width;
	var fill = (this.Voice.Index == 0?context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1):context.Get(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2));
	var step = (18 * scale) * symbolScale;
	var loops = Math.floor(Math.max(1,(width / step)));
	var s = "";
	{
		var _g = 0;
		while(_g < loops) {
			var i = _g++;
			fill.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.VibratoLeftRight,realX,realY,layout.Scale * symbolScale);
			realX += step;
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.PosX = function() {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::PosX");
	var $spos = $s.length;
	{
		var $tmp = this.Voice.Beat.PosX;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.ScorePosY = null;
net.alphatab.tablature.model.GsNoteImpl.prototype.TabPosY = null;
net.alphatab.tablature.model.GsNoteImpl.prototype.Update = function(layout) {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::Update");
	var $spos = $s.length;
	this._accidental = this.MeasureImpl().GetNoteAccidental(this.RealValue());
	this.TabPosY = Math.round((this.String * layout.StringSpacing) - layout.StringSpacing);
	this.ScorePosY = this.Voice.BeatGroup.GetY1(layout,this,this.MeasureImpl().GetKeySignature(),net.alphatab.model.GsMeasureClefConverter.ToInt(this.MeasureImpl().Clef));
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype.VoiceImpl = function() {
	$s.push("net.alphatab.tablature.model.GsNoteImpl::VoiceImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Voice;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsNoteImpl.prototype._accidental = null;
net.alphatab.tablature.model.GsNoteImpl.prototype._noteOrientation = null;
net.alphatab.tablature.model.GsNoteImpl.prototype.__class__ = net.alphatab.tablature.model.GsNoteImpl;
net.alphatab.tablature.drawing.ClefPainter = function() { }
net.alphatab.tablature.drawing.ClefPainter.__name__ = ["net","alphatab","tablature","drawing","ClefPainter"];
net.alphatab.tablature.drawing.ClefPainter.PaintAlto = function(context,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.ClefPainter::PaintAlto");
	var $spos = $s.length;
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.AltoClef,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.ClefPainter.PaintBass = function(context,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.ClefPainter::PaintBass");
	var $spos = $s.length;
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.BassClef,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.ClefPainter.PaintTenor = function(context,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.ClefPainter::PaintTenor");
	var $spos = $s.length;
	y -= Math.round(layout.ScoreLineSpacing);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TenorClef,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.ClefPainter.PaintTreble = function(context,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.ClefPainter::PaintTreble");
	var $spos = $s.length;
	y -= Math.round(layout.ScoreLineSpacing);
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.TrebleClef,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.ClefPainter.prototype.__class__ = net.alphatab.tablature.drawing.ClefPainter;
net.alphatab.tablature.drawing.SilencePainter = function() { }
net.alphatab.tablature.drawing.SilencePainter.__name__ = ["net","alphatab","tablature","drawing","SilencePainter"];
net.alphatab.tablature.drawing.SilencePainter.PaintEighth = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.SilencePainter::PaintEighth");
	var $spos = $s.length;
	var scale = layout.ScoreLineSpacing;
	y += scale;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceEighth,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.SilencePainter.PaintWhole = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.SilencePainter::PaintWhole");
	var $spos = $s.length;
	var scale = layout.ScoreLineSpacing;
	y += scale;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.SilencePainter.PaintHalf = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.SilencePainter::PaintHalf");
	var $spos = $s.length;
	var scale = layout.ScoreLineSpacing;
	y += scale - (4 * layout.Scale);
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.SilencePainter.PaintQuarter = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.SilencePainter::PaintQuarter");
	var $spos = $s.length;
	var scale = layout.ScoreLineSpacing;
	y += scale * 0.5;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceQuarter,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.SilencePainter.PaintSixteenth = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.SilencePainter::PaintSixteenth");
	var $spos = $s.length;
	var scale = layout.ScoreLineSpacing;
	y += scale;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceSixteenth,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.SilencePainter.PaintSixtyFourth = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.SilencePainter::PaintSixtyFourth");
	var $spos = $s.length;
	var scale = layout.ScoreLineSpacing;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceSixtyFourth,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.SilencePainter.PaintThirtySecond = function(layer,x,y,layout) {
	$s.push("net.alphatab.tablature.drawing.SilencePainter::PaintThirtySecond");
	var $spos = $s.length;
	var scale = layout.ScoreLineSpacing;
	layer.AddMusicSymbol(net.alphatab.tablature.drawing.MusicFont.SilenceThirtySecond,x,y,layout.Scale);
	$s.pop();
}
net.alphatab.tablature.drawing.SilencePainter.prototype.__class__ = net.alphatab.tablature.drawing.SilencePainter;
net.alphatab.model.effects.GsGraceEffect = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.effects.GsGraceEffect::new");
	var $spos = $s.length;
	this.Fret = 0;
	this.Duration = 1;
	this.Dynamic = 95;
	this.Transition = net.alphatab.model.effects.GsGraceEffectTransition.None;
	this.IsOnBeat = false;
	this.IsDead = false;
	$s.pop();
}}
net.alphatab.model.effects.GsGraceEffect.__name__ = ["net","alphatab","model","effects","GsGraceEffect"];
net.alphatab.model.effects.GsGraceEffect.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.effects.GsGraceEffect::Clone");
	var $spos = $s.length;
	var effect = factory.NewGraceEffect();
	effect.Fret = this.Fret;
	effect.Duration = this.Duration;
	effect.Dynamic = this.Dynamic;
	effect.Transition = this.Transition;
	effect.IsOnBeat = this.IsOnBeat;
	effect.IsDead = this.IsDead;
	{
		$s.pop();
		return effect;
	}
	$s.pop();
}
net.alphatab.model.effects.GsGraceEffect.prototype.Duration = null;
net.alphatab.model.effects.GsGraceEffect.prototype.DurationTime = function() {
	$s.push("net.alphatab.model.effects.GsGraceEffect::DurationTime");
	var $spos = $s.length;
	{
		var $tmp = Math.floor((960 / 16.00) * this.Duration);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.effects.GsGraceEffect.prototype.Dynamic = null;
net.alphatab.model.effects.GsGraceEffect.prototype.Fret = null;
net.alphatab.model.effects.GsGraceEffect.prototype.IsDead = null;
net.alphatab.model.effects.GsGraceEffect.prototype.IsOnBeat = null;
net.alphatab.model.effects.GsGraceEffect.prototype.Transition = null;
net.alphatab.model.effects.GsGraceEffect.prototype.__class__ = net.alphatab.model.effects.GsGraceEffect;
net.alphatab.model.GsTriplet = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsTriplet::new");
	var $spos = $s.length;
	this.Enters = 1;
	this.Times = 1;
	$s.pop();
}}
net.alphatab.model.GsTriplet.__name__ = ["net","alphatab","model","GsTriplet"];
net.alphatab.model.GsTriplet.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.GsTriplet::Clone");
	var $spos = $s.length;
	var triplet = factory.NewTriplet();
	this.Copy(triplet);
	{
		$s.pop();
		return triplet;
	}
	$s.pop();
}
net.alphatab.model.GsTriplet.prototype.ConvertTime = function(time) {
	$s.push("net.alphatab.model.GsTriplet::ConvertTime");
	var $spos = $s.length;
	{
		var $tmp = Math.floor((time * this.Times) / this.Enters);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsTriplet.prototype.Copy = function(triplet) {
	$s.push("net.alphatab.model.GsTriplet::Copy");
	var $spos = $s.length;
	triplet.Enters = this.Enters;
	triplet.Times = this.Times;
	$s.pop();
}
net.alphatab.model.GsTriplet.prototype.Enters = null;
net.alphatab.model.GsTriplet.prototype.Equals = function(triplet) {
	$s.push("net.alphatab.model.GsTriplet::Equals");
	var $spos = $s.length;
	{
		var $tmp = this.Enters == triplet.Enters && this.Times == triplet.Times;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsTriplet.prototype.Times = null;
net.alphatab.model.GsTriplet.prototype.__class__ = net.alphatab.model.GsTriplet;
net.alphatab.midi.MidiRepeatController = function(song) { if( song === $_ ) return; {
	$s.push("net.alphatab.midi.MidiRepeatController::new");
	var $spos = $s.length;
	this._song = song;
	this._count = song.MeasureHeaders.length;
	this.Index = 0;
	this._lastIndex = -1;
	this.ShouldPlay = true;
	this._repeatOpen = true;
	this._repeatAlternative = 0;
	this._repeatStart = 960;
	this._repeatEnd = 0;
	this.RepeatMove = 0;
	this._repeatStartIndex = 0;
	this._repeatNumber = 0;
	$s.pop();
}}
net.alphatab.midi.MidiRepeatController.__name__ = ["net","alphatab","midi","MidiRepeatController"];
net.alphatab.midi.MidiRepeatController.prototype.Finished = function() {
	$s.push("net.alphatab.midi.MidiRepeatController::Finished");
	var $spos = $s.length;
	{
		var $tmp = (this.Index >= this._count);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiRepeatController.prototype.Index = null;
net.alphatab.midi.MidiRepeatController.prototype.Process = function() {
	$s.push("net.alphatab.midi.MidiRepeatController::Process");
	var $spos = $s.length;
	var header = this._song.MeasureHeaders[this.Index];
	this.ShouldPlay = true;
	if(header.IsRepeatOpen) {
		this._repeatStartIndex = this.Index;
		this._repeatStart = header.Start;
		this._repeatOpen = true;
		if(this.Index > this._lastIndex) {
			this._repeatNumber = 0;
			this._repeatAlternative = 0;
		}
	}
	else {
		if(this._repeatAlternative == 0) {
			this._repeatAlternative = header.RepeatAlternative;
		}
		if((this._repeatOpen && (this._repeatAlternative > 0)) && ((this._repeatAlternative & (1 << this._repeatNumber)) == 0)) {
			this.RepeatMove -= header.Length();
			if(header.RepeatClose > 0) {
				this._repeatAlternative = 0;
			}
			this.ShouldPlay = false;
			this.Index++;
			{
				$s.pop();
				return;
			}
		}
	}
	this._lastIndex = Math.round(Math.max(this._lastIndex,this.Index));
	if(this._repeatOpen && (header.RepeatClose > 0)) {
		if((this._repeatNumber < header.RepeatClose) || (this._repeatAlternative > 0)) {
			this._repeatEnd = header.Start + header.Length();
			this.RepeatMove += this._repeatEnd - this._repeatStart;
			this.Index = this._repeatStartIndex - 1;
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
	this.Index++;
	$s.pop();
}
net.alphatab.midi.MidiRepeatController.prototype.RepeatMove = null;
net.alphatab.midi.MidiRepeatController.prototype.ShouldPlay = null;
net.alphatab.midi.MidiRepeatController.prototype._count = null;
net.alphatab.midi.MidiRepeatController.prototype._lastIndex = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatAlternative = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatEnd = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatNumber = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatOpen = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatStart = null;
net.alphatab.midi.MidiRepeatController.prototype._repeatStartIndex = null;
net.alphatab.midi.MidiRepeatController.prototype._song = null;
net.alphatab.midi.MidiRepeatController.prototype.__class__ = net.alphatab.midi.MidiRepeatController;
net.alphatab.model.Rectangle = function(x,y,width,height) { if( x === $_ ) return; {
	$s.push("net.alphatab.model.Rectangle::new");
	var $spos = $s.length;
	this.X = x;
	this.Y = y;
	this.Width = width;
	this.Height = height;
	$s.pop();
}}
net.alphatab.model.Rectangle.__name__ = ["net","alphatab","model","Rectangle"];
net.alphatab.model.Rectangle.prototype.Height = null;
net.alphatab.model.Rectangle.prototype.Width = null;
net.alphatab.model.Rectangle.prototype.X = null;
net.alphatab.model.Rectangle.prototype.Y = null;
net.alphatab.model.Rectangle.prototype.__class__ = net.alphatab.model.Rectangle;
net.alphatab.platform.FileLoader = function() { }
net.alphatab.platform.FileLoader.__name__ = ["net","alphatab","platform","FileLoader"];
net.alphatab.platform.FileLoader.prototype.LoadBinary = null;
net.alphatab.platform.FileLoader.prototype.__class__ = net.alphatab.platform.FileLoader;
net.alphatab.midi.MidiController = function() { }
net.alphatab.midi.MidiController.__name__ = ["net","alphatab","midi","MidiController"];
net.alphatab.midi.MidiController.prototype.__class__ = net.alphatab.midi.MidiController;
if(!net.alphatab.platform.js) net.alphatab.platform.js = {}
net.alphatab.platform.js.JQuery = function() { }
net.alphatab.platform.js.JQuery.__name__ = ["net","alphatab","platform","js","JQuery"];
net.alphatab.platform.js.JQuery.Elements = function(e) {
	$s.push("net.alphatab.platform.js.JQuery::Elements");
	var $spos = $s.length;
	{
		var $tmp = (jQuery(e));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.JQuery.Ajax = function(options) {
	$s.push("net.alphatab.platform.js.JQuery::Ajax");
	var $spos = $s.length;
	{
		var $tmp = jQuery.ajax(options);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.JQuery.prototype.Height = function() {
	$s.push("net.alphatab.platform.js.JQuery::Height");
	var $spos = $s.length;
	{
		var $tmp = this.height();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.JQuery.prototype.SetHeight = function(value) {
	$s.push("net.alphatab.platform.js.JQuery::SetHeight");
	var $spos = $s.length;
	{
		var $tmp = this.height(value);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.JQuery.prototype.SetWidth = function(value) {
	$s.push("net.alphatab.platform.js.JQuery::SetWidth");
	var $spos = $s.length;
	{
		var $tmp = this.width(value);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.JQuery.prototype.Width = function() {
	$s.push("net.alphatab.platform.js.JQuery::Width");
	var $spos = $s.length;
	{
		var $tmp = this.width();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.JQuery.prototype.__class__ = net.alphatab.platform.js.JQuery;
net.alphatab.tablature.model.GsMeasureImpl = function(header) { if( header === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsMeasure.apply(this,[header]);
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
	$s.pop();
}}
net.alphatab.tablature.model.GsMeasureImpl.__name__ = ["net","alphatab","tablature","model","GsMeasureImpl"];
net.alphatab.tablature.model.GsMeasureImpl.__super__ = net.alphatab.model.GsMeasure;
for(var k in net.alphatab.model.GsMeasure.prototype ) net.alphatab.tablature.model.GsMeasureImpl.prototype[k] = net.alphatab.model.GsMeasure.prototype[k];
net.alphatab.tablature.model.GsMeasureImpl.MakeVoice = function(layout,voice,previousVoice,group) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::MakeVoice");
	var $spos = $s.length;
	voice.Width = layout.GetVoiceWidth(voice);
	voice.BeatGroup = (group);
	if(previousVoice != null) {
		voice.PreviousBeat = (previousVoice);
		previousVoice.NextBeat = (voice);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.GetStartPosition = function(measure,start,spacing) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::GetStartPosition");
	var $spos = $s.length;
	var newStart = start - measure.Start();
	var displayPosition = 0.0;
	if(newStart > 0) {
		var position = (newStart / 960);
		displayPosition = (position * spacing);
	}
	{
		$s.pop();
		return displayPosition;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.CalculateBeats = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::CalculateBeats");
	var $spos = $s.length;
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
								groups[v] = new net.alphatab.tablature.model.BeatGroup(v);
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
						net.alphatab.tablature.model.GsMeasureImpl.MakeVoice(layout,voice,previousVoices[v],groups[v]);
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
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.CalculateKeySignatureSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::CalculateKeySignatureSpacing");
	var $spos = $s.length;
	var spacing = 0;
	if(this.HeaderImpl().ShouldPaintKeySignature) {
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
	{
		$s.pop();
		return spacing;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.CalculateMeasureChanges = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::CalculateMeasureChanges");
	var $spos = $s.length;
	this.IsPaintClef = false;
	this._previousMeasure = ((layout.IsFirstMeasure(this)?null:layout.SongManager().GetPreviousMeasure(this)));
	if(this._previousMeasure == null || this.Clef != this._previousMeasure.Clef) {
		this.IsPaintClef = true;
		this.HeaderImpl().NotifyClefSpacing(Math.round(40 * layout.Scale));
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.CalculateWidth = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::CalculateWidth");
	var $spos = $s.length;
	this.Width = this._widthBeats;
	this.Width += this.GetFirstNoteSpacing(layout);
	this.Width += ((this.RepeatClose() > 0)?20:0);
	this.Width += this.HeaderImpl().GetLeftSpacing(layout);
	this.Width += this.HeaderImpl().GetRightSpacing(layout);
	this.HeaderImpl().NotifyWidth(this.Width);
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.CanJoin = function(manager,b1,b2) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::CanJoin");
	var $spos = $s.length;
	if(b1 == null || b2 == null || b1.IsRestVoice() || b2.IsRestVoice()) {
		{
			$s.pop();
			return false;
		}
	}
	var divisionLength = this.DivisionLength;
	var start = this.Start();
	var start1 = (manager.GetRealStart(this,b1.Beat.Start) - start);
	var start2 = (manager.GetRealStart(this,b2.Beat.Start) - start);
	if(b1.Duration.Value < 8 || b2.Duration.Value < 8) {
		{
			var $tmp = (start1 == start2);
			$s.pop();
			return $tmp;
		}
	}
	var p1 = Math.floor((divisionLength + start1) / divisionLength);
	var p2 = Math.floor((divisionLength + start2) / divisionLength);
	{
		var $tmp = (p1 == p2);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.CheckEffects = function(layout,note) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::CheckEffects");
	var $spos = $s.length;
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
	if(effect.BeatVibrato) {
		this._beatVibrato = true;
	}
	if(effect.LetRing) {
		this._letRing = true;
	}
	if(effect.IsBend()) {
		this._bend = true;
		this._bendOverFlow = Math.round(Math.max(this._bendOverFlow,Math.round(note.CalculateBendOverflow(layout))));
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.CheckValue = function(layout,note,direction) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::CheckValue");
	var $spos = $s.length;
	var y = note.ScorePosY;
	var upOffset = net.alphatab.tablature.model.BeatGroup.GetUpOffset(layout);
	var downOffset = net.alphatab.tablature.model.BeatGroup.GetDownOffset(layout);
	if(direction == net.alphatab.model.GsVoiceDirection.Up && y > this.MaxY) {
		this.MaxY = y;
	}
	else if(direction == net.alphatab.model.GsVoiceDirection.Down && (y + downOffset) > this.MaxY) {
		this.MaxY = Math.floor((y + downOffset) + 2);
	}
	if(direction == net.alphatab.model.GsVoiceDirection.Up && (y - upOffset) < this.MinY) {
		this.MinY = Math.floor((y - upOffset) - 2);
	}
	else if(direction == net.alphatab.model.GsVoiceDirection.Down && y < this.MinY) {
		this.MinY = y;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.ClearRegisteredAccidentals = function() {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::ClearRegisteredAccidentals");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.Create = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::Create");
	var $spos = $s.length;
	this.DivisionLength = net.alphatab.model.SongManager.GetDivisionLength(this.Header);
	this.ResetSpacing();
	this.ClearRegisteredAccidentals();
	this.CalculateBeats(layout);
	this.CalculateWidth(layout);
	this.IsFirstOfLine = false;
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.DivisionLength = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.GetBeatSpacing = function(beat) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::GetBeatSpacing");
	var $spos = $s.length;
	{
		var $tmp = ((beat.Start - this.Start()) * this.Spacing) / this.Length();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.GetClefSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::GetClefSpacing");
	var $spos = $s.length;
	{
		var $tmp = this.HeaderImpl().GetClefSpacing(layout,this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.GetFirstNoteSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::GetFirstNoteSpacing");
	var $spos = $s.length;
	{
		var $tmp = this.HeaderImpl().GetFirstNoteSpacing(layout,this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.GetKeySignatureSpacing = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::GetKeySignatureSpacing");
	var $spos = $s.length;
	{
		var $tmp = this.HeaderImpl().GetKeySignatureSpacing(layout,this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.GetMaxQuarterSpacing = function() {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::GetMaxQuarterSpacing");
	var $spos = $s.length;
	{
		var $tmp = this.QuarterSpacing;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.GetNoteAccidental = function(noteValue) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::GetNoteAccidental");
	var $spos = $s.length;
	if(noteValue >= 0 && noteValue < 128) {
		var key = this.KeySignature();
		var note = (noteValue % 12);
		var octave = Math.round(noteValue / 12);
		var accidentalValue = ((key <= 7?2:3));
		var accidentalNotes = ((key <= 7?net.alphatab.tablature.model.GsMeasureImpl.AccidentalSharpNotes:net.alphatab.tablature.model.GsMeasureImpl.AccidentalFlatNotes));
		var isAccidentalNote = net.alphatab.tablature.model.GsMeasureImpl.AccidentalNotes[note];
		var isAccidentalKey = net.alphatab.tablature.model.GsMeasureImpl.KeySignatures[key][accidentalNotes[note]] == accidentalValue;
		if(isAccidentalKey != isAccidentalNote && !this._registeredAccidentals[octave][accidentalNotes[note]]) {
			this._registeredAccidentals[octave][accidentalNotes[note]] = true;
			{
				var $tmp = ((isAccidentalNote?accidentalValue:1));
				$s.pop();
				return $tmp;
			}
		}
		if(isAccidentalKey == isAccidentalNote && this._registeredAccidentals[octave][accidentalNotes[note]]) {
			this._registeredAccidentals[octave][accidentalNotes[note]] = false;
			{
				var $tmp = ((isAccidentalNote?accidentalValue:1));
				$s.pop();
				return $tmp;
			}
		}
	}
	{
		$s.pop();
		return 0;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.GetTimeSignatureSymbol = function(number) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::GetTimeSignatureSymbol");
	var $spos = $s.length;
	switch(number) {
	case 1:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num1;
			$s.pop();
			return $tmp;
		}
	}break;
	case 2:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num2;
			$s.pop();
			return $tmp;
		}
	}break;
	case 3:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num3;
			$s.pop();
			return $tmp;
		}
	}break;
	case 4:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num4;
			$s.pop();
			return $tmp;
		}
	}break;
	case 5:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num5;
			$s.pop();
			return $tmp;
		}
	}break;
	case 6:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num6;
			$s.pop();
			return $tmp;
		}
	}break;
	case 7:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num7;
			$s.pop();
			return $tmp;
		}
	}break;
	case 8:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num8;
			$s.pop();
			return $tmp;
		}
	}break;
	case 9:{
		{
			var $tmp = net.alphatab.tablature.drawing.MusicFont.Num9;
			$s.pop();
			return $tmp;
		}
	}break;
	}
	{
		$s.pop();
		return null;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.HeaderImpl = function() {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::HeaderImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Header;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.Height = function() {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::Height");
	var $spos = $s.length;
	{
		var $tmp = this.Ts.GetSize();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.IsFirstOfLine = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.IsPaintClef = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.LyricBeatIndex = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.MakeBeat = function(layout,beat,previousBeat,chordEnabled) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::MakeBeat");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.MaxY = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.MinY = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.NotEmptyBeats = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.NotEmptyVoices = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintClef = function(layout,context,fromX,fromY) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintClef");
	var $spos = $s.length;
	if(this.IsPaintClef) {
		var x = fromX + Math.round(14 * layout.Scale);
		var y = fromY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		if(this.Clef == net.alphatab.model.GsMeasureClef.Treble) {
			net.alphatab.tablature.drawing.ClefPainter.PaintTreble(context,x,y,layout);
		}
		else if(this.Clef == net.alphatab.model.GsMeasureClef.Bass) {
			net.alphatab.tablature.drawing.ClefPainter.PaintBass(context,x,y,layout);
		}
		else if(this.Clef == net.alphatab.model.GsMeasureClef.Tenor) {
			net.alphatab.tablature.drawing.ClefPainter.PaintTenor(context,x,y,layout);
		}
		else if(this.Clef == net.alphatab.model.GsMeasureClef.Alto) {
			net.alphatab.tablature.drawing.ClefPainter.PaintAlto(context,x,y,layout);
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintComponents = function(layout,context,fromX,fromY) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintComponents");
	var $spos = $s.length;
	var _g = 0, _g1 = this.Beats;
	while(_g < _g1.length) {
		var beat = _g1[_g];
		++_g;
		var impl = beat;
		impl.Paint(layout,context,fromX + this.HeaderImpl().GetLeftSpacing(layout),fromY);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintDivisions = function(layout,context) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintDivisions");
	var $spos = $s.length;
	var x1 = this.PosX;
	var x2 = this.PosX + this.Width;
	var offsetY = 0;
	var y1 = this.PosY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
	var y2 = Math.floor(y1 + (layout.ScoreLineSpacing * 4));
	if(layout.IsFirstMeasure(this) || this.IsFirstOfLine) {
		offsetY = (this.PosY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.Tablature)) - y2;
	}
	this.PaintDivisions2(layout,context,x1,y1,x2,y2,offsetY,true);
	y1 = this.PosY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.Tablature);
	y2 = Math.floor(y1 + ((this.Track.Strings.length - 1) * layout.StringSpacing));
	offsetY = 0;
	this.PaintDivisions2(layout,context,x1,y1,x2,y2,offsetY,false);
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintDivisions2 = function(layout,context,x1,y1,x2,y2,offsetY,addInfo) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintDivisions2");
	var $spos = $s.length;
	var scale = layout.Scale;
	var lineWidthSmall = 1;
	var lineWidthBig = Math.floor(Math.max(lineWidthSmall,Math.round(3.0 * scale)));
	var fill = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents);
	var draw = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw);
	if(addInfo) {
		var number = net.alphatab.Utils.string(this.Number());
		context.Get(net.alphatab.tablature.drawing.DrawingLayers.Red).AddString(number,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,(this.PosX + Math.round(scale)),((y1 - net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight) - Math.round(scale)));
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
			fill.CircleTo(size);
			fill.MoveTo(Math.floor(x1 + xMove),Math.floor((y1 + ((y2 - y1) / 2)) + (yMove - (size / 2))));
			fill.CircleTo(size);
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
			fill.CircleTo(size);
			fill.MoveTo(Math.round((x2 - xMove) + this.Spacing),Math.round((y1 + ((y2 - y1) / 2)) + (yMove - (size / 2))));
			fill.CircleTo(size);
			if(addInfo) {
				var repetitions = ("x" + (this.RepeatClose() + 1));
				var numberSize = context.Graphics.measureText(repetitions);
				fill.AddString(repetitions,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,(((x2 - numberSize.width) + this.Spacing) - size),((y1 - net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight) - Math.round(scale)));
			}
		}
	}
	else {
		draw.StartFigure();
		draw.MoveTo(x2 + this.Spacing,y1);
		draw.LineTo(x2 + this.Spacing,y2);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintKeySignature = function(layout,context,fromX,fromY) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintKeySignature");
	var $spos = $s.length;
	if(this.HeaderImpl().ShouldPaintKeySignature) {
		var scale = layout.ScoreLineSpacing;
		var x = (fromX + this.GetClefSpacing(layout)) + 10;
		var y = fromY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		var currentKey = this.GetKeySignature();
		var previousKey = ((this._previousMeasure != null?this._previousMeasure.GetKeySignature():0));
		var offsetClef = 0;
		var clef = (this.Clef);
		switch(clef) {
		case net.alphatab.model.GsMeasureClef.Treble:{
			offsetClef = 0;
		}break;
		case net.alphatab.model.GsMeasureClef.Bass:{
			offsetClef = 2;
		}break;
		case net.alphatab.model.GsMeasureClef.Tenor:{
			offsetClef = -1;
		}break;
		case net.alphatab.model.GsMeasureClef.Alto:{
			offsetClef = 1;
		}break;
		}
		if(previousKey >= 1 && previousKey <= 7) {
			var naturalFrom = ((currentKey >= 1 && currentKey <= 7)?currentKey:0);
			{
				var _g = naturalFrom;
				while(_g < previousKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((net.alphatab.tablature.model.GsMeasureImpl.ScoreKeySharpPositions[i] + offsetClef) + 7) % 7)) - (scale / 2);
					net.alphatab.tablature.drawing.KeySignaturePainter.PaintNatural(context,x,y + offset,layout);
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
					var offset = ((scale / 2) * (((net.alphatab.tablature.model.GsMeasureImpl.ScoreKeyFlatPositions[i - 7] + offsetClef) + 7) % 7)) - (scale / 2);
					net.alphatab.tablature.drawing.KeySignaturePainter.PaintNatural(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		if(currentKey >= 1 && currentKey <= 7) {
			{
				var _g = 0;
				while(_g < currentKey) {
					var i = _g++;
					var offset = Math.floor(((scale / 2) * (((net.alphatab.tablature.model.GsMeasureImpl.ScoreKeySharpPositions[i] + offsetClef) + 7) % 7)) - (scale / 2));
					net.alphatab.tablature.drawing.KeySignaturePainter.PaintSharp(context,x,(y + offset),layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
		else if(currentKey >= 8 && currentKey <= 14) {
			{
				var _g = 7;
				while(_g < currentKey) {
					var i = _g++;
					var offset = ((scale / 2) * (((net.alphatab.tablature.model.GsMeasureImpl.ScoreKeyFlatPositions[i - 7] + offsetClef) + 7) % 7)) - (scale / 2);
					net.alphatab.tablature.drawing.KeySignaturePainter.PaintFlat(context,x,y + offset,layout);
					x += Math.floor(scale - (scale / 4));
				}
			}
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintMarker = function(context,layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintMarker");
	var $spos = $s.length;
	if(this.HasMarker()) {
		var x = ((this.PosX + this.HeaderImpl().GetLeftSpacing(layout)) + this.GetFirstNoteSpacing(layout));
		var y = (this.PosY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.Marker));
		context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1).AddString(this.GetMarker().Title,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,x,y);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintMeasure = function(layout,context) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintMeasure");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintRepeatEnding = function(layout,context) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintRepeatEnding");
	var $spos = $s.length;
	if(this.Header.RepeatAlternative > 0) {
		var scale = layout.Scale;
		var x1 = ((this.PosX + this.HeaderImpl().GetLeftSpacing(layout)) + this.GetFirstNoteSpacing(layout));
		var x2 = ((this.PosX + this.Width) + this.Spacing);
		var y1 = (this.PosY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.RepeatEnding));
		var y2 = (y1 + (layout.RepeatEndingSpacing * 0.75));
		var sText = "";
		{
			var _g = 0;
			while(_g < 8) {
				var i = _g++;
				if((this.Header.RepeatAlternative & (1 << i)) != 0) {
					sText += ((sText.length > 0)?", " + (i + 1):net.alphatab.Utils.string(i + 1));
				}
			}
		}
		var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw);
		layer.StartFigure();
		layer.MoveTo(x1,y2);
		layer.LineTo(x1,y1);
		layer.LineTo(x2,y1);
		context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).AddString(sText,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,Math.round(x1 + (5.0 * scale)),Math.round(y1 + (2.0 * scale)));
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintTempo = function(context,layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintTempo");
	var $spos = $s.length;
	if(this.HeaderImpl().ShouldPaintTempo) {
		var scale = 5.0 * layout.Scale;
		var x = (this.PosX + this.HeaderImpl().GetLeftSpacing(layout));
		var y = this.PosY;
		var lineSpacing = Math.floor(Math.max(layout.ScoreLineSpacing,layout.StringSpacing));
		y += (this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines) - lineSpacing);
		var imgX = x;
		var imgY = y - (Math.round(scale * 3.5) + 2);
		net.alphatab.tablature.drawing.TempoPainter.PaintTempo(context,imgX,imgY,scale);
		var value = (" = " + this.GetTempo().Value);
		var fontX = x + Math.floor(Math.round((1.33 * scale)) + 1);
		var fontY = Math.round((y - net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight) - (layout.Scale));
		context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).AddString(value,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,fontX,fontY);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintTexts = function(layout,context) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintTexts");
	var $spos = $s.length;
	var _g = 0, _g1 = this.Beats;
	while(_g < _g1.length) {
		var beat = _g1[_g];
		++_g;
		if(beat.Text != null) {
			var text = beat.Text;
			text.Paint(layout,context,(this.PosX + this.HeaderImpl().GetLeftSpacing(layout)),this.PosY);
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintTimeSignature = function(context,layout,fromX,fromY) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintTimeSignature");
	var $spos = $s.length;
	if(this.HeaderImpl().ShouldPaintTimeSignature) {
		var scale = layout.Scale;
		var leftSpacing = Math.round(5.0 * scale);
		var x = ((this.GetClefSpacing(layout) + this.GetKeySignatureSpacing(layout)) + this.HeaderImpl().GetLeftSpacing(layout)) + leftSpacing;
		var y = fromY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		var y1 = 0;
		var y2 = Math.round(2 * layout.ScoreLineSpacing);
		var numerator = this.GetTimeSignature().Numerator;
		var symbol = this.GetTimeSignatureSymbol(numerator);
		if(symbol != null) {
			context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).AddMusicSymbol(symbol,fromX + x,y + y1,scale);
		}
		var denominator = this.GetTimeSignature().Denominator.Value;
		symbol = this.GetTimeSignatureSymbol(denominator);
		if(symbol != null) {
			context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponents).AddMusicSymbol(symbol,fromX + x,y + y2,scale);
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PaintTripletFeel = function(context,layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::PaintTripletFeel");
	var $spos = $s.length;
	if(this.HeaderImpl().ShouldPaintTripletFeel) {
		var lineSpacing = Math.floor(Math.max(layout.ScoreLineSpacing,layout.StringSpacing));
		var scale = (5.0 * layout.Scale);
		var x = ((this.PosX + this.HeaderImpl().GetLeftSpacing(layout)) + this.HeaderImpl().GetTempoSpacing(layout));
		var y = (this.PosY + this.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines)) - lineSpacing;
		var y1 = y - (Math.round((3.5 * scale)));
		if(this.GetTripletFeel() == net.alphatab.model.GsTripletFeel.None && this._previousMeasure != null) {
			var previous = this._previousMeasure.GetTripletFeel();
			if(previous == net.alphatab.model.GsTripletFeel.Eighth) {
				net.alphatab.tablature.drawing.TripletFeelPainter.PaintTripletFeelNone8(context,x,y1,layout.Scale);
			}
			else if(previous == net.alphatab.model.GsTripletFeel.Sixteenth) {
				net.alphatab.tablature.drawing.TripletFeelPainter.PaintTripletFeelNone16(context,x,y1,layout.Scale);
			}
		}
		else if(this.GetTripletFeel() == net.alphatab.model.GsTripletFeel.Eighth) {
			net.alphatab.tablature.drawing.TripletFeelPainter.PaintTripletFeel8(context,x,y1,layout.Scale);
		}
		else if(this.GetTripletFeel() == net.alphatab.model.GsTripletFeel.Sixteenth) {
			net.alphatab.tablature.drawing.TripletFeelPainter.PaintTripletFeel16(context,x,y1,layout.Scale);
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.PosX = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.PosY = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.QuarterSpacing = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.RegisterSpacing = function(layout,spacing) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::RegisterSpacing");
	var $spos = $s.length;
	if(this.HasMarker()) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.Marker,layout.MarkerSpacing);
	}
	if(this._chord) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.Chord,layout.GetDefaultChordSpacing());
	}
	if(this._text) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.Text,layout.TextSpacing);
	}
	if(this.Header.RepeatAlternative > 0) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.RepeatEnding,layout.RepeatEndingSpacing);
	}
	if(this._tupleto) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.Tupleto,layout.TupletoSpacing);
	}
	if(this._accentuated) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect,layout.EffectSpacing);
	}
	if(this._harmonic) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect,layout.EffectSpacing);
	}
	if(this._tapping) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.TapingEffect,layout.EffectSpacing);
	}
	if(this._palmMute) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect,layout.EffectSpacing);
	}
	if(this._fadeIn) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.FadeIn,layout.EffectSpacing);
	}
	if(this._vibrato) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.VibratoEffect,layout.EffectSpacing);
	}
	if(this._beatVibrato) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect,layout.EffectSpacing);
	}
	if(this._letRing) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.LetRingEffect,layout.EffectSpacing);
	}
	if(this._bend) {
		spacing.Set(net.alphatab.tablature.TrackSpacingPositions.Bend,this._bendOverFlow);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.ResetSpacing = function() {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::ResetSpacing");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.Spacing = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.TrackImpl = function() {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::TrackImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Track;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.Ts = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.Update = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::Update");
	var $spos = $s.length;
	this.UpdateComponents(layout);
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.UpdateComponents = function(layout) {
	$s.push("net.alphatab.tablature.model.GsMeasureImpl::UpdateComponents");
	var $spos = $s.length;
	this.MaxY = 0;
	this.MinY = 0;
	var spacing = this.GetFirstNoteSpacing(layout);
	var tmpX = spacing;
	{
		var _g1 = 0, _g = this.BeatCount();
		while(_g1 < _g) {
			var i = _g1++;
			var beat = this.Beats[i];
			beat.PosX = (tmpX);
			tmpX += beat.MinimumWidth;
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
						if(!this._tupleto && voice.Duration.Triplet != new net.alphatab.model.GsTriplet()) {
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
	$s.pop();
}
net.alphatab.tablature.model.GsMeasureImpl.prototype.Width = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._accentuated = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._beatVibrato = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._bend = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._bendOverFlow = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._chord = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._fadeIn = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._harmonic = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._letRing = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._palmMute = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._previousMeasure = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._registeredAccidentals = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._tapping = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._text = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._tupleto = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._vibrato = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._voiceGroups = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype._widthBeats = null;
net.alphatab.tablature.model.GsMeasureImpl.prototype.__class__ = net.alphatab.tablature.model.GsMeasureImpl;
net.alphatab.tablature.model.GsSongFactoryImpl = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsSongFactory.apply(this,[]);
	$s.pop();
}}
net.alphatab.tablature.model.GsSongFactoryImpl.__name__ = ["net","alphatab","tablature","model","GsSongFactoryImpl"];
net.alphatab.tablature.model.GsSongFactoryImpl.__super__ = net.alphatab.model.GsSongFactory;
for(var k in net.alphatab.model.GsSongFactory.prototype ) net.alphatab.tablature.model.GsSongFactoryImpl.prototype[k] = net.alphatab.model.GsSongFactory.prototype[k];
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewBeat = function() {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewBeat");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsBeatImpl(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewChord = function(length) {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewChord");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsChordImpl(length);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewLyrics = function() {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewLyrics");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsLyricsImpl();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewMeasure = function(header) {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewMeasure");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsMeasureImpl(header);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewMeasureHeader = function() {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewMeasureHeader");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsMeasureHeaderImpl(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewNote = function() {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewNote");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsNoteImpl(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewText = function() {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewText");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsBeatTextImpl();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewTrack = function() {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewTrack");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsTrackImpl(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.NewVoice = function(index) {
	$s.push("net.alphatab.tablature.model.GsSongFactoryImpl::NewVoice");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.tablature.model.GsVoiceImpl(this,index);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsSongFactoryImpl.prototype.__class__ = net.alphatab.tablature.model.GsSongFactoryImpl;
StringBuf = function(p) { if( p === $_ ) return; {
	$s.push("StringBuf::new");
	var $spos = $s.length;
	this.b = new Array();
	$s.pop();
}}
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype.add = function(x) {
	$s.push("StringBuf::add");
	var $spos = $s.length;
	this.b[this.b.length] = x;
	$s.pop();
}
StringBuf.prototype.addChar = function(c) {
	$s.push("StringBuf::addChar");
	var $spos = $s.length;
	this.b[this.b.length] = String.fromCharCode(c);
	$s.pop();
}
StringBuf.prototype.addSub = function(s,pos,len) {
	$s.push("StringBuf::addSub");
	var $spos = $s.length;
	this.b[this.b.length] = s.substr(pos,len);
	$s.pop();
}
StringBuf.prototype.b = null;
StringBuf.prototype.toString = function() {
	$s.push("StringBuf::toString");
	var $spos = $s.length;
	{
		var $tmp = this.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
StringBuf.prototype.__class__ = StringBuf;
net.alphatab.midi.BeatData = function(start,duration) { if( start === $_ ) return; {
	$s.push("net.alphatab.midi.BeatData::new");
	var $spos = $s.length;
	this.Start = start;
	this.Duration = duration;
	$s.pop();
}}
net.alphatab.midi.BeatData.__name__ = ["net","alphatab","midi","BeatData"];
net.alphatab.midi.BeatData.prototype.Duration = null;
net.alphatab.midi.BeatData.prototype.Start = null;
net.alphatab.midi.BeatData.prototype.__class__ = net.alphatab.midi.BeatData;
haxe.Log = function() { }
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	$s.push("haxe.Log::trace");
	var $spos = $s.length;
	js.Boot.__trace(v,infos);
	$s.pop();
}
haxe.Log.clear = function() {
	$s.push("haxe.Log::clear");
	var $spos = $s.length;
	js.Boot.__clear_trace();
	$s.pop();
}
haxe.Log.prototype.__class__ = haxe.Log;
net.alphatab.model.GsBeatText = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsBeatText::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.model.GsBeatText.__name__ = ["net","alphatab","model","GsBeatText"];
net.alphatab.model.GsBeatText.prototype.Beat = null;
net.alphatab.model.GsBeatText.prototype.Value = null;
net.alphatab.model.GsBeatText.prototype.__class__ = net.alphatab.model.GsBeatText;
net.alphatab.model.GsVelocities = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsVelocities::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.model.GsVelocities.__name__ = ["net","alphatab","model","GsVelocities"];
net.alphatab.model.GsVelocities.prototype.__class__ = net.alphatab.model.GsVelocities;
net.alphatab.model.GsTempo = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsTempo::new");
	var $spos = $s.length;
	this.Value = 120;
	$s.pop();
}}
net.alphatab.model.GsTempo.__name__ = ["net","alphatab","model","GsTempo"];
net.alphatab.model.GsTempo.TempoToUsq = function(tempo) {
	$s.push("net.alphatab.model.GsTempo::TempoToUsq");
	var $spos = $s.length;
	{
		var $tmp = Math.floor(((60.00 / tempo) * 1000) * 1000.00);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsTempo.prototype.Copy = function(tempo) {
	$s.push("net.alphatab.model.GsTempo::Copy");
	var $spos = $s.length;
	this.Value = tempo.Value;
	$s.pop();
}
net.alphatab.model.GsTempo.prototype.InUsq = function() {
	$s.push("net.alphatab.model.GsTempo::InUsq");
	var $spos = $s.length;
	{
		var $tmp = net.alphatab.model.GsTempo.TempoToUsq(this.Value);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsTempo.prototype.Value = null;
net.alphatab.model.GsTempo.prototype.__class__ = net.alphatab.model.GsTempo;
haxe.Serializer = function(p) { if( p === $_ ) return; {
	$s.push("haxe.Serializer::new");
	var $spos = $s.length;
	this.buf = new StringBuf();
	this.cache = new Array();
	this.useCache = haxe.Serializer.USE_CACHE;
	this.useEnumIndex = haxe.Serializer.USE_ENUM_INDEX;
	this.shash = new Hash();
	this.scount = 0;
	$s.pop();
}}
haxe.Serializer.__name__ = ["haxe","Serializer"];
haxe.Serializer.run = function(v) {
	$s.push("haxe.Serializer::run");
	var $spos = $s.length;
	var s = new haxe.Serializer();
	s.serialize(v);
	{
		var $tmp = s.toString();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Serializer.prototype.buf = null;
haxe.Serializer.prototype.cache = null;
haxe.Serializer.prototype.scount = null;
haxe.Serializer.prototype.serialize = function(v) {
	$s.push("haxe.Serializer::serialize");
	var $spos = $s.length;
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
			{
				$s.pop();
				return;
			}
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
			{
				$s.pop();
				return;
			}
		}
		if(this.useCache && this.serializeRef(v)) {
			$s.pop();
			return;
		}
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
		if(this.useCache && this.serializeRef(v)) {
			$s.pop();
			return;
		}
		this.buf.add("o");
		this.serializeFields(v);
	}break;
	case 7:
	var e = $e[2];
	{
		if(this.useCache && this.serializeRef(v)) {
			$s.pop();
			return;
		}
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
	$s.pop();
}
haxe.Serializer.prototype.serializeException = function(e) {
	$s.push("haxe.Serializer::serializeException");
	var $spos = $s.length;
	this.buf.add("x");
	this.serialize(e);
	$s.pop();
}
haxe.Serializer.prototype.serializeFields = function(v) {
	$s.push("haxe.Serializer::serializeFields");
	var $spos = $s.length;
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
	$s.pop();
}
haxe.Serializer.prototype.serializeRef = function(v) {
	$s.push("haxe.Serializer::serializeRef");
	var $spos = $s.length;
	var vt = typeof(v);
	{
		var _g1 = 0, _g = this.cache.length;
		while(_g1 < _g) {
			var i = _g1++;
			var ci = this.cache[i];
			if(typeof(ci) == vt && ci == v) {
				this.buf.add("r");
				this.buf.add(i);
				{
					$s.pop();
					return true;
				}
			}
		}
	}
	this.cache.push(v);
	{
		$s.pop();
		return false;
	}
	$s.pop();
}
haxe.Serializer.prototype.serializeString = function(s) {
	$s.push("haxe.Serializer::serializeString");
	var $spos = $s.length;
	var x = this.shash.get(s);
	if(x != null) {
		this.buf.add("R");
		this.buf.add(x);
		{
			$s.pop();
			return;
		}
	}
	this.shash.set(s,this.scount++);
	this.buf.add("y");
	s = StringTools.urlEncode(s);
	this.buf.add(s.length);
	this.buf.add(":");
	this.buf.add(s);
	$s.pop();
}
haxe.Serializer.prototype.shash = null;
haxe.Serializer.prototype.toString = function() {
	$s.push("haxe.Serializer::toString");
	var $spos = $s.length;
	{
		var $tmp = this.buf.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Serializer.prototype.useCache = null;
haxe.Serializer.prototype.useEnumIndex = null;
haxe.Serializer.prototype.__class__ = haxe.Serializer;
net.alphatab.file.alphatab.AlphaTabSymbols = { __ename__ : ["net","alphatab","file","alphatab","AlphaTabSymbols"], __constructs__ : ["No","Eof","Number","Dot","Version","String","Tuning","LParensis","RParensis","Pipe","Backslash","MetaCommand"] }
net.alphatab.file.alphatab.AlphaTabSymbols.Backslash = ["Backslash",10];
net.alphatab.file.alphatab.AlphaTabSymbols.Backslash.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.Backslash.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.Dot = ["Dot",3];
net.alphatab.file.alphatab.AlphaTabSymbols.Dot.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.Dot.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.Eof = ["Eof",1];
net.alphatab.file.alphatab.AlphaTabSymbols.Eof.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.Eof.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.LParensis = ["LParensis",7];
net.alphatab.file.alphatab.AlphaTabSymbols.LParensis.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.LParensis.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.MetaCommand = ["MetaCommand",11];
net.alphatab.file.alphatab.AlphaTabSymbols.MetaCommand.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.MetaCommand.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.No = ["No",0];
net.alphatab.file.alphatab.AlphaTabSymbols.No.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.No.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.Number = ["Number",2];
net.alphatab.file.alphatab.AlphaTabSymbols.Number.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.Number.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.Pipe = ["Pipe",9];
net.alphatab.file.alphatab.AlphaTabSymbols.Pipe.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.Pipe.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.RParensis = ["RParensis",8];
net.alphatab.file.alphatab.AlphaTabSymbols.RParensis.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.RParensis.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.String = ["String",5];
net.alphatab.file.alphatab.AlphaTabSymbols.String.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.String.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.Tuning = ["Tuning",6];
net.alphatab.file.alphatab.AlphaTabSymbols.Tuning.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.Tuning.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
net.alphatab.file.alphatab.AlphaTabSymbols.Version = ["Version",4];
net.alphatab.file.alphatab.AlphaTabSymbols.Version.toString = $estr;
net.alphatab.file.alphatab.AlphaTabSymbols.Version.__enum__ = net.alphatab.file.alphatab.AlphaTabSymbols;
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
	$s.push("EReg::new");
	var $spos = $s.length;
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
	$s.pop();
}}
EReg.__name__ = ["EReg"];
EReg.prototype.customReplace = function(s,f) {
	$s.push("EReg::customReplace");
	var $spos = $s.length;
	var buf = new StringBuf();
	while(true) {
		if(!this.match(s)) break;
		buf.b[buf.b.length] = this.matchedLeft();
		buf.b[buf.b.length] = f(this);
		s = this.matchedRight();
	}
	buf.b[buf.b.length] = s;
	{
		var $tmp = buf.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
EReg.prototype.match = function(s) {
	$s.push("EReg::match");
	var $spos = $s.length;
	this.r.m = this.r.exec(s);
	this.r.s = s;
	this.r.l = RegExp.leftContext;
	this.r.r = RegExp.rightContext;
	{
		var $tmp = (this.r.m != null);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
EReg.prototype.matched = function(n) {
	$s.push("EReg::matched");
	var $spos = $s.length;
	{
		var $tmp = (this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
			var $r;
			throw "EReg::matched";
			return $r;
		}(this)));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
EReg.prototype.matchedLeft = function() {
	$s.push("EReg::matchedLeft");
	var $spos = $s.length;
	if(this.r.m == null) throw "No string matched";
	if(this.r.l == null) {
		var $tmp = this.r.s.substr(0,this.r.m.index);
		$s.pop();
		return $tmp;
	}
	{
		var $tmp = this.r.l;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
EReg.prototype.matchedPos = function() {
	$s.push("EReg::matchedPos");
	var $spos = $s.length;
	if(this.r.m == null) throw "No string matched";
	{
		var $tmp = { pos : this.r.m.index, len : this.r.m[0].length}
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
EReg.prototype.matchedRight = function() {
	$s.push("EReg::matchedRight");
	var $spos = $s.length;
	if(this.r.m == null) throw "No string matched";
	if(this.r.r == null) {
		var sz = this.r.m.index + this.r.m[0].length;
		{
			var $tmp = this.r.s.substr(sz,this.r.s.length - sz);
			$s.pop();
			return $tmp;
		}
	}
	{
		var $tmp = this.r.r;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
EReg.prototype.r = null;
EReg.prototype.replace = function(s,by) {
	$s.push("EReg::replace");
	var $spos = $s.length;
	{
		var $tmp = s.replace(this.r,by);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
EReg.prototype.split = function(s) {
	$s.push("EReg::split");
	var $spos = $s.length;
	var d = "#__delim__#";
	{
		var $tmp = s.replace(this.r,d).split(d);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
EReg.prototype.__class__ = EReg;
haxe.Template = function(str) { if( str === $_ ) return; {
	$s.push("haxe.Template::new");
	var $spos = $s.length;
	var tokens = this.parseTokens(str);
	this.expr = this.parseBlock(tokens);
	if(!tokens.isEmpty()) throw ("Unexpected '" + tokens.first().s) + "'";
	$s.pop();
}}
haxe.Template.__name__ = ["haxe","Template"];
haxe.Template.prototype.buf = null;
haxe.Template.prototype.context = null;
haxe.Template.prototype.execute = function(context,macros) {
	$s.push("haxe.Template::execute");
	var $spos = $s.length;
	this.macros = (macros == null?{ }:macros);
	this.context = context;
	this.stack = new List();
	this.buf = new StringBuf();
	this.run(this.expr);
	{
		var $tmp = this.buf.b.join("");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Template.prototype.expr = null;
haxe.Template.prototype.macros = null;
haxe.Template.prototype.makeConst = function(v) {
	$s.push("haxe.Template::makeConst");
	var $spos = $s.length;
	haxe.Template.expr_trim.match(v);
	v = haxe.Template.expr_trim.matched(1);
	if(v.charCodeAt(0) == 34) {
		var str = v.substr(1,v.length - 2);
		{
			var $tmp = function() {
				$s.push("haxe.Template::makeConst@228");
				var $spos = $s.length;
				{
					$s.pop();
					return str;
				}
				$s.pop();
			}
			$s.pop();
			return $tmp;
		}
	}
	if(haxe.Template.expr_int.match(v)) {
		var i = Std.parseInt(v);
		{
			var $tmp = function() {
				$s.push("haxe.Template::makeConst@232");
				var $spos = $s.length;
				{
					$s.pop();
					return i;
				}
				$s.pop();
			}
			$s.pop();
			return $tmp;
		}
	}
	if(haxe.Template.expr_float.match(v)) {
		var f = Std.parseFloat(v);
		{
			var $tmp = function() {
				$s.push("haxe.Template::makeConst@236");
				var $spos = $s.length;
				{
					$s.pop();
					return f;
				}
				$s.pop();
			}
			$s.pop();
			return $tmp;
		}
	}
	var me = this;
	{
		var $tmp = function() {
			$s.push("haxe.Template::makeConst@239");
			var $spos = $s.length;
			{
				var $tmp = me.resolve(v);
				$s.pop();
				return $tmp;
			}
			$s.pop();
		}
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Template.prototype.makeExpr = function(l) {
	$s.push("haxe.Template::makeExpr");
	var $spos = $s.length;
	{
		var $tmp = this.makePath(this.makeExpr2(l),l);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Template.prototype.makeExpr2 = function(l) {
	$s.push("haxe.Template::makeExpr2");
	var $spos = $s.length;
	var p = l.pop();
	if(p == null) throw "<eof>";
	if(p.s) {
		var $tmp = this.makeConst(p.p);
		$s.pop();
		return $tmp;
	}
	switch(p.p) {
	case "(":{
		var e1 = this.makeExpr(l);
		var p1 = l.pop();
		if(p1 == null || p1.s) throw p1.p;
		if(p1.p == ")") {
			$s.pop();
			return e1;
		}
		var e2 = this.makeExpr(l);
		var p2 = l.pop();
		if(p2 == null || p2.p != ")") throw p2.p;
		{
			var $tmp = (function($this) {
				var $r;
				switch(p1.p) {
				case "+":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@279");
						var $spos = $s.length;
						{
							var $tmp = e1() + e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "-":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@280");
						var $spos = $s.length;
						{
							var $tmp = e1() - e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "*":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@281");
						var $spos = $s.length;
						{
							var $tmp = e1() * e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "/":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@282");
						var $spos = $s.length;
						{
							var $tmp = e1() / e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case ">":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@283");
						var $spos = $s.length;
						{
							var $tmp = e1() > e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "<":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@284");
						var $spos = $s.length;
						{
							var $tmp = e1() < e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case ">=":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@285");
						var $spos = $s.length;
						{
							var $tmp = e1() >= e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "<=":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@286");
						var $spos = $s.length;
						{
							var $tmp = e1() <= e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "==":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@287");
						var $spos = $s.length;
						{
							var $tmp = e1() == e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "!=":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@288");
						var $spos = $s.length;
						{
							var $tmp = e1() != e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "&&":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@289");
						var $spos = $s.length;
						{
							var $tmp = e1() && e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
					}
				}break;
				case "||":{
					$r = function() {
						$s.push("haxe.Template::makeExpr2@290");
						var $spos = $s.length;
						{
							var $tmp = e1() || e2();
							$s.pop();
							return $tmp;
						}
						$s.pop();
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
			$s.pop();
			return $tmp;
		}
	}break;
	case "!":{
		var e = this.makeExpr(l);
		{
			var $tmp = function() {
				$s.push("haxe.Template::makeExpr2@295");
				var $spos = $s.length;
				var v = e();
				{
					var $tmp = (v == null || v == false);
					$s.pop();
					return $tmp;
				}
				$s.pop();
			}
			$s.pop();
			return $tmp;
		}
	}break;
	case "-":{
		var e = this.makeExpr(l);
		{
			var $tmp = function() {
				$s.push("haxe.Template::makeExpr2@301");
				var $spos = $s.length;
				{
					var $tmp = -e();
					$s.pop();
					return $tmp;
				}
				$s.pop();
			}
			$s.pop();
			return $tmp;
		}
	}break;
	}
	throw p.p;
	$s.pop();
}
haxe.Template.prototype.makePath = function(e,l) {
	$s.push("haxe.Template::makePath");
	var $spos = $s.length;
	var p = l.first();
	if(p == null || p.p != ".") {
		$s.pop();
		return e;
	}
	l.pop();
	var field = l.pop();
	if(field == null || !field.s) throw field.p;
	var f = field.p;
	haxe.Template.expr_trim.match(f);
	f = haxe.Template.expr_trim.matched(1);
	{
		var $tmp = this.makePath(function() {
			$s.push("haxe.Template::makePath@253");
			var $spos = $s.length;
			{
				var $tmp = Reflect.field(e(),f);
				$s.pop();
				return $tmp;
			}
			$s.pop();
		},l);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Template.prototype.parse = function(tokens) {
	$s.push("haxe.Template::parse");
	var $spos = $s.length;
	var t = tokens.pop();
	var p = t.p;
	if(t.s) {
		var $tmp = haxe._Template.TemplateExpr.OpStr(p);
		$s.pop();
		return $tmp;
	}
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
		{
			var $tmp = haxe._Template.TemplateExpr.OpMacro(p,pe);
			$s.pop();
			return $tmp;
		}
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
		{
			var $tmp = haxe._Template.TemplateExpr.OpIf(e,eif,eelse);
			$s.pop();
			return $tmp;
		}
	}
	if(p.substr(0,8) == "foreach ") {
		p = p.substr(8,p.length - 8);
		var e = this.parseExpr(p);
		var efor = this.parseBlock(tokens);
		var t1 = tokens.pop();
		if(t1 == null || t1.p != "end") throw "Unclosed 'foreach'";
		{
			var $tmp = haxe._Template.TemplateExpr.OpForeach(e,efor);
			$s.pop();
			return $tmp;
		}
	}
	if(haxe.Template.expr_splitter.match(p)) {
		var $tmp = haxe._Template.TemplateExpr.OpExpr(this.parseExpr(p));
		$s.pop();
		return $tmp;
	}
	{
		var $tmp = haxe._Template.TemplateExpr.OpVar(p);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Template.prototype.parseBlock = function(tokens) {
	$s.push("haxe.Template::parseBlock");
	var $spos = $s.length;
	var l = new List();
	while(true) {
		var t = tokens.first();
		if(t == null) break;
		if(!t.s && (t.p == "end" || t.p == "else" || t.p.substr(0,7) == "elseif ")) break;
		l.add(this.parse(tokens));
	}
	if(l.length == 1) {
		var $tmp = l.first();
		$s.pop();
		return $tmp;
	}
	{
		var $tmp = haxe._Template.TemplateExpr.OpBlock(l);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Template.prototype.parseExpr = function(data) {
	$s.push("haxe.Template::parseExpr");
	var $spos = $s.length;
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
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				throw (("Unexpected '" + s) + "' in ") + expr;
			}
		} else throw($e21);
	}
	{
		var $tmp = function() {
			$s.push("haxe.Template::parseExpr@214");
			var $spos = $s.length;
			try {
				{
					var $tmp = e();
					$s.pop();
					return $tmp;
				}
			}
			catch( $e22 ) {
				{
					var exc = $e22;
					{
						$e = [];
						while($s.length >= $spos) $e.unshift($s.pop());
						$s.push($e[0]);
						throw (("Error : " + Std.string(exc)) + " in ") + expr;
					}
				}
			}
			$s.pop();
		}
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Template.prototype.parseTokens = function(data) {
	$s.push("haxe.Template::parseTokens");
	var $spos = $s.length;
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
	{
		$s.pop();
		return tokens;
	}
	$s.pop();
}
haxe.Template.prototype.resolve = function(v) {
	$s.push("haxe.Template::resolve");
	var $spos = $s.length;
	if(Reflect.hasField(this.context,v)) {
		var $tmp = Reflect.field(this.context,v);
		$s.pop();
		return $tmp;
	}
	{ var $it23 = this.stack.iterator();
	while( $it23.hasNext() ) { var ctx = $it23.next();
	if(Reflect.hasField(ctx,v)) {
		var $tmp = Reflect.field(ctx,v);
		$s.pop();
		return $tmp;
	}
	}}
	if(v == "__current__") {
		var $tmp = this.context;
		$s.pop();
		return $tmp;
	}
	{
		var $tmp = Reflect.field(haxe.Template.globals,v);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
haxe.Template.prototype.run = function(e) {
	$s.push("haxe.Template::run");
	var $spos = $s.length;
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
					$e = [];
					while($s.length >= $spos) $e.unshift($s.pop());
					$s.push($e[0]);
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
					$e = [];
					while($s.length >= $spos) $e.unshift($s.pop());
					$s.push($e[0]);
					var plstr = (function($this) {
						var $r;
						try {
							$r = pl.join(",");
						}
						catch( $e29 ) {
							{
								var e2 = $e29;
								$r = (function($this) {
									var $r;
									$e = [];
									while($s.length >= $spos) $e.unshift($s.pop());
									$s.push($e[0]);
									$r = "???";
									return $r;
								}($this));
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
	$s.pop();
}
haxe.Template.prototype.stack = null;
haxe.Template.prototype.__class__ = haxe.Template;
net.alphatab.platform.js.JsFileLoader = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.platform.js.JsFileLoader::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.platform.js.JsFileLoader.__name__ = ["net","alphatab","platform","js","JsFileLoader"];
net.alphatab.platform.js.JsFileLoader.prototype.LoadBinary = function(method,file,success,error) {
	$s.push("net.alphatab.platform.js.JsFileLoader::LoadBinary");
	var $spos = $s.length;
	var options = { }
	options.type = method;
	options.url = file;
	options.success = function(data) {
		$s.push("net.alphatab.platform.js.JsFileLoader::LoadBinary@26");
		var $spos = $s.length;
		var reader = new net.alphatab.platform.BinaryReader();
		reader.initialize(data);
		success(reader);
		$s.pop();
	}
	options.error = function(x,e) {
		$s.push("net.alphatab.platform.js.JsFileLoader::LoadBinary@32");
		var $spos = $s.length;
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
		$s.pop();
	}
	options.beforeSend = function(xhr) {
		$s.push("net.alphatab.platform.js.JsFileLoader::LoadBinary@49");
		var $spos = $s.length;
		if(xhr.overrideMimeType) {
			xhr.overrideMimeType("text/plain; charset=x-user-defined");
		}
		else null;
		$s.pop();
	}
	jQuery.ajax(options);
	$s.pop();
}
net.alphatab.platform.js.JsFileLoader.prototype.__class__ = net.alphatab.platform.js.JsFileLoader;
net.alphatab.platform.js.JsFileLoader.__interfaces__ = [net.alphatab.platform.FileLoader];
net.alphatab.model.PointF = function(x,y) { if( x === $_ ) return; {
	$s.push("net.alphatab.model.PointF::new");
	var $spos = $s.length;
	this.X = x;
	this.Y = y;
	$s.pop();
}}
net.alphatab.model.PointF.__name__ = ["net","alphatab","model","PointF"];
net.alphatab.model.PointF.prototype.X = null;
net.alphatab.model.PointF.prototype.Y = null;
net.alphatab.model.PointF.prototype.__class__ = net.alphatab.model.PointF;
net.alphatab.model.GsVoiceDirection = { __ename__ : ["net","alphatab","model","GsVoiceDirection"], __constructs__ : ["None","Up","Down"] }
net.alphatab.model.GsVoiceDirection.Down = ["Down",2];
net.alphatab.model.GsVoiceDirection.Down.toString = $estr;
net.alphatab.model.GsVoiceDirection.Down.__enum__ = net.alphatab.model.GsVoiceDirection;
net.alphatab.model.GsVoiceDirection.None = ["None",0];
net.alphatab.model.GsVoiceDirection.None.toString = $estr;
net.alphatab.model.GsVoiceDirection.None.__enum__ = net.alphatab.model.GsVoiceDirection;
net.alphatab.model.GsVoiceDirection.Up = ["Up",1];
net.alphatab.model.GsVoiceDirection.Up.toString = $estr;
net.alphatab.model.GsVoiceDirection.Up.__enum__ = net.alphatab.model.GsVoiceDirection;
net.alphatab.tablature.model.GsTrackImpl = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsTrackImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsTrack.apply(this,[factory]);
	$s.pop();
}}
net.alphatab.tablature.model.GsTrackImpl.__name__ = ["net","alphatab","tablature","model","GsTrackImpl"];
net.alphatab.tablature.model.GsTrackImpl.__super__ = net.alphatab.model.GsTrack;
for(var k in net.alphatab.model.GsTrack.prototype ) net.alphatab.tablature.model.GsTrackImpl.prototype[k] = net.alphatab.model.GsTrack.prototype[k];
net.alphatab.tablature.model.GsTrackImpl.prototype.PreviousBeat = null;
net.alphatab.tablature.model.GsTrackImpl.prototype.ScoreHeight = null;
net.alphatab.tablature.model.GsTrackImpl.prototype.TabHeight = null;
net.alphatab.tablature.model.GsTrackImpl.prototype.Update = function(layout) {
	$s.push("net.alphatab.tablature.model.GsTrackImpl::Update");
	var $spos = $s.length;
	this.TabHeight = Math.round((this.StringCount() - 1) * layout.StringSpacing);
	this.ScoreHeight = Math.round(layout.ScoreLineSpacing * 4);
	$s.pop();
}
net.alphatab.tablature.model.GsTrackImpl.prototype.__class__ = net.alphatab.tablature.model.GsTrackImpl;
net.alphatab.tablature.CaretPosition = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.CaretPosition::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.tablature.CaretPosition.__name__ = ["net","alphatab","tablature","CaretPosition"];
net.alphatab.tablature.CaretPosition.prototype.BottomY = null;
net.alphatab.tablature.CaretPosition.prototype.TopY = null;
net.alphatab.tablature.CaretPosition.prototype.X = null;
net.alphatab.tablature.CaretPosition.prototype.__class__ = net.alphatab.tablature.CaretPosition;
net.alphatab.tablature.drawing.MusicFont = function() { }
net.alphatab.tablature.drawing.MusicFont.__name__ = ["net","alphatab","tablature","drawing","MusicFont"];
net.alphatab.tablature.drawing.MusicFont.prototype.__class__ = net.alphatab.tablature.drawing.MusicFont;
net.alphatab.platform.PlatformFactory = function() { }
net.alphatab.platform.PlatformFactory.__name__ = ["net","alphatab","platform","PlatformFactory"];
net.alphatab.platform.PlatformFactory.GetCanvas = function(object) {
	$s.push("net.alphatab.platform.PlatformFactory::GetCanvas");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.platform.js.Html5Canvas(object);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.PlatformFactory.GetLoader = function() {
	$s.push("net.alphatab.platform.PlatformFactory::GetLoader");
	var $spos = $s.length;
	{
		var $tmp = new net.alphatab.platform.js.JsFileLoader();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.PlatformFactory.prototype.__class__ = net.alphatab.platform.PlatformFactory;
haxe.io.StringInput = function(s) { if( s === $_ ) return; {
	$s.push("haxe.io.StringInput::new");
	var $spos = $s.length;
	haxe.io.BytesInput.apply(this,[haxe.io.Bytes.ofString(s)]);
	$s.pop();
}}
haxe.io.StringInput.__name__ = ["haxe","io","StringInput"];
haxe.io.StringInput.__super__ = haxe.io.BytesInput;
for(var k in haxe.io.BytesInput.prototype ) haxe.io.StringInput.prototype[k] = haxe.io.BytesInput.prototype[k];
haxe.io.StringInput.prototype.__class__ = haxe.io.StringInput;
net.alphatab.model.GsBeat = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.model.GsBeat::new");
	var $spos = $s.length;
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
	$s.pop();
}}
net.alphatab.model.GsBeat.__name__ = ["net","alphatab","model","GsBeat"];
net.alphatab.model.GsBeat.prototype.Chord = null;
net.alphatab.model.GsBeat.prototype.GetNotes = function() {
	$s.push("net.alphatab.model.GsBeat::GetNotes");
	var $spos = $s.length;
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
	{
		$s.pop();
		return notes;
	}
	$s.pop();
}
net.alphatab.model.GsBeat.prototype.HasPickStroke = null;
net.alphatab.model.GsBeat.prototype.HasRasgueado = null;
net.alphatab.model.GsBeat.prototype.IsRestBeat = function() {
	$s.push("net.alphatab.model.GsBeat::IsRestBeat");
	var $spos = $s.length;
	{
		var _g1 = 0, _g = this.Voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var voice = this.Voices[i];
			if(!voice.IsEmpty && !voice.IsRestVoice()) {
				$s.pop();
				return false;
			}
		}
	}
	{
		$s.pop();
		return true;
	}
	$s.pop();
}
net.alphatab.model.GsBeat.prototype.Measure = null;
net.alphatab.model.GsBeat.prototype.MixTableChange = null;
net.alphatab.model.GsBeat.prototype.PickStroke = null;
net.alphatab.model.GsBeat.prototype.SetChord = function(chord) {
	$s.push("net.alphatab.model.GsBeat::SetChord");
	var $spos = $s.length;
	chord.Beat = this;
	this.Chord = chord;
	$s.pop();
}
net.alphatab.model.GsBeat.prototype.SetText = function(text) {
	$s.push("net.alphatab.model.GsBeat::SetText");
	var $spos = $s.length;
	text.Beat = this;
	this.Text = text;
	$s.pop();
}
net.alphatab.model.GsBeat.prototype.Start = null;
net.alphatab.model.GsBeat.prototype.Stroke = null;
net.alphatab.model.GsBeat.prototype.TableChange = null;
net.alphatab.model.GsBeat.prototype.Text = null;
net.alphatab.model.GsBeat.prototype.Voices = null;
net.alphatab.model.GsBeat.prototype.__class__ = net.alphatab.model.GsBeat;
net.alphatab.tablature.model.GsBeatImpl = function(factory) { if( factory === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsBeat.apply(this,[factory]);
	$s.pop();
}}
net.alphatab.tablature.model.GsBeatImpl.__name__ = ["net","alphatab","tablature","model","GsBeatImpl"];
net.alphatab.tablature.model.GsBeatImpl.__super__ = net.alphatab.model.GsBeat;
for(var k in net.alphatab.model.GsBeat.prototype ) net.alphatab.tablature.model.GsBeatImpl.prototype[k] = net.alphatab.model.GsBeat.prototype[k];
net.alphatab.tablature.model.GsBeatImpl.prototype.BeatGroup = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.CaretPosition = function(layout) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::CaretPosition");
	var $spos = $s.length;
	{
		var $tmp = Math.round(this.GetRealPosX(layout) + 8 * layout.Scale);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.Check = function(note) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::Check");
	var $spos = $s.length;
	var value = note.RealValue();
	if(this.MaxNote == null || value > this.MaxNote.RealValue()) this.MaxNote = note;
	if(this.MinNote == null || value < this.MinNote.RealValue()) this.MinNote = note;
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.GetPaintPosition = function(position) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::GetPaintPosition");
	var $spos = $s.length;
	{
		var $tmp = this.MeasureImpl().Ts.Get(position);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.GetRealPosX = function(layout) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::GetRealPosX");
	var $spos = $s.length;
	{
		var $tmp = (((this.MeasureImpl().PosX + this.MeasureImpl().HeaderImpl().GetLeftSpacing(layout)) + this.PosX) + this.Spacing()) + (4 * layout.Scale);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.GetVoiceImpl = function(index) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::GetVoiceImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Voices[index];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.Height = function() {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::Height");
	var $spos = $s.length;
	{
		var $tmp = this.MeasureImpl().Ts.GetSize();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.Join1 = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.Join2 = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.JoinedGreaterThanQuarter = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.JoinedType = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.LastPaintX = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.MaxNote = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.MeasureImpl = function() {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::MeasureImpl");
	var $spos = $s.length;
	{
		var $tmp = this.Measure;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.MinNote = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.MinimumWidth = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.NextBeat = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.Paint = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::Paint");
	var $spos = $s.length;
	x += this.PosX + this.Spacing();
	this.LastPaintX = x;
	this.PaintExtraLines(context,layout,x,y);
	if(this.Stroke.Direction != net.alphatab.model.GsBeatStrokeDirection.None) {
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
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.PaintExtraLines = function(context,layout,x,y) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::PaintExtraLines");
	var $spos = $s.length;
	if(!this.IsRestBeat()) {
		var iScoreY = y + this.MeasureImpl().Ts.Get(net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines);
		this.PaintExtraLines2(context,layout,this.MinNote,x,iScoreY);
		this.PaintExtraLines2(context,layout,this.MaxNote,x,iScoreY);
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.PaintExtraLines2 = function(context,layout,note,x,y) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::PaintExtraLines2");
	var $spos = $s.length;
	var realY = y + note.ScorePosY;
	var x1 = x + 3 * layout.Scale;
	var x2 = x + 15 * layout.Scale;
	var scoreLineSpacing = layout.ScoreLineSpacing;
	if(realY < y) {
		var i = y;
		while(i > realY) {
			context.Get(net.alphatab.tablature.drawing.DrawingLayers.Lines).StartFigure();
			context.Get(net.alphatab.tablature.drawing.DrawingLayers.Lines).AddLine(x1,i,x2,i);
			i -= scoreLineSpacing;
		}
	}
	else if(realY > (y + (scoreLineSpacing * 4))) {
		var i = (y + (scoreLineSpacing * 5));
		while(i < (realY + scoreLineSpacing)) {
			context.Get(net.alphatab.tablature.drawing.DrawingLayers.Lines).StartFigure();
			context.Get(net.alphatab.tablature.drawing.DrawingLayers.Lines).AddLine(x1,i,x2,i);
			i += scoreLineSpacing;
		}
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.PaintStroke = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::PaintStroke");
	var $spos = $s.length;
	if(this.Stroke.Direction == net.alphatab.model.GsBeatStrokeDirection.None) {
		$s.pop();
		return;
	}
	var scale = layout.Scale;
	var realX = x;
	var realY = y + this.GetPaintPosition(net.alphatab.tablature.TrackSpacingPositions.Tablature);
	var y1 = realY;
	var y2 = realY + this.MeasureImpl().TrackImpl().TabHeight;
	var layer = context.Get(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw);
	layer.StartFigure();
	if(this.Stroke.Direction == net.alphatab.model.GsBeatStrokeDirection.Up) {
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
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.PosX = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.PreviousBeat = null;
net.alphatab.tablature.model.GsBeatImpl.prototype.Reset = function() {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::Reset");
	var $spos = $s.length;
	this.MaxNote = null;
	this.MinNote = null;
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.Spacing = function() {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::Spacing");
	var $spos = $s.length;
	{
		var $tmp = this.MeasureImpl().GetBeatSpacing(this);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.Width = function() {
	$s.push("net.alphatab.tablature.model.GsBeatImpl::Width");
	var $spos = $s.length;
	var w = 0;
	{
		var _g1 = 0, _g = this.Voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var cw = this.GetVoiceImpl(i).Width;
			if(cw > w) w = cw;
		}
	}
	{
		$s.pop();
		return w;
	}
	$s.pop();
}
net.alphatab.tablature.model.GsBeatImpl.prototype.__class__ = net.alphatab.tablature.model.GsBeatImpl;
net.alphatab.tablature.drawing.DrawingContext = function(scale) { if( scale === $_ ) return; {
	$s.push("net.alphatab.tablature.drawing.DrawingContext::new");
	var $spos = $s.length;
	this.Layers = new Array();
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.Background)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(205,205,205),true,0);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.LayoutBackground)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(34,34,17),true,0);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.Lines)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(165,165,165),false,1);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.MainComponents)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(34,34,17),true,0);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.MainComponentsDraw)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(34,34,17),false,scale);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.Voice2)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(206,206,206),true,1);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects2)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(183,183,183),true,0);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw2)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(183,183,183),false,scale);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw2)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(206,206,206),false,scale);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.Voice1)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(34,34,17),true,1);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffects1)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(34,34,17),true,0);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceEffectsDraw1)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(34,34,17),false,scale);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.VoiceDraw1)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(34,34,17),false,scale);
	this.Layers[net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(net.alphatab.tablature.drawing.DrawingLayers.Red)] = new net.alphatab.tablature.drawing.DrawingLayer(new net.alphatab.model.GsColor(255,0,0),true,0);
	$s.pop();
}}
net.alphatab.tablature.drawing.DrawingContext.__name__ = ["net","alphatab","tablature","drawing","DrawingContext"];
net.alphatab.tablature.drawing.DrawingContext.prototype.Clear = function() {
	$s.push("net.alphatab.tablature.drawing.DrawingContext::Clear");
	var $spos = $s.length;
	var _g1 = 0, _g = this.Layers.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.Layers[i].Clear();
	}
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingContext.prototype.Draw = function() {
	$s.push("net.alphatab.tablature.drawing.DrawingContext::Draw");
	var $spos = $s.length;
	var _g1 = 0, _g = this.Layers.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.Layers[i].Draw(this.Graphics);
	}
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingContext.prototype.Get = function(layer) {
	$s.push("net.alphatab.tablature.drawing.DrawingContext::Get");
	var $spos = $s.length;
	var index = net.alphatab.tablature.drawing.DrawingLayersConverter.ToInt(layer);
	{
		var $tmp = this.Layers[index];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingContext.prototype.Graphics = null;
net.alphatab.tablature.drawing.DrawingContext.prototype.Layers = null;
net.alphatab.tablature.drawing.DrawingContext.prototype.__class__ = net.alphatab.tablature.drawing.DrawingContext;
net.alphatab.tablature.model.GsBeatTextImpl = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.model.GsBeatTextImpl::new");
	var $spos = $s.length;
	net.alphatab.model.GsBeatText.apply(this,[]);
	$s.pop();
}}
net.alphatab.tablature.model.GsBeatTextImpl.__name__ = ["net","alphatab","tablature","model","GsBeatTextImpl"];
net.alphatab.tablature.model.GsBeatTextImpl.__super__ = net.alphatab.model.GsBeatText;
for(var k in net.alphatab.model.GsBeatText.prototype ) net.alphatab.tablature.model.GsBeatTextImpl.prototype[k] = net.alphatab.model.GsBeatText.prototype[k];
net.alphatab.tablature.model.GsBeatTextImpl.prototype.Paint = function(layout,context,x,y) {
	$s.push("net.alphatab.tablature.model.GsBeatTextImpl::Paint");
	var $spos = $s.length;
	var beat = this.Beat;
	var measure = beat.MeasureImpl();
	var realX = (x + beat.Spacing()) + beat.PosX;
	var realY = y + measure.Ts.Get(net.alphatab.tablature.TrackSpacingPositions.Text);
	context.Get(net.alphatab.tablature.drawing.DrawingLayers.Voice1).AddString(this.Value,net.alphatab.tablature.drawing.DrawingResources.DefaultFont,realX,realY);
	$s.pop();
}
net.alphatab.tablature.model.GsBeatTextImpl.prototype.__class__ = net.alphatab.tablature.model.GsBeatTextImpl;
net.alphatab.tablature.drawing.SvgPainter = function(layer,svg,x,y,xScale,yScale) { if( layer === $_ ) return; {
	$s.push("net.alphatab.tablature.drawing.SvgPainter::new");
	var $spos = $s.length;
	this.Layer = layer;
	this.Svg = svg;
	this.X = x;
	this.Y = y;
	this.XScale = xScale * 0.98;
	this.YScale = yScale * 0.98;
	this.CurrentPosition = new net.alphatab.model.PointF(x,y);
	this.Token = svg.split(" ");
	this.CurrentIndex = 0;
	$s.pop();
}}
net.alphatab.tablature.drawing.SvgPainter.__name__ = ["net","alphatab","tablature","drawing","SvgPainter"];
net.alphatab.tablature.drawing.SvgPainter.prototype.CurrentIndex = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.CurrentPosition = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.GetNumber = function() {
	$s.push("net.alphatab.tablature.drawing.SvgPainter::GetNumber");
	var $spos = $s.length;
	{
		var $tmp = Std.parseFloat(this.Token[this.CurrentIndex++]);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.drawing.SvgPainter.prototype.GetString = function() {
	$s.push("net.alphatab.tablature.drawing.SvgPainter::GetString");
	var $spos = $s.length;
	{
		var $tmp = this.Token[this.CurrentIndex++];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.drawing.SvgPainter.prototype.IsNextCommand = function() {
	$s.push("net.alphatab.tablature.drawing.SvgPainter::IsNextCommand");
	var $spos = $s.length;
	var command = this.PeekString();
	{
		var $tmp = command == "m" || command == "M" || command == "c" || command == "C" || command == "q" || command == "Q" || command == "l" || command == "L" || command == "z" || command == "Z";
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.drawing.SvgPainter.prototype.Layer = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.Paint = function() {
	$s.push("net.alphatab.tablature.drawing.SvgPainter::Paint");
	var $spos = $s.length;
	this.Layer.StartFigure();
	while(this.CurrentIndex < this.Token.length) {
		this.ParseCommand();
	}
	$s.pop();
}
net.alphatab.tablature.drawing.SvgPainter.prototype.ParseCommand = function() {
	$s.push("net.alphatab.tablature.drawing.SvgPainter::ParseCommand");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.tablature.drawing.SvgPainter.prototype.PeekNumber = function() {
	$s.push("net.alphatab.tablature.drawing.SvgPainter::PeekNumber");
	var $spos = $s.length;
	{
		var $tmp = Std.parseFloat(this.Token[this.CurrentIndex]);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.drawing.SvgPainter.prototype.PeekString = function() {
	$s.push("net.alphatab.tablature.drawing.SvgPainter::PeekString");
	var $spos = $s.length;
	{
		var $tmp = this.Token[this.CurrentIndex];
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.drawing.SvgPainter.prototype.Svg = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.Token = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.X = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.XScale = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.Y = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.YScale = null;
net.alphatab.tablature.drawing.SvgPainter.prototype.__class__ = net.alphatab.tablature.drawing.SvgPainter;
net.alphatab.tablature.model.GsJoinedType = { __ename__ : ["net","alphatab","tablature","model","GsJoinedType"], __constructs__ : ["NoneLeft","NoneRight","Left","Right"] }
net.alphatab.tablature.model.GsJoinedType.Left = ["Left",2];
net.alphatab.tablature.model.GsJoinedType.Left.toString = $estr;
net.alphatab.tablature.model.GsJoinedType.Left.__enum__ = net.alphatab.tablature.model.GsJoinedType;
net.alphatab.tablature.model.GsJoinedType.NoneLeft = ["NoneLeft",0];
net.alphatab.tablature.model.GsJoinedType.NoneLeft.toString = $estr;
net.alphatab.tablature.model.GsJoinedType.NoneLeft.__enum__ = net.alphatab.tablature.model.GsJoinedType;
net.alphatab.tablature.model.GsJoinedType.NoneRight = ["NoneRight",1];
net.alphatab.tablature.model.GsJoinedType.NoneRight.toString = $estr;
net.alphatab.tablature.model.GsJoinedType.NoneRight.__enum__ = net.alphatab.tablature.model.GsJoinedType;
net.alphatab.tablature.model.GsJoinedType.Right = ["Right",3];
net.alphatab.tablature.model.GsJoinedType.Right.toString = $estr;
net.alphatab.tablature.model.GsJoinedType.Right.__enum__ = net.alphatab.tablature.model.GsJoinedType;
net.alphatab.model.GsLyricLine = function(startingMeasure,lyrics) { if( startingMeasure === $_ ) return; {
	$s.push("net.alphatab.model.GsLyricLine::new");
	var $spos = $s.length;
	if(lyrics == null) lyrics = "";
	if(startingMeasure == null) startingMeasure = 0;
	this.StartingMeasure = startingMeasure;
	this.Lyrics = lyrics;
	$s.pop();
}}
net.alphatab.model.GsLyricLine.__name__ = ["net","alphatab","model","GsLyricLine"];
net.alphatab.model.GsLyricLine.prototype.Lyrics = null;
net.alphatab.model.GsLyricLine.prototype.StartingMeasure = null;
net.alphatab.model.GsLyricLine.prototype.__class__ = net.alphatab.model.GsLyricLine;
Std = function() { }
Std.__name__ = ["Std"];
Std["is"] = function(v,t) {
	$s.push("Std::is");
	var $spos = $s.length;
	{
		var $tmp = js.Boot.__instanceof(v,t);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Std.string = function(s) {
	$s.push("Std::string");
	var $spos = $s.length;
	{
		var $tmp = js.Boot.__string_rec(s,"");
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Std["int"] = function(x) {
	$s.push("Std::int");
	var $spos = $s.length;
	if(x < 0) {
		var $tmp = Math.ceil(x);
		$s.pop();
		return $tmp;
	}
	{
		var $tmp = Math.floor(x);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Std.parseInt = function(x) {
	$s.push("Std::parseInt");
	var $spos = $s.length;
	var v = parseInt(x);
	if(Math.isNaN(v)) {
		$s.pop();
		return null;
	}
	{
		$s.pop();
		return v;
	}
	$s.pop();
}
Std.parseFloat = function(x) {
	$s.push("Std::parseFloat");
	var $spos = $s.length;
	{
		var $tmp = parseFloat(x);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Std.random = function(x) {
	$s.push("Std::random");
	var $spos = $s.length;
	{
		var $tmp = Math.floor(Math.random() * x);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
Std.prototype.__class__ = Std;
net.alphatab.file.guitarpro.Gp3Reader = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::new");
	var $spos = $s.length;
	net.alphatab.file.guitarpro.GpReaderBase.apply(this,[["FICHIER GUITAR PRO v3.00"]]);
	$s.pop();
}}
net.alphatab.file.guitarpro.Gp3Reader.__name__ = ["net","alphatab","file","guitarpro","Gp3Reader"];
net.alphatab.file.guitarpro.Gp3Reader.__super__ = net.alphatab.file.guitarpro.GpReaderBase;
for(var k in net.alphatab.file.guitarpro.GpReaderBase.prototype ) net.alphatab.file.guitarpro.Gp3Reader.prototype[k] = net.alphatab.file.guitarpro.GpReaderBase.prototype[k];
net.alphatab.file.guitarpro.Gp3Reader.prototype.GetBeat = function(measure,start) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::GetBeat");
	var $spos = $s.length;
	{
		var _g1 = 0, _g = measure.Beats.length;
		while(_g1 < _g) {
			var b = _g1++;
			var beat = measure.Beats[b];
			if(beat.Start == start) {
				$s.pop();
				return beat;
			}
		}
	}
	var newBeat = this.Factory.NewBeat();
	newBeat.Start = start;
	measure.AddBeat(newBeat);
	{
		$s.pop();
		return newBeat;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.GetTiedNoteValue = function(stringIndex,track) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::GetTiedNoteValue");
	var $spos = $s.length;
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
												{
													var $tmp = note.Value;
													$s.pop();
													return $tmp;
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
	}
	{
		$s.pop();
		return -1;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ParseRepeatAlternative = function(song,measure,value) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ParseRepeatAlternative");
	var $spos = $s.length;
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
	{
		$s.pop();
		return repeatAlternative;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadBeat = function(start,measure,track,voiceIndex) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadBeat");
	var $spos = $s.length;
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
		var mixTableChange = this.ReadMixTableChange(measure);
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
	{
		var $tmp = ((!voice.IsEmpty)?duration.Time():0);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadBeatEffects = function(beat,effect) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadBeatEffects");
	var $spos = $s.length;
	var flags1 = this.ReadUnsignedByte();
	effect.FadeIn = (((flags1 & 16) != 0));
	effect.BeatVibrato = (((flags1 & 2) != 0)) || effect.BeatVibrato;
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
			beat.Stroke.Direction = net.alphatab.model.GsBeatStrokeDirection.Up;
			beat.Stroke.Value = (this.ToStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.Stroke.Direction = net.alphatab.model.GsBeatStrokeDirection.Down;
			beat.Stroke.Value = (this.ToStrokeValue(strokeDown));
		}
	}
	if((flags1 & 4) != 0) {
		var harmonic = this.Factory.NewHarmonicEffect();
		harmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Natural);
		effect.Harmonic = (harmonic);
	}
	if((flags1 & 8) != 0) {
		var harmonic = this.Factory.NewHarmonicEffect();
		harmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Artificial);
		harmonic.Data = 0;
		effect.Harmonic = (harmonic);
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadBend = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadBend");
	var $spos = $s.length;
	var bendEffect = this.Factory.NewBendEffect();
	bendEffect.Type = net.alphatab.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	bendEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / 25);
			var vibrato = this.ReadBool();
			bendEffect.Points.push(new net.alphatab.model.effects.GsBendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) noteEffect.Bend = bendEffect;
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadChannel = function(midiChannel,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadChannel");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadChord = function(stringCount,beat) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadChord");
	var $spos = $s.length;
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
		beat.SetChord(chord);
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadColor = function() {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadColor");
	var $spos = $s.length;
	var r = (this.ReadUnsignedByte());
	var g = this.ReadUnsignedByte();
	var b = (this.ReadUnsignedByte());
	this.Skip(1);
	{
		var $tmp = new net.alphatab.model.GsColor(r,g,b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadDuration = function(flags) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadDuration");
	var $spos = $s.length;
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
	{
		$s.pop();
		return duration;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadGrace = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadGrace");
	var $spos = $s.length;
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
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.None;
	}break;
	case 1:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Slide;
	}break;
	case 2:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Bend;
	}break;
	case 3:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Hammer;
	}break;
	}
	noteEffect.Grace = (grace);
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadInfo = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadInfo");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadLyrics = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadLyrics");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadMarker = function(header) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadMarker");
	var $spos = $s.length;
	var marker = this.Factory.NewMarker();
	marker.MeasureHeader = header;
	marker.Title = this.ReadIntSizeCheckByteString();
	marker.Color = this.ReadColor();
	{
		$s.pop();
		return marker;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadMeasure = function(measure,track) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadMeasure");
	var $spos = $s.length;
	var start = measure.Start();
	var beats = this.ReadInt();
	{
		var _g = 0;
		while(_g < beats) {
			var beat = _g++;
			start += this.ReadBeat(start,measure,track,0);
		}
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadMeasureHeader = function(i,timeSignature,song) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadMeasureHeader");
	var $spos = $s.length;
	var flags = this.ReadUnsignedByte();
	var header = this.Factory.NewMeasureHeader();
	header.Number = i + 1;
	header.Start = 0;
	header.Tempo.Value = song.Tempo;
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
	else if(header.Number > 1) {
		header.KeySignature = song.MeasureHeaders[i - 1].KeySignature;
		header.KeySignatureType = song.MeasureHeaders[i - 1].KeySignatureType;
	}
	header.HasDoubleBar = (flags & 128) != 0;
	{
		$s.pop();
		return header;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadMeasureHeaders = function(song,measureCount) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadMeasureHeaders");
	var $spos = $s.length;
	var timeSignature = this.Factory.NewTimeSignature();
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.AddMeasureHeader(this.ReadMeasureHeader(i,timeSignature,song));
		}
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadMeasures = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadMeasures");
	var $spos = $s.length;
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
					header.Tempo.Copy(tempo);
					track.AddMeasure(measure);
					this.ReadMeasure(measure,track);
				}
			}
			tempo.Copy(header.Tempo);
			start += header.Length();
		}
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadMidiChannels = function() {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadMidiChannels");
	var $spos = $s.length;
	var channels = new Array();
	{
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.Factory.NewMidiChannel();
			newChannel.Channel = (i);
			newChannel.EffectChannel = (i);
			newChannel.Instrument(this.ReadInt());
			newChannel.Volume = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Balance = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Chorus = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Reverb = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Phaser = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Tremolo = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			channels.push(newChannel);
			this.Skip(2);
		}
	}
	{
		$s.pop();
		return channels;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadMixTableChange = function(measure) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadMixTableChange");
	var $spos = $s.length;
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
		measure.GetTempo().Value = tableChange.Tempo.Value;
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
	{
		$s.pop();
		return tableChange;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadNote = function(guitarString,track,effect) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadNote");
	var $spos = $s.length;
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
	{
		$s.pop();
		return note;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadNoteEffects = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadNoteEffects");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadPageSetup = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadPageSetup");
	var $spos = $s.length;
	var setup = net.alphatab.model.GsPageSetup.Defaults();
	song.PageSetup = setup;
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadSong = function() {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadSong");
	var $spos = $s.length;
	if(!this.ReadVersion()) {
		throw new net.alphatab.file.FileFormatException("Unsupported Version");
	}
	var song = this.Factory.NewSong();
	this.ReadInfo(song);
	this._tripletFeel = (this.ReadBool()?net.alphatab.model.GsTripletFeel.Eighth:net.alphatab.model.GsTripletFeel.None);
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
	{
		$s.pop();
		return song;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadText = function(beat) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadText");
	var $spos = $s.length;
	var text = this.Factory.NewText();
	text.Value = this.ReadIntSizeCheckByteString();
	beat.SetText(text);
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadTrack = function(number,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadTrack");
	var $spos = $s.length;
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
	{
		$s.pop();
		return track;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadTracks = function(song,trackCount,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadTracks");
	var $spos = $s.length;
	var _g1 = 1, _g = trackCount + 1;
	while(_g1 < _g) {
		var i = _g1++;
		song.AddTrack(this.ReadTrack(i,channels));
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ReadTremoloBar = function(effect) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ReadTremoloBar");
	var $spos = $s.length;
	var barEffect = this.Factory.NewTremoloBarEffect();
	barEffect.Type = net.alphatab.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	barEffect.Value = this.ReadInt();
	barEffect.Points.push(new net.alphatab.model.effects.GsTremoloBarPoint(0,0,false));
	barEffect.Points.push(new net.alphatab.model.effects.GsTremoloBarPoint(Math.round(12 / 2.0),Math.round(barEffect.Value / 50),false));
	barEffect.Points.push(new net.alphatab.model.effects.GsTremoloBarPoint(12,0,false));
	effect.TremoloBar = barEffect;
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ToKeySignature = function(p) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ToKeySignature");
	var $spos = $s.length;
	{
		var $tmp = (p < 0?7 + Math.round(Math.abs(p)):p);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype.ToStrokeValue = function(value) {
	$s.push("net.alphatab.file.guitarpro.Gp3Reader::ToStrokeValue");
	var $spos = $s.length;
	switch(value) {
	case 1:{
		{
			$s.pop();
			return 64;
		}
	}break;
	case 2:{
		{
			$s.pop();
			return 64;
		}
	}break;
	case 3:{
		{
			$s.pop();
			return 32;
		}
	}break;
	case 4:{
		{
			$s.pop();
			return 16;
		}
	}break;
	case 5:{
		{
			$s.pop();
			return 8;
		}
	}break;
	case 6:{
		{
			$s.pop();
			return 4;
		}
	}break;
	default:{
		{
			$s.pop();
			return 64;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp3Reader.prototype._tripletFeel = null;
net.alphatab.file.guitarpro.Gp3Reader.prototype.__class__ = net.alphatab.file.guitarpro.Gp3Reader;
net.alphatab.model.effects.GsTremoloBarEffect = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.effects.GsTremoloBarEffect::new");
	var $spos = $s.length;
	this.Points = new Array();
	$s.pop();
}}
net.alphatab.model.effects.GsTremoloBarEffect.__name__ = ["net","alphatab","model","effects","GsTremoloBarEffect"];
net.alphatab.model.effects.GsTremoloBarEffect.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.effects.GsTremoloBarEffect::Clone");
	var $spos = $s.length;
	var effect = factory.NewTremoloBarEffect();
	effect.Type = this.Type;
	effect.Value = this.Value;
	{
		var _g1 = 0, _g = this.Points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.Points[i];
			effect.Points.push(new net.alphatab.model.effects.GsTremoloBarPoint(point.Position,point.Value,point.Vibrato));
		}
	}
	{
		$s.pop();
		return effect;
	}
	$s.pop();
}
net.alphatab.model.effects.GsTremoloBarEffect.prototype.Points = null;
net.alphatab.model.effects.GsTremoloBarEffect.prototype.Type = null;
net.alphatab.model.effects.GsTremoloBarEffect.prototype.Value = null;
net.alphatab.model.effects.GsTremoloBarEffect.prototype.__class__ = net.alphatab.model.effects.GsTremoloBarEffect;
net.alphatab.model.GsColor = function(r,g,b) { if( r === $_ ) return; {
	$s.push("net.alphatab.model.GsColor::new");
	var $spos = $s.length;
	if(b == null) b = 0;
	if(g == null) g = 0;
	if(r == null) r = 0;
	this.R = r;
	this.G = g;
	this.B = b;
	$s.pop();
}}
net.alphatab.model.GsColor.__name__ = ["net","alphatab","model","GsColor"];
net.alphatab.model.GsColor.prototype.B = null;
net.alphatab.model.GsColor.prototype.G = null;
net.alphatab.model.GsColor.prototype.R = null;
net.alphatab.model.GsColor.prototype.toString = function() {
	$s.push("net.alphatab.model.GsColor::toString");
	var $spos = $s.length;
	var s = "rgb(";
	s += Std.string(this.R) + ",";
	s += Std.string(this.G) + ",";
	s += Std.string(this.B) + ")";
	{
		$s.pop();
		return s;
	}
	$s.pop();
}
net.alphatab.model.GsColor.prototype.__class__ = net.alphatab.model.GsColor;
net.alphatab.model.GsMarker = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsMarker::new");
	var $spos = $s.length;
	this.Title = "Untitled";
	this.Color = new net.alphatab.model.GsColor(255,0,0);
	$s.pop();
}}
net.alphatab.model.GsMarker.__name__ = ["net","alphatab","model","GsMarker"];
net.alphatab.model.GsMarker.prototype.Color = null;
net.alphatab.model.GsMarker.prototype.MeasureHeader = null;
net.alphatab.model.GsMarker.prototype.Title = null;
net.alphatab.model.GsMarker.prototype.__class__ = net.alphatab.model.GsMarker;
net.alphatab.model.Size = function(width,height) { if( width === $_ ) return; {
	$s.push("net.alphatab.model.Size::new");
	var $spos = $s.length;
	this.Width = width;
	this.Height = height;
	$s.pop();
}}
net.alphatab.model.Size.__name__ = ["net","alphatab","model","Size"];
net.alphatab.model.Size.prototype.Height = null;
net.alphatab.model.Size.prototype.Width = null;
net.alphatab.model.Size.prototype.__class__ = net.alphatab.model.Size;
net.alphatab.model.Point = function(x,y) { if( x === $_ ) return; {
	$s.push("net.alphatab.model.Point::new");
	var $spos = $s.length;
	this.X = x;
	this.Y = y;
	$s.pop();
}}
net.alphatab.model.Point.__name__ = ["net","alphatab","model","Point"];
net.alphatab.model.Point.prototype.X = null;
net.alphatab.model.Point.prototype.Y = null;
net.alphatab.model.Point.prototype.__class__ = net.alphatab.model.Point;
net.alphatab.model.effects.GsBendEffect = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.effects.GsBendEffect::new");
	var $spos = $s.length;
	this.Type = net.alphatab.model.effects.GsBendTypes.None;
	this.Value = 0;
	this.Points = new Array();
	$s.pop();
}}
net.alphatab.model.effects.GsBendEffect.__name__ = ["net","alphatab","model","effects","GsBendEffect"];
net.alphatab.model.effects.GsBendEffect.prototype.Clone = function(factory) {
	$s.push("net.alphatab.model.effects.GsBendEffect::Clone");
	var $spos = $s.length;
	var effect = factory.NewBendEffect();
	effect.Value = this.Value;
	effect.Type = this.Type;
	{
		var _g1 = 0, _g = this.Points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.Points[i];
			effect.Points.push(new net.alphatab.model.effects.GsBendPoint(point.Position,point.Value,point.Vibrato));
		}
	}
	{
		$s.pop();
		return effect;
	}
	$s.pop();
}
net.alphatab.model.effects.GsBendEffect.prototype.Points = null;
net.alphatab.model.effects.GsBendEffect.prototype.Type = null;
net.alphatab.model.effects.GsBendEffect.prototype.Value = null;
net.alphatab.model.effects.GsBendEffect.prototype.__class__ = net.alphatab.model.effects.GsBendEffect;
net.alphatab.model.GsPageSetup = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsPageSetup::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.model.GsPageSetup.__name__ = ["net","alphatab","model","GsPageSetup"];
net.alphatab.model.GsPageSetup.Defaults = function() {
	$s.push("net.alphatab.model.GsPageSetup::Defaults");
	var $spos = $s.length;
	if(net.alphatab.model.GsPageSetup._defaults == null) {
		net.alphatab.model.GsPageSetup._defaults = new net.alphatab.model.GsPageSetup();
		net.alphatab.model.GsPageSetup._defaults.PageSize = new net.alphatab.model.Point(210,297);
		net.alphatab.model.GsPageSetup._defaults.PageMargin = new net.alphatab.model.Rectangle(10,15,10,10);
		net.alphatab.model.GsPageSetup._defaults.ScoreSizeProportion = 1;
		net.alphatab.model.GsPageSetup._defaults.HeaderAndFooter = 511;
		net.alphatab.model.GsPageSetup._defaults.Title = "%TITLE%";
		net.alphatab.model.GsPageSetup._defaults.Subtitle = "%SUBTITLE%";
		net.alphatab.model.GsPageSetup._defaults.Artist = "%ARTIST%";
		net.alphatab.model.GsPageSetup._defaults.Album = "%ALBUM%";
		net.alphatab.model.GsPageSetup._defaults.Words = "Words by %WORDS%";
		net.alphatab.model.GsPageSetup._defaults.Music = "Music by %MUSIC%";
		net.alphatab.model.GsPageSetup._defaults.WordsAndMusic = "Words & Music by %WORDSMUSIC%";
		net.alphatab.model.GsPageSetup._defaults.Copyright = "Copyright %COPYRIGHT%\n" + "All Rights Reserved - International Copyright Secured";
		net.alphatab.model.GsPageSetup._defaults.PageNumber = "Page %N%/%P%";
	}
	{
		var $tmp = net.alphatab.model.GsPageSetup._defaults;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.GsPageSetup.prototype.Album = null;
net.alphatab.model.GsPageSetup.prototype.Artist = null;
net.alphatab.model.GsPageSetup.prototype.Copyright = null;
net.alphatab.model.GsPageSetup.prototype.HeaderAndFooter = null;
net.alphatab.model.GsPageSetup.prototype.Music = null;
net.alphatab.model.GsPageSetup.prototype.PageMargin = null;
net.alphatab.model.GsPageSetup.prototype.PageNumber = null;
net.alphatab.model.GsPageSetup.prototype.PageSize = null;
net.alphatab.model.GsPageSetup.prototype.ScoreSizeProportion = null;
net.alphatab.model.GsPageSetup.prototype.Subtitle = null;
net.alphatab.model.GsPageSetup.prototype.Title = null;
net.alphatab.model.GsPageSetup.prototype.Words = null;
net.alphatab.model.GsPageSetup.prototype.WordsAndMusic = null;
net.alphatab.model.GsPageSetup.prototype.__class__ = net.alphatab.model.GsPageSetup;
net.alphatab.tablature.drawing.DrawingResources = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.tablature.drawing.DrawingResources::new");
	var $spos = $s.length;
	null;
	$s.pop();
}}
net.alphatab.tablature.drawing.DrawingResources.__name__ = ["net","alphatab","tablature","drawing","DrawingResources"];
net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight = null;
net.alphatab.tablature.drawing.DrawingResources.DefaultFont = null;
net.alphatab.tablature.drawing.DrawingResources.ChordFont = null;
net.alphatab.tablature.drawing.DrawingResources.TimeSignatureFont = null;
net.alphatab.tablature.drawing.DrawingResources.ClefFont = null;
net.alphatab.tablature.drawing.DrawingResources.MusicFont = null;
net.alphatab.tablature.drawing.DrawingResources.TempoFont = null;
net.alphatab.tablature.drawing.DrawingResources.GraceFontHeight = null;
net.alphatab.tablature.drawing.DrawingResources.GraceFont = null;
net.alphatab.tablature.drawing.DrawingResources.NoteFont = null;
net.alphatab.tablature.drawing.DrawingResources.NoteFontHeight = null;
net.alphatab.tablature.drawing.DrawingResources.EffectFont = null;
net.alphatab.tablature.drawing.DrawingResources.EffectFontHeight = null;
net.alphatab.tablature.drawing.DrawingResources.TitleFont = null;
net.alphatab.tablature.drawing.DrawingResources.SubtitleFont = null;
net.alphatab.tablature.drawing.DrawingResources.WordsFont = null;
net.alphatab.tablature.drawing.DrawingResources.Init = function(scale) {
	$s.push("net.alphatab.tablature.drawing.DrawingResources::Init");
	var $spos = $s.length;
	net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight = Math.round(9 * scale);
	net.alphatab.tablature.drawing.DrawingResources.DefaultFont = net.alphatab.Utils.string(net.alphatab.tablature.drawing.DrawingResources.DefaultFontHeight) + "px Arial";
	net.alphatab.tablature.drawing.DrawingResources.ChordFont = net.alphatab.Utils.string(9 * scale) + "px Arial";
	net.alphatab.tablature.drawing.DrawingResources.TimeSignatureFont = net.alphatab.Utils.string(20 * scale) + "px Arial";
	net.alphatab.tablature.drawing.DrawingResources.ClefFont = net.alphatab.Utils.string(13 * scale) + "px Arial";
	net.alphatab.tablature.drawing.DrawingResources.MusicFont = net.alphatab.Utils.string(13 * scale) + "px Arial";
	net.alphatab.tablature.drawing.DrawingResources.TempoFont = net.alphatab.Utils.string(11 * scale) + "px Arial";
	net.alphatab.tablature.drawing.DrawingResources.GraceFontHeight = Math.round(9 * scale);
	net.alphatab.tablature.drawing.DrawingResources.GraceFont = net.alphatab.Utils.string(net.alphatab.tablature.drawing.DrawingResources.GraceFontHeight) + "px Arial";
	net.alphatab.tablature.drawing.DrawingResources.NoteFontHeight = Math.round(11 * scale);
	net.alphatab.tablature.drawing.DrawingResources.NoteFont = net.alphatab.Utils.string(net.alphatab.tablature.drawing.DrawingResources.NoteFontHeight) + "px Arial";
	net.alphatab.tablature.drawing.DrawingResources.EffectFontHeight = Math.round(11 * scale);
	net.alphatab.tablature.drawing.DrawingResources.EffectFont = ("italic " + net.alphatab.Utils.string(net.alphatab.tablature.drawing.DrawingResources.EffectFontHeight)) + "px Times New Roman";
	net.alphatab.tablature.drawing.DrawingResources.TitleFont = net.alphatab.Utils.string(30 * scale) + "px Times New Roman";
	net.alphatab.tablature.drawing.DrawingResources.SubtitleFont = net.alphatab.Utils.string(19 * scale) + "px Times New Roman";
	net.alphatab.tablature.drawing.DrawingResources.WordsFont = net.alphatab.Utils.string(13 * scale) + "px Times New Roman";
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingResources.GetScoreNoteSize = function(layout,full) {
	$s.push("net.alphatab.tablature.drawing.DrawingResources::GetScoreNoteSize");
	var $spos = $s.length;
	var scale = ((full?layout.ScoreLineSpacing + 1:layout.ScoreLineSpacing)) - 2;
	{
		var $tmp = new net.alphatab.model.Size(Math.round(scale * 1.3),Math.round(scale));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.tablature.drawing.DrawingResources.prototype.__class__ = net.alphatab.tablature.drawing.DrawingResources;
net.alphatab.model.effects.GsTremoloBarPoint = function(position,value,vibrato) { if( position === $_ ) return; {
	$s.push("net.alphatab.model.effects.GsTremoloBarPoint::new");
	var $spos = $s.length;
	if(vibrato == null) vibrato = false;
	if(value == null) value = 0;
	if(position == null) position = 0;
	this.Position = position;
	this.Value = value;
	this.Vibrato = vibrato;
	$s.pop();
}}
net.alphatab.model.effects.GsTremoloBarPoint.__name__ = ["net","alphatab","model","effects","GsTremoloBarPoint"];
net.alphatab.model.effects.GsTremoloBarPoint.prototype.GetTime = function(duration) {
	$s.push("net.alphatab.model.effects.GsTremoloBarPoint::GetTime");
	var $spos = $s.length;
	{
		var $tmp = Math.floor((duration * this.Position) / 12);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.model.effects.GsTremoloBarPoint.prototype.Position = null;
net.alphatab.model.effects.GsTremoloBarPoint.prototype.Value = null;
net.alphatab.model.effects.GsTremoloBarPoint.prototype.Vibrato = null;
net.alphatab.model.effects.GsTremoloBarPoint.prototype.__class__ = net.alphatab.model.effects.GsTremoloBarPoint;
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
net.alphatab.model.effects.GsBendTypes = { __ename__ : ["net","alphatab","model","effects","GsBendTypes"], __constructs__ : ["None","Bend","BendRelease","BendReleaseBend","Prebend","PrebendRelease","Dip","Dive","ReleaseUp","InvertedDip","Return","ReleaseDown"] }
net.alphatab.model.effects.GsBendTypes.Bend = ["Bend",1];
net.alphatab.model.effects.GsBendTypes.Bend.toString = $estr;
net.alphatab.model.effects.GsBendTypes.Bend.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.BendRelease = ["BendRelease",2];
net.alphatab.model.effects.GsBendTypes.BendRelease.toString = $estr;
net.alphatab.model.effects.GsBendTypes.BendRelease.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.BendReleaseBend = ["BendReleaseBend",3];
net.alphatab.model.effects.GsBendTypes.BendReleaseBend.toString = $estr;
net.alphatab.model.effects.GsBendTypes.BendReleaseBend.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.Dip = ["Dip",6];
net.alphatab.model.effects.GsBendTypes.Dip.toString = $estr;
net.alphatab.model.effects.GsBendTypes.Dip.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.Dive = ["Dive",7];
net.alphatab.model.effects.GsBendTypes.Dive.toString = $estr;
net.alphatab.model.effects.GsBendTypes.Dive.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.InvertedDip = ["InvertedDip",9];
net.alphatab.model.effects.GsBendTypes.InvertedDip.toString = $estr;
net.alphatab.model.effects.GsBendTypes.InvertedDip.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.None = ["None",0];
net.alphatab.model.effects.GsBendTypes.None.toString = $estr;
net.alphatab.model.effects.GsBendTypes.None.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.Prebend = ["Prebend",4];
net.alphatab.model.effects.GsBendTypes.Prebend.toString = $estr;
net.alphatab.model.effects.GsBendTypes.Prebend.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.PrebendRelease = ["PrebendRelease",5];
net.alphatab.model.effects.GsBendTypes.PrebendRelease.toString = $estr;
net.alphatab.model.effects.GsBendTypes.PrebendRelease.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.ReleaseDown = ["ReleaseDown",11];
net.alphatab.model.effects.GsBendTypes.ReleaseDown.toString = $estr;
net.alphatab.model.effects.GsBendTypes.ReleaseDown.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.ReleaseUp = ["ReleaseUp",8];
net.alphatab.model.effects.GsBendTypes.ReleaseUp.toString = $estr;
net.alphatab.model.effects.GsBendTypes.ReleaseUp.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.model.effects.GsBendTypes.Return = ["Return",10];
net.alphatab.model.effects.GsBendTypes.Return.toString = $estr;
net.alphatab.model.effects.GsBendTypes.Return.__enum__ = net.alphatab.model.effects.GsBendTypes;
net.alphatab.tablature.TrackSpacingPositionConverter = function() { }
net.alphatab.tablature.TrackSpacingPositionConverter.__name__ = ["net","alphatab","tablature","TrackSpacingPositionConverter"];
net.alphatab.tablature.TrackSpacingPositionConverter.ToInt = function(pos) {
	$s.push("net.alphatab.tablature.TrackSpacingPositionConverter::ToInt");
	var $spos = $s.length;
	switch(pos) {
	case net.alphatab.tablature.TrackSpacingPositions.Top:{
		{
			$s.pop();
			return 0;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Marker:{
		{
			$s.pop();
			return 1;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Text:{
		{
			$s.pop();
			return 2;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.BufferSeparator:{
		{
			$s.pop();
			return 3;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.RepeatEnding:{
		{
			$s.pop();
			return 4;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Chord:{
		{
			$s.pop();
			return 5;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.ScoreUpLines:{
		{
			$s.pop();
			return 6;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.ScoreMiddleLines:{
		{
			$s.pop();
			return 7;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.ScoreDownLines:{
		{
			$s.pop();
			return 8;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Tupleto:{
		{
			$s.pop();
			return 9;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.AccentuatedEffect:{
		{
			$s.pop();
			return 10;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.HarmonicEffect:{
		{
			$s.pop();
			return 11;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.TapingEffect:{
		{
			$s.pop();
			return 12;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.LetRingEffect:{
		{
			$s.pop();
			return 13;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.PalmMuteEffect:{
		{
			$s.pop();
			return 14;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.BeatVibratoEffect:{
		{
			$s.pop();
			return 15;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.VibratoEffect:{
		{
			$s.pop();
			return 16;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.FadeIn:{
		{
			$s.pop();
			return 17;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Bend:{
		{
			$s.pop();
			return 18;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.TablatureTopSeparator:{
		{
			$s.pop();
			return 19;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Tablature:{
		{
			$s.pop();
			return 20;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Lyric:{
		{
			$s.pop();
			return 21;
		}
	}break;
	case net.alphatab.tablature.TrackSpacingPositions.Bottom:{
		{
			$s.pop();
			return 22;
		}
	}break;
	default:{
		{
			$s.pop();
			return 0;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.tablature.TrackSpacingPositionConverter.prototype.__class__ = net.alphatab.tablature.TrackSpacingPositionConverter;
net.alphatab.midi.MidiSequenceParser = function(factory,song,flags,tempoPercent,transpose) { if( factory === $_ ) return; {
	$s.push("net.alphatab.midi.MidiSequenceParser::new");
	var $spos = $s.length;
	this._song = song;
	this._factory = factory;
	this._flags = flags;
	this._transpose = transpose;
	this._tempoPercent = tempoPercent;
	this._firstTickMove = (((flags & 8) == 0)?0:960);
	$s.pop();
}}
net.alphatab.midi.MidiSequenceParser.__name__ = ["net","alphatab","midi","MidiSequenceParser"];
net.alphatab.midi.MidiSequenceParser.ApplyDurationEffects = function(note,tempo,duration) {
	$s.push("net.alphatab.midi.MidiSequenceParser::ApplyDurationEffects");
	var $spos = $s.length;
	if(note.Effect.DeadNote) {
		{
			var $tmp = net.alphatab.midi.MidiSequenceParser.ApplyStaticDuration(tempo,30,duration);
			$s.pop();
			return $tmp;
		}
	}
	if(note.Effect.PalmMute) {
		{
			var $tmp = net.alphatab.midi.MidiSequenceParser.ApplyStaticDuration(tempo,80,duration);
			$s.pop();
			return $tmp;
		}
	}
	if(note.Effect.Staccato) {
		{
			var $tmp = Math.floor((duration * 50.0) / 100.0);
			$s.pop();
			return $tmp;
		}
	}
	{
		$s.pop();
		return duration;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.ApplyStaticDuration = function(tempo,duration,maximum) {
	$s.push("net.alphatab.midi.MidiSequenceParser::ApplyStaticDuration");
	var $spos = $s.length;
	var value = Math.floor((tempo.Value * duration) / 60);
	{
		var $tmp = (((value < maximum)?value:maximum));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.ApplyStrokeDuration = function(note,duration,stroke) {
	$s.push("net.alphatab.midi.MidiSequenceParser::ApplyStrokeDuration");
	var $spos = $s.length;
	{
		var $tmp = (duration - stroke[note.String - 1]);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.ApplyStrokeStart = function(node,start,stroke) {
	$s.push("net.alphatab.midi.MidiSequenceParser::ApplyStrokeStart");
	var $spos = $s.length;
	{
		var $tmp = (start + stroke[node.String - 1]);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.GetNextBeat = function(voice,beatIndex) {
	$s.push("net.alphatab.midi.MidiSequenceParser::GetNextBeat");
	var $spos = $s.length;
	var next = null;
	{
		var _g1 = beatIndex + 1, _g = voice.Beat.Measure.BeatCount();
		while(_g1 < _g) {
			var b = _g1++;
			var current = voice.Beat.Measure.Beats[b];
			if(((current.Start > voice.Beat.Start) && !current.Voices[voice.Index].IsEmpty) && ((next == null) || (current.Start < next.Beat.Start))) {
				next = current.Voices[voice.Index];
			}
		}
	}
	{
		$s.pop();
		return next;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.GetNextNote = function(note,track,measureIndex,beatIndex) {
	$s.push("net.alphatab.midi.MidiSequenceParser::GetNextNote");
	var $spos = $s.length;
	var nextBeatIndex = beatIndex + 1;
	var measureCount = track.MeasureCount();
	{
		var _g = measureIndex;
		while(_g < measureCount) {
			var m = _g++;
			var measure = track.Measures[m];
			var beatCount = measure.BeatCount();
			{
				var _g1 = nextBeatIndex;
				while(_g1 < beatCount) {
					var b = _g1++;
					var beat = measure.Beats[b];
					var voice = beat.Voices[note.Voice.Index];
					var noteCount = voice.Notes.length;
					{
						var _g2 = 0;
						while(_g2 < noteCount) {
							var n = _g2++;
							var currNode = voice.Notes[n];
							if(currNode.String == note.String) {
								{
									$s.pop();
									return currNode;
								}
							}
						}
					}
					{
						$s.pop();
						return null;
					}
				}
			}
			nextBeatIndex = 0;
		}
	}
	{
		$s.pop();
		return null;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.GetPreviousBeat = function(voice,beatIndex) {
	$s.push("net.alphatab.midi.MidiSequenceParser::GetPreviousBeat");
	var $spos = $s.length;
	var previous = null;
	var b = beatIndex - 1;
	while(b >= 0) {
		var current = voice.Beat.Measure.Beats[b];
		if(((current.Start < voice.Beat.Start) && !current.Voices[voice.Index].IsEmpty) && ((previous == null) || (current.Start > previous.Beat.Start))) {
			previous = current.Voices[voice.Index];
		}
		b--;
	}
	{
		$s.pop();
		return previous;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.GetPreviousNote = function(note,track,measureIndex,beatIndex) {
	$s.push("net.alphatab.midi.MidiSequenceParser::GetPreviousNote");
	var $spos = $s.length;
	var nextBeatIndex = beatIndex;
	var m = measureIndex;
	while(m >= 0) {
		var measure = track.Measures[m];
		nextBeatIndex = ((nextBeatIndex < 0)?measure.BeatCount():nextBeatIndex);
		var b = nextBeatIndex - 1;
		while(b >= 0) {
			var voice = measure.Beats[b].Voices[note.Voice.Index];
			var noteCount = voice.Notes.length;
			{
				var _g = 0;
				while(_g < noteCount) {
					var n = _g++;
					var current = voice.Notes[n];
					if(current.String == note.String) {
						{
							$s.pop();
							return current;
						}
					}
				}
			}
			b--;
		}
		nextBeatIndex = -1;
		m--;
	}
	{
		$s.pop();
		return null;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.GetRealVelocity = function(note,track,measureIndex,beatIndex) {
	$s.push("net.alphatab.midi.MidiSequenceParser::GetRealVelocity");
	var $spos = $s.length;
	var velocity = note.Velocity;
	if(!track.IsPercussionTrack) {
		var previousNote = net.alphatab.midi.MidiSequenceParser.GetPreviousNote(note,track,measureIndex,beatIndex);
		if((previousNote != null) && previousNote.Effect.Hammer) {
			velocity = Math.floor(Math.max(15,velocity - 25));
		}
	}
	if(note.Effect.GhostNote) {
		velocity = Math.floor(Math.max(15,velocity - 16));
	}
	else if(note.Effect.AccentuatedNote) {
		velocity = Math.floor(Math.max(15,velocity + 16));
	}
	else if(note.Effect.HeavyAccentuatedNote) {
		velocity = Math.floor(Math.max(15,velocity + 32));
	}
	{
		var $tmp = (((velocity > 127)?127:velocity));
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.GetStroke = function(beat,previous,stroke) {
	$s.push("net.alphatab.midi.MidiSequenceParser::GetStroke");
	var $spos = $s.length;
	var direction = beat.Stroke.Direction;
	if(((previous == null) || (direction != net.alphatab.model.GsBeatStrokeDirection.None)) || (previous.Stroke.Direction != net.alphatab.model.GsBeatStrokeDirection.None)) {
		if(direction == net.alphatab.model.GsBeatStrokeDirection.None) {
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
				var _g1 = 0, _g = beat.Voices.length;
				while(_g1 < _g) {
					var vIndex = _g1++;
					var voice = beat.Voices[vIndex];
					{
						var _g3 = 0, _g2 = voice.Notes.length;
						while(_g3 < _g2) {
							var nIndex = _g3++;
							var note = voice.Notes[nIndex];
							if(note.IsTiedNote) continue;
							stringUsed |= 1 << (note.String - 1);
							stringCount++;
						}
					}
				}
			}
			if(stringCount > 0) {
				var strokeMove = 0;
				var strokeIncrement = beat.Stroke.GetIncrementTime(beat);
				{
					var _g1 = 0, _g = stroke.length;
					while(_g1 < _g) {
						var i = _g1++;
						var iIndex = ((direction != net.alphatab.model.GsBeatStrokeDirection.Down)?i:((stroke.length - 1) - i));
						if((stringUsed & (1 << iIndex)) != 0) {
							stroke[iIndex] = strokeMove;
							strokeMove += strokeIncrement;
						}
					}
				}
			}
		}
	}
	{
		$s.pop();
		return stroke;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.AddBend = function(sequence,track,tick,bend,channel) {
	$s.push("net.alphatab.midi.MidiSequenceParser::AddBend");
	var $spos = $s.length;
	sequence.AddPitchBend(this.GetTick(tick),track,channel,bend);
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.AddDefaultMessages = function(oSequence) {
	$s.push("net.alphatab.midi.MidiSequenceParser::AddDefaultMessages");
	var $spos = $s.length;
	if((this._flags & 1) == 0) {
		$s.pop();
		return;
	}
	{
		var _g = 0;
		while(_g < 16) {
			var i = _g++;
			oSequence.AddControlChange(this.GetTick(960),this._infoTrack,i,101,0);
			oSequence.AddControlChange(this.GetTick(960),this._infoTrack,i,100,0);
			oSequence.AddControlChange(this.GetTick(960),this._infoTrack,i,6,12);
			oSequence.AddControlChange(this.GetTick(960),this._infoTrack,i,38,0);
		}
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.AddMetronome = function(sequence,header,startMove) {
	$s.push("net.alphatab.midi.MidiSequenceParser::AddMetronome");
	var $spos = $s.length;
	if((this._flags & 4) == 0) {
		$s.pop();
		return;
	}
	var start = startMove + header.Start;
	var length = header.TimeSignature.Denominator.Time();
	{
		var _g1 = 1, _g = header.TimeSignature.Numerator + 1;
		while(_g1 < _g) {
			var i = _g1++;
			this.MakeNote(sequence,this._metronomeTrack,37,start,length,95,9);
			start += length;
		}
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.AddTempo = function(sequence,currentMeasure,previousMeasure,startMove) {
	$s.push("net.alphatab.midi.MidiSequenceParser::AddTempo");
	var $spos = $s.length;
	var bAddTempo = false;
	if(previousMeasure == null) {
		bAddTempo = true;
	}
	else if(currentMeasure.GetTempo().InUsq() != previousMeasure.GetTempo().InUsq()) {
		bAddTempo = true;
	}
	if(!bAddTempo) {
		$s.pop();
		return;
	}
	var usq = Math.floor((currentMeasure.GetTempo().InUsq() * 100.0) / this._tempoPercent);
	sequence.AddTempoInUSQ(this.GetTick(currentMeasure.Start() + startMove),this._infoTrack,usq);
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.AddTimeSignature = function(sequence,currentMeasure,previousMeasure,startMove) {
	$s.push("net.alphatab.midi.MidiSequenceParser::AddTimeSignature");
	var $spos = $s.length;
	var addTimeSignature = false;
	if(previousMeasure == null) {
		addTimeSignature = true;
	}
	else {
		var currNumerator = currentMeasure.GetTimeSignature().Numerator;
		var currValue = currentMeasure.GetTimeSignature().Denominator.Value;
		var prevNumerator = previousMeasure.GetTimeSignature().Numerator;
		var prevValue = previousMeasure.GetTimeSignature().Denominator.Value;
		if((currNumerator != prevNumerator) || (currValue != prevValue)) {
			addTimeSignature = true;
		}
	}
	if(addTimeSignature) {
		sequence.AddTimeSignature(this.GetTick(currentMeasure.Start() + startMove),this._infoTrack,currentMeasure.GetTimeSignature());
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.CheckTripletFeel = function(voice,beatIndex) {
	$s.push("net.alphatab.midi.MidiSequenceParser::CheckTripletFeel");
	var $spos = $s.length;
	var beatStart = voice.Beat.Start;
	var beatDuration = voice.Duration.Time();
	if(voice.Beat.Measure.GetTripletFeel() == net.alphatab.model.GsTripletFeel.Eighth) {
		if(voice.Duration == this.NewDuration(8)) {
			if((beatStart % 960) == 0) {
				var voice2 = net.alphatab.midi.MidiSequenceParser.GetNextBeat(voice,beatIndex);
				if(((voice2 == null) || (voice2.Beat.Start > (beatStart + voice2.Duration.Time()))) || voice2.Duration == this.NewDuration(8)) {
					var duration = this.NewDuration(8);
					duration.Triplet.Enters = 3;
					duration.Triplet.Times = 2;
					beatDuration = duration.Time() * 2;
				}
			}
			else if((beatStart % (960 / 2)) == 0) {
				var voice2 = net.alphatab.midi.MidiSequenceParser.GetPreviousBeat(voice,beatIndex);
				if(((voice2 == null) || (voice2.Beat.Start < (beatStart - voice.Duration.Time()))) || voice2.Duration == this.NewDuration(8)) {
					var duration = this.NewDuration(8);
					duration.Triplet.Enters = 3;
					duration.Triplet.Times = 2;
					beatStart = (beatStart - voice.Duration.Time()) + (duration.Time() * 2);
					beatDuration = duration.Time();
				}
			}
		}
	}
	else if(voice.Beat.Measure.GetTripletFeel() == net.alphatab.model.GsTripletFeel.Sixteenth) {
		if(voice.Duration == this.NewDuration(16)) if((beatStart % (960 / 2)) == 0) {
			var voice2 = net.alphatab.midi.MidiSequenceParser.GetNextBeat(voice,beatIndex);
			if(voice2 == null || (voice2.Beat.Start > (beatStart + voice.Duration.Time())) || voice2.Duration == this.NewDuration(16)) {
				var duration = this.NewDuration(16);
				duration.Triplet.Enters = 3;
				duration.Triplet.Times = 2;
				beatDuration = duration.Time() * 2;
			}
		}
		else if((beatStart % (960 / 4)) == 0) {
			var voice2 = net.alphatab.midi.MidiSequenceParser.GetPreviousBeat(voice,beatIndex);
			if(voice2 == null || (voice2.Beat.Start < (beatStart - voice2.Duration.Time()) || voice2.Duration == this.NewDuration(16))) {
				var duration = this.NewDuration(16);
				duration.Triplet.Enters = 3;
				duration.Triplet.Times = 2;
				beatStart = (beatStart - voice.Duration.Time()) + (duration.Time() * 2);
				beatDuration = duration.Time();
			}
		}
	}
	{
		var $tmp = new net.alphatab.midi.BeatData(beatStart,beatDuration);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.CreateTrack = function(sequence,track) {
	$s.push("net.alphatab.midi.MidiSequenceParser::CreateTrack");
	var $spos = $s.length;
	var previous = null;
	var controller = new net.alphatab.midi.MidiRepeatController(track.Song);
	this.AddBend(sequence,track.Number,960,64,track.Channel.Channel);
	this.MakeChannel(sequence,track.Channel,track.Number);
	while(!controller.Finished()) {
		var measure = track.Measures[controller.Index];
		var index = controller.Index;
		var move = controller.RepeatMove;
		controller.Process();
		if(controller.ShouldPlay) {
			if(track.Number == 1) {
				this.AddTimeSignature(sequence,measure,previous,move);
				this.AddTempo(sequence,measure,previous,move);
				this.AddMetronome(sequence,measure.Header,move);
			}
			this.MakeBeats(sequence,track,measure,index,move);
		}
		previous = measure;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.GetRealNoteDuration = function(track,note,tempo,duration,measureIndex,beatIndex) {
	$s.push("net.alphatab.midi.MidiSequenceParser::GetRealNoteDuration");
	var $spos = $s.length;
	var lastEnd = note.Voice.Beat.Start + note.Voice.Duration.Time();
	var realDuration = duration;
	var nextBeatIndex = beatIndex + 1;
	var measureCount = track.MeasureCount();
	{
		var _g = measureIndex;
		while(_g < measureCount) {
			var m = _g++;
			var measure = track.Measures[m];
			var beatCount = measure.BeatCount();
			var letRingSuspend = false;
			{
				var _g1 = nextBeatIndex;
				while(_g1 < beatCount) {
					var b = _g1++;
					var beat = measure.Beats[b];
					var voice = beat.Voices[note.Voice.Index];
					if(voice.IsRestVoice()) {
						{
							var $tmp = net.alphatab.midi.MidiSequenceParser.ApplyDurationEffects(note,tempo,realDuration);
							$s.pop();
							return $tmp;
						}
					}
					var noteCount = voice.Notes.length;
					var letRing = m == measureIndex && b != beatIndex && note.Effect.LetRing;
					var letRingAppliedForBeat = false;
					{
						var _g2 = 0;
						while(_g2 < noteCount) {
							var n = _g2++;
							var nextNote = voice.Notes[n];
							if(nextNote == note || nextNote.String != note.String) continue;
							if(nextNote.String == note.String && !nextNote.IsTiedNote) {
								letRing = false;
								letRingSuspend = true;
							}
							if(!nextNote.IsTiedNote && !letRing) {
								{
									var $tmp = net.alphatab.midi.MidiSequenceParser.ApplyDurationEffects(note,tempo,realDuration);
									$s.pop();
									return $tmp;
								}
							}
							letRingAppliedForBeat = true;
							realDuration += (beat.Start - lastEnd) + nextNote.Voice.Duration.Time();
							lastEnd = beat.Start + voice.Duration.Time();
						}
					}
					if(letRing && !letRingAppliedForBeat && !letRingSuspend) {
						realDuration += (beat.Start - lastEnd) + voice.Duration.Time();
						lastEnd = beat.Start + voice.Duration.Time();
					}
				}
			}
			nextBeatIndex = 0;
		}
	}
	{
		var $tmp = net.alphatab.midi.MidiSequenceParser.ApplyDurationEffects(note,tempo,realDuration);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.GetTick = function(tick) {
	$s.push("net.alphatab.midi.MidiSequenceParser::GetTick");
	var $spos = $s.length;
	{
		var $tmp = (tick + this._firstTickMove);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeBeats = function(sequence,track,measure,measureIndex,startMove) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeBeats");
	var $spos = $s.length;
	var stroke = new Array();
	{
		var _g1 = 0, _g = track.StringCount();
		while(_g1 < _g) {
			var i = _g1++;
			stroke.push(0);
		}
	}
	var previous = null;
	{
		var _g1 = 0, _g = measure.BeatCount();
		while(_g1 < _g) {
			var beatIndex = _g1++;
			var beat = measure.Beats[beatIndex];
			if(beat.MixTableChange != null) {
				this.MakeMixChange(sequence,track.Channel,track.Number,beat);
			}
			this.MakeNotes(sequence,track,beat,measure.GetTempo(),measureIndex,beatIndex,startMove,net.alphatab.midi.MidiSequenceParser.GetStroke(beat,previous,stroke));
			previous = beat;
		}
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeBend = function(sequence,track,start,duration,bend,channel) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeBend");
	var $spos = $s.length;
	var points = bend.Points;
	{
		var _g1 = 0, _g = points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = points[i];
			var bendStart = start + point.GetTime(duration);
			var value = Math.round(64 + ((point.Value * 2.75) / 1));
			value = ((value <= 127)?value:127);
			value = ((value >= 0)?value:0);
			this.AddBend(sequence,track,bendStart,value,channel);
			if(points.length <= (i + 1)) continue;
			var nextPoint = points[i + 1];
			var nextValue = Math.round(64 + ((nextPoint.Value * 2.75) / 1));
			var nextBendStart = Math.round(start + nextPoint.GetTime(duration));
			if(nextValue == value) continue;
			var width = (nextBendStart - bendStart) / Math.abs(nextValue - value);
			if(value < nextValue) {
				while(value < nextValue) {
					value++;
					bendStart += Math.round(width);
					this.AddBend(sequence,track,bendStart,((value <= 127)?value:127),channel);
				}
			}
			else if(value > nextValue) {
				while(value > nextValue) {
					value--;
					bendStart += Math.round(width);
					this.AddBend(sequence,track,bendStart,((value >= 0)?value:0),channel);
				}
			}
		}
	}
	this.AddBend(sequence,track,start + duration,64,channel);
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeChannel = function(sequence,channel,track) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeChannel");
	var $spos = $s.length;
	if((this._flags & 2) == 0) {
		$s.pop();
		return;
	}
	this.MakeChannel2(sequence,channel,track,true);
	if(channel.Channel != channel.EffectChannel) {
		this.MakeChannel2(sequence,channel,track,false);
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeChannel2 = function(sequence,channel,track,primary) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeChannel2");
	var $spos = $s.length;
	var number = ((!primary)?channel.EffectChannel:channel.Channel);
	sequence.AddControlChange(this.GetTick(960),track,number,7,channel.Volume);
	sequence.AddControlChange(this.GetTick(960),track,number,10,channel.Balance);
	sequence.AddControlChange(this.GetTick(960),track,number,93,channel.Chorus);
	sequence.AddControlChange(this.GetTick(960),track,number,91,channel.Reverb);
	sequence.AddControlChange(this.GetTick(960),track,number,95,channel.Phaser);
	sequence.AddControlChange(this.GetTick(960),track,number,92,channel.Tremolo);
	sequence.AddControlChange(this.GetTick(960),track,number,11,127);
	sequence.AddProgramChange(this.GetTick(960),track,number,channel.Instrument());
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeFadeIn = function(sequence,track,start,duration,channel) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeFadeIn");
	var $spos = $s.length;
	var expression = 31;
	var expressionIncrement = 1;
	var tick = start;
	var tickIncrement = Math.round(duration / ((127 - expression) / expressionIncrement));
	while((tick < (start + duration)) && (expression < 127)) {
		sequence.AddControlChange(this.GetTick(tick),track,channel,11,expression);
		tick += tickIncrement;
		expression += expressionIncrement;
	}
	sequence.AddControlChange(this.GetTick(start + duration),track,channel,11,127);
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeMixChange = function(sequence,channel,track,beat) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeMixChange");
	var $spos = $s.length;
	var change = beat.MixTableChange;
	var start = this.GetTick(beat.Start);
	if(change.Volume != null) {
		sequence.AddControlChange(start,track,channel.Channel,7,change.Volume.Value);
		sequence.AddControlChange(start,track,channel.EffectChannel,7,change.Volume.Value);
	}
	if(change.Balance != null) {
		sequence.AddControlChange(start,track,channel.Channel,10,change.Balance.Value);
		sequence.AddControlChange(start,track,channel.EffectChannel,10,change.Balance.Value);
	}
	if(change.Chorus != null) {
		sequence.AddControlChange(start,track,channel.Channel,93,change.Chorus.Value);
		sequence.AddControlChange(start,track,channel.EffectChannel,93,change.Chorus.Value);
	}
	if(change.Reverb != null) {
		sequence.AddControlChange(start,track,channel.Channel,91,change.Reverb.Value);
		sequence.AddControlChange(start,track,channel.EffectChannel,91,change.Reverb.Value);
	}
	if(change.Phaser != null) {
		sequence.AddControlChange(start,track,channel.Channel,95,change.Phaser.Value);
		sequence.AddControlChange(start,track,channel.EffectChannel,95,change.Phaser.Value);
	}
	if(change.Tremolo != null) {
		sequence.AddControlChange(start,track,channel.Channel,92,change.Tremolo.Value);
		sequence.AddControlChange(start,track,channel.EffectChannel,92,change.Tremolo.Value);
	}
	if(change.Instrument != null) {
		sequence.AddProgramChange(start,track,channel.Channel,change.Instrument.Value);
		sequence.AddProgramChange(start,track,channel.EffectChannel,change.Instrument.Value);
	}
	if(change.Tempo != null) {
		sequence.AddTempoInUSQ(start,this._infoTrack,net.alphatab.model.GsTempo.TempoToUsq(change.Tempo.Value));
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeNote = function(sequence,track,key,start,duration,velocity,channel) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeNote");
	var $spos = $s.length;
	sequence.AddNoteOn(this.GetTick(start),track,channel,key,velocity);
	sequence.AddNoteOff(this.GetTick(start + duration),track,channel,key,velocity);
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeNotes = function(sequence,track,beat,tempo,measureIndex,beatIndex,startMove,stroke) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeNotes");
	var $spos = $s.length;
	var trackId = track.Number;
	{
		var _g1 = 0, _g = beat.Voices.length;
		while(_g1 < _g) {
			var vIndex = _g1++;
			var voice = beat.Voices[vIndex];
			var data = this.CheckTripletFeel(voice,beatIndex);
			{
				var _g3 = 0, _g2 = voice.Notes.length;
				while(_g3 < _g2) {
					var noteIndex = _g3++;
					var note = voice.Notes[noteIndex];
					if(note.IsTiedNote) continue;
					var key = ((this._transpose + track.Offset) + note.Value) + track.Strings[note.String - 1].Value;
					var start = net.alphatab.midi.MidiSequenceParser.ApplyStrokeStart(note,data.Start + startMove,stroke);
					var duration = net.alphatab.midi.MidiSequenceParser.ApplyStrokeDuration(note,this.GetRealNoteDuration(track,note,tempo,data.Duration,measureIndex,beatIndex),stroke);
					var velocity = net.alphatab.midi.MidiSequenceParser.GetRealVelocity(note,track,measureIndex,beatIndex);
					var channel = track.Channel.Channel;
					var effectChannel = track.Channel.EffectChannel;
					var percussionTrack = track.IsPercussionTrack;
					if(note.Effect.FadeIn) {
						channel = effectChannel;
						this.MakeFadeIn(sequence,trackId,start,duration,channel);
					}
					if((note.Effect.IsGrace() && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						var graceKey = (track.Offset + note.Effect.Grace.Fret) + (track.Strings[note.String - 1].Value);
						var graceLength = note.Effect.Grace.DurationTime();
						var graceVelocity = note.Effect.Grace.Dynamic;
						var graceDuration = ((!note.Effect.Grace.IsDead)?graceLength:net.alphatab.midi.MidiSequenceParser.ApplyStaticDuration(tempo,30,graceLength));
						if(note.Effect.Grace.IsOnBeat || ((start - graceLength) < 960)) {
							start += graceLength;
							duration -= graceLength;
						}
						this.MakeNote(sequence,trackId,graceKey,start - graceLength,graceDuration,graceVelocity,channel);
					}
					if((note.Effect.IsTrill() && (effectChannel >= 0)) && !percussionTrack) {
						var trillKey = (track.Offset + note.Effect.Trill.Fret) + (track.Strings[note.String - 1].Value);
						var trillLength = note.Effect.Trill.Duration.Time();
						var realKey = true;
						var tick = start;
						while(tick + 10 < (start + duration)) {
							if((tick + trillLength) >= (start + duration)) {
								trillLength = (((start + duration) - tick) - 1);
							}
							this.MakeNote(sequence,trackId,(((realKey)?key:trillKey)),tick,trillLength,velocity,channel);
							realKey = !realKey;
							tick += trillLength;
						}
						continue;
					}
					if(note.Effect.IsTremoloPicking() && (effectChannel >= 0)) {
						var tpLength = note.Effect.TremoloPicking.Duration.Time();
						var tick = start;
						while(tick + 10 < (start + duration)) {
							if((tick + tpLength) >= (start + duration)) {
								tpLength = (((start + duration) - tick) - 1);
							}
							this.MakeNote(sequence,trackId,key,start,tpLength,velocity,channel);
							tick += tpLength;
						}
						continue;
					}
					if((note.Effect.IsBend() && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						this.MakeBend(sequence,trackId,start,duration,note.Effect.Bend,channel);
					}
					else if((note.Effect.IsTremoloBar() && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						this.MakeTremoloBar(sequence,trackId,start,duration,note.Effect.TremoloBar,channel);
					}
					else if((note.Effect.Slide && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						var nextNote = net.alphatab.midi.MidiSequenceParser.GetNextNote(note,track,measureIndex,beatIndex);
						this.MakeSlide(sequence,trackId,note,nextNote,startMove,channel);
					}
					else if((note.Effect.Vibrato && (effectChannel >= 0)) && !percussionTrack) {
						channel = effectChannel;
						this.MakeVibrato(sequence,trackId,start,duration,channel);
					}
					if(note.Effect.IsHarmonic() && !percussionTrack) {
						var orig = key;
						if(note.Effect.Harmonic.Type == net.alphatab.model.effects.GsHarmonicType.Natural) {
							{
								var _g5 = 0, _g4 = net.alphatab.model.effects.GsHarmonicEffect.NaturalFrequencies.length;
								while(_g5 < _g4) {
									var i = _g5++;
									if((note.Value % 12) == (net.alphatab.model.effects.GsHarmonicEffect.NaturalFrequencies[i][0] % 12)) {
										key = (orig + net.alphatab.model.effects.GsHarmonicEffect.NaturalFrequencies[i][1]) - note.Value;
										break;
									}
								}
							}
						}
						else {
							if(note.Effect.Harmonic.Type == net.alphatab.model.effects.GsHarmonicType.Semi) {
								this.MakeNote(sequence,trackId,Math.round(Math.min(127,orig)),start,duration,Math.round(Math.max(15,velocity - 48)),channel);
							}
							key = orig + net.alphatab.model.effects.GsHarmonicEffect.NaturalFrequencies[note.Effect.Harmonic.Data][1];
						}
						if((key - 12) > 0) {
							var hVelocity = Math.round(Math.max(15,velocity - 64));
							this.MakeNote(sequence,trackId,key - 12,start,duration,hVelocity,channel);
						}
					}
					this.MakeNote(sequence,trackId,Math.round(Math.min(127,key)),start,duration,velocity,channel);
				}
			}
		}
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeSlide = function(sequence,track,note,nextNote,startMove,channel) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeSlide");
	var $spos = $s.length;
	if(nextNote != null) {
		this.MakeSlide2(sequence,track,note.Voice.Beat.Start + startMove,note.Value,nextNote.Voice.Beat.Start + startMove,nextNote.Value,channel);
		this.AddBend(sequence,track,nextNote.Voice.Beat.Start + startMove,64,channel);
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeSlide2 = function(sequence,track,tick1,value1,tick2,value2,channel) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeSlide2");
	var $spos = $s.length;
	var lDistance = value2 - value1;
	var lLength = tick2 - tick1;
	var points = Math.floor(lLength / (960 / 8));
	{
		var _g1 = 1, _g = points + 1;
		while(_g1 < _g) {
			var i = _g1++;
			var fTone = (((lLength / points) * i) * lDistance) / lLength;
			var iBend = Math.round(64 + (fTone * (2.75 * 2)));
			this.AddBend(sequence,track,Math.round(tick1 + ((lLength / points) * i)),iBend,channel);
		}
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeTremoloBar = function(sequence,track,start,duration,effect,channel) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeTremoloBar");
	var $spos = $s.length;
	var points = effect.Points;
	{
		var _g1 = 0, _g = points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = points[i];
			var pointStart = start + point.GetTime(duration);
			var value = Math.round(64 + (point.Value * (2.75 * 2)));
			value = ((value <= 127)?value:127);
			value = ((value >= 0)?value:0);
			this.AddBend(sequence,track,pointStart,value,channel);
			if(points.length > (i + 1)) {
				var nextPoint = points[i + 1];
				var nextValue = Math.round(64 + (nextPoint.Value * (2.75 * 2)));
				var nextPointStart = start + nextPoint.GetTime(duration);
				if(nextValue != value) {
					var width = (nextPointStart - pointStart) / Math.abs(nextValue - value);
					if(value < nextValue) {
						while(value < nextValue) {
							value++;
							pointStart += Math.round(width);
							this.AddBend(sequence,track,pointStart,((value <= 127)?value:127),channel);
						}
					}
					else if(value > nextValue) {
						while(value > nextValue) {
							value += -1;
							pointStart += Math.round(pointStart + width);
							this.AddBend(sequence,track,pointStart,((value >= 0)?value:0),channel);
						}
					}
				}
			}
		}
	}
	this.AddBend(sequence,track,start + duration,64,channel);
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.MakeVibrato = function(sequence,track,start,duration,channel) {
	$s.push("net.alphatab.midi.MidiSequenceParser::MakeVibrato");
	var $spos = $s.length;
	var nextStart = start;
	var end = nextStart + duration;
	while(nextStart < end) {
		nextStart = (((nextStart + 160) > end)?end:(nextStart + 160));
		this.AddBend(sequence,track,nextStart,64,channel);
		nextStart = (((nextStart + 160) > end)?end:(nextStart + 160));
		this.AddBend(sequence,track,nextStart,Math.round(64 + (2.75 / 2.0)),channel);
	}
	this.AddBend(sequence,track,nextStart,64,channel);
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.NewDuration = function(value) {
	$s.push("net.alphatab.midi.MidiSequenceParser::NewDuration");
	var $spos = $s.length;
	var duration = this._factory.NewDuration();
	duration.Value = (value);
	{
		$s.pop();
		return duration;
	}
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype.Parse = function(sequence) {
	$s.push("net.alphatab.midi.MidiSequenceParser::Parse");
	var $spos = $s.length;
	this._infoTrack = sequence.InfoTrack;
	this._metronomeTrack = sequence.MetronomeTrack;
	this.AddDefaultMessages(sequence);
	{
		var _g1 = 0, _g = this._song.Tracks.length;
		while(_g1 < _g) {
			var i = _g1++;
			var songTrack = this._song.Tracks[i];
			this.CreateTrack(sequence,songTrack);
		}
	}
	sequence.NotifyFinish();
	$s.pop();
}
net.alphatab.midi.MidiSequenceParser.prototype._factory = null;
net.alphatab.midi.MidiSequenceParser.prototype._firstTickMove = null;
net.alphatab.midi.MidiSequenceParser.prototype._flags = null;
net.alphatab.midi.MidiSequenceParser.prototype._infoTrack = null;
net.alphatab.midi.MidiSequenceParser.prototype._metronomeTrack = null;
net.alphatab.midi.MidiSequenceParser.prototype._song = null;
net.alphatab.midi.MidiSequenceParser.prototype._tempoPercent = null;
net.alphatab.midi.MidiSequenceParser.prototype._transpose = null;
net.alphatab.midi.MidiSequenceParser.prototype.__class__ = net.alphatab.midi.MidiSequenceParser;
haxe.Http = function(url) { if( url === $_ ) return; {
	$s.push("haxe.Http::new");
	var $spos = $s.length;
	this.url = url;
	this.headers = new Hash();
	this.params = new Hash();
	this.async = true;
	$s.pop();
}}
haxe.Http.__name__ = ["haxe","Http"];
haxe.Http.requestUrl = function(url) {
	$s.push("haxe.Http::requestUrl");
	var $spos = $s.length;
	var h = new haxe.Http(url);
	h.async = false;
	var r = null;
	h.onData = function(d) {
		$s.push("haxe.Http::requestUrl@621");
		var $spos = $s.length;
		r = d;
		$s.pop();
	}
	h.onError = function(e) {
		$s.push("haxe.Http::requestUrl@624");
		var $spos = $s.length;
		throw e;
		$s.pop();
	}
	h.request(false);
	{
		$s.pop();
		return r;
	}
	$s.pop();
}
haxe.Http.prototype.async = null;
haxe.Http.prototype.headers = null;
haxe.Http.prototype.onData = function(data) {
	$s.push("haxe.Http::onData");
	var $spos = $s.length;
	null;
	$s.pop();
}
haxe.Http.prototype.onError = function(msg) {
	$s.push("haxe.Http::onError");
	var $spos = $s.length;
	null;
	$s.pop();
}
haxe.Http.prototype.onStatus = function(status) {
	$s.push("haxe.Http::onStatus");
	var $spos = $s.length;
	null;
	$s.pop();
}
haxe.Http.prototype.params = null;
haxe.Http.prototype.postData = null;
haxe.Http.prototype.request = function(post) {
	$s.push("haxe.Http::request");
	var $spos = $s.length;
	var me = this;
	var r = new js.XMLHttpRequest();
	var onreadystatechange = function() {
		$s.push("haxe.Http::request@104");
		var $spos = $s.length;
		if(r.readyState != 4) {
			$s.pop();
			return;
		}
		var s = (function($this) {
			var $r;
			try {
				$r = r.status;
			}
			catch( $e30 ) {
				{
					var e = $e30;
					$r = (function($this) {
						var $r;
						$e = [];
						while($s.length >= $spos) $e.unshift($s.pop());
						$s.push($e[0]);
						$r = null;
						return $r;
					}($this));
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
		$s.pop();
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
				$e = [];
				while($s.length >= $spos) $e.unshift($s.pop());
				$s.push($e[0]);
				this.onError(e.toString());
				{
					$s.pop();
					return;
				}
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
	$s.pop();
}
haxe.Http.prototype.setHeader = function(header,value) {
	$s.push("haxe.Http::setHeader");
	var $spos = $s.length;
	this.headers.set(header,value);
	$s.pop();
}
haxe.Http.prototype.setParameter = function(param,value) {
	$s.push("haxe.Http::setParameter");
	var $spos = $s.length;
	this.params.set(param,value);
	$s.pop();
}
haxe.Http.prototype.setPostData = function(data) {
	$s.push("haxe.Http::setPostData");
	var $spos = $s.length;
	this.postData = data;
	$s.pop();
}
haxe.Http.prototype.url = null;
haxe.Http.prototype.__class__ = haxe.Http;
net.alphatab.tablature.Tablature = function(source,errorMessage) { if( source === $_ ) return; {
	$s.push("net.alphatab.tablature.Tablature::new");
	var $spos = $s.length;
	if(errorMessage == null) errorMessage = "";
	this.Canvas = net.alphatab.platform.PlatformFactory.GetCanvas(source);
	this.Track = null;
	this.SongManager = new net.alphatab.model.SongManager(new net.alphatab.tablature.model.GsSongFactoryImpl());
	this.ErrorMessage = StringTools.trim(errorMessage);
	if(this.ErrorMessage == "" || this.ErrorMessage == null) {
		this.ErrorMessage = "Please set a song's track to display the tablature";
	}
	this.Width = this.Canvas.Width();
	this.Height = this.Canvas.Height();
	this.ViewLayout = new net.alphatab.tablature.PageViewLayout();
	this.ViewLayout.SetTablature(this);
	this.UpdateScale(1.0);
	$s.pop();
}}
net.alphatab.tablature.Tablature.__name__ = ["net","alphatab","tablature","Tablature"];
net.alphatab.tablature.Tablature.prototype.Canvas = null;
net.alphatab.tablature.Tablature.prototype.DoLayout = function() {
	$s.push("net.alphatab.tablature.Tablature::DoLayout");
	var $spos = $s.length;
	if(this.Track == null) {
		$s.pop();
		return;
	}
	haxe.Log.trace("Starting layouting",{ fileName : "Tablature.hx", lineNumber : 92, className : "net.alphatab.tablature.Tablature", methodName : "DoLayout"});
	var size = this.ViewLayout.LayoutSize;
	this.ViewLayout.PrepareLayout(new net.alphatab.model.Rectangle(0,0,size.Width,size.Height),0,0);
	this.Width = this.ViewLayout.Width;
	this.Height = this.ViewLayout.Height;
	this.Canvas.SetWidth(this.ViewLayout.Width);
	this.Canvas.SetHeight(this.ViewLayout.Height);
	haxe.Log.trace("Layouting finished",{ fileName : "Tablature.hx", lineNumber : 104, className : "net.alphatab.tablature.Tablature", methodName : "DoLayout"});
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.ErrorMessage = null;
net.alphatab.tablature.Tablature.prototype.FindBeat = function(measurePosition,playerPosition,measure) {
	$s.push("net.alphatab.tablature.Tablature::FindBeat");
	var $spos = $s.length;
	if(measure != null) {
		{
			var _g = 0, _g1 = measure.Beats;
			while(_g < _g1.length) {
				var beat = _g1[_g];
				++_g;
				var realBeat = measurePosition + (beat.Start - measure.Start());
				var voice = beat.Voices[0];
				if(!voice.IsEmpty && realBeat <= playerPosition && (realBeat + voice.Duration.Time()) > playerPosition) {
					{
						$s.pop();
						return beat;
					}
				}
			}
		}
		{
			var $tmp = this.SongManager.GetFirstBeat(measure.Beats);
			$s.pop();
			return $tmp;
		}
	}
	{
		$s.pop();
		return null;
	}
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.FindMeasure = function(position) {
	$s.push("net.alphatab.tablature.Tablature::FindMeasure");
	var $spos = $s.length;
	var result = this.GetMeasureAt(position);
	if(result.measure == null) {
		result.measure = this.SongManager.GetFirstMeasure(this.Track);
	}
	{
		$s.pop();
		return result;
	}
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.GetMeasureAt = function(tick) {
	$s.push("net.alphatab.tablature.Tablature::GetMeasureAt");
	var $spos = $s.length;
	var start = 960;
	var result = { measure : null, realPosition : start}
	var song = this.Track.Song;
	var controller = new net.alphatab.midi.MidiRepeatController(song);
	if(this._selectedBeat != null && tick > this._lastPosition) {
		controller.Index = this._selectedBeat.Measure.Number() - 1;
		start = this._lastRealPosition;
	}
	while(!controller.Finished()) {
		var header = song.MeasureHeaders[controller.Index];
		controller.Process();
		if(controller.ShouldPlay) {
			var length = header.Length();
			if(tick >= start && tick < (start + length)) {
				result.measure = this.Track.Measures[header.Number - 1];
				result.realPosition = start;
				{
					$s.pop();
					return result;
				}
			}
			start += length;
		}
	}
	result.realPosition = start;
	{
		$s.pop();
		return result;
	}
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.Height = null;
net.alphatab.tablature.Tablature.prototype.Invalidate = function() {
	$s.push("net.alphatab.tablature.Tablature::Invalidate");
	var $spos = $s.length;
	this.Canvas.clearRect(0,0,this.Canvas.Width(),this.Canvas.Height());
	this.OnPaint();
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.IsError = null;
net.alphatab.tablature.Tablature.prototype.NotifyTickPosition = function(position) {
	$s.push("net.alphatab.tablature.Tablature::NotifyTickPosition");
	var $spos = $s.length;
	position -= 960;
	if(position != this._lastPosition) {
		this._lastPosition = position;
		var result = this.FindMeasure(position);
		var realPosition = result.realPosition;
		this._lastRealPosition = realPosition;
		var measure = result.measure;
		var beat = this.FindBeat(realPosition,position,measure);
		if(measure != null && beat != null) {
			this._selectedBeat = beat;
			if(this.OnCaretChanged != null) this.OnCaretChanged(beat);
		}
	}
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.OnCaretChanged = null;
net.alphatab.tablature.Tablature.prototype.OnPaint = function() {
	$s.push("net.alphatab.tablature.Tablature::OnPaint");
	var $spos = $s.length;
	this.PaintBackground();
	if(this.Track == null || this.IsError) {
		var text = this.ErrorMessage;
		this.Canvas.setFillStyle("#4e4e4e");
		this.Canvas.setFont("20px Arial");
		this.Canvas.setTextBaseline("middle");
		this.Canvas.fillText(text,20,30);
	}
	else if(this.UpdateDisplay) {
		var displayRect = new net.alphatab.model.Rectangle(0,0,this.Width,this.Height);
		this.ViewLayout.UpdateCache(this.Canvas,displayRect,0,0);
		this.UpdateDisplay = false;
	}
	else {
		var displayRect = new net.alphatab.model.Rectangle(0,0,this.Width,this.Height);
		this.ViewLayout.PaintCache(this.Canvas,displayRect,0,0);
		this.UpdateDisplay = false;
	}
	haxe.Log.trace("Drawing Finished",{ fileName : "Tablature.hx", lineNumber : 132, className : "net.alphatab.tablature.Tablature", methodName : "OnPaint"});
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.PaintBackground = function() {
	$s.push("net.alphatab.tablature.Tablature::PaintBackground");
	var $spos = $s.length;
	var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
	this.Canvas.setFillStyle("#4e4e4e");
	this.Canvas.setFont("bold 11px Arial");
	this.Canvas.setTextBaseline("middle");
	var x = (this.Canvas.Width() - this.Canvas.measureText(msg).width) / 2;
	this.Canvas.fillText(msg,x,this.Canvas.Height() - 20);
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.SetTrack = function(track) {
	$s.push("net.alphatab.tablature.Tablature::SetTrack");
	var $spos = $s.length;
	haxe.Log.trace("Updating Track",{ fileName : "Tablature.hx", lineNumber : 71, className : "net.alphatab.tablature.Tablature", methodName : "SetTrack"});
	this.Track = track;
	this.UpdateDisplay = true;
	this.UpdateTablature();
	this.Invalidate();
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.SongManager = null;
net.alphatab.tablature.Tablature.prototype.Track = null;
net.alphatab.tablature.Tablature.prototype.UpdateDisplay = null;
net.alphatab.tablature.Tablature.prototype.UpdateScale = function(scale) {
	$s.push("net.alphatab.tablature.Tablature::UpdateScale");
	var $spos = $s.length;
	net.alphatab.tablature.drawing.DrawingResources.Init(scale);
	this.ViewLayout.Init(scale);
	this.UpdateSong = true;
	this.UpdateTablature();
	this.UpdateDisplay = true;
	this.Invalidate();
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.UpdateSong = null;
net.alphatab.tablature.Tablature.prototype.UpdateTablature = function() {
	$s.push("net.alphatab.tablature.Tablature::UpdateTablature");
	var $spos = $s.length;
	if(this.Track == null) {
		$s.pop();
		return;
	}
	this.ViewLayout.UpdateSong();
	this.DoLayout();
	this.UpdateSong = false;
	$s.pop();
}
net.alphatab.tablature.Tablature.prototype.ViewLayout = null;
net.alphatab.tablature.Tablature.prototype.Width = null;
net.alphatab.tablature.Tablature.prototype._lastPosition = null;
net.alphatab.tablature.Tablature.prototype._lastRealPosition = null;
net.alphatab.tablature.Tablature.prototype._selectedBeat = null;
net.alphatab.tablature.Tablature.prototype.__class__ = net.alphatab.tablature.Tablature;
net.alphatab.midi.MidiSequenceHandler = function(tracks) { if( tracks === $_ ) return; {
	$s.push("net.alphatab.midi.MidiSequenceHandler::new");
	var $spos = $s.length;
	this.Tracks = tracks;
	this.InfoTrack = 0;
	this.MetronomeTrack = tracks - 1;
	this._commands = new Array();
	$s.pop();
}}
net.alphatab.midi.MidiSequenceHandler.__name__ = ["net","alphatab","midi","MidiSequenceHandler"];
net.alphatab.midi.MidiSequenceHandler.prototype.AddControlChange = function(tick,track,channel,controller,value) {
	$s.push("net.alphatab.midi.MidiSequenceHandler::AddControlChange");
	var $spos = $s.length;
	this.AddEvent(track,tick,net.alphatab.midi.MidiMessageUtils.ControlChange(channel,controller,value));
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.AddEvent = function(track,tick,evt) {
	$s.push("net.alphatab.midi.MidiSequenceHandler::AddEvent");
	var $spos = $s.length;
	var command = (((Std.string(track) + "|") + Std.string(tick)) + "|") + evt;
	this._commands.push(command);
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.AddNoteOff = function(tick,track,channel,note,velocity) {
	$s.push("net.alphatab.midi.MidiSequenceHandler::AddNoteOff");
	var $spos = $s.length;
	this.AddEvent(track,tick,net.alphatab.midi.MidiMessageUtils.NoteOff(channel,note,velocity));
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.AddNoteOn = function(tick,track,channel,note,velocity) {
	$s.push("net.alphatab.midi.MidiSequenceHandler::AddNoteOn");
	var $spos = $s.length;
	this.AddEvent(track,tick,net.alphatab.midi.MidiMessageUtils.NoteOn(channel,note,velocity));
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.AddPitchBend = function(tick,track,channel,value) {
	$s.push("net.alphatab.midi.MidiSequenceHandler::AddPitchBend");
	var $spos = $s.length;
	this.AddEvent(track,tick,net.alphatab.midi.MidiMessageUtils.PitchBend(channel,value));
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.AddProgramChange = function(tick,track,channel,instrument) {
	$s.push("net.alphatab.midi.MidiSequenceHandler::AddProgramChange");
	var $spos = $s.length;
	this.AddEvent(track,tick,net.alphatab.midi.MidiMessageUtils.ProgramChange(channel,instrument));
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.AddTempoInUSQ = function(tick,track,usq) {
	$s.push("net.alphatab.midi.MidiSequenceHandler::AddTempoInUSQ");
	var $spos = $s.length;
	this.AddEvent(track,tick,net.alphatab.midi.MidiMessageUtils.TempoInUSQ(usq));
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.AddTimeSignature = function(tick,track,timeSignature) {
	$s.push("net.alphatab.midi.MidiSequenceHandler::AddTimeSignature");
	var $spos = $s.length;
	this.AddEvent(track,tick,net.alphatab.midi.MidiMessageUtils.TimeSignature(timeSignature));
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.Commands = null;
net.alphatab.midi.MidiSequenceHandler.prototype.InfoTrack = null;
net.alphatab.midi.MidiSequenceHandler.prototype.MetronomeTrack = null;
net.alphatab.midi.MidiSequenceHandler.prototype.NotifyFinish = function() {
	$s.push("net.alphatab.midi.MidiSequenceHandler::NotifyFinish");
	var $spos = $s.length;
	this.Commands = (((((this.Tracks + ";") + this.InfoTrack) + ";") + this.MetronomeTrack) + ";") + this._commands.join(";");
	$s.pop();
}
net.alphatab.midi.MidiSequenceHandler.prototype.Tracks = null;
net.alphatab.midi.MidiSequenceHandler.prototype._commands = null;
net.alphatab.midi.MidiSequenceHandler.prototype.__class__ = net.alphatab.midi.MidiSequenceHandler;
net.alphatab.midi.MidiSequenceParserFlags = function() { }
net.alphatab.midi.MidiSequenceParserFlags.__name__ = ["net","alphatab","midi","MidiSequenceParserFlags"];
net.alphatab.midi.MidiSequenceParserFlags.prototype.__class__ = net.alphatab.midi.MidiSequenceParserFlags;
net.alphatab.file.guitarpro.Gp4Reader = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::new");
	var $spos = $s.length;
	net.alphatab.file.guitarpro.GpReaderBase.apply(this,[["FICHIER GUITAR PRO v4.00","FICHIER GUITAR PRO v4.06","FICHIER GUITAR PRO L4.06"]]);
	$s.pop();
}}
net.alphatab.file.guitarpro.Gp4Reader.__name__ = ["net","alphatab","file","guitarpro","Gp4Reader"];
net.alphatab.file.guitarpro.Gp4Reader.__super__ = net.alphatab.file.guitarpro.GpReaderBase;
for(var k in net.alphatab.file.guitarpro.GpReaderBase.prototype ) net.alphatab.file.guitarpro.Gp4Reader.prototype[k] = net.alphatab.file.guitarpro.GpReaderBase.prototype[k];
net.alphatab.file.guitarpro.Gp4Reader.prototype.GetBeat = function(measure,start) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::GetBeat");
	var $spos = $s.length;
	{
		var _g1 = 0, _g = measure.Beats.length;
		while(_g1 < _g) {
			var b = _g1++;
			var beat = measure.Beats[b];
			if(beat.Start == start) {
				$s.pop();
				return beat;
			}
		}
	}
	var newBeat = this.Factory.NewBeat();
	newBeat.Start = start;
	measure.AddBeat(newBeat);
	{
		$s.pop();
		return newBeat;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.GetTiedNoteValue = function(stringIndex,track) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::GetTiedNoteValue");
	var $spos = $s.length;
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
												{
													var $tmp = note.Value;
													$s.pop();
													return $tmp;
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
	}
	{
		$s.pop();
		return -1;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ParseRepeatAlternative = function(song,measure,value) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ParseRepeatAlternative");
	var $spos = $s.length;
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
	{
		$s.pop();
		return repeatAlternative;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadArtificialHarmonic = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadArtificialHarmonic");
	var $spos = $s.length;
	var type = this.ReadByte();
	var oHarmonic = this.Factory.NewHarmonicEffect();
	oHarmonic.Data = 0;
	switch(type) {
	case 1:{
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Natural);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 3:{
		this.Skip(1);
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Tapped);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 4:{
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Pinch);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 5:{
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Semi);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 15:{
		oHarmonic.Data = 2;
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Artificial);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 17:{
		oHarmonic.Data = 3;
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Artificial);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	case 22:{
		oHarmonic.Data = 0;
		oHarmonic.Type = (net.alphatab.model.effects.GsHarmonicType.Artificial);
		noteEffect.Harmonic = (oHarmonic);
	}break;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadBeat = function(start,measure,track,voiceIndex) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadBeat");
	var $spos = $s.length;
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
		var mixTableChange = this.ReadMixTableChange(measure);
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
	{
		var $tmp = ((!voice.IsEmpty)?duration.Time():0);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadBeatEffects = function(beat,effect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadBeatEffects");
	var $spos = $s.length;
	var flags1 = this.ReadUnsignedByte();
	var flags2 = this.ReadUnsignedByte();
	effect.FadeIn = (((flags1 & 16) != 0));
	effect.BeatVibrato = (((flags1 & 2) != 0)) || effect.BeatVibrato;
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
			beat.Stroke.Direction = net.alphatab.model.GsBeatStrokeDirection.Up;
			beat.Stroke.Value = (this.ToStrokeValue(strokeUp));
		}
		else if(strokeDown > 0) {
			beat.Stroke.Direction = net.alphatab.model.GsBeatStrokeDirection.Down;
			beat.Stroke.Value = (this.ToStrokeValue(strokeDown));
		}
	}
	beat.HasRasgueado = (flags2 & 1) != 0;
	if((flags2 & 2) != 0) {
		beat.PickStroke = this.ReadByte();
		beat.HasPickStroke = true;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadBend = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadBend");
	var $spos = $s.length;
	var bendEffect = this.Factory.NewBendEffect();
	bendEffect.Type = net.alphatab.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	bendEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / 25);
			var vibrato = this.ReadBool();
			bendEffect.Points.push(new net.alphatab.model.effects.GsBendPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) noteEffect.Bend = bendEffect;
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadChannel = function(midiChannel,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadChannel");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadChord = function(stringCount,beat) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadChord");
	var $spos = $s.length;
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
		beat.SetChord(chord);
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadColor = function() {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadColor");
	var $spos = $s.length;
	var r = (this.ReadUnsignedByte());
	var g = this.ReadUnsignedByte();
	var b = (this.ReadUnsignedByte());
	this.Skip(1);
	{
		var $tmp = new net.alphatab.model.GsColor(r,g,b);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadDuration = function(flags) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadDuration");
	var $spos = $s.length;
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
	{
		$s.pop();
		return duration;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadGrace = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadGrace");
	var $spos = $s.length;
	var fret = this.ReadUnsignedByte();
	var dyn = this.ReadUnsignedByte();
	var transition = this.ReadUnsignedByte();
	var duration = this.ReadUnsignedByte();
	var grace = this.Factory.NewGraceEffect();
	grace.Fret = (fret);
	grace.Dynamic = ((15 + (16 * dyn)) - 16);
	grace.Duration = (duration);
	grace.IsDead = fret == 255;
	grace.IsOnBeat = false;
	switch(transition) {
	case 0:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.None;
	}break;
	case 1:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Slide;
	}break;
	case 2:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Bend;
	}break;
	case 3:{
		grace.Transition = net.alphatab.model.effects.GsGraceEffectTransition.Hammer;
	}break;
	}
	noteEffect.Grace = (grace);
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadInfo = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadInfo");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadLyrics = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadLyrics");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadMarker = function(header) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadMarker");
	var $spos = $s.length;
	var marker = this.Factory.NewMarker();
	marker.MeasureHeader = header;
	marker.Title = this.ReadIntSizeCheckByteString();
	marker.Color = this.ReadColor();
	{
		$s.pop();
		return marker;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadMeasure = function(measure,track) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadMeasure");
	var $spos = $s.length;
	var start = measure.Start();
	var beats = this.ReadInt();
	{
		var _g = 0;
		while(_g < beats) {
			var beat = _g++;
			start += this.ReadBeat(start,measure,track,0);
		}
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadMeasureHeader = function(i,timeSignature,song) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadMeasureHeader");
	var $spos = $s.length;
	var flags = this.ReadUnsignedByte();
	var header = this.Factory.NewMeasureHeader();
	header.Number = i + 1;
	header.Start = 0;
	header.Tempo.Value = song.Tempo;
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
	else if(header.Number > 1) {
		header.KeySignature = song.MeasureHeaders[i - 1].KeySignature;
		header.KeySignatureType = song.MeasureHeaders[i - 1].KeySignatureType;
	}
	header.HasDoubleBar = (flags & 128) != 0;
	{
		$s.pop();
		return header;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadMeasureHeaders = function(song,measureCount) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadMeasureHeaders");
	var $spos = $s.length;
	var timeSignature = this.Factory.NewTimeSignature();
	{
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.AddMeasureHeader(this.ReadMeasureHeader(i,timeSignature,song));
		}
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadMeasures = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadMeasures");
	var $spos = $s.length;
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
					header.Tempo.Copy(tempo);
					track.AddMeasure(measure);
					this.ReadMeasure(measure,track);
				}
			}
			tempo.Copy(header.Tempo);
			start += header.Length();
		}
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadMidiChannels = function() {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadMidiChannels");
	var $spos = $s.length;
	var channels = new Array();
	{
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.Factory.NewMidiChannel();
			newChannel.Channel = (i);
			newChannel.EffectChannel = (i);
			newChannel.Instrument(this.ReadInt());
			newChannel.Volume = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Balance = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Chorus = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Reverb = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Phaser = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			newChannel.Tremolo = (net.alphatab.file.guitarpro.GpReaderBase.ToChannelShort(this.ReadByte()));
			channels.push(newChannel);
			this.Skip(2);
		}
	}
	{
		$s.pop();
		return channels;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadMixTableChange = function(measure) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadMixTableChange");
	var $spos = $s.length;
	var tableChange = this.Factory.NewMixTableChange();
	tableChange.Instrument.Value = this.ReadByte();
	tableChange.Volume.Value = this.ReadByte();
	tableChange.Balance.Value = this.ReadByte();
	tableChange.Chorus.Value = this.ReadByte();
	tableChange.Reverb.Value = this.ReadByte();
	tableChange.Phaser.Value = this.ReadByte();
	tableChange.Tremolo.Value = this.ReadByte();
	tableChange.TempoName = "";
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
		measure.GetTempo().Value = tableChange.Tempo.Value;
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
	{
		$s.pop();
		return tableChange;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadNote = function(guitarString,track,effect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadNote");
	var $spos = $s.length;
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
	{
		$s.pop();
		return note;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadNoteEffects = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadNoteEffects");
	var $spos = $s.length;
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
			noteEffect.SlideType = net.alphatab.model.GsSlideType.FastSlideTo;
		}break;
		case 2:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.SlowSlideTo;
		}break;
		case 4:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.OutDownWards;
		}break;
		case 8:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.OutUpWards;
		}break;
		case 16:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.IntoFromBelow;
		}break;
		case 32:{
			noteEffect.SlideType = net.alphatab.model.GsSlideType.IntoFromAbove;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadPageSetup = function(song) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadPageSetup");
	var $spos = $s.length;
	var setup = net.alphatab.model.GsPageSetup.Defaults();
	song.PageSetup = setup;
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadSong = function() {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadSong");
	var $spos = $s.length;
	if(!this.ReadVersion()) {
		throw new net.alphatab.file.FileFormatException("Unsupported Version");
	}
	var song = this.Factory.NewSong();
	this.ReadInfo(song);
	this._tripletFeel = (this.ReadBool()?net.alphatab.model.GsTripletFeel.Eighth:net.alphatab.model.GsTripletFeel.None);
	this.ReadLyrics(song);
	this.ReadPageSetup(song);
	song.TempoName = "";
	song.Tempo = this.ReadInt();
	song.HideTempo = false;
	song.Key = this.ReadInt();
	song.Octave = this.ReadByte();
	var channels = this.ReadMidiChannels();
	var measureCount = this.ReadInt();
	var trackCount = this.ReadInt();
	this.ReadMeasureHeaders(song,measureCount);
	this.ReadTracks(song,trackCount,channels);
	this.ReadMeasures(song);
	{
		$s.pop();
		return song;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadText = function(beat) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadText");
	var $spos = $s.length;
	var text = this.Factory.NewText();
	text.Value = this.ReadIntSizeCheckByteString();
	beat.SetText(text);
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadTrack = function(number,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadTrack");
	var $spos = $s.length;
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
	{
		$s.pop();
		return track;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadTracks = function(song,trackCount,channels) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadTracks");
	var $spos = $s.length;
	var _g1 = 1, _g = trackCount + 1;
	while(_g1 < _g) {
		var i = _g1++;
		song.AddTrack(this.ReadTrack(i,channels));
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadTremoloBar = function(effect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadTremoloBar");
	var $spos = $s.length;
	var barEffect = this.Factory.NewTremoloBarEffect();
	barEffect.Type = net.alphatab.model.effects.GsBendTypesConverter.FromInt(this.ReadByte());
	barEffect.Value = this.ReadInt();
	var pointCount = this.ReadInt();
	{
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round((this.ReadInt() * 12) / 60);
			var pointValue = Math.round(this.ReadInt() / (25 * 2.0));
			var vibrato = this.ReadBool();
			barEffect.Points.push(new net.alphatab.model.effects.GsTremoloBarPoint(pointPosition,pointValue,vibrato));
		}
	}
	if(pointCount > 0) effect.TremoloBar = barEffect;
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadTremoloPicking = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadTremoloPicking");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ReadTrill = function(noteEffect) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ReadTrill");
	var $spos = $s.length;
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
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ToKeySignature = function(p) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ToKeySignature");
	var $spos = $s.length;
	{
		var $tmp = (p < 0?7 + Math.round(Math.abs(p)):p);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype.ToStrokeValue = function(value) {
	$s.push("net.alphatab.file.guitarpro.Gp4Reader::ToStrokeValue");
	var $spos = $s.length;
	switch(value) {
	case 1:{
		{
			$s.pop();
			return 64;
		}
	}break;
	case 2:{
		{
			$s.pop();
			return 64;
		}
	}break;
	case 3:{
		{
			$s.pop();
			return 32;
		}
	}break;
	case 4:{
		{
			$s.pop();
			return 16;
		}
	}break;
	case 5:{
		{
			$s.pop();
			return 8;
		}
	}break;
	case 6:{
		{
			$s.pop();
			return 4;
		}
	}break;
	default:{
		{
			$s.pop();
			return 64;
		}
	}break;
	}
	$s.pop();
}
net.alphatab.file.guitarpro.Gp4Reader.prototype._tripletFeel = null;
net.alphatab.file.guitarpro.Gp4Reader.prototype.__class__ = net.alphatab.file.guitarpro.Gp4Reader;
net.alphatab.platform.js.Html5Canvas = function(dom) { if( dom === $_ ) return; {
	$s.push("net.alphatab.platform.js.Html5Canvas::new");
	var $spos = $s.length;
	this.canvas = dom;
	this.jCanvas = (jQuery(dom));
	this.context = dom.getContext("2d");
	$s.pop();
}}
net.alphatab.platform.js.Html5Canvas.__name__ = ["net","alphatab","platform","js","Html5Canvas"];
net.alphatab.platform.js.Html5Canvas.prototype.Height = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::Height");
	var $spos = $s.length;
	{
		var $tmp = this.jCanvas.height();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.SetHeight = function(height) {
	$s.push("net.alphatab.platform.js.Html5Canvas::SetHeight");
	var $spos = $s.length;
	this.jCanvas.height(height);
	this.canvas.height = height;
	this.context = this.canvas.getContext("2d");
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.SetWidth = function(width) {
	$s.push("net.alphatab.platform.js.Html5Canvas::SetWidth");
	var $spos = $s.length;
	this.jCanvas.width(width);
	this.canvas.width = width;
	this.context = this.canvas.getContext("2d");
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.Width = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::Width");
	var $spos = $s.length;
	{
		var $tmp = this.jCanvas.width();
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.arc = function(x,y,radius,startAngle,endAngle,anticlockwise) {
	$s.push("net.alphatab.platform.js.Html5Canvas::arc");
	var $spos = $s.length;
	this.context.arc(x,y,radius,startAngle,endAngle,anticlockwise);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.arcTo = function(x1,y1,x2,y2,radius) {
	$s.push("net.alphatab.platform.js.Html5Canvas::arcTo");
	var $spos = $s.length;
	this.context.arcTo(x1,y1,x2,y2,radius);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.beginPath = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::beginPath");
	var $spos = $s.length;
	this.context.beginPath();
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.bezierCurveTo = function(cp1x,cp1y,cp2x,cp2y,x,y) {
	$s.push("net.alphatab.platform.js.Html5Canvas::bezierCurveTo");
	var $spos = $s.length;
	this.context.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.canvas = null;
net.alphatab.platform.js.Html5Canvas.prototype.clearRect = function(x,y,w,h) {
	$s.push("net.alphatab.platform.js.Html5Canvas::clearRect");
	var $spos = $s.length;
	this.context.clearRect(x,y,w,h);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.closePath = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::closePath");
	var $spos = $s.length;
	this.context.closePath();
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.context = null;
net.alphatab.platform.js.Html5Canvas.prototype.fill = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::fill");
	var $spos = $s.length;
	this.context.fill();
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.fillRect = function(x,y,w,h) {
	$s.push("net.alphatab.platform.js.Html5Canvas::fillRect");
	var $spos = $s.length;
	this.context.fillRect(x,y,w,h);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.fillStyle = null;
net.alphatab.platform.js.Html5Canvas.prototype.fillText = function(text,x,y,maxWidth) {
	$s.push("net.alphatab.platform.js.Html5Canvas::fillText");
	var $spos = $s.length;
	if(maxWidth == null) maxWidth = 0;
	if(maxWidth == 0) {
		this.context.fillText(text,x,y);
	}
	else {
		this.context.fillText(text,x,y,maxWidth);
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.font = null;
net.alphatab.platform.js.Html5Canvas.prototype.getFillStyle = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::getFillStyle");
	var $spos = $s.length;
	{
		var $tmp = this.context.fillStyle;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.getFont = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::getFont");
	var $spos = $s.length;
	{
		var $tmp = this.context.font;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.getLineWidth = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::getLineWidth");
	var $spos = $s.length;
	{
		var $tmp = this.context.lineWidth;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.getStrokeStyle = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::getStrokeStyle");
	var $spos = $s.length;
	{
		var $tmp = this.context.strokeStyle;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.getTextAlign = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::getTextAlign");
	var $spos = $s.length;
	{
		var $tmp = this.context.textAlign;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.getTextBaseline = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::getTextBaseline");
	var $spos = $s.length;
	{
		var $tmp = this.context.textBaseline;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.jCanvas = null;
net.alphatab.platform.js.Html5Canvas.prototype.lineTo = function(x,y) {
	$s.push("net.alphatab.platform.js.Html5Canvas::lineTo");
	var $spos = $s.length;
	this.context.lineTo(x,y);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.lineWidth = null;
net.alphatab.platform.js.Html5Canvas.prototype.measureText = function(text) {
	$s.push("net.alphatab.platform.js.Html5Canvas::measureText");
	var $spos = $s.length;
	{
		var $tmp = this.context.measureText(text);
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.moveTo = function(x,y) {
	$s.push("net.alphatab.platform.js.Html5Canvas::moveTo");
	var $spos = $s.length;
	this.context.moveTo(x,y);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.quadraticCurveTo = function(cpx,cpy,x,y) {
	$s.push("net.alphatab.platform.js.Html5Canvas::quadraticCurveTo");
	var $spos = $s.length;
	this.context.quadraticCurveTo(cpx,cpy,x,y);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.rect = function(x,y,w,h) {
	$s.push("net.alphatab.platform.js.Html5Canvas::rect");
	var $spos = $s.length;
	this.context.rect(x,y,w,h);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.setFillStyle = function(value) {
	$s.push("net.alphatab.platform.js.Html5Canvas::setFillStyle");
	var $spos = $s.length;
	this.context.fillStyle = value;
	{
		var $tmp = this.context.fillStyle;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.setFont = function(value) {
	$s.push("net.alphatab.platform.js.Html5Canvas::setFont");
	var $spos = $s.length;
	this.context.font = value;
	{
		var $tmp = this.context.font;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.setLineWidth = function(value) {
	$s.push("net.alphatab.platform.js.Html5Canvas::setLineWidth");
	var $spos = $s.length;
	this.context.lineWidth = value;
	{
		var $tmp = this.context.lineWidth;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.setStrokeStyle = function(value) {
	$s.push("net.alphatab.platform.js.Html5Canvas::setStrokeStyle");
	var $spos = $s.length;
	this.context.strokeStyle = value;
	{
		var $tmp = this.context.strokeStyle;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.setTextAlign = function(value) {
	$s.push("net.alphatab.platform.js.Html5Canvas::setTextAlign");
	var $spos = $s.length;
	this.context.textAlign = value;
	{
		var $tmp = this.context.textAling;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.setTextBaseline = function(value) {
	$s.push("net.alphatab.platform.js.Html5Canvas::setTextBaseline");
	var $spos = $s.length;
	this.context.textBaseline = value;
	{
		var $tmp = this.context.textBaseLine;
		$s.pop();
		return $tmp;
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.stroke = function() {
	$s.push("net.alphatab.platform.js.Html5Canvas::stroke");
	var $spos = $s.length;
	this.context.stroke();
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.strokeRect = function(x,y,w,h) {
	$s.push("net.alphatab.platform.js.Html5Canvas::strokeRect");
	var $spos = $s.length;
	this.context.strokeRect(x,y,w,h);
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.strokeStyle = null;
net.alphatab.platform.js.Html5Canvas.prototype.strokeText = function(text,x,y,maxWidth) {
	$s.push("net.alphatab.platform.js.Html5Canvas::strokeText");
	var $spos = $s.length;
	if(maxWidth == null) maxWidth = 0;
	if(maxWidth == 0) {
		this.context.strokeText(text,x,y);
	}
	else {
		this.context.strokeText(text,x,y,maxWidth);
	}
	$s.pop();
}
net.alphatab.platform.js.Html5Canvas.prototype.textAlign = null;
net.alphatab.platform.js.Html5Canvas.prototype.textBaseline = null;
net.alphatab.platform.js.Html5Canvas.prototype.__class__ = net.alphatab.platform.js.Html5Canvas;
net.alphatab.platform.js.Html5Canvas.__interfaces__ = [net.alphatab.platform.Canvas];
net.alphatab.model.GsBeatStroke = function(p) { if( p === $_ ) return; {
	$s.push("net.alphatab.model.GsBeatStroke::new");
	var $spos = $s.length;
	this.Direction = net.alphatab.model.GsBeatStrokeDirection.None;
	$s.pop();
}}
net.alphatab.model.GsBeatStroke.__name__ = ["net","alphatab","model","GsBeatStroke"];
net.alphatab.model.GsBeatStroke.prototype.Direction = null;
net.alphatab.model.GsBeatStroke.prototype.GetIncrementTime = function(beat) {
	$s.push("net.alphatab.model.GsBeatStroke::GetIncrementTime");
	var $spos = $s.length;
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
			{
				var $tmp = Math.round(((duration / 8.0) * (4.0 / this.Value)));
				$s.pop();
				return $tmp;
			}
		}
	}
	{
		$s.pop();
		return 0;
	}
	$s.pop();
}
net.alphatab.model.GsBeatStroke.prototype.Value = null;
net.alphatab.model.GsBeatStroke.prototype.__class__ = net.alphatab.model.GsBeatStroke;
$Main = function() { }
$Main.__name__ = ["@Main"];
$Main.prototype.__class__ = $Main;
$_ = {}
js.Boot.__res = {}
$s = [];
$e = [];
js.Boot.__init();
{
	js.Lib.document = document;
	js.Lib.window = window;
	onerror = function(msg,url,line) {
		var stack = $s.copy();
		var f = js.Lib.onerror;
		$s.splice(0,$s.length);
		if( f == null ) {
			var i = stack.length;
			var s = "";
			while( --i >= 0 )
				s += "Called from "+stack[i]+"\n";
			alert(msg+"\n\n"+s);
			return false;
		}
		return f(msg,stack);
	}
}
{
	Date.now = function() {
		$s.push("@Main::new@124");
		var $spos = $s.length;
		{
			var $tmp = new Date();
			$s.pop();
			return $tmp;
		}
		$s.pop();
	}
	Date.fromTime = function(t) {
		$s.push("@Main::new@127");
		var $spos = $s.length;
		var d = new Date();
		d["setTime"](t);
		{
			$s.pop();
			return d;
		}
		$s.pop();
	}
	Date.fromString = function(s) {
		$s.push("@Main::new@136");
		var $spos = $s.length;
		switch(s.length) {
		case 8:{
			var k = s.split(":");
			var d = new Date();
			d["setTime"](0);
			d["setUTCHours"](k[0]);
			d["setUTCMinutes"](k[1]);
			d["setUTCSeconds"](k[2]);
			{
				$s.pop();
				return d;
			}
		}break;
		case 10:{
			var k = s.split("-");
			{
				var $tmp = new Date(k[0],k[1] - 1,k[2],0,0,0);
				$s.pop();
				return $tmp;
			}
		}break;
		case 19:{
			var k = s.split(" ");
			var y = k[0].split("-");
			var t = k[1].split(":");
			{
				var $tmp = new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
				$s.pop();
				return $tmp;
			}
		}break;
		default:{
			throw "Invalid date format : " + s;
		}break;
		}
		$s.pop();
	}
	Date.prototype["toString"] = function() {
		$s.push("@Main::new@165");
		var $spos = $s.length;
		var date = this;
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var mi = date.getMinutes();
		var s = date.getSeconds();
		{
			var $tmp = (((((((((date.getFullYear() + "-") + ((m < 10?"0" + m:"" + m))) + "-") + ((d < 10?"0" + d:"" + d))) + " ") + ((h < 10?"0" + h:"" + h))) + ":") + ((mi < 10?"0" + mi:"" + mi))) + ":") + ((s < 10?"0" + s:"" + s));
			$s.pop();
			return $tmp;
		}
		$s.pop();
	}
	Date.prototype.__class__ = Date;
	Date.__name__ = ["Date"];
}
{
	Math.NaN = Number["NaN"];
	Math.NEGATIVE_INFINITY = Number["NEGATIVE_INFINITY"];
	Math.POSITIVE_INFINITY = Number["POSITIVE_INFINITY"];
	Math.isFinite = function(i) {
		$s.push("@Main::new@73");
		var $spos = $s.length;
		{
			var $tmp = isFinite(i);
			$s.pop();
			return $tmp;
		}
		$s.pop();
	}
	Math.isNaN = function(i) {
		$s.push("@Main::new@85");
		var $spos = $s.length;
		{
			var $tmp = isNaN(i);
			$s.pop();
			return $tmp;
		}
		$s.pop();
	}
	Math.__name__ = ["Math"];
}
{
	js["XMLHttpRequest"] = (window.XMLHttpRequest?XMLHttpRequest:(window.ActiveXObject?function() {
		$s.push("@Main::new@53");
		var $spos = $s.length;
		try {
			{
				var $tmp = new ActiveXObject("Msxml2.XMLHTTP");
				$s.pop();
				return $tmp;
			}
		}
		catch( $e34 ) {
			{
				var e = $e34;
				{
					$e = [];
					while($s.length >= $spos) $e.unshift($s.pop());
					$s.push($e[0]);
					try {
						{
							var $tmp = new ActiveXObject("Microsoft.XMLHTTP");
							$s.pop();
							return $tmp;
						}
					}
					catch( $e35 ) {
						{
							var e1 = $e35;
							{
								$e = [];
								while($s.length >= $spos) $e.unshift($s.pop());
								$s.push($e[0]);
								throw "Unable to create XMLHttpRequest object.";
							}
						}
					}
				}
			}
		}
		$s.pop();
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
net.alphatab.file.guitarpro.GpReaderBase.DefaultCharset = "UTF-8";
net.alphatab.file.guitarpro.GpReaderBase.BendPosition = 60;
net.alphatab.file.guitarpro.GpReaderBase.BendSemitone = 25;
net.alphatab.model.GsHeaderFooterElements.None = 0;
net.alphatab.model.GsHeaderFooterElements.Title = 1;
net.alphatab.model.GsHeaderFooterElements.Subtitle = 2;
net.alphatab.model.GsHeaderFooterElements.Artist = 4;
net.alphatab.model.GsHeaderFooterElements.Album = 8;
net.alphatab.model.GsHeaderFooterElements.Words = 16;
net.alphatab.model.GsHeaderFooterElements.Music = 32;
net.alphatab.model.GsHeaderFooterElements.WordsAndMusic = 64;
net.alphatab.model.GsHeaderFooterElements.Copyright = 128;
net.alphatab.model.GsHeaderFooterElements.PageNumber = 256;
net.alphatab.model.GsHeaderFooterElements.All = 511;
net.alphatab.model.GsMeasure.DefaultClef = net.alphatab.model.GsMeasureClef.Treble;
net.alphatab.model.GsLyrics.MaxLineCount = 5;
net.alphatab.model.GsLyrics.Regex = " ";
net.alphatab.file.alphatab.AlphaTabParser.EOL = String.fromCharCode(0);
net.alphatab.file.alphatab.AlphaTabParser.TrackChannels = [0,1];
net.alphatab.model.effects.GsHarmonicEffect.NaturalFrequencies = (function($this) {
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
net.alphatab.model.GsMeasureHeader.DefaultKeySignature = 0;
net.alphatab.tablature.model.GsMeasureHeaderImpl.DefaultTimeSignatureSpacing = 30;
net.alphatab.tablature.model.GsMeasureHeaderImpl.DefaultLeftSpacing = 15;
net.alphatab.tablature.model.GsMeasureHeaderImpl.DefaultRightSpacing = 15;
net.alphatab.model.effects.GsBendPoint.SemiToneLength = 1;
net.alphatab.model.effects.GsBendPoint.MaxPositionLength = 12;
net.alphatab.model.effects.GsBendPoint.MaxValueLength = 12;
js.Lib.onerror = null;
net.alphatab.midi.MidiMessageUtils.TickMove = 1;
net.alphatab.model.GsMidiChannel.DefaultPercussionChannel = 9;
net.alphatab.model.GsMidiChannel.DefaultInstrument = 25;
net.alphatab.model.GsMidiChannel.DefaultVolume = 127;
net.alphatab.model.GsMidiChannel.DefaultBalance = 64;
net.alphatab.model.GsMidiChannel.DefaultChorus = 0;
net.alphatab.model.GsMidiChannel.DefaultReverb = 0;
net.alphatab.model.GsMidiChannel.DefaultPhaser = 0;
net.alphatab.model.GsMidiChannel.DefaultTremolo = 0;
net.alphatab.tablature.model.GsChordImpl.MaxFrets = 6;
net.alphatab.tablature.PageViewLayout.PagePadding = new net.alphatab.model.Padding(20,40,20,40);
net.alphatab.tablature.PageViewLayout.WidthOn100 = 795;
net.alphatab.tablature.model.BeatGroup.ScoreMiddleKeys = [55,40,40,50];
net.alphatab.tablature.model.BeatGroup.ScoreSharpPositions = [7,7,6,6,5,4,4,3,3,2,2,1];
net.alphatab.tablature.model.BeatGroup.ScoreFlatPositions = [7,6,6,5,5,4,3,3,2,2,1,1];
net.alphatab.tablature.model.BeatGroup.UpOffset = 28;
net.alphatab.tablature.model.BeatGroup.DownOffset = 35;
net.alphatab.model.GsDuration.QuarterTime = 960;
net.alphatab.model.GsDuration.Whole = 1;
net.alphatab.model.GsDuration.Half = 2;
net.alphatab.model.GsDuration.Quarter = 4;
net.alphatab.model.GsDuration.Eighth = 8;
net.alphatab.model.GsDuration.Sixteenth = 16;
net.alphatab.model.GsDuration.ThirtySecond = 32;
net.alphatab.model.GsDuration.SixtyFourth = 64;
net.alphatab.model.GsTriplet.Normal = new net.alphatab.model.GsTriplet();
net.alphatab.midi.MidiController.AllNotesOff = 123;
net.alphatab.midi.MidiController.Balance = 10;
net.alphatab.midi.MidiController.Chorus = 93;
net.alphatab.midi.MidiController.DataEntryLsb = 38;
net.alphatab.midi.MidiController.DataEntryMsb = 6;
net.alphatab.midi.MidiController.Expression = 11;
net.alphatab.midi.MidiController.Phaser = 95;
net.alphatab.midi.MidiController.Reverb = 91;
net.alphatab.midi.MidiController.RpnLsb = 100;
net.alphatab.midi.MidiController.RpnMsb = 101;
net.alphatab.midi.MidiController.Tremolo = 92;
net.alphatab.midi.MidiController.Volume = 7;
net.alphatab.tablature.model.GsMeasureImpl.Natural = 1;
net.alphatab.tablature.model.GsMeasureImpl.Sharp = 2;
net.alphatab.tablature.model.GsMeasureImpl.Flat = 3;
net.alphatab.tablature.model.GsMeasureImpl.KeySignatures = (function($this) {
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
net.alphatab.tablature.model.GsMeasureImpl.AccidentalSharpNotes = [0,0,1,1,2,3,3,4,4,5,5,6];
net.alphatab.tablature.model.GsMeasureImpl.AccidentalFlatNotes = [0,1,1,2,2,3,4,4,5,5,6,6];
net.alphatab.tablature.model.GsMeasureImpl.AccidentalNotes = [false,true,false,true,false,false,true,false,true,false,true,false];
net.alphatab.tablature.model.GsMeasureImpl.ScoreKeyOffsets = [30,18,22,24];
net.alphatab.tablature.model.GsMeasureImpl.ScoreKeySharpPositions = [1,4,0,3,6,2,5];
net.alphatab.tablature.model.GsMeasureImpl.ScoreKeyFlatPositions = [5,2,6,3,0,4,1];
net.alphatab.tablature.model.GsMeasureImpl.DefaultClefSpacing = 40;
net.alphatab.tablature.model.GsMeasureImpl.DefaultQuarterSpacing = 30;
net.alphatab.model.GsVelocities.MinVelocity = 15;
net.alphatab.model.GsVelocities.VelocityIncrement = 16;
net.alphatab.model.GsVelocities.PianoPianissimo = 15;
net.alphatab.model.GsVelocities.Pianissimo = 31;
net.alphatab.model.GsVelocities.Piano = 47;
net.alphatab.model.GsVelocities.MezzoPiano = 63;
net.alphatab.model.GsVelocities.MezzoForte = 79;
net.alphatab.model.GsVelocities.Forte = 95;
net.alphatab.model.GsVelocities.Fortissimo = 111;
net.alphatab.model.GsVelocities.ForteFortissimo = 127;
net.alphatab.model.GsVelocities.Default = 95;
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
net.alphatab.tablature.drawing.MusicFont.TrillUpEigth = "";
net.alphatab.tablature.drawing.MusicFont.TrillUpSixteenth = "";
net.alphatab.tablature.drawing.MusicFont.TrillUpThirtySecond = "";
net.alphatab.tablature.drawing.MusicFont.TrillDownEigth = "";
net.alphatab.tablature.drawing.MusicFont.TrillDownSixteenth = "";
net.alphatab.tablature.drawing.MusicFont.TrillDownThirtySecond = "";
net.alphatab.tablature.drawing.MusicFont.AccentuatedNote = "";
net.alphatab.tablature.drawing.MusicFont.HeavyAccentuatedNote = "";
net.alphatab.tablature.drawing.MusicFont.VibratoLeftRight = "M 11.189664 5.5813955 C 10.10042 6.6529925 9.0866079 7.8051485 7.9314969 8.8066518 7.3487624 9.2967324 6.9841837 8.2593759 6.5479642 7.933765 5.3603051 6.6227434 4.1788808 5.3060572 2.9839103 4.0016785 2.4141734 4.2259972 1.9952232 4.7304065 1.5349527 5.1288 1.0233018 5.6160865 0.51165092 6.103373 0 6.5906595 0.02274972 6.160458 -0.04553929 5.6912893 0.03419799 5.2854802 1.785601 3.626446 3.5133126 1.9409459 5.2808081 0.29990223 5.9337936 -0.41168007 6.3974122 0.74155913 6.9193185 1.1024218 7.9923085 2.214522 8.9943764 3.397406 10.136519 4.4404885 11.34214 3.5295603 12.361477 2.390267 13.467265 1.3582751 13.894892 0.90129843 14.403874 0.54274353 14.87567 0.14014753 c 0.539444 0.2262104 0.808667 0.8228694 1.216989 1.22764897 0.810291 0.9092409 1.559001 1.8768682 2.414167 2.7435845 0.451921 0.7154056 1.076971 0.8743839 1.612628 0.1426133 0.588046 -0.6297642 1.154229 -1.2811423 1.733301 -1.9197948 -0.02227 0.4454016 0.0445 0.9274384 -0.03326 1.3500134 C 20.278271 5.2264473 18.762755 6.7979455 17.205479 8.3219033 16.781477 8.8560595 16.088361 9.2926227 15.653023 8.5089189 14.456919 7.283733 13.392959 5.9331751 12.155046 4.7476565 11.73232 4.8662391 11.53755 5.345741 11.189664 5.5813955 z";
net.alphatab.model.GsBeat.MaxVoices = 2;
net.alphatab.model.effects.GsTremoloBarEffect.MaxPositionLength = 12;
net.alphatab.model.effects.GsTremoloBarEffect.MaxValueLength = 12;
net.alphatab.model.GsColor.Black = new net.alphatab.model.GsColor(0,0,0);
net.alphatab.model.GsColor.Red = new net.alphatab.model.GsColor(255,0,0);
net.alphatab.model.GsMarker.DefaultColor = new net.alphatab.model.GsColor(255,0,0);
net.alphatab.model.GsMarker.DefaultTitle = "Untitled";
net.alphatab.model.effects.GsBendEffect.SemitoneLength = 1;
net.alphatab.model.effects.GsBendEffect.MaxPositionLength = 12;
net.alphatab.model.effects.GsBendEffect.MaxValueLength = 12;
net.alphatab.model.GsPageSetup._defaults = null;
net.alphatab.model.effects.GsTremoloBarPoint.SemiToneLength = 1;
net.alphatab.model.effects.GsTremoloBarPoint.MaxPositionLength = 12;
net.alphatab.model.effects.GsTremoloBarPoint.MaxValueLength = 12;
net.alphatab.midi.MidiSequenceParser.DefaultBend = 64;
net.alphatab.midi.MidiSequenceParser.DefaultBendSemiTone = 2.75;
net.alphatab.midi.MidiSequenceParser.DefaultDurationDead = 30;
net.alphatab.midi.MidiSequenceParser.DefaultDurationPm = 80;
net.alphatab.midi.MidiSequenceParser.DefaultMetronomeKey = 37;
net.alphatab.midi.MidiSequenceParserFlags.AddDefaultControls = 1;
net.alphatab.midi.MidiSequenceParserFlags.AddMixerMessages = 2;
net.alphatab.midi.MidiSequenceParserFlags.AddMetronome = 4;
net.alphatab.midi.MidiSequenceParserFlags.AddFirstTickMove = 8;
net.alphatab.midi.MidiSequenceParserFlags.DefaultPlayFlags = 15;
$Main.init = net.alphatab.Main.main();
