using System;
using AlphaTab.Haxe.Js;
using AlphaTab.Haxe.Js.Html;
using AlphaTab.Platform;
using AlphaTab.Util;
using Phase;

namespace AlphaTab.Utils
{
    /// <summary>
    /// This small utility helps to detect whether a particular font is already loaded.
    /// </summary>
    internal class FontLoadingChecker
    {
        private readonly string _family;
        private readonly string _fallbackText;
        private bool _isStarted;
        public bool IsFontLoaded { get; set; }
        public event Action FontLoaded;

        private void OnFontLoaded()
        {
            var handler = FontLoaded;
            if (handler != null)
            {
                handler();
            }
        }

        public FontLoadingChecker(
            string family,
            string fallbackText = null)
        {
            _family = family;
            _fallbackText = fallbackText == null ? "BESbwy" : fallbackText;
        }

        public void CheckForFontAvailability()
        {
            var isWorker =
                Script.Write<bool>(
                    "untyped __js__(\"typeof(WorkerGlobalScope) !== 'undefined' && self instanceof WorkerGlobalScope\")");
            if (isWorker)
            {
                // no web fonts in web worker
                IsFontLoaded = false;
                return;
            }

            if (_isStarted)
            {
                return;
            }

            _isStarted = true;
            var failCounter = 0;
            var failCounterId = Browser.Window.SetInterval(new Action(() =>
            {
                failCounter++;
                Logger.Warning("Rendering",
                    "Could not load font '" + _family + "' within " + (failCounter * 5) + " seconds");
            }),
            5000);

            Logger.Debug("Font", "Start checking for font availablility: " + _family);
            var cssFontLoadingModuleSupported = Browser.Document.Fonts.IsTruthy() &&
                                                Browser.Document.Fonts.Member<object>("load").IsTruthy();
            if (cssFontLoadingModuleSupported)
            {
                Logger.Debug("Font", "[" + _family + "] Font API available");
                Action checkFont = null;
                checkFont = () =>
                {
                    Browser.Document.Fonts.Load("1em " + _family).Then(_ =>
                    {
                        Logger.Debug("Font", "[" + _family + "] Font API signaled loaded");
                        if (Browser.Document.Fonts.Check("1em " + _family))
                        {
                            Logger.Info("Rendering", "[" + _family + "] Font API signaled available");
                            IsFontLoaded = true;
                            Browser.Window.ClearInterval(failCounterId);
                            OnFontLoaded();
                        }
                        else
                        {
                            Logger.Debug("Font",
                                "[" + _family +
                                "] Font API loaded reported, but font not available, checking later again");
                            Browser.Window.SetTimeout((Action)(() =>
                                {
                                    checkFont();
                                }),
                                250);
                        }

                        return true;
                    });
                };
                checkFont();
            }
            else
            {
                Logger.Debug("Font", "[" + _family + "] Font API not available, using resize trick");
                // based on the idea of https://www.bramstein.com/writing/detecting-system-fonts-without-flash.html
                // simply create 3 elements with the 3 default font families and measure them
                // then change to the desired font and expect a change on the width

                Element sans = null;
                Element serif = null;
                Element monospace = null;

                var initialSansWidth = -1;
                var initialSerifWidth = -1;
                var initialMonospaceWidth = -1;

                Action checkFont = null;
                checkFont = () =>
                {
                    if (sans == null)
                    {
                        sans = CreateCheckerElement("sans-serif");
                        serif = CreateCheckerElement("serif");
                        monospace = CreateCheckerElement("monospace");

                        Browser.Document.Body.AppendChild(sans);
                        Browser.Document.Body.AppendChild(serif);
                        Browser.Document.Body.AppendChild(monospace);

                        initialSansWidth = sans.OffsetWidth;
                        initialSerifWidth = serif.OffsetWidth;
                        initialMonospaceWidth = monospace.OffsetWidth;

                        sans.Style.FontFamily = "'" + _family + "',sans-serif";
                        serif.Style.FontFamily = "'" + _family + "',serif";
                        monospace.Style.FontFamily = "'" + _family + "',monospace";


                    }

                    var sansWidth = sans.OffsetWidth;
                    var serifWidth = serif.OffsetWidth;
                    var monospaceWidth = monospace.OffsetWidth;

                    if ((sansWidth != initialSansWidth && serifWidth != initialSerifWidth) ||
                        (sansWidth != initialSansWidth && monospaceWidth != initialMonospaceWidth) ||
                        (serifWidth != initialSerifWidth && monospaceWidth != initialMonospaceWidth))
                    {
                        if (sansWidth == serifWidth || sansWidth == monospaceWidth || serifWidth == monospaceWidth)
                        {
                            Browser.Document.Body.RemoveChild(sans);
                            Browser.Document.Body.RemoveChild(serif);
                            Browser.Document.Body.RemoveChild(monospace);
                            IsFontLoaded = true;
                            Browser.Window.ClearInterval(failCounterId);
                            OnFontLoaded();
                        }
                        else
                        {
                            Browser.Window.SetTimeout(checkFont, 250);
                        }
                    }
                    else
                    {
                        Browser.Window.SetTimeout(checkFont, 250);
                    }
                };

                Browser.Window.AddEventListener("DOMContentLoaded",
                    (Action)(() =>
                    {
                        checkFont();
                    }));
            }
        }

        private Element CreateCheckerElement(string family)
        {
            var document = Browser.Document;
            var checkerElement = document.CreateElement("span");
            checkerElement.Style.Display = "inline-block";
            checkerElement.Style.Position = "absolute";
            checkerElement.Style.Overflow = "hidden";

            checkerElement.Style.Top = "-1000px";
            checkerElement.Style.FontSynthesis = "none";

            checkerElement.Style.FontSize = "100px";
            checkerElement.Style.FontFamily = family;
            checkerElement.InnerHTML = _fallbackText;

            document.Body.AppendChild(checkerElement);
            return checkerElement;
        }
    }
}
