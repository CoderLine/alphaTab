using System.Drawing;
using System.Drawing.Imaging;
using AlphaSkia;

namespace AlphaTab.WinForms
{
    internal static class SkiaUtil
    {
        public static Bitmap ToBitmap(AlphaSkiaImage image)
        {
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
