/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */
package alphatab;

import haxe.macro.Type;
import haxe.macro.JSGenApi;
import haxe.macro.Expr;
import haxe.macro.Compiler;
import haxe.macro.Context;
using Lambda;
 
class AlphaTabJsGenerator 
{
    var api : JSGenApi;
	var buf : StringBuf;
	var inits : List<TypedExpr>;
	var statics : List<{ c : ClassType, f : ClassField }>;
	var packages : Hash<Bool>;
	var forbidden : Hash<Bool>;
    var files : List<String>;

	public function new(api) {
		this.api = api;
		buf = new StringBuf();
		inits = new List();
		statics = new List();
		packages = new Hash();
		forbidden = new Hash();
        files = new List<String>();
		for( x in ["prototype", "__proto__", "constructor"] )
			forbidden.set(x, true);
		api.setTypeAccessor(getType);
	}

	function getType( t : Type ) {
		return switch(t) {
			case TInst(c, _): getPath(c.get());
			case TEnum(e, _): getPath(e.get());
			default: throw "assert";
		};
	}

	inline function print(str) {
		buf.add(str);
	}

	inline function newline() {
		buf.add(";\n");
	}
    
    inline function clear() {
        buf = new StringBuf();
    }

	inline function genExpr(e) {
		print(api.generateExpr(e));
	}

