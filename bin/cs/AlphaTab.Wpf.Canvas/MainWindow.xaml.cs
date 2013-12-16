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
using System.Windows;
using AlphaTab.Wpf.Share.Data;
using AlphaTab.Wpf.Share.ViewModel;

namespace AlphaTab.Wpf.Canvas
{
    public partial class MainWindow
    {
        public MainWindow()
        {
            InitializeComponent();
            
            // ensure the UI is using en-us as culture 
            // we need this culture for correct WPF path string generation
            // in a German culture it could happen that we have a , as a decimal separator. 
            App.InitializeCultures();

            // create a our viewmodel for databinding
            MainViewModel viewModel = new MainViewModel(new IOService(), new ErrorService());
            DataContext = viewModel;
        }

        private void OnRenderFinished(object sender, RoutedEventArgs e)
        {
            // setup the size of the background and the shadow
            TablatureContainer.Width = TablatureControl.Width;
            TablatureContainer.Height = TablatureControl.Height;
            TablatureShadow.Width = TablatureControl.Width;
            TablatureShadow.Height = TablatureControl.Height;
        }
    }
}
