#if NET472
/*
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
using System.Drawing;
using System.Drawing.Imaging;
using SkiaSharp;

namespace AlphaTab.Platform.CSharp.WinForms
{
    class SkiaUtil
    {
        public static Bitmap ToBitmap(object data)
        {
            var image = (SKImage) data;
            var info = new SKImageInfo(image.Width, image.Height);
            var bitmap = new Bitmap(image.Width, image.Height, PixelFormat.Format32bppPArgb);
            var bitmapData = bitmap.LockBits(new Rectangle(Point.Empty, bitmap.Size), ImageLockMode.WriteOnly, bitmap.PixelFormat);
            // copy
            using (var pixmap = new SKPixmap(info, bitmapData.Scan0, bitmapData.Stride))
            {
                image.ReadPixels(pixmap, 0, 0);
            }
            bitmap.UnlockBits(bitmapData);
            return bitmap;
        }
    }
}
#endif