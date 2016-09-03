/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or at your option any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library.
 */

using AlphaTab.Platform;
using AlphaTab.Platform.Svg;
using SharpKit.Html;
using SharpKit.JavaScript;

namespace AlphaTab
{
    /// <summary>
    /// This public class represents the global alphaTab environment where
    /// alphaTab looks for information like available layout engines
    /// staves etc.
    /// </summary>
    public partial class Environment
    {
        public static string ScriptFile { get; set; }

        static void PlatformInit()
        {
            RenderEngines["svg"] = d => new FontSvgCanvas();
            RenderEngines["default"] = d => new FontSvgCanvas();
            RenderEngines["html5"] = d => new Platform.JavaScript.Html5Canvas();
            FileLoaders["default"] = () => new Platform.JavaScript.JsFileLoader();

            JsContext.JsCode("Math.log2 = Math.log2 || function(x) { return Math.log(x) * Math.LOG2E; };");

            // try to build the find the alphaTab script url in case we are not in the webworker already
            if (HtmlContext.self.document.As<bool>())
            {
                var scriptElement = HtmlContext.document.Member("currentScript").As<HtmlScriptElement>();

                // fallback to script tag that has an alphatab data attribute set.
                if (!scriptElement.As<bool>())
                {
                    scriptElement = HtmlContext.document.querySelector("script[data-alphatab]").As<HtmlScriptElement>();
                }

                // failed to automatically resolve
                if (!scriptElement.As<bool>())
                {
                    HtmlContext.console.warn("Could not automatically find alphaTab script file for worker, please add the data-alphatab attribute to the script tag that includes alphaTab or provide it when initializin alphaTab");
                }
                else
                {
                    ScriptFile = scriptElement.src;
                }
            }
        }
    }
}
