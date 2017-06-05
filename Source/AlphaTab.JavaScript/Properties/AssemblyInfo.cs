using System;
using System.Collections.Generic;
using System.Reflection;
using AlphaTab.Audio.Generator;
using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Platform;
using AlphaTab.Platform.JavaScript;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;
using SharpKit.JavaScript;

[assembly: JsExport(ExportComments = true, OmitSharpKitHeaderComment = true, ForceOmitCasts = true, ForceIntegers = true)]
// Export all Types
[assembly: JsType(Mode = JsMode.Prototype,
                    AutomaticPropertiesAsFields = true,
                    Export = true,
                    IgnoreGenericTypeArguments = true,
                    IgnoreGenericMethodArguments = true,
                    OmitCasts = true
                    )]

// Exclude Interfaces from exporting
[assembly: JsType(Export = false, TargetType = typeof(IMidiFileHandler))]
[assembly: JsType(Export = false, TargetType = typeof(IReadable))]
[assembly: JsType(Export = false, TargetType = typeof(IWriteable))]
[assembly: JsType(Export = false, TargetType = typeof(ICanvas))]
[assembly: JsType(Export = false, TargetType = typeof(IPathCanvas))]
[assembly: JsType(Export = false, TargetType = typeof(IEffectBarRendererInfo))]
[assembly: JsType(Export = false, TargetType = typeof(IScoreRenderer))]
[assembly: JsType(Export = false, TargetType = typeof(IBeamYCalculator))]

[assembly: JsType(JsMode.Prototype, TargetType = typeof(Math), Name = "Math", NativeArrayEnumerator = true, NativeEnumerator = false, Export = false)]

[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Min", Name = "min")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Max", Name = "max")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Abs", Name = "abs")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Pow", Name = "pow")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Sqrt", Name = "sqrt")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Ceiling", Name = "ceil")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Floor", Name = "floor")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Round", Name = "round")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Log", Name = "log")]
[assembly: JsMethod(TargetType = typeof(Math), TargetMethod = "Sin", Name = "sin")]

[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "IsNullOrEmpty", InlineCodeExpression = "((value == null) || (value.length == 0))")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "StartsWith", InlineCodeExpression = "this.indexOf(value) == 0")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "EndsWith", InlineCodeExpression = "(this.lastIndexOf(value) == (this.length - value.length))")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "Contains", InlineCodeExpression = "this.indexOf(value) != -1")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "Replace", InlineCodeExpression = "this.replace(oldValue, newValue)")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "Split", InlineCodeExpression = "this.split(separator)")]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "get_Chars", Name = "charCodeAt", NativeOverloads = true)]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "LastIndexOf", Name = "lastIndexOf", NativeOverloads = true)]
[assembly: JsMethod(TargetType = typeof(string), TargetMethod = "Substring", Name = "substr", NativeOverloads = true)]

[assembly: JsMethod(TargetType = typeof(IComparable), TargetMethod = "CompareTo", InlineCodeExpression = "(this - obj)")]
[assembly: JsMethod(TargetType = typeof(int), TargetMethod = "CompareTo", InlineCodeExpression = "(this - value)")]
[assembly: JsMethod(TargetType = typeof(float), TargetMethod = "CompareTo", InlineCodeExpression = "(this - value)")]
[assembly: JsMethod(TargetType = typeof(float), TargetMethod = "IsNaN", InlineCodeExpression = "isNaN(f)")]

[assembly: JsMethod(TargetType = typeof(System.Console), TargetMethod = "WriteLine", InlineCodeExpression = "console.log(value)")]

[assembly: JsMethod(TargetType = typeof(Nullable<>), TargetMethod = "get_Value", InlineCodeExpression = "this")]
[assembly: JsMethod(TargetType = typeof(Exception), TargetMethod = "get_Message", InlineCodeExpression = "this.message")]

[assembly: JsType(Mode = JsMode.Json, TargetType = typeof(Bounds),
                    AutomaticPropertiesAsFields = false,
                    Export = false,
                    IgnoreGenericTypeArguments = true,
                    IgnoreGenericMethodArguments = true,
                    OmitCasts = true
                    )]

[assembly: JsType(Mode = JsMode.Prototype, TargetType = typeof(Html5Canvas),
                    AutomaticPropertiesAsFields = false,
                    Export = true,
                    IgnoreGenericTypeArguments = true,
                    IgnoreGenericMethodArguments = true,
                    OmitCasts = true
                    )]

[assembly: JsType(Mode = JsMode.Prototype, TargetType = typeof(SvgCanvas),
                    AutomaticPropertiesAsFields = false,
                    Export = true,
                    IgnoreGenericTypeArguments = true,
                    IgnoreGenericMethodArguments = true,
                    OmitCasts = true
                    )]

[assembly: JsType(Mode = JsMode.Prototype, TargetType = typeof(FastDictionary<,>),
                    Name = "Object",
                    Export = false,
                    IgnoreGenericTypeArguments = true,
                    NativeEnumerator = true
                    )]
[assembly: JsMethod(TargetType = typeof(FastDictionary<,>), TargetMethod=".ctor", InlineCode = "{}")]
[assembly: JsProperty(TargetType = typeof(FastDictionary<,>), TargetProperty= "Item", NativeIndexer = true)]
[assembly: JsMethod(TargetType = typeof(FastDictionary<,>), TargetMethod = "get_Count", InlineCodeExpression = "Object.keys(this).length")]
[assembly: JsMethod(TargetType = typeof(FastDictionary<,>), TargetMethod = "Remove", InlineCodeExpression = "delete this[key]")]
[assembly: JsMethod(TargetType = typeof(FastDictionary<,>), TargetMethod = "ContainsKey", InlineCodeExpression = "this.hasOwnProperty(key)")]

[assembly: JsType(Mode = JsMode.Prototype, TargetType = typeof(FastList<>),
                    Name = "Array",
                    Export = false,
                    IgnoreGenericTypeArguments = true,
                    NativeArrayEnumerator = true,
                    NativeCasts = true,
                    NativeEnumerator = false,
                    NativeOperatorOverloads = true
                    )]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod=".ctor", InlineCode = "[]")]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod = "get_Count", InlineCodeExpression = "this.length")]
[assembly: JsProperty(TargetType = typeof(FastList<>), TargetProperty= "Item", NativeIndexer = true)]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod = "Add", InlineCodeExpression = "this.push(item)")]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod = "Sort", Name = "sort")]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod = "Clone", Name = "slice")]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod = "RemoveAt", InlineCodeExpression = "this.splice(index, 1)")]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod = "ToArray", InlineCodeExpression = "this.slice(0)")]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod = "IndexOf", Name = "indexOf")]
[assembly: JsMethod(TargetType = typeof(FastList<>), TargetMethod = "Reverse", Name = "reverse")]