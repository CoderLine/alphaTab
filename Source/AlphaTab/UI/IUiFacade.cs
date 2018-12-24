/*
 * This file is part of alphaTab.
 * Copyright © 2018, Daniel Kuschny and Contributors, All rights reserved.
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
using AlphaTab.Audio.Synth;
using AlphaTab.Rendering;
using AlphaTab.Rendering.Utils;

namespace AlphaTab.UI
{
    public interface IUiFacade<TSettings>
    {
        IContainer RootContainer { get; }
        bool AreWorkersSupported { get; }

        bool CanRender { get; }
        int ResizeThrottle { get; }
        event Action CanRenderChanged;

        event Action RootContainerBecameVisible;

        void Initialize(AlphaTabApi<TSettings> api, TSettings control);
        void Destroy();

        IContainer CreateCanvasElement();
        void TriggerEvent(IContainer container, string eventName, object details = null);
        void InitialRender();

        void BeginAppendRenderResults(RenderFinishedEventArgs renderResults);
        IScoreRenderer CreateWorkerRenderer();
        IAlphaSynth CreateWorkerPlayer();

        Cursors CreateCursors();
        void BeginInvoke(Action action);
        void RemoveHighlights();
        void HighlightElements(string groupId);
        IContainer CreateSelectionElement();
        IContainer GetScrollContainer();
        Bounds GetOffset(IContainer scrollElement, IContainer container);

        void ScrollToY(IContainer scrollElement, int offset, int speed);
        void ScrollToX(IContainer scrollElement, int offset, int speed);
    }
}