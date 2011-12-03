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
    
    private var _typeMapping:Hash<String>; 
    private var _identifierMapping:Hash<String>; 
    
    private var _api : JSGenApi; 
    private var _file : SourceWriter;
    private var _inits : List<TypedExpr>;
    private var _statics : List<{ c : ClassType, f : ClassField }>;
    private var _packages : Hash<Bool>;
    private var _forbidden : Array<String>;
    private var _files : List<String>;
    
    private var _currentNamespace:String;
    private var _usings:Array<String>;
    
    private var _inMethodBody:Bool;

    //
    // General Stuff
    //
    
    public function new(api:JSGenApi) 
    {
        _api = api;
        
        _typeMapping = new Hash<String>();
        _typeMapping.set("Void", "void");
        _typeMapping.set("Float", "double");
        _typeMapping.set("Int", "int");
        _typeMapping.set("Bool", "bool");
        _typeMapping.set("String", "string");
        _typeMapping.set("Array", "HxArray");
        _typeMapping.set("Math", "HxMath");
        
        _identifierMapping = new Hash<String>();
        _identifierMapping.set("alphatab", "Alphatab");

        _file = new SourceWriter();
        _inits = new List();
        _statics = new List();
        _packages = new Hash();
        // TODO: All keywords
        _forbidden = ["byte", "short", "int", "long", "sbyte", "ushort", "uint", "ulong", "string", "public", "private", "protected", "static", "internal", "extern"];
        _files = new List<String>();
        _usings = new Array<String>();
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
        if (!neko.FileSystem.exists(_api.outputFile)) 
        {
            neko.FileSystem.createDirectory(_api.outputFile);
        }
        
        // check if dir
        if (!neko.FileSystem.isDirectory(_api.outputFile)) 
        {
            Context.error("Specified outputFile must be a directory!", null);
        }
            
        // write each type into a file
        for( t in _api.types )
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
        var typeContents = _file.toString();
        
        clear();
        _file.println("using System;");
        _file.println("using Haxe;");
        for (u in _usings) 
        {
            _file.println("using %s;", [u]);
        }
        _usings = new Array<String>();
        _file.println();
        
        _file.print(typeContents);
        
        var out = neko.io.File.write(fileName, false);
        out.writeString(_file.toString());
        out.close();
        clear();
    }
    
    private function getFileName(fqn:String)
    {
        var fullPath = _api.outputFile;
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
    
    private function saveName(s:String) : String
    {
        if (Lambda.has(_forbidden, s))
        {
            return "__" + s;
        }
        return s;
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
        if (ns != null && ns.length > 0 && !Lambda.has(_usings, ns) && !StringTools.startsWith(ns, ROOT_NAMESPACE)) 
        {
            _usings.push(ns);
        }
    }
    
    private function clear() 
    {
        _file = new SourceWriter();
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
        if (isUpperCase(s)) 
        {
            return s;
        }

        return "_" + firstToLower(s);
    }
    
    private function isUpperCase(s:String)
    {
        return (s == s.toUpperCase() && s.length > 1);
    }
    
    private function getParameterName(s:String)
    {
        // keep uppercase
        if (isUpperCase(s)) 
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
        if (isUpperCase(s)) 
        {
            return s;
        }
        return s.charAt(0).toUpperCase() + s.substr(1);
    }
    
    private function firstToLower(s:String)
    {
        return s.charAt(0).toLowerCase() + s.substr(1);
    }
    
    private function isExcluded(s:String) 
    {
        if (StringTools.startsWith(s, "haxe."))
        {
            return true;
        }
        else if (StringTools.startsWith(s, "alphatab.platform.js."))
        {
            return true;
        }
        var excludedList = ["Array", "Bool", "Class", "Date", "DateTools", 
                            "Dynamic", "EReg", "Enum", "Float", "Hash", 
                            "Int", "IntHash", "IntIter", "Iterable", "Iterator",
                            "Lambda", "List", "Math", "Null", "Refect", "Std",
                            "String", "StringBuf", "StringTools", "Type", "UInt",
                            "ValueType", "Void", "Xml", "XmlType", "js.Lib", "js.Boot"];
        
        return (Lambda.has(excludedList, s));
    }
    
    //
    // Classes
    //
    
    private function dumpClass(c:ClassType, write:Bool) 
    {
        var fqn = getQualifiedName(c);
        var hxName = c.pack.join(".");
        if (hxName.length > 0) 
        {
            hxName += ".";
        }
        hxName += c.name;
        
        if (isExcluded(hxName)) return;
        
        _currentNamespace = getNamespace(c.pack);
        _file.println("namespace %s", [_currentNamespace]);
        _file.println("{");
        
        _file.indent();
        _file.printIndent();
        
        // doc
        dumpDoc(c.doc);
        
        // TODO: Metadata as Attributes
        
        // visibility
        if (c.isPrivate)
        {
            _file.print("internal ");
        }
        else 
        {
            _file.print("public ");
        }
        
        if (c.constructor == null)
        {
            _file.print("abstract ");
        }
        
        // type
        if (c.isInterface)
        {
            _file.print("interface ");
        }
        else
        {
            _file.print("class ");
        }
        
        // name
        _file.print(getClassName(c.name));
        
        // generics
        if (c.params.length > 0)
        {
            _file.print("<");
            for (i in 0 ... c.params.length)
            {
                if (i > 0) 
                {
                    _file.print(", ");
                }
                _file.print(c.params[i].name);
            }
            _file.print(">");
        }
        
        // base class, interfaces
        if (c.superClass != null || c.interfaces.length > 0)
        {
            _file.print(" : ");
            
            if (c.superClass != null)
            {
                var superType = c.superClass.t.get();
                printBaseTypeReference(superType, c.superClass.params);
            }
            
            if (c.interfaces.length > 0)
            {
                if (c.superClass != null)
                {
                    _file.print(", ");
                }
                
                for (i in 0 ... c.interfaces.length)
                {
                    if (i > 0)
                    {
                        _file.print(", ");
                    }
                    printBaseTypeReference(c.interfaces[i].t.get(), c.interfaces[i].params);
                }
            }
        }
        _file.println();
        
        // _file.indent();
        // 
        // // type constraints
        // for (i in 0 ... c.params.length)
        // {
        //     _file.printIndent();
        //     _file.print("where ");
        //     _file.print(c.params[i].name);
        //     _file.print(" : ");
        //     printTypeReference(c.params[i].t);
        //     _file.println();
        // }
        // 
        // _file.outdent();
        _file.printIndent();
        _file.println("{");
        _file.indent();
        
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
        
        _file.outdent();
        _file.printIndent();
        _file.println("}");
        
        
        _file.outdent();
        _file.printIndent();
        _file.println("}");
        
        if (write) writeFile(getFileName(fqn));  
    }
    
    private function dumpConstructor(c:ClassType, f:ClassField)
    {
        dumpDoc(f.doc);
        
        _file.printIndent();
        switch(f.type) 
        {
            case TFun(args, ret):
            
                if (f.isPublic)
                {
                    _file.print("public ");
                }
                else
                {
                    _file.print("protected ");
                }
                
                _file.print(getClassName(c.name));
                
                _file.print("(");
                        
                    for (i in 0 ... args.length) 
                    {
                        var param = args[i];
                        if (i > 0)
                        {
                            _file.print(", ");
                        }
                        
                        printTypeReference(param.t);
                        _file.print(" ");
                        _file.print(getParameterName(param.name));
                        
                        if (param.opt)
                        {
                            _file.print(" = ");
                            getDefaultValueForType(param.t);
                        }
                    }
                    
                _file.println(")");
                
                _inMethodBody = true;
                dumpTypedExpr(f.expr);
                _inMethodBody = false;
                
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
    
    
    private function isType(t:Type, fqn:String)
    {
        return getQualifiedNameByType(t, false) == fqn;
    } 
    
    private function dumpClassField(c:ClassType, field:ClassField, isStatic:Bool, read:VarAccess, write:VarAccess) 
    {
        
        // TODO: Better check if private or protected
        var modifiers = (field.isPublic) ? "public " : "protected ";
        if (isStatic) 
        {
            modifiers += "static ";
        }
        
                    
        var createInitializer = function()
        {
            var isArray = isType(field.type, "Array");
            _file.print(" = ");
            // HACK: support for array initializer
            if (isArray)
            {
                _file.print("new ");
                printTypeReference(field.type);
                _file.print("(");
            }
            dumpTypedExpr(field.expr);
            
            if (isArray)
            {
                _file.print(")");
            }
        }
        
        if (c.isInterface) 
        {
            _file.printIndent();
            _file.print(modifiers);
            printTypeReference(field.type);
            _file.print(" ");
            _file.print(getPropertyName(field.name));
            _file.println(" { get; set; }");
        }
        // simple private field?
        else if(!field.isPublic && 
            read == VarAccess.AccNormal && write == VarAccess.AccNormal) 
        {
            
            _file.printIndent();
            _file.print(modifiers);
            printTypeReference(field.type);
            _file.print(" ");
            _file.print(field.name);
            
            if (field.expr != null)
            {
                createInitializer();
            }
            _file.println(";");
        }
        // constant?
        else if (read == VarAccess.AccInline)
        {
            _file.printIndent();
            _file.print(modifiers);
            if (isValueType(field.type))
            {
                _file.print("const ");
            }
            else
            {
                _file.print("readonly ");
            }
            
            printTypeReference(field.type);
            
            
            _file.print(" ");
            _file.print(field.name);
            if (field.expr != null)
            {
                createInitializer();
            }
            _file.println(";");
        }
        else
        {
            // create properties for more complex vars
                
            // default    -> AccNormal / AccInline if inline var
            // null       -> AccNo
            // never      -> AccNever
            // MethodName -> AccCall
            // dynamic    -> AccResolve
            
            var isProperty = false;
            
            if (!isProperty)
            {
                if( read == VarAccess.AccNormal || read == VarAccess.AccInline ||
                        write == VarAccess.AccNormal || write == VarAccess.AccInline)
                {
                    // property
                    _file.printIndent();
                    _file.print(modifiers);
                    printTypeReference(field.type);
                    _file.print(" ");
                    _file.print(getPropertyName(field.name));
                    
                    if (field.expr != null)
                    {
                        createInitializer();
                    }

                    
                    _file.println(";");
                }
            }
            else
            {
                // private var
                var needPrivateVar:Bool;
                if( read == VarAccess.AccNormal || read == VarAccess.AccInline ||
                        write == VarAccess.AccNormal || write == VarAccess.AccInline)
                {
                    _file.printIndent();
                    _file.print("private ");
                    if (isStatic)
                    {
                        _file.print("static ");
                    }
                    printTypeReference(field.type);
                    _file.print(" ");
                    _file.print(getFieldName(field.name));
                    if (field.expr != null)
                    {
                        _file.print(" = ");
                        dumpTypedExpr(field.expr);
                    }
                    _file.println(";");
                }
                
                // property
                _file.printIndent();
                _file.print(modifiers);
                printTypeReference(field.type);
                _file.print(" ");
                _file.println(getPropertyName(field.name));
                
                _file.printIndent();
                _file.println("{");
                _file.indent();
                
                var get = new SourceWriter();
                get.indention = _file.indention;
                
                var set = new SourceWriter();
                set.indention = _file.indention;
                
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
                    case AccCall(m):
                        get.printIndent();
                        get.println("get");
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
                        get.println("get");
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
                _file.print(get.toString());
                
                
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
                        set.println("private set");
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
                        set.println("set");
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
                        set.println("set");
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
                _file.print(set.toString());
                _file.outdent();
                _file.printIndent();
                _file.println("}");
            }
            
        }
         
        _file.println();
    }
    
    private function hasField(c:ClassType, field:String)
    {
        for (f in c.fields.get())
        {
            if (f.name == field)
            {
                return true;
            }
        }        
        return false;
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
                
                _file.printIndent();
                _file.print(modifiers);
                
                if (c.superClass != null && hasField(c.superClass.t.get(), field.name))
                {
                    _file.print("override ");
                } 
                else if(!isStatic)
                {
                    // TODO: Preprocess all methods
                    _file.print("virtual ");
                }
                
                printTypeReference(ret);
                _file.print(" ");
                
                _file.print(getMethodName(field.name));
                
                _file.print("(");
                
                    for (i in 0 ... args.length) 
                    {
                        var param = args[i];
                        if (i > 0)
                        {
                            _file.print(", ");
                        }
                        
                        printTypeReference(param.t);
                        _file.print(" ");
                        _file.print(getParameterName(param.name));
                        
                        if (param.opt)
                        {
                            _file.print(" = ");
                            _file.print(getDefaultValueForType(param.t));
                        }
                    }
                    
                _file.print(")");
                
                if (c.isInterface) 
                {
                    _file.println(";");
                }
                else 
                {
                    _file.println();
                    if (field.expr == null)
                    {
                        _file.printIndent();
                        _file.println("// NOTE: no body expression found");
                    }
                    else 
                    {
                        _inMethodBody = true;
                        dumpTypedExpr(field.expr);
                        _inMethodBody = false;
                    }
                }
                
            default:
                _file.println("/* Unknown Method Type */");
        }    
        _file.println();
    }
    
    private function printTypeReference(type:Type, params:Array<Type> = null)
    {
        switch(type)
        {
            case TEnum(t, p): 
                if (params != null) 
                {
                    printBaseTypeReference(t.get(), params);
                }
                else
                {
                    printBaseTypeReference(t.get(), p);
                }
            case TInst(t, p): 
                if (params != null) 
                {
                    printBaseTypeReference(t.get(), params);
                }
                else
                {
                    printBaseTypeReference(t.get(), p);
                }
            case TType(t, p): 
                if (params != null) 
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
                _file.print("dynamic");
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
        if (_typeMapping.exists(fqn))
        {
            _file.print(_typeMapping.get(fqn));
        }
        else
        {
            addUsing(getNamespace(t.pack));
            _file.print(t.name);
        }
        
        if (params != null && params.length > 0)
        {
            _file.print("<");
            for (i in 0 ... params.length)
            {
                if (i > 0)
                {
                    _file.print(", ");
                }
                printTypeReference(params[i]);
            }

            _file.print(">");
        }
    }
    
    private function dumpDoc(s:String)
    {
        if ( s == null ) return;
        var lines = s.split("\n");
        for (l in lines)
        {
            _file.printIndent();
            _file.println(l);
        }
    }
    
    //
    // Enums
    //
    
    private function dumpEnum(e:EnumType, write:Bool) 
    {
        var fqn = getQualifiedName(e);
        
        _currentNamespace = getNamespace(e.pack);
        _file.println("namespace %s", [_currentNamespace]);
        _file.println("{");
        
        _file.indent();
        _file.printIndent();
        
        // doc
        dumpDoc(e.doc);
        
        // TODO: Metadata as Attributes
        
        // visibility
        if (e.isPrivate)
        {
            _file.print("internal ");
        }
        else 
        {
            _file.print("public ");
        }
        
        // type
        _file.print("enum ");
        
        // name
        _file.print(getClassName(e.name));
        
        // generics
        if (e.params.length > 0)
        {
            _file.print("<");
            for (i in 0 ... e.params.length)
            {
                if (i > 0) 
                {
                    _file.print(", ");
                }
                _file.print(e.params[i].name);
            }
            _file.print(">");
        }
        _file.println();
        
        _file.printIndent();
        _file.println("{");
        _file.indent();
        
        // static
        for (i in 0 ... e.names.length)
        {
            if (i > 0)
            {
                _file.println(",");
            }
            
            _file.printIndent();
            _file.print(e.names[i]);
        }
        
        _file.println();
        
        _file.outdent();
        _file.printIndent();
        _file.println("}");
        
        
        _file.outdent();
        _file.printIndent();
        _file.println("}");
        
        if (write) writeFile(getFileName(fqn));
    }
    
    //
    // Typedefs
    //
    
    private function dumpTypedef(t:DefType, write:Bool) 
    {
        // var fqn = getQualifiedName(t);
        // _file.println("// typedef " + fqn);
        // if(write) writeFile(getFileName(fqn));
    }
    
    //
    // Inline Functions
    // 
    
    private function dumpFunctionDef(args : Array<{ name : String, opt : Bool, t : Type }>, ret : Type) 
    {
        var isVoidReturn = ret == null || getQualifiedNameByType(ret, false) == "Void";
        if (isVoidReturn)
        {
            _file.print("Action");
        }
        else 
        {
            _file.print("Func");
        }
        
        if (args.length > 0)
        {
            _file.print("<");
            for (i in 0 ... args.length)
            {
                if (i > 0)
                {
                    _file.print(", ");
                }
                
                // TODO: what are the correct type parameters for those?
                printTypeReference(args[i].t);
                //_file.print(" ");
                //_file.print(args[i].name);
                
                // TODO: what to do with optional arguments?
            }
            
            if (!isVoidReturn)
            {
                if (args.length > 0)
                {
                    _file.print(", ");
                }
                printTypeReference(ret);
            }
            _file.print(">");
        }
    }
    
    //
    // Anonymous Type
    //
    
    private function dumpAnonymousType(t:AnonType) 
    {
        _file.println("// anonymous class ");
    }
    
    //
    // Expressions
    //
    
    private function dumpTypedExpr(t:TypedExpr) 
    {
        if (t != null) 
        {
            var e = _api.getExpr(t);
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
            case EIf( econd /* : Expr */, eif /* : Expr */, eelse /* : Null<Expr>  */): dumpEIf(econd, eif, eelse, asStatement);
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
                case CInt( v ): _file.print(v);
                case CFloat( f ):   _file.print(f);
            case CString( s ) : 
                var d = StringTools.replace(s, "\\", "\\\\");
                d = StringTools.replace(d, "\"", "\\\"");
                d = StringTools.replace(d, "\n", "\\n");
                d = StringTools.replace(d, "\r", "\\r");
                d = StringTools.replace(d, "\t", "\\t");
                _file.print("\"" + d + "\"");
            case CIdent( s ) :  
                if (_identifierMapping.exists(s)) 
                    _file.print(_identifierMapping.get(s))
                else
                    _file.print(saveName(s));
                case CType( s ) :  
                    // TODO: do better mapping
                    if (_typeMapping.exists(s)) 
                        _file.print(_typeMapping.get(s));
                    else
                        _file.print(s);
                case CRegexp( r , opt ): 
                    _file.print("new EReg(\""+r+"\", \""+opt+"\")");
            }
        }
    }
    
    private function dumpEArray( e1 : Expr, e2 : Expr ) {
        dumpExpr(e1);
        _file.print("[");
        dumpExpr(e2);
        _file.print("]");
    }
    
    
    private function dumpEArrayDecl( values : Array<Expr>, asStatement:Bool )
    {
        if (asStatement)
        {
            _file.printIndent();
        }
        
        for (i in 0 ... values.length)
        {
            if (i > 0)
            {
                _file.print(", ");
            }
            dumpExpr(values[i]);
        }
        
        if (asStatement)
        {
            _file.println(";");
        }
    }


    private function dumpEBinop( op : Binop, e1 : Expr, e2 : Expr, asStatement:Bool ) {
        if (asStatement) 
        {
            _file.printIndent();
        }
        dumpExpr(e1);
        _file.print(" " + getBinop(op) + " ");
        dumpExpr(e2);
        if (asStatement)
        {
            _file.println(";");
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
            case OpAssignOp( op2 ): return getBinop(op2) + "=";
            case OpInterval: return "...";

        }
    }   

    private function dumpEField( e : Expr, field : String, asStatement:Bool )
    {
        if (asStatement) 
        {
            _file.printIndent();
        }
        
        dumpExpr(e);
        _file.print(".");
        _file.print(getMethodName(field)); 
        if (asStatement) 
        {
            _file.println(";");
        }

    }

    private function dumpEType( e : Expr, field : String, asStatement:Bool )
    {
        if (asStatement)
        {
            _file.printIndent();
        }
        dumpExpr(e);
        _file.print(".");
        _file.print(getMethodName(field)); 
        if (asStatement)
        {
            _file.println(";");
        }
    }

    private function dumpEParenthesis( e : Expr, asStatement:Bool )
    {
        if (asStatement)
        {
            _file.printIndent();
        }
        _file.print("(");
        dumpExpr(e);
        _file.print(")");
        if (asStatement)
        {
            _file.println(";");
        }
    }

    private function dumpEObjectDecl( fields : Array<{ field : String, expr : Expr }>, asStatement:Bool )
    {
        if (asStatement)
        {
            _file.printIndent();
        }
        _file.println("new {");
        _file.indent();
        
        for(i in 0 ... fields.length)
        {
            var f = fields[i];
            if (i > 0)
            {
                _file.printIndent();
                _file.println(", ");
            }
            _file.printIndent();
            _file.print(f.field);
            _file.print(" = ");
            dumpExpr(f.expr);
            _file.println();
        }
        
        _file.outdent();
        _file.printIndent();
        _file.println("}");
        if (asStatement)
        {
            _file.println(";");
        }

    }

    private function dumpECall( e : Expr, params : Array<Expr>, asStatement:Bool )
    {
        if (asStatement)
        {
            _file.printIndent();
        }

        dumpExpr(e);
        
        _file.print("(");
        
        for (i in 0 ... params.length)
        {
            if (i > 0)
            {
                _file.print(", ");
            }
            dumpExpr(params[i]);
        }
        
        _file.print(")");
        
        if (asStatement)
        {
            _file.println(";");
        }
    }

    private function dumpENew( t : TypePath, params : Array<Expr>, asStatement:Bool )
    {
        if (asStatement)
        {
            _file.printIndent();
        }

        _file.print("new ");
        dumpTypePath(t);
        
        _file.print("(");
        for (i in 0 ... params.length)
        {
            if (i > 0)
            {
                _file.print(", ");
            }
            dumpExpr(params[i]);
        }
        _file.print(")");
        
        if (asStatement)
        {
            _file.println(";");
        }
    }
    
    private function dumpTypePath( t : TypePath ) 
    {
        var ns = getNamespace(t.pack, false);
        var fqn = ns.length == 0 ? getClassName(t.name) : ns + "." + getClassName(t.name);
        if (_typeMapping.exists(fqn))
        {
            _file.print(_typeMapping.get(fqn));
        }
        else
        {
            ns = getNamespace(t.pack, true);
            addUsing(ns);

            _file.print(t.name);
        }
        
        if (t.params != null && t.params.length > 0)
        {
            _file.print("<");
            for (i in 0 ... t.params.length)
            {
                if (i > 0)
                {
                    _file.print(", ");
                }
                dumpTypeParam(t.params[i]);
            }
            
            _file.print(">");
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
            _file.printIndent();
        }

        if (postFix)
        {
            dumpExpr(e);
            _file.print(getUnop(op));
        }
        else
        {
            _file.print(getUnop(op));
            dumpExpr(e);
        }
        
        if (asStatement)
        {
            _file.println(";");
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
            _file.printIndent();
            if (v.type == null)
            {
                _file.print("var");
            }
            else
            {
                dumpComplexType(v.type);
            }
            
            _file.print(" ");
            _file.print(saveName(v.name));
            
            if (v.expr != null)
            {
                _file.print(" = ");
                dumpExpr(v.expr);
            }
            _file.println(";");
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
                    // TODO
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
                _file.print(" ");
            }
            _file.print(getAccess2(access[i]));
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
    
    private function dumpFunction(f:Function)
    {
         
    }
    
    private function dumpFunctionArg(f:FunctionArg)
    {
        
    }
    

    private function dumpEFunction( name : Null<String>, f : Function, asStatement:Bool )
    {
        
        if (asStatement)
        {
            _file.printIndent();
        }

        var inBody = _inMethodBody;
        if (!inBody)
        {
            _file.print("(");
            for ( i in 0 ... f.args.length )
            {
                if (i > 0)
                {
                    _file.print(", ");
                }
                if (f.args[i].type != null)
                {
                    dumpComplexType(f.args[i].type);
                }
                _file.print(" ");
                _file.print(f.args[i].name);
                // if (f.args[i].opt && f.args[i].type != null)
                // {
                //     _file.print(" = ");
                //     _file.print(getDefaultValueForType(f.args[i].type));
                // }
            }
            _file.println(") => ");
            _file.printIndent();
            _file.println("{");
            _file.indent();
            _file.printIndent();
        }
        
        if (f.expr != null)
        {
            _inMethodBody = false;
            dumpExpr(f.expr);
        }
        
        if (!inBody)
        {
            _file.outdent();
            _file.printIndent();
            _file.println("}");
        }
        
        if (asStatement)
        {
            _file.println(";");
        }

    }

    private function dumpEBlock( exprs : Array<Expr> )
    {
        _file.printIndent();
        _file.println("{");
        _file.indent();
        
        for (e in exprs)
        {
            dumpExpr(e, true);
        }
        
        _file.outdent();
        _file.printIndent();
        _file.println("}");
    }

    private function dumpEFor( it : Expr, expr : Expr )
    {
        _file.printIndent();
        _file.print("foreach (");
        dumpExpr(it);
        _file.println(")");
        dumpExpr(expr, true);
    }

    private function dumpEIn( e1 : Expr, e2 : Expr )
    {
        _file.print("var ");
        dumpExpr(e1);
        _file.print(" in ");
        dumpExpr(e2);
    }

    private function dumpEIf( econd : Expr, eif : Expr, eelse : Null<Expr>, asStatement:Bool ) {
        
        if (asStatement)
        {
            _file.printIndent();
            _file.print("if (");
            dumpExpr(econd);
            _file.println(")");
            dumpExpr(eif, true);
            
            if (eelse != null)
            {
                _file.printIndent();
                _file.println("else");
                dumpExpr(eelse, true);
            }
        }
        else
        {
            dumpETernary(econd, eif, eelse, false);
        }
    }

    private function dumpEWhile( econd : Expr, e : Expr, normalWhile : Bool )
    {
        if (normalWhile)
        {
            _file.printIndent();
            _file.print("while (");
            dumpExpr(econd);
            _file.println(")");
            dumpExpr(e, true);
        }
        else
        {
            _file.printIndent();
            _file.println("do");
            dumpExpr(e, true);
            _file.printIndent();
            _file.print("while(");
            dumpExpr(econd);
            _file.println(");");
        }
    }

    private function dumpESwitch( e : Expr, cases : Array<{ values : Array<Expr>, expr : Expr }>, edef : Null<Expr> )
    {
        _file.printIndent();
        _file.print("switch (");
        dumpExpr(e);
        _file.println(")");
        
        _file.printIndent();
        _file.println("{");
        _file.indent();
        
            for (c in cases)
            {
                for (v in c.values)
                {
                    _file.printIndent();
                    _file.print("case ");
                    dumpExpr(v);
                    _file.println(":");
                }
                
                _file.printIndent();
                _file.println("{");
                _file.indent();
                
                dumpExpr(c.expr, true);
                
                _file.outdent();
                _file.printIndent();
                _file.println("}");
                _file.printIndent();
                _file.println("break;");                
            }
            
            if (edef != null)
            {
                _file.printIndent();
                _file.println("default:");
                _file.printIndent();
                _file.println("{");
                _file.indent();
                
                dumpExpr(edef, true);
                
                _file.outdent();
                _file.printIndent();
                _file.println("}");
                _file.printIndent();
                _file.println("break;");
            }
            
        
        _file.outdent();
        _file.printIndent();
        _file.println("}");
    }

    private function dumpETry( e : Expr, catches : Array<{ name : String, type : ComplexType, expr : Expr }> )
    {
        _file.printIndent();
        _file.println("try");
        
        dumpExpr(e, true);
        
        for (c in catches)
        {
            _file.printIndent();
            _file.print("catch(HaxeException<");
            dumpComplexType(c.type); 
            _file.print("> ");
            _file.print(c.name);
            _file.println(")");
            
            dumpExpr(c.expr, true);
        }
    }

    private function dumpEReturn( ?e : Null<Expr> ) {
        _file.printIndent();
        _file.print("return ");
        if (e != null) 
        {
            dumpExpr(e);
        }
        _file.println(";");
    }

    private function dumpEBreak() 
    {
        _file.printIndent();
        _file.println("break;");
    }

    private function dumpEContinue()
    {
        _file.printIndent();
        _file.println("continue;");
    }

    private function dumpEUntyped( e : Expr )
    {
        dumpExpr(e);
    }

    private function dumpEThrow( e : Expr, asStatement:Bool )
    {
        if (asStatement)
        {
            _file.printIndent();
        }
        _file.print("throw new HaxeException(");
        dumpExpr(e);
        _file.print(")");
        
        if (asStatement)
        {
            _file.println(";");
        }
    }

    private function dumpECast( e : Expr, t : Null<ComplexType>, asStatement:Bool )
    {
        if (asStatement)
        {
            _file.printIndent();
        }

        // ( (Type)(Expr) )
        if (t != null)
        {
            _file.print("((");
            dumpComplexType(t);
            _file.print(")("); 
        }
        dumpExpr(e);
        
        if (t != null)
        {
            _file.print("))");
        }
        
        if (asStatement)
        {
            _file.println(";");
        }

    }

    private function dumpEDisplay( e : Expr, isCall : Bool ) {

    }

    private function dumpEDisplayNew( t : TypePath ) {
    }

    private function dumpETernary( econd : Expr, eif : Expr, eelse : Expr, asStatement:Bool ) {
        
        if (asStatement)
        {
            _file.printIndent();
        }

        _file.print("(");
        
        _file.print("(");
        dumpExpr(econd);
        _file.print(") ? (");
        dumpExpr(eif);
        _file.print(") : (");
        dumpExpr(eelse);        
        _file.print("))");
        
        if (asStatement)
        {
            _file.println(";");
        }

    }
    
    private function dumpECheckType( e : Expr, t : ComplexType )
    {
    }
}
