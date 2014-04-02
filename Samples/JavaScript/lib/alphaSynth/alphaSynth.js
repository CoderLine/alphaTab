(function () { "use strict";
var $hxClasses = {},$estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { }
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
}
HxOverrides.strDate = function(s) {
	switch(s.length) {
	case 8:
		var k = s.split(":");
		var d = new Date();
		d.setTime(0);
		d.setUTCHours(k[0]);
		d.setUTCMinutes(k[1]);
		d.setUTCSeconds(k[2]);
		return d;
	case 10:
		var k = s.split("-");
		return new Date(k[0],k[1] - 1,k[2],0,0,0);
	case 19:
		var k = s.split(" ");
		var y = k[0].split("-");
		var t = k[1].split(":");
		return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
	default:
		throw "Invalid date format : " + s;
	}
}
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
var List = function() {
	this.length = 0;
};
$hxClasses["List"] = List;
List.__name__ = ["List"];
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
$hxClasses["IMap"] = IMap;
IMap.__name__ = ["IMap"];
IMap.prototype = {
	__class__: IMap
}
var Reflect = function() { }
$hxClasses["Reflect"] = Reflect;
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	return Object.prototype.hasOwnProperty.call(o,field);
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
}
Reflect.deleteField = function(o,field) {
	if(!Reflect.hasField(o,field)) return false;
	delete(o[field]);
	return true;
}
var Std = function() { }
$hxClasses["Std"] = Std;
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
var StringBuf = function() {
	this.b = "";
};
$hxClasses["StringBuf"] = StringBuf;
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	__class__: StringBuf
}
var StringTools = function() { }
$hxClasses["StringTools"] = StringTools;
StringTools.__name__ = ["StringTools"];
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
}
StringTools.urlDecode = function(s) {
	return decodeURIComponent(s.split("+").join(" "));
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
}
StringTools.lpad = function(s,c,l) {
	if(c.length <= 0) return s;
	while(s.length < l) s = c + s;
	return s;
}
var ValueType = $hxClasses["ValueType"] = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] }
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
var Type = function() { }
$hxClasses["Type"] = Type;
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	return o.__class__;
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
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
}
Type.resolveEnum = function(name) {
	var e = $hxClasses[name];
	if(e == null || !e.__ename__) return null;
	return e;
}
Type.createEmptyInstance = function(cl) {
	function empty() {}; empty.prototype = cl.prototype;
	return new empty();
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
Type.getEnumConstructs = function(e) {
	var a = e.__constructs__;
	return a.slice();
}
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
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
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
}
Type.enumConstructor = function(e) {
	return e[0];
}
Type.enumParameters = function(e) {
	return e.slice(2);
}
var XmlType = $hxClasses["XmlType"] = { __ename__ : ["XmlType"], __constructs__ : [] }
var Xml = function() { }
$hxClasses["Xml"] = Xml;
Xml.__name__ = ["Xml"];
var as = {}
as.bank = {}
as.bank.components = {}
as.bank.components.GeneratorStateEnum = function() { }
$hxClasses["as.bank.components.GeneratorStateEnum"] = as.bank.components.GeneratorStateEnum;
as.bank.components.GeneratorStateEnum.__name__ = ["as","bank","components","GeneratorStateEnum"];
as.bank.components.EnvelopeStateEnum = function() { }
$hxClasses["as.bank.components.EnvelopeStateEnum"] = as.bank.components.EnvelopeStateEnum;
as.bank.components.EnvelopeStateEnum.__name__ = ["as","bank","components","EnvelopeStateEnum"];
as.bank.components.LfoStateEnum = function() { }
$hxClasses["as.bank.components.LfoStateEnum"] = as.bank.components.LfoStateEnum;
as.bank.components.LfoStateEnum.__name__ = ["as","bank","components","LfoStateEnum"];
as.bank.components.WaveformEnum = function() { }
$hxClasses["as.bank.components.WaveformEnum"] = as.bank.components.WaveformEnum;
as.bank.components.WaveformEnum.__name__ = ["as","bank","components","WaveformEnum"];
as.bank.components.InterpolationEnum = function() { }
$hxClasses["as.bank.components.InterpolationEnum"] = as.bank.components.InterpolationEnum;
as.bank.components.InterpolationEnum.__name__ = ["as","bank","components","InterpolationEnum"];
as.bank.components.LoopModeEnum = function() { }
$hxClasses["as.bank.components.LoopModeEnum"] = as.bank.components.LoopModeEnum;
as.bank.components.LoopModeEnum.__name__ = ["as","bank","components","LoopModeEnum"];
as.bank.components.FilterTypeEnum = function() { }
$hxClasses["as.bank.components.FilterTypeEnum"] = as.bank.components.FilterTypeEnum;
as.bank.components.FilterTypeEnum.__name__ = ["as","bank","components","FilterTypeEnum"];
as.ds = {}
as.ds.CircularSampleBuffer = function(size) {
	this._buffer = new Float32Array(size);
	this._writePosition = 0;
	this._readPosition = 0;
	this._sampleCount = 0;
	as.platform.TypeUtils.clearSampleArray(this._buffer);
};
$hxClasses["as.ds.CircularSampleBuffer"] = as.ds.CircularSampleBuffer;
as.ds.CircularSampleBuffer.__name__ = ["as","ds","CircularSampleBuffer"];
as.ds.CircularSampleBuffer.prototype = {
	read: function(data,offset,count) {
		if(count > this._sampleCount) count = this._sampleCount;
		var samplesRead = 0;
		var readToEnd = Math.min(this._buffer.length - this._readPosition,count) | 0;
		var srcPos = this._readPosition;
		data.set(this._buffer.subarray(srcPos,srcPos + readToEnd),offset);
		samplesRead += readToEnd;
		this._readPosition += readToEnd;
		this._readPosition %= this._buffer.length;
		if(samplesRead < count) {
			var srcPos = this._readPosition;
			data.set(this._buffer.subarray(srcPos,srcPos + (count - samplesRead)),offset + samplesRead);
			this._readPosition += count - samplesRead;
			samplesRead = count;
		}
		this._sampleCount -= samplesRead;
		return samplesRead;
	}
	,write: function(data,offset,count) {
		var samplesWritten = 0;
		if(count > this._buffer.length - this._sampleCount) count = this._buffer.length - this._sampleCount;
		var writeToEnd = Math.min(this._buffer.length - this._writePosition,count) | 0;
		this._buffer.set(data.subarray(offset,offset + writeToEnd),this._writePosition);
		this._writePosition += writeToEnd;
		this._writePosition %= this._buffer.length;
		samplesWritten += writeToEnd;
		if(samplesWritten < count) {
			var srcPos = offset + samplesWritten;
			this._buffer.set(data.subarray(srcPos,srcPos + (count - samplesWritten)),this._writePosition);
			this._writePosition += count - samplesWritten;
			samplesWritten = count;
		}
		this._sampleCount += samplesWritten;
		return samplesWritten;
	}
	,clear: function() {
		this._readPosition = 0;
		this._writePosition = 0;
		this._sampleCount = 0;
		this._buffer = new Float32Array(this._buffer.length);
		as.platform.TypeUtils.clearSampleArray(this._buffer);
	}
	,get_count: function() {
		return this._sampleCount;
	}
	,__class__: as.ds.CircularSampleBuffer
}
as.ds._FixedArray = {}
as.ds._FixedArray.FixedArray_Impl_ = function() { }
$hxClasses["as.ds._FixedArray.FixedArray_Impl_"] = as.ds._FixedArray.FixedArray_Impl_;
as.ds._FixedArray.FixedArray_Impl_.__name__ = ["as","ds","_FixedArray","FixedArray_Impl_"];
as.ds._FixedArray.FixedArray_Impl_._new = function(length) {
	return new Array(length);
}
as.ds._FixedArray.FixedArray_Impl_.get = function(this1,index) {
	return this1[index];
}
as.ds._FixedArray.FixedArray_Impl_.set = function(this1,index,val) {
	return this1[index] = val;
}
as.ds._FixedArray.FixedArray_Impl_.clone = function(this1) {
	return this1.slice(0);
}
as.ds._FixedArray.FixedArray_Impl_.get_length = function(this1) {
	return this1.length;
}
as.ds._FixedArray.FixedArray_Impl_.blit = function(src,srcPos,dest,destPos,len) {
	haxe.ds._Vector.Vector_Impl_.blit(src,srcPos,dest,destPos,len);
}
as.ds._FixedArray.FixedArray_Impl_.fromArrayCopy = function(array) {
	return (function($this) {
		var $r;
		var vec = new Array(array.length);
		{
			var _g1 = 0, _g = array.length;
			while(_g1 < _g) {
				var i = _g1++;
				vec[i] = array[i];
			}
		}
		$r = vec;
		return $r;
	}(this));
}
as.ds._FixedArray.FixedArray_Impl_.serialize = function(v) {
	var s = new haxe.Serializer();
	s.serialize(v.length);
	var _g1 = 0, _g = v.length;
	while(_g1 < _g) {
		var i = _g1++;
		s.serialize(v[i]);
	}
	return s.toString();
}
as.ds._FixedArray.FixedArray_Impl_.unserialize = function(data) {
	var s = new haxe.Unserializer(data);
	var length = s.unserialize();
	var v = new Array(length);
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var val = s.unserialize();
		v[i] = val;
	}
	return v;
}
as.ds._SampleArray = {}
as.ds._SampleArray.SampleArray_Impl_ = function() { }
$hxClasses["as.ds._SampleArray.SampleArray_Impl_"] = as.ds._SampleArray.SampleArray_Impl_;
as.ds._SampleArray.SampleArray_Impl_.__name__ = ["as","ds","_SampleArray","SampleArray_Impl_"];
as.ds._SampleArray.SampleArray_Impl_._new = function(length) {
	return new Float32Array(length);
}
as.ds._SampleArray.SampleArray_Impl_.get = function(this1,index) {
	return this1[index];
}
as.ds._SampleArray.SampleArray_Impl_.set = function(this1,index,val) {
	return this1[index] = val;
}
as.ds._SampleArray.SampleArray_Impl_.get_length = function(this1) {
	return this1.length;
}
as.ds._SampleArray.SampleArray_Impl_.toData = function(this1) {
	return this1;
}
as.ds._SampleArray.SampleArray_Impl_.blit = function(src,srcPos,dest,destPos,len) {
	dest.set(src.subarray(srcPos,srcPos + len),destPos);
}
as.ds._SampleArray.SampleArray_Impl_.fromArrayCopy = function(array) {
	return new Float32Array(array);
}
as.ds._SampleArray.SampleArray_Impl_.serialize = function(v) {
	var s = new haxe.Serializer();
	s.serialize(v.length);
	var _g1 = 0, _g = v.length;
	while(_g1 < _g) {
		var i = _g1++;
		s.serialize(v[i]);
	}
	return s.toString();
}
as.ds._SampleArray.SampleArray_Impl_.unserialize = function(data) {
	var s = new haxe.Unserializer(data);
	var length = s.unserialize();
	var v = new Float32Array(length);
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		var val = s.unserialize();
		v[i] = val;
	}
	return v;
}
var mconsole = {}
mconsole.Printer = function() { }
$hxClasses["mconsole.Printer"] = mconsole.Printer;
mconsole.Printer.__name__ = ["mconsole","Printer"];
mconsole.Printer.prototype = {
	__class__: mconsole.Printer
}
as.log = {}
as.log.LevelPrinter = function(target) {
	this._target = target;
	this.level = as.log.LevelPrinter.logLevelToInt(mconsole.LogLevel.log);
};
$hxClasses["as.log.LevelPrinter"] = as.log.LevelPrinter;
as.log.LevelPrinter.__name__ = ["as","log","LevelPrinter"];
as.log.LevelPrinter.__interfaces__ = [mconsole.Printer];
as.log.LevelPrinter.logLevelToInt = function(level) {
	switch( (level)[1] ) {
	case 4:
		return 4;
	case 3:
		return 3;
	case 1:
		return 2;
	case 2:
		return 1;
	case 0:
		return 0;
	}
}
as.log.LevelPrinter.prototype = {
	printLine: function(level,message) {
		this._target(level,message);
	}
	,print: function(level,params,indent,pos) {
		var intLevel = as.log.LevelPrinter.logLevelToInt(level);
		if(intLevel < this.level) return;
		params = params.slice();
		var _g1 = 0, _g = params.length;
		while(_g1 < _g) {
			var i = _g1++;
			params[i] = Std.string(params[i]);
		}
		var message = params.join(", ");
		var nextPosition = "@ " + pos.className + "." + pos.methodName;
		var nextLineNumber = Std.string(pos.lineNumber);
		var lineColumn = "";
		var emptyLineColumn = "";
		if(nextPosition != this._position) this._target(intLevel,nextPosition);
		emptyLineColumn = StringTools.lpad(""," ",5);
		if(nextPosition != this._position || nextLineNumber != this._lineNumber) lineColumn = StringTools.lpad("L" + nextLineNumber," ",6) + ": "; else lineColumn = emptyLineColumn;
		this._position = nextPosition;
		this._lineNumber = nextLineNumber;
		var indent1 = StringTools.lpad(""," ",indent * 2);
		message = lineColumn + indent1 + message;
		message = message.split("\n").join("\n" + emptyLineColumn + indent1);
		this._target(intLevel,message);
	}
	,__class__: as.log.LevelPrinter
}
as.main = {}
as.main.IAlphaSynth = function() { }
$hxClasses["as.main.IAlphaSynth"] = as.main.IAlphaSynth;
as.main.IAlphaSynth.__name__ = ["as","main","IAlphaSynth"];
as.main.IAlphaSynth.prototype = {
	__class__: as.main.IAlphaSynth
}
as.main.IAlphaSynthAsync = function() { }
$hxClasses["as.main.IAlphaSynthAsync"] = as.main.IAlphaSynthAsync;
as.main.IAlphaSynthAsync.__name__ = ["as","main","IAlphaSynthAsync"];
as.main.IAlphaSynthAsync.__interfaces__ = [as.main.IAlphaSynth];
as.main.IAlphaSynthAsync.prototype = {
	__class__: as.main.IAlphaSynthAsync
}
as.main.AlphaSynthJs = function() {
	this.AlphaSynthId = "AlphaSynth";
};
$hxClasses["as.main.AlphaSynthJs"] = as.main.AlphaSynthJs;
$hxExpose(as.main.AlphaSynthJs, "as.AlphaSynth");
as.main.AlphaSynthJs.__name__ = ["as","main","AlphaSynthJs"];
as.main.AlphaSynthJs.__interfaces__ = [as.main.IAlphaSynthAsync];
as.main.AlphaSynthJs.main = function() {
	mconsole.Console.hasConsole = false;
	mconsole.Console.start();
	mconsole.Console.removePrinter(mconsole.Console.defaultPrinter);
	mconsole.Console.addPrinter(as.main.AlphaSynthJs._printer = new as.log.LevelPrinter(as.main.AlphaSynthJs.log));
	as.main.AlphaSynthJs.instance = new as.main.AlphaSynthJs();
}
as.main.AlphaSynthJs.log = function(level,message) {
	var console = window.console;
	switch(level) {
	case 0:
		console.log(message);
		break;
	case 1:
		console.debug(message);
		break;
	case 2:
		console.info(message);
		break;
	case 3:
		console.warn(message);
		break;
	case 4:
		console.error(message);
		break;
	}
}
as.main.AlphaSynthJs.init = function(asRoot,swfObjectRoot) {
	if(swfObjectRoot == null) swfObjectRoot = "";
	var swf = swfobject;
	var supportsWebAudio = !!window.ScriptProcessorNode;
	var supportsWebWorkers = !!window.Worker;
	var supportsFlashWorkers = swf.hasFlashPlayerVersion("11.4");
	if(supportsWebAudio) {
		if(mconsole.Console.hasConsole) mconsole.Console.callConsole("debug",["Will use webworkers for synthesizing and web audio api for playback"]);
		mconsole.Console.print(mconsole.LogLevel.debug,["Will use webworkers for synthesizing and web audio api for playback"],{ fileName : "AlphaSynthJs.hx", lineNumber : 195, className : "as.main.AlphaSynthJs", methodName : "init"});
		var result = as.main.webworker.webaudio.AlphaSynthJsPlayerApi.init(asRoot);
		if(result) {
			as.main.AlphaSynthJs.instance.realInstance = new as.main.webworker.webaudio.AlphaSynthJsPlayerApi();
			as.main.AlphaSynthJs.instance.startup();
		}
		return result;
	} else if(supportsWebWorkers) {
		if(mconsole.Console.hasConsole) mconsole.Console.callConsole("debug",["Will use webworkers for synthesizing and flash for playback"]);
		mconsole.Console.print(mconsole.LogLevel.debug,["Will use webworkers for synthesizing and flash for playback"],{ fileName : "AlphaSynthJs.hx", lineNumber : 206, className : "as.main.AlphaSynthJs", methodName : "init"});
		var result = as.main.webworker.flash.AlphaSynthFlashPlayerApi.init(asRoot,swfObjectRoot);
		if(result) {
			as.main.AlphaSynthJs.instance.realInstance = new as.main.webworker.flash.AlphaSynthFlashPlayerApi();
			as.main.AlphaSynthJs.instance.startup();
		}
		return result;
	} else if(supportsFlashWorkers) {
		if(mconsole.Console.hasConsole) mconsole.Console.callConsole("debug",["Will use flash for synthesizing and playback"]);
		mconsole.Console.print(mconsole.LogLevel.debug,["Will use flash for synthesizing and playback"],{ fileName : "AlphaSynthJs.hx", lineNumber : 217, className : "as.main.AlphaSynthJs", methodName : "init"});
		var result = as.main.flash.AlphaSynthFlashApi.init(asRoot,swfObjectRoot);
		if(result) {
			as.main.AlphaSynthJs.instance.realInstance = new as.main.flash.AlphaSynthFlashApi();
			as.main.AlphaSynthJs.instance.startup();
		}
		return result;
	} else {
		mconsole.Console.error("Incompatible browser",null,{ fileName : "AlphaSynthJs.hx", lineNumber : 228, className : "as.main.AlphaSynthJs", methodName : "init"});
		return false;
	}
}
as.main.AlphaSynthJs.prototype = {
	on: function(events,fn) {
		if(this.realInstance == null) return;
		this.realInstance.on(events,fn);
		if(events == "ready" && this.ready) fn();
	}
	,setLogLevel: function(level) {
		as.main.AlphaSynthJs._printer.level = level;
		if(this.realInstance == null) return;
		this.realInstance.setLogLevel(level);
	}
	,loadMidiBytesData: function(data) {
		this.loadMidiBytes(haxe.io.Bytes.ofData(data));
	}
	,loadMidiBytes: function(data) {
		if(this.realInstance == null) return;
		this.realInstance.loadMidiBytes(data);
	}
	,loadMidiData: function(data) {
		if(this.realInstance == null) return;
		this.realInstance.loadMidiData(data);
	}
	,loadMidiUrl: function(url) {
		if(this.realInstance == null) return;
		this.realInstance.loadMidiUrl(url);
	}
	,loadSoundFontData: function(data) {
		if(this.realInstance == null) return;
		this.realInstance.loadSoundFontData(data);
	}
	,loadSoundFontUrl: function(url) {
		if(this.realInstance == null) return;
		this.realInstance.loadSoundFontUrl(url);
	}
	,setPositionTime: function(millis) {
		if(this.realInstance == null) return;
		this.realInstance.setPositionTime(millis);
	}
	,setPositionTick: function(tick) {
		if(this.realInstance == null) return;
		this.realInstance.setPositionTick(tick);
	}
	,stop: function() {
		if(this.realInstance == null) return;
		this.realInstance.stop();
	}
	,playPause: function() {
		if(this.realInstance == null) return;
		this.realInstance.playPause();
	}
	,pause: function() {
		if(this.realInstance == null) return;
		this.realInstance.pause();
	}
	,play: function() {
		if(this.realInstance == null) return;
		this.realInstance.play();
	}
	,isMidiLoaded: function() {
		if(this.realInstance == null) return;
		this.realInstance.isMidiLoaded();
	}
	,isSoundFontLoaded: function() {
		if(this.realInstance == null) return;
		this.realInstance.isSoundFontLoaded();
	}
	,getState: function() {
		if(this.realInstance == null) return;
		this.realInstance.getState();
	}
	,isReadyForPlay: function() {
		if(this.realInstance == null) return;
		this.realInstance.isReadyForPlay();
	}
	,startup: function() {
		var _g = this;
		this.realInstance.on("ready",function() {
			_g.ready = true;
		});
		this.realInstance.startup();
	}
	,__class__: as.main.AlphaSynthJs
}
as.main.flash = {}
as.main.flash.AlphaSynthFlashApi = function() {
	this.AlphaSynthId = "AlphaSynth";
	var ctx = new haxe.remoting.Context();
	ctx.addObject("JsAlphaSynth",this);
	this._flash = haxe.remoting.ExternalConnection.flashConnect("default",this.AlphaSynthId,ctx);
	this._events = new js.JQuery("<span></span>");
};
$hxClasses["as.main.flash.AlphaSynthFlashApi"] = as.main.flash.AlphaSynthFlashApi;
as.main.flash.AlphaSynthFlashApi.__name__ = ["as","main","flash","AlphaSynthFlashApi"];
as.main.flash.AlphaSynthFlashApi.__interfaces__ = [as.main.IAlphaSynthAsync];
as.main.flash.AlphaSynthFlashApi.init = function(asRoot,swfObjectRoot) {
	if(swfObjectRoot == null) swfObjectRoot = "";
	var swf = swfobject;
	if(asRoot != "" && !StringTools.endsWith(asRoot,"/")) asRoot += "/";
	if(swfObjectRoot != "" && !StringTools.endsWith(swfObjectRoot,"/")) swfObjectRoot += "/";
	if(swf) {
		var alphaSynth = js.Browser.document.getElementById("alphaSynthContainer");
		if(alphaSynth != null) {
			haxe.Log.trace("Skipped initialization, existing alphaSynthContainer found",{ fileName : "AlphaSynthFlashApi.hx", lineNumber : 188, className : "as.main.flash.AlphaSynthFlashApi", methodName : "init"});
			return false;
		}
		alphaSynth = js.Browser.document.createElement("div");
		alphaSynth.setAttribute("id","alphaSynthContainer");
		js.Browser.document.body.appendChild(alphaSynth);
		swf.embedSWF(asRoot + "alphaSynthFull.swf","alphaSynthContainer","1px","1px","11.4.0",swfObjectRoot + "expressInstall.swf",{ },{ allowScriptAccess : "always"},{ id : "AlphaSynth"});
		return true;
	} else {
		haxe.Log.trace("Error initializing alphaSynth: swfobject not found",{ fileName : "AlphaSynthFlashApi.hx", lineNumber : 209, className : "as.main.flash.AlphaSynthFlashApi", methodName : "init"});
		return false;
	}
}
as.main.flash.AlphaSynthFlashApi.prototype = {
	trigger: function(event) {
		var args = Array.prototype.slice.call(arguments);
		switch(event) {
		case "log":
			this.log(args[1],args[2]);
			break;
		}
		var events = this._events;
		events.trigger(event, args.splice(1));
	}
	,log: function(level,message) {
		var console = window.console;
		switch(level) {
		case 0:
			console.log(message);
			break;
		case 1:
			console.debug(message);
			break;
		case 2:
			console.info(message);
			break;
		case 3:
			console.warn(message);
			break;
		case 4:
			console.error(message);
			break;
		}
	}
	,on: function(events,fn) {
		this._events.on(events,fn);
	}
	,setLogLevel: function(level) {
		this._flash.resolve("FlashAlphaSynth").resolve("setLogLevel").call([level]);
	}
	,isMidiLoaded: function() {
		var v = this._flash.resolve("FlashAlphaSynth").resolve("isMidiLoaded").call([]);
		this._events.trigger('isMidiLoaded', [v]);
	}
	,isSoundFontLoaded: function() {
		var v = this._flash.resolve("FlashAlphaSynth").resolve("isSoundFontLoaded").call([]);
		this._events.trigger('isSoundFontLoaded', [v]);
	}
	,getState: function() {
		var v = this._flash.resolve("FlashAlphaSynth").resolve("getState").call([]);
		this._events.trigger('getState', [v]);
	}
	,loadMidiData: function(data) {
		this._flash.resolve("FlashAlphaSynth").resolve("loadMidiData").call([data]);
	}
	,loadMidiUrl: function(url) {
		this._flash.resolve("FlashAlphaSynth").resolve("loadMidiUrl").call([url]);
	}
	,loadMidiBytes: function(data) {
		var data1 = haxe.Serializer.run(haxe.io.Bytes.ofData(data));
		this.loadMidiData(data1);
	}
	,loadSoundFontData: function(data) {
		this._flash.resolve("FlashAlphaSynth").resolve("loadSoundFontData").call([data]);
	}
	,loadSoundFontUrl: function(url) {
		this._flash.resolve("FlashAlphaSynth").resolve("loadSoundFontUrl").call([url]);
	}
	,setPositionTime: function(millis) {
		this._flash.resolve("FlashAlphaSynth").resolve("setPositionTime").call([millis]);
	}
	,setPositionTick: function(tick) {
		this._flash.resolve("FlashAlphaSynth").resolve("setPositionTick").call([tick]);
	}
	,stop: function() {
		this._flash.resolve("FlashAlphaSynth").resolve("stop").call([]);
	}
	,playPause: function() {
		this._flash.resolve("FlashAlphaSynth").resolve("playPause").call([]);
	}
	,pause: function() {
		this._flash.resolve("FlashAlphaSynth").resolve("pause").call([]);
	}
	,play: function() {
		this._flash.resolve("FlashAlphaSynth").resolve("play").call([]);
	}
	,isReadyForPlay: function() {
		var v = this._flash.resolve("FlashAlphaSynth").resolve("isReadyForPlay").call([]);
		this._events.trigger('isReadyForPlay', [v]);
	}
	,startup: function() {
	}
	,__class__: as.main.flash.AlphaSynthFlashApi
}
as.main.webworker = {}
as.main.webworker.flash = {}
as.main.webworker.flash.AlphaSynthFlashPlayerApi = function() {
	var ctx = new haxe.remoting.Context();
	ctx.addObject("JsAlphaSynth",this);
	this._flash = haxe.remoting.ExternalConnection.flashConnect("default","AlphaSynth",ctx);
	this._events = new js.JQuery("<span></span>");
};
$hxClasses["as.main.webworker.flash.AlphaSynthFlashPlayerApi"] = as.main.webworker.flash.AlphaSynthFlashPlayerApi;
as.main.webworker.flash.AlphaSynthFlashPlayerApi.__name__ = ["as","main","webworker","flash","AlphaSynthFlashPlayerApi"];
as.main.webworker.flash.AlphaSynthFlashPlayerApi.__interfaces__ = [as.main.IAlphaSynthAsync];
as.main.webworker.flash.AlphaSynthFlashPlayerApi.init = function(asRoot,swfObjectRoot) {
	if(swfObjectRoot == null) swfObjectRoot = "";
	var swf = swfobject;
	if(asRoot != "" && !StringTools.endsWith(asRoot,"/")) asRoot += "/";
	if(swfObjectRoot != "" && !StringTools.endsWith(swfObjectRoot,"/")) swfObjectRoot += "/";
	if(swf) {
		var alphaSynth = js.Browser.document.getElementById("alphaSynthContainer");
		if(alphaSynth != null) {
			haxe.Log.trace("Skipped initialization, existing alphaSynthContainer found",{ fileName : "AlphaSynthFlashPlayerApi.hx", lineNumber : 249, className : "as.main.webworker.flash.AlphaSynthFlashPlayerApi", methodName : "init"});
			return false;
		}
		alphaSynth = js.Browser.document.createElement("div");
		alphaSynth.setAttribute("id","alphaSynthContainer");
		js.Browser.document.body.appendChild(alphaSynth);
		js.Browser.window.AlphaSynthWorker = new Worker(asRoot + "alphaSynthWorker.js");
		swf.embedSWF(asRoot + "alphaSynthPlayer.swf","alphaSynthContainer","1px","1px","11.0.0",swfObjectRoot + "expressInstall.swf",{ },{ allowScriptAccess : "always"},{ id : "AlphaSynth"});
		return true;
	} else {
		haxe.Log.trace("Error initializing alphaSynth: swfobject not found",{ fileName : "AlphaSynthFlashPlayerApi.hx", lineNumber : 275, className : "as.main.webworker.flash.AlphaSynthFlashPlayerApi", methodName : "init"});
		return false;
	}
}
as.main.webworker.flash.AlphaSynthFlashPlayerApi.prototype = {
	log: function(level,message) {
		var console = window.console;
		switch(level) {
		case 0:
			console.log(message);
			break;
		case 1:
			console.debug(message);
			break;
		case 2:
			console.info(message);
			break;
		case 3:
			console.warn(message);
			break;
		case 4:
			console.error(message);
			break;
		}
	}
	,playerPositionChanged: function(pos) {
		this._synth.postMessage({ cmd : "playerPositionChanged", pos : pos});
	}
	,playerFinished: function() {
		this._synth.postMessage({ cmd : "playerFinished"});
	}
	,playerSampleRequest: function() {
		this._synth.postMessage({ cmd : "playerSampleRequest"});
	}
	,playerReady: function() {
		this._synth = js.Browser.window.AlphaSynthWorker;
		this._synth.addEventListener("message",$bind(this,this.handleWorkerMessage),false);
		this._synth.postMessage({ cmd : "playerReady"});
		this._events.trigger('ready');
	}
	,on: function(events,fn) {
		this._events.on(events,fn);
	}
	,handleWorkerMessage: function(e) {
		var data = e.data;
		switch(data.cmd) {
		case "isReadyForPlay":
			this._events.trigger(data.cmd, [data.value]);
			break;
		case "getState":
			this._events.trigger(data.cmd, [data.value]);
			break;
		case "isSoundFontLoaded":
			this._events.trigger(data.cmd, [data.value]);
			break;
		case "isMidiLoaded":
			this._events.trigger(data.cmd, [data.value]);
			break;
		case "positionChanged":
			this._events.trigger(data.cmd, [data.currentTime, data.endTime, data.currentTick, data.endTick]);
			break;
		case "playerStateChanged":
			this._events.trigger(data.cmd, [data.state]);
			break;
		case "finished":
			this._events.trigger(data.cmd);
			break;
		case "soundFontLoad":
			this._events.trigger(data.cmd, [data.loaded, data.full]);
			break;
		case "soundFontLoaded":
			this._events.trigger(data.cmd);
			break;
		case "soundFontLoadFailed":
			this._events.trigger(data.cmd);
			break;
		case "midiLoad":
			this._events.trigger(data.cmd, [data.loaded, data.full]);
			break;
		case "midiFileLoaded":
			this._events.trigger(data.cmd);
			break;
		case "midiFileLoadFailed":
			this._events.trigger(data.cmd);
			break;
		case "readyForPlay":
			this._events.trigger(data.cmd, data.value);
			break;
		case "log":
			this.log(data.level,data.message);
			break;
		case "playerSequencerFinished":
			this._flash.resolve("FlashAlphaSynth").resolve("sequencerFinished").call([]);
			break;
		case "playerAddSamples":
			this._flash.resolve("FlashAlphaSynth").resolve("addSamples").call([(function($this) {
				var $r;
				var v = data.samples;
				var s = new haxe.Serializer();
				s.serialize(v.length);
				{
					var _g1 = 0, _g = v.length;
					while(_g1 < _g) {
						var i = _g1++;
						s.serialize(v[i]);
					}
				}
				$r = s.toString();
				return $r;
			}(this))]);
			break;
		case "playerPlay":
			this._flash.resolve("FlashAlphaSynth").resolve("play").call([]);
			break;
		case "playerPause":
			this._flash.resolve("FlashAlphaSynth").resolve("pause").call([]);
			break;
		case "playerStop":
			this._flash.resolve("FlashAlphaSynth").resolve("stop").call([]);
			break;
		case "playerSeek":
			this._flash.resolve("FlashAlphaSynth").resolve("seek").call([data.pos]);
			break;
		}
	}
	,qualifyURL: function(url) {
		var img = js.Browser.document.createElement("img");
		img.onerror = function(e) {
		};
		img.src = url;
		url = img.src;
		img.src = null;
		return url;
	}
	,setLogLevel: function(level) {
		this._synth.postMessage({ cmd : "setLogLevel", level : level});
	}
	,isMidiLoaded: function() {
		this._synth.postMessage({ cmd : "isMidiLoaded"});
	}
	,isSoundFontLoaded: function() {
		this._synth.postMessage({ cmd : "isSoundFontLoaded"});
	}
	,getState: function() {
		this._synth.postMessage({ cmd : "getState"});
	}
	,loadMidiData: function(data) {
		this._synth.postMessage({ cmd : "loadMidiData", data : data});
	}
	,loadMidiUrl: function(url) {
		this._synth.postMessage({ cmd : "loadMidiUrl", url : this.qualifyURL(url)});
	}
	,loadMidiBytes: function(data) {
		this._synth.postMessage({ cmd : "loadMidiBytes", data : data});
	}
	,loadSoundFontData: function(data) {
		this._synth.postMessage({ cmd : "loadSoundFontData", data : data});
	}
	,loadSoundFontUrl: function(url) {
		this._synth.postMessage({ cmd : "loadSoundFontUrl", url : this.qualifyURL(url)});
	}
	,setPositionTime: function(millis) {
		this._synth.postMessage({ cmd : "setPositionTime", time : millis});
	}
	,setPositionTick: function(tick) {
		this._synth.postMessage({ cmd : "setPositionTick", tick : tick});
	}
	,stop: function() {
		this._synth.postMessage({ cmd : "stop"});
	}
	,playPause: function() {
		this._synth.postMessage({ cmd : "playPause"});
	}
	,pause: function() {
		this._synth.postMessage({ cmd : "pause"});
	}
	,play: function() {
		this._synth.postMessage({ cmd : "play"});
	}
	,isReadyForPlay: function() {
		this._synth.postMessage({ cmd : "isReadyForPlay"});
	}
	,startup: function() {
	}
	,__class__: as.main.webworker.flash.AlphaSynthFlashPlayerApi
}
as.main.webworker.webaudio = {}
as.main.webworker.webaudio.AlphaSynthJsPlayer = function() {
	this._finished = false;
	this._circularBuffer = new as.ds.CircularSampleBuffer(40960);
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	this._context = new AudioContext();
	this._buffer = this._context.createBuffer(2,4096,44100);
	this._audioNode = this._context.createScriptProcessor(4096,0,2);
	this._audioNode.onaudioprocess = $bind(this,this.generateSound);
};
$hxClasses["as.main.webworker.webaudio.AlphaSynthJsPlayer"] = as.main.webworker.webaudio.AlphaSynthJsPlayer;
as.main.webworker.webaudio.AlphaSynthJsPlayer.__name__ = ["as","main","webworker","webaudio","AlphaSynthJsPlayer"];
as.main.webworker.webaudio.AlphaSynthJsPlayer.prototype = {
	generateSound: function(e) {
		var left = e.outputBuffer.getChannelData(0);
		var right = e.outputBuffer.getChannelData(1);
		var samples = left.length + right.length;
		if(this._circularBuffer._sampleCount < samples) {
			if(this._finished) {
				if(this.finished != null) this.finished();
				this.stop();
			} else {
				this._pauseTime += 4096000 / 88200 | 0;
				haxe.Log.trace("buffering " + this._pauseTime,{ fileName : "AlphaSynthJsPlayer.hx", lineNumber : 161, className : "as.main.webworker.webaudio.AlphaSynthJsPlayer", methodName : "generateSound"});
			}
		} else {
			var buffer = new Float32Array(samples);
			this._circularBuffer.read(buffer,0,buffer.length);
			var s = 0;
			var _g1 = 0, _g = left.length;
			while(_g1 < _g) {
				var i = _g1++;
				left[i] = buffer[s++];
				right[i] = buffer[s++];
			}
		}
		if(this.positionChanged != null) this.positionChanged(this._context.currentTime * 1000 - this._startTime - this._pauseTime - 4096000 / 88200 | 0);
		if(!this._finished) this.requestBuffers();
	}
	,calcPosition: function() {
		return this._context.currentTime * 1000 - this._startTime - this._pauseTime - 4096000 / 88200;
	}
	,requestBuffers: function() {
		var count = 20480.;
		if(this._circularBuffer._sampleCount < count) {
			var _g = 0;
			while(_g < 5) {
				var i = _g++;
				if(this.requestBuffer != null) this.requestBuffer();
			}
		}
	}
	,addSamples: function(f) {
		this._circularBuffer.write(f,0,f.length);
	}
	,finish: function() {
		this._finished = true;
	}
	,seek: function(position) {
		this._startTime = this._context.currentTime * 1000 - position | 0;
		this._pauseTime = 0;
	}
	,stop: function() {
		this._finished = true;
		this._paused = false;
		this._source.stop();
		this._source = null;
		this._circularBuffer.clear();
		this._audioNode.disconnect();
	}
	,pause: function() {
		this._source.stop();
		this._source = null;
		this._paused = true;
		this._pauseStart = this._context.currentTime * 1000 | 0;
		this._audioNode.disconnect();
	}
	,play: function() {
		this.requestBuffers();
		this._finished = false;
		if(this._paused) {
			this._paused = false;
			this._pauseTime += this._context.currentTime * 1000 - this._pauseStart | 0;
		} else {
			this._startTime = this._context.currentTime * 1000 | 0;
			this._pauseTime = 0;
		}
		this._source = this._context.createBufferSource();
		this._source.buffer = this._buffer;
		this._source.loop = true;
		this._source.connect(this._audioNode);
		this._source.start(0);
		this._audioNode.connect(this._context.destination);
	}
	,__class__: as.main.webworker.webaudio.AlphaSynthJsPlayer
}
as.main.webworker.webaudio.AlphaSynthJsPlayerApi = function() {
	this._player = new as.main.webworker.webaudio.AlphaSynthJsPlayer();
	this._player.positionChanged = $bind(this,this.playerPositionChanged);
	this._player.requestBuffer = $bind(this,this.playerSampleRequest);
	this._player.finished = $bind(this,this.playerFinished);
	this._events = new js.JQuery("<span></span>");
};
$hxClasses["as.main.webworker.webaudio.AlphaSynthJsPlayerApi"] = as.main.webworker.webaudio.AlphaSynthJsPlayerApi;
as.main.webworker.webaudio.AlphaSynthJsPlayerApi.__name__ = ["as","main","webworker","webaudio","AlphaSynthJsPlayerApi"];
as.main.webworker.webaudio.AlphaSynthJsPlayerApi.__interfaces__ = [as.main.IAlphaSynthAsync];
as.main.webworker.webaudio.AlphaSynthJsPlayerApi.init = function(asRoot) {
	if(asRoot != "" && !StringTools.endsWith(asRoot,"/")) asRoot += "/";
	js.Browser.window.AlphaSynthWorker = new Worker(asRoot + "alphaSynthWorker.js");
	return true;
}
as.main.webworker.webaudio.AlphaSynthJsPlayerApi.prototype = {
	log: function(level,message) {
		var console = window.console;
		switch(level) {
		case 0:
			console.log(message);
			break;
		case 1:
			console.debug(message);
			break;
		case 2:
			console.info(message);
			break;
		case 3:
			console.warn(message);
			break;
		case 4:
			console.error(message);
			break;
		}
	}
	,playerPositionChanged: function(pos) {
		this._synth.postMessage({ cmd : "playerPositionChanged", pos : pos});
	}
	,playerFinished: function() {
		this._synth.postMessage({ cmd : "playerFinished"});
	}
	,playerSampleRequest: function() {
		this._synth.postMessage({ cmd : "playerSampleRequest"});
	}
	,playerReady: function() {
		this._synth = js.Browser.window.AlphaSynthWorker;
		this._synth.addEventListener("message",$bind(this,this.handleWorkerMessage),false);
		this._synth.postMessage({ cmd : "playerReady"});
		this._events.trigger('ready');
	}
	,on: function(events,fn) {
		this._events.on(events,fn);
	}
	,handleWorkerMessage: function(e) {
		var data = e.data;
		switch(data.cmd) {
		case "isReadyForPlay":
			this._events.trigger(data.cmd, [data.value]);
			break;
		case "getState":
			this._events.trigger(data.cmd, [data.value]);
			break;
		case "isSoundFontLoaded":
			this._events.trigger(data.cmd, [data.value]);
			break;
		case "isMidiLoaded":
			this._events.trigger(data.cmd, [data.value]);
			break;
		case "positionChanged":
			this._events.trigger(data.cmd, [data.currentTime, data.endTime, data.currentTick, data.endTick]);
			break;
		case "playerStateChanged":
			this._events.trigger(data.cmd, [data.state]);
			break;
		case "finished":
			this._events.trigger(data.cmd);
			break;
		case "soundFontLoad":
			this._events.trigger(data.cmd, [data.loaded, data.full]);
			break;
		case "soundFontLoaded":
			this._events.trigger(data.cmd);
			break;
		case "soundFontLoadFailed":
			this._events.trigger(data.cmd);
			break;
		case "midiLoad":
			this._events.trigger(data.cmd, [data.loaded, data.full]);
			break;
		case "midiFileLoaded":
			this._events.trigger(data.cmd);
			break;
		case "midiFileLoadFailed":
			this._events.trigger(data.cmd);
			break;
		case "readyForPlay":
			this._events.trigger(data.cmd, data.value);
			break;
		case "log":
			this.log(data.level,data.message);
			break;
		case "playerSequencerFinished":
			this._player.finish();
			break;
		case "playerAddSamples":
			this._player.addSamples(data.samples);
			break;
		case "playerPlay":
			this._player.play();
			break;
		case "playerPause":
			this._player.pause();
			break;
		case "playerStop":
			this._player.stop();
			break;
		case "playerSeek":
			this._player.seek(data.pos);
			break;
		}
	}
	,qualifyURL: function(url) {
		var img = js.Browser.document.createElement("img");
		img.onerror = function(e) {
		};
		img.src = url;
		url = img.src;
		img.src = null;
		return url;
	}
	,setLogLevel: function(level) {
		this._synth.postMessage({ cmd : "setLogLevel", level : level});
	}
	,isMidiLoaded: function() {
		this._synth.postMessage({ cmd : "isMidiLoaded"});
	}
	,isSoundFontLoaded: function() {
		this._synth.postMessage({ cmd : "isSoundFontLoaded"});
	}
	,getState: function() {
		this._synth.postMessage({ cmd : "getState"});
	}
	,loadMidiData: function(data) {
		this._synth.postMessage({ cmd : "loadMidiData", data : data});
	}
	,loadMidiUrl: function(url) {
		this._synth.postMessage({ cmd : "loadMidiUrl", url : this.qualifyURL(url)});
	}
	,loadMidiBytes: function(data) {
		this._synth.postMessage({ cmd : "loadMidiData", data : haxe.Serializer.run(data)});
	}
	,loadSoundFontData: function(data) {
		this._synth.postMessage({ cmd : "loadSoundFontData", data : data});
	}
	,loadSoundFontUrl: function(url) {
		this._synth.postMessage({ cmd : "loadSoundFontUrl", url : this.qualifyURL(url)});
	}
	,setPositionTime: function(millis) {
		this._synth.postMessage({ cmd : "setPositionTime", time : millis});
	}
	,setPositionTick: function(tick) {
		this._synth.postMessage({ cmd : "setPositionTick", tick : tick});
	}
	,stop: function() {
		this._synth.postMessage({ cmd : "stop"});
	}
	,playPause: function() {
		this._synth.postMessage({ cmd : "playPause"});
	}
	,pause: function() {
		this._synth.postMessage({ cmd : "pause"});
	}
	,play: function() {
		this._synth.postMessage({ cmd : "play"});
	}
	,isReadyForPlay: function() {
		this._synth.postMessage({ cmd : "isReadyForPlay"});
	}
	,startup: function() {
		this.playerReady();
	}
	,__class__: as.main.webworker.webaudio.AlphaSynthJsPlayerApi
}
as.platform = {}
as.platform.TypeUtils = function() { }
$hxClasses["as.platform.TypeUtils"] = as.platform.TypeUtils;
as.platform.TypeUtils.__name__ = ["as","platform","TypeUtils"];
as.platform.TypeUtils.clearIntArray = function(a) {
	var _g1 = 0, _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = 0;
	}
}
as.platform.TypeUtils.clearShortArray = function(a) {
	var _g1 = 0, _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = 0;
	}
}
as.platform.TypeUtils.clearSampleArray = function(a) {
	var _g1 = 0, _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = 0.0;
	}
}
as.platform.TypeUtils.clearObjectArray = function(a) {
	var _g1 = 0, _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = null;
	}
}
as.platform.TypeUtils.ToInt8 = function(v) {
	return ((v & 255) >> 7) * -256 + (v & 255);
}
as.platform.TypeUtils.ToUInt8 = function(v) {
	return v & 255;
}
as.platform.TypeUtils.ToInt16 = function(v) {
	return ((v & 65535) >> 15) * -65536 + (v & 65535);
}
as.platform.TypeUtils.ToUInt16 = function(v) {
	return v & 65535;
}
as.platform.TypeUtils.byteArrayFromArray = function(array) {
	var bytes = haxe.io.Bytes.alloc(array.length);
	var _g1 = 0, _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		bytes.b[i] = array[i] & 255;
	}
	return bytes;
}
as.player = {}
as.player.SynthPlayerState = $hxClasses["as.player.SynthPlayerState"] = { __ename__ : ["as","player","SynthPlayerState"], __constructs__ : ["Stopped","Playing","Paused"] }
as.player.SynthPlayerState.Stopped = ["Stopped",0];
as.player.SynthPlayerState.Stopped.toString = $estr;
as.player.SynthPlayerState.Stopped.__enum__ = as.player.SynthPlayerState;
as.player.SynthPlayerState.Playing = ["Playing",1];
as.player.SynthPlayerState.Playing.toString = $estr;
as.player.SynthPlayerState.Playing.__enum__ = as.player.SynthPlayerState;
as.player.SynthPlayerState.Paused = ["Paused",2];
as.player.SynthPlayerState.Paused.toString = $estr;
as.player.SynthPlayerState.Paused.__enum__ = as.player.SynthPlayerState;
as.util = {}
as.util.SynthConstants = function() { }
$hxClasses["as.util.SynthConstants"] = as.util.SynthConstants;
as.util.SynthConstants.__name__ = ["as","util","SynthConstants"];
var haxe = {}
haxe.StackItem = $hxClasses["haxe.StackItem"] = { __ename__ : ["haxe","StackItem"], __constructs__ : ["CFunction","Module","FilePos","Method","Lambda"] }
haxe.StackItem.CFunction = ["CFunction",0];
haxe.StackItem.CFunction.toString = $estr;
haxe.StackItem.CFunction.__enum__ = haxe.StackItem;
haxe.StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.Lambda = function(v) { var $x = ["Lambda",4,v]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.CallStack = function() { }
$hxClasses["haxe.CallStack"] = haxe.CallStack;
haxe.CallStack.__name__ = ["haxe","CallStack"];
haxe.CallStack.callStack = function() {
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe.StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe.StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe.CallStack.makeStack(new Error().stack);
	a.shift();
	Error.prepareStackTrace = oldValue;
	return a;
}
haxe.CallStack.makeStack = function(s) {
	if(typeof(s) == "string") {
		var stack = s.split("\n");
		var m = [];
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			m.push(haxe.StackItem.Module(line));
		}
		return m;
	} else return s;
}
haxe.Log = function() { }
$hxClasses["haxe.Log"] = haxe.Log;
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Serializer = function() {
	this.buf = new StringBuf();
	this.cache = new Array();
	this.useCache = haxe.Serializer.USE_CACHE;
	this.useEnumIndex = haxe.Serializer.USE_ENUM_INDEX;
	this.shash = new haxe.ds.StringMap();
	this.scount = 0;
};
$hxClasses["haxe.Serializer"] = haxe.Serializer;
haxe.Serializer.__name__ = ["haxe","Serializer"];
haxe.Serializer.run = function(v) {
	var s = new haxe.Serializer();
	s.serialize(v);
	return s.toString();
}
haxe.Serializer.prototype = {
	serializeException: function(e) {
		this.buf.b += "x";
		this.serialize(e);
	}
	,serialize: function(v) {
		var _g = Type["typeof"](v);
		var $e = (_g);
		switch( $e[1] ) {
		case 0:
			this.buf.b += "n";
			break;
		case 1:
			if(v == 0) {
				this.buf.b += "z";
				return;
			}
			this.buf.b += "i";
			this.buf.b += Std.string(v);
			break;
		case 2:
			if(Math.isNaN(v)) this.buf.b += "k"; else if(!Math.isFinite(v)) this.buf.b += Std.string(v < 0?"m":"p"); else {
				this.buf.b += "d";
				this.buf.b += Std.string(v);
			}
			break;
		case 3:
			this.buf.b += Std.string(v?"t":"f");
			break;
		case 6:
			var c = $e[2];
			if(c == String) {
				this.serializeString(v);
				return;
			}
			if(this.useCache && this.serializeRef(v)) return;
			switch(c) {
			case Array:
				var ucount = 0;
				this.buf.b += "a";
				var l = v.length;
				var _g1 = 0;
				while(_g1 < l) {
					var i = _g1++;
					if(v[i] == null) ucount++; else {
						if(ucount > 0) {
							if(ucount == 1) this.buf.b += "n"; else {
								this.buf.b += "u";
								this.buf.b += Std.string(ucount);
							}
							ucount = 0;
						}
						this.serialize(v[i]);
					}
				}
				if(ucount > 0) {
					if(ucount == 1) this.buf.b += "n"; else {
						this.buf.b += "u";
						this.buf.b += Std.string(ucount);
					}
				}
				this.buf.b += "h";
				break;
			case List:
				this.buf.b += "l";
				var v1 = v;
				var $it0 = v1.iterator();
				while( $it0.hasNext() ) {
					var i = $it0.next();
					this.serialize(i);
				}
				this.buf.b += "h";
				break;
			case Date:
				var d = v;
				this.buf.b += "v";
				this.buf.b += Std.string(HxOverrides.dateStr(d));
				break;
			case haxe.ds.StringMap:
				this.buf.b += "b";
				var v1 = v;
				var $it1 = v1.keys();
				while( $it1.hasNext() ) {
					var k = $it1.next();
					this.serializeString(k);
					this.serialize(v1.get(k));
				}
				this.buf.b += "h";
				break;
			case haxe.ds.IntMap:
				this.buf.b += "q";
				var v1 = v;
				var $it2 = v1.keys();
				while( $it2.hasNext() ) {
					var k = $it2.next();
					this.buf.b += ":";
					this.buf.b += Std.string(k);
					this.serialize(v1.get(k));
				}
				this.buf.b += "h";
				break;
			case haxe.ds.ObjectMap:
				this.buf.b += "M";
				var v1 = v;
				var $it3 = v1.keys();
				while( $it3.hasNext() ) {
					var k = $it3.next();
					var id = Reflect.field(k,"__id__");
					Reflect.deleteField(k,"__id__");
					this.serialize(k);
					k.__id__ = id;
					this.serialize(v1.h[k.__id__]);
				}
				this.buf.b += "h";
				break;
			case haxe.io.Bytes:
				var v1 = v;
				var i = 0;
				var max = v1.length - 2;
				var charsBuf = new StringBuf();
				var b64 = haxe.Serializer.BASE64;
				while(i < max) {
					var b1 = v1.b[i++];
					var b2 = v1.b[i++];
					var b3 = v1.b[i++];
					charsBuf.b += Std.string(b64.charAt(b1 >> 2));
					charsBuf.b += Std.string(b64.charAt((b1 << 4 | b2 >> 4) & 63));
					charsBuf.b += Std.string(b64.charAt((b2 << 2 | b3 >> 6) & 63));
					charsBuf.b += Std.string(b64.charAt(b3 & 63));
				}
				if(i == max) {
					var b1 = v1.b[i++];
					var b2 = v1.b[i++];
					charsBuf.b += Std.string(b64.charAt(b1 >> 2));
					charsBuf.b += Std.string(b64.charAt((b1 << 4 | b2 >> 4) & 63));
					charsBuf.b += Std.string(b64.charAt(b2 << 2 & 63));
				} else if(i == max + 1) {
					var b1 = v1.b[i++];
					charsBuf.b += Std.string(b64.charAt(b1 >> 2));
					charsBuf.b += Std.string(b64.charAt(b1 << 4 & 63));
				}
				var chars = charsBuf.b;
				this.buf.b += "s";
				this.buf.b += Std.string(chars.length);
				this.buf.b += ":";
				this.buf.b += Std.string(chars);
				break;
			default:
				this.cache.pop();
				if(v.hxSerialize != null) {
					this.buf.b += "C";
					this.serializeString(Type.getClassName(c));
					this.cache.push(v);
					v.hxSerialize(this);
					this.buf.b += "g";
				} else {
					this.buf.b += "c";
					this.serializeString(Type.getClassName(c));
					this.cache.push(v);
					this.serializeFields(v);
				}
			}
			break;
		case 4:
			if(this.useCache && this.serializeRef(v)) return;
			this.buf.b += "o";
			this.serializeFields(v);
			break;
		case 7:
			var e = $e[2];
			if(this.useCache && this.serializeRef(v)) return;
			this.cache.pop();
			this.buf.b += Std.string(this.useEnumIndex?"j":"w");
			this.serializeString(Type.getEnumName(e));
			if(this.useEnumIndex) {
				this.buf.b += ":";
				this.buf.b += Std.string(v[1]);
			} else this.serializeString(v[0]);
			this.buf.b += ":";
			var l = v.length;
			this.buf.b += Std.string(l - 2);
			var _g1 = 2;
			while(_g1 < l) {
				var i = _g1++;
				this.serialize(v[i]);
			}
			this.cache.push(v);
			break;
		case 5:
			throw "Cannot serialize function";
			break;
		default:
			throw "Cannot serialize " + Std.string(v);
		}
	}
	,serializeFields: function(v) {
		var _g = 0, _g1 = Reflect.fields(v);
		while(_g < _g1.length) {
			var f = _g1[_g];
			++_g;
			this.serializeString(f);
			this.serialize(Reflect.field(v,f));
		}
		this.buf.b += "g";
	}
	,serializeRef: function(v) {
		var vt = typeof(v);
		var _g1 = 0, _g = this.cache.length;
		while(_g1 < _g) {
			var i = _g1++;
			var ci = this.cache[i];
			if(typeof(ci) == vt && ci == v) {
				this.buf.b += "r";
				this.buf.b += Std.string(i);
				return true;
			}
		}
		this.cache.push(v);
		return false;
	}
	,serializeString: function(s) {
		var x = this.shash.get(s);
		if(x != null) {
			this.buf.b += "R";
			this.buf.b += Std.string(x);
			return;
		}
		this.shash.set(s,this.scount++);
		this.buf.b += "y";
		s = StringTools.urlEncode(s);
		this.buf.b += Std.string(s.length);
		this.buf.b += ":";
		this.buf.b += Std.string(s);
	}
	,toString: function() {
		return this.buf.b;
	}
	,__class__: haxe.Serializer
}
haxe.Timer = function() { }
$hxClasses["haxe.Timer"] = haxe.Timer;
haxe.Timer.__name__ = ["haxe","Timer"];
haxe.Timer.stamp = function() {
	return new Date().getTime() / 1000;
}
haxe.Unserializer = function(buf) {
	this.buf = buf;
	this.length = buf.length;
	this.pos = 0;
	this.scache = new Array();
	this.cache = new Array();
	var r = haxe.Unserializer.DEFAULT_RESOLVER;
	if(r == null) {
		r = Type;
		haxe.Unserializer.DEFAULT_RESOLVER = r;
	}
	this.setResolver(r);
};
$hxClasses["haxe.Unserializer"] = haxe.Unserializer;
haxe.Unserializer.__name__ = ["haxe","Unserializer"];
haxe.Unserializer.initCodes = function() {
	var codes = new Array();
	var _g1 = 0, _g = haxe.Unserializer.BASE64.length;
	while(_g1 < _g) {
		var i = _g1++;
		codes[haxe.Unserializer.BASE64.charCodeAt(i)] = i;
	}
	return codes;
}
haxe.Unserializer.prototype = {
	unserialize: function() {
		var _g = this.buf.charCodeAt(this.pos++);
		switch(_g) {
		case 110:
			return null;
		case 116:
			return true;
		case 102:
			return false;
		case 122:
			return 0;
		case 105:
			return this.readDigits();
		case 100:
			var p1 = this.pos;
			while(true) {
				var c = this.buf.charCodeAt(this.pos);
				if(c >= 43 && c < 58 || c == 101 || c == 69) this.pos++; else break;
			}
			return Std.parseFloat(HxOverrides.substr(this.buf,p1,this.pos - p1));
		case 121:
			var len = this.readDigits();
			if(this.buf.charCodeAt(this.pos++) != 58 || this.length - this.pos < len) throw "Invalid string length";
			var s = HxOverrides.substr(this.buf,this.pos,len);
			this.pos += len;
			s = StringTools.urlDecode(s);
			this.scache.push(s);
			return s;
		case 107:
			return Math.NaN;
		case 109:
			return Math.NEGATIVE_INFINITY;
		case 112:
			return Math.POSITIVE_INFINITY;
		case 97:
			var buf = this.buf;
			var a = new Array();
			this.cache.push(a);
			while(true) {
				var c = this.buf.charCodeAt(this.pos);
				if(c == 104) {
					this.pos++;
					break;
				}
				if(c == 117) {
					this.pos++;
					var n = this.readDigits();
					a[a.length + n - 1] = null;
				} else a.push(this.unserialize());
			}
			return a;
		case 111:
			var o = { };
			this.cache.push(o);
			this.unserializeObject(o);
			return o;
		case 114:
			var n = this.readDigits();
			if(n < 0 || n >= this.cache.length) throw "Invalid reference";
			return this.cache[n];
		case 82:
			var n = this.readDigits();
			if(n < 0 || n >= this.scache.length) throw "Invalid string reference";
			return this.scache[n];
		case 120:
			throw this.unserialize();
			break;
		case 99:
			var name = this.unserialize();
			var cl = this.resolver.resolveClass(name);
			if(cl == null) throw "Class not found " + name;
			var o = Type.createEmptyInstance(cl);
			this.cache.push(o);
			this.unserializeObject(o);
			return o;
		case 119:
			var name = this.unserialize();
			var edecl = this.resolver.resolveEnum(name);
			if(edecl == null) throw "Enum not found " + name;
			var e = this.unserializeEnum(edecl,this.unserialize());
			this.cache.push(e);
			return e;
		case 106:
			var name = this.unserialize();
			var edecl = this.resolver.resolveEnum(name);
			if(edecl == null) throw "Enum not found " + name;
			this.pos++;
			var index = this.readDigits();
			var tag = Type.getEnumConstructs(edecl)[index];
			if(tag == null) throw "Unknown enum index " + name + "@" + index;
			var e = this.unserializeEnum(edecl,tag);
			this.cache.push(e);
			return e;
		case 108:
			var l = new List();
			this.cache.push(l);
			var buf = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) l.add(this.unserialize());
			this.pos++;
			return l;
		case 98:
			var h = new haxe.ds.StringMap();
			this.cache.push(h);
			var buf = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s = this.unserialize();
				h.set(s,this.unserialize());
			}
			this.pos++;
			return h;
		case 113:
			var h = new haxe.ds.IntMap();
			this.cache.push(h);
			var buf = this.buf;
			var c = this.buf.charCodeAt(this.pos++);
			while(c == 58) {
				var i = this.readDigits();
				h.set(i,this.unserialize());
				c = this.buf.charCodeAt(this.pos++);
			}
			if(c != 104) throw "Invalid IntMap format";
			return h;
		case 77:
			var h = new haxe.ds.ObjectMap();
			this.cache.push(h);
			var buf = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s = this.unserialize();
				h.set(s,this.unserialize());
			}
			this.pos++;
			return h;
		case 118:
			var d = HxOverrides.strDate(HxOverrides.substr(this.buf,this.pos,19));
			this.cache.push(d);
			this.pos += 19;
			return d;
		case 115:
			var len = this.readDigits();
			var buf = this.buf;
			if(this.buf.charCodeAt(this.pos++) != 58 || this.length - this.pos < len) throw "Invalid bytes length";
			var codes = haxe.Unserializer.CODES;
			if(codes == null) {
				codes = haxe.Unserializer.initCodes();
				haxe.Unserializer.CODES = codes;
			}
			var i = this.pos;
			var rest = len & 3;
			var size = (len >> 2) * 3 + (rest >= 2?rest - 1:0);
			var max = i + (len - rest);
			var bytes = haxe.io.Bytes.alloc(size);
			var bpos = 0;
			while(i < max) {
				var c1 = codes[buf.charCodeAt(i++)];
				var c2 = codes[buf.charCodeAt(i++)];
				bytes.b[bpos++] = (c1 << 2 | c2 >> 4) & 255;
				var c3 = codes[buf.charCodeAt(i++)];
				bytes.b[bpos++] = (c2 << 4 | c3 >> 2) & 255;
				var c4 = codes[buf.charCodeAt(i++)];
				bytes.b[bpos++] = (c3 << 6 | c4) & 255;
			}
			if(rest >= 2) {
				var c1 = codes[buf.charCodeAt(i++)];
				var c2 = codes[buf.charCodeAt(i++)];
				bytes.b[bpos++] = (c1 << 2 | c2 >> 4) & 255;
				if(rest == 3) {
					var c3 = codes[buf.charCodeAt(i++)];
					bytes.b[bpos++] = (c2 << 4 | c3 >> 2) & 255;
				}
			}
			this.pos += len;
			this.cache.push(bytes);
			return bytes;
		case 67:
			var name = this.unserialize();
			var cl = this.resolver.resolveClass(name);
			if(cl == null) throw "Class not found " + name;
			var o = Type.createEmptyInstance(cl);
			this.cache.push(o);
			o.hxUnserialize(this);
			if(this.buf.charCodeAt(this.pos++) != 103) throw "Invalid custom data";
			return o;
		default:
		}
		this.pos--;
		throw "Invalid char " + this.buf.charAt(this.pos) + " at position " + this.pos;
	}
	,unserializeEnum: function(edecl,tag) {
		if(this.buf.charCodeAt(this.pos++) != 58) throw "Invalid enum format";
		var nargs = this.readDigits();
		if(nargs == 0) return Type.createEnum(edecl,tag);
		var args = new Array();
		while(nargs-- > 0) args.push(this.unserialize());
		return Type.createEnum(edecl,tag,args);
	}
	,unserializeObject: function(o) {
		while(true) {
			if(this.pos >= this.length) throw "Invalid object";
			if(this.buf.charCodeAt(this.pos) == 103) break;
			var k = this.unserialize();
			if(!js.Boot.__instanceof(k,String)) throw "Invalid object key";
			var v = this.unserialize();
			o[k] = v;
		}
		this.pos++;
	}
	,readDigits: function() {
		var k = 0;
		var s = false;
		var fpos = this.pos;
		while(true) {
			var c = this.buf.charCodeAt(this.pos);
			if(c != c) break;
			if(c == 45) {
				if(this.pos != fpos) break;
				s = true;
				this.pos++;
				continue;
			}
			if(c < 48 || c > 57) break;
			k = k * 10 + (c - 48);
			this.pos++;
		}
		if(s) k *= -1;
		return k;
	}
	,setResolver: function(r) {
		if(r == null) this.resolver = { resolveClass : function(_) {
			return null;
		}, resolveEnum : function(_) {
			return null;
		}}; else this.resolver = r;
	}
	,__class__: haxe.Unserializer
}
haxe.ds = {}
haxe.ds.IntMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.IntMap"] = haxe.ds.IntMap;
haxe.ds.IntMap.__name__ = ["haxe","ds","IntMap"];
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,get: function(key) {
		return this.h[key];
	}
	,set: function(key,value) {
		this.h[key] = value;
	}
	,__class__: haxe.ds.IntMap
}
haxe.ds.ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
$hxClasses["haxe.ds.ObjectMap"] = haxe.ds.ObjectMap;
haxe.ds.ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe.ds.ObjectMap.__interfaces__ = [IMap];
haxe.ds.ObjectMap.prototype = {
	keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,get: function(key) {
		return this.h[key.__id__];
	}
	,set: function(key,value) {
		var id = key.__id__ != null?key.__id__:key.__id__ = ++haxe.ds.ObjectMap.count;
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,__class__: haxe.ds.ObjectMap
}
haxe.ds.StringMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.StringMap"] = haxe.ds.StringMap;
haxe.ds.StringMap.__name__ = ["haxe","ds","StringMap"];
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,exists: function(key) {
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
haxe.ds._Vector = {}
haxe.ds._Vector.Vector_Impl_ = function() { }
$hxClasses["haxe.ds._Vector.Vector_Impl_"] = haxe.ds._Vector.Vector_Impl_;
haxe.ds._Vector.Vector_Impl_.__name__ = ["haxe","ds","_Vector","Vector_Impl_"];
haxe.ds._Vector.Vector_Impl_.blit = function(src,srcPos,dest,destPos,len) {
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		dest[destPos + i] = src[srcPos + i];
	}
}
haxe.io = {}
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
$hxClasses["haxe.io.Bytes"] = haxe.io.Bytes;
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
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
}
haxe.io.Bytes.prototype = {
	__class__: haxe.io.Bytes
}
haxe.remoting = {}
haxe.remoting.Connection = function() { }
$hxClasses["haxe.remoting.Connection"] = haxe.remoting.Connection;
haxe.remoting.Connection.__name__ = ["haxe","remoting","Connection"];
haxe.remoting.Connection.prototype = {
	__class__: haxe.remoting.Connection
}
haxe.remoting.Context = function() {
	this.objects = new haxe.ds.StringMap();
};
$hxClasses["haxe.remoting.Context"] = haxe.remoting.Context;
haxe.remoting.Context.__name__ = ["haxe","remoting","Context"];
haxe.remoting.Context.prototype = {
	call: function(path,params) {
		if(path.length < 2) throw "Invalid path '" + path.join(".") + "'";
		var inf = this.objects.get(path[0]);
		if(inf == null) throw "No such object " + path[0];
		var o = inf.obj;
		var m = Reflect.field(o,path[1]);
		if(path.length > 2) {
			if(!inf.rec) throw "Can't access " + path.join(".");
			var _g1 = 2, _g = path.length;
			while(_g1 < _g) {
				var i = _g1++;
				o = m;
				m = Reflect.field(o,path[i]);
			}
		}
		if(!Reflect.isFunction(m)) throw "No such method " + path.join(".");
		return m.apply(o,params);
	}
	,addObject: function(name,obj,recursive) {
		this.objects.set(name,{ obj : obj, rec : recursive});
	}
	,__class__: haxe.remoting.Context
}
haxe.remoting.ExternalConnection = function(data,path) {
	this.__data = data;
	this.__path = path;
};
$hxClasses["haxe.remoting.ExternalConnection"] = haxe.remoting.ExternalConnection;
$hxExpose(haxe.remoting.ExternalConnection, "haxe.remoting.ExternalConnection");
haxe.remoting.ExternalConnection.__name__ = ["haxe","remoting","ExternalConnection"];
haxe.remoting.ExternalConnection.__interfaces__ = [haxe.remoting.Connection];
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
	} catch( e ) {
		var s = new haxe.Serializer();
		s.serializeException(e);
		return s.toString();
	}
}
haxe.remoting.ExternalConnection.flashConnect = function(name,flashObjectID,ctx) {
	var cnx = new haxe.remoting.ExternalConnection({ ctx : ctx, name : name, flash : flashObjectID},[]);
	haxe.remoting.ExternalConnection.connections.set(name,cnx);
	return cnx;
}
haxe.remoting.ExternalConnection.prototype = {
	call: function(params) {
		var s = new haxe.Serializer();
		s.serialize(params);
		var params1 = s.toString();
		var data = null;
		var fobj = window.document[this.__data.flash];
		if(fobj == null) fobj = window.document.getElementById(this.__data.flash);
		if(fobj == null) throw "Could not find flash object '" + this.__data.flash + "'";
		try {
			data = fobj.externalRemotingCall(this.__data.name,this.__path.join("."),params1);
		} catch( e ) {
		}
		if(data == null) {
			var domain, pageDomain;
			try {
				domain = fobj.src.split("/")[2];
				pageDomain = js.Browser.window.location.host;
			} catch( e ) {
				domain = null;
				pageDomain = null;
			}
			if(domain != pageDomain) throw "ExternalConnection call failure : SWF need allowDomain('" + pageDomain + "')";
			throw "Call failure : ExternalConnection is not " + "initialized in Flash";
		}
		return new haxe.Unserializer(data).unserialize();
	}
	,resolve: function(field) {
		var e = new haxe.remoting.ExternalConnection(this.__data,this.__path.slice());
		e.__path.push(field);
		return e;
	}
	,__class__: haxe.remoting.ExternalConnection
}
var js = {}
js.Boot = function() { }
$hxClasses["js.Boot"] = js.Boot;
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0, _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js.Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
}
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
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
}
js.Browser = function() { }
$hxClasses["js.Browser"] = js.Browser;
js.Browser.__name__ = ["js","Browser"];
mconsole.PrinterBase = function() {
	this.printPosition = true;
	this.printLineNumbers = true;
};
$hxClasses["mconsole.PrinterBase"] = mconsole.PrinterBase;
mconsole.PrinterBase.__name__ = ["mconsole","PrinterBase"];
mconsole.PrinterBase.prototype = {
	printLine: function(color,line,pos) {
		throw "method not implemented in ConsolePrinterBase";
	}
	,print: function(level,params,indent,pos) {
		params = params.slice();
		var _g1 = 0, _g = params.length;
		while(_g1 < _g) {
			var i = _g1++;
			params[i] = Std.string(params[i]);
		}
		var message = params.join(", ");
		var nextPosition = "@ " + pos.className + "." + pos.methodName;
		var nextLineNumber = Std.string(pos.lineNumber);
		var lineColumn = "";
		var emptyLineColumn = "";
		if(this.printPosition) {
			if(nextPosition != this.position) this.printLine(mconsole.ConsoleColor.none,nextPosition,pos);
		}
		if(this.printLineNumbers) {
			emptyLineColumn = StringTools.lpad(""," ",5);
			if(nextPosition != this.position || nextLineNumber != this.lineNumber) lineColumn = StringTools.lpad(nextLineNumber," ",4) + " "; else lineColumn = emptyLineColumn;
		}
		this.position = nextPosition;
		this.lineNumber = nextLineNumber;
		var color = (function($this) {
			var $r;
			switch( (level)[1] ) {
			case 0:
				$r = mconsole.ConsoleColor.white;
				break;
			case 1:
				$r = mconsole.ConsoleColor.blue;
				break;
			case 2:
				$r = mconsole.ConsoleColor.green;
				break;
			case 3:
				$r = mconsole.ConsoleColor.yellow;
				break;
			case 4:
				$r = mconsole.ConsoleColor.red;
				break;
			}
			return $r;
		}(this));
		var indent1 = StringTools.lpad(""," ",indent * 2);
		message = lineColumn + indent1 + message;
		message = message.split("\n").join("\n" + emptyLineColumn + indent1);
		this.printLine(color,message,pos);
	}
	,__class__: mconsole.PrinterBase
}
mconsole.ConsoleView = function() {
	mconsole.PrinterBase.call(this);
	this.atBottom = true;
	this.projectHome = "D:\\Dev\\AlphaTab\\alphaSynth/";
	var document = js.Browser.document;
	this.element = document.createElement("pre");
	this.element.id = "console";
	var style = document.createElement("style");
	this.element.appendChild(style);
	var rules = document.createTextNode("#console {\n\tfont-family:monospace;\n\tbackground-color:#002B36;\n\tbackground-color:rgba(0%,16.9%,21.2%,0.95);\n\tpadding:8px;\n\theight:600px;\n\tmax-height:600px;\n\toverflow-y:scroll;\n\tposition:absolute;\n\tleft:0px;\n\ttop:0px;\n\tright:0px;\n\tmargin:0px;\n\tz-index:10000;\n}\n#console a { text-decoration:none; }\n#console a:hover div { background-color:#063642 }\n#console a div span { display:none; float:right; color:white; }\n#console a:hover div span { display:block; }");
	style.type = "text/css";
	if(style.styleSheet) style.styleSheet.cssText = rules.nodeValue; else style.appendChild(rules);
	var me = this;
	this.element.onscroll = function(e) {
		me.updateScroll();
	};
};
$hxClasses["mconsole.ConsoleView"] = mconsole.ConsoleView;
mconsole.ConsoleView.__name__ = ["mconsole","ConsoleView"];
mconsole.ConsoleView.__interfaces__ = [mconsole.Printer];
mconsole.ConsoleView.__super__ = mconsole.PrinterBase;
mconsole.ConsoleView.prototype = $extend(mconsole.PrinterBase.prototype,{
	remove: function() {
		js.Browser.document.body.removeChild(this.element);
	}
	,attach: function() {
		js.Browser.document.body.appendChild(this.element);
	}
	,printLine: function(color,line,pos) {
		var style = (function($this) {
			var $r;
			switch( (color)[1] ) {
			case 0:
				$r = "#839496";
				break;
			case 1:
				$r = "#ffffff";
				break;
			case 2:
				$r = "#248bd2";
				break;
			case 3:
				$r = "#859900";
				break;
			case 4:
				$r = "#b58900";
				break;
			case 5:
				$r = "#dc322f";
				break;
			}
			return $r;
		}(this));
		var file = pos.fileName + ":" + pos.lineNumber;
		var fileName = pos.className.split(".").join("/") + ".hx";
		var link = "";
		this.element.innerHTML = this.element.innerHTML + "<a" + link + "><div style='color:" + style + "'>" + line + "<span>" + file + "</span></div></a>";
		if(this.atBottom) this.element.scrollTop = this.element.scrollHeight;
	}
	,updateScroll: function() {
		this.atBottom = this.element.scrollTop - (this.element.scrollHeight - this.element.clientHeight) == 0;
	}
	,__class__: mconsole.ConsoleView
});
mconsole.Console = function() { }
$hxClasses["mconsole.Console"] = mconsole.Console;
mconsole.Console.__name__ = ["mconsole","Console"];
mconsole.Console.start = function() {
	if(mconsole.Console.running) return;
	mconsole.Console.running = true;
	mconsole.Console.previousTrace = haxe.Log.trace;
	haxe.Log.trace = mconsole.Console.haxeTrace;
	if(mconsole.Console.hasConsole) {
	} else {
	}
}
mconsole.Console.stop = function() {
	if(!mconsole.Console.running) return;
	mconsole.Console.running = false;
	haxe.Log.trace = mconsole.Console.previousTrace;
	mconsole.Console.previousTrace = null;
}
mconsole.Console.addPrinter = function(printer) {
	mconsole.Console.removePrinter(printer);
	mconsole.Console.printers.push(printer);
}
mconsole.Console.removePrinter = function(printer) {
	HxOverrides.remove(mconsole.Console.printers,printer);
}
mconsole.Console.haxeTrace = function(value,pos) {
	var params = pos.customParams;
	if(params == null) params = []; else pos.customParams = null;
	var level = (function($this) {
		var $r;
		switch(value) {
		case "log":
			$r = mconsole.LogLevel.log;
			break;
		case "warn":
			$r = mconsole.LogLevel.warn;
			break;
		case "info":
			$r = mconsole.LogLevel.info;
			break;
		case "debug":
			$r = mconsole.LogLevel.debug;
			break;
		case "error":
			$r = mconsole.LogLevel.error;
			break;
		default:
			$r = (function($this) {
				var $r;
				params.unshift(value);
				$r = mconsole.LogLevel.log;
				return $r;
			}($this));
		}
		return $r;
	}(this));
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole(Std.string(level),params);
	mconsole.Console.print(level,params,pos);
}
mconsole.Console.print = function(level,params,pos) {
	var _g = 0, _g1 = mconsole.Console.printers;
	while(_g < _g1.length) {
		var printer = _g1[_g];
		++_g;
		printer.print(level,params,mconsole.Console.groupDepth,pos);
	}
}
mconsole.Console.log = function(message,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("log",[message]);
	mconsole.Console.print(mconsole.LogLevel.log,[message],pos);
}
mconsole.Console.info = function(message,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("info",[message]);
	mconsole.Console.print(mconsole.LogLevel.info,[message],pos);
}
mconsole.Console.debug = function(message,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("debug",[message]);
	mconsole.Console.print(mconsole.LogLevel.debug,[message],pos);
}
mconsole.Console.warn = function(message,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("warn",[message]);
	mconsole.Console.print(mconsole.LogLevel.warn,[message],pos);
}
mconsole.Console.error = function(message,stack,pos) {
	if(stack == null) stack = haxe.CallStack.callStack();
	var stackTrace = stack.length > 0?"\n" + mconsole.StackHelper.toString(stack):"";
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("error",[message]);
	mconsole.Console.print(mconsole.LogLevel.error,["Error: " + Std.string(message) + stackTrace],pos);
}
mconsole.Console.trace = function(pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("trace",[]);
	var stack = mconsole.StackHelper.toString(haxe.CallStack.callStack());
	mconsole.Console.print(mconsole.LogLevel.error,["Stack trace:\n" + stack],pos);
}
mconsole.Console.assert = function(expression,message,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("assert",[expression,message]);
	if(!expression) {
		var stack = mconsole.StackHelper.toString(haxe.CallStack.callStack());
		mconsole.Console.print(mconsole.LogLevel.error,["Assertion failed: " + Std.string(message) + "\n" + stack],pos);
		throw message;
	}
}
mconsole.Console.count = function(title,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("count",[title]);
	var position = pos.fileName + ":" + pos.lineNumber;
	var count = mconsole.Console.counts.exists(position)?mconsole.Console.counts.get(position) + 1:1;
	mconsole.Console.counts.set(position,count);
	mconsole.Console.print(mconsole.LogLevel.log,[title + ": " + count],pos);
}
mconsole.Console.group = function(message,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("group",[message]);
	mconsole.Console.print(mconsole.LogLevel.log,[message],pos);
	mconsole.Console.groupDepth += 1;
}
mconsole.Console.groupEnd = function(pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("groupEnd",[]);
	if(mconsole.Console.groupDepth > 0) mconsole.Console.groupDepth -= 1;
}
mconsole.Console.time = function(name,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("time",[name]);
	mconsole.Console.times.set(name,haxe.Timer.stamp());
}
mconsole.Console.timeEnd = function(name,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("timeEnd",[name]);
	if(mconsole.Console.times.exists(name)) {
		mconsole.Console.print(mconsole.LogLevel.log,[name + ": " + ((haxe.Timer.stamp() - mconsole.Console.times.get(name)) * 1000 | 0) + "ms"],pos);
		mconsole.Console.times.remove(name);
	}
}
mconsole.Console.markTimeline = function(label,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("markTimeline",[label]);
}
mconsole.Console.profile = function(title,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("profile",[title]);
}
mconsole.Console.profileEnd = function(title,pos) {
	if(mconsole.Console.hasConsole) mconsole.Console.callConsole("profileEnd",[title]);
}
mconsole.Console.enterDebugger = function() {
	debugger;
}
mconsole.Console.detectConsole = function() {
	if(console != null && console[mconsole.Console.dirxml] == null) mconsole.Console.dirxml = "log";
	return console != undefined && console.log != undefined && console.warn != undefined;
}
mconsole.Console.callConsole = function(method,params) {
	if(console[method] != null) {
		if(method == "log" && js.Boot.__instanceof(params[0],Xml)) method = mconsole.Console.dirxml;
		if(console[method].apply != null) console[method].apply(console,mconsole.Console.toConsoleValues(params)); else if(Function.prototype.bind != null) Function.prototype.bind.call(console[method],console).apply(console,mconsole.Console.toConsoleValues(params));
	}
}
mconsole.Console.toConsoleValues = function(params) {
	var _g1 = 0, _g = params.length;
	while(_g1 < _g) {
		var i = _g1++;
		params[i] = mconsole.Console.toConsoleValue(params[i]);
	}
	return params;
}
mconsole.Console.toConsoleValue = function(value) {
	var typeClass = Type.getClass(value);
	var typeName = typeClass == null?"":Type.getClassName(typeClass);
	if(typeName == "Xml") {
		var parser = new DOMParser();
		return parser.parseFromString(value.toString(),"text/xml").firstChild;
	} else if(typeName == "Map" || typeName == "StringMap" || typeName == "IntMap") {
		var $native = { };
		var map = value;
		var $it0 = map.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			$native[Std.string(key)] = mconsole.Console.toConsoleValue(map.get(key));
		}
		return $native;
	} else {
		var _g = Type["typeof"](value);
		var $e = (_g);
		switch( $e[1] ) {
		case 7:
			var e = $e[2];
			var $native = [];
			var name = Type.getEnumName(e) + "." + Type.enumConstructor(value);
			var params = Type.enumParameters(value);
			if(params.length > 0) {
				$native.push(name + "(");
				var _g2 = 0, _g1 = params.length;
				while(_g2 < _g1) {
					var i = _g2++;
					$native.push(mconsole.Console.toConsoleValue(params[i]));
				}
				$native.push(")");
			} else return [name];
			return $native;
		default:
		}
		if(typeName == "Array" || typeName == "List" || typeName == "haxe.FastList") {
			var $native = [];
			var iterable = value;
			var $it1 = $iterator(iterable)();
			while( $it1.hasNext() ) {
				var i = $it1.next();
				$native.push(mconsole.Console.toConsoleValue(i));
			}
			return $native;
		}
	}
	return value;
}
mconsole.ConsoleMacro = function() { }
$hxClasses["mconsole.ConsoleMacro"] = mconsole.ConsoleMacro;
mconsole.ConsoleMacro.__name__ = ["mconsole","ConsoleMacro"];
mconsole.LogLevel = $hxClasses["mconsole.LogLevel"] = { __ename__ : ["mconsole","LogLevel"], __constructs__ : ["log","info","debug","warn","error"] }
mconsole.LogLevel.log = ["log",0];
mconsole.LogLevel.log.toString = $estr;
mconsole.LogLevel.log.__enum__ = mconsole.LogLevel;
mconsole.LogLevel.info = ["info",1];
mconsole.LogLevel.info.toString = $estr;
mconsole.LogLevel.info.__enum__ = mconsole.LogLevel;
mconsole.LogLevel.debug = ["debug",2];
mconsole.LogLevel.debug.toString = $estr;
mconsole.LogLevel.debug.__enum__ = mconsole.LogLevel;
mconsole.LogLevel.warn = ["warn",3];
mconsole.LogLevel.warn.toString = $estr;
mconsole.LogLevel.warn.__enum__ = mconsole.LogLevel;
mconsole.LogLevel.error = ["error",4];
mconsole.LogLevel.error.toString = $estr;
mconsole.LogLevel.error.__enum__ = mconsole.LogLevel;
mconsole.ConsoleColor = $hxClasses["mconsole.ConsoleColor"] = { __ename__ : ["mconsole","ConsoleColor"], __constructs__ : ["none","white","blue","green","yellow","red"] }
mconsole.ConsoleColor.none = ["none",0];
mconsole.ConsoleColor.none.toString = $estr;
mconsole.ConsoleColor.none.__enum__ = mconsole.ConsoleColor;
mconsole.ConsoleColor.white = ["white",1];
mconsole.ConsoleColor.white.toString = $estr;
mconsole.ConsoleColor.white.__enum__ = mconsole.ConsoleColor;
mconsole.ConsoleColor.blue = ["blue",2];
mconsole.ConsoleColor.blue.toString = $estr;
mconsole.ConsoleColor.blue.__enum__ = mconsole.ConsoleColor;
mconsole.ConsoleColor.green = ["green",3];
mconsole.ConsoleColor.green.toString = $estr;
mconsole.ConsoleColor.green.__enum__ = mconsole.ConsoleColor;
mconsole.ConsoleColor.yellow = ["yellow",4];
mconsole.ConsoleColor.yellow.toString = $estr;
mconsole.ConsoleColor.yellow.__enum__ = mconsole.ConsoleColor;
mconsole.ConsoleColor.red = ["red",5];
mconsole.ConsoleColor.red.toString = $estr;
mconsole.ConsoleColor.red.__enum__ = mconsole.ConsoleColor;
mconsole.StackHelper = function() { }
$hxClasses["mconsole.StackHelper"] = mconsole.StackHelper;
mconsole.StackHelper.__name__ = ["mconsole","StackHelper"];
mconsole.StackHelper.createFilters = function() {
	var filters = new haxe.ds.StringMap();
	filters.set("@ mconsole.ConsoleRedirect.haxeTrace:59",true);
	return filters;
}
mconsole.StackHelper.toString = function(stack) {
	return "null";
}
mconsole.StackItemHelper = function() { }
$hxClasses["mconsole.StackItemHelper"] = mconsole.StackItemHelper;
mconsole.StackItemHelper.__name__ = ["mconsole","StackItemHelper"];
mconsole.StackItemHelper.toString = function(item,isFirst) {
	if(isFirst == null) isFirst = false;
	return (function($this) {
		var $r;
		var $e = (item);
		switch( $e[1] ) {
		case 1:
			var module = $e[2];
			$r = module;
			break;
		case 3:
			var method = $e[3], className = $e[2];
			$r = className + "." + method;
			break;
		case 4:
			var v = $e[2];
			$r = "Lambda(" + v + ")";
			break;
		case 2:
			var line = $e[4], file = $e[3], s = $e[2];
			$r = (s == null?file.split("::").join(".") + ":" + line:mconsole.StackItemHelper.toString(s)) + ":" + line;
			break;
		case 0:
			$r = "(anonymous function)";
			break;
		}
		return $r;
	}(this));
}
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; };
if(Array.prototype.indexOf) HxOverrides.remove = function(a,o) {
	var i = a.indexOf(o);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
Math.__name__ = ["Math"];
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
$hxClasses.Math = Math;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i) {
	return isNaN(i);
};
String.prototype.__class__ = $hxClasses.String = String;
String.__name__ = ["String"];
Array.prototype.__class__ = $hxClasses.Array = Array;
Array.__name__ = ["Array"];
Date.prototype.__class__ = $hxClasses.Date = Date;
Date.__name__ = ["Date"];
var Int = $hxClasses.Int = { __name__ : ["Int"]};
var Dynamic = $hxClasses.Dynamic = { __name__ : ["Dynamic"]};
var Float = $hxClasses.Float = Number;
Float.__name__ = ["Float"];
var Bool = $hxClasses.Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = $hxClasses.Class = { __name__ : ["Class"]};
var Enum = { };
Xml.Element = "element";
Xml.PCData = "pcdata";
Xml.CData = "cdata";
Xml.Comment = "comment";
Xml.DocType = "doctype";
Xml.ProcessingInstruction = "processingInstruction";
Xml.Document = "document";
as.platform.TypeUtils.IsLittleEndian = true;
var q = window.jQuery;
js.JQuery = q;
as.bank.components.GeneratorStateEnum.PreLoop = 0;
as.bank.components.GeneratorStateEnum.Loop = 1;
as.bank.components.GeneratorStateEnum.PostLoop = 2;
as.bank.components.GeneratorStateEnum.Finished = 3;
as.bank.components.EnvelopeStateEnum.Delay = 0;
as.bank.components.EnvelopeStateEnum.Attack = 1;
as.bank.components.EnvelopeStateEnum.Hold = 2;
as.bank.components.EnvelopeStateEnum.Decay = 3;
as.bank.components.EnvelopeStateEnum.Sustain = 4;
as.bank.components.EnvelopeStateEnum.Release = 5;
as.bank.components.EnvelopeStateEnum.None = 6;
as.bank.components.LfoStateEnum.Delay = 0;
as.bank.components.LfoStateEnum.Sustain = 1;
as.bank.components.WaveformEnum.Sine = 0;
as.bank.components.WaveformEnum.Square = 1;
as.bank.components.WaveformEnum.Saw = 2;
as.bank.components.WaveformEnum.Triangle = 3;
as.bank.components.WaveformEnum.SampleData = 4;
as.bank.components.WaveformEnum.WhiteNoise = 5;
as.bank.components.InterpolationEnum.None = 0;
as.bank.components.InterpolationEnum.Linear = 1;
as.bank.components.InterpolationEnum.Cosine = 2;
as.bank.components.InterpolationEnum.CubicSpline = 3;
as.bank.components.InterpolationEnum.Sinc = 4;
as.bank.components.LoopModeEnum.NoLoop = 0;
as.bank.components.LoopModeEnum.OneShot = 1;
as.bank.components.LoopModeEnum.Continuous = 2;
as.bank.components.LoopModeEnum.LoopUntilNoteOff = 3;
as.bank.components.FilterTypeEnum.None = 0;
as.bank.components.FilterTypeEnum.BiquadLowpass = 1;
as.bank.components.FilterTypeEnum.BiquadHighpass = 2;
as.bank.components.FilterTypeEnum.OnePoleLowpass = 3;
as.log.LevelPrinter.MinLogLevel = 0;
as.log.LevelPrinter.MaxLogLevel = 5;
as.main.webworker.flash.AlphaSynthFlashPlayerApi.AlphaSynthId = "AlphaSynth";
as.main.webworker.flash.AlphaSynthFlashPlayerApi.AlphaSynthWorkerId = "AlphaSynthWorker";
as.main.webworker.webaudio.AlphaSynthJsPlayer.BufferSize = 4096;
as.main.webworker.webaudio.AlphaSynthJsPlayer.Latency = 4096000 / 88200;
as.main.webworker.webaudio.AlphaSynthJsPlayer.BufferCount = 10;
as.main.webworker.webaudio.AlphaSynthJsPlayerApi.AlphaSynthWorkerId = "AlphaSynthWorker";
as.platform.TypeUtils.IntMax = 2147483647;
as.util.SynthConstants.InterpolationMode = 1;
as.util.SynthConstants.SampleRate = 44100;
as.util.SynthConstants.TwoPi = 2.0 * Math.PI;
as.util.SynthConstants.HalfPi = Math.PI / 2.0;
as.util.SynthConstants.InverseSqrtOfTwo = 0.707106781186;
as.util.SynthConstants.DefaultLfoFrequency = 8.0;
as.util.SynthConstants.DefaultModDepth = 100;
as.util.SynthConstants.DefaultPolyphony = 40;
as.util.SynthConstants.MinPolyphony = 5;
as.util.SynthConstants.MaxPolyphony = 250;
as.util.SynthConstants.DefaultBlockSize = 64;
as.util.SynthConstants.MaxBufferSize = 0.05;
as.util.SynthConstants.MinBufferSize = 0.001;
as.util.SynthConstants.DenormLimit = 1e-38;
as.util.SynthConstants.NonAudible = 1e-5;
as.util.SynthConstants.SincWidth = 16;
as.util.SynthConstants.SincResolution = 64;
as.util.SynthConstants.MaxVoiceComponents = 4;
as.util.SynthConstants.DefaultChannelCount = 16;
as.util.SynthConstants.DefaultKeyCount = 128;
haxe.Serializer.USE_CACHE = false;
haxe.Serializer.USE_ENUM_INDEX = false;
haxe.Serializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.Unserializer.DEFAULT_RESOLVER = Type;
haxe.Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.ds.ObjectMap.count = 0;
haxe.remoting.ExternalConnection.connections = new haxe.ds.StringMap();
js.Browser.window = typeof window != "undefined" ? window : null;
js.Browser.document = typeof window != "undefined" ? window.document : null;
mconsole.ConsoleView.CONSOLE_STYLES = "#console {\n\tfont-family:monospace;\n\tbackground-color:#002B36;\n\tbackground-color:rgba(0%,16.9%,21.2%,0.95);\n\tpadding:8px;\n\theight:600px;\n\tmax-height:600px;\n\toverflow-y:scroll;\n\tposition:absolute;\n\tleft:0px;\n\ttop:0px;\n\tright:0px;\n\tmargin:0px;\n\tz-index:10000;\n}\n#console a { text-decoration:none; }\n#console a:hover div { background-color:#063642 }\n#console a div span { display:none; float:right; color:white; }\n#console a:hover div span { display:block; }";
mconsole.Console.defaultPrinter = new mconsole.ConsoleView();
mconsole.Console.printers = [mconsole.Console.defaultPrinter];
mconsole.Console.groupDepth = 0;
mconsole.Console.times = new haxe.ds.StringMap();
mconsole.Console.counts = new haxe.ds.StringMap();
mconsole.Console.running = false;
mconsole.Console.dirxml = "dirxml";
mconsole.Console.hasConsole = mconsole.Console.detectConsole();
mconsole.ConsoleMacro.__meta__ = { obj : { IgnoreCover : null}};
mconsole.StackHelper.filters = mconsole.StackHelper.createFilters();
as.main.AlphaSynthJs.main();
function $hxExpose(src, path) {
	var o = typeof window != "undefined" ? window : exports;
	var parts = path.split(".");
	for(var ii = 0; ii < parts.length-1; ++ii) {
		var p = parts[ii];
		if(typeof o[p] == "undefined") o[p] = {};
		o = o[p];
	}
	o[parts[parts.length-1]] = src;
}
})();
