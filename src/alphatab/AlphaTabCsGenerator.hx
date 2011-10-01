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

import haxe.macro.Context;
import haxe.macro.Expr;
import haxe.macro.JSGenApi;
import haxe.macro.Type;
using Lambda;
 
class AlphaTabCsGenerator 
{
    var typeMapping:Hash<String>;
    
    
    var api : JSGenApi;
    var file : CsharpFileWriter;
    var inits : List<TypedExpr>;
    var statics : List<{ c : ClassType, f : ClassField }>;
    var packages : Hash<Bool>;
    var forbidden : Hash<Bool>;
    var files : List<String>;
    
    var currentNamespace:String;
    var usings:Array<String>;

    public function new(api) {
        this.api = api;
        
        typeMapping = new Hash<String>();
        typeMapping.set("Void", "void");
        typeMapping.set("Float", "double");
        typeMapping.set("Int", "int");
        typeMapping.set("Bool", "bool");
        typeMapping.set("String", "string");
        
        file = new CsharpFileWriter();
        inits = new List();
        statics = new List();
        packages = new Hash();
        forbidden = new Hash();
        files = new List<String>();
        usings = new Array<String>();
        // TODO: All keywords
        for( x in ["byte", "short", "int", "long", "sbyte", "ushort", "uint", "ulong", "string", "public", "private", "protected", "static", "internal", "extern"] )
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
    
    function addUsing( ns : String) {
        if(!Lambda.has(usings, ns)) {
            usings.push(ns);
        }
    }
    
    inline function clear() {
        file = new CsharpFileWriter();
    } 

    function getPath( t : BaseType ) {
        return (t.pack.length == 0) ? t.name : t.pack.join(".") + "." + t.name;
    }

    function checkFieldName( c : ClassType, f : ClassField ) {
        if( forbidden.exists(f.name) )
            Context.error("The field " + f.name + " is not allowed in C#", c.pos);
    }
    
    function genClass( c : ClassType ) {
        file.println("using System;");
        file.println("using Haxe;");
        file.println();
        currentNamespace = c.pack.join(".");
        file.println("namespace %s", [currentNamespace]);
        file.println("{");
        
        file.indent();
        file.printIndent();
        
        var type = (c.isInterface) ? "interface" : "class";
        
        file.print("public ");
        file.print(type);
        file.print(" ");
        file.print(c.name);

        if(c.params.length > 0) {
            file.print("<");
            var i:Int = 0;
            for(param in c.params) {
                if(i > 0) {
                    file.print(", ");
                }
                
                file.print(param.name);
                i++;
            }
            file.print(">");
        }
        
        if(c.superClass != null || c.interfaces.length > 0) {
            file.print(" : ");
            var i = 0;
            if(c.superClass != null) {
                printBaseTypeReference(c.superClass.t, c.superClass.params);
                i++;
            }
            
            for(int in c.interfaces) {
                if(i > 0) {
                    file.print(", ");
                }
                printBaseTypeReference(int.t, int.params);
                i++;
            }
        }
        
        // TODO: Type Constraints
        
        file.println();
        file.printIndent();
        file.println("{");
        file.indent();
        
        for(field in c.statics.get()) {
            compileClassMember(c, field, true);
        }
        
        for(field in c.fields.get()) {
            compileClassMember(c, field, false);
        }

        // TODO: Constructor
        // TODO: Init
                
        file.outdent();
        file.printIndent();
        file.println("} // end class");
        
        file.outdent();
        file.println("} // end namespace");
    }
    
    function compileClassMember(c:ClassType, field:ClassField, isStatic:Bool) {
        
        switch(field.kind) {
            case FVar(read, write): compileField(c, field, isStatic, read, write);
            case FMethod(k): compileMethod(c, field, isStatic, k);
        }
        
    }
     
    function isValueType(type:Type) {
        
        var baseTypeCheck = function(t:BaseType) {
            var typeName = mapType(getPath(t));
            var valueTypes = ["int", "double", "string"];
            return Lambda.has(valueTypes, typeName);
        };
        
        switch(type) {
            case TMono( t ): return false;
            case TEnum(t, params): return true;
            case TInst(t, params): return baseTypeCheck(t.get());
            case TType(t, params): return baseTypeCheck(t.get());
            case TFun(args, ret): return false;
            case TAnonymous(a): return false;
            case TDynamic(t): return false;
        }
        
        return false;
    }
    
    function compileField(c:ClassType, field:ClassField, isStatic:Bool, read:VarAccess, write:VarAccess) {
        
        // TODO: Better check if private or protected
        var modifiers = (field.isPublic) ? "public " : "protected ";
        if(isStatic) {
            modifiers += "static ";
        }
        
        /*file.print("// ");
        switch(read) {
           case AccNormal: file.print("normal ");
           case AccNo: file.print("no ");
           case AccNever: file.print("never ");
           case AccResolve: file.print("resolve ");
           case AccCall( m ): file.print("call " + m + " ");
           case AccInline: file.print("inline ");
           case AccRequire( r ): file.print("require ");
        }
        switch(write) {
           case AccNormal: file.print("normal ");
           case AccNo: file.print("no ");
           case AccNever: file.print("never ");
           case AccResolve: file.print("resolve ");
           case AccCall( m ): file.print("call " + m + " ");
           case AccInline: file.print("inline ");
           case AccRequire( r ): file.print("require ");
        }
        file.println();*/
        
        // TODO: assignment
        
        if(c.isInterface) {
            file.printIndent();
            file.print(modifiers);
            printReference(field.type);
            file.print(" ");
            file.print(field.name);
            file.println(" { get; set; }");
        }
        // simple private field?
        else if(!field.isPublic && 
            read == VarAccess.AccNormal && write == VarAccess.AccNormal) {
            
            file.printIndent();
            file.print(modifiers);
            printReference(field.type);
            file.print(" ");
            file.print(field.name);
            file.println(";");
        }
        // constant?
        else if(read == VarAccess.AccInline) {
            file.printIndent();
            file.print(modifiers);
            if(isValueType(field.type)) {
                file.print("const ");
            }
            else {
                file.print("reaonly ");
            }
            
            printReference(field.type);
            file.print(" ");
            file.print(field.name);
            file.println(";");
        }
        else {
            // create properties for more complex vars
                
            // default    -> AccNormal / AccInline if inline var
            // null       -> AccNo
            // never      -> AccNever
            // MethodName -> AccCall
            // dynamic    -> AccResolve
            
            // private var
            file.printIndent();
            file.print("private ");
            if(isStatic) {
                file.print("static ");
            }
            printReference(field.type);
            file.print(" _");
            file.print(field.name);
            file.println(";");
            
            // property
            file.printIndent();
            file.print(modifiers);
            printReference(field.type);
            file.print(" ");
            file.println(field.name);
            
            file.printIndent();
            file.println("{");
            file.indent();
            
            var get = new CsharpFileWriter();
            get.indention = file.indention;
            
            var set = new CsharpFileWriter();
            set.indention = file.indention;
            
            switch(read) {
                case AccNormal: 
                    get.printIndent();
                    get.println("get");
                    get.printIndent();
                    get.println("{");
                    get.indent();
                        get.printIndent();
                        get.print("return _");
                        get.print(field.name);
                        get.println(";");
                    get.outdent();
                    get.printIndent();
                    get.println("}"); 
                case AccNo:
                    get.printIndent();
                    get.println("protected get");
                    get.printIndent();
                    get.println("{");
                    get.indent();
                        get.printIndent();
                        get.print("return _");
                        get.print(field.name);
                        get.println(";");
                    get.outdent();
                    get.printIndent();
                    get.println("}");  
                case AccNever:
                    get.printIndent();
                    get.println("private get");
                    get.printIndent();
                    get.println("{");
                    get.indent();
                        get.printIndent();
                        get.print("return _");
                        get.print(field.name);
                        get.println(";");
                    get.outdent();
                    get.printIndent();
                    get.println("}"); 
                case AccCall(m):
                    get.printIndent();
                    get.println("private get");
                    get.printIndent();
                    get.println("{");
                    get.indent();
                        get.printIndent();
                        get.print("return ");
                        get.print(m);
                        get.println("();");
                    get.outdent();
                    get.printIndent();
                    get.println("}");  
                case AccRequire(r):
                    get.printIndent();
                    get.println("private get");
                    get.printIndent();
                    get.println("{");
                    get.indent();
                        get.printIndent();
                        get.print("return ");
                        get.print(r);
                        get.println("();");
                    get.outdent();
                    get.printIndent();
                    get.println("}"); 
                case AccResolve:
                case AccInline:
            }
            file.print(get.toString());
            
            
            switch (write) {
                case AccNormal:
                    set.printIndent();
                    set.println("set");
                    set.printIndent();
                    set.println("{");
                    set.indent();
                        set.printIndent();
                        set.print("_");
                        set.print(field.name);
                        set.println(" = value;");
                    set.outdent();
                    set.printIndent();
                    set.println("}"); 
                case AccNo:
                    set.printIndent();
                    set.println("protected set");
                    set.printIndent();
                    set.println("{");
                    set.indent();
                       set.printIndent();
                       set.print("_");
                       set.print(field.name);
                       set.println(" = value;");
                    set.outdent();
                    set.printIndent();
                    set.println("}");  
                case AccNever:
                    set.printIndent();
                    set.println("private get");
                    set.printIndent();
                    set.println("{");
                    set.indent();
                        set.printIndent();
                        set.print("_");
                        set.print(field.name);
                        set.println(" = value;");
                    set.outdent();
                    set.printIndent();
                    set.println("}"); 
                case AccCall(m):
                    set.printIndent();
                    set.println("private get");
                    set.printIndent();
                    set.println("{");
                    set.indent();
                        set.printIndent();
                        set.print(m);
                        set.println("(value);");
                    set.outdent();
                    set.printIndent();
                    set.println("}");  
                case AccRequire(r):
                    set.printIndent();
                    set.println("private get");
                    set.printIndent();
                    set.println("{");
                    set.indent();
                        set.printIndent();
                        set.print(r);
                        set.println("(value);");
                    set.outdent();
                    set.printIndent();
                    set.println("}");   
                case AccResolve:
                case AccInline:
            }
            file.print(set.toString());
            file.outdent();
            file.printIndent();
            file.println("}");
        }
         
        file.println();
    }
    
    function compileMethod(c:ClassType, field:ClassField, isStatic:Bool, k:MethodKind) {
        switch(field.type) {
            case TFun(args, ret):
            
                var modifiers = (field.isPublic) ? "public " : "protected ";
                if(isStatic) {
                    modifiers += "static ";
                }
                
                file.printIndent();
                file.print(modifiers);
                printReference(ret);
                file.print(" ");
                file.print(field.name);
                
                file.print("(");
                
                    var i = 0;
                    for(param in args) {
                        if(i > 0) {
                            file.print(", ");
                        }
                        
                        printReference(param.t);
                        file.print(" ");
                        file.print(param.name);
                        
                        if(param.opt) {
                            file.print(" = default(");
                            printReference(param.t);
                            file.print(")");
                        }
                        i++;
                    }
                    
                file.print(")");
                
                if(c.isInterface) {
                    file.println(";");
                }
                else {
                    file.println();
                    file.printIndent();
                    file.print("{");
                    file.println();
                    
                    file.indent();
                    
                    if(field.expr == null) {
                        file.printIndent();
                        file.println("// NOTE: no body expression found");
                    }
                    else {
                        compileTypedExpr(field.expr);
                    }
                    
                    file.outdent();
                    file.printIndent();
                    file.println("}");
                    file.println();    
                }
                
            default:
                file.println("/* Unknown Method Type */");
        }    
    }
    
    function mapType(type:String) {
        if(typeMapping.exists(type)) {
            return typeMapping.get(type);
        }
        
        var last = type.lastIndexOf(".");
        
        if(last < 0) {
            return type;
        }
        
        var pkg = type.substr(0, last);
        var type = type.substr(last + 1);
        
        if(pkg == currentNamespace) {
            return type;
        }
        
        return type;
    }
    
    function printReference(ref:Type) {
        if(ref == null) {
            file.print("/*NULL*/");
            return;
        }
        switch(ref) {
            case TMono( t ): printMono(t);
            case TEnum(t, params): printBaseTypeReference(t, params);
            case TInst(t, params): printBaseTypeReference(t, params);
            case TType(t, params): printBaseTypeReference(t, params);
            case TFun(args, ret): printFunReference(args, ret);
            case TAnonymous(a): printAnonymousReference(a);
            case TDynamic(t): printDynamicReference(t);
        }
    }
    
    function printMono(t:Ref<Null<Type>>) {
        var type = t.get();
        printReference(type);
        file.print("/* Mono */");
    }
    
    function printBaseTypeReference(t : Ref<BaseType>, params : Array<Type>) {
        var type:BaseType = t.get();
        file.print(mapType(getPath(type)));
        
        if(params.length > 0) {
            file.print("<");
            for(i in 0 ... params.length) {
                if(i > 0) {
                    file.print(", ");
                }
                printReference(params[i]);
            }
            file.print(">");
        }
    }
    
    function printFunReference(args : Array<{ name : String, opt : Bool, t : Type }>, ret : Type) {
        
        file.print("Func<");
        
        var i:Int = 0;
        
        for(arg in args) {
            if(i > 0) {
                file.print(", ");
            }
            printReference(arg.t);
            if(arg.opt) {
                file.print(" = default(");
                printReference(arg.t);
                file.print(")");
            }
            i++;
        }
        
        if(ret != null) {
            if(i > 0) {
                file.print(", ");
            }
            printReference(ret);
        }
        
        file.print(">");
    }
    
    function printAnonymousReference(a : Ref<AnonType>) {
        file.print("/* Anonymous type reference*/"); 
        // Context.error("Anonymous type references are not supported by C#", null);
    }
    
    function printDynamicReference(t : Null<Type>) {
        
        file.print("Dynamic<");
        if(t != null) {
            printReference(t);
        }
        file.print(">");
        
    }

    function genEnum( e : EnumType ) {
        file.print("// TODO "); 
    }
    
    function compileTypedExpr(t:TypedExpr) {
        var abstract:VAbstract = cast t;
        switch(abstract) {
            case ATExpr(e): compileExpr(e);
        }
    }
    
    function compileExpr(e:Expr) {
        compileExprDef(e.expr);
    }
 
    function compileExprDef(e:ExprDef) {
        
        switch(e) {
            case EConst( c /* : Constant  */): compileEConst(c);
            case EArray( e1 /* : Expr */, e2 /* : Expr  */): compileEArray(e1, e2);
            case EBinop( op /* : Binop */, e1 /* : Expr */, e2 /* : Expr  */): compileEBinop(op, e1, e2);
            case EField( e /* : Expr */, field /* : String  */): compileEField(e, field);
            case EType( e /* : Expr */, field /* : String  */): compileEType(e, field);
            case EParenthesis( e /* : Expr  */): compileEParenthesis(e);
            case EObjectDecl( fields /*: Array<{ field : String, expr : Expr }> */ ): compileEObjectDecl(fields);
            case EArrayDecl( values /* : Array<Expr>  */): compileEArrayDecl(values);
            case ECall( e /* : Expr */, params /* : Array<Expr>  */): compileECall(e, params);
            case ENew( t /* : TypePath */, params /* : Array<Expr>  */): compileENew(t, params);
            case EUnop( op /* : Unop */, postFix /* : Bool */, e /* : Expr  */): compileEUnop(op, postFix, e);
            case EVars( vars /* : Array<{ name : String , type : Null<ComplexType>, expr : Null<Expr> }> */): compileEVars(vars);
            case EFunction( name /* : Null<String> */, f /* : Function  */): compileEFunction(name, f);
            case EBlock( exprs /* : Array<Expr>  */): compileEBlock(exprs);
            case EFor( it /* : Expr */, expr /* : Expr  */): compileEFor(it, expr);
            case EIn( e1 /* : Expr */, e2 /* : Expr  */): compileEIn(e1, e2);
            case EIf( econd /* : Expr */, eif /* : Expr */, eelse /* : Null<Expr>  */): compileEIf(econd, eif, eelse);
            case EWhile( econd /* : Expr */, e /* : Expr */, normalWhile /* : Bool  */): compileEWhile(econd, e, normalWhile);
            case ESwitch( e /* : Expr */, cases /* : Array<{ values : Array<Expr>, expr : Expr }>*/, edef /* : Null<Expr>  */): compileESwitch(e, cases, edef);
            case ETry( e /* : Expr */, catches /* : Array<{ name : String , type : ComplexType, expr : Expr }>*/ ): compileETry(e, catches);
            case EReturn( e /* : Null<Expr>  */): compileEReturn(e);
            case EBreak: compileEBreak();
            case EContinue: compileEContinue();
            case EUntyped( e /* : Expr  */): compileEUntyped(e);
            case EThrow( e /* : Expr  */): compileEThrow(e);
            case ECast( e /* : Expr */, t /* : Null<ComplexType>  */): compileECast(e, t);
            case EDisplay( e /* : Expr */, isCall /* : Bool  */): compileEDisplay(e, isCall);
            case EDisplayNew( t /* : TypePath  */): compileEDisplayNew(t);
            case ETernary( econd /* : Expr */, eif /* : Expr */, eelse /* : Expr  */): compileETernary(econd, eif, eelse);
            default: Context.error("Invalid expresion found", null);
        }
    }
    
    function compileEConst( c : Constant ){
        switch(c) {
            case CInt( v ): file.print(v);
            case CFloat( f ): file.print(f);
            case CString( s ) : file.print(s);
            case CIdent( s ) : file.print(s);
            case CType( s ) : file.print(s);
            case CRegexp( r , opt ): file.print("/* regex " + r + ", opt: " + opt + "*/");
        }
    }

    function compileEArray( e1 : Expr, e2 : Expr ){
        file.print("/* earray */");
    }

    function compileEBinop( op : Binop, e1 : Expr, e2 : Expr ){
        file.printIndent();
        file.println("/* binop */");
    }

    function compileEField( e : Expr, field : String ){
        file.printIndent();
        file.println("/* field */");
    }

    function compileEType( e : Expr, field : String ){
        file.printIndent();
        file.println("/* type */");
    }

    function compileEParenthesis( e : Expr ){
        file.printIndent();
        file.println("/* parenthsis */");
    }

    function compileEObjectDecl( fields : Array<{ field : String, expr : Expr }> ){
        file.printIndent();
        file.println("/* objdecl */");
    }

    function compileEArrayDecl( values : Array<Expr> ){
        file.printIndent();
        file.println("/* arraydecl */");
    }

    function compileECall( e : Expr, params : Array<Expr> ){
        file.printIndent();
        file.println("/* call */");
    }

    function compileENew( t : TypePath, params : Array<Expr> ){
        file.printIndent();
        file.println("/* new */");
    }

    function compileEUnop( op : Unop, postFix : Bool, e : Expr ){
        file.printIndent();
        file.println("/* unop */");
    }

    function compileEVars( vars : Array<{ name : String, type : Null<ComplexType>, expr : Null<Expr> }> ){
        file.printIndent();
        file.println("/* vars */");
    }

    function compileEFunction( name : Null<String>, f : Function ){
        file.printIndent();
        file.println("/* function */");
    }

    function compileEBlock( exprs : Array<Expr> ){
        file.printIndent();
        file.println("/* bl ock*/");
    }

    function compileEFor( it : Expr, expr : Expr ){
        file.printIndent();
        file.println("/* for */");
    }

    function compileEIn( e1 : Expr, e2 : Expr ){
        file.printIndent();
        file.println("/* in */");
    }

    function compileEIf( econd : Expr, eif : Expr, eelse : Null<Expr> ){
        file.printIndent();
        file.println("/* if */");
    }

    function compileEWhile( econd : Expr, e : Expr, normalWhile : Bool ){
        file.printIndent();
        file.println("/* while */");
    }

    function compileESwitch( e : Expr, cases : Array<{ values : Array<Expr>, expr : Expr }>, edef : Null<Expr> ){
        file.printIndent();
        file.println("/* swtch */");
    }

    function compileETry( e : Expr, catches : Array<{ name : String, type : ComplexType, expr : Expr }> ){
        file.printIndent();
        file.println("/* try */");
    }

    function compileEReturn( ?e : Null<Expr> ){
        file.printIndent();
        file.println("/* return */");
    }

    function compileEBreak() {
        file.printIndent();
        file.println("break;");
    }

    function compileEContinue() {
        file.printIndent();
        file.println("continue;");
    }

    function compileEUntyped( e : Expr ){
    
    }

    function compileEThrow( e : Expr ){
    
    }

    function compileECast( e : Expr, t : Null<ComplexType> ){
    
    }

    function compileEDisplay( e : Expr, isCall : Bool ){
    
    }

    function compileEDisplayNew( t : TypePath ){
    
    }

    function compileETernary( econd : Expr, eif : Expr, eelse : Expr ){
    
    }


    function genType( t : Type ) {
        switch( t ) {
        case TInst(c, _):
            var c = c.get(); 
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
        out.writeString(file.toString());
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
    
    private function genFilePath(p:Array<String>, ext:String = ".cs") : String
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
        /*if( api.main != null ) {
            genExpr(api.main);
            newline();
        }
        writeToFile(genFilePath(["Main"]));*/
    }

    #if macro
    public static function use() {
        Compiler.setCustomJSGenerator(function(api) new AlphaTabCsGenerator(api).generate());
    }
    #end
}


class CsharpFileWriter {
    private static inline var INDENT:String = "    ";
    private var _buffer:StringBuf;
    public var indention:Int;
    
    public function new() {
        _buffer = new StringBuf();
        indention = 0;
    }
    
    public function printIndent() {
        for(i in 0 ... (indention)) {
            _buffer.add(INDENT);
        }
    }
    
    public function indent() {
        indention = indention + 1;
    }
    
    public function outdent() {
        indention = indention - 1;
        if(indention < 0) {
            indention = 0;
        }
    }
    
    public function print(format:String, args:Array<Dynamic> = null) {
        if(args == null) {
            _buffer.add(format);
        }
        else {
            var str = Sprintf.format(format, args);
            _buffer.add(str);
        }
    }
    
    public function println(format:String = null, args:Array<Dynamic> = null) {
        if(format != null) {
            print(format, args);
        }
        print("\n");
    }
    
    public function toString() : String {
        return _buffer.toString();   
    }
}

enum VAbstract {
    ATExpr(expr:Expr);
}