(function () { "use strict";
var $estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,matched: function(n) {
		return this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
			var $r;
			throw "EReg::matched";
			return $r;
		}(this));
	}
	,match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,__class__: EReg
}
var HxOverrides = function() { }
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
}
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
}
HxOverrides.remove = function(a,obj) {
	var i = 0;
	var l = a.length;
	while(i < l) {
		if(a[i] == obj) {
			a.splice(i,1);
			return true;
		}
		i++;
	}
	return false;
}
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
}
var Lambda = function() { }
Lambda.__name__ = true;
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
}
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,__class__: List
}
var IMap = function() { }
IMap.__name__ = true;
var Std = function() { }
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	addSub: function(s,pos,len) {
		this.b += len == null?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len);
	}
	,__class__: StringBuf
}
var StringTools = function() { }
StringTools.__name__ = true;
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
}
var Type = function() { }
Type.__name__ = true;
Type.getEnumConstructs = function(e) {
	var a = e.__constructs__;
	return a.slice();
}
var XmlType = { __ename__ : true, __constructs__ : [] }
var Xml = function() {
};
Xml.__name__ = true;
Xml.parse = function(str) {
	return haxe.xml.Parser.parse(str);
}
Xml.createElement = function(name) {
	var r = new Xml();
	r.nodeType = Xml.Element;
	r._children = new Array();
	r._attributes = new haxe.ds.StringMap();
	r.set_nodeName(name);
	return r;
}
Xml.createPCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.PCData;
	r.set_nodeValue(data);
	return r;
}
Xml.createCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.CData;
	r.set_nodeValue(data);
	return r;
}
Xml.createComment = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Comment;
	r.set_nodeValue(data);
	return r;
}
Xml.createDocType = function(data) {
	var r = new Xml();
	r.nodeType = Xml.DocType;
	r.set_nodeValue(data);
	return r;
}
Xml.createProcessingInstruction = function(data) {
	var r = new Xml();
	r.nodeType = Xml.ProcessingInstruction;
	r.set_nodeValue(data);
	return r;
}
Xml.createDocument = function() {
	var r = new Xml();
	r.nodeType = Xml.Document;
	r._children = new Array();
	return r;
}
Xml.prototype = {
	addChild: function(x) {
		if(this._children == null) throw "bad nodetype";
		if(x._parent != null) HxOverrides.remove(x._parent._children,x);
		x._parent = this;
		this._children.push(x);
	}
	,firstElement: function() {
		if(this._children == null) throw "bad nodetype";
		var cur = 0;
		var l = this._children.length;
		while(cur < l) {
			var n = this._children[cur];
			if(n.nodeType == Xml.Element) return n;
			cur++;
		}
		return null;
	}
	,elementsNamed: function(name) {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				if(n.nodeType == Xml.Element && n._nodeName == name) break;
				k++;
			}
			this.cur = k;
			return k < l;
		}, next : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				k++;
				if(n.nodeType == Xml.Element && n._nodeName == name) {
					this.cur = k;
					return n;
				}
			}
			return null;
		}};
	}
	,elements: function() {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				if(this.x[k].nodeType == Xml.Element) break;
				k += 1;
			}
			this.cur = k;
			return k < l;
		}, next : function() {
			var k = this.cur;
			var l = this.x.length;
			while(k < l) {
				var n = this.x[k];
				k += 1;
				if(n.nodeType == Xml.Element) {
					this.cur = k;
					return n;
				}
			}
			return null;
		}};
	}
	,iterator: function() {
		if(this._children == null) throw "bad nodetype";
		return { cur : 0, x : this._children, hasNext : function() {
			return this.cur < this.x.length;
		}, next : function() {
			return this.x[this.cur++];
		}};
	}
	,exists: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.exists(att);
	}
	,set: function(att,value) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		this._attributes.set(att,value);
	}
	,get: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.get(att);
	}
	,set_nodeValue: function(v) {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue = v;
	}
	,get_nodeValue: function() {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue;
	}
	,set_nodeName: function(n) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName = n;
	}
	,get_nodeName: function() {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName;
	}
	,__class__: Xml
}
var alphatab = {}
alphatab.Main = function() { }
alphatab.Main.__name__ = true;
alphatab.Main.main = function() {
}
alphatab.file = {}
alphatab.file.FileFormatException = function(message) {
	this.message = message;
};
alphatab.file.FileFormatException.__name__ = true;
alphatab.file.FileFormatException.prototype = {
	__class__: alphatab.file.FileFormatException
}
alphatab.file.SongLoader = function() { }
alphatab.file.SongLoader.__name__ = true;
alphatab.file.SongLoader.loadSong = function(url,factory,success) {
	var loader = alphatab.platform.PlatformFactory.getLoader();
	if(loader == null) throw "No file loader for you platform found";
	loader.loadBinary("GET",url,function(data) {
		var readers = alphatab.file.SongReader.availableReaders();
		var _g = 0;
		while(_g < readers.length) {
			var reader = readers[_g];
			++_g;
			try {
				data.seek(0);
				reader.init(data,factory);
				var song = reader.readSong();
				alphatab.file.SongReader.finalize(song);
				success(song);
				return;
			} catch( e ) {
				if( js.Boot.__instanceof(e,alphatab.file.FileFormatException) ) {
					continue;
				} else throw(e);
			}
		}
		data.close();
		throw new alphatab.file.FileFormatException("No reader for requested file found");
	},function(err) {
		throw err;
	});
}
alphatab.file.SongReader = function() {
};
alphatab.file.SongReader.__name__ = true;
alphatab.file.SongReader.availableReaders = function() {
	var d = new Array();
	d.push(new alphatab.file.gpx.GpxReader());
	d.push(new alphatab.file.guitarpro.Gp5Reader());
	d.push(new alphatab.file.guitarpro.Gp4Reader());
	d.push(new alphatab.file.guitarpro.Gp3Reader());
	d.push(new alphatab.file.musicxml.MusicXmlReader());
	return d;
}
alphatab.file.SongReader.finalize = function(song) {
	var controller = new alphatab.midi.MidiRepeatController(song);
	var start = alphatab.model.Duration.QUARTER_TIME;
	while(!controller.finished()) {
		var header = song.measureHeaders[controller.index];
		controller.process();
		if(header.realStart < 0) header.realStart = start;
		if(controller.shouldPlay) start += header.length();
	}
}
alphatab.file.SongReader.prototype = {
	getTiedNoteValue: function(stringIndex,track) {
		var measureCount = track.measureCount();
		if(measureCount > 0) {
			var _g = 0;
			while(_g < measureCount) {
				var m2 = _g++;
				var m = measureCount - 1 - m2;
				var measure = track.measures[m];
				var _g2 = 0, _g1 = measure.beats.length;
				while(_g2 < _g1) {
					var b2 = _g2++;
					var b = measure.beats.length - 1 - b2;
					var beat = measure.beats[b];
					var _g4 = 0, _g3 = beat.voices.length;
					while(_g4 < _g3) {
						var v = _g4++;
						var voice = beat.voices[v];
						if(!voice.isEmpty) {
							var _g6 = 0, _g5 = voice.notes.length;
							while(_g6 < _g5) {
								var n = _g6++;
								var note = voice.notes[n];
								if(note.string == stringIndex) return note.value;
							}
						}
					}
				}
			}
		}
		return -1;
	}
	,readSong: function() {
		return this.factory.newSong();
	}
	,init: function(data,factory) {
		this.data = data;
		this.factory = factory;
	}
	,newString: function(number,value) {
		var str = this.factory.newString();
		str.number = number;
		str.value = value;
		return str;
	}
	,createDefaultStrings: function(list) {
		list.push(this.newString(1,64));
		list.push(this.newString(2,59));
		list.push(this.newString(3,55));
		list.push(this.newString(4,50));
		list.push(this.newString(5,45));
		list.push(this.newString(6,40));
	}
	,__class__: alphatab.file.SongReader
}
alphatab.file.alphatex = {}
alphatab.file.alphatex.AlphaTexParser = function() {
	alphatab.file.SongReader.call(this);
};
alphatab.file.alphatex.AlphaTexParser.__name__ = true;
alphatab.file.alphatex.AlphaTexParser.isLetter = function(ch) {
	var code = HxOverrides.cca(ch,0);
	return !alphatab.file.alphatex.AlphaTexParser.isTerminal(ch) && (code >= 33 && code <= 47 || code >= 58 && code <= 126 || code > 128);
}
alphatab.file.alphatex.AlphaTexParser.isTerminal = function(ch) {
	return ch == "." || ch == "{" || ch == "}" || ch == "[" || ch == "]" || ch == "(" || ch == ")" || ch == "|" || ch == "'" || ch == "\"" || ch == "\\";
}
alphatab.file.alphatex.AlphaTexParser.__super__ = alphatab.file.SongReader;
alphatab.file.alphatex.AlphaTexParser.prototype = $extend(alphatab.file.SongReader.prototype,{
	readNumber: function() {
		var str = "";
		do {
			str += this._ch;
			this.nextChar();
		} while(this.isDigit(this._ch));
		return Std.parseInt(str);
	}
	,readName: function() {
		var str = "";
		do {
			str += this._ch;
			this.nextChar();
		} while(alphatab.file.alphatex.AlphaTexParser.isLetter(this._ch) || this.isDigit(this._ch));
		return str;
	}
	,isDigit: function(ch) {
		var code = HxOverrides.cca(ch,0);
		return code >= 48 && code <= 57 || ch == "-" && this._allowNegatives;
	}
	,newSy: function() {
		this._sy = alphatab.file.alphatex.AlphaTexSymbols.No;
		do if(this._ch == alphatab.file.alphatex.AlphaTexParser.EOL) this._sy = alphatab.file.alphatex.AlphaTexSymbols.Eof; else if(this._ch == " " || this._ch == "\n" || this._ch == "\r" || this._ch == "\t") this.nextChar(); else if(this._ch == "\"" || this._ch == "'") {
			this.nextChar();
			this._syData = "";
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.String;
			while(this._ch != "\"" && this._ch != "'" && this._ch != alphatab.file.alphatex.AlphaTexParser.EOL) {
				this._syData += this._ch;
				this.nextChar();
			}
			this.nextChar();
		} else if(this._ch == "-") {
			if(this._allowNegatives && this.isDigit(this._ch)) {
				var number = this.readNumber();
				this._sy = alphatab.file.alphatex.AlphaTexSymbols.Number;
				this._syData = number;
			} else {
				this._sy = alphatab.file.alphatex.AlphaTexSymbols.String;
				this._syData = this.readName();
			}
		} else if(this._ch == ".") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.Dot;
			this.nextChar();
		} else if(this._ch == ":") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.DoubleDot;
			this.nextChar();
		} else if(this._ch == "(") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.LParensis;
			this.nextChar();
		} else if(this._ch == "\\") {
			this.nextChar();
			var name = this.readName();
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.MetaCommand;
			this._syData = name;
		} else if(this._ch == ")") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.RParensis;
			this.nextChar();
		} else if(this._ch == "{") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.LBrace;
			this.nextChar();
		} else if(this._ch == "}") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.RBrace;
			this.nextChar();
		} else if(this._ch == "|") {
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.Pipe;
			this.nextChar();
		} else if(this.isDigit(this._ch)) {
			var number = this.readNumber();
			this._sy = alphatab.file.alphatex.AlphaTexSymbols.Number;
			this._syData = number;
		} else if(alphatab.file.alphatex.AlphaTexParser.isLetter(this._ch)) {
			var name = this.readName();
			if(alphatab.model.Tuning.isTuning(name)) {
				this._sy = alphatab.file.alphatex.AlphaTexSymbols.Tuning;
				this._syData = name.toLowerCase();
			} else {
				this._sy = alphatab.file.alphatex.AlphaTexSymbols.String;
				this._syData = name;
			}
		} else this.error("symbol",alphatab.file.alphatex.AlphaTexSymbols.String,false); while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.No);
	}
	,nextChar: function() {
		this._ch = this._curChPos < this.data.length()?this.data.readChar():alphatab.file.alphatex.AlphaTexParser.EOL;
		this._curChPos++;
	}
	,parseTuning: function(str) {
		var tuning = alphatab.model.Tuning.getTuningForText(str);
		if(tuning < 0) this.error("tuning-value",alphatab.file.alphatex.AlphaTexSymbols.String,false);
		return tuning;
	}
	,parseKeySignature: function(str) {
		var _g = str.toLowerCase();
		switch(_g) {
		case "cb":
			return -7;
		case "gb":
			return -6;
		case "db":
			return -5;
		case "ab":
			return -4;
		case "eb":
			return -3;
		case "bb":
			return -2;
		case "f":
			return -1;
		case "c":
			return 0;
		case "g":
			return 1;
		case "d":
			return 2;
		case "a":
			return 3;
		case "e":
			return 4;
		case "b":
			return 5;
		case "f#":
			return 6;
		case "c#":
			return 7;
		default:
			return 0;
		}
	}
	,parseClef: function(str) {
		var _g = str.toLowerCase();
		switch(_g) {
		case "treble":
			return 0;
		case "bass":
			return 1;
		case "tenor":
			return 2;
		case "alto":
			return 3;
		default:
			return 0;
		}
	}
	,noteEffects: function(beat,effect) {
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.LBrace) return;
		this.newSy();
		while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
			this._syData = Std.string(this._syData).toLowerCase();
			if(this._syData == "b") {
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.LParensis) this.error("bend-effect",alphatab.file.alphatex.AlphaTexSymbols.LParensis);
				this.newSy();
				var points = new Array();
				while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) {
					if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("bend-effect-value",alphatab.file.alphatex.AlphaTexSymbols.Number);
					points.push(new alphatab.model.effects.BendPoint(0,Math.abs(this._syData),false));
					this.newSy();
				}
				if(points.length > 12) points = points.slice(0,12);
				var count = points.length;
				var step = Math.floor(12 / count);
				var i = 0;
				var bendEffect = this.factory.newBendEffect();
				while(i < count) {
					points[i].position = Math.floor(Math.min(12,i * step));
					bendEffect.points.push(points[i]);
					i++;
				}
				effect.bend = bendEffect;
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis) this.error("bend-effect",alphatab.file.alphatex.AlphaTexSymbols.RParensis);
				this.newSy();
			} else if(this._syData == "nh") {
				var harmonicEffect = this.factory.newHarmonicEffect();
				harmonicEffect.type = 0;
				effect.harmonic = harmonicEffect;
				this.newSy();
			} else if(this._syData == "ah") {
				var harmonicEffect = this.factory.newHarmonicEffect();
				harmonicEffect.type = 1;
				effect.harmonic = harmonicEffect;
				this.newSy();
			} else if(this._syData == "th") {
				var harmonicEffect = this.factory.newHarmonicEffect();
				harmonicEffect.type = 2;
				effect.harmonic = harmonicEffect;
				this.newSy();
			} else if(this._syData == "ph") {
				var harmonicEffect = this.factory.newHarmonicEffect();
				harmonicEffect.type = 3;
				effect.harmonic = harmonicEffect;
				this.newSy();
			} else if(this._syData == "sh") {
				var harmonicEffect = this.factory.newHarmonicEffect();
				harmonicEffect.type = 4;
				effect.harmonic = harmonicEffect;
				this.newSy();
			} else if(this._syData == "gr") {
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number && !(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String && Std.string(this._syData).toLowerCase() == "x")) this.error("grace-effect-fret",alphatab.file.alphatex.AlphaTexSymbols.Number);
				var isDead = Std.string(this._syData).toLowerCase() == "x";
				var fret = isDead?0:this._syData;
				this.newSy();
				var duration = 16;
				if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
					if(this._syData != 16 && this._syData != 32 && this._syData != 64) this._syData = 16;
					duration = this._syData;
					this.newSy();
				}
				var transition = 0;
				if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
					if(this._syData == "s") {
						transition = 1;
						this.newSy();
					} else if(this._syData == "b") {
						transition = 2;
						this.newSy();
					} else if(this._syData == "h") {
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
			} else if(this._syData == "tr") {
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("trill-effect",alphatab.file.alphatex.AlphaTexSymbols.Number);
				var fret = this._syData;
				this.newSy();
				var duration = 16;
				if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
					if(this._syData != 16 && this._syData != 32 && this._syData != 64) this._syData = 16;
					duration = this._syData;
					this.newSy();
				}
				var trillEffect = this.factory.newTrillEffect();
				trillEffect.duration.value = duration;
				trillEffect.fret = fret;
				effect.trill = trillEffect;
			} else if(this._syData == "tp") {
				this.newSy();
				var duration = 8;
				if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
					if(this._syData != 8 && this._syData != 16 && this._syData != 32) this._syData = 8;
					duration = this._syData;
					this.newSy();
				}
				var tremoloPicking = this.factory.newTremoloPickingEffect();
				tremoloPicking.duration.value = duration;
				effect.tremoloPicking = tremoloPicking;
			} else if(this._syData == "v") {
				this.newSy();
				effect.vibrato = true;
			} else if(this._syData == "sl") {
				this.newSy();
				effect.slide = true;
				effect.slideType = 0;
			} else if(this._syData == "ss") {
				this.newSy();
				effect.slide = true;
				effect.slideType = 1;
			} else if(this._syData == "h") {
				this.newSy();
				effect.hammer = true;
			} else if(this._syData == "g") {
				this.newSy();
				effect.ghostNote = true;
			} else if(this._syData == "ac") {
				this.newSy();
				effect.accentuatedNote = true;
			} else if(this._syData == "hac") {
				this.newSy();
				effect.heavyAccentuatedNote = true;
			} else if(this._syData == "pm") {
				this.newSy();
				effect.palmMute = true;
			} else if(this._syData == "st") {
				this.newSy();
				effect.staccato = true;
			} else if(this._syData == "lr") {
				this.newSy();
				effect.letRing = true;
			} else if(this.applyBeatEffect(beat)) {
			} else this.error(this._syData,alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RBrace) this.error("note-effect",alphatab.file.alphatex.AlphaTexSymbols.RBrace,false);
		this.newSy();
	}
	,note: function(beat) {
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number && !(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String && (Std.string(this._syData).toLowerCase() == "x" || Std.string(this._syData).toLowerCase() == "-"))) this.error("note-fret",alphatab.file.alphatex.AlphaTexSymbols.Number);
		var isDead = Std.string(this._syData).toLowerCase() == "x";
		var isTie = Std.string(this._syData).toLowerCase() == "-";
		var fret = isDead || isTie?0:this._syData;
		this.newSy();
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Dot) this.error("note",alphatab.file.alphatex.AlphaTexSymbols.Dot);
		this.newSy();
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("note-string",alphatab.file.alphatex.AlphaTexSymbols.Number);
		var string = this._syData;
		if(string < 1 || string > this._track.stringCount()) this.error("note-string",alphatab.file.alphatex.AlphaTexSymbols.Number,false);
		this.newSy();
		var effect = this.factory.newNoteEffect();
		this.noteEffects(beat,effect);
		var note = this.factory.newNote();
		note.string = string;
		note.effect = effect;
		note.effect.deadNote = isDead;
		note.isTiedNote = isTie;
		note.value = isTie?this.getTiedNoteValue(string,this._track):fret;
		return note;
	}
	,applyBeatEffect: function(beat) {
		if(this._syData == "f") {
			beat.effect.fadeIn = true;
			this.newSy();
			return true;
		} else if(this._syData == "v") {
			beat.effect.vibrato = true;
			this.newSy();
			return true;
		} else if(this._syData == "t") {
			beat.effect.tapping = true;
			this.newSy();
			return true;
		} else if(this._syData == "s") {
			beat.effect.slapping = true;
			this.newSy();
			return true;
		} else if(this._syData == "p") {
			beat.effect.popping = true;
			this.newSy();
			return true;
		} else if(this._syData == "dd") {
			beat.voices[0].duration.isDoubleDotted = true;
			this.newSy();
			return true;
		} else if(this._syData == "d") {
			beat.voices[0].duration.isDotted = true;
			this.newSy();
			return true;
		} else if(this._syData == "su") {
			beat.effect.stroke.direction = 1;
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
				if(this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) beat.effect.stroke.value = this._syData; else beat.effect.stroke.value = 8;
				this.newSy();
			} else beat.effect.stroke.value = 8;
			return true;
		} else if(this._syData == "sd") {
			beat.effect.stroke.direction = 2;
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
				if(this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) beat.effect.stroke.value = this._syData; else beat.effect.stroke.value = 8;
				this.newSy();
			} else beat.effect.stroke.value = 8;
			return true;
		} else if(this._syData == "tu") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
				this.error("tuplet",alphatab.file.alphatex.AlphaTexSymbols.Number);
				return false;
			}
			var tuplet = this._syData;
			var duration = beat.voices[0].duration;
			switch(tuplet) {
			case 3:
				duration.tuplet.enters = 3;
				duration.tuplet.times = 2;
				break;
			case 5:
				duration.tuplet.enters = 5;
				duration.tuplet.times = 4;
				break;
			case 6:
				duration.tuplet.enters = 6;
				duration.tuplet.times = 4;
				break;
			case 7:
				duration.tuplet.enters = 7;
				duration.tuplet.times = 4;
				break;
			case 9:
				duration.tuplet.enters = 9;
				duration.tuplet.times = 8;
				break;
			case 10:
				duration.tuplet.enters = 10;
				duration.tuplet.times = 8;
				break;
			case 11:
				duration.tuplet.enters = 11;
				duration.tuplet.times = 8;
				break;
			case 12:
				duration.tuplet.enters = 12;
				duration.tuplet.times = 8;
				break;
			}
			this.newSy();
			return true;
		} else if(this._syData == "tb") {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.LParensis) {
				this.error("tremolobar-effect",alphatab.file.alphatex.AlphaTexSymbols.LParensis);
				return false;
			}
			this._allowNegatives = true;
			this.newSy();
			var points = new Array();
			while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) {
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) {
					this.error("tremolobar-effect",alphatab.file.alphatex.AlphaTexSymbols.Number);
					return false;
				}
				points.push(new alphatab.model.effects.BendPoint(0,this._syData,false));
				this.newSy();
			}
			if(points.length > 12) points = points.slice(0,12);
			var count = points.length;
			var step = Math.floor(12 / count);
			var i = 0;
			var tremoloBarEffect = this.factory.newBendEffect();
			while(i < count) {
				points[i].position = Math.floor(Math.min(12,i * step));
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
	,beatEffects: function(beat) {
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.LBrace) return;
		this.newSy();
		while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
			this._syData = Std.string(this._syData).toLowerCase();
			if(!this.applyBeatEffect(beat)) this.error("beat-effects",alphatab.file.alphatex.AlphaTexSymbols.String,false);
		}
		if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RBrace) this.error("beat-effects",alphatab.file.alphatex.AlphaTexSymbols.RBrace);
		this.newSy();
	}
	,beat: function(measure) {
		if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.DoubleDot) {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("duration",alphatab.file.alphatex.AlphaTexSymbols.Number);
			if(this._syData == 1 || this._syData == 2 || this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) this._currentDuration = this._syData; else this.error("duration",alphatab.file.alphatex.AlphaTexSymbols.Number,false);
			this.newSy();
			return;
		}
		var beat = this.factory.newBeat();
		beat.start = 0;
		if(measure.beats.length == 0) beat.start = measure.header.start; else {
			var index = measure.beats.length - 1;
			beat.start = measure.beats[index].start + measure.beats[index].voices[0].duration.time();
		}
		var voice = beat.voices[0];
		voice.isEmpty = false;
		if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.LParensis) {
			this.newSy();
			voice.addNote(this.note(beat));
			while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis && this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) voice.addNote(this.note(beat));
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.RParensis) this.error("note-list",alphatab.file.alphatex.AlphaTexSymbols.RParensis);
			this.newSy();
		} else if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String && Std.string(this._syData).toLowerCase() == "r") this.newSy(); else voice.addNote(this.note(beat));
		if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Dot) {
			this.newSy();
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("duration",alphatab.file.alphatex.AlphaTexSymbols.Number);
			if(this._syData == 1 || this._syData == 2 || this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) voice.duration.value = this._syData; else this.error("duration",alphatab.file.alphatex.AlphaTexSymbols.Number,false);
			this.newSy();
		} else voice.duration.value = this._currentDuration;
		this.beatEffects(beat);
		measure.addBeat(beat);
	}
	,measureMeta: function(measure) {
		var header = measure.header;
		while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.MetaCommand) {
			if(this._syData == "ts") {
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("timesignature-numerator",alphatab.file.alphatex.AlphaTexSymbols.Number);
				header.timeSignature.numerator = this._syData;
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("timesignature-denominator",alphatab.file.alphatex.AlphaTexSymbols.Number);
				header.timeSignature.denominator.value = this._syData;
			} else if(this._syData == "ro") header.isRepeatOpen = true; else if(this._syData == "rc") {
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("repeatclose",alphatab.file.alphatex.AlphaTexSymbols.Number);
				header.repeatClose = Std.parseInt(this._syData) - 1;
			} else if(this._syData == "ks") {
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.String) this.error("keysignature",alphatab.file.alphatex.AlphaTexSymbols.String);
				header.keySignature = alphatab.file.guitarpro.Gp3Reader.toKeySignature(this.parseKeySignature(this._syData));
			} else if(this._syData == "clef") {
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.String) this.error("clef",alphatab.file.alphatex.AlphaTexSymbols.String);
				measure.clef = this.parseClef(this._syData);
			} else if(this._syData == "tempo") {
				this.newSy();
				if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Number) this.error("tempo",alphatab.file.alphatex.AlphaTexSymbols.Number);
				header.tempo.value = this._syData;
			} else this.error("measure-effects",alphatab.file.alphatex.AlphaTexSymbols.String,false);
			this.newSy();
		}
	}
	,measure: function(tempo) {
		var header = this.factory.newMeasureHeader();
		header.number = this._song.measureHeaders.length + 1;
		header.start = this._song.measureHeaders.length == 0?alphatab.model.Duration.QUARTER_TIME:this._song.measureHeaders[this._song.measureHeaders.length - 1].start + this._song.measureHeaders[this._song.measureHeaders.length - 1].length();
		var measure = this.factory.newMeasure(header);
		header.tempo.copy(tempo);
		if(this._song.measureHeaders.length > 0) {
			var prevMeasure = this._track.measures[this._song.measureHeaders.length - 1];
			var prevHeader = this._song.measureHeaders[this._song.measureHeaders.length - 1];
			measure.clef = prevMeasure.clef;
			header.keySignature = prevHeader.keySignature;
			header.keySignatureType = prevHeader.keySignatureType;
			prevHeader.timeSignature.copy(header.timeSignature);
		}
		this.measureMeta(measure);
		tempo.copy(header.tempo);
		this._song.addMeasureHeader(header);
		this._track.addMeasure(measure);
		while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Pipe && this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) this.beat(measure);
	}
	,measures: function() {
		var tempo = this.factory.newTempo();
		tempo.value = this._song.tempo;
		this.measure(tempo);
		while(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Eof) {
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Pipe) this.error("measures",alphatab.file.alphatex.AlphaTexSymbols.Pipe);
			this.newSy();
			this.measure(tempo);
		}
	}
	,metaData: function() {
		var anyMeta = false;
		while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.MetaCommand) if(this._syData == "title") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) this._song.title = this._syData; else this.error("title",alphatab.file.alphatex.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "subtitle") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) this._song.subtitle = this._syData; else this.error("subtitle",alphatab.file.alphatex.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "artist") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) this._song.artist = this._syData; else this.error("artist",alphatab.file.alphatex.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "album") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) this._song.album = this._syData; else this.error("album",alphatab.file.alphatex.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "words") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) this._song.words = this._syData; else this.error("words",alphatab.file.alphatex.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "music") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) this._song.music = this._syData; else this.error("music",alphatab.file.alphatex.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "copyright") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) this._song.copyright = this._syData; else this.error("copyright",alphatab.file.alphatex.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "tempo") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) this._song.tempo = this._syData; else this.error("tempo",alphatab.file.alphatex.AlphaTexSymbols.Number);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "capo") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) this._track.offset = this._syData; else this.error("capo",alphatab.file.alphatex.AlphaTexSymbols.Number);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "tuning") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Tuning) {
				this._track.strings = new Array();
				do {
					this._track.strings.push(this.newString(this._track.strings.length + 1,this.parseTuning(this._syData)));
					this.newSy();
				} while(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Tuning);
			} else this.error("tuning",alphatab.file.alphatex.AlphaTexSymbols.Tuning);
			anyMeta = true;
		} else if(this._syData == "instrument") {
			this.newSy();
			if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.Number) {
				var instrument = this._syData;
				if(instrument >= 0 && instrument <= 128) this._track.channel.instrument(this._syData); else this.error("instrument",alphatab.file.alphatex.AlphaTexSymbols.Number,false);
			} else if(this._sy == alphatab.file.alphatex.AlphaTexSymbols.String) {
				var instrumentName = this._syData;
				this._track.channel.instrument(alphatab.midi.GeneralMidi.getValue(instrumentName));
			} else this.error("instrument",alphatab.file.alphatex.AlphaTexSymbols.Number);
			this.newSy();
			anyMeta = true;
		} else this.error("metaDataTags",alphatab.file.alphatex.AlphaTexSymbols.String,false);
		if(anyMeta) {
			if(this._sy != alphatab.file.alphatex.AlphaTexSymbols.Dot) this.error("song",alphatab.file.alphatex.AlphaTexSymbols.Dot);
			this.newSy();
		}
	}
	,song: function() {
		this.metaData();
		this.measures();
	}
	,error: function(nonterm,expected,symbolError) {
		if(symbolError == null) symbolError = true;
		if(symbolError) throw new alphatab.file.FileFormatException(Std.string(this._curChPos) + ": Error on block " + nonterm + ", expected a " + Std.string(expected) + " found a " + Std.string(this._sy)); else throw new alphatab.file.FileFormatException(Std.string(this._curChPos) + ": Error on block " + nonterm + ", invalid value:" + Std.string(this._syData));
	}
	,readSong: function() {
		this.createDefaultSong();
		this._curChPos = 0;
		this._currentDuration = 4;
		this.nextChar();
		this.newSy();
		this.song();
		return this._song;
	}
	,createDefaultSong: function() {
		this._song = this.factory.newSong();
		this._song.tempo = 120;
		this._song.tempoName = "";
		this._song.hideTempo = false;
		this._song.pageSetup = this.factory.newPageSetup();
		this._track = this.factory.newTrack();
		this._track.number = 1;
		this._track.channel.instrument(25);
		this._track.channel.channel = alphatab.file.alphatex.AlphaTexParser.TRACK_CHANNELS[0];
		this._track.channel.effectChannel = alphatab.file.alphatex.AlphaTexParser.TRACK_CHANNELS[1];
		this.createDefaultStrings(this._track.strings);
		this._song.addTrack(this._track);
	}
	,__class__: alphatab.file.alphatex.AlphaTexParser
});
alphatab.file.alphatex.AlphaTexSymbols = { __ename__ : true, __constructs__ : ["No","Eof","Number","DoubleDot","Dot","String","Tuning","LParensis","RParensis","LBrace","RBrace","Pipe","MetaCommand"] }
alphatab.file.alphatex.AlphaTexSymbols.No = ["No",0];
alphatab.file.alphatex.AlphaTexSymbols.No.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.No.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Eof = ["Eof",1];
alphatab.file.alphatex.AlphaTexSymbols.Eof.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Eof.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Number = ["Number",2];
alphatab.file.alphatex.AlphaTexSymbols.Number.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Number.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.DoubleDot = ["DoubleDot",3];
alphatab.file.alphatex.AlphaTexSymbols.DoubleDot.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.DoubleDot.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Dot = ["Dot",4];
alphatab.file.alphatex.AlphaTexSymbols.Dot.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Dot.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.String = ["String",5];
alphatab.file.alphatex.AlphaTexSymbols.String.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.String.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Tuning = ["Tuning",6];
alphatab.file.alphatex.AlphaTexSymbols.Tuning.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Tuning.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.LParensis = ["LParensis",7];
alphatab.file.alphatex.AlphaTexSymbols.LParensis.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.LParensis.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.RParensis = ["RParensis",8];
alphatab.file.alphatex.AlphaTexSymbols.RParensis.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.RParensis.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.LBrace = ["LBrace",9];
alphatab.file.alphatex.AlphaTexSymbols.LBrace.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.LBrace.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.RBrace = ["RBrace",10];
alphatab.file.alphatex.AlphaTexSymbols.RBrace.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.RBrace.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.Pipe = ["Pipe",11];
alphatab.file.alphatex.AlphaTexSymbols.Pipe.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.Pipe.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexSymbols.MetaCommand = ["MetaCommand",12];
alphatab.file.alphatex.AlphaTexSymbols.MetaCommand.toString = $estr;
alphatab.file.alphatex.AlphaTexSymbols.MetaCommand.__enum__ = alphatab.file.alphatex.AlphaTexSymbols;
alphatab.file.alphatex.AlphaTexWriter = function(track,voice) {
	this._voice = voice;
	this._track = track;
	this._keySignature = -1;
	this._currentDuration = -1;
	this._clef = 0;
};
alphatab.file.alphatex.AlphaTexWriter.__name__ = true;
alphatab.file.alphatex.AlphaTexWriter.prototype = {
	writeMeta: function() {
		if(this._track.song.title != "") {
			this._result.b += " \\title '";
			this._result.b += Std.string(this._track.song.title);
			this._result.b += "'";
		}
		if(this._track.song.subtitle != "") {
			this._result.b += " \\subtitle '";
			this._result.b += Std.string(this._track.song.subtitle);
			this._result.b += "'";
		}
		if(this._track.song.artist != "") {
			this._result.b += " \\artist '";
			this._result.b += Std.string(this._track.song.artist);
			this._result.b += "'";
		}
		if(this._track.song.album != "") {
			this._result.b += " \\album '";
			this._result.b += Std.string(this._track.song.album);
			this._result.b += "'";
		}
		if(this._track.song.words != "") {
			this._result.b += " \\words '";
			this._result.b += Std.string(this._track.song.words);
			this._result.b += "'";
		}
		if(this._track.song.music != "") {
			this._result.b += " \\music '";
			this._result.b += Std.string(this._track.song.music);
			this._result.b += "'";
		}
		if(this._track.song.copyright != "") {
			this._result.b += " \\copyright '";
			this._result.b += Std.string(this._track.song.copyright);
			this._result.b += "'";
		}
		this._result.b += " \\tempo ";
		this._result.b += Std.string(this._track.song.tempo);
		this._currentTempo = this._track.song.tempo;
		if(this._track.offset != 0) {
			this._result.b += " \\capo ";
			this._result.b += Std.string(this._track.offset);
		}
		this._result.b += " \\tuning ";
		var _g = 0, _g1 = this._track.strings;
		while(_g < _g1.length) {
			var gs = _g1[_g];
			++_g;
			this._result.b += Std.string(alphatab.model.Tuning.getTextForTuning(gs.value,true));
			this._result.b += " ";
		}
		this._result.b += " \\instrument ";
		this._result.b += Std.string(this._track.channel.instrument());
	}
	,writeNoteEffects: function(note) {
		this._result.b += "{";
		if(note.effect.isBend()) {
			this._result.b += " b(";
			var _g = 0, _g1 = note.effect.bend.points;
			while(_g < _g1.length) {
				var point = _g1[_g];
				++_g;
				this._result.b += Std.string(point.value);
				this._result.b += " ";
			}
			this._result.b += ") ";
		}
		if(note.effect.isHarmonic()) switch(note.effect.harmonic.type) {
		case 0:
			this._result.b += " nh ";
			break;
		case 1:
			this._result.b += " ah ";
			break;
		case 2:
			this._result.b += " th ";
			break;
		case 3:
			this._result.b += " ph ";
			break;
		case 4:
			this._result.b += " sh ";
			break;
		}
		if(note.effect.isGrace()) {
			this._result.b += " gr ";
			if(note.effect.grace.isDead) this._result.b += "x "; else {
				this._result.b += Std.string(note.effect.grace.fret);
				this._result.b += " ";
			}
			this._result.b += Std.string(note.effect.grace.duration);
			switch(note.effect.grace.transition) {
			case 2:
				this._result.b += " b ";
				break;
			case 1:
				this._result.b += " s ";
				break;
			case 3:
				this._result.b += " h ";
				break;
			}
		}
		if(note.effect.isTrill()) {
			this._result.b += " tr ";
			this._result.b += Std.string(note.effect.trill.fret);
			this._result.b += " ";
			this._result.b += Std.string(note.effect.trill.duration.value);
			this._result.b += " ";
		}
		if(note.effect.isTremoloPicking()) {
			this._result.b += " tp ";
			this._result.b += Std.string(note.effect.tremoloPicking.duration.value);
			this._result.b += " ";
		}
		if(note.effect.vibrato) this._result.b += " v ";
		if(note.effect.slide) switch(note.effect.slideType) {
		case 0:
			this._result.b += " sl ";
			break;
		case 1:
			this._result.b += " sf ";
			break;
		}
		if(note.effect.hammer) this._result.b += " h ";
		if(note.effect.ghostNote) this._result.b += " g ";
		if(note.effect.accentuatedNote) this._result.b += " ac ";
		if(note.effect.heavyAccentuatedNote) this._result.b += " hac ";
		if(note.effect.palmMute) this._result.b += " pm ";
		if(note.effect.staccato) this._result.b += " st ";
		if(note.effect.letRing) this._result.b += " lr ";
		this._result.b += "}";
	}
	,writeNote: function(note) {
		if(note.isTiedNote) this._result.b += " -"; else if(note.effect.deadNote) this._result.b += " x"; else {
			this._result.b += " ";
			this._result.b += Std.string(note.value);
		}
		this._result.b += ".";
		this._result.b += Std.string(note.string);
		this._result.b += " ";
		this.writeNoteEffects(note);
	}
	,writeBeatEffects: function(beat) {
		if(beat.effect.fadeIn) this._result.b += " f ";
		if(beat.effect.vibrato) this._result.b += " v ";
		if(beat.effect.tapping) this._result.b += " t ";
		if(beat.effect.slapping) this._result.b += " s ";
		if(beat.effect.popping) this._result.b += " p ";
		if(beat.voices[this._voice].duration.isDoubleDotted) this._result.b += " dd ";
		if(beat.voices[this._voice].duration.isDotted) this._result.b += " d ";
		if(beat.effect.stroke.direction != 0) {
			if(beat.effect.stroke.direction == 1) this._result.b += " su "; else this._result.b += " sd ";
			this._result.b += Std.string(beat.effect.stroke.value);
			this._result.b += " ";
		}
		if(!beat.voices[this._voice].duration.tuplet.equals(alphatab.model.Tuplet.NORMAL)) {
			this._result.b += " tu ";
			this._result.b += Std.string(beat.voices[this._voice].duration.tuplet.enters);
			this._result.b += " ";
		}
		if(beat.effect.isTremoloBar()) {
			this._result.b += " tb( ";
			var _g = 0, _g1 = beat.effect.tremoloBar.points;
			while(_g < _g1.length) {
				var point = _g1[_g];
				++_g;
				this._result.b += Std.string(point.value);
				this._result.b += " ";
			}
			this._result.b += ") ";
		}
	}
	,parseKeySignature: function(keySignature) {
		switch(keySignature) {
		case -7:
			return "cb";
		case -6:
			return "gb";
		case -5:
			return "db";
		case -4:
			return "ab";
		case -3:
			return "eb";
		case -2:
			return "bb";
		case -1:
			return "f";
		case 0:
			return "c";
		case 1:
			return "g";
		case 2:
			return "d";
		case 3:
			return "a";
		case 4:
			return "e";
		case 5:
			return "b";
		case 6:
			return "f#";
		case 7:
			return "c#";
		default:
			return "c";
		}
	}
	,writeBeat: function(beat) {
		var voice = beat.voices[this._voice];
		if(voice.duration.value != this._currentDuration) {
			this._result.b += ":";
			this._result.b += Std.string(voice.duration.value);
			this._result.b += " ";
			this._currentDuration = voice.duration.value;
		}
		if(voice.isEmpty) return;
		if(voice.isRestVoice()) this._result.b += "r "; else {
			if(voice.notes.length > 1) this._result.b += "(";
			var _g = 0, _g1 = voice.notes;
			while(_g < _g1.length) {
				var note = _g1[_g];
				++_g;
				this.writeNote(note);
			}
			if(voice.notes.length > 1) this._result.b += ")";
			this._result.b += "{";
			this.writeBeatEffects(beat);
			this._result.b += "}";
		}
		this._result.b += " ";
	}
	,writeMeasure: function(measure) {
		if(this._timeSignature == null || measure.header.timeSignature.numerator != this._timeSignature.numerator || measure.header.timeSignature.denominator.value != this._timeSignature.denominator.value) {
			this._result.b += " \\ts ";
			this._result.b += Std.string(measure.header.timeSignature.numerator);
			this._result.b += " ";
			this._result.b += Std.string(measure.header.timeSignature.denominator.value);
			this._timeSignature = measure.header.timeSignature;
		}
		if(measure.header.isRepeatOpen) this._result.b += " \\ro ";
		if(measure.header.repeatClose > 1) this._result.b += Std.string(measure.header.repeatClose - 1);
		if(measure.header.keySignature != this._keySignature) {
			this._result.b += " \\ks ";
			this._result.b += Std.string(this.parseKeySignature(measure.header.keySignature));
			this._result.b += " ";
			this._keySignature = measure.header.keySignature;
		}
		if(measure.clef != this._clef) {
			this._result.b += " \\clef ";
			switch(measure.clef) {
			case 0:
				this._result.b += "treble ";
				break;
			case 3:
				this._result.b += "alto ";
				break;
			case 1:
				this._result.b += "bass ";
				break;
			case 2:
				this._result.b += "tenor ";
				break;
			}
			this._clef = measure.clef;
		}
		if(this._currentTempo != measure.header.tempo.value) {
			this._result.b += " \\tempo ";
			this._result.b += Std.string(measure.header.tempo.value);
			this._result.b += " ";
			this._currentTempo = measure.header.tempo.value;
		}
		var _g = 0, _g1 = measure.beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			this.writeBeat(beat);
		}
	}
	,cleanup: function(data) {
		var spaces = new EReg("[ ]+","g");
		data = StringTools.replace(data,"{}"," ");
		data = StringTools.replace(data,"{ }"," ");
		data = spaces.replace(data," ");
		data = StringTools.replace(data,"{ ","{");
		data = StringTools.replace(data," }","}");
		data = StringTools.replace(data,"( ","(");
		data = StringTools.replace(data," )",")");
		data = spaces.replace(data," ");
		return data;
	}
	,write: function() {
		this._result = new StringBuf();
		this.writeMeta();
		this._result.b += " . ";
		var _g = 0, _g1 = this._track.measures;
		while(_g < _g1.length) {
			var measure = _g1[_g];
			++_g;
			this.writeMeasure(measure);
			if(measure.header.number < this._track.measureCount() - 1) this._result.b += "|";
		}
		return this.cleanup(this._result.b);
	}
	,__class__: alphatab.file.alphatex.AlphaTexWriter
}
alphatab.file.gpx = {}
alphatab.file.gpx.DocumentParser = function(factory,document) {
	this._factory = factory;
	this._document = document;
};
alphatab.file.gpx.DocumentParser.__name__ = true;
alphatab.file.gpx.DocumentParser.prototype = {
	newString: function(num,tuning) {
		var str = this._factory.newString();
		str.number = num;
		str.value = tuning;
		return str;
	}
	,getStringFor: function(beat,value) {
		var strings = beat.measure.track.strings;
		var i = 0;
		while(i < strings.length) {
			var string = strings[i];
			if(value >= string.value) {
				var emptyString = true;
				var v = 0;
				var _g = 0, _g1 = beat.voices;
				while(_g < _g1.length) {
					var voice = _g1[_g];
					++_g;
					var _g2 = 0, _g3 = voice.notes;
					while(_g2 < _g3.length) {
						var note = _g3[_g2];
						++_g2;
						if(note.string == string.number) {
							emptyString = false;
							break;
						}
					}
				}
				if(emptyString) return string;
			}
			i++;
		}
		return null;
	}
	,getBeat: function(measure,start) {
		var count = measure.beats.length;
		var i = 0;
		while(i < count) {
			var currentBeat = measure.beats[i];
			if(currentBeat.start == start) return currentBeat;
			i++;
		}
		var newBeat = this._factory.newBeat();
		newBeat.start = start;
		measure.addBeat(newBeat);
		return newBeat;
	}
	,parseDynamic: function(beat) {
		var velocity = 95;
		if(beat.dyn != null) {
			if(beat.dyn == "PPP") velocity = 15; else if(beat.dyn == "PP") velocity = 31; else if(beat.dyn == "P") velocity = 47; else if(beat.dyn == "MP") velocity = 63; else if(beat.dyn == "MF") velocity = 79; else if(beat.dyn == "F") velocity = 95; else if(beat.dyn == "FF") velocity = 111; else if(beat.dyn == "FFF") velocity = 127;
		}
		return velocity;
	}
	,parseRhythm: function(gpxRhythm,duration) {
		duration.isDotted = gpxRhythm.augmentationDotCount == 1;
		duration.isDoubleDotted = gpxRhythm.augmentationDotCount == 2;
		duration.tuplet.times = gpxRhythm.primaryTupletDen;
		duration.tuplet.enters = gpxRhythm.primaryTupletNum;
		if(gpxRhythm.noteValue == "Whole") duration.value = alphatab.model.Duration.WHOLE; else if(gpxRhythm.noteValue == "Half") duration.value = alphatab.model.Duration.HALF; else if(gpxRhythm.noteValue == "Quarter") duration.value = alphatab.model.Duration.QUARTER; else if(gpxRhythm.noteValue == "Eighth") duration.value = alphatab.model.Duration.EIGHTH; else if(gpxRhythm.noteValue == "16th") duration.value = alphatab.model.Duration.SIXTEENTH; else if(gpxRhythm.noteValue == "32nd") duration.value = alphatab.model.Duration.THIRTY_SECOND; else if(gpxRhythm.noteValue == "64th") duration.value = alphatab.model.Duration.SIXTY_FOURTH;
	}
	,parseNote: function(gpxNote,voice,velocity) {
		var value = -1;
		var string = -1;
		if(gpxNote.string >= 0 && gpxNote.fret >= 0) {
			value = gpxNote.fret;
			string = voice.beat.measure.track.stringCount() - gpxNote.string;
		} else {
			var gmValue = -1;
			if(gpxNote.midiNumber >= 0) gmValue = gpxNote.midiNumber; else if(gpxNote.tone >= 0 && gpxNote.octave >= 0) gmValue = gpxNote.tone + (12 * gpxNote.octave - 12); else if(gpxNote.element >= 0) {
				var i = 0;
				while(i < alphatab.file.gpx.score.GpxDrumkit.get_DRUMKITS().length) {
					if(alphatab.file.gpx.score.GpxDrumkit.get_DRUMKITS()[i].element == gpxNote.element && alphatab.file.gpx.score.GpxDrumkit.get_DRUMKITS()[i].variation == gpxNote.variation) gmValue = alphatab.file.gpx.score.GpxDrumkit.get_DRUMKITS()[i].midiValue;
					i++;
				}
			}
			if(gmValue >= 0) {
				var stringAlternative = this.getStringFor(voice.beat,gmValue);
				if(stringAlternative != null) {
					value = gmValue - stringAlternative.value;
					string = stringAlternative.number;
				}
			}
		}
		if(value >= 0 && string > 0) {
			var note = this._factory.newNote();
			note.value = value;
			note.string = string;
			note.isTiedNote = gpxNote.tieDestination;
			note.velocity = velocity;
			note.effect.vibrato = gpxNote.vibrato;
			note.effect.slide = gpxNote.slide;
			note.effect.deadNote = gpxNote.mutedEnabled;
			note.effect.palmMute = gpxNote.palmMutedEnabled;
			voice.addNote(note);
		}
	}
	,parseBar: function(bar,measure) {
		var voiceIds = bar.voiceIds;
		var v = 0;
		while(v < 2) {
			if(voiceIds.length > v) {
				if(voiceIds[v] >= 0) {
					var gpxVoice = this._document.getVoice(voiceIds[v]);
					if(gpxVoice != null) {
						var start = measure.header.start;
						var b = 0;
						while(b < gpxVoice.beatIds.length) {
							var gpxBeat = this._document.getBeat(gpxVoice.beatIds[b]);
							var rhythm = this._document.getRhythm(gpxBeat.rhythmId);
							var beat = this.getBeat(measure,start);
							var voice = beat.voices[v % beat.voices.length];
							voice.isEmpty = false;
							this.parseRhythm(rhythm,voice.duration);
							if(gpxBeat.noteIds != null) {
								var velocity = this.parseDynamic(gpxBeat);
								var n = 0;
								while(n < gpxBeat.noteIds.length) {
									var gpxNote = this._document.getNote(gpxBeat.noteIds[n]);
									if(gpxNote != null) this.parseNote(gpxNote,voice,velocity);
									n++;
								}
							}
							start += voice.duration.time();
							b++;
						}
					}
				}
			}
			v++;
		}
	}
	,parseMasterBars: function(song) {
		var start = alphatab.model.Duration.QUARTER_TIME;
		var i = 0;
		var _g = 0, _g1 = this._document.masterBars;
		while(_g < _g1.length) {
			var mbar = _g1[_g];
			++_g;
			var tempoAutomation = this._document.getAutomation("Tempo",i);
			var measureHeader = this._factory.newMeasureHeader();
			measureHeader.start = start;
			measureHeader.number = i + 1;
			measureHeader.isRepeatOpen = mbar.repeatStart;
			measureHeader.repeatClose = mbar.repeatCount;
			if(mbar.time != null && mbar.time.length == 2) {
				measureHeader.timeSignature.numerator = mbar.time[0];
				measureHeader.timeSignature.denominator.value = mbar.time[1];
			}
			if(tempoAutomation != null && tempoAutomation.value.length == 2) {
				var tempo = tempoAutomation.value[0];
				if(tempoAutomation.value[1] == 1) tempo = tempo / 2 | 0; else if(tempoAutomation.value[1] == 3) tempo = tempo + tempo / 2 | 0; else if(tempoAutomation.value[1] == 4) tempo = tempo * 2 | 0; else if(tempoAutomation.value[1] == 5) tempo = tempo + tempo * 2 | 0;
				measureHeader.tempo.value = tempo;
			}
			song.addMeasureHeader(measureHeader);
			var t = 0;
			while(t < song.tracks.length) {
				var track = song.tracks[t];
				var measure = this._factory.newMeasure(measureHeader);
				track.addMeasure(measure);
				var masterBarIndex = i;
				var gpxBar = t < mbar.barIds.length?this._document.getBar(mbar.barIds[t]):null;
				while(gpxBar != null && gpxBar.simileMark != null) {
					var gpxMark = gpxBar.simileMark;
					if(gpxMark == "Simple") masterBarIndex = masterBarIndex - 1; else if(gpxMark == "FirstOfDouble" || gpxMark == "SecondOfDouble") masterBarIndex = masterBarIndex - 2;
					if(masterBarIndex >= 0) {
						var masterBarCopy = this._document.masterBars[masterBarIndex];
						gpxBar = t < masterBarCopy.barIds.length?this._document.getBar(masterBarCopy.barIds[t]):null;
					} else gpxBar = null;
				}
				if(gpxBar != null) this.parseBar(gpxBar,measure);
				t++;
			}
			start += measureHeader.length();
			i++;
		}
	}
	,parseTracks: function(song) {
		var i = 0;
		var _g = 0, _g1 = this._document.tracks;
		while(_g < _g1.length) {
			var gpxTrack = _g1[_g];
			++_g;
			var track = this._factory.newTrack();
			track.number = i + 1;
			track.name = gpxTrack.name;
			track.channel.instrument(gpxTrack.gmProgram);
			track.channel.channel = gpxTrack.gmChannel1;
			track.channel.effectChannel = gpxTrack.gmChannel2;
			if(gpxTrack.tunningPitches != null) {
				var s = 1;
				while(s <= gpxTrack.tunningPitches.length) {
					track.strings.push(this.newString(s,gpxTrack.tunningPitches[gpxTrack.tunningPitches.length - s]));
					s++;
				}
			} else {
				track.strings.push(this.newString(1,64));
				track.strings.push(this.newString(2,59));
				track.strings.push(this.newString(3,55));
				track.strings.push(this.newString(4,50));
				track.strings.push(this.newString(5,45));
				track.strings.push(this.newString(6,40));
			}
			if(gpxTrack.color != null && gpxTrack.color.length == 3) {
				track.color.r = gpxTrack.color[0];
				track.color.g = gpxTrack.color[1];
				track.color.b = gpxTrack.color[2];
			}
			song.addTrack(track);
			i++;
		}
	}
	,parseScore: function(song) {
		song.title = this._document.score.title;
		song.artist = this._document.score.artist;
		song.album = this._document.score.album;
		song.words = this._document.score.wordsAndMusic;
		song.music = this._document.score.wordsAndMusic;
		song.copyright = this._document.score.copyright;
		song.tab = this._document.score.tabber;
		song.notice = this._document.score.notices;
		song.pageSetup.pageSize.x = this._document.score.pageSetup.width;
		song.pageSetup.pageSize.y = this._document.score.pageSetup.height;
		song.pageSetup.pageMargin = this._document.score.pageSetup.margin;
		song.pageSetup.scoreSizeProportion = this._document.score.pageSetup.scale;
	}
	,parse: function() {
		var song = this._factory.newSong();
		song.tempo = 120;
		song.tempoName = "";
		song.hideTempo = false;
		song.pageSetup = this._factory.newPageSetup();
		this.parseScore(song);
		this.parseTracks(song);
		this.parseMasterBars(song);
		return song;
	}
	,__class__: alphatab.file.gpx.DocumentParser
}
alphatab.file.gpx.DocumentReader = function(stream) {
	var str = "";
	var _g = 0;
	while(_g < stream.length) {
		var i = stream[_g];
		++_g;
		str += String.fromCharCode(i);
	}
	this._xmlDocument = Xml.parse(str);
	this._dom = new haxe.xml.Fast(this._xmlDocument.firstElement());
	this._gpxDocument = new alphatab.file.gpx.score.GpxDocument();
};
alphatab.file.gpx.DocumentReader.__name__ = true;
alphatab.file.gpx.DocumentReader.prototype = {
	readRhythms: function() {
		if(this._dom.hasNode.resolve("Rhythms")) {
			var $it0 = this._dom.node.resolve("Rhythms").nodes.resolve("Rhythm").iterator();
			while( $it0.hasNext() ) {
				var rhythmNode = $it0.next();
				var rhythm = new alphatab.file.gpx.score.GpxRhythm();
				rhythm.id = Std.parseInt(rhythmNode.att.resolve("id"));
				rhythm.noteValue = rhythmNode.node.resolve("NoteValue").get_innerData();
				if(rhythmNode.hasNode.resolve("PrimaryTuplet")) {
					rhythm.primaryTupletDen = Std.parseInt(rhythmNode.node.resolve("PrimaryTuplet").att.resolve("den"));
					rhythm.primaryTupletNum = Std.parseInt(rhythmNode.node.resolve("PrimaryTuplet").att.resolve("num"));
				} else {
					rhythm.primaryTupletDen = 1;
					rhythm.primaryTupletNum = 1;
				}
				rhythm.augmentationDotCount = rhythmNode.hasNode.resolve("AugmentationDot")?Std.parseInt(rhythmNode.node.resolve("AugmentationDot").att.resolve("count")):0;
				this._gpxDocument.rhythms.push(rhythm);
			}
		}
	}
	,readNotes: function() {
		if(this._dom.hasNode.resolve("Notes")) {
			var $it0 = this._dom.node.resolve("Notes").nodes.resolve("Note").iterator();
			while( $it0.hasNext() ) {
				var noteNode = $it0.next();
				var note = new alphatab.file.gpx.score.GpxNote();
				note.id = Std.parseInt(noteNode.att.resolve("id"));
				note.tieDestination = noteNode.hasNode.resolve("Tie")?this.toBool(noteNode.node.resolve("Tie").att.resolve("destination")):false;
				note.vibrato = noteNode.hasNode.resolve("Vibrato");
				var propertyNodes = noteNode.node.resolve("Properties").nodes.resolve("Property");
				var $it1 = propertyNodes.iterator();
				while( $it1.hasNext() ) {
					var propertyNode = $it1.next();
					var name = propertyNode.att.resolve("name");
					if(name == "String") note.string = Std.parseInt(propertyNode.node.resolve("String").get_innerData()); else if(name == "Fret") note.fret = Std.parseInt(propertyNode.node.resolve("Fret").get_innerData()); else if(name == "Midi") note.midiNumber = Std.parseInt(propertyNode.node.resolve("Number").get_innerData()); else if(name == "Tone") note.tone = Std.parseInt(propertyNode.node.resolve("Step").get_innerData()); else if(name == "Octave") note.octave = Std.parseInt(propertyNode.node.resolve("Number").get_innerData()); else if(name == "Element") note.element = Std.parseInt(propertyNode.node.resolve("Element").get_innerData()); else if(name == "Variation") note.variation = Std.parseInt(propertyNode.node.resolve("Variation").get_innerData()); else if(name == "Muted") note.mutedEnabled = propertyNode.hasNode.resolve("Enable"); else if(name == "PalmMuted") note.palmMutedEnabled = propertyNode.hasNode.resolve("Enable"); else if(name == "Slide") note.slide = true;
				}
				this._gpxDocument.notes.push(note);
			}
		}
	}
	,readBeats: function() {
		if(this._dom.hasNode.resolve("Beats")) {
			var $it0 = this._dom.node.resolve("Beats").nodes.resolve("Beat").iterator();
			while( $it0.hasNext() ) {
				var beatNode = $it0.next();
				var beat = new alphatab.file.gpx.score.GpxBeat();
				beat.id = Std.parseInt(beatNode.att.resolve("id"));
				beat.dyn = beatNode.node.resolve("Dynamic").get_innerData();
				beat.rhythmId = Std.parseInt(beatNode.node.resolve("Rhythm").att.resolve("ref"));
				if(beatNode.hasNode.resolve("Notes")) beat.noteIds = this.toIntArray(beatNode.node.resolve("Notes").get_innerData()); else beat.noteIds = [];
				this._gpxDocument.beats.push(beat);
			}
		}
	}
	,readVoices: function() {
		if(this._dom.hasNode.resolve("Voices")) {
			var $it0 = this._dom.node.resolve("Voices").nodes.resolve("Voice").iterator();
			while( $it0.hasNext() ) {
				var voiceNode = $it0.next();
				var voice = new alphatab.file.gpx.score.GpxVoice();
				voice.id = Std.parseInt(voiceNode.att.resolve("id"));
				voice.beatIds = this.toIntArray(voiceNode.node.resolve("Beats").get_innerData());
				this._gpxDocument.voices.push(voice);
			}
		}
	}
	,readBars: function() {
		if(this._dom.hasNode.resolve("Bars")) {
			var $it0 = this._dom.node.resolve("Bars").nodes.resolve("Bar").iterator();
			while( $it0.hasNext() ) {
				var barNode = $it0.next();
				var bar = new alphatab.file.gpx.score.GpxBar();
				bar.id = Std.parseInt(barNode.att.resolve("id"));
				bar.voiceIds = this.toIntArray(barNode.node.resolve("Voices").get_innerData());
				bar.clef = barNode.node.resolve("Clef").get_innerData();
				bar.simileMark = barNode.hasNode.resolve("SimileMark")?barNode.node.resolve("SimileMark").get_innerData():null;
				this._gpxDocument.bars.push(bar);
			}
		}
	}
	,readMasterBars: function() {
		if(this._dom.hasNode.resolve("MasterBars")) {
			var masterBarNodes = this._dom.node.resolve("MasterBars").nodes.resolve("MasterBar");
			var $it0 = masterBarNodes.iterator();
			while( $it0.hasNext() ) {
				var masterBarNode = $it0.next();
				var masterBar = new alphatab.file.gpx.score.GpxMasterBar();
				masterBar.barIds = this.toIntArray(masterBarNode.node.resolve("Bars").get_innerData());
				masterBar.time = this.toIntArray2(masterBarNode.node.resolve("Time").get_innerData(),"/");
				if(masterBarNode.hasNode.resolve("Repeat")) {
					var repeatNode = masterBarNode.node.resolve("Repeat");
					masterBar.repeatStart = this.toBool(repeatNode.att.resolve("start"));
					if(this.toBool(repeatNode.att.resolve("end"))) masterBar.repeatCount = Std.parseInt(repeatNode.att.resolve("count"));
				}
				this._gpxDocument.masterBars.push(masterBar);
			}
		}
	}
	,readTracks: function() {
		if(this._dom.hasNode.resolve("Tracks")) {
			var $it0 = this._dom.node.resolve("Tracks").nodes.resolve("Track").iterator();
			while( $it0.hasNext() ) {
				var trackNode = $it0.next();
				var track = new alphatab.file.gpx.score.GpxTrack();
				track.id = Std.parseInt(trackNode.att.resolve("id"));
				track.name = trackNode.node.resolve("Name").get_innerData();
				track.color = this.toIntArray(trackNode.node.resolve("Color").get_innerData());
				if(trackNode.hasNode.resolve("GeneralMidi")) {
					var gmNode = trackNode.node.resolve("GeneralMidi");
					track.gmProgram = Std.parseInt(gmNode.node.resolve("Program").get_innerData());
					track.gmChannel1 = Std.parseInt(gmNode.node.resolve("PrimaryChannel").get_innerData());
					track.gmChannel2 = Std.parseInt(gmNode.node.resolve("SecondaryChannel").get_innerData());
				}
				if(trackNode.hasNode.resolve("Properties")) {
					var $it1 = trackNode.node.resolve("Properties").nodes.resolve("Property").iterator();
					while( $it1.hasNext() ) {
						var propertyNode = $it1.next();
						if(propertyNode.att.resolve("name") == "Tuning") track.tunningPitches = this.toIntArray(propertyNode.node.resolve("Pitches").get_innerData());
					}
				}
				this._gpxDocument.tracks.push(track);
			}
		}
	}
	,toIntArray2: function(str,sep) {
		var lst = new Array();
		var _g = 0, _g1 = str.split(sep);
		while(_g < _g1.length) {
			var part = _g1[_g];
			++_g;
			lst.push(Std.parseInt(part));
		}
		return lst;
	}
	,toIntArray: function(str) {
		return this.toIntArray2(str," ");
	}
	,toBool: function(str) {
		return str.toLowerCase() == "true";
	}
	,readAutomations: function() {
		if(this._dom.hasNode.resolve("MasterTrack") && this._dom.node.resolve("MasterTrack").hasNode.resolve("Automations")) {
			var $it0 = this._dom.node.resolve("MasterTrack").node.resolve("Automations").nodes.resolve("Automation").iterator();
			while( $it0.hasNext() ) {
				var automationNode = $it0.next();
				var automation = new alphatab.file.gpx.score.GpxAutomation();
				automation.type = automationNode.node.resolve("Type").get_innerData();
				automation.barId = Std.parseInt(automationNode.node.resolve("Bar").get_innerData());
				automation.value = this.toIntArray(automationNode.node.resolve("Value").get_innerData());
				automation.linear = this.toBool(automationNode.node.resolve("Linear").get_innerData());
				automation.position = Std.parseInt(automationNode.node.resolve("Position").get_innerData());
				automation.visible = this.toBool(automationNode.node.resolve("Visible").get_innerData());
				this._gpxDocument.automations.push(automation);
			}
		}
	}
	,readScore: function() {
		if(this._dom.hasNode.resolve("Score")) {
			var scoreNode = this._dom.node.resolve("Score");
			this._gpxDocument.score.title = scoreNode.node.resolve("Title").get_innerData();
			this._gpxDocument.score.subTitle = scoreNode.node.resolve("SubTitle").get_innerData();
			this._gpxDocument.score.artist = scoreNode.node.resolve("Artist").get_innerData();
			this._gpxDocument.score.album = scoreNode.node.resolve("Album").get_innerData();
			this._gpxDocument.score.words = scoreNode.node.resolve("Words").get_innerData();
			this._gpxDocument.score.music = scoreNode.node.resolve("Music").get_innerData();
			this._gpxDocument.score.wordsAndMusic = scoreNode.node.resolve("WordsAndMusic").get_innerData();
			this._gpxDocument.score.copyright = scoreNode.node.resolve("Copyright").get_innerData();
			this._gpxDocument.score.tabber = scoreNode.node.resolve("Tabber").get_innerData();
			this._gpxDocument.score.instructions = scoreNode.node.resolve("Instructions").get_innerData();
			this._gpxDocument.score.notices = scoreNode.node.resolve("Notices").get_innerData();
			this._gpxDocument.score.pageSetup.width = Std.parseInt(scoreNode.node.resolve("PageSetup").node.resolve("Width").get_innerData());
			this._gpxDocument.score.pageSetup.height = Std.parseInt(scoreNode.node.resolve("PageSetup").node.resolve("Height").get_innerData());
			this._gpxDocument.score.pageSetup.orientation = scoreNode.node.resolve("PageSetup").node.resolve("Orientation").get_innerData();
			this._gpxDocument.score.pageSetup.margin = new alphatab.model.Padding(Std.parseInt(scoreNode.node.resolve("PageSetup").node.resolve("RightMargin").get_innerData()),Std.parseInt(scoreNode.node.resolve("PageSetup").node.resolve("TopMargin").get_innerData()),Std.parseInt(scoreNode.node.resolve("PageSetup").node.resolve("LeftMargin").get_innerData()),Std.parseInt(scoreNode.node.resolve("PageSetup").node.resolve("BottomMargin").get_innerData()));
			this._gpxDocument.score.pageSetup.scale = Std.parseFloat(scoreNode.node.resolve("PageSetup").node.resolve("Scale").get_innerData());
		}
	}
	,read: function() {
		if(this._xmlDocument != null) {
			this.readScore();
			this.readAutomations();
			this.readTracks();
			this.readMasterBars();
			this.readBars();
			this.readVoices();
			this.readBeats();
			this.readNotes();
			this.readRhythms();
		}
		return this._gpxDocument;
	}
	,__class__: alphatab.file.gpx.DocumentReader
}
alphatab.file.gpx.File = function(fileName,fileContents) {
	this.fileName = fileName;
	this.fileContents = fileContents;
};
alphatab.file.gpx.File.__name__ = true;
alphatab.file.gpx.File.prototype = {
	__class__: alphatab.file.gpx.File
}
alphatab.file.gpx.FileSystem = function() {
	this._fileSystem = new Array();
};
alphatab.file.gpx.FileSystem.__name__ = true;
alphatab.file.gpx.FileSystem.prototype = {
	getBytes: function(source,offset,length) {
		var bytes = new Array();
		var i = 0;
		while(i < length) {
			if(source.length >= offset + i) bytes.push(source[offset + i]);
			i++;
		}
		return bytes;
	}
	,getString: function(source,offset,length) {
		var charsLength = 0;
		var i = 0;
		var str = "";
		while(i < length) {
			var charValue = source[offset + i] & 255;
			if(charValue == 0) break;
			str += String.fromCharCode(charValue);
			i++;
		}
		return str;
	}
	,getInteger: function(source,offset) {
		return (source[offset + 3] & 255) << 24 | (source[offset + 2] & 255) << 16 | (source[offset + 1] & 255) << 8 | source[offset] & 255;
	}
	,load2: function(header,srcBuffer) {
		if(header == 1397113666) {
			var bcfsBytes = srcBuffer.readBytes(srcBuffer.length());
			var sectorSize = 4096;
			var offset = 0;
			while((offset = offset + sectorSize) + 3 < bcfsBytes.length) if(this.getInteger(bcfsBytes,offset) == 2) {
				var indexFileName = offset + 4;
				var indexFileSize = offset + 140;
				var indexOfBlock = offset + 148;
				var block = 0;
				var blockCount = 0;
				var fileBytesStream = new Array();
				while((block = this.getInteger(bcfsBytes,indexOfBlock + 4 * blockCount++)) != 0) {
					var bytes = this.getBytes(bcfsBytes,offset = block * sectorSize,sectorSize);
					var _g = 0;
					while(_g < bytes.length) {
						var $byte = bytes[_g];
						++_g;
						fileBytesStream.push($byte);
					}
				}
				var fileSize = this.getInteger(bcfsBytes,indexFileSize);
				if(fileBytesStream.length >= fileSize) this._fileSystem.push(new alphatab.file.gpx.File(this.getString(bcfsBytes,indexFileName,127),this.getBytes(fileBytesStream,0,fileSize)));
			}
		} else if(header == 1514554178) {
			var bcfsBuffer = new Array();
			var expectLength = this.getInteger(srcBuffer.readBytes(4),0);
			while(!srcBuffer.eof() && srcBuffer.position() < expectLength) {
				var flag = srcBuffer.readBits(1);
				if(flag == 1) {
					var bits = srcBuffer.readBits(4);
					var offs = srcBuffer.readBitsReversed(bits);
					var size = srcBuffer.readBitsReversed(bits);
					var pos = bcfsBuffer.length - offs;
					var i = 0;
					while(i < (size > offs?offs:size)) {
						bcfsBuffer.push(bcfsBuffer[pos + i]);
						i++;
					}
				} else {
					var size = srcBuffer.readBitsReversed(2);
					var i = 0;
					while(i < size) {
						bcfsBuffer.push(srcBuffer.readBits(8));
						i++;
					}
				}
			}
			var str = "";
			var _g = 0;
			while(_g < bcfsBuffer.length) {
				var $byte = bcfsBuffer[_g];
				++_g;
				str += String.fromCharCode($byte);
			}
			var newReader = new alphatab.io.DataInputStream(new alphatab.io.StringInputStream(str));
			this.load(newReader);
		} else throw new alphatab.file.FileFormatException("This is not a GPX file");
	}
	,load: function(data) {
		var srcBuffer = new alphatab.io.BitInputStream(data);
		var header = this.getInteger(srcBuffer.readBytes(4),0);
		this.load2(header,srcBuffer);
	}
	,getFileContents: function(fileName) {
		var _g = 0, _g1 = this._fileSystem;
		while(_g < _g1.length) {
			var file = _g1[_g];
			++_g;
			if(file.fileName == fileName) return file.fileContents;
		}
		return null;
	}
	,getFileNames: function() {
		var names = new Array();
		var _g = 0, _g1 = this._fileSystem;
		while(_g < _g1.length) {
			var file = _g1[_g];
			++_g;
			names.push(file.fileName);
		}
		return names;
	}
	,__class__: alphatab.file.gpx.FileSystem
}
alphatab.file.gpx.GpxReader = function() {
	alphatab.file.SongReader.call(this);
};
alphatab.file.gpx.GpxReader.__name__ = true;
alphatab.file.gpx.GpxReader.__super__ = alphatab.file.SongReader;
alphatab.file.gpx.GpxReader.prototype = $extend(alphatab.file.SongReader.prototype,{
	readSong: function() {
		try {
			this._fileSystem.load(this.data);
			var reader = new alphatab.file.gpx.DocumentReader(this._fileSystem.getFileContents("score.gpif"));
			var parser = new alphatab.file.gpx.DocumentParser(this.factory,reader.read());
			return parser.parse();
		} catch( $e0 ) {
			if( js.Boot.__instanceof($e0,alphatab.file.FileFormatException) ) {
				var e = $e0;
				throw e;
			} else {
			var e = $e0;
			throw new alphatab.file.FileFormatException(Std.string(e));
			}
		}
	}
	,init: function(data,factory) {
		alphatab.file.SongReader.prototype.init.call(this,data,factory);
		this._fileSystem = new alphatab.file.gpx.FileSystem();
	}
	,__class__: alphatab.file.gpx.GpxReader
});
alphatab.file.gpx.score = {}
alphatab.file.gpx.score.GpxAutomation = function() {
};
alphatab.file.gpx.score.GpxAutomation.__name__ = true;
alphatab.file.gpx.score.GpxAutomation.prototype = {
	__class__: alphatab.file.gpx.score.GpxAutomation
}
alphatab.file.gpx.score.GpxBar = function() {
};
alphatab.file.gpx.score.GpxBar.__name__ = true;
alphatab.file.gpx.score.GpxBar.prototype = {
	__class__: alphatab.file.gpx.score.GpxBar
}
alphatab.file.gpx.score.GpxBeat = function() {
};
alphatab.file.gpx.score.GpxBeat.__name__ = true;
alphatab.file.gpx.score.GpxBeat.prototype = {
	__class__: alphatab.file.gpx.score.GpxBeat
}
alphatab.file.gpx.score.GpxDocument = function() {
	this.score = new alphatab.file.gpx.score.GpxScore();
	this.tracks = new Array();
	this.masterBars = new Array();
	this.bars = new Array();
	this.voices = new Array();
	this.beats = new Array();
	this.notes = new Array();
	this.rhythms = new Array();
	this.automations = new Array();
};
alphatab.file.gpx.score.GpxDocument.__name__ = true;
alphatab.file.gpx.score.GpxDocument.prototype = {
	getAutomation: function(type,untilBarId) {
		var result = null;
		var _g = 0, _g1 = this.automations;
		while(_g < _g1.length) {
			var automation = _g1[_g];
			++_g;
			if(automation.type == type && (automation.barId <= untilBarId && (result == null || automation.barId > result.barId))) result = automation;
		}
		return result;
	}
	,getRhythm: function(id) {
		var _g = 0, _g1 = this.rhythms;
		while(_g < _g1.length) {
			var rhythm = _g1[_g];
			++_g;
			if(rhythm.id == id) return rhythm;
		}
		return null;
	}
	,getNote: function(id) {
		var _g = 0, _g1 = this.notes;
		while(_g < _g1.length) {
			var note = _g1[_g];
			++_g;
			if(note.id == id) return note;
		}
		return null;
	}
	,getBeat: function(id) {
		var _g = 0, _g1 = this.beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			if(beat.id == id) return beat;
		}
		return null;
	}
	,getVoice: function(id) {
		var _g = 0, _g1 = this.voices;
		while(_g < _g1.length) {
			var voice = _g1[_g];
			++_g;
			if(voice.id == id) return voice;
		}
		return null;
	}
	,getBar: function(id) {
		var _g = 0, _g1 = this.bars;
		while(_g < _g1.length) {
			var bar = _g1[_g];
			++_g;
			if(bar.id == id) return bar;
		}
		return null;
	}
	,__class__: alphatab.file.gpx.score.GpxDocument
}
alphatab.file.gpx.score.GpxDrumkit = function(midiValue,element,variation) {
	this.midiValue = midiValue;
	this.element = element;
	this.variation = variation;
};
alphatab.file.gpx.score.GpxDrumkit.__name__ = true;
alphatab.file.gpx.score.GpxDrumkit.get_DRUMKITS = function() {
	if(alphatab.file.gpx.score.GpxDrumkit._kits == null) {
		alphatab.file.gpx.score.GpxDrumkit._kits = new Array();
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(36,0,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(36,0,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(37,1,2));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(38,1,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(41,5,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(42,10,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(43,6,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(44,11,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(45,7,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(46,10,2));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(47,8,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(48,9,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(49,12,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(50,9,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(51,15,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(52,16,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(53,15,2));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(55,14,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(56,3,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(57,13,0));
		alphatab.file.gpx.score.GpxDrumkit._kits.push(new alphatab.file.gpx.score.GpxDrumkit(59,15,1));
	}
	return alphatab.file.gpx.score.GpxDrumkit._kits;
}
alphatab.file.gpx.score.GpxDrumkit.prototype = {
	__class__: alphatab.file.gpx.score.GpxDrumkit
}
alphatab.file.gpx.score.GpxMasterBar = function() {
};
alphatab.file.gpx.score.GpxMasterBar.__name__ = true;
alphatab.file.gpx.score.GpxMasterBar.prototype = {
	__class__: alphatab.file.gpx.score.GpxMasterBar
}
alphatab.file.gpx.score.GpxNote = function() {
	this.id = -1;
	this.fret = -1;
	this.string = -1;
	this.tone = -1;
	this.octave = -1;
	this.element = -1;
	this.variation = -1;
	this.midiNumber = -1;
};
alphatab.file.gpx.score.GpxNote.__name__ = true;
alphatab.file.gpx.score.GpxNote.prototype = {
	__class__: alphatab.file.gpx.score.GpxNote
}
alphatab.file.gpx.score.GpxPageSetup = function() {
};
alphatab.file.gpx.score.GpxPageSetup.__name__ = true;
alphatab.file.gpx.score.GpxPageSetup.prototype = {
	__class__: alphatab.file.gpx.score.GpxPageSetup
}
alphatab.file.gpx.score.GpxRhythm = function() {
};
alphatab.file.gpx.score.GpxRhythm.__name__ = true;
alphatab.file.gpx.score.GpxRhythm.prototype = {
	__class__: alphatab.file.gpx.score.GpxRhythm
}
alphatab.file.gpx.score.GpxScore = function() {
	this.pageSetup = new alphatab.file.gpx.score.GpxPageSetup();
};
alphatab.file.gpx.score.GpxScore.__name__ = true;
alphatab.file.gpx.score.GpxScore.prototype = {
	__class__: alphatab.file.gpx.score.GpxScore
}
alphatab.file.gpx.score.GpxTrack = function() {
};
alphatab.file.gpx.score.GpxTrack.__name__ = true;
alphatab.file.gpx.score.GpxTrack.prototype = {
	__class__: alphatab.file.gpx.score.GpxTrack
}
alphatab.file.gpx.score.GpxVoice = function() {
};
alphatab.file.gpx.score.GpxVoice.__name__ = true;
alphatab.file.gpx.score.GpxVoice.prototype = {
	__class__: alphatab.file.gpx.score.GpxVoice
}
alphatab.file.guitarpro = {}
alphatab.file.guitarpro.GpReaderBase = function() {
	alphatab.file.SongReader.call(this);
};
alphatab.file.guitarpro.GpReaderBase.__name__ = true;
alphatab.file.guitarpro.GpReaderBase.toChannelShort = function(data) {
	var value = Math.max(-32768,Math.min(32767,data * 8 - 1)) | 0;
	return (Math.max(value,-1) | 0) + 1;
}
alphatab.file.guitarpro.GpReaderBase.__super__ = alphatab.file.SongReader;
alphatab.file.guitarpro.GpReaderBase.prototype = $extend(alphatab.file.SongReader.prototype,{
	readVersion: function() {
		try {
			if(this.version == null) this.version = this.readByteSizeString(30,"UTF-8");
			var _g1 = 0, _g = this._supportedVersions.length;
			while(_g1 < _g) {
				var i = _g1++;
				var current = this._supportedVersions[i];
				if(this.version == current) {
					this._versionIndex = i;
					return true;
				}
			}
		} catch( e ) {
			this.version = "Not Supported";
		}
		return false;
	}
	,readIntSizeString: function(charset) {
		if(charset == null) charset = "UTF-8";
		return this.readString(this.data.readInt(),-2,charset);
	}
	,readByteSizeCheckByteString: function(charset) {
		if(charset == null) charset = "UTF-8";
		return this.readByteSizeString(this.data.readByte() - 1,charset);
	}
	,readIntSizeCheckByteString: function(charset) {
		if(charset == null) charset = "UTF-8";
		var d = this.data.readInt() - 1;
		return this.readByteSizeString(d,charset);
	}
	,readString: function(size,len,charset) {
		if(charset == null) charset = "UTF-8";
		if(len == null) len = -2;
		if(len == -2) len = size;
		var count = size > 0?size:len;
		var s = this.data.readString(count);
		return HxOverrides.substr(s,0,len >= 0?len:size);
	}
	,readByteSizeString: function(size,charset) {
		if(charset == null) charset = "UTF-8";
		return this.readString(size,this.data.readByte(),charset);
	}
	,skip: function(count) {
		this.data.skip(count);
	}
	,initVersions: function(supportedVersions) {
		this._supportedVersions = supportedVersions;
	}
	,init: function(data,factory) {
		alphatab.file.SongReader.prototype.init.call(this,data,factory);
		data.bigEndian = false;
	}
	,__class__: alphatab.file.guitarpro.GpReaderBase
});
alphatab.file.guitarpro.Gp3Reader = function() {
	alphatab.file.guitarpro.GpReaderBase.call(this);
	this.initVersions(["FICHIER GUITAR PRO v3.00"]);
};
alphatab.file.guitarpro.Gp3Reader.__name__ = true;
alphatab.file.guitarpro.Gp3Reader.toKeySignature = function(p) {
	return p < 0?7 + (Math.abs(p) | 0):p;
}
alphatab.file.guitarpro.Gp3Reader.toStrokeValue = function(value) {
	switch(value) {
	case 1:
		return alphatab.model.Duration.SIXTY_FOURTH;
	case 2:
		return alphatab.model.Duration.SIXTY_FOURTH;
	case 3:
		return alphatab.model.Duration.THIRTY_SECOND;
	case 4:
		return alphatab.model.Duration.SIXTEENTH;
	case 5:
		return alphatab.model.Duration.EIGHTH;
	case 6:
		return alphatab.model.Duration.QUARTER;
	default:
		return alphatab.model.Duration.SIXTY_FOURTH;
	}
}
alphatab.file.guitarpro.Gp3Reader.__super__ = alphatab.file.guitarpro.GpReaderBase;
alphatab.file.guitarpro.Gp3Reader.prototype = $extend(alphatab.file.guitarpro.GpReaderBase.prototype,{
	readInfo: function(song) {
		song.title = this.readIntSizeCheckByteString();
		song.subtitle = this.readIntSizeCheckByteString();
		song.artist = this.readIntSizeCheckByteString();
		song.album = this.readIntSizeCheckByteString();
		song.words = this.readIntSizeCheckByteString();
		song.music = song.words;
		song.copyright = this.readIntSizeCheckByteString();
		song.tab = this.readIntSizeCheckByteString();
		song.instructions = this.readIntSizeCheckByteString();
		var iNotes = this.data.readInt();
		song.notice = "";
		var _g = 0;
		while(_g < iNotes) {
			var i = _g++;
			song.notice += this.readIntSizeCheckByteString() + "\n";
		}
	}
	,readLyrics: function(song) {
		song.lyrics = this.factory.newLyrics();
	}
	,readPageSetup: function(song) {
		var setup = this.factory.newPageSetup();
		song.pageSetup = setup;
	}
	,readMidiChannels: function() {
		var channels = new Array();
		var _g = 0;
		while(_g < 64) {
			var i = _g++;
			var newChannel = this.factory.newMidiChannel();
			newChannel.channel = i;
			newChannel.effectChannel = i;
			newChannel.instrument(this.data.readInt());
			newChannel.volume = alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.data.readSignedByte());
			newChannel.balance = alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.data.readSignedByte());
			newChannel.chorus = alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.data.readSignedByte());
			newChannel.reverb = alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.data.readSignedByte());
			newChannel.phaser = alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.data.readSignedByte());
			newChannel.tremolo = alphatab.file.guitarpro.GpReaderBase.toChannelShort(this.data.readSignedByte());
			channels.push(newChannel);
			this.skip(2);
		}
		return channels;
	}
	,readColor: function() {
		var r = this.data.readByte();
		var g = this.data.readByte();
		var b = this.data.readByte();
		this.skip(1);
		return alphatab.model.Color.fromRgb(r,g,b);
	}
	,readMarker: function(header) {
		var marker = this.factory.newMarker();
		marker.measureHeader = header;
		marker.title = this.readIntSizeCheckByteString();
		marker.color = this.readColor();
		return marker;
	}
	,parseRepeatAlternative: function(song,measure,value) {
		var repeatAlternative = 0;
		var existentAlternatives = 0;
		var _g1 = 0, _g = song.measureHeaders.length;
		while(_g1 < _g) {
			var i = _g1++;
			var header = song.measureHeaders[i];
			if(header.number == measure) break;
			if(header.isRepeatOpen) existentAlternatives = 0;
			existentAlternatives |= header.repeatAlternative;
		}
		var _g = 0;
		while(_g < 8) {
			var i = _g++;
			if(value > i && (existentAlternatives & 1 << i) == 0) repeatAlternative |= 1 << i;
		}
		return repeatAlternative;
	}
	,readMeasureHeader: function(i,timeSignature,song) {
		var flags = this.data.readByte();
		var header = this.factory.newMeasureHeader();
		header.number = i + 1;
		header.start = 0;
		header.tempo.value = song.tempo;
		header.tripletFeel = this._tripletFeel;
		if((flags & 1) != 0) timeSignature.numerator = this.data.readSignedByte();
		if((flags & 2) != 0) timeSignature.denominator.value = this.data.readSignedByte();
		header.isRepeatOpen = (flags & 4) != 0;
		timeSignature.copy(header.timeSignature);
		if((flags & 8) != 0) header.repeatClose = this.data.readSignedByte() - 1;
		if((flags & 16) != 0) header.repeatAlternative = this.parseRepeatAlternative(song,header.number,this.data.readByte());
		if((flags & 32) != 0) header.marker = this.readMarker(header);
		if((flags & 64) != 0) {
			header.keySignature = alphatab.file.guitarpro.Gp3Reader.toKeySignature(this.data.readSignedByte());
			header.keySignatureType = this.data.readSignedByte();
		} else if(header.number > 1) {
			header.keySignature = song.measureHeaders[i - 1].keySignature;
			header.keySignatureType = song.measureHeaders[i - 1].keySignatureType;
		}
		header.hasDoubleBar = (flags & 128) != 0;
		return header;
	}
	,readMeasureHeaders: function(song,measureCount) {
		var timeSignature = this.factory.newTimeSignature();
		var _g = 0;
		while(_g < measureCount) {
			var i = _g++;
			song.addMeasureHeader(this.readMeasureHeader(i,timeSignature,song));
		}
	}
	,readChannel: function(midiChannel,channels) {
		var index = this.data.readInt() - 1;
		var effectChannel = this.data.readInt() - 1;
		if(index >= 0 && index < channels.length) {
			channels[index].copy(midiChannel);
			if(midiChannel.instrument() < 0) midiChannel.instrument(0);
			if(!midiChannel.isPercussionChannel()) midiChannel.effectChannel = effectChannel;
		}
	}
	,readTrack: function(number,channels) {
		var flags = this.data.readByte();
		var track = this.factory.newTrack();
		track.isPercussionTrack = (flags & 1) != 0;
		track.is12StringedGuitarTrack = (flags & 2) != 0;
		track.isBanjoTrack = (flags & 4) != 0;
		track.number = number;
		track.name = this.readByteSizeString(40);
		var stringCount = this.data.readInt();
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var iTuning = this.data.readInt();
			if(stringCount > i) {
				var oString = this.factory.newString();
				oString.number = i + 1;
				oString.value = iTuning;
				track.strings.push(oString);
			}
		}
		track.port = this.data.readInt();
		this.readChannel(track.channel,channels);
		if(track.channel.channel == 9) track.isPercussionTrack = true;
		track.fretCount = this.data.readInt();
		track.offset = this.data.readInt();
		track.color = this.readColor();
		return track;
	}
	,readTracks: function(song,trackCount,channels) {
		var _g1 = 1, _g = trackCount + 1;
		while(_g1 < _g) {
			var i = _g1++;
			song.addTrack(this.readTrack(i,channels));
		}
	}
	,getBeat: function(measure,start) {
		var _g1 = 0, _g = measure.beats.length;
		while(_g1 < _g) {
			var b = _g1++;
			var beat = measure.beats[b];
			if(beat.start == start) return beat;
		}
		var newBeat = this.factory.newBeat();
		newBeat.start = start;
		measure.addBeat(newBeat);
		return newBeat;
	}
	,readDuration: function(flags) {
		var duration = this.factory.newDuration();
		duration.value = Math.round(Math.pow(2,this.data.readSignedByte() + 4) / 4);
		duration.isDotted = (flags & 1) != 0;
		if((flags & 32) != 0) {
			var iTuplet = this.data.readInt();
			switch(iTuplet) {
			case 3:
				duration.tuplet.enters = 3;
				duration.tuplet.times = 2;
				break;
			case 5:
				duration.tuplet.enters = 5;
				duration.tuplet.times = 4;
				break;
			case 6:
				duration.tuplet.enters = 6;
				duration.tuplet.times = 4;
				break;
			case 7:
				duration.tuplet.enters = 7;
				duration.tuplet.times = 4;
				break;
			case 9:
				duration.tuplet.enters = 9;
				duration.tuplet.times = 8;
				break;
			case 10:
				duration.tuplet.enters = 10;
				duration.tuplet.times = 8;
				break;
			case 11:
				duration.tuplet.enters = 11;
				duration.tuplet.times = 8;
				break;
			case 12:
				duration.tuplet.enters = 12;
				duration.tuplet.times = 8;
				break;
			}
		}
		return duration;
	}
	,readChord: function(stringCount,beat) {
		var chord = this.factory.newChord(stringCount);
		if((this.data.readByte() & 1) == 0) {
			chord.name = this.readIntSizeCheckByteString();
			chord.firstFret = this.data.readInt();
			if(chord.firstFret != 0) {
				var _g = 0;
				while(_g < 6) {
					var i = _g++;
					var fret = this.data.readInt();
					if(i < chord.strings.length) chord.strings[i] = fret;
				}
			}
		} else {
			this.skip(25);
			chord.name = this.readByteSizeString(34);
			chord.firstFret = this.data.readInt();
			var _g = 0;
			while(_g < 6) {
				var i = _g++;
				var fret = this.data.readInt();
				if(i < chord.strings.length) chord.strings[i] = fret;
			}
			this.skip(36);
		}
		if(chord.noteCount() > 0) beat.setChord(chord);
	}
	,readText: function(beat) {
		var text = this.factory.newText();
		text.value = this.readIntSizeCheckByteString();
		beat.setText(text);
	}
	,readTremoloBar: function(effect) {
		var barEffect = this.factory.newBendEffect();
		barEffect.type = this.data.readSignedByte();
		barEffect.value = this.data.readInt();
		barEffect.points.push(new alphatab.model.effects.BendPoint(0,0,false));
		barEffect.points.push(new alphatab.model.effects.BendPoint(Math.round(6.),Math.round(barEffect.value / 50),false));
		barEffect.points.push(new alphatab.model.effects.BendPoint(12,0,false));
		effect.tremoloBar = barEffect;
	}
	,readBeatEffects: function(beat,effect) {
		var flags1 = this.data.readByte();
		beat.effect.fadeIn = (flags1 & 16) != 0;
		beat.effect.vibrato = (flags1 & 2) != 0 || beat.effect.vibrato;
		if((flags1 & 32) != 0) {
			var slapEffect = this.data.readByte();
			if(slapEffect == 0) this.readTremoloBar(beat.effect); else {
				beat.effect.tapping = slapEffect == 1;
				beat.effect.slapping = slapEffect == 2;
				beat.effect.popping = slapEffect == 3;
				this.data.readInt();
			}
		}
		if((flags1 & 64) != 0) {
			var strokeUp = this.data.readSignedByte();
			var strokeDown = this.data.readSignedByte();
			if(strokeUp > 0) {
				beat.effect.stroke.direction = 1;
				beat.effect.stroke.value = alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeUp);
			} else if(strokeDown > 0) {
				beat.effect.stroke.direction = 2;
				beat.effect.stroke.value = alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeDown);
			}
		}
		if((flags1 & 4) != 0) {
			var harmonic = this.factory.newHarmonicEffect();
			harmonic.type = 0;
			effect.harmonic = harmonic;
		}
		if((flags1 & 8) != 0) {
			var harmonic = this.factory.newHarmonicEffect();
			harmonic.type = 1;
			harmonic.data = 0;
			effect.harmonic = harmonic;
		}
	}
	,readMixTableChange: function(measure) {
		var tableChange = this.factory.newMixTableChange();
		tableChange.instrument.value = this.data.readSignedByte();
		tableChange.volume.value = this.data.readSignedByte();
		tableChange.balance.value = this.data.readSignedByte();
		tableChange.chorus.value = this.data.readSignedByte();
		tableChange.reverb.value = this.data.readSignedByte();
		tableChange.phaser.value = this.data.readSignedByte();
		tableChange.tremolo.value = this.data.readSignedByte();
		tableChange.tempoName = "";
		tableChange.tempo.value = this.data.readInt();
		if(tableChange.instrument.value < 0) tableChange.instrument = null;
		if(tableChange.volume.value >= 0) tableChange.volume.duration = this.data.readSignedByte(); else tableChange.volume = null;
		if(tableChange.balance.value >= 0) tableChange.balance.duration = this.data.readSignedByte(); else tableChange.balance = null;
		if(tableChange.chorus.value >= 0) tableChange.chorus.duration = this.data.readSignedByte(); else tableChange.chorus = null;
		if(tableChange.reverb.value >= 0) tableChange.reverb.duration = this.data.readSignedByte(); else tableChange.reverb = null;
		if(tableChange.phaser.value >= 0) tableChange.phaser.duration = this.data.readSignedByte(); else tableChange.phaser = null;
		if(tableChange.tremolo.value >= 0) tableChange.tremolo.duration = this.data.readSignedByte(); else tableChange.tremolo = null;
		if(tableChange.tempo.value >= 0) {
			tableChange.tempo.duration = this.data.readSignedByte();
			measure.header.tempo.value = tableChange.tempo.value;
			tableChange.hideTempo = false;
		} else tableChange.tempo = null;
		return tableChange;
	}
	,readBend: function(noteEffect) {
		var bendEffect = this.factory.newBendEffect();
		bendEffect.type = this.data.readSignedByte();
		bendEffect.value = this.data.readInt();
		var pointCount = this.data.readInt();
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round(this.data.readInt() * 12 / 60);
			var pointValue = Math.round(this.data.readInt() / 25);
			var vibrato = this.data.readBool();
			bendEffect.points.push(new alphatab.model.effects.BendPoint(pointPosition,pointValue,vibrato));
		}
		if(pointCount > 0) noteEffect.bend = bendEffect;
	}
	,readGrace: function(noteEffect) {
		var fret = this.data.readByte();
		var dyn = this.data.readByte();
		var transition = this.data.readSignedByte();
		var duration = this.data.readByte();
		var grace = this.factory.newGraceEffect();
		grace.fret = fret;
		grace.velocity = 15 + 16 * dyn - 16;
		grace.duration = duration;
		grace.isDead = fret == 255;
		grace.isOnBeat = false;
		switch(transition) {
		case 0:
			grace.transition = 0;
			break;
		case 1:
			grace.transition = 1;
			break;
		case 2:
			grace.transition = 2;
			break;
		case 3:
			grace.transition = 3;
			break;
		}
		noteEffect.grace = grace;
	}
	,readNoteEffects: function(noteEffect) {
		var flags1 = this.data.readByte();
		noteEffect.slide = (flags1 & 4) != 0;
		noteEffect.hammer = (flags1 & 2) != 0;
		noteEffect.letRing = (flags1 & 8) != 0;
		if((flags1 & 1) != 0) this.readBend(noteEffect);
		if((flags1 & 16) != 0) this.readGrace(noteEffect);
	}
	,readNote: function(guitarString,track,effect) {
		var flags = this.data.readByte();
		var note = this.factory.newNote();
		note.string = guitarString.number;
		note.effect = effect;
		note.effect.accentuatedNote = (flags & 64) != 0;
		note.effect.heavyAccentuatedNote = (flags & 2) != 0;
		note.effect.ghostNote = (flags & 4) != 0;
		if((flags & 32) != 0) {
			var noteType = this.data.readByte();
			note.isTiedNote = noteType == 2;
			note.effect.deadNote = noteType == 3;
		}
		if((flags & 1) != 0) {
			note.duration = this.data.readSignedByte();
			note.tuplet = this.data.readSignedByte();
		}
		if((flags & 16) != 0) note.velocity = 15 + 16 * this.data.readSignedByte() - 16;
		if((flags & 32) != 0) {
			var fret = this.data.readSignedByte();
			var value = note.isTiedNote?this.getTiedNoteValue(guitarString.number,track):fret;
			note.value = value >= 0 && value < 100?value:0;
		}
		if((flags & 128) != 0) {
			note.effect.leftHandFinger = this.data.readSignedByte();
			note.effect.rightHandFinger = this.data.readSignedByte();
			note.effect.isFingering = true;
		}
		if((flags & 8) != 0) this.readNoteEffects(note.effect);
		return note;
	}
	,readBeat: function(start,measure,track,voiceIndex) {
		var flags = this.data.readByte();
		var beat = this.getBeat(measure,start);
		var voice = beat.voices[voiceIndex];
		if((flags & 64) != 0) {
			var beatType = this.data.readByte();
			voice.isEmpty = (beatType & 2) == 0;
		}
		var duration = this.readDuration(flags);
		var effect = this.factory.newNoteEffect();
		if((flags & 2) != 0) this.readChord(track.stringCount(),beat);
		if((flags & 4) != 0) this.readText(beat);
		if((flags & 8) != 0) this.readBeatEffects(beat,effect);
		if((flags & 16) != 0) {
			var mixTableChange = this.readMixTableChange(measure);
			beat.effect.mixTableChange = mixTableChange;
		}
		var stringFlags = this.data.readByte();
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & 1 << i) != 0 && 6 - i < track.stringCount()) {
				var guitarString = track.strings[6 - i].clone(this.factory);
				var note = this.readNote(guitarString,track,effect.clone(this.factory));
				voice.addNote(note);
			}
			duration.copy(voice.duration);
		}
		return !voice.isEmpty?duration.time():0;
	}
	,readMeasure: function(measure,track) {
		var start = measure.header.start;
		var beats = this.data.readInt();
		var _g = 0;
		while(_g < beats) {
			var beat = _g++;
			start += this.readBeat(start,measure,track,0);
		}
	}
	,readMeasures: function(song) {
		var tempo = this.factory.newTempo();
		tempo.value = song.tempo;
		var start = alphatab.model.Duration.QUARTER_TIME;
		var _g1 = 0, _g = song.measureHeaders.length;
		while(_g1 < _g) {
			var h = _g1++;
			var header = song.measureHeaders[h];
			header.start = start;
			var _g3 = 0, _g2 = song.tracks.length;
			while(_g3 < _g2) {
				var t = _g3++;
				var track = song.tracks[t];
				var measure = this.factory.newMeasure(header);
				header.tempo.copy(tempo);
				track.addMeasure(measure);
				this.readMeasure(measure,track);
			}
			tempo.copy(header.tempo);
			start += header.length();
		}
	}
	,readSong: function() {
		if(!this.readVersion()) throw new alphatab.file.FileFormatException("Unsupported Version");
		var song = this.factory.newSong();
		this.readInfo(song);
		this._tripletFeel = this.data.readBool()?1:0;
		this.readLyrics(song);
		this.readPageSetup(song);
		song.tempoName = "";
		song.tempo = this.data.readInt();
		song.hideTempo = false;
		song.key = this.data.readInt();
		song.octave = 0;
		var channels = this.readMidiChannels();
		var measureCount = this.data.readInt();
		var trackCount = this.data.readInt();
		this.readMeasureHeaders(song,measureCount);
		this.readTracks(song,trackCount,channels);
		this.readMeasures(song);
		return song;
	}
	,__class__: alphatab.file.guitarpro.Gp3Reader
});
alphatab.file.guitarpro.Gp4Reader = function() {
	alphatab.file.guitarpro.Gp3Reader.call(this);
	this.initVersions(["FICHIER GUITAR PRO v4.00","FICHIER GUITAR PRO v4.06","FICHIER GUITAR PRO L4.06"]);
};
alphatab.file.guitarpro.Gp4Reader.__name__ = true;
alphatab.file.guitarpro.Gp4Reader.__super__ = alphatab.file.guitarpro.Gp3Reader;
alphatab.file.guitarpro.Gp4Reader.prototype = $extend(alphatab.file.guitarpro.Gp3Reader.prototype,{
	readChord: function(stringCount,beat) {
		var chord = this.factory.newChord(stringCount);
		if((this.data.readSignedByte() & 1) == 0) {
			chord.name = this.readIntSizeCheckByteString();
			chord.firstFret = this.data.readInt();
			if(chord.firstFret != 0) {
				var _g = 0;
				while(_g < 6) {
					var i = _g++;
					var fret = this.data.readInt();
					if(i < chord.strings.length) chord.strings[i] = fret;
				}
			}
		} else {
			this.skip(16);
			chord.name = this.readByteSizeString(21);
			this.skip(4);
			chord.firstFret = this.data.readInt();
			var _g = 0;
			while(_g < 7) {
				var i = _g++;
				var fret = this.data.readInt();
				if(i < chord.strings.length) chord.strings[i] = fret;
			}
			this.skip(32);
		}
		if(chord.noteCount() > 0) beat.setChord(chord);
	}
	,readTremoloBar: function(effect) {
		var barEffect = this.factory.newBendEffect();
		barEffect.type = this.data.readSignedByte();
		barEffect.value = this.data.readInt();
		var pointCount = this.data.readInt();
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var pointPosition = Math.round(this.data.readInt() * 12 / 60);
			var pointValue = Math.round(this.data.readInt() / 50.);
			var vibrato = this.data.readBool();
			barEffect.points.push(new alphatab.model.effects.BendPoint(pointPosition,pointValue,vibrato));
		}
		if(pointCount > 0) effect.tremoloBar = barEffect;
	}
	,readBeatEffects: function(beat,effect) {
		var flags1 = this.data.readSignedByte();
		var flags2 = this.data.readSignedByte();
		beat.effect.fadeIn = (flags1 & 16) != 0;
		beat.effect.vibrato = (flags1 & 2) != 0 || beat.effect.vibrato;
		if((flags1 & 32) != 0) {
			var slapEffect = this.data.readSignedByte();
			beat.effect.tapping = slapEffect == 1;
			beat.effect.slapping = slapEffect == 2;
			beat.effect.popping = slapEffect == 3;
		}
		if((flags2 & 4) != 0) this.readTremoloBar(beat.effect);
		if((flags1 & 64) != 0) {
			var strokeUp = this.data.readSignedByte();
			var strokeDown = this.data.readSignedByte();
			if(strokeUp > 0) {
				beat.effect.stroke.direction = 1;
				beat.effect.stroke.value = alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeUp);
			} else if(strokeDown > 0) {
				beat.effect.stroke.direction = 2;
				beat.effect.stroke.value = alphatab.file.guitarpro.Gp3Reader.toStrokeValue(strokeDown);
			}
		}
		beat.effect.hasRasgueado = (flags2 & 1) != 0;
		if((flags2 & 2) != 0) {
			beat.effect.pickStroke = this.data.readSignedByte();
			beat.effect.hasPickStroke = true;
		}
	}
	,readMixTableChange: function(measure) {
		var tableChange = this.factory.newMixTableChange();
		tableChange.instrument.value = this.data.readSignedByte();
		tableChange.volume.value = this.data.readSignedByte();
		tableChange.balance.value = this.data.readSignedByte();
		tableChange.chorus.value = this.data.readSignedByte();
		tableChange.reverb.value = this.data.readSignedByte();
		tableChange.phaser.value = this.data.readSignedByte();
		tableChange.tremolo.value = this.data.readSignedByte();
		tableChange.tempoName = "";
		tableChange.tempo.value = this.data.readInt();
		if(tableChange.instrument.value < 0) tableChange.instrument = null;
		if(tableChange.volume.value >= 0) tableChange.volume.duration = this.data.readSignedByte(); else tableChange.volume = null;
		if(tableChange.balance.value >= 0) tableChange.balance.duration = this.data.readSignedByte(); else tableChange.balance = null;
		if(tableChange.chorus.value >= 0) tableChange.chorus.duration = this.data.readSignedByte(); else tableChange.chorus = null;
		if(tableChange.reverb.value >= 0) tableChange.reverb.duration = this.data.readSignedByte(); else tableChange.reverb = null;
		if(tableChange.phaser.value >= 0) tableChange.phaser.duration = this.data.readSignedByte(); else tableChange.phaser = null;
		if(tableChange.tremolo.value >= 0) tableChange.tremolo.duration = this.data.readSignedByte(); else tableChange.tremolo = null;
		if(tableChange.tempo.value >= 0) {
			tableChange.tempo.duration = this.data.readSignedByte();
			measure.header.tempo.value = tableChange.tempo.value;
			tableChange.hideTempo = false;
		} else tableChange.tempo = null;
		var allTracksFlags = this.data.readSignedByte();
		if(tableChange.volume != null) tableChange.volume.allTracks = (allTracksFlags & 1) != 0;
		if(tableChange.balance != null) tableChange.balance.allTracks = (allTracksFlags & 2) != 0;
		if(tableChange.chorus != null) tableChange.chorus.allTracks = (allTracksFlags & 4) != 0;
		if(tableChange.reverb != null) tableChange.reverb.allTracks = (allTracksFlags & 8) != 0;
		if(tableChange.phaser != null) tableChange.phaser.allTracks = (allTracksFlags & 16) != 0;
		if(tableChange.tremolo != null) tableChange.tremolo.allTracks = (allTracksFlags & 32) != 0;
		if(tableChange.tempo != null) tableChange.tempo.allTracks = true;
		return tableChange;
	}
	,readTremoloPicking: function(noteEffect) {
		var value = this.data.readSignedByte();
		var tp = this.factory.newTremoloPickingEffect();
		switch(value) {
		case 1:
			tp.duration.value = alphatab.model.Duration.EIGHTH;
			noteEffect.tremoloPicking = tp;
			break;
		case 2:
			tp.duration.value = alphatab.model.Duration.SIXTEENTH;
			noteEffect.tremoloPicking = tp;
			break;
		case 3:
			tp.duration.value = alphatab.model.Duration.THIRTY_SECOND;
			noteEffect.tremoloPicking = tp;
			break;
		}
	}
	,readArtificialHarmonic: function(noteEffect) {
		var type = this.data.readSignedByte();
		var oHarmonic = this.factory.newHarmonicEffect();
		oHarmonic.data = 0;
		switch(type) {
		case 1:
			oHarmonic.type = 0;
			noteEffect.harmonic = oHarmonic;
			break;
		case 3:
			this.skip(1);
			oHarmonic.type = 2;
			noteEffect.harmonic = oHarmonic;
			break;
		case 4:
			oHarmonic.type = 3;
			noteEffect.harmonic = oHarmonic;
			break;
		case 5:
			oHarmonic.type = 4;
			noteEffect.harmonic = oHarmonic;
			break;
		case 15:
			oHarmonic.data = 2;
			oHarmonic.type = 1;
			noteEffect.harmonic = oHarmonic;
			break;
		case 17:
			oHarmonic.data = 3;
			oHarmonic.type = 1;
			noteEffect.harmonic = oHarmonic;
			break;
		case 22:
			oHarmonic.data = 0;
			oHarmonic.type = 1;
			noteEffect.harmonic = oHarmonic;
			break;
		}
	}
	,readTrill: function(noteEffect) {
		var fret = this.data.readSignedByte();
		var period = this.data.readSignedByte();
		var trill = this.factory.newTrillEffect();
		trill.fret = fret;
		switch(period) {
		case 1:
			trill.duration.value = alphatab.model.Duration.SIXTEENTH;
			noteEffect.trill = trill;
			break;
		case 2:
			trill.duration.value = alphatab.model.Duration.THIRTY_SECOND;
			noteEffect.trill = trill;
			break;
		case 3:
			trill.duration.value = alphatab.model.Duration.SIXTY_FOURTH;
			noteEffect.trill = trill;
			break;
		}
	}
	,readNoteEffects: function(noteEffect) {
		var flags1 = this.data.readSignedByte();
		var flags2 = this.data.readSignedByte();
		if((flags1 & 1) != 0) this.readBend(noteEffect);
		if((flags1 & 16) != 0) this.readGrace(noteEffect);
		if((flags2 & 4) != 0) this.readTremoloPicking(noteEffect);
		if((flags2 & 8) != 0) {
			noteEffect.slide = true;
			var type = this.data.readSignedByte();
			switch(type) {
			case 1:
				noteEffect.slideType = 0;
				break;
			case 2:
				noteEffect.slideType = 1;
				break;
			case 4:
				noteEffect.slideType = 2;
				break;
			case 8:
				noteEffect.slideType = 3;
				break;
			case 16:
				noteEffect.slideType = 4;
				break;
			case 32:
				noteEffect.slideType = 5;
				break;
			}
		}
		if((flags2 & 16) != 0) this.readArtificialHarmonic(noteEffect);
		if((flags2 & 32) != 0) this.readTrill(noteEffect);
		noteEffect.letRing = (flags1 & 8) != 0;
		noteEffect.hammer = (flags1 & 2) != 0;
		noteEffect.vibrato = (flags2 & 64) != 0 || noteEffect.vibrato;
		noteEffect.palmMute = (flags2 & 2) != 0;
		noteEffect.staccato = (flags2 & 1) != 0;
	}
	,readBeat: function(start,measure,track,voiceIndex) {
		var flags = this.data.readSignedByte();
		var beat = this.getBeat(measure,start);
		var voice = beat.voices[voiceIndex];
		if((flags & 64) != 0) {
			var beatType = this.data.readSignedByte();
			voice.isEmpty = (beatType & 2) == 0;
		}
		var duration = this.readDuration(flags);
		if((flags & 2) != 0) this.readChord(track.stringCount(),beat);
		if((flags & 4) != 0) this.readText(beat);
		if((flags & 8) != 0) this.readBeatEffects(beat,null);
		if((flags & 16) != 0) {
			var mixTableChange = this.readMixTableChange(measure);
			beat.effect.mixTableChange = mixTableChange;
		}
		var stringFlags = this.data.readSignedByte();
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & 1 << i) != 0 && 6 - i < track.stringCount()) {
				var guitarString = track.strings[6 - i].clone(this.factory);
				var note = this.readNote(guitarString,track,this.factory.newNoteEffect());
				voice.addNote(note);
			}
			duration.copy(voice.duration);
		}
		return !voice.isEmpty?duration.time():0;
	}
	,readLyrics: function(song) {
		song.lyrics = this.factory.newLyrics();
		song.lyrics.trackChoice = this.data.readInt();
		var _g = 0;
		while(_g < 5) {
			var i = _g++;
			var line = this.factory.newLyricLine();
			line.startingMeasure = this.data.readInt();
			line.lyrics = this.readIntSizeString();
			song.lyrics.lines.push(line);
		}
	}
	,readSong: function() {
		if(!this.readVersion()) throw new alphatab.file.FileFormatException("Unsupported Version");
		var song = this.factory.newSong();
		this.readInfo(song);
		this._tripletFeel = this.data.readBool()?1:0;
		this.readLyrics(song);
		this.readPageSetup(song);
		song.tempoName = "";
		song.tempo = this.data.readInt();
		song.hideTempo = false;
		song.key = this.data.readInt();
		song.octave = this.data.readSignedByte();
		var channels = this.readMidiChannels();
		var measureCount = this.data.readInt();
		var trackCount = this.data.readInt();
		this.readMeasureHeaders(song,measureCount);
		this.readTracks(song,trackCount,channels);
		this.readMeasures(song);
		return song;
	}
	,__class__: alphatab.file.guitarpro.Gp4Reader
});
alphatab.file.guitarpro.Gp5Reader = function() {
	alphatab.file.guitarpro.Gp4Reader.call(this);
	this.initVersions(["FICHIER GUITAR PRO v5.00","FICHIER GUITAR PRO v5.10"]);
};
alphatab.file.guitarpro.Gp5Reader.__name__ = true;
alphatab.file.guitarpro.Gp5Reader.__super__ = alphatab.file.guitarpro.Gp4Reader;
alphatab.file.guitarpro.Gp5Reader.prototype = $extend(alphatab.file.guitarpro.Gp4Reader.prototype,{
	readInfo: function(song) {
		song.title = this.readIntSizeCheckByteString();
		song.subtitle = this.readIntSizeCheckByteString();
		song.artist = this.readIntSizeCheckByteString();
		song.album = this.readIntSizeCheckByteString();
		song.words = this.readIntSizeCheckByteString();
		song.music = this.readIntSizeCheckByteString();
		song.copyright = this.readIntSizeCheckByteString();
		song.tab = this.readIntSizeCheckByteString();
		song.instructions = this.readIntSizeCheckByteString();
		var iNotes = this.data.readInt();
		song.notice = "";
		var _g = 0;
		while(_g < iNotes) {
			var i = _g++;
			song.notice += this.readIntSizeCheckByteString() + "\n";
		}
	}
	,readPageSetup: function(song) {
		var setup = this.factory.newPageSetup();
		if(this._versionIndex > 0) this.skip(19);
		setup.pageSize = new alphatab.model.Point(this.data.readInt(),this.data.readInt());
		var l = this.data.readInt();
		var r = this.data.readInt();
		var t = this.data.readInt();
		var b = this.data.readInt();
		setup.pageMargin = new alphatab.model.Padding(l,t,r,b);
		setup.scoreSizeProportion = this.data.readInt() / 100.0;
		setup.headerAndFooter = this.data.readByte();
		var flags2 = this.data.readByte();
		if((flags2 & 1) != 0) setup.headerAndFooter |= 256;
		setup.title = this.readIntSizeCheckByteString();
		setup.subtitle = this.readIntSizeCheckByteString();
		setup.artist = this.readIntSizeCheckByteString();
		setup.album = this.readIntSizeCheckByteString();
		setup.words = this.readIntSizeCheckByteString();
		setup.music = this.readIntSizeCheckByteString();
		setup.wordsAndMusic = this.readIntSizeCheckByteString();
		setup.copyright = this.readIntSizeCheckByteString() + "\n" + this.readIntSizeCheckByteString();
		setup.pageNumber = this.readIntSizeCheckByteString();
		song.pageSetup = setup;
	}
	,readMeasureHeader: function(i,timeSignature,song) {
		if(i > 0) this.skip(1);
		var flags = this.data.readByte();
		var header = this.factory.newMeasureHeader();
		header.number = i + 1;
		header.start = 0;
		header.tempo.value = song.tempo;
		if((flags & 1) != 0) timeSignature.numerator = this.data.readByte();
		if((flags & 2) != 0) timeSignature.denominator.value = this.data.readByte();
		header.isRepeatOpen = (flags & 4) != 0;
		timeSignature.copy(header.timeSignature);
		if((flags & 8) != 0) header.repeatClose = this.data.readByte() - 1;
		if((flags & 32) != 0) header.marker = this.readMarker(header);
		if((flags & 16) != 0) header.repeatAlternative = this.data.readByte();
		if((flags & 64) != 0) {
			header.keySignature = alphatab.file.guitarpro.Gp3Reader.toKeySignature(this.data.readSignedByte());
			header.keySignatureType = this.data.readByte();
		} else if(header.number > 1) {
			header.keySignature = song.measureHeaders[i - 1].keySignature;
			header.keySignatureType = song.measureHeaders[i - 1].keySignatureType;
		}
		header.hasDoubleBar = (flags & 128) != 0;
		if((flags & 1) != 0) this.skip(4);
		if((flags & 16) == 0) this.skip(1);
		var tripletFeel = this.data.readByte();
		switch(tripletFeel) {
		case 1:
			header.tripletFeel = 1;
			break;
		case 2:
			header.tripletFeel = 2;
			break;
		default:
			header.tripletFeel = 0;
		}
		return header;
	}
	,readTrack: function(number,channels) {
		var flags = this.data.readByte();
		if(number == 1 || this._versionIndex == 0) this.skip(1);
		var track = this.factory.newTrack();
		track.isPercussionTrack = (flags & 1) != 0;
		track.is12StringedGuitarTrack = (flags & 2) != 0;
		track.isBanjoTrack = (flags & 4) != 0;
		track.number = number;
		track.name = this.readByteSizeString(40);
		var stringCount = this.data.readInt();
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var iTuning = this.data.readInt();
			if(stringCount > i) {
				var oString = this.factory.newString();
				oString.number = i + 1;
				oString.value = iTuning;
				track.strings.push(oString);
			}
		}
		track.port = this.data.readInt();
		this.readChannel(track.channel,channels);
		if(track.channel.channel == 9) track.isPercussionTrack = true;
		track.fretCount = this.data.readInt();
		track.offset = this.data.readInt();
		track.color = this.readColor();
		this.skip(this._versionIndex > 0?49:44);
		if(this._versionIndex > 0) {
			this.readIntSizeCheckByteString();
			this.readIntSizeCheckByteString();
		}
		return track;
	}
	,readTracks: function(song,trackCount,channels) {
		var _g1 = 1, _g = trackCount + 1;
		while(_g1 < _g) {
			var i = _g1++;
			song.addTrack(this.readTrack(i,channels));
		}
		this.skip(this._versionIndex == 0?2:1);
	}
	,readChord: function(stringCount,beat) {
		var chord = this.factory.newChord(stringCount);
		this.skip(17);
		chord.name = this.readByteSizeString(21);
		this.skip(4);
		chord.firstFret = this.data.readInt();
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var fret = this.data.readInt();
			if(i < chord.strings.length) chord.strings[i] = fret;
		}
		this.skip(32);
		if(chord.noteCount() > 0) beat.setChord(chord);
	}
	,readMixTableChange: function(measure) {
		var tableChange = this.factory.newMixTableChange();
		tableChange.instrument.value = this.data.readSignedByte();
		this.skip(16);
		tableChange.volume.value = this.data.readSignedByte();
		tableChange.balance.value = this.data.readSignedByte();
		tableChange.chorus.value = this.data.readSignedByte();
		tableChange.reverb.value = this.data.readSignedByte();
		tableChange.phaser.value = this.data.readSignedByte();
		tableChange.tremolo.value = this.data.readSignedByte();
		tableChange.tempoName = this.readIntSizeCheckByteString();
		tableChange.tempo.value = this.data.readInt();
		if(tableChange.instrument.value < 0) tableChange.instrument = null;
		if(tableChange.volume.value >= 0) tableChange.volume.duration = this.data.readSignedByte(); else tableChange.volume = null;
		if(tableChange.balance.value >= 0) tableChange.balance.duration = this.data.readSignedByte(); else tableChange.balance = null;
		if(tableChange.chorus.value >= 0) tableChange.chorus.duration = this.data.readSignedByte(); else tableChange.chorus = null;
		if(tableChange.reverb.value >= 0) tableChange.reverb.duration = this.data.readSignedByte(); else tableChange.reverb = null;
		if(tableChange.phaser.value >= 0) tableChange.phaser.duration = this.data.readSignedByte(); else tableChange.phaser = null;
		if(tableChange.tremolo.value >= 0) tableChange.tremolo.duration = this.data.readSignedByte(); else tableChange.tremolo = null;
		if(tableChange.tempo.value >= 0) {
			tableChange.tempo.duration = this.data.readSignedByte();
			measure.header.tempo.value = tableChange.tempo.value;
			tableChange.hideTempo = this._versionIndex > 0 && this.data.readBool();
		} else tableChange.tempo = null;
		var allTracksFlags = this.data.readByte();
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
	,readGrace: function(noteEffect) {
		var fret = this.data.readByte();
		var dyn = this.data.readByte();
		var transition = this.data.readByte();
		var duration = this.data.readByte();
		var flags = this.data.readByte();
		var grace = this.factory.newGraceEffect();
		grace.fret = fret;
		grace.velocity = 15 + 16 * dyn - 16;
		grace.duration = duration;
		grace.isDead = (flags & 1) != 0;
		grace.isOnBeat = (flags & 2) != 0;
		switch(transition) {
		case 0:
			grace.transition = 0;
			break;
		case 1:
			grace.transition = 1;
			break;
		case 2:
			grace.transition = 2;
			break;
		case 3:
			grace.transition = 3;
			break;
		}
		noteEffect.grace = grace;
	}
	,readArtificialHarmonic: function(noteEffect) {
		var type = this.data.readByte();
		var oHarmonic = this.factory.newHarmonicEffect();
		oHarmonic.data = 0;
		switch(type) {
		case 1:
			oHarmonic.type = 0;
			noteEffect.harmonic = oHarmonic;
			break;
		case 2:
			this.skip(3);
			oHarmonic.type = 1;
			noteEffect.harmonic = oHarmonic;
			break;
		case 3:
			this.skip(1);
			oHarmonic.type = 2;
			noteEffect.harmonic = oHarmonic;
			break;
		case 4:
			oHarmonic.type = 3;
			noteEffect.harmonic = oHarmonic;
			break;
		case 5:
			oHarmonic.type = 4;
			noteEffect.harmonic = oHarmonic;
			break;
		}
	}
	,readNoteEffects: function(noteEffect) {
		var flags1 = this.data.readByte();
		var flags2 = this.data.readByte();
		if((flags1 & 1) != 0) this.readBend(noteEffect);
		if((flags1 & 16) != 0) this.readGrace(noteEffect);
		if((flags2 & 4) != 0) this.readTremoloPicking(noteEffect);
		if((flags2 & 8) != 0) {
			noteEffect.slide = true;
			var type = this.data.readByte();
			switch(type) {
			case 1:
				noteEffect.slideType = 0;
				break;
			case 2:
				noteEffect.slideType = 1;
				break;
			case 4:
				noteEffect.slideType = 2;
				break;
			case 8:
				noteEffect.slideType = 3;
				break;
			case 16:
				noteEffect.slideType = 4;
				break;
			case 32:
				noteEffect.slideType = 5;
				break;
			}
		}
		if((flags2 & 16) != 0) this.readArtificialHarmonic(noteEffect);
		if((flags2 & 32) != 0) this.readTrill(noteEffect);
		noteEffect.letRing = (flags1 & 8) != 0;
		noteEffect.hammer = (flags1 & 2) != 0;
		noteEffect.vibrato = (flags2 & 64) != 0 || noteEffect.vibrato;
		noteEffect.palmMute = (flags2 & 2) != 0;
		noteEffect.staccato = (flags2 & 1) != 0;
	}
	,readNote: function(guitarString,track,effect) {
		var flags = this.data.readByte();
		var note = this.factory.newNote();
		note.string = guitarString.number;
		note.effect.accentuatedNote = (flags & 64) != 0;
		note.effect.heavyAccentuatedNote = (flags & 2) != 0;
		note.effect.ghostNote = (flags & 4) != 0;
		if((flags & 32) != 0) {
			var noteType = this.data.readByte();
			note.isTiedNote = noteType == 2;
			note.effect.deadNote = noteType == 3;
		}
		if((flags & 16) != 0) note.velocity = 15 + 16 * this.data.readSignedByte() - 16;
		if((flags & 32) != 0) {
			var fret = this.data.readSignedByte();
			var value = note.isTiedNote?this.getTiedNoteValue(guitarString.number,track):fret;
			note.value = value >= 0 && value < 100?value:0;
		}
		if((flags & 128) != 0) {
			note.effect.leftHandFinger = this.data.readSignedByte();
			note.effect.rightHandFinger = this.data.readSignedByte();
			note.effect.isFingering = true;
		}
		if((flags & 1) != 0) note.durationPercent = this.data.readDouble();
		var flags2 = this.data.readByte();
		note.swapAccidentals = (flags2 & 2) != 0;
		if((flags & 8) != 0) this.readNoteEffects(note.effect);
		return note;
	}
	,readBeat: function(start,measure,track,voiceIndex) {
		var flags = this.data.readByte();
		var beat = this.getBeat(measure,start);
		var voice = beat.voices[voiceIndex];
		if((flags & 64) != 0) {
			var beatType = this.data.readByte();
			voice.isEmpty = (beatType & 2) == 0;
		}
		var duration = this.readDuration(flags);
		if((flags & 2) != 0) this.readChord(track.stringCount(),beat);
		if((flags & 4) != 0) this.readText(beat);
		if((flags & 8) != 0) this.readBeatEffects(beat,null);
		if((flags & 16) != 0) {
			var mixTableChange = this.readMixTableChange(measure);
			beat.effect.mixTableChange = mixTableChange;
		}
		var stringFlags = this.data.readByte();
		var _g = 0;
		while(_g < 7) {
			var j = _g++;
			var i = 6 - j;
			if((stringFlags & 1 << i) != 0 && 6 - i < track.stringCount()) {
				var guitarString = track.strings[6 - i].clone(this.factory);
				var note = this.readNote(guitarString,track,this.factory.newNoteEffect());
				voice.addNote(note);
			}
			duration.copy(voice.duration);
		}
		this.skip(1);
		var read = this.data.readByte();
		if(read == 8 || read == 10) this.skip(1);
		return !voice.isEmpty?duration.time():0;
	}
	,readMeasure: function(measure,track) {
		var _g = 0;
		while(_g < 2) {
			var voice = _g++;
			var start = measure.header.start;
			var beats = this.data.readInt();
			var _g1 = 0;
			while(_g1 < beats) {
				var beat = _g1++;
				start += this.readBeat(start,measure,track,voice);
			}
		}
		this.skip(1);
	}
	,readSong: function() {
		if(!this.readVersion()) throw new alphatab.file.FileFormatException("Unsupported Version");
		var song = this.factory.newSong();
		this.readInfo(song);
		this.readLyrics(song);
		this.readPageSetup(song);
		song.tempoName = this.readIntSizeCheckByteString();
		song.tempo = this.data.readInt();
		if(this._versionIndex > 0) song.hideTempo = this.data.readBool();
		song.key = this.data.readByte();
		song.octave = this.data.readInt();
		var channels = this.readMidiChannels();
		this.skip(42);
		var measureCount = this.data.readInt();
		var trackCount = this.data.readInt();
		this.readMeasureHeaders(song,measureCount);
		this.readTracks(song,trackCount,channels);
		this.readMeasures(song);
		return song;
	}
	,__class__: alphatab.file.guitarpro.Gp5Reader
});
alphatab.file.musicxml = {}
alphatab.file.musicxml.MusicXmlReader = function() {
	alphatab.file.SongReader.call(this);
};
alphatab.file.musicxml.MusicXmlReader.__name__ = true;
alphatab.file.musicxml.MusicXmlReader.__super__ = alphatab.file.SongReader;
alphatab.file.musicxml.MusicXmlReader.prototype = $extend(alphatab.file.SongReader.prototype,{
	parseTimewise: function() {
		throw new alphatab.file.FileFormatException("score-timewise not yet supported");
		return null;
	}
	,scoreHeader: function(song) {
		if(this._dom.hasNode.resolve("movement-title")) song.title = this._dom.node.resolve("movement-title").get_innerData();
		if(this._dom.hasNode.resolve("identification")) {
			var creators = this._dom.node.resolve("identification").nodes.resolve("creator");
			var $it0 = creators.iterator();
			while( $it0.hasNext() ) {
				var c = $it0.next();
				if(c.has.resolve("type")) {
					var _g = c.att.resolve("type");
					switch(_g) {
					case "artist":
						song.artist = c.get_innerData();
						break;
					case "poet":
						song.words = c.get_innerData();
						break;
					}
				}
			}
		}
		var scoreParts = this._dom.node.resolve("part-list").nodes.resolve("score-part");
		var i = 0;
		var $it1 = scoreParts.iterator();
		while( $it1.hasNext() ) {
			var p = $it1.next();
			var track = this.factory.newTrack();
			this._idToTrack.set(p.att.resolve("id"),track);
			track.number = i++;
			track.channel.instrument(25);
			this.createDefaultStrings(track.strings);
			track.name = p.node.resolve("part-name").get_innerData();
			if(p.hasNode.resolve("midi-instrument")) {
				var midi = p.node.resolve("midi-instrument");
				if(midi.hasNode.resolve("midi-channel")) {
					track.channel.channel = Std.parseInt(midi.node.resolve("midi-channel").get_innerData());
					track.channel.effectChannel = track.channel.channel;
				}
				if(midi.hasNode.resolve("midi-program")) track.channel.instrument(Std.parseInt(midi.node.resolve("midi-program").get_innerData()));
				if(midi.hasNode.resolve("volume")) track.channel.volume = Std.parseInt(midi.node.resolve("volume").get_innerData());
				if(midi.hasNode.resolve("pan")) track.channel.balance = Std.parseInt(midi.node.resolve("pan").get_innerData());
			}
			song.addTrack(track);
		}
	}
	,getOrCreateMeasureHeader: function(song,index) {
		if(index >= song.measureHeaders.length) {
			var missing = index - song.measureHeaders.length + 1;
			var _g = 0;
			while(_g < missing) {
				var i = _g++;
				var header = this.factory.newMeasureHeader();
				header.number = song.measureHeaders.length + 1;
				header.start = 0;
				song.addMeasureHeader(header);
			}
		}
		return song.measureHeaders[index];
	}
	,toDuration: function(s) {
		switch(s) {
		case "whole":
			return alphatab.model.Duration.WHOLE;
		case "half":
			return alphatab.model.Duration.HALF;
		case "quarter":
			return alphatab.model.Duration.QUARTER;
		case "eighth":
			return alphatab.model.Duration.EIGHTH;
		case "16th":
			return alphatab.model.Duration.SIXTEENTH;
		case "32nd":
			return alphatab.model.Duration.THIRTY_SECOND;
		case "64th":
			return alphatab.model.Duration.SIXTY_FOURTH;
		default:
			return alphatab.model.Duration.QUARTER;
		}
	}
	,findStringForValue: function(t,voice,value) {
		var takenStrings = new Array();
		var _g = 0, _g1 = voice.notes;
		while(_g < _g1.length) {
			var n = _g1[_g];
			++_g;
			takenStrings.push(n.string);
		}
		var _g = 0, _g1 = t.strings;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			if(!Lambda.has(takenStrings,s.number)) {
				var min = s.value;
				var max = s.value + 14;
				if(value >= min && value <= max) return s.number;
			}
		}
		return 1;
	}
	,parseNote: function(n,measure,t) {
		var beat = null;
		var voice = 0;
		if(n.hasNode.resolve("voice")) {
			voice = Std.parseInt(n.node.resolve("voice").get_innerData());
			if(!this._voiceOffsetDetected) {
				this._voiceOffset = voice;
				this._voiceOffsetDetected = true;
			}
			voice -= this._voiceOffset;
		}
		if(n.hasNode.resolve("rest")) {
			beat = this.factory.newBeat();
			if(this._nextBeatChord != null) {
				beat.setChord(this.factory.newChord(t.stringCount()));
				beat.effect.chord.name = this._nextBeatChord;
				this._nextBeatChord = null;
			}
			measure.addBeat(beat);
			beat.ensureVoices(voice + 1,this.factory);
			beat.voices[voice].isEmpty = false;
			if(n.hasNode.resolve("type")) beat.voices[voice].duration.value = this.toDuration(n.node.resolve("type").get_innerData()); else beat.voices[voice].duration.value = alphatab.model.Duration.QUARTER;
			if(n.hasNode.resolve("dot")) beat.voices[voice].duration.isDotted = true;
		} else {
			var note = this.factory.newNote();
			if(n.hasNode.resolve("chord")) {
				beat = measure.beats[measure.beats.length - 1];
				beat.ensureVoices(voice + 1,this.factory);
				beat.voices[voice].isEmpty = false;
			} else {
				beat = this.factory.newBeat();
				if(this._nextBeatChord != null) {
					beat.setChord(this.factory.newChord(t.stringCount()));
					beat.effect.chord.name = this._nextBeatChord;
					this._nextBeatChord = null;
				}
				measure.addBeat(beat);
				beat.ensureVoices(voice + 1,this.factory);
				beat.voices[voice].isEmpty = false;
				if(n.hasNode.resolve("type")) beat.voices[voice].duration.value = this.toDuration(n.node.resolve("type").get_innerData()); else beat.voices[voice].duration.value = alphatab.model.Duration.QUARTER;
				if(n.hasNode.resolve("dot")) beat.voices[voice].duration.isDotted = true;
			}
			note.effect = this.factory.newNoteEffect();
			var fullNoteName = n.node.resolve("pitch").node.resolve("step").get_innerData() + n.node.resolve("pitch").node.resolve("octave").get_innerData();
			var fullNoteValue = alphatab.model.Tuning.getTuningForText(fullNoteName);
			note.string = this.findStringForValue(t,beat.voices[voice],fullNoteValue);
			note.value = fullNoteValue - t.strings[note.string - 1].value;
			beat.voices[voice].addNote(note);
		}
	}
	,parseHarmony: function(n) {
		if(n.hasNode.resolve("root")) {
			var step = n.node.resolve("root").node.resolve("root-step").get_innerData();
			if(n.hasNode.resolve("kind")) {
				var kind = n.node.resolve("kind").get_innerData();
				switch(kind) {
				case "minor":
					step += "m";
					break;
				case "major":
					step += "";
					break;
				case "dominant":
					step += String.fromCharCode(8311);
					break;
				default:
					step += kind;
				}
			}
			this._nextBeatChord = step;
		} else this._nextBeatChord = null;
	}
	,parseMeasure: function(t,h,m) {
		var measure = this.factory.newMeasure(h);
		t.addMeasure(measure);
		if(m.hasNode.resolve("attributes")) {
			var att = m.node.resolve("attributes");
			if(att.hasNode.resolve("clef")) {
				var clef = att.node.resolve("clef").node.resolve("sign").get_innerData() + att.node.resolve("clef").node.resolve("line").get_innerData();
				if(clef == "G2") measure.clef = 0; else if(clef == "F4") measure.clef = 1; else if(clef == "C3") measure.clef = 2; else if(clef == "C4") measure.clef = 3;
			}
		}
		var $it0 = m.get_elements();
		while( $it0.hasNext() ) {
			var n = $it0.next();
			if(n.get_name() == "note") this.parseNote(n,measure,t); else if(n.get_name() == "harmony") this.parseHarmony(n);
		}
	}
	,parseHeader: function(h,m) {
		if(m.hasNode.resolve("attributes")) {
			var att = m.node.resolve("attributes");
			if(att.hasNode.resolve("key")) h.keySignature = Std.parseInt(att.node.resolve("key").node.resolve("fifths").get_innerData());
			if(att.hasNode.resolve("time")) {
				h.timeSignature.numerator = Std.parseInt(att.node.resolve("time").node.resolve("beats").get_innerData());
				h.timeSignature.denominator.value = Std.parseInt(att.node.resolve("time").node.resolve("beat-type").get_innerData());
			}
		}
		if(m.hasNode.resolve("direction")) {
			var dir = m.node.resolve("direction");
			if(dir.hasNode.resolve("sound")) {
				if(dir.node.resolve("sound").has.resolve("tempo")) h.tempo.value = Std.parseInt(dir.node.resolve("sound").att.resolve("tempo"));
			}
		}
	}
	,parsePart: function(song,p) {
		var track = this._idToTrack.get(p.att.resolve("id"));
		var measures = p.nodes.resolve("measure");
		var i = 0;
		var $it0 = measures.iterator();
		while( $it0.hasNext() ) {
			var m = $it0.next();
			var h = this.getOrCreateMeasureHeader(song,i++);
			this.parseHeader(h,m);
			this.parseMeasure(track,h,m);
		}
	}
	,parsePartwise: function() {
		var song = this.factory.newSong();
		song.tempo = 120;
		song.tempoName = "";
		song.hideTempo = false;
		song.pageSetup = this.factory.newPageSetup();
		this.scoreHeader(song);
		var parts = this._dom.nodes.resolve("part");
		var $it0 = parts.iterator();
		while( $it0.hasNext() ) {
			var p = $it0.next();
			this.parsePart(song,p);
		}
		return song;
	}
	,readSong: function() {
		try {
			this._voiceOffsetDetected = false;
			var xml = Xml.parse(this.data.readString(this.data.length()));
			this._dom = new haxe.xml.Fast(xml.firstElement());
		} catch( e ) {
			throw new alphatab.file.FileFormatException("not a valid xml file");
		}
		this._idToTrack = new haxe.ds.StringMap();
		if(this._dom.get_name() == "score-partwise") return this.parsePartwise(); else if(this._dom.get_name() == "score-timewise") return this.parseTimewise(); else throw new alphatab.file.FileFormatException("this xml file is no musicxml file");
	}
	,__class__: alphatab.file.musicxml.MusicXmlReader
});
alphatab.io = {}
alphatab.io.InputStream = function() { }
alphatab.io.InputStream.__name__ = true;
alphatab.io.InputStream.prototype = {
	close: function() {
	}
	,skip: function(count) {
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			if(!this.eof()) this.readByte();
		}
	}
	,seek: function(position) {
	}
	,canSeek: function() {
		return false;
	}
	,position: function() {
		return 0;
	}
	,length: function() {
		return 0;
	}
	,eof: function() {
		return this.position() >= this.length();
	}
	,readBytes: function(count) {
		var bytes = new Array();
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			bytes.push(this.readByte());
		}
		return bytes;
	}
	,readSignedByte: function() {
		var data = this.readByte() & 255;
		return data > 127?-256 + data:data;
	}
	,readChar: function() {
		return String.fromCharCode(this.readByte());
	}
	,readByte: function() {
		return 0;
	}
	,__class__: alphatab.io.InputStream
}
alphatab.io.DelegatedInputStream = function(stream) {
	this._stream = stream;
};
alphatab.io.DelegatedInputStream.__name__ = true;
alphatab.io.DelegatedInputStream.__super__ = alphatab.io.InputStream;
alphatab.io.DelegatedInputStream.prototype = $extend(alphatab.io.InputStream.prototype,{
	skip: function(count) {
		this._stream.skip(count);
	}
	,seek: function(position) {
		this._stream.seek(position);
	}
	,readChar: function() {
		return this._stream.readChar();
	}
	,readSignedByte: function() {
		return this._stream.readSignedByte();
	}
	,readBytes: function(count) {
		return this._stream.readBytes(count);
	}
	,readByte: function() {
		return this._stream.readByte();
	}
	,position: function() {
		return this._stream.position();
	}
	,length: function() {
		return this._stream.length();
	}
	,eof: function() {
		return this._stream.eof();
	}
	,close: function() {
		this._stream.close();
	}
	,canSeek: function() {
		return this._stream.canSeek();
	}
	,__class__: alphatab.io.DelegatedInputStream
});
alphatab.io.BitInputStream = function(stream) {
	alphatab.io.DelegatedInputStream.call(this,stream);
	this._position = 8;
};
alphatab.io.BitInputStream.__name__ = true;
alphatab.io.BitInputStream.__super__ = alphatab.io.DelegatedInputStream;
alphatab.io.BitInputStream.prototype = $extend(alphatab.io.DelegatedInputStream.prototype,{
	readBit: function() {
		var bit = -1;
		if(this._position >= 8) {
			this._currentByte = this._stream.readByte();
			this._position = 0;
		}
		var value = this._currentByte >> 8 - this._position - 1 & 1;
		this._position++;
		return value;
	}
	,readBitsReversed: function(count) {
		var bits = 0;
		var i = 0;
		while(i < count) {
			bits |= this.readBit() << i;
			i++;
		}
		return bits;
	}
	,readBits: function(count) {
		var bits = 0;
		var i = count - 1;
		while(i >= 0) {
			bits |= this.readBit() << i;
			i--;
		}
		return bits;
	}
	,seek: function(position) {
		this._position = 8;
		this._stream.seek(position);
	}
	,readByte: function() {
		return this.readBits(8);
	}
	,__class__: alphatab.io.BitInputStream
});
alphatab.io.DataInputStream = function(stream,bigEndian) {
	if(bigEndian == null) bigEndian = true;
	alphatab.io.DelegatedInputStream.call(this,stream);
	this.bigEndian = bigEndian;
};
alphatab.io.DataInputStream.__name__ = true;
alphatab.io.DataInputStream.__super__ = alphatab.io.DelegatedInputStream;
alphatab.io.DataInputStream.prototype = $extend(alphatab.io.DelegatedInputStream.prototype,{
	getDoubleSig: function(bytes) {
		var sig = parseInt((((bytes[1] & 15) << 16 | bytes[2] << 8 | bytes[3]) * Math.pow(2,32)).toString(2),2) + parseInt(((bytes[4] >> 7) * Math.pow(2,31)).toString(2),2) + parseInt(((bytes[4] & 127) << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7]).toString(2),2);
		return sig;
	}
	,readDouble: function() {
		var bytes = this.readEndianAwareBytes(8);
		var sign = 1 - (bytes[0] >> 7 << 1);
		var exp = (bytes[0] << 4 & 2047 | bytes[1] >> 4) - 1023;
		var sig = this.getDoubleSig(bytes);
		if(sig == 0 && exp == -1023) return 0.0;
		return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
	}
	,readFloat: function() {
		var bytes = this.readEndianAwareBytes(4);
		var sign = 1 - (bytes[0] >> 7 << 1);
		var exp = (bytes[0] << 1 & 255 | bytes[1] >> 7) - 127;
		var sig = (bytes[1] & 127) << 16 | bytes[2] << 8 | bytes[3];
		if(sig == 0 && exp == -127) return 0.0;
		return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp);
	}
	,readInt: function() {
		var bytes = this.readEndianAwareBytes(4);
		var $int = bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3];
		return $int;
	}
	,readShort: function() {
		var bytes = this.readEndianAwareBytes(2);
		var $short = bytes[0] << 8 | bytes[1];
		return $short > 32767?-65536 + $short:$short;
	}
	,readBool: function() {
		return this.readByte() != 0;
	}
	,readString: function(length) {
		if(js.Boot.__instanceof(this._stream,alphatab.io.StringInputStream)) {
			var ss = js.Boot.__cast(this._stream , alphatab.io.StringInputStream);
			return ss.readString(length);
		} else {
			var text = "";
			var _g = 0;
			while(_g < length) {
				var i = _g++;
				text += String.fromCharCode(this.readByte());
			}
			return text;
		}
	}
	,readEndianAwareBytes: function(count) {
		var bytes = this.readBytes(count);
		if(!this.bigEndian) bytes.reverse();
		return bytes;
	}
	,__class__: alphatab.io.DataInputStream
});
alphatab.io.OutputStream = function() {
};
alphatab.io.OutputStream.__name__ = true;
alphatab.io.OutputStream.prototype = {
	close: function() {
	}
	,flush: function() {
	}
	,writeString: function(text) {
		var _g1 = 0, _g = text.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.writeByte(HxOverrides.cca(text,i) & 255);
		}
	}
	,writeAsString: function(value) {
		var text;
		if(js.Boot.__instanceof(value,String)) text = value; else text = Std.string(value);
		this.writeString(text);
	}
	,writeBytes: function(data) {
		var _g = 0;
		while(_g < data.length) {
			var d = data[_g];
			++_g;
			this.writeByte(d);
		}
	}
	,writeByte: function(data) {
	}
	,__class__: alphatab.io.OutputStream
}
alphatab.io.DataOutputStream = function(stream,bigEndian) {
	if(bigEndian == null) bigEndian = true;
	alphatab.io.OutputStream.call(this);
	this._stream = stream;
	this.bigEndian = bigEndian;
};
alphatab.io.DataOutputStream.__name__ = true;
alphatab.io.DataOutputStream.__super__ = alphatab.io.OutputStream;
alphatab.io.DataOutputStream.prototype = $extend(alphatab.io.OutputStream.prototype,{
	flush: function() {
		this._stream.flush();
	}
	,writeBytes: function(data) {
		this._stream.writeBytes(data);
	}
	,writeByte: function(data) {
		this._stream.writeByte(data);
	}
	,writeDouble: function(value) {
		if(value == 0.0) this.writeBytes([0,0,0,0,0,0,0,0]);
		var exp = Math.floor(Math.log(Math.abs(value)) / alphatab.io.DataOutputStream.LN2);
		var sig = Math.floor(Math.abs(value) / Math.pow(2,exp) * Math.pow(2,52));
		var mask = -16711681;
		var sig_h = sig & mask;
		var sig_l = Math.floor(sig / Math.pow(2,32));
		var b1 = exp + 1023 >> 4 | (exp > 0?value < 0?128:64:value < 0?128:0), b2 = exp + 1023 << 4 & 255 | sig_l >> 16 & 15, b3 = sig_l >> 8 & 255, b4 = sig_l & 255, b5 = sig_h >> 24 & 255, b6 = sig_h >> 16 & 255, b7 = sig_h >> 8 & 255, b8 = sig_h & 255;
		this.writeEndianAware([b1,b2,b3,b4,b5,b6,b7,b8]);
	}
	,writeFloat: function(value) {
		if(value == 0.0) this.writeBytes([0,0,0,0]);
		var exp = Math.floor(Math.log(Math.abs(value)) / alphatab.io.DataOutputStream.LN2);
		var sig = Math.floor(Math.abs(value) / Math.pow(2,exp) * Math.pow(2,23)) & 8388607;
		var b1 = exp + 127 >> 1 | (exp > 0?value < 0?128:64:value < 0?128:0), b2 = exp + 127 << 7 & 255 | sig >> 16 & 127, b3 = sig >> 8 & 255, b4 = sig & 255;
		this.writeEndianAware([b1,b2,b3,b4]);
	}
	,writeInt: function(value) {
		this.writeEndianAware([value >> 24 & 255,value >> 16 & 255,value >> 8 & 255,value & 255]);
	}
	,writeShort: function(value) {
		this.writeEndianAware([value >> 8 & 255,value & 255]);
	}
	,writeBool: function(value) {
		if(value) this.writeByte(1); else this.writeByte(0);
	}
	,writeEndianAware: function(value) {
		if(!this.bigEndian) value.reverse();
		this.writeBytes(value);
	}
	,__class__: alphatab.io.DataOutputStream
});
alphatab.io.MemoryOutputStream = function() {
	alphatab.io.OutputStream.call(this);
	this._buffer = new Array();
};
alphatab.io.MemoryOutputStream.__name__ = true;
alphatab.io.MemoryOutputStream.__super__ = alphatab.io.OutputStream;
alphatab.io.MemoryOutputStream.prototype = $extend(alphatab.io.OutputStream.prototype,{
	writeByte: function(data) {
		this._buffer.push(data & 255);
	}
	,getBuffer: function() {
		return this._buffer;
	}
	,__class__: alphatab.io.MemoryOutputStream
});
alphatab.io.StringInputStream = function(buffer) {
	this._buffer = buffer;
	this._pos = 0;
};
alphatab.io.StringInputStream.__name__ = true;
alphatab.io.StringInputStream.__super__ = alphatab.io.InputStream;
alphatab.io.StringInputStream.prototype = $extend(alphatab.io.InputStream.prototype,{
	canSeek: function() {
		return true;
	}
	,seek: function(position) {
		this._pos = position;
	}
	,position: function() {
		return this._pos;
	}
	,length: function() {
		return this._buffer.length;
	}
	,readChar: function() {
		return this._buffer.charAt(this._pos++);
	}
	,readByte: function() {
		return HxOverrides.cca(this._buffer,this._pos++) & 255;
	}
	,readString: function(length) {
		var substr = HxOverrides.substr(this._buffer,this._pos,length);
		this._pos += length;
		return substr;
	}
	,__class__: alphatab.io.StringInputStream
});
alphatab.io.StringOutputStream = function() {
	alphatab.io.OutputStream.call(this);
	this._buffer = new StringBuf();
};
alphatab.io.StringOutputStream.__name__ = true;
alphatab.io.StringOutputStream.__super__ = alphatab.io.OutputStream;
alphatab.io.StringOutputStream.prototype = $extend(alphatab.io.OutputStream.prototype,{
	toString: function() {
		return this._buffer.b;
	}
	,writeString: function(text) {
		this._buffer.b += Std.string(text);
	}
	,writeByte: function(data) {
		this._buffer.b += Std.string(String.fromCharCode(data));
	}
	,__class__: alphatab.io.StringOutputStream
});
alphatab.midi = {}
alphatab.midi.BeatData = function(start,duration) {
	this.start = start;
	this.duration = duration;
};
alphatab.midi.BeatData.__name__ = true;
alphatab.midi.BeatData.prototype = {
	__class__: alphatab.midi.BeatData
}
alphatab.midi.GeneralMidi = function() { }
alphatab.midi.GeneralMidi.__name__ = true;
alphatab.midi.GeneralMidi.getValue = function(name) {
	if(alphatab.midi.GeneralMidi._values == null) {
		alphatab.midi.GeneralMidi._values = new haxe.ds.StringMap();
		alphatab.midi.GeneralMidi._values.set("acousticgrandpiano",0);
		alphatab.midi.GeneralMidi._values.set("brightacousticpiano",1);
		alphatab.midi.GeneralMidi._values.set("electricgrandpiano",2);
		alphatab.midi.GeneralMidi._values.set("honkytonkpiano",3);
		alphatab.midi.GeneralMidi._values.set("electricpiano1",4);
		alphatab.midi.GeneralMidi._values.set("electricpiano2",5);
		alphatab.midi.GeneralMidi._values.set("harpsichord",6);
		alphatab.midi.GeneralMidi._values.set("clavinet",7);
		alphatab.midi.GeneralMidi._values.set("celesta",8);
		alphatab.midi.GeneralMidi._values.set("glockenspiel",9);
		alphatab.midi.GeneralMidi._values.set("musicbox",10);
		alphatab.midi.GeneralMidi._values.set("vibraphone",11);
		alphatab.midi.GeneralMidi._values.set("marimba",12);
		alphatab.midi.GeneralMidi._values.set("xylophone",13);
		alphatab.midi.GeneralMidi._values.set("tubularbells",14);
		alphatab.midi.GeneralMidi._values.set("dulcimer",15);
		alphatab.midi.GeneralMidi._values.set("drawbarorgan",16);
		alphatab.midi.GeneralMidi._values.set("percussiveorgan",17);
		alphatab.midi.GeneralMidi._values.set("rockorgan",18);
		alphatab.midi.GeneralMidi._values.set("churchorgan",19);
		alphatab.midi.GeneralMidi._values.set("reedorgan",20);
		alphatab.midi.GeneralMidi._values.set("accordion",21);
		alphatab.midi.GeneralMidi._values.set("harmonica",22);
		alphatab.midi.GeneralMidi._values.set("tangoaccordion",23);
		alphatab.midi.GeneralMidi._values.set("acousticguitarnylon",24);
		alphatab.midi.GeneralMidi._values.set("acousticguitarsteel",25);
		alphatab.midi.GeneralMidi._values.set("electricguitarjazz",26);
		alphatab.midi.GeneralMidi._values.set("electricguitarclean",27);
		alphatab.midi.GeneralMidi._values.set("electricguitarmuted",28);
		alphatab.midi.GeneralMidi._values.set("overdrivenguitar",29);
		alphatab.midi.GeneralMidi._values.set("distortionguitar",30);
		alphatab.midi.GeneralMidi._values.set("guitarharmonics",31);
		alphatab.midi.GeneralMidi._values.set("acousticbass",32);
		alphatab.midi.GeneralMidi._values.set("electricbassfinger",33);
		alphatab.midi.GeneralMidi._values.set("electricbasspick",34);
		alphatab.midi.GeneralMidi._values.set("fretlessbass",35);
		alphatab.midi.GeneralMidi._values.set("slapbass1",36);
		alphatab.midi.GeneralMidi._values.set("slapbass2",37);
		alphatab.midi.GeneralMidi._values.set("synthbass1",38);
		alphatab.midi.GeneralMidi._values.set("synthbass2",39);
		alphatab.midi.GeneralMidi._values.set("violin",40);
		alphatab.midi.GeneralMidi._values.set("viola",41);
		alphatab.midi.GeneralMidi._values.set("cello",42);
		alphatab.midi.GeneralMidi._values.set("contrabass",43);
		alphatab.midi.GeneralMidi._values.set("tremolostrings",44);
		alphatab.midi.GeneralMidi._values.set("pizzicatostrings",45);
		alphatab.midi.GeneralMidi._values.set("orchestralharp",46);
		alphatab.midi.GeneralMidi._values.set("timpani",47);
		alphatab.midi.GeneralMidi._values.set("stringensemble1",48);
		alphatab.midi.GeneralMidi._values.set("stringensemble2",49);
		alphatab.midi.GeneralMidi._values.set("synthstrings1",50);
		alphatab.midi.GeneralMidi._values.set("synthstrings2",51);
		alphatab.midi.GeneralMidi._values.set("choiraahs",52);
		alphatab.midi.GeneralMidi._values.set("voiceoohs",53);
		alphatab.midi.GeneralMidi._values.set("synthvoice",54);
		alphatab.midi.GeneralMidi._values.set("orchestrahit",55);
		alphatab.midi.GeneralMidi._values.set("trumpet",56);
		alphatab.midi.GeneralMidi._values.set("trombone",57);
		alphatab.midi.GeneralMidi._values.set("tuba",58);
		alphatab.midi.GeneralMidi._values.set("mutedtrumpet",59);
		alphatab.midi.GeneralMidi._values.set("frenchhorn",60);
		alphatab.midi.GeneralMidi._values.set("brasssection",61);
		alphatab.midi.GeneralMidi._values.set("synthbrass1",62);
		alphatab.midi.GeneralMidi._values.set("synthbrass2",63);
		alphatab.midi.GeneralMidi._values.set("sopranosax",64);
		alphatab.midi.GeneralMidi._values.set("altosax",65);
		alphatab.midi.GeneralMidi._values.set("tenorsax",66);
		alphatab.midi.GeneralMidi._values.set("baritonesax",67);
		alphatab.midi.GeneralMidi._values.set("oboe",68);
		alphatab.midi.GeneralMidi._values.set("englishhorn",69);
		alphatab.midi.GeneralMidi._values.set("bassoon",70);
		alphatab.midi.GeneralMidi._values.set("clarinet",71);
		alphatab.midi.GeneralMidi._values.set("piccolo",72);
		alphatab.midi.GeneralMidi._values.set("flute",73);
		alphatab.midi.GeneralMidi._values.set("recorder",74);
		alphatab.midi.GeneralMidi._values.set("panflute",75);
		alphatab.midi.GeneralMidi._values.set("blownbottle",76);
		alphatab.midi.GeneralMidi._values.set("shakuhachi",77);
		alphatab.midi.GeneralMidi._values.set("whistle",78);
		alphatab.midi.GeneralMidi._values.set("ocarina",79);
		alphatab.midi.GeneralMidi._values.set("lead1square",80);
		alphatab.midi.GeneralMidi._values.set("lead2sawtooth",81);
		alphatab.midi.GeneralMidi._values.set("lead3calliope",82);
		alphatab.midi.GeneralMidi._values.set("lead4chiff",83);
		alphatab.midi.GeneralMidi._values.set("lead5charang",84);
		alphatab.midi.GeneralMidi._values.set("lead6voice",85);
		alphatab.midi.GeneralMidi._values.set("lead7fifths",86);
		alphatab.midi.GeneralMidi._values.set("lead8bassandlead",87);
		alphatab.midi.GeneralMidi._values.set("pad1newage",88);
		alphatab.midi.GeneralMidi._values.set("pad2warm",89);
		alphatab.midi.GeneralMidi._values.set("pad3polysynth",90);
		alphatab.midi.GeneralMidi._values.set("pad4choir",91);
		alphatab.midi.GeneralMidi._values.set("pad5bowed",92);
		alphatab.midi.GeneralMidi._values.set("pad6metallic",93);
		alphatab.midi.GeneralMidi._values.set("pad7halo",94);
		alphatab.midi.GeneralMidi._values.set("pad8sweep",95);
		alphatab.midi.GeneralMidi._values.set("fx1rain",96);
		alphatab.midi.GeneralMidi._values.set("fx2soundtrack",97);
		alphatab.midi.GeneralMidi._values.set("fx3crystal",98);
		alphatab.midi.GeneralMidi._values.set("fx4atmosphere",99);
		alphatab.midi.GeneralMidi._values.set("fx5brightness",100);
		alphatab.midi.GeneralMidi._values.set("fx6goblins",101);
		alphatab.midi.GeneralMidi._values.set("fx7echoes",102);
		alphatab.midi.GeneralMidi._values.set("fx8scifi",103);
		alphatab.midi.GeneralMidi._values.set("sitar",104);
		alphatab.midi.GeneralMidi._values.set("banjo",105);
		alphatab.midi.GeneralMidi._values.set("shamisen",106);
		alphatab.midi.GeneralMidi._values.set("koto",107);
		alphatab.midi.GeneralMidi._values.set("kalimba",108);
		alphatab.midi.GeneralMidi._values.set("bagpipe",109);
		alphatab.midi.GeneralMidi._values.set("fiddle",110);
		alphatab.midi.GeneralMidi._values.set("shanai",111);
		alphatab.midi.GeneralMidi._values.set("tinklebell",112);
		alphatab.midi.GeneralMidi._values.set("agogo",113);
		alphatab.midi.GeneralMidi._values.set("steeldrums",114);
		alphatab.midi.GeneralMidi._values.set("woodblock",115);
		alphatab.midi.GeneralMidi._values.set("taikodrum",116);
		alphatab.midi.GeneralMidi._values.set("melodictom",117);
		alphatab.midi.GeneralMidi._values.set("synthdrum",118);
		alphatab.midi.GeneralMidi._values.set("reversecymbal",119);
		alphatab.midi.GeneralMidi._values.set("guitarfretnoise",120);
		alphatab.midi.GeneralMidi._values.set("breathnoise",121);
		alphatab.midi.GeneralMidi._values.set("seashore",122);
		alphatab.midi.GeneralMidi._values.set("birdtweet",123);
		alphatab.midi.GeneralMidi._values.set("telephonering",124);
		alphatab.midi.GeneralMidi._values.set("helicopter",125);
		alphatab.midi.GeneralMidi._values.set("applause",126);
		alphatab.midi.GeneralMidi._values.set("gunshot",127);
	}
	name = StringTools.replace(name.toLowerCase()," ","");
	if(alphatab.midi.GeneralMidi._values.exists(name)) return alphatab.midi.GeneralMidi._values.get(name); else return 0;
}
alphatab.midi.MidiController = function() { }
alphatab.midi.MidiController.__name__ = true;
alphatab.midi.MidiDataProvider = function() { }
alphatab.midi.MidiDataProvider.__name__ = true;
alphatab.midi.MidiDataProvider.getSongMidiData = function(song,factory) {
	var parser = new alphatab.midi.MidiSequenceParser(factory,song,15,100,0);
	var sequence = new alphatab.midi.MidiSequenceDataHandler(song.tracks.length + 2);
	parser.parse(sequence);
	return sequence.commands;
}
alphatab.midi.MidiDataProvider.getSongMidiFile = function(song,factory) {
	var parser = new alphatab.midi.MidiSequenceParser(factory,song,15,100,0);
	var sequence = new alphatab.midi.MidiSequenceFileHandler(song.tracks.length + 2);
	parser.parse(sequence);
	return sequence.midiFile;
}
alphatab.midi.MidiMessageDataUtils = function() { }
alphatab.midi.MidiMessageDataUtils.__name__ = true;
alphatab.midi.MidiMessageDataUtils.fixValue = function(value) {
	var fixedValue = value;
	fixedValue = Math.min(fixedValue,127);
	fixedValue = Math.max(fixedValue,0);
	return fixedValue;
}
alphatab.midi.MidiMessageDataUtils.fixChannel = function(channel) {
	var fixedChannel = channel;
	fixedChannel = Math.min(fixedChannel,15);
	fixedChannel = Math.max(fixedChannel,0);
	return fixedChannel;
}
alphatab.midi.MidiMessageDataUtils.noteOn = function(channel,note,velocity) {
	return "0" + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixChannel(channel),1) + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixValue(note),2) + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixValue(velocity),2);
}
alphatab.midi.MidiMessageDataUtils.noteOff = function(channel,note,velocity) {
	return "1" + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixChannel(channel),1) + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixValue(note),2) + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixValue(velocity),2);
}
alphatab.midi.MidiMessageDataUtils.controlChange = function(channel,controller,value) {
	return "2" + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixChannel(channel),1) + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixValue(controller),2) + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixValue(value),2);
}
alphatab.midi.MidiMessageDataUtils.programChange = function(channel,instrument) {
	return "3" + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixChannel(channel),1) + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixValue(instrument),2);
}
alphatab.midi.MidiMessageDataUtils.pitchBend = function(channel,value) {
	return "4" + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixChannel(channel),1) + StringTools.hex(alphatab.midi.MidiMessageDataUtils.fixValue(value),2);
}
alphatab.midi.MidiMessageDataUtils.tempoInUSQ = function(usq) {
	return "5" + StringTools.hex(usq);
}
alphatab.midi.MidiMessageDataUtils.timeSignature = function(ts) {
	return "6" + StringTools.hex(ts.numerator) + "," + StringTools.hex(ts.denominator.index()) + "," + StringTools.hex(ts.denominator.value);
}
alphatab.midi.MidiMessageDataUtils.rest = function() {
	return "7";
}
alphatab.midi.MidiMessageDataUtils.intToString = function(num) {
	return StringTools.hex(num);
}
alphatab.midi.MidiMessageDataUtils.channelToString = function(num) {
	return StringTools.hex(num,1);
}
alphatab.midi.MidiMessageDataUtils.valueToString = function(num) {
	return StringTools.hex(num,2);
}
alphatab.midi.MidiMessageFileUtils = function() { }
alphatab.midi.MidiMessageFileUtils.__name__ = true;
alphatab.midi.MidiMessageFileUtils.fixValue = function(value) {
	if(value < 0) return 0;
	if(value > 127) return 127;
	return value;
}
alphatab.midi.MidiMessageFileUtils.fixChannel = function(value) {
	if(value < 0) return 0;
	if(value > 15) return 15;
	return value;
}
alphatab.midi.MidiMessageFileUtils.noteOff = function(channel,note,velocity) {
	return new alphatab.midi.model.MidiMessage([alphatab.midi.MidiMessageFileUtils.makeCommand(128,channel),alphatab.midi.MidiMessageFileUtils.fixValue(note),alphatab.midi.MidiMessageFileUtils.fixValue(velocity)]);
}
alphatab.midi.MidiMessageFileUtils.noteOn = function(channel,note,velocity) {
	return new alphatab.midi.model.MidiMessage([alphatab.midi.MidiMessageFileUtils.makeCommand(144,channel),alphatab.midi.MidiMessageFileUtils.fixValue(note),alphatab.midi.MidiMessageFileUtils.fixValue(velocity)]);
}
alphatab.midi.MidiMessageFileUtils.rest = function() {
	return new alphatab.midi.model.MidiMessage([240,0,0,247]);
}
alphatab.midi.MidiMessageFileUtils.controlChange = function(channel,controller,value) {
	return new alphatab.midi.model.MidiMessage([alphatab.midi.MidiMessageFileUtils.makeCommand(176,channel),alphatab.midi.MidiMessageFileUtils.fixValue(controller),alphatab.midi.MidiMessageFileUtils.fixValue(value)]);
}
alphatab.midi.MidiMessageFileUtils.programChange = function(channel,instrument) {
	return new alphatab.midi.model.MidiMessage([alphatab.midi.MidiMessageFileUtils.makeCommand(192,channel),alphatab.midi.MidiMessageFileUtils.fixValue(instrument)]);
}
alphatab.midi.MidiMessageFileUtils.pitchBend = function(channel,value) {
	return new alphatab.midi.model.MidiMessage([alphatab.midi.MidiMessageFileUtils.makeCommand(224,channel),0,alphatab.midi.MidiMessageFileUtils.fixValue(value)]);
}
alphatab.midi.MidiMessageFileUtils.makeCommand = function(command,channel) {
	return command & 240 | channel & 15;
}
alphatab.midi.MidiMessageFileUtils.buildSysexMessage = function(data) {
	var sysex = new Array();
	sysex.push(240);
	if(data == null) data = new Array();
	data.push(247);
	alphatab.midi.model.MidiFile.writeVariableLengthValue(sysex,data.length);
	sysex = sysex.concat(data);
	return new alphatab.midi.model.MidiMessage(sysex);
}
alphatab.midi.MidiMessageFileUtils.buildMetaMessage = function(metaType,data) {
	var meta = new Array();
	meta.push(255);
	meta.push(metaType & 255);
	if(data == null) alphatab.midi.model.MidiFile.writeVariableLengthValue(meta,0); else {
		alphatab.midi.model.MidiFile.writeVariableLengthValue(meta,data.length);
		meta = meta.concat(data);
	}
	return new alphatab.midi.model.MidiMessage(meta);
}
alphatab.midi.MidiMessageFileUtils.tempoInUSQ = function(usq) {
	return alphatab.midi.MidiMessageFileUtils.buildMetaMessage(81,[usq >> 16 & 255,usq >> 8 & 255,usq & 255]);
}
alphatab.midi.MidiMessageFileUtils.timeSignature = function(ts) {
	return alphatab.midi.MidiMessageFileUtils.buildMetaMessage(88,[ts.numerator & 255,ts.denominator.index() & 255,48,8]);
}
alphatab.midi.MidiRepeatController = function(song) {
	this._song = song;
	this._count = song.measureHeaders.length;
	this.index = 0;
	this._lastIndex = -1;
	this.shouldPlay = true;
	this._repeatOpen = true;
	this._repeatAlternative = 0;
	this._repeatStart = alphatab.model.Duration.QUARTER_TIME;
	this._repeatEnd = 0;
	this.repeatMove = 0;
	this._repeatStartIndex = 0;
	this._repeatNumber = 0;
};
alphatab.midi.MidiRepeatController.__name__ = true;
alphatab.midi.MidiRepeatController.prototype = {
	process: function() {
		var header = this._song.measureHeaders[this.index];
		this.shouldPlay = true;
		if(!header.repeatGroup.isClosed && header.repeatGroup.openings[header.repeatGroup.openings.length - 1] == header) {
			this._repeatStart = 0;
			this._repeatNumber = 0;
			this._repeatEnd = 0;
			this._repeatOpen = false;
		}
		if(header.isRepeatOpen) {
			this._repeatStartIndex = this.index;
			this._repeatStart = header.start;
			this._repeatOpen = true;
			if(this.index > this._lastIndex) {
				this._repeatNumber = 0;
				this._repeatAlternative = 0;
			}
		} else {
			if(this._repeatAlternative == 0) this._repeatAlternative = header.repeatAlternative;
			if(this._repeatOpen && this._repeatAlternative > 0 && (this._repeatAlternative & 1 << this._repeatNumber) == 0) {
				this.repeatMove -= header.length();
				if(header.repeatClose > 0) this._repeatAlternative = 0;
				this.shouldPlay = false;
				this.index++;
				return;
			}
		}
		this._lastIndex = Math.round(Math.max(this._lastIndex,this.index));
		if(this._repeatOpen && header.repeatClose > 0) {
			if(this._repeatNumber < header.repeatClose || this._repeatAlternative > 0) {
				this._repeatEnd = header.start + header.length();
				this.repeatMove += this._repeatEnd - this._repeatStart;
				this.index = this._repeatStartIndex - 1;
				this._repeatNumber++;
			} else {
				this._repeatStart = 0;
				this._repeatNumber = 0;
				this._repeatEnd = 0;
				this._repeatOpen = false;
			}
			this._repeatAlternative = 0;
		}
		this.index++;
	}
	,finished: function() {
		return this.index >= this._count;
	}
	,__class__: alphatab.midi.MidiRepeatController
}
alphatab.midi.MidiSequenceHandler = function() { }
alphatab.midi.MidiSequenceHandler.__name__ = true;
alphatab.midi.MidiSequenceHandler.prototype = {
	__class__: alphatab.midi.MidiSequenceHandler
}
alphatab.midi.MidiSequenceDataHandler = function(tracks) {
	this._infoTrack = 0;
	this._ticksSoFar = 0;
	this._metronomeTrack = tracks - 1;
	this._commands = new Array();
};
alphatab.midi.MidiSequenceDataHandler.__name__ = true;
alphatab.midi.MidiSequenceDataHandler.__interfaces__ = [alphatab.midi.MidiSequenceHandler];
alphatab.midi.MidiSequenceDataHandler.prototype = {
	notifyFinish: function() {
		this.commands = StringTools.hex(this._metronomeTrack) + ";" + this._commands.join(";");
	}
	,addTimeSignature: function(tick,track,timeSignature) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageDataUtils.timeSignature(timeSignature));
	}
	,addTempoInUSQ: function(tick,track,usq) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageDataUtils.tempoInUSQ(usq));
	}
	,addProgramChange: function(tick,track,channel,instrument) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageDataUtils.programChange(channel,instrument));
	}
	,addPitchBend: function(tick,track,channel,value) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageDataUtils.pitchBend(channel,value));
	}
	,addRest: function(tick,track,channel) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageDataUtils.rest());
	}
	,addNoteOn: function(tick,track,channel,note,velocity) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageDataUtils.noteOn(channel,note,velocity));
	}
	,addNoteOff: function(tick,track,channel,note,velocity) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageDataUtils.noteOff(channel,note,velocity));
	}
	,addControlChange: function(tick,track,channel,controller,value) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageDataUtils.controlChange(channel,controller,value));
	}
	,addEvent: function(track,tick,evt) {
		var command = StringTools.hex(track) + "|" + StringTools.hex(tick) + "|" + evt;
		this._commands.push(command);
		if(tick > this._ticksSoFar) this._ticksSoFar = tick;
	}
	,getTicks: function() {
		return this._ticksSoFar;
	}
	,resetTicks: function() {
		this._ticksSoFar = 0;
	}
	,getMetronomeTrack: function() {
		return this._metronomeTrack;
	}
	,getInfoTrack: function() {
		return this._infoTrack;
	}
	,__class__: alphatab.midi.MidiSequenceDataHandler
}
alphatab.midi.MidiSequenceFileHandler = function(tracks) {
	this.midiFile = new alphatab.midi.model.MidiFile(tracks);
	this._infoTrack = 0;
	this._metronomeTrack = tracks - 1;
};
alphatab.midi.MidiSequenceFileHandler.__name__ = true;
alphatab.midi.MidiSequenceFileHandler.__interfaces__ = [alphatab.midi.MidiSequenceHandler];
alphatab.midi.MidiSequenceFileHandler.prototype = {
	notifyFinish: function() {
		this.midiFile.infoTrack = this._infoTrack;
		this.midiFile.metronomeTrack = this._metronomeTrack;
	}
	,addTimeSignature: function(tick,track,timeSignature) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageFileUtils.timeSignature(timeSignature));
	}
	,addTempoInUSQ: function(tick,track,usq) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageFileUtils.tempoInUSQ(usq));
	}
	,addProgramChange: function(tick,track,channel,instrument) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageFileUtils.programChange(channel,instrument));
	}
	,addPitchBend: function(tick,track,channel,value) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageFileUtils.pitchBend(channel,value));
	}
	,addRest: function(tick,track,channel) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageFileUtils.rest());
	}
	,addNoteOn: function(tick,track,channel,note,velocity) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageFileUtils.noteOn(channel,note,velocity));
	}
	,addNoteOff: function(tick,track,channel,note,velocity) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageFileUtils.noteOff(channel,note,velocity));
	}
	,addControlChange: function(tick,track,channel,controller,value) {
		this.addEvent(track,tick,alphatab.midi.MidiMessageFileUtils.controlChange(channel,controller,value));
	}
	,addEvent: function(track,tick,message) {
		this.midiFile.tracks[track].addEvent(new alphatab.midi.model.MidiEvent(tick,message));
	}
	,getMetronomeTrack: function() {
		return this._metronomeTrack;
	}
	,getInfoTrack: function() {
		return this._infoTrack;
	}
	,__class__: alphatab.midi.MidiSequenceFileHandler
}
alphatab.midi.MidiSequenceParser = function(factory,song,flags,tempoPercent,transpose) {
	this._song = song;
	this._factory = factory;
	this._flags = flags;
	this._transpose = transpose;
	this._tempoPercent = tempoPercent;
	this._firstTickMove = (flags & 8) == 0?0:alphatab.model.Duration.QUARTER_TIME;
};
alphatab.midi.MidiSequenceParser.__name__ = true;
alphatab.midi.MidiSequenceParser.applyDurationEffects = function(note,tempo,duration) {
	if(note.effect.deadNote) return alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,30,duration);
	if(note.effect.palmMute) return alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,80,duration);
	if(note.effect.staccato) return Math.floor(duration * 50.0 / 100.0);
	return duration;
}
alphatab.midi.MidiSequenceParser.applyStaticDuration = function(tempo,duration,maximum) {
	var value = Math.floor(tempo.value * duration / 60);
	return value < maximum?value:maximum;
}
alphatab.midi.MidiSequenceParser.applyStrokeDuration = function(note,duration,stroke) {
	return duration - stroke[note.string - 1];
}
alphatab.midi.MidiSequenceParser.applyStrokeStart = function(node,start,stroke) {
	return start + stroke[node.string - 1];
}
alphatab.midi.MidiSequenceParser.getNextBeat = function(voice,beatIndex) {
	var next = null;
	var _g1 = beatIndex + 1, _g = voice.beat.measure.beats.length;
	while(_g1 < _g) {
		var b = _g1++;
		var current = voice.beat.measure.beats[b];
		if(current.start > voice.beat.start && !current.voices[voice.index].isEmpty && (next == null || current.start < next.beat.start)) next = current.voices[voice.index];
	}
	return next;
}
alphatab.midi.MidiSequenceParser.getNextNote = function(note,track,measureIndex,beatIndex) {
	var nextBeatIndex = beatIndex + 1;
	var measureCount = track.measureCount();
	var _g = measureIndex;
	while(_g < measureCount) {
		var m = _g++;
		var measure = track.measures[m];
		var beatCount = measure.beats.length;
		var _g1 = nextBeatIndex;
		while(_g1 < beatCount) {
			var b = _g1++;
			var beat = measure.beats[b];
			var voice = beat.voices[note.voice.index];
			var noteCount = voice.notes.length;
			var _g2 = 0;
			while(_g2 < noteCount) {
				var n = _g2++;
				var currNode = voice.notes[n];
				if(currNode.string == note.string) return currNode;
			}
		}
		nextBeatIndex = 0;
	}
	return null;
}
alphatab.midi.MidiSequenceParser.getPreviousBeat = function(voice,beatIndex) {
	var previous = null;
	var b = beatIndex - 1;
	while(b >= 0) {
		var current = voice.beat.measure.beats[b];
		if(current.start < voice.beat.start && !current.voices[voice.index].isEmpty && (previous == null || current.start > previous.beat.start)) previous = current.voices[voice.index];
		b--;
	}
	return previous;
}
alphatab.midi.MidiSequenceParser.getPreviousNote = function(note,track,measureIndex,beatIndex) {
	var nextBeatIndex = beatIndex;
	var m = measureIndex;
	while(m >= 0) {
		var measure = track.measures[m];
		nextBeatIndex = nextBeatIndex < 0?measure.beats.length:nextBeatIndex;
		var b = nextBeatIndex - 1;
		while(b >= 0) {
			var voice = measure.beats[b].voices[note.voice.index];
			var noteCount = voice.notes.length;
			var _g = 0;
			while(_g < noteCount) {
				var n = _g++;
				var current = voice.notes[n];
				if(current.string == note.string) return current;
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
		if(previousNote != null && previousNote.effect.hammer) velocity = Math.floor(Math.max(15,velocity - 25));
	}
	if(note.effect.ghostNote) velocity = Math.floor(Math.max(15,velocity - 16)); else if(note.effect.accentuatedNote) velocity = Math.floor(Math.max(15,velocity + 16)); else if(note.effect.heavyAccentuatedNote) velocity = Math.floor(Math.max(15,velocity + 32));
	return velocity > 127?127:velocity;
}
alphatab.midi.MidiSequenceParser.getStroke = function(beat,previous,stroke) {
	var direction = beat.effect.stroke.direction;
	if(previous == null || direction != 0 || previous.effect.stroke.direction != 0) {
		if(direction == 0) {
			var _g1 = 0, _g = stroke.length;
			while(_g1 < _g) {
				var i = _g1++;
				stroke[i] = 0;
			}
		} else {
			var stringUsed = 0;
			var stringCount = 0;
			var _g1 = 0, _g = beat.voices.length;
			while(_g1 < _g) {
				var vIndex = _g1++;
				var voice = beat.voices[vIndex];
				var _g3 = 0, _g2 = voice.notes.length;
				while(_g3 < _g2) {
					var nIndex = _g3++;
					var note = voice.notes[nIndex];
					if(note.isTiedNote) continue;
					stringUsed |= 1 << note.string - 1;
					stringCount++;
				}
			}
			if(stringCount > 0) {
				var strokeMove = 0;
				var strokeIncrement = beat.effect.stroke.getIncrementTime(beat);
				var _g1 = 0, _g = stroke.length;
				while(_g1 < _g) {
					var i = _g1++;
					var iIndex = direction != 2?i:stroke.length - 1 - i;
					if((stringUsed & 1 << iIndex) != 0) {
						stroke[iIndex] = strokeMove;
						strokeMove += strokeIncrement;
					}
				}
			}
		}
	}
	return stroke;
}
alphatab.midi.MidiSequenceParser.prototype = {
	parse: function(sequence) {
		this._infoTrack = sequence.getInfoTrack();
		this._metronomeTrack = sequence.getMetronomeTrack();
		this.addDefaultMessages(sequence);
		var _g1 = 0, _g = this._song.tracks.length;
		while(_g1 < _g) {
			var i = _g1++;
			var songTrack = this._song.tracks[i];
			var isFirstTrack = i == 0;
			this.createTrack(sequence,songTrack,isFirstTrack);
		}
		sequence.notifyFinish();
	}
	,newDuration: function(value) {
		var duration = this._factory.newDuration();
		duration.value = value;
		return duration;
	}
	,makeVibrato: function(sequence,track,start,duration,channel) {
		var nextStart = start;
		var end = nextStart + duration;
		while(nextStart < end) {
			nextStart = nextStart + 160 > end?end:nextStart + 160;
			this.addBend(sequence,track,nextStart,64,channel);
			nextStart = nextStart + 160 > end?end:nextStart + 160;
			this.addBend(sequence,track,nextStart,Math.round(65.375),channel);
		}
		this.addBend(sequence,track,nextStart,64,channel);
	}
	,makeTremoloBar: function(sequence,track,start,duration,effect,channel) {
		var points = effect.points;
		var _g1 = 0, _g = points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = points[i];
			var pointStart = start + point.getTime(duration);
			var value = Math.round(64 + point.value * 5.5);
			value = value <= 127?value:127;
			value = value >= 0?value:0;
			this.addBend(sequence,track,pointStart,value,channel);
			if(points.length > i + 1) {
				var nextPoint = points[i + 1];
				var nextValue = Math.round(64 + nextPoint.value * 5.5);
				var nextPointStart = start + nextPoint.getTime(duration);
				if(nextValue == value) continue;
				var width = (nextPointStart - pointStart) / Math.abs(nextValue - value);
				if(value < nextValue) while(value < nextValue) {
					value++;
					pointStart += Math.round(width);
					this.addBend(sequence,track,pointStart,value <= 127?value:127,channel);
				} else if(value > nextValue) while(value > nextValue) {
					value += -1;
					pointStart += Math.round(width);
					this.addBend(sequence,track,pointStart,value >= 0?value:0,channel);
				}
			}
		}
		this.addBend(sequence,track,start + duration,64,channel);
	}
	,makeSlide2: function(sequence,track,tick1,value1,tick2,value2,channel) {
		var lDistance = value2 - value1;
		var lLength = tick2 - tick1;
		var points = Math.floor(lLength / (alphatab.model.Duration.QUARTER_TIME / 8));
		var _g1 = 1, _g = points + 1;
		while(_g1 < _g) {
			var i = _g1++;
			var fTone = lLength / points * i * lDistance / lLength;
			var iBend = Math.round(64 + fTone * 5.5);
			this.addBend(sequence,track,Math.round(tick1 + lLength / points * i),iBend,channel);
		}
	}
	,makeSlide: function(sequence,track,note,nextNote,startMove,channel) {
		if(nextNote != null) {
			this.makeSlide2(sequence,track,note.voice.beat.start + startMove,note.value,nextNote.voice.beat.start + startMove,nextNote.value,channel);
			this.addBend(sequence,track,nextNote.voice.beat.start + startMove,64,channel);
		}
	}
	,makeNotes: function(sequence,track,beat,tempo,measureIndex,beatIndex,startMove,stroke) {
		var trackId = track.number;
		var _g1 = 0, _g = beat.voices.length;
		while(_g1 < _g) {
			var vIndex = _g1++;
			var voice = beat.voices[vIndex];
			var data = this.checkTripletFeel(voice,beatIndex);
			if(voice.isRestVoice() && !voice.isEmpty) this.makeRest(sequence,track,data.start + startMove,voice,beatIndex,track.channel.channel); else {
				var _g3 = 0, _g2 = voice.notes.length;
				while(_g3 < _g2) {
					var noteIndex = _g3++;
					var note = voice.notes[noteIndex];
					if(note.isTiedNote) continue;
					var key = this._transpose + track.offset + note.value + track.strings[note.string - 1].value;
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
					if(note.effect.isGrace() && effectChannel >= 0 && !percussionTrack) {
						channel = effectChannel;
						var graceKey = track.offset + note.effect.grace.fret + track.strings[note.string - 1].value;
						var graceLength = note.effect.grace.durationTime();
						var graceVelocity = note.effect.grace.velocity;
						var graceDuration = !note.effect.grace.isDead?graceLength:alphatab.midi.MidiSequenceParser.applyStaticDuration(tempo,30,graceLength);
						if(note.effect.grace.isOnBeat || start - graceLength < alphatab.model.Duration.QUARTER_TIME) {
							start += graceLength;
							duration -= graceLength;
						}
						this.makeNote(sequence,trackId,graceKey,start - graceLength,graceDuration,graceVelocity,channel);
					}
					if(note.effect.isTrill() && effectChannel >= 0 && !percussionTrack) {
						var trillKey = track.offset + note.effect.trill.fret + track.strings[note.string - 1].value;
						var trillLength = note.effect.trill.duration.time();
						var realKey = true;
						var tick = start;
						while(tick + 10 < start + duration) {
							if(tick + trillLength >= start + duration) trillLength = start + duration - tick - 1;
							this.makeNote(sequence,trackId,realKey?key:trillKey,tick,trillLength,velocity,channel);
							realKey = !realKey;
							tick += trillLength;
						}
						continue;
					}
					if(note.effect.isTremoloPicking() && effectChannel >= 0) {
						var tpLength = note.effect.tremoloPicking.duration.time();
						var tick = start;
						while(tick + 10 < start + duration) {
							if(tick + tpLength >= start + duration) tpLength = start + duration - tick - 1;
							this.makeNote(sequence,trackId,key,start,tpLength,velocity,channel);
							tick += tpLength;
						}
						continue;
					}
					if(note.effect.isBend() && effectChannel >= 0 && !percussionTrack) {
						channel = effectChannel;
						this.makeBend(sequence,trackId,start,duration,note.effect.bend,channel);
					} else if(note.voice.beat.effect.isTremoloBar() && effectChannel >= 0 && !percussionTrack) {
						channel = effectChannel;
						this.makeTremoloBar(sequence,trackId,start,duration,note.voice.beat.effect.tremoloBar,channel);
					} else if(note.effect.slide && effectChannel >= 0 && !percussionTrack) {
						channel = effectChannel;
						var nextNote = alphatab.midi.MidiSequenceParser.getNextNote(note,track,measureIndex,beatIndex);
						this.makeSlide(sequence,trackId,note,nextNote,startMove,channel);
					} else if(note.effect.vibrato && effectChannel >= 0 && !percussionTrack) {
						channel = effectChannel;
						this.makeVibrato(sequence,trackId,start,duration,channel);
					}
					if(note.effect.isHarmonic() && !percussionTrack) {
						var orig = key;
						if(note.effect.harmonic.type == 0) {
							var _g5 = 0, _g4 = alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES.length;
							while(_g5 < _g4) {
								var i = _g5++;
								if(note.value % 12 == alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[i][0] % 12) {
									key = orig + alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[i][1] - note.value;
									break;
								}
							}
						} else {
							if(note.effect.harmonic.type == 4) this.makeNote(sequence,trackId,Math.min(127,orig) | 0,start,duration,Math.max(15,velocity - 48) | 0,channel);
							key = orig + alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES[note.effect.harmonic.data][1];
						}
						if(key - 12 > 0) {
							var hVelocity = Math.max(15,velocity - 64) | 0;
							this.makeNote(sequence,trackId,key - 12,start,duration,hVelocity,channel);
						}
					}
					this.makeNote(sequence,trackId,Math.min(127,key) | 0,start,duration,velocity,channel);
				}
			}
		}
	}
	,makeNote: function(sequence,track,key,start,duration,velocity,channel) {
		sequence.addNoteOn(this.getTick(start),track,channel,key,velocity);
		sequence.addNoteOff(this.getTick(start + duration),track,channel,key,velocity);
	}
	,makeRest: function(sequence,track,start,voice,beatIndex,channel) {
		sequence.addRest(this.getTick(start),track.number,channel);
	}
	,makeFadeIn: function(sequence,track,start,duration,channel) {
		var expression = 31;
		var expressionIncrement = 1;
		var tick = start;
		var tickIncrement = Math.round(duration / ((127 - expression) / expressionIncrement));
		while(tick < start + duration && expression < 127) {
			sequence.addControlChange(this.getTick(tick),track,channel,11,expression);
			tick += tickIncrement;
			expression += expressionIncrement;
		}
		sequence.addControlChange(this.getTick(start + duration),track,channel,11,127);
	}
	,getMixChangeValue: function(value,signed) {
		if(signed) value += 8;
		return Math.round(value * 127 / 16);
	}
	,makeMixChange: function(sequence,channel,track,beat) {
		var change = beat.effect.mixTableChange;
		var start = this.getTick(beat.start);
		if(change.volume != null) {
			var value = this.getMixChangeValue(change.volume.value,false);
			sequence.addControlChange(start,track,channel.channel,7,value);
			sequence.addControlChange(start,track,channel.effectChannel,7,value);
		}
		if(change.balance != null) {
			var value = this.getMixChangeValue(change.balance.value,true);
			sequence.addControlChange(start,track,channel.channel,10,value);
			sequence.addControlChange(start,track,channel.effectChannel,10,value);
		}
		if(change.chorus != null) {
			var value = this.getMixChangeValue(change.chorus.value,true);
			sequence.addControlChange(start,track,channel.channel,93,value);
			sequence.addControlChange(start,track,channel.effectChannel,93,value);
		}
		if(change.reverb != null) {
			var value = this.getMixChangeValue(change.reverb.value,true);
			sequence.addControlChange(start,track,channel.channel,91,value);
			sequence.addControlChange(start,track,channel.effectChannel,91,value);
		}
		if(change.phaser != null) {
			var value = this.getMixChangeValue(change.phaser.value,true);
			sequence.addControlChange(start,track,channel.channel,95,value);
			sequence.addControlChange(start,track,channel.effectChannel,95,value);
		}
		if(change.tremolo != null) {
			var value = this.getMixChangeValue(change.tremolo.value,true);
			sequence.addControlChange(start,track,channel.channel,92,value);
			sequence.addControlChange(start,track,channel.effectChannel,92,value);
		}
		if(change.instrument != null) {
			sequence.addProgramChange(start,track,channel.channel,change.instrument.value);
			sequence.addProgramChange(start,track,channel.effectChannel,change.instrument.value);
		}
		if(change.tempo != null) sequence.addTempoInUSQ(start,this._infoTrack,alphatab.model.Tempo.tempoToUsq(change.tempo.value));
	}
	,makeChannel2: function(sequence,channel,track,primary) {
		var number = !primary?channel.effectChannel:channel.channel;
		sequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),track,number,7,channel.volume);
		sequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),track,number,10,channel.balance);
		sequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),track,number,93,channel.chorus);
		sequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),track,number,91,channel.reverb);
		sequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),track,number,95,channel.phaser);
		sequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),track,number,92,channel.tremolo);
		sequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),track,number,11,127);
		sequence.addProgramChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),track,number,channel.instrument());
	}
	,makeChannel: function(sequence,channel,track) {
		if((this._flags & 2) == 0) return;
		this.makeChannel2(sequence,channel,track,true);
		if(channel.channel != channel.effectChannel) this.makeChannel2(sequence,channel,track,false);
	}
	,makeBend: function(sequence,track,start,duration,bend,channel) {
		var points = bend.points;
		var _g1 = 0, _g = points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = points[i];
			var bendStart = start + point.getTime(duration);
			var value = Math.round(64 + point.value * 2.75 / 1);
			this.addBend(sequence,track,bendStart,value,channel);
			if(points.length <= i + 1) continue;
			var nextPoint = points[i + 1];
			var nextValue = Math.round(64 + nextPoint.value * 2.75 / 1);
			var nextBendStart = start + nextPoint.getTime(duration) | 0;
			if(nextValue == value) continue;
			var width = (nextBendStart - bendStart) / Math.abs(nextValue - value);
			if(value < nextValue) while(value < nextValue) {
				value++;
				bendStart += Math.round(width);
				this.addBend(sequence,track,bendStart,value <= 127?value:127,channel);
			} else if(value > nextValue) while(value > nextValue) {
				value--;
				bendStart += Math.round(width);
				this.addBend(sequence,track,bendStart,value >= 0?value:0,channel);
			}
		}
		this.addBend(sequence,track,start + duration,64,channel);
	}
	,makeBeats: function(sequence,track,measure,measureIndex,startMove) {
		var stroke = new Array();
		var _g1 = 0, _g = track.stringCount();
		while(_g1 < _g) {
			var i = _g1++;
			stroke.push(0);
		}
		var previous = null;
		var _g1 = 0, _g = measure.beats.length;
		while(_g1 < _g) {
			var beatIndex = _g1++;
			var beat = measure.beats[beatIndex];
			if(beat.effect.mixTableChange != null) this.makeMixChange(sequence,track.channel,track.number,beat);
			this.makeNotes(sequence,track,beat,measure.header.tempo,measureIndex,beatIndex,startMove,alphatab.midi.MidiSequenceParser.getStroke(beat,previous,stroke));
			previous = beat;
		}
	}
	,getTick: function(tick) {
		return tick + this._firstTickMove;
	}
	,getRealNoteDuration: function(track,note,tempo,duration,measureIndex,beatIndex) {
		var lastEnd = note.voice.beat.start + note.voice.duration.time();
		var realDuration = duration;
		var nextBeatIndex = beatIndex + 1;
		var measureCount = track.measureCount();
		var _g = measureIndex;
		while(_g < measureCount) {
			var m = _g++;
			var measure = track.measures[m];
			var beatCount = measure.beats.length;
			var letRingSuspend = false;
			var _g1 = nextBeatIndex;
			while(_g1 < beatCount) {
				var b = _g1++;
				var beat = measure.beats[b];
				var voice = beat.voices[note.voice.index];
				if(voice.isRestVoice()) return alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
				var noteCount = voice.notes.length;
				var letRing = m == measureIndex && b != beatIndex && note.effect.letRing;
				var letRingAppliedForBeat = false;
				var _g2 = 0;
				while(_g2 < noteCount) {
					var n = _g2++;
					var nextNote = voice.notes[n];
					if(nextNote == note || nextNote.string != note.string) continue;
					if(nextNote.string == note.string && !nextNote.isTiedNote) {
						letRing = false;
						letRingSuspend = true;
					}
					if(!nextNote.isTiedNote && !letRing) return alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
					letRingAppliedForBeat = true;
					realDuration += beat.start - lastEnd + nextNote.voice.duration.time();
					lastEnd = beat.start + voice.duration.time();
				}
				if(letRing && !letRingAppliedForBeat && !letRingSuspend) {
					realDuration += beat.start - lastEnd + voice.duration.time();
					lastEnd = beat.start + voice.duration.time();
				}
			}
			nextBeatIndex = 0;
		}
		return alphatab.midi.MidiSequenceParser.applyDurationEffects(note,tempo,realDuration);
	}
	,createTrack: function(sequence,track,getTicks) {
		var previous = null;
		var controller = new alphatab.midi.MidiRepeatController(track.song);
		this.addBend(sequence,track.number,alphatab.model.Duration.QUARTER_TIME,64,track.channel.channel);
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
	,checkTripletFeel: function(voice,beatIndex) {
		var beatStart = voice.beat.start;
		var beatDuration = voice.duration.time();
		if(voice.beat.measure.header.tripletFeel == 1) {
			if(voice.duration == this.newDuration(alphatab.model.Duration.EIGHTH)) {
				if(beatStart % alphatab.model.Duration.QUARTER_TIME == 0) {
					var voice2 = alphatab.midi.MidiSequenceParser.getNextBeat(voice,beatIndex);
					if(voice2 == null || voice2.beat.start > beatStart + voice2.duration.time() || voice2.duration == this.newDuration(alphatab.model.Duration.EIGHTH)) {
						var duration = this.newDuration(alphatab.model.Duration.EIGHTH);
						duration.tuplet.enters = 3;
						duration.tuplet.times = 2;
						beatDuration = duration.time() * 2;
					}
				} else if(beatStart % (alphatab.model.Duration.QUARTER_TIME / 2) == 0) {
					var voice2 = alphatab.midi.MidiSequenceParser.getPreviousBeat(voice,beatIndex);
					if(voice2 == null || voice2.beat.start < beatStart - voice.duration.time() || voice2.duration == this.newDuration(alphatab.model.Duration.EIGHTH)) {
						var duration = this.newDuration(alphatab.model.Duration.EIGHTH);
						duration.tuplet.enters = 3;
						duration.tuplet.times = 2;
						beatStart = beatStart - voice.duration.time() + duration.time() * 2;
						beatDuration = duration.time();
					}
				}
			}
		} else if(voice.beat.measure.header.tripletFeel == 2) {
			if(voice.duration == this.newDuration(alphatab.model.Duration.SIXTEENTH)) {
				if(beatStart % (alphatab.model.Duration.QUARTER_TIME / 2) == 0) {
					var voice2 = alphatab.midi.MidiSequenceParser.getNextBeat(voice,beatIndex);
					if(voice2 == null || voice2.beat.start > beatStart + voice.duration.time() || voice2.duration == this.newDuration(alphatab.model.Duration.SIXTEENTH)) {
						var duration = this.newDuration(alphatab.model.Duration.SIXTEENTH);
						duration.tuplet.enters = 3;
						duration.tuplet.times = 2;
						beatDuration = duration.time() * 2;
					}
				} else if(beatStart % (alphatab.model.Duration.QUARTER_TIME / 4) == 0) {
					var voice2 = alphatab.midi.MidiSequenceParser.getPreviousBeat(voice,beatIndex);
					if(voice2 == null || (voice2.beat.start < beatStart - voice2.duration.time() || voice2.duration == this.newDuration(alphatab.model.Duration.SIXTEENTH))) {
						var duration = this.newDuration(alphatab.model.Duration.SIXTEENTH);
						duration.tuplet.enters = 3;
						duration.tuplet.times = 2;
						beatStart = beatStart - voice.duration.time() + duration.time() * 2;
						beatDuration = duration.time();
					}
				}
			}
		}
		return new alphatab.midi.BeatData(beatStart,beatDuration);
	}
	,addTimeSignature: function(sequence,currentMeasure,previousMeasure,startMove) {
		var addTimeSignature = false;
		if(previousMeasure == null) addTimeSignature = true; else {
			var currNumerator = currentMeasure.header.timeSignature.numerator;
			var currValue = currentMeasure.header.timeSignature.denominator.value;
			var prevNumerator = previousMeasure.header.timeSignature.numerator;
			var prevValue = previousMeasure.header.timeSignature.denominator.value;
			if(currNumerator != prevNumerator || currValue != prevValue) addTimeSignature = true;
		}
		if(addTimeSignature) sequence.addTimeSignature(this.getTick(currentMeasure.header.start + startMove),this._infoTrack,currentMeasure.header.timeSignature);
	}
	,addTempo: function(sequence,currentMeasure,previousMeasure,startMove) {
		var bAddTempo = false;
		if(previousMeasure == null) bAddTempo = true; else if(currentMeasure.header.tempo.inUsq() != previousMeasure.header.tempo.inUsq()) bAddTempo = true;
		if(!bAddTempo) return;
		var usq = Math.floor(currentMeasure.header.tempo.inUsq() * 100.0 / this._tempoPercent);
		sequence.addTempoInUSQ(this.getTick(currentMeasure.header.start + startMove),this._infoTrack,usq);
	}
	,addMetronome: function(sequence,header,startMove) {
		if((this._flags & 4) == 0) return;
		var start = startMove + header.start;
		var length = header.timeSignature.denominator.time();
		var _g1 = 1, _g = header.timeSignature.numerator + 1;
		while(_g1 < _g) {
			var i = _g1++;
			this.makeNote(sequence,this._metronomeTrack,37,start,length,95,9);
			start += length;
		}
	}
	,addDefaultMessages: function(oSequence) {
		if((this._flags & 1) == 0) return;
		var _g = 0;
		while(_g < 16) {
			var i = _g++;
			oSequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),this._infoTrack,i,101,0);
			oSequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),this._infoTrack,i,100,0);
			oSequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),this._infoTrack,i,6,12);
			oSequence.addControlChange(this.getTick(alphatab.model.Duration.QUARTER_TIME),this._infoTrack,i,38,0);
		}
	}
	,addBend: function(sequence,track,tick,bend,channel) {
		sequence.addPitchBend(this.getTick(tick),track,channel,bend);
	}
	,__class__: alphatab.midi.MidiSequenceParser
}
alphatab.midi.MidiSequenceParserFlags = function() { }
alphatab.midi.MidiSequenceParserFlags.__name__ = true;
alphatab.midi.model = {}
alphatab.midi.model.MidiEvent = function(tick,message) {
	this.tick = tick;
	this.message = message;
	this.message.event = this;
};
alphatab.midi.model.MidiEvent.__name__ = true;
alphatab.midi.model.MidiEvent.prototype = {
	writeTo: function(out) {
		var delta = this.getDeltaTicks();
		var data = new Array();
		alphatab.midi.model.MidiFile.writeVariableLengthValue(data,delta);
		out.writeBytes(data);
		this.message.writeTo(out);
	}
	,getDeltaTicks: function() {
		if(this.previousEvent == null) return 0;
		return this.tick - this.previousEvent.tick;
	}
	,__class__: alphatab.midi.model.MidiEvent
}
alphatab.midi.model.MidiFile = function(trackCount) {
	this.tracks = new Array();
	var _g = 0;
	while(_g < trackCount) {
		var i = _g++;
		this.addTrack(new alphatab.midi.model.MidiTrack());
	}
};
alphatab.midi.model.MidiFile.__name__ = true;
alphatab.midi.model.MidiFile.writeVariableLengthValue = function(data,value) {
	var v = value;
	var array = [0,0,0,0];
	var count = 0;
	array[0] = v & 127 & 255;
	v = v >> 7;
	while(v > 0) {
		count++;
		array[count] = (v & 127 | 128) & 255;
		v = v >> 7;
	}
	while(count >= 0) {
		data.push(array[count]);
		count--;
	}
}
alphatab.midi.model.MidiFile.prototype = {
	writeTo: function(out) {
		var d = null;
		if(js.Boot.__instanceof(out,alphatab.io.DataOutputStream)) {
			d = out;
			if(!d.bigEndian) d = new alphatab.io.DataOutputStream(out,true);
		} else d = new alphatab.io.DataOutputStream(out,true);
		d.writeBytes([77,84,104,100]);
		d.writeBytes([0,0,0,6]);
		d.writeBytes([0,1]);
		d.writeShort(this.tracks.length);
		d.writeShort(960);
		var _g = 0, _g1 = this.tracks;
		while(_g < _g1.length) {
			var t = _g1[_g];
			++_g;
			t.writeTo(d);
		}
	}
	,addTrack: function(t) {
		t.index = this.tracks.length;
		t.file = this;
		this.tracks.push(t);
	}
	,__class__: alphatab.midi.model.MidiFile
}
alphatab.midi.model.MidiMessage = function(data) {
	this.data = data;
};
alphatab.midi.model.MidiMessage.__name__ = true;
alphatab.midi.model.MidiMessage.prototype = {
	writeTo: function(out) {
		out.writeBytes(this.data);
	}
	,__class__: alphatab.midi.model.MidiMessage
}
alphatab.midi.model.MidiTrack = function() {
};
alphatab.midi.model.MidiTrack.__name__ = true;
alphatab.midi.model.MidiTrack.prototype = {
	writeTo: function(out) {
		var d = null;
		if(js.Boot.__instanceof(out,alphatab.io.DataOutputStream)) {
			d = out;
			if(!d.bigEndian) d = new alphatab.io.DataOutputStream(out,true);
		} else d = new alphatab.io.DataOutputStream(out,true);
		var trackData = new alphatab.io.MemoryOutputStream();
		var current = this.firstEvent;
		while(current != null) {
			current.writeTo(trackData);
			current = current.nextEvent;
		}
		d.writeBytes([77,84,114,107]);
		d.writeInt(trackData.getBuffer().length);
		d.writeBytes(trackData.getBuffer());
	}
	,addEvent: function(newEvent) {
		newEvent.track = this;
		if(this.firstEvent == null) {
			this.firstEvent = newEvent;
			this.lastEvent = newEvent;
		} else if(this.lastEvent.tick <= newEvent.tick) {
			this.lastEvent.nextEvent = newEvent;
			newEvent.previousEvent = this.lastEvent;
			this.lastEvent = newEvent;
		} else if(this.firstEvent.tick > newEvent.tick) {
			newEvent.nextEvent = this.firstEvent;
			this.firstEvent.previousEvent = newEvent;
			this.firstEvent = newEvent;
		} else {
			var firstDelta = newEvent.tick - this.firstEvent.tick;
			var lastDelta = this.lastEvent.tick - newEvent.tick;
			if(firstDelta < lastDelta) {
				var previous = this.firstEvent;
				while(previous != null && previous.nextEvent != null && previous.nextEvent.tick < newEvent.tick) previous = previous.nextEvent;
				if(previous == null) return;
				var next = previous.nextEvent;
				previous.nextEvent = newEvent;
				newEvent.previousEvent = previous;
				newEvent.nextEvent = next;
				if(next != null) next.previousEvent = newEvent;
			} else {
				var next = this.lastEvent;
				while(next != null && next.previousEvent != null && next.previousEvent.tick > newEvent.tick) next = next.previousEvent;
				if(next == null) return;
				var previous = next.previousEvent;
				next.previousEvent = newEvent;
				newEvent.nextEvent = next;
				newEvent.previousEvent = previous;
				if(previous != null) previous.nextEvent = newEvent; else this.firstEvent = newEvent;
			}
		}
	}
	,__class__: alphatab.midi.model.MidiTrack
}
alphatab.model = {}
alphatab.model.Beat = function(factory) {
	this.start = alphatab.model.Duration.QUARTER_TIME;
	this.effect = factory.newBeatEffect();
	this.voices = new Array();
	var _g = 0;
	while(_g < 2) {
		var i = _g++;
		var voice = factory.newVoice(i);
		voice.beat = this;
		this.voices.push(voice);
	}
};
alphatab.model.Beat.__name__ = true;
alphatab.model.Beat.prototype = {
	getNotes: function() {
		var notes = new Array();
		var _g = 0, _g1 = this.voices;
		while(_g < _g1.length) {
			var voice = _g1[_g];
			++_g;
			var _g2 = 0, _g3 = voice.notes;
			while(_g2 < _g3.length) {
				var note = _g3[_g2];
				++_g2;
				notes.push(note);
			}
		}
		return notes;
	}
	,ensureVoices: function(count,factory) {
		while(this.voices.length < count) {
			var voice = factory.newVoice(this.voices.length);
			voice.beat = this;
			this.voices.push(voice);
		}
	}
	,setChord: function(chord) {
		chord.beat = this;
		this.effect.chord = chord;
	}
	,setText: function(text) {
		text.beat = this;
		this.text = text;
	}
	,getRealStart: function() {
		var offset = this.start - this.measure.header.start;
		return this.measure.header.realStart + offset;
	}
	,isRestBeat: function() {
		var _g1 = 0, _g = this.voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var voice = this.voices[i];
			if(!voice.isEmpty && !voice.isRestVoice()) return false;
		}
		return true;
	}
	,__class__: alphatab.model.Beat
}
alphatab.model.BeatEffect = function(factory) {
	this.tapping = false;
	this.slapping = false;
	this.popping = false;
	this.fadeIn = false;
	this.stroke = factory.newStroke();
};
alphatab.model.BeatEffect.__name__ = true;
alphatab.model.BeatEffect.prototype = {
	isTremoloBar: function() {
		return this.tremoloBar != null;
	}
	,isChord: function() {
		return this.chord != null;
	}
	,__class__: alphatab.model.BeatEffect
}
alphatab.model.BeatStroke = function() {
	this.direction = 0;
};
alphatab.model.BeatStroke.__name__ = true;
alphatab.model.BeatStroke.prototype = {
	getIncrementTime: function(beat) {
		var duration = 0;
		if(this.value > 0) {
			var _g1 = 0, _g = beat.voices.length;
			while(_g1 < _g) {
				var v = _g1++;
				var voice = beat.voices[v];
				if(voice.isEmpty) continue;
				var currentDuration = voice.duration.time();
				if(duration == 0 || currentDuration < duration) duration = currentDuration <= alphatab.model.Duration.QUARTER_TIME?currentDuration:alphatab.model.Duration.QUARTER_TIME;
			}
			if(duration > 0) return Math.round(duration / 8.0 * (4.0 / this.value));
		}
		return 0;
	}
	,__class__: alphatab.model.BeatStroke
}
alphatab.model.BeatStrokeDirection = function() { }
alphatab.model.BeatStrokeDirection.__name__ = true;
alphatab.model.BeatText = function() {
};
alphatab.model.BeatText.__name__ = true;
alphatab.model.BeatText.prototype = {
	__class__: alphatab.model.BeatText
}
alphatab.model.Chord = function(length) {
	this.strings = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		this.strings.push(-1);
	}
};
alphatab.model.Chord.__name__ = true;
alphatab.model.Chord.prototype = {
	noteCount: function() {
		var count = 0;
		var _g1 = 0, _g = this.strings.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this.strings[i] >= 0) count++;
		}
		return count;
	}
	,stringCount: function() {
		return this.strings.length;
	}
	,__class__: alphatab.model.Chord
}
alphatab.model.Color = function(r,g,b,a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
};
alphatab.model.Color.__name__ = true;
alphatab.model.Color.fromRgb = function(r,g,b) {
	return new alphatab.model.Color(r,g,b,1);
}
alphatab.model.Color.fromARgb = function(r,g,b,a) {
	return new alphatab.model.Color(r,g,b,a);
}
alphatab.model.Color.prototype = {
	asRgbString: function() {
		if(this.a == 1) {
			var s = "rgb(";
			s += Std.string(this.r) + ",";
			s += Std.string(this.g) + ",";
			s += Std.string(this.b) + ")";
			return s;
		} else {
			var s = "rgba(";
			s += Std.string(this.r) + ",";
			s += Std.string(this.g) + ",";
			s += Std.string(this.b) + ",";
			s += Std.string(this.a) + ")";
			return s;
		}
	}
	,__class__: alphatab.model.Color
}
alphatab.model.Duration = function(factory) {
	this.value = alphatab.model.Duration.QUARTER;
	this.isDotted = false;
	this.isDoubleDotted = false;
	this.tuplet = factory.newTuplet();
};
alphatab.model.Duration.__name__ = true;
alphatab.model.Duration.fromTime = function(factory,time,minimum,diff) {
	var duration = minimum.clone(factory);
	var tmp = factory.newDuration();
	tmp.value = alphatab.model.Duration.WHOLE;
	tmp.isDotted = true;
	var finish = false;
	while(!finish) {
		var tmpTime = tmp.time();
		if(tmpTime - diff <= time) {
			if(Math.abs(tmpTime - time) < Math.abs(duration.time() - time)) duration = tmp.clone(factory);
		}
		if(tmp.isDotted) tmp.isDotted = false; else if(tmp.tuplet.equals(alphatab.model.Tuplet.NORMAL)) {
			tmp.tuplet.enters = 3;
			tmp.tuplet.times = 2;
		} else {
			tmp.value = tmp.value * 2;
			tmp.isDotted = true;
			tmp.tuplet.enters = 1;
			tmp.tuplet.times = 1;
		}
		if(tmp.value > alphatab.model.Duration.SIXTY_FOURTH) finish = true;
	}
	return duration;
}
alphatab.model.Duration.prototype = {
	equals: function(other) {
		if(other == null) return false;
		if(this == other) return true;
		return other.value == this.value && other.isDotted == this.isDotted && other.isDoubleDotted == this.isDoubleDotted && other.tuplet.equals(this.tuplet);
	}
	,clone: function(factory) {
		var duration = factory.newDuration();
		duration.value = this.value;
		duration.isDotted = this.isDotted;
		duration.isDoubleDotted = this.isDoubleDotted;
		duration.tuplet = this.tuplet.clone(factory);
		return duration;
	}
	,copy: function(duration) {
		duration.value = this.value;
		duration.isDotted = this.isDotted;
		duration.isDoubleDotted = this.isDoubleDotted;
		this.tuplet.copy(duration.tuplet);
	}
	,index: function() {
		var index = 0;
		var value = this.value;
		while((value = value >> 1) > 0) index++;
		return index;
	}
	,time: function() {
		var time = Math.floor(alphatab.model.Duration.QUARTER_TIME * (4.0 / this.value));
		if(this.isDotted) time += Math.floor(time / 2); else if(this.isDoubleDotted) time += Math.floor(time / 4 * 3);
		return this.tuplet.convertTime(time);
	}
	,__class__: alphatab.model.Duration
}
alphatab.model.GuitarString = function() {
	this.number = 0;
	this.value = 0;
};
alphatab.model.GuitarString.__name__ = true;
alphatab.model.GuitarString.prototype = {
	clone: function(factory) {
		var newString = factory.newString();
		newString.number = this.number;
		newString.value = this.value;
		return newString;
	}
	,__class__: alphatab.model.GuitarString
}
alphatab.model.HeaderFooterElements = function() { }
alphatab.model.HeaderFooterElements.__name__ = true;
alphatab.model.LyricLine = function(startingMeasure,lyrics) {
	this.startingMeasure = startingMeasure;
	this.lyrics = lyrics;
};
alphatab.model.LyricLine.__name__ = true;
alphatab.model.LyricLine.prototype = {
	__class__: alphatab.model.LyricLine
}
alphatab.model.Lyrics = function(trackChoice) {
	this.trackChoice = trackChoice;
	this.lines = new Array();
};
alphatab.model.Lyrics.__name__ = true;
alphatab.model.Lyrics.prototype = {
	lyricsBeats: function() {
		var full = "";
		var _g = 0, _g1 = this.lines;
		while(_g < _g1.length) {
			var line = _g1[_g];
			++_g;
			if(line != null) full += line.lyrics + "\n";
		}
		var ret = StringTools.trim(full);
		ret = StringTools.replace(ret,"\n"," ");
		ret = StringTools.replace(ret,"\r"," ");
		return ret.split(" ");
	}
	,__class__: alphatab.model.Lyrics
}
alphatab.model.Marker = function() {
};
alphatab.model.Marker.__name__ = true;
alphatab.model.Marker.prototype = {
	__class__: alphatab.model.Marker
}
alphatab.model.Measure = function(header) {
	this.header = header;
	this.clef = 0;
	this.beats = new Array();
};
alphatab.model.Measure.__name__ = true;
alphatab.model.Measure.prototype = {
	addBeat: function(beat) {
		beat.measure = this;
		beat.index = this.beats.length;
		this.beats.push(beat);
	}
	,marker: function() {
		return this.header.marker;
	}
	,hasMarker: function() {
		return this.header.hasMarker();
	}
	,tripletFeel: function() {
		return this.header.tripletFeel;
	}
	,isRepeatOpen: function() {
		return this.header.isRepeatOpen;
	}
	,timeSignature: function() {
		return this.header.timeSignature;
	}
	,tempo: function() {
		return this.header.tempo;
	}
	,length: function() {
		return this.header.length();
	}
	,start: function() {
		return this.header.start;
	}
	,repeatClose: function() {
		return this.header.repeatClose;
	}
	,keySignature: function() {
		return this.header.keySignature;
	}
	,number: function() {
		return this.header.number;
	}
	,end: function() {
		return this.header.start + this.header.length();
	}
	,beatCount: function() {
		return this.beats.length;
	}
	,__class__: alphatab.model.Measure
}
alphatab.model.MeasureClef = function() { }
alphatab.model.MeasureClef.__name__ = true;
alphatab.model.MeasureHeader = function(factory) {
	this.number = 0;
	this.start = alphatab.model.Duration.QUARTER_TIME;
	this.timeSignature = factory.newTimeSignature();
	this.keySignature = 0;
	this.tempo = factory.newTempo();
	this.marker = null;
	this.tripletFeel = 0;
	this.isRepeatOpen = false;
	this.repeatClose = 0;
	this.repeatAlternative = 0;
	this.realStart = -1;
};
alphatab.model.MeasureHeader.__name__ = true;
alphatab.model.MeasureHeader.prototype = {
	length: function() {
		return this.timeSignature.numerator * this.timeSignature.denominator.time();
	}
	,hasMarker: function() {
		return this.marker != null;
	}
	,__class__: alphatab.model.MeasureHeader
}
alphatab.model.MidiChannel = function() {
	this.channel = 0;
	this.effectChannel = 0;
	this.instrument(25);
	this.volume = 127;
	this.balance = 64;
	this.chorus = 0;
	this.reverb = 0;
	this.phaser = 0;
	this.tremolo = 0;
};
alphatab.model.MidiChannel.__name__ = true;
alphatab.model.MidiChannel.prototype = {
	copy: function(channel) {
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
	,isPercussionChannel: function() {
		return this.channel == 9;
	}
	,instrument: function(newInstrument) {
		if(newInstrument == null) newInstrument = -1;
		if(newInstrument != -1) this._instrument = newInstrument;
		return this.isPercussionChannel()?0:this._instrument;
	}
	,__class__: alphatab.model.MidiChannel
}
alphatab.model.MixTableChange = function() {
	this.volume = new alphatab.model.MixTableItem();
	this.balance = new alphatab.model.MixTableItem();
	this.chorus = new alphatab.model.MixTableItem();
	this.reverb = new alphatab.model.MixTableItem();
	this.phaser = new alphatab.model.MixTableItem();
	this.tremolo = new alphatab.model.MixTableItem();
	this.instrument = new alphatab.model.MixTableItem();
	this.tempo = new alphatab.model.MixTableItem();
	this.hideTempo = true;
};
alphatab.model.MixTableChange.__name__ = true;
alphatab.model.MixTableChange.prototype = {
	__class__: alphatab.model.MixTableChange
}
alphatab.model.MixTableItem = function() {
	this.value = 0;
	this.duration = 0;
	this.allTracks = false;
};
alphatab.model.MixTableItem.__name__ = true;
alphatab.model.MixTableItem.prototype = {
	__class__: alphatab.model.MixTableItem
}
alphatab.model.Note = function(factory) {
	this._realValue = -1;
	this.value = 0;
	this.velocity = 95;
	this.string = 1;
	this.isTiedNote = false;
	this.swapAccidentals = false;
	this.effect = factory.newNoteEffect();
};
alphatab.model.Note.__name__ = true;
alphatab.model.Note.prototype = {
	realValue: function() {
		if(this._realValue == -1) this._realValue = this.value + this.voice.beat.measure.track.strings[this.string - 1].value;
		return this._realValue;
	}
	,__class__: alphatab.model.Note
}
alphatab.model.NoteEffect = function() {
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
};
alphatab.model.NoteEffect.__name__ = true;
alphatab.model.NoteEffect.prototype = {
	clone: function(factory) {
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
		effect.bend = this.isBend()?this.bend.clone(factory):null;
		effect.harmonic = this.isHarmonic()?this.harmonic.clone(factory):null;
		effect.grace = this.isGrace()?this.grace.clone(factory):null;
		effect.trill = this.isTrill()?this.trill.clone(factory):null;
		effect.tremoloPicking = this.isTremoloPicking()?this.tremoloPicking.clone(factory):null;
		return effect;
	}
	,isTremoloPicking: function() {
		return this.tremoloPicking != null;
	}
	,isTrill: function() {
		return this.trill != null;
	}
	,isGrace: function() {
		return this.grace != null;
	}
	,isHarmonic: function() {
		return this.harmonic != null;
	}
	,isBend: function() {
		return this.bend != null && this.bend.points.length != 0;
	}
	,__class__: alphatab.model.NoteEffect
}
alphatab.model.Padding = function(right,top,left,bottom) {
	this.right = right;
	this.top = top;
	this.left = left;
	this.bottom = bottom;
};
alphatab.model.Padding.__name__ = true;
alphatab.model.Padding.prototype = {
	getVertical: function() {
		return this.top + this.bottom;
	}
	,getHorizontal: function() {
		return this.left + this.right;
	}
	,__class__: alphatab.model.Padding
}
alphatab.model.PageSetup = function() {
	this.pageSize = new alphatab.model.Point(210,297);
	this.pageMargin = new alphatab.model.Padding(10,15,10,10);
	this.scoreSizeProportion = 1;
	this.headerAndFooter = 511;
	this.title = "%TITLE%";
	this.subtitle = "%SUBTITLE%";
	this.artist = "%ARTIST%";
	this.album = "%ALBUM%";
	this.words = "Words by %WORDS%";
	this.music = "Music by %MUSIC%";
	this.wordsAndMusic = "Words & Music by %WORDSMUSIC%";
	this.copyright = "Copyright %COPYRIGHT%\n" + "All Rights Reserved - International Copyright Secured";
	this.pageNumber = "Page %N%/%P%";
};
alphatab.model.PageSetup.__name__ = true;
alphatab.model.PageSetup.prototype = {
	__class__: alphatab.model.PageSetup
}
alphatab.model.Point = function(x,y) {
	this.x = x;
	this.y = y;
};
alphatab.model.Point.__name__ = true;
alphatab.model.Point.prototype = {
	__class__: alphatab.model.Point
}
alphatab.model.Rectangle = function(x,y,width,height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};
alphatab.model.Rectangle.__name__ = true;
alphatab.model.Rectangle.prototype = {
	__class__: alphatab.model.Rectangle
}
alphatab.model.RepeatGroup = function() {
	this.measureHeaders = new Array();
	this.closings = new Array();
	this.openings = new Array();
	this.isClosed = false;
};
alphatab.model.RepeatGroup.__name__ = true;
alphatab.model.RepeatGroup.prototype = {
	addMeasureHeader: function(h) {
		if(this.openings.length == 0) this.openings.push(h);
		this.measureHeaders.push(h);
		h.repeatGroup = this;
		if(h.repeatClose > 0) {
			this.closings.push(h);
			this.isClosed = true;
		} else if(this.isClosed) {
			this.isClosed = false;
			this.openings.push(h);
		}
	}
	,__class__: alphatab.model.RepeatGroup
}
alphatab.model.SlideType = function() { }
alphatab.model.SlideType.__name__ = true;
alphatab.model.Song = function() {
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
	this._currentRepeatGroup = new alphatab.model.RepeatGroup();
};
alphatab.model.Song.__name__ = true;
alphatab.model.Song.prototype = {
	addTrack: function(track) {
		track.song = this;
		this.tracks.push(track);
	}
	,addMeasureHeader: function(header) {
		header.song = this;
		this.measureHeaders.push(header);
		if(header.isRepeatOpen || this._currentRepeatGroup.isClosed && header.repeatAlternative <= 0) this._currentRepeatGroup = new alphatab.model.RepeatGroup();
		this._currentRepeatGroup.addMeasureHeader(header);
	}
	,__class__: alphatab.model.Song
}
alphatab.model.SongFactory = function() {
};
alphatab.model.SongFactory.__name__ = true;
alphatab.model.SongFactory.prototype = {
	newNote: function() {
		return new alphatab.model.Note(this);
	}
	,newMixTableChange: function() {
		return new alphatab.model.MixTableChange();
	}
	,newText: function() {
		return new alphatab.model.BeatText();
	}
	,newChord: function(stringCount) {
		return new alphatab.model.Chord(stringCount);
	}
	,newTremoloPickingEffect: function() {
		return new alphatab.model.effects.TremoloPickingEffect(this);
	}
	,newTrillEffect: function() {
		return new alphatab.model.effects.TrillEffect(this);
	}
	,newGraceEffect: function() {
		return new alphatab.model.effects.GraceEffect();
	}
	,newHarmonicEffect: function() {
		return new alphatab.model.effects.HarmonicEffect();
	}
	,newBendEffect: function() {
		return new alphatab.model.effects.BendEffect();
	}
	,newBeat: function() {
		return new alphatab.model.Beat(this);
	}
	,newTuplet: function() {
		return new alphatab.model.Tuplet();
	}
	,newMeasure: function(header) {
		return new alphatab.model.Measure(header);
	}
	,newString: function() {
		return new alphatab.model.GuitarString();
	}
	,newTrack: function() {
		return new alphatab.model.Track(this);
	}
	,newBeatEffect: function() {
		return new alphatab.model.BeatEffect(this);
	}
	,newNoteEffect: function() {
		return new alphatab.model.NoteEffect();
	}
	,newVoice: function(index) {
		return new alphatab.model.Voice(this,index);
	}
	,newStroke: function() {
		return new alphatab.model.BeatStroke();
	}
	,newMarker: function() {
		return new alphatab.model.Marker();
	}
	,newTempo: function() {
		return new alphatab.model.Tempo();
	}
	,newMeasureHeader: function() {
		return new alphatab.model.MeasureHeader(this);
	}
	,newDuration: function() {
		return new alphatab.model.Duration(this);
	}
	,newTimeSignature: function() {
		return new alphatab.model.TimeSignature(this);
	}
	,newMidiChannel: function() {
		return new alphatab.model.MidiChannel();
	}
	,newPageSetup: function() {
		return new alphatab.model.PageSetup();
	}
	,newLyricLine: function() {
		return new alphatab.model.LyricLine(0,"");
	}
	,newLyrics: function() {
		return new alphatab.model.Lyrics(0);
	}
	,newSong: function() {
		return new alphatab.model.Song();
	}
	,__class__: alphatab.model.SongFactory
}
alphatab.model.SongManager = function(factory) {
	this.factory = factory;
};
alphatab.model.SongManager.__name__ = true;
alphatab.model.SongManager.getDivisionLength = function(header) {
	var defaulLenght = alphatab.model.Duration.QUARTER_TIME;
	var denominator = header.timeSignature.denominator.value;
	switch(denominator) {
	case alphatab.model.Duration.EIGHTH:
		if(header.timeSignature.numerator % 3 == 0) defaulLenght += Math.floor(alphatab.model.Duration.QUARTER_TIME / 2);
		break;
	}
	return defaulLenght;
}
alphatab.model.SongManager.getFirstBeat = function(list) {
	return list.length > 0?list[0]:null;
}
alphatab.model.SongManager.getNextBeat2 = function(beats,currentBeat) {
	var next = null;
	var _g = 0;
	while(_g < beats.length) {
		var checkedBeat = beats[_g];
		++_g;
		if(checkedBeat.start > currentBeat.start) {
			if(next == null || checkedBeat.start < next.start) next = checkedBeat;
		}
	}
	return next;
}
alphatab.model.SongManager.getNextVoice = function(beats,beat,index) {
	var next = null;
	var _g = 0;
	while(_g < beats.length) {
		var current = beats[_g];
		++_g;
		if(current.start > beat.start && !current.voices[index].isEmpty) {
			if(next == null || current.start < next.beat.start) next = current.voices[index];
		}
	}
	return next;
}
alphatab.model.SongManager.getFirstVoice = function(beats,index) {
	var first = null;
	var _g = 0;
	while(_g < beats.length) {
		var current = beats[_g];
		++_g;
		if((first == null || current.start < first.beat.start) && !current.voices[index].isEmpty) first = current.voices[index];
	}
	return first;
}
alphatab.model.SongManager.getBeat = function(measure,start) {
	var _g = 0, _g1 = measure.beats;
	while(_g < _g1.length) {
		var beat = _g1[_g];
		++_g;
		if(beat.start == start) return beat;
	}
	return null;
}
alphatab.model.SongManager.quickSort = function(elements,left,right) {
	var i = left;
	var j = right;
	var pivot = elements[Math.floor((left + right) / 2)];
	do {
		while(elements[i].start < pivot.start && i < right) i++;
		while(pivot.start < elements[j].start && j > left) j--;
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
alphatab.model.SongManager.getFirstMeasure = function(track) {
	return track.measureCount() > 0?track.measures[0]:null;
}
alphatab.model.SongManager.prototype = {
	getNextNote: function(measure,start,voiceIndex,guitarString) {
		var beat = alphatab.model.SongManager.getBeat(measure,start);
		if(beat != null) {
			var next = alphatab.model.SongManager.getNextBeat2(measure.beats,beat);
			while(next != null) {
				var voice = next.voices[voiceIndex];
				if(!voice.isEmpty) {
					var _g = 0, _g1 = voice.notes;
					while(_g < _g1.length) {
						var current = _g1[_g];
						++_g;
						if(current.string == guitarString || guitarString == -1) return current;
					}
				}
				next = alphatab.model.SongManager.getNextBeat2(measure.beats,next);
			}
		}
		return null;
	}
	,getNextBeat: function(beat) {
		var nextBeat = alphatab.model.SongManager.getNextBeat2(beat.measure.beats,beat);
		if(nextBeat == null && beat.measure.track.measureCount() > beat.measure.header.number) {
			var measure = beat.measure.track.measures[beat.measure.header.number];
			if(measure.beats.length > 0) return measure.beats[0];
		}
		return nextBeat;
	}
	,getPreviousMeasureHeader: function(header) {
		var prevIndex = header.number - 1;
		if(prevIndex > 0) return header.song.measureHeaders[prevIndex - 1];
		return null;
	}
	,getPreviousMeasure: function(measure) {
		return measure.header.number > 1?measure.track.measures[measure.header.number - 2]:null;
	}
	,orderBeats: function(measure) {
		alphatab.model.SongManager.quickSort(measure.beats,0,measure.beats.length - 1);
	}
	,createDurations: function(time) {
		var durations = new Array();
		var min = this.factory.newDuration();
		min.value = alphatab.model.Duration.SIXTY_FOURTH;
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
	,createSilences: function(measure,start,length,voiceIndex) {
		var nextStart = start;
		var durations = this.createDurations(length);
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
	,autoCompleteSilences: function(measure) {
		var beat = alphatab.model.SongManager.getFirstBeat(measure.beats);
		if(beat == null) {
			this.createSilences(measure,measure.header.start,measure.header.length(),0);
			return;
		}
		var _g = 0;
		while(_g < 2) {
			var v = _g++;
			var voice = alphatab.model.SongManager.getFirstVoice(measure.beats,v);
			if(voice != null && voice.beat.start > measure.header.start) this.createSilences(measure,measure.header.start,voice.beat.start - measure.header.start,v);
		}
		var start = new Array();
		var uncompletedLength = new Array();
		var _g1 = 0, _g = beat.voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			start.push(0);
			uncompletedLength.push(0);
		}
		while(beat != null) {
			var _g1 = 0, _g = beat.voices.length;
			while(_g1 < _g) {
				var v = _g1++;
				var voice = beat.voices[v];
				if(!voice.isEmpty) {
					var voiceEnd = beat.start + voice.duration.time();
					var nextPosition = measure.header.start + measure.header.length();
					var nextVoice = alphatab.model.SongManager.getNextVoice(measure.beats,beat,voice.index);
					if(nextVoice != null) nextPosition = nextVoice.beat.start;
					if(voiceEnd < nextPosition) {
						start[v] = voiceEnd;
						uncompletedLength[v] = nextPosition - voiceEnd;
					}
				}
			}
			var _g1 = 0, _g = uncompletedLength.length;
			while(_g1 < _g) {
				var v = _g1++;
				if(uncompletedLength[v] > 0) this.createSilences(measure,start[v],uncompletedLength[v],v);
				start[v] = 0;
				uncompletedLength[v] = 0;
			}
			beat = alphatab.model.SongManager.getNextBeat2(measure.beats,beat);
		}
	}
	,getRealStart: function(measure,currentStart) {
		var beatLength = alphatab.model.SongManager.getDivisionLength(measure.header);
		var start = currentStart;
		var startBeat = start % beatLength == 0;
		if(!startBeat) {
			var minDuration = this.factory.newDuration();
			minDuration.value = alphatab.model.Duration.SIXTY_FOURTH;
			minDuration.tuplet.enters = 3;
			minDuration.tuplet.times = 2;
			var time = minDuration.time();
			var _g = 0;
			while(_g < time) {
				var i = _g++;
				start++;
				startBeat = start % beatLength == 0;
				if(startBeat) break;
			}
			if(!startBeat) start = currentStart;
		}
		return start;
	}
	,__class__: alphatab.model.SongManager
}
alphatab.model.Tempo = function() {
	this.value = 120;
};
alphatab.model.Tempo.__name__ = true;
alphatab.model.Tempo.tempoToUsq = function(tempo) {
	return Math.floor(60000000 / tempo);
}
alphatab.model.Tempo.prototype = {
	copy: function(tempo) {
		this.value = tempo.value;
	}
	,inUsq: function() {
		return alphatab.model.Tempo.tempoToUsq(this.value);
	}
	,__class__: alphatab.model.Tempo
}
alphatab.model.TimeSignature = function(factory) {
	this.numerator = 4;
	this.denominator = factory.newDuration();
};
alphatab.model.TimeSignature.__name__ = true;
alphatab.model.TimeSignature.prototype = {
	copy: function(timeSignature) {
		timeSignature.numerator = this.numerator;
		this.denominator.copy(timeSignature.denominator);
	}
	,__class__: alphatab.model.TimeSignature
}
alphatab.model.Track = function(factory) {
	this.number = 0;
	this.offset = 0;
	this.isSolo = false;
	this.isMute = false;
	this.name = "";
	this.measures = new Array();
	this.strings = new Array();
	this.channel = factory.newMidiChannel();
	this.color = alphatab.model.Color.fromRgb(255,0,0);
};
alphatab.model.Track.__name__ = true;
alphatab.model.Track.prototype = {
	addMeasure: function(measure) {
		measure.track = this;
		this.measures.push(measure);
	}
	,measureCount: function() {
		return this.measures.length;
	}
	,stringCount: function() {
		return this.strings.length;
	}
	,__class__: alphatab.model.Track
}
alphatab.model.TripletFeel = function() { }
alphatab.model.TripletFeel.__name__ = true;
alphatab.model.Tuning = function(name,tuning,isStandard) {
	this.name = name;
	this.tuning = tuning;
	this.isStandard = isStandard;
};
alphatab.model.Tuning.__name__ = true;
alphatab.model.Tuning.isTuning = function(name) {
	var regex = alphatab.model.Tuning.TUNING_REGEX;
	return regex.match(name);
}
alphatab.model.Tuning.getTextForTuning = function(tuning,includeOctave) {
	var octave = Math.floor(tuning / 12);
	var note = tuning % 12;
	var notes = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
	var result = notes[note];
	if(includeOctave) result += Std.string(octave);
	return result;
}
alphatab.model.Tuning.getTuningForText = function(str) {
	var base = 0;
	var regex = alphatab.model.Tuning.TUNING_REGEX;
	if(regex.match(str.toLowerCase())) {
		var note = regex.matched(1);
		var octave = Std.parseInt(regex.matched(2));
		if(note == "c") base = 0; else if(note == "db") base = 1; else if(note == "d") base = 2; else if(note == "eb") base = 3; else if(note == "e") base = 4; else if(note == "f") base = 5; else if(note == "gb") base = 6; else if(note == "g") base = 7; else if(note == "ab") base = 8; else if(note == "a") base = 9; else if(note == "bb") base = 10; else if(note == "b") base = 11; else return 0;
		base += octave * 12;
	} else return -1;
	return base;
}
alphatab.model.Tuning.getPresetsFor = function(strings) {
	if(alphatab.model.Tuning._sevenStrings == null) alphatab.model.Tuning.initialize();
	if(strings == 7) return alphatab.model.Tuning._sevenStrings;
	if(strings == 6) return alphatab.model.Tuning._sixStrings;
	if(strings == 5) return alphatab.model.Tuning._fiveStrings;
	if(strings == 4) return alphatab.model.Tuning._fourStrings;
	return new Array();
}
alphatab.model.Tuning.initialize = function() {
	alphatab.model.Tuning._sevenStrings = new Array();
	alphatab.model.Tuning._sixStrings = new Array();
	alphatab.model.Tuning._fiveStrings = new Array();
	alphatab.model.Tuning._fourStrings = new Array();
	alphatab.model.Tuning._sevenStrings.push(new alphatab.model.Tuning("Guitar 7 strings",[64,59,55,50,45,40,35],true));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Standard Tuning",[64,59,55,50,45,40],true));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Tune down ½ step",[63,58,54,49,44,39],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Tune down 1 step",[62,57,53,48,43,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Tune down 2 step",[60,55,51,46,41,36],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Dropped D Tuning",[64,59,55,50,45,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Dropped D Tuning variant",[64,57,55,50,45,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Double Dropped D Tuning",[62,59,55,50,45,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Dropped E Tuning",[66,61,57,52,47,40],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Dropped C Tuning",[62,57,53,48,43,36],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open C Tuning",[64,60,55,48,43,36],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Cm Tuning",[63,60,55,48,43,36],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open C6 Tuning",[64,57,55,48,43,36],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Cmaj7 Tuning",[64,59,55,52,43,36],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open D Tuning",[62,57,54,50,45,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Dm Tuning",[62,57,53,50,45,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open D5 Tuning",[62,57,50,50,45,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open D6 Tuning",[62,59,54,50,45,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Dsus4 Tuning",[62,57,55,50,45,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open E Tuning",[64,59,56,52,47,40],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Em Tuning",[64,59,55,52,47,40],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Esus11 Tuning",[64,59,55,52,45,40],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open F Tuning",[65,60,53,48,45,41],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open G Tuning",[62,59,55,50,43,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Gm Tuning",[62,58,55,50,43,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open G6 Tuning",[64,59,55,50,43,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Gsus4 Tuning",[62,60,55,50,43,38],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open A Tuning",[64,61,57,52,45,40],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Open Am Tuning",[64,60,57,52,45,40],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Guitar Nashville Tuning",[64,59,67,62,57,52],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Bass 6 Strings Tuning",[48,43,38,33,28,23],false));
	alphatab.model.Tuning._sixStrings.push(new alphatab.model.Tuning("Lute or Vihuela Tuning",[64,59,54,50,45,40],false));
	alphatab.model.Tuning._fiveStrings.push(new alphatab.model.Tuning("Bass 5 Strings Tuning",[43,38,33,28,23],true));
	alphatab.model.Tuning._fiveStrings.push(new alphatab.model.Tuning("Banjo Dropped C Tuning",[62,59,55,48,67],false));
	alphatab.model.Tuning._fiveStrings.push(new alphatab.model.Tuning("Banjo Open D Tuning",[62,57,54,50,69],false));
	alphatab.model.Tuning._fiveStrings.push(new alphatab.model.Tuning("Banjo Open G Tuning",[62,59,55,50,67],false));
	alphatab.model.Tuning._fiveStrings.push(new alphatab.model.Tuning("Banjo G Minor Tuning",[62,58,55,50,67],false));
	alphatab.model.Tuning._fiveStrings.push(new alphatab.model.Tuning("Banjo G Modal Tuning",[62,57,55,50,67],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Bass Standard Tuning",[43,38,33,28],true));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Bass Tune down ½ step",[42,37,32,27],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Bass Tune down 1 step",[41,36,31,26],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Bass Tune down 2 step",[39,34,29,24],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Bass Dropped D Tuning",[43,38,33,26],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Ukulele C Tuning",[45,40,36,43],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Ukulele G Tuning",[52,47,43,38],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Mandolin Standard Tuning",[64,57,50,43],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Mandolin or Violin Tuning",[76,69,62,55],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Viola Tuning",[69,62,55,48],false));
	alphatab.model.Tuning._fourStrings.push(new alphatab.model.Tuning("Cello Tuning",[57,50,43,36],false));
}
alphatab.model.Tuning.findTuning = function(strings) {
	var tunings = alphatab.model.Tuning.getPresetsFor(strings.length);
	var _g = 0;
	while(_g < tunings.length) {
		var tuning = tunings[_g];
		++_g;
		var equals = true;
		var _g2 = 0, _g1 = strings.length;
		while(_g2 < _g1) {
			var i = _g2++;
			if(strings[i].value != tuning.tuning[i]) {
				equals = false;
				break;
			}
		}
		if(equals) return tuning;
	}
	return null;
}
alphatab.model.Tuning.prototype = {
	__class__: alphatab.model.Tuning
}
alphatab.model.Tuplet = function() {
	this.enters = 1;
	this.times = 1;
};
alphatab.model.Tuplet.__name__ = true;
alphatab.model.Tuplet.prototype = {
	clone: function(factory) {
		var tuplet = factory.newTuplet();
		this.copy(tuplet);
		return tuplet;
	}
	,equals: function(tuplet) {
		return this.enters == tuplet.enters && this.times == tuplet.times;
	}
	,convertTime: function(time) {
		return Math.floor(time * this.times / this.enters);
	}
	,copy: function(tuplet) {
		tuplet.enters = this.enters;
		tuplet.times = this.times;
	}
	,__class__: alphatab.model.Tuplet
}
alphatab.model.Velocities = function() { }
alphatab.model.Velocities.__name__ = true;
alphatab.model.Voice = function(factory,index) {
	this.duration = factory.newDuration();
	this.notes = new Array();
	this.index = index;
	this.direction = 0;
	this.isEmpty = true;
};
alphatab.model.Voice.__name__ = true;
alphatab.model.Voice.prototype = {
	addNote: function(note) {
		note.voice = this;
		this.notes.push(note);
		this.isEmpty = false;
	}
	,isRestVoice: function() {
		return this.notes.length == 0;
	}
	,__class__: alphatab.model.Voice
}
alphatab.model.VoiceDirection = function() { }
alphatab.model.VoiceDirection.__name__ = true;
alphatab.model.effects = {}
alphatab.model.effects.BendEffect = function() {
	this.type = 0;
	this.value = 0;
	this.points = new Array();
};
alphatab.model.effects.BendEffect.__name__ = true;
alphatab.model.effects.BendEffect.prototype = {
	clone: function(factory) {
		var effect = factory.newBendEffect();
		effect.value = this.value;
		effect.type = this.type;
		var _g1 = 0, _g = this.points.length;
		while(_g1 < _g) {
			var i = _g1++;
			var point = this.points[i];
			effect.points.push(new alphatab.model.effects.BendPoint(point.position,point.value,point.vibrato));
		}
		return effect;
	}
	,__class__: alphatab.model.effects.BendEffect
}
alphatab.model.effects.BendPoint = function(position,value,vibrato) {
	this.position = position;
	this.value = value;
	this.vibrato = vibrato;
};
alphatab.model.effects.BendPoint.__name__ = true;
alphatab.model.effects.BendPoint.prototype = {
	getTime: function(duration) {
		return Math.floor(duration * this.position / 12);
	}
	,__class__: alphatab.model.effects.BendPoint
}
alphatab.model.effects.BendTypes = function() { }
alphatab.model.effects.BendTypes.__name__ = true;
alphatab.model.effects.FingeringType = function() { }
alphatab.model.effects.FingeringType.__name__ = true;
alphatab.model.effects.GraceEffect = function() {
	this.fret = 0;
	this.duration = 1;
	this.velocity = 95;
	this.transition = 0;
	this.isOnBeat = false;
	this.isDead = false;
};
alphatab.model.effects.GraceEffect.__name__ = true;
alphatab.model.effects.GraceEffect.prototype = {
	clone: function(factory) {
		var effect = factory.newGraceEffect();
		effect.fret = this.fret;
		effect.duration = this.duration;
		effect.velocity = this.velocity;
		effect.transition = this.transition;
		effect.isOnBeat = this.isOnBeat;
		effect.isDead = this.isDead;
		return effect;
	}
	,durationTime: function() {
		return Math.floor(alphatab.model.Duration.QUARTER_TIME / 16.00 * this.duration);
	}
	,__class__: alphatab.model.effects.GraceEffect
}
alphatab.model.effects.GraceEffectTransition = function() { }
alphatab.model.effects.GraceEffectTransition.__name__ = true;
alphatab.model.effects.HarmonicEffect = function() {
};
alphatab.model.effects.HarmonicEffect.__name__ = true;
alphatab.model.effects.HarmonicEffect.prototype = {
	clone: function(factory) {
		var effect = factory.newHarmonicEffect();
		effect.type = this.type;
		effect.data = this.data;
		return effect;
	}
	,__class__: alphatab.model.effects.HarmonicEffect
}
alphatab.model.effects.HarmonicType = function() { }
alphatab.model.effects.HarmonicType.__name__ = true;
alphatab.model.effects.TremoloPickingEffect = function(factory) {
	this.duration = factory.newDuration();
};
alphatab.model.effects.TremoloPickingEffect.__name__ = true;
alphatab.model.effects.TremoloPickingEffect.prototype = {
	clone: function(factory) {
		var effect = factory.newTremoloPickingEffect();
		effect.duration.value = this.duration.value;
		effect.duration.isDotted = this.duration.isDotted;
		effect.duration.isDoubleDotted = this.duration.isDoubleDotted;
		effect.duration.tuplet.enters = this.duration.tuplet.enters;
		effect.duration.tuplet.times = this.duration.tuplet.times;
		return effect;
	}
	,__class__: alphatab.model.effects.TremoloPickingEffect
}
alphatab.model.effects.TrillEffect = function(factory) {
	this.fret = 0;
	this.duration = factory.newDuration();
};
alphatab.model.effects.TrillEffect.__name__ = true;
alphatab.model.effects.TrillEffect.prototype = {
	clone: function(factory) {
		var effect = factory.newTrillEffect();
		effect.fret = this.fret;
		effect.duration.value = this.duration.value;
		effect.duration.isDotted = this.duration.isDotted;
		effect.duration.isDoubleDotted = this.duration.isDoubleDotted;
		effect.duration.tuplet.enters = this.duration.tuplet.enters;
		effect.duration.tuplet.times = this.duration.tuplet.times;
		return effect;
	}
	,__class__: alphatab.model.effects.TrillEffect
}
alphatab.platform = {}
alphatab.platform.Canvas = function() { }
alphatab.platform.Canvas.__name__ = true;
alphatab.platform.Canvas.prototype = {
	__class__: alphatab.platform.Canvas
}
alphatab.platform.FileLoader = function() { }
alphatab.platform.FileLoader.__name__ = true;
alphatab.platform.FileLoader.prototype = {
	__class__: alphatab.platform.FileLoader
}
alphatab.platform.PlatformFactory = function() { }
alphatab.platform.PlatformFactory.__name__ = true;
alphatab.platform.PlatformFactory.getCanvas = function(object) {
	if(object == alphatab.platform.PlatformFactory.SVG_CANVAS) return new alphatab.platform.svg.SvgCanvas(); else return new alphatab.platform.js.Html5Canvas(object);
}
alphatab.platform.PlatformFactory.getLoader = function() {
	return new alphatab.platform.js.JsFileLoader();
}
alphatab.platform.js = {}
alphatab.platform.js.Html5Canvas = function(dom) {
	this._canvas = dom;
	this._context = dom.getContext("2d");
};
alphatab.platform.js.Html5Canvas.__name__ = true;
alphatab.platform.js.Html5Canvas.__interfaces__ = [alphatab.platform.Canvas];
alphatab.platform.js.Html5Canvas.prototype = {
	measureText: function(text) {
		return this._context.measureText(text).width;
	}
	,strokeText: function(text,x,y,maxWidth) {
		if(maxWidth == null) maxWidth = 0;
		if(maxWidth == 0) this._context.strokeText(text,x,y); else this._context.strokeText(text,x,y,maxWidth);
	}
	,fillText: function(text,x,y,maxWidth) {
		if(maxWidth == null) maxWidth = 0;
		if(maxWidth == 0) this._context.fillText(text,x,y); else this._context.fillText(text,x,y,maxWidth);
	}
	,set_textAlign: function(value) {
		this._context.textAlign = value;
		return this._context.textAlign;
	}
	,get_textAlign: function() {
		return this._context.textAlign;
	}
	,set_textBaseline: function(value) {
		this._context.textBaseline = value;
		return this._context.textBaseLine;
	}
	,get_textBaseline: function() {
		return this._context.textBaseline;
	}
	,set_font: function(value) {
		this._context.font = value;
		return this._context.font;
	}
	,get_font: function() {
		return this._context.font;
	}
	,stroke: function() {
		this._context.stroke();
	}
	,fill: function() {
		this._context.fill();
	}
	,rect: function(x,y,w,h) {
		this._context.rect(x,y,w,h);
	}
	,circle: function(x,y,radius) {
		this._context.arc(x,y,radius,0,Math.PI * 2,true);
	}
	,bezierCurveTo: function(cp1x,cp1y,cp2x,cp2y,x,y) {
		this._context.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);
	}
	,quadraticCurveTo: function(cpx,cpy,x,y) {
		this._context.quadraticCurveTo(cpx,cpy,x,y);
	}
	,lineTo: function(x,y) {
		this._context.lineTo(x,y);
	}
	,moveTo: function(x,y) {
		this._context.moveTo(x,y);
	}
	,closePath: function() {
		this._context.closePath();
	}
	,beginPath: function() {
		this._context.beginPath();
	}
	,strokeRect: function(x,y,w,h) {
		this._context.strokeRect(x,y,w,h);
	}
	,fillRect: function(x,y,w,h) {
		this._context.fillRect(x,y,w,h);
	}
	,clear: function() {
		this._context.clearRect(0,0,this.get_width(),this.get_height());
	}
	,set_lineWidth: function(value) {
		this._context.lineWidth = value;
		return this._context.lineWidth;
	}
	,get_lineWidth: function() {
		return this._context.lineWidth;
	}
	,set_fillStyle: function(value) {
		this._context.fillStyle = value;
		return this._context.fillStyle;
	}
	,get_fillStyle: function() {
		return this._context.fillStyle;
	}
	,set_strokeStyle: function(value) {
		this._context.strokeStyle = value;
		return this._context.strokeStyle;
	}
	,get_strokeStyle: function() {
		return this._context.strokeStyle;
	}
	,set_height: function(height) {
		this._canvas.height = height;
		this._context = this._canvas.getContext("2d");
		return height;
	}
	,set_width: function(width) {
		this._canvas.width = width;
		this._context = this._canvas.getContext("2d");
		return width;
	}
	,get_height: function() {
		return this._canvas.offsetHeight;
	}
	,get_width: function() {
		return this._canvas.offsetWidth;
	}
	,__class__: alphatab.platform.js.Html5Canvas
}
alphatab.platform.js.JsFileLoader = function() {
};
alphatab.platform.js.JsFileLoader.__name__ = true;
alphatab.platform.js.JsFileLoader.__interfaces__ = [alphatab.platform.FileLoader];
alphatab.platform.js.JsFileLoader.isIE = function() {
	var agent = navigator.userAgent;
	return agent.indexOf("MSIE") != -1;
}
alphatab.platform.js.JsFileLoader.prototype = {
	loadBinary: function(method,file,success,error) {
		if(alphatab.platform.js.JsFileLoader.isIE()) {
			var vbArr = VbAjaxLoader(method,file);
			var fileContents = vbArr.toArray();
			var data = "";
			var i = 0;
			while(i < fileContents.length - 1) {
				data += String.fromCharCode(fileContents[i]);
				i++;
			}
			var reader = new alphatab.io.DataInputStream(new alphatab.io.StringInputStream(data));
			success(reader);
		} else {
			var xhr = new XMLHttpRequest();
			xhr.overrideMimeType("text/plain; charset=x-user-defined");
			xhr.onreadystatechange = function(d) {
				try {
					if(xhr.readyState == 4) {
						if(xhr.status == 200) {
							var reader = new alphatab.io.DataInputStream(new alphatab.io.StringInputStream(xhr.responseText));
							success(reader);
						} else if(xhr.status == 0) error("You are offline!!\n Please Check Your Network."); else if(xhr.status == 404) error("Requested URL not found."); else if(xhr.status == 500) error("Internel Server Error."); else if(xhr.statusText == "parsererror") error("Error.\nParsing JSON Request failed."); else if(xhr.statusText == "timeout") error("Request Time out."); else error("Unknow Error: " + xhr.responseText);
					}
				} catch( $e0 ) {
					if( js.Boot.__instanceof($e0,alphatab.file.FileFormatException) ) {
						var e = $e0;
						error("Error loading file: " + e.message);
					} else {
					var e = $e0;
					error("Error loading file: " + Std.string(e));
					}
				}
			};
			xhr.open(method,file,true);
			xhr.send(null);
		}
	}
	,__class__: alphatab.platform.js.JsFileLoader
}
alphatab.platform.svg = {}
alphatab.platform.svg.FontSizes = function() { }
alphatab.platform.svg.FontSizes.__name__ = true;
alphatab.platform.svg.FontSizes.measureString = function(s,f,size) {
	var data;
	var dataSize;
	if(f == alphatab.platform.svg.SupportedFonts.TimesNewRoman) {
		data = alphatab.platform.svg.FontSizes.TIMES_NEW_ROMAN_11PT;
		dataSize = 11;
	} else if(f == alphatab.platform.svg.SupportedFonts.Arial) {
		data = alphatab.platform.svg.FontSizes.ARIAL_11PT;
		dataSize = 11;
	} else {
		data = [8];
		dataSize = 11;
	}
	var stringSize = 0;
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		var code = (Math.min(data.length - 1,HxOverrides.cca(s,i)) | 0) - alphatab.platform.svg.FontSizes.CONTROL_CHARS;
		if(code >= 0) {
			var charSize = data[code];
			stringSize += data[code] * size / dataSize | 0;
		}
	}
	return stringSize;
}
alphatab.platform.svg.SupportedFonts = { __ename__ : true, __constructs__ : ["TimesNewRoman","Arial"] }
alphatab.platform.svg.SupportedFonts.TimesNewRoman = ["TimesNewRoman",0];
alphatab.platform.svg.SupportedFonts.TimesNewRoman.toString = $estr;
alphatab.platform.svg.SupportedFonts.TimesNewRoman.__enum__ = alphatab.platform.svg.SupportedFonts;
alphatab.platform.svg.SupportedFonts.Arial = ["Arial",1];
alphatab.platform.svg.SupportedFonts.Arial.toString = $estr;
alphatab.platform.svg.SupportedFonts.Arial.__enum__ = alphatab.platform.svg.SupportedFonts;
alphatab.platform.svg.SvgCanvas = function() {
	this._buffer = new StringBuf();
	this._currentPath = new StringBuf();
	this._currentPathIsEmpty = true;
	this.set_strokeStyle("#FFFFFF");
	this.set_fillStyle("#FFFFFF");
	this.set_lineWidth(1);
	this._width = 0;
	this._height = 0;
	this.set_font("10px sans-serif");
	this.set_textBaseline("alphabetic");
	this.set_textAlign("left");
};
alphatab.platform.svg.SvgCanvas.__name__ = true;
alphatab.platform.svg.SvgCanvas.__interfaces__ = [alphatab.platform.Canvas];
alphatab.platform.svg.SvgCanvas.prototype = {
	measureText: function(text) {
		var font = alphatab.platform.svg.SupportedFonts.Arial;
		if(this.get_font().indexOf("Times") >= 0) font = alphatab.platform.svg.SupportedFonts.TimesNewRoman;
		var size = "";
		var preparedFont = this.get_font();
		if(preparedFont.indexOf("bold ") == 0) preparedFont = HxOverrides.substr(preparedFont,5,null);
		if(preparedFont.indexOf("italic ") == 0) preparedFont = HxOverrides.substr(preparedFont,7,null);
		var _g1 = 0, _g = preparedFont.length;
		while(_g1 < _g) {
			var i = _g1++;
			var c = HxOverrides.cca(preparedFont,i);
			if((c < 48 || c > 57) && c != 46 && c != 32) break;
			size += preparedFont.charAt(i);
		}
		return alphatab.platform.svg.FontSizes.measureString(text,font,Std.parseFloat(size));
	}
	,getSvgBaseLine: function() {
		var _g = this.get_textBaseline();
		switch(_g) {
		case "top":
			return "top";
		case "hanging":
			return "hanging";
		case "middle":
			return "central";
		case "alphabetic":
			return "alphabetic";
		case "ideographic":
			return "ideographic";
		case "bottom":
			return "bottom";
		default:
			return "alphabetic";
		}
	}
	,getSvgTextAlignment: function() {
		var _g = this.get_textAlign();
		switch(_g) {
		case "left":
			return "start";
		case "right":
			return "end";
		case "center":
			return "middle";
		case "start":
			return "start";
		case "end":
			return "end";
		default:
			return "start";
		}
	}
	,strokeText: function(text,x,y,maxWidth) {
		if(maxWidth == null) maxWidth = 0;
		this._buffer.b += "<text x=\"";
		this._buffer.b += Std.string(x);
		this._buffer.b += "\" y=\"";
		this._buffer.b += Std.string(y);
		this._buffer.b += "\" style=\"font:";
		this._buffer.b += Std.string(this.get_font());
		this._buffer.b += "\" stroke:";
		this._buffer.b += Std.string(this.get_strokeStyle());
		this._buffer.b += "; stroke-width:";
		this._buffer.b += Std.string(this.get_lineWidth());
		this._buffer.b += ";\" ";
		if(maxWidth != 0) {
			this._buffer.b += "width=\"";
			this._buffer.b += Std.string(maxWidth);
			this._buffer.b += "\"";
		}
		this._buffer.b += " dominant-baseline=\"";
		this._buffer.b += Std.string(this.getSvgBaseLine());
		this._buffer.b += "\" text-anchor=\"";
		this._buffer.b += Std.string(this.getSvgTextAlignment());
		this._buffer.b += "\">\n";
		this._buffer.b += Std.string(text);
		this._buffer.b += "</text>\n";
	}
	,fillText: function(text,x,y,maxWidth) {
		if(maxWidth == null) maxWidth = 0;
		this._buffer.b += "<text x=\"";
		this._buffer.b += Std.string(x);
		this._buffer.b += "\" y=\"";
		this._buffer.b += Std.string(y);
		this._buffer.b += "\" style=\"font:";
		this._buffer.b += Std.string(this.get_font());
		this._buffer.b += "; fill:";
		this._buffer.b += Std.string(this.get_fillStyle());
		this._buffer.b += ";\" ";
		if(maxWidth != 0) {
			this._buffer.b += "width=\"";
			this._buffer.b += Std.string(maxWidth);
			this._buffer.b += "\"";
		}
		this._buffer.b += " dominant-baseline=\"";
		this._buffer.b += Std.string(this.getSvgBaseLine());
		this._buffer.b += "\" text-anchor=\"";
		this._buffer.b += Std.string(this.getSvgTextAlignment());
		this._buffer.b += "\">\n";
		this._buffer.b += Std.string(text);
		this._buffer.b += "</text>\n";
	}
	,set_textAlign: function(value) {
		this._textAlign = value;
		return this._textAlign;
	}
	,get_textAlign: function() {
		return this._textAlign;
	}
	,set_textBaseline: function(value) {
		this._textBaseline = value;
		return this._textBaseline;
	}
	,get_textBaseline: function() {
		return this._textBaseline;
	}
	,set_font: function(value) {
		this._font = value;
		return this._font;
	}
	,get_font: function() {
		return this._font;
	}
	,stroke: function() {
		var path = this._currentPath.b;
		if(!this._currentPathIsEmpty) {
			this._buffer.b += "<path d=\"";
			this._buffer.b += Std.string(this._currentPath.b);
			this._buffer.b += "\" style=\"stroke:";
			this._buffer.b += Std.string(this.get_strokeStyle());
			this._buffer.b += "; stroke-width:";
			this._buffer.b += Std.string(this.get_lineWidth());
			this._buffer.b += ";\" fill=\"none\" />\n";
		}
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,fill: function() {
		var path = this._currentPath.b;
		if(!this._currentPathIsEmpty) {
			this._buffer.b += "<path d=\"";
			this._buffer.b += Std.string(this._currentPath.b);
			this._buffer.b += "\" style=\"fill:";
			this._buffer.b += Std.string(this.get_fillStyle());
			this._buffer.b += "\" stroke=\"none\"/>\n";
		}
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,rect: function(x,y,w,h) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += " M";
		this._currentPath.b += Std.string(x);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
		this._currentPath.b += " L";
		this._currentPath.b += Std.string(x + w);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
		this._currentPath.b += " ";
		this._currentPath.b += Std.string(x + w);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y + h);
		this._currentPath.b += " ";
		this._currentPath.b += Std.string(x);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y + h);
		this._currentPath.b += " z";
	}
	,circle: function(x,y,radius) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += " M";
		this._currentPath.b += Std.string(x - radius);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
		this._currentPath.b += " A1,1 0 0,0 ";
		this._currentPath.b += Std.string(x + radius);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
		this._currentPath.b += " A1,1 0 0,0 ";
		this._currentPath.b += Std.string(x - radius);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
		this._currentPath.b += " z";
	}
	,bezierCurveTo: function(cp1x,cp1y,cp2x,cp2y,x,y) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += " C";
		this._currentPath.b += Std.string(cp1x);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(cp1y);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(cp2x);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(cp2y);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(x);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
	}
	,quadraticCurveTo: function(cpx,cpy,x,y) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += " Q";
		this._currentPath.b += Std.string(cpx);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(cpy);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(x);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
	}
	,lineTo: function(x,y) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += " L";
		this._currentPath.b += Std.string(x);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
	}
	,moveTo: function(x,y) {
		this._currentPath.b += " M";
		this._currentPath.b += Std.string(x);
		this._currentPath.b += ",";
		this._currentPath.b += Std.string(y);
	}
	,closePath: function() {
		this._currentPath.b += " z";
	}
	,beginPath: function() {
	}
	,strokeRect: function(x,y,w,h) {
		this._buffer.b += "<rect x=\"";
		this._buffer.b += Std.string(x);
		this._buffer.b += "\" y=\"";
		this._buffer.b += Std.string(y);
		this._buffer.b += "\" width=\"";
		this._buffer.b += Std.string(w);
		this._buffer.b += "\" height=\"";
		this._buffer.b += Std.string(h);
		this._buffer.b += "\" style=\"stroke:";
		this._buffer.b += Std.string(this.get_strokeStyle());
		this._buffer.b += "; stroke-width:";
		this._buffer.b += Std.string(this.get_lineWidth());
		this._buffer.b += ";\" />\n";
	}
	,fillRect: function(x,y,w,h) {
		this._buffer.b += "<rect x=\"";
		this._buffer.b += Std.string(x);
		this._buffer.b += "\" y=\"";
		this._buffer.b += Std.string(y);
		this._buffer.b += "\" width=\"";
		this._buffer.b += Std.string(w);
		this._buffer.b += "\" height=\"";
		this._buffer.b += Std.string(h);
		this._buffer.b += "\" style=\"fill:";
		this._buffer.b += Std.string(this.get_fillStyle());
		this._buffer.b += ";\" />\n";
	}
	,clear: function() {
		this._buffer = new StringBuf();
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,set_lineWidth: function(value) {
		this._lineWidth = value;
		return this._lineWidth;
	}
	,get_lineWidth: function() {
		return this._lineWidth;
	}
	,set_fillStyle: function(value) {
		this._fillStyle = value;
		return this._fillStyle;
	}
	,get_fillStyle: function() {
		return this._fillStyle;
	}
	,set_strokeStyle: function(value) {
		this._strokeStyle = value;
		return this._strokeStyle;
	}
	,get_strokeStyle: function() {
		return this._strokeStyle;
	}
	,set_height: function(height) {
		this._height = height;
		return this._height;
	}
	,set_width: function(width) {
		this._width = width;
		return this._width;
	}
	,get_height: function() {
		return this._height;
	}
	,get_width: function() {
		return this._width;
	}
	,toSvg: function(includeWrapper,className) {
		var out = new alphatab.io.StringOutputStream();
		this.writeTo(out,includeWrapper,className);
		out.flush();
		return out.toString();
	}
	,writeTo: function(stream,includeWrapper,className) {
		if(includeWrapper) {
			stream.writeString("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"");
			stream.writeAsString(this._width);
			stream.writeString("px\" height=\"");
			stream.writeAsString(this._height);
			stream.writeString("px\"");
			if(className != null) {
				stream.writeString(" class=\"");
				stream.writeString(className);
				stream.writeString("\"");
			}
			stream.writeString(">\n");
		}
		stream.writeString(this._buffer.b);
		if(includeWrapper) stream.writeString("</svg>");
	}
	,__class__: alphatab.platform.svg.SvgCanvas
}
alphatab.tablature = {}
alphatab.tablature.ViewLayout = function() {
	this.init(1);
	this.contentPadding = new alphatab.model.Padding(0,0,0,0);
};
alphatab.tablature.ViewLayout.__name__ = true;
alphatab.tablature.ViewLayout.prototype = {
	createStaveLine: function(track) {
		var line = new alphatab.tablature.staves.StaveLine();
		line.track = track;
		line.tablature = this.tablature;
		var staves = this.tablature.settings.get("staves");
		var _g = 0;
		while(_g < staves.length) {
			var stave = staves[_g];
			++_g;
			var staveImpl = alphatab.tablature.staves.StaveFactory.getStave(stave,line,this);
			if(staveImpl != null) line.addStave(staveImpl);
		}
		return line;
	}
	,getNoteSize: function(note) {
		var noteAsString = "";
		if(note.isTiedNote) noteAsString = "L"; else if(note.effect.deadNote) noteAsString = "X"; else noteAsString = Std.string(note.value);
		noteAsString = note.effect.ghostNote?"(" + noteAsString + ")":noteAsString;
		this.tablature.canvas.set_font(alphatab.tablature.drawing.DrawingResources.noteFont);
		var size = this.tablature.canvas.measureText(noteAsString);
		return new alphatab.model.Point(size,alphatab.tablature.drawing.DrawingResources.noteFontHeight);
	}
	,getOrientation: function(x,y,str) {
		this.tablature.canvas.set_font(alphatab.tablature.drawing.DrawingResources.noteFont);
		var size = this.tablature.canvas.measureText(str);
		return new alphatab.model.Rectangle(x,y,size,alphatab.tablature.drawing.DrawingResources.noteFontHeight);
	}
	,getNoteOrientation: function(x,y,note) {
		var noteAsString = "";
		if(note.isTiedNote) noteAsString = "L"; else if(note.effect.deadNote) noteAsString = "X"; else noteAsString = Std.string(note.value);
		noteAsString = note.effect.ghostNote?"(" + noteAsString + ")":noteAsString;
		return this.getOrientation(x,y,noteAsString);
	}
	,getVoiceWidth: function(voice) {
		var duration = voice.duration;
		if(duration != null) switch(duration.value) {
		case alphatab.model.Duration.WHOLE:
			return 91.0 * this.scale;
		case alphatab.model.Duration.HALF:
			return 65.0 * this.scale;
		case alphatab.model.Duration.QUARTER:
			return 45.0 * this.scale;
		case alphatab.model.Duration.EIGHTH:
			return 33.0 * this.scale;
		case alphatab.model.Duration.SIXTEENTH:
			return 23.0 * this.scale;
		case alphatab.model.Duration.THIRTY_SECOND:
			return 23.0 * this.scale;
		case alphatab.model.Duration.SIXTY_FOURTH:
			return 23.0 * this.scale;
		}
		return 20.0 * this.scale;
	}
	,prepareLayout: function(clientArea,x,y) {
	}
	,paintSong: function(ctx,clientArea,x,y) {
	}
	,updateCache: function(graphics,area,fromX,fromY) {
		this._cache = new alphatab.tablature.drawing.DrawingContext(this.scale);
		this._cache.graphics = graphics;
		this.paintSong(this._cache,area,fromX,fromY);
		this.paintCache(graphics,area,fromX,fromY);
	}
	,paintCache: function(graphics,area,fromX,fromY) {
		if(this._cache == null) {
			this.updateCache(graphics,area,fromX,fromY);
			return;
		}
		this._cache.draw();
	}
	,init: function(scale) {
		this.stringSpacing = 10 * scale;
		this.scoreLineSpacing = 8 * scale;
		this.scale = scale;
		this.firstMeasureSpacing = Math.round(10 * scale);
		this.effectSpacing = Math.round(15 * scale);
	}
	,setTablature: function(tablature) {
		this.tablature = tablature;
	}
	,getLines: function() {
		return null;
	}
	,getBeatAtLine: function(line,xPos,yPos) {
		var target = null;
		var startIndex = 0;
		var endIndex = line.measures.length;
		var measure = null;
		do {
			var midIndex = (startIndex + endIndex) / 2 | 0;
			var current = this.tablature.track.measures[line.measures[midIndex]];
			var left = current.x;
			var right = left + current.width + current.spacing;
			if(xPos >= left && xPos <= right) measure = current; else if(xPos > right) startIndex = midIndex + 1; else if(xPos < left) endIndex = midIndex - 1;
		} while(!(measure != null || startIndex > endIndex));
		if(measure == null) return null;
		var currentBeat = null;
		var _g = 0, _g1 = measure.beats;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			var beatDrawing = b;
			var beatX = beatDrawing.fullX();
			var beatW = beatDrawing.fullWidth();
			if(xPos > beatDrawing.fullX() || currentBeat == null) currentBeat = beatDrawing; else break;
		}
		return currentBeat;
	}
	,getBeatAt: function(xPos,yPos) {
		return null;
	}
	,__class__: alphatab.tablature.ViewLayout
}
alphatab.tablature.PageViewLayout = function() {
	alphatab.tablature.ViewLayout.call(this);
	this._lines = new Array();
	this._maximumWidth = 0;
	this.contentPadding = alphatab.tablature.PageViewLayout.PAGE_PADDING;
};
alphatab.tablature.PageViewLayout.__name__ = true;
alphatab.tablature.PageViewLayout.__super__ = alphatab.tablature.ViewLayout;
alphatab.tablature.PageViewLayout.prototype = $extend(alphatab.tablature.ViewLayout.prototype,{
	parsePageSetupString: function(input) {
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
	,paintSongInfo: function(ctx,clientArea,x,y) {
		if(this.tablature.getLayoutSetting("hideSongInfo",false)) return y;
		var yOffset = 19;
		var song = this.tablature.track.song;
		x += this.contentPadding.left;
		y += yOffset;
		var tX;
		var size;
		var str = "";
		if(song.title != "" && (song.pageSetup.headerAndFooter & 1) != 0) {
			str = this.parsePageSetupString(song.pageSetup.title);
			ctx.graphics.set_font(alphatab.tablature.drawing.DrawingResources.titleFont);
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.titleFont,tX,y);
			y += Math.floor(35 * this.scale);
		}
		if(song.subtitle != "" && (song.pageSetup.headerAndFooter & 2) != 0) {
			str = this.parsePageSetupString(song.pageSetup.subtitle);
			ctx.graphics.set_font(alphatab.tablature.drawing.DrawingResources.subtitleFont);
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y);
			y += Math.floor(20 * this.scale);
		}
		if(song.artist != "" && (song.pageSetup.headerAndFooter & 4) != 0) {
			str = this.parsePageSetupString(song.pageSetup.artist);
			ctx.graphics.set_font(alphatab.tablature.drawing.DrawingResources.subtitleFont);
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y);
			y += Math.floor(20 * this.scale);
		}
		if(song.album != "" && (song.pageSetup.headerAndFooter & 8) != 0) {
			str = this.parsePageSetupString(song.pageSetup.album);
			ctx.graphics.set_font(alphatab.tablature.drawing.DrawingResources.subtitleFont);
			size = ctx.graphics.measureText(str);
			tX = (clientArea.width - size) / 2;
			ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.subtitleFont,tX,y);
			y += Math.floor(20 * this.scale);
		}
		if(song.music != "" && song.music == song.words && (song.pageSetup.headerAndFooter & 64) != 0) {
			str = this.parsePageSetupString(song.pageSetup.wordsAndMusic);
			ctx.graphics.set_font(alphatab.tablature.drawing.DrawingResources.wordsFont);
			size = ctx.graphics.measureText(str);
			tX = clientArea.width - size - this.contentPadding.right;
			ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.wordsFont,x,y);
			y += Math.floor(20 * this.scale);
		} else {
			if(song.music != "" && (song.pageSetup.headerAndFooter & 32) != 0) {
				str = this.parsePageSetupString(song.pageSetup.music);
				ctx.graphics.set_font(alphatab.tablature.drawing.DrawingResources.wordsFont);
				size = ctx.graphics.measureText(str);
				tX = clientArea.width - size - this.contentPadding.right;
				ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.wordsFont,tX,y);
			}
			if(song.words != "" && (song.pageSetup.headerAndFooter & 16) != 0) {
				str = this.parsePageSetupString(song.pageSetup.words);
				ctx.graphics.set_font(alphatab.tablature.drawing.DrawingResources.wordsFont);
				ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.wordsFont,x,y);
			}
			y += Math.floor(20 * this.scale);
		}
		y += Math.floor(20 * this.scale);
		if(!this.tablature.track.isPercussionTrack) {
			var tuning = alphatab.model.Tuning.findTuning(this.tablature.track.strings);
			if(tuning != null) {
				ctx.get(1).addString(tuning.name,alphatab.tablature.drawing.DrawingResources.effectFont,x,y);
				y += Math.floor(15 * this.scale);
				if(!tuning.isStandard) {
					var stringsPerColumn = Math.ceil(this.tablature.track.strings.length / 2);
					var currentX = x;
					var currentY = y;
					var _g1 = 0, _g = this.tablature.track.strings.length;
					while(_g1 < _g) {
						var i = _g1++;
						str = "(" + Std.string(i + 1) + ") = " + alphatab.model.Tuning.getTextForTuning(this.tablature.track.strings[i].value,false);
						ctx.get(1).addString(str,alphatab.tablature.drawing.DrawingResources.effectFont,currentX,currentY);
						currentY += Math.floor(15 * this.scale);
						if(i == stringsPerColumn - 1) {
							currentY = y;
							currentX += Math.floor(43 * this.scale);
						}
					}
					y += stringsPerColumn * Math.floor(15 * this.scale);
				}
			}
		}
		y += Math.floor(25 * this.scale);
		y -= yOffset;
		return y;
	}
	,paintSong: function(ctx,clientArea,x,y) {
		var track = this.tablature.track;
		y = y + this.contentPadding.top | 0;
		y = this.paintSongInfo(ctx,clientArea,x,y) + this.firstMeasureSpacing | 0;
		var _g1 = 0, _g = this._lines.length;
		while(_g1 < _g) {
			var l = _g1++;
			var line = this._lines[l];
			line.paint(this,track,ctx);
		}
	}
	,layoutSongInfo: function(x,y) {
		if(this.tablature.getLayoutSetting("hideSongInfo",false)) return y;
		var song = this.tablature.track.song;
		if(song.title != "" && (song.pageSetup.headerAndFooter & 1) != 0) y += Math.floor(35 * this.scale);
		if(song.subtitle != "" && (song.pageSetup.headerAndFooter & 2) != 0) y += Math.floor(20 * this.scale);
		if(song.artist != "" && (song.pageSetup.headerAndFooter & 4) != 0) y += Math.floor(20 * this.scale);
		if(song.album != "" && (song.pageSetup.headerAndFooter & 8) != 0) y += Math.floor(20 * this.scale);
		if(song.music != "" && song.music == song.words && (song.pageSetup.headerAndFooter & 64) != 0) y += Math.floor(20 * this.scale); else {
			if(song.music != "" && (song.pageSetup.headerAndFooter & 32) != 0) y += Math.floor(20 * this.scale);
			if(song.words != "" && (song.pageSetup.headerAndFooter & 16) != 0) y += Math.floor(20 * this.scale);
		}
		y += Math.floor(20 * this.scale);
		if(!this.tablature.track.isPercussionTrack) {
			var tuning = alphatab.model.Tuning.findTuning(this.tablature.track.strings);
			if(tuning != null) {
				y += Math.floor(15 * this.scale);
				if(!tuning.isStandard) {
					var stringsPerColumn = Math.ceil(this.tablature.track.strings.length / 2);
					y += stringsPerColumn * Math.floor(15 * this.scale);
				}
				y += Math.floor(15 * this.scale);
			}
		}
		y += Math.floor(40 * this.scale);
		return y;
	}
	,fitLine: function(track,line) {
		var measureSpace = 0;
		if(line.fullLine) {
			var freeSpace = this.getMaxWidth() - line.width;
			if(freeSpace != 0 && line.measures.length > 0) measureSpace = Math.round(freeSpace / line.measures.length);
		}
		var measureX = 0;
		var _g1 = 0, _g = line.measures.length;
		while(_g1 < _g) {
			var i = _g1++;
			var index = line.measures[i];
			var measure = track.measures[index];
			measure.setSpacing(measureSpace);
			measure.x = measureX;
			measureX += measure.width + measureSpace;
		}
		line.width = measureX;
		this.width = Math.round(Math.max(this.width,measureX));
	}
	,getStaveLine: function(track,startIndex,endIndex,y,x) {
		var line = this.createStaveLine(track);
		line.y = y;
		line.x = x;
		line.spacing.set(0,Math.floor(10 * this.scale));
		line.spacing.set(1,Math.floor(10 * this.scale));
		var measuresPerLine = this.tablature.getLayoutSetting("measuresPerLine",-1);
		var measureCount = endIndex + 1;
		x = 0;
		var _g = startIndex;
		while(_g < measureCount) {
			var i = _g++;
			var measure = track.measures[i];
			measure.staveLine = line;
			measure.performLayout(this);
			var lineIsFull = false;
			if(measuresPerLine == -1 && (x + measure.width >= this.getMaxWidth() && line.measures.length != 0)) lineIsFull = true; else if(line.measures.length == measuresPerLine) lineIsFull = true;
			if(lineIsFull) {
				line.fullLine = true;
				line.width = x;
				return line;
			}
			measure.x = x;
			x += measure.width;
			var _g1 = 0, _g2 = line.staves;
			while(_g1 < _g2.length) {
				var stave = _g2[_g1];
				++_g1;
				stave.prepare(measure);
			}
			line.addMeasure(i);
		}
		line.width = x;
		return line;
	}
	,prepareLayout: function(clientArea,x,y) {
		this._lines = new Array();
		this._maximumWidth = Math.floor(clientArea.width);
		this.width = 0;
		this.height = 0;
		var posY = y;
		var startIndex = this.tablature.getLayoutSetting("startMeasure",-1);
		startIndex--;
		startIndex = Math.min(this.tablature.track.measureCount() - 1,Math.max(0,startIndex)) | 0;
		var endIndex = this.tablature.getLayoutSetting("measureCount",this.tablature.track.measures.length);
		endIndex = startIndex + endIndex - 1;
		endIndex = Math.min(this.tablature.track.measureCount() - 1,Math.max(0,endIndex)) | 0;
		var track = this.tablature.track;
		var nextMeasureIndex = startIndex;
		x += this.contentPadding.left;
		posY = Math.floor(this.layoutSongInfo(x,posY) + this.firstMeasureSpacing);
		while(endIndex >= nextMeasureIndex) {
			var line = this.getStaveLine(track,nextMeasureIndex,endIndex,posY,x);
			line.index = this._lines.length;
			this._lines.push(line);
			this.fitLine(track,line);
			posY += line.getHeight();
			nextMeasureIndex = line.lastIndex() + 1;
		}
		this.height = posY + this.contentPadding.bottom;
		this.width = this.getSheetWidth();
	}
	,init: function(scale) {
		alphatab.tablature.ViewLayout.prototype.init.call(this,scale);
		this.layoutSize = new alphatab.model.Point(this.getSheetWidth() - alphatab.tablature.PageViewLayout.PAGE_PADDING.getHorizontal(),this.height);
	}
	,getSheetWidth: function() {
		return Math.round(795 * this.scale);
	}
	,getMaxWidth: function() {
		if(this._maximumWidth <= 0) this._maximumWidth = this.tablature.canvas.get_width();
		return this._maximumWidth - this.contentPadding.getHorizontal();
	}
	,getBeatAt: function(xPos,yPos) {
		var target = null;
		var startIndex = 0;
		var endIndex = this._lines.length;
		var line = null;
		do {
			var midIndex = (startIndex + endIndex) / 2 | 0;
			var current = this._lines[midIndex];
			var top = current.y;
			var bottom = top + current.getHeight();
			if(yPos >= top && yPos <= bottom) line = current; else if(yPos > bottom) startIndex = midIndex + 1; else if(yPos < top) endIndex = midIndex - 1;
		} while(!(line != null || startIndex > endIndex));
		if(line == null) return null;
		return this.getBeatAtLine(line,xPos,yPos);
	}
	,getLines: function() {
		return this._lines;
	}
	,__class__: alphatab.tablature.PageViewLayout
});
alphatab.tablature.HorizontalViewLayout = function() {
	alphatab.tablature.ViewLayout.call(this);
	this.contentPadding = alphatab.tablature.HorizontalViewLayout.PAGE_PADDING;
};
alphatab.tablature.HorizontalViewLayout.__name__ = true;
alphatab.tablature.HorizontalViewLayout.__super__ = alphatab.tablature.ViewLayout;
alphatab.tablature.HorizontalViewLayout.prototype = $extend(alphatab.tablature.ViewLayout.prototype,{
	paintSong: function(ctx,clientArea,x,y) {
		var track = this.tablature.track;
		y = Math.floor(y + this.contentPadding.top + this.firstMeasureSpacing);
		this._line.paint(this,track,ctx);
	}
	,getStaveLine: function(track,startIndex,y,x) {
		var line = this.createStaveLine(track);
		line.y = y;
		line.x = x;
		line.spacing.set(0,Math.floor(10 * this.scale));
		line.spacing.set(1,Math.floor(10 * this.scale));
		var measureCount = track.measureCount();
		x = 0;
		var _g = startIndex;
		while(_g < measureCount) {
			var i = _g++;
			var measure = track.measures[i];
			measure.staveLine = line;
			measure.performLayout(this);
			measure.x = x;
			x += measure.width;
			var _g1 = 0, _g2 = line.staves;
			while(_g1 < _g2.length) {
				var stave = _g2[_g1];
				++_g1;
				stave.prepare(measure);
			}
			line.addMeasure(i);
		}
		line.width = x;
		return line;
	}
	,prepareLayout: function(clientArea,x,y) {
		this.width = 0;
		this.height = 0;
		var posY = y;
		var track = this.tablature.track;
		var measureCount = this.tablature.track.measures.length;
		var nextMeasureIndex = 0;
		x += this.contentPadding.left;
		posY = Math.floor(posY + this.firstMeasureSpacing);
		while(measureCount > nextMeasureIndex) {
			this._line = this.getStaveLine(track,nextMeasureIndex,posY,x);
			posY += this._line.getHeight();
			nextMeasureIndex = this._line.lastIndex() + 1;
		}
		this.height = posY + this.contentPadding.bottom;
		this.width = this._line.width + alphatab.tablature.HorizontalViewLayout.PAGE_PADDING.getHorizontal();
		this.layoutSize = new alphatab.model.Point(this.width,this.height);
	}
	,getBeatAt: function(xPos,yPos) {
		xPos -= alphatab.tablature.HorizontalViewLayout.PAGE_PADDING.left;
		return this.getBeatAtLine(this._line,xPos,yPos);
	}
	,getLines: function() {
		return [this._line];
	}
	,init: function(scale) {
		alphatab.tablature.ViewLayout.prototype.init.call(this,scale);
		this.layoutSize = new alphatab.model.Point(this.width,this.height);
	}
	,__class__: alphatab.tablature.HorizontalViewLayout
});
alphatab.tablature.Tablature = function(source,staves,msg) {
	if(msg == null) msg = "";
	this.canvas = alphatab.platform.PlatformFactory.getCanvas(source);
	this.track = null;
	this.settings = new haxe.ds.StringMap();
	this.errorMessage = StringTools.trim(msg);
	this.autoSizeWidth = true;
	if(this.errorMessage == "" || this.errorMessage == null) this.errorMessage = "Please set a song's track to display the tablature";
	if(staves == null) {
		staves = new Array();
		staves.push("score");
		staves.push("tablature");
	}
	this.settings.set("staves",staves);
	this.setViewLayoutByKey(alphatab.tablature.Tablature.DEFAULT_LAYOUT);
};
alphatab.tablature.Tablature.__name__ = true;
alphatab.tablature.Tablature.prototype = {
	findBeat: function(measurePosition,playerPosition,measure) {
		if(measure != null) {
			var _g = 0, _g1 = measure.beats;
			while(_g < _g1.length) {
				var beat = _g1[_g];
				++_g;
				var realBeat = measurePosition + (beat.start - measure.header.start);
				var voice = beat.voices[0];
				if(!voice.isEmpty && realBeat <= playerPosition && realBeat + voice.duration.time() > playerPosition) return beat;
			}
			return alphatab.model.SongManager.getFirstBeat(measure.beats);
		}
		return null;
	}
	,getMeasureAt: function(tick) {
		var start = alphatab.model.Duration.QUARTER_TIME;
		var result = { measure : null, realPosition : start};
		var song = this.track.song;
		var controller = new alphatab.midi.MidiRepeatController(song);
		if(this._selectedBeat != null && tick > this.lastPosition) {
			controller.index = this._selectedBeat.measure.header.number - 1;
			start = this._lastRealPosition;
		}
		while(!controller.finished()) {
			var header = song.measureHeaders[controller.index];
			controller.process();
			if(controller.shouldPlay) {
				var length = header.length();
				if(tick >= start && tick < start + length) {
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
	,findMeasure: function(position) {
		var result = this.getMeasureAt(position);
		if(result.measure == null) result.measure = alphatab.model.SongManager.getFirstMeasure(this.track);
		return result;
	}
	,notifyTickPosition: function(position,forced,scroll) {
		position -= alphatab.model.Duration.QUARTER_TIME;
		if(forced || position != this.lastPosition) {
			this.lastPosition = position;
			var result = this.findMeasure(position);
			var realPosition = result.realPosition;
			this._lastRealPosition = realPosition;
			var measure = result.measure;
			var beat = this.findBeat(realPosition,position,measure);
			if(measure != null && beat != null) {
				this._selectedBeat = beat;
				if(this.onCaretChanged != null) this.onCaretChanged(beat,scroll);
			}
		}
	}
	,invalidate: function() {
		this.canvas.clear();
		this.onPaint();
	}
	,paintBackground: function() {
		var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
		this.canvas.set_fillStyle("#4e4e4e");
		this.canvas.set_font(alphatab.tablature.drawing.DrawingResources.copyrightFont);
		this.canvas.set_textBaseline("top");
		var x = (this.canvas.get_width() - this.canvas.measureText(msg)) / 2;
		this.canvas.fillText(msg,x,this.canvas.get_height() - 15);
	}
	,updateTablature: function() {
		if(this.track == null) return;
		this.doLayout();
		this._updateSong = false;
	}
	,onPaint: function() {
		this.paintBackground();
		if(this.track == null || this.isError) {
			var text = this.errorMessage;
			this.canvas.set_fillStyle("#4e4e4e");
			this.canvas.set_font(alphatab.tablature.drawing.DrawingResources.timeSignatureFont);
			this.canvas.set_textBaseline("middle");
			this.canvas.fillText(text,20,30);
		} else if(this._updateDisplay) {
			var displayRect = new alphatab.model.Rectangle(0,0,this.canvas.get_width(),this.canvas.get_height());
			this.viewLayout.updateCache(this.canvas,displayRect,0,0);
			this._updateDisplay = false;
		} else {
			var displayRect = new alphatab.model.Rectangle(0,0,this.canvas.get_width(),this.canvas.get_height());
			this.viewLayout.paintCache(this.canvas,displayRect,0,0);
			this._updateDisplay = false;
		}
		if(this.onFinished != null) this.onFinished();
	}
	,doLayout: function() {
		if(this.track == null) return;
		var size = this.viewLayout.layoutSize;
		if(!this.autoSizeWidth) size.x = this.canvas.get_width() - this.viewLayout.contentPadding.getHorizontal();
		this.viewLayout.prepareLayout(new alphatab.model.Rectangle(0,0,size.x,size.y),0,0);
		if(this.autoSizeWidth) this.canvas.set_width(this.viewLayout.width);
		this.canvas.set_height(this.viewLayout.height);
		if(this.onLayouted != null) this.onLayouted();
	}
	,updateScale: function(scale) {
		alphatab.tablature.drawing.DrawingResources.init(scale);
		this.viewLayout.init(scale);
		this._updateSong = true;
		this._updateDisplay = true;
		this.updateTablature();
		this.invalidate();
	}
	,setTrack: function(track) {
		this.track = track;
		this._updateSong = true;
		this._updateDisplay = true;
		this.updateTablature();
		this.invalidate();
	}
	,getLayoutSetting: function(setting,defaultValue) {
		var value = this.settings.get("layout." + setting);
		return value != null?value:defaultValue;
	}
	,setLayoutSetting: function(setting,value) {
		this.settings.set("layout." + setting,value);
	}
	,getStaveSetting: function(staveId,setting,defaultValue) {
		var value = this.settings.get(staveId + "." + setting);
		return value != null?value:defaultValue;
	}
	,setStaveSetting: function(staveId,setting,value) {
		this.settings.set(staveId + "." + setting,value);
	}
	,setViewLayoutByKey: function(layout) {
		if(layout == "horizontal") this.viewLayout = new alphatab.tablature.HorizontalViewLayout(); else if(layout == "page") this.viewLayout = new alphatab.tablature.PageViewLayout(); else this.viewLayout = new alphatab.tablature.PageViewLayout();
		this.viewLayout.setTablature(this);
		this.updateScale(1.0);
	}
	,__class__: alphatab.tablature.Tablature
}
alphatab.tablature.drawing = {}
alphatab.tablature.drawing.ClefPainter = function() { }
alphatab.tablature.drawing.ClefPainter.__name__ = true;
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
alphatab.tablature.drawing.DrawingContext = function(scale) {
	this.layers = new Array();
	this.layers[0] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(205,205,205),true,0);
	this.layers[1] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(34,34,17),true,0);
	this.layers[2] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(165,165,165),false,1);
	this.layers[3] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(34,34,17),true,0);
	this.layers[4] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(34,34,17),false,scale);
	this.layers[5] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(150,150,150),true,1);
	this.layers[6] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(150,150,150),true,0);
	this.layers[7] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(150,150,150),false,scale);
	this.layers[8] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(150,150,150),false,scale);
	this.layers[9] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(34,34,17),true,1);
	this.layers[10] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(34,34,17),true,0);
	this.layers[11] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(34,34,17),false,scale);
	this.layers[12] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(34,34,17),false,scale);
	this.layers[13] = new alphatab.tablature.drawing.DrawingLayer(alphatab.model.Color.fromRgb(255,0,0),true,0);
};
alphatab.tablature.drawing.DrawingContext.__name__ = true;
alphatab.tablature.drawing.DrawingContext.prototype = {
	get: function(layer) {
		return this.layers[layer];
	}
	,clear: function() {
		var _g1 = 0, _g = this.layers.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.layers[i].clear();
		}
	}
	,draw: function() {
		var _g1 = 0, _g = this.layers.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.layers[i].draw(this.graphics);
		}
	}
	,__class__: alphatab.tablature.drawing.DrawingContext
}
alphatab.tablature.drawing.DrawingLayer = function(color,isFilled,penWidth) {
	this._path = new Array();
	this._defaultColor = color;
	this._isFilled = isFilled;
	this._penWidth = penWidth;
	this._currentPosition = new alphatab.model.Point(0,0);
};
alphatab.tablature.drawing.DrawingLayer.__name__ = true;
alphatab.tablature.drawing.DrawingLayer.prototype = {
	finish: function(graphics) {
		if(this._isFilled) graphics.fill(); else graphics.stroke();
	}
	,clear: function() {
		this._path = new Array();
	}
	,resetColor: function() {
		this._path.push({ Command : "setColor", Color : this._defaultColor});
	}
	,setColor: function(color) {
		this._path.push({ Command : "setColor", Color : color});
	}
	,addRect: function(x,y,w,h) {
		this._path.push({ Command : "addRect", X : x, Y : y, Width : w, Height : h});
	}
	,addCircle: function(x,y,diameter) {
		this._path.push({ Command : "addCircle", X : x, Y : y, Radius : diameter / 2});
	}
	,addBezier: function(x1,y1,x2,y2,x3,y3,x4,y4) {
		this._path.push({ Command : "addBezier", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3, X4 : x4, Y4 : y4});
	}
	,addPolygon: function(points) {
		this._path.push({ Command : "addPolygon", Points : points});
	}
	,addDashedLine: function(x1,y1,x2,y2) {
		var dashLen = 5;
		var dX = x2 - x1;
		var dY = y2 - y1;
		var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
		var dashX = dX / dashes;
		var dashY = dY / dashes;
		var isRight = x2 > x1;
		var isDown = y2 > y1;
		var q = 0;
		while(q++ < dashes) {
			var endX = 0;
			var endY = 0;
			if(isRight) endX = Math.min(x1 + dashX,x2); else endX = Math.max(x1 + dashX,x2);
			if(isDown) endY = Math.min(y1 + dashY,y2); else endY = Math.max(y1 + dashY,y2);
			if(q % 2 == 0) this.addLine(x1,y1,endX,endY);
			x1 = endX;
			y1 = endY;
		}
	}
	,addLine: function(x1,y1,x2,y2) {
		this.startFigure();
		this.moveTo(x1,y1);
		this.lineTo(x2,y2);
	}
	,addMusicSymbol: function(symbol,x,y,xScale,yScale) {
		if(yScale == null) yScale = 0;
		if(yScale == 0) yScale = xScale;
		var painter = new alphatab.tablature.drawing.SvgPainter(this,symbol,x,y,xScale,yScale);
		painter.paint();
	}
	,addString: function(str,font,x,y) {
		this._path.push({ Command : "addString", Text : str, Font : font, X : x + 0.5, Y : y + 0.5});
	}
	,lineTo: function(x,y) {
		this._path.push({ Command : "lineTo", X : x + 0.5, Y : y + 0.5});
	}
	,quadraticCurveTo: function(x1,y1,x2,y2) {
		this._path.push({ Command : "quadraticCurveTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2});
	}
	,bezierTo: function(x1,y1,x2,y2,x3,y3) {
		this._path.push({ Command : "bezierTo", X1 : x1, Y1 : y1, X2 : x2, Y2 : y2, X3 : x3, Y3 : y3});
	}
	,moveTo: function(x,y) {
		this._path.push({ Command : "moveTo", X : Math.round(x) + 0.5, Y : Math.round(y) + 0.5});
	}
	,closeFigure: function() {
		this._path.push({ Command : "closeFigure"});
	}
	,startFigure: function() {
		this._path.push({ Command : "startFigure"});
	}
	,draw: function(graphics) {
		graphics.set_textAlign("left");
		graphics.set_textBaseline("middle");
		graphics.set_fillStyle(this._defaultColor.asRgbString());
		graphics.set_strokeStyle(this._defaultColor.asRgbString());
		graphics.set_lineWidth(this._penWidth);
		graphics.beginPath();
		var _g = 0, _g1 = this._path;
		while(_g < _g1.length) {
			var elm = _g1[_g];
			++_g;
			try {
				switch(elm.Command) {
				case "setColor":
					var col = elm.Color.asRgbString();
					graphics.set_fillStyle(col);
					graphics.set_strokeStyle(col);
					break;
				case "startFigure":
					this.finish(graphics);
					graphics.beginPath();
					break;
				case "closeFigure":
					graphics.closePath();
					break;
				case "moveTo":
					graphics.moveTo(elm.X,elm.Y);
					this._currentPosition.x = elm.X;
					this._currentPosition.y = elm.Y;
					break;
				case "lineTo":
					graphics.lineTo(elm.X,elm.Y);
					this._currentPosition.x = elm.X;
					this._currentPosition.y = elm.Y;
					break;
				case "bezierTo":
					graphics.bezierCurveTo(elm.X1,elm.Y1,elm.X2,elm.Y2,elm.X3,elm.Y3);
					this._currentPosition.x = elm.X3;
					this._currentPosition.y = elm.Y3;
					break;
				case "quadraticCurveTo":
					graphics.quadraticCurveTo(elm.X1,elm.Y1,elm.X2,elm.Y2);
					this._currentPosition.x = elm.X2;
					this._currentPosition.y = elm.Y2;
					break;
				case "addString":
					graphics.set_font(elm.Font);
					graphics.fillText(elm.Text,elm.X,elm.Y);
					break;
				case "addLine":
					graphics.moveTo(elm.X1,elm.Y1);
					graphics.lineTo(elm.X2,elm.Y2);
					break;
				case "addPolygon":
					this.finish(graphics);
					graphics.beginPath();
					graphics.moveTo(elm.Points[0].x,elm.Points[0].y);
					var pts = elm.Points;
					var _g2 = 0;
					while(_g2 < pts.length) {
						var pt = pts[_g2];
						++_g2;
						graphics.lineTo(pt.x,pt.y);
					}
					graphics.closePath();
					this.finish(graphics);
					graphics.beginPath();
					break;
				case "addBezier":
					graphics.moveTo(elm.X1,elm.Y1);
					graphics.bezierCurveTo(elm.X2,elm.Y2,elm.X3,elm.Y3,elm.X4,elm.Y4);
					break;
				case "addCircle":
					this.finish(graphics);
					graphics.beginPath();
					var x = elm.X;
					var y = elm.Y;
					var radius = elm.Radius;
					graphics.circle(x + radius,y + radius,radius);
					graphics.closePath();
					break;
				case "addRect":
					graphics.rect(elm.X,elm.Y,elm.Width,elm.Height);
					break;
				}
			} catch( err ) {
				if( js.Boot.__instanceof(err,String) ) {
					throw err;
				} else throw(err);
			}
		}
		this.finish(graphics);
	}
	,__class__: alphatab.tablature.drawing.DrawingLayer
}
alphatab.tablature.drawing.DrawingLayers = function() { }
alphatab.tablature.drawing.DrawingLayers.__name__ = true;
alphatab.tablature.drawing.DrawingResources = function() { }
alphatab.tablature.drawing.DrawingResources.__name__ = true;
alphatab.tablature.drawing.DrawingResources.init = function(scale) {
	var sansFont = "'Arial'";
	var serifFont = "'Times New Roman'";
	alphatab.tablature.drawing.DrawingResources.defaultFontHeight = Math.round(9 * scale);
	alphatab.tablature.drawing.DrawingResources.defaultFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(alphatab.tablature.drawing.DrawingResources.defaultFontHeight) + " " + sansFont;
	alphatab.tablature.drawing.DrawingResources.chordFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(9 * scale) + " " + sansFont;
	alphatab.tablature.drawing.DrawingResources.timeSignatureFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(20 * scale) + " " + sansFont;
	alphatab.tablature.drawing.DrawingResources.clefFontHeight = Math.round(16 * scale);
	alphatab.tablature.drawing.DrawingResources.clefFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(alphatab.tablature.drawing.DrawingResources.clefFontHeight) + " " + serifFont;
	alphatab.tablature.drawing.DrawingResources.musicFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(13 * scale) + " " + sansFont;
	alphatab.tablature.drawing.DrawingResources.tempoFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(11 * scale) + " " + sansFont;
	alphatab.tablature.drawing.DrawingResources.graceFontHeight = Math.round(9 * scale);
	alphatab.tablature.drawing.DrawingResources.graceFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(alphatab.tablature.drawing.DrawingResources.graceFontHeight) + " " + sansFont;
	alphatab.tablature.drawing.DrawingResources.noteFontHeight = Math.round(11 * scale);
	alphatab.tablature.drawing.DrawingResources.noteFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(alphatab.tablature.drawing.DrawingResources.noteFontHeight) + " " + sansFont;
	alphatab.tablature.drawing.DrawingResources.effectFontHeight = Math.round(11 * scale);
	alphatab.tablature.drawing.DrawingResources.effectFont = "italic " + alphatab.tablature.drawing.DrawingResources.formatFontSize(alphatab.tablature.drawing.DrawingResources.effectFontHeight) + " " + serifFont;
	alphatab.tablature.drawing.DrawingResources.titleFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(30 * scale) + " " + serifFont;
	alphatab.tablature.drawing.DrawingResources.subtitleFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(19 * scale) + " " + serifFont;
	alphatab.tablature.drawing.DrawingResources.wordsFont = alphatab.tablature.drawing.DrawingResources.formatFontSize(13 * scale) + " " + serifFont;
	alphatab.tablature.drawing.DrawingResources.copyrightFont = "bold " + alphatab.tablature.drawing.DrawingResources.formatFontSize(11 * scale) + " " + sansFont;
}
alphatab.tablature.drawing.DrawingResources.formatFontSize = function(size) {
	var num = size;
	num = num * Math.pow(10,2);
	num = Math.round(num) / Math.pow(10,2);
	return Std.string(num) + "px";
}
alphatab.tablature.drawing.DrawingResources.getScoreNoteSize = function(layout,full) {
	var scale = (full?layout.scoreLineSpacing + 1:layout.scoreLineSpacing) - 2;
	return new alphatab.model.Point(Math.round(scale * 1.3),Math.round(scale));
}
alphatab.tablature.drawing.KeySignaturePainter = function() { }
alphatab.tablature.drawing.KeySignaturePainter.__name__ = true;
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
alphatab.tablature.drawing.MusicFont = function() { }
alphatab.tablature.drawing.MusicFont.__name__ = true;
alphatab.tablature.drawing.NotePainter = function() { }
alphatab.tablature.drawing.NotePainter.__name__ = true;
alphatab.tablature.drawing.NotePainter.paintFooter = function(layer,x,y,dur,dir,layout) {
	var scale = layout.scale;
	if(dir == -1) x += alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x;
	var s = "";
	switch(dur) {
	case alphatab.model.Duration.SIXTY_FOURTH:
		s = dir == -1?alphatab.tablature.drawing.MusicFont.FooterUpSixtyFourth:alphatab.tablature.drawing.MusicFont.FooterDownSixtyFourth;
		break;
	case alphatab.model.Duration.THIRTY_SECOND:
		s = dir == -1?alphatab.tablature.drawing.MusicFont.FooterUpThirtySecond:alphatab.tablature.drawing.MusicFont.FooterDownThirtySecond;
		break;
	case alphatab.model.Duration.SIXTEENTH:
		s = dir == -1?alphatab.tablature.drawing.MusicFont.FooterUpSixteenth:alphatab.tablature.drawing.MusicFont.FooterDownSixteenth;
		break;
	case alphatab.model.Duration.EIGHTH:
		s = dir == -1?alphatab.tablature.drawing.MusicFont.FooterUpEighth:alphatab.tablature.drawing.MusicFont.FooterDownEighth;
		break;
	}
	if(s != "") layer.addMusicSymbol(s,x,y,scale);
}
alphatab.tablature.drawing.NotePainter.paintBar = function(layer,x1,y1,x2,y2,count,dir,scale) {
	var width = Math.max(1.0,Math.round(3.0 * scale));
	var _g = 0;
	while(_g < count) {
		var i = _g++;
		var realY1 = y1 - i * (5.0 * scale) * dir;
		var realY2 = y2 - i * (5.0 * scale) * dir;
		layer.startFigure();
		layer.addPolygon([new alphatab.model.Point(x1,realY1),new alphatab.model.Point(x2,realY2),new alphatab.model.Point(x2,realY2 + width),new alphatab.model.Point(x1,realY1 + width),new alphatab.model.Point(x1,realY1)]);
		layer.closeFigure();
	}
}
alphatab.tablature.drawing.NotePainter.paintHarmonic = function(layer,x,y,scale) {
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.Harmonic,x,y,scale);
}
alphatab.tablature.drawing.NotePainter.paintNote = function(layer,x,y,scale,full) {
	var symbol = full?alphatab.tablature.drawing.MusicFont.NoteQuarter:alphatab.tablature.drawing.MusicFont.NoteHalf;
	layer.addMusicSymbol(symbol,x,y,scale);
}
alphatab.tablature.drawing.NotePainter.paintDeadNote = function(layer,x,y,scale) {
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.DeadNote,x,y,scale);
}
alphatab.tablature.drawing.NotePainter.paintPercussion = function(layer,note,x,y,scale) {
	var normalKeys = [32,34,35,36,38,39,40,41,43,45,47,48,50,55,56,58,60,61];
	var xKeys = [31,33,37,42,44,54,62,63,64,65,66];
	var value = note.value;
	if(value <= 30 || value >= 67 || Lambda.has(normalKeys,value)) layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.NoteQuarter,x,y,scale); else if(Lambda.has(xKeys,value)) layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.Sticks,x,y,scale); else if(value == 46) layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.HiHat,x,y,scale); else if(value == 49 || value == 57) layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.Harmonic,x,y,scale); else if(value == 52) layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.ChineseCymbal,x,y,scale); else if(value == 51 || value == 53 || value == 59) layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.RideCymbal,x,y,scale);
}
alphatab.tablature.drawing.SilencePainter = function() { }
alphatab.tablature.drawing.SilencePainter.__name__ = true;
alphatab.tablature.drawing.SilencePainter.paintEighth = function(layer,x,y,layout) {
	y += layout.scoreLineSpacing;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceEighth,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintWhole = function(layer,x,y,layout) {
	y += layout.scoreLineSpacing;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintHalf = function(layer,x,y,layout) {
	y += layout.scoreLineSpacing * 1.5;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceHalf,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintQuarter = function(layer,x,y,layout) {
	y += layout.scoreLineSpacing;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceQuarter,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintSixteenth = function(layer,x,y,layout) {
	y += layout.scoreLineSpacing * 1.5;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceSixteenth,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintThirtySecond = function(layer,x,y,layout) {
	y += layout.scoreLineSpacing * 0.5;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceThirtySecond,x,y,layout.scale);
}
alphatab.tablature.drawing.SilencePainter.paintSixtyFourth = function(layer,x,y,layout) {
	y += layout.scoreLineSpacing * 0.5;
	layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.SilenceSixtyFourth,x,y,layout.scale);
}
alphatab.tablature.drawing.SvgPainter = function(layer,svg,x,y,xScale,yScale) {
	this._layer = layer;
	this._svg = svg;
	this._x = x;
	this._y = y;
	this._xScale = xScale * 0.98;
	this._yScale = yScale * 0.98;
	this._currentPosition = new alphatab.model.Point(x,y);
	this._token = svg.split(" ");
	this._currentIndex = 0;
};
alphatab.tablature.drawing.SvgPainter.__name__ = true;
alphatab.tablature.drawing.SvgPainter.prototype = {
	getString: function() {
		if(this._currentIndex < this._token.length) return this._token[this._currentIndex++];
		return (function($this) {
			var $r;
			throw "EOF";
			return $r;
		}(this));
	}
	,peekNumber: function() {
		return Std.parseFloat(this._token[this._currentIndex]);
	}
	,peekString: function() {
		return this._token[this._currentIndex];
	}
	,isNextCommand: function() {
		var command = this.peekString();
		return command == "m" || command == "M" || command == "c" || command == "C" || command == "q" || command == "Q" || command == "l" || command == "L" || command == "z" || command == "Z";
	}
	,getNumber: function() {
		return Std.parseFloat(this.getString());
	}
	,parseCommand: function() {
		try {
			var command = this.getString();
			switch(command) {
			case "M":
				this._currentPosition.x = this._x + this.getNumber() * this._xScale;
				this._currentPosition.y = this._y + this.getNumber() * this._yScale;
				this._layer.moveTo(this._currentPosition.x,this._currentPosition.y);
				break;
			case "m":
				this._currentPosition.x += this.getNumber() * this._xScale;
				this._currentPosition.y += this.getNumber() * this._yScale;
				this._layer.moveTo(this._currentPosition.x,this._currentPosition.y);
				break;
			case "z":
				break;
			case "Z":
				this._layer.closeFigure();
				break;
			case "L":
				var isNextNumber = true;
				do {
					this._currentPosition.x = this._x + this.getNumber() * this._xScale;
					this._currentPosition.y = this._y + this.getNumber() * this._yScale;
					this._layer.lineTo(this._currentPosition.x,this._currentPosition.y);
					isNextNumber = !this.isNextCommand();
				} while(isNextNumber);
				break;
			case "l":
				var isNextNumber = true;
				do {
					this._currentPosition.x += this.getNumber() * this._xScale;
					this._currentPosition.y += this.getNumber() * this._yScale;
					this._layer.lineTo(this._currentPosition.x,this._currentPosition.y);
					isNextNumber = !this.isNextCommand();
				} while(isNextNumber);
				break;
			case "C":
				var isNextNumber = true;
				do {
					var x1 = this._x + this.getNumber() * this._xScale;
					var y1 = this._y + this.getNumber() * this._yScale;
					var x2 = this._x + this.getNumber() * this._xScale;
					var y2 = this._y + this.getNumber() * this._yScale;
					var x3 = this._x + this.getNumber() * this._xScale;
					var y3 = this._y + this.getNumber() * this._yScale;
					this._currentPosition.x = x3;
					this._currentPosition.y = y3;
					this._layer.bezierTo(x1,y1,x2,y2,x3,y3);
					isNextNumber = !this.isNextCommand();
				} while(isNextNumber);
				break;
			case "c":
				var isNextNumber = true;
				do {
					var x1 = this._currentPosition.x + this.getNumber() * this._xScale;
					var y1 = this._currentPosition.y + this.getNumber() * this._yScale;
					var x2 = this._currentPosition.x + this.getNumber() * this._xScale;
					var y2 = this._currentPosition.y + this.getNumber() * this._yScale;
					var x3 = this._currentPosition.x + this.getNumber() * this._xScale;
					var y3 = this._currentPosition.y + this.getNumber() * this._yScale;
					this._currentPosition.x = x3;
					this._currentPosition.y = y3;
					this._layer.bezierTo(x1,y1,x2,y2,x3,y3);
					isNextNumber = !this.isNextCommand();
				} while(isNextNumber && this._currentIndex < this._token.length);
				break;
			case "Q":
				var isNextNumber = true;
				do {
					var x1 = this._x + this.getNumber() * this._xScale;
					var y1 = this._y + this.getNumber() * this._yScale;
					var x2 = this._x + this.getNumber() * this._xScale;
					var y2 = this._y + this.getNumber() * this._yScale;
					this._currentPosition.x = x2;
					this._currentPosition.y = y2;
					this._layer.quadraticCurveTo(x1,y1,x2,y2);
					isNextNumber = !this.isNextCommand();
				} while(isNextNumber);
				break;
			case "q":
				var isNextNumber = true;
				do {
					var x1 = this._currentPosition.x + this.getNumber() * this._xScale;
					var y1 = this._currentPosition.y + this.getNumber() * this._yScale;
					var x2 = this._currentPosition.x + this.getNumber() * this._xScale;
					var y2 = this._currentPosition.y + this.getNumber() * this._yScale;
					this._currentPosition.x = x2;
					this._currentPosition.y = y2;
					this._layer.quadraticCurveTo(x1,y1,x2,y2);
					isNextNumber = !this.isNextCommand();
				} while(isNextNumber && this._currentIndex < this._token.length);
				break;
			}
		} catch( e ) {
			this._currentIndex = this._token.length;
		}
	}
	,paint: function() {
		this._layer.startFigure();
		while(this._currentIndex < this._token.length) this.parseCommand();
	}
	,__class__: alphatab.tablature.drawing.SvgPainter
}
alphatab.tablature.drawing.TempoPainter = function() { }
alphatab.tablature.drawing.TempoPainter.__name__ = true;
alphatab.tablature.drawing.TempoPainter.paintTempo = function(context,x,y,scale) {
	var layer = context.get(3);
	var draw = context.get(4);
	var w = Math.round(6 * scale);
	var h = Math.round(12 * scale);
	var h2 = Math.round(h - 3 * scale);
	alphatab.tablature.drawing.NotePainter.paintNote(layer,x,y + h,0.7 * scale,true);
	draw.startFigure();
	draw.addLine(x + w,y,x + w,y + h);
}
alphatab.tablature.drawing.TripletFeelPainter = function() { }
alphatab.tablature.drawing.TripletFeelPainter.__name__ = true;
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
alphatab.tablature.model = {}
alphatab.tablature.model.BeatDrawing = function(factory) {
	alphatab.model.Beat.call(this,factory);
	this.effectsCache = new alphatab.tablature.model.EffectsCache();
};
alphatab.tablature.model.BeatDrawing.__name__ = true;
alphatab.tablature.model.BeatDrawing.__super__ = alphatab.model.Beat;
alphatab.tablature.model.BeatDrawing.prototype = $extend(alphatab.model.Beat.prototype,{
	calculateTremoloBarOverflow: function(layout) {
		var offsets = new Array();
		offsets.push(0);
		offsets.push(0);
		if(this.effect.tremoloBar.points.length == 0) return offsets;
		var min = null;
		var max = null;
		var _g = 0, _g1 = this.effect.tremoloBar.points;
		while(_g < _g1.length) {
			var curr = _g1[_g];
			++_g;
			if(min == null || min.value > curr.value) min = curr;
			if(max == null || max.value < curr.value) max = curr;
		}
		var note = this.getMinNote();
		var string = note == null?6:note.string;
		var heightToTabNote = (string - 1) * layout.stringSpacing;
		offsets[0] = Math.round(Math.abs(min.value) * (6 * layout.scale) - heightToTabNote);
		offsets[1] = Math.round(Math.abs(max.value) * (6 * layout.scale) - heightToTabNote);
		return offsets;
	}
	,registerEffects: function(layout) {
		var md = this.measure;
		if(this.text != null) {
			md.effectsCache.text = true;
			this.effectsCache.text = true;
		}
		if(this.effect.stroke.direction != 0) {
			md.effectsCache.stroke = true;
			this.effectsCache.stroke = true;
		}
		if(this.effect.hasRasgueado) {
			md.effectsCache.rasgueado = true;
			this.effectsCache.rasgueado = true;
		}
		if(this.effect.hasPickStroke) {
			md.effectsCache.pickStroke = true;
			this.effectsCache.pickStroke = true;
		}
		if(this.effect.chord != null) {
			md.effectsCache.chord = true;
			this.effectsCache.chord = true;
		}
		if(this.effect.fadeIn) {
			md.effectsCache.fadeIn = true;
			this.effectsCache.fadeIn = true;
		}
		if(this.effect.vibrato) {
			md.effectsCache.beatVibrato = true;
			this.effectsCache.beatVibrato = true;
		}
		if(this.effect.tremoloBar != null) {
			md.effectsCache.tremoloBar = true;
			this.effectsCache.tremoloBar = true;
			var overflow = this.calculateTremoloBarOverflow(layout);
			md.effectsCache.tremoloBarTopOverflow = overflow[0];
			this.effectsCache.tremoloBarTopOverflow = overflow[0];
			md.effectsCache.tremoloBarBottomOverflow = overflow[1];
			this.effectsCache.tremoloBarBottomOverflow = overflow[1];
		}
		if(this.effect.mixTableChange != null) {
			md.effectsCache.mixTable = true;
			this.effectsCache.mixTable = true;
		}
		if(this.effect.tapping || this.effect.slapping || this.effect.popping) {
			md.effectsCache.tapSlapPop = true;
			this.effectsCache.tapSlapPop = true;
		}
	}
	,getNextBeat: function() {
		if(this._nextBeat == null) {
			if(this.index < this.measure.beats.length - 1) this._nextBeat = this.measure.beats[this.index + 1]; else {
				var nextMeasure = this.measure.getNextMeasure();
				if(nextMeasure != null) this._nextBeat = nextMeasure.beats[0];
			}
		}
		return this._nextBeat;
	}
	,getPreviousBeat: function() {
		if(this._prevBeat == null) {
			if(this.index > 0) this._prevBeat = this.measure.beats[this.index - 1]; else {
				var prevMeasure = this.measure.getPreviousMeasure();
				if(prevMeasure != null) this._prevBeat = prevMeasure.beats[prevMeasure.beats.length - 1];
			}
		}
		return this._prevBeat;
	}
	,performLayout: function(layout) {
		this.width = 0;
		this.effectsCache.reset();
		this.registerEffects(layout);
		var _g1 = 0, _g = this.voices.length;
		while(_g1 < _g) {
			var i = _g1++;
			var voice = this.voices[i];
			if(!voice.isEmpty) {
				voice.performLayout(layout);
				this.width = Math.max(this.width,voice.width);
			}
			this.effectsCache.fingering = Math.max(this.effectsCache.fingering,voice.effectsCache.fingering);
		}
	}
	,getNote: function(voice,string) {
		if(voice < 0 || voice >= this.voices.length) return null;
		var voice1 = this.voices[voice];
		var _g = 0, _g1 = voice1.notes;
		while(_g < _g1.length) {
			var note = _g1[_g];
			++_g;
			if(note.string == string) return note;
		}
		return null;
	}
	,getMinNote: function() {
		if(this._minNote == null) {
			var _g = 0, _g1 = this.getNotes();
			while(_g < _g1.length) {
				var note = _g1[_g];
				++_g;
				if(this._minNote == null || this._minNote.realValue() < note.realValue()) this._minNote = note;
			}
		}
		return this._minNote;
	}
	,checkNote: function(note) {
		var md = this.measure;
		md.checkNote(note);
		if(this.minNote == null || this.minNote.realValue() > note.realValue()) this.minNote = note;
		if(this.maxNote == null || this.maxNote.realValue() < note.realValue()) this.maxNote = note;
	}
	,measureDrawing: function() {
		return this.measure;
	}
	,fullX: function() {
		var layout = this.measure.staveLine.tablature.viewLayout;
		return this.measure.staveLine.x + this.measure.x + this.measure.getDefaultSpacings(layout) + this.x;
	}
	,fullWidth: function() {
		var md = this.measure;
		var factor = md.getSizingFactor();
		return this.width * factor;
	}
	,isFirstOfLine: function() {
		return this.measure.beats.length == 0 || this.index == 0;
	}
	,__class__: alphatab.tablature.model.BeatDrawing
});
alphatab.tablature.model.BeatGroup = function() {
	this._voices = new Array();
};
alphatab.tablature.model.BeatGroup.__name__ = true;
alphatab.tablature.model.BeatGroup.canJoin = function(v1,v2) {
	if(v1 == null || v2 == null || v1.isRestVoice() || v2.isRestVoice()) return false;
	var m1 = v1.beat.measure;
	var m2 = v2.beat.measure;
	if(m1 != m2) return false;
	var start1 = v1.beat.start;
	var start2 = v2.beat.start;
	if(v1.duration.value < alphatab.model.Duration.EIGHTH || v2.duration.value < alphatab.model.Duration.EIGHTH) return start1 == start2;
	var divisionLength = alphatab.model.SongManager.getDivisionLength(m1.header);
	var division1 = Math.floor((divisionLength + start1) / divisionLength);
	var division2 = Math.floor((divisionLength + start2) / divisionLength);
	return division1 == division2;
}
alphatab.tablature.model.BeatGroup.prototype = {
	checkNote: function(note) {
		var value = note.realValue();
		if(this.firstMinNote == null || note.voice.beat.start < this.firstMinNote.voice.beat.start) this.firstMinNote = note; else if(note.voice.beat.start == this.firstMinNote.voice.beat.start) {
			if(note.realValue() < this.firstMinNote.realValue()) this.firstMinNote = note;
		}
		if(this.firstMaxNote == null || note.voice.beat.start < this.firstMaxNote.voice.beat.start) this.firstMaxNote = note; else if(note.voice.beat.start == this.firstMaxNote.voice.beat.start) {
			if(note.realValue() > this.firstMaxNote.realValue()) this.firstMaxNote = note;
		}
		if(this.lastMinNote == null || note.voice.beat.start > this.lastMinNote.voice.beat.start) this.lastMinNote = note; else if(note.voice.beat.start == this.lastMinNote.voice.beat.start) {
			if(note.realValue() < this.lastMinNote.realValue()) this.lastMinNote = note;
		}
		if(this.lastMaxNote == null || note.voice.beat.start > this.lastMaxNote.voice.beat.start) this.lastMaxNote = note; else if(note.voice.beat.start == this.lastMaxNote.voice.beat.start) {
			if(note.realValue() > this.lastMaxNote.realValue()) this.lastMaxNote = note;
		}
		if(this.maxNote == null || value > this.maxNote.realValue()) this.maxNote = note;
		if(this.minNote == null || value < this.minNote.realValue()) this.minNote = note;
	}
	,check: function(voice) {
		if(voice.beat.measure.track.isPercussionTrack) this.isPercussion = true;
		var add = false;
		if(this._voices.length == 0) add = true; else if(alphatab.tablature.model.BeatGroup.canJoin(this._lastVoice,voice)) add = true;
		if(add) {
			this._lastVoice = voice;
			this._voices.push(voice);
			this.checkNote(voice.minNote);
			this.checkNote(voice.maxNote);
		}
		return add;
	}
	,getNoteValueForPosition: function(note) {
		if(note.voice.beat.measure.track.isPercussionTrack) return alphatab.tablature.model.PercussionMapper.getValue(note); else return note.realValue();
	}
	,getDirection: function() {
		var max = Math.abs(this.getNoteValueForPosition(this.minNote) - (alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS[this._voices[0].beat.measure.clef] + 100));
		var min = Math.abs(this.getNoteValueForPosition(this.maxNote) - (alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS[this._voices[0].beat.measure.clef] - 100));
		return max > min?1:2;
	}
	,__class__: alphatab.tablature.model.BeatGroup
}
alphatab.tablature.model.DrawingSongModelFactory = function() {
	alphatab.model.SongFactory.call(this);
};
alphatab.tablature.model.DrawingSongModelFactory.__name__ = true;
alphatab.tablature.model.DrawingSongModelFactory.__super__ = alphatab.model.SongFactory;
alphatab.tablature.model.DrawingSongModelFactory.prototype = $extend(alphatab.model.SongFactory.prototype,{
	newMeasureHeader: function() {
		return new alphatab.tablature.model.MeasureHeaderDrawing(this);
	}
	,newVoice: function(index) {
		return new alphatab.tablature.model.VoiceDrawing(this,index);
	}
	,newBeat: function() {
		return new alphatab.tablature.model.BeatDrawing(this);
	}
	,newMeasure: function(header) {
		return new alphatab.tablature.model.MeasureDrawing(header);
	}
	,newNote: function() {
		return new alphatab.tablature.model.NoteDrawing(this);
	}
	,__class__: alphatab.tablature.model.DrawingSongModelFactory
});
alphatab.tablature.model.EffectsCache = function() {
	this.reset();
};
alphatab.tablature.model.EffectsCache.__name__ = true;
alphatab.tablature.model.EffectsCache.prototype = {
	reset: function() {
		this.bend = false;
		this.bendOverflow = 0;
		this.harmonic = false;
		this.harmonicType = -1;
		this.grace = false;
		this.trill = false;
		this.tremoloPicking = false;
		this.beatVibrato = false;
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
		this.leftHandFingering = new Array();
		this.rightHandFingering = new Array();
		this.fingering = 0;
		this.slide = false;
		this.stroke = false;
		this.rasgueado = false;
		this.pickStroke = false;
		this.chord = false;
		this.fadeIn = false;
		this.tremoloBar = false;
		this.tapSlapPop = false;
		this.mixTable = false;
		this.text = false;
		this.tempo = false;
		this.tripletFeel = false;
		this.triplet = false;
		this.marker = false;
	}
	,__class__: alphatab.tablature.model.EffectsCache
}
alphatab.tablature.model.JoinedType = { __ename__ : true, __constructs__ : ["NoneLeft","NoneRight","Left","Right"] }
alphatab.tablature.model.JoinedType.NoneLeft = ["NoneLeft",0];
alphatab.tablature.model.JoinedType.NoneLeft.toString = $estr;
alphatab.tablature.model.JoinedType.NoneLeft.__enum__ = alphatab.tablature.model.JoinedType;
alphatab.tablature.model.JoinedType.NoneRight = ["NoneRight",1];
alphatab.tablature.model.JoinedType.NoneRight.toString = $estr;
alphatab.tablature.model.JoinedType.NoneRight.__enum__ = alphatab.tablature.model.JoinedType;
alphatab.tablature.model.JoinedType.Left = ["Left",2];
alphatab.tablature.model.JoinedType.Left.toString = $estr;
alphatab.tablature.model.JoinedType.Left.__enum__ = alphatab.tablature.model.JoinedType;
alphatab.tablature.model.JoinedType.Right = ["Right",3];
alphatab.tablature.model.JoinedType.Right.toString = $estr;
alphatab.tablature.model.JoinedType.Right.__enum__ = alphatab.tablature.model.JoinedType;
alphatab.tablature.model.MeasureDrawing = function(header) {
	alphatab.model.Measure.call(this,header);
	this.effectsCache = new alphatab.tablature.model.EffectsCache();
	this._registeredAccidentals = new Array();
	var _g = 0;
	while(_g < 11) {
		var i = _g++;
		var a = new Array();
		var _g1 = 0;
		while(_g1 < 7) {
			var j = _g1++;
			a.push(false);
		}
		this._registeredAccidentals.push(a);
	}
	this._defaultSpacings = -1;
};
alphatab.tablature.model.MeasureDrawing.__name__ = true;
alphatab.tablature.model.MeasureDrawing.__super__ = alphatab.model.Measure;
alphatab.tablature.model.MeasureDrawing.prototype = $extend(alphatab.model.Measure.prototype,{
	calculateKeySignatureSpacing: function(layout) {
		if(!this.header.shouldPaintKeySignature(this)) return 0;
		var newKeySignature = this.header.keySignature;
		var oldKeySignature = 0;
		if(this.getPreviousMeasure() != null) oldKeySignature = this.getPreviousMeasure().header.keySignature;
		var normalizingSymbols = 0;
		if(oldKeySignature <= 7) normalizingSymbols = oldKeySignature; else normalizingSymbols = oldKeySignature - 7;
		var offsetSymbols = 0;
		if(newKeySignature <= 7) offsetSymbols = newKeySignature; else offsetSymbols = newKeySignature - 7;
		return Math.round((normalizingSymbols + offsetSymbols) * (8 * layout.scale));
	}
	,calculateTimeSignatureSpacing: function(layout) {
		if(!this.header.shouldPaintTimeSignature(this)) return 0;
		return 30 * layout.scale;
	}
	,calculateClefSpacing: function(layout) {
		if(!this.shouldPaintClef()) return 0;
		return 40 * layout.scale;
	}
	,shouldPaintClef: function() {
		return this.getPreviousMeasure() == null || this.getPreviousMeasure().clef != this.clef || this.isFirstOfLine();
	}
	,getSizingFactor: function() {
		var beatBoundsWidth = this.width - this._defaultSpacings;
		if(beatBoundsWidth == 0) return 1;
		return (beatBoundsWidth + this.spacing) / beatBoundsWidth;
	}
	,getDefaultSpacings: function(layout,update) {
		if(update == null) update = false;
		if(this._defaultSpacings >= 0 && !update) return this._defaultSpacings;
		var w = 0;
		w += this.calculateClefSpacing(layout);
		w += this.calculateKeySignatureSpacing(layout);
		w += this.calculateTimeSignatureSpacing(layout);
		w += this.header.repeatClose > 0?20 * layout.scale:0;
		w += 10 * layout.scale;
		w += 10 * layout.scale;
		this._defaultSpacings = w;
		return this._defaultSpacings;
	}
	,registerSpacings: function(layout) {
		if(this.getPreviousMeasure() == null || this.getPreviousMeasure().header.tempo.value != this.header.tempo.value) this.effectsCache.tempo = true;
		if(this.getPreviousMeasure() == null && this.header.tripletFeel != 0 || this.getPreviousMeasure() != null && this.getPreviousMeasure().header.tripletFeel != this.header.tripletFeel) this.effectsCache.tripletFeel = true;
		if(this.header.hasMarker()) this.effectsCache.marker = true;
	}
	,getRealStart: function(currentStart) {
		var beatLength = this.divisionLength;
		var start = currentStart;
		var startBeat = start % beatLength == 0;
		if(!startBeat) {
			var time = alphatab.model.Duration.MIN_TIME;
			var _g = 0;
			while(_g < time) {
				var i = _g++;
				start++;
				startBeat = start % beatLength == 0;
				if(startBeat) break;
			}
			if(!startBeat) start = currentStart;
		}
		return start;
	}
	,calculateDivisionLength: function() {
		var defaultLenght = alphatab.model.Duration.QUARTER_TIME;
		var denominator = this.header.timeSignature.denominator.value;
		switch(denominator) {
		case alphatab.model.Duration.EIGHTH:
			if(this.header.timeSignature.numerator % 3 == 0) defaultLenght += Math.floor(alphatab.model.Duration.QUARTER_TIME / 2);
			break;
		}
		return defaultLenght;
	}
	,getNextMeasure: function() {
		if(this._nextMeasure == null) this._nextMeasure = this.header.number < this.track.measures.length?this.track.measures[this.header.number]:null;
		return this._nextMeasure;
	}
	,getPreviousMeasure: function() {
		if(this._prevMeasure == null) this._prevMeasure = this.header.number > 1?this.track.measures[this.header.number - 2]:null;
		return this._prevMeasure;
	}
	,performLayout: function(layout) {
		this.groups = new Array();
		this.width = 0;
		this.spacing = 0;
		this.effectsCache.reset();
		this.registerSpacings(layout);
		this.width += this.getDefaultSpacings(layout,true);
		var beatX = 0;
		var _g1 = 0, _g = this.beats.length;
		while(_g1 < _g) {
			var i = _g1++;
			var beat = this.beats[i];
			beat.x = beatX;
			beat.performLayout(layout);
			beatX += beat.width;
			this.effectsCache.fingering = Math.max(this.effectsCache.fingering,beat.effectsCache.fingering);
		}
		this.divisionLength = this.calculateDivisionLength();
		this.minDownGroup = null;
		this.maxUpGroup = null;
		var _g = 0, _g1 = this.groups;
		while(_g < _g1.length) {
			var group = _g1[_g];
			++_g;
			var direction = group.getDirection();
			if(direction == 2) {
				if(this.minDownGroup == null || this.minDownGroup.minNote.realValue() > group.minNote.realValue()) this.minDownGroup = group;
			} else if(this.maxUpGroup == null || this.maxUpGroup.maxNote.realValue() < group.maxNote.realValue()) this.maxUpGroup = group;
		}
		this.width += beatX;
	}
	,clearRegisteredAccidentals: function() {
		var _g = 0;
		while(_g < 11) {
			var i = _g++;
			var _g1 = 0;
			while(_g1 < 7) {
				var n = _g1++;
				this._registeredAccidentals[i][n] = false;
			}
		}
	}
	,setSpacing: function(spacing) {
		this.spacing = spacing;
		var beatX = 0;
		var _g = 0, _g1 = this.beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			var bd = beat;
			bd.x = beatX;
			beatX += bd.fullWidth();
		}
	}
	,applyNoteAccitental: function(noteDrawing) {
		var noteValue = noteDrawing.realValue();
		if(noteValue >= 0 && noteValue < 128) {
			var key = this.header.keySignature;
			var isSharp = noteDrawing.swapAccidentals?key > 7:key <= 7;
			var note = noteValue % 12;
			var octave = noteValue / 12 | 0;
			var accidentalValue = isSharp?2:3;
			var accidentalNotes = isSharp?alphatab.tablature.model.MeasureDrawing.ACCIDENTAL_SHARP_NOTES:alphatab.tablature.model.MeasureDrawing.ACCIDENTAL_FLAT_NOTES;
			var isAccidentalNote = alphatab.tablature.model.MeasureDrawing.ACCIDENTAL_NOTES[note];
			var isAccidentalKey = alphatab.tablature.model.MeasureDrawing.ACCIDENTALS[key][accidentalNotes[note]] == accidentalValue;
			if(isAccidentalKey != isAccidentalNote && !this._registeredAccidentals[octave][accidentalNotes[note]]) {
				this._registeredAccidentals[octave][accidentalNotes[note]] = true;
				noteDrawing.accidental = isAccidentalNote?accidentalValue:1;
				return;
			}
			if(isAccidentalKey == isAccidentalNote && this._registeredAccidentals[octave][accidentalNotes[note]]) {
				this._registeredAccidentals[octave][accidentalNotes[note]] = false;
				noteDrawing.accidental = isAccidentalNote?accidentalValue:1;
				return;
			}
		}
		noteDrawing.accidental = 0;
	}
	,checkNote: function(note) {
		if(this.minNote == null || this.minNote.realValue() > note.realValue()) this.minNote = note;
		if(this.maxNote == null || this.maxNote.realValue() < note.realValue()) this.maxNote = note;
	}
	,headerDrawing: function() {
		return this.header;
	}
	,isFirstOfLine: function() {
		return this.staveLine.measures.length == 0 || this.staveLine.measures[0] == this.header.number - 1;
	}
	,__class__: alphatab.tablature.model.MeasureDrawing
});
alphatab.tablature.model.MeasureHeaderDrawing = function(factory) {
	alphatab.model.MeasureHeader.call(this,factory);
};
alphatab.tablature.model.MeasureHeaderDrawing.__name__ = true;
alphatab.tablature.model.MeasureHeaderDrawing.__super__ = alphatab.model.MeasureHeader;
alphatab.tablature.model.MeasureHeaderDrawing.prototype = $extend(alphatab.model.MeasureHeader.prototype,{
	shouldPaintTimeSignature: function(measure) {
		var previous = measure.getPreviousMeasure();
		return previous == null || previous.header.timeSignature.numerator != this.timeSignature.numerator || previous.header.timeSignature.denominator.value != this.timeSignature.denominator.value;
	}
	,shouldPaintKeySignature: function(measure) {
		if(measure.getPreviousMeasure() == null && this.keySignature == 0) return false; else if(measure.track.isPercussionTrack) return false; else if(measure.getPreviousMeasure() != null && measure.getPreviousMeasure().header.keySignature == this.keySignature && measure.getPreviousMeasure().header.keySignatureType == this.keySignatureType) return false;
		return true;
	}
	,__class__: alphatab.tablature.model.MeasureHeaderDrawing
});
alphatab.tablature.model.NoteDrawing = function(factory) {
	alphatab.model.Note.call(this,factory);
	this.accidental = -1;
};
alphatab.tablature.model.NoteDrawing.__name__ = true;
alphatab.tablature.model.NoteDrawing.__super__ = alphatab.model.Note;
alphatab.tablature.model.NoteDrawing.prototype = $extend(alphatab.model.Note.prototype,{
	calculateBendOverflow: function(layout) {
		var point = null;
		var _g = 0, _g1 = this.effect.bend.points;
		while(_g < _g1.length) {
			var curr = _g1[_g];
			++_g;
			if(point == null || point.value < curr.value) point = curr;
		}
		if(point == null) return 0;
		var fullHeight = point.value * (6 * layout.scale);
		var heightToTabNote = (this.string - 1) * layout.stringSpacing;
		return Math.round(fullHeight - heightToTabNote);
	}
	,registerEffects: function(layout) {
		var md = this.voice.beat.measure;
		var bd = this.voice.beat;
		var vd = this.voice;
		if(this.effect.isFingering) {
			vd.effectsCache.fingering++;
			if(this.effect.leftHandFinger != -2 && this.effect.leftHandFinger != -1) {
				vd.effectsCache.leftHandFingering.push(this.effect.leftHandFinger);
				if(!Lambda.has(bd.effectsCache.leftHandFingering,this.effect.leftHandFinger)) bd.effectsCache.leftHandFingering.push(this.effect.leftHandFinger);
				if(!Lambda.has(md.effectsCache.leftHandFingering,this.effect.leftHandFinger)) md.effectsCache.leftHandFingering.push(this.effect.leftHandFinger);
			}
			if(this.effect.rightHandFinger != -2 && this.effect.rightHandFinger != -1) {
				vd.effectsCache.rightHandFingering.push(this.effect.rightHandFinger);
				if(!Lambda.has(bd.effectsCache.rightHandFingering,this.effect.rightHandFinger)) bd.effectsCache.rightHandFingering.push(this.effect.rightHandFinger);
				if(!Lambda.has(md.effectsCache.rightHandFingering,this.effect.rightHandFinger)) md.effectsCache.rightHandFingering.push(this.effect.rightHandFinger);
			}
		}
		if(this.effect.isBend()) {
			vd.effectsCache.bend = true;
			vd.effectsCache.bendOverflow = this.calculateBendOverflow(layout);
			md.effectsCache.bend = true;
			md.effectsCache.bendOverflow = md.effectsCache.bendOverflow;
			bd.effectsCache.bend = true;
			bd.effectsCache.bendOverflow = md.effectsCache.bendOverflow;
		}
		if(this.effect.isHarmonic()) {
			vd.effectsCache.harmonic = true;
			md.effectsCache.harmonic = true;
			bd.effectsCache.harmonic = true;
			if(vd.effectsCache.harmonicType == -1) {
				vd.effectsCache.harmonicType = this.effect.harmonic.type;
				md.effectsCache.harmonicType = this.effect.harmonic.type;
				bd.effectsCache.harmonicType = this.effect.harmonic.type;
			}
		}
		if(this.effect.isGrace()) {
			vd.effectsCache.grace = true;
			md.effectsCache.grace = true;
			bd.effectsCache.grace = true;
		}
		if(this.effect.isTrill()) {
			vd.effectsCache.trill = true;
			md.effectsCache.trill = true;
			bd.effectsCache.trill = true;
		}
		if(this.effect.isTremoloPicking()) {
			vd.effectsCache.tremoloPicking = true;
			md.effectsCache.tremoloPicking = true;
			bd.effectsCache.tremoloPicking = true;
		}
		if(this.effect.vibrato) {
			vd.effectsCache.vibrato = true;
			md.effectsCache.vibrato = true;
			bd.effectsCache.vibrato = true;
		}
		if(this.effect.deadNote) {
			vd.effectsCache.deadNote = true;
			md.effectsCache.deadNote = true;
			bd.effectsCache.deadNote = true;
		}
		if(this.effect.slide) {
			vd.effectsCache.slide = true;
			md.effectsCache.slide = true;
			bd.effectsCache.slide = true;
		}
		if(this.effect.hammer) {
			vd.effectsCache.hammer = true;
			md.effectsCache.hammer = true;
			bd.effectsCache.hammer = true;
		}
		if(this.effect.ghostNote) {
			vd.effectsCache.ghostNote = true;
			md.effectsCache.ghostNote = true;
			bd.effectsCache.ghostNote = true;
		}
		if(this.effect.accentuatedNote) {
			vd.effectsCache.accentuatedNote = true;
			md.effectsCache.accentuatedNote = true;
			bd.effectsCache.accentuatedNote = true;
		}
		if(this.effect.heavyAccentuatedNote) {
			vd.effectsCache.heavyAccentuatedNote = true;
			md.effectsCache.heavyAccentuatedNote = true;
			bd.effectsCache.heavyAccentuatedNote = true;
		}
		if(this.effect.palmMute) {
			vd.effectsCache.palmMute = true;
			md.effectsCache.palmMute = true;
			bd.effectsCache.palmMute = true;
		}
		if(this.effect.staccato) {
			vd.effectsCache.staccato = true;
			md.effectsCache.staccato = true;
			bd.effectsCache.staccato = true;
		}
		if(this.effect.letRing) {
			vd.effectsCache.letRing = true;
			md.effectsCache.letRing = true;
			bd.effectsCache.letRing = true;
		}
	}
	,performLayout: function(layout) {
		this.scorePosY = 0;
		this.noteSize = layout.getNoteSize(this);
		var vd = this.voice;
		vd.checkNote(this);
		this.registerEffects(layout);
	}
	,measureDrawing: function() {
		return this.voice.beat.measure;
	}
	,beatDrawing: function() {
		return this.voice.beat;
	}
	,voiceDrawing: function() {
		return this.voice;
	}
	,getAccitental: function() {
		if(this.accidental < 0) this.voice.beat.measure.applyNoteAccitental(this);
		return this.accidental;
	}
	,__class__: alphatab.tablature.model.NoteDrawing
});
alphatab.tablature.model.PercussionMapper = function() { }
alphatab.tablature.model.PercussionMapper.__name__ = true;
alphatab.tablature.model.PercussionMapper.getValue = function(note) {
	var value = note.value;
	if(value <= 34) return 60; else if(value <= 36) return 53; else if(value <= 40) return 60; else if(value == 41) return 55; else if(value == 42) return 67; else if(value == 43) return 57; else if(value == 44) return 53; else if(value == 45) return 59; else if(value == 46) return 67; else if(value == 47) return 62; else if(value == 48) return 64; else if(value == 49) return 67; else if(value == 50) return 65; else if(value <= 53) return 67; else if(value == 54) return 62; else if(value == 55) return 60; else if(value == 56) return 64; else if(value == 57) return 67; else if(value == 58) return 60; else if(value == 59) return 67; else if(value == 60) return 52; else if(value == 61) return 50; else if(value == 62) return 57; else if(value == 63) return 59; else if(value == 64) return 55; else if(value == 65) return 52; else if(value == 66) return 50; else return 60;
}
alphatab.tablature.model.TripletGroup = function(voice) {
	this._voiceIndex = voice;
	this.voices = new Array();
};
alphatab.tablature.model.TripletGroup.__name__ = true;
alphatab.tablature.model.TripletGroup.prototype = {
	check: function(voice) {
		if(this.voices.length == 0) this.triplet = voice.duration.tuplet.enters; else if(voice.index != this._voiceIndex || voice.duration.tuplet.enters != this.triplet || this.isFull()) return false;
		this.voices.push(voice);
		return true;
	}
	,isFull: function() {
		return this.voices.length == this.triplet;
	}
	,__class__: alphatab.tablature.model.TripletGroup
}
alphatab.tablature.model.VoiceDrawing = function(factory,index) {
	alphatab.model.Voice.call(this,factory,index);
	this.effectsCache = new alphatab.tablature.model.EffectsCache();
};
alphatab.tablature.model.VoiceDrawing.__name__ = true;
alphatab.tablature.model.VoiceDrawing.__super__ = alphatab.model.Voice;
alphatab.tablature.model.VoiceDrawing.prototype = $extend(alphatab.model.Voice.prototype,{
	performLayout: function(layout) {
		this.width = layout.getVoiceWidth(this);
		this.effectsCache.reset();
		this.notes.sort($bind(this,this.compareNotes));
		this.anyDisplaced = false;
		var previousNote = null;
		var _g = 0, _g1 = this.notes;
		while(_g < _g1.length) {
			var note = _g1[_g];
			++_g;
			var noteDrawing = note;
			noteDrawing.displaced = alphatab.tablature.staves.ScoreStave.isDisplaced(previousNote,noteDrawing);
			if(noteDrawing.displaced) this.anyDisplaced = true;
			noteDrawing.performLayout(layout);
			previousNote = noteDrawing;
		}
		if(this.anyDisplaced) this.width += Math.floor(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x);
		var previousVoice = this.getPreviousVoice();
		var nextVoice = this.getNextVoice();
		var noteJoined = false;
		var withPrevious = false;
		this.joinedType = alphatab.tablature.model.JoinedType.NoneRight;
		this.leftJoin = this;
		this.rightJoin = this;
		this.isJoinedGreaterThanQuarter = false;
		if(alphatab.tablature.model.BeatGroup.canJoin(this,previousVoice)) {
			withPrevious = true;
			if(previousVoice.duration.value >= this.duration.value) {
				this.leftJoin = previousVoice;
				this.rightJoin = this;
				this.joinedType = alphatab.tablature.model.JoinedType.Left;
				noteJoined = true;
			}
			if(previousVoice.duration.value > alphatab.model.Duration.QUARTER) this.isJoinedGreaterThanQuarter = true;
		}
		if(alphatab.tablature.model.BeatGroup.canJoin(this,nextVoice)) {
			if(nextVoice.duration.value >= this.duration.value) {
				this.rightJoin = nextVoice;
				if(previousVoice == null || previousVoice.isRestVoice() || previousVoice.duration.value < this.duration.value) this.leftJoin = this;
				noteJoined = true;
				this.joinedType = alphatab.tablature.model.JoinedType.Right;
			}
			if(nextVoice.duration.value > alphatab.model.Duration.QUARTER) this.isJoinedGreaterThanQuarter = true;
		}
		if(!noteJoined && withPrevious) this.joinedType = alphatab.tablature.model.JoinedType.NoneLeft;
		if(!this.isRestVoice()) {
			if(this.beatGroup == null) {
				if(previousVoice != null && previousVoice.beatGroup != null && previousVoice.beatGroup.check(this)) this.beatGroup = previousVoice.beatGroup; else {
					this.beatGroup = new alphatab.tablature.model.BeatGroup();
					this.beatGroup.check(this);
				}
			}
			if(!Lambda.has(this.beat.measure.groups,this.beatGroup)) this.beat.measure.groups.push(this.beatGroup);
		}
		if(this.duration.tuplet != null && !this.duration.tuplet.equals(alphatab.model.Tuplet.NORMAL)) {
			this.beat.effectsCache.triplet = true;
			this.beat.measure.effectsCache.triplet = true;
			if(previousVoice != null && previousVoice.beat.measure.staveLine != this.beat.measure.staveLine) previousVoice == null;
			if(previousVoice == null || previousVoice.tripletGroup == null || !previousVoice.tripletGroup.check(this)) {
				this.tripletGroup = new alphatab.tablature.model.TripletGroup(this.index);
				this.tripletGroup.check(this);
			} else this.tripletGroup = previousVoice.tripletGroup;
		}
	}
	,compareNotes: function(a,b) {
		if(a.realValue() > b.realValue()) return 1;
		if(a.realValue() < b.realValue()) return -1;
		return 0;
	}
	,checkNote: function(note) {
		var bd = this.beat;
		bd.checkNote(note);
		if(this.minNote == null || this.minNote.realValue() > note.realValue()) this.minNote = note;
		if(this.maxNote == null || this.maxNote.realValue() < note.realValue()) this.maxNote = note;
		if(this.minStringNote == null || this.minStringNote.string > note.string) this.minStringNote = note;
		if(this.maxStringNote == null || this.maxStringNote.string < note.string) this.maxStringNote = note;
	}
	,getNextVoice: function() {
		var previousBeat = this.beat.getNextBeat();
		if(previousBeat == null) return null;
		return previousBeat != null?previousBeat.voices[this.index]:null;
	}
	,getPreviousVoice: function() {
		var previousBeat = this.beat.getPreviousBeat();
		if(previousBeat == null) return null;
		return previousBeat != null?previousBeat.voices[this.index]:null;
	}
	,measureDrawing: function() {
		return this.beat.measure;
	}
	,beatDrawing: function() {
		return this.beat;
	}
	,__class__: alphatab.tablature.model.VoiceDrawing
});
alphatab.tablature.staves = {}
alphatab.tablature.staves.Stave = function(line,layout) {
	this.index = 0;
	this.line = line;
	this.layout = layout;
};
alphatab.tablature.staves.Stave.__name__ = true;
alphatab.tablature.staves.Stave.prototype = {
	getTimeSignatureSymbol: function(number) {
		switch(number) {
		case 0:
			return alphatab.tablature.drawing.MusicFont.Num0;
		case 1:
			return alphatab.tablature.drawing.MusicFont.Num1;
		case 2:
			return alphatab.tablature.drawing.MusicFont.Num2;
		case 3:
			return alphatab.tablature.drawing.MusicFont.Num3;
		case 4:
			return alphatab.tablature.drawing.MusicFont.Num4;
		case 5:
			return alphatab.tablature.drawing.MusicFont.Num5;
		case 6:
			return alphatab.tablature.drawing.MusicFont.Num6;
		case 7:
			return alphatab.tablature.drawing.MusicFont.Num7;
		case 8:
			return alphatab.tablature.drawing.MusicFont.Num8;
		case 9:
			return alphatab.tablature.drawing.MusicFont.Num9;
		}
		return null;
	}
	,paintTimeSignatureNumber: function(layout,context,number,x,y,scale) {
		if(number < 10) {
			var symbol = this.getTimeSignatureSymbol(number);
			if(symbol != null) context.get(3).addMusicSymbol(symbol,x,y,scale);
		} else {
			var firstDigit = Math.floor(number / 10);
			var secondDigit = number - firstDigit * 10;
			var symbol = this.getTimeSignatureSymbol(firstDigit);
			if(symbol != null) context.get(3).addMusicSymbol(symbol,x,y,scale);
			symbol = this.getTimeSignatureSymbol(secondDigit);
			if(symbol != null) context.get(3).addMusicSymbol(symbol,x + 10 * scale,y,scale);
		}
	}
	,paintDivisions: function(layout,context,measure,x,y,dotSize,offset,staveHeight) {
		var x2;
		var number = Std.string(measure.header.number);
		var fill = context.get(3);
		var draw = context.get(4);
		var lineWidthBig = Math.max(1,Math.round(3.0 * layout.scale));
		var startY = y;
		var bottomY;
		if(this.index == 0) context.get(13).addString(number,alphatab.tablature.drawing.DrawingResources.defaultFont,x + Math.round(layout.scale * 2),y + offset - alphatab.tablature.drawing.DrawingResources.defaultFontHeight);
		y += offset;
		bottomY = y + staveHeight;
		dotSize = Math.max(1,dotSize * layout.scale);
		if(measure.header.isRepeatOpen) {
			fill.addRect(x,y,lineWidthBig,bottomY - y);
			draw.startFigure();
			x2 = Math.floor(x + lineWidthBig + 3 * layout.scale);
			draw.addLine(x2,y,x2,bottomY);
			x2 += Math.floor(2 * layout.scale);
			var centerY = y + (bottomY - y) / 2;
			var yMove = 6 * layout.scale;
			fill.addCircle(x2,centerY - yMove - dotSize,dotSize);
			fill.addCircle(x2,centerY + yMove,dotSize);
		} else {
			draw.startFigure();
			draw.addLine(x,y,x,bottomY);
		}
		x += measure.width + measure.spacing;
		if(measure.header.repeatClose > 0 || measure.header.number == measure.track.measureCount()) {
			x2 = Math.floor(x - (lineWidthBig + 3 * layout.scale));
			draw.startFigure();
			draw.addLine(x2,y,x2,bottomY);
			fill.addRect(x - lineWidthBig,y,lineWidthBig,bottomY - y);
			if(measure.header.repeatClose > 0) {
				x2 -= Math.floor(2 * layout.scale) + dotSize;
				var centerY = y + (bottomY - y) / 2;
				var yMove = 6 * layout.scale;
				fill.addCircle(x2,centerY - yMove - dotSize,dotSize);
				fill.addCircle(x2,centerY + yMove,dotSize);
				if(this.index == 0) {
					var repetitions = "x" + (measure.header.repeatClose + 1);
					var numberSize = context.graphics.measureText(repetitions);
					fill.addString(repetitions,alphatab.tablature.drawing.DrawingResources.defaultFont,x2 - dotSize,y - alphatab.tablature.drawing.DrawingResources.defaultFontHeight);
				}
			}
		} else {
			draw.startFigure();
			draw.addLine(x,y,x,bottomY);
		}
	}
	,paintMeasure: function(layout,context,measure,x,y) {
	}
	,paintStave: function(layout,context,x,y) {
	}
	,prepare: function(measure) {
	}
	,getLineBottomSpacing: function() {
		return 0;
	}
	,getLineTopSpacing: function() {
		return 0;
	}
	,getBarBottomSpacing: function() {
		return 0;
	}
	,getBarTopSpacing: function() {
		return 0;
	}
	,getStaveId: function() {
		return "";
	}
	,__class__: alphatab.tablature.staves.Stave
}
alphatab.tablature.staves.ScoreStave = function(line,layout) {
	alphatab.tablature.staves.Stave.call(this,line,layout);
	this.spacing = new alphatab.tablature.staves.StaveSpacing(13);
	this.spacing.set(0,Math.floor(15 * layout.scale));
	this.spacing.set(8,Math.floor(15 * layout.scale));
	this.spacing.set(10,Math.floor(layout.scoreLineSpacing * 4));
	this.spacing.set(12,Math.floor(15 * layout.scale));
	line.setFeaturePaintPriority(alphatab.tablature.staves.StaveFeatures.TimeSignature,2);
};
alphatab.tablature.staves.ScoreStave.__name__ = true;
alphatab.tablature.staves.ScoreStave.isDisplaced = function(previous,current) {
	if(previous == null) return false;
	var prevVal = previous.realValue();
	var curVal = current.realValue();
	var keySignature = current.voice.beat.measure.header.keySignature;
	var prevOctave = Math.floor(prevVal / 12);
	var currentOctave = Math.floor(curVal / 12);
	if(prevOctave != currentOctave) return false;
	var positions = keySignature <= 7?alphatab.tablature.staves.ScoreStave.SCORE_SHARP_POSITIONS:alphatab.tablature.staves.ScoreStave.SCORE_FLAT_POSITIONS;
	var prevPosition = positions[prevVal % 12];
	var curPosition = positions[curVal % 12];
	return Math.abs(curPosition - prevPosition) <= 1 && !previous.displaced;
}
alphatab.tablature.staves.ScoreStave.__super__ = alphatab.tablature.staves.Stave;
alphatab.tablature.staves.ScoreStave.prototype = $extend(alphatab.tablature.staves.Stave.prototype,{
	paintChord: function(layout,context,beat,x,y) {
		if(!beat.effect.isChord()) return;
		y += this.spacing.get(3);
		context.get(9).addString(beat.effect.chord.name,alphatab.tablature.drawing.DrawingResources.defaultFont,x,y + Math.floor(alphatab.tablature.drawing.DrawingResources.defaultFontHeight / 2));
	}
	,paintBeatEffects: function(layout,context,beat,x,y) {
		this.paintChord(layout,context,beat,x,y);
	}
	,paintTremoloPicking: function(layout,context,note,x,y) {
		if(!note.effect.isTremoloPicking()) return;
		var direction = note.voice.beatGroup.getDirection();
		var trillY = direction != 1?y + Math.floor(8 * layout.scale):y - Math.floor(16 * layout.scale);
		var trillX = direction != 1?x - Math.floor(5 * layout.scale):x + Math.floor(3 * layout.scale);
		var s = "";
		switch(note.effect.tremoloPicking.duration.value) {
		case alphatab.model.Duration.EIGHTH:
			s = alphatab.tablature.drawing.MusicFont.TrillUpEigth;
			if(direction == 2) trillY += Math.floor(8 * layout.scale);
			break;
		case alphatab.model.Duration.SIXTEENTH:
			s = alphatab.tablature.drawing.MusicFont.TrillUpSixteenth;
			if(direction == 2) trillY += Math.floor(4 * layout.scale);
			break;
		case alphatab.model.Duration.THIRTY_SECOND:
			s = alphatab.tablature.drawing.MusicFont.TrillUpThirtySecond;
			break;
		}
		var fill = note.voice.index == 0?context.get(10):context.get(6);
		if(s != "") fill.addMusicSymbol(s,trillX,trillY,layout.scale);
	}
	,paintGraceNote: function(layout,context,note,x,y) {
		if(!note.effect.isGrace()) return;
		var scale = layout.scoreLineSpacing / 2.25;
		var realX = x - 10 * layout.scale;
		var realY = y - 9 * layout.scale;
		var fill = note.voice.index == 0?context.get(10):context.get(6);
		if(note.effect.deadNote) realY += layout.scoreLineSpacing;
		var s = note.effect.deadNote?alphatab.tablature.drawing.MusicFont.GraceDeadNote:alphatab.tablature.drawing.MusicFont.GraceNote;
		fill.addMusicSymbol(s,realX - scale * 1.33,realY,layout.scale);
		if(note.effect.grace.transition == 3 || note.effect.grace.transition == 1) {
			var startX = x - 10 * layout.scale;
			var tieY = y + 10 * layout.scale;
			alphatab.tablature.staves.TablatureStave.paintTie(layout,fill,startX,tieY,x,tieY,true);
		}
	}
	,paintDottedNote: function(layout,context,voice,displaced,x,y) {
		if(!voice.duration.isDotted && !voice.duration.isDoubleDotted) return;
		var displaceOffset = Math.floor(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x);
		if(voice.anyDisplaced && !displaced) x += displaceOffset;
		var fill = voice.index == 0?context.get(9):context.get(5);
		var dotSize = 3.0 * layout.scale;
		x += Math.round(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x + 4 * layout.scale);
		y += Math.round(4 * layout.scale);
		fill.addCircle(Math.round(x - dotSize / 2.0),Math.round(y - dotSize / 2.0),dotSize);
		if(voice.duration.isDoubleDotted) fill.addCircle(Math.round(x + (dotSize + 2.0) - dotSize / 2.0),Math.round(y - dotSize / 2.0),dotSize);
	}
	,paintStaccato: function(layout,context,note,x,y) {
		if(!note.effect.staccato) return;
		var note1 = note.voice.beatGroup.getDirection() == 1?note.voice.minNote:note.voice.maxNote;
		var dotSize = 2.0 * layout.scale;
		y = y + this.spacing.get(10) + this.getNoteScorePosY(layout,note1);
		y += Math.round((4 + layout.scale) * (note1.voice.beatGroup.getDirection() == 1?1:-1));
		x += Math.round(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x / 1.5 - dotSize);
		var fill = note1.voice.index == 0?context.get(9):context.get(5);
		fill.addCircle(x,y,dotSize);
	}
	,paintHammerOn: function(layout,context,note,x,y) {
		if(!note.effect.hammer) return;
		var nextBeat = note.voice.beat.getNextBeat();
		var nextNote = nextBeat == null?null:nextBeat.getNote(note.voice.index,note.string);
		var fill = note.voice.index == 0?context.get(10):context.get(6);
		var draw = note.voice.index == 0?context.get(11):context.get(7);
		var down = note.voice.beatGroup.getDirection() == 2;
		var noteSize = Math.round(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x);
		var noteOffset = Math.round((4 + layout.scale) * (!down?1:-1));
		var startY = y + this.spacing.get(10) + this.getNoteScorePosY(layout,note) + noteOffset;
		var startX = x + noteSize / 2;
		var endX = nextNote != null?x + (note.voice.beat.fullWidth() + noteSize / 2):startX + 15 * layout.scale;
		var endY = nextNote != null?y + this.spacing.get(10) + this.getNoteScorePosY(layout,nextNote) + noteOffset:startY;
		alphatab.tablature.staves.TablatureStave.paintTie(layout,fill,startX,startY,endX,endY,!down);
	}
	,paintSlide: function(layout,context,note,x,y) {
		if(!note.effect.slide) return;
		var nextBeat = note.voice.beat.getNextBeat();
		var nextNote = nextBeat == null?null:nextBeat.getNote(note.voice.index,note.string);
		if(nextNote != null && (note.effect.slideType == 1 || note.effect.slideType == 0)) {
			var down = note.voice.beatGroup.getDirection() == 2;
			var noteXOffset = Math.round(4 * layout.scale);
			var noteYOffset = noteXOffset * (!down?1:-1);
			var noteSize = Math.round(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x);
			var startY = y + this.spacing.get(10) + this.getNoteScorePosY(layout,note) - noteYOffset;
			var startX = x + noteSize + noteXOffset;
			var endX = nextNote != null?x + note.voice.beat.fullWidth() - noteYOffset - noteXOffset:startX + 15 * layout.scale;
			var endY = nextNote != null?y + this.spacing.get(10) + this.getNoteScorePosY(layout,nextNote):startY;
			var draw = note.voice.index == 0?context.get(11):context.get(7);
			draw.addLine(startX,startY,endX,endY);
			if(note.effect.slideType == 1) {
				var fill = note.voice.index == 0?context.get(10):context.get(6);
				startY = y + this.spacing.get(10) + this.getNoteScorePosY(layout,note) + noteYOffset;
				startX = x + noteSize / 2;
				endX = nextNote != null?x + (note.voice.beat.fullWidth() + noteSize / 2):startX + 15 * layout.scale;
				endY = nextNote != null?y + this.spacing.get(10) + this.getNoteScorePosY(layout,nextNote) + noteYOffset:startY;
				alphatab.tablature.staves.TablatureStave.paintTie(layout,fill,startX,startY,endX,endY,!down);
			}
		}
	}
	,paintTiedNote: function(layout,context,note,x,y) {
		var nextBeat = note.voice.beat.getNextBeat();
		var nextNote = nextBeat == null?null:nextBeat.getNote(note.voice.index,note.string);
		if(nextNote != null && nextNote.isTiedNote) {
			var fill = note.voice.index == 0?context.get(10):context.get(6);
			var down = note.voice.beatGroup.getDirection() == 2;
			var noteSize = Math.round(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x);
			var noteOffset = Math.round((4 + layout.scale) * (!down?1:-1));
			var startY = y + this.spacing.get(10) + this.getNoteScorePosY(layout,note) + noteOffset;
			var startX = x + noteSize / 2;
			var endX = nextNote != null?x + (note.voice.beat.fullWidth() + noteSize / 2):startX + 15 * layout.scale;
			var endY = nextNote != null?y + this.spacing.get(10) + this.getNoteScorePosY(layout,nextNote) + noteOffset:startY;
			alphatab.tablature.staves.TablatureStave.paintTie(layout,fill,startX,startY,endX,endY,!down);
		}
	}
	,paintEffects: function(layout,context,note,x,y,noteY) {
		this.paintDottedNote(layout,context,note.voice,note.displaced,x,noteY);
		this.paintStaccato(layout,context,note,x,y);
		this.paintGraceNote(layout,context,note,x,noteY);
		this.paintTremoloPicking(layout,context,note,x,noteY);
		this.paintHammerOn(layout,context,note,x,y);
		this.paintSlide(layout,context,note,x,y);
		this.paintTiedNote(layout,context,note,x,y);
	}
	,getNoteScorePosY: function(layout,note) {
		if(note.scorePosY <= 0) {
			var keySignature = note.voice.beat.measure.header.keySignature;
			var clef = note.voice.beat.measure.clef;
			var step = layout.scoreLineSpacing / 2.00;
			var noteValue = note.voice.beat.measure.track.isPercussionTrack?alphatab.tablature.model.PercussionMapper.getValue(note):note.realValue();
			var index = noteValue % 12;
			var octave = Math.floor(noteValue / 12);
			var offset = 7 * octave * step;
			var isSharp = note.swapAccidentals?keySignature > 7:keySignature <= 7;
			var scoreLineY = isSharp?Math.floor(alphatab.tablature.staves.ScoreStave.SCORE_SHARP_POSITIONS[index] * step - offset):Math.floor(alphatab.tablature.staves.ScoreStave.SCORE_FLAT_POSITIONS[index] * step - offset);
			scoreLineY += Math.floor(alphatab.tablature.staves.ScoreStave.SCORE_CLEF_OFFSETS[clef] * step) + Math.round(layout.scale);
			note.scorePosY = scoreLineY;
		}
		return note.scorePosY;
	}
	,paintNote: function(layout,context,note,x,y) {
		var noteHeadY = y + this.spacing.get(10) + this.getNoteScorePosY(layout,note);
		var noteHeadX = x;
		var fill = note.voice.index == 0?context.get(9):context.get(5);
		var effectLayer = note.voice.index == 0?context.get(10):context.get(6);
		var direction = note.voice.beatGroup.getDirection();
		var displaceOffset = Math.floor(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x);
		if(note.displaced) {
			if(direction == 1) noteHeadX += displaceOffset; else noteHeadX -= displaceOffset;
		}
		if(!note.voice.beat.measure.track.isPercussionTrack) {
			var accidentalX = x - Math.floor(7 * layout.scale);
			if(note.voice.anyDisplaced && direction == 2) accidentalX -= displaceOffset;
			var accidentalY = noteHeadY + 3 * layout.scale;
			if(note.getAccitental() == 1) alphatab.tablature.drawing.KeySignaturePainter.paintSmallNatural(fill,accidentalX,accidentalY,layout); else if(note.getAccitental() == 2) alphatab.tablature.drawing.KeySignaturePainter.paintSmallSharp(fill,accidentalX,accidentalY,layout); else if(note.getAccitental() == 3) alphatab.tablature.drawing.KeySignaturePainter.paintSmallFlat(fill,accidentalX,accidentalY,layout);
		}
		if(note.voice.beat.measure.track.isPercussionTrack) alphatab.tablature.drawing.NotePainter.paintPercussion(fill,note,x,noteHeadY,layout.scale); else if(note.effect.isHarmonic()) {
			var full = note.voice.duration.value >= alphatab.model.Duration.QUARTER;
			var layer = full?fill:effectLayer;
			alphatab.tablature.drawing.NotePainter.paintHarmonic(layer,noteHeadX,noteHeadY,layout.scale);
		} else if(note.effect.deadNote) alphatab.tablature.drawing.NotePainter.paintDeadNote(fill,noteHeadX,noteHeadY,layout.scale); else {
			var full = note.voice.duration.value >= alphatab.model.Duration.QUARTER;
			alphatab.tablature.drawing.NotePainter.paintNote(fill,noteHeadX,noteHeadY,layout.scale,full);
		}
		this.paintEffects(layout,context,note,noteHeadX,y,noteHeadY);
	}
	,paintTriplet: function(layout,context,voice,x,y) {
		if(voice.duration.tuplet.equals(alphatab.model.Tuplet.NORMAL)) return;
		var fill = voice.index == 0?context.get(9):context.get(5);
		var draw = voice.index == 0?context.get(12):context.get(8);
		y += this.spacing.get(6);
		var previousVoice = voice.getPreviousVoice();
		if(voice.tripletGroup.isFull() && (previousVoice == null || previousVoice.tripletGroup == null || previousVoice.tripletGroup != voice.tripletGroup)) {
			var firstVoice = voice.tripletGroup.voices[0];
			var lastVoice = voice.tripletGroup.voices[voice.tripletGroup.voices.length - 1];
			var startX = firstVoice.beat.fullX();
			var endX = lastVoice.beat.fullX();
			var direction = voice.isRestVoice()?1:voice.beatGroup.getDirection();
			if(direction == 1) {
				var offset = Math.floor(alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x);
				startX += offset;
				endX += offset;
			}
			var lineW = endX - startX;
			var h = this.spacing.spacing[6];
			var s = Std.string(voice.tripletGroup.triplet);
			context.graphics.set_font(alphatab.tablature.drawing.DrawingResources.effectFont);
			var w = context.graphics.measureText(s);
			draw.addLine(startX,y + h,startX,y);
			draw.addLine(startX,y,startX + lineW / 2 - w,y);
			draw.addString(s,alphatab.tablature.drawing.DrawingResources.effectFont,startX + (lineW - w) / 2,y);
			draw.addLine(startX + lineW / 2 + w,y,endX,y);
			draw.addLine(endX,y + h,endX,y);
		} else if(!voice.tripletGroup.isFull()) fill.addString(Std.string(voice.duration.tuplet.enters),alphatab.tablature.drawing.DrawingResources.defaultFont,x,y);
	}
	,calculateBeamY: function(layout,beatGroup,direction,x,key,clef) {
		var maxDistance = Math.round(10 * layout.scale);
		var upOffset = 28 * (this.layout.scoreLineSpacing / 8.0);
		var downOffset = 28 * (this.layout.scoreLineSpacing / 8.0);
		var y;
		var x1;
		var x2;
		var y1;
		var y2;
		if(direction == 2) {
			if(beatGroup.minNote != beatGroup.firstMinNote && beatGroup.minNote != beatGroup.lastMinNote) return this.getNoteScorePosY(layout,beatGroup.minNote) + downOffset;
			y = 0;
			x1 = beatGroup.firstMinNote.voice.beat.fullX();
			x2 = beatGroup.lastMinNote.voice.beat.fullX();
			y1 = Math.round(this.getNoteScorePosY(layout,beatGroup.firstMinNote) + downOffset);
			y2 = Math.round(this.getNoteScorePosY(layout,beatGroup.lastMinNote) + downOffset);
			if(y1 > y2 && y1 - y2 > maxDistance) y2 = y1 - maxDistance;
			if(y2 > y1 && y2 - y1 > maxDistance) y1 = y2 - maxDistance;
			if(y1 - y2 != 0 && x1 - x2 != 0 && x1 - x != 0) y = Math.round((y1 - y2) / (x1 - x2) * (x1 - x));
			return y1 - y;
		} else {
			if(beatGroup.maxNote != beatGroup.firstMaxNote && beatGroup.maxNote != beatGroup.lastMaxNote) return this.getNoteScorePosY(layout,beatGroup.maxNote) - upOffset;
			y = 0;
			x1 = beatGroup.firstMaxNote.voice.beat.fullX();
			x2 = beatGroup.lastMaxNote.voice.beat.fullX();
			y1 = Math.round(this.getNoteScorePosY(layout,beatGroup.firstMaxNote) - upOffset);
			y2 = Math.round(this.getNoteScorePosY(layout,beatGroup.lastMaxNote) - upOffset);
			if(y1 < y2 && y2 - y1 > maxDistance) y2 = y1 + maxDistance;
			if(y2 < y1 && y1 - y2 > maxDistance) y1 = y2 + maxDistance;
			if(y1 - y2 != 0 && x1 - x2 != 0 && x1 - x != 0) y = Math.round((y1 - y2) / (x1 - x2) * (x1 - x));
			return y1 - y;
		}
	}
	,getOffset: function(offset) {
		return offset * (this.layout.scoreLineSpacing / 8.0);
	}
	,paintBeam: function(layout,context,voice,x,y) {
		if(voice.isRestVoice()) return;
		y += this.spacing.get(10);
		var fill = voice.index == 0?context.get(9):context.get(5);
		var draw = voice.index == 0?context.get(12):context.get(8);
		if(voice.duration.value >= alphatab.model.Duration.HALF) {
			var direction = voice.beatGroup.getDirection();
			var key = voice.beat.measure.header.keySignature;
			var clef = voice.beat.measure.clef;
			var xMove = direction == 1?alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x:0;
			var yMove = direction == 1?Math.round(layout.scoreLineSpacing / 3) + 1:Math.round(layout.scoreLineSpacing / 3) * 2;
			var y1 = y + (direction == 1?this.getNoteScorePosY(layout,voice.minNote):this.getNoteScorePosY(layout,voice.maxNote));
			var y2 = Math.round(y + this.calculateBeamY(layout,voice.beatGroup,direction,Math.round(x + xMove),key,clef));
			draw.addLine(x + xMove,y1 + yMove,x + xMove,y2 + yMove);
			if(voice.duration.value >= alphatab.model.Duration.EIGHTH) {
				var index = voice.duration.index() - 2;
				if(index > 0) {
					var rotation = direction == 2?1:-1;
					if((voice.joinedType == alphatab.tablature.model.JoinedType.NoneRight || voice.joinedType == alphatab.tablature.model.JoinedType.NoneLeft) && !voice.isJoinedGreaterThanQuarter) alphatab.tablature.drawing.NotePainter.paintFooter(fill,x,y2,voice.duration.value,rotation,layout); else {
						var startX;
						var endX;
						var startXforCalculation;
						var endXforCalculation;
						if(voice.joinedType == alphatab.tablature.model.JoinedType.NoneRight) {
							startX = Math.floor(x + xMove);
							endX = Math.floor(x + 6 * layout.scale + xMove);
							startXforCalculation = voice.beat.fullX();
							endXforCalculation = Math.floor(voice.beat.fullX() + 6 * layout.scale);
						} else if(voice.joinedType == alphatab.tablature.model.JoinedType.NoneLeft) {
							startX = Math.floor(x - 6 * layout.scale + xMove);
							endX = Math.floor(x + xMove);
							startXforCalculation = Math.floor(voice.beat.fullX() - 6 * layout.scale);
							endXforCalculation = voice.beat.fullX();
						} else {
							startX = Math.floor(voice.leftJoin.beat.fullX() + xMove);
							endX = Math.ceil(voice.rightJoin.beat.fullX() + xMove);
							startXforCalculation = voice.leftJoin.beat.fullX();
							endXforCalculation = voice.rightJoin.beat.fullX();
						}
						var hY1 = Math.floor(y + yMove + this.calculateBeamY(layout,voice.beatGroup,direction,startXforCalculation,key,clef));
						var hY2 = Math.floor(y + yMove + this.calculateBeamY(layout,voice.beatGroup,direction,endXforCalculation,key,clef));
						alphatab.tablature.drawing.NotePainter.paintBar(fill,startX,hY1,endX,hY2,index,rotation,layout.scale);
					}
				}
			}
		}
	}
	,paintSilence: function(layout,context,voice,x,y) {
		x += Math.round(3 * layout.scale);
		y += this.spacing.get(10);
		var fill = voice.index == 0?context.get(9):context.get(5);
		switch(voice.duration.value) {
		case alphatab.model.Duration.WHOLE:
			alphatab.tablature.drawing.SilencePainter.paintWhole(fill,x,y,layout);
			y += Math.round(10 * layout.scale);
			x += Math.round(layout.scale);
			break;
		case alphatab.model.Duration.HALF:
			alphatab.tablature.drawing.SilencePainter.paintHalf(fill,x,y,layout);
			y += Math.round(10 * layout.scale);
			x += Math.round(layout.scale);
			break;
		case alphatab.model.Duration.QUARTER:
			alphatab.tablature.drawing.SilencePainter.paintQuarter(fill,x,y,layout);
			y += Math.round(10 * layout.scale);
			x += Math.round(layout.scale);
			break;
		case alphatab.model.Duration.EIGHTH:
			alphatab.tablature.drawing.SilencePainter.paintEighth(fill,x,y,layout);
			y += Math.round(10 * layout.scale);
			x += Math.round(layout.scale);
			break;
		case alphatab.model.Duration.SIXTEENTH:
			alphatab.tablature.drawing.SilencePainter.paintSixteenth(fill,x,y,layout);
			y += Math.round(10 * layout.scale);
			x += Math.round(layout.scale);
			break;
		case alphatab.model.Duration.THIRTY_SECOND:
			alphatab.tablature.drawing.SilencePainter.paintThirtySecond(fill,x,y,layout);
			y += Math.round(2 * layout.scale);
			x += Math.round(3 * layout.scale);
			break;
		case alphatab.model.Duration.SIXTY_FOURTH:
			alphatab.tablature.drawing.SilencePainter.paintSixtyFourth(fill,x,y,layout);
			y += Math.round(2 * layout.scale);
			x += Math.round(5 * layout.scale);
			break;
		}
		this.paintDottedNote(layout,context,voice,false,x,y);
	}
	,paintVoice: function(layout,context,voice,x,y) {
		if(!voice.isEmpty) {
			if(voice.isRestVoice()) this.paintSilence(layout,context,voice,x,y); else {
				var _g = 0, _g1 = voice.notes;
				while(_g < _g1.length) {
					var note = _g1[_g];
					++_g;
					this.paintNote(layout,context,note,x,y);
				}
			}
			this.paintBeam(layout,context,voice,x,y);
			this.paintTriplet(layout,context,voice,x,y);
		}
	}
	,paintExtraLines2: function(context,layout,note,x,y) {
		var realY = y + this.getNoteScorePosY(layout,note) - layout.scale;
		var x1 = x - 3 * layout.scale;
		var x2 = x + 12 * layout.scale;
		var scorelineSpacing = layout.scoreLineSpacing;
		if(realY < y) {
			var i = y;
			while(i > realY) {
				context.get(2).startFigure();
				context.get(2).addLine(x1,i,x2,i);
				i -= scorelineSpacing;
			}
		} else if(realY > y + scorelineSpacing * 4) {
			var i = y + scorelineSpacing * 5;
			while(i < realY + scorelineSpacing) {
				context.get(2).startFigure();
				context.get(2).addLine(x1,i,x2,i);
				i += scorelineSpacing;
			}
		}
	}
	,paintExtraLines: function(layout,context,beat,x,y) {
		if(!beat.isRestBeat()) {
			var scoreY = y + this.spacing.get(10);
			this.paintExtraLines2(context,layout,beat.minNote,x,scoreY);
			this.paintExtraLines2(context,layout,beat.maxNote,x,scoreY);
		}
	}
	,paintBeat: function(layout,context,beat,x,y) {
		this.paintExtraLines(layout,context,beat,x,y);
		var _g = 0, _g1 = beat.voices;
		while(_g < _g1.length) {
			var voice = _g1[_g];
			++_g;
			this.paintVoice(layout,context,voice,x,y);
		}
		this.paintBeatEffects(layout,context,beat,x,y);
	}
	,paintBeats: function(layout,context,measure,x,y) {
		var _g = 0, _g1 = measure.beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			var bd = beat;
			this.paintBeat(layout,context,bd,x + bd.x,y);
		}
	}
	,paintRepeatEndings: function(layout,context,measure,x,y) {
		if(measure.header.repeatAlternative <= 0) return;
		y += this.spacing.get(7);
		var h = this.spacing.spacing[7];
		var offset = Math.floor(3 * layout.scale);
		var draw = context.get(4);
		draw.startFigure();
		draw.addLine(x,y + h,x,y);
		draw.addLine(x,y,x + measure.width + measure.spacing - offset * 2,y);
		var txt = "";
		var _g = 0;
		while(_g < 8) {
			var i = _g++;
			if((measure.header.repeatAlternative & 1 << i) != 0) txt += txt.length > 0?", " + (i + 1):Std.string(i + 1);
		}
		context.get(3).addString(txt,alphatab.tablature.drawing.DrawingResources.defaultFont,x + offset,y + offset + alphatab.tablature.drawing.DrawingResources.defaultFontHeight / 2);
	}
	,paintMarker: function(layout,context,measure,x,y) {
		if(!measure.effectsCache.marker) return;
		y += this.spacing.get(2);
		context.get(9).addString(measure.header.marker.title,alphatab.tablature.drawing.DrawingResources.defaultFont,x,y + Math.floor(alphatab.tablature.drawing.DrawingResources.defaultFontHeight / 2));
	}
	,paintTripletFeel: function(layout,context,measure,x,y) {
		if(!measure.effectsCache.tripletFeel) return;
		y += this.spacing.get(4);
		if(measure.header.tripletFeel == 0 && measure.getPreviousMeasure() != null) {
			var previous = measure.getPreviousMeasure().header.tripletFeel;
			if(previous == 1) alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone8(context,x,y,layout.scale); else if(previous == 2) alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeelNone16(context,x,y,layout.scale);
		} else if(measure.header.tripletFeel == 1) alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel8(context,x,y,layout.scale); else if(measure.header.tripletFeel == 2) alphatab.tablature.drawing.TripletFeelPainter.paintTripletFeel16(context,x,y,layout.scale);
	}
	,paintTempo: function(layout,context,measure,x,y) {
		if(!measure.effectsCache.tempo) return;
		y += this.spacing.get(5);
		alphatab.tablature.drawing.TempoPainter.paintTempo(context,x,y,layout.scale);
		x += Math.round(8 * layout.scale);
		var value = " = " + measure.header.tempo.value;
		context.get(3).addString(value,alphatab.tablature.drawing.DrawingResources.defaultFont,x,y + alphatab.tablature.drawing.DrawingResources.defaultFontHeight);
	}
	,paintText: function(layout,context,measure,x,y) {
		if(!measure.effectsCache.text) return;
		y += this.spacing.get(1);
		var _g = 0, _g1 = measure.beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			if(beat.text != null) {
				var bd = beat;
				var str = beat.text.value;
				context.get(9).addString(str,alphatab.tablature.drawing.DrawingResources.defaultFont,x + bd.x,y + Math.floor(alphatab.tablature.drawing.DrawingResources.defaultFontHeight / 2));
			}
		}
	}
	,paintTimeSignature: function(layout,context,measure,x,y) {
		if(!measure.header.shouldPaintTimeSignature(measure) || !this.line.shouldPaintFeature(alphatab.tablature.staves.StaveFeatures.TimeSignature,2)) return;
		y += this.spacing.get(10);
		var x1 = x + measure.calculateClefSpacing(layout) + measure.calculateKeySignatureSpacing(layout) + Math.floor(15 * layout.scale);
		var x2 = x1;
		var y1 = 0;
		var y2 = Math.round(2 * layout.scoreLineSpacing);
		if(measure.header.timeSignature.numerator > 9 && measure.header.timeSignature.denominator.value < 10) x2 += Math.round(10 * layout.scale / 2);
		if(measure.header.timeSignature.numerator < 10 && measure.header.timeSignature.denominator.value > 9) x1 += Math.round(10 * layout.scale / 2);
		this.paintTimeSignatureNumber(layout,context,measure.header.timeSignature.numerator,x1,y + y1,layout.scale);
		this.paintTimeSignatureNumber(layout,context,measure.header.timeSignature.denominator.value,x2,y + y2,layout.scale);
	}
	,paintKeySignature: function(layout,context,measure,x,y) {
		if(!measure.header.shouldPaintKeySignature(measure)) return;
		x += measure.calculateClefSpacing(layout) + Math.floor(10 * layout.scale);
		y += this.spacing.get(10);
		var scale = layout.scoreLineSpacing;
		var currentKey = measure.header.keySignature;
		var previousKey = measure.getPreviousMeasure() != null?measure.getPreviousMeasure().header.keySignature:0;
		var offsetClef = 0;
		switch(measure.clef) {
		case 0:
			offsetClef = 0;
			break;
		case 1:
			offsetClef = 2;
			break;
		case 2:
			offsetClef = -1;
			break;
		case 3:
			offsetClef = 1;
			break;
		}
		var naturalizeSymbols = previousKey <= 7?previousKey:previousKey - 7;
		var previousKeyPositions = previousKey <= 7?alphatab.tablature.staves.ScoreStave.SCORE_KEYSHARP_POSITIONS:alphatab.tablature.staves.ScoreStave.SCORE_KEYFLAT_POSITIONS;
		var step = layout.scoreLineSpacing / 2;
		var _g = 0;
		while(_g < naturalizeSymbols) {
			var i = _g++;
			var keyY = 0;
			var offset = Math.round((previousKeyPositions[i] + offsetClef) * step + 6 * layout.scale);
			alphatab.tablature.drawing.KeySignaturePainter.paintNatural(context,x,y + offset,layout);
			x += Math.floor(8 * layout.scale);
		}
		var offsetSymbols = currentKey <= 7?currentKey:currentKey - 7;
		if(currentKey <= 7) {
			var _g = 0;
			while(_g < offsetSymbols) {
				var i = _g++;
				var keyY = 0;
				var offset = Math.round((alphatab.tablature.staves.ScoreStave.SCORE_KEYSHARP_POSITIONS[i] + offsetClef) * step + 2 * layout.scale);
				alphatab.tablature.drawing.KeySignaturePainter.paintSharp(context,x,y + offset,layout);
				x += Math.floor(8 * layout.scale);
			}
		} else {
			var _g = 0;
			while(_g < offsetSymbols) {
				var i = _g++;
				var keyY = 0;
				var offset = Math.round((alphatab.tablature.staves.ScoreStave.SCORE_KEYFLAT_POSITIONS[i] + offsetClef) * step + layout.scale);
				alphatab.tablature.drawing.KeySignaturePainter.paintFlat(context,x,y + offset,layout);
				x += Math.floor(8 * layout.scale);
			}
		}
	}
	,paintClef: function(layout,context,measure,x,y) {
		if(!measure.shouldPaintClef()) return;
		x += Math.round(14 * layout.scale);
		y += this.spacing.get(10);
		if(measure.clef == 0) alphatab.tablature.drawing.ClefPainter.paintTreble(context,x,y,layout); else if(measure.clef == 1) alphatab.tablature.drawing.ClefPainter.paintBass(context,x,y,layout); else if(measure.clef == 2) alphatab.tablature.drawing.ClefPainter.paintTenor(context,x,y,layout); else if(measure.clef == 3) alphatab.tablature.drawing.ClefPainter.paintAlto(context,x,y,layout);
	}
	,paintMeasure: function(layout,context,measure,x,y) {
		var realX = x + measure.x;
		var realY = y + this.spacing.get(0);
		var w = measure.width + measure.spacing;
		this.paintDivisions(layout,context,measure,realX,y,3,this.spacing.get(10),this.spacing.spacing[10]);
		this.paintClef(layout,context,measure,realX,y);
		this.paintKeySignature(layout,context,measure,realX,y);
		this.paintTimeSignature(layout,context,measure,realX,y);
		this.paintRepeatEndings(layout,context,measure,realX,y);
		realX += measure.getDefaultSpacings(layout);
		this.paintText(layout,context,measure,realX,y);
		this.paintTempo(layout,context,measure,realX,y);
		this.paintTripletFeel(layout,context,measure,realX,y);
		this.paintMarker(layout,context,measure,realX,y);
		this.paintBeats(layout,context,measure,realX,y);
	}
	,paintStave: function(layout,context,x,y) {
		var lineY = y + this.spacing.get(10);
		var _g = 1;
		while(_g < 6) {
			var i = _g++;
			context.get(2).startFigure();
			context.get(2).addLine(x,lineY,x + this.line.width,lineY);
			lineY += Math.round(layout.scoreLineSpacing);
		}
	}
	,prepare: function(measure) {
		if(measure.effectsCache.text) this.spacing.set(1,this.layout.effectSpacing);
		if(measure.effectsCache.tempo) this.spacing.set(5,20 * this.layout.scale);
		if(measure.effectsCache.tripletFeel) this.spacing.set(4,30 * this.layout.scale);
		if(measure.effectsCache.triplet) this.spacing.set(6,5 * this.layout.scale);
		if(measure.effectsCache.marker) this.spacing.set(2,this.layout.effectSpacing);
		if(measure.effectsCache.chord) this.spacing.set(3,this.layout.effectSpacing);
		if(measure.header.repeatAlternative > 0) this.spacing.set(7,Math.floor(15 * this.layout.scale));
		var currentTopSpacing = this.spacing.spacing[9];
		var middleLinesStart = this.spacing.get(10);
		var middleLinesEnd = this.spacing.get(11);
		var minNote = measure.minDownGroup == null?null:measure.minDownGroup.minNote;
		if(minNote != null) {
			var currentSpaceToLines = middleLinesStart - currentTopSpacing;
			var minScoreY = this.getNoteScorePosY(this.layout,minNote) + currentSpaceToLines;
			var minNoteOverflow = currentSpaceToLines - minScoreY;
			if(this.spacing.spacing[9] < minNoteOverflow) this.spacing.set(9,minNoteOverflow);
		}
		var maxNote = measure.maxUpGroup == null?null:measure.maxUpGroup.maxNote;
		if(maxNote != null) {
			var maxScoreY = this.getNoteScorePosY(this.layout,maxNote) + middleLinesStart;
			var maxNoteOverflow = maxScoreY - middleLinesEnd;
			if(this.spacing.spacing[11] < maxNoteOverflow) this.spacing.set(11,maxNoteOverflow);
		}
	}
	,getLineBottomSpacing: function() {
		return 11;
	}
	,getLineTopSpacing: function() {
		return 10;
	}
	,getBarBottomSpacing: function() {
		return 11;
	}
	,getBarTopSpacing: function() {
		return 8;
	}
	,__class__: alphatab.tablature.staves.ScoreStave
});
alphatab.tablature.staves.StaveFactory = function() { }
alphatab.tablature.staves.StaveFactory.__name__ = true;
alphatab.tablature.staves.StaveFactory.getStave = function(id,line,layout) {
	switch(id) {
	case "score":
		return new alphatab.tablature.staves.ScoreStave(line,layout);
	case "tablature":
		return new alphatab.tablature.staves.TablatureStave(line,layout);
	}
	return null;
}
alphatab.tablature.staves.StaveFeatures = { __ename__ : true, __constructs__ : ["TimeSignature"] }
alphatab.tablature.staves.StaveFeatures.TimeSignature = ["TimeSignature",0];
alphatab.tablature.staves.StaveFeatures.TimeSignature.toString = $estr;
alphatab.tablature.staves.StaveFeatures.TimeSignature.__enum__ = alphatab.tablature.staves.StaveFeatures;
alphatab.tablature.staves.StaveLine = function() {
	this.measures = new Array();
	this.staves = new Array();
	this.spacing = new alphatab.tablature.staves.StaveSpacing(2);
	this.paintFeatures = new Array();
	var _g1 = 0, _g = Type.getEnumConstructs(alphatab.tablature.staves.StaveFeatures).length;
	while(_g1 < _g) {
		var i = _g1++;
		this.paintFeatures.push(0);
	}
	this.y = 0;
	this.x = 0;
	this.fullLine = false;
	this.width = 0;
};
alphatab.tablature.staves.StaveLine.__name__ = true;
alphatab.tablature.staves.StaveLine.prototype = {
	paint: function(layout,track,context) {
		if(this.staves.length == 0) return;
		var posY = this.y + this.spacing.get(0);
		var lastStave = false;
		var _g1 = 0, _g = this.staves.length;
		while(_g1 < _g) {
			var si = _g1++;
			var stave = this.staves[si];
			if(si + 1 == this.staves.length) lastStave = true;
			stave.paintStave(layout,context,this.x,posY);
			var currentMeasure;
			var _g3 = 0, _g2 = this.measures.length;
			while(_g3 < _g2) {
				var i = _g3++;
				var index = this.measures[i];
				currentMeasure = track.measures[index];
				var previousMeasureX = 0;
				stave.paintMeasure(layout,context,currentMeasure,this.x,posY);
			}
			posY += stave.spacing.getSize();
		}
		if(this.staves.length > 1) {
			var firstStave = this.staves[0];
			var lastStave1 = this.staves[this.staves.length - 1];
			var firstStaveY = this.y + this.spacing.get(0);
			var lastStaveY = posY - lastStave1.spacing.getSize();
			var fill = context.get(3);
			var draw = context.get(4);
			var groupTopY = firstStaveY + firstStave.spacing.get(firstStave.getBarTopSpacing());
			var groupBottomY = lastStaveY + lastStave1.spacing.get(lastStave1.getBarBottomSpacing());
			var barSize = Math.floor(3 * layout.scale);
			var barOffset = barSize;
			fill.addRect(this.x - barOffset - barSize,groupTopY,barSize,groupBottomY - groupTopY);
			var spikeStartX = this.x - barOffset - barSize;
			var spikeEndX = this.x + barSize * 2;
			fill.startFigure();
			fill.moveTo(spikeStartX,groupTopY);
			fill.bezierTo(spikeStartX,groupTopY,this.x,groupTopY,spikeEndX,groupTopY - barSize);
			fill.bezierTo(this.x,groupTopY + barSize,spikeStartX,groupTopY + barSize,spikeStartX,groupTopY + barSize);
			fill.closeFigure();
			fill.startFigure();
			fill.moveTo(spikeStartX,groupBottomY);
			fill.bezierTo(spikeStartX,groupBottomY,this.x,groupBottomY,spikeEndX,groupBottomY + barSize);
			fill.bezierTo(this.x,groupBottomY - barSize,spikeStartX,groupBottomY - barSize,spikeStartX,groupBottomY - barSize);
			fill.closeFigure();
			var lineTopY = firstStaveY + firstStave.spacing.get(firstStave.getLineTopSpacing());
			var lineBottomY = lastStaveY + lastStave1.spacing.get(lastStave1.getLineBottomSpacing());
			draw.addLine(this.x,lineTopY,this.x,lineBottomY);
		}
	}
	,addStave: function(stave) {
		stave.index = this.staves.length;
		this.staves.push(stave);
	}
	,addMeasure: function(index) {
		this.measures.push(index);
	}
	,getHeight: function() {
		var height = 0;
		height += this.spacing.getSize();
		var _g = 0, _g1 = this.staves;
		while(_g < _g1.length) {
			var stave = _g1[_g];
			++_g;
			height += stave.spacing.getSize();
		}
		return height;
	}
	,setFeaturePaintPriority: function(feature,priority) {
		if(priority == null) priority = 1;
		if(this.getFeaturePaintPriority(feature) < priority) this.paintFeatures[feature[1]] = priority;
	}
	,shouldPaintFeature: function(feature,priority) {
		if(priority == null) priority = 1;
		return this.getFeaturePaintPriority(feature) <= priority;
	}
	,getFeaturePaintPriority: function(feature) {
		return this.paintFeatures[feature[1]];
	}
	,lastIndex: function() {
		return this.measures[this.measures.length - 1];
	}
	,__class__: alphatab.tablature.staves.StaveLine
}
alphatab.tablature.staves.StaveSpacing = function(size) {
	this.spacing = new Array();
	var _g = 0;
	while(_g < size) {
		var i = _g++;
		this.spacing.push(0);
	}
};
alphatab.tablature.staves.StaveSpacing.__name__ = true;
alphatab.tablature.staves.StaveSpacing.prototype = {
	getSize: function() {
		return this.get(this.spacing.length);
	}
	,set: function(index,value) {
		this.spacing[index] = Math.round(value);
	}
	,get: function(index) {
		var size = 0;
		var _g = 0;
		while(_g < index) {
			var i = _g++;
			size += this.spacing[i];
		}
		return size;
	}
	,__class__: alphatab.tablature.staves.StaveSpacing
}
alphatab.tablature.staves.TablatureStave = function(line,layout) {
	alphatab.tablature.staves.Stave.call(this,line,layout);
	this.spacing = new alphatab.tablature.staves.StaveSpacing(18);
	this.spacing.set(0,Math.floor(15 * layout.scale));
	this.spacing.set(11,Math.floor(10 * layout.scale));
	this.spacing.set(12,(line.track.stringCount() - 1) * layout.stringSpacing);
	this.spacing.set(13,Math.floor(10 * layout.scale));
	this.spacing.set(17,Math.floor(15 * layout.scale));
	line.setFeaturePaintPriority(alphatab.tablature.staves.StaveFeatures.TimeSignature);
	this._rangeIndices = [0,0];
};
alphatab.tablature.staves.TablatureStave.__name__ = true;
alphatab.tablature.staves.TablatureStave.paintTie = function(layout,layer,x1,y1,x2,y2,down) {
	if(down == null) down = false;
	var offset = 15 * layout.scale;
	var size = 4 * layout.scale;
	var normalVector = { x : y2 - y1, y : x2 - x1};
	var length = Math.sqrt(normalVector.x * normalVector.x + normalVector.y * normalVector.y);
	if(down) normalVector.x *= -1; else normalVector.y *= -1;
	normalVector.x /= length;
	normalVector.y /= length;
	var center = { x : (x2 + x1) / 2, y : (y2 + y1) / 2};
	var cp1 = { x : center.x + offset * normalVector.x, y : center.y + offset * normalVector.y};
	var cp2 = { x : center.x + (offset - size) * normalVector.x, y : center.y + (offset - size) * normalVector.y};
	layer.startFigure();
	layer.moveTo(x1,y1);
	layer.quadraticCurveTo(cp1.x,cp1.y,x2,y2);
	layer.quadraticCurveTo(cp2.x,cp2.y,x1,y1);
	layer.closeFigure();
}
alphatab.tablature.staves.TablatureStave.__super__ = alphatab.tablature.staves.Stave;
alphatab.tablature.staves.TablatureStave.prototype = $extend(alphatab.tablature.staves.Stave.prototype,{
	paintStroke: function(layout,context,beat,x,y) {
		if(beat.effect.stroke.direction == 0) return;
		x -= Math.floor(2 * layout.scale);
		var topY = y + this.spacing.get(12);
		var bottomY = topY + ((beat.measure.track.stringCount() - 1) * layout.stringSpacing | 0);
		var layer = context.get(4);
		layer.startFigure();
		layer.startFigure();
		layer.addLine(x,topY,x,bottomY);
		if(beat.effect.stroke.direction == 1) {
			layer.addLine(x,topY,x + 3,topY + 5);
			layer.addLine(x,topY,x - 3,topY + 5);
		} else {
			layer.addLine(x,bottomY,x + 3,bottomY - 5);
			layer.addLine(x,bottomY,x - 3,bottomY - 5);
		}
	}
	,paintFadeIn: function(layout,context,beat,x,y) {
		if(!beat.effect.fadeIn) return;
		y += this.spacing.get(7);
		var size = Math.round(4.0 * layout.scale);
		var width = beat.fullWidth();
		var layer = context.get(12);
		layer.startFigure();
		layer.addBezier(x,y,x,y,x + width,y,x + width,y - size);
		layer.startFigure();
		layer.addBezier(x,y,x,y,x + width,y,x + width,y + size);
	}
	,paintTabSlapPop: function(layout,context,beat,x,y) {
		var fill = context.get(10);
		var realY = y + this.spacing.get(2);
		if(beat.effect.tapping) fill.addString("T",alphatab.tablature.drawing.DrawingResources.defaultFont,x,realY); else if(beat.effect.slapping) fill.addString("S",alphatab.tablature.drawing.DrawingResources.defaultFont,x,realY); else if(beat.effect.popping) fill.addString("P",alphatab.tablature.drawing.DrawingResources.defaultFont,x,realY);
	}
	,paintBeatVibrato: function(layout,context,beat,x,y) {
		if(!beat.effect.vibrato) return;
		var width = beat.fullWidth();
		this.paintVibrato(layout,context.get(10),x,y + this.spacing.get(5),width,1);
	}
	,paintTremoloBar: function(layout,context,note,x,y) {
		if(note == null) return;
		var beat = note.voice.beat;
		if(!beat.effect.isTremoloBar()) return;
		var scale = layout.scale;
		y = y + this.spacing.get(12) + ((note.string - 1) * layout.stringSpacing | 0);
		x += Math.floor(note.noteSize.x);
		var endX = x + beat.fullWidth();
		var minY = y - 60 * scale;
		var fill = note.voice.index == 0?context.get(10):context.get(6);
		var draw = note.voice.index == 0?context.get(11):context.get(7);
		if(beat.effect.tremoloBar.points.length >= 2) {
			var dX = (endX - x) / 12;
			var dY = (y - minY) / 12;
			draw.startFigure();
			var _g1 = 0, _g = beat.effect.tremoloBar.points.length - 1;
			while(_g1 < _g) {
				var i = _g1++;
				var firstPt = beat.effect.tremoloBar.points[i];
				var secondPt = beat.effect.tremoloBar.points[i + 1];
				if(firstPt.value == secondPt.value && i == beat.effect.tremoloBar.points.length - 2) continue;
				var firstLoc = new alphatab.model.Point(x + dX * firstPt.position,y - dY * firstPt.value);
				var secondLoc = new alphatab.model.Point(x + dX * secondPt.position,y - dY * secondPt.value);
				draw.addLine(firstLoc.x,firstLoc.y,secondLoc.x,secondLoc.y);
				if(secondPt.value != 0) {
					var dV = secondPt.value * 0.5;
					var up = secondPt.value - firstPt.value >= 0;
					var s = "";
					if(dV < 0) s += "-";
					if(dV >= 1 || dV <= -1) s += Std.string(Math.floor(Math.abs(dV))) + " "; else if(dV < 0) s += "-";
					dV -= Math.floor(dV);
					if(dV == 0.25) s += "1/4"; else if(dV == 0.5) s += "1/2"; else if(dV == 0.75) s += "3/4";
					context.graphics.set_font(alphatab.tablature.drawing.DrawingResources.defaultFont);
					var size = context.graphics.measureText(s);
					var sY = up?secondLoc.y - alphatab.tablature.drawing.DrawingResources.defaultFontHeight - 3 * scale:secondLoc.y + 3 * scale;
					var sX = secondLoc.x - size / 2;
					fill.addString(s,alphatab.tablature.drawing.DrawingResources.defaultFont,sX,sY);
				}
			}
		}
	}
	,paintBeatEffects: function(layout,context,beat,x,y) {
		this.paintTremoloBar(layout,context,beat.getMinNote(),x,y);
		this.paintBeatVibrato(layout,context,beat,x,y);
		this.paintTabSlapPop(layout,context,beat,x,y);
		this.paintFadeIn(layout,context,beat,x,y);
		this.paintStroke(layout,context,beat,x,y);
	}
	,paintSlides: function(layout,context,note,x,y) {
		if(!note.effect.slide) return;
		var xOffset = note.noteSize.x * 2;
		var xMove = 15.0 * layout.scale;
		var yMove = 3.0 * layout.scale;
		var draw = note.voice.index == 0?context.get(11):context.get(7);
		draw.startFigure();
		if(note.effect.slideType == 4) draw.addLine(x - xMove,y + yMove,x,y - yMove); else if(note.effect.slideType == 5) draw.addLine(x - xMove,y - yMove,x,y + yMove); else if(note.effect.slideType == 2) draw.addLine(x + xOffset,y - yMove,x + xOffset + xMove,y + yMove); else if(note.effect.slideType == 3) draw.addLine(x + xOffset,y + yMove,x + xOffset + xMove,y - yMove); else {
			var nextBeat = note.voice.beat.getNextBeat();
			var nextNote = nextBeat == null?null:nextBeat.getNote(note.voice.index,note.string);
			if(nextNote != null) {
				if(nextNote.value < note.value) draw.addLine(x + xOffset,y - yMove,x + note.voice.beat.fullWidth(),y + yMove); else if(nextNote.value > note.value) draw.addLine(x + xOffset,y + yMove,x + note.voice.beat.fullWidth(),y - yMove); else draw.addLine(x + xOffset,y,x + note.voice.beat.fullWidth(),y);
				if(note.effect.slideType == 1) {
					this.paintHammerOn(layout,context,note,x,y);
					var down = note.string > 3;
					var realX = x + note.noteSize.x / 2;
					var realY = down?y + alphatab.tablature.drawing.DrawingResources.noteFontHeight / 2:y - alphatab.tablature.drawing.DrawingResources.noteFontHeight / 2;
					var endX = nextNote != null?x + note.voice.beat.fullWidth() + nextNote.noteSize.x / 2:realX + 15 * layout.scale;
					var fill = note.voice.index == 0?context.get(10):context.get(6);
					alphatab.tablature.staves.TablatureStave.paintTie(layout,fill,realX,realY,endX,realY,down);
				}
			} else draw.addLine(x + xOffset,y,x + note.voice.beat.fullWidth(),y);
		}
	}
	,paintBend: function(layout,context,note,x,y) {
		if(!note.effect.isBend()) return;
		var scale = layout.scale;
		x += Math.floor(note.noteSize.x);
		var endX = x + note.voice.beat.fullWidth();
		var minY = y - 60 * scale;
		var fill = note.voice.index == 0?context.get(10):context.get(6);
		var draw = note.voice.index == 0?context.get(11):context.get(7);
		if(note.effect.bend.points.length >= 2) {
			var dX = (endX - x) / 12;
			var dY = (y - minY) / 12;
			draw.startFigure();
			var _g1 = 0, _g = note.effect.bend.points.length - 1;
			while(_g1 < _g) {
				var i = _g1++;
				var firstPt = note.effect.bend.points[i];
				var secondPt = note.effect.bend.points[i + 1];
				if(firstPt.value == secondPt.value && i == note.effect.bend.points.length - 2) continue;
				var firstLoc = new alphatab.model.Point(x + dX * firstPt.position,y - dY * firstPt.value);
				var secondLoc = new alphatab.model.Point(x + dX * secondPt.position,y - dY * secondPt.value);
				var firstHelper = new alphatab.model.Point(firstLoc.x + (secondLoc.x - firstLoc.x),y - dY * firstPt.value);
				draw.addBezier(firstLoc.x,firstLoc.y,firstHelper.x,firstHelper.y,secondLoc.x,secondLoc.y,secondLoc.x,secondLoc.y);
				var arrowSize = 3 * scale;
				if(secondPt.value > firstPt.value) {
					draw.addLine(secondLoc.x - 0.5,secondLoc.y,secondLoc.x - arrowSize - 0.5,secondLoc.y + arrowSize);
					draw.addLine(secondLoc.x - 0.5,secondLoc.y,secondLoc.x + arrowSize - 0.5,secondLoc.y + arrowSize);
				} else if(secondPt.value != firstPt.value) {
					draw.addLine(secondLoc.x - 0.5,secondLoc.y,secondLoc.x - arrowSize - 0.5,secondLoc.y - arrowSize);
					draw.addLine(secondLoc.x - 0.5,secondLoc.y,secondLoc.x + arrowSize - 0.5,secondLoc.y - arrowSize);
				}
				if(secondPt.value != 0) {
					var dV = (secondPt.value - firstPt.value) * 0.25;
					var up = dV > 0;
					dV = Math.abs(dV);
					var s = "";
					if(dV == 1) s = "full"; else if(dV > 1) {
						s += Std.string(Math.floor(dV)) + " ";
						dV -= Math.floor(dV);
					}
					if(dV == 0.25) s += "1/4"; else if(dV == 0.5) s += "1/2"; else if(dV == 0.75) s += "3/4";
					context.graphics.set_font(alphatab.tablature.drawing.DrawingResources.defaultFont);
					var size = context.graphics.measureText(s);
					var y1 = up?secondLoc.y - alphatab.tablature.drawing.DrawingResources.defaultFontHeight + 2 * scale:secondLoc.y + alphatab.tablature.drawing.DrawingResources.defaultFontHeight / 2 + 2 * scale;
					var x1 = secondLoc.x - size / 2;
					fill.addString(s,alphatab.tablature.drawing.DrawingResources.defaultFont,x1,y1);
				}
			}
		}
	}
	,paintHammerOn: function(layout,context,note,x,y) {
		if(!note.effect.hammer) return;
		var nextBeat = note.voice.beat.getNextBeat();
		var nextNote = nextBeat == null?null:nextBeat.getNote(note.voice.index,note.string);
		var down = note.string > 3 || nextNote == null;
		var fill = note.voice.index == 0?context.get(10):context.get(6);
		var realX = x + note.noteSize.x / 2;
		var realY = down?y + alphatab.tablature.drawing.DrawingResources.noteFontHeight / 2:y - alphatab.tablature.drawing.DrawingResources.noteFontHeight / 2;
		var endX = nextNote != null?x + note.voice.beat.fullWidth() + nextNote.noteSize.x / 2:realX + 15 * layout.scale;
		alphatab.tablature.staves.TablatureStave.paintTie(layout,fill,realX,realY,endX,realY,down);
	}
	,paintFingering: function(layout,context,voice,x,y) {
		if(voice.effectsCache.fingering == 0) return;
		y += Math.round(alphatab.tablature.drawing.DrawingResources.effectFontHeight / 2);
		var fill = voice.index == 0?context.get(10):context.get(6);
		var y2 = y + this.spacing.get(16);
		var _g = 0, _g1 = voice.effectsCache.leftHandFingering;
		while(_g < _g1.length) {
			var fingering = _g1[_g];
			++_g;
			if(fingering != -2 && fingering != -1) {
				var str = "";
				switch(fingering) {
				case 0:
					str = "T";
					break;
				case 1:
					str = "1";
					break;
				case 2:
					str = "2";
					break;
				case 3:
					str = "3";
					break;
				case 4:
					str = "4";
					break;
				}
				fill.addString(str,alphatab.tablature.drawing.DrawingResources.effectFont,x,y2);
			}
			y2 += Math.floor(layout.effectSpacing);
		}
		var _g = 0, _g1 = voice.effectsCache.rightHandFingering;
		while(_g < _g1.length) {
			var fingering = _g1[_g];
			++_g;
			if(fingering != -2 && fingering != -1) {
				var str = "";
				switch(fingering) {
				case 0:
					str = "p";
					break;
				case 1:
					str = "i";
					break;
				case 2:
					str = "m";
					break;
				case 3:
					str = "a";
					break;
				case 4:
					str = "c";
					break;
				}
				fill.addString(str,alphatab.tablature.drawing.DrawingResources.effectFont,x,y2);
			}
			y2 += Math.floor(layout.effectSpacing);
		}
	}
	,paintHarmonics: function(layout,context,voice,x,y) {
		if(!voice.effectsCache.harmonic) return;
		var key = "";
		switch(voice.effectsCache.harmonicType) {
		case 0:
			key = "Harm";
			break;
		case 1:
			key = "A.H";
			break;
		case 2:
			key = "T.H";
			break;
		case 3:
			key = "P.H";
			break;
		case 4:
			key = "S.H";
			break;
		}
		var fill = voice.index == 0?context.get(10):context.get(6);
		fill.addString(key,alphatab.tablature.drawing.DrawingResources.effectFont,x,y + this.spacing.get(8));
	}
	,paintTrillBeat: function(layout,context,voice,x,y) {
		if(!voice.effectsCache.trill) return;
		var fill = voice.index == 0?context.get(10):context.get(6);
		fill.addString("Tr",alphatab.tablature.drawing.DrawingResources.effectFont,x,y + this.spacing.get(6));
	}
	,paintTrillNote: function(layout,context,note,x,y) {
		if(!note.effect.isTrill()) return;
		var fill = note.voice.index == 0?context.get(10):context.get(6);
		var str = "(" + note.effect.trill.fret + ")";
		fill.addString(str,alphatab.tablature.drawing.DrawingResources.graceFont,x + 2 * note.noteSize.x,y);
	}
	,paintVibrato: function(layout,layer,x,y,w,symbolScale) {
		if(symbolScale == null) symbolScale = 1;
		var step = 18 * layout.scale * symbolScale;
		var loops = Math.floor(Math.max(1,w / step));
		var _g = 0;
		while(_g < loops) {
			var i = _g++;
			layer.addMusicSymbol(alphatab.tablature.drawing.MusicFont.VibratoLeftRight,x,y,layout.scale * symbolScale);
			x += Math.floor(step);
		}
	}
	,paintNoteVibrato: function(layout,context,voice,x,y) {
		if(!voice.effectsCache.vibrato) return;
		var fill = voice.index == 0?context.get(10):context.get(6);
		var width = voice.beat.fullWidth();
		this.paintVibrato(layout,fill,x,y + this.spacing.get(6),width,0.75);
	}
	,paintRange: function(layout,context,voice,startX,y,label,nextVoice,nextVoiceEffect,previousVoice,previousVoiceEffect,startOffsetIndex) {
		var endX = startX + voice.beat.fullWidth();
		var prevOnSameStaveLine = previousVoice != null && previousVoice.beat.measure.staveLine == voice.beat.measure.staveLine;
		var nextOnSameStaveLine = nextVoice != null && nextVoice.beat.measure.staveLine == voice.beat.measure.staveLine;
		var fill = voice.index == 0?context.get(9):context.get(5);
		var draw = voice.index == 0?context.get(12):context.get(8);
		draw.startFigure();
		y += alphatab.tablature.drawing.DrawingResources.effectFontHeight;
		var isEnd = !nextVoiceEffect || !nextOnSameStaveLine;
		if(isEnd) {
			var offset = 8 * layout.scale;
			endX -= offset;
		}
		if(!prevOnSameStaveLine || !previousVoiceEffect) {
			fill.addString(label,alphatab.tablature.drawing.DrawingResources.effectFont,startX,y);
			context.graphics.set_font(alphatab.tablature.drawing.DrawingResources.effectFont);
			var offset = context.graphics.measureText(label) + 4 * layout.scale;
			startX += offset;
			this._rangeIndices[startOffsetIndex] = startX;
		} else if(prevOnSameStaveLine && voice.beat == voice.beat.measure.beats[0]) startX -= previousVoice.beat.measure.getDefaultSpacings(layout);
		if(isEnd) {
			draw.startFigure();
			draw.addDashedLine(this._rangeIndices[startOffsetIndex],y,endX,y);
			var size = 8 * layout.scale;
			draw.startFigure();
			draw.addLine(endX,y - size / 2,endX,y + size / 2);
		}
	}
	,paintPalmMute: function(layout,context,voice,x,y) {
		if(!voice.effectsCache.palmMute) return;
		var realY = y + this.spacing.get(4);
		var nextVoice = voice.getNextVoice();
		var previousVoice = voice.getPreviousVoice();
		var nextVoicePm = nextVoice != null && nextVoice.effectsCache.palmMute;
		var previousVoicePm = previousVoice != null && previousVoice.effectsCache.palmMute;
		this.paintRange(layout,context,voice,x,realY,"P.M.",nextVoice,nextVoicePm,previousVoice,previousVoicePm,1);
	}
	,paintLetRing: function(layout,context,voice,x,y) {
		if(!voice.effectsCache.letRing) return;
		var realY = y + this.spacing.get(3);
		var nextVoice = voice.getNextVoice();
		var previousVoice = voice.getPreviousVoice();
		var nextVoiceRing = nextVoice != null && nextVoice.effectsCache.letRing;
		var previousVoiceRing = previousVoice != null && previousVoice.effectsCache.letRing;
		this.paintRange(layout,context,voice,x,realY,"ring",nextVoice,nextVoiceRing,previousVoice,previousVoiceRing,0);
	}
	,paintAccentuatedNote: function(layout,context,voice,x,y) {
		if(!voice.effectsCache.accentuatedNote && !voice.effectsCache.heavyAccentuatedNote) return;
		var realX = x + voice.minNote.noteSize.x / 2;
		var realY = y + this.spacing.get(1);
		var layer = voice.index == 0?context.get(9):context.get(5);
		var symbol = voice.effectsCache.accentuatedNote?alphatab.tablature.drawing.MusicFont.AccentuatedNote:alphatab.tablature.drawing.MusicFont.HeavyAccentuatedNote;
		layer.addMusicSymbol(symbol,realX,realY,layout.scale);
	}
	,paintGrace: function(layout,context,note,x,y) {
		if(!note.effect.isGrace()) return;
		var fill = note.voice.index == 0?context.get(10):context.get(6);
		var value = note.effect.grace.isDead?"X":Std.string(note.effect.grace.fret);
		fill.addString(value,alphatab.tablature.drawing.DrawingResources.graceFont,x - Math.round(7 * layout.scale),y);
	}
	,paintEffects: function(layout,context,note,x,y,noteY) {
		this.paintGrace(layout,context,note,x,noteY);
		this.paintHammerOn(layout,context,note,x,noteY);
		this.paintBend(layout,context,note,x,noteY);
		this.paintSlides(layout,context,note,x,noteY);
		this.paintTrillNote(layout,context,note,x,noteY);
	}
	,paintVoiceEffects: function(layout,context,voice,x,y) {
		if(voice.isEmpty || voice.isRestVoice()) return;
		this.paintAccentuatedNote(layout,context,voice,x,y);
		this.paintLetRing(layout,context,voice,x,y);
		this.paintPalmMute(layout,context,voice,x,y);
		this.paintNoteVibrato(layout,context,voice,x,y);
		this.paintHarmonics(layout,context,voice,x,y);
		this.paintFingering(layout,context,voice,x,y);
		this.paintTrillBeat(layout,context,voice,x,y);
	}
	,getNoteTablaturePosY: function(layout,note) {
		return this.spacing.get(12) + ((note.string - 1) * layout.stringSpacing | 0);
	}
	,paintNote: function(layout,context,note,x,y) {
		var tabX = note.noteSize.x / 2;
		var realX = x;
		var realY = y + this.getNoteTablaturePosY(layout,note);
		realX += alphatab.tablature.drawing.DrawingResources.getScoreNoteSize(layout,false).x / 2 | 0;
		var fill = note.voice.index == 0?context.get(9):context.get(5);
		if(!note.isTiedNote) {
			var visualNote = note.effect.deadNote?"X":Std.string(note.value);
			visualNote = note.effect.ghostNote?"(" + visualNote + ")":visualNote;
			context.graphics.set_font(alphatab.tablature.drawing.DrawingResources.noteFont);
			var w = context.graphics.measureText(visualNote);
			fill.addString(visualNote,alphatab.tablature.drawing.DrawingResources.noteFont,realX - w / 2,realY);
		} else if(note.voice.beat.isFirstOfLine()) {
			var visualNote = "(" + note.value + ")";
			context.graphics.set_font(alphatab.tablature.drawing.DrawingResources.noteFont);
			var w = context.graphics.measureText(visualNote);
			fill.addString(visualNote,alphatab.tablature.drawing.DrawingResources.noteFont,realX - w / 2,realY);
		}
		this.paintEffects(layout,context,note,x,y,realY);
	}
	,calculateBeamY: function(layout,beatGroup,direction,x,key,clef) {
		var maxDistance = Math.round(10 * layout.scale);
		var upOffset = 0;
		var downOffset = 0;
		var y;
		var x1;
		var x2;
		var y1;
		var y2;
		if(direction == 2) {
			if(beatGroup.minNote != beatGroup.firstMinNote && beatGroup.minNote != beatGroup.lastMinNote) return this.getNoteTablaturePosY(layout,beatGroup.minNote) + downOffset;
			y = 0;
			x1 = beatGroup.firstMinNote.voice.beat.fullX();
			x2 = beatGroup.lastMinNote.voice.beat.fullX();
			y1 = Math.round(this.getNoteTablaturePosY(layout,beatGroup.firstMinNote) + downOffset);
			y2 = Math.round(this.getNoteTablaturePosY(layout,beatGroup.lastMinNote) + downOffset);
			if(y1 > y2 && y1 - y2 > maxDistance) y2 = y1 - maxDistance;
			if(y2 > y1 && y2 - y1 > maxDistance) y1 = y2 - maxDistance;
			if(y1 - y2 != 0 && x1 - x2 != 0 && x1 - x != 0) y = Math.round((y1 - y2) / (x1 - x2) * (x1 - x));
			return y1 - y;
		} else {
			if(beatGroup.maxNote != beatGroup.firstMaxNote && beatGroup.maxNote != beatGroup.lastMaxNote) return this.getNoteTablaturePosY(layout,beatGroup.maxNote) - upOffset;
			y = 0;
			x1 = beatGroup.firstMaxNote.voice.beat.fullX();
			x2 = beatGroup.lastMaxNote.voice.beat.fullX();
			y1 = Math.round(this.getNoteTablaturePosY(layout,beatGroup.firstMaxNote) - upOffset);
			y2 = Math.round(this.getNoteTablaturePosY(layout,beatGroup.lastMaxNote) - upOffset);
			if(y1 < y2 && y2 - y1 > maxDistance) y2 = y1 + maxDistance;
			if(y2 < y1 && y1 - y2 > maxDistance) y1 = y2 + maxDistance;
			if(y1 - y2 != 0 && x1 - x2 != 0 && x1 - x != 0) y = Math.round((y1 - y2) / (x1 - x2) * (x1 - x));
			return y1 - y;
		}
	}
	,paintBeam: function(layout,context,voice,x,y) {
		if(voice.isRestVoice() || this.line.tablature.getStaveSetting("tablature","rhythm",false) == false) return;
		var fill = voice.index == 0?context.get(9):context.get(5);
		var draw = voice.index == 0?context.get(12):context.get(8);
		if(voice.duration.value >= alphatab.model.Duration.HALF) {
			var key = voice.beat.measure.header.keySignature;
			var clef = voice.beat.measure.clef;
			var xMove = voice.maxStringNote.noteSize.x / 2;
			var y1 = Math.floor(y + this.getNoteTablaturePosY(layout,voice.maxStringNote) + layout.stringSpacing / 1.5);
			var y2 = y + this.spacing.get(16);
			draw.addLine(x + xMove,y1,x + xMove,y2);
			if(voice.duration.value >= alphatab.model.Duration.QUARTER) {
				var index = voice.duration.index() - 2;
				if(index > 0) {
					var startX;
					var endX;
					if(voice.joinedType == alphatab.tablature.model.JoinedType.NoneRight) {
						startX = Math.round(x + xMove);
						endX = Math.round(x + 6 * layout.scale + xMove);
					} else if(voice.joinedType == alphatab.tablature.model.JoinedType.NoneLeft) {
						startX = Math.round(x - 6 * layout.scale + xMove);
						endX = Math.round(x + xMove);
					} else {
						startX = Math.round(voice.leftJoin.beat.fullX() + xMove);
						endX = Math.round(voice.rightJoin.beat.fullX() + voice.rightJoin.maxStringNote.noteSize.x / 2);
					}
					alphatab.tablature.drawing.NotePainter.paintBar(fill,startX,y2,endX,y2,index,1,layout.scale);
				}
			}
		}
	}
	,paintVoice: function(layout,context,voice,x,y) {
		if(!voice.isEmpty) {
			var _g = 0, _g1 = voice.notes;
			while(_g < _g1.length) {
				var note = _g1[_g];
				++_g;
				this.paintNote(layout,context,note,x,y);
			}
			this.paintBeam(layout,context,voice,x,y);
			this.paintVoiceEffects(layout,context,voice,x,y);
		}
	}
	,paintBeat: function(layout,context,beat,x,y) {
		var _g = 0, _g1 = beat.voices;
		while(_g < _g1.length) {
			var voice = _g1[_g];
			++_g;
			this.paintVoice(layout,context,voice,x,y);
		}
		this.paintBeatEffects(layout,context,beat,x,y);
	}
	,paintBeats: function(layout,context,measure,x,y) {
		var _g = 0, _g1 = measure.beats;
		while(_g < _g1.length) {
			var beat = _g1[_g];
			++_g;
			var bd = beat;
			this.paintBeat(layout,context,bd,x + bd.x,y);
		}
	}
	,paintTimeSignature: function(layout,context,measure,x,y) {
		if(!measure.header.shouldPaintTimeSignature(measure) || !this.line.shouldPaintFeature(alphatab.tablature.staves.StaveFeatures.TimeSignature) || this.line.track.stringCount() < 3) return;
		y += this.spacing.get(12);
		var numberSpacing = 2 * layout.scale | 0;
		var tablatureHeight = this.spacing.spacing[12];
		var numberSize = tablatureHeight / 2 - numberSpacing * 2 | 0;
		var numberScale = numberSize / 15;
		var x1 = x + measure.calculateClefSpacing(layout) + measure.calculateKeySignatureSpacing(layout) + Math.floor(15 * layout.scale);
		var x2 = x1;
		var y1 = numberSpacing;
		var y2 = tablatureHeight - numberSize - numberSpacing;
		if(measure.header.timeSignature.numerator > 9 && measure.header.timeSignature.denominator.value < 10) x2 += Math.round(10 * numberScale / 2);
		if(measure.header.timeSignature.numerator < 10 && measure.header.timeSignature.denominator.value > 9) x1 += Math.round(10 * numberScale / 2);
		this.paintTimeSignatureNumber(layout,context,measure.header.timeSignature.numerator,x1,y + y1,numberScale);
		this.paintTimeSignatureNumber(layout,context,measure.header.timeSignature.denominator.value,x2,y + y2,numberScale);
	}
	,paintClef: function(layout,context,measure,x,y) {
		if(!measure.isFirstOfLine()) return;
	}
	,paintMeasure: function(layout,context,measure,x,y) {
		var realX = x + measure.x;
		var w = measure.width + measure.spacing;
		this.paintTimeSignature(layout,context,measure,realX,y);
		this.paintDivisions(layout,context,measure,realX,y,5,this.spacing.get(12),this.spacing.spacing[12]);
		this.paintClef(layout,context,measure,realX,y);
		realX += measure.getDefaultSpacings(layout);
		this.paintBeats(layout,context,measure,realX,y);
	}
	,paintStave: function(layout,context,x,y) {
		var lineY = y + this.spacing.get(12);
		var _g1 = 0, _g = this.line.track.stringCount();
		while(_g1 < _g) {
			var i = _g1++;
			context.get(2).startFigure();
			context.get(2).addLine(x,lineY,x + this.line.width,lineY);
			lineY += layout.stringSpacing;
		}
	}
	,prepare: function(measure) {
		if(measure.effectsCache.accentuatedNote) this.spacing.set(1,this.layout.effectSpacing);
		if(measure.effectsCache.letRing) this.spacing.set(3,this.layout.effectSpacing);
		if(measure.effectsCache.tapSlapPop) this.spacing.set(2,this.layout.effectSpacing);
		if(measure.effectsCache.palmMute) this.spacing.set(4,this.layout.effectSpacing);
		if(measure.effectsCache.harmonic) this.spacing.set(8,this.layout.effectSpacing);
		if(measure.effectsCache.beatVibrato) this.spacing.set(5,this.layout.effectSpacing);
		if(measure.effectsCache.vibrato) this.spacing.set(6,this.layout.effectSpacing);
		if(measure.effectsCache.fadeIn) this.spacing.set(7,this.layout.effectSpacing);
		if(this.line.tablature.getStaveSetting("tablature","rhythm",false) == true) this.spacing.set(15,20 * this.layout.scale);
		if(measure.effectsCache.bend) {
			if(this.spacing.spacing[9] < measure.effectsCache.bendOverflow) this.spacing.set(9,measure.effectsCache.bendOverflow);
		}
		if(measure.effectsCache.fingering > 0) {
			var fingeringSpacing = measure.effectsCache.fingering * this.layout.effectSpacing;
			if(this.spacing.spacing[16] < fingeringSpacing) this.spacing.set(16,fingeringSpacing);
		}
		if(measure.effectsCache.tremoloBar) {
			if(this.spacing.spacing[10] < measure.effectsCache.tremoloBarTopOverflow) this.spacing.set(10,measure.effectsCache.tremoloBarTopOverflow);
			if(this.spacing.spacing[14] < measure.effectsCache.tremoloBarBottomOverflow) this.spacing.set(14,measure.effectsCache.tremoloBarBottomOverflow);
		}
	}
	,getLineBottomSpacing: function() {
		return 13;
	}
	,getLineTopSpacing: function() {
		return 12;
	}
	,getBarBottomSpacing: function() {
		return 14;
	}
	,getBarTopSpacing: function() {
		return 11;
	}
	,getStaveId: function() {
		return "tablature";
	}
	,__class__: alphatab.tablature.staves.TablatureStave
});
var haxe = {}
haxe.ds = {}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,__class__: haxe.ds.StringMap
}
haxe.xml = {}
haxe.xml._Fast = {}
haxe.xml._Fast.NodeAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.NodeAccess.__name__ = true;
haxe.xml._Fast.NodeAccess.prototype = {
	resolve: function(name) {
		var x = this.__x.elementsNamed(name).next();
		if(x == null) {
			var xname = this.__x.nodeType == Xml.Document?"Document":this.__x.get_nodeName();
			throw xname + " is missing element " + name;
		}
		return new haxe.xml.Fast(x);
	}
	,__class__: haxe.xml._Fast.NodeAccess
}
haxe.xml._Fast.AttribAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.AttribAccess.__name__ = true;
haxe.xml._Fast.AttribAccess.prototype = {
	resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		var v = this.__x.get(name);
		if(v == null) throw this.__x.get_nodeName() + " is missing attribute " + name;
		return v;
	}
	,__class__: haxe.xml._Fast.AttribAccess
}
haxe.xml._Fast.HasAttribAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.HasAttribAccess.__name__ = true;
haxe.xml._Fast.HasAttribAccess.prototype = {
	resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		return this.__x.exists(name);
	}
	,__class__: haxe.xml._Fast.HasAttribAccess
}
haxe.xml._Fast.HasNodeAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.HasNodeAccess.__name__ = true;
haxe.xml._Fast.HasNodeAccess.prototype = {
	resolve: function(name) {
		return this.__x.elementsNamed(name).hasNext();
	}
	,__class__: haxe.xml._Fast.HasNodeAccess
}
haxe.xml._Fast.NodeListAccess = function(x) {
	this.__x = x;
};
haxe.xml._Fast.NodeListAccess.__name__ = true;
haxe.xml._Fast.NodeListAccess.prototype = {
	resolve: function(name) {
		var l = new List();
		var $it0 = this.__x.elementsNamed(name);
		while( $it0.hasNext() ) {
			var x = $it0.next();
			l.add(new haxe.xml.Fast(x));
		}
		return l;
	}
	,__class__: haxe.xml._Fast.NodeListAccess
}
haxe.xml.Fast = function(x) {
	if(x.nodeType != Xml.Document && x.nodeType != Xml.Element) throw "Invalid nodeType " + Std.string(x.nodeType);
	this.x = x;
	this.node = new haxe.xml._Fast.NodeAccess(x);
	this.nodes = new haxe.xml._Fast.NodeListAccess(x);
	this.att = new haxe.xml._Fast.AttribAccess(x);
	this.has = new haxe.xml._Fast.HasAttribAccess(x);
	this.hasNode = new haxe.xml._Fast.HasNodeAccess(x);
};
haxe.xml.Fast.__name__ = true;
haxe.xml.Fast.prototype = {
	get_elements: function() {
		var it = this.x.elements();
		return { hasNext : $bind(it,it.hasNext), next : function() {
			var x = it.next();
			if(x == null) return null;
			return new haxe.xml.Fast(x);
		}};
	}
	,get_innerData: function() {
		var it = this.x.iterator();
		if(!it.hasNext()) throw this.get_name() + " does not have data";
		var v = it.next();
		var n = it.next();
		if(n != null) {
			if(v.nodeType == Xml.PCData && n.nodeType == Xml.CData && StringTools.trim(v.get_nodeValue()) == "") {
				var n2 = it.next();
				if(n2 == null || n2.nodeType == Xml.PCData && StringTools.trim(n2.get_nodeValue()) == "" && it.next() == null) return n.get_nodeValue();
			}
			throw this.get_name() + " does not only have data";
		}
		if(v.nodeType != Xml.PCData && v.nodeType != Xml.CData) throw this.get_name() + " does not have data";
		return v.get_nodeValue();
	}
	,get_name: function() {
		return this.x.nodeType == Xml.Document?"Document":this.x.get_nodeName();
	}
	,__class__: haxe.xml.Fast
}
haxe.xml.Parser = function() { }
haxe.xml.Parser.__name__ = true;
haxe.xml.Parser.parse = function(str) {
	var doc = Xml.createDocument();
	haxe.xml.Parser.doParse(str,0,doc);
	return doc;
}
haxe.xml.Parser.doParse = function(str,p,parent) {
	if(p == null) p = 0;
	var xml = null;
	var state = 1;
	var next = 1;
	var aname = null;
	var start = 0;
	var nsubs = 0;
	var nbrackets = 0;
	var c = str.charCodeAt(p);
	var buf = new StringBuf();
	while(!(c != c)) {
		switch(state) {
		case 0:
			switch(c) {
			case 10:case 13:case 9:case 32:
				break;
			default:
				state = next;
				continue;
			}
			break;
		case 1:
			switch(c) {
			case 60:
				state = 0;
				next = 2;
				break;
			default:
				start = p;
				state = 13;
				continue;
			}
			break;
		case 13:
			if(c == 60) {
				var child = Xml.createPCData(buf.b + HxOverrides.substr(str,start,p - start));
				buf = new StringBuf();
				parent.addChild(child);
				nsubs++;
				state = 0;
				next = 2;
			} else if(c == 38) {
				buf.addSub(str,start,p - start);
				state = 18;
				next = 13;
				start = p + 1;
			}
			break;
		case 17:
			if(c == 93 && str.charCodeAt(p + 1) == 93 && str.charCodeAt(p + 2) == 62) {
				var child = Xml.createCData(HxOverrides.substr(str,start,p - start));
				parent.addChild(child);
				nsubs++;
				p += 2;
				state = 1;
			}
			break;
		case 2:
			switch(c) {
			case 33:
				if(str.charCodeAt(p + 1) == 91) {
					p += 2;
					if(HxOverrides.substr(str,p,6).toUpperCase() != "CDATA[") throw "Expected <![CDATA[";
					p += 5;
					state = 17;
					start = p + 1;
				} else if(str.charCodeAt(p + 1) == 68 || str.charCodeAt(p + 1) == 100) {
					if(HxOverrides.substr(str,p + 2,6).toUpperCase() != "OCTYPE") throw "Expected <!DOCTYPE";
					p += 8;
					state = 16;
					start = p + 1;
				} else if(str.charCodeAt(p + 1) != 45 || str.charCodeAt(p + 2) != 45) throw "Expected <!--"; else {
					p += 2;
					state = 15;
					start = p + 1;
				}
				break;
			case 63:
				state = 14;
				start = p;
				break;
			case 47:
				if(parent == null) throw "Expected node name";
				start = p + 1;
				state = 0;
				next = 10;
				break;
			default:
				state = 3;
				start = p;
				continue;
			}
			break;
		case 3:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				if(p == start) throw "Expected node name";
				xml = Xml.createElement(HxOverrides.substr(str,start,p - start));
				parent.addChild(xml);
				state = 0;
				next = 4;
				continue;
			}
			break;
		case 4:
			switch(c) {
			case 47:
				state = 11;
				nsubs++;
				break;
			case 62:
				state = 9;
				nsubs++;
				break;
			default:
				state = 5;
				start = p;
				continue;
			}
			break;
		case 5:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				var tmp;
				if(start == p) throw "Expected attribute name";
				tmp = HxOverrides.substr(str,start,p - start);
				aname = tmp;
				if(xml.exists(aname)) throw "Duplicate attribute";
				state = 0;
				next = 6;
				continue;
			}
			break;
		case 6:
			switch(c) {
			case 61:
				state = 0;
				next = 7;
				break;
			default:
				throw "Expected =";
			}
			break;
		case 7:
			switch(c) {
			case 34:case 39:
				state = 8;
				start = p;
				break;
			default:
				throw "Expected \"";
			}
			break;
		case 8:
			if(c == str.charCodeAt(start)) {
				var val = HxOverrides.substr(str,start + 1,p - start - 1);
				xml.set(aname,val);
				state = 0;
				next = 4;
			}
			break;
		case 9:
			p = haxe.xml.Parser.doParse(str,p,xml);
			start = p;
			state = 1;
			break;
		case 11:
			switch(c) {
			case 62:
				state = 1;
				break;
			default:
				throw "Expected >";
			}
			break;
		case 12:
			switch(c) {
			case 62:
				if(nsubs == 0) parent.addChild(Xml.createPCData(""));
				return p;
			default:
				throw "Expected >";
			}
			break;
		case 10:
			if(!(c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45)) {
				if(start == p) throw "Expected node name";
				var v = HxOverrides.substr(str,start,p - start);
				if(v != parent.get_nodeName()) throw "Expected </" + parent.get_nodeName() + ">";
				state = 0;
				next = 12;
				continue;
			}
			break;
		case 15:
			if(c == 45 && str.charCodeAt(p + 1) == 45 && str.charCodeAt(p + 2) == 62) {
				parent.addChild(Xml.createComment(HxOverrides.substr(str,start,p - start)));
				p += 2;
				state = 1;
			}
			break;
		case 16:
			if(c == 91) nbrackets++; else if(c == 93) nbrackets--; else if(c == 62 && nbrackets == 0) {
				parent.addChild(Xml.createDocType(HxOverrides.substr(str,start,p - start)));
				state = 1;
			}
			break;
		case 14:
			if(c == 63 && str.charCodeAt(p + 1) == 62) {
				p++;
				var str1 = HxOverrides.substr(str,start + 1,p - start - 2);
				parent.addChild(Xml.createProcessingInstruction(str1));
				state = 1;
			}
			break;
		case 18:
			if(c == 59) {
				var s = HxOverrides.substr(str,start,p - start);
				if(s.charCodeAt(0) == 35) {
					var i = s.charCodeAt(1) == 120?Std.parseInt("0" + HxOverrides.substr(s,1,s.length - 1)):Std.parseInt(HxOverrides.substr(s,1,s.length - 1));
					buf.b += Std.string(String.fromCharCode(i));
				} else if(!haxe.xml.Parser.escapes.exists(s)) buf.b += Std.string("&" + s + ";"); else buf.b += Std.string(haxe.xml.Parser.escapes.get(s));
				start = p + 1;
				state = next;
			}
			break;
		}
		c = str.charCodeAt(++p);
	}
	if(state == 1) {
		start = p;
		state = 13;
	}
	if(state == 13) {
		if(p != start || nsubs == 0) parent.addChild(Xml.createPCData(buf.b + HxOverrides.substr(str,start,p - start)));
		return p;
	}
	throw "Unexpected end";
}
var js = {}
js.Boot = function() { }
js.Boot.__name__ = true;
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
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
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) {
					if(cl == Array) return o.__enum__ == null;
					return true;
				}
				if(js.Boot.__interfLoop(o.__class__,cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true; else null;
		if(cl == Enum && o.__ename__ != null) return true; else null;
		return o.__enum__ == cl;
	}
}
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
}
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_, $fid = 0;
function $bind(o,m) { if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; };
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
}; else null;
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.prototype.__class__ = Array;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
Xml.Element = "element";
Xml.PCData = "pcdata";
Xml.CData = "cdata";
Xml.Comment = "comment";
Xml.DocType = "doctype";
Xml.ProcessingInstruction = "processingInstruction";
Xml.Document = "document";
alphatab.file.alphatex.AlphaTexParser.EOL = String.fromCharCode(0);
alphatab.file.alphatex.AlphaTexParser.TRACK_CHANNELS = [0,1];
alphatab.file.gpx.FileSystem.HEADER_BCFS = 1397113666;
alphatab.file.gpx.FileSystem.HEADER_BCFZ = 1514554178;
alphatab.file.guitarpro.GpReaderBase.DEFAULT_CHARSET = "UTF-8";
alphatab.file.guitarpro.GpReaderBase.BEND_POSITION = 60;
alphatab.file.guitarpro.GpReaderBase.BEND_SEMITONE = 25;
alphatab.io.BitInputStream.BYTE_SIZE = 8;
alphatab.io.DataOutputStream.LN2 = Math.log(2);
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
alphatab.midi.MidiMessageDataUtils.TICK_MOVE = 1;
alphatab.midi.MidiMessageFileUtils.TICK_MOVE = 1;
alphatab.midi.MidiMessageFileUtils.REST_MESSAGE = 0;
alphatab.midi.MidiSequenceParser.DEFAULT_BEND = 64;
alphatab.midi.MidiSequenceParser.DEFAULT_BEND_SEMITONE = 2.75;
alphatab.midi.MidiSequenceParser.DEFAULT_DURATION_DEAD = 30;
alphatab.midi.MidiSequenceParser.DEFAULT_DURATION_PM = 80;
alphatab.midi.MidiSequenceParser.DEFAULT_METRONOME_KEY = 37;
alphatab.midi.MidiSequenceParserFlags.ADD_DEFAULT_CONTROLS = 1;
alphatab.midi.MidiSequenceParserFlags.ADD_MIXER_MESSAGES = 2;
alphatab.midi.MidiSequenceParserFlags.ADD_METRONOME = 4;
alphatab.midi.MidiSequenceParserFlags.ADD_FIRST_TICK_MOVE = 8;
alphatab.midi.MidiSequenceParserFlags.DEFAULT_PLAY_FLAGS = 15;
alphatab.model.Beat.MAX_VOICES = 2;
alphatab.model.BeatStrokeDirection.None = 0;
alphatab.model.BeatStrokeDirection.Up = 1;
alphatab.model.BeatStrokeDirection.Down = 2;
alphatab.model.Color.Black = alphatab.model.Color.fromRgb(0,0,0);
alphatab.model.Color.Red = alphatab.model.Color.fromRgb(255,0,0);
alphatab.model.Duration.MIN_TIME = Math.floor(Math.floor(alphatab.model.Duration.QUARTER_TIME * (4.0 / alphatab.model.Duration.SIXTY_FOURTH)) * 2 / 3);
alphatab.model.Duration.QUARTER_TIME = 960;
alphatab.model.Duration.WHOLE = 1;
alphatab.model.Duration.HALF = 2;
alphatab.model.Duration.QUARTER = 4;
alphatab.model.Duration.EIGHTH = 8;
alphatab.model.Duration.SIXTEENTH = 16;
alphatab.model.Duration.THIRTY_SECOND = 32;
alphatab.model.Duration.SIXTY_FOURTH = 64;
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
alphatab.model.Lyrics.MAX_LINE_COUNT = 5;
alphatab.model.Marker.DEFAULT_COLOR = alphatab.model.Color.Red;
alphatab.model.Marker.DEFAULT_TITLE = "Untitled";
alphatab.model.Measure.DEFAULT_CLEF = 0;
alphatab.model.MeasureClef.Treble = 0;
alphatab.model.MeasureClef.Bass = 1;
alphatab.model.MeasureClef.Tenor = 2;
alphatab.model.MeasureClef.Alto = 3;
alphatab.model.MeasureHeader.DEFAULT_KEY_SIGNATURE = 0;
alphatab.model.MidiChannel.DEFAULT_PERCUSSION_CHANNEL = 9;
alphatab.model.MidiChannel.DEFAULT_INSTRUMENT = 25;
alphatab.model.MidiChannel.DEFAULT_VOLUME = 127;
alphatab.model.MidiChannel.DEFAULT_BALANCE = 64;
alphatab.model.MidiChannel.DEFAULT_CHORUS = 0;
alphatab.model.MidiChannel.DEFAULT_REVERB = 0;
alphatab.model.MidiChannel.DEFAULT_PHASER = 0;
alphatab.model.MidiChannel.DEFAULT_TREMOLO = 0;
alphatab.model.SlideType.FastSlideTo = 0;
alphatab.model.SlideType.SlowSlideTo = 1;
alphatab.model.SlideType.OutDownWards = 2;
alphatab.model.SlideType.OutUpWards = 3;
alphatab.model.SlideType.IntoFromBelow = 4;
alphatab.model.SlideType.IntoFromAbove = 5;
alphatab.model.TripletFeel.None = 0;
alphatab.model.TripletFeel.Eighth = 1;
alphatab.model.TripletFeel.Sixteenth = 2;
alphatab.model.Tuning.TUNING_REGEX = new EReg("([a-g]b?)([0-9])","i");
alphatab.model.Tuplet.NORMAL = new alphatab.model.Tuplet();
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
alphatab.model.VoiceDirection.None = 0;
alphatab.model.VoiceDirection.Up = 1;
alphatab.model.VoiceDirection.Down = 2;
alphatab.model.effects.BendEffect.SEMITONE_LENGTH = 1;
alphatab.model.effects.BendEffect.MAX_POSITION = 12;
alphatab.model.effects.BendEffect.MAX_VALUE = 12;
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
alphatab.model.effects.FingeringType.Unknown = -2;
alphatab.model.effects.FingeringType.NoOrDead = -1;
alphatab.model.effects.FingeringType.Thumb = 0;
alphatab.model.effects.FingeringType.IndexFinger = 1;
alphatab.model.effects.FingeringType.MiddleFinger = 2;
alphatab.model.effects.FingeringType.AnnularFinger = 3;
alphatab.model.effects.FingeringType.LittleFinger = 4;
alphatab.model.effects.GraceEffectTransition.None = 0;
alphatab.model.effects.GraceEffectTransition.Slide = 1;
alphatab.model.effects.GraceEffectTransition.Bend = 2;
alphatab.model.effects.GraceEffectTransition.Hammer = 3;
alphatab.model.effects.HarmonicEffect.NATURAL_FREQUENCIES = [[12,12],[9,28],[5,28],[7,19],[4,28],[3,31]];
alphatab.model.effects.HarmonicType.None = -1;
alphatab.model.effects.HarmonicType.Natural = 0;
alphatab.model.effects.HarmonicType.Artificial = 1;
alphatab.model.effects.HarmonicType.Tapped = 2;
alphatab.model.effects.HarmonicType.Pinch = 3;
alphatab.model.effects.HarmonicType.Semi = 4;
alphatab.platform.PlatformFactory.SVG_CANVAS = "svg";
alphatab.platform.svg.FontSizes.TIMES_NEW_ROMAN_11PT = [3,4,5,6,6,9,9,2,4,4,6,6,3,4,3,3,6,6,6,6,6,6,6,6,6,6,3,3,6,6,6,5,10,8,7,7,8,7,6,7,8,4,4,8,7,10,8,8,7,8,7,5,8,8,7,11,8,8,7,4,3,4,5,6,4,5,5,5,5,5,4,5,6,3,3,6,3,9,6,6,6,5,4,4,4,5,6,7,6,6,5,5,2,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,6,6,6,6,2,5,4,8,4,6,6,0,8,6,4,6,3,3,4,5,5,4,4,3,3,6,8,8,8,5,8,8,8,8,8,8,11,7,7,7,7,7,4,4,4,4,8,8,8,8,8,8,8,6,8,8,8,8,8,8,6,5,5,5,5,5,5,5,8,5,5,5,5,5,3,3,3,3,6,6,6,6,6,6,6,6,6,5,5,5,5,6,6];
alphatab.platform.svg.FontSizes.ARIAL_11PT = [3,2,4,6,6,10,7,2,4,4,4,6,3,4,3,3,6,6,6,6,6,6,6,6,6,6,3,3,6,6,6,6,11,8,7,7,7,6,6,8,7,2,5,7,6,8,7,8,6,8,7,7,6,7,8,10,7,8,7,3,3,3,5,6,4,6,6,6,6,6,4,6,6,2,2,5,2,8,6,6,6,6,4,6,3,6,6,10,6,6,6,4,2,4,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,6,6,7,6,2,6,4,8,4,6,6,0,8,6,4,6,4,4,4,6,6,4,4,4,5,6,9,10,10,6,8,8,8,8,8,8,11,7,6,6,6,6,2,2,2,2,8,7,8,8,8,8,8,6,8,7,7,7,7,8,7,7,6,6,6,6,6,6,10,6,6,6,6,6,2,2,2,2,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6];
alphatab.platform.svg.FontSizes.CONTROL_CHARS = 32;
alphatab.tablature.PageViewLayout.LAYOUT_ID = "page";
alphatab.tablature.PageViewLayout.PAGE_PADDING = new alphatab.model.Padding(20,40,20,40);
alphatab.tablature.PageViewLayout.WIDTH_ON_100 = 795;
alphatab.tablature.HorizontalViewLayout.LAYOUT_ID = "horizontal";
alphatab.tablature.HorizontalViewLayout.PAGE_PADDING = alphatab.tablature.PageViewLayout.PAGE_PADDING;
alphatab.tablature.Tablature.DEFAULT_LAYOUT = alphatab.tablature.PageViewLayout.LAYOUT_ID;
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
alphatab.tablature.drawing.MusicFont.Num0 = "M 0.00 7.99 C -0.00 10.44 0.57 13.08 2.37 14.84 4.18 16.54 7.44 16.36 8.93 14.32 10.61 12.22 10.97 9.39 10.78 6.78 10.62 4.66 9.96 2.42 8.31 0.97 6.53 -0.48 3.60 -0.29 2.11 1.49 0.53 3.25 -0.00 5.69 0.00 7.99 z M 5.46 15.13 C 4.46 15.17 3.80 14.18 3.64 13.29 3.03 10.66 3.00 7.93 3.19 5.25 3.32 3.95 3.53 2.57 4.31 1.48 4.74 0.87 5.67 0.62 6.26 1.14 c 0.83 0.69 1.03 1.84 1.25 2.84 0.43 2.46 0.39 4.99 0.13 7.47 -0.15 1.22 -0.44 2.57 -1.43 3.40 -0.21 0.15 -0.48 0.25 -0.75 0.26 z";
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
alphatab.tablature.drawing.MusicFont.Sticks = "m 4.23 4.91 l 3.65 3.65 0.62 -0.64 -3.62 -3.62 L 8.44 0.74 7.82 0.12 4.23 3.70 0.63 0.10 0 0.74 3.59 4.34 l -3.59 3.6 0.6 0.6 3.63 -3.63 z";
alphatab.tablature.drawing.MusicFont.HiHat = "m 9.00 6 q 0 0.70 -0.32 1.41 Q 8.35 8.13 7.75 8.71 7.14 9.30 6.44 9.63 5.74 9.95 5 10.00 q -0.73 0 -1.44 -0.32 Q 2.83 9.35 2.24 8.75 1.66 8.14 1.33 7.44 1.00 6.74 0.99 6 q 0 -0.73 0.32 -1.44 Q 1.64 3.83 2.24 3.24 2.85 2.66 3.55 2.33 4.25 2.00 5 1.99 5.73 2.02 6.44 2.35 7.16 2.67 7.75 3.28 8.33 3.88 8.66 4.58 8.99 5.28 9.00 6 z M 10 6 Q 10 5.10 9.59 4.20 9.18 3.31 8.43 2.56 7.68 1.81 6.80 1.42 5.92 1.03 5 1 4.10 1 3.20 1.40 2.31 1.81 1.56 2.56 0.81 3.31 0.42 4.19 0.03 5.07 0 6.03 0 6.92 0.40 7.82 0.81 8.71 1.56 9.45 2.31 10.18 3.19 10.57 4.07 10.96 5 11 5.94 10.96 6.84 10.56 7.73 10.15 8.45 9.42 9.16 8.68 9.57 7.80 9.98 6.92 10 6 z M 4.93 6.76 L 7.03 8.86 7.83 8.03 5.83 6 7.83 3.96 7.03 3.13 4.93 5.23 2.89 3.19 2.13 3.96 4.16 6 2.13 8.03 2.89 8.80 4.93 6.76 z";
alphatab.tablature.drawing.MusicFont.ChineseCymbal = "m 4.55 -4.03 l 5.46 5.48 -0.61 0.63 -4.88 -4.86 -4.85 4.85 -0.64 -0.61 5.53 -5.48 z m -0.03 9.94 l 2.99 2.97 1.37 -1.35 L 5.91 4.54 8.90 1.58 7.56 0.23 4.55 3.26 1.54 0.20 0.25 1.49 3.27 4.52 0.18 7.61 1.51 8.94 4.52 5.91 z";
alphatab.tablature.drawing.MusicFont.RideCymbal = "M 8 7 L 4 11 0 7 4 3 8 7 z m -1.44 0.44 l -3 -3 -2.12 2.12 3 3 2.12 -2.12 z";
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
alphatab.tablature.model.BeatGroup.SCORE_MIDDLE_KEYS = [55,40,40,50];
alphatab.tablature.model.MeasureDrawing.ACCIDENTAL_SHARP_NOTES = [0,0,1,1,2,3,3,4,4,5,5,6];
alphatab.tablature.model.MeasureDrawing.ACCIDENTAL_FLAT_NOTES = [0,1,1,2,2,3,4,4,5,5,6,6];
alphatab.tablature.model.MeasureDrawing.ACCIDENTAL_NOTES = [false,true,false,true,false,false,true,false,true,false,true,false];
alphatab.tablature.model.MeasureDrawing.NONE = 0;
alphatab.tablature.model.MeasureDrawing.NATURAL = 1;
alphatab.tablature.model.MeasureDrawing.SHARP = 2;
alphatab.tablature.model.MeasureDrawing.FLAT = 3;
alphatab.tablature.model.MeasureDrawing.ACCIDENTALS = [[1,1,1,1,1,1,1],[1,1,1,2,1,1,1],[2,1,1,2,1,1,1],[2,1,1,2,2,1,1],[2,2,1,2,2,1,1],[2,2,1,2,2,2,1],[2,2,2,2,2,2,1],[2,2,2,2,2,2,2],[1,1,1,1,1,1,3],[1,1,3,1,1,1,3],[1,1,3,1,1,3,3],[1,3,3,1,1,3,3],[1,3,3,1,3,3,3],[3,3,3,1,3,3,3],[3,3,3,3,3,3,3]];
alphatab.tablature.model.MeasureDrawing.CLEF_OFFSET = 40;
alphatab.tablature.model.MeasureDrawing.TIME_SIGNATURE_SPACING = 30;
alphatab.tablature.model.MeasureDrawing.LEFT_SPACING = 10;
alphatab.tablature.model.MeasureDrawing.RIGHT_SPACING = 10;
alphatab.tablature.staves.Stave.TS_NUMBER_WIDTH = 10;
alphatab.tablature.staves.Stave.TS_NUMBER_HEIGHT = 15;
alphatab.tablature.staves.ScoreStave.SCORE_KEYSHARP_POSITIONS = [0,3,-1,2,5,1,4];
alphatab.tablature.staves.ScoreStave.SCORE_KEYFLAT_POSITIONS = [4,1,5,2,6,3,7];
alphatab.tablature.staves.ScoreStave.SCORE_SHARP_POSITIONS = [7,7,6,6,5,4,4,3,3,2,2,1];
alphatab.tablature.staves.ScoreStave.SCORE_FLAT_POSITIONS = [7,6,6,5,5,4,3,3,2,2,1,1];
alphatab.tablature.staves.ScoreStave.SCORE_CLEF_OFFSETS = [30,18,22,24];
alphatab.tablature.staves.ScoreStave.UP_OFFSET = 28;
alphatab.tablature.staves.ScoreStave.DOWN_OFFSET = 28;
alphatab.tablature.staves.ScoreStave.STAVE_ID = "score";
alphatab.tablature.staves.ScoreStave.TopPadding = 0;
alphatab.tablature.staves.ScoreStave.Text = 1;
alphatab.tablature.staves.ScoreStave.Marker = 2;
alphatab.tablature.staves.ScoreStave.Chord = 3;
alphatab.tablature.staves.ScoreStave.TripletFeels = 4;
alphatab.tablature.staves.ScoreStave.Tempo = 5;
alphatab.tablature.staves.ScoreStave.Triplet = 6;
alphatab.tablature.staves.ScoreStave.RepeatEnding = 7;
alphatab.tablature.staves.ScoreStave.ScoreTopPadding = 8;
alphatab.tablature.staves.ScoreStave.ScoreTopLines = 9;
alphatab.tablature.staves.ScoreStave.ScoreMiddleLines = 10;
alphatab.tablature.staves.ScoreStave.ScoreBottomLines = 11;
alphatab.tablature.staves.ScoreStave.BottomPadding = 12;
alphatab.tablature.staves.ScoreStave.TimeSignaturePriority = 2;
alphatab.tablature.staves.StaveLine.TopPadding = 0;
alphatab.tablature.staves.StaveLine.BottomSpacing = 1;
alphatab.tablature.staves.TablatureStave.STAVE_ID = "tablature";
alphatab.tablature.staves.TablatureStave.TopPadding = 0;
alphatab.tablature.staves.TablatureStave.AccentuatedNote = 1;
alphatab.tablature.staves.TablatureStave.TapingEffect = 2;
alphatab.tablature.staves.TablatureStave.LetRing = 3;
alphatab.tablature.staves.TablatureStave.PalmMute = 4;
alphatab.tablature.staves.TablatureStave.BeatVibrato = 5;
alphatab.tablature.staves.TablatureStave.NoteVibrato = 6;
alphatab.tablature.staves.TablatureStave.FadeIn = 7;
alphatab.tablature.staves.TablatureStave.Harmonics = 8;
alphatab.tablature.staves.TablatureStave.Bends = 9;
alphatab.tablature.staves.TablatureStave.TremoloBarTop = 10;
alphatab.tablature.staves.TablatureStave.TablatureTopSeparator = 11;
alphatab.tablature.staves.TablatureStave.Tablature = 12;
alphatab.tablature.staves.TablatureStave.TablatureBottomSeparator = 13;
alphatab.tablature.staves.TablatureStave.TremoloBarBottom = 14;
alphatab.tablature.staves.TablatureStave.Rhythm = 15;
alphatab.tablature.staves.TablatureStave.Fingering = 16;
alphatab.tablature.staves.TablatureStave.BottomPadding = 17;
haxe.xml.Parser.escapes = (function($this) {
	var $r;
	var h = new haxe.ds.StringMap();
	h.set("lt","<");
	h.set("gt",">");
	h.set("amp","&");
	h.set("quot","\"");
	h.set("apos","'");
	h.set("nbsp",String.fromCharCode(160));
	$r = h;
	return $r;
}(this));
alphatab.Main.main();
})();
