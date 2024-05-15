using System.Drawing;
using System.Drawing.Imaging;
using AlphaTab.Platform.Skia.AlphaSkiaBridge;

namespace AlphaTab.WinForms
{
    internal static class AlphaSkiaUtil
    {
        public static Bitmap ToBitmap(AlphaSkiaImage imageBridge)
        {
            var image = imageBridge.Image;
            var bitmap = new Bitmap(image.Width, image.Height, PixelFormat.Format32bppPArgb);
            var bitmapData =
                bitmap.LockBits(new Rectangle(Point.Empty, bitmap.Size), ImageLockMode.WriteOnly,
                    bitmap.PixelFormat);
            image.ReadPixels(bitmapData.Scan0, (ulong)bitmapData.Stride);
            bitmap.UnlockBits(bitmapData);
            return bitmap;
        }
    }
}
