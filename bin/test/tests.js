$estr = function() { return js.Boot.__string_rec(this,''); }
if(typeof haxe=='undefined') haxe = {}
if(!haxe.io) haxe.io = {}
haxe.io.BytesBuffer = function(p) {
	if( p === $_ ) return;
	this.b = new Array();
}
haxe.io.BytesBuffer.__name__ = ["haxe","io","BytesBuffer"];
haxe.io.BytesBuffer.prototype.b = null;
haxe.io.BytesBuffer.prototype.addByte = function($byte) {
	this.b.push($byte);
}
haxe.io.BytesBuffer.prototype.add = function(src) {
	var b1 = this.b;
	var b2 = src.b;
	var _g1 = 0, _g = src.length;
	while(_g1 < _g) {
		var i = _g1++;
		this.b.push(b2[i]);
	}
}
haxe.io.BytesBuffer.prototype.addBytes = function(src,pos,len) {
	if(pos < 0 || len < 0 || pos + len > src.length) throw haxe.io.Error.OutsideBounds;
	var b1 = this.b;
	var b2 = src.b;
	var _g1 = pos, _g = pos + len;
	while(_g1 < _g) {
		var i = _g1++;
		this.b.push(b2[i]);
	}
}
haxe.io.BytesBuffer.prototype.getBytes = function() {
	var bytes = new haxe.io.Bytes(this.b.length,this.b);
	this.b = null;
	return bytes;
}
haxe.io.BytesBuffer.prototype.__class__ = haxe.io.BytesBuffer;
if(typeof alphatab=='undefined') alphatab = {}
if(!alphatab.model) alphatab.model = {}
alphatab.model.BrushType = { __ename__ : ["alphatab","model","BrushType"], __constructs__ : ["None","BrushUp","BrushDown","ArpeggioUp","ArpeggioDown"] }
alphatab.model.BrushType.None = ["None",0];
alphatab.model.BrushType.None.toString = $estr;
alphatab.model.BrushType.None.__enum__ = alphatab.model.BrushType;
alphatab.model.BrushType.BrushUp = ["BrushUp",1];
alphatab.model.BrushType.BrushUp.toString = $estr;
alphatab.model.BrushType.BrushUp.__enum__ = alphatab.model.BrushType;
alphatab.model.BrushType.BrushDown = ["BrushDown",2];
alphatab.model.BrushType.BrushDown.toString = $estr;
alphatab.model.BrushType.BrushDown.__enum__ = alphatab.model.BrushType;
alphatab.model.BrushType.ArpeggioUp = ["ArpeggioUp",3];
alphatab.model.BrushType.ArpeggioUp.toString = $estr;
alphatab.model.BrushType.ArpeggioUp.__enum__ = alphatab.model.BrushType;
alphatab.model.BrushType.ArpeggioDown = ["ArpeggioDown",4];
alphatab.model.BrushType.ArpeggioDown.toString = $estr;
alphatab.model.BrushType.ArpeggioDown.__enum__ = alphatab.model.BrushType;
List = function(p) {
	if( p === $_ ) return;
	this.length = 0;
}
List.__name__ = ["List"];
List.prototype.h = null;
List.prototype.q = null;
List.prototype.length = null;
List.prototype.add = function(item) {
	var x = [item];
	if(this.h == null) this.h = x; else this.q[1] = x;
	this.q = x;
	this.length++;
}
List.prototype.push = function(item) {
	var x = [item,this.h];
	this.h = x;
	if(this.q == null) this.q = x;
	this.length++;
}
List.prototype.first = function() {
	return this.h == null?null:this.h[0];
}
List.prototype.last = function() {
	return this.q == null?null:this.q[0];
}
List.prototype.pop = function() {
	if(this.h == null) return null;
	var x = this.h[0];
	this.h = this.h[1];
	if(this.h == null) this.q = null;
	this.length--;
	return x;
}
List.prototype.isEmpty = function() {
	return this.h == null;
}
List.prototype.clear = function() {
	this.h = null;
	this.q = null;
	this.length = 0;
}
List.prototype.remove = function(v) {
	var prev = null;
	var l = this.h;
	while(l != null) {
		if(l[0] == v) {
			if(prev == null) this.h = l[1]; else prev[1] = l[1];
			if(this.q == l) this.q = prev;
			this.length--;
			return true;
		}
		prev = l;
		l = l[1];
	}
	return false;
}
List.prototype.iterator = function() {
	return { h : this.h, hasNext : function() {
		return this.h != null;
	}, next : function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		return x;
	}};
}
List.prototype.toString = function() {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	s.b[s.b.length] = "{" == null?"null":"{";
	while(l != null) {
		if(first) first = false; else s.b[s.b.length] = ", " == null?"null":", ";
		s.add(Std.string(l[0]));
		l = l[1];
	}
	s.b[s.b.length] = "}" == null?"null":"}";
	return s.b.join("");
}
List.prototype.join = function(sep) {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	while(l != null) {
		if(first) first = false; else s.b[s.b.length] = sep == null?"null":sep;
		s.add(l[0]);
		l = l[1];
	}
	return s.b.join("");
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
List.prototype.__class__ = List;
alphatab.model.MasterBar = function(p) {
	if( p === $_ ) return;
	this.alternateEndings = 0;
	this.repeatCount = 0;
}
alphatab.model.MasterBar.__name__ = ["alphatab","model","MasterBar"];
alphatab.model.MasterBar.prototype.alternateEndings = null;
alphatab.model.MasterBar.prototype.nextMasterBar = null;
alphatab.model.MasterBar.prototype.previousMasterBar = null;
alphatab.model.MasterBar.prototype.index = null;
alphatab.model.MasterBar.prototype.keySignature = null;
alphatab.model.MasterBar.prototype.isDoubleBar = null;
alphatab.model.MasterBar.prototype.isRepeatStart = null;
alphatab.model.MasterBar.prototype.isRepeatEnd = function() {
	return this.repeatCount > 0;
}
alphatab.model.MasterBar.prototype.repeatCount = null;
alphatab.model.MasterBar.prototype.timeSignatureDenominator = null;
alphatab.model.MasterBar.prototype.timeSignatureNumerator = null;
alphatab.model.MasterBar.prototype.tripletFeel = null;
alphatab.model.MasterBar.prototype.section = null;
alphatab.model.MasterBar.prototype.isSectionStart = function() {
	return this.section != null;
}
alphatab.model.MasterBar.prototype.tempoAutomation = null;
alphatab.model.MasterBar.prototype.volumeAutomation = null;
alphatab.model.MasterBar.prototype.score = null;
alphatab.model.MasterBar.prototype.__class__ = alphatab.model.MasterBar;
if(!alphatab.platform) alphatab.platform = {}
alphatab.platform.IFileLoader = function() { }
alphatab.platform.IFileLoader.__name__ = ["alphatab","platform","IFileLoader"];
alphatab.platform.IFileLoader.prototype.loadBinary = null;
alphatab.platform.IFileLoader.prototype.loadBinaryAsync = null;
alphatab.platform.IFileLoader.prototype.__class__ = alphatab.platform.IFileLoader;
if(!alphatab.platform.js) alphatab.platform.js = {}
alphatab.platform.js.JsFileLoader = function(p) {
}
alphatab.platform.js.JsFileLoader.__name__ = ["alphatab","platform","js","JsFileLoader"];
alphatab.platform.js.JsFileLoader.getBytes = function(s) {
	var a = new Array();
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		a.push(s.charCodeAt(i) & 255);
	}
	return haxe.io.Bytes.ofData(a);
}
alphatab.platform.js.JsFileLoader.prototype.loadBinary = function(path) {
	if(js.Lib.isIE) {
		var vbArr = VbAjaxLoader(method,file);
		var fileContents = vbArr.toArray();
		var data = "";
		var i = 0;
		while(i < fileContents.length - 1) {
			data += String.fromCharCode(fileContents[i]);
			i++;
		}
		var reader = alphatab.platform.js.JsFileLoader.getBytes(data);
		return reader;
	} else {
		var xhr = new js.XMLHttpRequest();
		xhr.overrideMimeType("text/plain; charset=x-user-defined");
		xhr.open("GET",path,false);
		xhr.send(null);
		if(xhr.status == 200) {
			var reader = alphatab.platform.js.JsFileLoader.getBytes(xhr.responseText);
			return reader;
		} else if(xhr.status == 0) throw "You are offline!!\n Please Check Your Network."; else if(xhr.status == 404) throw "Requested URL not found."; else if(xhr.status == 500) throw "Internel Server Error."; else if(xhr.statusText == "parsererror") throw "Error.\nParsing JSON Request failed."; else if(xhr.statusText == "timeout") throw "Request Time out."; else throw "Unknow Error: " + xhr.responseText;
	}
}
alphatab.platform.js.JsFileLoader.prototype.loadBinaryAsync = function(path,success,error) {
	if(js.Lib.isIE) {
		var vbArr = VbAjaxLoader(method,file);
		var fileContents = vbArr.toArray();
		var data = "";
		var i = 0;
		while(i < fileContents.length - 1) {
			data += String.fromCharCode(fileContents[i]);
			i++;
		}
		var reader = alphatab.platform.js.JsFileLoader.getBytes(data);
		success(reader);
	} else {
		var xhr = new js.XMLHttpRequest();
		xhr.overrideMimeType("text/plain; charset=x-user-defined");
		xhr.onreadystatechange = function() {
			try {
				if(xhr.readyState == 4) {
					if(xhr.status == 200) {
						var reader = alphatab.platform.js.JsFileLoader.getBytes(xhr.responseText);
						success(reader);
					} else if(xhr.status == 0) error("You are offline!!\n Please Check Your Network."); else if(xhr.status == 404) error("Requested URL not found."); else if(xhr.status == 500) error("Internel Server Error."); else if(xhr.statusText == "parsererror") error("Error.\nParsing JSON Request failed."); else if(xhr.statusText == "timeout") error("Request Time out."); else error("Unknow Error: " + xhr.responseText);
				}
			} catch( e ) {
				error("Error loading file: " + e);
			}
		};
		xhr.open("GET",path,true);
		xhr.send(null);
	}
}
alphatab.platform.js.JsFileLoader.prototype.__class__ = alphatab.platform.js.JsFileLoader;
alphatab.platform.js.JsFileLoader.__interfaces__ = [alphatab.platform.IFileLoader];
haxe.Public = function() { }
haxe.Public.__name__ = ["haxe","Public"];
haxe.Public.prototype.__class__ = haxe.Public;
if(!haxe.unit) haxe.unit = {}
haxe.unit.TestCase = function(p) {
}
haxe.unit.TestCase.__name__ = ["haxe","unit","TestCase"];
haxe.unit.TestCase.prototype.currentTest = null;
haxe.unit.TestCase.prototype.setup = function() {
}
haxe.unit.TestCase.prototype.tearDown = function() {
}
haxe.unit.TestCase.prototype.print = function(v) {
	haxe.unit.TestRunner.print(v);
}
haxe.unit.TestCase.prototype.assertTrue = function(b,c) {
	this.currentTest.done = true;
	if(b == false) {
		this.currentTest.success = false;
		this.currentTest.error = "expected true but was false";
		this.currentTest.posInfos = c;
		throw this.currentTest;
	}
}
haxe.unit.TestCase.prototype.assertFalse = function(b,c) {
	this.currentTest.done = true;
	if(b == true) {
		this.currentTest.success = false;
		this.currentTest.error = "expected false but was true";
		this.currentTest.posInfos = c;
		throw this.currentTest;
	}
}
haxe.unit.TestCase.prototype.assertEquals = function(expected,actual,c) {
	this.currentTest.done = true;
	if(actual != expected) {
		this.currentTest.success = false;
		this.currentTest.error = "expected '" + expected + "' but was '" + actual + "'";
		this.currentTest.posInfos = c;
		throw this.currentTest;
	}
}
haxe.unit.TestCase.prototype.__class__ = haxe.unit.TestCase;
haxe.unit.TestCase.__interfaces__ = [haxe.Public];
if(!alphatab.importer) alphatab.importer = {}
alphatab.importer.GpImporterTestBase = function(p) {
	if( p === $_ ) return;
	haxe.unit.TestCase.call(this);
}
alphatab.importer.GpImporterTestBase.__name__ = ["alphatab","importer","GpImporterTestBase"];
alphatab.importer.GpImporterTestBase.__super__ = haxe.unit.TestCase;
for(var k in haxe.unit.TestCase.prototype ) alphatab.importer.GpImporterTestBase.prototype[k] = haxe.unit.TestCase.prototype[k];
alphatab.importer.GpImporterTestBase.prototype.prepareImporterWithData = function(data) {
	var buffer = haxe.io.Bytes.alloc(data.length);
	var _g1 = 0, _g = data.length;
	while(_g1 < _g) {
		var b = _g1++;
		buffer.b[b] = data[b] & 255;
	}
	return this.prepareImporterWithBytes(buffer);
}
alphatab.importer.GpImporterTestBase.prototype.prepareImporterWithFile = function(name) {
	var path = "test-files";
	var buffer = alphatab.platform.PlatformFactory.getLoader().loadBinary(path + "/" + name);
	return this.prepareImporterWithBytes(buffer);
}
alphatab.importer.GpImporterTestBase.prototype.prepareImporterWithBytes = function(buffer) {
	var readerBase = new alphatab.importer.Gp3To5Importer();
	readerBase.init(new haxe.io.BytesInput(buffer,0,buffer.length));
	return readerBase;
}
alphatab.importer.GpImporterTestBase.prototype.checkTest02Score = function(score) {
	var beat;
	beat = 0;
	var durations = Type.getEnumConstructs(alphatab.model.Duration);
	var _g = 0;
	while(_g < durations.length) {
		var durationName = durations[_g];
		++_g;
		var duration = Reflect.field(alphatab.model.Duration,durationName);
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 68, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 69, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 70, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		beat++;
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 73, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 74, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 75, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		beat++;
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 78, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 79, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 80, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		beat++;
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 83, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 84, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 85, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		beat++;
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[beat].isRest(),{ fileName : "GpImporterTestBase.hx", lineNumber : 88, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 89, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
		beat++;
	}
}
alphatab.importer.GpImporterTestBase.prototype.checkTest03Score = function(score) {
	this.assertEquals(4,score.masterBars[0].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 96, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(4,score.masterBars[0].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 97, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(3,score.masterBars[1].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 99, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(4,score.masterBars[1].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 100, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(2,score.masterBars[2].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 102, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(4,score.masterBars[2].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 103, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(1,score.masterBars[3].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 105, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(4,score.masterBars[3].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 106, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(20,score.masterBars[4].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 108, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	this.assertEquals(32,score.masterBars[4].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 109, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
}
alphatab.importer.GpImporterTestBase.prototype.checkDead = function(score) {
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isDead,{ fileName : "GpImporterTestBase.hx", lineNumber : 114, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
	this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[0].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 115, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isDead,{ fileName : "GpImporterTestBase.hx", lineNumber : 117, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
	this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[1].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 118, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].isDead,{ fileName : "GpImporterTestBase.hx", lineNumber : 120, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[2].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 121, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isDead,{ fileName : "GpImporterTestBase.hx", lineNumber : 123, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[3].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 124, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
}
alphatab.importer.GpImporterTestBase.prototype.checkGrace = function(score) {
	this.assertEquals(alphatab.model.GraceType.BeforeBeat,score.tracks[0].bars[0].voices[0].beats[0].graceType,{ fileName : "GpImporterTestBase.hx", lineNumber : 129, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 130, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(alphatab.model.Duration.ThirtySecond,score.tracks[0].bars[0].voices[0].beats[0].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 131, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[1].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 132, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(alphatab.model.Duration.Quarter,score.tracks[0].bars[0].voices[0].beats[1].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 133, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(alphatab.model.GraceType.BeforeBeat,score.tracks[0].bars[0].voices[0].beats[2].graceType,{ fileName : "GpImporterTestBase.hx", lineNumber : 135, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[2].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 136, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(alphatab.model.Duration.ThirtySecond,score.tracks[0].bars[0].voices[0].beats[2].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 137, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[3].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 138, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	this.assertEquals(alphatab.model.Duration.Quarter,score.tracks[0].bars[0].voices[0].beats[3].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 139, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
}
alphatab.importer.GpImporterTestBase.prototype.checkAccentuation = function(score,includeHeavy) {
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isGhost,{ fileName : "GpImporterTestBase.hx", lineNumber : 144, className : "alphatab.importer.GpImporterTestBase", methodName : "checkAccentuation"});
	this.assertEquals(alphatab.model.AccentuationType.Normal,score.tracks[0].bars[0].voices[0].beats[1].notes[0].accentuated,{ fileName : "GpImporterTestBase.hx", lineNumber : 145, className : "alphatab.importer.GpImporterTestBase", methodName : "checkAccentuation"});
	if(includeHeavy) this.assertEquals(alphatab.model.AccentuationType.Heavy,score.tracks[0].bars[0].voices[0].beats[2].notes[0].accentuated,{ fileName : "GpImporterTestBase.hx", lineNumber : 148, className : "alphatab.importer.GpImporterTestBase", methodName : "checkAccentuation"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 150, className : "alphatab.importer.GpImporterTestBase", methodName : "checkAccentuation"});
}
alphatab.importer.GpImporterTestBase.prototype.checkHarmonics = function(score) {
	this.assertEquals(alphatab.model.HarmonicType.Natural,score.tracks[0].bars[0].voices[0].beats[0].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 155, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
	this.assertEquals(alphatab.model.HarmonicType.Artificial,score.tracks[0].bars[0].voices[0].beats[1].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 156, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
	this.assertEquals(alphatab.model.HarmonicType.Tap,score.tracks[0].bars[0].voices[0].beats[2].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 157, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
	this.assertEquals(alphatab.model.HarmonicType.Semi,score.tracks[0].bars[0].voices[0].beats[3].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 158, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
	this.assertEquals(alphatab.model.HarmonicType.Pinch,score.tracks[0].bars[0].voices[0].beats[4].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 159, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
}
alphatab.importer.GpImporterTestBase.prototype.checkHammer = function(score) {
	this.assertEquals(false,score.tracks[0].bars[0].voices[0].beats[0].notes[0].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 165, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[1].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 166, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[2].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 167, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[3].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 168, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertEquals(false,score.tracks[0].bars[0].voices[0].beats[1].notes[0].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 170, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[1].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 171, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[2].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 172, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[3].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 173, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 175, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 176, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 177, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
}
alphatab.importer.GpImporterTestBase.prototype.checkBend = function(score) {
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 182, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 184, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 185, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(15,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 187, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 188, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(60,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 190, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 191, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(7,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 193, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 196, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 197, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(10,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 199, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 200, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(20,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 202, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 203, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(30,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[3].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 205, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[3].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 206, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(40,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[4].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 208, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[4].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 209, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(50,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[5].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 211, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[5].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 212, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(60,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[6].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 214, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[6].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 215, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
}
alphatab.importer.GpImporterTestBase.prototype.checkTremolo = function(score) {
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 220, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 222, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 223, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(30,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 225, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(-4,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 226, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(60,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 228, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 229, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(3,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 231, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(0,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 233, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(-4,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 234, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(45,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 236, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(-4,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 237, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(60,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 239, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(0,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 240, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(3,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 242, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(0,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 244, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(0,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 245, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(45,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 247, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(-4,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 248, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(60,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 250, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	this.assertEquals(-4,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 251, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
}
alphatab.importer.GpImporterTestBase.prototype.checkSlides = function(score) {
	this.assertEquals(alphatab.model.SlideType.Legato,score.tracks[0].bars[0].voices[0].beats[0].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 257, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
	this.assertEquals(alphatab.model.SlideType.Shift,score.tracks[0].bars[0].voices[0].beats[2].getNoteOnString(2).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 258, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
	this.assertEquals(alphatab.model.SlideType.IntoFromBelow,score.tracks[0].bars[1].voices[0].beats[0].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 259, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
	this.assertEquals(alphatab.model.SlideType.IntoFromAbove,score.tracks[0].bars[1].voices[0].beats[1].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 260, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
	this.assertEquals(alphatab.model.SlideType.OutDown,score.tracks[0].bars[1].voices[0].beats[2].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 261, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
	this.assertEquals(alphatab.model.SlideType.OutUp,score.tracks[0].bars[1].voices[0].beats[3].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 262, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
}
alphatab.importer.GpImporterTestBase.prototype.checkVibrato = function(score) {
	this.assertEquals(alphatab.model.VibratoType.Slight,score.tracks[0].bars[0].voices[0].beats[0].notes[0].vibrato,{ fileName : "GpImporterTestBase.hx", lineNumber : 267, className : "alphatab.importer.GpImporterTestBase", methodName : "checkVibrato"});
	this.assertEquals(alphatab.model.VibratoType.Slight,score.tracks[0].bars[0].voices[0].beats[1].notes[0].vibrato,{ fileName : "GpImporterTestBase.hx", lineNumber : 268, className : "alphatab.importer.GpImporterTestBase", methodName : "checkVibrato"});
	this.assertEquals(alphatab.model.VibratoType.Slight,score.tracks[0].bars[0].voices[0].beats[2].vibrato,{ fileName : "GpImporterTestBase.hx", lineNumber : 270, className : "alphatab.importer.GpImporterTestBase", methodName : "checkVibrato"});
	this.assertEquals(alphatab.model.VibratoType.Slight,score.tracks[0].bars[0].voices[0].beats[3].vibrato,{ fileName : "GpImporterTestBase.hx", lineNumber : 271, className : "alphatab.importer.GpImporterTestBase", methodName : "checkVibrato"});
}
alphatab.importer.GpImporterTestBase.prototype.checkTrills = function(score) {
	this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[0].notes[0].trillFret,{ fileName : "GpImporterTestBase.hx", lineNumber : 276, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].trillSpeed,{ fileName : "GpImporterTestBase.hx", lineNumber : 277, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].tremoloSpeed >= 0,{ fileName : "GpImporterTestBase.hx", lineNumber : 279, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[1].tremoloSpeed,{ fileName : "GpImporterTestBase.hx", lineNumber : 280, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].tremoloSpeed >= 0,{ fileName : "GpImporterTestBase.hx", lineNumber : 282, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
	this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[2].tremoloSpeed,{ fileName : "GpImporterTestBase.hx", lineNumber : 283, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].tremoloSpeed >= 0,{ fileName : "GpImporterTestBase.hx", lineNumber : 285, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
	this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[3].tremoloSpeed,{ fileName : "GpImporterTestBase.hx", lineNumber : 286, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
}
alphatab.importer.GpImporterTestBase.prototype.checkOtherEffects = function(score) {
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 291, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isStaccato,{ fileName : "GpImporterTestBase.hx", lineNumber : 292, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].tapping,{ fileName : "GpImporterTestBase.hx", lineNumber : 293, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].slap,{ fileName : "GpImporterTestBase.hx", lineNumber : 294, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].pop,{ fileName : "GpImporterTestBase.hx", lineNumber : 296, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].fadeIn,{ fileName : "GpImporterTestBase.hx", lineNumber : 297, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.tracks[0].bars[3].voices[0].beats[0].chord != null,{ fileName : "GpImporterTestBase.hx", lineNumber : 299, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertEquals("C",score.tracks[0].bars[3].voices[0].beats[0].chord.name,{ fileName : "GpImporterTestBase.hx", lineNumber : 300, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertEquals("Text",score.tracks[0].bars[3].voices[0].beats[1].text,{ fileName : "GpImporterTestBase.hx", lineNumber : 301, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.masterBars[4].isDoubleBar,{ fileName : "GpImporterTestBase.hx", lineNumber : 302, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Tempo) != null,{ fileName : "GpImporterTestBase.hx", lineNumber : 303, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertEquals(120.0,score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Tempo).value,{ fileName : "GpImporterTestBase.hx", lineNumber : 304, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Instrument) != null,{ fileName : "GpImporterTestBase.hx", lineNumber : 305, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	this.assertEquals(25.0,score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Instrument).value,{ fileName : "GpImporterTestBase.hx", lineNumber : 306, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
}
alphatab.importer.GpImporterTestBase.prototype.checkFingering = function(score) {
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isFingering,{ fileName : "GpImporterTestBase.hx", lineNumber : 311, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 312, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 313, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 314, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 315, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 316, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[5].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 317, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[6].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 318, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[7].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 319, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[8].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 320, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[9].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 321, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
}
alphatab.importer.GpImporterTestBase.prototype.checkStroke = function(score) {
	this.assertEquals(alphatab.model.BrushType.BrushDown,score.tracks[0].bars[0].voices[0].beats[0].brushType,{ fileName : "GpImporterTestBase.hx", lineNumber : 326, className : "alphatab.importer.GpImporterTestBase", methodName : "checkStroke"});
	this.assertEquals(alphatab.model.BrushType.BrushUp,score.tracks[0].bars[0].voices[0].beats[1].brushType,{ fileName : "GpImporterTestBase.hx", lineNumber : 327, className : "alphatab.importer.GpImporterTestBase", methodName : "checkStroke"});
	this.assertEquals(alphatab.model.PickStrokeType.Up,score.tracks[0].bars[0].voices[0].beats[2].pickStroke,{ fileName : "GpImporterTestBase.hx", lineNumber : 328, className : "alphatab.importer.GpImporterTestBase", methodName : "checkStroke"});
	this.assertEquals(alphatab.model.PickStrokeType.Down,score.tracks[0].bars[0].voices[0].beats[3].pickStroke,{ fileName : "GpImporterTestBase.hx", lineNumber : 329, className : "alphatab.importer.GpImporterTestBase", methodName : "checkStroke"});
}
alphatab.importer.GpImporterTestBase.prototype.checkTuplets = function(score) {
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 334, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[1].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 335, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
	this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[2].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 336, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
	this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[0].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 338, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
	this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[1].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 339, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
	this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[2].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 340, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
	this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[3].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 341, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
	this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[4].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 342, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
}
alphatab.importer.GpImporterTestBase.prototype.checkRanges = function(score) {
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 347, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 348, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 349, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 350, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 351, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 352, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 354, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 355, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[3].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 356, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	this.assertTrue(score.tracks[0].bars[2].voices[0].beats[0].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 357, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
}
alphatab.importer.GpImporterTestBase.prototype.checkEffects = function(score) {
	this.assertTrue(true,{ fileName : "GpImporterTestBase.hx", lineNumber : 363, className : "alphatab.importer.GpImporterTestBase", methodName : "checkEffects"});
}
alphatab.importer.GpImporterTestBase.prototype.__class__ = alphatab.importer.GpImporterTestBase;
alphatab.importer.Gp3ImporterTest = function(p) {
	if( p === $_ ) return;
	alphatab.importer.GpImporterTestBase.call(this);
}
alphatab.importer.Gp3ImporterTest.__name__ = ["alphatab","importer","Gp3ImporterTest"];
alphatab.importer.Gp3ImporterTest.__super__ = alphatab.importer.GpImporterTestBase;
for(var k in alphatab.importer.GpImporterTestBase.prototype ) alphatab.importer.Gp3ImporterTest.prototype[k] = alphatab.importer.GpImporterTestBase.prototype[k];
alphatab.importer.Gp3ImporterTest.prototype.testScoreInfo = function() {
	var reader = this.prepareImporterWithFile("Test01.gp3");
	var score = reader.readScore();
	this.assertEquals("Title",score.title,{ fileName : "Gp3ImporterTest.hx", lineNumber : 20, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Subtitle",score.subTitle,{ fileName : "Gp3ImporterTest.hx", lineNumber : 21, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Artist",score.artist,{ fileName : "Gp3ImporterTest.hx", lineNumber : 22, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Album",score.album,{ fileName : "Gp3ImporterTest.hx", lineNumber : 23, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Music",score.words,{ fileName : "Gp3ImporterTest.hx", lineNumber : 24, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Music",score.music,{ fileName : "Gp3ImporterTest.hx", lineNumber : 25, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Copyright",score.copyright,{ fileName : "Gp3ImporterTest.hx", lineNumber : 26, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Tab",score.tab,{ fileName : "Gp3ImporterTest.hx", lineNumber : 27, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Instructions",score.instructions,{ fileName : "Gp3ImporterTest.hx", lineNumber : 28, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Notice1\nNotice2",score.notices,{ fileName : "Gp3ImporterTest.hx", lineNumber : 29, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals(5,score.masterBars.length,{ fileName : "Gp3ImporterTest.hx", lineNumber : 30, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals(1,score.tracks.length,{ fileName : "Gp3ImporterTest.hx", lineNumber : 31, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Track 1",score.tracks[0].name,{ fileName : "Gp3ImporterTest.hx", lineNumber : 32, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
}
alphatab.importer.Gp3ImporterTest.prototype.testNotes = function() {
	var reader = this.prepareImporterWithFile("Test02.gp3");
	var score = reader.readScore();
	this.checkTest02Score(score);
}
alphatab.importer.Gp3ImporterTest.prototype.testTimeSignatures = function() {
	var reader = this.prepareImporterWithFile("Test03.gp3");
	var score = reader.readScore();
	this.checkTest03Score(score);
}
alphatab.importer.Gp3ImporterTest.prototype.testDead = function() {
	var reader = this.prepareImporterWithFile("TestDead.gp3");
	var score = reader.readScore();
	this.checkDead(score);
}
alphatab.importer.Gp3ImporterTest.prototype.testAccentuation = function() {
	var reader = this.prepareImporterWithFile("TestAccentuations.gp3");
	var score = reader.readScore();
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isGhost,{ fileName : "Gp3ImporterTest.hx", lineNumber : 62, className : "alphatab.importer.Gp3ImporterTest", methodName : "testAccentuation"});
	this.assertEquals(alphatab.model.DynamicValue.FFF,score.tracks[0].bars[0].voices[0].beats[1].notes[0].dynamicValue,{ fileName : "Gp3ImporterTest.hx", lineNumber : 64, className : "alphatab.importer.Gp3ImporterTest", methodName : "testAccentuation"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 65, className : "alphatab.importer.Gp3ImporterTest", methodName : "testAccentuation"});
}
alphatab.importer.Gp3ImporterTest.prototype.testHammer = function() {
	var reader = this.prepareImporterWithFile("TestHammer.gp3");
	var score = reader.readScore();
	this.checkHammer(score);
}
alphatab.importer.Gp3ImporterTest.prototype.testBend = function() {
	var reader = this.prepareImporterWithFile("TestBends.gp3");
	var score = reader.readScore();
	this.checkBend(score);
}
alphatab.importer.Gp3ImporterTest.prototype.testSlides = function() {
	var reader = this.prepareImporterWithFile("TestSlides.gp3");
	var score = reader.readScore();
	this.assertEquals(alphatab.model.SlideType.Shift,score.tracks[0].bars[0].voices[0].beats[0].getNoteOnString(5).slideType,{ fileName : "Gp3ImporterTest.hx", lineNumber : 97, className : "alphatab.importer.Gp3ImporterTest", methodName : "testSlides"});
	this.assertEquals(alphatab.model.SlideType.Shift,score.tracks[0].bars[0].voices[0].beats[2].getNoteOnString(2).slideType,{ fileName : "Gp3ImporterTest.hx", lineNumber : 98, className : "alphatab.importer.Gp3ImporterTest", methodName : "testSlides"});
}
alphatab.importer.Gp3ImporterTest.prototype.testOtherEffects = function() {
	var reader = this.prepareImporterWithFile("TestOtherEffects.gp3");
	var score = reader.readScore();
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].tapping,{ fileName : "Gp3ImporterTest.hx", lineNumber : 114, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].slap,{ fileName : "Gp3ImporterTest.hx", lineNumber : 115, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].pop,{ fileName : "Gp3ImporterTest.hx", lineNumber : 117, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].fadeIn,{ fileName : "Gp3ImporterTest.hx", lineNumber : 118, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertTrue(score.tracks[0].bars[3].voices[0].beats[0].chord != null,{ fileName : "Gp3ImporterTest.hx", lineNumber : 120, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertEquals("C",score.tracks[0].bars[3].voices[0].beats[0].chord.name,{ fileName : "Gp3ImporterTest.hx", lineNumber : 121, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertEquals("Text",score.tracks[0].bars[3].voices[0].beats[1].text,{ fileName : "Gp3ImporterTest.hx", lineNumber : 122, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Tempo) != null,{ fileName : "Gp3ImporterTest.hx", lineNumber : 123, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertEquals(120.0,score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Tempo).value,{ fileName : "Gp3ImporterTest.hx", lineNumber : 124, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Instrument) != null,{ fileName : "Gp3ImporterTest.hx", lineNumber : 125, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	this.assertEquals(25.0,score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Instrument).value,{ fileName : "Gp3ImporterTest.hx", lineNumber : 126, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
}
alphatab.importer.Gp3ImporterTest.prototype.testStroke = function() {
	var reader = this.prepareImporterWithFile("TestStrokes.gp3");
	var score = reader.readScore();
	this.assertEquals(alphatab.model.BrushType.BrushDown,score.tracks[0].bars[0].voices[0].beats[0].brushType,{ fileName : "Gp3ImporterTest.hx", lineNumber : 134, className : "alphatab.importer.Gp3ImporterTest", methodName : "testStroke"});
	this.assertEquals(alphatab.model.BrushType.BrushUp,score.tracks[0].bars[0].voices[0].beats[1].brushType,{ fileName : "Gp3ImporterTest.hx", lineNumber : 135, className : "alphatab.importer.Gp3ImporterTest", methodName : "testStroke"});
}
alphatab.importer.Gp3ImporterTest.prototype.testTuplets = function() {
	var reader = this.prepareImporterWithFile("TestTuplets.gp3");
	var score = reader.readScore();
	this.checkTuplets(score);
}
alphatab.importer.Gp3ImporterTest.prototype.testRanges = function() {
	var reader = this.prepareImporterWithFile("TestRanges.gp3");
	var score = reader.readScore();
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 150, className : "alphatab.importer.Gp3ImporterTest", methodName : "testRanges"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 151, className : "alphatab.importer.Gp3ImporterTest", methodName : "testRanges"});
	this.assertTrue(score.tracks[0].bars[1].voices[0].beats[3].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 152, className : "alphatab.importer.Gp3ImporterTest", methodName : "testRanges"});
	this.assertTrue(score.tracks[0].bars[2].voices[0].beats[0].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 153, className : "alphatab.importer.Gp3ImporterTest", methodName : "testRanges"});
}
alphatab.importer.Gp3ImporterTest.prototype.testEffects = function() {
	var reader = this.prepareImporterWithFile("Effects.gp3");
	var score = reader.readScore();
	this.checkEffects(score);
}
alphatab.importer.Gp3ImporterTest.prototype.__class__ = alphatab.importer.Gp3ImporterTest;
alphatab.AlphaTestRunner = function() { }
alphatab.AlphaTestRunner.__name__ = ["alphatab","AlphaTestRunner"];
alphatab.AlphaTestRunner.main = function() {
	var r = new haxe.unit.TestRunner();
	r.add(new alphatab.importer.Gp5ImporterTest());
	r.run();
}
alphatab.AlphaTestRunner.prototype.__class__ = alphatab.AlphaTestRunner;
alphatab.model.Bar = function(p) {
	if( p === $_ ) return;
	this.voices = new Array();
	this.clef = alphatab.model.Clef.G2;
}
alphatab.model.Bar.__name__ = ["alphatab","model","Bar"];
alphatab.model.Bar.prototype.index = null;
alphatab.model.Bar.prototype.nextBar = null;
alphatab.model.Bar.prototype.previousBar = null;
alphatab.model.Bar.prototype.clef = null;
alphatab.model.Bar.prototype.track = null;
alphatab.model.Bar.prototype.voices = null;
alphatab.model.Bar.prototype.addVoice = function(voice) {
	voice.bar = this;
	voice.index = this.voices.length;
	this.voices.push(voice);
}
alphatab.model.Bar.prototype.__class__ = alphatab.model.Bar;
alphatab.model.Duration = { __ename__ : ["alphatab","model","Duration"], __constructs__ : ["Whole","Half","Quarter","Eighth","Sixteenth","ThirtySecond","SixtyFourth"] }
alphatab.model.Duration.Whole = ["Whole",0];
alphatab.model.Duration.Whole.toString = $estr;
alphatab.model.Duration.Whole.__enum__ = alphatab.model.Duration;
alphatab.model.Duration.Half = ["Half",1];
alphatab.model.Duration.Half.toString = $estr;
alphatab.model.Duration.Half.__enum__ = alphatab.model.Duration;
alphatab.model.Duration.Quarter = ["Quarter",2];
alphatab.model.Duration.Quarter.toString = $estr;
alphatab.model.Duration.Quarter.__enum__ = alphatab.model.Duration;
alphatab.model.Duration.Eighth = ["Eighth",3];
alphatab.model.Duration.Eighth.toString = $estr;
alphatab.model.Duration.Eighth.__enum__ = alphatab.model.Duration;
alphatab.model.Duration.Sixteenth = ["Sixteenth",4];
alphatab.model.Duration.Sixteenth.toString = $estr;
alphatab.model.Duration.Sixteenth.__enum__ = alphatab.model.Duration;
alphatab.model.Duration.ThirtySecond = ["ThirtySecond",5];
alphatab.model.Duration.ThirtySecond.toString = $estr;
alphatab.model.Duration.ThirtySecond.__enum__ = alphatab.model.Duration;
alphatab.model.Duration.SixtyFourth = ["SixtyFourth",6];
alphatab.model.Duration.SixtyFourth.toString = $estr;
alphatab.model.Duration.SixtyFourth.__enum__ = alphatab.model.Duration;
haxe.unit.TestStatus = function(p) {
	if( p === $_ ) return;
	this.done = false;
	this.success = false;
}
haxe.unit.TestStatus.__name__ = ["haxe","unit","TestStatus"];
haxe.unit.TestStatus.prototype.done = null;
haxe.unit.TestStatus.prototype.success = null;
haxe.unit.TestStatus.prototype.error = null;
haxe.unit.TestStatus.prototype.method = null;
haxe.unit.TestStatus.prototype.classname = null;
haxe.unit.TestStatus.prototype.posInfos = null;
haxe.unit.TestStatus.prototype.backtrace = null;
haxe.unit.TestStatus.prototype.__class__ = haxe.unit.TestStatus;
haxe.unit.TestRunner = function(p) {
	if( p === $_ ) return;
	this.result = new haxe.unit.TestResult();
	this.cases = new List();
}
haxe.unit.TestRunner.__name__ = ["haxe","unit","TestRunner"];
haxe.unit.TestRunner.print = function(v) {
	var msg = StringTools.htmlEscape(js.Boot.__string_rec(v,"")).split("\n").join("<br/>");
	var d = document.getElementById("haxe:trace");
	if(d == null) alert("haxe:trace element not found"); else d.innerHTML += msg;
}
haxe.unit.TestRunner.customTrace = function(v,p) {
	haxe.unit.TestRunner.print(p.fileName + ":" + p.lineNumber + ": " + Std.string(v) + "\n");
}
haxe.unit.TestRunner.prototype.result = null;
haxe.unit.TestRunner.prototype.cases = null;
haxe.unit.TestRunner.prototype.add = function(c) {
	this.cases.add(c);
}
haxe.unit.TestRunner.prototype.run = function() {
	this.result = new haxe.unit.TestResult();
	var $it0 = this.cases.iterator();
	while( $it0.hasNext() ) {
		var c = $it0.next();
		this.runCase(c);
	}
	haxe.unit.TestRunner.print(this.result.toString());
	return this.result.success;
}
haxe.unit.TestRunner.prototype.runCase = function(t) {
	var old = haxe.Log.trace;
	haxe.Log.trace = haxe.unit.TestRunner.customTrace;
	var cl = Type.getClass(t);
	var fields = Type.getInstanceFields(cl);
	haxe.unit.TestRunner.print("Class: " + Type.getClassName(cl) + " ");
	var _g = 0;
	while(_g < fields.length) {
		var f = fields[_g];
		++_g;
		var fname = f;
		var field = Reflect.field(t,f);
		if(StringTools.startsWith(fname,"test") && Reflect.isFunction(field)) {
			t.currentTest = new haxe.unit.TestStatus();
			t.currentTest.classname = Type.getClassName(cl);
			t.currentTest.method = fname;
			t.setup();
			try {
				field.apply(t,new Array());
				if(t.currentTest.done) {
					t.currentTest.success = true;
					haxe.unit.TestRunner.print(".");
				} else {
					t.currentTest.success = false;
					t.currentTest.error = "(warning) no assert";
					haxe.unit.TestRunner.print("W");
				}
			} catch( $e0 ) {
				if( js.Boot.__instanceof($e0,haxe.unit.TestStatus) ) {
					var e = $e0;
					haxe.unit.TestRunner.print("F");
					t.currentTest.backtrace = haxe.Stack.toString(haxe.Stack.exceptionStack());
				} else {
				var e = $e0;
				haxe.unit.TestRunner.print("E");
				if(e.message != null) t.currentTest.error = "exception thrown : " + e + " [" + e.message + "]"; else t.currentTest.error = "exception thrown : " + e;
				t.currentTest.backtrace = haxe.Stack.toString(haxe.Stack.exceptionStack());
				}
			}
			this.result.add(t.currentTest);
			t.tearDown();
		}
	}
	haxe.unit.TestRunner.print("\n");
	haxe.Log.trace = old;
}
haxe.unit.TestRunner.prototype.__class__ = haxe.unit.TestRunner;
alphatab.importer.MixTableChange = function(p) {
	if( p === $_ ) return;
	this.volume = -1;
	this.balance = -1;
	this.instrument = -1;
	this.tempoName = null;
	this.tempo = -1;
	this.duration = 0;
}
alphatab.importer.MixTableChange.__name__ = ["alphatab","importer","MixTableChange"];
alphatab.importer.MixTableChange.prototype.volume = null;
alphatab.importer.MixTableChange.prototype.balance = null;
alphatab.importer.MixTableChange.prototype.instrument = null;
alphatab.importer.MixTableChange.prototype.tempoName = null;
alphatab.importer.MixTableChange.prototype.tempo = null;
alphatab.importer.MixTableChange.prototype.duration = null;
alphatab.importer.MixTableChange.prototype.__class__ = alphatab.importer.MixTableChange;
alphatab.model.Score = function(p) {
	if( p === $_ ) return;
	this.masterBars = new Array();
	this.tracks = new Array();
}
alphatab.model.Score.__name__ = ["alphatab","model","Score"];
alphatab.model.Score.prototype.album = null;
alphatab.model.Score.prototype.artist = null;
alphatab.model.Score.prototype.copyright = null;
alphatab.model.Score.prototype.instructions = null;
alphatab.model.Score.prototype.music = null;
alphatab.model.Score.prototype.notices = null;
alphatab.model.Score.prototype.subTitle = null;
alphatab.model.Score.prototype.title = null;
alphatab.model.Score.prototype.words = null;
alphatab.model.Score.prototype.tab = null;
alphatab.model.Score.prototype.tempoLabel = null;
alphatab.model.Score.prototype.masterBars = null;
alphatab.model.Score.prototype.tracks = null;
alphatab.model.Score.prototype.addMasterBar = function(bar) {
	bar.score = this;
	bar.index = this.masterBars.length;
	if(this.masterBars.length != 0) {
		bar.previousMasterBar = this.masterBars[this.masterBars.length - 1];
		bar.previousMasterBar.nextMasterBar = bar;
	}
	this.masterBars.push(bar);
}
alphatab.model.Score.prototype.addTrack = function(track) {
	track.score = this;
	track.index = this.tracks.length;
	this.tracks.push(track);
}
alphatab.model.Score.prototype.__class__ = alphatab.model.Score;
alphatab.model.TripletFeel = { __ename__ : ["alphatab","model","TripletFeel"], __constructs__ : ["NoTripletFeel","Triplet16th","Triplet8th","Dotted16th","Dotted8th","Scottish16th","Scottish8th"] }
alphatab.model.TripletFeel.NoTripletFeel = ["NoTripletFeel",0];
alphatab.model.TripletFeel.NoTripletFeel.toString = $estr;
alphatab.model.TripletFeel.NoTripletFeel.__enum__ = alphatab.model.TripletFeel;
alphatab.model.TripletFeel.Triplet16th = ["Triplet16th",1];
alphatab.model.TripletFeel.Triplet16th.toString = $estr;
alphatab.model.TripletFeel.Triplet16th.__enum__ = alphatab.model.TripletFeel;
alphatab.model.TripletFeel.Triplet8th = ["Triplet8th",2];
alphatab.model.TripletFeel.Triplet8th.toString = $estr;
alphatab.model.TripletFeel.Triplet8th.__enum__ = alphatab.model.TripletFeel;
alphatab.model.TripletFeel.Dotted16th = ["Dotted16th",3];
alphatab.model.TripletFeel.Dotted16th.toString = $estr;
alphatab.model.TripletFeel.Dotted16th.__enum__ = alphatab.model.TripletFeel;
alphatab.model.TripletFeel.Dotted8th = ["Dotted8th",4];
alphatab.model.TripletFeel.Dotted8th.toString = $estr;
alphatab.model.TripletFeel.Dotted8th.__enum__ = alphatab.model.TripletFeel;
alphatab.model.TripletFeel.Scottish16th = ["Scottish16th",5];
alphatab.model.TripletFeel.Scottish16th.toString = $estr;
alphatab.model.TripletFeel.Scottish16th.__enum__ = alphatab.model.TripletFeel;
alphatab.model.TripletFeel.Scottish8th = ["Scottish8th",6];
alphatab.model.TripletFeel.Scottish8th.toString = $estr;
alphatab.model.TripletFeel.Scottish8th.__enum__ = alphatab.model.TripletFeel;
alphatab.model.Beat = function(p) {
	if( p === $_ ) return;
	this.whammyBarPoints = new Array();
	this.notes = new Array();
	this.brushType = alphatab.model.BrushType.None;
	this.vibrato = alphatab.model.VibratoType.None;
	this.graceType = alphatab.model.GraceType.None;
	this.pickStroke = alphatab.model.PickStrokeType.None;
	this.duration = alphatab.model.Duration.Quarter;
	this.tremoloSpeed = -1;
	this.automations = new Array();
}
alphatab.model.Beat.__name__ = ["alphatab","model","Beat"];
alphatab.model.Beat.prototype.previousBeat = null;
alphatab.model.Beat.prototype.nextBeat = null;
alphatab.model.Beat.prototype.index = null;
alphatab.model.Beat.prototype.voice = null;
alphatab.model.Beat.prototype.notes = null;
alphatab.model.Beat.prototype.duration = null;
alphatab.model.Beat.prototype.automations = null;
alphatab.model.Beat.prototype.isRest = function() {
	return this.notes.length == 0;
}
alphatab.model.Beat.prototype.dots = null;
alphatab.model.Beat.prototype.fadeIn = null;
alphatab.model.Beat.prototype.lyrics = null;
alphatab.model.Beat.prototype.pop = null;
alphatab.model.Beat.prototype.hasRasgueado = null;
alphatab.model.Beat.prototype.slap = null;
alphatab.model.Beat.prototype.text = null;
alphatab.model.Beat.prototype.brushType = null;
alphatab.model.Beat.prototype.brushDuration = null;
alphatab.model.Beat.prototype.tupletDenominator = null;
alphatab.model.Beat.prototype.tupletNumerator = null;
alphatab.model.Beat.prototype.whammyBarPoints = null;
alphatab.model.Beat.prototype.hasWhammyBar = function() {
	return this.whammyBarPoints.length > 0;
}
alphatab.model.Beat.prototype.vibrato = null;
alphatab.model.Beat.prototype.chord = null;
alphatab.model.Beat.prototype.hasChord = function() {
	return this.chord != null;
}
alphatab.model.Beat.prototype.graceType = null;
alphatab.model.Beat.prototype.pickStroke = null;
alphatab.model.Beat.prototype.isTremolo = function() {
	return this.tremoloSpeed >= 0;
}
alphatab.model.Beat.prototype.tremoloSpeed = null;
alphatab.model.Beat.prototype.addNote = function(note) {
	note.beat = this;
	this.notes.push(note);
}
alphatab.model.Beat.prototype.getAutomation = function(type) {
	var _g = 0, _g1 = this.automations;
	while(_g < _g1.length) {
		var a = _g1[_g];
		++_g;
		if(a.type == type) return a;
	}
	return null;
}
alphatab.model.Beat.prototype.getNoteOnString = function(string) {
	var _g = 0, _g1 = this.notes;
	while(_g < _g1.length) {
		var n = _g1[_g];
		++_g;
		if(n.string == string) return n;
	}
	return null;
}
alphatab.model.Beat.prototype.__class__ = alphatab.model.Beat;
alphatab.platform.Canvas = function() { }
alphatab.platform.Canvas.__name__ = ["alphatab","platform","Canvas"];
alphatab.platform.Canvas.prototype.width = null;
alphatab.platform.Canvas.prototype.height = null;
alphatab.platform.Canvas.prototype.strokeStyle = null;
alphatab.platform.Canvas.prototype.fillStyle = null;
alphatab.platform.Canvas.prototype.lineWidth = null;
alphatab.platform.Canvas.prototype.clear = null;
alphatab.platform.Canvas.prototype.fillRect = null;
alphatab.platform.Canvas.prototype.strokeRect = null;
alphatab.platform.Canvas.prototype.beginPath = null;
alphatab.platform.Canvas.prototype.closePath = null;
alphatab.platform.Canvas.prototype.moveTo = null;
alphatab.platform.Canvas.prototype.lineTo = null;
alphatab.platform.Canvas.prototype.quadraticCurveTo = null;
alphatab.platform.Canvas.prototype.bezierCurveTo = null;
alphatab.platform.Canvas.prototype.rect = null;
alphatab.platform.Canvas.prototype.circle = null;
alphatab.platform.Canvas.prototype.fill = null;
alphatab.platform.Canvas.prototype.stroke = null;
alphatab.platform.Canvas.prototype.font = null;
alphatab.platform.Canvas.prototype.textBaseline = null;
alphatab.platform.Canvas.prototype.textAlign = null;
alphatab.platform.Canvas.prototype.fillText = null;
alphatab.platform.Canvas.prototype.strokeText = null;
alphatab.platform.Canvas.prototype.measureText = null;
alphatab.platform.Canvas.prototype.__class__ = alphatab.platform.Canvas;
alphatab.model.Note = function(p) {
	if( p === $_ ) return;
	this.bendPoints = new Array();
	this.trillFret = -1;
	this.dynamicValue = alphatab.model.DynamicValue.F;
	this.accentuated = alphatab.model.AccentuationType.None;
	this.fret = -1;
	this.isGhost = false;
	this.string = 0;
	this.isHammerPullDestination = false;
	this.isHammerPullOrigin = false;
	this.harmonicValue = 0;
	this.harmonicType = alphatab.model.HarmonicType.None;
	this.isLetRing = false;
	this.isPalmMute = false;
	this.isDead = false;
	this.slideType = alphatab.model.SlideType.None;
	this.vibrato = alphatab.model.VibratoType.None;
	this.isStaccato = false;
	this.tapping = false;
	this.isTieOrigin = false;
	this.isTieDestination = false;
	this.leftHandFinger = -1;
	this.rightHandFinger = -1;
	this.isFingering = false;
	this.trillFret = -1;
	this.trillSpeed = 0;
	this.durationPercent = 1;
}
alphatab.model.Note.__name__ = ["alphatab","model","Note"];
alphatab.model.Note.prototype.accentuated = null;
alphatab.model.Note.prototype.bendPoints = null;
alphatab.model.Note.prototype.hasBend = function() {
	return this.bendPoints.length > 0;
}
alphatab.model.Note.prototype.fret = null;
alphatab.model.Note.prototype.isGhost = null;
alphatab.model.Note.prototype.string = null;
alphatab.model.Note.prototype.isHammerPullDestination = null;
alphatab.model.Note.prototype.isHammerPullOrigin = null;
alphatab.model.Note.prototype.harmonicValue = null;
alphatab.model.Note.prototype.harmonicType = null;
alphatab.model.Note.prototype.isLetRing = null;
alphatab.model.Note.prototype.isPalmMute = null;
alphatab.model.Note.prototype.isDead = null;
alphatab.model.Note.prototype.slideType = null;
alphatab.model.Note.prototype.vibrato = null;
alphatab.model.Note.prototype.isStaccato = null;
alphatab.model.Note.prototype.tapping = null;
alphatab.model.Note.prototype.isTieOrigin = null;
alphatab.model.Note.prototype.isTieDestination = null;
alphatab.model.Note.prototype.leftHandFinger = null;
alphatab.model.Note.prototype.rightHandFinger = null;
alphatab.model.Note.prototype.isFingering = null;
alphatab.model.Note.prototype.trillFret = null;
alphatab.model.Note.prototype.isTrill = function() {
	return this.trillFret >= 0;
}
alphatab.model.Note.prototype.trillSpeed = null;
alphatab.model.Note.prototype.durationPercent = null;
alphatab.model.Note.prototype.beat = null;
alphatab.model.Note.prototype.dynamicValue = null;
alphatab.model.Note.prototype.__class__ = alphatab.model.Note;
alphatab.model.GraceType = { __ename__ : ["alphatab","model","GraceType"], __constructs__ : ["None","OnBeat","BeforeBeat"] }
alphatab.model.GraceType.None = ["None",0];
alphatab.model.GraceType.None.toString = $estr;
alphatab.model.GraceType.None.__enum__ = alphatab.model.GraceType;
alphatab.model.GraceType.OnBeat = ["OnBeat",1];
alphatab.model.GraceType.OnBeat.toString = $estr;
alphatab.model.GraceType.OnBeat.__enum__ = alphatab.model.GraceType;
alphatab.model.GraceType.BeforeBeat = ["BeforeBeat",2];
alphatab.model.GraceType.BeforeBeat.toString = $estr;
alphatab.model.GraceType.BeforeBeat.__enum__ = alphatab.model.GraceType;
haxe.io.Input = function() { }
haxe.io.Input.__name__ = ["haxe","io","Input"];
haxe.io.Input.prototype.bigEndian = null;
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
haxe.io.Input.prototype.close = function() {
}
haxe.io.Input.prototype.setEndian = function(b) {
	this.bigEndian = b;
	return b;
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
	} catch( e ) {
		if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
		} else throw(e);
	}
	return total.getBytes();
}
haxe.io.Input.prototype.readFullBytes = function(s,pos,len) {
	while(len > 0) {
		var k = this.readBytes(s,pos,len);
		pos += k;
		len -= k;
	}
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
haxe.io.Input.prototype.readUntil = function(end) {
	var buf = new StringBuf();
	var last;
	while((last = this.readByte()) != end) buf.b[buf.b.length] = String.fromCharCode(last);
	return buf.b.join("");
}
haxe.io.Input.prototype.readLine = function() {
	var buf = new StringBuf();
	var last;
	var s;
	try {
		while((last = this.readByte()) != 10) buf.b[buf.b.length] = String.fromCharCode(last);
		s = buf.b.join("");
		if(s.charCodeAt(s.length - 1) == 13) s = s.substr(0,-1);
	} catch( e ) {
		if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
			s = buf.b.join("");
			if(s.length == 0) throw e;
		} else throw(e);
	}
	return s;
}
haxe.io.Input.prototype.readFloat = function() {
	throw "Not implemented";
	return 0;
}
haxe.io.Input.prototype.readDouble = function() {
	throw "Not implemented";
	return 0;
}
haxe.io.Input.prototype.readInt8 = function() {
	var n = this.readByte();
	if(n >= 128) return n - 256;
	return n;
}
haxe.io.Input.prototype.readInt16 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var n = this.bigEndian?ch2 | ch1 << 8:ch1 | ch2 << 8;
	if((n & 32768) != 0) return n - 65536;
	return n;
}
haxe.io.Input.prototype.readUInt16 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	return this.bigEndian?ch2 | ch1 << 8:ch1 | ch2 << 8;
}
haxe.io.Input.prototype.readInt24 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var n = this.bigEndian?ch3 | ch2 << 8 | ch1 << 16:ch1 | ch2 << 8 | ch3 << 16;
	if((n & 8388608) != 0) return n - 16777216;
	return n;
}
haxe.io.Input.prototype.readUInt24 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	return this.bigEndian?ch3 | ch2 << 8 | ch1 << 16:ch1 | ch2 << 8 | ch3 << 16;
}
haxe.io.Input.prototype.readInt31 = function() {
	var ch1, ch2, ch3, ch4;
	if(this.bigEndian) {
		ch4 = this.readByte();
		ch3 = this.readByte();
		ch2 = this.readByte();
		ch1 = this.readByte();
	} else {
		ch1 = this.readByte();
		ch2 = this.readByte();
		ch3 = this.readByte();
		ch4 = this.readByte();
	}
	if((ch4 & 128) == 0 != ((ch4 & 64) == 0)) throw haxe.io.Error.Overflow;
	return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
}
haxe.io.Input.prototype.readUInt30 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var ch4 = this.readByte();
	if((this.bigEndian?ch1:ch4) >= 64) throw haxe.io.Error.Overflow;
	return this.bigEndian?ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24:ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
}
haxe.io.Input.prototype.readInt32 = function() {
	var ch1 = this.readByte();
	var ch2 = this.readByte();
	var ch3 = this.readByte();
	var ch4 = this.readByte();
	return this.bigEndian?(ch1 << 8 | ch2) << 16 | (ch3 << 8 | ch4):(ch4 << 8 | ch3) << 16 | (ch2 << 8 | ch1);
}
haxe.io.Input.prototype.readString = function(len) {
	var b = haxe.io.Bytes.alloc(len);
	this.readFullBytes(b,0,len);
	return b.toString();
}
haxe.io.Input.prototype.__class__ = haxe.io.Input;
haxe.io.BytesInput = function(b,pos,len) {
	if( b === $_ ) return;
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
}
haxe.io.BytesInput.__name__ = ["haxe","io","BytesInput"];
haxe.io.BytesInput.__super__ = haxe.io.Input;
for(var k in haxe.io.Input.prototype ) haxe.io.BytesInput.prototype[k] = haxe.io.Input.prototype[k];
haxe.io.BytesInput.prototype.b = null;
haxe.io.BytesInput.prototype.pos = null;
haxe.io.BytesInput.prototype.len = null;
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
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		b2[pos + i] = b1[this.pos + i];
	}
	this.pos += len;
	this.len -= len;
	return len;
}
haxe.io.BytesInput.prototype.__class__ = haxe.io.BytesInput;
if(!alphatab.platform.svg) alphatab.platform.svg = {}
alphatab.platform.svg.SupportedFonts = { __ename__ : ["alphatab","platform","svg","SupportedFonts"], __constructs__ : ["TimesNewRoman","Arial"] }
alphatab.platform.svg.SupportedFonts.TimesNewRoman = ["TimesNewRoman",0];
alphatab.platform.svg.SupportedFonts.TimesNewRoman.toString = $estr;
alphatab.platform.svg.SupportedFonts.TimesNewRoman.__enum__ = alphatab.platform.svg.SupportedFonts;
alphatab.platform.svg.SupportedFonts.Arial = ["Arial",1];
alphatab.platform.svg.SupportedFonts.Arial.toString = $estr;
alphatab.platform.svg.SupportedFonts.Arial.__enum__ = alphatab.platform.svg.SupportedFonts;
haxe.io.Eof = function(p) {
}
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype.toString = function() {
	return "Eof";
}
haxe.io.Eof.prototype.__class__ = haxe.io.Eof;
alphatab.importer.ScoreImporter = function(p) {
}
alphatab.importer.ScoreImporter.__name__ = ["alphatab","importer","ScoreImporter"];
alphatab.importer.ScoreImporter.availableImporters = function() {
	var scoreImporter = new Array();
	scoreImporter.push(new alphatab.importer.Gp3To5Importer());
	return scoreImporter;
}
alphatab.importer.ScoreImporter.prototype._data = null;
alphatab.importer.ScoreImporter.prototype.init = function(data) {
	this._data = data;
}
alphatab.importer.ScoreImporter.prototype.readScore = function() {
	return null;
}
alphatab.importer.ScoreImporter.prototype.__class__ = alphatab.importer.ScoreImporter;
alphatab.model.AccentuationType = { __ename__ : ["alphatab","model","AccentuationType"], __constructs__ : ["None","Normal","Heavy"] }
alphatab.model.AccentuationType.None = ["None",0];
alphatab.model.AccentuationType.None.toString = $estr;
alphatab.model.AccentuationType.None.__enum__ = alphatab.model.AccentuationType;
alphatab.model.AccentuationType.Normal = ["Normal",1];
alphatab.model.AccentuationType.Normal.toString = $estr;
alphatab.model.AccentuationType.Normal.__enum__ = alphatab.model.AccentuationType;
alphatab.model.AccentuationType.Heavy = ["Heavy",2];
alphatab.model.AccentuationType.Heavy.toString = $estr;
alphatab.model.AccentuationType.Heavy.__enum__ = alphatab.model.AccentuationType;
Reflect = function() { }
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	if(o.hasOwnProperty != null) return o.hasOwnProperty(field);
	var arr = Reflect.fields(o);
	var $it0 = arr.iterator();
	while( $it0.hasNext() ) {
		var t = $it0.next();
		if(t == field) return true;
	}
	return false;
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
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
		for(var i in o) if( o.hasOwnProperty(i) ) a.push(i);
	} else {
		var t;
		try {
			t = o.__proto__;
		} catch( e ) {
			t = null;
		}
		if(t != null) o.__proto__ = null;
		for(var i in o) if( i != "__proto__" ) a.push(i);
		if(t != null) o.__proto__ = t;
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && f.__name__ == null;
}
Reflect.compare = function(a,b) {
	return a == b?0:a > b?1:-1;
}
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
}
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && !v.__enum__ || t == "function" && v.__name__ != null;
}
Reflect.deleteField = function(o,f) {
	if(!Reflect.hasField(o,f)) return false;
	delete(o[f]);
	return true;
}
Reflect.copy = function(o) {
	var o2 = { };
	var _g = 0, _g1 = Reflect.fields(o);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		o2[f] = Reflect.field(o,f);
	}
	return o2;
}
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = new Array();
		var _g1 = 0, _g = arguments.length;
		while(_g1 < _g) {
			var i = _g1++;
			a.push(arguments[i]);
		}
		return f(a);
	};
}
Reflect.prototype.__class__ = Reflect;
alphatab.model.Automation = function(p) {
}
alphatab.model.Automation.__name__ = ["alphatab","model","Automation"];
alphatab.model.Automation.prototype.isLinear = null;
alphatab.model.Automation.prototype.type = null;
alphatab.model.Automation.prototype.value = null;
alphatab.model.Automation.prototype.duration = null;
alphatab.model.Automation.prototype.__class__ = alphatab.model.Automation;
haxe.StackItem = { __ename__ : ["haxe","StackItem"], __constructs__ : ["CFunction","Module","FilePos","Method","Lambda"] }
haxe.StackItem.CFunction = ["CFunction",0];
haxe.StackItem.CFunction.toString = $estr;
haxe.StackItem.CFunction.__enum__ = haxe.StackItem;
haxe.StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.Lambda = function(v) { var $x = ["Lambda",4,v]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.Stack = function() { }
haxe.Stack.__name__ = ["haxe","Stack"];
haxe.Stack.callStack = function() {
	return haxe.Stack.makeStack("$s");
}
haxe.Stack.exceptionStack = function() {
	return haxe.Stack.makeStack("$e");
}
haxe.Stack.toString = function(stack) {
	var b = new StringBuf();
	var _g = 0;
	while(_g < stack.length) {
		var s = stack[_g];
		++_g;
		b.b[b.b.length] = "\nCalled from " == null?"null":"\nCalled from ";
		haxe.Stack.itemToString(b,s);
	}
	return b.b.join("");
}
haxe.Stack.itemToString = function(b,s) {
	var $e = (s);
	switch( $e[1] ) {
	case 0:
		b.b[b.b.length] = "a C function" == null?"null":"a C function";
		break;
	case 1:
		var m = $e[2];
		b.b[b.b.length] = "module " == null?"null":"module ";
		b.b[b.b.length] = m == null?"null":m;
		break;
	case 2:
		var line = $e[4], file = $e[3], s1 = $e[2];
		if(s1 != null) {
			haxe.Stack.itemToString(b,s1);
			b.b[b.b.length] = " (" == null?"null":" (";
		}
		b.b[b.b.length] = file == null?"null":file;
		b.b[b.b.length] = " line " == null?"null":" line ";
		b.b[b.b.length] = line == null?"null":line;
		if(s1 != null) b.b[b.b.length] = ")" == null?"null":")";
		break;
	case 3:
		var meth = $e[3], cname = $e[2];
		b.b[b.b.length] = cname == null?"null":cname;
		b.b[b.b.length] = "." == null?"null":".";
		b.b[b.b.length] = meth == null?"null":meth;
		break;
	case 4:
		var n = $e[2];
		b.b[b.b.length] = "local function #" == null?"null":"local function #";
		b.b[b.b.length] = n == null?"null":n;
		break;
	}
}
haxe.Stack.makeStack = function(s) {
	var a = (function($this) {
		var $r;
		try {
			$r = eval(s);
		} catch( e ) {
			$r = [];
		}
		return $r;
	}(this));
	var m = new Array();
	var _g1 = 0, _g = a.length - (s == "$s"?2:0);
	while(_g1 < _g) {
		var i = _g1++;
		var d = a[i].split("::");
		m.unshift(haxe.StackItem.Method(d[0],d[1]));
	}
	return m;
}
haxe.Stack.prototype.__class__ = haxe.Stack;
IntIter = function(min,max) {
	if( min === $_ ) return;
	this.min = min;
	this.max = max;
}
IntIter.__name__ = ["IntIter"];
IntIter.prototype.min = null;
IntIter.prototype.max = null;
IntIter.prototype.hasNext = function() {
	return this.min < this.max;
}
IntIter.prototype.next = function() {
	return this.min++;
}
IntIter.prototype.__class__ = IntIter;
alphatab.importer.GpImporterTest = function(p) {
	if( p === $_ ) return;
	alphatab.importer.GpImporterTestBase.call(this);
}
alphatab.importer.GpImporterTest.__name__ = ["alphatab","importer","GpImporterTest"];
alphatab.importer.GpImporterTest.__super__ = alphatab.importer.GpImporterTestBase;
for(var k in alphatab.importer.GpImporterTestBase.prototype ) alphatab.importer.GpImporterTest.prototype[k] = alphatab.importer.GpImporterTestBase.prototype[k];
alphatab.importer.GpImporterTest.prototype.testReadStringIntUnused = function() {
	var reader = this.prepareImporterWithData([0,0,0,0,11,72,101,108,108,111,32,87,111,114,108,100]);
	this.assertEquals("Hello World",reader.readStringIntUnused(),{ fileName : "GpImporterTest.hx", lineNumber : 18, className : "alphatab.importer.GpImporterTest", methodName : "testReadStringIntUnused"});
}
alphatab.importer.GpImporterTest.prototype.testReadStringInt = function() {
	var reader = this.prepareImporterWithData([11,0,0,0,72,101,108,108,111,32,87,111,114,108,100]);
	this.assertEquals("Hello World",reader._data.readString(reader.readInt32()),{ fileName : "GpImporterTest.hx", lineNumber : 24, className : "alphatab.importer.GpImporterTest", methodName : "testReadStringInt"});
}
alphatab.importer.GpImporterTest.prototype.testReadStringIntByte = function() {
	var reader = this.prepareImporterWithData([12,0,0,0,11,72,101,108,108,111,32,87,111,114,108,100]);
	this.assertEquals("Hello World",reader.readStringIntByte(),{ fileName : "GpImporterTest.hx", lineNumber : 30, className : "alphatab.importer.GpImporterTest", methodName : "testReadStringIntByte"});
}
alphatab.importer.GpImporterTest.prototype.testReadStringByteLength = function() {
	var reader = this.prepareImporterWithData([11,72,101,108,108,111,32,87,111,114,108,100]);
	this.assertEquals("Hello World",reader.readStringByteLength(3),{ fileName : "GpImporterTest.hx", lineNumber : 36, className : "alphatab.importer.GpImporterTest", methodName : "testReadStringByteLength"});
}
alphatab.importer.GpImporterTest.prototype.testReadVersion = function() {
	var reader = this.prepareImporterWithData([24,70,73,67,72,73,69,82,32,71,85,73,84,65,82,32,80,82,79,32,118,51,46,48,48,0,0,0,0,0,0,24]);
	reader.readVersion();
	this.assertEquals(300,reader._versionNumber,{ fileName : "GpImporterTest.hx", lineNumber : 44, className : "alphatab.importer.GpImporterTest", methodName : "testReadVersion"});
	this.assertEquals(24,reader._data.readByte(),{ fileName : "GpImporterTest.hx", lineNumber : 45, className : "alphatab.importer.GpImporterTest", methodName : "testReadVersion"});
}
alphatab.importer.GpImporterTest.prototype.__class__ = alphatab.importer.GpImporterTest;
alphatab.importer.Gp3To5Importer = function(p) {
	if( p === $_ ) return;
	alphatab.importer.ScoreImporter.call(this);
	this._globalTripletFeel = alphatab.model.TripletFeel.NoTripletFeel;
}
alphatab.importer.Gp3To5Importer.__name__ = ["alphatab","importer","Gp3To5Importer"];
alphatab.importer.Gp3To5Importer.__super__ = alphatab.importer.ScoreImporter;
for(var k in alphatab.importer.ScoreImporter.prototype ) alphatab.importer.Gp3To5Importer.prototype[k] = alphatab.importer.ScoreImporter.prototype[k];
alphatab.importer.Gp3To5Importer.prototype._versionNumber = null;
alphatab.importer.Gp3To5Importer.prototype._score = null;
alphatab.importer.Gp3To5Importer.prototype._tempo = null;
alphatab.importer.Gp3To5Importer.prototype._keySignature = null;
alphatab.importer.Gp3To5Importer.prototype._octave = null;
alphatab.importer.Gp3To5Importer.prototype._globalTripletFeel = null;
alphatab.importer.Gp3To5Importer.prototype._lyricsIndex = null;
alphatab.importer.Gp3To5Importer.prototype._lyrics = null;
alphatab.importer.Gp3To5Importer.prototype._lyricsTrack = null;
alphatab.importer.Gp3To5Importer.prototype._barCount = null;
alphatab.importer.Gp3To5Importer.prototype._trackCount = null;
alphatab.importer.Gp3To5Importer.prototype._beatTapping = null;
alphatab.importer.Gp3To5Importer.prototype._playbackInfos = null;
alphatab.importer.Gp3To5Importer.prototype.readScore = function() {
	this.readVersion();
	this._score = new alphatab.model.Score();
	this.readScoreInformation();
	if(this._versionNumber < 500) this._globalTripletFeel = this._data.readByte() != 0?alphatab.model.TripletFeel.Triplet8th:alphatab.model.TripletFeel.NoTripletFeel;
	if(this._versionNumber >= 400) this.readLyrics();
	if(this._versionNumber >= 510) this._data.read(19);
	if(this._versionNumber >= 500) {
		this.readPageSetup();
		this._score.tempoLabel = this.readStringIntByte();
	}
	this._tempo = this.readInt32();
	if(this._versionNumber >= 510) this._data.readByte() != 0;
	this._keySignature = this.readInt32();
	if(this._versionNumber >= 400) this._octave = this._data.readByte();
	this.readPlaybackInfos();
	if(this._versionNumber >= 500) {
		this._data.read(38);
		this._data.read(4);
	}
	this._barCount = this.readInt32();
	this._trackCount = this.readInt32();
	this.readMasterBars();
	this.readTracks();
	this.readBars();
	this.finish();
	return this._score;
}
alphatab.importer.Gp3To5Importer.prototype.finish = function() {
	var _g = 0, _g1 = this._score.tracks;
	while(_g < _g1.length) {
		var t = _g1[_g];
		++_g;
		if(!t.isPercussion) {
			var _g2 = 0, _g3 = t.bars;
			while(_g2 < _g3.length) {
				var bar = _g3[_g2];
				++_g2;
				var _g4 = 0, _g5 = bar.voices;
				while(_g4 < _g5.length) {
					var v = _g5[_g4];
					++_g4;
					var _g6 = 0, _g7 = v.beats;
					while(_g6 < _g7.length) {
						var beat = _g7[_g6];
						++_g6;
						var _g8 = 0, _g9 = beat.notes;
						while(_g8 < _g9.length) {
							var n = _g9[_g8];
							++_g8;
							if(n.isTieDestination) {
								var tieOrigin = this.determineTieOrigin(n);
								if(tieOrigin == null) n.isTieDestination = false; else {
									tieOrigin.isTieOrigin = true;
									n.fret = tieOrigin.fret;
								}
							}
							if(n.isHammerPullOrigin) {
								var hammerPullDestination = this.determineHammerPullDestination(n);
								if(hammerPullDestination == null) n.isHammerPullOrigin = false; else hammerPullDestination.isHammerPullDestination = true;
							}
						}
					}
				}
			}
		}
	}
}
alphatab.importer.Gp3To5Importer.prototype.determineHammerPullDestination = function(note) {
	var nextBeat = note.beat.nextBeat;
	while(nextBeat != null) {
		var noteOnString = nextBeat.getNoteOnString(note.string);
		if(noteOnString != null) return noteOnString; else nextBeat = nextBeat.nextBeat;
	}
	return null;
}
alphatab.importer.Gp3To5Importer.prototype.determineTieOrigin = function(note) {
	var previousBeat = note.beat.previousBeat;
	while(previousBeat != null) {
		var noteOnString = previousBeat.getNoteOnString(note.string);
		if(noteOnString != null) return noteOnString; else previousBeat = previousBeat.previousBeat;
	}
	return null;
}
alphatab.importer.Gp3To5Importer.prototype.readVersion = function() {
	var version = this.readStringByteLength(30);
	if(!StringTools.startsWith(version,"FICHIER GUITAR PRO ")) throw "unsupported file";
	version = version.substr("FICHIER GUITAR PRO ".length + 1);
	var dot = version.indexOf(".");
	this._versionNumber = 100 * Std.parseInt(version.substr(0,dot)) + Std.parseInt(version.substr(dot + 1));
}
alphatab.importer.Gp3To5Importer.prototype.readScoreInformation = function() {
	this._score.title = this.readStringIntUnused();
	this._score.subTitle = this.readStringIntUnused();
	this._score.artist = this.readStringIntUnused();
	this._score.album = this.readStringIntUnused();
	this._score.words = this.readStringIntUnused();
	if(this._versionNumber >= 500) this._score.music = this.readStringIntUnused(); else this._score.music = this._score.words;
	this._score.copyright = this.readStringIntUnused();
	this._score.tab = this.readStringIntUnused();
	this._score.instructions = this.readStringIntUnused();
	var noticeLines = this.readInt32();
	var notice = new StringBuf();
	var _g = 0;
	while(_g < noticeLines) {
		var i = _g++;
		if(i > 0) notice.b[notice.b.length] = "\n" == null?"null":"\n";
		notice.add(this.readStringIntUnused());
	}
	this._score.notices = notice.b.join("");
}
alphatab.importer.Gp3To5Importer.prototype.readLyrics = function() {
	this._lyrics = new Array();
	this._lyricsIndex = new Array();
	this._lyricsTrack = this.readInt32();
	var _g = 0;
	while(_g < 5) {
		var i = _g++;
		this._lyricsIndex.push(this.readInt32() - 1);
		this._lyrics.push(this._data.readString(this.readInt32()));
	}
}
alphatab.importer.Gp3To5Importer.prototype.readPageSetup = function() {
	this._data.read(30);
	var _g = 0;
	while(_g < 10) {
		var i = _g++;
		this.readStringIntByte();
	}
}
alphatab.importer.Gp3To5Importer.prototype.readPlaybackInfos = function() {
	this._playbackInfos = new Array();
	var _g = 0;
	while(_g < 64) {
		var i = _g++;
		var info = new alphatab.model.PlaybackInformation();
		info.primaryChannel = i;
		info.secondaryChannel = i;
		info.program = this.readInt32();
		info.volume = this._data.readByte();
		info.balance = this._data.readByte();
		this._data.read(6);
		this._playbackInfos.push(info);
	}
}
alphatab.importer.Gp3To5Importer.prototype.readMasterBars = function() {
	var _g1 = 0, _g = this._barCount;
	while(_g1 < _g) {
		var i = _g1++;
		this.readMasterBar();
	}
}
alphatab.importer.Gp3To5Importer.prototype.readMasterBar = function() {
	var previousMasterBar = null;
	if(this._score.masterBars.length > 0) previousMasterBar = this._score.masterBars[this._score.masterBars.length - 1];
	var newMasterBar = new alphatab.model.MasterBar();
	var flags = this._data.readByte();
	if((flags & 1) != 0) newMasterBar.timeSignatureNumerator = this._data.readByte(); else if(previousMasterBar != null) newMasterBar.timeSignatureNumerator = previousMasterBar.timeSignatureNumerator;
	if((flags & 2) != 0) newMasterBar.timeSignatureDenominator = this._data.readByte(); else if(previousMasterBar != null) newMasterBar.timeSignatureDenominator = previousMasterBar.timeSignatureDenominator;
	newMasterBar.isRepeatStart = (flags & 4) != 0;
	if((flags & 8) != 0) {
		if(this._versionNumber >= 500) newMasterBar.repeatCount = this._data.readByte(); else newMasterBar.repeatCount = 1;
	}
	if((flags & 32) != 0) {
		var section = new alphatab.model.Section();
		section.text = this.readStringIntByte();
		section.marker = "";
		section.color = this.readColor();
		newMasterBar.section = section;
	}
	if((flags & 16) != 0 && this._versionNumber < 500) {
		var currentMasterBar = previousMasterBar;
		var existentAlternatives = 0;
		while(currentMasterBar != null) {
			if(currentMasterBar.repeatCount > 0 && currentMasterBar != previousMasterBar) break;
			if(currentMasterBar.isRepeatStart) break;
			existentAlternatives |= currentMasterBar.alternateEndings;
		}
		var repeatAlternative = 0;
		var repeatMask = this._data.readByte();
		var _g = 0;
		while(_g < 8) {
			var i = _g++;
			var repeating = 1 << i;
			if(repeatMask > i && (existentAlternatives & repeating) == 0) repeatAlternative |= repeating;
		}
		newMasterBar.alternateEndings = repeatAlternative;
	}
	if((flags & 64) != 0) {
		newMasterBar.keySignature = this._data.readInt8();
		this._data.readByte();
	} else if(previousMasterBar != null) newMasterBar.keySignature = previousMasterBar.keySignature;
	if(this._versionNumber >= 500 && (flags & 3) != 0) this._data.read(4);
	if(this._versionNumber >= 500 && (flags & 16) == 0) newMasterBar.alternateEndings = this._data.readByte();
	if(this._versionNumber >= 500) {
		var tripletFeel = this._data.readByte();
		switch(tripletFeel) {
		case 1:
			newMasterBar.tripletFeel = alphatab.model.TripletFeel.Triplet8th;
			break;
		case 2:
			newMasterBar.tripletFeel = alphatab.model.TripletFeel.Triplet16th;
			break;
		}
		this._data.readByte();
	} else newMasterBar.tripletFeel = this._globalTripletFeel;
	newMasterBar.isDoubleBar = (flags & 128) != 0;
	this._score.addMasterBar(newMasterBar);
}
alphatab.importer.Gp3To5Importer.prototype.readTracks = function() {
	var _g1 = 0, _g = this._trackCount;
	while(_g1 < _g) {
		var i = _g1++;
		this.readTrack();
	}
}
alphatab.importer.Gp3To5Importer.prototype.readTrack = function() {
	var newTrack = new alphatab.model.Track();
	var flags = this._data.readByte();
	newTrack.name = this.readStringByteLength(40);
	newTrack.isPercussion = (flags & 1) != 0;
	var stringCount = this.readInt32();
	var _g = 0;
	while(_g < 7) {
		var i = _g++;
		var tuning = this.readInt32();
		if(stringCount > i) newTrack.tuning.push(tuning);
	}
	newTrack.tuning.reverse();
	var port = this.readInt32();
	var index = this.readInt32() - 1;
	var effectChannel = this.readInt32() - 1;
	this._data.read(4);
	if(index >= 0 && index < this._playbackInfos.length) {
		var info = this._playbackInfos[index];
		info.port = port;
		info.isSolo = (flags & 16) != 0;
		info.isMute = (flags & 32) != 0;
		info.secondaryChannel = effectChannel;
		newTrack.playbackInfo = info;
	}
	newTrack.capo = this.readInt32();
	this._data.read(4);
	if(this._versionNumber >= 500) {
		this._data.readByte();
		this._data.readByte();
		this._data.read(43);
	}
	if(this._versionNumber >= 510) {
		this._data.read(4);
		this.readStringIntByte();
		this.readStringIntByte();
	}
	this._score.addTrack(newTrack);
}
alphatab.importer.Gp3To5Importer.prototype.readBars = function() {
	var _g1 = 0, _g = this._barCount;
	while(_g1 < _g) {
		var b = _g1++;
		var _g3 = 0, _g2 = this._trackCount;
		while(_g3 < _g2) {
			var t = _g3++;
			this.readBar(this._score.tracks[t]);
		}
	}
}
alphatab.importer.Gp3To5Importer.prototype.readBar = function(track) {
	var newBar = new alphatab.model.Bar();
	var voiceCount = 1;
	if(this._versionNumber >= 500) {
		this._data.readByte();
		voiceCount = 2;
	}
	var _g = 0;
	while(_g < voiceCount) {
		var v = _g++;
		this.readVoice(track,newBar);
	}
	track.addBar(newBar);
}
alphatab.importer.Gp3To5Importer.prototype.readVoice = function(track,bar) {
	var beatCount = this.readInt32();
	if(beatCount == 0) return;
	var newVoice = new alphatab.model.Voice();
	var _g = 0;
	while(_g < beatCount) {
		var i = _g++;
		this.readBeat(track,bar,newVoice);
	}
	bar.addVoice(newVoice);
}
alphatab.importer.Gp3To5Importer.prototype.readBeat = function(track,bar,voice) {
	var newBeat = new alphatab.model.Beat();
	var flags = this._data.readByte();
	if((flags & 1) != 0) newBeat.dots = 1;
	if((flags & 64) != 0) this._data.readByte();
	var duration = this._data.readInt8();
	switch(duration) {
	case -2:
		newBeat.duration = alphatab.model.Duration.Whole;
		break;
	case -1:
		newBeat.duration = alphatab.model.Duration.Half;
		break;
	case 0:
		newBeat.duration = alphatab.model.Duration.Quarter;
		break;
	case 1:
		newBeat.duration = alphatab.model.Duration.Eighth;
		break;
	case 2:
		newBeat.duration = alphatab.model.Duration.Sixteenth;
		break;
	case 3:
		newBeat.duration = alphatab.model.Duration.ThirtySecond;
		break;
	case 4:
		newBeat.duration = alphatab.model.Duration.SixtyFourth;
		break;
	default:
		newBeat.duration = alphatab.model.Duration.Quarter;
	}
	if((flags & 32) != 0) {
		newBeat.tupletNumerator = this.readInt32();
		switch(newBeat.tupletNumerator) {
		case 1:
			newBeat.tupletDenominator = 1;
			break;
		case 3:
			newBeat.tupletDenominator = 2;
			break;
		case 5:case 6:case 7:
			newBeat.tupletDenominator = 4;
			break;
		case 9:case 10:case 11:case 12:case 13:
			newBeat.tupletDenominator = 8;
			break;
		case 2:case 4:case 8:
			break;
		default:
			newBeat.tupletNumerator = 1;
			newBeat.tupletDenominator = 1;
		}
	}
	if((flags & 2) != 0) this.readChord(newBeat);
	if((flags & 4) != 0) newBeat.text = this.readStringIntUnused();
	if((flags & 8) != 0) this.readBeatEffects(newBeat);
	if((flags & 16) != 0) this.readMixTableChange(newBeat);
	var stringFlags = this._data.readByte();
	var i = 6;
	while(i >= 0) {
		if((stringFlags & 1 << i) != 0 && 6 - i < track.tuning.length) this.readNote(track,bar,voice,newBeat,i);
		i--;
	}
	if(this._versionNumber >= 500) {
		this._data.readByte();
		var flag = this._data.readByte();
		if((flag & 8) != 0) this._data.readByte();
	}
	voice.addBeat(newBeat);
}
alphatab.importer.Gp3To5Importer.prototype.readChord = function(beat) {
	var chord = new alphatab.model.Chord();
	if(this._versionNumber >= 500) {
		this._data.read(17);
		chord.name = this.readStringByteLength(21);
		this._data.read(4);
		chord.firstFret = this.readInt32();
		var _g = 0;
		while(_g < 7) {
			var i = _g++;
			var fret = this.readInt32();
			if(i < chord.strings.length) chord.strings.push(fret);
		}
		this._data.read(32);
	} else if(this._data.readByte() != 0) {
		if(this._versionNumber >= 400) {
			this._data.read(16);
			chord.name = this.readStringByteLength(21);
			this._data.read(4);
			chord.firstFret = this.readInt32();
			var _g = 0;
			while(_g < 7) {
				var i = _g++;
				var fret = this.readInt32();
				if(i < chord.strings.length) chord.strings.push(fret);
			}
			this._data.read(32);
		} else {
			this._data.read(25);
			chord.name = this.readStringByteLength(34);
			chord.firstFret = this.readInt32();
			var _g = 0;
			while(_g < 6) {
				var i = _g++;
				var fret = this.readInt32();
				chord.strings.push(fret);
			}
			this._data.read(36);
		}
	} else {
		var strings;
		if(this._versionNumber >= 406) strings = 7; else strings = 6;
		chord.name = this.readStringIntByte();
		chord.firstFret = this.readInt32();
		if(chord.firstFret > 0) {
			var _g = 0;
			while(_g < strings) {
				var i = _g++;
				var fret = this.readInt32();
				if(i < chord.strings.length) chord.strings.push(fret);
			}
		}
	}
	if(chord.name.length > 0) beat.chord = chord;
}
alphatab.importer.Gp3To5Importer.prototype.readBeatEffects = function(beat) {
	var flags = this._data.readByte();
	var flags2 = 0;
	if(this._versionNumber >= 400) flags2 = this._data.readByte();
	beat.fadeIn = (flags & 16) != 0;
	if((flags & 2) != 0) beat.vibrato = alphatab.model.VibratoType.Slight;
	beat.hasRasgueado = (flags2 & 1) != 0;
	if((flags & 32) != 0 && this._versionNumber >= 400) {
		var slapPop = this._data.readInt8();
		switch(slapPop) {
		case 1:
			this._beatTapping = true;
			break;
		case 2:
			beat.slap = true;
			break;
		case 3:
			beat.pop = true;
			break;
		}
	} else if((flags & 32) != 0) {
		var slapPop = this._data.readInt8();
		switch(slapPop) {
		case 1:
			this._beatTapping = true;
			break;
		case 2:
			beat.slap = true;
			break;
		case 3:
			beat.pop = true;
			break;
		}
		this._data.read(4);
	}
	if((flags2 & 4) != 0) this.readTremoloBarEffect(beat);
	if((flags & 64) != 0) {
		var strokeUp;
		var strokeDown;
		if(this._versionNumber < 500) {
			strokeDown = this._data.readByte();
			strokeUp = this._data.readByte();
		} else {
			strokeUp = this._data.readByte();
			strokeDown = this._data.readByte();
		}
		if(strokeUp > 0) {
			beat.brushType = alphatab.model.BrushType.BrushUp;
			beat.brushDuration = this.toStrokeValue(strokeUp);
		} else if(strokeDown > 0) {
			beat.brushType = alphatab.model.BrushType.BrushDown;
			beat.brushDuration = this.toStrokeValue(strokeDown);
		}
	}
	if((flags2 & 2) != 0) switch(this._data.readInt8()) {
	case 0:
		beat.pickStroke = alphatab.model.PickStrokeType.None;
		break;
	case 1:
		beat.pickStroke = alphatab.model.PickStrokeType.Up;
		break;
	case 2:
		beat.pickStroke = alphatab.model.PickStrokeType.Down;
		break;
	}
}
alphatab.importer.Gp3To5Importer.prototype.readTremoloBarEffect = function(beat) {
	this._data.readByte();
	this.readInt32();
	var pointCount = this.readInt32();
	if(pointCount > 0) {
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var point = new alphatab.model.BendPoint();
			point.offset = this.readInt32();
			point.value = Std["int"](this.readInt32() / 25);
			this._data.readByte() != 0;
			beat.whammyBarPoints.push(point);
		}
	}
}
alphatab.importer.Gp3To5Importer.prototype.toStrokeValue = function(value) {
	switch(value) {
	case 1:
		return 30;
	case 2:
		return 30;
	case 3:
		return 60;
	case 4:
		return 120;
	case 5:
		return 240;
	case 6:
		return 480;
	default:
		return 0;
	}
}
alphatab.importer.Gp3To5Importer.prototype.readMixTableChange = function(beat) {
	var tableChange = new alphatab.importer.MixTableChange();
	tableChange.instrument = this._data.readInt8();
	if(this._versionNumber >= 500) this._data.read(16);
	tableChange.volume = this._data.readInt8();
	tableChange.balance = this._data.readInt8();
	var chorus = this._data.readInt8();
	var reverb = this._data.readInt8();
	var phaser = this._data.readInt8();
	var tremolo = this._data.readInt8();
	if(this._versionNumber >= 500) tableChange.tempoName = this.readStringIntByte();
	tableChange.tempo = this.readInt32();
	if(tableChange.volume >= 0) this._data.readByte();
	if(tableChange.balance >= 0) this._data.readByte();
	if(chorus >= 0) this._data.readByte();
	if(reverb >= 0) this._data.readByte();
	if(phaser >= 0) this._data.readByte();
	if(tremolo >= 0) this._data.readByte();
	if(tableChange.tempo >= 0) {
		tableChange.duration = this._data.readInt8();
		if(this._versionNumber >= 510) this._data.readByte();
	}
	if(this._versionNumber >= 400) this._data.readByte();
	if(this._versionNumber >= 500) this._data.readByte();
	if(this._versionNumber >= 510) {
		this.readStringIntByte();
		this.readStringIntByte();
	}
	if(tableChange.volume >= 0) {
		var volumeAutomation = new alphatab.model.Automation();
		volumeAutomation.isLinear = true;
		volumeAutomation.type = alphatab.model.AutomationType.Volume;
		volumeAutomation.value = tableChange.volume;
		beat.automations.push(volumeAutomation);
	}
	if(tableChange.balance >= 0) {
		var balanceAutomation = new alphatab.model.Automation();
		balanceAutomation.isLinear = true;
		balanceAutomation.type = alphatab.model.AutomationType.Balance;
		balanceAutomation.value = tableChange.balance;
		beat.automations.push(balanceAutomation);
	}
	if(tableChange.instrument >= 0) {
		var instrumentAutomation = new alphatab.model.Automation();
		instrumentAutomation.isLinear = true;
		instrumentAutomation.type = alphatab.model.AutomationType.Instrument;
		instrumentAutomation.value = tableChange.instrument;
		beat.automations.push(instrumentAutomation);
	}
	if(tableChange.tempo >= 0) {
		var tempoAutomation = new alphatab.model.Automation();
		tempoAutomation.isLinear = true;
		tempoAutomation.type = alphatab.model.AutomationType.Tempo;
		tempoAutomation.value = tableChange.tempo;
		beat.automations.push(tempoAutomation);
	}
}
alphatab.importer.Gp3To5Importer.prototype.readNote = function(track,bar,voice,beat,stringIndex) {
	var newNote = new alphatab.model.Note();
	newNote.string = stringIndex;
	newNote.tapping = this._beatTapping;
	var flags = this._data.readByte();
	if((flags & 2) != 0) newNote.accentuated = alphatab.model.AccentuationType.Heavy; else if((flags & 64) != 0) newNote.accentuated = alphatab.model.AccentuationType.Normal;
	newNote.isGhost = (flags & 4) != 0;
	if((flags & 32) != 0) {
		var noteType = this._data.readByte();
		if(noteType == 3) newNote.isDead = true; else if(noteType == 2) newNote.isTieDestination = true;
	}
	if((flags & 16) != 0) {
		var dynamicNumber = this._data.readInt8();
		newNote.dynamicValue = this.toDynamicValue(dynamicNumber);
	}
	if((flags & 32) != 0) newNote.fret = this._data.readInt8();
	if((flags & 128) != 0) {
		newNote.leftHandFinger = this._data.readInt8();
		newNote.rightHandFinger = this._data.readInt8();
		newNote.isFingering = true;
	}
	if(this._versionNumber >= 500) {
		if((flags & 1) != 0) newNote.durationPercent = this.readDouble();
		this._data.readByte();
	}
	if((flags & 8) != 0) this.readNoteEffects(track,voice,beat,newNote);
	beat.addNote(newNote);
}
alphatab.importer.Gp3To5Importer.prototype.toDynamicValue = function(value) {
	switch(value + 1) {
	case 1:
		return alphatab.model.DynamicValue.PPP;
	case 2:
		return alphatab.model.DynamicValue.PP;
	case 3:
		return alphatab.model.DynamicValue.P;
	case 4:
		return alphatab.model.DynamicValue.MP;
	case 5:
		return alphatab.model.DynamicValue.MF;
	case 7:
		return alphatab.model.DynamicValue.F;
	case 8:
		return alphatab.model.DynamicValue.FF;
	case 9:
		return alphatab.model.DynamicValue.FFF;
	default:
		return alphatab.model.DynamicValue.F;
	}
}
alphatab.importer.Gp3To5Importer.prototype.readNoteEffects = function(track,voice,beat,note) {
	var flags = this._data.readByte();
	var flags2 = 0;
	if(this._versionNumber >= 400) flags2 = this._data.readByte();
	if((flags & 1) != 0) this.readBend(note);
	if((flags & 16) != 0) this.readGrace(voice,note);
	if((flags2 & 4) != 0) this.readTremoloPicking(beat);
	if((flags2 & 8) != 0) this.readSlide(note); else if(this._versionNumber < 400) {
		if((flags & 4) != 0) note.slideType = alphatab.model.SlideType.Shift;
	}
	if((flags2 & 16) != 0) this.readArtificialHarmonic(note); else if(this._versionNumber < 400) {
		if((flags & 4) != 0) {
			note.harmonicType = alphatab.model.HarmonicType.Natural;
			note.harmonicValue = this.deltaFretToHarmonicValue(note.fret);
		}
		if((flags & 8) != 0) note.harmonicType = alphatab.model.HarmonicType.Artificial;
	}
	if((flags2 & 32) != 0) this.readTrill(note);
	note.isLetRing = (flags & 8) != 0;
	note.isHammerPullOrigin = (flags & 2) != 0;
	if((flags2 & 64) != 0) note.vibrato = alphatab.model.VibratoType.Slight;
	note.isPalmMute = (flags2 & 2) != 0;
	note.isStaccato = (flags2 & 1) != 0;
}
alphatab.importer.Gp3To5Importer.prototype.readBend = function(note) {
	this._data.readByte();
	this.readInt32();
	var pointCount = this.readInt32();
	if(pointCount > 0) {
		var _g = 0;
		while(_g < pointCount) {
			var i = _g++;
			var point = new alphatab.model.BendPoint();
			point.offset = this.readInt32();
			point.value = Std["int"](this.readInt32() / 25);
			this._data.readByte() != 0;
			note.bendPoints.push(point);
		}
	}
}
alphatab.importer.Gp3To5Importer.prototype.readGrace = function(voice,note) {
	var graceBeat = new alphatab.model.Beat();
	var graceNote = new alphatab.model.Note();
	graceNote.string = note.string;
	graceNote.fret = this._data.readInt8();
	graceBeat.duration = alphatab.model.Duration.ThirtySecond;
	this._data.read(3);
	if(this._versionNumber < 500) graceBeat.graceType = alphatab.model.GraceType.BeforeBeat; else {
		var flags = this._data.readByte();
		if((flags & 2) != 0) graceBeat.graceType = alphatab.model.GraceType.OnBeat; else graceBeat.graceType = alphatab.model.GraceType.BeforeBeat;
	}
	graceBeat.addNote(graceNote);
	voice.addBeat(graceBeat);
}
alphatab.importer.Gp3To5Importer.prototype.readTremoloPicking = function(beat) {
	beat.tremoloSpeed = this._data.readByte();
}
alphatab.importer.Gp3To5Importer.prototype.readSlide = function(note) {
	if(this._versionNumber >= 500) {
		var type = this._data.readByte();
		switch(type) {
		case 1:
			note.slideType = alphatab.model.SlideType.Shift;
			break;
		case 2:
			note.slideType = alphatab.model.SlideType.Legato;
			break;
		case 4:
			note.slideType = alphatab.model.SlideType.OutDown;
			break;
		case 8:
			note.slideType = alphatab.model.SlideType.OutUp;
			break;
		case 16:
			note.slideType = alphatab.model.SlideType.IntoFromBelow;
			break;
		case 32:
			note.slideType = alphatab.model.SlideType.IntoFromAbove;
			break;
		default:
			note.slideType = alphatab.model.SlideType.None;
		}
	} else {
		var type = this._data.readInt8();
		switch(type) {
		case 1:
			note.slideType = alphatab.model.SlideType.Shift;
			break;
		case 2:
			note.slideType = alphatab.model.SlideType.Legato;
			break;
		case 3:
			note.slideType = alphatab.model.SlideType.OutDown;
			break;
		case 4:
			note.slideType = alphatab.model.SlideType.OutUp;
			break;
		case -1:
			note.slideType = alphatab.model.SlideType.IntoFromBelow;
			break;
		case -2:
			note.slideType = alphatab.model.SlideType.IntoFromAbove;
			break;
		default:
			note.slideType = alphatab.model.SlideType.None;
		}
	}
}
alphatab.importer.Gp3To5Importer.prototype.readArtificialHarmonic = function(note) {
	var type = this._data.readByte();
	if(this._versionNumber >= 500) switch(type) {
	case 1:
		note.harmonicType = alphatab.model.HarmonicType.Natural;
		note.harmonicValue = this.deltaFretToHarmonicValue(note.fret);
		break;
	case 2:
		var harmonicTone = this._data.readByte();
		var harmonicKey = this._data.readByte();
		var harmonicOctaveOffset = this._data.readByte();
		note.harmonicType = alphatab.model.HarmonicType.Artificial;
		break;
	case 3:
		note.harmonicType = alphatab.model.HarmonicType.Tap;
		note.harmonicValue = this.deltaFretToHarmonicValue(this._data.readByte());
		break;
	case 4:
		note.harmonicType = alphatab.model.HarmonicType.Pinch;
		note.harmonicValue = 12;
		break;
	case 5:
		note.harmonicType = alphatab.model.HarmonicType.Semi;
		note.harmonicValue = 12;
		break;
	} else if(this._versionNumber >= 400) switch(type) {
	case 1:
		note.harmonicType = alphatab.model.HarmonicType.Natural;
		note.harmonicValue = this.deltaFretToHarmonicValue(note.fret);
		break;
	case 3:
		note.harmonicType = alphatab.model.HarmonicType.Tap;
		break;
	case 4:
		note.harmonicType = alphatab.model.HarmonicType.Pinch;
		note.harmonicValue = 12;
		break;
	case 5:
		note.harmonicType = alphatab.model.HarmonicType.Semi;
		note.harmonicValue = 12;
		break;
	case 15:
		note.harmonicType = alphatab.model.HarmonicType.Artificial;
		note.harmonicValue = this.deltaFretToHarmonicValue(note.fret + 5);
		break;
	case 17:
		note.harmonicType = alphatab.model.HarmonicType.Artificial;
		note.harmonicValue = this.deltaFretToHarmonicValue(note.fret + 7);
		break;
	case 22:
		note.harmonicType = alphatab.model.HarmonicType.Artificial;
		note.harmonicValue = this.deltaFretToHarmonicValue(note.fret + 12);
		break;
	default:
	}
}
alphatab.importer.Gp3To5Importer.prototype.deltaFretToHarmonicValue = function(deltaFret) {
	switch(deltaFret) {
	case 2:
		return 2.4;
	case 3:
		return 3.2;
	case 4:case 5:case 7:case 9:case 12:case 16:case 17:case 19:case 24:
		return deltaFret;
	case 8:
		return 8.2;
	case 10:
		return 9.6;
	case 14:case 15:
		return 14.7;
	case 21:case 22:
		return 21.7;
	default:
		return 12;
	}
}
alphatab.importer.Gp3To5Importer.prototype.readTrill = function(note) {
	note.trillFret = this._data.readByte();
	note.trillSpeed = 1 + this._data.readByte();
}
alphatab.importer.Gp3To5Importer.prototype.readDouble = function() {
	var bytes = haxe.io.Bytes.alloc(8);
	this._data.readBytes(bytes,0,8);
	var indices;
	if(!this._data.bigEndian) indices = [7,6,5,4,3,2,1,0]; else indices = [0,1,2,3,4,5,6,7];
	var sign = 1 - (bytes.b[indices[0]] >> 7 << 1);
	var exp = (bytes.b[indices[0]] << 4 & 2047 | bytes.b[indices[1]] >> 4) - 1023;
	var sig = this.getDoubleSig(bytes,indices);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
}
alphatab.importer.Gp3To5Importer.prototype.getDoubleSig = function(bytes,indices) {
	var sig = parseInt((((bytes.b[indices[1]] & 15) << 16 | bytes.b[indices[2]] << 8 | bytes.b[indices[3]]) * Math.pow(2,32)).toString(2),2) + parseInt(((bytes.b[indices[4]] >> 7) * Math.pow(2,31)).toString(2),2) + parseInt(((bytes.b[indices[4]] & 127) << 24 | bytes.b[indices[5]] << 16 | bytes.b[indices[6]] << 8 | bytes.b[indices[7]]).toString(2),2);
	return sig;
}
alphatab.importer.Gp3To5Importer.prototype.readColor = function() {
	var color = new alphatab.model.Color();
	color.red = this._data.readByte();
	color.green = this._data.readByte();
	color.blue = this._data.readByte();
	this._data.readByte();
	return color;
}
alphatab.importer.Gp3To5Importer.prototype.readBool = function() {
	return this._data.readByte() != 0;
}
alphatab.importer.Gp3To5Importer.prototype.readUInt8 = function() {
	return this._data.readByte();
}
alphatab.importer.Gp3To5Importer.prototype.readInt32 = function() {
	var ch1 = this._data.readByte();
	var ch2 = this._data.readByte();
	var ch3 = this._data.readByte();
	var ch4 = this._data.readByte();
	return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
}
alphatab.importer.Gp3To5Importer.prototype.readStringIntUnused = function() {
	this._data.read(4);
	return this._data.readString(this._data.readByte());
}
alphatab.importer.Gp3To5Importer.prototype.readStringInt = function() {
	return this._data.readString(this.readInt32());
}
alphatab.importer.Gp3To5Importer.prototype.readStringIntByte = function() {
	var length = this.readInt32() - 1;
	this._data.readByte();
	return this._data.readString(length);
}
alphatab.importer.Gp3To5Importer.prototype.readStringByteLength = function(length) {
	var stringLength = this._data.readByte();
	var string = this._data.readString(stringLength);
	if(stringLength < length) this._data.read(length - stringLength);
	return string;
}
alphatab.importer.Gp3To5Importer.prototype.skip = function(count) {
	this._data.read(count);
}
alphatab.importer.Gp3To5Importer.prototype.__class__ = alphatab.importer.Gp3To5Importer;
ValueType = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] }
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
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
	} catch( e ) {
		cl = null;
	}
	if(cl == null || cl.__name__ == null) return null;
	return cl;
}
Type.resolveEnum = function(name) {
	var e;
	try {
		e = eval(name);
	} catch( err ) {
		e = null;
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
		if(params == null) throw "Constructor " + constr + " need parameters";
		return f.apply(e,params);
	}
	if(params != null && params.length != 0) throw "Constructor " + constr + " does not need parameters";
	return f;
}
Type.createEnumIndex = function(e,index,params) {
	var c = e.__constructs__[index];
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
	var a = e.__constructs__;
	return a.copy();
}
Type["typeof"] = function(v) {
	switch(typeof(v)) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = v.__class__;
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ != null) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
}
Type.enumEq = function(a,b) {
	if(a == b) return true;
	try {
		if(a[0] != b[0]) return false;
		var _g1 = 2, _g = a.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(!Type.enumEq(a[i],b[i])) return false;
		}
		var e = a.__enum__;
		if(e != b.__enum__ || e == null) return false;
	} catch( e ) {
		return false;
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
alphatab.model.VibratoType = { __ename__ : ["alphatab","model","VibratoType"], __constructs__ : ["None","Slight","Wide"] }
alphatab.model.VibratoType.None = ["None",0];
alphatab.model.VibratoType.None.toString = $estr;
alphatab.model.VibratoType.None.__enum__ = alphatab.model.VibratoType;
alphatab.model.VibratoType.Slight = ["Slight",1];
alphatab.model.VibratoType.Slight.toString = $estr;
alphatab.model.VibratoType.Slight.__enum__ = alphatab.model.VibratoType;
alphatab.model.VibratoType.Wide = ["Wide",2];
alphatab.model.VibratoType.Wide.toString = $estr;
alphatab.model.VibratoType.Wide.__enum__ = alphatab.model.VibratoType;
alphatab.importer.Gp5ImporterTest = function(p) {
	if( p === $_ ) return;
	alphatab.importer.GpImporterTestBase.call(this);
}
alphatab.importer.Gp5ImporterTest.__name__ = ["alphatab","importer","Gp5ImporterTest"];
alphatab.importer.Gp5ImporterTest.__super__ = alphatab.importer.GpImporterTestBase;
for(var k in alphatab.importer.GpImporterTestBase.prototype ) alphatab.importer.Gp5ImporterTest.prototype[k] = alphatab.importer.GpImporterTestBase.prototype[k];
alphatab.importer.Gp5ImporterTest.prototype.testScoreInfo = function() {
	var reader = this.prepareImporterWithFile("Test01.gp5");
	var score = reader.readScore();
	this.assertEquals("Title",score.title,{ fileName : "Gp5ImporterTest.hx", lineNumber : 38, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Subtitle",score.subTitle,{ fileName : "Gp5ImporterTest.hx", lineNumber : 39, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Artist",score.artist,{ fileName : "Gp5ImporterTest.hx", lineNumber : 40, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Album",score.album,{ fileName : "Gp5ImporterTest.hx", lineNumber : 41, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Words",score.words,{ fileName : "Gp5ImporterTest.hx", lineNumber : 42, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Music",score.music,{ fileName : "Gp5ImporterTest.hx", lineNumber : 43, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Copyright",score.copyright,{ fileName : "Gp5ImporterTest.hx", lineNumber : 44, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Tab",score.tab,{ fileName : "Gp5ImporterTest.hx", lineNumber : 45, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Instructions",score.instructions,{ fileName : "Gp5ImporterTest.hx", lineNumber : 46, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Notice1\nNotice2",score.notices,{ fileName : "Gp5ImporterTest.hx", lineNumber : 47, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals(5,score.masterBars.length,{ fileName : "Gp5ImporterTest.hx", lineNumber : 48, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals(2,score.tracks.length,{ fileName : "Gp5ImporterTest.hx", lineNumber : 49, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Track 1",score.tracks[0].name,{ fileName : "Gp5ImporterTest.hx", lineNumber : 50, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Track 2",score.tracks[1].name,{ fileName : "Gp5ImporterTest.hx", lineNumber : 51, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
}
alphatab.importer.Gp5ImporterTest.prototype.testNotes = function() {
	var reader = this.prepareImporterWithFile("Test02.gp5");
	var score = reader.readScore();
	this.checkTest02Score(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testTimeSignatures = function() {
	var reader = this.prepareImporterWithFile("Test03.gp5");
	var score = reader.readScore();
	this.checkTest03Score(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testDead = function() {
	var reader = this.prepareImporterWithFile("TestDead.gp5");
	var score = reader.readScore();
	this.checkDead(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testGrace = function() {
	var reader = this.prepareImporterWithFile("TestGrace.gp5");
	var score = reader.readScore();
	this.checkGrace(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testAccentuation = function() {
	var reader = this.prepareImporterWithFile("TestAccentuations.gp5");
	var score = reader.readScore();
	this.checkAccentuation(score,true);
}
alphatab.importer.Gp5ImporterTest.prototype.testHarmonics = function() {
	var reader = this.prepareImporterWithFile("TestHarmonics.gp5");
	var score = reader.readScore();
	this.checkHarmonics(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testHammer = function() {
	var reader = this.prepareImporterWithFile("TestHammer.gp5");
	var score = reader.readScore();
	this.checkHammer(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testBend = function() {
	var reader = this.prepareImporterWithFile("TestBends.gp5");
	var score = reader.readScore();
	this.checkBend(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testTremolo = function() {
	var reader = this.prepareImporterWithFile("TestTremolo.gp5");
	var score = reader.readScore();
	this.checkTremolo(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testSlides = function() {
	var reader = this.prepareImporterWithFile("TestSlides.gp5");
	var score = reader.readScore();
	this.checkSlides(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testVibrato = function() {
	var reader = this.prepareImporterWithFile("TestVibrato.gp5");
	var score = reader.readScore();
	this.checkVibrato(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testTrills = function() {
	var reader = this.prepareImporterWithFile("TestTrills.gp5");
	var score = reader.readScore();
	this.checkTrills(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testOtherEffects = function() {
	var reader = this.prepareImporterWithFile("TestOtherEffects.gp5");
	var score = reader.readScore();
	this.checkOtherEffects(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testFingering = function() {
	var reader = this.prepareImporterWithFile("TestFingering.gp5");
	var score = reader.readScore();
	this.checkFingering(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testStroke = function() {
	var reader = this.prepareImporterWithFile("TestStrokes.gp5");
	var score = reader.readScore();
	this.checkStroke(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testTuplets = function() {
	var reader = this.prepareImporterWithFile("TestTuplets.gp5");
	var score = reader.readScore();
	this.checkTuplets(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testRanges = function() {
	var reader = this.prepareImporterWithFile("TestRanges.gp5");
	var score = reader.readScore();
	this.checkRanges(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testEffects = function() {
	var reader = this.prepareImporterWithFile("Effects.gp5");
	var score = reader.readScore();
	this.checkEffects(score);
}
alphatab.importer.Gp5ImporterTest.prototype.testSerenade = function() {
	var reader = this.prepareImporterWithFile("Serenade.gp5");
	var score = reader.readScore();
	this.assertTrue(true,{ fileName : "Gp5ImporterTest.hx", lineNumber : 185, className : "alphatab.importer.Gp5ImporterTest", methodName : "testSerenade"});
}
alphatab.importer.Gp5ImporterTest.prototype.__class__ = alphatab.importer.Gp5ImporterTest;
alphatab.model.Section = function(p) {
}
alphatab.model.Section.__name__ = ["alphatab","model","Section"];
alphatab.model.Section.prototype.marker = null;
alphatab.model.Section.prototype.text = null;
alphatab.model.Section.prototype.color = null;
alphatab.model.Section.prototype.__class__ = alphatab.model.Section;
alphatab.model.PickStrokeType = { __ename__ : ["alphatab","model","PickStrokeType"], __constructs__ : ["None","Up","Down"] }
alphatab.model.PickStrokeType.None = ["None",0];
alphatab.model.PickStrokeType.None.toString = $estr;
alphatab.model.PickStrokeType.None.__enum__ = alphatab.model.PickStrokeType;
alphatab.model.PickStrokeType.Up = ["Up",1];
alphatab.model.PickStrokeType.Up.toString = $estr;
alphatab.model.PickStrokeType.Up.__enum__ = alphatab.model.PickStrokeType;
alphatab.model.PickStrokeType.Down = ["Down",2];
alphatab.model.PickStrokeType.Down.toString = $estr;
alphatab.model.PickStrokeType.Down.__enum__ = alphatab.model.PickStrokeType;
if(typeof js=='undefined') js = {}
js.Boot = function() { }
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__unhtml(js.Boot.__string_rec(v,"")) + "<br/>";
	var d = document.getElementById("haxe:trace");
	if(d == null) alert("No haxe:trace element defined\n" + msg); else d.innerHTML += msg;
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
}
js.Boot.__closure = function(o,f) {
	var m = o[f];
	if(m == null) return null;
	var f1 = function() {
		return m.apply(o,arguments);
	};
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
	case "object":
		if(o instanceof Array) {
			if(o.__enum__ != null) {
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
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__") {
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
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		return o.__enum__ == cl || cl == Class && o.__name__ != null || cl == Enum && o.__ename__ != null;
	}
}
js.Boot.__init = function() {
	js.Lib.isIE = typeof document!='undefined' && document.all != null && typeof window!='undefined' && window.opera == null;
	js.Lib.isOpera = typeof window!='undefined' && window.opera != null;
	Array.prototype.copy = Array.prototype.slice;
	Array.prototype.insert = function(i,x) {
		this.splice(i,0,x);
	};
	Array.prototype.remove = Array.prototype.indexOf?function(obj) {
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
	};
	Array.prototype.iterator = function() {
		return { cur : 0, arr : this, hasNext : function() {
			return this.cur < this.arr.length;
		}, next : function() {
			return this.arr[this.cur++];
		}};
	};
	if(String.prototype.cca == null) String.prototype.cca = String.prototype.charCodeAt;
	String.prototype.charCodeAt = function(i) {
		var x = this.cca(i);
		if(x != x) return null;
		return x;
	};
	var oldsub = String.prototype.substr;
	String.prototype.substr = function(pos,len) {
		if(pos != null && pos != 0 && len != null && len < 0) return "";
		if(len == null) len = this.length;
		if(pos < 0) {
			pos = this.length + pos;
			if(pos < 0) pos = 0;
		} else if(len < 0) len = this.length + len - pos;
		return oldsub.apply(this,[pos,len]);
	};
	$closure = js.Boot.__closure;
}
js.Boot.prototype.__class__ = js.Boot;
alphatab.model.BendPoint = function(p) {
}
alphatab.model.BendPoint.__name__ = ["alphatab","model","BendPoint"];
alphatab.model.BendPoint.prototype.offset = null;
alphatab.model.BendPoint.prototype.value = null;
alphatab.model.BendPoint.prototype.__class__ = alphatab.model.BendPoint;
StringBuf = function(p) {
	if( p === $_ ) return;
	this.b = new Array();
}
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype.add = function(x) {
	this.b[this.b.length] = x == null?"null":x;
}
StringBuf.prototype.addSub = function(s,pos,len) {
	this.b[this.b.length] = s.substr(pos,len);
}
StringBuf.prototype.addChar = function(c) {
	this.b[this.b.length] = String.fromCharCode(c);
}
StringBuf.prototype.toString = function() {
	return this.b.join("");
}
StringBuf.prototype.b = null;
StringBuf.prototype.__class__ = StringBuf;
alphatab.model.Color = function(p) {
}
alphatab.model.Color.__name__ = ["alphatab","model","Color"];
alphatab.model.Color.prototype.red = null;
alphatab.model.Color.prototype.green = null;
alphatab.model.Color.prototype.blue = null;
alphatab.model.Color.prototype.__class__ = alphatab.model.Color;
alphatab.platform.svg.FontSizes = function() { }
alphatab.platform.svg.FontSizes.__name__ = ["alphatab","platform","svg","FontSizes"];
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
		var code = Std["int"](Math.min(data.length - 1,s.charCodeAt(i))) - alphatab.platform.svg.FontSizes.CONTROL_CHARS;
		if(code >= 0) {
			var charSize = data[code];
			stringSize += Std["int"](data[code] * size / dataSize);
		}
	}
	return stringSize;
}
alphatab.platform.svg.FontSizes.prototype.__class__ = alphatab.platform.svg.FontSizes;
alphatab.model.Voice = function(p) {
	if( p === $_ ) return;
	this.beats = new Array();
}
alphatab.model.Voice.__name__ = ["alphatab","model","Voice"];
alphatab.model.Voice.prototype.index = null;
alphatab.model.Voice.prototype.bar = null;
alphatab.model.Voice.prototype.beats = null;
alphatab.model.Voice.prototype.addBeat = function(beat) {
	beat.voice = this;
	beat.index = this.beats.length;
	if(this.beats.length > 0) {
		beat.previousBeat = this.beats[this.beats.length - 1];
		beat.previousBeat.nextBeat = beat;
	}
	this.beats.push(beat);
}
alphatab.model.Voice.prototype.__class__ = alphatab.model.Voice;
haxe.io.Output = function() { }
haxe.io.Output.__name__ = ["haxe","io","Output"];
haxe.io.Output.prototype.bigEndian = null;
haxe.io.Output.prototype.writeByte = function(c) {
	throw "Not implemented";
}
haxe.io.Output.prototype.writeBytes = function(s,pos,len) {
	var k = len;
	var b = s.b;
	if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
	while(k > 0) {
		this.writeByte(b[pos]);
		pos++;
		k--;
	}
	return len;
}
haxe.io.Output.prototype.flush = function() {
}
haxe.io.Output.prototype.close = function() {
}
haxe.io.Output.prototype.setEndian = function(b) {
	this.bigEndian = b;
	return b;
}
haxe.io.Output.prototype.write = function(s) {
	var l = s.length;
	var p = 0;
	while(l > 0) {
		var k = this.writeBytes(s,p,l);
		if(k == 0) throw haxe.io.Error.Blocked;
		p += k;
		l -= k;
	}
}
haxe.io.Output.prototype.writeFullBytes = function(s,pos,len) {
	while(len > 0) {
		var k = this.writeBytes(s,pos,len);
		pos += k;
		len -= k;
	}
}
haxe.io.Output.prototype.writeFloat = function(x) {
	throw "Not implemented";
}
haxe.io.Output.prototype.writeDouble = function(x) {
	throw "Not implemented";
}
haxe.io.Output.prototype.writeInt8 = function(x) {
	if(x < -128 || x >= 128) throw haxe.io.Error.Overflow;
	this.writeByte(x & 255);
}
haxe.io.Output.prototype.writeInt16 = function(x) {
	if(x < -32768 || x >= 32768) throw haxe.io.Error.Overflow;
	this.writeUInt16(x & 65535);
}
haxe.io.Output.prototype.writeUInt16 = function(x) {
	if(x < 0 || x >= 65536) throw haxe.io.Error.Overflow;
	if(this.bigEndian) {
		this.writeByte(x >> 8);
		this.writeByte(x & 255);
	} else {
		this.writeByte(x & 255);
		this.writeByte(x >> 8);
	}
}
haxe.io.Output.prototype.writeInt24 = function(x) {
	if(x < -8388608 || x >= 8388608) throw haxe.io.Error.Overflow;
	this.writeUInt24(x & 16777215);
}
haxe.io.Output.prototype.writeUInt24 = function(x) {
	if(x < 0 || x >= 16777216) throw haxe.io.Error.Overflow;
	if(this.bigEndian) {
		this.writeByte(x >> 16);
		this.writeByte(x >> 8 & 255);
		this.writeByte(x & 255);
	} else {
		this.writeByte(x & 255);
		this.writeByte(x >> 8 & 255);
		this.writeByte(x >> 16);
	}
}
haxe.io.Output.prototype.writeInt31 = function(x) {
	if(x < -1073741824 || x >= 1073741824) throw haxe.io.Error.Overflow;
	if(this.bigEndian) {
		this.writeByte(x >>> 24);
		this.writeByte(x >> 16 & 255);
		this.writeByte(x >> 8 & 255);
		this.writeByte(x & 255);
	} else {
		this.writeByte(x & 255);
		this.writeByte(x >> 8 & 255);
		this.writeByte(x >> 16 & 255);
		this.writeByte(x >>> 24);
	}
}
haxe.io.Output.prototype.writeUInt30 = function(x) {
	if(x < 0 || x >= 1073741824) throw haxe.io.Error.Overflow;
	if(this.bigEndian) {
		this.writeByte(x >>> 24);
		this.writeByte(x >> 16 & 255);
		this.writeByte(x >> 8 & 255);
		this.writeByte(x & 255);
	} else {
		this.writeByte(x & 255);
		this.writeByte(x >> 8 & 255);
		this.writeByte(x >> 16 & 255);
		this.writeByte(x >>> 24);
	}
}
haxe.io.Output.prototype.writeInt32 = function(x) {
	if(this.bigEndian) {
		this.writeByte(haxe.Int32.toInt(x >>> 24));
		this.writeByte(haxe.Int32.toInt(x >>> 16) & 255);
		this.writeByte(haxe.Int32.toInt(x >>> 8) & 255);
		this.writeByte(haxe.Int32.toInt(x & (255 | 0)));
	} else {
		this.writeByte(haxe.Int32.toInt(x & (255 | 0)));
		this.writeByte(haxe.Int32.toInt(x >>> 8) & 255);
		this.writeByte(haxe.Int32.toInt(x >>> 16) & 255);
		this.writeByte(haxe.Int32.toInt(x >>> 24));
	}
}
haxe.io.Output.prototype.prepare = function(nbytes) {
}
haxe.io.Output.prototype.writeInput = function(i,bufsize) {
	if(bufsize == null) bufsize = 4096;
	var buf = haxe.io.Bytes.alloc(bufsize);
	try {
		while(true) {
			var len = i.readBytes(buf,0,bufsize);
			if(len == 0) throw haxe.io.Error.Blocked;
			var p = 0;
			while(len > 0) {
				var k = this.writeBytes(buf,p,len);
				if(k == 0) throw haxe.io.Error.Blocked;
				p += k;
				len -= k;
			}
		}
	} catch( e ) {
		if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
		} else throw(e);
	}
}
haxe.io.Output.prototype.writeString = function(s) {
	var b = haxe.io.Bytes.ofString(s);
	this.writeFullBytes(b,0,b.length);
}
haxe.io.Output.prototype.__class__ = haxe.io.Output;
alphatab.platform.js.Html5Canvas = function(dom) {
	if( dom === $_ ) return;
	this._canvas = dom;
	this._context = dom.getContext("2d");
}
alphatab.platform.js.Html5Canvas.__name__ = ["alphatab","platform","js","Html5Canvas"];
alphatab.platform.js.Html5Canvas.prototype._canvas = null;
alphatab.platform.js.Html5Canvas.prototype._context = null;
alphatab.platform.js.Html5Canvas.prototype.width = null;
alphatab.platform.js.Html5Canvas.prototype.height = null;
alphatab.platform.js.Html5Canvas.prototype.getWidth = function() {
	return this._canvas.offsetWidth;
}
alphatab.platform.js.Html5Canvas.prototype.getHeight = function() {
	return this._canvas.offsetHeight;
}
alphatab.platform.js.Html5Canvas.prototype.setWidth = function(width) {
	this._canvas.width = width;
	this._context = this._canvas.getContext("2d");
	return width;
}
alphatab.platform.js.Html5Canvas.prototype.setHeight = function(height) {
	this._canvas.height = height;
	this._context = this._canvas.getContext("2d");
	return height;
}
alphatab.platform.js.Html5Canvas.prototype.strokeStyle = null;
alphatab.platform.js.Html5Canvas.prototype.getStrokeStyle = function() {
	return this._context.strokeStyle;
}
alphatab.platform.js.Html5Canvas.prototype.setStrokeStyle = function(value) {
	this._context.strokeStyle = value;
	return this._context.strokeStyle;
}
alphatab.platform.js.Html5Canvas.prototype.fillStyle = null;
alphatab.platform.js.Html5Canvas.prototype.getFillStyle = function() {
	return this._context.fillStyle;
}
alphatab.platform.js.Html5Canvas.prototype.setFillStyle = function(value) {
	this._context.fillStyle = value;
	return this._context.fillStyle;
}
alphatab.platform.js.Html5Canvas.prototype.lineWidth = null;
alphatab.platform.js.Html5Canvas.prototype.getLineWidth = function() {
	return this._context.lineWidth;
}
alphatab.platform.js.Html5Canvas.prototype.setLineWidth = function(value) {
	this._context.lineWidth = value;
	return this._context.lineWidth;
}
alphatab.platform.js.Html5Canvas.prototype.clear = function() {
	this._context.clearRect(0,0,this.getWidth(),this.getHeight());
}
alphatab.platform.js.Html5Canvas.prototype.fillRect = function(x,y,w,h) {
	this._context.fillRect(x,y,w,h);
}
alphatab.platform.js.Html5Canvas.prototype.strokeRect = function(x,y,w,h) {
	this._context.strokeRect(x,y,w,h);
}
alphatab.platform.js.Html5Canvas.prototype.beginPath = function() {
	this._context.beginPath();
}
alphatab.platform.js.Html5Canvas.prototype.closePath = function() {
	this._context.closePath();
}
alphatab.platform.js.Html5Canvas.prototype.moveTo = function(x,y) {
	this._context.moveTo(x,y);
}
alphatab.platform.js.Html5Canvas.prototype.lineTo = function(x,y) {
	this._context.lineTo(x,y);
}
alphatab.platform.js.Html5Canvas.prototype.quadraticCurveTo = function(cpx,cpy,x,y) {
	this._context.quadraticCurveTo(cpx,cpy,x,y);
}
alphatab.platform.js.Html5Canvas.prototype.bezierCurveTo = function(cp1x,cp1y,cp2x,cp2y,x,y) {
	this._context.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);
}
alphatab.platform.js.Html5Canvas.prototype.circle = function(x,y,radius) {
	this._context.arc(x,y,radius,0,Math.PI * 2,true);
}
alphatab.platform.js.Html5Canvas.prototype.rect = function(x,y,w,h) {
	this._context.rect(x,y,w,h);
}
alphatab.platform.js.Html5Canvas.prototype.fill = function() {
	this._context.fill();
}
alphatab.platform.js.Html5Canvas.prototype.stroke = function() {
	this._context.stroke();
}
alphatab.platform.js.Html5Canvas.prototype.font = null;
alphatab.platform.js.Html5Canvas.prototype.getFont = function() {
	return this._context.font;
}
alphatab.platform.js.Html5Canvas.prototype.setFont = function(value) {
	this._context.font = value;
	return this._context.font;
}
alphatab.platform.js.Html5Canvas.prototype.textBaseline = null;
alphatab.platform.js.Html5Canvas.prototype.getTextBaseline = function() {
	return this._context.textBaseline;
}
alphatab.platform.js.Html5Canvas.prototype.setTextBaseline = function(value) {
	this._context.textBaseline = value;
	return this._context.textBaseLine;
}
alphatab.platform.js.Html5Canvas.prototype.textAlign = null;
alphatab.platform.js.Html5Canvas.prototype.getTextAlign = function() {
	return this._context.textAlign;
}
alphatab.platform.js.Html5Canvas.prototype.setTextAlign = function(value) {
	this._context.textAlign = value;
	return this._context.textAlign;
}
alphatab.platform.js.Html5Canvas.prototype.fillText = function(text,x,y,maxWidth) {
	if(maxWidth == null) maxWidth = 0;
	if(maxWidth == 0) this._context.fillText(text,x,y); else this._context.fillText(text,x,y,maxWidth);
}
alphatab.platform.js.Html5Canvas.prototype.strokeText = function(text,x,y,maxWidth) {
	if(maxWidth == null) maxWidth = 0;
	if(maxWidth == 0) this._context.strokeText(text,x,y); else this._context.strokeText(text,x,y,maxWidth);
}
alphatab.platform.js.Html5Canvas.prototype.measureText = function(text) {
	return this._context.measureText(text).width;
}
alphatab.platform.js.Html5Canvas.prototype.__class__ = alphatab.platform.js.Html5Canvas;
alphatab.platform.js.Html5Canvas.__interfaces__ = [alphatab.platform.Canvas];
alphatab.model.SlideType = { __ename__ : ["alphatab","model","SlideType"], __constructs__ : ["None","Shift","Legato","IntoFromBelow","IntoFromAbove","OutUp","OutDown"] }
alphatab.model.SlideType.None = ["None",0];
alphatab.model.SlideType.None.toString = $estr;
alphatab.model.SlideType.None.__enum__ = alphatab.model.SlideType;
alphatab.model.SlideType.Shift = ["Shift",1];
alphatab.model.SlideType.Shift.toString = $estr;
alphatab.model.SlideType.Shift.__enum__ = alphatab.model.SlideType;
alphatab.model.SlideType.Legato = ["Legato",2];
alphatab.model.SlideType.Legato.toString = $estr;
alphatab.model.SlideType.Legato.__enum__ = alphatab.model.SlideType;
alphatab.model.SlideType.IntoFromBelow = ["IntoFromBelow",3];
alphatab.model.SlideType.IntoFromBelow.toString = $estr;
alphatab.model.SlideType.IntoFromBelow.__enum__ = alphatab.model.SlideType;
alphatab.model.SlideType.IntoFromAbove = ["IntoFromAbove",4];
alphatab.model.SlideType.IntoFromAbove.toString = $estr;
alphatab.model.SlideType.IntoFromAbove.__enum__ = alphatab.model.SlideType;
alphatab.model.SlideType.OutUp = ["OutUp",5];
alphatab.model.SlideType.OutUp.toString = $estr;
alphatab.model.SlideType.OutUp.__enum__ = alphatab.model.SlideType;
alphatab.model.SlideType.OutDown = ["OutDown",6];
alphatab.model.SlideType.OutDown.toString = $estr;
alphatab.model.SlideType.OutDown.__enum__ = alphatab.model.SlideType;
alphatab.model.Clef = { __ename__ : ["alphatab","model","Clef"], __constructs__ : ["C3","C4","F4","G2"] }
alphatab.model.Clef.C3 = ["C3",0];
alphatab.model.Clef.C3.toString = $estr;
alphatab.model.Clef.C3.__enum__ = alphatab.model.Clef;
alphatab.model.Clef.C4 = ["C4",1];
alphatab.model.Clef.C4.toString = $estr;
alphatab.model.Clef.C4.__enum__ = alphatab.model.Clef;
alphatab.model.Clef.F4 = ["F4",2];
alphatab.model.Clef.F4.toString = $estr;
alphatab.model.Clef.F4.__enum__ = alphatab.model.Clef;
alphatab.model.Clef.G2 = ["G2",3];
alphatab.model.Clef.G2.toString = $estr;
alphatab.model.Clef.G2.__enum__ = alphatab.model.Clef;
alphatab.model.Chord = function(p) {
	if( p === $_ ) return;
	this.strings = new Array();
}
alphatab.model.Chord.__name__ = ["alphatab","model","Chord"];
alphatab.model.Chord.prototype.name = null;
alphatab.model.Chord.prototype.firstFret = null;
alphatab.model.Chord.prototype.strings = null;
alphatab.model.Chord.prototype.__class__ = alphatab.model.Chord;
alphatab.model.PlaybackInformation = function(p) {
}
alphatab.model.PlaybackInformation.__name__ = ["alphatab","model","PlaybackInformation"];
alphatab.model.PlaybackInformation.prototype.volume = null;
alphatab.model.PlaybackInformation.prototype.balance = null;
alphatab.model.PlaybackInformation.prototype.port = null;
alphatab.model.PlaybackInformation.prototype.program = null;
alphatab.model.PlaybackInformation.prototype.primaryChannel = null;
alphatab.model.PlaybackInformation.prototype.secondaryChannel = null;
alphatab.model.PlaybackInformation.prototype.isMute = null;
alphatab.model.PlaybackInformation.prototype.isSolo = null;
alphatab.model.PlaybackInformation.prototype.__class__ = alphatab.model.PlaybackInformation;
haxe.Log = function() { }
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Log.clear = function() {
	js.Boot.__clear_trace();
}
haxe.Log.prototype.__class__ = haxe.Log;
alphatab.platform.PlatformFactory = function() { }
alphatab.platform.PlatformFactory.__name__ = ["alphatab","platform","PlatformFactory"];
alphatab.platform.PlatformFactory.getLoader = function() {
	return new alphatab.platform.js.JsFileLoader();
}
alphatab.platform.PlatformFactory.getCanvas = function(object) {
	if(object == alphatab.platform.PlatformFactory.SVG_CANVAS) return new alphatab.platform.svg.SvgCanvas();
	return new alphatab.platform.js.Html5Canvas(object);
}
alphatab.platform.PlatformFactory.prototype.__class__ = alphatab.platform.PlatformFactory;
alphatab.importer.Gp4ImporterTest = function(p) {
	if( p === $_ ) return;
	alphatab.importer.GpImporterTestBase.call(this);
}
alphatab.importer.Gp4ImporterTest.__name__ = ["alphatab","importer","Gp4ImporterTest"];
alphatab.importer.Gp4ImporterTest.__super__ = alphatab.importer.GpImporterTestBase;
for(var k in alphatab.importer.GpImporterTestBase.prototype ) alphatab.importer.Gp4ImporterTest.prototype[k] = alphatab.importer.GpImporterTestBase.prototype[k];
alphatab.importer.Gp4ImporterTest.prototype.testScoreInfo = function() {
	var reader = this.prepareImporterWithFile("Test01.gp4");
	var score = reader.readScore();
	this.assertEquals("Title",score.title,{ fileName : "Gp4ImporterTest.hx", lineNumber : 15, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Subtitle",score.subTitle,{ fileName : "Gp4ImporterTest.hx", lineNumber : 16, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Artist",score.artist,{ fileName : "Gp4ImporterTest.hx", lineNumber : 17, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Album",score.album,{ fileName : "Gp4ImporterTest.hx", lineNumber : 18, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Music",score.words,{ fileName : "Gp4ImporterTest.hx", lineNumber : 19, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Music",score.music,{ fileName : "Gp4ImporterTest.hx", lineNumber : 20, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Copyright",score.copyright,{ fileName : "Gp4ImporterTest.hx", lineNumber : 21, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Tab",score.tab,{ fileName : "Gp4ImporterTest.hx", lineNumber : 22, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Instructions",score.instructions,{ fileName : "Gp4ImporterTest.hx", lineNumber : 23, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Notice1\nNotice2",score.notices,{ fileName : "Gp4ImporterTest.hx", lineNumber : 24, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals(5,score.masterBars.length,{ fileName : "Gp4ImporterTest.hx", lineNumber : 25, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals(1,score.tracks.length,{ fileName : "Gp4ImporterTest.hx", lineNumber : 26, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	this.assertEquals("Track 1",score.tracks[0].name,{ fileName : "Gp4ImporterTest.hx", lineNumber : 27, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
}
alphatab.importer.Gp4ImporterTest.prototype.testNotes = function() {
	var reader = this.prepareImporterWithFile("Test02.gp4");
	var score = reader.readScore();
	this.checkTest02Score(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testTimeSignatures = function() {
	var reader = this.prepareImporterWithFile("Test03.gp4");
	var score = reader.readScore();
	this.checkTest03Score(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testDead = function() {
	var reader = this.prepareImporterWithFile("TestDead.gp4");
	var score = reader.readScore();
	this.checkDead(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testGrace = function() {
	var reader = this.prepareImporterWithFile("TestGrace.gp4");
	var score = reader.readScore();
	this.checkGrace(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testAccentuation = function() {
	var reader = this.prepareImporterWithFile("TestAccentuations.gp4");
	var score = reader.readScore();
	this.checkAccentuation(score,false);
}
alphatab.importer.Gp4ImporterTest.prototype.testHarmonics = function() {
	var reader = this.prepareImporterWithFile("TestHarmonics.gp4");
	var score = reader.readScore();
	this.checkHarmonics(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testHammer = function() {
	var reader = this.prepareImporterWithFile("TestHammer.gp4");
	var score = reader.readScore();
	this.checkHammer(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testBend = function() {
	var reader = this.prepareImporterWithFile("TestBends.gp4");
	var score = reader.readScore();
	this.checkBend(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testTremolo = function() {
	var reader = this.prepareImporterWithFile("TestTremolo.gp4");
	var score = reader.readScore();
	this.checkTremolo(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testSlides = function() {
	var reader = this.prepareImporterWithFile("TestSlides.gp4");
	var score = reader.readScore();
	this.checkSlides(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testVibrato = function() {
	var reader = this.prepareImporterWithFile("TestVibrato.gp4");
	var score = reader.readScore();
	this.checkVibrato(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testTrills = function() {
	var reader = this.prepareImporterWithFile("TestTrills.gp4");
	var score = reader.readScore();
	this.checkTrills(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testOtherEffects = function() {
	var reader = this.prepareImporterWithFile("TestOtherEffects.gp4");
	var score = reader.readScore();
	this.checkOtherEffects(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testFingering = function() {
	var reader = this.prepareImporterWithFile("TestFingering.gp4");
	var score = reader.readScore();
	this.checkFingering(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testStroke = function() {
	var reader = this.prepareImporterWithFile("TestStrokes.gp4");
	var score = reader.readScore();
	this.checkStroke(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testTuplets = function() {
	var reader = this.prepareImporterWithFile("TestTuplets.gp4");
	var score = reader.readScore();
	this.checkTuplets(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testRanges = function() {
	var reader = this.prepareImporterWithFile("TestRanges.gp4");
	var score = reader.readScore();
	this.checkRanges(score);
}
alphatab.importer.Gp4ImporterTest.prototype.testEffects = function() {
	var reader = this.prepareImporterWithFile("Effects.gp4");
	var score = reader.readScore();
	this.checkEffects(score);
}
alphatab.importer.Gp4ImporterTest.prototype.__class__ = alphatab.importer.Gp4ImporterTest;
alphatab.model.Track = function(p) {
	if( p === $_ ) return;
	this.tuning = new Array();
	this.bars = new Array();
}
alphatab.model.Track.__name__ = ["alphatab","model","Track"];
alphatab.model.Track.prototype.capo = null;
alphatab.model.Track.prototype.index = null;
alphatab.model.Track.prototype.name = null;
alphatab.model.Track.prototype.shortName = null;
alphatab.model.Track.prototype.tuning = null;
alphatab.model.Track.prototype.tuningName = null;
alphatab.model.Track.prototype.playbackInfo = null;
alphatab.model.Track.prototype.isPercussion = null;
alphatab.model.Track.prototype.score = null;
alphatab.model.Track.prototype.bars = null;
alphatab.model.Track.prototype.addBar = function(bar) {
	bar.track = this;
	bar.index = this.bars.length;
	if(this.bars.length > 0) {
		bar.previousBar = this.bars[this.bars.length - 1];
		bar.previousBar.nextBar = bar;
	}
	this.bars.push(bar);
}
alphatab.model.Track.prototype.__class__ = alphatab.model.Track;
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
	var v = parseInt(x,10);
	if(v == 0 && x.charCodeAt(1) == 120) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
Std.prototype.__class__ = Std;
alphatab.model.DynamicValue = { __ename__ : ["alphatab","model","DynamicValue"], __constructs__ : ["PPP","PP","P","MP","MF","F","FF","FFF"] }
alphatab.model.DynamicValue.PPP = ["PPP",0];
alphatab.model.DynamicValue.PPP.toString = $estr;
alphatab.model.DynamicValue.PPP.__enum__ = alphatab.model.DynamicValue;
alphatab.model.DynamicValue.PP = ["PP",1];
alphatab.model.DynamicValue.PP.toString = $estr;
alphatab.model.DynamicValue.PP.__enum__ = alphatab.model.DynamicValue;
alphatab.model.DynamicValue.P = ["P",2];
alphatab.model.DynamicValue.P.toString = $estr;
alphatab.model.DynamicValue.P.__enum__ = alphatab.model.DynamicValue;
alphatab.model.DynamicValue.MP = ["MP",3];
alphatab.model.DynamicValue.MP.toString = $estr;
alphatab.model.DynamicValue.MP.__enum__ = alphatab.model.DynamicValue;
alphatab.model.DynamicValue.MF = ["MF",4];
alphatab.model.DynamicValue.MF.toString = $estr;
alphatab.model.DynamicValue.MF.__enum__ = alphatab.model.DynamicValue;
alphatab.model.DynamicValue.F = ["F",5];
alphatab.model.DynamicValue.F.toString = $estr;
alphatab.model.DynamicValue.F.__enum__ = alphatab.model.DynamicValue;
alphatab.model.DynamicValue.FF = ["FF",6];
alphatab.model.DynamicValue.FF.toString = $estr;
alphatab.model.DynamicValue.FF.__enum__ = alphatab.model.DynamicValue;
alphatab.model.DynamicValue.FFF = ["FFF",7];
alphatab.model.DynamicValue.FFF.toString = $estr;
alphatab.model.DynamicValue.FFF.__enum__ = alphatab.model.DynamicValue;
alphatab.model.HarmonicType = { __ename__ : ["alphatab","model","HarmonicType"], __constructs__ : ["None","Natural","Artificial","Pinch","Tap","Semi","Feedback"] }
alphatab.model.HarmonicType.None = ["None",0];
alphatab.model.HarmonicType.None.toString = $estr;
alphatab.model.HarmonicType.None.__enum__ = alphatab.model.HarmonicType;
alphatab.model.HarmonicType.Natural = ["Natural",1];
alphatab.model.HarmonicType.Natural.toString = $estr;
alphatab.model.HarmonicType.Natural.__enum__ = alphatab.model.HarmonicType;
alphatab.model.HarmonicType.Artificial = ["Artificial",2];
alphatab.model.HarmonicType.Artificial.toString = $estr;
alphatab.model.HarmonicType.Artificial.__enum__ = alphatab.model.HarmonicType;
alphatab.model.HarmonicType.Pinch = ["Pinch",3];
alphatab.model.HarmonicType.Pinch.toString = $estr;
alphatab.model.HarmonicType.Pinch.__enum__ = alphatab.model.HarmonicType;
alphatab.model.HarmonicType.Tap = ["Tap",4];
alphatab.model.HarmonicType.Tap.toString = $estr;
alphatab.model.HarmonicType.Tap.__enum__ = alphatab.model.HarmonicType;
alphatab.model.HarmonicType.Semi = ["Semi",5];
alphatab.model.HarmonicType.Semi.toString = $estr;
alphatab.model.HarmonicType.Semi.__enum__ = alphatab.model.HarmonicType;
alphatab.model.HarmonicType.Feedback = ["Feedback",6];
alphatab.model.HarmonicType.Feedback.toString = $estr;
alphatab.model.HarmonicType.Feedback.__enum__ = alphatab.model.HarmonicType;
alphatab.platform.svg.SvgCanvas = function(p) {
	if( p === $_ ) return;
	this._buffer = new StringBuf();
	this._currentPath = new StringBuf();
	this._currentPathIsEmpty = true;
	this.setStrokeStyle("#FFFFFF");
	this.setFillStyle("#FFFFFF");
	this.setLineWidth(1);
	this._width = 0;
	this._height = 0;
	this.setFont("10px sans-serif");
	this.setTextBaseline("alphabetic");
	this.setTextAlign("left");
}
alphatab.platform.svg.SvgCanvas.__name__ = ["alphatab","platform","svg","SvgCanvas"];
alphatab.platform.svg.SvgCanvas.prototype._buffer = null;
alphatab.platform.svg.SvgCanvas.prototype._currentPath = null;
alphatab.platform.svg.SvgCanvas.prototype._currentPathIsEmpty = null;
alphatab.platform.svg.SvgCanvas.prototype._width = null;
alphatab.platform.svg.SvgCanvas.prototype._height = null;
alphatab.platform.svg.SvgCanvas.prototype.writeTo = function(stream,includeWrapper,className) {
	if(includeWrapper) {
		stream.writeString("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"");
		alphatab.io.OutputExtensions.writeAsString(stream,this._width);
		stream.writeString("px\" height=\"");
		alphatab.io.OutputExtensions.writeAsString(stream,this._height);
		stream.writeString("px\"");
		if(className != null) {
			stream.writeString(" class=\"");
			stream.writeString(className);
			stream.writeString("\"");
		}
		stream.writeString(">\n");
	}
	stream.writeString(this._buffer.b.join(""));
	if(includeWrapper) stream.writeString("</svg>");
}
alphatab.platform.svg.SvgCanvas.prototype.toSvg = function(includeWrapper,className) {
	var out = new haxe.io.BytesOutput();
	this.writeTo(out,includeWrapper,className);
	out.flush();
	return out.getBytes().toString();
}
alphatab.platform.svg.SvgCanvas.prototype.width = null;
alphatab.platform.svg.SvgCanvas.prototype.height = null;
alphatab.platform.svg.SvgCanvas.prototype.getWidth = function() {
	return this._width;
}
alphatab.platform.svg.SvgCanvas.prototype.getHeight = function() {
	return this._height;
}
alphatab.platform.svg.SvgCanvas.prototype.setWidth = function(width) {
	this._width = width;
	return this._width;
}
alphatab.platform.svg.SvgCanvas.prototype.setHeight = function(height) {
	this._height = height;
	return this._height;
}
alphatab.platform.svg.SvgCanvas.prototype._strokeStyle = null;
alphatab.platform.svg.SvgCanvas.prototype.strokeStyle = null;
alphatab.platform.svg.SvgCanvas.prototype.getStrokeStyle = function() {
	return this._strokeStyle;
}
alphatab.platform.svg.SvgCanvas.prototype.setStrokeStyle = function(value) {
	this._strokeStyle = value;
	return this._strokeStyle;
}
alphatab.platform.svg.SvgCanvas.prototype._fillStyle = null;
alphatab.platform.svg.SvgCanvas.prototype.fillStyle = null;
alphatab.platform.svg.SvgCanvas.prototype.getFillStyle = function() {
	return this._fillStyle;
}
alphatab.platform.svg.SvgCanvas.prototype.setFillStyle = function(value) {
	this._fillStyle = value;
	return this._fillStyle;
}
alphatab.platform.svg.SvgCanvas.prototype._lineWidth = null;
alphatab.platform.svg.SvgCanvas.prototype.lineWidth = null;
alphatab.platform.svg.SvgCanvas.prototype.getLineWidth = function() {
	return this._lineWidth;
}
alphatab.platform.svg.SvgCanvas.prototype.setLineWidth = function(value) {
	this._lineWidth = value;
	return this._lineWidth;
}
alphatab.platform.svg.SvgCanvas.prototype.clear = function() {
	this._buffer = new StringBuf();
	this._currentPath = new StringBuf();
	this._currentPathIsEmpty = true;
}
alphatab.platform.svg.SvgCanvas.prototype.fillRect = function(x,y,w,h) {
	this._buffer.add("<rect x=\"");
	this._buffer.add(x);
	this._buffer.add("\" y=\"");
	this._buffer.add(y);
	this._buffer.add("\" width=\"");
	this._buffer.add(w);
	this._buffer.add("\" height=\"");
	this._buffer.add(h);
	this._buffer.add("\" style=\"fill:");
	this._buffer.add(this.getFillStyle());
	this._buffer.add(";\" />\n");
}
alphatab.platform.svg.SvgCanvas.prototype.strokeRect = function(x,y,w,h) {
	this._buffer.add("<rect x=\"");
	this._buffer.add(x);
	this._buffer.add("\" y=\"");
	this._buffer.add(y);
	this._buffer.add("\" width=\"");
	this._buffer.add(w);
	this._buffer.add("\" height=\"");
	this._buffer.add(h);
	this._buffer.add("\" style=\"stroke:");
	this._buffer.add(this.getStrokeStyle());
	this._buffer.add("; stroke-width:");
	this._buffer.add(this.getLineWidth());
	this._buffer.add(";\" />\n");
}
alphatab.platform.svg.SvgCanvas.prototype.beginPath = function() {
}
alphatab.platform.svg.SvgCanvas.prototype.closePath = function() {
	this._currentPath.add(" z");
}
alphatab.platform.svg.SvgCanvas.prototype.moveTo = function(x,y) {
	this._currentPath.add(" M");
	this._currentPath.add(x);
	this._currentPath.add(",");
	this._currentPath.add(y);
}
alphatab.platform.svg.SvgCanvas.prototype.lineTo = function(x,y) {
	this._currentPathIsEmpty = false;
	this._currentPath.add(" L");
	this._currentPath.add(x);
	this._currentPath.add(",");
	this._currentPath.add(y);
}
alphatab.platform.svg.SvgCanvas.prototype.quadraticCurveTo = function(cpx,cpy,x,y) {
	this._currentPathIsEmpty = false;
	this._currentPath.add(" Q");
	this._currentPath.add(cpx);
	this._currentPath.add(",");
	this._currentPath.add(cpy);
	this._currentPath.add(",");
	this._currentPath.add(x);
	this._currentPath.add(",");
	this._currentPath.add(y);
}
alphatab.platform.svg.SvgCanvas.prototype.bezierCurveTo = function(cp1x,cp1y,cp2x,cp2y,x,y) {
	this._currentPathIsEmpty = false;
	this._currentPath.add(" C");
	this._currentPath.add(cp1x);
	this._currentPath.add(",");
	this._currentPath.add(cp1y);
	this._currentPath.add(",");
	this._currentPath.add(cp2x);
	this._currentPath.add(",");
	this._currentPath.add(cp2y);
	this._currentPath.add(",");
	this._currentPath.add(x);
	this._currentPath.add(",");
	this._currentPath.add(y);
}
alphatab.platform.svg.SvgCanvas.prototype.circle = function(x,y,radius) {
	this._currentPathIsEmpty = false;
	this._currentPath.add(" M");
	this._currentPath.add(x - radius);
	this._currentPath.add(",");
	this._currentPath.add(y);
	this._currentPath.add(" A1,1 0 0,0 ");
	this._currentPath.add(x + radius);
	this._currentPath.add(",");
	this._currentPath.add(y);
	this._currentPath.add(" A1,1 0 0,0 ");
	this._currentPath.add(x - radius);
	this._currentPath.add(",");
	this._currentPath.add(y);
	this._currentPath.add(" z");
}
alphatab.platform.svg.SvgCanvas.prototype.rect = function(x,y,w,h) {
	this._currentPathIsEmpty = false;
	this._currentPath.add(" M");
	this._currentPath.add(x);
	this._currentPath.add(",");
	this._currentPath.add(y);
	this._currentPath.add(" L");
	this._currentPath.add(x + w);
	this._currentPath.add(",");
	this._currentPath.add(y);
	this._currentPath.add(" ");
	this._currentPath.add(x + w);
	this._currentPath.add(",");
	this._currentPath.add(y + h);
	this._currentPath.add(" ");
	this._currentPath.add(x);
	this._currentPath.add(",");
	this._currentPath.add(y + h);
	this._currentPath.add(" z");
}
alphatab.platform.svg.SvgCanvas.prototype.fill = function() {
	var path = this._currentPath.b.join("");
	if(!this._currentPathIsEmpty) {
		this._buffer.add("<path d=\"");
		this._buffer.add(this._currentPath.b.join(""));
		this._buffer.add("\" style=\"fill:");
		this._buffer.add(this.getFillStyle());
		this._buffer.add("\" stroke=\"none\"/>\n");
	}
	this._currentPath = new StringBuf();
	this._currentPathIsEmpty = true;
}
alphatab.platform.svg.SvgCanvas.prototype.stroke = function() {
	var path = this._currentPath.b.join("");
	if(!this._currentPathIsEmpty) {
		this._buffer.add("<path d=\"");
		this._buffer.add(this._currentPath.b.join(""));
		this._buffer.add("\" style=\"stroke:");
		this._buffer.add(this.getStrokeStyle());
		this._buffer.add("; stroke-width:");
		this._buffer.add(this.getLineWidth());
		this._buffer.add(";\" fill=\"none\" />\n");
	}
	this._currentPath = new StringBuf();
	this._currentPathIsEmpty = true;
}
alphatab.platform.svg.SvgCanvas.prototype._font = null;
alphatab.platform.svg.SvgCanvas.prototype.font = null;
alphatab.platform.svg.SvgCanvas.prototype.getFont = function() {
	return this._font;
}
alphatab.platform.svg.SvgCanvas.prototype.setFont = function(value) {
	this._font = value;
	return this._font;
}
alphatab.platform.svg.SvgCanvas.prototype._textBaseline = null;
alphatab.platform.svg.SvgCanvas.prototype.textBaseline = null;
alphatab.platform.svg.SvgCanvas.prototype.getTextBaseline = function() {
	return this._textBaseline;
}
alphatab.platform.svg.SvgCanvas.prototype.setTextBaseline = function(value) {
	this._textBaseline = value;
	return this._textBaseline;
}
alphatab.platform.svg.SvgCanvas.prototype._textAlign = null;
alphatab.platform.svg.SvgCanvas.prototype.textAlign = null;
alphatab.platform.svg.SvgCanvas.prototype.getTextAlign = function() {
	return this._textAlign;
}
alphatab.platform.svg.SvgCanvas.prototype.setTextAlign = function(value) {
	this._textAlign = value;
	return this._textAlign;
}
alphatab.platform.svg.SvgCanvas.prototype.fillText = function(text,x,y,maxWidth) {
	if(maxWidth == null) maxWidth = 0;
	this._buffer.add("<text x=\"");
	this._buffer.add(x);
	this._buffer.add("\" y=\"");
	this._buffer.add(y);
	this._buffer.add("\" style=\"font:");
	this._buffer.add(this.getFont());
	this._buffer.add("; fill:");
	this._buffer.add(this.getFillStyle());
	this._buffer.add(";\" ");
	if(maxWidth != 0) {
		this._buffer.add("width=\"");
		this._buffer.add(maxWidth);
		this._buffer.add("\"");
	}
	this._buffer.add(" dominant-baseline=\"");
	this._buffer.add(this.getSvgBaseLine());
	this._buffer.add("\" text-anchor=\"");
	this._buffer.add(this.getSvgTextAlignment());
	this._buffer.add("\">\n");
	this._buffer.add(text);
	this._buffer.add("</text>\n");
}
alphatab.platform.svg.SvgCanvas.prototype.strokeText = function(text,x,y,maxWidth) {
	if(maxWidth == null) maxWidth = 0;
	this._buffer.add("<text x=\"");
	this._buffer.add(x);
	this._buffer.add("\" y=\"");
	this._buffer.add(y);
	this._buffer.add("\" style=\"font:");
	this._buffer.add(this.getFont());
	this._buffer.add("\" stroke:");
	this._buffer.add(this.getStrokeStyle());
	this._buffer.add("; stroke-width:");
	this._buffer.add(this.getLineWidth());
	this._buffer.add(";\" ");
	if(maxWidth != 0) {
		this._buffer.add("width=\"");
		this._buffer.add(maxWidth);
		this._buffer.add("\"");
	}
	this._buffer.add(" dominant-baseline=\"");
	this._buffer.add(this.getSvgBaseLine());
	this._buffer.add("\" text-anchor=\"");
	this._buffer.add(this.getSvgTextAlignment());
	this._buffer.add("\">\n");
	this._buffer.add(text);
	this._buffer.add("</text>\n");
}
alphatab.platform.svg.SvgCanvas.prototype.getSvgTextAlignment = function() {
	switch(this.getTextAlign()) {
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
alphatab.platform.svg.SvgCanvas.prototype.getSvgBaseLine = function() {
	switch(this.getTextBaseline()) {
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
alphatab.platform.svg.SvgCanvas.prototype.measureText = function(text) {
	var font = alphatab.platform.svg.SupportedFonts.Arial;
	if(this.getFont().indexOf("Times") >= 0) font = alphatab.platform.svg.SupportedFonts.TimesNewRoman;
	var size = "";
	var preparedFont = this.getFont();
	if(preparedFont.indexOf("bold ") == 0) preparedFont = preparedFont.substr(5);
	if(preparedFont.indexOf("italic ") == 0) preparedFont = preparedFont.substr(7);
	var _g1 = 0, _g = preparedFont.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = preparedFont.charCodeAt(i);
		if((c < 48 || c > 57) && c != 46 && c != 32) break;
		size += preparedFont.charAt(i);
	}
	return alphatab.platform.svg.FontSizes.measureString(text,font,Std.parseFloat(size));
}
alphatab.platform.svg.SvgCanvas.prototype.__class__ = alphatab.platform.svg.SvgCanvas;
alphatab.platform.svg.SvgCanvas.__interfaces__ = [alphatab.platform.Canvas];
haxe.io.Error = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] }
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; }
if(!alphatab.io) alphatab.io = {}
alphatab.io.OutputExtensions = function() { }
alphatab.io.OutputExtensions.__name__ = ["alphatab","io","OutputExtensions"];
alphatab.io.OutputExtensions.writeAsString = function(output,value) {
	var text;
	if(Std["is"](value,String)) text = (function($this) {
		var $r;
		var $t = value;
		if(Std["is"]($t,String)) $t; else throw "Class cast error";
		$r = $t;
		return $r;
	}(this)); else text = Std.string(value);
	output.writeString(text);
}
alphatab.io.OutputExtensions.prototype.__class__ = alphatab.io.OutputExtensions;
haxe.io.BytesOutput = function(p) {
	if( p === $_ ) return;
	this.b = new haxe.io.BytesBuffer();
}
haxe.io.BytesOutput.__name__ = ["haxe","io","BytesOutput"];
haxe.io.BytesOutput.__super__ = haxe.io.Output;
for(var k in haxe.io.Output.prototype ) haxe.io.BytesOutput.prototype[k] = haxe.io.Output.prototype[k];
haxe.io.BytesOutput.prototype.b = null;
haxe.io.BytesOutput.prototype.writeByte = function(c) {
	this.b.b.push(c);
}
haxe.io.BytesOutput.prototype.writeBytes = function(buf,pos,len) {
	this.b.addBytes(buf,pos,len);
	return len;
}
haxe.io.BytesOutput.prototype.getBytes = function() {
	return this.b.getBytes();
}
haxe.io.BytesOutput.prototype.__class__ = haxe.io.BytesOutput;
alphatab.model.AutomationType = { __ename__ : ["alphatab","model","AutomationType"], __constructs__ : ["Tempo","Volume","Instrument","Balance"] }
alphatab.model.AutomationType.Tempo = ["Tempo",0];
alphatab.model.AutomationType.Tempo.toString = $estr;
alphatab.model.AutomationType.Tempo.__enum__ = alphatab.model.AutomationType;
alphatab.model.AutomationType.Volume = ["Volume",1];
alphatab.model.AutomationType.Volume.toString = $estr;
alphatab.model.AutomationType.Volume.__enum__ = alphatab.model.AutomationType;
alphatab.model.AutomationType.Instrument = ["Instrument",2];
alphatab.model.AutomationType.Instrument.toString = $estr;
alphatab.model.AutomationType.Instrument.__enum__ = alphatab.model.AutomationType;
alphatab.model.AutomationType.Balance = ["Balance",3];
alphatab.model.AutomationType.Balance.toString = $estr;
alphatab.model.AutomationType.Balance.__enum__ = alphatab.model.AutomationType;
haxe.io.Bytes = function(length,b) {
	if( length === $_ ) return;
	this.length = length;
	this.b = b;
}
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
}
haxe.io.Bytes.ofString = function(s) {
	var a = new Array();
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = s.cca(i);
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe.io.Bytes(a.length,a);
}
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
}
haxe.io.Bytes.prototype.length = null;
haxe.io.Bytes.prototype.b = null;
haxe.io.Bytes.prototype.get = function(pos) {
	return this.b[pos];
}
haxe.io.Bytes.prototype.set = function(pos,v) {
	this.b[pos] = v & 255;
}
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
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		b1[i + pos] = b2[i + srcpos];
	}
}
haxe.io.Bytes.prototype.sub = function(pos,len) {
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	return new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
}
haxe.io.Bytes.prototype.compare = function(other) {
	var b1 = this.b;
	var b2 = other.b;
	var len = this.length < other.length?this.length:other.length;
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		if(b1[i] != b2[i]) return b1[i] - b2[i];
	}
	return this.length - other.length;
}
haxe.io.Bytes.prototype.readString = function(pos,len) {
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	var s = "";
	var b = this.b;
	var fcc = String.fromCharCode;
	var i = pos;
	var max = pos + len;
	while(i < max) {
		var c = b[i++];
		if(c < 128) {
			if(c == 0) break;
			s += fcc(c);
		} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
			var c2 = b[i++];
			s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
		} else {
			var c2 = b[i++];
			var c3 = b[i++];
			s += fcc((c & 15) << 18 | (c2 & 127) << 12 | c3 << 6 & 127 | b[i++] & 127);
		}
	}
	return s;
}
haxe.io.Bytes.prototype.toString = function() {
	return this.readString(0,this.length);
}
haxe.io.Bytes.prototype.toHex = function() {
	var s = new StringBuf();
	var chars = [];
	var str = "0123456789abcdef";
	var _g1 = 0, _g = str.length;
	while(_g1 < _g) {
		var i = _g1++;
		chars.push(str.charCodeAt(i));
	}
	var _g1 = 0, _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = this.b[i];
		s.b[s.b.length] = String.fromCharCode(chars[c >> 4]);
		s.b[s.b.length] = String.fromCharCode(chars[c & 15]);
	}
	return s.b.join("");
}
haxe.io.Bytes.prototype.getData = function() {
	return this.b;
}
haxe.io.Bytes.prototype.__class__ = haxe.io.Bytes;
haxe.unit.TestResult = function(p) {
	if( p === $_ ) return;
	this.m_tests = new List();
	this.success = true;
}
haxe.unit.TestResult.__name__ = ["haxe","unit","TestResult"];
haxe.unit.TestResult.prototype.m_tests = null;
haxe.unit.TestResult.prototype.success = null;
haxe.unit.TestResult.prototype.add = function(t) {
	this.m_tests.add(t);
	if(!t.success) this.success = false;
}
haxe.unit.TestResult.prototype.toString = function() {
	var buf = new StringBuf();
	var failures = 0;
	var $it0 = this.m_tests.iterator();
	while( $it0.hasNext() ) {
		var test = $it0.next();
		if(test.success == false) {
			buf.b[buf.b.length] = "* " == null?"null":"* ";
			buf.add(test.classname);
			buf.b[buf.b.length] = "::" == null?"null":"::";
			buf.add(test.method);
			buf.b[buf.b.length] = "()" == null?"null":"()";
			buf.b[buf.b.length] = "\n" == null?"null":"\n";
			buf.b[buf.b.length] = "ERR: " == null?"null":"ERR: ";
			if(test.posInfos != null) {
				buf.add(test.posInfos.fileName);
				buf.b[buf.b.length] = ":" == null?"null":":";
				buf.add(test.posInfos.lineNumber);
				buf.b[buf.b.length] = "(" == null?"null":"(";
				buf.add(test.posInfos.className);
				buf.b[buf.b.length] = "." == null?"null":".";
				buf.add(test.posInfos.methodName);
				buf.b[buf.b.length] = ") - " == null?"null":") - ";
			}
			buf.add(test.error);
			buf.b[buf.b.length] = "\n" == null?"null":"\n";
			if(test.backtrace != null) {
				buf.add(test.backtrace);
				buf.b[buf.b.length] = "\n" == null?"null":"\n";
			}
			buf.b[buf.b.length] = "\n" == null?"null":"\n";
			failures++;
		}
	}
	buf.b[buf.b.length] = "\n" == null?"null":"\n";
	if(failures == 0) buf.b[buf.b.length] = "OK " == null?"null":"OK "; else buf.b[buf.b.length] = "FAILED " == null?"null":"FAILED ";
	buf.add(this.m_tests.length);
	buf.b[buf.b.length] = " tests, " == null?"null":" tests, ";
	buf.b[buf.b.length] = failures == null?"null":failures;
	buf.b[buf.b.length] = " failed, " == null?"null":" failed, ";
	buf.add(this.m_tests.length - failures);
	buf.b[buf.b.length] = " success" == null?"null":" success";
	buf.b[buf.b.length] = "\n" == null?"null":"\n";
	return buf.b.join("");
}
haxe.unit.TestResult.prototype.__class__ = haxe.unit.TestResult;
haxe.Int32 = function() { }
haxe.Int32.__name__ = ["haxe","Int32"];
haxe.Int32.make = function(a,b) {
	return a << 16 | b;
}
haxe.Int32.ofInt = function(x) {
	return x | 0;
}
haxe.Int32.clamp = function(x) {
	return x | 0;
}
haxe.Int32.toInt = function(x) {
	if((x >> 30 & 1) != x >>> 31) throw "Overflow " + x;
	return x;
}
haxe.Int32.toNativeInt = function(x) {
	return x;
}
haxe.Int32.add = function(a,b) {
	return a + b | 0;
}
haxe.Int32.sub = function(a,b) {
	return a - b | 0;
}
haxe.Int32.mul = function(a,b) {
	return a * b | 0;
}
haxe.Int32.div = function(a,b) {
	return Std["int"](a / b);
}
haxe.Int32.mod = function(a,b) {
	return a % b;
}
haxe.Int32.shl = function(a,b) {
	return a << b;
}
haxe.Int32.shr = function(a,b) {
	return a >> b;
}
haxe.Int32.ushr = function(a,b) {
	return a >>> b;
}
haxe.Int32.and = function(a,b) {
	return a & b;
}
haxe.Int32.or = function(a,b) {
	return a | b;
}
haxe.Int32.xor = function(a,b) {
	return a ^ b;
}
haxe.Int32.neg = function(a) {
	return -a;
}
haxe.Int32.isNeg = function(a) {
	return a < 0;
}
haxe.Int32.isZero = function(a) {
	return a == 0;
}
haxe.Int32.complement = function(a) {
	return ~a;
}
haxe.Int32.compare = function(a,b) {
	return a - b;
}
haxe.Int32.ucompare = function(a,b) {
	if(a < 0) return b < 0?~b - ~a:1;
	return b < 0?-1:a - b;
}
haxe.Int32.prototype.__class__ = haxe.Int32;
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
	return s.length >= start.length && s.substr(0,start.length) == start;
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && s.substr(slen - elen,elen) == end;
}
StringTools.isSpace = function(s,pos) {
	var c = s.charCodeAt(pos);
	return c >= 9 && c <= 13 || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return s.substr(r,l - r); else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return s.substr(0,l - r); else return s;
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.rpad = function(s,c,l) {
	var sl = s.length;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		s += c.substr(0,l - sl);
		sl = l;
	} else {
		s += c;
		sl += cl;
	}
	return s;
}
StringTools.lpad = function(s,c,l) {
	var ns = "";
	var sl = s.length;
	if(sl >= l) return s;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		ns += c.substr(0,l - sl);
		sl = l;
	} else {
		ns += c;
		sl += cl;
	}
	return ns + s;
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
StringTools.fastCodeAt = function(s,index) {
	return s.cca(index);
}
StringTools.isEOF = function(c) {
	return c != c;
}
StringTools.prototype.__class__ = StringTools;
$_ = {}
js.Boot.__res = {}
js.Boot.__init();
js["XMLHttpRequest"] = window.XMLHttpRequest?XMLHttpRequest:window.ActiveXObject?function() {
	try {
		return new ActiveXObject("Msxml2.XMLHTTP");
	} catch( e ) {
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch( e1 ) {
			throw "Unable to create XMLHttpRequest object.";
		}
	}
}:(function($this) {
	var $r;
	throw "Unable to create XMLHttpRequest object.";
	return $r;
}(this));
{
	Math.__name__ = ["Math"];
	Math.NaN = Number["NaN"];
	Math.NEGATIVE_INFINITY = Number["NEGATIVE_INFINITY"];
	Math.POSITIVE_INFINITY = Number["POSITIVE_INFINITY"];
	Math.isFinite = function(i) {
		return isFinite(i);
	};
	Math.isNaN = function(i) {
		return isNaN(i);
	};
}
{
	String.prototype.__class__ = String;
	String.__name__ = ["String"];
	Array.prototype.__class__ = Array;
	Array.__name__ = ["Array"];
	Int = { __name__ : ["Int"]};
	Dynamic = { __name__ : ["Dynamic"]};
	Float = Number;
	Float.__name__ = ["Float"];
	Bool = { __ename__ : ["Bool"]};
	Class = { __name__ : ["Class"]};
	Enum = { };
	Void = { __ename__ : ["Void"]};
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
alphatab.importer.Gp3To5Importer.VERSION_STRING = "FICHIER GUITAR PRO ";
alphatab.importer.Gp3To5Importer.BEND_STEP = 25;
alphatab.platform.svg.FontSizes.TIMES_NEW_ROMAN_11PT = [3,4,5,6,6,9,9,2,4,4,6,6,3,4,3,3,6,6,6,6,6,6,6,6,6,6,3,3,6,6,6,5,10,8,7,7,8,7,6,7,8,4,4,8,7,10,8,8,7,8,7,5,8,8,7,11,8,8,7,4,3,4,5,6,4,5,5,5,5,5,4,5,6,3,3,6,3,9,6,6,6,5,4,4,4,5,6,7,6,6,5,5,2,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,6,6,6,6,2,5,4,8,4,6,6,0,8,6,4,6,3,3,4,5,5,4,4,3,3,6,8,8,8,5,8,8,8,8,8,8,11,7,7,7,7,7,4,4,4,4,8,8,8,8,8,8,8,6,8,8,8,8,8,8,6,5,5,5,5,5,5,5,8,5,5,5,5,5,3,3,3,3,6,6,6,6,6,6,6,6,6,5,5,5,5,6,6];
alphatab.platform.svg.FontSizes.ARIAL_11PT = [3,2,4,6,6,10,7,2,4,4,4,6,3,4,3,3,6,6,6,6,6,6,6,6,6,6,3,3,6,6,6,6,11,8,7,7,7,6,6,8,7,2,5,7,6,8,7,8,6,8,7,7,6,7,8,10,7,8,7,3,3,3,5,6,4,6,6,6,6,6,4,6,6,2,2,5,2,8,6,6,6,6,4,6,3,6,6,10,6,6,6,4,2,4,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,6,6,7,6,2,6,4,8,4,6,6,0,8,6,4,6,4,4,4,6,6,4,4,4,5,6,9,10,10,6,8,8,8,8,8,8,11,7,6,6,6,6,2,2,2,2,8,7,8,8,8,8,8,6,8,7,7,7,7,8,7,7,6,6,6,6,6,6,10,6,6,6,6,6,2,2,2,2,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6];
alphatab.platform.svg.FontSizes.CONTROL_CHARS = 32;
alphatab.platform.PlatformFactory.SVG_CANVAS = "svg";
js.Lib.onerror = null;
alphatab.AlphaTestRunner.main()