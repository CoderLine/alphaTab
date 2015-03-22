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
using AlphaTab.Model;
using AlphaTab.Wpf.ViewModel;
using Microsoft.Win32;

namespace AlphaTab.Wpf.Data
{
    /// <summary>
    /// This DialogService implementation opens uses WPF dialogs
    /// </summary>
    public class DialogService :IDialogService
    {
        public string OpenFile()
        {
            OpenFileDialog dialog = new OpenFileDialog
            {
                Filter = "Supported Files (*.gp3, *.gp4, *.gp5, *.gpx)|*.gp3;*.gp4;*.gp5;*.gpx"
            };
            if (dialog.ShowDialog(Application.Current.MainWindow).GetValueOrDefault())
            {
                return dialog.FileName;
            }
            return null;
        }

        public void ShowScoreInfo(Score score)
        {
            ScoreInfoViewModel viewModel = new ScoreInfoViewModel(score);
            ScoreInfoWindow window = new ScoreInfoWindow();
            window.DataContext = viewModel;
            window.ShowDialog();
        }
    }
}
