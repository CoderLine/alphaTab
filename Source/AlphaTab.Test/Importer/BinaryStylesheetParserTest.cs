using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using AlphaTab.Importer;
using AlphaTab.IO;
using AlphaTab.Model;
using AlphaTab.Rendering.Utils;
using AlphaTab.Platform;
using AlphaTab.Platform.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace AlphaTab.Test.Importer
{
    [TestClass]
    public class BinaryStylesheetParserTest
    {
        internal void Load(string name, Action<byte[]> loaded)
        {
            const string path = "TestFiles/";
            TestPlatform.LoadFile(path + name, loaded);
        }

        [TestMethod, AsyncTestMethod]
        public void TestRead()
        {
            var readerBase = new BinaryStylesheetParser();
            Load("GuitarPro7/BinaryStylesheet", data =>
            {
                readerBase.Parse(data);

                var stylesheet = readerBase.Stylesheet;
                //foreach (var r in stylesheet.Raw)
                //{
                //    Console.WriteLine("Assert.IsTrue(stylesheet.Raw.ContainsKey(\"" + r + "\"));");
                //    var v = stylesheet.Raw[r];
                //    if (v is string s)
                //    {
                //        Console.WriteLine("Assert.AreEqual(\"" + s + "\", stylesheet.Raw[\"" + r + "\"]);");
                //    }
                //    else if (v is bool b)
                //    {
                //        Console.WriteLine("Assert.AreEqual(" + b.ToString().ToLower() + ", stylesheet.Raw[\"" + r + "\"]);");
                //    }
                //    else if (v is float f)
                //    {
                //        Console.WriteLine("Assert.IsTrue(((float)stylesheet.Raw[\"" + r + "\"]).IsAlmostEqualTo(" + f.ToString("F9", CultureInfo.InvariantCulture) + "f));");
                //    }
                //    else if (v is BendPoint bp)
                //    {
                //        Console.WriteLine("Assert.AreEqual(" + bp.Offset + ", ((BendPoint)stylesheet.Raw[\"" + r + "\"]).Offset);");
                //        Console.WriteLine("Assert.AreEqual(" + bp.Value + ", ((BendPoint)stylesheet.Raw[\"" + r + "\"]).Value);");
                //    }
                //    else if (v is Color c)
                //    {
                //        Console.WriteLine("Assert.AreEqual(" + c.R + ", ((Color)stylesheet.Raw[\"" + r + "\"]).R);");
                //        Console.WriteLine("Assert.AreEqual(" + c.G + ", ((Color)stylesheet.Raw[\"" + r + "\"]).G);");
                //        Console.WriteLine("Assert.AreEqual(" + c.B + ", ((Color)stylesheet.Raw[\"" + r + "\"]).B);");
                //        Console.WriteLine("Assert.AreEqual(" + c.A + ", ((Color)stylesheet.Raw[\"" + r + "\"]).A);");
                //    }
                //    else if (v is Bounds bd)
                //    {
                //        Console.WriteLine("Assert.AreEqual(" + bd.X + ", ((Bounds)stylesheet.Raw[\"" + r + "\"]).X);");
                //        Console.WriteLine("Assert.AreEqual(" + bd.Y + ", ((Bounds)stylesheet.Raw[\"" + r + "\"]).Y);");
                //        Console.WriteLine("Assert.AreEqual(" + bd.W + ", ((Bounds)stylesheet.Raw[\"" + r + "\"]).W);");
                //        Console.WriteLine("Assert.AreEqual(" + bd.H + ", ((Bounds)stylesheet.Raw[\"" + r + "\"]).H);");
                //    }
                //    else
                //    {
                //        Console.WriteLine("Assert.AreEqual(" + stylesheet.Raw[r] + ", stylesheet.Raw[\"" + r + "\"]);");
                //    }
                //    Console.WriteLine();
                //}

                Assert.IsNotNull(stylesheet);


                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/chordNameStyle"));
                Assert.AreEqual(2, stylesheet.Raw["Global/chordNameStyle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/deadNoteSymbol"));
                Assert.AreEqual(0, stylesheet.Raw["StandardNotation/deadNoteSymbol"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/WordsAndMusic"));
                Assert.AreEqual("Words & Music by %MUSIC%", stylesheet.Raw["Header/WordsAndMusic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/PickStrokePriority"));
                Assert.AreEqual(1100, stylesheet.Raw["Global/PickStrokePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/drawOddFooter"));
                Assert.AreEqual(true, stylesheet.Raw["Odd/drawOddFooter"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/tabRhythmPlacementVoice3"));
                Assert.AreEqual(2, stylesheet.Raw["TablatureNotation/tabRhythmPlacementVoice3"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/HideTupletBracket"));
                Assert.AreEqual(true, stylesheet.Raw["Global/HideTupletBracket"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/DrawChords"));
                Assert.AreEqual(true, stylesheet.Raw["Global/DrawChords"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/codaSplitWidth"));
                Assert.IsTrue(((float)stylesheet.Raw["System/codaSplitWidth"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/HarmonicPriority"));
                Assert.AreEqual(2200, stylesheet.Raw["Global/HarmonicPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/LetRingThroughoutPriority"));
                Assert.AreEqual(2500, stylesheet.Raw["Global/LetRingThroughoutPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/stretchFactor"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/stretchFactor"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/bendHeight"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/bendHeight"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/ChordDiagramPriority"));
                Assert.AreEqual(3000, stylesheet.Raw["Global/ChordDiagramPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/AlternateEndingPriority"));
                Assert.AreEqual(2800, stylesheet.Raw["Global/AlternateEndingPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/tieOffsetX"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/tieOffsetX"]).IsAlmostEqualTo(0.104999500f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/PalmMutePriority"));
                Assert.AreEqual(1200, stylesheet.Raw["Global/PalmMutePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/hideLyrics"));
                Assert.AreEqual(false, stylesheet.Raw["System/hideLyrics"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/drawArpeggioArrow"));
                Assert.AreEqual(true, stylesheet.Raw["Global/drawArpeggioArrow"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/HoPoPriority"));
                Assert.AreEqual(800, stylesheet.Raw["Global/HoPoPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/repeatWidth"));
                Assert.IsTrue(((float)stylesheet.Raw["Staff/repeatWidth"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/bracketWidth"));
                Assert.IsTrue(((float)stylesheet.Raw["System/bracketWidth"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TuningSpaceInFrontOfStaff"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/TuningSpaceInFrontOfStaff"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/drawWholeRestOnEmptyBars"));
                Assert.AreEqual(false, stylesheet.Raw["StandardNotation/drawWholeRestOnEmptyBars"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/miniBrowserPosition"));
                Assert.AreEqual(0, stylesheet.Raw["Global/miniBrowserPosition"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/hideUselessRests"));
                Assert.AreEqual(true, stylesheet.Raw["StandardNotation/hideUselessRests"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/SpacingAffectFontsSize"));
                Assert.AreEqual(true, stylesheet.Raw["Global/SpacingAffectFontsSize"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/drawEvenCopyright"));
                Assert.AreEqual(true, stylesheet.Raw["Even/drawEvenCopyright"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/RepeatTargetPriority"));
                Assert.AreEqual(3300, stylesheet.Raw["Global/RepeatTargetPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/SVGFont"));
                Assert.AreEqual(":/renderer/resources/notes.svg", stylesheet.Raw["Global/SVGFont"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Footer/PageNumberAlignment"));
                Assert.AreEqual(2, stylesheet.Raw["Footer/PageNumberAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/graceFlatScaleFactor"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/graceFlatScaleFactor"]).IsAlmostEqualTo(0.833328200f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/shadowColorEnd"));
                Assert.AreEqual(90, ((Color)stylesheet.Raw["Global/shadowColorEnd"]).R);
                Assert.AreEqual(90, ((Color)stylesheet.Raw["Global/shadowColorEnd"]).G);
                Assert.AreEqual(90, ((Color)stylesheet.Raw["Global/shadowColorEnd"]).B);
                Assert.AreEqual(10, ((Color)stylesheet.Raw["Global/shadowColorEnd"]).A);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/EvenCopyright"));
                Assert.AreEqual("%COPYRIGHT%", stylesheet.Raw["Even/EvenCopyright"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/GolpePriority"));
                Assert.AreEqual(350, stylesheet.Raw["Global/GolpePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/spaceSizeMM"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/spaceSizeMM"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/drawSecondNoteTrill"));
                Assert.AreEqual(true, stylesheet.Raw["TablatureNotation/drawSecondNoteTrill"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/insertSize"));
                Assert.AreEqual(2, stylesheet.Raw["System/insertSize"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/minimalInformationForHarmonic"));
                Assert.AreEqual(true, stylesheet.Raw["TablatureNotation/minimalInformationForHarmonic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("PageSetup/pageTopMargin"));
                Assert.IsTrue(((float)stylesheet.Raw["PageSetup/pageTopMargin"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/augmentationDotRadius"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/augmentationDotRadius"]).IsAlmostEqualTo(0.125000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/drawOddCopyright"));
                Assert.AreEqual(false, stylesheet.Raw["Odd/drawOddCopyright"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/forceRhythmicBand"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/forceRhythmicBand"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/codaSplit"));
                Assert.AreEqual(true, stylesheet.Raw["System/codaSplit"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/tieMaxHeight"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/tieMaxHeight"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/WordsAndMusicAlignment"));
                Assert.AreEqual(2, stylesheet.Raw["Header/WordsAndMusicAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/drawEvenFooter"));
                Assert.AreEqual(true, stylesheet.Raw["Even/drawEvenFooter"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/rightFingeringPositionSN"));
                Assert.AreEqual(1, stylesheet.Raw["StandardNotation/rightFingeringPositionSN"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/bracketCurveHeight"));
                Assert.IsTrue(((float)stylesheet.Raw["System/bracketCurveHeight"]).IsAlmostEqualTo(1.600006000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/FreeTimePriority"));
                Assert.AreEqual(2700, stylesheet.Raw["Global/FreeTimePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/ChordSpacingMillimeter"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/ChordSpacingMillimeter"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/drawAlbum"));
                Assert.AreEqual(true, stylesheet.Raw["Header/drawAlbum"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/trackNameModeMulti"));
                Assert.AreEqual(1, stylesheet.Raw["System/trackNameModeMulti"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/insertSizeSameTrack"));
                Assert.AreEqual(1, stylesheet.Raw["System/insertSizeSameTrack"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/marginMinimalBeforeFirstNote"));
                Assert.IsTrue(((float)stylesheet.Raw["System/marginMinimalBeforeFirstNote"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Subtitle"));
                Assert.AreEqual("%SUBTITLE%", stylesheet.Raw["Header/Subtitle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/alphaSuggested"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/alphaSuggested"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/EvenHeaderAlignment"));
                Assert.AreEqual(0, stylesheet.Raw["Even/EvenHeaderAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TechniqueSymbol"));
                Assert.AreEqual(25, stylesheet.Raw["Global/TechniqueSymbol"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/tuningBoxed"));
                Assert.AreEqual(false, stylesheet.Raw["Global/tuningBoxed"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/drawBends"));
                Assert.AreEqual(true, stylesheet.Raw["StandardNotation/drawBends"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/mouseClickMaxTime"));
                Assert.AreEqual(200, stylesheet.Raw["Global/mouseClickMaxTime"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/graceSharpScaleFactor"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/graceSharpScaleFactor"]).IsAlmostEqualTo(1.333344000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/GrayedOpacity"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/GrayedOpacity"]).IsAlmostEqualTo(0.400001500f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/WhammyBarVibratoPriority"));
                Assert.AreEqual(1400, stylesheet.Raw["Global/WhammyBarVibratoPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/noStaffLineForSlashs"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/noStaffLineForSlashs"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/forceHorizontalBeam"));
                Assert.AreEqual(false, stylesheet.Raw["StandardNotation/forceHorizontalBeam"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/drawTimeSignatureC"));
                Assert.AreEqual(false, stylesheet.Raw["Staff/drawTimeSignatureC"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/colorizeFretNumberInTablature"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/colorizeFretNumberInTablature"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/OddHeaderAlignment"));
                Assert.AreEqual(2, stylesheet.Raw["Odd/OddHeaderAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/tabRhythmPlacementVoice1"));
                Assert.AreEqual(1, stylesheet.Raw["TablatureNotation/tabRhythmPlacementVoice1"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/drawTitle"));
                Assert.AreEqual(true, stylesheet.Raw["Header/drawTitle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Words"));
                Assert.AreEqual("Words by %WORDS%", stylesheet.Raw["Header/Words"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/MusicAlignment"));
                Assert.AreEqual(2, stylesheet.Raw["Header/MusicAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/OctavePriority"));
                Assert.AreEqual(1800, stylesheet.Raw["Global/OctavePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/deadNoteLetter"));
                Assert.AreEqual(88, stylesheet.Raw["TablatureNotation/deadNoteLetter"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/EvenCopyrightAlignment"));
                Assert.AreEqual(1, stylesheet.Raw["Even/EvenCopyrightAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/OddCopyrightAlignment"));
                Assert.AreEqual(1, stylesheet.Raw["Odd/OddCopyrightAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/BeamsInsideStaff"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/BeamsInsideStaff"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/showTrackNameMulti"));
                Assert.AreEqual(true, stylesheet.Raw["System/showTrackNameMulti"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/renderingStyleMode"));
                Assert.AreEqual(0, stylesheet.Raw["Global/renderingStyleMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/LyricPriority"));
                Assert.AreEqual(2450, stylesheet.Raw["Global/LyricPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/widgetWaitTime"));
                Assert.AreEqual(750, stylesheet.Raw["Global/widgetWaitTime"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("PageSetup/pageOrientation"));
                Assert.AreEqual(0, stylesheet.Raw["PageSetup/pageOrientation"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/bracketExtendMode"));
                Assert.AreEqual(0, stylesheet.Raw["System/bracketExtendMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/EvenFooter"));
                Assert.AreEqual("%PAGE%/%PAGES%", stylesheet.Raw["Even/EvenFooter"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/stemLineWidth"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/stemLineWidth"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/CapoPriority"));
                Assert.AreEqual(2600, stylesheet.Raw["Global/CapoPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/backgroundColor"));
                Assert.AreEqual(99, ((Color)stylesheet.Raw["Global/backgroundColor"]).R);
                Assert.AreEqual(104, ((Color)stylesheet.Raw["Global/backgroundColor"]).G);
                Assert.AreEqual(101, ((Color)stylesheet.Raw["Global/backgroundColor"]).B);
                Assert.AreEqual(255, ((Color)stylesheet.Raw["Global/backgroundColor"]).A);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/drawLyricsUpside"));
                Assert.AreEqual(false, stylesheet.Raw["System/drawLyricsUpside"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Tabber"));
                Assert.AreEqual("Tabbed by %TABBER%", stylesheet.Raw["Header/Tabber"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/EvenCopyright2"));
                Assert.AreEqual("All Rights Reserved - International Copyright Secured", stylesheet.Raw["Even/EvenCopyright2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/strictOrDirectedIsSystemWide"));
                Assert.AreEqual(false, stylesheet.Raw["System/strictOrDirectedIsSystemWide"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/OddCopyright2"));
                Assert.AreEqual("All Rights Reserved - International Copyright Secured", stylesheet.Raw["Odd/OddCopyright2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/tieWeight"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/tieWeight"]).IsAlmostEqualTo(0.174999200f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/fingeringMode"));
                Assert.AreEqual(0, stylesheet.Raw["Staff/fingeringMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/horizontalTrackNameOnFirstSystem"));
                Assert.AreEqual(false, stylesheet.Raw["System/horizontalTrackNameOnFirstSystem"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/chordMode"));
                Assert.AreEqual(0, stylesheet.Raw["Global/chordMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/firstSystemMarginMillimeter"));
                Assert.AreEqual(0, stylesheet.Raw["Global/firstSystemMarginMillimeter"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/drawChordInScore"));
                Assert.AreEqual(false, stylesheet.Raw["System/drawChordInScore"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/slashStemDown"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/slashStemDown"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/stemMinYDeviation"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/stemMinYDeviation"]).IsAlmostEqualTo(0.699996900f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/AlbumAlignment"));
                Assert.AreEqual(1, stylesheet.Raw["Header/AlbumAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/ledgerLineSize"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/ledgerLineSize"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/cursorInsertSize"));
                Assert.AreEqual(2, stylesheet.Raw["Global/cursorInsertSize"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Footer/drawCopyright2"));
                Assert.AreEqual(true, stylesheet.Raw["Footer/drawCopyright2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/placementMargin"));
                Assert.AreEqual(40, stylesheet.Raw["Global/placementMargin"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Title"));
                Assert.AreEqual("%TITLE%", stylesheet.Raw["Header/Title"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/BarNumberStyle"));
                Assert.AreEqual(0, stylesheet.Raw["Global/BarNumberStyle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/OddCopyright"));
                Assert.AreEqual("%COPYRIGHT%", stylesheet.Raw["Odd/OddCopyright"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/leftFingeringPositionTAB"));
                Assert.AreEqual(1, stylesheet.Raw["TablatureNotation/leftFingeringPositionTAB"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/accidentalSpaceAfter"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/accidentalSpaceAfter"]).IsAlmostEqualTo(0.400001500f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/WhammyBarPriority"));
                Assert.AreEqual(2300, stylesheet.Raw["Global/WhammyBarPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/showTrackNameSingle"));
                Assert.AreEqual(true, stylesheet.Raw["System/showTrackNameSingle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/rightFingeringPositionTAB"));
                Assert.AreEqual(0, stylesheet.Raw["TablatureNotation/rightFingeringPositionTAB"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/WahPriority"));
                Assert.AreEqual(600, stylesheet.Raw["Global/WahPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/tabRhythmPlacementVoice4"));
                Assert.AreEqual(2, stylesheet.Raw["TablatureNotation/tabRhythmPlacementVoice4"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/stemSecondariesSpace"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/stemSecondariesSpace"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TempoPriority"));
                Assert.AreEqual(3600, stylesheet.Raw["Global/TempoPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("PageSetup/pageRightMargin"));
                Assert.IsTrue(((float)stylesheet.Raw["PageSetup/pageRightMargin"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/flagsSpacing"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/flagsSpacing"]).IsAlmostEqualTo(1.600006000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/horizontalTrackNameOnOtherSystems"));
                Assert.AreEqual(true, stylesheet.Raw["System/horizontalTrackNameOnOtherSystems"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TripletFeelPriority"));
                Assert.AreEqual(3500, stylesheet.Raw["Global/TripletFeelPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/alignNotes"));
                Assert.AreEqual(true, stylesheet.Raw["StandardNotation/alignNotes"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("PageSetup/pagePortraitWidth"));
                Assert.IsTrue(((float)stylesheet.Raw["PageSetup/pagePortraitWidth"]).IsAlmostEqualTo(128.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/shortTrackNameOnFirstSystem"));
                Assert.AreEqual(true, stylesheet.Raw["System/shortTrackNameOnFirstSystem"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/circleAroundHalfAndWhole"));
                Assert.AreEqual(true, stylesheet.Raw["TablatureNotation/circleAroundHalfAndWhole"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/stemLineSize"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/stemLineSize"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/forceHorizontalBeamForDrums"));
                Assert.AreEqual(true, stylesheet.Raw["StandardNotation/forceHorizontalBeamForDrums"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("PageSetup/pagePortraitHeight"));
                Assert.IsTrue(((float)stylesheet.Raw["PageSetup/pagePortraitHeight"]).IsAlmostEqualTo(256.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/FermataPriority"));
                Assert.AreEqual(2400, stylesheet.Raw["Global/FermataPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/drawEvenCopyright2"));
                Assert.AreEqual(true, stylesheet.Raw["Even/drawEvenCopyright2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/SlapPopPriority"));
                Assert.AreEqual(1700, stylesheet.Raw["Global/SlapPopPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/drawSubtitle"));
                Assert.AreEqual(true, stylesheet.Raw["Header/drawSubtitle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/AccentPriority"));
                Assert.AreEqual(100, stylesheet.Raw["Global/AccentPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Slash/displayFretStringOfSingleNotesInSlash"));
                Assert.AreEqual(false, stylesheet.Raw["Slash/displayFretStringOfSingleNotesInSlash"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/enable"));
                Assert.AreEqual(false, stylesheet.Raw["Even/enable"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/tupletMode"));
                Assert.AreEqual(0, stylesheet.Raw["Staff/tupletMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/accidentalSpaceBefore"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/accidentalSpaceBefore"]).IsAlmostEqualTo(0.300003100f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/pageColor"));
                Assert.AreEqual(245, ((Color)stylesheet.Raw["Global/pageColor"]).R);
                Assert.AreEqual(245, ((Color)stylesheet.Raw["Global/pageColor"]).G);
                Assert.AreEqual(245, ((Color)stylesheet.Raw["Global/pageColor"]).B);
                Assert.AreEqual(255, ((Color)stylesheet.Raw["Global/pageColor"]).A);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/drawOddHeader"));
                Assert.AreEqual(false, stylesheet.Raw["Odd/drawOddHeader"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/showTupletDenominator"));
                Assert.AreEqual(false, stylesheet.Raw["Staff/showTupletDenominator"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/TabberAlignment"));
                Assert.AreEqual(2, stylesheet.Raw["Header/TabberAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("PageSetup/pageScale"));
                Assert.IsTrue(((float)stylesheet.Raw["PageSetup/pageScale"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/SoundbankChangePriority"));
                Assert.AreEqual(3250, stylesheet.Raw["Global/SoundbankChangePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/shadowColorBegin"));
                Assert.AreEqual(0, ((Color)stylesheet.Raw["Global/shadowColorBegin"]).R);
                Assert.AreEqual(0, ((Color)stylesheet.Raw["Global/shadowColorBegin"]).G);
                Assert.AreEqual(0, ((Color)stylesheet.Raw["Global/shadowColorBegin"]).B);
                Assert.AreEqual(255, ((Color)stylesheet.Raw["Global/shadowColorBegin"]).A);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/ArtistAlignment"));
                Assert.AreEqual(1, stylesheet.Raw["Header/ArtistAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Footer/Copyright"));
                Assert.AreEqual("%COPYRIGHT%", stylesheet.Raw["Footer/Copyright"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/marginAfterLastNote"));
                Assert.IsTrue(((float)stylesheet.Raw["System/marginAfterLastNote"]).IsAlmostEqualTo(0.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/OddFooter"));
                Assert.AreEqual("%PAGE%/%PAGES%", stylesheet.Raw["Odd/OddFooter"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/drawWords"));
                Assert.AreEqual(true, stylesheet.Raw["Header/drawWords"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/useSystemSignSeparator"));
                Assert.AreEqual(false, stylesheet.Raw["Global/useSystemSignSeparator"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/leftFingeringPositionSN"));
                Assert.AreEqual(1, stylesheet.Raw["StandardNotation/leftFingeringPositionSN"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/ChordSizeMillimeter"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/ChordSizeMillimeter"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/LeftHandTapPriority"));
                Assert.AreEqual(1650, stylesheet.Raw["Global/LeftHandTapPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/staffLinesColor"));
                Assert.AreEqual(180, ((Color)stylesheet.Raw["Staff/staffLinesColor"]).R);
                Assert.AreEqual(180, ((Color)stylesheet.Raw["Staff/staffLinesColor"]).G);
                Assert.AreEqual(180, ((Color)stylesheet.Raw["Staff/staffLinesColor"]).B);
                Assert.AreEqual(255, ((Color)stylesheet.Raw["Staff/staffLinesColor"]).A);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Footer/PageNumber"));
                Assert.AreEqual("%PAGE%/%PAGES%", stylesheet.Raw["Footer/PageNumber"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/LeftFingeringPriority"));
                Assert.AreEqual(175, stylesheet.Raw["Global/LeftFingeringPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/extendRhythmicInTablature"));
                Assert.AreEqual(true, stylesheet.Raw["TablatureNotation/extendRhythmicInTablature"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TuningSpacingMillimeter"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/TuningSpacingMillimeter"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/ShowBeamsForRest"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/ShowBeamsForRest"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/drawWordsAndMusic"));
                Assert.AreEqual(true, stylesheet.Raw["Header/drawWordsAndMusic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/unselectedVoiceOpacity"));
                Assert.IsTrue(((float)stylesheet.Raw["TablatureNotation/unselectedVoiceOpacity"]).IsAlmostEqualTo(0.400001500f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/HairpinPriority"));
                Assert.AreEqual(400, stylesheet.Raw["Global/HairpinPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/SlashFretStringPriority"));
                Assert.AreEqual(3050, stylesheet.Raw["Global/SlashFretStringPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/drawTabber"));
                Assert.AreEqual(false, stylesheet.Raw["Header/drawTabber"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/debugger"));
                Assert.AreEqual(false, stylesheet.Raw["Global/debugger"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/bendMinimalWidth"));
                Assert.IsTrue(((float)stylesheet.Raw["System/bendMinimalWidth"]).IsAlmostEqualTo(0.100000400f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/stemLineSizeMinimum"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/stemLineSizeMinimum"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/noBarLineForSlashs"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/noBarLineForSlashs"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/sameSizeForAllBars"));
                Assert.AreEqual(false, stylesheet.Raw["System/sameSizeForAllBars"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/hideGlobalTempo"));
                Assert.AreEqual(false, stylesheet.Raw["Global/hideGlobalTempo"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/bracketCurveWidth"));
                Assert.IsTrue(((float)stylesheet.Raw["System/bracketCurveWidth"]).IsAlmostEqualTo(6.400024000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/DisplayTuning"));
                Assert.AreEqual(true, stylesheet.Raw["Global/DisplayTuning"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TimerPriority"));
                Assert.AreEqual(3100, stylesheet.Raw["Global/TimerPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/GuitarStringNumberPriority"));
                Assert.AreEqual(700, stylesheet.Raw["Global/GuitarStringNumberPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/cursorMultipleSelectionBorderColor"));
                Assert.AreEqual(169, ((Color)stylesheet.Raw["Global/cursorMultipleSelectionBorderColor"]).R);
                Assert.AreEqual(179, ((Color)stylesheet.Raw["Global/cursorMultipleSelectionBorderColor"]).G);
                Assert.AreEqual(141, ((Color)stylesheet.Raw["Global/cursorMultipleSelectionBorderColor"]).B);
                Assert.AreEqual(255, ((Color)stylesheet.Raw["Global/cursorMultipleSelectionBorderColor"]).A);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/LeftHandVibratoPriority"));
                Assert.AreEqual(1500, stylesheet.Raw["Global/LeftHandVibratoPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/FreeTextPriority"));
                Assert.AreEqual(3200, stylesheet.Raw["Global/FreeTextPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/tieOffsetY"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/tieOffsetY"]).IsAlmostEqualTo(0.125000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/drawOddCopyright2"));
                Assert.AreEqual(true, stylesheet.Raw["Odd/drawOddCopyright2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/stemMaxYDeviation"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/stemMaxYDeviation"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/trackNameModeSingle"));
                Assert.AreEqual(0, stylesheet.Raw["System/trackNameModeSingle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TrillPriority"));
                Assert.AreEqual(1900, stylesheet.Raw["Global/TrillPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/barLinesColor"));
                Assert.AreEqual(100, ((Color)stylesheet.Raw["Staff/barLinesColor"]).R);
                Assert.AreEqual(100, ((Color)stylesheet.Raw["Staff/barLinesColor"]).G);
                Assert.AreEqual(100, ((Color)stylesheet.Raw["Staff/barLinesColor"]).B);
                Assert.AreEqual(255, ((Color)stylesheet.Raw["Staff/barLinesColor"]).A);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/OrnamentPriority"));
                Assert.AreEqual(2100, stylesheet.Raw["Global/OrnamentPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/bracketBetweenNSAndTab"));
                Assert.AreEqual(true, stylesheet.Raw["System/bracketBetweenNSAndTab"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Footer/Copyright2"));
                Assert.AreEqual("All Rights Reserved - International Copyright Secured", stylesheet.Raw["Footer/Copyright2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/SectionPriority"));
                Assert.AreEqual(3400, stylesheet.Raw["Global/SectionPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/tieMinHeight"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/tieMinHeight"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/translateTunings"));
                Assert.AreEqual(false, stylesheet.Raw["Global/translateTunings"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/RightFingeringPriority"));
                Assert.AreEqual(150, stylesheet.Raw["Global/RightFingeringPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/accidentalIntersSpacing"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/accidentalIntersSpacing"]).IsAlmostEqualTo(0.026249890f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/RepeatCountPriority"));
                Assert.AreEqual(300, stylesheet.Raw["Global/RepeatCountPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/repeatSpace"));
                Assert.IsTrue(((float)stylesheet.Raw["Staff/repeatSpace"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TapPriority"));
                Assert.AreEqual(1600, stylesheet.Raw["Global/TapPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/LetRingPriority"));
                Assert.AreEqual(1250, stylesheet.Raw["Global/LetRingPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Album"));
                Assert.AreEqual("%ALBUM%", stylesheet.Raw["Header/Album"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/marginBeforeFirstNote"));
                Assert.IsTrue(((float)stylesheet.Raw["System/marginBeforeFirstNote"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/tieHeightExpansion"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/tieHeightExpansion"]).IsAlmostEqualTo(0.125000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TuningPosition"));
                Assert.AreEqual(0, stylesheet.Raw["Global/TuningPosition"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/shortTrackNameOnOtherSystems"));
                Assert.AreEqual(true, stylesheet.Raw["System/shortTrackNameOnOtherSystems"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/forceBarCountBySystem"));
                Assert.AreEqual(false, stylesheet.Raw["Global/forceBarCountBySystem"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/barIndexDrawType"));
                Assert.AreEqual(0, stylesheet.Raw["System/barIndexDrawType"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/ChordMarginMillimeter"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/ChordMarginMillimeter"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/showCapoRelative"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/showCapoRelative"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/OddFooterAlignment"));
                Assert.AreEqual(2, stylesheet.Raw["Odd/OddFooterAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/DynamicPriority"));
                Assert.AreEqual(200, stylesheet.Raw["Global/DynamicPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/stemPartialSecondarySize"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/stemPartialSecondarySize"]).IsAlmostEqualTo(0.699996900f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/widgetTransitionTime"));
                Assert.AreEqual(500, stylesheet.Raw["Global/widgetTransitionTime"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/inScoreChordSize"));
                Assert.IsTrue(((float)stylesheet.Raw["System/inScoreChordSize"]).IsAlmostEqualTo(11.199950000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/hideMultipleTiedNotes"));
                Assert.AreEqual(false, stylesheet.Raw["Staff/hideMultipleTiedNotes"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/beamLineWidth"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/beamLineWidth"]).IsAlmostEqualTo(0.400001500f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/textTransitionTime"));
                Assert.AreEqual(500, stylesheet.Raw["Global/textTransitionTime"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/displayBeamsOnRestInTablature"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/displayBeamsOnRestInTablature"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/BarrePriority"));
                Assert.AreEqual(2900, stylesheet.Raw["Global/BarrePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/FadePriority"));
                Assert.AreEqual(1300, stylesheet.Raw["Global/FadePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/TitleAlignment"));
                Assert.AreEqual(1, stylesheet.Raw["Header/TitleAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/EvenHeader"));
                Assert.AreEqual("%TITLE% by %ARTIST%", stylesheet.Raw["Even/EvenHeader"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/tabRhythmPlacementVoice2"));
                Assert.AreEqual(1, stylesheet.Raw["TablatureNotation/tabRhythmPlacementVoice2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/stemLineSizeMaximum"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/stemLineSizeMaximum"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/showClefAtEachSystemStart"));
                Assert.AreEqual(true, stylesheet.Raw["Global/showClefAtEachSystemStart"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/drawArtist"));
                Assert.AreEqual(true, stylesheet.Raw["Header/drawArtist"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TuningMarginMillimeter"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/TuningMarginMillimeter"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/drawMusic"));
                Assert.AreEqual(true, stylesheet.Raw["Header/drawMusic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/maxBendExpansionFactor"));
                Assert.IsTrue(((float)stylesheet.Raw["TablatureNotation/maxBendExpansionFactor"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/spaceSizePixel"));
                Assert.AreEqual(5, stylesheet.Raw["Global/spaceSizePixel"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/leftFingeringMode"));
                Assert.AreEqual(0, stylesheet.Raw["Staff/leftFingeringMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TuningColumnCount"));
                Assert.AreEqual(2, stylesheet.Raw["Global/TuningColumnCount"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("PageSetup/pageBottomMargin"));
                Assert.IsTrue(((float)stylesheet.Raw["PageSetup/pageBottomMargin"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/showTiedNotesLikeGhostNotes"));
                Assert.AreEqual(false, stylesheet.Raw["TablatureNotation/showTiedNotesLikeGhostNotes"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/noteHeadColor"));
                Assert.AreEqual(false, stylesheet.Raw["StandardNotation/noteHeadColor"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/barCountBySystem"));
                Assert.AreEqual(0, stylesheet.Raw["Global/barCountBySystem"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/SlidePriority"));
                Assert.AreEqual(850, stylesheet.Raw["Global/SlidePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Music"));
                Assert.AreEqual("Music by %MUSIC%", stylesheet.Raw["Header/Music"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Footer/drawCopyright"));
                Assert.AreEqual(true, stylesheet.Raw["Footer/drawCopyright"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TuningDisplayMode"));
                Assert.AreEqual(2, stylesheet.Raw["Global/TuningDisplayMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/PickScrapePriority"));
                Assert.AreEqual(875, stylesheet.Raw["Global/PickScrapePriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/allowMultirests"));
                Assert.AreEqual(true, stylesheet.Raw["Global/allowMultirests"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("PageSetup/pageLeftMargin"));
                Assert.IsTrue(((float)stylesheet.Raw["PageSetup/pageLeftMargin"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Artist"));
                Assert.AreEqual("%ARTIST%", stylesheet.Raw["Header/Artist"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/hopoMode"));
                Assert.AreEqual(1, stylesheet.Raw["Staff/hopoMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/drawEvenHeader"));
                Assert.AreEqual(true, stylesheet.Raw["Even/drawEvenHeader"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/TuningMode"));
                Assert.AreEqual(4, stylesheet.Raw["Global/TuningMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/hideDynamics"));
                Assert.AreEqual(false, stylesheet.Raw["StandardNotation/hideDynamics"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/RasgueadoPriority"));
                Assert.AreEqual(2000, stylesheet.Raw["Global/RasgueadoPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/graceNoteScaleFactor"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/graceNoteScaleFactor"]).IsAlmostEqualTo(0.899993900f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/cursorMultipleSelectionInnerColor"));
                Assert.AreEqual(116, ((Color)stylesheet.Raw["Global/cursorMultipleSelectionInnerColor"]).R);
                Assert.AreEqual(117, ((Color)stylesheet.Raw["Global/cursorMultipleSelectionInnerColor"]).G);
                Assert.AreEqual(112, ((Color)stylesheet.Raw["Global/cursorMultipleSelectionInnerColor"]).B);
                Assert.AreEqual(50, ((Color)stylesheet.Raw["Global/cursorMultipleSelectionInnerColor"]).A);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/tieCurve"));
                Assert.IsTrue(((float)stylesheet.Raw["StandardNotation/tieCurve"]).IsAlmostEqualTo(0.125000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("StandardNotation/translatedTuningImpactNotation"));
                Assert.AreEqual(true, stylesheet.Raw["StandardNotation/translatedTuningImpactNotation"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/RepeatJumpPriority"));
                Assert.AreEqual(3300, stylesheet.Raw["Global/RepeatJumpPriority"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/SubtitleAlignment"));
                Assert.AreEqual(1, stylesheet.Raw["Header/SubtitleAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Even/EvenFooterAlignment"));
                Assert.AreEqual(0, stylesheet.Raw["Even/EvenFooterAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/WordsAlignment"));
                Assert.AreEqual(0, stylesheet.Raw["Header/WordsAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/drawSlOnSlides"));
                Assert.AreEqual(true, stylesheet.Raw["Staff/drawSlOnSlides"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/ExtendedBarLines"));
                Assert.AreEqual(false, stylesheet.Raw["System/ExtendedBarLines"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Footer/drawPageNumber"));
                Assert.AreEqual(true, stylesheet.Raw["Footer/drawPageNumber"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Odd/OddHeader"));
                Assert.AreEqual("%TITLE% by %ARTIST%", stylesheet.Raw["Odd/OddHeader"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/fontSizeAdjustment"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/fontSizeAdjustment"]).IsAlmostEqualTo(0.419998200f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Footer/CopyrightAlignment"));
                Assert.AreEqual(1, stylesheet.Raw["Footer/CopyrightAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/rhythmPower"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/rhythmPower"]).IsAlmostEqualTo(0.500000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Lyric/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Lyric/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Album/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Album/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/VerticalTrackName/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/VerticalTrackName/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionText/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/DirectionText/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/showTrackNameOnFirstSystem"));
                Assert.AreEqual(true, stylesheet.Raw["System/showTrackNameOnFirstSystem"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawWords"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawWords"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fingerings/italic"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Fingerings/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuplet/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tuplet/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/LetRing/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/LetRing/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/TrackShortName/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/TrackShortName/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Title/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Title/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PalmMute/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/PalmMute/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Big/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Big/size"]).IsAlmostEqualTo(3.600037000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HorizontalTrackName/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/HorizontalTrackName/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenCopyright/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenCopyright/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AutoLetRing/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/AutoLetRing/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SmallFret/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/SmallFret/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slide/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Slide/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionText/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/DirectionText/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenFooter/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenFooter/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Barre/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Barre/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Chord/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Chord/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fingerings/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/Fingerings/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Copyright1Alignment"));
                Assert.AreEqual(1, stylesheet.Raw["Header/Copyright1Alignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BarIndex/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/BarIndex/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuplet/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/Tuplet/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright1/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright1/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fret/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Fret/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretString/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SlashFretString/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/LetRing/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/LetRing/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Album/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Album/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Normal/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/Normal/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Subtitle/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Subtitle/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuning/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Tuning/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright1/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Copyright1/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Album/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Album/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright2/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright2/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionText/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/DirectionText/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/WordsAndMusic/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/WordsAndMusic/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddFooter/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddFooter/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Multirest/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Multirest/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PageNumber/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/PageNumber/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawCopyright1"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawCopyright1"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tabber/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tabber/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tiny/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Tiny/size"]).IsAlmostEqualTo(2.799988000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuning/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tuning/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Timer/border"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Timer/border"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BarIndex/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/BarIndex/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Title/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Title/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionGlyph/proportionnal"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/DirectionGlyph/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright2/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright2/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tiny/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tiny/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tempo/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Tempo/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Big/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Big/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Chord/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Chord/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PageNumber/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/PageNumber/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BarIndex/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/BarIndex/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretString/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/SlashFretString/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HarmonicText/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/HarmonicText/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fret/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Fret/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Chord/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Chord/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Section/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Section/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenFooter/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/EvenFooter/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddFooter/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddFooter/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SmallFret/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/SmallFret/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/TrackShortName/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/TrackShortName/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PalmMute/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/PalmMute/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tempo/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tempo/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Artist/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Artist/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Album/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Album/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeTime/italic"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/FreeTime/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuning/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tuning/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Lyric/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Lyric/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PalmMute/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/PalmMute/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/TrackName/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/TrackName/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddHeader/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddHeader/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Music/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Music/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/RepeatBarCount/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/RepeatBarCount/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Copyright2"));
                Assert.AreEqual("%COPYRIGHT2%", stylesheet.Raw["Header/Copyright2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BigBold/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/BigBold/size"]).IsAlmostEqualTo(14.400150000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Capo/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Capo/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawCopyright2"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawCopyright2"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slide/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Slide/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuning/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tuning/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Copyright/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenHeader/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/EvenHeader/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HarmonicText/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/HarmonicText/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Capo/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Capo/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slide/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/Slide/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BarIndex/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/BarIndex/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenHeader/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenHeader/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tempo/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tempo/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddHeader/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddHeader/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Section/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Section/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright2/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright2/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/WordsAndMusic/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/WordsAndMusic/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Small/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/Small/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Words/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Words/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Barre/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Barre/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/cursorMultilpeSelectionMargin"));
                Assert.AreEqual(1, stylesheet.Raw["Global/cursorMultilpeSelectionMargin"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AutoLetRing/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/AutoLetRing/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fingerings/proportionnal"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Fingerings/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Rasgueado/italic"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Rasgueado/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Copyright2Alignment"));
                Assert.AreEqual(1, stylesheet.Raw["Header/Copyright2Alignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Music/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Music/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddCopyright/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddCopyright/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/bracketExtendByFamily"));
                Assert.AreEqual(false, stylesheet.Raw["System/bracketExtendByFamily"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tiny/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tiny/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Huge/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Huge/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Rasgueado/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/Rasgueado/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Words/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Words/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddCopyright/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddCopyright/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HoPo/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/HoPo/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretStringText/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SlashFretStringText/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SoundAutomation/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SoundAutomation/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SoundAutomation/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SoundAutomation/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/hideLyrics"));
                Assert.AreEqual(false, stylesheet.Raw["Staff/hideLyrics"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionGlyph/name"));
                Assert.AreEqual("@musicalFont()", stylesheet.Raw["Global/Font/DirectionGlyph/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fret/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Fret/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Capo/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Capo/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddHeader/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/OddHeader/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AlternateEnding/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/AlternateEnding/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Artist/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Artist/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BendsLabel/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/BendsLabel/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionGlyph/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/DirectionGlyph/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/LetRing/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/LetRing/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HarmonicText/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/HarmonicText/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SegmentLine/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/SegmentLine/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawAlbum"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawAlbum"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AlternateEnding/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/AlternateEnding/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Subtitle/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Subtitle/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/TrackName/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/TrackName/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/WordsAndMusic/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/WordsAndMusic/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("bracketExtendMode"));
                Assert.AreEqual(0, stylesheet.Raw["bracketExtendMode"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeText/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/FreeText/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Big/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Big/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/PageNumber"));
                Assert.AreEqual("%PAGE%/%PAGES%", stylesheet.Raw["Header/PageNumber"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Huge/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/Huge/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HoPo/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/HoPo/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddHeader/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddHeader/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HoPo/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/HoPo/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AlternateEnding/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/AlternateEnding/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BendsLabel/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/BendsLabel/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Music/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Music/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeText/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/FreeText/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Timer/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/Timer/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SoundAutomation/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/SoundAutomation/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Multirest/proportionnal"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Multirest/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/ignoreAccidentalsForPlacement"));
                Assert.AreEqual(true, stylesheet.Raw["System/ignoreAccidentalsForPlacement"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tiny/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/Tiny/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("TablatureNotation/invertFingeringPlacement"));
                Assert.AreEqual(true, stylesheet.Raw["TablatureNotation/invertFingeringPlacement"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Barre/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Barre/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SmallFret/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SmallFret/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeText/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/FreeText/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuplet/italic"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Tuplet/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Artist/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Artist/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SoundAutomation/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/SoundAutomation/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Words/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Words/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddFooter/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/OddFooter/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Barre/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Barre/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SegmentLine/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/SegmentLine/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Timer/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Timer/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/RepeatBarCount/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/RepeatBarCount/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tabber/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Tabber/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Small/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Small/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenFooter/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenFooter/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretString/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SlashFretString/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Multirest/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Multirest/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/WordsAndMusic/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/WordsAndMusic/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Rasgueado/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Rasgueado/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AutoLetRing/size"));
                Assert.AreEqual("8", stylesheet.Raw["Global/Font/AutoLetRing/size"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Normal/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Normal/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright2/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/Copyright2/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HarmonicText/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/HarmonicText/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/RepeatBarCount/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/RepeatBarCount/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("System/strictPlacementForMultivoices"));
                Assert.AreEqual(false, stylesheet.Raw["System/strictPlacementForMultivoices"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Multirest/name"));
                Assert.AreEqual("@musicalFont()", stylesheet.Raw["Global/Font/Multirest/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddFooter/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/OddFooter/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fingerings/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Fingerings/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fingerings/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Fingerings/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AutoLetRing/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/AutoLetRing/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slap/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Slap/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Music/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Music/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fret/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Fret/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Pop/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Pop/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/firstSystemMinimalMarginMillimeter"));
                Assert.AreEqual(20, stylesheet.Raw["Global/firstSystemMinimalMarginMillimeter"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Timer/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Timer/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tabber/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tabber/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Music/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Music/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AlternateEnding/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/AlternateEnding/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Pop/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Pop/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Huge/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Huge/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BigBold/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/BigBold/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/VerticalTrackName/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/VerticalTrackName/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddCopyright/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/OddCopyright/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenFooter/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenFooter/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/RepeatBarCount/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/RepeatBarCount/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SegmentLine/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SegmentLine/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenHeader/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/EvenHeader/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionGlyph/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/DirectionGlyph/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretString/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SlashFretString/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Chord/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Chord/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Chord/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Chord/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Words/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Words/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Subtitle/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Subtitle/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretStringText/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/SlashFretStringText/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HorizontalTrackName/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/HorizontalTrackName/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BigBold/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/BigBold/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tabber/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Tabber/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SmallFret/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SmallFret/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HorizontalTrackName/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/HorizontalTrackName/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenCopyright/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenCopyright/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeTime/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/FreeTime/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionGlyph/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/DirectionGlyph/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/Copyright1"));
                Assert.AreEqual("%COPYRIGHT1%", stylesheet.Raw["Header/Copyright1"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Huge/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Huge/size"]).IsAlmostEqualTo(19.199710000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenHeader/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenHeader/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawTabber"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawTabber"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawPageNumber"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawPageNumber"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slide/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Slide/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/VerticalTrackName/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/VerticalTrackName/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Lyric/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Lyric/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Fret/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/Fret/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawArtist"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawArtist"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/LetRing/italic"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/LetRing/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slap/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Slap/size"]).IsAlmostEqualTo(4.800049000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slide/italic"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Slide/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/RepeatBarCount/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/RepeatBarCount/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Rasgueado/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Rasgueado/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Section/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Section/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright2/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Copyright2/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawMusic"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawMusic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenCopyright/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/EvenCopyright/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tempo/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Tempo/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HorizontalTrackName/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/HorizontalTrackName/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/TrackName/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/TrackName/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SegmentLine/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SegmentLine/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeTime/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/FreeTime/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeText/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/FreeText/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeTime/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/FreeTime/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tempo/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Tempo/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HoPo/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/HoPo/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Normal/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Normal/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SegmentLine/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SegmentLine/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BendsLabel/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/BendsLabel/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionText/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/DirectionText/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PalmMute/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/PalmMute/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeTime/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/FreeTime/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HorizontalTrackName/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/HorizontalTrackName/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/PageNumberAlignment"));
                Assert.AreEqual(2, stylesheet.Raw["Header/PageNumberAlignment"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Pop/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Pop/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Words/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Words/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright1/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright1/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BendsLabel/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/BendsLabel/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Capo/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Capo/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddCopyright/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/OddCopyright/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Title/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Title/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/LetRing/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/LetRing/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tabber/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tabber/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Capo/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Capo/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Pop/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/Pop/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HoPo/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/HoPo/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenFooter/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/EvenFooter/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Subtitle/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Subtitle/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawSubtitle"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawSubtitle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/VerticalTrackName/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/VerticalTrackName/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/TrackShortName/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/TrackShortName/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuning/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Tuning/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Section/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Section/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Artist/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/Artist/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Section/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Section/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Normal/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Normal/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Barre/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Barre/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slap/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/Slap/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright1/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Copyright1/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Lyric/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Lyric/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PageNumber/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/PageNumber/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/DirectionText/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/DirectionText/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenCopyright/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenCopyright/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/HarmonicText/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/HarmonicText/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Subtitle/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Subtitle/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Big/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/Big/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PageNumber/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/PageNumber/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BigBold/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/BigBold/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddHeader/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/OddHeader/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddCopyright/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddCopyright/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Timer/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Timer/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Title/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Title/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Timer/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Timer/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PalmMute/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/PalmMute/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenCopyright/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/EvenCopyright/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/firstSystemMaximalMarginMillimeter"));
                Assert.AreEqual(100, stylesheet.Raw["Global/firstSystemMaximalMarginMillimeter"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AlternateEnding/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/AlternateEnding/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/AutoLetRing/italic"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/AutoLetRing/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Copyright/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuplet/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Tuplet/size"]).IsAlmostEqualTo(8.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Copyright1/name"));
                Assert.AreEqual("@musicalFontText()", stylesheet.Raw["Global/Font/Copyright1/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BarIndex/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/BarIndex/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Header/DrawTitle"));
                Assert.AreEqual(true, stylesheet.Raw["Header/DrawTitle"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Pop/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Pop/size"]).IsAlmostEqualTo(4.800049000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Small/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Small/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slap/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Slap/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretStringText/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SlashFretStringText/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Rasgueado/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Rasgueado/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/PageNumber/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/PageNumber/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Staff/drawLyricsUpside"));
                Assert.AreEqual(false, stylesheet.Raw["Staff/drawLyricsUpside"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/OddFooter/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/OddFooter/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretStringText/name"));
                Assert.AreEqual("Arial", stylesheet.Raw["Global/Font/SlashFretStringText/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SoundAutomation/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SoundAutomation/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Multirest/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Multirest/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Title/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Title/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/BendsLabel/proportionnal"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/BendsLabel/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/TrackName/bold"));
                Assert.AreEqual(true, stylesheet.Raw["Global/Font/TrackName/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Lyric/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Lyric/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Artist/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/Artist/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Tuplet/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Tuplet/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SmallFret/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SmallFret/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretString/name"));
                Assert.AreEqual("@musicalFont()", stylesheet.Raw["Global/Font/SlashFretString/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/VerticalTrackName/name"));
                Assert.AreEqual("Times New Roman", stylesheet.Raw["Global/Font/VerticalTrackName/name"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Album/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Album/italic"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Slap/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/Slap/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/Small/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/Small/size"]).IsAlmostEqualTo(4.799927000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/TrackShortName/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/TrackShortName/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/SlashFretStringText/bold"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/SlashFretStringText/bold"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/FreeText/size"));
                Assert.IsTrue(((float)stylesheet.Raw["Global/Font/FreeText/size"]).IsAlmostEqualTo(2.000000000f));

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/WordsAndMusic/proportionnal"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/WordsAndMusic/proportionnal"]);

                Assert.IsTrue(stylesheet.Raw.ContainsKey("Global/Font/EvenHeader/italic"));
                Assert.AreEqual(false, stylesheet.Raw["Global/Font/EvenHeader/italic"]);
            });
        }
    }
}
