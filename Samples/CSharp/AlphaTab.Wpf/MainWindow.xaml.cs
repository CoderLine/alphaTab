/*
 * This file is part of alphaTab.
 * Copyright (c) 2014, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Wpf.Data;
using AlphaTab.Wpf.ViewModel;

namespace AlphaTab.Wpf.Gdi
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();

            // ensure the UI is using en-us as culture 
            // we need this culture for correct WPF path string generation
            // in a German culture it could happen that we have a , as a decimal separator. 
            App.InitializeCultures();

            // create a our viewmodel for databinding
            MainViewModel viewModel = new MainViewModel(new DialogService(), new ErrorService());
            DataContext = viewModel;
        }
    }
}
