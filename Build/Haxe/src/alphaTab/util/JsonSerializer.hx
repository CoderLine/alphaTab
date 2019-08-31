package alphaTab.util;

import haxe.macro.Expr;
import haxe.macro.Context;
import haxe.macro.ExprTools;

class JsonSerializer 
{
    public static macro function toJson() : Expr
    {
        var type = Context.getLocalType();

        var statements = new Array<Expr>();

        statements.push(macro {
            var json:Dynamic = { };
        });

        switch(type)
        {
            case TInst(tclass, params):
                var classType = tclass.get();
                var classTypeName = classType.pack.join('.') + '.' + classType.name;
                statements.push(macro {
                    var obj = new $classTypeName();
                });


                for(f in classType.fields.get())
                {
                    var jsonMeta = f.meta.extract('json');
                    var jsonNames = jsonMeta.length > 0 ? jsonMeta[0].params : null;
                    if(jsonNames != null && jsonNames.length > 0)
                    {
                        var jsonName = ExprTools.getValue(jsonNames[0]);
                        switch(f.type)
                        {
                            case TInst(tfield, params):
                                // custom class 
                                // json.$jsonName = FieldTypeName.toJson(obj.fieldName);
                                                      
                                var fieldType = tfield.get();

                                var fieldTypeName = fieldType.pack.join('.') + '.' + fieldType.name;
                                
                                statements.push(macro {
                                    trace('json.${jsonName} = ${fieldTypeName}.toJson(obj.${f.name});');
                                });
                                
                            case TAbstract(tfield, params):
                            
                            default:
                                // TODO error of unsupported member
                        }
                    }
                }
            default:
        }
                
      
        return macro $a{statements};
    }
    
    public static macro function fromJson(objExpr:Expr, jsonExpr:Expr) : Expr
    {
        var type = Context.getLocalType();  
        var statements = new Array<Expr>();
        
        statements.push(macro {
            trace('Test');
        });
        
        statements.push(macro {
            trace('Blubb');
        });
        
        return macro $a{statements};        
    }
    
    
    
}
