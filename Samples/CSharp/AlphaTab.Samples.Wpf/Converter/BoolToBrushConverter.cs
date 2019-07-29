using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace AlphaTab.Samples.Wpf.Converter
{
    /// <summary>
    /// A simple ValueConverter which converts a bool to a associated brush.
    /// </summary>
    public class BoolToBrushConverter : IValueConverter
    {
        public Brush TrueBrush { get; set; }
        public Brush FalseBrush { get; set; }

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return value is bool && (bool) value ? TrueBrush : FalseBrush;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
