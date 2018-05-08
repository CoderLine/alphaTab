﻿/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using System;
using AlphaTab.Collections;
using AlphaTab.Model;
using Haxe.Js.Html;
using Phase;
using Phase.Attributes;

namespace AlphaTab.Importer
{
    /// <summary>
    /// The ScoreLoader enables you easy loading of Scores using all 
    /// available importers
    /// </summary>
    public partial class ScoreLoader
    {
        /// <summary>
        /// Loads a score asynchronously from the given datasource
        /// </summary>
        /// <param name="path">the source path to load the binary file from</param>
        /// <param name="success">this function is called if the Score was successfully loaded from the datasource</param>
        /// <param name="error">this function is called if any error during the loading occured.</param>
        /// <param name="importSettings">special settings for the score import</param>
        public static void LoadScoreAsync(string path, Action<Score> success, Action<Exception> error, FastDictionary<string, object> importSettings = null)
        {
            var xhr = new XMLHttpRequest();
            xhr.Open("GET", path, true);
            xhr.ResponseType = XMLHttpRequestResponseType.ARRAYBUFFER;
            xhr.OnReadyStateChange = (Action)(() =>
            {
                if (xhr.ReadyState == XMLHttpRequest.DONE)
                {
                    if (xhr.Status == 200 || (xhr.Status == 0 && xhr.Response))
                    {
                        try
                        {
                            ArrayBuffer buffer = xhr.Response;
                            var reader = new Uint8Array(buffer);
                            var score = LoadScoreFromBytes(reader.As<byte[]>(), importSettings);
                            success(score);
                        }
                        catch (Exception exception)
                        {
                            error(exception);
                        }
                    }
                    // Error handling
                    else if (xhr.Status == 0)
                    {
                        error(new FileLoadException("You are offline!!\n Please Check Your Network.", xhr));
                    }
                    else if (xhr.Status == 404)
                    {
                        error(new FileLoadException("Requested URL not found.", xhr));
                    }
                    else if (xhr.Status == 500)
                    {
                        error(new FileLoadException("Internel Server Error.", xhr));
                    }
                    else if (xhr.StatusText == "parsererror")
                    {
                        error(new FileLoadException("Error.\nParsing JSON Request failed.", xhr));
                    }
                    else if (xhr.StatusText == "timeout")
                    {
                        error(new FileLoadException("Request Time out.", xhr));
                    }
                    else
                    {
                        error(new FileLoadException("Unknow Error: " + xhr.ResponseText, xhr));
                    }
                }
            });
            // IE fallback
            if (xhr.ResponseType != XMLHttpRequestResponseType.ARRAYBUFFER)
            {
                // use VB Loader to load binary array
                dynamic vbArr = Script.Write<dynamic>("untyped VbAjaxLoader(\"GET\", path)");
                var fileContents = vbArr.toArray();

                // decode byte array to string
                var data = new StringBuilder();
                var i = 0;
                while (i < (fileContents.length - 1))
                {
                    data.Append(((char)(fileContents[i])));
                    i++;
                }

                var reader = GetBytesFromString(data.ToString());
                var score = LoadScoreFromBytes(reader, importSettings);
                success(score);
            }
            xhr.Send();
        }

        private static byte[] GetBytesFromString(string s)
        {
            byte[] b = new byte[s.Length];
            for (int i = 0; i < s.Length; i++)
            {
                b[i] = (byte)s[i];
            }
            return b;
        }
    }
}
