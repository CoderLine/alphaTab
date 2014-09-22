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
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace WebFontGenerator
{
    [DataContract]
    class WebFont
    {
        [DataMember(Name = "metadata")]
        public FontMetadata Metadata { get; set; }
        [DataMember(Name = "iconSets")]
        public List<IconSet> IconSets { get; set; }
        [DataMember(Name = "preferences")]
        public WebFontPreferences Preferences { get; set; }

        public WebFont()
        {
            Metadata = new FontMetadata();
            IconSets = new List<IconSet>();
            Preferences = new WebFontPreferences();
        }
    }

    [DataContract]
    class FontMetadata
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }
        [DataMember(Name = "lastOpened")]
        public long LastOpened { get; set; }
        [DataMember(Name = "created")]
        public long Created { get; set; }
    }


    [DataContract]
    class IconSet
    {
        [DataMember(Name = "selection")]
        public List<IconSelection> Selection { get; set; }
        [DataMember(Name = "id")]
        public int Id { get; set; }
        [DataMember(Name = "metadata")]
        public IconSetMetadata Metadata { get; set; }
        [DataMember(Name = "height")]
        public int Height { get; set; }
        [DataMember(Name = "prevSize")]
        public int PrevSize { get; set; }
        [DataMember(Name = "icons")]
        public List<Icon> Icons { get; set; }
        [DataMember(Name = "invisible")]
        public bool Invisible { get; set; }

        public IconSet()
        {
            Selection = new List<IconSelection>();
            Metadata = new IconSetMetadata();
            Icons = new List<Icon>();
        }
    }

    [DataContract]
    class IconSelection
    {
        [DataMember(Name = "order")]
        public int Order { get; set; }
        [DataMember(Name = "id")]
        public int Id { get; set; }
        [DataMember(Name = "prevSize", EmitDefaultValue = false)]
        public int PrevSize { get; set; }
        [DataMember(Name = "code", EmitDefaultValue = false)]
        public int Code { get; set; }
        [DataMember(Name = "name", EmitDefaultValue = false)]
        public string Name { get; set; }
        [DataMember(Name = "tempChar", EmitDefaultValue = false)]
        public string TempChar { get; set; }
        [DataMember(Name = "ligatures", EmitDefaultValue = false)]
        public string Ligatures { get; set; }
    }

    [DataContract]
    class Icon
    {
        [DataMember(Name = "id")]
        public int Id { get; set; }
        [DataMember(Name = "paths")]
        public string[] Paths { get; set; }
        [DataMember(Name = "grid")]
        public int Grid { get; set; }
        [DataMember(Name = "tags")]
        public string[] Tags { get; set; }
    }

    [DataContract]
    class IconSetMetadata
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }
        [DataMember(Name = "url")]
        public string Url { get; set; }
        [DataMember(Name = "designer")]
        public string Designer { get; set; }
        [DataMember(Name = "designerURL")]
        public string DesignerUrl { get; set; }
        [DataMember(Name = "license")]
        public string License { get; set; }
        [DataMember(Name = "licenseURL")]
        public string LicenseUrl { get; set; }
    }

    [DataContract]
    class WebFontPreferences
    {
        [DataMember(Name = "showGlyphs")]
        public bool ShowGlyphs { get; set; }
        [DataMember(Name = "showQuickUse")]
        public bool ShowQuickUse { get; set; }
        [DataMember(Name = "fontPref")]
        public FontExportPreferences ExportPreferences { get; set; }
        [DataMember(Name = "imagePref")]
        public FontImagePreferences ImagePreferences { get; set; }
        [DataMember(Name = "historySize")]
        public int HistorySize { get; set; }
        [DataMember(Name = "showCodes")]
        public bool ShowCodes { get; set; }
        [DataMember(Name = "search")]
        public string Search { get; set; }

        public WebFontPreferences()
        {
            ExportPreferences = new FontExportPreferences();
            ImagePreferences = new FontImagePreferences();
        }
    }

    [DataContract]
    class FontImagePreferences
    {
    }

    [DataContract]
    class FontExportPreferences
    {
        [DataMember(Name = "prefix")]
        public string Prefix { get; set; }
        [DataMember(Name = "metadata")]
        public FontExportPreferencesMetadata Metadata { get; set; }
        [DataMember(Name = "metrics")]
        public FontExportPreferencesMetrics Metrics { get; set; }
        [DataMember(Name = "postfix")]
        public string Postfix { get; set; }
        [DataMember(Name = "showMetrics")]
        public bool ShowMetrics { get; set; }
        [DataMember(Name = "showMetadata")]
        public bool ShowMetadata { get; set; }
        [DataMember(Name = "showVersion")]
        public bool ShowVersion { get; set; }

        public FontExportPreferences()
        {
            Metadata = new FontExportPreferencesMetadata();
            Metrics = new FontExportPreferencesMetrics();
        }
    }

    [DataContract]
    class FontExportPreferencesMetrics
    {
        [DataMember(Name = "emSize")]
        public int EmSize { get; set; }
        [DataMember(Name = "baseline")]
        public int Baseline { get; set; }
        [DataMember(Name = "whitespace")]
        public int Whitespace { get; set; }
    }

    [DataContract]
    class FontExportPreferencesMetadata
    {
        [DataMember(Name = "fontFamily")]
        public string FontFamily { get; set; }
        [DataMember(Name = "majorVersion")]
        public int MajorVersion { get; set; }
        [DataMember(Name = "minorVersion")]
        public int MinorVersion { get; set; }
    }

}
