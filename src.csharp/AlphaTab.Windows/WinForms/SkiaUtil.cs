using System.Drawing;
using System.Drawing.Imaging;
using SkiaSharp;

namespace AlphaTab.WinForms
{
    internal class SkiaUtil
    {
        public static Bitmap ToBitmap(object data)
        {
            var image = (SKImage) data;
            var info = new SKImageInfo(image.Width, image.Height);
            var bitmap = new Bitmap(image.Width, image.Height, PixelFormat.Format32bppPArgb);
            var bitmapData =
                bitmap.LockBits(new Rectangle(Point.Empty, bitmap.Size), ImageLockMode.WriteOnly,
                    bitmap.PixelFormat);
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
