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
using AlphaTab.Collections;
using AlphaTab.IO;
using AlphaTab.Platform;

namespace AlphaTab.Importer
{

    /// <summary>
    /// this public class represents a file within the GpxFileSystem
    /// </summary>
    public class GpxFile
    {
        public string FileName { get; set; }
        public int FileSize { get; set; }
        public byte[] Data { get; set; }
    }

    /// <summary>
    /// This public class represents the file system structure
    /// stored within a GPX container file. 
    /// </summary>
    public class GpxFileSystem
    {
        public const string HeaderBcFs = "BCFS";
        public const string HeaderBcFz = "BCFZ";
        public const string ScoreGpif = "score.gpif";

        /// <summary>
        /// You can set a file filter method using this setter. On parsing
        /// the filestructure this function can determine based on the filename 
        /// whether this file will be available after loading. 
        /// This way we can reduce the amount of memory we store.
        /// </summary>
        public Func<string, bool> FileFilter { get; set; }

        /// <summary>
        /// Gets the list of files stored in this FileSystem.
        /// </summary>
        public FastList<GpxFile> Files { get; set; }

        /// <summary>
        /// Creates a new GpxFileSystem instance
        /// </summary>
        public GpxFileSystem()
        {
            Files = new FastList<GpxFile>();
            FileFilter = s => true;
        }

        /// <summary>
        /// Load a complete FileSystem to the memory.
        /// </summary>
        /// <param name="s">the binary source to read from.</param>
        /// <returns></returns>
        public void Load(IReadable s)
        {
            var src = new BitReader(s);
            ReadBlock(src);
        }

        /// <summary>
        /// Reads the 4 byte header as a string.
        /// </summary>
        /// <param name="src">the BitInput to read from</param>
        /// <returns>a string with 4 characters representing the header.</returns>
        public string ReadHeader(BitReader src)
        {
            return GetString(src.ReadBytes(4), 0, 4);
        }

        /// <summary>
        /// Decompresses the given bitinput using the GPX compression format. Only use this method
        /// if you are sure the binary data is compressed using the GPX format. Otherwise unexpected
        /// behavior can occure. 
        /// </summary>
        /// <param name="src">the bitInput to read the data from</param>
        /// <param name="skipHeader">true if the header should NOT be included in the result byteset, otherwise false</param>
        /// <returns>the decompressed byte data. if skipHeader is set to false the BCFS header is included.</returns>
        public byte[] Decompress(BitReader src, bool skipHeader = false)
        {
            var uncompressed = ByteBuffer.Empty();
            byte[] buffer;
            var expectedLength = GetInteger(src.ReadBytes(4), 0);

            try
            {
                // as long we reach our expected length we try to decompress, a EOF might occure. 
                while (uncompressed.Length < expectedLength)
                {
                    // compression flag
                    var flag = src.ReadBits(1);

                    if (flag == 1) // compressed content
                    {
                        // get offset and size of the content we need to read.
                        // compressed does mean we already have read the data and need 
                        // to copy it from our uncompressed buffer to the end
                        var wordSize = src.ReadBits(4);
                        var offset = src.ReadBitsReversed(wordSize);
                        var size = src.ReadBitsReversed(wordSize);

                        // the offset is relative to the end
                        var sourcePosition = uncompressed.Length - offset;
                        var toRead = Math.Min(offset, size);

                        // get the subbuffer storing the data and add it again to the end
                        buffer = uncompressed.GetBuffer();
                        uncompressed.Write(buffer, (int) sourcePosition, toRead);
                    }
                    else // raw content
                    {
                        // on raw content we need to read the data from the source buffer 
                        var size = src.ReadBitsReversed(2);
                        for (int i = 0; i < size; i++)
                        {
                            uncompressed.WriteByte((byte) src.ReadByte());
                        }
                    }
                }
            }
            catch (EndOfReaderException)
            {
            }

            buffer = uncompressed.GetBuffer();
            var resultOffset = skipHeader ? 4 : 0;
            var resultSize = uncompressed.Length - resultOffset;
            var result = new byte[(int)resultSize];
            Std.BlockCopy(buffer, resultOffset, result, 0, (int)resultSize);
            return result;
        }

