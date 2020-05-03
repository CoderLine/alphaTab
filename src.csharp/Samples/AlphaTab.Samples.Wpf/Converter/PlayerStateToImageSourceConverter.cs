using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;
using AlphaTab.Synth;

namespace AlphaTab.Samples.Wpf.Converter
{
    internal class PlayerStateToImageSourceConverter : IValueConverter
    {
        public ImageSource PlayImage { get; set; }
        public ImageSource PauseImage { get; set; }
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is PlayerState state)
            {
                switch (state)
                {
                    case PlayerState.Paused:
                        return PlayImage;
                    case PlayerState.Playing:
                        return PauseImage;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }

            return null;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
