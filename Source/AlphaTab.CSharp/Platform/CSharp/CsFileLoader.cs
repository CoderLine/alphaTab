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

using System;
using System.IO;

namespace AlphaTab.Platform.CSharp
{
    /// <summary>
    /// This file loader loads binary files using the native apis
    /// </summary>
    public class CsFileLoader : IFileLoader
    {
        public byte[] LoadBinary(string path)
        {
            return File.ReadAllBytes(path);
        }

        public void LoadBinaryAsync(string path, Action<byte[]> success, Action<Exception> error)
        {
            try
            {
                success(LoadBinary(path));
            }
            catch (Exception e)
            {
                error(e);
            }
        }
    }
}