        /// <summary>
        /// Reads a block from the given data source.
        /// </summary>
        /// <param name="data">the data source</param>
        /// <returns></returns>
        private void ReadBlock(BitReader data)
        {
            var header = ReadHeader(data);
            if (header == HeaderBcFz) // compressed file?
            {
                // decompress the data and use this 
                // we will skip the header 
                ReadUncompressedBlock(Decompress(data, true));
            }
            else if (header == HeaderBcFs) // uncompressed file?
            {
                ReadUncompressedBlock(data.ReadAll());
            }
            else
            {
                throw new UnsupportedFormatException();
            }
        }

        /// <summary>
        /// Reads an uncompressed data block into the model.
        /// </summary>
        /// <param name="data">the data store to read from.</param>
        private void ReadUncompressedBlock(byte[] data)
        {
            // the uncompressed block contains a list of filesystem entires
            // as long we have data we will try to read more entries

            // the first sector (0x1000 bytes) is empty (filled with 0xFF) 
            // so the first sector starts at 0x1000 
            // (we already skipped the 4 byte header so we don't have to take care of this) 

            var sectorSize = 0x1000;
            var offset = sectorSize;

            // we always need 4 bytes (+3 including offset) to read the type
            while ((offset + 3) < data.Length)
            {
                var entryType = GetInteger(data, offset);

                if (entryType == 2) // is a file?
                {
                    // file structure: 
                    //   offset |   type   |   size   | what
                    //  --------+----------+----------+------
                    //    0x04  |  string  |  127byte | FileName (zero terminated)
                    //    0x83  |    ?     |    9byte | Unknown 
                    //    0x8c  |   int    |    4byte | FileSize
                    //    0x90  |    ?     |    4byte | Unknown
                    //    0x94  |   int[]  |  n*4byte | Indices of the sector containing the data (end is marked with 0)

                    // The sectors marked at 0x94 are absolutely positioned ( 1*0x1000 is sector 1, 2*0x1000 is sector 2,...)

                    var file = new GpxFile();
                    file.FileName = GetString(data, offset + 0x04, 127);
                    file.FileSize = GetInteger(data, offset + 0x8C);

                    // store file if needed
                    var storeFile = FileFilter == null || FileFilter(file.FileName);
                    if (storeFile)
                    {
                        Files.Add(file);
                    }

                    // we need to iterate the blocks because we need to move after the last datasector

                    var dataPointerOffset = offset + 0x94;
                    var sector = 0; // this var is storing the sector index
                    var sectorCount = 0; // we're keeping count so we can calculate the offset of the array item

                    // as long we have data blocks we need to iterate them, 
                    var fileData = storeFile ? ByteBuffer.WithCapactiy(file.FileSize) : null;
                    while ((sector = GetInteger(data, (dataPointerOffset + (4 * (sectorCount++))))) != 0)
                    {
                        // the next file entry starts after the last data sector so we 
                        // move the offset along
                        offset = sector * sectorSize;

                        // write data only if needed
                        if (storeFile)
                        {
                            fileData.Write(data, offset, sectorSize);
                        }
                    }

                    if (storeFile)
                    {
                        // trim data to filesize if needed
                        file.Data = new byte[(int)Math.Min(file.FileSize, fileData.Length)];
                        // we can use the getBuffer here because we are intelligent and know not to read the empty data.
                        byte[] raw = fileData.ToArray();
                        Std.BlockCopy(raw, 0, file.Data, 0, file.Data.Length);
                    }
                }

                // let's move to the next sector
                offset += sectorSize;
            }
        }

        /// <summary>
        /// Reads a zeroterminated ascii string from the given source
        /// </summary>
        /// <param name="data">the data source to read from</param>
        /// <param name="offset">the offset to start reading from</param>
        /// <param name="length">the max length to read</param>
        /// <returns>the ascii string read from the datasource.</returns>
        private string GetString(byte[] data, int offset, int length)
        {
            var buf = new StringBuilder();
            for (int i = 0; i < length; i++)
            {
                var code = data[offset + i] & 0xFF;
                if (code == 0) break; // zero terminated string
                buf.AppendChar(code);
            }
            return buf.ToString();
        }

        /// <summary>
        /// Reads an 4 byte signed integer from the given source
        /// </summary>
        /// <param name="data">the data source to read from </param>
        /// <param name="offset">offset the offset to start reading from</param>
        /// <returns></returns>
        private int GetInteger(byte[] data, int offset)
        {
            return (data[offset + 3] << 24) | (data[offset + 2] << 16) | (data[offset + 1] << 8) | data[offset];
        }
    }
}
