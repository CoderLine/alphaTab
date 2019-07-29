#if ANDROID
using System.IO;
using System.Threading.Tasks;
using SkiaSharp;
using Xamarin.Forms;

namespace AlphaTab.Platform.CSharp.Xamarin.Forms
{
    class SkImageSource : StreamImageSource
    {
        public SkImageSource(SKImage image)
        {
            byte[] imageBytes;
            using (var data = image.Encode(SKEncodedImageFormat.Png, 100))
            {
                imageBytes = data.ToArray();
            }
            Stream = token => Task.FromResult((Stream)new MemoryStream(imageBytes));
        }
    }
}
#endif
