#if macro
package alphaTab;

import haxe.macro.Expr;
import haxe.macro.Type;
import haxe.macro.Context;
import haxe.macro.ExprTools;
import haxe.macro.TypeTools;
import haxe.macro.ComplexTypeTools;

class JsonSerializationBuilder {
	public static macro function build():Array<Field> {
		var fields = Context.getBuildFields();

		var currentType = Context.getLocalType();

        var typeToBuild:Type = null;

        switch (currentType) {
			case TInst(t, params):
				typeToBuild = currentType;
				switch (t.get().kind) {
					case KAbstractImpl(a):
                        typeToBuild = TAbstract(a, params);
					default:
				}

			case TAbstract(t, params):
                typeToBuild = currentType;

			default:
                trace("Unsupported JSON serialization type: " + currentType);
                return fields;
		}

		var toJsonMethod:Field = null;
		var fromJsonMethod:Field = null;
		var fillToJsonMethod:Field = null;
		var fillFromJsonMethod:Field = null;
		var setPropertyMethod:Field = null;

		var properties = new Array<Field>();

		for (f in fields) {
			switch (f.kind) {
				case FVar(t, e):
					properties.push(f);
				case FFun(fun):
					switch (f.name) {
						case 'toJson':
							toJsonMethod = f;
						case 'fromJson':
							fromJsonMethod = f;
						case 'fillToJson':
							fillToJsonMethod = f;
						case 'fillFromJson':
							fillFromJsonMethod = f;
						case 'setProperty':
							setPropertyMethod = f;
					}
				case FProp(get, set, t, e):
					properties.push(f);
			}
		}

		var isAbstract = false;
		switch(typeToBuild) {
			case TInst(t, p):
			    isAbstract = false;
			case TAbstract(t,p):
				isAbstract = true;
			default:
				trace('Unsupported kind: ' + typeToBuild);
		}

		if (toJsonMethod == null) {
			toJsonMethod = {
				name: 'toJson',
				meta: [],
				access: [AStatic, APublic],
				pos: Context.currentPos(),
				kind: FFun({
					args: [{name: 'obj', type: Context.toComplexType(typeToBuild)}],
					expr: null,
					ret: macro:Dynamic
				})
			}
			fields.push(toJsonMethod);
		}

		if (fillToJsonMethod == null) {
			fillToJsonMethod = {
				name: 'fillToJson',
				meta: [],
				access: [APublic],
				pos: Context.currentPos(),
				kind: FFun({
					args: [{name: 'obj', type: macro:Dynamic}],
					expr: null,
					ret: macro:Void
				})
			}
			if(!isAbstract)
			{
				fields.push(fillToJsonMethod);
			}
		}

		if (fromJsonMethod == null) {
			fromJsonMethod = {
				name: 'fromJson',
				meta: [],
				access: [AStatic, APublic],
				pos: Context.currentPos(),
				kind: FFun({
					args: [{name: 'json', type: macro:Dynamic}],
					expr: null,
					ret: Context.toComplexType(typeToBuild)
				})
			}
			fields.push(fromJsonMethod);
		}

		if (fillFromJsonMethod == null) {
			fillFromJsonMethod = {
				name: 'fillFromJson',
				meta: [],
				access: [APublic],
				pos: Context.currentPos(),
				kind: FFun({
					args: [{name: 'json', type: macro:Dynamic}],
					expr: null,
					ret: macro:Void
				})
			}
			if(!isAbstract)
			{
            	fields.push(fillFromJsonMethod);
			}
		}

		if (setPropertyMethod == null) {
			setPropertyMethod = {
				name: 'setProperty',
				meta: [],
				access: [APublic],
				pos: Context.currentPos(),
				kind: FFun({
					args: [
					    {name: 'property', type: macro:system.CsString},
					    {name: 'value', type: macro:Dynamic },
					    {name: 'partial', type: macro:Bool }
                    ],
					expr: null,
					ret: macro:Void
				})
			}
			if(!isAbstract)
			{
            	fields.push(setPropertyMethod);
			}
		}

        switch(typeToBuild) {
            case TInst(t, p):
                switch (toJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "obj";
                        fun.expr = generateToJsonBodyForClass(properties, typeToBuild);
                    default:
                        trace('Invalid method kind');
                }

                switch (fillToJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "json";
                        fun.expr = generateFillToJsonBodyForClass(properties, typeToBuild);
                    default:
                        trace('Invalid method kind');
                }

                switch (fromJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "json";
                        fun.expr = generateFromJsonBodyForClass(properties, t.get());
                    default:
                     trace('Invalid method kind');
                }

				switch (fillFromJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "json";
                        fun.expr = generateFillFromJsonBodyForClass(properties, t.get());
                    default:
                     trace('Invalid method kind');
                }

				switch (setPropertyMethod.kind) {
                    case FFun(fun):
                        fun.expr = generateSetPropertyMethodBodyForClass(properties, t.get());
                    default:
                     trace('Invalid method kind');
                }
            case TAbstract(t,p):
                switch (toJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "obj";
                        fun.expr = generateToJsonBodyForAbstract(properties, t.get());
                    default:
                     trace('Invalid method kind');
                }

                switch (fromJsonMethod.kind) {
                    case FFun(fun):
						fun.args[0].name = "json";
                        fun.expr = generateFromJsonBodyForAbstract(properties, t.get());
                    default:
                     trace('Invalid method kind');
                }
            default:
                trace('Unsupported kind: ' + typeToBuild);
        }

        return fields;
	}

