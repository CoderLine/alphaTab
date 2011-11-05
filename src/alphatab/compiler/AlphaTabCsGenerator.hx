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
package alphatab.compiler;

import haxe.macro.Compiler;
import haxe.macro.Context;
import haxe.macro.Expr;
import haxe.macro.JSGenApi;
import haxe.macro.Type;
using Lambda;
 
class AlphaTabCsGenerator 
{
    private static inline var ROOT_NAMESPACE = "HaxeRoot";
    private static var SEP:String = { neko.Sys.systemName() == "Windows" ? "\\" : "/"; }
    private static var UPPER_CASE = ~/[A-Z0-9]+/;
    var typeMapping:Hash<String>; 
    
    var api : JSGenApi; 
    var file : SourceWriter;
    var inits : List<TypedExpr>;
    var statics : List<{ c : ClassType, f : ClassField }>;
    var packages : Hash<Bool>;
    var forbidden : Hash<Bool>;
    var files : List<String>;
    
    var currentNamespace:String;
    var usings:Array<String>;
    
    var inMethodBody:Bool;

    //
    // General Stuff
    //
    
    public function new(api:JSGenApi) 
    {
        
        this.api = api;
        
        typeMapping = new Hash<String>();
        typeMapping.set("Void", "void");
        typeMapping.set("Float", "double");
        typeMapping.set("Int", "int");
        typeMapping.set("Bool", "bool");
        typeMapping.set("String", "string");
        
        file = new SourceWriter();
        inits = new List();
        statics = new List();
        packages = new Hash();
        forbidden = new Hash();
        files = new List<String>();
        usings = new Array<String>();
        // TODO: All keywords
        for( x in ["byte", "short", "int", "long", "sbyte", "ushort", "uint", "ulong", "string", "public", "private", "protected", "static", "internal", "extern"] )
        {
            forbidden.set(x, true);
        }
        //api.setTypeAccessor(getQualifiedNameByType);
    }
   
    #if macro
    public static function use() 
    {
        Compiler.setCustomJSGenerator(function(api) new AlphaTabCsGenerator(api).generate());
    }
    #end
     
    private function generate() 
    {
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
            dumpType(t, true);
        }
            
