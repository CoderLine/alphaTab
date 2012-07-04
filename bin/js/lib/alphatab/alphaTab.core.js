var $hxClasses = $hxClasses || {},$estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function inherit() {}; inherit.prototype = from; var proto = new inherit();
	for (var name in fields) proto[name] = fields[name];
	return proto;
}
var EReg = $hxClasses["EReg"] = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = ["EReg"];
EReg.prototype = {
	r: null
	,match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		return this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
			var $r;
			throw "EReg::matched";
			return $r;
		}(this));
	}
	,matchedLeft: function() {
		if(this.r.m == null) throw "No string matched";
		return this.r.s.substr(0,this.r.m.index);
	}
	,matchedRight: function() {
		if(this.r.m == null) throw "No string matched";
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	,matchedPos: function() {
		if(this.r.m == null) throw "No string matched";
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,split: function(s) {
		var d = "#__delim__#";
		return s.replace(this.r,d).split(d);
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,customReplace: function(s,f) {
		var buf = new StringBuf();
		while(true) {
			if(!this.match(s)) break;
			buf.add(this.matchedLeft());
			buf.add(f(this));
			s = this.matchedRight();
		}
		buf.b[buf.b.length] = s == null?"null":s;
		return buf.b.join("");
	}
	,__class__: EReg
}
var Hash = $hxClasses["Hash"] = function() {
	this.h = { };
};
Hash.__name__ = ["Hash"];
Hash.prototype = {
	h: null
	,set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,toString: function() {
		var s = new StringBuf();
		s.b[s.b.length] = "{";
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b[s.b.length] = i == null?"null":i;
			s.b[s.b.length] = " => ";
			s.add(Std.string(this.get(i)));
			if(it.hasNext()) s.b[s.b.length] = ", ";
		}
		s.b[s.b.length] = "}";
		return s.b.join("");
	}
	,__class__: Hash
}
var HxOverrides = $hxClasses["HxOverrides"] = function() { }
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
var IntHash = $hxClasses["IntHash"] = function() {
	this.h = { };
};
IntHash.__name__ = ["IntHash"];
IntHash.prototype = {
	h: null
	,set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key);
	}
	,remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i];
		}};
	}
	,toString: function() {
		var s = new StringBuf();
		s.b[s.b.length] = "{";
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b[s.b.length] = i == null?"null":i;
			s.b[s.b.length] = " => ";
			s.add(Std.string(this.get(i)));
			if(it.hasNext()) s.b[s.b.length] = ", ";
		}
		s.b[s.b.length] = "}";
		return s.b.join("");
	}
	,__class__: IntHash
}
var IntIter = $hxClasses["IntIter"] = function(min,max) {
	this.min = min;
	this.max = max;
};
IntIter.__name__ = ["IntIter"];
IntIter.prototype = {
	min: null
	,max: null
	,hasNext: function() {
		return this.min < this.max;
	}
	,next: function() {
		return this.min++;
	}
	,__class__: IntIter
}
var List = $hxClasses["List"] = function() {
	this.length = 0;
};
List.__name__ = ["List"];
List.prototype = {
	h: null
	,q: null
	,length: null
	,add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,first: function() {
		return this.h == null?null:this.h[0];
	}
	,last: function() {
		return this.q == null?null:this.q[0];
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,isEmpty: function() {
		return this.h == null;
	}
	,clear: function() {
		this.h = null;
		this.q = null;
		this.length = 0;
	}
	,remove: function(v) {
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
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,toString: function() {
		var s = new StringBuf();
		var first = true;
		var l = this.h;
		s.b[s.b.length] = "{";
		while(l != null) {
			if(first) first = false; else s.b[s.b.length] = ", ";
			s.add(Std.string(l[0]));
			l = l[1];
		}
		s.b[s.b.length] = "}";
		return s.b.join("");
	}
	,join: function(sep) {
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
	,filter: function(f) {
		var l2 = new List();
		var l = this.h;
		while(l != null) {
			var v = l[0];
			l = l[1];
			if(f(v)) l2.add(v);
		}
		return l2;
	}
	,map: function(f) {
		var b = new List();
		var l = this.h;
		while(l != null) {
			var v = l[0];
			l = l[1];
			b.add(f(v));
		}
		return b;
	}
	,__class__: List
}
var Reflect = $hxClasses["Reflect"] = function() { }
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
Reflect.setField = function(o,field,value) {
	o[field] = value;
}
Reflect.getProperty = function(o,field) {
	var tmp;
	return o == null?null:o.__properties__ && (tmp = o.__properties__["get_" + field])?o[tmp]():o[field];
}
Reflect.setProperty = function(o,field,value) {
	var tmp;
	if(o.__properties__ && (tmp = o.__properties__["set_" + field])) o[tmp](value); else o[field] = value;
}
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
}
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
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
	return t == "string" || t == "object" && !v.__enum__ || t == "function" && (v.__name__ || v.__ename__);
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
		var a = Array.prototype.slice.call(arguments);
		return f(a);
	};
}
var Std = $hxClasses["Std"] = function() { }
Std.__name__ = ["Std"];
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	return x | 0;
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && HxOverrides.cca(x,1) == 120) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
var StringBuf = $hxClasses["StringBuf"] = function() {
	this.b = new Array();
};
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	add: function(x) {
		this.b[this.b.length] = x == null?"null":x;
	}
	,addSub: function(s,pos,len) {
		this.b[this.b.length] = HxOverrides.substr(s,pos,len);
	}
	,addChar: function(c) {
		this.b[this.b.length] = String.fromCharCode(c);
	}
	,toString: function() {
		return this.b.join("");
	}
	,b: null
	,__class__: StringBuf
}
var StringTools = $hxClasses["StringTools"] = function() { }
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
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
}
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c >= 9 && c <= 13 || c == 32;
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
StringTools.rpad = function(s,c,l) {
	var sl = s.length;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		s += HxOverrides.substr(c,0,l - sl);
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
		ns += HxOverrides.substr(c,0,l - sl);
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
	return s.charCodeAt(index);
}
StringTools.isEOF = function(c) {
	return c != c;
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
var Type = $hxClasses["Type"] = function() { }
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
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
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
}
Type.resolveEnum = function(name) {
	var e = $hxClasses[name];
	if(e == null || !e.__ename__) return null;
	return e;
}
Type.createInstance = function(cl,args) {
	switch(args.length) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw "Too many arguments";
	}
	return null;
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
Type.createEnumIndex = function(e,index,params) {
	var c = e.__constructs__[index];
	if(c == null) throw index + " is not a valid enum constructor index";
	return Type.createEnum(e,c,params);
}
Type.getInstanceFields = function(c) {
	var a = [];
	for(var i in c.prototype) a.push(i);
	HxOverrides.remove(a,"__class__");
	HxOverrides.remove(a,"__properties__");
	return a;
}
Type.getClassFields = function(c) {
	var a = Reflect.fields(c);
	HxOverrides.remove(a,"__name__");
	HxOverrides.remove(a,"__interfaces__");
	HxOverrides.remove(a,"__properties__");
	HxOverrides.remove(a,"__super__");
	HxOverrides.remove(a,"prototype");
	return a;
}
Type.getEnumConstructs = function(e) {
	var a = e.__constructs__;
	return a.slice();
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
		if(v.__name__ || v.__ename__) return ValueType.TObject;
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
Type.allEnums = function(e) {
	var all = [];
	var cst = e.__constructs__;
	var _g = 0;
	while(_g < cst.length) {
		var c = cst[_g];
		++_g;
		var v = Reflect.field(e,c);
		if(!Reflect.isFunction(v)) all.push(v);
	}
	return all;
}
var alphatab = alphatab || {}
alphatab.AlphaTestRunner = $hxClasses["alphatab.AlphaTestRunner"] = function() { }
alphatab.AlphaTestRunner.__name__ = ["alphatab","AlphaTestRunner"];
alphatab.AlphaTestRunner.main = function() {
	var r = new haxe.unit.TestRunner();
	r.add(new alphatab.importer.GpImporterTest());
	r.add(new alphatab.importer.Gp3ImporterTest());
	r.add(new alphatab.importer.Gp4ImporterTest());
	r.add(new alphatab.importer.Gp5ImporterTest());
	r.run();
}
alphatab.Main = $hxClasses["alphatab.Main"] = function() { }
alphatab.Main.__name__ = ["alphatab","Main"];
alphatab.Main.main = function() {
}
if(!alphatab.audio) alphatab.audio = {}
alphatab.audio.GeneralMidi = $hxClasses["alphatab.audio.GeneralMidi"] = function() { }
alphatab.audio.GeneralMidi.__name__ = ["alphatab","audio","GeneralMidi"];
alphatab.audio.GeneralMidi._values = null;
alphatab.audio.GeneralMidi.getValue = function(name) {
	if(alphatab.audio.GeneralMidi._values == null) {
		alphatab.audio.GeneralMidi._values = new Hash();
		alphatab.audio.GeneralMidi._values.set("acousticgrandpiano",0);
		alphatab.audio.GeneralMidi._values.set("brightacousticpiano",1);
		alphatab.audio.GeneralMidi._values.set("electricgrandpiano",2);
		alphatab.audio.GeneralMidi._values.set("honkytonkpiano",3);
		alphatab.audio.GeneralMidi._values.set("electricpiano1",4);
		alphatab.audio.GeneralMidi._values.set("electricpiano2",5);
		alphatab.audio.GeneralMidi._values.set("harpsichord",6);
		alphatab.audio.GeneralMidi._values.set("clavinet",7);
		alphatab.audio.GeneralMidi._values.set("celesta",8);
		alphatab.audio.GeneralMidi._values.set("glockenspiel",9);
		alphatab.audio.GeneralMidi._values.set("musicbox",10);
		alphatab.audio.GeneralMidi._values.set("vibraphone",11);
		alphatab.audio.GeneralMidi._values.set("marimba",12);
		alphatab.audio.GeneralMidi._values.set("xylophone",13);
		alphatab.audio.GeneralMidi._values.set("tubularbells",14);
		alphatab.audio.GeneralMidi._values.set("dulcimer",15);
		alphatab.audio.GeneralMidi._values.set("drawbarorgan",16);
		alphatab.audio.GeneralMidi._values.set("percussiveorgan",17);
		alphatab.audio.GeneralMidi._values.set("rockorgan",18);
		alphatab.audio.GeneralMidi._values.set("churchorgan",19);
		alphatab.audio.GeneralMidi._values.set("reedorgan",20);
		alphatab.audio.GeneralMidi._values.set("accordion",21);
		alphatab.audio.GeneralMidi._values.set("harmonica",22);
		alphatab.audio.GeneralMidi._values.set("tangoaccordion",23);
		alphatab.audio.GeneralMidi._values.set("acousticguitarnylon",24);
		alphatab.audio.GeneralMidi._values.set("acousticguitarsteel",25);
		alphatab.audio.GeneralMidi._values.set("electricguitarjazz",26);
		alphatab.audio.GeneralMidi._values.set("electricguitarclean",27);
		alphatab.audio.GeneralMidi._values.set("electricguitarmuted",28);
		alphatab.audio.GeneralMidi._values.set("overdrivenguitar",29);
		alphatab.audio.GeneralMidi._values.set("distortionguitar",30);
		alphatab.audio.GeneralMidi._values.set("guitarharmonics",31);
		alphatab.audio.GeneralMidi._values.set("acousticbass",32);
		alphatab.audio.GeneralMidi._values.set("electricbassfinger",33);
		alphatab.audio.GeneralMidi._values.set("electricbasspick",34);
		alphatab.audio.GeneralMidi._values.set("fretlessbass",35);
		alphatab.audio.GeneralMidi._values.set("slapbass1",36);
		alphatab.audio.GeneralMidi._values.set("slapbass2",37);
		alphatab.audio.GeneralMidi._values.set("synthbass1",38);
		alphatab.audio.GeneralMidi._values.set("synthbass2",39);
		alphatab.audio.GeneralMidi._values.set("violin",40);
		alphatab.audio.GeneralMidi._values.set("viola",41);
		alphatab.audio.GeneralMidi._values.set("cello",42);
		alphatab.audio.GeneralMidi._values.set("contrabass",43);
		alphatab.audio.GeneralMidi._values.set("tremolostrings",44);
		alphatab.audio.GeneralMidi._values.set("pizzicatostrings",45);
		alphatab.audio.GeneralMidi._values.set("orchestralharp",46);
		alphatab.audio.GeneralMidi._values.set("timpani",47);
		alphatab.audio.GeneralMidi._values.set("stringensemble1",48);
		alphatab.audio.GeneralMidi._values.set("stringensemble2",49);
		alphatab.audio.GeneralMidi._values.set("synthstrings1",50);
		alphatab.audio.GeneralMidi._values.set("synthstrings2",51);
		alphatab.audio.GeneralMidi._values.set("choiraahs",52);
		alphatab.audio.GeneralMidi._values.set("voiceoohs",53);
		alphatab.audio.GeneralMidi._values.set("synthvoice",54);
		alphatab.audio.GeneralMidi._values.set("orchestrahit",55);
		alphatab.audio.GeneralMidi._values.set("trumpet",56);
		alphatab.audio.GeneralMidi._values.set("trombone",57);
		alphatab.audio.GeneralMidi._values.set("tuba",58);
		alphatab.audio.GeneralMidi._values.set("mutedtrumpet",59);
		alphatab.audio.GeneralMidi._values.set("frenchhorn",60);
		alphatab.audio.GeneralMidi._values.set("brasssection",61);
		alphatab.audio.GeneralMidi._values.set("synthbrass1",62);
		alphatab.audio.GeneralMidi._values.set("synthbrass2",63);
		alphatab.audio.GeneralMidi._values.set("sopranosax",64);
		alphatab.audio.GeneralMidi._values.set("altosax",65);
		alphatab.audio.GeneralMidi._values.set("tenorsax",66);
		alphatab.audio.GeneralMidi._values.set("baritonesax",67);
		alphatab.audio.GeneralMidi._values.set("oboe",68);
		alphatab.audio.GeneralMidi._values.set("englishhorn",69);
		alphatab.audio.GeneralMidi._values.set("bassoon",70);
		alphatab.audio.GeneralMidi._values.set("clarinet",71);
		alphatab.audio.GeneralMidi._values.set("piccolo",72);
		alphatab.audio.GeneralMidi._values.set("flute",73);
		alphatab.audio.GeneralMidi._values.set("recorder",74);
		alphatab.audio.GeneralMidi._values.set("panflute",75);
		alphatab.audio.GeneralMidi._values.set("blownbottle",76);
		alphatab.audio.GeneralMidi._values.set("shakuhachi",77);
		alphatab.audio.GeneralMidi._values.set("whistle",78);
		alphatab.audio.GeneralMidi._values.set("ocarina",79);
		alphatab.audio.GeneralMidi._values.set("lead1square",80);
		alphatab.audio.GeneralMidi._values.set("lead2sawtooth",81);
		alphatab.audio.GeneralMidi._values.set("lead3calliope",82);
		alphatab.audio.GeneralMidi._values.set("lead4chiff",83);
		alphatab.audio.GeneralMidi._values.set("lead5charang",84);
		alphatab.audio.GeneralMidi._values.set("lead6voice",85);
		alphatab.audio.GeneralMidi._values.set("lead7fifths",86);
		alphatab.audio.GeneralMidi._values.set("lead8bassandlead",87);
		alphatab.audio.GeneralMidi._values.set("pad1newage",88);
		alphatab.audio.GeneralMidi._values.set("pad2warm",89);
		alphatab.audio.GeneralMidi._values.set("pad3polysynth",90);
		alphatab.audio.GeneralMidi._values.set("pad4choir",91);
		alphatab.audio.GeneralMidi._values.set("pad5bowed",92);
		alphatab.audio.GeneralMidi._values.set("pad6metallic",93);
		alphatab.audio.GeneralMidi._values.set("pad7halo",94);
		alphatab.audio.GeneralMidi._values.set("pad8sweep",95);
		alphatab.audio.GeneralMidi._values.set("fx1rain",96);
		alphatab.audio.GeneralMidi._values.set("fx2soundtrack",97);
		alphatab.audio.GeneralMidi._values.set("fx3crystal",98);
		alphatab.audio.GeneralMidi._values.set("fx4atmosphere",99);
		alphatab.audio.GeneralMidi._values.set("fx5brightness",100);
		alphatab.audio.GeneralMidi._values.set("fx6goblins",101);
		alphatab.audio.GeneralMidi._values.set("fx7echoes",102);
		alphatab.audio.GeneralMidi._values.set("fx8scifi",103);
		alphatab.audio.GeneralMidi._values.set("sitar",104);
		alphatab.audio.GeneralMidi._values.set("banjo",105);
		alphatab.audio.GeneralMidi._values.set("shamisen",106);
		alphatab.audio.GeneralMidi._values.set("koto",107);
		alphatab.audio.GeneralMidi._values.set("kalimba",108);
		alphatab.audio.GeneralMidi._values.set("bagpipe",109);
		alphatab.audio.GeneralMidi._values.set("fiddle",110);
		alphatab.audio.GeneralMidi._values.set("shanai",111);
		alphatab.audio.GeneralMidi._values.set("tinklebell",112);
		alphatab.audio.GeneralMidi._values.set("agogo",113);
		alphatab.audio.GeneralMidi._values.set("steeldrums",114);
		alphatab.audio.GeneralMidi._values.set("woodblock",115);
		alphatab.audio.GeneralMidi._values.set("taikodrum",116);
		alphatab.audio.GeneralMidi._values.set("melodictom",117);
		alphatab.audio.GeneralMidi._values.set("synthdrum",118);
		alphatab.audio.GeneralMidi._values.set("reversecymbal",119);
		alphatab.audio.GeneralMidi._values.set("guitarfretnoise",120);
		alphatab.audio.GeneralMidi._values.set("breathnoise",121);
		alphatab.audio.GeneralMidi._values.set("seashore",122);
		alphatab.audio.GeneralMidi._values.set("birdtweet",123);
		alphatab.audio.GeneralMidi._values.set("telephonering",124);
		alphatab.audio.GeneralMidi._values.set("helicopter",125);
		alphatab.audio.GeneralMidi._values.set("applause",126);
		alphatab.audio.GeneralMidi._values.set("gunshot",127);
	}
	name = StringTools.replace(name.toLowerCase()," ","");
	return alphatab.audio.GeneralMidi._values.exists(name)?alphatab.audio.GeneralMidi._values.get(name):0;
}
alphatab.audio.MidiUtils = $hxClasses["alphatab.audio.MidiUtils"] = function() { }
alphatab.audio.MidiUtils.__name__ = ["alphatab","audio","MidiUtils"];
alphatab.audio.MidiUtils.durationToTicks = function(value) {
	return alphatab.audio.MidiUtils.valueToTicks(alphatab.model.ModelUtils.getDurationValue(value));
}
alphatab.audio.MidiUtils.valueToTicks = function(value) {
	return 960 * (4.0 / value) | 0;
}
alphatab.audio.MidiUtils.applyDot = function(ticks,doubleDotted) {
	if(doubleDotted) return ticks + (ticks / 4 * 3 | 0); else return ticks + (ticks / 2 | 0);
}
alphatab.audio.MidiUtils.applyTuplet = function(ticks,numerator,denominator) {
	return ticks * numerator / denominator | 0;
}
if(!alphatab.importer) alphatab.importer = {}
alphatab.importer.ScoreImporter = $hxClasses["alphatab.importer.ScoreImporter"] = function() {
};
alphatab.importer.ScoreImporter.__name__ = ["alphatab","importer","ScoreImporter"];
alphatab.importer.ScoreImporter.availableImporters = function() {
	var scoreImporter = new Array();
	scoreImporter.push(new alphatab.importer.Gp3To5Importer());
	scoreImporter.push(new alphatab.importer.AlphaTexImporter());
	return scoreImporter;
}
alphatab.importer.ScoreImporter.prototype = {
	_data: null
	,init: function(data) {
		this._data = data;
	}
	,readScore: function() {
		return null;
	}
	,finish: function(score) {
		var _g = 0, _g1 = score.tracks;
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
	,determineHammerPullDestination: function(note) {
		var nextBeat = note.beat.nextBeat;
		while(nextBeat != null) {
			var noteOnString = nextBeat.getNoteOnString(note.string);
			if(noteOnString != null) return noteOnString; else nextBeat = nextBeat.nextBeat;
		}
		return null;
	}
	,determineTieOrigin: function(note) {
		var previousBeat = note.beat.previousBeat;
		while(previousBeat != null) {
			var noteOnString = previousBeat.getNoteOnString(note.string);
			if(noteOnString != null) return noteOnString; else previousBeat = previousBeat.previousBeat;
		}
		return null;
	}
	,__class__: alphatab.importer.ScoreImporter
}
alphatab.importer.AlphaTexImporter = $hxClasses["alphatab.importer.AlphaTexImporter"] = function() {
	alphatab.importer.ScoreImporter.call(this);
};
alphatab.importer.AlphaTexImporter.__name__ = ["alphatab","importer","AlphaTexImporter"];
alphatab.importer.AlphaTexImporter.isLetter = function(ch) {
	var code = HxOverrides.cca(ch,0);
	return !alphatab.importer.AlphaTexImporter.isTerminal(ch) && (code >= 33 && code <= 47 || code >= 58 && code <= 126 || code > 128);
}
alphatab.importer.AlphaTexImporter.isTerminal = function(ch) {
	return ch == "." || ch == "{" || ch == "}" || ch == "[" || ch == "]" || ch == "(" || ch == ")" || ch == "|" || ch == "'" || ch == "\"" || ch == "\\";
}
alphatab.importer.AlphaTexImporter.__super__ = alphatab.importer.ScoreImporter;
alphatab.importer.AlphaTexImporter.prototype = $extend(alphatab.importer.ScoreImporter.prototype,{
	_score: null
	,_track: null
	,_ch: null
	,_curChPos: null
	,_sy: null
	,_syData: null
	,_allowNegatives: null
	,_currentDuration: null
	,readScore: function() {
		try {
			this.createDefaultScore();
			this._curChPos = 0;
			this._currentDuration = alphatab.model.Duration.Quarter;
			this.nextChar();
			this.newSy();
			this.score();
			this.finish(this._score);
			return this._score;
		} catch( e ) {
			throw alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT;
		}
	}
	,error: function(nonterm,expected,symbolError) {
		if(symbolError == null) symbolError = true;
		if(symbolError) throw haxe.io.Error.Custom(Std.string(this._curChPos) + ": Error on block " + nonterm + ", expected a " + Std.string(expected) + " found a " + Std.string(this._sy)); else throw haxe.io.Error.Custom(Std.string(this._curChPos) + ": Error on block " + nonterm + ", invalid value:" + Std.string(this._syData));
	}
	,score: function() {
		this.metaData();
		this.bars();
	}
	,metaData: function() {
		var anyMeta = false;
		while(this._sy == alphatab.importer.AlphaTexSymbols.MetaCommand) if(this._syData == "title") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.String) this._score.title = this._syData; else this.error("title",alphatab.importer.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "subtitle") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.String) this._score.subTitle = this._syData; else this.error("subtitle",alphatab.importer.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "artist") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.String) this._score.artist = this._syData; else this.error("artist",alphatab.importer.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "album") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.String) this._score.album = this._syData; else this.error("album",alphatab.importer.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "words") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.String) this._score.words = this._syData; else this.error("words",alphatab.importer.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "music") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.String) this._score.music = this._syData; else this.error("music",alphatab.importer.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "copyright") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.String) this._score.copyright = this._syData; else this.error("copyright",alphatab.importer.AlphaTexSymbols.String);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "tempo") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.Number) this._score.tempo = this._syData; else this.error("tempo",alphatab.importer.AlphaTexSymbols.Number);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "capo") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.Number) this._track.capo = this._syData; else this.error("capo",alphatab.importer.AlphaTexSymbols.Number);
			this.newSy();
			anyMeta = true;
		} else if(this._syData == "tuning") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.Tuning) {
				this._track.tuning = new Array();
				do {
					this._track.tuning.push(this.parseTuning(this._syData));
					this.newSy();
				} while(this._sy == alphatab.importer.AlphaTexSymbols.Tuning);
			} else this.error("tuning",alphatab.importer.AlphaTexSymbols.Tuning);
			anyMeta = true;
		} else if(this._syData == "instrument") {
			this.newSy();
			if(this._sy == alphatab.importer.AlphaTexSymbols.Number) {
				var instrument = js.Boot.__cast(this._syData , Int);
				if(instrument >= 0 && instrument <= 128) this._track.playbackInfo.program = this._syData; else this.error("instrument",alphatab.importer.AlphaTexSymbols.Number,false);
			} else if(this._sy == alphatab.importer.AlphaTexSymbols.String) {
				var instrumentName = js.Boot.__cast(this._syData , String);
				this._track.playbackInfo.program = alphatab.audio.GeneralMidi.getValue(instrumentName);
			} else this.error("instrument",alphatab.importer.AlphaTexSymbols.Number);
			this.newSy();
			anyMeta = true;
		} else this.error("metaDataTags",alphatab.importer.AlphaTexSymbols.String,false);
		if(anyMeta) {
			if(this._sy != alphatab.importer.AlphaTexSymbols.Dot) this.error("song",alphatab.importer.AlphaTexSymbols.Dot);
			this.newSy();
		}
	}
	,bars: function() {
		this.bar();
		while(this._sy != alphatab.importer.AlphaTexSymbols.Eof) {
			if(this._sy != alphatab.importer.AlphaTexSymbols.Pipe) this.error("bar",alphatab.importer.AlphaTexSymbols.Pipe);
			this.newSy();
			this.bar();
		}
	}
	,bar: function() {
		var master = new alphatab.model.MasterBar();
		this._score.addMasterBar(master);
		var bar = new alphatab.model.Bar();
		this._track.addBar(bar);
		if(master.index > 0) {
			master.keySignature = master.previousMasterBar.keySignature;
			master.timeSignatureDenominator = master.previousMasterBar.timeSignatureDenominator;
			master.timeSignatureNumerator = master.previousMasterBar.timeSignatureNumerator;
			bar.clef = bar.previousBar.clef;
		}
		this.barMeta(bar);
		var voice = new alphatab.model.Voice();
		bar.addVoice(voice);
		while(this._sy != alphatab.importer.AlphaTexSymbols.Pipe && this._sy != alphatab.importer.AlphaTexSymbols.Eof) this.beat(voice);
	}
	,beat: function(voice) {
		if(this._sy == alphatab.importer.AlphaTexSymbols.DoubleDot) {
			this.newSy();
			if(this._sy != alphatab.importer.AlphaTexSymbols.Number) this.error("duration",alphatab.importer.AlphaTexSymbols.Number);
			if(this._syData == 1 || this._syData == 2 || this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) this._currentDuration = this.parseDuration(this._syData); else this.error("duration",alphatab.importer.AlphaTexSymbols.Number,false);
			this.newSy();
			return;
		}
		var beat = new alphatab.model.Beat();
		voice.addBeat(beat);
		if(this._sy == alphatab.importer.AlphaTexSymbols.LParensis) {
			this.newSy();
			this.note(beat);
			while(this._sy != alphatab.importer.AlphaTexSymbols.RParensis && this._sy != alphatab.importer.AlphaTexSymbols.Eof) this.note(beat);
			if(this._sy != alphatab.importer.AlphaTexSymbols.RParensis) this.error("note-list",alphatab.importer.AlphaTexSymbols.RParensis);
			this.newSy();
		} else if(this._sy == alphatab.importer.AlphaTexSymbols.String && Std.string(this._syData).toLowerCase() == "r") this.newSy(); else this.note(beat);
		if(this._sy == alphatab.importer.AlphaTexSymbols.Dot) {
			this.newSy();
			if(this._sy != alphatab.importer.AlphaTexSymbols.Number) this.error("duration",alphatab.importer.AlphaTexSymbols.Number);
			if(this._syData == 1 || this._syData == 2 || this._syData == 4 || this._syData == 8 || this._syData == 16 || this._syData == 32 || this._syData == 64) beat.duration = this.parseDuration(this._syData); else this.error("duration",alphatab.importer.AlphaTexSymbols.Number,false);
			this.newSy();
		} else beat.duration = this._currentDuration;
		this.beatEffects(beat);
	}
	,beatEffects: function(beat) {
		if(this._sy != alphatab.importer.AlphaTexSymbols.LBrace) return;
		this.newSy();
		while(this._sy == alphatab.importer.AlphaTexSymbols.String) {
			this._syData = Std.string(this._syData).toLowerCase();
			if(!this.applyBeatEffect(beat)) this.error("beat-effects",alphatab.importer.AlphaTexSymbols.String,false);
		}
		if(this._sy != alphatab.importer.AlphaTexSymbols.RBrace) this.error("beat-effects",alphatab.importer.AlphaTexSymbols.RBrace);
		this.newSy();
	}
	,applyBeatEffect: function(beat) {
		if(this._syData == "f") {
			beat.fadeIn = true;
			this.newSy();
			return true;
		} else if(this._syData == "v") {
			beat.vibrato = alphatab.model.VibratoType.Slight;
			this.newSy();
			return true;
		} else if(this._syData == "s") {
			beat.slap = true;
			this.newSy();
			return true;
		} else if(this._syData == "p") {
			beat.pop = true;
			this.newSy();
			return true;
		} else if(this._syData == "dd") {
			beat.dots = 2;
			this.newSy();
			return true;
		} else if(this._syData == "d") {
			beat.dots = 1;
			this.newSy();
			return true;
		} else if(this._syData == "su") {
			beat.pickStroke = alphatab.model.PickStrokeType.Up;
			this.newSy();
			return true;
		} else if(this._syData == "sd") {
			beat.pickStroke = alphatab.model.PickStrokeType.Down;
			this.newSy();
			return true;
		} else if(this._syData == "tu") {
			this.newSy();
			if(this._sy != alphatab.importer.AlphaTexSymbols.Number) {
				this.error("tuplet",alphatab.importer.AlphaTexSymbols.Number);
				return false;
			}
			var tuplet = this._syData;
			switch(tuplet) {
			case 3:
				beat.tupletDenominator = 3;
				beat.tupletNumerator = 2;
				break;
			case 5:
				beat.tupletDenominator = 5;
				beat.tupletNumerator = 4;
				break;
			case 6:
				beat.tupletDenominator = 6;
				beat.tupletNumerator = 4;
				break;
			case 7:
				beat.tupletDenominator = 7;
				beat.tupletNumerator = 4;
				break;
			case 9:
				beat.tupletDenominator = 9;
				beat.tupletNumerator = 8;
				break;
			case 10:
				beat.tupletDenominator = 10;
				beat.tupletNumerator = 8;
				break;
			case 11:
				beat.tupletDenominator = 11;
				beat.tupletNumerator = 8;
				break;
			case 12:
				beat.tupletDenominator = 12;
				beat.tupletNumerator = 8;
				break;
			}
			this.newSy();
			return true;
		} else if(this._syData == "tb") {
			this.newSy();
			if(this._sy != alphatab.importer.AlphaTexSymbols.LParensis) {
				this.error("tremolobar-effect",alphatab.importer.AlphaTexSymbols.LParensis);
				return false;
			}
			this._allowNegatives = true;
			this.newSy();
			while(this._sy != alphatab.importer.AlphaTexSymbols.RParensis && this._sy != alphatab.importer.AlphaTexSymbols.Eof) {
				if(this._sy != alphatab.importer.AlphaTexSymbols.Number) {
					this.error("tremolobar-effect",alphatab.importer.AlphaTexSymbols.Number);
					return false;
				}
				beat.whammyBarPoints.push(new alphatab.model.BendPoint(0,this._syData));
				this.newSy();
			}
			if(beat.whammyBarPoints.length > 60) beat.whammyBarPoints = beat.whammyBarPoints.slice(0,60);
			var count = beat.whammyBarPoints.length;
			var step = Math.floor(60 / count);
			var i = 0;
			while(i < count) {
				beat.whammyBarPoints[i].offset = Math.floor(Math.min(60,i * step));
				i++;
			}
			this._allowNegatives = false;
			if(this._sy != alphatab.importer.AlphaTexSymbols.RParensis) {
				this.error("tremolobar-effect",alphatab.importer.AlphaTexSymbols.RParensis);
				return false;
			}
			this.newSy();
			return true;
		}
		return false;
	}
	,note: function(beat) {
		if(this._sy != alphatab.importer.AlphaTexSymbols.Number && !(this._sy == alphatab.importer.AlphaTexSymbols.String && (Std.string(this._syData).toLowerCase() == "x" || Std.string(this._syData).toLowerCase() == "-"))) this.error("note-fret",alphatab.importer.AlphaTexSymbols.Number);
		var isDead = Std.string(this._syData).toLowerCase() == "x";
		var isTie = Std.string(this._syData).toLowerCase() == "-";
		var fret = isDead || isTie?0:this._syData;
		this.newSy();
		if(this._sy != alphatab.importer.AlphaTexSymbols.Dot) this.error("note",alphatab.importer.AlphaTexSymbols.Dot);
		this.newSy();
		if(this._sy != alphatab.importer.AlphaTexSymbols.Number) this.error("note-string",alphatab.importer.AlphaTexSymbols.Number);
		var string = this._syData;
		if(string < 1 || string > this._track.tuning.length) this.error("note-string",alphatab.importer.AlphaTexSymbols.Number,false);
		this.newSy();
		var note = new alphatab.model.Note();
		beat.addNote(note);
		this.noteEffects(note);
		note.string = this._track.tuning.length - string;
		note.isDead = isDead;
		note.isTieDestination = isTie;
		if(!isTie) note.fret = fret;
		return note;
	}
	,noteEffects: function(note) {
		if(this._sy != alphatab.importer.AlphaTexSymbols.LBrace) return;
		this.newSy();
		while(this._sy == alphatab.importer.AlphaTexSymbols.String) {
			this._syData = Std.string(this._syData).toLowerCase();
			if(this._syData == "b") {
				this.newSy();
				if(this._sy != alphatab.importer.AlphaTexSymbols.LParensis) this.error("bend-effect",alphatab.importer.AlphaTexSymbols.LParensis);
				this.newSy();
				while(this._sy != alphatab.importer.AlphaTexSymbols.RParensis && this._sy != alphatab.importer.AlphaTexSymbols.Eof) {
					if(this._sy != alphatab.importer.AlphaTexSymbols.Number) this.error("bend-effect-value",alphatab.importer.AlphaTexSymbols.Number);
					var bendValue = this._syData;
					note.bendPoints.push(new alphatab.model.BendPoint(0,Math.abs(bendValue) | 0));
					this.newSy();
				}
				if(note.bendPoints.length > 60) note.bendPoints = note.bendPoints.slice(0,60);
				var count = note.bendPoints.length;
				var step = Math.floor(60 / count);
				var i = 0;
				while(i < count) {
					note.bendPoints[i].offset = Math.floor(Math.min(60,i * step));
					i++;
				}
				if(this._sy != alphatab.importer.AlphaTexSymbols.RParensis) this.error("bend-effect",alphatab.importer.AlphaTexSymbols.RParensis);
				this.newSy();
			} else if(this._syData == "nh") {
				note.harmonicType = alphatab.model.HarmonicType.Natural;
				this.newSy();
			} else if(this._syData == "ah") {
				note.harmonicType = alphatab.model.HarmonicType.Artificial;
				this.newSy();
			} else if(this._syData == "th") {
				note.harmonicType = alphatab.model.HarmonicType.Tap;
				this.newSy();
			} else if(this._syData == "ph") {
				note.harmonicType = alphatab.model.HarmonicType.Pinch;
				this.newSy();
			} else if(this._syData == "sh") {
				note.harmonicType = alphatab.model.HarmonicType.Semi;
				this.newSy();
			} else if(this._syData == "gr") {
				this.newSy();
				if(this._syData == "ob") note.beat.graceType = alphatab.model.GraceType.OnBeat; else note.beat.graceType = alphatab.model.GraceType.BeforeBeat;
				this.newSy();
			} else if(this._syData == "tr") {
				this.newSy();
				if(this._sy != alphatab.importer.AlphaTexSymbols.Number) this.error("trill-effect",alphatab.importer.AlphaTexSymbols.Number);
				var fret = this._syData;
				this.newSy();
				var duration = 16;
				if(this._sy == alphatab.importer.AlphaTexSymbols.Number) {
					switch(this._syData) {
					case 16:case 32:case 64:
						duration = this._syData;
						break;
					default:
						duration = 16;
					}
					this.newSy();
				}
				note.trillFret = fret;
				note.trillSpeed = duration;
			} else if(this._syData == "tp") {
				this.newSy();
				var duration = 8;
				if(this._sy == alphatab.importer.AlphaTexSymbols.Number) {
					switch(this._syData) {
					case 8:case 16:case 32:
						duration = this._syData;
						break;
					default:
						duration = 8;
					}
					this.newSy();
				}
				note.beat.tremoloSpeed = duration;
			} else if(this._syData == "v") {
				this.newSy();
				note.vibrato = alphatab.model.VibratoType.Slight;
			} else if(this._syData == "sl") {
				this.newSy();
				note.slideType = alphatab.model.SlideType.Legato;
			} else if(this._syData == "ss") {
				this.newSy();
				note.slideType = alphatab.model.SlideType.Shift;
			} else if(this._syData == "h") {
				this.newSy();
				note.isHammerPullOrigin = true;
			} else if(this._syData == "g") {
				this.newSy();
				note.isGhost = true;
			} else if(this._syData == "ac") {
				this.newSy();
				note.accentuated = alphatab.model.AccentuationType.Normal;
			} else if(this._syData == "hac") {
				this.newSy();
				note.accentuated = alphatab.model.AccentuationType.Heavy;
			} else if(this._syData == "pm") {
				this.newSy();
				note.isPalmMute = true;
			} else if(this._syData == "st") {
				this.newSy();
				note.isStaccato = true;
			} else if(this._syData == "lr") {
				this.newSy();
				note.isLetRing = true;
			} else if(this.applyBeatEffect(note.beat)) {
			} else this.error(this._syData,alphatab.importer.AlphaTexSymbols.String,false);
		}
		if(this._sy != alphatab.importer.AlphaTexSymbols.RBrace) this.error("note-effect",alphatab.importer.AlphaTexSymbols.RBrace,false);
		this.newSy();
	}
	,parseDuration: function(duration) {
		switch(duration) {
		case 1:
			return alphatab.model.Duration.Whole;
		case 2:
			return alphatab.model.Duration.Half;
		case 4:
			return alphatab.model.Duration.Quarter;
		case 8:
			return alphatab.model.Duration.Eighth;
		case 16:
			return alphatab.model.Duration.Sixteenth;
		case 32:
			return alphatab.model.Duration.ThirtySecond;
		case 64:
			return alphatab.model.Duration.SixtyFourth;
		default:
			return alphatab.model.Duration.Quarter;
		}
	}
	,barMeta: function(bar) {
		var master = bar.track.score.masterBars[bar.index];
		while(this._sy == alphatab.importer.AlphaTexSymbols.MetaCommand) {
			if(this._syData == "ts") {
				this.newSy();
				if(this._sy != alphatab.importer.AlphaTexSymbols.Number) this.error("timesignature-numerator",alphatab.importer.AlphaTexSymbols.Number);
				master.timeSignatureNumerator = this._syData;
				this.newSy();
				if(this._sy != alphatab.importer.AlphaTexSymbols.Number) this.error("timesignature-denominator",alphatab.importer.AlphaTexSymbols.Number);
				master.timeSignatureDenominator = this._syData;
			} else if(this._syData == "ro") master.isRepeatStart = true; else if(this._syData == "rc") {
				this.newSy();
				if(this._sy != alphatab.importer.AlphaTexSymbols.Number) this.error("repeatclose",alphatab.importer.AlphaTexSymbols.Number);
				master.repeatCount = Std.parseInt(this._syData) - 1;
			} else if(this._syData == "ks") {
				this.newSy();
				if(this._sy != alphatab.importer.AlphaTexSymbols.String) this.error("keysignature",alphatab.importer.AlphaTexSymbols.String);
				master.keySignature = this.parseKeySignature(this._syData);
			} else if(this._syData == "clef") {
				this.newSy();
				if(this._sy != alphatab.importer.AlphaTexSymbols.String && this._sy != alphatab.importer.AlphaTexSymbols.Tuning) this.error("clef",alphatab.importer.AlphaTexSymbols.String);
				bar.clef = this.parseClef(this._syData);
			} else this.error("measure-effects",alphatab.importer.AlphaTexSymbols.String,false);
			this.newSy();
		}
	}
	,createDefaultScore: function() {
		this._score = new alphatab.model.Score();
		this._score.tempo = 120;
		this._score.tempoLabel = "";
		this._track = new alphatab.model.Track();
		this._track.playbackInfo.program = 25;
		this._track.playbackInfo.primaryChannel = alphatab.importer.AlphaTexImporter.TRACK_CHANNELS[0];
		this._track.playbackInfo.secondaryChannel = alphatab.importer.AlphaTexImporter.TRACK_CHANNELS[1];
		this._track.tuning = alphatab.model.Tuning.getPresetsFor(6)[0].tuning;
		this._score.addTrack(this._track);
	}
	,parseClef: function(str) {
		switch(str.toLowerCase()) {
		case "g2":case "treble":
			return alphatab.model.Clef.G2;
		case "f4":case "bass":
			return alphatab.model.Clef.F4;
		case "c3":case "tenor":
			return alphatab.model.Clef.C3;
		case "c4":case "alto":
			return alphatab.model.Clef.C4;
		default:
			return alphatab.model.Clef.G2;
		}
	}
	,parseKeySignature: function(str) {
		switch(str.toLowerCase()) {
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
	,parseTuning: function(str) {
		var tuning = alphatab.model.Tuning.getTuningForText(str);
		if(tuning < 0) this.error("tuning-value",alphatab.importer.AlphaTexSymbols.String,false);
		return tuning;
	}
	,nextChar: function() {
		try {
			this._ch = this._data.readString(1);
			this._curChPos++;
		} catch( e ) {
			if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
				this._ch = alphatab.importer.AlphaTexImporter.EOL;
			} else throw(e);
		}
	}
	,newSy: function() {
		this._sy = alphatab.importer.AlphaTexSymbols.No;
		do if(this._ch == alphatab.importer.AlphaTexImporter.EOL) this._sy = alphatab.importer.AlphaTexSymbols.Eof; else if(this._ch == " " || this._ch == "\n" || this._ch == "\r" || this._ch == "\t") this.nextChar(); else if(this._ch == "\"" || this._ch == "'") {
			this.nextChar();
			this._syData = "";
			this._sy = alphatab.importer.AlphaTexSymbols.String;
			while(this._ch != "\"" && this._ch != "'" && this._ch != alphatab.importer.AlphaTexImporter.EOL) {
				this._syData += this._ch;
				this.nextChar();
			}
			this.nextChar();
		} else if(this._ch == "-") {
			if(this._allowNegatives && this.isDigit(this._ch)) {
				var number = this.readNumber();
				this._sy = alphatab.importer.AlphaTexSymbols.Number;
				this._syData = number;
			} else {
				this._sy = alphatab.importer.AlphaTexSymbols.String;
				this._syData = this.readName();
			}
		} else if(this._ch == ".") {
			this._sy = alphatab.importer.AlphaTexSymbols.Dot;
			this.nextChar();
		} else if(this._ch == ":") {
			this._sy = alphatab.importer.AlphaTexSymbols.DoubleDot;
			this.nextChar();
		} else if(this._ch == "(") {
			this._sy = alphatab.importer.AlphaTexSymbols.LParensis;
			this.nextChar();
		} else if(this._ch == "\\") {
			this.nextChar();
			var name = this.readName();
			this._sy = alphatab.importer.AlphaTexSymbols.MetaCommand;
			this._syData = name;
		} else if(this._ch == ")") {
			this._sy = alphatab.importer.AlphaTexSymbols.RParensis;
			this.nextChar();
		} else if(this._ch == "{") {
			this._sy = alphatab.importer.AlphaTexSymbols.LBrace;
			this.nextChar();
		} else if(this._ch == "}") {
			this._sy = alphatab.importer.AlphaTexSymbols.RBrace;
			this.nextChar();
		} else if(this._ch == "|") {
			this._sy = alphatab.importer.AlphaTexSymbols.Pipe;
			this.nextChar();
		} else if(this.isDigit(this._ch)) {
			var number = this.readNumber();
			this._sy = alphatab.importer.AlphaTexSymbols.Number;
			this._syData = number;
		} else if(alphatab.importer.AlphaTexImporter.isLetter(this._ch)) {
			var name = this.readName();
			if(alphatab.model.Tuning.isTuning(name)) {
				this._sy = alphatab.importer.AlphaTexSymbols.Tuning;
				this._syData = name.toLowerCase();
			} else {
				this._sy = alphatab.importer.AlphaTexSymbols.String;
				this._syData = name;
			}
		} else this.error("symbol",alphatab.importer.AlphaTexSymbols.String,false); while(this._sy == alphatab.importer.AlphaTexSymbols.No);
	}
	,isDigit: function(ch) {
		var code = HxOverrides.cca(ch,0);
		return code >= 48 && code <= 57 || ch == "-" && this._allowNegatives;
	}
	,readName: function() {
		var str = "";
		do {
			str += this._ch;
			this.nextChar();
		} while(alphatab.importer.AlphaTexImporter.isLetter(this._ch) || this.isDigit(this._ch));
		return str;
	}
	,readNumber: function() {
		var str = "";
		do {
			str += this._ch;
			this.nextChar();
		} while(this.isDigit(this._ch));
		return Std.parseInt(str);
	}
	,__class__: alphatab.importer.AlphaTexImporter
});
alphatab.importer.AlphaTexSymbols = $hxClasses["alphatab.importer.AlphaTexSymbols"] = { __ename__ : ["alphatab","importer","AlphaTexSymbols"], __constructs__ : ["No","Eof","Number","DoubleDot","Dot","String","Tuning","LParensis","RParensis","LBrace","RBrace","Pipe","MetaCommand"] }
alphatab.importer.AlphaTexSymbols.No = ["No",0];
alphatab.importer.AlphaTexSymbols.No.toString = $estr;
alphatab.importer.AlphaTexSymbols.No.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.Eof = ["Eof",1];
alphatab.importer.AlphaTexSymbols.Eof.toString = $estr;
alphatab.importer.AlphaTexSymbols.Eof.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.Number = ["Number",2];
alphatab.importer.AlphaTexSymbols.Number.toString = $estr;
alphatab.importer.AlphaTexSymbols.Number.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.DoubleDot = ["DoubleDot",3];
alphatab.importer.AlphaTexSymbols.DoubleDot.toString = $estr;
alphatab.importer.AlphaTexSymbols.DoubleDot.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.Dot = ["Dot",4];
alphatab.importer.AlphaTexSymbols.Dot.toString = $estr;
alphatab.importer.AlphaTexSymbols.Dot.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.String = ["String",5];
alphatab.importer.AlphaTexSymbols.String.toString = $estr;
alphatab.importer.AlphaTexSymbols.String.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.Tuning = ["Tuning",6];
alphatab.importer.AlphaTexSymbols.Tuning.toString = $estr;
alphatab.importer.AlphaTexSymbols.Tuning.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.LParensis = ["LParensis",7];
alphatab.importer.AlphaTexSymbols.LParensis.toString = $estr;
alphatab.importer.AlphaTexSymbols.LParensis.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.RParensis = ["RParensis",8];
alphatab.importer.AlphaTexSymbols.RParensis.toString = $estr;
alphatab.importer.AlphaTexSymbols.RParensis.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.LBrace = ["LBrace",9];
alphatab.importer.AlphaTexSymbols.LBrace.toString = $estr;
alphatab.importer.AlphaTexSymbols.LBrace.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.RBrace = ["RBrace",10];
alphatab.importer.AlphaTexSymbols.RBrace.toString = $estr;
alphatab.importer.AlphaTexSymbols.RBrace.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.Pipe = ["Pipe",11];
alphatab.importer.AlphaTexSymbols.Pipe.toString = $estr;
alphatab.importer.AlphaTexSymbols.Pipe.__enum__ = alphatab.importer.AlphaTexSymbols;
alphatab.importer.AlphaTexSymbols.MetaCommand = ["MetaCommand",12];
alphatab.importer.AlphaTexSymbols.MetaCommand.toString = $estr;
alphatab.importer.AlphaTexSymbols.MetaCommand.__enum__ = alphatab.importer.AlphaTexSymbols;
var haxe = haxe || {}
haxe.Public = $hxClasses["haxe.Public"] = function() { }
haxe.Public.__name__ = ["haxe","Public"];
if(!haxe.unit) haxe.unit = {}
haxe.unit.TestCase = $hxClasses["haxe.unit.TestCase"] = function() {
};
haxe.unit.TestCase.__name__ = ["haxe","unit","TestCase"];
haxe.unit.TestCase.__interfaces__ = [haxe.Public];
haxe.unit.TestCase.prototype = {
	currentTest: null
	,setup: function() {
	}
	,tearDown: function() {
	}
	,print: function(v) {
		haxe.unit.TestRunner.print(v);
	}
	,assertTrue: function(b,c) {
		this.currentTest.done = true;
		if(b == false) {
			this.currentTest.success = false;
			this.currentTest.error = "expected true but was false";
			this.currentTest.posInfos = c;
			throw this.currentTest;
		}
	}
	,assertFalse: function(b,c) {
		this.currentTest.done = true;
		if(b == true) {
			this.currentTest.success = false;
			this.currentTest.error = "expected false but was true";
			this.currentTest.posInfos = c;
			throw this.currentTest;
		}
	}
	,assertEquals: function(expected,actual,c) {
		this.currentTest.done = true;
		if(actual != expected) {
			this.currentTest.success = false;
			this.currentTest.error = "expected '" + Std.string(expected) + "' but was '" + Std.string(actual) + "'";
			this.currentTest.posInfos = c;
			throw this.currentTest;
		}
	}
	,__class__: haxe.unit.TestCase
}
alphatab.importer.GpImporterTestBase = $hxClasses["alphatab.importer.GpImporterTestBase"] = function() {
	haxe.unit.TestCase.call(this);
};
alphatab.importer.GpImporterTestBase.__name__ = ["alphatab","importer","GpImporterTestBase"];
alphatab.importer.GpImporterTestBase.__super__ = haxe.unit.TestCase;
alphatab.importer.GpImporterTestBase.prototype = $extend(haxe.unit.TestCase.prototype,{
	prepareImporterWithData: function(data) {
		var buffer = haxe.io.Bytes.alloc(data.length);
		var _g1 = 0, _g = data.length;
		while(_g1 < _g) {
			var b = _g1++;
			buffer.b[b] = data[b] & 255;
		}
		return this.prepareImporterWithBytes(buffer);
	}
	,prepareImporterWithFile: function(name) {
		var path = "test-files";
		var buffer = new alphatab.platform.js.JsFileLoader().loadBinary(path + "/" + name);
		return this.prepareImporterWithBytes(buffer);
	}
	,prepareImporterWithBytes: function(buffer) {
		var readerBase = new alphatab.importer.Gp3To5Importer();
		readerBase.init(new haxe.io.BytesInput(buffer,0,buffer.length));
		return readerBase;
	}
	,checkTest02Score: function(score) {
		var beat;
		beat = 0;
		var durations = Type.getEnumConstructs(alphatab.model.Duration);
		var _g = 0;
		while(_g < durations.length) {
			var durationName = durations[_g];
			++_g;
			var duration = Reflect.field(alphatab.model.Duration,durationName);
			this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 79, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 80, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 81, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			beat++;
			this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 84, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 85, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 86, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			beat++;
			this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 89, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 90, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 91, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			beat++;
			this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 94, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[beat].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 95, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 96, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			beat++;
			this.assertTrue(score.tracks[0].bars[0].voices[0].beats[beat].isRest(),{ fileName : "GpImporterTestBase.hx", lineNumber : 99, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			this.assertEquals(duration,score.tracks[0].bars[0].voices[0].beats[beat].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 100, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest02Score"});
			beat++;
		}
	}
	,checkTest03Score: function(score) {
		this.assertEquals(4,score.masterBars[0].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 107, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(4,score.masterBars[0].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 108, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(3,score.masterBars[1].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 110, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(4,score.masterBars[1].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 111, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(2,score.masterBars[2].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 113, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(4,score.masterBars[2].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 114, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(1,score.masterBars[3].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 116, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(4,score.masterBars[3].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 117, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(20,score.masterBars[4].timeSignatureNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 119, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
		this.assertEquals(32,score.masterBars[4].timeSignatureDenominator,{ fileName : "GpImporterTestBase.hx", lineNumber : 120, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTest03Score"});
	}
	,checkDead: function(score) {
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isDead,{ fileName : "GpImporterTestBase.hx", lineNumber : 125, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[0].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 126, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isDead,{ fileName : "GpImporterTestBase.hx", lineNumber : 128, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[1].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 129, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].isDead,{ fileName : "GpImporterTestBase.hx", lineNumber : 131, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[2].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 132, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isDead,{ fileName : "GpImporterTestBase.hx", lineNumber : 134, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[3].notes[0].string,{ fileName : "GpImporterTestBase.hx", lineNumber : 135, className : "alphatab.importer.GpImporterTestBase", methodName : "checkDead"});
	}
	,checkGrace: function(score) {
		this.assertEquals(alphatab.model.GraceType.BeforeBeat,score.tracks[0].bars[0].voices[0].beats[0].graceType,{ fileName : "GpImporterTestBase.hx", lineNumber : 140, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 141, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(alphatab.model.Duration.ThirtySecond,score.tracks[0].bars[0].voices[0].beats[0].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 142, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[1].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 143, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(alphatab.model.Duration.Quarter,score.tracks[0].bars[0].voices[0].beats[1].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 144, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(alphatab.model.GraceType.BeforeBeat,score.tracks[0].bars[0].voices[0].beats[2].graceType,{ fileName : "GpImporterTestBase.hx", lineNumber : 146, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[2].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 147, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(alphatab.model.Duration.ThirtySecond,score.tracks[0].bars[0].voices[0].beats[2].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 148, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[3].notes[0].fret,{ fileName : "GpImporterTestBase.hx", lineNumber : 149, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
		this.assertEquals(alphatab.model.Duration.Quarter,score.tracks[0].bars[0].voices[0].beats[3].duration,{ fileName : "GpImporterTestBase.hx", lineNumber : 150, className : "alphatab.importer.GpImporterTestBase", methodName : "checkGrace"});
	}
	,checkAccentuation: function(score,includeHeavy) {
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isGhost,{ fileName : "GpImporterTestBase.hx", lineNumber : 155, className : "alphatab.importer.GpImporterTestBase", methodName : "checkAccentuation"});
		this.assertEquals(alphatab.model.AccentuationType.Normal,score.tracks[0].bars[0].voices[0].beats[1].notes[0].accentuated,{ fileName : "GpImporterTestBase.hx", lineNumber : 156, className : "alphatab.importer.GpImporterTestBase", methodName : "checkAccentuation"});
		if(includeHeavy) this.assertEquals(alphatab.model.AccentuationType.Heavy,score.tracks[0].bars[0].voices[0].beats[2].notes[0].accentuated,{ fileName : "GpImporterTestBase.hx", lineNumber : 159, className : "alphatab.importer.GpImporterTestBase", methodName : "checkAccentuation"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 161, className : "alphatab.importer.GpImporterTestBase", methodName : "checkAccentuation"});
	}
	,checkHarmonics: function(score) {
		this.assertEquals(alphatab.model.HarmonicType.Natural,score.tracks[0].bars[0].voices[0].beats[0].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 166, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
		this.assertEquals(alphatab.model.HarmonicType.Artificial,score.tracks[0].bars[0].voices[0].beats[1].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 167, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
		this.assertEquals(alphatab.model.HarmonicType.Tap,score.tracks[0].bars[0].voices[0].beats[2].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 168, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
		this.assertEquals(alphatab.model.HarmonicType.Semi,score.tracks[0].bars[0].voices[0].beats[3].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 169, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
		this.assertEquals(alphatab.model.HarmonicType.Pinch,score.tracks[0].bars[0].voices[0].beats[4].notes[0].harmonicType,{ fileName : "GpImporterTestBase.hx", lineNumber : 170, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHarmonics"});
	}
	,checkHammer: function(score) {
		this.assertEquals(false,score.tracks[0].bars[0].voices[0].beats[0].notes[0].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 176, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[1].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 177, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[2].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 178, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[3].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 179, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertEquals(false,score.tracks[0].bars[0].voices[0].beats[1].notes[0].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 181, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[1].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 182, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[2].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 183, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[3].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 184, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 186, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isHammerPullOrigin,{ fileName : "GpImporterTestBase.hx", lineNumber : 187, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isHammerPullDestination,{ fileName : "GpImporterTestBase.hx", lineNumber : 188, className : "alphatab.importer.GpImporterTestBase", methodName : "checkHammer"});
	}
	,checkBend: function(score) {
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 193, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 195, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 196, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(15,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 198, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 199, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(60,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 201, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[0].notes[0].bendPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 202, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(7,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 204, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 207, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 208, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(10,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 210, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 211, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(20,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 213, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 214, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(30,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[3].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 216, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[3].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 217, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(40,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[4].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 219, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[4].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 220, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(50,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[5].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 222, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[5].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 223, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(60,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[6].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 225, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[1].notes[0].bendPoints[6].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 226, className : "alphatab.importer.GpImporterTestBase", methodName : "checkBend"});
	}
	,checkTremolo: function(score) {
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 231, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 233, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 234, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(30,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 236, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(-4,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 237, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(60,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 239, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].whammyBarPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 240, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(3,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 242, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(0,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 244, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(-4,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 245, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(45,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 247, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(-4,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 248, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(60,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 250, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(0,score.tracks[0].bars[1].voices[0].beats[0].whammyBarPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 251, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(3,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints.length,{ fileName : "GpImporterTestBase.hx", lineNumber : 253, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(0,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[0].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 255, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(0,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[0].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 256, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(45,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[1].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 258, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(-4,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[1].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 259, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(60,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[2].offset,{ fileName : "GpImporterTestBase.hx", lineNumber : 261, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
		this.assertEquals(-4,score.tracks[0].bars[2].voices[0].beats[0].whammyBarPoints[2].value,{ fileName : "GpImporterTestBase.hx", lineNumber : 262, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTremolo"});
	}
	,checkSlides: function(score) {
		this.assertEquals(alphatab.model.SlideType.Legato,score.tracks[0].bars[0].voices[0].beats[0].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 268, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
		this.assertEquals(alphatab.model.SlideType.Shift,score.tracks[0].bars[0].voices[0].beats[2].getNoteOnString(2).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 269, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
		this.assertEquals(alphatab.model.SlideType.IntoFromBelow,score.tracks[0].bars[1].voices[0].beats[0].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 270, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
		this.assertEquals(alphatab.model.SlideType.IntoFromAbove,score.tracks[0].bars[1].voices[0].beats[1].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 271, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
		this.assertEquals(alphatab.model.SlideType.OutDown,score.tracks[0].bars[1].voices[0].beats[2].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 272, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
		this.assertEquals(alphatab.model.SlideType.OutUp,score.tracks[0].bars[1].voices[0].beats[3].getNoteOnString(5).slideType,{ fileName : "GpImporterTestBase.hx", lineNumber : 273, className : "alphatab.importer.GpImporterTestBase", methodName : "checkSlides"});
	}
	,checkVibrato: function(score) {
		this.assertEquals(alphatab.model.VibratoType.Slight,score.tracks[0].bars[0].voices[0].beats[0].notes[0].vibrato,{ fileName : "GpImporterTestBase.hx", lineNumber : 278, className : "alphatab.importer.GpImporterTestBase", methodName : "checkVibrato"});
		this.assertEquals(alphatab.model.VibratoType.Slight,score.tracks[0].bars[0].voices[0].beats[1].notes[0].vibrato,{ fileName : "GpImporterTestBase.hx", lineNumber : 279, className : "alphatab.importer.GpImporterTestBase", methodName : "checkVibrato"});
		this.assertEquals(alphatab.model.VibratoType.Slight,score.tracks[0].bars[0].voices[0].beats[2].vibrato,{ fileName : "GpImporterTestBase.hx", lineNumber : 281, className : "alphatab.importer.GpImporterTestBase", methodName : "checkVibrato"});
		this.assertEquals(alphatab.model.VibratoType.Slight,score.tracks[0].bars[0].voices[0].beats[3].vibrato,{ fileName : "GpImporterTestBase.hx", lineNumber : 282, className : "alphatab.importer.GpImporterTestBase", methodName : "checkVibrato"});
	}
	,checkTrills: function(score) {
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[0].notes[0].trillFret,{ fileName : "GpImporterTestBase.hx", lineNumber : 287, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[1].notes[0].trillSpeed,{ fileName : "GpImporterTestBase.hx", lineNumber : 288, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].tremoloSpeed >= 0,{ fileName : "GpImporterTestBase.hx", lineNumber : 290, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[1].tremoloSpeed,{ fileName : "GpImporterTestBase.hx", lineNumber : 291, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].tremoloSpeed >= 0,{ fileName : "GpImporterTestBase.hx", lineNumber : 293, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[2].tremoloSpeed,{ fileName : "GpImporterTestBase.hx", lineNumber : 294, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].tremoloSpeed >= 0,{ fileName : "GpImporterTestBase.hx", lineNumber : 296, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[3].tremoloSpeed,{ fileName : "GpImporterTestBase.hx", lineNumber : 297, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTrills"});
	}
	,checkOtherEffects: function(score) {
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 302, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isStaccato,{ fileName : "GpImporterTestBase.hx", lineNumber : 303, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].tapping,{ fileName : "GpImporterTestBase.hx", lineNumber : 304, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].slap,{ fileName : "GpImporterTestBase.hx", lineNumber : 305, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].pop,{ fileName : "GpImporterTestBase.hx", lineNumber : 307, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].fadeIn,{ fileName : "GpImporterTestBase.hx", lineNumber : 308, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.tracks[0].bars[3].voices[0].beats[0].chord != null,{ fileName : "GpImporterTestBase.hx", lineNumber : 310, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertEquals("C",score.tracks[0].bars[3].voices[0].beats[0].chord.name,{ fileName : "GpImporterTestBase.hx", lineNumber : 311, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertEquals("Text",score.tracks[0].bars[3].voices[0].beats[1].text,{ fileName : "GpImporterTestBase.hx", lineNumber : 312, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.masterBars[4].isDoubleBar,{ fileName : "GpImporterTestBase.hx", lineNumber : 313, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Tempo) != null,{ fileName : "GpImporterTestBase.hx", lineNumber : 314, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertEquals(120.0,score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Tempo).value,{ fileName : "GpImporterTestBase.hx", lineNumber : 315, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Instrument) != null,{ fileName : "GpImporterTestBase.hx", lineNumber : 316, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
		this.assertEquals(25.0,score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Instrument).value,{ fileName : "GpImporterTestBase.hx", lineNumber : 317, className : "alphatab.importer.GpImporterTestBase", methodName : "checkOtherEffects"});
	}
	,checkFingering: function(score) {
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isFingering,{ fileName : "GpImporterTestBase.hx", lineNumber : 322, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[0].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 323, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[1].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 324, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[2].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 325, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[3].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 326, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[4].notes[0].leftHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 327, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(0,score.tracks[0].bars[0].voices[0].beats[5].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 328, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(1,score.tracks[0].bars[0].voices[0].beats[6].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 329, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(2,score.tracks[0].bars[0].voices[0].beats[7].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 330, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[8].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 331, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
		this.assertEquals(4,score.tracks[0].bars[0].voices[0].beats[9].notes[0].rightHandFinger,{ fileName : "GpImporterTestBase.hx", lineNumber : 332, className : "alphatab.importer.GpImporterTestBase", methodName : "checkFingering"});
	}
	,checkStroke: function(score) {
		this.assertEquals(alphatab.model.BrushType.BrushDown,score.tracks[0].bars[0].voices[0].beats[0].brushType,{ fileName : "GpImporterTestBase.hx", lineNumber : 337, className : "alphatab.importer.GpImporterTestBase", methodName : "checkStroke"});
		this.assertEquals(alphatab.model.BrushType.BrushUp,score.tracks[0].bars[0].voices[0].beats[1].brushType,{ fileName : "GpImporterTestBase.hx", lineNumber : 338, className : "alphatab.importer.GpImporterTestBase", methodName : "checkStroke"});
		this.assertEquals(alphatab.model.PickStrokeType.Up,score.tracks[0].bars[0].voices[0].beats[2].pickStroke,{ fileName : "GpImporterTestBase.hx", lineNumber : 339, className : "alphatab.importer.GpImporterTestBase", methodName : "checkStroke"});
		this.assertEquals(alphatab.model.PickStrokeType.Down,score.tracks[0].bars[0].voices[0].beats[3].pickStroke,{ fileName : "GpImporterTestBase.hx", lineNumber : 340, className : "alphatab.importer.GpImporterTestBase", methodName : "checkStroke"});
	}
	,checkTuplets: function(score) {
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[0].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 345, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[1].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 346, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
		this.assertEquals(3,score.tracks[0].bars[0].voices[0].beats[2].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 347, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
		this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[0].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 349, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
		this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[1].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 350, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
		this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[2].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 351, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
		this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[3].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 352, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
		this.assertEquals(5,score.tracks[0].bars[1].voices[0].beats[4].tupletNumerator,{ fileName : "GpImporterTestBase.hx", lineNumber : 353, className : "alphatab.importer.GpImporterTestBase", methodName : "checkTuplets"});
	}
	,checkRanges: function(score) {
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 358, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[1].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 359, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 360, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 361, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 362, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].notes[0].isPalmMute,{ fileName : "GpImporterTestBase.hx", lineNumber : 363, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 365, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 366, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[3].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 367, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
		this.assertTrue(score.tracks[0].bars[2].voices[0].beats[0].notes[0].isLetRing,{ fileName : "GpImporterTestBase.hx", lineNumber : 368, className : "alphatab.importer.GpImporterTestBase", methodName : "checkRanges"});
	}
	,checkEffects: function(score) {
		this.assertTrue(true,{ fileName : "GpImporterTestBase.hx", lineNumber : 374, className : "alphatab.importer.GpImporterTestBase", methodName : "checkEffects"});
	}
	,__class__: alphatab.importer.GpImporterTestBase
});
alphatab.importer.Gp3ImporterTest = $hxClasses["alphatab.importer.Gp3ImporterTest"] = function() {
	alphatab.importer.GpImporterTestBase.call(this);
};
alphatab.importer.Gp3ImporterTest.__name__ = ["alphatab","importer","Gp3ImporterTest"];
alphatab.importer.Gp3ImporterTest.__super__ = alphatab.importer.GpImporterTestBase;
alphatab.importer.Gp3ImporterTest.prototype = $extend(alphatab.importer.GpImporterTestBase.prototype,{
	testScoreInfo: function() {
		var reader = this.prepareImporterWithFile("Test01.gp3");
		var score = reader.readScore();
		this.assertEquals("Title",score.title,{ fileName : "Gp3ImporterTest.hx", lineNumber : 36, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Subtitle",score.subTitle,{ fileName : "Gp3ImporterTest.hx", lineNumber : 37, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Artist",score.artist,{ fileName : "Gp3ImporterTest.hx", lineNumber : 38, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Album",score.album,{ fileName : "Gp3ImporterTest.hx", lineNumber : 39, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Music",score.words,{ fileName : "Gp3ImporterTest.hx", lineNumber : 40, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Music",score.music,{ fileName : "Gp3ImporterTest.hx", lineNumber : 41, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Copyright",score.copyright,{ fileName : "Gp3ImporterTest.hx", lineNumber : 42, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Tab",score.tab,{ fileName : "Gp3ImporterTest.hx", lineNumber : 43, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Instructions",score.instructions,{ fileName : "Gp3ImporterTest.hx", lineNumber : 44, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Notice1\nNotice2",score.notices,{ fileName : "Gp3ImporterTest.hx", lineNumber : 45, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals(5,score.masterBars.length,{ fileName : "Gp3ImporterTest.hx", lineNumber : 46, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals(1,score.tracks.length,{ fileName : "Gp3ImporterTest.hx", lineNumber : 47, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Track 1",score.tracks[0].name,{ fileName : "Gp3ImporterTest.hx", lineNumber : 48, className : "alphatab.importer.Gp3ImporterTest", methodName : "testScoreInfo"});
	}
	,testNotes: function() {
		var reader = this.prepareImporterWithFile("Test02.gp3");
		var score = reader.readScore();
		this.checkTest02Score(score);
	}
	,testTimeSignatures: function() {
		var reader = this.prepareImporterWithFile("Test03.gp3");
		var score = reader.readScore();
		this.checkTest03Score(score);
	}
	,testDead: function() {
		var reader = this.prepareImporterWithFile("TestDead.gp3");
		var score = reader.readScore();
		this.checkDead(score);
	}
	,testAccentuation: function() {
		var reader = this.prepareImporterWithFile("TestAccentuations.gp3");
		var score = reader.readScore();
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[0].notes[0].isGhost,{ fileName : "Gp3ImporterTest.hx", lineNumber : 78, className : "alphatab.importer.Gp3ImporterTest", methodName : "testAccentuation"});
		this.assertEquals(alphatab.model.DynamicValue.FFF,score.tracks[0].bars[0].voices[0].beats[1].notes[0].dynamicValue,{ fileName : "Gp3ImporterTest.hx", lineNumber : 80, className : "alphatab.importer.Gp3ImporterTest", methodName : "testAccentuation"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 81, className : "alphatab.importer.Gp3ImporterTest", methodName : "testAccentuation"});
	}
	,testHammer: function() {
		var reader = this.prepareImporterWithFile("TestHammer.gp3");
		var score = reader.readScore();
		this.checkHammer(score);
	}
	,testBend: function() {
		var reader = this.prepareImporterWithFile("TestBends.gp3");
		var score = reader.readScore();
		this.checkBend(score);
	}
	,testSlides: function() {
		var reader = this.prepareImporterWithFile("TestSlides.gp3");
		var score = reader.readScore();
		this.assertEquals(alphatab.model.SlideType.Shift,score.tracks[0].bars[0].voices[0].beats[0].getNoteOnString(5).slideType,{ fileName : "Gp3ImporterTest.hx", lineNumber : 113, className : "alphatab.importer.Gp3ImporterTest", methodName : "testSlides"});
		this.assertEquals(alphatab.model.SlideType.Shift,score.tracks[0].bars[0].voices[0].beats[2].getNoteOnString(2).slideType,{ fileName : "Gp3ImporterTest.hx", lineNumber : 114, className : "alphatab.importer.Gp3ImporterTest", methodName : "testSlides"});
	}
	,testOtherEffects: function() {
		var reader = this.prepareImporterWithFile("TestOtherEffects.gp3");
		var score = reader.readScore();
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[2].notes[0].tapping,{ fileName : "Gp3ImporterTest.hx", lineNumber : 130, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertTrue(score.tracks[0].bars[0].voices[0].beats[3].slap,{ fileName : "Gp3ImporterTest.hx", lineNumber : 131, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[0].pop,{ fileName : "Gp3ImporterTest.hx", lineNumber : 133, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].fadeIn,{ fileName : "Gp3ImporterTest.hx", lineNumber : 134, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertTrue(score.tracks[0].bars[3].voices[0].beats[0].chord != null,{ fileName : "Gp3ImporterTest.hx", lineNumber : 136, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertEquals("C",score.tracks[0].bars[3].voices[0].beats[0].chord.name,{ fileName : "Gp3ImporterTest.hx", lineNumber : 137, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertEquals("Text",score.tracks[0].bars[3].voices[0].beats[1].text,{ fileName : "Gp3ImporterTest.hx", lineNumber : 138, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Tempo) != null,{ fileName : "Gp3ImporterTest.hx", lineNumber : 139, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertEquals(120.0,score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Tempo).value,{ fileName : "Gp3ImporterTest.hx", lineNumber : 140, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertTrue(score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Instrument) != null,{ fileName : "Gp3ImporterTest.hx", lineNumber : 141, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
		this.assertEquals(25.0,score.tracks[0].bars[4].voices[0].beats[0].getAutomation(alphatab.model.AutomationType.Instrument).value,{ fileName : "Gp3ImporterTest.hx", lineNumber : 142, className : "alphatab.importer.Gp3ImporterTest", methodName : "testOtherEffects"});
	}
	,testStroke: function() {
		var reader = this.prepareImporterWithFile("TestStrokes.gp3");
		var score = reader.readScore();
		this.assertEquals(alphatab.model.BrushType.BrushDown,score.tracks[0].bars[0].voices[0].beats[0].brushType,{ fileName : "Gp3ImporterTest.hx", lineNumber : 150, className : "alphatab.importer.Gp3ImporterTest", methodName : "testStroke"});
		this.assertEquals(alphatab.model.BrushType.BrushUp,score.tracks[0].bars[0].voices[0].beats[1].brushType,{ fileName : "Gp3ImporterTest.hx", lineNumber : 151, className : "alphatab.importer.Gp3ImporterTest", methodName : "testStroke"});
	}
	,testTuplets: function() {
		var reader = this.prepareImporterWithFile("TestTuplets.gp3");
		var score = reader.readScore();
		this.checkTuplets(score);
	}
	,testRanges: function() {
		var reader = this.prepareImporterWithFile("TestRanges.gp3");
		var score = reader.readScore();
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[1].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 166, className : "alphatab.importer.Gp3ImporterTest", methodName : "testRanges"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[2].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 167, className : "alphatab.importer.Gp3ImporterTest", methodName : "testRanges"});
		this.assertTrue(score.tracks[0].bars[1].voices[0].beats[3].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 168, className : "alphatab.importer.Gp3ImporterTest", methodName : "testRanges"});
		this.assertTrue(score.tracks[0].bars[2].voices[0].beats[0].notes[0].isLetRing,{ fileName : "Gp3ImporterTest.hx", lineNumber : 169, className : "alphatab.importer.Gp3ImporterTest", methodName : "testRanges"});
	}
	,testEffects: function() {
		var reader = this.prepareImporterWithFile("Effects.gp3");
		var score = reader.readScore();
		this.checkEffects(score);
	}
	,__class__: alphatab.importer.Gp3ImporterTest
});
alphatab.importer.Gp3To5Importer = $hxClasses["alphatab.importer.Gp3To5Importer"] = function() {
	alphatab.importer.ScoreImporter.call(this);
	this._globalTripletFeel = alphatab.model.TripletFeel.NoTripletFeel;
};
alphatab.importer.Gp3To5Importer.__name__ = ["alphatab","importer","Gp3To5Importer"];
alphatab.importer.Gp3To5Importer.__super__ = alphatab.importer.ScoreImporter;
alphatab.importer.Gp3To5Importer.prototype = $extend(alphatab.importer.ScoreImporter.prototype,{
	_versionNumber: null
	,_score: null
	,_tempo: null
	,_keySignature: null
	,_octave: null
	,_globalTripletFeel: null
	,_lyricsIndex: null
	,_lyrics: null
	,_lyricsTrack: null
	,_barCount: null
	,_trackCount: null
	,_beatTapping: null
	,_playbackInfos: null
	,readScore: function() {
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
		this._score.tempo = this.readInt32();
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
		this.finish(this._score);
		return this._score;
	}
	,readVersion: function() {
		var version = this.readStringByteLength(30);
		if(!StringTools.startsWith(version,"FICHIER GUITAR PRO ")) throw alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT;
		version = HxOverrides.substr(version,"FICHIER GUITAR PRO ".length + 1,null);
		var dot = version.indexOf(".");
		this._versionNumber = 100 * Std.parseInt(HxOverrides.substr(version,0,dot)) + Std.parseInt(HxOverrides.substr(version,dot + 1,null));
	}
	,readScoreInformation: function() {
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
			if(i > 0) notice.b[notice.b.length] = "\n";
			notice.add(this.readStringIntUnused());
		}
		this._score.notices = notice.b.join("");
	}
	,readLyrics: function() {
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
	,readPageSetup: function() {
		this._data.read(30);
		var _g = 0;
		while(_g < 10) {
			var i = _g++;
			this.readStringIntByte();
		}
	}
	,readPlaybackInfos: function() {
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
	,readMasterBars: function() {
		var _g1 = 0, _g = this._barCount;
		while(_g1 < _g) {
			var i = _g1++;
			this.readMasterBar();
		}
	}
	,readMasterBar: function() {
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
			this.readColor();
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
	,readTracks: function() {
		var _g1 = 0, _g = this._trackCount;
		while(_g1 < _g) {
			var i = _g1++;
			this.readTrack();
		}
	}
	,readTrack: function() {
		var newTrack = new alphatab.model.Track();
		this._score.addTrack(newTrack);
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
	}
	,readBars: function() {
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
	,readBar: function(track) {
		var newBar = new alphatab.model.Bar();
		track.addBar(newBar);
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
	}
	,readVoice: function(track,bar) {
		var beatCount = this.readInt32();
		if(beatCount == 0) return;
		var newVoice = new alphatab.model.Voice();
		bar.addVoice(newVoice);
		var _g = 0;
		while(_g < beatCount) {
			var i = _g++;
			this.readBeat(track,bar,newVoice);
		}
	}
	,readBeat: function(track,bar,voice) {
		var newBeat = new alphatab.model.Beat();
		voice.addBeat(newBeat);
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
			if((stringFlags & 1 << i) != 0 && 6 - i < track.tuning.length) this.readNote(track,bar,voice,newBeat,6 - i);
			i--;
		}
		if(this._versionNumber >= 500) {
			this._data.readByte();
			var flag = this._data.readByte();
			if((flag & 8) != 0) this._data.readByte();
		}
	}
	,readChord: function(beat) {
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
	,readBeatEffects: function(beat) {
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
	,readTremoloBarEffect: function(beat) {
		this._data.readByte();
		this.readInt32();
		var pointCount = this.readInt32();
		if(pointCount > 0) {
			var _g = 0;
			while(_g < pointCount) {
				var i = _g++;
				var point = new alphatab.model.BendPoint();
				point.offset = this.readInt32();
				point.value = this.readInt32() / 25 | 0;
				this._data.readByte() != 0;
				beat.whammyBarPoints.push(point);
			}
		}
	}
	,toStrokeValue: function(value) {
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
	,readMixTableChange: function(beat) {
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
	,readNote: function(track,bar,voice,beat,stringIndex) {
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
	,toDynamicValue: function(value) {
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
	,readNoteEffects: function(track,voice,beat,note) {
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
	,readBend: function(note) {
		this._data.readByte();
		this.readInt32();
		var pointCount = this.readInt32();
		if(pointCount > 0) {
			var _g = 0;
			while(_g < pointCount) {
				var i = _g++;
				var point = new alphatab.model.BendPoint();
				point.offset = this.readInt32();
				point.value = this.readInt32() / 25 | 0;
				this._data.readByte() != 0;
				note.bendPoints.push(point);
			}
		}
	}
	,readGrace: function(voice,note) {
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
	,readTremoloPicking: function(beat) {
		beat.tremoloSpeed = this._data.readByte();
	}
	,readSlide: function(note) {
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
	,readArtificialHarmonic: function(note) {
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
	,deltaFretToHarmonicValue: function(deltaFret) {
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
	,readTrill: function(note) {
		note.trillFret = this._data.readByte();
		note.trillSpeed = 1 + this._data.readByte();
	}
	,readDouble: function() {
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
	,getDoubleSig: function(bytes,indices) {
		var sig = parseInt((((bytes.b[indices[1]] & 15) << 16 | bytes.b[indices[2]] << 8 | bytes.b[indices[3]]) * Math.pow(2,32)).toString(2),2) + parseInt(((bytes.b[indices[4]] >> 7) * Math.pow(2,31)).toString(2),2) + parseInt(((bytes.b[indices[4]] & 127) << 24 | bytes.b[indices[5]] << 16 | bytes.b[indices[6]] << 8 | bytes.b[indices[7]]).toString(2),2);
		return sig;
	}
	,readColor: function() {
		this._data.readByte();
		this._data.readByte();
		this._data.readByte();
		this._data.readByte();
	}
	,readBool: function() {
		return this._data.readByte() != 0;
	}
	,readUInt8: function() {
		return this._data.readByte();
	}
	,readInt32: function() {
		var ch1 = this._data.readByte();
		var ch2 = this._data.readByte();
		var ch3 = this._data.readByte();
		var ch4 = this._data.readByte();
		return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
	,readStringIntUnused: function() {
		this._data.read(4);
		return this._data.readString(this._data.readByte());
	}
	,readStringInt: function() {
		return this._data.readString(this.readInt32());
	}
	,readStringIntByte: function() {
		var length = this.readInt32() - 1;
		this._data.readByte();
		return this._data.readString(length);
	}
	,readStringByteLength: function(length) {
		var stringLength = this._data.readByte();
		var string = this._data.readString(stringLength);
		if(stringLength < length) this._data.read(length - stringLength);
		return string;
	}
	,skip: function(count) {
		this._data.read(count);
	}
	,__class__: alphatab.importer.Gp3To5Importer
});
alphatab.importer.Gp4ImporterTest = $hxClasses["alphatab.importer.Gp4ImporterTest"] = function() {
	alphatab.importer.GpImporterTestBase.call(this);
};
alphatab.importer.Gp4ImporterTest.__name__ = ["alphatab","importer","Gp4ImporterTest"];
alphatab.importer.Gp4ImporterTest.__super__ = alphatab.importer.GpImporterTestBase;
alphatab.importer.Gp4ImporterTest.prototype = $extend(alphatab.importer.GpImporterTestBase.prototype,{
	testScoreInfo: function() {
		var reader = this.prepareImporterWithFile("Test01.gp4");
		var score = reader.readScore();
		this.assertEquals("Title",score.title,{ fileName : "Gp4ImporterTest.hx", lineNumber : 31, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Subtitle",score.subTitle,{ fileName : "Gp4ImporterTest.hx", lineNumber : 32, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Artist",score.artist,{ fileName : "Gp4ImporterTest.hx", lineNumber : 33, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Album",score.album,{ fileName : "Gp4ImporterTest.hx", lineNumber : 34, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Music",score.words,{ fileName : "Gp4ImporterTest.hx", lineNumber : 35, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Music",score.music,{ fileName : "Gp4ImporterTest.hx", lineNumber : 36, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Copyright",score.copyright,{ fileName : "Gp4ImporterTest.hx", lineNumber : 37, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Tab",score.tab,{ fileName : "Gp4ImporterTest.hx", lineNumber : 38, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Instructions",score.instructions,{ fileName : "Gp4ImporterTest.hx", lineNumber : 39, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Notice1\nNotice2",score.notices,{ fileName : "Gp4ImporterTest.hx", lineNumber : 40, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals(5,score.masterBars.length,{ fileName : "Gp4ImporterTest.hx", lineNumber : 41, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals(1,score.tracks.length,{ fileName : "Gp4ImporterTest.hx", lineNumber : 42, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Track 1",score.tracks[0].name,{ fileName : "Gp4ImporterTest.hx", lineNumber : 43, className : "alphatab.importer.Gp4ImporterTest", methodName : "testScoreInfo"});
	}
	,testNotes: function() {
		var reader = this.prepareImporterWithFile("Test02.gp4");
		var score = reader.readScore();
		this.checkTest02Score(score);
	}
	,testTimeSignatures: function() {
		var reader = this.prepareImporterWithFile("Test03.gp4");
		var score = reader.readScore();
		this.checkTest03Score(score);
	}
	,testDead: function() {
		var reader = this.prepareImporterWithFile("TestDead.gp4");
		var score = reader.readScore();
		this.checkDead(score);
	}
	,testGrace: function() {
		var reader = this.prepareImporterWithFile("TestGrace.gp4");
		var score = reader.readScore();
		this.checkGrace(score);
	}
	,testAccentuation: function() {
		var reader = this.prepareImporterWithFile("TestAccentuations.gp4");
		var score = reader.readScore();
		this.checkAccentuation(score,false);
	}
	,testHarmonics: function() {
		var reader = this.prepareImporterWithFile("TestHarmonics.gp4");
		var score = reader.readScore();
		this.checkHarmonics(score);
	}
	,testHammer: function() {
		var reader = this.prepareImporterWithFile("TestHammer.gp4");
		var score = reader.readScore();
		this.checkHammer(score);
	}
	,testBend: function() {
		var reader = this.prepareImporterWithFile("TestBends.gp4");
		var score = reader.readScore();
		this.checkBend(score);
	}
	,testTremolo: function() {
		var reader = this.prepareImporterWithFile("TestTremolo.gp4");
		var score = reader.readScore();
		this.checkTremolo(score);
	}
	,testSlides: function() {
		var reader = this.prepareImporterWithFile("TestSlides.gp4");
		var score = reader.readScore();
		this.checkSlides(score);
	}
	,testVibrato: function() {
		var reader = this.prepareImporterWithFile("TestVibrato.gp4");
		var score = reader.readScore();
		this.checkVibrato(score);
	}
	,testTrills: function() {
		var reader = this.prepareImporterWithFile("TestTrills.gp4");
		var score = reader.readScore();
		this.checkTrills(score);
	}
	,testOtherEffects: function() {
		var reader = this.prepareImporterWithFile("TestOtherEffects.gp4");
		var score = reader.readScore();
		this.checkOtherEffects(score);
	}
	,testFingering: function() {
		var reader = this.prepareImporterWithFile("TestFingering.gp4");
		var score = reader.readScore();
		this.checkFingering(score);
	}
	,testStroke: function() {
		var reader = this.prepareImporterWithFile("TestStrokes.gp4");
		var score = reader.readScore();
		this.checkStroke(score);
	}
	,testTuplets: function() {
		var reader = this.prepareImporterWithFile("TestTuplets.gp4");
		var score = reader.readScore();
		this.checkTuplets(score);
	}
	,testRanges: function() {
		var reader = this.prepareImporterWithFile("TestRanges.gp4");
		var score = reader.readScore();
		this.checkRanges(score);
	}
	,testEffects: function() {
		var reader = this.prepareImporterWithFile("Effects.gp4");
		var score = reader.readScore();
		this.checkEffects(score);
	}
	,__class__: alphatab.importer.Gp4ImporterTest
});
alphatab.importer.Gp5ImporterTest = $hxClasses["alphatab.importer.Gp5ImporterTest"] = function() {
	alphatab.importer.GpImporterTestBase.call(this);
};
alphatab.importer.Gp5ImporterTest.__name__ = ["alphatab","importer","Gp5ImporterTest"];
alphatab.importer.Gp5ImporterTest.__super__ = alphatab.importer.GpImporterTestBase;
alphatab.importer.Gp5ImporterTest.prototype = $extend(alphatab.importer.GpImporterTestBase.prototype,{
	testScoreInfo: function() {
		var reader = this.prepareImporterWithFile("Test01.gp5");
		var score = reader.readScore();
		this.assertEquals("Title",score.title,{ fileName : "Gp5ImporterTest.hx", lineNumber : 48, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Subtitle",score.subTitle,{ fileName : "Gp5ImporterTest.hx", lineNumber : 49, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Artist",score.artist,{ fileName : "Gp5ImporterTest.hx", lineNumber : 50, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Album",score.album,{ fileName : "Gp5ImporterTest.hx", lineNumber : 51, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Words",score.words,{ fileName : "Gp5ImporterTest.hx", lineNumber : 52, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Music",score.music,{ fileName : "Gp5ImporterTest.hx", lineNumber : 53, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Copyright",score.copyright,{ fileName : "Gp5ImporterTest.hx", lineNumber : 54, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Tab",score.tab,{ fileName : "Gp5ImporterTest.hx", lineNumber : 55, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Instructions",score.instructions,{ fileName : "Gp5ImporterTest.hx", lineNumber : 56, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Notice1\nNotice2",score.notices,{ fileName : "Gp5ImporterTest.hx", lineNumber : 57, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals(5,score.masterBars.length,{ fileName : "Gp5ImporterTest.hx", lineNumber : 58, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals(2,score.tracks.length,{ fileName : "Gp5ImporterTest.hx", lineNumber : 59, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Track 1",score.tracks[0].name,{ fileName : "Gp5ImporterTest.hx", lineNumber : 60, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
		this.assertEquals("Track 2",score.tracks[1].name,{ fileName : "Gp5ImporterTest.hx", lineNumber : 61, className : "alphatab.importer.Gp5ImporterTest", methodName : "testScoreInfo"});
	}
	,testNotes: function() {
		var reader = this.prepareImporterWithFile("Test02.gp5");
		var score = reader.readScore();
		this.checkTest02Score(score);
	}
	,testTimeSignatures: function() {
		var reader = this.prepareImporterWithFile("Test03.gp5");
		var score = reader.readScore();
		this.checkTest03Score(score);
	}
	,testDead: function() {
		var reader = this.prepareImporterWithFile("TestDead.gp5");
		var score = reader.readScore();
		this.checkDead(score);
	}
	,testGrace: function() {
		var reader = this.prepareImporterWithFile("TestGrace.gp5");
		var score = reader.readScore();
		this.checkGrace(score);
	}
	,testAccentuation: function() {
		var reader = this.prepareImporterWithFile("TestAccentuations.gp5");
		var score = reader.readScore();
		this.checkAccentuation(score,true);
	}
	,testHarmonics: function() {
		var reader = this.prepareImporterWithFile("TestHarmonics.gp5");
		var score = reader.readScore();
		this.checkHarmonics(score);
	}
	,testHammer: function() {
		var reader = this.prepareImporterWithFile("TestHammer.gp5");
		var score = reader.readScore();
		this.checkHammer(score);
	}
	,testBend: function() {
		var reader = this.prepareImporterWithFile("TestBends.gp5");
		var score = reader.readScore();
		this.checkBend(score);
	}
	,testTremolo: function() {
		var reader = this.prepareImporterWithFile("TestTremolo.gp5");
		var score = reader.readScore();
		this.checkTremolo(score);
	}
	,testSlides: function() {
		var reader = this.prepareImporterWithFile("TestSlides.gp5");
		var score = reader.readScore();
		this.checkSlides(score);
	}
	,testVibrato: function() {
		var reader = this.prepareImporterWithFile("TestVibrato.gp5");
		var score = reader.readScore();
		this.checkVibrato(score);
	}
	,testTrills: function() {
		var reader = this.prepareImporterWithFile("TestTrills.gp5");
		var score = reader.readScore();
		this.checkTrills(score);
	}
	,testOtherEffects: function() {
		var reader = this.prepareImporterWithFile("TestOtherEffects.gp5");
		var score = reader.readScore();
		this.checkOtherEffects(score);
	}
	,testFingering: function() {
		var reader = this.prepareImporterWithFile("TestFingering.gp5");
		var score = reader.readScore();
		this.checkFingering(score);
	}
	,testStroke: function() {
		var reader = this.prepareImporterWithFile("TestStrokes.gp5");
		var score = reader.readScore();
		this.checkStroke(score);
	}
	,testTuplets: function() {
		var reader = this.prepareImporterWithFile("TestTuplets.gp5");
		var score = reader.readScore();
		this.checkTuplets(score);
	}
	,testRanges: function() {
		var reader = this.prepareImporterWithFile("TestRanges.gp5");
		var score = reader.readScore();
		this.checkRanges(score);
	}
	,testEffects: function() {
		var reader = this.prepareImporterWithFile("Effects.gp5");
		var score = reader.readScore();
		this.checkEffects(score);
	}
	,testSerenade: function() {
		var reader = this.prepareImporterWithFile("Serenade.gp5");
		var score = reader.readScore();
		this.assertTrue(true,{ fileName : "Gp5ImporterTest.hx", lineNumber : 195, className : "alphatab.importer.Gp5ImporterTest", methodName : "testSerenade"});
	}
	,__class__: alphatab.importer.Gp5ImporterTest
});
alphatab.importer.GpImporterTest = $hxClasses["alphatab.importer.GpImporterTest"] = function() {
	alphatab.importer.GpImporterTestBase.call(this);
};
alphatab.importer.GpImporterTest.__name__ = ["alphatab","importer","GpImporterTest"];
alphatab.importer.GpImporterTest.__super__ = alphatab.importer.GpImporterTestBase;
alphatab.importer.GpImporterTest.prototype = $extend(alphatab.importer.GpImporterTestBase.prototype,{
	testReadStringIntUnused: function() {
		var reader = this.prepareImporterWithData([0,0,0,0,11,72,101,108,108,111,32,87,111,114,108,100]);
		this.assertEquals("Hello World",reader.readStringIntUnused(),{ fileName : "GpImporterTest.hx", lineNumber : 29, className : "alphatab.importer.GpImporterTest", methodName : "testReadStringIntUnused"});
	}
	,testReadStringInt: function() {
		var reader = this.prepareImporterWithData([11,0,0,0,72,101,108,108,111,32,87,111,114,108,100]);
		this.assertEquals("Hello World",reader._data.readString(reader.readInt32()),{ fileName : "GpImporterTest.hx", lineNumber : 35, className : "alphatab.importer.GpImporterTest", methodName : "testReadStringInt"});
	}
	,testReadStringIntByte: function() {
		var reader = this.prepareImporterWithData([12,0,0,0,11,72,101,108,108,111,32,87,111,114,108,100]);
		this.assertEquals("Hello World",reader.readStringIntByte(),{ fileName : "GpImporterTest.hx", lineNumber : 41, className : "alphatab.importer.GpImporterTest", methodName : "testReadStringIntByte"});
	}
	,testReadStringByteLength: function() {
		var reader = this.prepareImporterWithData([11,72,101,108,108,111,32,87,111,114,108,100]);
		this.assertEquals("Hello World",reader.readStringByteLength(3),{ fileName : "GpImporterTest.hx", lineNumber : 47, className : "alphatab.importer.GpImporterTest", methodName : "testReadStringByteLength"});
	}
	,testReadVersion: function() {
		var reader = this.prepareImporterWithData([24,70,73,67,72,73,69,82,32,71,85,73,84,65,82,32,80,82,79,32,118,51,46,48,48,0,0,0,0,0,0,24]);
		reader.readVersion();
		this.assertEquals(300,reader._versionNumber,{ fileName : "GpImporterTest.hx", lineNumber : 55, className : "alphatab.importer.GpImporterTest", methodName : "testReadVersion"});
		this.assertEquals(24,reader._data.readByte(),{ fileName : "GpImporterTest.hx", lineNumber : 56, className : "alphatab.importer.GpImporterTest", methodName : "testReadVersion"});
	}
	,__class__: alphatab.importer.GpImporterTest
});
alphatab.importer.MixTableChange = $hxClasses["alphatab.importer.MixTableChange"] = function() {
	this.volume = -1;
	this.balance = -1;
	this.instrument = -1;
	this.tempoName = null;
	this.tempo = -1;
	this.duration = 0;
};
alphatab.importer.MixTableChange.__name__ = ["alphatab","importer","MixTableChange"];
alphatab.importer.MixTableChange.prototype = {
	volume: null
	,balance: null
	,instrument: null
	,tempoName: null
	,tempo: null
	,duration: null
	,__class__: alphatab.importer.MixTableChange
}
alphatab.importer.ScoreLoader = $hxClasses["alphatab.importer.ScoreLoader"] = function() { }
alphatab.importer.ScoreLoader.__name__ = ["alphatab","importer","ScoreLoader"];
alphatab.importer.ScoreLoader.loadScoreAsync = function(path,success,error) {
	var loader = new alphatab.platform.js.JsFileLoader();
	loader.loadBinaryAsync(path,function(data) {
		var importers = alphatab.importer.ScoreImporter.availableImporters();
		var _g = 0;
		while(_g < importers.length) {
			var importer = importers[_g];
			++_g;
			try {
				var input = new haxe.io.BytesInput(data);
				importer.init(input);
				var score = importer.readScore();
				success(score);
				return;
			} catch( e ) {
				if(e == alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT) continue; else error(haxe.Stack.toString(haxe.Stack.exceptionStack()));
			}
		}
		error("No reader for the requested file found");
	},error);
}
if(!alphatab.io) alphatab.io = {}
alphatab.io.OutputExtensions = $hxClasses["alphatab.io.OutputExtensions"] = function() { }
alphatab.io.OutputExtensions.__name__ = ["alphatab","io","OutputExtensions"];
alphatab.io.OutputExtensions.writeAsString = function(output,value) {
	var text;
	if(js.Boot.__instanceof(value,String)) text = js.Boot.__cast(value , String); else text = Std.string(value);
	output.writeString(text);
}
if(!alphatab.model) alphatab.model = {}
alphatab.model.AccentuationType = $hxClasses["alphatab.model.AccentuationType"] = { __ename__ : ["alphatab","model","AccentuationType"], __constructs__ : ["None","Normal","Heavy"] }
alphatab.model.AccentuationType.None = ["None",0];
alphatab.model.AccentuationType.None.toString = $estr;
alphatab.model.AccentuationType.None.__enum__ = alphatab.model.AccentuationType;
alphatab.model.AccentuationType.Normal = ["Normal",1];
alphatab.model.AccentuationType.Normal.toString = $estr;
alphatab.model.AccentuationType.Normal.__enum__ = alphatab.model.AccentuationType;
alphatab.model.AccentuationType.Heavy = ["Heavy",2];
alphatab.model.AccentuationType.Heavy.toString = $estr;
alphatab.model.AccentuationType.Heavy.__enum__ = alphatab.model.AccentuationType;
alphatab.model.AccidentalType = $hxClasses["alphatab.model.AccidentalType"] = { __ename__ : ["alphatab","model","AccidentalType"], __constructs__ : ["None","Natural","Sharp","Flat"] }
alphatab.model.AccidentalType.None = ["None",0];
alphatab.model.AccidentalType.None.toString = $estr;
alphatab.model.AccidentalType.None.__enum__ = alphatab.model.AccidentalType;
alphatab.model.AccidentalType.Natural = ["Natural",1];
alphatab.model.AccidentalType.Natural.toString = $estr;
alphatab.model.AccidentalType.Natural.__enum__ = alphatab.model.AccidentalType;
alphatab.model.AccidentalType.Sharp = ["Sharp",2];
alphatab.model.AccidentalType.Sharp.toString = $estr;
alphatab.model.AccidentalType.Sharp.__enum__ = alphatab.model.AccidentalType;
alphatab.model.AccidentalType.Flat = ["Flat",3];
alphatab.model.AccidentalType.Flat.toString = $estr;
alphatab.model.AccidentalType.Flat.__enum__ = alphatab.model.AccidentalType;
alphatab.model.Automation = $hxClasses["alphatab.model.Automation"] = function() {
};
alphatab.model.Automation.__name__ = ["alphatab","model","Automation"];
alphatab.model.Automation.prototype = {
	isLinear: null
	,type: null
	,value: null
	,duration: null
	,__class__: alphatab.model.Automation
}
alphatab.model.AutomationType = $hxClasses["alphatab.model.AutomationType"] = { __ename__ : ["alphatab","model","AutomationType"], __constructs__ : ["Tempo","Volume","Instrument","Balance"] }
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
alphatab.model.Bar = $hxClasses["alphatab.model.Bar"] = function() {
	this.voices = new Array();
	this.clef = alphatab.model.Clef.G2;
};
alphatab.model.Bar.__name__ = ["alphatab","model","Bar"];
alphatab.model.Bar.prototype = {
	index: null
	,nextBar: null
	,previousBar: null
	,clef: null
	,track: null
	,voices: null
	,addVoice: function(voice) {
		voice.bar = this;
		voice.index = this.voices.length;
		this.voices.push(voice);
	}
	,getMasterBar: function() {
		return this.track.score.masterBars[this.index];
	}
	,isEmpty: function() {
		var _g = 0, _g1 = this.voices;
		while(_g < _g1.length) {
			var v = _g1[_g];
			++_g;
			if(!v.isEmpty()) return false;
		}
		return true;
	}
	,__class__: alphatab.model.Bar
}
alphatab.model.Beat = $hxClasses["alphatab.model.Beat"] = function() {
	this.whammyBarPoints = new Array();
	this.notes = new Array();
	this.brushType = alphatab.model.BrushType.None;
	this.vibrato = alphatab.model.VibratoType.None;
	this.graceType = alphatab.model.GraceType.None;
	this.pickStroke = alphatab.model.PickStrokeType.None;
	this.duration = alphatab.model.Duration.Quarter;
	this.tremoloSpeed = -1;
	this.automations = new Array();
	this.start = 0;
	this.tupletDenominator = -1;
	this.tupletNumerator = -1;
};
alphatab.model.Beat.__name__ = ["alphatab","model","Beat"];
alphatab.model.Beat.prototype = {
	previousBeat: null
	,nextBeat: null
	,index: null
	,voice: null
	,notes: null
	,minNote: null
	,maxNote: null
	,duration: null
	,automations: null
	,isRest: function() {
		return this.notes.length == 0;
	}
	,dots: null
	,fadeIn: null
	,lyrics: null
	,pop: null
	,hasRasgueado: null
	,slap: null
	,text: null
	,brushType: null
	,brushDuration: null
	,tupletDenominator: null
	,tupletNumerator: null
	,whammyBarPoints: null
	,hasWhammyBar: function() {
		return this.whammyBarPoints.length > 0;
	}
	,vibrato: null
	,chord: null
	,hasChord: function() {
		return this.chord != null;
	}
	,graceType: null
	,pickStroke: null
	,isTremolo: function() {
		return this.tremoloSpeed >= 0;
	}
	,tremoloSpeed: null
	,start: null
	,calculateDuration: function() {
		var ticks = alphatab.audio.MidiUtils.durationToTicks(this.duration);
		if(this.dots == 2) ticks = alphatab.audio.MidiUtils.applyDot(ticks,true); else if(this.dots == 1) ticks = alphatab.audio.MidiUtils.applyDot(ticks,false);
		if(this.tupletDenominator > 0 && this.tupletNumerator >= 0) ticks = alphatab.audio.MidiUtils.applyTuplet(ticks,this.tupletNumerator,this.tupletDenominator);
		return ticks;
	}
	,addNote: function(note) {
		note.beat = this;
		this.notes.push(note);
		if(this.minNote == null || this.minNote.realValue() > note.realValue()) this.minNote = note;
		if(this.maxNote == null || this.maxNote.realValue() < note.realValue()) this.maxNote = note;
	}
	,getAutomation: function(type) {
		var _g = 0, _g1 = this.automations;
		while(_g < _g1.length) {
			var a = _g1[_g];
			++_g;
			if(a.type == type) return a;
		}
		return null;
	}
	,getNoteOnString: function(string) {
		var _g = 0, _g1 = this.notes;
		while(_g < _g1.length) {
			var n = _g1[_g];
			++_g;
			if(n.string == string) return n;
		}
		return null;
	}
	,__class__: alphatab.model.Beat
}
alphatab.model.BendPoint = $hxClasses["alphatab.model.BendPoint"] = function(offset,value) {
	if(value == null) value = 0;
	if(offset == null) offset = 0;
	this.offset = offset;
	this.value = value;
};
alphatab.model.BendPoint.__name__ = ["alphatab","model","BendPoint"];
alphatab.model.BendPoint.prototype = {
	offset: null
	,value: null
	,__class__: alphatab.model.BendPoint
}
alphatab.model.BrushType = $hxClasses["alphatab.model.BrushType"] = { __ename__ : ["alphatab","model","BrushType"], __constructs__ : ["None","BrushUp","BrushDown","ArpeggioUp","ArpeggioDown"] }
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
alphatab.model.Chord = $hxClasses["alphatab.model.Chord"] = function() {
	this.strings = new Array();
};
alphatab.model.Chord.__name__ = ["alphatab","model","Chord"];
alphatab.model.Chord.prototype = {
	name: null
	,firstFret: null
	,strings: null
	,__class__: alphatab.model.Chord
}
alphatab.model.Clef = $hxClasses["alphatab.model.Clef"] = { __ename__ : ["alphatab","model","Clef"], __constructs__ : ["C3","C4","F4","G2"] }
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
alphatab.model.Duration = $hxClasses["alphatab.model.Duration"] = { __ename__ : ["alphatab","model","Duration"], __constructs__ : ["Whole","Half","Quarter","Eighth","Sixteenth","ThirtySecond","SixtyFourth"] }
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
alphatab.model.DynamicValue = $hxClasses["alphatab.model.DynamicValue"] = { __ename__ : ["alphatab","model","DynamicValue"], __constructs__ : ["PPP","PP","P","MP","MF","F","FF","FFF"] }
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
alphatab.model.GraceType = $hxClasses["alphatab.model.GraceType"] = { __ename__ : ["alphatab","model","GraceType"], __constructs__ : ["None","OnBeat","BeforeBeat"] }
alphatab.model.GraceType.None = ["None",0];
alphatab.model.GraceType.None.toString = $estr;
alphatab.model.GraceType.None.__enum__ = alphatab.model.GraceType;
alphatab.model.GraceType.OnBeat = ["OnBeat",1];
alphatab.model.GraceType.OnBeat.toString = $estr;
alphatab.model.GraceType.OnBeat.__enum__ = alphatab.model.GraceType;
alphatab.model.GraceType.BeforeBeat = ["BeforeBeat",2];
alphatab.model.GraceType.BeforeBeat.toString = $estr;
alphatab.model.GraceType.BeforeBeat.__enum__ = alphatab.model.GraceType;
alphatab.model.HarmonicType = $hxClasses["alphatab.model.HarmonicType"] = { __ename__ : ["alphatab","model","HarmonicType"], __constructs__ : ["None","Natural","Artificial","Pinch","Tap","Semi","Feedback"] }
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
alphatab.model.MasterBar = $hxClasses["alphatab.model.MasterBar"] = function() {
	this.alternateEndings = 0;
	this.repeatCount = 0;
	this.index = 0;
	this.keySignature = 0;
	this.isDoubleBar = false;
	this.isRepeatStart = false;
	this.repeatCount = 0;
	this.timeSignatureDenominator = 4;
	this.timeSignatureNumerator = 4;
	this.tripletFeel = alphatab.model.TripletFeel.NoTripletFeel;
	this.start = 0;
};
alphatab.model.MasterBar.__name__ = ["alphatab","model","MasterBar"];
alphatab.model.MasterBar.prototype = {
	alternateEndings: null
	,nextMasterBar: null
	,previousMasterBar: null
	,index: null
	,keySignature: null
	,isDoubleBar: null
	,isRepeatStart: null
	,isRepeatEnd: function() {
		return this.repeatCount > 0;
	}
	,repeatCount: null
	,timeSignatureDenominator: null
	,timeSignatureNumerator: null
	,tripletFeel: null
	,section: null
	,isSectionStart: function() {
		return this.section != null;
	}
	,tempoAutomation: null
	,volumeAutomation: null
	,score: null
	,start: null
	,calculateDuration: function() {
		return this.timeSignatureNumerator * alphatab.audio.MidiUtils.valueToTicks(this.timeSignatureDenominator);
	}
	,__class__: alphatab.model.MasterBar
}
alphatab.model.ModelUtils = $hxClasses["alphatab.model.ModelUtils"] = function() { }
alphatab.model.ModelUtils.__name__ = ["alphatab","model","ModelUtils"];
alphatab.model.ModelUtils.getDurationValue = function(duration) {
	switch( (duration)[1] ) {
	case 0:
		return 1;
	case 1:
		return 2;
	case 2:
		return 4;
	case 3:
		return 8;
	case 4:
		return 16;
	case 5:
		return 32;
	case 6:
		return 64;
	default:
		return 1;
	}
}
alphatab.model.ModelUtils.getDurationIndex = function(duration) {
	var index = 0;
	var value = alphatab.model.ModelUtils.getDurationValue(duration);
	while((value = value >> 1) > 0) index++;
	return index;
}
alphatab.model.ModelUtils.keySignatureIsFlat = function(ks) {
	return ks < 0;
}
alphatab.model.ModelUtils.keySignatureIsNatural = function(ks) {
	return ks == 0;
}
alphatab.model.ModelUtils.keySignatureIsSharp = function(ks) {
	return ks > 0;
}
alphatab.model.ModelUtils.getClefIndex = function(clef) {
	switch( (clef)[1] ) {
	case 0:
		return 0;
	case 1:
		return 1;
	case 2:
		return 2;
	case 3:
		return 3;
	default:
		return 0;
	}
}
alphatab.model.Note = $hxClasses["alphatab.model.Note"] = function() {
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
};
alphatab.model.Note.__name__ = ["alphatab","model","Note"];
alphatab.model.Note.prototype = {
	accentuated: null
	,bendPoints: null
	,hasBend: function() {
		return this.bendPoints.length > 0;
	}
	,fret: null
	,isGhost: null
	,string: null
	,isHammerPullDestination: null
	,isHammerPullOrigin: null
	,harmonicValue: null
	,harmonicType: null
	,isLetRing: null
	,isPalmMute: null
	,isDead: null
	,slideType: null
	,vibrato: null
	,isStaccato: null
	,tapping: null
	,isTieOrigin: null
	,isTieDestination: null
	,leftHandFinger: null
	,rightHandFinger: null
	,isFingering: null
	,trillFret: null
	,isTrill: function() {
		return this.trillFret >= 0;
	}
	,trillSpeed: null
	,durationPercent: null
	,beat: null
	,dynamicValue: null
	,realValue: function() {
		return this.fret + this.beat.voice.bar.track.tuning[this.string];
	}
	,__class__: alphatab.model.Note
}
alphatab.model.PickStrokeType = $hxClasses["alphatab.model.PickStrokeType"] = { __ename__ : ["alphatab","model","PickStrokeType"], __constructs__ : ["None","Up","Down"] }
alphatab.model.PickStrokeType.None = ["None",0];
alphatab.model.PickStrokeType.None.toString = $estr;
alphatab.model.PickStrokeType.None.__enum__ = alphatab.model.PickStrokeType;
alphatab.model.PickStrokeType.Up = ["Up",1];
alphatab.model.PickStrokeType.Up.toString = $estr;
alphatab.model.PickStrokeType.Up.__enum__ = alphatab.model.PickStrokeType;
alphatab.model.PickStrokeType.Down = ["Down",2];
alphatab.model.PickStrokeType.Down.toString = $estr;
alphatab.model.PickStrokeType.Down.__enum__ = alphatab.model.PickStrokeType;
alphatab.model.PlaybackInformation = $hxClasses["alphatab.model.PlaybackInformation"] = function() {
};
alphatab.model.PlaybackInformation.__name__ = ["alphatab","model","PlaybackInformation"];
alphatab.model.PlaybackInformation.prototype = {
	volume: null
	,balance: null
	,port: null
	,program: null
	,primaryChannel: null
	,secondaryChannel: null
	,isMute: null
	,isSolo: null
	,__class__: alphatab.model.PlaybackInformation
}
alphatab.model.Score = $hxClasses["alphatab.model.Score"] = function() {
	this.masterBars = new Array();
	this.tracks = new Array();
};
alphatab.model.Score.__name__ = ["alphatab","model","Score"];
alphatab.model.Score.prototype = {
	album: null
	,artist: null
	,copyright: null
	,instructions: null
	,music: null
	,notices: null
	,subTitle: null
	,title: null
	,words: null
	,tab: null
	,tempo: null
	,tempoLabel: null
	,masterBars: null
	,tracks: null
	,addMasterBar: function(bar) {
		bar.score = this;
		bar.index = this.masterBars.length;
		if(this.masterBars.length != 0) {
			bar.previousMasterBar = this.masterBars[this.masterBars.length - 1];
			bar.previousMasterBar.nextMasterBar = bar;
			bar.start = bar.previousMasterBar.start + bar.previousMasterBar.calculateDuration();
		}
		this.masterBars.push(bar);
	}
	,addTrack: function(track) {
		track.score = this;
		track.index = this.tracks.length;
		this.tracks.push(track);
	}
	,__class__: alphatab.model.Score
}
alphatab.model.Section = $hxClasses["alphatab.model.Section"] = function() {
};
alphatab.model.Section.__name__ = ["alphatab","model","Section"];
alphatab.model.Section.prototype = {
	marker: null
	,text: null
	,__class__: alphatab.model.Section
}
alphatab.model.SlideType = $hxClasses["alphatab.model.SlideType"] = { __ename__ : ["alphatab","model","SlideType"], __constructs__ : ["None","Shift","Legato","IntoFromBelow","IntoFromAbove","OutUp","OutDown"] }
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
alphatab.model.Track = $hxClasses["alphatab.model.Track"] = function() {
	this.tuning = new Array();
	this.bars = new Array();
	this.playbackInfo = new alphatab.model.PlaybackInformation();
};
alphatab.model.Track.__name__ = ["alphatab","model","Track"];
alphatab.model.Track.prototype = {
	capo: null
	,index: null
	,name: null
	,shortName: null
	,tuning: null
	,tuningName: null
	,playbackInfo: null
	,isPercussion: null
	,score: null
	,bars: null
	,addBar: function(bar) {
		bar.track = this;
		bar.index = this.bars.length;
		if(this.bars.length > 0) {
			bar.previousBar = this.bars[this.bars.length - 1];
			bar.previousBar.nextBar = bar;
		}
		this.bars.push(bar);
	}
	,__class__: alphatab.model.Track
}
alphatab.model.TripletFeel = $hxClasses["alphatab.model.TripletFeel"] = { __ename__ : ["alphatab","model","TripletFeel"], __constructs__ : ["NoTripletFeel","Triplet16th","Triplet8th","Dotted16th","Dotted8th","Scottish16th","Scottish8th"] }
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
alphatab.model.Tuning = $hxClasses["alphatab.model.Tuning"] = function(name,tuning,isStandard) {
	this.name = name;
	this.tuning = tuning;
	this.isStandard = isStandard;
};
alphatab.model.Tuning.__name__ = ["alphatab","model","Tuning"];
alphatab.model.Tuning._sevenStrings = null;
alphatab.model.Tuning._sixStrings = null;
alphatab.model.Tuning._fiveStrings = null;
alphatab.model.Tuning._fourStrings = null;
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
		if(note == "c") base = 0; else if(note == "db") base = 1; else if(note == "d") base = 2; else if(note == "eb") base = 3; else if(note == "e") base = 4; else if(note == "f") base = 5; else if(note == "gb") base = 6; else if(note == "g") base = 7; else if(note == "ab") base = 8; else if(note == "a") base = 9; else if(note == "bb") base = 10; else if(note == "b") base = 11; else return -1;
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
			if(strings[i] != tuning.tuning[i]) {
				equals = false;
				break;
			}
		}
		if(equals) return tuning;
	}
	return null;
}
alphatab.model.Tuning.prototype = {
	isStandard: null
	,name: null
	,tuning: null
	,__class__: alphatab.model.Tuning
}
alphatab.model.VibratoType = $hxClasses["alphatab.model.VibratoType"] = { __ename__ : ["alphatab","model","VibratoType"], __constructs__ : ["None","Slight","Wide"] }
alphatab.model.VibratoType.None = ["None",0];
alphatab.model.VibratoType.None.toString = $estr;
alphatab.model.VibratoType.None.__enum__ = alphatab.model.VibratoType;
alphatab.model.VibratoType.Slight = ["Slight",1];
alphatab.model.VibratoType.Slight.toString = $estr;
alphatab.model.VibratoType.Slight.__enum__ = alphatab.model.VibratoType;
alphatab.model.VibratoType.Wide = ["Wide",2];
alphatab.model.VibratoType.Wide.toString = $estr;
alphatab.model.VibratoType.Wide.__enum__ = alphatab.model.VibratoType;
alphatab.model.Voice = $hxClasses["alphatab.model.Voice"] = function() {
	this.beats = new Array();
};
alphatab.model.Voice.__name__ = ["alphatab","model","Voice"];
alphatab.model.Voice.prototype = {
	index: null
	,bar: null
	,beats: null
	,addBeat: function(beat) {
		beat.voice = this;
		beat.index = this.beats.length;
		if(this.beats.length > 0) {
			beat.previousBeat = this.beats[this.beats.length - 1];
			beat.previousBeat.nextBeat = beat;
			beat.start = beat.previousBeat.start + beat.previousBeat.calculateDuration();
		}
		this.beats.push(beat);
	}
	,isEmpty: function() {
		return this.beats.length == 0;
	}
	,__class__: alphatab.model.Voice
}
if(!alphatab.platform) alphatab.platform = {}
alphatab.platform.ICanvas = $hxClasses["alphatab.platform.ICanvas"] = function() { }
alphatab.platform.ICanvas.__name__ = ["alphatab","platform","ICanvas"];
alphatab.platform.ICanvas.prototype = {
	getWidth: null
	,setWidth: null
	,getHeight: null
	,setHeight: null
	,setColor: null
	,setLineWidth: null
	,clear: null
	,fillRect: null
	,strokeRect: null
	,beginPath: null
	,closePath: null
	,moveTo: null
	,lineTo: null
	,quadraticCurveTo: null
	,bezierCurveTo: null
	,rect: null
	,circle: null
	,fill: null
	,stroke: null
	,setFont: null
	,setTextAlign: null
	,fillText: null
	,strokeText: null
	,measureText: null
	,__class__: alphatab.platform.ICanvas
}
alphatab.platform.IFileLoader = $hxClasses["alphatab.platform.IFileLoader"] = function() { }
alphatab.platform.IFileLoader.__name__ = ["alphatab","platform","IFileLoader"];
alphatab.platform.IFileLoader.prototype = {
	loadBinary: null
	,loadBinaryAsync: null
	,__class__: alphatab.platform.IFileLoader
}
alphatab.platform.PlatformFactory = $hxClasses["alphatab.platform.PlatformFactory"] = function() { }
alphatab.platform.PlatformFactory.__name__ = ["alphatab","platform","PlatformFactory"];
alphatab.platform.PlatformFactory.getLoader = function() {
	return new alphatab.platform.js.JsFileLoader();
}
alphatab.platform.PlatformFactory.getCanvas = function(object) {
	if(object == alphatab.platform.PlatformFactory.SVG_CANVAS) return new alphatab.platform.svg.SvgCanvas();
	return new alphatab.platform.js.Html5Canvas(object);
}
if(!alphatab.platform.js) alphatab.platform.js = {}
alphatab.platform.js.Html5Canvas = $hxClasses["alphatab.platform.js.Html5Canvas"] = function(dom) {
	this._canvas = dom;
	this._context = dom.getContext("2d");
	this._context.textBaseline = "top";
};
alphatab.platform.js.Html5Canvas.__name__ = ["alphatab","platform","js","Html5Canvas"];
alphatab.platform.js.Html5Canvas.__interfaces__ = [alphatab.platform.ICanvas];
alphatab.platform.js.Html5Canvas.prototype = {
	_canvas: null
	,_context: null
	,_width: null
	,_height: null
	,getWidth: function() {
		return this._canvas.offsetWidth;
	}
	,getHeight: function() {
		return this._canvas.offsetHeight;
	}
	,setWidth: function(width) {
		var lineWidth = this._context.lineWidth;
		this._canvas.width = width;
		this._context = this._canvas.getContext("2d");
		this._context.textBaseline = "top";
		this._context.lineWidth = lineWidth;
		this._width = width;
	}
	,setHeight: function(height) {
		var lineWidth = this._context.lineWidth;
		this._canvas.height = height;
		this._context = this._canvas.getContext("2d");
		this._context.textBaseline = "top";
		this._context.lineWidth = lineWidth;
		this._height = height;
	}
	,setColor: function(color) {
		this._context.strokeStyle = color.toRgbaString();
		this._context.fillStyle = color.toRgbaString();
	}
	,setLineWidth: function(value) {
		this._context.lineWidth = value;
	}
	,clear: function() {
		var lineWidth = this._context.lineWidth;
		this._canvas.width = this._canvas.width;
		this._context.lineWidth = lineWidth;
	}
	,fillRect: function(x,y,w,h) {
		this._context.fillRect(x - 0.5,y - 0.5,w,h);
	}
	,strokeRect: function(x,y,w,h) {
		this._context.strokeRect(x - 0.5,y - 0.5,w,h);
	}
	,beginPath: function() {
		this._context.beginPath();
	}
	,closePath: function() {
		this._context.closePath();
	}
	,moveTo: function(x,y) {
		this._context.moveTo(x - 0.5,y - 0.5);
	}
	,lineTo: function(x,y) {
		this._context.lineTo(x - 0.5,y - 0.5);
	}
	,quadraticCurveTo: function(cpx,cpy,x,y) {
		this._context.quadraticCurveTo(cpx,cpy,x,y);
	}
	,bezierCurveTo: function(cp1x,cp1y,cp2x,cp2y,x,y) {
		this._context.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y);
	}
	,circle: function(x,y,radius) {
		this._context.arc(x,y,radius,0,Math.PI * 2,true);
	}
	,rect: function(x,y,w,h) {
		this._context.rect(x,y,w,h);
	}
	,fill: function() {
		this._context.fill();
	}
	,stroke: function() {
		this._context.stroke();
	}
	,setFont: function(font) {
		this._context.font = font.toCssString();
	}
	,setTextAlign: function(value) {
		switch( (value)[1] ) {
		case 0:
			this._context.textAlign = "left";
			break;
		case 1:
			this._context.textAlign = "center";
			break;
		case 2:
			this._context.textAlign = "right";
			break;
		}
	}
	,fillText: function(text,x,y) {
		this._context.fillText(text,x,y);
	}
	,strokeText: function(text,x,y) {
		this._context.strokeText(text,x,y);
	}
	,measureText: function(text) {
		return this._context.measureText(text).width;
	}
	,__class__: alphatab.platform.js.Html5Canvas
}
alphatab.platform.js.JsFileLoader = $hxClasses["alphatab.platform.js.JsFileLoader"] = function() {
};
alphatab.platform.js.JsFileLoader.__name__ = ["alphatab","platform","js","JsFileLoader"];
alphatab.platform.js.JsFileLoader.__interfaces__ = [alphatab.platform.IFileLoader];
alphatab.platform.js.JsFileLoader.isIE = function() {
	var agent = navigator.userAgent;
	return agent.indexOf("MSIE") != -1;
}
alphatab.platform.js.JsFileLoader.getBytes = function(s) {
	var a = new Array();
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		a.push(HxOverrides.cca(s,i) & 255);
	}
	return haxe.io.Bytes.ofData(a);
}
alphatab.platform.js.JsFileLoader.prototype = {
	loadBinary: function(path) {
		if(alphatab.platform.js.JsFileLoader.isIE()) {
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
	,loadBinaryAsync: function(path,success,error) {
		if(alphatab.platform.js.JsFileLoader.isIE()) {
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
					error("Error loading file: " + Std.string(e));
				}
			};
			xhr.open("GET",path,true);
			xhr.send(null);
		}
	}
	,__class__: alphatab.platform.js.JsFileLoader
}
if(!alphatab.platform.model) alphatab.platform.model = {}
alphatab.platform.model.Color = $hxClasses["alphatab.platform.model.Color"] = function(r,g,b,a) {
	if(a == null) a = 255;
	this._higherBits = (a & 255) << 8 | r & 255;
	this._lowerBits = (g & 255) << 8 | b & 255;
};
alphatab.platform.model.Color.__name__ = ["alphatab","platform","model","Color"];
alphatab.platform.model.Color.prototype = {
	_lowerBits: null
	,_higherBits: null
	,getA: function() {
		return this._higherBits >> 8 & 255;
	}
	,getR: function() {
		return this._higherBits & 255;
	}
	,getG: function() {
		return this._lowerBits >> 8 & 255;
	}
	,getB: function() {
		return this._lowerBits & 255;
	}
	,toHexString: function() {
		return "#" + StringTools.hex(this.getA(),2) + StringTools.hex(this.getR(),2) + StringTools.hex(this.getG(),2) + StringTools.hex(this.getB(),2);
	}
	,toRgbaString: function() {
		return "rgba(" + this.getR() + "," + this.getG() + "," + this.getB() + "," + this.getA() / 255.0 + ")";
	}
	,__class__: alphatab.platform.model.Color
}
alphatab.platform.model.Font = $hxClasses["alphatab.platform.model.Font"] = function(family,size,style) {
	if(style == null) style = 0;
	this._family = family;
	this._size = size;
	this._style = style;
};
alphatab.platform.model.Font.__name__ = ["alphatab","platform","model","Font"];
alphatab.platform.model.Font.prototype = {
	_family: null
	,_size: null
	,_style: null
	,getFamily: function() {
		return this._family;
	}
	,getSize: function() {
		return this._size;
	}
	,getStyle: function() {
		return this._style;
	}
	,isBold: function() {
		return (this.getStyle() & 1) != 0;
	}
	,isItalic: function() {
		return (this.getStyle() & 2) != 0;
	}
	,toCssString: function() {
		var buf = new StringBuf();
		if((this.getStyle() & 1) != 0) buf.b[buf.b.length] = "bold ";
		if((this.getStyle() & 2) != 0) buf.b[buf.b.length] = "italic ";
		buf.add(this._size);
		buf.b[buf.b.length] = "px";
		buf.b[buf.b.length] = "'";
		buf.add(this._family);
		buf.b[buf.b.length] = "'";
		return buf.b.join("");
	}
	,__class__: alphatab.platform.model.Font
}
alphatab.platform.model.TextAlign = $hxClasses["alphatab.platform.model.TextAlign"] = { __ename__ : ["alphatab","platform","model","TextAlign"], __constructs__ : ["Left","Center","Right"] }
alphatab.platform.model.TextAlign.Left = ["Left",0];
alphatab.platform.model.TextAlign.Left.toString = $estr;
alphatab.platform.model.TextAlign.Left.__enum__ = alphatab.platform.model.TextAlign;
alphatab.platform.model.TextAlign.Center = ["Center",1];
alphatab.platform.model.TextAlign.Center.toString = $estr;
alphatab.platform.model.TextAlign.Center.__enum__ = alphatab.platform.model.TextAlign;
alphatab.platform.model.TextAlign.Right = ["Right",2];
alphatab.platform.model.TextAlign.Right.toString = $estr;
alphatab.platform.model.TextAlign.Right.__enum__ = alphatab.platform.model.TextAlign;
if(!alphatab.platform.svg) alphatab.platform.svg = {}
alphatab.platform.svg.FontSizes = $hxClasses["alphatab.platform.svg.FontSizes"] = function() { }
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
		var code = (Math.min(data.length - 1,HxOverrides.cca(s,i)) | 0) - alphatab.platform.svg.FontSizes.CONTROL_CHARS;
		if(code >= 0) {
			var charSize = data[code];
			stringSize += data[code] * size / dataSize | 0;
		}
	}
	return stringSize;
}
alphatab.platform.svg.SupportedFonts = $hxClasses["alphatab.platform.svg.SupportedFonts"] = { __ename__ : ["alphatab","platform","svg","SupportedFonts"], __constructs__ : ["TimesNewRoman","Arial"] }
alphatab.platform.svg.SupportedFonts.TimesNewRoman = ["TimesNewRoman",0];
alphatab.platform.svg.SupportedFonts.TimesNewRoman.toString = $estr;
alphatab.platform.svg.SupportedFonts.TimesNewRoman.__enum__ = alphatab.platform.svg.SupportedFonts;
alphatab.platform.svg.SupportedFonts.Arial = ["Arial",1];
alphatab.platform.svg.SupportedFonts.Arial.toString = $estr;
alphatab.platform.svg.SupportedFonts.Arial.__enum__ = alphatab.platform.svg.SupportedFonts;
alphatab.platform.svg.SvgCanvas = $hxClasses["alphatab.platform.svg.SvgCanvas"] = function() {
	this._buffer = new StringBuf();
	this._currentPath = new StringBuf();
	this._currentPathIsEmpty = true;
	this._color = new alphatab.platform.model.Color(255,255,255);
	this._lineWidth = 1;
	this._width = 0;
	this._height = 0;
	this._font = new alphatab.platform.model.Font("sans-serif",10);
	this._textAlign = alphatab.platform.model.TextAlign.Left;
};
alphatab.platform.svg.SvgCanvas.__name__ = ["alphatab","platform","svg","SvgCanvas"];
alphatab.platform.svg.SvgCanvas.__interfaces__ = [alphatab.platform.ICanvas];
alphatab.platform.svg.SvgCanvas.prototype = {
	_buffer: null
	,_currentPath: null
	,_currentPathIsEmpty: null
	,_width: null
	,_height: null
	,writeTo: function(stream,includeWrapper,className) {
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
	,toSvg: function(includeWrapper,className) {
		var out = new haxe.io.BytesOutput();
		this.writeTo(out,includeWrapper,className);
		out.flush();
		return out.getBytes().toString();
	}
	,getWidth: function() {
		return this._width;
	}
	,getHeight: function() {
		return this._height;
	}
	,setWidth: function(width) {
		this._width = width;
	}
	,setHeight: function(height) {
		this._height = height;
	}
	,_color: null
	,setColor: function(color) {
		this._color = color;
	}
	,_lineWidth: null
	,setLineWidth: function(value) {
		this._lineWidth = value;
	}
	,clear: function() {
		this._buffer = new StringBuf();
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,fillRect: function(x,y,w,h) {
		this._buffer.add("<rect x=\"");
		this._buffer.add(x);
		this._buffer.add("\" y=\"");
		this._buffer.add(y);
		this._buffer.add("\" width=\"");
		this._buffer.add(w);
		this._buffer.add("\" height=\"");
		this._buffer.add(h);
		this._buffer.add("\" style=\"fill:");
		this._buffer.add(this._color.toRgbaString());
		this._buffer.add(";\" />\n");
	}
	,strokeRect: function(x,y,w,h) {
		this._buffer.add("<rect x=\"");
		this._buffer.add(x);
		this._buffer.add("\" y=\"");
		this._buffer.add(y);
		this._buffer.add("\" width=\"");
		this._buffer.add(w);
		this._buffer.add("\" height=\"");
		this._buffer.add(h);
		this._buffer.add("\" style=\"stroke:");
		this._buffer.add(this._color.toRgbaString());
		this._buffer.add("; stroke-width:");
		this._buffer.add(this._lineWidth);
		this._buffer.add(";\" />\n");
	}
	,beginPath: function() {
	}
	,closePath: function() {
		this._currentPath.add(" z");
	}
	,moveTo: function(x,y) {
		this._currentPath.add(" M");
		this._currentPath.add(x);
		this._currentPath.add(",");
		this._currentPath.add(y);
	}
	,lineTo: function(x,y) {
		this._currentPathIsEmpty = false;
		this._currentPath.add(" L");
		this._currentPath.add(x);
		this._currentPath.add(",");
		this._currentPath.add(y);
	}
	,quadraticCurveTo: function(cpx,cpy,x,y) {
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
	,bezierCurveTo: function(cp1x,cp1y,cp2x,cp2y,x,y) {
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
	,circle: function(x,y,radius) {
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
	,rect: function(x,y,w,h) {
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
	,fill: function() {
		var path = this._currentPath.b.join("");
		if(!this._currentPathIsEmpty) {
			this._buffer.add("<path d=\"");
			this._buffer.add(this._currentPath.b.join(""));
			this._buffer.add("\" style=\"fill:");
			this._buffer.add(this._color.toRgbaString());
			this._buffer.add("\" stroke=\"none\"/>\n");
		}
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,stroke: function() {
		var path = this._currentPath.b.join("");
		if(!this._currentPathIsEmpty) {
			this._buffer.add("<path d=\"");
			this._buffer.add(this._currentPath.b.join(""));
			this._buffer.add("\" style=\"stroke:");
			this._buffer.add(this._color.toRgbaString());
			this._buffer.add("; stroke-width:");
			this._buffer.add(this._lineWidth);
			this._buffer.add(";\" fill=\"none\" />\n");
		}
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,_font: null
	,setFont: function(font) {
		this._font = font;
	}
	,_textAlign: null
	,setTextAlign: function(textAlign) {
		this._textAlign = textAlign;
	}
	,fillText: function(text,x,y) {
		this._buffer.add("<text x=\"");
		this._buffer.add(x);
		this._buffer.add("\" y=\"");
		this._buffer.add(y);
		this._buffer.add("\" style=\"font:");
		this._buffer.add(this._font.toCssString());
		this._buffer.add("; fill:");
		this._buffer.add(this._color.toRgbaString());
		this._buffer.add(";\" ");
		this._buffer.add(" dominant-baseline=\"");
		this._buffer.add("top");
		this._buffer.add("\" text-anchor=\"");
		this._buffer.add(this.getSvgTextAlignment());
		this._buffer.add("\">\n");
		this._buffer.add(text);
		this._buffer.add("</text>\n");
	}
	,strokeText: function(text,x,y) {
		this._buffer.add("<text x=\"");
		this._buffer.add(x);
		this._buffer.add("\" y=\"");
		this._buffer.add(y);
		this._buffer.add("\" style=\"font:");
		this._buffer.add(this._font.toCssString());
		this._buffer.add("\" stroke:");
		this._buffer.add(this._color.toRgbaString());
		this._buffer.add("; stroke-width:");
		this._buffer.add(this._lineWidth);
		this._buffer.add(";\" ");
		this._buffer.add(" dominant-baseline=\"");
		this._buffer.add("top");
		this._buffer.add("\" text-anchor=\"");
		this._buffer.add(this.getSvgTextAlignment());
		this._buffer.add("\">\n");
		this._buffer.add(text);
		this._buffer.add("</text>\n");
	}
	,getSvgTextAlignment: function() {
		switch( (this._textAlign)[1] ) {
		case 0:
			return "start";
		case 1:
			return "middle";
		case 2:
			return "end";
		default:
			return "start";
		}
	}
	,getSvgBaseLine: function() {
		return "top";
	}
	,measureText: function(text) {
		var font = alphatab.platform.svg.SupportedFonts.Arial;
		if(this._font.getFamily().indexOf("Times") >= 0) font = alphatab.platform.svg.SupportedFonts.TimesNewRoman;
		return alphatab.platform.svg.FontSizes.measureString(text,font,this._font.getSize());
	}
	,__class__: alphatab.platform.svg.SvgCanvas
}
if(!alphatab.rendering) alphatab.rendering = {}
alphatab.rendering.BarRendererBase = $hxClasses["alphatab.rendering.BarRendererBase"] = function(bar) {
	this._bar = bar;
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.index = 0;
};
alphatab.rendering.BarRendererBase.__name__ = ["alphatab","rendering","BarRendererBase"];
alphatab.rendering.BarRendererBase.prototype = {
	stave: null
	,x: null
	,y: null
	,width: null
	,height: null
	,index: null
	,_bar: null
	,applyBarSpacing: function(spacing) {
	}
	,getScale: function() {
		return this.stave.staveGroup.layout.renderer.scale;
	}
	,getLayout: function() {
		return this.stave.staveGroup.layout;
	}
	,getResources: function() {
		return this.stave.staveGroup.layout.renderer.renderingResources;
	}
	,isFirstOfLine: function() {
		return this.index == 0;
	}
	,isLastOfLine: function() {
		return this.index == this.stave.barRenderers.length - 1;
	}
	,isLast: function() {
		return this._bar.index == this._bar.track.bars.length - 1;
	}
	,getTopPadding: function() {
		return 0;
	}
	,getBottomPadding: function() {
		return 0;
	}
	,doLayout: function() {
	}
	,paint: function(cx,cy,canvas) {
	}
	,__class__: alphatab.rendering.BarRendererBase
}
alphatab.rendering.BarRendererFactory = $hxClasses["alphatab.rendering.BarRendererFactory"] = function() {
};
alphatab.rendering.BarRendererFactory.__name__ = ["alphatab","rendering","BarRendererFactory"];
alphatab.rendering.BarRendererFactory.prototype = {
	create: function(bar) {
		return null;
	}
	,__class__: alphatab.rendering.BarRendererFactory
}
alphatab.rendering.Glyph = $hxClasses["alphatab.rendering.Glyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
};
alphatab.rendering.Glyph.__name__ = ["alphatab","rendering","Glyph"];
alphatab.rendering.Glyph.prototype = {
	index: null
	,x: null
	,y: null
	,width: null
	,renderer: null
	,applyGlyphSpacing: function(spacing) {
		var oldWidth = this.renderer.width - spacing * this.renderer.glyphs.length;
		if(this.index == 0) this.x = 0; else this.x = this.renderer.glyphs[this.index - 1].x + this.renderer.glyphs[this.index - 1].width;
		this.width += spacing;
	}
	,getScale: function() {
		return this.renderer.stave.staveGroup.layout.renderer.scale;
	}
	,doLayout: function() {
	}
	,paint: function(cx,cy,canvas) {
	}
	,__class__: alphatab.rendering.Glyph
}
alphatab.rendering.GlyphBarRenderer = $hxClasses["alphatab.rendering.GlyphBarRenderer"] = function(bar) {
	alphatab.rendering.BarRendererBase.call(this,bar);
	this.glyphs = new Array();
};
alphatab.rendering.GlyphBarRenderer.__name__ = ["alphatab","rendering","GlyphBarRenderer"];
alphatab.rendering.GlyphBarRenderer.__super__ = alphatab.rendering.BarRendererBase;
alphatab.rendering.GlyphBarRenderer.prototype = $extend(alphatab.rendering.BarRendererBase.prototype,{
	glyphs: null
	,doLayout: function() {
		this.createGlyphs();
	}
	,createGlyphs: function() {
	}
	,addGlyph: function(glyph) {
		glyph.x = this.width + glyph.x;
		glyph.index = this.glyphs.length;
		glyph.renderer = this;
		glyph.doLayout();
		if(glyph.x + glyph.width > this.width) this.width = glyph.x + glyph.width;
		this.glyphs.push(glyph);
	}
	,applyBarSpacing: function(spacing) {
		var oldWidth = this.width;
		this.width += spacing;
		var glyphSpacing = spacing / this.glyphs.length | 0;
		var _g = 0, _g1 = this.glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.applyGlyphSpacing(glyphSpacing);
		}
	}
	,paint: function(cx,cy,canvas) {
		this.paintBackground(cx,cy,canvas);
		var _g = 0, _g1 = this.glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.paint(cx + this.x,cy + this.y,canvas);
		}
	}
	,paintBackground: function(cx,cy,canvas) {
	}
	,__class__: alphatab.rendering.GlyphBarRenderer
});
alphatab.rendering.RenderingResources = $hxClasses["alphatab.rendering.RenderingResources"] = function(scale) {
	this.init(scale);
};
alphatab.rendering.RenderingResources.__name__ = ["alphatab","rendering","RenderingResources"];
alphatab.rendering.RenderingResources.prototype = {
	copyrightFont: null
	,titleFont: null
	,subTitleFont: null
	,wordsFont: null
	,effectFont: null
	,tablatureFont: null
	,staveLineColor: null
	,barSeperatorColor: null
	,barNumberFont: null
	,barNumberColor: null
	,mainGlyphColor: null
	,init: function(scale) {
		var sansFont = "Arial";
		var serifFont = "Times New Roman";
		this.effectFont = new alphatab.platform.model.Font(serifFont,11 * scale,2);
		this.copyrightFont = new alphatab.platform.model.Font(sansFont,12 * scale,1);
		this.titleFont = new alphatab.platform.model.Font(serifFont,32 * scale);
		this.subTitleFont = new alphatab.platform.model.Font(serifFont,20 * scale);
		this.wordsFont = new alphatab.platform.model.Font(serifFont,15 * scale);
		this.tablatureFont = new alphatab.platform.model.Font(sansFont,12 * scale);
		this.staveLineColor = new alphatab.platform.model.Color(165,165,165);
		this.barSeperatorColor = new alphatab.platform.model.Color(34,34,17);
		this.barNumberFont = new alphatab.platform.model.Font(sansFont,11 * scale);
		this.barNumberColor = new alphatab.platform.model.Color(200,0,0);
		this.mainGlyphColor = new alphatab.platform.model.Color(0,0,0);
	}
	,__class__: alphatab.rendering.RenderingResources
}
alphatab.rendering.ScoreBarRenderer = $hxClasses["alphatab.rendering.ScoreBarRenderer"] = function(bar) {
	alphatab.rendering.GlyphBarRenderer.call(this,bar);
	this._accidentalHelper = new alphatab.rendering.utils.AccidentalHelper();
	this._beamHelpers = new Array();
};
alphatab.rendering.ScoreBarRenderer.__name__ = ["alphatab","rendering","ScoreBarRenderer"];
alphatab.rendering.ScoreBarRenderer.paintSingleBar = function(canvas,x1,y1,x2,y2,size) {
	canvas.beginPath();
	canvas.moveTo(x1,y1);
	canvas.lineTo(x2,y2);
	canvas.lineTo(x2,y2 - size);
	canvas.lineTo(x1,y1 - size);
	canvas.closePath();
	canvas.fill();
}
alphatab.rendering.ScoreBarRenderer.__super__ = alphatab.rendering.GlyphBarRenderer;
alphatab.rendering.ScoreBarRenderer.prototype = $extend(alphatab.rendering.GlyphBarRenderer.prototype,{
	_accidentalHelper: null
	,_beamHelpers: null
	,_currentBeamHelper: null
	,getTopPadding: function() {
		return this.getGlyphOverflow();
	}
	,getBottomPadding: function() {
		return this.getGlyphOverflow();
	}
	,getLineOffset: function() {
		return 9 * this.stave.staveGroup.layout.renderer.scale;
	}
	,doLayout: function() {
		alphatab.rendering.GlyphBarRenderer.prototype.doLayout.call(this);
		this.height = (9 * this.stave.staveGroup.layout.renderer.scale * 4 | 0) + this.getTopPadding() + this.getBottomPadding();
		if(this.index == 0) {
			this.stave.registerStaveTop(this.getGlyphOverflow());
			this.stave.registerStaveBottom(this.getGlyphOverflow());
		}
		var top = this.getScoreY(0);
		var bottom = this.getScoreY(8);
		var _g = 0, _g1 = this._beamHelpers;
		while(_g < _g1.length) {
			var h = _g1[_g];
			++_g;
			var maxNoteY = this.getScoreY(this.getNoteLine(h.maxNote));
			if(h.getDirection() == alphatab.rendering.utils.BeamDirection.Up) maxNoteY -= this.getStemSize(h.maxDuration);
			if(maxNoteY < top) this.stave.registerOverflowTop(Math.abs(maxNoteY) | 0);
			var minNoteY = this.getScoreY(this.getNoteLine(h.minNote));
			if(h.getDirection() == alphatab.rendering.utils.BeamDirection.Down) minNoteY += this.getStemSize(h.maxDuration);
			if(minNoteY > bottom) this.stave.registerOverflowBottom((Math.abs(minNoteY) | 0) - bottom);
		}
	}
	,paint: function(cx,cy,canvas) {
		alphatab.rendering.GlyphBarRenderer.prototype.paint.call(this,cx,cy,canvas);
		this.paintBeams(cx,cy,canvas);
	}
	,paintBeams: function(cx,cy,canvas) {
		var _g = 0, _g1 = this._beamHelpers;
		while(_g < _g1.length) {
			var h = _g1[_g];
			++_g;
			this.paintBeamHelper(cx,cy,canvas,h);
		}
	}
	,paintBeamHelper: function(cx,cy,canvas,h) {
		if(h.beats.length == 1) this.paintFooter(cx,cy,canvas,h); else this.paintBar(cx,cy,canvas,h);
	}
	,getStemSize: function(duration) {
		var size;
		switch( (duration)[1] ) {
		case 2:
			size = 6;
			break;
		case 3:
			size = 6;
			break;
		case 4:
			size = 6;
			break;
		case 5:
			size = 7;
			break;
		case 6:
			size = 8;
			break;
		default:
			size = 0;
		}
		return this.getScoreY(size);
	}
	,calculateBeamY: function(h,x) {
		var me = this;
		var correction = 4;
		var stemSize = this.getStemSize(h.maxDuration);
		return h.calculateBeamY(stemSize,this.stave.staveGroup.layout.renderer.scale | 0,x,this.stave.staveGroup.layout.renderer.scale,function(n) {
			return me.getScoreY(me.getNoteLine(n),correction - 1);
		});
	}
	,paintBar: function(cx,cy,canvas,h) {
		var _g1 = 0, _g = h.beats.length;
		while(_g1 < _g) {
			var i = _g1++;
			var beat = h.beats[i];
			var correction = 4;
			var beatLineX = h.getBeatLineX(beat) + this.stave.staveGroup.layout.renderer.scale | 0;
			var direction = h.getDirection();
			var y1 = cy + this.y + (direction == alphatab.rendering.utils.BeamDirection.Up?this.getScoreY(this.getNoteLine(beat.minNote),correction - 1):this.getScoreY(this.getNoteLine(beat.maxNote),correction - 1));
			var y2 = cy + this.y + this.calculateBeamY(h,beatLineX);
			canvas.setColor(this.stave.staveGroup.layout.renderer.renderingResources.mainGlyphColor);
			canvas.beginPath();
			canvas.moveTo(cx + this.x + beatLineX | 0,y1);
			canvas.lineTo(cx + this.x + beatLineX | 0,y2);
			canvas.stroke();
			var brokenBarOffset = 6 * this.stave.staveGroup.layout.renderer.scale | 0;
			var barSpacing = 6 * this.stave.staveGroup.layout.renderer.scale | 0;
			var barSize = 3 * this.stave.staveGroup.layout.renderer.scale | 0;
			var barCount = alphatab.model.ModelUtils.getDurationIndex(beat.duration) - 2;
			var barStart = cy + this.y;
			if(direction == alphatab.rendering.utils.BeamDirection.Down) barSpacing = -barSpacing;
			var _g2 = 0;
			while(_g2 < barCount) {
				var barIndex = _g2++;
				var barStartX;
				var barEndX;
				var barStartY;
				var barEndY;
				var barY = barStart + barIndex * barSpacing;
				if(i < h.beats.length - 1) {
					if(this.isFullBarJoin(beat,h.beats[i + 1],barIndex)) {
						barStartX = beatLineX;
						barEndX = h.getBeatLineX(h.beats[i + 1]) + this.stave.staveGroup.layout.renderer.scale | 0;
					} else {
						barStartX = beatLineX;
						barEndX = barStartX + brokenBarOffset;
					}
					barStartY = barY + this.calculateBeamY(h,barStartX) | 0;
					barEndY = barY + this.calculateBeamY(h,barEndX) | 0;
					alphatab.rendering.ScoreBarRenderer.paintSingleBar(canvas,cx + this.x + barStartX,barStartY,cx + this.x + barEndX,barEndY,barSize);
				} else if(i > 0 && !this.isFullBarJoin(beat,h.beats[i - 1],barIndex)) {
					barStartX = beatLineX - brokenBarOffset;
					barEndX = beatLineX;
					barStartY = barY + this.calculateBeamY(h,barStartX) | 0;
					barEndY = barY + this.calculateBeamY(h,barEndX) | 0;
					alphatab.rendering.ScoreBarRenderer.paintSingleBar(canvas,cx + this.x + barStartX,barStartY,cx + this.x + barEndX,barEndY,barSize);
				}
			}
		}
	}
	,isFullBarJoin: function(a,b,barIndex) {
		return alphatab.model.ModelUtils.getDurationIndex(a.duration) - 2 - barIndex > 0 && alphatab.model.ModelUtils.getDurationIndex(b.duration) - 2 - barIndex > 0;
	}
	,paintFooter: function(cx,cy,canvas,h) {
		var beat = h.beats[0];
		var stemSize = this.getStemSize(h.maxDuration);
		var correction = 4;
		var beatLineX = h.getBeatLineX(beat) + this.stave.staveGroup.layout.renderer.scale | 0;
		var direction = h.getDirection();
		var y1 = this.getScoreY(this.getNoteLine(beat.maxNote),correction - 1);
		var y2 = this.getScoreY(this.getNoteLine(beat.minNote),correction - 1);
		var beamY;
		if(direction == alphatab.rendering.utils.BeamDirection.Down) {
			y1 += stemSize;
			beamY = y1 + 3 * this.stave.staveGroup.layout.renderer.scale | 0;
		} else {
			y2 -= stemSize;
			beamY = y2 - 6 * this.stave.staveGroup.layout.renderer.scale | 0;
		}
		canvas.setColor(this.stave.staveGroup.layout.renderer.renderingResources.mainGlyphColor);
		canvas.beginPath();
		canvas.moveTo(cx + this.x + beatLineX | 0,cy + this.y + y1);
		canvas.lineTo(cx + this.x + beatLineX | 0,cy + this.y + y2);
		canvas.stroke();
		var gx = beatLineX - this.stave.staveGroup.layout.renderer.scale | 0;
		var glyph = new alphatab.rendering.glyphs.BeamGlyph(gx,beamY,beat.duration,direction);
		glyph.renderer = this;
		glyph.doLayout();
		glyph.paint(cx + this.x,cy + this.y,canvas);
	}
	,createGlyphs: function() {
		this.createBarStartGlyphs();
		this.createStartGlyphs();
		if(this._bar.isEmpty()) this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,30 * this.stave.staveGroup.layout.renderer.scale | 0));
		var _g = 0, _g1 = this._bar.voices;
		while(_g < _g1.length) {
			var v = _g1[_g];
			++_g;
			this.createVoiceGlyphs(v);
		}
		this.createBarEndGlyphs();
	}
	,_startSpacing: null
	,createStartSpacing: function() {
		if(this._startSpacing) return;
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,2 * this.stave.staveGroup.layout.renderer.scale | 0));
		this._startSpacing = true;
	}
	,createBarStartGlyphs: function() {
		if(this._bar.getMasterBar().isRepeatStart) this.addGlyph(new alphatab.rendering.glyphs.RepeatOpenGlyph());
	}
	,createBarEndGlyphs: function() {
		if(this._bar.getMasterBar().repeatCount > 0) {
			if(this._bar.getMasterBar().repeatCount > 1) this.addGlyph(new alphatab.rendering.glyphs.RepeatCountGlyph(0,this.getScoreY(-1,-3),this._bar.getMasterBar().repeatCount + 1));
			this.addGlyph(new alphatab.rendering.glyphs.RepeatCloseGlyph(this.x,0));
		} else if(this._bar.getMasterBar().isDoubleBar) {
			this.addGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph());
			this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,3 * this.stave.staveGroup.layout.renderer.scale | 0));
			this.addGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph());
		} else if(this._bar.nextBar == null || !this._bar.nextBar.getMasterBar().isRepeatStart) this.addGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph(0,0,this._bar.index == this._bar.track.bars.length - 1));
	}
	,createStartGlyphs: function() {
		if(this.index == 0 || this._bar.clef != this._bar.previousBar.clef) {
			var offset = 0;
			switch( (this._bar.clef)[1] ) {
			case 2:
			case 0:
				offset = 2;
				break;
			case 1:
				offset = 0;
				break;
			default:
				offset = 0;
			}
			this.createStartSpacing();
			this.addGlyph(new alphatab.rendering.glyphs.ClefGlyph(0,this.getScoreY(offset,-1),this._bar.clef));
		}
		if(this._bar.previousBar == null && this._bar.getMasterBar().keySignature != 0 || this._bar.previousBar != null && this._bar.getMasterBar().keySignature != this._bar.previousBar.getMasterBar().keySignature) {
			this.createStartSpacing();
			this.createKeySignatureGlyphs();
		}
		if(this._bar.previousBar == null || this._bar.previousBar != null && this._bar.getMasterBar().timeSignatureNumerator != this._bar.previousBar.getMasterBar().timeSignatureNumerator || this._bar.previousBar != null && this._bar.getMasterBar().timeSignatureDenominator != this._bar.previousBar.getMasterBar().timeSignatureDenominator) {
			this.createStartSpacing();
			this.createTimeSignatureGlyphs();
		}
		if(this.stave.index == 0) this.addGlyph(new alphatab.rendering.glyphs.BarNumberGlyph(0,this.getScoreY(-1,-3),this._bar.index + 1)); else this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,8 * this.stave.staveGroup.layout.renderer.scale | 0,false));
	}
	,createKeySignatureGlyphs: function() {
		var offsetClef = 0;
		var currentKey = this._bar.getMasterBar().keySignature;
		var previousKey = this._bar.previousBar == null?0:this._bar.previousBar.getMasterBar().keySignature;
		switch( (this._bar.clef)[1] ) {
		case 3:
			offsetClef = 0;
			break;
		case 2:
			offsetClef = 2;
			break;
		case 0:
			offsetClef = -1;
			break;
		case 1:
			offsetClef = 1;
			break;
		}
		var naturalizeSymbols = Math.abs(previousKey) | 0;
		var previousKeyPositions = previousKey > 0?alphatab.rendering.ScoreBarRenderer.SHARP_KS_STEPS:alphatab.rendering.ScoreBarRenderer.FLAT_KS_STEPS;
		var _g = 0;
		while(_g < naturalizeSymbols) {
			var i = _g++;
			this.addGlyph(new alphatab.rendering.glyphs.NaturalizeGlyph(0,this.getScoreY(previousKeyPositions[i] + offsetClef,-2) | 0));
		}
		var offsetSymbols = currentKey <= 7?currentKey:currentKey - 7;
		if(currentKey > 0) {
			var _g1 = 0, _g = Math.abs(currentKey) | 0;
			while(_g1 < _g) {
				var i = _g1++;
				this.addGlyph(new alphatab.rendering.glyphs.SharpGlyph(0,this.getScoreY(alphatab.rendering.ScoreBarRenderer.SHARP_KS_STEPS[i] + offsetClef,-1) | 0));
			}
		} else {
			var _g1 = 0, _g = Math.abs(currentKey) | 0;
			while(_g1 < _g) {
				var i = _g1++;
				this.addGlyph(new alphatab.rendering.glyphs.FlatGlyph(0,this.getScoreY(alphatab.rendering.ScoreBarRenderer.FLAT_KS_STEPS[i] + offsetClef,-8) | 0));
			}
		}
	}
	,createTimeSignatureGlyphs: function() {
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,5 * this.stave.staveGroup.layout.renderer.scale | 0,false));
		this.addGlyph(new alphatab.rendering.glyphs.TimeSignatureGlyph(0,0,this._bar.getMasterBar().timeSignatureNumerator,this._bar.getMasterBar().timeSignatureDenominator));
	}
	,createVoiceGlyphs: function(v) {
		var _g = 0, _g1 = v.beats;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			if(!b.isRest()) {
				if(this._currentBeamHelper == null || !this._currentBeamHelper.checkBeat(b)) {
					this._currentBeamHelper = new alphatab.rendering.utils.BeamingHelper();
					this._currentBeamHelper.checkBeat(b);
					this._beamHelpers.push(this._currentBeamHelper);
				}
			}
			this.createBeatGlyphs(b);
		}
		this._currentBeamHelper = null;
	}
	,createBeatGlyphs: function(b) {
		if(!b.isRest()) {
			var i = b.notes.length - 1;
			while(i >= 0) this.createAccidentalGlyph(b.notes[i--]);
			var noteglyphs = new alphatab.rendering.glyphs.NoteChordGlyph();
			i = b.notes.length - 1;
			while(i >= 0) this.createNoteGlyph(b.notes[i--],noteglyphs);
			this.addGlyph(noteglyphs);
			this._currentBeamHelper.registerBeatLineX(b,noteglyphs.upLineX,noteglyphs.downLineX);
		} else this.createRestGlyph(b);
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,this.getBeatDurationWidth(b.duration) * this.stave.staveGroup.layout.renderer.scale | 0));
	}
	,createRestGlyph: function(b) {
		var line = 0;
		var correction = 0;
		switch( (b.duration)[1] ) {
		case 0:
			line = 2;
			correction = 8;
			break;
		case 1:
			line = 4;
			correction = 3;
			break;
		case 2:
			line = 3;
			break;
		case 3:
			line = 4;
			correction - 2;
			break;
		case 4:
			line = 2;
			correction - 2;
			break;
		case 5:
			line = 2;
			correction - 2;
			break;
		case 6:
			line = 0;
			correction - 2;
			break;
		}
		var y = this.getScoreY(line,correction);
		this.addGlyph(new alphatab.rendering.glyphs.RestGlyph(0,y,b.duration));
	}
	,getBeatDurationWidth: function(d) {
		switch( (d)[1] ) {
		case 0:
			return 82;
		case 1:
			return 56;
		case 2:
			return 36;
		case 3:
			return 24;
		case 4:
			return 14;
		case 5:
			return 14;
		case 6:
			return 14;
		default:
			return 0;
		}
	}
	,createNoteGlyph: function(n,noteglyphs) {
		if(n.harmonicType == alphatab.model.HarmonicType.None) {
			var noteHeadGlyph = new alphatab.rendering.glyphs.NoteHeadGlyph(null,null,n.beat.duration);
			var line = this.getNoteLine(n);
			noteHeadGlyph.y = this.getScoreY(line,-1);
			noteglyphs.addNoteGlyph(noteHeadGlyph,line);
		}
	}
	,createAccidentalGlyph: function(n) {
		var noteLine = this.getNoteLine(n);
		var accidental = this._accidentalHelper.applyAccidental(n,noteLine);
		switch( (accidental)[1] ) {
		case 2:
			this.addGlyph(new alphatab.rendering.glyphs.SharpGlyph(0,this.getScoreY(noteLine - 1,-1)));
			break;
		case 3:
			this.addGlyph(new alphatab.rendering.glyphs.FlatGlyph(0,this.getScoreY(noteLine - 1,-8)));
			break;
		case 1:
			this.addGlyph(new alphatab.rendering.glyphs.NaturalizeGlyph(0,this.getScoreY(noteLine - 1,-2)));
			break;
		default:
		}
	}
	,getNoteLine: function(n) {
		var ks = n.beat.voice.bar.getMasterBar().keySignature;
		var clef = n.beat.voice.bar.clef;
		var value = n.realValue();
		var index = value % 12;
		var octave = value / 12 | 0;
		var steps = alphatab.rendering.ScoreBarRenderer.OCTAVE_STEPS[alphatab.model.ModelUtils.getClefIndex(clef)];
		steps -= octave * 7;
		steps -= ks > 0 || ks == 0?alphatab.rendering.ScoreBarRenderer.SHARP_NOTE_STEPS[index]:alphatab.rendering.ScoreBarRenderer.FLAT_NOTE_STEPS[index];
		return steps + 1;
	}
	,getScoreY: function(steps,correction) {
		if(correction == null) correction = 0;
		return 9 * this.stave.staveGroup.layout.renderer.scale / 2 * steps + correction * this.stave.staveGroup.layout.renderer.scale | 0;
	}
	,getGlyphOverflow: function() {
		var res = this.stave.staveGroup.layout.renderer.renderingResources;
		return res.tablatureFont.getSize() / 2 + res.tablatureFont.getSize() * 0.2 | 0;
	}
	,paintBackground: function(cx,cy,canvas) {
		var res = this.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.staveLineColor);
		var lineY = cy + this.y + this.getGlyphOverflow();
		var startY = lineY;
		var _g = 0;
		while(_g < 5) {
			var i = _g++;
			if(i > 0) lineY += 9 * this.stave.staveGroup.layout.renderer.scale | 0;
			canvas.beginPath();
			canvas.moveTo(cx + this.x,lineY);
			canvas.lineTo(cx + this.x + this.width,lineY);
			canvas.stroke();
		}
	}
	,__class__: alphatab.rendering.ScoreBarRenderer
});
alphatab.rendering.ScoreBarRendererFactory = $hxClasses["alphatab.rendering.ScoreBarRendererFactory"] = function() {
	alphatab.rendering.BarRendererFactory.call(this);
};
alphatab.rendering.ScoreBarRendererFactory.__name__ = ["alphatab","rendering","ScoreBarRendererFactory"];
alphatab.rendering.ScoreBarRendererFactory.__super__ = alphatab.rendering.BarRendererFactory;
alphatab.rendering.ScoreBarRendererFactory.prototype = $extend(alphatab.rendering.BarRendererFactory.prototype,{
	create: function(bar) {
		return new alphatab.rendering.ScoreBarRenderer(bar);
	}
	,__class__: alphatab.rendering.ScoreBarRendererFactory
});
alphatab.rendering.ScoreRenderer = $hxClasses["alphatab.rendering.ScoreRenderer"] = function(source) {
	this.canvas = alphatab.platform.PlatformFactory.getCanvas(source);
	this.settings = new Hash();
	this.updateScale(1.0);
	this.layout = new alphatab.rendering.layout.PageViewLayout(this);
};
alphatab.rendering.ScoreRenderer.__name__ = ["alphatab","rendering","ScoreRenderer"];
alphatab.rendering.ScoreRenderer.prototype = {
	canvas: null
	,score: null
	,track: null
	,scale: null
	,layout: null
	,renderingResources: null
	,settings: null
	,updateScale: function(scale) {
		this.scale = scale;
		this.renderingResources = new alphatab.rendering.RenderingResources(scale);
		this.canvas.setLineWidth(scale);
	}
	,render: function(track) {
		this.track = track;
		this.invalidate();
	}
	,invalidate: function() {
		this.canvas.clear();
		this.doLayout();
		this.paintScore();
	}
	,getScore: function() {
		if(this.track == null) return null;
		return this.track.score;
	}
	,doLayout: function() {
		this.layout.doLayout();
		this.canvas.setHeight(this.layout.height + this.renderingResources.copyrightFont.getSize() * 2 | 0);
		this.canvas.setWidth(this.layout.width);
	}
	,paintScore: function() {
		this.paintBackground();
		this.layout.paintScore();
	}
	,paintBackground: function() {
		var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
		this.canvas.setColor(new alphatab.platform.model.Color(62,62,62));
		this.canvas.setFont(this.renderingResources.copyrightFont);
		this.canvas.setTextAlign(alphatab.platform.model.TextAlign.Center);
		var x = this.canvas.getWidth() / 2;
		this.canvas.fillText(msg,x,this.canvas.getHeight() - this.renderingResources.copyrightFont.getSize() * 2);
	}
	,setStaveSetting: function(staveId,setting,value) {
		this.settings.set(staveId + "." + setting,value);
	}
	,getStaveSetting: function(staveId,setting,defaultValue) {
		var value = this.settings.get(staveId + "." + setting);
		return value != null?value:defaultValue;
	}
	,setLayoutSetting: function(setting,value) {
		this.settings.set("layout." + setting,value);
	}
	,getLayoutSetting: function(setting,defaultValue) {
		var value = this.settings.get("layout." + setting);
		return value != null?value:defaultValue;
	}
	,__class__: alphatab.rendering.ScoreRenderer
	,__properties__: {get_score:"getScore"}
}
alphatab.rendering.TabBarRenderer = $hxClasses["alphatab.rendering.TabBarRenderer"] = function(bar) {
	alphatab.rendering.GlyphBarRenderer.call(this,bar);
};
alphatab.rendering.TabBarRenderer.__name__ = ["alphatab","rendering","TabBarRenderer"];
alphatab.rendering.TabBarRenderer.__super__ = alphatab.rendering.GlyphBarRenderer;
alphatab.rendering.TabBarRenderer.prototype = $extend(alphatab.rendering.GlyphBarRenderer.prototype,{
	getLineOffset: function() {
		return 11 * this.stave.staveGroup.layout.renderer.scale;
	}
	,doLayout: function() {
		alphatab.rendering.GlyphBarRenderer.prototype.doLayout.call(this);
		this.height = (11 * this.stave.staveGroup.layout.renderer.scale * (this._bar.track.tuning.length - 1) | 0) + this.getNumberOverflow() * 2;
		if(this.index == 0) {
			this.stave.registerStaveTop(this.getNumberOverflow());
			this.stave.registerStaveBottom(this.height - this.getNumberOverflow());
		}
	}
	,createGlyphs: function() {
		alphatab.rendering.GlyphBarRenderer.prototype.createGlyphs.call(this);
		this.addGlyph(new alphatab.rendering.glyphs.DummyTablatureGlyph(0,0));
		this.addGlyph(new alphatab.rendering.glyphs.DummyTablatureGlyph(0,0));
		this.addGlyph(new alphatab.rendering.glyphs.DummyTablatureGlyph(0,0));
	}
	,getNumberOverflow: function() {
		var res = this.stave.staveGroup.layout.renderer.renderingResources;
		return res.tablatureFont.getSize() / 2 + res.tablatureFont.getSize() * 0.2 | 0;
	}
	,paintBackground: function(cx,cy,canvas) {
		var res = this.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.staveLineColor);
		var lineY = cy + this.y + this.getNumberOverflow();
		var startY = lineY;
		var _g1 = 0, _g = this._bar.track.tuning.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(i > 0) lineY += 11 * this.stave.staveGroup.layout.renderer.scale | 0;
			canvas.beginPath();
			canvas.moveTo(cx + this.x,lineY);
			canvas.lineTo(cx + this.x + this.width,lineY);
			canvas.stroke();
		}
		canvas.setColor(res.barSeperatorColor);
		canvas.beginPath();
		canvas.moveTo(cx + this.x + this.width,startY);
		canvas.lineTo(cx + this.x + this.width,lineY);
		canvas.stroke();
	}
	,__class__: alphatab.rendering.TabBarRenderer
});
alphatab.rendering.TabBarRendererFactory = $hxClasses["alphatab.rendering.TabBarRendererFactory"] = function() {
	alphatab.rendering.BarRendererFactory.call(this);
};
alphatab.rendering.TabBarRendererFactory.__name__ = ["alphatab","rendering","TabBarRendererFactory"];
alphatab.rendering.TabBarRendererFactory.__super__ = alphatab.rendering.BarRendererFactory;
alphatab.rendering.TabBarRendererFactory.prototype = $extend(alphatab.rendering.BarRendererFactory.prototype,{
	create: function(bar) {
		return new alphatab.rendering.TabBarRenderer(bar);
	}
	,__class__: alphatab.rendering.TabBarRendererFactory
});
if(!alphatab.rendering.glyphs) alphatab.rendering.glyphs = {}
alphatab.rendering.glyphs.BarNumberGlyph = $hxClasses["alphatab.rendering.glyphs.BarNumberGlyph"] = function(x,y,number) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._number = number;
};
alphatab.rendering.glyphs.BarNumberGlyph.__name__ = ["alphatab","rendering","glyphs","BarNumberGlyph"];
alphatab.rendering.glyphs.BarNumberGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.BarNumberGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	_number: null
	,doLayout: function() {
		this.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.barNumberColor);
		canvas.setFont(res.barNumberFont);
		canvas.fillText(Std.string(this._number),cx + this.x,cy + this.y);
	}
	,__class__: alphatab.rendering.glyphs.BarNumberGlyph
});
alphatab.rendering.glyphs.BarSeperatorGlyph = $hxClasses["alphatab.rendering.glyphs.BarSeperatorGlyph"] = function(x,y,isLast) {
	if(isLast == null) isLast = false;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._isLast = isLast;
};
alphatab.rendering.glyphs.BarSeperatorGlyph.__name__ = ["alphatab","rendering","glyphs","BarSeperatorGlyph"];
alphatab.rendering.glyphs.BarSeperatorGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.BarSeperatorGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	_isLast: null
	,doLayout: function() {
		this.width = (this._isLast?8:1) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.barSeperatorColor);
		var blockWidth = 4 * this.renderer.stave.staveGroup.layout.renderer.scale;
		var top = cy + this.y + this.renderer.getTopPadding();
		var bottom = cy + this.y + this.renderer.height - this.renderer.getBottomPadding();
		var left = cx + this.x;
		var h = bottom - top;
		canvas.beginPath();
		canvas.moveTo(left,top);
		canvas.lineTo(left,bottom);
		canvas.stroke();
		if(this._isLast) {
			left += 3 * this.renderer.stave.staveGroup.layout.renderer.scale + 0.5;
			canvas.fillRect(left,top,blockWidth,h);
		}
	}
	,__class__: alphatab.rendering.glyphs.BarSeperatorGlyph
});
alphatab.rendering.glyphs.SvgGlyph = $hxClasses["alphatab.rendering.glyphs.SvgGlyph"] = function(x,y,svg,xScale,yScale) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._token = svg.split(" ");
	this._xGlyphScale = xScale;
	this._yGlyphScale = yScale;
};
alphatab.rendering.glyphs.SvgGlyph.__name__ = ["alphatab","rendering","glyphs","SvgGlyph"];
alphatab.rendering.glyphs.SvgGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.SvgGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	_token: null
	,_currentX: null
	,_currentY: null
	,_currentIndex: null
	,_xScale: null
	,_yScale: null
	,_xGlyphScale: null
	,_yGlyphScale: null
	,paint: function(cx,cy,canvas) {
		this._xScale = this._xGlyphScale * this.renderer.stave.staveGroup.layout.renderer.scale;
		this._yScale = this._yGlyphScale * this.renderer.stave.staveGroup.layout.renderer.scale;
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.mainGlyphColor);
		this._currentIndex = 0;
		this._currentX = this.x + cx;
		this._currentY = this.y + cy;
		canvas.setColor(new alphatab.platform.model.Color(0,0,0));
		canvas.beginPath();
		while(this._currentIndex < this._token.length) this.parseCommand(cx + this.x,cy + this.y,canvas);
		canvas.fill();
	}
	,parseCommand: function(cx,cy,canvas) {
		var command = this.getString();
		switch(command) {
		case "M":
			this._currentX = cx + this.getNumber() * this._xScale;
			this._currentY = cy + this.getNumber() * this._yScale;
			canvas.moveTo(this._currentX,this._currentY);
			break;
		case "m":
			this._currentX += this.getNumber() * this._xScale;
			this._currentY += this.getNumber() * this._yScale;
			canvas.moveTo(this._currentX,this._currentY);
			break;
		case "z":
			break;
		case "Z":
			canvas.closePath();
			break;
		case "L":
			var isNextNumber = true;
			do {
				this._currentX = cx + this.getNumber() * this._xScale;
				this._currentY = cy + this.getNumber() * this._yScale;
				canvas.lineTo(this._currentX,this._currentY);
				isNextNumber = !this.isNextCommand();
			} while(isNextNumber);
			break;
		case "l":
			var isNextNumber = true;
			do {
				this._currentX += this.getNumber() * this._xScale;
				this._currentY += this.getNumber() * this._yScale;
				canvas.lineTo(this._currentX,this._currentY);
				isNextNumber = !this.isNextCommand();
			} while(isNextNumber);
			break;
		case "C":
			var isNextNumber = true;
			do {
				var x1 = cx + this.getNumber() * this._xScale;
				var y1 = cy + this.getNumber() * this._yScale;
				var x2 = cx + this.getNumber() * this._xScale;
				var y2 = cy + this.getNumber() * this._yScale;
				var x3 = cx + this.getNumber() * this._xScale;
				var y3 = cy + this.getNumber() * this._yScale;
				this._currentX = x3;
				this._currentY = y3;
				canvas.bezierCurveTo(x1,y1,x2,y2,x3,y3);
				isNextNumber = !this.isNextCommand();
			} while(isNextNumber);
			break;
		case "c":
			var isNextNumber = true;
			do {
				var x1 = this._currentX + this.getNumber() * this._xScale;
				var y1 = this._currentY + this.getNumber() * this._yScale;
				var x2 = this._currentX + this.getNumber() * this._xScale;
				var y2 = this._currentY + this.getNumber() * this._yScale;
				var x3 = this._currentX + this.getNumber() * this._xScale;
				var y3 = this._currentY + this.getNumber() * this._yScale;
				this._currentX = x3;
				this._currentY = y3;
				canvas.bezierCurveTo(x1,y1,x2,y2,x3,y3);
				isNextNumber = !this.isNextCommand();
			} while(isNextNumber && this._currentIndex < this._token.length);
			break;
		case "Q":
			var isNextNumber = true;
			do {
				var x1 = cx + this.getNumber() * this._xScale;
				var y1 = cy + this.getNumber() * this._yScale;
				var x2 = cx + this.getNumber() * this._xScale;
				var y2 = cy + this.getNumber() * this._yScale;
				this._currentX = x2;
				this._currentY = y2;
				canvas.quadraticCurveTo(x1,y1,x2,y2);
				isNextNumber = !this.isNextCommand();
			} while(isNextNumber);
			break;
		case "q":
			var isNextNumber = true;
			do {
				var x1 = this._currentX + this.getNumber() * this._xScale;
				var y1 = this._currentY + this.getNumber() * this._yScale;
				var x2 = this._currentX + this.getNumber() * this._xScale;
				var y2 = this._currentY + this.getNumber() * this._yScale;
				this._currentX = x2;
				this._currentY = y2;
				canvas.quadraticCurveTo(x1,y1,x2,y2);
				isNextNumber = !this.isNextCommand();
			} while(isNextNumber && this._currentIndex < this._token.length);
			break;
		}
	}
	,getNumber: function() {
		return Std.parseFloat(this._token[this._currentIndex++]);
	}
	,isNextCommand: function() {
		var command = this.peekString();
		return command == "m" || command == "M" || command == "c" || command == "C" || command == "q" || command == "Q" || command == "l" || command == "L" || command == "z" || command == "Z";
	}
	,peekString: function() {
		return this._token[this._currentIndex];
	}
	,peekNumber: function() {
		return Std.parseFloat(this._token[this._currentIndex]);
	}
	,getString: function() {
		return this._token[this._currentIndex++];
	}
	,__class__: alphatab.rendering.glyphs.SvgGlyph
});
alphatab.rendering.glyphs.BeamGlyph = $hxClasses["alphatab.rendering.glyphs.BeamGlyph"] = function(x,y,duration,direction) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getRestSvg(duration,direction),1.1,1.1);
};
alphatab.rendering.glyphs.BeamGlyph.__name__ = ["alphatab","rendering","glyphs","BeamGlyph"];
alphatab.rendering.glyphs.BeamGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.BeamGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	doLayout: function() {
		this.width = 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,getRestSvg: function(duration,direction) {
		if(direction == alphatab.rendering.utils.BeamDirection.Up) {
			switch( (duration)[1] ) {
			case 3:
				return alphatab.rendering.glyphs.MusicFont.FooterUpEighth;
			case 4:
				return alphatab.rendering.glyphs.MusicFont.FooterUpSixteenth;
			case 5:
				return alphatab.rendering.glyphs.MusicFont.FooterUpThirtySecond;
			case 6:
				return alphatab.rendering.glyphs.MusicFont.FooterUpSixtyFourth;
			default:
				return "";
			}
		} else {
			switch( (duration)[1] ) {
			case 3:
				return alphatab.rendering.glyphs.MusicFont.FooterDownEighth;
			case 4:
				return alphatab.rendering.glyphs.MusicFont.FooterDownSixteenth;
			case 5:
				return alphatab.rendering.glyphs.MusicFont.FooterDownThirtySecond;
			case 6:
				return alphatab.rendering.glyphs.MusicFont.FooterDownSixtyFourth;
			default:
				return "";
			}
		}
	}
	,__class__: alphatab.rendering.glyphs.BeamGlyph
});
alphatab.rendering.glyphs.ClefGlyph = $hxClasses["alphatab.rendering.glyphs.ClefGlyph"] = function(x,y,clef) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getClefSvg(clef),this.getClefScale(clef),this.getClefScale(clef));
};
alphatab.rendering.glyphs.ClefGlyph.__name__ = ["alphatab","rendering","glyphs","ClefGlyph"];
alphatab.rendering.glyphs.ClefGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.ClefGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	doLayout: function() {
		this.width = 24 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,getClefSvg: function(clef) {
		switch( (clef)[1] ) {
		case 0:
			return alphatab.rendering.glyphs.MusicFont.TenorClef;
		case 1:
			return alphatab.rendering.glyphs.MusicFont.AltoClef;
		case 2:
			return alphatab.rendering.glyphs.MusicFont.BassClef;
		case 3:
			return alphatab.rendering.glyphs.MusicFont.TrebleClef;
		default:
			return "";
		}
	}
	,getClefScale: function(clef) {
		switch( (clef)[1] ) {
		case 0:
		case 1:
			return 1.1;
		default:
			return 1.02;
		}
	}
	,__class__: alphatab.rendering.glyphs.ClefGlyph
});
alphatab.rendering.glyphs.DigitGlyph = $hxClasses["alphatab.rendering.glyphs.DigitGlyph"] = function(x,y,digit) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getDigit(digit),1.1,1.1);
	this._digit = digit;
};
alphatab.rendering.glyphs.DigitGlyph.__name__ = ["alphatab","rendering","glyphs","DigitGlyph"];
alphatab.rendering.glyphs.DigitGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.DigitGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	_digit: null
	,doLayout: function() {
		this.y += 7 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		this.width = this.getDigitWidth(this._digit) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,getDigitWidth: function(digit) {
		switch(digit) {
		case 0:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:
			return 14;
		case 1:
			return 10;
		default:
			return 0;
		}
	}
	,getDigit: function(digit) {
		switch(digit) {
		case 0:
			return alphatab.rendering.glyphs.MusicFont.Num0;
		case 1:
			return alphatab.rendering.glyphs.MusicFont.Num1;
		case 2:
			return alphatab.rendering.glyphs.MusicFont.Num2;
		case 3:
			return alphatab.rendering.glyphs.MusicFont.Num3;
		case 4:
			return alphatab.rendering.glyphs.MusicFont.Num4;
		case 5:
			return alphatab.rendering.glyphs.MusicFont.Num5;
		case 6:
			return alphatab.rendering.glyphs.MusicFont.Num6;
		case 7:
			return alphatab.rendering.glyphs.MusicFont.Num7;
		case 8:
			return alphatab.rendering.glyphs.MusicFont.Num8;
		case 9:
			return alphatab.rendering.glyphs.MusicFont.Num9;
		default:
			return "";
		}
	}
	,__class__: alphatab.rendering.glyphs.DigitGlyph
});
alphatab.rendering.glyphs.DummyTablatureGlyph = $hxClasses["alphatab.rendering.glyphs.DummyTablatureGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
};
alphatab.rendering.glyphs.DummyTablatureGlyph.__name__ = ["alphatab","rendering","glyphs","DummyTablatureGlyph"];
alphatab.rendering.glyphs.DummyTablatureGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.DummyTablatureGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	doLayout: function() {
		this.width = 100;
	}
	,paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(new alphatab.platform.model.Color(Std.random(256),Std.random(256),Std.random(256),128));
		canvas.fillRect(cx + this.x,cy + this.y,this.width,this.renderer.height);
		canvas.setFont(res.tablatureFont);
		canvas.setColor(new alphatab.platform.model.Color(0,0,0));
		canvas.fillText("0 1 2 3 4 5 6 7 9 0",cx + this.x,cy + this.y);
	}
	,__class__: alphatab.rendering.glyphs.DummyTablatureGlyph
});
alphatab.rendering.glyphs.FlatGlyph = $hxClasses["alphatab.rendering.glyphs.FlatGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.KeyFlat,1.2,1.2);
};
alphatab.rendering.glyphs.FlatGlyph.__name__ = ["alphatab","rendering","glyphs","FlatGlyph"];
alphatab.rendering.glyphs.FlatGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.FlatGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	doLayout: function() {
		this.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,__class__: alphatab.rendering.glyphs.FlatGlyph
});
alphatab.rendering.glyphs.GlyphGroup = $hxClasses["alphatab.rendering.glyphs.GlyphGroup"] = function(x,y,glyphs) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._glyphs = glyphs;
};
alphatab.rendering.glyphs.GlyphGroup.__name__ = ["alphatab","rendering","glyphs","GlyphGroup"];
alphatab.rendering.glyphs.GlyphGroup.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.GlyphGroup.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	_glyphs: null
	,doLayout: function() {
		var w = 0;
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.renderer = this.renderer;
			g.doLayout();
			w = Math.max(w,g.width) | 0;
		}
		this.width = w;
	}
	,paint: function(cx,cy,canvas) {
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.paint(cx + this.x,cy + this.y,canvas);
		}
	}
	,__class__: alphatab.rendering.glyphs.GlyphGroup
});
alphatab.rendering.glyphs.MusicFont = $hxClasses["alphatab.rendering.glyphs.MusicFont"] = function() { }
alphatab.rendering.glyphs.MusicFont.__name__ = ["alphatab","rendering","glyphs","MusicFont"];
alphatab.rendering.glyphs.NaturalizeGlyph = $hxClasses["alphatab.rendering.glyphs.NaturalizeGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.KeyNormal,1.2,1.2);
};
alphatab.rendering.glyphs.NaturalizeGlyph.__name__ = ["alphatab","rendering","glyphs","NaturalizeGlyph"];
alphatab.rendering.glyphs.NaturalizeGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.NaturalizeGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	doLayout: function() {
		this.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,__class__: alphatab.rendering.glyphs.NaturalizeGlyph
});
alphatab.rendering.glyphs.NoteChordGlyph = $hxClasses["alphatab.rendering.glyphs.NoteChordGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._infos = new Array();
};
alphatab.rendering.glyphs.NoteChordGlyph.__name__ = ["alphatab","rendering","glyphs","NoteChordGlyph"];
alphatab.rendering.glyphs.NoteChordGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.NoteChordGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	_infos: null
	,minNote: null
	,maxNote: null
	,upLineX: null
	,downLineX: null
	,addNoteGlyph: function(noteGlyph,noteLine) {
		var info = { glyph : noteGlyph, line : noteLine};
		this._infos.push(info);
		if(this.minNote == null || this.minNote.line > info.line) this.minNote = info;
		if(this.maxNote == null || this.maxNote.line < info.line) this.maxNote = info;
	}
	,hasTopOverflow: function() {
		return this.minNote != null && this.minNote.line < 0;
	}
	,hasBottomOverflow: function() {
		return this.maxNote != null && this.maxNote.line > 8;
	}
	,doLayout: function() {
		this._infos.sort(function(a,b) {
			if(a.line == b.line) return 0; else if(a.line < b.line) return 1; else return -1;
		});
		var padding = 4 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		var displacedX = 0;
		var lastDisplaced = false;
		var lastLine = 0;
		var anyDisplaced = false;
		var w = 0;
		var _g1 = 0, _g = this._infos.length;
		while(_g1 < _g) {
			var i = _g1++;
			var g = this._infos[i].glyph;
			g.renderer = this.renderer;
			g.doLayout();
			g.x = padding;
			if(i == 0) displacedX = g.width + padding; else if(Math.abs(lastLine - this._infos[i].line) <= 1) {
				if(!lastDisplaced) {
					g.x = displacedX - this.renderer.stave.staveGroup.layout.renderer.scale | 0;
					anyDisplaced = true;
					lastDisplaced = true;
				} else lastDisplaced = false;
			} else lastDisplaced = false;
			lastLine = this._infos[i].line;
			w = Math.max(w,g.x + g.width) | 0;
		}
		if(anyDisplaced) {
			this.upLineX = this.x + displacedX;
			this.downLineX = this.x + displacedX;
		} else {
			this.upLineX = this.x + w;
			this.downLineX = this.x + padding;
		}
		this.width = w + padding;
	}
	,paint: function(cx,cy,canvas) {
		var scoreRenderer = this.renderer;
		canvas.setColor(this.renderer.stave.staveGroup.layout.renderer.renderingResources.staveLineColor);
		if(this.hasTopOverflow()) {
			var l = -1;
			while(l >= this.minNote.line) {
				var lY = cy + this.y + scoreRenderer.getScoreY(l + 1,-1);
				canvas.beginPath();
				canvas.moveTo(cx + this.x,lY);
				canvas.lineTo(cx + this.x + this.width,lY);
				canvas.stroke();
				l -= 2;
			}
		}
		if(this.hasBottomOverflow()) {
			var l = 11;
			while(l <= this.maxNote.line) {
				var lY = cy + this.y + scoreRenderer.getScoreY(l + 1,-1);
				canvas.beginPath();
				canvas.moveTo(cx + this.x,lY);
				canvas.lineTo(cx + this.x + this.width,lY);
				canvas.stroke();
				l += 2;
			}
		}
		var _g = 0, _g1 = this._infos;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.glyph.paint(cx + this.x,cy + this.y,canvas);
		}
	}
	,__class__: alphatab.rendering.glyphs.NoteChordGlyph
});
alphatab.rendering.glyphs.NoteHeadGlyph = $hxClasses["alphatab.rendering.glyphs.NoteHeadGlyph"] = function(x,y,duration) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getNoteSvg(duration),1,1);
};
alphatab.rendering.glyphs.NoteHeadGlyph.__name__ = ["alphatab","rendering","glyphs","NoteHeadGlyph"];
alphatab.rendering.glyphs.NoteHeadGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.NoteHeadGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	doLayout: function() {
		this.width = 9 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,getNoteSvg: function(duration) {
		switch( (duration)[1] ) {
		case 0:
			return alphatab.rendering.glyphs.MusicFont.NoteHalf;
		case 1:
			return alphatab.rendering.glyphs.MusicFont.NoteHalf;
		default:
			return alphatab.rendering.glyphs.MusicFont.NoteQuarter;
		}
	}
	,__class__: alphatab.rendering.glyphs.NoteHeadGlyph
});
alphatab.rendering.glyphs.NumberGlyph = $hxClasses["alphatab.rendering.glyphs.NumberGlyph"] = function(x,y,number) {
	alphatab.rendering.glyphs.GlyphGroup.call(this,x,y,new Array());
	this._number = number;
};
alphatab.rendering.glyphs.NumberGlyph.__name__ = ["alphatab","rendering","glyphs","NumberGlyph"];
alphatab.rendering.glyphs.NumberGlyph.__super__ = alphatab.rendering.glyphs.GlyphGroup;
alphatab.rendering.glyphs.NumberGlyph.prototype = $extend(alphatab.rendering.glyphs.GlyphGroup.prototype,{
	_number: null
	,applyGlyphSpacing: function(spacing) {
	}
	,doLayout: function() {
		var i = this._number;
		while(i > 0) {
			var num = i % 10;
			var gl = new alphatab.rendering.glyphs.DigitGlyph(0,0,num);
			this._glyphs.push(gl);
			i = i / 10 | 0;
		}
		this._glyphs.reverse();
		var cx = 0;
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.x = cx;
			g.y = 0;
			g.renderer = this.renderer;
			g.doLayout();
			cx += g.width;
		}
		this.width = cx;
	}
	,__class__: alphatab.rendering.glyphs.NumberGlyph
});
alphatab.rendering.glyphs.RepeatCloseGlyph = $hxClasses["alphatab.rendering.glyphs.RepeatCloseGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
};
alphatab.rendering.glyphs.RepeatCloseGlyph.__name__ = ["alphatab","rendering","glyphs","RepeatCloseGlyph"];
alphatab.rendering.glyphs.RepeatCloseGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.RepeatCloseGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	doLayout: function() {
		this.width = 13 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.mainGlyphColor);
		var blockWidth = 4 * this.renderer.stave.staveGroup.layout.renderer.scale;
		var top = cy + this.y + this.renderer.getTopPadding();
		var bottom = cy + this.y + this.renderer.height - this.renderer.getBottomPadding();
		var left = cx + this.x;
		var h = bottom - top;
		var circleSize = 1.5 * this.renderer.stave.staveGroup.layout.renderer.scale;
		var middle = (top + bottom) / 2;
		var dotOffset = 3;
		canvas.beginPath();
		canvas.circle(left,middle - circleSize * dotOffset,circleSize);
		canvas.circle(left,middle + circleSize * dotOffset,circleSize);
		canvas.fill();
		left += 4 * this.renderer.stave.staveGroup.layout.renderer.scale;
		canvas.beginPath();
		canvas.moveTo(left,top);
		canvas.lineTo(left,bottom);
		canvas.stroke();
		left += 3 * this.renderer.stave.staveGroup.layout.renderer.scale + 0.5;
		canvas.fillRect(left,top,blockWidth,h);
	}
	,__class__: alphatab.rendering.glyphs.RepeatCloseGlyph
});
alphatab.rendering.glyphs.RepeatCountGlyph = $hxClasses["alphatab.rendering.glyphs.RepeatCountGlyph"] = function(x,y,count) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._count = count;
};
alphatab.rendering.glyphs.RepeatCountGlyph.__name__ = ["alphatab","rendering","glyphs","RepeatCountGlyph"];
alphatab.rendering.glyphs.RepeatCountGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.RepeatCountGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	_count: null
	,doLayout: function() {
		this.width = 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.mainGlyphColor);
		canvas.setFont(res.barNumberFont);
		canvas.fillText("x" + Std.string(this._count),cx + this.x,cy + this.y);
	}
	,__class__: alphatab.rendering.glyphs.RepeatCountGlyph
});
alphatab.rendering.glyphs.RepeatOpenGlyph = $hxClasses["alphatab.rendering.glyphs.RepeatOpenGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
};
alphatab.rendering.glyphs.RepeatOpenGlyph.__name__ = ["alphatab","rendering","glyphs","RepeatOpenGlyph"];
alphatab.rendering.glyphs.RepeatOpenGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.RepeatOpenGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	doLayout: function() {
		this.width = 13 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.mainGlyphColor);
		var blockWidth = 4 * this.renderer.stave.staveGroup.layout.renderer.scale;
		var top = cy + this.y + this.renderer.getTopPadding();
		var bottom = cy + this.y + this.renderer.height - this.renderer.getBottomPadding();
		var left = cx + this.x + 0.5;
		var h = bottom - top;
		canvas.fillRect(left,top,blockWidth,h);
		left += blockWidth * 2 - 0.5;
		canvas.beginPath();
		canvas.moveTo(left,top);
		canvas.lineTo(left,bottom);
		canvas.stroke();
		left += 3 * this.renderer.stave.staveGroup.layout.renderer.scale;
		var circleSize = 1.5 * this.renderer.stave.staveGroup.layout.renderer.scale;
		var middle = (top + bottom) / 2;
		var dotOffset = 3;
		canvas.beginPath();
		canvas.circle(left,middle - circleSize * dotOffset,circleSize);
		canvas.circle(left,middle + circleSize * dotOffset,circleSize);
		canvas.fill();
	}
	,__class__: alphatab.rendering.glyphs.RepeatOpenGlyph
});
alphatab.rendering.glyphs.RestGlyph = $hxClasses["alphatab.rendering.glyphs.RestGlyph"] = function(x,y,duration) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getRestSvg(duration),1.1,1.1);
};
alphatab.rendering.glyphs.RestGlyph.__name__ = ["alphatab","rendering","glyphs","RestGlyph"];
alphatab.rendering.glyphs.RestGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.RestGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	doLayout: function() {
		this.width = 9 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,getRestSvg: function(duration) {
		switch( (duration)[1] ) {
		case 0:
		case 1:
			return alphatab.rendering.glyphs.MusicFont.RestHalf;
		case 2:
			return alphatab.rendering.glyphs.MusicFont.RestQuarter;
		case 3:
			return alphatab.rendering.glyphs.MusicFont.RestEighth;
		case 4:
			return alphatab.rendering.glyphs.MusicFont.RestSixteenth;
		case 5:
			return alphatab.rendering.glyphs.MusicFont.RestThirtySecond;
		case 6:
			return alphatab.rendering.glyphs.MusicFont.RestSixtyFourth;
		default:
			return "";
		}
	}
	,__class__: alphatab.rendering.glyphs.RestGlyph
});
alphatab.rendering.glyphs.SharpGlyph = $hxClasses["alphatab.rendering.glyphs.SharpGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.KeySharp,1.2,1.2);
};
alphatab.rendering.glyphs.SharpGlyph.__name__ = ["alphatab","rendering","glyphs","SharpGlyph"];
alphatab.rendering.glyphs.SharpGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.SharpGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	doLayout: function() {
		this.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,applyGlyphSpacing: function(spacing) {
	}
	,__class__: alphatab.rendering.glyphs.SharpGlyph
});
alphatab.rendering.glyphs.SpacingGlyph = $hxClasses["alphatab.rendering.glyphs.SpacingGlyph"] = function(x,y,width,scaling) {
	if(scaling == null) scaling = true;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this.width = width;
	this._scaling = scaling;
};
alphatab.rendering.glyphs.SpacingGlyph.__name__ = ["alphatab","rendering","glyphs","SpacingGlyph"];
alphatab.rendering.glyphs.SpacingGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.SpacingGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	_scaling: null
	,applyGlyphSpacing: function(spacing) {
		if(this._scaling) alphatab.rendering.Glyph.prototype.applyGlyphSpacing.call(this,spacing);
	}
	,__class__: alphatab.rendering.glyphs.SpacingGlyph
});
alphatab.rendering.glyphs.TimeSignatureGlyph = $hxClasses["alphatab.rendering.glyphs.TimeSignatureGlyph"] = function(x,y,numerator,denominator) {
	alphatab.rendering.glyphs.GlyphGroup.call(this,x,y,new Array());
	this._numerator = numerator;
	this._denominator = denominator;
};
alphatab.rendering.glyphs.TimeSignatureGlyph.__name__ = ["alphatab","rendering","glyphs","TimeSignatureGlyph"];
alphatab.rendering.glyphs.TimeSignatureGlyph.__super__ = alphatab.rendering.glyphs.GlyphGroup;
alphatab.rendering.glyphs.TimeSignatureGlyph.prototype = $extend(alphatab.rendering.glyphs.GlyphGroup.prototype,{
	_numerator: null
	,_denominator: null
	,applyGlyphSpacing: function(spacing) {
	}
	,doLayout: function() {
		var numerator = new alphatab.rendering.glyphs.NumberGlyph(0,0,this._numerator);
		var denominator = new alphatab.rendering.glyphs.NumberGlyph(0,18 * this.renderer.stave.staveGroup.layout.renderer.scale | 0,this._denominator);
		this._glyphs.push(numerator);
		this._glyphs.push(denominator);
		alphatab.rendering.glyphs.GlyphGroup.prototype.doLayout.call(this);
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.x = (this.width - g.width) / 2 | 0;
		}
	}
	,__class__: alphatab.rendering.glyphs.TimeSignatureGlyph
});
if(!alphatab.rendering.layout) alphatab.rendering.layout = {}
alphatab.rendering.layout.HeaderFooterElements = $hxClasses["alphatab.rendering.layout.HeaderFooterElements"] = function() { }
alphatab.rendering.layout.HeaderFooterElements.__name__ = ["alphatab","rendering","layout","HeaderFooterElements"];
alphatab.rendering.layout.ScoreLayout = $hxClasses["alphatab.rendering.layout.ScoreLayout"] = function(renderer) {
	this.renderer = renderer;
};
alphatab.rendering.layout.ScoreLayout.__name__ = ["alphatab","rendering","layout","ScoreLayout"];
alphatab.rendering.layout.ScoreLayout.prototype = {
	renderer: null
	,width: null
	,height: null
	,doLayout: function() {
	}
	,paintScore: function() {
	}
	,createEmptyStaveGroup: function() {
		var group = new alphatab.rendering.staves.StaveGroup();
		group.layout = this;
		group.addStave(new alphatab.rendering.staves.Stave(new alphatab.rendering.ScoreBarRendererFactory()));
		return group;
	}
	,__class__: alphatab.rendering.layout.ScoreLayout
}
alphatab.rendering.layout.PageViewLayout = $hxClasses["alphatab.rendering.layout.PageViewLayout"] = function(renderer) {
	alphatab.rendering.layout.ScoreLayout.call(this,renderer);
	this._groups = new Array();
	renderer.setLayoutSetting(alphatab.rendering.layout.PageViewLayout.SCORE_INFOS,511);
};
alphatab.rendering.layout.PageViewLayout.__name__ = ["alphatab","rendering","layout","PageViewLayout"];
alphatab.rendering.layout.PageViewLayout.__super__ = alphatab.rendering.layout.ScoreLayout;
alphatab.rendering.layout.PageViewLayout.prototype = $extend(alphatab.rendering.layout.ScoreLayout.prototype,{
	_groups: null
	,doLayout: function() {
		this._groups = new Array();
		var currentBarIndex = 0;
		var endBarIndex = this.renderer.track.bars.length - 1;
		var x = alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[0];
		var y = alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[1];
		y = this.doScoreInfoLayout(y);
		while(currentBarIndex <= endBarIndex) {
			var group = this.createStaveGroup(currentBarIndex);
			this._groups.push(group);
			group.x = x;
			group.y = y;
			this.fitGroup(group);
			group.finalizeGroup(this);
			y += group.calculateHeight() + (20 * this.renderer.scale | 0);
			currentBarIndex = group.bars[group.bars.length - 1].index + 1;
		}
		this.height = y + alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[3];
		this.width = 795 * this.renderer.scale | 0;
	}
	,doScoreInfoLayout: function(y) {
		var flags = js.Boot.__cast(this.renderer.getLayoutSetting(alphatab.rendering.layout.PageViewLayout.SCORE_INFOS) , Int);
		var score = this.renderer.getScore();
		var scale = this.renderer.scale;
		if(!this.isNullOrEmpty(score.title) && (flags & 1) != 0) y += Math.floor(35 * scale);
		if(!this.isNullOrEmpty(score.subTitle) && (flags & 2) != 0) y += Math.floor(20 * scale);
		if(!this.isNullOrEmpty(score.artist) && (flags & 4) != 0) y += Math.floor(20 * scale);
		if(!this.isNullOrEmpty(score.album) && (flags & 8) != 0) y += Math.floor(20 * scale);
		if(!this.isNullOrEmpty(score.music) && score.music == score.words && (flags & 64) != 0) y += Math.floor(20 * scale); else {
			if(!this.isNullOrEmpty(score.music) && (flags & 32) != 0) y += Math.floor(20 * scale);
			if(!this.isNullOrEmpty(score.words) && (flags & 16) != 0) y += Math.floor(20 * scale);
		}
		y += Math.floor(20 * scale);
		if(!this.renderer.track.isPercussion) {
			var tuning = alphatab.model.Tuning.findTuning(this.renderer.track.tuning);
			if(tuning != null) {
				y += Math.floor(15 * scale);
				if(!tuning.isStandard) {
					var stringsPerColumn = Math.ceil(this.renderer.track.tuning.length / 2);
					y += stringsPerColumn * Math.floor(15 * scale);
				}
				y += Math.floor(15 * scale);
			}
		}
		y += Math.floor(40 * scale);
		return y;
	}
	,paintScore: function() {
		var x = alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[0];
		var y = alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[1];
		y = this.paintScoreInfo(x,y);
		var _g = 0, _g1 = this._groups;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.paint(0,0,this.renderer.canvas);
		}
	}
	,drawCentered: function(text,font,y) {
		this.renderer.canvas.setFont(font);
		this.renderer.canvas.fillText(text,this.width / 2,y);
	}
	,paintScoreInfo: function(x,y) {
		var flags = js.Boot.__cast(this.renderer.getLayoutSetting(alphatab.rendering.layout.PageViewLayout.SCORE_INFOS) , Int);
		var score = this.renderer.getScore();
		var scale = this.renderer.scale;
		var canvas = this.renderer.canvas;
		var res = this.renderer.renderingResources;
		canvas.setColor(new alphatab.platform.model.Color(0,0,0));
		canvas.setTextAlign(alphatab.platform.model.TextAlign.Center);
		var tX;
		var size;
		var str = "";
		if(!this.isNullOrEmpty(score.title) && (flags & 1) != 0) {
			this.drawCentered(score.title,res.titleFont,y);
			y += Math.floor(35 * scale);
		}
		if(!this.isNullOrEmpty(score.subTitle) && (flags & 2) != 0) {
			this.drawCentered(score.subTitle,res.subTitleFont,y);
			y += Math.floor(20 * scale);
		}
		if(!this.isNullOrEmpty(score.artist) && (flags & 4) != 0) {
			this.drawCentered(score.artist,res.subTitleFont,y);
			y += Math.floor(20 * scale);
		}
		if(!this.isNullOrEmpty(score.album) && (flags & 8) != 0) {
			this.drawCentered(score.album,res.subTitleFont,y);
			y += Math.floor(20 * scale);
		}
		if(!this.isNullOrEmpty(score.music) && score.music == score.words && (flags & 64) != 0) {
			this.drawCentered(score.words,res.wordsFont,y);
			y += Math.floor(20 * scale);
		} else {
			canvas.setFont(res.wordsFont);
			if(!this.isNullOrEmpty(score.music) && (flags & 32) != 0) {
				var size1 = canvas.measureText(score.music);
				canvas.fillText(score.music,this.width - size1 - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[2],y);
			}
			if(!this.isNullOrEmpty(score.words) && (flags & 16) != 0) canvas.fillText(score.music,x,y);
			y += Math.floor(20 * scale);
		}
		y += Math.floor(20 * scale);
		if(!this.renderer.track.isPercussion) {
			canvas.setTextAlign(alphatab.platform.model.TextAlign.Left);
			var tuning = alphatab.model.Tuning.findTuning(this.renderer.track.tuning);
			if(tuning != null) {
				canvas.setFont(res.effectFont);
				canvas.fillText(tuning.name,x,y);
				y += Math.floor(15 * scale);
				if(!tuning.isStandard) {
					var stringsPerColumn = Math.ceil(this.renderer.track.tuning.length / 2);
					var currentX = x;
					var currentY = y;
					var _g1 = 0, _g = this.renderer.track.tuning.length;
					while(_g1 < _g) {
						var i = _g1++;
						str = "(" + Std.string(i + 1) + ") = " + alphatab.model.Tuning.getTextForTuning(this.renderer.track.tuning[i],false);
						canvas.fillText(str,currentX,currentY);
						currentY += Math.floor(15 * scale);
						if(i == stringsPerColumn - 1) {
							currentY = y;
							currentX += Math.floor(43 * scale);
						}
					}
					y += stringsPerColumn * Math.floor(15 * scale);
				}
			}
		}
		y += Math.floor(25 * scale);
		return y;
	}
	,isNullOrEmpty: function(s) {
		return s == null || StringTools.trim(s) == "";
	}
	,fitGroup: function(group) {
		var barSpace = 0;
		if(group.isFull) {
			var freeSpace = this.getSheetWidth() - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[0] - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[2] - group.width;
			if(freeSpace != 0 && group.bars.length > 0) barSpace = Math.round(freeSpace / group.bars.length);
		}
		group.applyBarSpacing(barSpace);
		this.width = Math.round(Math.max(this.width,group.width));
	}
	,createStaveGroup: function(currentBarIndex) {
		var group = this.createEmptyStaveGroup();
		var maxWidth = this.getSheetWidth() - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[0] - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[2];
		var _g1 = currentBarIndex, _g = this.renderer.track.bars.length;
		while(_g1 < _g) {
			var i = _g1++;
			var bar = this.renderer.track.bars[i];
			group.addBar(bar);
			var groupIsFull = false;
			if(group.width >= maxWidth && group.bars.length != 0) groupIsFull = true;
			if(groupIsFull) {
				group.revertLastBar();
				group.isFull = true;
				return group;
			}
			group.x = 0;
		}
		return group;
	}
	,getMaxWidth: function() {
		return this.getSheetWidth() - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[0] - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[2];
	}
	,getSheetWidth: function() {
		return Math.round(795 * this.renderer.scale);
	}
	,__class__: alphatab.rendering.layout.PageViewLayout
});
if(!alphatab.rendering.staves) alphatab.rendering.staves = {}
alphatab.rendering.staves.Stave = $hxClasses["alphatab.rendering.staves.Stave"] = function(barRendererFactory) {
	this.barRenderers = new Array();
	this._factory = barRendererFactory;
	this.topSpacing = 10;
	this.bottomSpacing = 10;
};
alphatab.rendering.staves.Stave.__name__ = ["alphatab","rendering","staves","Stave"];
alphatab.rendering.staves.Stave.prototype = {
	staveGroup: null
	,_factory: null
	,barRenderers: null
	,x: null
	,y: null
	,height: null
	,index: null
	,staveTop: null
	,topSpacing: null
	,bottomSpacing: null
	,topOverflow: null
	,bottomOverflow: null
	,staveBottom: null
	,registerOverflowTop: function(topOverflow) {
		if(topOverflow > this.topOverflow) this.topOverflow = topOverflow;
	}
	,registerOverflowBottom: function(bottomOverflow) {
		if(bottomOverflow > this.bottomOverflow) this.bottomOverflow = bottomOverflow;
	}
	,registerStaveTop: function(offset) {
		this.staveTop = offset;
	}
	,registerStaveBottom: function(offset) {
		this.staveBottom = offset;
	}
	,addBar: function(bar) {
		var renderer = this._factory.create(bar);
		renderer.stave = this;
		renderer.index = this.barRenderers.length;
		renderer.doLayout();
		this.barRenderers.push(renderer);
	}
	,revertLastBar: function() {
		this.barRenderers.pop();
	}
	,applyBarSpacing: function(spacing) {
		var _g = 0, _g1 = this.barRenderers;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			b.applyBarSpacing(spacing);
		}
	}
	,finalizeStave: function(layout) {
		var x = 0;
		this.height = 0;
		var _g1 = 0, _g = this.barRenderers.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.barRenderers[i].x = x;
			this.barRenderers[i].y = this.topSpacing + this.topOverflow;
			this.height = Math.max(this.height,this.barRenderers[i].height) | 0;
			x += this.barRenderers[i].width;
		}
		this.height += this.topSpacing + this.topOverflow + this.bottomOverflow + this.bottomSpacing;
	}
	,paint: function(cx,cy,canvas) {
		var _g = 0, _g1 = this.barRenderers;
		while(_g < _g1.length) {
			var r = _g1[_g];
			++_g;
			r.paint(cx + this.x,cy + this.y,canvas);
		}
	}
	,__class__: alphatab.rendering.staves.Stave
}
alphatab.rendering.staves.StaveGroup = $hxClasses["alphatab.rendering.staves.StaveGroup"] = function() {
	this.bars = new Array();
	this.staves = new Array();
	this.width = 0;
};
alphatab.rendering.staves.StaveGroup.__name__ = ["alphatab","rendering","staves","StaveGroup"];
alphatab.rendering.staves.StaveGroup.prototype = {
	x: null
	,y: null
	,isFull: null
	,width: null
	,bars: null
	,staves: null
	,layout: null
	,getLastBarIndex: function() {
		return this.bars[this.bars.length - 1].index;
	}
	,addBar: function(bar) {
		this.bars.push(bar);
		var maxW = 0;
		var _g = 0, _g1 = this.staves;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			s.addBar(bar);
			if(s.barRenderers[s.barRenderers.length - 1].width > maxW) maxW = s.barRenderers[s.barRenderers.length - 1].width;
		}
		var _g = 0, _g1 = this.staves;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			var diff = maxW - s.barRenderers[s.barRenderers.length - 1].width;
			if(diff > 0) s.barRenderers[s.barRenderers.length - 1].applyBarSpacing(diff);
		}
		this.width += maxW;
	}
	,addStave: function(stave) {
		stave.staveGroup = this;
		stave.index = this.staves.length;
		this.staves.push(stave);
	}
	,calculateHeight: function() {
		return this.staves[this.staves.length - 1].y + this.staves[this.staves.length - 1].height;
	}
	,revertLastBar: function() {
		if(this.bars.length > 1) {
			this.bars.pop();
			var w = 0;
			var _g = 0, _g1 = this.staves;
			while(_g < _g1.length) {
				var s = _g1[_g];
				++_g;
				w = Math.max(w,s.barRenderers[s.barRenderers.length - 1].width) | 0;
				s.revertLastBar();
			}
			this.width -= w;
		}
	}
	,applyBarSpacing: function(spacing) {
		var _g = 0, _g1 = this.staves;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			s.applyBarSpacing(spacing);
		}
		this.width += this.bars.length * spacing;
	}
	,paint: function(cx,cy,canvas) {
		var _g = 0, _g1 = this.staves;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			s.paint(cx + this.x,cy + this.y,canvas);
		}
		var res = this.layout.renderer.renderingResources;
		if(this.staves.length > 0) {
			var firstStart = cy + this.y + this.staves[0].y + this.staves[0].staveTop + this.staves[0].topSpacing + this.staves[0].topOverflow;
			var lastEnd = cy + this.y + this.staves[this.staves.length - 1].y + this.staves[this.staves.length - 1].height - this.staves[this.staves.length - 1].bottomOverflow - this.staves[this.staves.length - 1].bottomSpacing - this.staves[this.staves.length - 1].staveBottom;
			canvas.setColor(res.barSeperatorColor);
			canvas.beginPath();
			canvas.moveTo(cx + this.x + this.staves[0].x,firstStart);
			canvas.lineTo(cx + this.x + this.staves[this.staves.length - 1].x,lastEnd);
			canvas.stroke();
			var barSize = 3 * this.layout.renderer.scale | 0;
			var barOffset = barSize;
			var accoladeStart = firstStart - barSize * 4;
			var accoladeEnd = lastEnd + barSize * 4;
			canvas.fillRect(cx + this.x - barOffset - barSize,accoladeStart,barSize,accoladeEnd - accoladeStart);
			var spikeStartX = cx + this.x - barOffset - barSize;
			var spikeEndX = cx + this.x + barSize * 2;
			canvas.beginPath();
			canvas.moveTo(spikeStartX,accoladeStart);
			canvas.bezierCurveTo(spikeStartX,accoladeStart,this.x,accoladeStart,spikeEndX,accoladeStart - barSize);
			canvas.bezierCurveTo(cx + this.x,accoladeStart + barSize,spikeStartX,accoladeStart + barSize,spikeStartX,accoladeStart + barSize);
			canvas.closePath();
			canvas.fill();
			canvas.beginPath();
			canvas.moveTo(spikeStartX,accoladeEnd);
			canvas.bezierCurveTo(spikeStartX,accoladeStart,this.x,accoladeStart,spikeEndX,accoladeStart - barSize);
			canvas.bezierCurveTo(cx + this.x,accoladeStart + barSize,spikeStartX,accoladeStart + barSize,spikeStartX,accoladeStart + barSize);
			canvas.closePath();
			canvas.beginPath();
			canvas.moveTo(spikeStartX,accoladeEnd);
			canvas.bezierCurveTo(spikeStartX,accoladeEnd,this.x,accoladeEnd,spikeEndX,accoladeEnd + barSize);
			canvas.bezierCurveTo(this.x,accoladeEnd - barSize,spikeStartX,accoladeEnd - barSize,spikeStartX,accoladeEnd - barSize);
			canvas.closePath();
			canvas.fill();
		}
	}
	,finalizeGroup: function(scoreLayout) {
		var currentY = 0;
		var _g1 = 0, _g = this.staves.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(i > 0) currentY += 0 * scoreLayout.renderer.scale;
			this.staves[i].x = 0;
			this.staves[i].y = currentY | 0;
			this.staves[i].finalizeStave(scoreLayout);
			currentY += this.staves[i].height;
		}
	}
	,__class__: alphatab.rendering.staves.StaveGroup
}
if(!alphatab.rendering.utils) alphatab.rendering.utils = {}
alphatab.rendering.utils.AccidentalHelper = $hxClasses["alphatab.rendering.utils.AccidentalHelper"] = function() {
	this._registeredAccidentals = new IntHash();
};
alphatab.rendering.utils.AccidentalHelper.__name__ = ["alphatab","rendering","utils","AccidentalHelper"];
alphatab.rendering.utils.AccidentalHelper.prototype = {
	_registeredAccidentals: null
	,applyAccidental: function(note,noteLine) {
		var noteValue = note.realValue();
		var ks = note.beat.voice.bar.getMasterBar().keySignature;
		var index = noteValue % 12;
		var octave = noteValue / 12 | 0;
		var accidentalToSet = alphatab.rendering.utils.AccidentalHelper.ACCIDENTAL_NOTES[ks + 7][index];
		if(this._registeredAccidentals.exists(noteLine)) {
			var registeredAccidental = this._registeredAccidentals.get(noteLine);
			if(registeredAccidental == accidentalToSet) accidentalToSet = alphatab.model.AccidentalType.None; else if(accidentalToSet == alphatab.model.AccidentalType.None) accidentalToSet = alphatab.model.AccidentalType.Natural;
		}
		if(accidentalToSet == alphatab.model.AccidentalType.None || accidentalToSet == alphatab.model.AccidentalType.Natural) this._registeredAccidentals.remove(noteLine); else this._registeredAccidentals.set(noteLine,accidentalToSet);
		return accidentalToSet;
	}
	,getKeySignatureIndex: function(ks) {
		return ks + 7;
	}
	,__class__: alphatab.rendering.utils.AccidentalHelper
}
alphatab.rendering.utils.BeamDirection = $hxClasses["alphatab.rendering.utils.BeamDirection"] = { __ename__ : ["alphatab","rendering","utils","BeamDirection"], __constructs__ : ["Up","Down"] }
alphatab.rendering.utils.BeamDirection.Up = ["Up",0];
alphatab.rendering.utils.BeamDirection.Up.toString = $estr;
alphatab.rendering.utils.BeamDirection.Up.__enum__ = alphatab.rendering.utils.BeamDirection;
alphatab.rendering.utils.BeamDirection.Down = ["Down",1];
alphatab.rendering.utils.BeamDirection.Down.toString = $estr;
alphatab.rendering.utils.BeamDirection.Down.__enum__ = alphatab.rendering.utils.BeamDirection;
alphatab.rendering.utils.BeamBarType = $hxClasses["alphatab.rendering.utils.BeamBarType"] = { __ename__ : ["alphatab","rendering","utils","BeamBarType"], __constructs__ : ["Full","PartLeft","PartRight"] }
alphatab.rendering.utils.BeamBarType.Full = ["Full",0];
alphatab.rendering.utils.BeamBarType.Full.toString = $estr;
alphatab.rendering.utils.BeamBarType.Full.__enum__ = alphatab.rendering.utils.BeamBarType;
alphatab.rendering.utils.BeamBarType.PartLeft = ["PartLeft",1];
alphatab.rendering.utils.BeamBarType.PartLeft.toString = $estr;
alphatab.rendering.utils.BeamBarType.PartLeft.__enum__ = alphatab.rendering.utils.BeamBarType;
alphatab.rendering.utils.BeamBarType.PartRight = ["PartRight",2];
alphatab.rendering.utils.BeamBarType.PartRight.toString = $estr;
alphatab.rendering.utils.BeamBarType.PartRight.__enum__ = alphatab.rendering.utils.BeamBarType;
alphatab.rendering.utils.BeamingHelper = $hxClasses["alphatab.rendering.utils.BeamingHelper"] = function() {
	this.beats = new Array();
	this.valueCalculator = function(n) {
		return n.realValue();
	};
	this._beatLineXPositions = new IntHash();
	this.maxDuration = alphatab.model.Duration.Whole;
};
alphatab.rendering.utils.BeamingHelper.__name__ = ["alphatab","rendering","utils","BeamingHelper"];
alphatab.rendering.utils.BeamingHelper.canJoin = function(b1,b2) {
	if(b1 == null || b2 == null || b1.isRest() || b2.isRest()) return false;
	var m1 = b1.voice.bar;
	var m2 = b1.voice.bar;
	if(m1 != m2) return false;
	var start1 = b1.start;
	var start2 = b2.start;
	if(!alphatab.rendering.utils.BeamingHelper.canJoinDuration(b1.duration) || !alphatab.rendering.utils.BeamingHelper.canJoinDuration(b2.duration)) return start1 == start2;
	var divisionLength = 960;
	switch(m1.track.score.masterBars[m1.index].timeSignatureDenominator) {
	case 8:
		if(m1.track.score.masterBars[m1.index].timeSignatureNumerator % 3 == 0) divisionLength += Math.floor(480.);
		break;
	}
	var division1 = (divisionLength + start1) / divisionLength | 0;
	var division2 = (divisionLength + start2) / divisionLength | 0;
	return division1 == division2;
}
alphatab.rendering.utils.BeamingHelper.calculateDivision = function(b,l) {
	var start = 0;
}
alphatab.rendering.utils.BeamingHelper.canJoinDuration = function(d) {
	switch( (d)[1] ) {
	case 0:
	case 1:
	case 2:
		return false;
	default:
		return true;
	}
}
alphatab.rendering.utils.BeamingHelper.prototype = {
	beats: null
	,_lastBeat: null
	,maxDuration: null
	,firstMinNote: null
	,firstMaxNote: null
	,lastMinNote: null
	,lastMaxNote: null
	,minNote: null
	,maxNote: null
	,valueCalculator: null
	,_beatLineXPositions: null
	,getBeatLineX: function(beat) {
		if(this._beatLineXPositions.exists(beat.index)) {
			if(this.getDirection() == alphatab.rendering.utils.BeamDirection.Up) return this._beatLineXPositions.get(beat.index).up; else return this._beatLineXPositions.get(beat.index).down;
		}
		return 0;
	}
	,registerBeatLineX: function(beat,up,down) {
		this._beatLineXPositions.set(beat.index,{ up : up, down : down});
	}
	,getDirection: function() {
		var avg = (this.valueCalculator(this.maxNote) + this.valueCalculator(this.minNote)) / 2 | 0;
		return avg <= alphatab.rendering.utils.BeamingHelper.SCORE_MIDDLE_KEYS[this._lastBeat.voice.bar.clef[1]]?alphatab.rendering.utils.BeamDirection.Up:alphatab.rendering.utils.BeamDirection.Down;
	}
	,checkBeat: function(beat) {
		var add = false;
		if(this.beats.length == 0) add = true; else if(alphatab.rendering.utils.BeamingHelper.canJoin(this._lastBeat,beat)) add = true;
		if(add) {
			this._lastBeat = beat;
			this.beats.push(beat);
			this.checkNote(beat.minNote);
			this.checkNote(beat.maxNote);
			if(alphatab.model.ModelUtils.getDurationValue(this.maxDuration) < alphatab.model.ModelUtils.getDurationValue(beat.duration)) this.maxDuration = beat.duration;
		}
		return add;
	}
	,checkNote: function(note) {
		var value = note.realValue();
		if(this.firstMinNote == null || note.beat.index < this.firstMinNote.beat.index) this.firstMinNote = note; else if(note.beat.index == this.firstMinNote.beat.index) {
			if(note.realValue() < this.firstMinNote.realValue()) this.firstMinNote = note;
		}
		if(this.firstMaxNote == null || note.beat.index < this.firstMaxNote.beat.index) this.firstMaxNote = note; else if(note.beat.index == this.firstMaxNote.beat.index) {
			if(note.realValue() > this.firstMaxNote.realValue()) this.firstMaxNote = note;
		}
		if(this.lastMinNote == null || note.beat.index > this.lastMinNote.beat.index) this.lastMinNote = note; else if(note.beat.index == this.lastMinNote.beat.index) {
			if(note.realValue() < this.lastMinNote.realValue()) this.lastMinNote = note;
		}
		if(this.lastMaxNote == null || note.beat.index > this.lastMaxNote.beat.index) this.lastMaxNote = note; else if(note.beat.index == this.lastMaxNote.beat.index) {
			if(note.realValue() > this.lastMaxNote.realValue()) this.lastMaxNote = note;
		}
		if(this.maxNote == null || value > this.maxNote.realValue()) this.maxNote = note;
		if(this.minNote == null || value < this.minNote.realValue()) this.minNote = note;
	}
	,calculateBeamY: function(stemSize,xCorrection,xPosition,scale,yPosition) {
		var direction = this.getDirection();
		if(this.beats.length == 1) {
			if(this.getDirection() == alphatab.rendering.utils.BeamDirection.Up) return yPosition(this.maxNote) - stemSize; else return yPosition(this.minNote) + stemSize;
		}
		var maxDistance = 10 * scale | 0;
		if(direction == alphatab.rendering.utils.BeamDirection.Down && this.minNote != this.firstMinNote && this.minNote != this.lastMinNote) return yPosition(this.minNote) + stemSize; else if(direction == alphatab.rendering.utils.BeamDirection.Up && this.maxNote != this.firstMaxNote && this.maxNote != this.lastMaxNote) return yPosition(this.maxNote) - stemSize;
		var startX = this.getBeatLineX(this.firstMinNote.beat) + xCorrection;
		var startY = direction == alphatab.rendering.utils.BeamDirection.Up?yPosition(this.firstMaxNote) - stemSize:yPosition(this.firstMinNote) + stemSize;
		var endX = this.getBeatLineX(this.lastMaxNote.beat) + xCorrection;
		var endY = direction == alphatab.rendering.utils.BeamDirection.Up?yPosition(this.lastMaxNote) - stemSize:yPosition(this.lastMinNote) + stemSize;
		if(startY > endY && startY - endY > maxDistance) endY = startY - maxDistance;
		if(endY > startY && endY - startY > maxDistance) startY = endY - maxDistance;
		return (endY - startY) / (endX - startX) * (xPosition - startX) + startY | 0;
	}
	,__class__: alphatab.rendering.utils.BeamingHelper
}
haxe.Int32 = $hxClasses["haxe.Int32"] = function() { }
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
	if((x >> 30 & 1) != x >>> 31) throw "Overflow " + Std.string(x);
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
	return a * (b & 65535) + (a * (b >>> 16) << 16 | 0) | 0;
}
haxe.Int32.div = function(a,b) {
	return a / b | 0;
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
haxe.Log = $hxClasses["haxe.Log"] = function() { }
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Log.clear = function() {
	js.Boot.__clear_trace();
}
haxe.StackItem = $hxClasses["haxe.StackItem"] = { __ename__ : ["haxe","StackItem"], __constructs__ : ["CFunction","Module","FilePos","Method","Lambda"] }
haxe.StackItem.CFunction = ["CFunction",0];
haxe.StackItem.CFunction.toString = $estr;
haxe.StackItem.CFunction.__enum__ = haxe.StackItem;
haxe.StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.StackItem.Lambda = function(v) { var $x = ["Lambda",4,v]; $x.__enum__ = haxe.StackItem; $x.toString = $estr; return $x; }
haxe.Stack = $hxClasses["haxe.Stack"] = function() { }
haxe.Stack.__name__ = ["haxe","Stack"];
haxe.Stack.callStack = function() {
	return [];
}
haxe.Stack.exceptionStack = function() {
	return [];
}
haxe.Stack.toString = function(stack) {
	var b = new StringBuf();
	var _g = 0;
	while(_g < stack.length) {
		var s = stack[_g];
		++_g;
		b.b[b.b.length] = "\nCalled from ";
		haxe.Stack.itemToString(b,s);
	}
	return b.b.join("");
}
haxe.Stack.itemToString = function(b,s) {
	var $e = (s);
	switch( $e[1] ) {
	case 0:
		b.b[b.b.length] = "a C function";
		break;
	case 1:
		var m = $e[2];
		b.b[b.b.length] = "module ";
		b.b[b.b.length] = m == null?"null":m;
		break;
	case 2:
		var line = $e[4], file = $e[3], s1 = $e[2];
		if(s1 != null) {
			haxe.Stack.itemToString(b,s1);
			b.b[b.b.length] = " (";
		}
		b.b[b.b.length] = file == null?"null":file;
		b.b[b.b.length] = " line ";
		b.b[b.b.length] = line == null?"null":line;
		if(s1 != null) b.b[b.b.length] = ")";
		break;
	case 3:
		var meth = $e[3], cname = $e[2];
		b.b[b.b.length] = cname == null?"null":cname;
		b.b[b.b.length] = ".";
		b.b[b.b.length] = meth == null?"null":meth;
		break;
	case 4:
		var n = $e[2];
		b.b[b.b.length] = "local function #";
		b.b[b.b.length] = n == null?"null":n;
		break;
	}
}
haxe.Stack.makeStack = function(s) {
	return null;
}
if(!haxe.io) haxe.io = {}
haxe.io.Bytes = $hxClasses["haxe.io.Bytes"] = function(length,b) {
	this.length = length;
	this.b = b;
};
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
		var c = s.charCodeAt(i);
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
haxe.io.Bytes.prototype = {
	length: null
	,b: null
	,get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,blit: function(pos,src,srcpos,len) {
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
	,sub: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		return new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
	}
	,compare: function(other) {
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
	,readString: function(pos,len) {
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
	,toString: function() {
		return this.readString(0,this.length);
	}
	,toHex: function() {
		var s = new StringBuf();
		var chars = [];
		var str = "0123456789abcdef";
		var _g1 = 0, _g = str.length;
		while(_g1 < _g) {
			var i = _g1++;
			chars.push(HxOverrides.cca(str,i));
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
	,getData: function() {
		return this.b;
	}
	,__class__: haxe.io.Bytes
}
haxe.io.BytesBuffer = $hxClasses["haxe.io.BytesBuffer"] = function() {
	this.b = new Array();
};
haxe.io.BytesBuffer.__name__ = ["haxe","io","BytesBuffer"];
haxe.io.BytesBuffer.prototype = {
	b: null
	,addByte: function($byte) {
		this.b.push($byte);
	}
	,add: function(src) {
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = 0, _g = src.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,addBytes: function(src,pos,len) {
		if(pos < 0 || len < 0 || pos + len > src.length) throw haxe.io.Error.OutsideBounds;
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = pos, _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,getBytes: function() {
		var bytes = new haxe.io.Bytes(this.b.length,this.b);
		this.b = null;
		return bytes;
	}
	,__class__: haxe.io.BytesBuffer
}
haxe.io.Input = $hxClasses["haxe.io.Input"] = function() { }
haxe.io.Input.__name__ = ["haxe","io","Input"];
haxe.io.Input.prototype = {
	bigEndian: null
	,readByte: function() {
		return (function($this) {
			var $r;
			throw "Not implemented";
			return $r;
		}(this));
	}
	,readBytes: function(s,pos,len) {
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
	,close: function() {
	}
	,setEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,readAll: function(bufsize) {
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
	,readFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.readBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,read: function(nbytes) {
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
	,readUntil: function(end) {
		var buf = new StringBuf();
		var last;
		while((last = this.readByte()) != end) buf.b[buf.b.length] = String.fromCharCode(last);
		return buf.b.join("");
	}
	,readLine: function() {
		var buf = new StringBuf();
		var last;
		var s;
		try {
			while((last = this.readByte()) != 10) buf.b[buf.b.length] = String.fromCharCode(last);
			s = buf.b.join("");
			if(HxOverrides.cca(s,s.length - 1) == 13) s = HxOverrides.substr(s,0,-1);
		} catch( e ) {
			if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
				s = buf.b.join("");
				if(s.length == 0) throw e;
			} else throw(e);
		}
		return s;
	}
	,readFloat: function() {
		var bytes = [];
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		if(this.bigEndian) bytes.reverse();
		var sign = 1 - (bytes[0] >> 7 << 1);
		var exp = (bytes[0] << 1 & 255 | bytes[1] >> 7) - 127;
		var sig = (bytes[1] & 127) << 16 | bytes[2] << 8 | bytes[3];
		if(sig == 0 && exp == -127) return 0.0;
		return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp);
	}
	,readDouble: function() {
		var bytes = [];
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		bytes.push(this.readByte());
		if(this.bigEndian) bytes.reverse();
		var sign = 1 - (bytes[0] >> 7 << 1);
		var exp = (bytes[0] << 4 & 2047 | bytes[1] >> 4) - 1023;
		var sig = this.getDoubleSig(bytes);
		if(sig == 0 && exp == -1023) return 0.0;
		return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
	}
	,readInt8: function() {
		var n = this.readByte();
		if(n >= 128) return n - 256;
		return n;
	}
	,readInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var n = this.bigEndian?ch2 | ch1 << 8:ch1 | ch2 << 8;
		if((n & 32768) != 0) return n - 65536;
		return n;
	}
	,readUInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		return this.bigEndian?ch2 | ch1 << 8:ch1 | ch2 << 8;
	}
	,readInt24: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var n = this.bigEndian?ch3 | ch2 << 8 | ch1 << 16:ch1 | ch2 << 8 | ch3 << 16;
		if((n & 8388608) != 0) return n - 16777216;
		return n;
	}
	,readUInt24: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		return this.bigEndian?ch3 | ch2 << 8 | ch1 << 16:ch1 | ch2 << 8 | ch3 << 16;
	}
	,readInt31: function() {
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
	,readUInt30: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		if((this.bigEndian?ch1:ch4) >= 64) throw haxe.io.Error.Overflow;
		return this.bigEndian?ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24:ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
	,readInt32: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		return this.bigEndian?(ch1 << 8 | ch2) << 16 | (ch3 << 8 | ch4):(ch4 << 8 | ch3) << 16 | (ch2 << 8 | ch1);
	}
	,readString: function(len) {
		var b = haxe.io.Bytes.alloc(len);
		this.readFullBytes(b,0,len);
		return b.toString();
	}
	,getDoubleSig: function(bytes) {
		return Std.parseInt((((bytes[1] & 15) << 16 | bytes[2] << 8 | bytes[3]) * Math.pow(2,32)).toString()) + Std.parseInt(((bytes[4] >> 7) * Math.pow(2,31)).toString()) + Std.parseInt(((bytes[4] & 127) << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7]).toString());
	}
	,__class__: haxe.io.Input
	,__properties__: {set_bigEndian:"setEndian"}
}
haxe.io.BytesInput = $hxClasses["haxe.io.BytesInput"] = function(b,pos,len) {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
};
haxe.io.BytesInput.__name__ = ["haxe","io","BytesInput"];
haxe.io.BytesInput.__super__ = haxe.io.Input;
haxe.io.BytesInput.prototype = $extend(haxe.io.Input.prototype,{
	b: null
	,pos: null
	,len: null
	,readByte: function() {
		if(this.len == 0) throw new haxe.io.Eof();
		this.len--;
		return this.b[this.pos++];
	}
	,readBytes: function(buf,pos,len) {
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
	,__class__: haxe.io.BytesInput
});
haxe.io.Output = $hxClasses["haxe.io.Output"] = function() { }
haxe.io.Output.__name__ = ["haxe","io","Output"];
haxe.io.Output.prototype = {
	bigEndian: null
	,writeByte: function(c) {
		throw "Not implemented";
	}
	,writeBytes: function(s,pos,len) {
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
	,flush: function() {
	}
	,close: function() {
	}
	,setEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,write: function(s) {
		var l = s.length;
		var p = 0;
		while(l > 0) {
			var k = this.writeBytes(s,p,l);
			if(k == 0) throw haxe.io.Error.Blocked;
			p += k;
			l -= k;
		}
	}
	,writeFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.writeBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,writeFloat: function(x) {
		if(x == 0.0) {
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			return;
		}
		var exp = Math.floor(Math.log(Math.abs(x)) / haxe.io.Output.LN2);
		var sig = Math.floor(Math.abs(x) / Math.pow(2,exp) * 8388608) & 8388607;
		var b1 = exp + 127 >> 1 | (exp > 0?x < 0?128:64:x < 0?128:0), b2 = exp + 127 << 7 & 255 | sig >> 16 & 127, b3 = sig >> 8 & 255, b4 = sig & 255;
		if(this.bigEndian) {
			this.writeByte(b4);
			this.writeByte(b3);
			this.writeByte(b2);
			this.writeByte(b1);
		} else {
			this.writeByte(b1);
			this.writeByte(b2);
			this.writeByte(b3);
			this.writeByte(b4);
		}
	}
	,writeDouble: function(x) {
		if(x == 0.0) {
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			this.writeByte(0);
			return;
		}
		var exp = Math.floor(Math.log(Math.abs(x)) / haxe.io.Output.LN2);
		var sig = Math.floor(Math.abs(x) / Math.pow(2,exp) * Math.pow(2,52));
		var sig_h = sig & 34359738367;
		var sig_l = Math.floor(sig / Math.pow(2,32));
		var b1 = exp + 1023 >> 4 | (exp > 0?x < 0?128:64:x < 0?128:0), b2 = exp + 1023 << 4 & 255 | sig_l >> 16 & 15, b3 = sig_l >> 8 & 255, b4 = sig_l & 255, b5 = sig_h >> 24 & 255, b6 = sig_h >> 16 & 255, b7 = sig_h >> 8 & 255, b8 = sig_h & 255;
		if(this.bigEndian) {
			this.writeByte(b8);
			this.writeByte(b7);
			this.writeByte(b6);
			this.writeByte(b5);
			this.writeByte(b4);
			this.writeByte(b3);
			this.writeByte(b2);
			this.writeByte(b1);
		} else {
			this.writeByte(b1);
			this.writeByte(b2);
			this.writeByte(b3);
			this.writeByte(b4);
			this.writeByte(b5);
			this.writeByte(b6);
			this.writeByte(b7);
			this.writeByte(b8);
		}
	}
	,writeInt8: function(x) {
		if(x < -128 || x >= 128) throw haxe.io.Error.Overflow;
		this.writeByte(x & 255);
	}
	,writeInt16: function(x) {
		if(x < -32768 || x >= 32768) throw haxe.io.Error.Overflow;
		this.writeUInt16(x & 65535);
	}
	,writeUInt16: function(x) {
		if(x < 0 || x >= 65536) throw haxe.io.Error.Overflow;
		if(this.bigEndian) {
			this.writeByte(x >> 8);
			this.writeByte(x & 255);
		} else {
			this.writeByte(x & 255);
			this.writeByte(x >> 8);
		}
	}
	,writeInt24: function(x) {
		if(x < -8388608 || x >= 8388608) throw haxe.io.Error.Overflow;
		this.writeUInt24(x & 16777215);
	}
	,writeUInt24: function(x) {
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
	,writeInt31: function(x) {
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
	,writeUInt30: function(x) {
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
	,writeInt32: function(x) {
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
	,prepare: function(nbytes) {
	}
	,writeInput: function(i,bufsize) {
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
	,writeString: function(s) {
		var b = haxe.io.Bytes.ofString(s);
		this.writeFullBytes(b,0,b.length);
	}
	,__class__: haxe.io.Output
	,__properties__: {set_bigEndian:"setEndian"}
}
haxe.io.BytesOutput = $hxClasses["haxe.io.BytesOutput"] = function() {
	this.b = new haxe.io.BytesBuffer();
};
haxe.io.BytesOutput.__name__ = ["haxe","io","BytesOutput"];
haxe.io.BytesOutput.__super__ = haxe.io.Output;
haxe.io.BytesOutput.prototype = $extend(haxe.io.Output.prototype,{
	b: null
	,writeByte: function(c) {
		this.b.b.push(c);
	}
	,writeBytes: function(buf,pos,len) {
		this.b.addBytes(buf,pos,len);
		return len;
	}
	,getBytes: function() {
		return this.b.getBytes();
	}
	,__class__: haxe.io.BytesOutput
});
haxe.io.Eof = $hxClasses["haxe.io.Eof"] = function() {
};
haxe.io.Eof.__name__ = ["haxe","io","Eof"];
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
}
haxe.io.Error = $hxClasses["haxe.io.Error"] = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] }
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
haxe.unit.TestResult = $hxClasses["haxe.unit.TestResult"] = function() {
	this.m_tests = new List();
	this.success = true;
};
haxe.unit.TestResult.__name__ = ["haxe","unit","TestResult"];
haxe.unit.TestResult.prototype = {
	m_tests: null
	,success: null
	,add: function(t) {
		this.m_tests.add(t);
		if(!t.success) this.success = false;
	}
	,toString: function() {
		var buf = new StringBuf();
		var failures = 0;
		var $it0 = this.m_tests.iterator();
		while( $it0.hasNext() ) {
			var test = $it0.next();
			if(test.success == false) {
				buf.b[buf.b.length] = "* ";
				buf.add(test.classname);
				buf.b[buf.b.length] = "::";
				buf.add(test.method);
				buf.b[buf.b.length] = "()";
				buf.b[buf.b.length] = "\n";
				buf.b[buf.b.length] = "ERR: ";
				if(test.posInfos != null) {
					buf.add(test.posInfos.fileName);
					buf.b[buf.b.length] = ":";
					buf.add(test.posInfos.lineNumber);
					buf.b[buf.b.length] = "(";
					buf.add(test.posInfos.className);
					buf.b[buf.b.length] = ".";
					buf.add(test.posInfos.methodName);
					buf.b[buf.b.length] = ") - ";
				}
				buf.add(test.error);
				buf.b[buf.b.length] = "\n";
				if(test.backtrace != null) {
					buf.add(test.backtrace);
					buf.b[buf.b.length] = "\n";
				}
				buf.b[buf.b.length] = "\n";
				failures++;
			}
		}
		buf.b[buf.b.length] = "\n";
		if(failures == 0) buf.b[buf.b.length] = "OK "; else buf.b[buf.b.length] = "FAILED ";
		buf.add(this.m_tests.length);
		buf.b[buf.b.length] = " tests, ";
		buf.b[buf.b.length] = failures == null?"null":failures;
		buf.b[buf.b.length] = " failed, ";
		buf.add(this.m_tests.length - failures);
		buf.b[buf.b.length] = " success";
		buf.b[buf.b.length] = "\n";
		return buf.b.join("");
	}
	,__class__: haxe.unit.TestResult
}
haxe.unit.TestRunner = $hxClasses["haxe.unit.TestRunner"] = function() {
	this.result = new haxe.unit.TestResult();
	this.cases = new List();
};
haxe.unit.TestRunner.__name__ = ["haxe","unit","TestRunner"];
haxe.unit.TestRunner.print = function(v) {
	var msg = StringTools.htmlEscape(js.Boot.__string_rec(v,"")).split("\n").join("<br/>");
	var d = document.getElementById("haxe:trace");
	if(d == null) alert("haxe:trace element not found"); else d.innerHTML += msg;
}
haxe.unit.TestRunner.customTrace = function(v,p) {
	haxe.unit.TestRunner.print(p.fileName + ":" + p.lineNumber + ": " + Std.string(v) + "\n");
}
haxe.unit.TestRunner.prototype = {
	result: null
	,cases: null
	,add: function(c) {
		this.cases.add(c);
	}
	,run: function() {
		this.result = new haxe.unit.TestResult();
		var $it0 = this.cases.iterator();
		while( $it0.hasNext() ) {
			var c = $it0.next();
			this.runCase(c);
		}
		haxe.unit.TestRunner.print(this.result.toString());
		return this.result.success;
	}
	,runCase: function(t) {
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
					if(e.message != null) t.currentTest.error = "exception thrown : " + Std.string(e) + " [" + Std.string(e.message) + "]"; else t.currentTest.error = "exception thrown : " + Std.string(e);
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
	,__class__: haxe.unit.TestRunner
}
haxe.unit.TestStatus = $hxClasses["haxe.unit.TestStatus"] = function() {
	this.done = false;
	this.success = false;
};
haxe.unit.TestStatus.__name__ = ["haxe","unit","TestStatus"];
haxe.unit.TestStatus.prototype = {
	done: null
	,success: null
	,error: null
	,method: null
	,classname: null
	,posInfos: null
	,backtrace: null
	,__class__: haxe.unit.TestStatus
}
var js = js || {}
js.Boot = $hxClasses["js.Boot"] = function() { }
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__string_rec(v,"");
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
}
js.Boot.isClass = function(o) {
	return o.__name__;
}
js.Boot.isEnum = function(e) {
	return e.__ename__;
}
js.Boot.getClass = function(o) {
	return o.__class__;
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
		if(cl == Class && o.__name__ != null) return true; else null;
		if(cl == Enum && o.__ename__ != null) return true; else null;
		return o.__enum__ == cl;
	}
}
js.Boot.__cast = function(o,t) {
	if(js.Boot.__instanceof(o,t)) return o; else throw "Cannot cast " + Std.string(o) + " to " + Std.string(t);
}
js.Lib = $hxClasses["js.Lib"] = function() { }
js.Lib.__name__ = ["js","Lib"];
js.Lib.document = null;
js.Lib.window = null;
js.Lib.debug = function() {
	debugger;
}
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
}
js.Lib.eval = function(code) {
	return eval(code);
}
js.Lib.setErrorHandler = function(f) {
	js.Lib.onerror = f;
}
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
var Void = $hxClasses.Void = { __ename__ : ["Void"]};
if(typeof document != "undefined") js.Lib.document = document;
if(typeof window != "undefined") {
	js.Lib.window = window;
	js.Lib.window.onerror = function(msg,url,line) {
		var f = js.Lib.onerror;
		if(f == null) return false;
		return f(msg,[url + ":" + line]);
	};
}
js.XMLHttpRequest = window.XMLHttpRequest?XMLHttpRequest:window.ActiveXObject?function() {
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
alphatab.audio.MidiUtils.QUARTER_TIME = 960;
alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT = "unsupported file";
alphatab.importer.AlphaTexImporter.EOL = String.fromCharCode(0);
alphatab.importer.AlphaTexImporter.TRACK_CHANNELS = [0,1];
alphatab.importer.Gp3To5Importer.VERSION_STRING = "FICHIER GUITAR PRO ";
alphatab.importer.Gp3To5Importer.BEND_STEP = 25;
alphatab.model.Tuning.TUNING_REGEX = new EReg("([a-g]b?)([0-9])","i");
alphatab.platform.PlatformFactory.SVG_CANVAS = "svg";
alphatab.platform.model.Font.STYLE_PLAIN = 0;
alphatab.platform.model.Font.STYLE_BOLD = 1;
alphatab.platform.model.Font.STYLE_ITALIC = 2;
alphatab.platform.svg.FontSizes.TIMES_NEW_ROMAN_11PT = [3,4,5,6,6,9,9,2,4,4,6,6,3,4,3,3,6,6,6,6,6,6,6,6,6,6,3,3,6,6,6,5,10,8,7,7,8,7,6,7,8,4,4,8,7,10,8,8,7,8,7,5,8,8,7,11,8,8,7,4,3,4,5,6,4,5,5,5,5,5,4,5,6,3,3,6,3,9,6,6,6,5,4,4,4,5,6,7,6,6,5,5,2,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,6,6,6,6,2,5,4,8,4,6,6,0,8,6,4,6,3,3,4,5,5,4,4,3,3,6,8,8,8,5,8,8,8,8,8,8,11,7,7,7,7,7,4,4,4,4,8,8,8,8,8,8,8,6,8,8,8,8,8,8,6,5,5,5,5,5,5,5,8,5,5,5,5,5,3,3,3,3,6,6,6,6,6,6,6,6,6,5,5,5,5,6,6];
alphatab.platform.svg.FontSizes.ARIAL_11PT = [3,2,4,6,6,10,7,2,4,4,4,6,3,4,3,3,6,6,6,6,6,6,6,6,6,6,3,3,6,6,6,6,11,8,7,7,7,6,6,8,7,2,5,7,6,8,7,8,6,8,7,7,6,7,8,10,7,8,7,3,3,3,5,6,4,6,6,6,6,6,4,6,6,2,2,5,2,8,6,6,6,6,4,6,3,6,6,10,6,6,6,4,2,4,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,6,6,7,6,2,6,4,8,4,6,6,0,8,6,4,6,4,4,4,6,6,4,4,4,5,6,9,10,10,6,8,8,8,8,8,8,11,7,6,6,6,6,2,2,2,2,8,7,8,8,8,8,8,6,8,7,7,7,7,8,7,7,6,6,6,6,6,6,10,6,6,6,6,6,2,2,2,2,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6];
alphatab.platform.svg.FontSizes.CONTROL_CHARS = 32;
alphatab.rendering.GlyphBarRenderer.FirstGlyphSpacing = 10;
alphatab.rendering.ScoreBarRenderer.STEPS_PER_OCTAVE = 7;
alphatab.rendering.ScoreBarRenderer.OCTAVE_STEPS = [32,30,26,38];
alphatab.rendering.ScoreBarRenderer.SHARP_NOTE_STEPS = [0,0,1,1,2,3,3,4,4,5,5,6];
alphatab.rendering.ScoreBarRenderer.FLAT_NOTE_STEPS = [0,1,1,2,2,3,4,4,5,5,6,6];
alphatab.rendering.ScoreBarRenderer.SHARP_KS_STEPS = [0,3,-1,2,5,1,4];
alphatab.rendering.ScoreBarRenderer.FLAT_KS_STEPS = [4,1,5,2,6,3,7];
alphatab.rendering.ScoreBarRenderer.LineSpacing = 8;
alphatab.rendering.ScoreBarRenderer.NOTE_STEP_CORRECTION = 1;
alphatab.rendering.TabBarRenderer.LineSpacing = 10;
alphatab.rendering.glyphs.FlatGlyph.CORRECTION = -8;
alphatab.rendering.glyphs.MusicFont.Num0 = "M 0.00 7.99 C -0.00 10.44 0.57 13.08 2.37 14.84 4.18 16.54 7.44 16.36 8.93 14.32 10.61 12.22 10.97 9.39 10.78 6.78 10.62 4.66 9.96 2.42 8.31 0.97 6.53 -0.48 3.60 -0.29 2.11 1.49 0.53 3.25 -0.00 5.69 0.00 7.99 z M 5.46 15.13 C 4.46 15.17 3.80 14.18 3.64 13.29 3.03 10.66 3.00 7.93 3.19 5.25 3.32 3.95 3.53 2.57 4.31 1.48 4.74 0.87 5.67 0.62 6.26 1.14 c 0.83 0.69 1.03 1.84 1.25 2.84 0.43 2.46 0.39 4.99 0.13 7.47 -0.15 1.22 -0.44 2.57 -1.43 3.40 -0.21 0.15 -0.48 0.25 -0.75 0.26 z";
alphatab.rendering.glyphs.MusicFont.Num1 = "m 2.36 14.48 c 0 -3.87 0 -7.74 0 -11.61 C 1.69 4.15 1.01 5.42 0.34 6.7 0.23 6.54 -0.11 6.44 0.06 6.22 0.83 4.14 1.59 2.07 2.36 -8.04e-8 c 1.09 0 2.18 0 3.26 0 0 4.81 0 9.62 0 14.43 0.11 0.73 1 0.75 1.57 0.86 0 0.24 0 0.47 0 0.71 -2.13 0 -4.25 0 -6.38 0 0 -0.22 0 -0.44 0 -0.66 C 1.34 15.22 1.98 15.2 2.31 14.7 l 0.04 -0.11 0.01 -0.11 0 0 z";
alphatab.rendering.glyphs.MusicFont.Num2 = "M 3.85 1.11 C 3.32 1.21 2.1 1.37 2.27 2.07 2.67 2.48 3.62 2.08 4.03 2.69 4.75 3.6 4.54 5.13 3.54 5.77 2.47 6.55 0.7 5.98 0.42 4.65 0.08 3.16 0.99 1.68 2.2 0.89 3.47 -0.05 5.13 -0.15 6.63 0.14 8.35 0.44 10.17 1.45 10.71 3.21 11.09 4.36 10.77 5.67 9.91 6.52 8.88 7.62 7.45 8.16 6.21 8.97 5.29 9.48 4.4 10.07 3.69 10.86 3.15 11.41 2.75 12.06 2.32 12.69 3.58 11.96 5.15 11.47 6.56 12.08 c 0.95 0.31 1.61 1.07 2.42 1.6 0.8 0.43 1.88 -0.18 2.04 -1.06 0.14 -0.38 -0.08 -1.05 0.51 -0.88 0 1.34 -0.22 2.91 -1.38 3.76 -1.28 0.84 -2.98 0.49 -4.21 -0.25 -1.07 -0.69 -2.23 -1.52 -3.58 -1.31 -0.7 0.04 -1.55 0.4 -1.55 1.21 0.03 0.51 -0.25 0.64 -0.69 0.57 C -0.13 15.35 0.24 14.47 0.46 13.97 1.46 11.79 3.35 10.24 4.96 8.53 6.02 7.37 7.19 6.26 7.94 4.87 8.18 4.24 7.99 3.53 7.75 2.92 7.1 1.44 5.3 1.1 3.85 1.11 z";
alphatab.rendering.glyphs.MusicFont.Num3 = "M 3.22 8.29 C 3.23 8.01 3.1 7.62 3.54 7.72 4.49 7.43 5.46 7.06 6.26 6.45 7.1 5.78 7.29 4.61 7.05 3.61 6.73 2.07 5.23 0.71 3.6 0.92 2.89 0.97 2.15 1.23 1.72 1.82 1.74 2.68 3.01 2.05 3.3 2.84 3.67 3.53 3.69 4.51 3.15 5.12 2.55 5.68 1.58 5.71 0.85 5.42 0.01 5.03 -0.06 3.95 0.03 3.15 0.13 1.84 1.12 0.72 2.37 0.37 3.58 0.02 4.88 -0.09 6.13 0.08 8.23 0.48 10.01 2.41 9.97 4.59 9.99 5.54 9.71 6.56 8.9 7.13 8.55 7.51 7.7 7.79 7.51 8.03 8.58 8.44 9.59 9.24 9.84 10.4 10.24 11.96 9.69 13.7 8.45 14.73 7.42 15.7 5.97 16.12 4.57 15.99 3.13 15.92 1.48 15.62 0.59 14.37 -0.04 13.45 -0.17 12.21 0.2 11.17 0.58 10.38 1.62 10.33 2.38 10.46 c 0.72 0.1 1.21 0.8 1.18 1.51 0.05 0.67 -0.18 1.54 -0.95 1.67 -0.44 0.08 -1.01 -0.03 -0.69 0.57 0.43 0.7 1.47 0.83 2.25 0.83 C 5.8 14.9 7.14 13.37 7.18 11.75 7.33 10.64 6.6 9.62 5.64 9.14 4.9 8.75 4.13 8.36 3.29 8.31 c -0.03 0 -0.05 -0.01 -0.08 -0.01 z";
alphatab.rendering.glyphs.MusicFont.Num4 = "M 8.59 0 C 7.19 2.33 5.9 4.72 4.32 6.93 3.6 7.94 2.96 9.02 2.27 10.05 c -0.32 0.5 -0.65 1 -0.97 1.51 1.39 0 2.78 0 4.17 0 0 -1.73 0 -3.45 0 -5.18 C 6.65 5.4 7.83 4.42 9.01 3.44 c 0 2.71 0 5.42 0 8.12 0.5 0 1 0 1.5 0 0 0.24 0 0.47 0 0.71 -0.5 0 -1 0 -1.5 0 0.07 0.8 -0.13 1.72 0.32 2.42 0.26 0.44 1.11 0.34 1.18 0.79 -0.05 0.19 0.14 0.61 -0.19 0.52 -2.14 0 -4.29 0 -6.43 0 0 -0.24 0 -0.47 0 -0.71 0.55 -0.2 1.46 -0.31 1.48 -1.05 0.05 -0.65 0.06 -1.31 0.11 -1.97 -1.82 0 -3.65 0 -5.47 0 C 0 12.03 0 11.8 0 11.56 1.69 10.37 2.77 8.48 3.38 6.55 3.79 4.36 4.2 2.18 4.61 0 5.94 0 7.26 0 8.59 0 z";
alphatab.rendering.glyphs.MusicFont.Num5 = "M 0.66 0 C 1.76 0.32 2.92 0.45 4.06 0.55 5.57 0.61 7.1 0.43 8.57 0.05 8.59 0.92 8.37 1.88 7.62 2.41 7 2.88 6.18 2.89 5.45 3 4.24 3.07 3.01 2.97 1.83 2.7 1.48 2.4 1.68 3.01 1.62 3.22 c 0 1.27 0 2.53 0 3.8 0.82 -0.93 2.05 -1.53 3.31 -1.39 1.75 0.04 3.55 1 4.22 2.68 C 9.94 10.33 9.22 12.72 7.73 14.23 6.61 15.47 4.92 16.14 3.26 15.99 2.03 15.88 0.67 15.28 0.25 14.04 -0.02 13.19 -0.16 12.2 0.25 11.37 0.73 10.53 1.87 10.47 2.71 10.7 3.53 10.9 3.87 11.82 3.79 12.59 3.8 13.31 3.33 14.07 2.56 14.13 2.18 14.28 1.61 14.49 2.22 14.78 3.24 15.48 4.8 15.51 5.7 14.58 6.89 13.39 7.07 11.57 7 9.96 6.89 8.75 6.37 7.41 5.22 6.84 3.97 6.29 2.37 6.8 1.68 7.98 1.53 8.17 1.19 8.03 0.96 8.07 0.62 8.17 0.64 7.92 0.66 7.66 c 0 -2.55 0 -5.11 0 -7.66 z";
alphatab.rendering.glyphs.MusicFont.Num6 = "M 7.93 1.53 C 7.56 0.85 6.71 0.49 5.94 0.52 4.82 0.56 4.18 1.66 3.88 2.62 3.35 4.32 3.15 6.16 3.49 7.93 3.54 8.37 3.92 8.63 4.13 8.12 5.06 7.07 6.65 6.72 7.97 7.14 9.42 7.71 10.23 9.29 10.37 10.77 10.53 12.37 9.98 14.11 8.63 15.06 6.81 16.44 3.96 16.31 2.39 14.6 0.9 12.97 0.19 10.75 0.04 8.58 -0.18 6.28 0.56 3.93 2.03 2.15 3.04 0.86 4.6 -0.11 6.28 0.01 7.59 0.02 8.97 0.64 9.54 1.88 9.98 2.82 10.18 4.13 9.38 4.95 8.96 5.48 8.26 5.69 7.61 5.5 6.9 5.4 6.31 4.82 6.25 4.1 6.08 3.28 6.33 2.33 7.09 1.89 7.34 1.71 7.62 1.57 7.93 1.53 z M 7.71 11.72 C 7.67 10.66 7.76 9.51 7.19 8.56 6.59 7.5 4.72 7.59 4.31 8.78 3.84 10.14 3.82 11.61 3.98 13.03 c 0.14 0.82 0.31 1.87 1.2 2.2 0.72 0.29 1.63 -0.01 1.94 -0.74 0.41 -0.86 0.57 -1.82 0.59 -2.77 z";
alphatab.rendering.glyphs.MusicFont.Num7 = "M 2.97 16 C 3.15 14.66 3.24 13.27 3.84 12.02 4.33 10.82 5.19 9.83 6.14 8.96 7.36 7.69 8.64 6.4 9.38 4.79 9.59 4.25 9.66 3.67 9.79 3.12 8.69 3.83 7.34 4.39 6.02 3.99 4.95 3.75 4.06 3.09 3.08 2.65 2.38 2.35 1.34 2.38 0.98 3.17 0.78 3.58 0.62 3.96 0.12 3.83 -0.13 3.85 0.06 3.43 0 3.26 0 2.34 0 1.43 0 0.52 0.38 0.45 0.63 0.56 0.69 0.97 0.88 1.7 1.76 1.48 2.19 1.12 2.92 0.67 3.64 0.1 4.52 0 5.48 -0.03 6.3 0.52 7.07 1.02 7.73 1.37 8.7 1.7 9.31 1.08 9.75 0.84 9.47 -0.08 10.01 0 10.28 -0.03 10.5 -0.03 10.4 0.31 10.38 1.58 10.46 2.86 10.34 4.13 10.24 5.12 9.88 6.06 9.33 6.89 8.72 7.98 8.01 9.02 7.45 10.13 6.91 11.48 6.76 12.95 6.73 14.38 6.68 14.88 7.04 15.76 6.69 16 5.45 16 4.21 16 2.97 16 z";
alphatab.rendering.glyphs.MusicFont.Num8 = "M 6.97 7.18 C 7.96 7.59 8.61 8.51 9.23 9.34 9.71 9.98 9.88 10.8 9.76 11.58 9.66 13.11 8.81 14.58 7.46 15.33 5.48 16.48 2.64 16.15 1.15 14.34 0.26 13.3 -0.1 11.87 0.02 10.52 0.3 9.39 1.21 8.5 2.2 7.94 2.89 7.75 1.76 7.47 1.61 7.13 0.1 5.63 -0.1 2.86 1.5 1.35 3.29 -0.4 6.51 -0.5 8.27 1.36 9.09 2.23 9.43 3.49 9.31 4.67 9.04 5.65 8.25 6.4 7.43 6.95 7.29 7.04 7.13 7.12 6.97 7.18 z M 6.16 6.54 C 7.34 6 8.09 4.61 7.81 3.32 7.66 2.1 6.72 0.95 5.45 0.81 4.37 0.6 3.18 1.02 2.61 1.99 2.22 2.58 2.07 3.48 2.66 4 3.69 5.04 5.13 5.51 6.16 6.54 z M 3.17 8.44 C 2.19 8.9 1.31 9.78 1.26 10.92 1.11 12.72 2.32 14.69 4.17 15.01 5.32 15.21 6.73 15.01 7.4 13.94 7.83 13.37 7.9 12.54 7.43 11.97 6.35 10.42 4.51 9.72 3.17 8.44 z";
alphatab.rendering.glyphs.MusicFont.Num9 = "m 2.46 14.47 c 0.29 0.65 1.09 0.94 1.76 1.01 1.1 0.1 1.93 -0.87 2.24 -1.83 0.55 -1.74 0.69 -3.61 0.43 -5.41 C 6.87 7.79 6.47 7.26 6.22 7.88 5.24 8.98 3.53 9.34 2.18 8.77 0.99 8.19 0.32 6.88 0.07 5.62 -0.22 3.91 0.3 1.97 1.76 0.94 3.55 -0.42 6.33 -0.31 7.93 1.3 9.74 3.09 10.4 5.74 10.39 8.22 10.41 10.83 9.17 13.42 7.12 15.04 5.69 16.16 3.56 16.33 1.99 15.41 0.83 14.66 0.19 13.12 0.55 11.77 0.85 10.85 1.86 10.24 2.82 10.48 c 0.72 0.09 1.28 0.71 1.33 1.42 0.19 0.86 -0.16 1.8 -0.92 2.27 -0.23 0.16 -0.49 0.27 -0.76 0.3 z M 2.68 4.28 C 2.73 5.38 2.62 6.6 3.28 7.56 3.94 8.53 5.67 8.32 6.03 7.18 6.54 5.72 6.61 4.13 6.36 2.61 6.23 1.73 5.67 0.71 4.67 0.67 3.84 0.55 3.14 1.22 2.98 1.99 2.76 2.73 2.68 3.51 2.68 4.28 z";
alphatab.rendering.glyphs.MusicFont.TrebleClef = "m 12.59 0 c 2.7 1.29 2.98 5.15 3.47 7.79 0.22 4.83 -1.46 9.94 -5.32 13.04 0.32 1.61 0.63 3.22 0.95 4.83 3.43 -0.81 7.18 1.04 8.41 4.39 1.63 3.61 0.97 8.6 -2.85 10.54 -2.1 0.44 -2.9 1.25 -2.1 3.23 0.27 2.38 1.27 4.75 0.81 7.14 -1.19 3.63 -6.7 5.59 -9.39 2.39 C 3.23 51.02 5.74 45.06 9.8 46.71 13.45 47.85 11.75 53.84 8.1 53 c 2.3 2.55 6.27 0.67 7.16 -2.21 0.42 -2.48 -0.55 -4.95 -0.84 -7.42 C 14.64 40.51 11.15 42.78 9.42 41.93 2.94 41.14 -2.13 33.51 0.9 27.4 2.85 23.29 5.93 19.8 9.2 16.68 8.1 12.71 7.19 8.36 8.84 4.39 9.55 2.66 10.4 0.17 12.59 0 z M 11 25.71 c -0.28 -1.46 -0.57 -2.93 -0.85 -4.39 -3.08 3.09 -6.5 6.49 -7.28 10.97 -0.78 5 4.52 9.16 9.2 8.84 2.38 0.26 1.53 -1.63 1.24 -3.06 -0.62 -3.07 -1.24 -6.14 -1.86 -9.21 -3.95 0.27 -6.15 6.08 -2.88 8.62 0.75 1.11 5.35 2.82 1.83 1.77 C 6.94 37.88 4.59 33.92 5.95 30.3 6.7 28.02 8.65 26.22 11 25.71 z m 3.78 -19.02 c 0.53 -3.18 -3.29 -3.92 -4 -0.83 -1.76 3.04 -1.8 6.6 -1.05 9.94 0.96 0.42 3.17 -2.31 3.81 -3.67 0.95 -1.63 1.59 -3.55 1.24 -5.45 z m -2.54 22.17 c 0.75 3.81 1.5 7.63 2.24 11.44 3.92 -0.62 5.81 -5.58 3.62 -8.78 -1.23 -1.94 -3.6 -2.98 -5.86 -2.66 z";
alphatab.rendering.glyphs.MusicFont.AltoClef = "M 0 32 C 0 21.38 0 10.77 0 0.15 c 1.33 0 2.66 0 3.99 0 0 10.62 0 21.23 0 31.85 C 2.66 32 1.33 32 0 32 z m 5.35 0 c 0 -10.62 0 -21.23 0 -31.85 0.39 0.09 1.17 -0.19 1.31 0.16 0 10.57 0 21.13 0 31.7 -0.44 0 -0.87 0 -1.31 0 z M 9.34 18.17 C 8.85 17.25 7.32 16.44 7.05 15.9 c 2.11 -1.25 3.59 -3.49 3.95 -5.92 0.15 1.3 0.74 2.78 2.15 3.09 1.39 0.43 3.17 0.18 3.92 -1.22 C 18.24 9.71 18.15 7.13 17.95 4.76 17.78 3.06 16.96 0.96 15.02 0.72 13.91 0.57 11.57 0.97 11.76 2.28 c 1.28 -0.3 2.92 0.73 2.5 2.19 -0.37 1.9 -3.18 2.09 -4.2 0.62 -1.03 -1.34 0.04 -3.16 1.27 -3.94 2.83 -1.99 7.29 -1.4 9.27 1.53 2.17 3.1 1.38 7.77 -1.6 10.08 -1.75 1.45 -4.25 2.14 -6.46 1.5 -1.25 -0.78 -1.4 1.51 -2.65 1.79 1.22 0.33 1.47 2.76 2.71 1.95 1.83 -0.61 3.93 -0.16 5.57 0.79 2.67 1.56 4.19 4.78 3.65 7.83 -0.43 3.08 -3.39 5.43 -6.46 5.38 -2.28 0.13 -4.93 -1.05 -5.57 -3.4 -0.57 -2.02 2.25 -3.54 3.76 -2.24 1.14 0.73 1.13 2.73 -0.26 3.18 -0.66 0.26 -2.36 0.07 -1.07 1.03 1.43 1.1 3.86 1.14 4.88 -0.54 1.23 -2.05 1.09 -4.59 0.9 -6.89 -0.21 -1.71 -0.87 -3.95 -2.84 -4.27 -1.35 -0.16 -3.1 0.14 -3.59 1.62 -0.35 0.58 -0.41 2.41 -0.61 0.83 -0.29 -1.15 -0.86 -2.23 -1.61 -3.14 z";
alphatab.rendering.glyphs.MusicFont.TenorClef = "M 0 32 C 0 21.38 0 10.77 0 0.15 c 1.33 0 2.66 0 3.99 0 0 10.62 0 21.23 0 31.85 C 2.66 32 1.33 32 0 32 z m 5.35 0 c 0 -10.62 0 -21.23 0 -31.85 0.39 0.09 1.17 -0.19 1.31 0.16 0 10.57 0 21.13 0 31.7 -0.44 0 -0.87 0 -1.31 0 z M 9.34 18.17 C 8.85 17.25 7.32 16.44 7.05 15.9 c 2.11 -1.25 3.59 -3.49 3.95 -5.92 0.15 1.3 0.74 2.78 2.15 3.09 1.39 0.43 3.17 0.18 3.92 -1.22 C 18.24 9.71 18.15 7.13 17.95 4.76 17.78 3.06 16.96 0.96 15.02 0.72 13.91 0.57 11.57 0.97 11.76 2.28 c 1.28 -0.3 2.92 0.73 2.5 2.19 -0.37 1.9 -3.18 2.09 -4.2 0.62 -1.03 -1.34 0.04 -3.16 1.27 -3.94 2.83 -1.99 7.29 -1.4 9.27 1.53 2.17 3.1 1.38 7.77 -1.6 10.08 -1.75 1.45 -4.25 2.14 -6.46 1.5 -1.25 -0.78 -1.4 1.51 -2.65 1.79 1.22 0.33 1.47 2.76 2.71 1.95 1.83 -0.61 3.93 -0.16 5.57 0.79 2.67 1.56 4.19 4.78 3.65 7.83 -0.43 3.08 -3.39 5.43 -6.46 5.38 -2.28 0.13 -4.93 -1.05 -5.57 -3.4 -0.57 -2.02 2.25 -3.54 3.76 -2.24 1.14 0.73 1.13 2.73 -0.26 3.18 -0.66 0.26 -2.36 0.07 -1.07 1.03 1.43 1.1 3.86 1.14 4.88 -0.54 1.23 -2.05 1.09 -4.59 0.9 -6.89 -0.21 -1.71 -0.87 -3.95 -2.84 -4.27 -1.35 -0.16 -3.1 0.14 -3.59 1.62 -0.35 0.58 -0.41 2.41 -0.61 0.83 -0.29 -1.15 -0.86 -2.23 -1.61 -3.14 z";
alphatab.rendering.glyphs.MusicFont.BassClef = "M 4.44 2.42 C 3.48 3.2 3.45 5.34 4.96 5.44 6.05 5.76 7.62 5.57 8.09 6.88 8.46 8 8.36 9.52 7.18 10.13 5.64 11.02 3.46 11.09 2.03 9.94 0.65 8.76 0.96 6.72 1.42 5.18 2.1 3.05 3.6 0.9 5.9 0.38 c 3.09 -0.82 6.79 -0.41 9.09 2 2.38 2.38 3.52 6.21 2.02 9.35 -1.51 3.28 -4.31 5.71 -7.08 7.91 -2.66 2.01 -5.53 3.78 -8.59 5.11 -0.49 0.46 -1.68 0.21 -1.19 -0.4 C 3.76 22.94 7.03 20.65 9.63 17.79 11.95 15.13 12.83 11.53 13 8.08 13.12 5.82 12.46 3.29 10.45 2 8.62 0.77 6.09 0.99 4.44 2.42 z M 20.84 2.57 c 1.6 -0.11 2.58 2.03 1.54 3.21 -0.89 1.19 -3.02 0.83 -3.39 -0.64 -0.43 -1.24 0.53 -2.58 1.85 -2.57 z m 0 7.01 c 1.6 -0.11 2.58 2.03 1.54 3.21 -0.89 1.19 -3.02 0.83 -3.39 -0.64 -0.43 -1.23 0.54 -2.59 1.85 -2.57 z";
alphatab.rendering.glyphs.MusicFont.TripletFeel8 = "m 24.36 19.36 c 2.02 0 4.05 0 6.07 0 0.13 -0.91 -1.28 -0.27 -1.87 -0.46 -1.4 0 -2.8 0 -4.2 0 0 0.15 0 0.31 0 0.46 z m 0 1.86 c 2.02 -0.02 4.07 0.04 6.07 -0.03 0.16 -0.94 -1.24 -0.3 -1.8 -0.49 -1.42 0 -2.84 0 -4.26 0 1.4e-5 0.17 -2.7e-5 0.35 1.8e-5 0.52 z M 38.01 5.56 c -0.02 5.52 0.04 11.04 -0.03 16.55 -0.24 2.29 -3.95 4.19 -5.23 1.73 -0.79 -2.65 3.29 -4.74 4.89 -3.15 0 -5.04 0 -10.09 0 -15.13 0.12 1.28e-4 0.25 -3.18e-4 0.37 3.77e-4 z m -16.45 0 c -0.02 5.52 0.04 11.04 -0.03 16.55 -0.23 2.27 -3.95 4.2 -5.21 1.73 -0.75 -2.47 3.01 -4.95 4.87 -3.02 0 -4.4 0 -8.8 0 -13.21 -2.92 0 -5.84 0 -8.76 0 -0.02 4.83 0.04 9.67 -0.03 14.5 -0.23 2.28 -3.96 4.2 -5.22 1.73 -0.81 -2.65 3.28 -4.74 4.88 -3.15 0 -5.04 0 -10.09 0 -15.13 3.17 5.03e-4 6.34 0 9.5 7.55e-4 z M 1.22 18.4 c -0.17 2.26 0.72 4.54 2.62 5.84 C 4.83 25.09 2.04 23.4 1.79 22.77 -0.18 20.74 -0.63 17.36 1.12 15.05 1.67 13.94 3.72 12.2 4.07 12.38 2.04 13.75 1.02 15.97 1.22 18.4 z m 54.61 0 c 0.17 2.26 -0.72 4.54 -2.62 5.84 -0.99 0.85 1.8 -0.84 2.05 -1.47 1.97 -2.04 2.42 -5.41 0.67 -7.73 -0.55 -1.11 -2.61 -2.84 -2.95 -2.66 2.02 1.36 3.04 3.58 2.85 6.01 z M 47.2 5.56 c 0.16 2.22 2.22 3.33 3.46 4.91 2.35 2.49 1.74 6.43 -0.23 8.95 0.24 -1.29 1.6 -3.21 1.07 -4.96 -0.39 -2.26 -2.25 -4.05 -4.36 -4.78 -0.02 4.14 0.04 8.29 -0.03 12.43 -0.21 2.29 -3.95 4.19 -5.21 1.73 -0.75 -2.48 3.02 -4.95 4.88 -3.02 0 -5.09 0 -10.17 0 -15.26 0.14 3.77e-4 0.28 -6.55e-4 0.42 3.77e-4 z M 39.84 2.19 c -0.03 0.75 -1.39 0.18 -1.99 0.36 -0.67 0.08 -1.88 -0.37 -1.52 0.75 0.18 1.15 -0.39 1.34 -0.24 0.09 -0.2 -0.97 0.1 -1.44 1.12 -1.19 0.88 0 1.75 0 2.63 0 z m 9.04 0 C 48.8 2.87 49.06 3.9 48.76 4.37 48.3 4.09 49.03 2.63 48.38 2.54 c -1.08 0 -2.16 0 -3.25 0 0.03 -0.75 1.39 -0.18 1.99 -0.36 0.58 0 1.17 0 1.75 0 z m -7.12 0.15 c 1.28 -0.03 2.54 -2.28 0.38 -2.02 -0.98 0.3 0.97 0.93 -0.44 1.44 -2.45 -0.8 3.03 -3.31 2.65 -0.47 -0.36 1.15 -1.5 0.72 -0.52 1.75 0.03 2.63 -5.38 1.26 -2.65 -0.3 1.73 0.44 -1.53 1.48 0.33 1.58 1.32 -0.08 2.02 -1.92 0.25 -1.98 z";
alphatab.rendering.glyphs.MusicFont.TripletFeel16 = "m 24.36 19.36 c 2.02 0 4.05 0 6.07 0 0.12 -0.89 -1.29 -0.25 -1.87 -0.45 -1.4 0 -2.8 0 -4.2 0 0 0.15 0 0.3 0 0.45 z m 0 1.86 c 2.02 -0.02 4.07 0.04 6.07 -0.03 0.16 -0.94 -1.24 -0.3 -1.8 -0.49 -1.42 0 -2.84 0 -4.26 0 5e-6 0.17 -9e-6 0.35 6e-6 0.52 z M 1.22 18.4 c -0.17 2.26 0.72 4.54 2.62 5.86 0.99 0.86 -1.81 -0.84 -2.05 -1.47 -1.97 -2.04 -2.42 -5.41 -0.67 -7.73 0.55 -1.11 2.61 -2.85 2.95 -2.66 -2.02 1.36 -3.04 3.58 -2.85 6.01 z m 54.61 0 c 0.17 2.26 -0.72 4.54 -2.62 5.86 -0.99 0.86 1.81 -0.84 2.05 -1.47 1.97 -2.04 2.42 -5.41 0.67 -7.73 -0.55 -1.11 -2.61 -2.84 -2.95 -2.66 2.04 1.39 3.03 3.55 2.85 6.01 z M 39.84 2.19 c -0.01 0.77 -1.39 0.19 -1.99 0.37 -0.67 0.08 -1.87 -0.37 -1.5 0.75 0.2 0.99 -0.41 1.5 -0.25 0.21 -0.1 -0.87 -0.1 -1.65 1 -1.33 0.92 0 1.83 0 2.75 0 z m 9.04 0 c -0.09 0.69 0.17 1.72 -0.12 2.2 -0.46 -0.28 0.27 -1.74 -0.38 -1.83 -1.08 0 -2.16 0 -3.25 0 0.01 -0.77 1.39 -0.19 1.99 -0.37 0.58 0 1.17 0 1.75 0 z m -7.12 0.15 c 1.28 -0.03 2.54 -2.28 0.38 -2.02 -0.97 0.31 0.97 0.93 -0.44 1.45 -2.46 -0.81 3.02 -3.33 2.65 -0.49 -0.37 1.14 -1.5 0.73 -0.52 1.77 0.01 2.62 -5.38 1.24 -2.65 -0.31 1.73 0.44 -1.54 1.47 0.33 1.59 1.32 -0.07 2.02 -1.94 0.25 -1.99 z m 0.91 8.6 c 0.09 -0.68 -0.17 -1.71 0.12 -2.19 1.33 0 2.66 0 3.99 0 0.22 -0.97 -0.14 -1.36 -1.12 -1.13 -2.55 0 -5.1 0 -7.65 0 -0.02 4.83 0.04 9.67 -0.03 14.5 -0.24 2.29 -3.95 4.19 -5.23 1.73 -0.79 -2.65 3.3 -4.75 4.89 -3.13 0 -5.04 0 -10.09 0 -15.13 3.17 0 6.34 0 9.5 0 -0.02 5.51 0.04 11.03 -0.03 16.53 -0.21 2.29 -3.95 4.19 -5.21 1.73 -0.75 -2.48 3.04 -4.96 4.88 -3.01 0 -3.3 0 -6.6 0 -9.9 -1.37 10e-7 -2.75 -3e-6 -4.12 2e-6 z M 21.56 5.58 c -0.02 5.51 0.04 11.03 -0.03 16.53 -0.23 2.27 -3.95 4.2 -5.21 1.73 -0.75 -2.47 3.03 -4.96 4.87 -3.01 0 -3.38 0 -6.76 0 -10.14 -2.92 0 -5.84 0 -8.76 0 -0.02 3.81 0.04 7.61 -0.03 11.42 -0.23 2.28 -3.96 4.2 -5.22 1.73 -0.81 -2.65 3.3 -4.75 4.88 -3.13 0 -5.04 0 -10.09 0 -15.13 3.17 0 6.34 0 9.5 0 z M 21.19 8.64 C 21.49 7.58 20.84 7.48 19.95 7.61 c -2.5 0 -5.01 0 -7.51 0 -0.3 1.06 0.35 1.16 1.25 1.03 2.5 0 5.01 0 7.51 0 z";
alphatab.rendering.glyphs.MusicFont.TripletFeelNone8 = "m 25.85 19.36 c 2.02 0 4.05 0 6.07 0 0.13 -0.91 -1.28 -0.27 -1.87 -0.46 -1.4 0 -2.8 0 -4.2 0 0 0.15 0 0.31 0 0.46 z m 0 1.86 c 2.02 -0.02 4.07 0.04 6.07 -0.03 0.16 -0.94 -1.24 -0.31 -1.8 -0.49 -1.42 0 -2.84 0 -4.26 0 5e-5 0.17 -9.1e-5 0.35 6e-5 0.52 z M 48.78 5.56 c -0.02 5.52 0.04 11.04 -0.03 16.55 -0.23 2.27 -3.95 4.2 -5.21 1.73 -0.75 -2.47 3.01 -4.95 4.87 -3.02 0 -4.4 0 -8.8 0 -13.21 -2.92 0 -5.84 0 -8.76 0 -0.02 4.83 0.04 9.67 -0.03 14.5 -0.23 2.28 -3.96 4.2 -5.22 1.73 -0.81 -2.65 3.28 -4.74 4.88 -3.15 0 -5.04 0 -10.09 0 -15.13 3.17 6.67e-4 6.34 0 9.5 10e-4 z M 1.22 18.4 C 1.05 20.65 1.94 22.93 3.84 24.24 4.83 25.09 2.04 23.4 1.79 22.77 -0.18 20.74 -0.63 17.36 1.12 15.05 1.67 13.94 3.72 12.2 4.07 12.38 2.03 13.78 1.04 15.94 1.22 18.4 z m 54.61 0 c 0.17 2.26 -0.72 4.54 -2.62 5.84 -0.99 0.85 1.8 -0.84 2.05 -1.47 1.97 -2.04 2.42 -5.41 0.67 -7.73 -0.55 -1.11 -2.61 -2.84 -2.95 -2.66 2.04 1.39 3.03 3.55 2.85 6.01 z M 12.43 5.56 c -0.02 5.52 0.04 11.04 -0.03 16.55 -0.24 2.29 -3.95 4.19 -5.23 1.73 -0.79 -2.65 3.29 -4.74 4.89 -3.15 0 -5.04 0 -10.09 0 -15.13 0.12 1.7e-4 0.25 -4.21e-4 0.37 5e-4 z m 9.19 0 c 0.16 2.22 2.22 3.33 3.46 4.91 2.35 2.49 1.74 6.43 -0.23 8.95 0.24 -1.29 1.6 -3.21 1.07 -4.96 -0.39 -2.26 -2.25 -4.05 -4.36 -4.78 -0.02 4.14 0.04 8.29 -0.03 12.43 -0.21 2.29 -3.95 4.19 -5.21 1.73 -0.75 -2.48 3.02 -4.95 4.88 -3.02 0 -5.09 0 -10.17 0 -15.26 0.14 5e-4 0.28 -8.68e-4 0.42 5e-4 z m -7.36 -3.38 c -0.03 0.75 -1.39 0.18 -1.99 0.36 -0.67 0.08 -1.87 -0.37 -1.5 0.75 0.2 0.99 -0.41 1.5 -0.25 0.21 -0.1 -0.87 -0.09 -1.63 1 -1.31 0.92 0 1.83 0 2.75 0 z m 9.04 0 c -0.09 0.68 0.17 1.71 -0.12 2.19 -0.46 -0.28 0.27 -1.74 -0.38 -1.83 -1.08 0 -2.16 0 -3.25 0 0.03 -0.75 1.39 -0.18 1.99 -0.36 0.58 0 1.17 0 1.75 0 z m -7.12 0.15 c 1.28 -0.03 2.54 -2.28 0.38 -2.02 -0.98 0.3 0.97 0.93 -0.44 1.44 -2.45 -0.8 3.03 -3.31 2.65 -0.47 -0.36 1.15 -1.5 0.72 -0.52 1.75 0.03 2.63 -5.38 1.26 -2.65 -0.3 1.73 0.44 -1.53 1.48 0.33 1.58 1.32 -0.08 2.02 -1.92 0.25 -1.98 z";
alphatab.rendering.glyphs.MusicFont.TripletFeelNone16 = "m 24.36 19.36 c 2.02 0 4.05 0 6.07 0 0.12 -0.89 -1.29 -0.25 -1.87 -0.45 -1.4 0 -2.8 0 -4.2 0 0 0.15 0 0.3 0 0.45 z m 0 1.86 c 2.02 -0.02 4.07 0.04 6.07 -0.03 0.16 -0.94 -1.24 -0.31 -1.8 -0.49 -1.42 0 -2.84 0 -4.26 0 5e-6 0.17 -9e-6 0.35 6e-6 0.52 z M 1.22 18.4 C 1.05 20.66 1.94 22.94 3.84 24.25 4.83 25.11 2.03 23.41 1.79 22.78 -0.18 20.74 -0.63 17.37 1.12 15.05 1.67 13.94 3.72 12.2 4.07 12.38 2.04 13.75 1.02 15.97 1.22 18.4 z m 54.61 0 c 0.17 2.26 -0.72 4.54 -2.62 5.86 -0.99 0.86 1.81 -0.84 2.05 -1.47 1.97 -2.04 2.42 -5.41 0.67 -7.73 -0.55 -1.11 -2.61 -2.84 -2.95 -2.66 2.02 1.36 3.04 3.58 2.85 6.01 z M 14.26 2.19 c -0.01 0.77 -1.39 0.19 -1.99 0.37 -0.67 0.08 -1.87 -0.37 -1.5 0.75 0.2 0.99 -0.41 1.5 -0.25 0.21 -0.1 -0.87 -0.1 -1.65 1 -1.33 0.92 0 1.83 0 2.75 0 z m 9.04 0 c -0.09 0.69 0.17 1.72 -0.12 2.2 -0.49 -0.25 0.26 -1.75 -0.39 -1.83 -1.08 0 -2.15 0 -3.23 0 0.01 -0.77 1.39 -0.19 1.99 -0.37 0.58 0 1.17 0 1.75 0 z m -7.12 0.15 c 1.28 -0.03 2.54 -2.28 0.38 -2.02 -0.97 0.31 0.97 0.93 -0.44 1.45 -2.46 -0.81 3.02 -3.33 2.65 -0.49 -0.37 1.14 -1.5 0.73 -0.52 1.77 0.01 2.62 -5.38 1.24 -2.65 -0.31 1.73 0.44 -1.54 1.47 0.33 1.59 1.32 -0.07 2.02 -1.94 0.25 -1.99 z M 47.14 5.58 c -0.02 5.51 0.04 11.03 -0.03 16.53 -0.23 2.27 -3.95 4.2 -5.21 1.73 -0.75 -2.47 3.03 -4.96 4.87 -3.01 0 -3.38 0 -6.76 0 -10.14 -2.92 0 -5.84 0 -8.76 0 -0.02 3.81 0.04 7.61 -0.03 11.42 -0.23 2.28 -3.96 4.2 -5.22 1.73 -0.81 -2.65 3.3 -4.75 4.88 -3.13 0 -5.04 0 -10.09 0 -15.13 3.17 3.33e-4 6.34 -6.67e-4 9.5 5e-4 z m -0.37 3.06 c 0.3 -1.06 -0.35 -1.16 -1.25 -1.03 -2.5 0 -5.01 0 -7.51 0 -0.3 1.06 0.35 1.16 1.25 1.03 2.5 0 5.01 0 7.51 0 z M 17.09 10.93 c 0.09 -0.68 -0.17 -1.71 0.12 -2.19 1.33 0 2.66 0 3.99 0 0.22 -0.97 -0.14 -1.36 -1.12 -1.13 -2.55 0 -5.1 0 -7.65 0 -0.02 4.83 0.04 9.67 -0.03 14.5 -0.24 2.29 -3.95 4.19 -5.23 1.73 -0.79 -2.65 3.3 -4.75 4.89 -3.13 0 -5.04 0 -10.09 0 -15.13 3.17 0 6.34 0 9.5 0 -0.02 5.51 0.04 11.03 -0.03 16.53 -0.21 2.29 -3.95 4.19 -5.21 1.73 -0.75 -2.48 3.04 -4.96 4.88 -3.01 0 -3.3 0 -6.6 0 -9.9 -1.37 3.32e-4 -2.75 -6.65e-4 -4.12 5e-4 z";
alphatab.rendering.glyphs.MusicFont.KeySharp = "m 3.11 3.97 c 0 -1.32 0 -2.65 0 -3.97 0.22 0 0.43 0 0.65 0 0 1.24 0 2.48 0 3.73 0.31 -0.13 0.62 -0.27 0.93 -0.4 0 0.79 0 1.57 0 2.36 C 4.38 5.82 4.07 5.95 3.76 6.09 c 0 1.27 0 2.53 0 3.8 0.31 -0.15 0.62 -0.29 0.93 -0.44 0 0.79 0 1.57 0 2.36 -0.31 0.13 -0.62 0.27 -0.93 0.4 0 1.29 0 2.58 0 3.87 -0.22 0 -0.43 0 -0.65 0 0 -1.21 0 -2.41 0 -3.62 -0.51 0.22 -1.03 0.43 -1.54 0.65 0 1.3 0 2.6 0 3.9 -0.22 0 -0.43 0 -0.65 0 0 -1.22 0 -2.44 0 -3.66 C 0.62 13.47 0.31 13.59 0 13.71 0 12.92 0 12.14 0 11.35 c 0.31 -0.12 0.62 -0.24 0.93 -0.37 0 -1.27 0 -2.53 0 -3.8 C 0.62 7.32 0.31 7.46 0 7.59 0 6.79 0 5.99 0 5.19 0.31 5.07 0.62 4.95 0.93 4.83 c 0 -1.29 0 -2.58 0 -3.87 0.22 0 0.43 0 0.65 0 0 1.21 0 2.41 0 3.62 C 2.09 4.38 2.6 4.17 3.11 3.97 z M 1.57 6.94 c 0 1.27 0 2.53 0 3.8 0.51 -0.22 1.03 -0.43 1.54 -0.65 0 -1.25 0 -2.51 0 -3.76 -0.51 0.2 -1.03 0.41 -1.54 0.61 z";
alphatab.rendering.glyphs.MusicFont.KeyNormal = "M 0 12.45 C 0 8.3 0 4.15 0 0 c 0.24 0 0.47 0 0.71 0 0 1.87 0 3.74 0 5.6 C 1.84 5.29 2.97 4.98 4.1 4.67 c 0 4.11 0 8.22 0 12.33 -0.22 0 -0.44 0 -0.67 0 0 -1.83 0 -3.66 0 -5.49 C 2.29 11.82 1.14 12.13 0 12.45 z M 0.71 10.37 C 1.61 10.12 2.52 9.87 3.43 9.62 c 0 -1.01 0 -2.02 0 -3.03 -0.91 0.25 -1.82 0.5 -2.73 0.74 0 1.01 0 2.02 0 3.03 z";
alphatab.rendering.glyphs.MusicFont.KeyFlat = "m 0 2 c 0.21 0 0.42 0 0.63 0 0 2.93 0 5.85 0 8.78 0.88 -0.5 1.91 -1.01 2.95 -0.78 0.91 0.24 1.29 1.34 1.1 2.18 -0.31 1.25 -1.36 2.14 -2.38 2.83 C 1.42 15.52 0.7 16.27 0 17 0 12 0 7 0 2 z m 2.64 8.71 c -0.62 -0.36 -1.3 0.1 -1.8 0.47 -0.31 0.1 -0.19 0.42 -0.21 0.67 0 1.28 0 2.57 0 3.85 C 1.13 15.18 1.67 14.71 2.13 14.17 2.68 13.42 3.31 12.58 3.25 11.6 3.21 11.22 2.97 10.89 2.64 10.71 z";
alphatab.rendering.glyphs.MusicFont.RestHalf = "m 0 4 c 3.22 0 6.44 0 9.66 0 0 -1.33 0 -2.67 0 -4 C 6.44 0 3.22 0 0 0 0 1.33 0 2.67 0 4 z";
alphatab.rendering.glyphs.MusicFont.RestQuarter = "M 2.4 0.04 C 4.3 2.23 6.19 4.42 8.09 6.61 6.57 7.75 5.58 9.43 4.76 11.11 c -0.52 1.6 0.26 3.29 1.29 4.5 0.24 0.66 2.07 1.26 1.03 1.93 -1.31 0.03 -2.84 -0.37 -3.95 0.55 -0.77 0.84 -0.45 2.17 0.21 2.97 0.14 0.66 1.69 1.33 1.09 1.84 C 3.38 22.69 2.74 21.73 1.92 21.12 1.1 20.27 0.05 19.37 0 18.1 0 16.77 1.21 15.64 2.52 15.61 3.61 15.48 4.75 15.77 5.64 16.42 3.91 14.2 2.18 11.98 0.46 9.77 1.95 8.55 2.86 6.78 3.55 5.02 3.88 3.53 2.92 2.2 2.17 1.01 1.62 0.63 1.35 -0.35 2.4 0.04 z";
alphatab.rendering.glyphs.MusicFont.RestEighth = "M 2.19 0 C 3.49 -0.03 4.76 1.37 4.32 2.66 4.26 3.18 3.53 3.64 3.47 3.89 4.27 4.3 5.11 3.75 5.7 3.24 6.67 2.38 7.28 1.18 7.97 0.11 8.48 -0.19 8.34 0.36 8.25 0.65 7.15 5.44 6.06 10.22 4.96 15 4.63 15 4.3 15 3.97 15 4.95 11.06 5.93 7.12 6.92 3.18 6.24 4.45 4.71 4.96 3.34 4.89 2.47 4.82 1.53 4.65 0.84 4.09 -0.23 3.23 -0.33 1.4 0.74 0.52 1.14 0.16 1.66 0.01 2.19 0 z";
alphatab.rendering.glyphs.MusicFont.RestSixteenth = "M 4.58 12.12 C 5.95 11.59 6.78 10.24 7.35 8.97 7.83 7.03 8.3 5.09 8.77 3.15 8.07 4.45 6.51 4.93 5.11 4.84 4.52 4.91 3.98 4.62 3.43 4.44 2.32 4.03 1.69 2.76 1.97 1.62 2.28 0.02 4.57 -0.55 5.64 0.63 6.55 1.43 6.51 3.05 5.45 3.71 5.36 4.19 6.59 3.99 6.98 3.66 8.23 2.89 8.83 1.47 9.7 0.35 9.87 -0.15 10.51 0 10.17 0.49 8.42 7.99 6.67 15.5 4.91 23 4.6 23 4.29 23 3.98 23 4.92 19.1 5.86 15.19 6.8 11.29 6.13 12.56 4.62 13.09 3.25 13 2.02 12.96 0.61 12.44 0.14 11.2 -0.3 10.11 0.24 8.69 1.41 8.35 2.54 7.9 3.92 8.55 4.28 9.72 4.57 10.55 4.21 11.58 3.4 11.97 c 0.39 0.12 0.78 0.29 1.18 0.15 z";
alphatab.rendering.glyphs.MusicFont.RestThirtySecond = "M 6.47 12.03 C 8.29 11.3 9.21 9.34 9.56 7.51 9.92 6.04 10.27 4.56 10.63 3.08 9.64 4.92 7.15 5.09 5.38 4.46 3.78 3.93 3.21 1.56 4.57 0.49 5.72 -0.52 7.61 0.15 8.07 1.55 8.6 2.43 7.48 3.5 7.35 3.83 8.35 4.33 9.38 3.44 10 2.71 c 0.66 -0.83 1.13 -1.9 1.82 -2.66 0.56 -0.12 0.05 0.61 0.07 0.91 C 9.56 10.97 7.22 20.99 4.89 31 4.57 30.92 3.75 31.23 4.04 30.68 4.95 26.9 5.86 23.12 6.77 19.35 5.77 21.17 3.29 21.4 1.53 20.67 0.07 20.13 -0.56 18.04 0.6 16.92 c 1.08 -1.13 3.22 -0.66 3.66 0.87 0.53 0.87 -0.54 1.99 -0.73 2.28 1.18 0.47 2.29 -0.59 2.93 -1.48 0.66 -0.79 0.95 -1.76 1.15 -2.75 C 7.98 14.32 8.35 12.78 8.72 11.25 7.96 12.7 6.22 13.02 4.72 12.93 3.53 12.75 2.13 12.09 1.95 10.75 1.57 9.33 2.89 7.91 4.33 8.13 5.89 8.21 6.92 10.33 5.77 11.51 c -1.03 0.58 0.16 0.67 0.7 0.52 z";
alphatab.rendering.glyphs.MusicFont.RestSixtyFourth = "M 6.61 20.61 C 8.85 19.73 9.53 17.2 9.98 15.06 10.25 13.86 10.53 12.67 10.81 11.47 9.73 13.44 6.96 13.6 5.13 12.7 3.51 11.89 3.43 9.15 5.21 8.5 6.88 7.68 9.03 9.67 8.14 11.37 7.48 12.01 7.22 12.47 8.36 12.31 9.96 11.87 11.03 10.26 11.43 8.72 11.89 6.88 12.35 5.04 12.8 3.2 11.95 4.77 9.95 5.12 8.33 4.85 6.95 4.62 5.61 3.49 5.82 1.97 5.87 0.05 8.65 -0.7 9.75 0.8 10.95 1.74 9.66 3.52 9.62 3.97 11.16 4.33 12.19 2.71 12.93 1.6 13.18 1.26 14.26 -0.61 14.24 0.38 11.16 13.59 8.07 26.79 4.99 40 c -0.52 0.01 -1.23 0.16 -0.81 -0.58 0.91 -3.78 1.82 -7.55 2.73 -11.33 -1.12 2.02 -4.06 2.2 -5.86 1.06 -1.46 -0.88 -1.41 -3.42 0.28 -4.01 1.6 -0.79 3.65 0.92 3.01 2.62 -0.29 0.74 -1.37 1.25 -0.01 1.2 1.47 -0.28 2.42 -1.65 3.07 -2.89 C 7.89 23.99 8.41 21.91 8.91 19.82 8.06 21.39 6.06 21.74 4.45 21.47 3.08 21.23 1.74 20.1 1.96 18.59 c 0.05 -1.91 2.83 -2.68 3.93 -1.17 0.83 0.89 0.61 2.48 -0.48 3.06 0.39 0.2 0.78 0.3 1.2 0.13";
alphatab.rendering.glyphs.MusicFont.NoteHalf = "M 2.84 0.88 C 4.09 0.12 5.69 -0.3 7.1 0.27 8.33 0.78 9.2 2.15 8.95 3.49 8.73 5.19 7.49 6.6 6.01 7.36 4.74 8.13 3.1 8.5 1.71 7.87 0.9 7.54 0.27 6.82 0.07 5.97 -0.18 4.85 0.23 3.69 0.83 2.76 1.35 1.99 2.05 1.35 2.84 0.88 z M 7.91 1.43 C 7.36 0.98 6.59 1.13 5.95 1.23 4.3 1.64 2.8 2.67 1.87 4.1 1.37 4.83 0.95 5.67 0.95 6.57 1.02 7.12 1.71 7.29 2.16 7.12 3.55 6.78 4.87 6.15 6 5.27 6.9 4.47 7.68 3.49 8.05 2.34 8.13 2.04 8.15 1.67 7.91 1.43 z";
alphatab.rendering.glyphs.MusicFont.NoteQuarter = "m 2.85 0.87 c 1.24 -0.76 2.82 -1.17 4.22 -0.63 1.05 0.44 1.91 1.47 1.93 2.64 0.05 1.64 -0.96 3.17 -2.29 4.07 -0.97 0.62 -2.03 1.19 -3.21 1.24 -1.24 0.1 -2.62 -0.46 -3.21 -1.6 -0.58 -1.19 -0.23 -2.62 0.46 -3.69 0.52 -0.83 1.25 -1.54 2.1 -2.03 z";
alphatab.rendering.glyphs.MusicFont.Harmonic = "M 0 4.58 C 1.47 6.06 2.94 7.53 4.42 9 5.24 8 6.1 7.01 7.18 6.28 7.97 5.66 8.76 5.04 9.55 4.42 8.1 2.94 6.64 1.47 5.19 0 4.4 1 3.39 1.79 2.51 2.7 1.75 3.42 0.9 4.04 0 4.58 z";
alphatab.rendering.glyphs.MusicFont.Sticks = "m 4.23 4.91 l 3.65 3.65 0.62 -0.64 -3.62 -3.62 L 8.44 0.74 7.82 0.12 4.23 3.70 0.63 0.10 0 0.74 3.59 4.34 l -3.59 3.6 0.6 0.6 3.63 -3.63 z";
alphatab.rendering.glyphs.MusicFont.HiHat = "m 9.00 6 q 0 0.70 -0.32 1.41 Q 8.35 8.13 7.75 8.71 7.14 9.30 6.44 9.63 5.74 9.95 5 10.00 q -0.73 0 -1.44 -0.32 Q 2.83 9.35 2.24 8.75 1.66 8.14 1.33 7.44 1.00 6.74 0.99 6 q 0 -0.73 0.32 -1.44 Q 1.64 3.83 2.24 3.24 2.85 2.66 3.55 2.33 4.25 2.00 5 1.99 5.73 2.02 6.44 2.35 7.16 2.67 7.75 3.28 8.33 3.88 8.66 4.58 8.99 5.28 9.00 6 z M 10 6 Q 10 5.10 9.59 4.20 9.18 3.31 8.43 2.56 7.68 1.81 6.80 1.42 5.92 1.03 5 1 4.10 1 3.20 1.40 2.31 1.81 1.56 2.56 0.81 3.31 0.42 4.19 0.03 5.07 0 6.03 0 6.92 0.40 7.82 0.81 8.71 1.56 9.45 2.31 10.18 3.19 10.57 4.07 10.96 5 11 5.94 10.96 6.84 10.56 7.73 10.15 8.45 9.42 9.16 8.68 9.57 7.80 9.98 6.92 10 6 z M 4.93 6.76 L 7.03 8.86 7.83 8.03 5.83 6 7.83 3.96 7.03 3.13 4.93 5.23 2.89 3.19 2.13 3.96 4.16 6 2.13 8.03 2.89 8.80 4.93 6.76 z";
alphatab.rendering.glyphs.MusicFont.ChineseCymbal = "m 4.55 -4.03 l 5.46 5.48 -0.61 0.63 -4.88 -4.86 -4.85 4.85 -0.64 -0.61 5.53 -5.48 z m -0.03 9.94 l 2.99 2.97 1.37 -1.35 L 5.91 4.54 8.90 1.58 7.56 0.23 4.55 3.26 1.54 0.20 0.25 1.49 3.27 4.52 0.18 7.61 1.51 8.94 4.52 5.91 z";
alphatab.rendering.glyphs.MusicFont.RideCymbal = "M 8 7 L 4 11 0 7 4 3 8 7 z m -1.44 0.44 l -3 -3 -2.12 2.12 3 3 2.12 -2.12 z";
alphatab.rendering.glyphs.MusicFont.DeadNote = "M 4.99 5.57 C 5.47 5.71 5.89 6.1 5.92 6.62 6.03 7.41 6 8.21 6.01 9 7.01 9 8 9 9 9 9 7.98 9 6.97 9 5.95 8.15 5.94 7.29 6.01 6.46 5.81 6 5.73 5.63 5.31 5.57 4.86 5.59 4.53 5.49 4.18 5.69 3.88 5.88 3.45 6.34 3.24 6.78 3.22 7.52 3.14 8.26 3.16 9 3.16 9 2.14 9 1.12 9 0.11 c -1 0 -1.99 0 -2.99 0 -0.02 0.85 0.06 1.71 -0.15 2.54 -0.08 0.46 -0.49 0.82 -0.95 0.88 -0.31 0 -0.63 0 -0.94 0 C 3.49 3.39 3.09 2.96 3.07 2.44 2.97 1.67 2.99 0.89 2.99 0.11 c -1 0 -1.99 0 -2.99 0 C 0 1.12 0 2.14 0 3.16 0.85 3.17 1.71 3.1 2.54 3.3 3 3.38 3.37 3.8 3.43 4.25 3.41 4.58 3.51 4.93 3.31 5.23 3.12 5.66 2.66 5.87 2.22 5.89 1.48 5.97 0.74 5.95 0 5.95 0 6.97 0 7.98 0 9 1 9 1.99 9 2.99 9 3.01 8.15 2.93 7.29 3.14 6.46 3.22 6.01 3.61 5.63 4.05 5.57 c 0.31 0 0.63 0 0.94 0 z";
alphatab.rendering.glyphs.MusicFont.FooterUpEighth = "m 0.19 11.86 c 0 -2.27 0 -4.54 0 -6.81 0.48 -0.06 0.88 -0.02 0.83 0.6 0.24 0.91 0.39 1.87 0.97 2.64 0.77 1.2 1.99 2 2.94 3.05 1.54 1.55 2.98 3.28 3.69 5.38 0.9 2.5 0.48 5.26 -0.41 7.69 C 7.72 25.71 7 26.91 6.22 28.04 5.56 27.64 6.21 27.27 6.49 26.8 7.6 25.04 8.1 22.96 8.13 20.89 7.98 18.65 7.01 16.5 5.43 14.9 4.12 13.58 2.53 12.46 0.76 11.86 c -0.19 0 -0.38 0 -0.57 0 z";
alphatab.rendering.glyphs.MusicFont.FooterUpSixteenth = "M 8.07 20.52 C 7.82 17.12 5.48 14.18 2.56 12.58 2.07 12.29 0.91 11.58 1.59 12.64 c 0.77 1.69 2.4 2.7 3.62 4.04 1.09 1.16 2.18 2.39 2.86 3.85 z M 0.77 16.91 c -0.41 0.05 -0.76 0.04 -0.61 -0.47 0 -3.81 0 -7.63 0 -11.44 0.68 -0.18 0.91 0.23 0.95 0.88 0.22 1.17 0.68 2.3 1.52 3.17 2.01 1.94 4.22 3.83 5.48 6.39 1.09 2.1 1.29 4.58 0.65 6.85 0.69 2.06 0.29 4.29 -0.3 6.33 C 7.97 30.2 7.16 31.66 6.2 33 5.34 32.46 6.74 31.89 6.81 31.21 7.72 29.5 8.14 27.55 8.09 25.63 8.07 24.87 7.89 24.71 7.64 25.48 7.22 26.28 6.73 27.27 6.16 27.82 5.36 27.28 6.83 26.67 6.86 25.97 7.2 25.28 7.52 24.57 7.7 23.81 6.9 20.89 4.51 18.65 1.85 17.35 1.5 17.18 1.14 17.04 0.77 16.91 z";
alphatab.rendering.glyphs.MusicFont.FooterUpThirtySecond = "M 8.01 20.36 C 7.74 16.68 5.06 13.56 1.83 12 0.45 11.27 2.17 13.66 2.65 14.1 4.63 15.98 6.8 17.88 8.01 20.36 z M 0 0 c 0.93 -0.29 0.82 0.81 1.05 1.43 0.28 1.77 1.66 3.01 2.91 4.15 2.23 2.1 4.42 4.59 4.92 7.72 0.18 1.25 0.16 2.54 -0.14 3.77 0.47 1.66 0.4 3.44 -0.05 5.09 0.76 2.36 0.23 4.92 -0.58 7.2 C 7.63 30.66 6.93 31.87 6.12 33 5.24 32.32 7.02 31.52 7.01 30.63 7.76 29 8.11 27.16 8.01 25.38 7.92 23.94 7.38 26.08 6.99 26.49 6.78 27.03 5.82 28.32 5.86 27.28 6.73 26.26 7.28 24.99 7.63 23.71 7.37 23.06 7.05 21.19 6.48 22.6 6.31 23.58 5.27 22.84 6.07 22.36 7.31 21.2 5.4 20.07 4.7 19.16 3.49 18.08 2.05 17.14 0.48 16.72 -0.13 16.92 -0.01 16.4 0 15.97 0 10.65 0 5.32 0 0 z M 7.83 14.77 C 7.21 11.4 4.6 8.64 1.52 7.29 2.3 8.95 3.91 9.95 5.11 11.27 6.13 12.34 7.1 13.51 7.83 14.77 z";
alphatab.rendering.glyphs.MusicFont.FooterUpSixtyFourth = "m 8.07 20.53 c -0.29 -3.95 -3.31 -7.22 -6.84 -8.72 0.54 2.1 2.54 3.27 3.92 4.8 1.11 1.19 2.23 2.44 2.92 3.93 z M 7.9 14.89 C 7.27 11.48 4.63 8.71 1.53 7.34 2.35 9.08 4.05 10.11 5.29 11.51 c 0.96 1.04 1.89 2.14 2.6 3.38 z M 0.63 21.56 C -0.04 21.75 -0.08 21.32 0 20.78 0 13.85 0 6.93 0 0 1.28 -0.3 0.81 1.63 1.32 2.36 2.13 4.32 4.02 5.46 5.39 6.99 7.43 9.14 9.15 11.87 9.07 14.93 c -0.18 1.54 -0.19 2.99 0.07 4.53 0.08 1.48 -0.63 2.86 -0.06 4.3 0.31 1.41 -0.31 2.81 -0.15 4.19 C 9.47 31.5 8.2 35.14 6.12 38 5.21 37.29 7.03 36.51 7.01 35.59 7.78 33.88 8.18 31.95 8 30.08 7.46 31 6.83 32.93 6.01 33.09 5.75 32.27 7.34 31.19 7.39 30.1 8.1 29.16 7.42 27.28 6.82 27.01 6.69 27.62 5.8 28.35 5.91 27.5 7.37 26.46 5.84 25.23 5.02 24.33 3.79 23.1 2.27 22.15 0.63 21.56 z m 7.27 3.46 c 0.17 0.54 0.11 -0.4 0 0 z M 6.47 22.86 c 0.4 0.56 1.45 2.23 1.12 0.71 -0.34 -0.71 -0.43 -2.27 -1.12 -0.71 z M 1.38 17.15 c 0.95 2.06 3.03 3.19 4.41 4.92 0.71 1 1.16 -0.97 0.26 -1.33 C 4.84 19.15 3.21 17.92 1.38 17.15 z";
alphatab.rendering.glyphs.MusicFont.FooterDownEighth = "m 0 -9.83 c 0 2.27 0 4.54 0 6.81 0.48 0.06 0.88 0.02 0.83 -0.6 0.24 -0.91 0.39 -1.87 0.97 -2.64 0.77 -1.2 1.99 -2 2.94 -3.05 1.54 -1.55 2.98 -3.28 3.69 -5.38 0.9 -2.5 0.48 -5.26 -0.41 -7.69 -0.49 -1.3 -1.21 -2.49 -2 -3.63 -0.65 0.41 -0.01 0.78 0.27 1.24 1.11 1.76 1.61 3.85 1.64 5.91 -0.15 2.24 -1.12 4.39 -2.7 5.99 -1.31 1.33 -2.89 2.45 -4.67 3.05 -0.19 0 -0.38 0 -0.57 0 z";
alphatab.rendering.glyphs.MusicFont.FooterDownSixteenth = "m 7.94 -15.56 c -0.25 3.4 -2.58 6.34 -5.51 7.94 -0.49 0.29 -1.65 1 -0.97 -0.06 0.77 -1.69 2.4 -2.7 3.62 -4.04 1.09 -1.16 2.18 -2.39 2.86 -3.85 z m -7.29 3.61 c -0.41 -0.05 -0.76 -0.04 -0.61 0.47 0 3.81 0 7.63 0 11.44 0.68 0.18 0.91 -0.23 0.95 -0.88 C 1.2 -2.1 1.67 -3.22 2.5 -4.09 c 2.01 -1.94 4.22 -3.83 5.48 -6.39 1.09 -2.1 1.29 -4.58 0.65 -6.85 0.69 -2.06 0.29 -4.29 -0.3 -6.33 -0.49 -1.58 -1.3 -3.04 -2.26 -4.38 -0.86 0.54 0.54 1.11 0.61 1.79 0.91 1.7 1.33 3.66 1.28 5.58 -0.03 0.76 -0.21 0.92 -0.46 0.15 -0.41 -0.8 -0.9 -1.79 -1.48 -2.34 -0.8 0.55 0.67 1.15 0.7 1.86 0.33 0.69 0.66 1.4 0.84 2.15 -0.8 2.92 -3.19 5.17 -5.85 6.46 -0.35 0.17 -0.71 0.31 -1.08 0.44 z";
alphatab.rendering.glyphs.MusicFont.FooterDownThirtySecond = "m 8.01 -20.41 c -0.27 3.68 -2.94 6.8 -6.18 8.36 -1.38 0.73 0.34 -1.66 0.81 -2.1 1.99 -1.88 4.16 -3.78 5.36 -6.26 z M 0 -0.05 c 0.93 0.29 0.82 -0.81 1.05 -1.43 0.28 -1.77 1.66 -3.01 2.91 -4.15 2.23 -2.1 4.42 -4.59 4.92 -7.72 0.18 -1.25 0.16 -2.54 -0.14 -3.77 0.47 -1.66 0.4 -3.44 -0.05 -5.09 0.76 -2.36 0.23 -4.92 -0.58 -7.2 -0.49 -1.3 -1.2 -2.51 -2.01 -3.64 -0.88 0.68 0.9 1.48 0.89 2.37 0.76 1.63 1.1 3.46 1.01 5.25 -0.09 1.44 -0.63 -0.71 -1.03 -1.11 -0.2 -0.54 -1.16 -1.83 -1.12 -0.8 0.87 1.02 1.41 2.29 1.77 3.58 -0.27 0.65 -0.58 2.52 -1.15 1.11 -0.17 -0.98 -1.21 -0.24 -0.41 0.24 1.25 1.17 -0.67 2.29 -1.37 3.2 -1.21 1.08 -2.64 2.02 -4.21 2.43 -0.61 -0.2 -0.5 0.33 -0.48 0.75 0 5.32 0 10.65 0 15.97 z M 7.83 -14.82 c -0.62 3.37 -3.24 6.13 -6.32 7.48 0.78 -1.66 2.39 -2.66 3.59 -3.99 1.02 -1.06 1.99 -2.23 2.73 -3.5 z";
alphatab.rendering.glyphs.MusicFont.FooterDownSixtyFourth = "m 8.07 -20.56 c -0.29 3.95 -3.31 7.22 -6.84 8.72 0.54 -2.1 2.54 -3.27 3.92 -4.8 1.11 -1.19 2.23 -2.44 2.92 -3.93 z m -0.18 5.64 c -0.63 3.4 -3.26 6.17 -6.37 7.54 0.82 -1.73 2.52 -2.77 3.76 -4.17 0.96 -1.04 1.89 -2.14 2.6 -3.38 z M 0.63 -21.59 C -0.04 -21.78 -0.08 -21.35 0 -20.81 c 0 6.93 0 13.85 0 20.78 1.28 0.3 0.81 -1.63 1.32 -2.36 0.81 -1.96 2.71 -3.1 4.07 -4.63 2.04 -2.14 3.76 -4.87 3.68 -7.94 -0.18 -1.54 -0.19 -2.99 0.07 -4.53 0.08 -1.48 -0.63 -2.86 -0.06 -4.3 0.31 -1.41 -0.31 -2.81 -0.15 -4.19 0.54 -3.56 -0.73 -7.2 -2.82 -10.06 -0.91 0.71 0.92 1.49 0.9 2.41 0.77 1.71 1.17 3.64 0.98 5.51 -0.53 -0.92 -1.16 -2.85 -1.99 -3.01 -0.25 0.82 1.33 1.9 1.38 3 0.71 0.93 0.03 2.82 -0.57 3.08 -0.13 -0.61 -1.02 -1.34 -0.91 -0.49 1.47 1.04 -0.07 2.27 -0.89 3.17 -1.23 1.23 -2.76 2.19 -4.4 2.77 z m 7.27 -3.46 c 0.17 -0.54 0.11 0.4 0 0 z m -1.43 2.16 c 0.4 -0.56 1.45 -2.23 1.12 -0.71 -0.34 0.71 -0.43 2.27 -1.12 0.71 z m -5.09 5.72 c 0.95 -2.06 3.03 -3.19 4.41 -4.92 0.71 -1 1.16 0.97 0.26 1.33 -1.21 1.58 -2.84 2.82 -4.67 3.59 z";
alphatab.rendering.glyphs.MusicFont.GraceNote = "M 5.62 17.02 C 5.29 18.81 3.42 20.24 1.6 19.97 0.55 19.79 -0.23 18.68 0.06 17.64 0.39 16.16 1.83 15.13 3.28 14.9 c 0.74 -0.1 1.55 0.13 2.02 0.73 0 -1.96 0 -3.92 0 -5.87 C 4.9 10.37 4.49 10.98 4.09 11.59 3.8 11.45 3.57 11.3 3.89 11.03 4.36 10.31 4.83 9.59 5.3 8.87 c 0 -2.95 0 -5.91 0 -8.86 C 5.96 -0.19 5.81 0.67 6 1.07 6.28 2.38 7.49 3.11 8.34 4.03 8.54 4.12 8.68 3.59 8.86 3.42 9.23 2.86 9.59 2.3 9.96 1.74 10.25 1.89 10.48 2.04 10.17 2.31 9.7 3.03 9.24 3.75 8.77 4.47 10 5.79 11.01 7.48 10.97 9.33 10.96 11.24 10.21 13.07 9.11 14.6 8.58 14.15 9.69 13.65 9.69 13.08 10.16 12.06 10.38 10.91 10.31 9.79 10.14 8.16 9.25 6.69 7.99 5.67 7.22 6.79 6.45 8 5.68 9.15 c 0 2.62 0 5.25 0 7.87 l -0.05 0 -0.01 0 -9e-7 0 z M 7.6 5.36 C 7.07 5.03 6.11 4.27 5.68 4.46 c 0 1.27 0 2.53 0 3.8 C 6.32 7.29 6.96 6.33 7.6 5.36 z";
alphatab.rendering.glyphs.MusicFont.GraceDeadNote = "M 0.78 8 C 0.52 8 0.26 8 0 8 0 5.33 0 2.67 0 0 c 3.99 0 7.97 0 11.96 0 0 2.67 0 5.33 0 8 -0.25 0 -0.5 0 -0.76 0 0 -1.9 0 -3.79 0 -5.69 -3.48 0 -6.95 0 -10.43 0 0 1.9 0 3.79 0 5.69 z";
alphatab.rendering.glyphs.MusicFont.TrillUpEigth = "M 0 4.77 L 9 0.37 9 2.71 0 7 0 4.77 z";
alphatab.rendering.glyphs.MusicFont.TrillUpSixteenth = "M 0 8.77 L 9 4.37 9 6.71 0 11 0 8.77 z M 0 4.73 L 9 0.33 9 2.67 0 6.96 0 4.73 z";
alphatab.rendering.glyphs.MusicFont.TrillUpThirtySecond = "M 0 5.14 L 9 0.73 9 3.07 0 7.37 0 5.14 z M 0 9.01 L 9 4.61 9 6.95 0 11.24 0 9.01 z M 0 12.77 L 9 8.37 9 10.71 0 15 0 12.77 z";
alphatab.rendering.glyphs.MusicFont.AccentuatedNote = "M 13 3.18 L 0 6 0 5.63 11.13 3.18 0 0.73 0 0.36 13 3.18 z";
alphatab.rendering.glyphs.MusicFont.HeavyAccentuatedNote = "M 11 12 L 7.6 12 4.15 5.61 0.84 12 0 12 5.22 1.7 11 12 z";
alphatab.rendering.glyphs.MusicFont.VibratoLeftRight = "M 11.19 5.58 C 10.1 6.65 9.09 7.81 7.93 8.81 7.35 9.3 6.98 8.26 6.55 7.93 5.36 6.62 4.18 5.31 2.98 4 2.41 4.23 2 4.73 1.53 5.13 1.02 5.62 0.51 6.1 0 6.59 0.02 6.16 -0.05 5.69 0.03 5.29 1.79 3.63 3.51 1.94 5.28 0.3 5.93 -0.41 6.4 0.74 6.92 1.1 7.99 2.21 8.99 3.4 10.14 4.44 11.34 3.53 12.36 2.39 13.47 1.36 13.89 0.9 14.4 0.54 14.88 0.14 c 0.54 0.23 0.81 0.82 1.22 1.23 0.81 0.91 1.56 1.88 2.41 2.74 0.45 0.72 1.08 0.87 1.61 0.14 0.59 -0.63 1.15 -1.28 1.73 -1.92 -0.02 0.45 0.04 0.93 -0.03 1.35 C 20.28 5.23 18.76 6.8 17.21 8.32 16.78 8.86 16.09 9.29 15.65 8.51 14.46 7.28 13.39 5.93 12.16 4.75 11.73 4.87 11.54 5.35 11.19 5.58 z";
alphatab.rendering.glyphs.NaturalizeGlyph.CORRECTION = -2;
alphatab.rendering.glyphs.NoteHeadGlyph.noteHeadHeight = 9;
alphatab.rendering.glyphs.SharpGlyph.CORRECTION = -1;
alphatab.rendering.layout.HeaderFooterElements.NONE = 0;
alphatab.rendering.layout.HeaderFooterElements.TITLE = 1;
alphatab.rendering.layout.HeaderFooterElements.SUBTITLE = 2;
alphatab.rendering.layout.HeaderFooterElements.ARTIST = 4;
alphatab.rendering.layout.HeaderFooterElements.ALBUM = 8;
alphatab.rendering.layout.HeaderFooterElements.WORDS = 16;
alphatab.rendering.layout.HeaderFooterElements.MUSIC = 32;
alphatab.rendering.layout.HeaderFooterElements.WORDS_AND_MUSIC = 64;
alphatab.rendering.layout.HeaderFooterElements.COPYRIGHT = 128;
alphatab.rendering.layout.HeaderFooterElements.PAGE_NUMBER = 256;
alphatab.rendering.layout.HeaderFooterElements.ALL = 511;
alphatab.rendering.layout.PageViewLayout.SCORE_INFOS = "scoreInfos";
alphatab.rendering.layout.PageViewLayout.PAGE_PADDING = [20,20,20,20];
alphatab.rendering.layout.PageViewLayout.WIDTH_ON_100 = 795;
alphatab.rendering.layout.PageViewLayout.GroupSpacing = 20;
alphatab.rendering.staves.StaveGroup.StaveSpacing = 0;
alphatab.rendering.utils.AccidentalHelper.ACCIDENTAL_NOTES = [[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural]];
alphatab.rendering.utils.BeamingHelper.SCORE_MIDDLE_KEYS = [48,45,38,59];
haxe.io.Output.LN2 = Math.log(2);
js.Lib.onerror = null;
alphatab.Main.main();