	private static function generateToJsonBodyForAbstract(fields:Array<Field>, sourceType:AbstractType):Expr {
		var statements = new Array<Expr>();

		statements.push(macro return obj.toInt32_IFormatProvider(null));

		return macro $b{statements};
	}

	private static function generateFromJsonBodyForAbstract(fields:Array<Field>, sourceType:AbstractType):Expr {
		var statements = new Array<Expr>();

		statements.push(macro if(untyped __js__("typeof json === 'number'")) {
			return json;
		});

		statements.push(macro if(untyped __js__("typeof json === 'string'")) {
			return fromString(json);
		});

		statements.push(macro throw new alphaTab.utils.SerializationException().SerializationException('Unsupported value type')	);

		return macro $b{statements};
	}

	private static function generateToJsonBodyForClass(fields:Array<Field>, sourceType:Type):Expr {
		var statements = new Array<Expr>();

		var sourceTypeComplex:ComplexType = Context.toComplexType(sourceType);

		statements.push(macro var json:Dynamic = {});
		statements.push(macro obj.fillToJson(json));
		statements.push(macro return json);

		return macro $b{statements};
	}

	private static function generateFillToJsonBodyForClass(fields:Array<Field>, sourceType:Type):Expr {
		var statements = new Array<Expr>();

		var sourceTypeComplex:ComplexType = Context.toComplexType(sourceType);

		for(f in fields) {
			var fieldName:String = f.name;
			var jsonName:String = null;
			if (f.meta != null) {
				for (metaEntry in f.meta) {
					if (metaEntry.name == "json" && metaEntry.params != null) {
						for (v in metaEntry.params) {
							var name = ExprTools.getValue(v).toString();
							if (name != "") {
								jsonName = name;
							}
						}
					}
				}
			}

			if(jsonName != null) {
				var fieldType:ComplexType = null;
				switch (f.kind) {
					case FVar(t, e):
						fieldType = t;
					case FProp(get, set, t, e):
						fieldType = t;
					default:
				}

				if (fieldType != null) {
					var fieldTypeType = ComplexTypeTools.toType(fieldType);
					switch (fieldTypeType) {
						case TInst(tfield, params):
							var fieldType = tfield.get();

							var fieldTypeName = fieldType.pack.join('.') + '.' + fieldType.name;

							if(isImmutable(fieldType)) {
								statements.push(macro {
									json.$jsonName = $p{fieldTypeName.split('.')}.toJson(this.$fieldName);
								});
							}
							else {
								statements.push(macro {
									if(json.$jsonName == null) {
										json.$jsonName = $p{fieldTypeName.split('.')}.toJson(this.$fieldName);
									} else {
										this.$fieldName.fillToJson(json.$jsonName);
									}
								});
							}



						case TAbstract(tabs, params):
							var abstractType = tabs.get();
							var fullName = abstractType.pack.join('.') + '.' + abstractType.name;

							switch (fullName) {
								case 'system.CsString',
									'system.Boolean',
									'system.Byte',
									'system.SByte',
									'system.Int16',
									'system.UInt16',
									'system.Int32',
									'system.UInt32',
									'system.Int64',
									'system.UInt64',
									'system.Single',
									'system.Double',
									'system.Char':
									statements.push(macro {
										json.$jsonName = this.$fieldName;
									});

								case 'system.BooleanArray',
									'system.ByteArray',
									'system.SByteArray',
									'system.Int16Array',
									'system.UInt16Array',
									'system.Int32Array',
									'system.UInt32Array',
									'system.Int64Array',
									'system.UInt64Array',
									'system.SingleArray',
									'system.DoubleArray',
									'system.CharArray':
									statements.push(macro {
										json.$jsonName = this.$fieldName == null ? null : this.$fieldName.clone();
									});

								default:
									statements.push(macro {
										json.$jsonName = $p{fullName.split('.')}.toJson(this.$fieldName);
									});
							}

						default:
							statements.push(macro {
								json.$jsonName = this.$fieldName;
							});
					}
				}
			}
		}

		return macro $b{statements};
	}

	private static function generateFromJsonBodyForClass(fields:Array<Field>, targetType:ClassType):Expr {
		var statements = new Array<Expr>();

		var targetTypePath:TypePath = {
			pack: targetType.pack,
			name: targetType.name
		};

		statements.push(macro if(json == null) return null);

		statements.push(macro var obj = new $targetTypePath());
		statements.push(macro obj.fillFromJson(obj));
		statements.push(macro return obj);

		return macro $b{statements};
	}

	private static function isImmutable(type:ClassType) : Bool {
		return type.meta.has("immutable");
	}

