using System;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Platform;
using AlphaTab.Platform.JavaScript;
using AlphaTab.Platform.Svg;
using AlphaTab.Rendering.Glyphs;
using AlphaTab.Util;
using AlphaTab.Utils;
using Haxe;
using Phase;
using StringBuilder = AlphaTab.Collections.StringBuilder;

namespace AlphaTab
{
    /// <summary>
    /// This public class represents the global alphaTab environment where
    /// alphaTab looks for information like available layout engines
    /// staves etc.
    /// </summary>
    internal partial class Environment
    {
        public static string ScriptFile { get; set; }

        public static FontLoadingChecker BravuraFontChecker { get; private set; }

        private static void PlatformInit()
        {
            RenderEngines["svg"] = new RenderEngineFactory(true, () => new CssFontSvgCanvas());
            RenderEngines["html5"] = new RenderEngineFactory(false, () => new Html5Canvas());
            RenderEngines["default"] = RenderEngines["svg"];

            RegisterJQueryPlugin();

            // polyfills
            Script.Write("untyped __js__(\"Math.log2 = Math.log2 || function(x) { return Math.log(x) * Math.LOG2E; };\");");
            Script.Write("untyped __js__(\"Int32Array.prototype.slice = Int32Array.prototype.slice || function(begin, end) { return new Int32Array(Array.prototype.slice.call(this, begin, end)) };\");");

            // try to build the find the alphaTab script url in case we are not in the webworker already
            if (Lib.Global.document)
            {
                Script.Write(
                    "untyped __js__(\"window.AudioContext = window.AudioContext || window.webkitAudioContext;\");");

                var document = Browser.Document;
                /**
                 * VB Loader For IE
                 * This code is based on the code of
                 *     http://nagoon97.com/reading-binary-files-using-ajax/
                 *     Copyright (c) 2008 Andy G.P. Na <nagoon97@naver.com>
                 *     The source code is freely distributable under the terms of an MIT-style license.
                 */

                var vbAjaxLoader = new StringBuilder();
                vbAjaxLoader.AppendLine("Function VbAjaxLoader(method, fileName)");
                vbAjaxLoader.AppendLine("    Dim xhr");
                vbAjaxLoader.AppendLine("    Set xhr = CreateObject(\"Microsoft.XMLHTTP\")");
                vbAjaxLoader.AppendLine("    xhr.Open method, fileName, False");
                vbAjaxLoader.AppendLine("    xhr.setRequestHeader \"Accept-Charset\", \"x-user-defined\"");
                vbAjaxLoader.AppendLine("    xhr.send");
                vbAjaxLoader.AppendLine("    Dim byteArray()");
                vbAjaxLoader.AppendLine("    if xhr.Status = 200 Then");
                vbAjaxLoader.AppendLine("        Dim byteString");
                vbAjaxLoader.AppendLine("        Dim i");
                vbAjaxLoader.AppendLine("        byteString=xhr.responseBody");
                vbAjaxLoader.AppendLine("        ReDim byteArray(LenB(byteString))");
                vbAjaxLoader.AppendLine("        For i = 1 To LenB(byteString)");
                vbAjaxLoader.AppendLine("            byteArray(i-1) = AscB(MidB(byteString, i, 1))");
                vbAjaxLoader.AppendLine("        Next");
                vbAjaxLoader.AppendLine("    End If");
                vbAjaxLoader.AppendLine("    VbAjaxLoader=byteArray");
                vbAjaxLoader.AppendLine("End Function");


                var vbAjaxLoaderScript = (ScriptElement)document.CreateElement("script");
                vbAjaxLoaderScript.SetAttribute("type", "text/vbscript");
                var inlineScript = document.CreateTextNode(vbAjaxLoader.ToString());
                vbAjaxLoaderScript.AppendChild(inlineScript);
                document.AddEventListener("DOMContentLoaded",
                    new Action(() =>
                    {
                        document.Body.AppendChild(vbAjaxLoaderScript);
                    }),
                    false);

                var scriptElement = (ScriptElement)document.CurrentScript;
                if (!scriptElement.IsTruthy())
                {
                    // try to get javascript from exception stack
                    try
                    {
                        var error = new Error();
                        var stack = error.Stack;
                        if (!stack.IsTruthy())
                        {
                            throw error;
                        }

                        ScriptFile = ScriptFileFromStack(stack);
                    }
                    catch (Error e)
                    {
                        var stack = e.Stack;
                        if (!stack.IsTruthy())
                        {
                            scriptElement = (ScriptElement)document.QuerySelector("script[data-alphatab]");
                        }
                        else
                        {
                            ScriptFile = ScriptFileFromStack(stack);
                        }
                    }
                }

                // failed to automatically resolve
                if (string.IsNullOrEmpty(ScriptFile))
                {
                    if (!scriptElement.IsTruthy())
                    {
                        Logger.Warning("Environment",
                            "Could not automatically find alphaTab script file for worker, please add the data-alphatab attribute to the script tag that includes alphaTab or provide it when initializing alphaTab");
                    }
                    else
                    {
                        ScriptFile = scriptElement.Src;
                    }
                }

                BravuraFontChecker = new FontLoadingChecker("alphaTab",
                    "&#" + (int)MusicFontSymbol.ClefG + ";"
                );
                BravuraFontChecker.CheckForFontAvailability();
            }
            else
            {
                var isWebWorker =
                    Script.Write<bool>(
                        "untyped __js__(\"typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope\")");
                if (isWebWorker)
                {
                    AlphaTabWebWorker.Init();
                    AlphaSynthWebWorker.Init();
                }
            }
        }

        private static void RegisterJQueryPlugin()
        {
            if (Platform.Platform.JsonExists(Lib.Global, "jQuery"))
            {
                var jquery = Browser.Window.Member<dynamic>("jQuery");


                var api = new JQueryAlphaTab();
                jquery.fn.alphaTab = (Func<string, object>)(method =>
                {
                    var _this = Script.Write<HaxeArray<Element>>("untyped __js__(\"this\")");
                    // if only a single element is affected, we use this
                    if (_this.Length == 1)
                    {
                        return api.Exec(_this[0],
                            method,
                            Script.Write<string[]>("untyped __js__(\"Array.prototype.slice.call(arguments, 1)\")"));
                    }
                    // if multiple elements are affected we provide chaining

                    return Script.Write<dynamic>("untyped __js__(\"this\")")
                        .each((Action)(() =>
                        {
                            api.Exec(Script.Write<Element>("untyped __js__(\"this\")"),
                                method,
                                Script.Write<string[]>("untyped __js__(\"Array.prototype.slice.call(arguments, 1)\")"));
                        }));
                });
                jquery.alphaTab = new
                {
                    restore = JQueryAlphaTab.Restore
                };
                jquery.fn.alphaTab.fn = api;
            }
        }

        // based on https://github.com/JamesMGreene/currentExecutingScript
        private static string ScriptFileFromStack(string stack)
        {
            var matches =
                stack.Match(
                    @"(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
            if (!matches.IsTruthy())
            {
                matches = stack.Match(
                    @"^(?:|[^:@]*@|.+\)@(?=data:text\/javascript|blob|http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
                if (!matches.IsTruthy())
                {
                    matches = stack.Match(
                        @"\)@(data:text\/javascript(?:;[^,]+)?,.+?|(?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?");
                    if (!matches.IsTruthy())
                    {
                        return null;
                    }
                }
            }

            return matches[1];
        }
    }
}
