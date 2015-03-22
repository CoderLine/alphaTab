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

namespace AlphaTab.Wpf.Data
{
    /// <summary>
    /// Implement this interface to handle application errors. 
    /// </summary>
    public interface IErrorService
    {
        /// <summary>
        /// Called when an error during opening a file occurs. 
        /// </summary>
        /// <param name="e">The exception occured during opening the file</param>
        void OpenFailed(Exception e);
    }
}