        // main executable
        /*
        dumpExpr(api.main);
        */
    }
    
    private function writeFile(fileName:String) 
    {        
        if (fileName == null) 
        {
            Context.error("Could not write type to file (unknown filename)", null);
        }
        var typeContents = file.toString();
        
        clear();
        file.println("using System;");
        file.println("using Haxe;");
        for (u in usings) 
        {
            file.println("using %s;", [u]);
        }
        usings = new Array<String>();
        file.println();
        
        file.print(typeContents);
        
        var out = neko.io.File.write(fileName, false);
        out.writeString(file.toString());
        out.close();
        clear();
    }
    
    private function getFileName(fqn:String)
    {
        var fullPath = api.outputFile;
        if (!StringTools.endsWith(fullPath, SEP)) 
        {
            fullPath += SEP;
        }
        
        var parts = fqn.split(".");
        var i = 0;
        while ( i < parts.length ) 
        {
            fullPath += parts[i];
            
            if (i < parts.length - 1) 
            {
                if (!neko.FileSystem.exists(fullPath)) 
                {
                    neko.FileSystem.createDirectory(fullPath);
                }
                
                fullPath += SEP;
            }
            i++;
            
        }
        fullPath += ".cs";
        
        return fullPath;
    }
    
    private function isValueType(type:Type)
    {
        
        var baseTypeCheck = function(t:BaseType)
        {
            var typeName = getQualifiedName(t);
            var valueTypes = ["int", "double", "string", "bool"];
            return Lambda.has(valueTypes, typeName);
        };
        
        switch(type)
        {
            case TEnum(t, params): return true;
            case TInst(t, params): return baseTypeCheck(t.get());
            case TType(t, params): return baseTypeCheck(t.get());
            default: return false;
        }
    }
        
    private function dumpType(t:Type, dumpType:Bool = false) 
    {
        switch(t) {
            case TInst(i, _):
                var c = i.get();
                if (!c.isExtern) 
                {
                    dumpClass(c, dumpType);
                }
            case TEnum(t, _):
                var e = t.get();
                if (!e.isExtern) 
                {
                    dumpEnum(e, dumpType);
                }
            case TType(t, _):
                var td = t.get();
                dumpTypedef(td, dumpType);
            case TFun(args, ret):
                dumpFunctionDef(args, ret);
            case TAnonymous(a): 
                dumpAnonymousType(a.get());
            default:
                Context.error("unsupported type", null);
        }
    }
    
    private function getQualifiedNameByType( t : Type, mapRootTypes:Bool = true ) 
    {
        return switch(t) 
        {
            case TInst(c, _): getQualifiedName(c.get(), mapRootTypes);
            case TEnum(e, _): getQualifiedName(e.get(), mapRootTypes);
            case TType(t, _): getQualifiedName(t.get(), mapRootTypes);
            default: return null;
        };
    }
    
    private function addUsing( ns : String ) 
    {
        if (ns != null && ns.length > 0 && !Lambda.has(usings, ns)) 
        {
            usings.push(ns);
        }
    }
    
    private function clear() 
    {
        file = new SourceWriter();
    } 

    private function getQualifiedName( t : BaseType, mapRootTypes:Bool = true ) 
    {
        var buf = new StringBuf();
        
        if (t.pack.length > 0)
        {
            for (i in 0 ... t.pack.length)
            {
                if (i > 0)
                {
                    buf.add(".");
                }
                buf.add(firstToUpper(t.pack[i]));
            }
            buf.add(".");
        }
        else if(mapRootTypes)
        {
            buf.add(ROOT_NAMESPACE);
            buf.add(".");
        }
        
        buf.add(t.name);
        
        return buf.toString();
    }

    private function checkFieldName( c : ClassType, f : ClassField ) 
    {
        if ( forbidden.exists(f.name) ) 
        {
            Context.error("The field " + f.name + " is not allowed in C#", c.pos);
        }
    }
    
    //
    // Naming
    //
    
    private function getNamespace(parts:Array<String>, mapRootTypes:Bool = true) : String
    {
        var buf = new StringBuf();
        for (i in 0 ... parts.length)
        {
            if (i > 0)
            {
                buf.add(".");
            }
            buf.add(firstToUpper(parts[i]));
        }
        
        if (mapRootTypes && buf.toString().length == 0)
        {
            return ROOT_NAMESPACE;
        }
        return buf.toString();
    }
    
    private function getClassName(s:String)
    {
        return firstToUpper(s);
    }
    
    private function getFieldName(s:String)
    {
        // keep uppercase
        if (UPPER_CASE.match(s)) 
        {
            return s;
        }

        return "_" + firstToLower(s);
    }
    
    private function getParameterName(s:String)
    {
        // keep uppercase
        if (UPPER_CASE.match(s)) 
        {
            return s;
        }
        
        return firstToLower(s);
    }
    
    private function getPropertyName(s:String)
    {
        return firstToUpper(s);
    }
    
    private function getMethodName(s:String)
    {
        return firstToUpper(s);
    }
    
    private function firstToUpper(s:String)
    {
        // keep uppercase
        if (UPPER_CASE.match(s)) 
        {
            return s;
        }
        return s.charAt(0).toUpperCase() + s.substr(1);
    }
    
    private function firstToLower(s:String)
    {
        return s.charAt(0).toLowerCase() + s.substr(1);
    }
    
    //
    // Classes
    //
    
    private function dumpClass(c:ClassType, write:Bool) 
    {
        var fqn = getQualifiedName(c);
        
        currentNamespace = getNamespace(c.pack);
        file.println("namespace %s", [currentNamespace]);
        file.println("{");
        
        file.indent();
        file.printIndent();
        
        // doc
        dumpDoc(c.doc);
        
        // TODO: Metadata as Attributes
        
        // visibility
        if (c.isPrivate)
        {
            file.print("internal ");
        }
        else 
        {
            file.print("public ");
        }
        
        if (c.constructor == null)
        {
            file.print("abstract ");
        }
        
        // type
        if (c.isInterface)
        {
            file.print("interface ");
        }
        else
        {
            file.print("class ");
        }
        
        // name
        file.print(getClassName(c.name));
        
        // generics
        if (c.params.length > 0)
        {
            file.print("<");
            for (i in 0 ... c.params.length)
            {
                if (i > 0) 
                {
                    file.print(", ");
                }
                file.print(c.params[i].name);
            }
            file.print(">");
        }
        
        // base class, interfaces
        if (c.superClass != null || c.interfaces.length > 0)
        {
            file.print(" : ");
            
            if (c.superClass != null)
            {
                var superType = c.superClass.t.get();
                printBaseTypeReference(superType, c.superClass.params);
            }
            
            if (c.interfaces.length > 0)
            {
                if (c.superClass != null)
                {
                    file.print(", ");
                }
                
                for (i in 0 ... c.interfaces.length)
                {
                    if (i > 0)
                    {
                        file.print(", ");
                    }
                    printBaseTypeReference(c.interfaces[i].t.get(), c.interfaces[i].params);
                }
            }
        }
        file.println();
        
        // file.indent();
        // 
        // // type constraints
        // for (i in 0 ... c.params.length)
        // {
        //     file.printIndent();
        //     file.print("where ");
        //     file.print(c.params[i].name);
        //     file.print(" : ");
        //     printTypeReference(c.params[i].t);
        //     file.println();
        // }
        // 
        // file.outdent();
        file.printIndent();
        file.println("{");
        file.indent();
        
        // static
        for (s in c.statics.get())
        {
            dumpClassMember(c, s, true);
        }
        
        // non static
        for (s in c.fields.get())
        {
            dumpClassMember(c, s, false);
        }
        
        // ctor
        if (c.constructor != null)
        {
            dumpConstructor(c, c.constructor.get());
        }
        
        file.outdent();
        file.printIndent();
        file.println("}");
        
        
        file.outdent();
        file.printIndent();
        file.println("}");
        
        if (write) writeFile(getFileName(fqn));  
    }
    
    private function dumpConstructor(c:ClassType, f:ClassField)
    {
        dumpDoc(f.doc);
        
        file.printIndent();
        switch(f.type) 
        {
            case TFun(args, ret):
            
                if (f.isPublic)
                {
                    file.print("public ");
                }
                else
                {
                    file.print("protected ");
                }
                
                file.print(getClassName(c.name));
                
                file.print("(");
                        
                    for (i in 0 ... args.length) 
                    {
                        var param = args[i];
                        if (i > 0)
                        {
                            file.print(", ");
                        }
                        
                        printTypeReference(param.t);
                        file.print(" ");
                        file.print(getParameterName(param.name));
                        
                        if (param.opt)
                        {
                            file.print(" = ");
                            getDefaultValueForType(param.t);
                        }
                    }
                    
                file.println(")");
                
                inMethodBody = true;
                dumpTypedExpr(f.expr);
                inMethodBody = false;
                
            default:
        }
    }
    
    private function dumpClassMember(c:ClassType, f:ClassField, isStatic:Bool)
    {
        dumpDoc(f.doc);
        switch(f.kind) 
        {
            case FVar(read, write): dumpClassField(c, f, isStatic, read, write);
            case FMethod(k): dumpMethod(c, f, isStatic, k);
        }
    }
    
    private function dumpClassField(c:ClassType, field:ClassField, isStatic:Bool, read:VarAccess, write:VarAccess) 
    {
        
        // TODO: Better check if private or protected
        var modifiers = (field.isPublic) ? "public " : "protected ";
        if (isStatic) 
        {
            modifiers += "static ";
        }
        
        if (c.isInterface) 
        {
            file.printIndent();
            file.print(modifiers);
            printTypeReference(field.type);
            file.print(" ");
            file.print(getPropertyName(field.name));
            file.println(" { get; set; }");
        }
        // simple private field?
        else if(!field.isPublic && 
            read == VarAccess.AccNormal && write == VarAccess.AccNormal) 
        {
            
            file.printIndent();
            file.print(modifiers);
            printTypeReference(field.type);
            file.print(" ");
            file.print(getFieldName(field.name));
            
            if (field.expr != null)
            {
                file.print(" = ");
                dumpTypedExpr(field.expr);
            }
            file.println(";");
        }
        // constant?
        else if (read == VarAccess.AccInline)
        {
            file.printIndent();
            file.print(modifiers);
            if (isValueType(field.type))
            {
                file.print("const ");
            }
            else
            {
                file.print("readonly ");
            }
            
            printTypeReference(field.type);
            file.print(" ");
            file.print(getFieldName(field.name));
            if (field.expr != null)
            {
                file.print(" = ");
                dumpTypedExpr(field.expr);
            }
            file.println(";");
        }
        else
        {
            // create properties for more complex vars
                
            // default    -> AccNormal / AccInline if inline var
            // null       -> AccNo
            // never      -> AccNever
            // MethodName -> AccCall
            // dynamic    -> AccResolve
            
            // private var
            file.printIndent();
            file.print("private ");
            if (isStatic)
            {
                file.print("static ");
            }
            printTypeReference(field.type);
            file.print(" ");
            file.print(getFieldName(field.name));
            if (field.expr != null)
            {
                file.print(" = ");
                dumpTypedExpr(field.expr);
            }
            file.println(";");
            
            // property
            file.printIndent();
            file.print(modifiers);
            printTypeReference(field.type);
            file.print(" ");
            file.println(getPropertyName(field.name));
            
            file.printIndent();
            file.println("{");
            file.indent();
            
            var get = new SourceWriter();
            get.indention = file.indention;
            
            var set = new SourceWriter();
            set.indention = file.indention;
            
            switch(read) {
                case AccNormal: 
                    get.printIndent();
                    get.println("get");
                    get.printIndent();
                    get.println("{");
                    get.indent();
                        get.printIndent();
                        get.print("return ");
                        get.print(getFieldName(field.name));
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
                        get.print("return ");
                        get.print(getFieldName(field.name));
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
                        get.print("return ");
                        get.print(getFieldName(field.name));
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
                        get.print(getMethodName(m));
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
                        get.print(getMethodName(r));
                        get.println("();");
                    get.outdent();
                    get.printIndent();
                    get.println("}"); 
                case AccResolve:
                case AccInline:
            }
            file.print(get.toString());
            
            
            switch (write) 
            {
                case AccNormal:
                    set.printIndent();
                    set.println("set");
                    set.printIndent();
                    set.println("{");
                    set.indent();
                        set.printIndent();
                        set.print(getFieldName(field.name));
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
                       set.print(getFieldName(field.name));
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
                        set.print(getFieldName(field.name));
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
                        set.print(getMethodName(m));
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
                        set.print(getMethodName(r));
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
    
    private function dumpMethod(c:ClassType, field:ClassField, isStatic:Bool, k:MethodKind) 
    {
        switch(field.type) 
        {
            case TFun(args, ret):
            
                var modifiers = (field.isPublic) ? "public " : "protected ";
                if (isStatic) 
                {
                    modifiers += "static ";
                }
                
                file.printIndent();
                file.print(modifiers);
                printTypeReference(ret);
                file.print(" ");
                file.print(getMethodName(field.name));
                
                file.print("(");
                
                    for (i in 0 ... args.length) 
                    {
                        var param = args[i];
                        if (i > 0)
                        {
                            file.print(", ");
                        }
                        
                        printTypeReference(param.t);
                        file.print(" ");
                        file.print(getParameterName(param.name));
                        
                        if (param.opt)
                        {
                            file.print(" = ");
                            file.print(getDefaultValueForType(param.t));
                        }
                    }
                    
                file.print(")");
                
                if (c.isInterface) 
                {
                    file.println(";");
                }
                else 
                {
                    file.println();
                    if (field.expr == null)
                    {
                        file.printIndent();
                        file.println("// NOTE: no body expression found");
                    }
                    else 
                    {
                        inMethodBody = true;
                        dumpTypedExpr(field.expr);
                        inMethodBody = false;
                    }
                }
                
            default:
                file.println("/* Unknown Method Type */");
        }    
        file.println();
    }
    
    private function printTypeReference(type:Type, params:Array<Type> = null)
    {
        switch(type)
        {
            case TEnum(t, p): 
                if (params == null) 
                {
                    printBaseTypeReference(t.get(), params);
                }
                else
                {
                    printBaseTypeReference(t.get(), p);
                }
            case TInst(t, p): 
                if (params == null) 
                {
                    printBaseTypeReference(t.get(), params);
                }
                else
                {
                    printBaseTypeReference(t.get(), p);
                }
            case TType(t, p): 
                if (params == null) 
                {
                    printBaseTypeReference(t.get(), params);
                }
                else
                {
                    printBaseTypeReference(t.get(), p);
                }
                
            case TFun(args, ret): 
                dumpFunctionDef(args, ret);
            case TDynamic(t):
                file.print("dynamic");
            default:
        }
    }
    
    private function getDefaultValueForType(type:Type)
    {
        var qualifiedName = getQualifiedNameByType(type, false);
        if (qualifiedName == null) return "null";
        switch(qualifiedName)
        {
            case "Float": return "0.0";
            case "Int": return "0";
            case "Bool": return "false";
            default: return "null";
        }
    }
    
    
    private function printBaseTypeReference(t:BaseType, params:Array<Type> = null)
    {
        var fqn = getQualifiedName(t, false);
        if (typeMapping.exists(fqn))
        {
            file.print(typeMapping.get(fqn));
        }
        else
        {
            addUsing(getNamespace(t.pack));
            file.print(t.name);
            if (params != null && params.length > 0)
            {
                file.print("<");
                for (i in 0 ... params.length)
                {
                    if (i > 0)
                    {
                        file.print(", ");
                    }
                    printTypeReference(params[i]);
                }
                
                file.print(">");
            }
        }
    }
    
    private function dumpDoc(s:String)
    {
        if ( s == null ) return;
        var lines = s.split("\n");
        for (l in lines)
        {
            file.printIndent();
            file.println(l);
        }
    }
    
    //
    // Enums
    //
    
    private function dumpEnum(e:EnumType, write:Bool) 
    {
        var fqn = getQualifiedName(e);
        file.println("// enum " + fqn);
        if(write) writeFile(getFileName(fqn));
    }
    
    //
    // Typedefs
    //
    
    private function dumpTypedef(t:DefType, write:Bool) 
    {
        var fqn = getQualifiedName(t);
        file.println("// typedef " + fqn);
        if(write) writeFile(getFileName(fqn));
    }
    
    //
    // Inline Functions
    // 
    
    private function dumpFunctionDef(args : Array<{ name : String, opt : Bool, t : Type }>, ret : Type) 
    {
        var isVoidReturn = ret == null || getQualifiedNameByType(ret) == "Void";
        if (isVoidReturn)
        {
            file.print("Function");
        }
        else 
        {
            file.print("Action");
        }
        
        if (args.length > 0)
        {
            file.print("<");
            for (i in 0 ... args.length)
            {
                if (i > 0)
                {
                    file.print(", ");
                }
                
                // TODO: what are the correct type parameters for those?
                printTypeReference(args[i].t);
                //file.print(" ");
                //file.print(args[i].name);
                
                // TODO: what to do with optional arguments?
            }
            
            if (!isVoidReturn)
            {
                if (args.length > 0)
                {
                    file.print(", ");
                }
                printTypeReference(ret);
            }
            file.print(">");
        }
    }
    
    //
    // Anonymous Type
    //
    
    private function dumpAnonymousType(t:AnonType) 
    {
        file.println("// anonymous class ");
    }
    
    //
    // Expressions
    //
    
    private function dumpTypedExpr(t:TypedExpr) 
    {
        if (t != null) 
        {
            var e = this.api.getExpr(t);
            dumpExpr(e);
        }
    }

    private function dumpExpr(e:Expr, asStatement:Bool = false) 
    {
        if (e != null) 
        {
            dumpExprDef(e.expr, asStatement);
        }
    }
    
    private function dumpExprDef(e:ExprDef, asStatement:Bool = false) 
    {
        switch(e) 
        {
            case EConst( c /* : Constant  */): dumpEConst(c);
            case EArray( e1 /* : Expr */, e2 /* : Expr  */): dumpEArray(e1, e2);
            case EBinop( op /* : Binop */, e1 /* : Expr */, e2 /* : Expr  */): dumpEBinop(op, e1, e2, asStatement);
            case EField( e /* : Expr */, field /* : String  */): dumpEField(e, field, asStatement);
            case EType( e /* : Expr */, field /* : String  */): dumpEType(e, field, asStatement);
            case EParenthesis( e /* : Expr  */): dumpEParenthesis(e, asStatement);
            case EObjectDecl( fields /*: Array<{ field : String, expr : Expr }> */ ): dumpEObjectDecl(fields, asStatement);
            case EArrayDecl( values /* : Array<Expr>  */): dumpEArrayDecl(values, asStatement);
            case ECall( e /* : Expr */, params /* : Array<Expr>  */): dumpECall(e, params, asStatement);
            case ENew( t /* : TypePath */, params /* : Array<Expr>  */): dumpENew(t, params, asStatement);
            case EUnop( op /* : Unop */, postFix /* : Bool */, e /* : Expr  */): dumpEUnop(op, postFix, e, asStatement);
            case EVars( vars /* : Array<{ name : String , type : Null<ComplexType>, expr : Null<Expr> }> */): dumpEVars(vars);
            case EFunction( name /* : Null<String> */, f /* : Function  */): dumpEFunction(name, f, asStatement);
            case EBlock( exprs /* : Array<Expr>  */): dumpEBlock(exprs);
            case EFor( it /* : Expr */, expr /* : Expr  */): dumpEFor(it, expr);
            case EIn( e1 /* : Expr */, e2 /* : Expr  */): dumpEIn(e1, e2);
            case EIf( econd /* : Expr */, eif /* : Expr */, eelse /* : Null<Expr>  */): dumpEIf(econd, eif, eelse);
            case EWhile( econd /* : Expr */, e /* : Expr */, normalWhile /* : Bool  */): dumpEWhile(econd, e, normalWhile);
            case ESwitch( e /* : Expr */, cases /* : Array<{ values : Array<Expr>, expr : Expr }>*/, edef /* : Null<Expr>  */): dumpESwitch(e, cases, edef);
            case ETry( e /* : Expr */, catches /* : Array<{ name : String , type : ComplexType, expr : Expr }>*/ ): dumpETry(e, catches);
            case EReturn( e /* : Null<Expr>  */): dumpEReturn(e);
            case EBreak: dumpEBreak();
            case EContinue: dumpEContinue();
            case EUntyped( e /* : Expr  */): dumpEUntyped(e);
            case EThrow( e /* : Expr  */): dumpEThrow(e, asStatement);
            case ECast( e /* : Expr */, t /* : Null<ComplexType>  */): dumpECast(e, t, asStatement);
            case EDisplay( e /* : Expr */, isCall /* : Bool  */): dumpEDisplay(e, isCall);
            case EDisplayNew( t /* : TypePath  */): dumpEDisplayNew(t);
            case ETernary( econd /* : Expr */, eif /* : Expr */, eelse /* : Expr  */): dumpETernary(econd, eif, eelse, asStatement);
            case ECheckType(  e /* : Expr */, t /* : ComplexType */): dumpECheckType(e, t);
            default: Context.error("Invalid expresion found", null);
        }
    }
    
    private function dumpEConst( c : Constant ){
        if (c != null)
        {
            switch(c) 
            {
                case CInt( v ): file.print(v);
                case CFloat( f ):   file.print(f);
                case CString( s ) : file.print("\"" + s + "\"");
                case CIdent( s ) :  file.print(s);
                case CType( s ) :   file.print(s);
                case CRegexp( r , opt ): 
                    file.print("new EReg(\""+r+"\", \""+opt+"\")");
            }
        }
    }
    
    private function dumpEArray( e1 : Expr, e2 : Expr ) {
        dumpExpr(e1);
        file.print("[");
        dumpExpr(e2);
        file.print("]");
    }

    private function dumpEBinop( op : Binop, e1 : Expr, e2 : Expr, asStatement:Bool ) {
        if (asStatement) 
        {
            file.printIndent();
        }
        dumpExpr(e1);
        file.print(" " + getBinop(op) + " ");
        dumpExpr(e2);
        if (asStatement)
        {
            file.println(";");
        }
    }
    
    private function getBinop( op : Binop ) : String {
        switch(op) {
        	case OpAdd: return "+";
            case OpMult: return "*";
            case OpDiv: return "/";
            case OpSub: return "-";
            case OpAssign: return "=";
            case OpEq: return "==";
            case OpNotEq: return "!=";
            case OpGt: return ">";
            case OpGte: return ">=";
            case OpLt: return "<";
            case OpLte: return "<=";
            case OpAnd: return "&";
            case OpOr: return "|";
            case OpXor: return "^";
            case OpBoolAnd: return "&&";
            case OpBoolOr: return "||";
            case OpShl: return "<<";
            case OpShr: return ">>";
            case OpUShr: return ">>>";
            case OpMod: return "%";
            case OpAssignOp( op2 ): return "=" + getBinop(op2);
            case OpInterval: return "...";

        }
    }   

    private function dumpEField( e : Expr, field : String, asStatement:Bool )
    {
        if (asStatement) 
        {
            file.printIndent();
        }
        dumpExpr(e);
        file.print(".");
        file.print(getMethodName(field)); // TODO: ensure correct naming on access
        if (asStatement) 
        {
            file.println(";");
        }

    }

    private function dumpEType( e : Expr, field : String, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }
        dumpExpr(e);
        file.print(".");
        file.print(field); // TODO: ensure correct naming on access
        if (asStatement)
        {
            file.println(";");
        }
    }

    private function dumpEParenthesis( e : Expr, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }
        file.print("(");
        dumpExpr(e);
        file.print(")");
        if (asStatement)
        {
            file.println(";");
        }
    }

    private function dumpEObjectDecl( fields : Array<{ field : String, expr : Expr }>, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }
        file.println("new {");
        file.indent();
        
        for(i in 0 ... fields.length)
        {
            var f = fields[i];
            if (i > 0)
            {
                file.printIndent();
                file.println(", ");
            }
            file.printIndent();
            file.print(f.field);
            file.print(" = ");
            dumpExpr(f.expr);
            file.println();
        }
        
        file.outdent();
        file.printIndent();
        file.println("}");
        if (asStatement)
        {
            file.println(";");
        }

    }

    private function dumpEArrayDecl( values : Array<Expr>, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }

        for (i in 0 ... values.length)
        {
            if (i > 0)
            {
                file.print(", ");
            }
            dumpExpr(values[i]);
        }
        
        if (asStatement)
        {
            file.println(";");
        }
    }

    private function dumpECall( e : Expr, params : Array<Expr>, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }

        dumpExpr(e);
        
        file.print("(");
        
        for (i in 0 ... params.length)
        {
            if (i > 0)
            {
                file.print(", ");
            }
            dumpExpr(params[i]);
        }
        
        file.print(")");
        
        if (asStatement)
        {
            file.println(";");
        }
    }

    private function dumpENew( t : TypePath, params : Array<Expr>, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }

        file.print("new ");
        dumpTypePath(t);
        
        file.print("(");
        for (i in 0 ... params.length)
        {
            if (i > 0)
            {
                file.print(", ");
            }
            dumpExpr(params[i]);
        }
        file.print(")");
        
        if (asStatement)
        {
            file.println(";");
        }
    }
    
    private function dumpTypePath( t : TypePath ) 
    {
        var ns = getNamespace(t.pack, false);
        var fqn = ns.length == 0 ? getClassName(t.name) : ns + "." + getClassName(t.name);
        if (typeMapping.exists(fqn))
        {
            file.print(typeMapping.get(fqn));
        }
        else
        {
            ns = getNamespace(t.pack, true);
            addUsing(ns);

            file.print(t.name);
            if (t.params != null && t.params.length > 0)
            {
                file.print("<");
                for (i in 0 ... t.params.length)
                {
                    if (i > 0)
                    {
                        file.print(", ");
                    }
                    dumpTypeParam(t.params[i]);
                }
                
                file.print(">");
            }
        }
    }

    private function dumpTypeParam(t:TypeParam) 
    {
        switch(t) 
        {
            case TPType(t): 
                dumpComplexType(t);
            case TPExpr(e):
                // Context.error("inline type parameter are not supported", null);
        }
    }

    private function dumpEUnop( op : Unop, postFix : Bool, e : Expr, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }

        if (postFix)
        {
            dumpExpr(e);
            file.print(getUnop(op));
        }
        else
        {
            file.print(getUnop(op));
            dumpExpr(e);
        }
        
        if (asStatement)
        {
            file.println(";");
        }
    }
    
    private function getUnop(op:Unop) 
    {
        switch(op)
        {
        	case OpIncrement: return "++";
            case OpDecrement: return "--";
            case OpNot: return "!";
            case OpNeg: return "-";
            case OpNegBits: return "~";
        }
    }

    private function dumpEVars( vars : Array<{ name : String, type : Null<ComplexType>, expr : Null<Expr> }> )
    { 
        for (v in vars) 
        {
            file.printIndent();
            if (v.type == null)
            {
                file.print("var");
            }
            else
            {
                dumpComplexType(v.type);
            }
            
            file.print(" ");
            file.print(v.name);
            
            if (v.expr != null)
            {
                file.print(" = ");
                dumpExpr(v.expr);
            }
            file.println(";");
        }
    }
    
    private function dumpComplexType(t:ComplexType) 
    {
        if (t != null) 
        {
            switch(t) 
            {
                case TPath( p ): 
                    dumpTypePath(p);
                case TFunction(args , ret):
                    
                case TAnonymous( fields ):
                    // TODO 
                case TParent( t ):
                    // TODO
                case TExtend( p , fields ):
                    // TODO
            }
        }
    }
    
    private function dumpField( f : Field ) 
    {

    }
    
    private function getAccess(access:Array<Access>)
    {
        var b = new StringBuf();
        for (i in 0 ... access.length)
        {
            if (i > 0)
            {
                file.print(" ");
            }
            file.print(getAccess2(access[i]));
        }
    }
    
    private function getAccess2(access:Access) 
    {
        switch(access) 
        {
        	case APublic: return "public";
            case APrivate: return "private";
            case AStatic: return "static";
            case AOverride: return "override";
            case ADynamic: return "dynamic";
            case AInline: return "inline";
        }
    }
    
    private function dumpMeta(m:Metadata)
    {
        
    }
    
    private function dumpFieldType(f:FieldType) {
        switch(f) {
            case FVar(t, e): 
            case FFun(f): 
                dumpFunction(f);
            case FProp(get, set, t, e): 
        }
    }
    
    private function dumpFunction(f:Function) {
         
    }
    
    private function dumpFunctionArg(f:FunctionArg) {
        
    }
    

    private function dumpEFunction( name : Null<String>, f : Function, asStatement:Bool )
    {
        
        if (asStatement)
        {
            file.printIndent();
        }

        if (!inMethodBody)
        {
            file.print("(");
            for ( i in 0 ... f.args.length )
            {
                if (i > 0)
                {
                    file.print(", ");
                }
                if (f.args[i].type != null)
                {
                    dumpComplexType(f.args[i].type);
                }
                file.print(" ");
                file.print(f.args[i].name);
                // if (f.args[i].opt && f.args[i].type != null)
                // {
                //     file.print(" = ");
                //     file.print(getDefaultValueForType(f.args[i].type));
                // }
            }
            file.println(") => ");
            file.printIndent();
            file.println("{");
            file.indent();
            file.printIndent();
        }
        
        if (f.expr != null)
        {
            dumpExpr(f.expr);
        }
        
        if (!inMethodBody)
        {
            file.outdent();
            file.printIndent();
            file.println("}");
        }
        
        if (asStatement)
        {
            file.println(";");
        }

    }

    private function dumpEBlock( exprs : Array<Expr> )
    {
        file.printIndent();
        file.println("{");
        file.indent();
        
        for (e in exprs)
        {
            dumpExpr(e, true);
        }
        
        file.outdent();
        file.printIndent();
        file.println("}");
    }

    private function dumpEFor( it : Expr, expr : Expr )
    {
        file.printIndent();
        file.print("foreach (");
        dumpExpr(it);
        file.println(")");
        file.indent();
        dumpExpr(expr, true);
        file.outdent();
    }

    private function dumpEIn( e1 : Expr, e2 : Expr )
    {
        dumpExpr(e1);
        file.print(" in ");
        dumpExpr(e2);
    }

    private function dumpEIf( econd : Expr, eif : Expr, eelse : Null<Expr> ) {
        file.printIndent();
        file.print("if (");
        dumpExpr(econd);
        file.println(")");
        file.indent();
        dumpExpr(eif, true);
        file.outdent();
        
        if (eelse != null)
        {
            file.printIndent();
            file.println("else");
            file.indent();
            dumpExpr(eelse, true);
            file.outdent();
        }
    }

    private function dumpEWhile( econd : Expr, e : Expr, normalWhile : Bool )
    {
        if (normalWhile)
        {
            file.printIndent();
            file.print("while (");
            dumpExpr(econd);
            file.println(")");
            dumpExpr(e, true);
        }
        else
        {
            file.printIndent();
            file.println("do");
            dumpExpr(econd);
            file.printIndent();
            file.print("while(");
            dumpExpr(econd, true);
            file.println(");");
        }
    }

    private function dumpESwitch( e : Expr, cases : Array<{ values : Array<Expr>, expr : Expr }>, edef : Null<Expr> ){
        file.printIndent();
        file.print("switch (");
        dumpExpr(e);
        file.println(")");
        file.indent();
        
            for (c in cases)
            {
                for (v in c.values)
                {
                    file.printIndent();
                    file.print("case ");
                    dumpExpr(v);
                    file.println(":");
                }
                
                file.printIndent();
                file.println("{");
                file.indent();
                
                dumpExpr(c.expr, true);
                
                file.outdent();
                file.printIndent();
                file.println("}");
                file.printIndent();
                file.println("break;");                
            }
            
            if (edef != null)
            {
                file.printIndent();
                file.println("default:");
                file.printIndent();
                file.println("{");
                file.indent();
                
                dumpExpr(edef, true);
                
                file.outdent();
                file.printIndent();
                file.println("}");
                file.printIndent();
                file.println("break;");
            }
            
        
        file.outdent();
    }

    private function dumpETry( e : Expr, catches : Array<{ name : String, type : ComplexType, expr : Expr }> )
    {
        file.printIndent();
        file.println("try");
        
        file.printIndent();
        file.println("{");
        file.indent();
        
        dumpExpr(e, true);
        
        file.outdent();
        file.printIndent();
        file.println("}");
        
        for (c in catches)
        {
            file.printIndent();
            file.print("catch(");
            dumpComplexType(c.type); 
            file.print(" ");
            file.print(c.name);
            file.println(")");
            
            file.printIndent();
            file.println("{");
            file.indent();
            
            dumpExpr(c.expr, true);
            
            file.outdent();
            file.printIndent();
            file.println("}");
        }
    }

    private function dumpEReturn( ?e : Null<Expr> ) {
        file.printIndent();
        file.print("return ");
        if (e != null) 
        {
            dumpExpr(e);
            file.println(";");
        }
    }

    private function dumpEBreak() 
    {
        file.print("break;");
    }

    private function dumpEContinue()
    {
        file.print("continue;");
    }

    private function dumpEUntyped( e : Expr )
    {
        dumpExpr(e);
    }

    private function dumpEThrow( e : Expr, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }
        file.print("throw new HaxeException(");
        dumpExpr(e);
        file.print(")");
        
        if (asStatement)
        {
            file.println(";");
        }
    }

    private function dumpECast( e : Expr, t : Null<ComplexType>, asStatement:Bool )
    {
        if (asStatement)
        {
            file.printIndent();
        }

        // ( (Type)(Expr) )
        if (t != null)
        {
            file.print("((");
            dumpComplexType(t);
            file.print(")("); 
        }
        dumpExpr(e);
        
        if (t != null)
        {
            file.print("))");
        }
        
        if (asStatement)
        {
            file.println(";");
        }

    }

    private function dumpEDisplay( e : Expr, isCall : Bool ) {

    }

    private function dumpEDisplayNew( t : TypePath ) {
    }

    private function dumpETernary( econd : Expr, eif : Expr, eelse : Expr, asStatement:Bool ) {
        
        if (asStatement)
        {
            file.printIndent();
        }

        file.print("(");
        
        file.print("(");
        dumpExpr(econd);
        file.print(") ? (");
        dumpExpr(eif);
        file.print(") : (");
        dumpExpr(eelse);        
        file.print("))");
        
        if (asStatement)
        {
            file.println(";");
        }

    }
    
    private function dumpECheckType( e : Expr, t : ComplexType )
    {
    }
}
