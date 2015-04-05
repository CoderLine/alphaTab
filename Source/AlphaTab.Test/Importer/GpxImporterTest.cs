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
using System;
using System.Diagnostics;
using System.IO;
using AlphaTab.Importer;
using AlphaTab.IO;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class GpxImporterTest
    {
        internal byte[] Load(string name)
        {
            const string path = "TestFiles/GuitarPro";
            return Environment.FileLoaders["default"]().LoadBinary(Path.Combine(path, name));
        }
        
        internal GpxImporter PrepareImporterWithFile(string name)
        {
            return PrepareImporterWithBytes(Load(name));
        }

        internal GpxImporter PrepareImporterWithBytes(byte[] buffer)
        {
            var readerBase = new GpxImporter();
            readerBase.Init(new StreamWrapper(new MemoryStream(buffer)));
            return readerBase;
        }

        [TestMethod]
        public void TestFileSystemCompressed()
        {
            GpxFileSystem fileSystem = new GpxFileSystem();
            fileSystem.Load(new StreamWrapper(new MemoryStream(Load("Compressed.gpx"))));

            string[] names = {"score.gpif", "misc.xml", "BinaryStylesheet", "PartConfiguration", "LayoutConfiguration"};
            int[] sizes = {8488, 130, 12204, 20, 12};

            for (int i = 0; i < fileSystem.Files.Count; i++)
            {
                var file = fileSystem.Files[i];
                Console.WriteLine("{0} - {1}", file.FileName, file.FileSize);
                Assert.AreEqual(names[i], file.FileName);
                Assert.AreEqual(sizes[i], file.FileSize);
            }
        }
    }
}
