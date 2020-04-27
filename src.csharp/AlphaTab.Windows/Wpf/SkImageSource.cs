using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using SkiaSharp;

namespace AlphaTab.Wpf
{
    internal static class SkImageSource
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
