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
package alphatab;

import alphatab.importer.Gp3ImporterTest;
import alphatab.importer.Gp4ImporterTest;
import alphatab.importer.Gp5ImporterTest;
import alphatab.importer.GpImporterTest;
import haxe.unit.TestRunner;

class AlphaTestRunner 
{
    static function main()
    {
        var r = new TestRunner();
        r.add(new GpImporterTest());
        r.add(new Gp3ImporterTest());
        r.add(new Gp4ImporterTest());
        r.add(new Gp5ImporterTest());
        r.run();
    }
}