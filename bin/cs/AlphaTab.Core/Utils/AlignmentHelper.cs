/*
 * This file is part of alphaTab.
 * Copyright c 2013, Daniel Kuschny and Contributors, All rights reserved.
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
using System.Globalization;
using System.Windows;
using System.Windows.Data;
using alphatab.model;
using alphatab.platform.model;

namespace AlphaTab.Utils
{
    public class AlignmentHelper : DependencyObject
    {
        public static readonly DependencyProperty LineAlignmentProperty =
           DependencyProperty.RegisterAttached("LineAlignment", typeof(TextBaseline), typeof(AlignmentHelper), new PropertyMetadata(TextBaseline.Top, LineAlignmentChanged));

        public static readonly DependencyProperty AlignmentProperty =
           DependencyProperty.RegisterAttached("Alignment", typeof(TextAlign), typeof(AlignmentHelper), new PropertyMetadata(TextAlign.Left, AlignmentChanged));

        public static TextAlign GetAlignment(DependencyObject obj)
        {
            return (TextAlign)obj.GetValue(AlignmentProperty);
        }

        public static void SetAlignment(DependencyObject obj, TextAlign value)
        {
            obj.SetValue(AlignmentProperty, value);
        }

        public static TextBaseline GetLineAlignment(DependencyObject obj)
        {
            return (TextBaseline)obj.GetValue(LineAlignmentProperty);
        }

        public static void SetLineAlignment(DependencyObject obj, TextBaseline value)
        {
            obj.SetValue(LineAlignmentProperty, value);
        }

        private static void AlignmentChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            FrameworkElement element = d as FrameworkElement;
            if (element == null)
            {
                return;
            }

            element.ClearValue(FrameworkElement.MarginProperty);
            MultiBinding multiBinding = new MultiBinding
            {
                Converter = new AlignmentConverter((TextAlign) e.NewValue, GetLineAlignment(d))
            };
            multiBinding.Bindings.Add(new Binding("ActualWidth") { Source = element });
            multiBinding.Bindings.Add(new Binding("ActualHeight") { Source = element });
            element.SetBinding(FrameworkElement.MarginProperty, multiBinding);
        }

        private static void LineAlignmentChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            FrameworkElement element = d as FrameworkElement;
            if (element == null)
            {
                return;
            }

            element.ClearValue(FrameworkElement.MarginProperty);
            MultiBinding multiBinding = new MultiBinding
            {
                Converter = new AlignmentConverter(GetAlignment(d), (TextBaseline) e.NewValue)
            };
            multiBinding.Bindings.Add(new Binding("ActualWidth") { Source = element });
            multiBinding.Bindings.Add(new Binding("ActualHeight") { Source = element });
            element.SetBinding(FrameworkElement.MarginProperty, multiBinding);
        }


        class AlignmentConverter : IMultiValueConverter
        {
            private readonly TextAlign _textAlign;
            private readonly TextBaseline _textBaseline;

            public AlignmentConverter(TextAlign textAlign, TextBaseline textBaseline)
            {
                _textAlign = textAlign;
                _textBaseline = textBaseline;
            }

            public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
            {
                if (values[0] == DependencyProperty.UnsetValue || values[1] == DependencyProperty.UnsetValue)
                {
                    return DependencyProperty.UnsetValue;
                }

                double width = (double)values[0];
                double height = (double)values[1];

                double left = 0;
                double top = 0;

                switch (_textAlign)
                {
                    case TextAlign.Left:
                        left = 0;
                        break;
                    case TextAlign.Center:
                        left = -width / 2;
                        break;
                    case TextAlign.Right:
                        left = -width;
                        break;
                }

                switch (_textBaseline)
                {
                    case TextBaseline.Default:
                    case TextBaseline.Top:
                        top = 0;
                        break;
                    case TextBaseline.Middle:
                        top = -height / 2;
                        break;
                    case TextBaseline.Bottom:
                        top = -height;
                        break;
                }

                return new Thickness(left, top, 0, 0);
            }

            public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
            {
                throw new NotImplementedException();
            }
        }
    }
}
