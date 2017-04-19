/*
 * This file is part of alphaTab.
 * Copyright © 2017, Daniel Kuschny and Contributors, All rights reserved.
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

using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using SkiaSharp;

namespace AlphaTab.Platform.CSharp.Wpf
{
    class SkImageSource 
    {
        public static BitmapSource Create(object data)
        {
            var image = (SKImage) data;
            var info = new SKImageInfo(image.Width, image.Height);
            var bitmap = new WriteableBitmap(image.Width, image.Height, 96, 96, PixelFormats.Pbgra32, null);
            bitmap.Lock();
            // copy
            using (var pixmap = new SKPixmap(info, bitmap.BackBuffer, bitmap.BackBufferStride))
            {
                image.ReadPixels(pixmap, 0, 0);
            }
            bitmap.AddDirtyRect(new Int32Rect(0, 0, info.Width, info.Height));
            bitmap.Unlock();
            return bitmap;
        }
    }
}