	@:macro static function fprint( e : Expr ) {
		switch( e.expr ) {
		case EConst(c):
			switch( c ) {
			case CString(str):
				var exprs = [];
				var r = ~/%((\([^\)]+\))|([A-Za-z_][A-Za-z0-9_]*))/;
				var pos = e.pos;
				var inf = Context.getPosInfos(pos);
				inf.min++; // string quote
				while( r.match(str) ) {
					var left = r.matchedLeft();
					if( left.length > 0 ) {
						exprs.push( { expr : EConst(CString(left)), pos : pos } );
						inf.min += left.length;
					}
					var v = r.matched(1);
					if( v.charCodeAt(0) == "(".code ) {
						var pos = Context.makePosition( { min : inf.min + 2, max : inf.min + v.length, file : inf.file } );
						exprs.push(Context.parse(v.substr(1, v.length-2), pos));
					} else {
						var pos = Context.makePosition( { min : inf.min + 1, max : inf.min + 1 + v.length, file : inf.file } );
						exprs.push( { expr : EConst(CIdent(v)), pos : pos } );
					}
					inf.min += v.length + 1;
					str = r.matchedRight();
				}
				exprs.push({ expr : EConst(CString(str)), pos : pos });
				var ret = null;
				for( e in exprs )
					if( ret == null ) ret = e else ret = { expr : EBinop(OpAdd, ret, e), pos : pos };
				return { expr : ECall({ expr : EConst(CIdent("print")), pos : pos },[ret]), pos : pos };
			default:
			}
		default:
		}
		Context.error("Expression should be a constant string", e.pos);
		return null;
	}

	function field(p) {
		return api.isKeyword(p) ? '["' + p + '"]' : "." + p;
	}

	function genPackage( p : Array<String> ) {
		var full = null;
		for( x in p ) {
			var prev = full;
			if( full == null ) full = x else full += "." + x;
			if( packages.exists(full) )
				continue;
			packages.set(full, true);
			if( prev == null )
				fprint("if(typeof %x=='undefined') %x = {}");
			else {
				var p = prev + field(x);
				fprint("if(!%p) %p = {}");
			}
			newline();
		}
	}

	function getPath( t : BaseType ) {
		return (t.pack.length == 0) ? t.name : t.pack.join(".") + "." + t.name;
	}

	function checkFieldName( c : ClassType, f : ClassField ) {
		if( forbidden.exists(f.name) )
			Context.error("The field " + f.name + " is not allowed in JS", c.pos);
	}

	function genClassField( c : ClassType, p : String, f : ClassField ) {
		checkFieldName(c, f);
		var field = field(f.name);
		fprint("%p.prototype%field = ");
		if( f.expr == null )
		{
            var typeName = null;
            switch(f.type)
            {
                case TEnum(e, _):
                    typeName = e.get().name;
                case TInst(c, _):
                    typeName = c.get().name;
                default:
                    typeName = "";
            }
            
            if (typeName == "Int")
            {
                print("0");
            }
            else if (typeName == "Float")
            {
                print("0.0");
            }
            else if (typeName == "String")
            {
                print("\"\"");
            }
            else
            {
                print("null");
            }
        }
		else {
			api.setDebugInfos(c, f.name, false);
			print(api.generateExpr(f.expr));
		}
		newline();
	}

	function genStaticField( c : ClassType, p : String, f : ClassField ) {
		checkFieldName(c, f);
		var field = field(f.name);
		if( f.expr == null ) {
			fprint("%p%field = null");
			newline();
		} else switch( f.kind ) {
		case FMethod(_):
			fprint("%p%field = ");
			api.setDebugInfos(c, f.name, true);
			genExpr(f.expr);
			newline();
		default:
            genStaticValue(c, f);
			//statics.add( { c : c, f : f } );
		}
	}

	function genClass( c : ClassType ) {
		genPackage(c.pack);
		var p = getPath(c);
		fprint("%p = ");
		api.setDebugInfos(c, "new", false);
		if( c.constructor != null )
			print(api.generateConstructor(c.constructor.get().expr));
		else
			print("function() { }");
		newline();
		var name = p.split(".").map(api.quoteString).join(",");
		newline();
		if( c.superClass != null ) {
			var psup = getPath(c.superClass.t.get());
			newline();
			fprint("for(var k in %psup.prototype ) %p.prototype[k] = %psup.prototype[k]");
			newline();
		}
		for( f in c.statics.get() )
			genStaticField(c, p, f);
		for( f in c.fields.get() ) {
			switch( f.kind ) {
			case FVar(r, _):
				if( r == AccResolve ) continue;
			default:
			}
			genClassField(c, p, f);
		}
		newline();
		if( c.interfaces.length > 0 ) {
			var me = this;
			var inter = c.interfaces.map(function(i) return me.getPath(i.t.get())).join(",");
			newline();
		}
	}

	function genEnum( e : EnumType ) {
		genPackage(e.pack);
		var p = getPath(e);
		var names = p.split(".").map(api.quoteString).join(",");
		var constructs = e.names.map(api.quoteString).join(",");
		fprint("%p = { }");
		newline();
		for ( c in e.contructs.keys() ) 
        {
			var c = e.contructs.get(c);
			var f = field(c.name);
			fprint("%p%f = ");
			switch( c.type ) {
			default:
				print(""+c.index);
			}
			newline();
		}
	}


	function genStaticValue( c : ClassType, cf : ClassField ) {
		var p = getPath(c);
		var f = field(cf.name);
		fprint("%p%f = ");
		genExpr(cf.expr);
		newline();
	}

	function genType( t : Type ) {
		switch( t ) {
		case TInst(c, _):
			var c = c.get();
			if( c.init != null )
			{
                genExpr(c.init);
            }
			if ( !c.isExtern )
            {
                genClass(c);
                writeToFile(getFilePath(t));
            }
		case TEnum(r, _):
			var e = r.get();
			if ( !e.isExtern ) 
            {
                genEnum(e);
                writeToFile(getFilePath(t));
            }
		default:
		}
	}

    private function writeToFile(path:String)
    {
        files.add(path);
        var out = neko.io.File.write(path, false);
        out.writeString(buf.toString());
        out.close();
        clear();
    }
    
    private function getFilePath(t : Type) :String {
        var path:String;
        switch(t) 
        {
            case TInst(c, _):
                var c = c.get();
                var p : Array<String> = c.pack;
                p.push(c.name);
                path = genFilePath(p);
            case TEnum(r, _):
                var e = r.get();
                var p = e.pack;
                p.push(e.name);
                path = genFilePath(p);
            default:
        }
        return path;
    }
    
    private function genFilePath(p:Array<String>, ext:String = ".js") : String
    {
        p.insert(0, api.outputFile);
        
        var path :StringBuf = new StringBuf();
        
        
        for (i in 0 ... p.length)
        {
            if (i > 0)
            {
                path.add("\\");
            }
            path.add(p[i]);
            if (i < (p.length - 1) && !neko.FileSystem.exists(path.toString()))
            {
                neko.FileSystem.createDirectory(path.toString());
            }
        }
        
        return path.toString() + ext;
    }
    
	public function generate() {
        
        if (!neko.FileSystem.exists(api.outputFile)) 
        {
            neko.FileSystem.createDirectory(api.outputFile);
        }
        
        // check if dir
        if (!neko.FileSystem.isDirectory(api.outputFile)) 
        {
            Context.error("Specified outputFile must be a directory!", null);
        }
                
        // write each type into a file
        for( t in api.types )
		{
            genType(t);
        }
            
        // main executable
		if( api.main != null ) {
			genExpr(api.main);
			newline();
		}
        writeToFile(genFilePath(["Main"]));
        
        // generate script tags for copy
        for (file in files)
        {
            file = StringTools.replace(file, "\\", "/");
            print("<script type=\"text/javascript\" src=\"" + file + "\"></script>\n");
        }
        writeToFile(genFilePath(["scriptTags"], ".html"));        
	}

	#if macro
	public static function use() {
		Compiler.setCustomJSGenerator(function(api) new AlphaTabJsGenerator(api).generate());
	}
	#end
}