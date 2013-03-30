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
	matched: function(n) {
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
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
}
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
var haxe = haxe || {}
if(!haxe.ds) haxe.ds = {}
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.prototype = {
	iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
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
var alphatab = alphatab || {}
if(!alphatab.platform) alphatab.platform = {}
alphatab.platform.ICanvas = function() { }
alphatab.platform.ICanvas.__name__ = true;
alphatab.platform.ICanvas.prototype = {
	__class__: alphatab.platform.ICanvas
}
if(!alphatab.platform.js) alphatab.platform.js = {}
alphatab.platform.js.Html5Canvas = function(dom) {
	this._canvas = dom;
	this._context = dom.getContext("2d");
	this._context.textBaseline = "top";
};
alphatab.platform.js.Html5Canvas.__name__ = true;
alphatab.platform.js.Html5Canvas.__interfaces__ = [alphatab.platform.ICanvas];
alphatab.platform.js.Html5Canvas.prototype = {
	measureText: function(text) {
		return this._context.measureText(text).width;
	}
	,strokeText: function(text,x,y) {
		this._context.strokeText(text,x,y);
	}
	,fillText: function(text,x,y) {
		this._context.fillText(text,x,y);
	}
	,setTextBaseline: function(textBaseLine) {
		switch( (textBaseLine)[1] ) {
		case 1:
			this._context.textBaseline = "top";
			break;
		case 2:
			this._context.textBaseline = "middle";
			break;
		case 3:
			this._context.textBaseline = "bottom";
			break;
		default:
			this._context.textBaseline = "alphabetic";
		}
	}
	,getTextBaseline: function() {
		var _g = this;
		switch(_g._context.textBaseline) {
		case "top":
			return alphatab.model.TextBaseline.Top;
		case "middle":
			return alphatab.model.TextBaseline.Middle;
		case "bottom":
			return alphatab.model.TextBaseline.Bottom;
		default:
			return alphatab.model.TextBaseline.Default;
		}
	}
	,setTextAlign: function(textAlign) {
		switch( (textAlign)[1] ) {
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
	,getTextAlign: function() {
		var _g = this;
		switch(_g._context.textAlign) {
		case "left":
			return alphatab.platform.model.TextAlign.Left;
		case "center":
			return alphatab.platform.model.TextAlign.Center;
		case "right":
			return alphatab.platform.model.TextAlign.Right;
		default:
			return alphatab.platform.model.TextAlign.Left;
		}
	}
	,setFont: function(font) {
		this._context.font = font.toCssString();
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
		this._context.lineTo(x - 0.5,y - 0.5);
	}
	,moveTo: function(x,y) {
		this._context.moveTo(x - 0.5,y - 0.5);
	}
	,closePath: function() {
		this._context.closePath();
	}
	,beginPath: function() {
		this._context.beginPath();
	}
	,strokeRect: function(x,y,w,h) {
		this._context.strokeRect(x - 0.5,y - 0.5,w,h);
	}
	,fillRect: function(x,y,w,h) {
		this._context.fillRect(x - 0.5,y - 0.5,w,h);
	}
	,clear: function() {
		var lineWidth = this._context.lineWidth;
		this._canvas.width = this._canvas.width;
		this._context.lineWidth = lineWidth;
	}
	,setLineWidth: function(value) {
		this._context.lineWidth = value;
	}
	,setColor: function(color) {
		this._context.strokeStyle = color.toRgbaString();
		this._context.fillStyle = color.toRgbaString();
	}
	,setHeight: function(height) {
		var lineWidth = this._context.lineWidth;
		this._canvas.height = height;
		this._context = this._canvas.getContext("2d");
		this._context.textBaseline = "top";
		this._context.lineWidth = lineWidth;
		this._height = height;
	}
	,setWidth: function(width) {
		var lineWidth = this._context.lineWidth;
		this._canvas.width = width;
		this._context = this._canvas.getContext("2d");
		this._context.textBaseline = "top";
		this._context.lineWidth = lineWidth;
		this._width = width;
	}
	,getHeight: function() {
		return this._canvas.offsetHeight;
	}
	,getWidth: function() {
		return this._canvas.offsetWidth;
	}
	,__class__: alphatab.platform.js.Html5Canvas
}
if(!alphatab.platform.svg) alphatab.platform.svg = {}
alphatab.platform.svg.SvgCanvas = function() {
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
alphatab.platform.svg.SvgCanvas.__name__ = true;
alphatab.platform.svg.SvgCanvas.__interfaces__ = [alphatab.platform.ICanvas];
alphatab.platform.svg.SvgCanvas.prototype = {
	measureText: function(text) {
		var font = alphatab.platform.svg.SupportedFonts.Arial;
		if(this._font.getFamily().indexOf("Times") >= 0) font = alphatab.platform.svg.SupportedFonts.TimesNewRoman;
		return alphatab.platform.svg.FontSizes.measureString(text,font,this._font.getSize());
	}
	,getSvgBaseLine: function() {
		var _g = this;
		switch( (_g._textBaseline)[1] ) {
		case 1:
			return "top";
		case 2:
			return "middle";
		case 3:
			return "bottom";
		default:
			return "alphabetic";
		}
	}
	,getSvgTextAlignment: function() {
		var _g = this;
		switch( (_g._textAlign)[1] ) {
		case 0:
			return "start";
		case 1:
			return "middle";
		case 2:
			return "end";
		}
	}
	,strokeText: function(text,x,y) {
		this._buffer.b += "<text x=\"";
		this._buffer.b += Std.string(x);
		this._buffer.b += "\" y=\"";
		this._buffer.b += Std.string(y);
		this._buffer.b += "\" style=\"font:";
		this._buffer.b += Std.string(this._font.toCssString());
		this._buffer.b += "\" stroke:";
		this._buffer.b += Std.string(this._color.toRgbaString());
		this._buffer.b += "; stroke-width:";
		this._buffer.b += Std.string(this._lineWidth);
		this._buffer.b += ";\" ";
		this._buffer.b += " dominant-baseline=\"";
		this._buffer.b += Std.string(this.getSvgBaseLine());
		this._buffer.b += "\" text-anchor=\"";
		this._buffer.b += Std.string(this.getSvgTextAlignment());
		this._buffer.b += "\">\n";
		this._buffer.b += Std.string(text);
		this._buffer.b += "</text>\n";
	}
	,fillText: function(text,x,y) {
		this._buffer.b += "<text x=\"";
		this._buffer.b += Std.string(x);
		this._buffer.b += "\" y=\"";
		this._buffer.b += Std.string(y);
		this._buffer.b += "\" style=\"font:";
		this._buffer.b += Std.string(this._font.toCssString());
		this._buffer.b += "; fill:";
		this._buffer.b += Std.string(this._color.toRgbaString());
		this._buffer.b += ";\" ";
		this._buffer.b += " dominant-baseline=\"";
		this._buffer.b += Std.string(this.getSvgBaseLine());
		this._buffer.b += "\" text-anchor=\"";
		this._buffer.b += Std.string(this.getSvgTextAlignment());
		this._buffer.b += "\">\n";
		this._buffer.b += Std.string(text);
		this._buffer.b += "</text>\n";
	}
	,setTextBaseline: function(textBaseline) {
		this._textBaseline = textBaseline;
	}
	,getTextBaseline: function() {
		return this._textBaseline;
	}
	,setTextAlign: function(textAlign) {
		this._textAlign = textAlign;
	}
	,getTextAlign: function() {
		return this._textAlign;
	}
	,setFont: function(font) {
		this._font = font;
	}
	,stroke: function() {
		var path = this._currentPath.b;
		if(!this._currentPathIsEmpty) {
			this._buffer.b += "<path d=\"";
			this._buffer.b += Std.string(this._currentPath.b);
			this._buffer.b += "\" style=\"stroke:";
			this._buffer.b += Std.string(this._color.toRgbaString());
			this._buffer.b += "; stroke-width:";
			this._buffer.b += Std.string(this._lineWidth);
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
			this._buffer.b += Std.string(this._color.toRgbaString());
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
		this._buffer.b += Std.string(this._color.toRgbaString());
		this._buffer.b += "; stroke-width:";
		this._buffer.b += Std.string(this._lineWidth);
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
		this._buffer.b += Std.string(this._color.toRgbaString());
		this._buffer.b += ";\" />\n";
	}
	,clear: function() {
		this._buffer = new StringBuf();
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,setLineWidth: function(value) {
		this._lineWidth = value;
	}
	,setColor: function(color) {
		this._color = color;
	}
	,setHeight: function(height) {
		this._height = height;
	}
	,setWidth: function(width) {
		this._width = width;
	}
	,getHeight: function() {
		return this._height;
	}
	,getWidth: function() {
		return this._width;
	}
	,toSvg: function(includeWrapper,className) {
		var out = new haxe.io.BytesOutput();
		this.writeTo(out,includeWrapper,className);
		out.flush();
		return out.getBytes().toString();
	}
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
		stream.writeString(this._buffer.b);
		if(includeWrapper) stream.writeString("</svg>");
	}
	,__class__: alphatab.platform.svg.SvgCanvas
}
if(!alphatab.platform.model) alphatab.platform.model = {}
alphatab.platform.model.Color = function(r,g,b,a) {
	if(a == null) a = 255;
	this._higherBits = (a & 255) << 8 | r & 255;
	this._lowerBits = (g & 255) << 8 | b & 255;
};
alphatab.platform.model.Color.__name__ = true;
alphatab.platform.model.Color.prototype = {
	toRgbaString: function() {
		return "rgba(" + this.getR() + "," + this.getG() + "," + this.getB() + "," + this.getA() / 255.0 + ")";
	}
	,toHexString: function() {
		return "#" + StringTools.hex(this.getA(),2) + StringTools.hex(this.getR(),2) + StringTools.hex(this.getG(),2) + StringTools.hex(this.getB(),2);
	}
	,getB: function() {
		return this._lowerBits & 255;
	}
	,getG: function() {
		return this._lowerBits >> 8 & 255;
	}
	,getR: function() {
		return this._higherBits & 255;
	}
	,getA: function() {
		return this._higherBits >> 8 & 255;
	}
	,__class__: alphatab.platform.model.Color
}
alphatab.platform.model.Font = function(family,size,style) {
	if(style == null) style = 0;
	this._family = family;
	this._size = size;
	this._style = style;
};
alphatab.platform.model.Font.__name__ = true;
alphatab.platform.model.Font.prototype = {
	toCssString: function() {
		var buf = new StringBuf();
		if((this.getStyle() & 1) != 0) buf.b += "bold ";
		if((this.getStyle() & 2) != 0) buf.b += "italic ";
		buf.b += Std.string(this._size);
		buf.b += "px";
		buf.b += "'";
		buf.b += Std.string(this._family);
		buf.b += "'";
		return buf.b;
	}
	,isItalic: function() {
		return (this.getStyle() & 2) != 0;
	}
	,isBold: function() {
		return (this.getStyle() & 1) != 0;
	}
	,getStyle: function() {
		return this._style;
	}
	,getSize: function() {
		return this._size;
	}
	,getFamily: function() {
		return this._family;
	}
	,__class__: alphatab.platform.model.Font
}
alphatab.platform.model.TextAlign = { __ename__ : true, __constructs__ : ["Left","Center","Right"] }
alphatab.platform.model.TextAlign.Left = ["Left",0];
alphatab.platform.model.TextAlign.Left.toString = $estr;
alphatab.platform.model.TextAlign.Left.__enum__ = alphatab.platform.model.TextAlign;
alphatab.platform.model.TextAlign.Center = ["Center",1];
alphatab.platform.model.TextAlign.Center.toString = $estr;
alphatab.platform.model.TextAlign.Center.__enum__ = alphatab.platform.model.TextAlign;
alphatab.platform.model.TextAlign.Right = ["Right",2];
alphatab.platform.model.TextAlign.Right.toString = $estr;
alphatab.platform.model.TextAlign.Right.__enum__ = alphatab.platform.model.TextAlign;
alphatab.platform.IFileLoader = function() { }
alphatab.platform.IFileLoader.__name__ = true;
alphatab.platform.IFileLoader.prototype = {
	__class__: alphatab.platform.IFileLoader
}
alphatab.platform.js.JsFileLoader = function() {
};
alphatab.platform.js.JsFileLoader.__name__ = true;
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
	loadBinaryAsync: function(path,success,error) {
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
			var xhr = new XMLHttpRequest();
			xhr.overrideMimeType("text/plain; charset=x-user-defined");
			xhr.onreadystatechange = function(e) {
				if(xhr.readyState == 4) {
					if(xhr.status == 200) {
						var reader = alphatab.platform.js.JsFileLoader.getBytes(xhr.responseText);
						success(reader);
					} else if(xhr.status == 0) error("You are offline!!\n Please Check Your Network."); else if(xhr.status == 404) error("Requested URL not found."); else if(xhr.status == 500) error("Internel Server Error."); else if(xhr.statusText == "parsererror") error("Error.\nParsing JSON Request failed."); else if(xhr.statusText == "timeout") error("Request Time out."); else error("Unknow Error: " + xhr.responseText);
				}
			};
			xhr.open("GET",path,true);
			xhr.send(null);
		}
	}
	,loadBinary: function(path) {
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
			var xhr = new XMLHttpRequest();
			xhr.overrideMimeType("text/plain; charset=x-user-defined");
			xhr.open("GET",path,false);
			xhr.send(null);
			if(xhr.status == 200) {
				var reader = alphatab.platform.js.JsFileLoader.getBytes(xhr.responseText);
				return reader;
			} else if(xhr.status == 0) throw "You are offline!!\n Please Check Your Network."; else if(xhr.status == 404) throw "Requested URL not found."; else if(xhr.status == 500) throw "Internel Server Error."; else if(xhr.statusText == "parsererror") throw "Error.\nParsing JSON Request failed."; else if(xhr.statusText == "timeout") throw "Request Time out."; else throw "Unknow Error: " + xhr.responseText;
		}
	}
	,__class__: alphatab.platform.js.JsFileLoader
}
if(!alphatab.rendering) alphatab.rendering = {}
if(!alphatab.rendering.layout) alphatab.rendering.layout = {}
alphatab.rendering.layout.ScoreLayout = function(renderer) {
	this.renderer = renderer;
};
alphatab.rendering.layout.ScoreLayout.__name__ = true;
alphatab.rendering.layout.ScoreLayout.prototype = {
	createEmptyStaveGroup: function() {
		var group = new alphatab.rendering.staves.StaveGroup();
		group.layout = this;
		var _g = 0, _g1 = this.renderer.settings.staves;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			if(alphatab.Environment.staveFactories.exists(s.id)) group.addStave(new alphatab.rendering.staves.Stave((alphatab.Environment.staveFactories.get(s.id))(this)));
		}
		return group;
	}
	,paintScore: function() {
	}
	,doLayout: function() {
	}
	,__class__: alphatab.rendering.layout.ScoreLayout
}
alphatab.rendering.layout.PageViewLayout = function(renderer) {
	alphatab.rendering.layout.ScoreLayout.call(this,renderer);
	this._groups = new Array();
};
alphatab.rendering.layout.PageViewLayout.__name__ = true;
alphatab.rendering.layout.PageViewLayout.__super__ = alphatab.rendering.layout.ScoreLayout;
alphatab.rendering.layout.PageViewLayout.prototype = $extend(alphatab.rendering.layout.ScoreLayout.prototype,{
	getSheetWidth: function() {
		return Math.round(795 * this.renderer.scale);
	}
	,getMaxWidth: function() {
		return this.getSheetWidth() - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[0] - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[2];
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
	,fitGroup: function(group) {
		var barSpace = 0;
		if(group.isFull) {
			var freeSpace = this.getSheetWidth() - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[0] - alphatab.rendering.layout.PageViewLayout.PAGE_PADDING[2] - group.width;
			if(freeSpace != 0 && group.bars.length > 0) barSpace = Math.round(freeSpace / group.bars.length);
		}
		group.applyBarSpacing(barSpace);
		this.width = Math.round(Math.max(this.width,group.width));
	}
	,isNullOrEmpty: function(s) {
		return s == null || StringTools.trim(s) == "";
	}
	,paintScoreInfo: function(x,y) {
		var flags = this.renderer.settings.layout.get("hideInfo",false)?0:511;
		var score = this.renderer.get_score();
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
	,drawCentered: function(text,font,y) {
		this.renderer.canvas.setFont(font);
		this.renderer.canvas.fillText(text,this.width / 2,y);
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
	,doScoreInfoLayout: function(y) {
		var flags = this.renderer.settings.layout.get("hideInfo",false)?0:511;
		var score = this.renderer.get_score();
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
	,__class__: alphatab.rendering.layout.PageViewLayout
});
alphatab.rendering.layout.HorizontalScreenLayout = function(renderer) {
	alphatab.rendering.layout.ScoreLayout.call(this,renderer);
};
alphatab.rendering.layout.HorizontalScreenLayout.__name__ = true;
alphatab.rendering.layout.HorizontalScreenLayout.__super__ = alphatab.rendering.layout.ScoreLayout;
alphatab.rendering.layout.HorizontalScreenLayout.prototype = $extend(alphatab.rendering.layout.ScoreLayout.prototype,{
	paintScore: function() {
		this._group.paint(0,0,this.renderer.canvas);
	}
	,doLayout: function() {
		var currentBarIndex = 0;
		var endBarIndex = this.renderer.track.bars.length - 1;
		var x = alphatab.rendering.layout.HorizontalScreenLayout.PAGE_PADDING[0];
		var y = alphatab.rendering.layout.HorizontalScreenLayout.PAGE_PADDING[1];
		this._group = this.createEmptyStaveGroup();
		var _g1 = 0, _g = this.renderer.track.bars.length;
		while(_g1 < _g) {
			var i = _g1++;
			var bar = this.renderer.track.bars[i];
			this._group.addBar(bar);
		}
		this._group.x = x;
		this._group.y = y;
		this._group.finalizeGroup(this);
		y += this._group.calculateHeight() + (20 * this.renderer.scale | 0);
		this.height = y + alphatab.rendering.layout.HorizontalScreenLayout.PAGE_PADDING[3];
		this.width = this._group.x + this._group.width + alphatab.rendering.layout.HorizontalScreenLayout.PAGE_PADDING[2];
	}
	,__class__: alphatab.rendering.layout.HorizontalScreenLayout
});
alphatab.rendering.IEffectBarRendererInfo = function() { }
alphatab.rendering.IEffectBarRendererInfo.__name__ = true;
alphatab.rendering.IEffectBarRendererInfo.prototype = {
	__class__: alphatab.rendering.IEffectBarRendererInfo
}
if(!alphatab.rendering.effects) alphatab.rendering.effects = {}
alphatab.rendering.effects.MarkerEffectInfo = function() {
};
alphatab.rendering.effects.MarkerEffectInfo.__name__ = true;
alphatab.rendering.effects.MarkerEffectInfo.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.MarkerEffectInfo.prototype = {
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.TextGlyph(0,0,beat.voice.bar.getMasterBar().section.text,renderer.stave.staveGroup.layout.renderer.renderingResources.markerFont);
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		return beat.index == 0 && beat.voice.bar.getMasterBar().section != null;
	}
	,__class__: alphatab.rendering.effects.MarkerEffectInfo
}
alphatab.rendering.BarRendererFactory = function() {
	this.isInAccolade = true;
};
alphatab.rendering.BarRendererFactory.__name__ = true;
alphatab.rendering.BarRendererFactory.prototype = {
	create: function(bar) {
		return null;
	}
	,__class__: alphatab.rendering.BarRendererFactory
}
alphatab.rendering.EffectBarRendererFactory = function(info) {
	alphatab.rendering.BarRendererFactory.call(this);
	this.isInAccolade = false;
	this._info = info;
};
alphatab.rendering.EffectBarRendererFactory.__name__ = true;
alphatab.rendering.EffectBarRendererFactory.__super__ = alphatab.rendering.BarRendererFactory;
alphatab.rendering.EffectBarRendererFactory.prototype = $extend(alphatab.rendering.BarRendererFactory.prototype,{
	create: function(bar) {
		return new alphatab.rendering.EffectBarRenderer(bar,this._info);
	}
	,__class__: alphatab.rendering.EffectBarRendererFactory
});
alphatab.rendering.effects.TripletFeelEffectInfo = function() {
};
alphatab.rendering.effects.TripletFeelEffectInfo.__name__ = true;
alphatab.rendering.effects.TripletFeelEffectInfo.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.TripletFeelEffectInfo.prototype = {
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.DummyEffectGlyph(0,0,"TripletFeel");
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		return beat.index == 0 && (beat.voice.bar.getMasterBar().index == 0 && beat.voice.bar.getMasterBar().tripletFeel != alphatab.model.TripletFeel.NoTripletFeel) || beat.voice.bar.getMasterBar().index > 0 && beat.voice.bar.getMasterBar().tripletFeel != beat.voice.bar.getMasterBar().previousMasterBar.tripletFeel;
	}
	,__class__: alphatab.rendering.effects.TripletFeelEffectInfo
}
alphatab.rendering.effects.TempoEffectInfo = function() {
};
alphatab.rendering.effects.TempoEffectInfo.__name__ = true;
alphatab.rendering.effects.TempoEffectInfo.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.TempoEffectInfo.prototype = {
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.DummyEffectGlyph(0,0,"Tempo");
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		return beat.index == 0 && (beat.voice.bar.getMasterBar().tempoAutomation != null && beat.voice.bar.index == 0);
	}
	,__class__: alphatab.rendering.effects.TempoEffectInfo
}
alphatab.rendering.effects.TextEffectInfo = function() {
};
alphatab.rendering.effects.TextEffectInfo.__name__ = true;
alphatab.rendering.effects.TextEffectInfo.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.TextEffectInfo.prototype = {
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.TextGlyph(0,0,beat.text,renderer.stave.staveGroup.layout.renderer.renderingResources.effectFont);
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		return beat.text != null && StringTools.trim(beat.text).length > 0;
	}
	,__class__: alphatab.rendering.effects.TextEffectInfo
}
alphatab.rendering.effects.ChordsEffectInfo = function() {
};
alphatab.rendering.effects.ChordsEffectInfo.__name__ = true;
alphatab.rendering.effects.ChordsEffectInfo.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.ChordsEffectInfo.prototype = {
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.TextGlyph(0,0,beat.chord.name,renderer.stave.staveGroup.layout.renderer.renderingResources.effectFont);
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		return beat.chord != null;
	}
	,__class__: alphatab.rendering.effects.ChordsEffectInfo
}
alphatab.rendering.effects.BeatVibratoEffectInfo = function() {
};
alphatab.rendering.effects.BeatVibratoEffectInfo.__name__ = true;
alphatab.rendering.effects.BeatVibratoEffectInfo.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.BeatVibratoEffectInfo.prototype = {
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.VibratoGlyph(0,5 * renderer.stave.staveGroup.layout.renderer.scale | 0,1.15);
	}
	,getHeight: function(renderer) {
		return 17 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		return beat.vibrato != alphatab.model.VibratoType.None;
	}
	,__class__: alphatab.rendering.effects.BeatVibratoEffectInfo
}
alphatab.rendering.effects.NoteEffectInfoBase = function() {
};
alphatab.rendering.effects.NoteEffectInfoBase.__name__ = true;
alphatab.rendering.effects.NoteEffectInfoBase.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.NoteEffectInfoBase.prototype = {
	createNewGlyph: function(renderer,beat) {
		return null;
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
	}
	,getHeight: function(renderer) {
		return 0;
	}
	,shouldCreateGlyphForNote: function(renderer,note) {
		return false;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		this._lastCreateInfo = new Array();
		var _g = 0, _g1 = beat.notes;
		while(_g < _g1.length) {
			var n = _g1[_g];
			++_g;
			if(this.shouldCreateGlyphForNote(renderer,n)) this._lastCreateInfo.push(n);
		}
		return this._lastCreateInfo.length > 0;
	}
	,__class__: alphatab.rendering.effects.NoteEffectInfoBase
}
alphatab.rendering.effects.NoteVibratoEffectInfo = function() {
	alphatab.rendering.effects.NoteEffectInfoBase.call(this);
};
alphatab.rendering.effects.NoteVibratoEffectInfo.__name__ = true;
alphatab.rendering.effects.NoteVibratoEffectInfo.__super__ = alphatab.rendering.effects.NoteEffectInfoBase;
alphatab.rendering.effects.NoteVibratoEffectInfo.prototype = $extend(alphatab.rendering.effects.NoteEffectInfoBase.prototype,{
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.VibratoGlyph(0,5 * renderer.stave.staveGroup.layout.renderer.scale | 0);
	}
	,getHeight: function(renderer) {
		return 15 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyphForNote: function(renderer,note) {
		return note.vibrato != alphatab.model.VibratoType.None;
	}
	,__class__: alphatab.rendering.effects.NoteVibratoEffectInfo
});
alphatab.rendering.ScoreBarRendererFactory = function() {
	alphatab.rendering.BarRendererFactory.call(this);
};
alphatab.rendering.ScoreBarRendererFactory.__name__ = true;
alphatab.rendering.ScoreBarRendererFactory.__super__ = alphatab.rendering.BarRendererFactory;
alphatab.rendering.ScoreBarRendererFactory.prototype = $extend(alphatab.rendering.BarRendererFactory.prototype,{
	create: function(bar) {
		return new alphatab.rendering.ScoreBarRenderer(bar);
	}
	,__class__: alphatab.rendering.ScoreBarRendererFactory
});
alphatab.rendering.effects.DynamicsEffectInfo = function() {
};
alphatab.rendering.effects.DynamicsEffectInfo.__name__ = true;
alphatab.rendering.effects.DynamicsEffectInfo.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.DynamicsEffectInfo.prototype = {
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.DynamicsGlyph(0,0,beat.dynamicValue);
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		return beat.index == 0 && beat.voice.bar.index == 0 || beat.previousBeat != null && beat.dynamicValue != beat.previousBeat.dynamicValue;
	}
	,__class__: alphatab.rendering.effects.DynamicsEffectInfo
}
alphatab.rendering.effects.TapEffectInfo = function() {
	alphatab.rendering.effects.NoteEffectInfoBase.call(this);
};
alphatab.rendering.effects.TapEffectInfo.__name__ = true;
alphatab.rendering.effects.TapEffectInfo.__super__ = alphatab.rendering.effects.NoteEffectInfoBase;
alphatab.rendering.effects.TapEffectInfo.prototype = $extend(alphatab.rendering.effects.NoteEffectInfoBase.prototype,{
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.DummyEffectGlyph(0,0,"Tap");
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyphForNote: function(renderer,note) {
		return note.tapping;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		if(beat.slap || beat.pop) return true;
		return alphatab.rendering.effects.NoteEffectInfoBase.prototype.shouldCreateGlyph.call(this,renderer,beat);
	}
	,__class__: alphatab.rendering.effects.TapEffectInfo
});
alphatab.rendering.effects.FadeInEffectInfo = function() {
};
alphatab.rendering.effects.FadeInEffectInfo.__name__ = true;
alphatab.rendering.effects.FadeInEffectInfo.__interfaces__ = [alphatab.rendering.IEffectBarRendererInfo];
alphatab.rendering.effects.FadeInEffectInfo.prototype = {
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.DummyEffectGlyph(0,0,"FadeIn");
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		return beat.fadeIn;
	}
	,__class__: alphatab.rendering.effects.FadeInEffectInfo
}
alphatab.rendering.effects.LetRingEffectInfo = function() {
	alphatab.rendering.effects.NoteEffectInfoBase.call(this);
};
alphatab.rendering.effects.LetRingEffectInfo.__name__ = true;
alphatab.rendering.effects.LetRingEffectInfo.__super__ = alphatab.rendering.effects.NoteEffectInfoBase;
alphatab.rendering.effects.LetRingEffectInfo.prototype = $extend(alphatab.rendering.effects.NoteEffectInfoBase.prototype,{
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.DummyEffectGlyph(0,0,"LetRing");
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyphForNote: function(renderer,note) {
		return note.isLetRing;
	}
	,__class__: alphatab.rendering.effects.LetRingEffectInfo
});
alphatab.rendering.effects.PalmMuteEffectInfo = function() {
	alphatab.rendering.effects.NoteEffectInfoBase.call(this);
};
alphatab.rendering.effects.PalmMuteEffectInfo.__name__ = true;
alphatab.rendering.effects.PalmMuteEffectInfo.__super__ = alphatab.rendering.effects.NoteEffectInfoBase;
alphatab.rendering.effects.PalmMuteEffectInfo.prototype = $extend(alphatab.rendering.effects.NoteEffectInfoBase.prototype,{
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.DummyEffectGlyph(0,0,"PalmMute");
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat;
	}
	,getHeight: function(renderer) {
		return 20 * renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,shouldCreateGlyphForNote: function(renderer,note) {
		return note.isPalmMute;
	}
	,__class__: alphatab.rendering.effects.PalmMuteEffectInfo
});
alphatab.rendering.TabBarRendererFactory = function() {
	alphatab.rendering.BarRendererFactory.call(this);
};
alphatab.rendering.TabBarRendererFactory.__name__ = true;
alphatab.rendering.TabBarRendererFactory.__super__ = alphatab.rendering.BarRendererFactory;
alphatab.rendering.TabBarRendererFactory.prototype = $extend(alphatab.rendering.BarRendererFactory.prototype,{
	create: function(bar) {
		return new alphatab.rendering.TabBarRenderer(bar);
	}
	,__class__: alphatab.rendering.TabBarRendererFactory
});
alphatab.rendering.effects.FingeringEffectInfo = function() {
	alphatab.rendering.effects.NoteEffectInfoBase.call(this);
	this._maxGlyphCount = 0;
};
alphatab.rendering.effects.FingeringEffectInfo.__name__ = true;
alphatab.rendering.effects.FingeringEffectInfo.__super__ = alphatab.rendering.effects.NoteEffectInfoBase;
alphatab.rendering.effects.FingeringEffectInfo.prototype = $extend(alphatab.rendering.effects.NoteEffectInfoBase.prototype,{
	createNewGlyph: function(renderer,beat) {
		return new alphatab.rendering.glyphs.effects.DummyEffectGlyph(0,0,this._lastCreateInfo.length + "fingering");
	}
	,getSizingMode: function() {
		return alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly;
	}
	,getHeight: function(renderer) {
		return this._maxGlyphCount * (20 * renderer.stave.staveGroup.layout.renderer.scale | 0);
	}
	,shouldCreateGlyphForNote: function(renderer,note) {
		return note.leftHandFinger != -1 && note.leftHandFinger != -2 || note.rightHandFinger != -1 && note.rightHandFinger != -2;
	}
	,shouldCreateGlyph: function(renderer,beat) {
		var result = alphatab.rendering.effects.NoteEffectInfoBase.prototype.shouldCreateGlyph.call(this,renderer,beat);
		if(this._lastCreateInfo.length > this._maxGlyphCount) this._maxGlyphCount = this._lastCreateInfo.length;
		return result;
	}
	,__class__: alphatab.rendering.effects.FingeringEffectInfo
});
alphatab.Environment = function() { }
alphatab.Environment.__name__ = true;
alphatab.Main = function() { }
alphatab.Main.__name__ = true;
alphatab.Main.main = function() {
}
alphatab.Settings = function() {
};
alphatab.Settings.__name__ = true;
alphatab.Settings.defaults = function() {
	var settings = new alphatab.Settings();
	settings.scale = 1.0;
	settings.autoSize = true;
	settings.width = 600;
	settings.height = 200;
	settings.engine = "default";
	settings.layout = alphatab.LayoutSettings.defaults();
	settings.staves = new Array();
	settings.staves.push(new alphatab.StaveSettings("marker"));
	settings.staves.push(new alphatab.StaveSettings("triplet-feel"));
	settings.staves.push(new alphatab.StaveSettings("tempo"));
	settings.staves.push(new alphatab.StaveSettings("text"));
	settings.staves.push(new alphatab.StaveSettings("chords"));
	settings.staves.push(new alphatab.StaveSettings("beat-vibrato"));
	settings.staves.push(new alphatab.StaveSettings("note-vibrato"));
	settings.staves.push(new alphatab.StaveSettings("score"));
	settings.staves.push(new alphatab.StaveSettings("dynamics"));
	settings.staves.push(new alphatab.StaveSettings("beat-vibrato"));
	settings.staves.push(new alphatab.StaveSettings("note-vibrato"));
	settings.staves.push(new alphatab.StaveSettings("tap"));
	settings.staves.push(new alphatab.StaveSettings("fade-in"));
	settings.staves.push(new alphatab.StaveSettings("let-ring"));
	settings.staves.push(new alphatab.StaveSettings("palm-mute"));
	settings.staves.push(new alphatab.StaveSettings("tab"));
	settings.staves.push(new alphatab.StaveSettings("fingering"));
	return settings;
}
alphatab.Settings.prototype = {
	__class__: alphatab.Settings
}
alphatab.LayoutSettings = function() {
	this.additionalSettings = new haxe.ds.StringMap();
};
alphatab.LayoutSettings.__name__ = true;
alphatab.LayoutSettings.defaults = function() {
	var settings = new alphatab.LayoutSettings();
	settings.mode = "page";
	return settings;
}
alphatab.LayoutSettings.prototype = {
	get: function(key,def) {
		if(this.additionalSettings.exists(key)) return this.additionalSettings.get(key);
		return def;
	}
	,__class__: alphatab.LayoutSettings
}
alphatab.StaveSettings = function(id) {
	this.id = id;
	this.additionalSettings = new haxe.ds.StringMap();
};
alphatab.StaveSettings.__name__ = true;
alphatab.StaveSettings.prototype = {
	__class__: alphatab.StaveSettings
}
if(!alphatab.audio) alphatab.audio = {}
alphatab.audio.GeneralMidi = function() { }
alphatab.audio.GeneralMidi.__name__ = true;
alphatab.audio.GeneralMidi.getValue = function(name) {
	if(alphatab.audio.GeneralMidi._values == null) {
		alphatab.audio.GeneralMidi._values = new haxe.ds.StringMap();
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
alphatab.audio.MidiUtils = function() { }
alphatab.audio.MidiUtils.__name__ = true;
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
alphatab.importer.ScoreImporter = function() {
};
alphatab.importer.ScoreImporter.__name__ = true;
alphatab.importer.ScoreImporter.availableImporters = function() {
	var scoreImporter = new Array();
	scoreImporter.push(new alphatab.importer.Gp3To5Importer());
	scoreImporter.push(new alphatab.importer.AlphaTexImporter());
	scoreImporter.push(new alphatab.importer.GpxImporter());
	return scoreImporter;
}
alphatab.importer.ScoreImporter.prototype = {
	previousNoteOnSameLine: function(note) {
		var previousBeat = note.beat.previousBeat;
		while(previousBeat != null && previousBeat.voice.bar == note.beat.voice.bar) {
			var noteOnString = previousBeat.getNoteOnString(note.string);
			if(noteOnString != null) return noteOnString; else previousBeat = previousBeat.previousBeat;
		}
		return null;
	}
	,nextNoteOnSameLine: function(note) {
		var nextBeat = note.beat.nextBeat;
		while(nextBeat != null && nextBeat.voice.bar == note.beat.voice.bar) {
			var noteOnString = nextBeat.getNoteOnString(note.string);
			if(noteOnString != null) return noteOnString; else nextBeat = nextBeat.nextBeat;
		}
		return null;
	}
	,finish: function(score) {
		var _g10 = this;
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
								var n = [_g9[_g8]];
								++_g8;
								var nextNoteOnLine = new alphatab.util.LazyVar((function(n) {
									return function() {
										return _g10.nextNoteOnSameLine(n[0]);
									};
								})(n));
								var prevNoteOnLine = new alphatab.util.LazyVar((function(n) {
									return function() {
										return _g10.previousNoteOnSameLine(n[0]);
									};
								})(n));
								if(n[0].isTieDestination) {
									if(prevNoteOnLine.getValue() == null) n[0].isTieDestination = false; else {
										n[0].tieOrigin = prevNoteOnLine.getValue();
										n[0].tieOrigin.isTieOrigin = true;
										n[0].fret = n[0].tieOrigin.fret;
									}
								}
								if(n[0].isHammerPullOrigin) {
									if(nextNoteOnLine.getValue() == null) n[0].isHammerPullOrigin = false; else {
										nextNoteOnLine.getValue().isHammerPullDestination = true;
										nextNoteOnLine.getValue().hammerPullOrigin = n[0];
									}
								}
								if(n[0].slideType != alphatab.model.SlideType.None) n[0].slideTarget = nextNoteOnLine.getValue();
							}
						}
					}
				}
			}
		}
	}
	,readScore: function() {
		return null;
	}
	,init: function(data) {
		this._data = data;
	}
	,__class__: alphatab.importer.ScoreImporter
}
alphatab.importer.AlphaTexImporter = function() {
	alphatab.importer.ScoreImporter.call(this);
};
alphatab.importer.AlphaTexImporter.__name__ = true;
alphatab.importer.AlphaTexImporter.isLetter = function(ch) {
	var code = HxOverrides.cca(ch,0);
	return !alphatab.importer.AlphaTexImporter.isTerminal(ch) && (code >= 33 && code <= 47 || code >= 58 && code <= 126 || code > 128);
}
alphatab.importer.AlphaTexImporter.isTerminal = function(ch) {
	return ch == "." || ch == "{" || ch == "}" || ch == "[" || ch == "]" || ch == "(" || ch == ")" || ch == "|" || ch == "'" || ch == "\"" || ch == "\\";
}
alphatab.importer.AlphaTexImporter.__super__ = alphatab.importer.ScoreImporter;
alphatab.importer.AlphaTexImporter.prototype = $extend(alphatab.importer.ScoreImporter.prototype,{
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
		} while(alphatab.importer.AlphaTexImporter.isLetter(this._ch) || this.isDigit(this._ch));
		return str;
	}
	,isDigit: function(ch) {
		var code = HxOverrides.cca(ch,0);
		return code >= 48 && code <= 57 || ch == "-" && this._allowNegatives;
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
	,parseTuning: function(str) {
		var tuning = alphatab.model.Tuning.getTuningForText(str);
		if(tuning < 0) this.error("tuning-value",alphatab.importer.AlphaTexSymbols.String,false);
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
					var _g = this;
					switch(_g._syData) {
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
				var duration = alphatab.model.Duration.Eighth;
				if(this._sy == alphatab.importer.AlphaTexSymbols.Number) {
					var _g = this;
					switch(_g._syData) {
					case 8:
						duration = alphatab.model.Duration.Eighth;
						break;
					case 16:
						duration = alphatab.model.Duration.Sixteenth;
						break;
					case 32:
						duration = alphatab.model.Duration.ThirtySecond;
						break;
					default:
						duration = alphatab.model.Duration.Eighth;
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
		this.noteEffects(note);
		note.string = this._track.tuning.length - (string - 1);
		note.isDead = isDead;
		note.isTieDestination = isTie;
		if(!isTie) note.fret = fret;
		beat.addNote(note);
		return note;
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
	,bars: function() {
		this.bar();
		while(this._sy != alphatab.importer.AlphaTexSymbols.Eof) {
			if(this._sy != alphatab.importer.AlphaTexSymbols.Pipe) this.error("bar",alphatab.importer.AlphaTexSymbols.Pipe);
			this.newSy();
			this.bar();
		}
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
	,score: function() {
		this.metaData();
		this.bars();
	}
	,error: function(nonterm,expected,symbolError) {
		if(symbolError == null) symbolError = true;
		if(symbolError) throw haxe.io.Error.Custom(Std.string(this._curChPos) + ": Error on block " + nonterm + ", expected a " + Std.string(expected) + " found a " + Std.string(this._sy)); else throw haxe.io.Error.Custom(Std.string(this._curChPos) + ": Error on block " + nonterm + ", invalid value:" + Std.string(this._syData));
	}
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
			console.log(e);
			throw alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT;
		}
	}
	,__class__: alphatab.importer.AlphaTexImporter
});
alphatab.importer.AlphaTexSymbols = { __ename__ : true, __constructs__ : ["No","Eof","Number","DoubleDot","Dot","String","Tuning","LParensis","RParensis","LBrace","RBrace","Pipe","MetaCommand"] }
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
alphatab.importer.Gp3To5Importer = function() {
	alphatab.importer.ScoreImporter.call(this);
	this._globalTripletFeel = alphatab.model.TripletFeel.NoTripletFeel;
};
alphatab.importer.Gp3To5Importer.__name__ = true;
alphatab.importer.Gp3To5Importer.__super__ = alphatab.importer.ScoreImporter;
alphatab.importer.Gp3To5Importer.prototype = $extend(alphatab.importer.ScoreImporter.prototype,{
	skip: function(count) {
		this._data.read(count);
	}
	,readStringByteLength: function(length) {
		var stringLength = this._data.readByte();
		var string = this._data.readString(stringLength);
		if(stringLength < length) this._data.read(length - stringLength);
		return string;
	}
	,readStringIntByte: function() {
		var length = this.readInt32() - 1;
		this._data.readByte();
		return this._data.readString(length);
	}
	,readStringInt: function() {
		return this._data.readString(this.readInt32());
	}
	,readStringIntUnused: function() {
		this._data.read(4);
		return this._data.readString(this._data.readByte());
	}
	,readInt32: function() {
		var ch1 = this._data.readByte();
		var ch2 = this._data.readByte();
		var ch3 = this._data.readByte();
		var ch4 = this._data.readByte();
		return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
	,readUInt8: function() {
		return this._data.readByte();
	}
	,readBool: function() {
		return this._data.readByte() != 0;
	}
	,readColor: function() {
		this._data.readByte();
		this._data.readByte();
		this._data.readByte();
		this._data.readByte();
	}
	,getDoubleSig: function(bytes,indices) {
		var sig = parseInt((((bytes.b[indices[1]] & 15) << 16 | bytes.b[indices[2]] << 8 | bytes.b[indices[3]]) * Math.pow(2,32)).toString(2),2) + parseInt(((bytes.b[indices[4]] >> 7) * Math.pow(2,31)).toString(2),2) + parseInt(((bytes.b[indices[4]] & 127) << 24 | bytes.b[indices[5]] << 16 | bytes.b[indices[6]] << 8 | bytes.b[indices[7]]).toString(2),2);
		return sig;
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
	,readTrill: function(note) {
		note.trillFret = this._data.readByte();
		note.trillSpeed = 1 + this._data.readByte();
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
	,readTremoloPicking: function(beat) {
		var speed = this._data.readByte();
		switch(speed) {
		case 1:
			beat.tremoloSpeed = alphatab.model.Duration.Eighth;
			break;
		case 2:
			beat.tremoloSpeed = alphatab.model.Duration.Sixteenth;
			break;
		case 3:
			beat.tremoloSpeed = alphatab.model.Duration.ThirtySecond;
			break;
		}
	}
	,readGrace: function(voice,note) {
		var graceBeat = new alphatab.model.Beat();
		var graceNote = new alphatab.model.Note();
		graceNote.string = note.string;
		graceNote.fret = this._data.readInt8();
		graceBeat.duration = alphatab.model.Duration.ThirtySecond;
		graceBeat.dynamicValue = this.toDynamicValue(this._data.readInt8());
		var transition = this._data.readInt8();
		switch(transition) {
		case 0:
			break;
		case 1:
			graceNote.slideType = alphatab.model.SlideType.Legato;
			graceNote.slideTarget = note;
			break;
		case 2:
			break;
		case 3:
			graceNote.isHammerPullOrigin = true;
			note.isHammerPullDestination = true;
			note.hammerPullOrigin = graceNote;
			break;
		}
		graceNote.dynamicValue = graceBeat.dynamicValue;
		this._data.read(1);
		if(this._versionNumber < 500) graceBeat.graceType = alphatab.model.GraceType.BeforeBeat; else {
			var flags = this._data.readByte();
			graceNote.isDead = (flags & 1) != 0;
			if((flags & 2) != 0) graceBeat.graceType = alphatab.model.GraceType.OnBeat; else graceBeat.graceType = alphatab.model.GraceType.BeforeBeat;
		}
		graceBeat.addNote(graceNote);
		voice.addGraceBeat(graceBeat);
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
	,toDynamicValue: function(value) {
		switch(value) {
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
		case 6:
			return alphatab.model.DynamicValue.F;
		case 7:
			return alphatab.model.DynamicValue.FF;
		case 8:
			return alphatab.model.DynamicValue.FFF;
		default:
			return alphatab.model.DynamicValue.F;
		}
	}
	,readNote: function(track,bar,voice,beat,stringIndex) {
		var newNote = new alphatab.model.Note();
		newNote.string = track.tuning.length - stringIndex;
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
			if(beat.dynamicValue == null) beat.dynamicValue = newNote.dynamicValue;
		}
		if(beat.dynamicValue == null) beat.dynamicValue = alphatab.model.DynamicValue.F;
		if((flags & 32) != 0) newNote.fret = this._data.readInt8();
		if((flags & 128) != 0) {
			newNote.leftHandFinger = this._data.readInt8();
			newNote.rightHandFinger = this._data.readInt8();
			newNote.isFingering = true;
		}
		if(this._versionNumber >= 500) {
			if((flags & 1) != 0) newNote.durationPercent = this.readDouble();
			var flags2 = this._data.readByte();
			newNote.swapAccidentals = (flags2 & 2) != 0;
		}
		if((flags & 8) != 0) this.readNoteEffects(track,voice,beat,newNote);
		beat.addNote(newNote);
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
		if((flags2 & 2) != 0) {
			var _g = this._data.readInt8();
			switch(_g) {
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
		if(newBeat.dynamicValue == null) newBeat.dynamicValue = alphatab.model.DynamicValue.F;
		if(this._versionNumber >= 500) {
			this._data.readByte();
			var flag = this._data.readByte();
			if((flag & 8) != 0) this._data.readByte();
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
	,readTracks: function() {
		var _g1 = 0, _g = this._trackCount;
		while(_g1 < _g) {
			var i = _g1++;
			this.readTrack();
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
	,readMasterBars: function() {
		var _g1 = 0, _g = this._barCount;
		while(_g1 < _g) {
			var i = _g1++;
			this.readMasterBar();
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
	,readPageSetup: function() {
		this._data.read(30);
		var _g = 0;
		while(_g < 10) {
			var i = _g++;
			this.readStringIntByte();
		}
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
			if(i > 0) notice.b += "\n";
			notice.b += Std.string(this.readStringIntUnused());
		}
		this._score.notices = notice.b;
	}
	,readVersion: function() {
		var version = this.readStringByteLength(30);
		if(!StringTools.startsWith(version,"FICHIER GUITAR PRO ")) throw alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT;
		version = HxOverrides.substr(version,"FICHIER GUITAR PRO ".length + 1,null);
		var dot = version.indexOf(".");
		this._versionNumber = 100 * Std.parseInt(HxOverrides.substr(version,0,dot)) + Std.parseInt(HxOverrides.substr(version,dot + 1,null));
	}
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
	,__class__: alphatab.importer.Gp3To5Importer
});
alphatab.importer.GpxFile = function() {
};
alphatab.importer.GpxFile.__name__ = true;
alphatab.importer.GpxFile.prototype = {
	__class__: alphatab.importer.GpxFile
}
alphatab.importer.GpxFileSystem = function() {
	this.files = new Array();
};
alphatab.importer.GpxFileSystem.__name__ = true;
alphatab.importer.GpxFileSystem.prototype = {
	getInteger: function(data,offset) {
		return (data.b[offset + 3] & 255) << 24 | (data.b[offset + 2] & 255) << 16 | (data.b[offset + 1] & 255) << 8 | data.b[offset] & 255;
	}
	,getString: function(data,offset,length) {
		var buf = new StringBuf();
		var _g = 0;
		while(_g < length) {
			var i = _g++;
			var code = data.b[offset + i] & 255;
			if(code == 0) break;
			buf.b += String.fromCharCode(code);
		}
		return buf.b;
	}
	,readUncompressedBlock: function(data) {
		var sectorSize = 4096;
		var offset = sectorSize;
		while(offset + 3 < data.length) {
			var entryType = this.getInteger(data,offset);
			if(entryType == 2) {
				var file = new alphatab.importer.GpxFile();
				file.fileName = this.getString(data,offset + 4,127);
				file.fileSize = this.getInteger(data,offset + 140);
				var storeFile = this._fileFilter != null?this._fileFilter(file.fileName):this.defaultFileFilter(file.fileName);
				if(storeFile) this.files.push(file);
				var dataPointerOffset = offset + 148;
				var sector = 0;
				var sectorCount = 0;
				var fileData = storeFile?new alphatab.io.BytesArray(file.fileSize):null;
				while((sector = this.getInteger(data,dataPointerOffset + 4 * sectorCount++)) != 0) {
					offset = sector * sectorSize;
					if(storeFile) fileData.addBytes(data.sub(offset,sectorSize));
				}
				if(storeFile) {
					file.data = haxe.io.Bytes.alloc(Math.min(file.fileSize,fileData.length) | 0);
					file.data.blit(0,fileData.getBuffer(),0,file.data.length);
				}
			}
			offset += sectorSize;
		}
	}
	,readBlock: function(data) {
		var header = this.readHeader(data);
		if(header == "BCFZ") this.readUncompressedBlock(this.decompress(data,true)); else if(header == "BCFS") this.readUncompressedBlock(data.readAll()); else throw alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT;
	}
	,decompress: function(src,skipHeader) {
		if(skipHeader == null) skipHeader = false;
		var uncompressed = new alphatab.io.BytesArray();
		var expectedLength = src.readInt32();
		try {
			while(uncompressed.length < expectedLength) {
				var flag = src.readBits(1);
				if(flag == 1) {
					var wordSize = src.readBits(4);
					var offset = src.readBitsReversed(wordSize);
					var size = src.readBitsReversed(wordSize);
					var sourcePosition = uncompressed.length - offset;
					var toRead = Math.min(offset,size) | 0;
					var subBuffer = uncompressed.sub(sourcePosition,toRead);
					uncompressed.addBytes(subBuffer);
				} else {
					var size = src.readBitsReversed(2);
					var _g = 0;
					while(_g < size) {
						var i = _g++;
						uncompressed.add(src.readByte());
					}
				}
			}
		} catch( e ) {
			if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
			} else throw(e);
		}
		return uncompressed.getBytes(skipHeader?4:0);
	}
	,readHeader: function(src) {
		return src.readString(4);
	}
	,load: function(data) {
		var src = new alphatab.io.BitInput(data);
		this.readBlock(src);
	}
	,defaultFileFilter: function(s) {
		return true;
	}
	,setFileFilter: function(fileFilter) {
		this._fileFilter = fileFilter;
	}
	,__class__: alphatab.importer.GpxFileSystem
}
alphatab.importer.GpxImporter = function() {
	alphatab.importer.ScoreImporter.call(this);
};
alphatab.importer.GpxImporter.__name__ = true;
alphatab.importer.GpxImporter.__super__ = alphatab.importer.ScoreImporter;
alphatab.importer.GpxImporter.prototype = $extend(alphatab.importer.ScoreImporter.prototype,{
	readScore: function() {
		var fileSystem = new alphatab.importer.GpxFileSystem();
		fileSystem.setFileFilter(function(s) {
			return s == "score.gpif";
		});
		fileSystem.load(this._data);
		var xml = fileSystem.files[0].data.toString();
		fileSystem.files = null;
		fileSystem = null;
		var parser = new alphatab.importer.GpxParser();
		parser.parseXml(xml);
		return parser.score;
	}
	,__class__: alphatab.importer.GpxImporter
});
alphatab.importer.GpxParser = function() {
};
alphatab.importer.GpxParser.__name__ = true;
alphatab.importer.GpxParser.prototype = {
	parseScoreNode: function(node) {
		var $it0 = node.iterator();
		while( $it0.hasNext() ) {
			var c = $it0.next();
			var _g = c.get_nodeName();
			switch(_g) {
			case "Title":
				this.score.title = c.get_nodeValue();
				break;
			case "SubTitle":
				this.score.subTitle = c.get_nodeValue();
				break;
			case "Artist":
				this.score.artist = c.get_nodeValue();
				break;
			case "Album":
				this.score.album = c.get_nodeValue();
				break;
			case "Words":
				this.score.words = c.get_nodeValue();
				break;
			case "Music":
				this.score.music = c.get_nodeValue();
				break;
			case "WordsAndMusic":
				if(c.get_nodeValue() != null && c.get_nodeValue() != "") {
					this.score.words = c.get_nodeValue();
					this.score.music = c.get_nodeValue();
				}
				break;
			case "Copyright":
				this.score.copyright = c.get_nodeValue();
				break;
			case "Tabber":
				this.score.tab = c.get_nodeValue();
				break;
			}
		}
	}
	,parseDom: function(xml) {
		if(xml.get_nodeName() == "GPIF") {
			this.score = new alphatab.model.Score();
			var $it0 = xml.iterator();
			while( $it0.hasNext() ) {
				var n = $it0.next();
				var _g = n.get_nodeName();
				switch(_g) {
				case "Score":
					this.parseScoreNode(n);
					break;
				}
			}
		} else throw alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT;
	}
	,parseXml: function(xml) {
		var dom = Xml.parse(xml);
		this.parseDom(dom);
	}
	,__class__: alphatab.importer.GpxParser
}
alphatab.importer.MixTableChange = function() {
	this.volume = -1;
	this.balance = -1;
	this.instrument = -1;
	this.tempoName = null;
	this.tempo = -1;
	this.duration = 0;
};
alphatab.importer.MixTableChange.__name__ = true;
alphatab.importer.MixTableChange.prototype = {
	__class__: alphatab.importer.MixTableChange
}
alphatab.importer.ScoreLoader = function() { }
alphatab.importer.ScoreLoader.__name__ = true;
alphatab.importer.ScoreLoader.loadScoreAsync = function(path,success,error) {
	var loader = (alphatab.Environment.fileLoaders.get("default"))();
	loader.loadBinaryAsync(path,function(data) {
		var importers = alphatab.importer.ScoreImporter.availableImporters();
		var score = null;
		var _g = 0;
		while(_g < importers.length) {
			var importer = importers[_g];
			++_g;
			try {
				var input = new haxe.io.BytesInput(data);
				importer.init(input);
				score = importer.readScore();
				break;
			} catch( e ) {
				if(e == alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT) continue; else error(e);
			}
		}
		if(score != null) success(score); else error("No reader for the requested file found");
	},error);
}
if(!haxe.io) haxe.io = {}
haxe.io.Input = function() { }
haxe.io.Input.__name__ = true;
haxe.io.Input.prototype = {
	readString: function(len) {
		var b = haxe.io.Bytes.alloc(len);
		this.readFullBytes(b,0,len);
		return b.toString();
	}
	,readInt32: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		return this.bigEndian?ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24:ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
	,readInt8: function() {
		var n = this.readByte();
		if(n >= 128) return n - 256;
		return n;
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
	,readFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.readBytes(s,pos,len);
			pos += k;
			len -= k;
		}
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
	,readByte: function() {
		return (function($this) {
			var $r;
			throw "Not implemented";
			return $r;
		}(this));
	}
	,__class__: haxe.io.Input
}
if(!alphatab.io) alphatab.io = {}
alphatab.io.BitInput = function(input) {
	this._input = input;
	this._readBytes = 0;
	this._position = 8;
};
alphatab.io.BitInput.__name__ = true;
alphatab.io.BitInput.__super__ = haxe.io.Input;
alphatab.io.BitInput.prototype = $extend(haxe.io.Input.prototype,{
	readBit: function() {
		var bit = -1;
		if(this._position >= 8) {
			this._currentByte = this._input.readByte();
			this._readBytes++;
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
	,readByte: function() {
		return this.readBits(8);
	}
	,getReadBytes: function() {
		return this._readBytes;
	}
	,__class__: alphatab.io.BitInput
});
alphatab.io.BytesArray = function(initialSize) {
	if(initialSize == null) initialSize = 4;
	this._data = haxe.io.Bytes.alloc(initialSize);
	this.length = 0;
};
alphatab.io.BytesArray.__name__ = true;
alphatab.io.BytesArray.ofBytes = function(b) {
	var a = new alphatab.io.BytesArray();
	a._data = b;
	a.length = a._data.length;
	return a;
}
alphatab.io.BytesArray.prototype = {
	updateCapacity: function(min) {
		if(min < 0) throw haxe.io.Error.Overflow;
		if(this._data.length < min) {
			var c = Math.max(this._data.length * 2,min) | 0;
			this.setCapacity(c);
		}
	}
	,setCapacity: function(capacity) {
		var newData = haxe.io.Bytes.alloc(capacity);
		newData.blit(0,this._data,0,this._data.length);
		this._data = newData;
	}
	,get_capacity: function() {
		return this._data.length;
	}
	,getBytes: function(offset) {
		if(offset == null) offset = 0;
		var copy = haxe.io.Bytes.alloc(this.length);
		copy.blit(0,this._data,offset,this.length - offset);
		return copy;
	}
	,getBuffer: function() {
		return this._data;
	}
	,addBytes: function(v) {
		if(v.length > 0) {
			this.updateCapacity(this.length + v.length);
			this._data.blit(this.length,v,0,v.length);
			this.length += v.length;
		}
	}
	,add: function(v) {
		this.updateCapacity(this.length + 1);
		this._data.b[this.length++] = v & 255 & 255;
	}
	,sub: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		return this._data.sub(pos,len);
	}
	,set: function(pos,v) {
		if(pos >= this.length) throw haxe.io.Error.OutsideBounds;
		this._data.b[pos] = v & 255 & 255;
	}
	,get: function(pos) {
		if(pos >= this.length) throw haxe.io.Error.OutsideBounds;
		return this._data.b[pos];
	}
	,__class__: alphatab.io.BytesArray
}
alphatab.io.OutputExtensions = function() { }
alphatab.io.OutputExtensions.__name__ = true;
alphatab.io.OutputExtensions.writeAsString = function(output,value) {
	var text;
	if(js.Boot.__instanceof(value,String)) text = js.Boot.__cast(value , String); else text = Std.string(value);
	output.writeString(text);
}
if(!alphatab.model) alphatab.model = {}
alphatab.model.AccentuationType = { __ename__ : true, __constructs__ : ["None","Normal","Heavy"] }
alphatab.model.AccentuationType.None = ["None",0];
alphatab.model.AccentuationType.None.toString = $estr;
alphatab.model.AccentuationType.None.__enum__ = alphatab.model.AccentuationType;
alphatab.model.AccentuationType.Normal = ["Normal",1];
alphatab.model.AccentuationType.Normal.toString = $estr;
alphatab.model.AccentuationType.Normal.__enum__ = alphatab.model.AccentuationType;
alphatab.model.AccentuationType.Heavy = ["Heavy",2];
alphatab.model.AccentuationType.Heavy.toString = $estr;
alphatab.model.AccentuationType.Heavy.__enum__ = alphatab.model.AccentuationType;
alphatab.model.AccidentalType = { __ename__ : true, __constructs__ : ["None","Natural","Sharp","Flat"] }
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
alphatab.model.Automation = function() {
};
alphatab.model.Automation.__name__ = true;
alphatab.model.Automation.prototype = {
	__class__: alphatab.model.Automation
}
alphatab.model.AutomationType = { __ename__ : true, __constructs__ : ["Tempo","Volume","Instrument","Balance"] }
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
alphatab.model.Bar = function() {
	this.voices = new Array();
	this.clef = alphatab.model.Clef.G2;
};
alphatab.model.Bar.__name__ = true;
alphatab.model.Bar.prototype = {
	isEmpty: function() {
		var _g = 0, _g1 = this.voices;
		while(_g < _g1.length) {
			var v = _g1[_g];
			++_g;
			if(!v.isEmpty()) return false;
		}
		return true;
	}
	,getMasterBar: function() {
		return this.track.score.masterBars[this.index];
	}
	,addVoice: function(voice) {
		voice.bar = this;
		voice.index = this.voices.length;
		this.voices.push(voice);
	}
	,__class__: alphatab.model.Bar
}
alphatab.model.Beat = function() {
	this.whammyBarPoints = new Array();
	this.notes = new Array();
	this.brushType = alphatab.model.BrushType.None;
	this.vibrato = alphatab.model.VibratoType.None;
	this.graceType = alphatab.model.GraceType.None;
	this.pickStroke = alphatab.model.PickStrokeType.None;
	this.duration = alphatab.model.Duration.Quarter;
	this.tremoloSpeed = null;
	this.automations = new Array();
	this.start = 0;
	this.tupletDenominator = -1;
	this.tupletNumerator = -1;
};
alphatab.model.Beat.__name__ = true;
alphatab.model.Beat.prototype = {
	getNoteOnString: function(string) {
		var _g = 0, _g1 = this.notes;
		while(_g < _g1.length) {
			var n = _g1[_g];
			++_g;
			if(n.string == string) return n;
		}
		return null;
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
	,addNote: function(note) {
		note.beat = this;
		this.notes.push(note);
		if(this.minNote == null || note.realValue() < this.minNote.realValue()) this.minNote = note;
		if(this.maxNote == null || note.realValue() > this.maxNote.realValue()) this.maxNote = note;
	}
	,calculateDuration: function() {
		var ticks = alphatab.audio.MidiUtils.durationToTicks(this.duration);
		if(this.dots == 2) ticks = alphatab.audio.MidiUtils.applyDot(ticks,true); else if(this.dots == 1) ticks = alphatab.audio.MidiUtils.applyDot(ticks,false);
		if(this.tupletDenominator > 0 && this.tupletNumerator >= 0) ticks = alphatab.audio.MidiUtils.applyTuplet(ticks,this.tupletNumerator,this.tupletDenominator);
		return ticks;
	}
	,isTremolo: function() {
		return this.tremoloSpeed != null;
	}
	,hasChord: function() {
		return this.chord != null;
	}
	,hasWhammyBar: function() {
		return this.whammyBarPoints.length > 0;
	}
	,isRest: function() {
		return this.notes.length == 0;
	}
	,__class__: alphatab.model.Beat
}
alphatab.model.BendPoint = function(offset,value) {
	if(value == null) value = 0;
	if(offset == null) offset = 0;
	this.offset = offset;
	this.value = value;
};
alphatab.model.BendPoint.__name__ = true;
alphatab.model.BendPoint.prototype = {
	__class__: alphatab.model.BendPoint
}
alphatab.model.BrushType = { __ename__ : true, __constructs__ : ["None","BrushUp","BrushDown","ArpeggioUp","ArpeggioDown"] }
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
alphatab.model.Chord = function() {
	this.strings = new Array();
};
alphatab.model.Chord.__name__ = true;
alphatab.model.Chord.prototype = {
	__class__: alphatab.model.Chord
}
alphatab.model.Clef = { __ename__ : true, __constructs__ : ["C3","C4","F4","G2"] }
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
alphatab.model.Duration = { __ename__ : true, __constructs__ : ["Whole","Half","Quarter","Eighth","Sixteenth","ThirtySecond","SixtyFourth"] }
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
alphatab.model.DynamicValue = { __ename__ : true, __constructs__ : ["PPP","PP","P","MP","MF","F","FF","FFF"] }
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
alphatab.model.GraceType = { __ename__ : true, __constructs__ : ["None","OnBeat","BeforeBeat"] }
alphatab.model.GraceType.None = ["None",0];
alphatab.model.GraceType.None.toString = $estr;
alphatab.model.GraceType.None.__enum__ = alphatab.model.GraceType;
alphatab.model.GraceType.OnBeat = ["OnBeat",1];
alphatab.model.GraceType.OnBeat.toString = $estr;
alphatab.model.GraceType.OnBeat.__enum__ = alphatab.model.GraceType;
alphatab.model.GraceType.BeforeBeat = ["BeforeBeat",2];
alphatab.model.GraceType.BeforeBeat.toString = $estr;
alphatab.model.GraceType.BeforeBeat.__enum__ = alphatab.model.GraceType;
alphatab.model.HarmonicType = { __ename__ : true, __constructs__ : ["None","Natural","Artificial","Pinch","Tap","Semi","Feedback"] }
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
alphatab.model.MasterBar = function() {
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
alphatab.model.MasterBar.__name__ = true;
alphatab.model.MasterBar.prototype = {
	calculateDuration: function() {
		return this.timeSignatureNumerator * alphatab.audio.MidiUtils.valueToTicks(this.timeSignatureDenominator);
	}
	,isSectionStart: function() {
		return this.section != null;
	}
	,isRepeatEnd: function() {
		return this.repeatCount > 0;
	}
	,__class__: alphatab.model.MasterBar
}
alphatab.model.ModelUtils = function() { }
alphatab.model.ModelUtils.__name__ = true;
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
	}
}
alphatab.model.Note = function() {
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
	this.swapAccidentals = false;
	this.trillFret = -1;
	this.trillSpeed = 0;
	this.durationPercent = 1;
};
alphatab.model.Note.__name__ = true;
alphatab.model.Note.prototype = {
	realValue: function() {
		return this.fret + this.beat.voice.bar.track.tuning[this.beat.voice.bar.track.tuning.length - (this.string - 1) - 1];
	}
	,isTrill: function() {
		return this.trillFret >= 0;
	}
	,hasBend: function() {
		return this.bendPoints.length > 1;
	}
	,__class__: alphatab.model.Note
}
alphatab.model.PickStrokeType = { __ename__ : true, __constructs__ : ["None","Up","Down"] }
alphatab.model.PickStrokeType.None = ["None",0];
alphatab.model.PickStrokeType.None.toString = $estr;
alphatab.model.PickStrokeType.None.__enum__ = alphatab.model.PickStrokeType;
alphatab.model.PickStrokeType.Up = ["Up",1];
alphatab.model.PickStrokeType.Up.toString = $estr;
alphatab.model.PickStrokeType.Up.__enum__ = alphatab.model.PickStrokeType;
alphatab.model.PickStrokeType.Down = ["Down",2];
alphatab.model.PickStrokeType.Down.toString = $estr;
alphatab.model.PickStrokeType.Down.__enum__ = alphatab.model.PickStrokeType;
alphatab.model.PlaybackInformation = function() {
};
alphatab.model.PlaybackInformation.__name__ = true;
alphatab.model.PlaybackInformation.prototype = {
	__class__: alphatab.model.PlaybackInformation
}
alphatab.model.Score = function() {
	this.masterBars = new Array();
	this.tracks = new Array();
};
alphatab.model.Score.__name__ = true;
alphatab.model.Score.prototype = {
	addTrack: function(track) {
		track.score = this;
		track.index = this.tracks.length;
		this.tracks.push(track);
	}
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
	,__class__: alphatab.model.Score
}
alphatab.model.Section = function() {
};
alphatab.model.Section.__name__ = true;
alphatab.model.Section.prototype = {
	__class__: alphatab.model.Section
}
alphatab.model.SlideType = { __ename__ : true, __constructs__ : ["None","Shift","Legato","IntoFromBelow","IntoFromAbove","OutUp","OutDown"] }
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
alphatab.model.TextBaseline = { __ename__ : true, __constructs__ : ["Default","Top","Middle","Bottom"] }
alphatab.model.TextBaseline.Default = ["Default",0];
alphatab.model.TextBaseline.Default.toString = $estr;
alphatab.model.TextBaseline.Default.__enum__ = alphatab.model.TextBaseline;
alphatab.model.TextBaseline.Top = ["Top",1];
alphatab.model.TextBaseline.Top.toString = $estr;
alphatab.model.TextBaseline.Top.__enum__ = alphatab.model.TextBaseline;
alphatab.model.TextBaseline.Middle = ["Middle",2];
alphatab.model.TextBaseline.Middle.toString = $estr;
alphatab.model.TextBaseline.Middle.__enum__ = alphatab.model.TextBaseline;
alphatab.model.TextBaseline.Bottom = ["Bottom",3];
alphatab.model.TextBaseline.Bottom.toString = $estr;
alphatab.model.TextBaseline.Bottom.__enum__ = alphatab.model.TextBaseline;
alphatab.model.Track = function() {
	this.tuning = new Array();
	this.bars = new Array();
	this.playbackInfo = new alphatab.model.PlaybackInformation();
};
alphatab.model.Track.__name__ = true;
alphatab.model.Track.prototype = {
	addBar: function(bar) {
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
alphatab.model.TripletFeel = { __ename__ : true, __constructs__ : ["NoTripletFeel","Triplet16th","Triplet8th","Dotted16th","Dotted8th","Scottish16th","Scottish8th"] }
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
		if(note == "c") base = 0; else if(note == "db") base = 1; else if(note == "d") base = 2; else if(note == "eb") base = 3; else if(note == "e") base = 4; else if(note == "f") base = 5; else if(note == "gb") base = 6; else if(note == "g") base = 7; else if(note == "ab") base = 8; else if(note == "a") base = 9; else if(note == "bb") base = 10; else if(note == "b") base = 11; else return -1;
		base += (octave + 1) * 12;
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
	__class__: alphatab.model.Tuning
}
alphatab.model.VibratoType = { __ename__ : true, __constructs__ : ["None","Slight","Wide"] }
alphatab.model.VibratoType.None = ["None",0];
alphatab.model.VibratoType.None.toString = $estr;
alphatab.model.VibratoType.None.__enum__ = alphatab.model.VibratoType;
alphatab.model.VibratoType.Slight = ["Slight",1];
alphatab.model.VibratoType.Slight.toString = $estr;
alphatab.model.VibratoType.Slight.__enum__ = alphatab.model.VibratoType;
alphatab.model.VibratoType.Wide = ["Wide",2];
alphatab.model.VibratoType.Wide.toString = $estr;
alphatab.model.VibratoType.Wide.__enum__ = alphatab.model.VibratoType;
alphatab.model.Voice = function() {
	this.beats = new Array();
};
alphatab.model.Voice.__name__ = true;
alphatab.model.Voice.prototype = {
	isEmpty: function() {
		return this.beats.length == 0;
	}
	,addGraceBeat: function(beat) {
		if(this.beats.length == 0) {
			this.addBeat(beat);
			return;
		}
		var lastBeat = this.beats.splice(this.beats.length - 1,1)[0];
		this.addBeat(beat);
		this.addBeat(lastBeat);
	}
	,addBeat: function(beat) {
		beat.voice = this;
		beat.index = this.beats.length;
		if(this.beats.length > 0) {
			beat.previousBeat = this.beats[this.beats.length - 1];
			beat.previousBeat.nextBeat = beat;
			beat.start = beat.previousBeat.start + beat.previousBeat.calculateDuration();
		} else if(this.bar.previousBar != null && this.bar.previousBar.voices[this.index].beats.length > 0) {
			beat.previousBeat = this.bar.previousBar.voices[this.index].beats[this.bar.previousBar.voices[this.index].beats.length - 1];
			beat.previousBeat.nextBeat = beat;
			beat.start = beat.previousBeat.start + beat.previousBeat.calculateDuration();
		}
		this.beats.push(beat);
	}
	,__class__: alphatab.model.Voice
}
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
alphatab.rendering.BarRendererBase = function(bar) {
	this._bar = bar;
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.index = 0;
	this.topOverflow = 0;
	this.bottomOverflow = 0;
	this.isEmpty = true;
};
alphatab.rendering.BarRendererBase.__name__ = true;
alphatab.rendering.BarRendererBase.prototype = {
	paint: function(cx,cy,canvas) {
	}
	,doLayout: function() {
	}
	,getBottomPadding: function() {
		return 0;
	}
	,getTopPadding: function() {
		return 0;
	}
	,finalizeRenderer: function(layout) {
	}
	,applySizes: function(sizes) {
	}
	,registerMaxSizes: function(sizes) {
	}
	,isLast: function() {
		return this._bar.index == this._bar.track.bars.length - 1;
	}
	,isLastOfLine: function() {
		return this.index == this.stave.barRenderers.length - 1;
	}
	,isFirstOfLine: function() {
		return this.index == 0;
	}
	,getResources: function() {
		return this.stave.staveGroup.layout.renderer.renderingResources;
	}
	,getLayout: function() {
		return this.stave.staveGroup.layout;
	}
	,getScale: function() {
		return this.stave.staveGroup.layout.renderer.scale;
	}
	,applyBarSpacing: function(spacing) {
	}
	,registerOverflowBottom: function(bottomOverflow) {
		if(bottomOverflow > this.bottomOverflow) this.bottomOverflow = bottomOverflow;
	}
	,registerOverflowTop: function(topOverflow) {
		if(topOverflow > this.topOverflow) this.topOverflow = topOverflow;
	}
	,__class__: alphatab.rendering.BarRendererBase
}
alphatab.rendering.EffectBarGlyphSizing = { __ename__ : true, __constructs__ : ["SinglePreBeatOnly","SinglePreBeatToOnBeat","SinglePreBeatToPostBeat","SingleOnBeatOnly","SingleOnBeatToPostBeat","SinglePostBeatOnly","GroupedPreBeatOnly","GroupedPreBeatToOnBeat","GroupedPreBeatToPostBeat","GroupedOnBeatOnly","GroupedOnBeatToPostBeat","GroupedPostBeatOnly"] }
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly = ["SinglePreBeatOnly",0];
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatToOnBeat = ["SinglePreBeatToOnBeat",1];
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatToOnBeat.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatToOnBeat.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatToPostBeat = ["SinglePreBeatToPostBeat",2];
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatToPostBeat.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatToPostBeat.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly = ["SingleOnBeatOnly",3];
alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat = ["SingleOnBeatToPostBeat",4];
alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.SinglePostBeatOnly = ["SinglePostBeatOnly",5];
alphatab.rendering.EffectBarGlyphSizing.SinglePostBeatOnly.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.SinglePostBeatOnly.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatOnly = ["GroupedPreBeatOnly",6];
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatOnly.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatOnly.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatToOnBeat = ["GroupedPreBeatToOnBeat",7];
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatToOnBeat.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatToOnBeat.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatToPostBeat = ["GroupedPreBeatToPostBeat",8];
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatToPostBeat.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.GroupedPreBeatToPostBeat.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatOnly = ["GroupedOnBeatOnly",9];
alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatOnly.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatOnly.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat = ["GroupedOnBeatToPostBeat",10];
alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.GroupedOnBeatToPostBeat.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.EffectBarGlyphSizing.GroupedPostBeatOnly = ["GroupedPostBeatOnly",11];
alphatab.rendering.EffectBarGlyphSizing.GroupedPostBeatOnly.toString = $estr;
alphatab.rendering.EffectBarGlyphSizing.GroupedPostBeatOnly.__enum__ = alphatab.rendering.EffectBarGlyphSizing;
alphatab.rendering.GroupedBarRenderer = function(bar) {
	alphatab.rendering.BarRendererBase.call(this,bar);
	this._preBeatGlyphs = new Array();
	this._beatGlyphs = new Array();
	this._beatScaleGlyphs = new Array();
	this._postBeatGlyphs = new Array();
};
alphatab.rendering.GroupedBarRenderer.__name__ = true;
alphatab.rendering.GroupedBarRenderer.__super__ = alphatab.rendering.BarRendererBase;
alphatab.rendering.GroupedBarRenderer.prototype = $extend(alphatab.rendering.BarRendererBase.prototype,{
	paintBackground: function(cx,cy,canvas) {
	}
	,paint: function(cx,cy,canvas) {
		this.paintBackground(cx,cy,canvas);
		var glyphStartX = this.getPreBeatGlyphStart();
		var _g = 0, _g1 = this._preBeatGlyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.paint(cx + this.x + glyphStartX,cy + this.y,canvas);
		}
		glyphStartX = this.getBeatGlyphsStart();
		var _g = 0, _g1 = this._beatGlyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.paint(cx + this.x + glyphStartX,cy + this.y,canvas);
		}
		glyphStartX = this.getPostBeatGlyphsStart();
		var _g = 0, _g1 = this._postBeatGlyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.paint(cx + this.x + glyphStartX,cy + this.y,canvas);
		}
	}
	,finalizeRenderer: function(layout) {
		var _g1 = 0, _g = this._beatGlyphs.length;
		while(_g1 < _g) {
			var i = _g1++;
			var g = this._beatGlyphs[i];
			if(js.Boot.__instanceof(g,alphatab.rendering.glyphs.ISupportsFinalize)) (js.Boot.__cast(g , alphatab.rendering.glyphs.ISupportsFinalize)).finalizeGlyph(layout);
		}
	}
	,applyBarSpacing: function(spacing) {
		this.width += spacing;
		var glyphSpacing = spacing / this._beatScaleGlyphs.length | 0;
		var _g1 = 0, _g = this._beatGlyphs.length;
		while(_g1 < _g) {
			var i = _g1++;
			var g = this._beatGlyphs[i];
			if(i == 0) g.x = 0; else g.x = this._beatGlyphs[i - 1].x + this._beatGlyphs[i - 1].width;
			if(g.canScale()) {
				if(g == this._beatGlyphs[this._beatGlyphs.length - 1]) g.applyGlyphSpacing(glyphSpacing + (spacing - glyphSpacing * this._beatGlyphs.length)); else g.applyGlyphSpacing(glyphSpacing);
			}
		}
	}
	,getPostBeatGlyphsStart: function() {
		var start = this.getBeatGlyphsStart();
		if(this._beatGlyphs.length > 0) start += this._beatGlyphs[this._beatGlyphs.length - 1].x + this._beatGlyphs[this._beatGlyphs.length - 1].width;
		return start;
	}
	,getBeatGlyphsStart: function() {
		var start = this.getPreBeatGlyphStart();
		if(this._preBeatGlyphs.length > 0) start += this._preBeatGlyphs[this._preBeatGlyphs.length - 1].x + this._preBeatGlyphs[this._preBeatGlyphs.length - 1].width;
		return start;
	}
	,getPreBeatGlyphStart: function() {
		return 0;
	}
	,createPostBeatGlyphs: function() {
	}
	,createBeatGlyphs: function() {
	}
	,createPreBeatGlyphs: function() {
	}
	,addPostBeatGlyph: function(g) {
		this.addGlyph(this._postBeatGlyphs,g);
	}
	,addBeatGlyph: function(g) {
		this.addGlyph(this._beatGlyphs,g);
		if(g.canScale()) this._beatScaleGlyphs.push(g);
	}
	,addPreBeatGlyph: function(g) {
		this.addGlyph(this._preBeatGlyphs,g);
	}
	,addGlyph: function(c,g) {
		this.isEmpty = false;
		g.x = c.length == 0?0:c[c.length - 1].x + c[c.length - 1].width;
		g.index = c.length;
		g.renderer = this;
		g.doLayout();
		c.push(g);
	}
	,applySizes: function(sizes) {
		var preSize = sizes.getSize("PRE");
		var preSizeDiff = preSize - this.getBeatGlyphsStart();
		if(preSizeDiff > 0) this.addPreBeatGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,preSizeDiff));
		var _g1 = 0, _g = this._beatGlyphs.length;
		while(_g1 < _g) {
			var i = _g1++;
			this._beatGlyphs[i].x = i == 0?0:this._beatGlyphs[i - 1].x + this._beatGlyphs[i - 1].width;
			var beatSize = sizes.getIndexedSize("BEAT",i);
			var beatDiff = beatSize - this._beatGlyphs[i].width;
			if(beatDiff > 0) this._beatGlyphs[i].applyGlyphSpacing(beatDiff);
		}
		var postSize = sizes.getSize("POST");
		var postSizeDiff;
		if(this._postBeatGlyphs.length == 0) postSizeDiff = 0; else postSizeDiff = postSize - (this._postBeatGlyphs[this._postBeatGlyphs.length - 1].x + this._postBeatGlyphs[this._postBeatGlyphs.length - 1].width);
		if(postSizeDiff > 0) {
			this._postBeatGlyphs.splice(0,0,new alphatab.rendering.glyphs.SpacingGlyph(0,0,postSizeDiff));
			var _g1 = 0, _g = this._postBeatGlyphs.length;
			while(_g1 < _g) {
				var i = _g1++;
				var g = this._postBeatGlyphs[i];
				g.x = i == 0?0:this._postBeatGlyphs[this._postBeatGlyphs.length - 1].x + this._postBeatGlyphs[this._postBeatGlyphs.length - 1].width;
				g.index = i;
				g.renderer = this;
			}
		}
		this.updateWidth();
	}
	,registerMaxSizes: function(sizes) {
		var preSize = this.getBeatGlyphsStart();
		if(sizes.getSize("PRE") < preSize) sizes.setSize("PRE",preSize);
		var _g = 0, _g1 = this._beatGlyphs;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			if(sizes.getIndexedSize("BEAT",b.index) < b.width) sizes.setIndexedSize("BEAT",b.index,b.width);
		}
		var postSize;
		if(this._postBeatGlyphs.length == 0) postSize = 0; else postSize = this._postBeatGlyphs[this._postBeatGlyphs.length - 1].x + this._postBeatGlyphs[this._postBeatGlyphs.length - 1].width;
		if(sizes.getSize("POST") < postSize) sizes.setSize("POST",postSize);
		if(sizes.fullWidth < this.width) sizes.fullWidth = this.width;
	}
	,updateWidth: function() {
		this.width = this.getPostBeatGlyphsStart();
		if(this._postBeatGlyphs.length > 0) this.width += this._postBeatGlyphs[this._postBeatGlyphs.length - 1].x + this._postBeatGlyphs[this._postBeatGlyphs.length - 1].width;
	}
	,doLayout: function() {
		this.createPreBeatGlyphs();
		this.createBeatGlyphs();
		this.createPostBeatGlyphs();
		this.updateWidth();
	}
	,__class__: alphatab.rendering.GroupedBarRenderer
});
alphatab.rendering.EffectBarRenderer = function(bar,info) {
	alphatab.rendering.GroupedBarRenderer.call(this,bar);
	this._info = info;
	this._preBeatPosition = new haxe.ds.IntMap();
	this._onBeatPosition = new haxe.ds.IntMap();
	this._postBeatPosition = new haxe.ds.IntMap();
	this._effectGlyphs = new haxe.ds.IntMap();
};
alphatab.rendering.EffectBarRenderer.__name__ = true;
alphatab.rendering.EffectBarRenderer.__super__ = alphatab.rendering.GroupedBarRenderer;
alphatab.rendering.EffectBarRenderer.prototype = $extend(alphatab.rendering.GroupedBarRenderer.prototype,{
	paint: function(cx,cy,canvas) {
		alphatab.rendering.GroupedBarRenderer.prototype.paint.call(this,cx,cy,canvas);
		var glyphStart = this.getBeatGlyphsStart();
		var $it0 = this._effectGlyphs.iterator();
		while( $it0.hasNext() ) {
			var l = $it0.next();
			if(l.renderer == this) l.paint(cx + this.x + glyphStart,cy + this.y,canvas);
		}
	}
	,paintBackground: function(cx,cy,canvas) {
	}
	,getBottomPadding: function() {
		return 0;
	}
	,getTopPadding: function() {
		return 0;
	}
	,createPostBeatGlyphs: function() {
	}
	,createOrResizeGlyph: function(sizing,b) {
		switch( (sizing)[1] ) {
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
			var g = this._info.createNewGlyph(this,b);
			g.renderer = this;
			g.doLayout();
			this._effectGlyphs.set(b.index,g);
			break;
		case 6:
		case 7:
		case 8:
		case 9:
		case 10:
		case 11:
			if(b.index > 0 || this.index > 0) {
				var prevBeat = b.previousBeat;
				if(this._info.shouldCreateGlyph(this,prevBeat)) {
					var prevEffect;
					if(b.index > 0) {
						prevEffect = this._effectGlyphs.get(prevBeat.index);
						this._effectGlyphs.set(b.index,prevEffect);
					} else prevEffect = (js.Boot.__cast(this.stave.barRenderers[this.index - 1] , alphatab.rendering.EffectBarRenderer))._effectGlyphs.get(prevBeat.index);
					this._effectGlyphs.set(b.index,prevEffect);
				} else this.createOrResizeGlyph(alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly,b);
			} else this.createOrResizeGlyph(alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly,b);
			break;
		}
	}
	,createVoiceGlyphs: function(v) {
		var _g = 0, _g1 = v.beats;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			var pre = new alphatab.rendering.glyphs.BeatGlyphBase(b);
			this._preBeatPosition.set(b.index,pre);
			this.addBeatGlyph(pre);
			var g = new alphatab.rendering.glyphs.BeatGlyphBase(b);
			this._onBeatPosition.set(b.index,g);
			this.addBeatGlyph(g);
			var post = new alphatab.rendering.glyphs.BeatGlyphBase(b);
			this._postBeatPosition.set(b.index,post);
			this.addBeatGlyph(post);
			if(this._info.shouldCreateGlyph(this,b)) this.createOrResizeGlyph(this._info.getSizingMode(),b);
			this._lastBeat = b;
		}
	}
	,createBeatGlyphs: function() {
		this.createVoiceGlyphs(this._bar.voices[0]);
	}
	,createPreBeatGlyphs: function() {
	}
	,alignGlyph: function(sizing,i,prevGlyph) {
		var g = this._effectGlyphs.get(i);
		var pos;
		switch( (sizing)[1] ) {
		case 0:
			pos = this._preBeatPosition.get(i);
			g.x = pos.x;
			g.width = pos.width;
			break;
		case 1:
			pos = this._preBeatPosition.get(i);
			g.x = pos.x;
			pos = this._onBeatPosition.get(i);
			g.width = pos.x + pos.width - g.x;
			break;
		case 2:
			pos = this._preBeatPosition.get(i);
			g.x = pos.x;
			pos = this._postBeatPosition.get(i);
			g.width = pos.x + pos.width - g.x;
			break;
		case 3:
			pos = this._onBeatPosition.get(i);
			g.x = pos.x;
			g.width = pos.width;
			break;
		case 4:
			pos = this._onBeatPosition.get(i);
			g.x = pos.x;
			pos = this._postBeatPosition.get(i);
			g.width = pos.x + pos.width - g.x;
			break;
		case 5:
			pos = this._postBeatPosition.get(i);
			g.x = pos.x;
			g.width = pos.width;
			break;
		case 6:
			if(g != prevGlyph) this.alignGlyph(alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatOnly,i,prevGlyph); else {
				pos = this._preBeatPosition.get(i);
				var posR = js.Boot.__cast(pos.renderer , alphatab.rendering.EffectBarRenderer);
				var gR = js.Boot.__cast(g.renderer , alphatab.rendering.EffectBarRenderer);
				g.width = posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width - (gR.x + gR.getBeatGlyphsStart() + g.x);
			}
			break;
		case 7:
			if(g != prevGlyph) this.alignGlyph(alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatToOnBeat,i,prevGlyph); else {
				pos = this._onBeatPosition.get(i);
				var posR = js.Boot.__cast(pos.renderer , alphatab.rendering.EffectBarRenderer);
				var gR = js.Boot.__cast(g.renderer , alphatab.rendering.EffectBarRenderer);
				g.width = posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width - (gR.x + gR.getBeatGlyphsStart() + g.x);
			}
			break;
		case 8:
			if(g != prevGlyph) this.alignGlyph(alphatab.rendering.EffectBarGlyphSizing.SinglePreBeatToPostBeat,i,prevGlyph); else {
				pos = this._postBeatPosition.get(i);
				var posR = js.Boot.__cast(pos.renderer , alphatab.rendering.EffectBarRenderer);
				var gR = js.Boot.__cast(g.renderer , alphatab.rendering.EffectBarRenderer);
				g.width = posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width - (gR.x + gR.getBeatGlyphsStart() + g.x);
			}
			break;
		case 9:
			if(g != prevGlyph) this.alignGlyph(alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatOnly,i,prevGlyph); else {
				pos = this._onBeatPosition.get(i);
				var posR = js.Boot.__cast(pos.renderer , alphatab.rendering.EffectBarRenderer);
				var gR = js.Boot.__cast(g.renderer , alphatab.rendering.EffectBarRenderer);
				g.width = posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width - (gR.x + gR.getBeatGlyphsStart() + g.x);
			}
			break;
		case 10:
			if(g != prevGlyph) this.alignGlyph(alphatab.rendering.EffectBarGlyphSizing.SingleOnBeatToPostBeat,i,prevGlyph); else {
				pos = this._postBeatPosition.get(i);
				var posR = js.Boot.__cast(pos.renderer , alphatab.rendering.EffectBarRenderer);
				var gR = js.Boot.__cast(g.renderer , alphatab.rendering.EffectBarRenderer);
				g.width = posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width - (gR.x + gR.getBeatGlyphsStart() + g.x);
			}
			break;
		case 11:
			if(g != prevGlyph) this.alignGlyph(alphatab.rendering.EffectBarGlyphSizing.GroupedPostBeatOnly,i,prevGlyph); else {
				pos = this._postBeatPosition.get(i);
				var posR = js.Boot.__cast(pos.renderer , alphatab.rendering.EffectBarRenderer);
				var gR = js.Boot.__cast(g.renderer , alphatab.rendering.EffectBarRenderer);
				g.width = posR.x + posR.getBeatGlyphsStart() + pos.x + pos.width - (gR.x + gR.getBeatGlyphsStart() + g.x);
			}
			break;
		}
	}
	,finalizeRenderer: function(layout) {
		alphatab.rendering.GroupedBarRenderer.prototype.finalizeRenderer.call(this,layout);
		this.isEmpty = true;
		var prevGlyph = null;
		if(this.index > 0) {
			var prevRenderer = js.Boot.__cast(this.stave.barRenderers[this.index - 1] , alphatab.rendering.EffectBarRenderer);
			if(prevRenderer._lastBeat != null) prevGlyph = prevRenderer._effectGlyphs.get(prevRenderer._lastBeat.index);
		}
		var $it0 = this._effectGlyphs.keys();
		while( $it0.hasNext() ) {
			var i = $it0.next();
			var effect = this._effectGlyphs.get(i);
			this.alignGlyph(this._info.getSizingMode(),i,prevGlyph);
			prevGlyph = effect;
			this.isEmpty = false;
		}
	}
	,doLayout: function() {
		alphatab.rendering.GroupedBarRenderer.prototype.doLayout.call(this);
		if(this.index == 0) {
			this.stave.topSpacing = 5;
			this.stave.bottomSpacing = 5;
		}
		this.height = this._info.getHeight(this);
	}
	,__class__: alphatab.rendering.EffectBarRenderer
});
alphatab.rendering.Glyph = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
};
alphatab.rendering.Glyph.__name__ = true;
alphatab.rendering.Glyph.prototype = {
	paint: function(cx,cy,canvas) {
	}
	,doLayout: function() {
	}
	,canScale: function() {
		return true;
	}
	,getScale: function() {
		return this.renderer.stave.staveGroup.layout.renderer.scale;
	}
	,applyGlyphSpacing: function(spacing) {
		if(this.canScale()) this.width += spacing;
	}
	,__class__: alphatab.rendering.Glyph
}
alphatab.rendering.RenderingResources = function(scale) {
	this.init(scale);
};
alphatab.rendering.RenderingResources.__name__ = true;
alphatab.rendering.RenderingResources.prototype = {
	init: function(scale) {
		var sansFont = "Arial";
		var serifFont = "Times New Roman";
		this.effectFont = new alphatab.platform.model.Font(serifFont,12 * scale,2);
		this.copyrightFont = new alphatab.platform.model.Font(sansFont,12 * scale,1);
		this.titleFont = new alphatab.platform.model.Font(serifFont,32 * scale);
		this.subTitleFont = new alphatab.platform.model.Font(serifFont,20 * scale);
		this.wordsFont = new alphatab.platform.model.Font(serifFont,15 * scale);
		this.tablatureFont = new alphatab.platform.model.Font(sansFont,13 * scale);
		this.graceFont = new alphatab.platform.model.Font(sansFont,11 * scale);
		this.staveLineColor = new alphatab.platform.model.Color(165,165,165);
		this.barSeperatorColor = new alphatab.platform.model.Color(34,34,17);
		this.barNumberFont = new alphatab.platform.model.Font(sansFont,11 * scale);
		this.barNumberColor = new alphatab.platform.model.Color(200,0,0);
		this.markerFont = new alphatab.platform.model.Font(serifFont,14 * scale,1);
		this.mainGlyphColor = new alphatab.platform.model.Color(0,0,0);
	}
	,__class__: alphatab.rendering.RenderingResources
}
alphatab.rendering.ScoreBarRenderer = function(bar) {
	alphatab.rendering.GroupedBarRenderer.call(this,bar);
	this.accidentalHelper = new alphatab.rendering.utils.AccidentalHelper();
	this._beamHelpers = new Array();
	this._beatPosition = new haxe.ds.IntMap();
};
alphatab.rendering.ScoreBarRenderer.__name__ = true;
alphatab.rendering.ScoreBarRenderer.paintSingleBar = function(canvas,x1,y1,x2,y2,size) {
	canvas.beginPath();
	canvas.moveTo(x1,y1);
	canvas.lineTo(x2,y2);
	canvas.lineTo(x2,y2 - size);
	canvas.lineTo(x1,y1 - size);
	canvas.closePath();
	canvas.fill();
}
alphatab.rendering.ScoreBarRenderer.__super__ = alphatab.rendering.GroupedBarRenderer;
alphatab.rendering.ScoreBarRenderer.prototype = $extend(alphatab.rendering.GroupedBarRenderer.prototype,{
	paintBackground: function(cx,cy,canvas) {
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
	,getGlyphOverflow: function() {
		var res = this.stave.staveGroup.layout.renderer.renderingResources;
		return res.tablatureFont.getSize() / 2 + res.tablatureFont.getSize() * 0.2 | 0;
	}
	,getScoreY: function(steps,correction) {
		if(correction == null) correction = 0;
		return 9 * this.stave.staveGroup.layout.renderer.scale / 2 * steps + correction * this.stave.staveGroup.layout.renderer.scale | 0;
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
	,applyBarSpacing: function(spacing) {
		alphatab.rendering.GroupedBarRenderer.prototype.applyBarSpacing.call(this,spacing);
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
			var pre = new alphatab.rendering.glyphs.ScoreBeatPreNotesGlyph(b);
			this.addBeatGlyph(pre);
			var g = new alphatab.rendering.glyphs.ScoreBeatGlyph(b);
			this._beatPosition.set(b.index,g);
			g.beamingHelper = this._currentBeamHelper;
			this.addBeatGlyph(g);
			var post = new alphatab.rendering.glyphs.ScoreBeatPostNotesGlyph(b);
			this.addBeatGlyph(post);
		}
		this._currentBeamHelper = null;
	}
	,createTimeSignatureGlyphs: function() {
		this.addPreBeatGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,5 * this.stave.staveGroup.layout.renderer.scale | 0));
		this.addPreBeatGlyph(new alphatab.rendering.glyphs.TimeSignatureGlyph(0,0,this._bar.getMasterBar().timeSignatureNumerator,this._bar.getMasterBar().timeSignatureDenominator));
	}
	,createKeySignatureGlyphs: function() {
		var offsetClef = 0;
		var currentKey = this._bar.getMasterBar().keySignature;
		var previousKey = this._bar.previousBar == null?0:this._bar.previousBar.getMasterBar().keySignature;
		var _g = this;
		switch( (_g._bar.clef)[1] ) {
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
		var _g1 = 0;
		while(_g1 < naturalizeSymbols) {
			var i = _g1++;
			this.addPreBeatGlyph(new alphatab.rendering.glyphs.NaturalizeGlyph(0,this.getScoreY(previousKeyPositions[i] + offsetClef) | 0));
		}
		var offsetSymbols = currentKey <= 7?currentKey:currentKey - 7;
		if(currentKey > 0) {
			var _g2 = 0, _g1 = Math.abs(currentKey) | 0;
			while(_g2 < _g1) {
				var i = _g2++;
				this.addPreBeatGlyph(new alphatab.rendering.glyphs.SharpGlyph(0,this.getScoreY(alphatab.rendering.ScoreBarRenderer.SHARP_KS_STEPS[i] + offsetClef) | 0));
			}
		} else {
			var _g2 = 0, _g1 = Math.abs(currentKey) | 0;
			while(_g2 < _g1) {
				var i = _g2++;
				this.addPreBeatGlyph(new alphatab.rendering.glyphs.FlatGlyph(0,this.getScoreY(alphatab.rendering.ScoreBarRenderer.FLAT_KS_STEPS[i] + offsetClef) | 0));
			}
		}
	}
	,createStartSpacing: function() {
		if(this._startSpacing) return;
		this.addPreBeatGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,2 * this.stave.staveGroup.layout.renderer.scale | 0));
		this._startSpacing = true;
	}
	,createPostBeatGlyphs: function() {
		if(this._bar.getMasterBar().repeatCount > 0) {
			this.addPostBeatGlyph(new alphatab.rendering.glyphs.RepeatCloseGlyph(this.x,0));
			if(this._bar.getMasterBar().repeatCount > 1) {
				var line = this._bar.index == this._bar.track.bars.length - 1 || this.index == this.stave.barRenderers.length - 1?-1:-4;
				this.addPostBeatGlyph(new alphatab.rendering.glyphs.RepeatCountGlyph(0,this.getScoreY(line,-3),this._bar.getMasterBar().repeatCount + 1));
			}
		} else if(this._bar.getMasterBar().isDoubleBar) {
			this.addPostBeatGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph());
			this.addPostBeatGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,3 * this.stave.staveGroup.layout.renderer.scale | 0,false));
			this.addPostBeatGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph());
		} else if(this._bar.nextBar == null || !this._bar.nextBar.getMasterBar().isRepeatStart) this.addPostBeatGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph(0,0,this._bar.index == this._bar.track.bars.length - 1));
	}
	,createBeatGlyphs: function() {
		this.createVoiceGlyphs(this._bar.voices[0]);
	}
	,createPreBeatGlyphs: function() {
		if(this._bar.getMasterBar().isRepeatStart) this.addPreBeatGlyph(new alphatab.rendering.glyphs.RepeatOpenGlyph(0,0,1.5,3));
		if(this.index == 0 || this._bar.clef != this._bar.previousBar.clef) {
			var offset = 0;
			var _g = this;
			switch( (_g._bar.clef)[1] ) {
			case 2:
				offset = 4;
				break;
			case 0:
				offset = 6;
				break;
			case 1:
				offset = 4;
				break;
			case 3:
				offset = 6;
				break;
			}
			this.createStartSpacing();
			this.addPreBeatGlyph(new alphatab.rendering.glyphs.ClefGlyph(0,this.getScoreY(offset),this._bar.clef));
		}
		if(this._bar.previousBar == null && this._bar.getMasterBar().keySignature != 0 || this._bar.previousBar != null && this._bar.getMasterBar().keySignature != this._bar.previousBar.getMasterBar().keySignature) {
			this.createStartSpacing();
			this.createKeySignatureGlyphs();
		}
		if(this._bar.previousBar == null || this._bar.previousBar != null && this._bar.getMasterBar().timeSignatureNumerator != this._bar.previousBar.getMasterBar().timeSignatureNumerator || this._bar.previousBar != null && this._bar.getMasterBar().timeSignatureDenominator != this._bar.previousBar.getMasterBar().timeSignatureDenominator) {
			this.createStartSpacing();
			this.createTimeSignatureGlyphs();
		}
		this.addPreBeatGlyph(new alphatab.rendering.glyphs.BarNumberGlyph(0,this.getScoreY(-1,-3),this._bar.index + 1,!this.stave.isFirstInAccolade));
		if(this._bar.isEmpty()) this.addPreBeatGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,30 * this.stave.staveGroup.layout.renderer.scale | 0,false));
	}
	,paintFooter: function(cx,cy,canvas,h) {
		var beat = h.beats[0];
		if(beat.duration == alphatab.model.Duration.Whole) return;
		var isGrace = beat.graceType != alphatab.model.GraceType.None;
		var scaleMod = isGrace?0.7:1;
		var stemSize = this.getStemSize(h.maxDuration);
		var correction = 9 * scaleMod / 2 | 0;
		var beatLineX = h.getBeatLineX(beat) + this.stave.staveGroup.layout.renderer.scale | 0;
		var direction = h.getDirection();
		var topY = this.getScoreY(this.getNoteLine(beat.maxNote),correction);
		var bottomY = this.getScoreY(this.getNoteLine(beat.minNote),correction);
		var beamY;
		if(direction == alphatab.rendering.utils.BeamDirection.Down) {
			bottomY += stemSize * scaleMod | 0;
			beamY = bottomY;
		} else {
			topY -= stemSize * scaleMod | 0;
			beamY = topY;
		}
		canvas.setColor(this.stave.staveGroup.layout.renderer.renderingResources.mainGlyphColor);
		canvas.beginPath();
		canvas.moveTo(cx + this.x + beatLineX | 0,cy + this.y + topY);
		canvas.lineTo(cx + this.x + beatLineX | 0,cy + this.y + bottomY);
		canvas.stroke();
		if(isGrace) {
			var graceSizeY = 15 * this.stave.staveGroup.layout.renderer.scale;
			var graceSizeX = 12 * this.stave.staveGroup.layout.renderer.scale;
			canvas.beginPath();
			if(direction == alphatab.rendering.utils.BeamDirection.Down) {
				canvas.moveTo(cx + this.x + beatLineX - graceSizeX / 2 | 0,cy + this.y + bottomY - graceSizeY);
				canvas.lineTo(cx + this.x + beatLineX + graceSizeX / 2 | 0,cy + this.y + bottomY);
			} else {
				canvas.moveTo(cx + this.x + beatLineX - graceSizeX / 2 | 0,cy + this.y + topY + graceSizeY);
				canvas.lineTo(cx + this.x + beatLineX + graceSizeX / 2 | 0,cy + this.y + topY);
			}
			canvas.stroke();
		}
		var gx = beatLineX | 0;
		var glyph = new alphatab.rendering.glyphs.BeamGlyph(gx,beamY,beat.duration,direction,isGrace);
		glyph.renderer = this;
		glyph.doLayout();
		glyph.paint(cx + this.x,cy + this.y,canvas);
	}
	,isFullBarJoin: function(a,b,barIndex) {
		return alphatab.model.ModelUtils.getDurationIndex(a.duration) - 2 - barIndex > 0 && alphatab.model.ModelUtils.getDurationIndex(b.duration) - 2 - barIndex > 0;
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
					} else if(i == 0 || !this.isFullBarJoin(h.beats[i - 1],beat,barIndex)) {
						barStartX = beatLineX;
						barEndX = barStartX + brokenBarOffset;
					} else continue;
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
	,calculateBeamY: function(h,x) {
		var _g = this;
		var correction = 4;
		var stemSize = this.getStemSize(h.maxDuration);
		return h.calculateBeamY(stemSize,this.stave.staveGroup.layout.renderer.scale | 0,x,this.stave.staveGroup.layout.renderer.scale,function(n) {
			return _g.getScoreY(_g.getNoteLine(n),correction - 1);
		});
	}
	,getStemSize: function(duration) {
		var size;
		switch( (duration)[1] ) {
		case 1:
			size = 6;
			break;
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
	,paintBeamHelper: function(cx,cy,canvas,h) {
		if(h.beats.length == 1) this.paintFooter(cx,cy,canvas,h); else this.paintBar(cx,cy,canvas,h);
	}
	,paintBeams: function(cx,cy,canvas) {
		var _g = 0, _g1 = this._beamHelpers;
		while(_g < _g1.length) {
			var h = _g1[_g];
			++_g;
			this.paintBeamHelper(cx + this.getBeatGlyphsStart(),cy,canvas,h);
		}
	}
	,paint: function(cx,cy,canvas) {
		alphatab.rendering.GroupedBarRenderer.prototype.paint.call(this,cx,cy,canvas);
		this.paintBeams(cx,cy,canvas);
	}
	,doLayout: function() {
		alphatab.rendering.GroupedBarRenderer.prototype.doLayout.call(this);
		this.height = (9 * this.stave.staveGroup.layout.renderer.scale * 4 | 0) + this.getTopPadding() + this.getBottomPadding();
		if(this.index == 0) {
			this.stave.registerStaveTop(this.getGlyphOverflow());
			this.stave.registerStaveBottom(this.height - this.getGlyphOverflow());
		}
		var top = this.getScoreY(0);
		var bottom = this.getScoreY(8);
		var _g = 0, _g1 = this._beamHelpers;
		while(_g < _g1.length) {
			var h = _g1[_g];
			++_g;
			var maxNoteY = this.getScoreY(this.getNoteLine(h.maxNote));
			if(h.getDirection() == alphatab.rendering.utils.BeamDirection.Up) maxNoteY -= this.getStemSize(h.maxDuration);
			if(maxNoteY < top) this.registerOverflowTop(Math.abs(maxNoteY) | 0);
			var minNoteY = this.getScoreY(this.getNoteLine(h.minNote));
			if(h.getDirection() == alphatab.rendering.utils.BeamDirection.Down) minNoteY += this.getStemSize(h.maxDuration);
			if(minNoteY > bottom) this.registerOverflowBottom((Math.abs(minNoteY) | 0) - bottom);
		}
	}
	,getLineOffset: function() {
		return 9 * this.stave.staveGroup.layout.renderer.scale;
	}
	,getBottomPadding: function() {
		return this.getGlyphOverflow();
	}
	,getTopPadding: function() {
		return this.getGlyphOverflow();
	}
	,getNoteY: function(note) {
		if(this._beatPosition.exists(note.beat.index)) {
			var beat = this._beatPosition.get(note.beat.index);
			return beat.noteHeads.getNoteY(note);
		}
		return 0;
	}
	,getNoteX: function(note,onEnd) {
		if(onEnd == null) onEnd = true;
		if(this._beatPosition.exists(note.beat.index)) {
			var beat = this._beatPosition.get(note.beat.index);
			return beat.x + beat.noteHeads.getNoteX(note,onEnd);
		}
		return 0;
	}
	,getBeatDirection: function(beat) {
		if(this._beatPosition.exists(beat.index)) {
			var g = this._beatPosition.get(beat.index);
			return g.noteHeads.getDirection();
		}
		return alphatab.rendering.utils.BeamDirection.Up;
	}
	,__class__: alphatab.rendering.ScoreBarRenderer
});
alphatab.rendering.ScoreRenderer = function(settings,param) {
	this.settings = settings;
	if(settings.engine == null || !alphatab.Environment.renderEngines.exists(settings.engine)) this.canvas = (alphatab.Environment.renderEngines.get("default"))(param); else this.canvas = (alphatab.Environment.renderEngines.get(settings.engine))(param);
	this.updateScale(1.0);
	this.layout = new alphatab.rendering.layout.PageViewLayout(this);
};
alphatab.rendering.ScoreRenderer.__name__ = true;
alphatab.rendering.ScoreRenderer.prototype = {
	paintBackground: function() {
		var msg = "Rendered using alphaTab (http://www.alphaTab.net)";
		this.canvas.setColor(new alphatab.platform.model.Color(62,62,62));
		this.canvas.setFont(this.renderingResources.copyrightFont);
		this.canvas.setTextAlign(alphatab.platform.model.TextAlign.Center);
		var x = this.canvas.getWidth() / 2;
		this.canvas.fillText(msg,x,this.canvas.getHeight() - this.renderingResources.copyrightFont.getSize() * 2);
	}
	,paintScore: function() {
		this.paintBackground();
		this.layout.paintScore();
	}
	,doLayout: function() {
		this.layout.doLayout();
		this.canvas.setHeight(this.layout.height + this.renderingResources.copyrightFont.getSize() * 2 | 0);
		this.canvas.setWidth(this.layout.width);
	}
	,get_score: function() {
		if(this.track == null) return null;
		return this.track.score;
	}
	,invalidate: function() {
		this.canvas.clear();
		this.doLayout();
		this.paintScore();
	}
	,render: function(track) {
		this.track = track;
		this.invalidate();
	}
	,updateScale: function(scale) {
		this.scale = scale;
		this.renderingResources = new alphatab.rendering.RenderingResources(scale);
		this.canvas.setLineWidth(scale);
	}
	,__class__: alphatab.rendering.ScoreRenderer
}
alphatab.rendering.TabBarRenderer = function(bar) {
	alphatab.rendering.GroupedBarRenderer.call(this,bar);
	this._beatPosition = new haxe.ds.IntMap();
};
alphatab.rendering.TabBarRenderer.__name__ = true;
alphatab.rendering.TabBarRenderer.__super__ = alphatab.rendering.GroupedBarRenderer;
alphatab.rendering.TabBarRenderer.prototype = $extend(alphatab.rendering.GroupedBarRenderer.prototype,{
	drawInfoGuide: function(canvas,cx,cy,y,c) {
		canvas.setColor(c);
		canvas.beginPath();
		canvas.moveTo(cx + this.x,cy + this.y + y);
		canvas.lineTo(cx + this.x + this.width,cy + this.y + y);
		canvas.stroke();
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
	}
	,getNumberOverflow: function() {
		var res = this.stave.staveGroup.layout.renderer.renderingResources;
		return res.tablatureFont.getSize() / 2 + res.tablatureFont.getSize() * 0.2 | 0;
	}
	,getTabY: function(line,correction) {
		if(correction == null) correction = 0;
		return 11 * this.stave.staveGroup.layout.renderer.scale * line + correction * this.stave.staveGroup.layout.renderer.scale | 0;
	}
	,getBottomPadding: function() {
		return this.getNumberOverflow();
	}
	,getTopPadding: function() {
		return this.getNumberOverflow();
	}
	,createPostBeatGlyphs: function() {
		if(this._bar.getMasterBar().repeatCount > 0) {
			this.addPostBeatGlyph(new alphatab.rendering.glyphs.RepeatCloseGlyph(this.x,0));
			if(this._bar.getMasterBar().repeatCount > 1) {
				var line = this._bar.index == this._bar.track.bars.length - 1 || this.index == this.stave.barRenderers.length - 1?-1:-4;
				this.addPostBeatGlyph(new alphatab.rendering.glyphs.RepeatCountGlyph(0,this.getTabY(line,-3),this._bar.getMasterBar().repeatCount + 1));
			}
		} else if(this._bar.getMasterBar().isDoubleBar) {
			this.addPostBeatGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph());
			this.addPostBeatGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,3 * this.stave.staveGroup.layout.renderer.scale | 0,false));
			this.addPostBeatGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph());
		} else if(this._bar.nextBar == null || !this._bar.nextBar.getMasterBar().isRepeatStart) this.addPostBeatGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph(0,0,this._bar.index == this._bar.track.bars.length - 1));
	}
	,createVoiceGlyphs: function(v) {
		var _g = 0, _g1 = v.beats;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			var pre = new alphatab.rendering.glyphs.TabBeatPreNotesGlyph(b);
			this.addBeatGlyph(pre);
			var g = new alphatab.rendering.glyphs.TabBeatGlyph(b);
			this._beatPosition.set(b.index,g);
			this.addBeatGlyph(g);
			var post = new alphatab.rendering.glyphs.TabBeatPostNotesGlyph(b);
			this.addBeatGlyph(post);
		}
	}
	,createBeatGlyphs: function() {
		this.createVoiceGlyphs(this._bar.voices[0]);
	}
	,createPreBeatGlyphs: function() {
		if(this._bar.getMasterBar().isRepeatStart) this.addPreBeatGlyph(new alphatab.rendering.glyphs.RepeatOpenGlyph(0,0,1.5,3));
		this.addPreBeatGlyph(new alphatab.rendering.glyphs.BarNumberGlyph(0,this.getTabY(-1,-3),this._bar.index + 1,!this.stave.isFirstInAccolade));
		if(this._bar.isEmpty()) this.addPreBeatGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,30 * this.stave.staveGroup.layout.renderer.scale | 0,false));
	}
	,doLayout: function() {
		alphatab.rendering.GroupedBarRenderer.prototype.doLayout.call(this);
		this.height = (11 * this.stave.staveGroup.layout.renderer.scale * (this._bar.track.tuning.length - 1) | 0) + this.getNumberOverflow() * 2;
		if(this.index == 0) {
			this.stave.registerStaveTop(this.getNumberOverflow());
			this.stave.registerStaveBottom(this.height - this.getNumberOverflow());
		}
	}
	,getNoteY: function(note) {
		if(this._beatPosition.exists(note.beat.index)) {
			var beat = this._beatPosition.get(note.beat.index);
			return beat.noteNumbers.getNoteY(note);
		}
		return 0;
	}
	,getNoteX: function(note,onEnd) {
		if(onEnd == null) onEnd = true;
		if(this._beatPosition.exists(note.beat.index)) {
			var beat = this._beatPosition.get(note.beat.index);
			return beat.x + beat.noteNumbers.getNoteX(note,onEnd);
		}
		return 0;
	}
	,getLineOffset: function() {
		return 11 * this.stave.staveGroup.layout.renderer.scale;
	}
	,__class__: alphatab.rendering.TabBarRenderer
});
if(!alphatab.rendering.glyphs) alphatab.rendering.glyphs = {}
alphatab.rendering.glyphs.SvgGlyph = function(x,y,svg,xScale,yScale) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._svg = new alphatab.rendering.utils.SvgPathParser(svg);
	this._xGlyphScale = xScale * 0.0099;
	this._yGlyphScale = yScale * 0.0099;
};
alphatab.rendering.glyphs.SvgGlyph.__name__ = true;
alphatab.rendering.glyphs.SvgGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.SvgGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	parseCommand: function(cx,cy,canvas) {
		var command = this._svg.getString();
		var canContinue;
		switch(command) {
		case "M":
			this._currentX = cx + this._svg.getNumber() * this._xScale;
			this._currentY = cy + this._svg.getNumber() * this._yScale;
			canvas.moveTo(this._currentX,this._currentY);
			break;
		case "m":
			this._currentX += this._svg.getNumber() * this._xScale;
			this._currentY += this._svg.getNumber() * this._yScale;
			canvas.moveTo(this._currentX,this._currentY);
			break;
		case "Z":case "z":
			canvas.closePath();
			break;
		case "L":
			do {
				this._currentX = cx + this._svg.getNumber() * this._xScale;
				this._currentY = cy + this._svg.getNumber() * this._yScale;
				canvas.lineTo(this._currentX,this._currentY);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "l":
			do {
				this._currentX += this._svg.getNumber() * this._xScale;
				this._currentY += this._svg.getNumber() * this._yScale;
				canvas.lineTo(this._currentX,this._currentY);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "V":
			do {
				this._currentY = cy + this._svg.getNumber() * this._yScale;
				canvas.lineTo(this._currentX,this._currentY);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "v":
			do {
				this._currentY += this._svg.getNumber() * this._yScale;
				canvas.lineTo(this._currentX,this._currentY);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "H":
			do {
				this._currentX = cx + this._svg.getNumber() * this._xScale;
				canvas.lineTo(this._currentX,this._currentY);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "h":
			do {
				this._currentX += this._svg.getNumber() * this._xScale;
				canvas.lineTo(this._currentX,this._currentY);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "C":
			do {
				var x1 = cx + this._svg.getNumber() * this._xScale;
				var y1 = cy + this._svg.getNumber() * this._yScale;
				var x2 = cx + this._svg.getNumber() * this._xScale;
				var y2 = cy + this._svg.getNumber() * this._yScale;
				var x3 = cx + this._svg.getNumber() * this._xScale;
				var y3 = cy + this._svg.getNumber() * this._yScale;
				this._lastControlX = x2;
				this._lastControlY = y2;
				this._currentX = x3;
				this._currentY = y3;
				canvas.bezierCurveTo(x1,y1,x2,y2,x3,y3);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "c":
			do {
				var x1 = this._currentX + this._svg.getNumber() * this._xScale;
				var y1 = this._currentY + this._svg.getNumber() * this._yScale;
				var x2 = this._currentX + this._svg.getNumber() * this._xScale;
				var y2 = this._currentY + this._svg.getNumber() * this._yScale;
				var x3 = this._currentX + this._svg.getNumber() * this._xScale;
				var y3 = this._currentY + this._svg.getNumber() * this._yScale;
				this._lastControlX = x2;
				this._lastControlY = y2;
				this._currentX = x3;
				this._currentY = y3;
				canvas.bezierCurveTo(x1,y1,x2,y2,x3,y3);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "S":
			do {
				var x1 = cx + this._svg.getNumber() * this._xScale;
				var y1 = cy + this._svg.getNumber() * this._yScale;
				canContinue = this._svg.lastCommand == "c" || this._svg.lastCommand == "C" || this._svg.lastCommand == "S" || this._svg.lastCommand == "s";
				var x2 = canContinue?this._currentX + (this._currentX - this._lastControlX):this._currentX;
				var y2 = canContinue?this._currentY + (this._currentY - this._lastControlY):this._currentY;
				var x3 = cx + this._svg.getNumber() * this._xScale;
				var y3 = cy + this._svg.getNumber() * this._yScale;
				this._lastControlX = x2;
				this._lastControlY = y2;
				this._currentX = x3;
				this._currentY = y3;
				canvas.bezierCurveTo(x1,y1,x2,y2,x3,y3);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "s":
			do {
				var x1 = this._currentX + this._svg.getNumber() * this._xScale;
				var y1 = this._currentY + this._svg.getNumber() * this._yScale;
				canContinue = this._svg.lastCommand == "c" || this._svg.lastCommand == "C" || this._svg.lastCommand == "S" || this._svg.lastCommand == "s";
				var x2 = canContinue?this._currentX + (this._currentX - this._lastControlX):this._currentX;
				var y2 = canContinue?this._currentY + (this._currentY - this._lastControlY):this._currentY;
				var x3 = this._currentX + this._svg.getNumber() * this._xScale;
				var y3 = this._currentY + this._svg.getNumber() * this._yScale;
				this._lastControlX = x2;
				this._lastControlY = y2;
				this._currentX = x3;
				this._currentY = y3;
				canvas.bezierCurveTo(x1,y1,x2,y2,x3,y3);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "Q":
			do {
				var x1 = cx + this._svg.getNumber() * this._xScale;
				var y1 = cy + this._svg.getNumber() * this._yScale;
				var x2 = cx + this._svg.getNumber() * this._xScale;
				var y2 = cy + this._svg.getNumber() * this._yScale;
				this._lastControlX = x1;
				this._lastControlY = y1;
				this._currentX = x2;
				this._currentY = y2;
				canvas.quadraticCurveTo(x1,y1,x2,y2);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "q":
			do {
				var x1 = this._currentX + this._svg.getNumber() * this._xScale;
				var y1 = this._currentY + this._svg.getNumber() * this._yScale;
				var x2 = this._currentX + this._svg.getNumber() * this._xScale;
				var y2 = this._currentY + this._svg.getNumber() * this._yScale;
				this._lastControlX = x1;
				this._lastControlY = y1;
				this._currentX = x2;
				this._currentY = y2;
				canvas.quadraticCurveTo(x1,y1,x2,y2);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "T":
			do {
				var x1 = cx + this._svg.getNumber() * this._xScale;
				var y1 = cy + this._svg.getNumber() * this._yScale;
				canContinue = this._svg.lastCommand == "q" || this._svg.lastCommand == "Q" || this._svg.lastCommand == "t" || this._svg.lastCommand == "T";
				var cpx = canContinue?this._currentX + (this._currentX - this._lastControlX):this._currentX;
				var cpy = canContinue?this._currentY + (this._currentY - this._lastControlY):this._currentY;
				this._currentX = x1;
				this._currentY = y1;
				this._lastControlX = cpx;
				this._lastControlY = cpy;
				canvas.quadraticCurveTo(cpx,cpy,x1,y1);
			} while(this._svg.currentTokenIsNumber());
			break;
		case "t":
			do {
				var x1 = this._currentX + this._svg.getNumber() * this._xScale;
				var y1 = this._currentY + this._svg.getNumber() * this._yScale;
				var cpx = this._currentX + (this._currentX - this._lastControlX);
				var cpy = this._currentY + (this._currentY - this._lastControlY);
				canContinue = this._svg.lastCommand == "q" || this._svg.lastCommand == "Q" || this._svg.lastCommand == "t" || this._svg.lastCommand == "T";
				var cpx1 = canContinue?this._currentX + (this._currentX - this._lastControlX):this._currentX;
				var cpy1 = canContinue?this._currentY + (this._currentY - this._lastControlY):this._currentY;
				this._lastControlX = cpx1;
				this._lastControlY = cpy1;
				canvas.quadraticCurveTo(cpx1,cpy1,x1,y1);
			} while(this._svg.currentTokenIsNumber());
			break;
		}
	}
	,paint: function(cx,cy,canvas) {
		this._xScale = this._xGlyphScale * this.renderer.stave.staveGroup.layout.renderer.scale;
		this._yScale = this._yGlyphScale * this.renderer.stave.staveGroup.layout.renderer.scale;
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.mainGlyphColor);
		var startX = this.x + cx;
		var startY = this.y + cy;
		this._svg.reset();
		this._currentX = startX;
		this._currentY = startY;
		canvas.setColor(new alphatab.platform.model.Color(0,0,0));
		canvas.beginPath();
		while(!this._svg.eof()) this.parseCommand(startX,startY,canvas);
		canvas.fill();
	}
	,getSvgData: function() {
		return this._svg.svg;
	}
	,__class__: alphatab.rendering.glyphs.SvgGlyph
});
alphatab.rendering.glyphs.AccentuationGlyph = function(x,y,accentuation) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getSvg(accentuation),1,1);
};
alphatab.rendering.glyphs.AccentuationGlyph.__name__ = true;
alphatab.rendering.glyphs.AccentuationGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.AccentuationGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	getSvg: function(accentuation) {
		switch( (accentuation)[1] ) {
		case 1:
			return alphatab.rendering.glyphs.MusicFont.Accentuation;
		case 2:
			return alphatab.rendering.glyphs.MusicFont.HeavyAccentuation;
		default:
			return "";
		}
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 9 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.AccentuationGlyph
});
alphatab.rendering.glyphs.GlyphGroup = function(x,y,glyphs) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._glyphs = glyphs != null?glyphs:new Array();
};
alphatab.rendering.glyphs.GlyphGroup.__name__ = true;
alphatab.rendering.glyphs.GlyphGroup.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.GlyphGroup.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.renderer = this.renderer;
			g.paint(cx + this.x,cy + this.y,canvas);
		}
	}
	,addGlyph: function(g) {
		this._glyphs.push(g);
	}
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
	,__class__: alphatab.rendering.glyphs.GlyphGroup
});
alphatab.rendering.glyphs.AccidentalGroupGlyph = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.GlyphGroup.call(this,x,y,new Array());
};
alphatab.rendering.glyphs.AccidentalGroupGlyph.__name__ = true;
alphatab.rendering.glyphs.AccidentalGroupGlyph.__super__ = alphatab.rendering.glyphs.GlyphGroup;
alphatab.rendering.glyphs.AccidentalGroupGlyph.prototype = $extend(alphatab.rendering.glyphs.GlyphGroup.prototype,{
	doLayout: function() {
		this._glyphs.sort(function(a,b) {
			if(a.y == b.y) return 0;
			if(a.y < b.y) return -1; else return 1;
		});
		var columns = new Array();
		columns.push(-3000);
		var accidentalSize = 21 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.renderer = this.renderer;
			g.doLayout();
			var gColumn = 0;
			while(columns[gColumn] > g.y) {
				gColumn++;
				if(gColumn == columns.length) columns.push(-3000);
			}
			g.x = gColumn;
			columns[gColumn] = g.y + accidentalSize;
		}
		var columnWidth = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		if(this._glyphs.length == 0) this.width = 0; else this.width = columnWidth * columns.length;
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.x = this.width - (g.x + 1) * columnWidth;
		}
	}
	,__class__: alphatab.rendering.glyphs.AccidentalGroupGlyph
});
alphatab.rendering.glyphs.BarNumberGlyph = function(x,y,number,hidden) {
	if(hidden == null) hidden = false;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._number = number;
	this._hidden = hidden;
};
alphatab.rendering.glyphs.BarNumberGlyph.__name__ = true;
alphatab.rendering.glyphs.BarNumberGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.BarNumberGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		if(this._hidden) return;
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.barNumberColor);
		canvas.setFont(res.barNumberFont);
		canvas.fillText(Std.string(this._number),cx + this.x,cy + this.y);
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		var scoreRenderer = this.renderer.stave.staveGroup.layout.renderer;
		scoreRenderer.canvas.setFont(scoreRenderer.renderingResources.barNumberFont);
		this.width = this.renderer.stave.staveGroup.layout.renderer.canvas.measureText(Std.string(this._number)) + 3 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.BarNumberGlyph
});
alphatab.rendering.glyphs.BarSeperatorGlyph = function(x,y,isLast) {
	if(isLast == null) isLast = false;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._isLast = isLast;
};
alphatab.rendering.glyphs.BarSeperatorGlyph.__name__ = true;
alphatab.rendering.glyphs.BarSeperatorGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.BarSeperatorGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
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
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = (this._isLast?8:1) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.BarSeperatorGlyph
});
alphatab.rendering.glyphs.BeamGlyph = function(x,y,duration,direction,isGrace) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getRestSvg(duration,direction,isGrace),isGrace?0.7:1,this.getSvgScale(duration,direction,isGrace));
};
alphatab.rendering.glyphs.BeamGlyph.__name__ = true;
alphatab.rendering.glyphs.BeamGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.BeamGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	getRestSvg: function(duration,direction,isGrace) {
		if(isGrace) return alphatab.rendering.glyphs.MusicFont.FooterEighth;
		switch( (duration)[1] ) {
		case 3:
			return alphatab.rendering.glyphs.MusicFont.FooterEighth;
		case 4:
			return alphatab.rendering.glyphs.MusicFont.FooterSixteenth;
		case 5:
			return alphatab.rendering.glyphs.MusicFont.FooterThirtySecond;
		case 6:
			return alphatab.rendering.glyphs.MusicFont.FooterSixtyFourth;
		default:
			return "";
		}
	}
	,doLayout: function() {
		this.width = 0;
	}
	,getSvgScale: function(duration,direction,isGrace) {
		var scale = isGrace?0.7:1;
		if(direction == alphatab.rendering.utils.BeamDirection.Up) return scale; else return -1 * scale;
	}
	,__class__: alphatab.rendering.glyphs.BeamGlyph
});
alphatab.rendering.glyphs.BeatGlyphBase = function(b) {
	alphatab.rendering.glyphs.GlyphGroup.call(this);
	this.beat = b;
};
alphatab.rendering.glyphs.BeatGlyphBase.__name__ = true;
alphatab.rendering.glyphs.BeatGlyphBase.__super__ = alphatab.rendering.glyphs.GlyphGroup;
alphatab.rendering.glyphs.BeatGlyphBase.prototype = $extend(alphatab.rendering.glyphs.GlyphGroup.prototype,{
	getBeatDurationWidth: function(d) {
		switch( (d)[1] ) {
		case 0:
			return 65;
		case 1:
			return 45;
		case 2:
			return 29;
		case 3:
			return 19;
		case 4:
			return 11;
		case 5:
			return 11;
		case 6:
			return 11;
		}
	}
	,noteLoop: function(action) {
		var i = this.beat.notes.length - 1;
		while(i >= 0) action(this.beat.notes[i--]);
	}
	,doLayout: function() {
		var w = 0;
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.x = w;
			g.renderer = this.renderer;
			g.doLayout();
			w += g.width;
		}
		this.width = w;
	}
	,__class__: alphatab.rendering.glyphs.BeatGlyphBase
});
alphatab.rendering.glyphs.BendGlyph = function(n,width,height) {
	alphatab.rendering.Glyph.call(this,0,0);
	this._note = n;
	this.width = width;
	this._height = height;
};
alphatab.rendering.glyphs.BendGlyph.__name__ = true;
alphatab.rendering.glyphs.BendGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.BendGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var r = this.renderer;
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		var dX = this.width / 60;
		var maxValue = 0;
		var _g1 = 0, _g = this._note.bendPoints.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(this._note.bendPoints[i].value > maxValue) maxValue = this._note.bendPoints[i].value;
		}
		var dY = this._height / maxValue;
		var xx = cx + this.x;
		var yy = cy + this.y + r.getNoteY(this._note);
		canvas.beginPath();
		var _g1 = 0, _g = this._note.bendPoints.length - 1;
		while(_g1 < _g) {
			var i = _g1++;
			var firstPt = this._note.bendPoints[i];
			var secondPt = this._note.bendPoints[i + 1];
			if(firstPt.value == secondPt.value && i == this._note.bendPoints.length - 2) continue;
			var x1 = xx + dX * firstPt.offset;
			var y1 = yy - dY * firstPt.value;
			var x2 = xx + dX * secondPt.offset;
			var y2 = yy - dY * secondPt.value;
			if(firstPt.value == secondPt.value) {
				canvas.moveTo(x1,y1);
				canvas.lineTo(x2,y2);
				canvas.stroke();
			} else {
				var hx = x1 + (x2 - x1);
				var hy = yy - dY * firstPt.value;
				canvas.moveTo(x1,y1);
				canvas.bezierCurveTo(hx,hy,x2,y2,x2,y2);
				canvas.stroke();
			}
			var arrowSize = 6 * this.renderer.stave.staveGroup.layout.renderer.scale;
			if(secondPt.value > firstPt.value) {
				canvas.beginPath();
				canvas.moveTo(x2,y2);
				canvas.lineTo(x2 - arrowSize * 0.5,y2 + arrowSize);
				canvas.lineTo(x2 + arrowSize * 0.5,y2 + arrowSize);
				canvas.closePath();
				canvas.fill();
			} else if(secondPt.value != firstPt.value) {
				canvas.beginPath();
				canvas.moveTo(x2,y2);
				canvas.lineTo(x2 - arrowSize * 0.5,y2 - arrowSize);
				canvas.lineTo(x2 + arrowSize * 0.5,y2 - arrowSize);
				canvas.closePath();
				canvas.fill();
			}
			canvas.stroke();
			if(secondPt.value != 0) {
				var dV = secondPt.value - firstPt.value;
				var up = dV > 0;
				dV = Math.abs(dV);
				var s = "";
				if(dV == 4) {
					s = "full";
					dV -= 4;
				} else if(dV > 4) {
					s += Std.string(Math.floor(dV / 4)) + " ";
					dV -= Math.floor(dV);
				}
				if(dV > 0) s += Std.string(dV) + "/4";
				if(s != "") {
					if(!up) s = "-" + s;
					canvas.setFont(res.tablatureFont);
					var size = canvas.measureText(s);
					var y = up?y2 - res.tablatureFont.getSize() - 2 * this.renderer.stave.staveGroup.layout.renderer.scale:y2 + 2 * this.renderer.stave.staveGroup.layout.renderer.scale;
					var x = x2 - size / 2;
					canvas.fillText(s,x,y);
				}
			}
		}
	}
	,__class__: alphatab.rendering.glyphs.BendGlyph
});
alphatab.rendering.glyphs.CircleGlyph = function(x,y,size) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._size = size;
};
alphatab.rendering.glyphs.CircleGlyph.__name__ = true;
alphatab.rendering.glyphs.CircleGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.CircleGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		canvas.beginPath();
		canvas.circle(cx + this.x,cy + this.y,this._size);
		canvas.fill();
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = this._size + 3 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.CircleGlyph
});
alphatab.rendering.glyphs.ClefGlyph = function(x,y,clef) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getClefSvg(clef),1,1);
};
alphatab.rendering.glyphs.ClefGlyph.__name__ = true;
alphatab.rendering.glyphs.ClefGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.ClefGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	getClefSvg: function(clef) {
		switch( (clef)[1] ) {
		case 0:
			return alphatab.rendering.glyphs.MusicFont.ClefC;
		case 1:
			return alphatab.rendering.glyphs.MusicFont.ClefC;
		case 2:
			return alphatab.rendering.glyphs.MusicFont.ClefF;
		case 3:
			return alphatab.rendering.glyphs.MusicFont.ClefG;
		}
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 28 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.ClefGlyph
});
alphatab.rendering.glyphs.DeadNoteHeadGlyph = function(x,y,isGrace) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.NoteDead,1,1);
};
alphatab.rendering.glyphs.DeadNoteHeadGlyph.__name__ = true;
alphatab.rendering.glyphs.DeadNoteHeadGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.DeadNoteHeadGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 9 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.DeadNoteHeadGlyph
});
alphatab.rendering.glyphs.DiamondNoteHeadGlyph = function(x,y,isGrace) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.NoteHarmonic,isGrace?0.7:1,isGrace?0.7:1);
	this._isGrace = isGrace;
};
alphatab.rendering.glyphs.DiamondNoteHeadGlyph.__name__ = true;
alphatab.rendering.glyphs.DiamondNoteHeadGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.DiamondNoteHeadGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 9 * (this._isGrace?0.7:1) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.DiamondNoteHeadGlyph
});
alphatab.rendering.glyphs.DigitGlyph = function(x,y,digit) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getDigit(digit),1,1);
	this._digit = digit;
};
alphatab.rendering.glyphs.DigitGlyph.__name__ = true;
alphatab.rendering.glyphs.DigitGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.DigitGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	getDigit: function(digit) {
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
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.y += 7 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		this.width = this.getDigitWidth(this._digit) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.DigitGlyph
});
alphatab.rendering.glyphs.FlatGlyph = function(x,y,isGrace) {
	if(isGrace == null) isGrace = false;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.AccidentalFlat,isGrace?0.7:1,isGrace?0.7:1);
	this._isGrace = isGrace;
};
alphatab.rendering.glyphs.FlatGlyph.__name__ = true;
alphatab.rendering.glyphs.FlatGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.FlatGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 8 * (this._isGrace?0.7:1) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.FlatGlyph
});
alphatab.rendering.glyphs.ISupportsFinalize = function() { }
alphatab.rendering.glyphs.ISupportsFinalize.__name__ = true;
alphatab.rendering.glyphs.ISupportsFinalize.prototype = {
	__class__: alphatab.rendering.glyphs.ISupportsFinalize
}
alphatab.rendering.glyphs.MusicFont = function() { }
alphatab.rendering.glyphs.MusicFont.__name__ = true;
alphatab.rendering.glyphs.NaturalizeGlyph = function(x,y,isGrace) {
	if(isGrace == null) isGrace = false;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.AccidentalNatural,isGrace?0.7:1,isGrace?0.7:1);
	this._isGrace = isGrace;
};
alphatab.rendering.glyphs.NaturalizeGlyph.__name__ = true;
alphatab.rendering.glyphs.NaturalizeGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.NaturalizeGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 8 * (this._isGrace?0.7:1) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.NaturalizeGlyph
});
alphatab.rendering.glyphs.NoteHeadGlyph = function(x,y,duration,isGrace) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getNoteSvg(duration),isGrace?0.7:1,isGrace?0.7:1);
	this._isGrace = isGrace;
};
alphatab.rendering.glyphs.NoteHeadGlyph.__name__ = true;
alphatab.rendering.glyphs.NoteHeadGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.NoteHeadGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	getNoteSvg: function(duration) {
		switch( (duration)[1] ) {
		case 0:
			return alphatab.rendering.glyphs.MusicFont.NoteWhole;
		case 1:
			return alphatab.rendering.glyphs.MusicFont.NoteHalf;
		default:
			return alphatab.rendering.glyphs.MusicFont.NoteQuarter;
		}
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 9 * (this._isGrace?0.7:1) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.NoteHeadGlyph
});
alphatab.rendering.glyphs.NoteNumberGlyph = function(x,y,n,isGrace) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._isGrace = isGrace;
	if(!n.isTieDestination) {
		this._noteString = n.isDead?"X":Std.string(n.fret);
		if(n.isGhost) this._noteString = "(" + this._noteString + ")";
	} else if(n.beat.index == 0) this._noteString = "(" + this._noteString + ")";
};
alphatab.rendering.glyphs.NoteNumberGlyph.__name__ = true;
alphatab.rendering.glyphs.NoteNumberGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.NoteNumberGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		if(this._noteString != null) {
			var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
			canvas.setColor(res.mainGlyphColor);
			if(this._isGrace) canvas.setFont(res.graceFont); else canvas.setFont(res.tablatureFont);
			canvas.fillText(Std.string(this._noteString),cx + this.x + 3 * this.renderer.stave.staveGroup.layout.renderer.scale,cy + this.y);
		}
	}
	,doLayout: function() {
		var scoreRenderer = this.renderer.stave.staveGroup.layout.renderer;
		if(this._isGrace) scoreRenderer.canvas.setFont(scoreRenderer.renderingResources.graceFont); else scoreRenderer.canvas.setFont(scoreRenderer.renderingResources.tablatureFont);
		this.width = this.renderer.stave.staveGroup.layout.renderer.canvas.measureText(this._noteString) | 0;
	}
	,__class__: alphatab.rendering.glyphs.NoteNumberGlyph
});
alphatab.rendering.glyphs.NumberGlyph = function(x,y,number) {
	alphatab.rendering.glyphs.GlyphGroup.call(this,x,y,new Array());
	this._number = number;
};
alphatab.rendering.glyphs.NumberGlyph.__name__ = true;
alphatab.rendering.glyphs.NumberGlyph.__super__ = alphatab.rendering.glyphs.GlyphGroup;
alphatab.rendering.glyphs.NumberGlyph.prototype = $extend(alphatab.rendering.glyphs.GlyphGroup.prototype,{
	doLayout: function() {
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
	,canScale: function() {
		return false;
	}
	,__class__: alphatab.rendering.glyphs.NumberGlyph
});
alphatab.rendering.glyphs.RepeatCloseGlyph = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
};
alphatab.rendering.glyphs.RepeatCloseGlyph.__name__ = true;
alphatab.rendering.glyphs.RepeatCloseGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.RepeatCloseGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
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
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		var base = this.renderer.isLast()?11:13;
		this.width = base * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.RepeatCloseGlyph
});
alphatab.rendering.glyphs.RepeatCountGlyph = function(x,y,count) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._count = count;
};
alphatab.rendering.glyphs.RepeatCountGlyph.__name__ = true;
alphatab.rendering.glyphs.RepeatCountGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.RepeatCountGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.mainGlyphColor);
		canvas.setFont(res.barNumberFont);
		var s = "x" + Std.string(this._count);
		var w = canvas.measureText(s) / 1.5 | 0;
		canvas.fillText(s,cx + this.x - w,cy + this.y);
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 0;
	}
	,__class__: alphatab.rendering.glyphs.RepeatCountGlyph
});
alphatab.rendering.glyphs.RepeatOpenGlyph = function(x,y,circleSize,dotOffset) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._dotOffset = dotOffset;
	this._circleSize = circleSize;
};
alphatab.rendering.glyphs.RepeatOpenGlyph.__name__ = true;
alphatab.rendering.glyphs.RepeatOpenGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.RepeatOpenGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
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
		var circleSize = this._circleSize * this.renderer.stave.staveGroup.layout.renderer.scale;
		var middle = (top + bottom) / 2;
		canvas.beginPath();
		canvas.circle(left,middle - circleSize * this._dotOffset,circleSize);
		canvas.circle(left,middle + circleSize * this._dotOffset,circleSize);
		canvas.fill();
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 13 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.RepeatOpenGlyph
});
alphatab.rendering.glyphs.RestGlyph = function(x,y,duration) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getRestSvg(duration),1,1);
};
alphatab.rendering.glyphs.RestGlyph.__name__ = true;
alphatab.rendering.glyphs.RestGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.RestGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	getRestSvg: function(duration) {
		switch( (duration)[1] ) {
		case 0:
		case 1:
			return alphatab.rendering.glyphs.MusicFont.RestWhole;
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
		}
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 9 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.RestGlyph
});
alphatab.rendering.glyphs.ScoreBeatGlyph = function(b) {
	alphatab.rendering.glyphs.BeatGlyphBase.call(this,b);
	this._ties = new Array();
};
alphatab.rendering.glyphs.ScoreBeatGlyph.__name__ = true;
alphatab.rendering.glyphs.ScoreBeatGlyph.__interfaces__ = [alphatab.rendering.glyphs.ISupportsFinalize];
alphatab.rendering.glyphs.ScoreBeatGlyph.__super__ = alphatab.rendering.glyphs.BeatGlyphBase;
alphatab.rendering.glyphs.ScoreBeatGlyph.prototype = $extend(alphatab.rendering.glyphs.BeatGlyphBase.prototype,{
	createNoteGlyph: function(n) {
		var sr = js.Boot.__cast(this.renderer , alphatab.rendering.ScoreBarRenderer);
		var noteHeadGlyph;
		var isGrace = this.beat.graceType != alphatab.model.GraceType.None;
		if(n.isDead) noteHeadGlyph = new alphatab.rendering.glyphs.DeadNoteHeadGlyph(0,0,isGrace); else if(n.harmonicType == alphatab.model.HarmonicType.None) noteHeadGlyph = new alphatab.rendering.glyphs.NoteHeadGlyph(0,0,n.beat.duration,isGrace); else noteHeadGlyph = new alphatab.rendering.glyphs.DiamondNoteHeadGlyph(0,0,isGrace);
		var line = sr.getNoteLine(n);
		noteHeadGlyph.y = sr.getScoreY(line,-1);
		this.noteHeads.addNoteGlyph(noteHeadGlyph,n,line);
		if(n.isStaccato && !this.noteHeads.beatEffects.exists("STACCATO")) this.noteHeads.beatEffects.set("STACCATO",new alphatab.rendering.glyphs.CircleGlyph(0,0,1.5));
		if(n.accentuated == alphatab.model.AccentuationType.Normal && !this.noteHeads.beatEffects.exists("ACCENT")) this.noteHeads.beatEffects.set("ACCENT",new alphatab.rendering.glyphs.AccentuationGlyph(0,0,alphatab.model.AccentuationType.Normal));
		if(n.accentuated == alphatab.model.AccentuationType.Heavy && !this.noteHeads.beatEffects.exists("HACCENT")) this.noteHeads.beatEffects.set("HACCENT",new alphatab.rendering.glyphs.AccentuationGlyph(0,0,alphatab.model.AccentuationType.Heavy));
		if(n.isTieDestination && n.tieOrigin != null) {
			var tie = new alphatab.rendering.glyphs.ScoreTieGlyph(n.tieOrigin,n);
			this._ties.push(tie);
		} else if(n.isHammerPullDestination && n.hammerPullOrigin != null) {
			var tie = new alphatab.rendering.glyphs.ScoreTieGlyph(n.hammerPullOrigin,n);
		} else if(n.slideType == alphatab.model.SlideType.Legato && n.slideTarget != null) {
			var tie = new alphatab.rendering.glyphs.ScoreTieGlyph(n,n.slideTarget);
			this._ties.push(tie);
		}
		if(n.slideType != alphatab.model.SlideType.None) {
			var l = new alphatab.rendering.glyphs.ScoreSlideLineGlyph(n.slideType,n);
			this._ties.push(l);
		}
	}
	,createBeatDot: function(n,group) {
		var sr = js.Boot.__cast(this.renderer , alphatab.rendering.ScoreBarRenderer);
		group.addGlyph(new alphatab.rendering.glyphs.CircleGlyph(0,sr.getScoreY(sr.getNoteLine(n),2 * this.renderer.stave.staveGroup.layout.renderer.scale | 0),1.5 * this.renderer.stave.staveGroup.layout.renderer.scale));
	}
	,doLayout: function() {
		var _g = this;
		if(!this.beat.isRest()) {
			this.noteHeads = new alphatab.rendering.glyphs.ScoreNoteChordGlyph();
			this.noteHeads.beat = this.beat;
			this.noteHeads.beamingHelper = this.beamingHelper;
			this.noteLoop(function(n) {
				_g.createNoteGlyph(n);
			});
			this.addGlyph(this.noteHeads);
			var _g1 = 0, _g2 = this.beat.dots;
			while(_g1 < _g2) {
				var i = _g1++;
				var group = [new alphatab.rendering.glyphs.GlyphGroup()];
				this.noteLoop((function(group) {
					return function(n) {
						_g.createBeatDot(n,group[0]);
					};
				})(group));
				this.addGlyph(group[0]);
			}
		} else {
			var line = 0;
			var _g1 = this;
			switch( (_g1.beat.duration)[1] ) {
			case 0:
				line = 4;
				break;
			case 1:
				line = 5;
				break;
			case 2:
				line = 6;
				break;
			case 3:
				line = 8;
				break;
			case 4:
				line = 8;
				break;
			case 5:
				line = 8;
				break;
			case 6:
				line = 8;
				break;
			}
			var sr = js.Boot.__cast(this.renderer , alphatab.rendering.ScoreBarRenderer);
			var y = sr.getScoreY(line);
			this.addGlyph(new alphatab.rendering.glyphs.RestGlyph(0,y,this.beat.duration));
		}
		alphatab.rendering.glyphs.BeatGlyphBase.prototype.doLayout.call(this);
		if(this.noteHeads != null) this.noteHeads.updateBeamingHelper(this.x);
	}
	,applyGlyphSpacing: function(spacing) {
		alphatab.rendering.glyphs.BeatGlyphBase.prototype.applyGlyphSpacing.call(this,spacing);
		if(!this.beat.isRest()) this.noteHeads.updateBeamingHelper(this.x);
	}
	,finalizeGlyph: function(layout) {
		if(!this.beat.isRest()) this.noteHeads.updateBeamingHelper(this.x);
	}
	,paint: function(cx,cy,canvas) {
		alphatab.rendering.glyphs.BeatGlyphBase.prototype.paint.call(this,cx,cy,canvas);
		var _g = 0, _g1 = this._ties;
		while(_g < _g1.length) {
			var t = _g1[_g];
			++_g;
			t.renderer = this.renderer;
			t.paint(cx,cy + this.y,canvas);
		}
	}
	,__class__: alphatab.rendering.glyphs.ScoreBeatGlyph
});
alphatab.rendering.glyphs.ScoreBeatPostNotesGlyph = function(b) {
	alphatab.rendering.glyphs.BeatGlyphBase.call(this,b);
};
alphatab.rendering.glyphs.ScoreBeatPostNotesGlyph.__name__ = true;
alphatab.rendering.glyphs.ScoreBeatPostNotesGlyph.__super__ = alphatab.rendering.glyphs.BeatGlyphBase;
alphatab.rendering.glyphs.ScoreBeatPostNotesGlyph.prototype = $extend(alphatab.rendering.glyphs.BeatGlyphBase.prototype,{
	doLayout: function() {
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,this.getBeatDurationWidth(this.beat.duration) * this.renderer.stave.staveGroup.layout.renderer.scale | 0));
		alphatab.rendering.glyphs.BeatGlyphBase.prototype.doLayout.call(this);
	}
	,__class__: alphatab.rendering.glyphs.ScoreBeatPostNotesGlyph
});
alphatab.rendering.glyphs.ScoreBeatPreNotesGlyph = function(b) {
	alphatab.rendering.glyphs.BeatGlyphBase.call(this,b);
};
alphatab.rendering.glyphs.ScoreBeatPreNotesGlyph.__name__ = true;
alphatab.rendering.glyphs.ScoreBeatPreNotesGlyph.__super__ = alphatab.rendering.glyphs.BeatGlyphBase;
alphatab.rendering.glyphs.ScoreBeatPreNotesGlyph.prototype = $extend(alphatab.rendering.glyphs.BeatGlyphBase.prototype,{
	createAccidentalGlyph: function(n,accidentals) {
		var sr = js.Boot.__cast(this.renderer , alphatab.rendering.ScoreBarRenderer);
		var noteLine = sr.getNoteLine(n);
		var accidental = sr.accidentalHelper.applyAccidental(n,noteLine);
		var isGrace = this.beat.graceType != alphatab.model.GraceType.None;
		switch( (accidental)[1] ) {
		case 2:
			accidentals.addGlyph(new alphatab.rendering.glyphs.SharpGlyph(0,sr.getScoreY(noteLine),isGrace));
			break;
		case 3:
			accidentals.addGlyph(new alphatab.rendering.glyphs.FlatGlyph(0,sr.getScoreY(noteLine),isGrace));
			break;
		case 1:
			accidentals.addGlyph(new alphatab.rendering.glyphs.NaturalizeGlyph(0,sr.getScoreY(noteLine + 1),isGrace));
			break;
		default:
		}
	}
	,doLayout: function() {
		var _g = this;
		if(!this.beat.isRest()) {
			var accidentals = new alphatab.rendering.glyphs.AccidentalGroupGlyph(0,0);
			this.noteLoop(function(n) {
				_g.createAccidentalGlyph(n,accidentals);
			});
			this.addGlyph(accidentals);
		}
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,4 * (this.beat.graceType != alphatab.model.GraceType.None?0.7:1) * this.renderer.stave.staveGroup.layout.renderer.scale | 0,true));
		alphatab.rendering.glyphs.BeatGlyphBase.prototype.doLayout.call(this);
	}
	,applyGlyphSpacing: function(spacing) {
		alphatab.rendering.glyphs.BeatGlyphBase.prototype.applyGlyphSpacing.call(this,spacing);
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.x += spacing;
		}
	}
	,__class__: alphatab.rendering.glyphs.ScoreBeatPreNotesGlyph
});
alphatab.rendering.glyphs.ScoreNoteChordGlyph = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._infos = new Array();
	this.beatEffects = new haxe.ds.StringMap();
	this._noteLookup = new haxe.ds.IntMap();
};
alphatab.rendering.glyphs.ScoreNoteChordGlyph.__name__ = true;
alphatab.rendering.glyphs.ScoreNoteChordGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.ScoreNoteChordGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var scoreRenderer = this.renderer;
		var effectY = this.beamingHelper.getDirection() == alphatab.rendering.utils.BeamDirection.Up?scoreRenderer.getScoreY(this.maxNote.line,13):scoreRenderer.getScoreY(this.minNote.line,-9);
		var effectSpacing = this.beamingHelper.getDirection() == alphatab.rendering.utils.BeamDirection.Up?7 * this.renderer.stave.staveGroup.layout.renderer.scale | 0:-7 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		var $it0 = this.beatEffects.iterator();
		while( $it0.hasNext() ) {
			var g = $it0.next();
			g.y = effectY;
			g.x = this.width / 2 | 0;
			g.paint(cx + this.x,cy + this.y,canvas);
			effectY += effectSpacing;
		}
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
			g.glyph.renderer = this.renderer;
			g.glyph.paint(cx + this.x,cy + this.y,canvas);
		}
	}
	,doLayout: function() {
		this._infos.sort(function(a,b) {
			if(a.line == b.line) return 0; else if(a.line < b.line) return 1; else return -1;
		});
		var padding = 0;
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
			this.upLineX = displacedX;
			this.downLineX = displacedX;
		} else {
			this.upLineX = w;
			this.downLineX = padding;
		}
		var $it0 = this.beatEffects.iterator();
		while( $it0.hasNext() ) {
			var e = $it0.next();
			e.renderer = this.renderer;
			e.doLayout();
		}
		this.width = w + padding;
	}
	,hasBottomOverflow: function() {
		return this.maxNote != null && this.maxNote.line > 8;
	}
	,hasTopOverflow: function() {
		return this.minNote != null && this.minNote.line < 0;
	}
	,updateBeamingHelper: function(cx) {
		this.beamingHelper.registerBeatLineX(this.beat,cx + this.x + this.upLineX,cx + this.x + this.downLineX);
	}
	,canScale: function() {
		return false;
	}
	,addNoteGlyph: function(noteGlyph,note,noteLine) {
		var info = { glyph : noteGlyph, line : noteLine};
		this._infos.push(info);
		this._noteLookup.set(note.string,noteGlyph);
		if(this.minNote == null || this.minNote.line > info.line) this.minNote = info;
		if(this.maxNote == null || this.maxNote.line < info.line) this.maxNote = info;
	}
	,getNoteY: function(note) {
		if(this._noteLookup.exists(note.string)) return this.y + this._noteLookup.get(note.string).y;
		return 0;
	}
	,getNoteX: function(note,onEnd) {
		if(onEnd == null) onEnd = true;
		if(this._noteLookup.exists(note.string)) {
			var n = this._noteLookup.get(note.string);
			var pos = this.x + n.x;
			if(onEnd) pos += n.width;
			return pos;
		}
		return 0;
	}
	,getDirection: function() {
		return this.beamingHelper.getDirection();
	}
	,__class__: alphatab.rendering.glyphs.ScoreNoteChordGlyph
});
alphatab.rendering.glyphs.ScoreSlideLineGlyph = function(type,startNote) {
	alphatab.rendering.Glyph.call(this,0,0);
	this._type = type;
	this._startNote = startNote;
};
alphatab.rendering.glyphs.ScoreSlideLineGlyph.__name__ = true;
alphatab.rendering.glyphs.ScoreSlideLineGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.ScoreSlideLineGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var r = this.renderer;
		var sizeX = 12 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		var offsetX = this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		var startX;
		var startY;
		var endX;
		var endY;
		var _g = this;
		switch( (_g._type)[1] ) {
		case 1:
		case 2:
			startX = cx + r.getNoteX(this._startNote,true) + offsetX;
			startY = cy + r.getNoteY(this._startNote) + 4;
			if(this._startNote.slideTarget != null) {
				endX = cx + r.getNoteX(this._startNote.slideTarget,false) - offsetX;
				endY = cy + r.getNoteY(this._startNote.slideTarget) + 4;
			} else {
				endX = startX + sizeX;
				endY = startY;
			}
			break;
		case 3:
			endX = cx + r.getNoteX(this._startNote,false) - offsetX;
			endY = cy + r.getNoteY(this._startNote) + 4;
			startX = endX - sizeX;
			startY = cy + r.getNoteY(this._startNote) + 9;
			break;
		case 4:
			endX = cx + r.getNoteX(this._startNote,false) - offsetX;
			endY = cy + r.getNoteY(this._startNote) + 4;
			startX = endX - sizeX;
			startY = cy + r.getNoteY(this._startNote);
			break;
		case 5:
			startX = cx + r.getNoteX(this._startNote,true) + offsetX;
			startY = cy + r.getNoteY(this._startNote) + 4;
			endX = startX + sizeX;
			endY = cy + r.getNoteY(this._startNote);
			break;
		case 6:
			startX = cx + r.getNoteX(this._startNote,true) + offsetX;
			startY = cy + r.getNoteY(this._startNote) + 4;
			endX = startX + sizeX;
			endY = cy + r.getNoteY(this._startNote) + 9;
			break;
		default:
			return;
		}
		canvas.setColor(this.renderer.stave.staveGroup.layout.renderer.renderingResources.mainGlyphColor);
		canvas.beginPath();
		canvas.moveTo(startX,startY);
		canvas.lineTo(endX,endY);
		canvas.stroke();
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 0;
	}
	,__class__: alphatab.rendering.glyphs.ScoreSlideLineGlyph
});
alphatab.rendering.glyphs.TieGlyph = function(startNote,endNote) {
	alphatab.rendering.Glyph.call(this,0,0);
	this._startNote = startNote;
	this._endNote = endNote;
};
alphatab.rendering.glyphs.TieGlyph.__name__ = true;
alphatab.rendering.glyphs.TieGlyph.paintTie = function(canvas,scale,x1,y1,x2,y2,down) {
	if(down == null) down = false;
	if(x2 > x1) {
		var t = x1;
		x1 = x2;
		x2 = t;
		t = y1;
		y1 = y2;
		y2 = t;
	}
	var offset = 15 * scale;
	var size = 4 * scale;
	var normalVector = { x : y2 - y1, y : x2 - x1};
	var length = Math.sqrt(normalVector.x * normalVector.x + normalVector.y * normalVector.y);
	if(down) normalVector.x *= -1; else normalVector.y *= -1;
	normalVector.x /= length;
	normalVector.y /= length;
	var center = { x : (x2 + x1) / 2, y : (y2 + y1) / 2};
	var cp1 = { x : center.x + offset * normalVector.x, y : center.y + offset * normalVector.y};
	var cp2 = { x : center.x + (offset - size) * normalVector.x, y : center.y + (offset - size) * normalVector.y};
	canvas.beginPath();
	canvas.moveTo(x1,y1);
	canvas.quadraticCurveTo(cp1.x,cp1.y,x2,y2);
	canvas.quadraticCurveTo(cp2.x,cp2.y,x1,y1);
	canvas.closePath();
}
alphatab.rendering.glyphs.TieGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.TieGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 0;
	}
	,__class__: alphatab.rendering.glyphs.TieGlyph
});
alphatab.rendering.glyphs.ScoreTieGlyph = function(startNote,endNote) {
	alphatab.rendering.glyphs.TieGlyph.call(this,startNote,endNote);
};
alphatab.rendering.glyphs.ScoreTieGlyph.__name__ = true;
alphatab.rendering.glyphs.ScoreTieGlyph.__super__ = alphatab.rendering.glyphs.TieGlyph;
alphatab.rendering.glyphs.ScoreTieGlyph.prototype = $extend(alphatab.rendering.glyphs.TieGlyph.prototype,{
	paint: function(cx,cy,canvas) {
		var r = this.renderer;
		var startX = cx + r.getNoteX(this._startNote);
		var endX = cx + r.getNoteX(this._endNote,false);
		var startY = cy + r.getNoteY(this._startNote) + 4.5;
		var endY = cy + r.getNoteY(this._endNote) + 4.5;
		alphatab.rendering.glyphs.TieGlyph.paintTie(canvas,this.renderer.stave.staveGroup.layout.renderer.scale,startX,startY,endX,endY,r.getBeatDirection(this._startNote.beat) == alphatab.rendering.utils.BeamDirection.Down);
		canvas.setColor(this.renderer.stave.staveGroup.layout.renderer.renderingResources.mainGlyphColor);
		canvas.fill();
	}
	,__class__: alphatab.rendering.glyphs.ScoreTieGlyph
});
alphatab.rendering.glyphs.SharpGlyph = function(x,y,isGrace) {
	if(isGrace == null) isGrace = false;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.AccidentalSharp,isGrace?0.7:1,isGrace?0.7:1);
	this._isGrace = isGrace;
};
alphatab.rendering.glyphs.SharpGlyph.__name__ = true;
alphatab.rendering.glyphs.SharpGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.SharpGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 8 * (this._isGrace?0.7:1) * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.SharpGlyph
});
alphatab.rendering.glyphs.SpacingGlyph = function(x,y,width,scaling) {
	if(scaling == null) scaling = true;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this.width = width;
	this._scaling = scaling;
};
alphatab.rendering.glyphs.SpacingGlyph.__name__ = true;
alphatab.rendering.glyphs.SpacingGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.SpacingGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	canScale: function() {
		return this._scaling;
	}
	,__class__: alphatab.rendering.glyphs.SpacingGlyph
});
alphatab.rendering.glyphs.TabBeatGlyph = function(b) {
	alphatab.rendering.glyphs.BeatGlyphBase.call(this,b);
	this._ties = new Array();
};
alphatab.rendering.glyphs.TabBeatGlyph.__name__ = true;
alphatab.rendering.glyphs.TabBeatGlyph.__super__ = alphatab.rendering.glyphs.BeatGlyphBase;
alphatab.rendering.glyphs.TabBeatGlyph.prototype = $extend(alphatab.rendering.glyphs.BeatGlyphBase.prototype,{
	createNoteGlyph: function(n) {
		var isGrace = this.beat.graceType != alphatab.model.GraceType.None;
		var tr = js.Boot.__cast(this.renderer , alphatab.rendering.TabBarRenderer);
		var noteNumberGlyph = new alphatab.rendering.glyphs.NoteNumberGlyph(0,0,n,isGrace);
		var l = n.beat.voice.bar.track.tuning.length - n.string + 1;
		noteNumberGlyph.y = tr.getTabY(l,-2);
		this.noteNumbers.addNoteGlyph(noteNumberGlyph,n);
		if(n.isHammerPullDestination && n.hammerPullOrigin != null) {
			var tie = new alphatab.rendering.glyphs.TabTieGlyph(n.hammerPullOrigin,n);
			this._ties.push(tie);
		} else if(n.slideType == alphatab.model.SlideType.Legato && n.slideTarget != null) {
			var tie = new alphatab.rendering.glyphs.TabTieGlyph(n,n.slideTarget);
			this._ties.push(tie);
		}
		if(n.slideType != alphatab.model.SlideType.None) {
			var l1 = new alphatab.rendering.glyphs.TabSlideLineGlyph(n.slideType,n);
			this._ties.push(l1);
		}
	}
	,doLayout: function() {
		var _g = this;
		if(!this.beat.isRest()) {
			this.noteNumbers = new alphatab.rendering.glyphs.TabNoteChordGlyph();
			this.noteNumbers.beat = this.beat;
			this.noteLoop(function(n) {
				_g.createNoteGlyph(n);
			});
			this.addGlyph(this.noteNumbers);
		}
		var w = 0;
		var _g1 = 0, _g11 = this._glyphs;
		while(_g1 < _g11.length) {
			var g = _g11[_g1];
			++_g1;
			g.x = w;
			g.renderer = this.renderer;
			g.doLayout();
			w += g.width;
		}
		this.width = w;
	}
	,paint: function(cx,cy,canvas) {
		alphatab.rendering.glyphs.BeatGlyphBase.prototype.paint.call(this,cx,cy,canvas);
		var _g = 0, _g1 = this._ties;
		while(_g < _g1.length) {
			var t = _g1[_g];
			++_g;
			t.renderer = this.renderer;
			t.paint(cx,cy + this.y,canvas);
		}
	}
	,__class__: alphatab.rendering.glyphs.TabBeatGlyph
});
alphatab.rendering.glyphs.TabBeatPostNotesGlyph = function(b) {
	alphatab.rendering.glyphs.BeatGlyphBase.call(this,b);
};
alphatab.rendering.glyphs.TabBeatPostNotesGlyph.__name__ = true;
alphatab.rendering.glyphs.TabBeatPostNotesGlyph.__super__ = alphatab.rendering.glyphs.BeatGlyphBase;
alphatab.rendering.glyphs.TabBeatPostNotesGlyph.prototype = $extend(alphatab.rendering.glyphs.BeatGlyphBase.prototype,{
	createNoteGlyphs: function(n) {
		if(n.bendPoints.length > 1) {
			var bendHeight = 60 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
			this.renderer.registerOverflowTop(bendHeight);
			this.addGlyph(new alphatab.rendering.glyphs.BendGlyph(n,this.getBeatDurationWidth(this.beat.duration) * this.renderer.stave.staveGroup.layout.renderer.scale | 0,bendHeight));
		}
	}
	,doLayout: function() {
		var _g = this;
		this.noteLoop(function(n) {
			_g.createNoteGlyphs(n);
		});
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,this.getBeatDurationWidth(this.beat.duration) * this.renderer.stave.staveGroup.layout.renderer.scale | 0));
		alphatab.rendering.glyphs.BeatGlyphBase.prototype.doLayout.call(this);
	}
	,__class__: alphatab.rendering.glyphs.TabBeatPostNotesGlyph
});
alphatab.rendering.glyphs.TabBeatPreNotesGlyph = function(b) {
	alphatab.rendering.glyphs.BeatGlyphBase.call(this,b);
};
alphatab.rendering.glyphs.TabBeatPreNotesGlyph.__name__ = true;
alphatab.rendering.glyphs.TabBeatPreNotesGlyph.__super__ = alphatab.rendering.glyphs.BeatGlyphBase;
alphatab.rendering.glyphs.TabBeatPreNotesGlyph.prototype = $extend(alphatab.rendering.glyphs.BeatGlyphBase.prototype,{
	__class__: alphatab.rendering.glyphs.TabBeatPreNotesGlyph
});
alphatab.rendering.glyphs.TabNoteChordGlyph = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._notes = new Array();
	this._noteLookup = new haxe.ds.IntMap();
};
alphatab.rendering.glyphs.TabNoteChordGlyph.__name__ = true;
alphatab.rendering.glyphs.TabNoteChordGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.TabNoteChordGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var old = canvas.getTextBaseline();
		canvas.setTextBaseline(alphatab.model.TextBaseline.Middle);
		var _g = 0, _g1 = this._notes;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.renderer = this.renderer;
			g.paint(cx + this.x,cy + this.y,canvas);
		}
		canvas.setTextBaseline(old);
	}
	,addNoteGlyph: function(noteGlyph,note) {
		this._notes.push(noteGlyph);
		this._noteLookup.set(note.string,noteGlyph);
	}
	,doLayout: function() {
		var w = 0;
		var _g = 0, _g1 = this._notes;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.renderer = this.renderer;
			g.doLayout();
			if(g.width > w) w = g.width;
		}
		this.width = w;
	}
	,getNoteY: function(note) {
		if(this._noteLookup.exists(note.string)) return this.y + this._noteLookup.get(note.string).y;
		return 0;
	}
	,getNoteX: function(note,onEnd) {
		if(onEnd == null) onEnd = true;
		if(this._noteLookup.exists(note.string)) {
			var n = this._noteLookup.get(note.string);
			var pos = this.x + n.x + (3 * this.renderer.stave.staveGroup.layout.renderer.scale | 0);
			if(onEnd) pos += n.width;
			return pos;
		}
		return 0;
	}
	,__class__: alphatab.rendering.glyphs.TabNoteChordGlyph
});
alphatab.rendering.glyphs.TabSlideLineGlyph = function(type,startNote) {
	alphatab.rendering.Glyph.call(this,0,0);
	this._type = type;
	this._startNote = startNote;
};
alphatab.rendering.glyphs.TabSlideLineGlyph.__name__ = true;
alphatab.rendering.glyphs.TabSlideLineGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.TabSlideLineGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var r = this.renderer;
		var sizeX = 12 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		var sizeY = 3 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		var startX;
		var startY;
		var endX;
		var endY;
		var _g = this;
		switch( (_g._type)[1] ) {
		case 1:
		case 2:
			var startOffsetY;
			var endOffsetY;
			if(this._startNote.slideTarget == null) {
				startOffsetY = 0;
				endOffsetY = 0;
			} else if(this._startNote.slideTarget.fret > this._startNote.fret) {
				startOffsetY = sizeY;
				endOffsetY = sizeY * -1;
			} else {
				startOffsetY = sizeY * -1;
				endOffsetY = sizeY;
			}
			startX = cx + r.getNoteX(this._startNote,true);
			startY = cy + r.getNoteY(this._startNote) + startOffsetY;
			if(this._startNote.slideTarget != null) {
				endX = cx + r.getNoteX(this._startNote.slideTarget,false);
				endY = cy + r.getNoteY(this._startNote.slideTarget) + endOffsetY;
			} else {
				endX = startX + sizeX;
				endY = startY;
			}
			break;
		case 3:
			endX = cx + r.getNoteX(this._startNote,false);
			endY = cy + r.getNoteY(this._startNote);
			startX = endX - sizeX;
			startY = cy + r.getNoteY(this._startNote) + sizeY;
			break;
		case 4:
			endX = cx + r.getNoteX(this._startNote,false);
			endY = cy + r.getNoteY(this._startNote);
			startX = endX - sizeX;
			startY = cy + r.getNoteY(this._startNote) - sizeY;
			break;
		case 5:
			startX = cx + r.getNoteX(this._startNote,true);
			startY = cy + r.getNoteY(this._startNote);
			endX = startX + sizeX;
			endY = cy + r.getNoteY(this._startNote) - sizeY;
			break;
		case 6:
			startX = cx + r.getNoteX(this._startNote,true);
			startY = cy + r.getNoteY(this._startNote);
			endX = startX + sizeX;
			endY = cy + r.getNoteY(this._startNote) + sizeY;
			break;
		default:
			return;
		}
		canvas.setColor(this.renderer.stave.staveGroup.layout.renderer.renderingResources.mainGlyphColor);
		canvas.beginPath();
		canvas.moveTo(startX,startY);
		canvas.lineTo(endX,endY);
		canvas.stroke();
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 0;
	}
	,__class__: alphatab.rendering.glyphs.TabSlideLineGlyph
});
alphatab.rendering.glyphs.TabTieGlyph = function(startNote,endNote) {
	alphatab.rendering.glyphs.TieGlyph.call(this,startNote,endNote);
};
alphatab.rendering.glyphs.TabTieGlyph.__name__ = true;
alphatab.rendering.glyphs.TabTieGlyph.__super__ = alphatab.rendering.glyphs.TieGlyph;
alphatab.rendering.glyphs.TabTieGlyph.prototype = $extend(alphatab.rendering.glyphs.TieGlyph.prototype,{
	paint: function(cx,cy,canvas) {
		var r = this.renderer;
		var res = r.stave.staveGroup.layout.renderer.renderingResources;
		var startX = cx + r.getNoteX(this._startNote);
		var endX = cx + r.getNoteX(this._endNote,false);
		var down = this._startNote.string > 3;
		var offset = res.tablatureFont.getSize() / 2;
		if(down) offset *= -1;
		var startY = cy + r.getNoteY(this._startNote) + offset;
		var endY = cy + r.getNoteY(this._endNote) + offset;
		alphatab.rendering.glyphs.TieGlyph.paintTie(canvas,this.renderer.stave.staveGroup.layout.renderer.scale,startX,startY,endX,endY,this._startNote.string > 3);
		canvas.setColor(this.renderer.stave.staveGroup.layout.renderer.renderingResources.mainGlyphColor);
		canvas.fill();
	}
	,__class__: alphatab.rendering.glyphs.TabTieGlyph
});
alphatab.rendering.glyphs.TimeSignatureGlyph = function(x,y,numerator,denominator) {
	alphatab.rendering.glyphs.GlyphGroup.call(this,x,y,new Array());
	this._numerator = numerator;
	this._denominator = denominator;
};
alphatab.rendering.glyphs.TimeSignatureGlyph.__name__ = true;
alphatab.rendering.glyphs.TimeSignatureGlyph.__super__ = alphatab.rendering.glyphs.GlyphGroup;
alphatab.rendering.glyphs.TimeSignatureGlyph.prototype = $extend(alphatab.rendering.glyphs.GlyphGroup.prototype,{
	doLayout: function() {
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
	,canScale: function() {
		return false;
	}
	,__class__: alphatab.rendering.glyphs.TimeSignatureGlyph
});
alphatab.rendering.glyphs.TremoloPickingGlyph = function(x,y,duration) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getSvg(duration),1,1);
};
alphatab.rendering.glyphs.TremoloPickingGlyph.__name__ = true;
alphatab.rendering.glyphs.TremoloPickingGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.TremoloPickingGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	getSvg: function(duration) {
		switch( (duration)[1] ) {
		case 5:
			return alphatab.rendering.glyphs.MusicFont.TremoloPickingThirtySecond;
		case 4:
			return alphatab.rendering.glyphs.MusicFont.TremoloPickingSixteenth;
		case 3:
			return alphatab.rendering.glyphs.MusicFont.TremoloPickingEighth;
		default:
			return "";
		}
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 12 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.TremoloPickingGlyph
});
if(!alphatab.rendering.glyphs.effects) alphatab.rendering.glyphs.effects = {}
alphatab.rendering.glyphs.effects.DummyEffectGlyph = function(x,y,s) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._s = s;
};
alphatab.rendering.glyphs.effects.DummyEffectGlyph.__name__ = true;
alphatab.rendering.glyphs.effects.DummyEffectGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.effects.DummyEffectGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.mainGlyphColor);
		canvas.strokeRect(cx + this.x,cy + this.y,this.width,20 * this.renderer.stave.staveGroup.layout.renderer.scale);
		canvas.setFont(res.tablatureFont);
		canvas.fillText(this._s,cx + this.x,cy + this.y);
	}
	,canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 20 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.effects.DummyEffectGlyph
});
alphatab.rendering.glyphs.effects.DynamicsGlyph = function(x,y,dynamics) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._dynamics = dynamics;
};
alphatab.rendering.glyphs.effects.DynamicsGlyph.__name__ = true;
alphatab.rendering.glyphs.effects.DynamicsGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.effects.DynamicsGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	f: function() {
		var f = new alphatab.rendering.glyphs.SvgGlyph(0,0,alphatab.rendering.glyphs.MusicFont.DynamicF,1,1);
		f.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		return f;
	}
	,m: function() {
		var m = new alphatab.rendering.glyphs.SvgGlyph(0,0,alphatab.rendering.glyphs.MusicFont.DynamicM,1,1);
		m.width = 10 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		return m;
	}
	,p: function() {
		var p = new alphatab.rendering.glyphs.SvgGlyph(0,0,alphatab.rendering.glyphs.MusicFont.DynamicP,1,1);
		p.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
		return p;
	}
	,paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(res.mainGlyphColor);
		var glyphs;
		var _g = this;
		switch( (_g._dynamics)[1] ) {
		case 0:
			glyphs = [this.p(),this.p(),this.p()];
			break;
		case 1:
			glyphs = [this.p(),this.p()];
			break;
		case 2:
			glyphs = [this.p()];
			break;
		case 3:
			glyphs = [this.m(),this.p()];
			break;
		case 4:
			glyphs = [this.m(),this.f()];
			break;
		case 5:
			glyphs = [this.f()];
			break;
		case 6:
			glyphs = [this.f(),this.f()];
			break;
		case 7:
			glyphs = [this.f(),this.f(),this.f()];
			break;
		}
		var glyphWidth = 0;
		var _g1 = 0;
		while(_g1 < glyphs.length) {
			var g = glyphs[_g1];
			++_g1;
			glyphWidth += g.width;
		}
		var startX = (this.width - glyphWidth) / 2 | 0;
		var _g1 = 0;
		while(_g1 < glyphs.length) {
			var g = glyphs[_g1];
			++_g1;
			g.x = startX;
			g.y = 0;
			g.renderer = this.renderer;
			g.paint(cx + this.x,cy + this.y,canvas);
			startX += g.width;
		}
	}
	,__class__: alphatab.rendering.glyphs.effects.DynamicsGlyph
});
alphatab.rendering.glyphs.effects.TextGlyph = function(x,y,text,font) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._text = text;
	this._font = font;
};
alphatab.rendering.glyphs.effects.TextGlyph.__name__ = true;
alphatab.rendering.glyphs.effects.TextGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.effects.TextGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setFont(this._font);
		canvas.setColor(res.mainGlyphColor);
		canvas.fillText(this._text,cx + this.x,cy + this.y);
	}
	,__class__: alphatab.rendering.glyphs.effects.TextGlyph
});
alphatab.rendering.glyphs.effects.VibratoGlyph = function(x,y,scale) {
	if(scale == null) scale = 0.9;
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._scale = scale;
};
alphatab.rendering.glyphs.effects.VibratoGlyph.__name__ = true;
alphatab.rendering.glyphs.effects.VibratoGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.effects.VibratoGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var step = 11 * this.renderer.stave.staveGroup.layout.renderer.scale * this._scale;
		var loops = Math.floor(Math.max(1,this.width / step));
		var loopX = 0;
		var _g = 0;
		while(_g < loops) {
			var i = _g++;
			var glyph = new alphatab.rendering.glyphs.SvgGlyph(loopX,0,alphatab.rendering.glyphs.MusicFont.WaveHorizontal,this._scale,this._scale);
			glyph.renderer = this.renderer;
			glyph.paint(cx + this.x,cy + this.y,canvas);
			loopX += Math.floor(step);
		}
	}
	,__class__: alphatab.rendering.glyphs.effects.VibratoGlyph
});
alphatab.rendering.layout.HeaderFooterElements = function() { }
alphatab.rendering.layout.HeaderFooterElements.__name__ = true;
if(!alphatab.rendering.staves) alphatab.rendering.staves = {}
alphatab.rendering.staves.BarSizeInfo = function() {
	this.sizes = new haxe.ds.StringMap();
};
alphatab.rendering.staves.BarSizeInfo.__name__ = true;
alphatab.rendering.staves.BarSizeInfo.prototype = {
	setIndexedSize: function(key,index,size) {
		if(!this.sizes.exists(key)) this.sizes.set(key,new Array());
		this.sizes.get(key)[index] = size;
	}
	,getIndexedSize: function(key,index) {
		if(this.sizes.exists(key) && index < this.sizes.get(key).length) return this.sizes.get(key)[index];
		return 0;
	}
	,getSize: function(key) {
		if(this.sizes.exists(key)) return this.sizes.get(key)[0];
		return 0;
	}
	,setSize: function(key,size) {
		this.sizes.set(key,[size]);
	}
	,__class__: alphatab.rendering.staves.BarSizeInfo
}
alphatab.rendering.staves.Stave = function(barRendererFactory) {
	this.barRenderers = new Array();
	this._factory = barRendererFactory;
	this.topSpacing = 10;
	this.bottomSpacing = 10;
	this.staveTop = 0;
	this.staveBottom = 0;
};
alphatab.rendering.staves.Stave.__name__ = true;
alphatab.rendering.staves.Stave.prototype = {
	paint: function(cx,cy,canvas) {
		if(this.height == 0) return;
		var _g = 0, _g1 = this.barRenderers;
		while(_g < _g1.length) {
			var r = _g1[_g];
			++_g;
			r.paint(cx + this.x,cy + this.y,canvas);
		}
	}
	,finalizeStave: function(layout) {
		var x = 0;
		this.height = 0;
		var topOverflow = this.getTopOverflow();
		var bottomOverflow = this.getBottomOverflow();
		var isEmpty = true;
		var _g1 = 0, _g = this.barRenderers.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.barRenderers[i].x = x;
			this.barRenderers[i].y = this.topSpacing + topOverflow;
			this.height = Math.max(this.height,this.barRenderers[i].height) | 0;
			this.barRenderers[i].finalizeRenderer(layout);
			x += this.barRenderers[i].width;
			if(!this.barRenderers[i].isEmpty) isEmpty = false;
		}
		if(!isEmpty) this.height += this.topSpacing + topOverflow + bottomOverflow + this.bottomSpacing; else this.height = 0;
	}
	,getBottomOverflow: function() {
		var m = 0;
		var _g = 0, _g1 = this.barRenderers;
		while(_g < _g1.length) {
			var r = _g1[_g];
			++_g;
			if(r.bottomOverflow > m) m = r.bottomOverflow;
		}
		return m;
	}
	,getTopOverflow: function() {
		var m = 0;
		var _g = 0, _g1 = this.barRenderers;
		while(_g < _g1.length) {
			var r = _g1[_g];
			++_g;
			if(r.topOverflow > m) m = r.topOverflow;
		}
		return m;
	}
	,applyBarSpacing: function(spacing) {
		var _g = 0, _g1 = this.barRenderers;
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			b.applyBarSpacing(spacing);
		}
	}
	,revertLastBar: function() {
		this.barRenderers.pop();
	}
	,addBar: function(bar) {
		var renderer = this._factory.create(bar);
		renderer.stave = this;
		renderer.index = this.barRenderers.length;
		renderer.doLayout();
		this.barRenderers.push(renderer);
	}
	,registerStaveBottom: function(offset) {
		this.staveBottom = offset;
	}
	,registerStaveTop: function(offset) {
		this.staveTop = offset;
	}
	,isInAccolade: function() {
		return this._factory.isInAccolade;
	}
	,__class__: alphatab.rendering.staves.Stave
}
alphatab.rendering.staves.StaveGroup = function() {
	this.bars = new Array();
	this.staves = new Array();
	this.width = 0;
};
alphatab.rendering.staves.StaveGroup.__name__ = true;
alphatab.rendering.staves.StaveGroup.prototype = {
	finalizeGroup: function(scoreLayout) {
		var currentY = 0;
		var _g1 = 0, _g = this.staves.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.staves[i].x = 0;
			this.staves[i].y = currentY | 0;
			this.staves[i].finalizeStave(scoreLayout);
			currentY += this.staves[i].height;
		}
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
			if(this._firstStaveInAccolade != null && this._lastStaveInAccolade != null) {
				var firstStart = cy + this.y + this._firstStaveInAccolade.y + this._firstStaveInAccolade.staveTop + this._firstStaveInAccolade.topSpacing + this._firstStaveInAccolade.getTopOverflow();
				var lastEnd = cy + this.y + this._lastStaveInAccolade.y + this._lastStaveInAccolade.topSpacing + this._lastStaveInAccolade.getTopOverflow() + this._lastStaveInAccolade.staveBottom;
				canvas.setColor(res.barSeperatorColor);
				canvas.beginPath();
				canvas.moveTo(cx + this.x + this._firstStaveInAccolade.x,firstStart);
				canvas.lineTo(cx + this.x + this._lastStaveInAccolade.x,lastEnd);
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
	,calculateHeight: function() {
		return this.staves[this.staves.length - 1].y + this.staves[this.staves.length - 1].height;
	}
	,addStave: function(stave) {
		stave.staveGroup = this;
		stave.index = this.staves.length;
		this.staves.push(stave);
		if(this._firstStaveInAccolade == null && stave._factory.isInAccolade) {
			this._firstStaveInAccolade = stave;
			stave.isFirstInAccolade = true;
		}
		if(stave._factory.isInAccolade) {
			if(this._lastStaveInAccolade != null) this._lastStaveInAccolade.isLastInAccolade = false;
			this._lastStaveInAccolade = stave;
			this._lastStaveInAccolade.isLastInAccolade = true;
		}
	}
	,addBar: function(bar) {
		this.bars.push(bar);
		var maxSizes = new alphatab.rendering.staves.BarSizeInfo();
		var _g = 0, _g1 = this.staves;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			s.addBar(bar);
			s.barRenderers[s.barRenderers.length - 1].registerMaxSizes(maxSizes);
		}
		var realWidth = 0;
		var _g = 0, _g1 = this.staves;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			s.barRenderers[s.barRenderers.length - 1].applySizes(maxSizes);
			if(s.barRenderers[s.barRenderers.length - 1].width > realWidth) realWidth = s.barRenderers[s.barRenderers.length - 1].width;
		}
		this.width += realWidth;
	}
	,getLastBarIndex: function() {
		return this.bars[this.bars.length - 1].index;
	}
	,__class__: alphatab.rendering.staves.StaveGroup
}
if(!alphatab.rendering.utils) alphatab.rendering.utils = {}
alphatab.rendering.utils.AccidentalHelper = function() {
	this._registeredAccidentals = new haxe.ds.IntMap();
};
alphatab.rendering.utils.AccidentalHelper.__name__ = true;
alphatab.rendering.utils.AccidentalHelper.prototype = {
	getKeySignatureIndex: function(ks) {
		return ks + 7;
	}
	,applyAccidental: function(note,noteLine) {
		var noteValue = note.realValue();
		var ks = note.beat.voice.bar.getMasterBar().keySignature;
		var ksi = ks + 7;
		var index = noteValue % 12;
		var octave = noteValue / 12 | 0;
		var accidentalToSet = alphatab.rendering.utils.AccidentalHelper.ACCIDENTAL_NOTES[ksi][index];
		if(this._registeredAccidentals.exists(noteLine)) {
			var registeredAccidental = this._registeredAccidentals.get(noteLine);
			if(registeredAccidental == accidentalToSet) accidentalToSet = alphatab.model.AccidentalType.None; else if(accidentalToSet == alphatab.model.AccidentalType.None) accidentalToSet = alphatab.model.AccidentalType.Natural;
		}
		if(accidentalToSet == alphatab.model.AccidentalType.None || accidentalToSet == alphatab.model.AccidentalType.Natural) this._registeredAccidentals.remove(noteLine); else this._registeredAccidentals.set(noteLine,accidentalToSet);
		return accidentalToSet;
	}
	,__class__: alphatab.rendering.utils.AccidentalHelper
}
alphatab.rendering.utils.BeamDirection = { __ename__ : true, __constructs__ : ["Up","Down"] }
alphatab.rendering.utils.BeamDirection.Up = ["Up",0];
alphatab.rendering.utils.BeamDirection.Up.toString = $estr;
alphatab.rendering.utils.BeamDirection.Up.__enum__ = alphatab.rendering.utils.BeamDirection;
alphatab.rendering.utils.BeamDirection.Down = ["Down",1];
alphatab.rendering.utils.BeamDirection.Down.toString = $estr;
alphatab.rendering.utils.BeamDirection.Down.__enum__ = alphatab.rendering.utils.BeamDirection;
alphatab.rendering.utils.BeamBarType = { __ename__ : true, __constructs__ : ["Full","PartLeft","PartRight"] }
alphatab.rendering.utils.BeamBarType.Full = ["Full",0];
alphatab.rendering.utils.BeamBarType.Full.toString = $estr;
alphatab.rendering.utils.BeamBarType.Full.__enum__ = alphatab.rendering.utils.BeamBarType;
alphatab.rendering.utils.BeamBarType.PartLeft = ["PartLeft",1];
alphatab.rendering.utils.BeamBarType.PartLeft.toString = $estr;
alphatab.rendering.utils.BeamBarType.PartLeft.__enum__ = alphatab.rendering.utils.BeamBarType;
alphatab.rendering.utils.BeamBarType.PartRight = ["PartRight",2];
alphatab.rendering.utils.BeamBarType.PartRight.toString = $estr;
alphatab.rendering.utils.BeamBarType.PartRight.__enum__ = alphatab.rendering.utils.BeamBarType;
alphatab.rendering.utils.BeamingHelper = function() {
	this.beats = new Array();
	this.valueCalculator = function(n) {
		return n.realValue();
	};
	this._beatLineXPositions = new haxe.ds.IntMap();
	this.maxDuration = alphatab.model.Duration.Whole;
};
alphatab.rendering.utils.BeamingHelper.__name__ = true;
alphatab.rendering.utils.BeamingHelper.canJoin = function(b1,b2) {
	if(b1 == null || b2 == null || b1.isRest() || b2.isRest()) return false;
	var m1 = b1.voice.bar;
	var m2 = b1.voice.bar;
	if(m1 != m2) return false;
	var start1 = b1.start;
	var start2 = b2.start;
	if(!alphatab.rendering.utils.BeamingHelper.canJoinDuration(b1.duration) || !alphatab.rendering.utils.BeamingHelper.canJoinDuration(b2.duration)) return start1 == start2;
	var divisionLength = 960;
	var _g = m1.track.score.masterBars[m1.index];
	switch(_g.timeSignatureDenominator) {
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
	calculateBeamY: function(stemSize,xCorrection,xPosition,scale,yPosition) {
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
		if(direction == alphatab.rendering.utils.BeamDirection.Down && startY > endY && startY - endY > maxDistance) endY = startY - maxDistance;
		if(direction == alphatab.rendering.utils.BeamDirection.Down && endY > startY && endY - startY > maxDistance) startY = endY - maxDistance;
		if(direction == alphatab.rendering.utils.BeamDirection.Up && startY < endY && endY - startY > maxDistance) endY = startY + maxDistance;
		if(direction == alphatab.rendering.utils.BeamDirection.Up && endY < startY && startY - endY > maxDistance) startY = endY + maxDistance;
		return (endY - startY) / (endX - startX) * (xPosition - startX) + startY | 0;
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
	,getDirection: function() {
		var avg = (this.valueCalculator(this.maxNote) + this.valueCalculator(this.minNote)) / 2 | 0;
		return avg <= alphatab.rendering.utils.BeamingHelper.SCORE_MIDDLE_KEYS[this._lastBeat.voice.bar.clef[1]]?alphatab.rendering.utils.BeamDirection.Up:alphatab.rendering.utils.BeamDirection.Down;
	}
	,registerBeatLineX: function(beat,up,down) {
		this._beatLineXPositions.set(beat.index,{ up : up, down : down});
	}
	,getBeatLineX: function(beat) {
		if(this._beatLineXPositions.exists(beat.index)) {
			if(this.getDirection() == alphatab.rendering.utils.BeamDirection.Up) return this._beatLineXPositions.get(beat.index).up; else return this._beatLineXPositions.get(beat.index).down;
		}
		return 0;
	}
	,__class__: alphatab.rendering.utils.BeamingHelper
}
alphatab.rendering.utils.SvgPathParser = function(svg) {
	this.svg = svg;
};
alphatab.rendering.utils.SvgPathParser.__name__ = true;
alphatab.rendering.utils.SvgPathParser.isNumber = function(s,allowSign) {
	if(allowSign == null) allowSign = true;
	if(s.length == 0) return false;
	var c = HxOverrides.cca(s,0);
	return allowSign && c == 45 || c >= 48 && c <= 57;
}
alphatab.rendering.utils.SvgPathParser.isWhiteSpace = function(s) {
	if(s.length == 0) return false;
	var c = s.charAt(0);
	return c == " " || c == "\t" || c == "\r" || c == "\n";
}
alphatab.rendering.utils.SvgPathParser.prototype = {
	nextToken: function() {
		var token = new StringBuf();
		var c;
		do c = this.nextChar(); while(!this.eof() && (alphatab.rendering.utils.SvgPathParser.isWhiteSpace(c) || c == ","));
		if(!this.eof()) {
			token.b += Std.string(c);
			if(alphatab.rendering.utils.SvgPathParser.isNumber(c)) {
				c = this.peekChar();
				while(!this.eof() && (alphatab.rendering.utils.SvgPathParser.isNumber(c,false) || c == ".")) {
					token.b += Std.string(this.nextChar());
					c = this.peekChar();
				}
			} else this.lastCommand = token.b;
		}
		this.currentToken = token.b;
	}
	,peekChar: function() {
		if(this.eof()) return "";
		return this.svg.charAt(this._currentIndex);
	}
	,nextChar: function() {
		if(this.eof()) return "";
		return this.svg.charAt(this._currentIndex++);
	}
	,currentTokenIsNumber: function() {
		return alphatab.rendering.utils.SvgPathParser.isNumber(this.currentToken);
	}
	,getNumber: function() {
		return Std.parseFloat(this.getString());
	}
	,getString: function() {
		var t = this.currentToken;
		this.nextToken();
		return t;
	}
	,eof: function() {
		return this._currentIndex >= this.svg.length;
	}
	,reset: function() {
		this._currentIndex = 0;
		this.nextToken();
	}
	,__class__: alphatab.rendering.utils.SvgPathParser
}
if(!alphatab.util) alphatab.util = {}
alphatab.util.LazyVar = function(loader) {
	this._loader = loader;
};
alphatab.util.LazyVar.__name__ = true;
alphatab.util.LazyVar.prototype = {
	getValue: function() {
		if(!this._loaded) {
			this._val = this._loader();
			this._loaded = true;
		}
		return this._val;
	}
	,__class__: alphatab.util.LazyVar
}
haxe.ds.IntMap = function() {
	this.h = { };
};
haxe.ds.IntMap.__name__ = true;
haxe.ds.IntMap.prototype = {
	iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i];
		}};
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key);
	}
	,get: function(key) {
		return this.h[key];
	}
	,set: function(key,value) {
		this.h[key] = value;
	}
	,__class__: haxe.ds.IntMap
}
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
haxe.io.Bytes.__name__ = true;
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
	toString: function() {
		return this.readString(0,this.length);
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
	,sub: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		return new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
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
	,__class__: haxe.io.Bytes
}
haxe.io.BytesBuffer = function() {
	this.b = new Array();
};
haxe.io.BytesBuffer.__name__ = true;
haxe.io.BytesBuffer.prototype = {
	getBytes: function() {
		var bytes = new haxe.io.Bytes(this.b.length,this.b);
		this.b = null;
		return bytes;
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
	,__class__: haxe.io.BytesBuffer
}
haxe.io.BytesInput = function(b,pos,len) {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
};
haxe.io.BytesInput.__name__ = true;
haxe.io.BytesInput.__super__ = haxe.io.Input;
haxe.io.BytesInput.prototype = $extend(haxe.io.Input.prototype,{
	readBytes: function(buf,pos,len) {
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
	,readByte: function() {
		if(this.len == 0) throw new haxe.io.Eof();
		this.len--;
		return this.b[this.pos++];
	}
	,__class__: haxe.io.BytesInput
});
haxe.io.Output = function() { }
haxe.io.Output.__name__ = true;
haxe.io.Output.prototype = {
	writeString: function(s) {
		var b = haxe.io.Bytes.ofString(s);
		this.writeFullBytes(b,0,b.length);
	}
	,writeFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.writeBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,flush: function() {
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
	,writeByte: function(c) {
		throw "Not implemented";
	}
	,__class__: haxe.io.Output
}
haxe.io.BytesOutput = function() {
	this.b = new haxe.io.BytesBuffer();
};
haxe.io.BytesOutput.__name__ = true;
haxe.io.BytesOutput.__super__ = haxe.io.Output;
haxe.io.BytesOutput.prototype = $extend(haxe.io.Output.prototype,{
	getBytes: function() {
		return this.b.getBytes();
	}
	,writeBytes: function(buf,pos,len) {
		this.b.addBytes(buf,pos,len);
		return len;
	}
	,writeByte: function(c) {
		this.b.b.push(c);
	}
	,__class__: haxe.io.BytesOutput
});
haxe.io.Eof = function() {
};
haxe.io.Eof.__name__ = true;
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
}
haxe.io.Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] }
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
if(!haxe.xml) haxe.xml = {}
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
var js = js || {}
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
alphatab.Environment.renderEngines = new haxe.ds.StringMap();
alphatab.Environment.fileLoaders = new haxe.ds.StringMap();
alphatab.Environment.layoutEngines = new haxe.ds.StringMap();
alphatab.Environment.staveFactories = new haxe.ds.StringMap();
alphatab.Environment.renderEngines.set("default",function(d) {
	return new alphatab.platform.js.Html5Canvas(d);
});
alphatab.Environment.renderEngines.set("html5",function(d) {
	return new alphatab.platform.js.Html5Canvas(d);
});
alphatab.Environment.renderEngines.set("svg",function(d) {
	return new alphatab.platform.svg.SvgCanvas();
});
alphatab.Environment.fileLoaders.set("default",function() {
	return new alphatab.platform.js.JsFileLoader();
});
alphatab.Environment.layoutEngines.set("default",function(r) {
	return new alphatab.rendering.layout.PageViewLayout(r);
});
alphatab.Environment.layoutEngines.set("page",function(r) {
	return new alphatab.rendering.layout.PageViewLayout(r);
});
alphatab.Environment.layoutEngines.set("horizontal",function(r) {
	return new alphatab.rendering.layout.HorizontalScreenLayout(r);
});
alphatab.Environment.staveFactories.set("marker",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.MarkerEffectInfo());
});
alphatab.Environment.staveFactories.set("triplet-feel",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.TripletFeelEffectInfo());
});
alphatab.Environment.staveFactories.set("tempo",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.TempoEffectInfo());
});
alphatab.Environment.staveFactories.set("text",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.TextEffectInfo());
});
alphatab.Environment.staveFactories.set("chords",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.ChordsEffectInfo());
});
alphatab.Environment.staveFactories.set("beat-vibrato",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.BeatVibratoEffectInfo());
});
alphatab.Environment.staveFactories.set("note-vibrato",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.NoteVibratoEffectInfo());
});
alphatab.Environment.staveFactories.set("score",function(l) {
	return new alphatab.rendering.ScoreBarRendererFactory();
});
alphatab.Environment.staveFactories.set("dynamics",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.DynamicsEffectInfo());
});
alphatab.Environment.staveFactories.set("tap",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.TapEffectInfo());
});
alphatab.Environment.staveFactories.set("fade-in",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.FadeInEffectInfo());
});
alphatab.Environment.staveFactories.set("let-ring",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.LetRingEffectInfo());
});
alphatab.Environment.staveFactories.set("palm-mute",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.PalmMuteEffectInfo());
});
alphatab.Environment.staveFactories.set("tab",function(l) {
	return new alphatab.rendering.TabBarRendererFactory();
});
alphatab.Environment.staveFactories.set("fingering",function(l) {
	return new alphatab.rendering.EffectBarRendererFactory(new alphatab.rendering.effects.FingeringEffectInfo());
});
alphatab.platform.model.Font.STYLE_PLAIN = 0;
alphatab.platform.model.Font.STYLE_BOLD = 1;
alphatab.platform.model.Font.STYLE_ITALIC = 2;
alphatab.rendering.layout.PageViewLayout.SCORE_INFOS = "scoreInfos";
alphatab.rendering.layout.PageViewLayout.PAGE_PADDING = [20,20,20,20];
alphatab.rendering.layout.PageViewLayout.WIDTH_ON_100 = 795;
alphatab.rendering.layout.PageViewLayout.GroupSpacing = 20;
alphatab.rendering.layout.HorizontalScreenLayout.PAGE_PADDING = [20,20,20,20];
alphatab.rendering.layout.HorizontalScreenLayout.GroupSpacing = 20;
alphatab.audio.MidiUtils.QUARTER_TIME = 960;
alphatab.importer.ScoreImporter.UNSUPPORTED_FORMAT = "unsupported file";
alphatab.importer.AlphaTexImporter.EOL = String.fromCharCode(0);
alphatab.importer.AlphaTexImporter.TRACK_CHANNELS = [0,1];
alphatab.importer.Gp3To5Importer.VERSION_STRING = "FICHIER GUITAR PRO ";
alphatab.importer.Gp3To5Importer.BEND_STEP = 25;
alphatab.importer.GpxFileSystem.HEADER_BCFS = "BCFS";
alphatab.importer.GpxFileSystem.HEADER_BCFZ = "BCFZ";
alphatab.importer.GpxFileSystem.SCORE_GPIF = "score.gpif";
alphatab.io.BitInput.BYTE_SIZE = 8;
alphatab.model.BendPoint.MAX_POSITION = 60;
alphatab.model.BendPoint.MAX_VALUE = 12;
alphatab.model.Note.FingeringUnknown = -2;
alphatab.model.Note.FingeringNoOrDead = -1;
alphatab.model.Note.FingeringThumb = 0;
alphatab.model.Note.FingeringIndexFinger = 1;
alphatab.model.Note.FingeringMiddleFinger = 2;
alphatab.model.Note.FingeringAnnularFinger = 3;
alphatab.model.Note.FingeringLittleFinger = 4;
alphatab.model.Tuning.TUNING_REGEX = new EReg("([a-g]b?)([0-9])","i");
alphatab.platform.svg.FontSizes.TIMES_NEW_ROMAN_11PT = [3,4,5,6,6,9,9,2,4,4,6,6,3,4,3,3,6,6,6,6,6,6,6,6,6,6,3,3,6,6,6,5,10,8,7,7,8,7,6,7,8,4,4,8,7,10,8,8,7,8,7,5,8,8,7,11,8,8,7,4,3,4,5,6,4,5,5,5,5,5,4,5,6,3,3,6,3,9,6,6,6,5,4,4,4,5,6,7,6,6,5,5,2,5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,4,6,6,6,6,2,5,4,8,4,6,6,0,8,6,4,6,3,3,4,5,5,4,4,3,3,6,8,8,8,5,8,8,8,8,8,8,11,7,7,7,7,7,4,4,4,4,8,8,8,8,8,8,8,6,8,8,8,8,8,8,6,5,5,5,5,5,5,5,8,5,5,5,5,5,3,3,3,3,6,6,6,6,6,6,6,6,6,5,5,5,5,6,6];
alphatab.platform.svg.FontSizes.ARIAL_11PT = [3,2,4,6,6,10,7,2,4,4,4,6,3,4,3,3,6,6,6,6,6,6,6,6,6,6,3,3,6,6,6,6,11,8,7,7,7,6,6,8,7,2,5,7,6,8,7,8,6,8,7,7,6,7,8,10,7,8,7,3,3,3,5,6,4,6,6,6,6,6,4,6,6,2,2,5,2,8,6,6,6,6,4,6,3,6,6,10,6,6,6,4,2,4,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,2,6,6,7,6,2,6,4,8,4,6,6,0,8,6,4,6,4,4,4,6,6,4,4,4,5,6,9,10,10,6,8,8,8,8,8,8,11,7,6,6,6,6,2,2,2,2,8,7,8,8,8,8,8,6,8,7,7,7,7,8,7,7,6,6,6,6,6,6,10,6,6,6,6,6,2,2,2,2,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6];
alphatab.platform.svg.FontSizes.CONTROL_CHARS = 32;
alphatab.rendering.GroupedBarRenderer.KEY_SIZE_PRE = "PRE";
alphatab.rendering.GroupedBarRenderer.KEY_SIZE_BEAT = "BEAT";
alphatab.rendering.GroupedBarRenderer.KEY_SIZE_POST = "POST";
alphatab.rendering.ScoreBarRenderer.STEPS_PER_OCTAVE = 7;
alphatab.rendering.ScoreBarRenderer.OCTAVE_STEPS = [32,30,26,38];
alphatab.rendering.ScoreBarRenderer.SHARP_NOTE_STEPS = [0,0,1,1,2,3,3,4,4,5,5,6];
alphatab.rendering.ScoreBarRenderer.FLAT_NOTE_STEPS = [0,1,1,2,2,3,4,4,5,5,6,6];
alphatab.rendering.ScoreBarRenderer.SHARP_KS_STEPS = [1,4,0,3,6,2,5];
alphatab.rendering.ScoreBarRenderer.FLAT_KS_STEPS = [5,2,6,3,7,4,8];
alphatab.rendering.ScoreBarRenderer.LineSpacing = 8;
alphatab.rendering.ScoreBarRenderer.NOTE_STEP_CORRECTION = 1;
alphatab.rendering.TabBarRenderer.LineSpacing = 10;
alphatab.rendering.glyphs.AccidentalGroupGlyph.NON_RESERVED = -3000;
alphatab.rendering.glyphs.DeadNoteHeadGlyph.noteHeadHeight = 9;
alphatab.rendering.glyphs.DiamondNoteHeadGlyph.noteHeadHeight = 9;
alphatab.rendering.glyphs.MusicFont.ClefF = "M 545 -801c -53 49 -80 109 -80 179c 0 33 4 66 12 99c 8 33 38 57 89 74c 51 16 125 31 220 43c 95 12 159 53 192 124c 16 37 24 99 24 186c 0 95 -43 168 -130 220c -86 51 -186 77 -297 77c -128 0 -229 -28 -303 -86c -91 -70 -136 -169 -136 -297c 0 -115 23 -234 71 -356c 47 -121 118 -234 213 -337c 70 -74 163 -129 279 -164c 115 -35 233 -52 353 -52c 45 0 83 1 114 3c 31 2 81 9 151 21c 243 45 444 175 601 390c 144 198 217 409 217 632c 0 41 -2 72 -6 93c -33 281 -219 582 -558 905c -272 260 -591 493 -954 700c -330 190 -527 274 -589 254l -18 -68c 95 -33 197 -78 306 -136c 109 -57 218 -124 325 -198c 276 -198 477 -384 601 -558c 152 -210 252 -471 297 -781c 20 -128 31 -210 31 -248s 0 -68 0 -93c 0 -322 -109 -551 -328 -688c -99 -57 -200 -86 -303 -86c -78 0 -154 15 -226 46C 643 -873 586 -838 545 -801zM 2517 -783c 66 0 121 22 167 68c 45 45 68 101 68 167c 0 66 -22 121 -68 167c -45 45 -101 68 -167 68c -66 0 -122 -22 -167 -68c -45 -45 -68 -101 -68 -167c 0 -66 22 -121 68 -167C 2395 -760 2451 -783 2517 -783zM 2517 54c 66 0 121 22 167 68c 45 45 68 101 68 167c 0 66 -22 121 -68 167c -45 45 -101 68 -167 68c -66 0 -122 -22 -167 -68c -45 -45 -68 -101 -68 -167c 0 -66 22 -121 68 -167C 2395 77 2451 54 2517 54";
alphatab.rendering.glyphs.MusicFont.ClefC = "M 26 1736V -1924h 458v 3659H 26zM 641 1736V -1924h 150v 3659H 641zM 1099 153c -42 -53 -86 -100 -130 -140c -44 -40 -95 -75 -153 -106c 106 -58 200 -135 279 -233c 110 -135 180 -289 208 -460c 17 127 46 216 87 266c 65 73 170 110 313 110c 150 0 259 -81 324 -244c 50 -124 75 -291 75 -500c 0 -197 -25 -355 -75 -471c -69 -155 -179 -232 -330 -232c -89 0 -167 18 -234 55c -67 36 -101 72 -101 107c 0 19 23 25 69 17c 46 -7 97 6 153 43c 56 36 84 89 84 159c 0 69 -23 125 -69 168c -46 42 -108 63 -185 63c -73 0 -138 -24 -194 -72c -56 -48 -84 -105 -84 -171c 0 -112 56 -212 168 -301c 127 -100 282 -150 463 -150c 228 0 412 74 553 224c 141 149 211 334 211 555c 0 248 -86 458 -258 631c -172 172 -381 259 -629 259c -57 0 -104 -3 -139 -11c -54 -19 -98 -34 -133 -46c -15 49 -48 99 -98 149c -11 15 -48 43 -110 85c 38 19 75 52 110 99c 50 50 88 105 115 164c 65 -31 113 -50 142 -57c 28 -7 70 -11 124 -11c 247 0 457 85 629 257c 172 171 258 380 258 627c 0 211 -73 390 -219 534c -146 144 -332 216 -558 216c -183 0 -334 -47 -453 -142c -118 -94 -178 -198 -178 -310c 0 -69 28 -128 84 -176c 56 -48 120 -72 194 -72c 69 0 129 23 179 69c 50 46 75 104 75 174c 0 65 -28 116 -84 153c -56 36 -107 51 -153 43c -46 -7 -69 0 -69 23c 0 27 35 60 106 101c 70 40 147 60 229 60c 153 0 265 -77 335 -231c 51 -112 76 -268 76 -469c 0 -201 -25 -363 -75 -487c -65 -166 -172 -249 -319 -249c -143 0 -242 30 -298 92c -56 61 -93 156 -113 284C 1279 435 1211 286 1099 153";
alphatab.rendering.glyphs.MusicFont.RestThirtySecond = "M 717 -2195c 93 -30 174 -104 244 -220c 38 -65 65 -127 81 -185l 140 -604c -69 128 -196 191 -381 191c -50 0 -105 -7 -167 -23c -61 -15 -113 -46 -155 -92c -42 -46 -63 -108 -63 -185c 0 -65 23 -121 69 -168s 104 -69 173 -69c 65 0 123 25 173 75c 50 50 75 104 75 162c 0 31 -7 63 -23 98c -15 34 -44 63 -86 87c 23 11 48 21 75 28c 7 0 27 -3 57 -11c 73 -23 142 -80 208 -170c 57 -90 115 -180 173 -270h 40l -816 3503l -107 0l 318 -1316c -73 128 -196 192 -369 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -104 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -86 87c 46 15 71 23 74 23c 7 0 26 -3 57 -11c 92 -27 178 -108 259 -243c 11 -19 26 -50 46 -93l 161 -667c -73 128 -198 192 -375 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174s 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98s -44 65 -86 92c 23 7 46 15 69 23C 665 -2184 686 -2187 717 -2195";
alphatab.rendering.glyphs.MusicFont.RestQuarter = "M 272 -1668L 979 -850c -54 23 -137 114 -249 272c -127 177 -191 313 -191 405c 0 112 36 226 110 342c 73 115 160 206 260 272l -34 81c -23 -3 -56 -7 -101 -11c -44 -3 -76 -5 -95 -5c -104 0 -182 9 -234 28c -52 19 -88 45 -110 78c -21 32 -31 70 -31 113c 0 81 42 175 127 284c 69 88 115 137 139 145l -28 46c -27 7 -123 -61 -289 -208c -185 -162 -278 -299 -278 -411c 0 -92 35 -168 107 -226c 71 -57 159 -87 263 -87c 54 0 109 7 165 23c 55 15 110 42 165 81l -642 -829c 54 -30 120 -107 199 -229c 79 -121 139 -238 182 -350c 7 -15 11 -42 11 -81c 0 -92 -44 -210 -133 -353c -73 -115 -121 -181 -144 -197H 272";
alphatab.rendering.glyphs.MusicFont.GraceUp = "M 571 -1659h 53c 12 83 29 154 50 210c 21 56 46 105 74 145c 28 40 71 92 128 156c 56 63 102 118 138 162c 105 135 158 277 158 424c 0 151 -64 336 -193 554h -35c 16 -37 35 -82 57 -132s 40 -95 55 -136s 26 -81 35 -121s 12 -80 12 -119c 0 -62 -12 -125 -38 -188c -25 -63 -60 -121 -106 -175c -45 -53 -97 -97 -155 -130s -118 -51 -181 -55v 1245c 0 70 -21 134 -65 189c -43 55 -99 97 -167 127c -67 29 -135 44 -201 44c -64 0 -118 -16 -160 -48c -42 -32 -63 -79 -63 -140c 0 -65 21 -126 64 -181s 97 -99 163 -131c 65 -32 129 -48 191 -48c 85 0 147 16 184 50V -1082V -1659";
alphatab.rendering.glyphs.MusicFont.GraceDown = "M -17 335c 0 -69 23 -131 69 -186s 103 -98 173 -128c 69 -30 137 -45 203 -45c 133 0 203 63 211 189c 0 54 -21 110 -65 167c -43 56 -99 103 -168 139s -138 54 -208 54c -63 0 -118 -14 -164 -44v 1104c 90 -15 172 -50 244 -106s 128 -122 168 -200c 40 -78 60 -156 60 -233c -1 -91 -13 -169 -34 -233c -20 -64 -57 -155 -110 -272l 34 -13c 34 60 64 122 91 188c 27 65 48 131 64 199s 23 133 23 198c 0 96 -22 183 -68 259c -45 76 -113 166 -203 269c -89 103 -157 193 -203 271c -45 77 -68 165 -68 264h -50V 335";
alphatab.rendering.glyphs.MusicFont.Trill = "M 159 862l 148 -431h -291l 33 -97h 288l 61 -196l 190 -136h 56l -114 332c 40 0 100 -7 181 -22c 81 -15 143 -22 187 -22c 26 0 45 5 56 15c 11 10 16 29 16 57c 0 8 -3 37 -11 86c 72 -106 155 -160 246 -160c 72 8 110 50 114 126c 0 42 -9 73 -28 92s -40 28 -64 28c -48 0 -76 -29 -84 -87c 10 -22 16 -43 16 -64c 0 -11 -9 -17 -28 -17c -78 0 -147 86 -207 260l -131 406h -185l 34 -92c -21 9 -53 26 -94 51s -77 44 -108 58s -64 20 -100 20c -50 0 -95 -13 -133 -40c -38 -27 -59 -63 -61 -107c 1 -7 3 -18 5 -32S 157 867 159 862zM 658 837l 140 -412c 0 -4 0 -9 2 -16s 2 -10 2 -11c 0 -9 -7 -13 -22 -13c -34 0 -81 7 -140 21s -104 21 -136 21l -142 423c -6 23 -12 44 -17 64c 0 27 16 44 50 50C 444 958 532 916 658 837";
alphatab.rendering.glyphs.MusicFont.ClefG = "M 1431 -3070c 95 0 186 114 272 344c 86 229 129 434 129 612c 0 243 -36 471 -108 684c -103 300 -271 545 -504 735l 108 564c 68 -15 132 -22 193 -22c 284 0 504 109 659 329c 132 185 199 410 199 675c 0 204 -65 379 -195 525c -130 145 -299 243 -506 292l 154 816c 0 45 0 77 0 96c 0 152 -54 282 -162 390s -244 181 -407 219c -26 7 -62 11 -108 11c -155 0 -294 -62 -416 -188c -121 -125 -182 -252 -182 -381c 0 -22 1 -39 5 -51c 18 -106 64 -191 136 -253c 72 -62 161 -94 267 -94c 102 0 191 34 267 102c 76 68 113 152 113 250c 0 106 -35 198 -105 276c -70 77 -160 116 -270 116c -26 0 -45 0 -56 0c 42 36 82 63 120 82c 72 36 143 54 212 54c 114 0 235 -62 362 -187c 94 -98 142 -214 142 -347c 0 -19 -1 -55 -3 -108l -138 -776c -49 11 -104 19 -165 23c -61 3 -123 5 -188 5c -339 0 -635 -123 -886 -370c -251 -247 -377 -543 -377 -889c 0 -193 87 -429 262 -706c 117 -189 285 -402 501 -638c 159 -174 254 -271 285 -290c -19 -37 -44 -142 -77 -313c -32 -171 -52 -284 -59 -339c -7 -55 -11 -111 -11 -168c 0 -235 54 -475 163 -718C 1164 -2948 1289 -3070 1431 -3070zM 1247 -129l -96 -507c -41 30 -116 104 -222 222c -106 117 -190 216 -251 296c -110 140 -194 269 -251 387c -76 155 -114 307 -114 455c 0 79 11 159 34 239c 49 167 182 326 400 478c 175 121 360 182 554 182c 53 0 96 -3 127 -11c 30 -7 80 -23 150 -46l -281 -1343c -178 22 -312 106 -403 250c -72 113 -107 237 -107 370c 0 144 80 281 240 410c 137 110 248 165 332 165l -8 39c -106 -15 -227 -70 -364 -164c -186 -132 -298 -291 -336 -477c -11 -56 -17 -111 -17 -164c 0 -185 56 -351 168 -496C 911 12 1060 -83 1247 -129zM 1684 -2306c -19 -125 -34 -201 -46 -227c -34 -76 -92 -113 -172 -113c -76 0 -157 82 -241 247c -84 165 -143 344 -178 538c -7 49 -1 156 17 322c 19 165 36 272 52 322l 132 -113c 91 -45 197 -176 315 -393c 88 -159 132 -313 132 -461C 1695 -2213 1692 -2253 1684 -2306zM 1388 225l 262 1304c 157 -37 282 -114 375 -229c 92 -115 138 -250 138 -405c 0 -30 0 -52 0 -68c -19 -177 -93 -322 -224 -433c -130 -111 -281 -167 -453 -167C 1443 225 1411 225 1388 225";
alphatab.rendering.glyphs.MusicFont.Num0 = "M 0 991c 0 -230 45 -422 135 -577c 104 -183 253 -275 448 -275c 187 0 333 91 437 275c 89 158 135 351 135 577c 0 230 -43 422 -129 577c -104 183 -252 275 -442 275c -187 0 -334 -91 -442 -275C 46 1411 0 1218 0 991zM 583 230c -100 0 -168 72 -202 218c -34 145 -51 326 -51 542c 0 270 23 464 70 583c 46 118 108 178 183 178c 93 0 162 -88 205 -264c 32 -133 48 -298 48 -496c 0 -273 -23 -468 -70 -585C 719 288 658 230 583 230";
alphatab.rendering.glyphs.MusicFont.Num1 = "M 345 1688V 440l -216 410l -37 -32l 253 -685h 351v 1549c 0 32 27 57 81 75c 18 3 46 8 86 16v 75h -685v -70c 35 -7 62 -12 81 -16C 316 1745 345 1720 345 1688";
alphatab.rendering.glyphs.MusicFont.Num2 = "M 427 257c -93 10 -153 37 -178 81c 7 14 14 27 21 37c 68 0 115 7 140 21c 54 28 81 86 81 172c 0 61 -21 113 -64 156s -93 64 -151 64c -61 0 -113 -19 -156 -59c -43 -39 -64 -91 -64 -156c 0 -118 50 -221 151 -307c 100 -86 214 -129 340 -129c 169 0 311 36 426 108c 136 86 205 203 205 351c 0 129 -78 244 -236 345c -132 75 -263 153 -391 232c -78 61 -146 129 -204 205c -25 35 -50 73 -75 113c 110 -64 211 -97 300 -97c 64 0 130 18 198 54c 39 18 87 52 145 102c 46 39 82 59 107 59c 82 0 137 -35 166 -105c 7 -21 12 -57 16 -110h 43c 0 120 -18 216 -54 288c -54 106 -147 160 -280 160c -100 0 -206 -37 -315 -110c -109 -73 -200 -110 -272 -110c -108 0 -178 27 -210 81c -14 64 -23 102 -27 113h -70c 3 -36 8 -70 16 -102c 7 -32 27 -79 59 -140c 46 -93 151 -221 313 -383c 313 -313 469 -505 469 -577C 876 376 726 257 427 257";
alphatab.rendering.glyphs.MusicFont.Num3 = "M 414 1024v -59c 21 0 47 -5 76 -16c 113 -39 193 -77 240 -113c 72 -57 109 -129 109 -216c 0 -111 -35 -204 -106 -278c -70 -73 -149 -110 -237 -110c -112 0 -194 32 -245 97c 3 18 8 34 16 48c 72 0 120 16 145 48c 25 32 37 75 37 129c 0 118 -66 178 -199 178c -57 0 -102 -16 -135 -48c -32 -32 -48 -84 -48 -156c 0 -126 44 -223 132 -291c 88 -68 231 -102 429 -102c 133 0 251 47 353 143c 102 95 153 211 153 348c 0 100 -21 177 -64 229c -43 52 -111 98 -205 137c 86 35 149 77 189 124c 54 64 81 147 81 248c 0 133 -51 247 -153 342c -102 95 -220 143 -353 143c -194 0 -336 -34 -426 -102c -90 -68 -135 -165 -135 -291c 0 -75 15 -128 45 -159c 30 -30 78 -45 143 -45c 129 0 194 59 194 178c 0 57 -12 101 -37 132c -25 30 -75 45 -151 45c 3 21 8 45 16 70c 61 46 135 70 221 70c 82 0 160 -36 232 -108c 72 -72 108 -163 108 -275c 0 -82 -36 -153 -108 -210c -54 -43 -135 -82 -243 -118L 414 1024";
alphatab.rendering.glyphs.MusicFont.Num4 = "M 897 133c -86 147 -174 296 -264 445c -90 149 -162 258 -216 326l -302 469h 448v -556l 378 -318v 874h 162v 75h -162c 0 39 0 81 2 124c 1 43 6 78 13 105c 7 27 39 53 97 78c 7 3 23 8 48 16v 75h -712v -75c 32 -10 55 -18 70 -21c 54 -21 82 -43 86 -64c 3 -18 6 -51 8 -99c 1 -48 4 -94 8 -137h -588v -75c 158 -111 279 -288 361 -529c 43 -237 88 -475 135 -712H 897";
alphatab.rendering.glyphs.MusicFont.Num5 = "M 122 133c 10 7 63 18 159 35c 95 16 177 24 245 24c 89 0 171 -5 245 -16c 73 -10 139 -23 197 -37c 0 61 -8 112 -24 153c -16 41 -47 78 -94 110c -21 14 -62 27 -121 37c -59 10 -112 16 -159 16c -72 0 -145 -5 -221 -16c -75 -10 -117 -21 -124 -32v 475c 93 -104 197 -156 313 -156c 158 0 286 43 383 130c 97 86 145 198 145 336c 0 173 -61 325 -183 455c -122 130 -266 195 -432 195c -39 0 -68 -1 -86 -5c -86 -14 -154 -43 -205 -86c -72 -61 -108 -156 -108 -286c 0 -61 16 -109 48 -145c 32 -36 82 -54 151 -54c 136 0 205 64 205 194c 0 108 -43 169 -129 183c -25 10 -50 23 -75 37c 32 32 68 54 108 67c 39 12 79 18 118 18c 93 0 170 -45 232 -135c 61 -90 91 -219 91 -385c 0 -112 -27 -209 -81 -290c -54 -81 -127 -122 -221 -122c -118 0 -210 54 -275 162h -102V 133";
alphatab.rendering.glyphs.MusicFont.Num6 = "M 871 305c -7 -11 -12 -22 -16 -34c -57 -52 -118 -79 -183 -79c -32 0 -63 7 -91 21c -64 36 -114 110 -148 224c -34 113 -51 227 -51 342c 0 165 19 253 59 264c 75 -108 185 -162 332 -162c 110 0 201 52 273 156c 60 89 91 190 91 302c 0 154 -47 278 -143 369c -95 91 -213 137 -353 137c -190 0 -341 -89 -450 -267c -109 -178 -164 -382 -164 -612c 0 -208 64 -399 194 -572c 129 -172 279 -259 448 -259c 158 0 273 49 345 147c 50 69 75 148 75 239c 0 54 -19 103 -59 147c -39 43 -79 65 -118 65c -68 0 -122 -16 -162 -48c -39 -32 -59 -86 -59 -162c 0 -68 21 -121 64 -159C 795 330 835 309 871 305zM 849 1391c 0 -129 -9 -221 -27 -275c -32 -93 -91 -140 -178 -140c -82 0 -137 38 -164 116c -27 77 -40 177 -40 299c 0 108 14 199 43 275c 28 75 82 113 162 113c 72 0 124 -39 156 -118C 833 1582 849 1492 849 1391";
alphatab.rendering.glyphs.MusicFont.Num7 = "M 313 1850c 10 -86 23 -172 37 -259c 43 -172 118 -313 226 -421c 122 -118 217 -221 286 -307c 90 -111 142 -201 156 -270l 27 -124c -46 30 -96 56 -148 79c -52 22 -103 34 -153 34c -93 0 -206 -40 -340 -122c -64 -40 -120 -61 -167 -61c -57 0 -98 17 -121 51c -23 34 -42 65 -56 94h -64v -356h 54c 7 21 16 44 27 67c 10 23 30 35 59 35c 25 0 62 -16 113 -48c 108 -72 185 -108 232 -108c 75 0 149 26 221 78c 72 52 140 78 205 78c 46 0 82 -22 108 -67c 10 -18 19 -48 27 -89h 70v 340c 0 107 -17 206 -52 295c -10 25 -87 159 -231 403c -35 64 -60 142 -76 234c -15 91 -23 178 -23 260c 0 114 0 175 0 182H 313";
alphatab.rendering.glyphs.MusicFont.Num8 = "M 795 905c 57 18 126 77 205 178c 64 79 97 151 97 216c 0 183 -57 324 -172 421c -97 82 -214 124 -351 124c -151 0 -276 -49 -375 -148c -99 -99 -148 -231 -148 -396c 0 -68 34 -138 102 -210c 50 -54 106 -93 167 -118c -72 -39 -127 -94 -167 -164c -39 -70 -59 -144 -59 -224c 0 -136 48 -244 145 -324c 97 -79 208 -118 334 -118c 133 0 245 40 337 121s 137 195 137 342c 0 57 -32 120 -97 189C 901 845 849 883 795 905zM 389 1040c -57 28 -102 61 -135 97c -46 54 -70 118 -70 194c 0 108 35 204 106 288c 71 84 165 126 282 126c 106 0 185 -24 238 -72s 79 -103 79 -164c 0 -39 -26 -88 -80 -145c -53 -57 -112 -106 -176 -145c -64 -39 -124 -81 -179 -124C 437 1079 415 1061 389 1040zM 708 835c 46 -18 89 -53 126 -105c 37 -52 56 -107 56 -164c 0 -100 -28 -183 -86 -248c -57 -64 -136 -97 -237 -97c -79 0 -145 26 -197 78c -52 52 -78 112 -78 180c 0 36 25 75 75 118c 25 21 72 54 143 97c 70 43 121 77 153 102C 676 808 690 820 708 835";
alphatab.rendering.glyphs.MusicFont.Num9 = "M 333 1682c 3 10 9 21 16 32c 57 50 118 75 183 75c 32 0 62 -7 91 -21c 68 -36 117 -107 148 -213c 30 -106 45 -222 45 -348c 0 -169 -18 -259 -54 -270c -75 111 -185 167 -329 167c -111 0 -200 -48 -267 -146c -66 -97 -99 -202 -99 -315c 0 -155 47 -279 143 -372c 95 -92 215 -138 359 -138c 190 0 343 93 459 280c 100 165 151 365 151 599c 0 208 -64 399 -194 572s -279 259 -448 259c -158 0 -273 -48 -345 -145c -50 -68 -75 -147 -75 -237c 0 -54 19 -102 59 -145c 39 -43 86 -64 140 -64c 61 0 109 16 145 48c 35 32 54 86 54 162c 0 68 -25 124 -75 167C 405 1661 369 1679 333 1682zM 354 594c 0 130 8 222 27 277c 32 94 89 141 172 141c 82 0 138 -40 167 -122c 28 -81 43 -180 43 -296c 0 -112 -12 -199 -37 -261c -36 -86 -93 -130 -172 -130c -75 0 -127 38 -156 114C 369 393 354 486 354 594";
alphatab.rendering.glyphs.MusicFont.RestSixteenth = "M 494 -1275c 76 -27 149 -91 218 -191c 23 -31 51 -81 86 -151l 161 -667c -73 128 -198 192 -374 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174s 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98s -44 65 -86 92c 19 7 40 15 63 23c 15 0 38 -5 69 -17c 73 -23 140 -79 202 -167c 61 -88 121 -177 179 -267h 40l -602 2586l -106 0l 318 -1316c -73 128 -196 192 -369 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -104 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -86 87c 45 15 72 23 80 23C 465 -1269 482 -1271 494 -1275";
alphatab.rendering.glyphs.MusicFont.RestEighth = "M 247 -1725c 65 0 123 25 173 75c 50 50 75 104 75 162c 0 27 -9 60 -28 98c -19 38 -48 69 -86 92c 23 7 46 15 69 23c 15 0 38 -5 69 -17c 88 -31 175 -113 260 -246c 38 -62 77 -125 115 -188h 40l -382 1670l -112 0l 331 -1316c -73 128 -198 191 -375 191c -19 0 -38 0 -57 0c -27 -3 -69 -13 -127 -28c -57 -15 -106 -46 -147 -92c -40 -46 -60 -106 -60 -179c 0 -69 23 -127 69 -174S 178 -1725 247 -1725";
alphatab.rendering.glyphs.MusicFont.RestWhole = "M 1046 445H -25v -458h 1071V 445";
alphatab.rendering.glyphs.MusicFont.NoteWhole = "M 0 437c 0 -109 40 -197 121 -265s 177 -115 290 -143s 216 -41 312 -41c 104 0 213 13 328 41s 214 74 298 141s 128 156 133 266c 0 110 -40 199 -121 268s -177 117 -290 145s -219 43 -319 43c -107 0 -218 -13 -332 -41s -211 -75 -293 -144S 2 550 0 437zM 450 361c 7 133 46 243 118 330s 158 130 259 130c 77 -8 131 -34 161 -77s 44 -117 44 -224c -10 -137 -51 -248 -123 -333s -159 -127 -262 -127c -72 11 -123 37 -152 78S 450 253 450 361";
alphatab.rendering.glyphs.MusicFont.NoteQuarter = "M 658 800c -108 65 -216 98 -324 98c -119 0 -216 -42 -289 -127c -54 -57 -81 -129 -81 -214c 0 -92 29 -183 89 -272c 59 -88 136 -158 228 -208c 111 -69 223 -104 335 -104c 108 0 200 36 278 110c 57 57 86 131 86 220c 0 92 -31 185 -92 278C 827 673 750 746 658 800";
alphatab.rendering.glyphs.MusicFont.NoteHalf = "M 669 818c -108 65 -216 98 -324 98c -119 0 -216 -42 -290 -127c -54 -57 -81 -129 -81 -214c 0 -92 29 -183 89 -272c 59 -88 136 -158 229 -208c 112 -69 224 -104 336 -104c 108 0 200 36 278 110c 57 57 87 131 87 220c 0 92 -31 185 -92 278C 839 691 762 764 669 818zM 95 754c 19 23 57 34 115 34c 65 0 132 -13 200 -40c 67 -27 134 -64 200 -113c 65 -48 127 -118 185 -208s 87 -169 87 -234c 0 -23 -5 -44 -17 -63c -11 -15 -34 -23 -69 -23c -46 0 -113 18 -200 55c -87 36 -164 77 -231 121c -67 44 -133 110 -197 197s -95 159 -95 217C 72 720 79 739 95 754";
alphatab.rendering.glyphs.MusicFont.NoteDead = "M 482 345c 42 -15 70 -38 84 -69c 13 -30 20 -102 20 -214c 0 -30 0 -50 0 -57c 0 -3 0 -7 0 -11h 307v 313c -31 0 -54 0 -69 0c -38 0 -77 1 -115 2c -38 2 -72 8 -101 20c -28 11 -51 38 -66 81v 81c 15 42 38 70 69 84c 30 13 102 20 214 20c 30 0 50 0 57 0c 3 0 7 0 11 0v 313h -307c 0 -31 0 -54 0 -69c 0 -38 -1 -77 -2 -115c -2 -38 -8 -72 -20 -101c -11 -28 -38 -51 -81 -66h -104c -42 15 -70 38 -84 69c -13 30 -20 102 -20 214c 0 30 0 50 0 57c 0 3 0 7 0 11h -307V 595c 30 0 54 0 69 0c 38 0 77 -1 115 -2c 38 -2 72 -8 101 -20c 28 -11 51 -38 66 -81v -81c -15 -42 -38 -70 -69 -84c -31 -13 -102 -20 -214 -20c -31 0 -50 0 -57 0c -3 0 -7 0 -11 0v -313h 307c 0 31 0 54 0 69c 0 38 0 77 2 115c 1 38 8 72 20 101c 11 28 38 51 81 66H 482";
alphatab.rendering.glyphs.MusicFont.NoteHarmonic = "M -34 453l 452 -452c 108 131 197 220 266 266l 261 202l -446 452c -38 -46 -81 -90 -127 -133c -46 -42 -90 -85 -133 -127c -42 -42 -98 -89 -168 -139C 32 496 -3 472 -34 453";
alphatab.rendering.glyphs.MusicFont.NoteRideCymbal = "M 910 417l -441 433c -42 -77 -103 -156 -183 -237c -103 -104 -206 -181 -309 -231l 435 -428c 49 78 128 166 235 263C 753 315 841 382 910 417zM 469 746l 336 -329c -50 -31 -119 -87 -206 -168c -87 -81 -150 -149 -188 -203l -330 337c 81 42 160 102 237 179C 384 627 434 688 469 746";
alphatab.rendering.glyphs.MusicFont.NoteHiHat = "M 934 446c 0 129 -44 238 -133 326c -88 88 -197 133 -326 133c -131 0 -242 -43 -332 -131s -134 -197 -134 -328c 0 -129 45 -238 134 -328c 89 -89 200 -134 332 -134c 129 0 238 44 326 133C 889 204 934 314 934 446zM 162 723L 438 450l -279 -281c -70 75 -105 167 -105 275C 52 550 89 643 162 723zM 193 138l 274 276l 276 -280c -77 -73 -167 -110 -271 -110C 365 24 272 62 193 138zM 744 757l -276 -272l -272 270c 83 72 176 108 278 108c 53 0 101 -8 143 -26C 658 819 701 793 744 757zM 778 165l -281 284l 277 273c 76 -76 114 -169 114 -279C 888 337 852 244 778 165";
alphatab.rendering.glyphs.MusicFont.Unused = "M 425 25C 293 25 183 72 93 162C 3 252 -41 362 -41 493C -41 624 3 734 93 825C 183 915 293 962 425 962C 556 962 669 915 759 825C 849 734 893 624 893 493C 893 362 849 252 759 162C 669 72 556 25 425 25zM 425 75C 531 75 625 111 703 181L 115 768C 45 690 6 600 6 493C 6 378 49 282 131 200C 213 118 310 75 425 75zM 737 215C 808 294 843 386 843 493C 843 608 803 705 721 787C 639 869 539 912 425 912C 317 912 225 875 146 803L 737 215z";
alphatab.rendering.glyphs.MusicFont.NoteChineseCymbal = "M 503 -450l 577 579l -64 66l -516 -514l -512 512l -68 -64L 503 -450zM 499 601l 316 314l 145 -143l -314 -316l 316 -312l -141 -141l -317 319l -317 -323l -136 136l 319 319l -326 326l 140 140L 499 601";
alphatab.rendering.glyphs.MusicFont.FooterEighth = "M 9 1032V -9h 87c 20 137 48 252 83 345s 75 172 122 238s 116 151 209 255s 168 193 225 265c 172 221 259 453 259 695c 0 248 -105 550 -317 907h -57c 27 -62 58 -134 94 -216s 65 -156 90 -223s 43 -133 57 -199s 21 -131 21 -196c 0 -102 -20 -204 -62 -308s -99 -199 -174 -287s -159 -159 -254 -213s -194 -84 -296 -90v 68H 9";
alphatab.rendering.glyphs.MusicFont.FooterSixteenth = "M 943 1912c 62 135 94 280 94 435c 0 202 -61 404 -183 605h -57c 108 -233 162 -430 162 -590c 0 -117 -26 -220 -78 -309c -52 -89 -118 -166 -198 -230c -80 -64 -187 -137 -322 -220s -220 -136 -257 -161v 72h -86V 8h 86c 6 108 28 200 65 276s 74 133 111 170s 109 106 218 206s 190 184 245 252c 87 109 151 216 191 319s 60 212 60 328C 994 1648 977 1764 943 1912zM 897 1815c 0 -17 0 -41 1 -72s 1 -53 1 -68c 0 -369 -266 -701 -798 -996c 3 120 31 229 83 327s 130 199 233 303s 195 195 276 273C 776 1659 843 1737 897 1815";
alphatab.rendering.glyphs.MusicFont.FooterThirtySecond = "M 14 1990V 10h 87c 11 121 35 216 70 283c 35 66 89 134 161 202c 72 68 174 164 307 288c 235 226 353 494 353 802c 0 106 -14 211 -43 317c 29 90 43 186 43 287c 0 79 -12 171 -36 274c 57 73 86 191 86 352c 0 112 -15 226 -46 342s -76 218 -137 308h -57c 108 -223 162 -418 162 -582c 0 -104 -20 -199 -62 -284s -99 -163 -172 -232c -73 -69 -153 -133 -239 -192s -215 -142 -389 -251v 64H 14zM 108 1292c 7 113 39 215 96 305c 56 89 129 176 218 259s 179 168 273 257c 93 88 160 168 199 240c 2 -19 3 -48 3 -87C 900 1904 636 1579 108 1292zM 115 666c 0 106 23 197 71 272s 129 166 247 274s 209 197 276 268s 129 168 187 288c 7 -42 10 -83 10 -122c 0 -146 -40 -280 -120 -401c -80 -121 -171 -221 -273 -300C 411 867 278 774 115 666";
alphatab.rendering.glyphs.MusicFont.FooterSixtyFourth = "M 21 2851V 564v -554h 86c 0 140 32 254 98 342c 65 87 173 200 322 339s 261 271 336 400s 113 292 113 490c 0 96 -12 208 -36 338c 43 83 65 188 65 316c 0 122 -21 237 -65 345c 48 109 72 223 72 342c 0 117 -24 222 -72 316c 57 85 86 205 86 360c 0 218 -53 443 -161 673h -65c 98 -280 147 -498 147 -652c 0 -115 -22 -210 -65 -284s -93 -130 -149 -170c -56 -39 -153 -100 -291 -183s -247 -156 -327 -221l 0 87L 21 2851zM 107 2001c 0 121 29 233 89 336s 138 203 236 301s 192 190 280 278c 88 87 149 166 181 235c 11 -60 17 -112 17 -155c 0 -212 -81 -405 -244 -578C 505 2246 318 2106 107 2001zM 114 668c 0 119 22 219 68 300s 127 176 245 286c 118 109 208 198 272 265c 63 66 128 163 195 290c 7 -46 10 -90 10 -133c 0 -166 -41 -313 -124 -439s -177 -229 -281 -308C 395 848 267 762 114 668zM 114 1338c 0 123 24 226 73 309s 133 176 252 282s 211 193 278 263s 128 164 183 283c 9 -45 14 -94 14 -147c 0 -138 -39 -270 -116 -395s -177 -236 -297 -334S 252 1413 114 1338";
alphatab.rendering.glyphs.MusicFont.SimileMark = "M 413 1804l -446 3l 1804 -1806l 449 -3L 413 1804zM 331 434c 0 -53 20 -100 62 -142c 41 -41 91 -62 148 -62s 104 19 142 56c 38 38 56 87 56 148c 0 56 -19 105 -59 145c -39 39 -88 59 -145 59c -56 0 -105 -19 -145 -59C 351 540 331 491 331 434zM 1437 1380c 0 -56 18 -104 56 -142c 37 -37 87 -56 148 -56c 56 0 104 19 142 56c 38 38 56 85 56 142c 0 56 -19 104 -56 142c -38 38 -87 56 -148 56c -56 0 -104 -19 -142 -56C 1456 1485 1437 1437 1437 1380";
alphatab.rendering.glyphs.MusicFont.SimileMark2 = "M 414 1818l -446 3l 1809 -1809l 449 -6L 414 1818zM 340 439c 0 -56 18 -104 56 -142c 37 -37 87 -56 148 -56c 56 0 105 20 145 59c 39 39 59 88 59 145c 0 56 -19 104 -56 142c -38 38 -89 56 -153 56c -56 0 -104 -18 -142 -56C 359 549 340 500 340 439zM 1152 1815l -446 3l 1812 -1812l 446 -3L 1152 1815zM 2192 1391c 0 -56 18 -104 56 -142c 38 -37 87 -56 148 -56c 56 0 104 19 142 56c 37 38 56 85 56 142c 0 56 -19 104 -56 142c -38 38 -87 56 -148 56c -56 0 -104 -19 -142 -56C 2211 1495 2192 1448 2192 1391";
alphatab.rendering.glyphs.MusicFont.Coda = "M 697 1689v 299h -72v -299c -189 0 -349 -81 -478 -244c -129 -163 -193 -349 -193 -558h -248v -73h 248c 0 -216 63 -409 189 -581c 126 -171 287 -257 481 -257v -248h 72v 248c 189 0 345 84 467 254s 182 364 182 585h 284v 73h -284c 0 209 -60 395 -182 558C 1042 1608 887 1689 697 1689zM 624 813v -737c -126 14 -208 88 -244 222c -36 133 -54 305 -54 514H 624zM 324 886c 0 262 25 445 76 547s 125 158 222 167v -715H 324zM 697 813h 292c 0 -221 -12 -378 -36 -471c -43 -166 -129 -257 -255 -272V 813zM 989 886h -292v 715c 97 -9 170 -64 219 -164C 964 1338 989 1154 989 886";
alphatab.rendering.glyphs.MusicFont.Segno = "M 604 1150c -182 -112 -324 -222 -425 -329c -126 -131 -189 -256 -189 -372c 0 -116 42 -218 128 -306c 85 -87 194 -131 327 -131c 98 0 196 32 294 97c 98 64 147 141 147 229c 0 56 -9 104 -28 142c -18 38 -50 56 -94 56c -100 0 -155 -46 -164 -137c 0 -18 8 -45 25 -80c 17 -34 21 -63 11 -85c -22 -69 -86 -104 -192 -104c -67 0 -123 20 -168 61c -44 40 -67 84 -67 131c 0 135 64 248 193 339c 25 18 155 88 392 207l 571 -843l 148 0l -611 900c 196 121 334 223 415 304c 118 118 177 245 177 379c 0 112 -43 214 -130 304c -86 90 -193 136 -320 136c -102 0 -202 -34 -300 -102c -97 -68 -146 -152 -146 -251c 0 -37 13 -79 40 -125c 27 -46 57 -69 93 -69c 47 0 82 12 105 38c 22 25 38 65 47 120c 6 22 0 51 -16 87c -17 36 -22 65 -16 87c 9 31 35 56 78 75c 42 18 91 28 147 28c 58 0 105 -21 142 -65c 36 -43 55 -89 55 -139c 0 -139 -89 -263 -269 -371c -133 -68 -232 -117 -297 -148l -544 810l -152 -1L 604 1150zM 201 1091c 34 0 64 11 89 32s 37 51 37 89c 0 34 -12 64 -37 89c -25 25 -54 37 -89 37c -34 0 -64 -12 -89 -37c -25 -25 -37 -54 -37 -89C 74 1131 116 1091 201 1091zM 1291 696c 34 0 64 12 89 37c 25 25 37 54 37 89c 0 31 -12 59 -37 84c -25 25 -54 37 -89 37s -63 -11 -86 -35s -35 -52 -35 -87c 0 -34 10 -64 32 -89C 1224 708 1253 696 1291 696";
alphatab.rendering.glyphs.MusicFont.OttavaAbove = "M 488 562c 78 9 147 45 206 110c 59 64 88 138 88 222c 0 95 -39 171 -118 227c -78 55 -175 83 -290 83c -112 0 -208 -28 -288 -85c -80 -56 -120 -134 -120 -233c 0 -41 5 -77 15 -107c 10 -29 29 -61 56 -94c 27 -32 77 -62 149 -89c 12 -3 28 -7 49 -13c -69 -12 -127 -48 -172 -107c -45 -59 -68 -123 -68 -190c 0 -88 37 -161 113 -217s 158 -84 249 -84c 96 0 185 29 265 87c 80 58 120 131 120 220c 0 73 -22 134 -68 183c -24 24 -62 47 -113 68C 547 545 521 553 488 562zM 279 588c -66 21 -118 57 -156 108c -37 51 -56 112 -56 181c 0 72 27 141 83 206c 56 65 130 97 224 97c 90 0 166 -36 226 -108c 51 -60 77 -124 77 -190c 0 -54 -21 -101 -63 -140c -30 -27 -68 -49 -113 -68L 279 588zM 460 547c 130 -39 195 -127 195 -263c 0 -66 -25 -129 -77 -188c -51 -59 -122 -88 -213 -88c -87 0 -155 28 -202 86c -47 57 -70 119 -70 186c 0 36 14 72 43 108c 28 36 68 63 120 81L 460 547zM 842 311l -13 -9l 68 -58c 24 -21 51 -28 81 -22c 27 3 40 24 40 63c 0 36 -15 100 -47 192c -31 92 -47 149 -47 170c 0 33 13 46 40 40c 42 -3 94 -47 156 -133c 61 -86 93 -156 93 -211c 0 -12 -7 -22 -22 -31c -18 -9 -28 -16 -31 -22c -15 -30 -7 -49 22 -59c 30 -12 52 9 68 63c 18 75 -12 167 -93 274c -80 107 -147 161 -201 161c -57 0 -86 -24 -86 -72c 0 -18 4 -37 13 -59c 9 -21 23 -65 43 -133c 19 -68 29 -120 29 -156c 0 -15 -1 -25 -4 -31c -9 -18 -24 -19 -45 -4L 842 311zM 1636 683l 81 -68l -72 83c -18 19 -36 29 -54 29c -15 0 -21 -15 -18 -45l 40 -167c -3 21 -28 59 -77 113c -57 66 -109 99 -154 99c -66 0 -99 -39 -99 -118c 0 -78 28 -159 86 -242c 57 -83 122 -124 195 -124c 39 0 74 15 104 45l 9 -45h 31l -95 407c -6 18 -7 30 -4 36S 1621 692 1636 683zM 1382 683c 51 0 107 -37 167 -111c 18 -24 43 -63 77 -115l 31 -134c -33 -34 -66 -51 -99 -51c -54 0 -105 40 -152 120c -46 80 -70 154 -70 222C 1336 660 1351 683 1382 683";
alphatab.rendering.glyphs.MusicFont.OttavaBelow = "M 469 529c 75 6 143 41 202 107c 59 65 88 141 88 229c 0 97 -39 173 -118 229c -78 56 -175 84 -290 84c -112 0 -208 -28 -288 -86c -80 -57 -120 -136 -120 -236c 0 -33 6 -68 18 -104c 12 -36 31 -69 56 -97s 65 -55 120 -79c 18 -6 43 -15 77 -27c -69 -12 -126 -47 -170 -104s -65 -121 -65 -191c 0 -85 37 -156 113 -214c 75 -57 157 -86 245 -86c 93 0 182 28 265 86c 83 57 124 130 124 218c 0 72 -22 133 -68 182c -24 24 -62 47 -113 68C 528 512 502 520 469 529zM 251 563c -66 21 -118 57 -154 108c -36 51 -54 112 -54 181c 0 72 27 141 84 206c 55 65 130 97 224 97c 93 0 169 -36 226 -108c 48 -60 72 -124 72 -190c 0 -51 -21 -98 -63 -140c -30 -30 -66 -52 -108 -68L 251 563zM 432 522c 130 -39 195 -128 195 -265c 0 -67 -25 -130 -77 -189c -51 -59 -121 -89 -208 -89c -87 0 -155 29 -202 89c -47 59 -70 119 -70 180c 0 36 13 74 40 112s 66 66 118 84L 432 522zM 827 268h -13l 63 -45c 24 -27 52 -39 86 -36c 24 3 36 23 36 60c 0 34 -15 98 -45 191c -30 93 -45 154 -45 182c 0 34 13 49 40 46c 42 -3 94 -49 156 -138c 61 -89 93 -161 93 -218c 0 -12 -10 -25 -31 -37c -15 -6 -22 -12 -22 -18c -15 -30 -9 -50 18 -59c 33 -12 57 9 72 64c 18 76 -12 168 -93 277c -80 108 -146 162 -197 162c -63 0 -95 -28 -95 -84c 0 -8 3 -22 9 -40c 18 -47 35 -102 52 -164c 16 -62 24 -105 24 -129c 0 -17 -3 -29 -9 -35c -6 -6 -18 -4 -36 4L 827 268zM 1413 -13l -72 -9c 23 6 53 1 89 -15c 11 -3 30 -15 53 -35l -131 444c 30 -45 64 -81 102 -108c 38 -27 76 -40 116 -40c 39 0 68 11 86 34c 18 22 27 55 27 98c 0 79 -30 156 -90 231c -60 74 -137 112 -231 112c -30 0 -57 -8 -81 -24c -24 -16 -33 -36 -27 -62L 1413 -13zM 1294 635c 15 21 42 32 81 32c 78 0 146 -42 204 -128c 48 -73 72 -145 72 -215c 0 -30 -7 -50 -22 -59c -18 -9 -36 -13 -54 -13c -36 0 -77 17 -122 52c -45 35 -81 77 -108 126L 1294 635";
alphatab.rendering.glyphs.MusicFont.QuindicesimaAbove = "M 245 985V 270v -72c -9 -8 -30 -13 -61 -13c -25 0 -42 1 -52 4l -99 31l -4 -22l 317 -190v 980c 0 39 6 68 20 88c 13 19 31 34 52 43l 145 40v 9h -531l -4 -18l 149 -40c 24 -9 42 -24 54 -45C 241 1050 245 1024 245 985zM 685 338c 60 15 105 27 136 36c 96 27 167 53 213 77c 175 87 263 192 263 313c 0 72 -15 140 -47 204s -70 111 -115 142c -45 31 -87 53 -124 65c -37 12 -94 18 -170 18c -66 0 -128 -13 -186 -40c -57 -27 -86 -63 -86 -108c 0 -24 16 -36 49 -36c 18 0 41 5 70 15c 28 10 61 35 97 74c 36 39 69 59 99 59c 96 0 170 -39 222 -118c 42 -63 63 -131 63 -204c 0 -57 -18 -108 -56 -152c -37 -43 -79 -77 -124 -102c -45 -24 -125 -54 -240 -90c -36 -12 -87 -27 -154 -45l 154 -426h 426c 36 0 65 -4 86 -13l 45 -34l 22 -29h 9l -127 195h -449L 685 338zM 1806 561h -59l 145 -367c 0 -18 0 -30 0 -36c -6 -27 -21 -42 -45 -45c -24 -3 -51 13 -81 50c -3 6 -9 16 -18 31l -145 367h -68l 154 -379c -3 -15 -4 -26 -4 -32c -6 -21 -18 -34 -36 -37c -45 -6 -98 34 -158 121c -9 12 -21 34 -36 65h -18c 30 -47 54 -83 72 -106c 57 -71 111 -106 163 -106c 18 2 34 14 50 34c 2 5 9 17 18 34c 9 -17 16 -28 22 -34c 24 -22 60 -34 108 -34c 18 0 33 11 45 34c 2 5 7 18 13 38c 18 -21 31 -34 40 -40c 36 -27 74 -37 113 -31c 30 6 49 24 59 54c 3 9 6 25 9 49l -122 304c -3 15 -4 25 -4 31c 0 9 6 13 18 13c 18 0 39 -17 63 -52c 6 -11 16 -28 31 -52l 13 4c -15 29 -27 49 -36 61c -30 43 -56 65 -77 65c -51 0 -71 -20 -59 -62l 122 -306c 0 -17 0 -29 0 -35c -6 -23 -22 -35 -49 -35s -51 10 -72 31c -6 6 -15 18 -27 36L 1806 561zM 2555 525l 77 -63l -72 73c -18 17 -36 26 -54 26c -15 0 -21 -12 -18 -36l 40 -158c -6 31 -43 78 -113 138c -45 40 -84 60 -118 60c -66 0 -99 -38 -99 -114c 0 -79 28 -158 86 -235c 57 -77 122 -116 195 -116c 24 0 48 5 72 16c 6 2 16 9 31 20l 9 -36h 31l -95 395c -6 18 -7 30 -4 35C 2526 535 2537 534 2555 525zM 2292 525c 51 0 108 -35 172 -107c 21 -23 46 -61 77 -112l 27 -134c -30 -29 -63 -44 -99 -44c -54 0 -105 38 -152 116c -46 77 -70 149 -70 215C 2246 502 2262 525 2292 525";
alphatab.rendering.glyphs.MusicFont.QuindicesimaBelow = "M 2400 -200C 2376 -180 2358 -170 2346 -166C 2310 -150 2280 -144 2256 -150L 2328 -141L 2168 484C 2162 509 2172 530 2196 546C 2221 562 2247 571 2278 571C 2371 571 2448 534 2509 459C 2569 384 2600 307 2600 228C 2600 185 2590 151 2571 128C 2553 105 2526 93 2487 93C 2448 93 2409 107 2371 134C 2333 161 2299 198 2268 243L 2400 -200zM 1300 -57L 1278 -29L 1234 6C 1213 15 1183 21 1146 21L 721 21L 565 446C 632 464 685 481 721 493C 836 530 913 560 959 584C 1004 608 1046 640 1084 684C 1122 728 1143 780 1143 837C 1143 910 1120 980 1078 1043C 1026 1122 953 1159 856 1159C 825 1159 792 1139 756 1100C 719 1060 687 1035 659 1025C 630 1014 605 1009 587 1009C 554 1009 537 1022 537 1046C 537 1092 567 1129 625 1156C 682 1183 742 1196 809 1196C 884 1196 943 1190 981 1178C 1018 1166 1060 1144 1106 1112C 1151 1080 1190 1032 1221 968C 1253 905 1268 838 1268 765C 1268 644 1181 540 1006 453C 960 429 890 402 793 375C 763 365 716 352 656 337L 734 140L 1184 140L 1309 -57L 1300 -57zM 315 6L 0 196L 3 221L 103 190C 112 187 130 184 156 184C 187 184 206 187 215 196L 215 268L 215 984C 215 1023 212 1050 203 1065C 191 1086 171 1100 146 1109L 0 1150L 3 1168L 534 1168L 534 1159L 387 1118C 366 1109 351 1094 337 1075C 323 1055 315 1026 315 987L 315 6zM 1640 84C 1589 84 1535 119 1478 190C 1459 214 1436 249 1406 296L 1425 296C 1440 265 1450 246 1459 234C 1519 147 1573 106 1618 112C 1636 115 1650 128 1656 150C 1656 156 1656 165 1659 181L 1506 562L 1571 562L 1718 193C 1727 178 1734 168 1737 162C 1767 126 1794 109 1818 112C 1842 115 1856 129 1862 156L 1862 193L 1718 562L 1778 562L 1921 193C 1933 175 1943 162 1950 156C 1971 135 1994 125 2021 125C 2049 125 2065 138 2071 162L 2071 196L 1950 503C 1937 544 1957 565 2009 565C 2030 565 2057 543 2087 500C 2096 488 2106 466 2121 437L 2109 434C 2094 457 2084 475 2078 487C 2053 522 2030 537 2012 537C 2000 537 1996 534 1996 525C 1996 519 1997 508 2000 493L 2121 190C 2118 166 2115 149 2112 140C 2103 110 2083 90 2053 84C 2013 78 1976 88 1940 115C 1931 121 1918 135 1900 156C 1893 136 1890 124 1887 118C 1875 95 1858 84 1840 84C 1792 84 1755 96 1731 118C 1725 124 1718 136 1709 153C 1700 136 1693 124 1690 118C 1675 98 1658 87 1640 84zM 2490 121C 2508 121 2528 125 2546 134C 2562 143 2568 163 2568 193C 2568 264 2545 335 2496 409C 2439 495 2372 537 2293 537C 2254 537 2224 527 2209 506L 2259 300C 2286 251 2323 210 2368 175C 2414 139 2454 121 2490 121z";
alphatab.rendering.glyphs.MusicFont.FermataShort = "M 60 694l -110 1l 660 -713l 656 713l -66 -1l -562 -611L 60 694zM 662 488c 29 0 54 10 74 30s 30 44 30 74c 0 29 -10 54 -30 74s -44 30 -74 30c -29 0 -54 -10 -74 -30s -30 -44 -30 -74c 0 -29 10 -54 30 -74S 633 488 662 488";
alphatab.rendering.glyphs.MusicFont.FermataNormal = "M 871 230c -216 0 -405 69 -565 209c -160 139 -255 317 -284 531c -2 -16 -4 -32 -4 -48c 0 -21 0 -36 0 -44c 0 -228 84 -427 252 -599c 168 -171 368 -257 600 -257c 229 0 429 84 598 254c 169 169 254 370 254 603c 0 40 0 70 0 92c -26 -216 -119 -394 -278 -533C 1283 299 1093 230 871 230zM 869 767c 29 0 54 10 74 30s 30 44 30 74c 0 29 -9 53 -28 72c -18 18 -44 28 -76 28c -26 0 -50 -9 -72 -28c -21 -18 -32 -42 -32 -72c 0 -29 10 -54 30 -74S 839 767 869 767";
alphatab.rendering.glyphs.MusicFont.FermataLong = "M 55 702h -68v -704h 1317v 704h -68v -500h -1180V 702zM 647 494c 29 0 54 10 74 30s 30 44 30 74c 0 29 -10 54 -30 74s -44 30 -74 30c -29 0 -54 -10 -74 -30s -30 -44 -30 -74c 0 -29 10 -54 30 -74S 618 494 647 494";
alphatab.rendering.glyphs.MusicFont.DynamicP = "M 447 894l -146 415l 92 0v 50h -364v -50h 93l 310 -797c 7 -9 10 -16 10 -21c 7 -19 7 -33 0 -43c -14 -14 -27 -21 -39 -21c -38 0 -83 48 -133 144c -14 31 -34 79 -61 144h -25c 26 -72 48 -125 64 -158c 57 -108 116 -162 176 -162c 19 0 33 2 43 7c 12 4 21 18 28 39c 2 7 4 19 7 36c 16 -26 47 -52 90 -79c 43 -26 89 -39 137 -39c 19 0 45 5 77 16c 32 10 59 37 81 78c 21 41 32 89 32 141c 0 35 -2 64 -7 86c -4 21 -13 50 -25 86c -26 64 -71 123 -133 177s -119 80 -169 80C 528 1024 481 981 447 894zM 754 425c -33 -14 -73 5 -119 58c -36 43 -67 92 -93 145c -26 53 -39 113 -39 181c 0 48 9 78 28 90c 26 14 62 0 108 -41c 45 -42 81 -92 108 -150c 9 -24 19 -56 28 -96c 9 -40 14 -74 14 -103C 790 462 778 435 754 425";
alphatab.rendering.glyphs.MusicFont.DynamicF = "M 951 406v 39h -194l -18 90c -48 194 -97 344 -147 447c -67 141 -154 245 -259 310c -33 21 -77 32 -129 32c -77 0 -127 -21 -151 -64c -14 -26 -21 -51 -21 -75c 0 -38 13 -71 41 -97c 27 -26 57 -37 88 -32c 55 9 83 36 83 79c 0 16 -3 32 -10 46c -9 33 -32 55 -68 64c -12 2 -16 7 -14 14c 4 19 22 28 54 28c 16 -2 36 -14 57 -36c 7 -7 22 -26 47 -57c 52 -79 102 -205 147 -378c 19 -77 38 -154 57 -231l 32 -140h -137v -39h 144c -14 -55 21 -139 108 -252c 65 -84 144 -139 238 -166c 28 -7 57 -10 86 -10c 60 0 109 15 148 46c 38 31 57 72 57 122c 0 48 -14 81 -43 99c -28 18 -56 21 -83 9c -31 -14 -46 -38 -46 -72c 0 -28 10 -52 32 -72c 7 -7 22 -12 46 -14c 24 -2 37 -8 39 -18c 7 -28 -16 -43 -72 -43c -33 0 -64 6 -93 18c -77 33 -132 102 -166 205c -9 33 -20 83 -32 148H 951";
alphatab.rendering.glyphs.MusicFont.DynamicM = "M 553 1076l -165 1l 201 -502c 7 -12 11 -21 14 -28c 12 -26 18 -45 18 -57c 0 -21 -8 -33 -25 -36c -31 -7 -62 9 -93 50c -9 12 -22 33 -39 65l -199 508l -164 0l 212 -501c 4 -10 7 -17 7 -22c 4 -19 7 -37 7 -52c 0 -17 -3 -28 -10 -33c -9 -10 -22 -14 -39 -14c -50 0 -116 61 -198 183c -12 19 -30 47 -54 84h -18c 43 -73 78 -126 104 -160c 86 -106 165 -154 238 -142c 16 2 37 21 61 56c 7 10 18 28 32 56c 14 -26 28 -45 43 -57c 45 -40 101 -61 166 -61c 31 0 54 19 68 57c 2 12 6 32 10 61c 21 -30 39 -51 54 -62c 48 -39 101 -56 158 -49c 55 7 89 30 104 69c 2 11 3 30 3 55l -163 437c -12 19 -20 32 -22 39c -7 14 -4 22 7 25c 21 2 54 -20 97 -68c 14 -14 34 -39 61 -75h 21c -31 44 -56 78 -75 101c -62 67 -125 101 -188 101c -24 0 -43 -10 -57 -32c -14 -21 -16 -43 -7 -65l 169 -429c 4 -7 6 -11 6 -14c 10 -26 16 -47 16 -64c 0 -26 -10 -40 -32 -43c -28 -7 -58 9 -89 50c -9 12 -22 33 -39 64L 553 1076";
alphatab.rendering.glyphs.MusicFont.Accentuation = "M 748 286L -350 525l 0 -27l 938 -208l -939 -208l 0 -32L 748 286";
alphatab.rendering.glyphs.MusicFont.HeavyAccentuation = "M -223 900L -275 900l 349 -1004l 353 1004l -128 0l -264 -750L -223 900";
alphatab.rendering.glyphs.MusicFont.WaveHorizontal = "M 1382 230c -43 32 -92 69 -146 111s -104 76 -149 105c -45 28 -89 51 -134 68s -86 26 -127 28c -47 -6 -87 -19 -119 -38s -79 -51 -143 -98c -64 -46 -117 -81 -160 -102c -42 -21 -90 -32 -141 -32c -79 0 -174 55 -285 166v -112c 132 -110 241 -193 327 -249s 166 -83 244 -83c 48 0 93 11 134 34c 40 22 88 56 144 101c 55 44 103 79 143 103c 40 24 85 37 135 40c 89 -7 182 -55 278 -146V 230";
alphatab.rendering.glyphs.MusicFont.WaveVertical = "M 165 4h 50c 47 44 86 85 115 122s 43 75 43 114c 0 31 -9 60 -28 85c -19 25 -47 55 -85 89s -66 64 -86 90c -19 26 -30 55 -31 88h 5c 0 31 9 60 27 86c 18 25 46 56 84 93s 66 68 86 95c 19 27 28 57 28 92c 0 33 -9 62 -28 89c -19 26 -47 57 -85 92c -37 35 -65 64 -84 89c -18 24 -27 51 -27 82c 0 17 22 59 67 127h -50c -59 -57 -100 -100 -124 -130c -23 -29 -35 -67 -35 -113c 0 -33 9 -62 27 -86c 18 -24 46 -53 85 -87c 38 -33 66 -63 85 -88c 18 -25 28 -55 28 -91c 0 -17 -8 -37 -26 -61s -42 -54 -73 -89c -31 -35 -53 -60 -64 -75c -41 -64 -61 -109 -61 -135c 1 -40 20 -80 56 -119c 35 -38 72 -77 110 -117c 38 -39 58 -76 60 -112c 0 -18 -4 -35 -13 -50C 210 72 192 44 165 4";
alphatab.rendering.glyphs.MusicFont.PickStrokeDown = "M 0 -20h 816v 844h -74v -477h -672v 477H 0V -20";
alphatab.rendering.glyphs.MusicFont.PickStrokeUp = "M 551 -7L 289 950l -264 -956h 66l 202 759l 193 -759H 551";
alphatab.rendering.glyphs.MusicFont.TremoloPickingThirtySecond = "M -38 737v -250l 986 -505v 253L -38 737zM -38 1150v -250l 986 -505v 253L -38 1150zM -38 1562v -250l 986 -505v 261L -38 1562";
alphatab.rendering.glyphs.MusicFont.TremoloPickingSixteenth = "M -38 737v -250l 986 -505v 253L -38 737zM -38 1150v -250l 986 -505v 253L -38 1150";
alphatab.rendering.glyphs.MusicFont.TremoloPickingEighth = "M -38 737v -250l 986 -505v 253L -38 737";
alphatab.rendering.glyphs.MusicFont.UpperMordent = "M 16 714v -195l 425 -494c 34 -22 53 -33 56 -33c 19 0 33 6 39 20l 349 306c 17 17 36 28 56 33c 19 -6 33 -12 39 -19l 264 -307c 33 -22 53 -33 59 -33c 17 0 29 6 36 20l 349 306c 20 21 39 34 55 40c 20 -7 34 -16 40 -26l 224 -264v 194l -422 494c -32 22 -54 33 -66 33c -15 0 -26 -6 -33 -19l -346 -310c -15 -15 -37 -23 -66 -23c -16 0 -26 3 -29 9l -267 310c -25 22 -46 33 -62 33c -14 0 -25 -6 -33 -19l -346 -310c -18 -19 -40 -29 -66 -29c -14 0 -25 5 -32 16L 16 714";
alphatab.rendering.glyphs.MusicFont.LowerMordent = "M -34 664v -195l 399 -458c 34 -37 58 -56 72 -56s 41 18 82 56l 352 310v -607h 99v 525l 191 -227c 38 -41 62 -62 72 -62c 10 0 38 16 82 50l 277 247c 64 53 99 80 102 82c 10 -2 24 -15 43 -38c 18 -23 33 -39 42 -50l 115 -142v 178l -349 412c -26 34 -51 52 -75 52c -12 0 -40 -19 -83 -59l -257 -230c -46 -46 -83 -69 -111 -69c -7 0 -12 1 -17 5c -4 3 -9 9 -16 17c -6 8 -11 14 -16 19v 607h -99v -492l -121 149c -31 34 -56 52 -75 52c -7 0 -15 -2 -22 -6c -7 -4 -18 -12 -32 -25c -14 -12 -25 -21 -33 -27l -290 -263c -35 -28 -57 -42 -66 -42c -15 0 -33 14 -56 42L -34 664";
alphatab.rendering.glyphs.MusicFont.Turn = "M 1141 739c -20 -17 -65 -56 -136 -115c -70 -60 -143 -117 -218 -172c -75 -54 -150 -100 -224 -136c -73 -36 -140 -54 -199 -54c -74 6 -138 45 -191 115s -82 143 -85 218c 8 119 77 179 208 179c 18 0 33 -3 45 -9c 11 -6 31 -20 59 -40c 28 -20 53 -35 75 -45c 22 -9 48 -14 79 -14c 89 0 146 39 170 117c 0 76 -31 132 -93 169c -62 36 -129 55 -202 55c -165 -8 -290 -53 -373 -135c -83 -82 -124 -182 -124 -301c 0 -85 22 -171 67 -255c 44 -84 107 -155 189 -213c 81 -57 174 -92 279 -105c 137 0 267 29 388 89c 121 59 240 137 356 232c 116 95 229 188 337 278c 42 35 97 69 165 101c 67 31 131 47 191 47c 92 -5 162 -35 210 -91c 47 -56 71 -121 71 -196c 0 -64 -18 -119 -55 -162c -36 -43 -85 -65 -146 -65c -21 0 -50 12 -89 38c -38 25 -68 43 -90 55c -22 11 -53 17 -93 17c -42 0 -79 -14 -113 -44c -33 -29 -50 -66 -50 -111c 0 -60 31 -104 95 -134c 63 -29 130 -44 200 -44c 102 0 192 24 269 72c 76 48 135 112 175 191c 40 78 60 161 60 249c 0 87 -20 168 -60 243c -40 74 -101 134 -184 179c -82 45 -185 68 -306 68c -116 0 -224 -22 -323 -66C 1375 894 1264 827 1141 739";
alphatab.rendering.glyphs.MusicFont.OpenNote = "M 443 922c -124 0 -229 -45 -315 -135s -128 -197 -128 -322c 0 -130 42 -239 126 -326c 84 -87 189 -130 316 -130c 122 0 225 39 310 118c 84 78 130 177 138 295c 0 145 -41 263 -125 354S 575 915 443 922zM 426 96c -101 0 -182 35 -244 107c -61 71 -92 158 -92 260c 0 101 32 185 98 252s 150 100 254 100c 113 0 201 -36 264 -109s 94 -168 94 -288C 780 204 655 96 426 96";
alphatab.rendering.glyphs.MusicFont.StoppedNote = "M 462 1009v -449h -445v -122h 445V -3h 118v 441h 452v 122h -452v 449H 462";
alphatab.rendering.glyphs.MusicFont.Tempo = "M 550 1578V 30l 43 8v 1679c 0 86 -41 160 -124 220s -173 90 -272 90c -114 0 -182 -46 -203 -139c 0 -84 41 -164 125 -239s 173 -112 270 -112C 457 1539 510 1552 550 1578zM 914 1686v -76h 540v 76H 914zM 914 1850h 540v 80h -540V 1850";
alphatab.rendering.glyphs.MusicFont.AccidentalSharp = "M 482 -275v -577h 93v 540l 135 -57v 343l -135 57v 551l 135 -62v 343l -135 57v 561h -93v -525l -223 93v 566h -93v -530l -135 52v -343l 135 -52v -551l -135 57v -348l 135 -52v -561h 93v 525L 482 -275zM 258 156v 551l 223 -93v -546L 258 156";
alphatab.rendering.glyphs.MusicFont.AccidentalFlat = "M -23 -1273h 93v 1300c 48 -27 86 -48 114 -62c 93 -41 176 -62 249 -62c 52 0 97 13 137 39c 39 26 70 70 91 132c 10 31 15 62 15 93c 0 100 -50 204 -150 311c -72 76 -157 143 -254 202c -41 24 -97 69 -166 135c -45 41 -88 84 -130 129V -1273zM 367 17c -7 -3 -13 -6 -20 -10c -17 -6 -33 -10 -46 -10c -27 0 -59 7 -93 23c -34 15 -79 46 -135 91v 644c 65 -65 131 -131 197 -197c 128 -156 192 -284 192 -384C 460 103 429 51 367 17";
alphatab.rendering.glyphs.MusicFont.AccidentalNatural = "M 38 472V -1283h 99v 792l 478 -132v 1738h -93v -775L 38 472zM 137 180l 385 -104v -429l -385 104V 180";
alphatab.rendering.glyphs.MusicFont.ClefNeutral = "M -35 1887v -1875h 337v 1875H -35zM 527 1887v -1875h 337v 1875H 527";
alphatab.rendering.glyphs.MusicFont.RestSixtyFourth = "M 705 -2202c 77 -26 144 -77 200 -150c 56 -73 101 -174 136 -305l 127 -547c -69 127 -197 191 -382 191c -46 0 -100 -7 -162 -23c -61 -15 -114 -46 -156 -92c -42 -46 -63 -108 -63 -185c 0 -65 23 -121 69 -168c 46 -46 104 -69 174 -69c 65 0 123 25 174 75c 50 50 75 104 75 162c 0 31 -7 63 -23 98c -15 34 -44 63 -87 87c 46 15 71 23 75 23c 7 0 27 -3 57 -11c 77 -23 148 -81 213 -174c 53 -73 86 -137 98 -191l 154 -638c -73 128 -198 192 -375 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174c 46 -46 104 -69 174 -69s 128 24 176 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98c -15 34 -42 65 -81 92c 19 7 40 15 63 23c 11 0 32 -3 63 -11c 73 -23 140 -80 202 -169c 61 -89 121 -179 179 -271l 41 0l -1032 4425l -107 0l 319 -1316c -73 128 -196 192 -370 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -105 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 171 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -87 87c 46 15 71 23 75 23c 7 0 26 -3 57 -11c 76 -23 150 -83 219 -180c 57 -77 86 -129 86 -156l 161 -667c -73 124 -198 186 -375 186c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -22c -69 -19 -125 -51 -167 -97c -42 -45 -63 -105 -63 -177c 0 -68 23 -126 69 -172c 46 -45 106 -68 179 -68c 65 0 122 23 171 71c 48 47 72 102 72 163c 0 30 -7 63 -23 97c -15 34 -44 65 -87 91c 23 7 46 14 69 21C 653 -2190 674 -2194 705 -2202";
alphatab.rendering.glyphs.MusicFont.AccidentalDoubleFlat = "M 67 25c 52 -27 93 -48 124 -62c 100 -45 176 -67 228 -67c 45 0 95 12 150 36V -1275h 88v 1300c 48 -27 88 -48 119 -62c 100 -45 183 -67 249 -67c 55 0 104 13 145 39c 41 26 72 71 93 137c 10 31 15 62 15 93c 0 107 -48 212 -145 316c -72 79 -163 143 -270 192c -34 17 -78 52 -132 104c -53 51 -108 107 -163 166v -529c -38 45 -72 83 -104 115c -55 55 -121 103 -197 141c -45 20 -102 68 -171 141c -41 41 -81 85 -119 131V -1275h 88V 25zM 369 15c -7 -3 -13 -6 -20 -10c -17 -6 -33 -10 -46 -10c -31 0 -64 7 -98 23c -34 15 -79 46 -135 91v 644c 65 -65 131 -131 197 -197c 131 -159 197 -287 197 -384C 462 101 431 49 369 15zM 962 15c -3 -3 -12 -6 -26 -10c -20 -6 -36 -10 -46 -10c -31 0 -63 7 -96 23c -33 15 -77 46 -132 91v 644c 65 -65 131 -131 197 -197c 131 -159 197 -287 197 -384C 1055 101 1024 49 962 15";
alphatab.rendering.glyphs.MusicFont.AccidentalDoubleSharp = "M 22 243c -32 -31 -48 -68 -48 -110c 0 -38 15 -71 45 -98c 30 -27 63 -40 98 -40c 38 0 70 14 96 43c 64 57 116 124 158 199c 41 75 62 146 62 213c -83 0 -172 -30 -268 -91C 99 317 51 278 22 243zM 18 872c 25 25 59 38 100 38c 38 0 70 -14 96 -43c 44 -38 86 -86 124 -144c 64 -96 96 -187 96 -273c -70 0 -140 18 -211 55c -70 36 -137 87 -201 151c -32 31 -48 70 -48 115C -26 810 -11 843 18 872zM 848 32c -25 -25 -60 -38 -105 -38c -41 0 -76 16 -105 48c -57 67 -94 113 -110 139c -60 96 -91 185 -91 268c 92 0 182 -28 268 -86c 79 -67 124 -105 134 -115c 31 -31 48 -72 48 -120C 886 96 874 64 848 32zM 838 656c 31 31 48 70 48 115c 0 38 -14 72 -43 100s -62 43 -100 43c -38 0 -73 -16 -105 -48c -51 -57 -88 -105 -110 -144c -60 -96 -91 -187 -91 -273c 105 0 211 41 316 124C 803 622 832 650 838 656";
alphatab.rendering.glyphs.NoteHeadGlyph.graceScale = 0.7;
alphatab.rendering.glyphs.NoteHeadGlyph.noteHeadHeight = 9;
alphatab.rendering.glyphs.NoteNumberGlyph.Padding = 3;
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
alphatab.rendering.utils.AccidentalHelper.ACCIDENTAL_NOTES = [[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Flat,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.None],[alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural,alphatab.model.AccidentalType.Sharp,alphatab.model.AccidentalType.Natural]];
alphatab.rendering.utils.BeamingHelper.SCORE_MIDDLE_KEYS = [48,45,38,59];
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

//@ sourceMappingURL=alphaTab.core.js.map