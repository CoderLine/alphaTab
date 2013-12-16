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
using haxe.lang;

namespace AlphaTab.Utils
{
    public class ActionFunction : Function
    {
        private readonly Action _action;

        public ActionFunction(Action action) : base(1, 0)
        {
            _action = action;
        }

        public override object __hx_invoke0_o()
        {
            _action();
            return null;
        }
    }
    public class ActionFunction<T> : Function
    {
        private readonly Action<T> _action;

        public ActionFunction(Action<T> action) : base(1, 0)
        {
            _action = action;
        }

        public override object __hx_invoke1_o(double __fn_float1, object __fn_dyn1)
        {
            _action((T) __fn_dyn1);
            return null;
        }
    }
}
