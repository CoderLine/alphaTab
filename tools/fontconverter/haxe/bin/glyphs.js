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
	customReplace: function(s,f) {
		var buf = new StringBuf();
		while(true) {
			if(!this.match(s)) break;
			buf.b += Std.string(this.matchedLeft());
			buf.b += Std.string(f(this));
			s = this.matchedRight();
		}
		buf.b += Std.string(s);
		return buf.b;
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,split: function(s) {
		var d = "#__delim__#";
		return s.replace(this.r,d).split(d);
	}
	,matchedPos: function() {
		if(this.r.m == null) throw "No string matched";
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchedRight: function() {
		if(this.r.m == null) throw "No string matched";
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	,matchedLeft: function() {
		if(this.r.m == null) throw "No string matched";
		return this.r.s.substr(0,this.r.m.index);
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
	,r: null
	,__class__: EReg
}
var Hash = $hxClasses["Hash"] = function() {
	this.h = { };
};
Hash.__name__ = ["Hash"];
Hash.prototype = {
	toString: function() {
		var s = new StringBuf();
		s.b += Std.string("{");
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b += Std.string(i);
			s.b += Std.string(" => ");
			s.b += Std.string(Std.string(this.get(i)));
			if(it.hasNext()) s.b += Std.string(", ");
		}
		s.b += Std.string("}");
		return s.b;
	}
	,iterator: function() {
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
	,h: null
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
	toString: function() {
		var s = new StringBuf();
		s.b += Std.string("{");
		var it = this.keys();
		while( it.hasNext() ) {
			var i = it.next();
			s.b += Std.string(i);
			s.b += Std.string(" => ");
			s.b += Std.string(Std.string(this.get(i)));
			if(it.hasNext()) s.b += Std.string(", ");
		}
		s.b += Std.string("}");
		return s.b;
	}
	,iterator: function() {
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
	,h: null
	,__class__: IntHash
}
var IntIter = $hxClasses["IntIter"] = function(min,max) {
	this.min = min;
	this.max = max;
};
IntIter.__name__ = ["IntIter"];
IntIter.prototype = {
	next: function() {
		return this.min++;
	}
	,hasNext: function() {
		return this.min < this.max;
	}
	,max: null
	,min: null
	,__class__: IntIter
}
var List = $hxClasses["List"] = function() {
	this.length = 0;
};
List.__name__ = ["List"];
List.prototype = {
	map: function(f) {
		var b = new List();
		var l = this.h;
		while(l != null) {
			var v = l[0];
			l = l[1];
			b.add(f(v));
		}
		return b;
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
	,join: function(sep) {
		var s = new StringBuf();
		var first = true;
		var l = this.h;
		while(l != null) {
			if(first) first = false; else s.b += Std.string(sep);
			s.b += Std.string(l[0]);
			l = l[1];
		}
		return s.b;
	}
	,toString: function() {
		var s = new StringBuf();
		var first = true;
		var l = this.h;
		s.b += Std.string("{");
		while(l != null) {
			if(first) first = false; else s.b += Std.string(", ");
			s.b += Std.string(Std.string(l[0]));
			l = l[1];
		}
		s.b += Std.string("}");
		return s.b;
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
	,clear: function() {
		this.h = null;
		this.q = null;
		this.length = 0;
	}
	,isEmpty: function() {
		return this.h == null;
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,last: function() {
		return this.q == null?null:this.q[0];
	}
	,first: function() {
		return this.h == null?null:this.h[0];
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,length: null
	,q: null
	,h: null
	,__class__: List
}
var Main = $hxClasses["Main"] = function() { }
Main.__name__ = ["Main"];
Main.glyphs = null;
Main.currentGlyph = null;
Main.main = function() {
	new js.JQuery(js.Lib.document).ready(function(_) {
		Main.glyphs = new Array();
		var initialX = 100;
		var initialY = 100;
		var zoom = 2;
		var zeroX = 150;
		var zeroY = 150;
		var glyphCanvas = new js.JQuery("#glyphCanvas");
		var list = new js.JQuery("#glyphList");
		var button = new js.JQuery("#render");
		var preview = new js.JQuery("#preview");
		var glyphName = new js.JQuery("#glyphName");
		var generateButton = new js.JQuery("#generateButton");
		var code = new js.JQuery("#code");
		var renderer = new alphatab.rendering.ScoreRenderer(js.Lib.document.getElementById("glyphCanvas"));
		var staveGroup = new alphatab.rendering.staves.StaveGroup();
		staveGroup.layout = renderer.layout;
		var stave = new alphatab.rendering.staves.Stave(new alphatab.rendering.ScoreBarRendererFactory());
		stave.staveGroup = staveGroup;
		var barRenderer = new alphatab.rendering.ScoreBarRenderer(new alphatab.model.Bar());
		barRenderer.stave = stave;
		Main.loadGlyphs(zoom);
		var repaint = function() {
			renderer.canvas.clear();
			renderer.canvas.setColor(new alphatab.platform.model.Color(0,0,250));
			renderer.canvas.beginPath();
			renderer.canvas.moveTo(zeroX,0);
			renderer.canvas.lineTo(zeroX,renderer.canvas.getHeight());
			renderer.canvas.moveTo(0,zeroY);
			renderer.canvas.lineTo(renderer.canvas.getWidth(),zeroY);
			renderer.canvas.stroke();
			var glx;
			var gly;
			if(preview.attr("checked")) {
				glx = zeroX;
				gly = zeroY;
			} else {
				glx = Main.currentGlyph.x;
				gly = Main.currentGlyph.y;
			}
			renderer.canvas.setColor(new alphatab.platform.model.Color(0,250,0));
			renderer.canvas.beginPath();
			renderer.canvas.moveTo(glx,0);
			renderer.canvas.lineTo(glx,renderer.canvas.getHeight());
			renderer.canvas.moveTo(0,gly);
			renderer.canvas.lineTo(renderer.canvas.getWidth(),gly);
			renderer.canvas.stroke();
			var s = "x: " + Main.calculateTranslation(Main.currentGlyph.x,zoom,zeroX) + " y: " + Main.calculateTranslation(Main.currentGlyph.y,zoom,zeroY);
			renderer.canvas.setFont(new alphatab.platform.model.Font("Arial",12));
			renderer.canvas.fillText(s,Math.max(10,Main.currentGlyph.x),Math.max(20,Main.currentGlyph.y));
			var renderGlyph;
			if(preview.attr("checked")) renderGlyph = new alphatab.rendering.glyphs.SvgGlyph(zeroX,zeroY,Main.rewritePathData(Main.currentGlyph,zeroX,zeroY,zoom),zoom / 100,zoom / 100); else renderGlyph = Main.currentGlyph;
			renderGlyph.renderer = barRenderer;
			renderGlyph.doLayout();
			renderGlyph.paint(0,0,renderer.canvas);
		};
		var i = 0;
		var _g = 0, _g1 = Main.glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			var option = new js.JQuery("<option></option>");
			option.val(Std.string(i++));
			option.text(g.name);
			list.append(option);
		}
		var dragging = false;
		var startX;
		var startY;
		glyphCanvas.mousedown(function(e) {
			dragging = true;
			startX = e.pageX;
			startY = e.pageY;
			return false;;
		});
		glyphCanvas.mousemove(function(e) {
			if(dragging) {
				var dx = e.pageX - startX;
				var dy = e.pageY - startY;
				startX = e.pageX;
				startY = e.pageY;
				Main.currentGlyph.x += dx | 0;
				Main.currentGlyph.y += dy | 0;
				repaint();
			}
		});
		new js.JQuery(js.Lib.document).bind("mouseup",function(_1) {
			dragging = false;
		});
		list.change(function(_1) {
			var index = Std.parseInt(list.val());
			Main.currentGlyph = Main.glyphs[index];
			glyphName.val(Main.currentGlyph.name);
			repaint();
		});
		glyphName.keyup(function(_1) {
			Main.currentGlyph.name = glyphName.val();
			new js.JQuery("#glyphList option:selected").text(glyphName.val());
		});
		generateButton.click(function(_1) {
			code.text(Main.generateClass(zeroX,zeroY,zoom));
		});
		preview.change(function(_1) {
			repaint();
		});
		list.val("0");
		list.change();
	});
}
Main.generateClass = function(zeroX,zeroY,zoom) {
	var buf = new StringBuf();
	buf.b += Std.string("package alphatab.rendering.glyphs;\r\n");
	buf.b += Std.string("\r\n");
	buf.b += Std.string("/**\r\n");
	buf.b += Std.string(" * This class contains SVG path data for musical symbols\r\n");
	buf.b += Std.string(" * which can be rendered using the SvgPainter\r\n");
	buf.b += Std.string(" */\r\n");
	buf.b += Std.string("class MusicFont\r\n");
	buf.b += Std.string("{\r\n");
	var _g = 0, _g1 = Main.glyphs;
	while(_g < _g1.length) {
		var g = _g1[_g];
		++_g;
		buf.b += Std.string("    public static var ");
		buf.b += Std.string(g.name);
		buf.b += Std.string(" = \"");
		buf.b += Std.string(Main.rewritePathData(g,zeroX,zeroY,zoom));
		buf.b += Std.string("\";\r\n");
	}
	buf.b += Std.string("}");
	return buf.b;
}
Main.rewritePathData = function(g,zeroX,zeroY,zoom) {
	var buf = new StringBuf();
	var p = new alphatab.rendering.utils.SvgPathParser(g.getSvgData());
	p.reset();
	var isX = true;
	while(!p.eof()) {
		if(!p.currentTokenIsNumber()) {
			buf.b += Std.string(p.currentToken);
			isX = true;
		} else {
			buf.b += Std.string(" ");
			var newValue = Std.parseFloat(p.currentToken) * 100 | 0;
			switch(p.lastCommand) {
			case "m":case "z":case "l":case "v":case "h":case "c":case "s":case "q":case "t":
				buf.b += Std.string(newValue);
				break;
			case "H":
				buf.b += Std.string(newValue + Main.calculateTranslation(g.x,zoom / 100,zeroX));
				break;
			case "V":
				buf.b += Std.string(newValue + Main.calculateTranslation(g.y,zoom / 100,zeroY));
				break;
			case "M":case "Z":case "L":case "C":case "S":case "Q":case "T":
				if(isX) buf.b += Std.string(newValue + Main.calculateTranslation(g.x,zoom / 100,zeroX)); else buf.b += Std.string(newValue + Main.calculateTranslation(g.y,zoom / 100,zeroY));
				break;
			}
			isX = !isX;
		}
		p.nextToken();
	}
	return buf.b;
}
Main.calculateTranslation = function(glyph,zoom,zero) {
	return (glyph - zero) / zoom | 0;
}
Main.loadGlyphs = function(zoom) {
	var svg = haxe.Resource.getString("glyphs");
	var dom = Xml.parse(svg);
	Main.processNode(dom.firstElement(),zoom);
}
Main.processNode = function(node,zoom) {
	if(node.nodeType == Xml.Element) {
		if(node.getNodeName() == "path") {
			var f = new haxe.xml.Fast(node);
			Main.glyphs.push(new NamedSvgGlyph(f.att.resolve("id"),f.att.resolve("d"),zoom));
		} else {
			var $it0 = node.iterator();
			while( $it0.hasNext() ) {
				var e = $it0.next();
				Main.processNode(e,zoom);
			}
		}
	}
}
var alphatab = alphatab || {}
if(!alphatab.rendering) alphatab.rendering = {}
alphatab.rendering.Glyph = $hxClasses["alphatab.rendering.Glyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
};
alphatab.rendering.Glyph.__name__ = ["alphatab","rendering","Glyph"];
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
	,renderer: null
	,width: null
	,y: null
	,x: null
	,index: null
	,__class__: alphatab.rendering.Glyph
}
if(!alphatab.rendering.glyphs) alphatab.rendering.glyphs = {}
alphatab.rendering.glyphs.SvgGlyph = $hxClasses["alphatab.rendering.glyphs.SvgGlyph"] = function(x,y,svg,xScale,yScale) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._svg = new alphatab.rendering.utils.SvgPathParser(svg);
	this._xGlyphScale = xScale * 0.01;
	this._yGlyphScale = yScale * 0.01;
};
alphatab.rendering.glyphs.SvgGlyph.__name__ = ["alphatab","rendering","glyphs","SvgGlyph"];
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
	,_lastControlY: null
	,_lastControlX: null
	,_yGlyphScale: null
	,_xGlyphScale: null
	,_yScale: null
	,_xScale: null
	,_currentY: null
	,_currentX: null
	,_svg: null
	,__class__: alphatab.rendering.glyphs.SvgGlyph
});
var NamedSvgGlyph = $hxClasses["NamedSvgGlyph"] = function(name,svg,zoom) {
	alphatab.rendering.glyphs.SvgGlyph.call(this,0,0,svg,zoom,zoom);
	this.name = name;
};
NamedSvgGlyph.__name__ = ["NamedSvgGlyph"];
NamedSvgGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
NamedSvgGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	name: null
	,__class__: NamedSvgGlyph
});
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
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
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
	this.b = "";
};
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	toString: function() {
		return this.b;
	}
	,addSub: function(s,pos,len) {
		this.b += HxOverrides.substr(s,pos,len);
	}
	,addChar: function(c) {
		this.b += String.fromCharCode(c);
	}
	,add: function(x) {
		this.b += Std.string(x);
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
var Xml = $hxClasses["Xml"] = function() {
};
Xml.__name__ = ["Xml"];
Xml.Element = null;
Xml.PCData = null;
Xml.CData = null;
Xml.Comment = null;
Xml.DocType = null;
Xml.Prolog = null;
Xml.Document = null;
Xml.parse = function(str) {
	return haxe.xml.Parser.parse(str);
}
Xml.createElement = function(name) {
	var r = new Xml();
	r.nodeType = Xml.Element;
	r._children = new Array();
	r._attributes = new Hash();
	r.setNodeName(name);
	return r;
}
Xml.createPCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.PCData;
	r.setNodeValue(data);
	return r;
}
Xml.createCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.CData;
	r.setNodeValue(data);
	return r;
}
Xml.createComment = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Comment;
	r.setNodeValue(data);
	return r;
}
Xml.createDocType = function(data) {
	var r = new Xml();
	r.nodeType = Xml.DocType;
	r.setNodeValue(data);
	return r;
}
Xml.createProlog = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Prolog;
	r.setNodeValue(data);
	return r;
}
Xml.createDocument = function() {
	var r = new Xml();
	r.nodeType = Xml.Document;
	r._children = new Array();
	return r;
}
Xml.prototype = {
	toString: function() {
		if(this.nodeType == Xml.PCData) return this._nodeValue;
		if(this.nodeType == Xml.CData) return "<![CDATA[" + this._nodeValue + "]]>";
		if(this.nodeType == Xml.Comment) return "<!--" + this._nodeValue + "-->";
		if(this.nodeType == Xml.DocType) return "<!DOCTYPE " + this._nodeValue + ">";
		if(this.nodeType == Xml.Prolog) return "<?" + this._nodeValue + "?>";
		var s = new StringBuf();
		if(this.nodeType == Xml.Element) {
			s.b += Std.string("<");
			s.b += Std.string(this._nodeName);
			var $it0 = this._attributes.keys();
			while( $it0.hasNext() ) {
				var k = $it0.next();
				s.b += Std.string(" ");
				s.b += Std.string(k);
				s.b += Std.string("=\"");
				s.b += Std.string(this._attributes.get(k));
				s.b += Std.string("\"");
			}
			if(this._children.length == 0) {
				s.b += Std.string("/>");
				return s.b;
			}
			s.b += Std.string(">");
		}
		var $it1 = this.iterator();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			s.b += Std.string(x.toString());
		}
		if(this.nodeType == Xml.Element) {
			s.b += Std.string("</");
			s.b += Std.string(this._nodeName);
			s.b += Std.string(">");
		}
		return s.b;
	}
	,insertChild: function(x,pos) {
		if(this._children == null) throw "bad nodetype";
		if(x._parent != null) HxOverrides.remove(x._parent._children,x);
		x._parent = this;
		this._children.splice(pos,0,x);
	}
	,removeChild: function(x) {
		if(this._children == null) throw "bad nodetype";
		var b = HxOverrides.remove(this._children,x);
		if(b) x._parent = null;
		return b;
	}
	,addChild: function(x) {
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
	,firstChild: function() {
		if(this._children == null) throw "bad nodetype";
		return this._children[0];
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
	,attributes: function() {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.keys();
	}
	,exists: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.exists(att);
	}
	,remove: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		this._attributes.remove(att);
	}
	,set: function(att,value) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		this._attributes.set(att,value);
	}
	,get: function(att) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._attributes.get(att);
	}
	,getParent: function() {
		return this._parent;
	}
	,setNodeValue: function(v) {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue = v;
	}
	,getNodeValue: function() {
		if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
		return this._nodeValue;
	}
	,setNodeName: function(n) {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName = n;
	}
	,getNodeName: function() {
		if(this.nodeType != Xml.Element) throw "bad nodeType";
		return this._nodeName;
	}
	,_parent: null
	,_children: null
	,_attributes: null
	,_nodeValue: null
	,_nodeName: null
	,parent: null
	,nodeValue: null
	,nodeName: null
	,nodeType: null
	,__class__: Xml
	,__properties__: {set_nodeName:"setNodeName",get_nodeName:"getNodeName",set_nodeValue:"setNodeValue",get_nodeValue:"getNodeValue",get_parent:"getParent"}
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
	determineTieOrigin: function(note) {
		var previousBeat = note.beat.previousBeat;
		while(previousBeat != null) {
			var noteOnString = previousBeat.getNoteOnString(note.string);
			if(noteOnString != null) return noteOnString; else previousBeat = previousBeat.previousBeat;
		}
		return null;
	}
	,determineHammerPullDestination: function(note) {
		var nextBeat = note.beat.nextBeat;
		while(nextBeat != null) {
			var noteOnString = nextBeat.getNoteOnString(note.string);
			if(noteOnString != null) return noteOnString; else nextBeat = nextBeat.nextBeat;
		}
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
	,readScore: function() {
		return null;
	}
	,init: function(data) {
		this._data = data;
	}
	,_data: null
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
		note.string = this._track.tuning.length - string;
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
	,_currentDuration: null
	,_allowNegatives: null
	,_syData: null
	,_sy: null
	,_curChPos: null
	,_ch: null
	,_track: null
	,_score: null
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
alphatab.importer.Gp3To5Importer = $hxClasses["alphatab.importer.Gp3To5Importer"] = function() {
	alphatab.importer.ScoreImporter.call(this);
	this._globalTripletFeel = alphatab.model.TripletFeel.NoTripletFeel;
};
alphatab.importer.Gp3To5Importer.__name__ = ["alphatab","importer","Gp3To5Importer"];
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
		beat.tremoloSpeed = this._data.readByte();
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
			if(i > 0) notice.b += Std.string("\n");
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
	,_playbackInfos: null
	,_beatTapping: null
	,_trackCount: null
	,_barCount: null
	,_lyricsTrack: null
	,_lyrics: null
	,_lyricsIndex: null
	,_globalTripletFeel: null
	,_octave: null
	,_keySignature: null
	,_tempo: null
	,_score: null
	,_versionNumber: null
	,__class__: alphatab.importer.Gp3To5Importer
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
	duration: null
	,tempo: null
	,tempoName: null
	,instrument: null
	,balance: null
	,volume: null
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
	duration: null
	,value: null
	,type: null
	,isLinear: null
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
	,voices: null
	,track: null
	,clef: null
	,previousBar: null
	,nextBar: null
	,index: null
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
	,start: null
	,tremoloSpeed: null
	,isTremolo: function() {
		return this.tremoloSpeed >= 0;
	}
	,pickStroke: null
	,graceType: null
	,hasChord: function() {
		return this.chord != null;
	}
	,chord: null
	,vibrato: null
	,hasWhammyBar: function() {
		return this.whammyBarPoints.length > 0;
	}
	,whammyBarPoints: null
	,tupletNumerator: null
	,tupletDenominator: null
	,brushDuration: null
	,brushType: null
	,text: null
	,slap: null
	,hasRasgueado: null
	,pop: null
	,lyrics: null
	,fadeIn: null
	,dots: null
	,isRest: function() {
		return this.notes.length == 0;
	}
	,automations: null
	,duration: null
	,maxNote: null
	,minNote: null
	,notes: null
	,voice: null
	,index: null
	,nextBeat: null
	,previousBeat: null
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
	value: null
	,offset: null
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
	strings: null
	,firstFret: null
	,name: null
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
	calculateDuration: function() {
		return this.timeSignatureNumerator * alphatab.audio.MidiUtils.valueToTicks(this.timeSignatureDenominator);
	}
	,start: null
	,score: null
	,volumeAutomation: null
	,tempoAutomation: null
	,isSectionStart: function() {
		return this.section != null;
	}
	,section: null
	,tripletFeel: null
	,timeSignatureNumerator: null
	,timeSignatureDenominator: null
	,repeatCount: null
	,isRepeatEnd: function() {
		return this.repeatCount > 0;
	}
	,isRepeatStart: null
	,isDoubleBar: null
	,keySignature: null
	,index: null
	,previousMasterBar: null
	,nextMasterBar: null
	,alternateEndings: null
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
	realValue: function() {
		return this.fret + this.beat.voice.bar.track.tuning[this.string];
	}
	,dynamicValue: null
	,beat: null
	,durationPercent: null
	,trillSpeed: null
	,isTrill: function() {
		return this.trillFret >= 0;
	}
	,trillFret: null
	,isFingering: null
	,rightHandFinger: null
	,leftHandFinger: null
	,isTieDestination: null
	,isTieOrigin: null
	,tapping: null
	,isStaccato: null
	,vibrato: null
	,slideType: null
	,isDead: null
	,isPalmMute: null
	,isLetRing: null
	,harmonicType: null
	,harmonicValue: null
	,isHammerPullOrigin: null
	,isHammerPullDestination: null
	,string: null
	,isGhost: null
	,fret: null
	,hasBend: function() {
		return this.bendPoints.length > 0;
	}
	,bendPoints: null
	,accentuated: null
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
	isSolo: null
	,isMute: null
	,secondaryChannel: null
	,primaryChannel: null
	,program: null
	,port: null
	,balance: null
	,volume: null
	,__class__: alphatab.model.PlaybackInformation
}
alphatab.model.Score = $hxClasses["alphatab.model.Score"] = function() {
	this.masterBars = new Array();
	this.tracks = new Array();
};
alphatab.model.Score.__name__ = ["alphatab","model","Score"];
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
	,tracks: null
	,masterBars: null
	,tempoLabel: null
	,tempo: null
	,tab: null
	,words: null
	,title: null
	,subTitle: null
	,notices: null
	,music: null
	,instructions: null
	,copyright: null
	,artist: null
	,album: null
	,__class__: alphatab.model.Score
}
alphatab.model.Section = $hxClasses["alphatab.model.Section"] = function() {
};
alphatab.model.Section.__name__ = ["alphatab","model","Section"];
alphatab.model.Section.prototype = {
	text: null
	,marker: null
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
	addBar: function(bar) {
		bar.track = this;
		bar.index = this.bars.length;
		if(this.bars.length > 0) {
			bar.previousBar = this.bars[this.bars.length - 1];
			bar.previousBar.nextBar = bar;
		}
		this.bars.push(bar);
	}
	,bars: null
	,score: null
	,isPercussion: null
	,playbackInfo: null
	,tuningName: null
	,tuning: null
	,shortName: null
	,name: null
	,index: null
	,capo: null
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
	tuning: null
	,name: null
	,isStandard: null
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
	isEmpty: function() {
		return this.beats.length == 0;
	}
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
	,beats: null
	,bar: null
	,index: null
	,__class__: alphatab.model.Voice
}
if(!alphatab.platform) alphatab.platform = {}
alphatab.platform.ICanvas = $hxClasses["alphatab.platform.ICanvas"] = function() { }
alphatab.platform.ICanvas.__name__ = ["alphatab","platform","ICanvas"];
alphatab.platform.ICanvas.prototype = {
	measureText: null
	,strokeText: null
	,fillText: null
	,setTextAlign: null
	,setFont: null
	,stroke: null
	,fill: null
	,circle: null
	,rect: null
	,bezierCurveTo: null
	,quadraticCurveTo: null
	,lineTo: null
	,moveTo: null
	,closePath: null
	,beginPath: null
	,strokeRect: null
	,fillRect: null
	,clear: null
	,setLineWidth: null
	,setColor: null
	,setHeight: null
	,getHeight: null
	,setWidth: null
	,getWidth: null
	,__class__: alphatab.platform.ICanvas
}
alphatab.platform.IFileLoader = $hxClasses["alphatab.platform.IFileLoader"] = function() { }
alphatab.platform.IFileLoader.__name__ = ["alphatab","platform","IFileLoader"];
alphatab.platform.IFileLoader.prototype = {
	loadBinaryAsync: null
	,loadBinary: null
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
	measureText: function(text) {
		return this._context.measureText(text).width;
	}
	,strokeText: function(text,x,y) {
		this._context.strokeText(text,x,y);
	}
	,fillText: function(text,x,y) {
		this._context.fillText(text,x,y);
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
	,_height: null
	,_width: null
	,_context: null
	,_canvas: null
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
	,_higherBits: null
	,_lowerBits: null
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
	toCssString: function() {
		var buf = new StringBuf();
		if((this.getStyle() & 1) != 0) buf.b += Std.string("bold ");
		if((this.getStyle() & 2) != 0) buf.b += Std.string("italic ");
		buf.b += Std.string(this._size);
		buf.b += Std.string("px");
		buf.b += Std.string("'");
		buf.b += Std.string(this._family);
		buf.b += Std.string("'");
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
	,_style: null
	,_size: null
	,_family: null
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
	measureText: function(text) {
		var font = alphatab.platform.svg.SupportedFonts.Arial;
		if(this._font.getFamily().indexOf("Times") >= 0) font = alphatab.platform.svg.SupportedFonts.TimesNewRoman;
		return alphatab.platform.svg.FontSizes.measureString(text,font,this._font.getSize());
	}
	,getSvgBaseLine: function() {
		return "top";
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
	,strokeText: function(text,x,y) {
		this._buffer.b += Std.string("<text x=\"");
		this._buffer.b += Std.string(x);
		this._buffer.b += Std.string("\" y=\"");
		this._buffer.b += Std.string(y);
		this._buffer.b += Std.string("\" style=\"font:");
		this._buffer.b += Std.string(this._font.toCssString());
		this._buffer.b += Std.string("\" stroke:");
		this._buffer.b += Std.string(this._color.toRgbaString());
		this._buffer.b += Std.string("; stroke-width:");
		this._buffer.b += Std.string(this._lineWidth);
		this._buffer.b += Std.string(";\" ");
		this._buffer.b += Std.string(" dominant-baseline=\"");
		this._buffer.b += Std.string("top");
		this._buffer.b += Std.string("\" text-anchor=\"");
		this._buffer.b += Std.string(this.getSvgTextAlignment());
		this._buffer.b += Std.string("\">\n");
		this._buffer.b += Std.string(text);
		this._buffer.b += Std.string("</text>\n");
	}
	,fillText: function(text,x,y) {
		this._buffer.b += Std.string("<text x=\"");
		this._buffer.b += Std.string(x);
		this._buffer.b += Std.string("\" y=\"");
		this._buffer.b += Std.string(y);
		this._buffer.b += Std.string("\" style=\"font:");
		this._buffer.b += Std.string(this._font.toCssString());
		this._buffer.b += Std.string("; fill:");
		this._buffer.b += Std.string(this._color.toRgbaString());
		this._buffer.b += Std.string(";\" ");
		this._buffer.b += Std.string(" dominant-baseline=\"");
		this._buffer.b += Std.string("top");
		this._buffer.b += Std.string("\" text-anchor=\"");
		this._buffer.b += Std.string(this.getSvgTextAlignment());
		this._buffer.b += Std.string("\">\n");
		this._buffer.b += Std.string(text);
		this._buffer.b += Std.string("</text>\n");
	}
	,setTextAlign: function(textAlign) {
		this._textAlign = textAlign;
	}
	,_textAlign: null
	,setFont: function(font) {
		this._font = font;
	}
	,_font: null
	,stroke: function() {
		var path = this._currentPath.b;
		if(!this._currentPathIsEmpty) {
			this._buffer.b += Std.string("<path d=\"");
			this._buffer.b += Std.string(this._currentPath.b);
			this._buffer.b += Std.string("\" style=\"stroke:");
			this._buffer.b += Std.string(this._color.toRgbaString());
			this._buffer.b += Std.string("; stroke-width:");
			this._buffer.b += Std.string(this._lineWidth);
			this._buffer.b += Std.string(";\" fill=\"none\" />\n");
		}
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,fill: function() {
		var path = this._currentPath.b;
		if(!this._currentPathIsEmpty) {
			this._buffer.b += Std.string("<path d=\"");
			this._buffer.b += Std.string(this._currentPath.b);
			this._buffer.b += Std.string("\" style=\"fill:");
			this._buffer.b += Std.string(this._color.toRgbaString());
			this._buffer.b += Std.string("\" stroke=\"none\"/>\n");
		}
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,rect: function(x,y,w,h) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += Std.string(" M");
		this._currentPath.b += Std.string(x);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
		this._currentPath.b += Std.string(" L");
		this._currentPath.b += Std.string(x + w);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
		this._currentPath.b += Std.string(" ");
		this._currentPath.b += Std.string(x + w);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y + h);
		this._currentPath.b += Std.string(" ");
		this._currentPath.b += Std.string(x);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y + h);
		this._currentPath.b += Std.string(" z");
	}
	,circle: function(x,y,radius) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += Std.string(" M");
		this._currentPath.b += Std.string(x - radius);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
		this._currentPath.b += Std.string(" A1,1 0 0,0 ");
		this._currentPath.b += Std.string(x + radius);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
		this._currentPath.b += Std.string(" A1,1 0 0,0 ");
		this._currentPath.b += Std.string(x - radius);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
		this._currentPath.b += Std.string(" z");
	}
	,bezierCurveTo: function(cp1x,cp1y,cp2x,cp2y,x,y) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += Std.string(" C");
		this._currentPath.b += Std.string(cp1x);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(cp1y);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(cp2x);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(cp2y);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(x);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
	}
	,quadraticCurveTo: function(cpx,cpy,x,y) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += Std.string(" Q");
		this._currentPath.b += Std.string(cpx);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(cpy);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(x);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
	}
	,lineTo: function(x,y) {
		this._currentPathIsEmpty = false;
		this._currentPath.b += Std.string(" L");
		this._currentPath.b += Std.string(x);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
	}
	,moveTo: function(x,y) {
		this._currentPath.b += Std.string(" M");
		this._currentPath.b += Std.string(x);
		this._currentPath.b += Std.string(",");
		this._currentPath.b += Std.string(y);
	}
	,closePath: function() {
		this._currentPath.b += Std.string(" z");
	}
	,beginPath: function() {
	}
	,strokeRect: function(x,y,w,h) {
		this._buffer.b += Std.string("<rect x=\"");
		this._buffer.b += Std.string(x);
		this._buffer.b += Std.string("\" y=\"");
		this._buffer.b += Std.string(y);
		this._buffer.b += Std.string("\" width=\"");
		this._buffer.b += Std.string(w);
		this._buffer.b += Std.string("\" height=\"");
		this._buffer.b += Std.string(h);
		this._buffer.b += Std.string("\" style=\"stroke:");
		this._buffer.b += Std.string(this._color.toRgbaString());
		this._buffer.b += Std.string("; stroke-width:");
		this._buffer.b += Std.string(this._lineWidth);
		this._buffer.b += Std.string(";\" />\n");
	}
	,fillRect: function(x,y,w,h) {
		this._buffer.b += Std.string("<rect x=\"");
		this._buffer.b += Std.string(x);
		this._buffer.b += Std.string("\" y=\"");
		this._buffer.b += Std.string(y);
		this._buffer.b += Std.string("\" width=\"");
		this._buffer.b += Std.string(w);
		this._buffer.b += Std.string("\" height=\"");
		this._buffer.b += Std.string(h);
		this._buffer.b += Std.string("\" style=\"fill:");
		this._buffer.b += Std.string(this._color.toRgbaString());
		this._buffer.b += Std.string(";\" />\n");
	}
	,clear: function() {
		this._buffer = new StringBuf();
		this._currentPath = new StringBuf();
		this._currentPathIsEmpty = true;
	}
	,setLineWidth: function(value) {
		this._lineWidth = value;
	}
	,_lineWidth: null
	,setColor: function(color) {
		this._color = color;
	}
	,_color: null
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
	,_height: null
	,_width: null
	,_currentPathIsEmpty: null
	,_currentPath: null
	,_buffer: null
	,__class__: alphatab.platform.svg.SvgCanvas
}
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
	,_bar: null
	,bottomOverflow: null
	,topOverflow: null
	,index: null
	,height: null
	,width: null
	,y: null
	,x: null
	,stave: null
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
alphatab.rendering.GlyphBarRenderer = $hxClasses["alphatab.rendering.GlyphBarRenderer"] = function(bar) {
	alphatab.rendering.BarRendererBase.call(this,bar);
	this.glyphs = new Array();
	this.scaleGlyphs = new Array();
};
alphatab.rendering.GlyphBarRenderer.__name__ = ["alphatab","rendering","GlyphBarRenderer"];
alphatab.rendering.GlyphBarRenderer.__super__ = alphatab.rendering.BarRendererBase;
alphatab.rendering.GlyphBarRenderer.prototype = $extend(alphatab.rendering.BarRendererBase.prototype,{
	paintBackground: function(cx,cy,canvas) {
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
	,applyBarSpacing: function(spacing) {
		var oldWidth = this.width;
		this.width += spacing;
		var glyphSpacing = spacing / this.scaleGlyphs.length | 0;
		var _g1 = 0, _g = this.glyphs.length;
		while(_g1 < _g) {
			var i = _g1++;
			var g = this.glyphs[i];
			if(i == 0) g.x = 0; else g.x = this.glyphs[i - 1].x + this.glyphs[i - 1].width;
			if(g == this.scaleGlyphs[this.scaleGlyphs.length - 1]) g.applyGlyphSpacing(glyphSpacing + (spacing - glyphSpacing * this.scaleGlyphs.length)); else g.applyGlyphSpacing(glyphSpacing);
		}
	}
	,addGlyph: function(glyph,ignoreSize) {
		if(ignoreSize == null) ignoreSize = false;
		glyph.x = this.width + glyph.x;
		glyph.index = this.glyphs.length;
		glyph.renderer = this;
		glyph.doLayout();
		if(!ignoreSize && glyph.x + glyph.width > this.width) this.width = glyph.x + glyph.width;
		this.glyphs.push(glyph);
		if(!ignoreSize && glyph.canScale()) this.scaleGlyphs.push(glyph);
	}
	,createGlyphs: function() {
	}
	,doLayout: function() {
		this.createGlyphs();
	}
	,scaleGlyphs: null
	,glyphs: null
	,__class__: alphatab.rendering.GlyphBarRenderer
});
alphatab.rendering.RenderingResources = $hxClasses["alphatab.rendering.RenderingResources"] = function(scale) {
	this.init(scale);
};
alphatab.rendering.RenderingResources.__name__ = ["alphatab","rendering","RenderingResources"];
alphatab.rendering.RenderingResources.prototype = {
	init: function(scale) {
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
	,mainGlyphColor: null
	,barNumberColor: null
	,barNumberFont: null
	,barSeperatorColor: null
	,staveLineColor: null
	,tablatureFont: null
	,effectFont: null
	,wordsFont: null
	,subTitleFont: null
	,titleFont: null
	,copyrightFont: null
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
	,createAccidentalGlyph: function(n,accidentals) {
		var noteLine = this.getNoteLine(n);
		var accidental = this._accidentalHelper.applyAccidental(n,noteLine);
		switch( (accidental)[1] ) {
		case 2:
			accidentals.addGlyph(new alphatab.rendering.glyphs.SharpGlyph(0,this.getScoreY(noteLine - 1)));
			break;
		case 3:
			accidentals.addGlyph(new alphatab.rendering.glyphs.FlatGlyph(0,this.getScoreY(noteLine - 1)));
			break;
		case 1:
			accidentals.addGlyph(new alphatab.rendering.glyphs.NaturalizeGlyph(0,this.getScoreY(noteLine - 1)));
			break;
		default:
		}
	}
	,createNoteGlyph: function(n,noteglyphs) {
		var noteHeadGlyph;
		if(n.harmonicType == alphatab.model.HarmonicType.None) noteHeadGlyph = new alphatab.rendering.glyphs.NoteHeadGlyph(null,null,n.beat.duration); else noteHeadGlyph = new alphatab.rendering.glyphs.DiamondNoteHeadGlyph();
		var line = this.getNoteLine(n);
		noteHeadGlyph.y = this.getScoreY(line,-1);
		noteglyphs.addNoteGlyph(noteHeadGlyph,line);
		if(n.isStaccato && !noteglyphs.beatEffects.exists("STACCATO")) noteglyphs.beatEffects.set("STACCATO",new alphatab.rendering.glyphs.CircleGlyph(0,0,1.5));
		if(n.accentuated == alphatab.model.AccentuationType.Normal && !noteglyphs.beatEffects.exists("ACCENT")) noteglyphs.beatEffects.set("ACCENT",new alphatab.rendering.glyphs.AccentuationGlyph(0,0,alphatab.model.AccentuationType.Normal));
		if(n.accentuated == alphatab.model.AccentuationType.Heavy && !noteglyphs.beatEffects.exists("HACCENT")) noteglyphs.beatEffects.set("HACCENT",new alphatab.rendering.glyphs.AccentuationGlyph(0,0,alphatab.model.AccentuationType.Heavy));
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
	,createBeatDot: function(n,group) {
		group.addGlyph(new alphatab.rendering.glyphs.CircleGlyph(0,this.getScoreY(this.getNoteLine(n),2 * this.stave.staveGroup.layout.renderer.scale | 0),1.5 * this.stave.staveGroup.layout.renderer.scale));
	}
	,createBeatGlyphs: function(b) {
		var _g = this;
		if(!b.isRest()) {
			var noteLoop = function(action) {
				var i = b.notes.length - 1;
				while(i >= 0) action(b.notes[i--]);
			};
			var accidentals = new alphatab.rendering.glyphs.AccidentalGroupGlyph(0,0);
			noteLoop(function(n) {
				_g.createAccidentalGlyph(n,accidentals);
			});
			this.addGlyph(accidentals);
			var noteglyphs = new alphatab.rendering.glyphs.NoteChordGlyph();
			noteglyphs.beat = b;
			noteglyphs.beamingHelper = this._currentBeamHelper;
			noteLoop(function(n) {
				_g.createNoteGlyph(n,noteglyphs);
			});
			this.addGlyph(noteglyphs);
			noteglyphs.updateBeamingHelper();
			var _g1 = 0, _g2 = b.dots;
			while(_g1 < _g2) {
				var i = _g1++;
				var group = [new alphatab.rendering.glyphs.GlyphGroup()];
				noteLoop((function(group) {
					return function(n) {
						_g.createBeatDot(n,group[0]);
					};
				})(group));
				this.addGlyph(group[0]);
			}
		} else this.createRestGlyph(b);
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,this.getBeatDurationWidth(b.duration) * this.stave.staveGroup.layout.renderer.scale | 0));
	}
	,applyBarSpacing: function(spacing) {
		alphatab.rendering.GlyphBarRenderer.prototype.applyBarSpacing.call(this,spacing);
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
	,createTimeSignatureGlyphs: function() {
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,5 * this.stave.staveGroup.layout.renderer.scale | 0,false));
		this.addGlyph(new alphatab.rendering.glyphs.TimeSignatureGlyph(0,0,this._bar.getMasterBar().timeSignatureNumerator,this._bar.getMasterBar().timeSignatureDenominator));
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
			this.addGlyph(new alphatab.rendering.glyphs.NaturalizeGlyph(0,this.getScoreY(previousKeyPositions[i] + offsetClef) | 0));
		}
		var offsetSymbols = currentKey <= 7?currentKey:currentKey - 7;
		if(currentKey > 0) {
			var _g1 = 0, _g = Math.abs(currentKey) | 0;
			while(_g1 < _g) {
				var i = _g1++;
				this.addGlyph(new alphatab.rendering.glyphs.SharpGlyph(0,this.getScoreY(alphatab.rendering.ScoreBarRenderer.SHARP_KS_STEPS[i] + offsetClef) | 0));
			}
		} else {
			var _g1 = 0, _g = Math.abs(currentKey) | 0;
			while(_g1 < _g) {
				var i = _g1++;
				this.addGlyph(new alphatab.rendering.glyphs.FlatGlyph(0,this.getScoreY(alphatab.rendering.ScoreBarRenderer.FLAT_KS_STEPS[i] + offsetClef) | 0));
			}
		}
	}
	,createStartGlyphs: function() {
		if(this.index == 0 || this._bar.clef != this._bar.previousBar.clef) {
			var offset = 0;
			switch( (this._bar.clef)[1] ) {
			case 2:
				offset = 4;
				break;
			case 0:
				offset = 0;
				break;
			case 1:
				offset = 0;
				break;
			case 3:
				offset = 6;
				break;
			default:
				offset = 0;
			}
			this.createStartSpacing();
			this.addGlyph(new alphatab.rendering.glyphs.ClefGlyph(0,this.getScoreY(offset),this._bar.clef));
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
	,createBarEndGlyphs: function() {
		if(this._bar.getMasterBar().repeatCount > 0) {
			this.addGlyph(new alphatab.rendering.glyphs.RepeatCloseGlyph(this.x,0));
			if(this._bar.getMasterBar().repeatCount > 1) {
				var line = this._bar.index == this._bar.track.bars.length - 1 || this.index == this.stave.barRenderers.length - 1?-1:-4;
				this.addGlyph(new alphatab.rendering.glyphs.RepeatCountGlyph(0,this.getScoreY(line,-3),this._bar.getMasterBar().repeatCount + 1));
			}
		} else if(this._bar.getMasterBar().isDoubleBar) {
			this.addGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph());
			this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,3 * this.stave.staveGroup.layout.renderer.scale | 0,false));
			this.addGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph());
		} else if(this._bar.nextBar == null || !this._bar.nextBar.getMasterBar().isRepeatStart) this.addGlyph(new alphatab.rendering.glyphs.BarSeperatorGlyph(0,0,this._bar.index == this._bar.track.bars.length - 1));
	}
	,createBarStartGlyphs: function() {
		if(this._bar.getMasterBar().isRepeatStart) this.addGlyph(new alphatab.rendering.glyphs.RepeatOpenGlyph());
	}
	,createStartSpacing: function() {
		if(this._startSpacing) return;
		this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,2 * this.stave.staveGroup.layout.renderer.scale | 0,false));
		this._startSpacing = true;
	}
	,_startSpacing: null
	,createGlyphs: function() {
		this.createBarStartGlyphs();
		this.createStartGlyphs();
		if(this._bar.isEmpty()) this.addGlyph(new alphatab.rendering.glyphs.SpacingGlyph(0,0,30 * this.stave.staveGroup.layout.renderer.scale | 0,false));
		this.createVoiceGlyphs(this._bar.voices[0]);
		this.createBarEndGlyphs();
	}
	,paintFooter: function(cx,cy,canvas,h) {
		var beat = h.beats[0];
		var stemSize = this.getStemSize(h.maxDuration);
		var correction = 4;
		var beatLineX = h.getBeatLineX(beat) + this.stave.staveGroup.layout.renderer.scale | 0;
		var direction = h.getDirection();
		var topY = this.getScoreY(this.getNoteLine(beat.maxNote),correction - 1);
		var bottomY = this.getScoreY(this.getNoteLine(beat.minNote),correction - 1);
		var beamY;
		if(direction == alphatab.rendering.utils.BeamDirection.Down) {
			bottomY += stemSize;
			beamY = bottomY + 3 * this.stave.staveGroup.layout.renderer.scale | 0;
		} else {
			topY -= stemSize;
			beamY = topY - 6 * this.stave.staveGroup.layout.renderer.scale | 0;
		}
		canvas.setColor(this.stave.staveGroup.layout.renderer.renderingResources.mainGlyphColor);
		canvas.beginPath();
		canvas.moveTo(cx + this.x + beatLineX | 0,cy + this.y + topY);
		canvas.lineTo(cx + this.x + beatLineX | 0,cy + this.y + bottomY);
		canvas.stroke();
		var gx = beatLineX - this.stave.staveGroup.layout.renderer.scale | 0;
		var glyph = new alphatab.rendering.glyphs.BeamGlyph(gx,beamY,beat.duration,direction);
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
			this.paintBeamHelper(cx,cy,canvas,h);
		}
	}
	,paint: function(cx,cy,canvas) {
		alphatab.rendering.GlyphBarRenderer.prototype.paint.call(this,cx,cy,canvas);
		this.paintBeams(cx,cy,canvas);
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
	,_currentBeamHelper: null
	,_beamHelpers: null
	,_accidentalHelper: null
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
	getLayoutSetting: function(setting,defaultValue) {
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
	,paintBackground: function() {
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
	,getScore: function() {
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
	,settings: null
	,renderingResources: null
	,layout: null
	,scale: null
	,track: null
	,score: null
	,canvas: null
	,__class__: alphatab.rendering.ScoreRenderer
	,__properties__: {get_score:"getScore"}
}
alphatab.rendering.TabBarRenderer = $hxClasses["alphatab.rendering.TabBarRenderer"] = function(bar) {
	alphatab.rendering.GlyphBarRenderer.call(this,bar);
};
alphatab.rendering.TabBarRenderer.__name__ = ["alphatab","rendering","TabBarRenderer"];
alphatab.rendering.TabBarRenderer.__super__ = alphatab.rendering.GlyphBarRenderer;
alphatab.rendering.TabBarRenderer.prototype = $extend(alphatab.rendering.GlyphBarRenderer.prototype,{
	paintBackground: function(cx,cy,canvas) {
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
	,getNumberOverflow: function() {
		var res = this.stave.staveGroup.layout.renderer.renderingResources;
		return res.tablatureFont.getSize() / 2 + res.tablatureFont.getSize() * 0.2 | 0;
	}
	,createGlyphs: function() {
		alphatab.rendering.GlyphBarRenderer.prototype.createGlyphs.call(this);
		this.addGlyph(new alphatab.rendering.glyphs.DummyTablatureGlyph(0,0));
		this.addGlyph(new alphatab.rendering.glyphs.DummyTablatureGlyph(0,0));
		this.addGlyph(new alphatab.rendering.glyphs.DummyTablatureGlyph(0,0));
	}
	,doLayout: function() {
		alphatab.rendering.GlyphBarRenderer.prototype.doLayout.call(this);
		this.height = (11 * this.stave.staveGroup.layout.renderer.scale * (this._bar.track.tuning.length - 1) | 0) + this.getNumberOverflow() * 2;
		if(this.index == 0) {
			this.stave.registerStaveTop(this.getNumberOverflow());
			this.stave.registerStaveBottom(this.height - this.getNumberOverflow());
		}
	}
	,getLineOffset: function() {
		return 11 * this.stave.staveGroup.layout.renderer.scale;
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
alphatab.rendering.glyphs.AccentuationGlyph = $hxClasses["alphatab.rendering.glyphs.AccentuationGlyph"] = function(x,y,accentuation) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getSvg(accentuation),1,1);
};
alphatab.rendering.glyphs.AccentuationGlyph.__name__ = ["alphatab","rendering","glyphs","AccentuationGlyph"];
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
alphatab.rendering.glyphs.GlyphGroup = $hxClasses["alphatab.rendering.glyphs.GlyphGroup"] = function(x,y,glyphs) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._glyphs = glyphs != null?glyphs:new Array();
};
alphatab.rendering.glyphs.GlyphGroup.__name__ = ["alphatab","rendering","glyphs","GlyphGroup"];
alphatab.rendering.glyphs.GlyphGroup.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.GlyphGroup.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
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
	,_glyphs: null
	,__class__: alphatab.rendering.glyphs.GlyphGroup
});
alphatab.rendering.glyphs.AccidentalGroupGlyph = $hxClasses["alphatab.rendering.glyphs.AccidentalGroupGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.GlyphGroup.call(this,x,y,new Array());
};
alphatab.rendering.glyphs.AccidentalGroupGlyph.__name__ = ["alphatab","rendering","glyphs","AccidentalGroupGlyph"];
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
		this.width = columnWidth * columns.length;
		var _g = 0, _g1 = this._glyphs;
		while(_g < _g1.length) {
			var g = _g1[_g];
			++_g;
			g.x = this.width - (g.x + 1) * columnWidth;
		}
	}
	,__class__: alphatab.rendering.glyphs.AccidentalGroupGlyph
});
alphatab.rendering.glyphs.BarNumberGlyph = $hxClasses["alphatab.rendering.glyphs.BarNumberGlyph"] = function(x,y,number) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._number = number;
};
alphatab.rendering.glyphs.BarNumberGlyph.__name__ = ["alphatab","rendering","glyphs","BarNumberGlyph"];
alphatab.rendering.glyphs.BarNumberGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.BarNumberGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
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
	,_number: null
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
	,_isLast: null
	,__class__: alphatab.rendering.glyphs.BarSeperatorGlyph
});
alphatab.rendering.glyphs.BeamGlyph = $hxClasses["alphatab.rendering.glyphs.BeamGlyph"] = function(x,y,duration,direction) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getRestSvg(duration,direction),1,this.getSvgScale(duration,direction));
};
alphatab.rendering.glyphs.BeamGlyph.__name__ = ["alphatab","rendering","glyphs","BeamGlyph"];
alphatab.rendering.glyphs.BeamGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.BeamGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	getRestSvg: function(duration,direction) {
		switch( (duration)[1] ) {
		case 3:
			return alphatab.rendering.glyphs.MusicFont.FooterEighth;
		case 4:
			return alphatab.rendering.glyphs.MusicFont.FooterSixteenth;
		default:
			return "";
		}
	}
	,doLayout: function() {
		this.width = 0;
	}
	,getSvgScale: function(duration,direction) {
		if(direction == alphatab.rendering.utils.BeamDirection.Up) return 1; else return -1;
	}
	,__class__: alphatab.rendering.glyphs.BeamGlyph
});
alphatab.rendering.glyphs.CircleGlyph = $hxClasses["alphatab.rendering.glyphs.CircleGlyph"] = function(x,y,size) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._size = size;
};
alphatab.rendering.glyphs.CircleGlyph.__name__ = ["alphatab","rendering","glyphs","CircleGlyph"];
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
	,_size: null
	,__class__: alphatab.rendering.glyphs.CircleGlyph
});
alphatab.rendering.glyphs.ClefGlyph = $hxClasses["alphatab.rendering.glyphs.ClefGlyph"] = function(x,y,clef) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getClefSvg(clef),1,1);
};
alphatab.rendering.glyphs.ClefGlyph.__name__ = ["alphatab","rendering","glyphs","ClefGlyph"];
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
		default:
			return "";
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
alphatab.rendering.glyphs.DiamondNoteHeadGlyph = $hxClasses["alphatab.rendering.glyphs.DiamondNoteHeadGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.NoteHarmonic,1,1);
};
alphatab.rendering.glyphs.DiamondNoteHeadGlyph.__name__ = ["alphatab","rendering","glyphs","DiamondNoteHeadGlyph"];
alphatab.rendering.glyphs.DiamondNoteHeadGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.DiamondNoteHeadGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 9 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.DiamondNoteHeadGlyph
});
alphatab.rendering.glyphs.DigitGlyph = $hxClasses["alphatab.rendering.glyphs.DigitGlyph"] = function(x,y,digit) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getDigit(digit),1,1);
	this._digit = digit;
};
alphatab.rendering.glyphs.DigitGlyph.__name__ = ["alphatab","rendering","glyphs","DigitGlyph"];
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
	,_digit: null
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
	paint: function(cx,cy,canvas) {
		var res = this.renderer.stave.staveGroup.layout.renderer.renderingResources;
		canvas.setColor(new alphatab.platform.model.Color(Std.random(256),Std.random(256),Std.random(256),128));
		canvas.fillRect(cx + this.x,cy + this.y,this.width,this.renderer.height);
		canvas.setFont(res.tablatureFont);
		canvas.setColor(new alphatab.platform.model.Color(0,0,0));
		canvas.fillText("0 1 2 3 4 5 6 7 9 0",cx + this.x,cy + this.y);
	}
	,doLayout: function() {
		this.width = 100;
	}
	,__class__: alphatab.rendering.glyphs.DummyTablatureGlyph
});
alphatab.rendering.glyphs.FlatGlyph = $hxClasses["alphatab.rendering.glyphs.FlatGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.AccidentalFlat,1,1);
};
alphatab.rendering.glyphs.FlatGlyph.__name__ = ["alphatab","rendering","glyphs","FlatGlyph"];
alphatab.rendering.glyphs.FlatGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.FlatGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.FlatGlyph
});
alphatab.rendering.glyphs.MusicFont = $hxClasses["alphatab.rendering.glyphs.MusicFont"] = function() { }
alphatab.rendering.glyphs.MusicFont.__name__ = ["alphatab","rendering","glyphs","MusicFont"];
alphatab.rendering.glyphs.NaturalizeGlyph = $hxClasses["alphatab.rendering.glyphs.NaturalizeGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.AccidentalNatural,1,1);
};
alphatab.rendering.glyphs.NaturalizeGlyph.__name__ = ["alphatab","rendering","glyphs","NaturalizeGlyph"];
alphatab.rendering.glyphs.NaturalizeGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.NaturalizeGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
	}
	,__class__: alphatab.rendering.glyphs.NaturalizeGlyph
});
alphatab.rendering.glyphs.NoteChordGlyph = $hxClasses["alphatab.rendering.glyphs.NoteChordGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._infos = new Array();
	this.beatEffects = new Hash();
};
alphatab.rendering.glyphs.NoteChordGlyph.__name__ = ["alphatab","rendering","glyphs","NoteChordGlyph"];
alphatab.rendering.glyphs.NoteChordGlyph.__super__ = alphatab.rendering.Glyph;
alphatab.rendering.glyphs.NoteChordGlyph.prototype = $extend(alphatab.rendering.Glyph.prototype,{
	paint: function(cx,cy,canvas) {
		var scoreRenderer = this.renderer;
		var effectY = this.beamingHelper.getDirection() == alphatab.rendering.utils.BeamDirection.Up?scoreRenderer.getScoreY(this.maxNote.line,13):scoreRenderer.getScoreY(this.minNote.line,-4);
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
			g.glyph.paint(cx + this.x,cy + this.y,canvas);
		}
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
	,applyGlyphSpacing: function(spacing) {
		alphatab.rendering.Glyph.prototype.applyGlyphSpacing.call(this,spacing);
		this.updateBeamingHelper();
	}
	,updateBeamingHelper: function() {
		this.beamingHelper.registerBeatLineX(this.beat,this.x + this.upLineX,this.x + this.downLineX);
	}
	,canScale: function() {
		return false;
	}
	,addNoteGlyph: function(noteGlyph,noteLine) {
		var info = { glyph : noteGlyph, line : noteLine};
		this._infos.push(info);
		if(this.minNote == null || this.minNote.line > info.line) this.minNote = info;
		if(this.maxNote == null || this.maxNote.line < info.line) this.maxNote = info;
	}
	,beamingHelper: null
	,beat: null
	,beatEffects: null
	,downLineX: null
	,upLineX: null
	,spacingChanged: null
	,maxNote: null
	,minNote: null
	,_infos: null
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
	getNoteSvg: function(duration) {
		switch( (duration)[1] ) {
		case 0:
			return alphatab.rendering.glyphs.MusicFont.NoteHalf;
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
		this.width = 9 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
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
	,_number: null
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
alphatab.rendering.glyphs.RepeatCountGlyph = $hxClasses["alphatab.rendering.glyphs.RepeatCountGlyph"] = function(x,y,count) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.Glyph.call(this,x,y);
	this._count = count;
};
alphatab.rendering.glyphs.RepeatCountGlyph.__name__ = ["alphatab","rendering","glyphs","RepeatCountGlyph"];
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
	,_count: null
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
		var circleSize = 1.5 * this.renderer.stave.staveGroup.layout.renderer.scale;
		var middle = (top + bottom) / 2;
		var dotOffset = 3;
		canvas.beginPath();
		canvas.circle(left,middle - circleSize * dotOffset,circleSize);
		canvas.circle(left,middle + circleSize * dotOffset,circleSize);
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
alphatab.rendering.glyphs.RestGlyph = $hxClasses["alphatab.rendering.glyphs.RestGlyph"] = function(x,y,duration) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,this.getRestSvg(duration),1,1);
};
alphatab.rendering.glyphs.RestGlyph.__name__ = ["alphatab","rendering","glyphs","RestGlyph"];
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
	,__class__: alphatab.rendering.glyphs.RestGlyph
});
alphatab.rendering.glyphs.SharpGlyph = $hxClasses["alphatab.rendering.glyphs.SharpGlyph"] = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	alphatab.rendering.glyphs.SvgGlyph.call(this,x,y,alphatab.rendering.glyphs.MusicFont.AccidentalSharp,1,1);
};
alphatab.rendering.glyphs.SharpGlyph.__name__ = ["alphatab","rendering","glyphs","SharpGlyph"];
alphatab.rendering.glyphs.SharpGlyph.__super__ = alphatab.rendering.glyphs.SvgGlyph;
alphatab.rendering.glyphs.SharpGlyph.prototype = $extend(alphatab.rendering.glyphs.SvgGlyph.prototype,{
	canScale: function() {
		return false;
	}
	,doLayout: function() {
		this.width = 8 * this.renderer.stave.staveGroup.layout.renderer.scale | 0;
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
	canScale: function() {
		return this._scaling;
	}
	,_scaling: null
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
	,_denominator: null
	,_numerator: null
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
	createEmptyStaveGroup: function() {
		var group = new alphatab.rendering.staves.StaveGroup();
		group.layout = this;
		group.addStave(new alphatab.rendering.staves.Stave(new alphatab.rendering.ScoreBarRendererFactory()));
		return group;
	}
	,paintScore: function() {
	}
	,doLayout: function() {
	}
	,height: null
	,width: null
	,renderer: null
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
	,_groups: null
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
	paint: function(cx,cy,canvas) {
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
		var _g1 = 0, _g = this.barRenderers.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.barRenderers[i].x = x;
			this.barRenderers[i].y = this.topSpacing + topOverflow;
			this.height = Math.max(this.height,this.barRenderers[i].height) | 0;
			x += this.barRenderers[i].width;
		}
		this.height += this.topSpacing + topOverflow + bottomOverflow + this.bottomSpacing;
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
	,staveBottom: null
	,bottomSpacing: null
	,topSpacing: null
	,staveTop: null
	,index: null
	,height: null
	,y: null
	,x: null
	,barRenderers: null
	,_factory: null
	,staveGroup: null
	,__class__: alphatab.rendering.staves.Stave
}
alphatab.rendering.staves.StaveGroup = $hxClasses["alphatab.rendering.staves.StaveGroup"] = function() {
	this.bars = new Array();
	this.staves = new Array();
	this.width = 0;
};
alphatab.rendering.staves.StaveGroup.__name__ = ["alphatab","rendering","staves","StaveGroup"];
alphatab.rendering.staves.StaveGroup.prototype = {
	finalizeGroup: function(scoreLayout) {
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
	,paint: function(cx,cy,canvas) {
		var _g = 0, _g1 = this.staves;
		while(_g < _g1.length) {
			var s = _g1[_g];
			++_g;
			s.paint(cx + this.x,cy + this.y,canvas);
		}
		var res = this.layout.renderer.renderingResources;
		if(this.staves.length > 0) {
			var firstStart = cy + this.y + this.staves[0].y + this.staves[0].staveTop + this.staves[0].topSpacing + this.staves[0].getTopOverflow();
			var lastEnd = cy + this.y + this.staves[this.staves.length - 1].y + this.staves[this.staves.length - 1].height - this.staves[this.staves.length - 1].getBottomOverflow() - this.staves[this.staves.length - 1].bottomSpacing - this.staves[this.staves.length - 1].staveBottom;
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
	,getLastBarIndex: function() {
		return this.bars[this.bars.length - 1].index;
	}
	,layout: null
	,staves: null
	,bars: null
	,width: null
	,isFull: null
	,y: null
	,x: null
	,__class__: alphatab.rendering.staves.StaveGroup
}
if(!alphatab.rendering.utils) alphatab.rendering.utils = {}
alphatab.rendering.utils.AccidentalHelper = $hxClasses["alphatab.rendering.utils.AccidentalHelper"] = function() {
	this._registeredAccidentals = new IntHash();
};
alphatab.rendering.utils.AccidentalHelper.__name__ = ["alphatab","rendering","utils","AccidentalHelper"];
alphatab.rendering.utils.AccidentalHelper.prototype = {
	getKeySignatureIndex: function(ks) {
		return ks + 7;
	}
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
	,_registeredAccidentals: null
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
	,_beatLineXPositions: null
	,valueCalculator: null
	,maxNote: null
	,minNote: null
	,lastMaxNote: null
	,lastMinNote: null
	,firstMaxNote: null
	,firstMinNote: null
	,maxDuration: null
	,_lastBeat: null
	,beats: null
	,__class__: alphatab.rendering.utils.BeamingHelper
}
alphatab.rendering.utils.SvgPathParser = $hxClasses["alphatab.rendering.utils.SvgPathParser"] = function(svg) {
	this.svg = svg;
};
alphatab.rendering.utils.SvgPathParser.__name__ = ["alphatab","rendering","utils","SvgPathParser"];
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
	,_currentIndex: null
	,currentToken: null
	,lastCommand: null
	,svg: null
	,__class__: alphatab.rendering.utils.SvgPathParser
}
var haxe = haxe || {}
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
haxe.Resource = $hxClasses["haxe.Resource"] = function() { }
haxe.Resource.__name__ = ["haxe","Resource"];
haxe.Resource.content = null;
haxe.Resource.listNames = function() {
	var names = new Array();
	var _g = 0, _g1 = haxe.Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		names.push(x.name);
	}
	return names;
}
haxe.Resource.getString = function(name) {
	var _g = 0, _g1 = haxe.Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		if(x.name == name) {
			if(x.str != null) return x.str;
			var b = haxe.Unserializer.run(x.data);
			return b.toString();
		}
	}
	return null;
}
haxe.Resource.getBytes = function(name) {
	var _g = 0, _g1 = haxe.Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		if(x.name == name) {
			if(x.str != null) return haxe.io.Bytes.ofString(x.str);
			return haxe.Unserializer.run(x.data);
		}
	}
	return null;
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
	var a = haxe.Stack.makeStack(new Error().stack);
	a.shift();
	Error.prepareStackTrace = oldValue;
	return a;
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
		b.b += Std.string("\nCalled from ");
		haxe.Stack.itemToString(b,s);
	}
	return b.b;
}
haxe.Stack.itemToString = function(b,s) {
	var $e = (s);
	switch( $e[1] ) {
	case 0:
		b.b += Std.string("a C function");
		break;
	case 1:
		var m = $e[2];
		b.b += Std.string("module ");
		b.b += Std.string(m);
		break;
	case 2:
		var line = $e[4], file = $e[3], s1 = $e[2];
		if(s1 != null) {
			haxe.Stack.itemToString(b,s1);
			b.b += Std.string(" (");
		}
		b.b += Std.string(file);
		b.b += Std.string(" line ");
		b.b += Std.string(line);
		if(s1 != null) b.b += Std.string(")");
		break;
	case 3:
		var meth = $e[3], cname = $e[2];
		b.b += Std.string(cname);
		b.b += Std.string(".");
		b.b += Std.string(meth);
		break;
	case 4:
		var n = $e[2];
		b.b += Std.string("local function #");
		b.b += Std.string(n);
		break;
	}
}
haxe.Stack.makeStack = function(s) {
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
haxe.Unserializer = $hxClasses["haxe.Unserializer"] = function(buf) {
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
haxe.Unserializer.run = function(v) {
	return new haxe.Unserializer(v).unserialize();
}
haxe.Unserializer.prototype = {
	unserialize: function() {
		switch(this.buf.charCodeAt(this.pos++)) {
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
			var h = new Hash();
			this.cache.push(h);
			var buf = this.buf;
			while(this.buf.charCodeAt(this.pos) != 104) {
				var s = this.unserialize();
				h.set(s,this.unserialize());
			}
			this.pos++;
			return h;
		case 113:
			var h = new IntHash();
			this.cache.push(h);
			var buf = this.buf;
			var c = this.buf.charCodeAt(this.pos++);
			while(c == 58) {
				var i = this.readDigits();
				h.set(i,this.unserialize());
				c = this.buf.charCodeAt(this.pos++);
			}
			if(c != 104) throw "Invalid IntHash format";
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
	,get: function(p) {
		return this.buf.charCodeAt(p);
	}
	,getResolver: function() {
		return this.resolver;
	}
	,setResolver: function(r) {
		if(r == null) this.resolver = { resolveClass : function(_) {
			return null;
		}, resolveEnum : function(_) {
			return null;
		}}; else this.resolver = r;
	}
	,resolver: null
	,scache: null
	,cache: null
	,length: null
	,pos: null
	,buf: null
	,__class__: haxe.Unserializer
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
	getData: function() {
		return this.b;
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
			s.b += String.fromCharCode(chars[c >> 4]);
			s.b += String.fromCharCode(chars[c & 15]);
		}
		return s.b;
	}
	,toString: function() {
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
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,get: function(pos) {
		return this.b[pos];
	}
	,b: null
	,length: null
	,__class__: haxe.io.Bytes
}
haxe.io.BytesBuffer = $hxClasses["haxe.io.BytesBuffer"] = function() {
	this.b = new Array();
};
haxe.io.BytesBuffer.__name__ = ["haxe","io","BytesBuffer"];
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
	,add: function(src) {
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = 0, _g = src.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,addByte: function($byte) {
		this.b.push($byte);
	}
	,b: null
	,__class__: haxe.io.BytesBuffer
}
haxe.io.Input = $hxClasses["haxe.io.Input"] = function() { }
haxe.io.Input.__name__ = ["haxe","io","Input"];
haxe.io.Input.prototype = {
	getDoubleSig: function(bytes) {
		return Std.parseInt((((bytes[1] & 15) << 16 | bytes[2] << 8 | bytes[3]) * Math.pow(2,32)).toString()) + Std.parseInt(((bytes[4] >> 7) * Math.pow(2,31)).toString()) + Std.parseInt(((bytes[4] & 127) << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7]).toString());
	}
	,readString: function(len) {
		var b = haxe.io.Bytes.alloc(len);
		this.readFullBytes(b,0,len);
		return b.toString();
	}
	,readInt32: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		return this.bigEndian?(ch1 << 8 | ch2) << 16 | (ch3 << 8 | ch4):(ch4 << 8 | ch3) << 16 | (ch2 << 8 | ch1);
	}
	,readUInt30: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		if((this.bigEndian?ch1:ch4) >= 64) throw haxe.io.Error.Overflow;
		return this.bigEndian?ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24:ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
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
	,readUInt24: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		return this.bigEndian?ch3 | ch2 << 8 | ch1 << 16:ch1 | ch2 << 8 | ch3 << 16;
	}
	,readInt24: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var n = this.bigEndian?ch3 | ch2 << 8 | ch1 << 16:ch1 | ch2 << 8 | ch3 << 16;
		if((n & 8388608) != 0) return n - 16777216;
		return n;
	}
	,readUInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		return this.bigEndian?ch2 | ch1 << 8:ch1 | ch2 << 8;
	}
	,readInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var n = this.bigEndian?ch2 | ch1 << 8:ch1 | ch2 << 8;
		if((n & 32768) != 0) return n - 65536;
		return n;
	}
	,readInt8: function() {
		var n = this.readByte();
		if(n >= 128) return n - 256;
		return n;
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
	,readLine: function() {
		var buf = new StringBuf();
		var last;
		var s;
		try {
			while((last = this.readByte()) != 10) buf.b += String.fromCharCode(last);
			s = buf.b;
			if(HxOverrides.cca(s,s.length - 1) == 13) s = HxOverrides.substr(s,0,-1);
		} catch( e ) {
			if( js.Boot.__instanceof(e,haxe.io.Eof) ) {
				s = buf.b;
				if(s.length == 0) throw e;
			} else throw(e);
		}
		return s;
	}
	,readUntil: function(end) {
		var buf = new StringBuf();
		var last;
		while((last = this.readByte()) != end) buf.b += String.fromCharCode(last);
		return buf.b;
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
	,setEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,close: function() {
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
	,bigEndian: null
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
	,len: null
	,pos: null
	,b: null
	,__class__: haxe.io.BytesInput
});
haxe.io.Output = $hxClasses["haxe.io.Output"] = function() { }
haxe.io.Output.__name__ = ["haxe","io","Output"];
haxe.io.Output.prototype = {
	writeString: function(s) {
		var b = haxe.io.Bytes.ofString(s);
		this.writeFullBytes(b,0,b.length);
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
	,prepare: function(nbytes) {
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
	,writeInt24: function(x) {
		if(x < -8388608 || x >= 8388608) throw haxe.io.Error.Overflow;
		this.writeUInt24(x & 16777215);
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
	,writeInt16: function(x) {
		if(x < -32768 || x >= 32768) throw haxe.io.Error.Overflow;
		this.writeUInt16(x & 65535);
	}
	,writeInt8: function(x) {
		if(x < -128 || x >= 128) throw haxe.io.Error.Overflow;
		this.writeByte(x & 255);
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
	,writeFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.writeBytes(s,pos,len);
			pos += k;
			len -= k;
		}
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
	,setEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,close: function() {
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
	,bigEndian: null
	,__class__: haxe.io.Output
	,__properties__: {set_bigEndian:"setEndian"}
}
haxe.io.BytesOutput = $hxClasses["haxe.io.BytesOutput"] = function() {
	this.b = new haxe.io.BytesBuffer();
};
haxe.io.BytesOutput.__name__ = ["haxe","io","BytesOutput"];
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
	,b: null
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
if(!haxe.xml) haxe.xml = {}
if(!haxe.xml._Fast) haxe.xml._Fast = {}
haxe.xml._Fast.NodeAccess = $hxClasses["haxe.xml._Fast.NodeAccess"] = function(x) {
	this.__x = x;
};
haxe.xml._Fast.NodeAccess.__name__ = ["haxe","xml","_Fast","NodeAccess"];
haxe.xml._Fast.NodeAccess.prototype = {
	resolve: function(name) {
		var x = this.__x.elementsNamed(name).next();
		if(x == null) {
			var xname = this.__x.nodeType == Xml.Document?"Document":this.__x.getNodeName();
			throw xname + " is missing element " + name;
		}
		return new haxe.xml.Fast(x);
	}
	,__x: null
	,__class__: haxe.xml._Fast.NodeAccess
}
haxe.xml._Fast.AttribAccess = $hxClasses["haxe.xml._Fast.AttribAccess"] = function(x) {
	this.__x = x;
};
haxe.xml._Fast.AttribAccess.__name__ = ["haxe","xml","_Fast","AttribAccess"];
haxe.xml._Fast.AttribAccess.prototype = {
	resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		var v = this.__x.get(name);
		if(v == null) throw this.__x.getNodeName() + " is missing attribute " + name;
		return v;
	}
	,__x: null
	,__class__: haxe.xml._Fast.AttribAccess
}
haxe.xml._Fast.HasAttribAccess = $hxClasses["haxe.xml._Fast.HasAttribAccess"] = function(x) {
	this.__x = x;
};
haxe.xml._Fast.HasAttribAccess.__name__ = ["haxe","xml","_Fast","HasAttribAccess"];
haxe.xml._Fast.HasAttribAccess.prototype = {
	resolve: function(name) {
		if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
		return this.__x.exists(name);
	}
	,__x: null
	,__class__: haxe.xml._Fast.HasAttribAccess
}
haxe.xml._Fast.HasNodeAccess = $hxClasses["haxe.xml._Fast.HasNodeAccess"] = function(x) {
	this.__x = x;
};
haxe.xml._Fast.HasNodeAccess.__name__ = ["haxe","xml","_Fast","HasNodeAccess"];
haxe.xml._Fast.HasNodeAccess.prototype = {
	resolve: function(name) {
		return this.__x.elementsNamed(name).hasNext();
	}
	,__x: null
	,__class__: haxe.xml._Fast.HasNodeAccess
}
haxe.xml._Fast.NodeListAccess = $hxClasses["haxe.xml._Fast.NodeListAccess"] = function(x) {
	this.__x = x;
};
haxe.xml._Fast.NodeListAccess.__name__ = ["haxe","xml","_Fast","NodeListAccess"];
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
	,__x: null
	,__class__: haxe.xml._Fast.NodeListAccess
}
haxe.xml.Fast = $hxClasses["haxe.xml.Fast"] = function(x) {
	if(x.nodeType != Xml.Document && x.nodeType != Xml.Element) throw "Invalid nodeType " + Std.string(x.nodeType);
	this.x = x;
	this.node = new haxe.xml._Fast.NodeAccess(x);
	this.nodes = new haxe.xml._Fast.NodeListAccess(x);
	this.att = new haxe.xml._Fast.AttribAccess(x);
	this.has = new haxe.xml._Fast.HasAttribAccess(x);
	this.hasNode = new haxe.xml._Fast.HasNodeAccess(x);
};
haxe.xml.Fast.__name__ = ["haxe","xml","Fast"];
haxe.xml.Fast.prototype = {
	getElements: function() {
		var it = this.x.elements();
		return { hasNext : $bind(it,it.hasNext), next : function() {
			var x = it.next();
			if(x == null) return null;
			return new haxe.xml.Fast(x);
		}};
	}
	,getInnerHTML: function() {
		var s = new StringBuf();
		var $it0 = this.x.iterator();
		while( $it0.hasNext() ) {
			var x = $it0.next();
			s.b += Std.string(x.toString());
		}
		return s.b;
	}
	,getInnerData: function() {
		var it = this.x.iterator();
		if(!it.hasNext()) throw this.getName() + " does not have data";
		var v = it.next();
		var n = it.next();
		if(n != null) {
			if(v.nodeType == Xml.PCData && n.nodeType == Xml.CData && StringTools.trim(v.getNodeValue()) == "") {
				var n2 = it.next();
				if(n2 == null || n2.nodeType == Xml.PCData && StringTools.trim(n2.getNodeValue()) == "" && it.next() == null) return n.getNodeValue();
			}
			throw this.getName() + " does not only have data";
		}
		if(v.nodeType != Xml.PCData && v.nodeType != Xml.CData) throw this.getName() + " does not have data";
		return v.getNodeValue();
	}
	,getName: function() {
		return this.x.nodeType == Xml.Document?"Document":this.x.getNodeName();
	}
	,elements: null
	,hasNode: null
	,has: null
	,att: null
	,nodes: null
	,node: null
	,innerHTML: null
	,innerData: null
	,name: null
	,x: null
	,__class__: haxe.xml.Fast
	,__properties__: {get_name:"getName",get_innerData:"getInnerData",get_innerHTML:"getInnerHTML",get_elements:"getElements"}
}
haxe.xml.Parser = $hxClasses["haxe.xml.Parser"] = function() { }
haxe.xml.Parser.__name__ = ["haxe","xml","Parser"];
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
				var child = Xml.createPCData(HxOverrides.substr(str,start,p - start));
				parent.addChild(child);
				nsubs++;
				state = 0;
				next = 2;
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
				if(v != parent.getNodeName()) throw "Expected </" + parent.getNodeName() + ">";
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
				parent.addChild(Xml.createProlog(str1));
				state = 1;
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
		if(p != start || nsubs == 0) parent.addChild(Xml.createPCData(HxOverrides.substr(str,start,p - start)));
		return p;
	}
	throw "Unexpected end";
}
haxe.xml.Parser.isValidChar = function(c) {
	return c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c == 58 || c == 46 || c == 95 || c == 45;
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
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof(console) != "undefined" && console.log != null) console.log(msg);
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
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; };
var $_;
function $bind(o,m) { var f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; return f; };
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
Xml.Element = "element";
Xml.PCData = "pcdata";
Xml.CData = "cdata";
Xml.Comment = "comment";
Xml.DocType = "doctype";
Xml.Prolog = "prolog";
Xml.Document = "document";
haxe.Resource.content = [{ name : "glyphs", data : "s97927:PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8%CjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4KCjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgdmVyc2lvbj0iMS4xIgogICB4PSIwcHgiCiAgIHk9IjBweCIKICAgd2lkdGg9IjEyODBweCIKICAgaGVpZ2h0PSI4MDBweCIKICAgdmlld0JveD0iMCAwIDEyODAgODAwIgogICBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAxMjgwIDgwMCIKICAgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIKICAgaWQ9InN2ZzMzMjEiCiAgIGlua3NjYXBlOnZlcnNpb249IjAuNDguMiByOTgxOSIKICAgc29kaXBvZGk6ZG9jbmFtZT0iR2x5cGhzLnN2ZyI%PG1ldGFkYXRhCiAgIGlkPSJtZXRhZGF0YTM2NTUiPjxyZGY6UkRGPjxjYzpXb3JrCiAgICAgICByZGY6YWJvdXQ9IiI%PGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ%PGRjOnR5cGUKICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz48L2NjOldvcms%PC9yZGY6UkRGPjwvbWV0YWRhdGE%PGRlZnMKICAgaWQ9ImRlZnMzNjUzIiAvPjxzb2RpcG9kaTpuYW1lZHZpZXcKICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICBib3JkZXJjb2xvcj0iIzY2NjY2NiIKICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgb2JqZWN0dG9sZXJhbmNlPSIxMCIKICAgZ3JpZHRvbGVyYW5jZT0iMTAiCiAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAiCiAgIGlua3NjYXBlOnBhZ2VzaGFkb3c9IjIiCiAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIKICAgaW5rc2NhcGU6d2luZG93LWhlaWdodD0iMTAxOCIKICAgaWQ9Im5hbWVkdmlldzM2NTEiCiAgIHNob3dncmlkPSJmYWxzZSIKICAgaW5rc2NhcGU6em9vbT0iNC4xNDUiCiAgIGlua3NjYXBlOmN4PSI1MDEuODE5NzYiCiAgIGlua3NjYXBlOmN5PSI3MTcuMDE3NTQiCiAgIGlua3NjYXBlOndpbmRvdy14PSIxOTEyIgogICBpbmtzY2FwZTp3aW5kb3cteT0iLTgiCiAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzMzMjEiIC8%CjxnCiAgIGlkPSJMaW5pZW4iPgoJPHJlY3QKICAgeT0iNjYiCiAgIHdpZHRoPSIxMDY5IgogICBoZWlnaHQ9IjEiCiAgIGlkPSJyZWN0MzMyNCIKICAgZmlsbD0iIzgwODA4MCIgLz4KCTxyZWN0CiAgIHk9IjQ4IgogICB3aWR0aD0iMTA2OSIKICAgaGVpZ2h0PSIxIgogICBpZD0icmVjdDMzMjYiCiAgIGZpbGw9IiM4MDgwODAiIC8%Cgk8ZwogICBpZD0iZzMzMjgiPgoJCTxyZWN0CiAgIHk9IjU3IgogICB3aWR0aD0iMTA2OSIKICAgaGVpZ2h0PSIxIgogICBpZD0icmVjdDMzMzAiCiAgIGZpbGw9Im5vbmUiIC8%Cgk8L2c%Cgk8cmVjdAogICB5PSI1NyIKICAgd2lkdGg9IjEwNjkiCiAgIGhlaWdodD0iMSIKICAgaWQ9InJlY3QzMzMyIgogICBmaWxsPSIjODA4MDgwIiAvPgoJPHJlY3QKICAgeT0iNzUiCiAgIHdpZHRoPSIxMDcwIgogICBoZWlnaHQ9IjEiCiAgIGlkPSJyZWN0MzMzNCIKICAgZmlsbD0iIzgwODA4MCIgLz4KCTxyZWN0CiAgIHk9Ijg0IgogICB3aWR0aD0iMTA2OSIKICAgaGVpZ2h0PSIxIgogICBpZD0icmVjdDMzMzYiCiAgIGZpbGw9IiM4MDgwODAiIC8%Cgk8ZwogICBpZD0iZzMzMzgiPgoJCTxwYXRoCiAgIGQ9Ik00Ni45NTcsNTAuOTkyYy0wLjUzOCwwLjQ5Ni0wLjgwNiwxLjA5Ni0wLjgwNiwxLjc5OGMwLDAuMzMxLDAuMDQxLDAuNjYyLDAuMTI0LDAuOTkyICAgIGMwLjA4MywwLjMzMSwwLjM4MiwwLjU3OSwwLjg5OSwwLjc0NGMwLjUxNywwLjE2NiwxLjI1LDAuMzEsMi4yMDEsMC40MzRjMC45NSwwLjEyNCwxLjU5MSwwLjUzOCwxLjkyMiwxLjI0ICAgIGMwLjE2NSwwLjM3MiwwLjI0OCwwLjk5MiwwLjI0OCwxLjg2YzAsMC45NS0wLjQzNCwxLjY4NC0xLjMwMiwyLjIwMWMtMC44NjgsMC41MTYtMS44NiwwLjc3NS0yLjk3NiwwLjc3NSAgICBjLTEuMjgyLDAtMi4yOTQtMC4yOS0zLjAzOC0wLjg2OGMtMC45MS0wLjcwMy0xLjM2NC0xLjY5NS0xLjM2NC0yLjk3NmMwLTEuMTU3LDAuMjM4LTIuMzQ1LDAuNzEzLTMuNTY1ICAgIGMwLjQ3NS0xLjIxOSwxLjE4OC0yLjM0NSwyLjEzOS0zLjM3OWMwLjcwMy0wLjc0NCwxLjYzMi0xLjI5MiwyLjc5LTEuNjQzYzEuMTU3LTAuMzUxLDIuMzM1LTAuNTI3LDMuNTM0LTAuNTI3ICAgIGMwLjQ1NCwwLDAuODM3LDAuMDExLDEuMTQ3LDAuMDMxYzAuMzEsMC4wMjEsMC44MTYsMC4wOTMsMS41MTksMC4yMTdjMi40MzgsMC40NTUsNC40NDMsMS43NTcsNi4wMTQsMy45MDYgICAgYzEuNDQ2LDEuOTg0LDIuMTcsNC4wOTIsMi4xNyw2LjMyNGMwLDAuNDEzLTAuMDIxLDAuNzIzLTAuMDYyLDAuOTNjLTAuMzMyLDIuODExLTIuMTkxLDUuODI4LTUuNTgsOS4wNTIgICAgYy0yLjcyOCwyLjYwNC01LjkxMSw0LjkzOC05LjU0OCw3LjAwNmMtMy4zMDgsMS45MDEtNS4yNywyLjc0OS01Ljg5LDIuNTQybC0wLjE4Ni0wLjY4MmMwLjk1LTAuMzMxLDEuOTczLTAuNzg2LDMuMDY5LTEuMzY0ICAgIGMxLjA5NS0wLjU4LDIuMTgtMS4yNCwzLjI1NS0xLjk4NGMyLjc2OS0xLjk4NCw0Ljc3NC0zLjg0NCw2LjAxNC01LjU4YzEuNTI5LTIuMTA4LDIuNTIxLTQuNzEyLDIuOTc2LTcuODEyICAgIGMwLjIwNy0xLjI4MiwwLjMxLTIuMTA4LDAuMzEtMi40OHMwLTAuNjgyLDAtMC45M2MwLTMuMjI0LTEuMDk2LTUuNTE4LTMuMjg2LTYuODgyYy0wLjk5Mi0wLjU3OS0yLjAwNS0wLjg2OC0zLjAzOC0wLjg2OCAgICBjLTAuNzg2LDAtMS41NCwwLjE1NS0yLjI2MywwLjQ2NUM0Ny45MzgsNTAuMjc5LDQ3LjM2OSw1MC42Miw0Ni45NTcsNTAuOTkyeiBNNjYuNjcyLDUxLjE3OGMwLjY2MSwwLDEuMjE5LDAuMjI4LDEuNjc0LDAuNjgyICAgIGMwLjQ1NCwwLjQ1NiwwLjY4MiwxLjAxNCwwLjY4MiwxLjY3NGMwLDAuNjYyLTAuMjI4LDEuMjE5LTAuNjgyLDEuNjc0Yy0wLjQ1NiwwLjQ1NS0xLjAxNCwwLjY4Mi0xLjY3NCwwLjY4MiAgICBjLTAuNjYyLDAtMS4yMi0wLjIyNy0xLjY3NC0wLjY4MmMtMC40NTYtMC40NTUtMC42ODItMS4wMTItMC42ODItMS42NzRjMC0wLjY2MSwwLjIyNy0xLjIxOSwwLjY4Mi0xLjY3NCAgICBDNjUuNDUzLDUxLjQwNiw2Ni4wMTEsNTEuMTc4LDY2LjY3Miw1MS4xNzh6IE02Ni42NzIsNTkuNTQ4YzAuNjYxLDAsMS4yMTksMC4yMjcsMS42NzQsMC42ODIgICAgYzAuNDU0LDAuNDU1LDAuNjgyLDEuMDEyLDAuNjgyLDEuNjc0YzAsMC42NjEtMC4yMjgsMS4yMTktMC42ODIsMS42NzRjLTAuNDU2LDAuNDU0LTEuMDE0LDAuNjgyLTEuNjc0LDAuNjgyICAgIGMtMC42NjIsMC0xLjIyLTAuMjI4LTEuNjc0LTAuNjgyYy0wLjQ1Ni0wLjQ1Ni0wLjY4Mi0xLjAxNC0wLjY4Mi0xLjY3NGMwLTAuNjYyLDAuMjI3LTEuMjE5LDAuNjgyLTEuNjc0ICAgIEM2NS40NTMsNTkuNzc1LDY2LjAxMSw1OS41NDgsNjYuNjcyLDU5LjU0OHoiCiAgIGlkPSJwYXRoMzM0MCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzM0MiI%CgkJPHBhdGgKICAgZD0iTTc3LjI2Miw4NC44NjZWNDguMjY4aDQuNTgydjM2LjU5OEg3Ny4yNjJ6IE04My40MSw4NC44NjZWNDguMjY4aDEuNTA4djM2LjU5OEg4My40MXogTTg3Ljk5Miw2OS4wMyAgICBjLTAuNDI2LTAuNTM1LTAuODYxLTEuMDAzLTEuMzA1LTEuNDAzYy0wLjQ0NS0wLjQwMi0wLjk1Ny0wLjc1NS0xLjUzNy0xLjA2MWMxLjA2OS0wLjU4MiwyLTEuMzU4LDIuNzkyLTIuMzMgICAgYzEuMTA5LTEuMzU4LDEuODAzLTIuODkyLDIuMDgtNC42MDFjMC4xNywxLjI3NiwwLjQ2LDIuMTY2LDAuODcsMi42NjhjMC42NTcsMC43MzUsMS43MDEsMS4xMDIsMy4xMzIsMS4xMDIgICAgYzEuNTA4LDAsMi41OS0wLjgxNCwzLjI0OC0yLjQ0NmMwLjUwMi0xLjI0MiwwLjc1NC0yLjkxMSwwLjc1NC01LjAwOGMwLTEuOTc5LTAuMjUyLTMuNTUyLTAuNzU0LTQuNzE3ICAgIGMtMC42OTYtMS41NTItMS43OTgtMi4zMjktMy4zMDYtMi4zMjljLTAuODksMC0xLjY3MywwLjE4NC0yLjM0OSwwLjU1MWMtMC42NzcsMC4zNjgtMS4wMTUsMC43MjUtMS4wMTUsMS4wNzMgICAgYzAsMC4xOTQsMC4yMzIsMC4yNTIsMC42OTYsMC4xNzRjMC40NjQtMC4wNzcsMC45NzYsMC4wNjgsMS41MzcsMC40MzVjMC41NiwwLjM2OCwwLjg0MSwwLjg5OSwwLjg0MSwxLjU5NSAgICBjMCwwLjY5Ni0wLjIzMiwxLjI1Ny0wLjY5NiwxLjY4MmMtMC40NjQsMC40MjYtMS4wODMsMC42MzgtMS44NTYsMC42MzhjLTAuNzM1LDAtMS4zODMtMC4yNDEtMS45NDMtMC43MjUgICAgYy0wLjU2MS0wLjQ4My0wLjg0MS0xLjA1My0wLjg0MS0xLjcxMWMwLTEuMTIxLDAuNTYtMi4xMjYsMS42ODItMy4wMTZjMS4yNzYtMS4wMDUsMi44MjItMS41MDgsNC42NC0xLjUwOCAgICBjMi4yODEsMCw0LjEyNywwLjc0OCw1LjUzOSwyLjI0MWMxLjQxMSwxLjQ5NCwyLjExNywzLjM0NywyLjExNyw1LjU1OGMwLDIuNDgzLTAuODYxLDQuNTg4LTIuNTgxLDYuMzE1ICAgIGMtMS43MjEsMS43MjctMy44MTksMi41OS02LjI5MywyLjU5Yy0wLjU4LDAtMS4wNDQtMC4wMzgtMS4zOTItMC4xMTZjLTAuNTQyLTAuMTkzLTAuOTg2LTAuMzQ4LTEuMzM0LTAuNDY0ICAgIGMtMC4xNTUsMC40OTctMC40ODQsMC45OTQtMC45ODYsMS40OWMtMC4xMTYsMC4xNTMtMC40ODQsMC40MzktMS4xMDIsMC44NTljMC4zODYsMC4xOTYsMC43NTQsMC41MjcsMS4xMDIsMC45OTcgICAgYzAuNTAyLDAuNTA3LDAuODg5LDEuMDU1LDEuMTYsMS42NDJjMC42NTctMC4zMSwxLjEzMS0wLjUwMywxLjQyMS0wLjU4YzAuMjktMC4wNzgsMC43MDUtMC4xMTYsMS4yNDctMC4xMTYgICAgYzIuNDc0LDAsNC41NzIsMC44NTcsNi4yOTMsMi41NzJjMS43MiwxLjcxNCwyLjU4MSwzLjgwNCwyLjU4MSw2LjI3YzAsMi4xMTktMC43MzEsMy45MDItMi4xOTMsNS4zNDcgICAgYy0xLjQ2MywxLjQ0My0zLjMyNCwyLjE2Ny01LjU4NSwyLjE2N2MtMS44MzMsMC0zLjM0My0wLjQ3NC00LjUzMi0xLjQyMWMtMS4xODktMC45NDgtMS43ODMtMS45ODItMS43ODMtMy4xMDMgICAgYzAtMC42OTYsMC4yOC0xLjI4NiwwLjg0MS0xLjc2OWMwLjU2LTAuNDg0LDEuMjA4LTAuNzI1LDEuOTQzLTAuNzI1YzAuNjk2LDAsMS4yOTUsMC4yMzIsMS43OTgsMC42OTYgICAgYzAuNTAyLDAuNDY0LDAuNzU0LDEuMDQ0LDAuNzU0LDEuNzRjMCwwLjY1Ny0wLjI4MSwxLjE2OS0wLjg0MSwxLjUzN2MtMC41NjEsMC4zNjctMS4wNzMsMC41MTItMS41MzcsMC40MzUgICAgYy0wLjQ2NC0wLjA3OC0wLjY5NiwwLTAuNjk2LDAuMjMyYzAsMC4yNywwLjM1NCwwLjYwOSwxLjA2MSwxLjAxNWMwLjcwNywwLjQwNiwxLjQ3MywwLjYwOSwyLjI5NywwLjYwOSAgICBjMS41MzEsMCwyLjY1MS0wLjc3NCwzLjM1OC0yLjMyYzAuNTEtMS4xMjIsMC43NjYtMi42ODgsMC43NjYtNC42OThjMC0yLjAxMS0wLjI1Mi0zLjYzNS0wLjc1NC00Ljg3MiAgICBjLTAuNjU4LTEuNjYzLTEuNzIxLTIuNDk0LTMuMTktMi40OTRjLTEuNDMxLDAtMi40MjcsMC4zMDktMi45ODcsMC45MjhjLTAuNTYxLDAuNjE4LTAuOTM4LDEuNTY2LTEuMTMxLDIuODQyICAgIEM4OS43OSw3MS44NTUsODkuMTEzLDcwLjM2Niw4Ny45OTIsNjkuMDN6IgogICBpZD0icGF0aDMzNDQiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzMzNDYiPgoJCTxwYXRoCiAgIGQ9Ik0zOTcuMTc3LDYyLjU1MmMwLjkzLTAuMzA4LDEuNzQzLTEuMDQyLDIuNDQxLTIuMjAyYzAuMzg4LTAuNjU2LDAuNjU4LTEuMjc0LDAuODEzLTEuODU0bDEuNDA4LTYuMDQyICAgIGMtMC42OTMsMS4yOC0xLjk2MywxLjkxOS0zLjgxMiwxLjkxOWMtMC41LDAtMS4wNTktMC4wNzctMS42NzQtMC4yMzJjLTAuNjE2LTAuMTU0LTEuMTM2LTAuNDY0LTEuNTU5LTAuOTI4ICAgIGMtMC40MjQtMC40NjQtMC42MzUtMS4wODItMC42MzUtMS44NTZjMC0wLjY1NywwLjIzMS0xLjIxOCwwLjY5NS0xLjY4MnMxLjA0Mi0wLjY5NiwxLjczNy0wLjY5NmMwLjY1NiwwLDEuMjM1LDAuMjUyLDEuNzM3LDAuNzU0ICAgIGMwLjUwMSwwLjUwMywwLjc1MywxLjA0NCwwLjc1MywxLjYyNGMwLDAuMzEtMC4wNzgsMC42MzgtMC4yMzEsMC45ODZjLTAuMTU1LDAuMzQ4LTAuNDQ0LDAuNjM4LTAuODY5LDAuODcgICAgYzAuMjMxLDAuMTE2LDAuNDgyLDAuMjEzLDAuNzUzLDAuMjljMC4wNzcsMCwwLjI3LTAuMDM5LDAuNTc5LTAuMTE4YzAuNzMzLTAuMjM0LDEuNDI4LTAuODAzLDIuMDg1LTEuNzA0ICAgIGMwLjU3OS0wLjkwMSwxLjE1OC0xLjgwMiwxLjczNy0yLjcwMmgwLjQwNWwtOC4xNjcsMzUuMDMybC0xLjA3LTAuMDA2bDMuMTg4LTEzLjE2NmMtMC43MzEsMS4yOC0xLjk2MywxLjkyLTMuNjk0LDEuOTIgICAgYy0wLjE5MiwwLTAuMzg1LDAtMC41NzcsMGMtMC4yNy0wLjAzOS0wLjY4NC0wLjEzNi0xLjI0Mi0wLjI5Yy0wLjU1OC0wLjE1NS0xLjA0OS0wLjQ2NC0xLjQ3Mi0wLjkyOCAgICBjLTAuNDIzLTAuNDY0LTAuNjM0LTEuMDY0LTAuNjM0LTEuNzk4YzAtMC42NTgsMC4yMzEtMS4yMTgsMC42OTUtMS42ODJjMC40NjMtMC40NjQsMS4wNjItMC42OTYsMS43OTUtMC42OTYgICAgYzAuNjU2LDAsMS4yMjUsMC4yNDEsMS43MDgsMC43MjVjMC40ODIsMC40ODMsMC43MjQsMS4wMzQsMC43MjQsMS42NTNjMCwwLjMwOS0wLjA3OCwwLjYzOC0wLjIzMSwwLjk4NiAgICBjLTAuMTU1LDAuMzQ4LTAuNDQ0LDAuNjM4LTAuODY5LDAuODdjMC40NiwwLjE1NCwwLjcxLDAuMjMyLDAuNzQ5LDAuMjMyYzAuMDc2LDAsMC4yNjgtMC4wMzksMC41NzYtMC4xMTYgICAgYzAuOTIyLTAuMjcyLDEuNzg2LTEuMDg1LDIuNTkzLTIuNDM5YzAuMTE1LTAuMTk0LDAuMjY5LTAuNTA0LDAuNDYxLTAuOTNsMS42MTQtNi42NzJjLTAuNzMxLDEuMjgyLTEuOTgxLDEuOTIxLTMuNzUsMS45MjEgICAgYy0wLjMwOCwwLTAuNjE1LDAtMC45MjMsMGMtMC4zNDctMC4xMTYtMC41NzgtMC4xOTMtMC42OTItMC4yMzJjLTAuNjkyLTAuMTkzLTEuMjUtMC41MjItMS42NzMtMC45ODYgICAgYy0wLjQyNC0wLjQ2NC0wLjYzNS0xLjA2My0wLjYzNS0xLjc5OGMwLTAuNjk2LDAuMjMyLTEuMjc2LDAuNjk1LTEuNzRzMS4wNjItMC42OTYsMS43OTUtMC42OTZjMC42NTYsMCwxLjIyNiwwLjI0MiwxLjcwOCwwLjcyNSAgICBjMC40ODIsMC40ODQsMC43MjQsMS4wMzUsMC43MjQsMS42NTNjMCwwLjMxLTAuMDc4LDAuNjM4LTAuMjMyLDAuOTg2cy0wLjQ0NCwwLjY1OC0wLjg2OSwwLjkyOCAgICBjMC4yMzIsMC4wNzgsMC40NjQsMC4xNTUsMC42OTgsMC4yMzJDMzk2LjY1Myw2Mi42NjgsMzk2Ljg2Nyw2Mi42MywzOTcuMTc3LDYyLjU1MnoiCiAgIGlkPSJwYXRoMzM0OCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzM1MCI%CgkJPHBhdGgKICAgZD0iTTQ0Ny4yMjUsNTAuODIyTDQ1NC4yOSw1OWMtMC41NDEsMC4yMzItMS4zNzEsMS4xNDEtMi40OSwyLjcyNmMtMS4yNzQsMS43NzktMS45MTEsMy4xMzItMS45MTEsNC4wNiAgICBjMCwxLjEyMSwwLjM2NywyLjI2MiwxLjEwMSwzLjQyMmMwLjczMywxLjE2LDEuNjAyLDIuMDY4LDIuNjA2LDIuNzI2bC0wLjM0OCwwLjgxMmMtMC4yMzEtMC4wMzktMC41Ny0wLjA3OC0xLjAxMy0wLjExNiAgICBjLTAuNDQ0LTAuMDM5LTAuNzYzLTAuMDU4LTAuOTU2LTAuMDU4Yy0xLjA0MiwwLTEuODI0LDAuMDk2LTIuMzQ2LDAuMjljLTAuNTIxLDAuMTkzLTAuODg5LDAuNDU0LTEuMSwwLjc4MyAgICBjLTAuMjEzLDAuMzI4LTAuMzE5LDAuNzA1LTAuMzE5LDEuMTMxYzAsMC44MTIsMC40MjUsMS43NTksMS4yNzQsMi44NDJjMC42OTUsMC44ODksMS4xNTgsMS4zNzIsMS4zOSwxLjQ1bC0wLjI5LDAuNDY0ICAgIGMtMC4yNzEsMC4wNzctMS4yMzYtMC42MTktMi44OTYtMi4wODhjLTEuODUzLTEuNjI0LTIuNzgtMi45OTctMi43OC00LjExOGMwLTAuOTI4LDAuMzU2LTEuNjgyLDEuMDcxLTIuMjYyICAgIGMwLjcxNC0wLjU4LDEuNTkzLTAuODcsMi42MzUtMC44N2MwLjU0LDAsMS4wOSwwLjA3NywxLjY1LDAuMjMyYzAuNTU5LDAuMTU0LDEuMTA5LDAuNDI1LDEuNjUsMC44MTJsLTYuNDI4LTguMjk0ICAgIGMwLjU0LTAuMzA5LDEuMjA2LTEuMDczLDEuOTk4LTIuMjkxYzAuNzkxLTEuMjE4LDEuMzk5LTIuMzg3LDEuODI0LTMuNTA5YzAuMDc3LTAuMTU0LDAuMTE2LTAuNDI1LDAuMTE2LTAuODEyICAgIGMwLTAuOTI4LTAuNDQ0LTIuMTA3LTEuMzMyLTMuNTM4Yy0wLjczNC0xLjE2LTEuMjE2LTEuODE3LTEuNDQ4LTEuOTcySDQ0Ny4yMjV6IgogICBpZD0icGF0aDMzNTIiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzMzNTQiPgoJCTxwYXRoCiAgIGQ9Ik04NTQuNzE0LDU1LjQxN2gwLjUzMmMwLjEyNSwwLjgzOCwwLjI5NCwxLjU0MSwwLjUwNywyLjEwOGMwLjIxMywwLjU2NywwLjQ2MiwxLjA1MywwLjc0NywxLjQ1NSAgICBjMC4yODQsMC40MDMsMC43MTEsMC45MjQsMS4yODEsMS41NjNjMC41NjgsMC42MzksMS4wMjksMS4xODEsMS4zOCwxLjYyNWMxLjA1NywxLjM1NCwxLjU4NSwyLjc3LDEuNTg1LDQuMjQ5ICAgIGMwLDEuNTE4LTAuNjQ2LDMuMzY2LTEuOTM5LDUuNTQzaC0wLjM1YzAuMTY1LTAuMzc5LDAuMzU2LTAuODIsMC41NzUtMS4zMjFzMC40MDItMC45NTYsMC41NTEtMS4zNjRzMC4yNjYtMC44MTQsMC4zNTItMS4yMTkgICAgczAuMTI5LTAuODA0LDAuMTI5LTEuMTk4YzAtMC42MjMtMC4xMjctMS4yNTEtMC4zODItMS44ODVjLTAuMjU0LTAuNjM0LTAuNjA5LTEuMjE5LTEuMDY1LTEuNzU2ICAgIGMtMC40NTctMC41MzctMC45NzYtMC45NzItMS41NTgtMS4zMDVzLTEuMTg3LTAuNTE4LTEuODEzLTAuNTUzdjEyLjQ1YzAsMC43MDktMC4yMTgsMS4zNC0wLjY1MywxLjg5NCAgICBjLTAuNDM1LDAuNTUzLTAuOTkxLDAuOTc4LTEuNjcsMS4yNzJjLTAuNjc5LDAuMjk2LTEuMzUsMC40NDMtMi4wMTIsMC40NDNjLTAuNjQ1LDAtMS4xOC0wLjE2MS0xLjYwNi0wLjQ4MyAgICBjLTAuNDI2LTAuMzIyLTAuNjM5LTAuNzkyLTAuNjM5LTEuNDA3YzAtMC42NTUsMC4yMTYtMS4yNiwwLjY0Ny0xLjgxNXMwLjk3Ny0wLjk5MywxLjYzNi0xLjMxM2MwLjY1OC0wLjMyLDEuMjk4LTAuNDgsMS45MTctMC40OCAgICBjMC44NTUsMCwxLjQ3MiwwLjE2OCwxLjg0OCwwLjUwNVY2MS4xOFY1NS40MTd6IgogICBpZD0icGF0aDMzNTYiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzMzNTgiPgoJCTxwYXRoCiAgIGQ9Ik04NzAuMzM0LDU4Ljg1OWMwLTAuNjkxLDAuMjMtMS4zMTQsMC42OS0xLjg2OXMxLjAzOS0wLjk4NCwxLjczNy0xLjI4NmMwLjY5OC0wLjMwMywxLjM3Ny0wLjQ1NCwyLjAzNS0wLjQ1NCAgICBjMS4zMzIsMCwyLjAzOCwwLjYzLDIuMTE3LDEuODkxYzAsMC41NDQtMC4yMTksMS4xMDEtMC42NTYsMS42N2MtMC40MzcsMC41NjktMC45OTksMS4wMzUtMS42ODgsMS4zOTZzLTEuMzg0LDAuNTQyLTIuMDgxLDAuNTQyICAgIGMtMC42MzgsMC0xLjE4OC0wLjE0Ny0xLjY0OS0wLjQ0djExLjA0M2MwLjkwNi0wLjE1LDEuNzItMC41MDUsMi40NDEtMS4wNjNzMS4yODMtMS4yMjgsMS42ODctMi4wMDkgICAgYzAuNDAyLTAuNzgxLDAuNjA0LTEuNTYsMC42MDQtMi4zMzZjLTAuMDE4LTAuOTEzLTAuMTMxLTEuNjkyLTAuMzQxLTIuMzM2Yy0wLjIwOS0wLjY0NS0wLjU3OS0xLjU1Mi0xLjEwOC0yLjcyM2wwLjM0OS0wLjEzNCAgICBjMC4zNCwwLjYwMiwwLjY0NiwxLjIyOSwwLjkxOSwxLjg4M2MwLjI3MSwwLjY1MywwLjQ4NywxLjMxNiwwLjY0NiwxLjk5czAuMjM5LDEuMzM0LDAuMjM5LDEuOTgyICAgIGMwLDAuOTY3LTAuMjI5LDEuODMzLTAuNjg1LDIuNTk3Yy0wLjQ1NywwLjc2NS0xLjEzNSwxLjY2NC0yLjAzMywyLjY5NmMtMC44OTgsMS4wMzMtMS41NzYsMS45MzctMi4wMzMsMi43MSAgICBjLTAuNDU2LDAuNzczLTAuNjg1LDEuNjU0LTAuNjg1LDIuNjQzaC0wLjUwNVY1OC44NTl6IgogICBpZD0icGF0aDMzNjAiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzMzNjIiPgoJCTxwYXRoCiAgIGQ9Ik04ODcuMDk3LDEwMC42MjVsMS40ODMtNC4zMTNoLTIuOTEybDAuMzM1LTAuOTc4aDIuODg1bDAuNjE1LTEuOTYybDEuOTA3LTEuMzY3aDAuNTYxbC0xLjE0OCwzLjMyOSAgICBjMC40MDEsMCwxLjAwNi0wLjA3NSwxLjgxNC0wLjIyNmMwLjgxLTAuMTUsMS40MzUtMC4yMjYsMS44NzctMC4yMjZjMC4yNjUsMCwwLjQ1MiwwLjA1MiwwLjU2NCwwLjE1NyAgICBjMC4xMTEsMC4xMDUsMC4xNjcsMC4yOTYsMC4xNjcsMC41NzRjMCwwLjA4Ni0wLjAzOSwwLjM3Ni0wLjExNiwwLjg2OGMwLjcyOS0xLjA2NiwxLjU1Mi0xLjYsMi40NjgtMS42ICAgIGMwLjcyLDAuMDgyLDEuMTAzLDAuNTAzLDEuMTQ4LDEuMjY1YzAsMC40MjgtMC4wOTQsMC43MzYtMC4yOCwwLjkyM3MtMC40MDEsMC4yOC0wLjY0MywwLjI4Yy0wLjQ4NywwLTAuNzY4LTAuMjkxLTAuODQxLTAuODcyICAgIGMwLjEwOS0wLjIyLDAuMTY0LTAuNDM1LDAuMTY0LTAuNjQ2YzAtMC4xMTMtMC4wOTQtMC4xNy0wLjI4LTAuMTdjLTAuNzg0LDAtMS40NzUsMC44NjktMi4wNzEsMi42MDdsLTEuMzEzLDQuMDY0aC0xLjg1MyAgICBsMC4zNDItMC45MjNjLTAuMjE5LDAuMDkxLTAuNTMzLDAuMjYzLTAuOTQzLDAuNTE2cy0wLjc3MSwwLjQ0OS0xLjA4LDAuNTg4cy0wLjY0NSwwLjIwOC0xLjAwNSwwLjIwOCAgICBjLTAuNTA2LDAtMC45NTEtMC4xMzYtMS4zMzctMC40MDdjLTAuMzg1LTAuMjcxLTAuNTkxLTAuNjMtMC42MTgtMS4wNzdjMC4wMTktMC4wNzMsMC4wMzYtMC4xOCwwLjA1NS0wLjMyMSAgICBTODg3LjA3OCwxMDAuNjc5LDg4Ny4wOTcsMTAwLjYyNXogTTg5Mi4wOCwxMDAuMzdsMS40MDEtNC4xMmMwLTAuMDQxLDAuMDA5LTAuMDk2LDAuMDI3LTAuMTY0czAuMDI3LTAuMTA3LDAuMDI3LTAuMTE3ICAgIGMwLTAuMDkxLTAuMDc1LTAuMTM3LTAuMjI2LTAuMTM3Yy0wLjM0NywwLTAuODEzLDAuMDcxLTEuNDAxLDAuMjEycy0xLjA0NCwwLjIxMi0xLjM2NywwLjIxMmwtMS40MjksNC4yMzEgICAgYy0wLjA2OCwwLjIzMi0wLjEyNSwwLjQ0Ny0wLjE3MSwwLjY0M2MwLDAuMjczLDAuMTY5LDAuNDQyLDAuNTA2LDAuNTA2Qzg4OS45NDksMTAxLjU4Niw4OTAuODI3LDEwMS4xNjQsODkyLjA4LDEwMC4zN3oiCiAgIGlkPSJwYXRoMzM2NCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzM2NiI%Cgk8L2c%CjwvZz4KPGcKICAgaWQ9IkNsZWZzIj4KCTxnCiAgIGlkPSJnMzM2OSI%CgkJPHBhdGgKICAgZD0iTTI1LjMxMiwzNi44MDRjMC45NTUsMCwxLjg2MywxLjE0OSwyLjcyNCwzLjQ0OGMwLjg2LDIuMywxLjI5MSw0LjM0MiwxLjI5MSw2LjEyN2MwLDIuNDMzLTAuMzYzLDQuNzEyLTEuMDg5LDYuODQgICAgYy0xLjAzMywzLjAwMi0yLjcxMyw1LjQ1My01LjA0LDcuMzUzbDEuMDgzLDUuNjQzYzAuNjgyLTAuMTUxLDEuMzI2LTAuMjI4LDEuOTMzLTAuMjI4YzIuODQzLDAsNS4wNDEsMS4wOTgsNi41OTYsMy4yOTMgICAgYzEuMzI2LDEuODU2LDEuOTksNC4xMDgsMS45OSw2Ljc1OWMwLDIuMDQ0LTAuNjUxLDMuNzk1LTEuOTUzLDUuMjUzYy0xLjMwMiwxLjQ1Ny0yLjk5LDIuNDMyLTUuMDY1LDIuOTI1bDEuNTQ2LDguMTYxICAgIGMtMC4wMDEsMC40NTYtMC4wMDEsMC43NzgtMC4wMDEsMC45NjljMCwxLjUyLTAuNTQyLDIuODIxLTEuNjI1LDMuOTA0cy0yLjQ0MiwxLjgxNC00LjA3NiwyLjE5NSAgICBjLTAuMjY2LDAuMDc2LTAuNjI3LDAuMTE0LTEuMDgzLDAuMTE0Yy0xLjU1OSwwLTIuOTQ1LTAuNjI3LTQuMTYxLTEuODgxYy0xLjIxNy0xLjI1NC0xLjgyNC0yLjUyOC0xLjgyNC0zLjgxOSAgICBjMC0wLjIyOCwwLjAxOS0wLjM5OSwwLjA1Ny0wLjUxM2MwLjE4OS0xLjA2NCwwLjY0Ni0xLjkxLDEuMzY4LTIuNTM3YzAuNzIxLTAuNjI3LDEuNjE0LTAuOTQsMi42NzktMC45NCAgICBjMS4wMjYsMCwxLjkxOCwwLjM0MiwyLjY3OSwxLjAyNmMwLjc2LDAuNjg0LDEuMTQsMS41MiwxLjE0LDIuNTA4YzAsMS4wNjMtMC4zNTIsMS45ODUtMS4wNTQsMi43NjQgICAgYy0wLjcwNCwwLjc3OC0xLjYwNiwxLjE2OC0yLjcwOCwxLjE2OGMtMC4yNjcsMC0wLjQ1NiwwLTAuNTcsMGMwLjQyMSwwLjM2NCwwLjgyNCwwLjYzOCwxLjIwNywwLjgyMSAgICBjMC43MjgsMC4zNjQsMS40MzcsMC41NDcsMi4xMjcsMC41NDdjMS4xNDksMCwyLjM1Ni0wLjYyNywzLjYyMS0xLjg3OWMwLjk0OS0wLjk4NywxLjQyNC0yLjE0NSwxLjQyNC0zLjQ3MiAgICBjMC0wLjE5MS0wLjAxMy0wLjU1Mi0wLjAzNi0xLjA4M2wtMS4zODktNy43NjZjLTAuNDk2LDAuMTE3LTEuMDQ5LDAuMTk0LTEuNjU5LDAuMjM0Yy0wLjYxLDAuMDM4LTEuMjM5LDAuMDU4LTEuODg3LDAuMDU4ICAgIGMtMy4zOTUsMC02LjM1LTEuMjM1LTguODY3LTMuNzA1Yy0yLjUxNy0yLjQ3MS0zLjc3NS01LjQzNS0zLjc3NS04Ljg5MmMwLTEuOTM4LDAuODc0LTQuMjk0LDIuNjIyLTcuMDY4ICAgIGMxLjE3Ny0xLjg5OSwyLjg1LTQuMDI3LDUuMDE2LTYuMzg0YzEuNTk2LTEuNzQ4LDIuNTQ1LTIuNzE2LDIuODUtMi45MDdjLTAuMTkxLTAuMzc5LTAuNDQ3LTEuNDI1LTAuNzctMy4xMzUgICAgYy0wLjMyMy0xLjcxLTAuNTIzLTIuODQtMC41OTktMy4zOTJjLTAuMDc3LTAuNTUtMC4xMTQtMS4xMTEtMC4xMTQtMS42ODFjMC0yLjM1NiwwLjU0NC00Ljc1LDEuNjM0LTcuMTgyICAgIEMyMi42NDUsMzguMDIsMjMuODk3LDM2LjgwNCwyNS4zMTIsMzYuODA0eiBNMjMuNDcxLDY2LjIxNWwtMC45NjktNS4wNzNjLTAuNDE5LDAuMzA1LTEuMTYyLDEuMDQ1LTIuMjI4LDIuMjIzICAgIGMtMS4wNjYsMS4xNzgtMS45MDMsMi4xNjYtMi41MTMsMi45NjRjLTEuMTA0LDEuNDA2LTEuOTQyLDIuNjk5LTIuNTEzLDMuODc2Yy0wLjc2MiwxLjU1OS0xLjE0MiwzLjA3OC0xLjE0Miw0LjU2ICAgIGMwLDAuNzk4LDAuMTE0LDEuNTk2LDAuMzQzLDIuMzk0YzAuNDk1LDEuNjcxLDEuODI4LDMuMjY4LDQsNC43ODhjMS43NTMsMS4yMTUsMy42LDEuODI0LDUuNTQzLDEuODI0ICAgIGMwLjUzOSwwLDAuOTYzLTAuMDM5LDEuMjcxLTAuMTE2YzAuMzA4LTAuMDc4LDAuODA5LTAuMjMzLDEuNTAxLTAuNDY2bC0yLjgxNC0xMy40MzdjLTEuNzgsMC4yMjgtMy4xMjUsMS4wNjQtNC4wMzQsMi41MDcgICAgYy0wLjcyLDEuMTQtMS4wNzksMi4zNzUtMS4wNzksMy43MDRjMCwxLjQ0MywwLjgwMSwyLjgxMSwyLjQwNSw0LjEwM2MxLjM3NSwxLjEwMSwyLjQ4MiwxLjY1MiwzLjMyMywxLjY1MmwtMC4wODYsMC4zOTkgICAgYy0xLjA2NC0wLjE1MS0yLjI4LTAuNzAxLTMuNjQ4LTEuNjQ3Yy0xLjg2Mi0xLjMyNS0yLjk4My0yLjkxNi0zLjM2My00Ljc3MWMtMC4xMTQtMC41NjgtMC4xNzEtMS4xMTctMC4xNzEtMS42NDcgICAgYzAtMS44NTQsMC41NjItMy41MTEsMS42ODctNC45NjlDMjAuMTEsNjcuNjI2LDIxLjYwNSw2Ni42NywyMy40NzEsNjYuMjE1eiBNMjcuODQzLDQ0LjQ0MWMtMC4xOTItMS4yNTQtMC4zNDYtMi4wMTQtMC40Ni0yLjI4ICAgIGMtMC4zNDYtMC43Ni0wLjkyLTEuMTQtMS43MjUtMS4xNGMtMC43NjcsMC0xLjU3MiwwLjgyNy0yLjQxNiwyLjQ3OWMtMC44NDMsMS42NTMtMS40MzgsMy40NDktMS43ODIsNS4zODcgICAgYy0wLjA3NiwwLjQ5NC0wLjAxOCwxLjU2NywwLjE3NiwzLjIyYzAuMTkyLDEuNjUzLDAuMzY3LDIuNzI3LDAuNTIyLDMuMjIxbDEuMzIxLTEuMTRjMC45MTktMC40NTYsMS45NzItMS43NjcsMy4xNTktMy45MzMgICAgYzAuODgtMS41OTYsMS4zMjEtMy4xMzUsMS4zMjEtNC42MTdDMjcuOTU4LDQ1LjM3MywyNy45Miw0NC45NzQsMjcuODQzLDQ0LjQ0MXogTTI0Ljg4LDY5Ljc1bDIuNjIxLDEzLjA0MiAgICBjMS41NzgtMC4zNzgsMi44MjktMS4xNDUsMy43NS0yLjI5N2MwLjkyMS0xLjE1MywxLjM4MS0yLjUwNCwxLjM4MS00LjA1NGMwLTAuMzAzLDAtMC41MjksMC0wLjY4MSAgICBjLTAuMTkxLTEuNzc2LTAuOTM4LTMuMjIyLTIuMjQtNC4zMzdjLTEuMzAyLTEuMTE1LTIuODEzLTEuNjczLTQuNTM2LTEuNjczQzI1LjQzNSw2OS43NSwyNS4xMSw2OS43NSwyNC44OCw2OS43NXoiCiAgIGlkPSJwYXRoMzM3MSIgLz4KCTwvZz4KPC9nPgo8ZwogICBpZD0iTnVtYmVycyI%Cgk8ZwogICBpZD0iZzMzNzQiPgoJCTxwYXRoCiAgIGQ9Ik0xMjksNTcuNDE3YzAtMi4zMDMsMC40NS00LjIyOSwxLjM1LTUuNzc4YzEuMDQzLTEuODM2LDIuNTM4LTIuNzU0LDQuNDgyLTIuNzU0YzEuODcyLDAsMy4zMywwLjkxOCw0LjM3NCwyLjc1NCAgICBjMC44OTksMS41ODQsMS4zNSwzLjUxLDEuMzUsNS43NzhjMCwyLjMwMy0wLjQzMiw0LjIyOS0xLjI5Niw1Ljc3OGMtMS4wNDQsMS44MzYtMi41MiwyLjc1NC00LjQyOCwyLjc1NCAgICBjLTEuODcyLDAtMy4zNDgtMC45MTgtNC40MjgtMi43NTRDMTI5LjQ2Nyw2MS42MSwxMjksNTkuNjg1LDEyOSw1Ny40MTd6IE0xMzQuODMyLDQ5LjgwM2MtMS4wMDgsMC0xLjY4MywwLjcyOS0yLjAyNSwyLjE4NyAgICBjLTAuMzQzLDEuNDU4LTAuNTEzLDMuMjY3LTAuNTEzLDUuNDI3YzAsMi43LDAuMjM0LDQuNjQ0LDAuNzAyLDUuODMyYzAuNDY3LDEuMTg4LDEuMDgsMS43ODIsMS44MzYsMS43ODIgICAgYzAuOTM2LDAsMS42Mi0wLjg4MiwyLjA1Mi0yLjY0NmMwLjMyNC0xLjMzMiwwLjQ4Ni0yLjk4OCwwLjQ4Ni00Ljk2OGMwLTIuNzM1LTAuMjM1LTQuNjg4LTAuNzAyLTUuODU5ICAgIEMxMzYuMiw1MC4zODksMTM1LjU4OCw0OS44MDMsMTM0LjgzMiw0OS44MDN6IgogICBpZD0icGF0aDMzNzYiIC8%CgkJPHBhdGgKICAgZD0iTTE0Ny45NTQsNjQuMzgzVjUxLjkwOWwtMi4xNiw0LjEwNGwtMC4zNzgtMC4zMjRsMi41MzgtNi44NThoMy41MXYxNS40OThjMCwwLjMyNCwwLjI3LDAuNTc1LDAuODEsMC43NTYgICAgYzAuMTgsMC4wMzYsMC40NjcsMC4wODksMC44NjQsMC4xNjJ2MC43NTZoLTYuODU4di0wLjcwMmMwLjM1OS0wLjA3MiwwLjYyOS0wLjEyNiwwLjgxLTAuMTYyICAgIEMxNDcuNjY1LDY0Ljk1OCwxNDcuOTU0LDY0LjcwNywxNDcuOTU0LDY0LjM4M3oiCiAgIGlkPSJwYXRoMzM3OCIgLz4KCQk8cGF0aAogICBkPSJNMTYxLjc3OCw1MC4wNzNjLTAuOTM3LDAuMTA4LTEuNTMxLDAuMzc4LTEuNzgyLDAuODFjMC4wNzIsMC4xNDUsMC4xNDQsMC4yNywwLjIxNiwwLjM3OCAgICBjMC42ODQsMCwxLjE1MiwwLjA3MiwxLjQwNCwwLjIxNmMwLjU0LDAuMjg5LDAuODEsMC44NjQsMC44MSwxLjcyOGMwLDAuNjEyLTAuMjE2LDEuMTM0LTAuNjQ4LDEuNTY2cy0wLjkzNywwLjY0OC0xLjUxMiwwLjY0OCAgICBjLTAuNjEyLDAtMS4xMzQtMC4xOTctMS41NjYtMC41OTRjLTAuNDMyLTAuMzk2LTAuNjQ4LTAuOTE4LTAuNjQ4LTEuNTY2YzAtMS4xODgsMC41MDQtMi4yMTQsMS41MTItMy4wNzggICAgYzEuMDA3LTAuODY0LDIuMTQxLTEuMjk2LDMuNDAyLTEuMjk2YzEuNjkyLDAsMy4xMTMsMC4zNiw0LjI2NiwxLjA4YzEuMzY4LDAuODY0LDIuMDUyLDIuMDM1LDIuMDUyLDMuNTEgICAgYzAsMS4yOTYtMC43ODcsMi40NDgtMi4zNjEsMy40NTZjLTEuMzI1LDAuNzU2LTIuNjMxLDEuNTMtMy45MTksMi4zMjJjLTAuNzg3LDAuNjEyLTEuNDY3LDEuMjk2LTIuMDQsMi4wNTIgICAgYy0wLjI1MSwwLjM1OS0wLjUwMiwwLjczNy0wLjc1MSwxLjEzNGMxLjEwOS0wLjY0OCwyLjExMi0wLjk3MiwzLjAwNy0wLjk3MmMwLjY0NSwwLDEuMzA3LDAuMTgsMS45ODcsMC41NCAgICBjMC4zOTMsMC4xOCwwLjg3NiwwLjUyMSwxLjQ1LDEuMDI2YzAuNDY1LDAuMzk2LDAuODIzLDAuNTk0LDEuMDc0LDAuNTk0YzAuODI0LDAsMS4zNzgtMC4zNTIsMS42NjUtMS4wNTQgICAgYzAuMDcxLTAuMjExLDAuMTI1LTAuNTgsMC4xNjEtMS4xMDZoMC40M2MwLDEuMjA5LTAuMTgxLDIuMTY5LTAuNTQsMi44ODJjLTAuNTQsMS4wNjYtMS40NzcsMS42MDEtMi44MDgsMS42MDEgICAgYy0xLjAwOCwwLTIuMDYxLTAuMzctMy4xNTktMS4xMDdjLTEuMDk5LTAuNzM4LTIuMDA3LTEuMTA3LTIuNzI3LTEuMTA3Yy0xLjA4LDAtMS43ODIsMC4yNy0yLjEwNiwwLjgxICAgIGMtMC4xNDUsMC42NDgtMC4yMzUsMS4wMjYtMC4yNywxLjEzNGgtMC43MDJjMC4wMzYtMC4zNiwwLjA4OS0wLjcwMiwwLjE2Mi0xLjAyNmMwLjA3Mi0wLjMyNCwwLjI3LTAuNzkyLDAuNTk0LTEuNDA0ICAgIGMwLjQ2OC0wLjkzNywxLjUxMi0yLjIxNCwzLjEzMi0zLjgzNGMzLjEzMi0zLjEzMiw0LjY5OC01LjA1OCw0LjY5OC01Ljc3OEMxNjYuMjYsNTEuMjYxLDE2NC43NjYsNTAuMDczLDE2MS43NzgsNTAuMDczeiIKICAgaWQ9InBhdGgzMzgwIiAvPgoJCTxwYXRoCiAgIGQ9Ik0xNzYuMTQyLDU3Ljc0MXYtMC41OTRjMC4yMTgsMCwwLjQ3My0wLjA1NCwwLjc2NS0wLjE2MmMxLjEzMS0wLjM5NiwxLjkzMy0wLjc3MywyLjQwNy0xLjEzNCAgICBjMC43MjktMC41NzYsMS4wOTQtMS4yOTYsMS4wOTQtMi4xNmMwLTEuMTE1LTAuMzU0LTIuMDQyLTEuMDYzLTIuNzgxYy0wLjcwOC0wLjczOC0xLjQ5OS0xLjEwNy0yLjM3MS0xLjEwNyAgICBjLTEuMTI3LDAtMS45NDQsMC4zMjQtMi40NTIsMC45NzJjMC4wMzYsMC4xODEsMC4wODksMC4zNDMsMC4xNjIsMC40ODZjMC43MiwwLDEuMjA2LDAuMTYyLDEuNDU4LDAuNDg2ICAgIGMwLjI1MSwwLjMyNCwwLjM3OCwwLjc1NiwwLjM3OCwxLjI5NmMwLDEuMTg4LTAuNjY3LDEuNzgyLTEuOTk4LDEuNzgyYy0wLjU3NiwwLTEuMDI2LTAuMTYyLTEuMzUtMC40ODYgICAgYy0wLjMyNC0wLjMyNC0wLjQ4Ni0wLjg0NS0wLjQ4Ni0xLjU2NmMwLTEuMjYsMC40NC0yLjIzMSwxLjMyMy0yLjkxNmMwLjg4MS0wLjY4NCwyLjMxMy0xLjAyNiw0LjI5My0xLjAyNiAgICBjMS4zMzEsMCwyLjUxMSwwLjQ3OCwzLjUzNywxLjQzMWMxLjAyNiwwLjk1NCwxLjUzOSwyLjExNSwxLjUzOSwzLjQ4M2MwLDEuMDA4LTAuMjE2LDEuNzczLTAuNjQ4LDIuMjk1ICAgIGMtMC40MzIsMC41MjItMS4xMTYsMC45ODEtMi4wNTIsMS4zNzdjMC44NjQsMC4zNTksMS40OTMsMC43NzQsMS44OSwxLjI0MmMwLjU0LDAuNjQ4LDAuODEsMS40NzYsMC44MSwyLjQ4NCAgICBjMCwxLjMzMi0wLjUxMywyLjQ3NS0xLjUzOSwzLjQyOWMtMS4wMjYsMC45NTQtMi4yMDYsMS40MzEtMy41MzcsMS40MzFjLTEuOTQ0LDAtMy4zNjctMC4zNDItNC4yNjYtMS4wMjYgICAgYy0wLjktMC42ODUtMS4zNS0xLjY1Ni0xLjM1LTIuOTE2YzAtMC43NTYsMC4xNTMtMS4yODgsMC40NTktMS41OTNjMC4zMDYtMC4zMDYsMC43ODMtMC40NTksMS40MzEtMC40NTkgICAgYzEuMjk2LDAsMS45NDQsMC41OTQsMS45NDQsMS43ODJjMCwwLjU3NS0wLjEyNiwxLjAxNy0wLjM3OCwxLjMyM2MtMC4yNTIsMC4zMDYtMC43NTYsMC40NTktMS41MTIsMC40NTkgICAgYzAuMDM2LDAuMjE2LDAuMDg5LDAuNDUsMC4xNjIsMC43MDJjMC42MTIsMC40NjcsMS4zNSwwLjcwMiwyLjIxNCwwLjcwMmMwLjgyOCwwLDEuNjAyLTAuMzYsMi4zMjItMS4wOCAgICBjMC43Mi0wLjcyMSwxLjA4LTEuNjM5LDEuMDgtMi43NTRjMC0wLjgyOS0wLjM2LTEuNTMxLTEuMDgtMi4xMDZjLTAuNTQtMC40MzItMS4zNS0wLjgyOS0yLjQzLTEuMTg4TDE3Ni4xNDIsNTcuNzQxeiIKICAgaWQ9InBhdGgzMzgyIiAvPgoJCTxwYXRoCiAgIGQ9Ik0xOTcuNDcyLDQ4LjgzMWMtMC44NjQsMS40NzctMS43NDcsMi45NjEtMi42NDYsNC40NTVjLTAuOSwxLjQ5NC0xLjYyLDIuNTgzLTIuMTYsMy4yNjdsLTMuMDI0LDQuNjk4aDQuNDgydi01LjU2MiAgICBsMy43OC0zLjE4NnY4Ljc0OGgxLjYydjAuNzU2aC0xLjYyYzAsMC4zOTYsMC4wMDgsMC44MSwwLjAyNywxLjI0MmMwLjAxOCwwLjQzMiwwLjA2MywwLjc4MywwLjEzNSwxLjA1MyAgICBjMC4wNzIsMC4yNywwLjM5NiwwLjUzMSwwLjk3MiwwLjc4M2MwLjA3MiwwLjAzNiwwLjIzNCwwLjA4OSwwLjQ4NiwwLjE2MnYwLjc1NmgtNy4xMjh2LTAuNzU2ICAgIGMwLjMyNC0wLjEwOCwwLjU1OC0wLjE4MSwwLjcwMi0wLjIxNmMwLjU0LTAuMjE2LDAuODI4LTAuNDMyLDAuODY0LTAuNjQ4YzAuMDM1LTAuMTgsMC4wNjMtMC41MTMsMC4wODEtMC45OTkgICAgYzAuMDE4LTAuNDg2LDAuMDQ0LTAuOTQ1LDAuMDgxLTEuMzc3aC01Ljg4NnYtMC43NTZjMS41ODMtMS4xMTYsMi43OS0yLjg4LDMuNjE4LTUuMjkyYzAuNDMyLTIuMzc2LDAuODgxLTQuNzUyLDEuMzUtNy4xMjggICAgSDE5Ny40NzJ6IgogICBpZD0icGF0aDMzODQiIC8%CgkJPHBhdGgKICAgZD0iTTIwNC4yMjEsNDguODMxYzAuMTA4LDAuMDcyLDAuNjM5LDAuMTg5LDEuNTkzLDAuMzUxYzAuOTU0LDAuMTYyLDEuNzczLDAuMjQzLDIuNDU3LDAuMjQzICAgIGMwLjg5OSwwLDEuNzE5LTAuMDU0LDIuNDU3LTAuMTYyYzAuNzM3LTAuMTA4LDEuMzk1LTAuMjM0LDEuOTcxLTAuMzc4YzAsMC42MTMtMC4wODEsMS4xMjYtMC4yNDMsMS41MzkgICAgYy0wLjE2MiwwLjQxNS0wLjQ3OCwwLjc4My0wLjk0NSwxLjEwN2MtMC4yMTYsMC4xNDUtMC42MjEsMC4yNy0xLjIxNSwwLjM3OGMtMC41OTQsMC4xMDgtMS4xMjUsMC4xNjItMS41OTMsMC4xNjIgICAgYy0wLjcyMSwwLTEuNDU4LTAuMDU0LTIuMjE0LTAuMTYyYy0wLjc1Ni0wLjEwOC0xLjE3LTAuMjE2LTEuMjQyLTAuMzI0djQuNzUyYzAuOTM2LTEuMDQzLDEuOTc5LTEuNTY2LDMuMTMyLTEuNTY2ICAgIGMxLjU4NCwwLDIuODYyLDAuNDM1LDMuODM0LDEuMzAzYzAuOTcyLDAuODY4LDEuNDU4LDEuOTg5LDEuNDU4LDMuMzY0YzAsMS43MzYtMC42MTIsMy4yNTUtMS44MzYsNC41NTggICAgYy0xLjIyNCwxLjMwMi0yLjY2NSwxLjk1NC00LjMyLDEuOTU0Yy0wLjM5NiwwLTAuNjg0LTAuMDE5LTAuODY0LTAuMDU0Yy0wLjg2NC0wLjE0NS0xLjU0OC0wLjQzMi0yLjA1Mi0wLjg2NCAgICBjLTAuNzIxLTAuNjEyLTEuMDgtMS41NjYtMS4wOC0yLjg2MmMwLTAuNjEyLDAuMTYyLTEuMDk5LDAuNDg2LTEuNDU4YzAuMzI0LTAuMzYsMC44MjgtMC41NCwxLjUxMi0wLjU0ICAgIGMxLjM2OCwwLDIuMDUyLDAuNjQ4LDIuMDUyLDEuOTQ0YzAsMS4wOC0wLjQzMiwxLjY5MS0xLjI5NiwxLjgzNmMtMC4yNTIsMC4xMDgtMC41MDQsMC4yMzMtMC43NTYsMC4zNzggICAgYzAuMzI0LDAuMzI0LDAuNjg0LDAuNTQ4LDEuMDgsMC42NzVjMC4zOTYsMC4xMjYsMC43OTIsMC4xODksMS4xODgsMC4xODljMC45MzYsMCwxLjcwOS0wLjQ1MywyLjMyMi0xLjM1NyAgICBjMC42MTItMC45MDYsMC45MTgtMi4xOTEsMC45MTgtMy44NTdjMC0xLjEyMi0wLjI3LTIuMDkxLTAuODEtMi45MDVjLTAuNTQtMC44MTUtMS4yNzgtMS4yMjMtMi4yMTQtMS4yMjMgICAgYy0xLjE4OCwwLTIuMTA2LDAuNTQtMi43NTQsMS42MmgtMS4wMjZWNDguODMxeiIKICAgaWQ9InBhdGgzMzg2IiAvPgoJCTxwYXRoCiAgIGQ9Ik0yMjcuNzEsNTAuNTU5Yy0wLjA3Mi0wLjExMy0wLjEyNi0wLjIyNy0wLjE2Mi0wLjM0Yy0wLjU3Ni0wLjUyOS0xLjE4OC0wLjc5NC0xLjgzNi0wLjc5NCAgICBjLTAuMzI0LDAtMC42MywwLjA3My0wLjkxOCwwLjIxNmMtMC42NDgsMC4zNi0xLjE0MywxLjEwNy0xLjQ4NSwyLjI0MWMtMC4zNDMsMS4xMzQtMC41MTMsMi4yNzctMC41MTMsMy40MjkgICAgYzAsMS42NTYsMC4xOTgsMi41MzgsMC41OTQsMi42NDZjMC43NS0xLjA4LDEuODU3LTEuNjIsMy4zMjItMS42MmMxLjEwNywwLDIuMDE4LDAuNTIyLDIuNzMzLDEuNTY2ICAgIGMwLjYwNywwLjg5OSwwLjkxMSwxLjkwOCwwLjkxMSwzLjAyNGMwLDEuNTQ4LTAuNDc4LDIuNzgxLTEuNDMxLDMuNjk5Yy0wLjk1NCwwLjkxOC0yLjEzMywxLjM3Ny0zLjUzNywxLjM3NyAgICBjLTEuOTA5LDAtMy40MTItMC44OTEtNC41MDktMi42NzNjLTEuMDk5LTEuNzgyLTEuNjQ3LTMuODI2LTEuNjQ3LTYuMTI5YzAtMi4wODcsMC42NDgtMy45OTYsMS45NDQtNS43MjQgICAgYzEuMjk2LTEuNzI4LDIuNzktMi41OTIsNC40ODItMi41OTJjMS41ODMsMCwyLjczNSwwLjQ5MSwzLjQ1NiwxLjQ3MmMwLjUwMywwLjY5LDAuNzU2LDEuNDg5LDAuNzU2LDIuMzk3ICAgIGMwLDAuNTQ1LTAuMTk4LDEuMDM2LTAuNTk0LDEuNDcyYy0wLjM5NiwwLjQzNi0wLjc5MiwwLjY1NC0xLjE4OCwwLjY1NGMtMC42ODQsMC0xLjIyNC0wLjE2Mi0xLjYyLTAuNDg2ICAgIGMtMC4zOTctMC4zMjQtMC41OTQtMC44NjQtMC41OTQtMS42MmMwLTAuNjg0LDAuMjE2LTEuMjE1LDAuNjQ4LTEuNTkzQzIyNi45NTUsNTAuODAyLDIyNy4zNSw1MC41OTUsMjI3LjcxLDUwLjU1OXogICAgIE0yMjcuNDk1LDYxLjQxM2MwLTEuMjk2LTAuMDktMi4yMTQtMC4yNy0yLjc1NGMtMC4zMjQtMC45MzctMC45MTgtMS40MDQtMS43ODItMS40MDRjLTAuODI5LDAtMS4zNzcsMC4zODctMS42NDcsMS4xNjEgICAgYy0wLjI3LDAuNzc0LTAuNDA1LDEuNzcyLTAuNDA1LDIuOTk3YzAsMS4wOCwwLjE0NCwxLjk5OCwwLjQzMiwyLjc1NGMwLjI4OCwwLjc1NiwwLjgyOCwxLjEzNCwxLjYyLDEuMTM0ICAgIGMwLjcyLDAsMS4yNDItMC4zOTYsMS41NjYtMS4xODhDMjI3LjMzMyw2My4zMjEsMjI3LjQ5NSw2Mi40MiwyMjcuNDk1LDYxLjQxM3oiCiAgIGlkPSJwYXRoMzM4OCIgLz4KCQk8cGF0aAogICBkPSJNMjM4LjEzMiw2Ni4wMDNjMC4xMDgtMC44NjQsMC4yMzQtMS43MjgsMC4zNzgtMi41OTJjMC40MzItMS43MjgsMS4xODgtMy4xMzIsMi4yNjgtNC4yMTIgICAgYzEuMjI0LTEuMTg4LDIuMTc4LTIuMjE0LDIuODYyLTMuMDc4YzAuOS0xLjExNiwxLjQyMi0yLjAxNiwxLjU2Ni0yLjdsMC4yNy0xLjI0MmMtMC40NjgsMC4zMDMtMC45NjQsMC41NjgtMS40ODUsMC43OTQgICAgYy0wLjUyMiwwLjIyNy0xLjAzNSwwLjM0LTEuNTM5LDAuMzRjLTAuOTM3LDAtMi4wNy0wLjQwOC0zLjQwMi0xLjIyNGMtMC42NDgtMC40MDgtMS4yMDctMC42MTItMS42NzQtMC42MTIgICAgYy0wLjU3NiwwLTAuOTgxLDAuMTcxLTEuMjE1LDAuNTEzYy0wLjIzNSwwLjM0Mi0wLjQyNCwwLjY1Ny0wLjU2NywwLjk0NWgtMC42NDh2LTMuNTY0aDAuNTRjMC4wNzIsMC4yMTYsMC4xNjIsMC40NDEsMC4yNywwLjY3NSAgICBjMC4xMDgsMC4yMzUsMC4zMDYsMC4zNTEsMC41OTQsMC4zNTFjMC4yNTEsMCwwLjYyOS0wLjE2MiwxLjEzNC0wLjQ4NmMxLjA4LTAuNzIsMS44NTQtMS4wOCwyLjMyMi0xLjA4ICAgIGMwLjc1NiwwLDEuNDk0LDAuMjYyLDIuMjE0LDAuNzgzYzAuNzIsMC41MjIsMS40MDQsMC43ODMsMi4wNTIsMC43ODNjMC40NjgsMCwwLjgyOC0wLjIyNCwxLjA4LTAuNjcxICAgIGMwLjEwOC0wLjE4NywwLjE5Ny0wLjQ4NSwwLjI3LTAuODk1aDAuNzAydjMuNDAyYzAsMS4wNzYtMC4xNzYsMi4wNjItMC41MjUsMi45NThjLTAuMTA1LDAuMjUxLTAuODc2LDEuNTk1LTIuMzExLDQuMDM0ICAgIGMtMC4zNTEsMC42NDYtMC42MDUsMS40MjUtMC43NjIsMi4zNDFjLTAuMTU4LDAuOTE0LTAuMjM2LDEuNzgzLTAuMjM2LDIuNjA4YzAsMS4xNDcsMCwxLjc1NywwLDEuODI5SDIzOC4xMzJ6IgogICBpZD0icGF0aDMzOTAiIC8%CgkJPHBhdGgKICAgZD0iTTI1Ny45NSw1Ni41NTNjMC41NzUsMC4xOCwxLjI2LDAuNzc0LDIuMDUyLDEuNzgyYzAuNjQ4LDAuNzkyLDAuOTcyLDEuNTEyLDAuOTcyLDIuMTZjMCwxLjgzNi0wLjU3NiwzLjI0LTEuNzI4LDQuMjEyICAgIGMtMC45NzIsMC44MjgtMi4xNDIsMS4yNDItMy41MSwxLjI0MmMtMS41MTIsMC0yLjc2NC0wLjQ5Ni0zLjc1My0xLjQ4NWMtMC45OS0wLjk5LTEuNDg1LTIuMzEzLTEuNDg1LTMuOTY5ICAgIGMwLTAuNjg1LDAuMzQyLTEuMzg2LDEuMDI2LTIuMTA2YzAuNTA0LTAuNTQsMS4wNjItMC45MzcsMS42NzQtMS4xODhjLTAuNzIxLTAuMzk2LTEuMjc4LTAuOTQ1LTEuNjc0LTEuNjQ3ICAgIGMtMC4zOTYtMC43MDItMC41OTQtMS40NDktMC41OTQtMi4yNDFjMC0xLjM2OCwwLjQ4Ni0yLjQ0OCwxLjQ1OC0zLjI0YzAuOTcyLTAuNzkxLDIuMDg3LTEuMTg4LDMuMzQ4LTEuMTg4ICAgIGMxLjMzMSwwLDIuNDU3LDAuNDA1LDMuMzc1LDEuMjE1czEuMzc3LDEuOTUzLDEuMzc3LDMuNDI5YzAsMC41NzctMC4zMjQsMS4yMDctMC45NzIsMS44OSAgICBDMjU5LjAxMSw1NS45NTksMjU4LjQ5LDU2LjMzNywyNTcuOTUsNTYuNTUzeiBNMjUzLjg5OSw1Ny45MDNjLTAuNTc2LDAuMjg4LTEuMDI2LDAuNjEyLTEuMzUsMC45NzIgICAgYy0wLjQ2OCwwLjU0LTAuNzAyLDEuMTg4LTAuNzAyLDEuOTQ0YzAsMS4wOCwwLjM1NiwyLjA0MywxLjA2OSwyLjg4OWMwLjcxMywwLjg0NSwxLjY1NSwxLjI2OSwyLjgyNCwxLjI2OSAgICBjMS4wNiwwLDEuODU1LTAuMjQzLDIuMzg1LTAuNzI5czAuNzk2LTEuMDM1LDAuNzk2LTEuNjQ3YzAtMC4zOTYtMC4yNjgtMC44ODMtMC44MDEtMS40NThjLTAuNTMzLTAuNTc2LTEuMTIzLTEuMDYzLTEuNzY2LTEuNDU4ICAgIGMtMC42NDQtMC4zOTYtMS4yNDEtMC44MS0xLjc5My0xLjI0MkMyNTQuMzc4LDU4LjI5OSwyNTQuMTU3LDU4LjExOSwyNTMuODk5LDU3LjkwM3ogTTI1Ny4wODUsNTUuODUxICAgIGMwLjQ2OC0wLjE4LDAuODkxLTAuNTMxLDEuMjY5LTEuMDUzYzAuMzc4LTAuNTIxLDAuNTY3LTEuMDcxLDAuNTY3LTEuNjQ3YzAtMS4wMDctMC4yODktMS44MzYtMC44NjQtMi40ODQgICAgYy0wLjU3Ni0wLjY0OC0xLjM2OS0wLjk3Mi0yLjM3Ni0wLjk3MmMtMC43OTIsMC0xLjQ1LDAuMjYyLTEuOTcxLDAuNzgzYy0wLjUyMiwwLjUyMi0wLjc4MywxLjEyNS0wLjc4MywxLjgwOSAgICBjMCwwLjM2LDAuMjUxLDAuNzU2LDAuNzU2LDEuMTg4YzAuMjUxLDAuMjE2LDAuNzI5LDAuNTQsMS40MzEsMC45NzJjMC43MDIsMC40MzIsMS4yMTUsMC43NzUsMS41MzksMS4wMjYgICAgQzI1Ni43NjIsNTUuNTgxLDI1Ni45MDUsNTUuNzA4LDI1Ny4wODUsNTUuODUxeiIKICAgaWQ9InBhdGgzMzkyIiAvPgoJCTxwYXRoCiAgIGQ9Ik0yNjcuODMxLDY0LjMyOWMwLjAzNiwwLjEwOCwwLjA5LDAuMjE2LDAuMTYyLDAuMzI0YzAuNTc2LDAuNTA0LDEuMTg4LDAuNzU2LDEuODM2LDAuNzU2ICAgIGMwLjMyNCwwLDAuNjI5LTAuMDczLDAuOTE4LTAuMjE2YzAuNjg0LTAuMzYsMS4xNzktMS4wNzEsMS40ODUtMi4xMzNjMC4zMDUtMS4wNjMsMC40NTktMi4yMjMsMC40NTktMy40ODMgICAgYzAtMS42OTMtMC4xODEtMi41OTItMC41NC0yLjdjLTAuNzU2LDEuMTE1LTEuODU0LDEuNjc0LTMuMjk0LDEuNjc0Yy0xLjExNiwwLTIuMDA3LTAuNDg5LTIuNjczLTEuNDY1ICAgIGMtMC42NjctMC45NzctMC45OTktMi4wMjctMC45OTktMy4xNWMwLTEuNTU3LDAuNDc3LTIuNzk3LDEuNDMxLTMuNzJjMC45NTQtMC45MjMsMi4xNTEtMS4zODUsMy41OTEtMS4zODUgICAgYzEuOTA4LDAsMy40MzgsMC45MzcsNC41OSwyLjgwOGMxLjAwNywxLjY1NiwxLjUxMiwzLjY1NCwxLjUxMiw1Ljk5NGMwLDIuMDg3LTAuNjQ4LDMuOTk2LTEuOTQ0LDUuNzI0cy0yLjc5LDIuNTkyLTQuNDgyLDIuNTkyICAgIGMtMS41ODQsMC0yLjczNi0wLjQ4Ni0zLjQ1Ni0xLjQ1OGMtMC41MDQtMC42ODUtMC43NTYtMS40NzctMC43NTYtMi4zNzZjMC0wLjU0LDAuMTk3LTEuMDI2LDAuNTk0LTEuNDU4ICAgIGMwLjM5Ni0wLjQzMiwwLjg2NC0wLjY0OCwxLjQwNC0wLjY0OGMwLjYxMSwwLDEuMDk4LDAuMTYyLDEuNDU4LDAuNDg2YzAuMzU5LDAuMzI0LDAuNTQsMC44NjQsMC41NCwxLjYyICAgIGMwLDAuNjgzLTAuMjUyLDEuMjQyLTAuNzU2LDEuNjc0QzI2OC41NTEsNjQuMTEzLDI2OC4xOTEsNjQuMjkyLDI2Ny44MzEsNjQuMzI5eiBNMjY4LjA0Nyw1My40NDdjMCwxLjMwNCwwLjA4OSwyLjIyOSwwLjI3LDIuNzcyICAgIGMwLjMyNCwwLjk0MiwwLjg5OSwxLjQxMywxLjcyOCwxLjQxM2MwLjgyOCwwLDEuMzg1LTAuNDA3LDEuNjc0LTEuMjIzYzAuMjg4LTAuODE1LDAuNDMyLTEuODAzLDAuNDMyLTIuOTYzICAgIGMwLTEuMTIzLTAuMTI2LTEuOTkzLTAuMzc4LTIuNjFjLTAuMzYtMC44NjktMC45MzctMS4zMDQtMS43MjgtMS4zMDRjLTAuNzU2LDAtMS4yNzgsMC4zOC0xLjU2NiwxLjE0MiAgICBDMjY4LjE5MSw1MS40MzYsMjY4LjA0Nyw1Mi4zNiwyNjguMDQ3LDUzLjQ0N3oiCiAgIGlkPSJwYXRoMzM5NCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzM5NiI%CgkJPHBhdGgKICAgZD0iTTQxNC40NCw2Mi43NTRjMC43NjgtMC4yNzIsMS40OTctMC45MTEsMi4xODgtMS45MThjMC4yMy0wLjMxLDAuNTE4LTAuODEzLDAuODYzLTEuNTExbDEuNjE0LTYuNjcxICAgIGMtMC43MzEsMS4yODEtMS45OCwxLjkyMi0zLjc0OCwxLjkyMmMtMC4zMDgsMC0wLjYxNSwwLTAuOTIzLDBjLTAuMzQ2LTAuMTE2LTAuNTc2LTAuMTkzLTAuNjkxLTAuMjMyICAgIGMtMC42OTItMC4xOTMtMS4yNS0wLjUyMi0xLjY3Mi0wLjk4NmMtMC40MjQtMC40NjQtMC42MzUtMS4wNjMtMC42MzUtMS43OThjMC0wLjY5NiwwLjIzMi0xLjI3NiwwLjY5NS0xLjc0ICAgIHMxLjA2Mi0wLjY5NiwxLjc5NS0wLjY5NmMwLjY1NiwwLDEuMjI2LDAuMjQyLDEuNzA4LDAuNzI1YzAuNDgyLDAuNDg0LDAuNzI0LDEuMDM1LDAuNzI0LDEuNjUzYzAsMC4zMS0wLjA3OCwwLjYzOC0wLjIzMiwwLjk4NiAgICBzLTAuNDQ0LDAuNjU4LTAuODY5LDAuOTI4YzAuMTkzLDAuMDc4LDAuNDA2LDAuMTU1LDAuNjM3LDAuMjMyYzAuMTU0LDAsMC4zODYtMC4wNTgsMC42OTUtMC4xNzYgICAgYzAuNzMzLTAuMjM1LDEuNDA5LTAuNzkzLDIuMDI3LTEuNjc1YzAuNjE3LTAuODgxLDEuMjE2LTEuNzczLDEuNzk1LTIuNjc0aDAuNDA2bC02LjAyNCwyNS44NjhsLTEuMDY4LTAuMDA2bDMuMTg0LTEzLjE2NiAgICBjLTAuNzMxLDEuMjgtMS45NjMsMS45Mi0zLjY5MywxLjkyYy0wLjE5MywwLTAuMzg2LDAtMC41NzgsMGMtMC4yNy0wLjAzOS0wLjY4My0wLjEzNi0xLjI0MS0wLjI5ICAgIGMtMC41NTctMC4xNTUtMS4wNDgtMC40NjQtMS40NzEtMC45MjhjLTAuNDIzLTAuNDY0LTAuNjM0LTEuMDY0LTAuNjM0LTEuNzk4YzAtMC42NTgsMC4yMzEtMS4yMTgsMC42OTUtMS42ODIgICAgYzAuNDYzLTAuNDY0LDEuMDYyLTAuNjk2LDEuNzk1LTAuNjk2YzAuNjU2LDAsMS4yMjUsMC4yNDEsMS43MDgsMC43MjVjMC40ODIsMC40ODMsMC43MjQsMS4wMzQsMC43MjQsMS42NTMgICAgYzAsMC4zMDktMC4wNzgsMC42MzgtMC4yMzEsMC45ODZjLTAuMTU1LDAuMzQ4LTAuNDQ0LDAuNjM4LTAuODY5LDAuODdjMC40NTksMC4xNTQsMC43MjksMC4yMzIsMC44MDYsMC4yMzIgICAgQzQxNC4xNTIsNjIuODEyLDQxNC4zMjQsNjIuNzkyLDQxNC40NCw2Mi43NTR6IgogICBpZD0icGF0aDMzOTgiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM0MDAiPgoJCTxwYXRoCiAgIGQ9Ik00MjcuOTc1LDU4LjI1OWMwLjY1NiwwLDEuMjM1LDAuMjUyLDEuNzM4LDAuNzU0YzAuNTAxLDAuNTAzLDAuNzUyLDEuMDQ0LDAuNzUyLDEuNjI0YzAsMC4yNzEtMC4wOTcsMC42LTAuMjksMC45ODYgICAgYy0wLjE5MywwLjM4Ny0wLjQ4MywwLjY5Ni0wLjg2OSwwLjkyOGMwLjIzMiwwLjA3OCwwLjQ2MywwLjE1NSwwLjY5NSwwLjIzMmMwLjE1NCwwLDAuMzg1LTAuMDU4LDAuNjk1LTAuMTc2ICAgIGMwLjg4OC0wLjMxNCwxLjc1Ni0xLjEzNiwyLjYwNi0yLjQ2OGMwLjM4Ni0wLjYyNywwLjc3Mi0xLjI1MywxLjE1OC0xLjg4MWgwLjQwNWwtMy44MjIsMTYuNzA0bC0xLjEyNy0wLjAwNmwzLjMxLTEzLjE2NCAgICBjLTAuNzMyLDEuMjgtMS45ODMsMS45MTgtMy43NTUsMS45MThjLTAuMTkzLDAtMC4zODYsMC0wLjU3OSwwYy0wLjI3LTAuMDM4LTAuNjk0LTAuMTM1LTEuMjcxLTAuMjkgICAgYy0wLjU3OC0wLjE1NC0xLjA2OS0wLjQ2NC0xLjQ3My0wLjkyOGMtMC40MDUtMC40NjQtMC42MDYtMS4wNjMtMC42MDYtMS43OThjMC0wLjY5NiwwLjIzMS0xLjI3NiwwLjY5NS0xLjc0ICAgIFM0MjcuMjgsNTguMjU5LDQyNy45NzUsNTguMjU5eiIKICAgaWQ9InBhdGgzNDAyIiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNDA0Ij4KCQk8cGF0aAogICBkPSJNNDc2Ljk2NCw2NS45NThINDY2LjI1di00LjU4MmgxMC43MTRWNjUuOTU4eiIKICAgaWQ9InBhdGgzNDA2IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNDA4Ij4KCQk8cGF0aAogICBkPSJNNDg4LjUsNjEuODc1YzAtMS4wOSwwLjQwNC0xLjk3MywxLjIxMy0yLjY1czEuNzc1LTEuMTU0LDIuOS0xLjQzM3MyLjE2NS0wLjQxNywzLjEyLTAuNDE3ICAgIGMxLjA0MywwLDIuMTM3LDAuMTM4LDMuMjgzLDAuNDEzczIuMTQsMC43NDksMi45ODQsMS40MTlzMS4yODksMS41NiwxLjMzNiwyLjY2N2MwLDEuMTAyLTAuNDA0LDEuOTk1LTEuMjEzLDIuNjgxICAgIHMtMS43NzcsMS4xNzItMi45MDUsMS40NTlzLTIuMTkzLDAuNDMxLTMuMTk1LDAuNDMxYy0xLjA3OCwwLTIuMTg2LTAuMTM5LTMuMzIyLTAuNDE3cy0yLjExNS0wLjc1OS0yLjkzNi0xLjQ0MSAgICBTNDg4LjUyMyw2Myw0ODguNSw2MS44NzV6IE00OTMsNjEuMTE5YzAuMDcsMS4zMzYsMC40NjQsMi40MzgsMS4xODIsMy4zMDVzMS41ODMsMS4zMDEsMi41OTcsMS4zMDEgICAgYzAuNzc5LTAuMDg4LDEuMzE3LTAuMzQ3LDEuNjEzLTAuNzc4czAuNDQ0LTEuMTc5LDAuNDQ0LTIuMjQ2Yy0wLjEwNS0xLjM3MS0wLjUxNi0yLjQ4MS0xLjIzLTMuMzMxcy0xLjU5MS0xLjI3NC0yLjYyOC0xLjI3NCAgICBjLTAuNzIxLDAuMTE3LTEuMjMsMC4zNzktMS41MjksMC43ODdTNDkzLDYwLjAzNSw0OTMsNjEuMTE5eiIKICAgaWQ9InBhdGgzNDEwIiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNDEyIj4KCTwvZz4KCTxnCiAgIGlkPSJnMzQxNCI%CgkJPHBhdGgKICAgZD0iTTUxNC41ODEsNjUuNTA5Yy0xLjA4MSwwLjY1Ny0yLjE2MywwLjk4Ni0zLjI0MywwLjk4NmMtMS4xOTcsMC0yLjE2My0wLjQyNi0yLjg5Ni0xLjI3NiAgICBjLTAuNTQxLTAuNTgtMC44MTEtMS4yOTYtMC44MTEtMi4xNDZjMC0wLjkyOCwwLjI5OC0xLjgzNiwwLjg5Ny0yLjcyNmMwLjU5OC0wLjg4OSwxLjM2MS0xLjU4NSwyLjI4OC0yLjA4OCAgICBjMS4xMTktMC42OTYsMi4yMzktMS4wNDQsMy4zNTktMS4wNDRjMS4wODEsMCwyLjAwNywwLjM2OCwyLjc4LDEuMTAyYzAuNTc5LDAuNTgsMC44NjksMS4zMTUsMC44NjksMi4yMDQgICAgYzAsMC45MjgtMC4zMSwxLjg1Ni0wLjkyNiwyLjc4NEM1MTYuMjc5LDY0LjIzMyw1MTUuNTA3LDY0Ljk2Nyw1MTQuNTgxLDY1LjUwOXoiCiAgIGlkPSJwYXRoMzQxNiIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzQxOCI%CgkJPHBhdGgKICAgZD0iTTUyOS4xOTUsNjUuNjg3Yy0xLjA4MywwLjY1Ny0yLjE2NiwwLjk4Ni0zLjI0OCwwLjk4NmMtMS4xOTksMC0yLjE2Ni0wLjQyNi0yLjktMS4yNzYgICAgYy0wLjU0Mi0wLjU4LTAuODEyLTEuMjk2LTAuODEyLTIuMTQ2YzAtMC45MjgsMC4yOTktMS44MzYsMC44OTktMi43MjZjMC41OTktMC44ODksMS4zNjMtMS41ODUsMi4yOTEtMi4wODggICAgYzEuMTIxLTAuNjk2LDIuMjQyLTEuMDQ0LDMuMzY0LTEuMDQ0YzEuMDgyLDAsMi4wMSwwLjM2OCwyLjc4NCwxLjEwMmMwLjU4LDAuNTgsMC44NywxLjMxNSwwLjg3LDIuMjA0ICAgIGMwLDAuOTI4LTAuMzEsMS44NTYtMC45MjgsMi43ODRDNTMwLjg5Niw2NC40MTEsNTMwLjEyMyw2NS4xNDUsNTI5LjE5NSw2NS42ODd6IE01MjMuNDUzLDY1LjA0OCAgICBjMC4xOTMsMC4yMzIsMC41OCwwLjM0OCwxLjE2LDAuMzQ4YzAuNjU3LDAsMS4zMjQtMC4xMzYsMi4wMDEtMC40MDZjMC42NzYtMC4yNzEsMS4zNDMtMC42NDgsMi4wMDEtMS4xMzEgICAgYzAuNjU3LTAuNDg0LDEuMjc2LTEuMTgsMS44NTYtMi4wODhzMC44Ny0xLjY5MSwwLjg3LTIuMzQ5YzAtMC4yMzItMC4wNTgtMC40NDQtMC4xNzQtMC42MzggICAgYy0wLjExNi0wLjE1NC0wLjM0OC0wLjIzMi0wLjY5Ni0wLjIzMmMtMC40NjQsMC0xLjEzMSwwLjE4NC0yLjAwMSwwLjU1MWMtMC44NywwLjM2OC0xLjY0NCwwLjc3NC0yLjMyLDEuMjE4ICAgIGMtMC42NzcsMC40NDUtMS4zMzQsMS4xMDItMS45NzIsMS45NzJzLTAuOTU3LDEuNTk1LTAuOTU3LDIuMTc1QzUyMy4yMjEsNjQuNzAxLDUyMy4yOTgsNjQuODk0LDUyMy40NTMsNjUuMDQ4eiIKICAgaWQ9InBhdGgzNDIwIiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNDIyIj4KCQk8cGF0aAogICBkPSJNNTQxLjgyOSw2MC45NTZjMC40MjUtMC4xNTQsMC43MDUtMC4zODYsMC44NDEtMC42OTZjMC4xMzUtMC4zMDksMC4yMDMtMS4wMjQsMC4yMDMtMi4xNDZjMC0wLjMwOSwwLTAuNTAyLDAtMC41OCAgICBjMC0wLjAzOCwwLTAuMDc3LDAtMC4xMTZoMy4wNzR2My4xMzJjLTAuMzEsMC0wLjU0MiwwLTAuNjk2LDBjLTAuMzg3LDAtMC43NzQsMC4wMS0xLjE2LDAuMDI5ICAgIGMtMC4zODcsMC4wMi0wLjcyNSwwLjA4Ny0xLjAxNSwwLjIwM2MtMC4yOSwwLjExNi0wLjUxMywwLjM4Ny0wLjY2NywwLjgxMnYwLjgxMmMwLjE1NCwwLjQyNSwwLjM4NiwwLjcwNSwwLjY5NiwwLjg0MSAgICBjMC4zMDksMC4xMzUsMS4wMjQsMC4yMDMsMi4xNDYsMC4yMDNjMC4zMDksMCwwLjUwMiwwLDAuNTgsMGMwLjAzOCwwLDAuMDc3LDAsMC4xMTYsMHYzLjEzMmgtMy4wNzRjMC0wLjMxLDAtMC41NDIsMC0wLjY5NiAgICBjMC0wLjM4Ny0wLjAxLTAuNzc0LTAuMDI5LTEuMTZjLTAuMDItMC4zODctMC4wODctMC43MjUtMC4yMDMtMS4wMTVjLTAuMTE2LTAuMjktMC4zODctMC41MTMtMC44MTItMC42NjdoLTEuMDQ0ICAgIGMtMC40MjYsMC4xNTQtMC43MDYsMC4zODYtMC44NDEsMC42OTZjLTAuMTM2LDAuMzA5LTAuMjAzLDEuMDI0LTAuMjAzLDIuMTQ2YzAsMC4zMDksMCwwLjUwMiwwLDAuNThjMCwwLjAzOCwwLDAuMDc3LDAsMC4xMTYgICAgaC0zLjA3NFY2My40NWMwLjMwOSwwLDAuNTQxLDAsMC42OTYsMGMwLjM4NiwwLDAuNzczLTAuMDEsMS4xNi0wLjAyOWMwLjM4Ni0wLjAyLDAuNzI1LTAuMDg3LDEuMDE1LTAuMjAzICAgIGMwLjI5LTAuMTE2LDAuNTEyLTAuMzg3LDAuNjY3LTAuODEydi0wLjgxMmMtMC4xNTUtMC40MjUtMC4zODctMC43MDUtMC42OTYtMC44NDFjLTAuMzEtMC4xMzUtMS4wMjUtMC4yMDMtMi4xNDYtMC4yMDMgICAgYy0wLjMxLDAtMC41MDMsMC0wLjU4LDBjLTAuMDM5LDAtMC4wNzgsMC0wLjExNiwwdi0zLjEzMmgzLjA3NGMwLDAuMzEsMCwwLjU0MiwwLDAuNjk2YzAsMC4zODcsMC4wMDksMC43NzQsMC4wMjksMS4xNiAgICBjMC4wMTksMC4zODcsMC4wODcsMC43MjUsMC4yMDMsMS4wMTVjMC4xMTYsMC4yOSwwLjM4NiwwLjUxMywwLjgxMiwwLjY2N0g1NDEuODI5eiIKICAgaWQ9InBhdGgzNDI0IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNDI2Ij4KCQk8cGF0aAogICBkPSJNNTQ5LjE2Nyw2Mi4wMzdsNC41MjQtNC41MjRjMS4wODIsMS4zMTUsMS45NzIsMi4yMDQsMi42NjgsMi42NjhsMi42MSwyLjAzbC00LjQ2Niw0LjUyNCAgICBjLTAuMzg3LTAuNDY0LTAuODEyLTAuOTA5LTEuMjc2LTEuMzM0Yy0wLjQ2NC0wLjQyNi0wLjkwOS0wLjg1MS0xLjMzNC0xLjI3NmMtMC40MjYtMC40MjYtMC45ODYtMC44OS0xLjY4Mi0xLjM5MiAgICBDNTQ5LjgyNCw2Mi40NjEsNTQ5LjQ3Niw2Mi4yMjksNTQ5LjE2Nyw2Mi4wMzd6IgogICBpZD0icGF0aDM0MjgiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM0MzAiPgoJCTxwYXRoCiAgIGQ9Ik01NzAuNjA2LDYyLjE3MWwtNC40MSw0LjMzOGMtMC40Mi0wLjc3Mi0xLjAzMi0xLjU2Mi0xLjgzNS0yLjM3MmMtMS4wMzItMS4wNDEtMi4wNjQtMS44MTMtMy4wOTctMi4zMTNsNC4zNTItNC4yODEgICAgYzAuNDk3LDAuNzgxLDEuMjgsMS42NiwyLjM1MiwyLjYzNkM1NjkuMDM4LDYxLjE1Niw1NjkuOTE3LDYxLjgyLDU3MC42MDYsNjIuMTcxeiBNNTY2LjE5Niw2NS40NjVsMy4zNjYtMy4yOTQgICAgYy0wLjUwMy0wLjMxLTEuMTktMC44NzMtMi4wNi0xLjY4OGMtMC44NzEtMC44MTQtMS41LTEuNDkzLTEuODg2LTIuMDM3bC0zLjMwNCwzLjM3N2MwLjgxMSwwLjQyNCwxLjYwMywxLjAyMSwyLjM3NywxLjc5MiAgICBDNTY1LjM0NSw2NC4yNyw1NjUuODQ4LDY0Ljg4Nyw1NjYuMTk2LDY1LjQ2NXoiCiAgIGlkPSJwYXRoMzQzMiIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzQzNCI%CgkJPHBhdGgKICAgZD0iTTU4Mi4zNDMsNjEuOTYyYzAsMS4yOTItMC40NDMsMi4zODEtMS4zMywzLjI2OGMtMC44ODcsMC44ODctMS45NzYsMS4zMy0zLjI2OCwxLjMzYy0xLjMxOCwwLTIuNDI2LTAuNDM3LTMuMzI1LTEuMzExICAgIHMtMS4zNDktMS45Ny0xLjM0OS0zLjI4N2MwLTEuMjkyLDAuNDUtMi4zODcsMS4zNDktMy4yODdjMC44OTktMC44OTksMi4wMDctMS4zNDksMy4zMjUtMS4zNDljMS4yOTIsMCwyLjM4MSwwLjQ0MywzLjI2OCwxLjMzICAgIEM1ODEuODk5LDU5LjU0Myw1ODIuMzQzLDYwLjY0Niw1ODIuMzQzLDYxLjk2MnogTTU3NC42MjksNjQuNzM2TDU3Ny4zODMsNjJsLTIuNzk4LTIuODEyYy0wLjcwNSwwLjc1NS0xLjA1OSwxLjY3My0xLjA1OSwyLjc1NSAgICBDNTczLjUyNyw2Myw1NzMuODk1LDYzLjkzMSw1NzQuNjI5LDY0LjczNnogTTU3NC45MzMsNTguODg1bDIuNzQ1LDIuNzYzbDIuNzY1LTIuODAyYy0wLjc3LTAuNzM1LTEuNjc1LTEuMTAyLTIuNzE4LTEuMTAyICAgIEM1NzYuNjU3LDU3Ljc0NSw1NzUuNzI3LDU4LjEyNSw1NzQuOTMzLDU4Ljg4NXogTTU4MC40NDMsNjUuMDc5bC0yLjc2NC0yLjcyOWwtMi43MjgsMi43MDljMC44MzksMC43MjIsMS43NjcsMS4wODMsMi43ODQsMS4wODMgICAgYzAuNTM0LDAsMS4wMTEtMC4wODksMS40My0wLjI2NkM1NzkuNTg0LDY1LjY5OSw1ODAuMDExLDY1LjQzMyw1ODAuNDQzLDY1LjA3OXogTTU4MC43ODQsNTkuMTVsLTIuODEzLDIuODQ4bDIuNzc1LDIuNzM5ICAgIGMwLjc2LTAuNzY2LDEuMTQxLTEuNjk3LDEuMTQxLTIuNzk0QzU4MS44ODcsNjAuODczLDU4MS41Miw1OS45NDEsNTgwLjc4NCw1OS4xNXoiCiAgIGlkPSJwYXRoMzQzNiIgLz4KCTwvZz4KCTxyZWN0CiAgIHg9IjU0OCIKICAgeT0iNTAiCiAgIHdpZHRoPSIxIgogICBoZWlnaHQ9IjMiCiAgIGlkPSJyZWN0MzQzOCIKICAgZmlsbD0ibm9uZSIgLz4KCTxnCiAgIGlkPSJnMzQ0MCI%CgkJPGcKICAgaWQ9ImczNDQyIj4KCQkJPHBhdGgKICAgZD0iTSA1ODkuNzUgNTcuMjUgQyA1ODguNDM4IDU3LjI1IDU4Ny4zMzg1IDU3LjcyMiA1ODYuNDM3NSA1OC42MjUgQyA1ODUuNTM1NSA1OS41MjcgNTg1LjA5Mzc1IDYwLjYyNTUgNTg1LjA5Mzc1IDYxLjkzNzUgQyA1ODUuMDkzNzUgNjMuMjQ5NSA1ODUuNTM1NSA2NC4zNDggNTg2LjQzNzUgNjUuMjUgQyA1ODcuMzM5NSA2Ni4xNTIgNTg4LjQzOCA2Ni42MjUgNTg5Ljc1IDY2LjYyNSBDIDU5MS4wNjIgNjYuNjI1IDU5Mi4xOTE3NSA2Ni4xNTIgNTkzLjA5Mzc1IDY1LjI1IEMgNTkzLjk5NTc1IDY0LjM0OCA1OTQuNDM3NSA2My4yNDk1IDU5NC40Mzc1IDYxLjkzNzUgQyA1OTQuNDM3NSA2MC42MjU1IDU5My45OTU3NSA1OS41MjcgNTkzLjA5Mzc1IDU4LjYyNSBDIDU5Mi4xOTE3NSA1Ny43MjMgNTkxLjA2MiA1Ny4yNSA1ODkuNzUgNTcuMjUgeiBNIDU4OS43NSA1Ny43NSBDIDU5MC44MTAyMSA1Ny43NSA1OTEuNzUwNzkgNTguMTEzNzc0IDU5Mi41MzEyNSA1OC44MTI1IEwgNTg2LjY1NjI1IDY0LjY4NzUgQyA1ODUuOTUzNyA2My45MDU5MTEgNTg1LjU2MjUgNjMuMDAwMTA4IDU4NS41NjI1IDYxLjkzNzUgQyA1ODUuNTYyNSA2MC43ODk1IDU4NS45OTI1IDU5LjgyIDU4Ni44MTI1IDU5IEMgNTg3LjYzMjUgNTguMTggNTg4LjYwMiA1Ny43NSA1ODkuNzUgNTcuNzUgeiBNIDU5Mi44NzUgNTkuMTU2MjUgQyA1OTMuNTg4NjEgNTkuOTQxNzQ2IDU5My45Mzc1IDYwLjg2NjU2MSA1OTMuOTM3NSA2MS45Mzc1IEMgNTkzLjkzNzUgNjMuMDg1NSA1OTMuNTM4NzUgNjQuMDU1IDU5Mi43MTg3NSA2NC44NzUgQyA1OTEuODk4NzUgNjUuNjk1IDU5MC44OTggNjYuMTI1IDU4OS43NSA2Ni4xMjUgQyA1ODguNjc1MTYgNjYuMTI1IDU4Ny43NTYwNyA2NS43NTAwNyA1ODYuOTY4NzUgNjUuMDMxMjUgTCA1OTIuODc1IDU5LjE1NjI1IHogIgogICBpZD0icGF0aDM0NDQiIC8%CgkJPC9nPgoJCTxnCiAgIGlkPSJnMzQ0NiI%CgkJCQoJCTwvZz4KCTwvZz4KCTxnCiAgIGlkPSJnMzQ1MCI%CgkJPHBhdGgKICAgZD0iTTYwMy4wMzIsNTMuMDA1bDUuNzc2LDUuNzkzbC0wLjY0OSwwLjY2N2wtNS4xNjEtNS4xNDRsLTUuMTI3LDUuMTI3bC0wLjY4NC0wLjY0OUw2MDMuMDMyLDUzLjAwNXogTTYwMi45OTgsNjMuNTE1ICAgIGwzLjE2MiwzLjE0NWwxLjQ1My0xLjQzNmwtMy4xNDUtMy4xNjJsMy4xNjItMy4xMjdsLTEuNDE4LTEuNDE4bC0zLjE3OSwzLjE5NmwtMy4xNzktMy4yM2wtMS4zNjcsMS4zNjdsMy4xOTYsMy4xOTZsLTMuMjY0LDMuMjY0ICAgIGwxLjQwMSwxLjQwMUw2MDIuOTk4LDYzLjUxNXoiCiAgIGlkPSJwYXRoMzQ1MiIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzQ1NCI%CgkJPHBhdGgKICAgZD0iTTYxOC4wOTksNTguODIzVjQ4LjQxN2gwLjg3YzAuMjA1LDEuMzcxLDAuNDgyLDIuNTIxLDAuODMxLDMuNDVzMC43NTYsMS43MjMsMS4yMjIsMi4zODJzMS4xNjUsMS41MTIsMi4wOTYsMi41NTggICAgczEuNjg1LDEuOTMyLDIuMjU5LDIuNjU5YzEuNzI5LDIuMjE1LDIuNTkzLDQuNTMyLDIuNTkzLDYuOTUyYzAsMi40ODQtMS4wNTgsNS41MDgtMy4xNzMsOS4wN2gtMC41NzEgICAgYzAuMjctMC42MjEsMC41ODMtMS4zNDIsMC45NC0yLjE2MnMwLjY1OC0xLjU2NCwwLjkwMS0yLjIzMnMwLjQzNS0xLjMzMywwLjU3Ni0xLjk5NXMwLjIxMS0xLjMxNSwwLjIxMS0xLjk2ICAgIGMwLTEuMDItMC4yMDgtMi4wNDgtMC42MjQtMy4wODVzLTAuOTk4LTEuOTk1LTEuNzQ1LTIuODc0cy0xLjU5Ny0xLjU5MS0yLjU0OS0yLjEzNnMtMS45NDEtMC44NDctMi45NjYtMC45MDV2MC42ODZINjE4LjA5OXoiCiAgIGlkPSJwYXRoMzQ1NiIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzQ1OCI%CgkJPHBhdGgKICAgZD0iTTY0Mi45MzcsNjcuNjI5YzAuNjI3LDEuMzU0LDAuOTQsMi44MDQsMC45NCw0LjM1MWMwLDIuMDIxLTAuNjEyLDQuMDQtMS44MzcsNi4wNTZoLTAuNTggICAgYzEuMDg0LTIuMzMyLDEuNjI2LTQuMzAxLDEuNjI2LTUuOTA2YzAtMS4xNzItMC4yNjItMi4yMDUtMC43ODctMy4wOThjLTAuNTIzLTAuODk0LTEuMTg2LTEuNjYxLTEuOTg2LTIuMzAzICAgIGMtMC44LTAuNjQyLTEuODc0LTEuMzc1LTMuMjIxLTIuMjAycy0yLjIwNi0xLjM2NS0yLjU3NS0xLjYxN3YwLjcyMWgtMC44NjFWNDguNTgzaDAuODYxYzAuMDY0LDEuMDg0LDAuMjg0LDIuMDA3LDAuNjU5LDIuNzY5ICAgIHMwLjc0NywxLjMzMiwxLjExNiwxLjcwOXMxLjA5NiwxLjA2NiwyLjE4LDIuMDY1czEuOTAxLDEuODQxLDIuNDUyLDIuNTI3YzAuODczLDEuMDk2LDEuNTEyLDIuMTYxLDEuOTE2LDMuMTk1ICAgIHMwLjYwNiwyLjEyOCwwLjYwNiwzLjI4M0M2NDMuNDQ2LDY0Ljk4MSw2NDMuMjc2LDY2LjE0Nyw2NDIuOTM3LDY3LjYyOXogTTY0Mi40NzEsNjYuNjU0YzAtMC4xNywwLjAwNi0wLjQxLDAuMDE4LTAuNzIxICAgIHMwLjAxOC0wLjUzOSwwLjAxOC0wLjY4NmMwLTMuNjkxLTIuNjYzLTcuMDE0LTcuOTg5LTkuOTY3YzAuMDM1LDEuMjAxLDAuMzEzLDIuMjkxLDAuODM1LDMuMjdzMS4zMDEsMS45OTEsMi4zMzgsMy4wMzcgICAgczEuOTU4LDEuOTU3LDIuNzY0LDIuNzMzQzY0MS4yNiw2NS4wOTcsNjQxLjkzMiw2NS44NzUsNjQyLjQ3MSw2Ni42NTR6IgogICBpZD0icGF0aDM0NjAiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM0NjIiPgoJCTxwYXRoCiAgIGQ9Ik02NTIuNjQyLDY4LjQwNlY0OC42MDdoMC44N2MwLjExNywxLjIxOSwwLjM1NCwyLjE2MiwwLjcwNywyLjgzYzAuMzU1LDAuNjY4LDAuODk1LDEuMzQ1LDEuNjE3LDIuMDMgICAgYzAuNzI1LDAuNjg2LDEuNzQ4LDEuNjQ2LDMuMDcyLDIuODgzYzIuMzU1LDIuMjY4LDMuNTMzLDQuOTQyLDMuNTMzLDguMDI0YzAsMS4wNjEtMC4xNDYsMi4xMTgtMC40MzksMy4xNzMgICAgYzAuMjkzLDAuOTA4LDAuNDM5LDEuODY2LDAuNDM5LDIuODc0YzAsMC43OTctMC4xMiwxLjcxMS0wLjM2LDIuNzQyYzAuNTc0LDAuNzM4LDAuODYxLDEuOTEzLDAuODYxLDMuNTI0ICAgIGMwLDEuMTI1LTAuMTU1LDIuMjY2LTAuNDY2LDMuNDIzcy0wLjc2OCwyLjE4Ny0xLjM3MSwzLjA4OWgtMC41OGMxLjA4NC0yLjIzOCwxLjYyNi00LjE4MSwxLjYyNi01LjgyNyAgICBjMC0xLjA0My0wLjIwOC0xLjk5Mi0wLjYyNC0yLjg0OHMtMC45OTItMS42My0xLjcyNy0yLjMyNWMtMC43MzYtMC42OTQtMS41MzQtMS4zMzYtMi4zOTYtMS45MjVzLTIuMTU5LTEuNDI4LTMuODk0LTIuNTE4djAuNjQ4ICAgIEg2NTIuNjQyeiBNNjUzLjU4Miw2MS40MjFjMC4wNywxLjEzNywwLjM5MSwyLjE1NSwwLjk2MywzLjA1NGMwLjU3LDAuODk5LDEuMjk5LDEuNzY1LDIuMTg0LDIuNTk3czEuNzk3LDEuNjg5LDIuNzM4LDIuNTcxICAgIGMwLjkzOSwwLjg4MiwxLjYwNiwxLjY4MywxLjk5OSwyLjQwNGMwLjAyMy0wLjE5MywwLjAzNS0wLjQ4MywwLjAzNS0wLjg3QzY2MS41MDEsNjcuNTQ0LDY1OC44NjEsNjQuMjkyLDY1My41ODIsNjEuNDIxeiAgICAgTTY1My42NTIsNTUuMTY0YzAsMS4wNjYsMC4yMzcsMS45NzYsMC43MTIsMi43MjlzMS4yOTgsMS42NjcsMi40NywyLjc0MnMyLjA5MiwxLjk3MiwyLjc2LDIuNjg5czEuMjkyLDEuNjgsMS44NzIsMi44ODcgICAgYzAuMDctMC40MjgsMC4xMDUtMC44MzUsMC4xMDUtMS4yMjJjMC0xLjQ2NS0wLjQwMy0yLjgwNC0xLjIwOC00LjAxN2MtMC44MDctMS4yMTMtMS43MTctMi4yMTUtMi43MzQtMy4wMDYgICAgQzY1Ni42MTMsNTcuMTc2LDY1NS4yODcsNTYuMjQyLDY1My42NTIsNTUuMTY0eiIKICAgaWQ9InBhdGgzNDY0IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNDY2Ij4KCQk8cGF0aAogICBkPSJNNjc1LjcxOCw3Ny4wMTZWNTQuMTQ4di01LjU0NmgwLjg2MWMwLDEuNDA2LDAuMzI5LDIuNTQ5LDAuOTg5LDMuNDI4YzAuNjU4LDAuODc5LDEuNzMyLDIuMDEsMy4yMjEsMy4zOTMgICAgczIuNjEsMi43MTcsMy4zNjYsNC4wMDNzMS4xMzQsMi45MjIsMS4xMzQsNC45MDljMCwwLjk2MS0wLjEyLDIuMDg5LTAuMzYsMy4zODRjMC40MzQsMC44MzIsMC42NSwxLjg4NywwLjY1LDMuMTY0ICAgIGMwLDEuMjI1LTAuMjE3LDIuMzc2LTAuNjUsMy40NTRjMC40OCwxLjA5LDAuNzIxLDIuMjMyLDAuNzIxLDMuNDI4YzAsMS4xNzItMC4yNCwyLjIyNy0wLjcyMSwzLjE2NCAgICBjMC41NzQsMC44NTUsMC44NjEsMi4wNTcsMC44NjEsMy42MDRjMCwyLjE4Ni0wLjUzOSw0LjQzLTEuNjE3LDYuNzMyaC0wLjY1YzAuOTg0LTIuODA3LDEuNDc3LTQuOTgsMS40NzctNi41MjEgICAgYzAtMS4xNi0wLjIyLTIuMTA5LTAuNjU5LTIuODQ4cy0wLjkzOS0xLjMwNy0xLjQ5OC0xLjcwNWMtMC41NjEtMC4zOTgtMS41MzEtMS4wMDktMi45MTQtMS44MzNzLTIuNDc2LTEuNTYzLTMuMjc4LTIuMjE5ICAgIGwtMC4wMDQsMC44NzdMNjc1LjcxOCw3Ny4wMTZ6IE02NzYuNTc5LDY4LjUxYzAsMS4yMTMsMC4yOTcsMi4zMzUsMC44OTIsMy4zNjZzMS4zODUsMi4wMzYsMi4zNjksMy4wMTVzMS45MiwxLjkwNywyLjgwOSwyLjc4NiAgICBjMC44ODcsMC44NzksMS40OTIsMS42NjQsMS44MTQsMi4zNTVjMC4xMTctMC42MDQsMC4xNzYtMS4xMjIsMC4xNzYtMS41NTZjMC0yLjEyNy0wLjgxNi00LjA1NS0yLjQ0Ny01Ljc4MyAgICBDNjgwLjU1OSw3MC45NjUsNjc4LjY4OCw2OS41Nyw2NzYuNTc5LDY4LjUxeiBNNjc2LjY0OSw1NS4xODZjMCwxLjE5NSwwLjIyNywyLjE5NywwLjY4MSwzLjAwNnMxLjI3MSwxLjc2MiwyLjQ1MywyLjg2MSAgICBjMS4xOCwxLjA5OSwyLjA4OCwxLjk4MiwyLjcyNSwyLjY1YzAuNjM1LDAuNjY4LDEuMjg3LDEuNjM1LDEuOTU1LDIuOWMwLjA3LTAuNDYzLDAuMTA1LTAuOTA4LDAuMTA1LTEuMzM2ICAgIGMwLTEuNjY0LTAuNDE2LTMuMTMtMS4yNDgtNC4zOTlzLTEuNzcxLTIuMjk4LTIuODE2LTMuMDg5QzY3OS40NTcsNTYuOTg3LDY3OC4xNzMsNTYuMTIzLDY3Ni42NDksNTUuMTg2eiBNNjc2LjY0OSw2MS44ODMgICAgYzAsMS4yMzYsMC4yNDYsMi4yNjgsMC43MzgsMy4wOTRzMS4zMzMsMS43NjgsMi41MjIsMi44MjZzMi4xMTgsMS45MzUsMi43ODYsMi42MzJzMS4yOCwxLjY0MSwxLjgzNywyLjgzICAgIGMwLjA5NC0wLjQ1MSwwLjE0MS0wLjk0MywwLjE0MS0xLjQ3N2MwLTEuMzgzLTAuMzktMi43LTEuMTY5LTMuOTUxcy0xLjc3Mi0yLjM2Ny0yLjk3OS0zLjM0OVM2NzguMDI2LDYyLjYzOSw2NzYuNjQ5LDYxLjg4M3oiCiAgIGlkPSJwYXRoMzQ2OCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzQ3MCI%CgkJPHBhdGgKICAgZD0iTTcwNC4xMzYsNzUuNTQ5bC00LjQ2OSwwLjAzNWwxOC4wNDEtMTguMDY5bDQuNDk2LTAuMDM1TDcwNC4xMzYsNzUuNTQ5eiBNNzAzLjMxNSw2MS44NDcgICAgYzAtMC41MzIsMC4yMDgtMS4wMDYsMC42MjctMS40MjVjMC40MTctMC40MTcsMC45MTEtMC42MjcsMS40ODEtMC42MjdzMS4wNDUsMC4xOSwxLjQyNSwwLjU3YzAuMzgsMC4zOCwwLjU3LDAuODc1LDAuNTcsMS40ODIgICAgYzAsMC41Ny0wLjE5OSwxLjA1NC0wLjU5OSwxLjQ1M2MtMC4zOTgsMC4zOTktMC44ODQsMC41OTktMS40NTMsMC41OTljLTAuNTcsMC0xLjA1NS0wLjE5OS0xLjQ1NC0wLjU5OSAgICBDNzAzLjUxNSw2Mi45MDEsNzAzLjMxNSw2Mi40MTcsNzAzLjMxNSw2MS44NDd6IE03MTQuMzczLDcxLjMwOWMwLTAuNTcsMC4xODktMS4wNDUsMC41Ny0xLjQyNSAgICBjMC4zNzktMC4zNzksMC44NzMtMC41NywxLjQ4MS0wLjU3YzAuNTcsMCwxLjA0NSwwLjE5LDEuNDI1LDAuNTdjMC4zOCwwLjM4LDAuNTcsMC44NTUsMC41NywxLjQyNWMwLDAuNTctMC4xOSwxLjA0NS0wLjU3LDEuNDI1ICAgIGMtMC4zOCwwLjM4LTAuODc0LDAuNTctMS40ODEsMC41N2MtMC41NywwLTEuMDQ2LTAuMTktMS40MjUtMC41N0M3MTQuNTYzLDcyLjM1NCw3MTQuMzczLDcxLjg3OCw3MTQuMzczLDcxLjMwOXoiCiAgIGlkPSJwYXRoMzQ3MiIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzQ3NCI%CgkJPHBhdGgKICAgZD0iTTcyOS42NDcsNzUuNjg4bC00LjQ2OSwwLjAzOGwxOC4wOTgtMTguMDk4bDQuNDk4LTAuMDY2TDcyOS42NDcsNzUuNjg4eiBNNzI4LjkwMyw2MS44OTRjMC0wLjU3LDAuMTg5LTEuMDQ1LDAuNTctMS40MjUgICAgYzAuMzc5LTAuMzc5LDAuODczLTAuNTcsMS40ODEtMC41N2MwLjU3LDAsMS4wNTUsMC4yLDEuNDU0LDAuNTk5YzAuMzk4LDAuMzk5LDAuNTk4LDAuODgzLDAuNTk4LDEuNDU0ICAgIGMwLDAuNTctMC4xOSwxLjA0NS0wLjU2OSwxLjQyNWMtMC4zODEsMC4zOC0wLjg5NCwwLjU3LTEuNTM5LDAuNTdjLTAuNTcsMC0xLjA0Ni0wLjE4OS0xLjQyNS0wLjU3ICAgIEM3MjkuMDkzLDYyLjk5Niw3MjguOTAzLDYyLjUwMiw3MjguOTAzLDYxLjg5NHogTTczNy4wMiw3NS42NTNsLTQuNDY5LDAuMDM1bDE4LjEyNi0xOC4xMjZsNC40NjktMC4wMzVMNzM3LjAyLDc1LjY1M3ogICAgIE03NDcuNDI5LDcxLjQxM2MwLTAuNTcsMC4xODktMS4wNDUsMC41NjktMS40MjVjMC4zOC0wLjM3OSwwLjg3NC0wLjU3LDEuNDgyLTAuNTdjMC41NjksMCwxLjA0NSwwLjE5LDEuNDI1LDAuNTcgICAgYzAuMzc5LDAuMzgsMC41NywwLjg1NSwwLjU3LDEuNDI1YzAsMC41Ny0wLjE5MSwxLjA0NS0wLjU3LDEuNDI1Yy0wLjM4LDAuMzgtMC44NzUsMC41Ny0xLjQ4MiwwLjU3ICAgIGMtMC41NjksMC0xLjA0NS0wLjE5LTEuNDI1LTAuNTdDNzQ3LjYxOCw3Mi40NTgsNzQ3LjQyOSw3MS45ODIsNzQ3LjQyOSw3MS40MTN6IgogICBpZD0icGF0aDM0NzYiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM0NzgiPgoJCTxwYXRoCiAgIGQ9Ik03NzAuNDcyLDM1LjM5NnYyLjk5M2gtMC43Mjl2LTIuOTkzYy0xLjg5OCwwLTMuNDkzLTAuODE0LTQuNzgxLTIuNDQ1Yy0xLjI5LTEuNjMtMS45MzUtMy40OTItMS45MzUtNS41ODRoLTIuNDgydi0wLjczICAgIGgyLjQ4MmMwLTIuMTYxLDAuNjMyLTQuMSwxLjg5Ny01LjgxN2MxLjI2NS0xLjcxOCwyLjg3MS0yLjU3OCw0LjgxOC0yLjU3OHYtMi40ODJoMC43Mjl2Mi40ODJjMS44OTgsMCwzLjQ1NSwwLjg0Nyw0LjY3MiwyLjU0MSAgICBzMS44MjUsMy42NDYsMS44MjUsNS44NTRoMi44NDh2MC43M2gtMi44NDhjMCwyLjA5My0wLjYwOCwzLjk1NC0xLjgyNSw1LjU4NEM3NzMuOTI3LDM0LjU4Miw3NzIuMzcsMzUuMzk2LDc3MC40NzIsMzUuMzk2eiAgICAgTTc2OS43NDIsMjYuNjM2di03LjM3M2MtMS4yNjcsMC4xNDYtMi4wODEsMC44ODgtMi40NDUsMi4yMjZjLTAuMzY1LDEuMzM5LTAuNTQ4LDMuMDU1LTAuNTQ4LDUuMTQ3SDc2OS43NDJ6IE03NjYuNzQ5LDI3LjM2NiAgICBjMCwyLjYyOCwwLjI1Niw0LjQ1MywwLjc2Nyw1LjQ3NXMxLjI1MiwxLjU4MiwyLjIyNywxLjY3OXYtNy4xNTRINzY2Ljc0OXogTTc3MC40NzIsMjYuNjM2aDIuOTJjMC0yLjIxMi0wLjEyMi0zLjc4NS0wLjM2NC00LjcxOSAgICBjLTAuNDM4LTEuNjY5LTEuMjktMi41NzktMi41NTYtMi43MjdWMjYuNjM2eiBNNzczLjM5MiwyNy4zNjZoLTIuOTJ2Ny4xNTRjMC45NzQtMC4wOTcsMS43MDMtMC42NDUsMi4xOS0xLjY0MyAgICBDNzczLjE0NywzMS44OCw3NzMuMzkyLDMwLjA0Myw3NzMuMzkyLDI3LjM2NnoiCiAgIGlkPSJwYXRoMzQ4MCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzQ4MiI%CgkJPHBhdGgKICAgZD0iTTc5MC41NDQsMjguNWMtMS44MjktMS4xMy0zLjI0OC0yLjIyOS00LjI1Ny0zLjI5N2MtMS4yNjItMS4zMTktMS44OTItMi41Ni0xLjg5Mi0zLjcyMmMwLTEuMTYyLDAuNDI4LTIuMTgyLDEuMjgyLTMuMDYyICAgIGMwLjg1NC0wLjg3OSwxLjk0Ny0xLjMxOSwzLjI3Ny0xLjMxOWMwLjk4MSwwLDEuOTYzLDAuMzI1LDIuOTQ1LDAuOTcyYzAuOTgsMC42NDgsMS40NzIsMS40MTUsMS40NzIsMi4zICAgIGMwLDAuNTY5LTAuMDk0LDEuMDQzLTAuMjgxLDEuNDIyYy0wLjE4OCwwLjM4LTAuNTAyLDAuNTY5LTAuOTQsMC41NjljLTEuMDAzLDAtMS41NTEtMC40Ni0xLjY0NS0xLjM3OSAgICBjMC0wLjE4OSwwLjA4Ni0wLjQ1OSwwLjI1OC0wLjgwOGMwLjE3Mi0wLjM0OCwwLjIxMi0wLjYzNCwwLjExOC0wLjg1NmMtMC4yMjUtMC42OTctMC44NjUtMS4wNDYtMS45MjMtMS4wNDYgICAgYy0wLjY3MywwLTEuMjMzLDAuMjA0LTEuNjgyLDAuNjEzYy0wLjQ0OSwwLjQwOC0wLjY3MywwLjg0OC0wLjY3MywxLjMxOWMwLDEuMzUxLDAuNjQ2LDIuNDgxLDEuOTM4LDMuMzkyICAgIGMwLjI1MSwwLjE4OCwxLjU1OSwwLjg4LDMuOTIxLDIuMDczbDUuNzE5LTguNDMxbDEuNDgtMC4wMDVsLTYuMTExLDkuMDA4YzEuOTYyLDEuMjE5LDMuMzQ4LDIuMjM1LDQuMTU3LDMuMDQ4ICAgIGMxLjE4MywxLjE4OCwxLjc3NCwyLjQ1NSwxLjc3NCwzLjc5OGMwLDEuMTI1LTAuNDM1LDIuMTQyLTEuMzAzLDMuMDQ4Yy0wLjg2OCwwLjkwNy0xLjkzOCwxLjM2LTMuMjA5LDEuMzYgICAgYy0xLjAyMywwLTIuMDIzLTAuMzQxLTMtMS4wMjVjLTAuOTc3LTAuNjgzLTEuNDY1LTEuNTIyLTEuNDY1LTIuNTE3YzAtMC4zNzIsMC4xMzUtMC43OTIsMC40MDYtMS4yNTggICAgYzAuMjctMC40NjYsMC41OC0wLjY5OSwwLjkzMi0wLjY5OWMwLjQ3OCwwLDAuODI3LDAuMTI5LDEuMDUxLDAuMzg2YzAuMjI0LDAuMjU3LDAuMzgzLDAuNjU4LDAuNDc4LDEuMjAyICAgIGMwLjA2MywwLjIyLDAuMDA4LDAuNTEyLTAuMTY0LDAuODczYy0wLjE3MywwLjM2MS0wLjIyOCwwLjY1Mi0wLjE2NCwwLjg3MmMwLjA5MiwwLjMxNCwwLjM1MywwLjU2NiwwLjc4MSwwLjc1NSAgICBjMC40MjksMC4xODgsMC45MTksMC4yODMsMS40NzIsMC4yODNjMC41ODEsMCwxLjA1Ny0wLjIxNywxLjQyNS0wLjY1YzAuMzY3LTAuNDM0LDAuNTUyLTAuODk4LDAuNTUyLTEuMzk0ICAgIGMwLTEuMzkzLTAuODk5LTIuNjMyLTIuNjk4LTMuNzE2Yy0xLjMzNC0wLjY4Mi0yLjMyNy0xLjE3Ni0yLjk3OC0xLjQ4NmwtNS40NDIsOC4xMDZsLTEuNTI0LTAuMDE0TDc5MC41NDQsMjguNXogTTc4Ni41MTEsMjcuOTExICAgIGMwLjM0NCwwLDAuNjQyLDAuMTEsMC44OTMsMC4zMjlzMC4zNzYsMC41MTcsMC4zNzYsMC44OTNjMCwwLjM0NS0wLjEyNSwwLjY0My0wLjM3NiwwLjg5M2MtMC4yNTEsMC4yNTEtMC41NDksMC4zNzYtMC44OTMsMC4zNzYgICAgYy0wLjM0NiwwLTAuNjQzLTAuMTI1LTAuODk0LTAuMzc2Yy0wLjI1MS0wLjI1LTAuMzc2LTAuNTQ4LTAuMzc2LTAuODkzQzc4NS4yNDEsMjguMzE4LDc4NS42NjQsMjcuOTExLDc4Ni41MTEsMjcuOTExeiAgICAgTTc5Ny40MTQsMjMuOTYzYzAuMzQ1LDAsMC42NDMsMC4xMjUsMC44OTQsMC4zNzZjMC4yNSwwLjI1MSwwLjM3NiwwLjU0OSwwLjM3NiwwLjg5M2MwLDAuMzEzLTAuMTI2LDAuNTk2LTAuMzc2LDAuODQ2ICAgIGMtMC4yNTEsMC4yNTEtMC41NDksMC4zNzYtMC44OTQsMC4zNzZzLTAuNjM0LTAuMTE4LTAuODY5LTAuMzUzcy0wLjM1My0wLjUyNC0wLjM1My0wLjg3YzAtMC4zNDQsMC4xMDktMC42NDIsMC4zMjktMC44OTMgICAgQzc5Ni43NCwyNC4wODgsNzk3LjAzOCwyMy45NjMsNzk3LjQxNCwyMy45NjN6IgogICBpZD0icGF0aDM0ODQiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM0ODYiPgoJCTxwYXRoCiAgIGQ9Ik04MDcuMzgsMzAuMTI3YzAuNzg3LDAuMDksMS40NzYsMC40NTcsMi4wNjUsMS4xMDJjMC41OSwwLjY0NSwwLjg4NSwxLjM4NiwwLjg4NSwyLjIyNmMwLDAuOTU5LTAuMzk0LDEuNzE2LTEuMTgsMi4yNzEgICAgYy0wLjc4NywwLjU1NC0xLjc1NSwwLjgzMi0yLjkwNCwwLjgzMmMtMS4xMiwwLTIuMDgxLTAuMjg1LTIuODgyLTAuODU0Yy0wLjgwMi0wLjU2OS0xLjIwMy0xLjM0OC0xLjIwMy0yLjMzNiAgICBjMC0wLjQxOSwwLjA1NC0wLjc3OSwwLjE1OS0xLjA3OGMwLjEwNi0wLjI5OSwwLjI5NS0wLjYxNCwwLjU2Ny0wLjk0M2MwLjI3Mi0wLjMyOSwwLjc3MS0wLjYyOSwxLjQ5Ny0wLjg5OCAgICBjMC4xMjEtMC4wMywwLjI4Ny0wLjA3NSwwLjQ5OS0wLjEzNWMtMC42OTYtMC4xMjItMS4yNzEtMC40ODEtMS43MjQtMS4wNzhjLTAuNDU0LTAuNTk2LTAuNjgxLTEuMjMtMC42ODEtMS45MDMgICAgYzAtMC44ODYsMC4zNzgtMS42MTIsMS4xMzQtMi4xNzhzMS41ODktMC44NDksMi40OTYtMC44NDljMC45NjgsMCwxLjg1MywwLjI5MSwyLjY1NSwwLjg3MWMwLjgwMSwwLjU4MSwxLjIwMiwxLjMxNCwxLjIwMiwyLjIgICAgYzAsMC43MzQtMC4yMjcsMS4zNDUtMC42ODEsMS44MzRjLTAuMjQyLDAuMjQ1LTAuNjIsMC40NzQtMS4xMzUsMC42ODhDODA3Ljk3LDI5Ljk1OSw4MDcuNzEzLDMwLjAzNiw4MDcuMzgsMzAuMTI3eiAgICAgTTgwNS4yOTMsMzAuMzg1Yy0wLjY2NiwwLjIxMi0xLjE4OCwwLjU3NS0xLjU2NiwxLjA4OWMtMC4zNzgsMC41MTUtMC41NjYsMS4xMi0wLjU2NiwxLjgxNWMwLDAuNzI2LDAuMjc5LDEuNDE1LDAuODM5LDIuMDY0ICAgIGMwLjU2LDAuNjUsMS4zMDksMC45NzYsMi4yNDcsMC45NzZjMC45MDcsMCwxLjY2My0wLjM2MywyLjI2OS0xLjA4OWMwLjUxNC0wLjYwNSwwLjc3MS0xLjI0LDAuNzcxLTEuOTA2ICAgIGMwLTAuNTQ0LTAuMjEyLTEuMDEzLTAuNjM2LTEuNDA3Yy0wLjMwMy0wLjI3Mi0wLjY4MS0wLjQ5OS0xLjEzNC0wLjY4MUw4MDUuMjkzLDMwLjM4NXogTTgwNy4xMDcsMjkuOTc3ICAgIGMxLjMwMS0wLjM5MywxLjk1Mi0xLjI3MSwxLjk1Mi0yLjYzMmMwLTAuNjY2LTAuMjU4LTEuMjkzLTAuNzcxLTEuODgzYy0wLjUxNS0wLjU5LTEuMjI2LTAuODg1LTIuMTMzLTAuODg1ICAgIGMtMC44NzgsMC0xLjU1MSwwLjI4OC0yLjAyLDAuODYyYy0wLjQ3LDAuNTc1LTAuNzA0LDEuMTk1LTAuNzA0LDEuODYxYzAsMC4zNjMsMC4xNDQsMC43MjYsMC40MzIsMS4wODkgICAgYzAuMjg3LDAuMzYzLDAuNjg4LDAuNjM1LDEuMjAyLDAuODE3TDgwNy4xMDcsMjkuOTc3eiBNODEwLjkyLDI3LjYxN2wtMC4xMzctMC4wOTdsMC42ODItMC41ODMgICAgYzAuMjQxLTAuMjExLDAuNTE0LTAuMjg3LDAuODE2LTAuMjI3YzAuMjcyLDAuMDMxLDAuNDA4LDAuMjQzLDAuNDA4LDAuNjM2YzAsMC4zNjMtMC4xNTgsMS4wMDYtMC40NzcsMS45MjggICAgYy0wLjMxNywwLjkyMy0wLjQ3NywxLjQ5MS0wLjQ3NywxLjcwMmMwLDAuMzMzLDAuMTM3LDAuNDY5LDAuNDA5LDAuNDA4YzAuNDIzLTAuMDMsMC45NDQtMC40NzcsMS41NjUtMS4zMzkgICAgYzAuNjE5LTAuODYyLDAuOTMtMS41NjUsMC45My0yLjExYzAtMC4xMjEtMC4wNzUtMC4yMjctMC4yMjctMC4zMThjLTAuMTgyLTAuMDkxLTAuMjg4LTAuMTY2LTAuMzE3LTAuMjI3ICAgIGMtMC4xNTItMC4zMDItMC4wNzYtMC40OTksMC4yMjctMC41OWMwLjMwMi0wLjEyMSwwLjUyOSwwLjA5MSwwLjY4MSwwLjYzNWMwLjE4MiwwLjc1Ny0wLjEyOSwxLjY3Mi0wLjkzMSwyLjc0NiAgICBjLTAuODAyLDEuMDc0LTEuNDc1LDEuNjExLTIuMDE5LDEuNjExYy0wLjU3NSwwLTAuODYyLTAuMjQyLTAuODYyLTAuNzI2YzAtMC4xODIsMC4wNDUtMC4zNzgsMC4xMzYtMC41OSAgICBjMC4wOTEtMC4yMTEsMC4yMzQtMC42NTgsMC40MzItMS4zMzhjMC4xOTYtMC42ODEsMC4yOTUtMS4yMDMsMC4yOTUtMS41NjZjMC0wLjE1MS0wLjAxNi0wLjI1Ni0wLjA0Ni0wLjMxNyAgICBjLTAuMDkxLTAuMTgyLTAuMjQyLTAuMTk3LTAuNDU0LTAuMDQ1TDgxMC45MiwyNy42MTd6IE04MTguODYxLDMxLjMzOGwwLjgxNi0wLjY4MWwtMC43MjYsMC44MzkgICAgYy0wLjE4MiwwLjE5Ny0wLjM2MywwLjI5Ni0wLjU0NSwwLjI5NmMtMC4xNTEsMC0wLjIxMi0wLjE1MS0wLjE4Mi0wLjQ1NGwwLjQwOS0xLjY3OWMtMC4wMzEsMC4yMTItMC4yODgsMC41OS0wLjc3MSwxLjEzNSAgICBjLTAuNTc1LDAuNjY2LTEuMDksMC45OTktMS41NDMsMC45OTljLTAuNjY2LDAtMC45OTktMC4zOTMtMC45OTktMS4xOGMwLTAuNzg2LDAuMjg3LTEuNTk1LDAuODYyLTIuNDI4ICAgIGMwLjU3NC0wLjgzMiwxLjIyNi0xLjI0OCwxLjk1MS0xLjI0OGMwLjM5NCwwLDAuNzQxLDAuMTUyLDEuMDQ0LDAuNDU0bDAuMDkxLTAuNDU0aDAuMzE4bC0wLjk1Myw0LjA3OCAgICBjLTAuMDYyLDAuMTg2LTAuMDc2LDAuMzA4LTAuMDQ2LDAuMzY5UzgxOC43MSwzMS40MjksODE4Ljg2MSwzMS4zMzh6IE04MTYuMzIsMzEuMzM4YzAuNTE0LDAsMS4wNzMtMC4zNzEsMS42NzktMS4xMTQgICAgYzAuMTgyLTAuMjQ3LDAuNDM4LTAuNjMzLDAuNzcxLTEuMTU5bDAuMzE3LTEuMzQ2Yy0wLjMzMy0wLjM0LTAuNjY1LTAuNTEtMC45OTgtMC41MWMtMC41NDUsMC0xLjA1MiwwLjQwMy0xLjUyMSwxLjIwNyAgICBjLTAuNDY5LDAuODA0LTAuNzAzLDEuNTQ2LTAuNzAzLDIuMjI3QzgxNS44NjYsMzEuMTA2LDgxNi4wMTgsMzEuMzM4LDgxNi4zMiwzMS4zMzh6IgogICBpZD0icGF0aDM0ODgiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM0OTAiPgoJCTxwYXRoCiAgIGQ9Ik04MzAuNjksMzAuMjkyYzAuNzU2LDAuMDYxLDEuNDMsMC40MTgsMi4wMiwxLjA3MWMwLjU5LDAuNjUzLDAuODg1LDEuNDE5LDAuODg1LDIuM2MwLDAuOTcxLTAuMzk0LDEuNzM5LTEuMTgsMi4zICAgIGMtMC43ODcsMC41NjEtMS43NTUsMC44NDItMi45MDQsMC44NDJjLTEuMTIsMC0yLjA4MS0wLjI4OS0yLjg4Mi0wLjg2NWMtMC44MDItMC41NzctMS4yMDItMS4zNjYtMS4yMDItMi4zNjkgICAgYzAtMC4zMzMsMC4wNi0wLjY4MywwLjE4MS0xLjA0N2MwLjEyMS0wLjM2NSwwLjMxMS0wLjY5MSwwLjU2Ny0wLjk3OXMwLjY1OC0wLjU1NCwxLjIwMy0wLjc5NyAgICBjMC4xODItMC4wNjEsMC40MzgtMC4xNTEsMC43NzEtMC4yNzNjLTAuNjk2LTAuMTIyLTEuMjY0LTAuNDctMS43MDItMS4wNDdzLTAuNjU4LTEuMjE1LTAuNjU4LTEuOTEzICAgIGMwLTAuODUsMC4zNzgtMS41NjMsMS4xMzUtMi4xNDFjMC43NTYtMC41NzcsMS41NzItMC44NjYsMi40NS0wLjg2NmMwLjkzOCwwLDEuODIyLDAuMjg5LDIuNjU1LDAuODY2ICAgIGMwLjgzMiwwLjU3NywxLjI0OCwxLjMwNSwxLjI0OCwyLjE4NmMwLDAuNzI5LTAuMjI4LDEuMzM2LTAuNjgxLDEuODIxYy0wLjI0MywwLjI0My0wLjYyMSwwLjQ3MS0xLjEzNSwwLjY4NCAgICBDODMxLjI4LDMwLjEyNSw4MzEuMDIzLDMwLjIwMiw4MzAuNjksMzAuMjkyeiBNODI4LjUxMiwzMC42MzRjLTAuNjY1LDAuMjEyLTEuMTgsMC41NzUtMS41NDMsMS4wODkgICAgYy0wLjM2MiwwLjUxNS0wLjU0NCwxLjEyLTAuNTQ0LDEuODE1YzAsMC43MjYsMC4yNzksMS40MTUsMC44NCwyLjA2NWMwLjU1OSwwLjY1LDEuMzA4LDAuOTc2LDIuMjQ2LDAuOTc2ICAgIGMwLjkzOCwwLDEuNjkzLTAuMzYzLDIuMjY5LTEuMDg5YzAuNDgzLTAuNjA1LDAuNzI3LTEuMjQsMC43MjctMS45MDZjMC0wLjUxNC0wLjIxMi0wLjk4Mi0wLjYzNi0xLjQwNyAgICBjLTAuMzAzLTAuMzAyLTAuNjY2LTAuNTI5LTEuMDg5LTAuNjgxTDgyOC41MTIsMzAuNjM0eiBNODMwLjMyNywzMC4yMjZjMS4zMDEtMC4zOTYsMS45NTEtMS4yODEsMS45NTEtMi42NTQgICAgYzAtMC42Ny0wLjI1Ny0xLjMwNC0wLjc3MS0xLjg5OGMtMC41MTUtMC41OTUtMS4yMS0wLjg5My0yLjA4Ny0wLjg5M2MtMC44NzgsMC0xLjU1MSwwLjI5OC0yLjAyLDAuODkzICAgIGMtMC40NywwLjU5NS0wLjcwMywxLjE5Ny0wLjcwMywxLjgwN2MwLDAuMzY2LDAuMTM2LDAuNzQsMC40MDgsMS4xMjFzMC42NjUsMC42NjQsMS4xOCwwLjg0N0w4MzAuMzI3LDMwLjIyNnogTTgzNC4yNzUsMjcuNjg4ICAgIGgtMC4xMzZsMC42MzUtMC40NThjMC4yNDItMC4yNzIsMC41MjktMC4zOTMsMC44NjItMC4zNjNjMC4yNDIsMC4wMzEsMC4zNjMsMC4yMzQsMC4zNjMsMC42MDdjMCwwLjM0My0wLjE1MiwwLjk4MS0wLjQ1NCwxLjkxNSAgICBjLTAuMzAzLDAuOTM1LTAuNDU0LDEuNTQyLTAuNDU0LDEuODIxYzAsMC4zNDIsMC4xMzcsMC40OTgsMC40MDksMC40NjdjMC40MjMtMC4wMzEsMC45NDUtMC40OTIsMS41NjUtMS4zODMgICAgYzAuNjE5LTAuODkxLDAuOTMxLTEuNjE4LDAuOTMxLTIuMTgxYzAtMC4xMjUtMC4xMDYtMC4yNS0wLjMxOC0wLjM3NWMtMC4xNTEtMC4wNjMtMC4yMjctMC4xMjUtMC4yMjctMC4xODggICAgYy0wLjE1MS0wLjMwMy0wLjA5MS0wLjUwMSwwLjE4Mi0wLjU5M2MwLjMzMi0wLjEyMSwwLjU3NCwwLjA5MywwLjcyNiwwLjY0MWMwLjE4MiwwLjc2NC0wLjEyOSwxLjY4OC0wLjkzLDIuNzcxICAgIGMtMC44MDMsMS4wODMtMS40NiwxLjYyNS0xLjk3NSwxLjYyNWMtMC42MzUsMC0wLjk1My0wLjI4Mi0wLjk1My0wLjg0NWMwLTAuMDg5LDAuMDMtMC4yMjIsMC4wOTEtMC40MDEgICAgYzAuMTgyLTAuNDc0LDAuMzU1LTEuMDIyLDAuNTIyLTEuNjQ1YzAuMTY2LTAuNjIzLDAuMjQ5LTEuMDUzLDAuMjQ5LTEuMjkxYzAtMC4xNzctMC4wMy0wLjI5Ni0wLjA5MS0wLjM1NiAgICBjLTAuMDYxLTAuMDYxLTAuMTgyLTAuMDQ1LTAuMzYyLDAuMDQ1TDgzNC4yNzUsMjcuNjg4eiBNODQwLjEzLDI0Ljg3MWwtMC43MjctMC4wOTFjMC4yMzksMC4wNjEsMC41MzksMC4wMTEsMC44OTktMC4xNTEgICAgYzAuMTE5LTAuMDMzLDAuMy0wLjE1LDAuNTM5LTAuMzUybC0xLjMxNCw0LjQ0OGMwLjMwNC0wLjQ1MiwwLjY0NS0wLjgxNCwxLjAyNC0xLjA4N2MwLjM4LTAuMjcxLDAuNzY3LTAuNDA4LDEuMTYyLTAuNDA4ICAgIGMwLjM5NCwwLDAuNjgzLDAuMTE1LDAuODY0LDAuMzQ0YzAuMTgzLDAuMjI5LDAuMjc0LDAuNTU4LDAuMjc0LDAuOTg1YzAsMC43OTQtMC4zMDMsMS41NjYtMC45MDgsMi4zMTQgICAgYy0wLjYwNSwwLjc0OS0xLjM3NywxLjEyMy0yLjMxNCwxLjEyM2MtMC4zMDMsMC0wLjU3NC0wLjA4LTAuODE2LTAuMjRjLTAuMjQyLTAuMTYtMC4zMzMtMC4zNjgtMC4yNzItMC42MjNMODQwLjEzLDI0Ljg3MXogICAgIE04MzguOTQ5LDMxLjM1NmMwLjE1MSwwLjIxNCwwLjQyNCwwLjMyMSwwLjgxNywwLjMyMWMwLjc4NiwwLDEuNDY3LTAuNDI4LDIuMDQyLTEuMjg1YzAuNDgzLTAuNzM0LDAuNzI2LTEuNDUzLDAuNzI2LTIuMTU2ICAgIGMwLTAuMzA2LTAuMDc1LTAuNTA0LTAuMjI3LTAuNTk3Yy0wLjE4Mi0wLjA5MS0wLjM2My0wLjEzNy0wLjU0NS0wLjEzN2MtMC4zNjIsMC0wLjc3MSwwLjE3Ni0xLjIyNSwwLjUyNyAgICBjLTAuNDU0LDAuMzUyLTAuODE3LDAuNzcyLTEuMDg5LDEuMjYxTDgzOC45NDksMzEuMzU2eiIKICAgaWQ9InBhdGgzNDkyIiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNDk0Ij4KCQk8cGF0aAogICBkPSJNODQ4Ljk1NiwzNC4zNVYyNy4ydi0wLjcyYy0wLjA5NS0wLjA4OS0wLjMtMC4xMzUtMC42MTUtMC4xMzVjLTAuMjUzLDAtMC40MjcsMC4wMTYtMC41MjEsMC4wNDVsLTAuOTk0LDAuMzE4ICAgIGwtMC4wNDgtMC4yMjdsMy4xNzctMS45MDZ2OS44MDJjMCwwLjM5NCwwLjA2OCwwLjY4OCwwLjIwNCwwLjg4NWMwLjEzNywwLjE5NywwLjMxMSwwLjM0LDAuNTIyLDAuNDMxbDEuNDUyLDAuNDA4djAuMDkxaC01LjMxICAgIGwtMC4wNDYtMC4xOGwxLjQ5OC0wLjQwNGMwLjI0Mi0wLjA5LDAuNDIzLTAuMjQxLDAuNTQ1LTAuNDUxQzg0OC45MTEsMzUuMDA5LDg0OC45NTYsMzQuNzQsODQ4Ljk1NiwzNC4zNXogTTg1My4zNTgsMjcuODg5ICAgIGMwLjYwNCwwLjE1MiwxLjA1OSwwLjI3MiwxLjM2MSwwLjM2M2MwLjk2OCwwLjI3MiwxLjY3OSwwLjUzLDIuMTMzLDAuNzcxYzEuNzU0LDAuODc4LDIuNjMyLDEuOTIxLDIuNjMyLDMuMTMxICAgIGMwLDAuNzI2LTAuMTU5LDEuNDA3LTAuNDc3LDIuMDQycy0wLjcwMywxLjExMi0xLjE1NywxLjQyOWMtMC40NTQsMC4zMTgtMC44NywwLjUzOC0xLjI0OCwwLjY1OCAgICBjLTAuMzc5LDAuMTIxLTAuOTQ2LDAuMTgyLTEuNzAyLDAuMTgyYy0wLjY2NSwwLTEuMjg2LTAuMTM2LTEuODYtMC40MDljLTAuNTc1LTAuMjcyLTAuODYyLTAuNjM1LTAuODYyLTEuMDg5ICAgIGMwLTAuMjQyLDAuMTY2LTAuMzYzLDAuNDk5LTAuMzYzYzAuMTgyLDAsMC40MTYsMC4wNTMsMC43MDQsMC4xNTljMC4yODcsMC4xMDYsMC42MTIsMC4zNTYsMC45NzYsMC43NDkgICAgYzAuMzYzLDAuMzk0LDAuNjk1LDAuNTksMC45OTgsMC41OWMwLjk2OCwwLDEuNzA5LTAuMzkzLDIuMjI0LTEuMThjMC40MjQtMC42MzUsMC42MzYtMS4zMTYsMC42MzYtMi4wNDIgICAgYzAtMC41NzUtMC4xODktMS4wODItMC41NjctMS41MjFjLTAuMzc5LTAuNDM4LTAuNzk0LTAuNzc4LTEuMjQ4LTEuMDIxYy0wLjQ1NC0wLjI0Mi0xLjI1Ni0wLjU0NC0yLjQwNS0wLjkwOCAgICBjLTAuMzYzLTAuMTIxLTAuODc4LTAuMjcyLTEuNTQzLTAuNDU0bDEuNTQzLTQuMjY2aDQuMjY2YzAuMzYzLDAsMC42NS0wLjA0NSwwLjg2Mi0wLjEzNmwwLjQ1NC0wLjM0MmwwLjIyNy0wLjI5M2gwLjA5MSAgICBsLTEuMjcxLDEuOTUxaC00LjQ5M0w4NTMuMzU4LDI3Ljg4OXogTTg2NC41NjYsMzAuMTEyaC0wLjU5bDEuNDUyLTMuNjc2YzAtMC4xODEsMC0wLjMwMiwwLTAuMzYzICAgIGMtMC4wNjEtMC4yNzItMC4yMTItMC40MjMtMC40NTMtMC40NTRjLTAuMjQzLTAuMDMtMC41MTUsMC4xMzYtMC44MTcsMC41Yy0wLjAzLDAuMDYxLTAuMDkxLDAuMTY3LTAuMTgyLDAuMzE3bC0xLjQ1MiwzLjY3NiAgICBoLTAuNjgxbDEuNTQzLTMuNzk3Yy0wLjAzLTAuMTU1LTAuMDQ1LTAuMjYzLTAuMDQ1LTAuMzI0Yy0wLjA2Mi0wLjIxNi0wLjE4Mi0wLjM0LTAuMzYzLTAuMzcxICAgIGMtMC40NTQtMC4wNi0wLjk4MywwLjM0My0xLjU4OCwxLjIxYy0wLjA5MSwwLjEyNC0wLjIxMywwLjM0MS0wLjM2MywwLjY1MWgtMC4xODJjMC4zMDItMC40NzQsMC41NDUtMC44MywwLjcyNi0xLjA2NiAgICBjMC41NzUtMC43MSwxLjExOS0xLjA2NiwxLjYzNC0xLjA2NmMwLjE4MiwwLjAyOCwwLjM0OCwwLjE0MiwwLjUsMC4zNGMwLjAyOSwwLjA1NywwLjA5LDAuMTcsMC4xODEsMC4zNCAgICBjMC4wOTEtMC4xNywwLjE2Ni0wLjI4NCwwLjIyOC0wLjM0YzAuMjQxLTAuMjI3LDAuNjA0LTAuMzQsMS4wODktMC4zNGMwLjE4MiwwLDAuMzMzLDAuMTE0LDAuNDU0LDAuMzQyICAgIGMwLjAyOSwwLjA1NywwLjA3NSwwLjE4NSwwLjEzNiwwLjM4NGMwLjE4Mi0wLjIxMSwwLjMxNy0wLjM0OCwwLjQwOC0wLjQwOWMwLjM2My0wLjI3MiwwLjc0MS0wLjM3OCwxLjEzNS0wLjMxNyAgICBjMC4zMDIsMC4wNjEsMC40OTksMC4yNDIsMC41OSwwLjU0NGMwLjAzLDAuMDkxLDAuMDYxLDAuMjU3LDAuMDkxLDAuNDk5bC0xLjIyNiwzLjA0MWMtMC4wMywwLjE1Mi0wLjA0NSwwLjI1Ny0wLjA0NSwwLjMxOCAgICBjMCwwLjA5MSwwLjA2MSwwLjEzNiwwLjE4MiwwLjEzNmMwLjE4MiwwLDAuMzkzLTAuMTc0LDAuNjM1LTAuNTIyYzAuMDYxLTAuMTE2LDAuMTY2LTAuMjksMC4zMTgtMC41MjJsMC4xMzYsMC4wNDQgICAgYy0wLjE1MSwwLjI5My0wLjI3MiwwLjQ5OC0wLjM2MywwLjYxNGMtMC4zMDMsMC40MzktMC41NiwwLjY1OC0wLjc3MSwwLjY1OGMtMC41MTUsMC0wLjcxMS0wLjIwNy0wLjU5LTAuNjIzbDEuMjI2LTMuMDY4ICAgIGMwLTAuMTc3LDAtMC4yOTYsMC0wLjM1NWMtMC4wNjItMC4yMzctMC4yMjctMC4zNTYtMC40OTktMC4zNTZzLTAuNTE1LDAuMTA2LTAuNzI3LDAuMzE4Yy0wLjA2MSwwLjA2MS0wLjE1MSwwLjE4Mi0wLjI3MiwwLjM2MyAgICBMODY0LjU2NiwzMC4xMTJ6IE04NzIuMDU1LDI5Ljc1bDAuNzcxLTAuNjM1bC0wLjcyNywwLjczOGMtMC4xODIsMC4xNzQtMC4zNjIsMC4yNi0wLjU0NCwwLjI2Yy0wLjE1MiwwLTAuMjEyLTAuMTIxLTAuMTgyLTAuMzYzICAgIGwwLjQwOC0xLjU4OGMtMC4wNjEsMC4zMTgtMC40MzgsMC43ODEtMS4xMzUsMS4zODljLTAuNDUzLDAuNDA1LTAuODQ3LDAuNjA3LTEuMTgsMC42MDdjLTAuNjY2LDAtMC45OTgtMC4zODItMC45OTgtMS4xNDYgICAgYzAtMC43OTMsMC4yODctMS41OCwwLjg2Mi0yLjM1OWMwLjU3NC0wLjc3OSwxLjIyNS0xLjE2OCwxLjk1MS0xLjE2OGMwLjI0MSwwLDAuNDgzLDAuMDU0LDAuNzI2LDAuMTYyICAgIGMwLjA2MSwwLjAyNywwLjE2NiwwLjA5MywwLjMxOCwwLjIwMWwwLjA5MS0wLjM2M2gwLjMxN2wtMC45NTMsMy45NTJjLTAuMDYxLDAuMTgtMC4wNzYsMC4zLTAuMDQ1LDAuMzU5ICAgIEM4NzEuNzY3LDI5Ljg1Niw4NzEuODczLDI5Ljg0LDg3Mi4wNTUsMjkuNzV6IE04NjkuNDIzLDI5Ljc1YzAuNTE0LDAsMS4wODktMC4zNTksMS43MjQtMS4wNzcgICAgYzAuMjEyLTAuMjM5LDAuNDY5LTAuNjEzLDAuNzcxLTEuMTIybDAuMjcyLTEuMzQ2Yy0wLjMwMy0wLjI5OS0wLjYzNS0wLjQ0OS0wLjk5OC0wLjQ0OWMtMC41NDUsMC0xLjA1MiwwLjM4OS0xLjUyMSwxLjE2NyAgICBjLTAuNDY5LDAuNzc4LTAuNzAzLDEuNDk1LTAuNzAzLDIuMTUzQzg2OC45NjksMjkuNTI1LDg2OS4xMiwyOS43NSw4NjkuNDIzLDI5Ljc1eiIKICAgaWQ9InBhdGgzNDk2IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNDk4Ij4KCQk8cGF0aAogICBkPSJNIDg5OSAyMi41IEMgODk4Ljc2MSAyMi43MDIgODk4LjU4Nzc1IDIyLjgwOTc1IDg5OC40Njg3NSAyMi44NDM3NSBDIDg5OC4xMDk3NSAyMy4wMDU3NSA4OTcuODAxNSAyMy4wNjEgODk3LjU2MjUgMjMgTCA4OTguMjgxMjUgMjMuMDkzNzUgTCA4OTYuNjg3NSAyOS4zNDM3NSBDIDg5Ni42MjU1IDI5LjU5OTc1IDg5Ni43MjY3NSAyOS44MDk3NSA4OTYuOTY4NzUgMjkuOTY4NzUgQyA4OTcuMjEwNzUgMzAuMTI5NzUgODk3LjQ3NzI1IDMwLjIxODc1IDg5Ny43ODEyNSAzMC4yMTg3NSBDIDg5OC43MTgyNSAzMC4yMTg3NSA4OTkuNDg5NzUgMjkuODQyNzUgOTAwLjA5Mzc1IDI5LjA5Mzc1IEMgOTAwLjY5ODc1IDI4LjM0NTc1IDkwMSAyNy41NzYyNSA5MDEgMjYuNzgxMjUgQyA5MDEgMjYuMzU1MjUgOTAwLjkwMTc1IDI2LjAxMDI1IDkwMC43MTg3NSAyNS43ODEyNSBDIDkwMC41MzY3NSAyNS41NTEyNSA5MDAuMjY5IDI1LjQzNzUgODk5Ljg3NSAyNS40Mzc1IEMgODk5LjQ4MSAyNS40Mzc1IDg5OS4wOTc3NSAyNS41NzI3NSA4OTguNzE4NzUgMjUuODQzNzUgQyA4OTguMzM4NzUgMjYuMTE1NzUgODk3Ljk5MjUgMjYuNDg0NSA4OTcuNjg3NSAyNi45Mzc1IEwgODk5IDIyLjUgeiBNIDg4OCAyMy45Mzc1IEwgODg3Ljc4MTI1IDI0LjIxODc1IEwgODg3LjM0Mzc1IDI0LjU2MjUgQyA4ODcuMTMxNzUgMjQuNjUyNSA4ODYuODMxNzUgMjQuNzE4NzUgODg2LjQ2ODc1IDI0LjcxODc1IEwgODgyLjIxODc1IDI0LjcxODc1IEwgODgwLjY1NjI1IDI4Ljk2ODc1IEMgODgxLjMyMTI1IDI5LjE0OTc1IDg4MS44NTU3NSAyOS4zMTY1IDg4Mi4yMTg3NSAyOS40Mzc1IEMgODgzLjM2Nzc1IDI5LjgwMDUgODg0LjEzOTc1IDMwLjEwMTc1IDg4NC41OTM3NSAzMC4zNDM3NSBDIDg4NS4wNDc3NSAzMC41ODU3NSA4ODUuNDY1NzUgMzAuOTA1NzUgODg1Ljg0Mzc1IDMxLjM0Mzc1IEMgODg2LjIyMjc1IDMxLjc4Mjc1IDg4Ni40Mzc1IDMyLjMwMSA4ODYuNDM3NSAzMi44NzUgQyA4ODYuNDM3NSAzMy42MDEgODg2LjIwNjI1IDM0LjMwMjUgODg1Ljc4MTI1IDM0LjkzNzUgQyA4ODUuMjY2MjUgMzUuNzI0NSA4ODQuNTMwNSAzNi4wOTM3NSA4ODMuNTYyNSAzNi4wOTM3NSBDIDg4My4yNTk1IDM2LjA5Mzc1IDg4Mi45MjU1IDM1Ljg5NCA4ODIuNTYyNSAzNS41IEMgODgyLjE5OTUgMzUuMTA3IDg4MS44Nzk3NSAzNC44NTYgODgxLjU5Mzc1IDM0Ljc1IEMgODgxLjMwNDc1IDM0LjY0NCA4ODEuMDU3IDM0LjU5Mzc1IDg4MC44NzUgMzQuNTkzNzUgQyA4ODAuNTQyIDM0LjU5Mzc1IDg4MC4zNzUgMzQuNzI3NzUgODgwLjM3NSAzNC45Njg3NSBDIDg4MC4zNzUgMzUuNDIyNzUgODgwLjY3NiAzNS43OTA1IDg4MS4yNSAzNi4wNjI1IEMgODgxLjgyNSAzNi4zMzU1IDg4Mi40Mjc3NSAzNi40Njg3NSA4ODMuMDkzNzUgMzYuNDY4NzUgQyA4ODMuODQ5NzUgMzYuNDY4NzUgODg0LjQzMzUgMzYuNDAyMjUgODg0LjgxMjUgMzYuMjgxMjUgQyA4ODUuMTg5NSAzNi4xNjEyNSA4ODUuNjA4NSAzNS45NDMgODg2LjA2MjUgMzUuNjI1IEMgODg2LjUxNTUgMzUuMzA3IDg4Ni45MDA3NSAzNC44MjM1IDg4Ny4yMTg3NSAzNC4xODc1IEMgODg3LjUzNjc1IDMzLjU1MjUgODg3LjY4NzUgMzIuODgzMjUgODg3LjY4NzUgMzIuMTU2MjUgQyA4ODcuNjg3NSAzMC45NDYyNSA4ODYuODE3NSAyOS45MDkyNSA4ODUuMDYyNSAyOS4wMzEyNSBDIDg4NC42MDg1IDI4Ljc5MDI1IDg4My45MDU1IDI4LjUyMiA4ODIuOTM3NSAyOC4yNSBDIDg4Mi42MzY1IDI4LjE1OSA4ODIuMTY3NSAyOC4wMjcgODgxLjU2MjUgMjcuODc1IEwgODgyLjM0Mzc1IDI1LjkwNjI1IEwgODg2Ljg0Mzc1IDI1LjkwNjI1IEwgODg4LjA5Mzc1IDIzLjkzNzUgTCA4ODggMjMuOTM3NSB6IE0gODc4LjE1NjI1IDI0LjU2MjUgTCA4NzUgMjYuNDY4NzUgTCA4NzUuMDMxMjUgMjYuNzE4NzUgTCA4NzYuMDMxMjUgMjYuNDA2MjUgQyA4NzYuMTI1MjUgMjYuMzc2MjUgODc2LjMwOTUgMjYuMzQzNzUgODc2LjU2MjUgMjYuMzQzNzUgQyA4NzYuODc2NSAyNi4zNDM3NSA4NzcuMDYwMjUgMjYuMzc5NzUgODc3LjE1NjI1IDI2LjQ2ODc1IEwgODc3LjE1NjI1IDI3LjE4NzUgTCA4NzcuMTU2MjUgMzQuMzQzNzUgQyA4NzcuMTU2MjUgMzQuNzMzNzUgODc3LjEyMjI1IDM1LjAwODI1IDg3Ny4wMzEyNSAzNS4xNTYyNSBDIDg3Ni45MTAyNSAzNS4zNjYyNSA4NzYuNzEwNzUgMzUuNTAzNzUgODc2LjQ2ODc1IDM1LjU5Mzc1IEwgODc1IDM2IEwgODc1LjAzMTI1IDM2LjE4NzUgTCA4ODAuMzQzNzUgMzYuMTg3NSBMIDg4MC4zNDM3NSAzNi4wOTM3NSBMIDg3OC44NzUgMzUuNjg3NSBDIDg3OC42NjMgMzUuNTk2NSA4NzguNTEgMzUuNDQ3IDg3OC4zNzUgMzUuMjUgQyA4NzguMjM4IDM1LjA1NCA4NzguMTU2MjUgMzQuNzY5IDg3OC4xNTYyNSAzNC4zNzUgTCA4NzguMTU2MjUgMjQuNTYyNSB6IE0gODkxLjQwNjI1IDI1LjM0Mzc1IEMgODkwLjg5MjI1IDI1LjM0Mzc1IDg5MC4zNTUyNSAyNS42OTUyNSA4ODkuNzgxMjUgMjYuNDA2MjUgQyA4ODkuNTk5MjUgMjYuNjQzMjUgODg5LjM2NDUgMjYuOTk1NzUgODg5LjA2MjUgMjcuNDY4NzUgTCA4ODkuMjUgMjcuNDY4NzUgQyA4ODkuNCAyNy4xNTk3NSA4ODkuNTAyNzUgMjYuOTY3NzUgODg5LjU5Mzc1IDI2Ljg0Mzc1IEMgODkwLjE5OTc1IDI1Ljk3Nzc1IDg5MC43MzM1IDI1LjU2NCA4OTEuMTg3NSAyNS42MjUgQyA4OTEuMzY3NSAyNS42NTcgODkxLjUwMTUgMjUuNzg0IDg5MS41NjI1IDI2IEMgODkxLjU2MjUgMjYuMDYxIDg5MS41NjI3NSAyNi4xNTc1IDg5MS41OTM3NSAyNi4zMTI1IEwgODkwLjA2MjUgMzAuMTI1IEwgODkwLjcxODc1IDMwLjEyNSBMIDg5Mi4xODc1IDI2LjQzNzUgQyA4OTIuMjc5NSAyNi4yODY1IDg5Mi4zNDUgMjYuMTg2IDg5Mi4zNzUgMjYuMTI1IEMgODkyLjY3NiAyNS43NjIgODkyLjk0NTUgMjUuNTk1IDg5My4xODc1IDI1LjYyNSBDIDg5My40Mjk1IDI1LjY1NSA4OTMuNTY0IDI1Ljc5MTUgODkzLjYyNSAyNi4wNjI1IEwgODkzLjYyNSAyNi40Mzc1IEwgODkyLjE4NzUgMzAuMTI1IEwgODkyLjc4MTI1IDMwLjEyNSBMIDg5NC4yMTg3NSAyNi40Mzc1IEMgODk0LjMzODc1IDI2LjI1NTUgODk0LjQzOSAyNi4xMjM1IDg5NC41IDI2LjA2MjUgQyA4OTQuNzExIDI1Ljg1MjUgODk0Ljk0Nzc1IDI1Ljc1IDg5NS4yMTg3NSAyNS43NSBDIDg5NS40OTA3NSAyNS43NSA4OTUuNjU2NzUgMjUuODg4IDg5NS43MTg3NSAyNi4xMjUgTCA4OTUuNzE4NzUgMjYuNDY4NzUgTCA4OTQuNSAyOS41MzEyNSBDIDg5NC4zNzggMjkuOTQ2MjUgODk0LjU3Nzc1IDMwLjE1NjI1IDg5NS4wOTM3NSAzMC4xNTYyNSBDIDg5NS4zMDU3NSAzMC4xNTYyNSA4OTUuNTczIDI5LjkzOSA4OTUuODc1IDI5LjUgQyA4OTUuOTY3IDI5LjM4NCA4OTYuMDY4NzUgMjkuMTY4IDg5Ni4yMTg3NSAyOC44NzUgTCA4OTYuMDkzNzUgMjguODQzNzUgQyA4OTUuOTQyNzUgMjkuMDc1NzUgODk1Ljg0MjI1IDI5LjI1OSA4OTUuNzgxMjUgMjkuMzc1IEMgODk1LjUzODI1IDI5LjcyNCA4OTUuMzA4IDI5Ljg3NSA4OTUuMTI1IDI5Ljg3NSBDIDg5NS4wMDQgMjkuODc1IDg5NC45Njg3NSAyOS44NDEgODk0Ljk2ODc1IDI5Ljc1IEMgODk0Ljk2ODc1IDI5LjY5IDg5NC45NzEgMjkuNTg4NSA4OTUgMjkuNDM3NSBMIDg5Ni4yMTg3NSAyNi40MDYyNSBDIDg5Ni4xODg3NSAyNi4xNjMyNSA4OTYuMTU1IDI1Ljk5NzI1IDg5Ni4xMjUgMjUuOTA2MjUgQyA4OTYuMDM0IDI1LjYwNTI1IDg5NS44MzMyNSAyNS40MDQ3NSA4OTUuNTMxMjUgMjUuMzQzNzUgQyA4OTUuMTM4MjUgMjUuMjgyNzUgODk0Ljc2OTI1IDI1LjM4NDI1IDg5NC40MDYyNSAyNS42NTYyNSBDIDg5NC4zMTUyNSAyNS43MTcyNSA4OTQuMTgyIDI1Ljg1MjUgODk0IDI2LjA2MjUgQyA4OTMuOTM4IDI1Ljg2MzUgODkzLjkwNSAyNS43NDM1IDg5My44NzUgMjUuNjg3NSBDIDg5My43NTQgMjUuNDU5NSA4OTMuNTg4MjUgMjUuMzQzNzUgODkzLjQwNjI1IDI1LjM0Mzc1IEMgODkyLjkyMjI1IDI1LjM0Mzc1IDg5Mi41NTQ1IDI1LjQ2MDUgODkyLjMxMjUgMjUuNjg3NSBDIDg5Mi4yNTE1IDI1Ljc0MzUgODkyLjE4Mzc1IDI1Ljg2MTI1IDg5Mi4wOTM3NSAyNi4wMzEyNSBDIDg5Mi4wMDI3NSAyNS44NjEyNSA4OTEuOTM2MjUgMjUuNzQ0NSA4OTEuOTA2MjUgMjUuNjg3NSBDIDg5MS43NTQyNSAyNS40ODk1IDg5MS41ODkyNSAyNS4zNzE3NSA4OTEuNDA2MjUgMjUuMzQzNzUgeiBNIDg5OS45MDYyNSAyNS43MTg3NSBDIDkwMC4wODcyNSAyNS43MTg3NSA5MDAuMjg3NzUgMjUuNzUxNzUgOTAwLjQ2ODc1IDI1Ljg0Mzc1IEMgOTAwLjYyMTc1IDI1LjkzNTc1IDkwMC42ODc1IDI2LjEzMTUgOTAwLjY4NzUgMjYuNDM3NSBDIDkwMC42ODc1IDI3LjE0MDUgOTAwLjQ1MDc1IDI3Ljg1OTc1IDg5OS45Njg3NSAyOC41OTM3NSBDIDg5OS4zOTM3NSAyOS40NTA3NSA4OTguNzIzNSAyOS44NzUgODk3LjkzNzUgMjkuODc1IEMgODk3LjU0NDUgMjkuODc1IDg5Ny4yNDQ3NSAyOS43NzY1IDg5Ny4wOTM3NSAyOS41NjI1IEwgODk3LjU5Mzc1IDI3LjUgQyA4OTcuODY2NzUgMjcuMDEgODk4LjIzMjUgMjYuNjAyIDg5OC42ODc1IDI2LjI1IEMgODk5LjE0MjUgMjUuODk4IDg5OS41NDMyNSAyNS43MTg3NSA4OTkuOTA2MjUgMjUuNzE4NzUgeiAiCiAgIGlkPSJwYXRoMzUwMCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzUwMiI%CgkJCgk8L2c%Cgk8ZwogICBpZD0iZzM1MDYiPgoJCTxwYXRoCiAgIGQ9Ik05MDUuNjA0LDM0Ljk0OWwtMS4xMDUsMC4wMTVsNi42MDYtNy4xMzVsNi41NjQsNy4xMzZsLTAuNjY2LTAuMDEzbC01LjYyOS02LjExOEw5MDUuNjA0LDM0Ljk0OXogTTkxMS42MjYsMzIuODgyICAgIGMwLjI5MywwLDAuNTQsMC4xLDAuNzQsMC4zczAuMywwLjQ0NiwwLjMsMC43NGMwLDAuMjkzLTAuMSwwLjU0MS0wLjMsMC43NDFzLTAuNDQ3LDAuMy0wLjc0LDAuM2MtMC4yOTQsMC0wLjU0MS0wLjEtMC43NDEtMC4zICAgIHMtMC4zLTAuNDQ3LTAuMy0wLjc0MWMwLTAuMjk0LDAuMS0wLjU0LDAuMy0wLjc0UzkxMS4zMzIsMzIuODgyLDkxMS42MjYsMzIuODgyeiIKICAgaWQ9InBhdGgzNTA4IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNTEwIj4KCQk8cGF0aAogICBkPSJNOTMwLjIxMywyNy4zYy0yLjE2NywwLTQuMDUzLDAuNjk5LTUuNjU4LDIuMDk2Yy0xLjYwNCwxLjM5Ny0yLjU1NSwzLjE3LTIuODQ5LDUuMzE5Yy0wLjAyNi0wLjE2MS0wLjA0LTAuMzIxLTAuMDQtMC40ODIgICAgYzAtMC4yMTUsMC0wLjM2MiwwLTAuNDQzYzAtMi4yODEsMC44NDEtNC4yNzksMi41MjItNS45OTZjMS42ODEtMS43MTcsMy42ODMtMi41NzYsNi4wMDQtMi41NzZjMi4yOTUsMCw0LjI5LDAuODQ5LDUuOTg1LDIuNTQ1ICAgIGMxLjY5NCwxLjY5NiwyLjU0MiwzLjcwNywyLjU0Miw2LjAzYzAsMC40MDEsMCwwLjcwOCwwLDAuOTIyYy0wLjI2OS0yLjE2NC0xLjE5OC0zLjk0MS0yLjc4OS01LjMzMSAgICBDOTM0LjMzOSwyNy45OTUsOTMyLjQzNCwyNy4zLDkzMC4yMTMsMjcuM3ogTTkzMC4xOTIsMzIuNjc0YzAuMjk0LDAsMC41NDEsMC4xLDAuNzQxLDAuM3MwLjMsMC40NDcsMC4zLDAuNzQxICAgIGMwLDAuMjk0LTAuMDk0LDAuNTM0LTAuMjgsMC43MjFjLTAuMTg3LDAuMTg3LTAuNDQsMC4yOC0wLjc2MSwwLjI4Yy0wLjI2NywwLTAuNTA3LTAuMDkzLTAuNzIxLTAuMjggICAgYy0wLjIxNC0wLjE4Ny0wLjMyLTAuNDI3LTAuMzItMC43MjFjMC0wLjI5MywwLjEwMS0wLjU0MSwwLjMwMS0wLjc0MVM5MjkuODk4LDMyLjY3NCw5MzAuMTkyLDMyLjY3NHoiCiAgIGlkPSJwYXRoMzUxMiIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzUxNCI%CgkJPHBhdGgKICAgZD0iTTk0Mi41NTMsMzQuNTIyaC0wLjY4MXYtNy4wNDVoMTMuMTd2Ny4wNDVoLTAuNjgxdi01LjAwNGgtMTEuODA5VjM0LjUyMnogTTk0OC40NzgsMzIuNDQxYzAuMjkzLDAsMC41NCwwLjEsMC43NCwwLjMgICAgczAuMywwLjQ0NiwwLjMsMC43NGMwLDAuMjkzLTAuMSwwLjU0MS0wLjMsMC43NDFzLTAuNDQ3LDAuMy0wLjc0LDAuM2MtMC4yOTQsMC0wLjU0MS0wLjEtMC43NDEtMC4zcy0wLjMtMC40NDctMC4zLTAuNzQxICAgIGMwLTAuMjk0LDAuMS0wLjU0LDAuMy0wLjc0Uzk0OC4xODQsMzIuNDQxLDk0OC40NzgsMzIuNDQxeiIKICAgaWQ9InBhdGgzNTE2IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNTE4Ij4KCQk8cGF0aAogICBkPSJNOTYyLjk3NCwzMC45NDNsLTEuNDYzLDQuMTU3bDAuOTI4LTAuMDA0djAuNTA1aC0zLjY0NnYtMC41MDVoMC45MzhsMy4xMDQtNy45NzZjMC4wNzItMC4wOTYsMC4xMDgtMC4xNjgsMC4xMDgtMC4yMTYgICAgYzAuMDcyLTAuMTkyLDAuMDcyLTAuMzM3LDAtMC40MzNjLTAuMTQ1LTAuMTQ1LTAuMjc3LTAuMjE3LTAuMzk3LTAuMjE3Yy0wLjM4NSwwLTAuODMsMC40ODItMS4zMzUsMS40NDQgICAgYy0wLjE0NSwwLjMxMy0wLjM0OSwwLjc5NC0wLjYxMywxLjQ0NGgtMC4yNTNjMC4yNjUtMC43MjIsMC40ODEtMS4yNTEsMC42NDktMS41ODhjMC41NzgtMS4wODMsMS4xNjctMS42MjQsMS43NjktMS42MjQgICAgYzAuMTkyLDAsMC4zMzcsMC4wMjQsMC40MzQsMC4wNzJjMC4xMiwwLjA0OCwwLjIxNiwwLjE4MSwwLjI4OCwwLjM5N2MwLjAyNCwwLjA3MiwwLjA0OCwwLjE5MywwLjA3MiwwLjM2MSAgICBjMC4xNjgtMC4yNjQsMC40Ny0wLjUyOSwwLjkwMi0wLjc5NGMwLjQzNC0wLjI2NCwwLjg5LTAuMzk3LDEuMzcxLTAuMzk3YzAuMTkyLDAsMC40NTEsMC4wNTQsMC43NzYsMC4xNjIgICAgYzAuMzI1LDAuMTA3LDAuNTk2LDAuMzcxLDAuODEzLDAuNzg5YzAuMjE2LDAuNDE5LDAuMzI0LDAuODkyLDAuMzI0LDEuNDE4YzAsMC4zNTktMC4wMjQsMC42NDYtMC4wNzIsMC44NjEgICAgYy0wLjA0OCwwLjIxNi0wLjEzMiwwLjUwMy0wLjI1MywwLjg2MmMtMC4yNjUsMC42NDYtMC43MTEsMS4yMzgtMS4zMzcsMS43NzdzLTEuMTkyLDAuODA4LTEuNjk4LDAuODA4ICAgIEM5NjMuNzgsMzIuMjQ0LDk2My4zMTEsMzEuODExLDk2Mi45NzQsMzAuOTQzeiBNOTY2LjA0NywyNi4yNTNjLTAuMzM3LTAuMTQ0LTAuNzM0LDAuMDUtMS4xOSwwLjU4MiAgICBjLTAuMzYxLDAuNDM3LTAuNjc0LDAuOTIxLTAuOTM4LDEuNDU1Yy0wLjI2NiwwLjUzMy0wLjM5NywxLjEzOS0wLjM5NywxLjgxOGMwLDAuNDg1LDAuMDk2LDAuNzg5LDAuMjg5LDAuOTA5ICAgIGMwLjI2NSwwLjE0NSwwLjYyNSwwLjAwNSwxLjA4My0wLjQxOWMwLjQ1Ni0wLjQyMywwLjgxNy0wLjkyNywxLjA4Mi0xLjUwOGMwLjA5Ni0wLjI0MywwLjE5Mi0wLjU2MywwLjI4OS0wLjk2NCAgICBjMC4wOTYtMC40LDAuMTQ1LTAuNzQ2LDAuMTQ1LTEuMDM3Qzk2Ni40MDgsMjYuNjI5LDk2Ni4yODcsMjYuMzUsOTY2LjA0NywyNi4yNTN6IgogICBpZD0icGF0aDM1MjAiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM1MjIiPgoJCTxwYXRoCiAgIGQ9Ik05NzcuNTEyLDI2LjU2NnYwLjM5N2gtMS45NDlsLTAuMTgxLDAuOTAyYy0wLjQ4MSwxLjk0OS0wLjk3NCwzLjQ0MS0xLjQ3OSw0LjQ3NmMtMC42NzQsMS40MTktMS41NCwyLjQ1NC0yLjU5OSwzLjEwNCAgICBjLTAuMzM3LDAuMjE3LTAuNzcsMC4zMjUtMS4yOTksMC4zMjVjLTAuNzcxLDAtMS4yNzUtMC4yMTYtMS41MTYtMC42NDljLTAuMTQ1LTAuMjY1LTAuMjE3LTAuNTE4LTAuMjE3LTAuNzU4ICAgIGMwLTAuMzg1LDAuMTM4LTAuNzEsMC40MTUtMC45NzVjMC4yNzYtMC4yNjUsMC41NzEtMC4zNzMsMC44ODQtMC4zMjVjMC41NTQsMC4wOTYsMC44MywwLjM2MSwwLjgzLDAuNzk0ICAgIGMwLDAuMTY4LTAuMDM2LDAuMzI1LTAuMTA3LDAuNDY5Yy0wLjA5NywwLjMzNi0wLjMyNSwwLjU1My0wLjY4NywwLjY0OWMtMC4xMiwwLjAyNC0wLjE2OCwwLjA3Mi0wLjE0NCwwLjE0NSAgICBjMC4wNDgsMC4xOTIsMC4yMjgsMC4yODksMC41NDEsMC4yODljMC4xNjgtMC4wMjQsMC4zNi0wLjE0NCwwLjU3Ny0wLjM2MWMwLjA3Mi0wLjA3MiwwLjIyOS0wLjI2NSwwLjQ3LTAuNTc4ICAgIGMwLjUyOC0wLjc5NCwxLjAyMi0yLjA1NywxLjQ3OS0zLjc4OWMwLjE5Mi0wLjc3LDAuMzg1LTEuNTQsMC41NzctMi4zMWwwLjMyNS0xLjQwN2gtMS4zNzJ2LTAuMzk3aDEuNDQ0ICAgIGMtMC4xNDUtMC41NTMsMC4yMTYtMS4zOTYsMS4wODItMi41MjZjMC42NS0wLjg0MiwxLjQ0NC0xLjM5NiwyLjM4Mi0xLjY2YzAuMjg5LTAuMDcyLDAuNTc4LTAuMTA4LDAuODY2LTAuMTA4ICAgIGMwLjYwMiwwLDEuMDk1LDAuMTU3LDEuNDgsMC40NjljMC4zODQsMC4zMTMsMC41NzcsMC43MjIsMC41NzcsMS4yMjdjMCwwLjQ4MS0wLjE0NSwwLjgxMi0wLjQzNCwwLjk5MiAgICBjLTAuMjg4LDAuMTgxLTAuNTY1LDAuMjExLTAuODMsMC4wOWMtMC4zMTMtMC4xNDQtMC40NjktMC4zODQtMC40NjktMC43MjJjMC0wLjI4OSwwLjEwOC0wLjUyOSwwLjMyNS0wLjcyMiAgICBjMC4wNzItMC4wNzIsMC4yMjgtMC4xMiwwLjQ2OS0wLjE0NWMwLjI0LTAuMDIzLDAuMzczLTAuMDg0LDAuMzk3LTAuMThjMC4wNzEtMC4yODktMC4xNjktMC40MzMtMC43MjMtMC40MzMgICAgYy0wLjMzNywwLTAuNjQ5LDAuMDYtMC45MzgsMC4xOGMtMC43NzEsMC4zMzctMS4zMjQsMS4wMjMtMS42NiwyLjA1N2MtMC4wOTcsMC4zMzctMC4yMDUsMC44My0wLjMyNSwxLjQ4SDk3Ny41MTJ6IgogICBpZD0icGF0aDM1MjQiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM1MjYiPgoJCTxwYXRoCiAgIGQ9Ik05ODUuNTM3LDMyLjI2MWwtMS42NTMsMC4wMTlsMi4wMTQtNS4wMjFjMC4wNy0wLjEyLDAuMTE4LTAuMjE3LDAuMTQyLTAuMjg5YzAuMTIxLTAuMjY1LDAuMTgtMC40NTgsMC4xOC0wLjU3OCAgICBjMC0wLjIxNy0wLjA4NC0wLjMzNy0wLjI1Mi0wLjM2MmMtMC4zMTMtMC4wNzItMC42MjUsMC4wOTctMC45MzcsMC41MDZjLTAuMDk2LDAuMTIxLTAuMjI4LDAuMzM4LTAuMzk2LDAuNjUxbC0xLjk5OSw1LjA4MiAgICBsLTEuNjQ4LDAuMDA1bDIuMTI5LTUuMDE3YzAuMDQ3LTAuMSwwLjA3Mi0wLjE3MywwLjA3Mi0wLjIyNGMwLjA0OC0wLjE5NywwLjA3Mi0wLjM3MSwwLjA3Mi0wLjUyICAgIGMwLTAuMTc0LTAuMDM3LTAuMjg1LTAuMTA5LTAuMzM0Yy0wLjA5NS0wLjEtMC4yMjgtMC4xNDktMC4zOTYtMC4xNDljLTAuNTA2LDAtMS4xNjgsMC42MS0xLjk4NSwxLjgzICAgIGMtMC4xMiwwLjE5NC0wLjMwMSwwLjQ3Ni0wLjU0MSwwLjg0MWgtMC4xODFjMC40MzMtMC43MywwLjc4LTEuMjY2LDEuMDQ2LTEuNjA3YzAuODY1LTEuMDY5LDEuNjU5LTEuNTQ1LDIuMzgtMS40MjUgICAgYzAuMTY5LDAuMDI1LDAuMzczLDAuMjExLDAuNjEzLDAuNTZjMC4wNzEsMC4xLDAuMTgxLDAuMjg2LDAuMzI1LDAuNTZjMC4xNDQtMC4yNjUsMC4yODctMC40NTcsMC40MzEtMC41NzggICAgYzAuNDU4LTAuNDA5LDEuMDExLTAuNjE0LDEuNjYtMC42MTRjMC4zMTMsMCwwLjU0MSwwLjE5MywwLjY4NiwwLjU3OGMwLjAyMywwLjEyMSwwLjA2MSwwLjMyNSwwLjEwOCwwLjYxNCAgICBjMC4yMTUtMC4zMDMsMC4zOTYtMC41MTMsMC41NC0wLjYyOWMwLjQ4LTAuMzk4LDEuMDEtMC41NjMsMS41ODYtMC40OWMwLjU1MiwwLjA3MSwwLjg5OSwwLjMwMywxLjA0NSwwLjY5OSAgICBjMC4wMjMsMC4xMTYsMC4wMzQsMC4zMDMsMC4wMzQsMC41NTlsLTEuNjM4LDQuMzc2Yy0wLjEyNywwLjE5MS0wLjIwMywwLjMyMy0wLjIyNywwLjM5NGMtMC4wNzIsMC4xNDQtMC4wNDgsMC4yMjgsMC4wNzEsMC4yNTEgICAgYzAuMjE4LDAuMDI1LDAuNTQyLTAuMjAzLDAuOTc2LTAuNjg2YzAuMTQ1LTAuMTQ0LDAuMzQ5LTAuMzk2LDAuNjEzLTAuNzU3aDAuMjE2Yy0wLjMxMywwLjQ0OS0wLjU2NiwwLjc4Ni0wLjc1OSwxLjAxICAgIGMtMC42MjYsMC42NzQtMS4yNTQsMS4wMS0xLjg4MSwxLjAxYy0wLjI0LDAtMC40MzQtMC4xMDgtMC41NzctMC4zMjVjLTAuMTQ2LTAuMjE2LTAuMTY5LTAuNDM0LTAuMDczLTAuNjVsMS42OTEtNC4yOTggICAgYzAuMDQzLTAuMDcyLDAuMDY0LTAuMTE5LDAuMDY0LTAuMTQ0YzAuMTA5LTAuMjY0LDAuMTY0LTAuNDc5LDAuMTY0LTAuNjQ4YzAtMC4yNjMtMC4xMDYtMC40MDctMC4zMjEtMC40MzEgICAgYy0wLjI4NS0wLjA3Mi0wLjU4MiwwLjA5Ni0wLjg5MSwwLjUwM2MtMC4wOTUsMC4xMi0wLjIyNywwLjMzNC0wLjM5MiwwLjY0Nkw5ODUuNTM3LDMyLjI2MXoiCiAgIGlkPSJwYXRoMzUyOCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzUzMCI%CgkJPHBhdGgKICAgZD0iTTc3Mi40OCw5Ni4zNjVMNzYxLjUsOTguNzVsMC4wMDgtMC4yNzhsOS4zODMtMi4wODRsLTkuMzkzLTIuMDg2bDAuMDAyLTAuMzIyTDc3Mi40OCw5Ni4zNjV6IgogICBpZD0icGF0aDM1MzIiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM1MzQiPgoJCTxwYXRoCiAgIGQ9Ik03NzUuMjcxLDk5LjUwOUw3NzQuNzUsOTkuNWwzLjQ5Ni0xMC4wNDJsMy41MzMsMTAuMDQybC0xLjI4OSwwbC0yLjY0My03LjUwOUw3NzUuMjcxLDk5LjUwOXoiCiAgIGlkPSJwYXRoMzUzNiIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzUzOCI%CgkJPHBhdGgKICAgZD0iTTc5OS4zMjgsOTUuMzA0Yy0wLjQzMiwwLjMyNy0wLjkyLDAuNjk3LTEuNDY1LDEuMTEycy0xLjA0MywwLjc2NS0xLjQ5NCwxLjA1Yy0wLjQ1MSwwLjI4NS0wLjg5OCwwLjUxMy0xLjM0MSwwLjY4NSAgICBzLTAuODY5LDAuMjY2LTEuMjc4LDAuMjgyYy0wLjQ3Ni0wLjA2Ni0wLjg3My0wLjE5NC0xLjE5MS0wLjM4MnMtMC43OTctMC41MTYtMS40MzYtMC45ODNjLTAuNjQtMC40NjgtMS4xNzQtMC44MTEtMS42MDMtMS4wMjkgICAgYy0wLjQyOS0wLjIxOS0wLjktMC4zMjgtMS40MTUtMC4zMjhjLTAuNzkxLDAtMS43NDMsMC41NTYtMi44NTUsMS42Njh2LTEuMTIxYzEuMzI4LTEuMTA3LDIuNDE4LTEuOTM5LDMuMjcxLTIuNDk5ICAgIHMxLjY2Ni0wLjgzOCwyLjQ0LTAuODM4YzAuNDg3LDAsMC45MzQsMC4xMTMsMS4zNDEsMC4zNGMwLjQwNiwwLjIyNywwLjg4NywwLjU2NCwxLjQ0LDEuMDEzYzAuNTUzLDAuNDQ4LDEuMDMzLDAuNzkyLDEuNDM5LDEuMDM0ICAgIGMwLjQwNywwLjI0LDAuODU5LDAuMzc1LDEuMzU3LDAuNDAyYzAuODk2LTAuMDcyLDEuODI2LTAuNTU5LDIuNzg5LTEuNDYxVjk1LjMwNHoiCiAgIGlkPSJwYXRoMzU0MCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzU0MiI%CgkJPHBhdGgKICAgZD0iTTgwNC42NTgsNzAuNTQ4aDAuNTA3YzAuNDc5LDAuNDQ4LDAuODY1LDAuODU2LDEuMTU3LDEuMjI2czAuNDM4LDAuNzUyLDAuNDM4LDEuMTQ3YzAsMC4zMTYtMC4wOTcsMC42MDEtMC4yOSwwLjg1NCAgICBjLTAuMTkzLDAuMjUyLTAuNDc5LDAuNTUtMC44NTcsMC44OTNzLTAuNjY0LDAuNjQ1LTAuODYsMC45MDZjLTAuMTk1LDAuMjYyLTAuMywwLjU1Ny0wLjMxMywwLjg4N2gwLjA1MyAgICBjMCwwLjMxNiwwLjA5MSwwLjYwMywwLjI3MywwLjg2YzAuMTgzLDAuMjU3LDAuNDY0LDAuNTY4LDAuODQ0LDAuOTMzczAuNjY3LDAuNjg0LDAuODYsMC45NTZjMC4xOTMsMC4yNzMsMC4yOSwwLjU4LDAuMjksMC45MjMgICAgYzAsMC4zMy0wLjA5NywwLjYyNy0wLjI5LDAuODk0Yy0wLjE5MywwLjI2Ni0wLjQ3OSwwLjU3NS0wLjg1NywwLjkyNmMtMC4zNzgsMC4zNTItMC42NTksMC42NDktMC44NDQsMC44OTQgICAgYy0wLjE4NSwwLjI0NC0wLjI3NiwwLjUxOC0wLjI3NiwwLjgyYzAsMC4xNzIsMC4yMjQsMC41OTYsMC42NzIsMS4yNzJoLTAuNTA3Yy0wLjU5NC0wLjU3MS0xLjAwOC0xLjAwNS0xLjI0My0xLjMwMiAgICBjLTAuMjM1LTAuMjk3LTAuMzUzLTAuNjczLTAuMzUzLTEuMTMxYzAtMC4zMzMsMC4wOTItMC42MjMsMC4yNzctMC44NjdjMC4xODQtMC4yNDQsMC40NjgtMC41MzUsMC44NS0wLjg3NCAgICBjMC4zODMtMC4zMzgsMC42NjgtMC42MzMsMC44NTctMC44ODNjMC4xODgtMC4yNTEsMC4yODMtMC41NTQsMC4yODMtMC45MWMwLTAuMTcxLTAuMDg4LTAuMzc3LTAuMjY0LTAuNjE5ICAgIHMtMC40MjItMC41NC0wLjczOC0wLjg5NGMtMC4zMTYtMC4zNTQtMC41MzItMC42MDUtMC42NDYtMC43NTVjLTAuNDEzLTAuNjQxLTAuNjE5LTEuMDkyLTAuNjE5LTEuMzUxICAgIGMwLjAxOC0wLjQwOSwwLjIwNC0wLjgwNSwwLjU2MS0xLjE5YzAuMzU1LTAuMzg0LDAuNzI1LTAuNzc0LDEuMTA3LTEuMTdjMC4zODItMC4zOTYsMC41ODItMC43NjksMC42LTEuMTIxICAgIGMwLTAuMTg5LTAuMDQ1LTAuMzU3LTAuMTM1LTAuNTA0QzgwNS4xMDQsNzEuMjIxLDgwNC45MjYsNzAuOTQ4LDgwNC42NTgsNzAuNTQ4eiIKICAgaWQ9InBhdGgzNTQ0IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNTQ2Ij4KCQk8cGF0aAogICBkPSJNODE0LjUsOTIuMzAxaDguMTYydjguNDQ5aC0wLjc0NHYtNC43NzVoLTYuNzIxdjQuNzc1SDgxNC41VjkyLjMwMXoiCiAgIGlkPSJwYXRoMzU0OCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzU1MCI%CgkJPHBhdGgKICAgZD0iTTgzMy4wMTgsOTIuNDMyTDgzMC4zOTUsMTAybC0yLjY0NS05LjU2OGgwLjY2OGwyLjAyMSw3LjU5MmwxLjkzMi03LjU5Mkg4MzMuMDE4eiIKICAgaWQ9InBhdGgzNTUyIiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNTU0Ij4KCQk8cGF0aAogICBkPSJNOTA0LjEyNSw2NS4zNzV2LTIuNTA2bDkuODY5LTUuMDUxdjIuNTM4TDkwNC4xMjUsNjUuMzc1eiBNOTA0LjEyNSw2OS41di0yLjUwNmw5Ljg2OS01LjA1MXYyLjUzOEw5MDQuMTI1LDY5LjV6ICAgICBNOTA0LjEyNSw3My42MjV2LTIuNTA2bDkuODY5LTUuMDUxdjIuNjFMOTA0LjEyNSw3My42MjV6IgogICBpZD0icGF0aDM1NTYiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM1NTgiPgoJCTxwYXRoCiAgIGQ9Ik05MTYuMTI1LDY1LjM3NXYtMi41MDZsOS44NjktNS4wNTF2Mi41MzhMOTE2LjEyNSw2NS4zNzV6IE05MTYuMTI1LDY5LjV2LTIuNTA2bDkuODY5LTUuMDUxdjIuNTM4TDkxNi4xMjUsNjkuNXoiCiAgIGlkPSJwYXRoMzU2MCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzU2MiI%CgkJPHBhdGgKICAgZD0iTTkyOS4xMjUsNjUuMzc1di0yLjUwNmw5Ljg2OS01LjA1MXYyLjUzOEw5MjkuMTI1LDY1LjM3NXoiCiAgIGlkPSJwYXRoMzU2NCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzU2NiI%CgkJPHBhdGgKICAgZD0iTTk1MC42NjcsMTAyLjY0MXYtMS45NWw0LjI1NC00Ljk0N2MwLjM0NC0wLjIyLDAuNTMxLTAuMzMxLDAuNTY0LTAuMzMxYzAuMTk4LDAsMC4zMywwLjA2NywwLjM5NSwwLjIwMmwzLjQ5NiwzLjA2MiAgICBjMC4xNzIsMC4xNzIsMC4zNiwwLjI4MiwwLjU2NCwwLjMzMWMwLjE5OC0wLjA2NCwwLjMzLTAuMTI5LDAuMzk1LTAuMTkzbDIuNjQzLTMuMDdjMC4zMzMtMC4yMiwwLjUzMS0wLjMzMSwwLjU5Ni0wLjMzMSAgICBjMC4xNzIsMCwwLjI5MywwLjA2NywwLjM2MywwLjIwMmwzLjQ5NiwzLjA2MmMwLjIwNCwwLjIxNSwwLjM5LDAuMzQ5LDAuNTU3LDAuNDAzYzAuMjA5LTAuMDc1LDAuMzQzLTAuMTY0LDAuNDAyLTAuMjY2ICAgIGwyLjI0LTIuNjQzdjEuOTQ5bC00LjIyMyw0Ljk0N2MtMC4zMjIsMC4yMi0wLjU0MiwwLjMzLTAuNjYsMC4zM2MtMC4xNTYsMC0wLjI2Ni0wLjA2NC0wLjMzLTAuMTkzbC0zLjQ2NS0zLjEwMiAgICBjLTAuMTU1LTAuMTU2LTAuMzc2LTAuMjM0LTAuNjYtMC4yMzRjLTAuMTY3LDAtMC4yNjYsMC4wMzItMC4yOTksMC4wOTdsLTIuNjc0LDMuMTAyYy0wLjI1OCwwLjIyLTAuNDY4LDAuMzMtMC42MjksMC4zMyAgICBjLTAuMTQ1LDAtMC4yNTUtMC4wNjQtMC4zMy0wLjE5M2wtMy40NjUtMy4xMDJjLTAuMTg4LTAuMTk5LTAuNDA4LTAuMjk4LTAuNjYtMC4yOThjLTAuMTQ2LDAtMC4yNTMsMC4wNTQtMC4zMjIsMC4xNjEgICAgTDk1MC42NjcsMTAyLjY0MXoiCiAgIGlkPSJwYXRoMzU2OCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzU3MCI%CgkJPHBhdGgKICAgZD0iTTk4MC42NjcsMTAyLjY0MXYtMS45NWwzLjk5Ni00LjU4NGMwLjM0NC0wLjM3NiwwLjU4NS0wLjU2NCwwLjcyNS0wLjU2NHMwLjQxNCwwLjE4OCwwLjgyMiwwLjU2NGwzLjUyOSwzLjEwMnYtNi4wNzUgICAgaDAuOTl2NS4yNTNsMS45MTgtMi4yOGMwLjM4MS0wLjQxOSwwLjYyMy0wLjYyOSwwLjcyNS0wLjYyOWMwLjEwNywwLDAuMzgyLDAuMTY3LDAuODIyLDAuNWwyLjc3MSwyLjQ3MyAgICBjMC42NDksMC41MzIsMC45OSwwLjgwNiwxLjAyMywwLjgyMmMwLjEwMi0wLjAyNywwLjI0Ni0wLjE1NiwwLjQzNS0wLjM4N2MwLjE4OC0wLjIzMSwwLjMzLTAuMzk3LDAuNDI3LTAuNWwxLjE1Mi0xLjQyNnYxLjc4OSAgICBsLTMuNDk2LDQuMTI1Yy0wLjI2NCwwLjM0OS0wLjUxNiwwLjUyMy0wLjc1OCwwLjUyM2MtMC4xMjQsMC0wLjQtMC4xOTktMC44My0wLjU5NmwtMi41Ny0yLjMwNCAgICBjLTAuNDYyLTAuNDYyLTAuODM1LTAuNjkzLTEuMTE5LTAuNjkzYy0wLjA3LDAtMC4xMjgsMC4wMTgtMC4xNzQsMC4wNTJjLTAuMDQ1LDAuMDM1LTAuMDk5LDAuMDk0LTAuMTYxLDAuMTc3ICAgIGMtMC4wNjIsMC4wODMtMC4xMTYsMC4xNDktMC4xNjUsMC4xOTh2Ni4wNzRoLTAuOTl2LTQuOTIybC0xLjIxNywxLjQ5MWMtMC4zMTcsMC4zNDktMC41NjksMC41MjMtMC43NTgsMC41MjMgICAgYy0wLjA3NSwwLTAuMTUxLTAuMDIzLTAuMjI5LTAuMDY4Yy0wLjA3OC0wLjA0Ni0wLjE4Ny0wLjEyOS0wLjMyNi0wLjI1Yy0wLjE0LTAuMTIxLTAuMjUzLTAuMjEzLTAuMzM5LTAuMjc4bC0yLjktMi42MzQgICAgYy0wLjM1NC0wLjI4NS0wLjU3NC0wLjQyNy0wLjY2LTAuNDI3Yy0wLjE1LDAtMC4zMzgsMC4xNDMtMC41NjQsMC40MjdMOTgwLjY2NywxMDIuNjQxeiIKICAgaWQ9InBhdGgzNTcyIiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNTc0Ij4KCQk8cGF0aAogICBkPSJNMTAxOC40MTIsMTAxLjM5NGMtMC4yMDQtMC4xNzMtMC42NTktMC41Ni0xLjM2NC0xLjE2Yy0wLjcwNS0wLjYtMS40MzUtMS4xNzMtMi4xODktMS43MjEgICAgYy0wLjc1NC0wLjU0Ny0xLjUwMS0xLjAwMi0yLjI0LTEuMzYzYy0wLjczOS0wLjM2Mi0xLjQwNS0wLjU0My0xLjk5OS0wLjU0M2MtMC43NDIsMC4wNjgtMS4zODEsMC40NTUtMS45MTYsMS4xNiAgICBzLTAuODIxLDEuNDMyLTAuODU4LDIuMThjMC4wODEsMS4xOTMsMC43NzYsMS43OTEsMi4wODgsMS43OTFjMC4xODYsMCwwLjMzNS0wLjAzMywwLjQ1LTAuMDk3YzAuMTE0LTAuMDY1LDAuMzEyLTAuMiwwLjU5NC0wLjQwNCAgICBjMC4yODEtMC4yMDQsMC41MzEtMC4zNTYsMC43NTEtMC40NTVjMC4yMi0wLjA5OSwwLjQ4NC0wLjE0OCwwLjc5My0wLjE0OGMwLjg5NywwLDEuNDY3LDAuMzkzLDEuNzA3LDEuMTc4ICAgIGMwLDAuNzYxLTAuMzEyLDEuMzI1LTAuOTM3LDEuNjkzYy0wLjYyNSwwLjM2OC0xLjI5OSwwLjU1Mi0yLjAyMiwwLjU1MmMtMS42NTctMC4wODEtMi45MDItMC41MzItMy43MzQtMS4zNTQgICAgYy0wLjgzMi0wLjgyMy0xLjI0OC0xLjgyOC0xLjI0OC0zLjAxNWMwLTAuODU5LDAuMjI1LTEuNzEyLDAuNjczLTIuNTU2YzAuNDQ4LTAuODQ1LDEuMDc5LTEuNTU2LDEuODkzLTIuMTM0ICAgIGMwLjgxMy0wLjU3OSwxLjc0Ni0wLjkyOSwyLjc5OC0xLjA1M2MxLjM3OSwwLDIuNjc1LDAuMjk4LDMuODg3LDAuODk1YzEuMjEyLDAuNTk3LDIuNDAxLDEuMzcyLDMuNTY3LDIuMzI0ICAgIGMxLjE2NSwwLjk1MywyLjI5LDEuODgsMy4zNzIsMi43ODNjMC40MjcsMC4zNTgsMC45NzksMC42OTYsMS42NTYsMS4wMTFjMC42NzcsMC4zMTUsMS4zMTUsMC40NzMsMS45MTYsMC40NzMgICAgYzAuOTI4LTAuMDUsMS42MjgtMC4zNTYsMi4xMDEtMC45MThjMC40NzQtMC41NjMsMC43MS0xLjIxOSwwLjcxLTEuOTY3YzAtMC42NDktMC4xODUtMS4xOTItMC41NTItMS42MjggICAgYy0wLjM2OC0wLjQzNi0wLjg1NS0wLjY1NC0xLjQ2Mi0wLjY1NGMtMC4yMSwwLTAuNTA3LDAuMTI3LTAuODkxLDAuMzhjLTAuMzgzLDAuMjU0LTAuNjg2LDAuNDM4LTAuOTA4LDAuNTUyICAgIGMtMC4yMjMsMC4xMTUtMC41MzUsMC4xNzItMC45MzgsMC4xNzJjLTAuNDIxLDAtMC43OTgtMC4xNDctMS4xMzItMC40NGMtMC4zMzQtMC4yOTQtMC41MDEtMC42NjctMC41MDEtMS4xMTggICAgYzAtMC42LDAuMzE2LTEuMDQ4LDAuOTUxLTEuMzQ1YzAuNjM0LTAuMjk3LDEuMzAzLTAuNDQ1LDIuMDA4LTAuNDQ1YzEuMDI3LDAsMS45MjQsMC4yNDMsMi42OTEsMC43MjggICAgYzAuNzY3LDAuNDg2LDEuMzUzLDEuMTIzLDEuNzU4LDEuOTExYzAuNDA0LDAuNzg5LDAuNjA3LDEuNjE5LDAuNjA3LDIuNDkxYzAsMC44NzgtMC4yMDEsMS42ODgtMC42MDQsMi40MzEgICAgYy0wLjQwMSwwLjc0Mi0xLjAxNywxLjM0MS0xLjg0NiwxLjc5NWMtMC44MjksMC40NTUtMS44NSwwLjY4Mi0zLjA2MiwwLjY4MmMtMS4xNjksMC0yLjI0OC0wLjIyMy0zLjIzNy0wLjY2OCAgICBDMTAyMC43NTMsMTAyLjk0MywxMDE5LjY0MywxMDIuMjc4LDEwMTguNDEyLDEwMS4zOTR6IgogICBpZD0icGF0aDM1NzYiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM1NzgiPgoJCTxwYXRoCiAgIGQ9Ik0xMDQzLjQzMywxMDMuNzI1Yy0xLjI0NiwwLTIuMjk2LTAuNDUyLTMuMTUtMS4zNTVzLTEuMjgxLTEuOTc4LTEuMjgxLTMuMjIzYzAtMS4zMDYsMC40MjEtMi4zOTYsMS4yNjQtMy4yNjkgICAgYzAuODQyLTAuODczLDEuODk3LTEuMzA5LDMuMTY4LTEuMzA5YzEuMjIsMCwyLjI1NSwwLjM5NCwzLjEwNCwxLjE4MWMwLjg0OCwwLjc4NywxLjMwOSwxLjc3MywxLjM4MiwyLjk1NyAgICBjMCwxLjQ1My0wLjQxOCwyLjYzNC0xLjI1NCwzLjU0M1MxMDQ0Ljc1MSwxMDMuNjUxLDEwNDMuNDMzLDEwMy43MjV6IE0xMDQzLjI2OCw5NS40NjZjLTEuMDE0LDAtMS44MjgsMC4zNTctMi40NDQsMS4wNzEgICAgYy0wLjYxNywwLjcxNC0wLjkyNSwxLjU4NC0wLjkyNSwyLjYwOWMwLDEuMDEzLDAuMzI5LDEuODU1LDAuOTg4LDIuNTI3czEuNTA4LDEuMDA3LDIuNTQ2LDEuMDA3YzEuMTM1LDAsMi4wMTctMC4zNjQsMi42NDYtMS4wOSAgICBzMC45NDItMS42ODgsMC45NDItMi44ODRDMTA0Ni44MDIsOTYuNTQ3LDEwNDUuNTUsOTUuNDY2LDEwNDMuMjY4LDk1LjQ2NnoiCiAgIGlkPSJwYXRoMzU4MCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzU4MiI%CgkJPHBhdGgKICAgZD0iTTEwNTguMTI1LDEwNC4wOTd2LTQuNDkxaC00LjQ1N3YtMS4yMmg0LjQ1N1Y5My45N2gxLjE4OHY0LjQxNmg0LjUyM3YxLjIyaC00LjUyM3Y0LjQ5MUgxMDU4LjEyNXoiCiAgIGlkPSJwYXRoMzU4NCIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzU4NiI%CgkJPHBhdGgKICAgZD0iTTEwMDMuMDAzLDI4Ljc4MlYxMy4zMDNsMC40MzksMC4wODh2MTYuNzk3YzAsMC44NjYtMC40MTUsMS42MDItMS4yNDUsMi4yMDdzLTEuNzM2LDAuOTA4LTIuNzIsMC45MDggICAgYy0xLjE0NiwwLTEuODIzLTAuNDY1LTIuMDMxLTEuMzk2YzAtMC44NDYsMC40MTctMS42NDQsMS4yNS0yLjM5M3MxLjczNS0xLjEyMywyLjcwNS0xLjEyMyAgICBDMTAwMi4wNzIsMjguMzkxLDEwMDIuNjA1LDI4LjUyMSwxMDAzLjAwMywyOC43ODJ6IE0xMDA2LjY0NiwyOS44NjZ2LTAuNzYyaDUuNHYwLjc2MkgxMDA2LjY0NnogTTEwMDYuNjQ2LDMxLjUwNmg1LjR2MC44MDFoLTUuNCAgICBWMzEuNTA2eiIKICAgaWQ9InBhdGgzNTg4IiAvPgoJPC9nPgo8L2c%CjxnCiAgIGlkPSJFYmVuZV80Ij4KCTxnCiAgIGlkPSJnMzU5MSI%CgkJPHBhdGgKICAgZD0iTTMwNi44MjYsNjUuMjV2LTUuNzcyaDAuOTM2djUuNDA4bDEuMzUyLTAuNTcydjMuNDMybC0xLjM1MiwwLjU3MnY1LjUxMmwxLjM1Mi0wLjYyNHYzLjQzMmwtMS4zNTIsMC41NzJ2NS42MTZoLTAuOTM2ICAgIHYtNS4yNTJsLTIuMjM2LDAuOTM2djUuNjY4aC0wLjkzNnYtNS4zMDRsLTEuMzUyLDAuNTJ2LTMuNDMybDEuMzUyLTAuNTJ2LTUuNTEybC0xLjM1MiwwLjU3MnYtMy40ODRsMS4zNTItMC41MnYtNS42MTZoMC45MzYgICAgdjUuMjUyTDMwNi44MjYsNjUuMjV6IE0zMDQuNTksNjkuNTY2djUuNTEybDIuMjM2LTAuOTM2di01LjQ2TDMwNC41OSw2OS41NjZ6IgogICBpZD0icGF0aDM1OTMiIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM1OTUiPgoJCTxwYXRoCiAgIGQ9Ik0zMTQuNzcsNjMuMjc1aDAuOTM2djEzYzAuNDg1LTAuMjc3LDAuODY2LTAuNDg1LDEuMTQ0LTAuNjI0YzAuOTM2LTAuNDE2LDEuNzY4LTAuNjI0LDIuNDk2LTAuNjI0ICAgIGMwLjUyLDAsMC45NzksMC4xMywxLjM3OCwwLjM5YzAuMzk4LDAuMjYsMC43MDIsMC43MDEsMC45MSwxLjMyNGMwLjEwNCwwLjMxMiwwLjE1NiwwLjYyNCwwLjE1NiwwLjkzNSAgICBjMCwxLjAwNC0wLjUwMywyLjA0Mi0xLjUwOCwzLjExNmMtMC43MjgsMC43NjItMS41NzgsMS40MzctMi41NDgsMi4wMjZjLTAuNDE2LDAuMjQyLTAuOTcxLDAuNjkyLTEuNjY0LDEuMzUgICAgYy0wLjQ1MSwwLjQxNi0wLjg4NCwwLjg0OS0xLjMsMS4yOThWNjMuMjc1eiBNMzE4LjY3LDc2LjE3MWMtMC4wNy0wLjAzNC0wLjEzOS0wLjA2OS0wLjIwOC0wLjEwNCAgICBjLTAuMTc0LTAuMDY5LTAuMzMtMC4xMDQtMC40NjgtMC4xMDRjLTAuMjc4LDAtMC41OSwwLjA3OC0wLjkzNiwwLjIzNGMtMC4zNDcsMC4xNTYtMC43OTgsMC40Ni0xLjM1MiwwLjkxdjYuNDQ4ICAgIGMwLjY1OC0wLjY1OSwxLjMxNy0xLjMxOCwxLjk3Ni0xLjk3NmMxLjI4Mi0xLjU2LDEuOTI0LTIuODQyLDEuOTI0LTMuODQ4QzMxOS42MDYsNzcuMDM5LDMxOS4yOTQsNzYuNTE5LDMxOC42Nyw3Ni4xNzF6IgogICBpZD0icGF0aDM1OTciIC8%Cgk8L2c%Cgk8ZwogICBpZD0iZzM1OTkiPgoJCTxwYXRoCiAgIGQ9Ik0zMjYuODg4LDg1LjIyMlY2Ny42NzdoMC45OXY3LjkybDQuNzg1LTEuMzJ2MTcuMzhoLTAuOTM1di03Ljc1NUwzMjYuODg4LDg1LjIyMnogTTMyNy44NzgsODIuMzA3bDMuODUtMS4wNDV2LTQuMjkgICAgbC0zLjg1LDEuMDQ1VjgyLjMwN3oiCiAgIGlkPSJwYXRoMzYwMSIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzYwMyI%CgkJPHBhdGgKICAgZD0iTTExMy42NSw3NS44NzV2LTE4Ljc1aDMuMzc1djE4Ljc1SDExMy42NXogTTExOS4yNzUsNzUuODc1di0xOC43NWgzLjM3NXYxOC43NUgxMTkuMjc1eiIKICAgaWQ9InBhdGgzNjA1IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNjA3Ij4KCTwvZz4KCTxnCiAgIGlkPSJnMzYwOSI%CgkJPHBhdGgKICAgZD0iTTM3OC4wNTUsNjIuNDg0YzAuNzczLTAuMjY5LDEuNDQtMC43NywyLjAwMS0xLjVjMC41Ni0wLjczLDEuMDE1LTEuNzQ5LDEuMzYzLTMuMDU3bDEuMjc2LTUuNDc4ICAgIGMtMC42OTYsMS4yNzYtMS45NzIsMS45MTQtMy44MjgsMS45MTRjLTAuNDY0LDAtMS4wMDYtMC4wNzctMS42MjQtMC4yMzJjLTAuNjE5LTAuMTU0LTEuMTQxLTAuNDY0LTEuNTY2LTAuOTI4ICAgIGMtMC40MjYtMC40NjQtMC42MzgtMS4wODItMC42MzgtMS44NTZjMC0wLjY1NywwLjIzMi0xLjIxOCwwLjY5Ni0xLjY4MmMwLjQ2NC0wLjQ2NCwxLjA0NC0wLjY5NiwxLjc0LTAuNjk2ICAgIGMwLjY1NywwLDEuMjM3LDAuMjUyLDEuNzQsMC43NTRjMC41MDIsMC41MDMsMC43NTQsMS4wNDQsMC43NTQsMS42MjRjMCwwLjMxLTAuMDc4LDAuNjM4LTAuMjMyLDAuOTg2ICAgIGMtMC4xNTUsMC4zNDgtMC40NDUsMC42MzgtMC44NywwLjg3YzAuNDYyLDAuMTU1LDAuNzEyLDAuMjMyLDAuNzUxLDAuMjMyYzAuMDc2LDAsMC4yNy0wLjAzOCwwLjU3OC0wLjExNiAgICBjMC43Ny0wLjIzMiwxLjQ4Mi0wLjgxMiwyLjEzOC0xLjc0MmMwLjUzOS0wLjczNSwwLjg2Ni0xLjM3NCwwLjk4Mi0xLjkxNmwxLjU0OS02LjM4NWMtMC43MzIsMS4yODEtMS45ODMsMS45MjItMy43NTMsMS45MjIgICAgYy0wLjMwOCwwLTAuNjE2LDAtMC45MjQsMGMtMC4zNDYtMC4xMTYtMC41NzctMC4xOTMtMC42OTItMC4yMzJjLTAuNjkzLTAuMTkzLTEuMjUxLTAuNTIyLTEuNjc1LTAuOTg2ICAgIGMtMC40MjQtMC40NjQtMC42MzUtMS4wNjMtMC42MzUtMS43OThjMC0wLjY5NiwwLjIzMi0xLjI3NiwwLjY5Ni0xLjc0YzAuNDY0LTAuNDY0LDEuMDQ0LTAuNjk2LDEuNzQtMC42OTYgICAgczEuMjg1LDAuMjQyLDEuNzY5LDAuNzI1YzAuNDgzLDAuNDg0LDAuNzI1LDEuMDM1LDAuNzI1LDEuNjUzYzAsMC4zMS0wLjA3OCwwLjYzOC0wLjIzMiwwLjk4NiAgICBjLTAuMTU1LDAuMzQ4LTAuNDI2LDAuNjU4LTAuODEyLDAuOTI4YzAuMTkyLDAuMDc4LDAuNDA1LDAuMTU1LDAuNjM3LDAuMjMyYzAuMTE1LDAsMC4zMjctMC4wMzksMC42MzYtMC4xMTkgICAgYzAuNzMyLTAuMjM4LDEuNDA4LTAuODA0LDIuMDI1LTEuNjk3YzAuNjE3LTAuODk0LDEuMjE1LTEuNzk3LDEuNzk0LTIuNzExbDAuNDE3LDAuMDAzbC0xMC4zMjMsNDQuMjU0bC0xLjA3LTAuMDA2bDMuMTktMTMuMTY2ICAgIGMtMC43MzIsMS4yOC0xLjk2NiwxLjkyLTMuNywxLjkyYy0wLjE5MywwLTAuMzg2LDAtMC41NzgsMGMtMC4yNy0wLjAzOS0wLjY4NS0wLjEzNi0xLjI0My0wLjI5ICAgIGMtMC41NTktMC4xNTUtMS4wNS0wLjQ2NC0xLjQ3NS0wLjkyOGMtMC40MjQtMC40NjQtMC42MzUtMS4wNjQtMC42MzUtMS43OThjMC0wLjY1OCwwLjIzMi0xLjIxOCwwLjY5Ni0xLjY4MiAgICBjMC40NjQtMC40NjQsMS4wNjMtMC42OTYsMS43OTgtMC42OTZjMC42NTcsMCwxLjIyNywwLjI0MSwxLjcxMSwwLjcyNWMwLjQ4MywwLjQ4MywwLjcyNSwxLjAzNCwwLjcyNSwxLjY1MyAgICBjMCwwLjMwOS0wLjA3OCwwLjYzOC0wLjIzMiwwLjk4NmMtMC4xNTUsMC4zNDgtMC40NDUsMC42MzgtMC44NywwLjg3YzAuNDYxLDAuMTU0LDAuNzExLDAuMjMyLDAuNzUsMC4yMzIgICAgYzAuMDc2LDAsMC4yNjgtMC4wMzksMC41NzYtMC4xMTZjMC43NjktMC4yMzMsMS41LTAuODMzLDIuMTkyLTEuODAxYzAuNTc2LTAuNzc1LDAuODY1LTEuMjk4LDAuODY1LTEuNTY5bDEuNjE2LTYuNjcyICAgIGMtMC43MzIsMS4yNDMtMS45ODMsMS44NjMtMy43NTQsMS44NjNjLTAuMzA4LDAtMC42MTYsMC0wLjkyNCwwYy0wLjM0Ni0wLjExNC0wLjU3Ny0wLjE5MS0wLjY5My0wLjIyOSAgICBjLTAuNjkzLTAuMTkxLTEuMjUxLTAuNTE3LTEuNjc1LTAuOTc2Yy0wLjQyNC0wLjQ1OC0wLjYzNS0xLjA1Mi0wLjYzNS0xLjc3OWMwLTAuNjg4LDAuMjMyLTEuMjYyLDAuNjk2LTEuNzIxICAgIGMwLjQ2NC0wLjQ1OCwxLjA2My0wLjY4OSwxLjc5OC0wLjY4OWMwLjY1NywwLDEuMjI3LDAuMjM5LDEuNzExLDAuNzE4YzAuNDgzLDAuNDc5LDAuNzI1LDEuMDIzLDAuNzI1LDEuNjM1ICAgIGMwLDAuMzA2LTAuMDc4LDAuNjMxLTAuMjMyLDAuOTc2Yy0wLjE1NSwwLjM0NC0wLjQ0NSwwLjY1LTAuODcsMC45MThjMC4yMzIsMC4wNzMsMC40NjQsMC4xNDYsMC42OTYsMC4yMTkgICAgQzM3Ny41MzMsNjIuNiwzNzcuNzQ1LDYyLjU2MiwzNzguMDU1LDYyLjQ4NHoiCiAgIGlkPSJwYXRoMzYxMSIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzYxMyI%CgkJPHBhdGgKICAgZD0iTTI4NC42NzUsNzYuMjU0YzAuNTItMC4yNzcsMC45MzYtMC40ODUsMS4yNDgtMC42MjRjMS4wMDUtMC40NSwxLjc2OC0wLjY3NiwyLjI4OC0wLjY3NmMwLjQ1LDAsMC45NTMsMC4xMjIsMS41MDgsMC4zNjQgICAgVjYzLjI1NGgwLjg4NHYxM2MwLjQ4NS0wLjI3NywwLjg4NC0wLjQ4NSwxLjE5Ni0wLjYyNGMxLjAwNS0wLjQ1LDEuODM3LTAuNjc2LDIuNDk2LTAuNjc2YzAuNTU0LDAsMS4wNCwwLjEzLDEuNDU2LDAuMzkgICAgYzAuNDE2LDAuMjYsMC43MjgsMC43MTgsMC45MzYsMS4zNzVjMC4xMDQsMC4zMTIsMC4xNTYsMC42MjQsMC4xNTYsMC45MzVjMCwxLjA3My0wLjQ4NiwyLjEyOS0xLjQ1NiwzLjE2OCAgICBjLTAuNzI4LDAuNzk2LTEuNjMsMS40MzctMi43MDQsMS45MjFjLTAuMzQ3LDAuMTczLTAuNzg5LDAuNTItMS4zMjYsMS4wNGMtMC41MzgsMC41MTgtMS4wODQsMS4wNzItMS42MzgsMS42NjF2LTUuMjkxICAgIGMtMC4zODIsMC40NTQtMC43MjgsMC44MzgtMS4wNCwxLjE1MmMtMC41NTUsMC41NTktMS4yMTQsMS4wMy0xLjk3NiwxLjQxNWMtMC40NTEsMC4yMDktMS4wMjMsMC42ODEtMS43MTYsMS40MTUgICAgYy0wLjQxNiwwLjQxOS0wLjgxNSwwLjg1NS0xLjE5NiwxLjMxVjYzLjI1NGgwLjg4NFY3Ni4yNTR6IE0yODcuNjkxLDc2LjE1Yy0wLjA3LTAuMDM0LTAuMTM5LTAuMDY5LTAuMjA4LTAuMTA0ICAgIGMtMC4xNzQtMC4wNjktMC4zMy0wLjEwNC0wLjQ2OC0wLjEwNGMtMC4zMTIsMC0wLjY0MiwwLjA3OC0wLjk4OCwwLjIzNGMtMC4zNDcsMC4xNTYtMC43OTgsMC40Ni0xLjM1MiwwLjkxdjYuNDQ4ICAgIGMwLjY1OC0wLjY1OSwxLjMxNy0xLjMxOCwxLjk3Ni0xLjk3NmMxLjMxNy0xLjU5NSwxLjk3Ni0yLjg3NywxLjk3Ni0zLjg0OEMyODguNjI3LDc3LjAxOCwyODguMzE1LDc2LjQ5OCwyODcuNjkxLDc2LjE1eiAgICAgTTI5My42Miw3Ni4xNWMtMC4wMzUtMC4wMzQtMC4xMjItMC4wNjktMC4yNi0wLjEwNGMtMC4yMDgtMC4wNjktMC4zNjQtMC4xMDQtMC40NjgtMC4xMDRjLTAuMzEyLDAtMC42MzMsMC4wNzgtMC45NjIsMC4yMzQgICAgYy0wLjMzLDAuMTU2LTAuNzcyLDAuNDYtMS4zMjYsMC45MXY2LjQ0OGMwLjY1OC0wLjY1OSwxLjMxNy0xLjMxOCwxLjk3Ni0xLjk3NmMxLjMxNy0xLjU5NSwxLjk3Ni0yLjg3NywxLjk3Ni0zLjg0OCAgICBDMjk0LjU1Niw3Ny4wMTgsMjk0LjI0NCw3Ni40OTgsMjkzLjYyLDc2LjE1eiIKICAgaWQ9InBhdGgzNjE1IiAvPgoJPC9nPgoJPGcKICAgaWQ9ImczNjE3Ij4KCQk8cGF0aAogICBkPSJNMzM1LjcyOCw3Ny45MzZjLTAuMzItMC4zMTktMC40OC0wLjY4OC0wLjQ4LTEuMTA0YzAtMC4zODQsMC4xNTEtMC43MTIsMC40NTYtMC45ODRjMC4zMDQtMC4yNzEsMC42MzEtMC40MDgsMC45ODQtMC40MDggICAgYzAuMzg0LDAsMC43MDQsMC4xNDQsMC45NiwwLjQzMmMwLjY0LDAuNTc2LDEuMTY4LDEuMjQsMS41ODQsMS45OTJjMC40MTYsMC43NTIsMC42MjQsMS40NjQsMC42MjQsMi4xMzYgICAgYy0wLjgzMywwLTEuNzI4LTAuMzA0LTIuNjg4LTAuOTEyQzMzNi40OTYsNzguNjcyLDMzNi4wMTYsNzguMjg5LDMzNS43MjgsNzcuOTM2eiBNMzM1LjY4LDg0LjIyNCAgICBjMC4yNTUsMC4yNTYsMC41OTIsMC4zODQsMS4wMDgsMC4zODRjMC4zODQsMCwwLjcwNC0wLjE0NCwwLjk2LTAuNDMyYzAuNDQ4LTAuMzg0LDAuODY0LTAuODY0LDEuMjQ4LTEuNDQgICAgYzAuNjQtMC45NiwwLjk2LTEuODcyLDAuOTYtMi43MzZjLTAuNzA0LDAtMS40MDksMC4xODQtMi4xMTIsMC41NTJjLTAuNzA1LDAuMzY4LTEuMzc2LDAuODcyLTIuMDE2LDEuNTEyICAgIGMtMC4zMiwwLjMxOS0wLjQ4LDAuNzA0LTAuNDgsMS4xNTJDMzM1LjI0OCw4My42LDMzNS4zOTIsODMuOTM2LDMzNS42OCw4NC4yMjR6IE0zNDMuOTg0LDc1LjgyNCAgICBjLTAuMjU2LTAuMjU2LTAuNjA4LTAuMzg0LTEuMDU2LTAuMzg0Yy0wLjQxNywwLTAuNzY4LDAuMTYxLTEuMDU2LDAuNDhjLTAuNTc2LDAuNjcyLTAuOTQ0LDEuMTM2LTEuMTA0LDEuMzkyICAgIGMtMC42MDgsMC45Ni0wLjkxMiwxLjg1Ni0wLjkxMiwyLjY4OGMwLjkyOCwwLDEuODI0LTAuMjg4LDIuNjg4LTAuODY0YzAuNzk5LTAuNjcyLDEuMjQ4LTEuMDU2LDEuMzQ0LTEuMTUyICAgIGMwLjMxOS0wLjMxOSwwLjQ4LTAuNzIsMC40OC0xLjJDMzQ0LjM2OCw3Ni40NjQsMzQ0LjI0LDc2LjE0NCwzNDMuOTg0LDc1LjgyNHogTTM0My44ODgsODIuMDY0ICAgIGMwLjMxOSwwLjMxOSwwLjQ4LDAuNzA0LDAuNDgsMS4xNTJjMCwwLjM4NC0wLjE0NCwwLjcyLTAuNDMyLDEuMDA4cy0wLjYyNCwwLjQzMi0xLjAwOCwwLjQzMmMtMC4zODQsMC0wLjczNy0wLjE2LTEuMDU2LTAuNDggICAgYy0wLjUxMi0wLjU3Ni0wLjg4LTEuMDU2LTEuMTA0LTEuNDRjLTAuNjA4LTAuOTYtMC45MTItMS44NzItMC45MTItMi43MzZjMS4wNTYsMCwyLjExMiwwLjQxNiwzLjE2OCwxLjI0OCAgICBDMzQzLjUzNiw4MS43MjgsMzQzLjgyNCw4MiwzNDMuODg4LDgyLjA2NHoiCiAgIGlkPSJwYXRoMzYxOSIgLz4KCTwvZz4KCTxnCiAgIGlkPSJnMzYyMSI%Cgk8L2c%Cgk8ZwogICBpZD0iZzM2MjMiPgoJPC9nPgoJPGcKICAgaWQ9ImczNjI1Ij4KCTwvZz4KCTxnCiAgIGlkPSJnMzYyNyI%Cgk8L2c%Cgk8ZwogICBpZD0iZzM2MjkiPgoJPC9nPgoJPGcKICAgaWQ9ImczNjMxIj4KCTwvZz4KCTxnCiAgIGlkPSJnMzYzMyI%Cgk8L2c%Cgk8ZwogICBpZD0iZzM2MzUiPgoJPC9nPgoJPGcKICAgaWQ9ImczNjM3Ij4KCTwvZz4KCTxnCiAgIGlkPSJnMzYzOSI%Cgk8L2c%Cgk8ZwogICBpZD0iZzM2NDEiPgoJPC9nPgoJPGcKICAgaWQ9ImczNjQzIj4KCTwvZz4KCTxnCiAgIGlkPSJnMzY0NSI%Cgk8L2c%Cgk8ZwogICBpZD0iZzM2NDciPgoJPC9nPgoJPGcKICAgaWQ9ImczNjQ5Ij4KCTwvZz4KPC9nPgo8L3N2Zz4"}];
if(typeof($) == 'undefined') {
	/*! jQuery v1.6.4 http://jquery.com/ | http://jquery.org/license */
(function(a,b){function cu(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cr(a){if(!cg[a]){var b=c.body,d=f("<"+a+">").appendTo(b),e=d.css("display");d.remove();if(e==="none"||e===""){ch||(ch=c.createElement("iframe"),ch.frameBorder=ch.width=ch.height=0),b.appendChild(ch);if(!ci||!ch.createElement)ci=(ch.contentWindow||ch.contentDocument).document,ci.write((c.compatMode==="CSS1Compat"?"<!doctype html>":"")+"<html><body>"),ci.close();d=ci.createElement(a),ci.body.appendChild(d),e=f.css(d,"display"),b.removeChild(ch)}cg[a]=e}return cg[a]}function cq(a,b){var c={};f.each(cm.concat.apply([],cm.slice(0,b)),function(){c[this]=a});return c}function cp(){cn=b}function co(){setTimeout(cp,0);return cn=f.now()}function cf(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ce(){try{return new a.XMLHttpRequest}catch(b){}}function b$(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function bZ(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function bY(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bA.test(a)?d(a,e):bY(a+"["+(typeof e=="object"||f.isArray(e)?b:"")+"]",e,c,d)});else if(!c&&b!=null&&typeof b=="object")for(var e in b)bY(a+"["+e+"]",b[e],c,d);else d(a,b)}function bX(a,c){var d,e,g=f.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((g[d]?a:e||(e={}))[d]=c[d]);e&&f.extend(!0,a,e)}function bW(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bP,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=bW(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=bW(a,c,d,e,"*",g));return l}function bV(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bL),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function by(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=b==="width"?bt:bu;if(d>0){c!=="border"&&f.each(e,function(){c||(d-=parseFloat(f.css(a,"padding"+this))||0),c==="margin"?d+=parseFloat(f.css(a,c+this))||0:d-=parseFloat(f.css(a,"border"+this+"Width"))||0});return d+"px"}d=bv(a,b,b);if(d<0||d==null)d=a.style[b]||0;d=parseFloat(d)||0,c&&f.each(e,function(){d+=parseFloat(f.css(a,"padding"+this))||0,c!=="padding"&&(d+=parseFloat(f.css(a,"border"+this+"Width"))||0),c==="margin"&&(d+=parseFloat(f.css(a,c+this))||0)});return d+"px"}function bl(a,b){b.src?f.ajax({url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bd,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)}function bk(a){f.nodeName(a,"input")?bj(a):"getElementsByTagName"in a&&f.grep(a.getElementsByTagName("input"),bj)}function bj(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bi(a){return"getElementsByTagName"in a?a.getElementsByTagName("*"):"querySelectorAll"in a?a.querySelectorAll("*"):[]}function bh(a,b){var c;if(b.nodeType===1){b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase();if(c==="object")b.outerHTML=a.outerHTML;else if(c!=="input"||a.type!=="checkbox"&&a.type!=="radio"){if(c==="option")b.selected=a.defaultSelected;else if(c==="input"||c==="textarea")b.defaultValue=a.defaultValue}else a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value);b.removeAttribute(f.expando)}}function bg(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c=f.expando,d=f.data(a),e=f.data(b,d);if(d=d[c]){var g=d.events;e=e[c]=f.extend({},d);if(g){delete e.handle,e.events={};for(var h in g)for(var i=0,j=g[h].length;i<j;i++)f.event.add(b,h+(g[h][i].namespace?".":"")+g[h][i].namespace,g[h][i],g[h][i].data)}}}}function bf(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function V(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(Q.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function U(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function M(a,b){return(a&&a!=="*"?a+".":"")+b.replace(y,"`").replace(z,"&")}function L(a){var b,c,d,e,g,h,i,j,k,l,m,n,o,p=[],q=[],r=f._data(this,"events");if(!(a.liveFired===this||!r||!r.live||a.target.disabled||a.button&&a.type==="click")){a.namespace&&(n=new RegExp("(^|\\.)"+a.namespace.split(".").join("\\.(?:.*\\.)?")+"(\\.|$)")),a.liveFired=this;var s=r.live.slice(0);for(i=0;i<s.length;i++)g=s[i],g.origType.replace(w,"")===a.type?q.push(g.selector):s.splice(i--,1);e=f(a.target).closest(q,a.currentTarget);for(j=0,k=e.length;j<k;j++){m=e[j];for(i=0;i<s.length;i++){g=s[i];if(m.selector===g.selector&&(!n||n.test(g.namespace))&&!m.elem.disabled){h=m.elem,d=null;if(g.preType==="mouseenter"||g.preType==="mouseleave")a.type=g.preType,d=f(a.relatedTarget).closest(g.selector)[0],d&&f.contains(h,d)&&(d=h);(!d||d!==h)&&p.push({elem:h,handleObj:g,level:m.level})}}}for(j=0,k=p.length;j<k;j++){e=p[j];if(c&&e.level>c)break;a.currentTarget=e.elem,a.data=e.handleObj.data,a.handleObj=e.handleObj,o=e.handleObj.origHandler.apply(e.elem,arguments);if(o===!1||a.isPropagationStopped()){c=e.level,o===!1&&(b=!1);if(a.isImmediatePropagationStopped())break}}return b}}function J(a,c,d){var e=f.extend({},d[0]);e.type=a,e.originalEvent={},e.liveFired=b,f.event.handle.call(c,e),e.isDefaultPrevented()&&d[0].preventDefault()}function D(){return!0}function C(){return!1}function m(a,c,d){var e=c+"defer",g=c+"queue",h=c+"mark",i=f.data(a,e,b,!0);i&&(d==="queue"||!f.data(a,g,b,!0))&&(d==="mark"||!f.data(a,h,b,!0))&&setTimeout(function(){!f.data(a,g,b,!0)&&!f.data(a,h,b,!0)&&(f.removeData(a,e,!0),i.resolve())},0)}function l(a){for(var b in a)if(b!=="toJSON")return!1;return!0}function k(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(j,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNaN(d)?i.test(d)?f.parseJSON(d):d:parseFloat(d)}catch(g){}f.data(a,c,d)}else d=b}return d}var c=a.document,d=a.navigator,e=a.location,f=function(){function K(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(K,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/\d/,n=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,o=/^[\],:{}\s]*$/,p=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,q=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,r=/(?:^|:|,)(?:\s*\[)+/g,s=/(webkit)[ \/]([\w.]+)/,t=/(opera)(?:.*version)?[ \/]([\w.]+)/,u=/(msie) ([\w.]+)/,v=/(mozilla)(?:.*? rv:([\w.]+))?/,w=/-([a-z]|[0-9])/ig,x=/^-ms-/,y=function(a,b){return(b+"").toUpperCase()},z=d.userAgent,A,B,C,D=Object.prototype.toString,E=Object.prototype.hasOwnProperty,F=Array.prototype.push,G=Array.prototype.slice,H=String.prototype.trim,I=Array.prototype.indexOf,J={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=n.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.6.4",length:0,size:function(){return this.length},toArray:function(){return G.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?F.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),B.done(a);return this},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(G.apply(this,arguments),"slice",G.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:F,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;B.resolveWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").unbind("ready")}},bindReady:function(){if(!B){B=e._Deferred();if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",C,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",C),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&K()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a&&typeof a=="object"&&"setInterval"in a},isNaN:function(a){return a==null||!m.test(a)||isNaN(a)},type:function(a){return a==null?String(a):J[D.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;try{if(a.constructor&&!E.call(a,"constructor")&&!E.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||E.call(a,d)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw a},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(o.test(b.replace(p,"@").replace(q,"]").replace(r,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(c){var d,f;try{a.DOMParser?(f=new DOMParser,d=f.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(g){d=b}(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&e.error("Invalid XML: "+c);return d},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(x,"ms-").replace(w,y)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:H?function(a){return a==null?"":H.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?F.call(c,a):e.merge(c,a)}return c},inArray:function(a,b){if(!b)return-1;if(I)return I.call(b,a);for(var c=0,d=b.length;c<d;c++)if(b[c]===a)return c;return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=G.call(arguments,2),g=function(){return a.apply(c,f.concat(G.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h){var i=a.length;if(typeof c=="object"){for(var j in c)e.access(a,j,c[j],f,g,d);return a}if(d!==b){f=!h&&f&&e.isFunction(d);for(var k=0;k<i;k++)g(a[k],c,f?d.call(a[k],k,g(a[k],c)):d,h);return a}return i?g(a[0],c):b},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=s.exec(a)||t.exec(a)||u.exec(a)||a.indexOf("compatible")<0&&v.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){J["[object "+b+"]"]=b.toLowerCase()}),A=e.uaMatch(z),A.browser&&(e.browser[A.browser]=!0,e.browser.version=A.version),e.browser.webkit&&(e.browser.safari=!0),j.test(" ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?C=function(){c.removeEventListener("DOMContentLoaded",C,!1),e.ready()}:c.attachEvent&&(C=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",C),e.ready())});return e}(),g="done fail isResolved isRejected promise then always pipe".split(" "),h=[].slice;f.extend({_Deferred:function(){var a=[],b,c,d,e={done:function(){if(!d){var c=arguments,g,h,i,j,k;b&&(k=b,b=0);for(g=0,h=c.length;g<h;g++)i=c[g],j=f.type(i),j==="array"?e.done.apply(e,i):j==="function"&&a.push(i);k&&e.resolveWith(k[0],k[1])}return this},resolveWith:function(e,f){if(!d&&!b&&!c){f=f||[],c=1;try{while(a[0])a.shift().apply(e,f)}finally{b=[e,f],c=0}}return this},resolve:function(){e.resolveWith(this,arguments);return this},isResolved:function(){return!!c||!!b},cancel:function(){d=1,a=[];return this}};return e},Deferred:function(a){var b=f._Deferred(),c=f._Deferred(),d;f.extend(b,{then:function(a,c){b.done(a).fail(c);return this},always:function(){return b.done.apply(b,arguments).fail.apply(this,arguments)},fail:c.done,rejectWith:c.resolveWith,reject:c.resolve,isRejected:c.isResolved,pipe:function(a,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[c,"reject"]},function(a,c){var e=c[0],g=c[1],h;f.isFunction(e)?b[a](function(){h=e.apply(this,arguments),h&&f.isFunction(h.promise)?h.promise().then(d.resolve,d.reject):d[g+"With"](this===b?d:this,[h])}):b[a](d[g])})}).promise()},promise:function(a){if(a==null){if(d)return d;d=a={}}var c=g.length;while(c--)a[g[c]]=b[g[c]];return a}}),b.done(c.cancel).fail(b.cancel),delete b.cancel,a&&a.call(b,b);return b},when:function(a){function i(a){return function(c){b[a]=arguments.length>1?h.call(arguments,0):c,--e||g.resolveWith(g,h.call(b,0))}}var b=arguments,c=0,d=b.length,e=d,g=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred();if(d>1){for(;c<d;c++)b[c]&&f.isFunction(b[c].promise)?b[c].promise().then(i(c),g.reject):--e;e||g.resolveWith(g,b)}else g!==a&&g.resolveWith(g,d?[a]:[]);return g.promise()}}),f.support=function(){var a=c.createElement("div"),b=c.documentElement,d,e,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u;a.setAttribute("className","t"),a.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>",d=a.getElementsByTagName("*"),e=a.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};g=c.createElement("select"),h=g.appendChild(c.createElement("option")),i=a.getElementsByTagName("input")[0],k={leadingWhitespace:a.firstChild.nodeType===3,tbody:!a.getElementsByTagName("tbody").length,htmlSerialize:!!a.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55$/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,checkOn:i.value==="on",optSelected:h.selected,getSetAttribute:a.className!=="t",submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0},i.checked=!0,k.noCloneChecked=i.cloneNode(!0).checked,g.disabled=!0,k.optDisabled=!h.disabled;try{delete a.test}catch(v){k.deleteExpando=!1}!a.addEventListener&&a.attachEvent&&a.fireEvent&&(a.attachEvent("onclick",function(){k.noCloneEvent=!1}),a.cloneNode(!0).fireEvent("onclick")),i=c.createElement("input"),i.value="t",i.setAttribute("type","radio"),k.radioValue=i.value==="t",i.setAttribute("checked","checked"),a.appendChild(i),l=c.createDocumentFragment(),l.appendChild(a.firstChild),k.checkClone=l.cloneNode(!0).cloneNode(!0).lastChild.checked,a.innerHTML="",a.style.width=a.style.paddingLeft="1px",m=c.getElementsByTagName("body")[0],o=c.createElement(m?"div":"body"),p={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},m&&f.extend(p,{position:"absolute",left:"-1000px",top:"-1000px"});for(t in p)o.style[t]=p[t];o.appendChild(a),n=m||b,n.insertBefore(o,n.firstChild),k.appendChecked=i.checked,k.boxModel=a.offsetWidth===2,"zoom"in a.style&&(a.style.display="inline",a.style.zoom=1,k.inlineBlockNeedsLayout=a.offsetWidth===2,a.style.display="",a.innerHTML="<div style='width:4px;'></div>",k.shrinkWrapBlocks=a.offsetWidth!==2),a.innerHTML="<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>",q=a.getElementsByTagName("td"),u=q[0].offsetHeight===0,q[0].style.display="",q[1].style.display="none",k.reliableHiddenOffsets=u&&q[0].offsetHeight===0,a.innerHTML="",c.defaultView&&c.defaultView.getComputedStyle&&(j=c.createElement("div"),j.style.width="0",j.style.marginRight="0",a.appendChild(j),k.reliableMarginRight=(parseInt((c.defaultView.getComputedStyle(j,null)||{marginRight:0}).marginRight,10)||0)===0),o.innerHTML="",n.removeChild(o);if(a.attachEvent)for(t in{submit:1,change:1,focusin:1})s="on"+t,u=s in a,u||(a.setAttribute(s,"return;"),u=typeof a[s]=="function"),k[t+"Bubbles"]=u;o=l=g=h=m=j=a=i=null;return k}(),f.boxModel=f.support.boxModel;var i=/^(?:\{.*\}|\[.*\])$/,j=/([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!l(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g,h,i=f.expando,j=typeof c=="string",k=a.nodeType,l=k?f.cache:a,m=k?a[f.expando]:a[f.expando]&&f.expando;if((!m||e&&m&&l[m]&&!l[m][i])&&j&&d===b)return;m||(k?a[f.expando]=m=++f.uuid:m=f.expando),l[m]||(l[m]={},k||(l[m].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?l[m][i]=f.extend(l[m][i],c):l[m]=f.extend(l[m],c);g=l[m],e&&(g[i]||(g[i]={}),g=g[i]),d!==b&&(g[f.camelCase(c)]=d);if(c==="events"&&!g[c])return g[i]&&g[i].events;j?(h=g[c],h==null&&(h=g[f.camelCase(c)])):h=g;return h}},removeData:function(a,b,c){if(!!f.acceptData(a)){var d,e=f.expando,g=a.nodeType,h=g?f.cache:a,i=g?a[f.expando]:f.expando;if(!h[i])return;if(b){d=c?h[i][e]:h[i];if(d){d[b]||(b=f.camelCase(b)),delete d[b];if(!l(d))return}}if(c){delete h[i][e];if(!l(h[i]))return}var j=h[i][e];f.support.deleteExpando||!h.setInterval?delete h[i]:h[i]=null,j?(h[i]={},g||(h[i].toJSON=f.noop),h[i][e]=j):g&&(f.support.deleteExpando?delete a[f.expando]:a.removeAttribute?a.removeAttribute(f.expando):a[f.expando]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d=null;if(typeof a=="undefined"){if(this.length){d=f.data(this[0]);if(this[0].nodeType===1){var e=this[0].attributes,g;for(var h=0,i=e.length;h<i;h++)g=e[h].name,g.indexOf("data-")===0&&(g=f.camelCase(g.substring(5)),k(this[0],g,d[g]))}}return d}if(typeof a=="object")return this.each(function(){f.data(this,a)});var j=a.split(".");j[1]=j[1]?"."+j[1]:"";if(c===b){d=this.triggerHandler("getData"+j[1]+"!",[j[0]]),d===b&&this.length&&(d=f.data(this[0],a),d=k(this[0],a,d));return d===b&&j[1]?this.data(j[0]):d}return this.each(function(){var b=f(this),d=[j[0],c];b.triggerHandler("setData"+j[1]+"!",d),f.data(this,a,c),b.triggerHandler("changeData"+j[1]+"!",d)})},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,c){a&&(c=(c||"fx")+"mark",f.data(a,c,(f.data(a,c,b,!0)||0)+1,!0))},_unmark:function(a,c,d){a!==!0&&(d=c,c=a,a=!1);if(c){d=d||"fx";var e=d+"mark",g=a?0:(f.data(c,e,b,!0)||1)-1;g?f.data(c,e,g,!0):(f.removeData(c,e,!0),m(c,d,"mark"))}},queue:function(a,c,d){if(a){c=(c||"fx")+"queue";var e=f.data(a,c,b,!0);d&&(!e||f.isArray(d)?e=f.data(a,c,f.makeArray(d),!0):e.push(d));return e||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e;d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),d.call(a,function(){f.dequeue(a,b)})),c.length||(f.removeData(a,b+"queue",!0),m(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){typeof a!="string"&&(c=a,a="fx");if(c===b)return f.queue(this[0],a);return this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(){var c=this;setTimeout(function(){f.dequeue(c,b)},a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f._Deferred(),!0))h++,l.done(m);m();return d.promise()}});var n=/[\n\t\r]/g,o=/\s+/,p=/\r/g,q=/^(?:button|input)$/i,r=/^(?:button|input|object|select|textarea)$/i,s=/^a(?:rea)?$/i,t=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,u,v;f.fn.extend({attr:function(a,b){return f.access(this,a,b,!0,f.attr)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,a,b,!0,f.prop)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,g,h,i;if(f.isFunction(a))return this.each(function(b){f(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(o);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{g=" "+e.className+" ";for(h=0,i=b.length;h<i;h++)~g.indexOf(" "+b[h]+" ")||(g+=b[h]+" ");e.className=f.trim(g)}}}return this},removeClass:function(a){var c,d,e,g,h,i,j;if(f.isFunction(a))return this.each(function(b){f(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(o);for(d=0,e=this.length;d<e;d++){g=this[d];if(g.nodeType===1&&g.className)if(a){h=(" "+g.className+" ").replace(n," ");for(i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){f(this).toggleClass(a.call(this,c,this.className,b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(o);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ";for(var c=0,d=this.length;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(n," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e=this[0];if(!arguments.length){if(e){c=f.valHooks[e.nodeName.toLowerCase()]||f.valHooks[e.type];if(c&&"get"in c&&(d=c.get(e,"value"))!==b)return d;d=e.value;return typeof d=="string"?d.replace(p,""):d==null?"":d}return b}var g=f.isFunction(a);return this.each(function(d){var e=f(this),h;if(this.nodeType===1){g?h=a.call(this,d,e.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.nodeName.toLowerCase()]||f.valHooks[this.type];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c=a.selectedIndex,d=[],e=a.options,g=a.type==="select-one";if(c<0)return null;for(var h=g?c:0,i=g?c+1:e.length;h<i;h++){var j=e[h];if(j.selected&&(f.support.optDisabled?!j.disabled:j.getAttribute("disabled")===null)&&(!j.parentNode.disabled||!f.nodeName(j.parentNode,"optgroup"))){b=f(j).val();if(g)return b;d.push(b)}}if(g&&!d.length&&e.length)return f(e[c]).val();return d},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attrFix:{tabindex:"tabIndex"},attr:function(a,c,d,e){var g=a.nodeType;if(!a||g===3||g===8||g===2)return b;if(e&&c in f.attrFn)return f(a)[c](d);if(!("getAttribute"in a))return f.prop(a,c,d);var h,i,j=g!==1||!f.isXMLDoc(a);j&&(c=f.attrFix[c]||c,i=f.attrHooks[c],i||(t.test(c)?i=v:u&&(i=u)));if(d!==b){if(d===null){f.removeAttr(a,c);return b}if(i&&"set"in i&&j&&(h=i.set(a,d,c))!==b)return h;a.setAttribute(c,""+d);return d}if(i&&"get"in i&&j&&(h=i.get(a,c))!==null)return h;h=a.getAttribute(c);return h===null?b:h},removeAttr:function(a,b){var c;a.nodeType===1&&(b=f.attrFix[b]||b,f.attr(a,b,""),a.removeAttribute(b),t.test(b)&&(c=f.propFix[b]||b)in a&&(a[c]=!1))},attrHooks:{type:{set:function(a,b){if(q.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},value:{get:function(a,b){if(u&&f.nodeName(a,"button"))return u.get(a,b);return b in a?a.value:null},set:function(a,b,c){if(u&&f.nodeName(a,"button"))return u.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e=a.nodeType;if(!a||e===3||e===8||e===2)return b;var g,h,i=e!==1||!f.isXMLDoc(a);i&&(c=f.propFix[c]||c,h=f.propHooks[c]);return d!==b?h&&"set"in h&&(g=h.set(a,d,c))!==b?g:a[c]=d:h&&"get"in h&&(g=h.get(a,c))!==null?g:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):r.test(a.nodeName)||s.test(a.nodeName)&&a.href?0:b}}}}),f.attrHooks.tabIndex=f.propHooks.tabIndex,v={get:function(a,c){var d;return f.prop(a,c)===!0||(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase()));return c}},f.support.getSetAttribute||(u=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&d.nodeValue!==""?d.nodeValue:b},set:function(a,b,d){var e=a.getAttributeNode(d);e||(e=c.createAttribute(d),a.setAttributeNode(e));return e.nodeValue=b+""}},f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})})),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex);return null}})),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var w=/\.(.*)$/,x=/^(?:textarea|input|select)$/i,y=/\./g,z=/ /g,A=/[^\w\s.|`]/g,B=function(a){return a.replace(A,"\\$&")};f.event={add:function(a,c,d,e){if(a.nodeType!==3&&a.nodeType!==8){if(d===!1)d=C;else if(!d)return;var g,h;d.handler&&(g=d,d=g.handler),d.guid||(d.guid=f.guid++);var i=f._data(a);if(!i)return;var j=i.events,k=i.handle;j||(i.events=j={}),k||(i.handle=k=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.handle.apply(k.elem,arguments):b}),k.elem=a,c=c.split(" ");var l,m=0,n;while(l=c[m++]){h=g?f.extend({},g):{handler:d,data:e},l.indexOf(".")>-1?(n=l.split("."),l=n.shift(),h.namespace=n.slice(0).sort().join(".")):(n=[],h.namespace=""),h.type=l,h.guid||(h.guid=d.guid);var o=j[l],p=f.event.special[l]||{};if(!o){o=j[l]=[];if(!p.setup||p.setup.call(a,e,n,k)===!1)a.addEventListener?a.addEventListener(l,k,!1):a.attachEvent&&a.attachEvent("on"+l,k)}p.add&&(p.add.call(a,h),h.handler.guid||(h.handler.guid=d.guid)),o.push(h),f.event.global[l]=!0}a=null}},global:{},remove:function(a,c,d,e){if(a.nodeType!==3&&a.nodeType!==8){d===!1&&(d=C);var g,h,i,j,k=0,l,m,n,o,p,q,r,s=f.hasData(a)&&f._data(a),t=s&&s.events;if(!s||!t)return;c&&c.type&&(d=c.handler,c=c.type);if(!c||typeof c=="string"&&c.charAt(0)==="."){c=c||"";for(h in t)f.event.remove(a,h+c);return}c=c.split(" ");while(h=c[k++]){r=h,q=null,l=h.indexOf(".")<0,m=[],l||(m=h.split("."),h=m.shift(),n=new RegExp("(^|\\.)"+f.map(m.slice(0).sort(),B).join("\\.(?:.*\\.)?")+"(\\.|$)")),p=t[h];if(!p)continue;if(!d){for(j=0;j<p.length;j++){q=p[j];if(l||n.test(q.namespace))f.event.remove(a,r,q.handler,j),p.splice(j--,1)}continue}o=f.event.special[h]||{};for(j=e||0;j<p.length;j++){q=p[j];if(d.guid===q.guid){if(l||n.test(q.namespace))e==null&&p.splice(j--,1),o.remove&&o.remove.call(a,q);if(e!=null)break}}if(p.length===0||e!=null&&p.length===1)(!o.teardown||o.teardown.call(a,m)===!1)&&f.removeEvent(a,h,s.handle),g=null,delete 
t[h]}if(f.isEmptyObject(t)){var u=s.handle;u&&(u.elem=null),delete s.events,delete s.handle,f.isEmptyObject(s)&&f.removeData(a,b,!0)}}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){var h=c.type||c,i=[],j;h.indexOf("!")>=0&&(h=h.slice(0,-1),j=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if(!!e&&!f.event.customEvent[h]||!!f.event.global[h]){c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.exclusive=j,c.namespace=i.join("."),c.namespace_re=new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)");if(g||!e)c.preventDefault(),c.stopPropagation();if(!e){f.each(f.cache,function(){var a=f.expando,b=this[a];b&&b.events&&b.events[h]&&f.event.trigger(c,d,b.handle.elem)});return}if(e.nodeType===3||e.nodeType===8)return;c.result=b,c.target=e,d=d!=null?f.makeArray(d):[],d.unshift(c);var k=e,l=h.indexOf(":")<0?"on"+h:"";do{var m=f._data(k,"handle");c.currentTarget=k,m&&m.apply(k,d),l&&f.acceptData(k)&&k[l]&&k[l].apply(k,d)===!1&&(c.result=!1,c.preventDefault()),k=k.parentNode||k.ownerDocument||k===c.target.ownerDocument&&a}while(k&&!c.isPropagationStopped());if(!c.isDefaultPrevented()){var n,o=f.event.special[h]||{};if((!o._default||o._default.call(e.ownerDocument,c)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)){try{l&&e[h]&&(n=e[l],n&&(e[l]=null),f.event.triggered=h,e[h]())}catch(p){}n&&(e[l]=n),f.event.triggered=b}}return c.result}},handle:function(c){c=f.event.fix(c||a.event);var d=((f._data(this,"events")||{})[c.type]||[]).slice(0),e=!c.exclusive&&!c.namespace,g=Array.prototype.slice.call(arguments,0);g[0]=c,c.currentTarget=this;for(var h=0,i=d.length;h<i;h++){var j=d[h];if(e||c.namespace_re.test(j.namespace)){c.handler=j.handler,c.data=j.data,c.handleObj=j;var k=j.handler.apply(this,g);k!==b&&(c.result=k,k===!1&&(c.preventDefault(),c.stopPropagation()));if(c.isImmediatePropagationStopped())break}}return c.result},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(a){if(a[f.expando])return a;var d=a;a=f.Event(d);for(var e=this.props.length,g;e;)g=this.props[--e],a[g]=d[g];a.target||(a.target=a.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),!a.relatedTarget&&a.fromElement&&(a.relatedTarget=a.fromElement===a.target?a.toElement:a.fromElement);if(a.pageX==null&&a.clientX!=null){var h=a.target.ownerDocument||c,i=h.documentElement,j=h.body;a.pageX=a.clientX+(i&&i.scrollLeft||j&&j.scrollLeft||0)-(i&&i.clientLeft||j&&j.clientLeft||0),a.pageY=a.clientY+(i&&i.scrollTop||j&&j.scrollTop||0)-(i&&i.clientTop||j&&j.clientTop||0)}a.which==null&&(a.charCode!=null||a.keyCode!=null)&&(a.which=a.charCode!=null?a.charCode:a.keyCode),!a.metaKey&&a.ctrlKey&&(a.metaKey=a.ctrlKey),!a.which&&a.button!==b&&(a.which=a.button&1?1:a.button&2?3:a.button&4?2:0);return a},guid:1e8,proxy:f.proxy,special:{ready:{setup:f.bindReady,teardown:f.noop},live:{add:function(a){f.event.add(this,M(a.origType,a.selector),f.extend({},a,{handler:L,guid:a.handler.guid}))},remove:function(a){f.event.remove(this,M(a.origType,a.selector),a)}},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}}},f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!this.preventDefault)return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?D:C):this.type=a,b&&f.extend(this,b),this.timeStamp=f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=D;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=D;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=D,this.stopPropagation()},isDefaultPrevented:C,isPropagationStopped:C,isImmediatePropagationStopped:C};var E=function(a){var b=a.relatedTarget,c=!1,d=a.type;a.type=a.data,b!==this&&(b&&(c=f.contains(this,b)),c||(f.event.handle.apply(this,arguments),a.type=d))},F=function(a){a.type=a.data,f.event.handle.apply(this,arguments)};f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]={setup:function(c){f.event.add(this,b,c&&c.selector?F:E,a)},teardown:function(a){f.event.remove(this,b,a&&a.selector?F:E)}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(a,b){if(!f.nodeName(this,"form"))f.event.add(this,"click.specialSubmit",function(a){var b=a.target,c=f.nodeName(b,"input")||f.nodeName(b,"button")?b.type:"";(c==="submit"||c==="image")&&f(b).closest("form").length&&J("submit",this,arguments)}),f.event.add(this,"keypress.specialSubmit",function(a){var b=a.target,c=f.nodeName(b,"input")||f.nodeName(b,"button")?b.type:"";(c==="text"||c==="password")&&f(b).closest("form").length&&a.keyCode===13&&J("submit",this,arguments)});else return!1},teardown:function(a){f.event.remove(this,".specialSubmit")}});if(!f.support.changeBubbles){var G,H=function(a){var b=f.nodeName(a,"input")?a.type:"",c=a.value;b==="radio"||b==="checkbox"?c=a.checked:b==="select-multiple"?c=a.selectedIndex>-1?f.map(a.options,function(a){return a.selected}).join("-"):"":f.nodeName(a,"select")&&(c=a.selectedIndex);return c},I=function(c){var d=c.target,e,g;if(!!x.test(d.nodeName)&&!d.readOnly){e=f._data(d,"_change_data"),g=H(d),(c.type!=="focusout"||d.type!=="radio")&&f._data(d,"_change_data",g);if(e===b||g===e)return;if(e!=null||g)c.type="change",c.liveFired=b,f.event.trigger(c,arguments[1],d)}};f.event.special.change={filters:{focusout:I,beforedeactivate:I,click:function(a){var b=a.target,c=f.nodeName(b,"input")?b.type:"";(c==="radio"||c==="checkbox"||f.nodeName(b,"select"))&&I.call(this,a)},keydown:function(a){var b=a.target,c=f.nodeName(b,"input")?b.type:"";(a.keyCode===13&&!f.nodeName(b,"textarea")||a.keyCode===32&&(c==="checkbox"||c==="radio")||c==="select-multiple")&&I.call(this,a)},beforeactivate:function(a){var b=a.target;f._data(b,"_change_data",H(b))}},setup:function(a,b){if(this.type==="file")return!1;for(var c in G)f.event.add(this,c+".specialChange",G[c]);return x.test(this.nodeName)},teardown:function(a){f.event.remove(this,".specialChange");return x.test(this.nodeName)}},G=f.event.special.change.filters,G.focus=G.beforeactivate}f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){function e(a){var c=f.event.fix(a);c.type=b,c.originalEvent={},f.event.trigger(c,null,c.target),c.isDefaultPrevented()&&a.preventDefault()}var d=0;f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.each(["bind","one"],function(a,c){f.fn[c]=function(a,d,e){var g;if(typeof a=="object"){for(var h in a)this[c](h,d,a[h],e);return this}if(arguments.length===2||d===!1)e=d,d=b;c==="one"?(g=function(a){f(this).unbind(a,g);return e.apply(this,arguments)},g.guid=e.guid||f.guid++):g=e;if(a==="unload"&&c!=="one")this.one(a,d,e);else for(var i=0,j=this.length;i<j;i++)f.event.add(this[i],a,g,d);return this}}),f.fn.extend({unbind:function(a,b){if(typeof a=="object"&&!a.preventDefault)for(var c in a)this.unbind(c,a[c]);else for(var d=0,e=this.length;d<e;d++)f.event.remove(this[d],a,b);return this},delegate:function(a,b,c,d){return this.live(b,c,d,a)},undelegate:function(a,b,c){return arguments.length===0?this.unbind("live"):this.die(b,null,c,a)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f.data(this,"lastToggle"+a.guid)||0)%d;f.data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}});var K={focus:"focusin",blur:"focusout",mouseenter:"mouseover",mouseleave:"mouseout"};f.each(["live","die"],function(a,c){f.fn[c]=function(a,d,e,g){var h,i=0,j,k,l,m=g||this.selector,n=g?this:f(this.context);if(typeof a=="object"&&!a.preventDefault){for(var o in a)n[c](o,d,a[o],m);return this}if(c==="die"&&!a&&g&&g.charAt(0)==="."){n.unbind(g);return this}if(d===!1||f.isFunction(d))e=d||C,d=b;a=(a||"").split(" ");while((h=a[i++])!=null){j=w.exec(h),k="",j&&(k=j[0],h=h.replace(w,""));if(h==="hover"){a.push("mouseenter"+k,"mouseleave"+k);continue}l=h,K[h]?(a.push(K[h]+k),h=h+k):h=(K[h]||h)+k;if(c==="live")for(var p=0,q=n.length;p<q;p++)f.event.add(n[p],"live."+M(h,m),{data:d,selector:m,handler:e,origType:h,origHandler:e,preType:l});else n.unbind("live."+M(h,m),e)}return this}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.bind(b,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0)}),function(){function u(a,b,c,d,e,f){for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i){var j=!1;i=i[a];while(i){if(i.sizcache===c){j=d[i.sizset];break}if(i.nodeType===1){f||(i.sizcache=c,i.sizset=g);if(typeof b!="string"){if(i===b){j=!0;break}}else if(k.filter(b,[i]).length>0){j=i;break}}i=i[a]}d[g]=j}}}function t(a,b,c,d,e,f){for(var g=0,h=d.length;g<h;g++){var i=d[g];if(i){var j=!1;i=i[a];while(i){if(i.sizcache===c){j=d[i.sizset];break}i.nodeType===1&&!f&&(i.sizcache=c,i.sizset=g);if(i.nodeName.toLowerCase()===b){j=i;break}i=i[a]}d[g]=j}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d=0,e=Object.prototype.toString,g=!1,h=!0,i=/\\/g,j=/\W/;[0,0].sort(function(){h=!1;return 0});var k=function(b,d,f,g){f=f||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return f;var i,j,n,o,q,r,s,t,u=!0,w=k.isXML(d),x=[],y=b;do{a.exec(""),i=a.exec(y);if(i){y=i[3],x.push(i[1]);if(i[2]){o=i[3];break}}}while(i);if(x.length>1&&m.exec(b))if(x.length===2&&l.relative[x[0]])j=v(x[0]+x[1],d);else{j=l.relative[x[0]]?[d]:k(x.shift(),d);while(x.length)b=x.shift(),l.relative[b]&&(b+=x.shift()),j=v(b,j)}else{!g&&x.length>1&&d.nodeType===9&&!w&&l.match.ID.test(x[0])&&!l.match.ID.test(x[x.length-1])&&(q=k.find(x.shift(),d,w),d=q.expr?k.filter(q.expr,q.set)[0]:q.set[0]);if(d){q=g?{expr:x.pop(),set:p(g)}:k.find(x.pop(),x.length===1&&(x[0]==="~"||x[0]==="+")&&d.parentNode?d.parentNode:d,w),j=q.expr?k.filter(q.expr,q.set):q.set,x.length>0?n=p(j):u=!1;while(x.length)r=x.pop(),s=r,l.relative[r]?s=x.pop():r="",s==null&&(s=d),l.relative[r](n,s,w)}else n=x=[]}n||(n=j),n||k.error(r||b);if(e.call(n)==="[object Array]")if(!u)f.push.apply(f,n);else if(d&&d.nodeType===1)for(t=0;n[t]!=null;t++)n[t]&&(n[t]===!0||n[t].nodeType===1&&k.contains(d,n[t]))&&f.push(j[t]);else for(t=0;n[t]!=null;t++)n[t]&&n[t].nodeType===1&&f.push(j[t]);else p(n,f);o&&(k(o,h,f,g),k.uniqueSort(f));return f};k.uniqueSort=function(a){if(r){g=h,a.sort(r);if(g)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},k.matches=function(a,b){return k(a,null,null,b)},k.matchesSelector=function(a,b){return k(b,null,null,[a]).length>0},k.find=function(a,b,c){var d;if(!a)return[];for(var e=0,f=l.order.length;e<f;e++){var g,h=l.order[e];if(g=l.leftMatch[h].exec(a)){var j=g[1];g.splice(1,1);if(j.substr(j.length-1)!=="\\"){g[1]=(g[1]||"").replace(i,""),d=l.find[h](g,b,c);if(d!=null){a=a.replace(l.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},k.filter=function(a,c,d,e){var f,g,h=a,i=[],j=c,m=c&&c[0]&&k.isXML(c[0]);while(a&&c.length){for(var n in l.filter)if((f=l.leftMatch[n].exec(a))!=null&&f[2]){var o,p,q=l.filter[n],r=f[1];g=!1,f.splice(1,1);if(r.substr(r.length-1)==="\\")continue;j===i&&(i=[]);if(l.preFilter[n]){f=l.preFilter[n](f,j,d,i,e,m);if(!f)g=o=!0;else if(f===!0)continue}if(f)for(var s=0;(p=j[s])!=null;s++)if(p){o=q(p,f,s,j);var t=e^!!o;d&&o!=null?t?g=!0:j[s]=!1:t&&(i.push(p),g=!0)}if(o!==b){d||(j=i),a=a.replace(l.match[n],"");if(!g)return[];break}}if(a===h)if(g==null)k.error(a);else break;h=a}return j},k.error=function(a){throw"Syntax error, unrecognized expression: "+a};var l=k.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!j.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&k.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!j.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&k.filter(b,a,!0)}},"":function(a,b,c){var e,f=d++,g=u;typeof b=="string"&&!j.test(b)&&(b=b.toLowerCase(),e=b,g=t),g("parentNode",b,f,a,e,c)},"~":function(a,b,c){var e,f=d++,g=u;typeof b=="string"&&!j.test(b)&&(b=b.toLowerCase(),e=b,g=t),g("previousSibling",b,f,a,e,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(i,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(i,"")},TAG:function(a,b){return a[1].replace(i,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||k.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&k.error(a[0]);a[0]=d++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(i,"");!f&&l.attrMap[g]&&(a[1]=l.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(i,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=k(b[3],null,null,c);else{var g=k.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(l.match.POS.test(b[0])||l.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!k(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=l.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||k.getText([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}k.error(e)},CHILD:function(a,b){var c=b[1],d=a;switch(c){case"only":case"first":while(d=d.previousSibling)if(d.nodeType===1)return!1;if(c==="first")return!0;d=a;case"last":while(d=d.nextSibling)if(d.nodeType===1)return!1;return!0;case"nth":var e=b[2],f=b[3];if(e===1&&f===0)return!0;var g=b[0],h=a.parentNode;if(h&&(h.sizcache!==g||!a.nodeIndex)){var i=0;for(d=h.firstChild;d;d=d.nextSibling)d.nodeType===1&&(d.nodeIndex=++i);h.sizcache=g}var j=a.nodeIndex-f;return e===0?j===0:j%e===0&&j/e>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=l.attrHandle[c]?l.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=l.setFilters[e];if(f)return f(a,c,b,d)}}},m=l.match.POS,n=function(a,b){return"\\"+(b-0+1)};for(var o in l.match)l.match[o]=new RegExp(l.match[o].source+/(?![^\[]*\])(?![^\(]*\))/.source),l.leftMatch[o]=new RegExp(/(^(?:.|\r|\n)*?)/.source+l.match[o].source.replace(/\\(\d+)/g,n));var p=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(q){p=function(a,b){var c=0,d=b||[];if(e.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var f=a.length;c<f;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var r,s;c.documentElement.compareDocumentPosition?r=function(a,b){if(a===b){g=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(r=function(a,b){if(a===b){g=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],h=a.parentNode,i=b.parentNode,j=h;if(h===i)return s(a,b);if(!h)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return s(e[k],f[k]);return k===c?s(a,f[k],-1):s(e[k],b,1)},s=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),k.getText=function(a){var b="",c;for(var d=0;a[d];d++)c=a[d],c.nodeType===3||c.nodeType===4?b+=c.nodeValue:c.nodeType!==8&&(b+=k.getText(c.childNodes));return b},function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(l.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},l.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(l.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(l.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=k,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){k=function(b,e,f,g){e=e||c;if(!g&&!k.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return p(e.getElementsByTagName(b),f);if(h[2]&&l.find.CLASS&&e.getElementsByClassName)return p(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return p([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return p([],f);if(i.id===h[3])return p([i],f)}try{return p(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var m=e,n=e.getAttribute("id"),o=n||d,q=e.parentNode,r=/^\s*[+~]/.test(b);n?o=o.replace(/'/g,"\\$&"):e.setAttribute("id",o),r&&q&&(e=e.parentNode);try{if(!r||q)return p(e.querySelectorAll("[id='"+o+"'] "+b),f)}catch(s){}finally{n||m.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)k[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}k.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!k.isXML(a))try{if(e||!l.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return k(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;l.order.splice(1,0,"CLASS"),l.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?k.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?k.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:k.contains=function(){return!1},k.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var v=function(a,b){var c,d=[],e="",f=b.nodeType?[b]:b;while(c=l.match.PSEUDO.exec(a))e+=c[0],a=a.replace(l.match.PSEUDO,"");a=l.relative[a]?a+"*":a;for(var g=0,h=f.length;g<h;g++)k(a,f[g],d);return k.filter(e,d)};f.find=k,f.expr=k.selectors,f.expr[":"]=f.expr.filters,f.unique=k.uniqueSort,f.text=k.getText,f.isXMLDoc=k.isXML,f.contains=k.contains}();var N=/Until$/,O=/^(?:parents|prevUntil|prevAll)/,P=/,/,Q=/^.[^:#\[\.,]*$/,R=Array.prototype.slice,S=f.expr.match.POS,T={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(V(this,a,!1),"not",a)},filter:function(a){return this.pushStack(V(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h,i,j={},k=1;if(g&&a.length){for(d=0,e=a.length;d<e;d++)i=a[d],j[i]||(j[i]=S.test(i)?f(i,b||this.context):i);while(g&&g.ownerDocument&&g!==b){for(i in j)h=j[i],(h.jquery?h.index(g)>-1:f(g).is(h))&&c.push({selector:i,elem:g,level:k});g=g.parentNode,k++}}return c}var l=S.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(l?l.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a)return this[0]&&this[0].parentNode?this.prevAll().length:-1;if(typeof a=="string")return f.inArray(this[0],f(a));return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(U(c[0])||U(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling(a.parentNode.firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c),g=R.call(arguments);N.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!T[a]?f.unique(e):e,(this.length>1||P.test(d))&&O.test(a)&&(e=e.reverse());return this.pushStack(e,a,g.join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var W=/ jQuery\d+="(?:\d+|null)"/g,X=/^\s+/,Y=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,Z=/<([\w:]+)/,$=/<tbody/i,_=/<|&#?\w+;/,ba=/<(?:script|object|embed|option|style)/i,bb=/checked\s*(?:[^=]|=\s*.checked.)/i,bc=/\/(java|ecma)script/i,bd=/^\s*<!(?:\[CDATA\[|\-\-)/,be={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]};be.optgroup=be.option,be.tbody=be.tfoot=be.colgroup=be.caption=be.thead,be.th=be.td,f.support.htmlSerialize||(be._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){if(f.isFunction(a))return this.each(function(b){var c=f(this);c.text(a.call(this,b,c.text()))});if(typeof a!="object"&&a!==b)return this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a));return f.text(this)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){return this.each(function(){f(this).wrapAll(a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f(arguments[0]);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after",arguments);a.push.apply(a,f(arguments[0]).toArray());return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){if(a===b)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(W,""):null;if(typeof a=="string"&&!ba.test(a)&&(f.support.leadingWhitespace||!X.test(a))&&!be[(Z.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Y,"<$1></$2>");try{for(var c=0,d=this.length;c<d;c++)this[c].nodeType===1&&(f.cleanData(this[c].getElementsByTagName("*")),this[c].innerHTML=a)}catch(e){this.empty().append(a)}}else f.isFunction(a)?this.each(function(b){var c=f(this);c.html(a.call(this,b,c.html()))}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bb.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bf(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,bl)}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i;b&&b[0]&&(i=b[0].ownerDocument||b[0]),i.createDocumentFragment||(i=c),a.length===1&&typeof a[0]=="string"&&a[0].length<512&&i===c&&a[0].charAt(0)==="<"&&!ba.test(a[0])&&(f.support.checkClone||!bb.test(a[0]))&&(g=!0,h=f.fragments[a[0]],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean
(a,i,e,d)),g&&(f.fragments[a[0]]=h?e:1);return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d=a.cloneNode(!0),e,g,h;if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bh(a,d),e=bi(a),g=bi(d);for(h=0;e[h];++h)g[h]&&bh(e[h],g[h])}if(b){bg(a,d);if(c){e=bi(a),g=bi(d);for(h=0;e[h];++h)bg(e[h],g[h])}}e=g=null;return d},clean:function(a,b,d,e){var g;b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||b[0]&&b[0].ownerDocument||c);var h=[],i;for(var j=0,k;(k=a[j])!=null;j++){typeof k=="number"&&(k+="");if(!k)continue;if(typeof k=="string")if(!_.test(k))k=b.createTextNode(k);else{k=k.replace(Y,"<$1></$2>");var l=(Z.exec(k)||["",""])[1].toLowerCase(),m=be[l]||be._default,n=m[0],o=b.createElement("div");o.innerHTML=m[1]+k+m[2];while(n--)o=o.lastChild;if(!f.support.tbody){var p=$.test(k),q=l==="table"&&!p?o.firstChild&&o.firstChild.childNodes:m[1]==="<table>"&&!p?o.childNodes:[];for(i=q.length-1;i>=0;--i)f.nodeName(q[i],"tbody")&&!q[i].childNodes.length&&q[i].parentNode.removeChild(q[i])}!f.support.leadingWhitespace&&X.test(k)&&o.insertBefore(b.createTextNode(X.exec(k)[0]),o.firstChild),k=o.childNodes}var r;if(!f.support.appendChecked)if(k[0]&&typeof (r=k.length)=="number")for(i=0;i<r;i++)bk(k[i]);else bk(k);k.nodeType?h.push(k):h=f.merge(h,k)}if(d){g=function(a){return!a.type||bc.test(a.type)};for(j=0;h[j];j++)if(e&&f.nodeName(h[j],"script")&&(!h[j].type||h[j].type.toLowerCase()==="text/javascript"))e.push(h[j].parentNode?h[j].parentNode.removeChild(h[j]):h[j]);else{if(h[j].nodeType===1){var s=f.grep(h[j].getElementsByTagName("script"),g);h.splice.apply(h,[j+1,0].concat(s))}d.appendChild(h[j])}}return h},cleanData:function(a){var b,c,d=f.cache,e=f.expando,g=f.event.special,h=f.support.deleteExpando;for(var i=0,j;(j=a[i])!=null;i++){if(j.nodeName&&f.noData[j.nodeName.toLowerCase()])continue;c=j[f.expando];if(c){b=d[c]&&d[c][e];if(b&&b.events){for(var k in b.events)g[k]?f.event.remove(j,k):f.removeEvent(j,k,b.handle);b.handle&&(b.handle.elem=null)}h?delete j[f.expando]:j.removeAttribute&&j.removeAttribute(f.expando),delete d[c]}}}});var bm=/alpha\([^)]*\)/i,bn=/opacity=([^)]*)/,bo=/([A-Z]|^ms)/g,bp=/^-?\d+(?:px)?$/i,bq=/^-?\d/,br=/^([\-+])=([\-+.\de]+)/,bs={position:"absolute",visibility:"hidden",display:"block"},bt=["Left","Right"],bu=["Top","Bottom"],bv,bw,bx;f.fn.css=function(a,c){if(arguments.length===2&&c===b)return this;return f.access(this,a,c,!0,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)})},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bv(a,"opacity","opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d,h==="string"&&(g=br.exec(d))&&(d=+(g[1]+1)*+g[2]+parseFloat(f.css(a,c)),h="number");if(d==null||h==="number"&&isNaN(d))return;h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(bv)return bv(a,c)},swap:function(a,b,c){var d={};for(var e in b)d[e]=a.style[e],a.style[e]=b[e];c.call(a);for(e in b)a.style[e]=d[e]}}),f.curCSS=f.css,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){var e;if(c){if(a.offsetWidth!==0)return by(a,b,d);f.swap(a,bs,function(){e=by(a,b,d)});return e}},set:function(a,b){if(!bp.test(b))return b;b=parseFloat(b);if(b>=0)return b+"px"}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return bn.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=f.isNaN(b)?"":"alpha(opacity="+b*100+")",g=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&f.trim(g.replace(bm,""))===""){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bm.test(g)?g.replace(bm,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){var c;f.swap(a,{display:"inline-block"},function(){b?c=bv(a,"margin-right","marginRight"):c=a.style.marginRight});return c}})}),c.defaultView&&c.defaultView.getComputedStyle&&(bw=function(a,c){var d,e,g;c=c.replace(bo,"-$1").toLowerCase();if(!(e=a.ownerDocument.defaultView))return b;if(g=e.getComputedStyle(a,null))d=g.getPropertyValue(c),d===""&&!f.contains(a.ownerDocument.documentElement,a)&&(d=f.style(a,c));return d}),c.documentElement.currentStyle&&(bx=function(a,b){var c,d=a.currentStyle&&a.currentStyle[b],e=a.runtimeStyle&&a.runtimeStyle[b],f=a.style;!bp.test(d)&&bq.test(d)&&(c=f.left,e&&(a.runtimeStyle.left=a.currentStyle.left),f.left=b==="fontSize"?"1em":d||0,d=f.pixelLeft+"px",f.left=c,e&&(a.runtimeStyle.left=e));return d===""?"auto":d}),bv=bw||bx,f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)});var bz=/%20/g,bA=/\[\]$/,bB=/\r?\n/g,bC=/#.*$/,bD=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bE=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bF=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,bG=/^(?:GET|HEAD)$/,bH=/^\/\//,bI=/\?/,bJ=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bK=/^(?:select|textarea)/i,bL=/\s+/,bM=/([?&])_=[^&]*/,bN=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bO=f.fn.load,bP={},bQ={},bR,bS,bT=["*/"]+["*"];try{bR=e.href}catch(bU){bR=c.createElement("a"),bR.href="",bR=bR.href}bS=bN.exec(bR.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bO)return bO.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bJ,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bK.test(this.nodeName)||bE.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bB,"\r\n")}}):{name:b.name,value:c.replace(bB,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.bind(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?bX(a,f.ajaxSettings):(b=a,a=f.ajaxSettings),bX(a,b);return a},ajaxSettings:{url:bR,isLocal:bF.test(bS[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":bT},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:bV(bP),ajaxTransport:bV(bQ),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a>0?4:0;var o,r,u,w=c,x=l?bZ(d,v,l):b,y,z;if(a>=200&&a<300||a===304){if(d.ifModified){if(y=v.getResponseHeader("Last-Modified"))f.lastModified[k]=y;if(z=v.getResponseHeader("Etag"))f.etag[k]=z}if(a===304)w="notmodified",o=!0;else try{r=b$(d,x),w="success",o=!0}catch(A){w="parsererror",u=A}}else{u=w;if(!w||a)w="error",a<0&&(a=0)}v.status=a,v.statusText=""+(c||w),o?h.resolveWith(e,[r,w,v]):h.rejectWith(e,[v,w,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.resolveWith(e,[v,w]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f._Deferred(),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bD.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.done,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bC,"").replace(bH,bS[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bL),d.crossDomain==null&&(r=bN.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bS[1]&&r[2]==bS[2]&&(r[3]||(r[1]==="http:"?80:443))==(bS[3]||(bS[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),bW(bP,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bG.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bI.test(d.url)?"&":"?")+d.data,delete d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bM,"$1_="+x);d.url=y+(y===d.url?(bI.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", "+bT+"; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=bW(bQ,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){s<2?w(-1,z):f.error(z)}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)bY(g,a[g],c,e);return d.join("&").replace(bz,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var b_=f.now(),ca=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+b_++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=b.contentType==="application/x-www-form-urlencoded"&&typeof b.data=="string";if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(ca.test(b.url)||e&&ca.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(ca,l),b.url===j&&(e&&(k=k.replace(ca,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var cb=a.ActiveXObject?function(){for(var a in cd)cd[a](0,1)}:!1,cc=0,cd;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ce()||cf()}:ce,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,cb&&delete cd[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n),m.text=h.responseText;try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++cc,cb&&(cd||(cd={},f(a).unload(cb)),cd[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var cg={},ch,ci,cj=/^(?:toggle|show|hide)$/,ck=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,cl,cm=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],cn;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(cq("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),e===""&&f.css(d,"display")==="none"&&f._data(d,"olddisplay",cr(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(cq("hide",3),a,b,c);for(var d=0,e=this.length;d<e;d++)if(this[d].style){var g=f.css(this[d],"display");g!=="none"&&!f._data(this[d],"olddisplay")&&f._data(this[d],"olddisplay",g)}for(d=0;d<e;d++)this[d].style&&(this[d].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(cq("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return this[e.queue===!1?"each":"queue"](function(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]),h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(f.support.inlineBlockNeedsLayout?(j=cr(this.nodeName),j==="inline"?this.style.display="inline-block":(this.style.display="inline",this.style.zoom=1)):this.style.display="inline-block"))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)k=new f.fx(this,b,i),h=a[i],cj.test(h)?k[h==="toggle"?d?"show":"hide":h]():(l=ck.exec(h),m=k.cur(),l?(n=parseFloat(l[2]),o=l[3]||(f.cssNumber[i]?"":"px"),o!=="px"&&(f.style(this,i,(n||1)+o),m=(n||1)/k.cur()*m,f.style(this,i,m+o)),l[1]&&(n=(l[1]==="-="?-1:1)*n+m),k.custom(m,n,o)):k.custom(m,h,""));return!0})},stop:function(a,b){a&&this.queue([]),this.each(function(){var a=f.timers,c=a.length;b||f._unmark(!0,this);while(c--)a[c].elem===this&&(b&&a[c](!0),a.splice(c,1))}),b||this.dequeue();return this}}),f.each({slideDown:cq("show",1),slideUp:cq("hide",1),slideToggle:cq("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default,d.old=d.complete,d.complete=function(a){f.isFunction(d.old)&&d.old.call(this),d.queue!==!1?f.dequeue(this):a!==!1&&f._unmark(this)};return d},easing:{linear:function(a,b,c,d){return c+d*a},swing:function(a,b,c,d){return(-Math.cos(a*Math.PI)/2+.5)*d+c}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,b,c){function g(a){return d.step(a)}var d=this,e=f.fx;this.startTime=cn||co(),this.start=a,this.end=b,this.unit=c||this.unit||(f.cssNumber[this.prop]?"":"px"),this.now=this.start,this.pos=this.state=0,g.elem=this.elem,g()&&f.timers.push(g)&&!cl&&(cl=setInterval(e.tick,e.interval))},show:function(){this.options.orig[this.prop]=f.style(this.elem,this.prop),this.options.show=!0,this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b=cn||co(),c=!0,d=this.elem,e=this.options,g,h;if(a||b>=e.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),e.animatedProperties[this.prop]=!0;for(g in e.animatedProperties)e.animatedProperties[g]!==!0&&(c=!1);if(c){e.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){d.style["overflow"+b]=e.overflow[a]}),e.hide&&f(d).hide();if(e.hide||e.show)for(var i in e.animatedProperties)f.style(d,i,e.orig[i]);e.complete.call(d)}return!1}e.duration==Infinity?this.now=b:(h=b-this.startTime,this.state=h/e.duration,this.pos=f.easing[e.animatedProperties[this.prop]](this.state,h,0,1,e.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){for(var a=f.timers,b=0;b<a.length;++b)a[b]()||a.splice(b--,1);a.length||f.fx.stop()},interval:13,stop:function(){clearInterval(cl),cl=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=(a.prop==="width"||a.prop==="height"?Math.max(0,a.now):a.now)+a.unit:a.elem[a.prop]=a.now}}}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cs=/^t(?:able|d|h)$/i,ct=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?f.fn.offset=function(a){var b=this[0],c;if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);try{c=b.getBoundingClientRect()}catch(d){}var e=b.ownerDocument,g=e.documentElement;if(!c||!f.contains(g,b))return c?{top:c.top,left:c.left}:{top:0,left:0};var h=e.body,i=cu(e),j=g.clientTop||h.clientTop||0,k=g.clientLeft||h.clientLeft||0,l=i.pageYOffset||f.support.boxModel&&g.scrollTop||h.scrollTop,m=i.pageXOffset||f.support.boxModel&&g.scrollLeft||h.scrollLeft,n=c.top+l-j,o=c.left+m-k;return{top:n,left:o}}:f.fn.offset=function(a){var b=this[0];if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);f.offset.initialize();var c,d=b.offsetParent,e=b,g=b.ownerDocument,h=g.documentElement,i=g.body,j=g.defaultView,k=j?j.getComputedStyle(b,null):b.currentStyle,l=b.offsetTop,m=b.offsetLeft;while((b=b.parentNode)&&b!==i&&b!==h){if(f.offset.supportsFixedPosition&&k.position==="fixed")break;c=j?j.getComputedStyle(b,null):b.currentStyle,l-=b.scrollTop,m-=b.scrollLeft,b===d&&(l+=b.offsetTop,m+=b.offsetLeft,f.offset.doesNotAddBorder&&(!f.offset.doesAddBorderForTableAndCells||!cs.test(b.nodeName))&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),e=d,d=b.offsetParent),f.offset.subtractsBorderForOverflowNotVisible&&c.overflow!=="visible"&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),k=c}if(k.position==="relative"||k.position==="static")l+=i.offsetTop,m+=i.offsetLeft;f.offset.supportsFixedPosition&&k.position==="fixed"&&(l+=Math.max(h.scrollTop,i.scrollTop),m+=Math.max(h.scrollLeft,i.scrollLeft));return{top:l,left:m}},f.offset={initialize:function(){var a=c.body,b=c.createElement("div"),d,e,g,h,i=parseFloat(f.css(a,"marginTop"))||0,j="<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";f.extend(b.style,{position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"}),b.innerHTML=j,a.insertBefore(b,a.firstChild),d=b.firstChild,e=d.firstChild,h=d.nextSibling.firstChild.firstChild,this.doesNotAddBorder=e.offsetTop!==5,this.doesAddBorderForTableAndCells=h.offsetTop===5,e.style.position="fixed",e.style.top="20px",this.supportsFixedPosition=e.offsetTop===20||e.offsetTop===15,e.style.position=e.style.top="",d.style.overflow="hidden",d.style.position="relative",this.subtractsBorderForOverflowNotVisible=e.offsetTop===-5,this.doesNotIncludeMarginInBodyOffset=a.offsetTop!==i,a.removeChild(b),f.offset.initialize=f.noop},bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.offset.initialize(),f.offset.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=ct.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!ct.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each(["Left","Top"],function(a,c){var d="scroll"+c;f.fn[d]=function(c){var e,g;if(c===b){e=this[0];if(!e)return null;g=cu(e);return g?"pageXOffset"in g?g[a?"pageYOffset":"pageXOffset"]:f.support.boxModel&&g.document.documentElement[d]||g.document.body[d]:e[d]}return this.each(function(){g=cu(this),g?g.scrollTo(a?f(g).scrollLeft():c,a?c:f(g).scrollTop()):this[d]=c})}}),f.each(["Height","Width"],function(a,c){var d=c.toLowerCase();f.fn["inner"+c]=function(){var a=this[0];return a&&a.style?parseFloat(f.css(a,d,"padding")):null},f.fn["outer"+c]=function(a){var b=this[0];return b&&b.style?parseFloat(f.css(b,d,a?"margin":"border")):null},f.fn[d]=function(a){var e=this[0];if(!e)return a==null?null:this;if(f.isFunction(a))return this.each(function(b){var c=f(this);c[d](a.call(this,b,c[d]()))});if(f.isWindow(e)){var g=e.document.documentElement["client"+c],h=e.document.body;return e.document.compatMode==="CSS1Compat"&&g||h&&h["client"+c]||g}if(e.nodeType===9)return Math.max(e.documentElement["client"+c],e.body["scroll"+c],e.documentElement["scroll"+c],e.body["offset"+c],e.documentElement["offset"+c]);if(a===b){var i=f.css(e,d),j=parseFloat(i);return f.isNaN(j)?i:j}return this.css(d,typeof a=="string"?a:a+"px")}}),a.jQuery=a.$=f})(window);;
}
var q = window.jQuery;
js.JQuery = q;
q.fn.iterator = function() {
	return { pos : 0, j : this, hasNext : function() {
		return this.pos < this.j.length;
	}, next : function() {
		return $(this.j[this.pos++]);
	}};
};
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
Main.CoordinateScale = 100;
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
alphatab.rendering.ScoreBarRenderer.SHARP_KS_STEPS = [1,4,0,3,6,2,5];
alphatab.rendering.ScoreBarRenderer.FLAT_KS_STEPS = [7,4,8,5,9,6,10];
alphatab.rendering.ScoreBarRenderer.LineSpacing = 8;
alphatab.rendering.ScoreBarRenderer.NOTE_STEP_CORRECTION = 1;
alphatab.rendering.TabBarRenderer.LineSpacing = 10;
alphatab.rendering.glyphs.AccidentalGroupGlyph.NON_RESERVED = -3000;
alphatab.rendering.glyphs.DiamondNoteHeadGlyph.noteHeadHeight = 9;
alphatab.rendering.glyphs.MusicFont.ClefF = "M 545 -751c -53 49 -80 109 -80 179c 0 33 4 66 12 99c 8 33 38 57 89 74c 51 16 125 31 220 43c 95 12 159 53 192 124c 16 37 24 99 24 186c 0 95 -43 168 -130 220c -86 51 -186 77 -297 77c -128 0 -229 -28 -303 -86c -91 -70 -136 -169 -136 -297c 0 -115 23 -234 71 -356c 47 -121 118 -234 213 -337c 70 -74 163 -129 279 -164c 115 -35 233 -52 353 -52c 45 0 83 1 114 3c 31 2 81 9 151 21c 243 45 444 175 601 390c 144 198 217 409 217 632c 0 41 -2 72 -6 93c -33 281 -219 582 -558 905c -272 260 -591 493 -954 700c -330 190 -527 274 -589 254l -18 -68c 95 -33 197 -78 306 -136c 109 -57 218 -124 325 -198c 276 -198 477 -384 601 -558c 152 -210 252 -471 297 -781c 20 -128 31 -210 31 -248s 0 -68 0 -93c 0 -322 -109 -551 -328 -688c -99 -57 -200 -86 -303 -86c -78 0 -154 15 -226 46C 643 -823 586 -788 545 -751zM 2517 -733c 66 0 121 22 167 68c 45 45 68 101 68 167c 0 66 -22 121 -68 167c -45 45 -101 68 -167 68c -66 0 -122 -22 -167 -68c -45 -45 -68 -101 -68 -167c 0 -66 22 -121 68 -167C 2395 -710 2451 -733 2517 -733zM 2517 104c 66 0 121 22 167 68c 45 45 68 101 68 167c 0 66 -22 121 -68 167c -45 45 -101 68 -167 68c -66 0 -122 -22 -167 -68c -45 -45 -68 -101 -68 -167c 0 -66 22 -121 68 -167C 2395 127 2451 104 2517 104";
alphatab.rendering.glyphs.MusicFont.ClefC = "M 26 1836 V -2874 h 458 v 3659 H 26z";
alphatab.rendering.glyphs.MusicFont.RestThirtySecond = "M 717 -2145c 93 -30 174 -104 244 -220c 38 -65 65 -127 81 -185l 140 -604c -69 128 -196 191 -381 191c -50 0 -105 -7 -167 -23c -61 -15 -113 -46 -155 -92c -42 -46 -63 -108 -63 -185c 0 -65 23 -121 69 -168s 104 -69 173 -69c 65 0 123 25 173 75c 50 50 75 104 75 162c 0 31 -7 63 -23 98c -15 34 -44 63 -86 87c 23 11 48 21 75 28c 7 0 27 -3 57 -11c 73 -23 142 -80 208 -170c 57 -90 115 -180 173 -270h 40l -816 3503l -107 0l 318 -1316c -73 128 -196 192 -369 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -104 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -86 87c 46 15 71 23 74 23c 7 0 26 -3 57 -11c 92 -27 178 -108 259 -243c 11 -19 26 -50 46 -93l 161 -667c -73 128 -198 192 -375 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174s 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98s -44 65 -86 92c 23 7 46 15 69 23C 665 -2134 686 -2137 717 -2145";
alphatab.rendering.glyphs.MusicFont.RestQuarter = "M 272 -1668L 979 -850c -54 23 -137 114 -249 272c -127 177 -191 313 -191 405c 0 112 36 226 110 342c 73 115 160 206 260 272l -34 81c -23 -3 -56 -7 -101 -11c -44 -3 -76 -5 -95 -5c -104 0 -182 9 -234 28c -52 19 -88 45 -110 78c -21 32 -31 70 -31 113c 0 81 42 175 127 284c 69 88 115 137 139 145l -28 46c -27 7 -123 -61 -289 -208c -185 -162 -278 -299 -278 -411c 0 -92 35 -168 107 -226c 71 -57 159 -87 263 -87c 54 0 109 7 165 23c 55 15 110 42 165 81l -642 -829c 54 -30 120 -107 199 -229c 79 -121 139 -238 182 -350c 7 -15 11 -42 11 -81c 0 -92 -44 -210 -133 -353c -73 -115 -121 -181 -144 -197H 272";
alphatab.rendering.glyphs.MusicFont.GraceUp = "M 571 -1659h 53c 12 83 29 154 50 210c 21 56 46 105 74 145c 28 40 71 92 128 156c 56 63 102 118 138 162c 105 135 158 277 158 424c 0 151 -64 336 -193 554h -35c 16 -37 35 -82 57 -132s 40 -95 55 -136s 26 -81 35 -121s 12 -80 12 -119c 0 -62 -12 -125 -38 -188c -25 -63 -60 -121 -106 -175c -45 -53 -97 -97 -155 -130s -118 -51 -181 -55v 1245c 0 70 -21 134 -65 189c -43 55 -99 97 -167 127c -67 29 -135 44 -201 44c -64 0 -118 -16 -160 -48c -42 -32 -63 -79 -63 -140c 0 -65 21 -126 64 -181s 97 -99 163 -131c 65 -32 129 -48 191 -48c 85 0 147 16 184 50V -78782V -79359";
alphatab.rendering.glyphs.MusicFont.GraceDown = "M -17 335c 0 -69 23 -131 69 -186s 103 -98 173 -128c 69 -30 137 -45 203 -45c 133 0 203 63 211 189c 0 54 -21 110 -65 167c -43 56 -99 103 -168 139s -138 54 -208 54c -63 0 -118 -14 -164 -44v 1104c 90 -15 172 -50 244 -106s 128 -122 168 -200c 40 -78 60 -156 60 -233c -1 -91 -13 -169 -34 -233c -20 -64 -57 -155 -110 -272l 34 -13c 34 60 64 122 91 188c 27 65 48 131 64 199s 23 133 23 198c 0 96 -22 183 -68 259c -45 76 -113 166 -203 269c -89 103 -157 193 -203 271c -45 77 -68 165 -68 264h -50V -81165";
alphatab.rendering.glyphs.MusicFont.Trill = "M 159 862l 148 -431h -291l 33 -97h 288l 61 -196l 190 -136h 56l -114 332c 40 0 100 -7 181 -22c 81 -15 143 -22 187 -22c 26 0 45 5 56 15c 11 10 16 29 16 57c 0 8 -3 37 -11 86c 72 -106 155 -160 246 -160c 72 8 110 50 114 126c 0 42 -9 73 -28 92s -40 28 -64 28c -48 0 -76 -29 -84 -87c 10 -22 16 -43 16 -64c 0 -11 -9 -17 -28 -17c -78 0 -147 86 -207 260l -131 406h -185l 34 -92c -21 9 -53 26 -94 51s -77 44 -108 58s -64 20 -100 20c -50 0 -95 -13 -133 -40c -38 -27 -59 -63 -61 -107c 1 -7 3 -18 5 -32S 157 867 159 862zM 658 837l 140 -412c 0 -4 0 -9 2 -16s 2 -10 2 -11c 0 -9 -7 -13 -22 -13c -34 0 -81 7 -140 21s -104 21 -136 21l -142 423c -6 23 -12 44 -17 64c 0 27 16 44 50 50C 444 958 532 916 658 837";
alphatab.rendering.glyphs.MusicFont.ClefG = "M 1431 -3020c 95 0 186 114 272 344c 86 229 129 434 129 612c 0 243 -36 471 -108 684c -103 300 -271 545 -504 735l 108 564c 68 -15 132 -22 193 -22c 284 0 504 109 659 329c 132 185 199 410 199 675c 0 204 -65 379 -195 525c -130 145 -299 243 -506 292l 154 816c 0 45 0 77 0 96c 0 152 -54 282 -162 390s -244 181 -407 219c -26 7 -62 11 -108 11c -155 0 -294 -62 -416 -188c -121 -125 -182 -252 -182 -381c 0 -22 1 -39 5 -51c 18 -106 64 -191 136 -253c 72 -62 161 -94 267 -94c 102 0 191 34 267 102c 76 68 113 152 113 250c 0 106 -35 198 -105 276c -70 77 -160 116 -270 116c -26 0 -45 0 -56 0c 42 36 82 63 120 82c 72 36 143 54 212 54c 114 0 235 -62 362 -187c 94 -98 142 -214 142 -347c 0 -19 -1 -55 -3 -108l -138 -776c -49 11 -104 19 -165 23c -61 3 -123 5 -188 5c -339 0 -635 -123 -886 -370c -251 -247 -377 -543 -377 -889c 0 -193 87 -429 262 -706c 117 -189 285 -402 501 -638c 159 -174 254 -271 285 -290c -19 -37 -44 -142 -77 -313c -32 -171 -52 -284 -59 -339c -7 -55 -11 -111 -11 -168c 0 -235 54 -475 163 -718C 1164 -2898 1289 -3020 1431 -3020zM 1247 -79l -96 -507c -41 30 -116 104 -222 222c -106 117 -190 216 -251 296c -110 140 -194 269 -251 387c -76 155 -114 307 -114 455c 0 79 11 159 34 239c 49 167 182 326 400 478c 175 121 360 182 554 182c 53 0 96 -3 127 -11c 30 -7 80 -23 150 -46l -281 -1343c -178 22 -312 106 -403 250c -72 113 -107 237 -107 370c 0 144 80 281 240 410c 137 110 248 165 332 165l -8 39c -106 -15 -227 -70 -364 -164c -186 -132 -298 -291 -336 -477c -11 -56 -17 -111 -17 -164c 0 -185 56 -351 168 -496C 911 62 1060 -33 1247 -79zM 1684 -2256c -19 -125 -34 -201 -46 -227c -34 -76 -92 -113 -172 -113c -76 0 -157 82 -241 247c -84 165 -143 344 -178 538c -7 49 -1 156 17 322c 19 165 36 272 52 322l 132 -113c 91 -45 197 -176 315 -393c 88 -159 132 -313 132 -461C 1695 -2163 1692 -2203 1684 -2256zM 1388 275l 262 1304c 157 -37 282 -114 375 -229c 92 -115 138 -250 138 -405c 0 -30 0 -52 0 -68c -19 -177 -93 -322 -224 -433c -130 -111 -281 -167 -453 -167C 1443 275 1411 275 1388 275";
alphatab.rendering.glyphs.MusicFont.Num0 = "M 0 841c 0 -230 45 -422 135 -577c 104 -183 253 -275 448 -275c 187 0 333 91 437 275c 89 158 135 351 135 577c 0 230 -43 422 -129 577c -104 183 -252 275 -442 275c -187 0 -334 -91 -442 -275C 46 1261 0 1068 0 841zM 583 80c -100 0 -168 72 -202 218c -34 145 -51 326 -51 542c 0 270 23 464 70 583c 46 118 108 178 183 178c 93 0 162 -88 205 -264c 32 -133 48 -298 48 -496c 0 -273 -23 -468 -70 -585C 719 138 658 80 583 80";
alphatab.rendering.glyphs.MusicFont.Num1 = "M 445 1538V -9160l -216 410l -37 -32l 253 -685h 351v 1549c 0 32 27 57 81 75c 18 3 46 8 86 16v 75h -685v -70c 35 -7 62 -12 81 -16C 416 1595 445 1570 445 1538";
alphatab.rendering.glyphs.MusicFont.Num2 = "M 427 107c -93 10 -153 37 -178 81c 7 14 14 27 21 37c 68 0 115 7 140 21c 54 28 81 86 81 172c 0 61 -21 113 -64 156s -93 64 -151 64c -61 0 -113 -19 -156 -59c -43 -39 -64 -91 -64 -156c 0 -118 50 -221 151 -307c 100 -86 214 -129 340 -129c 169 0 311 36 426 108c 136 86 205 203 205 351c 0 129 -78 244 -236 345c -132 75 -263 153 -391 232c -78 61 -146 129 -204 205c -25 35 -50 73 -75 113c 110 -64 211 -97 300 -97c 64 0 130 18 198 54c 39 18 87 52 145 102c 46 39 82 59 107 59c 82 0 137 -35 166 -105c 7 -21 12 -57 16 -110h 43c 0 120 -18 216 -54 288c -54 106 -147 160 -280 160c -100 0 -206 -37 -315 -110c -109 -73 -200 -110 -272 -110c -108 0 -178 27 -210 81c -14 64 -23 102 -27 113h -70c 3 -36 8 -70 16 -102c 7 -32 27 -79 59 -140c 46 -93 151 -221 313 -383c 313 -313 469 -505 469 -577C 876 226 726 107 427 107";
alphatab.rendering.glyphs.MusicFont.Num3 = "M 414 874v -59c 21 0 47 -5 76 -16c 113 -39 193 -77 240 -113c 72 -57 109 -129 109 -216c 0 -111 -35 -204 -106 -278c -70 -73 -149 -110 -237 -110c -112 0 -194 32 -245 97c 3 18 8 34 16 48c 72 0 120 16 145 48c 25 32 37 75 37 129c 0 118 -66 178 -199 178c -57 0 -102 -16 -135 -48c -32 -32 -48 -84 -48 -156c 0 -126 44 -223 132 -291c 88 -68 231 -102 429 -102c 133 0 251 47 353 143c 102 95 153 211 153 348c 0 100 -21 177 -64 229c -43 52 -111 98 -205 137c 86 35 149 77 189 124c 54 64 81 147 81 248c 0 133 -51 247 -153 342c -102 95 -220 143 -353 143c -194 0 -336 -34 -426 -102c -90 -68 -135 -165 -135 -291c 0 -75 15 -128 45 -159c 30 -30 78 -45 143 -45c 129 0 194 59 194 178c 0 57 -12 101 -37 132c -25 30 -75 45 -151 45c 3 21 8 45 16 70c 61 46 135 70 221 70c 82 0 160 -36 232 -108c 72 -72 108 -163 108 -275c 0 -82 -36 -153 -108 -210c -54 -43 -135 -82 -243 -118L 414 874";
alphatab.rendering.glyphs.MusicFont.Num4 = "M 897 -17c -86 147 -174 296 -264 445c -90 149 -162 258 -216 326l -302 469h 448v -556l 378 -318v 874h 162v 75h -162c 0 39 0 81 2 124c 1 43 6 78 13 105c 7 27 39 53 97 78c 7 3 23 8 48 16v 75h -712v -75c 32 -10 55 -18 70 -21c 54 -21 82 -43 86 -64c 3 -18 6 -51 8 -99c 1 -48 4 -94 8 -137h -588v -75c 158 -111 279 -288 361 -529c 43 -237 88 -475 135 -712H 897";
alphatab.rendering.glyphs.MusicFont.Num5 = "M 122 -17c 10 7 63 18 159 35c 95 16 177 24 245 24c 89 0 171 -5 245 -16c 73 -10 139 -23 197 -37c 0 61 -8 112 -24 153c -16 41 -47 78 -94 110c -21 14 -62 27 -121 37c -59 10 -112 16 -159 16c -72 0 -145 -5 -221 -16c -75 -10 -117 -21 -124 -32v 475c 93 -104 197 -156 313 -156c 158 0 286 43 383 130c 97 86 145 198 145 336c 0 173 -61 325 -183 455c -122 130 -266 195 -432 195c -39 0 -68 -1 -86 -5c -86 -14 -154 -43 -205 -86c -72 -61 -108 -156 -108 -286c 0 -61 16 -109 48 -145c 32 -36 82 -54 151 -54c 136 0 205 64 205 194c 0 108 -43 169 -129 183c -25 10 -50 23 -75 37c 32 32 68 54 108 67c 39 12 79 18 118 18c 93 0 170 -45 232 -135c 61 -90 91 -219 91 -385c 0 -112 -27 -209 -81 -290c -54 -81 -127 -122 -221 -122c -118 0 -210 54 -275 162h -102V -15417";
alphatab.rendering.glyphs.MusicFont.Num6 = "M 871 155c -7 -11 -12 -22 -16 -34c -57 -52 -118 -79 -183 -79c -32 0 -63 7 -91 21c -64 36 -114 110 -148 224c -34 113 -51 227 -51 342c 0 165 19 253 59 264c 75 -108 185 -162 332 -162c 110 0 201 52 273 156c 60 89 91 190 91 302c 0 154 -47 278 -143 369c -95 91 -213 137 -353 137c -190 0 -341 -89 -450 -267c -109 -178 -164 -382 -164 -612c 0 -208 64 -399 194 -572c 129 -172 279 -259 448 -259c 158 0 273 49 345 147c 50 69 75 148 75 239c 0 54 -19 103 -59 147c -39 43 -79 65 -118 65c -68 0 -122 -16 -162 -48c -39 -32 -59 -86 -59 -162c 0 -68 21 -121 64 -159C 795 180 835 159 871 155zM 849 1241c 0 -129 -9 -221 -27 -275c -32 -93 -91 -140 -178 -140c -82 0 -137 38 -164 116c -27 77 -40 177 -40 299c 0 108 14 199 43 275c 28 75 82 113 162 113c 72 0 124 -39 156 -118C 833 1432 849 1342 849 1241";
alphatab.rendering.glyphs.MusicFont.Num7 = "M 313 1700c 10 -86 23 -172 37 -259c 43 -172 118 -313 226 -421c 122 -118 217 -221 286 -307c 90 -111 142 -201 156 -270l 27 -124c -46 30 -96 56 -148 79c -52 22 -103 34 -153 34c -93 0 -206 -40 -340 -122c -64 -40 -120 -61 -167 -61c -57 0 -98 17 -121 51c -23 34 -42 65 -56 94h -64v -356h 54c 7 21 16 44 27 67c 10 23 30 35 59 35c 25 0 62 -16 113 -48c 108 -72 185 -108 232 -108c 75 0 149 26 221 78c 72 52 140 78 205 78c 46 0 82 -22 108 -67c 10 -18 19 -48 27 -89h 70v 340c 0 107 -17 206 -52 295c -10 25 -87 159 -231 403c -35 64 -60 142 -76 234c -15 91 -23 178 -23 260c 0 114 0 175 0 182H 313";
alphatab.rendering.glyphs.MusicFont.Num8 = "M 795 755c 57 18 126 77 205 178c 64 79 97 151 97 216c 0 183 -57 324 -172 421c -97 82 -214 124 -351 124c -151 0 -276 -49 -375 -148c -99 -99 -148 -231 -148 -396c 0 -68 34 -138 102 -210c 50 -54 106 -93 167 -118c -72 -39 -127 -94 -167 -164c -39 -70 -59 -144 -59 -224c 0 -136 48 -244 145 -324c 97 -79 208 -118 334 -118c 133 0 245 40 337 121s 137 195 137 342c 0 57 -32 120 -97 189C 901 695 849 733 795 755zM 389 890c -57 28 -102 61 -135 97c -46 54 -70 118 -70 194c 0 108 35 204 106 288c 71 84 165 126 282 126c 106 0 185 -24 238 -72s 79 -103 79 -164c 0 -39 -26 -88 -80 -145c -53 -57 -112 -106 -176 -145c -64 -39 -124 -81 -179 -124C 437 929 415 911 389 890zM 708 685c 46 -18 89 -53 126 -105c 37 -52 56 -107 56 -164c 0 -100 -28 -183 -86 -248c -57 -64 -136 -97 -237 -97c -79 0 -145 26 -197 78c -52 52 -78 112 -78 180c 0 36 25 75 75 118c 25 21 72 54 143 97c 70 43 121 77 153 102C 676 658 690 670 708 685";
alphatab.rendering.glyphs.MusicFont.Num9 = "M 333 1532c 3 10 9 21 16 32c 57 50 118 75 183 75c 32 0 62 -7 91 -21c 68 -36 117 -107 148 -213c 30 -106 45 -222 45 -348c 0 -169 -18 -259 -54 -270c -75 111 -185 167 -329 167c -111 0 -200 -48 -267 -146c -66 -97 -99 -202 -99 -315c 0 -155 47 -279 143 -372c 95 -92 215 -138 359 -138c 190 0 343 93 459 280c 100 165 151 365 151 599c 0 208 -64 399 -194 572s -279 259 -448 259c -158 0 -273 -48 -345 -145c -50 -68 -75 -147 -75 -237c 0 -54 19 -102 59 -145c 39 -43 86 -64 140 -64c 61 0 109 16 145 48c 35 32 54 86 54 162c 0 68 -25 124 -75 167C 405 1511 369 1529 333 1532zM 354 444c 0 130 8 222 27 277c 32 94 89 141 172 141c 82 0 138 -40 167 -122c 28 -81 43 -180 43 -296c 0 -112 -12 -199 -37 -261c -36 -86 -93 -130 -172 -130c -75 0 -127 38 -156 114C 369 243 354 336 354 444";
alphatab.rendering.glyphs.MusicFont.RestSixteenth = "M 494 -1225c 76 -27 149 -91 218 -191c 23 -31 51 -81 86 -151l 161 -667c -73 128 -198 192 -374 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174s 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98s -44 65 -86 92c 19 7 40 15 63 23c 15 0 38 -5 69 -17c 73 -23 140 -79 202 -167c 61 -88 121 -177 179 -267h 40l -602 2586l -106 0l 318 -1316c -73 128 -196 192 -369 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -104 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 170 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -86 87c 45 15 72 23 80 23C 465 -1219 482 -1221 494 -1225";
alphatab.rendering.glyphs.MusicFont.RestEighth = "M 247 -1675c 65 0 123 25 173 75c 50 50 75 104 75 162c 0 27 -9 60 -28 98c -19 38 -48 69 -86 92c 23 7 46 15 69 23c 15 0 38 -5 69 -17c 88 -31 175 -113 260 -246c 38 -62 77 -125 115 -188h 40l -382 1670l -112 0l 331 -1316c -73 128 -198 191 -375 191c -19 0 -38 0 -57 0c -27 -3 -69 -13 -127 -28c -57 -15 -106 -46 -147 -92c -40 -46 -60 -106 -60 -179c 0 -69 23 -127 69 -174S 178 -1675 247 -1675";
alphatab.rendering.glyphs.MusicFont.RestWhole = "M 1046 445H -25v -458h 1071V -40055";
alphatab.rendering.glyphs.MusicFont.NoteWhole = "M 0 437c 0 -109 40 -197 121 -265s 177 -115 290 -143s 216 -41 312 -41c 104 0 213 13 328 41s 214 74 298 141s 128 156 133 266c 0 110 -40 199 -121 268s -177 117 -290 145s -219 43 -319 43c -107 0 -218 -13 -332 -41s -211 -75 -293 -144S 2 550 0 437zM 450 361c 7 133 46 243 118 330s 158 130 259 130c 77 -8 131 -34 161 -77s 44 -117 44 -224c -10 -137 -51 -248 -123 -333s -159 -127 -262 -127c -72 11 -123 37 -152 78S 450 253 450 361";
alphatab.rendering.glyphs.MusicFont.NoteQuarter = "M 658 800c -108 65 -216 98 -324 98c -119 0 -216 -42 -289 -127c -54 -57 -81 -129 -81 -214c 0 -92 29 -183 89 -272c 59 -88 136 -158 228 -208c 111 -69 223 -104 335 -104c 108 0 200 36 278 110c 57 57 86 131 86 220c 0 92 -31 185 -92 278C 827 673 750 746 658 800";
alphatab.rendering.glyphs.MusicFont.NoteHalf = "M 669 818c -108 65 -216 98 -324 98c -119 0 -216 -42 -290 -127c -54 -57 -81 -129 -81 -214c 0 -92 29 -183 89 -272c 59 -88 136 -158 229 -208c 112 -69 224 -104 336 -104c 108 0 200 36 278 110c 57 57 87 131 87 220c 0 92 -31 185 -92 278C 839 691 762 764 669 818zM 95 754c 19 23 57 34 115 34c 65 0 132 -13 200 -40c 67 -27 134 -64 200 -113c 65 -48 127 -118 185 -208s 87 -169 87 -234c 0 -23 -5 -44 -17 -63c -11 -15 -34 -23 -69 -23c -46 0 -113 18 -200 55c -87 36 -164 77 -231 121c -67 44 -133 110 -197 197s -95 159 -95 217C 72 720 79 739 95 754";
alphatab.rendering.glyphs.MusicFont.NoteDead = "M 482 345c 42 -15 70 -38 84 -69c 13 -30 20 -102 20 -214c 0 -30 0 -50 0 -57c 0 -3 0 -7 0 -11h 307v 313c -31 0 -54 0 -69 0c -38 0 -77 1 -115 2c -38 2 -72 8 -101 20c -28 11 -51 38 -66 81v 81c 15 42 38 70 69 84c 30 13 102 20 214 20c 30 0 50 0 57 0c 3 0 7 0 11 0v 313h -307c 0 -31 0 -54 0 -69c 0 -38 -1 -77 -2 -115c -2 -38 -8 -72 -20 -101c -11 -28 -38 -51 -81 -66h -104c -42 15 -70 38 -84 69c -13 30 -20 102 -20 214c 0 30 0 50 0 57c 0 3 0 7 0 11h -307V -47355c 30 0 54 0 69 0c 38 0 77 -1 115 -2c 38 -2 72 -8 101 -20c 28 -11 51 -38 66 -81v -81c -15 -42 -38 -70 -69 -84c -31 -13 -102 -20 -214 -20c -31 0 -50 0 -57 0c -3 0 -7 0 -11 0v -313h 307c 0 31 0 54 0 69c 0 38 0 77 2 115c 1 38 8 72 20 101c 11 28 38 51 81 66H 482";
alphatab.rendering.glyphs.MusicFont.NoteHarmonic = "M -34 453l 452 -452c 108 131 197 220 266 266l 261 202l -446 452c -38 -46 -81 -90 -127 -133c -46 -42 -90 -85 -133 -127c -42 -42 -98 -89 -168 -139C 32 496 -3 472 -34 453";
alphatab.rendering.glyphs.MusicFont.NoteRideCymbal = "M 910 417l -441 433c -42 -77 -103 -156 -183 -237c -103 -104 -206 -181 -309 -231l 435 -428c 49 78 128 166 235 263C 753 315 841 382 910 417zM 469 746l 336 -329c -50 -31 -119 -87 -206 -168c -87 -81 -150 -149 -188 -203l -330 337c 81 42 160 102 237 179C 384 627 434 688 469 746";
alphatab.rendering.glyphs.MusicFont.NoteHiHat = "M 934 446c 0 129 -44 238 -133 326c -88 88 -197 133 -326 133c -131 0 -242 -43 -332 -131s -134 -197 -134 -328c 0 -129 45 -238 134 -328c 89 -89 200 -134 332 -134c 129 0 238 44 326 133C 889 204 934 314 934 446zM 162 723L 438 450l -279 -281c -70 75 -105 167 -105 275C 52 550 89 643 162 723zM 193 138l 274 276l 276 -280c -77 -73 -167 -110 -271 -110C 365 24 272 62 193 138zM 744 757l -276 -272l -272 270c 83 72 176 108 278 108c 53 0 101 -8 143 -26C 658 819 701 793 744 757zM 778 165l -281 284l 277 273c 76 -76 114 -169 114 -279C 888 337 852 244 778 165";
alphatab.rendering.glyphs.MusicFont.Unused = "M 425 25C 293 25 183 72 93 162C 3 252 -41 362 -41 493C -41 624 3 734 93 825C 183 915 293 962 425 962C 556 962 669 915 759 825C 849 734 893 624 893 493C 893 362 849 252 759 162C 669 72 556 25 425 25zM 425 75C 531 75 625 111 703 181L 115 768C 45 690 6 600 6 493C 6 378 49 282 131 200C 213 118 310 75 425 75zM 737 215C 808 294 843 386 843 493C 843 608 803 705 721 787C 639 869 539 912 425 912C 317 912 225 875 146 803L 737 215z";
alphatab.rendering.glyphs.MusicFont.NoteChineseCymbal = "M 503 -450l 577 579l -64 66l -516 -514l -512 512l -68 -64L 503 -450zM 499 601l 316 314l 145 -143l -314 -316l 316 -312l -141 -141l -317 319l -317 -323l -136 136l 319 319l -326 326l 140 140L 499 601";
alphatab.rendering.glyphs.MusicFont.FooterEighth = "M 9 1032V -56959h 87c 20 137 48 252 83 345s 75 172 122 238s 116 151 209 255s 168 193 225 265c 172 221 259 453 259 695c 0 248 -105 550 -317 907h -57c 27 -62 58 -134 94 -216s 65 -156 90 -223s 43 -133 57 -199s 21 -131 21 -196c 0 -102 -20 -204 -62 -308s -99 -199 -174 -287s -159 -159 -254 -213s -194 -84 -296 -90v 68H 9";
alphatab.rendering.glyphs.MusicFont.FooterSixteenth = "M 943 1912c 62 135 94 280 94 435c 0 202 -61 404 -183 605h -57c 108 -233 162 -430 162 -590c 0 -117 -26 -220 -78 -309c -52 -89 -118 -166 -198 -230c -80 -64 -187 -137 -322 -220s -220 -136 -257 -161v 72h -86V -58492h 86c 6 108 28 200 65 276s 74 133 111 170s 109 106 218 206s 190 184 245 252c 87 109 151 216 191 319s 60 212 60 328C 994 1648 977 1764 943 1912zM 897 1815c 0 -17 0 -41 1 -72s 1 -53 1 -68c 0 -369 -266 -701 -798 -996c 3 120 31 229 83 327s 130 199 233 303s 195 195 276 273C 776 1659 843 1737 897 1815";
alphatab.rendering.glyphs.MusicFont.FooterThirtySecond = "M 14 1990V -60390h 87c 11 121 35 216 70 283c 35 66 89 134 161 202c 72 68 174 164 307 288c 235 226 353 494 353 802c 0 106 -14 211 -43 317c 29 90 43 186 43 287c 0 79 -12 171 -36 274c 57 73 86 191 86 352c 0 112 -15 226 -46 342s -76 218 -137 308h -57c 108 -223 162 -418 162 -582c 0 -104 -20 -199 -62 -284s -99 -163 -172 -232c -73 -69 -153 -133 -239 -192s -215 -142 -389 -251v 64H 14zM 108 1292c 7 113 39 215 96 305c 56 89 129 176 218 259s 179 168 273 257c 93 88 160 168 199 240c 2 -19 3 -48 3 -87C 900 1904 636 1579 108 1292zM 115 666c 0 106 23 197 71 272s 129 166 247 274s 209 197 276 268s 129 168 187 288c 7 -42 10 -83 10 -122c 0 -146 -40 -280 -120 -401c -80 -121 -171 -221 -273 -300C 411 867 278 774 115 666";
alphatab.rendering.glyphs.MusicFont.FooterSixtyFourth = "M 21 2851V -62136v -554h 86c 0 140 32 254 98 342c 65 87 173 200 322 339s 261 271 336 400s 113 292 113 490c 0 96 -12 208 -36 338c 43 83 65 188 65 316c 0 122 -21 237 -65 345c 48 109 72 223 72 342c 0 117 -24 222 -72 316c 57 85 86 205 86 360c 0 218 -53 443 -161 673h -65c 98 -280 147 -498 147 -652c 0 -115 -22 -210 -65 -284s -93 -130 -149 -170c -56 -39 -153 -100 -291 -183s -247 -156 -327 -221l 0 87L 21 2851zM 107 2001c 0 121 29 233 89 336s 138 203 236 301s 192 190 280 278c 88 87 149 166 181 235c 11 -60 17 -112 17 -155c 0 -212 -81 -405 -244 -578C 505 2246 318 2106 107 2001zM 114 668c 0 119 22 219 68 300s 127 176 245 286c 118 109 208 198 272 265c 63 66 128 163 195 290c 7 -46 10 -90 10 -133c 0 -166 -41 -313 -124 -439s -177 -229 -281 -308C 395 848 267 762 114 668zM 114 1338c 0 123 24 226 73 309s 133 176 252 282s 211 193 278 263s 128 164 183 283c 9 -45 14 -94 14 -147c 0 -138 -39 -270 -116 -395s -177 -236 -297 -334S 252 1413 114 1338";
alphatab.rendering.glyphs.MusicFont.SimileMark = "M 413 1804l -446 3l 1804 -1806l 449 -3L 413 1804zM 331 434c 0 -53 20 -100 62 -142c 41 -41 91 -62 148 -62s 104 19 142 56c 38 38 56 87 56 148c 0 56 -19 105 -59 145c -39 39 -88 59 -145 59c -56 0 -105 -19 -145 -59C 351 540 331 491 331 434zM 1437 1380c 0 -56 18 -104 56 -142c 37 -37 87 -56 148 -56c 56 0 104 19 142 56c 38 38 56 85 56 142c 0 56 -19 104 -56 142c -38 38 -87 56 -148 56c -56 0 -104 -19 -142 -56C 1456 1485 1437 1437 1437 1380";
alphatab.rendering.glyphs.MusicFont.SimileMark2 = "M 414 1818l -446 3l 1809 -1809l 449 -6L 414 1818zM 340 439c 0 -56 18 -104 56 -142c 37 -37 87 -56 148 -56c 56 0 105 20 145 59c 39 39 59 88 59 145c 0 56 -19 104 -56 142c -38 38 -89 56 -153 56c -56 0 -104 -18 -142 -56C 359 549 340 500 340 439zM 1152 1815l -446 3l 1812 -1812l 446 -3L 1152 1815zM 2192 1391c 0 -56 18 -104 56 -142c 38 -37 87 -56 148 -56c 56 0 104 19 142 56c 37 38 56 85 56 142c 0 56 -19 104 -56 142c -38 38 -87 56 -148 56c -56 0 -104 -19 -142 -56C 2211 1495 2192 1448 2192 1391";
alphatab.rendering.glyphs.MusicFont.Coda = "M 697 1689v 299h -72v -299c -189 0 -349 -81 -478 -244c -129 -163 -193 -349 -193 -558h -248v -73h 248c 0 -216 63 -409 189 -581c 126 -171 287 -257 481 -257v -248h 72v 248c 189 0 345 84 467 254s 182 364 182 585h 284v 73h -284c 0 209 -60 395 -182 558C 1042 1608 887 1689 697 1689zM 624 813v -737c -126 14 -208 88 -244 222c -36 133 -54 305 -54 514H 624zM 324 886c 0 262 25 445 76 547s 125 158 222 167v -715H 324zM 697 813h 292c 0 -221 -12 -378 -36 -471c -43 -166 -129 -257 -255 -272V -73687zM 989 886h -292v 715c 97 -9 170 -64 219 -164C 964 1338 989 1154 989 886";
alphatab.rendering.glyphs.MusicFont.Segno = "M 604 1150c -182 -112 -324 -222 -425 -329c -126 -131 -189 -256 -189 -372c 0 -116 42 -218 128 -306c 85 -87 194 -131 327 -131c 98 0 196 32 294 97c 98 64 147 141 147 229c 0 56 -9 104 -28 142c -18 38 -50 56 -94 56c -100 0 -155 -46 -164 -137c 0 -18 8 -45 25 -80c 17 -34 21 -63 11 -85c -22 -69 -86 -104 -192 -104c -67 0 -123 20 -168 61c -44 40 -67 84 -67 131c 0 135 64 248 193 339c 25 18 155 88 392 207l 571 -843l 148 0l -611 900c 196 121 334 223 415 304c 118 118 177 245 177 379c 0 112 -43 214 -130 304c -86 90 -193 136 -320 136c -102 0 -202 -34 -300 -102c -97 -68 -146 -152 -146 -251c 0 -37 13 -79 40 -125c 27 -46 57 -69 93 -69c 47 0 82 12 105 38c 22 25 38 65 47 120c 6 22 0 51 -16 87c -17 36 -22 65 -16 87c 9 31 35 56 78 75c 42 18 91 28 147 28c 58 0 105 -21 142 -65c 36 -43 55 -89 55 -139c 0 -139 -89 -263 -269 -371c -133 -68 -232 -117 -297 -148l -544 810l -152 -1L 604 1150zM 201 1091c 34 0 64 11 89 32s 37 51 37 89c 0 34 -12 64 -37 89c -25 25 -54 37 -89 37c -34 0 -64 -12 -89 -37c -25 -25 -37 -54 -37 -89C 74 1131 116 1091 201 1091zM 1291 696c 34 0 64 12 89 37c 25 25 37 54 37 89c 0 31 -12 59 -37 84c -25 25 -54 37 -89 37s -63 -11 -86 -35s -35 -52 -35 -87c 0 -34 10 -64 32 -89C 1224 708 1253 696 1291 696";
alphatab.rendering.glyphs.MusicFont.OttavaAbove = "M 488 562c 78 9 147 45 206 110c 59 64 88 138 88 222c 0 95 -39 171 -118 227c -78 55 -175 83 -290 83c -112 0 -208 -28 -288 -85c -80 -56 -120 -134 -120 -233c 0 -41 5 -77 15 -107c 10 -29 29 -61 56 -94c 27 -32 77 -62 149 -89c 12 -3 28 -7 49 -13c -69 -12 -127 -48 -172 -107c -45 -59 -68 -123 -68 -190c 0 -88 37 -161 113 -217s 158 -84 249 -84c 96 0 185 29 265 87c 80 58 120 131 120 220c 0 73 -22 134 -68 183c -24 24 -62 47 -113 68C 547 545 521 553 488 562zM 279 588c -66 21 -118 57 -156 108c -37 51 -56 112 -56 181c 0 72 27 141 83 206c 56 65 130 97 224 97c 90 0 166 -36 226 -108c 51 -60 77 -124 77 -190c 0 -54 -21 -101 -63 -140c -30 -27 -68 -49 -113 -68L 279 588zM 460 547c 130 -39 195 -127 195 -263c 0 -66 -25 -129 -77 -188c -51 -59 -122 -88 -213 -88c -87 0 -155 28 -202 86c -47 57 -70 119 -70 186c 0 36 14 72 43 108c 28 36 68 63 120 81L 460 547zM 842 311l -13 -9l 68 -58c 24 -21 51 -28 81 -22c 27 3 40 24 40 63c 0 36 -15 100 -47 192c -31 92 -47 149 -47 170c 0 33 13 46 40 40c 42 -3 94 -47 156 -133c 61 -86 93 -156 93 -211c 0 -12 -7 -22 -22 -31c -18 -9 -28 -16 -31 -22c -15 -30 -7 -49 22 -59c 30 -12 52 9 68 63c 18 75 -12 167 -93 274c -80 107 -147 161 -201 161c -57 0 -86 -24 -86 -72c 0 -18 4 -37 13 -59c 9 -21 23 -65 43 -133c 19 -68 29 -120 29 -156c 0 -15 -1 -25 -4 -31c -9 -18 -24 -19 -45 -4L 842 311zM 1636 683l 81 -68l -72 83c -18 19 -36 29 -54 29c -15 0 -21 -15 -18 -45l 40 -167c -3 21 -28 59 -77 113c -57 66 -109 99 -154 99c -66 0 -99 -39 -99 -118c 0 -78 28 -159 86 -242c 57 -83 122 -124 195 -124c 39 0 74 15 104 45l 9 -45h 31l -95 407c -6 18 -7 30 -4 36S 1621 692 1636 683zM 1382 683c 51 0 107 -37 167 -111c 18 -24 43 -63 77 -115l 31 -134c -33 -34 -66 -51 -99 -51c -54 0 -105 40 -152 120c -46 80 -70 154 -70 222C 1336 660 1351 683 1382 683";
alphatab.rendering.glyphs.MusicFont.OttavaBelow = "M 469 529c 75 6 143 41 202 107c 59 65 88 141 88 229c 0 97 -39 173 -118 229c -78 56 -175 84 -290 84c -112 0 -208 -28 -288 -86c -80 -57 -120 -136 -120 -236c 0 -33 6 -68 18 -104c 12 -36 31 -69 56 -97s 65 -55 120 -79c 18 -6 43 -15 77 -27c -69 -12 -126 -47 -170 -104s -65 -121 -65 -191c 0 -85 37 -156 113 -214c 75 -57 157 -86 245 -86c 93 0 182 28 265 86c 83 57 124 130 124 218c 0 72 -22 133 -68 182c -24 24 -62 47 -113 68C 528 512 502 520 469 529zM 251 563c -66 21 -118 57 -154 108c -36 51 -54 112 -54 181c 0 72 27 141 84 206c 55 65 130 97 224 97c 93 0 169 -36 226 -108c 48 -60 72 -124 72 -190c 0 -51 -21 -98 -63 -140c -30 -30 -66 -52 -108 -68L 251 563zM 432 522c 130 -39 195 -128 195 -265c 0 -67 -25 -130 -77 -189c -51 -59 -121 -89 -208 -89c -87 0 -155 29 -202 89c -47 59 -70 119 -70 180c 0 36 13 74 40 112s 66 66 118 84L 432 522zM 827 268h -13l 63 -45c 24 -27 52 -39 86 -36c 24 3 36 23 36 60c 0 34 -15 98 -45 191c -30 93 -45 154 -45 182c 0 34 13 49 40 46c 42 -3 94 -49 156 -138c 61 -89 93 -161 93 -218c 0 -12 -10 -25 -31 -37c -15 -6 -22 -12 -22 -18c -15 -30 -9 -50 18 -59c 33 -12 57 9 72 64c 18 76 -12 168 -93 277c -80 108 -146 162 -197 162c -63 0 -95 -28 -95 -84c 0 -8 3 -22 9 -40c 18 -47 35 -102 52 -164c 16 -62 24 -105 24 -129c 0 -17 -3 -29 -9 -35c -6 -6 -18 -4 -36 4L 827 268zM 1413 -13l -72 -9c 23 6 53 1 89 -15c 11 -3 30 -15 53 -35l -131 444c 30 -45 64 -81 102 -108c 38 -27 76 -40 116 -40c 39 0 68 11 86 34c 18 22 27 55 27 98c 0 79 -30 156 -90 231c -60 74 -137 112 -231 112c -30 0 -57 -8 -81 -24c -24 -16 -33 -36 -27 -62L 1413 -13zM 1294 635c 15 21 42 32 81 32c 78 0 146 -42 204 -128c 48 -73 72 -145 72 -215c 0 -30 -7 -50 -22 -59c -18 -9 -36 -13 -54 -13c -36 0 -77 17 -122 52c -45 35 -81 77 -108 126L 1294 635";
alphatab.rendering.glyphs.MusicFont.QuindicesimaAbove = "M 245 985V -81930v -72c -9 -8 -30 -13 -61 -13c -25 0 -42 1 -52 4l -99 31l -4 -22l 317 -190v 980c 0 39 6 68 20 88c 13 19 31 34 52 43l 145 40v 9h -531l -4 -18l 149 -40c 24 -9 42 -24 54 -45C 241 1050 245 1024 245 985zM 685 338c 60 15 105 27 136 36c 96 27 167 53 213 77c 175 87 263 192 263 313c 0 72 -15 140 -47 204s -70 111 -115 142c -45 31 -87 53 -124 65c -37 12 -94 18 -170 18c -66 0 -128 -13 -186 -40c -57 -27 -86 -63 -86 -108c 0 -24 16 -36 49 -36c 18 0 41 5 70 15c 28 10 61 35 97 74c 36 39 69 59 99 59c 96 0 170 -39 222 -118c 42 -63 63 -131 63 -204c 0 -57 -18 -108 -56 -152c -37 -43 -79 -77 -124 -102c -45 -24 -125 -54 -240 -90c -36 -12 -87 -27 -154 -45l 154 -426h 426c 36 0 65 -4 86 -13l 45 -34l 22 -29h 9l -127 195h -449L 685 338zM 1806 561h -59l 145 -367c 0 -18 0 -30 0 -36c -6 -27 -21 -42 -45 -45c -24 -3 -51 13 -81 50c -3 6 -9 16 -18 31l -145 367h -68l 154 -379c -3 -15 -4 -26 -4 -32c -6 -21 -18 -34 -36 -37c -45 -6 -98 34 -158 121c -9 12 -21 34 -36 65h -18c 30 -47 54 -83 72 -106c 57 -71 111 -106 163 -106c 18 2 34 14 50 34c 2 5 9 17 18 34c 9 -17 16 -28 22 -34c 24 -22 60 -34 108 -34c 18 0 33 11 45 34c 2 5 7 18 13 38c 18 -21 31 -34 40 -40c 36 -27 74 -37 113 -31c 30 6 49 24 59 54c 3 9 6 25 9 49l -122 304c -3 15 -4 25 -4 31c 0 9 6 13 18 13c 18 0 39 -17 63 -52c 6 -11 16 -28 31 -52l 13 4c -15 29 -27 49 -36 61c -30 43 -56 65 -77 65c -51 0 -71 -20 -59 -62l 122 -306c 0 -17 0 -29 0 -35c -6 -23 -22 -35 -49 -35s -51 10 -72 31c -6 6 -15 18 -27 36L 1806 561zM 2555 525l 77 -63l -72 73c -18 17 -36 26 -54 26c -15 0 -21 -12 -18 -36l 40 -158c -6 31 -43 78 -113 138c -45 40 -84 60 -118 60c -66 0 -99 -38 -99 -114c 0 -79 28 -158 86 -235c 57 -77 122 -116 195 -116c 24 0 48 5 72 16c 6 2 16 9 31 20l 9 -36h 31l -95 395c -6 18 -7 30 -4 35C 2526 535 2537 534 2555 525zM 2292 525c 51 0 108 -35 172 -107c 21 -23 46 -61 77 -112l 27 -134c -30 -29 -63 -44 -99 -44c -54 0 -105 38 -152 116c -46 77 -70 149 -70 215C 2246 502 2262 525 2292 525";
alphatab.rendering.glyphs.MusicFont.QuindicesimaBelow = "M 2400 -200C 2376 -180 2358 -170 2346 -166C 2310 -150 2280 -144 2256 -150L 2328 -141L 2168 484C 2162 509 2172 530 2196 546C 2221 562 2247 571 2278 571C 2371 571 2448 534 2509 459C 2569 384 2600 307 2600 228C 2600 185 2590 151 2571 128C 2553 105 2526 93 2487 93C 2448 93 2409 107 2371 134C 2333 161 2299 198 2268 243L 2400 -200zM 1300 -57L 1278 -29L 1234 6C 1213 15 1183 21 1146 21L 721 21L 565 446C 632 464 685 481 721 493C 836 530 913 560 959 584C 1004 608 1046 640 1084 684C 1122 728 1143 780 1143 837C 1143 910 1120 980 1078 1043C 1026 1122 953 1159 856 1159C 825 1159 792 1139 756 1100C 719 1060 687 1035 659 1025C 630 1014 605 1009 587 1009C 554 1009 537 1022 537 1046C 537 1092 567 1129 625 1156C 682 1183 742 1196 809 1196C 884 1196 943 1190 981 1178C 1018 1166 1060 1144 1106 1112C 1151 1080 1190 1032 1221 968C 1253 905 1268 838 1268 765C 1268 644 1181 540 1006 453C 960 429 890 402 793 375C 763 365 716 352 656 337L 734 140L 1184 140L 1309 -57L 1300 -57zM 315 6L 0 196L 3 221L 103 190C 112 187 130 184 156 184C 187 184 206 187 215 196L 215 268L 215 984C 215 1023 212 1050 203 1065C 191 1086 171 1100 146 1109L 0 1150L 3 1168L 534 1168L 534 1159L 387 1118C 366 1109 351 1094 337 1075C 323 1055 315 1026 315 987L 315 6zM 1640 84C 1589 84 1535 119 1478 190C 1459 214 1436 249 1406 296L 1425 296C 1440 265 1450 246 1459 234C 1519 147 1573 106 1618 112C 1636 115 1650 128 1656 150C 1656 156 1656 165 1659 181L 1506 562L 1571 562L 1718 193C 1727 178 1734 168 1737 162C 1767 126 1794 109 1818 112C 1842 115 1856 129 1862 156L 1862 193L 1718 562L 1778 562L 1921 193C 1933 175 1943 162 1950 156C 1971 135 1994 125 2021 125C 2049 125 2065 138 2071 162L 2071 196L 1950 503C 1937 544 1957 565 2009 565C 2030 565 2057 543 2087 500C 2096 488 2106 466 2121 437L 2109 434C 2094 457 2084 475 2078 487C 2053 522 2030 537 2012 537C 2000 537 1996 534 1996 525C 1996 519 1997 508 2000 493L 2121 190C 2118 166 2115 149 2112 140C 2103 110 2083 90 2053 84C 2013 78 1976 88 1940 115C 1931 121 1918 135 1900 156C 1893 136 1890 124 1887 118C 1875 95 1858 84 1840 84C 1792 84 1755 96 1731 118C 1725 124 1718 136 1709 153C 1700 136 1693 124 1690 118C 1675 98 1658 87 1640 84zM 2490 121C 2508 121 2528 125 2546 134C 2562 143 2568 163 2568 193C 2568 264 2545 335 2496 409C 2439 495 2372 537 2293 537C 2254 537 2224 527 2209 506L 2259 300C 2286 251 2323 210 2368 175C 2414 139 2454 121 2490 121z";
alphatab.rendering.glyphs.MusicFont.FermataShort = "M 60 694l -110 1l 660 -713l 656 713l -66 -1l -562 -611L 60 694zM 662 488c 29 0 54 10 74 30s 30 44 30 74c 0 29 -10 54 -30 74s -44 30 -74 30c -29 0 -54 -10 -74 -30s -30 -44 -30 -74c 0 -29 10 -54 30 -74S 633 488 662 488";
alphatab.rendering.glyphs.MusicFont.FermataNormal = "M 871 230c -216 0 -405 69 -565 209c -160 139 -255 317 -284 531c -2 -16 -4 -32 -4 -48c 0 -21 0 -36 0 -44c 0 -228 84 -427 252 -599c 168 -171 368 -257 600 -257c 229 0 429 84 598 254c 169 169 254 370 254 603c 0 40 0 70 0 92c -26 -216 -119 -394 -278 -533C 1283 299 1093 230 871 230zM 869 767c 29 0 54 10 74 30s 30 44 30 74c 0 29 -9 53 -28 72c -18 18 -44 28 -76 28c -26 0 -50 -9 -72 -28c -21 -18 -32 -42 -32 -72c 0 -29 10 -54 30 -74S 839 767 869 767";
alphatab.rendering.glyphs.MusicFont.FermataLong = "M 55 702h -68v -704h 1317v 704h -68v -500h -1180V -90748zM 647 494c 29 0 54 10 74 30s 30 44 30 74c 0 29 -10 54 -30 74s -44 30 -74 30c -29 0 -54 -10 -74 -30s -30 -44 -30 -74c 0 -29 10 -54 30 -74S 618 494 647 494";
alphatab.rendering.glyphs.MusicFont.DynamicP = "M 447 894l -146 415l 92 0v 50h -364v -50h 93l 310 -797c 7 -9 10 -16 10 -21c 7 -19 7 -33 0 -43c -14 -14 -27 -21 -39 -21c -38 0 -83 48 -133 144c -14 31 -34 79 -61 144h -25c 26 -72 48 -125 64 -158c 57 -108 116 -162 176 -162c 19 0 33 2 43 7c 12 4 21 18 28 39c 2 7 4 19 7 36c 16 -26 47 -52 90 -79c 43 -26 89 -39 137 -39c 19 0 45 5 77 16c 32 10 59 37 81 78c 21 41 32 89 32 141c 0 35 -2 64 -7 86c -4 21 -13 50 -25 86c -26 64 -71 123 -133 177s -119 80 -169 80C 528 1024 481 981 447 894zM 754 425c -33 -14 -73 5 -119 58c -36 43 -67 92 -93 145c -26 53 -39 113 -39 181c 0 48 9 78 28 90c 26 14 62 0 108 -41c 45 -42 81 -92 108 -150c 9 -24 19 -56 28 -96c 9 -40 14 -74 14 -103C 790 462 778 435 754 425";
alphatab.rendering.glyphs.MusicFont.DynamicF = "M 951 406v 39h -194l -18 90c -48 194 -97 344 -147 447c -67 141 -154 245 -259 310c -33 21 -77 32 -129 32c -77 0 -127 -21 -151 -64c -14 -26 -21 -51 -21 -75c 0 -38 13 -71 41 -97c 27 -26 57 -37 88 -32c 55 9 83 36 83 79c 0 16 -3 32 -10 46c -9 33 -32 55 -68 64c -12 2 -16 7 -14 14c 4 19 22 28 54 28c 16 -2 36 -14 57 -36c 7 -7 22 -26 47 -57c 52 -79 102 -205 147 -378c 19 -77 38 -154 57 -231l 32 -140h -137v -39h 144c -14 -55 21 -139 108 -252c 65 -84 144 -139 238 -166c 28 -7 57 -10 86 -10c 60 0 109 15 148 46c 38 31 57 72 57 122c 0 48 -14 81 -43 99c -28 18 -56 21 -83 9c -31 -14 -46 -38 -46 -72c 0 -28 10 -52 32 -72c 7 -7 22 -12 46 -14c 24 -2 37 -8 39 -18c 7 -28 -16 -43 -72 -43c -33 0 -64 6 -93 18c -77 33 -132 102 -166 205c -9 33 -20 83 -32 148H 951";
alphatab.rendering.glyphs.MusicFont.DynamicM = "M 553 1076l -165 1l 201 -502c 7 -12 11 -21 14 -28c 12 -26 18 -45 18 -57c 0 -21 -8 -33 -25 -36c -31 -7 -62 9 -93 50c -9 12 -22 33 -39 65l -199 508l -164 0l 212 -501c 4 -10 7 -17 7 -22c 4 -19 7 -37 7 -52c 0 -17 -3 -28 -10 -33c -9 -10 -22 -14 -39 -14c -50 0 -116 61 -198 183c -12 19 -30 47 -54 84h -18c 43 -73 78 -126 104 -160c 86 -106 165 -154 238 -142c 16 2 37 21 61 56c 7 10 18 28 32 56c 14 -26 28 -45 43 -57c 45 -40 101 -61 166 -61c 31 0 54 19 68 57c 2 12 6 32 10 61c 21 -30 39 -51 54 -62c 48 -39 101 -56 158 -49c 55 7 89 30 104 69c 2 11 3 30 3 55l -163 437c -12 19 -20 32 -22 39c -7 14 -4 22 7 25c 21 2 54 -20 97 -68c 14 -14 34 -39 61 -75h 21c -31 44 -56 78 -75 101c -62 67 -125 101 -188 101c -24 0 -43 -10 -57 -32c -14 -21 -16 -43 -7 -65l 169 -429c 4 -7 6 -11 6 -14c 10 -26 16 -47 16 -64c 0 -26 -10 -40 -32 -43c -28 -7 -58 9 -89 50c -9 12 -22 33 -39 64L 553 1076";
alphatab.rendering.glyphs.MusicFont.Accentuation = "M 1098 286L 0 525l 0 -27l 938 -208l -939 -208l 0 -32L 1098 286";
alphatab.rendering.glyphs.MusicFont.HeavyAccentuation = "M 77 1000L 25 1000l 349 -1004l 353 1004l -128 0l -264 -750L 77 1000";
alphatab.rendering.glyphs.MusicFont.WaveHorizontal = "M 1382 230c -43 32 -92 69 -146 111s -104 76 -149 105c -45 28 -89 51 -134 68s -86 26 -127 28c -47 -6 -87 -19 -119 -38s -79 -51 -143 -98c -64 -46 -117 -81 -160 -102c -42 -21 -90 -32 -141 -32c -79 0 -174 55 -285 166v -112c 132 -110 241 -193 327 -249s 166 -83 244 -83c 48 0 93 11 134 34c 40 22 88 56 144 101c 55 44 103 79 143 103c 40 24 85 37 135 40c 89 -7 182 -55 278 -146V -69020";
alphatab.rendering.glyphs.MusicFont.WaveVertical = "M 165 4h 50c 47 44 86 85 115 122s 43 75 43 114c 0 31 -9 60 -28 85c -19 25 -47 55 -85 89s -66 64 -86 90c -19 26 -30 55 -31 88h 5c 0 31 9 60 27 86c 18 25 46 56 84 93s 66 68 86 95c 19 27 28 57 28 92c 0 33 -9 62 -28 89c -19 26 -47 57 -85 92c -37 35 -65 64 -84 89c -18 24 -27 51 -27 82c 0 17 22 59 67 127h -50c -59 -57 -100 -100 -124 -130c -23 -29 -35 -67 -35 -113c 0 -33 9 -62 27 -86c 18 -24 46 -53 85 -87c 38 -33 66 -63 85 -88c 18 -25 28 -55 28 -91c 0 -17 -8 -37 -26 -61s -42 -54 -73 -89c -31 -35 -53 -60 -64 -75c -41 -64 -61 -109 -61 -135c 1 -40 20 -80 56 -119c 35 -38 72 -77 110 -117c 38 -39 58 -76 60 -112c 0 -18 -4 -35 -13 -50C 210 72 192 44 165 4";
alphatab.rendering.glyphs.MusicFont.PickStrokeDown = "M 0 -20h 816v 844h -74v -477h -672v 477H 0V -72220";
alphatab.rendering.glyphs.MusicFont.PickStrokeUp = "M 551 -7L 289 950l -264 -956h 66l 202 759l 193 -759H 551";
alphatab.rendering.glyphs.MusicFont.TemoloPickingThirtySecond = "M -38 737v -250l 986 -505v 253L -38 737zM -38 1150v -250l 986 -505v 253L -38 1150zM -38 1562v -250l 986 -505v 261L -38 1562";
alphatab.rendering.glyphs.MusicFont.TremoloPickingSixteenth = "M -38 737v -250l 986 -505v 253L -38 737zM -38 1150v -250l 986 -505v 253L -38 1150";
alphatab.rendering.glyphs.MusicFont.TremoloPickingEighth = "M -38 737v -250l 986 -505v 253L -38 737";
alphatab.rendering.glyphs.MusicFont.UpperMordent = "M 16 714v -195l 425 -494c 34 -22 53 -33 56 -33c 19 0 33 6 39 20l 349 306c 17 17 36 28 56 33c 19 -6 33 -12 39 -19l 264 -307c 33 -22 53 -33 59 -33c 17 0 29 6 36 20l 349 306c 20 21 39 34 55 40c 20 -7 34 -16 40 -26l 224 -264v 194l -422 494c -32 22 -54 33 -66 33c -15 0 -26 -6 -33 -19l -346 -310c -15 -15 -37 -23 -66 -23c -16 0 -26 3 -29 9l -267 310c -25 22 -46 33 -62 33c -14 0 -25 -6 -33 -19l -346 -310c -18 -19 -40 -29 -66 -29c -14 0 -25 5 -32 16L 16 714";
alphatab.rendering.glyphs.MusicFont.LowerMordent = "M -34 664v -195l 399 -458c 34 -37 58 -56 72 -56s 41 18 82 56l 352 310v -607h 99v 525l 191 -227c 38 -41 62 -62 72 -62c 10 0 38 16 82 50l 277 247c 64 53 99 80 102 82c 10 -2 24 -15 43 -38c 18 -23 33 -39 42 -50l 115 -142v 178l -349 412c -26 34 -51 52 -75 52c -12 0 -40 -19 -83 -59l -257 -230c -46 -46 -83 -69 -111 -69c -7 0 -12 1 -17 5c -4 3 -9 9 -16 17c -6 8 -11 14 -16 19v 607h -99v -492l -121 149c -31 34 -56 52 -75 52c -7 0 -15 -2 -22 -6c -7 -4 -18 -12 -32 -25c -14 -12 -25 -21 -33 -27l -290 -263c -35 -28 -57 -42 -66 -42c -15 0 -33 14 -56 42L -34 664";
alphatab.rendering.glyphs.MusicFont.Turn = "M 1141 739c -20 -17 -65 -56 -136 -115c -70 -60 -143 -117 -218 -172c -75 -54 -150 -100 -224 -136c -73 -36 -140 -54 -199 -54c -74 6 -138 45 -191 115s -82 143 -85 218c 8 119 77 179 208 179c 18 0 33 -3 45 -9c 11 -6 31 -20 59 -40c 28 -20 53 -35 75 -45c 22 -9 48 -14 79 -14c 89 0 146 39 170 117c 0 76 -31 132 -93 169c -62 36 -129 55 -202 55c -165 -8 -290 -53 -373 -135c -83 -82 -124 -182 -124 -301c 0 -85 22 -171 67 -255c 44 -84 107 -155 189 -213c 81 -57 174 -92 279 -105c 137 0 267 29 388 89c 121 59 240 137 356 232c 116 95 229 188 337 278c 42 35 97 69 165 101c 67 31 131 47 191 47c 92 -5 162 -35 210 -91c 47 -56 71 -121 71 -196c 0 -64 -18 -119 -55 -162c -36 -43 -85 -65 -146 -65c -21 0 -50 12 -89 38c -38 25 -68 43 -90 55c -22 11 -53 17 -93 17c -42 0 -79 -14 -113 -44c -33 -29 -50 -66 -50 -111c 0 -60 31 -104 95 -134c 63 -29 130 -44 200 -44c 102 0 192 24 269 72c 76 48 135 112 175 191c 40 78 60 161 60 249c 0 87 -20 168 -60 243c -40 74 -101 134 -184 179c -82 45 -185 68 -306 68c -116 0 -224 -22 -323 -66C 1375 894 1264 827 1141 739";
alphatab.rendering.glyphs.MusicFont.OpenNote = "M 443 922c -124 0 -229 -45 -315 -135s -128 -197 -128 -322c 0 -130 42 -239 126 -326c 84 -87 189 -130 316 -130c 122 0 225 39 310 118c 84 78 130 177 138 295c 0 145 -41 263 -125 354S 575 915 443 922zM 426 96c -101 0 -182 35 -244 107c -61 71 -92 158 -92 260c 0 101 32 185 98 252s 150 100 254 100c 113 0 201 -36 264 -109s 94 -168 94 -288C 780 204 655 96 426 96";
alphatab.rendering.glyphs.MusicFont.StoppedNote = "M 462 1009v -449h -445v -122h 445V -95953h 118v 441h 452v 122h -452v 449H 462";
alphatab.rendering.glyphs.MusicFont.Tempo = "M 550 1578V -98420l 43 8v 1679c 0 86 -41 160 -124 220s -173 90 -272 90c -114 0 -182 -46 -203 -139c 0 -84 41 -164 125 -239s 173 -112 270 -112C 457 1539 510 1552 550 1578zM 914 1686v -76h 540v 76H 914zM 914 1850h 540v 80h -540V -96600";
alphatab.rendering.glyphs.MusicFont.AccidentalSharp = "M 482 -125v -577h 93v 540l 135 -57v 343l -135 57v 551l 135 -62v 343l -135 57v 561h -93v -525l -223 93v 566h -93v -530l -135 52v -343l 135 -52v -551l -135 57v -348l 135 -52v -561h 93v 525L 482 -125zM 258 306v 551l 223 -93v -546L 258 306";
alphatab.rendering.glyphs.MusicFont.AccidentalFlat = "M -23 -1273h 93v 1300c 48 -27 86 -48 114 -62c 93 -41 176 -62 249 -62c 52 0 97 13 137 39c 39 26 70 70 91 132c 10 31 15 62 15 93c 0 100 -50 204 -150 311c -72 76 -157 143 -254 202c -41 24 -97 69 -166 135c -45 41 -88 84 -130 129V -25173zM 367 17c -7 -3 -13 -6 -20 -10c -17 -6 -33 -10 -46 -10c -27 0 -59 7 -93 23c -34 15 -79 46 -135 91v 644c 65 -65 131 -131 197 -197c 128 -156 192 -284 192 -384C 460 103 429 51 367 17";
alphatab.rendering.glyphs.MusicFont.AccidentalNatural = "M 38 822V -25883h 99v 792l 478 -132v 1738h -93v -775L 38 822zM 137 530l 385 -104v -429l -385 104V -24420";
alphatab.rendering.glyphs.MusicFont.ClefNeutral = "M -35 1887v -1875h 337v 1875H -35zM 527 1887v -1875h 337v 1875H 527";
alphatab.rendering.glyphs.MusicFont.RestSixtyFourth = "M 705 -2152c 77 -26 144 -77 200 -150c 56 -73 101 -174 136 -305l 127 -547c -69 127 -197 191 -382 191c -46 0 -100 -7 -162 -23c -61 -15 -114 -46 -156 -92c -42 -46 -63 -108 -63 -185c 0 -65 23 -121 69 -168c 46 -46 104 -69 174 -69c 65 0 123 25 174 75c 50 50 75 104 75 162c 0 31 -7 63 -23 98c -15 34 -44 63 -87 87c 46 15 71 23 75 23c 7 0 27 -3 57 -11c 77 -23 148 -81 213 -174c 53 -73 86 -137 98 -191l 154 -638c -73 128 -198 192 -375 192c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -23c -69 -19 -125 -52 -167 -98c -42 -46 -63 -106 -63 -179c 0 -69 23 -127 69 -174c 46 -46 104 -69 174 -69s 128 24 176 72c 48 48 72 103 72 165c 0 31 -7 63 -23 98c -15 34 -42 65 -81 92c 19 7 40 15 63 23c 11 0 32 -3 63 -11c 73 -23 140 -80 202 -169c 61 -89 121 -179 179 -271l 41 0l -1032 4425l -107 0l 319 -1316c -73 128 -196 192 -370 192c -19 0 -38 0 -57 0c -27 -3 -68 -13 -124 -28c -55 -15 -105 -46 -147 -92c -42 -46 -63 -106 -63 -179c 0 -65 23 -121 69 -168c 46 -46 106 -69 179 -69c 65 0 122 24 171 72c 48 48 72 103 72 165c 0 30 -7 63 -23 98c -15 34 -44 63 -87 87c 46 15 71 23 75 23c 7 0 26 -3 57 -11c 76 -23 150 -83 219 -180c 57 -77 86 -129 86 -156l 161 -667c -73 124 -198 186 -375 186c -30 0 -61 0 -92 0c -34 -11 -57 -19 -69 -22c -69 -19 -125 -51 -167 -97c -42 -45 -63 -105 -63 -177c 0 -68 23 -126 69 -172c 46 -45 106 -68 179 -68c 65 0 122 23 171 71c 48 47 72 102 72 163c 0 30 -7 63 -23 97c -15 34 -44 65 -87 91c 23 7 46 14 69 21C 653 -2140 674 -2144 705 -2152";
alphatab.rendering.glyphs.MusicFont.AccidentalDoubleFlat = "M 67 25c 52 -27 93 -48 124 -62c 100 -45 176 -67 228 -67c 45 0 95 12 150 36V -22075h 88v 1300c 48 -27 88 -48 119 -62c 100 -45 183 -67 249 -67c 55 0 104 13 145 39c 41 26 72 71 93 137c 10 31 15 62 15 93c 0 107 -48 212 -145 316c -72 79 -163 143 -270 192c -34 17 -78 52 -132 104c -53 51 -108 107 -163 166v -529c -38 45 -72 83 -104 115c -55 55 -121 103 -197 141c -45 20 -102 68 -171 141c -41 41 -81 85 -119 131V -22075h 88V -20775zM 369 15c -7 -3 -13 -6 -20 -10c -17 -6 -33 -10 -46 -10c -31 0 -64 7 -98 23c -34 15 -79 46 -135 91v 644c 65 -65 131 -131 197 -197c 131 -159 197 -287 197 -384C 462 101 431 49 369 15zM 962 15c -3 -3 -12 -6 -26 -10c -20 -6 -36 -10 -46 -10c -31 0 -63 7 -96 23c -33 15 -77 46 -132 91v 644c 65 -65 131 -131 197 -197c 131 -159 197 -287 197 -384C 1055 101 1024 49 962 15";
alphatab.rendering.glyphs.MusicFont.AccidentalDoubleSharp = "M 22 243c -32 -31 -48 -68 -48 -110c 0 -38 15 -71 45 -98c 30 -27 63 -40 98 -40c 38 0 70 14 96 43c 64 57 116 124 158 199c 41 75 62 146 62 213c -83 0 -172 -30 -268 -91C 99 317 51 278 22 243zM 18 872c 25 25 59 38 100 38c 38 0 70 -14 96 -43c 44 -38 86 -86 124 -144c 64 -96 96 -187 96 -273c -70 0 -140 18 -211 55c -70 36 -137 87 -201 151c -32 31 -48 70 -48 115C -26 810 -11 843 18 872zM 848 32c -25 -25 -60 -38 -105 -38c -41 0 -76 16 -105 48c -57 67 -94 113 -110 139c -60 96 -91 185 -91 268c 92 0 182 -28 268 -86c 79 -67 124 -105 134 -115c 31 -31 48 -72 48 -120C 886 96 874 64 848 32zM 838 656c 31 31 48 70 48 115c 0 38 -14 72 -43 100s -62 43 -100 43c -38 0 -73 -16 -105 -48c -51 -57 -88 -105 -110 -144c -60 -96 -91 -187 -91 -273c 105 0 211 41 316 124C 803 622 832 650 838 656";
alphatab.rendering.glyphs.NoteHeadGlyph.noteHeadHeight = 9;
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
haxe.Unserializer.DEFAULT_RESOLVER = Type;
haxe.Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.Unserializer.CODES = null;
haxe.io.Output.LN2 = Math.log(2);
js.Lib.onerror = null;
Main.main();