	private static function generateSetPropertyMethodBodyForClass(fields:Array<Field>, targetType:ClassType):Expr {
		var statements = new Array<Expr>();

		var targetTypePath:TypePath = {
			pack: targetType.pack,
			name: targetType.name
		};

		var switchExpr:Expr = macro switch(property) {
		    default: { }
        };
		statements.push(switchExpr);

        var switchCases:Array<Case> = null;
        switch(switchExpr.expr) {
            case ESwitch(e, cases, edef):
                switchCases = cases;
            default:
        }

		for (f in fields) {
			var fieldCase:Case = {
				values: [],
				expr: null
			}

			var jsonNames = new Array<Expr>();
			if (f.meta != null) {
				for (metaEntry in f.meta) {
					if (metaEntry.name == "json" && metaEntry.params != null) {
						for (v in metaEntry.params) {
							var name = ExprTools.getValue(v).toString();
							if (name != "") {
							    var jsonName = {
									pos: Context.currentPos(),
									expr: EConst(CString(name.toLowerCase()))
								}
								jsonNames.push(jsonName);

								fieldCase.values.push(jsonName);
							}
						}
					}
				}
			}

			if (jsonNames.length > 0) {
			    var fieldName:String = f.name;
                var fieldType:ComplexType = null;
                switch (f.kind) {
                    case FVar(t, e):
                        fieldType = t;
                    case FProp(get, set, t, e):
                        fieldType = t;
                    default:
                }

                var val = macro value;

                if (fieldType != null) {
                    var fieldTypeType = ComplexTypeTools.toType(fieldType);
                    switch (fieldTypeType) {
                        case TInst(tfield, params):
                            var fieldType = tfield.get();
                            var fieldTypeName = fieldType.pack.copy();
                            fieldTypeName.push(fieldType.name);

                            if(isImmutable(fieldType)) {
                                // for immutable types a fromJson for deserialization of the value is used
                                switchCases.push(fieldCase);
                                fieldCase.expr = macro {
                                    this.$fieldName = $p{fieldTypeName}.fromJson(${val});
                                };
                            }
                            else {
                                // for complex types it is a bit more tricky
                                // if the property matches exactly, we use fromJson
                                // if the property starts with the field name, we try to set a sub-property
                                var newExpr:Expr = {
									pos: Context.currentPos(),
									expr: ENew({pack:fieldType.pack, name: fieldType.name}, [])
                                };
                                var complexMapping = macro {
                                    if(alphaTab.platform.Platform.equalsAny(property, [$a{jsonNames}])) {
                                        this.$fieldName = $p{fieldTypeName}.fromJson(${val});
                                        return;
                                    } else if(partial) {
                                        var partialMatch = alphaTab.platform.Platform.findStartsWith(property, [$a{jsonNames}]);
                                        if(partialMatch != null) {
                                            if(this.$fieldName == null) {
                                                this.$fieldName = ${newExpr};
                                            }
                                            this.$fieldName.setProperty(property.substring_Int32(partialMatch.length) , ${val}, true);
                                            return;
                                        }
                                    }
                                };
                                statements.push(complexMapping);
                            }


                        case TAbstract(tabs, params):
                            // abstracts are simple field assignments only
                            switchCases.push(fieldCase);

                            var abstractType = tabs.get();
                            var fullName = abstractType.pack.join('.') + '.' + abstractType.name;

                            switch (fullName) {
                                case 'system.CsString',
                                    'system.Boolean',
                                    'system.Byte',
                                    'system.SByte',
                                    'system.Int16',
                                    'system.UInt16',
                                    'system.Int32',
                                    'system.UInt32',
                                    'system.Int64',
                                    'system.UInt64',
                                    'system.Single',
                                    'system.Double',
                                    'system.Char':
                                    // TODO: better validation of input value vs output value
                                    fieldCase.expr = macro {
                                        this.$fieldName = ${val};
                                        return;
                                    };


                                    case 'system.BooleanArray',
                                    'system.ByteArray',
                                    'system.SByteArray',
                                    'system.Int16Array',
                                    'system.UInt16Array',
                                    'system.Int32Array',
                                    'system.UInt32Array',
                                    'system.Int64Array',
                                    'system.UInt64Array',
                                    'system.SingleArray',
                                    'system.DoubleArray',
                                    'system.CharArray':
                                    // TODO: better validation of input value vs output value
                                    fieldCase.expr = macro {
                                        this.$fieldName = ${val} == null ? null : ${val}.slice();
                                        return;
                                    };

                                default:
                                    fieldCase.expr = macro {
                                        this.$fieldName = $p{fullName.split('.')}.fromJson(${val});
                                        return;
                                    };
                            }

                        default:
                    }
                }
			}
		}

		return macro $b{statements};
	}

	private static function generateFillFromJsonBodyForClass(fields:Array<Field>, targetType:ClassType):Expr {
		var statements = new Array<Expr>();

		var targetTypePath:TypePath = {
			pack: targetType.pack,
			name: targetType.name
		};

		statements.push(macro if(json == null) return);

		var forSwitch:Expr = macro system.ObjectExtensions.forIn(json, function(key) {
			setProperty(key.toLower(), untyped json[key], false);
		});
		statements.push(forSwitch);

		return macro $b{statements};
	}
}
#end
